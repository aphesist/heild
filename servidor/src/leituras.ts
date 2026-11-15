import { bytesToHex, geneseDasLeituras, hexToBytes, seloDoLote, type LeituraDoLote } from '@heild/dominio'
import type { Sessao } from './auth/sessao.ts'
import { config } from './config.ts'
import { noEscritorio, type Sql, type Tx } from './banco/pg.ts'

/**
 * Registro de leituras (`evento_leitura`; STACK 8, decisão P6): quem leu o quê, sem pôr uma
 * trava por leitura na cadeia do evento.
 *
 * - A leitura anota na memória e responde; o gravador junta por escritório e grava em lote
 *   (até `HEILD_LEITURA_LOTE`, padrão 500, ou a cada `HEILD_LEITURA_MS`, padrão 2 s), fora
 *   da transação da leitura.
 * - Cada lote é selado com o hash do lote anterior do mesmo escritório (`selo_leitura`),
 *   sob uma trava consultiva do escritório: dois processos não selam o mesmo número.
 * - Desligar a API grava o que estiver na memória (`descarregar`). Uma queda do processo
 *   perde no máximo o último intervalo (até 2 s): é o preço de não travar a leitura.
 */

export interface Leitura {
  ferramenta: string
  tabela?: string | null
  ids?: string[]
  quantidade: number
  filtros?: Record<string, unknown> | null
}

interface Pendente extends LeituraDoLote {
  lido_em: string
  ator_tipo: string
  ator_id: string | null
  sessao_auth_id: string | null
  ferramenta: string
  tabela: string | null
  ids: string[]
  quantidade: number
  filtros: Record<string, unknown> | null
}

/** Até 200 ids por leitura (a lista é a prova de quais linhas; mais do que isso vai pela contagem e pelos filtros). */
const MAX_IDS = 200

export class RegistroLeituras {
  private fila = new Map<string, Pendente[]>()
  private relogio: ReturnType<typeof setInterval> | null = null
  private gravando: Promise<void> = Promise.resolve()

  constructor(private sql: Sql) {}

  iniciar() {
    if (this.relogio) return
    this.relogio = setInterval(() => void this.descarregar().catch((e) => console.error('[heild] registro de leituras não gravou:', e)), config.leituraMs)
    this.relogio.unref()
  }

  registrar(sessao: Pick<Sessao, 'claims' | 'ctx'>, l: Leitura) {
    const a = sessao.ctx.ator
    const p: Pendente = {
      lido_em: new Date().toISOString(),
      ator_tipo: a.tipo,
      ator_id: a.tipo === 'pessoa' ? a.perfil.usuario_id : a.tipo === 'integrante' ? a.id : a.tipo === 'pessoa_cliente' ? (a.cliente_id ?? null) : null,
      sessao_auth_id: sessao.claims.sid ?? null,
      ferramenta: l.ferramenta,
      tabela: l.tabela ?? null,
      ids: (l.ids ?? []).slice(0, MAX_IDS),
      quantidade: l.quantidade,
      // Pelo JSON: o que é selado é exatamente o que o jsonb guarda (sem `undefined`, sem Date).
      filtros: l.filtros ? (JSON.parse(JSON.stringify(l.filtros)) as Record<string, unknown>) : null,
    }
    const esc = sessao.claims.escritorio_id
    const lista = this.fila.get(esc) ?? []
    lista.push(p)
    this.fila.set(esc, lista)
    if (lista.length >= config.leituraLote) void this.descarregar(esc).catch((e) => console.error('[heild] registro de leituras não gravou:', e))
  }

  /** Grava o que está na memória (de um escritório ou de todos), em série. */
  descarregar(soDe?: string): Promise<void> {
    const vez = this.gravando.then(async () => {
      for (const esc of soDe ? [soDe] : [...this.fila.keys()]) {
        const lista = this.fila.get(esc)
        if (!lista?.length) continue
        this.fila.delete(esc)
        for (let i = 0; i < lista.length; i += config.leituraLote) {
          const lote = lista.slice(i, i + config.leituraLote)
          try {
            await noEscritorio(this.sql, { sub: 'registro-leituras', escritorio_id: esc }, (tx) => gravarLote(tx, esc, lote))
          } catch (e) {
            // Volta para a fila: o próximo intervalo tenta de novo (nada se perde por uma falha passageira).
            this.fila.set(esc, [...lote, ...lista.slice(i + config.leituraLote), ...(this.fila.get(esc) ?? [])])
            throw e
          }
        }
      }
    })
    this.gravando = vez.catch(() => undefined)
    return vez
  }

  async parar() {
    if (this.relogio) clearInterval(this.relogio)
    this.relogio = null
    await this.descarregar()
  }
}

async function gravarLote(tx: Tx, esc: string, lote: Pendente[]) {
  // Trava consultiva do escritório até o fim da transação: um selo por vez, sem buraco.
  await tx`select pg_advisory_xact_lock(hashtextextended(${'heild-leitura:' + esc}, 0))`
  const [ultimo] = await tx`select lote, hash from selo_leitura where escritorio_id = ${esc} order by lote desc limit 1`
  const anterior = ultimo ? hexToBytes(Buffer.from(ultimo.hash as Uint8Array).toString('hex')) : geneseDasLeituras(esc)
  const numero = ultimo ? Number(ultimo.lote) + 1 : 1
  const hash = seloDoLote(anterior, lote)
  const linhas = lote.map((l) => ({ ...l, escritorio_id: esc, lote: numero, filtros: l.filtros === null ? null : tx.json(l.filtros as never) }))
  await tx`insert into evento_leitura ${tx(linhas as never, 'escritorio_id', 'lote', 'lido_em', 'ator_tipo', 'ator_id', 'sessao_auth_id', 'ferramenta', 'tabela', 'ids', 'quantidade', 'filtros')}`
  await tx`insert into selo_leitura (escritorio_id, lote, quantidade, hash_anterior, hash) values (${esc}, ${numero}, ${lote.length}, ${Buffer.from(anterior)}, ${Buffer.from(hash)})`
}

/** Confere os selos do escritório: recalcula cada lote com as leituras gravadas. */
export async function verificarLeituras(tx: Tx, esc: string): Promise<{ ok: boolean; lotes: number; leituras: number; primeiro_lote_quebrado: number | null; motivo?: string }> {
  const selos = await tx`select lote, quantidade, hash_anterior, hash from selo_leitura where escritorio_id = ${esc} order by lote`
  let anterior = geneseDasLeituras(esc)
  let leituras = 0
  for (const s of selos) {
    const linhas = await tx`select lido_em, ator_tipo, ator_id, sessao_auth_id, ferramenta, tabela, ids, quantidade, filtros from evento_leitura where escritorio_id = ${esc} and lote = ${s.lote} order by id`
    leituras += linhas.length
    const esperado = seloDoLote(anterior, linhas as unknown as LeituraDoLote[])
    const gravado = Buffer.from(s.hash as Uint8Array).toString('hex')
    const motivo =
      Buffer.from(s.hash_anterior as Uint8Array).toString('hex') !== bytesToHex(anterior) ? 'elo' : linhas.length !== Number(s.quantidade) ? 'quantidade' : bytesToHex(esperado) !== gravado ? 'conteudo' : null
    if (motivo) return { ok: false, lotes: selos.length, leituras, primeiro_lote_quebrado: Number(s.lote), motivo }
    anterior = esperado
  }
  return { ok: true, lotes: selos.length, leituras, primeiro_lote_quebrado: null }
}

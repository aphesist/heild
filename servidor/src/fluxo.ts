import type { ServerResponse } from 'node:http'
import { podeLerLinha, type EscopoLeitura, type NomeTabela, type Registro } from '@heild/dominio'
import { abrirSessao, type Sessao } from './auth/sessao.ts'
import { escritoriosComPerfil, invalidarEscritorio, TABELAS_DO_PERFIL } from './auth/cache-perfil.ts'
import { config } from './config.ts'
import { noEscritorio, paraJson, type Sql } from './banco/pg.ts'
import { ErroApi } from './executor/erro.ts'
import { escopoDaSessao } from './executor/sincronizar.ts'

/**
 * O fluxo de mudanças (ARQUITETURA 6.3): `GET /v1/eventos/fluxo`, SSE.
 *
 * - Cada instância lê a cauda de `mudanca` a cada `HEILD_FLUXO_MS` (padrão 400 ms), uma
 *   consulta por escritório com alguém conectado (ou com perfil em cache), sob a RLS dele.
 *   Sem LISTEN/NOTIFY (trava o commit com taxa alta) e sem o Realtime do Supabase (não
 *   conhece setor e carteira).
 * - Para cada pessoa conectada, manda `{ tabela, ids, versao }` só com as linhas que ela
 *   leria (`podeLerLinha`, a mesma regra do `sincronizar`). A tela chama `sincronizar`
 *   (classes 1 e 2) ou invalida o `useConsulta` (classe 3).
 * - Uma linha das tabelas do perfil invalida o cache do perfil daquele escritório, nesta
 *   instância e em todas as outras (cada uma lê a mesma cauda), e a sessão das conexões é
 *   remontada: quem perdeu o acesso deixa de receber, e a conta desativada é desligada.
 *
 * A versão de uma linha é dada na escrita e a transação pode confirmar fora de ordem; por
 * isso a leitura olha também os últimos segundos e descarta o que já mandou.
 */

interface Conexao {
  sessao: Sessao
  escopo: EscopoLeitura
  resposta: ServerResponse
  pulso: ReturnType<typeof setInterval>
  integrante?: string
}

interface Escritorio {
  versao: number
  vistos: Map<number, number>
  conexoes: Set<Conexao>
}

/** Escreve se a conexão ainda está aberta (o navegador pode ter fechado entre uma volta e outra). */
const escrever = (r: ServerResponse, texto: string) => {
  if (!r.writableEnded && !r.destroyed) r.write(texto)
}

const ATRASO_CONFIRMACAO = '5 seconds'
const PULSO_MS = 10_000
const MAX_MUDANCAS = 2_000

export class Fluxo {
  private escritorios = new Map<string, Escritorio>()
  private relogio: ReturnType<typeof setInterval> | null = null
  private rodando = false
  /** Contagem do que foi mandado (para o teste e a métrica). */
  enviados = 0

  constructor(private sql: Sql) {}

  iniciar() {
    if (this.relogio) return
    this.relogio = setInterval(() => void this.passo().catch((e) => console.error('[heild] fluxo de mudanças:', e)), config.fluxoMs)
    this.relogio.unref()
  }

  async parar() {
    if (this.relogio) clearInterval(this.relogio)
    this.relogio = null
    for (const e of this.escritorios.values()) for (const c of e.conexoes) this.fechar(c)
    this.escritorios.clear()
  }

  conexoesDe = (esc: string) => this.escritorios.get(esc)?.conexoes.size ?? 0

  /** Liga uma resposta HTTP já aberta ao fluxo do escritório da sessão. */
  async conectar(sessao: Sessao, resposta: ServerResponse, integrante?: string) {
    const esc = sessao.claims.escritorio_id
    const e = this.escritorios.get(esc) ?? (await this.registrar(esc))
    const daConta = [...e.conexoes].filter((c) => c.sessao.claims.sub === sessao.claims.sub).length
    if (daConta >= config.fluxoPorConta) throw new ErroApi('LIMITE_TAXA', { mensagem: `No máximo ${config.fluxoPorConta} conexões de avisos abertas por conta.` })
    const escopo = await noEscritorio(this.sql, { sub: sessao.claims.sub, escritorio_id: esc }, (tx) => escopoDaSessao(tx, sessao))
    const c: Conexao = { sessao, escopo, resposta, integrante, pulso: setInterval(() => escrever(resposta, ': pulso\n\n'), PULSO_MS) }
    c.pulso.unref()
    e.conexoes.add(c)
    resposta.on('close', () => {
      clearInterval(c.pulso)
      e.conexoes.delete(c)
    })
    escrever(resposta, `retry: 3000\nevent: pronto\ndata: ${JSON.stringify({ versao: e.versao })}\n\n`)
  }

  private async registrar(esc: string): Promise<Escritorio> {
    // Começa do fim da cauda: o que já estava lá (inclusive nos últimos segundos) não é aviso.
    const { v, recentes } = await noEscritorio(this.sql, { sub: 'fluxo', escritorio_id: esc }, async (tx) => {
      const [r] = await tx`select greatest((select coalesce(max(versao), 0) from mudanca), (select coalesce(max(versao_linha), 0) from remocao))::bigint as v`
      const recentes = await tx`select versao from mudanca where gravada_em > now() - ${ATRASO_CONFIRMACAO}::interval union all select versao_linha from remocao where removido_em > now() - ${ATRASO_CONFIRMACAO}::interval`
      return { v: Number(r.v), recentes: recentes.map((x) => Number(x.versao)) }
    })
    const agora = Date.now()
    const e: Escritorio = { versao: v, vistos: new Map(recentes.map((x) => [x, agora])), conexoes: new Set() }
    this.escritorios.set(esc, e)
    return e
  }

  /** Uma volta: lê a cauda de cada escritório acompanhado. Público para os testes. */
  async passo() {
    if (this.rodando) return
    this.rodando = true
    try {
      // O cache do perfil também segue a cauda: escritório com perfil guardado é acompanhado.
      for (const esc of escritoriosComPerfil()) if (!this.escritorios.has(esc)) await this.registrar(esc)
      for (const [esc, e] of this.escritorios) {
        await this.lerEscritorio(esc, e)
        if (!e.conexoes.size && !escritoriosComPerfil().has(esc)) this.escritorios.delete(esc)
      }
    } finally {
      this.rodando = false
    }
  }

  private async lerEscritorio(esc: string, e: Escritorio) {
    const { mudancas, linhas } = await noEscritorio(this.sql, { sub: 'fluxo', escritorio_id: esc }, async (tx) => {
      const mudancas = (await tx`select versao, tabela, id from mudanca where versao > ${e.versao} or gravada_em > now() - ${ATRASO_CONFIRMACAO}::interval order by versao limit ${MAX_MUDANCAS}`).map((m) => ({ versao: Number(m.versao), tabela: String(m.tabela) as NomeTabela, id: String(m.id) }))
      // Exclusões (só as que a regra da tabela deixa: convite, vínculo, exceção) vêm de `remocao`.
      const apagadas = (await tx`select versao_linha, tabela, id from remocao where versao_linha > ${e.versao} or removido_em > now() - ${ATRASO_CONFIRMACAO}::interval order by versao_linha limit ${MAX_MUDANCAS}`).map((m) => ({ versao: Number(m.versao_linha), tabela: String(m.tabela) as NomeTabela, id: String(m.id), removida: true }))
      const novas = [...mudancas, ...apagadas].filter((m) => !e.vistos.has(m.versao))
      const linhas = new Map<string, Registro & Record<string, unknown>>()
      if (!novas.length || !e.conexoes.size) return { mudancas: novas, linhas }
      const porTabela = new Map<NomeTabela, string[]>()
      for (const m of novas) if (!('removida' in m)) porTabela.set(m.tabela, [...(porTabela.get(m.tabela) ?? []), m.id])
      for (const [t, ids] of porTabela) for (const l of await tx`select * from ${tx(t)} where id = any(${ids})`) linhas.set(`${t}\u0000${l.id}`, paraJson(l) as Registro & Record<string, unknown>)
      return { mudancas: novas, linhas }
    })
    const agora = Date.now()
    for (const m of mudancas) {
      e.vistos.set(m.versao, agora)
      e.versao = Math.max(e.versao, m.versao)
    }
    for (const [v, quando] of e.vistos) if (agora - quando > 30_000) e.vistos.delete(v)
    if (!mudancas.length) return
    // O perfil mudou: o cache sai e as conexões remontam a sessão e o escopo.
    if (mudancas.some((m) => TABELAS_DO_PERFIL.has(m.tabela))) {
      invalidarEscritorio(esc)
      for (const c of e.conexoes) await this.remontar(c)
    } else if (mudancas.some((m) => m.tabela === 'participacao' || m.tabela === 'conversa_interna')) {
      for (const c of e.conexoes) c.escopo = await noEscritorio(this.sql, { sub: c.sessao.claims.sub, escritorio_id: esc }, (tx) => escopoDaSessao(tx, c.sessao))
    }
    for (const c of e.conexoes) {
      const porTabela = new Map<string, { ids: string[]; versao: number; removidas?: true }>()
      for (const m of mudancas) {
        // Linha excluída: só o id vai (a linha não existe mais para conferir o setor).
        const removida = 'removida' in m
        const l = linhas.get(`${m.tabela}\u0000${m.id}`)
        if (!removida && (!l || !podeLerLinha(c.escopo, m.tabela, l))) continue
        const chave = removida ? `${m.tabela}\u0000-` : m.tabela
        const g = porTabela.get(chave) ?? { ids: [], versao: 0, ...(removida ? { removidas: true as const } : {}) }
        if (!g.ids.includes(m.id)) g.ids.push(m.id)
        g.versao = Math.max(g.versao, m.versao)
        porTabela.set(chave, g)
      }
      for (const [chave, g] of porTabela) {
        const tabela = chave.split('\u0000')[0]
        escrever(c.resposta, `id: ${g.versao}\nevent: mudanca\ndata: ${JSON.stringify({ tabela, ids: g.ids, versao: g.versao, ...(g.removidas ? { removidas: true } : {}) })}\n\n`)
        this.enviados++
      }
    }
  }

  private async remontar(c: Conexao) {
    try {
      c.sessao = await abrirSessao(this.sql, c.sessao.claims, c.integrante)
      c.escopo = await noEscritorio(this.sql, { sub: c.sessao.claims.sub, escritorio_id: c.sessao.claims.escritorio_id }, (tx) => escopoDaSessao(tx, c.sessao))
    } catch {
      // Conta desativada ou sem acesso: o fluxo fecha (o navegador volta a entrar e recebe o erro).
      this.fechar(c)
    }
  }

  private fechar(c: Conexao) {
    clearInterval(c.pulso)
    if (!c.resposta.writableEnded && !c.resposta.destroyed) c.resposta.end('event: fim\ndata: {}\n\n')
  }
}

import { randomUUID } from 'node:crypto'
import type { PgBoss } from 'pg-boss'
import { geneseDaCadeia, hashDoEvento, type EventoDaCadeia } from '@heild/dominio'
import type { Tx } from './banco.ts'
import { FILAS, enfileirar } from './fila.ts'
import type { ContextoExec } from './contexto.ts'
import { idDoAtor, nomeDoAtor, tipoDoAtor } from './contexto.ts'

export interface NovoEvento {
  nome: string
  ferramenta: string
  nivel: 'ler' | 'rascunhar' | 'executar'
  resultado: 'ok' | 'negado' | 'erro' | 'aguardando_aprovacao' | 'aprovado' | 'recusado'
  texto: string
  cliente_id?: string | null
  setor?: string | null
  argumentos_resumo?: unknown
  resultado_ref?: string | null
  execucao_id?: string | null
  causado_por_evento_id?: string | null
  aprovacao_id?: string | null
  custo?: unknown
}

/**
 * Porta de eventos da B2. Grava o evento na transação do efeito (R2) e, na mesma transação,
 * enfileira o despacho dele para os gatilhos. Interface combinada com a B1
 * (IMPLEMENTACAO.md, B2): o executor da B1, quando gravar evento com cadeia de hash, chama
 * `aoGravarEvento` para que o despachante veja também os eventos das telas.
 */
export class PortaEventos {
  constructor(private readonly boss: PgBoss) {}

  async gravar(tx: Tx, ctx: ContextoExec, e: NovoEvento): Promise<string> {
    const origem = ctx.origem === 'mcp' ? 'api_externa' : ctx.origem
    const dono = ctx.ator.tipo === 'integrante' ? (ctx.ator.dono?.usuario_id ?? null) : null
    // Cadeia de hash do escritório (B1, STACK 8): trava o elo, calcula com a função do pacote de
    // domínio (a mesma que `auditoria.verificar_cadeia` usa) e grava evento e elo na transação do efeito.
    await tx`insert into cadeia_evento (escritorio_id, seq, hash) values (${ctx.escritorio_id}, 0, ${Buffer.from(geneseDaCadeia(ctx.escritorio_id))}) on conflict (escritorio_id) do nothing`
    const [elo] = await tx`select seq, hash from cadeia_evento where escritorio_id = ${ctx.escritorio_id} for update`
    const seq = Number(elo!.seq) + 1
    // Hora do servidor em milissegundos, como a canonização da cadeia usa.
    const agora = new Date().toISOString()
    const ev = {
      id: `ev${randomUUID().replaceAll('-', '')}`,
      escritorio_id: ctx.escritorio_id,
      seq,
      criado_em: agora,
      nome: e.nome,
      ator_tipo: tipoDoAtor(ctx.ator),
      ator_id: idDoAtor(ctx.ator),
      ator_nome: nomeDoAtor(ctx.ator),
      usuario_dono_id: dono,
      cliente_id: e.cliente_id ?? null,
      setor_id: e.setor ?? null,
      ferramenta: e.ferramenta,
      ferramenta_versao: 1,
      nivel: e.nivel,
      argumentos_resumo: e.argumentos_resumo ?? null,
      resultado: e.resultado,
      resultado_ref: e.resultado_ref ?? null,
      origem,
      visivel_na_linha_do_tempo: e.resultado !== 'negado' && e.resultado !== 'erro',
      texto: e.texto,
      extras: null,
      sessao_auth_id: null,
      aprovacao_id: e.aprovacao_id ?? null,
      causado_por_evento_id: e.causado_por_evento_id ?? null,
      idempotencia_chave: null,
    }
    const hash = hashDoEvento(new Uint8Array(elo!.hash as Buffer), ev as EventoDaCadeia)
    await tx`
      insert into evento (escritorio_id, id, criado_em, atualizado_em, nome, ator_tipo, ator_id, ator_nome, usuario_dono_id, cliente_id, setor_id,
        ferramenta, ferramenta_versao, nivel, argumentos_resumo, resultado, resultado_ref, origem, visivel_na_linha_do_tempo, texto,
        aprovacao_id, causado_por_evento_id, seq, hash_anterior, hash, execucao_id, custo)
      values (${ev.escritorio_id}, ${ev.id}, ${ev.criado_em}, ${ev.criado_em}, ${ev.nome}, ${ev.ator_tipo}, ${ev.ator_id}, ${ev.ator_nome}, ${dono},
        ${ev.cliente_id}, ${ev.setor_id}, ${ev.ferramenta}, 1, ${ev.nivel}, ${ev.argumentos_resumo === null ? null : tx.json(ev.argumentos_resumo as never)},
        ${ev.resultado}, ${ev.resultado_ref}, ${origem}, ${ev.visivel_na_linha_do_tempo}, ${ev.texto}, ${ev.aprovacao_id}, ${ev.causado_por_evento_id},
        ${seq}, ${elo!.hash}, ${Buffer.from(hash)}, ${e.execucao_id ?? null}, ${e.custo === undefined ? null : tx.json(e.custo as never)})`
    await tx`update cadeia_evento set seq = ${seq}, hash = ${Buffer.from(hash)} where escritorio_id = ${ctx.escritorio_id}`
    await this.aoGravarEvento(tx, ctx.escritorio_id, ev.id, e.resultado)
    return ev.id
  }

  /** Só eventos de sucesso acordam gatilhos; negado e erro ficam na trilha. */
  async aoGravarEvento(tx: Tx, escritorio_id: string, evento_id: string, resultado: string) {
    if (resultado !== 'ok' && resultado !== 'aprovado') return
    await enfileirar(this.boss, tx, FILAS.despachar, { escritorio_id, evento_id }, { singleton: `${escritorio_id}:${evento_id}` })
  }
}

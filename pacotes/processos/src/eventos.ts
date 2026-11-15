import type { PgBoss } from 'pg-boss'
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
    const [linha] = await tx`
      insert into evento (escritorio_id, nome, ator_tipo, ator_id, ator_nome, usuario_dono_id, cliente_id, setor_id, ferramenta, nivel,
        argumentos_resumo, resultado, resultado_ref, origem, texto, execucao_id, causado_por_evento_id, aprovacao_id, custo)
      values (${ctx.escritorio_id}, ${e.nome}, ${tipoDoAtor(ctx.ator)}, ${idDoAtor(ctx.ator)}, ${nomeDoAtor(ctx.ator)}, ${dono},
        ${e.cliente_id ?? null}, ${e.setor ?? null}, ${e.ferramenta}, ${e.nivel}, ${e.argumentos_resumo === undefined ? null : tx.json(e.argumentos_resumo as never)},
        ${e.resultado}, ${e.resultado_ref ?? null}, ${origem}, ${e.texto}, ${e.execucao_id ?? null}, ${e.causado_por_evento_id ?? null},
        ${e.aprovacao_id ?? null}, ${e.custo === undefined ? null : tx.json(e.custo as never)})
      returning id`
    await this.aoGravarEvento(tx, ctx.escritorio_id, linha!.id, e.resultado)
    return linha!.id
  }

  /** Só eventos de sucesso acordam gatilhos; negado e erro ficam na trilha. */
  async aoGravarEvento(tx: Tx, escritorio_id: string, evento_id: string, resultado: string) {
    if (resultado !== 'ok' && resultado !== 'aprovado') return
    await enfileirar(this.boss, tx, FILAS.despachar, { escritorio_id, evento_id }, { singleton: `${escritorio_id}:${evento_id}` })
  }
}

import { registrarFerramentaTipada, type NomeTabela, type Repositorio } from '@heild/dominio'
import {
  bossNaTransacao,
  criarProcessos,
  envelopeParaHttp,
  FornecedorDemonstracao,
  ligacaoDosProcedimentos,
  procedimentosDeReferencia,
  type ContextoExec,
  type Processos,
} from '@heild/processos'
import type { Sql, Tx } from './banco/pg.ts'
import { config } from './config.ts'
import { operacoes } from './executor/operacoes.ts'
import { ligarFila } from './executor/jobs.ts'

/**
 * A B2 dentro da API (docs/backend/IMPLEMENTACAO.md, B2 › O encaixe com a B1).
 *
 * Na carga do módulo (síncrono, para o catálogo, o OpenAPI e os contratos verem igual):
 *  - cada procedimento vira uma ferramenta tipada de escrita (`contabil.ecd.conferir_e_transmitir`...)
 *    e uma operação de servidor (`procedimentos.CTB-ECD-TRANSMITIR.iniciar`) que o executor roda.
 *
 * Quando a API sobe com a fila (`ligarProcessos`):
 *  - os jobs pedidos pelos efeitos entram no pg-boss na transação do efeito;
 *  - os eventos gravados pelo executor acordam o despachante dos gatilhos;
 *  - as ferramentas da B2 (`execucao.obter`, `execucao.retomar`, `procedimento.listar`,
 *    `validador.executar`, `memoria.propor`) e os cartões de execução passam a ser servidos.
 */
const ligacao = ligacaoDosProcedimentos(procedimentosDeReferencia)
for (const f of ligacao.ferramentas) registrarFerramentaTipada(f)
for (const o of ligacao.operacoes) {
  if (!operacoes.has(o.nome)) operacoes.set(o.nome, { nome: o.nome, metodo: o.metodo, repositorio: o.repositorio as unknown as Repositorio<NomeTabela> })
}

/** Nomes das operações de processo (a rota responde 202 `em_execucao`). */
export const operacoesDeProcesso = new Set(ligacao.ferramentas.map((f) => f.nome))

/**
 * Liga o pg-boss no processo da API, no modo produtor: só enfileira e consulta (o worker,
 * `npm run worker -w @heild/processos`, é o dono do esquema da fila e roda os passos).
 */
export async function ligarProcessos(sql: Sql, url = config.pgApi): Promise<Processos> {
  const p = await criarProcessos({
    url,
    sql: sql as never,
    modo: 'api',
    // O processo da API não chama modelo: o runner dos operários é do worker.
    fornecedor: new FornecedorDemonstracao(),
  })
  ligarFila({
    enfileirar: async (tx: Tx, j) => {
      await p.boss.send(j.fila, j.dados, {
        db: bossNaTransacao(tx as never),
        ...(j.singleton ? { singletonKey: j.singleton } : {}),
        ...(j.iniciar_em ? { startAfter: j.iniciar_em } : {}),
        ...(j.prioridade !== undefined ? { priority: j.prioridade } : {}),
      })
    },
    aoGravarEvento: (tx: Tx, esc, id, resultado) => p.eventos.aoGravarEvento(tx as never, esc, id, resultado),
  })
  return p
}

export async function desligarProcessos(p: Processos | null) {
  ligarFila(null)
  if (p) await p.parar({ fecharSql: false })
}

/** O contexto da B2 a partir da sessão da B1 (mesmo ator, mesmo escritório do token). */
export const contextoDaSessao = (escritorio_id: string, ctx: { ator: ContextoExec['ator']; origem: string }): ContextoExec => ({
  escritorio_id,
  ator: ctx.ator,
  origem: ctx.origem === 'chat' || ctx.origem === 'job' || ctx.origem === 'evento' ? ctx.origem : ctx.origem === 'tela' ? 'tela' : 'mcp',
})

export { envelopeParaHttp }

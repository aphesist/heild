import type { PedidoJob } from '@heild/dominio'
import type { Tx } from '../banco/pg.ts'
import { ErroApi } from './erro.ts'

/**
 * Onde os jobs pedidos por um efeito entram na fila, dentro da transação do efeito.
 *
 * B1: não há fila (pg-boss e o motor de procedimentos são da sessão B2). Nenhuma operação
 * de hoje pede job; se alguma pedir, a transação inteira volta com erro, em vez de gravar
 * o efeito e perder o trabalho em silêncio.
 *
 * B2: trocar o corpo por `boss.send(job.fila, job.dados, { db: { executeSql: (texto, valores) => tx.unsafe(texto, valores) }, singletonKey: job.singleton, startAfter: job.iniciar_em, priority: job.prioridade })`
 * para cada job: o pg-boss grava em `pgboss.job` com a mesma conexão e o mesmo commit.
 */
export async function enfileirarNaTransacao(_tx: Tx, jobs: PedidoJob[]): Promise<void> {
  if (!jobs.length) return
  throw new ErroApi('ERRO_INTERNO', { mensagem: `A operação pediu ${jobs.length} job(s) (${jobs.map((j) => j.fila).join(', ')}), mas a fila ainda não está instalada (sessão B2).` })
}

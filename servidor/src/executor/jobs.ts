import type { PedidoJob } from '@heild/dominio'
import type { Tx } from '../banco/pg.ts'
import { ErroApi } from './erro.ts'

/**
 * Onde os jobs pedidos por um efeito entram na fila, dentro da transação do efeito (encaixe B1 ↔ B2).
 *
 * Com a fila ligada (`ligarFila`, feito por `src/b2.ts` quando a API sobe com o pg-boss), cada
 * job vai para o pg-boss pela MESMA conexão e o MESMO commit: se o efeito voltar, o job some junto.
 * Sem fila ligada, a transação inteira volta com erro, em vez de gravar o efeito e perder o
 * trabalho em silêncio.
 */
export interface Fila {
  enfileirar(tx: Tx, job: PedidoJob): Promise<void>
  /** Depois de gravar eventos na cadeia: o despachante da B2 casa cada um com os gatilhos (mesma transação). */
  aoGravarEvento(tx: Tx, escritorioId: string, eventoId: string, resultado: string): Promise<void>
}

let fila: Fila | null = null

export function ligarFila(f: Fila | null) {
  fila = f
}

export async function enfileirarNaTransacao(tx: Tx, jobs: PedidoJob[]): Promise<void> {
  if (!jobs.length) return
  if (!fila) throw new ErroApi('ERRO_INTERNO', { mensagem: `A operação pediu ${jobs.length} job(s) (${jobs.map((j) => j.fila).join(', ')}), mas a fila não está ligada neste processo (sessão B2).` })
  for (const j of jobs) await fila.enfileirar(tx, j)
}

export async function despacharEventos(tx: Tx, escritorioId: string, eventos: Record<string, unknown>[]): Promise<void> {
  if (!fila) return
  for (const e of eventos) await fila.aoGravarEvento(tx, escritorioId, String(e.id), String(e.resultado))
}

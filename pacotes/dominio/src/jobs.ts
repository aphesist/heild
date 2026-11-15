/**
 * Pedido de job feito por um efeito (encaixe da sessão B2: fila pg-boss e motor de
 * procedimentos). O código de domínio pede; quem executa a operação decide o que fazer:
 *
 * - no servidor, o executor junta os pedidos da operação e os grava NA MESMA TRANSAÇÃO do
 *   efeito e do evento (servidor/src/executor/jobs.ts). Se a transação voltar, o job some junto;
 * - no navegador do wireframe não há fila: o pedido é ignorado (a demonstração simula).
 *
 * A chave `singleton` é a deduplicação (AGENTICO 4.2: `(execucao, passo, tentativa)`;
 * despachante: `(gatilho_id, chave_dedupe)`).
 */
export interface PedidoJob {
  fila: string
  dados: Record<string, unknown>
  singleton?: string
  iniciar_em?: string
  prioridade?: number
}

type Coletor = (job: PedidoJob) => void
let coletor: Coletor | null = null

/** O executor do servidor liga o coletor durante a operação (síncrono, como o banco do pedido). */
export function comColetorDeJobs<R>(c: Coletor, fazer: () => R): R {
  const antes = coletor
  coletor = c
  try {
    return fazer()
  } finally {
    coletor = antes
  }
}

/** Chamado pelo código de domínio (repositório, passo de procedimento) para enfileirar trabalho. */
export function pedirJob(job: PedidoJob): void {
  coletor?.(job)
}

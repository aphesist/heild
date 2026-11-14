import type { StatusTarefa } from '@/dados/tipos'

/** Rótulo curto de cada estado da tarefa (contrato C3): use em vez de escrever o estado à mão. */
export const rotuloStatus: Record<StatusTarefa, string> = {
  a_fazer: 'a fazer',
  em_andamento: 'em andamento',
  aguardando_cliente: 'aguard. cliente',
  aguardando_terceiro: 'aguard. órgão',
  em_revisao: 'em revisão',
  concluida: 'concluída',
  cancelada: 'cancelada',
}

/** Rótulo por extenso (ficha da tarefa, leitores de tela). */
export const rotuloStatusLongo: Record<StatusTarefa, string> = {
  a_fazer: 'a fazer',
  em_andamento: 'em andamento',
  aguardando_cliente: 'aguardando o cliente',
  aguardando_terceiro: 'aguardando órgão ou terceiro',
  em_revisao: 'em revisão',
  concluida: 'concluída',
  cancelada: 'cancelada',
}

/** Estados finais: não voltam (concluída abre correção; cancelada, tarefa nova). */
export const statusFinal = (s: StatusTarefa) => s === 'concluida' || s === 'cancelada'
/** Estados em que a tarefa conta como aberta nas filas e contagens. */
export const statusAberto = (s: StatusTarefa) => !statusFinal(s)

import { ValorEditavel } from './valor-editavel'

/**
 * Edição em linha de um texto (fase 6: virou o tipo `texto` do ValorEditavel).
 * O valor aparece sublinhado em pontilhado; clicar (ou Enter com foco) abre o
 * campo, Enter salva, Esc cancela. Valida antes de salvar; `onSalvar` pode
 * lançar erro (permissão, regra): o valor volta e a mensagem aparece ao lado.
 * Salvo, o aviso traz "Desfazer".
 *
 *   <EdicaoEmLinha rotulo="Título da tarefa" valor={t.titulo}
 *     validar={(v) => (v.trim() ? null : 'Escreva um título')}
 *     onSalvar={(v) => repos.tarefas.atualizar(t.id, { titulo: v })} />
 */
export function EdicaoEmLinha({
  valor,
  onSalvar,
  rotulo,
  validar,
  multilinha,
  placeholder = 'escrever',
  desabilitado,
  className,
}: {
  valor: string
  onSalvar: (novo: string) => void | Promise<void>
  /** Nome do campo para leitores de tela ("Título da tarefa"). */
  rotulo: string
  validar?: (v: string) => string | null
  multilinha?: boolean
  placeholder?: string
  /** Sem permissão: mostra o texto, sem sublinhado. */
  desabilitado?: boolean
  className?: string
}) {
  if (desabilitado) return <span className={className}>{valor}</span>
  return <ValorEditavel rotulo={rotulo} valor={valor} vazio={placeholder} config={{ tipo: 'texto', multilinha, validar }} onMudar={onSalvar} className={className} />
}

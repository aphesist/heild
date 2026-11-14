import { ArrowRightIcon } from '@phosphor-icons/react'
import { useNavegacao } from '@/ambiente/loja'
import { Button } from '@/components/ui/button'
import type { Cliente } from '@/dados/tipos'
import { cn } from '@/lib/utils'

/**
 * Faixa de ciclo de vida (S04-T09; contrato C6): o estado do cliente em
 * todas as abas, com "ver trilha" quando há trilha de implantação ou de
 * saída. "Ver trilha" navega para `{ modulo: 'painel', aba: 'societario', trilha: clienteId }`.
 *
 * Esqueleto do contrato: estado e link. Os estados por serviço, os bloqueios e
 * o progresso da trilha chegam no mesmo componente sem mudar as props.
 */

const rotuloSituacao: Record<NonNullable<Cliente['situacao']>, string> = { ativo: 'ativo', implantacao: 'em implantação', saida: 'em saída' }

export function FaixaCicloDeVida({ cliente, className }: { cliente: Cliente; className?: string }) {
  const nav = useNavegacao()
  const situacao = cliente.situacao ?? 'ativo'
  if (situacao === 'ativo') return null
  return (
    <div role="status" className={cn('bg-warning/10 flex flex-wrap items-center gap-2 rounded-[14px] px-3 py-2 text-sm', className)}>
      <span className="font-medium">{cliente.nome}</span>
      <span className="text-muted-foreground">está {rotuloSituacao[situacao]}.</span>
      <Button size="sm" variant="ghost" className="ml-auto rounded-full" onClick={() => nav.irPara({ modulo: 'painel', aba: 'societario', trilha: cliente.id })}>
        Ver trilha <ArrowRightIcon />
      </Button>
    </div>
  )
}

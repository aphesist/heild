import { CheckCircleIcon, WarningCircleIcon, WarningIcon } from '@phosphor-icons/react'
import { useNavegacao } from '@/ambiente/loja'
import { useNotas } from '@/dados/s02/notas'
import { cn } from '@/lib/utils'

/**
 * Saúde da captura no cabeçalho da aba Notas (S02-A55; 03, 6.3 e ad. 17):
 * "captura ok ontem 03:12 · NSU 18.442" ou "parada há 3 dias: certificado
 * vencido" com o link ao Societário. Quando o C9 (Conectores, S09) chegar, a
 * situação do conector de captura passa a vir de lá; até lá vem do estado de
 * Notas do cliente.
 */
export function SaudeCaptura({ clienteId, className }: { clienteId: string; className?: string }) {
  const e = useNotas(clienteId)
  const nav = useNavegacao()
  if (e.pf) return <span className={cn('text-muted-foreground text-xs', className)}>Pessoa física: sem captura de notas</span>
  const c = e.captura
  const nsu = c.nsu ? ` · NSU ${c.nsu.toLocaleString('pt-BR')}` : ''
  if (c.situacao === 'sem_configuracao')
    return (
      <span className={cn('bg-sunken text-muted-foreground inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs', className)}>
        <WarningIcon className="size-3.5" /> captura não configurada
      </span>
    )
  if (c.situacao === 'parada')
    return (
      <span role="status" className={cn('bg-destructive/12 text-destructive inline-flex w-fit flex-wrap items-center gap-1.5 rounded-full px-2.5 py-1 text-xs', className)}>
        <WarningCircleIcon weight="fill" className="size-3.5 shrink-0" />
        <span>
          captura parada{c.dias ? ` há ${c.dias} ${c.dias === 1 ? 'dia' : 'dias'}` : ''}: {c.motivo}
        </span>
        {/certificado/.test(c.motivo ?? '') && (
          <button type="button" className="cursor-pointer font-medium underline underline-offset-2" onClick={() => nav.irPara({ modulo: 'painel', aba: 'societario', cliente: clienteId })}>
            renovar no Societário
          </button>
        )}
      </span>
    )
  return (
    <span role="status" className={cn('inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs', c.situacao === 'atencao' ? 'bg-warning/15' : 'bg-success/15', className)}>
      {c.situacao === 'atencao' ? <WarningIcon weight="fill" className="text-warning size-3.5" /> : <CheckCircleIcon weight="fill" className="text-success size-3.5" />}
      captura ok {c.ultima}
      {nsu}
      {c.situacao === 'atencao' && c.motivo && (
        <button type="button" className="cursor-pointer underline underline-offset-2" onClick={() => nav.irPara({ modulo: 'painel', aba: 'societario', cliente: clienteId })}>
          {c.motivo}
        </button>
      )}
    </span>
  )
}

import { FlaskIcon } from '@phosphor-icons/react'
import { Tooltip } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

/**
 * Marca de "demonstração": toda resposta de serviço simulado (IA, governo,
 * banco, WhatsApp...) aparece com este selo, para ninguém confundir o
 * wireframe com o produto ligado. Some sozinho quando o serviço real entra
 * (o resultado deixa de vir com `demonstracao: true`).
 */
export function SeloDemonstracao({ fonte, className }: { fonte?: string; className?: string }) {
  return (
    <Tooltip conteudo={`Resposta simulada${fonte ? ` de ${fonte}` : ''}: nenhuma API real foi chamada.`}>
      <span tabIndex={0} className={cn('bg-warning/15 text-foreground inline-flex w-fit shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium [&_svg]:size-3', className)}>
        <FlaskIcon className="text-warning" weight="duotone" /> demonstração
      </span>
    </Tooltip>
  )
}

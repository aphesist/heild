import { DotsThreeIcon } from '@phosphor-icons/react'
import { ContextMenu, DropdownMenu } from 'radix-ui'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Menu de contexto: botão direito (ou toque longo, ou Shift+F10) sobre o
 * item abre as ações; o botão "⋯" abre as mesmas ações para quem não usa
 * o botão direito. Item sem permissão aparece desabilitado com o motivo
 * (subplano 03, 9.1: "por que não posso?").
 *
 *   <MenuContexto acoes={[{ rotulo: 'Editar', icone: <PencilSimpleIcon />, onSelecionar: editar },
 *                         { rotulo: 'Excluir', perigo: true, onSelecionar: excluir, motivo: podeExcluir ? undefined : 'Só o Administrador' }]}>
 *     <CartaoTarefa ... />
 *   </MenuContexto>
 */

export interface AcaoMenu {
  rotulo: string
  icone?: ReactNode
  onSelecionar: () => void
  perigo?: boolean
  /** Preenchido = desabilitado, com este motivo. */
  motivo?: string
  /** Separador antes deste item. */
  separar?: boolean
}

const classeItem = 'data-[highlighted]:bg-accent flex w-full cursor-pointer items-start gap-2.5 rounded-md px-3 py-2 text-left text-sm outline-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 [&_svg]:mt-0.5 [&_svg]:size-4'
const classeConteudo = 'bg-popover text-popover-foreground shadow-campo z-50 min-w-52 rounded-md p-1'

function Itens({ acoes, Item, Separador }: { acoes: AcaoMenu[]; Item: typeof ContextMenu.Item | typeof DropdownMenu.Item; Separador: typeof ContextMenu.Separator | typeof DropdownMenu.Separator }) {
  return (
    <>
      {acoes.map((a, i) => (
        <div key={a.rotulo} className="contents">
          {a.separar && i > 0 && <Separador className="bg-border my-1 h-px" />}
          <Item disabled={!!a.motivo} onSelect={a.onSelecionar} className={cn(classeItem, a.perigo && 'text-destructive-text')}>
            {a.icone && <span className={a.perigo ? 'text-destructive-text' : 'text-muted-foreground'}>{a.icone}</span>}
            <span className="min-w-0 flex-1">
              <span className="block">{a.rotulo}</span>
              {a.motivo && <span className="text-muted-foreground block text-xs">{a.motivo}</span>}
            </span>
          </Item>
        </div>
      ))}
    </>
  )
}

export function MenuContexto({ acoes, children, rotulo = 'Ações' }: { acoes: AcaoMenu[]; children: ReactNode; rotulo?: string }) {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>{children}</ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content aria-label={rotulo} className={classeConteudo}>
          <Itens acoes={acoes} Item={ContextMenu.Item} Separador={ContextMenu.Separator} />
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  )
}

/** O mesmo menu num botão "⋯" (para teclado, toque e quem não sabe do botão direito). */
export function BotaoAcoes({ acoes, rotulo = 'Mais ações', className }: { acoes: AcaoMenu[]; rotulo?: string; className?: string }) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button type="button" aria-label={rotulo} className={cn('text-muted-foreground hover:bg-sunken hover:text-foreground flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full', className)}>
          <DotsThreeIcon className="size-4" weight="bold" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="end" sideOffset={4} className={classeConteudo}>
          <Itens acoes={acoes} Item={DropdownMenu.Item} Separador={DropdownMenu.Separator} />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

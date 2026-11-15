import { Dialog as SheetPrimitive } from 'radix-ui'
import { XIcon } from '@phosphor-icons/react'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'
import { AreaRolagem } from './area-rolagem'

/** Gaveta lateral (ex.: gaveta do chat, subplano 03, 2.5). */
export const Sheet = SheetPrimitive.Root
export const SheetTrigger = SheetPrimitive.Trigger
export const SheetClose = SheetPrimitive.Close

export function SheetContent({
  className,
  children,
  lado = 'direita',
  ...props
}: ComponentProps<typeof SheetPrimitive.Content> & { lado?: 'direita' | 'esquerda' | 'baixo' }) {
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Overlay className="fixed inset-0 z-50 bg-black/30" />
      <SheetPrimitive.Content
        className={cn(
          'bg-popover text-popover-foreground fixed z-50 flex w-full flex-col gap-4 shadow-lg',
          // Folha inferior (celular): seletores e escolhas rápidas; com teto de altura e o polegar ao alcance.
          lado === 'baixo' ? 'inset-x-0 bottom-0 max-h-[85dvh] rounded-t-xl border-t pb-[env(safe-area-inset-bottom,0px)]' : 'inset-y-0 sm:max-w-md',
          lado === 'direita' && 'right-0 border-l',
          lado === 'esquerda' && 'left-0 border-r',
          className,
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close className="text-muted-foreground hover:text-foreground absolute top-4 right-4 cursor-pointer rounded-sm">
          <XIcon className="size-4" />
          <span className="sr-only">Fechar</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  )
}

/** Corpo da gaveta: rola entre o cabeçalho e o rodapé, com o esmaecido. */
export function SheetCorpo({ className, ...props }: ComponentProps<'div'>) {
  return <AreaRolagem className={cn('flex flex-1 flex-col gap-5 p-4', className)} {...props} />
}

export function SheetHeader({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('flex flex-col gap-1 border-b p-4 pr-10', className)} {...props} />
}

export function SheetTitle({ className, ...props }: ComponentProps<typeof SheetPrimitive.Title>) {
  return <SheetPrimitive.Title className={cn('font-semibold', className)} {...props} />
}

export function SheetDescription({ className, ...props }: ComponentProps<typeof SheetPrimitive.Description>) {
  return <SheetPrimitive.Description className={cn('text-muted-foreground text-sm', className)} {...props} />
}

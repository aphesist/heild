import { DesktopIcon } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import { useModoLateral } from '@/hooks/useMedia'
import { cn } from '@/lib/utils'

/**
 * "Edite no computador" (S01-A07; 03, 2.6): no celular, decisão em um toque;
 * configuração e edição longa ficam para o computador. A tela continua
 * visível, só leitura (campos e botões não respondem; a rolagem funciona).
 * Use em volta de qualquer tela de configuração: `<SoLeituraNoCelular>`.
 */
export function useCelular() {
  return useModoLateral() === 'gaveta'
}

export function AvisoEditeNoComputador({ className, texto }: { className?: string; texto?: string }) {
  return (
    <div role="note" className={cn('bg-sunken flex items-start gap-3 rounded-[16px] px-4 py-3 text-sm', className)}>
      <DesktopIcon className="text-muted-foreground mt-0.5 size-5 shrink-0" weight="duotone" />
      <p>
        <strong className="font-medium">Edite no computador.</strong> {texto ?? 'No celular esta tela é só leitura: dá para conferir, não para mudar.'}
      </p>
    </div>
  )
}

export function SoLeituraNoCelular({ children, texto, ativo = true }: { children: ReactNode; texto?: string; ativo?: boolean }) {
  const celular = useCelular()
  if (!celular || !ativo) return <>{children}</>
  return (
    <div className="flex h-full min-h-0 flex-col" data-so-leitura>
      <AvisoEditeNoComputador className="mx-3 mt-2 mb-1 shrink-0" texto={texto} />
      <div aria-readonly className="min-h-0 flex-1 [&_button:not([data-leitura-livre])]:pointer-events-none [&_input]:pointer-events-none [&_select]:pointer-events-none [&_textarea]:pointer-events-none [&_[role=switch]]:pointer-events-none">
        {children}
      </div>
    </div>
  )
}

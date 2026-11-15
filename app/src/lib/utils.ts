import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'
import { Children, isValidElement, type ReactNode } from 'react'

/**
 * Uma altura fixa passada por fora (`h-7`) também tira a altura mínima da
 * base (`min-h-8` do botão), para o botão pequeno continuar pequeno.
 */
const twMerge = extendTailwindMerge({ extend: { conflictingClassGroups: { h: ['min-h'], size: ['min-h'] } } })

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Texto corrido de um nó React (para o `title` de quem trunca). */
export function textoDoNo(no: ReactNode): string {
  let t = ''
  Children.forEach(no, (f) => {
    if (typeof f === 'string' || typeof f === 'number') t += f
    else if (isValidElement<{ children?: ReactNode }>(f)) t += textoDoNo(f.props.children)
  })
  return t.replace(/\s+/g, ' ').trim()
}

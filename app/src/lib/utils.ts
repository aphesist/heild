import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/**
 * Uma altura fixa passada por fora (`h-7`) também tira a altura mínima da
 * base (`min-h-8` do botão), para o botão pequeno continuar pequeno.
 */
const twMerge = extendTailwindMerge({ extend: { conflictingClassGroups: { h: ['min-h'], size: ['min-h'] } } })

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

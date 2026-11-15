import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Página em duas pilhas (PADRAO_DE_INTERFACE.md, 5 "Fora da grade de widgets"):
 * cada coluna é uma pilha de cards com a altura do que carregam, alinhadas pelo
 * topo; nenhum card estica para fechar o vão do vizinho. Com `lateral`, a coluna
 * da direita é a lateral (resumo, ajuda, ações): mais estreita e presa ao topo ao
 * rolar, para ficar à vista em vez de deixar o vão. No celular, uma coluna só,
 * a da esquerda primeiro.
 */
export function DuasPilhas({ esquerda, direita, lateral, className }: { esquerda: ReactNode; direita: ReactNode; lateral?: boolean; className?: string }) {
  return (
    <div className={cn('grid items-start gap-4', lateral ? 'lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]' : 'lg:grid-cols-2', className)}>
      <div className="flex min-w-0 flex-col gap-4">{esquerda}</div>
      <div className={cn('flex min-w-0 flex-col gap-4', lateral && 'lg:sticky lg:top-0')}>{direita}</div>
    </div>
  )
}

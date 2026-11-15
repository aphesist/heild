import { ArrowClockwiseIcon, CircleNotchIcon, WarningCircleIcon, type Icon } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Os três estados de qualquer lista ou tela que carrega dados: vazio,
 * carregando e erro. Use sempre estes (não desenhe outro "nada aqui"): a
 * mesma cara em todo o sistema, com a ação que resolve.
 */

export function EstadoVazio({ icone: Icone, titulo, descricao, acao, className, compacto }: { icone?: Icon; titulo: string; descricao?: ReactNode; acao?: ReactNode; className?: string; compacto?: boolean }) {
  return (
    <div role="status" data-estado-vazio className={cn('flex flex-col items-center justify-center gap-2 text-center', compacto ? 'px-4 py-6' : 'px-6 py-12', className)}>
      {Icone && (
        <span className="bg-sunken text-muted-foreground flex size-11 items-center justify-center rounded-full">
          <Icone className="size-5" aria-hidden />
        </span>
      )}
      <p className="text-sm font-medium text-balance">{titulo}</p>
      {descricao && <p className="text-muted-foreground max-w-sm text-sm text-pretty">{descricao}</p>}
      {acao && <div className="mt-2">{acao}</div>}
    </div>
  )
}

export function Carregando({ rotulo = 'Carregando', linhas, className }: { rotulo?: string; linhas?: number; className?: string }) {
  if (linhas)
    return (
      <div role="status" aria-label={rotulo} className={cn('flex flex-col gap-2', className)}>
        {Array.from({ length: linhas }, (_, i) => (
          <div key={i} className="bg-sunken h-12 animate-pulse rounded-md motion-reduce:animate-none" style={{ animationDelay: `${i * 90}ms` }} />
        ))}
      </div>
    )
  return (
    <div role="status" className={cn('text-muted-foreground flex items-center justify-center gap-2 px-6 py-12 text-sm', className)}>
      <CircleNotchIcon className="size-4 animate-spin motion-reduce:animate-none" aria-hidden /> {rotulo}…
    </div>
  )
}

export function EstadoErro({ titulo = 'Não deu certo', descricao, onTentar, className }: { titulo?: string; descricao?: ReactNode; onTentar?: () => void; className?: string }) {
  return (
    <div role="alert" className={cn('flex flex-col items-center justify-center gap-2 px-6 py-12 text-center', className)}>
      <span className="bg-destructive/15 text-destructive flex size-11 items-center justify-center rounded-full">
        <WarningCircleIcon className="size-5" aria-hidden />
      </span>
      <p className="text-sm font-medium text-balance">{titulo}</p>
      {descricao && <p className="text-muted-foreground max-w-sm text-sm text-pretty">{descricao}</p>}
      {onTentar && (
        <Button variant="outline" size="sm" className="mt-2 rounded-full" onClick={onTentar}>
          <ArrowClockwiseIcon /> Tentar de novo
        </Button>
      )}
    </div>
  )
}

/** Mostra carregando, erro ou vazio conforme o caso, e o conteúdo quando há dados. */
export function Estados<T>({ carregando, erro, itens, vazio, onTentar, children }: { carregando?: boolean; erro?: string | null; itens: T[]; vazio: ReactNode; onTentar?: () => void; children: (itens: T[]) => ReactNode }) {
  if (carregando) return <Carregando linhas={3} />
  if (erro) return <EstadoErro descricao={erro} onTentar={onTentar} />
  if (!itens.length) return <>{vazio}</>
  return <>{children(itens)}</>
}

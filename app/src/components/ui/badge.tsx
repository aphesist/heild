import { cva, type VariantProps } from 'class-variance-authority'
import { Children, isValidElement, type ComponentProps, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export const badgeVariants = cva(
  'inline-flex w-fit max-w-full min-w-0 shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium [&_svg]:size-3 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        neutro: 'border-transparent bg-sunken text-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        outline: 'text-foreground',
        destaque: 'border-transparent bg-warning/15 text-foreground [&_svg]:text-warning',
        sucesso: 'border-transparent bg-success/15 text-foreground [&_svg]:text-success',
        erro: 'border-transparent bg-destructive/15 text-foreground [&_svg]:text-destructive',
      },
    },
    defaultVariants: { variant: 'secondary' },
  },
)

/** Texto corrido dos filhos (para o `title` quando o selo trunca). */
function textoDe(filhos: ReactNode): string {
  let t = ''
  Children.forEach(filhos, (f) => {
    if (typeof f === 'string' || typeof f === 'number') t += f
    else if (isValidElement<{ children?: ReactNode }>(f)) t += textoDe(f.props.children)
  })
  return t.replace(/\s+/g, ' ').trim()
}

/**
 * Selo de estado (cores.md: fundo do estado a 15%, texto em `texto`, ícone na cor
 * do estado). Nunca passa da largura do contêiner: sem lugar, o texto trunca com
 * reticências e o selo inteiro vai no `title` (INVENTARIO_UI.md, 9).
 */
export function Badge({ className, variant, children, title, ...props }: ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  const partes: ReactNode[] = []
  let texto: ReactNode[] = []
  const fechar = () => {
    if (texto.length) partes.push(<span key={`t${partes.length}`} className="min-w-0 truncate">{texto}</span>)
    texto = []
  }
  for (const f of Children.toArray(children)) {
    if (typeof f === 'string' || typeof f === 'number') texto.push(f)
    else {
      fechar()
      partes.push(f)
    }
  }
  fechar()
  return (
    <span data-slot="badge" title={title ?? (textoDe(children) || undefined)} className={cn(badgeVariants({ variant }), className)} {...props}>
      {partes}
    </span>
  )
}

/** Bolinha de contagem (abas, sino). Zero não mostra nada (subplano 03, 2.3). */
export function Contador({ valor, className }: { valor: number; className?: string }) {
  if (!valor) return null
  return (
    <span
      className={cn(
        'bg-destructive text-destructive-foreground inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] leading-none font-semibold tabular-nums',
        className,
      )}
    >
      {valor > 99 ? '99+' : valor}
    </span>
  )
}

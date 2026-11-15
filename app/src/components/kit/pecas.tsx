import { CheckCircleIcon, InfoIcon, MagnifyingGlassIcon, WarningCircleIcon, WarningIcon, XIcon } from '@phosphor-icons/react'
import { useId, type ComponentProps, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Peças pequenas que as telas faziam à mão de vários jeitos (INVENTARIO_UI.md,
 * seções 1, 4 e 6): o bloco dentro do card, o aviso de tom, o número (KPI), a
 * busca e o controle deslizante. Uma forma só, com os tokens do tema.
 */

/* ---------- Bloco: a caixa dentro do card ---------- */

/** Bloco dentro do card (camada abaixo ou acima do cartão), com o raio aninhado (raio-lg, 17px, dentro do cartão de 20px). */
export function Bloco({ tom = 'rebaixada', className, ...props }: { tom?: 'rebaixada' | 'elevada' } & ComponentProps<'div'>) {
  return <div className={cn('flex min-w-0 flex-col gap-2 rounded-lg p-3', tom === 'rebaixada' ? 'bg-sunken' : 'bg-raised shadow-contorno', className)} {...props} />
}

/* ---------- Aviso: faixa de tom com ícone e ação ---------- */

export type TomAviso = 'neutro' | 'atencao' | 'sucesso' | 'erro'
const fundoAviso: Record<TomAviso, string> = { neutro: 'bg-sunken', atencao: 'bg-warning/10', sucesso: 'bg-success/10', erro: 'bg-destructive/10' }
const iconeAviso: Record<TomAviso, ReactNode> = {
  neutro: <InfoIcon className="text-muted-foreground size-4" aria-hidden />,
  atencao: <WarningIcon className="text-warning size-4" aria-hidden />,
  sucesso: <CheckCircleIcon className="text-success size-4" aria-hidden />,
  erro: <WarningCircleIcon className="text-destructive size-4" aria-hidden />,
}

/** Aviso de tom (cores.md: o estado vai com palavra e ícone, o texto fica em `texto`). A ação desce de linha quando não cabe. */
export function Aviso({ tom = 'neutro', icone, acao, children, className }: { tom?: TomAviso; icone?: ReactNode; acao?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div role={tom === 'erro' || tom === 'atencao' ? 'status' : undefined} className={cn('flex flex-wrap items-start gap-x-3 gap-y-2 rounded-lg px-3 py-2 text-sm', fundoAviso[tom], className)}>
      <span className="flex min-w-0 grow basis-40 items-start gap-2">
        <span className="mt-0.5 shrink-0">{icone ?? iconeAviso[tom]}</span>
        <span className="min-w-0 text-pretty">{children}</span>
      </span>
      {acao && <span className="ml-auto flex shrink-0 items-center gap-2">{acao}</span>}
    </div>
  )
}

/* ---------- Kpi: o número que decide ou dá contexto ---------- */

/**
 * Número com rótulo (tipografia.md: `numero-grande` 36/300 quando decide; 24/300
 * quando é contexto, PADRAO_DE_INTERFACE.md, 6). Com `onClick`, vira filtro
 * (aria-pressed). O estado vai com palavra no rótulo ou no detalhe, nunca só na cor.
 */
export function Kpi({ valor, rotulo, detalhe, tamanho = 'grande', tom = 'neutro', pressionado, onClick, className }: { valor: ReactNode; rotulo: ReactNode; detalhe?: ReactNode; tamanho?: 'grande' | 'medio'; tom?: 'neutro' | 'atencao' | 'erro'; pressionado?: boolean; onClick?: () => void; className?: string }) {
  const corpo = (
    <>
      <span className={cn('font-heading min-w-0 font-light tabular-nums leading-none', tamanho === 'grande' ? 'text-4xl' : 'text-2xl', tom === 'atencao' && 'text-warning', tom === 'erro' && 'text-destructive')}>{valor}</span>
      <span className="text-muted-foreground min-w-0 text-xs text-pretty">{rotulo}</span>
      {detalhe && <span className="text-muted-foreground min-w-0 text-xs text-pretty">{detalhe}</span>}
    </>
  )
  if (onClick)
    return (
      <button type="button" aria-pressed={pressionado} onClick={onClick} className={cn('flex min-w-0 cursor-pointer flex-col items-start gap-1 rounded-lg p-3 text-left transition-colors', pressionado ? 'bg-raised shadow-cartao' : 'hover:bg-sunken/60', className)}>
        {corpo}
      </button>
    )
  return <div className={cn('flex min-w-0 flex-col gap-1', className)}>{corpo}</div>
}

/* ---------- Busca ---------- */

/** Campo de busca em pílula, com a lupa e o botão de limpar. */
export function Busca({ valor, onMudar, rotulo = 'Buscar', placeholder = 'Buscar', className, autoFocus }: { valor: string; onMudar: (v: string) => void; rotulo?: string; placeholder?: string; className?: string; autoFocus?: boolean }) {
  return (
    <label className={cn('bg-raised shadow-contorno focus-within:ring-ring/50 flex h-9 min-w-0 items-center gap-2 rounded-full px-3 text-sm focus-within:ring-2', className)}>
      <MagnifyingGlassIcon className="text-muted-foreground size-4 shrink-0" aria-hidden />
      <input type="search" aria-label={rotulo} value={valor} onChange={(e) => onMudar(e.target.value)} placeholder={placeholder} autoFocus={autoFocus} className="placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent outline-none [&::-webkit-search-cancel-button]:hidden" />
      {valor && (
        <button type="button" onClick={() => onMudar('')} aria-label="Limpar a busca" className="text-muted-foreground hover:text-foreground -mr-1 cursor-pointer rounded-full p-1">
          <XIcon className="size-3.5" />
        </button>
      )}
    </label>
  )
}

/* ---------- Deslizante ---------- */

/** Controle deslizante com rótulo associado e o valor à vista (o range sozinho não dizia o que mede). */
export function Deslizante({ rotulo, valor, onMudar, min = 0, max = 100, passo = 1, formatar = String, desabilitado, className }: { rotulo: string; valor: number; onMudar: (v: number) => void; min?: number; max?: number; passo?: number; formatar?: (v: number) => string; desabilitado?: boolean; className?: string }) {
  const id = useId()
  return (
    <div className={cn('flex min-w-0 flex-col gap-1', className)}>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <label htmlFor={id} className="min-w-0">
          {rotulo}
        </label>
        <output htmlFor={id} className="shrink-0 tabular-nums">
          {formatar(valor)}
        </output>
      </div>
      <input id={id} type="range" min={min} max={max} step={passo} value={valor} disabled={desabilitado} onChange={(e) => onMudar(Number(e.target.value))} className="accent-foreground h-6 w-full cursor-pointer disabled:cursor-not-allowed disabled:opacity-50" />
    </div>
  )
}

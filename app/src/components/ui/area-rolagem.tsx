import { useEffect, useRef, type ComponentProps, type ElementType, type Ref } from 'react'
import { medirAreaRolagem } from '@/lib/esmaecer-rolagem'
import { cn } from '@/lib/utils'

export type EixoRolagem = 'y' | 'x' | 'ambos'

const classesDoEixo: Record<EixoRolagem, string> = {
  // Vertical: topo e fim esmaecem (44px) quando há conteúdo para aquele lado; o lado nunca rola.
  y: 'area-rolagem-dupla min-h-0 overflow-x-hidden overflow-y-auto',
  // Horizontal: as bordas esmaecem 24px quando há mais conteúdo daquele lado.
  x: 'esmaecer-lados min-w-0 overflow-x-auto overflow-y-hidden',
  // As duas direções (tabela larga com cabeçalho fixo).
  ambos: 'area-rolagem-ambos min-h-0 min-w-0 overflow-auto',
}

type Props<T extends ElementType> = {
  /** Direção da rolagem (padrão: vertical). */
  eixo?: EixoRolagem
  /** Elemento que rola (padrão: div). */
  as?: T
  ref?: Ref<HTMLElement>
} & Omit<ComponentProps<T>, 'as' | 'ref'>

/**
 * A primitiva única de rolagem do sistema. Toda área que rola (página, card,
 * tabela com cabeçalho fixo, lista, gaveta, modal, abas, faixa lateral) passa
 * por aqui, e o esmaecido vem sempre junto: o topo e o fim (ou os lados)
 * esmaecem quando há conteúdo para aquele lado, e parado nada é cortado.
 * Com cabeçalho fixo dentro (marque com `data-cabecalho-fixo`), o esmaecido
 * começa abaixo dele. A regra `scripts/regra-rolagem.cjs` acusa qualquer
 * `overflow-*-auto`/`overflow-scroll` fora deste arquivo.
 */
export function AreaRolagem<T extends ElementType = 'div'>({ eixo = 'y', as, className, ref, ...props }: Props<T>) {
  const Comp: ElementType = as ?? 'div'
  const interno = useRef<HTMLElement | null>(null)
  useEffect(() => {
    const el = interno.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const medir = () => medirAreaRolagem(el)
    const ro = new ResizeObserver(medir)
    ro.observe(el)
    // O conteúdo que cresce ou encolhe (a lista que chega, a tabela que ganha linhas) muda o que há para rolar.
    for (const filho of el.children) ro.observe(filho)
    medir()
    return () => ro.disconnect()
  })
  const juntarRef = (no: HTMLElement | null) => {
    interno.current = no
    if (typeof ref === 'function') ref(no)
    else if (ref) (ref as { current: HTMLElement | null }).current = no
  }
  return <Comp ref={juntarRef} data-area-rolagem={eixo} {...(eixo !== 'y' ? { 'data-rolagem-horizontal': '' } : {})} className={cn(classesDoEixo[eixo], className)} {...props} />
}

import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { useTamanhoWidget } from '@/components/widgets/widget'
import type { TamanhoWidget } from '@/components/widgets/tipos'
import { AreaRolagem } from '@/components/ui/area-rolagem'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

/**
 * Contrato de transbordo das listas dos widgets (PADRAO_DE_INTERFACE.md, 3):
 *   - mostra até o teto do tamanho (P 3, M 5, G 8, L 5, XL 12 itens), dentro do
 *     corpo do widget, que rola com o esmaecido quando passa da altura;
 *   - além do teto, "Ver todos (N)" abre a lista completa numa gaveta;
 *   - na gaveta, acima de 150 itens, só a janela visível é desenhada (virtualização);
 *   - com 0, o estado vazio com a próxima ação.
 * Nada cresce sem limite nem corta seco.
 */
export const TETO_ITENS: Record<TamanhoWidget, number> = { P: 3, M: 5, G: 8, L: 5, XL: 12 }

export function ListaComTeto<T>({
  itens,
  render,
  chave,
  titulo,
  descricao,
  vazio,
  teto,
  className,
  classeLista = 'divide-border/70 flex flex-col divide-y',
}: {
  itens: T[]
  render: (item: T, i: number) => ReactNode
  chave: (item: T, i: number) => string
  /** Título da gaveta da lista completa (o do widget). */
  titulo: string
  descricao?: string
  /** Estado vazio (EstadoVazio compacto com a próxima ação). */
  vazio: ReactNode
  /** Teto próprio; sem ele, o do tamanho do widget. */
  teto?: number
  className?: string
  classeLista?: string
}) {
  const tamanho = useTamanhoWidget()
  const limite = teto ?? TETO_ITENS[tamanho] ?? 8
  const [aberta, setAberta] = useState(false)
  if (!itens.length) return <>{vazio}</>
  const mostrados = itens.slice(0, limite)
  return (
    <div className={cn('flex min-w-0 flex-col gap-2', className)}>
      <ul className={classeLista}>
        {mostrados.map((it, i) => (
          <li key={chave(it, i)} className="min-w-0">
            {render(it, i)}
          </li>
        ))}
      </ul>
      {itens.length > limite && (
        <Button variant="ghost" size="sm" className="self-start rounded-full" onClick={() => setAberta(true)}>
          Ver todos ({itens.length.toLocaleString('pt-BR')})
        </Button>
      )}
      {aberta && (
        <Sheet open onOpenChange={(v) => !v && setAberta(false)}>
          <SheetContent className="gap-0 sm:max-w-xl">
            <SheetHeader>
              <SheetTitle>
                {titulo} · {itens.length.toLocaleString('pt-BR')}
              </SheetTitle>
              {descricao && <SheetDescription>{descricao}</SheetDescription>}
            </SheetHeader>
            <ListaVirtual itens={itens} render={render} chave={chave} classeLista={classeLista} />
          </SheetContent>
        </Sheet>
      )}
    </div>
  )
}

/** Lista que só desenha a janela visível quando passa de 150 itens (altura média medida nas primeiras linhas). */
export function ListaVirtual<T>({ itens, render, chave, classeLista, acima = 150 }: { itens: T[]; render: (item: T, i: number) => ReactNode; chave: (item: T, i: number) => string; classeLista?: string; acima?: number }) {
  const area = useRef<HTMLElement | null>(null)
  const [janela, setJanela] = useState({ ini: 0, fim: Math.min(itens.length, 60), altura: 56 })
  const virtual = itens.length > acima
  useLayoutEffect(() => {
    const el = area.current
    if (!el || !virtual) return
    const medir = () => {
      const lis = el.querySelectorAll<HTMLElement>('li[data-indice]')
      let altura = janela.altura
      if (lis.length) altura = Math.max(24, [...lis].reduce((s, l) => s + l.offsetHeight, 0) / lis.length)
      const ini = Math.max(0, Math.floor(el.scrollTop / altura) - 10)
      const fim = Math.min(itens.length, ini + Math.ceil(el.clientHeight / altura) + 20)
      setJanela((j) => (j.ini === ini && j.fim === fim && Math.abs(j.altura - altura) < 1 ? j : { ini, fim, altura }))
    }
    medir()
    el.addEventListener('scroll', medir, { passive: true })
    return () => el.removeEventListener('scroll', medir)
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [virtual, itens.length])
  const ini = virtual ? janela.ini : 0
  const fim = virtual ? janela.fim : itens.length
  return (
    <AreaRolagem ref={area} className="flex-1 p-4">
      {virtual && <div aria-hidden style={{ height: ini * janela.altura }} />}
      <ul className={classeLista} aria-rowcount={itens.length}>
        {itens.slice(ini, fim).map((it, k) => (
          <li key={chave(it, ini + k)} data-indice={ini + k} className="min-w-0">
            {render(it, ini + k)}
          </li>
        ))}
      </ul>
      {virtual && <div aria-hidden style={{ height: (itens.length - fim) * janela.altura }} />}
    </AreaRolagem>
  )
}

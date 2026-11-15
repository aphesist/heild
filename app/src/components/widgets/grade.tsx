import { DndContext, DragOverlay, KeyboardSensor, PointerSensor, TouchSensor, closestCenter, useSensor, useSensors, type DragEndEvent, type DragOverEvent, type DragStartEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable'
import { ArrowCounterClockwiseIcon, CheckIcon, PencilSimpleIcon, PlusIcon } from '@phosphor-icons/react'
import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { usePreferencia } from '@/hooks/usePreferencia'
import { cn } from '@/lib/utils'
import { arranjar, dimensoes, MODULO_PX, modulosPorCelula, tamanhoValido, vao, VAO_PX, type DefWidget, type ItemGrade, type Posicao, type TamanhoWidget } from './tipos'
import { Widget } from './widget'

/**
 * Colunas pela largura do contêiner, com célula de no mínimo ~150px
 * (PADRAO_DE_INTERFACE.md, 1): 2 no celular, 4 no tablet e no computador
 * pequeno, 6 no computador, 8 no largo.
 */
function colunasPara(largura: number) {
  if (largura < 600) return 2
  if (largura < 980) return 4
  if (largura < 1320) return 6
  return 8
}

function useColunas() {
  const ref = useRef<HTMLDivElement>(null)
  const [medida, setMedida] = useState({ colunas: 6, largura: 0, celula: 156 })
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const medir = () => {
      const celula = parseFloat(getComputedStyle(el).getPropertyValue('--celula-widget')) || 156
      setMedida((m) => (m.largura === el.clientWidth && m.celula === celula ? m : { colunas: colunasPara(el.clientWidth), largura: el.clientWidth, celula }))
    }
    medir()
    const ro = new ResizeObserver(medir)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return { ref, ...medida }
}

/**
 * Mede quanto cada widget pede de altura, em módulos (PADRAO_DE_INTERFACE.md, 3):
 * solta o corpo do widget da altura da grade por um instante, lê a altura
 * natural do conteúdo e devolve tudo no mesmo quadro (nada pisca). Mede de
 * novo quando a largura muda, quando o conteúdo de algum widget muda e
 * quando as fontes terminam de carregar.
 */
function useAlturas(ref: React.RefObject<HTMLDivElement | null>, chaveLayout: string) {
  const [alturas, setAlturas] = useState<ReadonlyMap<string, number>>(() => new Map())
  const medir = useRef<() => void>(() => {})
  function medirAgora() {
    const grade = ref.current
    if (!grade) return
    const itens = [...grade.querySelectorAll<HTMLElement>(':scope > [data-item-grade]')]
    const partes = itens.map((el) => {
      const art = el.querySelector<HTMLElement>('article')
      const corpo = el.querySelector<HTMLElement>('[data-corpo-widget]')
      return { id: el.dataset.itemGrade!, art, corpo }
    })
    for (const { corpo } of partes) {
      if (!corpo) continue
      corpo.style.flex = 'none'
      corpo.style.height = 'auto'
      corpo.style.overflow = 'visible'
    }
    const novo = new Map<string, number>()
    for (const { id, art, corpo } of partes) {
      if (!art || !corpo) continue
      const a = getComputedStyle(art)
      const cabecalho = art.querySelector('header')?.offsetHeight ?? 0
      const total = parseFloat(a.paddingTop) + parseFloat(a.paddingBottom) + cabecalho + (parseFloat(a.rowGap) || 0) + corpo.offsetHeight
      novo.set(id, Math.ceil((total + VAO_PX) / MODULO_PX))
    }
    for (const { corpo } of partes) {
      if (!corpo) continue
      corpo.style.removeProperty('flex')
      corpo.style.removeProperty('height')
      corpo.style.removeProperty('overflow')
    }
    setAlturas((ant) => (ant.size === novo.size && [...novo].every(([k, v]) => ant.get(k) === v) ? ant : novo))
  }
  // A cada render (itens, tamanhos, colunas): atualiza a medida e mede antes de pintar.
  useLayoutEffect(() => {
    medir.current = medirAgora
    medirAgora()
  })
  useEffect(() => {
    const grade = ref.current
    if (!grade) return
    let t: number | undefined
    let quadro: number | undefined
    const agendar = () => {
      if (t !== undefined) return
      t = window.setTimeout(() => {
        t = undefined
        quadro = requestAnimationFrame(() => medir.current())
      }, 120)
    }
    const mo = new MutationObserver(agendar)
    mo.observe(grade, { childList: true, subtree: true, characterData: true })
    document.fonts?.ready.then(agendar).catch(() => {})
    return () => {
      mo.disconnect()
      window.clearTimeout(t)
      if (quadro) cancelAnimationFrame(quadro)
    }
  }, [ref, chaveLayout])
  return alturas
}

/** Abre o modo edição com um toque longo (como no celular). */
function useToqueLongo(ativar: () => void, ms = 550) {
  const t = useRef<number | undefined>(undefined)
  const inicio = useRef<{ x: number; y: number } | null>(null)
  const cancelar = () => {
    window.clearTimeout(t.current)
    inicio.current = null
  }
  return {
    onPointerDown: (e: React.PointerEvent) => {
      if ((e.target as HTMLElement).closest('button, a, input, select, textarea, [role="radio"]')) return
      inicio.current = { x: e.clientX, y: e.clientY }
      t.current = window.setTimeout(ativar, ms)
    },
    onPointerMove: (e: React.PointerEvent) => {
      if (inicio.current && Math.hypot(e.clientX - inicio.current.x, e.clientY - inicio.current.y) > 8) cancelar()
    },
    onPointerUp: cancelar,
    onPointerLeave: cancelar,
  }
}

interface Props {
  /** Chave para guardar o arranjo do usuário (uma por tela). */
  chave: string
  catalogo: DefWidget[]
  padrao: ItemGrade[]
  /** Conteúdo à esquerda da barra de edição (ex.: título da tela). */
  titulo?: ReactNode
  className?: string
}

/**
 * Grade de widgets personalizável. O tamanho (P, M, G, L, XL) dá a largura e
 * o teto de altura; a altura de verdade é a que o conteúdo pede (medida em
 * módulos de meia célula). `arranjar` põe cada um no primeiro lugar livre, na
 * ordem da lista, e nenhum widget estica para fechar vão. Modo edição:
 * arrastar para trocar de lugar (mouse, toque, teclado), mudar o tamanho,
 * esconder, adicionar pela galeria, restaurar; o arranjo é o mesmo de fora.
 * O arranjo fica salvo por tela (em produção, `usuario.preferencias`, 03 4.3).
 */
export function GradeWidgets({ chave, catalogo, padrao, titulo, className }: Props) {
  const [salvo, setSalvo] = usePreferencia<ItemGrade[] | null>(`ui-lab:widgets:${chave}`, null)
  // Descarta o que saiu do catálogo e corrige tamanhos que o widget não aceita.
  const itens = (salvo ?? padrao).flatMap((i) => {
    const def = catalogo.find((d) => d.id === i.id)
    return def ? [{ ...i, tamanho: tamanhoValido(def, i.tamanho) }] : []
  })
  const setItens = (f: (xs: ItemGrade[]) => ItemGrade[]) => setSalvo(f(itens))
  const [editando, setEditando] = useState(false)
  const [galeria, setGaleria] = useState(false)
  const [ativo, setAtivo] = useState<string | null>(null)
  const { ref, colunas, largura, celula } = useColunas()
  const reduzir = useReducedMotion()
  const toqueLongo = useToqueLongo(() => setEditando(true))

  useEffect(() => {
    if (!editando) return
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && !galeria && setEditando(false)
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [editando, galeria])

  const sensores = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const defDe = (id: string) => catalogo.find((d) => d.id === id)!
  const alturas = useAlturas(ref, `${colunas}`)
  const mpc = modulosPorCelula(celula)
  // Colunas que a largura mínima do conteúdo pede (kanban, calendário da semana): a largura inteira só quando o conteúdo precisa.
  const colunasMinimas = new Map<string, number>()
  if (largura) {
    const larguraColuna = (largura - (colunas - 1) * VAO_PX) / colunas
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
    for (const d of catalogo) if (d.larguraMinima) colunasMinimas.set(d.id, Math.ceil((d.larguraMinima * rem + VAO_PX) / (larguraColuna + VAO_PX)))
  }
  // Posição explícita de cada widget: tamanho pelo conteúdo, vãos fechados pela ordem e pelo empacotamento (o mesmo no modo edição).
  // O arranjo só muda quando muda o que ele lê (itens, tamanhos, alturas, colunas): não refaz a cada render.
  const assinatura = JSON.stringify([itens, colunas, mpc, [...alturas], [...colunasMinimas]])
  // oxlint-disable-next-line react-hooks/exhaustive-deps
  const posicoes = useMemo(() => arranjar(itens.map((i) => ({ ...i, def: defDe(i.id) })), colunas, { alturas, colunasMinimas, modulosPorCelula: mpc }), [assinatura])
  const ocultos = catalogo.filter((d) => !itens.some((i) => i.id === d.id))

  // Troca de lugar ao vivo enquanto arrasta; a grade reflui e o motion anima.
  const aoPassar = (e: DragOverEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    setItens((xs) => {
      const de = xs.findIndex((x) => x.id === active.id)
      const para = xs.findIndex((x) => x.id === over.id)
      return de < 0 || para < 0 ? xs : arrayMove(xs, de, para)
    })
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="flex flex-wrap items-center gap-2">
        <div className="min-w-0 flex-1">{titulo}</div>
        {editando ? (
          <>
            <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setSalvo(null)}>
              <ArrowCounterClockwiseIcon /> Restaurar padrão
            </Button>
            <Button size="sm" variant="outline" className="rounded-full" onClick={() => setGaleria(true)} disabled={!ocultos.length}>
              <PlusIcon /> Adicionar widget
            </Button>
            <Button size="sm" className="rounded-full" onClick={() => setEditando(false)}>
              <CheckIcon weight="bold" /> Concluir
            </Button>
          </>
        ) : (
          <Button size="sm" variant="ghost" className="text-muted-foreground rounded-full" onClick={() => setEditando(true)}>
            <PencilSimpleIcon /> Editar painel
          </Button>
        )}
      </div>

      {editando && <p className="text-muted-foreground -mt-1 text-xs">Arraste para trocar de lugar · escolha o tamanho no canto · o botão de menos esconde · Esc conclui</p>}

      <DndContext
        sensors={sensores}
        collisionDetection={closestCenter}
        onDragStart={(e: DragStartEvent) => setAtivo(String(e.active.id))}
        onDragOver={aoPassar}
        onDragEnd={(_e: DragEndEvent) => setAtivo(null)}
        onDragCancel={() => setAtivo(null)}
      >
        <SortableContext items={itens.map((i) => i.id)} strategy={() => null}>
          <div
            ref={ref}
            {...(editando ? {} : toqueLongo)}
            className="grid gap-x-4"
            style={{ gridTemplateColumns: `repeat(${colunas}, minmax(0, 1fr))`, gridAutoRows: 'var(--modulo-widget)' }}
          >
            {itens.map((item) => (
              <ItemSortavel
                key={item.id}
                item={item}
                def={defDe(item.id)}
                posicao={posicoes.get(item.id)!}
                editando={editando}
                arrastando={ativo === item.id}
                animar={!reduzir}
                onRemover={() => setItens((xs) => xs.filter((x) => x.id !== item.id))}
                onTamanho={(t) => setItens((xs) => xs.map((x) => (x.id === item.id ? { ...x, tamanho: t } : x)))}
              />
            ))}
          </div>
        </SortableContext>
        <DragOverlay dropAnimation={reduzir ? null : undefined}>
          {ativo ? (() => {
            const it = itens.find((i) => i.id === ativo)
            if (!it) return null
            const p = posicoes.get(it.id)
            const v = p ?? vao(it.tamanho, colunas, defDe(it.id), 0, mpc)
            const el = ref.current
            const vaoPx = el ? parseFloat(getComputedStyle(el).columnGap) || 16 : 16
            const larguraCelula = el ? (el.clientWidth - (colunas - 1) * vaoPx) / colunas : 200
            return (
              <div style={{ width: v.colunas * larguraCelula + (v.colunas - 1) * vaoPx, height: v.linhas * MODULO_PX - VAO_PX }} className="rotate-1">
                <Widget def={defDe(it.id)} tamanho={it.tamanho} className="shadow-2xl" />
              </div>
            )
          })() : null}
        </DragOverlay>
      </DndContext>

      <Sheet open={galeria} onOpenChange={setGaleria}>
        <SheetContent className="gap-0 sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Adicionar widget</SheetTitle>
            <SheetDescription>Os que estão escondidos nesta tela. Entram no fim; arraste para onde quiser.</SheetDescription>
          </SheetHeader>
          <ul className="area-rolagem-dupla flex flex-col gap-2 overflow-y-auto p-4">
            {ocultos.map((d) => {
              const Icone = d.icone
              return (
                <li key={d.id} className="bg-surface shadow-cartao rounded-cartao flex flex-col gap-2 p-3">
                  <div className="flex items-center gap-2">
                    {Icone && <Icone className="text-muted-foreground size-5" aria-hidden />}
                    <span className="flex-1 text-sm font-medium">{d.titulo}</span>
                  </div>
                  <p className="text-muted-foreground text-xs">{d.descricao}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {d.tamanhos.map((t) => (
                      <Button
                        key={t}
                        size="sm"
                        variant="outline"
                        className="rounded-full"
                        onClick={() => {
                          setItens((xs) => [...xs, { id: d.id, tamanho: t }])
                          if (ocultos.length === 1) setGaleria(false)
                        }}
                      >
                        <PlusIcon /> {dimensoes[t].rotulo}
                      </Button>
                    ))}
                  </div>
                </li>
              )
            })}
            {!ocultos.length && <p className="text-muted-foreground py-6 text-center text-sm">Todos os widgets já estão na tela.</p>}
          </ul>
        </SheetContent>
      </Sheet>
    </div>
  )
}

function ItemSortavel({
  item,
  def,
  posicao,
  editando,
  arrastando,
  animar,
  onRemover,
  onTamanho,
}: {
  item: ItemGrade
  def: DefWidget
  posicao: Posicao
  editando: boolean
  arrastando: boolean
  animar: boolean
  onRemover: () => void
  onTamanho: (t: TamanhoWidget) => void
}) {
  const { setNodeRef, attributes, listeners } = useSortable({ id: item.id, disabled: !editando })
  const v = posicao
  return (
    <motion.div
      ref={setNodeRef}
      layout={animar ? 'position' : false}
      transition={{ type: 'spring', stiffness: 520, damping: 42 }}
      // O vão de baixo é respiro do item (a grade não tem vão entre linhas de 4px).
      className="min-w-0 pb-4"
      data-item-grade={item.id}
      style={{ gridColumn: `${v.coluna + 1} / span ${v.colunas}`, gridRow: `${v.linha + 1} / span ${v.linhas}` }}
    >
      <Widget def={def} tamanho={item.tamanho} conteudo={v.efetivo} editando={editando} arrastando={arrastando} onRemover={onRemover} onTamanho={onTamanho} alca={{ ...attributes, ...listeners }} />
    </motion.div>
  )
}

import { DndContext, DragOverlay, KeyboardSensor, PointerSensor, TouchSensor, closestCenter, useSensor, useSensors, type Announcements, type DragEndEvent, type DragOverEvent, type DragStartEvent, type PointerSensorOptions, type UniqueIdentifier } from '@dnd-kit/core'
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable'
import { ArrowCounterClockwiseIcon, ArrowsOutSimpleIcon, CheckIcon, DotsSixIcon, PlusIcon, SquaresFourIcon } from '@phosphor-icons/react'
import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useLoja } from '@/ambiente/loja'
import { usePreferencia } from '@/hooks/usePreferencia'
import { cn } from '@/lib/utils'
import { arranjar, dimensoes, MODULO_PX, modulosPorCelula, tamanhoValido, vao, VAO_PX, type DefWidget, type ItemGrade, type Posicao, type TamanhoWidget } from './tipos'
import { Widget } from './widget'
import { AreaRolagem } from '@/components/ui/area-rolagem'

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

/**
 * Sensor de ponteiro da grade. Fora do modo Organizar, o mouse (e a caneta)
 * só pega o widget pela alça de mover; o dedo pega pela alça (quando ela está
 * à mostra) e, no resto do widget, quem pega é o toque longo do TouchSensor,
 * para a rolagem da página nunca virar arrasto. No modo Organizar, o widget
 * inteiro é a alça, para mouse e toque.
 */
interface OpcoesPonteiro extends PointerSensorOptions {
  organizando?: boolean
}
class SensorPonteiro extends PointerSensor {
  static activators = [
    {
      eventName: 'onPointerDown' as const,
      handler: ({ nativeEvent: e }: React.PointerEvent, { onActivation, organizando }: OpcoesPonteiro): boolean => {
        if (!e.isPrimary || e.button !== 0) return false
        if (!organizando && e.pointerType === 'touch' && !(e.target as Element).closest('[data-alca-mover]')) return false
        onActivation?.({ event: e })
        return true
      },
    },
  ]
}

/** Toque longo que levanta o widget fora do modo Organizar (a rolagem que começa antes disso segue rolando). */
const TOQUE_LONGO_MS = 380

interface Props {
  /** Chave para guardar o arranjo do usuário (uma por tela). */
  chave: string
  catalogo: DefWidget[]
  padrao: ItemGrade[]
  /** Conteúdo à esquerda da barra (ex.: título da tela). */
  titulo?: ReactNode
  className?: string
}

/**
 * Grade de widgets personalizável. O tamanho (P, M, G, L, XL) dá a largura e
 * o teto de altura; a altura de verdade é a que o conteúdo pede (medida em
 * módulos de meia célula). `arranjar` põe cada um no primeiro lugar livre, na
 * ordem da lista, e nenhum widget estica para fechar vão. O arranjo é o mesmo
 * em qualquer modo e durante qualquer gesto.
 *
 * Manipulação direta, sem entrar em modo nenhum:
 * - mouse: ao passar o mouse (ou focar) um widget, aparecem a alça de mover
 *   (no meio da borda de cima) e a de tamanho (canto de baixo à direita).
 *   Arrastar pela alça troca de lugar ao vivo; arrastar o canto mostra a
 *   prévia do tamanho, encaixada nos que o widget aceita (pela largura em
 *   colunas e pela altura em células), e soltar aplica;
 * - toque: o toque longo no widget o levanta já arrastando (com vibração
 *   curta, quando o aparelho tem); a rolagem que começa antes não arrasta.
 *   Levantado, o widget mostra as duas alças até o próximo toque fora dele;
 * - teclado: Tab chega à alça de mover (Espaço ou Enter pega, setas movem,
 *   Espaço ou Enter solta, Esc cancela) e à de tamanho (setas trocam).
 * Todo gesto que muda o arranjo grava na hora e mostra o aviso com "Desfazer".
 *
 * Modo Organizar (botão no cabeçalho): a alternativa por teclado e o lugar de
 * esconder, adicionar pela galeria e restaurar o padrão. O widget inteiro
 * vira alça (Tab, Espaço, setas), o tamanho é escolhido no canto e Esc conclui.
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
  const itensRef = useRef(itens)
  itensRef.current = itens
  const loja = useLoja()
  const [editando, setEditando] = useState(false)
  const [galeria, setGaleria] = useState(false)
  const [ativo, setAtivo] = useState<string | null>(null)
  // Widget levantado pelo toque longo: mostra as alças até o próximo toque fora dele.
  const [levantado, setLevantado] = useState<string | null>(null)
  // O arranjo de antes do gesto, para o "Desfazer" e para o Esc durante o arrasto.
  const antes = useRef<{ salvo: ItemGrade[] | null; ordem: string } | null>(null)
  const { ref, colunas, largura, celula } = useColunas()
  const reduzir = useReducedMotion()

  useEffect(() => {
    if (!editando) return
    // Esc conclui o modo; durante um arrasto pelo teclado, o Esc só cancela o arrasto.
    // Na captura, antes do sensor do teclado (que ouve no documento) tratar o Esc e cancelar o arrasto.
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && !galeria && !antes.current && setEditando(false)
    window.addEventListener('keydown', esc, true)
    return () => window.removeEventListener('keydown', esc, true)
  }, [editando, galeria])

  useEffect(() => {
    if (!levantado) return
    const fora = (e: PointerEvent) => {
      if (!(e.target as Element).closest?.(`[data-item-grade="${CSS.escape(levantado)}"]`)) setLevantado(null)
    }
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setLevantado(null)
    document.addEventListener('pointerdown', fora, true)
    window.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('pointerdown', fora, true)
      window.removeEventListener('keydown', esc)
    }
  }, [levantado])

  const sensores = useSensors(
    useSensor(SensorPonteiro, { activationConstraint: { distance: 6 }, organizando: editando } as OpcoesPonteiro),
    useSensor(TouchSensor, { activationConstraint: { delay: TOQUE_LONGO_MS, tolerance: 8 } }),
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
  // Posição explícita de cada widget: tamanho pelo conteúdo, vãos fechados pela ordem e pelo empacotamento (o mesmo no modo Organizar).
  // O arranjo só muda quando muda o que ele lê (itens, tamanhos, alturas, colunas): não refaz a cada render.
  const assinatura = JSON.stringify([itens, colunas, mpc, [...alturas], [...colunasMinimas]])
  // oxlint-disable-next-line react-hooks/exhaustive-deps
  const posicoes = useMemo(() => arranjar(itens.map((i) => ({ ...i, def: defDe(i.id) })), colunas, { alturas, colunasMinimas, modulosPorCelula: mpc }), [assinatura])
  const ocultos = catalogo.filter((d) => !itens.some((i) => i.id === d.id))

  const ordemDe = (xs: ItemGrade[]) => xs.map((x) => x.id).join('|')
  const tituloDe = (id: UniqueIdentifier) => catalogo.find((d) => d.id === id)?.titulo ?? 'Widget'
  const posicaoDe = (id: UniqueIdentifier) => `posição ${itensRef.current.findIndex((x) => x.id === id) + 1} de ${itensRef.current.length}`

  const aoComecar = (e: DragStartEvent) => {
    antes.current = { salvo, ordem: ordemDe(itens) }
    setAtivo(String(e.active.id))
    // Pegou com o dedo: retorno tátil curto e as alças daquele widget à mostra depois de soltar.
    if (typeof TouchEvent !== 'undefined' && e.activatorEvent instanceof TouchEvent) {
      setLevantado(String(e.active.id))
      navigator.vibrate?.(10)
    } else if (e.activatorEvent instanceof PointerEvent && e.activatorEvent.pointerType === 'touch') setLevantado(String(e.active.id))
  }

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

  // Soltou: o arranjo já está gravado; se mudou, o aviso oferece desfazer.
  const aoSoltar = (e: DragEndEvent) => {
    setAtivo(null)
    const a = antes.current
    antes.current = null
    if (!a || a.ordem === ordemDe(itensRef.current)) return
    loja.toastDesfazer(`${tituloDe(e.active.id)} mudou de lugar.`, () => setSalvo(a.salvo))
  }

  // Esc no meio do arrasto: volta ao lugar de antes, sem aviso.
  const aoCancelar = () => {
    setAtivo(null)
    const a = antes.current
    antes.current = null
    if (a && a.ordem !== ordemDe(itensRef.current)) setSalvo(a.salvo)
  }

  const mudarTamanho = (item: ItemGrade, t: TamanhoWidget, avisar: boolean) => {
    if (t === item.tamanho) return
    const anterior = salvo
    setItens((xs) => xs.map((x) => (x.id === item.id ? { ...x, tamanho: t } : x)))
    if (avisar) loja.toastDesfazer(`${tituloDe(item.id)}: ${dimensoes[t].rotulo.toLowerCase()}.`, () => setSalvo(anterior))
  }

  const anuncios: Announcements = {
    onDragStart: ({ active }) => `${tituloDe(active.id)} pego, na ${posicaoDe(active.id)}.`,
    onDragOver: ({ active, over }) => (over ? `${tituloDe(active.id)} foi para a ${posicaoDe(over.id)}.` : `${tituloDe(active.id)} está fora da grade.`),
    onDragEnd: ({ active }) => `${tituloDe(active.id)} solto na ${posicaoDe(active.id)}.`,
    onDragCancel: ({ active }) => `Movimento cancelado. ${tituloDe(active.id)} voltou ao lugar de antes.`,
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="flex flex-wrap items-center gap-2">
        <div className="min-w-0 grow basis-40">{titulo}</div>
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
          <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setEditando(true)} title="Mover pelo teclado, esconder, adicionar e restaurar widgets">
            <SquaresFourIcon /> Organizar
          </Button>
        )}
      </div>

      {editando && <p className="text-muted-foreground -mt-1 text-xs">Arraste para trocar de lugar, ou Tab até o widget, Espaço pega, setas movem e Espaço solta · escolha o tamanho no canto · o botão de menos esconde · Esc conclui</p>}

      <DndContext
        sensors={sensores}
        collisionDetection={closestCenter}
        accessibility={{
          announcements: anuncios,
          screenReaderInstructions: { draggable: 'Para pegar o widget, aperte Espaço ou Enter. Com ele pego, as setas mudam o lugar; Espaço ou Enter solta e Esc cancela.' },
        }}
        onDragStart={aoComecar}
        onDragOver={aoPassar}
        onDragEnd={aoSoltar}
        onDragCancel={aoCancelar}
      >
        <SortableContext items={itens.map((i) => i.id)} strategy={() => null}>
          <div
            ref={ref}
            // Empacotamento denso: um widget menor sobe para o buraco que um maior deixou (P-9; nunca célula vazia no meio).
            className="grid grid-flow-row-dense gap-x-4"
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
                levantado={levantado === item.id}
                movivel={itens.length > 1}
                animar={!reduzir}
                medida={{ colunas, celula, mpc }}
                onRemover={() => setItens((xs) => xs.filter((x) => x.id !== item.id))}
                onTamanho={(t, avisar) => mudarTamanho(item, t, avisar)}
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
                {/* Levantado: cresce um pouco e ganha a sombra funda (sem o crescimento, com movimento reduzido). */}
                <motion.div className="h-full" initial={{ scale: 1 }} animate={{ scale: reduzir ? 1 : 1.02 }} transition={{ duration: 0.15 }}>
                  <Widget def={defDe(it.id)} tamanho={it.tamanho} className="shadow-2xl" />
                </motion.div>
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
          <AreaRolagem as="ul" className="flex flex-col gap-2 p-4">
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
          </AreaRolagem>
        </SheetContent>
      </Sheet>
    </div>
  )
}

/**
 * Alças só aparecem quando pedidas: mouse sobre o widget (só em aparelho com
 * hover), foco de teclado em alguma delas, ou o widget levantado pelo toque.
 * Escondidas, não recebem toque (o conteúdo embaixo continua clicável).
 */
const revelarAlca =
  'pointer-events-none opacity-0 transition-opacity duration-150 motion-reduce:transition-none group-hover/widget:pointer-events-auto group-hover/widget:opacity-100 group-has-focus-visible/widget:opacity-100 group-data-[alcas]/widget:pointer-events-auto group-data-[alcas]/widget:opacity-100'

function ItemSortavel({
  item,
  def,
  posicao,
  editando,
  arrastando,
  levantado,
  movivel,
  animar,
  medida,
  onRemover,
  onTamanho,
}: {
  item: ItemGrade
  def: DefWidget
  posicao: Posicao
  editando: boolean
  arrastando: boolean
  levantado: boolean
  movivel: boolean
  animar: boolean
  medida: MedidaGrade
  onRemover: () => void
  onTamanho: (t: TamanhoWidget, avisar: boolean) => void
}) {
  const { setNodeRef, setActivatorNodeRef, attributes, listeners } = useSortable({ id: item.id, attributes: { roleDescription: 'widget arrastável' } })
  const [redimensionando, setRedimensionando] = useState(false)
  const v = posicao
  // Fora do modo Organizar: o toque longo vale no widget inteiro; mouse e teclado, só na alça.
  const toque = !editando && movivel && listeners?.onTouchStart ? { onTouchStart: listeners.onTouchStart } : undefined
  const alcas = editando ? null : (
    <>
      {movivel && (
        <button
          type="button"
          ref={setActivatorNodeRef}
          data-alca-mover
          {...attributes}
          {...listeners}
          aria-label={`Mover ${def.titulo}`}
          className={cn('absolute top-0 left-1/2 z-10 flex h-6 w-12 -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none items-center justify-center rounded-full active:cursor-grabbing pointer-coarse:h-11 pointer-coarse:w-14', revelarAlca)}
        >
          <span className="bg-raised shadow-pilula text-muted-foreground flex h-5 items-center rounded-full px-2" aria-hidden>
            <DotsSixIcon weight="bold" className="size-4" />
          </span>
        </button>
      )}
      {def.tamanhos.length > 1 && <AlcaTamanho def={def} tamanho={item.tamanho} medida={medida} onGesto={setRedimensionando} onEscolher={onTamanho} />}
    </>
  )
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
      <Widget
        def={def}
        tamanho={item.tamanho}
        conteudo={v.efetivo}
        editando={editando}
        arrastando={arrastando}
        onRemover={onRemover}
        onTamanho={(t) => onTamanho(t, false)}
        alca={{ ...attributes, ...listeners }}
        refArtigo={editando ? setActivatorNodeRef : undefined}
        toque={toque}
        alcas={alcas}
        alcasVisiveis={(levantado || redimensionando) && !arrastando}
      />
    </motion.div>
  )
}

interface MedidaGrade {
  colunas: number
  celula: number
  mpc: number
}

/**
 * Alça de tamanho no canto de baixo à direita. Arrastar mostra a prévia do
 * tamanho (o contorno do vão máximo e o nome), encaixada no tamanho aceito
 * mais perto do ponteiro, em colunas e células, contando a partir do tamanho
 * atual; soltar aplica e grava. Pelo teclado, é um controle deslizante: as
 * setas trocam para o tamanho aceito seguinte ou anterior. Esc cancela o gesto.
 */
function AlcaTamanho({
  def,
  tamanho,
  medida,
  onGesto,
  onEscolher,
}: {
  def: DefWidget
  tamanho: TamanhoWidget
  medida: MedidaGrade
  onGesto: (ativo: boolean) => void
  onEscolher: (t: TamanhoWidget, avisar: boolean) => void
}) {
  const { colunas, celula, mpc } = medida
  const [previa, setPrevia] = useState<{ t: TamanhoWidget; largura: number; altura: number } | null>(null)
  const previaRef = useRef(previa)
  const gesto = useRef<{ x0: number; y0: number; colunaPx: number; vaoPx: number; maxLargura: number; ponteiro: number } | null>(null)
  const botao = useRef<HTMLButtonElement>(null)
  const aceitos = def.tamanhos
  const indice = aceitos.indexOf(tamanho)
  // Vão do tamanho nesta grade, em colunas e células (L e XL no celular ficam mais altos, não mais largos).
  const dims = (t: TamanhoWidget) => {
    const v = vao(t, colunas, def, 0, mpc)
    return { colunas: v.colunas, linhas: v.linhas / mpc }
  }

  const encerrar = (aplicar: boolean) => {
    const el = botao.current
    const g = gesto.current
    if (el && g && el.hasPointerCapture(g.ponteiro)) el.releasePointerCapture(g.ponteiro)
    const escolhido = previaRef.current?.t
    gesto.current = null
    previaRef.current = null
    onGesto(false)
    setPrevia(null)
    if (aplicar && escolhido && escolhido !== tamanho) onEscolher(escolhido, true)
  }

  useEffect(() => {
    if (!previa) return
    const esc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.stopPropagation()
      encerrar(false)
    }
    window.addEventListener('keydown', esc, true)
    return () => window.removeEventListener('keydown', esc, true)
  })

  const aoBaixar = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!e.isPrimary || e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()
    const artigo = e.currentTarget.closest('article')
    const grade = e.currentTarget.closest('[data-item-grade]')?.parentElement
    if (!artigo || !grade) return
    const ra = artigo.getBoundingClientRect()
    const rg = grade.getBoundingClientRect()
    const vaoPx = parseFloat(getComputedStyle(grade).columnGap) || VAO_PX
    gesto.current = { x0: e.clientX, y0: e.clientY, colunaPx: (rg.width - (colunas - 1) * vaoPx) / colunas, vaoPx, maxLargura: rg.right - ra.left, ponteiro: e.pointerId }
    e.currentTarget.setPointerCapture(e.pointerId)
    onGesto(true)
    mover(e.clientX, e.clientY)
  }

  const mover = (x: number, y: number) => {
    const g = gesto.current
    if (!g) return
    const atual = dims(tamanho)
    const alvoC = atual.colunas + (x - g.x0) / (g.colunaPx + g.vaoPx)
    const alvoL = atual.linhas + (y - g.y0) / (celula + VAO_PX)
    // O aceito mais perto do ponteiro; no empate, fica o menor (a lista vem do menor ao maior).
    let melhor = tamanho
    let menor = Infinity
    for (const t of aceitos) {
      const d = dims(t)
      const dist = (d.colunas - alvoC) ** 2 + (d.linhas - alvoL) ** 2
      if (dist < menor - 1e-6) {
        menor = dist
        melhor = t
      }
    }
    const d = dims(melhor)
    const largura = Math.min(d.colunas * g.colunaPx + (d.colunas - 1) * g.vaoPx, g.maxLargura)
    const altura = d.linhas * celula + (d.linhas - 1) * VAO_PX
    const p = previaRef.current
    if (p && p.t === melhor && p.largura === largura && p.altura === altura) return
    previaRef.current = { t: melhor, largura, altura }
    setPrevia(previaRef.current)
  }

  const aoTeclar = (e: React.KeyboardEvent) => {
    const passo = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, Home: -aceitos.length, End: aceitos.length }[e.key]
    if (passo === undefined) return
    e.preventDefault()
    e.stopPropagation()
    const novo = aceitos[Math.max(0, Math.min(aceitos.length - 1, indice + passo))]
    if (novo !== tamanho) onEscolher(novo, true)
  }

  return (
    <>
      {previa && (
        <div
          aria-hidden
          className="border-primary bg-primary/10 rounded-cartao pointer-events-none absolute top-0 left-0 z-20 flex items-end justify-end border-2 border-dashed p-2"
          style={{ width: previa.largura, height: previa.altura }}
        >
          <span className="bg-primary text-primary-foreground shadow-pilula rounded-full px-2 py-0.5 text-xs font-medium">
            {previa.t} · {dimensoes[previa.t].rotulo}
          </span>
        </div>
      )}
      <button
        ref={botao}
        type="button"
        role="slider"
        aria-label={`Mudar o tamanho de ${def.titulo}`}
        aria-valuemin={1}
        aria-valuemax={aceitos.length}
        aria-valuenow={indice + 1}
        aria-valuetext={dimensoes[previa?.t ?? tamanho].rotulo}
        title={`Tamanho: ${dimensoes[tamanho].rotulo}. Arraste o canto, ou use as setas.`}
        onPointerDown={aoBaixar}
        onPointerMove={(e) => mover(e.clientX, e.clientY)}
        onPointerUp={() => encerrar(true)}
        onPointerCancel={() => encerrar(false)}
        onLostPointerCapture={() => gesto.current && encerrar(true)}
        onTouchStart={(e) => e.stopPropagation()}
        onKeyDown={aoTeclar}
        className={cn(
          'absolute -right-1 -bottom-1 z-30 flex size-6 cursor-nwse-resize touch-none items-center justify-center rounded-full pointer-coarse:-right-4 pointer-coarse:-bottom-4 pointer-coarse:size-11',
          revelarAlca,
          previa && 'pointer-events-auto opacity-100',
        )}
      >
        <span className="bg-raised shadow-pilula text-muted-foreground flex size-5 items-center justify-center rounded-full" aria-hidden>
          <ArrowsOutSimpleIcon weight="bold" className="size-3 rotate-90" />
        </span>
      </button>
    </>
  )
}

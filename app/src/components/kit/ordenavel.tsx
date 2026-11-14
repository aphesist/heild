import { DndContext, DragOverlay, KeyboardSensor, PointerSensor, TouchSensor, closestCorners, useDroppable, useSensor, useSensors, type DragEndEvent, type DragOverEvent, type DragStartEvent, type UniqueIdentifier } from '@dnd-kit/core'
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { DotsSixVerticalIcon } from '@phosphor-icons/react'
import { useMemo, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Arrastar e soltar (dnd-kit): `ListaOrdenavel` reordena uma lista;
 * `Quadro` move entre colunas (kanban) e reordena dentro da coluna. Funciona
 * com mouse, toque e teclado (espaço pega, setas movem, espaço solta, Esc
 * cancela). Quem grava é quem chama: `onReordenar(ids)` →
 * `repos.x.reordenar(ids)`; `onMover(id, coluna, posicao)` →
 * `repos.x.mover(id, 'status', coluna, posicao)`.
 */

const anuncios = {
  onDragStart: () => 'Item pego. Use as setas para mover e espaço para soltar.',
  onDragOver: ({ over }: { over: { id: UniqueIdentifier } | null }) => (over ? 'Sobre outra posição.' : 'Fora da lista.'),
  onDragEnd: ({ over }: { over: { id: UniqueIdentifier } | null }) => (over ? 'Item solto.' : 'Movimento cancelado.'),
  onDragCancel: () => 'Movimento cancelado.',
}

function useSensores() {
  return useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(TouchSensor, { activationConstraint: { delay: 140, tolerance: 8 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))
}

/** Alça de arrastar (o item inteiro também arrasta; a alça é o alvo do teclado). */
function Alca({ rotulo, ...props }: { rotulo: string } & Record<string, unknown>) {
  return (
    <button type="button" aria-label={`Arrastar ${rotulo}`} className="text-muted-foreground hover:text-foreground flex size-6 shrink-0 cursor-grab touch-none items-center justify-center rounded-md active:cursor-grabbing" {...props}>
      <DotsSixVerticalIcon className="size-4" weight="bold" />
    </button>
  )
}

function ItemOrdenavel({ id, rotulo, desabilitado, children }: { id: string; rotulo: string; desabilitado?: boolean; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled: desabilitado })
  return (
    <li ref={setNodeRef} style={{ transform: CSS.Translate.toString(transform), transition }} className={cn('flex items-center gap-1.5', isDragging && 'opacity-40')}>
      {!desabilitado && <Alca rotulo={rotulo} {...attributes} {...listeners} />}
      <div className="min-w-0 flex-1">{children}</div>
    </li>
  )
}

export function ListaOrdenavel<T>({
  itens,
  idDe,
  rotuloDe,
  onReordenar,
  render,
  desabilitado,
  className,
}: {
  itens: T[]
  idDe: (item: T) => string
  /** Nome do item para o leitor de tela ("Arrastar PGDAS-D"). */
  rotuloDe: (item: T) => string
  onReordenar: (ids: string[]) => void
  render: (item: T) => ReactNode
  /** Sem permissão para reordenar: some a alça. */
  desabilitado?: boolean
  className?: string
}) {
  const sensores = useSensores()
  const ids = itens.map(idDe)
  const fim = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    onReordenar(arrayMove(ids, ids.indexOf(String(active.id)), ids.indexOf(String(over.id))))
  }
  return (
    <DndContext sensors={sensores} collisionDetection={closestCorners} onDragEnd={fim} accessibility={{ announcements: anuncios, screenReaderInstructions: { draggable: 'Espaço pega o item; setas movem; espaço solta; Esc cancela.' } }}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <ul className={cn('flex flex-col gap-1.5', className)}>
          {itens.map((i) => (
            <ItemOrdenavel key={idDe(i)} id={idDe(i)} rotulo={rotuloDe(i)} desabilitado={desabilitado}>
              {render(i)}
            </ItemOrdenavel>
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  )
}

/* ---------- Quadro (kanban) ---------- */

export interface ColunaQuadro {
  id: string
  titulo: string
  /** Não aceita soltar aqui (ex.: "Concluída" exige revisão). */
  bloqueada?: boolean
}

function Coluna({ coluna, ids, contagem, children }: { coluna: ColunaQuadro; ids: string[]; contagem: number; children: ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: `coluna:${coluna.id}`, disabled: coluna.bloqueada })
  return (
    <section aria-label={coluna.titulo} className={cn('bg-sunken/60 flex w-72 shrink-0 flex-col gap-2 rounded-[20px] p-2 transition-colors', isOver && 'bg-sunken')}>
      <header className="flex items-center gap-2 px-2 pt-1">
        <h3 className="text-sm font-medium">{coluna.titulo}</h3>
        <span className="text-muted-foreground ml-auto text-xs tabular-nums">{contagem}</span>
      </header>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <ul ref={setNodeRef} className="flex min-h-16 flex-col gap-1.5">
          {children}
        </ul>
      </SortableContext>
    </section>
  )
}

function CartaoQuadro({ id, rotulo, desabilitado, children }: { id: string; rotulo: string; desabilitado?: boolean; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled: desabilitado })
  return (
    <li ref={setNodeRef} style={{ transform: CSS.Translate.toString(transform), transition }} className={cn('bg-raised shadow-cartao flex items-start gap-1 rounded-[14px] p-2', isDragging && 'opacity-40')}>
      {!desabilitado && <Alca rotulo={rotulo} {...attributes} {...listeners} />}
      <div className="min-w-0 flex-1">{children}</div>
    </li>
  )
}

export function Quadro<T>({
  colunas,
  itens,
  idDe,
  colunaDe,
  rotuloDe,
  onMover,
  render,
  desabilitado,
  className,
}: {
  colunas: ColunaQuadro[]
  itens: T[]
  idDe: (item: T) => string
  colunaDe: (item: T) => string
  rotuloDe: (item: T) => string
  /** Item foi para `coluna`, na posição `posicao` (0 = topo). */
  onMover: (id: string, coluna: string, posicao: number) => void
  render: (item: T) => ReactNode
  desabilitado?: boolean
  className?: string
}) {
  const sensores = useSensores()
  // Durante o arraste, a coluna de cada item é a da tela (o banco só muda ao soltar).
  const [arraste, setArraste] = useState<{ id: string; coluna: string } | null>(null)
  const porId = useMemo(() => new Map(itens.map((i) => [idDe(i), i])), [itens, idDe])
  const colunaAtual = (i: T) => (arraste && idDe(i) === arraste.id ? arraste.coluna : colunaDe(i))
  const colunaDoAlvo = (alvo: UniqueIdentifier) => {
    const s = String(alvo)
    if (s.startsWith('coluna:')) return s.slice(7)
    const i = porId.get(s)
    return i ? colunaAtual(i) : null
  }
  const inicio = ({ active }: DragStartEvent) => {
    const i = porId.get(String(active.id))
    if (i) setArraste({ id: String(active.id), coluna: colunaDe(i) })
  }
  const sobre = ({ active, over }: DragOverEvent) => {
    if (!over) return
    const c = colunaDoAlvo(over.id)
    if (c && !colunas.find((x) => x.id === c)?.bloqueada && arraste?.coluna !== c) setArraste({ id: String(active.id), coluna: c })
  }
  const fim = ({ active, over }: DragEndEvent) => {
    const id = String(active.id)
    setArraste(null)
    if (!over) return
    const coluna = colunaDoAlvo(over.id)
    if (!coluna || colunas.find((x) => x.id === coluna)?.bloqueada) return
    const naColuna = itens.filter((i) => colunaDe(i) === coluna && idDe(i) !== id).map(idDe)
    const alvo = String(over.id)
    const posicao = alvo.startsWith('coluna:') ? naColuna.length : Math.max(0, naColuna.indexOf(alvo))
    const item = porId.get(id)
    if (item && colunaDe(item) === coluna && itens.filter((i) => colunaDe(i) === coluna).map(idDe).indexOf(id) === posicao) return
    onMover(id, coluna, posicao)
  }
  const ativo = arraste ? porId.get(arraste.id) : undefined
  return (
    <DndContext sensors={sensores} collisionDetection={closestCorners} onDragStart={inicio} onDragOver={sobre} onDragEnd={fim} onDragCancel={() => setArraste(null)} accessibility={{ announcements: anuncios }}>
      <div className={cn('flex gap-3 overflow-x-auto pb-2', className)}>
        {colunas.map((c) => {
          const daColuna = itens.filter((i) => colunaAtual(i) === c.id)
          return (
            <Coluna key={c.id} coluna={c} ids={daColuna.map(idDe)} contagem={daColuna.length}>
              {daColuna.map((i) => (
                <CartaoQuadro key={idDe(i)} id={idDe(i)} rotulo={rotuloDe(i)} desabilitado={desabilitado}>
                  {render(i)}
                </CartaoQuadro>
              ))}
            </Coluna>
          )
        })}
      </div>
      <DragOverlay>{ativo ? <div className="bg-raised shadow-lg w-68 rounded-[14px] p-2 pl-8">{render(ativo)}</div> : null}</DragOverlay>
    </DndContext>
  )
}

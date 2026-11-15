import { CheckIcon, MinusIcon, XIcon } from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Seleção múltipla com ação em lote: caixas nas linhas, "selecionar todos"
 * no cabeçalho e a barra de lote embaixo com o número e as ações. Shift
 * marca o intervalo. A ação em lote recebe os ids e quem chama grava (de
 * preferência numa transação só, com um desfazer).
 */
export function useSelecao(ids: string[]) {
  const [marcados, setMarcados] = useState<Set<string>>(new Set())
  const [ultimo, setUltimo] = useState<string | null>(null)
  // Item que saiu da lista (arquivado, filtrado) sai da seleção.
  const validos = useMemo(() => new Set([...marcados].filter((id) => ids.includes(id))), [marcados, ids])
  const alternar = useCallback(
    (id: string, intervalo = false) => {
      setMarcados((atual) => {
        const n = new Set([...atual].filter((x) => ids.includes(x)))
        if (intervalo && ultimo && ids.includes(ultimo)) {
          const [a, b] = [ids.indexOf(ultimo), ids.indexOf(id)].sort((x, y) => x - y)
          ids.slice(a, b + 1).forEach((x) => n.add(x))
        } else if (n.has(id)) n.delete(id)
        else n.add(id)
        return n
      })
      setUltimo(id)
    },
    [ids, ultimo],
  )
  return {
    selecionados: [...validos],
    quantos: validos.size,
    marcado: (id: string) => validos.has(id),
    alternar,
    todos: validos.size > 0 && validos.size === ids.length,
    algum: validos.size > 0 && validos.size < ids.length,
    alternarTodos: () => setMarcados(validos.size === ids.length ? new Set() : new Set(ids)),
    limpar: () => setMarcados(new Set()),
  }
}

export type Selecao = ReturnType<typeof useSelecao>

export function CaixaSelecao({ marcado, parcial, onMudar, rotulo, className }: { marcado: boolean; parcial?: boolean; onMudar: (intervalo: boolean) => void; rotulo: string; className?: string }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={parcial ? 'mixed' : marcado}
      aria-label={rotulo}
      onClick={(e) => {
        e.stopPropagation()
        onMudar(e.shiftKey)
      }}
      className={cn(
        'flex size-[18px] shrink-0 cursor-pointer items-center justify-center rounded-sm border transition-colors',
        marcado || parcial ? 'bg-foreground border-foreground text-background' : 'border-border bg-raised hover:border-foreground/40',
        className,
      )}
    >
      {parcial ? <MinusIcon weight="bold" className="size-3" /> : marcado ? <CheckIcon weight="bold" className="size-3" /> : null}
    </button>
  )
}

export interface AcaoLote {
  rotulo: string
  icone?: ReactNode
  perigo?: boolean
  onExecutar: (ids: string[]) => void
  /** Preenchido = desabilitada, com o motivo no título. */
  motivo?: string
}

/** Barra de lote: aparece quando há algo selecionado. */
export function BarraLote({ selecao, acoes, nome = ['item', 'itens'] }: { selecao: Selecao; acoes: AcaoLote[]; nome?: [string, string] }) {
  return (
    <AnimatePresence>
      {selecao.quantos > 0 && (
        <motion.div
          role="toolbar"
          aria-label="Ações em lote"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
          className="bg-foreground text-background shadow-lg sticky bottom-3 z-30 mx-auto flex w-fit max-w-full flex-wrap items-center gap-1 rounded-full p-1 pl-4 text-sm"
        >
          <span className="pr-2 font-medium tabular-nums">
            {selecao.quantos} {selecao.quantos === 1 ? nome[0] : nome[1]}
          </span>
          {acoes.map((a) => (
            <Button
              key={a.rotulo}
              size="sm"
              variant="ghost"
              title={a.motivo}
              disabled={!!a.motivo}
              onClick={() => a.onExecutar(selecao.selecionados)}
              className={cn('hover:bg-background/15 hover:text-background rounded-full', a.perigo && 'text-destructive-foreground')}
            >
              {a.icone}
              {a.rotulo}
            </Button>
          ))}
          <button type="button" aria-label="Limpar seleção" onClick={selecao.limpar} className="hover:bg-background/15 flex size-8 cursor-pointer items-center justify-center rounded-full">
            <XIcon className="size-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

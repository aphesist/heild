import { CheckIcon, PencilSimpleIcon, XIcon } from '@phosphor-icons/react'
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { cn } from '@/lib/utils'

/**
 * Edição em linha: o texto vira campo ao clicar (ou Enter/F2 com foco),
 * Enter salva, Esc cancela, sair do campo salva. Valida antes de salvar e
 * mostra o erro embaixo, sem perder o que foi digitado. `onSalvar` pode
 * lançar erro (permissão, regra): a mensagem aparece no lugar.
 *
 *   <EdicaoEmLinha rotulo="Título da tarefa" valor={t.titulo}
 *     validar={(v) => (v.trim() ? null : 'Escreva um título')}
 *     onSalvar={(v) => repos.tarefas.atualizar(t.id, { titulo: v })} />
 */
export function EdicaoEmLinha({
  valor,
  onSalvar,
  rotulo,
  validar,
  multilinha,
  placeholder = 'Clique para escrever',
  desabilitado,
  className,
}: {
  valor: string
  onSalvar: (novo: string) => void | Promise<void>
  /** Nome do campo para leitores de tela ("Título da tarefa"). */
  rotulo: string
  validar?: (v: string) => string | null
  multilinha?: boolean
  placeholder?: string
  /** Sem permissão: mostra o texto sem o lápis. */
  desabilitado?: boolean
  className?: string
}) {
  const [editando, setEditando] = useState(false)
  const [rascunho, setRascunho] = useState(valor)
  const [erro, setErro] = useState<string | null>(null)
  const campo = useRef<HTMLInputElement & HTMLTextAreaElement>(null)
  useEffect(() => {
    if (!editando) setRascunho(valor)
  }, [valor, editando])
  useEffect(() => {
    if (editando) campo.current?.select()
  }, [editando])

  const salvar = async () => {
    if (rascunho === valor) return setEditando(false)
    const e = validar?.(rascunho) ?? null
    if (e) return setErro(e)
    try {
      await onSalvar(rascunho)
      setErro(null)
      setEditando(false)
    } catch (x) {
      setErro(x instanceof Error ? x.message : String(x))
    }
  }
  const cancelar = () => {
    setRascunho(valor)
    setErro(null)
    setEditando(false)
  }
  const tecla = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      cancelar()
    } else if (e.key === 'Enter' && (!multilinha || e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      void salvar()
    }
  }

  if (!editando)
    return (
      <button
        type="button"
        disabled={desabilitado}
        aria-label={`${rotulo}: ${valor || 'vazio'}. Editar`}
        onClick={() => setEditando(true)}
        onKeyDown={(e) => e.key === 'F2' && setEditando(true)}
        className={cn('group hover:bg-sunken/70 -mx-1.5 flex min-w-0 cursor-text items-start gap-1.5 rounded-sm px-1.5 py-0.5 text-left disabled:cursor-default disabled:hover:bg-transparent', className)}
      >
        <span className={cn('min-w-0 flex-1 break-words', !valor && 'text-muted-foreground')}>{valor || placeholder}</span>
        {!desabilitado && <PencilSimpleIcon aria-hidden className="text-muted-foreground mt-0.5 size-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />}
      </button>
    )

  const base = 'bg-raised shadow-contorno focus-visible:ring-ring/40 w-full rounded-sm px-2 py-1 text-sm outline-none focus-visible:ring-[3px]'
  return (
    <div className={cn('flex min-w-0 flex-col gap-1', className)}>
      <div className="flex items-start gap-1">
        {multilinha ? (
          <textarea ref={campo} aria-label={rotulo} aria-invalid={!!erro} value={rascunho} rows={3} onChange={(e) => setRascunho(e.target.value)} onKeyDown={tecla} onBlur={() => void salvar()} className={cn(base, 'resize-y leading-relaxed')} />
        ) : (
          <input ref={campo} aria-label={rotulo} aria-invalid={!!erro} value={rascunho} onChange={(e) => setRascunho(e.target.value)} onKeyDown={tecla} onBlur={() => void salvar()} className={base} />
        )}
        <button type="button" aria-label="Salvar" onMouseDown={(e) => e.preventDefault()} onClick={() => void salvar()} className="hover:bg-sunken flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full">
          <CheckIcon className="size-3.5" weight="bold" />
        </button>
        <button type="button" aria-label="Cancelar" onMouseDown={(e) => e.preventDefault()} onClick={cancelar} className="text-muted-foreground hover:bg-sunken flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full">
          <XIcon className="size-3.5" />
        </button>
      </div>
      {erro ? <p className="text-destructive-text text-xs">{erro}</p> : <p className="text-muted-foreground text-xs">{multilinha ? 'Ctrl+Enter salva' : 'Enter salva'} · Esc cancela</p>}
    </div>
  )
}

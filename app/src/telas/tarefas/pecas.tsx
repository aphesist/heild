import { CaretDownIcon } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import { ResponsavelTarefa, StatusTarefaBadge } from '@/components/compostos/cartao-tarefa'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { atrasadaE, diasNoStatus, responsavelE, type TarefaE } from './modelo'
import { AreaRolagem } from '@/components/ui/area-rolagem'

/** Gaveta larga das telas da S04 (ficha, trilha, lista completa). No celular ocupa a tela. */
export function GavetaLarga({ titulo, descricao, onFechar, children, rodape, largura = 'xl' }: { titulo: ReactNode; descricao?: ReactNode; onFechar: () => void; children: ReactNode; rodape?: ReactNode; largura?: 'xl' | '3xl' | '5xl' }) {
  return (
    <Sheet open onOpenChange={(v) => !v && onFechar()}>
      <SheetContent
        className={cn('gap-0', largura === '5xl' ? 'sm:max-w-5xl' : largura === '3xl' ? 'sm:max-w-3xl' : 'sm:max-w-2xl')}
        onOpenAutoFocus={(e) => {
          e.preventDefault()
          ;(e.currentTarget as HTMLElement | null)?.focus()
        }}
      >
        <SheetHeader className="pr-10">
          <SheetTitle className="text-base leading-snug">{titulo}</SheetTitle>
          {descricao && <SheetDescription asChild><div>{descricao}</div></SheetDescription>}
        </SheetHeader>
        <AreaRolagem className="flex flex-1 flex-col gap-5 p-4">{children}</AreaRolagem>
        {rodape && <footer className="flex flex-wrap items-center gap-2 border-t p-3">{rodape}</footer>}
      </SheetContent>
    </Sheet>
  )
}

/** Seção com título e ação à direita. */
export function Secao({ titulo, acao, children, className }: { titulo: ReactNode; acao?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn('flex min-w-0 flex-col gap-2', className)}>
      <header className="flex items-center gap-2">
        <h3 className="text-sm font-medium">{titulo}</h3>
        {acao && <div className="ml-auto flex items-center gap-1">{acao}</div>}
      </header>
      {children}
    </section>
  )
}

/** Selo de status para a entidade (texto e cor, nunca só cor). */
export function StatusE({ t }: { t: TarefaE }) {
  return <StatusTarefaBadge tarefa={{ id: t.id, codigo: t.atividade_id, titulo: t.titulo, cliente: '', setor: t.setor_id as never, prazo: '', status: t.status, atrasada: atrasadaE(t), diasAguardando: t.status === 'aguardando_cliente' ? diasNoStatus(t) : undefined }} />
}

export function ResponsavelDe({ t }: { t: TarefaE }) {
  const r = responsavelE(t)
  return <ResponsavelTarefa responsavel={r ? { tipo: r.tipo, nome: r.nome, setor: r.setor } : undefined} />
}

/** Filtro em select nativo (teclado e leitor de tela de graça). */
export function FiltroSelect({ rotulo, valor, onMudar, opcoes, className }: { rotulo: string; valor: string; onMudar: (v: string) => void; opcoes: { valor: string; rotulo: string }[]; className?: string }) {
  return (
    <label className={cn('hover:bg-accent relative flex min-h-8 min-w-0 items-center gap-1 rounded-md border px-2 text-xs', className)}>
      <span className="text-muted-foreground">{rotulo}:</span>
      <select aria-label={rotulo} value={valor} onChange={(e) => onMudar(e.target.value)} className="bg-popover max-w-[9rem] cursor-pointer appearance-none truncate bg-transparent pr-4 font-medium outline-none">
        {opcoes.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.rotulo}
          </option>
        ))}
      </select>
      <CaretDownIcon className="text-muted-foreground pointer-events-none absolute right-1.5 size-3" />
    </label>
  )
}

/** Campo de texto simples com os tokens do tema. */
export function Entrada({ className, ...p }: React.ComponentProps<'input'>) {
  return <input {...p} className={cn('border-input bg-background focus-visible:ring-ring/50 h-9 w-full min-w-0 rounded-md border px-3 text-sm outline-none focus-visible:ring-2', className)} />
}
export function AreaTexto({ className, ...p }: React.ComponentProps<'textarea'>) {
  return <textarea {...p} className={cn('border-input bg-background focus-visible:ring-ring/50 w-full min-w-0 rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2', className)} />
}

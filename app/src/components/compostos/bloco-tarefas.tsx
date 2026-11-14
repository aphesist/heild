import { CaretDownIcon } from '@phosphor-icons/react'
import { useMemo, useState } from 'react'
import { useFluxos } from '@/ambiente/fluxos'
import type { Tarefa } from '@/dados/tipos'
import { cn } from '@/lib/utils'
import type { SetorIntegrante } from '@/theme/tipos'
import { ListaTarefas } from '@/telas/tarefas/ListaTarefas'
import { nomeClienteE, useClientesE, useTarefasE } from '@/telas/tarefas/modelo'

interface Props {
  setor: string
  /** Nome do cliente selecionado; ausente = carteira. */
  cliente?: string
  tarefas: Tarefa[]
  onAbrir?: (t: Tarefa) => void
  onNova?: () => void
  className?: string
  /** Dentro de um widget: sem casca, título e recolher (a caixa do widget já dá isso). */
  semCasca?: boolean
  setorId?: SetorIntegrante
}

/**
 * Bloco fixo "Tarefas deste setor", igual em todas as abas (03, 2.4 e 7.1;
 * S04-T03). Recebe as tarefas que a aba pode ver e mostra a lista completa da
 * S04: colunas, filtros salvos, pré-visualização, por responsável, calendário
 * e fila de revisão. As canceladas do mesmo escopo entram quando o filtro pede.
 */
export function BlocoTarefas({ setor, cliente, tarefas, onNova: novaFora, className, semCasca, setorId }: Props) {
  const fluxos = useFluxos()
  const todas = useTarefasE()
  const clientes = useClientesE()
  const [aberto, setAberto] = useState(true)
  const alvo = setorId ?? tarefas[0]?.setor ?? 'fiscal'
  const onNova = novaFora ?? (() => fluxos.novaTarefa({ cliente, setor: alvo }))
  const lista = useMemo(() => {
    const ids = new Set(tarefas.map((t) => t.id))
    return todas.filter((t) => ids.has(t.id) || (t.status === 'cancelada' && (!setorId || t.setor_id === setorId) && (!cliente || nomeClienteE(t, clientes) === cliente)))
  }, [todas, tarefas, setorId, cliente, clientes])
  const conteudo = (
    <ListaTarefas tarefas={lista} chave={`${setorId ?? setor}:${cliente ? 'cliente' : 'carteira'}`} setor={setorId} cliente={cliente} compacta={semCasca} limite={cliente ? undefined : 50} onNova={onNova} onVerTodas={() => fluxos.verTarefas({ setor: setorId, cliente })} />
  )
  if (semCasca) return <div className={className}>{conteudo}</div>
  return (
    <section className={cn('bg-card rounded-xl border', className)}>
      <header className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
        <button type="button" onClick={() => setAberto((v) => !v)} className="flex cursor-pointer items-center gap-2 text-sm font-semibold" aria-expanded={aberto}>
          <CaretDownIcon className={cn('size-4 transition-transform', !aberto && '-rotate-90')} />
          Tarefas deste setor
          <span className="text-muted-foreground font-normal">
            · {setor} · {cliente ?? 'Carteira'}
          </span>
        </button>
      </header>
      {aberto && <div className="p-3">{conteudo}</div>}
    </section>
  )
}

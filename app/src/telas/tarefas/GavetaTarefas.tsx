import { useFluxos } from '@/ambiente/fluxos'
import { useSessao } from '@/ambiente/sessao'
import type { SetorIntegrante } from '@/theme/tipos'
import { useMemo } from 'react'
import { ListaTarefas } from './ListaTarefas'
import { nomeClienteE, useClientesE, useTarefasE } from './modelo'
import { GavetaLarga } from './pecas'

/**
 * Tela "Tarefas" (S04-T03): todas as tarefas que a pessoa pode ver, com as
 * quatro visões. Abre pelo "ver todas" do bloco e é o que o destino Tarefas
 * do celular mostra (S01 monta `TarefasTela` no menu inferior).
 */
export function TarefasTela({ setor, cliente }: { setor?: SetorIntegrante; cliente?: string }) {
  const { usuario, permissoes } = useSessao()
  const fluxos = useFluxos()
  const todas = useTarefasE()
  const clientes = useClientesE()
  const visiveis = useMemo(
    () => todas.filter((t) => (usuario.papel === 'administrador' || permissoes.setores.includes(t.setor_id as SetorIntegrante)) && (!setor || t.setor_id === setor) && (!cliente || nomeClienteE(t, clientes) === cliente)),
    [todas, usuario.papel, permissoes.setores, setor, cliente, clientes],
  )
  return <ListaTarefas tarefas={visiveis} chave={`tela:${setor ?? 'todos'}:${cliente ?? 'carteira'}`} setor={setor} cliente={cliente} onNova={() => fluxos.novaTarefa({ cliente, setor: setor ?? (permissoes.setores[0] as SetorIntegrante) ?? 'fiscal' })} />
}

export function GavetaTarefas({ setor, cliente, onFechar }: { setor?: SetorIntegrante; cliente?: string; onFechar: () => void }) {
  return (
    <GavetaLarga largura="5xl" titulo="Tarefas" descricao={[setor ? `setor ${setor}` : 'todos os seus setores', cliente ?? 'carteira'].join(' · ')} onFechar={onFechar}>
      <TarefasTela setor={setor} cliente={cliente} />
    </GavetaLarga>
  )
}

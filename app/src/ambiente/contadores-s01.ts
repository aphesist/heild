import { useMemo } from 'react'
import * as exemplo from '@/dados/exemplo'
import { itensConfirmacao } from '@/dados/timesheet'
import type { Integrante } from '@/dados/tipos'
import { integranteAoVivo } from './integrante-vivo'
import { useNaoLidasInternas } from './interna'
import { useLoja, type IdModulo } from './loja'
import { setoresContabeis, useSessao } from './sessao'

/**
 * Contadores da moldura (S01-A04 e o contador por item da barra, S01-T01):
 * saem do que acontece na sessão, não de número fixo. Cada sessão que tem um
 * contador próprio acrescenta um hook no fim de `fontesContador` (lista fixa:
 * os hooks são chamados sempre na mesma ordem).
 */

/** Os integrantes da pessoa, ao vivo (o mesmo cálculo da Plataforma, para quem está fora dela). */
export function useMeusIntegrantes(): Integrante[] {
  const loja = useLoja()
  const { usuario, permissoes } = useSessao()
  const bpoPuro = loja.estado.cenario === 'bpo_puro'
  return useMemo(
    () =>
      exemplo.integrantes
        .filter((i) => i.setor === 'geral' || (permissoes.setores.includes(i.setor) && !(bpoPuro && setoresContabeis.includes(i.setor)) && (i.tipo !== 'criado_pelo_usuario' || usuario.id === 'u1')))
        .map((i) => integranteAoVivo(i, loja.estado.trabalhos, loja.conversasTime[i.id] ?? [], loja.estado.decisoes, loja.tarefas)),
    [permissoes, usuario.id, bpoPuro, loja.estado.trabalhos, loja.conversasTime, loja.estado.decisoes, loja.tarefas],
  )
}

/** Cartões esperando a pessoa nos chats do time. */
export function useCartoesPendentes() {
  return useMeusIntegrantes().reduce((s, i) => s + (i.pendentes ?? 0), 0)
}

/** Botão Chat (gaveta e menu inferior): não lidas da Equipe (S05, C8) + cartões dos integrantes. */
export function useContadorChat() {
  const equipe = useNaoLidasInternas().total
  const doTime = useCartoesPendentes()
  return { equipe, doTime, total: equipe + doTime }
}

type Contadores = Partial<Record<IdModulo, number>>

function useContadoresS01(): Contadores {
  const loja = useLoja()
  const { usuario, permissoes } = useSessao()
  const cartoes = useCartoesPendentes()
  return useMemo(() => {
    const setores = new Set(permissoes.setores)
    const meus = (s: string) => usuario.papel === 'administrador' || setores.has(s as never)
    return {
      inicio: cartoes,
      painel: loja.tarefas.filter((t) => t.atrasada && t.status !== 'concluida' && t.status !== 'cancelada' && meus(t.setor)).length,
      crm: loja.conversas.filter((c) => setores.has(c.setor) && (c.status === 'nova' || (c.naoLidas ?? 0) > 0)).length,
      // Confirmações do Timesheet: os itens do dia que pedem a pessoa (S06 troca pela fila real).
      timesheet: itensConfirmacao.length,
    }
  }, [loja.tarefas, loja.conversas, permissoes.setores, usuario.papel, cartoes])
}

/** Acrescente aqui o hook da sua sessão (devolve só os módulos dela). */
const fontesContador: (() => Contadores)[] = [useContadoresS01]

export function useContadoresModulo(): Contadores {
  return Object.assign({}, ...fontesContador.map((f) => f())) as Contadores
}

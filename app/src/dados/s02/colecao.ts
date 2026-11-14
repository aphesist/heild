import { useMemo } from 'react'
import { banco } from '@/nucleo/banco'
import { useTabela } from '@/nucleo/react'
import { registrar, repos } from '@/nucleo/repositorios'

/**
 * Coleções da S02 que ainda não têm entidade no banco (acessos e procurações,
 * certificados, processos de legalização, comunicações oficiais, convites do
 * app, captura de notas...). Ficam em `registro_tela` com a chave
 * `s02:<colecao>`, uma lista de registros já no formato das entidades do plano
 * (snake_case), para o backend virar tabela sem mudar a tela. Toda escrita
 * grava um evento na linha do tempo (R2). Decisão registrada em DECISOES (S02).
 */

export interface RegistroS02 {
  id: string
  cliente_id?: string | null
  criado_em?: string
  atualizado_em?: string
}

const chave = (nome: string) => `s02:${nome}`

/** Lê a coleção (com a semente, se nunca foi gravada). */
export function lerColecao<T extends RegistroS02>(nome: string, semente: () => T[]): T[] {
  const r = banco.ler('registro_tela').find((x) => x.id === chave(nome))
  return (r?.valor as T[] | undefined) ?? semente()
}

export function gravarColecao<T extends RegistroS02>(nome: string, itens: T[]) {
  repos.telas.lembrar(chave(nome), itens)
}

/** Operações de uma coleção (fora do React também: executores dos cartões). */
export function colecao<T extends RegistroS02>(nome: string, semente: () => T[]) {
  const agora = () => new Date().toISOString()
  return {
    listar: () => lerColecao(nome, semente),
    obter: (id: string) => lerColecao(nome, semente).find((x) => x.id === id),
    criar: (item: Omit<T, 'id'> & { id?: string }, evento?: { texto: string; cliente_id?: string | null; setor_id?: string | null }) => {
      const novo = { ...item, id: item.id ?? `${nome.slice(0, 3)}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 4)}`, criado_em: agora(), atualizado_em: agora() } as T
      gravarColecao(nome, [...lerColecao(nome, semente), novo])
      if (evento) registrar(evento.texto, `${nome}.criar`, { cliente_id: evento.cliente_id ?? item.cliente_id ?? null, setor_id: evento.setor_id ?? null })
      return novo
    },
    atualizar: (id: string, patch: Partial<T>, evento?: { texto: string; cliente_id?: string | null; setor_id?: string | null }) => {
      const lista = lerColecao(nome, semente)
      const antes = lista.find((x) => x.id === id)
      if (!antes) return undefined
      const depois = { ...antes, ...patch, atualizado_em: agora() }
      gravarColecao(
        nome,
        lista.map((x) => (x.id === id ? depois : x)),
      )
      if (evento) registrar(evento.texto, `${nome}.atualizar`, { cliente_id: evento.cliente_id ?? antes.cliente_id ?? null, setor_id: evento.setor_id ?? null })
      return antes
    },
    /** Volta um registro ao estado anterior (desfazer). */
    reverter: (antes: T) => gravarColecao(nome, lerColecao(nome, semente).map((x) => (x.id === antes.id ? antes : x))),
  }
}

/** A coleção na tela (re-renderiza quando muda). */
export function useColecao<T extends RegistroS02>(nome: string, semente: () => T[], filtro?: (x: T) => boolean): T[] {
  const tela = useTabela('registro_tela')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const todos = useMemo(() => lerColecao(nome, semente), [tela, nome])
  return filtro ? todos.filter(filtro) : todos
}

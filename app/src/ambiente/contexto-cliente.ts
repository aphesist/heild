import { useCallback, useMemo } from 'react'
import { hashParaDestino, useHash } from '@/nucleo/rotas'
import { useTabela } from '@/nucleo/react'
import { usePreferencia } from '@/hooks/usePreferencia'
import type { Cliente } from '@/dados/tipos'
import { gruposEconomicos, type GrupoEconomico } from '@/dados/grupos-s01'
import { useLoja, usePersistente } from './loja'
import { useSessao } from './sessao'

/**
 * Contexto de cliente da moldura (S01-T10; 03, 3): quem está no escopo da
 * pessoa, favoritos (até 10, por conta), recentes (10, por aparelho) e grupos
 * econômicos (rótulo, não permissão: "2 de 4 empresas visíveis").
 */

export const LIMITE_FAVORITOS = 10
export const LIMITE_RECENTES = 10

/** Clientes que a pessoa pode ver: todos, ou só a carteira dela quando o escritório liga a carteira (03, 3.3). */
export function useClientesNoEscopo(): Cliente[] {
  const loja = useLoja()
  const { usuario } = useSessao()
  const escritorio = useTabela('escritorio')[0]
  return useMemo(() => {
    const carteira = escritorio?.carteira_ligada && usuario.papel !== 'administrador' && usuario.carteira.length > 0 ? new Set(usuario.carteira) : null
    return carteira ? loja.clientes.filter((c) => carteira.has(c.id)) : loja.clientes
  }, [loja.clientes, escritorio?.carteira_ligada, usuario.papel, usuario.carteira])
}

/** Cliente do endereço (o que a Plataforma escreveu): `null` = carteira; `undefined` = o módulo não usa cliente. */
export function useClienteDaRota(): string | null | undefined {
  const hash = useHash()
  return useMemo(() => {
    const d = hashParaDestino(hash)
    if (!d) return undefined
    return d.cliente === undefined ? null : d.cliente
  }, [hash])
}

export function useFavoritos() {
  const { usuario } = useSessao()
  const [favoritos, setFavoritos] = usePersistente<string[]>(`s01:seletor:favoritos:${usuario.id}`, [])
  const loja = useLoja()
  const alternar = useCallback(
    (id: string) => {
      if (favoritos.includes(id)) return setFavoritos(favoritos.filter((x) => x !== id))
      if (favoritos.length >= LIMITE_FAVORITOS) return loja.toast(`Até ${LIMITE_FAVORITOS} favoritos. Tire um para pôr outro.`)
      setFavoritos([...favoritos, id])
    },
    [favoritos, setFavoritos, loja],
  )
  return { favoritos, alternar }
}

/** Recentes ficam no aparelho (03, 3.1: "10 recentes por aparelho"), não no escritório. */
export function useRecentes() {
  const { usuario } = useSessao()
  const [recentes, setRecentes] = usePreferencia<string[]>(`heild:s01:recentes:${usuario.id}`, [])
  const lembrar = useCallback((id: string | null) => id && setRecentes((r) => [id, ...r.filter((x) => x !== id)].slice(0, LIMITE_RECENTES)), [setRecentes])
  return { recentes, lembrar }
}

/** Grupos com as empresas que a pessoa vê de cada um. */
export function useGrupos(clientes: Cliente[]): (GrupoEconomico & { visiveis: Cliente[] })[] {
  return useMemo(() => {
    const porId = new Map(clientes.map((c) => [c.id, c]))
    return gruposEconomicos.map((g) => ({ ...g, visiveis: g.empresas.map((id) => porId.get(id)).filter((c): c is Cliente => !!c) })).filter((g) => g.visiveis.length > 0)
  }, [clientes])
}

/** Grupo escolhido no seletor (o contexto vira o cliente principal; a moldura mostra o grupo). */
export function useGrupoAtivo() {
  const { usuario } = useSessao()
  return usePersistente<string | null>(`s01:seletor:grupo:${usuario.id}`, null)
}

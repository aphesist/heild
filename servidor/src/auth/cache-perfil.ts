import type { Perfil } from '@heild/dominio'
import { config } from '../config.ts'

/**
 * Cache do perfil materializado (STACK 5; Fundações 3.2: "qualquer evento `conta.*`
 * invalida o cache"). Em memória do processo, por `HEILD_CACHE_PERFIL_MS` (padrão 5 min),
 * ou até a cauda de mudanças (`mudanca`, lida pelo fluxo do SSE) trazer uma linha das
 * tabelas que formam o perfil, de qualquer instância. A escrita feita nesta instância
 * invalida na hora, sem esperar a cauda.
 */

/** As tabelas de que o perfil sai (contaParaTela + perfilDeConta). */
export const TABELAS_DO_PERFIL = new Set(['usuario', 'vinculo_setor', 'excecao_tela', 'carteira_cliente', 'escritorio', 'assinatura'])

const guardados = new Map<string, { perfil: Perfil | null; ate: number }>()
let acertos = 0
let faltas = 0

export function lerPerfil(escritorio: string, usuario: string): Perfil | null | undefined {
  if (config.cachePerfilMs <= 0) return undefined
  const k = `${escritorio}\u0000${usuario}`
  const g = guardados.get(k)
  if (g && g.ate > Date.now()) {
    acertos++
    return g.perfil
  }
  if (g) guardados.delete(k)
  faltas++
  return undefined
}

export function guardarPerfil(escritorio: string, usuario: string, perfil: Perfil | null) {
  if (config.cachePerfilMs <= 0) return
  if (guardados.size > 20_000) guardados.clear()
  guardados.set(`${escritorio}\u0000${usuario}`, { perfil, ate: Date.now() + config.cachePerfilMs })
}

/** Uma conta mudou (ou uma regra do escritório): todo perfil do escritório sai do cache. */
export function invalidarEscritorio(escritorio: string) {
  const prefixo = `${escritorio}\u0000`
  for (const k of guardados.keys()) if (k.startsWith(prefixo)) guardados.delete(k)
}

export const escritoriosComPerfil = (): Set<string> => new Set([...guardados.keys()].map((k) => k.split('\u0000')[0]))
export const estatisticaPerfil = () => ({ guardados: guardados.size, acertos, faltas })
export const limparCachePerfil = () => guardados.clear()

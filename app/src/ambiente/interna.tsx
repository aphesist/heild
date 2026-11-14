import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Id } from '@/nucleo/modelo/entidades'
import { useTabela } from '@/nucleo/react'
import { usePersistente } from './loja'
import { useSessao } from './sessao'

/**
 * Comunicação interna (subplano 11), o que as outras sessões usam (contrato C8
 * revisto pela Coordenação em DECISOES.md):
 *
 * - `abrirChat({ aba, conversa })`: abre a gaveta do botão Chat de qualquer
 *   lugar (menu inferior do celular, sino, cartão de menção, busca global).
 * - `useEstadoChat()`: a gaveta lê daqui se está aberta, em que aba e em que
 *   conversa interna.
 * - `useNaoLidasInternas()`: total de não lidas da aba Equipe e por conversa,
 *   para o contador do botão Chat.
 *
 * Não há item na barra lateral: a tela cheia tem rota própria (`#/interna`).
 */

export type AbaChat = 'equipe' | 'integrantes'

export interface PedidoChat {
  /** Aba da gaveta; sem ela, abre na última usada. */
  aba?: AbaChat
  /** Conversa interna a abrir (só vale na aba Equipe). */
  conversa?: Id
}

const EVENTO = 'heild:abrir-chat'

/** Abre a gaveta do Chat de qualquer lugar. */
export const abrirChat = (pedido: PedidoChat = {}) => window.dispatchEvent(new CustomEvent<PedidoChat>(EVENTO, { detail: pedido }))

/** Estado da gaveta do Chat: aberta, aba e conversa interna aberta. */
export function useEstadoChat(abaInicial: AbaChat = 'integrantes') {
  const [aberto, setAberto] = useState(false)
  const [aba, setAba] = useState<AbaChat>(abaInicial)
  const [conversa, setConversa] = useState<Id | null>(null)
  useEffect(() => {
    const ouvir = (e: Event) => {
      const p = (e as CustomEvent<PedidoChat>).detail ?? {}
      if (p.aba) setAba(p.aba)
      if (p.conversa) {
        setAba('equipe')
        setConversa(p.conversa)
      }
      setAberto(true)
    }
    window.addEventListener(EVENTO, ouvir)
    return () => window.removeEventListener(EVENTO, ouvir)
  }, [])
  return { aberto, setAberto, aba, setAba, conversa, setConversa }
}

/** Até quando cada pessoa leu cada conversa (data ISO da última mensagem vista). Por pessoa, guardado no escritório. */
export function useLidas() {
  const { usuario } = useSessao()
  const [lidas, setLidas] = usePersistente<Record<Id, string>>(`s05:interna:lidas:${usuario.id}`, {})
  // O setter do usePersistente muda a cada render; a ref mantém marcarLida estável (efeitos não entram em laço).
  const ref = useRef({ lidas, setLidas })
  ref.current = { lidas, setLidas }
  const marcarLida = useCallback((conversaId: Id, ate = new Date().toISOString()) => {
    const atual = ref.current.lidas[conversaId]
    if (atual && atual >= ate) return
    ref.current.setLidas((x) => ({ ...x, [conversaId]: ate }))
  }, [])
  return { lidas, marcarLida }
}

/** Conversas internas em que a pessoa participa agora (saída registrada tira o acesso; o histórico fica). */
export function useMinhasConversasInternas() {
  const { usuario } = useSessao()
  const conversas = useTabela('conversa_interna')
  const participacoes = useTabela('participacao')
  return useMemo(() => {
    const minhas = new Set(participacoes.filter((p) => p.usuario_id === usuario.id && !p.saiu_em).map((p) => p.conversa_interna_id))
    return conversas.filter((c) => !c.arquivado_em && minhas.has(c.id))
  }, [conversas, participacoes, usuario.id])
}

/** Não lidas da comunicação interna (aba Equipe do Chat): total e por conversa. Conversa silenciada não soma no total. */
export function useNaoLidasInternas(): { total: number; porConversa: Record<Id, number> } {
  const { usuario } = useSessao()
  const conversas = useMinhasConversasInternas()
  const mensagens = useTabela('mensagem_interna')
  const { lidas } = useLidas()
  const [silenciadas] = usePersistente<Id[]>(`s05:interna:silenciadas:${usuario.id}`, [])
  return useMemo(() => {
    const porConversa: Record<Id, number> = {}
    const ids = new Set(conversas.map((c) => c.id))
    for (const m of mensagens) {
      if (!ids.has(m.conversa_interna_id) || m.autor_id === usuario.id) continue
      const lida = lidas[m.conversa_interna_id]
      if (lida && m.criado_em <= lida) continue
      porConversa[m.conversa_interna_id] = (porConversa[m.conversa_interna_id] ?? 0) + 1
    }
    const total = Object.entries(porConversa).reduce((s, [id, n]) => s + (silenciadas.includes(id) ? 0 : n), 0)
    return { total, porConversa }
  }, [conversas, mensagens, lidas, silenciadas, usuario.id])
}

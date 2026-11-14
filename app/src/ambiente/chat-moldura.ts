import { useEffect } from 'react'
import type { SetorIntegrante } from '@/theme/tipos'
import { abrirChat } from './interna'

/**
 * Gaveta do Chat, lado dos integrantes (S01-T06). "Falar com [integrante]"
 * vindo do cabeçalho da aba (S01-A54) abre a gaveta já no chat dele, sem sair
 * da tela. Quem chama: `falarComIntegrante('fiscal')`.
 */
const EVENTO = 'heild:falar-com-integrante'

export function falarComIntegrante(alvo: SetorIntegrante | { id: string }) {
  abrirChat({ aba: 'integrantes' })
  window.dispatchEvent(new CustomEvent(EVENTO, { detail: alvo }))
}

export function useFalarComIntegrante(aoPedir: (alvo: SetorIntegrante | { id: string }) => void) {
  useEffect(() => {
    const ouvir = (e: Event) => aoPedir((e as CustomEvent<SetorIntegrante | { id: string }>).detail)
    window.addEventListener(EVENTO, ouvir)
    return () => window.removeEventListener(EVENTO, ouvir)
  }, [aoPedir])
}

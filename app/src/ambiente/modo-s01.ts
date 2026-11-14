import { useEffect, useRef } from 'react'
import type { ModoCor } from '@/theme/tipos'

/**
 * Claro e escuro lembrados por pessoa neste aparelho (S01-A68). A escolha vem
 * do menu da conta ou de Minha conta; ao entrar, a moldura reaplica o que a
 * pessoa escolheu da última vez.
 */
const chave = (usuario: string) => `heild:s01:modo:${usuario}`

export function lembrarModo(usuario: string, modo: ModoCor) {
  try {
    window.localStorage.setItem(chave(usuario), modo)
  } catch {
    /* sem armazenamento: só não lembra */
  }
}

export function modoLembrado(usuario: string): ModoCor | null {
  try {
    const v = window.localStorage.getItem(chave(usuario))
    return v === 'claro' || v === 'escuro' ? v : null
  } catch {
    return null
  }
}

/** Ao montar, se a pessoa escolheu outro modo antes, alterna uma vez. */
export function useReaplicarModo(usuario: string, atual: ModoCor, alternar?: () => void) {
  const feito = useRef(false)
  useEffect(() => {
    if (feito.current || !alternar) return
    feito.current = true
    const salvo = modoLembrado(usuario)
    if (salvo && salvo !== atual) alternar()
  }, [usuario, atual, alternar])
}

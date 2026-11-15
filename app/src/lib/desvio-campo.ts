import { useEffect, useRef } from 'react'

/**
 * `--desvio-campo` (proposta aprovada da UI-1, QA_INTERFACE.md, 5): a tela que tem
 * um campo de escrever no canto de baixo (CRM › Conversas) mede a altura dele e
 * põe a variável no documento. O botão Chat (`GavetaChat`) e os avisos (`Toasts`)
 * sobem essa altura e nunca cobrem o campo. Medida por ResizeObserver, sem salto;
 * sai ao desmontar (trocar de rota desmonta a tela).
 */
export function useDesvioCampo<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const raiz = document.documentElement
    const medir = () => raiz.style.setProperty('--desvio-campo', `${Math.ceil(el.getBoundingClientRect().height)}px`)
    medir()
    const ro = new ResizeObserver(medir)
    ro.observe(el)
    return () => {
      ro.disconnect()
      raiz.style.removeProperty('--desvio-campo')
    }
  }, [])
  return ref
}

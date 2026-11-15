import { useCallback } from 'react'

/**
 * `--desvio-campo` (proposta aprovada da UI-1, QA_INTERFACE.md, 5): o que ocupa o
 * canto de baixo da tela (o campo de escrever do CRM › Conversas, o rodapé de
 * ações de uma gaveta de formulário) mede a própria altura e põe a variável no
 * documento. O botão Chat (`GavetaChat`) e os avisos (`Toasts`) sobem essa altura
 * e nunca cobrem o campo nem o botão de enviar. Medida por ResizeObserver, sem
 * salto; vale a maior altura entre os registrados (uma gaveta aberta sobre o CRM
 * não apaga o desvio da tela ao fechar) e sai quando o último desmonta.
 */
const registrados = new Set<HTMLElement>()

function aplicar() {
  const raiz = document.documentElement
  let maior = 0
  for (const el of registrados) maior = Math.max(maior, Math.ceil(el.getBoundingClientRect().height))
  if (maior) raiz.style.setProperty('--desvio-campo', `${maior}px`)
  else raiz.style.removeProperty('--desvio-campo')
}

/**
 * Ref de callback (React 19, com limpeza): registra o elemento quando ele entra
 * no DOM e o tira quando sai, inclusive dentro de gavetas e modais que só montam
 * o conteúdo quando abrem.
 */
export function useDesvioCampo<T extends HTMLElement = HTMLDivElement>() {
  return useCallback((el: T | null) => {
    if (!el || typeof ResizeObserver === 'undefined') return
    registrados.add(el)
    aplicar()
    const ro = new ResizeObserver(aplicar)
    ro.observe(el)
    return () => {
      ro.disconnect()
      registrados.delete(el)
      aplicar()
    }
  }, [])
}

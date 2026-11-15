/**
 * Título automático do texto truncado (PADRAO_DE_INTERFACE.md, 7: "corte só com
 * reticências, e o texto inteiro no título"). Ao passar o ponteiro ou focar um
 * texto que está mesmo cortado (reticências de uma linha ou `line-clamp`) e não
 * tem `title` nem `aria-label`, a página põe o texto inteiro como título. Vale
 * para o sistema inteiro, sem cada tela lembrar de escrever o `title`.
 */
function cortado(el: HTMLElement): boolean {
  const s = getComputedStyle(el)
  const reticencias = s.textOverflow === 'ellipsis' || (s.webkitLineClamp && s.webkitLineClamp !== 'none')
  return !!reticencias && (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1)
}

function aoApontar(e: Event) {
  let el = e.target instanceof HTMLElement ? e.target : null
  for (let i = 0; el && i < 4; i++, el = el.parentElement) {
    if (el.hasAttribute('title') || el.hasAttribute('aria-label')) return
    if (cortado(el)) {
      const texto = (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim()
      if (texto) el.setAttribute('title', texto)
      return
    }
  }
}

let instalado = false
export function instalarTituloAutomatico() {
  if (typeof document === 'undefined' || instalado) return
  instalado = true
  document.addEventListener('pointerover', aoApontar, { passive: true, capture: true })
  document.addEventListener('focusin', aoApontar, { capture: true })
  // O QA (scripts/lib/detector.cjs) lê este marcador: com ele, reticências bastam; corte sem reticências continua contando.
  document.documentElement.dataset.tituloAutomatico = '1'
}

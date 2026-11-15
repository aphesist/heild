/**
 * Medida do esmaecido das áreas de rolagem (regra do design system: conteúdo
 * que rola nunca some atrás de uma borda sólida). O CSS (index.css) já esmaece
 * com animação guiada por rolagem onde o navegador tem; esta medida roda sempre
 * (há navegadores que dizem ter a animação e não aplicam, e o Safari de alguns
 * iPhones não tem) e passa ao CSS:
 *   --esmaecer-js-topo / --esmaecer-js-fim   quanto o topo e o fim esmaecem;
 *   --esmaecer-esquerda / --esmaecer-direita  o mesmo nas faixas que rolam de lado;
 *   --esmaecer-inicio  a altura do cabeçalho fixo ([data-cabecalho-fixo]) quando
 *                      ele está preso no topo da área: o esmaecido começa abaixo
 *                      dele, e a primeira linha não é cortada seca sob o cabeçalho.
 * A primitiva <AreaRolagem> também chama `medirAreaRolagem` quando muda de tamanho.
 */
const SELETOR_VERTICAL = '.area-rolagem, .area-rolagem-dupla, .area-rolagem-ambos'
const SELETOR_LADOS = '.esmaecer-lados, .area-rolagem-ambos'
const LADO = 24
const MAX = 44
const FAIXA = 60

function medirLados(el: HTMLElement) {
  const esquerda = el.scrollLeft
  const direita = el.scrollWidth - el.clientWidth - el.scrollLeft
  el.style.setProperty('--esmaecer-esquerda', `${Math.min(Math.max(esquerda, 0), LADO)}px`)
  el.style.setProperty('--esmaecer-direita', `${Math.min(Math.max(direita, 0), LADO)}px`)
}

/** Cabeçalho fixo desta área (não de uma área de dentro). */
function cabecalhoFixo(el: HTMLElement): HTMLElement | null {
  for (const c of el.querySelectorAll<HTMLElement>('[data-cabecalho-fixo]')) {
    const dono = c.parentElement?.closest(SELETOR_VERTICAL)
    if (dono === el) return c
  }
  return null
}

function medirVertical(el: HTMLElement) {
  const acima = el.scrollTop
  const abaixo = el.scrollHeight - el.clientHeight - el.scrollTop
  el.style.setProperty('--esmaecer-js-topo', `${(Math.min(Math.max(acima, 0), FAIXA) / FAIXA) * MAX}px`)
  el.style.setProperty('--esmaecer-js-fim', `${(Math.min(Math.max(abaixo, 0), FAIXA) / FAIXA) * MAX}px`)
  const cab = cabecalhoFixo(el)
  let inicio = 0
  if (cab) {
    const topoArea = el.getBoundingClientRect().top + el.clientTop
    const b = cab.getBoundingClientRect()
    // Preso no topo (sticky) ou já no topo: o esmaecido começa embaixo dele.
    if (Math.abs(b.top - topoArea) < 2) inicio = b.height
  }
  el.style.setProperty('--esmaecer-inicio', `${inicio}px`)
}

/** Mede uma área agora (a primitiva chama quando ela ou o conteúdo mudam de tamanho). */
export function medirAreaRolagem(el: HTMLElement) {
  if (el.matches(SELETOR_VERTICAL)) medirVertical(el)
  if (el.matches(SELETOR_LADOS)) medirLados(el)
}

let instalado = false

export function instalarEsmaecerRolagem() {
  if (typeof window === 'undefined' || instalado) return
  instalado = true
  // Rolar: mede só a área que rolou.
  document.addEventListener(
    'scroll',
    (e) => {
      const el = e.target
      if (el instanceof HTMLElement) medirAreaRolagem(el)
    },
    { capture: true, passive: true },
  )
  // Conteúdo que chega ou muda de tamanho (mensagens novas, troca de aba): mede todas, com folga.
  const todas = () => {
    document.querySelectorAll<HTMLElement>(SELETOR_VERTICAL).forEach(medirVertical)
    document.querySelectorAll<HTMLElement>(SELETOR_LADOS).forEach(medirLados)
  }
  let pendente = 0
  const agendar = () => {
    if (pendente) return
    pendente = window.setTimeout(() => {
      pendente = 0
      todas()
    }, 120)
  }
  new MutationObserver(agendar).observe(document.body, { childList: true, subtree: true, characterData: true })
  window.addEventListener('resize', agendar, { passive: true })
  agendar()
}

/**
 * Esmaecido das áreas de rolagem onde o navegador não tem animação guiada por
 * rolagem (o Safari de alguns iPhones, por exemplo). Regra do design system:
 * conteúdo que rola nunca some atrás de uma borda sólida. Nesses navegadores, a
 * própria página mede a rolagem de cada `.area-rolagem` e `.area-rolagem-dupla`
 * e passa as alturas do esmaecido para o CSS (--esmaecer-js-topo e
 * --esmaecer-js-fim): o topo esmaece quando há conteúdo acima, o fim quando há
 * conteúdo abaixo. Roda sempre; o CSS usa o maior entre o nativo e esta medida.
 */
const SELETOR = '.area-rolagem, .area-rolagem-dupla'
/** Faixas que rolam de lado (abas, kanban, atalhos): as bordas esmaecem quando há mais conteúdo para aquele lado. */
const SELETOR_LADOS = '.esmaecer-lados'
const LADO = 24

function medirLados(el: HTMLElement) {
  const esquerda = el.scrollLeft
  const direita = el.scrollWidth - el.clientWidth - el.scrollLeft
  el.style.setProperty('--esmaecer-esquerda', `${Math.min(Math.max(esquerda, 0), LADO)}px`)
  el.style.setProperty('--esmaecer-direita', `${Math.min(Math.max(direita, 0), LADO)}px`)
}
const MAX = 44
const FAIXA = 60

function medir(el: HTMLElement) {
  const acima = el.scrollTop
  const abaixo = el.scrollHeight - el.clientHeight - el.scrollTop
  el.style.setProperty('--esmaecer-js-topo', `${(Math.min(Math.max(acima, 0), FAIXA) / FAIXA) * MAX}px`)
  el.style.setProperty('--esmaecer-js-fim', `${(Math.min(Math.max(abaixo, 0), FAIXA) / FAIXA) * MAX}px`)
}

export function instalarEsmaecerRolagem() {
  if (typeof window === 'undefined') return
  // Roda em todo navegador: há navegadores que dizem ter a animação guiada por rolagem e não a aplicam.
  // Rolar: mede só a área que rolou.
  document.addEventListener(
    'scroll',
    (e) => {
      const el = e.target
      if (el instanceof HTMLElement && el.matches(SELETOR)) medir(el)
      if (el instanceof HTMLElement && el.matches(SELETOR_LADOS)) medirLados(el)
    },
    { capture: true, passive: true },
  )
  // Conteúdo que chega ou muda de tamanho (mensagens novas, troca de aba): mede todas, com folga.
  const todas = () => {
    document.querySelectorAll<HTMLElement>(SELETOR).forEach(medir)
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

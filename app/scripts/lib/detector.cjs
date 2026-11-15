// Detector de defeitos de interface (UI Lab e telas reais). A função `detectar`
// roda dentro da página (page.evaluate) e devolve os achados por regra:
//   texto-cortado          texto cortado sem reticências, ou com reticências e sem título
//   sobreposicao           dois irmãos que se cobrem (inclui o conteúdo que vaza para o vizinho)
//   rolagem-sem-esmaecido  área que rola sem a máscara de esmaecer (ou com a máscara parada)
//   rolagem-lateral        a página rola de lado, ou o conteúdo é mais largo que a área e some
//   toque                  alvo de toque menor que 44px (só nas larguras com toque)
//   contraste              texto abaixo do AA (4,5:1; 3:1 no texto grande)
//   vao                    widget com mais da metade vazia, célula vazia no meio da grade, card vazio
//   fora-do-card           texto, botão ou selo que passa da borda do card
// Cada achado: { regra, detalhe, caixa: [x, y, largura, altura] }.

/* eslint-disable */
function detectar(opcoes) {
  const toque = !!(opcoes && opcoes.toque)
  const W = window.innerWidth
  const H = window.innerHeight
  const achados = []
  const vistos = new Set()
  const add = (regra, detalhe, el) => {
    const k = regra + '|' + detalhe
    if (vistos.has(k)) return
    vistos.add(k)
    const b = el && el.getBoundingClientRect ? el.getBoundingClientRect() : null
    achados.push({ regra, detalhe, caixa: b ? [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)] : null })
  }
  const cls = (el) => (typeof el.className === 'string' ? el.className : el.className && el.className.baseVal) || ''
  const desc = (el) => {
    const t = (el.innerText || el.getAttribute('aria-label') || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 50)
    const c = cls(el).split(' ').filter(Boolean).slice(0, 3).join('.')
    return `${el.tagName.toLowerCase()}${c ? '.' + c : ''} "${t}"`
  }
  const estilos = new Map()
  const cs = (el) => {
    let s = estilos.get(el)
    if (!s) estilos.set(el, (s = getComputedStyle(el)))
    return s
  }
  const corta = (el) => !/visible/.test(cs(el).overflowX) || !/visible/.test(cs(el).overflowY)
  const rola = (el) => /(auto|scroll)/.test(cs(el).overflowY) || /(auto|scroll)/.test(cs(el).overflowX)
  const decorativo = (el) => !!el.closest('svg, orb-avatar, heild-logo, canvas, .sr-only')
  // Visível de verdade: tem caixa, não está escondido e não foi rolado para fora de quem o corta.
  const visivel = (el) => {
    const b = el.getBoundingClientRect()
    if (b.width < 1 || b.height < 1) return false
    const s = cs(el)
    if (s.visibility === 'hidden' || s.display === 'none' || parseFloat(s.opacity) < 0.05) return false
    for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
      const sa = cs(a)
      if (sa.display === 'none' || parseFloat(sa.opacity) < 0.05) return false
      if (corta(a)) {
        const ab = a.getBoundingClientRect()
        if (b.right <= ab.left + 1 || b.left >= ab.right - 1 || b.bottom <= ab.top + 1 || b.top >= ab.bottom - 1) return false
      }
    }
    return true
  }
  const ehCard = (el) => {
    const s = cs(el)
    const raio = parseFloat(s.borderTopLeftRadius) || 0
    const fundo = s.backgroundColor !== 'rgba(0, 0, 0, 0)' && s.backgroundColor !== 'transparent'
    return raio >= 12 && (fundo || s.boxShadow !== 'none') && el.getBoundingClientRect().width > 120
  }
  const todos = [...document.body.querySelectorAll('*')].filter((el) => !decorativo(el))
  const comTexto = todos.filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()))
  const caixaTexto = (el) => {
    const r = document.createRange()
    let l = Infinity
    let rt = -Infinity
    let t = Infinity
    let bt = -Infinity
    for (const n of el.childNodes) {
      if (n.nodeType !== 3 || !n.textContent.trim()) continue
      r.selectNodeContents(n)
      for (const q of r.getClientRects()) {
        if (!q.width) continue
        l = Math.min(l, q.left)
        rt = Math.max(rt, q.right)
        t = Math.min(t, q.top)
        bt = Math.max(bt, q.bottom)
      }
    }
    return rt === -Infinity ? null : { left: l, right: rt, top: t, bottom: bt }
  }
  const temTitulo = (el) => {
    for (let a = el, i = 0; a && i < 5; a = a.parentElement, i++) if (a.getAttribute('title') || a.getAttribute('aria-label')) return true
    return false
  }
  const reticencias = (el) => {
    const s = cs(el)
    return s.textOverflow === 'ellipsis' || (s.webkitLineClamp && s.webkitLineClamp !== 'none')
  }

  // 1. Texto cortado e texto fora do card.
  for (const el of comTexto) {
    if (!visivel(el)) continue
    const s = cs(el)
    // a) o próprio elemento corta o texto
    if (corta(el) && !rola(el)) {
      const cortaLado = el.scrollWidth > el.clientWidth + 1
      const cortaBaixo = el.scrollHeight > el.clientHeight + 2 && s.webkitLineClamp && s.webkitLineClamp !== 'none'
      if (cortaLado || cortaBaixo) {
        if (!reticencias(el)) add('texto-cortado', `cortado sem reticências: ${desc(el)}`, el)
        else if (!temTitulo(el)) add('texto-cortado', `com reticências e sem título: ${desc(el)}`, el)
        continue
      }
    }
    // b) um ancestral corta (sem rolar) ou o texto passa da borda do card
    const tb = caixaTexto(el)
    if (!tb) continue
    for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
      const ab = a.getBoundingClientRect()
      const passa = tb.right > ab.right + 2 || tb.left < ab.left - 2
      if (corta(a)) {
        if (passa && !rola(a) && !reticencias(a)) add('texto-cortado', `cortado pela caixa de fora: ${desc(el)}`, el)
        break
      }
      if (ehCard(a)) {
        if (passa) add('fora-do-card', `texto ${Math.round(Math.max(tb.right - ab.right, ab.left - tb.left))}px fora do card: ${desc(el)}`, el)
        break
      }
    }
    if (tb.right > W + 1 || tb.left < -1) {
      let cortado = false
      for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) if (corta(a)) cortado = true
      if (!cortado) add('fora-do-card', `texto fora da tela: ${desc(el)}`, el)
    }
  }
  // Botões, selos e campos que passam da borda do card.
  for (const el of document.body.querySelectorAll('button, a[href], input, select, textarea, [data-slot="badge"], img')) {
    if (decorativo(el) || !visivel(el)) continue
    if (/(absolute|fixed)/.test(cs(el).position)) continue
    const b = el.getBoundingClientRect()
    for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
      if (corta(a)) break
      if (ehCard(a)) {
        const ab = a.getBoundingClientRect()
        if (b.right > ab.right + 2 || b.left < ab.left - 2) add('fora-do-card', `${Math.round(Math.max(b.right - ab.right, ab.left - b.left))}px fora do card: ${desc(el)}`, el)
        break
      }
    }
  }

  // 2. Sobreposição entre irmãos: a caixa de cada um soma o conteúdo que vaza dele (sem os absolutos e sem o que é cortado).
  const tinta = new Map()
  const fluxo = (el) => !/(absolute|fixed)/.test(cs(el).position)
  const tintaDe = (el) => {
    if (tinta.has(el)) return tinta.get(el)
    const b = el.getBoundingClientRect()
    let r = { left: b.left, right: b.right, top: b.top, bottom: b.bottom }
    if (!corta(el)) {
      for (const f of el.children) {
        if (!fluxo(f) || decorativo(f) || cs(f).display === 'none' || cs(f).visibility === 'hidden') continue
        const fb = tintaDe(f)
        if (!fb || fb.right - fb.left < 1) continue
        r = { left: Math.min(r.left, fb.left), right: Math.max(r.right, fb.right), top: Math.min(r.top, fb.top), bottom: Math.max(r.bottom, fb.bottom) }
      }
    }
    tinta.set(el, r)
    return r
  }
  const margemNegativa = (el) => {
    const s = cs(el)
    return parseFloat(s.marginLeft) < 0 || parseFloat(s.marginRight) < 0 || parseFloat(s.marginTop) < 0 || parseFloat(s.marginBottom) < 0
  }
  const temConteudo = (el) => (el.innerText || '').trim().length > 0 || !!el.querySelector('button, input, select, img, svg')
  for (const pai of todos) {
    const filhos = [...pai.children].filter((f) => fluxo(f) && !decorativo(f) && cs(f).display !== 'contents' && visivel(f))
    if (filhos.length < 2) continue
    if (/-space-[xy]-/.test(cls(pai))) continue
    const caixas = filhos.map(tintaDe)
    const n = filhos.length
    for (let i = 0; i < n; i++)
      for (let j = i + 1; j < Math.min(n, i + 10); j++) {
        const a = caixas[i]
        const b = caixas[j]
        const ix = Math.min(a.right, b.right) - Math.max(a.left, b.left)
        const iy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)
        if (ix <= 2 || iy <= 2) continue
        if (margemNegativa(filhos[i]) || margemNegativa(filhos[j])) continue
        if (!temConteudo(filhos[i]) || !temConteudo(filhos[j])) continue
        // Pilha de propósito (o rótulo em negrito invisível sob o visível; o mesmo lugar da grade).
        const gi = cs(filhos[i]).gridArea
        if (gi && gi !== 'auto' && gi === cs(filhos[j]).gridArea && !/auto/.test(gi)) continue
        add('sobreposicao', `${desc(filhos[i])} × ${desc(filhos[j])} (${Math.round(ix)}×${Math.round(iy)}px)`, filhos[j])
      }
  }

  // 3. Rolagem: toda área que rola tem a máscara de esmaecer, e ela esmaece o lado que tem mais.
  const se = document.scrollingElement
  if (se.scrollWidth > W + 1) add('rolagem-lateral', `a página rola ${se.scrollWidth - W}px de lado`, se)
  const px = (v) => parseFloat(v) || 0
  for (const el of todos) {
    if (el === se || el === document.body || /^(TEXTAREA|SELECT|INPUT)$/.test(el.tagName)) continue
    const s = cs(el)
    const y = /(auto|scroll)/.test(s.overflowY) && el.scrollHeight > el.clientHeight + 2
    const x = /(auto|scroll)/.test(s.overflowX) && el.scrollWidth > el.clientWidth + 2
    if ((y || x) && visivel(el)) {
      const mascara = s.maskImage && s.maskImage !== 'none' ? s.maskImage : s.webkitMaskImage
      if (!mascara || mascara === 'none') {
        add('rolagem-sem-esmaecido', `${y ? 'vertical' : 'horizontal'} sem máscara: ${desc(el)}`, el)
        continue
      }
      if (y) {
        const abaixo = el.scrollHeight - el.clientHeight - el.scrollTop > 4
        const fim = Math.max(px(s.getPropertyValue('--esmaecer-fim')), px(s.getPropertyValue('--esmaecer-js-fim')))
        if (abaixo && fim < 1) add('rolagem-sem-esmaecido', `há conteúdo abaixo e o fim não esmaece: ${desc(el)}`, el)
      }
      if (x) {
        const direita = el.scrollWidth - el.clientWidth - el.scrollLeft > 4
        if (direita && px(s.getPropertyValue('--esmaecer-direita')) < 1) add('rolagem-sem-esmaecido', `há conteúdo à direita e a borda não esmaece: ${desc(el)}`, el)
      }
    }
    // Conteúdo mais largo que a área que só rola para baixo: o que passa some sem aviso.
    if (/(auto|scroll)/.test(s.overflowY) && /(hidden|clip)/.test(s.overflowX) && el.scrollWidth > el.clientWidth + 2 && el.clientHeight > 120 && visivel(el)) add('rolagem-lateral', `conteúdo ${el.scrollWidth - el.clientWidth}px mais largo que a área: ${desc(el)}`, el)
  }

  // 4. Alvos de toque (só com toque).
  if (toque) {
    const sel = 'button, a[href], input:not([type=hidden]), select, textarea, summary, [role=button], [role=tab], [role=radio], [role=checkbox], [role=switch], [role=menuitem], [role=option]'
    for (const el of document.body.querySelectorAll(sel)) {
      if (decorativo(el) || el.disabled || !visivel(el)) continue
      if (el.parentElement && el.parentElement.closest(sel)) continue
      if (el.tagName === 'A' && el.parentElement && [...el.parentElement.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue
      const b = el.getBoundingClientRect()
      let w = b.width
      let h = b.height
      const lab = el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`)
      for (const l of [lab, el.closest('label')]) {
        if (!l) continue
        const lb = l.getBoundingClientRect()
        w = Math.max(w, lb.width)
        h = Math.max(h, lb.height)
      }
      for (const ps of ['::after', '::before']) {
        const s = getComputedStyle(el, ps)
        if (s.content === 'none' || s.position !== 'absolute') continue
        w = Math.max(w, b.width - px(s.left) - px(s.right))
        h = Math.max(h, b.height - px(s.top) - px(s.bottom))
      }
      const minimo = el.type === 'checkbox' || el.type === 'radio' ? 23.5 : 43.5
      if (w < minimo || h < minimo) add('toque', `${Math.round(w)}×${Math.round(h)}px: ${desc(el)}`, el)
    }
  }

  // 5. Contraste do texto (WCAG AA).
  const tela = document.createElement('canvas')
  tela.width = tela.height = 1
  const ctx = tela.getContext('2d', { willReadFrequently: true })
  const cores = new Map()
  const rgba = (cor) => {
    if (cores.has(cor)) return cores.get(cor)
    ctx.clearRect(0, 0, 1, 1)
    ctx.fillStyle = 'rgba(0,0,0,0)'
    ctx.fillStyle = cor
    ctx.fillRect(0, 0, 1, 1)
    const d = ctx.getImageData(0, 0, 1, 1).data
    const v = [d[0], d[1], d[2], d[3] / 255]
    cores.set(cor, v)
    return v
  }
  const sobre = (c, f) => [c[0] * c[3] + f[0] * (1 - c[3]), c[1] * c[3] + f[1] * (1 - c[3]), c[2] * c[3] + f[2] * (1 - c[3]), 1]
  const luz = (c) => {
    const f = (v) => {
      const s = v / 255
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
    }
    return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2])
  }
  const razao = (a, b) => {
    const [l1, l2] = [luz(a), luz(b)].sort((m, n) => n - m)
    return (l1 + 0.05) / (l2 + 0.05)
  }
  const raizFundo = rgba(getComputedStyle(document.documentElement).getPropertyValue('--background').trim() || '#fff')
  const RE_COR = /(rgba?\([^)]*\)|oklch\([^)]*\)|oklab\([^)]*\)|lab\([^)]*\)|lch\([^)]*\)|color\([^)]*\)|hsla?\([^)]*\)|#[0-9a-fA-F]{3,8})/g
  /** Fundos possíveis atrás do elemento (mais de um quando há gradiente): compõe as camadas até achar uma opaca. */
  const fundos = (el) => {
    const camadas = []
    for (let a = el; a; a = a.parentElement) {
      const s = cs(a)
      const c = rgba(s.backgroundColor)
      if (c[3] > 0) camadas.push(c)
      if (c[3] >= 0.99) return { bases: [camadas.pop()], camadas }
      if (s.backgroundImage && s.backgroundImage !== 'none' && /gradient/.test(s.backgroundImage)) {
        const stops = (s.backgroundImage.match(RE_COR) || []).map(rgba).filter((x) => x[3] > 0.5)
        // Gradiente de cima para baixo com duas cores: a cor na altura do elemento. Outros: o pior caso.
        if (stops.length === 2 && /^linear-gradient\(/.test(s.backgroundImage) && !/to (right|left|top)|deg|turn|rad/.test(s.backgroundImage)) {
          const gb = a.getBoundingClientRect()
          const eb = el.getBoundingClientRect()
          const t = Math.min(1, Math.max(0, (eb.top + eb.height / 2 - gb.top) / Math.max(1, gb.height)))
          const [c0, c1] = stops
          return { bases: [[c0[0] + (c1[0] - c0[0]) * t, c0[1] + (c1[1] - c0[1]) * t, c0[2] + (c1[2] - c0[2]) * t, 1]], camadas }
        }
        if (stops.length) return { bases: stops.map((x) => [x[0], x[1], x[2], 1]), camadas }
      }
    }
    return { bases: [raizFundo], camadas }
  }
  for (const el of comTexto) {
    if (!visivel(el)) continue
    if (el.closest(':disabled, [aria-disabled="true"], [data-disabled], [inert]')) continue
    const s = cs(el)
    let cor = rgba(s.color)
    if (cor[3] === 0) continue
    // Opacidade do elemento e dos ancestrais (até o fundo) clareia o texto.
    let op = 1
    for (let a = el; a && a !== document.body; a = a.parentElement) op *= parseFloat(cs(a).opacity)
    const { bases, camadas } = fundos(el)
    let pior = Infinity
    for (const base of bases) {
      let f = base
      for (let i = camadas.length - 1; i >= 0; i--) f = sobre(camadas[i], f)
      const t = sobre([cor[0], cor[1], cor[2], cor[3] * op], f)
      pior = Math.min(pior, razao(t, f))
    }
    const tamanho = parseFloat(s.fontSize)
    const grande = tamanho >= 24 || (tamanho >= 18.66 && parseInt(s.fontWeight) >= 700)
    const minimo = grande ? 3 : 4.5
    if (pior < minimo - 0.05) add('contraste', `${pior.toFixed(2).replace('.', ',')}:1 (mínimo ${String(minimo).replace('.', ',')}): ${desc(el)}`, el)
  }

  // 6. Vão: widget com mais da metade vazia, card vazio, célula vazia no meio da grade de widgets.
  for (const art of document.body.querySelectorAll('article[aria-label]')) {
    if (!visivel(art)) continue
    const corpo = art.querySelector('[data-corpo-widget]')
    if (!corpo || corpo.querySelector('[data-estado-vazio]')) continue
    const cb = corpo.getBoundingClientRect()
    if (cb.height < 150) continue
    let fim = cb.top
    let algo = false
    for (const f of corpo.querySelectorAll('*')) {
      if (f.children.length && f.tagName !== 'svg' && !f.tagName.includes('-')) continue
      const fb = f.getBoundingClientRect()
      if (!fb.width || !fb.height) continue
      algo = true
      fim = Math.max(fim, Math.min(fb.bottom, cb.top + corpo.scrollHeight))
    }
    const usado = (fim - cb.top) / cb.height
    if (!algo) add('vao', `widget vazio: ${art.getAttribute('aria-label')}`, art)
    else if (usado < 0.45) add('vao', `widget ${Math.round(usado * 100)}% ocupado (${Math.round(cb.height)}px): ${art.getAttribute('aria-label')}`, art)
  }
  for (const el of document.body.querySelectorAll('section, article, div, li')) {
    if (decorativo(el) || !ehCard(el) || !visivel(el)) continue
    const b = el.getBoundingClientRect()
    if (b.height < 120 || b.width < 120) continue
    if ((el.innerText || '').trim().length > 2 || el.querySelector('svg, img, canvas, input, textarea, select, orb-avatar, heild-logo, video, iframe')) continue
    add('vao', `card vazio ${Math.round(b.width)}×${Math.round(b.height)}: ${desc(el)}`, el)
  }
  for (const g of document.body.querySelectorAll('[style*="grid-auto-rows"]')) {
    const s = cs(g)
    if (s.display !== 'grid' || !visivel(g)) continue
    const cols = s.gridTemplateColumns.split(' ').filter((x) => /px$/.test(x)).map(parseFloat)
    const linhas = s.gridTemplateRows.split(' ').filter((x) => /px$/.test(x)).map(parseFloat)
    if (cols.length < 2 || linhas.length < 2) continue
    const rs = [...g.children].filter((k) => visivel(k) && cs(k).position !== 'absolute').map((k) => k.getBoundingClientRect())
    const gb = g.getBoundingClientRect()
    const gap = px(s.columnGap)
    const rgap = px(s.rowGap)
    const xs = []
    let x = gb.left + px(s.paddingLeft)
    for (const c of cols) {
      xs.push([x, x + c])
      x += c + gap
    }
    const ys = []
    let yy = gb.top + px(s.paddingTop)
    for (const l of linhas) {
      ys.push([yy, yy + l])
      yy += l + rgap
    }
    let area = 0
    ys.forEach(([y0, y1]) =>
      xs.forEach(([x0, x1]) => {
        const cx = (x0 + x1) / 2
        const cy = (y0 + y1) / 2
        if (rs.some((q) => cx > q.left && cx < q.right && cy > q.top && cy < q.bottom)) return
        if (rs.some((q) => cx > q.left && cx < q.right && q.top >= y1 - 1)) area += (y1 - y0 + rgap) * (x1 - x0)
      }),
    )
    const vazias = Math.round((area / ((xs[0][1] - xs[0][0]) * 172)) * 10) / 10
    if (vazias >= 0.5) add('vao', `${String(vazias).replace('.', ',')} célula(s) vazia(s) no meio da grade de widgets`, g)
  }
  return achados
}

const regras = ['texto-cortado', 'sobreposicao', 'rolagem-sem-esmaecido', 'rolagem-lateral', 'toque', 'contraste', 'vao', 'fora-do-card']

module.exports = { detectar, regras }

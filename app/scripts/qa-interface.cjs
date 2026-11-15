// QA de interface: percorre as rotas do wireframe em quatro larguras, tira prints e
// detecta automaticamente os problemas do docs/wireframe/PADRAO_DE_INTERFACE.md:
//   rolagem   rolagem horizontal da página (documento ou área de rolagem principal)
//   texto     texto que vaza do card, da tela ou é cortado sem reticências
//   toque     alvo de toque menor que 44px (só celular e tablet, com toque)
//   vazio     card vazio ou widget com mais da metade da área sem conteúdo
//   buraco    vão grande na grade (célula vazia no meio, com widget embaixo; ou card bem mais baixo que a linha)
//
// Uso: app servido em http://localhost:6200/ (npx vite --port 6200 --strictPort) e
//      node scripts/qa-interface.cjs <pasta-dos-prints> [filtro-de-rota] [larguras]
//   URL_APP=http://localhost:6100/ muda o endereço; larguras: "1440,390" (padrão: as quatro).
//   Grava <pasta>/qa-interface.json com tudo o que achou e imprime o resumo por largura.
const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')

const out = process.argv[2] || '.'
const filtro = process.argv[3] && process.argv[3] !== '-' ? new RegExp(process.argv[3]) : null
const base = process.env.URL_APP || 'http://localhost:6200/'
const todas = [
  { nome: '1440', width: 1440, height: 900 },
  { nome: '1024', width: 1024, height: 768 },
  { nome: '768', width: 768, height: 1024, toque: true },
  { nome: '390', width: 390, height: 844, toque: true },
]
const larguras = process.argv[4] ? todas.filter((v) => process.argv[4].split(',').includes(v.nome)) : todas

const { rotas, rotasApp } = require('./lib/rotas-qa.cjs')
const lista = [...rotas, ...rotasApp].filter((r) => !filtro || filtro.test(r.rota))

const nomeArquivo = (rota, v) => `${rota.replace(/^#\//, '').replace(/[?=&/]+/g, '_')}--${v}.png`

/** Roda dentro da página: devolve os problemas encontrados. */
function medir(toque) {
  const W = window.innerWidth
  const H = window.innerHeight
  const r = { rolagem: [], texto: [], toque: [], vazio: [], buraco: [] }
  const desc = (el) => {
    const t = (el.innerText || el.getAttribute('aria-label') || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 48)
    const c = String(el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className).split(' ').filter(Boolean).slice(0, 4).join('.')
    return `${el.tagName.toLowerCase()}${c ? '.' + c : ''} "${t}"`
  }
  const visivel = (el) => {
    const b = el.getBoundingClientRect()
    if (!b.width || !b.height) return false
    const cs = getComputedStyle(el)
    return cs.visibility !== 'hidden' && cs.display !== 'none' && !el.closest('[aria-hidden="true"], [inert]')
  }
  const raiz = document.querySelector('[data-qa-raiz]') || document.body
  // Diálogos e gavetas abertos não entram (o QA olha a tela); a moldura e o conteúdo, sim.
  const fora = (el) => !!el.closest('[role="dialog"], [data-radix-popper-content-wrapper]')
  const temClasse = (el, re) => re.test(typeof el.className === 'string' ? el.className : '')
  const rolagemIntencional = (el) => temClasse(el, /overflow-x-(auto|scroll)|snap-x|sem-barra/) || el.hasAttribute('data-rolagem-horizontal')

  // 1. Rolagem horizontal da página.
  const se = document.scrollingElement
  if (se.scrollWidth > W + 1) r.rolagem.push(`documento ${se.scrollWidth}px em ${W}px`)
  for (const el of raiz.querySelectorAll('*')) {
    if (fora(el) || !visivel(el)) continue
    const cs = getComputedStyle(el)
    if (!/(auto|scroll)/.test(cs.overflowY) || /(hidden|clip)/.test(cs.overflowX)) continue
    if (el.clientHeight < H * 0.4 || rolagemIntencional(el)) continue
    if (el.scrollWidth > el.clientWidth + 1) r.rolagem.push(`${desc(el)} rola ${el.scrollWidth - el.clientWidth}px de lado`)
  }

  // Card: superfície com fundo e canto arredondado (Caixa, Widget, cartões, botões).
  const ehCard = (el) => {
    const cs = getComputedStyle(el)
    const raio = parseFloat(cs.borderTopLeftRadius) || 0
    const fundo = cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== 'transparent'
    return raio >= 8 && (fundo || cs.boxShadow !== 'none' || parseFloat(cs.borderTopWidth) > 0)
  }

  // 2. Texto vazando: o texto passa da borda do card ou da tela, sem rolagem/corte intencional no caminho.
  const vistos = new Set()
  for (const el of raiz.querySelectorAll('*')) {
    if (fora(el) || el.closest('svg')) continue
    const nos = [...el.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim())
    if (!nos.length || !visivel(el)) continue
    // Texto só para leitor de tela (sr-only) não aparece.
    if (el.closest('.sr-only') || el.getBoundingClientRect().width <= 1 || getComputedStyle(el).clipPath !== 'none' || getComputedStyle(el).clip !== 'auto') continue
    const range = document.createRange()
    let tl = Infinity
    let tr = -Infinity
    for (const n of nos) {
      range.selectNodeContents(n)
      for (const q of range.getClientRects()) {
        if (!q.width) continue
        tl = Math.min(tl, q.left)
        tr = Math.max(tr, q.right)
      }
    }
    if (tr === -Infinity) continue
    // Sobe até o primeiro card; se algo no caminho corta (overflow), o corte é dele.
    let a = el
    let problema = null
    let cortado = false
    while (a && a !== document.body) {
      const cs = getComputedStyle(a)
      const b = a.getBoundingClientRect()
      const corta = !/visible/.test(cs.overflowX)
      if (corta) {
        cortado = true
        if (tr > b.right + 2 || tl < b.left - 2) {
          const reticencias = cs.textOverflow === 'ellipsis' || cs.webkitLineClamp !== 'none' || temClasse(a, /truncate|line-clamp|text-ellipsis/)
          if (rolagemIntencional(a) || /(auto|scroll)/.test(cs.overflowX)) break
          if (!reticencias) problema = `cortado sem reticências: ${desc(el)}`
        }
        break
      }
      if (a !== el && ehCard(a)) {
        if (tr > b.right + 2 || tl < b.left - 2) problema = `vaza do card ${Math.round(Math.max(tr - b.right, b.left - tl))}px: ${desc(el)}`
        break
      }
      a = a.parentElement
    }
    // Fora da tela só conta se nada no caminho até a página corta (faixa com rolagem própria, card com overflow).
    if (!problema && !cortado) {
      for (let b = a; b && b !== document.body; b = b.parentElement) if (!/visible/.test(getComputedStyle(b).overflowX)) cortado = true
    }
    if (!problema && !cortado && (tr > W + 1 || tl < -1)) problema = `vaza da tela: ${desc(el)}`
    if (problema && !vistos.has(problema)) {
      vistos.add(problema)
      r.texto.push(problema)
    }
  }

  // 3. Alvos de toque (celular e tablet): menores que 44px, contando a área estendida (::after).
  if (toque) {
    const sel = 'button, a[href], input:not([type=hidden]), select, textarea, summary, [role=button], [role=tab], [role=radio], [role=checkbox], [role=switch], [role=menuitem], [role=option]'
    for (const el of raiz.querySelectorAll(sel)) {
      if (fora(el) || !visivel(el) || el.disabled) continue
      if (el.parentElement && el.parentElement.closest(sel)) continue
      // Link no meio do texto corrido é exceção (WCAG 2.5.8).
      if (el.tagName === 'A' && el.parentElement && [...el.parentElement.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue
      let b = el.getBoundingClientRect()
      let w = b.width
      let h = b.height
      const lab = el.id && document.querySelector(`label[for="${el.id}"]`)
      const envolve = el.closest('label')
      for (const l of [lab, envolve]) {
        if (!l) continue
        const lb = l.getBoundingClientRect()
        w = Math.max(w, lb.width)
        h = Math.max(h, lb.height)
      }
      for (const ps of ['::after', '::before']) {
        const cs = getComputedStyle(el, ps)
        if (cs.content === 'none' || cs.position !== 'absolute') continue
        const n = (v) => parseFloat(v) || 0
        w = Math.max(w, b.width - n(cs.left) - n(cs.right))
        h = Math.max(h, b.height - n(cs.top) - n(cs.bottom))
      }
      // Caixa e rádio nativos: 24px bastam (WCAG 2.5.8) quando não há rótulo maior em volta.
      const minimo = el.type === 'checkbox' || el.type === 'radio' ? 23.5 : 43.5
      if (w < minimo || h < minimo) r.toque.push(`${Math.round(w)}×${Math.round(h)} ${desc(el)}`)
    }
  }

  // 4a. Widgets e cards vazios ou com mais da metade da área sem conteúdo.
  for (const art of raiz.querySelectorAll('article[aria-label]')) {
    if (fora(art) || !visivel(art)) continue
    const corpo = [...art.children].find((c) => temClasse(c, /flex-1/))
    // Estado vazio declarado (centro do card, com a frase) não é buraco.
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
    if (!algo) r.vazio.push(`widget vazio: ${art.getAttribute('aria-label')}`)
    else if (usado < 0.45) r.vazio.push(`widget ${Math.round(usado * 100)}% ocupado (${Math.round(cb.height)}px): ${art.getAttribute('aria-label')}`)
  }
  for (const el of raiz.querySelectorAll('section, div, li')) {
    if (fora(el) || !visivel(el) || !ehCard(el)) continue
    const b = el.getBoundingClientRect()
    if (b.height < 120 || b.width < 120) continue
    if ((el.innerText || '').trim().length > 2 || el.querySelector('svg, img, canvas, input, textarea, select, orb-avatar, heild-logo, video, iframe')) continue
    r.vazio.push(`card vazio ${Math.round(b.width)}×${Math.round(b.height)}: ${desc(el)}`)
  }

  // 4b. Buracos: célula vazia no meio de uma grade, ou card que deixa vão sob ele até o fim da linha.
  for (const g of raiz.querySelectorAll('*')) {
    if (fora(g) || !visivel(g)) continue
    const cs = getComputedStyle(g)
    if (cs.display !== 'grid' && cs.display !== 'inline-grid') continue
    const cols = cs.gridTemplateColumns.split(' ').filter((x) => /px$/.test(x)).map(parseFloat)
    if (cols.length < 2) continue
    const filhos = [...g.children].filter((k) => visivel(k) && getComputedStyle(k).position !== 'absolute')
    if (filhos.length < 2) continue
    const gb = g.getBoundingClientRect()
    if (gb.height < 150) continue
    const rs = filhos.map((k) => k.getBoundingClientRect())
    // Grade de widgets (altura pelo conteúdo, PADRAO_DE_INTERFACE.md, 5): a sobra da última faixa é o fim natural;
    // só conta quando passa de uma célula (172px com o vão). Nas outras grades, qualquer vão acima de 64px.
    const gradeWidgets = !!g.style.gridAutoRows
    const limiteVao = gradeWidgets ? 172 : 64
    // Vão sob o card (linhas de alturas diferentes, sem nada abaixo na mesma coluna).
    filhos.forEach((k, i) => {
      const kb = rs[i]
      const abaixo = rs.some((o, j) => j !== i && o.top >= kb.bottom - 2 && o.left < kb.right - 4 && o.right > kb.left + 4)
      if (abaixo) return
      const vizinhos = rs.filter((o, j) => j !== i && o.top < kb.bottom && o.bottom > kb.top)
      const fundoLinha = Math.max(kb.bottom, ...vizinhos.map((o) => o.bottom))
      const vao = Math.min(fundoLinha, gb.bottom) - kb.bottom
      if (vao > limiteVao && kb.width > 100) r.buraco.push(`${Math.round(vao)}px sob ${desc(k)}`)
    })
    // Coluna esticada: o filho ocupa a linha toda, mas o conteúdo dele acaba bem antes (vão dentro da coluna ou do card).
    filhos.forEach((k, i) => {
      const kb = rs[i]
      if (kb.height < 200 || k.tagName === 'ARTICLE' || g.getAttribute('role') === 'grid') return
      const netos = [...k.children].filter((n) => visivel(n) && getComputedStyle(n).position !== 'absolute')
      if (!netos.length) return
      const fimConteudo = Math.max(...netos.map((n) => n.getBoundingClientRect().bottom))
      const vao = kb.bottom - parseFloat(getComputedStyle(k).paddingBottom) - fimConteudo
      // Card esticado até a altura da linha é o padrão (mesma altura); só conta quando sobra muito.
      const card = ehCard(k)
      if (card ? vao > 160 && vao > kb.height * 0.35 : vao > 96 && vao > kb.height * 0.25) r.buraco.push(`${Math.round(vao)}px vazios no fim de ${card ? 'card esticado' : 'coluna'} ${desc(k)}`)
    })
    // Célula vazia no meio (grade de widgets): mede por faixas de 1 coluna × 1 linha da grade; vazia no meio é a que
    // tem widget embaixo na mesma coluna (a sobra do fim não conta). Com linhas de 4px, soma a área e conta em células
    // de 156px de altura.
    const linhas = cs.gridTemplateRows.split(' ').filter((x) => /px$/.test(x)).map(parseFloat)
    if (linhas.length >= 2 && gradeWidgets) {
      const gap = parseFloat(cs.columnGap) || 0
      const rgap = parseFloat(cs.rowGap) || 0
      const xs = []
      let x = gb.left + parseFloat(cs.paddingLeft)
      for (const c of cols) { xs.push([x, x + c]); x += c + gap }
      const ys = []
      let y = gb.top + parseFloat(cs.paddingTop)
      for (const l of linhas) { ys.push([y, y + l]); y += l + rgap }
      let area = 0
      ys.forEach(([y0, y1]) => xs.forEach(([x0, x1]) => {
        const cx = (x0 + x1) / 2
        const cy = (y0 + y1) / 2
        if (rs.some((q) => cx > q.left && cx < q.right && cy > q.top && cy < q.bottom)) return
        if (rs.some((q) => cx > q.left && cx < q.right && q.top >= y1 - 1)) area += (y1 - y0 + rgap) * (x1 - x0)
      }))
      const vazias = Math.round(area / ((xs[0][1] - xs[0][0]) * 172) * 10) / 10
      if (vazias >= 0.5) r.buraco.push(`${String(vazias).replace('.', ',')} célula(s) vazia(s) no meio da grade de widgets`)
    }
  }
  return r
}

;(async () => {
  fs.mkdirSync(out, { recursive: true })
  const b = await chromium.launch()
  const resultado = {}
  const espera = (p, ms) => p.waitForTimeout(ms)
  await Promise.all(
    larguras.map(async (v) => {
      const ctx = await b.newContext({ viewport: { width: v.width, height: v.height }, ...(v.toque ? { hasTouch: true, isMobile: true } : {}) })
      const p = await ctx.newPage()
      p.setDefaultTimeout(8000)
      p.setDefaultNavigationTimeout(90000)
      const erros = []
      p.on('pageerror', (e) => erros.push(e.message))
      await p.goto(base)
      await p.waitForFunction(() => document.body && !document.body.innerText.includes('Abrindo o escritório'), null, { timeout: 45000 })
      await p.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('heild:') || k.startsWith('ui-lab:')).forEach((k) => localStorage.removeItem(k)))
      await p.reload()
      await p.waitForFunction(() => document.body && !document.body.innerText.includes('Abrindo o escritório'), null, { timeout: 45000 })
      await espera(p, 600)
      await p.getByRole('button', { name: /Fernanda Lima/ }).first().click()
      await p.getByRole('button', { name: 'Entrar', exact: true }).click()
      await espera(p, 500)
      if (await p.getByLabel('Código').count()) {
        await p.getByLabel('Código').fill('123456')
        await p.keyboard.press('Enter')
      }
      await espera(p, 1500)
      // Esconde a aba da demonstração (fica guardado).
      await p.keyboard.press('Control+Shift+D').catch(() => {})
      const meu = (resultado[v.nome] = {})
      let entrouApp = false
      for (const r of lista) {
        if (r.app && !entrouApp) {
          await p.goto(base + '#/app')
          await espera(p, 1200)
          if (await p.getByLabel('WhatsApp ou e-mail').count()) {
            await p.getByRole('button', { name: /^João Batista/ }).click()
            await p.getByRole('button', { name: 'Receber código' }).click()
            await espera(p, 1200)
            await p.getByLabel('Código').fill('123456')
            await p.getByRole('button', { name: 'Entrar', exact: true }).click()
            await espera(p, 1000)
          }
          entrouApp = true
        }
        await p.goto(base + r.rota)
        await espera(p, 1800)
        await p.keyboard.press('Escape').catch(() => {})
        await espera(p, 200)
        let achado
        try {
          achado = await p.evaluate(medir, !!v.toque)
        } catch (e) {
          achado = { erro: String(e) }
        }
        const arquivo = nomeArquivo(r.rota, v.nome)
        // Print alto: a página toda (a área de rolagem principal cresce até o conteúdo).
        const alto = await p.evaluate(() => {
          let maior = 0
          for (const el of document.querySelectorAll('main *')) {
            const cs = getComputedStyle(el)
            if (/(auto|scroll)/.test(cs.overflowY) && el.clientHeight > window.innerHeight * 0.4) maior = Math.max(maior, el.scrollHeight - el.clientHeight)
          }
          return maior
        })
        if (alto > 40) {
          await p.setViewportSize({ width: v.width, height: Math.min(v.height + alto, 6000) })
          await espera(p, 400)
        }
        await p.screenshot({ path: path.join(out, arquivo) })
        if (alto > 40) await p.setViewportSize({ width: v.width, height: v.height })
        meu[r.rota] = { grupo: r.grupo, arquivo, ...achado }
      }
      if (erros.length) meu._erros = [...new Set(erros)].slice(0, 20)
      await ctx.close()
    }),
  )
  await b.close()
  fs.writeFileSync(path.join(out, 'qa-interface.json'), JSON.stringify(resultado, null, 1))
  const cats = ['rolagem', 'texto', 'toque', 'vazio', 'buraco']
  console.log(`largura  ${cats.map((c) => c.padStart(8)).join('')}   total  (rotas: ${lista.length})`)
  for (const v of larguras) {
    const meu = resultado[v.nome]
    const soma = cats.map((c) => Object.entries(meu).filter(([k]) => k[0] === '#').reduce((s, [, x]) => s + (x[c] ? x[c].length : 0), 0))
    console.log(`${v.nome.padEnd(8)} ${soma.map((n) => String(n).padStart(8)).join('')}   ${soma.reduce((a, c) => a + c, 0)}`)
    if (meu._erros) console.log(`  erros de página: ${meu._erros.length}`)
  }
})()

// QA interativo da edição no lugar (fase 6): abre o seletor de cada tipo de
// ValorEditavel no Lab e confere o que um print parado não pega:
//   - o popover (ou a folha de baixo) cabe na tela, também com o gatilho no canto;
//   - nada estoura na horizontal (página e conteúdo do seletor), com texto longo e muitas opções;
//   - no toque, a área do gatilho tem 44 px;
//   - Esc fecha e o foco volta ao gatilho;
//   - sem erro no console.
// Uso: node scripts/qa-edicao.cjs [--larguras=390,768,1440] [--saida=pasta]
// Variável URL_APP (padrão http://localhost:6300/). Sai com código 1 se achar falha.
const fs = require('fs')
const path = require('path')
const { chromium } = require('playwright')
const { entrar } = require('./lib/entrar.cjs')

const opcao = (n, padrao) => (process.argv.find((a) => a.startsWith(`--${n}=`)) ?? `=${padrao}`).split('=')[1]
const base = process.env.URL_APP || 'http://localhost:6300/'
const alturas = { 390: 844, 768: 1024, 1024: 768, 1440: 900 }
const larguras = opcao('larguras', '390,768,1440').split(',').map(Number).filter((l) => alturas[l])
const saida = opcao('saida', path.join(__dirname, '..', '..', 'docs', 'wireframe', 'qa-edicao'))
const tipos = ['escolha', 'multipla', 'intervalo', 'numero', 'dinheiro', 'data', 'competencia', 'entidade', 'cor', 'texto', 'plano']
const textos = ['curto', 'muito-longo', 'sem-espaco']
const itens = ['poucos', 'dobro']
const posicoes = ['no-texto', 'canto']

;(async () => {
  fs.mkdirSync(saida, { recursive: true })
  const navegador = await chromium.launch()
  const falhas = []
  let casos = 0
  for (const largura of larguras) {
    const toque = largura < 1024
    const ctx = await navegador.newContext({ viewport: { width: largura, height: alturas[largura] }, ...(toque ? { hasTouch: true, isMobile: true } : {}) })
    const p = await ctx.newPage()
    p.setDefaultTimeout(8000)
    const erros = []
    p.on('pageerror', (e) => erros.push(e.message))
    p.on('console', (m) => m.type() === 'error' && erros.push(m.text()))
    await entrar(p, base)
    for (const tipo of tipos)
      for (const texto of textos)
        for (const qtd of itens)
          for (const posicao of posicoes) {
            // Texto e quantidade só mudam os tipos com rótulo/opções; nos outros, um caso basta.
            const comOpcoes = ['escolha', 'multipla', 'entidade', 'cor'].includes(tipo)
            if (!comOpcoes && qtd !== 'poucos') continue
            if (!comOpcoes && tipo !== 'texto' && texto !== 'curto') continue
            casos++
            const nome = `${tipo}__${texto}__${qtd}__${posicao}__${largura}`
            erros.length = 0
            const q = new URLSearchParams({ isolado: '1', variante: tipo, texto, itens: qtd })
            const hash = `#/lab/ui/valor-editavel?${q}`
            await p.goto(base + hash)
            await p.waitForFunction((h) => window.__labDesenhado === h, hash, { timeout: 30000 }).catch(() => {})
            await p.waitForTimeout(200)
            const gatilho = p.locator('[data-qa-raiz] button.valor-editavel, button.valor-editavel').first()
            const problemas = []
            if (!(await gatilho.count())) {
              falhas.push({ nome, problemas: ['sem gatilho .valor-editavel'] })
              continue
            }
            if (posicao === 'canto') await gatilho.evaluate((el) => Object.assign(el.style, { position: 'fixed', right: '4px', bottom: '4px', zIndex: '1' }))
            if (toque) {
              const area = await gatilho.evaluate((el) => {
                const r = el.getBoundingClientRect()
                const d = getComputedStyle(el, '::after')
                const h = d.content !== 'none' ? parseFloat(d.height) || 0 : 0
                return { alto: Math.max(r.height, h), grosso: matchMedia('(pointer: coarse)').matches }
              })
              if (area.grosso && area.alto < 44) problemas.push(`área de toque ${Math.round(area.alto)}px (<44)`)
            }
            await gatilho.click({ timeout: 4000 }).catch(() => problemas.push('gatilho coberto (não deu para clicar)'))
            await p.waitForTimeout(450)
            const medida = await p.evaluate(() => {
              const vw = innerWidth
              const vh = innerHeight
              const caixa = document.querySelector('[data-radix-popper-content-wrapper] > *') ?? [...document.querySelectorAll('[role=dialog]')].at(-1)
              if (!caixa) return { aberto: false }
              const r = caixa.getBoundingClientRect()
              const fora = r.left < -1 || r.top < -1 || r.right > vw + 1 || r.bottom > vh + 1
              // Filhos que passam da borda da caixa (ignora quem rola ou corta de propósito).
              const vaza = [...caixa.querySelectorAll('*')].filter((el) => {
                const e = el.getBoundingClientRect()
                if (!e.width || !e.height) return false
                let pai = el.parentElement
                while (pai && pai !== caixa) {
                  const cs = getComputedStyle(pai)
                  if (/(auto|scroll|hidden|clip)/.test(cs.overflowX + cs.overflow)) return false
                  pai = pai.parentElement
                }
                return e.right > r.right + 1 || e.left < r.left - 1
              }).length
              return { aberto: true, fora, vaza, paginaLarga: document.documentElement.scrollWidth > vw + 1, r: [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)] }
            })
            if (!medida.aberto) problemas.push('seletor não abriu')
            else {
              if (medida.fora) problemas.push(`seletor fora da tela ${JSON.stringify(medida.r)}`)
              if (medida.vaza) problemas.push(`${medida.vaza} elemento(s) vazam do seletor`)
              if (medida.paginaLarga) problemas.push('página com rolagem horizontal')
            }
            await p.keyboard.press('Escape')
            await p.waitForTimeout(250)
            const fechou = await p.evaluate(() => !document.querySelector('[data-radix-popper-content-wrapper]') && ![...document.querySelectorAll('[role=dialog]')].some((d) => d.getAttribute('data-state') === 'open'))
            if (!fechou) problemas.push('Esc não fechou')
            else if (!(await gatilho.evaluate((el) => document.activeElement === el))) problemas.push('foco não voltou ao gatilho')
            if (erros.length) problemas.push(`console: ${erros[0].slice(0, 120)}`)
            if (problemas.length) {
              await gatilho.click().catch(() => {})
              await p.waitForTimeout(400)
              await p.screenshot({ path: path.join(saida, `${nome}.png`) })
              await p.keyboard.press('Escape')
              await p.waitForTimeout(250)
              falhas.push({ nome, problemas })
              console.log(`- ${nome}: ${problemas.join('; ')}`)
            }
          }
    await ctx.close()
  }
  await navegador.close()
  const resumo = { geradoEm: new Date().toISOString(), casos, falhas: falhas.length, lista: falhas }
  fs.writeFileSync(path.join(saida, 'resumo.json'), JSON.stringify(resumo, null, 2))
  console.log(`${casos} casos, ${falhas.length} com falha`)
  process.exit(falhas.length ? 1 : 0)
})()

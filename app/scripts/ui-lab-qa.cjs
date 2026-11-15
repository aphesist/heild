// QA automatizado sobre o UI Lab (#/lab/ui) e as telas reais.
//
// Lab: percorre a matriz componente × estado × itens × texto × tamanho × tema ×
// largura × densidade de cada ficha (lida do próprio Lab, window.__fichasLab),
// por amostragem combinatória por pares (todo par de valores de dois eixos
// aparece em pelo menos um caso, então todo estado aparece em toda largura).
// Telas: as 67 rotas do qa-interface.cjs, em cinco larguras e quatro variantes
// (demonstração; escritório pequeno, com as listas quase vazias; "ver como"
// Membro; modo escuro).
//
// O detector (scripts/lib/detector.cjs) acusa: texto cortado sem reticências
// ou sem título, sobreposição entre irmãos, rolagem sem esmaecido, rolagem
// lateral, alvo de toque < 44px, contraste abaixo do AA, vão grande e conteúdo
// fora do card.
//
// Uso: app servido (npx vite --port 6300 --strictPort) e
//   URL_APP=http://localhost:6300/ node scripts/ui-lab-qa.cjs <pasta-fora-do-git> [opções]
//     --frente=lab|telas|widgets|ambas|tudo   (padrão: ambas = lab e telas; tudo = as três)
//     --filtro=<regex>           fichas (Lab) ou rotas (telas)
//     --larguras=390,1440        (padrão: 390,768,1024,1440,1920)
//     --variantes=demo,escuro    (telas; padrão: demo,horizonte,membro,escuro)
//     --doc                      reescreve a contagem em docs/wireframe/UI_LAB_QA.md
// Widgets: cada widget real (Início e as oito abas do Painel, com cliente e na carteira) com os
// cenários de dados (semente/cenario.ts): todo cenário de quantidade (0, 1, 3, 15, 50, 200) roda em
// todo tamanho que o widget aceita em 390, 1024 e 1440; texto, valores, datas, opcionais, estado
// (serviços falhando, sem permissão), tema, densidade e as larguras 768 e 1920 entram por pares.
// Prints: <pasta>/widgets/<aba.widget>/<versao>/<cenario>__<tamanho>__<tema>__<largura>.png
// Prints: <pasta>/<componente>/<estado>__<itens>__<texto>__<tamanho>__<tema>__<largura>.png
//         <pasta>/telas/<rota>/<variante>__<largura>.png
// Relatório: <pasta>/ui-lab-qa.json e <pasta>/resumo.md.
const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')
const { detectar, regras } = require('./lib/detector.cjs')
const { entrar, entrarApp, espera } = require('./lib/entrar.cjs')
const { rotas, rotasApp } = require('./lib/rotas-qa.cjs')

const pasta = process.argv[2]
if (!pasta || pasta.startsWith('--')) {
  console.error('Uso: node scripts/ui-lab-qa.cjs <pasta> [--frente=lab|telas|ambas] [--filtro=] [--larguras=] [--variantes=] [--doc]')
  process.exit(2)
}
const opcao = (nome, padrao) => {
  const a = process.argv.find((x) => x.startsWith(`--${nome}=`))
  return a ? a.slice(nome.length + 3) : padrao
}
const frente = opcao('frente', 'ambas')
const filtro = opcao('filtro', '') ? new RegExp(opcao('filtro', '')) : null
const base = process.env.URL_APP || 'http://localhost:6300/'
const todasLarguras = { 390: { h: 844, toque: true }, 768: { h: 1024, toque: true }, 1024: { h: 768 }, 1440: { h: 900 }, 1920: { h: 1080 } }
const larguras = opcao('larguras', '390,768,1024,1440,1920').split(',').map(Number).filter((l) => todasLarguras[l])
const variantesTelas = opcao('variantes', 'demo,horizonte,membro,escuro').split(',')
const escreverDoc = process.argv.includes('--doc')
const temas = ['fabrica', 'horizonte', 'verde-campo', 'condesp', 'requinte']

/* ---------- Amostragem por pares (determinística) ---------- */

function aleatorio(semente) {
  let a = semente >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Casos que cobrem todo par de valores de quaisquer dois fatores. */
function porPares(fatores, semente = 7) {
  const rnd = aleatorio(semente)
  const n = fatores.length
  const chave = (i, a, j, b) => (i < j ? `${i}:${a}|${j}:${b}` : `${j}:${b}|${i}:${a}`)
  const falta = new Set()
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) for (const a of fatores[i].valores) for (const b of fatores[j].valores) falta.add(chave(i, a, j, b))
  const casos = []
  if (n === 1) return fatores[0].valores.map((v) => ({ [fatores[0].nome]: v }))
  while (falta.size) {
    let melhor = null
    let melhorN = -1
    const pendentes = [...falta]
    for (let tentativa = 0; tentativa < 16; tentativa++) {
      const [p1, p2] = pendentes[Math.floor(rnd() * pendentes.length)].split('|')
      const [i, a] = [Number(p1.split(':')[0]), p1.slice(p1.indexOf(':') + 1)]
      const [j, b] = [Number(p2.split(':')[0]), p2.slice(p2.indexOf(':') + 1)]
      const caso = new Array(n).fill(null)
      caso[i] = a
      caso[j] = b
      const ordem = [...Array(n).keys()].filter((k) => k !== i && k !== j).sort(() => rnd() - 0.5)
      for (const k of ordem) {
        let vm = null
        let nm = -1
        for (const v of fatores[k].valores) {
          let c = 0
          for (let m = 0; m < n; m++) if (caso[m] !== null && falta.has(chave(k, v, m, caso[m]))) c++
          if (c > nm || (c === nm && rnd() < 0.5)) {
            nm = c
            vm = v
          }
        }
        caso[k] = vm
      }
      let novos = 0
      for (let x = 0; x < n; x++) for (let y = x + 1; y < n; y++) if (falta.has(chave(x, caso[x], y, caso[y]))) novos++
      if (novos > melhorN) {
        melhorN = novos
        melhor = caso
      }
    }
    for (let x = 0; x < n; x++) for (let y = x + 1; y < n; y++) falta.delete(chave(x, melhor[x], y, melhor[y]))
    casos.push(Object.fromEntries(fatores.map((f, k) => [f.nome, melhor[k]])))
  }
  return casos
}

/**
 * Casos que contêm a `base` inteira (produto dos fatores obrigatórios) e cobrem
 * por pares o resto: cada caso da base ganha, em cada fator livre, o valor que
 * cobre mais pares ainda faltando; o que sobrar vira caso novo.
 */
function cobrirComBase(base, livres, semente = 11) {
  const rnd = aleatorio(semente)
  const nomes = [...Object.keys(base[0] || {}), ...livres.map((f) => f.nome)]
  const valores = Object.fromEntries([...Object.keys(base[0] || {}).map((k) => [k, [...new Set(base.map((c) => c[k]))]]), ...livres.map((f) => [f.nome, f.valores])])
  const chave = (a, va, b, vb) => (a < b ? `${a}=${va}|${b}=${vb}` : `${b}=${vb}|${a}=${va}`)
  const falta = new Set()
  for (const f of livres) for (const v of f.valores) for (const n of nomes) if (n !== f.nome) for (const w of valores[n]) falta.add(chave(f.nome, v, n, w))
  const preencher = (caso) => {
    for (const f of [...livres].sort(() => rnd() - 0.5)) {
      if (caso[f.nome] !== undefined) continue
      let melhor = f.valores[0]
      let n = -1
      for (const v of f.valores) {
        let c = 0
        for (const [k, w] of Object.entries(caso)) if (falta.has(chave(f.nome, v, k, w))) c++
        if (c > n || (c === n && rnd() < 0.3)) {
          n = c
          melhor = v
        }
      }
      caso[f.nome] = melhor
    }
    const ks = Object.keys(caso)
    for (let i = 0; i < ks.length; i++) for (let j = i + 1; j < ks.length; j++) falta.delete(chave(ks[i], caso[ks[i]], ks[j], caso[ks[j]]))
    return caso
  }
  const casos = base.map((c) => preencher({ ...c }))
  // O que ficou de fora: um caso por par, preenchendo o resto (os fatores da base pelo primeiro valor que cobre mais).
  let guarda = 0
  while (falta.size && guarda++ < 400) {
    const [p1, p2] = [...falta][0].split('|')
    const caso = { [p1.split('=')[0]]: p1.slice(p1.indexOf('=') + 1), [p2.split('=')[0]]: p2.slice(p2.indexOf('=') + 1) }
    for (const k of Object.keys(base[0] || {})) if (caso[k] === undefined) caso[k] = valores[k][Math.floor(rnd() * valores[k].length)]
    casos.push(preencher(caso))
  }
  return casos
}

/* ---------- Comum ---------- */

const resultado = { geradoEm: new Date().toISOString(), base, lab: { casos: 0, achados: [] }, telas: { casos: 0, achados: [] }, widgets: { casos: 0, achados: [], porCaso: [] }, errosDePagina: [] }

async function novoContexto(navegador, largura, extra = {}) {
  const v = todasLarguras[largura]
  const ctx = await navegador.newContext({ viewport: { width: largura, height: v.h }, ...(v.toque ? { hasTouch: true, isMobile: true } : {}), ...extra })
  const p = await ctx.newPage()
  p.setDefaultTimeout(10000)
  p.setDefaultNavigationTimeout(90000)
  return { ctx, p }
}

/** Print: a tela; se o conteúdo é mais alto, a página toda (até 4000px). */
async function fotografar(p, arquivo, largura) {
  fs.mkdirSync(path.dirname(arquivo), { recursive: true })
  const alto = await p.evaluate(() => {
    let maior = 0
    for (const el of document.querySelectorAll('[data-qa-raiz], main, main *')) {
      const s = getComputedStyle(el)
      if (/(auto|scroll)/.test(s.overflowY) && el.clientHeight > window.innerHeight * 0.5) maior = Math.max(maior, el.scrollHeight - el.clientHeight)
    }
    return maior
  })
  const h = todasLarguras[largura].h
  if (alto > 40) {
    await p.setViewportSize({ width: largura, height: Math.min(h + alto, 4000) })
    await espera(p, 350)
  }
  await p.screenshot({ path: arquivo })
  if (alto > 40) await p.setViewportSize({ width: largura, height: h })
}

/* ---------- Frente 1: o Lab ---------- */

async function frenteLab(navegador) {
  const { ctx, p } = await novoContexto(navegador, 1440)
  await p.goto(base + '#/lab/ui?isolado=1')
  await p.waitForFunction(() => Array.isArray(window.__fichasLab), null, { timeout: 60000 })
  const fichas = (await p.evaluate(() => window.__fichasLab)).filter((f) => !filtro || filtro.test(f.id))
  await ctx.close()
  // Os casos de cada ficha, divididos por largura.
  const porLargura = Object.fromEntries(larguras.map((l) => [l, []]))
  for (const f of fichas) {
    const e = f.eixos
    const fatores = [{ nome: 'estado', valores: e.estados }]
    if (e.itens) fatores.push({ nome: 'itens', valores: ['0', '1', 'poucos', 'muitos', 'dobro'] })
    if (e.texto) fatores.push({ nome: 'texto', valores: ['curto', 'longo', 'muito-longo', 'sem-espaco', 'numeros'] })
    if (e.tamanhos) fatores.push({ nome: 'tamanho', valores: e.tamanhos })
    if (e.variantes) fatores.push({ nome: 'variante', valores: e.variantes.map((v) => v.valor) })
    fatores.push({ nome: 'tema', valores: temas.flatMap((t) => [`${t}:claro`, `${t}:escuro`]) })
    fatores.push({ nome: 'densidade', valores: ['padrao', 'grande'] })
    fatores.push({ nome: 'largura', valores: larguras.map(String) })
    for (const c of porPares(fatores, f.id.length * 31 + 7)) porLargura[c.largura].push({ ficha: f.id, ...c })
  }
  const total = Object.values(porLargura).reduce((s, l) => s + l.length, 0)
  console.log(`Lab: ${fichas.length} fichas, ${total} casos (por pares) em ${larguras.length} larguras`)
  let feitos = 0
  await Promise.all(
    larguras.map(async (largura) => {
      const { ctx, p } = await novoContexto(navegador, largura)
      const erros = []
      p.on('pageerror', (e) => erros.push(e.message))
      await p.goto(base + '#/lab/ui?isolado=1')
      await p.waitForFunction(() => Array.isArray(window.__fichasLab), null, { timeout: 60000 })
      for (const c of porLargura[largura]) {
        const [tema, modo] = c.tema.split(':')
        const q = new URLSearchParams({ isolado: '1', estado: c.estado, tema, modo, densidade: c.densidade })
        if (c.itens) q.set('itens', c.itens)
        if (c.texto) q.set('texto', c.texto)
        if (c.tamanho) q.set('tamanho', c.tamanho)
        if (c.variante) q.set('variante', c.variante)
        const hash = `#/lab/ui/${c.ficha}?${q}`
        erros.length = 0
        await p.evaluate((h) => (window.location.hash = h), hash)
        await p.waitForSelector(`[data-lab-ficha="${c.ficha}"]`, { timeout: 15000 }).catch(() => {})
        await espera(p, c.ficha === 'widgets-reais' ? 1100 : 650)
        if (c.estado === 'hover') {
          const alvo = p.locator('[data-qa-raiz] :is(button, a[href], [role=row], tr, [role=tab])').first()
          if (await alvo.count()) await alvo.hover({ timeout: 3000 }).catch(() => {})
        }
        if (c.estado === 'foco') await p.keyboard.press('Tab')
        if (c.estado === 'hover' || c.estado === 'foco') await espera(p, 250)
        let achados
        try {
          achados = await p.evaluate(detectar, { toque: !!todasLarguras[largura].toque })
        } catch (e) {
          achados = [{ regra: 'erro', detalhe: String(e).slice(0, 200) }]
        }
        const nome = `${c.estado}__${c.itens ?? 'na'}__${c.texto ?? 'na'}__${c.tamanho ?? 'na'}__${tema}-${modo}${c.densidade === 'grande' ? '-grande' : ''}__${largura}${c.variante ? `__${c.variante.replace(/:/g, '-')}` : ''}.png`
        const arquivo = path.join(pasta, c.ficha, nome)
        await fotografar(p, arquivo, largura)
        for (const a of achados) resultado.lab.achados.push({ ficha: c.ficha, ...c, print: path.relative(pasta, arquivo), ...a })
        if (erros.length) resultado.errosDePagina.push({ ficha: c.ficha, hash, erros: [...new Set(erros)].slice(0, 5) })
        resultado.lab.casos++
        if (++feitos % 50 === 0) console.log(`  Lab: ${feitos}/${total}`)
      }
      await ctx.close()
    }),
  )
}

/* ---------- Frente 2: as telas reais ---------- */

async function frenteTelas(navegador) {
  const lista = [...rotas, ...rotasApp].filter((r) => !filtro || filtro.test(r.rota))
  console.log(`Telas: ${lista.length} rotas × ${larguras.length} larguras × ${variantesTelas.length} variantes`)
  const tarefas = []
  for (const variante of variantesTelas) for (const largura of larguras) tarefas.push({ variante, largura })
  // Até cinco navegadores em paralelo.
  let i = 0
  await Promise.all(
    Array.from({ length: Math.min(5, tarefas.length) }, async () => {
      while (i < tarefas.length) {
        const { variante, largura } = tarefas[i++]
        const { ctx, p } = await novoContexto(navegador, largura, variante === 'escuro' ? { colorScheme: 'dark' } : {})
        const erros = []
        p.on('pageerror', (e) => erros.push(e.message))
        try {
          await entrar(p, base, variante === 'horizonte' ? { escritorio: 'esc-horizonte', pessoa: /Helena Duarte/ } : {})
          if (variante === 'membro') {
            await p.waitForFunction(() => window.__demonstracao && window.__demonstracao.verComo, null, { timeout: 15000 })
            await p.evaluate(() => window.__demonstracao.verComo({ papel: 'colaborador', vinculos: [{ setor: 'fiscal', modo: 'execucao' }] }))
            await espera(p, 500)
          }
        } catch (e) {
          resultado.errosDePagina.push({ variante, largura, erros: [`não entrou: ${String(e).slice(0, 160)}`] })
          await ctx.close()
          continue
        }
        let entrouApp = false
        for (const r of lista) {
          if (r.app && variante !== 'demo' && variante !== 'escuro') continue
          if (r.app && !entrouApp) {
            await entrarApp(p, base).catch(() => {})
            entrouApp = true
          }
          erros.length = 0
          await p.goto(base + r.rota)
          await espera(p, 1700)
          await p.keyboard.press('Escape').catch(() => {})
          await espera(p, 250)
          let achados
          try {
            achados = await p.evaluate(detectar, { toque: !!todasLarguras[largura].toque })
          } catch (e) {
            achados = [{ regra: 'erro', detalhe: String(e).slice(0, 200) }]
          }
          const nomeRota = r.rota.replace(/^#\//, '').replace(/[?=&/]+/g, '_')
          const arquivo = path.join(pasta, 'telas', nomeRota, `${variante}__${largura}.png`)
          await fotografar(p, arquivo, largura)
          for (const a of achados) resultado.telas.achados.push({ rota: r.rota, grupo: r.grupo, variante, largura, print: path.relative(pasta, arquivo), ...a })
          if (erros.length) resultado.errosDePagina.push({ rota: r.rota, variante, largura, erros: [...new Set(erros)].slice(0, 5) })
          resultado.telas.casos++
        }
        console.log(`  Telas: ${variante} · ${largura} pronto`)
        await ctx.close()
      }
    }),
  )
}

/* ---------- Frente 3: os widgets reais com os cenários de dados ---------- */

const PESO = { sobreposicao: 4, 'fora-do-card': 4, 'rolagem-lateral': 3, 'texto-espremido': 3, 'rolagem-sem-esmaecido': 3, 'texto-cortado': 2, vao: 2, toque: 1, contraste: 1, erro: 5 }

async function frenteWidgets(navegador) {
  const { ctx, p } = await novoContexto(navegador, 1440)
  await p.goto(base + '#/lab/ui/widget?isolado=1')
  await p.waitForFunction(() => Array.isArray(window.__widgetsLab) && window.__widgetsLab.length > 0, null, { timeout: 60000 })
  const widgets = (await p.evaluate(() => window.__widgetsLab)).filter((w) => !filtro || filtro.test(w.chave))
  await ctx.close()
  const principais = larguras.filter((l) => [390, 1024, 1440].includes(l))
  const extras = larguras.filter((l) => !principais.includes(l))
  const porLargura = Object.fromEntries(larguras.map((l) => [l, []]))
  for (const w of widgets) {
    const base = []
    for (const itens of ['i0', 'i1', 'i3', 'i15', 'i50', 'i200']) for (const tamanho of w.tamanhos) for (const largura of principais) base.push({ itens, tamanho, largura: String(largura) })
    const livres = [
      { nome: 'texto', valores: ['', 'tc', 'tl', 'ts'] },
      { nome: 'valores', valores: ['', 've'] },
      { nome: 'datas', valores: ['', 'dv', 'dh', 'df'] },
      { nome: 'opcionais', valores: ['', 'oa'] },
      { nome: 'estado', valores: ['padrao', 'erro', 'sem-permissao'] },
      { nome: 'tema', valores: temas.flatMap((t) => [`${t}:claro`, `${t}:escuro`]) },
      { nome: 'densidade', valores: ['padrao', 'grande'] },
    ]
    const casos = cobrirComBase(base, livres, w.chave.length * 13 + 5)
    // As larguras de fora do produto (768, 1920) entram por pares com estado, tamanho e itens.
    for (const l of extras) for (const c of porPares([{ nome: 'itens', valores: ['i0', 'i15', 'i200'] }, { nome: 'tamanho', valores: w.tamanhos }, { nome: 'estado', valores: ['padrao', 'erro', 'sem-permissao'] }, { nome: 'tema', valores: ['fabrica:claro', 'fabrica:escuro', 'condesp:claro', 'requinte:escuro'] }], l + w.id.length)) casos.push({ ...c, texto: '', valores: '', datas: '', opcionais: '', densidade: 'padrao', largura: String(l) })
    for (const c of casos) porLargura[c.largura].push({ w, ...c })
  }
  const total = Object.values(porLargura).reduce((s, l) => s + l.length, 0)
  console.log(`Widgets: ${widgets.length} widgets, ${total} casos`)
  let feitos = 0
  await Promise.all(
    larguras.map(async (largura) => {
      const { ctx, p } = await novoContexto(navegador, largura)
      const erros = []
      p.on('pageerror', (e) => erros.push(e.message))
      await p.goto(base + '#/lab/ui/widget?isolado=1')
      await p.waitForFunction(() => Array.isArray(window.__widgetsLab), null, { timeout: 60000 })
      let desdeRecarga = 0
      for (const c of porLargura[largura]) {
        // Recarrega de tempos em tempos: cada cenário abre um escritório novo e a página acumula memória.
        if (++desdeRecarga > 25) {
          desdeRecarga = 0
          await p.goto(base + '#/lab/ui/widget?isolado=1').catch(() => {})
          await p.waitForFunction(() => Array.isArray(window.__widgetsLab), null, { timeout: 60000 }).catch(() => {})
        }
        const [tema, modo] = c.tema.split(':')
        const cenario = [c.itens, c.texto, c.valores, c.datas, c.opcionais].filter(Boolean).join('.')
        const q = new URLSearchParams({ isolado: '1', variante: c.w.chave, tamanho: c.tamanho, cenario, estado: c.estado, tema, modo, densidade: c.densidade })
        erros.length = 0
        await p.evaluate((h) => (window.location.hash = h), `#/lab/ui/widget?${q}`)
        await p.waitForSelector(`[data-lab-widget="${c.w.chave}"] article`, { timeout: 15000 }).catch(() => {})
        await espera(p, 700)
        let achados
        try {
          achados = await p.evaluate(detectar, { toque: !!todasLarguras[largura].toque })
        } catch (e) {
          achados = [{ regra: 'erro', detalhe: String(e).slice(0, 200) }]
        }
        if (erros.length) achados.push(...[...new Set(erros)].slice(0, 3).map((e) => ({ regra: 'erro', detalhe: `erro de página: ${e.slice(0, 160)}` })))
        const nomeCaso = `${cenario || 'base'}${c.estado !== 'padrao' ? `.${c.estado}` : ''}`
        const arquivo = path.join(pasta, 'widgets', `${c.w.aba}.${c.w.id}`, c.w.versao, `${nomeCaso}__${c.tamanho}__${tema}-${modo}${c.densidade === 'grande' ? '-grande' : ''}__${largura}.png`)
        fs.mkdirSync(path.dirname(arquivo), { recursive: true })
        await p
          .locator(`[data-lab-widget="${c.w.chave}"]`)
          .screenshot({ path: arquivo, timeout: 8000 })
          .catch(() => p.screenshot({ path: arquivo, timeout: 8000 }))
          .catch((e) => achados.push({ regra: 'erro', detalhe: `sem print: ${String(e).slice(0, 120)}` }))
        const print = path.relative(pasta, arquivo)
        for (const a of achados) resultado.widgets.achados.push({ widget: `${c.w.aba}.${c.w.id}`, versao: c.w.versao, chave: c.w.chave, cenario: nomeCaso, tamanho: c.tamanho, tema: c.tema, largura, print, ...a })
        resultado.widgets.porCaso.push({ chave: c.w.chave, print, pontos: achados.reduce((s, a) => s + (PESO[a.regra] || 1), 0), regras: [...new Set(achados.map((a) => a.regra))] })
        resultado.widgets.casos++
        if (++feitos % 200 === 0) console.log(`  Widgets: ${feitos}/${total}`)
      }
      await ctx.close()
    }),
  )
}

/* ---------- Resumo ---------- */

function tabela(achados, chave, rotuloChave) {
  const linhas = new Map()
  for (const a of achados) {
    const k = a[chave]
    if (!linhas.has(k)) linhas.set(k, Object.fromEntries(regras.map((r) => [r, 0])))
    const l = linhas.get(k)
    l[a.regra] = (l[a.regra] || 0) + 1
  }
  const cab = `| ${rotuloChave} | ${regras.join(' | ')} | Total |\n| --- | ${regras.map(() => '---').join(' | ')} | --- |`
  const corpo = [...linhas.entries()]
    .sort((a, b) => Object.values(b[1]).reduce((s, x) => s + x, 0) - Object.values(a[1]).reduce((s, x) => s + x, 0))
    .map(([k, l]) => `| ${k} | ${regras.map((r) => l[r] || 0).join(' | ')} | ${Object.values(l).reduce((s, x) => s + x, 0)} |`)
  const tot = regras.map((r) => achados.filter((a) => a.regra === r).length)
  return `${cab}\n${corpo.join('\n')}${corpo.length ? '\n' : ''}| **Total** | ${tot.map((n) => `**${n}**`).join(' | ')} | **${achados.length}** |`
}

function resumo() {
  const lab = resultado.lab
  const telas = resultado.telas
  return [
    `Gerado em ${resultado.geradoEm} contra ${base}. Larguras: ${larguras.join(', ')}.`,
    '',
    `### Lab: ${lab.casos} casos, ${lab.achados.length} achados`,
    '',
    tabela(lab.achados, 'ficha', 'Componente'),
    '',
    `### Telas reais: ${telas.casos} casos, ${telas.achados.length} achados`,
    '',
    tabela(telas.achados, 'grupo', 'Grupo de telas'),
    '',
    ...(resultado.widgets.casos
      ? [
          `### Widgets reais com cenários: ${resultado.widgets.casos} casos, ${resultado.widgets.achados.length} achados`,
          '',
          tabela(resultado.widgets.achados.map((a) => ({ ...a, linha: `${a.widget} · ${a.versao}` })), 'linha', 'Widget · versão'),
          '',
          '**Os 10 piores casos** (pontos: sobreposição e fora do card 4, rolagem 3, texto espremido 3, texto cortado e vão 2, contraste e toque 1):',
          '',
          ...[...resultado.widgets.porCaso].sort((a, b) => b.pontos - a.pontos).slice(0, 10).map((c, i) => `${i + 1}. ${c.chave} · ${c.pontos} pontos (${c.regras.join(', ')}) · \`${c.print}\``),
          '',
        ]
      : []),
    `Erros de página (JavaScript): ${resultado.errosDePagina.length}.`,
  ].join('\n')
}

;(async () => {
  fs.mkdirSync(pasta, { recursive: true })
  const navegador = await chromium.launch()
  if (['lab', 'ambas', 'tudo'].includes(frente)) await frenteLab(navegador)
  if (['telas', 'ambas', 'tudo'].includes(frente)) await frenteTelas(navegador)
  if (['widgets', 'tudo'].includes(frente)) await frenteWidgets(navegador)
  await navegador.close()
  fs.writeFileSync(path.join(pasta, 'ui-lab-qa.json'), JSON.stringify(resultado, null, 1))
  const md = resumo()
  fs.writeFileSync(path.join(pasta, 'resumo.md'), md + '\n')
  console.log('\n' + md)
  if (escreverDoc) {
    const doc = path.join(__dirname, '..', '..', 'docs', 'wireframe', 'UI_LAB_QA.md')
    const atual = fs.existsSync(doc) ? fs.readFileSync(doc, 'utf8') : '# QA do UI Lab\n\n<!-- contagem:inicio -->\n<!-- contagem:fim -->\n'
    const novo = atual.replace(/<!-- contagem:inicio -->[\s\S]*<!-- contagem:fim -->/, `<!-- contagem:inicio -->\n${md}\n<!-- contagem:fim -->`)
    fs.writeFileSync(doc, novo)
    console.log(`Contagem escrita em ${path.relative(process.cwd(), doc)}`)
  }
})()

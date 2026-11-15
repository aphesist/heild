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
//     --frente=lab|telas|ambas   (padrão: ambas)
//     --filtro=<regex>           fichas (Lab) ou rotas (telas)
//     --larguras=390,1440        (padrão: 390,768,1024,1440,1920)
//     --variantes=demo,escuro    (telas; padrão: demo,horizonte,membro,escuro)
//     --doc                      reescreve a contagem em docs/wireframe/UI_LAB_QA.md
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

/* ---------- Comum ---------- */

const resultado = { geradoEm: new Date().toISOString(), base, lab: { casos: 0, achados: [] }, telas: { casos: 0, achados: [] }, errosDePagina: [] }

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
    `Erros de página (JavaScript): ${resultado.errosDePagina.length}.`,
  ].join('\n')
}

;(async () => {
  fs.mkdirSync(pasta, { recursive: true })
  const navegador = await chromium.launch()
  if (frente === 'lab' || frente === 'ambas') await frenteLab(navegador)
  if (frente === 'telas' || frente === 'ambas') await frenteTelas(navegador)
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

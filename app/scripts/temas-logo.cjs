// Marca branca na barra lateral (Condesp e Requinte): barra aberta e fechada e a
// animação da troca entre a logo completa e o logotipo.
// Uso, com o app rodando (npm run app):
//   node scripts/temas-logo.cjs <pasta> [url, padrão http://localhost:5173/]
// Para cada tema, claro e escuro: capturas em 1440x900 (escala 2) da barra aberta e
// fechada, um vídeo (recordVideo) de fechar e abrir, e uma sequência de quadros do
// canto da marca durante a animação. Por fim, confere que com prefers-reduced-motion
// a troca é imediata. Detalhes em src/theme/TEMAS-ESCRITORIOS.md.
const { chromium } = require('playwright')
const fs = require('fs')
const out = process.argv[2]
const url = process.argv[3] || 'http://localhost:5173/'
const temas = ['condesp', 'requinte']
const canto = { x: 0, y: 0, width: 280, height: 96 }

async function entrar(p, tema) {
  await p.goto(url)
  await p.getByRole('button', { name: /^Demonstração/ }).click()
  await p.locator('select[aria-label="Tema"]').selectOption(tema)
  await p.keyboard.press('Escape')
  await p.waitForTimeout(300)
  await p.fill('input[type=email]', 'fernanda@contabilandrade.com.br')
  await p.fill('input[type=password]', 'demonstracao')
  await p.getByRole('button', { name: 'Entrar', exact: true }).click()
  await p.waitForTimeout(300)
  await p.locator('input').first().fill('123456')
  await p.getByRole('button', { name: 'Confirmar' }).click()
  await p.waitForTimeout(1200)
}

const alternar = (p) => p.locator('nav[aria-label="Módulos"] button[aria-label="Recolher"], nav[aria-label="Módulos"] button[aria-label="Expandir"]').click()
const aberta = (p) => p.locator('nav[aria-label="Módulos"] button[aria-label="Recolher"], nav[aria-label="Módulos"] button[aria-label="Expandir"]').getAttribute('aria-expanded')

/** Quadros do canto da marca durante ~800 ms depois de alternar; devolve os tempos. */
async function quadros(p, prefixo) {
  // Clique direto no DOM: o t0 fica colado ao início da animação.
  await p.evaluate(() => document.querySelector('nav[aria-label="Módulos"] button[aria-label="Recolher"], nav[aria-label="Módulos"] button[aria-label="Expandir"]').click())
  const t0 = Date.now()
  const tempos = []
  for (let i = 0; Date.now() - t0 < 800; i++) {
    const t = Date.now() - t0
    await p.screenshot({ path: `${prefixo}-${String(i).padStart(2, '0')}.png`, clip: canto })
    tempos.push(t)
  }
  return tempos
}

;(async () => {
  fs.mkdirSync(`${out}/quadros`, { recursive: true })
  fs.mkdirSync(`${out}/videos`, { recursive: true })
  const b = await chromium.launch()
  const tempos = {}
  for (const tema of temas)
    for (const modo of ['claro', 'escuro']) {
      const nome = `${tema}-${modo}`
      const ctx = await b.newContext({
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 2,
        colorScheme: modo === 'escuro' ? 'dark' : 'light',
        recordVideo: { dir: `${out}/videos/${nome}`, size: { width: 1440, height: 900 } },
      })
      const p = await ctx.newPage()
      p.on('pageerror', (e) => console.log('ERRO', e.message))
      await entrar(p, tema)
      if ((await aberta(p)) !== 'true') {
        await alternar(p)
        await p.waitForTimeout(900)
      }
      await p.screenshot({ path: `${out}/${nome}-aberta.png` })
      tempos[`${nome}-fechar`] = await quadros(p, `${out}/quadros/${nome}-fechar`)
      await p.waitForTimeout(600)
      await p.screenshot({ path: `${out}/${nome}-fechada.png` })
      tempos[`${nome}-abrir`] = await quadros(p, `${out}/quadros/${nome}-abrir`)
      await p.waitForTimeout(600)
      // Mais um ciclo, só para o vídeo, em ritmo de leitura.
      await alternar(p)
      await p.waitForTimeout(1200)
      await alternar(p)
      await p.waitForTimeout(1200)
      const video = p.video()
      await ctx.close()
      fs.renameSync(await video.path(), `${out}/videos/${nome}.webm`)
      fs.rmSync(`${out}/videos/${nome}`, { recursive: true, force: true })
    }
  fs.writeFileSync(`${out}/quadros/tempos.json`, JSON.stringify(tempos, null, 1))

  // prefers-reduced-motion: a troca tem de ser imediata (sem transição na marca).
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
  const p = await ctx.newPage()
  await entrar(p, 'condesp')
  const durs = await p.evaluate(() =>
    [...document.querySelectorAll('.marca-branca *')].map((el) => getComputedStyle(el).transitionDuration).filter((d) => d.split(',').some((x) => parseFloat(x) > 0)),
  )
  console.log(durs.length ? `FALHA: transição com movimento reduzido: ${durs}` : 'ok: com prefers-reduced-motion a marca troca sem transição')
  await ctx.close()
  await b.close()
})()

// Teste da S09b (armazenamento com qualquer provedor): faixa "os arquivos ficam no escritório",
// Dropbox e Box com a janela de autorização simulada, Google Workspace com o passo a passo do
// administrador (bloqueado até liberar), servidor local com o agente (código, pastas, online,
// offline pelo painel Demonstração, revogar), Raio-X lendo outro provedor, conector no C9,
// escritório Horizonte (piloto com servidor local) e celular.
// Uso: app servido em http://localhost:6100/ (npx vite --port 6100) e
//      node scripts/s09b-armazenamento.cjs <pasta-das-capturas>
const { chromium } = require('playwright')

;(async () => {
  const out = process.argv[2] || '.'
  const base = process.env.URL_APP || 'http://localhost:6100/'
  const b = await chromium.launch()
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } })
  const p = await ctx.newPage()
  const erros = []
  p.on('pageerror', (e) => erros.push(e.message))
  p.on('console', (m) => m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text()) && erros.push(m.text()))
  let falhas = 0
  const ok = (r, m) => {
    if (!r) falhas++
    console.log((r ? 'ok   ' : 'FALHA') + ' ' + m)
  }
  const shot = (n) => p.screenshot({ path: `${out}/s09b-${n}.png` })
  const espera = (ms = 400) => p.waitForTimeout(ms)
  const visivel = async (t, ms = 5000) => {
    try {
      await p.getByText(t).first().waitFor({ state: 'visible', timeout: ms })
      return true
    } catch {
      return false
    }
  }
  const gaveta = () => p.getByRole('dialog', { name: 'Conectar nuvem' })
  const entrar = async (nome) => {
    await p.getByRole('button', { name: new RegExp(nome) }).first().click()
    await p.getByRole('button', { name: 'Entrar', exact: true }).click()
    await espera(400)
    if (await p.getByLabel('Código', { exact: true }).count()) {
      await p.getByLabel('Código', { exact: true }).fill('123456')
      await p.keyboard.press('Enter')
    }
    await espera(900)
  }
  const ir = async (h) => {
    await p.goto(base + h)
    await espera(1100)
  }
  /** Conecta uma nuvem OAuth do começo ao fim (tipo, autorizar, raiz, mapear, pronto). */
  const conectarOAuth = async (rotulo, antesDePermitir) => {
    await p.getByRole('button', { name: 'Conectar nuvem' }).click()
    await gaveta().getByLabel('Onde estão os arquivos').selectOption({ label: rotulo })
    await gaveta().getByRole('button', { name: 'Continuar' }).click()
    if (antesDePermitir) await antesDePermitir()
    await gaveta().getByRole('button', { name: 'Autorizar acesso' }).click()
    await p.getByRole('button', { name: 'Permitir' }).click()
    await espera(1600)
  }
  const concluir = async () => {
    for (let i = 0; i < 3; i++) {
      await gaveta().getByRole('button', { name: 'Continuar' }).click()
      await espera(200)
    }
    await gaveta().getByRole('button', { name: 'Concluir' }).click()
    await espera(500)
  }

  await p.goto(base)
  await espera(1200)
  await entrar('Fernanda Lima')
  await ir('#/config/armazenamento')
  ok(await visivel('Os arquivos ficam no armazenamento do escritório'), 'faixa: os arquivos ficam no armazenamento do escritório; a Heild guarda índice e texto')

  // Dropbox
  await conectarOAuth('Dropbox')
  ok(await visivel(/Acesso autorizado: .*Dropbox/), 'Dropbox autoriza pela janela simulada')
  await concluir()
  ok(await visivel(/Dropbox conectado/), 'Dropbox conectado aparece em "Onde ficam os documentos"')

  // Box
  await conectarOAuth('Box')
  ok(await visivel(/Acesso autorizado: .*Box/), 'Box autoriza pela janela simulada')
  await concluir()
  ok(await visivel(/Box conectado/), 'Box conectado')

  // Google Workspace: bloqueado até o administrador liberar
  await p.getByRole('button', { name: 'Conectar nuvem' }).click()
  await gaveta().getByLabel('Onde estão os arquivos').selectOption({ label: 'Google Drive' })
  await gaveta().getByRole('button', { name: 'Continuar' }).click()
  ok(await visivel('Peça ao administrador do Workspace para liberar a Heild'), 'Workspace mostra o passo a passo dos Controles de API')
  await shot('workspace')
  await gaveta().getByRole('button', { name: 'Autorizar acesso' }).click()
  await p.getByRole('button', { name: 'Permitir' }).click()
  ok(await visivel(/ainda não liberou a Heild/), 'sem a liberação do administrador, o Google recusa')
  await p.getByRole('button', { name: 'Fechar a janela' }).click()
  await espera(300)
  await gaveta().getByRole('button', { name: 'O administrador já liberou' }).click()
  ok(await visivel('liberado pelo administrador'), 'verificar a liberação do Workspace')
  await gaveta().getByRole('button', { name: 'Autorizar acesso' }).click()
  await p.getByRole('button', { name: 'Permitir' }).click()
  await espera(1600)
  await concluir()
  ok(await p.getByText('Google Workspace', { exact: true }).count(), 'Google Drive do Workspace conectado, com o selo')

  // Servidor local com o agente
  await p.getByRole('button', { name: 'Conectar nuvem' }).click()
  await gaveta().getByLabel('Onde estão os arquivos').selectOption({ label: 'Servidor local (agente Heild)' })
  await gaveta().getByRole('button', { name: 'Continuar' }).click()
  ok(await visivel(/nenhuma porta é aberta no escritório/), 'servidor local: só conexão de saída, nenhuma porta aberta')
  const codigo = await gaveta().getByLabel('Código de pareamento').textContent()
  ok(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(codigo.trim()), `código de pareamento (${codigo.trim()})`)
  await shot('agente-codigo')
  await gaveta().getByRole('button', { name: /Já instalei/ }).click()
  ok(await visivel(/pareado · agente 1\.4\.2/, 8000), 'o agente usa o código e pareia')
  await gaveta().getByRole('checkbox', { name: /Contabil/ }).check()
  await gaveta().getByRole('button', { name: 'Usar estas pastas' }).click()
  await concluir()
  const cartao = p.locator('[data-agente]').last()
  ok((await cartao.textContent()).includes('online'), 'cartão do agente: online, versão, última sincronização')
  ok((await cartao.textContent()).includes('Contabil'), 'cartão do agente mostra as pastas compartilhadas')
  await shot('agente')

  // Painel Demonstração: agente offline
  await p.getByRole('button', { name: /Demonstração/ }).click()
  await espera(300)
  await p.locator('[data-lab="s09"]').getByRole('button', { name: /Agente local ficar offline/ }).click()
  await p.keyboard.press('Escape')
  await espera(400)
  ok((await cartao.textContent()).includes('offline'), 'agente offline aparece no cartão, com o aviso')
  await cartao.getByRole('button', { name: 'Revogar dispositivo' }).click()
  await p.getByRole('dialog').last().getByRole('button', { name: 'Revogar dispositivo' }).click()
  await espera(1500)
  ok((await cartao.textContent()).includes('revogado'), 'revogar o dispositivo')

  // Raio-X em outro provedor
  await p.getByRole('button', { name: /Rodar o Raio-X|Abrir o Raio-X/ }).first().click()
  await espera(500)
  await p.getByLabel('Onde ler').selectOption('dropbox')
  await p.getByRole('button', { name: 'Rodar diagnóstico' }).click()
  ok(await visivel('Achados para decidir', 15000), 'Raio-X lê o Dropbox')
  ok(await visivel(/Dropbox · lê só os nomes/), 'Raio-X mostra de onde leu')
  await p.getByRole('dialog').getByRole('button', { name: 'Fechar' }).first().click()
  await espera(300)

  // Conectores (C9)
  await ir('#/config/conectores')
  await p.getByRole('button', { name: 'Nuvens de arquivo' }).click()
  ok((await p.locator('[data-conector="dropbox"]').textContent()).includes('Ativo'), 'Dropbox ativo em Conectores (C9)')
  ok((await p.locator('[data-conector="servidor_local"]').textContent()).includes('Não conectado'), 'servidor local revogado volta a não conectado em Conectores')

  // Horizonte: piloto com servidor local
  await p.getByRole('button', { name: /Demonstração/ }).click()
  await p.getByLabel('Escritório de exemplo').selectOption('esc-horizonte')
  await espera(1500)
  await p.goto(base)
  await espera(1200)
  await entrar('Helena Duarte')
  await ir('#/config/armazenamento')
  ok(await visivel('Servidor local · SRV-HORIZONTE'), 'Horizonte usa o servidor local como padrão')
  ok((await p.locator('[data-agente="ag1"]').textContent()).includes('online'), 'agente do Horizonte online')
  await shot('horizonte')
  await p.getByRole('button', { name: /Demonstração/ }).click()
  await p.getByLabel('Escritório de exemplo').selectOption('esc-andrade')
  await espera(1200)

  // Celular
  const cel = await b.newContext({ viewport: { width: 390, height: 844 }, colorScheme: 'dark' })
  const m = await cel.newPage()
  await m.goto(base)
  await m.waitForTimeout(1200)
  await m.getByRole('button', { name: /Fernanda Lima/ }).first().click()
  await m.getByRole('button', { name: 'Entrar', exact: true }).click()
  await m.waitForTimeout(400)
  await m.getByLabel('Código', { exact: true }).fill('123456')
  await m.keyboard.press('Enter')
  await m.waitForTimeout(900)
  await m.goto(base + '#/config/armazenamento')
  await m.waitForTimeout(1200)
  const larg = await m.evaluate(() => document.documentElement.scrollWidth)
  ok(larg <= 392, `Armazenamento sem rolagem horizontal no celular (${larg}px)`)
  await m.screenshot({ path: `${out}/s09b-cel-armazenamento.png` })

  ok(erros.length === 0, `sem erro no console (${erros.slice(0, 3).join(' | ')})`)
  console.log(falhas ? `\n${falhas} falha(s)` : '\nTudo certo')
  await b.close()
  process.exit(falhas ? 1 : 0)
})()

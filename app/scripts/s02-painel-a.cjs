// Teste da S02 (Painel A: anatomia, Societário, Obrigações, Notas, ficha do cliente).
// Uso: app servido em http://localhost:6100/ (npx vite --port 6100) e
//      node scripts/s02-painel-a.cjs <pasta-das-capturas>
const { chromium } = require('playwright')

;(async () => {
  const out = process.argv[2] || '.'
  const base = process.env.URL_APP || 'http://localhost:6100/'
  const b = await chromium.launch()
  let falhas = 0
  const ok = (r, m) => {
    if (!r) falhas++
    console.log((r ? 'ok   ' : 'FALHA') + ' ' + m)
  }
  const erros = []
  const nova = async (largura = 1440, altura = 900, escuro = false) => {
    const ctx = await b.newContext({ viewport: { width: largura, height: altura }, colorScheme: escuro ? 'dark' : 'light' })
    const p = await ctx.newPage()
    p.on('pageerror', (e) => erros.push(e.message))
    p.on('console', (m) => m.type() === 'error' && erros.push(m.text()))
    return p
  }
  const espera = (p, ms = 400) => p.waitForTimeout(ms)
  const entrar = async (p, conta, hash) => {
    await p.goto(base + hash)
    await espera(p, 1200)
    await p.getByRole('button', { name: new RegExp(conta) }).first().click()
    await p.getByRole('button', { name: 'Entrar', exact: true }).click()
    await espera(p, 500)
    if (await p.getByLabel('Código').count()) {
      await p.getByLabel('Código').fill('123456')
      await p.keyboard.press('Enter')
    }
    await espera(p, 1500)
  }
  const ir = async (p, hash) => {
    await p.evaluate((h) => (location.hash = h), hash)
    await espera(p, 1000)
  }
  const shot = (p, n) => p.screenshot({ path: `${out}/s02-${n}.png` })
  const rolar = async (p, texto) => {
    const el = p.getByText(texto).first()
    if (await el.count()) await el.scrollIntoViewIfNeeded()
    await espera(p, 300)
  }
  const aprovarNaAcoes = async (p, trecho) => {
    await rolar(p, 'Ações')
    const linha = p.locator('li', { hasText: trecho }).filter({ has: p.getByRole('button', { name: 'Aprovar', exact: true }) }).first()
    await linha.getByRole('button', { name: 'Aprovar', exact: true }).click()
    await espera(p, 800)
  }

  /* ---------- Administradora: Obrigações ---------- */
  const p = await nova()
  await entrar(p, 'Fernanda Lima', '#/painel/obrigacoes?cliente=c1')
  ok(await p.getByRole('radiogroup', { name: 'Setores mostrados' }).count(), 'Administradora vê "Meus setores · Um setor · Todos" (S02-A40)')
  ok(await p.getByText('Setor dono').first().isVisible(), 'calendário mostra o setor dono de cada obrigação (C2)')
  ok(await p.getByText(/DCTFWeb/).first().isVisible(), 'calendário do cliente lista as ocorrências do banco')
  await shot(p, 'obrigacoes-c1')

  // Um setor: DP
  await p.getByRole('radio', { name: 'Um setor' }).click()
  await espera(p)
  await p.getByLabel('Setor', { exact: true }).selectOption('dp')
  await espera(p, 600)
  const linhasCal = await p.locator('table').first().locator('tbody tr').allInnerTexts()
  ok(linhasCal.length > 0 && linhasCal.every((t) => /DP/.test(t)), `"Um setor: DP" mostra só obrigações do DP (${linhasCal.length})`)
  await p.getByRole('radio', { name: 'Meus setores' }).click()
  await espera(p, 600)

  // Gerar o calendário de 11/2026 (S02-A41), idempotente
  await p.getByRole('button', { name: /Gerar 11\/2026/ }).first().click()
  await espera(p, 9500)
  await p.getByLabel('Competência').first().selectOption('11/2026')
  await espera(p, 600)
  const geradas = await p.locator('table').first().locator('tbody tr').count()
  ok(geradas >= 5, `gerar calendário cria as obrigações de 11/2026 por setor dono (${geradas})`)
  await p.getByRole('button', { name: /Gerar 12\/2026/ }).first().click()
  await espera(p, 800)
  await p.getByLabel('Competência').first().selectOption('10/2026')
  await espera(p, 500)
  await p.getByRole('button', { name: /Gerar 11\/2026/ }).first().click()
  await espera(p, 800)
  ok(await p.getByText(/Nada a gerar/).first().isVisible(), 'gerar de novo diz "nada a gerar" (idempotente)')

  // Reprogramar prazo interno (S02-A42)
  await p.getByRole('button', { name: 'Ações de PIS/COFINS (DARF)' }).first().click()
  await p.getByRole('menuitem', { name: 'Reprogramar prazo interno' }).click()
  await espera(p)
  await p.getByRole('textbox', { name: 'Novo prazo interno' }).fill('2026-11-23')
  await p.getByRole('textbox', { name: 'Motivo' }).fill('cliente mandou as notas só hoje')
  await p.getByRole('button', { name: 'Reprogramar', exact: true }).click()
  await espera(p, 700)
  ok(await p.locator('tr', { hasText: 'PIS/COFINS (DARF)' }).first().getByText('23/11').count(), 'reprogramar muda o prazo interno (23/11)')

  // Anexar recibo (S02-A45)
  await p.getByRole('button', { name: 'Ações de GIA-SP' }).first().click()
  await p.getByRole('menuitem', { name: 'Anexar recibo' }).click()
  await espera(p)
  await p.getByRole('textbox', { name: 'Número do recibo' }).fill('5184271902-33')
  await p.getByRole('button', { name: 'Anexar', exact: true }).click()
  await espera(p, 700)
  ok(await p.locator('tr', { hasText: 'GIA-SP' }).first().getByText('entregue').count(), 'anexar recibo deixa a obrigação entregue, com hash')

  // Faixa D-20 filtra
  await p.getByRole('button', { name: /vencidas/ }).first().click()
  await espera(p, 500)
  const vencidas = await p.locator('table').first().locator('tbody tr').allInnerTexts()
  ok(vencidas.length > 0 && vencidas.every((t) => /atrasada/.test(t)), `faixa "vencidas" filtra a aba (${vencidas.length})`)
  await p.getByRole('button', { name: /vencidas/ }).first().click()
  await espera(p, 400)

  // Carteira: semana por cliente
  await ir(p, '#/painel/obrigacoes?cliente=todos')
  ok(await p.getByText('Semana da carteira').first().isVisible(), 'carteira mostra a semana obrigação × cliente')
  await shot(p, 'obrigacoes-carteira')

  /* ---------- C1: ver todas a partir do bloco do setor ---------- */
  await ir(p, '#/painel/societario?cliente=c1')
  await rolar(p, 'Obrigações do setor')
  await p.getByRole('button', { name: /ver todas/ }).first().click()
  await espera(p, 1200)
  ok((await p.evaluate(() => location.hash)).startsWith('#/painel/obrigacoes'), '"ver todas" do bloco abre a aba Obrigações (S02-A53)')
  ok((await p.getByLabel('Setor', { exact: true }).inputValue().catch(() => '')) === 'societario', 'a aba chega filtrada pelo setor de origem (Societário)')
  await p.getByRole('radio', { name: 'Meus setores' }).click()
  await espera(p, 400)

  /* ---------- Societário ---------- */
  await ir(p, '#/painel/societario?cliente=todos')
  await p.getByRole('button', { name: /Cadastrar pelo CNPJ/ }).first().click()
  await espera(p)
  await p.getByRole('textbox', { name: 'CNPJ' }).fill('11222333000181')
  await p.getByRole('button', { name: 'Consultar', exact: true }).click()
  await espera(p, 2200)
  ok(await p.getByText(/demonstração/i).first().isVisible(), 'consulta CNPJ simulada mostra os dados com o selo de demonstração (S02-A19)')
  await p.getByRole('button', { name: 'Cadastrar', exact: true }).click()
  await espera(p, 7500)
  const novo = await p.evaluate(() => Object.keys(localStorage).filter((k) => k.endsWith(':cliente')).some((k) => localStorage[k].includes('11.222.333/0001-81')))
  ok(novo, 'o integrante Societário cadastra o cliente em "aceito" com a primeira versão do perfil')
  await shot(p, 'societario-carteira')

  await ir(p, '#/painel/societario?cliente=c1')
  // Versionar o perfil com cartão (S02-A20)
  await p.getByRole('button', { name: 'Ações da ficha' }).click()
  await p.getByRole('menuitem', { name: 'Versionar o perfil…' }).click()
  await espera(p)
  await p.getByRole('combobox', { name: 'UF' }).selectOption('MG')
  await p.getByRole('textbox', { name: 'Motivo' }).fill('mudança da sede para Minas Gerais')
  await p.getByRole('button', { name: 'Preparar o cartão' }).click()
  await espera(p, 5500)
  await aprovarNaAcoes(p, 'Versionar o perfil')
  ok(await p.getByText(/Perfil versionado/).first().isVisible(), 'aprovar o cartão versiona o perfil e regera o calendário')
  await espera(p, 1500)
  // Domicílio Judicial: abrir dá ciência (S02-A33)
  await rolar(p, 'Comunicações oficiais')
  await p.getByRole('button', { name: /Abrir \(dá ciência\)/ }).first().click()
  await p.getByRole('button', { name: 'Abrir e dar ciência' }).click()
  await espera(p, 600)
  ok(await p.getByText(/ciência em/).first().isVisible(), 'abrir a comunicação registra a ciência com nome e data')
  // Mudar estado para inativo (S02-A34) → aba só leitura
  await rolar(p, 'Ciclo de vida')
  await p.getByRole('button', { name: 'Mudar estado', exact: true }).click()
  await espera(p)
  await p.getByRole('combobox', { name: 'Novo estado' }).selectOption('inativo')
  await p.getByRole('textbox', { name: 'Motivo' }).fill('empresa parou as atividades')
  await p.getByRole('button', { name: 'Preparar o cartão' }).click()
  await espera(p, 4800)
  await aprovarNaAcoes(p, 'Mudar para')
  await espera(p, 800)
  await p.evaluate(() => document.querySelector('.area-rolagem')?.scrollTo(0, 0))
  ok(await p.getByRole('status', { name: 'Ciclo de vida do cliente' }).first().isVisible(), 'cliente inativo ganha a faixa de ciclo de vida (C6, S04) acima do cabeçalho')
  await rolar(p, 'Cliente só para leitura')
  ok(await p.getByText(/Cliente só para leitura/).first().isVisible(), 'e a aba fica só leitura (Ações somem)')
  await shot(p, 'societario-inativo')

  /* ---------- Ficha do cliente ---------- */
  await ir(p, '#/painel/societario?cliente=c2&ficha=c2')
  ok(await p.getByRole('dialog').getByText(/Contatos/).first().isVisible(), 'a ficha do cliente abre por link (S02-T05)')
  await shot(p, 'ficha-c2')
  await p.keyboard.press('Escape')

  /* ---------- Notas ---------- */
  await ir(p, '#/painel/notas?cliente=c1')
  ok(await p.getByText(/captura/i).first().isVisible(), 'Notas mostra a saúde da captura no cabeçalho (S02-A55)')
  await shot(p, 'notas-c1')

  /* ---------- Persistência ---------- */
  await p.reload()
  await espera(p, 1800)
  await ir(p, '#/painel/obrigacoes?cliente=c3')
  await ir(p, '#/painel/obrigacoes?cliente=c1')
  ok(await p.locator('tr', { hasText: 'PIS/COFINS (DARF)' }).first().getByText('23/11').count(), 'depois de recarregar: a reprogramação continua')
  await p.context().close()

  /* ---------- Membro com um setor (Ana, DP) ---------- */
  const a = await nova()
  await entrar(a, 'Ana Souza', '#/painel/obrigacoes?cliente=c1')
  ok(await a.getByText(/só DP, o seu setor/).first().isVisible(), 'Membro de um setor não tem seletor: vê só o dele')
  const doDp = await a.locator('table').first().locator('tbody tr').allInnerTexts()
  ok(doDp.length > 0 && doDp.every((t) => /DP/.test(t)), 'e só as obrigações do DP')
  ok(!(await a.getByRole('button', { name: /Gerar 11\/2026/ }).count()), 'Membro não gera o calendário (Gestor gera)')
  await a.context().close()

  /* ---------- Membro com vários setores (Rafael, Fiscal e Notas) ---------- */
  const r = await nova()
  await entrar(r, 'Rafael Nunes', '#/painel/obrigacoes?cliente=c1')
  ok((await r.getByRole('group', { name: 'Seus setores' }).getByRole('button').count()) === 2, 'Membro com vários setores vê chips dos seus setores')
  await r.getByRole('button', { name: 'Notas', exact: true, pressed: true }).click()
  await espera(r, 500)
  const soFiscal = await r.locator('table').first().locator('tbody tr').allInnerTexts()
  ok(soFiscal.every((t) => !/Notas/.test(t)), 'desmarcar um chip foca nos outros setores')
  await r.context().close()

  /* ---------- Celular e escuro ---------- */
  const c = await nova(390, 844, true)
  await entrar(c, 'Fernanda Lima', '#/painel/obrigacoes?cliente=c1')
  const largura = await c.evaluate(() => document.documentElement.scrollWidth)
  ok(largura <= 392, `390px sem rolagem horizontal na aba Obrigações (${largura})`)
  await shot(c, 'obrigacoes-390-escuro')
  await ir(c, '#/painel/societario?cliente=c1')
  ok((await c.evaluate(() => document.documentElement.scrollWidth)) <= 392, '390px sem rolagem horizontal no Societário')
  await shot(c, 'societario-390-escuro')
  await c.context().close()

  ok(erros.length === 0, `sem erros no console${erros.length ? ': ' + erros.slice(0, 3).join(' | ') : ''}`)
  console.log(falhas ? `\n${falhas} falha(s)` : '\ntudo certo')
  await b.close()
  process.exit(falhas ? 1 : 0)
})()

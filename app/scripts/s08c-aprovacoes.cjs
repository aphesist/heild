// S08c · BPO › Aprovações e Configuração: alçada de conferência da pessoa, integrante com a
// captura desligada, SLA da empresa, teto do WhatsApp; segregação (quem digita não confere) e
// conferência em lote com a mesma regra; fornecedor novo só entra em lote com os dados
// confirmados por segundo canal; lote com exceção vai à reforçada; escalonamento avançado pelo
// relógio da demonstração até o vencido (só alerta, nada pago); trilha do lote; Contas a Pagar
// sugere o lote; alçada com limite diário aceita no app trava o envio; Membro sem Configuração;
// celular de 390 px; tema escuro, Condesp e Requinte. Termina restaurando a demonstração.
// Uso: app servido em http://localhost:6100/ (npx vite --port 6100) e
//      node scripts/s08c-aprovacoes.cjs <pasta-das-capturas>
const { chromium } = require('playwright')

;(async () => {
  const out = process.argv[2] || '.'
  const base = process.env.URL_APP || 'http://localhost:6100/'
  const b = await chromium.launch()
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } })
  const p = await ctx.newPage()
  const erros = []
  p.on('pageerror', (e) => erros.push(e.message))
  p.on('console', (m) => m.type() === 'error' && !/Failed to load resource/.test(m.text()) && erros.push(m.text()))
  let falhas = 0
  const ok = (r, m) => {
    if (!r) falhas++
    console.log((r ? 'ok   ' : 'FALHA') + ' ' + m)
  }
  const shot = (n) => p.screenshot({ path: `${out}/s08c-${n}.png` })
  const espera = (ms = 400) => p.waitForTimeout(ms)
  const dlg = () => p.getByRole('dialog').last()
  const pronto = async () => {
    await p.waitForFunction(() => document.body && !document.body.innerText.includes('Abrindo o escritório'), null, { timeout: 45000 })
    await espera(600)
  }
  const visivel = async (loc, ms = 6000) => {
    try {
      await loc.first().waitFor({ state: 'visible', timeout: ms })
      return true
    } catch {
      return false
    }
  }
  const lab = async () => {
    await p.getByRole('button', { name: /Demonstração/ }).first().click()
    await espera(300)
  }
  const entrar = async (nome) => {
    await lab()
    await p.getByRole('dialog').getByRole('button', { name: new RegExp(nome) }).first().click()
    await espera(1200)
    if (await p.getByRole('dialog').count()) {
      await p.keyboard.press('Escape')
      await espera(300)
    }
  }
  const ir = async (aba, cliente = 'todos') => {
    await p.goto(`${base}#/bpo/${aba}?cliente=${cliente}`)
    await espera(900)
  }
  const confirmarDialogo = async (acao, motivo) => {
    const d = dlg()
    if (motivo) await d.getByRole('textbox').last().fill(motivo)
    await d.getByRole('button', { name: acao, exact: true }).click()
    await espera(500)
  }
  const editarEmLinha = async (rotulo, valor) => {
    await p.getByRole('button', { name: new RegExp(`^${rotulo}`) }).click()
    const campo = p.getByRole('textbox', { name: rotulo, exact: true })
    await campo.fill(valor)
    await campo.press('Enter')
    await espera(500)
  }
  const appComo = async (nome) => {
    await p.goto(`${base}#/app`)
    await p.evaluate(() => window.localStorage.removeItem('ui-lab:s10:sessao'))
    await p.reload()
    await pronto()
    await p.getByRole('button', { name: new RegExp(`^${nome}`) }).first().click()
    await p.getByRole('button', { name: 'Receber código' }).click()
    await p.getByLabel('Código').fill('123456')
    await p.getByRole('button', { name: 'Entrar', exact: true }).click()
    await espera(700)
  }
  const semRolagemLateral = async (n) => {
    const largura = await p.evaluate(() => document.documentElement.scrollWidth)
    ok(largura <= 392, `${n}: sem rolagem horizontal no celular (${largura}px)`)
  }

  // 0. Entrar como Fernanda (Administradora)
  await p.goto(base)
  await pronto()
  await p.getByRole('button', { name: /Fernanda Lima/ }).first().click()
  await p.getByRole('button', { name: 'Entrar', exact: true }).click()
  await espera(500)
  if (await p.getByLabel('Código').count()) {
    await p.getByLabel('Código').fill('123456')
    await p.keyboard.press('Enter')
  }
  await espera(1000)

  // 1. Configuração do escritório: equipe, alçada de conferência, WhatsApp, integrantes (T07)
  await ir('configuracao')
  ok(await visivel(p.getByRole('list', { name: 'Empresas para configurar' })), 'Configuração sem empresa lista as empresas com modo e alçada')
  ok(await visivel(p.getByText('Integrantes por função')), 'integrantes por função com o que cada um faz sozinho')
  ok((await p.getByText('nunca: só uma pessoa').count()) >= 4, 'o que é de pessoa aparece travado (pagar, conferir, alçada...)')
  await editarEmLinha('Alçada de conferência de Lucas Prado', '2000')
  ok(await visivel(p.getByRole('button', { name: /Alçada de conferência de Lucas Prado: 2000/ })), 'alçada de conferência de Lucas salva (R$ 2.000)')
  await editarEmLinha('Teto do WhatsApp', '2500')
  ok(await visivel(p.getByText(/Lote de até R\$\s2\.500 pode ser aprovado/)), 'teto da aprovação pelo WhatsApp salvo')
  await p.getByRole('checkbox', { name: 'Contas a Pagar faz sozinho: Capturar as contas novas do ERP e do DDA' }).uncheck()
  await espera(500)
  ok(await visivel(p.getByText('tirado da lista: prepara e uma pessoa conclui')), 'o Administrador tira a captura da lista do "faz sozinho"')
  await shot('config-escritorio')

  // 2. Configuração da Padaria: SLA, aprovadores, regras de conferência (A36, A37)
  await ir('configuracao', 'c2')
  ok(await visivel(p.getByText('Regras de conferência')), 'regras de conferência da empresa, com o que sobe de faixa')
  ok(await visivel(p.getByRole('list', { name: 'Aprovadores da ficha' })), 'aprovadores da ficha com a alçada de cada um')
  await p.locator('section', { hasText: 'SLA da empresa' }).getByRole('button', { name: 'Editar' }).click()
  await espera(400)
  await dlg().getByLabel('Meta do mês (% no prazo)').fill('96')
  await dlg().getByLabel('Lote enviado até quantas horas antes do vencimento').fill('24')
  await dlg().getByRole('button', { name: 'Salvar', exact: true }).click()
  await espera(500)
  ok(await visivel(p.getByText(/96% no prazo/)), 'SLA da empresa editado e salvo')
  await shot('config-padaria')

  // 3. Captura desligada no integrante: o botão fica desligado com o motivo
  await ir('aprovacoes', 'c2')
  ok(await p.getByRole('button', { name: /Capturar do Conta Azul/ }).isDisabled(), 'captura do ERP desligada quando o Administrador tirou da lista')
  await ir('configuracao')
  await p.getByRole('checkbox', { name: 'Contas a Pagar faz sozinho: Capturar as contas novas do ERP e do DDA' }).check()
  await espera(400)

  // 4. Lucas (Membro): quem digitou não confere; alçada de conferência; sem Configuração (A22)
  await entrar('Lucas Prado')
  await ir('aprovacoes')
  const lat = p.locator('li', { hasText: 'Laticínios Serra' }).first()
  ok(await lat.getByRole('button', { name: /Conferir Laticínios/ }).isDisabled(), 'quem digitou não confere (botão desligado)')
  const enel = p.locator('li', { hasText: 'Enel' }).first()
  ok(await enel.getByText(/Sua alçada de conferência vai até R\$\s2\.000/).count(), 'acima da alçada de conferência da pessoa, o botão desliga com o motivo')
  await p.getByRole('radio', { name: 'Posso conferir' }).click()
  await espera(300)
  ok(await visivel(p.getByText('Nenhuma conta neste filtro.')), 'filtro "Posso conferir" mostra o que a pessoa pode fazer')
  await p.getByRole('radio', { name: /^Todas/ }).click()
  const abas = await p.getByRole('tab').allInnerTexts()
  ok(!abas.some((t) => /Configuração/.test(t)), 'Membro não vê a Configuração')
  await shot('lucas')

  // 5. Marina (Gestora): conferência em lote com a mesma regra
  await entrar('Marina Teixeira')
  await ir('aprovacoes')
  await p.getByRole('checkbox', { name: 'Selecionar todas as contas para conferir' }).click()
  await espera(300)
  await p.getByRole('toolbar', { name: 'Ações em lote' }).getByRole('button', { name: 'Conferir selecionadas' }).click()
  await espera(800)
  ok(await visivel(p.getByRole('list', { name: 'Contas conferidas de Padaria Pão Quente ME' }).getByText('Laticínios Serra')), 'conferência em lote: até a faixa 1 vai direto ao próximo lote')
  ok(await visivel(p.locator('li', { hasText: 'Enel' }).getByText(/1 de 2 conferências/)), 'conferência em lote: acima da faixa 1 fica esperando a segunda')
  await shot('conferir-em-lote')

  // 6. Conta de fornecedor novo: Marina lança, Fernanda confere, confirma os dados e monta o lote
  await ir('aprovacoes', 'c2')
  await p.getByRole('button', { name: 'Lançar conta' }).click()
  await espera(400)
  await dlg().getByLabel('Fornecedor').fill('Gráfica Expressa S08c')
  await dlg().getByLabel('Valor (R$)').fill('900')
  await dlg().getByLabel('Vencimento').fill('2026-11-26')
  await dlg().getByRole('button', { name: 'Lançar', exact: true }).click()
  await espera(600)
  ok(await p.locator('li', { hasText: 'Gráfica Expressa S08c' }).first().getByRole('button', { name: /Conferir Gráfica/ }).isDisabled(), 'quem lançou não confere a conta que lançou')
  await entrar('Fernanda Lima')
  await ir('aprovacoes', 'c2')
  ok(await visivel(p.locator('li', { hasText: 'Gráfica Expressa S08c' }).getByText(/sobe de faixa: fornecedor novo/)), 'fornecedor novo aparece como exceção que sobe de faixa')
  await p.locator('li', { hasText: 'Gráfica Expressa S08c' }).first().getByRole('button', { name: /Conferir Gráfica/ }).click()
  await espera(500)
  const grafica = p.getByRole('list', { name: 'Contas conferidas de Padaria Pão Quente ME' }).locator('li', { hasText: 'Gráfica Expressa S08c' })
  ok(await visivel(grafica.getByText(/Confirme antes os dados bancários/)), 'fornecedor sem dados confirmados não entra em lote')
  await grafica.getByRole('button', { name: 'Confirmar dados' }).click()
  await confirmarDialogo('Confirmar', 'ligação ao telefone do cadastro')
  await grafica.getByRole('button', { name: 'Pôr no próximo lote' }).click()
  await espera(400)
  await p.getByRole('list', { name: 'Contas conferidas de Padaria Pão Quente ME' }).locator('li', { hasText: 'Laticínios Serra' }).getByRole('button', { name: 'Pôr no próximo lote' }).click()
  await espera(400)
  ok(await visivel(p.getByText(/aprovação reforçada \(2 pessoas\) por exceção/)), 'lote com exceção vai à aprovação reforçada')
  ok(await visivel(p.getByText(/acima de R\$\s2\.500: só no app/)), 'lote acima do teto do WhatsApp: só no app, com segundo fator')
  await shot('proximo-lote')
  await p.getByRole('button', { name: /Montar lote e enviar ao cliente/ }).click()
  await espera(400)
  await confirmarDialogo('Mandar ao cliente')
  await espera(600)
  const novo = p.locator('section', { hasText: 'Pagar 2 contas' }).filter({ hasText: 'Gráfica Expressa S08c' }).last()
  ok(await visivel(novo.getByText('reforçada por exceção')), 'cartão do lote marca a reforçada por exceção')

  // 7. Escalonamento pelo relógio da demonstração até o vencido (A25; 10, 3.6)
  await novo.getByText('Se ninguém responder (escalonamento)').click()
  for (const passo of ['lembrete', 'substituto', 'alerta da véspera']) {
    await novo.getByRole('button', { name: new RegExp(`Avançar o relógio: ${passo}`) }).click()
    await confirmarDialogo('Avançar')
    await espera(400)
  }
  ok(await visivel(novo.getByText(/alerta ao Gestor do BPO e a .* com a lista/)), 'véspera: alerta ao Gestor do BPO e ao sócio com a lista')
  await shot('escalonamento')
  await novo.getByRole('button', { name: /Avançar o relógio: vencido/ }).click()
  await confirmarDialogo('Avançar')
  await espera(600)
  await p.getByRole('radio', { name: /^Expirados/ }).click()
  await espera(300)
  const expirado = p.locator('section', { hasText: 'Gráfica Expressa S08c' }).filter({ hasText: 'expirou sem resposta' }).last()
  ok(await visivel(expirado), 'vencido sem aprovação: o cartão expira e nada é pago')
  ok(await visivel(p.getByRole('list', { name: 'Contas conferidas de Padaria Pão Quente ME' }).getByText('Gráfica Expressa S08c')), 'as contas voltam para um lote novo')
  await p.getByRole('button', { name: /^\d+$|Notificações|Avisos/ }).first().click().catch(() => {})
  await espera(300)
  ok(await visivel(p.getByText(/Vencido sem aprovação: Padaria/)), 'o vencido vira aviso no sino')
  await p.keyboard.press('Escape')

  // 8. Trilha do lote (10, 3.11)
  await expirado.getByRole('button', { name: 'Trilha' }).click()
  await espera(400)
  ok((await dlg().getByRole('list', { name: 'Trilha do lote' }).locator('li').count()) >= 4, 'trilha do lote com quem fez cada passo')
  ok(await dlg().getByText(/#[0-9a-f]{8}/).count(), 'cada passo da trilha leva a impressão encadeada')
  await shot('trilha')
  await p.keyboard.press('Escape')
  await espera(300)

  // 9. Contas a Pagar sugere o próximo lote (prepara; não manda)
  await p.getByRole('button', { name: /Pedir ao Contas a Pagar: sugerir o lote/ }).click()
  ok(await visivel(p.getByRole('list', { name: 'Contas conferidas de Padaria Pão Quente ME' }).locator('li', { hasText: 'Laticínios Serra' }).getByRole('button', { name: 'Tirar do lote' }), 25000), 'o integrante sugeriu o lote e o Gestor ainda decide o envio')

  // 10. Alçada com limite diário: proposta, aceite no app e o envio travado (A36; 10, 3.9)
  await ir('configuracao', 'c2')
  await p.getByRole('button', { name: 'Propor' }).click()
  await espera(400)
  await dlg().getByLabel('Limite por dia (R$)').fill('1000')
  await dlg().getByRole('button', { name: 'Mandar para o aceite' }).click()
  await espera(500)
  ok(await visivel(p.getByText(/R\$\s1\.000 por dia · proposta por Fernanda/)), 'proposta de alçada com limite por dia aguarda o sócio')
  await appComo('João Batista')
  if (await visivel(p.getByText('O escritório propôs novas alçadas de pagamento'))) await p.getByRole('button', { name: 'Aceitar', exact: true }).click()
  await espera(500)
  await p.goto(`${base}#/bpo/aprovacoes?cliente=c2`)
  await pronto()
  if (await p.getByRole('button', { name: /Fernanda Lima/ }).count()) {
    await p.getByRole('button', { name: /Fernanda Lima/ }).first().click()
    await p.getByRole('button', { name: 'Entrar', exact: true }).click()
    await espera(500)
    if (await p.getByLabel('Código').count()) {
      await p.getByLabel('Código').fill('123456')
      await p.keyboard.press('Enter')
    }
    await espera(800)
    await ir('aprovacoes', 'c2')
  }
  ok(await visivel(p.getByText(/Passa do limite diário da alçada aceita/)), 'limite diário aceito trava o envio do lote')
  ok(await p.getByRole('button', { name: /Montar lote e enviar ao cliente/ }).isDisabled(), 'o botão de enviar fica desligado com o motivo')
  await ir('configuracao', 'c2')
  await p.getByText(/Versões das alçadas/).click()
  ok(await visivel(p.getByRole('list', { name: 'Versões das alçadas' }).getByText('vigente')), 'versões das alçadas no histórico')

  // 11. Celular (390 px)
  await p.setViewportSize({ width: 390, height: 844 })
  await ir('aprovacoes', 'c2')
  await shot('celular-aprovacoes')
  await semRolagemLateral('Aprovações')
  await ir('configuracao', 'c2')
  await shot('celular-config')
  await semRolagemLateral('Configuração')
  await p.setViewportSize({ width: 2560, height: 1200 })
  await ir('aprovacoes')
  await shot('ultrawide')
  await p.setViewportSize({ width: 1440, height: 900 })

  // 12. Temas: escuro, Condesp e Requinte (claro e escuro)
  for (const [tema, modo] of [['fabrica', 'dark'], ['condesp', 'light'], ['condesp', 'dark'], ['requinte', 'light'], ['requinte', 'dark']]) {
    await p.evaluate((t) => window.localStorage.setItem('ui-lab:tema:esc-andrade', JSON.stringify(t)), tema)
    await p.emulateMedia({ colorScheme: modo })
    await p.reload()
    await pronto()
    await ir('aprovacoes', 'c2')
    await shot(`tema-${tema}-${modo}-aprovacoes`)
    await ir('configuracao', 'c2')
    await shot(`tema-${tema}-${modo}-config`)
  }
  await p.evaluate(() => window.localStorage.setItem('ui-lab:tema:esc-andrade', JSON.stringify('fabrica')))
  await p.emulateMedia({ colorScheme: 'light' })
  await p.reload()
  await pronto()
  ok(true, 'telas abertas nos temas de fábrica escuro, Condesp e Requinte')

  // 13. Restaurar a demonstração
  await lab()
  const restaurar = p.getByRole('dialog').getByRole('button', { name: /Resetar o ambiente/ })
  if (await restaurar.count()) {
    await restaurar.click()
    await espera(300)
    const sim = p.getByRole('button', { name: /^(Resetar|Restaurar|Sim)/ }).last()
    if (await sim.count()) await sim.click()
    await espera(2000)
  }

  ok(erros.length === 0, `sem erro no console (${erros.length})${erros.length ? ': ' + erros.slice(0, 3).join(' | ') : ''}`)
  console.log(falhas ? `\n${falhas} falha(s)` : '\nTudo certo')
  await b.close()
  process.exit(falhas ? 1 : 0)
})()

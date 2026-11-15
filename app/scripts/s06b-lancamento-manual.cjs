// S06b · Lançamento manual no Timesheet: lançar com o cliente do contexto, tempo padrão que preenche
// a duração, sobreposição com a captura pede escolha, editar cria versão, duplicar, repetir o de
// ontem, cronômetro, descartar sem apagar, tempo padrão nas configurações, proporção manual na
// Equipe, abrir de outra tela pelo evento, persistência e celular. Termina restaurando a demonstração.
// Uso: app em http://localhost:6100/ (npx vite --port 6100) e node scripts/s06b-lancamento-manual.cjs <pasta>
const { chromium } = require('playwright')

;(async () => {
  const out = process.argv[2] || '.'
  const base = process.env.URL_APP || 'http://localhost:6100/'
  const b = await chromium.launch()
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
  const erros = []
  p.on('pageerror', (e) => erros.push(e.message))
  p.on('console', (m) => m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text()) && erros.push(m.text()))
  let falhas = 0
  const ok = (r, m) => {
    if (!r) falhas++
    console.log((r ? 'ok   ' : 'FALHA') + ' ' + m)
  }
  const espera = (ms = 400) => p.waitForTimeout(ms)
  const dialogo = () => p.getByRole('dialog').last()
  const shot = (n) => p.screenshot({ path: `${out}/s06b-${n}.png` })
  const pronto = async () => {
    await p.waitForFunction(() => document.body && !document.body.innerText.includes('Abrindo o escritório'), null, { timeout: 45000 })
    await espera(700)
  }
  const ir = async (rota) => {
    await p.goto(base + '#/' + rota)
    await espera(1300)
  }
  const entrar = async (nome) => {
    if (await p.getByRole('button', { name: 'Entrar', exact: true }).count()) {
      await p.getByRole('button', { name: new RegExp(nome) }).first().click()
      await p.getByRole('button', { name: 'Entrar', exact: true }).click()
      await espera(500)
      if (await p.getByLabel('Código').count()) {
        await p.getByLabel('Código').fill('123456')
        await p.keyboard.press('Enter')
      }
      await espera(1000)
    }
  }
  const painelDemo = async () => {
    await p.getByRole('button', { name: /Demonstração/ }).first().click()
    await espera(300)
  }
  const restaurar = async () => {
    await painelDemo()
    await p.getByRole('button', { name: /Resetar o ambiente/ }).click()
    await p.getByRole('button', { name: 'Resetar agora' }).click()
    await espera(800)
    await pronto()
  }
  const lista = () => p.getByTestId('ts-lista-dia')
  // Escolhe a opção de um select pelo texto (expressão regular).
  const escolher = async (sel, re) => {
    const valor = await sel.evaluate((el, fonte) => [...el.options].find((o) => new RegExp(fonte).test(o.text))?.value, re.source)
    await sel.selectOption(valor)
  }

  await p.goto(base)
  await pronto()
  await entrar('Fernanda Lima')
  await restaurar()
  await entrar('Fernanda Lima')

  // 1. Lançar com o cliente do contexto (seletor do topo) e o tempo padrão
  await ir('timesheet/meu?cliente=c1')
  await p.getByRole('button', { name: 'Lançar tempo' }).first().click()
  await espera(300)
  const cli = dialogo().getByLabel('Cliente', { exact: true })
  ok((await cli.inputValue()) === 'c1', `cliente vem preenchido com o cliente do contexto (${await cli.inputValue()})`)
  await escolher(dialogo().getByLabel('Atividade', { exact: true }), /Ligação com cliente/)
  ok((await dialogo().getByLabel('Duração (min)').inputValue()) === '10', 'escolher o tempo padrão "Ligação com cliente" preenche 10 min')
  await dialogo().getByLabel('Duração (min)').fill('12')
  await dialogo().getByLabel('Data').fill('2026-11-18')
  await dialogo().getByLabel('Início').fill('12:20')
  await dialogo().getByLabel('Descrição (opcional)').fill('Ligação sobre o ISS da filial')
  await shot('lancar')
  await dialogo().getByRole('button', { name: 'Lançar', exact: true }).click()
  await espera(500)
  await ir('timesheet/meu?cliente=todos')
  const linhaManual = lista().locator('li', { hasText: 'Ligação com cliente' }).first()
  ok(await linhaManual.count(), 'o lançamento aparece no dia, na lista de sessões')
  ok(/manual/.test(await linhaManual.innerText()), 'fica marcado como fonte "manual", separado da captura')

  // 2. Sobreposição com a captura pede escolha
  await p.getByRole('button', { name: 'Lançar tempo' }).first().click()
  await dialogo().getByLabel('Cliente', { exact: true }).selectOption('c2')
  await escolher(dialogo().getByLabel('Atividade', { exact: true }), /Emissão de guia no portal/)
  await dialogo().getByRole('radio', { name: 'Início e fim' }).click()
  await dialogo().getByLabel('Início').fill('09:00')
  await dialogo().getByLabel('Fim').fill('09:20')
  await espera(300)
  ok(await dialogo().getByTestId('ts-sobreposicao').count(), 'sobreposição com sessão capturada aparece')
  ok(await dialogo().getByRole('button', { name: /Escolha o que fazer/ }).isDisabled(), 'sem escolher, não lança')
  await dialogo().getByRole('radio', { name: /Manter as duas/ }).click()
  await dialogo().getByRole('button', { name: 'Lançar', exact: true }).click()
  await espera(500)
  await shot('manter')
  ok((await lista().locator('li', { hasText: 'FIS-019 DCTFWeb' }).count()) && (await lista().locator('li', { hasText: 'Emissão de guia no portal' }).count()), '"manter as duas": a captura e o lançamento ficam')

  // 3. Editar cria versão; duplicar; descartar sem apagar
  await lista().locator('li', { hasText: 'Ligação com cliente' }).first().locator('button').first().click()
  await espera(300)
  ok(await dialogo().getByText('Editar lançamento').count(), 'clicar no lançamento abre a edição')
  await dialogo().getByLabel('Descrição (opcional)').fill('Ligação sobre o ISS da filial de Sorocaba')
  await dialogo().getByRole('button', { name: 'Salvar versão' }).click()
  await espera(400)
  await lista().locator('li', { hasText: 'Ligação com cliente' }).first().locator('button').first().click()
  await espera(300)
  ok(await dialogo().getByTestId('ts-versoes').count(), 'editar cria versão: a anterior fica no histórico')
  await dialogo().getByLabel('Duplicar para o dia').fill('2026-11-17')
  await dialogo().getByRole('button', { name: 'Duplicar' }).click()
  await espera(400)
  await p.getByRole('button', { name: 'Período anterior' }).click()
  await espera(400)
  ok(await lista().locator('li', { hasText: 'Ligação com cliente' }).count(), 'duplicar para outro dia')
  await p.getByRole('button', { name: 'Próximo período' }).click()
  await espera(300)
  await lista().locator('li', { hasText: 'Emissão de guia no portal' }).first().locator('button').first().click()
  await dialogo().getByRole('button', { name: 'Descartar' }).click()
  await p.getByRole('dialog').getByRole('button', { name: 'Descartar' }).last().click()
  await espera(500)
  ok(!(await lista().locator('li', { hasText: 'Emissão de guia no portal' }).count()), 'descartar tira da contagem (fica no histórico)')

  // 4. Repetir os de ontem
  await p.getByRole('button', { name: 'Lançar tempo' }).first().click()
  await dialogo().getByLabel('Data').fill('2026-11-18')
  await espera(300)
  const repetir = dialogo().getByRole('button', { name: /Repetir os de/ })
  ok(await repetir.count(), '"repetir os de ontem" aparece quando houve lançamento no dia útil anterior')
  await repetir.click()
  await espera(500)
  ok((await lista().locator('li', { hasText: 'Ligação com cliente' }).count()) >= 2, 'lançar de novo o de ontem')

  // 5. Cronômetro
  await p.getByRole('button', { name: 'Iniciar cronômetro' }).click()
  await espera(2500)
  ok(/00:00:0[1-9]/.test(await p.getByTestId('ts-cronometro').innerText()), 'cronômetro conta')
  await p.getByTestId('ts-cronometro').getByRole('button', { name: 'Parar' }).click()
  await espera(500)
  ok(await p.getByText('Cronômetro parado: virou lançamento manual').count(), 'parar o cronômetro vira lançamento manual')

  // 6. Semana: visão no padrão dos timesheets
  await p.getByRole('radio', { name: 'Semana' }).click()
  await espera(400)
  ok(await p.getByTestId('ts-semana-manual').getByText('Metalúrgica Andrade Ltda').count(), 'visão da semana dos lançamentos (cliente × dia)')
  await shot('semana')
  await p.getByRole('radio', { name: 'Dia' }).click()

  // 7. Tempo padrão nas configurações
  await p.getByRole('button', { name: 'Configurar' }).click()
  await p.getByRole('menuitem', { name: /Configurações do módulo/ }).click()
  const tp = p.getByTestId('ts-tempos-padrao')
  await tp.getByRole('button', { name: 'Acrescentar tempo padrão' }).click()
  await tp.getByLabel(/Nome do tempo padrão 7/).fill('Protocolo na prefeitura')
  await tp.getByLabel(/Minutos do tempo padrão 7/).fill('25')
  await dialogo().getByRole('button', { name: 'Salvar' }).click()
  await espera(400)
  await p.getByRole('button', { name: 'Lançar tempo' }).first().click()
  await escolher(dialogo().getByLabel('Atividade', { exact: true }), /Protocolo na prefeitura/)
  ok((await dialogo().getByLabel('Duração (min)').inputValue()) === '25', 'tempo padrão cadastrado pelo escritório preenche a duração')
  await p.keyboard.press('Escape')
  await espera(300)

  // 8. Abrir de outra tela com o contexto (evento)
  await ir('painel/fiscal')
  await p.evaluate(() => window.dispatchEvent(new CustomEvent('heild:ts-lancar', { detail: { tarefa_id: 't1' } })))
  await espera(400)
  ok((await dialogo().getByLabel('Cliente', { exact: true }).inputValue()) === 'c2', 'abrir o lançamento de outra tela traz o cliente da tarefa')
  await p.keyboard.press('Escape')

  // 9. Equipe: proporção manual × automático
  await ir('timesheet/equipe')
  ok(/Bruno Costa/.test(await p.getByTestId('ts-manual-equipe').innerText()), 'Gestor vê na Equipe a proporção entre manual e automático')
  await shot('equipe')

  // 10. Persistência, Membro e celular
  await p.reload()
  await pronto()
  await ir('timesheet/meu?cliente=todos')
  ok(await lista().locator('li', { hasText: 'Ligação com cliente' }).count(), 'depois de recarregar: os lançamentos continuam')
  await painelDemo()
  await p.getByRole('dialog').getByRole('button', { name: /Rafael Nunes/ }).first().click()
  await espera(900)
  await ir('timesheet/meu?cliente=todos')
  ok(await p.getByRole('button', { name: 'Lançar tempo' }).count(), 'Membro também lança o próprio tempo')
  ok(!(await lista().locator('li', { hasText: 'Ligação sobre o ISS' }).count()), 'Membro não vê os lançamentos de outra pessoa')
  await p.setViewportSize({ width: 390, height: 844 })
  await ir('timesheet/meu?cliente=todos')
  await p.getByRole('button', { name: 'Lançar tempo' }).first().click()
  await espera(300)
  await shot('celular-lancar')
  ok((await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)) <= 1, 'celular: sem rolagem horizontal com o lançamento aberto')
  await p.keyboard.press('Escape')
  await p.setViewportSize({ width: 1440, height: 900 })

  await painelDemo()
  await p.getByRole('dialog').getByRole('button', { name: /Fernanda Lima/ }).first().click()
  await espera(800)
  await restaurar()
  ok(erros.length === 0, `sem erros no console${erros.length ? ': ' + erros.slice(0, 3).join(' | ') : ''}`)
  await b.close()
  console.log(falhas ? `\n${falhas} falha(s)` : '\ntudo certo')
  process.exit(falhas ? 1 : 0)
})()

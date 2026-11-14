// Teste de ponta a ponta da S04 (Painel C): ficha da tarefa e transições, nova tarefa,
// lista e visões (por responsável, calendário, revisão), trilha de implantação e de saída,
// aba DP (duas visões, kit de rescisão, contrato por cartão), aba Gestão (pauta, "o que
// Fulano vê?"), permissões de Membro, celular de 390px e os temas Condesp e Requinte.
// Uso: app em http://localhost:6100/ (npx vite --port 6100) e
//      node scripts/s04-painel-c.cjs <pasta-das-capturas>
const { chromium } = require('playwright')

;(async () => {
  const out = process.argv[2] || '.'
  const base = process.env.URL_APP || 'http://localhost:6100/'
  const b = await chromium.launch()
  let falhas = 0
  const erros = []
  const ok = (r, m) => {
    if (!r) falhas++
    console.log((r ? 'ok   ' : 'FALHA') + ' ' + m)
  }
  const espera = (p, ms = 400) => p.waitForTimeout(ms)

  async function abrir({ conta = 'Fernanda Lima', largura = 1440, altura = 900, esquema = 'light', tema } = {}) {
    const p = await b.newPage({ viewport: { width: largura, height: altura }, colorScheme: esquema })
    p.on('pageerror', (e) => erros.push(e.message))
    p.on('console', (m) => m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text()) && erros.push(m.text()))
    await p.goto(base)
    await espera(p, 1200)
    if (tema) {
      await p.getByRole('button', { name: /^Demonstração/ }).click()
      await p.locator('select[aria-label="Tema"]').selectOption(tema)
      await p.keyboard.press('Escape')
      await espera(p)
    }
    if (await p.getByRole('heading', { name: 'Entrar' }).count()) {
      await p.getByRole('button', { name: new RegExp(conta) }).first().click()
      await p.getByRole('button', { name: 'Entrar', exact: true }).click()
      await espera(p, 500)
      if (await p.getByLabel('Código').count()) {
        await p.getByLabel('Código').fill('123456')
        await p.keyboard.press('Enter')
      }
      await espera(p, 1200)
    }
    return p
  }
  const ir = async (p, hash) => {
    await p.evaluate((h) => (location.hash = h), hash)
    await espera(p, 900)
  }
  const toast = (p, re) => p.getByText(re).first().isVisible().catch(() => false)

  // Começa da demonstração limpa.
  const p = await abrir()
  await p.getByRole('button', { name: /^Demonstração/ }).click()
  await espera(p)
  const resetar = p.getByRole('button', { name: /Resetar o ambiente/ })
  if (await resetar.count()) {
    await resetar.click()
    await espera(p, 400)
    const conf = p.getByRole('button', { name: /^(Resetar|Restaurar)/ }).last()
    if (await conf.count()) await conf.click()
    await espera(p, 1500)
  }
  await p.close()

  const q = await abrir()
  // 1. Ficha da tarefa (S04-T05)
  await ir(q, '#/painel/dp?tarefa=t10')
  ok(await q.getByRole('toolbar', { name: 'Ações da tarefa' }).isVisible(), 'ficha abre por link com a barra de ações')
  ok(await q.getByText(/Aberta por/).first().isVisible(), 'abrir inicia: a tarefa fica "aberta por" quem abriu')
  ok((await q.getByText(/Checklist · 0 de/).count()) > 0, 'checklist com o molde da atividade')
  await q.getByRole('toolbar', { name: 'Ações da tarefa' }).getByRole('button', { name: /^Concluir/ }).click()
  await q.getByRole('group', { name: 'Concluir' }).getByRole('button', { name: /Concluir/ }).click()
  await espera(q)
  ok(await toast(q, /Falta item obrigatório/), 'concluir recusa com item obrigatório aberto')
  await q.getByRole('group', { name: 'Concluir' }).getByRole('button', { name: 'Cancelar' }).click()
  await q.getByLabel('Novo item do checklist').fill('Conferir com o RH')
  await q.getByRole('button', { name: 'Adicionar item' }).click()
  await espera(q)
  ok(await q.getByText('Conferir com o RH').first().isVisible(), 'item livre acrescentado ao checklist')
  await q.getByText('Dados e documentos do empregado completos', { exact: true }).click()
  await espera(q)
  ok(await q.getByText(/Fernanda Lima,/).first().isVisible(), 'marcar item registra quem e quando')
  await q.getByRole('button', { name: /Aguardar órgão/ }).click()
  await q.getByLabel('Protocolo').fill('2026.11.0042')
  await q.getByRole('group', { name: /Aguardar órgão/ }).getByRole('button', { name: /^Aguardar$/ }).click()
  await espera(q)
  ok(await q.getByText(/Aguardando Receita Federal/).first().isVisible(), 'aguardar órgão exige órgão e protocolo e mostra o detalhe')
  await q.getByRole('button', { name: 'Retomar' }).click()
  await espera(q)
  // Cartão dentro da tarefa
  const aprovar = q.getByRole('button', { name: 'Aprovar', exact: true }).first()
  if (await aprovar.count()) {
    await aprovar.click()
    await espera(q)
    ok(await q.getByText(/Aprovado/).first().isVisible(), 'cartão decidido dentro da tarefa')
  } else ok(false, 'cartão pendente aparece na tarefa')
  await q.getByRole('button', { name: /Serviço extra/ }).click()
  await q.getByRole('button', { name: /Marcar como extra/ }).click()
  await espera(q)
  ok(await q.getByText('serviço extra', { exact: true }).first().isVisible(), 'comanda de serviço extra marcada (C2-25)')
  await q.screenshot({ path: `${out}/s04-ficha.png` })
  await q.getByRole('toolbar', { name: 'Ações da tarefa' }).getByRole('button', { name: 'Cancelar' }).click()
  await q.getByRole('dialog').locator('textarea, input').first().fill('cliente desistiu da contratação')
  await q.getByRole('button', { name: 'Cancelar tarefa' }).click()
  await espera(q)
  ok(await q.getByText(/Cancelada: cliente desistiu/).first().isVisible(), 'cancelar exige motivo e fica no histórico')
  ok(await q.getByText(/cancelou/).first().isVisible(), 'histórico registra o evento')
  await q.keyboard.press('Escape')
  await espera(q)

  // 2. Nova tarefa (S04-T06)
  await ir(q, '#/painel/dp?cliente=c1')
  await q.getByRole('button', { name: 'Nova tarefa' }).first().click()
  await espera(q)
  await q.getByRole('button', { name: 'Criar' }).click()
  await espera(q)
  ok(await q.getByText(/Escolha a atividade do catálogo/).first().isVisible(), 'nova tarefa exige a atividade do catálogo')
  await q.getByPlaceholder(/Buscar: DP-005/).fill('DP-024')
  await q.getByLabel('Atividade', { exact: true }).selectOption({ index: 0 })
  await q.getByRole('button', { name: 'Criar' }).click()
  await espera(q, 700)
  ok(await q.getByRole('toolbar', { name: 'Ações da tarefa' }).isVisible(), 'tarefa criada abre a ficha')
  await q.keyboard.press('Escape')
  await espera(q)

  // 3. Lista e visões (S04-T03, T04)
  const bloco = q.getByRole('tablist', { name: 'Visão das tarefas' }).first()
  await bloco.scrollIntoViewIfNeeded()
  await bloco.getByRole('tab', { name: /Por responsável/ }).click()
  await espera(q)
  ok(await q.getByText(/Arraste uma tarefa para outra pessoa/).first().isVisible(), 'visão por responsável (Administrador reatribui arrastando)')
  await bloco.getByRole('tab', { name: /Calendário/ }).click()
  await espera(q)
  await q.getByRole('tab', { name: 'Mês' }).first().click()
  await espera(q)
  ok(await q.getByText(/novembro de 2026/).first().isVisible(), 'calendário no mês')
  ok((await q.getByText('feriado').count()) > 0, 'feriados marcados no calendário')
  await q.getByRole('tab', { name: 'Semana' }).first().click()
  await bloco.getByRole('tab', { name: /Lista/ }).click()
  await espera(q)
  await q.getByRole('button', { name: /^Pré-visualizar/ }).first().click()
  ok(await q.getByText(/não abre a tarefa nem conta tempo/).first().isVisible(), 'pré-visualização sem abrir')

  // 4. DP (S04-T01)
  await q.getByRole('tab', { name: 'Rescisão' }).click()
  await espera(q, 600)
  ok(await q.getByText('Simulados de rescisão').first().isVisible(), 'visão Rescisão mostra os simulados (E-04)')
  ok(!(await q.getByText('Fechamento da folha · 11/2026').count()), 'visão Rescisão esconde a folha')
  await q.getByRole('button', { name: /Montar kit/ }).first().click()
  await q.waitForTimeout(10000)
  ok(await q.getByText(/chega amanhã/).first().isVisible(), 'kit de rescisão: o integrante pede o extrato que chega amanhã (C2-01)')
  ok(await q.getByText(/Conferir: nome da mãe/).first().isVisible(), 'kit confere o seguro-desemprego')
  await q.screenshot({ path: `${out}/s04-dp-rescisao.png` })
  await q.getByRole('tab', { name: 'Admissão e rotina' }).click()
  await espera(q, 600)
  ok(await q.getByText('Fechamento da folha · 11/2026').first().isVisible(), 'filtro de visão volta para Admissão e rotina')
  await q.getByRole('button', { name: /Gerar contrato/ }).first().click()
  await q.waitForTimeout(8500)
  ok(await q.getByText(/contrato: cartão aguardando você/).first().isVisible(), 'contrato preparado pelo integrante vira cartão')
  await q.getByRole('button', { name: /Resumir CCT/ }).first().click()
  await q.waitForTimeout(10500)
  ok(await q.getByText(/Resumo da CCT/).first().isVisible(), 'resumo da CCT preparado para revisar (C2-04)')
  await q.screenshot({ path: `${out}/s04-dp-rotina.png` })

  // 5. Trilha (S04-T07) e faixa (C6)
  await ir(q, '#/painel/societario?cliente=c4&trilha=c4')
  ok(await q.getByText(/trilha de implantação ainda não foi gerada/).first().isVisible(), 'trilha abre pelo endereço (?trilha=)')
  await q.getByRole('button', { name: 'Gerar trilha' }).click()
  await q.waitForTimeout(2600)
  ok(await q.getByRole('list', { name: 'Marcos' }).isVisible(), 'integrante gera a trilha com os marcos')
  ok((await q.getByText(/depende de/).count()) > 0, 'marcos bloqueados mostram a dependência')
  await q.getByRole('list', { name: 'Marcos' }).getByRole('button', { name: 'concluir' }).first().click()
  await espera(q)
  ok(await q.getByText(/1 de 11 passos/).first().isVisible(), 'concluir marco avança a trilha')
  await q.getByLabel(/Recebido: Certificado/).check()
  await espera(q, 2200)
  ok(await q.getByText(/captura retroativa de 1\.240 XMLs/).first().isVisible(), 'A1 recebido dispara a janela de 90 dias')
  await q.screenshot({ path: `${out}/s04-trilha.png` })
  await q.getByRole('button', { name: 'Passar a ativo' }).click()
  await espera(q)
  ok(await q.getByRole('button', { name: /Cartão aguardando aprovação/ }).isVisible(), 'passar a ativo vira cartão do Gestor')
  await q.getByRole('tab', { name: 'Saída' }).click()
  await espera(q)
  ok(await q.getByRole('button', { name: 'Iniciar saída' }).isVisible(), 'aba de saída com iniciar saída')
  await q.keyboard.press('Escape')

  // 6. Gestão (S04-T02)
  await ir(q, '#/painel/gestao')
  await q.getByRole('button', { name: 'João Pereira', exact: true }).first().click()
  ok(await q.getByText('O que João Pereira vê').first().isVisible(), '"o que Fulano vê?" calculado')
  await q.getByRole('button', { name: 'Gerar pauta' }).click()
  await q.waitForTimeout(6000)
  ok(await q.getByText(/Atrasos \(/).first().isVisible(), 'pauta semanal montada pelo Assistente (C2-28)')
  await q.getByRole('button', { name: /Reprocessar/ }).first().click()
  await q.waitForTimeout(2000)
  ok(await toast(q, /Reprocessado/), 'reprocessar rotina com erro (D-38)')
  await q.screenshot({ path: `${out}/s04-gestao.png` })
  await q.close()

  // 7. Membro do DP: sem Gestão, sem cancelar tarefa de obrigação
  const m = await abrir({ conta: 'Ana Souza' })
  await ir(m, '#/painel/dp')
  ok(!(await m.getByRole('button', { name: 'Gestão', exact: true }).count()) && !(await m.getByRole('tab', { name: /^Gestão/ }).count()), 'Membro não vê a aba Gestão')
  const ids = await m.evaluate(() => Object.keys(localStorage).filter((k) => k.includes(':tarefa')))
  void ids
  await ir(m, '#/painel/dp?tarefa=t11')
  if (await m.getByRole('toolbar', { name: 'Ações da tarefa' }).count()) {
    const origem = await m.getByText('obrigação', { exact: true }).count()
    const cancelar = await m.getByRole('toolbar', { name: 'Ações da tarefa' }).getByRole('button', { name: 'Cancelar' }).count()
    ok(!origem || !cancelar, 'Membro não cancela tarefa de obrigação')
  }
  await m.close()

  // 8. Celular 390px
  const c = await abrir({ largura: 390, altura: 844 })
  await ir(c, '#/painel/dp?cliente=c1&tarefa=t10')
  const largura = await c.evaluate(() => document.documentElement.scrollWidth)
  ok(largura <= 392, `ficha no celular sem rolagem horizontal (${largura}px)`)
  await c.screenshot({ path: `${out}/s04-celular-ficha.png` })
  await c.keyboard.press('Escape')
  await ir(c, '#/painel/societario?cliente=c4&trilha=c4')
  await c.screenshot({ path: `${out}/s04-celular-trilha.png` })
  ok((await c.evaluate(() => document.documentElement.scrollWidth)) <= 392, 'trilha no celular sem rolagem horizontal')
  await c.close()

  // 9. Temas (Condesp e Requinte, claro e escuro)
  for (const tema of ['condesp', 'requinte'])
    for (const esquema of ['light', 'dark']) {
      const t = await abrir({ tema, esquema })
      await ir(t, '#/painel/dp?cliente=c1&tarefa=t1')
      await t.screenshot({ path: `${out}/s04-tema-${tema}-${esquema}.png` })
      await t.keyboard.press('Escape')
      await ir(t, '#/painel/gestao')
      await t.screenshot({ path: `${out}/s04-tema-${tema}-${esquema}-gestao.png` })
      ok(true, `tema ${tema} ${esquema === 'dark' ? 'escuro' : 'claro'} capturado`)
      await t.close()
    }

  ok(erros.length === 0, `sem erros no console${erros.length ? `: ${erros.slice(0, 3).join(' | ')}` : ''}`)
  await b.close()
  console.log(falhas ? `\n${falhas} falha(s)` : '\ntudo certo')
  process.exit(falhas ? 1 : 0)
})()

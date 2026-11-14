// Teste de ponta a ponta da S03 (Painel B: Fiscal, Contábil, Consultoria).
// Uso: app servido em http://localhost:6100/ (npx vite --port 6100) e
//      node scripts/s03-painel-b.cjs <pasta-das-capturas>
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
  const espera = (ms = 400) => p.waitForTimeout(ms)
  const shot = (n) => p.screenshot({ path: `${out}/s03-${n}.png` })
  const widget = (t) => p.locator(`article[aria-label^="${t}"]`).first()
  const texto = () => p.evaluate(() => document.body.innerText)
  const pronto = async () => {
    await p.waitForFunction(() => document.body && !document.body.innerText.includes('Abrindo o escritório'), null, { timeout: 45000 })
    await espera(700)
  }
  const entrar = async (nome) => {
    await p.goto(base)
    await pronto()
    await p.getByRole('button', { name: new RegExp(nome) }).first().click()
    await p.getByRole('button', { name: 'Entrar', exact: true }).click()
    await espera(500)
    if (await p.getByLabel('Código').count()) {
      await p.getByLabel('Código').fill('123456')
      await p.keyboard.press('Enter')
    }
    await espera(1000)
  }
  const ir = async (rota) => {
    await p.goto(base + rota)
    await espera(1500)
  }
  /** Aprova o cartão pendente que está dentro de um widget (o mesmo cartão do chat). */
  const aprovarEm = async (w) => {
    const botao = w.locator('[data-cartao-pendente]').getByRole('button', { name: /^Aprovar/ }).first()
    await botao.waitFor({ timeout: 8000 })
    await botao.click()
    await espera(600)
  }

  // Começa do zero no escritório Andrade.
  await p.goto(base)
  await pronto()
  await p.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('heild:') || k.startsWith('ui-lab:')).forEach((k) => localStorage.removeItem(k)))
  await entrar('Fernanda Lima')

  // 1. Fiscal com cliente (Lucro Presumido)
  await ir('#/painel/fiscal?cliente=c1')
  for (const t of ['Caixas postais', 'Declarações do mês', 'DCTFWeb, Reinf', 'Conferência e reforma', 'Central de guias', 'Certidões, malhas', 'Trava do REINF', 'Obrigações do setor']) ok(await widget(t).count(), `Fiscal (Presumido): bloco “${t}”`)
  const caixas = widget('Caixas postais')
  await caixas.getByRole('button', { name: /Pendência na DCTFWeb/ }).click()
  ok((await caixas.innerText()).includes('Resumo do Fiscal (sem abrir)'), 'S03-A01: resumo sem abrir, com ciência tácita')
  await caixas.getByRole('button', { name: /Abrir mensagem \(dá ciência\)/ }).click()
  await espera(500)
  await aprovarEm(caixas)
  await caixas.getByRole('button', { name: /Pendência na DCTFWeb/ }).click().catch(() => {})
  await espera(400)
  ok(/aberta em \d\d\/\d\d \(ciência dada\)/.test(await caixas.innerText()), 'S03-A02: abrir pelo cartão dá ciência e mostra o teor')
  await shot('fiscal-caixa')

  const decl = widget('Declarações do mês')
  ok((await decl.innerText()).includes('falta conferência FIS-004'), 'S03-A06: transmitir pede a conferência (falta X)')
  const conf = widget('Conferência e reforma')
  await conf.getByRole('button', { name: /Aprovar conferência/ }).click()
  await espera(400)
  const dialogo = p.getByRole('dialog')
  if (await dialogo.count()) {
    await dialogo.getByRole('textbox').fill('Diferenças já em tarefa com o DP')
    await dialogo.getByRole('button', { name: 'Aprovar conferência' }).click()
    await espera(400)
  }
  ok((await conf.innerText()).includes('aprovada por'), 'S03-A16: aprovar conferência libera o transmitir')
  const giaLinha = decl.locator('li', { hasText: 'GIA' })
  await giaLinha.getByRole('button', { name: /Transmitir/ }).click()
  await espera(500)
  await aprovarEm(decl)
  await decl.locator('li', { hasText: 'GIA' }).getByText('transmitida').waitFor({ timeout: 9000 }).catch(() => {})
  ok((await decl.locator('li', { hasText: 'GIA' }).innerText()).includes('recibo'), 'S03-A06: aprovar transmite e grava o recibo')

  const sit = widget('Situação fiscal')
  await sit.getByRole('button', { name: /Gerar agora/ }).click()
  await sit.getByText(/consultado/).waitFor({ timeout: 6000 }).catch(() => {})
  ok((await sit.innerText()).includes('comparado com a consulta anterior'), 'S03-A03: gerar situação fiscal agora (demonstração)')

  const guias = widget('Central de guias')
  ok((await guias.innerText()).includes('vencida'), 'Central de guias: guia vencida marcada (texto e cor)')
  await guias.getByRole('button', { name: /Recalcular/ }).first().click()
  await guias.getByText(/recalculada/).waitFor({ timeout: 6000 }).catch(() => {})
  ok((await guias.innerText()).includes('recalculada'), 'S03-A12: recalcular guia vencida com juros e multa')

  // 2. Números por cliente (não repetem a Metalúrgica)
  await ir('#/painel/fiscal?cliente=c7')
  const sCafe = await widget('Simples Nacional').innerText().catch(() => '')
  ok(sCafe.includes('Alíquota efetiva') && sCafe.includes('Fator R'), 'Fiscal (Simples): PGDAS-D com alíquota efetiva e fator R (S03-A05)')
  await ir('#/painel/fiscal?cliente=c2')
  const sPadaria = await widget('Simples Nacional').innerText().catch(() => '')
  ok(sPadaria && sPadaria !== sCafe, 'Simples: números diferentes entre clientes')
  await ir('#/painel/fiscal?cliente=c6')
  ok(await widget('IRPF').count(), 'Fiscal (pessoa física): IRPF e carnê-leão (S03-A19)')
  await ir('#/painel/fiscal?cliente=c-s03-mei')
  ok(await widget('MEI').count(), 'Fiscal (MEI): DAS-MEI e limite')

  // 3. Carteira fiscal: lote
  await ir('#/painel/fiscal?cliente=todos')
  const cart = widget('Visão do integrante')
  ok((await cart.innerText()).includes('PGDAS-D de outubro'), 'Carteira: visão do integrante com prontos e de fora')
  ok(await cart.getByRole('button', { name: /Transmitir em lote/ }).count(), 'S03-A07: transmitir em lote (Administrador)')

  // 4. Contábil com cliente
  await ir('#/painel/contabil?cliente=c1')
  for (const t of ['Fechamento', 'O que deve chegar', 'Triagem e extratos', 'Classificação e de-para', 'Distribuição de lucros', 'Relatórios ao cliente', 'Travas antes de enviar', 'Fila de assinatura', 'Obrigações do setor']) ok(await widget(t).count(), `Contábil: bloco “${t}”`)
  ok((await widget('O que deve chegar').innerText()).includes('não mandou extrato'), 'D-03: aponta o banco que não mandou extrato')
  const lucros = widget('Distribuição de lucros')
  ok((await lucros.innerText()).includes('retenção de 10%'), 'D-14: alerta de R$ 50 mil com imposto e vencimento')
  await lucros.getByRole('button', { name: 'Ciente' }).first().click()
  await espera(300)
  await lucros.getByRole('button', { name: /Responder/ }).first().click()
  await espera(400)
  await p.getByRole('radio', { name: /distribuição de lucro/ }).click()
  await p.getByRole('button', { name: 'Responder', exact: true }).last().click()
  await espera(500)
  ok((await lucros.innerText()).includes('sempre lucro') || (await lucros.innerText()).includes('nunca lucro'), 'S03-A30: resposta vira regra por favorecido (D-13)')
  await shot('contabil-lucros')

  const clas = widget('Classificação e de-para')
  await clas.getByRole('button', { name: /Corrigir de-para/ }).first().click()
  await espera(400)
  await p.getByRole('button', { name: 'Salvar e ensinar' }).click()
  await espera(400)
  ok((await clas.innerText()).includes('Regras aprendidas'), 'S03-A27: corrigir de-para vira regra do integrante')

  const rel = widget('Relatórios ao cliente')
  await rel.locator('li', { hasText: 'DRE de outubro' }).getByRole('button', { name: /Gerar/ }).click()
  await espera(300)
  await rel.locator('li', { hasText: 'DRE de outubro' }).getByRole('button', { name: /Para assinatura/ }).click()
  await espera(400)
  const fila = widget('Fila de assinatura')
  await fila.getByRole('button', { name: /Devolver sem assinatura digital/ }).first().click()
  await fila.getByText('assinatura recusada').waitFor({ timeout: 6000 }).catch(() => {})
  ok((await fila.innerText()).includes('assinatura recusada'), 'D-16: conferência recusa PDF sem assinatura digital')
  await fila.getByRole('button', { name: /^Devolver assinado/ }).first().click()
  await fila.getByText('assinatura conferida').waitFor({ timeout: 6000 }).catch(() => {})
  ok((await fila.innerText()).includes('assinatura conferida'), 'S03-A36: assinatura conferida dentro do PDF')
  await fila.getByRole('button', { name: /Liberar envio/ }).click()
  await espera(500)
  await aprovarEm(fila).catch(() => {})
  await espera(500)
  ok((await rel.locator('li', { hasText: 'DRE de outubro' }).innerText()).includes('enviado'), 'S03-A37: enviar relatório só depois de assinado e conferido')

  await ir('#/painel/contabil?cliente=c3')
  const relLoja = widget('Relatórios ao cliente')
  await relLoja.locator('li', { hasText: 'Balancete de outubro' }).getByRole('button', { name: /Gerar/ }).click()
  await espera(400)
  ok((await relLoja.innerText()).includes('trava aberta'), 'D-26: relatório com trava aberta não vira cartão')

  await ir('#/painel/contabil?cliente=c2')
  ok(await widget('Declaração de faturamento').getByRole('button', { name: 'Virar tarefa' }).count(), 'C2-14: pedido do app vira tarefa')

  await ir('#/painel/contabil?cliente=todos')
  const kanban = widget('Kanban do fechamento')
  ok((await kanban.innerText()).includes('Conferência'), 'D-22: Kanban do fechamento na carteira')
  await kanban.getByRole('button', { name: 'Pendente' }).first().click()
  await espera(300)
  ok(await widget('Minha fila').count(), 'D-22: Minha fila')
  await shot('contabil-kanban')

  // 5. Consultoria
  await ir('#/painel/consultoria?cliente=c1')
  const perg = widget('Perguntas técnicas')
  await perg.getByRole('button', { name: 'Revisar e editar' }).first().click()
  await espera(500)
  ok((await texto()).includes('sem suporte'), 'S03-A43: editor do parecer destaca afirmação sem suporte')
  await p.getByRole('button', { name: 'Salvar revisão' }).click()
  await espera(500)
  await perg.getByRole('button', { name: /Enviar ao cliente/ }).first().click()
  await espera(500)
  await aprovarEm(perg)
  ok((await perg.innerText()).includes('enviada'), 'S03-A44: parecer enviado com aprovação')
  await perg.getByRole('button', { name: /Propor como avulso/ }).first().click()
  await espera(400)
  ok((await perg.innerText()).includes('avulso a propor'), 'S03-A48: fora do escopo vira avulso a propor')
  const ref = widget('Reforma tributária')
  await ref.getByRole('button', { name: /Calculadora/ }).first().click()
  await ref.getByText(/divergência/).waitFor({ timeout: 6000 }).catch(() => {})
  ok((await ref.innerText()).includes('divergência'), 'S03-A49: simulação da reforma contra a calculadora oficial')

  // 5b. Gatilho do painel Demonstração: o Fiscal acorda com mensagem nova e deixa o cartão
  await ir('#/painel/fiscal?cliente=c1')
  await p.getByRole('button', { name: /^Demonstração/ }).click()
  await espera(400)
  await p.getByRole('button', { name: /Mensagem nova no e-CAC/ }).click()
  await p.waitForTimeout(8000)
  const cx = widget('Caixas postais')
  ok((await cx.innerText()).includes('retenções de IRRF de agosto'), 'Gatilho ecac.mensagem.receber: o Fiscal lê sem abrir e deixa o cartão')
  ok(await cx.locator('[data-cartao-pendente]').count(), 'Gatilho: cartão “abrir” aparece na aba (o mesmo do chat)')

  // 6. Persistência
  await p.reload()
  await espera(1800)
  await ir('#/painel/fiscal?cliente=c1')
  ok((await widget('Declarações do mês').locator('li', { hasText: 'GIA' }).innerText()).includes('recibo'), 'Recarregar a página mantém o que foi feito')

  // 7. Celular
  await p.setViewportSize({ width: 390, height: 844 })
  await ir('#/painel/contabil?cliente=c1')
  const larg = await p.evaluate(() => document.documentElement.scrollWidth)
  ok(larg <= 392, `Celular (390px): sem rolagem horizontal (${larg}px)`)
  await shot('celular-contabil')
  await p.setViewportSize({ width: 1440, height: 900 })

  // 8. Permissão: Gestor sem gestão no Fiscal não vê o lote
  const p2 = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage()
  await p2.goto(base)
  await p2.waitForFunction(() => document.body && !document.body.innerText.includes('Abrindo o escritório'), null, { timeout: 45000 })
  await p2.waitForTimeout(700)
  await p2.getByRole('button', { name: /João Pereira/ }).first().click()
  await p2.getByRole('button', { name: 'Entrar', exact: true }).click()
  await p2.waitForTimeout(600)
  if (await p2.getByLabel('Código').count()) {
    await p2.getByLabel('Código').fill('123456')
    await p2.keyboard.press('Enter')
  }
  await p2.waitForTimeout(1200)
  await p2.goto(base + '#/painel/fiscal?cliente=todos')
  await p2.waitForTimeout(1800)
  const visaoJoao = p2.locator('article[aria-label^="Visão do integrante"]').first()
  await visaoJoao.waitFor({ timeout: 15000 }).catch(() => {})
  ok((await visaoJoao.count()) && !(await visaoJoao.getByRole('button', { name: /Transmitir em lote/ }).count()), 'Permissão: sem gestão no Fiscal, o lote some')
  await p2.goto(base + '#/painel/contabil?cliente=c1')
  await p2.locator('article[aria-label^="Distribuição de lucros"]').first().waitFor({ timeout: 15000 }).catch(() => {})
  ok(await p2.locator('article[aria-label^="Distribuição de lucros"]').count(), 'Gestor do Contábil vê a aba Contábil com os blocos')

  ok(!erros.length, `sem erros no console${erros.length ? `: ${erros.slice(0, 3).join(' | ')}` : ''}`)
  console.log(falhas ? `\n${falhas} falha(s)` : '\nTudo certo')
  await b.close()
  process.exit(falhas ? 1 : 0)
})()

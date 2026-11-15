// S08b · BPO › Fila e pedidos (S08-T03) e BPO › Rotinas (S08-T04), de ponta a ponta sobre o banco:
// documentos chegando (o integrante lê e checa; lança sozinho só o que é seguro; anexar ao pedido
// completa o que faltava e o SLA começa; duplicidade só passa com motivo; descartar com motivo;
// comprovante guardado com a conta), pedido virando conta lançada (quem digita não confere), detalhe
// do item com anotação, histórico, passar a bola e cobrar pelo integrante, atalhos e ordem por risco,
// pedido da equipe, resolver com nota e reabrir com motivo, Membro com "só as minhas" e sem reatribuir;
// Rotinas com checklist e calendário, captura do ERP, extrato pelo Open Finance (simulado, com erro e
// "Tentar de novo"), conciliação com a baixa no ERP e desfazer, lançamentos no modo arquivo, contas a
// receber (baixa com o extrato, lembrete pelo integrante, fora do escopo), fechamento do mês com o
// rascunho do Gerencial, revisão, fechar e reabrir; configurar rotinas; celular de 390 px; tema escuro,
// Condesp e Requinte. Termina restaurando a demonstração.
// Uso: app servido em http://localhost:6100/ (npx vite --port 6100) e
//      node scripts/s08b-operacao.cjs <pasta-das-capturas>
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
  const shot = (n) => p.screenshot({ path: `${out}/s08b-${n}.png` })
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
  const fecharLab = async () => {
    await p.keyboard.press('Escape')
    await espera(300)
  }
  const entrar = async (nome) => {
    await lab()
    await p.getByRole('dialog').getByRole('button', { name: new RegExp(nome) }).first().click()
    await espera(1200)
    if (await p.getByRole('dialog').count()) await fecharLab()
  }
  const ir = async (aba, cliente = 'todos') => {
    await p.goto(`${base}#/bpo/${aba}?cliente=${cliente}`)
    await espera(1000)
  }
  const secao = async (nome) => {
    await p.getByRole('radio', { name: new RegExp(`^${nome}`) }).first().click()
    await espera(400)
  }
  const confirmarDialogo = async (acao, motivo) => {
    const d = p.getByRole('dialog').last()
    if (motivo) await d.getByRole('textbox').last().fill(motivo)
    await d.getByRole('button', { name: acao, exact: true }).click()
    await espera(500)
  }
  const doc = (nome) => p.locator('li', { hasText: nome }).first()
  const item = (texto) => p.locator('ul[aria-label="Fila do BPO"] > li', { hasText: texto }).first()

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

  // 1. Fila da carteira: resumo, documentos chegando, atalho "bola parada", ordem por risco, busca (A13)
  await ir('fila')
  ok(await visivel(p.getByRole('list', { name: 'Documentos chegando' })), 'a Fila abre com os documentos chegando (captura de documentos)')
  ok(await p.getByRole('button', { name: /bola parada/ }).count(), 'resumo da fila com "bola parada", "vencem hoje" e "sem completude"')
  await p.getByRole('button', { name: /bola parada/ }).first().click()
  await espera(400)
  ok(await visivel(item('Estorno da tarifa')), 'atalho "bola parada" mostra o item com o terceiro (banco) parado há dias')
  await p.getByRole('button', { name: /bola parada/ }).first().click()
  await p.getByLabel('Ordem da fila').selectOption('risco')
  await espera(400)
  ok(await p.getByText(/risco: /).count(), 'ordem por risco mostra o motivo do risco de cada item')
  await p.getByLabel('Buscar na fila').fill('Nibo')
  await espera(300)
  ok((await p.locator('ul[aria-label="Fila do BPO"] > li').count()) === 1, 'busca filtra a fila')
  await p.getByLabel('Buscar na fila').fill('')
  await p.getByLabel('Ordem da fila').selectOption('prazo')
  await shot('fila')

  // 2. Documento da Padaria: o integrante lê, checa (fornecedor novo) e deixa para revisar; anexar ao pedido completa o SLA
  await ir('fila', 'c2')
  await doc('boleto-assistec-forno.pdf').getByRole('button', { name: 'Ler', exact: true }).click()
  ok(await visivel(p.getByText(/o integrante está lendo/), 4000), 'o integrante aparece lendo o documento')
  ok(await visivel(doc('boleto-assistec-forno.pdf').getByText('lido pelo integrante'), 30000), 'leitura do integrante gravada (valor, vencimento, fornecedor)')
  ok(await doc('boleto-assistec-forno.pdf').getByText('fornecedor novo').count(), 'checagem: fornecedor novo (não lança sozinho)')
  await doc('boleto-assistec-forno.pdf').getByRole('button', { name: /Ações de boleto-assistec/ }).click()
  await p.getByRole('menuitem', { name: /Anexar ao pedido: Paguem o conserto/ }).click()
  await espera(500)
  ok(await visivel(item('Assistec').getByText(/SLA corre/)), 'anexar ao pedido completa boleto e valor: o SLA começa (BPO-009)')
  // 3. Executar o item: "Lançar a conta" preenchido com a leitura; quem lança é quem digitou
  await item('Assistec').getByRole('button', { name: 'Lançar a conta' }).click()
  await espera(400)
  ok((await dlg().getByLabel('Valor (R$)').inputValue()) === '1850', 'gaveta preenchida com a leitura do documento')
  await dlg().getByRole('button', { name: 'Lançar a conta', exact: true }).click()
  await espera(600)
  ok(!(await item('Assistec').count()), 'conta lançada e o pedido sai da fila (resolvido com a nota)')
  // 4. DDA seguro: o integrante lê e lança sozinho (captura é "faz sozinho"); nunca confere
  await doc('dda-moinho-sul-dez.pdf').getByRole('button', { name: 'Ler', exact: true }).click()
  let saiu = false
  for (let i = 0; i < 30 && !saiu; i++) {
    await espera(1000)
    saiu = !(await p.getByRole('list', { name: 'Documentos chegando' }).getByText('dda-moinho-sul-dez.pdf').count())
  }
  await p.getByRole('button', { name: /Ver \d+ já tratado/ }).click()
  await espera(300)
  ok(saiu && (await doc('dda-moinho-sul-dez.pdf').getByText('conta lançada').count()), 'leitura segura e sem alerta: o integrante lança a conta sozinho')
  ok(await p.getByText(/Conta lançada por Contas a Pagar \(integrante\): outra pessoa confere/).count(), 'documento lançado mostra quem lançou e que outra pessoa confere')
  await shot('documentos')
  await ir('aprovacoes', 'c2')
  ok(await visivel(p.getByText('Assistec Refrigeração').first()), 'a conta do pedido aparece em Aprovações para outra pessoa conferir')

  // 5. Nota do Mercado: duplicidade e dados bancários diferentes; lançar exige motivo; descartar com motivo
  await ir('fila', 'c8')
  await doc('NF-8812').getByRole('button', { name: 'Revisar e lançar' }).click()
  await espera(400)
  ok(await dlg().getByText(/Dados bancários diferentes do cadastro/).count(), 'revisão mostra dados bancários diferentes do cadastro (segundo canal)')
  ok(await dlg().getByRole('button', { name: 'Lançar a conta', exact: true }).isDisabled(), 'duplicidade: lançar fica desligado sem o motivo')
  await p.keyboard.press('Escape')
  await espera(300)
  await doc('NF-8812').getByRole('button', { name: /Ações de NF-8812/ }).click()
  await p.getByRole('menuitem', { name: /Descartar/ }).click()
  await confirmarDialogo('Descartar', 'É a nota da conta já lançada pelo pedido da Patrícia')
  ok(!(await p.getByRole('list', { name: 'Documentos chegando' }).getByText('NF-8812').count()), 'documento descartado com motivo (nada se apaga)')

  // 6. Comprovante do Studio: guardar com a conta (a baixa só vale com comprovante ou extrato)
  await ir('fila', 'c9')
  await doc('comprovante-autodesk').getByRole('button', { name: 'Ler', exact: true }).click()
  ok(await visivel(doc('comprovante-autodesk').getByRole('button', { name: /Guardar com a conta Autodesk/ }), 30000), 'comprovante lido sugere guardar com a conta certa')
  await doc('comprovante-autodesk').getByRole('button', { name: /Guardar com a conta/ }).click()
  await espera(400)
  ok(!(await p.getByRole('list', { name: 'Documentos chegando' }).getByText('comprovante-autodesk').count()), 'comprovante guardado com a conta')

  // 7. Detalhe do item: anotação, histórico, passar a bola (motivo), cobrar pelo integrante (A15)
  await ir('fila', 'c4')
  await p.getByRole('button', { name: /Abrir Conferir a diferença do saldo/ }).click()
  await espera(500)
  ok(await visivel(dlg().getByText(/O Omie mostra R\$ 64.120/)), 'detalhe do item mostra a anotação da equipe (pedido da Marina)')
  await dlg().getByPlaceholder('Escreva uma anotação para a equipe').fill('Confirmei: é o TED da Odontoprev de 16/11.')
  await dlg().getByRole('button', { name: 'Anotar' }).click()
  await espera(400)
  ok(await visivel(dlg().getByText(/Confirmei: é o TED/)), 'anotação guardada no item')
  ok(await dlg().getByRole('region', { name: 'Histórico' }).getByText(/anotou/).count(), 'histórico do item com quem fez o quê')
  await dlg().getByLabel('Passar a bola').selectOption('cliente')
  await confirmarDialogo('Passar a bola', 'Pedimos o extrato do Itaú de 16/11')
  ok(await visivel(dlg().getByText(/SLA pausado/)), 'passar a bola para o cliente pausa o SLA')
  await dlg().getByRole('button', { name: /Cobrar pelo integrante/ }).click()
  ok(await visivel(dlg().getByText(/cobrança ao cliente/), 30000), 'o integrante cobra o cliente e a cobrança fica anotada (BPO-010)')
  await p.keyboard.press('Escape')
  await espera(400)
  await shot('fila-detalhe')

  // 8. Pedido da equipe, resolver com nota, reabrir com motivo (A14, A16)
  await p.getByRole('button', { name: 'Pedido', exact: true }).click()
  await espera(400)
  await dlg().getByLabel('Pedido').fill('Conferir a tarifa do Itaú de novembro')
  await dlg().getByLabel('Chegou por').selectOption('interno')
  await dlg().getByRole('button', { name: 'Abrir o pedido' }).click()
  await espera(600)
  ok(await visivel(item('Conferir a tarifa do Itaú').getByText(/SLA corre/)), 'pedido da equipe entra completo e o SLA começa')
  await item('Conferir a tarifa do Itaú').getByRole('button', { name: /Resolvido/ }).click()
  await confirmarDialogo('Resolver', 'Tarifa correta, conforme o pacote')
  ok(!(await item('Conferir a tarifa do Itaú').count()), 'resolvido com a nota sai da fila')
  await p.getByRole('button', { name: /Resolvidos neste mês/ }).click()
  await espera(300)
  ok(await p.getByText(/Tarifa correta, conforme o pacote/).count(), 'resolvidos mostram como foi resolvido')
  await p.getByRole('list', { name: 'Resolvidos' }).locator('li', { hasText: 'tarifa do Itaú' }).getByRole('button', { name: /Reabrir/ }).click()
  await confirmarDialogo('Reabrir', 'O cliente contestou a tarifa')
  ok(await visivel(item('Conferir a tarifa do Itaú')), 'reaberto com motivo volta à fila')

  // 9. Rotinas da carteira por exceção e o checklist do dia (A18)
  await ir('rotinas')
  ok(await visivel(p.getByRole('list', { name: 'Rotinas da carteira' })), 'Rotinas sem empresa abre o painel da carteira por exceção')
  ok(await p.getByText(/para lançar no ERP/).count(), 'carteira mostra o que falta lançar no ERP (modo arquivo)')
  await p.getByRole('list', { name: 'Rotinas da carteira' }).locator('li', { hasText: 'Padaria' }).getByRole('button', { name: /Abrir/ }).click()
  await espera(600)
  await secao('Hoje')
  await p.getByRole('checkbox', { name: /Baixar e conciliar o extrato · Padaria/ }).check()
  await espera(300)
  ok(await visivel(p.getByText(/Fernanda Lima, hoje/)), 'checklist registra quem marcou e quando')
  await p.getByRole('button', { name: /ter 17: \d+ itens/ }).click()
  ok(await visivel(p.getByRole('list', { name: /Itens de ter 17/ })), 'calendário único: tocar no dia mostra os itens dos dois pacotes (A20)')
  await shot('rotinas-hoje')

  // 10. Contas a pagar: captura do Conta Azul pelo integrante
  await secao('Contas a pagar')
  await p.getByRole('button', { name: /Capturar do Conta Azul/ }).click()
  ok(await visivel(p.getByText(/demonstração/).first(), 8000), 'captura do ERP marcada como demonstração')
  await p.getByRole('button', { name: /^\d+ para conferir/ }).click()
  await espera(200)
  await p.getByRole('button', { name: /^\d+ para conferir/ }).click()
  ok(await visivel(p.getByText('Distribuidora Trigal'), 30000), 'o integrante captura as contas novas do Conta Azul (ficam para conferir)')
  await shot('rotinas-pagar')

  // 11. Conciliação: extrato pelo Open Finance (simulado), conciliar manda a baixa ao ERP, desfazer
  await secao('Conciliação')
  await p.getByRole('button', { name: /Buscar o extrato agora/ }).click()
  ok(await visivel(p.getByText('PIX REC IFOOD REPASSE'), 8000), 'extrato novo lido pelo Open Finance (demonstração)')
  await p.locator('li', { hasText: 'PIX REC IFOOD REPASSE' }).getByRole('button', { name: 'Ok' }).click()
  await espera(400)
  ok(await visivel(p.getByRole('list', { name: 'Conciliadas' }).getByText(/baixa no Conta Azul/)), 'conciliar no modo API manda a baixa ao ERP (erp.baixar)')
  await p.getByRole('button', { name: /Desfazer a conciliação de PIX REC IFOOD/ }).click()
  await espera(400)
  ok(await visivel(p.locator('li', { hasText: 'PIX REC IFOOD REPASSE' }).getByRole('button', { name: 'Ok' })), 'desfazer volta a linha para conciliar')
  await shot('rotinas-conciliacao')
  // Erro do serviço: "Serviços externos falhando" e "Tentar de novo"
  await lab()
  await p.getByRole('dialog').getByRole('button', { name: /Serviços externos/ }).click()
  await fecharLab()
  let viuErro = false
  for (let i = 0; i < 6 && !viuErro; i++) {
    await p.getByRole('button', { name: /Buscar o extrato agora/ }).click()
    await espera(2600)
    viuErro = (await p.getByRole('button', { name: /Tentar de novo/ }).count()) > 0
  }
  ok(viuErro, 'serviço externo falhando mostra o erro com "Tentar de novo"')
  await lab()
  await p.getByRole('dialog').getByRole('button', { name: /Serviços externos/ }).click()
  await fecharLab()

  // 12. Fechamento da Padaria: rascunho do Gerencial, revisão, fechar, reabrir (só Administrador)
  await secao('Fechamento')
  ok(await p.getByLabel(/Fechar o mês indisponível/).count(), 'fechar o mês desligado com o motivo enquanto falta o rascunho')
  await p.getByRole('button', { name: /Pedir o rascunho ao Gerencial/ }).click()
  ok(await visivel(p.getByRole('table', { name: 'DRE gerencial' }), 30000), 'o Gerencial rascunha o relatório (DRE gerencial, caixa, riscos)')
  await p.getByRole('button', { name: 'Revisar e aprovar' }).click()
  await espera(400)
  await dlg().getByRole('button', { name: 'Aprovar o rascunho' }).click()
  await espera(500)
  ok(await visivel(p.getByText(/revisado por Fernanda Lima/)), 'o Gestor revisa e aprova o rascunho')
  await p.getByRole('button', { name: 'Fechar o mês', exact: true }).click()
  await confirmarDialogo('Fechar o mês')
  ok(await visivel(p.getByText(/Fechado por Fernanda Lima/)), 'mês fechado: lançamentos ao Contábil (bpo.mes_fechado)')
  await shot('rotinas-fechamento')
  await p.getByRole('button', { name: /Reabrir o mês/ }).click()
  await confirmarDialogo('Reabrir', 'Faltou uma nota de outubro')
  ok(await visivel(p.getByText(/Reaberto por Fernanda Lima/)), 'Administrador reabre com motivo')

  // 13. Contas a receber: fora do escopo na Padaria; na Clínica, baixa e lembrete pelo integrante
  await secao('A receber')
  ok(await visivel(p.getByText('Contas a receber fora do escopo')), 'a receber fora do escopo da empresa vira estado vazio com o motivo')
  await ir('rotinas', 'c4')
  await secao('A receber')
  await p.locator('li', { hasText: 'Amil Dental' }).getByRole('button', { name: /Dar baixa/ }).click()
  await espera(400)
  ok(await visivel(p.locator('li', { hasText: 'Amil Dental' }).getByText('recebida')), 'baixa do título a receber')
  await p.getByRole('button', { name: /lembrete aos atrasados/ }).click()
  ok(await visivel(p.getByText(/lembrete de cobrança enviado pelo Atendimento/), 30000), 'o Contas a Receber prepara o lembrete amigável (o Atendimento envia)')

  // 14. Lançamentos no ERP do Mercado (modo arquivo): marcar a baixa lançada à mão; fechamento bloqueado
  await ir('rotinas', 'c8')
  await secao('Lançamentos no ERP')
  const antes = await p.getByRole('button', { name: /Lancei no Nibo/ }).count()
  await p.locator('li', { hasText: 'TARIFA PACOTE PJ' }).getByRole('button', { name: /Lancei no Nibo/ }).click()
  await espera(400)
  ok((await p.getByRole('button', { name: /Lancei no Nibo/ }).count()) === antes - 1, 'baixa lançada à mão no Nibo (manual, conta no SLA)')
  ok(await p.getByText(/TARIFA PACOTE PJ · manual/).count(), 'lançadas à mão mostram quem e quando')
  await secao('Fechamento')
  ok(await visivel(p.getByText(/baixas? do mês para lançar no ERP/)), 'fechamento do Mercado bloqueado pelas baixas de outubro no Nibo')
  await shot('rotinas-lancamentos')

  // 14b. Painel Demonstração: boleto com os dados bancários trocados chega pelo WhatsApp; o integrante alerta
  await lab()
  await p.getByRole('dialog').getByRole('button', { name: /dados bancários trocados/ }).click()
  await fecharLab()
  await ir('fila', 'c8')
  await doc('boleto-frigorifico').getByRole('button', { name: 'Ler', exact: true }).click()
  ok(await visivel(doc('boleto-frigorifico').getByText('dados bancários diferentes'), 30000), 'boleto com dados bancários trocados: o integrante alerta e não lança (10, 3.13)')
  await ir('rotinas', 'c8')

  // 15. Configurar rotinas (Gestor): renomear em linha, adicionar, desligar (A21)
  await secao('Hoje')
  await p.getByRole('button', { name: /Configurar rotinas/ }).click()
  await espera(400)
  let g = dlg()
  await g.getByLabel('Nome', { exact: true }).fill('Conferir as notas de entrada')
  await g.getByRole('button', { name: 'Adicionar rotina' }).click()
  await espera(400)
  ok(await visivel(g.getByText('Conferir as notas de entrada')), 'rotina nova configurada')
  await g.getByRole('switch', { name: /Rotina ativa: Conferir as notas de entrada/ }).click()
  await espera(300)
  await p.keyboard.press('Escape')
  await espera(300)
  ok(!(await p.getByRole('checkbox', { name: /Conferir as notas de entrada/ }).count()), 'rotina desligada sai do checklist')

  // 16. Membro (Lucas): "só as minhas" ligado; não reatribui; não fecha o mês
  await entrar('Lucas Prado')
  await ir('fila')
  ok(await p.getByRole('switch', { name: 'Só as minhas' }).isChecked(), 'Membro abre a fila com "só as minhas"')
  await p.getByRole('radio', { name: 'Por responsável' }).click()
  await espera(300)
  ok(await p.getByText(/Só o Gestor do BPO reatribui/).count(), 'Membro não reatribui (só o Gestor)')
  await ir('rotinas', 'c2')
  await secao('Fechamento')
  ok(await visivel(p.getByText('Fecha o Gestor do BPO.')), 'Membro não fecha o mês')
  ok(!(await p.getByRole('button', { name: /Configurar rotinas/ }).count()), 'Membro não configura rotinas (a tela esconde)')
  await entrar('Fernanda Lima')

  // 17. Celular de 390 px: sem rolagem lateral
  await p.setViewportSize({ width: 390, height: 844 })
  for (const [aba, cli] of [
    ['fila', 'todos'],
    ['fila', 'c2'],
    ['rotinas', 'todos'],
    ['rotinas', 'c8'],
  ]) {
    await ir(aba, cli)
    const largura = await p.evaluate(() => Math.max(...[...document.querySelectorAll('*')].filter((e) => getComputedStyle(e).overflowX !== 'hidden').map((e) => e.scrollWidth - e.clientWidth).filter((x) => x > 0), 0))
    const pagina = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    ok(pagina <= 1, `celular sem rolagem lateral: ${aba} (${cli})${largura > 1 ? ` · interno ${largura}px` : ''}`)
    await shot(`celular-${aba}-${cli}`)
  }
  await p.setViewportSize({ width: 1440, height: 900 })

  // 18. Temas: escuro, Condesp e Requinte (claro e escuro)
  await p.emulateMedia({ colorScheme: 'dark' })
  await p.reload()
  await pronto()
  await ir('rotinas', 'c2')
  await shot('escuro-rotinas')
  await ir('fila', 'c8')
  await shot('escuro-fila')
  for (const tema of ['condesp', 'requinte']) {
    await lab()
    await p.locator('select[aria-label="Tema"]').selectOption(tema)
    await fecharLab()
    for (const modo of ['light', 'dark']) {
      await p.emulateMedia({ colorScheme: modo })
      await p.reload()
      await pronto()
      await ir('fila', 'c2')
      await shot(`${tema}-${modo}-fila`)
      await ir('rotinas', 'c8')
      await shot(`${tema}-${modo}-rotinas`)
    }
  }
  ok(true, 'capturas dos temas Condesp e Requinte, claro e escuro')
  await p.emulateMedia({ colorScheme: 'light' })

  // Restaurar a demonstração
  await lab()
  const rest = p.getByRole('dialog').getByRole('button', { name: /Restaurar|Recomeçar/ }).first()
  if (await rest.count()) {
    await rest.click()
    await espera(400)
    const conf = p.getByRole('dialog').last().getByRole('button', { name: /Restaurar|Recomeçar/ }).last()
    if (await conf.count()) await conf.click()
    await espera(1500)
  }

  const reais = erros.filter((e) => !/falha simulada|não respondeu/.test(e))
  ok(reais.length === 0, `sem erros no console${reais.length ? `: ${reais.slice(0, 3).join(' | ')}` : ''}`)
  console.log(falhas ? `\n${falhas} falha(s)` : '\nTudo certo')
  await b.close()
  process.exit(falhas ? 1 : 0)
})()

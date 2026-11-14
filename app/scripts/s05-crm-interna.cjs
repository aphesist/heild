// Teste de ponta a ponta da S05 (CRM e comunicação interna): o botão Chat com as
// abas Equipe e Integrantes e o contador, a tela cheia, conversa, fio, menção ao
// integrante (resposta marcada como IA), edição com versões, nada se apaga,
// grupo, virar tarefa, busca, janela flutuante; no CRM, assinatura de quem atende,
// conferência do CNPJ, satisfação, agendar reunião, modo simulação, leads (lista,
// qualificação, proposta), comunicados (segmento por texto, boletim) e Números.
// Uso: app servido em http://localhost:6100/ (npx vite --port 6100) e
//      node scripts/s05-crm-interna.cjs <pasta-das-capturas>
const { chromium } = require('playwright')

;(async () => {
  const out = process.argv[2] || '.'
  const base = process.env.URL_APP || 'http://localhost:6100/'
  const b = await chromium.launch()
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } })
  const p = await ctx.newPage()
  const erros = []
  p.on('pageerror', (e) => erros.push(e.message))
  p.on('console', async (m) => m.type() === 'error' && erros.push(m.text() + ' @' + (await p.evaluate(() => location.hash).catch(() => '?'))))
  let falhas = 0
  const ok = (r, m) => {
    if (!r) falhas++
    console.log((r ? 'ok   ' : 'FALHA') + ' ' + m)
  }
  const shot = (n) => p.screenshot({ path: `${out}/s05-${n}.png` })
  const espera = (ms = 400) => p.waitForTimeout(ms)
  const hash = () => p.evaluate(() => location.hash)
  const visivel = async (loc) => (await loc.count()) > 0 && (await loc.first().isVisible())

  // Entrar como a Administradora
  await p.goto(base)
  await espera(1200)
  await p.getByRole('button', { name: /Fernanda Lima/ }).first().click()
  await p.getByRole('button', { name: 'Entrar', exact: true }).click()
  await espera(600)
  if (await p.getByLabel('Código').count()) {
    await p.getByLabel('Código').fill('123456')
    await p.keyboard.press('Enter')
  }
  await espera(1200)

  // 1. Botão Chat em outro módulo, com contador e as duas abas
  await p.getByRole('button', { name: 'Timesheet', exact: true }).first().click()
  await espera(600)
  const chat = p.getByRole('button', { name: /^Chat/ })
  ok(await visivel(chat), 'botão Chat aparece fora do Painel (Timesheet)')
  ok(/não lidas/.test((await chat.getAttribute('aria-label')) ?? ''), `botão Chat mostra não lidas (${await chat.getAttribute('aria-label')})`)
  await chat.click()
  await espera(500)
  ok(await visivel(p.getByRole('tab', { name: /Equipe/ })) && (await visivel(p.getByRole('tab', { name: /Integrantes/ }))), 'gaveta tem as abas Equipe e Integrantes')
  await p.getByRole('tab', { name: /Equipe/ }).click()
  await espera(500)
  ok(await visivel(p.getByRole('heading', { name: 'Mensagens não podem ser apagadas' })), 'aviso do primeiro uso: mensagens não se apagam')
  await shot('01-primeiro-uso')
  await p.getByRole('button', { name: 'Entendi' }).click()
  await espera(300)
  ok(await visivel(p.getByRole('region', { name: 'Pessoais e grupos' })) && (await visivel(p.getByRole('region', { name: 'Setores' }))) && (await visivel(p.getByRole('region', { name: 'Geral' }))), 'lista em três grupos: Pessoais e grupos, Setores, Geral')
  await shot('02-gaveta-equipe')

  // 2. Abrir o Geral na gaveta, enviar, editar (com versão) e conferir que não há excluir
  await p.getByRole('region', { name: 'Geral' }).getByRole('button').filter({ hasText: 'Geral' }).last().click()
  await espera(500)
  const campo = p.getByLabel('Mensagem para a equipe')
  await campo.fill('Mensagem de teste da S05 para o Geral')
  await p.keyboard.press('Enter')
  await espera(500)
  const minha = p.locator('li', { hasText: 'Mensagem de teste da S05 para o Geral' }).last()
  ok(await visivel(minha), 'mensagem enviada aparece na conversa')
  await minha.hover()
  await minha.getByRole('button', { name: 'Editar mensagem' }).click()
  await p.getByRole('textbox', { name: 'Editar mensagem' }).fill('Mensagem de teste da S05 para o Geral (corrigida)')
  await p.keyboard.press('Enter')
  await espera(400)
  ok(await visivel(p.getByText('Mensagem de teste da S05 para o Geral (corrigida)')), 'editar grava o texto novo')
  const editada = p.locator('li', { hasText: '(corrigida)' }).last()
  ok(await visivel(editada.getByRole('button', { name: 'editada' })), 'mensagem mostra "editada"')
  await editada.getByRole('button', { name: 'editada' }).click()
  await espera(300)
  ok(await visivel(p.getByRole('dialog').getByText(/Versão 1 ·/)), 'histórico mostra a versão anterior')
  await p.keyboard.press('Escape')
  await editada.hover()
  await editada.getByRole('button', { name: 'Mais ações da mensagem' }).click()
  await espera(200)
  const excluir = p.getByRole('menuitem', { name: /Excluir mensagem/ })
  ok(await excluir.isDisabled(), 'excluir existe só como item travado (nada se apaga)')
  await p.keyboard.press('Escape')
  await shot('03-gaveta-conversa')

  // 3. Tela cheia com rota própria
  await p.getByLabel('Abrir em tela cheia').first().click()
  await espera(700)
  ok((await hash()).startsWith('#/interna/conversas') && (await hash()).includes('conversaInterna=ci-geral'), `tela cheia com rota própria (${await hash()})`)
  ok((await p.getByRole('button', { name: 'Conversas internas', exact: true }).count()) === 0, 'não há item novo na barra lateral')

  // 4. Menção ao integrante no canal do Fiscal: responde no fio, marcado como IA
  await p.goto(base + '#/interna/conversas?conversaInterna=ci-fiscal')
  await espera(1200)
  const campo2 = p.getByLabel('Mensagem para a equipe')
  await campo2.click()
  await campo2.pressSequentially('@Fisc')
  await espera(300)
  ok(await visivel(p.getByRole('listbox', { name: 'Mencionar' })), 'digitar @ abre as sugestões de menção')
  await p.keyboard.press('Enter')
  await campo2.pressSequentially('quais tarefas estão atrasadas? Sobre #Padar')
  await espera(300)
  ok(await visivel(p.getByRole('listbox', { name: 'Citar' })), 'digitar # abre as sugestões de citação')
  await p.keyboard.press('Enter')
  await p.keyboard.press('Enter')
  await espera(900)
  ok(await visivel(p.getByText(/está escrevendo/)), 'o integrante aparece escrevendo')
  await espera(2400)
  const fio = p.getByRole('button', { name: /1 resposta/ }).last()
  ok(await visivel(fio), 'a resposta do integrante entra no fio')
  ok(await visivel(p.getByRole('list', { name: 'Mensagens' }).getByRole('button', { name: /Cliente.*Padaria Pão Quente/ })), 'citação vira cartão clicável do cliente')
  await fio.click()
  await espera(400)
  ok(await visivel(p.getByText('IA · integrante').last()), 'resposta no fio marcada como IA')
  await shot('04-fio-integrante')
  await p.getByLabel('Responder no fio').fill('Obrigado, vou olhar.')
  await p.keyboard.press('Enter')
  await espera(400)
  ok(await visivel(p.getByText('Obrigado, vou olhar.')), 'resposta no fio enviada')
  await p.getByLabel('Fechar o fio').click()

  // 5. Virar tarefa a partir da mensagem (link de volta)
  const alvo = p.locator('li', { hasText: 'Rita, da Metalúrgica, perguntou do ISS' }).first()
  await alvo.hover()
  await alvo.getByRole('button', { name: 'Mais ações da mensagem' }).click()
  await p.getByRole('menuitem', { name: /Transformar em tarefa/ }).click()
  await espera(300)
  await p.getByRole('dialog').getByRole('button', { name: 'Criar tarefa' }).click()
  await espera(600)
  ok(await visivel(p.getByRole('button', { name: /Virou tarefa/ }).first()), 'mensagem virou tarefa com o link de volta')

  // 6. Criar grupo, detalhes com participantes
  await p.getByRole('button', { name: 'Nova conversa' }).click()
  await p.getByRole('menuitem', { name: 'Novo grupo' }).click()
  await p.getByLabel('Nome do grupo').fill('Teste S05')
  await p.getByRole('dialog').getByRole('button', { name: /Ana Souza/ }).click()
  await p.getByRole('dialog').getByRole('button', { name: /Criar grupo/ }).click()
  await espera(600)
  ok(await visivel(p.getByRole('heading', { name: /Teste S05/ })), 'grupo criado e aberto')
  ok(await visivel(p.getByText(/criou o grupo com Ana Souza/)), 'entrada no grupo registrada na conversa')
  await p.getByLabel('Detalhes da conversa').click()
  await espera(300)
  ok(await visivel(p.getByRole('heading', { name: /Participantes · 2/ })), 'detalhes mostram os participantes')
  await shot('05-grupo-detalhes')

  // 7. Busca
  await p.getByLabel('Buscar nas conversas internas').fill('pró-labore')
  await espera(400)
  ok(await visivel(p.getByRole('region', { name: 'Resultados da busca' }).getByText(/pró-labore/)), 'busca encontra mensagem no grupo')
  await p.getByLabel('Buscar nas conversas internas').fill('')

  // 8. Aba Arquivos da comunicação interna
  await p.getByRole('tab', { name: 'Arquivos' }).click()
  await espera(500)
  ok(await visivel(p.getByText('controle-fechamento-11-2026.xlsx')), 'aba Arquivos lista o anexo do grupo')
  await p.getByRole('tab', { name: 'Conversas' }).click()
  await espera(400)

  // 9. Janela flutuante sobre outro módulo
  await p.goto(base + '#/interna/conversas?conversaInterna=ci-geral')
  await espera(1000)
  await p.getByLabel('Abrir em janela flutuante').click()
  await p.getByRole('button', { name: 'CRM', exact: true }).first().click()
  await espera(700)
  ok(await visivel(p.getByRole('dialog', { name: /Janela flutuante/ })), 'janela flutuante continua aberta no CRM')
  await shot('06-janela-flutuante')
  await p.getByLabel('Fechar janela flutuante').click()

  // 10. CRM › Conversas: nome de quem atende, CNPJ do anexo, satisfação
  await p.goto(base + '#/crm/conversas?conversa=cv2')
  await espera(1200)
  ok(await visivel(p.getByText(/sai assinada/)), 'campo avisa que a mensagem sai assinada com o nome de quem atende')
  await p.getByRole('button', { name: 'Anexar' }).click()
  await p.getByRole('menuitem', { name: /de outra empresa/ }).click()
  await espera(300)
  ok(await visivel(p.getByText(/Envio bloqueado/)), 'documento de outra empresa bloqueia o envio (CNPJ, D-34)')
  await shot('07-cnpj-bloqueado')
  await p.getByRole('button', { name: /Tirar anexo/ }).click()
  await p.getByPlaceholder(/Responder/).fill('Oi, Rita! A guia já está no app.')
  await p.getByRole('button', { name: 'Enviar', exact: true }).click()
  await espera(600)
  ok(await visivel(p.getByText(/Fernanda:/).last()), 'mensagem enviada leva o nome de quem atende (C2-07)')
  await p.getByRole('button', { name: 'Resolver' }).click()
  await espera(500)
  ok(await visivel(p.getByText(/Toque de 1 a 5/)), 'resolver envia a pesquisa de satisfação')

  // 11. Agendar reunião e modo simulação
  await p.goto(base + '#/crm/conversas?conversa=cv3')
  await espera(1200)
  await p.getByRole('button', { name: 'Mais ações' }).click()
  await p.getByRole('menuitem', { name: /Agendar reunião/ }).click()
  await p.getByRole('button', { name: 'Oferecer os horários' }).click()
  await espera(600)
  ok(await visivel(p.getByText(/horários livres para a reunião/)), 'o integrante oferece três horários ao cliente')
  await espera(4500)
  ok(await visivel(p.getByText(/reunião confirmada/)), 'o cliente confirma por botão e a reunião vira tarefa')
  await p.getByRole('button', { name: /modo simulação/ }).click()
  await p.getByLabel('Mensagem como cliente').fill('Quanto custa a contabilidade?')
  await p.keyboard.press('Enter')
  await espera(1600)
  ok(await visivel(p.getByText(/nunca cita preço/)), 'modo simulação: o integrante não cita preço e nada é gravado')
  await shot('08-simulacao')
  await p.keyboard.press('Escape')

  // 12. Leads: lista, qualificação pela conversa, proposta como documento
  await p.goto(base + '#/crm/leads')
  await espera(1000)
  await p.getByRole('button', { name: 'Lista', exact: true }).click()
  await espera(300)
  ok(await visivel(p.getByRole('table')), 'leads em lista com filtros')
  await p.getByRole('button', { name: 'Quadro', exact: true }).click()
  await p.getByRole('button', { name: /Cafeteria Grão Fino/ }).first().click()
  await espera(400)
  await p.getByRole('button', { name: /Qualificar pela conversa/ }).click()
  await espera(1900)
  ok(await visivel(p.getByText(/preencheu pela conversa/)), 'o integrante qualifica pela conversa e a pessoa confirma')
  await p.getByRole('button', { name: 'Confirmar', exact: true }).click()
  await p.getByRole('button', { name: /Gerar proposta/ }).click()
  await espera(300)
  ok(await visivel(p.getByText('Proposta Cafeteria Grão Fino.pdf')), 'proposta vira documento com situação')
  await p.keyboard.press('Escape')

  // 13. Comunicados: segmento por texto, boletim
  await p.goto(base + '#/crm/comunicados')
  await espera(1000)
  await p.getByRole('button', { name: 'Novo comunicado' }).click()
  await p.getByRole('button', { name: /descrever em texto/ }).click()
  await p.getByLabel('Segmento em texto').fill('todos do Simples de SP com funcionários')
  await p.getByRole('button', { name: /Interpretar/ }).click()
  await espera(1200)
  ok(await visivel(p.getByRole('cell', { name: 'Simples Nacional' })), 'segmento em texto vira predicado em tabela')
  await p.getByRole('button', { name: /Pedir o rascunho/ }).click()
  await espera(2500)
  ok(await visivel(p.getByRole('button', { name: /Aprovar e agendar/ })), 'boletim mensal rascunhado pelo integrante')
  await shot('09-comunicados')

  // 14. Números: seções novas
  await p.goto(base + '#/crm/numeros')
  await espera(1000)
  for (const s of ['Nome de quem atende', 'Respostas do integrante', 'Caixas de e-mail', 'Provedor e saúde', 'Privacidade', 'Bloqueados']) {
    await p.getByRole('tab', { name: s }).click()
    await espera(200)
  }
  ok(await visivel(p.getByText('+55 11 90000-1122')), 'Números › Bloqueados lista o número com motivo')
  await shot('10-numeros')

  // 15. Persistência: recarregar mantém a mensagem e o grupo
  await p.reload()
  await espera(1500)
  await p.goto(base + '#/interna/conversas')
  await espera(1200)
  ok(await visivel(p.getByText('Teste S05').first()), 'depois de recarregar: o grupo continua')

  // 16. Celular (390 px): a gaveta do Chat
  const m = p
  await m.setViewportSize({ width: 390, height: 844 })
  await m.goto(base + '#/painel/fiscal')
  await m.waitForTimeout(1500)
  await m.getByRole('button', { name: /^Chat/ }).click()
  await m.waitForTimeout(400)
  await m.getByRole('tab', { name: /Equipe/ }).click()
  await m.waitForTimeout(400)
  await m.screenshot({ path: `${out}/s05-11-celular-equipe.png` })
  const larg = await m.evaluate(() => document.documentElement.scrollWidth)
  ok(larg <= 390, `celular sem rolagem horizontal (${larg}px)`)

  ok(erros.length === 0, `sem erros no console${erros.length ? ': ' + erros.slice(0, 3).join(' | ') : ''}`)
  console.log(falhas ? `\n${falhas} falha(s)` : '\ntudo certo')
  await b.close()
  process.exit(falhas ? 1 : 0)
})()

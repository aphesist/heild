// Teste de fumaça da fundação (S00): navega pelos módulos, abre links diretos, cria, edita,
// move e exclui pelo kit e por uma tela real, recarrega e confere que persistiu; confere
// permissões ("agindo como" um Membro), regras (mensagem interna não se apaga), o segundo
// escritório de exemplo e o "Restaurar demonstração".
// Uso: app servido em http://localhost:6100/ (npx vite --port 6100) e
//      node scripts/fundacao-fumaca.cjs <pasta-das-capturas>
const { chromium } = require('playwright')

;(async () => {
  const out = process.argv[2] || '.'
  const base = process.env.URL_APP || 'http://localhost:6100/'
  const b = await chromium.launch()
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
  const erros = []
  p.on('pageerror', (e) => erros.push(e.message))
  p.on('console', (m) => m.type() === 'error' && erros.push(m.text()))
  let falhas = 0
  const ok = (r, m) => {
    if (!r) falhas++
    console.log((r ? 'ok   ' : 'FALHA') + ' ' + m)
  }
  const shot = (n) => p.screenshot({ path: `${out}/fumaca-${n}.png` })
  const espera = (ms = 400) => p.waitForTimeout(ms)
  const hash = () => p.evaluate(() => location.hash)
  // Espera o banco abrir (no modo Supabase a leitura passa pela rede).
  const pronto = async () => {
    await p.waitForFunction(() => document.body && !document.body.innerText.includes('Abrindo o escritório'), null, { timeout: 45000 })
    await espera(700)
  }
  const lateral = (n) => p.getByRole('button', { name: n, exact: true }).first().click().then(() => espera(500))
  const aba = (n) => p.getByRole('tab', { name: new RegExp(`^${n}`) }).first().click().then(() => espera(400))

  // 1. Entrar
  await p.goto(base)
  await pronto()
  ok(await p.getByRole('heading', { name: 'Entrar' }).count(), 'tela de entrada abre com o banco carregado')
  await p.getByRole('button', { name: /Fernanda Lima/ }).first().click()
  await p.getByRole('button', { name: 'Entrar', exact: true }).click()
  await espera(500)
  if (await p.getByLabel('Código').count()) {
    await p.getByLabel('Código').fill('123456')
    await p.keyboard.press('Enter')
  }
  await espera(1200)
  ok((await hash()).startsWith('#/inicio'), `o endereço acompanha a tela (${await hash()})`)

  // 2. Navegar pelos módulos e abas
  for (const [m, a] of [['Painel', 'Fiscal'], ['CRM', 'Leads'], ['Arquivos'], ['Timesheet', 'Equipe'], ['Financeiro', 'Cobranças'], ['BPO', 'Fila'], ['Configurações', 'Usuários']]) {
    await lateral(m)
    if (a) await aba(a)
    await shot(`modulo-${m}`)
  }
  ok((await hash()) === '#/config/usuarios', `rota de Configurações › Usuários (${await hash()})`)
  await p.goBack()
  await espera(500)
  ok((await hash()).startsWith('#/config/'), 'o Voltar do navegador volta para a aba anterior')

  // 3. Links diretos
  await p.goto(base + '#/crm/conversas?conversa=cv1')
  await espera(1200)
  ok(await p.getByText('Rita Campos').first().isVisible(), 'link direto abre a conversa cv1 do CRM')
  await p.goto(base + '#/painel/societario?tarefa=t18')
  await espera(1200)
  ok(await p.getByRole('dialog').getByText(/JUCESP/).first().isVisible(), 'link direto abre a ficha da tarefa t18')
  await p.keyboard.press('Escape')
  await espera(400)
  ok(!(await hash()).includes('tarefa='), 'fechar a ficha tira a tarefa do endereço')

  // 4. Kit sobre o banco: criar, editar, mover, excluir
  await p.goto(base + '#/kit')
  await espera(1000)
  await p.getByLabel('Agindo como').selectOption('u1')
  await espera(500)
  const quadro = p.getByRole('region', { name: 'Quadro de tarefas' })
  await quadro.getByLabel('Setor').selectOption('fiscal')
  await quadro.getByRole('button', { name: 'Nova tarefa' }).click()
  const dlg = p.getByRole('dialog')
  await dlg.getByRole('button', { name: 'Criar tarefa' }).click()
  ok(await dlg.getByText(/Escreva um título/).count(), 'formulário valida antes de salvar')
  await dlg.getByLabel('Título').fill('Tarefa da fumaça')
  await dlg.getByLabel('Atividade do catálogo').fill('FIS-009')
  await dlg.getByRole('button', { name: 'Criar tarefa' }).click()
  await espera(500)
  ok(await quadro.getByText('Tarefa da fumaça').count(), 'tarefa criada aparece no quadro')
  await quadro.getByRole('button', { name: /Título da tarefa: Tarefa da fumaça/ }).click()
  await p.getByRole('textbox', { name: 'Título da tarefa' }).fill('Tarefa da fumaça editada')
  await p.keyboard.press('Enter')
  await espera(400)
  ok(await quadro.getByText('Tarefa da fumaça editada').count(), 'edição em linha grava o título')
  await quadro.getByRole('button', { name: 'Ações de Tarefa da fumaça editada' }).click()
  await p.getByRole('menuitem', { name: /Concluir/ }).click()
  await espera(500)
  ok(await quadro.getByRole('region', { name: 'Concluída' }).getByText('Tarefa da fumaça editada').count(), 'menu de ações move a tarefa para Concluída')
  await shot('kit-quadro')

  const convites = p.getByRole('region', { name: 'Convites pendentes' })
  for (const email of ['fumaca@exemplo.com.br', 'fica@exemplo.com.br']) {
    await convites.getByRole('button', { name: 'Convidar' }).click()
    await p.getByRole('dialog').getByLabel('E-mail').fill(email)
    await p.getByRole('dialog').getByRole('button', { name: 'Enviar convite' }).click()
    await espera(400)
  }
  ok(await convites.getByText('fumaca@exemplo.com.br').count(), 'convite criado')
  await convites.getByRole('button', { name: 'Excluir convite de fumaca@exemplo.com.br' }).click()
  await p.getByRole('dialog').getByRole('button', { name: 'Excluir convite' }).click()
  await espera(400)
  ok(!(await convites.getByText('fumaca@exemplo.com.br').count()), 'convite excluído depois da confirmação')

  const interna = p.getByRole('region', { name: 'Conversa interna · Geral' })
  await interna.getByLabel('Mensagem para o canal Geral').fill('Mensagem da fumaça')
  await interna.getByRole('button', { name: 'Enviar' }).click()
  await espera(400)
  ok(await interna.getByText('Mensagem da fumaça').count(), 'mensagem interna enviada')
  await interna.getByRole('button', { name: 'Mais ações' }).last().click()
  ok(await p.getByRole('menuitem', { name: /Excluir/ }).isDisabled(), 'mensagem interna não tem exclusão (subplano 11)')
  await p.keyboard.press('Escape')

  // 5. Tela real: Configurações › Escritório
  await p.goto(base + '#/config/escritorio')
  await espera(1000)
  // Fase 6: a razão social se corrige no próprio valor (sublinhado), sem gaveta.
  await p.getByRole('button', { name: /^Razão social:/ }).click()
  await p.getByRole('textbox', { name: 'Razão social' }).fill('Contábil Andrade & Lima Ltda (fumaça)')
  await p.getByRole('button', { name: 'Aplicar', exact: true }).click()
  await espera(500)
  ok(await p.getByText('Contábil Andrade & Lima Ltda (fumaça)').count(), 'Configurações › Escritório grava a razão social')

  // 6. Recarregar e conferir
  await p.reload()
  await pronto()
  ok(await p.getByText('Contábil Andrade & Lima Ltda (fumaça)').count(), 'depois de recarregar: razão social continua')
  await p.goto(base + '#/kit')
  await espera(1200)
  await p.getByRole('region', { name: 'Quadro de tarefas' }).getByLabel('Setor').selectOption('fiscal')
  await espera(300)
  ok(await p.getByRole('region', { name: 'Concluída' }).getByText('Tarefa da fumaça editada').count(), 'depois de recarregar: tarefa editada e concluída')
  const convitesDepois = p.getByRole('region', { name: 'Convites pendentes' })
  ok((await convitesDepois.getByText('fica@exemplo.com.br').count()) && !(await convitesDepois.getByText('fumaca@exemplo.com.br').count()), 'depois de recarregar: convite criado fica, excluído não volta')
  // Eventos: a lista mostra só os 12 mais recentes, e o trabalho simulado dos integrantes acrescenta
  // eventos num ritmo que depende da máquina; o evento antigo se acha pela busca, sobre todos os eventos.
  const eventos = p.getByRole('region', { name: 'Eventos' })
  const achaEvento = async (termo, padrao) => {
    await eventos.getByLabel('Buscar nos eventos').fill(termo)
    return (await eventos.getByText(padrao).count()) > 0
  }
  ok(await achaEvento('fumaca@exemplo.com.br', /excluiu o convite para fumaca@exemplo.com.br/), 'a exclusão fica registrada no evento')
  ok(await p.getByText('Mensagem da fumaça').count(), 'depois de recarregar: mensagem interna continua')
  ok(await achaEvento('criou a tarefa', /Fernanda Lima criou a tarefa Tarefa da fumaça/), 'evento registrado com autor (linha do tempo)')
  await eventos.getByLabel('Buscar nos eventos').fill('')
  await shot('recarregado')

  // 7. Permissão: agindo como Ana Souza (Membro do DP)
  await p.getByLabel('Agindo como').selectOption('u3')
  await espera(500)
  ok(await p.getByRole('region', { name: 'Obrigações do escritório' }).getByLabel(/Indisponível: Só Gestor ou Administrador/).count(), 'Membro vê "cancelar obrigação" travado, com o motivo')
  await shot('membro')

  // 8. Segundo escritório e restaurar
  await p.getByRole('button', { name: /Demonstração/ }).click()
  await p.getByLabel('Escritório de exemplo').selectOption('esc-horizonte')
  await espera(800)
  await pronto()
  await p.goto(base)
  await pronto()
  ok(await p.getByText('Horizonte Contabilidade Ltda').count(), 'troca para o escritório Horizonte (dados separados)')
  await p.getByRole('button', { name: /Demonstração/ }).click()
  await p.getByLabel('Escritório de exemplo').selectOption('esc-andrade')
  await espera(800)
  await pronto()
  await p.getByRole('button', { name: /Demonstração/ }).click()
  await p.getByRole('button', { name: /Resetar o ambiente/ }).click()
  await p.getByRole('button', { name: 'Resetar agora' }).click()
  await espera(800)
  await pronto()
  ok(await p.getByText('Contábil Andrade & Lima Ltda', { exact: true }).count(), 'restaurar volta aos dados de exemplo')

  ok(erros.length === 0, `sem erros no console${erros.length ? ': ' + erros.slice(0, 3).join(' | ') : ''}`)
  await b.close()
  console.log(falhas ? `\n${falhas} falha(s)` : '\ntudo certo')
  process.exit(falhas ? 1 : 0)
})()

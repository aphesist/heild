import { banco } from '../banco'
import type { BpoDocumento, Fotografia, NomeTabela, Tabelas } from '../modelo/entidades'
import { montador } from './comum'

/**
 * S08b · Semente da operação do BPO (Fila e Rotinas): os documentos que
 * chegaram hoje (boleto pelo WhatsApp, DDA, nota por e-mail, comprovante pelo
 * app), as baixas do Mercado que o Nibo (modo arquivo) não recebe sozinho, um
 * pedido da equipe, um item com a bola no banco (terceiro) e um resolvido de
 * hoje. Só acrescenta ao que a S08 semeou.
 */

type Add = <K extends NomeTabela>(tabela: K, linha: Omit<Tabelas[K], 'escritorio_id' | 'criado_em' | 'atualizado_em'> & { criado_em?: string }) => Tabelas[K]
const iso = (data: string, hora = '09:00') => `${data}T${hora}:00-03:00`

/** O que está "dentro" do documento: o integrante lê isto quando a pessoa pede (simulação da leitura por IA). */
export interface ConteudoDocumento {
  fornecedor: string
  documento?: string
  valor: number
  vencimento: string
  categoria: string
  banco?: string
  codigo_barras?: string
  confianca: 'alta' | 'baixa'
}

type Doc = Omit<BpoDocumento, 'escritorio_id' | 'criado_em' | 'atualizado_em'>

export const documentosSemente: Doc[] = [
  {
    id: 'bd-assistec',
    cliente_id: 'c2',
    nome_arquivo: 'boleto-assistec-forno.pdf',
    tipo_documento: 'boleto',
    canal: 'whatsapp',
    remetente: 'João Batista',
    recebido_em: iso('2026-11-18', '08:42'),
    situacao: 'recebido',
    checagens: [],
    extras: { conteudo: { fornecedor: 'Assistec Refrigeração', documento: '18.442.907/0001-31', valor: 1_850, vencimento: '2026-11-21', categoria: 'Manutenção', banco: 'Sicredi', codigo_barras: '74891.12110 01850.000006 21000.000000 1 98450000185000', confianca: 'alta' } satisfies ConteudoDocumento, mensagem: 'Segue o boleto do conserto do forno 🙏' },
  },
  {
    id: 'bd-moinho',
    cliente_id: 'c2',
    nome_arquivo: 'dda-moinho-sul-dez.pdf',
    tipo_documento: 'boleto',
    canal: 'dda',
    remetente: 'DDA do Sicoob',
    recebido_em: iso('2026-11-18', '07:10'),
    situacao: 'recebido',
    checagens: [],
    extras: { conteudo: { fornecedor: 'Moinho Sul Ltda', valor: 4_200, vencimento: '2026-12-04', categoria: 'Matéria-prima', codigo_barras: '75691.31407 01042.000001 00420.000000 3 98580000420000', confianca: 'alta' } satisfies ConteudoDocumento },
  },
  {
    id: 'bd-hortifruti',
    cliente_id: 'c8',
    nome_arquivo: 'NF-8812-hortifruti-vale.xml',
    tipo_documento: 'nota',
    canal: 'email',
    remetente: 'nfe@hortifrutivale.exemplo',
    recebido_em: iso('2026-11-18', '06:55'),
    situacao: 'lido',
    lido_por: 'Contas a Pagar (integrante)',
    leitura: { fornecedor: 'Hortifruti Vale', documento: '09.118.334/0001-60', valor: 3_960, vencimento: '2026-11-22', categoria: 'Mercadoria para revenda', banco: 'Caixa · ag. 1890 · c/c 4.410-2', codigo_barras: null, confianca: 'alta' },
    checagens: [
      { tipo: 'duplicidade', texto: 'Parece duplicada: já existe Hortifruti Vale de R$ 3.960 com vencimento 22/11' },
      { tipo: 'dados_bancarios', texto: 'Dados bancários diferentes do cadastro (conta do cadastro no cadastro, Caixa · ag. 1890 · c/c 4.410-2 no documento): confirmar com o cliente por segundo canal' },
    ],
    extras: { conteudo: { fornecedor: 'Hortifruti Vale', valor: 3_960, vencimento: '2026-11-22', categoria: 'Mercadoria para revenda', banco: 'Caixa · ag. 1890 · c/c 4.410-2', confianca: 'alta' } satisfies ConteudoDocumento },
  },
  {
    id: 'bd-enel',
    cliente_id: 'c3',
    nome_arquivo: 'conta-enel-loja-nov.pdf',
    tipo_documento: 'boleto',
    canal: 'email',
    remetente: 'Sérgio Prates',
    recebido_em: iso('2026-11-17', '18:20'),
    situacao: 'recebido',
    checagens: [],
    extras: { conteudo: { fornecedor: 'Enel', valor: 1_240, vencimento: '2026-11-28', categoria: 'Energia', codigo_barras: '83610000012 4 40000481100 1 28112026001 9', confianca: 'alta' } satisfies ConteudoDocumento },
  },
  {
    id: 'bd-freios',
    cliente_id: 'c10',
    nome_arquivo: 'foto-nota-freios-br.jpg',
    tipo_documento: 'nota',
    canal: 'whatsapp',
    remetente: 'Wagner Lima',
    recebido_em: iso('2026-11-18', '09:05'),
    situacao: 'recebido',
    checagens: [],
    extras: { conteudo: { fornecedor: 'Distribuidora Freios BR', valor: 5_480, vencimento: '2026-11-26', categoria: 'Mercadoria para revenda', confianca: 'baixa' } satisfies ConteudoDocumento, mensagem: 'foto meio torta, desculpa' },
  },
  {
    id: 'bd-autodesk',
    cliente_id: 'c9',
    nome_arquivo: 'comprovante-autodesk.pdf',
    tipo_documento: 'comprovante',
    canal: 'app',
    remetente: 'Beatriz Forma',
    recebido_em: iso('2026-11-18', '08:10'),
    situacao: 'recebido',
    checagens: [],
    extras: { conteudo: { fornecedor: 'Autodesk (licenças)', valor: 1_640, vencimento: '2026-11-25', categoria: 'Software', confianca: 'alta' } satisfies ConteudoDocumento },
  },
]

/** Baixas que o Nibo (modo arquivo) não recebe sozinho: conciliadas pela Conciliação, para lançar à mão. */
const baixasNibo: [string, string, string, number, string][] = [
  ['bt-nibo-1', '2026-10-28', 'BOLETO ATACADAO DISTRIB', -17_900, 'Mercadoria para revenda'],
  ['bt-nibo-2', '2026-10-30', 'TARIFA PACOTE PJ', -189, 'Tarifas bancárias'],
  ['bt-nibo-3', '2026-10-31', 'REDE CREDITO LOTE 4398', 19_420, 'Vendas no cartão'],
  ['bt-nibo-4', '2026-11-13', 'BOLETO FRIGORIFICO BOA CARNE', -12_100, 'Mercadoria para revenda'],
  ['bt-nibo-5', '2026-11-14', 'PIX ENV ENEL DISTRIB', -2_480, 'Energia'],
  ['bt-nibo-6', '2026-11-17', 'REDE CREDITO LOTE 4407', 22_310, 'Vendas no cartão'],
]

export function sementeS08b(_foto: Fotografia, add: Add) {
  for (const d of documentosSemente) add('bpo_documento', d)
  for (const [id, data, descricao, valor, categoria] of baixasNibo)
    add('bpo_transacao', { id, cliente_id: 'c8', conta: valor > 0 || descricao.includes('TARIFA') ? 'Bradesco' : 'Inter', data, descricao, valor, sugestao: categoria, confianca: 'alta', situacao: 'conciliada', categoria, conciliada_por: 'Conciliação (integrante)', extras: { baixa: 'manual_pendente', conciliada_em: iso(data, '17:30') } })
  add('bpo_item_fila', {
    id: 'fq9',
    cliente_id: 'c4',
    tipo: 'pendencia',
    texto: 'Conferir a diferença do saldo do Itaú com o Omie',
    codigo: 'FIN-004',
    canal: 'interno',
    prazo: '2026-11-18',
    bola: 'bpo',
    responsavel_nome: 'Lucas Prado',
    situacao: 'aberto',
    faltando: [],
    sla_inicio: iso('2026-11-18', '08:30'),
    sla_meta_h: 8,
    detalhe: 'pedido da Marina (equipe)',
    visibilidade: 'interna_bpo',
    extras: { pedido_por: 'Marina Teixeira', notas: [{ por: 'Marina Teixeira', em: iso('2026-11-18', '08:30'), texto: 'O Omie mostra R$ 64.120 e o banco R$ 64.900. Deve ser o TED da Odontoprev que ainda não baixou.', tipo: 'nota' }] },
  })
  add('bpo_item_fila', {
    id: 'fq10',
    cliente_id: 'c8',
    tipo: 'pendencia',
    texto: 'Estorno da tarifa cobrada em dobro (Bradesco)',
    codigo: 'FIN-004',
    canal: 'interno',
    prazo: '2026-11-20',
    bola: 'terceiro',
    responsavel_nome: 'Lucas Prado',
    situacao: 'aberto',
    faltando: [],
    sla_inicio: iso('2026-11-12', '10:00'),
    sla_meta_h: 72,
    detalhe: 'protocolo 4471 aberto no banco',
    visibilidade: 'compartilhada',
    extras: { bola_desde: iso('2026-11-13', '10:00'), notas: [{ por: 'Lucas Prado', em: iso('2026-11-13', '10:00'), texto: 'Liguei no gerente do Bradesco; protocolo 4471, prazo de 5 dias úteis.', tipo: 'cobranca' }] },
  })
  add('bpo_item_fila', {
    id: 'fq11',
    cliente_id: 'c2',
    tipo: 'pedido',
    texto: '“Mandem o extrato de outubro para o contador”',
    codigo: 'BPO-009',
    canal: 'app',
    prazo: '2026-11-18',
    bola: 'bpo',
    responsavel_nome: 'Lucas Prado',
    situacao: 'resolvido',
    faltando: [],
    sla_inicio: iso('2026-11-18', '07:50'),
    sla_meta_h: 24,
    visibilidade: 'compartilhada',
    extras: { notas: [{ por: 'Lucas Prado', em: iso('2026-11-18', '08:15'), texto: 'Extrato do Sicoob de outubro enviado ao setor Contábil pela pasta da Padaria.', tipo: 'resolucao' }] },
  })
}

const idsFila = ['fq9', 'fq10', 'fq11']

/**
 * Banco guardado antes da S08b: semeia só o que falta (documentos, baixas do
 * Nibo e os itens novos da fila), uma vez, sem mexer no que a pessoa já fez.
 */
export function garantirSementeOperacaoBpo() {
  const id = banco.escritorioId
  if (id !== 'esc-andrade' || !banco.ler('bpo_configuracao').length) return
  if (banco.ler('bpo_documento').length || banco.obter('bpo_item_fila', 'fq9')) return
  const { foto, add } = montador(id, '2026-11-18T09:00:00.000Z')
  sementeS08b(foto, add as Add)
  banco.transacao((tx) => {
    for (const r of foto.bpo_documento) if (!tx.obter('bpo_documento', r.id)) tx.gravar('bpo_documento', r)
    for (const r of foto.bpo_transacao) if (!tx.obter('bpo_transacao', r.id)) tx.gravar('bpo_transacao', r)
    for (const r of foto.bpo_item_fila) if (idsFila.includes(r.id) && !tx.obter('bpo_item_fila', r.id)) tx.gravar('bpo_item_fila', r)
  })
}

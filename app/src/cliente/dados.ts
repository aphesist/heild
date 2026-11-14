import { painelSocioDe } from '@/dados/servicos-extras'
import type { Tema } from '@/theme/tipos'
import type { SetorIntegrante } from '@/theme/tipos'

/**
 * Dados fixos do app do cliente (S10): o que o plano descreve e ainda não tem
 * entidade própria no wireframe (grupos econômicos, convites de contato,
 * tipos de item de pendência, implantação, biblioteca de passo a passo,
 * tabela de avulsos, matriz de procurações, textos do tema). O que o cliente
 * faz em cima disso fica em `estado.ts` (usePersistente, prefixo `s10:`).
 */

/** O "hoje" da demonstração (o mesmo do resto do wireframe). */
export const HOJE = '18/11/2026'
export const HOJE_CURTO = '18/11'
export const agoraHora = () => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
export const agoraTexto = () => `${HOJE_CURTO} ${agoraHora()}`
export const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
export const hashDe = (texto: string) => {
  let h = 2166136261
  for (const c of texto) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0
  return (h.toString(16).padStart(8, '0') + Math.imul(h, 2654435761).toString(16).replace('-', '').padStart(8, '0')).slice(0, 16)
}
export const protocolo = () => `${2026}${String(Math.floor(Math.random() * 1e8)).padStart(8, '0')}`

/* ---------- Domínio e textos do tema (marca do escritório no app) ---------- */

/** Domínio do app do escritório (marca branca: o escritório usa o dele; sem domínio próprio, um subdomínio da plataforma). */
export function dominioDoApp(nomeEscritorio: string) {
  const palavras = nomeEscritorio
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(/[^a-z]+/)
    .filter((p) => p && !['e', 'de', 'da', 'do', 'ltda', 'me', 's', 'a'].includes(p))
    .map((p) => (p.startsWith('contab') ? 'contabil' : p))
  return `app.${palavras.slice(0, 2).join('') || 'escritorio'}.com.br`
}

/** Textos que o tema do escritório define para o app (06, 11.1). O wireframe usa um modelo com o nome do produto. */
export function textosDoApp(tema: Tema, nomeEscritorio: string) {
  const produto = tema.nome_produto || nomeEscritorio
  return {
    produto,
    tudoEmDia: `Tudo em dia por aqui. Nada pendente com você este mês: quando ${nomeEscritorio} precisar de algo, aparece aqui e no seu WhatsApp.`,
    termoVersao: 'v3 · 01/09/2026',
    termo: [
      `Este app é de ${nomeEscritorio}, que presta os serviços contábeis da sua empresa. Ele serve para você receber documentos, mandar o que o escritório pedir, abrir pedidos e conversar com a equipe.`,
      'Você entra com um código enviado ao WhatsApp ou ao e-mail que o escritório tem de você. Cada abertura e cada download de documento fica registrado, para você e para o escritório (prova de entrega).',
      'O que você envia vira documento da sua empresa no arquivo do escritório. Os dados seguem a LGPD: base legal de execução de contrato; você pode pedir acesso, correção e portabilidade a qualquer momento.',
      'Respostas do assistente do escritório são marcadas como assistente; opinião e planejamento são sempre de uma pessoa da equipe.',
    ],
    foraDoHorario: 'Fora do horário: respondemos amanhã a partir das 9h. O assistente responde o que puder agora.',
    assinaAssistente: (setor: string) => `assistente ${setor === 'Atendimento' ? 'do escritório' : `do ${setor}`}`,
  }
}

/* ---------- Grupos econômicos (Fundações 4.5: só rótulo) ---------- */

export const gruposEconomicos: { id: string; nome: string; clientes: string[] }[] = [{ id: 'g-batista', nome: 'Grupo Batista (Padaria e Café)', clientes: ['c2', 'c7'] }]
export const grupoDe = (clienteId: string) => gruposEconomicos.find((g) => g.clientes.includes(clienteId))

/* ---------- Convites de contato (06, 2.1) ---------- */

export type PapelContato = 'sócio' | 'sócia' | 'financeiro' | 'RH' | 'fiscal da empresa' | 'diretor financeiro' | 'titular'

export interface ConviteApp {
  id: string
  clienteId: string
  nome: string
  papel: PapelContato
  canal: 'whatsapp' | 'email'
  destino: string
  assuntos: string[]
  enviadoEm: string
  /** Dias de validade a partir do envio (padrão 7). */
  expiraEm: string
  situacao: 'pendente' | 'aceito' | 'expirado' | 'cancelado'
  reenvios: number
  /** Quem pediu (o escritório pela ficha; o sócio pelo app). */
  pedidoPor: string
}

/** Convites que o escritório já mandou (pela ficha do cliente) e que ainda não foram aceitos. */
export const convitesIniciais: ConviteApp[] = [
  {
    id: 'cvt-carla',
    clienteId: 'c2',
    nome: 'Carla Nunes',
    papel: 'RH',
    canal: 'whatsapp',
    destino: '+55 11 97440-2030',
    assuntos: ['folha'],
    enviadoEm: '16/11/2026',
    expiraEm: '23/11/2026',
    situacao: 'pendente',
    reenvios: 0,
    pedidoPor: 'Bruno Costa (escritório)',
  },
  {
    id: 'cvt-paulo',
    clienteId: 'c1',
    nome: 'Paulo Teixeira',
    papel: 'fiscal da empresa',
    canal: 'email',
    destino: 'paulo@metalurgicaandrade.com.br',
    assuntos: ['guias', 'documentos_pendentes'],
    enviadoEm: '17/11/2026',
    expiraEm: '24/11/2026',
    situacao: 'pendente',
    reenvios: 0,
    pedidoPor: 'Marcos Andrade (sócio, pelo app)',
  },
  {
    id: 'cvt-vencido',
    clienteId: 'c5',
    nome: 'Lúcia Rocha',
    papel: 'financeiro',
    canal: 'email',
    destino: 'lucia.rocha@rotasul.com.br',
    assuntos: ['guias', 'honorarios'],
    enviadoEm: '02/11/2026',
    expiraEm: '09/11/2026',
    situacao: 'expirado',
    reenvios: 0,
    pedidoPor: 'Bruno Costa (escritório)',
  },
]

/* ---------- Itens de pendência (06, 4.1, regra 2) ---------- */

export type TipoItem = 'documento' | 'informacao' | 'assinatura' | 'acao_externa'

export interface CampoForm {
  id: string
  rotulo: string
  tipo: 'texto' | 'numero' | 'data' | 'escolha' | 'moeda'
  opcoes?: string[]
  obrigatorio?: boolean
  ajuda?: string
}

export interface DefItem {
  tipo: TipoItem
  /** Competência esperada do documento (a validação do integrante confere). */
  competencia?: string
  /** Arquivos que a "galeria" da demonstração oferece (um deles errado, para mostrar a devolução). */
  amostras?: { nome: string; competencia?: string; legivel?: boolean }[]
  /** Formulário tipado (informação). */
  campos?: CampoForm[]
  /** Passo a passo da ação externa (com vídeo do tema). */
  passos?: string[]
  video?: string
  /** Texto da ciência (assinatura). */
  ciencia?: string
  /** Consequência de atrasar (régua "Prazo do cliente"). */
  consequencia?: string
}

const amostra = (nome: string, competencia?: string, legivel = true) => ({ nome, competencia, legivel })

/** Como cada atividade do catálogo vira item para o cliente. Sem entrada: documento genérico. */
export const itensPorCodigo: Record<string, DefItem> = {
  'DP-001': {
    tipo: 'documento',
    amostras: [amostra('RG e CPF - Lucas Martins.jpg'), amostra('CTPS digital - Lucas Martins.pdf'), amostra('ASO admissional - Lucas Martins.pdf'), amostra('foto-borrada.jpg', undefined, false)],
    consequencia: 'Sem os documentos até 2 dias antes do início, o eSocial da admissão atrasa e gera multa.',
  },
  'FIS-009': {
    tipo: 'documento',
    competencia: '10/2026',
    amostras: [amostra('notas-outubro-2026.zip', '10/2026'), amostra('notas-setembro-2026.zip', '09/2026')],
    consequencia: 'Sem as notas até dia 18, o PGDAS-D sai só com o que foi capturado.',
  },
  'CTB-002': {
    tipo: 'documento',
    competencia: '10/2026',
    amostras: [amostra('extrato-itau-setembro.pdf', '09/2026'), amostra('extrato-itau-outubro.pdf', '10/2026')],
    consequencia: 'O fechamento de outubro espera o extrato.',
  },
  'NFE-021': { tipo: 'documento', amostras: [amostra('xml-compras-outubro.zip', '10/2026')] },
  'FIS-038': { tipo: 'documento', amostras: [amostra('cte-0912-documentos.pdf')] },
  'SOC-009': { tipo: 'documento', amostras: [amostra('certificado-a1-2027.pfx')] },
  'SOC-021': { tipo: 'documento', amostras: [amostra('contrato-social-consolidado.pdf'), amostra('rg-cpf-socios.pdf'), amostra('comprovante-endereco.pdf')] },
  'DP-009': {
    tipo: 'informacao',
    campos: [
      { id: 'horas_extras', rotulo: 'Horas extras no mês (total)', tipo: 'numero', obrigatorio: true, ajuda: 'Some as horas de todos; o DP divide pelo ponto.' },
      { id: 'faltas', rotulo: 'Faltas sem atestado (quem e quantos dias)', tipo: 'texto' },
      { id: 'comissoes', rotulo: 'Comissões a pagar', tipo: 'moeda' },
      { id: 'adiantamento', rotulo: 'Houve adiantamento fora da folha?', tipo: 'escolha', opcoes: ['Não', 'Sim'], obrigatorio: true },
    ],
    consequencia: 'As variáveis entram até dia 25; depois disso, vão para a folha de dezembro.',
  },
  'DP-024': {
    tipo: 'informacao',
    campos: [
      { id: 'empregado', rotulo: 'Empregado', tipo: 'texto', obrigatorio: true },
      { id: 'inicio', rotulo: 'Início das férias', tipo: 'data', obrigatorio: true },
      { id: 'dias', rotulo: 'Dias', tipo: 'escolha', opcoes: ['30', '20', '15', '10'], obrigatorio: true },
      { id: 'abono', rotulo: 'Vender 1/3 (abono)?', tipo: 'escolha', opcoes: ['Não', 'Sim'] },
    ],
  },
  'SOC-011': {
    tipo: 'acao_externa',
    passos: [
      'Entre no e-CAC (cav.receita.fazenda.gov.br) com a conta gov.br prata ou ouro do sócio, ou com o certificado da empresa.',
      'Abra "Senhas e Procurações" › "Autorização de acesso" e escolha "Cadastrar".',
      'Informe o CNPJ do escritório: 11.222.333/0001-44.',
      'Marque os serviços: Situação fiscal, Caixa postal, PGDAS-D e DEFIS, DCTFWeb, Parcelamentos. Validade: 5 anos.',
      'Confirme. Pronto: volte aqui e toque em "Já fiz".',
    ],
    video: 'Vídeo de 1 min do escritório: autorização no e-CAC',
  },
  'CTB-010': {
    tipo: 'acao_externa',
    passos: ['Toque em "Abrir o banco": você vai para o app do seu banco, pelo Open Finance.', 'Escolha as contas da empresa e confirme o compartilhamento por 12 meses.', 'Volte aqui e toque em "Já fiz". O integrante do Contábil confere se as contas chegaram.'],
    video: 'Vídeo de 40 s do escritório: compartilhar extratos pelo Open Finance',
  },
  'CTB-030': {
    tipo: 'assinatura',
    ciencia: 'Li o balancete e a DRE de setembro/2026 enviados pelo escritório e estou ciente dos números apresentados.',
  },
}

/** Pendências de implantação (06, 4.2): a mesma lista da trilha, com o que já foi enviado. */
export const implantacaoPorCliente: Record<string, { item: string; enviado: boolean }[]> = {
  c4: [
    { item: 'Opt-in de mensagens (WhatsApp e e-mail)', enviado: true },
    { item: 'Contrato social e documentos dos sócios', enviado: true },
    { item: 'Acervo de notas de 2026 (XML)', enviado: true },
    { item: 'Procuração do FGTS Digital', enviado: true },
    { item: 'Certificado A1 e senha', enviado: true },
    { item: 'Balancete de encerramento do contador anterior', enviado: true },
    { item: 'Autorização de acesso na Receita (e-CAC)', enviado: false },
    { item: 'Consentimento das contas (Open Finance)', enviado: false },
    { item: 'Folha de pagamento de outubro', enviado: false },
  ],
  c10: [
    { item: 'Opt-in de mensagens (WhatsApp e e-mail)', enviado: true },
    { item: 'Acesso ao ERP (Conta Azul)', enviado: true },
    { item: 'Consentimento das contas (Open Finance)', enviado: false },
    { item: 'Cadastro de fornecedores e alçadas', enviado: false },
  ],
}

/* ---------- Pedidos (06, 4.3) ---------- */

export type AreaPedido = 'guias' | 'folha' | 'financeiro' | 'societario' | 'documentos' | 'todos'

export interface TipoPedido {
  tipo: string
  codigo: string
  setor: SetorIntegrante
  area: AreaPedido
  campos: CampoForm[]
  /** Prazo interno do catálogo, em dias úteis (previsão mostrada ao cliente). */
  previsaoDias: number
  /** Fora do escopo do contrato: serviço avulso da tabela do escritório (GES-002). */
  avulso?: number
  /** O integrante já faz ao receber (02, gatilho 23), em linguagem do cliente. */
  integranteFaz: string
  destaque?: 'C2-02' | 'C2-14'
}

export const tiposPedido: TipoPedido[] = [
  {
    tipo: 'Admissão',
    codigo: 'DP-001',
    setor: 'dp',
    area: 'folha',
    previsaoDias: 3,
    integranteFaz: 'Confere o piso da convenção e manda ao novo funcionário o convite para os documentos.',
    campos: [
      { id: 'nome', rotulo: 'Nome do novo funcionário', tipo: 'texto', obrigatorio: true },
      { id: 'cargo', rotulo: 'Cargo', tipo: 'texto', obrigatorio: true },
      { id: 'salario', rotulo: 'Salário', tipo: 'moeda', obrigatorio: true },
      { id: 'inicio', rotulo: 'Data de início', tipo: 'data', obrigatorio: true },
      { id: 'jornada', rotulo: 'Jornada', tipo: 'escolha', opcoes: ['44 h semanais', '40 h semanais', '36 h (12x36)', 'Meio período'] },
      { id: 'experiencia', rotulo: 'Contrato de experiência', tipo: 'escolha', opcoes: ['45 + 45 dias', '30 + 60 dias', 'Sem experiência'] },
    ],
  },
  {
    tipo: 'Férias',
    codigo: 'DP-024',
    setor: 'dp',
    area: 'folha',
    previsaoDias: 2,
    integranteFaz: 'Confere o período aquisitivo e a convenção e prepara o aviso de férias.',
    campos: [
      { id: 'empregado', rotulo: 'Quem vai sair de férias', tipo: 'texto', obrigatorio: true },
      { id: 'inicio', rotulo: 'Início', tipo: 'data', obrigatorio: true },
      { id: 'dias', rotulo: 'Dias', tipo: 'escolha', opcoes: ['30', '20', '15', '10'], obrigatorio: true },
      { id: 'abono', rotulo: 'Vender 1/3 (abono)?', tipo: 'escolha', opcoes: ['Não', 'Sim'] },
    ],
  },
  {
    tipo: 'Simulado de rescisão',
    codigo: 'C2-02',
    setor: 'dp',
    area: 'folha',
    previsaoDias: 1,
    destaque: 'C2-02',
    integranteFaz: 'Lê o cálculo do sistema da folha e monta o simulado em linguagem simples; o DP confere antes de mandar.',
    campos: [
      { id: 'empregado', rotulo: 'Quem', tipo: 'texto', obrigatorio: true },
      { id: 'data', rotulo: 'Data prevista do desligamento', tipo: 'data', obrigatorio: true },
      { id: 'tipo', rotulo: 'Tipo', tipo: 'escolha', opcoes: ['Sem justa causa', 'Pedido de demissão', 'Acordo (art. 484-A)', 'Fim de experiência'], obrigatorio: true },
      { id: 'aviso', rotulo: 'Aviso prévio', tipo: 'escolha', opcoes: ['Indenizado', 'Trabalhado', 'Dispensado'] },
    ],
  },
  {
    tipo: 'Rescisão',
    codigo: 'DP-026',
    setor: 'dp',
    area: 'folha',
    previsaoDias: 2,
    integranteFaz: 'Confere estabilidades e monta o kit da rescisão (FGTS, guias, termo).',
    campos: [
      { id: 'empregado', rotulo: 'Quem', tipo: 'texto', obrigatorio: true },
      { id: 'data', rotulo: 'Data do desligamento', tipo: 'data', obrigatorio: true },
      { id: 'tipo', rotulo: 'Tipo', tipo: 'escolha', opcoes: ['Sem justa causa', 'Pedido de demissão', 'Acordo (art. 484-A)', 'Fim de experiência', 'Justa causa'], obrigatorio: true },
      { id: 'aviso', rotulo: 'Aviso prévio', tipo: 'escolha', opcoes: ['Indenizado', 'Trabalhado', 'Dispensado'] },
    ],
  },
  {
    tipo: 'Variáveis da folha',
    codigo: 'DP-009',
    setor: 'dp',
    area: 'folha',
    previsaoDias: 1,
    integranteFaz: 'Confere as variáveis com o ponto e avisa se algo não bate.',
    campos: [
      { id: 'competencia', rotulo: 'Mês da folha', tipo: 'escolha', opcoes: ['11/2026', '12/2026'], obrigatorio: true },
      { id: 'detalhe', rotulo: 'Horas extras, faltas, comissões', tipo: 'texto', obrigatorio: true },
    ],
  },
  {
    tipo: 'Certidão',
    codigo: 'FIS-036',
    setor: 'fiscal',
    area: 'guias',
    previsaoDias: 1,
    integranteFaz: 'Emite a certidão; se sair positiva, explica o que falta.',
    campos: [
      { id: 'qual', rotulo: 'Qual certidão', tipo: 'escolha', opcoes: ['Federal (CND)', 'FGTS (CRF)', 'Trabalhista (CNDT)', 'Estadual', 'Municipal', 'Kit licitação (todas)'], obrigatorio: true },
      { id: 'finalidade', rotulo: 'Para quê', tipo: 'texto' },
    ],
  },
  {
    tipo: 'Documento vigente',
    codigo: 'SOC-034',
    setor: 'societario',
    area: 'societario',
    previsaoDias: 1,
    integranteFaz: 'Reemite o documento e entrega aqui.',
    campos: [
      { id: 'qual', rotulo: 'Documento', tipo: 'escolha', opcoes: ['Cartão CNPJ', 'Contrato social consolidado', 'Alvará', 'Inscrição estadual', 'Inscrição municipal'], obrigatorio: true },
      { id: 'para', rotulo: 'Para quem (banco, cliente, licitação)', tipo: 'texto' },
    ],
  },
  {
    tipo: 'Nota fiscal',
    codigo: 'NFE-039',
    setor: 'notas',
    area: 'guias',
    previsaoDias: 1,
    integranteFaz: 'Rascunha a nota; você confere aqui e uma pessoa do escritório emite.',
    campos: [
      { id: 'tomador', rotulo: 'Para quem (tomador)', tipo: 'texto', obrigatorio: true },
      { id: 'servico', rotulo: 'Serviço ou produto', tipo: 'texto', obrigatorio: true },
      { id: 'valor', rotulo: 'Valor', tipo: 'moeda', obrigatorio: true },
    ],
  },
  {
    tipo: 'Recálculo de guia vencida',
    codigo: 'FIS-201',
    setor: 'fiscal',
    area: 'guias',
    previsaoDias: 1,
    integranteFaz: 'Recalcula com juros e multa pela Receita e entrega a guia nova.',
    campos: [
      { id: 'guia', rotulo: 'Qual guia', tipo: 'texto', obrigatorio: true },
      { id: 'data', rotulo: 'Nova data de pagamento', tipo: 'data', obrigatorio: true },
    ],
  },
  {
    tipo: 'Alteração da empresa',
    codigo: 'SOC-002',
    setor: 'societario',
    area: 'societario',
    previsaoDias: 10,
    avulso: 1200,
    integranteFaz: 'Lista os documentos e os custos (Junta, taxas) e confere se está no contrato.',
    campos: [
      { id: 'oque', rotulo: 'O que muda', tipo: 'escolha', opcoes: ['Endereço', 'Sócios', 'Capital social', 'Atividades (CNAE)', 'Nome empresarial', 'Outro'], obrigatorio: true },
      { id: 'detalhe', rotulo: 'Detalhes', tipo: 'texto', obrigatorio: true },
    ],
  },
  {
    tipo: 'Declaração de faturamento',
    codigo: 'C2-14',
    setor: 'contabil',
    area: 'guias',
    previsaoDias: 2,
    destaque: 'C2-14',
    integranteFaz: 'Soma a receita dos últimos 12 meses pelas notas e pelo PGDAS-D, confere as duas e prepara a declaração para o contador assinar.',
    campos: [
      { id: 'finalidade', rotulo: 'Para quê', tipo: 'escolha', opcoes: ['Banco (crédito)', 'Pronampe', 'Licitação', 'Aluguel', 'Outro'], obrigatorio: true },
      { id: 'periodo', rotulo: 'Período', tipo: 'escolha', opcoes: ['Últimos 12 meses', 'Ano de 2025', 'Ano de 2026 até outubro'], obrigatorio: true },
      { id: 'destinatario', rotulo: 'Nome de quem vai receber', tipo: 'texto' },
    ],
  },
  {
    tipo: 'Dúvida',
    codigo: 'CON-001',
    setor: 'consultor',
    area: 'todos',
    previsaoDias: 2,
    integranteFaz: 'Organiza a pergunta e o Consultor rascunha a resposta para o contador conferir.',
    campos: [{ id: 'pergunta', rotulo: 'Sua pergunta', tipo: 'texto', obrigatorio: true }],
  },
  {
    tipo: '2ª via ou contestação',
    codigo: 'FIN-010',
    setor: 'financeiro_escritorio' as SetorIntegrante,
    area: 'financeiro',
    previsaoDias: 1,
    integranteFaz: 'A 2ª via sai na hora; a contestação vai para uma pessoa do Financeiro.',
    campos: [
      { id: 'fatura', rotulo: 'Fatura', tipo: 'texto', obrigatorio: true },
      { id: 'oque', rotulo: 'O que precisa', tipo: 'escolha', opcoes: ['2ª via', 'Contestar valor'], obrigatorio: true },
    ],
  },
  {
    tipo: 'Outro',
    codigo: 'GES-025',
    setor: 'gestao_atendimento',
    area: 'todos',
    previsaoDias: 2,
    integranteFaz: 'Faz a triagem e passa para o setor certo.',
    campos: [{ id: 'detalhe', rotulo: 'O que você precisa', tipo: 'texto', obrigatorio: true }],
  },
]

/* ---------- Biblioteca de passo a passo do escritório (C2-10, ideia) ---------- */

export interface PassoAPasso {
  id: string
  titulo: string
  assunto: 'Notas' | 'Folha' | 'Guias' | 'Acesso' | 'Empresa'
  area: AreaPedido
  minutos: number
  publicadoEm: string
  passos: string[]
  video?: string
}

export const bibliotecaPassos: PassoAPasso[] = [
  {
    id: 'pp-nfse',
    titulo: 'Como emitir NFS-e no Emissor Nacional',
    assunto: 'Notas',
    area: 'guias',
    minutos: 4,
    publicadoEm: '03/11/2026',
    passos: ['Entre em nfse.gov.br com a conta gov.br da empresa.', 'Toque em "Emitir NFS-e" e escolha "Emissão completa".', 'Informe o CNPJ ou CPF do tomador e confira o endereço.', 'Use o código de serviço que o escritório cadastrou (está em Empresa › Dados).', 'Confira valor, ISS e retenções; emita e mande o PDF ao tomador. O escritório captura a nota sozinho.'],
    video: 'Vídeo de 2 min do escritório',
  },
  {
    id: 'pp-pagar-guia',
    titulo: 'Como pagar uma guia pelo app do banco',
    assunto: 'Guias',
    area: 'guias',
    minutos: 2,
    publicadoEm: '20/10/2026',
    passos: ['Abra a guia em Documentos e toque em "Copiar código".', 'No app do banco, escolha "Pagar boleto" ou "Pix copia e cola".', 'Cole o código, confira o valor e o vencimento, confirme.', 'Volte aqui e toque em "Já paguei": a régua da guia para; a baixa confirma na conciliação.'],
  },
  {
    id: 'pp-ponto',
    titulo: 'Como mandar o ponto e as variáveis da folha',
    assunto: 'Folha',
    area: 'folha',
    minutos: 3,
    publicadoEm: '12/09/2026',
    passos: ['Até o dia 25, abra Pendências › "Variáveis da folha".', 'Preencha horas extras, faltas e comissões (ou mande foto do cartão de ponto).', 'Confira e envie. O DP confere com o ponto e avisa se algo não bate.'],
    video: 'Vídeo de 1 min do escritório',
  },
  {
    id: 'pp-govbr',
    titulo: 'Como subir sua conta gov.br para prata ou ouro',
    assunto: 'Acesso',
    area: 'todos',
    minutos: 3,
    publicadoEm: '01/08/2026',
    passos: ['Abra o app gov.br no celular e entre com seu CPF.', 'Toque em "Aumentar nível da conta".', 'Escolha validar pelo banco (prata) ou pela biometria facial da CNH (ouro).', 'Pronto: com prata ou ouro você faz a autorização de acesso no e-CAC.'],
  },
  {
    id: 'pp-certificado',
    titulo: 'Como renovar o certificado A1 da empresa',
    assunto: 'Empresa',
    area: 'societario',
    minutos: 5,
    publicadoEm: '15/07/2026',
    passos: ['Compre o e-CNPJ A1 com a certificadora (ou pelo escritório, em Serviços).', 'Faça a validação por vídeo ou presencial com o documento do sócio.', 'Baixe o arquivo .pfx e guarde a senha.', 'Em Empresa › Certificado, toque em "Enviar certificado novo": arquivo e senha vão direto para o cofre.'],
  },
]

/* ---------- Procurações e autorizações (06, 6.4) ---------- */

export interface Procuracao {
  orgao: string
  oQue: string
  validade: string
  situacao: 'ativa' | 'vence_em_breve' | 'pendente' | 'vencida'
  conferidaPor: 'automático' | 'escritório'
}

export const procuracoesPadrao = (clienteId: string): Procuracao[] =>
  clienteId === 'c4'
    ? [
        { orgao: 'Receita Federal (e-CAC)', oQue: 'Situação fiscal, caixa postal, declarações, parcelamentos', validade: '—', situacao: 'pendente', conferidaPor: 'automático' },
        { orgao: 'FGTS Digital', oQue: 'Guias e consultas do FGTS', validade: '11/2031', situacao: 'ativa', conferidaPor: 'escritório' },
        { orgao: 'NFS-e Nacional', oQue: 'Captura das notas de serviço', validade: '—', situacao: 'pendente', conferidaPor: 'automático' },
      ]
    : [
        { orgao: 'Receita Federal (e-CAC)', oQue: 'Situação fiscal, caixa postal, declarações, parcelamentos', validade: '03/2030', situacao: 'ativa', conferidaPor: 'automático' },
        { orgao: 'NFS-e Nacional', oQue: 'Captura e emissão das notas de serviço', validade: '06/2029', situacao: 'ativa', conferidaPor: 'automático' },
        { orgao: 'FGTS Digital', oQue: 'Guias e consultas do FGTS', validade: '01/2027', situacao: 'vence_em_breve', conferidaPor: 'escritório' },
        { orgao: 'SEFAZ-SP', oQue: 'DTE e consultas do ICMS', validade: '08/2028', situacao: 'ativa', conferidaPor: 'escritório' },
        { orgao: 'Prefeitura de São Paulo', oQue: 'Senha web, ISS e DEC', validade: 'sem validade', situacao: 'ativa', conferidaPor: 'escritório' },
        { orgao: 'DET (Domicílio Eletrônico Trabalhista)', oQue: 'Caixa do auditor fiscal do trabalho', validade: '—', situacao: 'pendente', conferidaPor: 'escritório' },
      ]

/* ---------- Comunicados do escritório (GES-030) por assunto ---------- */

export const comunicados: { id: string; assunto: string; titulo: string; texto: string; quando: string }[] = [
  { id: 'com-feriado', assunto: 'comunicados', titulo: 'Feriado de 20/11', texto: 'Feriado em 20/11 (Consciência Negra): sem expediente. Guias com vencimento no dia podem ser pagas no dia útil seguinte.', quando: '14/11' },
  { id: 'com-folha', assunto: 'folha', titulo: 'Prazo da folha de novembro', texto: 'Variáveis da folha (horas extras, faltas, comissões) até 25/11. O 13º salário (1ª parcela) vence em 30/11.', quando: '12/11' },
  { id: 'com-reforma', assunto: 'guias', titulo: 'Reforma tributária: o que muda em 2027', texto: 'Em 2027 começam a CBS e o IBS nas notas. O escritório já ajustou o cadastro dos seus serviços; nada a fazer agora.', quando: '05/11' },
  { id: 'com-honorarios', assunto: 'honorarios', titulo: 'Reajuste dos honorários', texto: 'O reajuste anual pelo índice do contrato entra na fatura de janeiro. O valor novo aparece em Financeiro › Contrato.', quando: '01/11' },
]

/* ---------- Simulado de rescisão (C2-02): o modelo do escritório, em linguagem do cliente ---------- */

export function simuladoRescisao(empregado: string, tipo: string, data: string) {
  const semJusta = /sem justa/i.test(tipo)
  const acordo = /acordo/i.test(tipo)
  const linhas: [string, number][] = [
    ['Saldo de salário (18 dias)', 1380],
    ['Aviso prévio indenizado (33 dias)', semJusta ? 2530 : acordo ? 1265 : 0],
    ['Férias vencidas + 1/3', 3066.67],
    ['Férias proporcionais + 1/3 (5/12)', 1277.78],
    ['13º proporcional (11/12)', 2108.33],
    ['Descontos (INSS e IRRF)', -742.1],
  ]
  const multa = semJusta ? 4620 : acordo ? 2310 : 0
  const total = linhas.reduce((t, [, v]) => t + v, 0)
  return {
    titulo: `Simulado de rescisão · ${empregado}`,
    resumo: `${tipo}, saída em ${data}`,
    linhas: linhas.filter(([, v]) => v !== 0),
    total,
    fgts: multa ? `Multa do FGTS (${acordo ? '20%' : '40%'}): ${brl(multa)} paga por guia, não entra no total.` : 'Sem multa do FGTS neste tipo de saída.',
    prazo: 'O pagamento da rescisão vence em 10 dias corridos depois do último dia de trabalho.',
  }
}

/* ---------- Declaração de faturamento (C2-14) ---------- */

/** Receita mês a mês de 11/2025 a 10/2026, nos mesmos números do Painel do sócio (outubro e setembro batem). */
export function faturamentoMensal(clienteId: string): number[] {
  const p = painelSocioDe[clienteId]
  if (!p) return Array.from({ length: 12 }, () => 30000)
  return Array.from({ length: 12 }, (_, i) => (i === 11 ? p.faturamento : i === 10 ? p.anterior : Math.round(p.anterior * (0.86 + i * 0.012))))
}

/* ---------- Informe anual (GES-008) ---------- */

export const informeAnual = (clienteNome: string, mensal: number) => ({
  ano: 2025,
  pagamentos: Array.from({ length: 12 }, (_, i) => ({ mes: String(i + 1).padStart(2, '0') + '/2025', valor: mensal })),
  retencoes: [
    { tributo: 'IRRF (1,5%)', valor: Math.round(mensal * 12 * 0.015 * 100) / 100 },
    { tributo: 'CSRF (4,65%)', valor: Math.round(mensal * 12 * 0.0465 * 100) / 100 },
  ],
  cliente: clienteNome,
})

/* ---------- Horários de reunião (06, 3.7) ---------- */

export const janelasReuniao = ['qui 19/11 · 10:00', 'qui 19/11 · 15:30', 'sex 20/11 · feriado', 'seg 23/11 · 09:00', 'seg 23/11 · 16:00', 'ter 24/11 · 14:00', 'qua 25/11 · 11:00']

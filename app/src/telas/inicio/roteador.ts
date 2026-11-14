import type { Anexo, Cartao, Integrante, Tarefa } from '@/dados/tipos'
import { useClienteDaRota } from '@/ambiente/contexto-cliente'
import { useLoja } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import type { TipoDocumento } from '@/dados/arquivos'
import { normalizar } from '@/dados/busca'
import { pedidosAssistente, respostasProntas } from '@/dados/simulacao'
import { rotuloSetorCurto } from '@/nucleo/permissoes'
import type { SetorIntegrante } from '@/theme/tipos'
import { pedirAoTime } from '../pedidoAoTime'
import type { useHistorico } from '../useHistorico'

/**
 * Roteador do Geral (02, 9.1; 07, 2; S01-A08 a A24). Decide o que fazer com a
 * mensagem, nesta ordem:
 * 1. pedido ao time (passa aos integrantes e acompanha até o fim);
 * 2. pergunta sobre o sistema → assistente de ajuda (não gasta limite, 02 ad. 25);
 * 3. condição em português ("me avise quando...") → regra com sim / editar / não (02, 7.3);
 * 4. pauta da reunião semanal (C2-28, só a ideia) → atrasos, riscos e pendências por setor;
 * 5. cálculo → cartão com a conta e a origem;
 * 6. "escreva uma mensagem para..." → pré-visualização (enviar pede aprovação);
 * 7. termo solto e ambíguo → pergunta com botões (confiança baixa);
 * 8. resposta pronta; 9. resposta de exemplo.
 * O Geral só roteia, consulta e acompanha; nunca executa efeito em setor.
 */

export interface RespostaRoteiro {
  texto: string
  cartoes?: Cartao[]
}

export interface ContextoRoteiro {
  cliente?: { id: string; nome: string }
  tarefas: Tarefa[]
  papel: 'administrador' | 'gestor' | 'colaborador'
  setores: SetorIntegrante[]
  contatoDe: (clienteId: string) => string | undefined
}

const id = (p: string) => `${p}-${Date.now()}-${Math.round(Math.random() * 1e4)}`

/* ---------- 2. Ajuda do sistema ---------- */

const ajuda: { re: RegExp; passos: string[]; destino?: { rotulo: string; modulo: string; aba?: string } }[] = [
  { re: /convid|usu[áa]rio|nova pessoa|cadastr.*(colega|funcion[áa]rio da equipe)/, passos: ['Configurações › Usuários e setores › Convidar.', 'Informe o e-mail, o papel (Administrador, Gestor ou Membro) e os setores.', 'O convite vale 7 dias; a pessoa cria a senha no primeiro acesso.'], destino: { rotulo: 'Abrir Usuários', modulo: 'config', aba: 'usuarios' } },
  { re: /senha|segundo fator|2fa|autentica/, passos: ['Clique no seu nome no pé da barra lateral › Minha conta.', 'Em Segurança, troque a senha ou ligue o segundo fator.', 'Trocar a senha encerra as outras sessões abertas.'] },
  { re: /tema|logo|cor(es)? d[ao]|marca branca/, passos: ['Configurações › Tema (só o Administrador).', 'Envie a logo e escolha as cores; a prévia mostra claro e escuro.', 'Marca branca completa (domínio e app na loja) é complemento do plano.'], destino: { rotulo: 'Abrir Tema', modulo: 'config', aba: 'tema' } },
  { re: /(criar|novo) integrante|integrante novo/, passos: ['Início › Time › Novo integrante (ou o "+" na gaveta do Chat).', 'Descreva em português o que ele deve fazer.', 'Revise a proposta; ele começa em observação por 14 dias.'], destino: { rotulo: 'Abrir o Time', modulo: 'inicio', aba: 'time' } },
  { re: /certificado|conector|cofre|credencia/, passos: ['Configurações › Conectores e cofre.', 'Cada conector mostra a saúde, o custo e a credencial.', 'O certificado A1 fica no cofre; o integrante usa, nunca vê.'], destino: { rotulo: 'Abrir Conectores', modulo: 'config', aba: 'conectores' } },
  { re: /atalho|tecla/, passos: ['Ctrl+K (ou /): busca global.', 'Ctrl+J: seletor de cliente.', 'Ctrl+B: abre e fecha a barra lateral.', 'Enter envia no chat; Shift+Enter quebra a linha.'] },
  { re: /paus(ar|o) .*integrante|integrante .*paus/, passos: ['Início › Time › abra o integrante.', 'No menu (⋯) do cabeçalho, Pausar.', 'Pausado, ele não roda jobs nem gatilhos; o chat continua respondendo.'], destino: { rotulo: 'Abrir o Time', modulo: 'inicio', aba: 'time' } },
  { re: /widget|visao geral|editar (o )?painel/, passos: ['Início › Visão geral › Editar painel.', 'Arraste, mude o tamanho, esconda ou adicione widgets pela galeria.', 'Esc conclui; "Restaurar padrão" volta ao arranjo do seu papel.'], destino: { rotulo: 'Abrir a Visão geral', modulo: 'inicio', aba: 'visao' } },
  { re: /aviso|notifica|resumo di[áa]rio|sil[eê]ncio/, passos: ['Sino do cabeçalho › Preferências (ou Minha conta › Avisos).', 'Escolha os canais por categoria, o silêncio e a hora do resumo diário.', 'Urgente fura o silêncio; o resto espera o resumo.'] },
]

function rotearAjuda(t: string): RespostaRoteiro | null {
  const sistema = /^(como|onde|cad[eê]|qual (é )?o atalho|o que (é|significa)|tem como|d[áa] pra|da para)\b/.test(t) || /\b(no sistema|na heild|na plataforma)\b/.test(t)
  if (!sistema) return null
  const a = ajuda.find((x) => x.re.test(t))
  if (!a) return null
  return { texto: 'Isso é sobre o sistema; passei para a ajuda, que responde sem gastar o seu limite de IA:', cartoes: [{ tipo: 'ajuda', id: id('aj'), pergunta: t, passos: a.passos, ...(a.destino ? { destino: a.destino } : {}) }] }
}

/* ---------- 3. Condição em português ---------- */

const vigiaveis: { re: RegExp; integrante: SetorIntegrante; regra: (cliente: string) => string; fonte: string; quando: string }[] = [
  { re: /certid|cnd/, integrante: 'fiscal', regra: (c) => `Quando uma certidão ${c} estiver a 15 dias de vencer, eu aviso aqui e preparo a renovação.`, fonte: 'Certidões (Receita, PGFN, estado, município)', quando: 'todo dia, 07:00' },
  { re: /extrato/, integrante: 'contabil', regra: (c) => `Se no dia 5 ${c} ainda não tiver mandado o extrato do mês, eu aviso aqui e peço ao Atendimento para cobrar.`, fonte: 'Documentos recebidos (tipo extrato)', quando: 'dia 5, 09:00' },
  { re: /nota|nf-?e|xml/, integrante: 'notas', regra: (c) => `Quando chegar nota de compra ${c} sem XML, eu aviso aqui e peço o XML pelo app.`, fonte: 'Distribuição de DF-e', quando: 'a cada nota recebida' },
  { re: /venc|prazo|atras/, integrante: 'fiscal', regra: (c) => `Quando uma tarefa ${c} passar do prazo interno sem estar concluída, eu aviso aqui com o prazo legal e a multa estimada.`, fonte: 'Tarefas e obrigações', quando: 'todo dia, 08:00' },
  { re: /sem resposta|n[ãa]o respond|cliente escrev/, integrante: 'gestao_atendimento', regra: (c) => `Quando uma conversa ${c} passar de 1 hora sem resposta, eu aviso aqui e o responsável.`, fonte: 'Conversas do CRM', quando: 'a cada conversa parada' },
  { re: /f[ée]rias/, integrante: 'dp', regra: (c) => `Quando alguém ${c} estiver a 60 dias de vencer as férias, eu aviso e proponho as datas.`, fonte: 'Folha (core de DP)', quando: 'dia 1, 08:00' },
  { re: /inapt|situa[çc][ãa]o cadastral|receita/, integrante: 'societario', regra: (c) => `Quando a situação cadastral ${c} mudar na Receita ou na Junta, eu aviso aqui.`, fonte: 'Consulta CNPJ e Junta', quando: 'segundas, 07:30' },
]

function rotearRegra(t: string, ctx: ContextoRoteiro): RespostaRoteiro | null {
  if (!/\b(me avis[ea]|avise[- ]me|me lembr[ea]|me alert[ea]|fique de olho|vigie)\b/.test(t)) return null
  const doCliente = ctx.cliente ? `da ${ctx.cliente.nome}` : 'de qualquer cliente da carteira'
  const v = vigiaveis.find((x) => x.re.test(t))
  if (!v)
    return {
      texto: 'Não consigo vigiar isso porque o sistema não tem um dado que diga quando acontece. Posso vigiar certidões, extratos, notas, prazos, conversas sem resposta, férias e situação cadastral.',
      cartoes: [{ tipo: 'regra', id: id('rg'), pedido: t, regra: '', integrante: 'geral', linhas: [], compilavel: false, motivo: 'Não consigo vigiar isso: não há no sistema um dado que mostre quando acontece.' }],
    }
  return {
    texto: `Entendi assim; o ${rotuloSetorCurto[v.integrante]} confere e avisa você aqui no chat. Confirma?`,
    cartoes: [
      {
        tipo: 'regra',
        id: id('rg'),
        pedido: t,
        regra: v.regra(doCliente),
        integrante: v.integrante,
        compilavel: true,
        linhas: [
          { rotulo: 'Quem vigia', valor: rotuloSetorCurto[v.integrante] },
          { rotulo: 'Olha em', valor: v.fonte },
          { rotulo: 'Quando confere', valor: v.quando },
          { rotulo: 'Clientes', valor: ctx.cliente?.nome ?? 'toda a carteira que você vê' },
          { rotulo: 'Avisa', valor: 'no chat dele e no sino' },
        ],
      },
    ],
  }
}

/* ---------- 4. Pauta da semana ---------- */

function rotearPauta(t: string, ctx: ContextoRoteiro): RespostaRoteiro | null {
  if (!/pauta|reuni[ãa]o (semanal|da semana|de segunda)/.test(t)) return null
  const setores = [...new Set(ctx.tarefas.map((x) => x.setor))].filter((s) => ctx.papel === 'administrador' || ctx.setores.includes(s))
  const abertas = (s: SetorIntegrante) => ctx.tarefas.filter((x) => x.setor === s && x.status !== 'concluida' && x.status !== 'cancelada')
  const linhas = setores
    .map((s) => {
      const a = abertas(s)
      return { setor: rotuloSetorCurto[s] ?? s, atrasadas: String(a.filter((x) => x.atrasada).length), cliente: String(a.filter((x) => x.status === 'aguardando_cliente').length), revisao: String(a.filter((x) => x.status === 'em_revisao' || x.cartaoPendente).length), risco: a.find((x) => x.atrasada)?.titulo ?? '—' }
    })
    .filter((l) => l.atrasadas !== '0' || l.cliente !== '0' || l.revisao !== '0')
  const membro = ctx.papel === 'colaborador'
  return {
    texto: `${membro ? 'A pauta da reunião é do Gestor; montei a dos seus setores.' : 'Pauta da semana, por setor.'} Comece pelos atrasos; as pendências de cliente viram cobrança do Atendimento se você quiser.`,
    cartoes: [
      {
        tipo: 'tabela',
        id: id('pauta'),
        titulo: 'Pauta da reunião semanal',
        colunas: [
          { chave: 'setor', rotulo: 'Setor' },
          { chave: 'atrasadas', rotulo: 'Atrasos', alinhamento: 'direita' },
          { chave: 'cliente', rotulo: 'Aguard. cliente', alinhamento: 'direita' },
          { chave: 'revisao', rotulo: 'Decisões', alinhamento: 'direita' },
          { chave: 'risco', rotulo: 'Maior risco' },
        ],
        linhas,
      },
    ],
  }
}

/* ---------- 5. Cálculo ---------- */

function rotearCalculo(t: string): RespostaRoteiro | null {
  if (/fator r/.test(t) && /calcul|quanto|simul|qual/.test(t))
    return {
      texto: 'Fator R dos últimos 12 meses da Clínica Sorriso (dados de exemplo): passa de 28%, então fica no Anexo III.',
      cartoes: [{ tipo: 'calculo', id: id('calc'), titulo: 'Fator R · últimos 12 meses', resultado: '30,0% · Anexo III', formula: 'Fator R = folha de salários 12m ÷ receita bruta 12m', linhas: [['Folha 12 meses (com pró-labore e encargos)', 'R$ 168.000,00'], ['Receita bruta 12 meses', 'R$ 560.000,00'], ['Fator R', '30,0%'], ['Limite', '28%']], origem: 'folha do core de DP e PGDAS-D transmitidos (LC 123/2006, art. 18, § 5º-J)' }],
    }
  if (/(multa|juros)/.test(t) && /(atras|darf|das|guia|pag)/.test(t))
    return {
      texto: 'Multa e juros de um DAS de R$ 1.390,00 pago com 10 dias de atraso (exemplo):',
      cartoes: [{ tipo: 'calculo', id: id('calc'), titulo: 'Acréscimos por atraso · DAS 10/2026', resultado: 'R$ 1.449,77', formula: 'multa = 0,33% × dias (máx. 20%); juros = Selic acumulada desde o mês seguinte + 1% no mês do pagamento', linhas: [['Principal', 'R$ 1.390,00'], ['Multa de mora (10 dias × 0,33% = 3,3%)', 'R$ 45,87'], ['Juros (1% no mês do pagamento)', 'R$ 13,90'], ['Total', 'R$ 1.449,77']], origem: 'Lei 9.430/1996, art. 61; Selic da Receita (simulada)' }],
    }
  return null
}

/* ---------- 6. Prévia de mensagem ---------- */

function rotearPrevia(t: string, ctx: ContextoRoteiro): RespostaRoteiro | null {
  if (!/\b(escrev|redij|rascunh|mand[ae]|envi[ae]|prepar[ae])\w*\b.*\b(mensagem|recado|whats\w*|e-?mail)\b/.test(t)) return null
  if (!ctx.cliente) return { texto: 'Para qual cliente? Escolha no seletor do canto (Ctrl+J) e peça de novo: eu deixo o rascunho para você revisar.' }
  const para = ctx.contatoDe(ctx.cliente.id) ?? 'o sócio'
  const primeiro = para.split(' ')[para.startsWith('Dra.') ? 1 : 0]
  const assunto = /extrato/.test(t) ? 'extrato' : /guia|das|imposto/.test(t) ? 'guia' : /document/.test(t) ? 'documentos' : 'geral'
  const setor: SetorIntegrante = assunto === 'guia' ? 'fiscal' : assunto === 'extrato' ? 'contabil' : 'gestao_atendimento'
  const texto =
    assunto === 'extrato'
      ? `Oi, ${primeiro}! Para fecharmos outubro, precisamos do extrato bancário do mês. Consegue mandar por aqui ou pelo app até sexta?`
      : assunto === 'guia'
        ? `Oi, ${primeiro}! As guias deste mês já estão no app. A próxima vence dia 20; qualquer dúvida, é só responder aqui.`
        : assunto === 'documentos'
          ? `Oi, ${primeiro}! Ainda faltam alguns documentos para seguirmos. Pode mandar pelo app? A lista está em Pendências.`
          : `Oi, ${primeiro}! Tudo bem? Passando para dar um retorno: seguimos com o que combinamos e aviso assim que concluir.`
  return { texto: `Deixei o rascunho para ${para}. Edite à vontade; nada sai sem a sua aprovação.`, cartoes: [{ tipo: 'previa_mensagem', id: id('pv'), cliente: ctx.cliente.nome, para, setor, canal: 'whatsapp', texto }] }
}

/* ---------- 7. Confiança baixa ---------- */

const ambiguos: Record<string, { pergunta: string; opcoes: { rotulo: string; texto: string }[] }> = {
  nota: { pergunta: 'Você quer falar de notas que entraram ou de nota a emitir?', opcoes: [{ rotulo: 'Notas sem XML', texto: 'Quais notas estão sem XML?' }, { rotulo: 'Emitir NFS-e', texto: 'Como eu emito uma NFS-e pelo sistema?' }] },
  guia: { pergunta: 'Guias que vencem ou guias que o cliente ainda não viu?', opcoes: [{ rotulo: 'Que vencem esta semana', texto: 'Quais guias vencem esta semana?' }, { rotulo: 'Não vistas', texto: 'Quais guias os clientes ainda não viram?' }] },
  folha: { pergunta: 'Folha de qual jeito?', opcoes: [{ rotulo: 'Admissões em andamento', texto: 'Admissões da Metalúrgica' }, { rotulo: 'Férias vencendo', texto: 'Quem tem férias vencendo?' }] },
  extrato: { pergunta: 'Quer saber quem não mandou ou o que ficou fora da conciliação?', opcoes: [{ rotulo: 'Quem não mandou', texto: 'Quem não mandou extrato?' }, { rotulo: 'Fora do padrão', texto: 'O que ficou fora do padrão na conciliação?' }] },
}

function rotearAmbiguo(t: string): RespostaRoteiro | null {
  const chave = t.replace(/[?!.]/g, '').replace(/s$/, '').trim()
  const a = ambiguos[chave]
  return a ? { texto: 'Não tenho certeza do que você quer.', cartoes: [{ tipo: 'escolha', id: id('esc'), ...a }] } : null
}

export function roteiroDoGeral(texto: string, ctx: ContextoRoteiro): RespostaRoteiro | null {
  const t = normalizar(texto)
  return rotearAjuda(t) ?? rotearRegra(t, ctx) ?? rotearPauta(t, ctx) ?? rotearCalculo(t) ?? rotearPrevia(t, ctx) ?? rotearAmbiguo(t)
}

/** Roteiros da S01 no chat de um integrante (pedidos de regra, cálculo e rascunho valem lá também). */
export function respostaDoIntegrante(integrante: Integrante, texto: string, _anexos: Anexo[]): RespostaRoteiro | null {
  const t = normalizar(texto)
  return rotearRegra(t, { tarefas: [], papel: 'colaborador', setores: [integrante.setor], contatoDe: () => undefined }) ?? rotearCalculo(t)
}

/* ---------- Anexo: vira documento do cliente, classificado ---------- */

const tipoPeloNome = (nome: string): TipoDocumento => {
  const n = normalizar(nome)
  if (/extrato|ofx/.test(n)) return 'extrato'
  if (/holerite/.test(n)) return 'holerite'
  if (/contrato/.test(n)) return 'contrato'
  if (/certid|cnd/.test(n)) return 'certidao'
  if (/\.xml$/.test(n)) return 'xml'
  if (/guia|das|darf/.test(n)) return 'guia'
  if (/balancete/.test(n)) return 'balancete'
  return 'outro'
}
const pastaDoTipo: Record<TipoDocumento, string[]> = { extrato: ['contabil', 'extratos'], holerite: ['dp', 'holerites'], folha: ['dp', 'folha'], contrato: ['permanentes', 'contrato social e alterações'], certidao: ['permanentes', 'procurações e certidões'], xml: ['fiscal', 'notas'], guia: ['fiscal', 'guias'], balancete: ['contabil', 'balancetes'], procuracao: ['permanentes', 'procurações e certidões'], cadastro: ['permanentes'], recibo: ['financeiro'], nfse: ['fiscal', 'notas'], relatorio: ['contabil'], intimacao: ['fiscal'], parecer: ['consultoria'], outro: ['recebidos'] }
const rotuloTipo: Record<TipoDocumento, string> = { extrato: 'extrato bancário', holerite: 'holerite', folha: 'folha', contrato: 'contrato', certidao: 'certidão', xml: 'XML de nota', guia: 'guia', balancete: 'balancete', procuracao: 'procuração', cadastro: 'cadastro', recibo: 'recibo', nfse: 'NFS-e', relatorio: 'relatório', intimacao: 'intimação', parecer: 'parecer', outro: 'documento' }

/** Envio no chat do Geral (Início › Assistente e gaveta do Chat): a mesma decisão nos dois lugares. */
export function useEnviarAoGeral(conversa: ReturnType<typeof useHistorico>) {
  const loja = useLoja()
  const { usuario, permissoes } = useSessao()
  const clienteId = useClienteDaRota()
  const cliente = clienteId ? loja.clientes.find((c) => c.id === clienteId) : undefined
  return (texto: string, anexos: Anexo[]) => {
    const pedido = pedidosAssistente.find((p) => p.texto.toLowerCase() === texto.trim().toLowerCase())
    if (pedido && !anexos.length) return pedirAoTime(pedido, conversa.atual.id, conversa.enviar, loja)
    if (anexos.length) {
      // S01-A18: o anexo vira Documento do cliente (classificado pelo nome) e entra no contexto do pedido.
      const competencia = new Date().toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' })
      const guardados = anexos.map((a) => {
        const tipo = tipoPeloNome(a.nome)
        loja.adicionarDocumento({ nome: a.nome, ...(cliente ? { clienteId: cliente.id } : {}), pasta: cliente ? pastaDoTipo[tipo] : ['recebidos pelo chat'], tipo, competencia, origem: 'upload_equipe', conector: 'principal', tamanho: a.tamanho ?? '—', quando: 'agora', por: usuario.nome })
        return `${a.nome} (${rotuloTipo[tipo]}${cliente ? `, em ${pastaDoTipo[tipo].join(' › ')}` : ''})`
      })
      loja.registrar(usuario.nome, `Anexou ao chat ${guardados.length === 1 ? 'o arquivo' : `${guardados.length} arquivos`}${cliente ? ` de ${cliente.nome}` : ''}`)
      const resposta = `Guardei ${guardados.join('; ')}${cliente ? ` nas pastas de ${cliente.nome}` : ' em Arquivos › recebidos pelo chat (escolha um cliente para eu classificar na pasta certa)'}, competência ${competencia}. ${texto.trim() ? 'Já estou usando no seu pedido.' : 'O que quer que eu faça com ele?'}`
      return conversa.enviar(texto, anexos, { texto: resposta })
    }
    const ctx: ContextoRoteiro = {
      cliente: cliente ? { id: cliente.id, nome: cliente.nome } : undefined,
      tarefas: loja.tarefas,
      papel: usuario.papel,
      setores: permissoes.setores,
      contatoDe: (id) => loja.fichaDe(id)?.contatos[0]?.nome,
    }
    const roteiro = roteiroDoGeral(texto, ctx)
    if (roteiro) return conversa.enviar(texto, anexos, roteiro)
    const pronta = respostasProntas.find((r) => r.re.test(texto))
    conversa.enviar(texto, anexos, pronta ? { texto: pronta.texto } : undefined)
  }
}

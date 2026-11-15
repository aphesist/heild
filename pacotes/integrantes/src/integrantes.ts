import { ctbCompetenciaDoc, ctbCompetenciaDocV2, ctbEcd, ctbEcdV2, type Procedimento } from '@heild/processos'
import { definirIntegrante, type Anexos, type ExecucaoParaDecisao, type Integrante, type PacoteProcedimento } from './contrato.ts'
import { decisaoDeEscolha, type Escolha } from './escolha.ts'
import { resolverCom } from './metas.ts'
import { BASE_PADRAO, gesFaq, gesFaqV2 } from './setores/atendimento.ts'
import { dpEventoFolha, dpEventoFolhaV2 } from './setores/dp.ts'
import { fisCaixaPostal, fisGuiaConferir, fisGuiaConferirV2 } from './setores/fiscal.ts'
import { EXIGE_JUNTA, rotuloAlteracao, socAlteracao } from './setores/societario.ts'
import { gesTriarRepassar, LIMIAR_INCERTA, LIMIAR_ROTEIA } from './setores/triagem.ts'
import { gesTriarRepassarV1 } from './setores/triagem-v1.ts'

/**
 * Decisão comparável da triagem: o setor; `pergunta` quando perguntou ao cliente; `sem_acordo` no
 * setor de entrada; `{menu}>{sugerido}` quando o cartão de sugestão transferiu; `cartao` quando foi à pessoa.
 */
export function decisaoDaTriagem(e: { estado: string; saida: Record<string, unknown> | null; erro: { codigo?: string } | null }): string {
  if (e.estado === 'concluida' && e.saida) {
    const x = e.saida
    if (x.acao === 'perguntar') return 'pergunta'
    if (x.acao === 'entrada_padrao') return 'sem_acordo'
    return x.transferido ? `${String(x.setor_roteado)}>${String(x.setor)}` : String(x.setor)
  }
  return e.estado === 'aguardando_cartao' || e.erro?.codigo === 'SOMBRA_NAO_DECIDIU' ? 'cartao' : `${e.estado}:${e.erro?.codigo ?? ''}`
}

/**
 * Os integrantes do pacote Contábil (B3): um por setor, compartilhado pelas pessoas do setor.
 * Cada um traz os seus procedimentos (o "como fazer", em código), o pacote de ferramentas, as
 * regras de roteamento da camada 1 e o formato fixo da resposta de cada processo (decisão 4).
 */

const P = (p: Procedimento) => p as unknown as Procedimento

/** Entrada padrão dos procedimentos de documento: cliente e documento anexados ao pedido. */
const entradaDeDocumento: PacoteProcedimento['entrada'] = (a: Anexos) =>
  a.cliente_id && a.documento_id
    ? { ok: true, entrada: { cliente_id: a.cliente_id, documento_id: a.documento_id } }
    : { ok: false, falta: (['cliente_id', 'documento_id'] as const).filter((c) => !a[c]) }

const decisao = (e: ExecucaoParaDecisao) => e.saida?.decisao as Escolha

/** Todas as operações de processo (para resolver o pacote de cada integrante). */
const TODOS = [ctbCompetenciaDocV2, ctbEcdV2, fisGuiaConferirV2, fisCaixaPostal, dpEventoFolhaV2, socAlteracao, gesFaqV2, gesTriarRepassar].map(P)
/** Versões anteriores, carregadas para as execuções em andamento terminarem na versão em que começaram. */
const ANTERIORES = [ctbCompetenciaDoc, ctbEcd, fisGuiaConferir, gesFaq, dpEventoFolha, gesTriarRepassarV1].map(P)
const resolver = resolverCom(TODOS.map((p) => p.ferramenta))
const LEITURA = ['documento.listar', 'tarefa.listar', 'execucao.obter', 'procedimento.listar', 'validador.executar', 'memoria.propor']

const competencia: PacoteProcedimento = {
  procedimento: P(ctbCompetenciaDocV2),
  entrada: entradaDeDocumento,
  regras: [/\bcompet[êe]ncia\b/i, /\bclassific\w* (o |este |esse )?(documento|recibo|lan[çc]amento)/i, /\bm[êe]s de refer[êe]ncia\b/i],
  descricao_roteamento: 'Classificar a competência (o mês) de um documento recebido do cliente.',
  apresentar: (s) => ({ titulo: `Documento classificado em ${s.competencia}`, texto: `Classifiquei o documento na competência ${s.competencia} (por ${s.origem === 'regra' ? 'regra' : s.origem === 'pessoa' ? 'decisão de uma pessoa' : 'leitura conferida'}).`, dados: { competencia: String(s.competencia), origem: String(s.origem) } }),
  decisao: (e) => (e.estado === 'concluida' ? String(e.saida?.competencia) : e.estado === 'aguardando_cartao' || e.erro?.codigo === 'SOMBRA_NAO_DECIDIU' ? 'cartao' : `${e.estado}:${e.erro?.codigo ?? ''}`),
}

const ecd: PacoteProcedimento = {
  procedimento: P(ctbEcdV2),
  entrada: (a) =>
    a.cliente_id && a.documento_id && a.exercicio
      ? { ok: true, entrada: { cliente_id: a.cliente_id, documento_id: a.documento_id, exercicio: a.exercicio } }
      : { ok: false, falta: (['cliente_id', 'documento_id', 'exercicio'] as const).filter((c) => !a[c]) },
  regras: [/\bECD\b/i, /escritura[çc][ãa]o cont[áa]bil digital/i, /\bSPED cont[áa]bil\b/i],
  tipos_documento: ['ecd'],
  aceita_documentos: ['ecd'],
  descricao_roteamento: 'Conferir e transmitir a ECD (escrituração contábil digital) do exercício.',
  apresentar: (s) => ({ titulo: s.ja_entregue_por ? 'ECD já estava transmitida' : 'ECD transmitida', texto: `A ECD foi transmitida com o recibo ${s.recibo}.`, dados: { recibo: String(s.recibo) } }),
  // A decisão do integrante na ECD são as contas que ele aponta antes do cartão.
  decisao: (e) => {
    const ap = e.passos.apontar_atencao as { apontamentos?: { conta_codigo: string }[]; pulado?: boolean } | null
    if (e.estado === 'aguardando_cartao' || e.estado === 'concluida') return (ap?.apontamentos ?? []).map((a) => a.conta_codigo).sort().join(',') || 'nenhuma'
    if (e.erro?.codigo === 'SOMBRA_NAO_DECIDIU') return 'cartao'
    return `${e.estado}:${e.erro?.codigo ?? ''}`
  },
}

export const integranteContabil: Integrante = definirIntegrante(
  {
    id: 'i-contabil',
    setor: 'contabil',
    nome: 'Contábil',
    descricao: 'Classifica documentos por competência e confere e transmite a ECD.',
    papeis: { operario: true, escritor: true, revisor: true },
    limites: { simultaneas: 10, segundo_plano_por_pessoa: 3 },
    limiar_confianca: 0.9,
    perguntar_responsavel: false,
    ferramentas: [...LEITURA, 'contabil.documento.classificar_competencia', 'contabil.ecd.conferir_e_transmitir', 'documento.classificar', 'contabil.ecd_ecf.transmitir', 'obrigacao.anexar_recibo'],
    procedimentos: [competencia, ecd],
  },
  resolver,
)

export const integranteFiscal: Integrante = definirIntegrante(
  {
    id: 'i-fiscal',
    setor: 'fiscal',
    nome: 'Fiscal',
    descricao: 'Confere guias antes de enviar ao cliente e tria a caixa postal do e-CAC.',
    papeis: { operario: true, escritor: true, revisor: true },
    limites: { simultaneas: 10, segundo_plano_por_pessoa: 3 },
    limiar_confianca: 0.9,
    perguntar_responsavel: true,
    ferramentas: [...LEITURA, 'fiscal.guia.conferir_e_enviar', 'fiscal.caixa_postal.triar', 'fiscal.guia.enviar', 'documento.atualizar', 'fiscal.caixa_postal.ler'],
    procedimentos: [
      {
        procedimento: P(fisGuiaConferirV2),
        entrada: entradaDeDocumento,
        regras: [/\bguias?\b/i, /\bDARF\b/i, /\bDAS\b/, /\bGPS\b/],
        tipos_documento: ['guia'],
        aceita_documentos: ['guia'],
        descricao_roteamento: 'Conferir uma guia de tributo (valor contra a apuração) e enviar ao cliente.',
        apresentar: (s) => {
          const d = s.decisao as Escolha
          return { titulo: `Guia de ${d.tributo} de ${d.competencia} enviada`, texto: `Conferi a guia de ${d.tributo} da competência ${d.competencia} com a apuração e enviei ao cliente.`, dados: { tributo: String(d.tributo), competencia: String(d.competencia) } }
        },
        decisao: decisaoDeEscolha(['tributo', 'competencia']),
      },
      {
        procedimento: P(fisCaixaPostal),
        entrada: entradaDeDocumento,
        regras: [/caixa postal/i, /\be-?CAC\b/i, /\bintima[çc][ãa]o\b/i, /\bmalha\b/i],
        tipos_documento: ['mensagem_ecac'],
        aceita_documentos: ['mensagem_ecac'],
        descricao_roteamento: 'Triar uma mensagem da caixa postal do e-CAC (intimação, malha, cobrança...).',
        apresentar: (s) => {
          const d = s.decisao as Escolha
          return { titulo: `Mensagem do e-CAC: ${String(d.categoria).replace('_', ' ')}`, texto: `Registrei a mensagem como ${String(d.categoria).replace('_', ' ')}${d.prazo ? `, com prazo em ${d.prazo}` : ', sem prazo'}.`, dados: { categoria: String(d.categoria), prazo: (d.prazo as string | null) ?? null } }
        },
        decisao: decisaoDeEscolha(['categoria', 'prazo']),
      },
    ],
  },
  resolver,
)

export const integranteDp: Integrante = definirIntegrante(
  {
    id: 'i-dp',
    setor: 'dp',
    nome: 'DP',
    descricao: 'Transforma pedidos dos clientes em eventos de folha conferidos.',
    papeis: { operario: true, escritor: true, revisor: false },
    limites: { simultaneas: 10, segundo_plano_por_pessoa: 3 },
    limiar_confianca: 0.9,
    perguntar_responsavel: false,
    ferramentas: [...LEITURA, 'dp.evento.classificar_e_lancar', 'dp.evento.lancar'],
    procedimentos: [
      {
        procedimento: P(dpEventoFolhaV2),
        entrada: entradaDeDocumento,
        regras: [/\bhoras? extras?\b/i, /\bf[ée]rias\b/i, /\bfolha\b/i, /\badmiss[ãa]o\b/i, /\brescis[ãa]o\b/i, /\badiantamento\b/i, /\bfaltou\b|\bfalta\b/i],
        aceita_documentos: ['mensagem', 'email', 'solicitacao'],
        descricao_roteamento: 'Registrar na folha um evento pedido pelo cliente (hora extra, falta, férias, admissão, rescisão).',
        apresentar: (s) => {
          const d = decisao({ estado: 'concluida', saida: s, erro: null, passos: {} })
          return { titulo: `Evento de folha: ${String(d.tipo_evento).replace('_', ' ')}`, texto: `Lancei ${String(d.tipo_evento).replace('_', ' ')}${d.quantidade ? ` (${d.quantidade})` : ''} na folha de ${d.competencia}.`, dados: { tipo_evento: String(d.tipo_evento), competencia: String(d.competencia), quantidade: (d.quantidade as string | null) ?? null } }
        },
        decisao: decisaoDeEscolha(['tipo_evento', 'competencia', 'quantidade']),
      },
    ],
  },
  resolver,
)

export const integranteSocietario: Integrante = definirIntegrante(
  {
    id: 'i-societario',
    setor: 'societario',
    nome: 'Societário',
    descricao: 'Tria pedidos de alteração contratual e abre a legalização quando exige Junta.',
    papeis: { operario: true, escritor: true, revisor: false },
    limites: { simultaneas: 10, segundo_plano_por_pessoa: 3 },
    limiar_confianca: 0.9,
    perguntar_responsavel: false,
    ferramentas: [...LEITURA, 'societario.alteracao.triar', 'legalizacao.abrir_processo'],
    procedimentos: [
      {
        procedimento: P(socAlteracao),
        entrada: entradaDeDocumento,
        regras: [/altera[çc][ãa]o contratual/i, /\bcontrato social\b/i, /\bs[óo]cio\b/i, /\bcapital social\b/i, /\bmudan[çc]a de endere[çc]o\b/i, /\bCNAE\b/i],
        aceita_documentos: ['mensagem', 'email', 'solicitacao'],
        descricao_roteamento: 'Triar um pedido de alteração contratual (endereço, sócios, capital, atividade, nome).',
        apresentar: (s) => {
          const t = String((s.decisao as Escolha).tipo_alteracao) as keyof typeof EXIGE_JUNTA
          return { titulo: `Alteração contratual: ${rotuloAlteracao[t] ?? t}`, texto: `Registrei o pedido como ${rotuloAlteracao[t] ?? t}. ${EXIGE_JUNTA[t] ? 'Abri o processo de legalização na Junta.' : 'Não exige processo na Junta.'}`, dados: { tipo_alteracao: t, exige_junta: EXIGE_JUNTA[t] ?? false } }
        },
        decisao: decisaoDeEscolha(['tipo_alteracao']),
      },
    ],
  },
  resolver,
)

export const integranteAtendimento: Integrante = definirIntegrante(
  {
    id: 'i-atendimento',
    setor: 'gestao_atendimento',
    nome: 'Atendimento',
    descricao: 'Responde as perguntas frequentes dos clientes com as respostas aprovadas da base.',
    papeis: { operario: true, escritor: true, revisor: true },
    limites: { simultaneas: 10, segundo_plano_por_pessoa: 3 },
    limiar_confianca: 0.9,
    perguntar_responsavel: false,
    ferramentas: [...LEITURA, 'atendimento.faq.responder', 'atendimento.conversa.triar_e_repassar', 'conversa.responder', 'conversa.transferir', 'conversa.rotear', 'conversa.triagem_divergir', 'conversa.listar'],
    procedimentos: [
      {
        procedimento: P(gesFaqV2),
        entrada: entradaDeDocumento,
        regras: [/\bsegunda via\b/i, /\bhor[áa]rio de atendimento\b/i, /\bcertid[ãa]o negativa\b/i, /\bpergunta frequente\b/i, /\bresponder? (o |a )?cliente\b/i],
        aceita_documentos: ['mensagem'],
        descricao_roteamento: 'Responder uma pergunta frequente do cliente com a resposta aprovada da base.',
        apresentar: (s) => {
          const id = String((s.decisao as Escolha).faq_id)
          return { titulo: 'Cliente respondido', texto: `Respondi ao cliente com a resposta aprovada de "${BASE_PADRAO.find((f) => f.id === id)?.pergunta ?? id}".`, dados: { faq_id: id } }
        },
        decisao: decisaoDeEscolha(['faq_id']),
      },
      {
        procedimento: P(gesTriarRepassar),
        entrada: (a) => (a.conversa_id ? { ok: true, entrada: { conversa_id: a.conversa_id } } : { ok: false, falta: ['conversa_id'] }),
        regras: [/\b(triar|triagem|repassar|repasse)\b.*\bconversa\b/i, /\bconversa\b.*\b(triar|repassar)\b/i],
        // Trabalha sobre a conversa do CRM, não sobre um documento anexado.
        aceita_documentos: [],
        descricao_roteamento: 'Triar a conversa que chegou pelo número compartilhado de WhatsApp e repassar ao setor certo, com resumo (ou perguntar o assunto ao cliente).',
        apresentar: (s) =>
          s.acao === 'perguntar'
            ? { titulo: 'Perguntei o assunto ao cliente', texto: 'Não deu para saber o setor pela mensagem; perguntei ao cliente, com opções.', dados: { acao: 'perguntar' } as Record<string, string | boolean> }
            : {
                titulo: `Conversa repassada ao setor ${String(s.setor)}`,
                texto: `Repassei a conversa ao setor ${String(s.setor)}${s.incerta ? ' (triagem incerta: confira)' : ''}${s.cliente_id ? '' : ', com o remetente ainda não identificado'}.`,
                dados: { setor: String(s.setor), origem: String(s.origem), cliente_identificado: s.cliente_id !== null } as Record<string, string | boolean>,
              },
        decisao: decisaoDaTriagem,
        limiares_do_plano: { roteia: LIMIAR_ROTEIA, incerta: LIMIAR_INCERTA, fonte: 'subplano 02, "Triagem do número compartilhado"' },
      },
    ],
  },
  resolver,
)

export const integrantesContabil: Integrante[] = [integranteContabil, integranteFiscal, integranteDp, integranteSocietario, integranteAtendimento]

/** Todos os procedimentos dos integrantes (para o motor, a API e o worker). */
export const procedimentosDosIntegrantes: Procedimento[] = [...integrantesContabil.flatMap((i) => i.procedimentos.map((p) => p.procedimento)), ...ANTERIORES]

export const integranteDoSetor = (setor: string) => integrantesContabil.find((i) => i.setor === setor)
export const integrantePorId = (id: string) => integrantesContabil.find((i) => i.id === id)

export function pacoteDoProcedimento(procedimento_id: string): { integrante: Integrante; pacote: PacoteProcedimento } | undefined {
  for (const integrante of integrantesContabil) {
    const pacote = integrante.procedimentos.find((p) => p.procedimento.id === procedimento_id)
    if (pacote) return { integrante, pacote }
  }
  return undefined
}

export { resolver as resolverDosIntegrantes }

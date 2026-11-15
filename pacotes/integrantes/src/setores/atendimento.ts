import { z } from 'zod'
import { definirContrato } from '@heild/processos'
import { procedimentoDeEscolha, type Escolha, type Lido, type OpcoesEscolha } from '../escolha.ts'
import { resolverCom } from '../metas.ts'

/**
 * Gestão e Atendimento. GES-FAQ-RESPONDER: a mensagem do cliente é ligada a uma pergunta
 * frequente da base do setor; a resposta que sai é o TEXTO APROVADO da base, nunca um texto do
 * modelo. Enviar ao cliente é irreversível: cartão sempre. Sem resposta na base, uma pessoa responde.
 * A base é memória do setor (muda só por proposta aprovada, decisão 6); sem ela, vale a padrão.
 */

export interface PerguntaFrequente {
  id: string
  pergunta: string
  palavras: string[]
  resposta: string
}

export const BASE_PADRAO: PerguntaFrequente[] = [
  { id: 'segunda_via_boleto', pergunta: 'Como pego a segunda via do boleto de honorários?', palavras: ['boleto', 'segunda via', 'honorário', 'honorarios', 'mensalidade'], resposta: 'A segunda via do boleto de honorários fica no app, em Financeiro › Boletos. Se preferir, respondemos com o PDF por aqui.' },
  { id: 'prazo_guias', pergunta: 'Quando recebo as guias do mês?', palavras: ['guia', 'guias', 'imposto', 'quando', 'recebo', 'das'], resposta: 'As guias do mês são enviadas até o dia 10, pelo app e por aqui. Avisamos se alguma depender de documento seu.' },
  { id: 'enviar_documentos', pergunta: 'Como envio os documentos do mês?', palavras: ['enviar', 'mandar', 'documentos', 'notas', 'extrato'], resposta: 'Os documentos do mês podem ser enviados pelo app, em Arquivos › Enviar, ou respondendo esta conversa com os arquivos.' },
  { id: 'certidao_negativa', pergunta: 'Como consigo uma certidão negativa?', palavras: ['certidão', 'certidao', 'negativa', 'cnd'], resposta: 'Pedimos a certidão negativa para você. Ela fica no app, em Arquivos › Certidões, assim que for emitida.' },
  { id: 'horario_atendimento', pergunta: 'Qual o horário de atendimento?', palavras: ['horário', 'horario', 'atendimento', 'funciona', 'aberto'], resposta: 'Atendemos de segunda a sexta, das 8h às 18h. Mensagens fora do horário são respondidas no dia útil seguinte.' },
]

const normalizar = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

/** As candidatas por sobreposição de palavras (código), as quatro melhores, mais "nenhuma". */
export function candidatasFaq(texto: string, base: PerguntaFrequente[]) {
  const t = normalizar(texto)
  return base
    .map((f) => ({ id: f.id, pontos: f.palavras.filter((p) => t.includes(normalizar(p))).length }))
    .filter((x) => x.pontos > 0)
    .sort((a, b) => b.pontos - a.pontos || a.id.localeCompare(b.id))
    .slice(0, 4)
    .map((x) => x.id)
}

export const contratoFaq = definirContrato({
  id: 'ges.faq.escolher',
  versao: 1,
  classe: 'operario',
  instrucao:
    'Você lê a mensagem de um cliente de escritório de contabilidade e escolhe qual pergunta frequente ela faz, entre as opções. ' +
    'Se nenhuma responde a mensagem por inteiro, escolha "nenhuma". Se houver dúvida, use confiança baixa.',
  recebe: z.object({ trecho: z.string().max(2000), opcoes: z.array(z.object({ id: z.string(), pergunta: z.string() }).strict()).max(5) }).strict(),
  devolve: z.object({ faq_id: z.string().max(60), confianca: z.number().min(0).max(1), motivo: z.string().min(3).max(140) }).strict(),
  max_tokens_saida: 100,
  campos_externos: ['trecho'],
})

const baseDe = (memoria: Readonly<Record<string, unknown>>) => {
  const m = z.array(z.object({ id: z.string(), pergunta: z.string(), palavras: z.array(z.string()), resposta: z.string().max(1500) }).strict()).safeParse(memoria.faq)
  return m.success && m.data.length ? m.data : BASE_PADRAO
}

const opcoesFaq = {
  id: 'GES-FAQ-RESPONDER',
  versao: 1,
  nome: 'Responder pergunta frequente do cliente',
  setor: 'gestao_atendimento',
  operacao: 'atendimento.faq.responder',
  descricao_modelo: 'Liga a mensagem do cliente a uma pergunta frequente e, com cartão aprovado, responde com o texto aprovado da base.',
  tipos_documento: ['mensagem'],
  contrato: contratoFaq,
  campos: ['faq_id'],
  chave_metadados: 'resposta_faq',
  memoria: ['faq'],
  ler: (d, memoria) => {
    const base = baseDe(memoria)
    const ids = candidatasFaq(d.texto, base)
    return { tipo: d.tipo, candidatas: { faq_id: [...ids, 'nenhuma'] }, regra: null, trecho: d.texto, contexto: { base } }
  },
  recebe: (l) => {
    const base = l.contexto.base as PerguntaFrequente[]
    const ids = (l.candidatas.faq_id as string[]).filter((x) => x !== 'nenhuma')
    return { trecho: l.trecho, opcoes: [...ids.map((id) => ({ id, pergunta: base.find((f) => f.id === id)!.pergunta })), { id: 'nenhuma', pergunta: 'Nenhuma destas' }] }
  },
  validadores: ['escolha_nas_candidatas', 'confianca_minima:0.9', 'faq_respondivel'],
  aprovacao: {
    ferramenta: 'conversa.responder',
    exigida: 'sempre',
    resumo: (e, l) => `Responder ao cliente com a resposta aprovada de "${(l.contexto.base as PerguntaFrequente[]).find((f) => f.id === e.faq_id)?.pergunta ?? e.faq_id}".`,
    cartoes: (e, l) => [{ tipo: 'aviso', titulo: 'Resposta que vai ao cliente', texto: (l.contexto.base as PerguntaFrequente[]).find((f) => f.id === e.faq_id)?.resposta ?? '' }],
    extras: (e, l) => ({ resposta: (l.contexto.base as PerguntaFrequente[]).find((f) => f.id === e.faq_id)?.resposta ?? '' }),
  },
  orcamento: { centavos: 8, tokens: 8_000 },
  resolver: resolverCom(),
} satisfies OpcoesEscolha

export const gesFaq = procedimentoDeEscolha(opcoesFaq)

/** v2 (B3b): revisor de risco (Opus) antes do cartão, porque o ato é irreversível. */
const opcoesFaqV2 = {
  ...opcoesFaq,
  versao: 2,
  orcamento: { centavos: 30, tokens: 12_000 },
  revisor: { evidencias: (e: Escolha, l: Lido) => {
      const f = (l.contexto.base as PerguntaFrequente[]).find((x) => x.id === e.faq_id)
      return [
        { rotulo: 'Pergunta da base escolhida', valor: f?.pergunta ?? String(e.faq_id) },
        { rotulo: 'Resposta aprovada que vai ao cliente', valor: (f?.resposta ?? '').slice(0, 300) },
      ]
    } },
} satisfies OpcoesEscolha
export const gesFaqV2 = procedimentoDeEscolha(opcoesFaqV2)

/**
 * v3: a resposta ao cliente segue o modo da categoria `resposta_factual` escolhido pelo escritório
 * (cartão por padrão, envio automático ou desligado); o texto é o da base aprovada.
 */
export const gesFaqV3 = procedimentoDeEscolha({
  ...opcoesFaqV2,
  versao: 3,
  aprovacao: {
    ...opcoesFaq.aprovacao,
    exigida: 'por_categoria',
    categoria: 'resposta_factual',
    mensagem_ao_cliente: (e, l) => (l.contexto.base as PerguntaFrequente[]).find((f) => f.id === e.faq_id)?.resposta ?? '',
  },
})

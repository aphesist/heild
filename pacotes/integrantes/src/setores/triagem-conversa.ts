import { z } from 'zod'
import { definirContrato, definirProcedimento, definirValidador, ErroRegra, type Estado, type Procedimento, type Tx } from '@heild/processos'
import { resolverCom } from '../metas.ts'
import { comQuemFala, NOME_DO_SETOR, type QuemFala } from '../identificacao.ts'
import { dentroDoHorario, horarioDe, proximaAbertura, saudacao, textoDoHorario } from '../horario.ts'
import { DESCRICAO, DIAS_RESPOSTA_A_ENVIO, LIMIAR_ROTEIA, SETORES_DE_DESTINO, setoresPorPalavras, type SetorDestino } from './triagem.ts'

/**
 * Gestão e Atendimento · GES-TRIAR-REPASSAR v3: a triagem do número compartilhado como CONVERSA
 * (decisão do Enzo de 15/11/2026: "os clientes odeiam menu e falar com robô; os integrantes devem
 * conversar como pessoas normais no WhatsApp"). A pergunta fechada de escolher o setor fica só nos
 * fluxos de chatbot sem IA.
 *
 * A cada mensagem nova do cliente na conversa que espera triagem:
 *   1. Fora do horário de atendimento: resposta automática FIXA (sem IA) com o horário; nenhuma
 *      triagem; a conversa fica na fila e a triagem retoma na primeira hora do expediente (job atrasado).
 *   2. Regras, sem modelo: conversa ligada a um setor nos últimos dias (conversa aberta, resposta a
 *      envio do escritório em 7 dias, um só setor ativo na carteira) pula a triagem em silêncio;
 *      palavra-chave de um setor só repassa com um aviso fixo ao cliente.
 *   3. O integrante conversa (operário): cumprimenta, entende, faz no máximo uma pergunta por
 *      mensagem e repassa quando tiver certeza razoável (confiança ≥ 0,8), avisando o cliente de forma
 *      natural. Assunto delicado, cliente irritado ou pedido de falar com alguém vão a uma pessoa.
 *      Depois de 3 perguntas sem certeza, cartão para uma pessoa escolher o setor.
 * Limites (validadores, por regra): mensagem curta, sem menu nem jargão de robô; sem valor, prazo,
 * promessa, resposta técnica ou pedido de documento sensível. As mensagens da triagem saem sem cartão
 * (só triagem); qualquer outra mensagem da IA ao cliente continua com aprovação. Todas saem com
 * "*{integrante} (IA)*". O resumo ao setor é escrito pelo sistema.
 */

export const MAX_PERGUNTAS_TRIAGEM = 3
export const FILA_RETOMAR_TRIAGEM = 'atendimento.triagem_retomar'
const MAX_MENSAGENS_LIDAS = 16

/** Como o integrante se refere ao setor ao repassar ("vou passar para o pessoal do DP"). */
export const PESSOAL_DO_SETOR: Record<SetorDestino, string> = {
  contabil: 'pessoal da contabilidade',
  fiscal: 'pessoal do fiscal',
  dp: 'pessoal do DP',
  societario: 'pessoal do societário',
  gestao_atendimento: 'pessoal do atendimento',
}
const MENCAO_DO_SETOR: Record<SetorDestino, RegExp> = {
  contabil: /cont[áa]bil|contabilidade/i,
  fiscal: /fiscal|impostos?/i,
  dp: /\bDP\b|departamento pessoal/i,
  societario: /societ[áa]rio/i,
  gestao_atendimento: /atendimento|financeiro/i,
}

// ───────────────────────────── estilo e escopo (por regra) ─────────────────────────────

const REGRAS_DE_ESTILO: [string, (m: string) => boolean][] = [
  ['longa', (m) => m.length > 320 || m.split(/(?<=[.!?])\s+/).filter((x) => x.trim()).length > 4],
  ['mais_de_uma_pergunta', (m) => (m.match(/\?/g)?.length ?? 0) > 1],
  ['lista_ou_menu', (m) => /^\s*(\d+\s*[.)\-–]|[-•]\s)/m.test(m)],
  ['menu', (m) => /\b(op[çc][ãa]o|op[çc][õo]es|digite|selecione|escolha uma|menu|tecle|responda com o n[úu]mero)\b/i.test(m)],
  [
    'jargao_de_robo',
    (m) =>
      /assistente virtual|sou (um|uma) (rob[ôo]|bot|intelig[êe]ncia artificial)|como posso (te |lhe )?ajud[áa]-?l[oa]|prezad[oa]|atenciosamente|estou (aqui )?[àa] (sua )?disposi[çc][ãa]o|em que posso ser [úu]til|sua solicita[çc][ãa]o|aguarde (um momento|na linha)|n[úu]mero de protocolo|agradecemos (o|seu) contato/i.test(m),
  ],
  ['formatacao', (m) => /[*_~`#]/.test(m)],
]

const REGRAS_DE_ESCOPO: [string, (m: string) => boolean][] = [
  ['valor', (m) => /R\$|\b\d+[.,]\d{2}\b|\b\d+\s*(%|por cento|reais)/i.test(m)],
  ['prazo', (m) => /\b\d{1,2}\/\d{1,2}\b|\bat[ée] (o )?dia \d|\bem \d+ (dias?|horas?|minutos?)|\bprazo (é|de|vai|termina)|\bvence (no|em|dia|amanh)/i.test(m)],
  ['promessa', (m) => /\b(garanto|prometo|pode deixar que (eu )?(resolvo|fa[çc]o)|vou resolver|j[áa] resolvo|fica pronto|est[áa] resolvido)\b/i.test(m)],
  ['documento_sensivel', (m) => /\b(senha|cpf|rg|certificado digital|cart[ãa]o de cr[ée]dito|dados banc[áa]rios|foto (do|da|de) (documento|identidade|cnh))\b/i.test(m)],
  [
    'resposta_tecnica',
    (m) => /\b(al[íi]quota|dedut[íi]vel|pode deduzir|n[ãa]o pode deduzir|voc[êe] (deve|precisa|tem que) (pagar|recolher|declarar)|[ée] obrigat[óo]rio|a lei (diz|manda)|segundo a legisla[çc][ãa]o)\b/i.test(m),
  ],
]

/** O que corrigir, em palavras, para a escalada e para o cartão. */
const CORRECAO: Record<string, string> = {
  longa: 'encurte para até três frases curtas',
  mais_de_uma_pergunta: 'deixe um único ponto de interrogação na mensagem (tire o "tudo bem?" ou a segunda pergunta)',
  lista_ou_menu: 'tire a lista ou as opções numeradas e pergunte de forma aberta',
  menu: 'não ofereça opções nem peça para escolher ou digitar; pergunte de forma aberta',
  jargao_de_robo: 'fale como uma pessoa da equipe, sem frases de robô ou de atendimento formal',
  formatacao: 'tire asteriscos, sublinhados e outras marcas de formatação',
  valor: 'não diga valores nem percentuais',
  prazo: 'não diga prazos, datas nem em quanto tempo algo acontece',
  promessa: 'não prometa nada; só diga que vai passar para quem cuida',
  documento_sensivel: 'não peça senha, CPF, RG, certificado, cartão ou dados bancários',
  resposta_tecnica: 'não responda a dúvida técnica; só entenda o assunto e encaminhe',
}
export const comoCorrigir = (problemas: string[]) => problemas.map((p) => `${p} (${CORRECAO[p] ?? p})`).join('; ')

/** O que está fora do tom de WhatsApp na mensagem (vazio: está no tom). */
export const problemasDeEstilo = (m: string) => REGRAS_DE_ESTILO.filter(([, r]) => r(m)).map(([n]) => n)
/** O que passa do escopo da triagem (vazio: só entende e encaminha). */
export const problemasDeEscopo = (m: string) => REGRAS_DE_ESCOPO.filter(([, r]) => r(m)).map(([n]) => n)

/**
 * Sinais de assunto delicado, irritação ou pedido de falar com alguém: a palavra-chave não decide
 * sozinha (o aviso fixo seria frio), e o integrante lê a conversa para chamar uma pessoa.
 */
const SINAIS_DE_CUIDADO =
  /\b(faleceu|falecimento|morreu|[óo]bito|vel[óo]rio|doen[çc]a grave|absurdo|ningu[ée]m (me )?respond\w*|cansad[oa] de esperar|vou processar|advogad[oa]|procon|reclama[çc][ãa]o|atendente|falar com (uma pessoa|algu[ée]m)|chatead[oa]|irritad[oa])\b/i
export const pedeCuidado = (texto: string) => SINAIS_DE_CUIDADO.test(texto)

// ───────────────────────────── contrato do operário ─────────────────────────────

export const contratoConversa = definirContrato({
  id: 'ges.triagem.conversar',
  versao: 1,
  classe: 'operario',
  // Provisória: o prompt é da frente de IA (pacotes/contratos-ia).
  instrucao: [
    'Você atende o WhatsApp de um escritório de contabilidade e conversa com o cliente só para entender o assunto e passar ao setor certo. Você não resolve o pedido.',
    'Escreva como uma pessoa da equipe no WhatsApp: português do dia a dia, curto (uma a três frases), simpático e direto. Cumprimente só se o escritório ainda não falou na conversa; use a saudação indicada.',
    'Faça no máximo uma pergunta por mensagem, aberta e natural, sobre o que o cliente precisa: só um ponto de interrogação na mensagem inteira. Não junte "tudo bem?" com outra pergunta; se o cliente perguntou se está tudo bem, responda "tudo bem sim" sem devolver a pergunta (ex.: "Boa tarde! Tudo bem sim. Me conta o que você precisa?").',
    'Nunca dê opções numeradas, lista ou menu. Não diga que é robô ou assistente virtual, não assine e não use formatação.',
    'Nunca responda dúvida técnica, não diga números, valores, prazos ou datas, não prometa nada e não peça senha, CPF, RG, certificado ou dados bancários.',
    'acao=repassar quando tiver certeza razoável do setor (confiança de 0,8 ou mais). A mensagem avisa de forma natural que vai passar para o pessoal do setor (ex.: "vou passar para o pessoal do DP, que cuida disso").',
    'acao=perguntar quando ainda não souber: a mensagem é a sua próxima fala na conversa, com uma pergunta.',
    'acao=pessoa quando o assunto for delicado (falecimento, doença, briga entre sócios, fiscalização com medo), o cliente estiver irritado ou pedir para falar com alguém: diga, com empatia, que vai chamar alguém da equipe. Informe motivo_pessoa.',
    'Se a conversa trouxer dois assuntos de setores diferentes, pergunte qual resolver primeiro. Se o cliente mudar de assunto, vale o último pedido.',
  ].join(' '),
  recebe: z
    .object({
      conversa: z.array(z.object({ de: z.enum(['cliente', 'escritorio']), texto: z.string().max(600) }).strict()).min(1).max(MAX_MENSAGENS_LIDAS),
      cliente_conhecido: z.boolean(),
      saudacao: z.enum(['Bom dia', 'Boa tarde', 'Boa noite']),
      escritorio_ja_falou: z.boolean(),
      perguntas_feitas: z.number().int().min(0),
      setores: z.array(z.object({ codigo: z.string(), descricao: z.string() }).strict()).length(5),
    })
    .strict(),
  devolve: z
    .object({
      acao: z.enum(['repassar', 'perguntar', 'pessoa']),
      setor: z.enum(SETORES_DE_DESTINO).nullable(),
      confianca: z.number().min(0).max(1),
      motivo_pessoa: z.enum(['irritado', 'delicado', 'pediu_pessoa']).nullable(),
      mensagem: z.string().min(2).max(400),
    })
    .strict(),
  max_tokens_saida: 250,
  campos_externos: ['conversa'],
})

type SaidaConversa = { pulado?: boolean; origem?: string; acao?: 'repassar' | 'perguntar' | 'pessoa'; setor?: SetorDestino | null; confianca?: number; motivo_pessoa?: string | null; mensagem?: string }
const Origem = z.enum(['fora', 'regra', 'integrante', 'pessoa'])

definirValidador({
  nome: 'triagem_conversa_coerente',
  versao: 1,
  descricao: 'Repasse só com setor e certeza razoável (confiança de 0,8 ou mais); chamar uma pessoa só com o motivo.',
  dados: z.object({ origem: Origem, acao: z.string().nullable(), setor: z.string().nullable(), confianca: z.number().nullable(), motivo_pessoa: z.string().nullable() }),
  conferir: ({ origem, acao, setor, confianca, motivo_pessoa }) => {
    if (origem !== 'integrante') return { ok: true }
    if (acao === 'repassar' && (!setor || (confianca ?? 0) < LIMIAR_ROTEIA)) return { ok: false, codigo: 'REPASSE_SEM_CERTEZA', escalavel: true, mensagem: 'Repasse sem setor ou com confiança abaixo de 0,8: continue a conversa.' }
    if (acao === 'pessoa' && !motivo_pessoa) return { ok: false, codigo: 'PESSOA_SEM_MOTIVO', escalavel: true, mensagem: 'Chamar uma pessoa exige o motivo.' }
    return { ok: true }
  },
})

definirValidador({
  nome: 'estilo_whatsapp',
  versao: 1,
  descricao: 'Mensagem curta, no máximo uma pergunta, sem lista, menu, formatação ou jargão de robô.',
  dados: z.object({ origem: Origem, mensagem: z.string().nullable() }),
  conferir: ({ origem, mensagem }) => {
    const p = origem === 'integrante' && mensagem ? problemasDeEstilo(mensagem) : []
    return p.length ? { ok: false, codigo: 'FORA_DO_TOM', escalavel: true, mensagem: `Mensagem fora do tom de WhatsApp: ${comoCorrigir(p)}.` } : { ok: true }
  },
})

definirValidador({
  nome: 'escopo_triagem',
  versao: 1,
  descricao: 'A triagem só entende e encaminha: sem valor, prazo, promessa, resposta técnica ou pedido de documento sensível.',
  dados: z.object({ origem: Origem, mensagem: z.string().nullable() }),
  conferir: ({ origem, mensagem }) => {
    const p = origem === 'integrante' && mensagem ? problemasDeEscopo(mensagem) : []
    return p.length ? { ok: false, codigo: 'FORA_DO_ESCOPO', escalavel: true, mensagem: `A mensagem passa do escopo da triagem: ${comoCorrigir(p)}.` } : { ok: true }
  },
})

definirValidador({
  nome: 'aviso_de_repasse',
  versao: 1,
  descricao: 'Ao repassar, a mensagem diz ao cliente para qual setor a conversa vai.',
  dados: z.object({ origem: Origem, acao: z.string().nullable(), setor: z.string().nullable(), mensagem: z.string().nullable() }),
  conferir: ({ origem, acao, setor, mensagem }) =>
    origem === 'integrante' && acao === 'repassar' && setor && mensagem && !MENCAO_DO_SETOR[setor as SetorDestino]?.test(mensagem)
      ? { ok: false, codigo: 'REPASSE_SEM_AVISO', escalavel: true, mensagem: `Diga ao cliente que vai passar para o ${PESSOAL_DO_SETOR[setor as SetorDestino]}.` }
      : { ok: true },
})

definirValidador({
  nome: 'trocas_no_limite',
  versao: 1,
  descricao: `Depois de ${MAX_PERGUNTAS_TRIAGEM} perguntas sem certeza, uma pessoa escolhe o setor (cartão).`,
  dados: z.object({ origem: Origem, acao: z.string().nullable(), perguntas_feitas: z.number() }),
  conferir: ({ origem, acao, perguntas_feitas }) =>
    origem === 'integrante' && acao === 'perguntar' && perguntas_feitas >= MAX_PERGUNTAS_TRIAGEM
      ? { ok: false, codigo: 'TRIAGEM_SEM_CERTEZA', mensagem: `Depois de ${perguntas_feitas} perguntas, ainda não deu para saber o assunto; escolha o setor (o cliente é avisado).` }
      : { ok: true },
})

// ───────────────────────────── procedimento ─────────────────────────────

type MotivoRegra = 'conversa_aberta' | 'resposta_a_envio' | 'setor_unico' | 'palavra_chave'
const MOTIVO_TEXTO: Record<MotivoRegra, string> = {
  conversa_aberta: 'tem conversa aberta com o setor',
  resposta_a_envio: `respondeu a algo que o setor mandou nos últimos ${DIAS_RESPOSTA_A_ENVIO} dias`,
  setor_unico: 'tem um só setor ativo na carteira',
  palavra_chave: 'assunto reconhecido por palavra-chave',
}

interface Lida {
  conversa_id: string
  setor_entrada: SetorDestino
  cliente_id: string | null
  cliente_nome: string | null
  identificado_por: 'conversa' | 'historico' | null
  escritorio: string
  fora_do_horario: boolean
  retomar_em: string | null
  ja_avisou_fora: boolean
  horario_texto: string
  saudacao: 'Bom dia' | 'Boa tarde' | 'Boa noite'
  conversa: { de: 'cliente' | 'escritorio'; texto: string }[]
  /** O que o cliente escreveu desde a última fala do escritório (vai no resumo). */
  ultimas_do_cliente: string
  escritorio_ja_falou: boolean
  perguntas_feitas: number
  regra: { setor: SetorDestino; motivo: MotivoRegra } | null
  integrante: { id: string | null; nome: string }
  anterior: QuemFala | null
}

interface Decisao {
  acao: 'fora_do_horario' | 'perguntar' | 'repassar' | 'pessoa'
  setor: SetorDestino | null
  origem: z.infer<typeof Origem>
  motivo_regra: MotivoRegra | null
  motivo_pessoa: string | null
  confianca: number | null
  /** A mensagem ao cliente, já com o prefixo de quem fala; null quando a regra pula em silêncio. */
  mensagem: string | null
}

const lida = (s: Estado) => s.saidas.ler_conversa as Lida
const conversa = (s: Estado) => s.saidas.conversar as SaidaConversa
const decisao = (s: Estado) => s.saidas.decidir as Decisao

/** O que foi decidido antes de compor a mensagem (para os validadores e o passo `decidir`). */
function decidida(s: Estado) {
  const l = lida(s)
  if (l.fora_do_horario) return { origem: 'fora' as const, acao: null, setor: null, confianca: null, motivo_pessoa: null, mensagem: null }
  if (l.regra) return { origem: 'regra' as const, acao: 'repassar' as const, setor: l.regra.setor, confianca: null, motivo_pessoa: null, mensagem: null }
  const c = conversa(s)
  return { origem: c.origem === 'pessoa' ? ('pessoa' as const) : ('integrante' as const), acao: c.acao ?? null, setor: c.setor ?? null, confianca: c.confianca ?? null, motivo_pessoa: c.motivo_pessoa ?? null, mensagem: c.mensagem ?? null }
}

/** O aviso fixo de repasse (regra ou escolha de uma pessoa): escrito pelo sistema. */
function avisoFixo(l: Lida, setor: SetorDestino) {
  const oi = l.escritorio_ja_falou ? '' : `${l.saudacao}! `
  return `${oi}Vou passar sua mensagem para o ${PESSOAL_DO_SETOR[setor]}, que cuida disso. Daqui a pouco eles te respondem por aqui.`
}

function resumo(l: Lida, d: Decisao) {
  const quem = l.cliente_nome ? `Cliente ${l.cliente_nome}` : 'Remetente não identificado (confirme quem é antes de responder)'
  const como =
    d.acao === 'pessoa'
      ? `precisa de uma pessoa: ${d.motivo_pessoa === 'irritado' ? 'cliente irritado' : d.motivo_pessoa === 'delicado' ? 'assunto delicado' : 'pediu para falar com alguém'}`
      : d.motivo_regra
        ? MOTIVO_TEXTO[d.motivo_regra]
        : d.origem === 'pessoa'
          ? 'setor escolhido por uma pessoa do Atendimento'
          : `assunto entendido pelo integrante em ${l.perguntas_feitas} pergunta(s)`
  const trecho = l.ultimas_do_cliente.length > 280 ? `${l.ultimas_do_cliente.slice(0, 279)}…` : l.ultimas_do_cliente
  return `${quem}. Setor ${NOME_DO_SETOR[d.setor!]} (${como}). Última mensagem: “${trecho}”`
}

/** Responsável no setor: quem tem o cliente na carteira; senão, o responsável padrão do setor. */
async function responsavelNoSetor(tx: Tx, cliente_id: string | null, setor: SetorDestino) {
  const [cart] = cliente_id ? await tx`select usuario_id from carteira_cliente where cliente_id = ${cliente_id} and setor_id = ${setor} and arquivado_em is null limit 1` : []
  const [set] = await tx`select responsavel_padrao_id from setor where codigo = ${setor}`
  const [integ] = await tx`select id from integrante where setor = ${setor} and tipo = 'padrao_setor' and situacao = 'ativo' order by criado_em limit 1`
  return { responsavel_id: (cart?.usuario_id as string | undefined) ?? (set?.responsavel_padrao_id as string | null | undefined) ?? null, integrante_id: (integ?.id as string | undefined) ?? null }
}

/** Grava a fala da triagem na conversa (o conector envia as de status de entrega vazio). */
async function falar(tx: Tx, s: Estado, autor: { tipo: 'integrante' | 'sistema'; id: string | null }, corpo: string, extras: Record<string, unknown>) {
  await tx`insert into mensagem (escritorio_id, conversa_id, direcao, canal, autor_tipo, autor_id, corpo, extras)
           values (${s.execucao.escritorio_id}, ${s.entrada.conversa_id}, 'saida', 'whatsapp', ${autor.tipo}, ${autor.id}, ${corpo},
           ${tx.json({ ...extras, execucao_id: s.execucao.id } as never)})`
  await tx`update conversa set ultima_mensagem_em = now() where id = ${s.entrada.conversa_id}`
}

const caminho = (...acoes: Decisao['acao'][]) => (s: Estado) => !acoes.includes(decisao(s).acao)

const SAIDA = z
  .object({
    conversa_id: z.string(),
    acao: z.enum(['fora_do_horario', 'perguntar', 'repassar', 'pessoa']),
    setor: z.enum(SETORES_DE_DESTINO).nullable(),
    origem: Origem,
    motivo_regra: z.string().nullable(),
    motivo_pessoa: z.string().nullable(),
    perguntas: z.number().int(),
    retomar_em: z.string().nullable(),
    integrante_id: z.string().nullable(),
    responsavel_id: z.string().nullable(),
    cliente_id: z.string().nullable(),
  })
  .strict()

export const gesTriarRepassarV3: Procedimento = definirProcedimento(
  {
    id: 'GES-TRIAR-REPASSAR',
    versao: 3,
    nome: 'Triar conversa do número compartilhado',
    setor: 'gestao_atendimento',
    nivel_maximo: 'executar',
    operacao: 'atendimento.conversa.triar_e_repassar',
    descricao_modelo: 'Conversa com o cliente do número compartilhado até entender o assunto e repassa ao setor e ao integrante certos, com resumo; fora do horário, só a resposta automática.',
    entrada: z
      .object({
        conversa_id: z.string().min(1).max(80),
        setor_entrada: z.enum(SETORES_DE_DESTINO).optional(),
        /** Relógio da triagem (avaliação e reprocessamento); padrão: agora. */
        agora: z.string().datetime({ offset: true }).optional(),
      })
      .strict(),
    saida: SAIDA,
    orcamento: { centavos: 15, tokens: 16_000 },
    cliente: () => null,
    passos: [
      {
        tipo: 'deterministico',
        nome: 'ler_conversa',
        executar: async (s, { tx }): Promise<Lida> => {
          const setor_entrada = (s.entrada.setor_entrada ?? 'gestao_atendimento') as SetorDestino
          const agora = s.entrada.agora ? new Date(s.entrada.agora) : new Date()
          const [c] = await tx`select id, cliente_id, pessoa_id, setor_id, etiquetas from conversa where id = ${s.entrada.conversa_id}`
          if (!c) throw new ErroRegra('CONVERSA_INEXISTENTE', 'Conversa não encontrada.', 'conversa_id')
          if (c.setor_id !== setor_entrada || (c.etiquetas as string[]).includes('triada')) throw new ErroRegra('JA_TRIADA', 'A conversa já foi repassada a um setor.')
          const msgs = await tx`
            select direcao, autor_tipo, autor_id, corpo, extras from mensagem
            where conversa_id = ${c.id} and direcao in ('entrada', 'saida') and corpo is not null
            order by criado_em desc limit ${MAX_MENSAGENS_LIDAS}`
          const todas = [...msgs].reverse()
          // A resposta automática de fora do horário não conta como fala do escritório na conversa.
          const ordem = todas.filter((m) => (m.extras as { tipo?: string } | null)?.tipo !== 'fora_do_horario')
          if (!ordem.length || ordem.at(-1)!.direcao !== 'entrada') throw new ErroRegra('SEM_MENSAGEM_NOVA', 'A última fala é do escritório: a triagem espera o cliente.')

          const [esc] = await tx`select nome_fantasia, fuso_horario, configuracao from escritorio where id = ${s.execucao.escritorio_id}`
          const fuso = (esc?.fuso_horario as string | undefined) ?? 'America/Sao_Paulo'
          const horario = horarioDe(esc?.configuracao)
          const fora = !dentroDoHorario(agora, horario, fuso)
          const avisos = fora ? await tx`select 1 from mensagem where conversa_id = ${c.id} and extras->>'tipo' = 'fora_do_horario' and (extras->>'retomar_em')::timestamptz > ${agora} limit 1` : []

          // Quem escreve: a conversa ligada ao cliente; senão, o histórico da mesma pessoa.
          let cliente_id = (c.cliente_id as string | null) ?? null
          let identificado_por: Lida['identificado_por'] = cliente_id ? 'conversa' : null
          if (!cliente_id && c.pessoa_id) {
            const anteriores = await tx`select distinct cliente_id from conversa where pessoa_id = ${c.pessoa_id} and cliente_id is not null and id <> ${c.id} limit 2`
            if (anteriores.length === 1) {
              cliente_id = anteriores[0]!.cliente_id as string
              identificado_por = 'historico'
            }
          }
          const [cli] = cliente_id ? await tx`select nome from cliente where id = ${cliente_id}` : []

          // Conversa ligada a um setor nos últimos dias pula a triagem (como na v2).
          let regra: Lida['regra'] = null
          if (cliente_id) {
            const abertas = await tx`
              select distinct setor_id from conversa
              where cliente_id = ${cliente_id} and id <> ${c.id} and arquivado_em is null
                and (status <> 'resolvida' or ultima_mensagem_em > now() - interval '24 hours')
                and (setor_id <> ${setor_entrada} or 'triada' = any(etiquetas))
              limit 2`
            if (abertas.length === 1) regra = { setor: abertas[0]!.setor_id as SetorDestino, motivo: 'conversa_aberta' }
            if (!regra) {
              const [envio] = await tx`
                select cv.setor_id from mensagem m join conversa cv on cv.id = m.conversa_id
                where cv.cliente_id = ${cliente_id} and cv.id <> ${c.id} and m.direcao = 'saida' and m.autor_tipo in ('usuario', 'integrante', 'sistema')
                  and m.criado_em > now() - make_interval(days => ${DIAS_RESPOSTA_A_ENVIO})
                  and coalesce(m.extras->>'tipo', '') not in ('pergunta_triagem', 'triagem_conversa', 'fora_do_horario', 'aviso_repasse')
                order by m.criado_em desc limit 1`
              if (envio) regra = { setor: envio.setor_id as SetorDestino, motivo: 'resposta_a_envio' }
            }
            if (!regra) {
              const setores = await tx`select distinct setor_id from carteira_cliente where cliente_id = ${cliente_id} and arquivado_em is null and setor_id is not null limit 2`
              if (setores.length === 1) regra = { setor: setores[0]!.setor_id as SetorDestino, motivo: 'setor_unico' }
            }
            if (regra && !(SETORES_DE_DESTINO as readonly string[]).includes(regra.setor)) regra = null
          }
          const doCliente = ordem.filter((m) => m.direcao === 'entrada').map((m) => String(m.corpo)).join('\n')
          // Palavra-chave de um setor só decide, salvo com sinal de que a conversa pede cuidado de gente.
          if (!regra && !pedeCuidado(doCliente)) {
            const palavras = setoresPorPalavras(doCliente)
            if (palavras.length === 1) regra = { setor: palavras[0]!, motivo: 'palavra_chave' }
          }

          const ultimaSaida = ordem.findLastIndex((m) => m.direcao === 'saida')
          const ultimas = ordem.slice(ultimaSaida + 1).map((m) => String(m.corpo)).join('\n')
          const [integ] = await tx`select id, nome_exibido as nome from integrante where setor = ${setor_entrada} and tipo = 'padrao_setor' and situacao = 'ativo' order by criado_em limit 1`
          // Quem falou por último (com a resposta automática): decide se o prefixo se repete.
          const ult = todas.findLast((m) => m.direcao === 'saida') ?? null
          const nomeInteg = (integ?.nome as string | undefined) ?? 'Atendimento'
          const anterior: QuemFala | null =
            ult?.autor_tipo === 'integrante' && integ && ult.autor_id === integ.id
              ? { tipo: 'integrante', nome: nomeInteg }
              : ult?.autor_tipo === 'sistema'
                ? { tipo: 'sistema', escritorio: String(esc?.nome_fantasia ?? '') }
                : null
          return {
            conversa_id: c.id,
            setor_entrada,
            cliente_id,
            cliente_nome: (cli?.nome as string | undefined) ?? null,
            identificado_por,
            escritorio: String(esc?.nome_fantasia ?? 'Escritório'),
            fora_do_horario: fora,
            retomar_em: fora ? proximaAbertura(agora, horario, fuso).toISOString() : null,
            ja_avisou_fora: avisos.length > 0,
            horario_texto: textoDoHorario(horario),
            saudacao: saudacao(agora, fuso),
            conversa: ordem.map((m) => ({ de: m.direcao === 'entrada' ? ('cliente' as const) : ('escritorio' as const), texto: String(m.corpo).slice(0, 600) })),
            ultimas_do_cliente: ultimas,
            escritorio_ja_falou: ordem.some((m) => m.direcao === 'saida'),
            perguntas_feitas: ordem.filter((m) => m.direcao === 'saida' && (m.extras as { tipo?: string } | null)?.tipo === 'triagem_conversa').length,
            regra,
            integrante: { id: (integ?.id as string | undefined) ?? null, nome: nomeInteg },
            anterior,
          }
        },
      },
      // Fora do horário: resposta automática fixa, sem IA, e a triagem volta na primeira hora.
      {
        tipo: 'efeito',
        nome: 'fora_do_horario',
        ferramenta: 'conversa.triagem_responder',
        pular_se: (s) => !lida(s).fora_do_horario,
        executar: async (s, { tx, enfileirar }) => {
          const l = lida(s)
          if (!enfileirar) throw new ErroRegra('SEM_FILA', 'O motor não ofereceu a fila para retomar a triagem.')
          if (!l.ja_avisou_fora) {
            const texto = `Olá! Recebemos sua mensagem. Nosso horário de atendimento é ${l.horario_texto}. Assim que abrirmos, alguém responde por aqui.`
            await falar(tx, s, { tipo: 'sistema', id: null }, comQuemFala({ tipo: 'sistema', escritorio: l.escritorio }, texto, l.anterior), { tipo: 'fora_do_horario', retomar_em: l.retomar_em })
          }
          await tx`update conversa set etiquetas = (select array_agg(distinct e) from unnest(etiquetas || array['fora_do_horario']) e) where id = ${l.conversa_id}`
          await enfileirar(FILA_RETOMAR_TRIAGEM, { escritorio_id: s.execucao.escritorio_id, conversa_id: l.conversa_id }, { depois: new Date(l.retomar_em!), singleton: `${l.conversa_id}:${l.retomar_em}` })
          return { dados: { avisou: !l.ja_avisou_fora, retomar_em: l.retomar_em }, texto_evento: `Mensagem fora do horário: ${l.ja_avisou_fora ? 'cliente já avisado' : 'resposta automática enviada'}; a triagem retoma em ${l.retomar_em}` }
        },
      },
      {
        tipo: 'operario',
        nome: 'conversar',
        contrato: contratoConversa,
        pular_se: (s) => lida(s).fora_do_horario || lida(s).regra !== null,
        recebe: (s) => {
          const l = lida(s)
          return {
            conversa: l.conversa,
            cliente_conhecido: l.cliente_id !== null,
            saudacao: l.saudacao,
            escritorio_ja_falou: l.escritorio_ja_falou,
            perguntas_feitas: l.perguntas_feitas,
            setores: SETORES_DE_DESTINO.map((codigo) => ({ codigo, descricao: DESCRICAO[codigo] })),
          }
        },
      },
      {
        tipo: 'validar',
        nome: 'conferir',
        validadores: ['triagem_conversa_coerente', 'estilo_whatsapp', 'escopo_triagem', 'aviso_de_repasse', 'trocas_no_limite'],
        dados: (s) => ({ ...decidida(s), perguntas_feitas: lida(s).perguntas_feitas }),
        sobre: 'conversar',
        ao_falhar: 'escalar',
      },
      {
        tipo: 'deterministico',
        nome: 'decidir',
        executar: (s): Decisao => {
          const l = lida(s)
          const d = decidida(s)
          const integ: QuemFala = { tipo: 'integrante', nome: l.integrante.nome }
          const fala = (t: string) => comQuemFala(integ, t, l.anterior)
          if (d.origem === 'fora') return { acao: 'fora_do_horario', setor: null, origem: 'fora', motivo_regra: null, motivo_pessoa: null, confianca: null, mensagem: null }
          if (d.origem === 'regra') {
            const motivo = l.regra!.motivo
            // Contexto (conversa ligada a um setor): pula em silêncio; palavra-chave: aviso fixo.
            return { acao: 'repassar', setor: d.setor!, origem: 'regra', motivo_regra: motivo, motivo_pessoa: null, confianca: null, mensagem: motivo === 'palavra_chave' ? fala(avisoFixo(l, d.setor!)) : null }
          }
          if (d.origem === 'pessoa') {
            // Uma pessoa escolheu pelo cartão: o aviso ao cliente é o fixo, não o texto do cartão.
            if (d.acao === 'pessoa' || !d.setor) return { acao: 'pessoa', setor: l.setor_entrada, origem: 'pessoa', motivo_regra: null, motivo_pessoa: d.motivo_pessoa ?? 'pediu_pessoa', confianca: null, mensagem: null }
            return { acao: 'repassar', setor: d.setor, origem: 'pessoa', motivo_regra: null, motivo_pessoa: null, confianca: null, mensagem: fala(avisoFixo(l, d.setor)) }
          }
          if (d.acao === 'pessoa') return { acao: 'pessoa', setor: l.setor_entrada, origem: 'integrante', motivo_regra: null, motivo_pessoa: d.motivo_pessoa, confianca: d.confianca, mensagem: fala(d.mensagem!) }
          if (d.acao === 'repassar') return { acao: 'repassar', setor: d.setor!, origem: 'integrante', motivo_regra: null, motivo_pessoa: null, confianca: d.confianca, mensagem: fala(d.mensagem!) }
          return { acao: 'perguntar', setor: null, origem: 'integrante', motivo_regra: null, motivo_pessoa: null, confianca: d.confianca, mensagem: fala(d.mensagem!) }
        },
      },
      // Ainda sem certeza: a próxima fala da conversa (sem cartão: é só triagem).
      {
        tipo: 'efeito',
        nome: 'perguntar',
        ferramenta: 'conversa.triagem_responder',
        pular_se: caminho('perguntar'),
        executar: async (s, { tx }) => {
          const l = lida(s)
          await falar(tx, s, { tipo: 'integrante', id: l.integrante.id }, decisao(s).mensagem!, { tipo: 'triagem_conversa', pergunta: l.perguntas_feitas + 1 })
          await tx`update conversa set status = 'aguardando_cliente' where id = ${l.conversa_id}`
          return { dados: { pergunta: l.perguntas_feitas + 1 }, texto_evento: `Triagem: o integrante continuou a conversa (pergunta ${l.perguntas_feitas + 1} de no máximo ${MAX_PERGUNTAS_TRIAGEM})` }
        },
      },
      {
        tipo: 'aprovacao',
        nome: 'aprovar',
        ferramenta: 'conversa.rotear',
        exigida: 'por_regra',
        pular_se: caminho('repassar', 'pessoa'),
        esquema: z.object({ conversa_id: z.string(), setor: z.enum(SETORES_DE_DESTINO), resumo: z.string().max(600) }).strict(),
        argumentos: (s) => ({ conversa_id: s.entrada.conversa_id, setor: decisao(s).setor!, resumo: resumo(lida(s), decisao(s)) }),
        resumo: (s) => `Rotear a conversa ao setor ${NOME_DO_SETOR[decisao(s).setor!]}. ${resumo(lida(s), decisao(s))}`,
      },
      {
        tipo: 'efeito',
        nome: 'repassar',
        ferramenta: 'conversa.rotear',
        aprovacao: 'aprovar',
        pular_se: caminho('repassar', 'pessoa'),
        executar: async (s, { tx }) => {
          const a = (s.saidas.aprovar as { argumentos: { conversa_id: string; setor: SetorDestino; resumo: string } }).argumentos
          const l = lida(s)
          const d = decisao(s)
          const { responsavel_id, integrante_id } = await responsavelNoSetor(tx, l.cliente_id, a.setor)
          const etiquetas = ['triada', ...(d.acao === 'pessoa' ? ['precisa_pessoa'] : []), ...(d.motivo_pessoa === 'irritado' ? ['urgente'] : [])]
          const extras = { origem_roteamento: d.origem === 'integrante' ? 'integrante' : d.origem, triagem: { motivo_regra: d.motivo_regra, motivo_pessoa: d.motivo_pessoa, confianca: d.confianca, perguntas: l.perguntas_feitas, execucao_id: s.execucao.id } }
          const linhas = await tx`
            update conversa set setor_id = ${a.setor}, responsavel_id = ${responsavel_id}, resumo = ${a.resumo}, status = 'nova',
              cliente_id = coalesce(cliente_id, ${l.identificado_por === 'historico' ? l.cliente_id : null}),
              etiquetas = (select array_agg(distinct e) from unnest(etiquetas || ${etiquetas}::text[]) e),
              extras = coalesce(extras, '{}'::jsonb) || ${tx.json(extras as never)}
            where id = ${a.conversa_id} returning id`
          if (!linhas.length) throw new ErroRegra('CONVERSA_INEXISTENTE', 'A conversa sumiu enquanto era triada.')
          await tx`insert into mensagem (escritorio_id, conversa_id, direcao, canal, autor_tipo, autor_id, corpo, extras)
                   values (${s.execucao.escritorio_id}, ${a.conversa_id}, 'nota_interna', 'sistema', 'integrante', ${l.integrante.id}, ${a.resumo},
                   ${tx.json({ tipo: 'resumo_triagem', execucao_id: s.execucao.id } as never)})`
          if (integrante_id && d.acao === 'repassar')
            await tx`insert into item_fila (escritorio_id, integrante_id, tipo, status, enfileirado_em, prioridade, resumo)
                     values (${s.execucao.escritorio_id}, ${integrante_id}, 'conversa_repassada', 'pendente', now(), 30,
                     ${tx.json({ conversa_id: a.conversa_id, setor: a.setor, resumo: a.resumo, origem: d.origem } as never)})`
          return {
            dados: { setor: a.setor, integrante_id: d.acao === 'repassar' ? integrante_id : null, responsavel_id },
            texto_evento: `Conversa roteada ao setor ${a.setor} (${d.origem}${d.motivo_regra ? `: ${d.motivo_regra}` : ''}${d.acao === 'pessoa' ? `, precisa de pessoa: ${d.motivo_pessoa}` : ''}, ${l.perguntas_feitas} pergunta(s))`,
          }
        },
      },
      // Avisa o cliente do repasse, de forma natural (sem cartão: é só triagem).
      {
        tipo: 'efeito',
        nome: 'avisar',
        ferramenta: 'conversa.triagem_responder',
        pular_se: (s) => !['repassar', 'pessoa'].includes(decisao(s).acao) || !decisao(s).mensagem,
        executar: async (s, { tx }) => {
          const l = lida(s)
          await falar(tx, s, { tipo: 'integrante', id: l.integrante.id }, decisao(s).mensagem!, { tipo: 'aviso_repasse' })
          return { dados: { avisado: true }, texto_evento: `Triagem: cliente avisado do repasse ao setor ${decisao(s).setor}` }
        },
      },
      {
        tipo: 'concluir',
        nome: 'concluir',
        saida: (s): z.infer<typeof SAIDA> => {
          const l = lida(s)
          const d = decisao(s)
          const r = s.saidas.repassar as { pulado?: boolean; integrante_id?: string | null; responsavel_id?: string | null }
          const roteou = r && !r.pulado
          return {
            conversa_id: s.entrada.conversa_id,
            acao: d.acao,
            setor: d.setor,
            origem: d.origem,
            motivo_regra: d.motivo_regra,
            motivo_pessoa: d.motivo_pessoa,
            perguntas: l.perguntas_feitas + (d.acao === 'perguntar' ? 1 : 0),
            retomar_em: l.retomar_em,
            integrante_id: roteou ? (r.integrante_id ?? null) : null,
            responsavel_id: roteou ? (r.responsavel_id ?? null) : null,
            cliente_id: l.cliente_id,
          }
        },
        acordar: (s) => {
          const d = decisao(s)
          if (d.acao === 'perguntar' || d.acao === 'fora_do_horario') return null
          return { titulo: d.acao === 'pessoa' ? 'Conversa precisa de uma pessoa do Atendimento' : `Conversa repassada ao setor ${d.setor}`, dados: { conversa_id: s.entrada.conversa_id, setor: d.setor } }
        },
      },
    ],
  },
  resolverCom(),
) as unknown as Procedimento

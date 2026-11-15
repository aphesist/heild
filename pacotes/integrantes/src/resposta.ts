import { z } from 'zod'

/**
 * O formato padrão de resposta (decisão 4): todo integrante de setor e o roteamento respondem
 * assim, e o Assistente encaminha o objeto como veio, sem reescrever. Formato e tom são do
 * sistema, por processo: o modelo não escreve tabela, número nem o texto da resposta. Os
 * números vêm do dado (cartões visuais e `dados`), nunca de um texto gerado.
 */

const CartaoVisual = z.discriminatedUnion('tipo', [
  z.object({ tipo: z.literal('tabela'), titulo: z.string().max(120), colunas: z.array(z.string()).max(12), linhas: z.array(z.array(z.union([z.string(), z.number()]))).max(50) }).strict(),
  z.object({ tipo: z.literal('lista'), titulo: z.string().max(120), itens: z.array(z.string().max(300)).max(30) }).strict(),
  z.object({ tipo: z.literal('aviso'), titulo: z.string().max(120), texto: z.string().max(600) }).strict(),
])

export const TipoResposta = z.enum([
  'concluido',
  'aguardando_aprovacao',
  'nao_consegui',
  'na_fila',
  'em_execucao',
  'falhou',
  'cancelado',
  'pergunta',
  'sem_procedimento',
  'negado',
])
export type TipoResposta = z.infer<typeof TipoResposta>

const Valor = z.union([z.string().max(300), z.number(), z.boolean(), z.null()])

/**
 * Feedforward e lacunas (padrão adotado pelo Enzo na interface, 15/11/2026): antes de agir, o
 * integrante mostra o que SUPÔS para a pessoa corrigir; num rascunho, deixa LACUNA no que não sabe,
 * em vez de inventar. As opções vêm sempre dos dados (as candidatas que o código extraiu), nunca de
 * texto livre do modelo.
 */
export const TipoDado = z.enum(['cliente', 'competencia', 'valor', 'setor', 'procedimento', 'canal', 'documento', 'data', 'quantidade', 'categoria', 'texto'])
export type TipoDado = z.infer<typeof TipoDado>
const Opcao = z.object({ valor: Valor, rotulo: z.string().max(120) }).strict()

export const Suposicao = z
  .object({
    campo: z.string().max(60),
    rotulo: z.string().max(120),
    valor: Valor,
    tipo: TipoDado,
    /** As alternativas que os dados oferecem (a pessoa corrige escolhendo uma). */
    opcoes: z.array(Opcao).max(12),
    /** `regra` (código), `modelo` (operário ou roteador), `pessoa` (alguém já decidiu) ou `pedido` (veio do que a pessoa anexou ou escreveu). */
    origem: z.enum(['regra', 'modelo', 'pessoa', 'pedido']),
    confianca: z.number().min(0).max(1).nullable(),
  })
  .strict()
export type Suposicao = z.infer<typeof Suposicao>

export const Lacuna = z
  .object({
    /** Identifica a lacuna ao preencher (o nome do campo). */
    id: z.string().max(60),
    campo: z.string().max(60),
    rotulo: z.string().max(120),
    tipo: TipoDado,
    /** Onde a lacuna aparece em `texto` (o marcador "[rótulo]"), em caracteres; null se não aparece. */
    posicao: z.object({ inicio: z.number().int().nonnegative(), fim: z.number().int().nonnegative() }).strict().nullable(),
    opcoes: z.array(Opcao).max(12),
  })
  .strict()
export type Lacuna = z.infer<typeof Lacuna>

const camposV1 = {
    de: z.object({ tipo: z.enum(['integrante', 'assistente']), id: z.string(), setor: z.string(), nome: z.string() }).strict(),
    tipo: TipoResposta,
    titulo: z.string().min(1).max(120),
    texto: z.string().max(600),
    cartoes: z.array(CartaoVisual).max(6),
    /** O cartão que espera uma pessoa (aprovação, "não consegui", escolha de responsável). */
    acao: z
      .object({ cartao_id: z.string(), tipo: z.string(), resumo_humano: z.string().max(1000), expira_em: z.string().nullable() })
      .strict()
      .nullable(),
    /** Na pergunta: as opções que a pessoa escolhe (setor ou procedimento), nunca texto livre do modelo. */
    opcoes: z.array(z.object({ id: z.string(), rotulo: z.string().max(120) }).strict()).max(10),
    dados: z.record(z.string(), Valor),
    origem: z
      .object({
        procedimento: z.string().nullable(),
        execucao_id: z.string().nullable(),
        pedido_id: z.string().nullable(),
        posicao_na_fila: z.number().int().nullable(),
      })
      .strict(),
    custo: z.object({ centavos: z.number().nonnegative(), chamadas: z.number().int().nonnegative() }).strict(),
    /** Confiança do operário quando ele decidiu; nula quando a regra ou uma pessoa decidiu. */
    confianca: z.number().min(0).max(1).nullable(),
    escalou: z.boolean(),
}

/** A versão anterior, sem suposições nem lacunas: continua aceita na leitura e pode ser pedida. */
export const RespostaPadraoV1 = z.object({ formato: z.literal('heild.resposta@1'), ...camposV1 }).strict()
export type RespostaPadraoV1 = z.infer<typeof RespostaPadraoV1>

export const RespostaPadrao = z
  .object({
    formato: z.literal('heild.resposta@2'),
    ...camposV1,
    suposicoes: z.array(Suposicao).max(20),
    lacunas: z.array(Lacuna).max(10),
  })
  .strict()
export type RespostaPadrao = z.infer<typeof RespostaPadrao>
export const FORMATOS_RESPOSTA = ['heild.resposta@1', 'heild.resposta@2'] as const

/** Lê qualquer versão e devolve a atual (a @1 vira @2 sem suposições nem lacunas). */
export function lerResposta(x: unknown): RespostaPadrao {
  const v1 = RespostaPadraoV1.safeParse(x)
  if (v1.success) return { ...v1.data, formato: 'heild.resposta@2', suposicoes: [], lacunas: [] }
  return RespostaPadrao.parse(x)
}

/** Para quem ainda lê a @1: tira os campos novos. */
export function noFormato(r: RespostaPadrao, formato: (typeof FORMATOS_RESPOSTA)[number] = 'heild.resposta@2'): RespostaPadrao | RespostaPadraoV1 {
  if (formato === 'heild.resposta@2') return r
  const { suposicoes: _s, lacunas: _l, ...resto } = r
  return RespostaPadraoV1.parse({ ...resto, formato: 'heild.resposta@1' })
}

/** Textos fixos por tipo: o tom é do sistema (curto, direto, sem promessas). */
export const TEXTO_PADRAO: Record<TipoResposta, (x: { titulo: string; resumo?: string; posicao?: number | null; motivo?: string }) => string> = {
  concluido: ({ titulo }) => `${titulo}.`,
  aguardando_aprovacao: ({ resumo }) => `Preparei e falta a sua aprovação: ${resumo ?? ''}`.trim(),
  nao_consegui: ({ resumo }) => `Não consegui decidir sozinho. ${resumo ?? ''}`.trim(),
  na_fila: ({ posicao }) => (posicao ? `Seu pedido está na fila do setor, na posição ${posicao}.` : 'Seu pedido está na fila do setor.'),
  em_execucao: () => 'Estou trabalhando nisso. Aviso quando terminar.',
  falhou: ({ motivo }) => `Parei: ${motivo ?? 'erro sem descrição.'}`,
  cancelado: ({ motivo }) => `Encerrado: ${motivo ?? 'sem motivo registrado.'}`,
  pergunta: ({ motivo }) => `Preciso de uma informação antes de começar: ${motivo ?? ''}`.trim(),
  sem_procedimento: () => 'Ainda não há um procedimento para este pedido. Ele ficou registrado para a equipe.',
  negado: ({ motivo }) => `Não posso fazer isso: ${motivo ?? 'sem permissão.'}`,
}

const cortar = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s)

/** Monta e valida uma resposta padrão (a validação garante o formato em todo integrante). */
type Opcionais = 'texto' | 'cartoes' | 'acao' | 'opcoes' | 'dados' | 'custo' | 'confianca' | 'escalou' | 'suposicoes' | 'lacunas'
export function resposta(r: Omit<RespostaPadrao, 'formato' | Opcionais> & Partial<Pick<RespostaPadrao, Opcionais>> & { resumo?: string; motivo?: string }): RespostaPadrao {
  const { resumo, motivo, ...resto } = r
  let texto = cortar(r.texto ?? TEXTO_PADRAO[r.tipo]({ titulo: r.titulo, resumo, motivo, posicao: r.origem.posicao_na_fila }), 600)
  // Cada lacuna aparece no texto como "[rótulo]", e a posição aponta para o marcador.
  const lacunas = (r.lacunas ?? []).map((l) => {
    const marcador = `[${l.rotulo}]`
    if (!texto.includes(marcador) && texto.length + marcador.length + 8 <= 600) texto = `${texto}${texto.includes(' Falta: ') ? ',' : ' Falta:'} ${marcador}`
    const inicio = texto.indexOf(marcador)
    return { ...l, posicao: inicio >= 0 ? { inicio, fim: inicio + marcador.length } : null }
  })
  if (lacunas.length && !texto.endsWith('.')) texto = `${texto}.`
  return RespostaPadrao.parse({
    formato: 'heild.resposta@2',
    suposicoes: [],
    cartoes: [],
    acao: null,
    opcoes: [],
    dados: {},
    custo: { centavos: 0, chamadas: 0 },
    confianca: null,
    escalou: false,
    ...resto,
    lacunas,
    titulo: cortar(r.titulo, 120),
    texto,
  })
}

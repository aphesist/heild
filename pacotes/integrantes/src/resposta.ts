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

export const RespostaPadrao = z
  .object({
    formato: z.literal('heild.resposta@1'),
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
  })
  .strict()
export type RespostaPadrao = z.infer<typeof RespostaPadrao>

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
export function resposta(r: Omit<RespostaPadrao, 'formato' | 'texto' | 'cartoes' | 'acao' | 'opcoes' | 'dados' | 'custo' | 'confianca' | 'escalou'> &
  Partial<Pick<RespostaPadrao, 'texto' | 'cartoes' | 'acao' | 'opcoes' | 'dados' | 'custo' | 'confianca' | 'escalou'>> & { resumo?: string; motivo?: string }): RespostaPadrao {
  const { resumo, motivo, ...resto } = r
  const texto = r.texto ?? TEXTO_PADRAO[r.tipo]({ titulo: r.titulo, resumo, motivo, posicao: r.origem.posicao_na_fila })
  return RespostaPadrao.parse({
    formato: 'heild.resposta@1',
    cartoes: [],
    acao: null,
    opcoes: [],
    dados: {},
    custo: { centavos: 0, chamadas: 0 },
    confianca: null,
    escalou: false,
    ...resto,
    titulo: cortar(r.titulo, 120),
    texto: cortar(texto, 600),
  })
}

import { z } from 'zod'
import { definirContrato } from '../operarios/contrato.ts'
import { definirValidador } from '../validadores/registro.ts'

/**
 * O revisor de risco (decisão 3: Opus como revisor; AVALIAÇÃO 7.1, camada 4). Entra só antes de ato
 * irreversível (transmitir ao governo, enviar ao cliente): recebe o resumo COMPACTO do que vai sair
 * (o ato, a decisão, as evidências que o sistema conferiu e, quando há, o trecho do documento) e
 * responde `aprova` ou `devolve` com o motivo. Ele não decide sozinho nem substitui a pessoa: o
 * cartão humano continua obrigatório. Se devolver, o caso vai ao cartão "não consegui" com o motivo,
 * e uma pessoa decide.
 */
export const contratoRevisar = definirContrato({
  id: 'revisor.ato_irreversivel',
  versao: 1,
  classe: 'revisor',
  // Provisória: o prompt é da frente de IA (pacotes/contratos-ia).
  instrucao:
    'Você é o revisor de risco de um escritório de contabilidade. Recebe um ato irreversível pronto para sair ' +
    '(transmitir ao governo ou enviar ao cliente): o resumo escrito pelo sistema, a decisão tomada e as evidências que o sistema já conferiu. ' +
    'Confira se a decisão é coerente com as evidências e com o trecho do documento, quando houver. ' +
    'Uma pessoa ainda vai aprovar o ato num cartão e verá os pontos de atenção apontados: ponto de atenção não é motivo para devolver. ' +
    'Responda "aprova" se nada indica erro no próprio ato. Responda "devolve" com um motivo curto e concreto só se as evidências contradizem a decisão, ' +
    'ou se o ato pode sair com cliente, arquivo, valor, tributo, competência ou prazo errado. ' +
    'Não refaça cálculos nem escreva valores novos: os números vêm do sistema.',
  recebe: z
    .object({
      ato: z.string().max(80),
      resumo: z.string().max(1000),
      decisao: z.record(z.string(), z.union([z.string().max(300), z.number(), z.boolean(), z.null()])),
      evidencias: z.array(z.object({ rotulo: z.string().max(80), valor: z.string().max(300) }).strict()).max(30),
      trecho: z.string().max(2000).optional(),
    })
    .strict(),
  devolve: z.object({ decisao: z.enum(['aprova', 'devolve']), motivo: z.string().min(3).max(240) }).strict(),
  max_tokens_saida: 200,
  campos_externos: ['trecho'],
})

definirValidador({
  nome: 'revisao_aprovou',
  versao: 1,
  descricao: 'O revisor de risco aprovou o ato (ou uma pessoa decidiu no lugar dele).',
  dados: z.object({ revisao: z.object({ decisao: z.string().optional(), motivo: z.string().optional(), pulado: z.boolean().optional(), origem: z.string().optional() }).loose().nullable() }),
  conferir: ({ revisao }) =>
    !revisao || revisao.pulado || revisao.decisao === 'aprova'
      ? { ok: true }
      : { ok: false, codigo: 'REVISOR_DEVOLVEU', mensagem: `O revisor devolveu: ${revisao.motivo ?? 'sem motivo'}` },
})

/** A linha do resumo do cartão com o parecer do revisor (o cartão mostra quem revisou e o que disse). */
export function linhaDaRevisao(revisao: { decisao?: string; motivo?: string; pulado?: boolean; origem?: string } | undefined) {
  if (!revisao || revisao.pulado) return ''
  if (revisao.origem === 'pessoa') return ` Revisão: uma pessoa liberou (${revisao.motivo ?? 'sem motivo'}).`
  return ` Revisor de risco: ${revisao.decisao === 'aprova' ? 'aprovou' : 'devolveu'} (${revisao.motivo ?? ''}).`
}

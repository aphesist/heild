import { z } from 'zod'
import { definirContrato } from '@heild/processos'
import { procedimentoDeEscolha } from '../escolha.ts'
import { resolverCom } from '../metas.ts'

/**
 * Societário. SOC-ALTERACAO-TRIAR: o pedido de alteração contratual do cliente é classificado
 * (endereço, entrada ou saída de sócio, capital, atividade, nome empresarial) e o código decide,
 * por tabela, se a alteração exige processo na Junta. Abrir o processo passa pela lista do escritório
 * ou pelo cartão.
 */

export const TIPOS_ALTERACAO = ['endereco', 'entrada_socio', 'saida_socio', 'capital_social', 'atividade', 'nome_empresarial', 'outro'] as const
/** Tabela do setor (código, não modelo): o que exige processo na Junta Comercial. */
export const EXIGE_JUNTA: Record<(typeof TIPOS_ALTERACAO)[number], boolean> = {
  endereco: true,
  entrada_socio: true,
  saida_socio: true,
  capital_social: true,
  atividade: true,
  nome_empresarial: true,
  outro: false,
}

export const contratoAlteracao = definirContrato({
  id: 'soc.alteracao.classificar',
  versao: 1,
  classe: 'operario',
  instrucao:
    'Você lê um pedido de cliente ao setor societário e classifica o tipo de alteração contratual entre as opções. ' +
    'Se o pedido não é de alteração contratual, use "outro". Se pedir mais de uma alteração ou não der para saber, use confiança baixa.',
  recebe: z.object({ trecho: z.string().max(2000), tipos: z.array(z.string()).length(7) }).strict(),
  devolve: z.object({ tipo_alteracao: z.enum(TIPOS_ALTERACAO), confianca: z.number().min(0).max(1), motivo: z.string().min(3).max(140) }).strict(),
  max_tokens_saida: 100,
  campos_externos: ['trecho'],
})

const rotulo: Record<string, string> = {
  endereco: 'mudança de endereço',
  entrada_socio: 'entrada de sócio',
  saida_socio: 'saída de sócio',
  capital_social: 'alteração do capital social',
  atividade: 'mudança de atividade',
  nome_empresarial: 'mudança do nome empresarial',
  outro: 'pedido sem alteração contratual',
}

export const socAlteracao = procedimentoDeEscolha({
  id: 'SOC-ALTERACAO-TRIAR',
  versao: 1,
  nome: 'Triar pedido de alteração contratual',
  setor: 'societario',
  operacao: 'societario.alteracao.triar',
  descricao_modelo: 'Classifica o pedido de alteração contratual e abre o processo de legalização quando exige Junta.',
  tipos_documento: ['mensagem', 'email', 'solicitacao'],
  contrato: contratoAlteracao,
  campos: ['tipo_alteracao'],
  chave_metadados: 'alteracao_contratual',
  ler: (d) => ({ tipo: d.tipo, candidatas: { tipo_alteracao: [...TIPOS_ALTERACAO] }, regra: null, trecho: d.texto, contexto: {} }),
  recebe: (l) => ({ trecho: l.trecho, tipos: l.candidatas.tipo_alteracao as string[] }),
  validadores: ['escolha_nas_candidatas', 'confianca_minima:0.9'],
  aprovacao: {
    ferramenta: 'legalizacao.abrir_processo',
    exigida: 'por_regra',
    resumo: (e) => {
      const t = String(e.tipo_alteracao) as keyof typeof EXIGE_JUNTA
      return `${rotulo[t] ?? t}: ${EXIGE_JUNTA[t] ? 'abrir processo de legalização na Junta' : 'registrar sem processo na Junta'}.`
    },
  },
  orcamento: { centavos: 8, tokens: 8_000 },
  resolver: resolverCom(),
})

export const rotuloAlteracao = rotulo

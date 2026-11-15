/**
 * Gabarito do teste agêntico real (docs/backend/IMPLEMENTACAO.md, B2 › Teste agêntico real).
 * Casos com resposta conhecida, escritos para forçar o caminho do OPERÁRIO (sem campo estruturado
 * que a regra resolva). Dados fictícios. A frente de IA amplia com casos reais anonimizados e com
 * cartões editados por pessoas (02, 14.2).
 *
 * `esperado`: a competência certa, ou 'cartao' quando o certo é NÃO decidir (dúvida legítima: o
 * procedimento deve parar num cartão "não consegui", nunca chutar). Classificar errado é o erro
 * crítico; ir ao cartão num caso decidível é perda de produtividade, não erro.
 */

export interface CasoCompetencia {
  id: string
  tipo: string
  texto: string
  esperado: string | 'cartao'
}

/** Os textos citam meses passados em relação a novembro de 2026 (data da semente). */
export const casosCompetencia: CasoCompetencia[] = [
  { id: 'aluguel-ref', tipo: 'recibo', texto: 'Recibo de aluguel referente a 08/2026. Pago em 05/09/2026.', esperado: '2026-08' },
  { id: 'condominio', tipo: 'boleto', texto: 'Taxa condominial competência 09/2026. Vencimento 10/10/2026.', esperado: '2026-09' },
  { id: 'energia', tipo: 'conta_consumo', texto: 'Conta de energia. Período de leitura 03/08/2026 a 02/09/2026. Referência 08/2026. Vencimento 15/09/2026.', esperado: '2026-08' },
  { id: 'pro-labore', tipo: 'recibo', texto: 'Recibo de pró-labore do mês 10/2026, pago em 05/11/2026.', esperado: '2026-10' },
  { id: 'internet', tipo: 'fatura', texto: 'Fatura de internet referente ao período 07/2026. Emitida em 01/08/2026.', esperado: '2026-07' },
  { id: 'reembolso', tipo: 'recibo', texto: 'Reembolso de despesas de viagem realizadas em 22/09/2026. Pago em 03/10/2026.', esperado: '2026-09' },
  { id: 'honorarios', tipo: 'recibo', texto: 'Honorários contábeis competência 10/2026. Recebido em 10/11/2026.', esperado: '2026-10' },
  { id: 'seguro', tipo: 'apolice', texto: 'Parcela 3/12 do seguro empresarial. Vencimento 20/09/2026.', esperado: '2026-09' },
  // Dúvida legítima: duas referências sem indicação de qual vale; o certo é parar no cartão.
  { id: 'duas-datas', tipo: 'recibo', texto: 'Recebemos o valor combinado. 04/2026 e 06/2026.', esperado: 'cartao' },
  { id: 'sem-referencia', tipo: 'recibo', texto: 'Recebi a importância acima pelos serviços prestados.', esperado: 'cartao' },
]

export interface CasoEcd {
  id: string
  /** Conta plantada com variação anormal que DEVE aparecer nos apontamentos. */
  deve_apontar: string[]
}

export const casosEcd: CasoEcd[] = [{ id: 'adiantamento-socios', deve_apontar: ['1.1.05'] }]

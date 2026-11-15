import { createHash } from 'node:crypto'
import { casosCompetencia, casosEcd } from '../../../processos/testes/gabarito/contabil.ts'
import type { CasoGabarito } from './avaliar.ts'

/**
 * Gabarito por setor (dados fictícios, datas antes de 15/11/2026). Escrito para forçar o caminho do
 * OPERÁRIO (sem o campo estruturado que a regra resolveria), mais alguns casos de regra e casos em
 * que o certo é NÃO decidir (`cartao`). A frente de IA amplia com casos reais anonimizados e com os
 * cartões editados por pessoas (02, 14.2). `pessoa` é o que a pessoa fez no caso, para a margem.
 */

/** A ECD do gabarito: fecha por regra, com o adiantamento a sócios que sobe 900% plantado (o mesmo da B2). */
export function ecdComAdiantamento(cnpj: string) {
  const contas = [
    { codigo: '1.1.01', nome: 'Caixa', natureza: 'D', saldo_inicial_centavos: 1_000_000, debitos_centavos: 5_000_000, creditos_centavos: 4_000_000, saldo_final_centavos: 2_000_000 },
    { codigo: '1.1.02', nome: 'Bancos', natureza: 'D', saldo_inicial_centavos: 5_000_000, debitos_centavos: 3_000_000, creditos_centavos: 3_400_000, saldo_final_centavos: 4_600_000 },
    { codigo: '1.1.05', nome: 'Adiantamento a sócios', natureza: 'D', saldo_inicial_centavos: 100_000, debitos_centavos: 900_000, creditos_centavos: 0, saldo_final_centavos: 1_000_000 },
    { codigo: '2.1.01', nome: 'Fornecedores', natureza: 'C', saldo_inicial_centavos: 2_000_000, debitos_centavos: 1_500_000, creditos_centavos: 2_000_000, saldo_final_centavos: 2_500_000 },
    { codigo: '3.1.01', nome: 'Receita de vendas', natureza: 'C', saldo_inicial_centavos: 0, debitos_centavos: 0, creditos_centavos: 5_000_000, saldo_final_centavos: 5_000_000 },
    { codigo: '4.1.01', nome: 'Custo das mercadorias', natureza: 'D', saldo_inicial_centavos: 4_000_000, debitos_centavos: 4_000_000, creditos_centavos: 0, saldo_final_centavos: 8_000_000 },
  ]
  const d = contas.reduce((a, c) => a + c.debitos_centavos, 0)
  const k = contas.reduce((a, c) => a + c.creditos_centavos, 0)
  return { cnpj, exercicio: '2025', contas, total_debitos_centavos: d, total_creditos_centavos: k }
}

const t = (texto: string, extra: Record<string, unknown> = {}) => ({ texto_extraido: texto, ...extra })

export const gabaritoContabil: CasoGabarito[] = [
  ...casosCompetencia.map((c) => ({ id: `ctb-${c.id}`, setor: 'contabil', procedimento: 'CTB-COMPETENCIA-DOC', documento: { tipo: c.tipo, metadados: t(c.texto) }, esperado: c.esperado, pessoa: c.esperado })),
  ...casosEcd.map((c) => ({ id: `ecd-${c.id}`, setor: 'contabil', procedimento: 'CTB-ECD-TRANSMITIR', documento: { tipo: 'ecd', metadados: ({ cnpj }: { cnpj: string }) => ({ ecd: ecdComAdiantamento(cnpj) }) }, entrada_extra: { exercicio: '2025' }, esperado: `contem:${c.deve_apontar.join(',')}` })),
]

export const gabaritoFiscal: CasoGabarito[] = [
  { id: 'guia-das', setor: 'fiscal', procedimento: 'FIS-GUIA-CONFERIR', documento: { tipo: 'guia', metadados: t('Documento de Arrecadação do Simples Nacional (DAS). Período de apuração: 10/2026. Vencimento: 20/11/2026.', { valor_centavos: 123456, apuracao: { DAS: { '2026-10': 123456 } } }) }, esperado: 'DAS:2026-10', pessoa: 'DAS:2026-10' },
  { id: 'guia-irpj-codigo', setor: 'fiscal', procedimento: 'FIS-GUIA-CONFERIR', documento: { tipo: 'guia', metadados: t('DARF - Documento de Arrecadação de Receitas Federais.', { codigo_receita: '2089', competencia: '2026-09', valor_centavos: 870000, apuracao: { IRPJ: { '2026-09': 870000 } } }) }, esperado: 'IRPJ:2026-09', pessoa: 'IRPJ:2026-09' },
  { id: 'guia-csll', setor: 'fiscal', procedimento: 'FIS-GUIA-CONFERIR', documento: { tipo: 'guia', metadados: t('DARF. Código da receita 2372 - CSLL. Período de apuração 30/09/2026. Vencimento 31/10/2026.', { valor_centavos: 50000, apuracao: { CSLL: { '2026-09': 50000 } } }) }, esperado: 'CSLL:2026-09', pessoa: 'CSLL:2026-09' },
  { id: 'guia-gps', setor: 'fiscal', procedimento: 'FIS-GUIA-CONFERIR', documento: { tipo: 'guia', metadados: t('GPS - Guia da Previdência Social. Competência 10/2026. Vencimento 20/11/2026.', { valor_centavos: 330000, apuracao: { INSS: { '2026-10': 330000 } } }) }, esperado: 'INSS:2026-10', pessoa: 'INSS:2026-10' },
  // O valor da guia não bate com a apuração: o certo é parar no cartão, nunca enviar.
  { id: 'guia-valor-divergente', setor: 'fiscal', procedimento: 'FIS-GUIA-CONFERIR', documento: { tipo: 'guia', metadados: t('Documento de Arrecadação do Simples Nacional (DAS). Período de apuração: 10/2026.', { valor_centavos: 100000, apuracao: { DAS: { '2026-10': 123456 } } }) }, esperado: 'cartao', pessoa: 'cartao' },
  { id: 'cp-intimacao', setor: 'fiscal', procedimento: 'FIS-CAIXA-POSTAL-TRIAR', documento: { tipo: 'mensagem_ecac', metadados: t('Termo de Intimação Fiscal nº 123/2026. Fica o contribuinte intimado a apresentar, até 30/11/2026, os livros fiscais do ano-calendário de 2025.') }, esperado: 'intimacao:2026-11-30', pessoa: 'intimacao:2026-11-30' },
  { id: 'cp-exclusao', setor: 'fiscal', procedimento: 'FIS-CAIXA-POSTAL-TRIAR', documento: { tipo: 'mensagem_ecac', metadados: t('Comunicado de exclusão do Simples Nacional por débitos pendentes. O contribuinte poderá regularizar os débitos até 15/12/2026.') }, esperado: 'exclusao_simples:2026-12-15', pessoa: 'exclusao_simples:2026-12-15' },
  { id: 'cp-malha', setor: 'fiscal', procedimento: 'FIS-CAIXA-POSTAL-TRIAR', documento: { tipo: 'mensagem_ecac', metadados: t('Notificação de pendência: a declaração caiu em malha fiscal. Prazo para autorregularização: 10/12/2026.') }, esperado: 'malha:2026-12-10', pessoa: 'malha:2026-12-10' },
  { id: 'cp-informativo', setor: 'fiscal', procedimento: 'FIS-CAIXA-POSTAL-TRIAR', documento: { tipo: 'mensagem_ecac', metadados: t('Informamos que o novo layout do portal e-CAC estará disponível a partir de 01/12/2026. Nenhuma ação é necessária.') }, esperado: 'informativo:-', pessoa: 'informativo:-' },
  { id: 'cp-cobranca', setor: 'fiscal', procedimento: 'FIS-CAIXA-POSTAL-TRIAR', documento: { tipo: 'mensagem_ecac', metadados: t('Aviso de cobrança: há débito de PIS em aberto. Pague até 28/11/2026 para evitar a inscrição em dívida ativa.') }, esperado: 'cobranca:2026-11-28', pessoa: 'cobranca:2026-11-28' },
]

export const gabaritoDp: CasoGabarito[] = [
  { id: 'dp-hora-extra', setor: 'dp', procedimento: 'DP-EVENTO-FOLHA', documento: { tipo: 'mensagem', metadados: t('O Pedro fez 10 horas extras em 10/2026, favor incluir na folha.') }, esperado: 'hora_extra:2026-10:10', pessoa: 'hora_extra:2026-10:10' },
  { id: 'dp-falta', setor: 'dp', procedimento: 'DP-EVENTO-FOLHA', documento: { tipo: 'mensagem', metadados: t('A Maria faltou 2 dias em 09/2026, sem atestado.') }, esperado: 'falta:2026-09:2', pessoa: 'falta:2026-09:2' },
  { id: 'dp-adiantamento', setor: 'dp', procedimento: 'DP-EVENTO-FOLHA', documento: { tipo: 'mensagem', metadados: t('Favor lançar um adiantamento de 500 reais para o João na folha de 11/2026.') }, esperado: 'adiantamento:2026-11:500', pessoa: 'adiantamento:2026-11:500' },
  { id: 'dp-ferias', setor: 'dp', procedimento: 'DP-EVENTO-FOLHA', documento: { tipo: 'mensagem', metadados: t('O Carlos vai tirar férias. Lançar as férias dele na folha de 11/2026.') }, esperado: 'ferias:2026-11:-', pessoa: 'ferias:2026-11:-' },
  // Dois eventos no mesmo pedido: o certo é não decidir sozinho.
  { id: 'dp-dois-eventos', setor: 'dp', procedimento: 'DP-EVENTO-FOLHA', documento: { tipo: 'mensagem', metadados: t('Na folha de 10/2026: o Pedro fez 5 horas extras e a Ana faltou 1 dia.') }, esperado: 'cartao', pessoa: 'cartao' },
]

export const gabaritoSocietario: CasoGabarito[] = [
  { id: 'soc-endereco', setor: 'societario', procedimento: 'SOC-ALTERACAO-TRIAR', documento: { tipo: 'mensagem', metadados: t('Queremos mudar o endereço da sede da empresa para a Rua Nova, número 100.') }, esperado: 'endereco', pessoa: 'endereco' },
  { id: 'soc-entrada', setor: 'societario', procedimento: 'SOC-ALTERACAO-TRIAR', documento: { tipo: 'mensagem', metadados: t('O Paulo vai entrar na sociedade com 20% das quotas. O que precisamos fazer?') }, esperado: 'entrada_socio', pessoa: 'entrada_socio' },
  { id: 'soc-capital', setor: 'societario', procedimento: 'SOC-ALTERACAO-TRIAR', documento: { tipo: 'mensagem', metadados: t('Precisamos aumentar o capital social da empresa este mês.') }, esperado: 'capital_social', pessoa: 'capital_social' },
  { id: 'soc-atividade', setor: 'societario', procedimento: 'SOC-ALTERACAO-TRIAR', documento: { tipo: 'mensagem', metadados: t('Vamos começar a prestar consultoria. Dá para incluir essa nova atividade no contrato social?') }, esperado: 'atividade', pessoa: 'atividade' },
  { id: 'soc-nao-e-alteracao', setor: 'societario', procedimento: 'SOC-ALTERACAO-TRIAR', documento: { tipo: 'mensagem', metadados: t('Pode me mandar a segunda via do boleto de honorários?') }, esperado: 'outro', pessoa: 'outro' },
]

export const gabaritoAtendimento: CasoGabarito[] = [
  { id: 'faq-boleto', setor: 'gestao_atendimento', procedimento: 'GES-FAQ-RESPONDER', documento: { tipo: 'mensagem', metadados: t('Oi! Pode me mandar a segunda via do boleto de honorários?') }, esperado: 'segunda_via_boleto', pessoa: 'segunda_via_boleto' },
  { id: 'faq-guias', setor: 'gestao_atendimento', procedimento: 'GES-FAQ-RESPONDER', documento: { tipo: 'mensagem', metadados: t('Quando vocês mandam as guias de imposto deste mês?') }, esperado: 'prazo_guias', pessoa: 'prazo_guias' },
  { id: 'faq-documentos', setor: 'gestao_atendimento', procedimento: 'GES-FAQ-RESPONDER', documento: { tipo: 'mensagem', metadados: t('Como faço para enviar os documentos e as notas do mês?') }, esperado: 'enviar_documentos', pessoa: 'enviar_documentos' },
  { id: 'faq-certidao', setor: 'gestao_atendimento', procedimento: 'GES-FAQ-RESPONDER', documento: { tipo: 'mensagem', metadados: t('Preciso de uma certidão negativa para participar de uma licitação.') }, esperado: 'certidao_negativa', pessoa: 'certidao_negativa' },
  // Nenhuma resposta aprovada atende: o certo é uma pessoa responder.
  { id: 'faq-cancelar', setor: 'gestao_atendimento', procedimento: 'GES-FAQ-RESPONDER', documento: { tipo: 'mensagem', metadados: t('Quero cancelar o contrato com o escritório a partir do mês que vem.') }, esperado: 'cartao', pessoa: 'cartao' },
]

export const gabaritoPorSetor: Record<string, CasoGabarito[]> = {
  contabil: gabaritoContabil,
  fiscal: gabaritoFiscal,
  dp: gabaritoDp,
  societario: gabaritoSocietario,
  gestao_atendimento: gabaritoAtendimento,
}

export const gabaritoCompleto = Object.values(gabaritoPorSetor).flat()

/** Roteamento: o pedido do chat (e o tipo do documento anexado) e o procedimento certo, ou `pergunta`. */
export interface CasoRota {
  id: string
  texto: string
  documento: { tipo: string; metadados: Record<string, unknown> }
  esperado: string
}

export const gabaritoRoteamento: CasoRota[] = [
  { id: 'rota-competencia', texto: 'Classifique a competência deste recibo, por favor.', documento: { tipo: 'recibo', metadados: t('Recibo de aluguel referente a 08/2026.') }, esperado: 'CTB-COMPETENCIA-DOC' },
  { id: 'rota-ecd', texto: 'Pode conferir e transmitir a ECD de 2025 deste cliente?', documento: { tipo: 'ecd', metadados: {} }, esperado: 'CTB-ECD-TRANSMITIR' },
  { id: 'rota-guia', texto: 'Confere essa guia antes de mandar pro cliente.', documento: { tipo: 'guia', metadados: t('DAS 10/2026') }, esperado: 'FIS-GUIA-CONFERIR' },
  { id: 'rota-ecac', texto: 'Chegou isso na caixa postal do e-CAC.', documento: { tipo: 'mensagem_ecac', metadados: t('Intimação.') }, esperado: 'FIS-CAIXA-POSTAL-TRIAR' },
  { id: 'rota-horas', texto: 'O cliente pediu para lançar as horas extras do Pedro.', documento: { tipo: 'mensagem', metadados: t('10 horas extras em 10/2026.') }, esperado: 'DP-EVENTO-FOLHA' },
  { id: 'rota-socio', texto: 'O cliente quer incluir um novo sócio na empresa.', documento: { tipo: 'mensagem', metadados: t('Entrada de sócio.') }, esperado: 'SOC-ALTERACAO-TRIAR' },
  { id: 'rota-segunda-via', texto: 'Responde o cliente sobre a segunda via.', documento: { tipo: 'mensagem', metadados: t('Segunda via do boleto?') }, esperado: 'GES-FAQ-RESPONDER' },
  // Sem palavra que as regras reconheçam: o modelo barato decide.
  { id: 'rota-sabado', texto: 'Ele trabalhou além do horário no sábado; isso precisa entrar no pagamento do mês.', documento: { tipo: 'mensagem', metadados: t('Trabalhou sábado.') }, esperado: 'DP-EVENTO-FOLHA' },
  { id: 'rota-mudou-rua', texto: 'A empresa vai mudar de rua e precisa atualizar o registro na Junta.', documento: { tipo: 'mensagem', metadados: t('Mudança.') }, esperado: 'SOC-ALTERACAO-TRIAR' },
  { id: 'rota-abertos', texto: 'O cliente perguntou até que horas vocês ficam abertos; pode responder com o texto padrão?', documento: { tipo: 'mensagem', metadados: t('Até que horas?') }, esperado: 'GES-FAQ-RESPONDER' },
  // Sem dizer o que fazer: o certo é perguntar à pessoa, não chutar um setor.
  { id: 'rota-vago', texto: 'Resolve isso aqui pra mim.', documento: { tipo: 'mensagem', metadados: t('Oi.') }, esperado: 'pergunta' },
]

/** Hash do gabarito (pré-registro: o relatório diz exatamente qual conjunto rodou). */
export const hashDoGabarito = () => createHash('sha256').update(JSON.stringify({ gabaritoCompleto, gabaritoRoteamento })).digest('hex').slice(0, 16)

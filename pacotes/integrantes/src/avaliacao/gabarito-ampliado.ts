import { createHash } from 'node:crypto'
import { casosCompetencia } from '../../../processos/testes/gabarito/contabil.ts'
import type { CasoGabarito } from './avaliar.ts'
import type { CasoRota } from './gabarito.ts'

/**
 * Gabarito ampliado (B3b): 30 casos DISTINTOS por contrato de operário, mais 32 de roteamento, com
 * casos difíceis (várias datas, palavras que enganam) e casos em que o certo é NÃO decidir (`cartao`).
 * Dados fictícios, datas até 15/11/2026. É o conjunto do portão do Haiku: o Haiku só fica num
 * contrato se igualar o Sonnet aqui, caso a caso, sem erro crítico.
 *
 * A decisão de cada caso segue a regra do setor escrita na instrução do contrato; onde a regra não
 * dá uma resposta só, o esperado é `cartao`.
 */

const t = (texto: string, extra: Record<string, unknown> = {}) => ({ texto_extraido: texto, ...extra })
const caso = (id: string, setor: string, procedimento: string, tipo: string, metadados: Record<string, unknown>, esperado: string): CasoGabarito => ({
  id,
  setor,
  procedimento,
  documento: { tipo, metadados },
  esperado,
  pessoa: esperado,
})

// ── Contábil · ctb.competencia.escolher (30) ──

const competenciaNovos: [string, string, string, string][] = [
  ['aluguel-sala', 'recibo', 'Aluguel da sala comercial, competência 07/2026, vencimento 05/08/2026.', '2026-07'],
  ['agua', 'conta_consumo', 'Conta de água. Consumo de 01/09/2026 a 30/09/2026. Vencimento 18/10/2026.', '2026-09'],
  ['consultoria', 'nota_debito', 'Nota de débito: serviços de consultoria prestados em 06/2026. Emitida em 03/07/2026.', '2026-06'],
  ['vale-transporte', 'recibo', 'Recibo de vale-transporte referente ao mês 10/2026, entregue em 28/09/2026.', '2026-10'],
  ['manutencao', 'ordem_servico', 'Ordem de serviço de manutenção do ar-condicionado realizada em 12/08/2026. Pagamento em 10/09/2026.', '2026-08'],
  ['diarias', 'recibo', 'Recibo de diárias de viagem a São Paulo nos dias 03/10/2026 e 04/10/2026. Pago em 15/10/2026.', '2026-10'],
  ['iptu-parcela', 'boleto', 'IPTU 2026, parcela 9 de 10. Vencimento 15/09/2026.', '2026-09'],
  ['consorcio', 'boleto', 'Boleto do consórcio, parcela 14 de 60. Vencimento 10/10/2026.', '2026-10'],
  ['combustivel', 'cupom', 'Cupom de abastecimento do veículo da empresa em 21/09/2026.', '2026-09'],
  ['comissao', 'recibo', 'Recibo de comissão sobre as vendas de 08/2026, paga em 05/09/2026.', '2026-08'],
  ['limpeza', 'fatura', 'Prestação de serviços de limpeza, mês de referência 09/2026. Nota emitida em 30/09/2026, vencimento 10/10/2026.', '2026-09'],
  ['curso', 'recibo', 'Curso de atualização tributária realizado em 18/07/2026. Pago antecipadamente em 30/06/2026.', '2026-07'],
  ['estacionamento', 'recibo', 'Mensalidade do estacionamento de 10/2026. Pago em 01/10/2026.', '2026-10'],
  ['software', 'fatura', 'Assinatura do sistema de gestão, período de uso 08/2026. Fatura de 01/08/2026.', '2026-08'],
  ['energia-ref', 'conta_consumo', 'Conta de energia elétrica. Referência: 09/2026. Leitura em 05/10/2026. Vencimento 20/10/2026.', '2026-09'],
  ['frete', 'fatura', 'Conhecimento de frete: transporte realizado em 14/08/2026, faturado em 31/08/2026, vencimento 30/09/2026.', '2026-08'],
  // Onde a regra não dá uma resposta só: o certo é parar no cartão.
  ['tres-referencias', 'recibo', 'Recibo. Referências: 05/2026, 06/2026 e 07/2026.', 'cartao'],
  ['sem-data', 'recibo', 'Recebemos de vocês o pagamento referente aos serviços combinados.', 'cartao'],
  ['duas-competencias', 'recibo', 'Honorários de 08/2026 e 09/2026 pagos juntos em 10/10/2026.', 'cartao'],
  ['so-pagamento', 'comprovante', 'Comprovante de pagamento efetuado em 02/10/2026.', 'cartao'],
]

export const ampliadoCompetencia: CasoGabarito[] = [
  ...casosCompetencia.map((c) => caso(`ctb-${c.id}`, 'contabil', 'CTB-COMPETENCIA-DOC', c.tipo, t(c.texto), c.esperado)),
  ...competenciaNovos.map(([id, tipo, texto, esperado]) => caso(`ctb-${id}`, 'contabil', 'CTB-COMPETENCIA-DOC', tipo, t(texto), esperado)),
]

// ── Contábil · ctb.ecd.apontar_atencao (30): a conta plantada tem de ser apontada ──

const PLANTADAS: [string, string][] = [
  ['1.1.05', 'Adiantamento a sócios'],
  ['1.1.06', 'Empréstimos a sócios'],
  ['1.1.07', 'Adiantamento a diretores'],
  ['1.2.01', 'Mútuo com partes relacionadas'],
  ['1.1.08', 'Valores a identificar'],
  ['1.1.09', 'Cheques em trânsito'],
]
const NIVEIS = [700_000, 900_000, 1_400_000, 2_000_000, 2_700_000]

/** Uma ECD que fecha por regra, com a conta plantada (sobe de 100 mil para o nível) paga pelo banco. */
export function ecdPlantada(cnpj: string, codigo: string, nome: string, nivel: number, comEstoque: boolean) {
  const contas = [
    { codigo: '1.1.01', nome: 'Caixa', natureza: 'D', saldo_inicial_centavos: 1_000_000, debitos_centavos: 5_000_000, creditos_centavos: 4_000_000, saldo_final_centavos: 2_000_000 },
    { codigo: '1.1.02', nome: 'Bancos', natureza: 'D', saldo_inicial_centavos: 5_000_000, debitos_centavos: 3_000_000, creditos_centavos: 2_500_000 + nivel, saldo_final_centavos: 5_500_000 - nivel },
    { codigo, nome, natureza: 'D', saldo_inicial_centavos: 100_000, debitos_centavos: nivel, creditos_centavos: 0, saldo_final_centavos: 100_000 + nivel },
    { codigo: '2.1.01', nome: 'Fornecedores', natureza: 'C', saldo_inicial_centavos: 2_000_000, debitos_centavos: 1_500_000, creditos_centavos: 2_000_000, saldo_final_centavos: 2_500_000 },
    { codigo: '3.1.01', nome: 'Receita de vendas', natureza: 'C', saldo_inicial_centavos: 0, debitos_centavos: 0, creditos_centavos: 5_000_000, saldo_final_centavos: 5_000_000 },
    { codigo: '4.1.01', nome: 'Custo das mercadorias', natureza: 'D', saldo_inicial_centavos: 4_000_000, debitos_centavos: 4_000_000, creditos_centavos: 0, saldo_final_centavos: 8_000_000 },
    // Distrator: estoque que sobe muito, mas por compra normal (fornecedores).
    ...(comEstoque
      ? [
          { codigo: '1.1.04', nome: 'Estoque de mercadorias', natureza: 'D', saldo_inicial_centavos: 1_500_000, debitos_centavos: 1_200_000, creditos_centavos: 0, saldo_final_centavos: 2_700_000 },
          { codigo: '2.1.02', nome: 'Fornecedores de estoque', natureza: 'C', saldo_inicial_centavos: 300_000, debitos_centavos: 0, creditos_centavos: 1_200_000, saldo_final_centavos: 1_500_000 },
        ]
      : []),
  ]
  const d = contas.reduce((a, c) => a + c.debitos_centavos, 0)
  const k = contas.reduce((a, c) => a + c.creditos_centavos, 0)
  return { cnpj, exercicio: '2025', contas, total_debitos_centavos: d, total_creditos_centavos: k }
}

export const ampliadoEcd: CasoGabarito[] = PLANTADAS.flatMap(([codigo, nome], i) =>
  NIVEIS.map((nivel, j) => ({
    id: `ecd-${codigo}-${j + 1}`,
    setor: 'contabil',
    procedimento: 'CTB-ECD-TRANSMITIR',
    documento: { tipo: 'ecd', metadados: ({ cnpj }: { cnpj: string }) => ({ ecd: ecdPlantada(cnpj, codigo, nome, nivel, (i + j) % 2 === 0) }) },
    entrada_extra: { exercicio: '2025' },
    esperado: `contem:${codigo}`,
  })),
)

// ── Fiscal · fis.guia.identificar (30) ──

const guiasDecidiveis: [string, string, string, string][] = [
  ['das-10', 'Documento de Arrecadação do Simples Nacional (DAS). Período de apuração: 10/2026. Vencimento: 20/11/2026.', 'DAS', '2026-10'],
  ['das-09', 'DAS - Simples Nacional. Competência 09/2026. Vencimento 20/10/2026.', 'DAS', '2026-09'],
  ['das-08', 'Extrato do Simples Nacional - documento de arrecadação. PA 08/2026, vencimento 22/09/2026.', 'DAS', '2026-08'],
  ['das-07', 'Simples Nacional: DAS do período 07/2026.', 'DAS', '2026-07'],
  ['irpj-09', 'DARF. Código 2089 - IRPJ lucro presumido. Período de apuração 30/09/2026. Vencimento 31/10/2026.', 'IRPJ', '2026-09'],
  ['irpj-06', 'DARF IRPJ trimestral, código 2089, período de apuração 30/06/2026, quota única, vencimento 31/07/2026.', 'IRPJ', '2026-06'],
  ['csll-09', 'DARF. Código da receita 2372 - CSLL. Período de apuração 30/09/2026. Vencimento 31/10/2026.', 'CSLL', '2026-09'],
  ['csll-06', 'DARF CSLL trimestral, código 2372, período de apuração 30/06/2026, vencimento 31/07/2026.', 'CSLL', '2026-06'],
  ['pis-10', 'DARF PIS - código 8109. Período de apuração 31/10/2026. Vencimento 25/11/2026.', 'PIS', '2026-10'],
  ['pis-09', 'DARF. Receita 8109 (PIS). Apuração 30/09/2026.', 'PIS', '2026-09'],
  ['cofins-10', 'DARF COFINS - código 2172. Período de apuração 31/10/2026. Vencimento 25/11/2026.', 'COFINS', '2026-10'],
  ['cofins-09', 'DARF 2172 COFINS, período de apuração 30/09/2026, vencimento 24/10/2026.', 'COFINS', '2026-09'],
  ['inss-10', 'GPS - Guia da Previdência Social. Competência 10/2026. Vencimento 20/11/2026.', 'INSS', '2026-10'],
  ['inss-09', 'Guia da Previdência Social (GPS). Competência: 09/2026.', 'INSS', '2026-09'],
  ['inss-08', 'GPS código 2100, competência 08/2026, vencimento 20/09/2026.', 'INSS', '2026-08'],
  ['fgts-10', 'Guia do FGTS Digital. Competência 10/2026. Vencimento 20/11/2026.', 'FGTS', '2026-10'],
  ['fgts-09', 'FGTS - guia de recolhimento mensal. Competência 09/2026. Pagar até 20/10/2026.', 'FGTS', '2026-09'],
  ['fgts-08', 'Guia de FGTS do mês 08/2026.', 'FGTS', '2026-08'],
  ['iss-10', 'Guia de recolhimento do ISSQN. Mês de referência 10/2026. Vencimento 10/11/2026.', 'ISS', '2026-10'],
  ['iss-09', 'ISS próprio - serviços prestados em 09/2026. Vencimento 10/10/2026.', 'ISS', '2026-09'],
  ['iss-08', 'Guia do ISSQN, competência 08/2026, vencimento 10/09/2026.', 'ISS', '2026-08'],
  ['icms-10', 'Guia de recolhimento do ICMS. Referência 10/2026. Vencimento 20/11/2026.', 'ICMS', '2026-10'],
  ['icms-09', 'ICMS - apuração mensal de 09/2026. Vencimento 20/10/2026.', 'ICMS', '2026-09'],
  ['icms-08', 'Guia de ICMS normal, referência 08/2026.', 'ICMS', '2026-08'],
]

export const ampliadoGuia: CasoGabarito[] = [
  ...guiasDecidiveis.map(([id, texto, tributo, comp], i) => {
    const valor = 10_000 + i * 1_371
    return caso(`guia-${id}`, 'fiscal', 'FIS-GUIA-CONFERIR', 'guia', t(texto, { valor_centavos: valor, apuracao: { [tributo]: { [comp]: valor } } }), `${tributo}:${comp}`)
  }),
  // Valor que não bate, apuração que falta, tributo ou competência que o texto não define: cartão.
  caso('guia-valor-das', 'fiscal', 'FIS-GUIA-CONFERIR', 'guia', t('Documento de Arrecadação do Simples Nacional (DAS). Período de apuração: 10/2026.', { valor_centavos: 100_000, apuracao: { DAS: { '2026-10': 123_456 } } }), 'cartao'),
  caso('guia-valor-pis', 'fiscal', 'FIS-GUIA-CONFERIR', 'guia', t('DARF PIS - código 8109. Período de apuração 31/10/2026.', { valor_centavos: 45_000, apuracao: { PIS: { '2026-10': 54_000 } } }), 'cartao'),
  caso('guia-sem-apuracao-iss', 'fiscal', 'FIS-GUIA-CONFERIR', 'guia', t('Guia do ISSQN, competência 10/2026.', { valor_centavos: 30_000, apuracao: {} }), 'cartao'),
  caso('guia-sem-apuracao-inss', 'fiscal', 'FIS-GUIA-CONFERIR', 'guia', t('GPS, competência 07/2026.', { valor_centavos: 70_000, apuracao: { INSS: { '2026-08': 70_000 } } }), 'cartao'),
  caso('guia-duas-competencias', 'fiscal', 'FIS-GUIA-CONFERIR', 'guia', t('Guia de recolhimento. Competências 08/2026 e 09/2026.', { valor_centavos: 5_000, apuracao: { DAS: { '2026-08': 5_000, '2026-09': 5_000 } } }), 'cartao'),
  caso('guia-sem-tributo', 'fiscal', 'FIS-GUIA-CONFERIR', 'guia', t('Documento de arrecadação. Período 10/2026. Valor conforme apuração.', { valor_centavos: 8_000, apuracao: { DAS: { '2026-10': 8_000 }, ISS: { '2026-10': 8_000 } } }), 'cartao'),
]

// ── Fiscal · fis.caixa_postal.classificar (30) ──

const caixaPostal: [string, string, string][] = [
  ['int-livros', 'Termo de Intimação Fiscal nº 123/2026. Fica o contribuinte intimado a apresentar, até 30/11/2026, os livros fiscais.', 'intimacao:2026-11-30'],
  ['int-medicas', 'Intimação: apresente os comprovantes das despesas médicas declaradas até 05/12/2026.', 'intimacao:2026-12-05'],
  ['int-duas-datas', 'Termo de intimação emitido em 01/11/2026. Prazo de atendimento: 20/11/2026.', 'intimacao:2026-11-20'],
  ['int-dctf', 'Fica intimado o contribuinte a prestar esclarecimentos sobre divergências na DCTF até 10/12/2026.', 'intimacao:2026-12-10'],
  ['int-gfip', 'Intimação para regularizar a GFIP. Data limite: 28/11/2026.', 'intimacao:2026-11-28'],
  ['int-docs', 'Termo de intimação nº 88: entregar os documentos solicitados até 03/12/2026.', 'intimacao:2026-12-03'],
  ['malha-pendencia', 'Notificação de pendência: a declaração caiu em malha fiscal. Prazo para autorregularização: 10/12/2026.', 'malha:2026-12-10'],
  ['malha-dirpf', 'Sua DIRPF 2026 está retida em malha. Envie a declaração retificadora até 15/12/2026.', 'malha:2026-12-15'],
  ['malha-fonte', 'Declaração em malha fiscal por divergência de rendimentos informados pela fonte pagadora. Regularize até 30/12/2026.', 'malha:2026-12-30'],
  ['malha-ecf', 'Aviso de malha da ECF: inconsistência no lucro presumido. Autorregularização até 18/12/2026.', 'malha:2026-12-18'],
  ['malha-dctfweb', 'A DCTFWeb do período foi retida em malha. Você pode corrigir até 22/12/2026.', 'malha:2026-12-22'],
  ['malha-duas-datas', 'Malha fiscal: pendência identificada em 03/11/2026. Prazo para corrigir: 03/12/2026.', 'malha:2026-12-03'],
  ['excl-debitos', 'Comunicado de exclusão do Simples Nacional por débitos pendentes. Regularize até 15/12/2026.', 'exclusao_simples:2026-12-15'],
  ['excl-efeitos', 'Termo de exclusão do Simples Nacional. A exclusão produz efeitos a partir de 01/01/2027, salvo regularização dos débitos até 14/12/2026.', 'exclusao_simples:2026-12-14'],
  ['excl-impugnacao', 'Ato declaratório de exclusão do Simples Nacional. Prazo para impugnação: 19/12/2026.', 'exclusao_simples:2026-12-19'],
  ['excl-cadastral', 'Sua empresa será excluída do Simples Nacional por pendência cadastral. Prazo para regularizar: 11/12/2026.', 'exclusao_simples:2026-12-11'],
  ['excl-parcelar', 'Exclusão do Simples Nacional: débitos com a Receita. Pague ou parcele até 16/12/2026.', 'exclusao_simples:2026-12-16'],
  ['excl-vedada', 'Notificação de exclusão do Simples Nacional por atividade vedada. Defesa até 21/12/2026.', 'exclusao_simples:2026-12-21'],
  ['cob-pis', 'Aviso de cobrança: há débito de PIS em aberto. Pague até 28/11/2026 para evitar a inscrição em dívida ativa.', 'cobranca:2026-11-28'],
  ['cob-cofins', 'Carta de cobrança: há débitos de COFINS de 08/2026. Regularize até 04/12/2026.', 'cobranca:2026-12-04'],
  ['cob-irpj', 'Débito de IRPJ em atraso. O pagamento até 09/12/2026 evita o encaminhamento à PGFN.', 'cobranca:2026-12-09'],
  ['cob-duas-datas', 'Cobrança amigável: DARF de CSLL vencido em 31/10/2026. Pague até 30/11/2026.', 'cobranca:2026-11-30'],
  ['cob-parcelamento', 'Aviso de débito: parcelamento em atraso. Quite a parcela até 26/11/2026 para não rescindir.', 'cobranca:2026-11-26'],
  ['cob-previdencia', 'Notificação de cobrança de débitos previdenciários em aberto. Pague até 12/12/2026.', 'cobranca:2026-12-12'],
  ['info-layout', 'Informamos que o novo layout do portal e-CAC estará disponível a partir de 01/12/2026. Nenhuma ação é necessária.', 'informativo:-'],
  ['info-certificado', 'Comunicado: a Receita Federal atualizou as regras de acesso com certificado digital. Não é necessária nenhuma providência.', 'informativo:-'],
  ['info-processada', 'Sua declaração foi processada sem pendências.', 'informativo:-'],
  ['info-horario', 'Lembrete: o horário de atendimento presencial mudou a partir de 10/11/2026.', 'informativo:-'],
  ['info-reforma', 'Informativo sobre a reforma tributária: novos códigos de receita passam a valer em 2027.', 'informativo:-'],
  ['info-recebimento', 'Confirmamos o recebimento da DCTFWeb transmitida em 14/11/2026.', 'informativo:-'],
]

export const ampliadoCaixaPostal: CasoGabarito[] = caixaPostal.map(([id, texto, esperado]) => caso(`cp-${id}`, 'fiscal', 'FIS-CAIXA-POSTAL-TRIAR', 'mensagem_ecac', t(texto), esperado))

// ── DP · dp.evento.classificar (30) ──

const dp: [string, string, string][] = [
  ['he-pedro', 'O Pedro fez 10 horas extras em 10/2026, favor incluir na folha.', 'hora_extra:2026-10:10'],
  ['he-joana', 'Incluir 8 horas extras para a Joana na folha de 11/2026.', 'hora_extra:2026-11:8'],
  ['he-marcos', 'Na competência 09/2026 o Marcos trabalhou 12 horas além da jornada.', 'hora_extra:2026-09:12'],
  ['he-rafael', 'Horas extras do Rafael em 10/2026: 6.', 'hora_extra:2026-10:6'],
  ['he-lucas', 'O Lucas fez 4,5 horas extras no sábado; entra na folha de 11/2026.', 'hora_extra:2026-11:4.5'],
  ['falta-maria', 'A Maria faltou 2 dias em 09/2026, sem atestado.', 'falta:2026-09:2'],
  ['falta-bruno', 'O Bruno teve 3 faltas injustificadas na folha de 10/2026.', 'falta:2026-10:3'],
  ['falta-carla', 'Descontar 1 dia de falta da Carla em 11/2026.', 'falta:2026-11:1'],
  ['falta-paula', 'A Paula não compareceu ao trabalho por 4 dias em 10/2026 e não trouxe atestado.', 'falta:2026-10:4'],
  ['adto-joao', 'Favor lançar um adiantamento de 500 reais para o João na folha de 11/2026.', 'adiantamento:2026-11:500'],
  ['adto-fernanda', 'Adiantamento salarial de 1200 para a Fernanda, competência 10/2026.', 'adiantamento:2026-10:1200'],
  ['adto-diego', 'Vale de 300 reais adiantado para o Diego; descontar na folha de 11/2026.', 'adiantamento:2026-11:300'],
  ['adto-sergio', 'Adiantamento de 650 para o Sérgio na folha de 09/2026.', 'adiantamento:2026-09:650'],
  ['ferias-carlos', 'O Carlos vai tirar férias. Lançar as férias dele na folha de 11/2026.', 'ferias:2026-11:-'],
  ['ferias-luana', 'Férias da Luana: lançar na folha de 10/2026.', 'ferias:2026-10:-'],
  ['ferias-renata', 'A Renata sai de férias; incluir na competência 11/2026.', 'ferias:2026-11:-'],
  ['adm-beatriz', 'Admitimos a Beatriz em 03/11/2026; favor fazer a admissão na folha de 11/2026.', 'admissao:2026-11:-'],
  ['adm-henrique', 'Novo funcionário, o Henrique, começou a trabalhar em 10/2026. Precisa da admissão.', 'admissao:2026-10:-'],
  ['adm-igor', 'Fazer a admissão do Igor na competência 11/2026.', 'admissao:2026-11:-'],
  ['resc-vitor', 'O Vitor pediu demissão, último dia em 31/10/2026. Fazer a rescisão na folha de 10/2026.', 'rescisao:2026-10:-'],
  ['resc-sandra', 'Desligamos a Sandra sem justa causa. Rescisão na competência 11/2026.', 'rescisao:2026-11:-'],
  ['resc-alex', 'Rescisão do contrato do Alex, competência 09/2026.', 'rescisao:2026-09:-'],
  ['outro-endereco', 'Atualizar o endereço do Mauro no cadastro, a partir da folha de 11/2026.', 'outro:2026-11:-'],
  ['outro-banco', 'Trocar a conta bancária da Elisa para o depósito do salário, folha de 10/2026.', 'outro:2026-10:-'],
  ['outro-dependente', 'Incluir o filho do Gustavo como dependente no cadastro, competência 11/2026.', 'outro:2026-11:-'],
  // Mais de um evento, ou falta a informação: o certo é não decidir.
  ['dois-eventos', 'Na folha de 10/2026: o Pedro fez 5 horas extras e a Ana faltou 1 dia.', 'cartao'],
  ['he-sem-quantidade', 'O Jorge fez horas extras em 10/2026, mas ainda não sei quantas.', 'cartao'],
  ['ferias-e-adto', 'Lançar férias e um adiantamento de 500 para o Caio na folha de 11/2026.', 'cartao'],
  ['sem-nada', 'Favor ver a folha do Nelson.', 'cartao'],
  ['duas-competencias', 'Horas extras da Cíntia: 10 em 09/2026 e 6 em 10/2026.', 'cartao'],
]

export const ampliadoDp: CasoGabarito[] = dp.map(([id, texto, esperado]) => caso(`dp-${id}`, 'dp', 'DP-EVENTO-FOLHA', 'mensagem', t(texto), esperado))

// ── Societário · soc.alteracao.classificar (30) ──

const soc: [string, string, string][] = [
  ['end-rua', 'Queremos mudar o endereço da sede da empresa para a Rua Nova, número 100.', 'endereco'],
  ['end-bairro', 'Vamos transferir a sede para outro bairro a partir do mês que vem.', 'endereco'],
  ['end-sala', 'A empresa mudou de sala no mesmo prédio, da 501 para a 702. Precisa alterar o contrato?', 'endereco'],
  ['end-cidade', 'Precisamos registrar a mudança da sede para a cidade de Campinas.', 'endereco'],
  ['end-matriz', 'Novo endereço da matriz: Avenida Brasil, 2000.', 'endereco'],
  ['ent-paulo', 'O Paulo vai entrar na sociedade com 20% das quotas.', 'entrada_socio'],
  ['ent-esposa', 'Queremos incluir a minha esposa como sócia da empresa.', 'entrada_socio'],
  ['ent-investidor', 'Um investidor vai comprar quotas novas e entrar como sócio.', 'entrada_socio'],
  ['ent-ricardo', 'Admissão de novo sócio, o Ricardo, com 10% do capital.', 'entrada_socio'],
  ['sai-marcelo', 'O sócio Marcelo quer sair da empresa e vender as quotas dele para mim.', 'saida_socio'],
  ['sai-sonia', 'A Sônia vai se retirar da sociedade.', 'saida_socio'],
  ['sai-falecido', 'Precisamos tirar do contrato social o sócio que faleceu.', 'saida_socio'],
  ['sai-fim-ano', 'Um dos sócios pediu para deixar a empresa no fim do ano.', 'saida_socio'],
  ['cap-aumentar', 'Precisamos aumentar o capital social da empresa este mês.', 'capital_social'],
  ['cap-integralizar', 'Vamos integralizar mais 50 mil reais no capital da empresa.', 'capital_social'],
  ['cap-reduzir', 'Queremos reduzir o capital social, que está alto demais.', 'capital_social'],
  ['cap-aporte', 'Os sócios vão aportar mais recursos e aumentar o capital.', 'capital_social'],
  ['ativ-consultoria', 'Vamos começar a prestar consultoria. Dá para incluir essa nova atividade no contrato social?', 'atividade'],
  ['ativ-cnae', 'Queremos incluir o CNAE de comércio varejista de roupas.', 'atividade'],
  ['ativ-servicos', 'Vamos parar de vender produtos e só prestar serviços. Precisa mudar o objeto social?', 'atividade'],
  ['ativ-manutencao', 'Incluir a atividade de manutenção de computadores no objeto da empresa.', 'atividade'],
  ['nome-trocar', 'Queremos trocar o nome da empresa para Padaria Sol Nascente Ltda.', 'nome_empresarial'],
  ['nome-parecido', 'Precisamos mudar a razão social, porque o nome atual parece com o de outra empresa.', 'nome_empresarial'],
  ['nome-razao', 'Alterar a razão social da empresa para incluir a palavra Comércio.', 'nome_empresarial'],
  ['outro-boleto', 'Pode me mandar a segunda via do boleto de honorários?', 'outro'],
  ['outro-alvara', 'Quando vence o alvará de funcionamento?', 'outro'],
  ['outro-regime', 'Qual é o regime tributário da minha empresa?', 'outro'],
  // Mais de uma alteração no mesmo pedido: cartão.
  ['duas-sede-socio', 'Vamos mudar a sede e incluir um novo sócio no mesmo ato.', 'cartao'],
  ['duas-capital-nome', 'Queremos aumentar o capital e trocar o nome da empresa.', 'cartao'],
  ['duas-sai-entra', 'O sócio João sai e a Maria entra no lugar dele.', 'cartao'],
]

export const ampliadoSocietario: CasoGabarito[] = soc.map(([id, texto, esperado]) => caso(`soc-${id}`, 'societario', 'SOC-ALTERACAO-TRIAR', 'mensagem', t(texto), esperado))

// ── Gestão e Atendimento · ges.faq.escolher (30) ──

const faq: [string, string, string][] = [
  ['boleto-segunda-via', 'Oi! Pode me mandar a segunda via do boleto de honorários?', 'segunda_via_boleto'],
  ['boleto-perdi', 'Perdi o boleto da mensalidade do escritório, como faço?', 'segunda_via_boleto'],
  ['boleto-venceu', 'O boleto dos honorários venceu, consegue gerar outro?', 'segunda_via_boleto'],
  ['boleto-nao-recebi', 'Não recebi o boleto deste mês dos honorários.', 'segunda_via_boleto'],
  ['boleto-onde', 'Onde encontro o boleto da mensalidade?', 'segunda_via_boleto'],
  ['guias-quando', 'Quando vocês mandam as guias de imposto deste mês?', 'prazo_guias'],
  ['guias-das', 'Até que dia eu recebo o DAS?', 'prazo_guias'],
  ['guias-novembro', 'As guias de impostos de novembro já saíram?', 'prazo_guias'],
  ['guias-enviaram', 'Vocês já enviaram as guias do mês?', 'prazo_guias'],
  ['guias-chegam', 'Quando chegam os impostos para pagar?', 'prazo_guias'],
  ['docs-notas', 'Como faço para enviar os documentos e as notas do mês?', 'enviar_documentos'],
  ['docs-extrato', 'Onde mando o extrato bancário?', 'enviar_documentos'],
  ['docs-aqui', 'Posso mandar as notas fiscais por aqui?', 'enviar_documentos'],
  ['docs-jeito', 'Qual o jeito de enviar os documentos para vocês?', 'enviar_documentos'],
  ['docs-outubro', 'Preciso mandar o extrato de outubro, como faço?', 'enviar_documentos'],
  ['cnd-licitacao', 'Preciso de uma certidão negativa para participar de uma licitação.', 'certidao_negativa'],
  ['cnd-sigla', 'Vocês conseguem tirar a CND da empresa?', 'certidao_negativa'],
  ['cnd-debitos', 'Como consigo a certidão negativa de débitos?', 'certidao_negativa'],
  ['cnd-banco', 'O banco pediu uma certidão negativa, vocês podem emitir?', 'certidao_negativa'],
  ['cnd-financiamento', 'Preciso da certidão para o financiamento.', 'certidao_negativa'],
  ['hora-atendimento', 'Qual o horário de atendimento de vocês?', 'horario_atendimento'],
  ['hora-sabado', 'Vocês funcionam no sábado?', 'horario_atendimento'],
  ['hora-aberto', 'Até que horas o escritório fica aberto?', 'horario_atendimento'],
  ['hora-amanha', 'Vocês estão abertos amanhã de manhã?', 'horario_atendimento'],
  // Nenhuma resposta aprovada atende por inteiro: uma pessoa responde.
  ['nenhuma-cancelar', 'Quero cancelar o contrato com o escritório a partir do mês que vem.', 'cartao'],
  ['nenhuma-filial', 'Vocês podem me ajudar a abrir uma filial?', 'cartao'],
  ['nenhuma-intimacao', 'Recebi uma intimação da Receita, o que eu faço?', 'cartao'],
  ['nenhuma-honorarios', 'Qual vai ser o valor dos honorários no ano que vem?', 'cartao'],
  ['nenhuma-boleto-errado', 'O boleto veio com o valor errado, quero contestar.', 'cartao'],
  ['nenhuma-certificado', 'Quando vence o meu certificado digital?', 'cartao'],
]

export const ampliadoFaq: CasoGabarito[] = faq.map(([id, texto, esperado]) => caso(`faq-${id}`, 'gestao_atendimento', 'GES-FAQ-RESPONDER', 'mensagem', t(texto), esperado))

/** O gabarito ampliado por contrato de operário (o que o portão do Haiku compara). */
export const ampliadoPorContrato: Record<string, CasoGabarito[]> = {
  'ctb.competencia.escolher': ampliadoCompetencia,
  'ctb.ecd.apontar_atencao': ampliadoEcd,
  'fis.guia.identificar': ampliadoGuia,
  'fis.caixa_postal.classificar': ampliadoCaixaPostal,
  'dp.evento.classificar': ampliadoDp,
  'soc.alteracao.classificar': ampliadoSocietario,
  'ges.faq.escolher': ampliadoFaq,
}

export const gabaritoAmpliado = Object.values(ampliadoPorContrato).flat()

// ── Roteamento (32): regra, modelo com pedido claro, pedido vago com documento claro, vago de verdade ──

const m = (texto: string) => ({ tipo: 'mensagem', metadados: t(texto) })
export const roteamentoAmpliado: (CasoRota & { grupo: 'regra' | 'pedido_claro' | 'documento_claro' | 'vago' })[] = [
  { grupo: 'regra', id: 'r-competencia', texto: 'Classifique a competência deste recibo.', documento: { tipo: 'recibo', metadados: t('Aluguel 08/2026.') }, esperado: 'CTB-COMPETENCIA-DOC' },
  { grupo: 'regra', id: 'r-ecd', texto: 'Pode conferir e transmitir a ECD de 2025?', documento: { tipo: 'ecd', metadados: {} }, esperado: 'CTB-ECD-TRANSMITIR' },
  { grupo: 'regra', id: 'r-guia', texto: 'Confere essa guia.', documento: { tipo: 'guia', metadados: t('DAS 10/2026') }, esperado: 'FIS-GUIA-CONFERIR' },
  { grupo: 'regra', id: 'r-ecac', texto: 'Chegou isto na caixa postal do e-CAC.', documento: { tipo: 'mensagem_ecac', metadados: t('Intimação.') }, esperado: 'FIS-CAIXA-POSTAL-TRIAR' },
  { grupo: 'regra', id: 'r-horas', texto: 'Lançar as horas extras do Pedro.', documento: m('10 horas extras em 10/2026.'), esperado: 'DP-EVENTO-FOLHA' },
  { grupo: 'regra', id: 'r-ferias', texto: 'Precisamos lançar as férias da Ana.', documento: m('Férias em 11/2026.'), esperado: 'DP-EVENTO-FOLHA' },
  { grupo: 'regra', id: 'r-socio', texto: 'O cliente quer incluir um novo sócio.', documento: m('Entrada de sócio.'), esperado: 'SOC-ALTERACAO-TRIAR' },
  { grupo: 'regra', id: 'r-alteracao', texto: 'Alteração contratual: mudança de endereço.', documento: m('Rua Nova, 100.'), esperado: 'SOC-ALTERACAO-TRIAR' },
  { grupo: 'regra', id: 'r-segunda-via', texto: 'Responde o cliente sobre a segunda via.', documento: m('Segunda via do boleto?'), esperado: 'GES-FAQ-RESPONDER' },
  { grupo: 'regra', id: 'r-certidao', texto: 'O cliente pediu a certidão negativa.', documento: m('Preciso da CND.'), esperado: 'GES-FAQ-RESPONDER' },
  { grupo: 'pedido_claro', id: 'p-sabado', texto: 'Ele trabalhou além do horário no sábado; isso precisa entrar no pagamento do mês.', documento: m('Trabalhou sábado.'), esperado: 'DP-EVENTO-FOLHA' },
  { grupo: 'pedido_claro', id: 'p-nova', texto: 'A funcionária nova começa segunda; precisa cadastrar no pagamento.', documento: m('Começa segunda.'), esperado: 'DP-EVENTO-FOLHA' },
  { grupo: 'pedido_claro', id: 'p-nao-veio', texto: 'Desconta do salário dele os dias em que não veio trabalhar.', documento: m('Não veio dois dias.'), esperado: 'DP-EVENTO-FOLHA' },
  { grupo: 'pedido_claro', id: 'p-rua', texto: 'A empresa vai mudar de rua e precisa atualizar o registro na Junta.', documento: m('Mudança.'), esperado: 'SOC-ALTERACAO-TRIAR' },
  { grupo: 'pedido_claro', id: 'p-filha', texto: 'Querem colocar a filha na empresa como dona de uma parte.', documento: m('Filha na empresa.'), esperado: 'SOC-ALTERACAO-TRIAR' },
  { grupo: 'pedido_claro', id: 'p-nome-firma', texto: 'Os donos querem trocar o nome da firma.', documento: m('Nome novo.'), esperado: 'SOC-ALTERACAO-TRIAR' },
  { grupo: 'pedido_claro', id: 'p-abertos', texto: 'O cliente perguntou até que horas vocês ficam abertos; pode responder com o texto padrão?', documento: m('Até que horas?'), esperado: 'GES-FAQ-RESPONDER' },
  { grupo: 'pedido_claro', id: 'p-papeis', texto: 'O cliente quer saber como mandar os papéis do mês; responde com a resposta pronta.', documento: m('Como mando?'), esperado: 'GES-FAQ-RESPONDER' },
  { grupo: 'pedido_claro', id: 'p-mes-despesa', texto: 'Em que mês entra a despesa deste recibo?', documento: { tipo: 'recibo', metadados: t('Recibo de 08/2026.') }, esperado: 'CTB-COMPETENCIA-DOC' },
  { grupo: 'pedido_claro', id: 'p-darf', texto: 'Antes de mandar ao cliente, veja se o valor bate.', documento: { tipo: 'guia', metadados: t('DARF 2089.') }, esperado: 'FIS-GUIA-CONFERIR' },
  // Pedido vago, documento claro: sem o trecho o certo é perguntar; com o trecho dá para decidir.
  { grupo: 'documento_claro', id: 'd-horas', texto: 'Vê isso pra mim, por favor.', documento: m('O Pedro fez 10 horas extras em 10/2026, favor incluir na folha.'), esperado: 'DP-EVENTO-FOLHA' },
  { grupo: 'documento_claro', id: 'd-falta', texto: 'Pode cuidar disso?', documento: m('A Maria faltou 2 dias em 09/2026, sem atestado.'), esperado: 'DP-EVENTO-FOLHA' },
  { grupo: 'documento_claro', id: 'd-endereco', texto: 'Segue a mensagem do cliente.', documento: m('Queremos mudar o endereço da sede da empresa para a Rua Nova, 100.'), esperado: 'SOC-ALTERACAO-TRIAR' },
  { grupo: 'documento_claro', id: 'd-capital', texto: 'Olha o que o cliente mandou.', documento: m('Precisamos aumentar o capital social da empresa este mês.'), esperado: 'SOC-ALTERACAO-TRIAR' },
  { grupo: 'documento_claro', id: 'd-horario', texto: 'Dá uma olhada nisso.', documento: m('Qual o horário de atendimento de vocês?'), esperado: 'GES-FAQ-RESPONDER' },
  { grupo: 'documento_claro', id: 'd-cnd', texto: 'O cliente mandou isto agora.', documento: m('Preciso de uma certidão negativa para uma licitação.'), esperado: 'GES-FAQ-RESPONDER' },
  { grupo: 'documento_claro', id: 'd-admissao', texto: 'Pode resolver?', documento: m('Admitimos a Beatriz em 03/11/2026; favor fazer a admissão na folha de 11/2026.'), esperado: 'DP-EVENTO-FOLHA' },
  { grupo: 'documento_claro', id: 'd-recibo', texto: 'Trata este documento, por favor.', documento: { tipo: 'recibo', metadados: t('Recibo de aluguel referente a 08/2026.') }, esperado: 'CTB-COMPETENCIA-DOC' },
  // Vago de verdade: o certo é perguntar à pessoa.
  { grupo: 'vago', id: 'v-resolve', texto: 'Resolve isso aqui pra mim.', documento: m('Oi, tudo bem?'), esperado: 'pergunta' },
  { grupo: 'vago', id: 'v-ve', texto: 'Vê isso.', documento: m('Bom dia! Aguardo retorno.'), esperado: 'pergunta' },
  { grupo: 'vago', id: 'v-urgente', texto: 'Urgente, por favor.', documento: m('Por favor me liguem.'), esperado: 'pergunta' },
  { grupo: 'vago', id: 'v-cliente', texto: 'O cliente mandou mensagem.', documento: m('Obrigado pelo atendimento de ontem.'), esperado: 'pergunta' },
]

export const hashDoGabaritoAmpliado = () =>
  createHash('sha256').update(JSON.stringify({ g: gabaritoAmpliado.map((c) => ({ ...c, documento: typeof c.documento.metadados === 'function' ? 'fn' : c.documento })), r: roteamentoAmpliado })).digest('hex').slice(0, 16)

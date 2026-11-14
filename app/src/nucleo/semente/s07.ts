// S07: Financeiro do escritório (09, 3.1). Os valores batem com os de src/dados/financeiro.ts
// (Rentabilidade do Timesheet e app do cliente); o resto da carteira entra agregado no lote.
import { gruposDeNota, linhasDoContrato, notaDoGrupo, PROXIMA_COMPETENCIA, servicos as tabServicos } from '@/telas/financeiro/dominio'
import type { Fotografia, Tabelas } from '../modelo/entidades'
import type { Cobranca, ContratoHonorarios, ItemContrato, LinhaCobranca, PassoRegua, PoliticaFinanceira, ServicoContrato } from '../modelo/financeiro'

type Add = <K extends keyof Tabelas>(tabela: K, linha: Omit<Tabelas[K], 'escritorio_id' | 'criado_em' | 'atualizado_em'> & { criado_em?: string }) => Tabelas[K]

export const reguaPadrao: PassoRegua[] = [
  { id: 'p1', dias: -5, canal: 'WhatsApp', tom: 'lembrete', quem: 'sozinho', ativo: true, texto: 'Oi, {{contato}}! A fatura de {{competencia}} vence em {{vencimento}}. Seguem o boleto e o Pix.' },
  { id: 'p2', dias: 0, canal: 'WhatsApp', tom: 'lembrete', quem: 'sozinho', ativo: true, texto: 'Hoje vence a fatura de {{competencia}}. Se já pagou, desconsidere.' },
  { id: 'p3', dias: 3, canal: 'WhatsApp', tom: 'cordial', quem: 'sozinho', ativo: true, texto: 'Não localizamos o pagamento de {{competencia}}. Mandamos a 2ª via atualizada.' },
  { id: 'p4', dias: 10, canal: 'WhatsApp e e-mail', tom: 'firme', quem: 'gestor', ativo: true, texto: 'A fatura de {{competencia}} segue em aberto. Podemos combinar um parcelamento?' },
  { id: 'p5', dias: 20, canal: 'app', tom: 'gestor', quem: 'gestor', ativo: true, texto: 'Aviso ao Gestor e etiqueta "cliente atrasa".' },
  { id: 'p6', dias: 30, canal: 'e-mail', tom: 'formal', quem: 'administrador', ativo: true, texto: 'Notificação formal de débito, com prazo de 10 dias para regularizar e a data da pausa parcial.' },
  { id: 'p7', dias: 45, canal: 'app', tom: 'pausa', quem: 'administrador', ativo: true, texto: 'Pausa parcial: pedidos novos e serviços extras em espera. Obrigações, prazos legais, guias e documentos devidos continuam.' },
]

function politica(nome: string, conta: string, ultimo: number, autorizacoes: number): Omit<PoliticaFinanceira, 'escritorio_id' | 'criado_em' | 'atualizado_em'> {
  return {
    id: 'politica',
    versao: 1,
    juros_mes: 1,
    multa: 2,
    regua: reguaPadrao,
    prazo_pago_dias: 3,
    acordo_desconto_max: 10,
    acordo_parcelas_max: 6,
    limite_gestor: 5000,
    limite_dois_aprovadores: 10000,
    provedor: { tipo: 'banco', nome, conta, convenio: 'convênio de cobrança ativo · API Pix e boleto', boleto: 'R$ 1,90', pix: 'grátis', pix_automatico: 'R$ 0,90', credito: 'D+0', autorizacoes_pix: autorizacoes },
    nfse: { emissor: 'Emissor Nacional (NFS-e padrão nacional)', serie: '2026', ultimo_numero: ultimo, certificado: 'e-CNPJ A1 · vence 14/03/2027', envio: 'com_a_cobranca', nfse_por_servico: true, regra: 'layout nacional (a confirmar na NT 007/2026)', reembolso: 'recibo_separado' },
    importacao: null,
  }
}

/** O que todo escritório recebe: política, plano de contas, centros de custo e tabela de avulsos. */
function base(add: Add, opcoes: { banco: string; conta: string; ultimo: number; autorizacoes: number }) {
  add('politica_financeira', politica(opcoes.banco, opcoes.conta, opcoes.ultimo, opcoes.autorizacoes))
  const centros: [string, string, 'setor' | 'estrutura' | 'comercial' | 'carteira_de_socio', string | null, boolean][] = [
    ['cc-contabil', 'Contábil', 'setor', 'contabil', true],
    ['cc-fiscal', 'Fiscal', 'setor', 'fiscal', true],
    ['cc-dp', 'DP', 'setor', 'dp', true],
    ['cc-societario', 'Societário', 'setor', 'societario', true],
    ['cc-consultoria', 'Consultoria', 'setor', 'consultor', true],
    ['cc-atendimento', 'Atendimento', 'setor', 'gestao_atendimento', true],
    ['cc-bpo', 'BPO financeiro', 'setor', 'bpo_financeiro', true],
    ['cc-estrutura', 'Estrutura', 'estrutura', null, true],
    ['cc-comercial', 'Comercial', 'comercial', null, false],
  ]
  centros.forEach(([id, nome, tipo, setor_codigo, entra]) => add('centro_custo', { id, nome, tipo, setor_codigo, entra_no_custo_hora: entra, ativo: true }))
  const plano: [string, string, 'receita' | 'despesa' | 'tributo' | 'distribuicao' | 'financeiro', string[], boolean][] = [
    ['1', 'Receitas', 'receita', ['Honorários mensais', 'Serviços avulsos', '13º honorário', 'Reembolsos de clientes', 'Juros e multas recebidos'], false],
    ['2', 'Pessoal', 'despesa', ['Salários e encargos', 'Pró-labore', 'Benefícios', 'Comissões e PLR'], true],
    ['3', 'Operação', 'despesa', ['Software', 'APIs e serviços', 'Certificados', 'Ocupação', 'Tarifas bancárias', 'Material de escritório', 'Deslocamento', 'Reembolso a colaborador'], true],
    ['4', 'Tributos próprios', 'tributo', ['DAS', 'ISS fixo', 'Taxas do CRC'], false],
    ['5', 'Distribuição', 'distribuicao', ['Distribuição de lucros'], false],
    ['6', 'Movimentação', 'financeiro', ['Transferência entre contas'], false],
  ]
  plano.forEach(([g, grupo, natureza, cats, entra]) => cats.forEach((nome, i) => add('categoria_gerencial', { id: `cg-${g}-${i + 1}`, codigo: `${g}.${i + 1}`, nome, grupo, natureza, entra_no_custo_hora: entra, ativa: true })))
  const avulsos: [string, string, number, 'ocorrencia' | 'hora' | 'por_empregado', boolean][] = [
    ['SOC-031', 'Alteração contratual', 1200, 'ocorrencia', true],
    ['IRPF-001', 'IRPF de sócio ou retificadora', 450, 'ocorrencia', true],
    ['DP-030', 'Rescisão fora da folha', 180, 'por_empregado', true],
    ['FIS-040', 'Certidão negativa avulsa', 80, 'ocorrencia', false],
    ['SOC-040', 'Declaração de capacidade financeira', 350, 'ocorrencia', true],
    ['CON-010', 'Hora de consultoria', 320, 'hora', true],
    ['C2-23', 'Certificado digital A1 (emissão)', 220, 'ocorrencia', true],
  ]
  avulsos.forEach(([atividade_id, nome, valor_padrao, unidade, exige_aceite]) => add('item_tabela_avulsos', { id: `ta-${atividade_id.toLowerCase()}`, atividade_id, nome, valor_padrao, unidade, exige_aceite, ativo: true }))
}

interface Molde {
  id: string
  cliente: string
  numero: string
  versao: number
  desde: string
  dia: number
  meio: ContratoHonorarios['meio_pagamento']
  indice: ContratoHonorarios['indice']
  base: number
  decimo: boolean
  retencoes: string[]
  centro: string
  indicado?: string
  faixa?: string
  itens: [ServicoContrato, string, number, string?][]
}

const moldes: Molde[] = [
  { id: 'ch-c5', cliente: 'c5', numero: 'CT-0388', versao: 4, desde: '2026-03', dia: 20, meio: 'pix_automatico', indice: 'IPCA', base: 3, decimo: true, retencoes: ['IRRF 1,5%', 'CSRF 4,65%'], centro: 'cc-contabil', itens: [['contabil', 'Contabilidade e Lucro Real', 7200, 'até 3 filiais'], ['fiscal', 'Fiscal (apurações e SPED)', 4100], ['dp', 'Folha', 3500, 'até 60 funcionários']] },
  { id: 'ch-c1', cliente: 'c1', numero: 'CT-0420', versao: 3, desde: '2026-01', dia: 20, meio: 'boleto', indice: 'INPC', base: 1, decimo: true, retencoes: ['IRRF 1,5%'], centro: 'cc-contabil', indicado: 'Sindicato da Indústria', itens: [['contabil', 'Contabilidade', 2900], ['fiscal', 'Fiscal', 2600, 'até 150 notas/mês'], ['dp', 'Folha', 2000, 'até 25 funcionários']] },
  { id: 'ch-c3', cliente: 'c3', numero: 'CT-0457', versao: 2, desde: '2025-05', dia: 15, meio: 'boleto', indice: 'IPCA', base: 5, decimo: true, retencoes: [], centro: 'cc-fiscal', faixa: '168 notas/mês nos últimos 3 meses (contrato: até 120)', itens: [['bpo_financeiro', 'BPO financeiro', 1380, 'até 500 lançamentos'], ['contabil', 'Contabilidade e Simples', 2200], ['fiscal', 'Fiscal e notas', 1400, 'até 120 notas/mês'], ['dp', 'Folha', 800, 'até 5 funcionários']] },
  { id: 'ch-c4', cliente: 'c4', numero: 'CT-0512', versao: 1, desde: '2026-10', dia: 25, meio: 'pix', indice: 'IPCA', base: 10, decimo: false, retencoes: ['ISS 2% (tomador)'], centro: 'cc-contabil', itens: [['bpo_financeiro', 'BPO financeiro', 1200, 'até 300 lançamentos'], ['contabil', 'Contabilidade', 2100], ['fiscal', 'Fiscal e ISS', 1800]] },
  { id: 'ch-c2', cliente: 'c2', numero: 'CT-0431', versao: 2, desde: '2026-02', dia: 20, meio: 'boleto', indice: 'IPCA', base: 2, decimo: true, retencoes: [], centro: 'cc-dp', faixa: '8 funcionários desde out/26 (contrato: até 6)', itens: [['bpo_financeiro', 'BPO financeiro', 1450, 'até 500 lançamentos'], ['contabil', 'Contabilidade e Simples', 1100], ['dp', 'Folha', 800, 'até 6 funcionários']] },
  { id: 'ch-c8', cliente: 'c8', numero: 'CT-0701', versao: 1, desde: '2026-09', dia: 20, meio: 'boleto', indice: 'IPCA', base: 9, decimo: false, retencoes: [], centro: 'cc-bpo', itens: [['bpo_financeiro', 'BPO financeiro', 3200, 'até 1.200 lançamentos']] },
  { id: 'ch-c9', cliente: 'c9', numero: 'CT-0702', versao: 1, desde: '2026-09', dia: 20, meio: 'boleto', indice: 'IPCA', base: 9, decimo: false, retencoes: [], centro: 'cc-bpo', itens: [['bpo_financeiro', 'BPO financeiro', 890, 'até 150 lançamentos']] },
  { id: 'ch-c10', cliente: 'c10', numero: 'CT-0703', versao: 1, desde: '2026-09', dia: 20, meio: 'boleto', indice: 'IPCA', base: 9, decimo: false, retencoes: [], centro: 'cc-bpo', itens: [['bpo_financeiro', 'BPO financeiro', 1100, 'até 400 lançamentos']] },
]

/** Resto da carteira do Andrade (fora dos 10 clientes de exemplo): só nos totais. */
export const carteiraAgregada = { clientes: 132, receita: 165_900, semContrato: 4 }

export function sementeS07Andrade(_foto: Fotografia, add: Add) {
  base(add, { banco: 'Banco Inter (API PJ)', conta: 'ag 0001 · cc 1234567-8', ultimo: 1191, autorizacoes: 41 })
  add('centro_custo', { id: 'cc-carteira-fernanda', nome: 'Carteira Fernanda (sócia)', tipo: 'carteira_de_socio', setor_codigo: null, entra_no_custo_hora: false, ativo: true })
  add('centro_custo', { id: 'cc-carteira-joao', nome: 'Carteira João (sócio)', tipo: 'carteira_de_socio', setor_codigo: null, entra_no_custo_hora: false, ativo: true })

  // Contratos e itens vigentes; versões antigas aparecem como aditivos.
  const itensDe: Record<string, ItemContrato[]> = {}
  for (const m of moldes) {
    add('contrato_honorarios', { id: m.id, cliente_id: m.cliente, numero: m.numero, versao: m.versao, vigente_de: m.desde, situacao: 'ativo', dia_vencimento: m.dia, meio_pagamento: m.meio, indice: m.indice, data_base: m.base, politica_13o: m.decimo ? 'dezembro' : 'nenhum', retencoes: m.retencoes, centro_custo_id: m.centro, indicado_por: m.indicado ?? null, faixa_estourada: m.faixa ?? null })
    itensDe[m.id] = m.itens.map(([servico, descricao, valor, faixa], k) =>
      add('item_contrato', { id: `${m.id}-i${k + 1}`, contrato_id: m.id, servico, descricao, setor_id: tabServicos[servico].setor, valor, tipo_cobranca: faixa ? 'por_faixa' : 'fixo', faixa: faixa ?? null, vigente_de: m.desde, vigente_ate: null, ordem: k + 1 }),
    )
    if (m.versao > 1) add('aditivo', { id: `${m.id}-ad${m.versao}`, contrato_id: m.id, tipo: 'reajuste', situacao: 'vigente', vigente_de: m.desde, resumo: `Reajuste anual pelo ${m.indice}`, diff: [{ campo: 'total', antes: 'versão anterior', depois: `R$ ${m.itens.reduce((s, i) => s + i[2], 0).toLocaleString('pt-BR')}` }], versao_para: m.versao, comunicado_em: '2025-12-01T09:00:00.000Z' })
  }

  // Contas bancárias do escritório (titular: escritório).
  add('conta_bancaria', { id: 'bc-inter', titular_tipo: 'escritorio', nome: 'Inter PJ (cobrança)', banco: 'Banco Inter', tipo: 'conta_cobranca', conta_mascarada: 'ag 0001 · cc •••567-8', origem: 'api_banco', saldo: 96_420, saldo_em: '2026-11-18T07:56:00.000Z', situacao: 'ativa' })
  add('conta_bancaria', { id: 'bc-itau', titular_tipo: 'escritorio', nome: 'Itaú PJ (pagamentos)', banco: 'Itaú', tipo: 'corrente', conta_mascarada: 'ag 0912 · cc •••44-1', origem: 'open_finance', saldo: 58_310, saldo_em: '2026-11-18T06:00:00.000Z', situacao: 'ativa', consentimento_ate: '2026-12-02' })
  add('conta_bancaria', { id: 'bc-cartao', titular_tipo: 'escritorio', nome: 'Cartão Itaú Empresas', banco: 'Itaú', tipo: 'cartao', conta_mascarada: 'final 4410', origem: 'open_finance', saldo: -6_840, saldo_em: '2026-11-10T06:00:00.000Z', situacao: 'consentimento_vencido', consentimento_ate: '2026-11-10', fatura_fecha: 'fecha 25/11' })

  // Cobranças de outubro (pagas ou em acordo) e de novembro (o lote do mês).
  const contrato = (cli: string) => moldes.find((m) => m.cliente === cli)!
  let n = 1180
  const nota = (cb: Cobranca, porServico = true, situacao: 'emitida' | 'rejeitada' = 'emitida', soEste?: string) => {
    for (const g of gruposDeNota(cb.linhas, porServico)) {
      const st = soEste && g.codigo === soEste ? situacao : 'emitida'
      add('nota_servico_escritorio', { id: `ne-${cb.id}-${g.codigo}`, cobranca_id: cb.id, cliente_id: cb.cliente_id, numero: st === 'rejeitada' ? '—' : `2026/${++n}`, competencia: cb.competencia, servico: g.servico, codigo: g.codigo, iss: g.iss, valor: g.valor, retencoes: contrato(cb.cliente_id)?.retencoes ?? [], situacao: st, motivo: st === 'rejeitada' ? 'Prefeitura recusou: ISS retido sem o código do serviço do tomador' : null })
    }
  }
  const cobranca = (id: string, cli: string, comp: string, venc: string, extra: LinhaCobranca[], resto: Partial<Cobranca> = {}) => {
    const m = contrato(cli)
    const linhas = [...linhasDoContrato(itensDe[m.id], `${id}-l`), ...extra]
    const valor = +linhas.reduce((s, l) => s + l.valor, 0).toFixed(2)
    return add('cobranca', { id, cliente_id: cli, numero: `FAT-${comp.replace('-', '')}-${m.numero.slice(3)}`, competencia: comp, origem: 'lote', linhas, valor, vencimento: venc, meio: m.meio, situacao: 'emitida', lote_id: `lf-${comp}`, historico: [{ quando: `${comp}-01T06:10:00.000Z`, texto: `Cobrança gerada pelo lote: ${linhas.length} linha(s), ${valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}` }], ...resto })
  }
  // Outubro
  const out = [
    cobranca('cb-c5-10', 'c5', '2026-10', '2026-10-20', [], { situacao: 'paga', paga_em: '2026-10-20' }),
    cobranca('cb-c1-10', 'c1', '2026-10', '2026-10-20', [], { situacao: 'paga', paga_em: '2026-10-19' }),
    cobranca('cb-c3-10', 'c3', '2026-10', '2026-10-15', [], { situacao: 'paga', paga_em: '2026-10-15' }),
    cobranca('cb-c2-10', 'c2', '2026-10', '2026-10-20', [], {
      situacao: 'em_acordo',
      regua_etapa: 'acordo',
      historico: [
        { quando: '2026-10-01T06:10:00.000Z', texto: 'Cobrança gerada pelo lote' },
        { quando: '2026-10-30T09:00:00.000Z', texto: 'D+10: cobrança firme enviada (aprovada por Fernanda Lima)' },
        { quando: '2026-11-03T10:20:00.000Z', texto: 'Acordo em 2 parcelas proposto pelo integrante Financeiro e aprovado por Fernanda Lima' },
        { quando: '2026-11-11T08:00:00.000Z', texto: '1ª parcela paga' },
      ],
    }),
  ]
  out.forEach((cb) => nota(cb))
  add('parcela', { id: 'pc-c2-10-1', cobranca_id: 'cb-c2-10', numero: 1, vencimento: '2026-11-11', valor: 1675, situacao: 'paga' })
  add('parcela', { id: 'pc-c2-10-2', cobranca_id: 'cb-c2-10', numero: 2, vencimento: '2026-12-11', valor: 1675, situacao: 'aberta', linha_digitavel: '07790.00116 12345.678901 23456.789012 1 99990000167500' })
  // Novembro
  const nov = [
    cobranca('cb-c5-11', 'c5', '2026-11', '2026-11-20', [{ id: 'cb-c5-11-r', tipo: 'reembolso', descricao: 'Reembolso: certidões estaduais (3 filiais)', valor: 96.9, ref_id: 'da-cert' }], { regua_etapa: 'D-5' }),
    cobranca(
      'cb-c1-11',
      'c1',
      '2026-11',
      '2026-11-20',
      [
        { id: 'cb-c1-11-a', tipo: 'avulso', descricao: 'Alteração contratual (entrada de sócio)', valor: 1200, codigo: '17.19', servico: 'societario', ref_id: 'sa-alteracao' },
        { id: 'cb-c1-11-r', tipo: 'reembolso', descricao: 'Reembolso: taxa da Junta', valor: 548.3, ref_id: 'da-junta' },
      ],
      { regua_etapa: 'D-5' },
    ),
    cobranca('cb-c3-11', 'c3', '2026-11', '2026-11-15', [{ id: 'cb-c3-11-f', tipo: 'avulso', descricao: '48 notas acima da faixa em outubro', valor: 336, codigo: '17.19', servico: 'fiscal', ref_id: 'sa-faixa-c3' }], {
      regua_etapa: 'D+3',
      historico: [
        { quando: '2026-11-01T06:10:00.000Z', texto: 'Cobrança gerada pelo lote: honorário, BPO e 48 notas acima da faixa' },
        { quando: '2026-11-10T09:00:00.000Z', texto: 'Lembrete D-5 enviado pelo WhatsApp (lido)' },
        { quando: '2026-11-15T09:00:00.000Z', texto: 'Aviso no vencimento enviado (lido)' },
        { quando: '2026-11-18T09:00:00.000Z', texto: 'D+3: 2ª via atualizada enviada sozinha pelo integrante' },
      ],
    }),
    cobranca('cb-c4-11', 'c4', '2026-11', '2026-11-25', [], { historico: [{ quando: '2026-11-01T06:10:00.000Z', texto: 'Cobrança gerada pelo lote' }, { quando: '2026-11-01T06:11:00.000Z', texto: 'NFS-e do honorário contábil recusada pela prefeitura: ISS retido sem o código do serviço do tomador' }] }),
    cobranca('cb-c2-11', 'c2', '2026-11', '2026-11-20', [], { regua_etapa: 'D-5' }),
    cobranca('cb-c8-11', 'c8', '2026-11', '2026-11-20', [], { situacao: 'paga', paga_em: '2026-11-16' }),
    cobranca('cb-c9-11', 'c9', '2026-11', '2026-11-20', [], { regua_pausada_ate: '2026-11-21', regua_pausa_motivo: 'o cliente informou "pago" no app em 17/11', historico: [{ quando: '2026-11-01T06:10:00.000Z', texto: 'Cobrança gerada pelo lote' }, { quando: '2026-11-17T15:42:00.000Z', texto: 'Ana (Studio Forma) tocou em "pago" no app: régua pausada por 3 dias úteis até o extrato confirmar' }] }),
    cobranca('cb-c10-11', 'c10', '2026-11', '2026-11-20', []),
  ]
  nov.forEach((cb) => nota(cb, true, cb.id === 'cb-c4-11' ? 'rejeitada' : 'emitida', cb.id === 'cb-c4-11' ? '17.19' : undefined))
  // Uma nota cancelada e substituída (lista das notas do escritório, com estados).
  add('nota_servico_escritorio', { id: 'ne-c5-10-cancelada', cobranca_id: 'cb-c5-10', cliente_id: 'c5', numero: '2026/1175', competencia: '2026-10', servico: notaDoGrupo.contabil.servico, codigo: '17.19', iss: '2%', valor: 14800, retencoes: ['IRRF 1,5%'], situacao: 'substituida', motivo: 'Faltou a retenção de CSRF; substituída pela 2026/1181' })

  // Recebimentos: os confirmados, um informado no app e dois sem cobrança.
  for (const cb of [...out, ...nov].filter((c) => c.situacao === 'paga')) add('recebimento', { id: `rc-${cb.id}`, cobranca_id: cb.id, valor: cb.valor, pago_em: cb.paga_em!, meio: cb.meio === 'pix_automatico' ? 'Pix Automático' : cb.meio === 'pix' ? 'Pix' : 'Boleto', tarifa: cb.meio === 'boleto' ? 1.9 : cb.meio === 'pix_automatico' ? 0.9 : 0, pagador: cb.cliente_id, origem: 'webhook', situacao: 'confirmado' })
  add('recebimento', { id: 'rc-c2-p1', cobranca_id: 'cb-c2-10', parcela_id: 'pc-c2-10-1', valor: 1675, pago_em: '2026-11-11', meio: 'Boleto', tarifa: 1.9, pagador: 'c2', origem: 'webhook', situacao: 'confirmado' })
  add('recebimento', { id: 'rc-c9-informado', cobranca_id: 'cb-c9-11', valor: 890, pago_em: '2026-11-17', meio: 'Pix', tarifa: 0, pagador: 'Studio Forma (informado no app)', origem: 'informado_pelo_cliente', situacao: 'informado', comprovante: 'comprovante-pix-studio.jpg' })
  add('recebimento', { id: 'rc-solto-1', valor: 1675, pago_em: '2026-11-16', meio: 'TED', tarifa: 0, pagador: 'PAO QUENTE PADARIA ME', pagador_documento: '23.456.789/0001-01', origem: 'conciliacao', situacao: 'nao_localizado', sugestao_cobranca_id: 'cb-c2-10' })
  add('recebimento', { id: 'rc-solto-2', valor: 3200, pago_em: '2026-11-14', meio: 'Pix', tarifa: 0, pagador: 'R. SILVEIRA', pagador_documento: '***.456.789-**', origem: 'conciliacao', situacao: 'nao_localizado' })

  // Extras e reembolsos: faturados em novembro, a faturar em dezembro, comanda (C2-25) e certificado (C2-23).
  add('despesa_adiantada', { id: 'da-junta', cliente_id: 'c1', tipo: 'Taxa da Junta', descricao: 'Taxa da Junta: alteração contratual', valor: 548.3, pago_em: '2026-10-28', adiantado_por: 'Bruno Costa', comprovante: 'darf-junta-2810.pdf', situacao: 'na_fatura', cobranca_id: 'cb-c1-11' })
  add('despesa_adiantada', { id: 'da-cert', cliente_id: 'c5', tipo: 'Certidões', descricao: 'Certidões estaduais (3 filiais)', valor: 96.9, pago_em: '2026-11-03', adiantado_por: 'agregador de certidões', comprovante: 'certidoes-0311.pdf', situacao: 'na_fatura', cobranca_id: 'cb-c5-11' })
  add('despesa_adiantada', { id: 'da-cartorio', cliente_id: 'c1', tipo: 'Cartório', descricao: 'Reconhecimento de firma (2 sócios)', valor: 38.5, pago_em: '2026-11-12', adiantado_por: 'Bruno Costa', comprovante: 'recibo-cartorio-1211.jpg', situacao: 'conferida' })
  add('servico_avulso', { id: 'sa-alteracao', cliente_id: 'c1', atividade_id: 'SOC-031', descricao: 'Alteração contratual (entrada de sócio)', valor: 1200, origem: 'pedido_app', situacao: 'faturado', aceite_ref: 'aceite no app por Ricardo Andrade em 27/10', cobranca_id: 'cb-c1-11' })
  add('servico_avulso', { id: 'sa-faixa-c3', cliente_id: 'c3', descricao: '48 notas acima da faixa em outubro', valor: 336, origem: 'faixa', situacao: 'faturado', aceite_ref: 'cláusula 4 do contrato (excedente por nota)', cobranca_id: 'cb-c3-11' })
  add('servico_avulso', { id: 'sa-irpf', cliente_id: 'c6', atividade_id: 'IRPF-001', descricao: 'IRPF 2026 retificadora', valor: 450, origem: 'conversa', situacao: 'a_faturar', aceite_ref: 'aceite por WhatsApp em 05/11' })
  add('servico_avulso', { id: 'sa-capacidade', cliente_id: 'c5', atividade_id: 'SOC-040', descricao: 'Declaração de capacidade financeira (licitação)', valor: 350, origem: 'tarefa', tarefa_id: 's07-tk-capacidade', situacao: 'proposto' })
  add('servico_avulso', { id: 'sa-certificado', cliente_id: 'c4', atividade_id: 'C2-23', descricao: 'Certificado digital A1 (e-CNPJ) vendido como serviço', valor: 220, origem: 'certificado', situacao: 'proposto', fase: 3 })
  // A comanda de serviço extra (C2-25): a tarefa marcada como extra pela equipe; vira avulso a aceitar.
  add('tarefa', {
    id: 's07-tk-extra-c1',
    atividade_id: 'DP-030',
    titulo: 'Rescisão de 2 empregados fora da folha',
    cliente_id: 'c1',
    setor_id: 'dp',
    status: 'em_andamento',
    status_desde: '2026-11-17T10:00:00.000Z',
    prazo_interno: '2026-11-22',
    responsavel_tipo: 'usuario',
    responsavel_id: 'u3',
    origem: 'pessoa',
    quem_conclui: 'pessoa',
    prioridade: 'normal',
    checklist: [],
    risco: false,
    extras: { responsavel_nome: 'Ana Souza', servico_extra: { descricao: 'Rescisão de 2 empregados fora da folha (comanda)', quantidade: 2, marcada_por: 'Ana Souza', marcada_em: '2026-11-17' } },
  })
  add('tarefa', {
    id: 's07-tk-capacidade',
    atividade_id: 'SOC-040',
    titulo: 'Declaração de capacidade financeira para licitação',
    cliente_id: 'c5',
    setor_id: 'societario',
    status: 'a_fazer',
    status_desde: '2026-11-18T08:00:00.000Z',
    prazo_interno: '2026-11-25',
    responsavel_tipo: 'usuario',
    responsavel_id: 'u4',
    origem: 'pessoa',
    quem_conclui: 'pessoa',
    prioridade: 'normal',
    checklist: [],
    risco: false,
    extras: { responsavel_nome: 'Bruno Costa', servico_extra: { descricao: 'Declaração de capacidade financeira', marcada_por: 'Bruno Costa', marcada_em: '2026-11-18', avulso_id: 'sa-capacidade' } },
  })

  // Lote de dezembro preparado pelo integrante (o cartão fik1 do chat do Financeiro).
  const demoDez = moldes.reduce((s, m) => s + m.itens.reduce((x, i) => x + i[2], 0), 0)
  const decimos = moldes.filter((m) => m.decimo).reduce((s, m) => s + m.itens.filter((i) => i[0] !== 'bpo_financeiro').reduce((x, i) => x + i[2], 0), 0)
  const demoTotal = demoDez + decimos + 450 + 38.5
  add('lote_faturamento', {
    id: `lf-${PROXIMA_COMPETENCIA}`,
    competencia: PROXIMA_COMPETENCIA,
    situacao: 'preparado',
    quantidade: 142,
    total: 203_120,
    decimos: 61,
    avulsos: 9,
    excecoes: [
      { cliente_id: 'c7', motivo: 'sem contrato estruturado: honorário não informado' },
      { cliente_id: 'c6', motivo: 'só avulso (IRPF retificadora): sai em cobrança própria' },
      { cliente_id: 'c4', motivo: 'NFS-e de novembro rejeitada: corrigir o código do serviço antes' },
    ],
    mudancas: ['13º de 61 contratos (política "dezembro")', 'Loja Bela Vista: contagem de notas acima da faixa entra se não houver aditivo até 30/11', 'Metalúrgica Andrade: reembolso de cartório (R$ 38,50)', 'Carlos Menezes: IRPF retificadora (R$ 450) em cobrança própria'],
    cartao_id: 'fik1',
    agregado: { clientes: 134, valor: +(203_120 - demoTotal).toFixed(2) },
  })
  add('lote_faturamento', { id: 'lf-2026-11', competencia: '2026-11', situacao: 'emitido', quantidade: 141, total: 201_340, decimos: 0, avulsos: 7, excecoes: [], mudancas: [], cartao_id: null, agregado: { clientes: 133, valor: 160_000 } })
  add('fechamento_financeiro', { id: 'ff-2026-10', competencia: '2026-10', situacao: 'fechado', fechado_por: 'Fernanda Lima', fechado_em: '2026-11-05T18:20:00.000Z', custo_hora: 142 })
  add('fechamento_financeiro', { id: 'ff-2026-11', competencia: '2026-11', situacao: 'aberto' })

  // Contas a pagar do escritório (09, 6.1).
  const cp = (id: string, fornecedor: string, categoria: string, valor: number, vencimento: string, origem: Tabelas['conta_pagar']['origem'], situacao: Tabelas['conta_pagar']['situacao'], resto: Partial<Tabelas['conta_pagar']> = {}) =>
    add('conta_pagar', { id, titular_tipo: 'escritorio', fornecedor, categoria, valor, vencimento, competencia: vencimento.slice(0, 7), origem, situacao, centro_custo_id: 'cc-estrutura', ...resto })
  cp('cp1', 'Aluguel · Imobiliária Centro', 'Ocupação', 9_800, '2026-11-20', 'recorrente', 'agendada', { aprovador_nome: 'Fernanda Lima' })
  cp('cp2', 'Domínio Sistemas', 'Software', 2_340, '2026-11-22', 'dda', 'aguardando_aprovacao', { codigo_barras: '23793.38128 60082.345678 91000.012345 7 99880000234000', fornecedor_documento: '75.123.456/0001-90' })
  cp('cp3', 'Heild (esta assinatura)', 'Software', 1_690, '2026-12-01', 'email', 'aprovada', { aprovador_nome: 'Fernanda Lima' })
  cp('cp4', 'Certisign: 3 e-CPF', 'Certificados', 597, '2026-11-24', 'email', 'aguardando_aprovacao')
  cp('cp5', 'DAS do escritório (out/26)', 'DAS', 11_480, '2026-11-20', 'dda', 'aguardando_aprovacao', { centro_custo_id: 'cc-estrutura' })
  cp('cp6', 'Integra Contador (Serpro)', 'APIs e serviços', 812.4, '2026-11-18', 'dda', 'aguardando_aprovacao', { rateio: [{ centro_custo_id: 'cc-fiscal', percentual: 60 }, { centro_custo_id: 'cc-societario', percentual: 25 }, { centro_custo_id: 'cc-dp', percentual: 15 }] })
  cp('cp7', 'Domínio Sistemas', 'Software', 2_340, '2026-11-22', 'email', 'aguardando_aprovacao', { alerta: 'possível duplicidade: mesmo valor e vencimento do boleto do DDA (cp2)', codigo_barras: '23793.38128 60082.345678 91000.012345 7 99880000234000' })
  cp('cp8', 'Gráfica Rápida Ltda', 'Material de escritório', 1_280, '2026-11-23', 'email', 'aguardando_aprovacao', { alerta: 'fornecedor novo: confira o CNPJ do beneficiário antes de aprovar', fornecedor_documento: '44.987.321/0001-55' })
  cp('cp9', 'Folha de outubro (líquido)', 'Salários e encargos', 78_420, '2026-11-05', 'recorrente', 'paga', { aprovador_nome: 'Fernanda Lima', comprovante: 'comprovante-folha-out.pdf', competencia: '2026-10' })
  cp('cp10', 'Energia · Enel', 'Ocupação', 1_134.7, '2026-11-19', 'dda', 'agendada', { aprovador_nome: 'Fernanda Lima' })
  cp('cp11', 'Google Workspace', 'Software', 1_062, '2026-12-15', 'email', 'capturada', { alerta: null })

  // Extrato: o que casou sozinho, o que o integrante sugere e o que diverge.
  const lc = (id: string, conta: string, data: string, descricao_extrato: string, valor: number, situacao: Tabelas['lancamento']['situacao'], resto: Partial<Tabelas['lancamento']> = {}) =>
    add('lancamento', { id, titular_tipo: 'escritorio', conta_id: conta, data, valor, descricao_extrato, origem: conta === 'bc-inter' ? 'provedor' : 'open_finance', situacao, ...resto })
  lc('lc-a1', 'bc-inter', '2026-11-16', 'PIX REC MERCADO BOM PRECO', 3_200, 'conciliado', { categoria: 'Honorários mensais', vinculo: { tipo: 'cobranca', id: 'cb-c8-11' } })
  lc('lc-a2', 'bc-itau', '2026-11-05', 'PAG FOLHA OUT/26', -78_420, 'conciliado', { categoria: 'Salários e encargos', vinculo: { tipo: 'conta_pagar', id: 'cp9' } })
  lc('lc-a3', 'bc-inter', '2026-11-11', 'BOLETO LIQ PAO QUENTE', 1_675, 'conciliado', { categoria: 'Honorários mensais', vinculo: { tipo: 'cobranca', id: 'cb-c2-10' } })
  lc('lc-a4', 'bc-itau', '2026-11-10', 'TAR PACOTE SERVICOS', -89, 'conciliado', { categoria: 'Tarifas bancárias', regra_id: 'rg-tarifa' })
  lc('lc-a5', 'bc-itau', '2026-11-07', 'ENEL DISTRIB SP', -1_098.2, 'conciliado', { categoria: 'Ocupação', regra_id: 'rg-enel' })
  lc('lc-a6', 'bc-cartao', '2026-11-04', 'AMAZON AWS', -412.3, 'conciliado', { categoria: 'APIs e serviços', regra_id: 'rg-aws' })
  lc('lc-t1', 'bc-itau', '2026-11-16', 'TAR PACOTE SERVICOS', -89, 'sugerido', { sugestao: 'Tarifas bancárias', confianca: 'alta', regra_id: 'rg-tarifa' })
  lc('lc-t2', 'bc-cartao', '2026-11-15', 'GOOGLE *WORKSPACE', -1_062, 'sugerido', { sugestao: 'Software', confianca: 'alta' })
  lc('lc-t3', 'bc-itau', '2026-11-15', 'PIX ENV JOAO P SANTOS', -1_500, 'sugerido', { sugestao: 'Reembolso a colaborador', confianca: 'baixa' })
  lc('lc-t4', 'bc-inter', '2026-11-14', 'TRANSF ENTRE CONTAS', -40_000, 'sugerido', { sugestao: 'Transferência entre contas', confianca: 'alta' })
  lc('lc-t5', 'bc-itau', '2026-11-14', 'PAG BOLETO 03399.12345 CERTISIGN', -597, 'sugerido', { sugestao: 'Certificados', confianca: 'alta' })
  lc('lc-t6', 'bc-cartao', '2026-11-13', 'UBER *TRIP', -46.9, 'sugerido', { sugestao: 'Deslocamento', confianca: 'baixa' })
  lc('lc-d1', 'bc-inter', '2026-11-14', 'PIX REC 12.345.678 R SILVEIRA', 3_200, 'nao_conciliado', { divergencia: 'Pagador desconhecido (R. SILVEIRA): nenhuma cobrança com esse valor ou CPF' })
  lc('lc-d2', 'bc-inter', '2026-11-16', 'TED REC PAO QUENTE PADARIA ME', 1_675, 'nao_conciliado', { divergencia: 'A Padaria pagou a 2ª parcela do acordo antes do vencimento (11/12): baixar a parcela?', sugestao: 'Parcela 2 do acordo de out/26 (Padaria Pão Quente)' })
  add('regra_categorizacao', { id: 'rg-tarifa', padrao: 'TAR PACOTE SERVICOS', categoria: 'Tarifas bancárias', situacao: 'ativa', vezes: 11, aprovada_por: 'Fernanda Lima' })
  add('regra_categorizacao', { id: 'rg-enel', padrao: 'ENEL DISTRIB', categoria: 'Ocupação', situacao: 'ativa', vezes: 8, aprovada_por: 'Fernanda Lima' })
  add('regra_categorizacao', { id: 'rg-aws', padrao: 'AMAZON AWS', categoria: 'APIs e serviços', situacao: 'ativa', vezes: 6, aprovada_por: 'Fernanda Lima' })
  add('regra_categorizacao', { id: 'rg-google', padrao: 'GOOGLE *WORKSPACE', categoria: 'Software', situacao: 'proposta', vezes: 4, exemplo: '15/11 · R$ 1.062,00' })
  add('regra_categorizacao', { id: 'rg-uber', padrao: 'UBER *TRIP', categoria: 'Deslocamento', centro_custo_id: 'cc-societario', situacao: 'proposta', vezes: 6, exemplo: '13/11 · R$ 46,90' })

  add('cenario_caixa', { id: 'cx-perda', nome: 'Perder os 2 maiores clientes em março', ajuste_entradas: -22, ajuste_saidas: 0, premissas: 'Rota Sul e Metalúrgica saem com o aviso de 30 dias', autor: 'Fernanda Lima' })
}

/** O escritório em implantação: sem contratos ainda (estados vazios e o "trazer o financeiro atual"). */
export function sementeS07Horizonte(_foto: Fotografia, add: Add) {
  base(add, { banco: 'a escolher', conta: '—', ultimo: 0, autorizacoes: 0 })
  add('conta_bancaria', { id: 'bc-h-sicredi', titular_tipo: 'escritorio', nome: 'Sicredi PJ', banco: 'Sicredi', tipo: 'corrente', conta_mascarada: 'ag 0730 · cc •••21-9', origem: 'manual', saldo: 18_240, saldo_em: '2026-11-17T18:00:00.000Z', situacao: 'ativa' })
  add('fechamento_financeiro', { id: 'ff-h-2026-11', competencia: '2026-11', situacao: 'aberto' })
}

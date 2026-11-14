import type { Data, DataHora, Id, Registro } from './entidades'

/*
 * S07 · Entidades do Financeiro do escritório (subplano 09, 3.1), com os nomes
 * e os estados do plano. O que é derivado não se grava: "vencida" sai da
 * cobrança emitida com vencimento passado (09, 3.1).
 *
 * Titular (DA-02.1; 09, 10.6): conta bancária, lançamento e conta a pagar têm
 * `titular_tipo`; no escritório é `escritorio`; o BPO (S08) pode usar as
 * mesmas tabelas com `empresa` e o `titular_cliente_id` da empresa.
 *
 * Competência é `AAAA-MM`; datas são ISO (`2026-11-20`).
 */

export type Competencia = string
export type MeioPagamento = 'boleto' | 'pix' | 'pix_automatico' | 'debito'
export type ServicoContrato = 'contabil' | 'fiscal' | 'dp' | 'societario' | 'consultoria' | 'atendimento' | 'bpo_financeiro' | 'emissao_nfse'
export type TitularTipo = 'escritorio' | 'empresa'

/** Contrato de honorários: um ativo por cliente; mudança é aditivo (nova versão), nunca edição. */
export interface ContratoHonorarios extends Registro {
  cliente_id: Id
  numero: string
  versao: number
  /** Competência a partir da qual a versão vale. */
  vigente_de: Competencia
  vigente_ate?: Competencia | null
  situacao: 'rascunho' | 'aguardando_assinatura' | 'ativo' | 'suspenso' | 'encerrado' | 'cancelado'
  dia_vencimento: number
  meio_pagamento: MeioPagamento
  indice: 'IPCA' | 'INPC' | 'IGP-M' | 'salário mínimo' | 'sem reajuste'
  /** Mês da data-base do reajuste (1 a 12; 0 sem reajuste). */
  data_base: number
  politica_13o: 'nenhum' | 'dezembro' | 'duas_parcelas' | 'diluido'
  retencoes: string[]
  centro_custo_id?: Id | null
  indicado_por?: string | null
  /** Medição do GES-015: o que passou da faixa no mês (vazio = dentro). */
  faixa_estourada?: string | null
  encerrado_motivo?: string | null
}

/** Item do contrato: tem vigência própria; mudar valor fecha o item e abre outro. */
export interface ItemContrato extends Registro {
  contrato_id: Id
  servico: ServicoContrato
  descricao: string
  /** Setor que recebe a receita (código do setor fixo). */
  setor_id: string
  valor: number
  tipo_cobranca: 'fixo' | 'por_faixa' | 'por_unidade'
  faixa?: string | null
  vigente_de: Competencia
  vigente_ate?: Competencia | null
}

/** Aditivo: reajuste, escopo, faixa, desconto, vencimento ou rescisão (com o diff da versão). */
export interface Aditivo extends Registro {
  contrato_id: Id
  tipo: 'reajuste' | 'escopo' | 'faixa' | 'desconto' | 'vencimento' | 'rescisao'
  situacao: 'proposto' | 'comunicado' | 'aguardando_assinatura' | 'aceito' | 'vigente' | 'recusado'
  vigente_de: Competencia
  resumo: string
  diff: { campo: string; antes: string; depois: string }[]
  versao_para: number
  comunicado_em?: DataHora | null
  /** Assinatura eletrônica (API-22, demonstração). */
  assinatura?: { provedor: string; enviada_em: DataHora; assinada_em?: DataHora | null; signatario: string } | null
}

/** Tabela de avulsos: preço do escritório por atividade do catálogo (GES-002). */
export interface ItemTabelaAvulsos extends Registro {
  atividade_id: string
  nome: string
  valor_padrao: number
  unidade: 'ocorrencia' | 'hora' | 'por_empregado'
  exige_aceite: boolean
  ativo: boolean
}

/** Serviço avulso: só fatura com aceite (comanda C2-25 e certificado C2-23 entram aqui). */
export interface ServicoAvulso extends Registro {
  cliente_id: Id
  atividade_id?: string | null
  descricao: string
  valor: number
  origem: 'tarefa' | 'comanda' | 'pedido_app' | 'conversa' | 'manual' | 'faixa' | 'certificado'
  tarefa_id?: Id | null
  situacao: 'proposto' | 'aceito' | 'a_faturar' | 'faturado' | 'cancelado'
  aceite_ref?: string | null
  cobranca_id?: Id | null
  /** Fase do plano em que o item entra (C2-23 é fase 3: aparece como "depois"). */
  fase?: number
  motivo?: string | null
}

/** Despesa adiantada (FIN-002): reembolso exige comprovante; perdoar exige motivo. */
export interface DespesaAdiantada extends Registro {
  cliente_id: Id
  tipo: string
  descricao: string
  valor: number
  pago_em: Data
  adiantado_por: string
  comprovante?: string | null
  situacao: 'registrada' | 'conferida' | 'na_fatura' | 'reembolsada' | 'perdoada' | 'cancelada'
  cobranca_id?: Id | null
  motivo?: string | null
}

/** Lote de faturamento: um por competência; aprovado por cartão em lote (GES-001). */
export interface LoteFaturamento extends Registro {
  competencia: Competencia
  situacao: 'preparado' | 'aprovado' | 'emitido' | 'parcial'
  quantidade: number
  total: number
  decimos: number
  avulsos: number
  excecoes: { cliente_id: Id; motivo: string }[]
  mudancas: string[]
  cartao_id?: Id | null
  /** Clientes de fora da demonstração (o resto da carteira), só nos totais. */
  agregado?: { clientes: number; valor: number }
}

export interface LinhaCobranca {
  id: string
  tipo: 'item' | 'avulso' | 'reembolso' | 'decimo' | 'desconto' | 'juros' | 'multa' | 'acordo'
  descricao: string
  valor: number
  /** Código da lista de serviços (LC 116) quando a linha sai com nota. */
  codigo?: string
  servico?: ServicoContrato
  ref_id?: Id | null
  nota_id?: Id | null
}

/** Cobrança (fatura): uma por cliente por mês, serviços em linhas. "Vencida" é derivada. */
export interface Cobranca extends Registro {
  cliente_id: Id
  numero: string
  competencia: Competencia
  origem: 'lote' | 'avulsa' | 'decimo' | 'reembolso' | 'acordo'
  linhas: LinhaCobranca[]
  valor: number
  vencimento: Data
  meio: MeioPagamento
  situacao: 'rascunho' | 'aguardando_aprovacao' | 'emitida' | 'paga_parcial' | 'paga' | 'em_acordo' | 'cancelada' | 'substituida' | 'baixada_perda'
  paga_em?: Data | null
  lote_id?: Id | null
  substitui_id?: Id | null
  motivo?: string | null
  /** Etapa da régua já cumprida ("D+3") e pausa (contestação, "pago" informado, acordo). */
  regua_etapa?: string | null
  regua_pausada_ate?: Data | null
  regua_pausa_motivo?: string | null
  /** Degraus do FIN-009 aplicados. */
  aviso_formal_em?: Data | null
  pausa_parcial_em?: Data | null
  historico: { quando: string; texto: string }[]
}

/** Parcela: a cobrança simples tem uma; acordo e 13º em duas vezes têm várias. */
export interface Parcela extends Registro {
  cobranca_id: Id
  numero: number
  vencimento: Data
  valor: number
  situacao: 'aberta' | 'aguardando_confirmacao' | 'paga' | 'cancelada'
  linha_digitavel?: string | null
  pix_copia_cola?: string | null
}

/** Recebimento: "informado" (botão pago) não baixa; só pausa a régua (09, 5.3). */
export interface Recebimento extends Registro {
  cobranca_id?: Id | null
  parcela_id?: Id | null
  valor: number
  pago_em: Data
  meio: string
  tarifa: number
  pagador: string
  pagador_documento?: string | null
  origem: 'webhook' | 'conciliacao' | 'manual' | 'informado_pelo_cliente'
  situacao: 'informado' | 'confirmado' | 'estornado' | 'nao_localizado'
  comprovante?: string | null
  /** Sugestão de vínculo por CNPJ do pagador (09, 8.5). */
  sugestao_cobranca_id?: Id | null
}

/** NFS-e do escritório: uma por serviço (`nfse_por_servico`, a confirmar na NT 007/2026). */
export interface NotaServicoEscritorio extends Registro {
  cobranca_id?: Id | null
  cliente_id: Id
  numero: string
  competencia: Competencia
  servico: string
  codigo: string
  iss: string
  valor: number
  retencoes: string[]
  situacao: 'rascunho' | 'emitida' | 'rejeitada' | 'cancelada' | 'substituida'
  motivo?: string | null
  substitui_id?: Id | null
}

export interface ContaBancaria extends Registro {
  titular_tipo: TitularTipo
  titular_cliente_id?: Id | null
  nome: string
  banco: string
  tipo: 'corrente' | 'conta_cobranca' | 'cartao' | 'caixa'
  conta_mascarada: string
  origem: 'open_finance' | 'api_banco' | 'ofx' | 'manual'
  saldo: number
  saldo_em: DataHora
  situacao: 'ativa' | 'inativa' | 'consentimento_vencido'
  consentimento_ate?: Data | null
  fatura_fecha?: string | null
}

/** Lançamento do extrato: imutável no valor; correção é lançamento de ajuste. */
export interface Lancamento extends Registro {
  titular_tipo: TitularTipo
  titular_cliente_id?: Id | null
  conta_id: Id
  data: Data
  valor: number
  descricao_extrato: string
  origem: 'open_finance' | 'ofx' | 'provedor' | 'manual'
  situacao: 'nao_conciliado' | 'sugerido' | 'conciliado' | 'transferencia' | 'ignorado'
  categoria?: string | null
  centro_custo_id?: Id | null
  sugestao?: string | null
  confianca?: 'alta' | 'baixa' | null
  regra_id?: Id | null
  vinculo?: { tipo: 'cobranca' | 'conta_pagar' | 'transferencia' | 'ajuste'; id?: Id | null } | null
  /** Divergência que pede pessoa (pagador desconhecido, valor diferente). */
  divergencia?: string | null
  ajuste_de?: Id | null
}

/** Conta a pagar (FIN-003): paga só com aprovação por alçada; a liberação final é no banco. */
export interface ContaPagarFin extends Registro {
  titular_tipo: TitularTipo
  titular_cliente_id?: Id | null
  fornecedor: string
  fornecedor_documento?: string | null
  valor: number
  vencimento: Data
  competencia: Competencia
  origem: 'dda' | 'email' | 'manual' | 'recorrente' | 'codigo_barras' | 'arquivo' | 'whatsapp'
  categoria: string
  centro_custo_id?: Id | null
  rateio?: { centro_custo_id: Id; percentual: number }[] | null
  codigo_barras?: string | null
  situacao: 'capturada' | 'classificada' | 'aguardando_aprovacao' | 'aprovada' | 'agendada' | 'paga' | 'contestada' | 'cancelada'
  alerta?: string | null
  aprovador_id?: Id | null
  aprovador_nome?: string | null
  comprovante?: string | null
  motivo?: string | null
}

export interface CentroCusto extends Registro {
  nome: string
  tipo: 'setor' | 'estrutura' | 'comercial' | 'carteira_de_socio'
  setor_codigo?: string | null
  entra_no_custo_hora: boolean
  ativo: boolean
}

/** Plano de contas gerencial (categoria). */
export interface CategoriaGerencial extends Registro {
  codigo: string
  nome: string
  grupo: string
  natureza: 'receita' | 'deducao' | 'custo' | 'despesa' | 'financeiro' | 'tributo' | 'distribuicao'
  entra_no_custo_hora: boolean
  ativa: boolean
}

/** Regra de categorização: aprendida pelo integrante; só vale depois de aprovada. */
export interface RegraCategorizacao extends Registro {
  padrao: string
  categoria: string
  centro_custo_id?: Id | null
  situacao: 'proposta' | 'ativa' | 'pausada'
  vezes: number
  exemplo?: string | null
  aprovada_por?: string | null
}

/** Fechamento: fechado bloqueia lançamento retroativo; reabrir exige motivo e Administrador. */
export interface FechamentoFinanceiro extends Registro {
  competencia: Competencia
  situacao: 'aberto' | 'fechado' | 'reaberto'
  fechado_por?: string | null
  fechado_em?: DataHora | null
  motivo_reabertura?: string | null
  custo_hora?: number | null
}

export interface PassoRegua {
  id: string
  dias: number
  canal: 'WhatsApp' | 'e-mail' | 'WhatsApp e e-mail' | 'app'
  tom: 'lembrete' | 'cordial' | 'firme' | 'gestor' | 'formal' | 'pausa'
  texto: string
  /** Quem age: sozinho, cartão ao Gestor, cartão ao Administrador (09, 5.2). */
  quem: 'sozinho' | 'gestor' | 'administrador'
  ativo: boolean
}

/** Política financeira: uma versão vigente; mudança gera evento com diff. */
export interface PoliticaFinanceira extends Registro {
  versao: number
  juros_mes: number
  multa: number
  regua: PassoRegua[]
  prazo_pago_dias: number
  acordo_desconto_max: number
  acordo_parcelas_max: number
  limite_gestor: number
  /** Acima deste valor, dois aprovadores (Administrador e segundo sócio). */
  limite_dois_aprovadores: number
  provedor: { tipo: 'banco' | 'gateway'; nome: string; conta: string; convenio: string; boleto: string; pix: string; pix_automatico: string; credito: string; autorizacoes_pix: number }
  nfse: { emissor: string; serie: string; ultimo_numero: number; certificado: string; envio: 'com_a_cobranca' | 'apos_liquidacao'; nfse_por_servico: boolean; regra: string; reembolso: 'recibo_separado' | 'na_nota' }
  importacao?: { origem: string; virada: Competencia; paridade: string; concluida: boolean } | null
}

/** Cenário salvo do fluxo de caixa ("e se"), comparado no Resultado. */
export interface CenarioCaixa extends Registro {
  nome: string
  /** Variação das entradas projetadas, em mil reais por mês. */
  ajuste_entradas: number
  ajuste_saidas: number
  premissas: string
  autor: string
}

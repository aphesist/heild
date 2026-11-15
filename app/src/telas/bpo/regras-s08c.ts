import type { AvisoSistema } from '@/ambiente/loja'
import { banco } from '@/nucleo/banco'
import type { BpoConfiguracao, BpoConta, BpoLote, Evento } from '@/nucleo/modelo/entidades'
import { eventoBpo, repos } from '@/nucleo/repositorios'
import { aprovadoresPara, brl, dataCurta, diasAte, hojeBpo, type EmpresaVista } from './dados'

/**
 * S08c · Regras e simulações das telas Aprovações (S08-T05) e Configuração
 * (S08-T07) que o repositório comum do BPO não guarda em coluna própria. Tudo
 * vai em `extras` (de `bpo_configuracao`, `bpo_perfil`, `bpo_lote` e
 * `bpo_alcada`), sem coluna nova e sem migração (DECISOES, S08c).
 *
 * Nada aqui paga, aprova ou libera: só a pessoa do cliente faz isso, no app
 * (invariante B3). O escalonamento termina sempre em alerta.
 */

/* ---------- Parâmetros guardados em bpo_configuracao.extras.s08c ---------- */

/** Uma ação de um integrante do BPO, com a classe do catálogo (S faz sozinho, P prepara, nunca). */
export interface AcaoIntegrante {
  id: string
  texto: string
  classe: 'S' | 'P' | 'nunca'
  codigo?: string
}

/** Os integrantes do BPO por função (10, adendo de 8/11; 6.2 e 6.3) e o que cada um faz. */
export const integrantesBpo: { id: string; nome: string; funcao: string; acoes: AcaoIntegrante[] }[] = [
  {
    id: 'i-bpo',
    nome: 'Contas a Pagar',
    funcao: 'Captura, fornecedor, lote e alçada. Só prepara: nunca paga.',
    acoes: [
      { id: 'capturar_erp', texto: 'Capturar as contas novas do ERP e do DDA', classe: 'S', codigo: 'FIN-003' },
      { id: 'checar', texto: 'Checar duplicidade, fornecedor novo e dados bancários diferentes', classe: 'S', codigo: 'FIN-003' },
      { id: 'classificar', texto: 'Classificar por categoria gerencial (regra já aprovada)', classe: 'S', codigo: 'CTB-008' },
      { id: 'sugerir_lote', texto: 'Sugerir o próximo lote com as contas conferidas', classe: 'P', codigo: 'FIN-201' },
      { id: 'pedir_faltante', texto: 'Pedir ao cliente o que falta no pedido (boleto, valor, prazo)', classe: 'S', codigo: 'BPO-009' },
      { id: 'pagar', texto: 'Pagar ou transferir', classe: 'nunca' },
      { id: 'conferir', texto: 'Conferir conta (é de uma pessoa do BPO)', classe: 'nunca' },
      { id: 'dados_bancarios', texto: 'Alterar dados bancários ou criar fornecedor com conta', classe: 'nunca' },
      { id: 'alcada', texto: 'Mudar alçada ou modo de pagamento', classe: 'nunca' },
    ],
  },
  {
    id: 'i-bpo-receber',
    nome: 'Contas a Receber',
    funcao: 'Boletos, cobrança amigável e baixa do que entrou.',
    acoes: [
      { id: 'baixar_recebido', texto: 'Dar baixa no que o extrato mostra como recebido', classe: 'S', codigo: 'FIN-004' },
      { id: 'lembrete_amigavel', texto: 'Lembrete amigável de vencimento (régua aprovada)', classe: 'S' },
      { id: 'cobranca_firme', texto: 'Cobrança firme ou protesto', classe: 'nunca' },
    ],
  },
  {
    id: 'i-bpo-conciliacao',
    nome: 'Conciliação',
    funcao: 'Extrato, espelho do ERP e sincronização.',
    acoes: [
      { id: 'conciliar_regra', texto: 'Conciliar o que casa por regra aprovada', classe: 'S', codigo: 'FIN-004' },
      { id: 'confirmar_baixa', texto: 'Confirmar no extrato a baixa do lote liberado', classe: 'S', codigo: 'FIN-004' },
      { id: 'propor_regra', texto: 'Propor regra nova por favorecido (vale depois de aprovada)', classe: 'P', codigo: 'D-13' },
      { id: 'revogar', texto: 'Revogar credencial de banco ou ERP', classe: 'nunca' },
    ],
  },
  {
    id: 'i-bpo-gerencial',
    nome: 'Gerencial',
    funcao: 'Previsão de caixa, DRE, relatório do mês e fechamento.',
    acoes: [
      { id: 'fluxo', texto: 'Atualizar a projeção de caixa da semana', classe: 'S', codigo: 'FIN-005' },
      { id: 'dre', texto: 'Rascunhar a DRE gerencial', classe: 'P', codigo: 'FIN-006' },
      { id: 'relatorio', texto: 'Rascunhar o relatório do mês', classe: 'P', codigo: 'BPO-012' },
      { id: 'fechar_mes', texto: 'Fechar o mês', classe: 'nunca' },
    ],
  },
]

export interface ParametrosS08c {
  /** Até quanto cada pessoa do BPO confere por conta (10, 3.9: `pode_conferir_ate`, por vínculo). Sem valor, sem limite próprio. */
  conferir_ate: Record<string, number>
  /** Ações "faz sozinho" que o Administrador desligou, por integrante (01, 3.3: a lista vem cheia e ele só tira). */
  desligadas: Record<string, string[]>
}

export const parametrosVazios: ParametrosS08c = { conferir_ate: {}, desligadas: {} }

export function parametrosS08c(cfg?: BpoConfiguracao): ParametrosS08c {
  const p = (cfg?.extras?.s08c ?? {}) as Partial<ParametrosS08c>
  return { conferir_ate: p.conferir_ate ?? {}, desligadas: p.desligadas ?? {} }
}

export function salvarParametrosS08c(cfg: BpoConfiguracao, patch: Partial<ParametrosS08c>, texto: string) {
  const atual = parametrosS08c(cfg)
  return repos.bpo.configuracao.atualizar(cfg.id, { extras: { ...cfg.extras, s08c: { ...atual, ...patch } } }, { texto })
}

export const acaoLigada = (cfg: BpoConfiguracao | undefined, integrante: string, acao: string) => !parametrosS08c(cfg).desligadas[integrante]?.includes(acao)

/** Limite de conferência da pessoa (vale o menor entre a pessoa e a faixa da conta; 10, 3.9). */
export function motivoLimiteConferir(cfg: BpoConfiguracao | undefined, usuarioId: string | undefined, c: BpoConta): string | null {
  if (!usuarioId) return null
  const lim = parametrosS08c(cfg).conferir_ate[usuarioId]
  if (lim === undefined || lim <= 0) return null
  return c.valor > lim ? `Sua alçada de conferência vai até ${brl(lim)}: outra pessoa (ou o Gestor) confere esta conta.` : null
}

/* ---------- Exceções que sobem de faixa (10, 3.7) ---------- */

export interface Excecao {
  tipo: 'fornecedor_novo' | 'dados_alterados' | 'acima_media' | 'duplicidade' | 'fracionamento' | 'pessoa_fisica'
  texto: string
}

/**
 * O que faz uma conta subir de faixa: fornecedor novo, dados bancários
 * alterados, valor 30% acima da média, duplicidade suspeita, fracionamento
 * (soma por fornecedor e dia) e pessoa física. O lote com exceção vai à
 * aprovação reforçada (duas pessoas), como manda a linha "Com exceção" da 3.7.
 */
export function excecoesDa(c: BpoConta, e: EmpresaVista): Excecao[] {
  const r: Excecao[] = []
  const f = e.fornecedores.find((x) => x.nome === c.contraparte)
  if (f?.risco === 'novo') r.push({ tipo: 'fornecedor_novo', texto: f.dados_bancarios_confirmados_em ? `fornecedor novo (dados confirmados por ${f.canal_confirmacao ?? 'segundo canal'})` : 'fornecedor novo, dados bancários sem confirmação' })
  if (f?.risco === 'alterado') r.push({ tipo: 'dados_alterados', texto: 'dados bancários diferentes do cadastro' })
  const historico = e.contas.filter((x) => x.id !== c.id && x.contraparte === c.contraparte && (x.etapa === 'paga' || x.etapa === 'liberada' || x.etapa === 'aprovada'))
  if (historico.length) {
    const media = historico.reduce((s, x) => s + x.valor, 0) / historico.length
    if (c.valor > media * 1.3) r.push({ tipo: 'acima_media', texto: `valor ${Math.round((c.valor / media - 1) * 100)}% acima da média do fornecedor (${brl(media)})` })
  }
  const abertas = e.contas.filter((x) => x.id !== c.id && x.contraparte === c.contraparte && !['cancelada', 'recusada', 'paga'].includes(x.etapa))
  if (abertas.some((x) => x.valor === c.valor)) r.push({ tipo: 'duplicidade', texto: 'duplicidade suspeita: mesmo fornecedor e mesmo valor em aberto' })
  const mesmoDia = abertas.filter((x) => x.vencimento === c.vencimento)
  const soma = mesmoDia.reduce((s, x) => s + x.valor, c.valor)
  if (mesmoDia.length && c.valor <= e.faixa1 && soma > e.faixa1) r.push({ tipo: 'fracionamento', texto: `fracionamento: ${mesmoDia.length + 1} contas do mesmo fornecedor no dia somam ${brl(soma)}` })
  if (/\d{3}\.\d{3}\.\d{3}-\d{2}/.test(c.contraparte) || f?.documento?.replace(/\D/g, '').length === 11) r.push({ tipo: 'pessoa_fisica', texto: 'pagamento a pessoa física' })
  return r
}

/** O fornecedor ainda não tem os dados bancários confirmados por segundo canal: a conta não entra em lote (10, 3.13). */
export function motivoNaoEntraNoLote(c: BpoConta, e: EmpresaVista): string | null {
  const f = e.fornecedores.find((x) => x.nome === c.contraparte)
  if (f && f.risco !== 'recorrente' && !f.dados_bancarios_confirmados_em) return `Confirme antes os dados bancários de ${f.nome} por segundo canal (telefone do cadastro, não o do boleto).`
  return null
}

/* ---------- Limites da alçada aceita (10, 3.9: por pagamento, dia e mês) ---------- */

export function limitesDa(e: EmpresaVista) {
  const x = (e.alcada?.extras ?? {}) as { limite_dia?: number; limite_mes?: number }
  return { dia: x.limite_dia ?? null, mes: x.limite_mes ?? null }
}

/** O que já está comprometido com o cliente (aguardando, parcial ou aprovado e ainda não pago). */
export const comprometido = (e: EmpresaVista) => e.lotes.filter((l) => ['aguardando', 'parcial', 'aprovado'].includes(l.situacao)).reduce((s, l) => s + l.total, 0)

export function motivoLimiteLote(e: EmpresaVista, total: number): string | null {
  const { dia } = limitesDa(e)
  const ja = comprometido(e)
  if (dia && ja + total > dia) return `Passa do limite diário da alçada aceita (${brl(dia)}; já há ${brl(ja)} com o cliente). Tire contas ou espere a decisão dos lotes abertos.`
  return null
}

/* ---------- Modo do lote: M2 só até o teto (10, 3.4) ---------- */

export function modoDoLote(e: EmpresaVista, contas: BpoConta[]): { modo: 'M1' | 'M2'; motivo?: string } {
  if (e.perfil.modo_pagamento !== 'M2') return { modo: 'M1' }
  const teto = e.perfil.teto_m2 ?? 0
  const acima = contas.filter((c) => c.valor > teto)
  if (acima.length) return { modo: 'M1', motivo: `${acima.map((c) => c.contraparte).join(', ')} passa${acima.length > 1 ? 'm' : ''} do teto do M2 (${brl(teto)}): este lote vai como M1, o cliente libera no banco.` }
  return { modo: 'M2' }
}

/* ---------- Escalonamento do lote, avançado pela demonstração (10, 3.6 e Q3) ---------- */

export interface PassoEscalonado {
  passo: number
  quando: string
  texto: string
}

export const escalonamentoDo = (l: BpoLote) => ((l.extras?.s08c_escalonamento ?? []) as PassoEscalonado[])

/** Rótulos curtos dos passos (o passo 0 é o envio do cartão). */
export const nomesPassos = ['cartão enviado', 'lembrete', 'substituto', 'alerta da véspera', 'vencido: só alerta']

/**
 * Avança o relógio da demonstração para o próximo passo do escalonamento:
 * lembrete ao aprovador; substituto (copiando o aprovador); alerta da véspera
 * ao Gestor do BPO e ao sócio com a lista; vencido, só alerta e o cartão
 * expira (nada é pago; as contas voltam para um lote novo).
 */
export function avancarEscalonamento(e: EmpresaVista, l: BpoLote, avisar: (a: Omit<AvisoSistema, 'id' | 'quando' | 'lidoPor'>) => void): { texto: string } {
  const feitos = escalonamentoDo(l)
  const passo = feitos.length + 1
  const esc = e.perfil.escalonamento
  const podem = aprovadoresPara(e.ficha, l.total, e.faixa2).map((p) => p.nome)
  const aprovador = esc.aprovador || podem[0] || 'o aprovador da ficha'
  const socio = esc.socio || 'o sócio'
  const destino = { modulo: 'bpo' as const, aba: 'aprovacoes', cliente: e.clienteId }
  const itens = l.conta_ids
    .filter((id) => !l.removidos.includes(id))
    .map((id) => e.contas.find((c) => c.id === id))
    .filter((c): c is BpoConta => !!c)
  let texto = ''
  if (passo === 1) {
    texto = `Lembrete a ${aprovador} pelo app e pelo WhatsApp: “${l.titulo}” (${brl(l.total)}) espera a aprovação`
    avisar({ para: [], tipo: 'cartao', setor: 'bpo_pagar', titulo: `Lembrete enviado a ${aprovador}`, detalhe: `${e.nome} · ${l.titulo}`, destino })
  } else if (passo === 2) {
    const sub = esc.substituto
    const subPode = sub ? (e.ficha?.contatos ?? []).some((c) => c.nome === sub && (c.alcadaPagamento ?? 0) > 0) : false
    texto = sub ? `O cartão foi ao substituto, ${sub}, com ${aprovador} em cópia${subPode ? '' : ` (${sub} não tem alçada na ficha: só acompanha; o alerta vai ao Gestor do BPO)`}` : 'Sem substituto cadastrado: alerta ao Gestor do BPO para falar com o cliente'
    if (sub && subPode && l.cartao_id) {
      const ca = banco.obter('cartao_aprovacao', l.cartao_id)
      if (ca && ca.status === 'pendente' && !ca.pode_aprovar.includes(sub)) banco.transacao((tx) => tx.gravar('cartao_aprovacao', { ...ca, pode_aprovar: [...ca.pode_aprovar, sub], atualizado_em: new Date().toISOString() }))
    }
    avisar({ para: [], tipo: 'cartao', setor: 'bpo_pagar', titulo: sub ? `Lote de ${e.nome} foi ao substituto` : `Lote de ${e.nome} sem substituto`, detalhe: texto, destino })
  } else if (passo === 3) {
    const proximo = [...itens].sort((a, b) => a.vencimento.localeCompare(b.vencimento))[0]
    texto = `Véspera do vencimento (${dataCurta(proximo?.vencimento)}): alerta ao Gestor do BPO e a ${socio} com a lista: ${itens.map((c) => `${c.contraparte} ${brl(c.valor)}`).join('; ')}`
    avisar({ para: [], tipo: 'prazo', setor: 'bpo_pagar', titulo: `Véspera: ${e.nome} ainda sem aprovação`, detalhe: `${itens.length} conta${itens.length > 1 ? 's' : ''}, ${brl(l.total)} · alerta também a ${socio}`, destino })
  } else {
    texto = `Venceu sem aprovação: só alerta ao Gestor do BPO e a ${socio}. Nada foi pago; a empresa fica vermelha na auditoria`
    avisar({ para: [], tipo: 'prazo', setor: 'bpo_pagar', titulo: `Vencido sem aprovação: ${e.nome}`, detalhe: 'nunca paga sozinho; as contas voltam para um lote novo', destino })
  }
  const registro: PassoEscalonado = { passo, quando: new Date().toISOString(), texto }
  repos.bpo.lotes.atualizar(l.id, { extras: { ...l.extras, s08c_escalonamento: [...feitos, registro] } }, { texto: `Escalonamento do lote “${l.titulo}”, passo ${passo} (${nomesPassos[passo]}): ${texto}` })
  if (passo >= 4) repos.bpo.lotes.expirar(l.id)
  return { texto }
}

/* ---------- Trilha do lote (10, 3.11: quem capturou, conferiu, aprovou e de onde) ---------- */

export function trilhaDoLote(l: BpoLote): Evento[] {
  const refs = new Set([l.id, ...l.conta_ids, ...(l.cartao_id ? [l.cartao_id] : [])])
  return banco
    .ler('evento')
    .filter((ev) => (ev.resultado_ref && refs.has(ev.resultado_ref)) || ev.texto.includes(`“${l.titulo}”`))
    .sort((a, b) => a.criado_em.localeCompare(b.criado_em))
}

/** Uma impressão curta (não criptográfica) para mostrar a cadeia da trilha na demonstração. */
export function impressao(texto: string) {
  let h = 2166136261
  for (let i = 0; i < texto.length; i++) h = Math.imul(h ^ texto.charCodeAt(i), 16777619)
  return (h >>> 0).toString(16).padStart(8, '0')
}

/* ---------- SLA por empresa (10, 3.14) ---------- */

export interface RegrasSla {
  captura_h: number
  lote_antes_h: number
  conciliacao_dia: number
  relatorio_dia: number
}

export const slaPadrao: RegrasSla = { captura_h: 24, lote_antes_h: 48, conciliacao_dia: 5, relatorio_dia: 10 }
export const regrasSlaDe = (e: EmpresaVista): RegrasSla => ({ ...slaPadrao, ...((e.perfil.extras?.s08c_sla ?? {}) as Partial<RegrasSla>) })

/** Lote que saiu com menos antecedência que a combinada (SLA "lote enviado Y horas antes do vencimento"). */
export function loteForaDoSla(e: EmpresaVista, contas: BpoConta[]) {
  const venc = [...contas].sort((a, b) => a.vencimento.localeCompare(b.vencimento))[0]?.vencimento
  if (!venc) return false
  return diasAte(venc) * 24 < regrasSlaDe(e).lote_antes_h
}

export const eHoje = (iso?: string | null) => !!iso && iso.slice(0, 10) === hojeBpo

export function registrarS08c(texto: string, clienteId?: string | null, ferramenta = 'bpo.ler') {
  eventoBpo(banco, texto, clienteId ?? null, ferramenta)
}

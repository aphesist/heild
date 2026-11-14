import type { Cobranca, ContratoHonorarios, ItemContrato, LinhaCobranca, PoliticaFinanceira, ServicoContrato } from '@/nucleo/modelo/financeiro'

/*
 * S07 · Regras puras do Financeiro (sem React): contrato, fatura, régua e o
 * motor Cálculo simulado (juros, multa, reajuste, 13º). A semente e as telas
 * usam as mesmas contas, para os números baterem em toda parte (09, 8.4).
 */

/** "Hoje" da demonstração: a semente e os prazos contam a partir daqui. */
export const HOJE = '2026-11-18'
export const COMPETENCIA_ATUAL = '2026-11'
export const PROXIMA_COMPETENCIA = '2026-12'

const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
export const mesesExtenso = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']

/** `2026-11` → `nov/26`. */
export const rotuloCompetencia = (c: string) => (c && c.length >= 7 ? `${meses[Number(c.slice(5, 7)) - 1]}/${c.slice(2, 4)}` : c || '—')
/** `2026-11-20` → `20/11`. */
export const dataCurta = (d?: string | null) => (d ? `${d.slice(8, 10)}/${d.slice(5, 7)}` : '—')
export const dataLonga = (d?: string | null) => (d ? `${d.slice(8, 10)}/${d.slice(5, 7)}/${d.slice(0, 4)}` : '—')
export const somarDias = (d: string, n: number) => new Date(Date.parse(`${d}T12:00:00Z`) + n * 864e5).toISOString().slice(0, 10)
export const diasEntre = (de: string, ate: string) => Math.round((Date.parse(`${ate}T12:00:00Z`) - Date.parse(`${de}T12:00:00Z`)) / 864e5)
export const proximaCompetencia = (c: string) => {
  const [a, m] = c.split('-').map(Number)
  return m === 12 ? `${a + 1}-01` : `${a}-${String(m + 1).padStart(2, '0')}`
}

export const rotuloMeio = { boleto: 'Boleto', pix: 'Pix', pix_automatico: 'Pix Automático', debito: 'Débito' } as const

/** Serviços do contrato, o setor que recebe a receita e a tributação de cada um (LC 116). */
export const servicos: Record<ServicoContrato, { rotulo: string; setor: string; codigo: string; iss: string; nota: 'contabil' | 'bpo' }> = {
  contabil: { rotulo: 'Contábil', setor: 'contabil', codigo: '17.19', iss: '2%', nota: 'contabil' },
  fiscal: { rotulo: 'Fiscal', setor: 'fiscal', codigo: '17.19', iss: '2%', nota: 'contabil' },
  dp: { rotulo: 'DP', setor: 'dp', codigo: '17.19', iss: '2%', nota: 'contabil' },
  societario: { rotulo: 'Societário', setor: 'societario', codigo: '17.19', iss: '2%', nota: 'contabil' },
  consultoria: { rotulo: 'Consultoria', setor: 'consultor', codigo: '17.19', iss: '2%', nota: 'contabil' },
  atendimento: { rotulo: 'Atendimento', setor: 'gestao_atendimento', codigo: '17.19', iss: '2%', nota: 'contabil' },
  bpo_financeiro: { rotulo: 'BPO financeiro', setor: 'bpo_financeiro', codigo: '17.02', iss: '5%', nota: 'bpo' },
  emissao_nfse: { rotulo: 'Emissão de NFS-e', setor: 'notas', codigo: '17.02', iss: '5%', nota: 'bpo' },
}
export const notaDoGrupo = { contabil: { servico: 'Honorário contábil', codigo: '17.19', iss: '2%' }, bpo: { servico: 'Mensalidade do BPO financeiro', codigo: '17.02', iss: '5%' } }

/** Itens da versão mais nova do contrato (os que não foram fechados). */
export const itensVigentes = (itens: ItemContrato[], contratoId: string) => itens.filter((i) => i.contrato_id === contratoId && !i.vigente_ate && !i.arquivado_em)
/** Itens que valem numa competência (o lote de dezembro não usa o reajuste de janeiro). */
export const itensNaCompetencia = (itens: ItemContrato[], contratoId: string, comp: string) => itens.filter((i) => i.contrato_id === contratoId && !i.arquivado_em && i.vigente_de <= comp && (!i.vigente_ate || i.vigente_ate > comp))
export const somaItens = (itens: ItemContrato[]) => itens.reduce((s, i) => s + i.valor, 0)

/**
 * Linhas da fatura a partir dos itens vigentes: um contrato, uma cobrança por
 * mês, serviços em linhas (decisão de 8/11/2026): o que sai com a mesma nota
 * fica junto na linha do grupo (contábil ou BPO).
 */
export function linhasDoContrato(itens: ItemContrato[], prefixo = 'l'): LinhaCobranca[] {
  const grupos: Record<'contabil' | 'bpo', ItemContrato[]> = { contabil: [], bpo: [] }
  for (const i of itens) grupos[servicos[i.servico].nota].push(i)
  return (['contabil', 'bpo'] as const)
    .filter((g) => grupos[g].length)
    .map((g, k) => ({
      id: `${prefixo}${k + 1}`,
      tipo: 'item' as const,
      descricao: g === 'contabil' ? `Honorário contábil (${grupos[g].map((i) => servicos[i.servico].rotulo).join(', ')})` : notaDoGrupo.bpo.servico,
      valor: somaItens(grupos[g]),
      codigo: notaDoGrupo[g].codigo,
      servico: grupos[g][0].servico,
    }))
}

/** Grupos de nota de uma fatura (uma NFS-e por serviço; reembolso não sai na nota). */
export function gruposDeNota(linhas: LinhaCobranca[], porServico: boolean) {
  const comNota = linhas.filter((l) => l.tipo !== 'reembolso' && l.tipo !== 'juros' && l.tipo !== 'multa' && l.valor > 0)
  if (!porServico) return comNota.length ? [{ servico: comNota.map((l) => l.descricao).join(' + '), codigo: [...new Set(comNota.map((l) => l.codigo ?? '17.19'))].join(' e '), iss: 'por item', valor: comNota.reduce((s, l) => s + l.valor, 0), linhas: comNota.map((l) => l.id) }] : []
  const porCodigo = new Map<string, LinhaCobranca[]>()
  for (const l of comNota) porCodigo.set(l.codigo ?? '17.19', [...(porCodigo.get(l.codigo ?? '17.19') ?? []), l])
  return [...porCodigo.entries()].map(([codigo, ls]) => {
    const g = codigo === '17.02' ? notaDoGrupo.bpo : notaDoGrupo.contabil
    return { servico: g.servico, codigo, iss: g.iss, valor: ls.reduce((s, l) => s + l.valor, 0), linhas: ls.map((l) => l.id) }
  })
}

/** Situação mostrada (vencida é derivada, nunca gravada). */
export type SituacaoTela = 'rascunho' | 'aguardando_aprovacao' | 'a_vencer' | 'vencida' | 'aguardando_confirmacao' | 'paga' | 'paga_parcial' | 'em_acordo' | 'cancelada' | 'substituida' | 'baixada_perda'
export const rotuloSituacao: Record<SituacaoTela, string> = {
  rascunho: 'rascunho',
  aguardando_aprovacao: 'aguardando aprovação',
  a_vencer: 'a vencer',
  vencida: 'vencida',
  aguardando_confirmacao: 'aguardando confirmação',
  paga: 'paga',
  paga_parcial: 'paga em parte',
  em_acordo: 'em acordo',
  cancelada: 'cancelada',
  substituida: 'substituída',
  baixada_perda: 'baixada como perda',
}
export function situacaoDaCobranca(c: Cobranca, hoje = HOJE, informada = false): SituacaoTela {
  if (c.situacao === 'emitida') return informada ? 'aguardando_confirmacao' : c.vencimento < hoje ? 'vencida' : 'a_vencer'
  return c.situacao as SituacaoTela
}
export const diasDeAtraso = (c: Cobranca, hoje = HOJE) => Math.max(0, diasEntre(c.vencimento, hoje))
export const emAberto = (c: Cobranca) => c.situacao === 'emitida' || c.situacao === 'paga_parcial' || c.situacao === 'em_acordo'

/** Motor Cálculo (simulado): juros pro rata e multa da política, para a 2ª via (FIN-010). */
export function atualizarValor(valor: number, venc: string, pagarEm: string, p: Pick<PoliticaFinanceira, 'juros_mes' | 'multa'>) {
  const dias = Math.max(0, diasEntre(venc, pagarEm))
  if (!dias) return { dias, multa: 0, juros: 0, total: valor }
  const multa = +(valor * (p.multa / 100)).toFixed(2)
  const juros = +(valor * (p.juros_mes / 100) * (dias / 30)).toFixed(2)
  return { dias, multa, juros, total: +(valor + multa + juros).toFixed(2) }
}

/** Índices acumulados em 12 meses até outubro (série SGS do Banco Central, API-16; demonstração). */
export const indiceAcumulado: Record<ContratoHonorarios['indice'], number> = { IPCA: 4.6, INPC: 4.3, 'IGP-M': 3.1, 'salário mínimo': 7.5, 'sem reajuste': 0 }

/** Etapa da régua em que a cobrança está, pelos dias (D-5 ... D+45). */
export function etapaDaRegua(c: Cobranca, p: PoliticaFinanceira, hoje = HOJE) {
  const d = diasEntre(c.vencimento, hoje)
  const passos = p.regua.filter((x) => x.ativo).sort((a, b) => a.dias - b.dias)
  const feita = [...passos].reverse().find((x) => x.dias <= d)
  const proxima = passos.find((x) => x.dias > d)
  return { dias: d, feita, proxima }
}
export const rotuloDia = (d: number) => (d === 0 ? 'D0' : d > 0 ? `D+${d}` : `D${d}`)

export const centavos = (v: number) => Math.round(v * 100) / 100

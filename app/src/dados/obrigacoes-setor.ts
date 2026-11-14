import type { Cliente as ClienteModelo, Obrigacao, Tarefa as TarefaModelo } from '@/nucleo/modelo/entidades'
import type { SetorIntegrante } from '@/theme/tipos'

/**
 * Contrato C2 (S02): setor dono da obrigação.
 *
 * Cada ocorrência de obrigação é uma Tarefa com `origem = 'obrigacao'`
 * (03, 6.2 e ad. "Obrigações dinâmica por setor", 14/11): o setor dono é o
 * `gera_tarefa_para_setor` da regra (`Obrigacao`), copiado em `tarefa.setor_id`.
 * As telas leem as ocorrências pelo formato de tela `ItemObrigacao`, que tem o
 * campo `setor` (o setor dono). Quem usa: S01 (calendário da Visão geral), S03
 * e S04 (bloco "Obrigações do setor", C1).
 *
 * O filtro de setores da aba Obrigações fica em
 * `usePersistente(CHAVE_FILTRO_SETORES, filtroPadrao)`.
 */

/** "Hoje" da demonstração: os dados de exemplo vivem em 18/11/2026. */
export const HOJE_DEMO = '2026-11-18'

/** Chave do filtro de setores da aba Obrigações (C2). */
export const CHAVE_FILTRO_SETORES = 's02:obrigacoes:setores'

/** Setores que podem ser donos de obrigação (os que têm equipe no Contábil, mais Gestão e Atendimento). */
export const setoresComObrigacao: SetorIntegrante[] = ['fiscal', 'dp', 'contabil', 'societario', 'notas', 'gestao_atendimento']

export type StatusObrigacao = 'entregue' | 'pendente' | 'vence hoje' | 'em risco' | 'atrasada' | 'cancelada' | 'dispensada'

/** Uma ocorrência de obrigação no formato de tela (C2: `setor` é o setor dono). */
export interface ItemObrigacao {
  /** Id da tarefa da ocorrência. */
  id: string
  /** Id da regra (`Obrigacao`), quando há. */
  obrigacaoId?: string
  atividade: string
  nome: string
  competencia: string
  clienteId?: string
  cliente: string
  /** Setor dono (C2). */
  setor: SetorIntegrante
  /** Datas ISO. */
  legal?: string
  interno?: string
  status: StatusObrigacao
  /** Hash curto do recibo, quando entregue. */
  recibo?: string
  /** Futura não iniciada regerada por mudança de perfil (03, 6.2). */
  regerada?: boolean
  /** Obrigação eventual (D-23, C2-15, C2-16, C2-22). */
  eventual?: boolean
  /** Pré-requisito que falta (deixa "em risco"). */
  falta?: string
  /** Multa estimada se atrasar (M3), em reais. */
  multa?: number
  tarefaStatus: TarefaModelo['status']
  /** Integrante que concluiu ("feito por Fiscal", S02-A18). */
  feitoPor?: string
}

/** Data ISO → "dd/mm". */
export const ddmm = (iso?: string | null) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}` : '·')

/** Dias corridos de `a` até `b` (ISO). */
export const diasEntre = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000)

/** Status de tela de uma ocorrência, a partir da tarefa e do "hoje" da demonstração. */
export function statusDaOcorrencia(t: TarefaModelo, hoje = HOJE_DEMO): StatusObrigacao {
  const e = t.extras ?? {}
  if (t.status === 'cancelada') return e.dispensada ? 'dispensada' : 'cancelada'
  if (t.status === 'concluida') return e.dispensada ? 'dispensada' : 'entregue'
  const legal = t.prazo_legal ?? t.prazo_interno
  if (legal && legal < hoje) return 'atrasada'
  if (legal && legal === hoje) return 'vence hoje'
  if (t.risco || e.falta) return 'em risco'
  return 'pendente'
}

/** Ocorrências de obrigação (tarefas `origem = obrigacao`) no formato de tela. */
export function itensDeObrigacao(tarefas: TarefaModelo[], clientes: Pick<ClienteModelo, 'id' | 'nome'>[], regras: Pick<Obrigacao, 'id' | 'nome'>[] = []): ItemObrigacao[] {
  return tarefas
    .filter((t) => t.origem === 'obrigacao' && !t.arquivado_em)
    .map((t) => {
      const e = t.extras ?? {}
      const regra = regras.find((r) => r.id === t.origem_ref)
      return {
        id: t.id,
        obrigacaoId: t.origem_ref ?? undefined,
        atividade: t.atividade_id,
        nome: String(e.obrigacao_nome ?? regra?.nome ?? t.titulo),
        competencia: t.competencia ?? '',
        clienteId: t.cliente_id ?? undefined,
        cliente: clientes.find((c) => c.id === t.cliente_id)?.nome ?? String(e.cliente_nome ?? ''),
        setor: t.setor_id as SetorIntegrante,
        legal: t.prazo_legal ?? undefined,
        interno: t.prazo_interno ?? undefined,
        status: statusDaOcorrencia(t),
        recibo: e.recibo ? String(e.recibo) : undefined,
        regerada: !!e.regerada,
        eventual: !!e.eventual,
        falta: e.falta ? String(e.falta) : undefined,
        multa: typeof e.multa === 'number' ? e.multa : undefined,
        tarefaStatus: t.status,
        feitoPor: t.status === 'concluida' && t.concluida_por_tipo === 'integrante' ? String(e.responsavel_nome ?? 'integrante') : undefined,
      }
    })
    .sort((a, b) => (a.legal ?? '9').localeCompare(b.legal ?? '9') || a.cliente.localeCompare(b.cliente))
}

/* ---------- Filtro de setores (C2) ---------- */

/**
 * Filtro da aba Obrigações (03, ad. 14/11):
 * - `meus`: os setores da pessoa (padrão de Gestor e Administrador);
 * - `um`: um setor só (`setores[0]`);
 * - `todos`: todos os setores (só Gestor e Administrador);
 * - `chips`: quem tem vários setores desmarca chips para focar (`setores` = os marcados).
 */
export interface FiltroSetores {
  modo: 'meus' | 'um' | 'todos' | 'chips'
  setores: SetorIntegrante[]
}

export const filtroPadrao: FiltroSetores = { modo: 'meus', setores: [] }

/** Setores donos de obrigação que a pessoa tem (para os chips e para "meus setores"). */
export const meusSetoresDeObrigacao = (setoresDaPessoa: SetorIntegrante[]) => setoresComObrigacao.filter((s) => setoresDaPessoa.includes(s) || (s === 'notas' && setoresDaPessoa.includes('fiscal')))

/**
 * Setores que a lista mostra, dado o filtro e quem olha. Membro com um setor
 * vê só o dele; com vários, os chips marcados; Gestor e Administrador escolhem.
 */
export function setoresVisiveis(filtro: FiltroSetores, setoresDaPessoa: SetorIntegrante[], escolheTodos: boolean): SetorIntegrante[] {
  const meus = meusSetoresDeObrigacao(setoresDaPessoa)
  if (escolheTodos) {
    if (filtro.modo === 'todos') return setoresComObrigacao
    if (filtro.modo === 'um' && filtro.setores[0]) return [filtro.setores[0]]
    if (filtro.modo === 'chips' && filtro.setores.length) return filtro.setores
    return meus.length ? meus : setoresComObrigacao
  }
  if (meus.length <= 1) return meus
  const marcados = (filtro.modo === 'chips' || filtro.modo === 'um' ? filtro.setores : meus).filter((s) => meus.includes(s))
  return marcados.length ? marcados : meus
}

/* ---------- Pedido de filtro vindo de outra aba ("ver todas", C1) ---------- */

let filtroPedido: SetorIntegrante | null = null

/** O bloco "Obrigações do setor" pede para a aba Obrigações abrir filtrada pelo setor de origem (S02-A53). */
export function pedirFiltroSetor(setor: SetorIntegrante) {
  filtroPedido = setor
}

/** A aba Obrigações lê (e consome) o pedido ao montar. */
export function consumirFiltroPedido(): SetorIntegrante | null {
  const s = filtroPedido
  filtroPedido = null
  return s
}

/* ---------- Geração do calendário (FIS-001, S02-A41) ---------- */

/** O que a regra olha no perfil do cliente (do perfil vigente e da ficha). */
export interface PerfilParaObrigacoes {
  clienteId: string
  regime: string
  uf: string
  servicos: string[]
  temFolha: boolean
  /** CNAE de saúde (DMED, C2-16). */
  saude?: boolean
  /** Mês (1 a 12) da taxa anual de licença municipal (C2-22). */
  mesTaxaLicenca?: number
  /** Conselho de classe com renovação anual (C2-20). */
  conselho?: string
  /** Regras desligadas para o cliente na versão do perfil (FIS-024: declarações estaduais que não entrega). */
  desligadas?: string[]
}

/** Mês das obrigações anuais (o mês do prazo legal). */
const mesAnual: Record<string, number> = { 'FIS-013': 3, 'CTB-041': 5, 'CTB-042': 7, 'PF-001': 5, 'C2-16': 2, 'C2-20': 12 }

/** A regra vale para o perfil? */
export function regraSeAplica(r: Pick<Obrigacao, 'aplicabilidade' | 'periodicidade' | 'atividade_id' | 'cancelada_em' | 'vigente_ate'>, p: PerfilParaObrigacoes, mesDoPrazo: number): boolean {
  if (r.cancelada_em) return false
  if (r.periodicidade === 'por_evento' || r.periodicidade === 'diaria') return false
  const a = r.aplicabilidade as { regime?: string[]; tem_folha?: boolean; servicos?: string[]; uf?: string[]; saude?: boolean; taxa_licenca?: boolean; conselho?: boolean }
  if (a.regime && !a.regime.includes(p.regime)) return false
  if (a.tem_folha && !p.temFolha) return false
  if (a.servicos && !a.servicos.some((s) => p.servicos.includes(s))) return false
  if (a.uf && !a.uf.includes(p.uf)) return false
  if (a.saude && !p.saude) return false
  if (a.conselho && !p.conselho) return false
  if (a.taxa_licenca) return p.mesTaxaLicenca === mesDoPrazo
  if (r.periodicidade === 'anual') return (mesAnual[r.atividade_id] ?? 0) === mesDoPrazo
  if (r.periodicidade === 'trimestral') return [1, 4, 7, 10].includes(mesDoPrazo)
  return true
}

/** Data ISO do prazo legal de uma regra para a competência ("10/2026" vence em 11/2026). */
export function prazoLegal(r: Pick<Obrigacao, 'regra_prazo'>, competencia: string): string {
  const [mm, aaaa] = competencia.split('/').map(Number)
  const alvo = new Date(Date.UTC(aaaa, mm - 1 + r.regra_prazo.mes_relativo, 1))
  const ultimo = new Date(Date.UTC(alvo.getUTCFullYear(), alvo.getUTCMonth() + 1, 0)).getUTCDate()
  const d = new Date(Date.UTC(alvo.getUTCFullYear(), alvo.getUTCMonth(), Math.min(r.regra_prazo.dia, ultimo)))
  // Antecipa para o dia útil anterior quando cai no fim de semana (feriados ficam com o FIS-002).
  if (r.regra_prazo.antecipa_se_nao_util) while (d.getUTCDay() === 0 || d.getUTCDay() === 6) d.setUTCDate(d.getUTCDate() - 1)
  return d.toISOString().slice(0, 10)
}

/** Prazo interno padrão: dois dias úteis antes do legal (o escritório muda na aba). */
export function prazoInternoPadrao(legal: string, diasUteis = 2): string {
  const d = new Date(`${legal}T12:00:00Z`)
  let n = diasUteis
  while (n > 0) {
    d.setUTCDate(d.getUTCDate() - 1)
    if (d.getUTCDay() !== 0 && d.getUTCDay() !== 6) n--
  }
  return d.toISOString().slice(0, 10)
}

/** Mês do prazo legal (1 a 12) de uma competência com `mes_relativo`. */
export const mesDoPrazo = (competencia: string, mesRelativo = 1) => ((Number(competencia.slice(0, 2)) - 1 + mesRelativo) % 12) + 1

/** Ocorrência planejada (o que vira tarefa ao gerar o calendário). */
export interface OcorrenciaPlanejada {
  regra: Pick<Obrigacao, 'id' | 'nome' | 'atividade_id' | 'gera_tarefa_para_setor' | 'aplicabilidade'>
  clienteId: string
  competencia: string
  legal: string
  interno: string
  eventual: boolean
}

/**
 * O que falta gerar na competência (idempotente: o que já existe, mesmo
 * cancelado, não volta). Setor dono = `gera_tarefa_para_setor` da regra (C2).
 */
export function planejarCalendario(competencia: string, perfis: PerfilParaObrigacoes[], regras: Obrigacao[], existentes: TarefaModelo[]): OcorrenciaPlanejada[] {
  const plano: OcorrenciaPlanejada[] = []
  for (const p of perfis)
    for (const r of regras) {
      if (p.desligadas?.includes(r.id)) continue
      if (!regraSeAplica(r, p, mesDoPrazo(competencia, r.regra_prazo.mes_relativo))) continue
      if (existentes.some((t) => t.origem === 'obrigacao' && t.origem_ref === r.id && t.cliente_id === p.clienteId && t.competencia === competencia)) continue
      const legal = prazoLegal(r, competencia)
      plano.push({ regra: r, clienteId: p.clienteId, competencia, legal, interno: prazoInternoPadrao(legal), eventual: !!(r.aplicabilidade as { eventual?: boolean }).eventual })
    }
  return plano
}

/** Competência seguinte ("10/2026" → "11/2026"). */
export function competenciaSeguinte(c: string) {
  const [mm, aaaa] = c.split('/').map(Number)
  return mm === 12 ? `01/${aaaa + 1}` : `${String(mm + 1).padStart(2, '0')}/${aaaa}`
}

/** Hash curto de demonstração (recibo, documento). */
export function hashCurto(base: string) {
  let h = 2166136261
  for (const ch of base) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  return (h >>> 0).toString(16).padStart(8, '0').slice(0, 7)
}

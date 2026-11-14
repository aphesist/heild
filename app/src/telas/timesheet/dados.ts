// S06 · Leitura do Timesheet: as telas leem as entidades por aqui (sessões, itens, extensão, custo-hora...).
import { useMemo } from 'react'
import { useSessao } from '@/ambiente/sessao'
import { atividadeTs, duracaoCatalogoMin, ehInterna, rotuloAtividade } from '@/dados/timesheet-catalogo'
import { competenciaDe, diaDe, diasUteis, duracaoMin, HOJE_TS, inicioSemana, minDoDia, minHora, somarDias, somarMeses } from '@/dados/timesheet-tempo'
import { banco } from '@/nucleo/banco'
import type { Ausencia, FechamentoTimesheet, ItemConfirmacao, NomeTabela, PacoteTimesheet, SessaoTrabalho, Tabelas } from '@/nucleo/modelo/entidades'
import { useEscritorio, useTabela, useVersaoBanco } from '@/nucleo/react'
import { rotuloSetorCurto } from '@/nucleo/permissoes/setores'
import { configTimesheet, type ConfigTimesheet } from '@/nucleo/repositorios'
import { agora } from '@/nucleo/repositorios/repositorio'
import { ID_ANDRADE } from '@/nucleo/semente'
import { sementeS06 } from '@/nucleo/semente/s06'
import type { SetorIntegrante } from '@/theme/tipos'

export type PapelTs = 'colaborador' | 'gestor' | 'admin'
export type PacoteFiltro = 'todos' | PacoteTimesheet

/* ---------- Regras de contagem (05, 9.1) ---------- */

/** Sessão que conta: não substituída. */
export const vale = (s: SessaoTrabalho) => !s.substituida_por && !s.arquivado_em
export const humana = (s: SessaoTrabalho) => s.ator_tipo === 'pessoa'
/** Horas registradas: humanas, não substituídas, sem contestação pendente. */
export const registrada = (s: SessaoTrabalho) => vale(s) && humana(s) && s.confianca !== 'contestada'
export const doPacote = (p: PacoteFiltro) => (s: { pacote: PacoteTimesheet }) => p === 'todos' || s.pacote === p
export const daCompetencia = (c: string) => (s: SessaoTrabalho) => competenciaDe(diaDe(s.inicio)) === c
export const noDia = (dia: string) => (s: SessaoTrabalho) => diaDe(s.inicio) === dia

export const nomeSetor = (s?: string | null) => (s ? (rotuloSetorCurto[s as SetorIntegrante] ?? s) : '—')
export const rotuloOrigem = (s: Pick<SessaoTrabalho, 'origem' | 'conversa_id' | 'tarefa_id'>) =>
  s.origem === 'plataforma' ? (s.conversa_id ? 'conversa no CRM' : s.tarefa_id ? 'tarefa aberta' : 'tela do cliente') : ({ core: 'core', extensao: 'extensão', artefato: 'artefato', confirmacao: 'confirmação' } as const)[s.origem as 'core']
export const rotuloConfianca = { automatica: 'automática', confirmada: 'confirmada', estimada: 'estimada', contestada: 'contestada', sem: 'sem classificação' } as const
export type ConfiancaVisual = keyof typeof rotuloConfianca

/** Uma linha do dia: sessão, item pendente (pré-preenchido) ou lacuna sem classificação. */
export type LinhaDia =
  | { tipo: 'sessao'; id: string; inicio: string; fim: string; s: SessaoTrabalho }
  | { tipo: 'item'; id: string; inicio: string; fim: string; i: ItemConfirmacao }
  | { tipo: 'lacuna'; id: string; inicio: string; fim: string }

export const confiancaDaLinha = (l: LinhaDia): ConfiancaVisual => (l.tipo === 'sessao' ? l.s.confianca : l.tipo === 'item' ? (l.i.sugestao?.cliente_id || l.i.sugestao?.atividade_id ? 'estimada' : 'sem') : 'sem')
export const minutosDaLinha = (l: LinhaDia) => duracaoMin(l)

const hhmm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`

/** O dia de uma pessoa (05, 8.2): sessões, itens pendentes e as lacunas de 10 min ou mais dentro da jornada. */
export function linhaDoDia(sessoes: SessaoTrabalho[], itens: ItemConfirmacao[], usuarioId: string, dia: string, cfg: ConfigTimesheet): LinhaDia[] {
  const ss = sessoes.filter((s) => humana(s) && vale(s) && s.usuario_dono_id === usuarioId && diaDe(s.inicio) === dia)
  const is = itens.filter((i) => i.usuario_id === usuarioId && i.dia === dia && (i.situacao === 'pendente' || i.situacao === 'marcado') && i.fim && !i.sessao_ref_id)
  const linhas: LinhaDia[] = [...ss.map((s) => ({ tipo: 'sessao' as const, id: s.id, inicio: s.inicio, fim: s.fim, s })), ...is.map((i) => ({ tipo: 'item' as const, id: i.id, inicio: i.inicio, fim: i.fim!, i }))].sort((a, b) => Date.parse(a.inicio) - Date.parse(b.inicio))
  // Lacunas: dentro da jornada, fora do intervalo de almoço; hoje, só até o último registro.
  const ini = minHora(cfg.jornada_inicio)
  const ultimo = linhas.reduce((m, l) => Math.max(m, minDoDia(l.fim)), 0)
  const fimDia = dia === HOJE_TS ? Math.min(minHora(cfg.jornada_fim), ultimo) : minHora(cfg.jornada_fim)
  if (!linhas.length) return []
  const ocupado = linhas.map((l) => [minDoDia(l.inicio), minDoDia(l.fim)] as [number, number])
  ocupado.push([minHora(cfg.intervalo_inicio), minHora(cfg.intervalo_fim)])
  ocupado.sort((a, b) => a[0] - b[0])
  let t = Math.max(ini, Math.min(...linhas.map((l) => minDoDia(l.inicio))))
  const lacunas: LinhaDia[] = []
  for (const [a, b] of ocupado) {
    if (a - t >= 10 && a <= fimDia) lacunas.push({ tipo: 'lacuna', id: `lac-${dia}-${t}`, inicio: dhLocal(dia, hhmm(t)), fim: dhLocal(dia, hhmm(Math.min(a, fimDia))) })
    t = Math.max(t, b)
  }
  if (fimDia - t >= 10) lacunas.push({ tipo: 'lacuna', id: `lac-${dia}-${t}`, inicio: dhLocal(dia, hhmm(t)), fim: dhLocal(dia, hhmm(fimDia)) })
  return [...linhas, ...lacunas].sort((a, b) => Date.parse(a.inicio) - Date.parse(b.inicio))
}
const dhLocal = (dia: string, h: string) => `${dia}T${h}:00-03:00`

export function resumoDe(linhas: LinhaDia[]) {
  const soma = (f: (l: LinhaDia) => boolean) => linhas.filter(f).reduce((t, l) => t + minutosDaLinha(l), 0)
  const automaticas = soma((l) => confiancaDaLinha(l) === 'automatica')
  const confirmadas = soma((l) => confiancaDaLinha(l) === 'confirmada')
  const estimadas = soma((l) => confiancaDaLinha(l) === 'estimada')
  const sem = soma((l) => confiancaDaLinha(l) === 'sem')
  const contestadas = soma((l) => confiancaDaLinha(l) === 'contestada')
  return { registradas: automaticas + confirmadas + estimadas, automaticas, confirmadas, estimadas, sem, contestadas }
}

/** Soma por confiança de um conjunto de sessões (para semana, equipe, captura). */
export function porConfianca(ss: SessaoTrabalho[]) {
  const r = { automatica: 0, confirmada: 0, estimada: 0, contestada: 0 }
  for (const s of ss) if (vale(s) && humana(s)) r[s.confianca] += duracaoMin(s)
  return r
}

/** Agrupa minutos por chave, maiores primeiro, com "outros" depois de `max`. */
export function agrupar<T>(xs: T[], chave: (x: T) => string, valor: (x: T) => number, max = 10) {
  const m = new Map<string, number>()
  for (const x of xs) m.set(chave(x), (m.get(chave(x)) ?? 0) + valor(x))
  const lista = [...m.entries()].map(([nome, v]) => ({ nome, v })).sort((a, b) => b.v - a.v)
  if (lista.length <= max) return lista
  const resto = lista.slice(max - 1).reduce((t, x) => t + x.v, 0)
  return [...lista.slice(0, max - 1), { nome: 'outros', v: resto }]
}

/* ---------- Capacidade e ausências (GES-403; 05, ad. 16) ---------- */

export const HORAS_DIA = 8
export function diasAusente(a: Ausencia[], usuarioId: string, de: string, ate: string) {
  return diasUteis(de, ate).filter((d) => a.some((x) => !x.arquivado_em && x.usuario_id === usuarioId && d >= x.inicio && d <= x.fim)).length
}

/* ---------- Rentabilidade (05, 8.4) ---------- */

export interface LinhaRent {
  cliente_id: string
  nome: string
  horas: number
  horasEstimadas: number
  honorario?: number | null
  variaveis: number
  custo: number
  margem?: number
  pct?: number
  porSetor: { nome: string; h: number }[]
  porAtividade: { nome: string; h: number }[]
  deficitario: boolean
  /** C2-25: horas de serviço extra (tarefa marcada como extra pela S04), a faturar à parte. */
  horasExtra?: number
}

export const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
export const pctTxt = (v: number) => `${Math.round(v)}%`.replace('-', '−')

/* ---------- Hook principal ---------- */

export function useTimesheet() {
  const { usuario, permissoes } = useSessao()
  const escritorio = useEscritorio()
  const cfg = configTimesheet(escritorio)
  const sessoes = useTabela('sessao_trabalho')
  const itens = useTabela('item_confirmacao')
  const ausencias = useTabela('ausencia')
  const custos = useTabela('custo_hora')
  const vinculos = useTabela('vinculo_extensao')
  const pulsos = useTabela('pulso_portal')
  const portais = useTabela('portal_extensao')
  const conectores = useTabela('conector_core')
  const equivalencias = useTabela('equivalencia_core')
  const duracoes = useTabela('duracao_padrao')
  const fechamentos = useTabela('fechamento_timesheet')
  const clientes = useTabela('cliente')
  const usuarios = useTabela('usuario')
  const tarefas = useTabela('tarefa')
  const vinculosSetor = useTabela('vinculo_setor')
  const integrantes = useTabela('integrante')
  const assinatura = useTabela('assinatura')[0]
  // S04: férias com substituto registradas na Gestão (s04:gestao) também entram na capacidade.
  const telas = useTabela('registro_tela')
  const papel: PapelTs = permissoes.papelTimesheet
  return useMemo(() => {
    const nomeCliente = (id?: string | null) => (id ? (clientes.find((c) => c.id === id)?.nome ?? id) : 'interno')
    const nomeUsuario = (id?: string | null) => (id ? (usuarios.find((u) => u.id === id)?.nome ?? id) : '—')
    const custoAtual = [...custos].sort((a, b) => a.criado_em.localeCompare(b.criado_em)).at(-1)
    const tarefa = (id?: string | null) => (id ? tarefas.find((t) => t.id === id) : undefined)
    /** C2-25: horas de serviço extra (a tarefa marcada como extra na ficha, S04). */
    const ehExtra = (s: SessaoTrabalho) => {
      const t = tarefa(s.tarefa_id)
      return !!(t?.extras?.servico_extra || t?.extras?.extra || s.extras?.servico_extra)
    }
    const vinculoDe = (u: string) => vinculos.find((v) => v.usuario_id === u)
    /** Pessoas que trabalham num setor (vínculo; o Administrador aparece onde tem sessão). */
    const pessoasDoSetor = (setores: string[]) => usuarios.filter((u) => u.situacao === 'ativo' && (vinculosSetor.some((v) => v.usuario_id === u.id && setores.includes(v.setor_id) && !v.vigente_ate) || sessoes.some((s) => s.usuario_dono_id === u.id && setores.includes(s.setor_id) && humana(s))))
    const gestaoS04 = telas.find((t) => t.id === 's04:gestao')?.valor as { ausencias?: { id: string; pessoa: string; de: string; ate: string; substituto: string }[] } | undefined
    const idPorNome = (n?: string) => usuarios.find((u) => u.nome === n)?.id
    const ausenciasS04: Ausencia[] = (gestaoS04?.ausencias ?? [])
      .filter((a) => idPorNome(a.pessoa) && /^\d{4}-\d{2}-\d{2}$/.test(a.de) && /^\d{4}-\d{2}-\d{2}$/.test(a.ate))
      .map((a) => ({ id: `s04-${a.id}`, escritorio_id: '', criado_em: a.de, atualizado_em: a.de, usuario_id: idPorNome(a.pessoa)!, tipo: 'ferias', inicio: a.de, fim: a.ate, registrada_por: '', substituto_id: idPorNome(a.substituto) ?? null, extras: { origem: 's04', pessoa_nome: a.pessoa } }))
    const todasAusencias = [...ausencias, ...ausenciasS04.filter((x) => !ausencias.some((a) => a.usuario_id === x.usuario_id && a.inicio === x.inicio))]
    const temJuridico = (assinatura?.modulos as string[] | undefined)?.includes('juridico') ?? false
    const temBpo = (assinatura?.modulos as string[] | undefined)?.includes('bpo') ?? false
    return {
      usuario,
      papel,
      permissoes,
      escritorio,
      cfg,
      sessoes,
      itens,
      ausencias: todasAusencias,
      custos,
      custoAtual,
      vinculos,
      pulsos,
      portais,
      conectores,
      equivalencias,
      duracoes,
      fechamentos,
      clientes,
      usuarios,
      tarefas,
      integrantes,
      temJuridico,
      temBpo,
      nomeCliente,
      nomeUsuario,
      tarefa,
      ehExtra,
      vinculoDe,
      pessoasDoSetor,
      rotuloAtividade,
      vazio: sessoes.length === 0 && itens.length === 0,
    }
  }, [usuario, papel, permissoes, escritorio, cfg, sessoes, itens, ausencias, custos, vinculos, pulsos, portais, conectores, equivalencias, duracoes, fechamentos, clientes, usuarios, tarefas, vinculosSetor, integrantes, assinatura, telas])
}
export type Ts = ReturnType<typeof useTimesheet>

/** Rentabilidade de uma competência: fechada (fechamento) ou o mês corrente (sessões, honorário proporcional). */
export function rentabilidadeDe(ts: Ts, competencia: string, pacote: PacoteFiltro, soMedidas: boolean, custoHora: number, custoBpo: number): LinhaRent[] {
  const atual = competenciaDe(HOJE_TS)
  const ultimoFechado = (cid: string, pac: PacoteTimesheet) =>
    [...ts.fechamentos]
      .filter((f) => f.cliente_id === cid && f.pacote === pac && f.competencia < atual)
      .sort((a, b) => a.competencia.localeCompare(b.competencia))
      .at(-1)
  const margemDe = (f: FechamentoTimesheet) => (f.honorario ? f.honorario - (f.horas * f.custo_hora + f.variaveis) : undefined)
  const deficit = (cid: string, comp: string, margemAtual?: number) => {
    const meses = [somarMeses(comp, -2), somarMeses(comp, -1)]
    const negativos = meses.map((c) => ts.fechamentos.filter((f) => f.cliente_id === cid && f.competencia === c && doPacote(pacote)(f))).filter((fs) => fs.length && fs.reduce((t, f) => t + (margemDe(f) ?? 0), 0) < 0).length
    return margemAtual != null && margemAtual < 0 && negativos >= 1
  }
  if (competencia < atual) {
    const doMes = ts.fechamentos.filter((f) => f.competencia === competencia && doPacote(pacote)(f))
    const porCliente = new Map<string, FechamentoTimesheet[]>()
    doMes.forEach((f) => porCliente.set(f.cliente_id, [...(porCliente.get(f.cliente_id) ?? []), f]))
    return [...porCliente.entries()].map(([cid, fs]) => {
      const horas = fs.reduce((t, f) => t + f.horas - (soMedidas ? f.horas_estimadas : 0), 0)
      const temHon = fs.some((f) => f.honorario != null)
      const honorario = temHon ? fs.reduce((t, f) => t + (f.honorario ?? 0), 0) : null
      const variaveis = fs.reduce((t, f) => t + f.variaveis, 0)
      const custo = fs.reduce((t, f) => t + (f.horas - (soMedidas ? f.horas_estimadas : 0)) * (f.pacote === 'bpo' ? custoBpo : custoHora), 0) + variaveis
      const margem = honorario != null ? honorario - custo : undefined
      return {
        cliente_id: cid,
        nome: ts.nomeCliente(cid),
        horas: Math.round(horas * 10) / 10,
        horasEstimadas: fs.reduce((t, f) => t + f.horas_estimadas, 0),
        honorario,
        variaveis,
        custo,
        margem,
        pct: honorario ? ((margem ?? 0) / honorario) * 100 : undefined,
        porSetor: fs.map((f) => ({ nome: f.pacote === 'bpo' ? 'BPO' : 'Contábil', h: f.horas })),
        porAtividade: [],
        deficitario: deficit(cid, competencia, margem),
      }
    })
  }
  // Mês corrente: horas das sessões até hoje; honorário proporcional aos dias úteis decorridos.
  const inicioMes = `${atual}-01`
  const fimMes = somarDias(`${somarMeses(atual, 1)}-01`, -1)
  const fator = diasUteis(inicioMes, HOJE_TS).length / diasUteis(inicioMes, fimMes).length
  const ss = ts.sessoes.filter((s) => daCompetencia(atual)(s) && s.cliente_id && doPacote(pacote)(s) && vale(s))
  const humanas = ss.filter((s) => registrada(s) && (!soMedidas || s.confianca !== 'estimada'))
  const ids = [...new Set(humanas.map((s) => s.cliente_id!))]
  return ids.map((cid) => {
    const doCli = humanas.filter((s) => s.cliente_id === cid)
    const min = doCli.reduce((t, s) => t + duracaoMin(s), 0)
    const minBpo = doCli.filter((s) => s.pacote === 'bpo').reduce((t, s) => t + duracaoMin(s), 0)
    const pacotes: PacoteTimesheet[] = pacote === 'todos' ? ['contabil', 'bpo'] : [pacote]
    const fs = pacotes.map((p) => ultimoFechado(cid, p)).filter((f): f is FechamentoTimesheet => !!f)
    const temHon = fs.some((f) => f.honorario != null)
    const honorario = temHon ? Math.round(fs.reduce((t, f) => t + (f.honorario ?? 0), 0) * fator) : null
    const centavos = ss.filter((s) => s.cliente_id === cid && s.ator_tipo === 'integrante').reduce((t, s) => t + (s.custo?.centavos ?? 0), 0)
    const variaveis = Math.round(centavos / 100 + fs.reduce((t, f) => t + f.variaveis, 0) * fator)
    const custo = ((min - minBpo) / 60) * custoHora + (minBpo / 60) * custoBpo + variaveis
    const margem = honorario != null ? honorario - custo : undefined
    return {
      cliente_id: cid,
      nome: ts.nomeCliente(cid),
      horas: Math.round((min / 60) * 10) / 10,
      horasEstimadas: Math.round((doCli.filter((s) => s.confianca === 'estimada').reduce((t, s) => t + duracaoMin(s), 0) / 60) * 10) / 10,
      honorario,
      variaveis,
      custo,
      margem,
      pct: honorario ? ((margem ?? 0) / honorario) * 100 : undefined,
      porSetor: agrupar(doCli, (s) => nomeSetor(s.setor_id), duracaoMin).map((x) => ({ nome: x.nome, h: Math.round((x.v / 60) * 10) / 10 })),
      porAtividade: agrupar(doCli, (s) => `${s.atividade_id ?? '—'} · ${rotuloAtividade(s.atividade_id)}`, duracaoMin, 6).map((x) => ({ nome: x.nome, h: Math.round((x.v / 60) * 10) / 10 })),
      deficitario: deficit(cid, atual, margem),
      horasExtra: Math.round((doCli.filter((s) => ts.ehExtra(s)).reduce((t, s) => t + duracaoMin(s), 0) / 60) * 10) / 10,
    }
  })
}

/** Série de 12 meses da margem (%) de um cliente, com os marcos (reajuste, regime, faixa estourada). */
export function serieMargem(ts: Ts, cid: string, pacote: PacoteFiltro, custoHora: number) {
  const atual = competenciaDe(HOJE_TS)
  const meses = Array.from({ length: 12 }, (_, i) => somarMeses(atual, i - 12))
  return meses.map((c) => {
    const fs = ts.fechamentos.filter((f) => f.cliente_id === cid && f.competencia === c && doPacote(pacote)(f))
    const hon = fs.reduce((t, f) => t + (f.honorario ?? 0), 0)
    const custo = fs.reduce((t, f) => t + f.horas * (f.custo_hora || custoHora) + f.variaveis, 0)
    return { competencia: c, pct: fs.length && hon ? Math.round(((hon - custo) / hon) * 100) : null, marcos: fs.flatMap((f) => f.marcos) }
  })
}

/** Duração padrão em uso (calibrada > catálogo). */
export function duracaoEmUso(ts: Ts, atividade: string) {
  const d = ts.duracoes.find((x) => x.atividade_id === atividade)
  return d?.adotada_min ?? d?.catalogo_min ?? duracaoCatalogoMin(atividade)
}

/** Prevê a carga das próximas 2 semanas pelas tarefas abertas × duração padrão (GES-403). */
export function cargaPrevista(ts: Ts, setores: string[]) {
  const abertas = ts.tarefas.filter((t) => setores.includes(t.setor_id) && !['concluida', 'cancelada'].includes(t.status) && !t.arquivado_em)
  const min = abertas.reduce((s, t) => s + duracaoEmUso(ts, t.atividade_id) * 4, 0)
  return { tarefas: abertas.length, horas: Math.round(min / 60) }
}

/* ---------- Dados de exemplo para bancos antigos ---------- */

/** Banco guardado antes da S06 recebe só as tabelas do Timesheet (sem apagar o resto). */
export function semearTimesheet() {
  const esc = banco.escritorioId ?? ''
  const linhas: [NomeTabela, Tabelas[NomeTabela]][] = []
  const quando = agora()
  const add = <K extends NomeTabela>(t: K, l: Omit<Tabelas[K], 'escritorio_id' | 'criado_em' | 'atualizado_em'> & { criado_em?: string }) => {
    const linha = { ...l, escritorio_id: esc, criado_em: l.criado_em ?? quando, atualizado_em: quando } as Tabelas[K]
    linhas.push([t, linha])
    return linha
  }
  sementeS06({ clientes: banco.ler('cliente'), tarefas: banco.ler('tarefa'), usuarios: banco.ler('usuario') }, add, esc === ID_ANDRADE ? 'andrade' : 'horizonte')
  banco.transacao((tx) => linhas.forEach(([t, l]) => tx.gravar(t, l as never)))
}

export const semanaDe = (dia: string) => diasUteis(inicioSemana(dia), somarDias(inicioSemana(dia), 4))
export { atividadeTs, ehInterna }
export const versao = useVersaoBanco

/** Itens de confirmação pendentes da pessoa nos últimos 7 dias (contador da aba Confirmações; 05, 8.5). */
export function pendentesDe(itens: ItemConfirmacao[], usuarioId: string) {
  const de = somarDias(HOJE_TS, -6)
  return itens.filter((i) => i.usuario_id === usuarioId && (i.situacao === 'pendente' || i.situacao === 'marcado') && i.dia >= de && !i.arquivado_em)
}
export function useContadorConfirmacoes() {
  const itens = useTabela('item_confirmacao')
  const { usuario } = useSessao()
  return useMemo(() => pendentesDe(itens, usuario.id).length, [itens, usuario.id])
}

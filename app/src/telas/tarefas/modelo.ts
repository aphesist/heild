import { useMemo } from 'react'
import { atividade, nomeCurtoAtividade } from '@/dados/atividades-s04'
import type { Cliente as ClienteE, Id, StatusTarefa, Tarefa as TarefaE } from '@/nucleo/modelo/entidades'
import { ErroRegra } from '@/nucleo/permissoes/autorizar'
import { contextoAtual, comoAtor, repos } from '@/nucleo/repositorios'
import { idDoAtor, nomeDoAtor, type Contexto } from '@/nucleo/permissoes/perfil'
import { useTabela } from '@/nucleo/react'
import type { SetorIntegrante } from '@/theme/tipos'

/**
 * Modelo das tarefas da S04 (S04-T03 a T06): lê a entidade Tarefa das
 * Fundações (01, 4.8) direto do banco e escreve pelas transições do
 * repositório, com as regras do 03, 7. As telas antigas continuam lendo o
 * formato de tela pela loja; as telas da S04 leem daqui (inclusive as
 * canceladas, que a loja deixa fora das filas).
 */

export type { TarefaE }
export const HOJE_ISO = '2026-11-18'

/* ---------- Leitura ---------- */

/** Todas as tarefas não arquivadas, inclusive canceladas e concluídas. */
export function useTarefasE(): TarefaE[] {
  const t = useTabela('tarefa')
  return useMemo(() => repos.tarefas.listar(), [t])
}

export function useClientesE(): ClienteE[] {
  const c = useTabela('cliente')
  return useMemo(() => repos.clientes.listar(), [c])
}

export const nomeClienteE = (t: TarefaE, clientes: ClienteE[]) => (t.cliente_id ? (clientes.find((c) => c.id === t.cliente_id)?.nome ?? String(t.extras?.cliente_nome ?? '')) : String(t.extras?.cliente_nome ?? '')) || 'interna (sem cliente)'

export interface ResponsavelE {
  tipo: 'pessoa' | 'integrante'
  id?: Id | null
  nome: string
  setor?: SetorIntegrante
}

/** Responsável com nome (a pessoa pelo cadastro; o integrante pelo setor). */
export function responsavelE(t: TarefaE): ResponsavelE | undefined {
  const e = t.extras ?? {}
  if (!t.responsavel_tipo && !e.responsavel_nome) return undefined
  const integrante = t.responsavel_tipo === 'integrante' || e.responsavel_tipo_tela === 'integrante'
  if (integrante) return { tipo: 'integrante', id: t.responsavel_id, nome: String(e.responsavel_nome ?? t.setor_id), setor: (e.responsavel_setor as SetorIntegrante) ?? (t.setor_id as SetorIntegrante) }
  const u = t.responsavel_id ? repos.usuarios.obter(t.responsavel_id) : undefined
  return { tipo: 'pessoa', id: t.responsavel_id, nome: u?.nome ?? String(e.responsavel_nome ?? '') }
}

export const prazoE = (t: TarefaE) => t.prazo_interno ?? t.prazo_legal ?? null
export const diaMes = (iso?: string | null) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}` : '·')
export const atrasadaE = (t: TarefaE) => !['concluida', 'cancelada'].includes(t.status) && (!!t.extras?.atrasada || (!!prazoE(t) && prazoE(t)! < HOJE_ISO))
export const diasEntre = (de: string, ate: string) => Math.round((new Date(`${ate.slice(0, 10)}T12:00:00`).getTime() - new Date(`${de.slice(0, 10)}T12:00:00`).getTime()) / 86400000)
/** Dias no status atual (a semente começa no "hoje" da demonstração). */
export const diasNoStatus = (t: TarefaE) => Math.max(0, Number(t.extras?.dias_aguardando ?? 0) || diasEntre(t.status_desde ?? HOJE_ISO, new Date().toISOString()))
export const cartaoPendenteE = (t: TarefaE) => !!t.extras?.cartao_pendente || repos.cartoes.listar((c) => c.status === 'pendente' && c.extras?.tarefa_id === t.id).length > 0

export const rotuloOrigem: Record<TarefaE['origem'], string> = {
  obrigacao: 'obrigação',
  pedido_cliente: 'pedido do cliente',
  integrante: 'integrante',
  pessoa: 'manual',
  trilha: 'trilha',
  core: 'core contábil',
  conversa: 'conversa',
}
export const rotuloQuemConclui: Record<TarefaE['quem_conclui'], string> = { pessoa: 'pessoa', agente_sozinho: 'integrante sozinho', agente_prepara_pessoa_conclui: 'integrante prepara, pessoa conclui' }

export const tituloComAtividade = (t: TarefaE) => `${t.atividade_id} · ${nomeCurtoAtividade(t.atividade_id) || t.titulo}`

/* ---------- Checklist: molde da atividade ou do processo, mais itens livres (03, 7.4) ---------- */

export type ItemChecklist = TarefaE['checklist'][number]
const m = (...itens: (string | [string, true])[]): ItemChecklist[] => itens.map((i) => (typeof i === 'string' ? { item: i, feito: false } : { item: i[0], feito: false, obrigatorio: true }))

const moldesAtividade: Record<string, ItemChecklist[]> = {
  'FIS-009': m(['Receita do mês conferida com as notas', true], 'Segregação de monofásicos e ST', ['Transmitir o PGDAS-D (pessoa)', true], ['Anexar o recibo e o DAS', true], 'Enviar a guia ao cliente'),
  'FIS-019': m(['Totalizadores batem com a folha', true], 'Reinf fechada', ['Transmitir (pessoa)', true], 'Anexar recibo'),
  'DP-004': m(['Dados e documentos do empregado completos', true], 'Piso da convenção conferido', ['ASO admissional recebido', true], 'Contrato gerado', 'S-2200 transmitido antes do início'),
  'DP-005': m(['Modelo de contrato conferido com a CCT', true], 'Opção de vale-transporte', 'Acordo de compensação', 'Termo de LGPD', ['Assinaturas colhidas', true]),
  'DP-006': m(['Dados do S-2200 conferidos', true], ['Transmitir o S-2200 (pessoa)', true], 'Guardar o recibo na pasta do empregado'),
  'DP-009': m(['Variáveis recebidas do cliente', true], 'Ponto importado', 'Comissões conferidas', ['Prévia gerada', true]),
  'DP-012': m(['Prévia conferida', true], 'Enviada ao cliente', ['Ciência do cliente registrada', true]),
  'DP-016': m(['Eventos periódicos fechados', true], 'Totalizadores × folha', ['Transmitir (pessoa)', true], 'Anexar recibos'),
  'DP-026': m(['Aviso do cliente com data e tipo', true], 'Último ASO verificado', 'Simulado aprovado pelo cliente', ['Prazo de 10 dias anotado', true]),
  'DP-027': m(['Verbas calculadas', true], ['TRCT gerado', true], 'Guia rescisória (GFD) emitida', ['Pagamento comprovado no prazo', true], 'Seguro-desemprego conferido'),
  'SOC-031': m(['Minuta revisada', true], 'Assinaturas dos sócios', ['Protocolo na Junta', true], 'CNPJ atualizado'),
  'CTB-016': m('Classificar o que dá pelo de-para', 'Perguntar o resto ao cliente', ['Conferir o saldo conciliado', true]),
}
const moldeSetor: Partial<Record<string, ItemChecklist[]>> = {
  fiscal: m(['Conferir os dados de entrada', true], 'Apurar', ['Anexar o resultado (recibo ou guia)', true], 'Avisar o cliente'),
  dp: m(['Conferir os dados recebidos do cliente', true], 'Calcular no core', ['Anexar o resultado', true], 'Avisar o cliente'),
  contabil: m(['Documentos do mês recebidos', true], 'Classificar e conciliar', ['Conferir saldos', true]),
  societario: m(['Documentos reunidos', true], 'Protocolar', ['Guardar o ato registrado', true]),
  notas: m(['Notas capturadas', true], 'Conferir divergências', 'Manifestar'),
}
/** Molde de checklist da tarefa (vale até a primeira marcação, quando é gravado na tarefa). */
export const moldeChecklist = (t: Pick<TarefaE, 'atividade_id' | 'setor_id'>): ItemChecklist[] => moldesAtividade[t.atividade_id] ?? moldeSetor[t.setor_id] ?? m('Fazer', ['Registrar o resultado', true])
export const checklistDe = (t: TarefaE): ItemChecklist[] => (t.checklist?.length ? t.checklist : moldeChecklist(t))

/** A atividade pede resultado ao concluir (recibo, protocolo)? (03, 7.3) */
export function resultadoExigido(t: TarefaE): string | null {
  const n = `${atividade(t.atividade_id)?.nome ?? ''} ${t.titulo}`
  if (/transmit|protocol|S-22|eSocial|DCTF|PGDAS|DEFIS|EFD|ECD|ECF|CAT\b/i.test(n)) return 'Número do recibo ou protocolo'
  return null
}
/** Só sai por revisão: risco ou integrante que só prepara (01, 4.8; 03, 7.3). */
export const soPorRevisao = (t: TarefaE) => t.risco || (t.responsavel_tipo === 'integrante' && t.quem_conclui === 'agente_prepara_pessoa_conclui')

/* ---------- Escrita: transições com as regras do 03, 7 ---------- */

const quem = () => nomeDoAtor(contextoAtual().ator)
const rot = (t: TarefaE) => `${t.atividade_id} · ${t.titulo}`
const exigir = (id: Id) => {
  const t = repos.tarefas.obter(id)
  if (!t) throw new ErroRegra('Tarefa não encontrada.')
  return t
}
const extras = (t: TarefaE, e: Record<string, unknown>) => ({ ...t.extras, ...e })

export const acoesTarefa = {
  /** Abrir inicia (03, 7.3): a fazer vira em andamento e a tarefa fica "aberta por" quem abriu. */
  iniciar(id: Id) {
    const t = exigir(id)
    const ctx = contextoAtual()
    const patch = { extras: extras(t, { aberta_por: idDoAtor(ctx.ator), aberta_por_nome: quem(), aberta_em: new Date().toISOString() }) }
    if (t.status === 'a_fazer') {
      repos.tarefas.mudarStatus(id, 'em_andamento')
      return repos.tarefas.atualizar(id, patch, { ferramenta: 'tarefa.iniciar', texto: '' })
    }
    return repos.tarefas.atualizar(id, patch, { ferramenta: 'tarefa.iniciar', texto: `${quem()} abriu ${rot(t)}` })
  },
  /** Pausar: continua em andamento, sem dono aberto; o tempo corta (03, ad. 22). */
  pausar(id: Id, porOutra?: string) {
    const t = exigir(id)
    return repos.tarefas.atualizar(id, { extras: extras(t, { aberta_por: null, aberta_por_nome: null }) }, { ferramenta: 'tarefa.atualizar', texto: porOutra ? `${quem()} pausou ${rot(t)} ao abrir ${porOutra}` : `${quem()} pausou ${rot(t)}` })
  },
  concluir(id: Id, o: { resultado?: string; evidencia?: boolean } = {}) {
    const t = exigir(id)
    if (t.status === 'concluida') throw new ErroRegra('A tarefa já está concluída. Para mudar, abra uma correção.')
    if (soPorRevisao(t) && t.status !== 'em_revisao') throw new ErroRegra('Esta tarefa só sai por "Enviar para revisão" (tem risco ou o integrante só prepara).')
    const abertos = checklistDe(t).filter((i) => i.obrigatorio && !i.feito)
    if (abertos.length) throw new ErroRegra(`Falta item obrigatório do checklist: ${abertos.map((i) => i.item).join('; ')}.`)
    if (resultadoExigido(t) && !o.resultado?.trim()) throw new ErroRegra(`Informe o resultado para concluir (${resultadoExigido(t)?.toLowerCase()}).`)
    repos.tarefas.atualizar(id, { extras: extras(t, { resultado: o.resultado ?? null, concluida_por_evidencia: !!o.evidencia, atrasada: false, aberta_por: null, cartao_pendente: false }) }, { ferramenta: 'tarefa.atualizar', texto: '' })
    return repos.tarefas.mudarStatus(id, 'concluida', { texto: `${quem()} concluiu ${rot(t)}${o.resultado ? ` (${o.evidencia ? 'por evidência: ' : 'resultado: '}${o.resultado})` : ''}` })
  },
  enviarRevisao(id: Id, comentario?: string) {
    const t = exigir(id)
    const segunda = t.risco ? 'Consultor: a base legal confere com o que foi feito; atenção à data de vigência usada no cálculo (grau de segurança médio).' : null
    repos.tarefas.atualizar(id, { extras: extras(t, { revisao_comentario: comentario ?? null, segunda_opiniao: segunda, enviada_revisao_por: quem() }) }, { ferramenta: 'tarefa.atualizar', texto: '' })
    return repos.tarefas.mudarStatus(id, 'em_revisao', { texto: `${quem()} mandou ${rot(t)} para revisão${comentario ? `: ${comentario}` : ''}` })
  },
  aguardarCliente(id: Id, itens: string[]) {
    const lista = itens.map((i) => i.trim()).filter(Boolean)
    if (!lista.length) throw new ErroRegra('Aguardar o cliente exige a lista do que falta (vira pendência no app e na régua).')
    const t = exigir(id)
    repos.tarefas.atualizar(id, { aguardando_detalhe: { itens: lista } }, { ferramenta: 'tarefa.aguardar_cliente', texto: '' })
    return repos.tarefas.mudarStatus(id, 'aguardando_cliente', { texto: `${quem()} pôs ${rot(t)} em aguardando o cliente: ${lista.join('; ')}` })
  },
  aguardarOrgao(id: Id, orgao: string, protocolo: string) {
    if (!orgao.trim() || !protocolo.trim()) throw new ErroRegra('Aguardar órgão exige o órgão e o protocolo.')
    const t = exigir(id)
    repos.tarefas.atualizar(id, { aguardando_detalhe: { orgao, itens: [`protocolo ${protocolo}`] } }, { ferramenta: 'tarefa.aguardar_terceiro', texto: '' })
    return repos.tarefas.mudarStatus(id, 'aguardando_terceiro', { texto: `${quem()} pôs ${rot(t)} aguardando ${orgao} (protocolo ${protocolo})` })
  },
  cancelar: (id: Id, motivo: string) => repos.tarefas.cancelar(id, motivo),
  /** Devolver da revisão: volta a em andamento com comentário (01, 4.8). */
  devolver(id: Id, comentario: string) {
    if (!comentario.trim()) throw new ErroRegra('Devolver exige um comentário para quem vai corrigir.')
    const t = exigir(id)
    repos.tarefas.atualizar(id, { extras: extras(t, { devolvida: comentario }) }, { ferramenta: 'tarefa.atualizar', texto: '' })
    return repos.tarefas.mudarStatus(id, 'em_andamento', { ferramenta: 'tarefa.enviar_revisao', texto: `${quem()} devolveu ${rot(t)}: ${comentario}` })
  },
  /** Aprovar na fila de revisão: conclui com o nome de quem aprovou (01, 6.4). */
  aprovarRevisao(id: Id) {
    const t = exigir(id)
    if (t.status !== 'em_revisao') throw new ErroRegra('Só tarefa em revisão se aprova na fila.')
    repos.tarefas.atualizar(id, { extras: extras(t, { aprovada_por: quem(), atrasada: false, cartao_pendente: false }) }, { ferramenta: 'tarefa.atualizar', texto: '' })
    return repos.tarefas.mudarStatus(id, 'concluida', { texto: `${quem()} aprovou na revisão e concluiu ${rot(t)}` })
  },
  /** Concluída é final: a correção é tarefa nova ligada à anterior (01, 4.8). */
  abrirCorrecao(id: Id, motivo: string) {
    if (!motivo.trim()) throw new ErroRegra('Diga o que precisa ser corrigido.')
    const t = exigir(id)
    return repos.tarefas.criar(
      { ...semRegistro(t), id: undefined, titulo: `Correção: ${t.titulo}`, descricao: motivo, status: 'a_fazer', status_desde: new Date().toISOString(), tarefa_pai_id: t.id, origem: 'pessoa', checklist: [], concluida_em: null, concluida_por_id: null, concluida_por_tipo: null, cancelada_motivo: null, extras: { ...t.extras, correcao_de: t.id, resultado: null, atrasada: false, cartao_pendente: false } },
      { texto: `${quem()} abriu correção de ${rot(t)}: ${motivo}` },
    )
  },
  /** "Não era esta": corrige o cliente ou a tarefa da sessão em curso; vira item de confirmação no Timesheet (03, ad. 22). */
  naoEraEsta(id: Id, correta: { tarefaId?: Id; clienteNome?: string }) {
    const t = exigir(id)
    const lista = (repos.telas.obter('s04:timesheet:nao-era-esta')?.valor as unknown[]) ?? []
    repos.telas.lembrar('s04:timesheet:nao-era-esta', [...lista, { de: t.id, para: correta, quando: new Date().toISOString(), por: quem() }])
    return repos.tarefas.atualizar(id, { extras: extras(t, { aberta_por: null }) }, { ferramenta: 'tarefa.atualizar', texto: `${quem()} corrigiu a sessão: não era ${rot(t)}${correta.clienteNome ? ` (era ${correta.clienteNome})` : ''}; vai para confirmação no Timesheet` })
  },
  marcarItem(id: Id, indice: number, feito: boolean) {
    const t = exigir(id)
    if (['concluida', 'cancelada'].includes(t.status)) throw new ErroRegra('Tarefa fechada: o checklist fica como estava.')
    const ctx = contextoAtual()
    const lista = checklistDe(t).map((i, k) => (k === indice ? { ...i, feito, feito_por: feito ? (idDoAtor(ctx.ator) ?? undefined) : undefined, feito_em: feito ? new Date().toISOString() : undefined } : i))
    const porNome = { ...(t.extras?.checklist_nomes as Record<number, string>), [indice]: feito ? quem() : '' }
    return repos.tarefas.atualizar(id, { checklist: lista, extras: extras(t, { checklist_nomes: porNome }) }, { ferramenta: 'tarefa.checklist_marcar', texto: `${quem()} ${feito ? 'marcou' : 'desmarcou'} “${lista[indice].item}” em ${rot(t)}` })
  },
  adicionarItem(id: Id, item: string) {
    if (!item.trim()) throw new ErroRegra('Escreva o item.')
    const t = exigir(id)
    return repos.tarefas.atualizar(id, { checklist: [...checklistDe(t), { item: item.trim(), feito: false }] }, { ferramenta: 'tarefa.checklist_marcar', texto: `${quem()} acrescentou “${item.trim()}” ao checklist de ${rot(t)}` })
  },
  /** Reprogramar só o prazo interno (03, 4.1 e P2). */
  reprogramar(id: Id, prazoIso: string) {
    const t = exigir(id)
    return repos.tarefas.atualizar(id, { prazo_interno: prazoIso, extras: extras(t, { atrasada: prazoIso < HOJE_ISO }) }, { ferramenta: 'tarefa.atualizar', texto: `${quem()} reprogramou ${rot(t)} para ${diaMes(prazoIso)}${t.prazo_legal && prazoIso > t.prazo_legal ? ` (depois do prazo legal ${diaMes(t.prazo_legal)})` : ''}` })
  },
  reatribuir(id: Id, r: ResponsavelE) {
    const t = exigir(id)
    repos.tarefas.reatribuir(id, { tipo: r.tipo === 'integrante' ? 'integrante' : 'usuario', id: r.id ?? r.nome, nome: r.nome }, { texto: `${quem()} passou ${rot(t)} para ${r.nome}` })
    return repos.tarefas.atualizar(id, { extras: { ...repos.tarefas.obter(id)!.extras, responsavel_tipo_tela: r.tipo, responsavel_setor: r.setor ?? null } }, { ferramenta: 'tarefa.atualizar', texto: '' })
  },
  /** Comanda digital de serviço extra (C2-25): horas como extra no Timesheet e item a faturar no Financeiro. */
  marcarExtra(id: Id, extra: boolean, valor?: string) {
    const t = exigir(id)
    return repos.tarefas.atualizar(id, { extras: extras(t, { servico_extra: extra, extra_valor: valor ?? null }) }, { ferramenta: 'tarefa.atualizar', texto: extra ? `${quem()} marcou ${rot(t)} como serviço extra${valor ? ` (${valor})` : ''}: vai ao Financeiro para faturar` : `${quem()} tirou a marca de serviço extra de ${rot(t)}` })
  },
  /** Ocorrência crítica (C2-27): entra na lista da Gestão. */
  marcarCritica(id: Id, critica: boolean, motivo?: string) {
    const t = exigir(id)
    return repos.tarefas.atualizar(id, { extras: extras(t, { critica, critica_motivo: motivo ?? null }) }, { ferramenta: 'tarefa.atualizar', texto: critica ? `${quem()} etiquetou ${rot(t)} como ocorrência crítica${motivo ? `: ${motivo}` : ''}` : `${quem()} tirou a etiqueta de ocorrência crítica de ${rot(t)}` })
  },
}

export type SemRegistroTarefa = Omit<TarefaE, 'escritorio_id' | 'criado_em' | 'atualizado_em'>
function semRegistro(t: TarefaE): SemRegistroTarefa {
  const { escritorio_id: _e, criado_em: _c, atualizado_em: _a, ...resto } = t
  void _e, void _c, void _a
  return resto
}

/** Tarefa nova pela tela (S04-T06): a atividade do catálogo é obrigatória (01, ad. 22). */
export function criarTarefa(d: {
  atividade_id: string
  titulo: string
  setor_id: string
  cliente_id?: Id | null
  competencia?: string
  prazo_interno?: string | null
  prazo_legal?: string | null
  responsavel?: ResponsavelE
  checklist?: ItemChecklist[]
  origem?: TarefaE['origem']
  origem_ref?: Id | null
  tarefa_pai_id?: Id | null
  extras?: Record<string, unknown>
  status?: StatusTarefa
  descricao?: string
}) {
  if (!d.atividade_id) throw new ErroRegra('Escolha a atividade do catálogo (é obrigatória).')
  const a = atividade(d.atividade_id)
  const r = d.responsavel
  return repos.tarefas.criar({
    atividade_id: d.atividade_id,
    titulo: d.titulo || a?.nome || d.atividade_id,
    descricao: d.descricao,
    setor_id: d.setor_id,
    cliente_id: d.cliente_id ?? null,
    competencia: d.competencia,
    origem: d.origem ?? 'pessoa',
    origem_ref: d.origem_ref ?? null,
    responsavel_tipo: r ? (r.tipo === 'integrante' ? 'integrante' : 'usuario') : null,
    responsavel_id: r?.id ?? null,
    quem_conclui: a?.autonomia === 'S' ? 'agente_sozinho' : a?.autonomia === 'P' && r?.tipo === 'integrante' ? 'agente_prepara_pessoa_conclui' : 'pessoa',
    status: d.status ?? 'a_fazer',
    status_desde: new Date().toISOString(),
    prazo_interno: d.prazo_interno ?? null,
    prazo_legal: d.prazo_legal ?? null,
    prioridade: 'normal',
    checklist: d.checklist ?? [],
    tarefa_pai_id: d.tarefa_pai_id ?? null,
    risco: !!a?.risco && a.autonomia !== 'S',
    extras: { ...(r ? { responsavel_nome: r.nome, responsavel_tipo_tela: r.tipo, responsavel_setor: r.setor ?? null } : {}), ...d.extras },
  })
}

/** Age como um integrante (o evento leva o nome dele). */
export const ctxIntegranteS04 = (nome: string): Contexto => ({ ator: { tipo: 'sistema', nome: `integrante ${nome}` }, origem: 'job' })
export const comoIntegrante = <R,>(nome: string, fazer: () => R) => comoAtor(ctxIntegranteS04(nome), fazer)

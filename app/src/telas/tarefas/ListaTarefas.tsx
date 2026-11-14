import { CalendarBlankIcon, CaretDownIcon, CaretRightIcon, CheckIcon, EyeIcon, ListBulletsIcon, PaperPlaneTiltIcon, PlayIcon, PlusIcon, TreeStructureIcon, UsersThreeIcon } from '@phosphor-icons/react'
import { useMemo, useState } from 'react'
import { useFluxos } from '@/ambiente/fluxos'
import { useLoja, usePersistente } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import { Calendario, isoDeDiaMes } from '@/components/compostos/calendario'
import { rotuloStatus, statusFinal } from '@/components/compostos/rotulos'
import { BarraLote, CaixaSelecao, EstadoVazio, Quadro, useAcao, useConfirmar, useSelecao, type ColunaQuadro } from '@/components/kit'
import { Button } from '@/components/ui/button'
import { Orb } from '@/components/ui/orb'
import { nomeCurtoAtividade } from '@/dados/atividades-s04'
import type { StatusTarefa, Tarefa as TarefaTela } from '@/dados/tipos'
import { useAparencia } from '@/hooks/useAparencia'
import { cn } from '@/lib/utils'
import { tarefaParaTela } from '@/nucleo/mapeadores'
import { repos } from '@/nucleo/repositorios'
import type { SetorIntegrante } from '@/theme/tipos'
import { opcoesResponsavel } from './FichaTarefa'
import { acoesTarefa, atrasadaE, cartaoPendenteE, diaMes, diasNoStatus, HOJE_ISO, nomeClienteE, prazoE, responsavelE, rotuloOrigem, useClientesE, useTarefasE, type TarefaE } from './modelo'
import { FiltroSelect, ResponsavelDe, StatusE } from './pecas'

export type VisaoLista = 'lista' | 'responsavel' | 'calendario' | 'revisao'

interface Filtro {
  status: 'abertas' | StatusTarefa | 'todas'
  responsavel: string
  prazo: 'todos' | 'hoje' | 'semana' | 'atrasadas'
  origem: 'todas' | TarefaE['origem']
  soPendencia: boolean
  soCartao: boolean
  visao: VisaoLista
}
const filtroInicial: Filtro = { status: 'abertas', responsavel: 'todos', prazo: 'todos', origem: 'todas', soPendencia: false, soCartao: false, visao: 'lista' }
const fimDaSemana = '2026-11-22'

/** Converte para o formato de tela (calendário, contrato C5). */
export function paraTela(t: TarefaE, clientes: Parameters<typeof tarefaParaTela>[1]['clientes']): TarefaTela {
  const tela = tarefaParaTela(t, { clientes })
  const r = responsavelE(t)
  return { ...tela, cliente: tela.cliente || 'interna', atrasada: atrasadaE(t), ...(r ? { responsavel: { tipo: r.tipo, nome: r.nome, setor: r.setor } } : {}) }
}

/**
 * Lista de tarefas da S04 (S04-T03): colunas do 03, 7.1, filtros salvos por
 * usuário e aba, pré-visualização sem abrir, raiz de trilha com progresso,
 * visão por responsável (arrastar reatribui, só Gestor), calendário (C5) e
 * fila de revisão. A mesma peça no bloco de cada aba e na tela "Tarefas".
 */
export function ListaTarefas({
  tarefas,
  chave,
  setor,
  cliente,
  limite,
  compacta,
  onNova,
  onVerTodas,
  visoes = ['lista', 'responsavel', 'calendario', 'revisao'],
}: {
  tarefas: TarefaE[]
  /** Onde o filtro é guardado (por usuário e aba). */
  chave: string
  setor?: SetorIntegrante
  /** Nome do cliente; ausente = carteira (mostra a coluna Cliente). */
  cliente?: string
  /** Carteira: as N mais urgentes e "ver todas" (03, 2.4). */
  limite?: number
  compacta?: boolean
  onNova?: () => void
  onVerTodas?: () => void
  visoes?: VisaoLista[]
}) {
  const { usuario, permissoes } = useSessao()
  const fluxos = useFluxos()
  const executar = useAcao()
  const clientes = useClientesE()
  const todas = useTarefasE()
  const [filtro, setFiltroBruto] = usePersistente<Filtro>(`s04:tarefas:filtro:${chave}:${usuario.id}`, filtroInicial)
  const f = { ...filtroInicial, ...filtro }
  const setFiltro = (p: Partial<Filtro>) => setFiltroBruto({ ...f, ...p })
  const [aberta, setAberta] = useState<string | null>(null)
  const gere = usuario.papel === 'administrador' || (setor ? permissoes.gere.includes(setor) : permissoes.gere.length > 0)

  const responsaveis = useMemo(() => Array.from(new Set(tarefas.map((t) => responsavelE(t)?.nome).filter(Boolean))) as string[], [tarefas])
  const visiveis = useMemo(() => {
    const r = tarefas.filter((t) => {
      if (f.status === 'abertas' && statusFinal(t.status)) return false
      if (f.status !== 'abertas' && f.status !== 'todas' && t.status !== f.status) return false
      const resp = responsavelE(t)
      if (f.responsavel === 'eu' && resp?.id !== usuario.id) return false
      if (f.responsavel === 'integrante' && resp?.tipo !== 'integrante') return false
      if (f.responsavel === 'sem' && resp) return false
      if (!['todos', 'eu', 'integrante', 'sem'].includes(f.responsavel) && resp?.nome !== f.responsavel) return false
      const p = prazoE(t)
      if (f.prazo === 'hoje' && p !== HOJE_ISO) return false
      if (f.prazo === 'semana' && (!p || p > fimDaSemana)) return false
      if (f.prazo === 'atrasadas' && !atrasadaE(t)) return false
      if (f.origem !== 'todas' && t.origem !== f.origem) return false
      if (f.soPendencia && t.status !== 'aguardando_cliente') return false
      if (f.soCartao && !cartaoPendenteE(t)) return false
      return true
    })
    // Mais urgentes primeiro: atrasadas, depois pelo prazo.
    return r.sort((a, b) => Number(atrasadaE(b)) - Number(atrasadaE(a)) || (prazoE(a) ?? '9').localeCompare(prazoE(b) ?? '9'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tarefas, filtro, usuario.id])
  const [todasVisiveis, setTodasVisiveis] = useState(false)
  const mostradas = limite && !todasVisiveis ? visiveis.slice(0, limite) : visiveis
  const filhasDe = (id: string) => todas.filter((x) => x.tarefa_pai_id === id)
  const emRevisao = tarefas.filter((t) => t.status === 'em_revisao')
  const icones: Record<VisaoLista, typeof ListBulletsIcon> = { lista: ListBulletsIcon, responsavel: UsersThreeIcon, calendario: CalendarBlankIcon, revisao: EyeIcon }
  const nomesVisao: Record<VisaoLista, string> = { lista: 'Lista', responsavel: 'Por responsável', calendario: 'Calendário', revisao: `Revisão${emRevisao.length ? ` · ${emRevisao.length}` : ''}` }

  return (
    <div className="@container flex min-w-0 flex-col gap-2">
      <div className="flex flex-wrap items-center gap-1.5">
        <div role="tablist" aria-label="Visão das tarefas" className="bg-sunken/70 flex rounded-full p-0.5">
          {visoes.map((v) => {
            const I = icones[v]
            return (
              <button key={v} role="tab" aria-selected={f.visao === v} type="button" title={nomesVisao[v]} onClick={() => setFiltro({ visao: v })} className={cn('flex h-7 cursor-pointer items-center gap-1 rounded-full px-2.5 text-xs', f.visao === v ? 'bg-background shadow-xs font-medium' : 'text-muted-foreground hover:text-foreground')}>
                <I className="size-3.5" />
                <span className={cn(compacta && 'sr-only @lg:not-sr-only')}>{nomesVisao[v]}</span>
              </button>
            )
          })}
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-1.5">
          {f.visao !== 'revisao' && (
            <>
              <FiltroSelect rotulo="Status" valor={f.status} onMudar={(v) => setFiltro({ status: v as Filtro['status'] })} opcoes={[{ valor: 'abertas', rotulo: 'abertas' }, ...(Object.keys(rotuloStatus) as StatusTarefa[]).map((s) => ({ valor: s, rotulo: rotuloStatus[s] })), { valor: 'todas', rotulo: 'todas' }]} />
              <FiltroSelect rotulo="Responsável" valor={f.responsavel} onMudar={(v) => setFiltro({ responsavel: v })} opcoes={[{ valor: 'todos', rotulo: 'todos' }, { valor: 'eu', rotulo: 'eu' }, { valor: 'integrante', rotulo: 'integrantes' }, { valor: 'sem', rotulo: 'sem responsável' }, ...responsaveis.map((r) => ({ valor: r, rotulo: r }))]} />
              {!compacta && (
                <>
                  <FiltroSelect rotulo="Prazo" valor={f.prazo} onMudar={(v) => setFiltro({ prazo: v as Filtro['prazo'] })} opcoes={[{ valor: 'todos', rotulo: 'todos' }, { valor: 'hoje', rotulo: 'hoje' }, { valor: 'semana', rotulo: 'esta semana' }, { valor: 'atrasadas', rotulo: 'atrasadas' }]} />
                  <FiltroSelect rotulo="Origem" valor={f.origem} onMudar={(v) => setFiltro({ origem: v as Filtro['origem'] })} opcoes={[{ valor: 'todas', rotulo: 'todas' }, ...Object.entries(rotuloOrigem).map(([valor, rotulo]) => ({ valor, rotulo }))]} />
                  <Alternar rotulo="só com pendência" ligado={f.soPendencia} onMudar={(v) => setFiltro({ soPendencia: v })} />
                  <Alternar rotulo="só com cartão" ligado={f.soCartao} onMudar={(v) => setFiltro({ soCartao: v })} />
                </>
              )}
            </>
          )}
          {onNova && (
            <Button size="icon-sm" variant="outline" onClick={onNova} aria-label="Nova tarefa" title="Nova tarefa">
              <PlusIcon />
            </Button>
          )}
        </div>
      </div>

      {f.visao === 'lista' && (
        <>
          <div role="table" aria-label="Tarefas" className="flex min-w-0 flex-col">
            <div role="row" className="text-muted-foreground hidden grid-cols-[minmax(0,1fr)_9rem_5.5rem_9.5rem_6rem_7rem] gap-x-3 border-b px-2 pb-1.5 text-[11px] @4xl:grid">
              <span role="columnheader">Tarefa</span>
              <span role="columnheader">Atividade</span>
              <span role="columnheader">Prazo int. · legal</span>
              <span role="columnheader">Responsável</span>
              <span role="columnheader">Origem · dias</span>
              <span role="columnheader" className="text-right">
                Status
              </span>
            </div>
            {mostradas.map((t) => (
              <LinhaTarefa key={t.id} t={t} cliente={cliente ? undefined : nomeClienteE(t, clientes)} filhas={filhasDe(t.id)} aberta={aberta === t.id} onPrevia={() => setAberta(aberta === t.id ? null : t.id)} onAbrir={() => fluxos.abrirTarefa(t.id)} />
            ))}
          </div>
          {mostradas.length === 0 && <EstadoVazio titulo={`Nenhuma tarefa ${f.status === 'abertas' ? 'aberta ' : ''}${setor ? 'deste setor ' : ''}para ${cliente ?? 'a carteira'}.`} descricao="Mude os filtros ou crie uma tarefa." />}
          {limite && visiveis.length > limite && (
            <Button size="sm" variant="ghost" className="self-start rounded-full" onClick={() => (onVerTodas ? onVerTodas() : setTodasVisiveis(!todasVisiveis))}>
              {todasVisiveis ? 'Mostrar só as mais urgentes' : `Ver todas (${visiveis.length})`}
            </Button>
          )}
        </>
      )}
      {f.visao === 'responsavel' && <PorResponsavel tarefas={visiveis} setor={setor} gere={gere} />}
      {f.visao === 'calendario' && (
        <div className="overflow-x-auto">
          <Calendario tarefas={visiveis.map((t) => paraTela(t, clientes))} visao="semana" onReprogramar={(t, prazo) => executar(() => acoesTarefa.reprogramar(t.id, isoDeDiaMes(prazo)), { sucesso: `Prazo interno: ${prazo}` })} />
        </div>
      )}
      {f.visao === 'revisao' && <FilaRevisao tarefas={emRevisao} />}
    </div>
  )
}

function Alternar({ rotulo, ligado, onMudar }: { rotulo: string; ligado: boolean; onMudar: (v: boolean) => void }) {
  return (
    <button type="button" aria-pressed={ligado} onClick={() => onMudar(!ligado)} className={cn('h-8 cursor-pointer rounded-md border px-2 text-xs', ligado ? 'bg-foreground text-background border-transparent' : 'hover:bg-accent')}>
      {rotulo}
    </button>
  )
}

/** Linha com pré-visualização (não inicia o tempo) e ação de um toque. */
function LinhaTarefa({ t, cliente, filhas, aberta, onPrevia, onAbrir }: { t: TarefaE; cliente?: string; filhas: TarefaE[]; aberta: boolean; onPrevia: () => void; onAbrir: () => void }) {
  const executar = useAcao()
  const fluxos = useFluxos()
  const cartao = cartaoPendenteE(t)
  const feitas = filhas.filter((x) => x.status === 'concluida').length
  const rapida = t.status === 'a_fazer' ? { rotulo: 'Iniciar', icone: <PlayIcon />, f: () => executar(() => acoesTarefa.iniciar(t.id), { sucesso: 'Iniciada' }) } : t.status === 'aguardando_cliente' ? { rotulo: 'Cobrar', icone: <PaperPlaneTiltIcon />, f: onAbrir } : t.status === 'em_revisao' ? { rotulo: 'Revisar', icone: <EyeIcon />, f: onAbrir } : !statusFinal(t.status) ? { rotulo: 'Concluir', icone: <CheckIcon />, f: () => executar(() => acoesTarefa.concluir(t.id), { sucesso: 'Concluída' }) } : null
  return (
    <div role="row" className="border-border/60 border-b last:border-b-0">
      <div className="hover:bg-accent/50 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-2 rounded-[10px] px-1 py-2 @4xl:grid-cols-[auto_minmax(0,1fr)_9rem_5.5rem_9.5rem_6rem_7rem]">
        <button type="button" onClick={onPrevia} aria-expanded={aberta} aria-label={`Pré-visualizar ${t.titulo}`} className="text-muted-foreground hover:text-foreground cursor-pointer rounded p-0.5">
          {aberta ? <CaretDownIcon className="size-3.5" /> : <CaretRightIcon className="size-3.5" />}
        </button>
        <button type="button" role="cell" onClick={onAbrir} className="min-w-0 cursor-pointer text-left">
          <span className="flex items-center gap-1.5 text-sm">
            {filhas.length > 0 && <TreeStructureIcon className="text-muted-foreground size-3.5 shrink-0" aria-label="raiz de trilha" />}
            <span className="truncate">{t.titulo}</span>
            {filhas.length > 0 && (
              <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                · {feitas} de {filhas.length}
              </span>
            )}
          </span>
          <span className="text-muted-foreground block truncate text-xs">
            {cliente ? `${cliente} · ` : ''}
            <span className="@4xl:hidden">
              {t.atividade_id} · {diaMes(prazoE(t))}
            </span>
            {t.competencia ? <span className="hidden @4xl:inline">competência {t.competencia}</span> : null}
          </span>
        </button>
        <span role="cell" className="text-muted-foreground hidden min-w-0 truncate text-xs @4xl:block" title={nomeCurtoAtividade(t.atividade_id)}>
          <span className="font-mono">{t.atividade_id}</span> {nomeCurtoAtividade(t.atividade_id)}
        </span>
        <span role="cell" className={cn('hidden text-xs tabular-nums @4xl:block', atrasadaE(t) ? 'text-destructive font-medium' : 'text-muted-foreground')}>
          {diaMes(t.prazo_interno)}
          {t.prazo_legal && t.prazo_legal !== t.prazo_interno ? ` · ${diaMes(t.prazo_legal)}` : ''}
        </span>
        <span role="cell" className="hidden min-w-0 @4xl:block">
          <ResponsavelDe t={t} />
        </span>
        <span role="cell" className="text-muted-foreground hidden text-xs @4xl:block">
          {rotuloOrigem[t.origem]} · {diasNoStatus(t)} d
        </span>
        <span role="cell" className="flex items-center justify-end gap-1.5">
          {cartao && <Orb reacao="needs" tamanho={16} extras={false} cutucavel={false} cor="var(--warning)" rotulo="Cartão pendente" />}
          <StatusE t={t} />
          {rapida && (
            <Button size="icon-sm" variant="ghost" className="size-7" title={rapida.rotulo} aria-label={`${rapida.rotulo}: ${t.titulo}`} onClick={rapida.f}>
              {rapida.icone}
            </Button>
          )}
        </span>
      </div>
      {aberta && (
        <div className="bg-sunken/50 mb-2 ml-6 grid gap-2 rounded-[12px] p-3 text-xs sm:grid-cols-2">
          <span>
            <span className="text-muted-foreground">Atividade: </span>
            {t.atividade_id} · {nomeCurtoAtividade(t.atividade_id)}
          </span>
          <span>
            <span className="text-muted-foreground">Status: </span>
            {rotuloStatus[t.status]} há {diasNoStatus(t)} d
          </span>
          <span>
            <span className="text-muted-foreground">Prazos: </span>interno {diaMes(t.prazo_interno)} · legal {diaMes(t.prazo_legal)}
          </span>
          <span className="flex items-center gap-1">
            <span className="text-muted-foreground">Responsável: </span>
            <ResponsavelDe t={t} />
          </span>
          {t.aguardando_detalhe?.itens?.length ? (
            <span className="sm:col-span-2">
              <span className="text-muted-foreground">Aguardando: </span>
              {t.aguardando_detalhe.itens.join('; ')}
            </span>
          ) : null}
          <span className="text-muted-foreground sm:col-span-2">Pré-visualização: não abre a tarefa nem conta tempo.</span>
          <div className="flex gap-1.5 sm:col-span-2">
            <Button size="sm" className="rounded-full" onClick={onAbrir}>
              Abrir (inicia)
            </Button>
            {t.cliente_id && (
              <Button size="sm" variant="ghost" className="rounded-full" onClick={() => fluxos.fichaCliente(t.cliente_id!)}>
                Ficha do cliente
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/** Visão por responsável (03, 7.1): contagens; arrastar entre pessoas reatribui (Gestor). */
export function PorResponsavel({ tarefas, setor, gere }: { tarefas: TarefaE[]; setor?: SetorIntegrante; gere: boolean }) {
  const aparencia = useAparencia()
  const executar = useAcao()
  const fluxos = useFluxos()
  const loja = useLoja()
  const setores = Array.from(new Set(tarefas.map((t) => t.setor_id)))
  const base = setor ?? (setores[0] as SetorIntegrante | undefined) ?? 'fiscal'
  const opcoes = setores.length <= 1 ? opcoesResponsavel(base, aparencia({ setor: base }).nome) : []
  const chaveDe = (t: TarefaE) => {
    const r = responsavelE(t)
    return r ? (r.tipo === 'integrante' ? `integrante:${r.setor ?? t.setor_id}` : `pessoa:${r.id ?? r.nome}`) : 'sem'
  }
  const colunasMapa = new Map<string, ColunaQuadro>()
  for (const o of opcoes) colunasMapa.set(o.valor, { id: o.valor, titulo: o.rotulo })
  for (const t of tarefas) {
    const k = chaveDe(t)
    if (!colunasMapa.has(k)) {
      const r = responsavelE(t)
      colunasMapa.set(k, { id: k, titulo: r ? (r.tipo === 'integrante' ? `${aparencia({ setor: (r.setor ?? t.setor_id) as SetorIntegrante }).nome} (integrante)` : r.nome) : 'Sem responsável' })
    }
  }
  if (!colunasMapa.has('sem')) colunasMapa.set('sem', { id: 'sem', titulo: 'Sem responsável', bloqueada: true })
  const colunas = [...colunasMapa.values()]
  if (!tarefas.length) return <EstadoVazio titulo="Nenhuma tarefa com estes filtros." />
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-muted-foreground text-xs">{gere ? 'Arraste uma tarefa para outra pessoa ou integrante para reatribuir.' : 'Você vê as tarefas dos colegas do setor; só o Gestor reatribui.'}</p>
      <div className="overflow-x-auto pb-1">
        <Quadro
          colunas={colunas}
          itens={tarefas}
          idDe={(t) => t.id}
          colunaDe={chaveDe}
          rotuloDe={(t) => t.titulo}
          desabilitado={!gere}
          onMover={(id, coluna) => {
            const t = tarefas.find((x) => x.id === id)
            if (!t || coluna === 'sem') return
            const [tipo, ref] = coluna.split(':')
            const r = tipo === 'integrante' ? { tipo: 'integrante' as const, id: `i-${ref}`, nome: aparencia({ setor: ref as SetorIntegrante }).nome, setor: ref as SetorIntegrante } : { tipo: 'pessoa' as const, id: ref, nome: repos.usuarios.obter(ref)?.nome ?? ref }
            const antes = repos.tarefas.obter(id)
            executar(() => acoesTarefa.reatribuir(id, r), { sucesso: `${t.atividade_id} passou para ${r.nome}`, desfazer: () => antes && repos.tarefas.reverter(antes) })
            void loja
          }}
          render={(t) => (
            <button type="button" onClick={() => fluxos.abrirTarefa(t.id)} className="bg-card flex w-full cursor-pointer flex-col gap-1 rounded-[12px] border px-2.5 py-2 text-left text-xs">
              <span className="line-clamp-2 text-sm">{t.titulo}</span>
              <span className="text-muted-foreground flex items-center gap-1">
                <span className="font-mono">{t.atividade_id}</span> · {diaMes(prazoE(t))}
                <span className="ml-auto">
                  <StatusE t={t} />
                </span>
              </span>
            </button>
          )}
        />
      </div>
    </div>
  )
}

/** Fila de revisão (01, 4.8): por atividade, com aprovar em lote e devolver com comentário. */
export function FilaRevisao({ tarefas }: { tarefas: TarefaE[] }) {
  const executar = useAcao()
  const confirmar = useConfirmar()
  const fluxos = useFluxos()
  const clientes = useClientesE()
  const ids = tarefas.map((t) => t.id)
  const sel = useSelecao(ids)
  const grupos = useMemo(() => {
    const m = new Map<string, TarefaE[]>()
    for (const t of tarefas) m.set(t.atividade_id, [...(m.get(t.atividade_id) ?? []), t])
    return [...m.entries()]
  }, [tarefas])
  if (!tarefas.length) return <EstadoVazio titulo="Nada em revisão." descricao="O que os integrantes e os colegas mandarem para revisão aparece aqui, com a evidência." />
  const devolver = async (id: string) => {
    const c = await confirmar({ titulo: 'Devolver para correção', acao: 'Devolver', exigirMotivo: true, rotuloMotivo: 'Comentário para quem vai corrigir' })
    if (typeof c === 'string') executar(() => acoesTarefa.devolver(id, c), { sucesso: 'Devolvida: voltou para em andamento' })
  }
  return (
    <div className="flex flex-col gap-3">
      {grupos.map(([atv, lista]) => (
        <section key={atv} className="flex flex-col gap-1">
          <h4 className="text-muted-foreground flex items-center gap-2 text-xs">
            <CaixaSelecao rotulo={`Selecionar ${atv}`} marcado={lista.every((t) => sel.marcado(t.id))} parcial={lista.some((t) => sel.marcado(t.id)) && !lista.every((t) => sel.marcado(t.id))} onMudar={() => lista.forEach((t) => sel.alternar(t.id))} />
            <span className="font-mono">{atv}</span> {nomeCurtoAtividade(atv)} · {lista.length}
          </h4>
          <ul className="flex flex-col gap-1">
            {lista.map((t) => (
              <li key={t.id} className="bg-raised flex flex-wrap items-center gap-2 rounded-[12px] px-2.5 py-2 text-sm">
                <CaixaSelecao rotulo={`Selecionar ${t.titulo}`} marcado={sel.marcado(t.id)} onMudar={(i) => sel.alternar(t.id, i)} />
                <button type="button" className="min-w-0 flex-1 cursor-pointer text-left" onClick={() => fluxos.abrirTarefa(t.id)}>
                  <span className="block truncate">{t.titulo}</span>
                  <span className="text-muted-foreground block truncate text-xs">
                    {nomeClienteE(t, clientes)} · enviada por {String(t.extras?.enviada_revisao_por ?? responsavelE(t)?.nome ?? 'integrante')}
                    {t.extras?.resultado ? ` · evidência: ${String(t.extras.resultado)}` : ''}
                  </span>
                </button>
                <Button size="sm" variant="outline" className="rounded-full" onClick={() => executar(() => acoesTarefa.aprovarRevisao(t.id), { sucesso: 'Aprovada e concluída' })}>
                  <CheckIcon /> Aprovar
                </Button>
                <Button size="sm" variant="ghost" className="rounded-full" onClick={() => devolver(t.id)}>
                  Devolver
                </Button>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <BarraLote
        selecao={sel}
        nome={['tarefa', 'tarefas']}
        acoes={[
          {
            rotulo: 'Aprovar selecionadas',
            icone: <CheckIcon />,
            onExecutar: (sels) => {
              let n = 0
              for (const id of sels) if (executar(() => acoesTarefa.aprovarRevisao(id))) n++
              sel.limpar()
              if (n) executar(() => null, { sucesso: `${n} ${n === 1 ? 'tarefa aprovada' : 'tarefas aprovadas'} com o seu nome` })
            },
          },
        ]}
      />
    </div>
  )
}

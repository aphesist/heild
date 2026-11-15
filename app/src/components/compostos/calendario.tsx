import { DndContext, KeyboardSensor, PointerSensor, TouchSensor, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { CalendarDotsIcon, CaretLeftIcon, CaretRightIcon, WarningIcon } from '@phosphor-icons/react'
import { useEffect, useMemo, useState } from 'react'
import { useFluxos } from '@/ambiente/fluxos'
import { useSessao } from '@/ambiente/sessao'
import { useConfirmar } from '@/components/kit/confirmar'
import { SeloDemonstracao } from '@/components/kit/selo-demonstracao'
import { Button } from '@/components/ui/button'
import type { StatusTarefa, Tarefa } from '@/dados/tipos'
import { cn } from '@/lib/utils'
import { useTema } from '@/theme/ThemeProvider'
import type { SetorIntegrante } from '@/theme/tipos'
import { rotuloStatus, statusFinal } from './rotulos'

/**
 * Calendário de tarefas (S04-T04; contrato C5; 03, 4.1). Dia, semana e mês
 * (no celular só dia e semana); arrastar para reprogramar o prazo interno
 * (passar do legal pede confirmação com a multa estimada); "reprogramar" sem
 * arrastar (celular e teclado); grupos ("PGDAS-D × 14"); filtros por
 * responsável, setor (cor), status e só atrasadas; feriados marcados.
 */

export type VisaoCalendario = 'dia' | 'semana' | 'mes'

export interface FiltrosCalendario {
  /** Nome do responsável (pessoa ou integrante); ausente = todos. */
  responsavel?: string
  setores?: SetorIntegrante[]
  status?: StatusTarefa[]
  soAtrasadas?: boolean
}

export interface CalendarioProps {
  tarefas: Tarefa[]
  /** Visão inicial (padrão semana; no celular só dia e semana). */
  visao?: VisaoCalendario
  /** Reprogramar o prazo interno (novo prazo em dd/mm). Sem ela, o calendário só mostra. */
  onReprogramar?: (tarefa: Tarefa, novoPrazo: string) => void
  /** Filtros vindos de fora (a pessoa ainda pode filtrar por cima). */
  filtros?: FiltrosCalendario
  /** Abrir a tarefa (padrão: a ficha da tarefa). */
  onAbrir?: (tarefa: Tarefa) => void
  /** Data de referência ISO (padrão: o "hoje" da demonstração). */
  data?: string
  /** Sem a barra de filtros (widget pequeno). */
  semFiltros?: boolean
  className?: string
}

/** "Hoje" da demonstração: os dados de exemplo são da semana de 16 a 20/11/2026. */
export const HOJE_DEMO = '2026-11-18'

const ANO = 2026
export const isoDeDiaMes = (ddmm: string) => (/^\d{2}\/\d{2}$/.test(ddmm) ? `${ANO}-${ddmm.slice(3, 5)}-${ddmm.slice(0, 2)}` : '')
export const diaMesDeIso = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`
const somarDias = (iso: string, n: number) => {
  const d = new Date(`${iso}T12:00:00`)
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}
const diaSemana = (iso: string) => new Date(`${iso}T12:00:00`).getDay()
const inicioDaSemana = (iso: string) => somarDias(iso, -((diaSemana(iso) + 6) % 7))
const nomesDia = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']
const nomesMes = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']

/** Feriados nacionais do período da demonstração. O futuro muda com o perfil do cliente (municipais); o passado fica. */
export const feriados: Record<string, string> = {
  '2026-11-02': 'Finados',
  '2026-11-15': 'Proclamação da República',
  '2026-11-20': 'Dia da Consciência Negra: prazos que antecipam vão para 19/11; os que prorrogam, para 23/11',
  '2026-12-25': 'Natal',
  '2027-01-01': 'Confraternização Universal',
}

/** Aplica os filtros do calendário a uma lista de tarefas. */
export function filtrarCalendario(tarefas: Tarefa[], f: FiltrosCalendario = {}) {
  return tarefas.filter(
    (t) =>
      (!f.responsavel || t.responsavel?.nome === f.responsavel) &&
      (!f.setores?.length || f.setores.includes(t.setor)) &&
      (!f.status?.length ? t.status !== 'cancelada' : f.status.includes(t.status)) &&
      (!f.soAtrasadas || (!!t.atrasada && !statusFinal(t.status))),
  )
}

/** Multa estimada ao passar do prazo legal (demonstração: o valor real vem da regra da obrigação). */
export function multaEstimada(t: Tarefa) {
  const base = t.setor === 'dp' ? 'R$ 402,54 por evento do eSocial em atraso, mais juros' : t.setor === 'fiscal' ? 'a partir de R$ 50,00 por declaração em atraso, mais juros sobre o tributo' : t.setor === 'contabil' ? 'multa por atraso na escrituração, proporcional ao período' : 'multa e juros conforme a obrigação'
  return base
}

function useCelular() {
  const [celular, setCelular] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 639px)').matches)
  useEffect(() => {
    const m = window.matchMedia('(max-width: 639px)')
    const f = () => setCelular(m.matches)
    m.addEventListener('change', f)
    return () => m.removeEventListener('change', f)
  }, [])
  return celular
}

export function Calendario({ tarefas, visao: visaoInicial = 'semana', onReprogramar, filtros, onAbrir, data = HOJE_DEMO, semFiltros, className }: CalendarioProps) {
  const fluxos = useFluxos()
  const { integrante } = useTema()
  const { usuario, permissoes } = useSessao()
  const confirmar = useConfirmar()
  const celular = useCelular()
  const [visaoEscolhida, setVisao] = useState<VisaoCalendario>(visaoInicial)
  const visao = celular && visaoEscolhida === 'mes' ? 'semana' : visaoEscolhida
  const [ref, setRef] = useState(data)
  const [proprio, setProprio] = useState<FiltrosCalendario>({})
  const [grupoAberto, setGrupoAberto] = useState<string | null>(null)
  const [reprogramando, setReprogramando] = useState<string | null>(null)
  const abrir = onAbrir ?? ((t: Tarefa) => fluxos.abrirTarefa(t.id))
  const juntos = { ...filtros, ...Object.fromEntries(Object.entries(proprio).filter(([, v]) => v !== undefined && v !== false && !(Array.isArray(v) && !v.length))) } as FiltrosCalendario
  const visiveis = useMemo(() => filtrarCalendario(tarefas, juntos), [tarefas, JSON.stringify(juntos)]) // eslint-disable-line react-hooks/exhaustive-deps
  const responsaveis = Array.from(new Set(tarefas.map((t) => t.responsavel?.nome).filter(Boolean))) as string[]
  const setores = Array.from(new Set(tarefas.map((t) => t.setor)))
  const sensores = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }), useSensor(KeyboardSensor))

  // Membro reprograma as suas; Gestor (do setor) e Administrador, todas (03, 9.2).
  const podeMover = (t: Tarefa) => !!onReprogramar && !statusFinal(t.status) && (usuario.papel === 'administrador' || permissoes.gere.includes(t.setor) || t.responsavel?.nome === usuario.nome || (t.responsavel?.tipo === 'integrante' && permissoes.setores.includes(t.setor)))

  const reprogramar = async (t: Tarefa, iso: string) => {
    if (!onReprogramar || isoDeDiaMes(t.prazo) === iso) return
    const legal = t.prazoLegal ? isoDeDiaMes(t.prazoLegal) : ''
    if (legal && iso > legal) {
      const ok = await confirmar({
        titulo: 'Passar do prazo legal?',
        descricao: (
          <span className="flex flex-col gap-2">
            <span>
              O prazo legal de {t.titulo} é {t.prazoLegal}; o novo prazo interno ({diaMesDeIso(iso)}) fica depois dele.
            </span>
            <span>
              Multa estimada: {multaEstimada(t)}. <SeloDemonstracao fonte="estimativa" />
            </span>
          </span>
        ),
        acao: 'Reprogramar mesmo assim',
        perigo: true,
      })
      if (!ok) return
    }
    onReprogramar(t, diaMesDeIso(iso))
    setReprogramando(null)
  }

  const fim = ({ active, over }: DragEndEvent) => {
    if (!over) return
    const t = visiveis.find((x) => x.id === String(active.id))
    if (t) void reprogramar(t, String(over.id).replace('dia:', ''))
  }

  // Dias da visão.
  const dias = visao === 'dia' ? [ref] : visao === 'semana' ? Array.from({ length: celular ? 5 : 7 }, (_, i) => somarDias(inicioDaSemana(ref), i)) : (() => {
    const primeiro = `${ref.slice(0, 8)}01`
    const inicio = inicioDaSemana(primeiro)
    return Array.from({ length: 42 }, (_, i) => somarDias(inicio, i))
  })()
  const passo = visao === 'dia' ? 1 : visao === 'semana' ? 7 : 0
  const mover = (dir: number) => {
    if (visao === 'mes') {
      const d = new Date(`${ref.slice(0, 8)}15T12:00:00`)
      d.setMonth(d.getMonth() + dir)
      setRef(d.toISOString().slice(0, 10))
    } else setRef(somarDias(ref, dir * passo))
  }
  const titulo = visao === 'dia' ? `${nomesDia[diaSemana(ref)]}, ${diaMesDeIso(ref)}` : visao === 'semana' ? `${diaMesDeIso(dias[0])} a ${diaMesDeIso(dias[dias.length - 1])}` : `${nomesMes[+ref.slice(5, 7) - 1]} de ${ref.slice(0, 4)}`

  const doDia = (iso: string) => visiveis.filter((t) => isoDeDiaMes(t.prazo) === iso)
  /** Agrupa por atividade quando há 3 ou mais iguais no dia ("PGDAS-D × 14"). */
  const grupos = (lista: Tarefa[]) => {
    const m = new Map<string, Tarefa[]>()
    for (const t of lista) m.set(t.codigo, [...(m.get(t.codigo) ?? []), t])
    return [...m.entries()].flatMap(([codigo, ts]) => (ts.length >= 3 ? [{ grupo: codigo, tarefas: ts }] : ts.map((t) => ({ grupo: null as string | null, tarefas: [t] }))))
  }

  const item = (t: Tarefa, compacto: boolean) => <ItemCalendario key={t.id} t={t} compacto={compacto} cor={integrante(t.setor).cor} nomeSetor={integrante(t.setor).nome} movel={podeMover(t)} reprogramando={reprogramando === t.id} onReprogramar={() => setReprogramando(reprogramando === t.id ? null : t.id)} onEscolherData={(iso) => void reprogramar(t, iso)} onAbrir={() => abrir(t)} />

  return (
    <div className={cn('flex min-w-0 flex-col gap-2', className)}>
      <div className="flex flex-wrap items-center gap-1.5">
        <Button size="icon-sm" variant="ghost" aria-label="Anterior" onClick={() => mover(-1)}>
          <CaretLeftIcon />
        </Button>
        <Button size="icon-sm" variant="ghost" aria-label="Próximo" onClick={() => mover(1)}>
          <CaretRightIcon />
        </Button>
        <Button size="sm" variant="ghost" className="h-7 rounded-full" onClick={() => setRef(data)}>
          Hoje
        </Button>
        <span className="text-sm font-medium" aria-live="polite">
          {titulo}
        </span>
        <div role="tablist" aria-label="Visão do calendário" className="bg-sunken/70 ml-auto flex rounded-full p-0.5">
          {(['dia', 'semana', 'mes'] as const)
            .filter((v) => !celular || v !== 'mes')
            .map((v) => (
              <button key={v} type="button" role="tab" aria-selected={visao === v} onClick={() => setVisao(v)} className={cn('h-7 cursor-pointer rounded-full px-2.5 text-xs', visao === v ? 'bg-background shadow-xs font-medium' : 'text-muted-foreground')}>
                {v === 'dia' ? 'Dia' : v === 'semana' ? 'Semana' : 'Mês'}
              </button>
            ))}
        </div>
      </div>
      {!semFiltros && (
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {setores.map((s) => {
            const ativo = proprio.setores?.includes(s)
            return (
              <button key={s} type="button" aria-pressed={!!ativo} onClick={() => setProprio({ ...proprio, setores: ativo ? proprio.setores!.filter((x) => x !== s) : [...(proprio.setores ?? []), s] })} className={cn('flex h-7 cursor-pointer items-center gap-1.5 rounded-full border px-2.5', ativo ? 'bg-foreground text-background border-transparent' : 'hover:bg-accent')}>
                <span className="size-2 rounded-full" style={{ background: integrante(s).cor }} aria-hidden />
                {integrante(s).nome}
              </button>
            )
          })}
          <select aria-label="Responsável" className="bg-popover h-7 rounded-md border px-1.5" value={proprio.responsavel ?? ''} onChange={(e) => setProprio({ ...proprio, responsavel: e.target.value || undefined })}>
            <option value="">todos os responsáveis</option>
            {responsaveis.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <select aria-label="Status" className="bg-popover h-7 rounded-md border px-1.5" value={proprio.status?.[0] ?? ''} onChange={(e) => setProprio({ ...proprio, status: e.target.value ? [e.target.value as StatusTarefa] : undefined })}>
            <option value="">todos os status</option>
            {(Object.keys(rotuloStatus) as StatusTarefa[]).map((s) => (
              <option key={s} value={s}>
                {rotuloStatus[s]}
              </option>
            ))}
          </select>
          <button type="button" aria-pressed={!!proprio.soAtrasadas} onClick={() => setProprio({ ...proprio, soAtrasadas: !proprio.soAtrasadas })} className={cn('h-7 cursor-pointer rounded-full border px-2.5', proprio.soAtrasadas ? 'bg-destructive text-destructive-foreground border-transparent' : 'hover:bg-accent')}>
            só atrasadas
          </button>
        </div>
      )}
      <DndContext sensors={sensores} onDragEnd={fim}>
        {visao === 'mes' ? (
          <div className="grid grid-cols-7 gap-1" role="grid" aria-label={titulo}>
            {nomesDia.slice(1).concat('dom').map((n) => (
              <div key={n} className="text-muted-foreground px-1 text-[11px]">
                {n}
              </div>
            ))}
            {dias.map((iso) => {
              const lista = doDia(iso)
              return (
                <Dia key={iso} iso={iso} hoje={iso === data} foraDoMes={iso.slice(5, 7) !== ref.slice(5, 7)} feriado={feriados[iso]} compacto>
                  {lista.slice(0, 3).map((t) => item(t, true))}
                  {lista.length > 3 && (
                    <button type="button" className="text-muted-foreground hover:text-foreground cursor-pointer text-left text-[11px]" onClick={() => (setRef(iso), setVisao('dia'))}>
                      + {lista.length - 3} tarefas
                    </button>
                  )}
                </Dia>
              )
            })}
          </div>
        ) : (
          <div className={cn('grid gap-2', visao === 'dia' ? 'grid-cols-1' : celular ? 'min-w-[540px] grid-cols-5' : 'min-w-[720px] grid-cols-7')} role="grid" aria-label={titulo}>
            {dias.map((iso) => {
              const lista = doDia(iso)
              return (
                <Dia key={iso} iso={iso} hoje={iso === data} feriado={feriados[iso]} detalhe={visao === 'dia'} cabecalho={`${nomesDia[diaSemana(iso)]} ${iso.slice(8, 10)}`}>
                  {grupos(lista).map((g) =>
                    g.grupo ? (
                      <div key={`g-${g.grupo}`} className="flex flex-col gap-1">
                        <button type="button" aria-expanded={grupoAberto === `${iso}:${g.grupo}`} onClick={() => setGrupoAberto(grupoAberto === `${iso}:${g.grupo}` ? null : `${iso}:${g.grupo}`)} className="bg-raised hover:bg-raised/70 flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-2 text-left text-xs">
                          <span className="size-2 shrink-0 rounded-full" style={{ background: integrante(g.tarefas[0].setor).cor }} aria-hidden />
                          <span className="font-medium">{g.grupo}</span>
                          <span className="text-muted-foreground">× {g.tarefas.length}</span>
                          {g.tarefas.some((t) => t.atrasada) && <WarningIcon className="text-destructive ml-auto size-3" aria-label="com atrasadas" />}
                        </button>
                        {grupoAberto === `${iso}:${g.grupo}` && <div className="flex flex-col gap-1 pl-2">{g.tarefas.map((t) => item(t, true))}</div>}
                      </div>
                    ) : (
                      item(g.tarefas[0], false)
                    ),
                  )}
                  {lista.length === 0 && visao === 'dia' && <p className="text-muted-foreground py-6 text-center text-sm">Nenhuma tarefa com prazo neste dia.</p>}
                </Dia>
              )
            })}
          </div>
        )}
      </DndContext>
      {onReprogramar && <p className="text-muted-foreground text-[11px]">Arraste para reprogramar o prazo interno (ou use “reprogramar”). O prazo legal não muda.</p>}
    </div>
  )
}

function Dia({ iso, hoje, foraDoMes, feriado, cabecalho, compacto, detalhe, children }: { iso: string; hoje: boolean; foraDoMes?: boolean; feriado?: string; cabecalho?: string; compacto?: boolean; detalhe?: boolean; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: `dia:${iso}` })
  return (
    <div ref={setNodeRef} role="gridcell" aria-label={`${diaMesDeIso(iso)}${feriado ? `, feriado: ${feriado}` : ''}`} className={cn('flex min-w-0 flex-col gap-1.5 rounded-md p-1 transition-colors', compacto && 'min-h-24 border', isOver && 'bg-accent', foraDoMes && 'opacity-50', feriado && 'bg-sunken/60')}>
      <div className={cn('flex items-center gap-1 px-1 text-sm', hoje ? 'text-foreground font-medium' : 'text-muted-foreground', compacto && 'text-xs')}>
        {cabecalho ?? iso.slice(8, 10)}
        {hoje && <span className="bg-primary text-primary-foreground rounded-full px-1.5 text-[10px]">hoje</span>}
        {feriado && (
          <span title={feriado} className="ml-auto flex items-center gap-0.5 text-[10px]">
            <CalendarDotsIcon className="size-3" /> feriado
          </span>
        )}
      </div>
      {feriado && detalhe && <p className="text-muted-foreground px-1 text-[10px] leading-tight">{feriado}</p>}
      {children}
    </div>
  )
}

function ItemCalendario({ t, compacto, cor, nomeSetor, movel, reprogramando, onReprogramar, onEscolherData, onAbrir }: { t: Tarefa; compacto: boolean; cor: string; nomeSetor: string; movel: boolean; reprogramando: boolean; onReprogramar: () => void; onEscolherData: (iso: string) => void; onAbrir: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: t.id, disabled: !movel })
  const estilo = transform ? { transform: `translate(${transform.x}px, ${transform.y}px)`, zIndex: 30 } : undefined
  const [data, setData] = useState(isoDeDiaMes(t.prazo))
  return (
    <div ref={setNodeRef} style={estilo} className={cn('bg-raised flex flex-col gap-0.5 rounded-md text-left text-xs', compacto ? 'px-1.5 py-1' : 'px-2.5 py-2', t.atrasada && 'ring-destructive/60 ring-1', isDragging && 'shadow-lg', t.status === 'concluida' && 'opacity-60')}>
      <button type="button" {...attributes} {...listeners} onClick={onAbrir} aria-roledescription={movel ? 'tarefa arrastável' : undefined} className={cn('flex min-w-0 cursor-pointer flex-col gap-0.5 text-left', movel && 'touch-none')}>
        <span className="text-muted-foreground flex items-center gap-1.5">
          <span className="size-2 shrink-0 rounded-full" style={{ background: cor }} aria-hidden />
          <span className="truncate">{compacto ? t.titulo : `${nomeSetor} · ${t.cliente}`}</span>
          {t.atrasada && <WarningIcon className="text-destructive ml-auto size-3 shrink-0" aria-label="atrasada" />}
        </span>
        {!compacto && <span className="text-foreground line-clamp-2 font-medium">{t.titulo}</span>}
        {!compacto && t.prazoLegal && t.prazoLegal !== t.prazo && <span className="text-muted-foreground text-[10px]">prazo legal {t.prazoLegal}</span>}
        {!compacto && t.status !== 'a_fazer' && <span className="text-muted-foreground text-[10px]">{rotuloStatus[t.status]}</span>}
      </button>
      {!compacto && movel && (
        <button type="button" onClick={onReprogramar} className="text-muted-foreground hover:text-foreground w-fit cursor-pointer text-[10px] underline underline-offset-2">
          reprogramar
        </button>
      )}
      {reprogramando && (
        <form
          className="flex gap-1"
          onSubmit={(e) => {
            e.preventDefault()
            onEscolherData(data)
          }}
        >
          <input type="date" aria-label={`Novo prazo interno de ${t.titulo}`} value={data} onChange={(e) => setData(e.target.value)} className="bg-background min-w-0 flex-1 rounded border px-1 text-[11px]" />
          <button type="submit" className="bg-foreground text-background cursor-pointer rounded px-1.5 text-[11px]">
            ok
          </button>
        </form>
      )}
    </div>
  )
}

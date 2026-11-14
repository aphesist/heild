import { CaretLeftIcon, CaretRightIcon, WarningIcon } from '@phosphor-icons/react'
import { useMemo, useState } from 'react'
import { useFluxos } from '@/ambiente/fluxos'
import { Button } from '@/components/ui/button'
import type { StatusTarefa, Tarefa } from '@/dados/tipos'
import { cn } from '@/lib/utils'
import { useTema } from '@/theme/ThemeProvider'
import type { SetorIntegrante } from '@/theme/tipos'
import { statusFinal } from './rotulos'

/**
 * Calendário de tarefas (S04-T04; contrato C5). Dia, semana e mês; arrastar
 * para reprogramar o prazo interno; grupos ("PGDAS-D × 14"); filtros.
 *
 * Esqueleto do contrato: assinatura estável, semana funcionando. O resto
 * (dia, mês, arrastar com confirmação de multa, feriados) chega no mesmo
 * componente sem mudar as props.
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
  /** Filtros vindos de fora (a tela pode também deixar a pessoa filtrar). */
  filtros?: FiltrosCalendario
  /** Abrir a tarefa (padrão: a ficha da tarefa). */
  onAbrir?: (tarefa: Tarefa) => void
  /** Data de referência ISO (padrão: o "hoje" da demonstração). */
  data?: string
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
const inicioDaSemana = (iso: string) => {
  const d = new Date(`${iso}T12:00:00`)
  return somarDias(iso, -((d.getDay() + 6) % 7))
}
const nomesDia = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']

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

export function Calendario({ tarefas, visao: visaoInicial = 'semana', filtros, onAbrir, data = HOJE_DEMO, className }: CalendarioProps) {
  const fluxos = useFluxos()
  const { integrante } = useTema()
  const [ref, setRef] = useState(data)
  const abrir = onAbrir ?? ((t: Tarefa) => fluxos.abrirTarefa(t.id))
  const visiveis = useMemo(() => filtrarCalendario(tarefas, filtros), [tarefas, filtros])
  void visaoInicial
  const inicio = inicioDaSemana(ref)
  const dias = Array.from({ length: 5 }, (_, i) => somarDias(inicio, i))
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center gap-1">
        <Button size="icon-sm" variant="ghost" aria-label="Semana anterior" onClick={() => setRef(somarDias(ref, -7))}>
          <CaretLeftIcon />
        </Button>
        <Button size="icon-sm" variant="ghost" aria-label="Próxima semana" onClick={() => setRef(somarDias(ref, 7))}>
          <CaretRightIcon />
        </Button>
        <span className="text-muted-foreground text-xs">
          {diaMesDeIso(dias[0])} a {diaMesDeIso(dias[4])}
        </span>
      </div>
      <div className="grid min-w-[540px] grid-cols-5 gap-2">
        {dias.map((dia) => (
          <div key={dia} className="flex min-w-0 flex-col gap-2">
            <div className={cn('px-1 text-sm', dia === data ? 'text-foreground font-medium' : 'text-muted-foreground')}>
              {nomesDia[new Date(`${dia}T12:00:00`).getDay()]} {dia.slice(8, 10)}
            </div>
            {visiveis
              .filter((t) => isoDeDiaMes(t.prazo) === dia)
              .map((t) => (
                <button key={t.id} type="button" onClick={() => abrir(t)} className={cn('bg-raised hover:bg-raised/70 flex cursor-pointer flex-col gap-0.5 rounded-[14px] px-2.5 py-2 text-left text-xs', t.atrasada && 'ring-destructive/60 ring-1')}>
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <span className="size-2 shrink-0 rounded-full" style={{ background: integrante(t.setor).cor }} aria-hidden />
                    <span className="truncate">{t.cliente}</span>
                    {t.atrasada && <WarningIcon className="text-destructive ml-auto size-3 shrink-0" aria-label="atrasada" />}
                  </span>
                  <span className="text-foreground line-clamp-2 font-medium">{t.titulo}</span>
                </button>
              ))}
          </div>
        ))}
      </div>
    </div>
  )
}

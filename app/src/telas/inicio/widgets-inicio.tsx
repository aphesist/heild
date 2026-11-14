import { ArrowRightIcon, CalendarBlankIcon, ChartBarIcon, CheckCircleIcon, CheckIcon, CircleIcon, ClockCounterClockwiseIcon, GaugeIcon, HeadsetIcon, PaperPlaneTiltIcon, RocketLaunchIcon, ScalesIcon, SparkleIcon, TimerIcon, TreeStructureIcon, UsersThreeIcon, WarningIcon, type Icon } from '@phosphor-icons/react'
import { useMemo, useState, type ReactNode } from 'react'
import { useEfeitosCartao } from '@/ambiente/efeitos'
import { useFluxos } from '@/ambiente/fluxos'
import { useLoja, useNavegacao, usePersistente, type Destino } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import { AvisoIntegrante } from '@/components/compostos/aviso-integrante'
import { AvisoCompacto } from '@/components/compostos/aviso-compacto'
import { Calendario, isoDeDiaMes, HOJE_DEMO, type FiltrosCalendario } from '@/components/compostos/calendario'
import { statusAberto } from '@/components/compostos/rotulos'
import { LinkWidget, Medidor } from '@/components/compostos/widgets'
import { useConfirmar } from '@/components/kit/confirmar'
import { EstadoVazio } from '@/components/kit/estados'
import { Button } from '@/components/ui/button'
import { GrupoOrbs } from '@/components/ui/orb'
import type { DefWidget, ItemGrade } from '@/components/widgets/tipos'
import { cabe } from '@/components/widgets/widget'
import type { Aviso, Tarefa } from '@/dados/tipos'
import { semana as semanaTs } from '@/dados/timesheet'
import { cn } from '@/lib/utils'
import { rotuloSetorCurto } from '@/nucleo/permissoes'
import { useTabela, useBanco } from '@/nucleo/react'
import type { SetorIntegrante } from '@/theme/tipos'
import { ordemPrazo } from './minha-fila'
import { useImplantacao } from '@/dados/implantacao'
import { ListaPendencias } from './pendencias'

/*
 * Widgets vivos da Visão geral (S01-T05; 03, 4): tudo sai das tarefas,
 * conversas, eventos e clientes do banco, no escopo da pessoa e do cliente
 * do seletor. Papel muda o que aparece (custo e rentabilidade nunca para
 * Membro). Outra sessão acrescenta widgets na galeria por `widgetsExtras`.
 */

const HOJE = '18/11'
const diasAte = (prazo: string) => {
  const iso = isoDeDiaMes(prazo)
  if (!iso) return 999
  return Math.round((Date.parse(`${iso}T12:00:00`) - Date.parse(`${HOJE_DEMO}T12:00:00`)) / 86_400_000)
}
/** Horas padrão por atividade (catálogo; aqui pelo prefixo, demonstração). */
const horasPadrao = (codigo: string) => (/^FIS|^NFE/.test(codigo) ? 1.5 : /^DP/.test(codigo) ? 2 : /^CTB/.test(codigo) ? 3 : /^SOC/.test(codigo) ? 2.5 : 1)

/** Arranjo padrão por papel (03, 4.2 e 4.3: "Restaurar padrão" volta ao do papel). */
export function padraoDoPapel(papel: 'administrador' | 'gestor' | 'colaborador'): ItemGrade[] {
  const comum: ItemGrade[] = [
    { id: 'ind-atrasadas', tamanho: 'P' },
    { id: 'ind-hoje', tamanho: 'P' },
    { id: 'ind-entregues', tamanho: 'P' },
    { id: 'ind-conversas', tamanho: 'P' },
  ]
  if (papel === 'administrador')
    return [{ id: 'primeiros', tamanho: 'L' }, ...comum, { id: 'faixas', tamanho: 'M' }, { id: 'calendario', tamanho: 'XL' }, { id: 'avisos', tamanho: 'G' }, { id: 'implantacoes', tamanho: 'G' }, { id: 'sla', tamanho: 'G' }, { id: 'pendencias', tamanho: 'G' }, { id: 'linha', tamanho: 'G' }, { id: 'time', tamanho: 'G' }]
  if (papel === 'gestor') return [...comum, { id: 'faixas', tamanho: 'M' }, { id: 'calendario', tamanho: 'XL' }, { id: 'avisos', tamanho: 'G' }, { id: 'sla', tamanho: 'G' }, { id: 'carga', tamanho: 'G' }, { id: 'pendencias', tamanho: 'G' }, { id: 'linha', tamanho: 'G' }]
  return [...comum, { id: 'ind-horas', tamanho: 'P' }, { id: 'medidor', tamanho: 'M' }, { id: 'calendario', tamanho: 'XL' }, { id: 'avisos', tamanho: 'G' }, { id: 'pendencias', tamanho: 'G' }, { id: 'faixas', tamanho: 'M' }, { id: 'linha', tamanho: 'G' }, { id: 'time', tamanho: 'G' }]
}

/** Widgets de outras sessões para a galeria da Visão geral (S11: saúde da captura, prazos do Jurídico). Acrescente no fim. */
export const widgetsExtras: ((ctx: { clienteId: string | null }) => DefWidget | null)[] = [
  // S11 entrega: saúde da captura e prazos hoje e na semana (só com o pacote Jurídico).
  () => ({ id: 'juridico-prazos', titulo: 'Prazos do Jurídico', descricao: 'Prazos de hoje e da semana (pacote Jurídico)', icone: ScalesIcon, tamanhos: ['M', 'G'], conteudo: () => <EstadoVazio compacto icone={ScalesIcon} titulo="Pacote Jurídico não contratado" descricao="Com o pacote, os prazos de hoje e da semana aparecem aqui." /> }),
]

interface CtxVivo {
  /** Eventos de exemplo para completar a linha do tempo (escritório completo). */
  linhaExemplo?: { id: string; hora: string; texto: string; ator: string }[]
  clienteNome?: string
  clienteId: string | null
  avisos: Aviso[]
  onAbrirIntegrante?: (s: SetorIntegrante) => void
  timeAgora: ReactNode
}

/** Indicador clicável: o número abre a lista filtrada (S01-A50). */
function Numero({ valor, detalhe, tom, onAbrir }: { valor: string; detalhe?: string; tom?: 'atencao' | 'bom'; onAbrir?: () => void }) {
  return (
    <button type="button" onClick={onAbrir} disabled={!onAbrir} className="group flex h-full w-full cursor-pointer flex-col justify-end gap-0.5 text-left disabled:cursor-default">
      <span className="font-heading text-4xl leading-none font-light tracking-tight tabular-nums group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4 baixa:text-3xl">{valor}</span>
      {detalhe && (
        <span className="text-muted-foreground flex items-center gap-1 truncate text-xs">
          {tom === 'atencao' && <WarningIcon className="text-warning size-3.5 shrink-0" aria-label="atenção" />}
          {tom === 'bom' && <CheckIcon className="text-success size-3.5 shrink-0" aria-label="bom" />}
          <span className="truncate">{detalhe}</span>
        </span>
      )}
    </button>
  )
}

export function useCatalogoVivo({ linhaExemplo = [], clienteNome, clienteId, avisos, onAbrirIntegrante, timeAgora }: CtxVivo): DefWidget[] {
  const loja = useLoja()
  const nav = useNavegacao()
  const fluxos = useFluxos()
  const { usuario, permissoes, contas } = useSessao()
  const papel = usuario.papel
  const setores = permissoes.setores
  const gere = permissoes.gere
  const eventos = useTabela('evento')
  const { escritorio } = useBanco()
  const implantacao = useImplantacao()

  // Tarefas no escopo: setores da pessoa e o cliente do seletor.
  const tarefas = useMemo(() => loja.tarefas.filter((t) => (papel === 'administrador' || setores.includes(t.setor)) && t.status !== 'cancelada' && (!clienteNome || t.cliente === clienteNome)), [loja.tarefas, papel, setores, clienteNome])
  const abertas = tarefas.filter((t) => statusAberto(t.status))
  const atrasadas = abertas.filter((t) => t.atrasada)
  const hoje = abertas.filter((t) => t.prazo === HOJE)
  const doMes = tarefas.filter((t) => t.prazo.endsWith('/11'))
  const entregues = doMes.filter((t) => t.status === 'concluida').length
  const conversas = loja.conversas.filter((c) => setores.includes(c.setor) && c.status !== 'resolvida' && (!clienteId || c.clienteId === clienteId))
  const semResposta = conversas.filter((c) => c.status === 'nova' || (c.naoLidas ?? 0) > 0)
  const quebra = (lista: Tarefa[]) => {
    if (papel === 'colaborador') return undefined
    if (papel === 'administrador') {
      const por = new Map<string, number>()
      lista.forEach((t) => por.set(rotuloSetorCurto[t.setor] ?? t.setor, (por.get(rotuloSetorCurto[t.setor] ?? t.setor) ?? 0) + 1))
      return [...por.entries()].map(([s, n]) => `${s} ${n}`).join(' · ')
    }
    const por = new Map<string, number>()
    lista.filter((t) => gere.includes(t.setor)).forEach((t) => por.set(t.responsavel?.nome.split(' ')[0] ?? 'sem dono', (por.get(t.responsavel?.nome.split(' ')[0] ?? 'sem dono') ?? 0) + 1))
    return [...por.entries()].map(([s, n]) => `${s} ${n}`).join(' · ')
  }
  const irObrigacoes = (filtro?: Partial<Destino>) => nav.irPara({ modulo: 'painel', aba: 'obrigacoes', ...(clienteId ? { cliente: clienteId } : {}), ...filtro })

  // Calendário: filtro padrão "eu" para Membro, "equipe" para Gestor e Administrador (S01-A47).
  const [quem, setQuem] = usePersistente<'eu' | 'equipe' | 'integrante' | 'todos'>(`s01:visao:calendario:quem:${usuario.id}`, papel === 'colaborador' ? 'eu' : 'equipe')
  const [setorCal, setSetorCal] = useState<SetorIntegrante | 'todos'>('todos')
  const [soAtrasadas, setSoAtrasadas] = useState(false)
  const doCalendario = useMemo(
    () => tarefas.filter((t) => (quem === 'eu' ? t.responsavel?.nome === usuario.nome : quem === 'integrante' ? t.responsavel?.tipo === 'integrante' : quem === 'equipe' ? t.responsavel?.tipo === 'pessoa' : true)),
    [tarefas, quem, usuario.nome],
  )
  const filtros: FiltrosCalendario = { ...(setorCal !== 'todos' ? { setores: [setorCal] } : {}), soAtrasadas }
  const confirmar = useConfirmar()
  // O Calendario (S04, C5) confere quem pode mover e pede confirmação ao passar do prazo legal; aqui só grava.
  const reprogramar = (t: Tarefa, novo: string) => {
    const antes = t.prazo
    loja.atualizarTarefa(t.id, { prazo: novo })
    loja.registrar(usuario.nome, `tarefa.reprogramar: ${t.codigo} · ${t.cliente} de ${antes} para ${novo} (prazo interno)`)
    loja.toastDesfazer(`${t.codigo}: prazo interno agora ${novo}.`, () => loja.atualizarTarefa(t.id, { prazo: antes }))
  }

  const efeitos = useEfeitosCartao()
  const pendentesDecisao = avisos.filter((a) => a.decisao && !(a.cartaoChat && loja.estado.decisoes[a.cartaoChat]))
  const linha = eventos
    .filter((e) => e.visivel_na_linha_do_tempo !== false && (!clienteId || e.cliente_id === clienteId))
    .sort((a, b) => b.criado_em.localeCompare(a.criado_em))
    .slice(0, 30)
    .map((e) => ({ id: e.id, texto: e.texto, quando: new Date(e.criado_em).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }), ator: e.ator_nome ?? (e.ator_tipo === 'integrante' ? 'integrante' : e.ator_tipo === 'sistema' ? 'sistema' : 'pessoa'), tipo: e.ator_tipo as string }))
  const linhaCompleta = [...linha, ...linhaExemplo.map((e) => ({ id: e.id, texto: e.texto, quando: e.hora, ator: e.ator, tipo: /integrante/i.test(e.ator) ? 'integrante' : 'pessoa' }))].slice(0, 30)
  const [passos, setPassos] = usePersistente<string[]>('s01:primeiros-passos', [])
  const primeiros = [
    { id: 'clientes', rotulo: 'Importar os clientes', feito: loja.clientes.length > 0, destino: { modulo: 'painel', aba: 'societario' } as Destino },
    { id: 'armazenamento', rotulo: 'Conectar o armazenamento', feito: passos.includes('armazenamento'), destino: { modulo: 'config', aba: 'armazenamento' } as Destino },
    { id: 'equipe', rotulo: 'Convidar a equipe', feito: contas.length > 1, destino: { modulo: 'config', aba: 'usuarios' } as Destino },
    { id: 'campanha', rotulo: 'Campanha de procurações e certidões (SOC-014 e SOC-011)', feito: passos.includes('campanha'), destino: { modulo: 'painel', aba: 'societario' } as Destino },
  ]
  const faltam = primeiros.filter((p) => !p.feito)
  const sla = loja.conversas.filter((c) => c.status !== 'resolvida' && (!c.responsavel || (c.prazoMin !== null && c.prazoMin < 30)) && (papel === 'administrador' || gere.includes(c.setor)))
  const implantacoes = loja.clientes.filter((c) => c.situacao === 'implantacao')
  const carga = useMemo(() => {
    const por = new Map<string, { tarefas: number; horas: number }>()
    abertas.filter((t) => t.responsavel?.tipo === 'pessoa' && (papel === 'administrador' || gere.includes(t.setor))).forEach((t) => {
      const k = t.responsavel!.nome
      const x = por.get(k) ?? { tarefas: 0, horas: 0 }
      por.set(k, { tarefas: x.tarefas + 1, horas: x.horas + horasPadrao(t.codigo) })
    })
    return [...por.entries()].sort((a, b) => b[1].horas - a[1].horas)
  }, [abertas, papel, gere])
  const vencido = atrasadas
  const sete = abertas.filter((t) => !t.atrasada && diasAte(t.prazo) >= 0 && diasAte(t.prazo) <= 7)
  const trinta = abertas.filter((t) => !t.atrasada && diasAte(t.prazo) > 7 && diasAte(t.prazo) <= 30)
  const urgentes = [...abertas].sort((a, b) => Number(!!b.atrasada) - Number(!!a.atrasada) || ordemPrazo(a.prazo) - ordemPrazo(b.prazo)).slice(0, 3)
  const horasSemana = semanaTs.reduce((s, d) => s + d.automatica + d.confirmada + d.estimada, 0) / 60
  const horasEstimadas = semanaTs.reduce((s, d) => s + d.estimada, 0) / 60

  const ind = (id: string, titulo: string, icone: Icon, valor: string, detalhe: string | undefined, tom: 'atencao' | 'bom' | undefined, onAbrir?: () => void): DefWidget => ({ id, titulo, descricao: `Indicador: ${titulo.toLowerCase()}`, icone, tamanhos: ['P', 'M'], conteudo: () => <Numero valor={valor} detalhe={detalhe} tom={tom} onAbrir={onAbrir} /> })

  const catalogo: DefWidget[] = [
    ind('ind-atrasadas', 'Atrasadas', WarningIcon, String(atrasadas.length), quebra(atrasadas) ?? (atrasadas[0] ? `${atrasadas[0].codigo} e mais ${Math.max(0, atrasadas.length - 1)}` : 'nada atrasado'), atrasadas.length ? 'atencao' : 'bom', () => irObrigacoes()),
    ind('ind-hoje', 'Vencem hoje', CalendarBlankIcon, String(hoje.length), hoje.map((t) => t.codigo).join(', ') || 'nada vence hoje', undefined, () => irObrigacoes()),
    ind('ind-entregues', 'Entregues no mês', ChartBarIcon, `${entregues}/${doMes.length}`, doMes.length ? `${Math.round((entregues / doMes.length) * 100)}% · ${doMes.length - entregues} pendentes` : 'sem tarefas no mês', entregues === doMes.length ? 'bom' : undefined, () => irObrigacoes()),
    ind('ind-conversas', 'Conversas sem resposta', PaperPlaneTiltIcon, String(semResposta.length), semResposta[0] ? `a mais antiga: ${semResposta[0].pessoa.nome}` : 'tudo respondido', semResposta.length ? 'atencao' : 'bom', () => nav.irPara({ modulo: 'crm', aba: 'conversas' })),
    ind('ind-horas', 'Horas da semana', TimerIcon, `${Math.round(horasSemana)}h`, `${Math.round(horasEstimadas)}h estimadas; confirme no Timesheet`, undefined, () => nav.irPara({ modulo: 'timesheet', aba: 'meu' })),
    {
      id: 'medidor',
      titulo: 'Obrigações do mês',
      descricao: 'Entregues contra o total do mês, em barra',
      icone: GaugeIcon,
      tamanhos: ['M', 'L'],
      conteudo: () => (
        <div className="flex h-full flex-col justify-end">
          <Medidor rotulo="Entregues" valor={entregues} total={Math.max(1, doMes.length)} />
        </div>
      ),
    },
    {
      id: 'calendario',
      titulo: 'Calendário',
      descricao: 'Tarefas e obrigações por prazo interno, com o setor de cada uma; filtros e reprogramar',
      icone: CalendarBlankIcon,
      tamanhos: ['G', 'XL'],
      acao: <LinkWidget destino={{ modulo: 'painel', aba: 'obrigacoes' }}>Abrir</LinkWidget>,
      conteudo: (t) => (
        <div className="flex h-full min-h-0 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <div role="radiogroup" aria-label="Responsável" className="bg-sunken flex rounded-full p-0.5">
              {(
                [
                  ['eu', 'Eu'],
                  ['equipe', 'Equipe'],
                  ['integrante', 'Integrantes'],
                  ['todos', 'Todos'],
                ] as const
              ).map(([v, r]) => (
                <button key={v} type="button" role="radio" aria-checked={quem === v} onClick={() => setQuem(v)} className={cn('cursor-pointer rounded-full px-2.5 py-1', quem === v && 'bg-raised shadow-pilula')}>
                  {r}
                </button>
              ))}
            </div>
            <select aria-label="Setor" value={setorCal} onChange={(e) => setSetorCal(e.target.value as SetorIntegrante | 'todos')} className="bg-sunken cursor-pointer rounded-full px-2.5 py-1 outline-none">
              <option value="todos">Todos os setores</option>
              {setores.map((s) => (
                <option key={s} value={s}>
                  {rotuloSetorCurto[s] ?? s}
                </option>
              ))}
            </select>
            <button type="button" aria-pressed={soAtrasadas} onClick={() => setSoAtrasadas((v) => !v)} className={cn('cursor-pointer rounded-full px-2.5 py-1', soAtrasadas ? 'bg-foreground text-background' : 'bg-sunken')}>
              Só atrasadas
            </button>
          </div>
          <div className="area-rolagem-dupla min-h-0 flex-1 overflow-auto">
            {doCalendario.length === 0 ? (
              <EstadoVazio compacto icone={CalendarBlankIcon} titulo="Nenhuma tarefa nesta semana" descricao="Gere o calendário de dezembro em Painel › Obrigações." />
            ) : (
              <Calendario tarefas={doCalendario} filtros={filtros} semFiltros visao={cabe(t, { colunas: 4 }) ? 'semana' : 'dia'} onReprogramar={reprogramar} />
            )}
          </div>
        </div>
      ),
    },
    {
      id: 'avisos',
      titulo: 'Avisos do time',
      descricao: 'Desde o último acesso: o que fizeram, o que pede decisão e o que informam',
      icone: SparkleIcon,
      tamanhos: ['G', 'XL'],
      acao:
        pendentesDecisao.length > 1 ? (
          <Button
            size="sm"
            variant="link"
            className="text-muted-foreground h-auto px-0"
            onClick={async () => {
              if (!(await confirmar({ titulo: `Aprovar as ${pendentesDecisao.length} decisões?`, descricao: pendentesDecisao.map((a) => `• ${a.decisao!.texto}`).join('\n'), acao: 'Aprovar todas' }))) return
              pendentesDecisao.forEach((a) => efeitos(a.cartaoChat ?? `aviso-${a.id}`, 'aprovar'))
            }}
          >
            Decidir em lote ({pendentesDecisao.length})
          </Button>
        ) : undefined,
      conteudo: (t) =>
        avisos.length === 0 ? (
          <EstadoVazio compacto icone={SparkleIcon} titulo="O time não teve nada a dizer desde ontem" />
        ) : cabe(t, { colunas: 4 }) ? (
          <div className="grid grid-cols-2 gap-2">
            {avisos.map((a) => (
              <AvisoIntegrante key={a.id} aviso={a} idDecisao={a.cartaoChat ?? `aviso-${a.id}`} onDecidir={(d) => efeitos(a.cartaoChat ?? `aviso-${a.id}`, d)} onAbrirChat={() => onAbrirIntegrante?.(a.setor)} className="bg-raised" />
            ))}
          </div>
        ) : (
          <GrupoOrbs divergente={avisos.some((a) => a.decisao)}>
            <div className="flex flex-col gap-2">
              {avisos.map((a) => (
                <AvisoCompacto key={a.id} aviso={a} className="bg-raised" onAbrir={() => onAbrirIntegrante?.(a.setor)} />
              ))}
            </div>
          </GrupoOrbs>
        ),
    },
    {
      id: 'pendencias',
      titulo: 'Pendências por cliente',
      descricao: 'O que os clientes devem, há quantos dias, com cobrar e marcar recebida',
      icone: PaperPlaneTiltIcon,
      tamanhos: ['G', 'XL'],
      conteudo: () => <ListaPendencias clienteNome={clienteNome} />,
    },
    {
      id: 'linha',
      titulo: `Linha do tempo · ${clienteNome ?? 'Carteira'}`,
      descricao: 'Últimos 30 eventos (pessoa, integrante, sistema)',
      icone: ClockCounterClockwiseIcon,
      tamanhos: ['G', 'XL'],
      conteudo: () =>
        linhaCompleta.length === 0 ? (
          <EstadoVazio compacto icone={ClockCounterClockwiseIcon} titulo={clienteId ? 'Nada registrado ainda' : 'Selecione um cliente'} descricao={clienteId ? 'O que a equipe e o time fizerem aparece aqui.' : 'A linha do tempo mostra o que aconteceu com um cliente.'} />
        ) : (
          <ol className="flex flex-col gap-3 py-1">
            {linhaCompleta.map((e) => (
              <li key={e.id} className="flex gap-2.5 text-sm">
                <span className={cn('mt-1.5 size-2 shrink-0 rounded-full', e.tipo === 'integrante' ? 'bg-highlight' : e.tipo === 'sistema' ? 'bg-muted-foreground' : 'bg-foreground')} aria-hidden />
                <span className="min-w-0">
                  <span className="block leading-snug">{e.texto}</span>
                  <span className="text-muted-foreground block text-xs">
                    {e.quando} · {e.ator}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        ),
    },
    { id: 'time', titulo: 'Time agora', descricao: 'Estado de cada integrante e o que está fazendo', icone: UsersThreeIcon, tamanhos: ['M', 'G'], conteudo: () => timeAgora },
    {
      id: 'faixas',
      titulo: 'Prazos',
      descricao: 'Vencido · 7 dias · 30 dias e as três mais urgentes (D-20)',
      icone: WarningIcon,
      tamanhos: ['M', 'G'],
      conteudo: (t) => (
        <div className="flex h-full flex-col gap-2">
          <div className="grid grid-cols-3 gap-2 text-center">
            {(
              [
                ['Vencido', vencido.length, 'text-destructive'],
                ['7 dias', sete.length, 'text-warning'],
                ['30 dias', trinta.length, 'text-foreground'],
              ] as const
            ).map(([r, n, c]) => (
              <button key={r} type="button" onClick={() => irObrigacoes()} className="bg-raised hover:bg-sunken cursor-pointer rounded-[14px] px-2 py-1.5">
                <span className={cn('font-heading block text-2xl font-light tabular-nums', c)}>{n}</span>
                <span className="text-muted-foreground block text-xs">{r}</span>
              </button>
            ))}
          </div>
          {cabe(t, { linhas: 2 }) && (
            <ul className="flex flex-col gap-1">
              {urgentes.map((u) => (
                <li key={u.id}>
                  <button type="button" onClick={() => fluxos.abrirTarefa(u.id)} className="hover:bg-raised flex w-full cursor-pointer items-center gap-2 rounded-[10px] px-2 py-1 text-left text-xs">
                    {u.atrasada ? <WarningIcon className="text-destructive size-3.5 shrink-0" aria-label="atrasada" /> : <CircleIcon className="text-muted-foreground size-3.5 shrink-0" />}
                    <span className="min-w-0 flex-1 truncate">
                      {u.codigo} · {u.titulo}
                    </span>
                    <span className="text-muted-foreground shrink-0 tabular-nums">{u.prazo}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ),
    },
  ]

  if (papel !== 'colaborador') {
    catalogo.push({
      id: 'sla',
      titulo: 'Sem responsável e SLA a vencer',
      descricao: 'Conversas do CRM sem dono ou perto de estourar o prazo de resposta',
      icone: HeadsetIcon,
      tamanhos: ['G', 'M'],
      conteudo: () =>
        sla.length === 0 ? (
          <EstadoVazio compacto icone={HeadsetIcon} titulo="Tudo com dono e dentro do prazo" />
        ) : (
          <ul className="flex flex-col gap-1">
            {sla.map((c) => (
              <li key={c.id}>
                <button type="button" onClick={() => nav.irPara({ modulo: 'crm', aba: 'conversas', conversa: c.id })} className="hover:bg-raised flex w-full cursor-pointer items-center gap-2 rounded-[10px] px-2 py-1.5 text-left text-sm">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{c.pessoa.nome}</span>
                    <span className="text-muted-foreground block truncate text-xs">
                      {c.cliente ?? 'lead'} · {rotuloSetorCurto[c.setor]} · {c.responsavel ?? 'sem responsável'}
                    </span>
                  </span>
                  <span className={cn('shrink-0 text-xs font-medium', c.prazoMin !== null && c.prazoMin < 0 ? 'text-destructive' : 'text-warning')}>{c.prazoMin === null ? 'pausado' : c.prazoMin < 0 ? `estourou ${-c.prazoMin} min` : `${c.prazoMin} min`}</span>
                </button>
              </li>
            ))}
          </ul>
        ),
    })
    catalogo.push({
      id: 'carga',
      titulo: 'Carga prevista',
      descricao: 'Tarefas abertas por pessoa, em horas padrão do catálogo',
      icone: UsersThreeIcon,
      tamanhos: ['G', 'M'],
      conteudo: () =>
        carga.length === 0 ? (
          <EstadoVazio compacto icone={UsersThreeIcon} titulo="Ninguém com tarefa aberta" />
        ) : (
          <ul className="flex flex-col gap-2">
            {carga.map(([nome, c]) => (
              <li key={nome} className="flex flex-col gap-1 text-sm">
                <span className="flex justify-between">
                  <span className="truncate">{nome}</span>
                  <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                    {c.tarefas} {c.tarefas === 1 ? 'tarefa' : 'tarefas'} · {c.horas.toLocaleString('pt-BR')} h
                  </span>
                </span>
                <span className="bg-sunken h-1.5 overflow-hidden rounded-full" role="meter" aria-valuemin={0} aria-valuemax={40} aria-valuenow={c.horas} aria-label={`Carga de ${nome}`}>
                  <span className={cn('block h-full rounded-full', c.horas > 30 ? 'bg-warning' : 'bg-foreground')} style={{ width: `${Math.min(100, (c.horas / 40) * 100)}%` }} />
                </span>
              </li>
            ))}
          </ul>
        ),
    })
  }
  if (papel === 'administrador') {
    catalogo.push({
      id: 'implantacoes',
      titulo: 'Implantações em andamento',
      descricao: 'Clientes em trilha de entrada e onde pararam',
      icone: TreeStructureIcon,
      tamanhos: ['G', 'M'],
      conteudo: () =>
        implantacoes.length === 0 ? (
          <EstadoVazio compacto icone={TreeStructureIcon} titulo="Nenhum cliente em implantação" />
        ) : (
          <ul className="flex flex-col gap-1">
            {implantacoes.map((c) => {
              const parado = loja.tarefas.find((t) => t.cliente === c.nome && /^SOC-01[14]/.test(t.codigo) && statusAberto(t.status))
              return (
                <li key={c.id}>
                  <button type="button" onClick={() => nav.irPara({ modulo: 'painel', aba: 'societario', cliente: c.id, trilha: c.id })} className="hover:bg-raised flex w-full cursor-pointer items-center gap-2 rounded-[10px] px-2 py-1.5 text-left text-sm">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{c.nome}</span>
                      <span className="text-muted-foreground block truncate text-xs">{parado ? `parado em ${parado.codigo} · ${parado.titulo}` : 'trilha andando'}</span>
                    </span>
                    <ArrowRightIcon className="text-muted-foreground size-4 shrink-0" />
                  </button>
                </li>
              )
            })}
          </ul>
        ),
    })
    // S09: com a implantação do escritório concluída, a faixa some de vez.
    if (!implantacao.concluida && (faltam.length > 0 || !escritorio.completo))
      catalogo.push({
        id: 'primeiros',
        titulo: 'Primeiros passos',
        descricao: 'Até cumprir a fase 0: clientes, armazenamento, equipe e campanha',
        icone: RocketLaunchIcon,
        tamanhos: ['L', 'G'],
        conteudo: () =>
          faltam.length === 0 ? (
            <EstadoVazio compacto icone={CheckCircleIcon} titulo="Fase 0 cumprida" descricao="Pode tirar este widget no Editar painel." />
          ) : (
            <ol className="flex flex-wrap gap-2">
              {primeiros.map((p, i) => (
                <li key={p.id} className="min-w-[12rem] flex-1">
                  <div className={cn('bg-raised flex h-full items-center gap-2 rounded-[14px] px-3 py-2 text-sm', p.feito && 'opacity-60')}>
                    {p.feito ? <CheckCircleIcon className="text-success size-5 shrink-0" weight="fill" /> : <span className="bg-sunken flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] tabular-nums">{i + 1}</span>}
                    <button type="button" onClick={() => nav.irPara(p.destino)} className="min-w-0 flex-1 cursor-pointer truncate text-left underline-offset-2 hover:underline">
                      {p.rotulo}
                    </button>
                    {!p.feito && (p.id === 'armazenamento' || p.id === 'campanha') && (
                      <Button type="button" size="sm" variant="ghost" className="h-7 rounded-full px-2" onClick={() => setPassos([...passos, p.id])}>
                        feito
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          ),
      })
  }
  for (const extra of widgetsExtras) {
    const w = extra({ clienteId })
    if (w) catalogo.push(w)
  }
  return catalogo
}


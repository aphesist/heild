import { ArrowSquareOutIcon, CheckIcon, LockSimpleIcon, PlugsConnectedIcon, PlusIcon, SpinnerIcon, WarningIcon, XIcon } from '@phosphor-icons/react'
import { useMemo, useState } from 'react'
import { useNavegacao } from '@/ambiente/loja'
import { EstadoVazio, SeloDemonstracao, useAcao, useConfirmar } from '@/components/kit'
import { AreaRolagem } from '@/components/ui/area-rolagem'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CampoEscolha, GavetaFormulario, Segmentado } from '@/components/ui/formulario'
import { Orb } from '@/components/ui/orb'
import { subinquilinos } from '@/dados/configuracoes'
import { rotuloAtividade } from '@/dados/timesheet-catalogo'
import { agoraDemo, competenciaDe, ddmm, diaDe, diasUteis, duracaoMin, fmtH, fmtHoras, HOJE_TS, hm, inicioSemana, rotuloCompetencia, rotuloDia, somarDias, somarMeses } from '@/dados/timesheet-tempo'
import { useAparencia } from '@/hooks/useAparencia'
import type { ConectorCore, DuracaoPadrao, SessaoTrabalho } from '@/nucleo/modelo/entidades'
import { repos, rotuloMotivoContestacao } from '@/nucleo/repositorios'
import { servicos } from '@/servicos'
import { cn } from '@/lib/utils'
import { AdotarCalibracao, DecidirContestacao, RegistrarAusencia, RevisarAnomalia, rotuloAusencia } from './acoes'
import { Caixa, CabecalhoTs, Numero, TimesheetVazio, usePacote } from './comum'
import { ConectarCore, MapasCore } from './configuracao'
import { agrupar, cargaPrevista, diasAusente, doPacote, HORAS_DIA, humana, linhaDoDia, nomeSetor, registrada, resumoDe, rotuloConfianca, rotuloOrigem, useTimesheet, vale, type Ts } from './dados'
import { Amostra, Barras, Capacidade, ColunasEmpilhadas, Legenda, LinhasEmpilhadas, Pergunta } from './graficos'

type Periodo = 'semana' | 'mes' | 'anterior'
const INICIO_MODULO = '2026-11-02'

function intervalo(p: Periodo): [string, string] {
  if (p === 'semana') return [inicioSemana(HOJE_TS), HOJE_TS]
  if (p === 'mes') return [`${competenciaDe(HOJE_TS)}-01`, HOJE_TS]
  const c = somarMeses(competenciaDe(HOJE_TS), -1)
  return [`${c}-01`, somarDias(`${competenciaDe(HOJE_TS)}-01`, -1)]
}

/**
 * Timesheet › Equipe (05, 8.3; Gestor e Administrador): horas dos setores que a
 * pessoa gere, por pessoa e por confiança, onde foi o tempo, a captura semana a
 * semana, capacidade com ausências, contestações, cobertura, calibração, fila
 * "sem equivalente", sistemas, agentes, fora da jornada e sessões anômalas.
 * Custo-hora não aparece aqui.
 */
export function EquipeTela({ papel, clienteNome, clienteId }: { papel: 'gestor' | 'admin'; clienteNome?: string; clienteId?: string | null }) {
  const ts = useTimesheet()
  const aparencia = useAparencia()
  const nav = useNavegacao()
  const executar = useAcao()
  const confirmar = useConfirmar()
  const admin = papel === 'admin'
  const meusSetores = (admin ? [...new Set(ts.sessoes.map((s) => s.setor_id))] : (ts.permissoes.gere as string[])).filter(Boolean)
  const [setor, setSetor] = useState<string>('todos')
  const [periodo, setPeriodo] = useState<Periodo>('mes')
  const [pessoa, setPessoa] = useState('todas')
  const [confianca, setConfianca] = useState('todas')
  const [origem, setOrigem] = useState('todas')
  const [contratante, setContratante] = useState('todos')
  const [frente, setFrente] = useState('todas')
  const [onde, setOnde] = useState<'cliente' | 'atividade' | 'origem'>('cliente')
  const [decidindo, setDecidindo] = useState<SessaoTrabalho | null>(null)
  const [revisando, setRevisando] = useState<SessaoTrabalho | null>(null)
  const [registrando, setRegistrando] = useState(false)
  const [calibrando, setCalibrando] = useState<DuracaoPadrao | null>(null)
  const [conectando, setConectando] = useState<ConectorCore['core'] | null | undefined>(undefined)
  const [mapas, setMapas] = useState<ConectorCore | null>(null)
  const [lendo, setLendo] = useState<string | null>(null)
  const [vendoPessoa, setVendoPessoa] = useState<string | null>(null)
  const { pacote, chip } = usePacote()
  const [de, ate] = intervalo(periodo)
  const setores = setor === 'todos' ? meusSetores : [setor]
  const pessoas = ts.pessoasDoSetor(setores)
  const abreEm = somarDias(INICIO_MODULO, ts.cfg.equipe_apos_semanas * 7)

  const dados = useMemo(() => {
    const noPeriodo = (s: SessaoTrabalho) => {
      const d = diaDe(s.inicio)
      return d >= de && d <= ate
    }
    const filtro = (s: SessaoTrabalho) =>
      noPeriodo(s) &&
      setores.includes(s.setor_id) &&
      doPacote(pacote)(s) &&
      (!clienteId || s.cliente_id === clienteId) &&
      (pessoa === 'todas' || s.usuario_dono_id === pessoa) &&
      (confianca === 'todas' || s.confianca === confianca) &&
      (origem === 'todas' || rotuloOrigem(s) === origem) &&
      (contratante === 'todos' || contratante === 'escritorio' || s.pacote !== 'bpo') &&
      (frente === 'todas' || frente === 'financeira' || s.pacote !== 'bpo')
    const todas = ts.sessoes.filter(filtro)
    const humanas = todas.filter((s) => humana(s) && vale(s))
    const regs = humanas.filter(registrada)
    const agentes = todas.filter((s) => s.ator_tipo === 'integrante')
    // Sem classificação: lacunas e itens sem pista, por pessoa e dia, dentro da jornada.
    let semMin = 0
    const diasP = diasUteis(de, ate)
    for (const p of pessoas) if (pessoa === 'todas' || pessoa === p.id) for (const d of diasP) semMin += resumoDe(linhaDoDia(ts.sessoes, ts.itens, p.id, d, ts.cfg).filter((l) => l.tipo !== 'sessao' || setores.includes(l.s.setor_id))).sem
    return { todas, humanas, regs, agentes, semMin }
  }, [ts, de, ate, setores.join(), pacote, clienteId, pessoa, confianca, origem, contratante, frente, pessoas.length]) // eslint-disable-line react-hooks/exhaustive-deps

  if (ts.vazio) return <TimesheetVazio />
  if (!admin && HOJE_TS < abreEm)
    return <EstadoVazio icone={LockSimpleIcon} className="h-full" titulo={`A aba Equipe abre em ${ddmm(abreEm)}`} descricao={`O Administrador configurou ${ts.cfg.equipe_apos_semanas} semanas para cada pessoa ver o próprio tempo antes do Gestor ver o da equipe (05, 10.6).`} />

  const { humanas, regs, agentes, semMin } = dados
  const minTotal = regs.reduce((t, s) => t + duracaoMin(s), 0)
  const minAuto = regs.filter((s) => s.confianca === 'automatica').reduce((t, s) => t + duracaoMin(s), 0)
  // S06b: proporção entre lançamento manual e captura automática, por pessoa.
  const minManual = regs.filter((s) => s.origem === 'manual').reduce((t, s) => t + duracaoMin(s), 0)
  const manualPorPessoa = pessoas
    .map((p) => {
      const doP = regs.filter((s) => s.usuario_dono_id === p.id)
      const tot = doP.reduce((t, s) => t + duracaoMin(s), 0)
      const manual = doP.filter((s) => s.origem === 'manual').reduce((t, s) => t + duracaoMin(s), 0)
      return { nome: p.nome, manual, pct: tot ? Math.round((manual / tot) * 100) : 0, tot }
    })
    .filter((p) => p.tot > 0)
  const diasP = diasUteis(de, ate)
  const capacidade = pessoas.map((p) => {
    const aus = diasAusente(ts.ausencias, p.id, de, ate)
    const usadas = regs.filter((s) => s.usuario_dono_id === p.id).reduce((t, s) => t + duracaoMin(s), 0) / 60
    return { id: p.id, nome: p.nome, usadas: Math.round(usadas), disponivel: (diasP.length - aus) * HORAS_DIA, ausencia: aus * HORAS_DIA }
  })
  const disponivel = capacidade.reduce((t, c) => t + c.disponivel, 0)
  const itensPeriodo = ts.itens.filter((i) => i.usuario_id && i.dia >= de && i.dia <= ate && setores.includes(i.setor_id ?? ''))
  const confirmados = itensPeriodo.filter((i) => i.situacao === 'confirmado').length
  const contestacoes = ts.sessoes.filter((s) => s.contestacao && setores.includes(s.setor_id) && s.usuario_dono_id !== ts.usuario.id).sort((a, b) => (a.contestacao!.status === 'pendente' ? -1 : 1) - (b.contestacao!.status === 'pendente' ? -1 : 1))
  const aDecidir = contestacoes.filter((s) => s.contestacao!.status === 'pendente')
  const anomalas = ts.sessoes.filter((s) => s.anomalia && setores.includes(s.setor_id) && humana(s))
  const porPessoa = pessoas.map((p) => {
    const ss = humanas.filter((s) => s.usuario_dono_id === p.id)
    const soma = (c: SessaoTrabalho['confianca']) => Math.round((ss.filter((s) => s.confianca === c).reduce((t, s) => t + duracaoMin(s), 0) / 60) * 10) / 10
    return { id: p.id, rotulo: p.nome, partes: [{ c: 'automatica' as const, v: soma('automatica') }, { c: 'confirmada' as const, v: soma('confirmada') }, { c: 'estimada' as const, v: soma('estimada') }] }
  }).filter((p) => p.partes.some((x) => x.v))
  const ondeFoi = agrupar(regs, (s) => (onde === 'cliente' ? (s.cliente_id ? ts.nomeCliente(s.cliente_id) : 'interno') : onde === 'atividade' ? `${s.atividade_id ?? '—'} · ${rotuloAtividade(s.atividade_id)}` : rotuloOrigem(s)), duracaoMin, 8).map((x) => ({ nome: x.nome, h: Math.round(x.v / 60) }))
  const semanas = [...new Set(diasUteis(somarDias(inicioSemana(HOJE_TS), -21), HOJE_TS).map(inicioSemana))].map((sem) => {
    const ss = ts.sessoes.filter((s) => registrada(s) && setores.includes(s.setor_id) && doPacote(pacote)(s) && inicioSemana(diaDe(s.inicio)) === sem)
    const tot = ss.reduce((t, s) => t + duracaoMin(s), 0) || 1
    const pc = (c: SessaoTrabalho['confianca']) => (ss.filter((s) => s.confianca === c).reduce((t, s) => t + duracaoMin(s), 0) / tot) * 100
    return { rotulo: `sem ${ddmm(sem)}`, partes: [{ c: 'automatica' as const, v: pc('automatica') }, { c: 'confirmada' as const, v: pc('confirmada') }, { c: 'estimada' as const, v: pc('estimada') }], vazio: !ss.length }
  }).filter((s) => !s.vazio)
  const porAtividadeEst = agrupar(regs, (s) => s.atividade_id ?? '—', duracaoMin, 50)
    .map((x) => {
      const est = regs.filter((s) => (s.atividade_id ?? '—') === x.nome && s.confianca === 'estimada').reduce((t, s) => t + duracaoMin(s), 0)
      return { atividade: `${x.nome} · ${rotuloAtividade(x.nome)}`, pct: Math.round((est / x.v) * 100), n: regs.filter((s) => (s.atividade_id ?? '—') === x.nome).length }
    })
    .filter((x) => x.pct > 0)
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 5)
  const semExtensao = pessoas.filter((p) => !ts.vinculoDe(p.id)?.vinculada_em)
  const pausadas = pessoas.filter((p) => ts.vinculoDe(p.id)?.pausada_ate && ts.vinculoDe(p.id)!.pausada_ate! > agoraDemo())
  const fila = ts.equivalencias.filter((e) => e.situacao === 'sem_equivalente')
  const concluidasSemSessao = ts.tarefas.filter((t) => t.status === 'concluida' && setores.includes(t.setor_id) && !ts.sessoes.some((s) => s.tarefa_id === t.id)).length
  const diagnostico = [
    ...semExtensao.map((p) => ({ item: `${p.nome} sem a extensão vinculada`, impacto: 'alto' })),
    ...(fila.length ? [{ item: `${fila.length} tipos de tarefa do core sem equivalente`, impacto: 'alto' }] : []),
    ...(concluidasSemSessao ? [{ item: `${concluidasSemSessao} tarefas concluídas sem sessão (fez e só marcou)`, impacto: 'médio' }] : []),
    ...porAtividadeEst.filter((a) => a.pct > 50).map((a) => ({ item: `${a.atividade} com ${a.pct}% estimado`, impacto: 'médio' })),
    ...(pausadas.length ? [{ item: `${pausadas.length} ${pausadas.length === 1 ? 'pessoa com a extensão pausada agora' : 'pessoas com a extensão pausada agora'} (direito delas; só a contagem)`, impacto: 'baixo' }] : []),
  ]
  const porIntegrante = [...new Set(agentes.map((a) => `${a.ator_id}|${a.usuario_dono_id}`))].map((k) => {
    const [ator, dono] = k.split('|')
    const ss = agentes.filter((a) => a.ator_id === ator && a.usuario_dono_id === dono)
    const integ = ts.integrantes.find((i) => i.id === ator)
    return { ator, dono, setor: (integ?.setor ?? ss[0].setor_id) as never, maquina: ss.reduce((t, s) => t + (s.custo?.maquina_seg ?? 0), 0) / 60, centavos: ss.reduce((t, s) => t + (s.custo?.centavos ?? 0), 0), passos: ss.reduce((t, s) => t + (s.custo?.passos ?? 0), 0), poupadas: ss.reduce((t, s) => t + (s.custo?.poupadas_min ?? 0), 0), aprovacao: 78 + ((ator.length * 7 + dono.length * 3) % 15) }
  })
  const fora = pessoas.map((p) => {
    const ss = regs.filter((s) => s.usuario_dono_id === p.id && s.fora_da_jornada)
    return { nome: p.nome, min: ss.reduce((t, s) => t + duracaoMin(s), 0), n: ss.length }
  })
  const agentesFora = agentes.filter((a) => {
    const h = hm(a.inicio)
    return h < ts.cfg.jornada_inicio || h > ts.cfg.jornada_fim
  })
  const carga = cargaPrevista(ts, setores)
  const dispProx = pessoas.length * 10 * HORAS_DIA - pessoas.reduce((t, p) => t + diasAusente(ts.ausencias, p.id, somarDias(HOJE_TS, 1), somarDias(HOJE_TS, 14)) * HORAS_DIA, 0)
  const ausenciasVisiveis = ts.ausencias.filter((a) => !a.arquivado_em && pessoas.some((p) => p.id === a.usuario_id) && a.fim >= somarDias(HOJE_TS, -30))
  const origens = ['tarefa aberta', 'conversa no CRM', 'tela do cliente', 'core', 'extensão', 'artefato', 'confirmação', 'lançamento manual']
  const temBpo = ts.temBpo && setores.includes('bpo_financeiro')

  return (
    <AreaRolagem className="h-full px-4 pb-10 sm:px-5 md:pb-24">
      <div className="pagina flex flex-col gap-4 pt-1">
        <CabecalhoTs titulo="Equipe" sub={`${periodo === 'semana' ? 'Esta semana' : periodo === 'mes' ? rotuloCompetencia(competenciaDe(HOJE_TS)) : rotuloCompetencia(somarMeses(competenciaDe(HOJE_TS), -1))} · ${admin ? 'todos os setores' : 'os setores que você gere'}${clienteNome ? ` · só ${clienteNome}` : ''}`} papel={papel}>
          {chip}
        </CabecalhoTs>
        <div className="flex flex-wrap items-center gap-2" data-testid="ts-filtros-equipe">
          <span className="w-44">
            <CampoEscolha rotulo="Setor" valor={setor} onMudar={setSetor} opcoes={[{ valor: 'todos', rotulo: admin ? 'Todos os setores' : 'Todos os meus setores' }, ...meusSetores.map((s) => ({ valor: s, rotulo: nomeSetor(s) }))]} />
          </span>
          <Segmentado
            rotulo="Período"
            valor={periodo}
            onMudar={setPeriodo}
            opcoes={[
              { valor: 'semana', rotulo: 'Semana' },
              { valor: 'mes', rotulo: 'Mês' },
              { valor: 'anterior', rotulo: 'Mês anterior' },
            ]}
          />
          <span className="w-44">
            <CampoEscolha rotulo="Pessoa" valor={pessoa} onMudar={setPessoa} opcoes={[{ valor: 'todas', rotulo: 'Todas as pessoas' }, ...pessoas.map((p) => ({ valor: p.id, rotulo: p.nome }))]} />
          </span>
          <span className="w-40">
            <CampoEscolha rotulo="Confiança" valor={confianca} onMudar={setConfianca} opcoes={[{ valor: 'todas', rotulo: 'Toda confiança' }, ...(['automatica', 'confirmada', 'estimada', 'contestada'] as const).map((c) => ({ valor: c, rotulo: rotuloConfianca[c] }))]} />
          </span>
          <span className="w-36">
            <CampoEscolha rotulo="Origem" valor={origem} onMudar={setOrigem} opcoes={[{ valor: 'todas', rotulo: 'Toda origem' }, ...origens.map((o) => ({ valor: o, rotulo: o }))]} />
          </span>
          {temBpo && (
            <>
              <span className="w-44">
                <CampoEscolha rotulo="Contratante" valor={contratante} onMudar={setContratante} opcoes={[{ valor: 'todos', rotulo: 'Todo contratante' }, { valor: 'escritorio', rotulo: 'O próprio escritório' }, ...subinquilinos.map((s) => ({ valor: s.id, rotulo: s.nome }))]} />
              </span>
              <span className="w-44">
                <CampoEscolha
                  rotulo="Frente"
                  valor={frente}
                  onMudar={setFrente}
                  opcoes={[
                    { valor: 'todas', rotulo: 'Toda frente' },
                    { valor: 'financeira', rotulo: 'BPO financeiro' },
                    { valor: 'entre_escritorios', rotulo: 'Entre escritórios' },
                  ]}
                />
              </span>
            </>
          )}
        </div>

        <Caixa>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <Numero valor={fmtHoras(minTotal)} rotulo="registradas" />
            <Numero valor={minTotal + semMin ? `${Math.round((minAuto / (minTotal + semMin)) * 100)}%` : '—'} rotulo="cobertura automática" detalhe={`meta do escritório: ${ts.cfg.meta_cobertura}%`} />
            <Numero valor={itensPeriodo.length ? `${Math.round((confirmados / itensPeriodo.length) * 100)}%` : '—'} rotulo="itens confirmados" />
            <Numero valor={minTotal + semMin ? `${Math.round((semMin / (minTotal + semMin)) * 100)}%` : '—'} rotulo="sem classificação" />
            <Numero valor={disponivel ? `${Math.round((minTotal / 60 / disponivel) * 100)}%` : '—'} rotulo="da capacidade" detalhe={`${Math.round(minTotal / 60)} de ${disponivel} h · agentes ${fmtH(agentes.reduce((t, a) => t + (a.custo?.maquina_seg ?? 0), 0) / 60)} de máquina`} />
          </div>
        </Caixa>

        {!regs.length && <EstadoVazio compacto titulo="Nenhuma hora neste filtro" descricao="Troque o período, o setor ou limpe os filtros." />}

        <div className="grid gap-4 xl:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-4">
            <Caixa>
              <Pergunta>Quanto cada pessoa registrou, e quanto foi automático?</Pergunta>
              <LinhasEmpilhadas dados={porPessoa} onClicar={(n) => setVendoPessoa(porPessoa.find((p) => p.rotulo === n)?.id ?? null)} />
              <Legenda itens={['automatica', 'confirmada', 'estimada']} />
              <p className="text-muted-foreground text-xs">Clique no nome para abrir a pessoa. Horas não são produtividade: não existe ranking.</p>
            </Caixa>
            <Caixa>
              <Pergunta acao={<span className="text-muted-foreground text-xs">S06b</span>}>Quanto foi lançado à mão?</Pergunta>
              {manualPorPessoa.length ? (
                <ul className="flex flex-col gap-2 text-sm" data-testid="ts-manual-equipe">
                  {manualPorPessoa.map((p) => (
                    <li key={p.nome} className="grid grid-cols-[6rem_1fr_6rem] items-center gap-3 sm:grid-cols-[7.5rem_1fr_7rem]">
                      <span className="truncate">{p.nome}</span>
                      <span className="bg-sunken flex h-3 overflow-hidden rounded-full" title={`${p.pct}% manual`}>
                        <span className="h-full" style={{ width: `${100 - p.pct}%`, background: 'color-mix(in oklab, var(--foreground) 70%, transparent)' }} />
                        <span className="bg-warning h-full" style={{ width: `${p.pct}%` }} />
                      </span>
                      <span className="text-right text-xs tabular-nums">
                        <span className={cn('font-medium', p.pct > 30 && 'text-warning')}>{p.pct}%</span> <span className="text-muted-foreground">· {fmtHoras(p.manual)}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm">Ninguém lançou tempo à mão neste período.</p>
              )}
              <p className="text-muted-foreground text-xs">
                Manual × automático das horas registradas: {minTotal ? Math.round((minManual / minTotal) * 100) : 0}% lançado à mão no período. Muito manual costuma ser captura fraca (extensão desligada, tarefa não aberta), não falta da pessoa.
              </p>
            </Caixa>
            <Caixa>
              <Pergunta>A captura está melhorando? (% das horas por semana)</Pergunta>
              {semanas.length ? <ColunasEmpilhadas unidade="%" altura={120} dados={semanas} /> : <p className="text-muted-foreground text-sm">Sem semanas com dados.</p>}
              <Legenda itens={['automatica', 'confirmada', 'estimada']} />
            </Caixa>
            <Caixa>
              <Pergunta>Por que a cobertura não é maior?</Pergunta>
              {diagnostico.length ? (
                <ul className="flex flex-col gap-2 text-sm">
                  {diagnostico.map((d) => (
                    <li key={d.item} className="flex items-start gap-2">
                      <WarningIcon weight={d.impacto === 'alto' ? 'fill' : 'regular'} className="text-warning mt-0.5 size-4 shrink-0" />
                      <span className="min-w-0 flex-1">{d.item}</span>
                      <span className="text-muted-foreground shrink-0 text-xs">{d.impacto}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm">Nada a apontar neste filtro.</p>
              )}
              <p className="text-muted-foreground text-xs">É diagnóstico da captura, não falta das pessoas.</p>
            </Caixa>
            <Caixa>
              <Pergunta
                acao={
                  <Button size="sm" variant="ghost" className="rounded-full" onClick={() => nav.irPara({ modulo: 'painel', aba: 'gestao' })}>
                    <ArrowSquareOutIcon /> Catálogo local
                  </Button>
                }
              >
                Que tarefas do core não entram? (sem equivalente)
              </Pergunta>
              <ul className="divide-border -mx-2 flex flex-col divide-y" data-testid="ts-fila">
                {ts.equivalencias
                  .filter((e) => e.sugestoes.length)
                  .map((f) => (
                    <li key={f.id} className="flex flex-col gap-1.5 px-2 py-2.5">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="min-w-0 flex-1 truncate">
                          “{f.core_tipo_tarefa}” <span className="text-muted-foreground">· {f.departamento} · {f.core_sistema}</span>
                        </span>
                        <span className="text-muted-foreground text-xs tabular-nums">{f.ocorrencias}× no mês</span>
                      </div>
                      {f.situacao !== 'sem_equivalente' ? (
                        <Badge variant="sucesso">
                          <CheckIcon /> {f.situacao === 'nao_medido' ? 'não é trabalho medido' : `${f.atividade_id} · ${rotuloAtividade(f.atividade_id)}`} · vale 90 dias para trás
                        </Badge>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {f.sugestoes.map((s, k) => (
                            <Button key={s} size="sm" variant={k === 0 ? 'secondary' : 'ghost'} className="h-7 rounded-full px-2.5 text-xs" onClick={() => executar(() => repos.equivalencias.atualizar(f.id, { atividade_id: s.split(' ·')[0], situacao: 'equivalente' }, { texto: `“${f.core_tipo_tarefa}” passou a equivaler a ${s}` }), { sucesso: `“${f.core_tipo_tarefa}” = ${s.split(' ·')[0]}` })}>
                              é {s.split(' ·')[0]}
                            </Button>
                          ))}
                          <Button size="sm" variant="ghost" className="text-muted-foreground h-7 rounded-full px-2.5 text-xs" onClick={() => executar(() => repos.equivalencias.atualizar(f.id, { situacao: 'nao_medido' }), { sucesso: 'Marcado como não medido' })}>
                            não é trabalho medido
                          </Button>
                        </div>
                      )}
                    </li>
                  ))}
                {!ts.equivalencias.length && <li className="text-muted-foreground px-2 py-3 text-sm">Nenhum core conectado ainda.</li>}
              </ul>
            </Caixa>
            <Caixa>
              <Pergunta>Que atividades a captura não enxerga?</Pergunta>
              {porAtividadeEst.length ? (
                <ul className="flex flex-col gap-2 text-sm">
                  {porAtividadeEst.map((a) => (
                    <li key={a.atividade} className="grid grid-cols-[1fr_5rem_3rem] items-center gap-3 sm:grid-cols-[1fr_6rem_3rem]">
                      <span className="truncate">{a.atividade}</span>
                      <span className="bg-sunken h-2 rounded-full">
                        <span className="block h-full rounded-full" style={{ width: `${a.pct}%`, background: 'color-mix(in oklab, var(--foreground) 45%, transparent)' }} />
                      </span>
                      <span className="text-right text-xs tabular-nums">{a.pct}%</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm">Nenhuma atividade com horas estimadas neste filtro.</p>
              )}
              <p className="text-muted-foreground text-xs">% de horas estimadas por atividade.</p>
            </Caixa>
            <Caixa>
              <Pergunta>O que os integrantes fizeram, custaram e pouparam?</Pergunta>
              <AreaRolagem eixo="x" className="-mx-1 px-1">
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="text-muted-foreground text-left text-xs">
                      <th className="pb-1.5 font-medium">Integrante</th>
                      <th className="pb-1.5 font-medium">Dono</th>
                      <th className="pb-1.5 text-right font-medium">Máquina</th>
                      <th className="pb-1.5 text-right font-medium">Custo</th>
                      <th className="pb-1.5 text-right font-medium">Passos</th>
                      <th className="pb-1.5 text-right font-medium">Poupadas (estim.)</th>
                      <th className="pb-1.5 text-right font-medium">Aprovação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-border divide-y">
                    {porIntegrante.map((a) => {
                      const t = aparencia({ setor: a.setor })
                      return (
                        <tr key={`${a.ator}-${a.dono}`}>
                          <td className="py-2 pr-2">
                            <span className="flex items-center gap-2">
                              <Orb cor={t.cor} corOlhos={t.corOlhos} tamanho={20} cutucavel={false} extras={false} /> {t.nome}
                            </span>
                          </td>
                          <td className="text-muted-foreground py-2 pr-2">{ts.nomeUsuario(a.dono)}</td>
                          <td className="py-2 pr-2 text-right tabular-nums">{fmtH(a.maquina)}</td>
                          <td className="py-2 pr-2 text-right tabular-nums">{(a.centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                          <td className="py-2 pr-2 text-right tabular-nums">{a.passos.toLocaleString('pt-BR')}</td>
                          <td className="py-2 pr-2 text-right tabular-nums">{fmtHoras(a.poupadas)}</td>
                          <td className="py-2 text-right tabular-nums">{a.aprovacao}%</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                {!porIntegrante.length && <p className="text-muted-foreground py-3 text-sm">Nenhum trabalho de integrante neste filtro.</p>}
              </AreaRolagem>
              <p className="text-muted-foreground text-xs">Série separada: nunca soma com as horas humanas. Aprovação = cartões aprovados sem edição.</p>
            </Caixa>
          </div>
          <div className="flex min-w-0 flex-col gap-4">
            <Caixa>
              <Pergunta
                acao={
                  <Segmentado
                    rotulo="Agrupar por"
                    valor={onde}
                    onMudar={setOnde}
                    opcoes={[
                      { valor: 'cliente', rotulo: 'cliente' },
                      { valor: 'atividade', rotulo: 'atividade' },
                      { valor: 'origem', rotulo: 'origem' },
                    ]}
                  />
                }
              >
                Onde o tempo do setor foi?
              </Pergunta>
              <Barras dados={ondeFoi} destacar={onde === 'cliente' ? clienteNome : undefined} />
            </Caixa>
            <Caixa>
              <Pergunta
                acao={
                  <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setRegistrando(true)}>
                    <PlusIcon /> Ausência
                  </Button>
                }
              >
                Quem está acima ou abaixo da capacidade?
              </Pergunta>
              <Capacidade dados={capacidade.filter((c) => c.disponivel || c.usadas)} />
              <p className="text-muted-foreground text-xs">
                Faixa verde: 85 a 100%. Disponível = dias úteis do período × {HORAS_DIA} h − ausências. Previsão das próximas 2 semanas pelas tarefas abertas ({carga.tarefas}): {dispProx > 0 ? Math.round((carga.horas / dispProx) * 100) : 0}%.
              </p>
              {ausenciasVisiveis.length > 0 && (
                <ul className="flex flex-col gap-1 border-t pt-2 text-sm" data-testid="ts-ausencias">
                  {ausenciasVisiveis.map((a) => (
                    <li key={a.id} className="flex items-center gap-2">
                      <span className="min-w-0 flex-1 truncate">
                        {ts.nomeUsuario(a.usuario_id)} · {rotuloAusencia(a.tipo)} · {ddmm(a.inicio)} a {ddmm(a.fim)}
                        {a.substituto_id && <span className="text-muted-foreground"> · substituto: {ts.nomeUsuario(a.substituto_id)}</span>}
                      </span>
                      {a.extras?.origem === 's04' ? (
                        <span className="text-muted-foreground text-xs">pela Gestão</span>
                      ) : (
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        className="rounded-full"
                        aria-label={`Cancelar a ausência de ${ts.nomeUsuario(a.usuario_id)}`}
                        onClick={async () => {
                          const r = await confirmar({ titulo: 'Cancelar a ausência?', descricao: 'Ela sai da capacidade e fica no histórico como cancelada.', acao: 'Cancelar ausência', perigo: true })
                          if (r) executar(() => repos.ausencias.arquivar(a.id, { motivo: 'cancelada' }), { sucesso: 'Ausência cancelada', desfazer: () => repos.ausencias.desarquivar(a.id) })
                        }}
                      >
                        <XIcon />
                      </Button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Caixa>
            <Caixa>
              <Pergunta acao={<Badge variant={aDecidir.length ? 'destaque' : 'sucesso'}>{aDecidir.length} a decidir</Badge>}>Contestações</Pergunta>
              <ul className="divide-border -mx-2 flex flex-col divide-y" data-testid="ts-contestacoes">
                {contestacoes.map((s) => {
                  const c = s.contestacao!
                  return (
                    <li key={s.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-2 py-2.5">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm">
                          {ts.nomeUsuario(s.usuario_dono_id)} · {rotuloMotivoContestacao(c.motivo)} → {c.correcao}
                        </span>
                        <span className="text-muted-foreground block truncate text-xs">
                          {rotuloDia(diaDe(s.inicio))} · {hm(s.inicio)}–{hm(s.fim)} · {s.atividade_id} · {ts.nomeCliente(s.cliente_id)}
                        </span>
                      </span>
                      {c.status !== 'pendente' ? (
                        <Badge variant={c.status === 'aceita' ? 'sucesso' : 'outline'}>{c.status === 'aceita' ? 'aceita' : `recusada: ${c.motivo_recusa}`}</Badge>
                      ) : (
                        <Button size="sm" variant="outline" className="rounded-full" onClick={() => setDecidindo(s)}>
                          Decidir
                        </Button>
                      )}
                    </li>
                  )
                })}
                {!contestacoes.length && <li className="text-muted-foreground px-2 py-3 text-sm">Nenhuma contestação nos setores que você gere.</li>}
              </ul>
            </Caixa>
            <Caixa>
              <Pergunta acao={<Badge variant={anomalas.some((s) => !s.anomalia?.revisada_em) ? 'destaque' : 'outline'}>{anomalas.filter((s) => !s.anomalia?.revisada_em).length} a revisar</Badge>}>Sessões anômalas</Pergunta>
              <ul className="divide-border -mx-2 flex flex-col divide-y" data-testid="ts-anomalas">
                {anomalas.map((s) => (
                  <li key={s.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-2 py-2.5">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm">
                        {ts.nomeUsuario(s.usuario_dono_id)} · {s.anomalia!.texto}
                      </span>
                      <span className="text-muted-foreground block truncate text-xs">
                        {rotuloDia(diaDe(s.inicio))} · {hm(s.inicio)}–{hm(s.fim)} · {s.atividade_id} {s.rotulo}
                      </span>
                    </span>
                    {s.anomalia!.revisada_em ? (
                      <Badge variant="outline">{s.anomalia!.revisao === 'corrigida' ? 'correção pedida' : s.anomalia!.revisao}</Badge>
                    ) : (
                      <Button size="sm" variant="outline" className="rounded-full" onClick={() => setRevisando(s)}>
                        Revisar
                      </Button>
                    )}
                  </li>
                ))}
                {!anomalas.length && <li className="text-muted-foreground px-2 py-3 text-sm">Nenhuma sessão longa, sobreposta ou sem evento.</li>}
              </ul>
              <p className="text-muted-foreground text-xs">Detecção diária, sem modelo: longa demais, sobreposta a outro cliente, aberta sem evento (05, 11.3).</p>
            </Caixa>
            <Caixa>
              <Pergunta
                acao={
                  admin ? (
                    <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setConectando(null)}>
                      <PlugsConnectedIcon /> Conectar
                    </Button>
                  ) : undefined
                }
              >
                Sistemas contábeis conectados
              </Pergunta>
              <ul className="flex flex-col gap-2.5" data-testid="ts-conectores">
                {ts.conectores.map((c) => (
                  <li key={c.id} className="flex flex-wrap items-start gap-3 text-sm">
                    <span className={cn('mt-1.5 size-2 shrink-0 rounded-full', c.status === 'conectado' ? 'bg-success' : c.status === 'importacao' ? 'bg-warning' : c.status === 'erro' ? 'bg-destructive' : 'bg-sunken ring-border ring-1')} />
                    <span className="min-w-0 flex-1">
                      <span className="block">
                        {c.core} <span className="text-muted-foreground">· {c.modo}</span>
                      </span>
                      <span className="text-muted-foreground block text-xs">{c.status === 'nao_conectado' ? 'não conectado' : c.detalhe}</span>
                    </span>
                    {c.status === 'conectado' ? (
                      <span className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="rounded-full"
                          disabled={lendo === c.id}
                          onClick={async () => {
                            setLendo(c.id)
                            try {
                              const r = await servicos.cores.lerAgora(c.core)
                              executar(() => repos.conectoresCore.atualizar(c.id, { ultima_leitura: agoraDemo(), detalhe: `leitura a cada 15 min · última agora · ${r.dados.novas} tarefas novas` }, { ferramenta: 'core.conectar' }), { sucesso: `${c.core}: ${r.dados.novas} tarefas novas lidas` })
                            } catch (e) {
                              executar(() => {
                                throw e
                              })
                            } finally {
                              setLendo(null)
                            }
                          }}
                        >
                          {lendo === c.id ? <SpinnerIcon className="animate-spin" /> : null} Ler agora
                        </Button>
                        {admin && (
                          <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setMapas(c)}>
                            Equivalências
                          </Button>
                        )}
                      </span>
                    ) : admin ? (
                      <Button size="sm" variant="outline" className="rounded-full" onClick={() => setConectando(c.core)}>
                        {c.status === 'importacao' ? 'Importar' : 'Conectar'}
                      </Button>
                    ) : null}
                  </li>
                ))}
                {!ts.conectores.length && <li className="text-muted-foreground text-sm">Nenhum sistema contábil conectado. {admin ? 'Conecte o Alterdata por token ou importe o relatório do Domínio, Questor ou Contmatic.' : 'O Administrador conecta.'}</li>}
              </ul>
              {ts.conectores.length > 0 && <SeloDemonstracao fonte="leituras do core" />}
            </Caixa>
            <Caixa>
              <Pergunta>O padrão do catálogo está certo?</Pergunta>
              {ts.duracoes.length ? (
                <AreaRolagem eixo="x" className="-mx-1 px-1">
                  <table className="w-full min-w-[420px] text-sm">
                    <thead>
                      <tr className="text-muted-foreground text-left text-xs">
                        <th className="pb-1.5 font-medium">Atividade</th>
                        <th className="pb-1.5 text-right font-medium">Catálogo</th>
                        <th className="pb-1.5 text-right font-medium">Medido</th>
                        <th className="pb-1.5 text-right font-medium">n</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody className="divide-border divide-y" data-testid="ts-calibracao">
                      {ts.duracoes.map((c) => (
                        <tr key={c.id}>
                          <td className="py-2 pr-2">
                            {c.atividade_id} · {c.rotulo}
                          </td>
                          <td className="py-2 pr-2 text-right tabular-nums">{c.catalogo_min} min</td>
                          <td className={cn('py-2 pr-2 text-right tabular-nums', Math.abs(c.mediana_min - c.catalogo_min) / c.catalogo_min > 0.3 && 'font-medium')}>{c.mediana_min} min</td>
                          <td className="text-muted-foreground py-2 pr-2 text-right tabular-nums">{c.n}</td>
                          <td className="py-2 text-right">
                            {c.adotada_min ? (
                              <Badge variant="sucesso">{c.adotada_min} min adotados</Badge>
                            ) : admin ? (
                              <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setCalibrando(c)}>
                                Adotar
                              </Button>
                            ) : (
                              <span className="text-muted-foreground text-xs">o Administrador adota</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </AreaRolagem>
              ) : (
                <p className="text-muted-foreground text-sm">A calibração aparece com 20 ou mais sessões medidas por atividade (05, 11.2).</p>
              )}
            </Caixa>
            <Caixa>
              <Pergunta>Houve trabalho fora da jornada?</Pergunta>
              <ul className="flex flex-col gap-1.5 text-sm" data-testid="ts-fora-jornada">
                {fora.map((f) => (
                  <li key={f.nome} className="flex justify-between gap-3">
                    <span>{f.nome}</span>
                    <span className="text-muted-foreground tabular-nums">{f.min ? `${fmtHoras(f.min)} em ${f.n} ${f.n === 1 ? 'vez' : 'vezes'}` : '—'}</span>
                  </li>
                ))}
              </ul>
              <div className="border-t pt-2 text-sm">
                <span className="text-muted-foreground block text-xs">Integrantes fora do horário do escritório</span>
                <span className="flex justify-between gap-3">
                  <span>{agentesFora.length} trabalhos</span>
                  <span className="text-muted-foreground tabular-nums">{fmtH(agentesFora.reduce((t, a) => t + (a.custo?.maquina_seg ?? 0), 0) / 60)} de máquina</span>
                </span>
              </div>
              <p className="text-muted-foreground text-xs">Agregado do período, para tratar a política (GES-053), não a pessoa. Não substitui o ponto.</p>
            </Caixa>
          </div>
        </div>
      </div>

      {decidindo && <DecidirContestacao s={decidindo} onFechar={() => setDecidindo(null)} />}
      {revisando && <RevisarAnomalia s={revisando} onFechar={() => setRevisando(null)} />}
      {registrando && <RegistrarAusencia pessoas={pessoas.map((p) => ({ id: p.id, nome: p.nome }))} onFechar={() => setRegistrando(false)} />}
      {calibrando && <AdotarCalibracao linha={calibrando} onFechar={() => setCalibrando(null)} />}
      {conectando !== undefined && <ConectarCore inicial={conectando ?? undefined} onFechar={() => setConectando(undefined)} />}
      {mapas && <MapasCore conector={mapas} onFechar={() => setMapas(null)} />}
      {vendoPessoa && <PessoaDetalhe ts={ts} usuarioId={vendoPessoa} setores={setores} de={de} ate={ate} onFechar={() => setVendoPessoa(null)} />}
    </AreaRolagem>
  )
}

/** Abrir a pessoa (Gestor): as horas dela no período, por dia, só nos setores que você gere. Sem contestações nem itens. */
function PessoaDetalhe({ ts, usuarioId, setores, de, ate, onFechar }: { ts: Ts; usuarioId: string; setores: string[]; de: string; ate: string; onFechar: () => void }) {
  const ss = ts.sessoes.filter((s) => registrada(s) && s.usuario_dono_id === usuarioId && setores.includes(s.setor_id) && diaDe(s.inicio) >= de && diaDe(s.inicio) <= ate)
  const dias = [...new Set(ss.map((s) => diaDe(s.inicio)))].sort().reverse()
  return (
    <GavetaFormulario aberta largura="lg" onFechar={onFechar} titulo={ts.nomeUsuario(usuarioId)} descricao={`${fmtHoras(ss.reduce((t, s) => t + duracaoMin(s), 0))} de ${ddmm(de)} a ${ddmm(ate)} · só os setores que você gere`} acao="Fechar" onAcao={onFechar}>
      <ul className="flex flex-col gap-3">
        {dias.map((d) => {
          const doDia = ss.filter((s) => diaDe(s.inicio) === d)
          return (
            <li key={d} className="flex flex-col gap-1">
              <span className="text-sm font-medium">
                {rotuloDia(d)} · {fmtH(doDia.reduce((t, s) => t + duracaoMin(s), 0))}
              </span>
              {doDia.map((s) => (
                <span key={s.id} className="text-muted-foreground flex items-center gap-2 text-xs">
                  <Amostra c={s.confianca} /> {hm(s.inicio)}–{hm(s.fim)} · {s.atividade_id} {s.rotulo} · {ts.nomeCliente(s.cliente_id)}
                  {s.fora_da_jornada && ' · fora da jornada'}
                </span>
              ))}
            </li>
          )
        })}
        {!dias.length && <li className="text-muted-foreground text-sm">Nenhuma hora neste período.</li>}
      </ul>
    </GavetaFormulario>
  )
}

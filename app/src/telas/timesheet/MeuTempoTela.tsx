import { CaretLeftIcon, CaretRightIcon, ChatCircleIcon, GlobeIcon, PauseIcon, PlayIcon, PuzzlePieceIcon, ShieldCheckIcon, TagIcon, TimerIcon } from '@phosphor-icons/react'
import { useMemo, useState } from 'react'
import { useNavegacao } from '@/ambiente/loja'
import { useAcao } from '@/components/kit'
import { AreaRolagem } from '@/components/ui/area-rolagem'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Segmentado } from '@/components/ui/formulario'
import { Orb } from '@/components/ui/orb'
import { limitesIa } from '@/dados/timesheet'
import { rotuloAtividade } from '@/dados/timesheet-catalogo'
import { agoraDemo, competenciaDe, diaDe, duracaoMin, fmtH, fmtHoras, HOJE_TS, hm, rotuloCompetencia, rotuloDia, somarDias, somarMeses } from '@/dados/timesheet-tempo'
import { useAparencia } from '@/hooks/useAparencia'
import { repos, rotuloMotivoContestacao } from '@/nucleo/repositorios'
import { cn } from '@/lib/utils'
import { DetalheLinha } from './acoes'
import { Cronometro, LancarTempo, SemanaManual, type ContextoLancamento } from './lancamento'
import type { SessaoTrabalho } from '@/nucleo/modelo/entidades'
import { Caixa, CabecalhoTs, Faixa, Numero, TimesheetVazio, usePacote } from './comum'
import { PausarExtensao, Dominios, religarExtensao, TermoCiencia, VincularExtensao } from './configuracao'
import { agrupar, confiancaDaLinha, doPacote, linhaDoDia, registrada, resumoDe, rotuloConfianca, rotuloOrigem, semanaDe, useTimesheet, type LinhaDia, type PapelTs } from './dados'
import { Amostra, Barras, ColunasEmpilhadas, Legenda, LinhaDoDia, Pergunta } from './graficos'

function rotuloPeriodo(vista: 'dia' | 'semana' | 'mes', desvio: number) {
  if (vista === 'dia') return rotuloDia(somarDias(HOJE_TS, desvio))
  if (vista === 'semana') {
    const dias = semanaDe(somarDias(HOJE_TS, desvio * 7))
    return `${rotuloDia(dias[0]).split(' ')[1]} a ${rotuloDia(dias[4]).split(' ')[1]}`
  }
  return rotuloCompetencia(somarMeses(competenciaDe(HOJE_TS), desvio)).split('/')[0]
}

/**
 * Timesheet › Meu tempo (05, 8.2): o próprio tempo, primeiro. Dia com a linha
 * por confiança e a lista (confirmar, corrigir, classificar, contestar); semana
 * e mês em gráficos; o agente em série separada; a extensão e as contestações
 * ao lado. Nunca mostra custo, margem, tokens nem colegas.
 */
export function MeuTempoTela({ papel, clienteNome, clienteId }: { papel: PapelTs; clienteNome?: string; clienteId?: string | null }) {
  const ts = useTimesheet()
  const aparencia = useAparencia()
  const nav = useNavegacao()
  const executar = useAcao()
  const [vista, setVista] = useState<'dia' | 'semana' | 'mes'>('dia')
  const [desvio, setDesvio] = useState(0)
  const [aberta, setAberta] = useState<LinhaDia | null>(null)
  const [modal, setModal] = useState<'vincular' | 'pausar' | 'dominios' | 'termo' | null>(null)
  const [filtroMes, setFiltroMes] = useState<string | null>(null)
  // S06b: lançamento manual (novo, com o contexto) e edição (cria versão).
  const [lancar, setLancar] = useState<ContextoLancamento | null>(null)
  const [editando, setEditando] = useState<SessaoTrabalho | null>(null)
  const abrir = (l: LinhaDia) => (l.tipo === 'sessao' && l.s.origem === 'manual' ? setEditando(l.s) : setAberta(l))
  const { pacote, chip } = usePacote()
  const u = ts.usuario.id
  const vinculo = ts.vinculoDe(u)
  const termo = !!vinculo?.termo_aceito_em
  const vinculada = !!vinculo?.vinculada_em
  const pausada = vinculo?.pausada_ate && vinculo.pausada_ate > agoraDemo() ? vinculo.pausa_rotulo : null
  const dia = somarDias(HOJE_TS, vista === 'dia' ? desvio : 0)
  const filtroCli = (l: LinhaDia) => !clienteId || (l.tipo === 'sessao' ? l.s.cliente_id === clienteId : l.tipo === 'item' ? l.i.sugestao?.cliente_id === clienteId || l.i.alternativa_cliente_id === clienteId : false)
  const filtroPac = (l: LinhaDia) => pacote === 'todos' || (l.tipo === 'sessao' ? doPacote(pacote)(l.s) : pacote === 'contabil')

  const linhas = useMemo(() => linhaDoDia(ts.sessoes, ts.itens, u, dia, ts.cfg).filter(filtroPac), [ts, u, dia, pacote]) // eslint-disable-line react-hooks/exhaustive-deps
  const visiveis = linhas.filter(filtroCli)
  const resumo = resumoDe(visiveis)
  const agente = ts.sessoes.filter((s) => s.ator_tipo === 'integrante' && s.usuario_dono_id === u && diaDe(s.inicio) === dia && doPacote(pacote)(s))
  const semana = semanaDe(somarDias(HOJE_TS, vista === 'semana' ? desvio * 7 : 0)).map((d) => ({ d, r: resumoDe(linhaDoDia(ts.sessoes, ts.itens, u, d, ts.cfg).filter(filtroPac).filter(filtroCli)) }))
  const comp = somarMeses(competenciaDe(HOJE_TS), vista === 'mes' ? desvio : 0)
  const doMes = ts.sessoes.filter((s) => registrada(s) && s.usuario_dono_id === u && competenciaDe(diaDe(s.inicio)) === comp && doPacote(pacote)(s) && (!clienteId || s.cliente_id === clienteId))
  const porCliente = agrupar(doMes, (s) => (s.cliente_id ? ts.nomeCliente(s.cliente_id) : 'interno'), duracaoMin).map((x) => ({ nome: x.nome, h: Math.round((x.v / 60) * 10) / 10 }))
  const porAtividade = agrupar(doMes, (s) => `${s.atividade_id ?? '—'} · ${rotuloAtividade(s.atividade_id)}`, duracaoMin).map((x) => ({ nome: x.nome, h: Math.round((x.v / 60) * 10) / 10 }))
  const extrasMes = doMes.filter((s) => ts.ehExtra(s))
  const contestacoes = ts.sessoes.filter((s) => s.usuario_dono_id === u && s.contestacao).sort((a, b) => (b.contestacao!.em ?? '').localeCompare(a.contestacao!.em ?? ''))
  const pulsos = ts.pulsos.filter((p) => p.usuario_id === u && p.dia === dia)
  const maquina = agente.reduce((t, s) => t + (s.custo?.maquina_seg ?? 0), 0) / 60
  const poupadas = agente.reduce((t, s) => t + (s.custo?.poupadas_min ?? 0), 0)
  const itensDoMes = filtroMes ? doMes.filter((s) => (s.cliente_id ? ts.nomeCliente(s.cliente_id) : 'interno') === filtroMes || `${s.atividade_id ?? '—'} · ${rotuloAtividade(s.atividade_id)}` === filtroMes) : []

  if (ts.vazio) return <TimesheetVazio />

  const rotuloLinha = (l: LinhaDia) => (l.tipo === 'sessao' ? `${l.s.atividade_id ? `${l.s.atividade_id} ` : ''}${l.s.rotulo}${l.s.cliente_id ? ` · ${ts.nomeCliente(l.s.cliente_id)}` : l.s.ator_tipo === 'pessoa' && !l.s.cliente_id ? ' · interno' : ''}` : l.tipo === 'item' ? `${l.i.texto}${l.i.sugestao?.cliente_id ? ` · ${ts.nomeCliente(l.i.sugestao.cliente_id)}?` : ''}` : 'sem classificação')

  return (
    <AreaRolagem className="h-full px-4 pb-10 sm:px-5 md:pb-24">
      <div className="pagina flex flex-col gap-4 pt-1">
        <CabecalhoTs titulo="Meu tempo" sub={clienteNome ? `Só ${clienteNome} · troque o cliente no topo para ver tudo` : `${ts.usuario.nome} · o que o sistema registrou; você confirma ou contesta`} papel={papel}>
          {chip}
          <Segmentado
            rotulo="Período"
            valor={vista}
            onMudar={(v) => (setVista(v), setDesvio(0), setFiltroMes(null))}
            opcoes={[
              { valor: 'dia', rotulo: 'Dia' },
              { valor: 'semana', rotulo: 'Semana' },
              { valor: 'mes', rotulo: 'Mês' },
            ]}
          />
          <Button size="sm" className="rounded-full" onClick={() => setLancar({ cliente_id: clienteId ?? undefined, dia: vista === 'dia' ? dia : HOJE_TS })}>
            <TimerIcon /> Lançar tempo
          </Button>
          <div className="flex items-center gap-1 text-sm">
            <Button size="icon-sm" variant="ghost" className="rounded-full" aria-label="Período anterior" onClick={() => setDesvio((d) => d - 1)}>
              <CaretLeftIcon />
            </Button>
            <span className="min-w-24 text-center" data-testid="ts-periodo">
              {rotuloPeriodo(vista, desvio)}
            </span>
            <Button size="icon-sm" variant="ghost" className="rounded-full" aria-label="Próximo período" disabled={desvio >= 0} onClick={() => setDesvio((d) => d + 1)}>
              <CaretRightIcon />
            </Button>
          </div>
        </CabecalhoTs>

        {!termo && (
          <Faixa
            icone={<ShieldCheckIcon className="text-warning size-5 shrink-0" />}
            acao={
              <Button size="sm" className="rounded-full" onClick={() => setModal('termo')}>
                Ler e aceitar
              </Button>
            }
          >
            <strong className="font-medium">Antes de começar:</strong> veja como o seu tempo é registrado. Sem o aceite, a extensão fica parada e os arquivos da nuvem não são atribuídos a você.
          </Faixa>
        )}

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="flex min-w-0 flex-col gap-4">
            {vista === 'dia' && (
              <Caixa>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <Numero valor={fmtH(resumo.registradas)} rotulo={dia === HOJE_TS ? 'registradas hoje' : 'registradas no dia'} />
                  <Numero valor={fmtH(resumo.automaticas)} rotulo="automáticas" detalhe={resumo.registradas ? `${Math.round((resumo.automaticas / resumo.registradas) * 100)}% do dia` : 'nada neste filtro'} />
                  <Numero valor={fmtH(resumo.confirmadas + resumo.estimadas)} rotulo="confirmadas e estimadas" />
                  <Numero valor={fmtH(resumo.sem)} rotulo="sem classificação" />
                </div>
              </Caixa>
            )}

            {vista === 'dia' && (
              <Caixa>
                <Pergunta>Onde foi o meu dia?</Pergunta>
                <LinhaDoDia linhas={visiveis} rotulo={rotuloLinha} onAbrir={abrir} agente={agente.map((a) => ({ inicio: a.inicio, minutos: Math.round((a.custo?.maquina_seg ?? 60) / 60), cor: aparencia({ setor: a.setor_id as never }).cor, texto: a.rotulo }))} />
                <Legenda
                  itens={['automatica', 'confirmada', 'estimada', 'sem', 'contestada']}
                  extra={
                    <>
                      <li className="flex items-center gap-1.5">
                        <span className="ring-warning size-3 rounded-xs ring-2 ring-inset" /> fora da jornada
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className="h-1.5 w-4 rounded-full" style={{ background: aparencia({ setor: 'fiscal' }).cor }} /> agente (série à parte)
                      </li>
                    </>
                  }
                />
                <ul className="divide-border -mx-2 flex flex-col divide-y" data-testid="ts-lista-dia">
                  {visiveis.map((l) => {
                    const c = confiancaDaLinha(l)
                    const s = l.tipo === 'sessao' ? l.s : undefined
                    const i = l.tipo === 'item' ? l.i : undefined
                    return (
                      <li key={l.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-2 py-2.5" data-linha={l.tipo}>
                        <button type="button" onClick={() => abrir(l)} className="flex min-w-0 grow basis-40 cursor-pointer items-center gap-3 text-left">
                          <Amostra c={c} />
                          <span className="w-24 shrink-0 text-xs tabular-nums sm:text-sm">
                            {hm(l.inicio)}–{hm(l.fim)}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm">{rotuloLinha(l)}</span>
                            <span className="text-muted-foreground block truncate text-xs">
                              {rotuloConfianca[c]}
                              {s && ` · ${rotuloOrigem(s)}`}
                              {i && ` · pista: ${i.pista}`}
                              {s?.fora_da_jornada && ' · fora da jornada'}
                              {s?.ao_vivo && ' · contando agora'}
                              {s?.contestacao && ` · contestada (${s.contestacao.status === 'pendente' ? 'aguardando o Gestor' : s.contestacao.status})`}
                            </span>
                          </span>
                          {s?.origem === 'manual' && (
                            <Badge variant="outline" className="shrink-0">
                              {s.ao_vivo ? 'cronômetro' : 'manual'}
                            </Badge>
                          )}
                          {s && ts.ehExtra(s) && (
                            <Badge variant="outline" className="shrink-0">
                              <TagIcon /> extra
                            </Badge>
                          )}
                        </button>
                        {s?.confianca === 'estimada' ? (
                          <span className="flex gap-1.5">
                            <Button size="sm" variant="outline" className="rounded-full" onClick={() => executar(() => repos.sessoes.confirmar(s.id), { sucesso: 'Confirmado' })}>
                              Confirmar
                            </Button>
                            <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setAberta(l)}>
                              Corrigir
                            </Button>
                          </span>
                        ) : i ? (
                          <span className="flex gap-1.5">
                            {(i.sugestao?.cliente_id || i.sugestao?.atividade_id) && (
                              <Button size="sm" variant="outline" className="rounded-full" onClick={() => executar(() => repos.itensConfirmacao.confirmar(i.id, 'sugestao'), { sucesso: 'Confirmado' })}>
                                Confirmar
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setAberta({ ...l })}>
                              {i.sugestao ? 'Corrigir' : 'Classificar'}
                            </Button>
                          </span>
                        ) : l.tipo === 'lacuna' ? (
                          <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setAberta(l)}>
                            Classificar
                          </Button>
                        ) : (
                          <span className="text-muted-foreground text-xs tabular-nums">{fmtH(duracaoMin(l))}</span>
                        )}
                      </li>
                    )
                  })}
                  {!visiveis.length && <li className="text-muted-foreground px-2 py-6 text-center text-sm">{clienteNome ? `Nenhuma sessão de ${clienteNome} neste dia.` : 'Nenhuma sessão neste dia.'}</li>}
                </ul>
              </Caixa>
            )}

            {vista === 'semana' && (
              <Caixa>
                <Pergunta>Quantas horas por dia, e quanto foi automático?</Pergunta>
                <ColunasEmpilhadas
                  dados={semana.map(({ d, r }) => ({ rotulo: rotuloDia(d), partes: [{ c: 'automatica' as const, v: r.automaticas }, { c: 'confirmada' as const, v: r.confirmadas }, { c: 'estimada' as const, v: r.estimadas }, { c: 'sem' as const, v: r.sem }] }))}
                  onClicar={(rot) => {
                    const alvo = semana.find(({ d }) => rotuloDia(d) === rot)
                    if (!alvo) return
                    setVista('dia')
                    setDesvio(Math.round((Date.parse(alvo.d) - Date.parse(HOJE_TS)) / 86400000))
                  }}
                />
                <Legenda itens={['automatica', 'confirmada', 'estimada', 'sem']} />
                <p className="text-muted-foreground text-xs">Clique num dia para ver a linha do dia.</p>
              </Caixa>
            )}
            {vista === 'semana' && <SemanaManual dias={semana.map((x) => x.d)} onLancar={setLancar} onAbrir={setEditando} />}

            {vista === 'mes' && (
              <>
                <div className="grid gap-4 xl:grid-cols-2">
                  <Caixa>
                    <Pergunta>Em que clientes o meu tempo foi?</Pergunta>
                    <Barras dados={porCliente} destacar={filtroMes ?? clienteNome} onClicar={setFiltroMes} />
                  </Caixa>
                  <Caixa>
                    <Pergunta>Em que atividades?</Pergunta>
                    <Barras dados={porAtividade} destacar={filtroMes ?? undefined} onClicar={setFiltroMes} />
                  </Caixa>
                </div>
                {filtroMes && (
                  <Caixa>
                    <Pergunta
                      acao={
                        <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setFiltroMes(null)}>
                          Limpar
                        </Button>
                      }
                    >
                      {filtroMes} em {rotuloCompetencia(comp)}
                    </Pergunta>
                    <ul className="divide-border -mx-2 flex flex-col divide-y text-sm">
                      {itensDoMes.map((s) => (
                        <li key={s.id} className="flex items-center gap-3 px-2 py-2">
                          <Amostra c={s.confianca} />
                          <span className="w-36 shrink-0 text-xs tabular-nums">
                            {rotuloDia(diaDe(s.inicio))} · {hm(s.inicio)}–{hm(s.fim)}
                          </span>
                          <span className="min-w-0 flex-1 truncate">
                            {s.atividade_id} {s.rotulo} <span className="text-muted-foreground">· {ts.nomeCliente(s.cliente_id)}</span>
                          </span>
                          <span className="text-muted-foreground text-xs tabular-nums">{fmtH(duracaoMin(s))}</span>
                        </li>
                      ))}
                    </ul>
                  </Caixa>
                )}
                <Caixa>
                  <Pergunta acao={<span className="text-muted-foreground text-xs">C2-25</span>}>Quanto do meu tempo foi serviço extra?</Pergunta>
                  {extrasMes.length ? (
                    <ul className="flex flex-col gap-1.5 text-sm">
                      {extrasMes.map((s) => (
                        <li key={s.id} className="flex items-center gap-2">
                          <TagIcon className="text-muted-foreground size-4" />
                          <span className="min-w-0 flex-1 truncate">
                            {rotuloDia(diaDe(s.inicio))} · {s.atividade_id} {s.rotulo} · {ts.nomeCliente(s.cliente_id)}
                          </span>
                          <span className="text-xs tabular-nums">{fmtH(duracaoMin(s))}</span>
                        </li>
                      ))}
                      <li className="text-muted-foreground border-t pt-1.5 text-xs">Total: {fmtHoras(extrasMes.reduce((t, s) => t + duracaoMin(s), 0))}. Vão para a comanda do Financeiro, que cobra o extra (fase 3).</li>
                    </ul>
                  ) : (
                    <p className="text-muted-foreground text-sm">Nenhuma tarefa marcada como serviço extra neste mês. A marcação é feita na ficha da tarefa, na hora do serviço.</p>
                  )}
                </Caixa>
              </>
            )}

            {/* T-1: os integrantes vão para a coluna larga, sob o dia; a lateral fica com cronômetro, extensão e contestações. */}
            <Caixa>
              <Pergunta>O que os meus integrantes fizeram {dia === HOJE_TS ? 'hoje' : 'no dia'}?</Pergunta>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Numero valor={`${Math.round(maquina)} min`} rotulo="de máquina" />
                <Numero valor={fmtHoras(poupadas)} rotulo="poupadas (estim.)" />
                <Numero valor={`${limitesIa.cincoHoras}%`} rotulo="do limite de 5 h" />
                <Numero valor={`${limitesIa.seteDias}%`} rotulo="do limite de 7 dias" />
              </div>
              <ul className="grid gap-x-6 gap-y-2 md:grid-cols-2">
                {agente.map((a) => {
                  const t = aparencia({ setor: a.setor_id as never })
                  return (
                    <li key={a.id} className="flex items-start gap-2.5 text-sm">
                      <Orb cor={t.cor} corOlhos={t.corOlhos} tamanho={22} cutucavel={false} extras={false} />
                      <span className="min-w-0 flex-1">
                        {t.nome}: {a.rotulo}
                        <span className="text-muted-foreground block text-xs tabular-nums">
                          {hm(a.inicio)} · {Math.round((a.custo?.maquina_seg ?? 0) / 60)} min de máquina
                        </span>
                      </span>
                      <Button size="icon-sm" variant="ghost" className="rounded-full" aria-label={`Abrir o chat de ${t.nome}`} onClick={() => nav.irPara({ modulo: 'inicio', aba: 'time', integrante: a.ator_id })}>
                        <ChatCircleIcon />
                      </Button>
                    </li>
                  )
                })}
                {!agente.length && <li className="text-muted-foreground text-sm md:col-span-2">Nada neste dia.</li>}
              </ul>
              <p className="text-muted-foreground text-xs">Série separada: nunca soma com as suas horas. Você vê o % do limite, nunca tokens nem custo.</p>
            </Caixa>
          </div>

          <div className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-0 lg:self-start">
            <Cronometro clienteId={clienteId} />
            <Caixa>
              <Pergunta acao={vinculada ? <Badge variant={pausada ? 'outline' : 'sucesso'}>{pausada ? `pausada ${pausada}` : 'ativa'}</Badge> : <Badge variant="outline">não vinculada</Badge>}>Extensão</Pergunta>
              {vinculada ? (
                <>
                  <p className="text-muted-foreground text-xs">{vinculo?.navegador === 'edge' ? 'Edge' : 'Chrome'} · sinais do dia por portal:</p>
                  {pulsos.length ? (
                    <ul className="flex flex-col gap-1.5 text-sm" data-testid="ts-pulsos">
                      {pulsos.map((p) => (
                        <li key={p.id} className="flex items-center gap-2">
                          <GlobeIcon className="text-muted-foreground size-4" />
                          <span className="min-w-0 flex-1 truncate">
                            {p.portal} <span className="text-muted-foreground">· {p.cliente_id ? ts.nomeCliente(p.cliente_id) : 'sem cliente'}</span>
                          </span>
                          <span className="text-xs tabular-nums">{p.minutos} min</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground text-sm">Nenhum sinal neste dia.</p>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    {pausada ? (
                      <Button size="sm" variant="outline" className="rounded-full" onClick={() => executar(() => religarExtensao(u, vinculo), { sucesso: 'Extensão religada' })}>
                        <PlayIcon /> Religar
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" className="rounded-full" onClick={() => setModal('pausar')}>
                        <PauseIcon /> Pausar
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setModal('dominios')}>
                      Ver portais
                    </Button>
                  </div>
                  {!!vinculo?.pausas.length && <p className="text-muted-foreground text-[11px]">Pausas: {vinculo.pausas.slice(-3).map((p) => `${rotuloDia(diaDe(p.de))} ${hm(p.de)} (${p.rotulo})`).join(', ')}. Só você vê.</p>}
                </>
              ) : (
                <>
                  <p className="text-muted-foreground text-sm">Sem a extensão, o tempo para de contar quando você fica no portal sem mexer na plataforma, e o intervalo vira item para confirmar.</p>
                  <Button size="sm" className="w-fit rounded-full" onClick={() => setModal('vincular')} disabled={!termo}>
                    <PuzzlePieceIcon /> Vincular extensão
                  </Button>
                  {!termo && <p className="text-muted-foreground text-xs">Aceite o termo antes.</p>}
                  <Button size="sm" variant="ghost" className="w-fit rounded-full" onClick={() => setModal('dominios')}>
                    Ver portais
                  </Button>
                </>
              )}
            </Caixa>

            <Caixa>
              <Pergunta>Minhas contestações</Pergunta>
              {contestacoes.length ? (
                <ul className="flex flex-col gap-2 text-sm" data-testid="ts-minhas-contestacoes">
                  {contestacoes.map((s) => {
                    const c = s.contestacao!
                    return (
                      <li key={s.id} className="flex flex-col">
                        <span>
                          {rotuloDia(diaDe(s.inicio))} · {hm(s.inicio)}–{hm(s.fim)} · {s.atividade_id} {s.rotulo}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {rotuloMotivoContestacao(c.motivo)} → {c.correcao} ·{' '}
                          <span className={cn(c.status === 'aceita' && 'text-success', c.status === 'recusada' && 'text-destructive')}>{c.status === 'pendente' ? 'aguardando o Gestor' : c.status === 'aceita' ? `aceita por ${c.decidido_por_nome}` : `recusada por ${c.decidido_por_nome}: ${c.motivo_recusa}`}</span>
                        </span>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm">Nenhuma. Para contestar, abra a sessão na lista do dia.</p>
              )}
            </Caixa>

          </div>
        </div>
      </div>

      {aberta && <DetalheLinha linha={aberta} onFechar={() => setAberta(null)} />}
      {lancar && <LancarTempo inicial={lancar} onFechar={() => setLancar(null)} />}
      {editando && <LancarTempo editar={ts.sessoes.find((x) => x.id === editando.id) ?? editando} onFechar={() => setEditando(null)} />}
      {modal === 'termo' && <TermoCiencia onFechar={() => setModal(null)} />}
      {modal === 'vincular' && <VincularExtensao onFechar={() => setModal(null)} />}
      {modal === 'pausar' && <PausarExtensao onFechar={() => setModal(null)} />}
      {modal === 'dominios' && <Dominios admin={papel === 'admin'} onFechar={() => setModal(null)} />}
    </AreaRolagem>
  )
}


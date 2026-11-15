// S06b · Lançamento manual de tempo, ao lado da captura automática: formulário, cronômetro,
// duplicar, repetir o de ontem e o tempo padrão do que é feito por fora.
import { ClockCounterClockwiseIcon, CopyIcon, PlayIcon, StopIcon, TrashIcon, WarningIcon } from '@phosphor-icons/react'
import { useEffect, useMemo, useState } from 'react'
import { useAcao, useConfirmar } from '@/components/kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Campo, CampoArea, CampoEscolha, CampoTexto, GavetaFormulario, Interruptor, Segmentado } from '@/components/ui/formulario'
import { atividadesInternas, catalogoTs, ehInterna, rotuloAtividade, setorDaAtividade } from '@/dados/timesheet-catalogo'
import { agoraDemo, diaDe, dh, duracaoMin, ehDiaUtil, fmtH, HOJE_TS, hm, minHora, rotuloDia, somarDias } from '@/dados/timesheet-tempo'
import type { SessaoTrabalho } from '@/nucleo/modelo/entidades'
import { repos } from '@/nucleo/repositorios'
import { Caixa } from './comum'
import { useTimesheet, type Ts } from './dados'
import { Pergunta } from './graficos'
import { AreaRolagem } from '@/components/ui/area-rolagem'

/** Evento para abrir o lançamento de qualquer tela, com o contexto da origem: `{ cliente_id?, tarefa_id?, dia? }`. */
export const EVENTO_LANCAR = 'heild:ts-lancar'
export interface ContextoLancamento {
  cliente_id?: string | null
  tarefa_id?: string | null
  atividade_id?: string | null
  dia?: string
}

const hh = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`

/** Cliente do contexto: o informado (tela de origem ou tarefa), senão o da tarefa aberta agora, senão o da última sessão da pessoa hoje. */
export function clienteDoContexto(ts: Ts, ctx: ContextoLancamento = {}) {
  if (ctx.cliente_id !== undefined && ctx.cliente_id !== null) return ctx.cliente_id
  if (ctx.tarefa_id) return ts.tarefa(ctx.tarefa_id)?.cliente_id ?? null
  const minhas = ts.sessoes.filter((s) => s.ator_tipo === 'pessoa' && s.usuario_dono_id === ts.usuario.id && !s.substituida_por)
  const aoVivo = minhas.find((s) => s.ao_vivo && s.tarefa_id && !s.extras?.cronometro)
  if (aoVivo?.cliente_id) return aoVivo.cliente_id
  return [...minhas].filter((s) => diaDe(s.inicio) === HOJE_TS && s.cliente_id).sort((a, b) => a.fim.localeCompare(b.fim)).at(-1)?.cliente_id ?? null
}

/** Primeiro horário livre do dia depois da última sessão (para o lançamento por duração). */
function proximoHorario(ts: Ts, dia: string) {
  const fins = ts.sessoes.filter((s) => s.ator_tipo === 'pessoa' && s.usuario_dono_id === ts.usuario.id && !s.substituida_por && diaDe(s.inicio) === dia && !s.ao_vivo).map((s) => minHora(hm(s.fim)))
  const m = fins.length ? Math.max(...fins) : minHora(ts.cfg.jornada_inicio) + 60
  return hh(Math.min(m, 23 * 60))
}

/** Formulário de lançamento (novo ou edição). */
export function LancarTempo({ inicial = {}, editar, onFechar }: { inicial?: ContextoLancamento; editar?: SessaoTrabalho; onFechar: () => void }) {
  const ts = useTimesheet()
  const executar = useAcao()
  const confirmar = useConfirmar()
  const clientes = ts.clientes.filter((c) => !c.arquivado_em)
  const [cliente, setCliente] = useState<string>(editar ? (editar.cliente_id ?? '') : (clienteDoContexto(ts, inicial) ?? ''))
  const [tarefa, setTarefa] = useState<string>(editar?.tarefa_id ?? inicial.tarefa_id ?? '')
  // Na edição, volta ao tempo padrão de onde veio (pelo nome), para não trocar o rótulo sem querer.
  const tpDaEdicao = editar ? ts.cfg.tempos_padrao.find((t) => t.nome === editar.rotulo) : undefined
  const [escolha, setEscolha] = useState<string>(tpDaEdicao ? `tp:${tpDaEdicao.id}` : (editar?.atividade_id ?? inicial.atividade_id ?? (inicial.tarefa_id ? (ts.tarefa(inicial.tarefa_id)?.atividade_id ?? '') : '')))
  const [dia, setDia] = useState(editar ? diaDe(editar.inicio) : (inicial.dia ?? HOJE_TS))
  const [modo, setModo] = useState<'duracao' | 'intervalo'>(editar ? 'intervalo' : 'duracao')
  const [ini, setIni] = useState(editar ? hm(editar.inicio) : proximoHorario(ts, inicial.dia ?? HOJE_TS))
  const [fim, setFim] = useState(editar ? hm(editar.fim) : '')
  const [duracao, setDuracao] = useState(editar ? String(duracaoMin(editar)) : '15')
  const [descricao, setDescricao] = useState(editar?.descricao ?? '')
  const [faturavel, setFaturavel] = useState(editar ? !!editar.faturavel : !!clienteDoContexto(ts, inicial))
  const [sobreposicao, setSobreposicao] = useState<'manter' | 'substituir' | null>(null)
  const [duplicarPara, setDuplicarPara] = useState(somarDias(HOJE_TS, 1))
  const tempos = ts.cfg.tempos_padrao
  const tarefasDoCliente = ts.tarefas.filter((t) => (cliente ? t.cliente_id === cliente : !t.cliente_id) && !['concluida', 'cancelada'].includes(t.status) && !t.arquivado_em).slice(0, 40)

  // Atividade escolhida: tarefa > tempo padrão > catálogo.
  const tp = tempos.find((t) => `tp:${t.id}` === escolha)
  const atividade = tarefa ? (ts.tarefa(tarefa)?.atividade_id ?? null) : tp ? (tp.atividade_id ?? null) : escolha || null
  const rotulo = tarefa ? (ts.tarefa(tarefa)?.titulo ?? rotuloAtividade(atividade)) : tp ? tp.nome : editar && editar.atividade_id === atividade ? editar.rotulo : rotuloAtividade(atividade)
  const inicioIso = dh(dia, ini)
  const fimIso = modo === 'intervalo' ? (fim ? dh(dia, fim) : inicioIso) : dh(dia, hh(Math.min(minHora(ini) + (Number(duracao) || 0), 23 * 60 + 59)))
  const erroTempo = !ini ? 'Informe o início.' : Date.parse(fimIso) <= Date.parse(inicioIso) ? (modo === 'intervalo' ? 'Termina antes de começar.' : 'Informe a duração.') : null
  const erroQue = !cliente && !atividade ? 'Escolha o cliente ou a atividade (ou uma atividade interna).' : null
  const cruzam = useMemo(() => (erroTempo ? [] : repos.sessoes.sobrepostas(ts.usuario.id, inicioIso, fimIso, editar?.id)), [ts.sessoes, inicioIso, fimIso, erroTempo, editar?.id, ts.usuario.id]) // eslint-disable-line react-hooks/exhaustive-deps
  const precisaEscolher = !editar && cruzam.length > 0 && !sobreposicao
  const ontem = (() => {
    let d = somarDias(dia, -1)
    while (!ehDiaUtil(d)) d = somarDias(d, -1)
    return d
  })()
  const deOntem = ts.sessoes.filter((s) => s.origem === 'manual' && s.usuario_dono_id === ts.usuario.id && !s.substituida_por && diaDe(s.inicio) === ontem && !s.ao_vivo)

  const escolherTempo = (v: string) => {
    setEscolha(v)
    setTarefa('')
    const t = tempos.find((x) => `tp:${x.id}` === v)
    if (t) {
      setModo('duracao')
      setDuracao(String(t.minutos))
    }
    setFaturavel(!!cliente && !ehInterna(t?.atividade_id ?? v))
  }
  const dados = { cliente_id: cliente || null, atividade_id: atividade, rotulo, tarefa_id: tarefa || null, setor_id: tarefa ? (ts.tarefa(tarefa)?.setor_id ?? setorDaAtividade(atividade)) : setorDaAtividade(atividade), inicio: inicioIso, fim: fimIso, descricao, faturavel }
  const salvar = () => {
    if (editar) return executar(() => repos.sessoes.editarManual(editar.id, dados), { sucesso: 'Lançamento editado: a versão anterior ficou guardada' }) && onFechar()
    executar(() => repos.sessoes.lancarManual(dados, { sobreposicao: sobreposicao ?? undefined, cfg: ts.cfg }), { sucesso: `Lançado à mão: ${fmtH(duracaoMin({ inicio: inicioIso, fim: fimIso }))} em ${rotulo}` }) && onFechar()
  }
  const opcoesAtividade = [
    ...tempos.map((t) => ({ valor: `tp:${t.id}`, rotulo: `${t.nome} · ${t.minutos} min (padrão do escritório)` })),
    ...catalogoTs.map((a) => ({ valor: a.id, rotulo: `${a.id} · ${a.rotulo}` })),
    ...atividadesInternas.map((a) => ({ valor: a.id, rotulo: `${a.rotulo} (interno)` })),
  ]

  return (
    <GavetaFormulario
      aberta
      largura="lg"
      onFechar={onFechar}
      titulo={editar ? 'Editar lançamento' : 'Lançar tempo'}
      descricao={editar ? `Lançamento manual de ${rotuloDia(diaDe(editar.inicio))}. Editar cria uma versão nova; a anterior fica no histórico.` : 'Para o que foi feito fora do sistema. Fica marcado como lançamento manual, separado do que a captura registrou sozinha.'}
      acao={editar ? 'Salvar versão' : precisaEscolher ? 'Escolha o que fazer com a sobreposição' : 'Lançar'}
      acaoDesabilitada={!!erroTempo || !!erroQue || precisaEscolher}
      onAcao={salvar}
      secundaria={
        editar ? (
          <Button
            type="button"
            variant="ghost"
            className="rounded-full"
            onClick={async () => {
              const ok = await confirmar({ titulo: 'Descartar este lançamento?', descricao: 'Sai da contagem e fica no histórico como descartado. Nada se apaga.', acao: 'Descartar', perigo: true })
              if (ok) executar(() => repos.sessoes.descartar(editar.id, { ferramenta: 'timesheet.lancar', motivo: 'lançamento manual descartado' }), { sucesso: 'Lançamento descartado' }) && onFechar()
            }}
          >
            <TrashIcon /> Descartar
          </Button>
        ) : deOntem.length ? (
          <Button type="button" variant="outline" className="rounded-full" onClick={() => executar(() => deOntem.map((s) => repos.sessoes.duplicarManual(s.id, dia, { sobreposicao: 'manter', cfg: ts.cfg })), { sucesso: `${deOntem.length} ${deOntem.length === 1 ? 'lançamento de' : 'lançamentos de'} ${rotuloDia(ontem)} repetidos em ${rotuloDia(dia)}` }) && onFechar()}>
            <ClockCounterClockwiseIcon /> Repetir os de {rotuloDia(ontem)} ({deOntem.length})
          </Button>
        ) : undefined
      }
    >
      <Campo rotulo="Cliente" ajuda={!editar && clienteDoContexto(ts, inicial) ? 'Veio do contexto (tarefa aberta, tela de origem ou a última sessão).' : undefined}>
        {(id) => <CampoEscolha id={id} valor={cliente} onMudar={(v) => (setCliente(v), setTarefa(''), setFaturavel(!!v))} opcoes={[{ valor: '', rotulo: 'Interno (sem cliente)' }, ...clientes.map((c) => ({ valor: c.id, rotulo: c.nome }))]} />}
      </Campo>
      <Campo rotulo="Tarefa (opcional)">
        {(id) => <CampoEscolha id={id} valor={tarefa} onMudar={(v) => (setTarefa(v), v && setEscolha(ts.tarefa(v)?.atividade_id ?? ''))} opcoes={[{ valor: '', rotulo: 'sem tarefa: escolher a atividade' }, ...tarefasDoCliente.map((t) => ({ valor: t.id, rotulo: `${t.atividade_id} · ${t.titulo}` }))]} />}
      </Campo>
      {!tarefa && <Campo rotulo="Atividade" ajuda="Os primeiros são o tempo padrão do escritório para o que é feito por fora: a duração vem preenchida.">{(id) => <CampoEscolha id={id} valor={escolha} onMudar={escolherTempo} opcoes={[{ valor: '', rotulo: 'escolha a atividade' }, ...opcoesAtividade]} />}</Campo>}
      <div className="grid gap-3 sm:grid-cols-2">
        <Campo rotulo="Data">{(id) => <CampoTexto id={id} tipo="date" valor={dia} onMudar={(v) => v && setDia(v)} />}</Campo>
        <Campo rotulo="Como informar">
          {() => (
            <Segmentado
              rotulo="Como informar"
              valor={modo}
              onMudar={setModo}
              opcoes={[
                { valor: 'duracao', rotulo: 'Duração' },
                { valor: 'intervalo', rotulo: 'Início e fim' },
              ]}
            />
          )}
        </Campo>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Campo rotulo="Início">{(id) => <CampoTexto id={id} tipo="time" valor={ini} onMudar={setIni} />}</Campo>
        {modo === 'intervalo' ? (
          <Campo rotulo="Fim" erro={fim ? (erroTempo ?? undefined) : undefined}>
            {(id) => <CampoTexto id={id} tipo="time" valor={fim} onMudar={setFim} />}
          </Campo>
        ) : (
          <Campo rotulo="Duração (min)" ajuda={tp ? `Padrão do escritório: ${tp.minutos} min.` : undefined}>
            {(id) => <CampoTexto id={id} tipo="number" valor={duracao} onMudar={setDuracao} className="tabular-nums" />}
          </Campo>
        )}
      </div>
      {!erroTempo && <p className="text-muted-foreground -mt-2 text-xs tabular-nums">{hm(inicioIso)}–{hm(fimIso)} · {fmtH(duracaoMin({ inicio: inicioIso, fim: fimIso }))}</p>}
      <Campo rotulo="Descrição (opcional)">{(id) => <CampoArea id={id} linhas={2} valor={descricao} onMudar={setDescricao} />}</Campo>
      <Interruptor ligado={faturavel} onMudar={setFaturavel} rotulo="Faturável" detalhe="Entra nas horas cobráveis (valor-hora de cobrança e serviço extra). Interno nunca é faturável." />
      {erroQue && escolha !== '' && <p className="text-destructive-text text-sm">{erroQue}</p>}
      {!editar && cruzam.length > 0 && (
        <div className="bg-warning/10 flex flex-col gap-2 rounded-lg px-3 py-2.5 text-sm" data-testid="ts-sobreposicao">
          <span className="flex items-start gap-2">
            <WarningIcon weight="fill" className="text-warning mt-0.5 size-4 shrink-0" />
            Cruza {cruzam.length === 1 ? 'uma sessão já capturada' : `${cruzam.length} sessões já capturadas`}: {cruzam.map((c) => `${hm(c.inicio)}–${hm(c.fim)} ${c.atividade_id ?? ''} ${c.rotulo}`).join('; ')}. O que fazer?
          </span>
          <Segmentado
            rotulo="Sobreposição"
            valor={sobreposicao ?? ('' as never)}
            onMudar={(v) => setSobreposicao(v)}
            opcoes={[
              { valor: 'manter', rotulo: 'Manter as duas (fica marcado)' },
              { valor: 'substituir', rotulo: 'O meu substitui a capturada' },
            ]}
          />
        </div>
      )}
      {editar && (
        <>
          <div className="bg-sunken flex flex-wrap items-end gap-2 rounded-lg px-3 py-2.5">
            <span className="w-40">
              <CampoTexto aria-label="Duplicar para o dia" tipo="date" valor={duplicarPara} onMudar={setDuplicarPara} />
            </span>
            <Button type="button" size="sm" variant="outline" className="rounded-full" onClick={() => executar(() => repos.sessoes.duplicarManual(editar.id, duplicarPara, { sobreposicao: 'manter', cfg: ts.cfg }), { sucesso: `Duplicado para ${rotuloDia(duplicarPara)}` }) && onFechar()}>
              <CopyIcon /> Duplicar
            </Button>
          </div>
          {!!editar.versoes?.length && (
            <div className="flex flex-col gap-1" data-testid="ts-versoes">
              <span className="text-sm font-medium">Versões anteriores</span>
              {[...editar.versoes].reverse().map((v, i) => (
                <span key={i} className="text-muted-foreground text-xs">
                  {rotuloDia(diaDe(v.em))} {hm(v.em)} · {v.por_nome ?? v.por}: era {v.antes.inicio ? `${hm(v.antes.inicio)}–${hm(v.antes.fim ?? v.antes.inicio)}` : ''} · {v.antes.rotulo} · {ts.nomeCliente(v.antes.cliente_id)}
                  {v.antes.descricao ? ` · “${v.antes.descricao}”` : ''}
                </span>
              ))}
            </div>
          )}
        </>
      )}
    </GavetaFormulario>
  )
}

/**
 * Cronômetro: iniciar e parar; vira lançamento manual com o tempo medido. O lançamento
 * de um tempo que já passou fica num lugar só, o botão "Lançar tempo" do cabeçalho (T-4).
 */
export function Cronometro({ clienteId }: { clienteId?: string | null }) {
  const ts = useTimesheet()
  const executar = useAcao()
  const rodando = ts.sessoes.find((s) => s.usuario_dono_id === ts.usuario.id && s.extras?.cronometro && s.ao_vivo)
  const [cliente, setCliente] = useState<string>(clienteDoContexto(ts, { cliente_id: clienteId ?? undefined }) ?? '')
  const [escolha, setEscolha] = useState(ts.cfg.tempos_padrao[0] ? `tp:${ts.cfg.tempos_padrao[0].id}` : 'GES-025')
  const [agora, setAgora] = useState(Date.now())
  useEffect(() => {
    if (!rodando) return
    const t = window.setInterval(() => setAgora(Date.now()), 1000)
    return () => window.clearInterval(t)
  }, [rodando])
  const tp = ts.cfg.tempos_padrao.find((t) => `tp:${t.id}` === escolha)
  const atividade = tp ? (tp.atividade_id ?? null) : escolha
  const decorrido = rodando ? Math.max(0, Math.floor((Date.parse(agoraDemo(agora)) - Date.parse(rodando.inicio)) / 1000)) : 0
  const relogio = `${String(Math.floor(decorrido / 3600)).padStart(2, '0')}:${String(Math.floor((decorrido % 3600) / 60)).padStart(2, '0')}:${String(decorrido % 60).padStart(2, '0')}`
  return (
    <Caixa>
      <Pergunta acao={rodando ? <Badge variant="sucesso">rodando</Badge> : undefined}>Cronômetro</Pergunta>
      <p className="text-muted-foreground -mt-1 text-xs">Para o que você vai fazer fora do sistema. Ao parar, vira lançamento manual; a captura automática continua sendo o principal.</p>
      {rodando ? (
        <div className="flex flex-col gap-2" data-testid="ts-cronometro">
          <span className="font-heading text-3xl font-light tabular-nums">{relogio}</span>
          <span className="text-muted-foreground text-xs">
            {rodando.rotulo} · {ts.nomeCliente(rodando.cliente_id)} · desde {hm(rodando.inicio)}
          </span>
          <Button size="sm" className="w-fit rounded-full" onClick={() => executar(() => repos.sessoes.pararCronometro(rodando.id, agoraDemo(), ts.cfg), { sucesso: 'Cronômetro parado: virou lançamento manual' })}>
            <StopIcon /> Parar
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <CampoEscolha rotulo="Cliente do cronômetro" valor={cliente} onMudar={setCliente} opcoes={[{ valor: '', rotulo: 'Interno (sem cliente)' }, ...ts.clientes.filter((c) => !c.arquivado_em).map((c) => ({ valor: c.id, rotulo: c.nome }))]} />
          <CampoEscolha rotulo="Atividade do cronômetro" valor={escolha} onMudar={setEscolha} opcoes={[...ts.cfg.tempos_padrao.map((t) => ({ valor: `tp:${t.id}`, rotulo: t.nome })), ...catalogoTs.map((a) => ({ valor: a.id, rotulo: `${a.id} · ${a.rotulo}` })), ...atividadesInternas.map((a) => ({ valor: a.id, rotulo: `${a.rotulo} (interno)` }))]} />
          <div className="flex flex-wrap gap-1.5">
            <Button
              size="sm"
              className="rounded-full"
              onClick={() => {
                const ini = agoraDemo()
                executar(() => repos.sessoes.lancarManual({ cliente_id: cliente || null, atividade_id: atividade, rotulo: tp ? tp.nome : rotuloAtividade(atividade), setor_id: setorDaAtividade(atividade), inicio: ini, fim: ini, faturavel: !!cliente && !ehInterna(atividade) }, { cronometro: true }), { sucesso: 'Cronômetro iniciado' })
              }}
            >
              <PlayIcon /> Iniciar cronômetro
            </Button>
          </div>
        </div>
      )}
    </Caixa>
  )
}

/** Abre o lançamento quando outra tela pede (`EVENTO_LANCAR`), montado pela captura (sempre presente na Plataforma). */
export function OuvinteLancamento() {
  const [ctx, setCtx] = useState<ContextoLancamento | null>(null)
  useEffect(() => {
    const abrir = (e: Event) => setCtx((e as CustomEvent<ContextoLancamento>).detail ?? {})
    window.addEventListener(EVENTO_LANCAR, abrir)
    return () => window.removeEventListener(EVENTO_LANCAR, abrir)
  }, [])
  return ctx ? <LancarTempo inicial={ctx} onFechar={() => setCtx(null)} /> : null
}

/** Visão da semana dos lançamentos manuais (linhas por cliente e atividade, colunas por dia), no padrão dos timesheets. */
export function SemanaManual({ dias, onLancar, onAbrir }: { dias: string[]; onLancar: (ctx: ContextoLancamento) => void; onAbrir: (s: SessaoTrabalho) => void }) {
  const ts = useTimesheet()
  const manuais = ts.sessoes.filter((s) => s.origem === 'manual' && s.usuario_dono_id === ts.usuario.id && !s.substituida_por && dias.includes(diaDe(s.inicio)))
  const chaves = [...new Set(manuais.map((s) => `${s.cliente_id ?? ''}|${s.atividade_id ?? ''}|${s.rotulo}`))]
  const total = (xs: SessaoTrabalho[]) => xs.reduce((t, s) => t + duracaoMin(s), 0)
  return (
    <Caixa>
      <Pergunta>O que lancei à mão nesta semana?</Pergunta>
      <p className="text-muted-foreground -mt-1 text-xs">Clique num + para lançar naquele dia; num total, para editar.</p>
      <AreaRolagem eixo="x" className="-mx-1 px-1">
        <table className="w-full min-w-[560px] text-sm" data-testid="ts-semana-manual">
          <thead>
            <tr className="text-muted-foreground text-left text-xs">
              <th className="pb-1.5 font-medium">Cliente · atividade</th>
              {dias.map((d) => (
                <th key={d} className="pb-1.5 text-right font-medium">
                  {rotuloDia(d)}
                </th>
              ))}
              <th className="pb-1.5 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
            {chaves.map((k) => {
              const [cid, at, rot] = k.split('|')
              const daLinha = manuais.filter((s) => `${s.cliente_id ?? ''}|${s.atividade_id ?? ''}|${s.rotulo}` === k)
              return (
                <tr key={k}>
                  <td className="py-1.5 pr-2">
                    <span className="block truncate">{ts.nomeCliente(cid || null)}</span>
                    <span className="text-muted-foreground block truncate text-xs">{rot}</span>
                  </td>
                  {dias.map((d) => {
                    const doDia = daLinha.filter((s) => diaDe(s.inicio) === d)
                    return (
                      <td key={d} className="py-1.5 text-right tabular-nums">
                        {doDia.length ? (
                          <button type="button" className="cursor-pointer hover:underline" onClick={() => onAbrir(doDia[0])}>
                            {fmtH(total(doDia))}
                          </button>
                        ) : (
                          <button type="button" aria-label={`Lançar ${rot} em ${rotuloDia(d)}`} className="text-muted-foreground cursor-pointer px-1 hover:underline" onClick={() => onLancar({ cliente_id: cid || null, atividade_id: at || null, dia: d })}>
                            +
                          </button>
                        )}
                      </td>
                    )
                  })}
                  <td className="py-1.5 text-right font-medium tabular-nums">{fmtH(total(daLinha))}</td>
                </tr>
              )
            })}
            {!chaves.length && (
              <tr>
                <td colSpan={dias.length + 2} className="text-muted-foreground py-4 text-center text-sm">
                  Nada lançado à mão nesta semana. A captura automática registrou o resto.
                </td>
              </tr>
            )}
          </tbody>
          {chaves.length > 0 && (
            <tfoot>
              <tr className="border-t text-xs">
                <td className="pt-1.5 font-medium">Total do dia</td>
                {dias.map((d) => (
                  <td key={d} className="pt-1.5 text-right tabular-nums">
                    {fmtH(total(manuais.filter((s) => diaDe(s.inicio) === d)))}
                  </td>
                ))}
                <td className="pt-1.5 text-right font-medium tabular-nums">{fmtH(total(manuais))}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </AreaRolagem>
    </Caixa>
  )
}

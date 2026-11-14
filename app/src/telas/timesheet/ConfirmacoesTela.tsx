import { CheckIcon, ClockIcon, UserIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { useAcao } from '@/components/kit'
import { AreaRolagem } from '@/components/ui/area-rolagem'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { diaDe, duracaoMin, fmtH, HOJE_TS, hm, rotuloDia, somarDias } from '@/dados/timesheet-tempo'
import type { ItemConfirmacao } from '@/nucleo/modelo/entidades'
import { repos } from '@/nucleo/repositorios'
import { cn } from '@/lib/utils'
import { AtribuirArtefato, Corrigir } from './acoes'
import { Caixa, CabecalhoTs, TimesheetVazio } from './comum'
import { pendentesDe, useTimesheet, type PapelTs } from './dados'
import { Pergunta } from './graficos'

const primeiroNome = (n: string) => n.split(' ').slice(0, 2).join(' ').replace(/ (Ltda|ME|S\.A\.|Eireli)$/, '')

/**
 * Timesheet › Confirmações (05, 5.2 e 8.5): a lista curta do que o sistema não
 * atribuiu sozinho, pré-preenchida, em um clique. Até N por dia (configurável),
 * válidos por 7 dias, nunca texto livre. O Gestor tem um segundo painel: arquivos
 * sem pessoa e a contagem de pendências por pessoa (sem o conteúdo).
 */
export function ConfirmacoesTela({ papel, clienteNome, clienteId }: { papel: PapelTs; clienteNome?: string; clienteId?: string | null }) {
  const ts = useTimesheet()
  const executar = useAcao()
  const [corrigir, setCorrigir] = useState<ItemConfirmacao | null>(null)
  const [atribuir, setAtribuir] = useState<ItemConfirmacao | null>(null)
  const u = ts.usuario.id
  const de = somarDias(HOJE_TS, -6)
  const doCliente = (i: ItemConfirmacao) => !clienteId || i.sugestao?.cliente_id === clienteId || i.alternativa_cliente_id === clienteId
  const meus = ts.itens.filter((i) => i.usuario_id === u && i.dia >= de && i.situacao !== 'expirado' && doCliente(i))
  const dias = [...new Set(meus.map((i) => i.dia))].sort().reverse()
  // Os que mais valem o clique: duração primeiro (05, 5.3); o resto fica como sem classificação.
  const doDia = (dia: string) => {
    const todos = meus.filter((i) => i.dia === dia).sort((a, b) => (b.sugestao?.minutos ?? duracaoMin(b)) - (a.sugestao?.minutos ?? duracaoMin(a)))
    const abertos = todos.filter((i) => i.situacao === 'pendente' || i.situacao === 'marcado')
    const fora = abertos.slice(ts.cfg.itens_dia)
    return { mostrar: todos.filter((i) => !fora.includes(i)).sort((a, b) => a.inicio.localeCompare(b.inicio)), fora }
  }
  const pendentes = pendentesDe(ts.itens, u).filter(doCliente)
  const marcados = pendentes.filter((i) => i.situacao === 'marcado' && (i.sugestao?.cliente_id || i.sugestao?.atividade_id))
  const gestor = papel !== 'colaborador'
  const setores = papel === 'admin' ? null : (ts.permissoes.gere as string[])
  const doMeuSetor = (s?: string | null) => !setores || (!!s && setores.includes(s))
  const semPessoa = ts.itens.filter((i) => i.tipo === 'foi_voce' && doMeuSetor(i.setor_id) && (i.usuario_id == null || i.atribuido_a))
  const pessoas = ts.pessoasDoSetor(setores ?? ts.permissoes.gere)
  const pendPorPessoa = pessoas.map((p) => ({ nome: p.nome, n: pendentesDe(ts.itens, p.id).filter((i) => doMeuSetor(i.setor_id)).length })).sort((a, b) => b.n - a.n)
  // A equipe confirma em dia? (30 dias): pelos itens resolvidos.
  const resolvidos = ts.itens.filter((i) => i.usuario_id && doMeuSetor(i.setor_id) && i.dia >= somarDias(HOJE_TS, -30) && ['confirmado', 'descartado', 'expirado'].includes(i.situacao))
  const quando = (i: ItemConfirmacao) => String(i.extras?.resolvido_em ?? i.atualizado_em)
  const noDia = resolvidos.filter((i) => i.situacao !== 'expirado' && diaDe(quando(i)) <= i.dia).length
  const em2 = resolvidos.filter((i) => i.situacao !== 'expirado' && diaDe(quando(i)) <= somarDias(i.dia, 2)).length
  const expirados = resolvidos.filter((i) => i.situacao === 'expirado')
  const pct = (n: number) => (resolvidos.length ? `${Math.round((n / resolvidos.length) * 100)}%` : '—')

  if (ts.vazio) return <TimesheetVazio />

  return (
    <AreaRolagem className="h-full px-3 pb-10 sm:px-5">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 pt-1 ultra:max-w-[1600px]">
        <CabecalhoTs titulo="Confirmações" sub={`${pendentes.length} pendentes · leva uns 2 min · o que não for confirmado em 7 dias fica como sem classificação, sem cobrança`} papel={papel} />
        <div className={cn('grid gap-4', gestor && 'lg:grid-cols-[minmax(0,1fr)_20rem]')}>
          <div className="flex min-w-0 flex-col gap-4">
            {dias.map((dia) => {
              const { mostrar, fora } = doDia(dia)
              return (
                <Caixa key={dia}>
                  <Pergunta acao={<span className="text-muted-foreground text-xs">até {ts.cfg.itens_dia} por dia, os que mais valem o clique</span>}>{dia === HOJE_TS ? `Hoje, ${rotuloDia(dia)}` : rotuloDia(dia)}</Pergunta>
                  <ul className="divide-border -mx-2 flex flex-col divide-y" data-testid={`ts-conf-${dia}`}>
                    {mostrar.map((i) => {
                      const fechado = i.situacao !== 'pendente' && i.situacao !== 'marcado'
                      const temSugestao = !!(i.sugestao?.cliente_id || i.sugestao?.atividade_id)
                      return (
                        <li key={i.id} className={cn('flex flex-col gap-2 px-2 py-3 xl:flex-row xl:items-center', fechado && 'opacity-60')} data-item={i.id}>
                          <div className="flex min-w-0 flex-1 items-start gap-3">
                            {!fechado ? (
                              <input type="checkbox" aria-label={`Marcar ${hm(i.inicio)}`} className="accent-foreground mt-1 size-4 shrink-0" checked={i.situacao === 'marcado'} disabled={!temSugestao} onChange={(ev) => executar(() => repos.itensConfirmacao.marcar(i.id, ev.target.checked))} />
                            ) : (
                              <CheckIcon className={cn('mt-1 size-4 shrink-0', i.situacao === 'confirmado' ? 'text-success' : 'text-muted-foreground')} />
                            )}
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-x-2 text-sm">
                                <span className="tabular-nums">
                                  {hm(i.inicio)}
                                  {i.fim && `–${hm(i.fim)}`}
                                </span>
                                <span>{i.texto}</span>
                                {i.tipo === 'nao_era_esta' && <Badge variant="outline">não era esta</Badge>}
                                {i.tipo === 'foi_voce' && <Badge variant="outline">foi você?</Badge>}
                              </div>
                              <div className="text-muted-foreground text-xs">{fechado ? (i.situacao === 'confirmado' ? `confirmado: ${i.resultado}` : 'descartado: não era trabalho') : `pista: ${i.pista}`}</div>
                            </div>
                          </div>
                          {!fechado && (
                            <div className="flex flex-wrap gap-1.5 pl-7 xl:pl-0 xl:max-w-[60%] xl:justify-end">
                              {temSugestao && (
                                <Button size="sm" variant="secondary" className="h-auto rounded-full py-1 text-left whitespace-normal" onClick={() => executar(() => repos.itensConfirmacao.confirmar(i.id, 'sugestao'), { sucesso: 'Confirmado' })}>
                                  <CheckIcon /> {i.sugestao?.atividade_id ?? ''} {i.sugestao?.cliente_id ? primeiroNome(ts.nomeCliente(i.sugestao.cliente_id)) : i.tipo === 'foi_voce' ? 'fui eu' : ''} · {fmtH(i.sugestao?.minutos ?? duracaoMin(i))}
                                </Button>
                              )}
                              {i.alternativa_cliente_id && (
                                <Button size="sm" variant="outline" className="rounded-full" onClick={() => executar(() => repos.itensConfirmacao.confirmar(i.id, 'alternativa'), { sucesso: `Confirmado como ${ts.nomeCliente(i.alternativa_cliente_id)}` })}>
                                  era {primeiroNome(ts.nomeCliente(i.alternativa_cliente_id))}
                                </Button>
                              )}
                              <Button size="sm" variant={temSugestao ? 'ghost' : 'outline'} className="rounded-full" onClick={() => setCorrigir(i)}>
                                {temSugestao ? (i.tipo === 'conflito' ? 'dividir ou corrigir' : 'corrigir') : 'classificar'}
                              </Button>
                              <Button size="sm" variant="ghost" className="text-muted-foreground rounded-full" onClick={() => executar(() => repos.itensConfirmacao.descartar(i.id), { sucesso: 'Fora da contagem: não era trabalho' })}>
                                não era trabalho
                              </Button>
                            </div>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                  {fora.length > 0 && <p className="text-muted-foreground text-xs">Mais {fora.length} {fora.length === 1 ? 'intervalo ficou' : 'intervalos ficaram'} como sem classificação (limite de {ts.cfg.itens_dia} por dia). Não é falta sua: é lacuna da captura.</p>}
                </Caixa>
              )
            })}
            {!dias.length && (
              <Caixa>
                <p className="text-muted-foreground py-6 text-center text-sm">Nada para confirmar{clienteNome ? ` de ${clienteNome}` : ''} nos últimos 7 dias.</p>
              </Caixa>
            )}
            {marcados.length > 0 && (
              <div className="bg-surface shadow-painel sticky bottom-3 flex items-center gap-3 rounded-full py-2 pr-2 pl-4 text-sm">
                <span className="flex-1">{marcados.length} marcados com a sugestão</span>
                <Button size="sm" className="rounded-full" onClick={() => executar(() => repos.itensConfirmacao.confirmarLote(marcados.map((m) => m.id)), { sucesso: `${marcados.length} confirmados` })}>
                  <CheckIcon /> Confirmar tudo marcado
                </Button>
              </div>
            )}
          </div>

          {gestor && (
            <div className="flex min-w-0 flex-col gap-4">
              <Caixa>
                <Pergunta>Arquivos sem pessoa</Pergunta>
                <p className="text-muted-foreground -mt-1 text-xs">A nuvem não disse quem salvou. Atribua e a pessoa confirma (“foi você?”).</p>
                <ul className="flex flex-col gap-2.5" data-testid="ts-sem-pessoa">
                  {semPessoa.map((a) => (
                    <li key={a.id} className="flex flex-col gap-1.5 text-sm">
                      <span>{a.texto.replace(/^Foi você\? /, '')}</span>
                      <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                        <ClockIcon className="size-3.5" /> {rotuloDia(a.dia)} {hm(a.inicio)} · {a.sugestao?.atividade_id}
                      </span>
                      {a.atribuido_a ? (
                        <Badge variant={a.situacao === 'confirmado' ? 'sucesso' : 'outline'}>
                          <UserIcon /> {ts.nomeUsuario(a.atribuido_a)}, {a.situacao === 'confirmado' ? 'confirmou' : a.situacao === 'descartado' ? 'disse que não foi' : 'aguardando confirmação'}
                        </Badge>
                      ) : (
                        <Button size="sm" variant="outline" className="w-fit rounded-full" onClick={() => setAtribuir(a)}>
                          Atribuir
                        </Button>
                      )}
                    </li>
                  ))}
                  {!semPessoa.length && <li className="text-muted-foreground text-sm">Nenhum arquivo sem pessoa.</li>}
                </ul>
              </Caixa>
              <Caixa>
                <Pergunta>Pendências por pessoa</Pergunta>
                <p className="text-muted-foreground -mt-1 text-xs">Só a contagem. O conteúdo é de cada um.</p>
                <ul className="flex flex-col gap-1.5 text-sm">
                  {pendPorPessoa.map((p) => (
                    <li key={p.nome} className="flex justify-between">
                      <span>{p.nome}</span>
                      <span className="tabular-nums">{p.n}</span>
                    </li>
                  ))}
                </ul>
              </Caixa>
              <Caixa>
                <Pergunta>A equipe confirma em dia? (30 dias)</Pergunta>
                <dl className="divide-border flex flex-col divide-y text-sm">
                  {[
                    { rotulo: 'confirmados no mesmo dia', valor: pct(noDia) },
                    { rotulo: 'em até 2 dias', valor: pct(em2) },
                    { rotulo: 'expiraram em 7 dias (sem cobrança)', valor: `${expirados.length} · ${fmtH(expirados.reduce((t, i) => t + duracaoMin(i), 0))}` },
                  ].map((x) => (
                    <div key={x.rotulo} className="flex justify-between gap-3 py-1.5 first:pt-0 last:pb-0">
                      <dt className="text-muted-foreground">{x.rotulo}</dt>
                      <dd className="tabular-nums">{x.valor}</dd>
                    </div>
                  ))}
                </dl>
              </Caixa>
            </div>
          )}
        </div>
      </div>
      {corrigir && (
        <Corrigir
          titulo={`${corrigir.sugestao ? 'Corrigir' : 'Classificar'} · ${hm(corrigir.inicio)}${corrigir.fim ? `–${hm(corrigir.fim)}` : ''}`}
          descricao={`${corrigir.texto}. Pista: ${corrigir.pista}.`}
          inicio={corrigir.inicio}
          fim={corrigir.fim ?? new Date(Date.parse(corrigir.inicio) + (corrigir.sugestao?.minutos ?? 15) * 60000).toISOString()}
          sugestao={corrigir.sugestao ?? undefined}
          alternativa={corrigir.alternativa_cliente_id}
          onFechar={() => setCorrigir(null)}
          onSalvar={(partes) => !!executar(() => repos.itensConfirmacao.confirmar(corrigir.id, partes), { sucesso: partes.length > 1 ? 'Dividido entre dois clientes' : 'Confirmado com a correção' })}
        />
      )}
      {atribuir && <AtribuirArtefato item={atribuir} onFechar={() => setAtribuir(null)} />}
    </AreaRolagem>
  )
}

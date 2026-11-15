import { CheckIcon, EnvelopeOpenIcon, FileTextIcon, PaperPlaneTiltIcon, PaperclipIcon, ScalesIcon, XIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { useLoja } from '@/ambiente/loja'
import { useAcao } from '@/components/kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CampoEscolha, CampoTexto, Segmentado } from '@/components/ui/formulario'
import type { Contexto } from '@/nucleo/permissoes'
import { comoAtor, repos } from '@/nucleo/repositorios'
import { ConversaContratante, estadoRevisao, rotuloDepto } from './Contratantes'
import { agoraBpo, hojeBpo, quando, useContratantes } from './dados'
import { GavetaContestacao, qtdUnidade } from './GestaoBpo'
import { useVariaveisContratante } from './ModuloBpo'
import { rotuloBola, slaDe } from './OperacaoBpo'
import { COMPETENCIA_FECHAR, RelatorioContratante, rotuloCompetencia, siglaDe } from './RelatorioBpo'

type Aba = 'inicio' | 'fila' | 'aprovacoes' | 'relatorios' | 'volume' | 'conversa'
const rotuloPapel = (p: string) => (p === 'responsavel_tecnico' ? 'responsável técnico' : p === 'socio' ? 'sócio' : 'equipe')

/**
 * S08-A44 · Portal do convidado do contratante (10, 4.1.1): o escritório
 * contratante entra no sistema do BPO com a marca dele. Vê a fila
 * compartilhada (e manda o que falta), as revisões (se for o responsável
 * técnico), o relatório e o SLA dele, o extrato de volume com contestação e a
 * conversa com a equipe. Nunca vê custo, horas, margem, comentários internos
 * nem dado de outro contratante. Sem preço por usuário.
 *
 * Na demonstração abre por cima do sistema, com o tema do contratante,
 * escolhendo como qual convidado entrar; quem ainda não aceitou o convite cai
 * no primeiro acesso.
 */
export function PortalConvidado({ contratanteId, onFechar }: { contratanteId: string; onFechar: () => void }) {
  const contratantes = useContratantes()
  const c = contratantes.find((x) => x.id === contratanteId)
  const estilo = useVariaveisContratante(c?.tema_id)
  const loja = useLoja()
  const executar = useAcao()
  const ativos = c?.convidados.filter((g) => g.situacao !== 'desativado') ?? []
  const [quem, setQuem] = useState(ativos.find((g) => g.situacao === 'ativo')?.id ?? ativos[0]?.id ?? '')
  const [aba, setAba] = useState<Aba>('inicio')
  const [pedido, setPedido] = useState({ empresa: c?.clientes_finais[0]?.nome ?? '', texto: '', prazo: '', anexos: false })
  const [ajuste, setAjuste] = useState<Record<string, string>>({})
  const [contestar, setContestar] = useState(false)
  const [relatorio, setRelatorio] = useState<string | null>(null)
  if (!c) return null
  const g = ativos.find((x) => x.id === quem) ?? ativos[0]
  const rt = g?.papel === 'responsavel_tecnico'
  const ctx: Contexto = { ator: { tipo: 'pessoa_cliente', nome: `${g?.nome ?? 'Convidado'} (${c.nome})` }, origem: 'tela' }
  const como = <R,>(f: () => R) => comoAtor(ctx, f)
  const compartilhada = c.fila.filter((f) => f.visibilidade === 'compartilhada')
  const revisoes = compartilhada.filter((f) => f.tipo === 'revisao')
  const pendentesRt = revisoes.filter((f) => f.bola === 'contratante')
  const comVoces = compartilhada.filter((f) => f.bola === 'contratante' && f.tipo !== 'revisao')
  const avisarBpo = (titulo: string, abaBpo = 'aprovacoes') => loja.avisar({ para: [], tipo: 'cliente', setor: 'bpo_financeiro', titulo, detalhe: c.nome, destino: { modulo: 'bpo', aba: abaBpo } })
  const primeiroAcesso = g?.situacao === 'convidado'

  const decidirRevisao = (id: string, aprovar: boolean) => {
    const f = compartilhada.find((x) => x.id === id)
    if (!f || !g) return
    const comentario = ajuste[id]?.trim()
    const ok = como(() =>
      executar(
        () => repos.bpo.fila.atualizar(f.id, { bola: 'bpo', detalhe: aprovar ? `${g.nome} aprovou: pode transmitir${comentario ? ` (${comentario})` : ''}` : `${g.nome} pediu ajuste: ${comentario}`, extras: { ...f.extras, revisao: aprovar ? 'aprovada' : 'ajuste', decidida_por: g.nome, decidida_em: agoraBpo() } }, { ferramenta: 'bpo.revisao.decidir', texto: aprovar ? `${g.nome} (responsável técnico de ${c.nome}) aprovou: pode transmitir ${f.texto}` : `${g.nome} pediu ajuste em ${f.texto}: ${comentario}` }),
        { sucesso: aprovar ? 'Revisão aprovada: a equipe pode transmitir' : 'Ajuste pedido à equipe' },
      ),
    )
    if (ok) avisarBpo(aprovar ? `${g.nome} aprovou a revisão: pode transmitir` : `${g.nome} pediu ajuste numa revisão`)
  }

  return (
    <div role="dialog" aria-modal="true" aria-label={`Portal do convidado de ${c.nome}`} className="bg-background text-foreground fixed inset-0 z-50 flex flex-col overflow-hidden" style={estilo}>
      <header className="border-border/70 flex flex-wrap items-center gap-x-3 gap-y-2 border-b px-4 py-3 sm:px-6">
        <span className="bg-primary text-primary-foreground flex size-9 shrink-0 items-center justify-center rounded-md text-sm font-medium" aria-hidden>
          {siglaDe(c.nome)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{c.nome}</span>
          <span className="text-muted-foreground block truncate text-xs">Portal de acompanhamento · {c.escopo_mae.map((d) => rotuloDepto[d] ?? d).join(', ')}</span>
        </span>
        <Button size="sm" variant="ghost" className="rounded-full sm:order-last" onClick={onFechar} aria-label="Sair do portal">
          <XIcon /> <span className="hidden sm:inline">Sair</span>
        </Button>
        <span className="flex w-full items-center gap-2 sm:w-auto">
          <span className="min-w-0 flex-1 sm:w-60 sm:flex-none">
            <CampoEscolha rotulo="Entrar como (demonstração)" valor={g?.id ?? ''} onMudar={setQuem} opcoes={ativos.map((x) => ({ valor: x.id, rotulo: `${x.nome} · ${rotuloPapel(x.papel)}${x.situacao === 'convidado' ? ' (convite)' : ''}` }))} />
          </span>
          <Badge variant="outline">demonstração</Badge>
        </span>
      </header>
      {!g ? (
        <main className="flex flex-1 items-center justify-center p-6 text-center text-sm">Nenhum convidado ativo neste contratante. O Administrador do BPO convida em Configuração.</main>
      ) : primeiroAcesso ? (
        <main className="flex flex-1 items-center justify-center overflow-y-auto p-4">
          <section className="bg-surface shadow-cartao flex w-full max-w-md flex-col gap-3 rounded-cartao p-5" aria-label="Primeiro acesso">
            <EnvelopeOpenIcon className="size-8" />
            <h1 className="text-xl font-light">Olá, {g.nome.split(' ')[0]}. Você foi convidado por {c.nome}.</h1>
            <p className="text-muted-foreground text-sm">Aqui você acompanha a fila e o SLA, manda pedidos e documentos{g.papel === 'responsavel_tecnico' ? ', aprova as revisões antes da transmissão' : ''} e lê os relatórios do mês. Seu acesso é pessoal e fica registrado.</p>
            <p className="text-muted-foreground text-xs">Você vê só os dados de {c.nome}. Sem custo para você: o convite não tem preço por usuário.</p>
            <Button
              className="rounded-full"
              onClick={() => {
                const ok = executar(() => repos.bpo.convidados.atualizar(g.id, { situacao: 'ativo' }, { ferramenta: 'bpo.convidado.convidar', texto: `${g.nome} aceitou o convite e entrou no portal de ${c.nome}` }), { sucesso: 'Convite aceito. Bem-vindo ao portal.' })
                if (ok) avisarBpo(`${g.nome} aceitou o convite do portal`, 'configuracao')
              }}
            >
              <CheckIcon /> Aceitar o convite e entrar
            </Button>
          </section>
        </main>
      ) : (
        <>
          <nav className="overflow-x-auto px-4 pt-3 sm:px-6">
            <Segmentado
              rotulo="Seções do portal"
              valor={aba}
              onMudar={setAba}
              opcoes={[
                { valor: 'inicio', rotulo: 'Início' },
                { valor: 'fila', rotulo: `Fila${comVoces.length ? ` (${comVoces.length})` : ''}` },
                { valor: 'aprovacoes', rotulo: `Revisões${revisoes.length ? ` (${pendentesRt.length})` : ''}` },
                { valor: 'relatorios', rotulo: 'Relatório e SLA' },
                { valor: 'volume', rotulo: 'Volume' },
                { valor: 'conversa', rotulo: 'Conversa' },
              ]}
            />
          </nav>
          <main className="flex-1 overflow-y-auto px-4 pt-4 pb-10 sm:px-6">
            <div className="mx-auto flex max-w-4xl flex-col gap-4">
              {aba === 'inicio' && (
                <>
                  <h1 className="text-2xl font-light">Olá, {g.nome.split(' ')[0]}</h1>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {[
                      { v: `${c.sla_mes}%`, r: 'no prazo este mês' },
                      { v: compartilhada.filter((f) => f.bola === 'bpo').length, r: 'com a equipe' },
                      { v: compartilhada.filter((f) => f.bola === 'contratante' || f.bola === 'cliente_final').length, r: 'esperando vocês ou o cliente' },
                      { v: pendentesRt.length, r: 'revisões para aprovar' },
                    ].map((x) => (
                      <div key={x.r} className="bg-surface shadow-cartao flex flex-col rounded-cartao p-3">
                        <span className="text-2xl font-light tabular-nums">{x.v}</span>
                        <span className="text-muted-foreground text-xs">{x.r}</span>
                      </div>
                    ))}
                  </div>
                  {rt && pendentesRt.length > 0 && (
                    <button type="button" className="bg-surface shadow-cartao flex cursor-pointer items-center gap-3 rounded-cartao p-4 text-left text-sm" onClick={() => setAba('aprovacoes')}>
                      <span className="flex-1">
                        {pendentesRt.length} revisão(ões) esperando o seu “pode transmitir”
                        <span className="text-muted-foreground block text-xs">{pendentesRt.map((f) => `${f.texto} até ${quando(f.prazo_legal ?? f.prazo)}`).join(' · ')}</span>
                      </span>
                      <Badge variant="destaque">revisar</Badge>
                    </button>
                  )}
                  <section className="bg-surface shadow-cartao flex flex-col gap-2 rounded-cartao p-4">
                    <h2 className="text-sm font-medium">Enviar um pedido</h2>
                    {c.clientes_finais.length === 0 ? (
                      <p className="text-muted-foreground text-sm">A equipe ainda está importando as suas empresas.</p>
                    ) : (
                      <>
                        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_10rem]">
                          <CampoEscolha rotulo="Empresa do pedido" valor={pedido.empresa} onMudar={(v) => setPedido((x) => ({ ...x, empresa: v }))} opcoes={c.clientes_finais.map((f) => ({ valor: f.nome, rotulo: f.nome }))} />
                          <CampoTexto aria-label="Pedido" valor={pedido.texto} onMudar={(v) => setPedido((x) => ({ ...x, texto: v }))} placeholder="Ex.: Admissão de fulano em 01/12" />
                          <CampoTexto aria-label="Prazo do pedido" tipo="date" valor={pedido.prazo} onMudar={(v) => setPedido((x) => ({ ...x, prazo: v }))} />
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <label className="flex flex-1 items-center gap-2 text-sm">
                            <input type="checkbox" className="accent-foreground size-4" checked={pedido.anexos} onChange={(ev) => setPedido((x) => ({ ...x, anexos: ev.target.checked }))} />
                            <PaperclipIcon className="size-4" /> Documentos do cliente final anexados
                          </label>
                          <Button
                            className="rounded-full"
                            disabled={!pedido.texto.trim()}
                            onClick={() => {
                              const ok = como(() => executar(() => repos.bpo.fila.criarPedido({ subinquilino_id: c.id, cliente_final: pedido.empresa, departamento: c.escopo_mae[0], tipo: 'pedido', texto: pedido.texto.trim(), codigo: 'BPO-009', canal: 'portal', prazo: pedido.prazo || hojeBpo, bola: 'bpo', responsavel_nome: 'Lucas Prado', faltando: pedido.anexos ? [] : ['documentos do cliente final'], sla_meta_h: c.contrato.sla_h, visibilidade: 'compartilhada' }), { sucesso: pedido.anexos ? 'Pedido completo: o prazo começou a contar.' : 'Pedido enviado. Falta o documento: o prazo começa quando estiver completo.' }))
                              if (ok) {
                                avisarBpo(`${g.nome} enviou um pedido pelo portal`, 'fila')
                                setPedido((x) => ({ ...x, texto: '', prazo: '', anexos: false }))
                              }
                            }}
                          >
                            <PaperPlaneTiltIcon /> Enviar
                          </Button>
                        </div>
                      </>
                    )}
                  </section>
                </>
              )}

              {aba === 'fila' && (
                <section className="bg-surface shadow-cartao flex flex-col rounded-cartao p-4">
                  <h2 className="mb-2 text-sm font-medium">Fila compartilhada</h2>
                  <ul className="divide-border/70 flex flex-col divide-y" aria-label="Fila compartilhada">
                    {compartilhada.length === 0 && <li className="text-muted-foreground py-3 text-sm">Nada na fila.</li>}
                    {[...compartilhada]
                      .sort((a, b) => a.prazo.localeCompare(b.prazo))
                      .map((f) => (
                        <li key={f.id} className="flex flex-wrap items-center gap-2 py-2.5 text-sm">
                          <span className="min-w-0 flex-1 basis-56">
                            <span className="block">{f.texto}</span>
                            <span className="text-muted-foreground block text-xs">
                              {f.cliente_final} · prazo {quando(f.prazo)}
                              {f.faltando.length > 0 && ` · falta ${f.faltando.join(', ')}`}
                            </span>
                            <span className="text-muted-foreground block text-xs">{slaDe(f).texto}</span>
                          </span>
                          <Badge variant={f.bola === 'bpo' ? 'outline' : 'destaque'}>{f.bola === 'bpo' ? 'com a equipe' : rotuloBola[f.bola].replace('com o contratante', 'com vocês')}</Badge>
                          {f.faltando.length > 0 &&
                            f.faltando.map((x) => (
                              <Button key={x} size="sm" variant="outline" className="rounded-full" onClick={() => (como(() => executar(() => repos.bpo.fila.atualizar(f.id, { faltando: f.faltando.filter((y) => y !== x), ...(f.faltando.length === 1 ? { sla_inicio: agoraBpo(), bola: 'bpo' as const } : {}) }, { ferramenta: 'fila.responder', texto: `${g.nome} mandou pelo portal: ${x}` }), { sucesso: `Enviado: ${x}` })), avisarBpo(`${g.nome} mandou ${x} pelo portal`, 'fila'))}>
                                <PaperclipIcon /> Enviar {x}
                              </Button>
                            ))}
                          {f.faltando.length === 0 && f.bola === 'contratante' && f.tipo !== 'revisao' && (
                            <Button size="sm" variant="outline" className="rounded-full" onClick={() => (como(() => executar(() => repos.bpo.fila.atualizar(f.id, { bola: 'bpo' }, { ferramenta: 'fila.responder', texto: `${g.nome} respondeu pelo portal: “${f.texto}” volta para a equipe (o SLA volta a correr)` }), { sucesso: 'Respondido: a bola voltou para a equipe' })), avisarBpo(`${g.nome} respondeu pelo portal`, 'fila'))}>
                              <CheckIcon /> Já resolvemos
                            </Button>
                          )}
                        </li>
                      ))}
                  </ul>
                </section>
              )}

              {aba === 'aprovacoes' && (
                <section className="flex flex-col gap-3">
                  {!rt && <p className="bg-sunken/60 text-muted-foreground rounded-lg px-4 py-3 text-sm">Só o responsável técnico aprova as revisões. Você acompanha.</p>}
                  {revisoes.length === 0 && <p className="text-muted-foreground text-sm">Nenhuma revisão.</p>}
                  {revisoes.map((f) => {
                    const pendente = f.bola === 'contratante'
                    const est = estadoRevisao(f)
                    return (
                      <div key={f.id} className="bg-surface shadow-cartao flex flex-col gap-2 rounded-cartao p-4">
                        <span className="text-sm font-medium">{f.texto}</span>
                        <span className="text-muted-foreground text-xs">
                          {f.cliente_final} · {f.codigo} · prazo legal {quando(f.prazo_legal ?? f.prazo)}
                        </span>
                        <span className="text-xs">{(f.extras?.resumo as string | undefined) ?? f.detalhe}</span>
                        {typeof f.extras?.hash === 'string' && <span className="text-muted-foreground text-[11px]">entrega ligada pelo hash {f.extras.hash}</span>}
                        {pendente && rt ? (
                          <div className="flex flex-col gap-2">
                            <CampoTexto aria-label="Comentário da revisão" valor={ajuste[f.id] ?? ''} onMudar={(v) => setAjuste((x) => ({ ...x, [f.id]: v }))} placeholder="Comentário (obrigatório para pedir ajuste)" />
                            <div className="flex flex-wrap gap-2">
                              <Button size="sm" className="rounded-full" onClick={() => decidirRevisao(f.id, true)}>
                                <CheckIcon /> Pode transmitir
                              </Button>
                              <Button size="sm" variant="outline" className="rounded-full" disabled={!ajuste[f.id]?.trim()} onClick={() => decidirRevisao(f.id, false)}>
                                Pedir ajuste
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Badge className="w-fit" variant={pendente ? 'destaque' : est === 'ajuste' ? 'outline' : 'sucesso'}>
                            {pendente ? 'aguardando o responsável técnico' : est === 'preparando' ? 'a equipe está preparando' : 'decidida'}
                          </Badge>
                        )}
                      </div>
                    )
                  })}
                </section>
              )}

              {aba === 'relatorios' && (
                <section className="bg-surface shadow-cartao flex flex-col gap-2 rounded-cartao p-4 text-sm">
                  <h2 className="text-sm font-medium">Relatório e SLA</h2>
                  <span>
                    SLA do mês: <strong className="font-medium">{c.sla_mes}%</strong> no prazo (contrato: {c.contrato.sla_h} h por pedido completo)
                  </span>
                  <ul className="flex flex-col gap-1.5" aria-label="Relatórios do mês">
                    {c.entregas.length === 0 && <li className="text-muted-foreground">O relatório do mês chega aqui até o dia 5.</li>}
                    {c.entregas.map((e) => (
                      <li key={e.id} className="flex items-center gap-2">
                        <FileTextIcon className="text-muted-foreground size-4" />
                        <span className="flex-1">Relatório de {rotuloCompetencia(e.competencia)}</span>
                        {e.situacao === 'enviado' ? (
                          <Button size="sm" variant="outline" className="rounded-full" onClick={() => setRelatorio(e.id)}>
                            Abrir
                          </Button>
                        ) : (
                          <Badge variant="outline">em preparação</Badge>
                        )}
                      </li>
                    ))}
                  </ul>
                  <span className="text-muted-foreground text-xs">Cada desvio vem explicado: do lado de vocês (bola com vocês ou com o cliente final) ou da equipe.</span>
                </section>
              )}

              {aba === 'volume' &&
                (c.volume ? (
                  <section className="bg-surface shadow-cartao flex flex-col gap-2 rounded-cartao p-4 text-sm">
                    <h2 className="text-sm font-medium">Extrato de volume · {c.volume.competencia}</h2>
                    <ul className="flex flex-col gap-1" aria-label="Extrato de volume">
                      {c.volume.itens.map((i) => (
                        <li key={i.unidade} className="flex gap-2">
                          <span className="flex-1">{i.unidade}</span>
                          <span className="tabular-nums">{i.quantidade.toLocaleString('pt-BR')}</span>
                        </li>
                      ))}
                    </ul>
                    {c.volume.contestacoes.map((x) => (
                      <span key={x.id} className="text-muted-foreground flex items-center gap-1.5 text-xs">
                        <ScalesIcon /> {qtdUnidade(x.quantidade, x.unidade)}: {x.motivo} · {x.situacao === 'aberta' ? 'em análise' : x.situacao === 'aceita' ? 'aceita (sai da fatura)' : 'recusada'}
                      </span>
                    ))}
                    {c.volume.situacao !== 'faturado' ? (
                      <Button size="sm" variant="outline" className="w-fit rounded-full" onClick={() => setContestar(true)}>
                        <ScalesIcon /> Contestar um item
                      </Button>
                    ) : (
                      <Badge variant="sucesso" className="w-fit">
                        faturado
                      </Badge>
                    )}
                    <span className="text-muted-foreground text-xs">Sem preço por usuário. Este extrato vira fatura depois do prazo de contestação.</span>
                  </section>
                ) : (
                  <p className="text-muted-foreground text-sm">O extrato do mês aparece aqui quando houver entregas.</p>
                ))}

              {aba === 'conversa' && (
                <section className="bg-surface shadow-cartao flex flex-col gap-2 rounded-cartao p-4">
                  <h2 className="text-sm font-medium">Conversa com a equipe</h2>
                  <ConversaContratante c={c} lado="contratante" nome={g.nome} />
                </section>
              )}
            </div>
          </main>
        </>
      )}
      {contestar && c.volume && (
        <GavetaContestacao
          titulo={`Contestar o extrato de ${rotuloCompetencia(`${c.volume.competencia}`)}`}
          v={c.volume}
          onFechar={() => setContestar(false)}
          aoRegistrar={(x) => {
            const v = c.volume!
            const ok = como(() => executar(() => repos.bpo.volumes.atualizar(v.id, { situacao: 'contestado', contestacoes: [...v.contestacoes, { id: `ct${Date.now().toString(36)}`, ...x, por: g?.nome ?? 'convidado', situacao: 'aberta' }] }, { ferramenta: 'bpo.volume.contestar', texto: `${g?.nome} contestou o volume de ${c.nome}: ${x.quantidade} ${x.unidade} (${x.motivo})` }), { sucesso: 'Contestação enviada; a fatura espera a resposta' }))
            if (ok) avisarBpo(`${c.nome} contestou o extrato de volume`, 'volume')
            return !!ok
          }}
        />
      )}
      {relatorio && <RelatorioContratante c={c} entrega={c.entregas.find((e) => e.id === relatorio) ?? c.entregas.find((e) => e.competencia === COMPETENCIA_FECHAR)} aberto onFechar={() => setRelatorio(null)} />}
    </div>
  )
}

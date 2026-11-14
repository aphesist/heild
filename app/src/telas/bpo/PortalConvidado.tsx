import { CheckIcon, PaperPlaneTiltIcon, ScalesIcon, XIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { useLoja } from '@/ambiente/loja'
import { useAcao } from '@/components/kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CampoEscolha, CampoTexto, Segmentado } from '@/components/ui/formulario'
import { cn } from '@/lib/utils'
import type { Contexto } from '@/nucleo/permissoes'
import { comoAtor, repos } from '@/nucleo/repositorios'
import { hojeBpo, quando, useContratantes } from './dados'
import { useVariaveisContratante } from './ModuloBpo'
import { rotuloBola, slaDe } from './OperacaoBpo'
import { rotuloDepto } from './Contratantes'

type Aba = 'inicio' | 'fila' | 'aprovacoes' | 'relatorios' | 'volume'

/**
 * S08-A44 · Portal do convidado do contratante (10, 4.1.1): o escritório
 * contratante entra no sistema do BPO com a marca dele. Vê a fila
 * compartilhada, as revisões (se for o responsável técnico), o relatório e o
 * SLA dele, e o extrato de volume com contestação. Nunca vê custo, horas,
 * margem, comentários internos nem dado de outro contratante.
 *
 * Na demonstração abre por cima do sistema, com o tema do contratante,
 * escolhendo como qual convidado entrar.
 */
export function PortalConvidado({ contratanteId, onFechar }: { contratanteId: string; onFechar: () => void }) {
  const contratantes = useContratantes()
  const c = contratantes.find((x) => x.id === contratanteId)
  const estilo = useVariaveisContratante(c?.tema_id)
  const loja = useLoja()
  const executar = useAcao()
  const ativos = c?.convidados.filter((g) => g.situacao !== 'desativado') ?? []
  const [quem, setQuem] = useState(ativos[0]?.id ?? '')
  const [aba, setAba] = useState<Aba>('inicio')
  const [pedido, setPedido] = useState({ empresa: c?.clientes_finais[0]?.nome ?? '', texto: '', prazo: '' })
  const [ajuste, setAjuste] = useState<Record<string, string>>({})
  const [contestacao, setContestacao] = useState('')
  if (!c) return null
  const g = ativos.find((x) => x.id === quem) ?? ativos[0]
  const rt = g?.papel === 'responsavel_tecnico'
  const ctx: Contexto = { ator: { tipo: 'pessoa_cliente', nome: `${g?.nome ?? 'Convidado'} (${c.nome})` }, origem: 'tela' }
  const como = <R,>(f: () => R) => comoAtor(ctx, f)
  const compartilhada = c.fila.filter((f) => f.visibilidade === 'compartilhada')
  const revisoes = compartilhada.filter((f) => f.tipo === 'revisao')
  const sigla = c.nome.split(' ').filter((p) => p.length > 2).slice(0, 2).map((p) => p[0]).join('').toUpperCase()
  const avisarBpo = (titulo: string) => loja.avisar({ para: [], tipo: 'cliente', setor: 'bpo_financeiro', titulo, detalhe: c.nome, destino: { modulo: 'bpo', aba: 'aprovacoes' } })

  return (
    <div role="dialog" aria-modal="true" aria-label={`Portal do convidado de ${c.nome}`} className="bg-background text-foreground fixed inset-0 z-50 flex flex-col overflow-hidden" style={estilo}>
      <header className="border-border/70 flex flex-wrap items-center gap-3 border-b px-4 py-3 sm:px-6">
        <span className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-[10px] text-sm font-medium" aria-hidden>
          {sigla}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{c.nome}</span>
          <span className="text-muted-foreground block text-xs">Portal de acompanhamento · {c.escopo_mae.map((d) => rotuloDepto[d] ?? d).join(', ')}</span>
        </span>
        <span className="w-56">
          <CampoEscolha rotulo="Entrar como (demonstração)" valor={g?.id ?? ''} onMudar={setQuem} opcoes={ativos.map((x) => ({ valor: x.id, rotulo: `${x.nome} · ${x.papel === 'responsavel_tecnico' ? 'responsável técnico' : x.papel === 'socio' ? 'sócio' : 'equipe'}` }))} />
        </span>
        <Badge variant="outline">demonstração</Badge>
        <Button size="sm" variant="ghost" className="rounded-full" onClick={onFechar} aria-label="Sair do portal">
          <XIcon /> Sair
        </Button>
      </header>
      <nav className="px-4 pt-3 sm:px-6">
        <Segmentado
          rotulo="Seções do portal"
          valor={aba}
          onMudar={setAba}
          opcoes={[
            { valor: 'inicio', rotulo: 'Início' },
            { valor: 'fila', rotulo: 'Fila' },
            { valor: 'aprovacoes', rotulo: `Revisões${revisoes.length ? ` (${revisoes.filter((f) => f.bola === 'contratante').length})` : ''}` },
            { valor: 'relatorios', rotulo: 'Relatório e SLA' },
            { valor: 'volume', rotulo: 'Volume' },
          ]}
        />
      </nav>
      <main className="flex-1 overflow-y-auto px-4 pt-4 pb-10 sm:px-6">
        <div className="mx-auto flex max-w-4xl flex-col gap-4">
          {aba === 'inicio' && (
            <>
              <h1 className="text-2xl font-light">Olá, {g?.nome.split(' ')[0]}</h1>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  { v: `${c.sla_mes}%`, r: 'no prazo este mês' },
                  { v: compartilhada.filter((f) => f.bola === 'bpo').length, r: 'com a equipe' },
                  { v: compartilhada.filter((f) => f.bola === 'contratante' || f.bola === 'cliente_final').length, r: 'esperando vocês ou o cliente' },
                  { v: revisoes.filter((f) => f.bola === 'contratante').length, r: 'revisões para aprovar' },
                ].map((x) => (
                  <div key={x.r} className="bg-surface shadow-cartao flex flex-col rounded-[18px] p-3">
                    <span className="text-2xl font-light tabular-nums">{x.v}</span>
                    <span className="text-muted-foreground text-xs">{x.r}</span>
                  </div>
                ))}
              </div>
              <section className="bg-surface shadow-cartao flex flex-col gap-2 rounded-[20px] p-4">
                <h2 className="text-sm font-medium">Enviar um pedido</h2>
                <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_10rem_auto]">
                  <CampoEscolha rotulo="Empresa do pedido" valor={pedido.empresa} onMudar={(v) => setPedido((x) => ({ ...x, empresa: v }))} opcoes={c.clientes_finais.map((f) => ({ valor: f.nome, rotulo: f.nome }))} />
                  <CampoTexto aria-label="Pedido" valor={pedido.texto} onMudar={(v) => setPedido((x) => ({ ...x, texto: v }))} placeholder="Ex.: Admissão de fulano em 01/12" />
                  <CampoTexto aria-label="Prazo do pedido" tipo="date" valor={pedido.prazo} onMudar={(v) => setPedido((x) => ({ ...x, prazo: v }))} />
                  <Button
                    className="rounded-full"
                    disabled={!pedido.texto.trim()}
                    onClick={() => {
                      const ok = como(() => executar(() => repos.bpo.fila.criarPedido({ subinquilino_id: c.id, cliente_final: pedido.empresa, departamento: c.escopo_mae[0], tipo: 'pedido', texto: pedido.texto.trim(), codigo: 'BPO-009', canal: 'portal', prazo: pedido.prazo || hojeBpo, bola: 'bpo', responsavel_nome: 'Lucas Prado', faltando: ['documentos do cliente final'], sla_meta_h: c.contrato.sla_h, visibilidade: 'compartilhada' }), { sucesso: 'Pedido enviado. A equipe confere se tem tudo: o prazo começa quando estiver completo.' }))
                      if (ok) {
                        avisarBpo(`${g?.nome} enviou um pedido pelo portal`)
                        setPedido((x) => ({ ...x, texto: '', prazo: '' }))
                      }
                    }}
                  >
                    <PaperPlaneTiltIcon /> Enviar
                  </Button>
                </div>
              </section>
            </>
          )}

          {aba === 'fila' && (
            <section className="bg-surface shadow-cartao flex flex-col rounded-[20px] p-4">
              <h2 className="mb-2 text-sm font-medium">Fila compartilhada</h2>
              <ul className="divide-border/70 flex flex-col divide-y" aria-label="Fila compartilhada">
                {compartilhada.length === 0 && <li className="text-muted-foreground py-3 text-sm">Nada na fila.</li>}
                {[...compartilhada].sort((a, b) => a.prazo.localeCompare(b.prazo)).map((f) => (
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
                  </li>
                ))}
              </ul>
            </section>
          )}

          {aba === 'aprovacoes' && (
            <section className="flex flex-col gap-3">
              {!rt && <p className="bg-sunken/60 text-muted-foreground rounded-[14px] px-4 py-3 text-sm">Só o responsável técnico aprova as revisões. Você acompanha.</p>}
              {revisoes.length === 0 && <p className="text-muted-foreground text-sm">Nenhuma revisão.</p>}
              {revisoes.map((f) => {
                const pendente = f.bola === 'contratante'
                return (
                  <div key={f.id} className="bg-surface shadow-cartao flex flex-col gap-2 rounded-[20px] p-4">
                    <span className="text-sm font-medium">{f.texto}</span>
                    <span className="text-muted-foreground text-xs">
                      {f.cliente_final} · {f.codigo} · prazo legal {quando(f.prazo_legal ?? f.prazo)}
                    </span>
                    <span className="text-muted-foreground text-xs">{f.detalhe}</span>
                    {pendente && rt ? (
                      <div className="flex flex-col gap-2">
                        <CampoTexto aria-label="Comentário da revisão" valor={ajuste[f.id] ?? ''} onMudar={(v) => setAjuste((x) => ({ ...x, [f.id]: v }))} placeholder="Comentário (obrigatório para pedir ajuste)" />
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            className="rounded-full"
                            onClick={() => {
                              const ok = como(() => executar(() => repos.bpo.fila.atualizar(f.id, { bola: 'bpo', detalhe: `${g?.nome} aprovou: pode transmitir${ajuste[f.id] ? ` (${ajuste[f.id]})` : ''}` }, { ferramenta: 'bpo.revisao.decidir', texto: `${g?.nome} (responsável técnico de ${c.nome}) aprovou: pode transmitir ${f.texto}` }), { sucesso: 'Revisão aprovada: a equipe pode transmitir' }))
                              if (ok) avisarBpo(`${g?.nome} aprovou a revisão: pode transmitir`)
                            }}
                          >
                            <CheckIcon /> Pode transmitir
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-full"
                            disabled={!ajuste[f.id]?.trim()}
                            onClick={() => {
                              const ok = como(() => executar(() => repos.bpo.fila.atualizar(f.id, { bola: 'bpo', detalhe: `${g?.nome} pediu ajuste: ${ajuste[f.id]}` }, { ferramenta: 'bpo.revisao.decidir', texto: `${g?.nome} pediu ajuste em ${f.texto}: ${ajuste[f.id]}` }), { sucesso: 'Ajuste pedido à equipe' }))
                              if (ok) avisarBpo(`${g?.nome} pediu ajuste numa revisão`)
                            }}
                          >
                            Pedir ajuste
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Badge className="w-fit" variant={pendente ? 'destaque' : 'sucesso'}>
                        {pendente ? 'aguardando o responsável técnico' : 'decidida'}
                      </Badge>
                    )}
                  </div>
                )
              })}
            </section>
          )}

          {aba === 'relatorios' && (
            <section className="bg-surface shadow-cartao flex flex-col gap-2 rounded-[20px] p-4 text-sm">
              <h2 className="text-sm font-medium">Relatório e SLA</h2>
              <span>
                SLA do mês: <strong className="font-medium">{c.sla_mes}%</strong> no prazo (contrato: {c.contrato.sla_h} h por pedido completo)
              </span>
              <ul className="flex flex-col gap-1">
                {c.entregas.map((e) => (
                  <li key={e.id} className="flex items-center gap-2">
                    <span className="flex-1">Relatório de {e.competencia.slice(5, 7)}/{e.competencia.slice(0, 4)}</span>
                    <Badge variant={e.situacao === 'enviado' ? 'sucesso' : 'outline'}>{e.situacao === 'enviado' ? 'disponível' : 'em preparação'}</Badge>
                  </li>
                ))}
              </ul>
              <span className="text-muted-foreground text-xs">Cada desvio vem explicado: do lado de vocês (bola com vocês ou com o cliente final) ou da equipe.</span>
            </section>
          )}

          {aba === 'volume' && c.volume && (
            <section className="bg-surface shadow-cartao flex flex-col gap-2 rounded-[20px] p-4 text-sm">
              <h2 className="text-sm font-medium">Extrato de volume · {c.volume.competencia}</h2>
              <ul className="flex flex-col gap-1">
                {c.volume.itens.map((i) => (
                  <li key={i.unidade} className="flex gap-2">
                    <span className="flex-1">{i.unidade}</span>
                    <span className="tabular-nums">{i.quantidade.toLocaleString('pt-BR')}</span>
                  </li>
                ))}
              </ul>
              {c.volume.contestacoes.map((x) => (
                <span key={x.id} className="text-muted-foreground flex items-center gap-1.5 text-xs">
                  <ScalesIcon /> {x.quantidade} {x.unidade}: {x.motivo} · {x.situacao}
                </span>
              ))}
              {c.volume.situacao !== 'faturado' && (
                <div className={cn('flex flex-wrap gap-2')}>
                  <CampoTexto aria-label="Motivo da contestação" valor={contestacao} onMudar={setContestacao} placeholder="Contestar um item (ex.: rescisão contada duas vezes)" className="min-w-60 flex-1" />
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    disabled={!contestacao.trim()}
                    onClick={() => {
                      const v = c.volume!
                      const ok = como(() => executar(() => repos.bpo.volumes.atualizar(v.id, { situacao: 'contestado', contestacoes: [...v.contestacoes, { id: `ct${Date.now().toString(36)}`, unidade: v.itens[v.itens.length - 1].unidade, quantidade: 1, motivo: contestacao.trim(), por: g?.nome ?? 'convidado', situacao: 'aberta' }] }, { ferramenta: 'bpo.volume.contestar', texto: `${g?.nome} contestou o volume de ${c.nome}: ${contestacao.trim()}` }), { sucesso: 'Contestação enviada; a fatura espera a resposta' }))
                      if (ok) {
                        avisarBpo(`${c.nome} contestou o extrato de volume`)
                        setContestacao('')
                      }
                    }}
                  >
                    <ScalesIcon /> Contestar
                  </Button>
                </div>
              )}
              <span className="text-muted-foreground text-xs">Sem preço por usuário. Este extrato vira fatura depois do prazo de contestação.</span>
            </section>
          )}
        </div>
      </main>
    </div>
  )
}

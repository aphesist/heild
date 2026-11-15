import { DndContext, DragOverlay, KeyboardSensor, PointerSensor, TouchSensor, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { useLoja, usePersistente } from '@/ambiente/loja'
import { useConfirmar, SeloDemonstracao } from '@/components/kit'
import { repos } from '@/nucleo/repositorios'
import { ArrowClockwiseIcon, EyeIcon, LinkSimpleIcon, SparkleIcon } from '@phosphor-icons/react'
import { ChatCircleTextIcon, CheckIcon, FileTextIcon, HandshakeIcon, PlusIcon, SignatureIcon, WarningIcon, XCircleIcon } from '@phosphor-icons/react'
import { useState, type ReactNode } from 'react'
import { AreaRolagem } from '@/components/ui/area-rolagem'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ItemMenu, Menu } from '@/components/ui/menu'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Campo, CampoEscolha, CampoTexto, Fichas, GavetaFormulario, Segmentado, TextoFixo } from '@/components/ui/formulario'
import { etapasLead, metricasLeads, type EtapaLead, type Lead } from '@/dados/crm'
import { cn } from '@/lib/utils'

/**
 * CRM › Leads (04, 6): o funil como quadro, do primeiro contato à
 * implantação. Arrastar muda a etapa; "Fechar contrato" é um ato só (cria o
 * cliente, converte a pessoa, convida para o app e abre a trilha). Métricas
 * do funil na outra vista.
 */
export function LeadsTela({ leads: iniciais, onAbrirConversa }: { leads: Lead[]; onAbrirConversa?: (id: string) => void }) {
  const [leads, setLeads] = usePersistente('crm.leads', iniciais)
  const [vista, setVista] = useState<'quadro' | 'lista' | 'metricas'>('quadro')
  const visiveis = leads.filter((l) => !l.fundidoEm)
  const [arrastando, setArrastando] = useState<string | null>(null)
  const [abertoId, setAbertoId] = useState<string | null>(null)
  const [novo, setNovo] = useState(false)
  const aberto = leads.find((l) => l.id === abertoId)
  const sensores = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }), useSensor(KeyboardSensor))

  const mover = (id: string, etapa: EtapaLead, extra: Partial<Lead> = {}) => setLeads((xs) => xs.map((l) => (l.id === id ? { ...l, etapa, ...extra } : l)))

  const aoSoltar = (e: DragEndEvent) => {
    setArrastando(null)
    const destino = e.over?.id as EtapaLead | undefined
    if (!destino) return
    const id = String(e.active.id)
    // Implantação só por "Fechar contrato" (cria o cliente); Perdido pede motivo.
    if (destino === 'implantacao') return setAbertoId(id)
    mover(id, destino, destino === 'perdido' ? { motivoPerda: 'a definir' } : {})
  }

  return (
    <div className="flex h-full flex-col gap-3 px-4 pb-3 sm:px-5 sm:pb-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="bg-sunken flex rounded-full p-0.5 text-xs">
          {(['quadro', 'lista', 'metricas'] as const).map((v) => (
            <button key={v} type="button" onClick={() => setVista(v)} className={cn('cursor-pointer rounded-full px-3 py-1.5', vista === v ? 'bg-raised shadow-pilula' : 'text-muted-foreground')}>
              <TextoFixo ativo={vista === v}>{v === 'quadro' ? 'Quadro' : v === 'lista' ? 'Lista' : 'Métricas'}</TextoFixo>
            </button>
          ))}
        </div>
        <span className="text-muted-foreground text-xs">Lead conversa só pelo WhatsApp; o quadro é a outra face da conversa. A IA nunca cita preço.</span>
        <Button size="sm" variant="outline" className="ml-auto rounded-full" onClick={() => setNovo(true)}>
          <PlusIcon /> Lead
        </Button>
      </div>

      {vista === 'quadro' ? (
        <DndContext sensors={sensores} onDragStart={(e) => setArrastando(String(e.active.id))} onDragEnd={aoSoltar} onDragCancel={() => setArrastando(null)}>
          {/* O quadro é um painel de superfície (como a caixa de Conversas); as etapas são faixas divididas por linhas e os cartões ficam na camada elevada. */}
          <AreaRolagem eixo="x" className="bg-surface shadow-painel divide-border/70 flex flex-1 snap-x snap-mandatory divide-x rounded-[24px] sm:snap-proximity sm:rounded-[34px]">
            {etapasLead.map((et) => (
              <Coluna key={et.id} id={et.id} rotulo={et.rotulo} itens={visiveis.filter((l) => l.etapa === et.id)} onAbrir={setAbertoId} arrastando={arrastando} />
            ))}
          </AreaRolagem>
          <DragOverlay>{arrastando ? <CartaoLead lead={leads.find((l) => l.id === arrastando)!} className="shadow-2xl rotate-1" /> : null}</DragOverlay>
        </DndContext>
      ) : vista === 'lista' ? (
        <ListaLeads leads={visiveis} onAbrir={setAbertoId} />
      ) : (
        <Metricas />
      )}

      {novo && (
        <NovoLead
          onFechar={() => setNovo(false)}
          onCriar={(l) => {
            setLeads((xs) => [l, ...xs])
            setNovo(false)
          }}
        />
      )}

      <Sheet open={!!aberto} onOpenChange={(v) => !v && setAbertoId(null)}>
        <SheetContent className="gap-0 sm:max-w-md">
          {aberto && (
            <DetalheLead
              lead={aberto}
              onMover={(etapa, extra) => mover(aberto.id, etapa, extra)}
              onAtualizar={(patch) => setLeads((xs) => xs.map((l) => (l.id === aberto.id ? { ...l, ...patch } : l)))}
              onFechar={() => setAbertoId(null)}
              onAbrirConversa={aberto.conversaId ? () => onAbrirConversa?.(aberto.conversaId!) : undefined}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function Coluna({ id, rotulo, itens, onAbrir, arrastando }: { id: EtapaLead; rotulo: string; itens: Lead[]; onAbrir: (id: string) => void; arrastando: string | null }) {
  const { setNodeRef, isOver } = useDroppable({ id })
  return (
    <section ref={setNodeRef} aria-label={rotulo} className={cn('flex w-[85%] max-w-80 shrink-0 snap-start flex-col transition-colors sm:w-64 lg:w-auto lg:max-w-none lg:min-w-60 lg:flex-1', isOver && 'bg-sunken/70', id === 'perdido' && 'bg-sunken/30')}>
      <header className="flex items-center gap-2 px-4 pt-4 pb-3">
        <h3 className="text-sm font-medium">{rotulo}</h3>
        <span className="bg-sunken text-muted-foreground rounded-full px-2 py-0.5 text-xs font-medium tabular-nums">{itens.length}</span>
        {id === 'perdido' && <span className="text-muted-foreground ml-auto text-xs">no mês</span>}
      </header>
      <AreaRolagem className="flex-1 px-3 pb-3">
        <ul className="flex flex-col gap-2.5">
          {itens.map((l) => (
            <li key={l.id}>
              <Arrastavel id={l.id} escondido={arrastando === l.id}>
                <CartaoLead lead={l} onClick={() => onAbrir(l.id)} />
              </Arrastavel>
            </li>
          ))}
          {!itens.length && <li className="text-muted-foreground border-border rounded-[16px] border border-dashed px-3 py-6 text-center text-xs">Solte aqui</li>}
        </ul>
      </AreaRolagem>
    </section>
  )
}

function Arrastavel({ id, escondido, children }: { id: string; escondido: boolean; children: ReactNode }) {
  const { setNodeRef, attributes, listeners } = useDraggable({ id })
  return (
    <div ref={setNodeRef} {...attributes} {...listeners} className={cn('touch-none', escondido && 'opacity-30')}>
      {children}
    </div>
  )
}

function CartaoLead({ lead: l, onClick, className }: { lead: Lead; onClick?: () => void; className?: string }) {
  return (
    <button type="button" onClick={onClick} className={cn('bg-raised shadow-cartao flex w-full cursor-pointer flex-col gap-1.5 rounded-[16px] p-3 text-left', className)}>
      <span className="flex items-start gap-2">
        <span className="min-w-0 flex-1 truncate text-sm font-medium">{l.nome}</span>
        {l.prazoMin != null && (
          <span className={cn('shrink-0 rounded-full px-1.5 py-0.5 text-xs font-medium tabular-nums', l.prazoMin < 0 ? 'bg-destructive/12 text-foreground' : 'bg-warning/15')}>
            {l.prazoMin < 0 ? `−${-l.prazoMin} min` : `${l.prazoMin} min`}
          </span>
        )}
      </span>
      <span className="text-muted-foreground truncate text-xs">{l.contato.toLowerCase().includes(l.origem) ? l.contato : `${l.contato} · ${l.origem}`}</span>
      {l.qualificacao && <span className="truncate text-xs">{l.qualificacao}</span>}
      {l.valor && <span className="font-heading text-base font-light tabular-nums">{l.valor}</span>}
      {l.trilha && (
        <span className="flex items-center gap-2 text-xs">
          <span className="bg-sunken h-1.5 flex-1 overflow-hidden rounded-full">
            <span className="bg-success block h-full rounded-full" style={{ width: `${(l.trilha.feitos / l.trilha.total) * 100}%` }} />
          </span>
          trilha {l.trilha.feitos}/{l.trilha.total}
        </span>
      )}
      {l.motivoPerda && <Badge variant="outline">{l.motivoPerda}</Badge>}
      <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
        <span className="min-w-0 flex-1 truncate">{l.proxima ?? l.desde}</span>
        {l.responsavel && <span className="shrink-0">{l.responsavel.split(' ')[0]}</span>}
      </span>
    </button>
  )
}

function DetalheLead({ lead: l, onMover, onAtualizar, onFechar, onAbrirConversa }: { lead: Lead; onMover: (e: EtapaLead, extra?: Partial<Lead>) => void; onAtualizar: (patch: Partial<Lead>) => void; onFechar: () => void; onAbrirConversa?: () => void }) {
  const [confirmando, setConfirmando] = useState(false)
  const loja = useLoja()
  const confirmar = useConfirmar()
  const [qualificando, setQualificando] = useState(false)
  const [retomada, setRetomada] = useState<string | null>(null)
  const [fundir, setFundir] = useState(false)
  const docs = l.documentos ?? []
  const proposta = docs.find((d) => d.tipo === 'proposta')
  const contrato = docs.find((d) => d.tipo === 'contrato')
  const atualizarDoc = (tipo: 'proposta' | 'contrato', patch: Partial<NonNullable<Lead['documentos']>[number]>) => onAtualizar({ documentos: (l.documentos ?? []).map((d) => (d.tipo === tipo ? { ...d, ...patch } : d)) })
  const parado = /há (\d+) dias/.exec(l.desde)
  const semContato = l.etapa !== 'perdido' && l.etapa !== 'implantacao' && !!parado && Number(parado[1]) >= 3
  const fecharContrato = () => {
    // Fechar contrato cria o cliente em implantação, com a primeira versão do perfil (04, 6.2).
    let clienteId: string | undefined
    try {
      const codigo = String(800 + Math.floor(Math.random() * 99))
      clienteId = repos.clientes.criar({ tipo: 'pj', codigo, documento: l.cnpj ?? 'CNPJ a confirmar na trilha', nome: l.nome, estado_ciclo: 'em_implantacao', estado_ciclo_desde: new Date().toISOString().slice(0, 10), regime: /presumido/i.test(l.qualificacao ?? '') ? 'presumido' : /real/i.test(l.qualificacao ?? '') ? 'real' : 'simples', servicos_contratados: ['contabil'] }, { texto: `Contrato fechado: ${l.nome} virou cliente em implantação` }).id
    } catch (e) {
      loja.toastErro(e instanceof Error ? e.message : String(e))
      return
    }
    onMover('implantacao', { trilha: { feitos: 0, total: 9 }, proxima: 'trilha aberta agora', clienteId })
    loja.toast(`${l.nome} virou cliente em implantação; convite do app enviado e trilha aberta.`, { modulo: 'painel', aba: 'societario', cliente: clienteId }, 'Ver no Painel')
  }
  const etapa = etapasLead.find((e) => e.id === l.etapa)!
  return (
    <>
      <SheetHeader>
        <SheetTitle>{l.nome}</SheetTitle>
        <SheetDescription>
          {etapa.rotulo} · {l.origem} · desde {l.desde.replace('há ', 'há ')}
        </SheetDescription>
      </SheetHeader>
      <AreaRolagem className="flex flex-col gap-4 p-4 text-sm">
        <ol className="flex gap-1" aria-label="Etapas">
          {etapasLead
            .filter((e) => e.id !== 'perdido')
            .map((e, i, arr) => {
              const atual = arr.findIndex((x) => x.id === l.etapa)
              return <li key={e.id} title={e.rotulo} className={cn('h-1.5 flex-1 rounded-full', l.etapa === 'perdido' ? 'bg-sunken' : i < atual ? 'bg-success' : i === atual ? 'bg-foreground' : 'bg-sunken')} />
            })}
        </ol>
        <dl className="grid grid-cols-[7rem_1fr] gap-x-3 gap-y-1.5">
          <dt className="text-muted-foreground">Contato</dt>
          <dd>{l.contato}</dd>
          <dt className="text-muted-foreground">Responsável</dt>
          <dd>{l.responsavel ?? <span className="text-warning-text">sem responsável</span>}</dd>
          <dt className="text-muted-foreground">Qualificação</dt>
          <dd>{l.qualificacao ?? 'regime, porte, serviços e contabilidade atual: o integrante pergunta'}</dd>
          {l.servicos && (
            <>
              <dt className="text-muted-foreground">Serviços</dt>
              <dd className="flex flex-wrap gap-1">
                {l.servicos.map((s) => (
                  <Badge key={s} variant="outline">
                    {s}
                  </Badge>
                ))}
              </dd>
            </>
          )}
          {l.valor && (
            <>
              <dt className="text-muted-foreground">Proposta</dt>
              <dd className="tabular-nums">{l.valor}</dd>
            </>
          )}
          {l.proxima && (
            <>
              <dt className="text-muted-foreground">Próximo passo</dt>
              <dd>{l.proxima}</dd>
            </>
          )}
        </dl>

        {onAbrirConversa && (
          <Button size="sm" variant="outline" className="w-fit rounded-full" onClick={onAbrirConversa}>
            <ChatCircleTextIcon /> Abrir a conversa
          </Button>
        )}

        {(l.etapa === 'lead' || l.etapa === 'qualificado') && (
          <div className="flex flex-col gap-2 border-t pt-4">
            <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">Qualificação pela conversa</h3>
            {l.qualificacaoProposta ? (
              <div className="bg-primary/6 flex flex-col gap-2 rounded-[14px] p-3">
                <span className="text-muted-foreground flex items-center gap-1 text-xs">
                  <SparkleIcon className="size-3.5" /> O integrante de Atendimento preencheu pela conversa; confirme
                </span>
                <p>{l.qualificacaoProposta}</p>
                <div className="flex gap-2">
                  <Button size="sm" className="rounded-full" onClick={() => onAtualizar({ qualificacao: l.qualificacaoProposta, qualificacaoProposta: undefined, etapa: l.etapa === 'lead' ? 'qualificado' : l.etapa, proxima: 'montar proposta' })}>
                    Confirmar
                  </Button>
                  <Button size="sm" variant="ghost" className="rounded-full" onClick={() => onAtualizar({ qualificacaoProposta: undefined })}>
                    Descartar
                  </Button>
                </div>
                <SeloDemonstracao fonte="Integrante (IA)" />
              </div>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="w-fit rounded-full"
                disabled={qualificando}
                onClick={() => {
                  setQualificando(true)
                  window.setTimeout(() => {
                    setQualificando(false)
                    onAtualizar({ qualificacaoProposta: l.qualificacao ? `${l.qualificacao} · quer trocar até o fim do mês · faturamento até R$ 80 mil/mês` : 'Simples Nacional · 2 funcionários · abriu há 3 meses, ainda sem contador · quer Fiscal e DP' })
                  }, 1500)
                }}
              >
                <SparkleIcon /> {qualificando ? 'Lendo a conversa…' : 'Qualificar pela conversa'}
              </Button>
            )}
          </div>
        )}

        {(proposta || contrato) && (
          <div className="flex flex-col gap-2 border-t pt-4">
            <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">Documentos</h3>
            {[proposta, contrato].filter((d): d is NonNullable<typeof d> => !!d).map((d) => (
              <div key={d.tipo} className="bg-raised shadow-contorno flex flex-wrap items-center gap-2 rounded-[14px] px-3 py-2">
                <FileTextIcon className="text-muted-foreground size-4" />
                <span className="min-w-0 grow basis-40 truncate">{d.nome}</span>
                <Badge variant={d.situacao === 'assinado' || d.situacao === 'visto' ? 'sucesso' : d.situacao === 'rascunho' ? 'outline' : 'destaque'}>
                  {d.situacao === 'visto' && <EyeIcon />}
                  {{ rascunho: 'rascunho', enviado: 'enviado, sem abrir', visto: d.visto ?? 'visto', aguardando_assinatura: 'aguardando assinatura', assinado: 'assinado' }[d.situacao]}
                </Badge>
                {d.tipo === 'proposta' && d.situacao === 'rascunho' && (
                  <Button
                    size="sm"
                    className="rounded-full"
                    onClick={async () => {
                      if (!(await confirmar({ titulo: 'Enviar a proposta ao lead?', descricao: `${d.nome} sai pelo WhatsApp do Gestão e Atendimento, com o seu nome. A IA nunca envia proposta sozinha.`, acao: 'Aprovar e enviar' }))) return
                      atualizarDoc('proposta', { situacao: 'enviado' })
                      window.setTimeout(() => atualizarDoc('proposta', { situacao: 'visto', visto: 'visto 2 vezes · agora' }), 3500)
                    }}
                  >
                    Enviar
                  </Button>
                )}
                {d.tipo === 'contrato' && d.situacao === 'rascunho' && (
                  <Button
                    size="sm"
                    className="rounded-full"
                    onClick={() => {
                      atualizarDoc('contrato', { situacao: 'aguardando_assinatura' })
                      loja.toast('Contrato enviado ao provedor de assinatura; o lead assina pelo celular.')
                      window.setTimeout(() => {
                        atualizarDoc('contrato', { situacao: 'assinado' })
                        loja.toast(`${l.nome} assinou o contrato.`)
                      }, 4500)
                    }}
                  >
                    Enviar para assinatura
                  </Button>
                )}
              </div>
            ))}
            {contrato && <SeloDemonstracao fonte="Assinatura eletrônica" />}
          </div>
        )}

        {semContato && (
          <div className="bg-warning/10 flex flex-col gap-2 rounded-[14px] p-3">
            <span className="flex items-center gap-1.5 text-xs font-medium">
              <ArrowClockwiseIcon className="size-3.5" /> Sem contato {l.desde.replace('há ', 'há ')}: o integrante lembrou e preparou a retomada
            </span>
            {retomada ? (
              <>
                <p className="bg-raised rounded-[12px] px-3 py-2">{retomada}</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="rounded-full"
                    onClick={() => {
                      onAtualizar({ desde: 'agora', proxima: 'retomada enviada; aguardando resposta' })
                      setRetomada(null)
                      loja.toast('Retomada enviada pelo WhatsApp, com o seu nome.')
                    }}
                  >
                    Enviar
                  </Button>
                  <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setRetomada(null)}>
                    Agora não
                  </Button>
                </div>
              </>
            ) : (
              <Button size="sm" variant="outline" className="w-fit rounded-full" onClick={() => setRetomada(`Oi${l.contato.includes('·') ? `, ${l.contato.split(' ')[0]}` : ''}! Tudo bem? Passando para saber se ficou alguma dúvida sobre como podemos ajudar a ${l.nome}. Posso te ligar esta semana?`)}>
                Ver o rascunho
              </Button>
            )}
          </div>
        )}

        {l.etapa !== 'implantacao' && (
          <div className="flex flex-col gap-2 border-t pt-4">
            {fundir ? (
              <div className="bg-sunken flex flex-col gap-2 rounded-[14px] p-3">
                <p className="text-xs">O integrante achou um cliente com o mesmo telefone ou nome. Fundir junta conversas e documentos no cliente; nunca é automático.</p>
                {loja.clientes.slice(0, 4).map((k) => (
                  <Button
                    key={k.id}
                    size="sm"
                    variant="outline"
                    className="justify-start rounded-full"
                    onClick={async () => {
                      if (!(await confirmar({ titulo: `Fundir ${l.nome} com ${k.nome}?`, descricao: 'O lead sai do quadro; a conversa e os documentos passam para o cliente. Fica registrado quem decidiu.', acao: 'Fundir' }))) return
                      onAtualizar({ fundidoEm: k.id })
                      onFechar()
                      loja.toast(`${l.nome} fundido com ${k.nome}`)
                    }}
                  >
                    {k.nome}
                  </Button>
                ))}
              </div>
            ) : (
              <Button size="sm" variant="ghost" className="text-muted-foreground w-fit rounded-full" onClick={() => setFundir(true)}>
                <LinkSimpleIcon /> Este lead já é cliente?
              </Button>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2 border-t pt-4">
          <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">Próxima ação</h3>
          {l.etapa === 'lead' && <Acao icone={<CheckIcon />} titulo="Marcar como qualificado" nivel="executar" onClick={() => onMover('qualificado', { proxima: 'montar proposta' })} />}
          {l.etapa === 'qualificado' && (
            <Acao
              icone={<FileTextIcon />}
              titulo="Gerar proposta"
              nivel="preparar · a IA rascunha da qualificação e da tabela; sai sempre por pessoa"
              onClick={() => onMover('proposta', { valor: l.valor ?? 'R$ 2.400/mês', proxima: 'rascunho aguardando sua revisão', documentos: [...(l.documentos ?? []).filter((d) => d.tipo !== 'proposta'), { nome: `Proposta ${l.nome}.pdf`, tipo: 'proposta', situacao: 'rascunho' }] })}
            />
          )}
          {l.etapa === 'proposta' && <Acao icone={<SignatureIcon />} titulo="Aceite recebido: gerar contrato" nivel="preparar · assinatura por fornecedor externo" onClick={() => onMover('contrato', { proxima: 'assinatura pendente', documentos: [...(l.documentos ?? []).filter((d) => d.tipo !== 'contrato'), { nome: `Contrato de prestação ${l.nome}.pdf`, tipo: 'contrato', situacao: 'rascunho' }] })} />}
          {l.etapa === 'contrato' &&
            (confirmando ? (
              <div className="bg-sunken flex flex-col gap-2 rounded-[16px] p-3">
                <p className="font-medium">Fechar contrato faz, de uma vez:</p>
                <ul className="text-muted-foreground list-disc pl-4 text-xs">
                  <li>cria o cliente "{l.nome}" em implantação, com a primeira versão do perfil</li>
                  <li>liga conversas e documentos do lead ao cliente</li>
                  <li>converte a pessoa em sócio e envia o convite do app</li>
                  <li>abre a trilha de implantação (Societário e Atendimento)</li>
                </ul>
                <div className="flex gap-2">
                  <Button size="sm" className="rounded-full" onClick={fecharContrato}>
                    <HandshakeIcon /> Fechar contrato
                  </Button>
                  <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setConfirmando(false)}>
                    Voltar
                  </Button>
                </div>
              </div>
            ) : (
              <Acao icone={<HandshakeIcon />} titulo="Contrato assinado: fechar" nivel="executar com aprovação · irreversível" onClick={() => setConfirmando(true)} />
            ))}
          {l.etapa === 'implantacao' && <p className="text-muted-foreground text-xs">A trilha segue no Painel (Societário). Concluída, o cliente vira ativo.</p>}
          {l.etapa === 'perdido' ? (
            <Acao icone={<CheckIcon />} titulo="Reabrir lead" nivel="executar" onClick={() => onMover('lead', { motivoPerda: undefined })} />
          ) : (
            l.etapa !== 'implantacao' && (
              <Menu
                gatilho={
                  <Button size="sm" variant="ghost" className="text-muted-foreground w-fit rounded-full">
                    <XCircleIcon /> Marcar como perdido
                  </Button>
                }
              >
                {['preço', 'sem contato', 'escolheu outro', 'fora do perfil'].map((m) => (
                  <ItemMenu key={m} onClick={() => onMover('perdido', { motivoPerda: m, prazoMin: undefined })}>
                    {m}
                  </ItemMenu>
                ))}
              </Menu>
            )
          )}
          <p className="text-muted-foreground flex items-start gap-1.5 text-xs">
            <WarningIcon className="mt-0.5 size-3.5 shrink-0" /> Lead perdido fica guardado para campanhas futuras; o conteúdo das conversas some em 12 meses.
          </p>
        </div>
      </AreaRolagem>
    </>
  )
}

function Acao({ icone, titulo, nivel, onClick }: { icone: ReactNode; titulo: string; nivel: string; onClick: () => void }) {
  return (
    <Button variant="secondary" className="h-auto w-full justify-start gap-2.5 rounded-[14px] py-2 text-left whitespace-normal" onClick={onClick}>
      {icone}
      <span className="flex flex-col">
        <span className="text-sm">{titulo}</span>
        <span className="text-muted-foreground text-xs font-normal">{nivel}</span>
      </span>
    </Button>
  )
}

function Metricas() {
  const m = metricasLeads
  const topo = m.conversao[0].n
  return (
    <AreaRolagem className="min-h-0 flex-1">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Caixa titulo="Primeira resposta ao lead">
          <span className="font-heading text-4xl font-light tabular-nums">{m.primeiraResposta}</span>
          <span className="text-muted-foreground text-xs">média do mês · meta 15 min</span>
        </Caixa>
        <Caixa titulo="Honorário fechado no mês">
          <span className="font-heading text-4xl font-light tabular-nums">{m.fechadoMes}</span>
          <span className="text-muted-foreground text-xs">2 contratos</span>
        </Caixa>
        <Caixa titulo="Leads por origem">
          <ul className="flex flex-col gap-1.5">
            {m.porOrigem.map((o) => (
              <li key={o.origem} className="grid grid-cols-[5.5rem_1fr_2rem] items-center gap-2 text-sm">
                <span>{o.origem}</span>
                <span className="bg-sunken h-2 overflow-hidden rounded-full">
                  <span className="bg-foreground/60 block h-full rounded-full" style={{ width: `${(o.n / m.porOrigem[0].n) * 100}%` }} />
                </span>
                <span className="text-right tabular-nums">{o.n}</span>
              </li>
            ))}
          </ul>
        </Caixa>
        <Caixa titulo="Motivos de perda">
          <ul className="flex flex-col gap-1 text-sm">
            {m.motivosPerda.map((x) => (
              <li key={x.motivo} className="flex justify-between">
                <span>{x.motivo}</span>
                <span className="tabular-nums">{x.n}</span>
              </li>
            ))}
          </ul>
        </Caixa>
        <Caixa titulo="Conversão por etapa" className="md:col-span-2 xl:col-span-4">
          <ol className="flex flex-col gap-2">
            {m.conversao.map((c, i) => (
              <li key={c.etapa} className="grid grid-cols-[6.5rem_1fr_6rem] items-center gap-3 text-sm">
                <span>{c.etapa}</span>
                <span className="bg-sunken h-6 overflow-hidden rounded-[8px]">
                  <span className="bg-foreground/70 block h-full rounded-[8px]" style={{ width: `${(c.n / topo) * 100}%` }} />
                </span>
                <span className="text-muted-foreground text-right text-xs tabular-nums">
                  {c.n}
                  {i > 0 && ` · ${Math.round((c.n / m.conversao[i - 1].n) * 100)}%`}
                </span>
              </li>
            ))}
          </ol>
        </Caixa>
      </div>
    </AreaRolagem>
  )
}

function Caixa({ titulo, children, className }: { titulo: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn('bg-surface shadow-cartao flex flex-col gap-2 rounded-[24px] p-4', className)}>
      <h3 className="text-sm font-medium">{titulo}</h3>
      {children}
    </section>
  )
}

/** Lead manual (04, 6.1): indicação, Instagram, evento. O WhatsApp cria sozinho. */
function NovoLead({ onFechar, onCriar }: { onFechar: () => void; onCriar: (l: Lead) => void }) {
  const [nome, setNome] = useState('')
  const [pessoa, setPessoa] = useState('')
  const [telefone, setTelefone] = useState('')
  const [origem, setOrigem] = useState<Lead['origem']>('indicação')
  const [indicadoPor, setIndicadoPor] = useState('')
  const [responsavel, setResponsavel] = useState('Bruno Costa')
  const [servicos, setServicos] = useState<string[]>([])
  const [proxima, setProxima] = useState('')
  const telefoneOk = telefone.replace(/\D/g, '').length >= 10
  return (
    <GavetaFormulario
      aberta
      onFechar={onFechar}
      titulo="Novo lead"
      descricao="Lead que não chegou pelo WhatsApp. A primeira conversa sai pelo número principal, com o modelo de boas-vindas."
      acao="Criar lead"
      acaoDesabilitada={!nome.trim() || !telefoneOk}
      onAcao={() =>
        onCriar({
          id: `l${Date.now()}`,
          nome: nome.trim(),
          contato: `${pessoa || 'contato'}${origem === 'indicação' && indicadoPor ? ` · indicação de ${indicadoPor}` : ''}`,
          origem,
          etapa: 'lead',
          responsavel,
          servicos: servicos.length ? servicos : undefined,
          proxima: proxima || 'primeiro contato',
          desde: 'agora',
        })
      }
    >
      <Campo rotulo="Empresa ou nome">{(id) => <CampoTexto id={id} valor={nome} onMudar={setNome} placeholder="ex.: Padaria Trigo Bom" />}</Campo>
      <div className="grid gap-3 sm:grid-cols-2">
        <Campo rotulo="Pessoa de contato">{(id) => <CampoTexto id={id} valor={pessoa} onMudar={setPessoa} placeholder="ex.: Marta" />}</Campo>
        <Campo rotulo="WhatsApp" erro={telefone && !telefoneOk ? 'Número incompleto.' : undefined}>
          {(id) => <CampoTexto id={id} tipo="tel" valor={telefone} onMudar={setTelefone} placeholder="+55 11 9…" />}
        </Campo>
      </div>
      <Campo rotulo="Origem">
        {() => (
          <Segmentado
            rotulo="Origem"
            valor={origem}
            onMudar={setOrigem}
            opcoes={[
              { valor: 'indicação', rotulo: 'Indicação' },
              { valor: 'instagram', rotulo: 'Instagram' },
              { valor: 'site', rotulo: 'Site' },
              { valor: 'whatsapp', rotulo: 'WhatsApp' },
            ]}
          />
        )}
      </Campo>
      {origem === 'indicação' && (
        <Campo rotulo="Indicado por" ajuda="Cliente ou parceiro; entra nas métricas de origem.">
          {(id) => <CampoTexto id={id} valor={indicadoPor} onMudar={setIndicadoPor} placeholder="ex.: Padaria Pão Quente" />}
        </Campo>
      )}
      <Campo rotulo="Responsável">{(id) => <CampoEscolha id={id} valor={responsavel} onMudar={setResponsavel} opcoes={['Bruno Costa', 'Fernanda Lima', 'João Pereira'].map((n) => ({ valor: n, rotulo: n }))} />}</Campo>
      <Campo rotulo="Serviços de interesse">{() => <Fichas rotulo="Serviços" valores={servicos} onMudar={setServicos} opcoes={['Fiscal', 'DP', 'Contábil', 'Societário', 'Consultoria'].map((s) => ({ valor: s, rotulo: s }))} />}</Campo>
      <Campo rotulo="Próximo passo (opcional)">{(id) => <CampoTexto id={id} valor={proxima} onMudar={setProxima} placeholder="ex.: ligar quinta 10h" />}</Campo>
    </GavetaFormulario>
  )
}

/** Lista de leads (04, 6): o mesmo conteúdo do quadro, com filtros. */
function ListaLeads({ leads, onAbrir }: { leads: Lead[]; onAbrir: (id: string) => void }) {
  const [origem, setOrigem] = useState<string>('todas')
  const [resp, setResp] = useState<string>('todos')
  const responsaveis = [...new Set(leads.map((l) => l.responsavel).filter(Boolean))] as string[]
  const lista = leads.filter((l) => (origem === 'todas' || l.origem === origem) && (resp === 'todos' || (resp === 'sem' ? !l.responsavel : l.responsavel === resp)))
  return (
    <div className="bg-surface shadow-painel flex min-h-0 flex-1 flex-col overflow-hidden rounded-[24px] sm:rounded-[34px]">
      <div className="flex flex-wrap gap-2 border-b p-3">
        <CampoEscolha rotulo="Origem" valor={origem} onMudar={setOrigem} opcoes={[{ valor: 'todas', rotulo: 'Todas as origens' }, ...['whatsapp', 'site', 'indicação', 'instagram'].map((o) => ({ valor: o, rotulo: o }))]} />
        <CampoEscolha rotulo="Responsável" valor={resp} onMudar={setResp} opcoes={[{ valor: 'todos', rotulo: 'Todos os responsáveis' }, { valor: 'sem', rotulo: 'Sem responsável' }, ...responsaveis.map((r) => ({ valor: r, rotulo: r }))]} />
        <span className="text-muted-foreground self-center text-xs">{lista.length} leads</span>
      </div>
      <AreaRolagem className="min-h-0 flex-1">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="text-muted-foreground border-b text-left text-xs">
              <th className="px-4 py-2 font-medium">Lead</th>
              <th className="px-2 py-2 font-medium">Etapa</th>
              <th className="px-2 py-2 font-medium">Origem</th>
              <th className="px-2 py-2 font-medium">Responsável</th>
              <th className="px-2 py-2 font-medium">Proposta</th>
              <th className="px-4 py-2 font-medium">Próximo passo</th>
            </tr>
          </thead>
          <tbody className="divide-border/70 divide-y">
            {lista.map((l) => (
              <tr key={l.id} className="hover:bg-sunken/50 cursor-pointer" onClick={() => onAbrir(l.id)}>
                <td className="px-4 py-2.5">
                  <button type="button" className="cursor-pointer text-left font-medium" onClick={() => onAbrir(l.id)}>
                    {l.nome}
                  </button>
                  <span className="text-muted-foreground block text-xs">{l.desde}</span>
                </td>
                <td className="px-2 py-2.5">{etapasLead.find((e) => e.id === l.etapa)?.rotulo}</td>
                <td className="px-2 py-2.5">{l.origem}</td>
                <td className="px-2 py-2.5">{l.responsavel ?? <span className="text-warning-text">sem responsável</span>}</td>
                <td className="px-2 py-2.5 tabular-nums">{l.valor ?? '·'}</td>
                <td className="text-muted-foreground px-4 py-2.5 text-xs">{l.motivoPerda ? `perdido: ${l.motivoPerda}` : (l.proxima ?? '·')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!lista.length && <p className="text-muted-foreground p-8 text-center text-sm">Nenhum lead com esses filtros.</p>}
      </AreaRolagem>
    </div>
  )
}

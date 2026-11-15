import {
  ArrowBendUpRightIcon,
  ArrowLeftIcon,
  ArrowsLeftRightIcon,
  BellRingingIcon,
  CaretDownIcon,
  CheckCircleIcon,
  FunnelIcon,
  ClockIcon,
  DotsThreeIcon,
  HourglassIcon,
  LightningIcon,
  LinkSimpleIcon,
  ListPlusIcon,
  MagnifyingGlassIcon,
  NotePencilIcon,
  PaperclipIcon,
  PaperPlaneRightIcon,
  ProhibitIcon,
  SparkleIcon,
  TagIcon,
  TextAaIcon,
  UserCircleIcon,
  UserSwitchIcon,
  WarningIcon,
  XIcon,
} from '@phosphor-icons/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useItemNaRota } from '@/nucleo/rotas'
import { AreaRolagem } from '@/components/ui/area-rolagem'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ItemMenu, Menu, RotuloMenu } from '@/components/ui/menu'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Tooltip } from '@/components/ui/tooltip'
import { equipeCrm, lateralCliente, modelosForaDaJanela, respostasRapidas, rotuloCanal, rotuloSetor, rotuloStatus, type CanalCrm, type ConversaCrm, type ItemConversa } from '@/dados/crm'
import type { Tarefa } from '@/dados/tipos'
import { useMedia } from '@/hooks/useMedia'
import { TextoFixo } from '@/components/ui/formulario'
import { cn } from '@/lib/utils'
import type { SetorIntegrante } from '@/theme/tipos'
import { IconeCanal, ItemHistorico } from './itens'
import { integranteDoSetor, useFluxos } from '@/ambiente/fluxos'
import { usePersistente, useLoja, useNavegacao } from '@/ambiente/loja'
import { useDocumentos } from '@/ambiente/documentos'
import { useSessao } from '@/ambiente/sessao'
import { repos } from '@/nucleo/repositorios'
import { useTabela } from '@/nucleo/react'
import { assinar, useBloqueados, useCfgAtendimento } from './s05/config'
import { DialogoAgendar, DialogoAutorizacao, DialogoLigarCliente, DialogoMover, exportarConversa, SimulacaoAtendimento } from './s05/acoes'
import { CalendarPlusIcon, DownloadSimpleIcon, EnvelopeOpenIcon, FlaskIcon, ArrowsDownUpIcon, SealCheckIcon } from '@phosphor-icons/react'
import { useDesvioCampo } from '@/lib/desvio-campo'

type Visao = 'sem' | 'minhas' | 'setor' | 'todas'

interface Props {
  conversas: ConversaCrm[]
  clientes: { id: string; nome: string }[]
  /**
   * Cliente que vinha selecionado no resto do sistema: a lista abre filtrada
   * por ele (a "visão do cliente", 04, 4.1). O filtro é da lista, não do topo.
   */
  clienteInicial?: string | null
  tarefas: Tarefa[]
  conversaInicial?: string
  onAbrirLead?: () => void
}

const hora = () => new Date().toTimeString().slice(0, 5)

/** Prazo de resposta como aparece na lista e no cabeçalho. */
function Prazo({ c, compacto }: { c: ConversaCrm; compacto?: boolean }) {
  let texto: string
  let classe = 'bg-sunken text-muted-foreground'
  let icone: ReactNode = <ClockIcon className="size-3" />
  if (c.status === 'resolvida') {
    texto = c.transferidaPara ? 'transferida' : `resolvida ${c.prazoTexto ?? ''}`.trim()
    icone = <CheckCircleIcon className="size-3" />
  } else if (c.prazoMin == null) {
    texto = c.prazoTexto ?? 'pausado'
    icone = <HourglassIcon className="size-3" />
  } else if (c.prazoMin < 0) {
    texto = compacto ? `−${-c.prazoMin} min` : `estourou há ${-c.prazoMin} min`
    classe = 'bg-destructive/12 text-foreground'
    icone = <WarningIcon weight="fill" className="size-3" />
  } else {
    texto = c.prazoMin < 60 ? `${c.prazoMin} min` : `${Math.floor(c.prazoMin / 60)} h`
    if (c.prazoMin <= 15) classe = 'bg-warning/15 text-foreground'
  }
  return (
    <span className={cn('inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium tabular-nums whitespace-nowrap', classe)}>
      {icone}
      {texto}
    </span>
  )
}

const ordem = (a: ConversaCrm, b: ConversaCrm) => {
  const peso = (c: ConversaCrm) => (c.status === 'resolvida' ? 2 : c.prazoMin == null ? 1 : 0)
  return peso(a) - peso(b) || (a.prazoMin ?? 1e9) - (b.prazoMin ?? 1e9)
}

/**
 * CRM › Conversas (04, 4): a caixa de todos os canais. Lista com as visões
 * Sem responsável · Minhas · Do setor · Todas, ordenada pelo prazo de
 * resposta; a conversa com o histórico unificado e as ações; a lateral com o
 * cadastro. Com cliente selecionado, só as conversas dele.
 */
export function ConversasTela({ conversas: iniciais, clientes, clienteInicial, tarefas, conversaInicial, onAbrirLead }: Props) {
  const loja = useLoja()
  const { usuario, permissoes } = useSessao()
  const usuarioCrm = { nome: usuario.nome, setores: permissoes.setores.filter((s) => s !== 'financeiro_escritorio') as Exclude<SetorIntegrante, 'financeiro_escritorio'>[] }
  // As conversas vêm da loja do escritório: o que se faz aqui fica gravado e aparece nos outros módulos.
  const conversas = iniciais
  // Abrindo uma conversa específica (ex.: vinda do quadro de leads), o filtro segue a dela.
  const [clienteId, setClienteId] = useState<string | null>(() => (conversaInicial ? (iniciais.find((c) => c.id === conversaInicial)?.clienteId ?? null) : (clienteInicial ?? null)))
  const clienteNome = clientes.find((c) => c.id === clienteId)?.nome
  const [visao, setVisao] = useState<Visao>('todas')
  const [setorSel, setSetorSel] = useState<SetorIntegrante>('fiscal')
  const [busca, setBusca] = useState('')
  const largo = useMedia('(min-width: 768px)')
  const [abertaId, setAbertaId] = useState<string | null>(conversaInicial ?? null)
  useItemNaRota({ conversa: abertaId ?? undefined })
  const [lateral, setLateral] = useState(false)
  const lateralFixa = useMedia('(min-width: 1536px)')

  const doCliente = conversas.filter((c) => !clienteId || c.clienteId === clienteId)
  const meus = doCliente.filter((c) => (usuarioCrm.setores as SetorIntegrante[]).includes(c.setor) || c.responsavel === usuarioCrm.nome)
  const porVisao: Record<Visao, ConversaCrm[]> = {
    sem: meus.filter((c) => !c.responsavel && c.status !== 'resolvida'),
    minhas: meus.filter((c) => c.responsavel === usuarioCrm.nome && c.status !== 'resolvida'),
    setor: meus.filter((c) => c.setor === setorSel),
    todas: meus,
  }
  const termo = busca.trim().toLowerCase()
  const lista = porVisao[visao]
    .filter((c) => !termo || [c.cliente, c.pessoa.nome, c.previa, ...c.etiquetas, ...c.itens.map((i) => ('texto' in i ? i.texto : '') + ('audio' in i && i.audio ? i.audio.transcricao : ''))].join(' ').toLowerCase().includes(termo))
    .sort(ordem)

  // No computador, abre a primeira da lista; no celular, começa na lista.
  const aberta = conversas.find((c) => c.id === abertaId) ?? (largo ? lista[0] : undefined)

  // Lê a conversa mais recente (as respostas simuladas chegam depois, com a tela já atualizada).
  const recentes = useRef(conversas)
  recentes.current = conversas
  const salvar = useRef(loja.salvarConversa)
  salvar.current = loja.salvarConversa
  const atualizar = (id: string, f: (c: ConversaCrm) => ConversaCrm) => {
    const atual = recentes.current.find((c) => c.id === id) ?? loja.conversas.find((c) => c.id === id)
    if (atual) {
      const nova = f(atual)
      recentes.current = recentes.current.map((c) => (c.id === id ? nova : c))
      salvar.current(nova)
    }
  }
  const [simulacao, setSimulacao] = useState(false)
  const podeGerir = usuario.papel === 'administrador' || permissoes.gere.length > 0
  const marco = (texto: string): ItemConversa => ({ tipo: 'marco', id: `x${Math.random()}`, hora: hora(), texto })

  return (
    <div className="h-full px-2 pb-2 sm:px-4 sm:pb-4">
      <div className="bg-surface shadow-painel flex h-full overflow-hidden rounded-campo sm:rounded-painel">
        {/* Lista */}
        <section aria-label="Lista de conversas" className={cn('flex w-full shrink-0 flex-col border-r md:w-80 lg:w-96', aberta && !largo && 'hidden')}>
          <div className="flex flex-col gap-2 p-3 pb-2">
            <div className="bg-sunken flex rounded-full p-0.5 text-xs" role="tablist" aria-label="Visões">
              {(
                [
                  ['sem', 'Sem resp.'],
                  ['minhas', 'Minhas'],
                  ['setor', 'Do setor'],
                  ['todas', 'Todas'],
                ] as [Visao, string][]
              ).map(([id, r]) => (
                <button
                  key={id}
                  role="tab"
                  aria-selected={visao === id}
                  onClick={() => setVisao(id)}
                  className={cn(
                    'flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-full px-1.5 py-1.5 whitespace-nowrap',
                    visao === id ? 'bg-raised shadow-pilula font-medium' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {r}
                  <span className={cn('tabular-nums', id === 'sem' && porVisao.sem.length ? 'text-destructive-text' : 'text-muted-foreground')}>{porVisao[id].length}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <label className="bg-sunken flex h-9 flex-1 items-center gap-2 rounded-full px-3">
                <MagnifyingGlassIcon className="text-muted-foreground size-4" />
                <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar mensagem, pessoa, CNPJ…" className="placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent text-sm outline-none" />
              </label>
              <Menu
                align="end"
                gatilho={
                  <Button size="icon" variant={clienteId ? 'secondary' : 'ghost'} className="size-9 shrink-0 rounded-full" aria-label="Filtrar por cliente">
                    <FunnelIcon />
                  </Button>
                }
              >
                <RotuloMenu>Filtrar por cliente</RotuloMenu>
                <ItemMenu onClick={() => setClienteId(null)}>Todos os clientes e leads</ItemMenu>
                {clientes
                  .filter((k) => conversas.some((c) => c.clienteId === k.id))
                  .map((k) => (
                    <ItemMenu key={k.id} onClick={() => setClienteId(k.id)} detalhe={`${conversas.filter((c) => c.clienteId === k.id).length} conversas`}>
                      {k.nome}
                    </ItemMenu>
                  ))}
              </Menu>
              {visao === 'setor' && (
                <Menu
                  align="end"
                  gatilho={
                    <Button size="sm" variant="outline" className="rounded-full">
                      {rotuloSetor[setorSel]} <CaretDownIcon />
                    </Button>
                  }
                >
                  {usuarioCrm.setores.map((s) => (
                    <ItemMenu key={s} onClick={() => setSetorSel(s)}>
                      {rotuloSetor[s]}
                    </ItemMenu>
                  ))}
                </Menu>
              )}
            </div>
            <div className="text-muted-foreground flex items-center justify-between px-1 text-xs">
              {clienteId ? (
                <button
                  type="button"
                  onClick={() => setClienteId(null)}
                  className="bg-sunken hover:bg-accent text-foreground flex min-w-0 cursor-pointer items-center gap-1 rounded-full py-0.5 pr-1.5 pl-2.5"
                  aria-label={`Tirar o filtro ${clienteNome}`}
                >
                  <span className="truncate">{clienteNome}</span> <XIcon className="size-3 shrink-0" />
                </button>
              ) : (
                <span>Todos os clientes e leads</span>
              )}
              {podeGerir ? (
                <button type="button" onClick={() => setSimulacao(true)} className="hover:text-foreground flex cursor-pointer items-center gap-1">
                  <FlaskIcon className="size-3" /> modo simulação
                </button>
              ) : (
                <span>ordem: prazo de resposta</span>
              )}
            </div>
          </div>
          <AreaRolagem className="flex-1 px-2 pb-2">
            <ul className="flex flex-col gap-0.5">
              {lista.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setAbertaId(c.id)}
                    aria-current={aberta?.id === c.id || undefined}
                    className={cn('flex w-full cursor-pointer flex-col gap-1 rounded-lg px-3 py-2.5 text-left transition-colors', aberta?.id === c.id ? 'bg-raised shadow-cartao' : 'hover:bg-raised/60')}
                  >
                    <span className="flex items-center gap-2">
                      <span className={cn('min-w-0 flex-1 truncate text-sm', c.naoLidas ? 'font-semibold' : 'font-medium')}>{c.lead ? `Lead · ${c.pessoa.contato}` : c.cliente}</span>
                      <Prazo c={c} compacto />
                    </span>
                    <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                      <span className="min-w-0 truncate">{c.lead ? c.pessoa.papel : `${c.pessoa.nome} · ${c.pessoa.papel}`}</span>
                      <span>·</span>
                      <span className="shrink-0">{rotuloSetor[c.setor]}</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-xs">
                      <IconeCanal canal={c.canal} className="text-muted-foreground" />
                      <span className={cn('min-w-0 flex-1 truncate', c.naoLidas ? 'text-foreground' : 'text-muted-foreground')}>{loja.estado.digitando[c.id] ? <em className="text-success-text not-italic">digitando…</em> : c.previa}</span>
                      {c.naoLidas ? <span className="bg-destructive text-destructive-foreground flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-xs font-semibold tabular-nums">{c.naoLidas}</span> : null}
                    </span>
                    <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                      <span className={cn(!c.responsavel && c.status !== 'resolvida' && 'text-warning-text font-medium')}>{c.responsavel ?? (c.status === 'resolvida' ? '' : 'sem responsável')}</span>
                      <span className="ml-auto">{rotuloStatus[c.status]}</span>
                    </span>
                  </button>
                </li>
              ))}
              {!lista.length && <li className="text-muted-foreground px-3 py-10 text-center text-sm">Nada aqui. {visao === 'sem' ? 'Todas as conversas têm responsável.' : 'Troque a visão ou limpe a busca.'}</li>}
            </ul>
          </AreaRolagem>
        </section>

        {/* Conversa */}
        {aberta ? (
          <Conversa
            key={aberta.id}
            c={aberta}
            largo={largo}
            lateralFixa={lateralFixa}
            onVoltar={() => setAbertaId(null)}
            onLateral={() => setLateral(true)}
            onAtualizar={(f) => atualizar(aberta.id, f)}
            marco={marco}
            conversas={conversas}
            onMover={(ids, destino) => {
              const itens = aberta.itens.filter((i) => 'id' in i && ids.includes(i.id))
              const nomeDestino = conversas.find((x) => x.id === destino)
              atualizar(aberta.id, (x) => ({ ...x, itens: [...x.itens.map((i) => (i.tipo === 'mensagem' && ids.includes(i.id) ? { ...i, movidaPara: `${nomeDestino?.cliente ?? 'outra conversa'} · ${rotuloSetor[nomeDestino?.setor ?? aberta.setor]}` } : i)), marco(`${ids.length} ${ids.length === 1 ? 'mensagem movida' : 'mensagens movidas'} para ${nomeDestino?.cliente ?? 'outra conversa'} · ${rotuloSetor[nomeDestino?.setor ?? aberta.setor]} por ${usuario.nome}`)] }))
              atualizar(destino, (x) => ({ ...x, itens: [...x.itens, marco(`chegou de outra conversa da mesma pessoa, movida por ${usuario.nome}`), ...itens.map((i) => ({ ...i, id: `${'id' in i ? i.id : 'm'}-mv` }) as ItemConversa)] }))
              loja.toast('Mensagem movida para a conversa certa.', { modulo: 'crm', aba: 'conversas', conversa: destino }, 'Abrir')
            }}
          />
        ) : (
          largo && <div className="text-muted-foreground flex flex-1 items-center justify-center text-sm">Escolha uma conversa.</div>
        )}

        {aberta && lateralFixa && <AreaRolagem className="w-80 shrink-0 border-l pb-24">
            <Lateral c={aberta} tarefas={tarefas} onAbrirLead={onAbrirLead} />
          </AreaRolagem>}
      </div>
      {aberta && !lateralFixa && (
        <Sheet open={lateral} onOpenChange={setLateral}>
          <SheetContent className="gap-0 sm:max-w-sm">
            <SheetHeader>
              <SheetTitle>{aberta.cliente ?? 'Lead'}</SheetTitle>
              <SheetDescription>O cadastro de quem escreve, projetado na conversa.</SheetDescription>
            </SheetHeader>
            <AreaRolagem className="flex-1">
              <Lateral c={aberta} tarefas={tarefas} onAbrirLead={onAbrirLead} />
            </AreaRolagem>
          </SheetContent>
        </Sheet>
      )}
      <SimulacaoAtendimento aberto={simulacao} onFechar={() => setSimulacao(false)} />
    </div>
  )
}

function Conversa({
  c,
  largo,
  lateralFixa,
  onVoltar,
  onLateral,
  onAtualizar,
  marco,
  conversas,
  onMover,
}: {
  c: ConversaCrm
  largo: boolean
  lateralFixa: boolean
  onVoltar: () => void
  onLateral: () => void
  onAtualizar: (f: (c: ConversaCrm) => ConversaCrm) => void
  marco: (t: string) => ItemConversa
  conversas: ConversaCrm[]
  onMover: (ids: string[], destino: string) => void
}) {
  // O campo de escrever fica no canto de baixo: o botão Chat e os avisos sobem a altura dele (--desvio-campo).
  const refCampo = useDesvioCampo()
  const [modo, setModo] = useState<'responder' | 'nota'>('responder')
  // D-34: o anexo guarda o cliente do documento, para conferir o CNPJ antes de enviar.
  const [anexoDoc, setAnexoDoc] = useState<{ nome: string; clienteId?: string | null } | null>(null)
  const anexo = anexoDoc?.nome ?? null
  const setAnexo = (v: string | null) => setAnexoDoc(v ? { nome: v, clienteId: c.clienteId } : null)
  const [dialogo, setDialogo] = useState<'agendar' | 'mover' | 'autorizacao' | 'ligar' | null>(null)
  const [cfgAtend] = useCfgAtendimento()
  const tDocs = useTabela('documento')
  const { usuario: usuarioConv, permissoes: permConv, contas: contasConv } = useSessao()
  const podeGerirConv = usuarioConv.papel === 'administrador' || permConv.gere.length > 0
  const docsDoCliente = tDocs.filter((d) => d.cliente_id === c.clienteId && !d.arquivado_em).slice(0, 5)
  const docOutraEmpresa = tDocs.find((d) => d.cliente_id && d.cliente_id !== c.clienteId)
  const cnpjErrado = !!(anexoDoc?.clienteId && c.clienteId && anexoDoc.clienteId !== c.clienteId)
  const piloto = !!c.clienteId && cfgAtend.pilotos.includes(c.clienteId)
  const [, setBloqueados] = useBloqueados()
  const [texto, setTexto] = useState('')
  const [canal, setCanal] = useState<CanalCrm>(c.canal)
  const [resumoAberto, setResumoAberto] = useState(true)
  const [escrevendo, setEscrevendo] = useState(false)
  const [respondidas, setRespondidas] = usePersistente<string[]>('crm.respondidas', [])
  const fim = useRef<HTMLDivElement>(null)
  const eu = useSessao().usuario.nome
  const lojaConv = useLoja()
  const docsConv = useDocumentos()
  const fluxosConv = useFluxos()
  const somenteLeitura = !!c.transferidaPara
  const foraDaJanela = canal === 'whatsapp' && !c.janelaAberta
  const primeiroNome = c.lead ? 'o lead' : c.pessoa.nome.split(' ')[0]

  useEffect(() => {
    fim.current?.scrollIntoView({ block: 'end' })
  }, [c.itens.length, lojaConv.estado.digitando[c.id]])

  const assumir = (prefixo = '') => onAtualizar((x) => (x.responsavel === eu ? x : { ...x, responsavel: eu, status: 'em_atendimento', naoLidas: 0, itens: [...x.itens, marco(`${eu} assumiu${prefixo}`)] }))

  // O integrante do setor prepara a resposta (demonstração): escreve e deixa no campo para você revisar e enviar.
  const sugerir = () => {
    setEscrevendo(true)
    const ultima = [...c.itens].reverse().find((i) => i.tipo === 'mensagem' && i.de === 'cliente') as Extract<ItemConversa, { tipo: 'mensagem' }> | undefined
    const pergunta = `${ultima?.texto ?? ''} ${ultima?.audio?.transcricao ?? ''}`
    const corpo = /iss|guia|imposto|das\b/i.test(pergunta)
      ? 'a guia do ISS de outubro já está pronta: vence dia 20 e o valor é R$ 4.812,40. Mandei pelo app agora; qualquer dúvida, me chama.'
      : /admi|funcion|contrat/i.test(pergunta)
        ? 'já abrimos as admissões. Para seguir, preciso de RG, CPF, CTPS e o exame admissional de cada um; pode mandar por aqui ou pelo app.'
        : /nota|xml|cancel/i.test(pergunta)
          ? 'recebi. Vou conferir a nota no portal e te confirmo ainda hoje se precisa reemitir.'
          : 'recebi sua mensagem. Já estou vendo com o setor e te retorno ainda hoje.'
    // Pensa e escreve no campo aos poucos, como quem digita; você revisa antes de enviar.
    window.setTimeout(() => {
      setModo('responder')
      const final = `Oi, ${primeiroNome}! ${corpo}`
      const palavras = final.split(' ')
      let n = 0
      const t = window.setInterval(() => {
        n += 1
        setTexto(palavras.slice(0, n).join(' '))
        if (n >= palavras.length) {
          window.clearInterval(t)
          setEscrevendo(false)
        }
      }, 70)
    }, 1600)
  }

  const enviar = () => {
    const t0 = texto.trim()
    if (!t0) return
    if (cnpjErrado) {
      lojaConv.toastErro('Envio bloqueado: o CNPJ do documento não é o da empresa desta conversa (D-34).')
      return
    }
    // C2-07: o nome de quem atende entra na mensagem ao cliente (nota interna não leva).
    const t = modo === 'nota' ? t0 : assinar(t0, eu, rotuloSetor[c.setor] ?? '', cfgAtend.assinatura)
    const id = `e${Date.now()}`
    if (modo === 'nota') {
      onAtualizar((x) => ({ ...x, itens: [...x.itens, { tipo: 'nota', id, autor: eu, hora: hora(), texto: t }] }))
      // @menção na nota (04, 10.2): avisa a pessoa com o trecho; quem é de outro setor recebe o trecho, não o acesso.
      for (const u of contasConv.filter((u) => u.situacao === 'ativo' && u.nome !== eu && t.includes(`@${u.nome.split(' ')[0]}`)))
        lojaConv.avisar({ para: [u.id], titulo: `${eu} mencionou você numa nota interna`, detalhe: `${c.cliente ?? 'Lead'}: ${t.slice(0, 120)}`, tipo: 'conversa', destino: { modulo: 'crm', aba: 'conversas', conversa: c.id } })
    } else {
      onAtualizar((x) => ({
        ...x,
        responsavel: x.responsavel ?? eu,
        status: x.status === 'nova' || x.status === 'resolvida' ? 'em_atendimento' : x.status,
        prazoMin: x.prazoMin,
        naoLidas: 0,
        previa: `${eu.split(' ')[0]}: ${t}`,
        itens: [
          ...x.itens,
          ...(x.responsavel ? [] : [marco(`${eu} assumiu ao responder`)]),
          { tipo: 'mensagem', id, de: 'atendente', autor: eu, hora: hora(), canal, texto: t, entrega: 'enviada', ...(anexo ? { anexos: [{ nome: anexo, tipo: 'pdf' }] } : {}), ...(foraDaJanela ? { modelo: 'template' } : {}) },
        ],
      }))
      // Status de entrega chegando do provedor.
      setTimeout(() => onAtualizar((x) => ({ ...x, itens: x.itens.map((i) => (i.tipo === 'mensagem' && i.id === id ? { ...i, entrega: 'entregue' } : i)) })), 1200)
      setTimeout(() => onAtualizar((x) => ({ ...x, itens: x.itens.map((i) => (i.tipo === 'mensagem' && i.id === id ? { ...i, entrega: 'lida' } : i)) })), 3800)
      // O cliente lê e responde, digitando antes (uma vez por conversa na demonstração; lead e fora da janela não respondem).
      if (!c.lead && !foraDaJanela && !respondidas.includes(c.id)) {
        setRespondidas((xs) => [...xs, c.id])
        const quem = c.pessoa.nome
        const resposta = /\?/.test(t) ? 'Deixa eu ver aqui e já te respondo.' : /guia|boleto|nota|documento|anexo/i.test(t) ? 'Recebi, obrigado! Vou conferir e qualquer coisa te chamo.' : 'Perfeito, obrigado!'
        setTimeout(() => lojaConv.digitar(c.id, quem), 5600)
        setTimeout(() => {
          lojaConv.digitar(c.id, null)
          onAtualizar((x) => ({ ...x, previa: `${quem.split(' ')[0]}: ${resposta}`, itens: [...x.itens, { tipo: 'mensagem', id: `r${Date.now()}`, de: 'cliente', autor: quem, hora: hora(), canal, texto: resposta }] }))
        }, 9200)
      }
    }
    setTexto('')
    setAnexo(null)
  }

  const tom = (t: 'formal' | 'direto' | 'amigável' | 'para leigo') => {
    const base = texto.trim() || 'Vou confirmar com o responsável e já te passo o prazo.'
    const versoes = {
      formal: `Prezada ${primeiroNome}, ${base.charAt(0).toLowerCase()}${base.slice(1)} Atenciosamente, ${eu.split(' ')[0]}.`,
      direto: base.replace(/^(Olá|Oi)[^,]*,\s*/i, ''),
      amigável: `Oi, ${primeiroNome}! ${base} Qualquer coisa, é só chamar 🙂`,
      'para leigo': `${base} (Em outras palavras: a gente cuida disso e te avisa por aqui.)`,
    }
    setTexto(versoes[t])
  }

  const outrosSetores = (Object.keys(rotuloSetor) as SetorIntegrante[]).filter((s) => s !== c.setor)
  const colegas = equipeCrm.filter((p) => p.setores.includes(c.setor) && p.nome !== c.responsavel)

  return (
    <section aria-label="Conversa" className="flex min-w-0 flex-1 flex-col">
      {/* Cabeçalho */}
      <header className="flex flex-col gap-2 border-b px-4 pt-3 pb-2.5 sm:px-5">
        <div className="flex items-start gap-2">
          {!largo && (
            <Button size="icon-sm" variant="ghost" onClick={onVoltar} aria-label="Voltar à lista">
              <ArrowLeftIcon />
            </Button>
          )}
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-medium">
              {c.lead ? `Lead · ${c.pessoa.contato}` : c.cliente}
              {c.clienteInferido && (
                <Menu
                  gatilho={
                    <button type="button" className="ml-2 cursor-pointer align-middle">
                      <Badge variant="destaque">cliente inferido · confirmar</Badge>
                    </button>
                  }
                >
                  <RotuloMenu>O integrante deduziu pelo número e pelo assunto</RotuloMenu>
                  <ItemMenu icone={<CheckCircleIcon />} onClick={() => onAtualizar((x) => ({ ...x, clienteInferido: false, itens: [...x.itens, marco(`${eu} confirmou o cliente ${x.cliente}`)] }))}>
                    Confirmar {c.cliente}
                  </ItemMenu>
                  <ItemMenu icone={<LinkSimpleIcon />} onClick={() => setDialogo('ligar')}>
                    É outra empresa…
                  </ItemMenu>
                </Menu>
              )}
              {piloto && (
                <Tooltip conteudo="Cliente-piloto (D-31): o integrante responde sozinho só as categorias liberadas.">
                  <Badge variant="outline" className="ml-2 align-middle">
                    cliente-piloto
                  </Badge>
                </Tooltip>
              )}
            </h2>
            <p className="text-muted-foreground truncate text-xs">
              {c.lead ? c.pessoa.papel : `${c.pessoa.nome} · ${c.pessoa.papel}`} · {rotuloSetor[c.setor]} · {c.responsavel ? `com ${c.responsavel}` : 'sem responsável'} · {rotuloStatus[c.status]}
            </p>
          </div>
          <Prazo c={c} />
          {!lateralFixa && (
            <Tooltip conteudo="Cadastro e tarefas">
              <Button size="icon-sm" variant="ghost" onClick={onLateral} aria-label="Abrir cadastro">
                <UserCircleIcon />
              </Button>
            </Tooltip>
          )}
        </div>
        {!somenteLeitura && (
          <div className="flex flex-wrap items-center gap-1.5">
            {c.responsavel !== eu && c.status !== 'resolvida' && (
              <Button size="sm" className="rounded-full" onClick={() => assumir()}>
                Assumir
              </Button>
            )}
            <Menu
              gatilho={
                <Button size="sm" variant="outline" className="rounded-full">
                  <UserSwitchIcon /> Repassar
                </Button>
              }
            >
              <RotuloMenu>Mesmo setor; o cliente não é avisado</RotuloMenu>
              {colegas.map((p) => (
                <ItemMenu key={p.nome} onClick={() => onAtualizar((x) => ({ ...x, responsavel: p.nome, status: x.status === 'nova' ? 'em_atendimento' : x.status, itens: [...x.itens, marco(`repassada para ${p.nome}`)] }))}>
                  {p.nome}
                </ItemMenu>
              ))}
            </Menu>
            <Menu
              gatilho={
                <Button size="sm" variant="outline" className="rounded-full">
                  <ArrowsLeftRightIcon /> Transferir
                </Button>
              }
            >
              <RotuloMenu>Outro setor; o cliente é avisado e passa a falar com ele</RotuloMenu>
              {outrosSetores.map((s) => (
                <ItemMenu
                  key={s}
                  detalhe={s === 'contabil' || s === 'notas' || s === 'societario' || s === 'consultor' ? 'usa o número principal' : 'número próprio'}
                  onClick={() =>
                    onAtualizar((x) => ({
                      ...x,
                      status: 'resolvida',
                      transferidaPara: rotuloSetor[s],
                      itens: [
                        ...x.itens,
                        { tipo: 'mensagem', id: `t${Date.now()}`, de: 'auto', hora: hora(), canal: x.canal, texto: `Seu assunto passou ao ${rotuloSetor[s]}. A partir de agora, eles falam com você por aqui.`, modelo: 'transferencia' },
                        marco(`transferida para ${rotuloSetor[s]} por ${eu}`),
                      ],
                    }))
                  }
                >
                  {rotuloSetor[s]}
                </ItemMenu>
              ))}
            </Menu>
            <Menu
              gatilho={
                <Button size="sm" variant="outline" className="rounded-full">
                  <HourglassIcon /> Aguardando
                </Button>
              }
            >
              <ItemMenu
                detalhe="pausa o prazo; volta na próxima mensagem"
                onClick={() => onAtualizar((x) => ({ ...x, status: 'aguardando_cliente', prazoMin: null, prazoTexto: 'até 24/11', itens: [...x.itens, marco('aguardando cliente até 24/11')] }))}
              >
                Aguardando cliente
              </ItemMenu>
              <ItemMenu
                detalhe="exige tarefa; volta quando ela for concluída"
                onClick={() =>
                  onAtualizar((x) => ({ ...x, status: 'aguardando_interno', prazoMin: null, prazoTexto: 'com tarefa', tarefaAguardada: 'nova tarefa ligada', itens: [...x.itens, marco('aguardando interno · tarefa criada e ligada')] }))
                }
              >
                Aguardando interno
              </ItemMenu>
            </Menu>
            {c.status !== 'resolvida' && (
              <Button
                size="sm"
                variant="outline"
                className="rounded-full"
                onClick={() => {
                  const idPesquisa = `sat${Date.now()}`
                  onAtualizar((x) => ({
                    ...x,
                    status: 'resolvida',
                    prazoMin: null,
                    prazoTexto: 'agora',
                    itens: [
                      ...x.itens,
                      marco(`resolvida por ${eu} · reabre se o cliente escrever em até 7 dias`),
                      ...(cfgAtend.satisfacao && !x.lead ? [{ tipo: 'mensagem' as const, id: idPesquisa, de: 'auto' as const, hora: hora(), canal: x.canal, modelo: 'pesquisa_satisfacao', texto: 'Como foi o seu atendimento? Toque de 1 a 5.', botoes: ['1', '2', '3', '4', '5'].map((r) => ({ rotulo: r })) }] : []),
                    ],
                  }))
                  // O cliente responde a pesquisa (demonstração).
                  if (cfgAtend.satisfacao && !c.lead)
                    window.setTimeout(() => onAtualizar((x) => ({ ...x, itens: [...x.itens.map((i) => (i.tipo === 'mensagem' && i.id === idPesquisa ? { ...i, botoes: i.botoes?.map((b) => ({ ...b, escolhido: b.rotulo === '5' })) } : i)), marco(`${x.pessoa.nome.split(' ')[0]} deu nota 5 ao atendimento`)] })), 4000)
                }}
              >
                <CheckCircleIcon /> Resolver
              </Button>
            )}
            <Menu
              align="end"
              gatilho={
                <Button size="icon-sm" variant="ghost" className="rounded-full" aria-label="Mais ações">
                  <DotsThreeIcon weight="bold" />
                </Button>
              }
            >
              <ItemMenu
                icone={<ListPlusIcon />}
                detalhe="o integrante propõe cliente, setor, prazo e checklist"
                onClick={() =>
                  onAtualizar((x) => ({
                    ...x,
                    itens: [
                      ...x.itens,
                      {
                        tipo: 'cartao',
                        id: `k${Date.now()}`,
                        hora: hora(),
                        setor: x.setor,
                        titulo: 'Nova tarefa a partir desta conversa',
                        detalhe: `${x.cliente ?? 'Lead'} · ${rotuloSetor[x.setor]} · prazo sugerido em 2 dias úteis · responsável ${x.responsavel ?? eu}`,
                        acoes: ['Criar tarefa', 'Editar antes'],
                      },
                    ],
                  }))
                }
              >
                Virar tarefa
              </ItemMenu>
              <ItemMenu
                icone={<TagIcon />}
                detalhe={c.etiquetas.includes('urgente') ? 'tirar "urgente"' : 'encurta o prazo para 30 min'}
                onClick={() => onAtualizar((x) => ({ ...x, etiquetas: x.etiquetas.includes('urgente') ? x.etiquetas.filter((e) => e !== 'urgente') : [...x.etiquetas, 'urgente'] }))}
              >
                Etiquetar urgente
              </ItemMenu>
              <ItemMenu icone={<BellRingingIcon />} detalhe="avisa você; não muda o status" onClick={() => onAtualizar((x) => ({ ...x, itens: [...x.itens, marco('lembrete para amanhã às 9h')] }))}>
                Lembrete amanhã 9h
              </ItemMenu>
              <ItemMenu
                icone={<SparkleIcon />}
                detalhe="resumo gerado no topo"
                onClick={() => {
                  setResumoAberto(true)
                  onAtualizar((x) => ({
                    ...x,
                    resumo: x.resumo ?? `${x.pessoa.nome.split(' ')[0]} falou sobre ${x.etiquetas.join(', ') || 'um assunto do setor'}; ${x.responsavel ? `${x.responsavel} está cuidando` : 'ninguém assumiu ainda'}.`,
                  }))
                }}
              >
                Resumir conversa
              </ItemMenu>
              <ItemMenu icone={<CalendarPlusIcon />} detalhe="três horários livres; o cliente confirma por botão" onClick={() => setDialogo('agendar')}>
                Agendar reunião
              </ItemMenu>
              <ItemMenu icone={<LinkSimpleIcon />} detalhe="lead que já é cliente ou pessoa com várias empresas: cartão ao Gestor" onClick={() => setDialogo('ligar')}>
                Ligar a cliente
              </ItemMenu>
              <ItemMenu icone={<ArrowsDownUpIcon />} detalhe="para a conversa certa da mesma pessoa" onClick={() => setDialogo('mover')}>
                Mover mensagem
              </ItemMenu>
              {!c.lead && (
                <ItemMenu icone={<SealCheckIcon />} detalhe='"pode transmitir" vira prova na tarefa' onClick={() => setDialogo('autorizacao')}>
                  Registrar autorização
                </ItemMenu>
              )}
              <ItemMenu
                icone={<EnvelopeOpenIcon />}
                detalhe="entrada, enviados e anexos, arquivados no cliente (C2-08)"
                onClick={() => {
                  lojaConv.toast('O integrante está lendo a caixa de e-mail do setor…')
                  window.setTimeout(() => {
                    const nome = `Extrato ${c.cliente ?? 'cliente'} 10-2026.pdf`
                    try {
                      if (c.clienteId) repos.documentos.criar({ cliente_id: c.clienteId, tipo: 'extrato', competencia: '10/2026', nome_arquivo: nome, mime: 'application/pdf', tamanho_bytes: 184320, hash_sha256: `demo-${Date.now()}`, origem: 'conversa', enviado_por_tipo: 'integrante', backend_id: 'a1', caminho: `${c.cliente}/Contábil/2026-10`, visivel_ao_cliente: false, versao: 1, extras: { pasta: [c.cliente ?? '', 'Contábil', '2026-10'], quando: 'agora', por: 'caixa de e-mail do setor', tamanho: '180 KB' } })
                    } catch {
                      /* sem permissão para registrar documento: fica só no fio */
                    }
                    onAtualizar((x) => ({
                      ...x,
                      itens: [
                        ...x.itens,
                        { tipo: 'mensagem', id: `cx${Date.now()}`, de: 'atendente', autor: x.responsavel ?? eu, hora: hora(), canal: 'email', assunto: `Extrato de outubro · ${x.cliente ?? ''}`, texto: 'Segue o extrato que faltava para o fechamento. Qualquer coisa, me avisem.', anexos: [{ nome, tipo: 'pdf' }], daCaixa: 'enviado', entrega: 'entregue' },
                        marco(`integrante de Atendimento registrou 1 e-mail enviado fora do sistema · anexo arquivado em ${x.cliente ?? 'cliente'}/Contábil/2026-10`),
                      ],
                    }))
                  }, 1500)
                }}
              >
                Ler a caixa de e-mail agora
              </ItemMenu>
              {podeGerirConv && (
                <ItemMenu icone={<DownloadSimpleIcon />} detalhe="prova de autorização ou disputa · fica registrado" onClick={() => exportarConversa(c, eu)}>
                  Exportar conversa
                </ItemMenu>
              )}
              <ItemMenu
                icone={<ProhibitIcon />}
                desabilitado={!podeGerirConv}
                detalhe="spam ou golpe · só Gestor"
                onClick={() => {
                  setBloqueados((xs) => [...xs.filter((b) => b.numero !== c.pessoa.contato), { numero: c.pessoa.contato, motivo: 'Spam ou golpe (marcado na conversa)', por: eu, em: new Date().toLocaleDateString('pt-BR').slice(0, 5), mensagens: 0 }])
                  onAtualizar((x) => ({ ...x, status: 'resolvida', prazoMin: null, prazoTexto: 'bloqueada', itens: [...x.itens, marco(`identidade bloqueada por ${eu} · mensagens futuras guardadas sem abrir conversa`)] }))
                  lojaConv.toast('Número bloqueado. Dá para desbloquear em Números › Bloqueados.', { modulo: 'crm', aba: 'numeros' }, 'Ver bloqueados')
                }}
              >
                Bloquear número
              </ItemMenu>
            </Menu>
            {c.etiquetas.map((e) => (
              <Badge key={e} variant={e === 'urgente' ? 'erro' : 'outline'} className="hidden sm:inline-flex">
                #{e}
              </Badge>
            ))}
          </div>
        )}
      </header>

      {/* Histórico */}
      <AreaRolagem className="flex-1 px-4 pt-4 pb-16 sm:px-5">
        <div className="mx-auto flex max-w-3xl flex-col gap-3">
          {c.resumo && (
            <div className="bg-sunken/70 rounded-md px-3 py-2 text-sm">
              <button type="button" onClick={() => setResumoAberto((v) => !v)} className="text-muted-foreground flex w-full cursor-pointer items-center gap-1.5 text-xs">
                <SparkleIcon className="size-3.5" /> Resumo (gerado) <CaretDownIcon className={cn('ml-auto size-3 transition-transform', !resumoAberto && '-rotate-90')} />
              </button>
              {resumoAberto && <p className="mt-1">{c.resumo}</p>}
            </div>
          )}
          {c.itens.map((i, k) => (
            <ItemHistorico
              key={'id' in i ? i.id : `d${k}`}
              item={i}
              onAbrirAnexo={(nome) => docsConv.abrir(nome, { clienteNome: c.cliente, setor: c.setor, origem: 'conversa', por: `${c.pessoa.nome} (${c.lead ? 'lead' : 'cliente'})` })}
              onReenviar={(id) =>
                onAtualizar((x) => {
                  const m = x.itens.find((i) => i.tipo === 'mensagem' && i.id === id) as Extract<ItemConversa, { tipo: 'mensagem' }> | undefined
                  const outro = m?.canal === 'email' ? 'WhatsApp' : 'e-mail'
                  return { ...x, itens: [...x.itens, { tipo: 'cartao', id: `reenv-${id}-${Date.now()}`, hora: hora(), setor: 'gestao_atendimento', titulo: `Reenviar por ${outro}`, detalhe: `${m?.anexos?.map((a) => a.nome).join(', ') || m?.texto?.slice(0, 60) || 'a mensagem'} · para ${x.pessoa.nome}. Nada sai sem você aprovar.`, acoes: ['Reenviar', 'Agora não'] }] }
                })
              }
              onDecidir={(id, acao) => {
                let texto = ''
                if (id.startsWith('lig-') && acao === 'Ligar à empresa') {
                  const cli = lojaConv.clientes.find((k) => id.startsWith(`lig-${k.id}-`))
                  if (cli) {
                    onAtualizar((x) => ({ ...x, lead: false, clienteId: cli.id, cliente: cli.nome, clienteInferido: false, itens: [...x.itens.map((it) => (it.tipo === 'cartao' && it.id === id ? { ...it, decidido: acao } : it)), marco(`${eu} ligou a conversa a ${cli.nome}`)] }))
                    return
                  }
                }
                if (id.startsWith('reenv-') && acao === 'Reenviar') {
                  const orig = c.itens.find((i) => i.tipo === 'mensagem' && id.startsWith(`reenv-${i.id}-`)) as Extract<ItemConversa, { tipo: 'mensagem' }> | undefined
                  const canalNovo = orig?.canal === 'email' ? 'whatsapp' : 'email'
                  onAtualizar((x) => ({ ...x, itens: [...x.itens.map((it) => (it.tipo === 'cartao' && it.id === id ? { ...it, decidido: acao } : it)), { tipo: 'mensagem', id: `rv${Date.now()}`, de: 'atendente', autor: eu, hora: hora(), canal: canalNovo, texto: `Reenviando ${orig?.anexos?.length ? 'o documento' : 'a mensagem'} por aqui, ${x.pessoa.nome.split(' ')[0]}.`, anexos: orig?.anexos, entrega: 'enviada' }] }))
                  return
                }
                if (acao.startsWith('Criar') && c.cliente) {
                  const existente = lojaConv.tarefas.find((t) => t.conversa === c.id && t.status !== 'concluida')
                  if (existente && acao === 'Criar tarefas') texto = `tarefa ${existente.codigo} já ligada a esta conversa`
                  else {
                    const codigo = c.setor === 'dp' ? 'DP-001' : c.setor === 'fiscal' ? 'FIS-044' : c.setor === 'contabil' ? 'CTB-001' : 'GES-024'
                    const nova = lojaConv.criarTarefa({
                      codigo,
                      titulo: c.resumo?.split('.')[0] ?? `Atender ${c.pessoa.nome}`,
                      cliente: c.cliente,
                      setor: c.setor,
                      prazo: '20/11',
                      responsavel: { tipo: 'pessoa', nome: c.responsavel ?? eu },
                      status: 'a_fazer',
                      conversa: c.id,
                    })
                    texto = `tarefa ${codigo} criada e ligada a esta conversa`
                    lojaConv.toast(`Tarefa ${codigo} criada para ${c.cliente}.`)
                    fluxosConv.abrirTarefa(nova)
                  }
                }
                onAtualizar((x) => ({
                  ...x,
                  itens: [...x.itens.map((it) => (it.tipo === 'cartao' && it.id === id ? { ...it, decidido: acao } : it)), ...(texto ? [marco(texto)] : [])],
                }))
              }}
            />
          ))}
          {lojaConv.estado.digitando[c.id] && (
            <div role="status" className="flex items-end gap-2 self-start">
              <div className="bg-surface shadow-cartao flex items-center gap-2 rounded-lg px-4 py-3 text-sm">
                <span className="text-muted-foreground text-xs">{lojaConv.estado.digitando[c.id]} está digitando</span>
                <span className="flex gap-1" aria-hidden>
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="bg-muted-foreground/70 size-1.5 animate-bounce rounded-full" style={{ animationDelay: `${i * 150}ms` }} />
                  ))}
                </span>
              </div>
            </div>
          )}
          <div ref={fim} />
        </div>
      </AreaRolagem>

      {/* Campo (deixa o canto livre para o botão Chat) */}
      <div ref={refCampo} className="px-4 pb-3 sm:px-5 sm:pb-4">
        <div className="mx-auto max-w-3xl">
          {somenteLeitura ? (
            <div className="bg-sunken flex items-start gap-2.5 rounded-lg px-4 py-3 text-sm">
              <ArrowBendUpRightIcon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
              <p>
                <strong className="font-medium">Transferida para {c.transferidaPara}.</strong> As próximas mensagens do cliente sobre isto chegam lá, não aqui. Esta conversa fica só para leitura.
              </p>
            </div>
          ) : (
            <div className={cn('bg-raised shadow-campo flex flex-col gap-2 rounded-cartao p-2.5', modo === 'nota' && 'bg-warning/10 ring-warning/30 ring-1')}>
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <div className="bg-sunken flex rounded-full p-0.5">
                  {(['responder', 'nota'] as const).map((m) => (
                    <button key={m} type="button" onClick={() => setModo(m)} className={cn('cursor-pointer rounded-full px-2.5 py-1', modo === m ? 'bg-raised shadow-pilula' : 'text-muted-foreground')}>
                      <TextoFixo ativo={modo === m}>{m === 'responder' ? 'Responder' : 'Nota interna'}</TextoFixo>
                    </button>
                  ))}
                </div>
                {modo === 'responder' && (
                  <Menu
                    gatilho={
                      <button type="button" className="text-muted-foreground hover:text-foreground flex cursor-pointer items-center gap-1 rounded-full px-2 py-1">
                        por <IconeCanal canal={canal} /> {rotuloCanal[canal]} <CaretDownIcon className="size-3" />
                      </button>
                    }
                  >
                    {(['whatsapp', 'email', 'app'] as CanalCrm[]).map((k) => (
                      <ItemMenu key={k} icone={<IconeCanal canal={k} />} onClick={() => setCanal(k)} detalhe={k === 'whatsapp' && !c.janelaAberta ? 'fora da janela de 24 h: só modelo' : undefined}>
                        {rotuloCanal[k]}
                      </ItemMenu>
                    ))}
                  </Menu>
                )}
                {modo === 'nota' && <span className="text-muted-foreground">fica no escritório; nunca sai pelo canal · @ menciona</span>}
              </div>

              {modo === 'responder' && foraDaJanela && (
                <div className="flex flex-col gap-1.5 rounded-md px-1 text-xs">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <WarningIcon className="text-warning size-3.5" /> {primeiroNome} não escreve há mais de 24 h: no WhatsApp, só modelo aprovado.
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {modelosForaDaJanela.map((m) => (
                      <button
                        key={m.nome}
                        type="button"
                        onClick={() => setTexto(m.texto.replace('{nome}', primeiroNome).replace('{competencia}', '10/2026').replace('{lista}', 'extrato do Inter'))}
                        className="bg-sunken hover:bg-accent cursor-pointer rounded-full px-2.5 py-1"
                      >
                        {m.nome}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {cnpjErrado && (
                <div role="alert" className="bg-destructive/10 text-foreground flex items-start gap-2 rounded-md px-3 py-2 text-xs">
                  <WarningIcon weight="fill" className="mt-0.5 size-4 shrink-0" />
                  <span>
                    Envio bloqueado: {anexo} é de {lojaConv.clientes.find((k) => k.id === anexoDoc?.clienteId)?.nome} ({lojaConv.clientes.find((k) => k.id === anexoDoc?.clienteId)?.documento}), não de {c.cliente} ({lojaConv.clientes.find((k) => k.id === c.clienteId)?.documento}). Troque o anexo.
                  </span>
                </div>
              )}
              {modo === 'responder' && cfgAtend.assinatura.modo !== 'desligado' && (
                <span className="text-muted-foreground px-1.5 text-xs">sai assinada: {assinar('…', eu, rotuloSetor[c.setor] ?? '', cfgAtend.assinatura).replace(/\n/g, ' ').replace(/\*/g, '')}</span>
              )}
              <textarea
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    enviar()
                  }
                }}
                readOnly={modo === 'responder' && foraDaJanela && !texto}
                rows={2}
                placeholder={modo === 'nota' ? 'Nota para a equipe…' : foraDaJanela ? 'Escolha um modelo acima' : `Responder ${primeiroNome} por ${rotuloCanal[canal]}… ( / para respostas rápidas)`}
                className="placeholder:text-muted-foreground min-h-12 resize-none bg-transparent px-1.5 text-sm outline-none"
              />
              {modo === 'responder' && texto === '/' && (
                <ul className="bg-popover flex flex-col rounded-md border p-1 text-sm">
                  {respostasRapidas.map((r) => (
                    <li key={r.atalho}>
                      <button type="button" onClick={() => setTexto(r.texto)} className="hover:bg-accent flex w-full cursor-pointer gap-2 rounded-md px-2 py-1.5 text-left">
                        <code className="text-muted-foreground text-xs">{r.atalho}</code>
                        <span className="truncate">{r.texto}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex items-center gap-1">
                {anexo ? (
                  <Tooltip conteudo={`Tirar ${anexo}`}>
                    <Button size="icon-sm" variant="secondary" className="rounded-full" aria-label={`Tirar anexo ${anexo}`} onClick={() => setAnexoDoc(null)}>
                      <PaperclipIcon />
                    </Button>
                  </Tooltip>
                ) : (
                  <Menu
                    gatilho={
                      <Button size="icon-sm" variant="ghost" className="rounded-full" aria-label="Anexar">
                        <PaperclipIcon />
                      </Button>
                    }
                  >
                    <RotuloMenu>Documentos de {c.cliente ?? 'quem escreve'}</RotuloMenu>
                    {docsDoCliente.map((d) => (
                      <ItemMenu key={d.id} onClick={() => setAnexoDoc({ nome: d.nome_arquivo, clienteId: d.cliente_id })}>
                        {d.nome_arquivo}
                      </ItemMenu>
                    ))}
                    <ItemMenu onClick={() => setAnexo(`Documento ${c.cliente ?? ''} ${new Date().toLocaleDateString('pt-BR')}.pdf`.replace('  ', ' '))}>Enviar arquivo do computador</ItemMenu>
                    {docOutraEmpresa && c.clienteId && (
                      <ItemMenu detalhe="demonstra a conferência do CNPJ (D-34)" onClick={() => setAnexoDoc({ nome: docOutraEmpresa.nome_arquivo, clienteId: docOutraEmpresa.cliente_id })}>
                        {docOutraEmpresa.nome_arquivo} (de outra empresa)
                      </ItemMenu>
                    )}
                  </Menu>
                )}
                {modo === 'responder' && (
                  <>
                    <Tooltip conteudo="Respostas rápidas">
                      <Button size="icon-sm" variant="ghost" className="rounded-full" aria-label="Respostas rápidas" onClick={() => setTexto('/')}>
                        <LightningIcon />
                      </Button>
                    </Tooltip>
                    <Button size="sm" variant="ghost" className="text-muted-foreground h-8 rounded-full px-2" onClick={sugerir} disabled={escrevendo}>
                      {escrevendo ? <span className="border-foreground/30 border-t-foreground size-3.5 animate-spin rounded-full border-2" /> : <SparkleIcon />}
                      {escrevendo ? 'o integrante está escrevendo…' : 'integrante sugere'}
                    </Button>
                    <Menu
                      gatilho={
                        <Button size="sm" variant="ghost" className="text-muted-foreground h-8 rounded-full px-2">
                          <TextAaIcon /> tom
                        </Button>
                      }
                    >
                      <RotuloMenu>O integrante reescreve; você revisa antes de enviar</RotuloMenu>
                      {(['formal', 'direto', 'amigável', 'para leigo'] as const).map((t) => (
                        <ItemMenu key={t} onClick={() => tom(t)}>
                          {t}
                        </ItemMenu>
                      ))}
                    </Menu>
                  </>
                )}
                <Button size="sm" className="ml-auto rounded-full" onClick={enviar} disabled={!texto.trim() || texto === '/' || cnpjErrado}>
                  {modo === 'nota' ? (
                    <>
                      <NotePencilIcon /> Salvar nota
                    </>
                  ) : (
                    <>
                      <PaperPlaneRightIcon /> Enviar
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      <DialogoAgendar c={c} aberto={dialogo === 'agendar'} onFechar={() => setDialogo(null)} onAtualizar={onAtualizar} />
      <DialogoMover c={c} conversas={conversas} aberto={dialogo === 'mover'} onFechar={() => setDialogo(null)} onMover={onMover} />
      <DialogoAutorizacao c={c} aberto={dialogo === 'autorizacao'} onFechar={() => setDialogo(null)} onAtualizar={onAtualizar} />
      <DialogoLigarCliente c={c} aberto={dialogo === 'ligar'} onFechar={() => setDialogo(null)} onAtualizar={onAtualizar} />
    </section>
  )
}

/** Lateral (04, 4.2): o cadastro projetado na conversa. */
function Lateral({ c, tarefas, onAbrirLead, className }: { c: ConversaCrm; tarefas: Tarefa[]; onAbrirLead?: () => void; className?: string }) {
  const fluxos = useFluxos()
  const nav = useNavegacao()
  const loja = useLoja()
  const lat0 = c.clienteId ? lateralCliente[c.clienteId] : undefined
  const ficha = loja.fichaDe(c.clienteId)
  const lat = lat0 && ficha ? { ...lat0, responsavel: ficha.responsaveis } : lat0
  const abertas = tarefas.filter((t) => t.cliente === c.cliente && t.setor === c.setor && t.status !== 'concluida')
  return (
    <aside aria-label="Cadastro" className={cn('flex flex-col gap-4 p-4 text-sm', className)}>
      {c.lead ? (
        <Bloco titulo="Lead">
          <p>
            Etapa: <strong className="font-medium">Lead</strong> · origem site
          </p>
          <p className="text-muted-foreground text-xs">Qualificação em andamento pelo integrante de Atendimento. Preço nunca é citado pela IA; o responsável marca a conversa.</p>
          <Button size="sm" variant="outline" className="w-fit rounded-full" onClick={onAbrirLead}>
            Abrir no quadro de leads
          </Button>
        </Bloco>
      ) : (
        <Bloco titulo="Cliente">
          <p className="font-medium">{c.cliente}</p>
          {lat && <p className="text-muted-foreground text-xs">{lat.perfil}</p>}
          {lat && (
            <ul className="text-xs">
              {Object.entries(lat.responsavel).map(([s, p]) => (
                <li key={s} className={cn(s === c.setor ? 'font-medium' : 'text-muted-foreground')}>
                  {rotuloSetor[s as SetorIntegrante] ?? s}: {p}
                </li>
              ))}
            </ul>
          )}
          <span className="flex flex-wrap gap-1">
            {c.clienteId && (
              <Button size="sm" variant="outline" className="h-7 rounded-full px-2.5 text-xs" onClick={() => fluxos.fichaCliente(c.clienteId!)}>
                Ficha do cliente
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="h-7 rounded-full px-2.5 text-xs"
              onClick={() => nav.irPara({ modulo: 'painel', aba: c.setor === 'consultor' ? 'consultoria' : c.setor === 'gestao_atendimento' ? 'gestao' : c.setor, cliente: c.clienteId })}
            >
              Abrir no Painel
            </Button>
            <Button size="sm" variant="outline" className="h-7 rounded-full px-2.5 text-xs" onClick={() => nav.irPara({ modulo: 'inicio', aba: 'time', integrante: integranteDoSetor(c.setor), cliente: c.clienteId })}>
              Falar com o integrante
            </Button>
          </span>
        </Bloco>
      )}
      <Bloco titulo="Quem escreve">
        <p>
          {c.pessoa.nome} <span className="text-muted-foreground">· {c.pessoa.papel}</span>
        </p>
        <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
          <IconeCanal canal={c.canal} /> {c.pessoa.contato}
        </p>
        {!c.lead && (
          <div className="flex flex-wrap gap-1">
            <Badge variant="sucesso">WhatsApp com opt-in</Badge>
            <Badge variant="outline">e-mail</Badge>
          </div>
        )}
        {lat?.outrasEmpresas && <p className="text-muted-foreground text-xs">Também fala por: {lat.outrasEmpresas.join(', ')}</p>}
      </Bloco>
      {!c.lead && (
        <Bloco titulo={`Tarefas abertas no ${rotuloSetor[c.setor]} (${abertas.length})`}>
          {abertas.length ? (
            <ul className="flex flex-col gap-1">
              {abertas.slice(0, 4).map((t) => (
                <li key={t.id}>
                  <button type="button" onClick={() => fluxos.abrirTarefa(t.id)} className="hover:bg-sunken/70 -mx-1 flex w-[calc(100%+0.5rem)] cursor-pointer items-center gap-2 rounded-sm px-1 py-0.5 text-left text-xs">
                    <code className="text-muted-foreground">{t.codigo}</code>
                    <span className="min-w-0 flex-1 truncate">{t.titulo}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-xs">Nenhuma.</p>
          )}
          {c.tarefaAguardada && (
            <button
              type="button"
              className="cursor-pointer text-left text-xs underline-offset-2 hover:underline"
              onClick={() => {
                const t = tarefas.find((x) => c.tarefaAguardada?.startsWith(x.codigo) && x.cliente === c.cliente)
                if (t) fluxos.abrirTarefa(t.id)
              }}
            >
              Segurando a conversa: {c.tarefaAguardada}
            </button>
          )}
        </Bloco>
      )}
      {lat && (
        <Bloco
          titulo={`Pendências (${lat.pendencias.length})`}
          acao={
            lat.pendencias.length ? (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 rounded-full px-2 text-xs"
                onClick={() => c.cliente && fluxos.cobrar({ cliente: c.cliente, setor: c.setor, texto: '', assunto: lat.pendencias.map((p) => p.split(' · ')[0]).join(', ') })}
              >
                Cobrar
              </Button>
            ) : undefined
          }
        >
          {lat.pendencias.length ? (
            <ul className="flex flex-col gap-1 text-xs">
              {lat.pendencias.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-xs">Nada pendente.</p>
          )}
        </Bloco>
      )}
      {lat && (
        <Bloco titulo="Histórico">
          <p className="text-xs">{lat.historico} conversas neste setor</p>
          {lat.outrosSetores > 0 && <p className="text-muted-foreground text-xs">{lat.outrosSetores} em outros setores (sem acesso ao conteúdo)</p>}
        </Bloco>
      )}
    </aside>
  )
}

function Bloco({ titulo, acao, children }: { titulo: string; acao?: ReactNode; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-1.5">
      <header className="flex items-center gap-2">
        <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{titulo}</h3>
        {acao && <span className="ml-auto">{acao}</span>}
      </header>
      {children}
    </section>
  )
}

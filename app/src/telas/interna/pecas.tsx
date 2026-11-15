import {
  ArrowBendUpLeftIcon,
  CheckSquareOffsetIcon,
  ClockCounterClockwiseIcon,
  CopyIcon,
  DotsThreeIcon,
  FileIcon,
  LinkSimpleIcon,
  ListChecksIcon,
  LockSimpleIcon,
  MicrophoneIcon,
  PaperclipIcon,
  PaperPlaneRightIcon,
  PauseIcon,
  PencilSimpleIcon,
  PlayIcon,
  PushPinIcon,
  StopIcon,
  TrashIcon,
  UserCircleIcon,
  VideoCameraIcon,
  WarningIcon,
  XIcon,
  BuildingsIcon,
  CalendarCheckIcon,
} from '@phosphor-icons/react'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useDocumentos } from '@/ambiente/documentos'
import { useFluxos } from '@/ambiente/fluxos'
import { useAcoesInternas, usePresenca, rotuloPresenca, type DadosEnvio, type Presenca } from '@/ambiente/interna'
import { useLoja, useNavegacao } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import { FormularioModal, SeloDemonstracao, useFormulario } from '@/components/kit'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Campo, CampoArea, CampoEscolha, CampoTexto } from '@/components/ui/formulario'
import { ItemMenu, Menu, RotuloMenu } from '@/components/ui/menu'
import { Orb } from '@/components/ui/orb'
import { Tooltip } from '@/components/ui/tooltip'
import { dadoSensivel, extrasDe, linkReuniao, partesDoTexto, quando, type Citacao, type Mencao } from '@/dados/interna'
import { cn } from '@/lib/utils'
import type { PedidoNovaTarefa } from '@/dados/tipos'
import type { ConversaInterna, Id, MensagemInterna } from '@/nucleo/modelo/entidades'
import { rotuloSetorCurto, todosSetores } from '@/nucleo/permissoes/setores'
import { useEscritorio, useTabela } from '@/nucleo/react'
import { repos } from '@/nucleo/repositorios'
import { useTema } from '@/theme/ThemeProvider'
import type { SetorIntegrante } from '@/theme/tipos'
import { AreaRolagem } from '@/components/ui/area-rolagem'

/* ---------- Presença e autor ---------- */

const corPresenca: Record<Presenca, string> = { disponivel: 'bg-success', ausente: 'bg-warning', espera: 'bg-muted-foreground', desligada: 'bg-transparent border border-muted-foreground' }

export function PontoPresenca({ presenca, className }: { presenca: Presenca; className?: string }) {
  return (
    <Tooltip conteudo={rotuloPresenca[presenca]}>
      <span role="img" aria-label={rotuloPresenca[presenca]} className={cn('ring-surface inline-block size-2.5 shrink-0 rounded-full ring-2', corPresenca[presenca], className)} />
    </Tooltip>
  )
}

/** Avatar de pessoa com presença, ou o orb do integrante (IA). */
export function AvatarAutor({ m, tamanho = 'md' }: { m: MensagemInterna; tamanho?: 'sm' | 'md' }) {
  const { integrante } = useTema()
  const presenca = usePresenca()
  const { nomeDe } = useAcoesInternas()
  const ia = extrasDe(m).ia
  if (ia) {
    const t = integrante(ia.setor as SetorIntegrante)
    return (
      <span className={cn('flex shrink-0 items-center justify-center self-start', tamanho === 'sm' ? 'size-6' : 'size-8')}>
        <Orb cor={t.cor} corOlhos={t.corOlhos} tamanho={tamanho === 'sm' ? 24 : 32} extras={false} cutucavel={false} rotulo={`${t.nome} (integrante)`} />
      </span>
    )
  }
  return (
    <span className="relative inline-flex h-fit shrink-0 self-start">
      <Avatar nome={nomeDe(m.autor_id)} tamanho={tamanho} />
      <PontoPresenca presenca={presenca(m.autor_id)} className="absolute -right-0.5 -bottom-0.5 size-2" />
    </span>
  )
}

/* ---------- Cartões clicáveis de cliente, tarefa, documento, obrigação (11, 3; S05-A74) ---------- */

/** Quem lê só abre o que pode ver (11, 1: respeita o sigilo). */
export function useAcessoCitacao() {
  const { usuario, permissoes } = useSessao()
  const escritorio = useEscritorio()
  return (c: Citacao) => {
    if (usuario.papel === 'administrador') return true
    if (c.tipo === 'tarefa' && c.setor_id && !(permissoes.setores as string[]).includes(c.setor_id)) return false
    if (c.cliente_id && escritorio?.carteira_ligada && usuario.carteira.length && !usuario.carteira.includes(c.cliente_id)) return false
    const cli = c.cliente_id ? repos.clientes.obter(c.cliente_id) : undefined
    if (cli?.extras?.restrito) return false
    return true
  }
}

const iconeCitacao = { cliente: BuildingsIcon, tarefa: ListChecksIcon, documento: FileIcon, obrigacao: CalendarCheckIcon }
const rotuloCitacao = { cliente: 'Cliente', tarefa: 'Tarefa', documento: 'Documento', obrigacao: 'Obrigação' }

export function CartaoCitacao({ c }: { c: Citacao }) {
  const pode = useAcessoCitacao()(c)
  const fluxos = useFluxos()
  const nav = useNavegacao()
  const docs = useDocumentos()
  const Icone = pode ? iconeCitacao[c.tipo] : LockSimpleIcon
  const tarefa = c.tipo === 'tarefa' ? repos.tarefas.obter(c.id) : undefined
  const abrir = () => {
    if (!pode) return
    if (c.tipo === 'cliente') fluxos.fichaCliente(c.id)
    if (c.tipo === 'tarefa') fluxos.abrirTarefa(c.id)
    if (c.tipo === 'documento') docs.abrir(c.rotulo)
    if (c.tipo === 'obrigacao') nav.irPara({ modulo: 'painel', aba: 'obrigacoes' })
  }
  return (
    <button
      type="button"
      onClick={abrir}
      disabled={!pode}
      className={cn('bg-raised shadow-contorno flex max-w-xs items-center gap-2.5 rounded-[14px] px-3 py-2 text-left text-xs', pode ? 'hover:bg-sunken cursor-pointer' : 'cursor-not-allowed opacity-80')}
    >
      <span className="bg-sunken text-muted-foreground flex size-7 shrink-0 items-center justify-center rounded-full">
        <Icone className="size-3.5" />
      </span>
      <span className="min-w-0">
        <span className="text-muted-foreground block text-xs tracking-wide uppercase">{pode ? rotuloCitacao[c.tipo] : 'Sem acesso'}</span>
        <span className="block truncate font-medium">{pode ? c.rotulo : `${rotuloCitacao[c.tipo]} de um cliente que você não vê`}</span>
        {pode && tarefa && <span className="text-muted-foreground block truncate">{tarefa.status.replace(/_/g, ' ')}{tarefa.prazo_legal ? ` · prazo ${tarefa.prazo_legal.split('-').reverse().slice(0, 2).join('/')}` : ''}</span>}
      </span>
    </button>
  )
}

/* ---------- Anexos e áudio ---------- */

export function ListaAnexos({ m }: { m: MensagemInterna }) {
  const docs = useDocumentos()
  const anexos = extrasDe(m).anexos ?? []
  if (!anexos.length) return null
  return (
    <div className="flex flex-wrap gap-2">
      {anexos.map((a) => (
        <button key={a.nome} type="button" onClick={() => docs.abrir(a.nome)} className="bg-raised shadow-contorno hover:bg-sunken flex cursor-pointer items-center gap-2 rounded-[12px] px-3 py-2 text-xs">
          <PaperclipIcon className="text-muted-foreground size-3.5" />
          <span className="max-w-48 truncate font-medium">{a.nome}</span>
          <span className="text-muted-foreground">{a.tamanho}</span>
        </button>
      ))}
    </div>
  )
}

export function PlayerAudio({ m, onTentar }: { m: MensagemInterna; onTentar: () => void }) {
  const a = extrasDe(m).audio
  const [tocando, setTocando] = useState(false)
  const [pos, setPos] = useState(0)
  useEffect(() => {
    if (!tocando || !a) return
    const t = window.setInterval(() => setPos((p) => (p + 1 >= a.duracao_seg ? (setTocando(false), 0) : p + 1)), 1000)
    return () => window.clearInterval(t)
  }, [tocando, a])
  if (!a) return null
  const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
  return (
    <div className="flex max-w-sm flex-col gap-1.5">
      <div className="bg-raised shadow-contorno flex items-center gap-2 rounded-full px-2 py-1.5">
        <Button size="icon-sm" variant="ghost" className="rounded-full" aria-label={tocando ? 'Pausar áudio' : 'Ouvir áudio'} onClick={() => setTocando((v) => !v)}>
          {tocando ? <PauseIcon weight="fill" /> : <PlayIcon weight="fill" />}
        </Button>
        <span className="bg-sunken relative h-1.5 flex-1 overflow-hidden rounded-full">
          <span className="bg-primary absolute inset-y-0 left-0 rounded-full transition-[width] duration-1000 ease-linear" style={{ width: `${(pos / a.duracao_seg) * 100}%` }} />
        </span>
        <span className="text-muted-foreground pr-2 text-xs tabular-nums">{mmss(tocando ? pos : a.duracao_seg)}</span>
      </div>
      <p className="text-muted-foreground text-xs">
        {a.estado === 'transcrevendo' && 'Transcrevendo…'}
        {a.estado === 'pronta' && (
          <>
            <span className="text-foreground/85 italic">“{a.transcricao}”</span> <SeloDemonstracao fonte="Transcrição de áudio" />
          </>
        )}
        {a.estado === 'indisponivel' && (
          <>
            Transcrição indisponível.{' '}
            <button type="button" className="text-primary cursor-pointer underline-offset-2 hover:underline" onClick={onTentar}>
              Tentar de novo
            </button>
          </>
        )}
      </p>
    </div>
  )
}

/* ---------- Versões (11, 1 e P1) ---------- */

export function DialogoVersoes({ m, onFechar }: { m: MensagemInterna | null; onFechar: () => void }) {
  const { nomeDe } = useAcoesInternas()
  return (
    <Dialog open={!!m} onOpenChange={(v) => !v && onFechar()}>
      <DialogContent className="bg-surface rounded-[24px] border-0 p-5 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-medium">Histórico de versões</DialogTitle>
          <DialogDescription>Mensagens não se apagam: cada edição guarda a versão anterior, visível a quem participa da conversa.</DialogDescription>
        </DialogHeader>
        {m && (
          <ol className="flex flex-col gap-3">
            <li className="bg-raised shadow-contorno rounded-[14px] p-3 text-sm">
              <span className="text-muted-foreground mb-1 block text-xs">Versão atual · editada {m.editada_em ? quando(m.editada_em) : ''}</span>
              {m.corpo}
            </li>
            {[...m.versoes].reverse().map((v, i) => (
              <li key={i} className="bg-sunken rounded-[14px] p-3 text-sm">
                <span className="text-muted-foreground mb-1 block text-xs">
                  Versão {m.versoes.length - i} · {nomeDe(v.por)} · até {quando(v.ate)}
                </span>
                {v.corpo}
              </li>
            ))}
          </ol>
        )}
      </DialogContent>
    </Dialog>
  )
}

/* ---------- Virar tarefa (11, 3; contrato C4) ---------- */

export function DialogoVirarTarefa({ m, inicial, onFechar, onCriada }: { m: MensagemInterna | null; inicial?: { titulo?: string; setor?: string; cliente_id?: Id | null; descricao?: string }; onFechar: () => void; onCriada?: (tarefaId: Id) => void }) {
  const { permissoes, contas } = useSessao()
  const loja = useLoja()
  const fluxos = useFluxos()
  const acoes = useAcoesInternas()
  const e = m ? extrasDe(m) : {}
  const setores = permissoes.setores.filter((s) => (todosSetores as string[]).includes(s))
  const base = {
    titulo: inicial?.titulo ?? m?.corpo.replace(/@\S+/g, '').replace(/\s+/g, ' ').trim().slice(0, 80) ?? '',
    setor: inicial?.setor && (setores as string[]).includes(inicial.setor) ? inicial.setor : (setores[0] ?? 'gestao_atendimento'),
    cliente: inicial?.cliente_id ?? e.citacoes?.find((c) => c.tipo === 'cliente')?.id ?? e.citacoes?.find((c) => c.cliente_id)?.cliente_id ?? '',
    prazo: '',
    responsavel: '',
    descricao: inicial?.descricao ?? '',
  }
  const f = useFormulario(base, (v) => ({ titulo: v.titulo.trim() ? null : 'Dê um título à tarefa.' }))
  const chave = m?.id ?? ''
  const [ultima, setUltima] = useState(chave)
  if (chave !== ultima) {
    setUltima(chave)
    f.reiniciar(base)
  }
  const doSetor = contas.filter((u) => u.situacao === 'ativo' && (u.papel === 'administrador' || u.vinculos.some((v) => v.setor === f.valores.setor)))
  return (
    <FormularioModal
      aberto={!!m}
      onFechar={onFechar}
      titulo="Transformar em tarefa"
      descricao="A tarefa nasce no Painel com o link de volta para esta mensagem."
      formulario={f}
      acao="Criar tarefa"
      onSalvar={(v) => {
        if (!m) return
        const t = acoes.virarTarefa(m.id, { titulo: v.titulo, setor: v.setor, cliente_id: v.cliente || null, prazo: v.prazo, responsavel: v.responsavel || null, descricao: v.descricao || m.corpo })
        onCriada?.(t.id)
        loja.toast(`Tarefa criada: ${t.titulo}`, { modulo: 'painel', aba: v.setor === 'consultor' ? 'consultoria' : v.setor, tarefa: t.id }, 'Abrir tarefa')
      }}
    >
      <Campo rotulo="Título" erro={f.erro('titulo')}>
        {(id) => <CampoTexto id={id} valor={f.valores.titulo} onMudar={(x) => f.definir('titulo', x)} />}
      </Campo>
      <div className="grid gap-3 sm:grid-cols-2">
        <Campo rotulo="Setor">{(id) => <CampoEscolha id={id} valor={f.valores.setor} onMudar={(x) => f.definir('setor', x)} opcoes={setores.map((s) => ({ valor: s, rotulo: rotuloSetorCurto[s] }))} />}</Campo>
        <Campo rotulo="Cliente">{(id) => <CampoEscolha id={id} valor={f.valores.cliente} onMudar={(x) => f.definir('cliente', x)} opcoes={[{ valor: '', rotulo: 'Do escritório' }, ...loja.clientes.map((c) => ({ valor: c.id, rotulo: c.nome }))]} />}</Campo>
        <Campo rotulo="Prazo interno">{(id) => <CampoTexto id={id} tipo="date" valor={f.valores.prazo} onMudar={(x) => f.definir('prazo', x)} />}</Campo>
        <Campo rotulo="Responsável">{(id) => <CampoEscolha id={id} valor={f.valores.responsavel} onMudar={(x) => f.definir('responsavel', x)} opcoes={[{ valor: '', rotulo: 'Sem responsável' }, ...doSetor.map((u) => ({ valor: u.id, rotulo: u.nome }))]} />}</Campo>
      </div>
      <Campo rotulo="Descrição">{(id) => <CampoArea id={id} valor={f.valores.descricao} onMudar={(x) => f.definir('descricao', x)} placeholder={m?.corpo} linhas={3} />}</Campo>
      <button
        type="button"
        className="text-primary -mt-1 self-start text-xs underline-offset-2 hover:underline"
        onClick={() => {
          // Contrato C4: o formulário completo da S04 recebe os campos que ele já souber usar.
          const pedido: PedidoNovaTarefa = { setor: f.valores.setor as SetorIntegrante, cliente: loja.clientes.find((c) => c.id === f.valores.cliente)?.nome, titulo: f.valores.titulo, origem: 'conversa_interna', origemRef: m?.id }
          onFechar()
          fluxos.novaTarefa(pedido)
        }}
      >
        Abrir no formulário completo de tarefa
      </button>
    </FormularioModal>
  )
}

/* ---------- Mensagem ---------- */

export interface AcoesMensagem {
  onFio?: (m: MensagemInterna) => void
  onVirarTarefa: (m: MensagemInterna, inicial?: { titulo?: string; setor?: string; cliente_id?: Id | null }) => void
  onVersoes: (m: MensagemInterna) => void
  podeFixar: boolean
  somenteLeitura?: boolean
}

export function Mensagem({ m, conversa, respostas = [], destaque, vistoPor, acoes, compacto }: { m: MensagemInterna; conversa: ConversaInterna; respostas?: MensagemInterna[]; destaque?: boolean; vistoPor?: string[]; acoes: AcoesMensagem; compacto?: boolean }) {
  const { usuario } = useSessao()
  const loja = useLoja()
  const fluxos = useFluxos()
  const acoesInternas = useAcoesInternas()
  const { nomeDe } = acoesInternas
  const e = extrasDe(m)
  const meu = m.autor_id === usuario.id
  const [editando, setEditando] = useState(false)
  const [texto, setTexto] = useState(m.corpo)
  const ref = useRef<HTMLLIElement>(null)
  useEffect(() => {
    if (destaque) ref.current?.scrollIntoView({ block: 'center' })
  }, [destaque])
  if (e.sistema)
    return (
      <li ref={ref} className="text-muted-foreground flex items-center gap-2 py-1 text-xs">
        <span className="bg-border h-px flex-1" />
        <span className="max-w-[80%] text-center">
          {m.corpo} · {quando(m.criado_em)}
        </span>
        <span className="bg-border h-px flex-1" />
      </li>
    )
  const partes = partesDoTexto(m.corpo, e.mencoes, e.citacoes)
  const reuniao = linkReuniao(m.corpo)
  const salvar = () => {
    try {
      acoesInternas.editar(m.id, texto)
      setEditando(false)
    } catch (err) {
      loja.toastErro(err instanceof Error ? err.message : String(err))
    }
  }
  return (
    <li ref={ref} id={`mi-${m.id}`} className={cn('group relative flex gap-3 rounded-[16px] px-2 py-2 transition-colors', destaque ? 'bg-primary/8' : 'hover:bg-sunken/60', m.fixada && conversa.tipo === 'canal_geral' && 'ring-warning/40 ring-1')}>
      <AvatarAutor m={m} tamanho={compacto ? 'sm' : 'md'} />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-xs">
          <span className="text-foreground text-sm font-medium">{e.ia ? e.ia.nome : nomeDe(m.autor_id)}</span>
          {e.ia && <Badge variant="outline" className="h-4 px-1.5 text-xs">IA · integrante</Badge>}
          <span className="text-muted-foreground tabular-nums">{quando(m.criado_em)}</span>
          {m.editada_em && (
            <button type="button" className="text-muted-foreground hover:text-foreground cursor-pointer underline-offset-2 hover:underline" onClick={() => acoes.onVersoes(m)}>
              editada
            </button>
          )}
          {m.fixada && (
            <span className="text-muted-foreground inline-flex items-center gap-1">
              <PushPinIcon weight="fill" className="text-warning size-3" /> fixada{e.fixada_por ? ` por ${e.fixada_por}` : ''}
            </span>
          )}
          {e.resumo === 'manha' && <Badge variant="destaque" className="h-4 px-1.5 text-xs">resumo da manhã</Badge>}
        </div>
        {editando ? (
          <div className="flex flex-col gap-2">
            <textarea
              autoFocus
              value={texto}
              aria-label="Editar mensagem"
              onChange={(x) => setTexto(x.target.value)}
              onKeyDown={(x) => {
                if (x.key === 'Enter' && !x.shiftKey) {
                  x.preventDefault()
                  salvar()
                }
                if (x.key === 'Escape') setEditando(false)
              }}
              rows={2}
              className="bg-raised shadow-contorno w-full resize-y rounded-[12px] px-3 py-2 text-sm outline-none"
            />
            <div className="flex items-center gap-2 text-xs">
              <Button size="sm" className="rounded-full" onClick={salvar}>
                Salvar
              </Button>
              <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setEditando(false)}>
                Cancelar
              </Button>
              <span className="text-muted-foreground">A versão anterior fica guardada.</span>
            </div>
          </div>
        ) : (
          <p className="text-foreground/90 text-sm leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere]">
            {partes.map((p, i) =>
              p.mencao ? (
                <span key={i} className={cn('rounded px-0.5 font-medium', p.mencao.tipo === 'integrante' ? 'bg-primary/10 text-primary' : p.mencao.id === usuario.id ? 'bg-warning/25' : 'bg-sunken')}>
                  {p.texto}
                </span>
              ) : p.citacao ? (
                <span key={i} className="font-medium underline decoration-dotted underline-offset-2">
                  {p.texto}
                </span>
              ) : (
                <span key={i}>{p.texto}</span>
              ),
            )}
          </p>
        )}
        {e.audio && <PlayerAudio m={m} onTentar={() => acoesInternas.transcreverDeNovo(m.id)} />}
        <ListaAnexos m={m} />
        {reuniao && (
          <a href={reuniao} target="_blank" rel="noreferrer" className="bg-raised shadow-contorno hover:bg-sunken flex w-fit items-center gap-2 rounded-[12px] px-3 py-2 text-xs">
            <VideoCameraIcon className="text-primary size-4" /> Entrar na reunião <span className="text-muted-foreground max-w-40 truncate">{reuniao.replace(/^https?:\/\//, '')}</span>
          </a>
        )}
        {!!e.citacoes?.length && (
          <div className="flex flex-wrap gap-2">
            {e.citacoes.map((c) => (
              <CartaoCitacao key={`${c.tipo}-${c.id}`} c={c} />
            ))}
          </div>
        )}
        {e.tarefa_id && (
          <button type="button" onClick={() => fluxos.abrirTarefa(e.tarefa_id!)} className="text-primary flex w-fit cursor-pointer items-center gap-1.5 text-xs underline-offset-2 hover:underline">
            <CheckSquareOffsetIcon className="size-3.5" /> Virou tarefa: {e.tarefa_titulo}
          </button>
        )}
        {e.proposta && (
          <div className="bg-raised shadow-contorno flex max-w-md flex-col gap-2 rounded-[14px] p-3 text-xs">
            <span className="text-muted-foreground">Proposta de tarefa · {rotuloSetorCurto[e.proposta.setor as SetorIntegrante] ?? e.proposta.setor}</span>
            <span className="text-sm font-medium">{e.proposta.titulo}</span>
            {e.proposta.situacao === 'aberta' && !acoes.somenteLeitura ? (
              <div className="flex gap-2">
                <Button size="sm" className="rounded-full" onClick={() => acoes.onVirarTarefa(m, { titulo: e.proposta!.titulo, setor: e.proposta!.setor, cliente_id: e.proposta!.cliente_id })}>
                  Criar tarefa
                </Button>
                <Button size="sm" variant="ghost" className="rounded-full" onClick={() => acoesInternas.decidirProposta(m.id, 'recusada')}>
                  Não é pedido
                </Button>
              </div>
            ) : (
              <span className="text-muted-foreground">{e.proposta.situacao === 'criada' ? 'Tarefa criada.' : e.proposta.situacao === 'recusada' ? 'Marcado como não sendo pedido.' : ''}</span>
            )}
          </div>
        )}
        {e.ia?.demonstracao && <SeloDemonstracao fonte="Integrante (IA)" />}
        {!!respostas.length && acoes.onFio && (
          <button type="button" onClick={() => acoes.onFio?.(m)} className="text-primary flex w-fit cursor-pointer items-center gap-1.5 text-xs font-medium underline-offset-2 hover:underline">
            <ArrowBendUpLeftIcon className="size-3.5 -scale-x-100" /> {respostas.length} {respostas.length === 1 ? 'resposta' : 'respostas'} · última {quando(respostas.at(-1)!.criado_em)}
          </button>
        )}
        {vistoPor && vistoPor.length > 0 && <span className="text-muted-foreground text-xs">visto por {vistoPor.join(', ')}</span>}
      </div>
      {!acoes.somenteLeitura && !editando && (
        <div className="bg-surface shadow-contorno absolute -top-3 right-2 hidden items-center gap-0.5 rounded-full p-0.5 group-focus-within:flex group-hover:flex">
          {acoes.onFio && (
            <Tooltip conteudo="Responder em fio">
              <Button size="icon-sm" variant="ghost" className="size-7 rounded-full" aria-label="Responder em fio" onClick={() => acoes.onFio?.(m)}>
                <ArrowBendUpLeftIcon />
              </Button>
            </Tooltip>
          )}
          {meu && !e.ia && (
            <Tooltip conteudo="Editar (a versão anterior fica guardada)">
              <Button
                size="icon-sm"
                variant="ghost"
                className="size-7 rounded-full"
                aria-label="Editar mensagem"
                onClick={() => {
                  setTexto(m.corpo)
                  setEditando(true)
                }}
              >
                <PencilSimpleIcon />
              </Button>
            </Tooltip>
          )}
          <Menu
            align="end"
            gatilho={
              <Button size="icon-sm" variant="ghost" className="size-7 rounded-full" aria-label="Mais ações da mensagem">
                <DotsThreeIcon weight="bold" />
              </Button>
            }
          >
            <ItemMenu icone={<ListChecksIcon />} onClick={() => acoes.onVirarTarefa(m)} desabilitado={!!e.tarefa_id}>
              {e.tarefa_id ? 'Já virou tarefa' : 'Transformar em tarefa'}
            </ItemMenu>
            {acoes.podeFixar && conversa.tipo === 'canal_geral' && (
              <ItemMenu icone={<PushPinIcon />} onClick={() => loja.toast(acoesInternas.fixar(m.id, !m.fixada).fixada ? 'Mensagem fixada no topo do Geral' : 'Mensagem desafixada')}>
                {m.fixada ? 'Desafixar do topo' : 'Fixar no topo do Geral'}
              </ItemMenu>
            )}
            <ItemMenu icone={<CopyIcon />} onClick={() => void navigator.clipboard?.writeText(m.corpo).then(() => loja.toast('Texto copiado'), () => loja.toast('Não foi possível copiar'))}>
              Copiar texto
            </ItemMenu>
            <ItemMenu icone={<LinkSimpleIcon />} onClick={() => void navigator.clipboard?.writeText(`${location.origin}${location.pathname}#/interna/conversas?conversaInterna=${conversa.id}`).then(() => loja.toast('Link da conversa copiado'), () => loja.toast('Não foi possível copiar'))}>
              Copiar link da conversa
            </ItemMenu>
            {m.versoes.length > 0 && (
              <ItemMenu icone={<ClockCounterClockwiseIcon />} onClick={() => acoes.onVersoes(m)}>
                Ver versões ({m.versoes.length})
              </ItemMenu>
            )}
            <RotuloMenu>Nada se apaga</RotuloMenu>
            <ItemMenu icone={<TrashIcon />} desabilitado detalhe="Mensagens e anexos não podem ser apagadas, nem pelo Administrador. Dá para editar.">
              Excluir mensagem
            </ItemMenu>
          </Menu>
        </div>
      )}
    </li>
  )
}

/* ---------- Campo de escrever: menções (@), citações (#), anexos, áudio, aviso de dado sensível ---------- */

interface Sugestao {
  chave: string
  rotulo: string
  detalhe: string
  icone: ReactNode
  mencao?: Mencao
  citacao?: Citacao
}

function useSugestoes() {
  const { contas, usuario, permissoes } = useSessao()
  const { integrante } = useTema()
  const loja = useLoja()
  const tDocs = useTabela('documento')
  const tObrig = useTabela('obrigacao')
  return useMemo(() => {
    const integrantes = (['geral', ...permissoes.setores.filter((s) => s !== 'bpo_financeiro' && s !== 'gestao_atendimento' && s !== 'financeiro_escritorio')] as SetorIntegrante[]).map((s): Sugestao => {
      const t = integrante(s)
      return { chave: `i-${s}`, rotulo: t.nome, detalhe: 'integrante · responde no fio', icone: <span className="inline-flex size-[18px] shrink-0"><Orb cor={t.cor} tamanho={18} extras={false} cutucavel={false} /></span>, mencao: { tipo: 'integrante', id: s, rotulo: t.nome } }
    })
    const pessoas = contas.filter((u) => u.situacao === 'ativo' && u.id !== usuario.id).map((u): Sugestao => ({ chave: u.id, rotulo: u.nome, detalhe: 'pessoa', icone: <Avatar nome={u.nome} tamanho="sm" className="size-5" />, mencao: { tipo: 'pessoa', id: u.id, rotulo: u.nome } }))
    const setores = todosSetores.map((s): Sugestao => ({ chave: `s-${s}`, rotulo: `equipe ${rotuloSetorCurto[s]}`, detalhe: 'avisa todos do setor', icone: <UserCircleIcon className="size-5" />, mencao: { tipo: 'setor', id: s, rotulo: `equipe ${rotuloSetorCurto[s]}` } }))
    const clientes = loja.clientes.map((c): Sugestao => ({ chave: `c-${c.id}`, rotulo: c.nome, detalhe: `cliente ${c.codigo}`, icone: <BuildingsIcon className="size-5" />, citacao: { tipo: 'cliente', id: c.id, rotulo: c.nome, cliente_id: c.id } }))
    const tarefas = loja.tarefas
      .filter((t) => t.status !== 'concluida')
      .map((t): Sugestao => {
        const real = repos.tarefas.obter(t.id)
        return { chave: `t-${t.id}`, rotulo: t.titulo, detalhe: `tarefa · ${t.cliente ?? 'escritório'}`, icone: <ListChecksIcon className="size-5" />, citacao: { tipo: 'tarefa', id: t.id, rotulo: t.titulo, cliente_id: real?.cliente_id ?? null, setor_id: real?.setor_id ?? t.setor } }
      })
    const documentos = tDocs.filter((d) => !d.arquivado_em).slice(0, 60).map((d): Sugestao => ({ chave: `d-${d.id}`, rotulo: d.nome_arquivo, detalhe: 'documento', icone: <FileIcon className="size-5" />, citacao: { tipo: 'documento', id: d.id, rotulo: d.nome_arquivo, cliente_id: d.cliente_id ?? null } }))
    const obrigacoes = tObrig.filter((o) => !o.cancelada_em).map((o): Sugestao => ({ chave: `o-${o.id}`, rotulo: o.nome, detalhe: `obrigação · ${rotuloSetorCurto[o.gera_tarefa_para_setor as SetorIntegrante] ?? ''}`, icone: <CalendarCheckIcon className="size-5" />, citacao: { tipo: 'obrigacao', id: o.id, rotulo: o.nome, setor_id: o.gera_tarefa_para_setor } }))
    return { arroba: [...integrantes, ...pessoas, ...setores], cerquilha: [...clientes, ...tarefas, ...obrigacoes, ...documentos] }
  }, [contas, usuario.id, permissoes.setores, integrante, loja.clientes, loja.tarefas, tDocs, tObrig])
}

const semAcento = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export function CampoInterno({ conversa, respondeA, compacto, onEnviado, onMoverParaTarefa, placeholder }: { conversa: ConversaInterna; respondeA?: Id | null; compacto?: boolean; onEnviado?: () => void; onMoverParaTarefa: (texto: string) => void; placeholder?: string }) {
  const loja = useLoja()
  const acoes = useAcoesInternas()
  const sugestoes = useSugestoes()
  const [texto, setTexto] = useState('')
  const [mencoes, setMencoes] = useState<Mencao[]>([])
  const [citacoes, setCitacoes] = useState<Citacao[]>([])
  const [arquivos, setArquivos] = useState<File[]>([])
  const [gravando, setGravando] = useState<number | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [cursor, setCursor] = useState(0)
  const [sel, setSel] = useState(0)
  const area = useRef<HTMLTextAreaElement>(null)
  const arquivo = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (gravando === null) return
    const t = window.setInterval(() => setGravando((s) => (s === null ? null : s + 1)), 1000)
    return () => window.clearInterval(t)
  }, [gravando !== null]) // eslint-disable-line react-hooks/exhaustive-deps

  // Gatilho de sugestão: "@" ou "#" no começo ou depois de espaço, até o cursor.
  const antes = texto.slice(0, cursor)
  const gatilho = antes.match(/(?:^|\s)([@#])([^\s@#]{0,30}(?: [^\s@#]{0,20}){0,2})$/)
  const lista = gatilho ? (gatilho[1] === '@' ? sugestoes.arroba : sugestoes.cerquilha).filter((s) => semAcento(s.rotulo).includes(semAcento(gatilho[2]))).slice(0, 7) : []
  const escolher = (s: Sugestao) => {
    if (!gatilho) return
    const inicio = cursor - gatilho[2].length - 1
    const inserido = s.mencao ? `@${s.rotulo} ` : `${s.rotulo} `
    const novo = texto.slice(0, inicio) + inserido + texto.slice(cursor)
    setTexto(novo)
    if (s.mencao) setMencoes((x) => [...x.filter((y) => y.rotulo !== s.mencao!.rotulo), s.mencao!])
    if (s.citacao) setCitacoes((x) => [...x.filter((y) => y.id !== s.citacao!.id), s.citacao!])
    const pos = inicio + inserido.length
    setCursor(pos)
    setSel(0)
    requestAnimationFrame(() => {
      area.current?.focus()
      area.current?.setSelectionRange(pos, pos)
    })
  }
  const limpar = () => {
    setTexto('')
    setMencoes([])
    setCitacoes([])
    setArquivos([])
    setAviso(null)
    setCursor(0)
  }
  const enviar = async (forcar = false, audio?: DadosEnvio['audio']) => {
    if (!texto.trim() && !arquivos.length && !audio) return
    // Dado sensível num canal amplo: sugere mover para a tarefa do cliente (11, 5).
    const sensivel = conversa.tipo !== 'pessoal' ? dadoSensivel(texto) : null
    if (sensivel && !forcar && !audio) {
      setAviso(sensivel)
      return
    }
    try {
      await acoes.enviar(conversa.id, { corpo: texto, mencoes, citacoes, anexos: arquivos, audio, respondeA })
      limpar()
      onEnviado?.()
    } catch (e) {
      loja.toastErro(e instanceof Error ? e.message : String(e))
    }
  }
  return (
    <div className={cn('relative flex flex-col gap-2', compacto ? 'p-2' : 'p-3')}>
      {lista.length > 0 && (
        <AreaRolagem as="ul" role="listbox" aria-label={gatilho?.[1] === '@' ? 'Mencionar' : 'Citar'} className="bg-popover shadow-lg absolute right-3 bottom-full left-3 z-20 mb-1 flex max-h-72 flex-col rounded-[16px] border p-1">
          <li className="text-muted-foreground px-3 py-1 text-xs">{gatilho?.[1] === '@' ? 'Mencionar pessoa, equipe ou integrante' : 'Citar cliente, tarefa, obrigação ou documento'}</li>
          {lista.map((s, i) => (
            <li key={s.chave} role="option" aria-selected={i === sel}>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => escolher(s)} className={cn('flex w-full cursor-pointer items-center gap-2.5 rounded-[12px] px-3 py-1.5 text-left text-sm', i === sel ? 'bg-sunken' : 'hover:bg-sunken')}>
                <span className="text-muted-foreground flex size-5 items-center justify-center">{s.icone}</span>
                <span className="min-w-0 flex-1 truncate">{s.rotulo}</span>
                <span className="text-muted-foreground shrink-0 text-xs">{s.detalhe}</span>
              </button>
            </li>
          ))}
        </AreaRolagem>
      )}
      {aviso && (
        <div role="alert" className="bg-warning/12 flex flex-col gap-2 rounded-[14px] p-3 text-sm">
          <span className="flex items-start gap-2">
            <WarningIcon weight="fill" className="text-warning mt-0.5 size-4 shrink-0" />
            Parece haver {aviso} nesta mensagem, e este canal é amplo. Dados pessoais do cliente ficam melhor na tarefa dele.
          </span>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              className="rounded-full"
              onClick={() => {
                onMoverParaTarefa(texto)
                limpar()
              }}
            >
              Mover para uma tarefa
            </Button>
            <Button size="sm" variant="outline" className="rounded-full" onClick={() => void enviar(true)}>
              Enviar mesmo assim
            </Button>
            <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setAviso(null)}>
              Voltar e editar
            </Button>
          </div>
        </div>
      )}
      {arquivos.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {arquivos.map((f) => (
            <span key={f.name} className="bg-sunken flex items-center gap-1.5 rounded-full py-1 pr-1 pl-3 text-xs">
              <PaperclipIcon className="size-3" /> <span className="max-w-40 truncate">{f.name}</span>
              <button type="button" aria-label={`Tirar ${f.name}`} className="hover:bg-raised cursor-pointer rounded-full p-0.5" onClick={() => setArquivos((x) => x.filter((y) => y !== f))}>
                <XIcon className="size-3" />
              </button>
            </span>
          ))}
          <span className="text-muted-foreground self-center text-xs">vão para Arquivos e não se apagam</span>
        </div>
      )}
      <div className="bg-raised shadow-contorno flex flex-col rounded-[18px]">
        {gravando !== null ? (
          <div className="flex items-center gap-3 px-4 py-3 text-sm">
            <span className="bg-destructive size-2.5 animate-pulse rounded-full" />
            Gravando · {Math.floor(gravando / 60)}:{String(gravando % 60).padStart(2, '0')}
            <span className="text-muted-foreground text-xs">a transcrição conta no seu limite de IA</span>
            <span className="flex-1" />
            <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setGravando(null)}>
              Descartar
            </Button>
            <Button
              size="sm"
              className="rounded-full"
              onClick={() => {
                const s = Math.max(gravando, 3)
                setGravando(null)
                void enviar(true, { duracao_seg: s })
              }}
            >
              <StopIcon weight="fill" /> Enviar áudio
            </Button>
          </div>
        ) : (
          <textarea
            ref={area}
            value={texto}
            rows={compacto ? 1 : 2}
            aria-label={respondeA ? 'Responder no fio' : 'Mensagem para a equipe'}
            placeholder={placeholder ?? 'Escreva para a equipe. @ menciona, # cita cliente ou tarefa'}
            onChange={(e) => {
              setTexto(e.target.value)
              setCursor(e.target.selectionStart)
              setSel(0)
            }}
            onSelect={(e) => setCursor(e.currentTarget.selectionStart)}
            onKeyDown={(e) => {
              if (lista.length) {
                if (e.key === 'ArrowDown') {
                  e.preventDefault()
                  setSel((s) => (s + 1) % lista.length)
                  return
                }
                if (e.key === 'ArrowUp') {
                  e.preventDefault()
                  setSel((s) => (s - 1 + lista.length) % lista.length)
                  return
                }
                if (e.key === 'Enter' || e.key === 'Tab') {
                  e.preventDefault()
                  escolher(lista[sel] ?? lista[0])
                  return
                }
                if (e.key === 'Escape') {
                  setCursor(-1)
                  return
                }
              }
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                void enviar()
              }
            }}
            className="placeholder:text-muted-foreground max-h-40 min-h-10 w-full resize-none bg-transparent px-4 pt-3 pb-1 text-sm outline-none"
          />
        )}
        {gravando === null && (
          <div className="flex items-center gap-1 px-2 pb-2">
            <input ref={arquivo} type="file" multiple className="hidden" aria-label="Escolher arquivos" onChange={(e) => setArquivos((x) => [...x, ...Array.from(e.target.files ?? [])])} />
            <Tooltip conteudo="Anexar (vai para Arquivos)">
              <Button size="icon-sm" variant="ghost" className="rounded-full" aria-label="Anexar arquivo" onClick={() => arquivo.current?.click()}>
                <PaperclipIcon />
              </Button>
            </Tooltip>
            <Tooltip conteudo="Gravar áudio (com transcrição)">
              <Button size="icon-sm" variant="ghost" className="rounded-full" aria-label="Gravar áudio" onClick={() => setGravando(0)}>
                <MicrophoneIcon />
              </Button>
            </Tooltip>
            <Tooltip conteudo="Mencionar">
              <Button
                size="icon-sm"
                variant="ghost"
                className="rounded-full text-sm font-semibold"
                aria-label="Mencionar"
                onClick={() => {
                  const novo = `${texto}${texto && !texto.endsWith(' ') ? ' ' : ''}@`
                  setTexto(novo)
                  setCursor(novo.length)
                  area.current?.focus()
                }}
              >
                @
              </Button>
            </Tooltip>
            <Tooltip conteudo="Citar cliente, tarefa ou documento">
              <Button
                size="icon-sm"
                variant="ghost"
                className="rounded-full text-sm font-semibold"
                aria-label="Citar cliente, tarefa ou documento"
                onClick={() => {
                  const novo = `${texto}${texto && !texto.endsWith(' ') ? ' ' : ''}#`
                  setTexto(novo)
                  setCursor(novo.length)
                  area.current?.focus()
                }}
              >
                #
              </Button>
            </Tooltip>
            <span className="text-muted-foreground ml-1 hidden truncate text-xs sm:inline">{conversa.tipo === 'pessoal' ? 'Só vocês dois leem. Integrantes só se chamados.' : 'Mensagens não se apagam; dá para editar.'}</span>
            <span className="flex-1" />
            <Button size="icon-sm" className="rounded-full" aria-label="Enviar" disabled={!texto.trim() && !arquivos.length} onClick={() => void enviar()}>
              <PaperPlaneRightIcon />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

import { BellIcon, CalendarCheckIcon, ChatCircleDotsIcon, CheckIcon, DeviceMobileIcon, EnvelopeSimpleIcon, FileTextIcon, GearSixIcon, InfoIcon, ListChecksIcon, ShieldCheckIcon, SparkleIcon, TrayIcon, UserCircleIcon, WarningCircleIcon, WhatsappLogoIcon, XIcon, type Icon } from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'motion/react'
import { Avatar } from '@/components/ui/avatar'
import { useMemo, useState, type ReactNode } from 'react'
import { Badge, Contador } from '@/components/ui/badge'
import { Tooltip } from '@/components/ui/tooltip'
import { BotoesDecisao } from '@/components/compostos/botoes-decisao'
import * as exemplo from '@/dados/exemplo'
import type { Notificacao } from '@/nucleo/modelo/entidades'
import { useTabela } from '@/nucleo/react'
import { repos } from '@/nucleo/repositorios'
import type { SetorIntegrante } from '@/theme/tipos'
import { useEfeitosCartao } from './efeitos'
import { Button } from '@/components/ui/button'
import { Orb } from '@/components/ui/orb'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useAparencia } from '@/hooks/useAparencia'
import { cn } from '@/lib/utils'
import { useTema } from '@/theme/ThemeProvider'
import { useLoja, useNavegacao, usePersistente, type Destino, type Toast } from './loja'
import { useSessao } from './sessao'
import { AreaRolagem } from '@/components/ui/area-rolagem'
import { useMedia } from '@/hooks/useMedia'

/**
 * Notificações no canto inferior direito, como no WhatsApp Web ou no Discord: a
 * mais nova entra por baixo e empurra as outras para cima. Três desenhos:
 * - mensagem de cliente: a foto, o nome, a empresa e o começo do texto, com o canal;
 * - integrante: o orb no estado dele, o nome e o que fez (ou que precisa de você);
 * - confirmação do sistema: o ícone e o texto.
 */
export function Toasts() {
  const loja = useLoja()
  const celular = useMedia('(max-width: 639px)')
  const nav = useNavegacao()
  const abrir = (t: Toast) => {
    if (t.destino) nav.irPara(t.destino)
    loja.fecharToast(t.id)
  }
  return (
    // Acima do campo de escrever da tela (--desvio-campo) e, no celular, do menu inferior; no celular, só o aviso mais novo.
    <div className="pointer-events-none fixed right-4 bottom-[calc(var(--desvio-campo,0px)+1rem)] left-4 z-[60] flex flex-col items-end gap-2 max-md:bottom-[calc(var(--desvio-campo,0px)+5rem)] sm:left-auto sm:w-[22.5rem]" aria-live="polite" aria-label="Notificações">
      <AnimatePresence initial={false}>
        {(celular ? loja.estado.toasts.slice(-1) : loja.estado.toasts).map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, x: 32, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, transition: { duration: 0.18 } }}
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
            className="pointer-events-auto w-full"
          >
            <Notificacao t={t} onAbrir={() => abrir(t)} onFechar={() => loja.fecharToast(t.id)} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

/** "Contábil fechou a conciliação" ao lado do nome Contábil vira "Fechou a conciliação" (o nome já está em cima). */
function semNome(texto: string, nome: ReactNode) {
  if (typeof nome !== 'string') return texto
  const m = texto.match(new RegExp(`^${nome.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[:,]?\\s+`))
  if (!m) return texto
  const resto = texto.slice(m[0].length)
  return resto.charAt(0).toUpperCase() + resto.slice(1)
}

const rotuloCanal = { whatsapp: 'WhatsApp', email: 'E-mail', app: 'App' } as const
const fraseEstado = { trabalhando: 'começou', concluido: 'terminou', precisa_de_voce: 'precisa de você' } as const

function Notificacao({ t, onAbrir, onFechar }: { t: Toast; onAbrir: () => void; onFechar: () => void }) {
  const { integrante } = useTema()
  const q = t.quem
  const pede = q?.tipo === 'integrante' && q.estado === 'precisa_de_voce'
  let visual: ReactNode
  let nome: ReactNode = null
  let meta: string | null = null
  if (q?.tipo === 'integrante') {
    const i = integrante(q.setor)
    visual = (
      <span className="flex size-10 shrink-0 items-center justify-center">
        <Orb cor={i.cor} corOlhos={i.corOlhos} tamanho={40} estado={q.estado ?? 'concluido'} animado extras={false} cutucavel={false} />
      </span>
    )
    nome = i.nome
    meta = fraseEstado[q.estado ?? 'concluido']
  } else if (q?.tipo === 'contato') {
    const Canal = q.canal === 'whatsapp' ? WhatsappLogoIcon : q.canal === 'email' ? EnvelopeSimpleIcon : DeviceMobileIcon
    visual = (
      <span className="relative flex size-10 shrink-0">
        <Avatar nome={q.nome} tamanho="lg" className="size-10" />
        <span className={cn('ring-raised absolute -right-0.5 -bottom-0.5 flex size-[18px] items-center justify-center rounded-full ring-2', q.canal === 'whatsapp' ? 'bg-[#25d366] text-white' : 'bg-foreground text-background')}>
          <Canal className="size-[11px]" weight="fill" />
        </span>
      </span>
    )
    nome = q.nome
    meta = [q.cliente, rotuloCanal[q.canal]].filter(Boolean).join(' · ')
  } else if (t.erro) {
    visual = (
      <span className="bg-destructive/15 text-destructive flex size-10 shrink-0 items-center justify-center rounded-full">
        <WarningCircleIcon className="size-5" weight="duotone" />
      </span>
    )
  } else {
    visual = (
      <span className="bg-sunken flex size-10 shrink-0 items-center justify-center rounded-full">
        <CheckIcon className="size-4" weight="bold" />
      </span>
    )
  }
  return (
    <div
      role={t.destino ? 'button' : undefined}
      tabIndex={t.destino ? 0 : undefined}
      onClick={t.destino ? onAbrir : undefined}
      onKeyDown={(e) => t.destino && (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onAbrir())}
      className={cn('bg-raised shadow-campo group relative flex gap-3 rounded-cartao p-3.5 pr-9 text-sm', t.destino && 'hover:bg-surface cursor-pointer transition-colors')}
    >
      {pede && <span aria-hidden className="bg-highlight absolute top-4 left-0 h-6 w-[3px] rounded-r-full" />}
      {visual}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        {nome && (
          <p className="flex min-w-0 items-baseline gap-1.5">
            <span className="max-w-[70%] shrink-0 truncate font-semibold">{nome}</span>
            {meta && <span className={cn('min-w-0 truncate text-xs', pede ? 'text-highlight-text font-medium' : 'text-muted-foreground')}>{meta}</span>}
            <span className="text-muted-foreground ml-auto shrink-0 text-xs">agora</span>
          </p>
        )}
        <p className={cn('line-clamp-2 leading-snug', nome ? 'text-muted-foreground' : 'text-foreground pt-0.5')}>{semNome(t.texto, q?.tipo === 'integrante' ? nome : null)}</p>
        {t.destino && <span className="mt-1 text-xs font-medium">{t.rotuloDestino ?? 'Abrir'}</span>}
        {t.acao && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              t.acao!.executar()
              onFechar()
            }}
            className="hover:bg-sunken -ml-1.5 mt-1 w-fit cursor-pointer rounded-full px-1.5 py-0.5 text-xs font-medium underline-offset-2 hover:underline"
          >
            {t.acao.rotulo}
          </button>
        )}
      </div>
      <button
        type="button"
        aria-label="Fechar notificação"
        onClick={(e) => (e.stopPropagation(), onFechar())}
        className="text-muted-foreground hover:text-foreground hover:bg-sunken absolute top-2.5 right-2.5 flex size-6 cursor-pointer items-center justify-center rounded-full opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 max-sm:opacity-100"
      >
        <XIcon className="size-3.5" />
      </button>
    </div>
  )
}

const iconeCategoria: Record<Notificacao['categoria'], Icon> = {
  aprovacao: ShieldCheckIcon,
  tarefa: ListChecksIcon,
  pendencia: TrayIcon,
  conversa: ChatCircleDotsIcon,
  documento: FileTextIcon,
  prazo: CalendarCheckIcon,
  agente: SparkleIcon,
  sistema: InfoIcon,
  cliente: UserCircleIcon,
}
const rotuloCategoria: Record<Notificacao['categoria'], string> = { aprovacao: 'Aprovação', tarefa: 'Tarefa', pendencia: 'Pendência', conversa: 'Conversa', documento: 'Documento', prazo: 'Prazo', agente: 'Time', sistema: 'Sistema', cliente: 'Cliente' }
const plural: Partial<Record<Notificacao['categoria'], [string, string]>> = { documento: ['documento', 'documentos'], conversa: ['conversa', 'conversas'], tarefa: ['tarefa', 'tarefas'], pendencia: ['pendência', 'pendências'], prazo: ['prazo', 'prazos'] }

/** Avisos visíveis para a conta atual. */
export function useAvisosDaConta() {
  const loja = useLoja()
  const { usuario } = useSessao()
  const [descartados] = usePersistente<string[]>(`s01:sino:descartados:${usuario.id}`, [])
  const meus = loja.estado.avisos.filter((a) => (a.para.length === 0 || a.para.includes(usuario.id)) && !descartados.includes(a.id))
  return { meus, naoLidos: meus.filter((a) => !a.lidoPor.includes(usuario.id)).length }
}

type Linha = { tipo: 'um'; n: Notificacao } | { tipo: 'grupo'; chave: string; itens: Notificacao[] }

/**
 * Sino do cabeçalho (S01-T07; 01, 8; 03, 2.2): a central de tudo o que o
 * sistema avisa, com o mesmo registro da Visão geral e do chat.
 * - filtro todos e não lidos, e por categoria;
 * - prioridade escrita (urgente, alta), nunca só por cor;
 * - cartão de aprovação decidido aqui mesmo (vale em todos os lugares);
 * - três ou mais avisos da mesma categoria e cliente viram um grupo ("5 documentos da Empresa X");
 * - abrir leva ao item exato e marca lido; descartar tira da lista (e da contagem).
 */
export function CentralAvisos({ onPreferencias }: { onPreferencias?: () => void }) {
  const loja = useLoja()
  const nav = useNavegacao()
  const { usuario } = useSessao()
  const aparencia = useAparencia()
  const efeitos = useEfeitosCartao()
  const notificacoes = useTabela('notificacao')
  const clientes = useTabela('cliente')
  const [descartados, setDescartados] = usePersistente<string[]>(`s01:sino:descartados:${usuario.id}`, [])
  const [aberto, setAberto] = useState(false)
  const [filtro, setFiltro] = useState<'todos' | 'nao_lidos'>('todos')
  const [categoria, setCategoria] = useState<Notificacao['categoria'] | 'todas'>('todas')
  const [grupoAberto, setGrupoAberto] = useState<string | null>(null)
  const lido = (n: Notificacao) => n.lida_por.includes(usuario.id)
  const meus = useMemo(
    () => [...notificacoes].filter((n) => (n.destinatario_ids.length === 0 || n.destinatario_ids.includes(usuario.id)) && !descartados.includes(n.id)).sort((a, b) => (b.ordem ?? 0) - (a.ordem ?? 0) || b.criado_em.localeCompare(a.criado_em)),
    [notificacoes, usuario.id, descartados],
  )
  const naoLidos = meus.filter((n) => !lido(n)).length
  const categorias = [...new Set(meus.map((n) => n.categoria))]
  const lista = meus.filter((n) => (filtro === 'todos' || !lido(n)) && (categoria === 'todas' || n.categoria === categoria))
  const linhas = useMemo<Linha[]>(() => {
    const porChave = new Map<string, Notificacao[]>()
    for (const n of lista) if (n.cliente_id && plural[n.categoria]) porChave.set(`${n.categoria}:${n.cliente_id}`, [...(porChave.get(`${n.categoria}:${n.cliente_id}`) ?? []), n])
    const feitos = new Set<string>()
    const out: Linha[] = []
    for (const n of lista) {
      const chave = n.cliente_id ? `${n.categoria}:${n.cliente_id}` : ''
      const grupo = chave ? porChave.get(chave) : undefined
      if (grupo && grupo.length >= 3) {
        if (!feitos.has(chave)) out.push({ tipo: 'grupo', chave, itens: grupo })
        feitos.add(chave)
      } else out.push({ tipo: 'um', n })
    }
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lista.map((n) => n.id).join()])

  const abrir = (n: Notificacao) => {
    repos.notificacoes.ler(n.id, usuario.id)
    setAberto(false)
    if (n.acao) nav.irPara(n.acao as unknown as Destino)
  }
  const descartar = (ids: string[]) => {
    ids.forEach((id) => repos.notificacoes.ler(id, usuario.id))
    setDescartados((xs) => [...xs, ...ids.filter((id) => !xs.includes(id))])
    loja.toastDesfazer(ids.length === 1 ? 'Aviso descartado.' : `${ids.length} avisos descartados.`, () => setDescartados((xs) => xs.filter((x) => !ids.includes(x))))
  }
  /** Cartão pendente no chat do integrante que publicou o aviso (o mesmo registro: decidir aqui vale lá). */
  const cartaoDe = (n: Notificacao) => {
    if (n.categoria !== 'aprovacao') return null
    const destino = n.acao as { integrante?: string } | null
    const doIntegrante = destino?.integrante ?? exemplo.integrantes.find((i) => i.setor === n.setor_id && i.tipo !== 'criado_pelo_usuario')?.id
    const msgs = doIntegrante ? (loja.conversasTime[doIntegrante] ?? []) : []
    for (const m of [...msgs].reverse()) for (const c of m.cartoes ?? []) if (c.tipo === 'aprovacao' && !loja.estado.decisoes[c.id]) return { cartao: c, integrante: doIntegrante! }
    return null
  }
  const nomeCliente = (id?: string | null) => clientes.find((c) => c.id === id)?.nome

  const item = (n: Notificacao, recuo = false) => {
    const Icone = iconeCategoria[n.categoria]
    const t = n.setor_id && (n.categoria === 'aprovacao' || n.categoria === 'agente') ? aparencia({ setor: n.setor_id as SetorIntegrante }) : null
    const pendente = cartaoDe(n)
    return (
      <li key={n.id} className={cn('group relative', recuo && 'pl-6')}>
        <div className="hover:bg-sunken/60 flex w-full items-start gap-3 px-3 py-2.5">
          <button type="button" onClick={() => abrir(n)} className="flex min-w-0 flex-1 cursor-pointer items-start gap-3 text-left">
            <span className="mt-0.5 shrink-0">{t ? <Orb cor={t.cor} corOlhos={t.corOlhos} tamanho={22} cutucavel={false} extras={false} /> : <Icone className="text-muted-foreground size-5" />}</span>
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-1.5">
                {n.prioridade === 'urgente' && <Badge variant="erro">urgente</Badge>}
                {n.prioridade === 'alta' && n.categoria !== 'aprovacao' && <Badge variant="destaque">alta</Badge>}
                <span className={cn('text-sm', !lido(n) && 'font-medium')}>{n.titulo}</span>
              </span>
              {n.corpo && <span className="text-muted-foreground block text-xs">{n.corpo}</span>}
              <span className="text-muted-foreground block text-xs">
                {rotuloCategoria[n.categoria]} · {n.quando}
                {n.cliente_id && nomeCliente(n.cliente_id) ? ` · ${nomeCliente(n.cliente_id)}` : ''}
              </span>
            </span>
          </button>
          {!lido(n) && <span className="bg-destructive mt-1.5 size-2 shrink-0 rounded-full" aria-label="não lido" />}
          <Tooltip conteudo="Descartar">
            <button type="button" aria-label={`Descartar: ${n.titulo}`} onClick={() => descartar([n.id])} className="text-muted-foreground hover:text-foreground hover:bg-sunken flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full opacity-0 group-hover:opacity-100 focus-visible:opacity-100 max-sm:opacity-100">
              <XIcon className="size-3.5" />
            </button>
          </Tooltip>
        </div>
        {pendente && (
          <div className="px-3 pb-3 pl-12">
            <BotoesDecisao
              onDecidir={(d) => {
                if (d === 'editar_e_aprovar') {
                  setAberto(false)
                  nav.irPara({ modulo: 'inicio', aba: 'time', integrante: pendente.integrante })
                  return
                }
                efeitos(pendente.cartao.id, d)
                repos.notificacoes.ler(n.id, usuario.id)
              }}
            />
          </div>
        )}
      </li>
    )
  }

  return (
    <Popover open={aberto} onOpenChange={setAberto}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative shrink-0 rounded-full" aria-label={`Notificações (${naoLidos})`}>
          <BellIcon weight="duotone" className="size-5" />
          <Contador valor={naoLidos} className="absolute top-1 right-1" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(28rem,calc(100vw-1.5rem))] p-0">
        <div className="flex items-center gap-2 border-b px-3 py-2.5">
          <span className="flex-1 text-sm font-medium">Avisos</span>
          <div className="bg-sunken flex rounded-full p-0.5 text-xs">
            {(['todos', 'nao_lidos'] as const).map((f) => (
              <button key={f} type="button" onClick={() => setFiltro(f)} aria-pressed={filtro === f} className={cn('cursor-pointer rounded-full px-2.5 py-1', filtro === f && 'bg-raised shadow-pilula')}>
                {f === 'todos' ? 'Todos' : `Não lidos (${naoLidos})`}
              </button>
            ))}
          </div>
        </div>
        {categorias.length > 1 && (
          <AreaRolagem eixo="x" role="radiogroup" aria-label="Categoria" className="flex gap-1.5 border-b px-3 py-2 [scrollbar-width:none]">
            {(['todas', ...categorias] as const).map((c) => (
              <button key={c} type="button" role="radio" aria-checked={categoria === c} onClick={() => setCategoria(c)} className={cn('shrink-0 cursor-pointer rounded-full px-2.5 py-1 text-xs transition-colors', categoria === c ? 'bg-foreground text-background' : 'bg-sunken hover:bg-raised')}>
                {c === 'todas' ? 'Todas' : rotuloCategoria[c]}
              </button>
            ))}
          </AreaRolagem>
        )}
        <AreaRolagem as="ul" className="max-h-[60vh] py-1">
          {linhas.length === 0 && <li className="text-muted-foreground px-4 py-8 text-center text-sm">{filtro === 'nao_lidos' ? 'Tudo lido.' : 'Nada por aqui.'}</li>}
          {linhas.map((l) => {
            if (l.tipo === 'um') return item(l.n)
            const [cat] = l.chave.split(':') as [Notificacao['categoria']]
            const Icone = iconeCategoria[cat]
            const aberta = grupoAberto === l.chave
            const novos = l.itens.filter((n) => !lido(n)).length
            return (
              <li key={l.chave}>
                <div className="hover:bg-sunken/60 flex w-full items-start gap-3 px-3 py-2.5">
                  <button type="button" aria-expanded={aberta} onClick={() => setGrupoAberto(aberta ? null : l.chave)} className="flex min-w-0 flex-1 cursor-pointer items-start gap-3 text-left">
                    <Icone className="text-muted-foreground mt-0.5 size-5 shrink-0" />
                    <span className="min-w-0 flex-1">
                      <span className={cn('block text-sm', novos > 0 && 'font-medium')}>
                        {l.itens.length} {plural[cat]![1]} de {nomeCliente(l.itens[0].cliente_id) ?? 'um cliente'}
                      </span>
                      <span className="text-muted-foreground block text-xs">{aberta ? 'toque para recolher' : l.itens.slice(0, 2).map((n) => n.titulo).join(' · ')}</span>
                    </span>
                  </button>
                  {novos > 0 && <span className="bg-destructive mt-1.5 size-2 shrink-0 rounded-full" aria-label={`${novos} não lidos`} />}
                  <Tooltip conteudo="Descartar o grupo">
                    <button type="button" aria-label="Descartar o grupo" onClick={() => descartar(l.itens.map((n) => n.id))} className="text-muted-foreground hover:text-foreground hover:bg-sunken flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full">
                      <XIcon className="size-3.5" />
                    </button>
                  </Tooltip>
                </div>
                {aberta && <ul>{l.itens.map((n) => item(n, true))}</ul>}
              </li>
            )
          })}
        </AreaRolagem>
        <div className="flex items-center gap-1 border-t px-2 py-1.5">
          <Button size="sm" variant="ghost" className="rounded-full" disabled={!naoLidos} onClick={() => repos.notificacoes.lerTodas(usuario.id, meus.map((n) => n.id))}>
            <CheckIcon /> Marcar todos como lidos
          </Button>
          {onPreferencias && (
            <Button
              size="sm"
              variant="ghost"
              className="ml-auto rounded-full"
              onClick={() => {
                setAberto(false)
                onPreferencias()
              }}
            >
              <GearSixIcon /> Preferências
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

/* ---------- Botões de ação simples (registram, avisam e levam ao lugar certo) ---------- */

type PropsBotao = Omit<React.ComponentProps<typeof Button>, 'onClick'>

/** Faz a ação na hora: registra o evento com o nome de quem fez e mostra a confirmação. */
export function BotaoFeito({ texto, destino, rotuloDestino, aoFazer, ...props }: PropsBotao & { texto: string; destino?: Destino; rotuloDestino?: string; aoFazer?: () => void }) {
  const loja = useLoja()
  const { usuario } = useSessao()
  return (
    <Button
      {...props}
      onClick={() => {
        aoFazer?.()
        loja.registrar(usuario.nome, texto)
        loja.toast(texto, destino, rotuloDestino)
      }}
    />
  )
}

/** Leva a outro ponto do sistema. */
export function BotaoIr({ destino, ...props }: PropsBotao & { destino: Destino }) {
  const nav = useNavegacao()
  return <Button {...props} onClick={() => nav.irPara(destino)} />
}

/** Baixa um arquivo (na demonstração, confirma o download). */
export function BotaoBaixar({ nome, ...props }: PropsBotao & { nome: string }) {
  const loja = useLoja()
  return <Button {...props} onClick={() => loja.toast(`${nome} baixado.`)} />
}

/** Alterna um estado (pausar/retomar, ligar/desligar), com a confirmação de cada lado. */
export function BotaoAlternar({ rotulos, textos, inicial = false, ...props }: Omit<PropsBotao, 'children'> & { rotulos: [ReactNode, ReactNode]; textos: [string, string]; inicial?: boolean }) {
  const loja = useLoja()
  const { usuario } = useSessao()
  const [ligado, setLigado] = useState(inicial)
  return (
    <Button
      {...props}
      aria-pressed={ligado}
      onClick={() => {
        const t = ligado ? textos[1] : textos[0]
        setLigado(!ligado)
        loja.registrar(usuario.nome, t)
        loja.toast(t)
      }}
    >
      {ligado ? rotulos[1] : rotulos[0]}
    </Button>
  )
}

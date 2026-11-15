import { ArrowLeftIcon, FileTextIcon, ListChecksIcon, ChatCircleIcon, TableIcon } from '@phosphor-icons/react'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useFalarComIntegrante } from '@/ambiente/chat-moldura'
import { useContadorChat } from '@/ambiente/contadores-s01'
import { useClienteDaRota } from '@/ambiente/contexto-cliente'
import { useLoja, usePersistente } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import { NovoIntegrante } from '@/components/compostos/novo-integrante'
import { ProgressoTrabalho } from '@/components/compostos/progresso-trabalho'
import { Orb } from '@/components/ui/orb'
import { useAparencia } from '@/hooks/useAparencia'
import { useEnviarAoIntegrante } from './inicio/chat-integrante'
import { useEnviarAoGeral } from './inicio/roteador'
import { mensagensComTime } from './pedidoAoTime'
import { useHistorico } from './useHistorico'
import { historicoAssistente } from '@/dados/exemplo'
import { BlocoTarefas } from '@/components/compostos/bloco-tarefas'
import { CampoChat } from '@/components/compostos/campo-chat'
import { ListaIntegrantes } from '@/components/compostos/lista-integrantes'
import { AbasSegmentadas } from '@/components/compostos/abas-segmentadas'
import { Contador } from '@/components/ui/badge'
import { useEstadoChat, type AbaChat } from '@/ambiente/interna'
import { AbaEquipe } from './interna/AbaEquipe'
import { JanelaFlutuante } from './interna/JanelaFlutuante'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import type { Integrante, Mensagem, Tarefa } from '@/dados/tipos'
import { useTema } from '@/theme/ThemeProvider'
import { cn } from '@/lib/utils'
import { ListaMensagens } from './ListaMensagens'
import { AreaRolagem } from '@/components/ui/area-rolagem'

interface Props {
  /** Módulo (Painel, CRM...). */
  titulo: string
  /** Aba interna ativa, por extenso. As abas em si ficam no cabeçalho. */
  aba?: string
  /** Nome do cliente selecionado; ausente = carteira. */
  cliente?: string
  /** Tarefas do setor da aba; quando vier, mostra o bloco fixo (03, 2.4). */
  tarefas?: Tarefa[]
  /** Gaveta do chat (03, 2.5). */
  chat?: { nomeUsuario: string; conversaGeral: Mensagem[]; integrantes: Integrante[]; onAbrirIntegrante?: (s: Integrante['setor']) => void }
  children?: ReactNode
}

/**
 * Esqueleto genérico de módulo: conteúdo da aba, bloco de tarefas quando é aba
 * de setor, gaveta do chat no canto. As abas internas ficam no cabeçalho.
 * O conteúdo de cada aba é desenhado depois; aqui ficam os lugares (03, seção 5).
 */
export function ModuloTela({ titulo, aba, cliente, tarefas, chat, children }: Props) {
  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <AreaRolagem className="flex-1 px-4 py-4 sm:px-5">
        <div className="pagina flex flex-col gap-6">
          <header>
            <h1 className="text-3xl font-light tracking-tight">{aba ?? titulo}</h1>
            <p className="text-muted-foreground text-sm">
              {titulo} · {cliente ?? 'Carteira'}
            </p>
          </header>
          {children ?? (
            <div className="grid gap-4 md:grid-cols-3">
              <Lugar icone={<TableIcon />} titulo="Dados da aba" texto="Perfil do cliente e capturas" />
              <Lugar icone={<ListChecksIcon />} titulo="Pendências do setor" texto="O que está aguardando e de quem" />
              <Lugar icone={<FileTextIcon />} titulo="Documentos da aba" texto="Índice único de documentos" />
            </div>
          )}
          {tarefas && <BlocoTarefas className="bg-surface rounded-[24px]" setor={aba ?? titulo} cliente={cliente} tarefas={tarefas} />}
        </div>
      </AreaRolagem>
      {chat && <GavetaChat {...chat} contexto={cliente ?? 'Carteira'} />}
    </div>
  )
}

function Lugar({ icone, titulo, texto }: { icone: ReactNode; titulo: string; texto: string }) {
  return (
    <div className="border-foreground/15 bg-surface/60 flex min-h-32 flex-col gap-2 rounded-[24px] border border-dashed p-5">
      <span className="text-muted-foreground [&_svg]:size-5">{icone}</span>
      <span className="text-sm font-medium">{titulo}</span>
      <span className="text-muted-foreground text-xs">{texto}</span>
    </div>
  )
}

/**
 * Gaveta do chat (S01-T06; 03, 2.5), em qualquer módulo. Duas abas no topo
 * (DECISOES.md, Coordenação; contrato C8 revisto pela S05): **Equipe**
 * (comunicação interna, preenchida pela S05) e **Integrantes** (o Geral e o
 * time). No lado dos integrantes:
 * - abre no Geral, com a mesma conversa do Início › Assistente para o cliente
 *   da tela (trocar de cliente troca a conversa e avisa "agora falando de...");
 * - ícones à direita trocam para um integrante, sem sair da tela; "+" cria um;
 * - `falarComIntegrante(setor)` abre direto no chat dele (S01-A54).
 * O botão soma as não lidas da Equipe e os cartões dos integrantes. No celular
 * o botão some: o destino "Chat" do menu inferior abre a mesma gaveta.
 */
export function GavetaChat({ nomeUsuario, integrantes: iniciais, onAbrirIntegrante, contexto, acima }: NonNullable<Props['chat']> & { contexto: string; /** S05: sobe o botão onde há campo de escrever no canto (CRM › Conversas). */ acima?: boolean }) {
  const chat = useEstadoChat()
  const contador = useContadorChat()
  const clienteRota = useClienteDaRota()
  const [novos] = usePersistente<Integrante[]>('time.novos', [])
  const [pausados] = usePersistente<string[]>('time.pausados', [])
  const integrantes = useMemo(() => [...iniciais, ...novos].map((i) => (pausados.includes(i.id) ? { ...i, situacao: 'pausado' as const } : i)), [iniciais, novos, pausados])
  const [alvoId, setAlvoId] = useState<string | null>(null)
  const [criando, setCriando] = useState(false)
  const alvo = integrantes.find((i) => i.id === alvoId && i.setor !== 'geral')
  useFalarComIntegrante(
    useCallback(
      (pedido) => {
        const i = typeof pedido === 'string' ? integrantes.find((x) => x.setor === pedido && x.tipo !== 'criado_pelo_usuario') : integrantes.find((x) => x.id === pedido.id)
        setAlvoId(i && i.setor !== 'geral' ? i.id : null)
      },
      [integrantes],
    ),
  )

  return (
    <>
    <JanelaFlutuante />
    <Sheet open={chat.aberto} onOpenChange={chat.setAberto}>
      <SheetTrigger asChild>
        <Button className={cn('absolute right-4 bottom-4 z-10 rounded-full shadow-lg max-md:hidden sm:right-6 sm:bottom-6', acima && 'bottom-36 sm:bottom-40')} size="lg" aria-label={`Chat${contador.total ? `, ${contador.total} não lidas` : ''}`}>
          <ChatCircleIcon /> Chat
          <Contador valor={contador.total} />
        </Button>
      </SheetTrigger>
      <SheetContent className="gap-0 sm:max-w-xl">
        <SheetHeader className="gap-3">
          <SheetTitle className="sr-only">Chat</SheetTitle>
          <AbasSegmentadas
            rotulo="Abas do chat"
            className="self-start"
            abas={[
              { id: 'equipe', rotulo: 'Equipe', contador: contador.equipe },
              { id: 'integrantes', rotulo: 'Integrantes', contador: contador.doTime },
            ]}
            ativa={chat.aba}
            onTrocar={(id) => chat.setAba(id as AbaChat)}
          />
          <SheetDescription>{chat.aba === 'equipe' ? 'Conversas da equipe do escritório. Mensagens não se apagam.' : `contexto: ${contexto}`}</SheetDescription>
        </SheetHeader>
        {chat.aba === 'equipe' ? (
          <AbaEquipe conversa={chat.conversa} onConversa={chat.setConversa} onFechar={() => chat.setAberto(false)} />
        ) : (
          <div className="flex min-h-0 flex-1">
            {alvo ? (
              <ChatIntegranteGaveta key={alvo.id} integrante={alvo} nomeUsuario={nomeUsuario} onVoltar={() => setAlvoId(null)} onAbrirIntegrante={onAbrirIntegrante} onTelaCheia={() => (chat.setAberto(false), onAbrirIntegrante?.(alvo.setor))} />
            ) : (
              <ChatGeralGaveta key={clienteRota ?? 'todos'} chave={clienteRota ?? 'todos'} nomeUsuario={nomeUsuario} contexto={contexto} onAbrirIntegrante={(s) => setAlvoId(integrantes.find((i) => i.setor === s && i.tipo !== 'criado_pelo_usuario')?.id ?? null)} />
            )}
            <div className="border-l px-2 py-4">
              <ListaIntegrantes
                variante="icones"
                integrantes={integrantes}
                selecionado={alvo?.id ?? integrantes.find((i) => i.setor === 'geral')?.id}
                onSelecionar={(i) => setAlvoId(i.setor === 'geral' ? null : i.id)}
                onCriar={() => setCriando(true)}
              />
            </div>
          </div>
        )}
      </SheetContent>
      <NovoIntegranteGaveta aberto={criando} onFechar={() => setCriando(false)} onAtivar={(id) => setAlvoId(id)} />
    </Sheet>
    </>
  )
}

/** O Geral dentro da gaveta: a mesma conversa do Início para o cliente da tela. */
function ChatGeralGaveta({ chave, nomeUsuario, contexto, onAbrirIntegrante }: { chave: string; nomeUsuario: string; contexto: string; onAbrirIntegrante: (s: Integrante['setor']) => void }) {
  const loja = useLoja()
  const conversa = useHistorico(chave, nomeUsuario, historicoAssistente, true)
  const enviar = useEnviarAoGeral(conversa)
  const mensagens = mensagensComTime(conversa.atual.mensagens, loja.estado.assistente[conversa.atual.id])
  const { integrante } = useTema()
  const geral = integrante('geral')
  // Trocou de cliente com a gaveta aberta: a conversa troca sozinha e avisa (02, ad. 22).
  const [aviso, setAviso] = useState(true)
  useEffect(() => {
    const t = window.setTimeout(() => setAviso(false), 4000)
    return () => window.clearTimeout(t)
  }, [])
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      {aviso && (
        <p role="status" className="bg-sunken text-muted-foreground mx-4 mt-3 rounded-full px-3 py-1.5 text-center text-xs">
          Agora falando {contexto === 'Carteira' ? 'da carteira' : `de ${contexto}`}
        </p>
      )}
      <AreaRolagem className="flex-1 p-4">
        {mensagens.length === 0 ? (
          <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-3 text-center text-sm">
            <Orb cor={geral.cor} corOlhos={geral.corOlhos} tamanho={48} animado vivo />
            <p>Pergunte ao {geral.nome} sem sair da tela.</p>
          </div>
        ) : (
          <ListaMensagens mensagens={mensagens} acoes={{ onAbrirIntegrante }} />
        )}
      </AreaRolagem>
      <CampoChat className="p-3" onEnviar={enviar} desabilitado={conversa.pensando} placeholder={`Pergunte ao ${geral.nome}`} />
    </div>
  )
}

/** Um integrante dentro da gaveta: o mesmo chat do Time, em tamanho de gaveta. */
function ChatIntegranteGaveta({ integrante, nomeUsuario, onVoltar, onAbrirIntegrante, onTelaCheia }: { integrante: Integrante; nomeUsuario: string; onVoltar: () => void; onAbrirIntegrante?: (s: Integrante['setor']) => void; onTelaCheia: () => void }) {
  const loja = useLoja()
  const aparencia = useAparencia()
  const t = aparencia(integrante)
  const mensagens = loja.conversasTime[integrante.id] ?? []
  const { enviar, pensando } = useEnviarAoIntegrante(integrante, nomeUsuario)
  const trabalhos = loja.estado.trabalhos.filter((x) => x.situacao === 'rodando' && x.integrante === integrante.id)
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex items-center gap-2 border-b px-3 py-2">
        <Button variant="ghost" size="icon-sm" className="rounded-full" aria-label="Voltar ao Geral" onClick={onVoltar}>
          <ArrowLeftIcon />
        </Button>
        <Orb cor={t.cor} corOlhos={t.corOlhos} tamanho={28} estado={pensando ? 'pensando' : integrante.estado} extras={false} cutucavel={false} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{t.nome}</span>
          <span className="text-muted-foreground block truncate text-xs">{integrante.situacao === 'pausado' ? 'pausado' : integrante.resumo ?? integrante.funcao}</span>
        </span>
        <Button variant="ghost" size="sm" className="rounded-full" onClick={onTelaCheia}>
          Abrir no Time
        </Button>
      </div>
      <AreaRolagem className="flex-1 p-4">
        {mensagens.length === 0 ? (
          <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-3 text-center text-sm">
            <p>{integrante.funcao}.</p>
            <div className="flex flex-wrap justify-center gap-2">
              {integrante.sugestoes?.map((s) => (
                <button key={s} type="button" onClick={() => enviar(s, [])} className="bg-raised hover:bg-sunken shadow-contorno cursor-pointer rounded-full px-3 py-1 text-xs">
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <ListaMensagens mensagens={mensagens} acoes={{ onAbrirIntegrante }} />
        )}
        {trabalhos.map((x) => (
          <ProgressoTrabalho key={x.uid} trabalho={x} className="mt-4" />
        ))}
      </AreaRolagem>
      <CampoChat className="p-3" onEnviar={enviar} desabilitado={pensando} placeholder={`Escreva para ${t.nome}`} />
    </div>
  )
}

/** "+" da gaveta: o mesmo fluxo de novo integrante do Time; o criado entra na lista e abre o chat dele. */
function NovoIntegranteGaveta({ aberto, onFechar, onAtivar }: { aberto: boolean; onFechar: () => void; onAtivar: (id: string) => void }) {
  const [novos, setNovos] = usePersistente<Integrante[]>('time.novos', [])
  const { contas } = useSessao()
  return (
    <NovoIntegrante
      criados={novos.length}
      pessoas={contas.map((c) => c.nome)}
      aberto={aberto}
      onFechar={onFechar}
      onAtivar={(novo) => {
        setNovos((xs) => [...xs, novo])
        onAtivar(novo.id)
      }}
    />
  )
}

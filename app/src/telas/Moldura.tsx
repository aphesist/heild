import { ChatCircleIcon, DotsThreeOutlineIcon, HouseIcon, ListChecksIcon, TrayIcon, type Icon } from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState, type ReactNode } from 'react'
import { BuscaGlobal } from '@/ambiente/busca-global'
import { useContadorChat } from '@/ambiente/contadores-s01'
import { abrirChat } from '@/ambiente/interna'
import { useNavegacao } from '@/ambiente/loja'
import { LARGURA_ABERTA, LARGURA_FECHADA } from '@/components/compostos/barra-lateral'
import { SoLeituraNoCelular } from '@/components/compostos/edite-no-computador'
import { Contador } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useModoLateral, type ModoLateral } from '@/hooks/useMedia'
import { usePreferencia } from '@/hooks/usePreferencia'
import { cn } from '@/lib/utils'
import { hashParaDestino, useHash } from '@/nucleo/rotas'
import { TarefasTela } from './tarefas/GavetaTarefas'
import { ListaPendencias, usePendenciasPorCliente } from './inicio/pendencias'
import { AreaRolagem } from '@/components/ui/area-rolagem'

export interface EstadoLateral {
  aberta: boolean
  onAlternar: () => void
  /** Chame ao navegar: fecha a barra quando ela está por cima do conteúdo. */
  aoNavegar: () => void
  modo: ModoLateral
}

interface Props {
  lateral: (estado: EstadoLateral) => ReactNode
  /** `onAbrirMenu` só vem em tela estreita sem o menu inferior (hoje, nunca: o "Mais" abre a gaveta). */
  cabecalho: (p: { onAbrirMenu?: () => void }) => ReactNode
  children: ReactNode
  className?: string
  /** Sem o menu inferior no celular (vitrine, landing). */
  semMenuInferior?: boolean
}

/** Altura do menu inferior do celular (o conteúdo e os botões flutuantes sobem isso). */
export const ALTURA_MENU_INFERIOR = 64

/**
 * Casco de toda tela: fundo em degradê, barra lateral, cabeçalho e conteúdo.
 * - tela larga (>= 1280px): a barra aberta empurra o conteúdo e a escolha é lembrada;
 * - média (768 a 1279px): fechada ocupa 76px; aberta passa por cima, com véu;
 * - estreita (< 768px): sem barra; menu inferior com cinco destinos (03, 2.6;
 *   DECISOES.md, Coordenação): Início, Tarefas, Pendências, Chat e Mais. O
 *   "Mais" abre a barra como gaveta, com os demais módulos.
 * Ctrl+B (ou Cmd+B) abre e fecha; Esc fecha quando está por cima. A busca
 * global (Ctrl+K) mora aqui, igual em todo módulo.
 */
export function Moldura({ lateral, cabecalho, children, className, semMenuInferior }: Props) {
  const modo = useModoLateral()
  const [preferida, setPreferida] = usePreferencia('ui-lab:lateral-aberta', true)
  const [temporaria, setTemporaria] = useState(false)
  const [modoAnterior, setModoAnterior] = useState(modo)

  // Trocou de faixa de largura: a abertura temporária não vale mais.
  if (modo !== modoAnterior) {
    setModoAnterior(modo)
    setTemporaria(false)
  }

  const aberta = modo === 'fixa' ? preferida : temporaria
  const celular = modo === 'gaveta' && !semMenuInferior
  const porCima = modo !== 'fixa' && aberta
  const alternar = () => (modo === 'fixa' ? setPreferida((v) => !v) : setTemporaria((v) => !v))
  const fechar = () => setTemporaria(false)

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault()
        if (modo === 'fixa') setPreferida((v) => !v)
        else setTemporaria((v) => !v)
      }
      if (e.key === 'Escape') setTemporaria(false)
    }
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  }, [modo, setPreferida])

  const reservado = modo === 'fixa' ? (aberta ? LARGURA_ABERTA : LARGURA_FECHADA) : modo === 'sobreposta' ? LARGURA_FECHADA : 0
  const estado: EstadoLateral = { aberta, onAlternar: alternar, aoNavegar: () => modo !== 'fixa' && fechar(), modo }

  return (
    <div className={cn('from-background to-background-end text-foreground flex h-dvh overflow-hidden bg-gradient-to-b', className)} data-celular={celular || undefined}>
      <motion.div initial={false} animate={{ width: reservado }} transition={{ type: 'spring', stiffness: 420, damping: 40 }} className="relative z-40 shrink-0">
        {modo === 'gaveta' ? (
          <AnimatePresence>
            {aberta && (
              <motion.div
                key="gaveta"
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', stiffness: 420, damping: 40 }}
                className="absolute inset-y-0 left-0 shadow-2xl"
                // No celular a gaveta para em cima do menu inferior (o "Mais" continua à vista).
                style={celular ? { bottom: ALTURA_MENU_INFERIOR } : undefined}
              >
                {lateral(estado)}
              </motion.div>
            )}
          </AnimatePresence>
        ) : (
          <div className={cn('absolute inset-y-0 left-0 transition-shadow', porCima && 'shadow-2xl')}>{lateral(estado)}</div>
        )}
      </motion.div>

      <AnimatePresence>
        {porCima && (
          <motion.div
            key="veu"
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={fechar}
            className="fixed inset-0 z-30 bg-black/25"
          />
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        {cabecalho({ onAbrirMenu: modo === 'gaveta' && !celular ? alternar : undefined })}
        <main className="relative min-h-0 flex-1" style={celular ? { paddingBottom: ALTURA_MENU_INFERIOR } : undefined}>
          <ConteudoMoldura celular={celular}>{children}</ConteudoMoldura>
        </main>
      </div>
      {celular && <MenuInferior maisAberto={aberta} onMais={alternar} onFecharMais={fechar} />}
      <BuscaGlobal />
    </div>
  )
}

/** Configurações no celular: só leitura, com o aviso "edite no computador" (S01-A07). */
function ConteudoMoldura({ celular, children }: { celular: boolean; children: ReactNode }) {
  const modulo = hashParaDestino(useHash())?.modulo
  return (
    <SoLeituraNoCelular ativo={celular && modulo === 'config'} texto="Configurações mudam o escritório inteiro: no celular, só para conferir.">
      {children}
    </SoLeituraNoCelular>
  )
}

type Destino = 'inicio' | 'tarefas' | 'pendencias' | 'chat' | 'mais'

/** Menu inferior do celular: cinco destinos, decisão em um toque (03, 2.6). */
function MenuInferior({ maisAberto, onMais, onFecharMais }: { maisAberto: boolean; onMais: () => void; onFecharMais: () => void }) {
  const nav = useNavegacao()
  const hash = useHash()
  const modulo = hashParaDestino(hash)?.modulo ?? 'inicio'
  const [gaveta, setGaveta] = useState<'tarefas' | 'pendencias' | null>(null)
  const chat = useContadorChat()
  const pendencias = usePendenciasPorCliente().length

  const ativo: Destino = maisAberto ? 'mais' : gaveta ?? (modulo === 'inicio' ? 'inicio' : 'mais')
  const itens: { id: Destino; rotulo: string; Icone: Icon; contador?: number; acao: () => void }[] = [
    { id: 'inicio', rotulo: 'Início', Icone: HouseIcon, acao: () => (onFecharMais(), setGaveta(null), nav.irPara({ modulo: 'inicio', aba: 'visao' })) },
    { id: 'tarefas', rotulo: 'Tarefas', Icone: ListChecksIcon, acao: () => (onFecharMais(), setGaveta('tarefas')) },
    { id: 'pendencias', rotulo: 'Pendências', Icone: TrayIcon, contador: pendencias, acao: () => (onFecharMais(), setGaveta('pendencias')) },
    { id: 'chat', rotulo: 'Chat', Icone: ChatCircleIcon, contador: chat.total, acao: () => (onFecharMais(), setGaveta(null), abrirChat()) },
    { id: 'mais', rotulo: 'Mais', Icone: DotsThreeOutlineIcon, acao: () => (setGaveta(null), onMais()) },
  ]

  return (
    <>
      <nav aria-label="Menu principal" className="bg-sidebar shadow-painel fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around px-1 pb-[env(safe-area-inset-bottom)]" style={{ height: ALTURA_MENU_INFERIOR }}>
        {itens.map(({ id, rotulo, Icone, contador, acao }) => (
          <button
            key={id}
            type="button"
            onClick={acao}
            aria-current={ativo === id ? 'page' : undefined}
            aria-label={contador ? `${rotulo}, ${contador}` : rotulo}
            className={cn('relative flex min-w-0 flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 text-[11px] transition-colors', ativo === id ? 'text-foreground font-medium' : 'text-muted-foreground')}
          >
            {ativo === id && <motion.span layoutId="menu-inferior-traco" className="bg-foreground absolute top-0 h-[3px] w-8 rounded-b-full" />}
            <span className="relative">
              <Icone className="size-6" weight={ativo === id ? 'fill' : 'duotone'} />
              <Contador valor={contador ?? 0} className="absolute -top-1 -right-2.5" />
            </span>
            {rotulo}
          </button>
        ))}
      </nav>
      <Sheet open={gaveta !== null} onOpenChange={(v) => !v && setGaveta(null)}>
        <SheetContent className="bg-background gap-0 sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{gaveta === 'tarefas' ? 'Tarefas' : 'Pendências'}</SheetTitle>
            <SheetDescription>{gaveta === 'tarefas' ? 'As tarefas dos seus setores: decidir num toque; editar, na ficha da tarefa.' : 'O que os clientes devem. Cobrar vai pela conversa do setor, com o seu nome.'}</SheetDescription>
          </SheetHeader>
          <AreaRolagem className="flex-1 p-4">{gaveta === 'tarefas' ? <TarefasTela /> : <ListaPendencias compacta />}</AreaRolagem>
        </SheetContent>
      </Sheet>
    </>
  )
}

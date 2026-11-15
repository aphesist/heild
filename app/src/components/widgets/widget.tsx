import { ArrowClockwiseIcon, ArrowsOutCardinalIcon, LockSimpleIcon, MinusIcon, WarningCircleIcon } from '@phosphor-icons/react'
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetCorpo, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { dimensoes, type DefWidget, type TamanhoWidget } from './tipos'
import { AreaRolagem } from '@/components/ui/area-rolagem'

const ContextoTamanho = createContext<TamanhoWidget>('M')

/**
 * Estado dos dados de um widget (PADRAO_DE_INTERFACE.md, 3): pronto, carregando,
 * com erro ou sem permissão. Quem busca os dados (a tela, ou o Lab ao forçar o
 * estado) põe o contexto; a caixa do widget desenha o estado padrão, igual em
 * todos, no lugar do conteúdo: esqueleto, erro com "Tentar de novo" e sem acesso
 * com "Pedir acesso". Nada de cada widget inventar o seu.
 */
export type EstadoDadosWidget = 'pronto' | 'carregando' | 'erro' | 'sem-permissao'
export const ContextoEstadoWidget = createContext<{ estado: EstadoDadosWidget; onTentar?: () => void; onPedirAcesso?: () => void }>({ estado: 'pronto' })

const ContextoTituloWidget = createContext<string>('')

/** Título do widget em que o componente está (a gaveta de "Ver todos" usa). */
export function useTituloWidget() {
  return useContext(ContextoTituloWidget)
}

/** Tamanho do widget em que o componente está; para o conteúdo se adaptar. */
export function useTamanhoWidget() {
  return useContext(ContextoTamanho)
}

/** Verdadeiro se o tamanho atual é pelo menos tão largo/alto quanto o pedido. */
export function cabe(tamanho: TamanhoWidget, { colunas = 1, linhas = 1 }: { colunas?: number; linhas?: number }) {
  const d = dimensoes[tamanho]
  return d.colunas >= colunas && d.linhas >= linhas
}

interface Props {
  def: DefWidget
  tamanho: TamanhoWidget
  /** Tamanho que o conteúdo usa quando a grade fez o widget crescer (padrão: o escolhido). */
  conteudo?: TamanhoWidget
  editando?: boolean
  arrastando?: boolean
  onRemover?: () => void
  onTamanho?: (t: TamanhoWidget) => void
  className?: string
  /** Alça de arraste (atributos e eventos do dnd-kit), aplicada ao widget inteiro no modo Organizar. */
  alca?: Record<string, unknown>
  /** Ref da caixa (no modo Organizar, a caixa é a alça do teclado). */
  refArtigo?: (el: HTMLElement | null) => void
  /** Fora do modo Organizar: o toque longo que levanta o widget (evento do dnd-kit), no widget inteiro. */
  toque?: Record<string, unknown>
  /** Alças de mover e de tamanho (manipulação direta), desenhadas por cima da caixa. */
  alcas?: ReactNode
  /** Mostra as alças sem hover nem foco (widget levantado pelo toque, ou no meio do gesto de tamanho). */
  alcasVisiveis?: boolean
}

/**
 * A caixa de todo widget: mesma superfície, raio, respiro e cabeçalho.
 * Na grade, ganha as alças de mover e de tamanho ao passar o mouse, no foco
 * ou levantado pelo toque longo. No modo Organizar treme levemente, ganha o
 * botão de esconder e a escolha de tamanho.
 */
/**
 * Contrato de transbordo (PADRAO_DE_INTERFACE.md, 3): passou do teto, o corpo rola
 * com o esmaecido e o rodapé oferece "Ver tudo (N)", que abre o conteúdo inteiro
 * numa gaveta. N é o tamanho da maior lista do corpo (itens de lista, linhas de tabela).
 */
function useTransbordo(corpo: React.RefObject<HTMLDivElement | null>, ativo: boolean) {
  const [estado, setEstado] = useState<{ transborda: boolean; n: number; vazio: boolean }>({ transborda: false, n: 0, vazio: false })
  useEffect(() => {
    const el = corpo.current
    if (!el || !ativo) return
    const medir = () => {
      const transborda = el.scrollHeight > el.clientHeight + 4
      let n = 0
      // N é o total de verdade: o `data-total` da lista, ou os itens mais o "e mais N" da lista compacta.
      for (const lista of el.querySelectorAll<HTMLElement>('ul, ol, tbody, [role="table"]')) {
        const filhos = [...lista.children].filter((f) => !f.hasAttribute('data-cabecalho') && !f.hasAttribute('data-estado-vazio'))
        const mais = filhos.map((f) => /^\s*e mais ([\d.]+)/i.exec(f.textContent ?? '')).find(Boolean)
        const total = Number(lista.dataset.total) || (mais ? filhos.length - 1 + Number(mais[1].replace(/\./g, '')) : filhos.length)
        n = Math.max(n, total)
      }
      // Rede de segurança: corpo sem texto e sem nada para ver ou usar vira o estado vazio padrão (nunca um card em branco).
      const proprio = el.querySelector<HTMLElement>('[data-conteudo-widget]')
      const vazio = !!proprio && !proprio.innerText.trim() && !proprio.querySelector('button, input, select, textarea, a[href], img, svg, canvas, [role="status"], [data-estado-vazio]')
      setEstado((e) => (e.transborda === transborda && e.n === n && e.vazio === vazio ? e : { transborda, n, vazio }))
    }
    medir()
    const ro = new ResizeObserver(medir)
    ro.observe(el)
    if (el.firstElementChild) ro.observe(el.firstElementChild)
    const mo = new MutationObserver(medir)
    mo.observe(el, { childList: true, subtree: true })
    return () => {
      ro.disconnect()
      mo.disconnect()
    }
  }, [corpo, ativo])
  return estado
}

export function Widget({ def, tamanho, conteudo, editando, arrastando, onRemover, onTamanho, className, alca, refArtigo, toque, alcas, alcasVisiveis }: Props) {
  const Icone = def.icone
  const usado = conteudo ?? tamanho
  const corpo = useRef<HTMLDivElement>(null)
  const { transborda, n, vazio } = useTransbordo(corpo, !editando)
  const [tudo, setTudo] = useState(false)
  const dados = useContext(ContextoEstadoWidget)
  return (
    <ContextoTamanho.Provider value={usado}>
      <ContextoTituloWidget.Provider value={def.titulo}>
      <article
        ref={refArtigo}
        aria-label={def.titulo}
        data-alcas={alcasVisiveis || undefined}
        data-levantavel={toque ? '' : undefined}
        className={cn(
          'group/widget bg-surface shadow-cartao rounded-cartao relative flex h-full min-h-0 flex-col gap-3 p-4 transition-shadow',
          editando && 'widget-tremendo cursor-grab touch-none select-none active:cursor-grabbing',
          arrastando && 'opacity-40',
          className,
        )}
        {...(editando ? alca : toque)}
      >
        {/*
          Cabeçalho: ícone e título numa linha só (o título trunca, nunca empurra o ícone para cima);
          a ação fica à direita e desce para a linha de baixo só quando não cabe (celular, P).
          Os IDs do mapa são para quem revisa o wireframe: aparecem ao passar o mouse, não competem com o título.
        */}
        <header className="flex min-h-6 shrink-0 flex-wrap items-center gap-x-3 gap-y-1">
          <div className="flex min-w-0 flex-[1_1_9rem] items-center gap-2">
            {Icone && <Icone className="text-muted-foreground size-[18px] shrink-0" aria-hidden />}
            {/* No P (um número), o título pode ir a duas linhas: é ele que dá sentido ao número. */}
            <h3 className={cn('min-w-0 text-sm font-medium', usado === 'P' ? 'line-clamp-2 break-words' : 'truncate')} title={def.atividades ? `${def.titulo} · ${def.atividades}` : def.titulo}>
              {def.titulo}
            </h3>
            {def.atividades && usado !== 'P' && !editando && (
              <code className="text-muted-foreground hidden min-w-0 shrink-[100] truncate font-mono text-xs opacity-0 transition-opacity duration-200 group-hover/widget:opacity-100 group-focus-within/widget:opacity-100 sm:inline">
                {def.atividades}
              </code>
            )}
          </div>
          {!editando && def.acao && <div className="ml-auto flex shrink-0 items-center">{def.acao}</div>}
          {editando && <ArrowsOutCardinalIcon className="text-muted-foreground ml-auto size-4" aria-hidden />}
        </header>
        <AreaRolagem ref={corpo} data-corpo-widget className={cn('@container flex-1', editando && 'pointer-events-none')}>
          {dados.estado === 'pronto' ? (
            <div data-conteudo-widget className="contents">
              {def.conteudo(usado)}
            </div>
          ) : (
            <EstadoDoWidget {...dados} titulo={def.titulo} tamanho={usado} />
          )}
          {dados.estado === 'pronto' && vazio && <VazioWidget>Nada por aqui ainda.</VazioWidget>}
        </AreaRolagem>
        {transborda && !editando && (
          <footer className="-mt-1 flex shrink-0 justify-end">
            <Button variant="ghost" size="sm" className="rounded-full" onClick={() => setTudo(true)}>
              Ver tudo{n > 1 ? ` (${n.toLocaleString('pt-BR')})` : ''}
            </Button>
          </footer>
        )}
        {tudo && (
          <Sheet open onOpenChange={(v) => !v && setTudo(false)}>
            <SheetContent className="gap-0 sm:max-w-2xl">
              <SheetHeader>
                <SheetTitle>{def.titulo}</SheetTitle>
                {def.descricao && <SheetDescription>{def.descricao}</SheetDescription>}
              </SheetHeader>
              <SheetCorpo className="@container">
                <ContextoTamanho.Provider value="XL">{def.conteudo('XL')}</ContextoTamanho.Provider>
              </SheetCorpo>
            </SheetContent>
          </Sheet>
        )}

        {!editando && alcas}
        {editando && (
          <>
            <button
              type="button"
              onClick={onRemover}
              onPointerDown={(e) => e.stopPropagation()}
              aria-label={`Esconder ${def.titulo}`}
              className="bg-foreground text-background shadow-pilula absolute -top-2 -left-2 z-10 flex size-6 cursor-pointer items-center justify-center rounded-full"
            >
              <MinusIcon weight="bold" className="size-3.5" />
            </button>
            {def.tamanhos.length > 1 && (
              <div
                className="bg-raised shadow-pilula absolute right-3 bottom-3 z-10 flex gap-0.5 rounded-full p-0.5"
                onPointerDown={(e) => e.stopPropagation()}
                role="radiogroup"
                aria-label={`Tamanho de ${def.titulo}`}
              >
                {def.tamanhos.map((t) => (
                  <button
                    key={t}
                    type="button"
                    role="radio"
                    aria-checked={t === tamanho}
                    title={dimensoes[t].rotulo}
                    onClick={() => onTamanho?.(t)}
                    className={cn('h-6 min-w-7 cursor-pointer rounded-full px-1.5 text-xs font-medium', t === tamanho ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </article>
      </ContextoTituloWidget.Provider>
    </ContextoTamanho.Provider>
  )
}

/**
 * Carregando, erro e sem acesso dentro do widget. Cabe em uma célula (P, M e L
 * têm uma linha de altura): ali só o título do estado e a ação; no G e no XL,
 * com o ícone e a explicação.
 */
function EstadoDoWidget({ estado, titulo, tamanho, onTentar, onPedirAcesso }: { estado: EstadoDadosWidget; titulo: string; tamanho: TamanhoWidget; onTentar?: () => void; onPedirAcesso?: () => void }) {
  const alto = tamanho === 'G' || tamanho === 'XL'
  if (estado === 'carregando')
    return (
      <div role="status" aria-label={`Carregando ${titulo}`} className="flex flex-col gap-2">
        {Array.from({ length: alto ? 5 : tamanho === 'P' ? 2 : 3 }, (_, i) => (
          <div key={i} className={cn('bg-sunken animate-pulse rounded-md motion-reduce:animate-none', i === 0 ? 'h-6 w-2/3' : 'h-4')} style={{ animationDelay: `${i * 90}ms` }} />
        ))}
      </div>
    )
  const erro = estado === 'erro'
  const Icone = erro ? WarningCircleIcon : LockSimpleIcon
  return (
    <div role={erro ? 'alert' : 'status'} data-estado-widget={estado} className="flex h-full flex-col items-center justify-center gap-2 text-center">
      {alto && (
        <span className={cn('flex size-9 items-center justify-center rounded-full', erro ? 'bg-destructive/15 text-destructive-text' : 'bg-sunken text-muted-foreground')}>
          <Icone className="size-5" aria-hidden />
        </span>
      )}
      <p className="flex min-w-0 items-center gap-1.5 text-sm font-medium text-balance">
        {!alto && <Icone className={cn('size-4 shrink-0', erro ? 'text-destructive-text' : 'text-muted-foreground')} aria-hidden />}
        {erro ? 'Não deu para carregar' : 'Sem acesso a estes dados'}
      </p>
      {alto && <p className="text-muted-foreground max-w-xs text-sm text-pretty">{erro ? 'O resto da tela continua funcionando. Tente de novo em instantes.' : 'Quem administra o escritório libera o acesso a este setor.'}</p>}
      <Button variant="outline" size="sm" className="rounded-full" onClick={erro ? onTentar : onPedirAcesso}>
        {erro ? (
          <>
            <ArrowClockwiseIcon /> Tentar de novo
          </>
        ) : (
          'Pedir acesso'
        )}
      </Button>
    </div>
  )
}

/**
 * Estado vazio de widget (PADRAO_DE_INTERFACE.md, 9): sozinho no corpo, fica no
 * centro; diz o porquê ou o que vem a seguir e, quando há uma ação que cria o
 * primeiro item ou leva aonde ele está, mostra o botão. Um só para todos.
 */
export function VazioWidget({ children, acao }: { children: ReactNode; acao?: ReactNode }) {
  return (
    <div data-estado-vazio role="status" className="flex h-full min-h-10 flex-col items-center justify-center gap-2 py-2 text-center">
      <p className="text-muted-foreground text-sm text-pretty">{children}</p>
      {acao}
    </div>
  )
}

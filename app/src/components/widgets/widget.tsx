import { ArrowsOutCardinalIcon, MinusIcon } from '@phosphor-icons/react'
import { createContext, useContext, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { dimensoes, type DefWidget, type TamanhoWidget } from './tipos'
import { AreaRolagem } from '@/components/ui/area-rolagem'

const ContextoTamanho = createContext<TamanhoWidget>('M')

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
  /** Alça de arraste (atributos e eventos do dnd-kit), aplicada ao widget inteiro no modo edição. */
  alca?: Record<string, unknown>
}

/**
 * A caixa de todo widget: mesma superfície, raio, respiro e cabeçalho.
 * No modo edição treme levemente, ganha o botão de esconder e a escolha de tamanho.
 */
export function Widget({ def, tamanho, conteudo, editando, arrastando, onRemover, onTamanho, className, alca }: Props) {
  const Icone = def.icone
  const usado = conteudo ?? tamanho
  return (
    <ContextoTamanho.Provider value={usado}>
      <article
        aria-label={def.titulo}
        className={cn(
          'group/widget bg-surface shadow-cartao rounded-cartao relative flex h-full min-h-0 flex-col gap-3 p-4 transition-shadow',
          editando && 'widget-tremendo cursor-grab touch-none select-none active:cursor-grabbing',
          arrastando && 'opacity-40',
          className,
        )}
        {...(editando ? alca : {})}
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
        <AreaRolagem data-corpo-widget className={cn('@container flex-1', editando && 'pointer-events-none')}>{def.conteudo(usado)}</AreaRolagem>

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
    </ContextoTamanho.Provider>
  )
}

/** Estado vazio padrão de conteúdo de widget. */
export function VazioWidget({ children }: { children: ReactNode }) {
  return <p data-estado-vazio className="text-muted-foreground flex h-full items-center justify-center px-2 text-center text-sm">{children}</p>
}

import { BuildingsIcon, CalendarBlankIcon, ClockIcon, CurrencyCircleDollarIcon, SparkleIcon, SquaresFourIcon, type Icon } from '@phosphor-icons/react'
import { forwardRef, useImperativeHandle, useLayoutEffect, useRef, type ReactNode, type TextareaHTMLAttributes } from 'react'
import type { CampoSuposicao, Suposicao } from '@/lib/suposicoes'
import { cn } from '@/lib/utils'
import type { ConfigValor, QualquerValor } from './tipos'
import { ValorEditavel } from './valor-editavel'

/**
 * Suposições (feedforward): antes de enviar um pedido, o que a IA vai supor
 * aparece acima do campo, em texto discreto com ícone, e cada valor é um
 * ValorEditavel. A resposta começa com o mesmo resumo (ResumoSuposicoes).
 */
export const iconeDoCampo: Record<CampoSuposicao, Icon> = {
  cliente: BuildingsIcon,
  competencia: CalendarBlankIcon,
  setor: SquaresFourIcon,
  valor: CurrencyCircleDollarIcon,
  prazo: ClockIcon,
}

export const fraseDoCampo: Record<CampoSuposicao, string> = {
  cliente: 'Para',
  competencia: 'Competência',
  setor: 'Setor',
  valor: 'Valor',
  prazo: 'Prazo',
}

export interface LinhaSuposicao {
  s: Suposicao
  config: ConfigValor
  /** Rótulo do campo para o leitor de tela e o título do seletor. */
  rotulo: string
}

/** A faixa acima do campo: "Vou supor: Para **Padaria** · Competência **10/2026** · Setor **Fiscal**". */
export function FaixaSuposicoes({ linhas, onMudar, carregando, className }: { linhas: LinhaSuposicao[]; onMudar: (campo: CampoSuposicao, valor: QualquerValor) => void; carregando?: boolean; className?: string }) {
  if (!linhas.length && !carregando) return null
  return (
    <div role="status" aria-live="polite" aria-label="O que vou supor" className={cn('text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-xs', className)}>
      <span className="flex items-center gap-1">
        <SparkleIcon className="size-3.5" aria-hidden /> Vou supor
      </span>
      {linhas.map(({ s, config, rotulo }) => {
        const I = iconeDoCampo[s.campo]
        return (
          <span key={s.campo} className="flex min-w-0 max-w-full items-center gap-1">
            <I className="size-3.5 shrink-0" aria-hidden />
            <span className="shrink-0">{fraseDoCampo[s.campo]}</span>
            <ValorEditavel rotulo={rotulo} valor={s.valor as QualquerValor} config={config} desfazer={false} className="text-foreground min-w-0 font-medium" onMudar={(v) => onMudar(s.campo, v)} />
          </span>
        )
      })}
      {carregando && <span className="bg-sunken h-3 w-24 animate-pulse rounded-full motion-reduce:animate-none" aria-label="O integrante ainda está lendo" />}
    </div>
  )
}

/** O resumo no topo da resposta: ícone + frase com o valor em destaque (editável, se quiser corrigir). */
export function ResumoSuposicoes({ linhas, onMudar, className }: { linhas: LinhaSuposicao[]; onMudar?: (campo: CampoSuposicao, valor: QualquerValor) => void; className?: string }) {
  if (!linhas.length) return null
  return (
    <ul aria-label="O que eu supus" className={cn('bg-sunken/60 flex flex-col gap-1 rounded-lg px-3 py-2 text-sm', className)}>
      {linhas.map(({ s, config, rotulo }) => {
        const I = iconeDoCampo[s.campo]
        return (
          <li key={s.campo} className="flex min-w-0 items-center gap-2">
            <I className="text-muted-foreground size-4 shrink-0" aria-hidden />
            <span className="min-w-0">
              {fraseDoCampo[s.campo]}{' '}
              {onMudar ? <ValorEditavel rotulo={rotulo} valor={s.valor as QualquerValor} config={config} className="font-medium" onMudar={(v) => onMudar(s.campo, v)} /> : <b className="font-medium">{String(s.valor)}</b>}
              {s.origem === 'padrao' && <span className="text-muted-foreground"> (padrão)</span>}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

/**
 * Campo de pedido que sublinha (pontilhado) as palavras que geraram uma
 * suposição. Uma camada espelho, por cima do textarea, repete o texto em
 * transparente com os trechos sublinhados; o clique no trecho abre a
 * suposição (`onTrecho`), o resto do clique cai no textarea.
 */
export const CampoComSuposicoes = forwardRef<HTMLTextAreaElement, { valor: string; onMudar: (v: string) => void; suposicoes: Suposicao[]; onTrecho?: (campo: CampoSuposicao) => void; acessorio?: ReactNode } & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'>>(function CampoComSuposicoes({ valor, onMudar, suposicoes, onTrecho, className, acessorio, ...props }, ref) {
  const campo = useRef<HTMLTextAreaElement>(null)
  const espelho = useRef<HTMLDivElement>(null)
  useImperativeHandle(ref, () => campo.current!)
  useLayoutEffect(() => {
    const c = campo.current
    if (!c) return
    c.style.height = 'auto'
    c.style.height = `${Math.min(c.scrollHeight, 192)}px`
    if (espelho.current) espelho.current.scrollTop = c.scrollTop
  }, [valor])
  const trechos = suposicoes.filter((s) => s.trecho).sort((a, b) => a.trecho!.ini - b.trecho!.ini)
  const partes: ReactNode[] = []
  let i = 0
  for (const s of trechos) {
    const { ini, fim } = s.trecho!
    if (ini < i) continue
    partes.push(valor.slice(i, ini))
    partes.push(
      <span key={`${s.campo}-${ini}`} className="suposto pointer-events-auto cursor-pointer" title={`${fraseDoCampo[s.campo]}: alterar`} onMouseDown={(e) => (e.preventDefault(), onTrecho?.(s.campo))}>
        {valor.slice(ini, fim)}
      </span>,
    )
    i = fim
  }
  partes.push(valor.slice(i) + '​')
  const classeTexto = 'w-full px-3 py-2.5 text-sm leading-6 whitespace-pre-wrap break-words'
  return (
    <div className={cn('relative min-w-0', className)}>
      <textarea
        ref={campo}
        rows={1}
        value={valor}
        onChange={(e) => onMudar(e.target.value)}
        onScroll={(e) => espelho.current && (espelho.current.scrollTop = e.currentTarget.scrollTop)}
        className={cn(classeTexto, 'block max-h-48 resize-none bg-transparent outline-none')}
        {...props}
      />
      <div ref={espelho} aria-hidden className={cn(classeTexto, 'pointer-events-none absolute inset-0 overflow-hidden text-transparent')}>
        {partes}
      </div>
      {acessorio}
    </div>
  )
})

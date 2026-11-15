import { CaretLeftIcon, CaretRightIcon, CheckIcon, MagnifyingGlassIcon, MinusIcon, PlusIcon } from '@phosphor-icons/react'
import { useId, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ConfigValor, EstadoOpcoes, Opcao, PontoPlano, QualquerValor } from './tipos'

/**
 * Os seletores do ValorEditavel, um por tipo de dado. Todos recebem o valor
 * atual e devolvem o novo por `aplicar(valor, fechar)`. Lista longa rola por
 * dentro do contêiner (Popover ou folha inferior, que já são AreaRolagem).
 * Todo seletor de opções tem carregando, erro, vazio e "+ Outra coisa".
 */
export interface PropsSeletor {
  config: ConfigValor
  valor: QualquerValor | null | undefined
  rotulo: string
  aplicar: (v: QualquerValor, fechar?: boolean) => void
}

const classeItem = 'flex min-h-9 w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-sm outline-none hover:bg-accent focus-visible:bg-accent aria-selected:font-medium pointer-coarse:min-h-11'

function EstadoDasOpcoes({ estado, children }: { estado: EstadoOpcoes; children: React.ReactNode }) {
  if (estado.carregando)
    return (
      <div role="status" aria-label="Carregando as opções" className="flex flex-col gap-1.5 p-1">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-sunken h-8 animate-pulse rounded-md motion-reduce:animate-none" style={{ animationDelay: `${i * 90}ms` }} />
        ))}
      </div>
    )
  if (estado.erro)
    return (
      <div role="alert" className="flex flex-col items-start gap-2 p-2 text-sm">
        <p>{estado.erro}</p>
        {estado.onTentar && (
          <Button size="sm" variant="outline" className="rounded-full" onClick={estado.onTentar}>
            Tentar de novo
          </Button>
        )}
      </div>
    )
  return <>{children}</>
}

/** "+ Outra coisa": escreve um valor que não está na lista. */
function OutraCoisa({ onCriar, rotulo }: { onCriar: (texto: string) => void; rotulo: string }) {
  const [aberto, setAberto] = useState(false)
  const [texto, setTexto] = useState('')
  if (!aberto)
    return (
      <button type="button" className={cn(classeItem, 'text-muted-foreground')} onClick={() => setAberto(true)}>
        <PlusIcon className="size-4 shrink-0" aria-hidden /> Outra coisa
      </button>
    )
  return (
    <form
      className="flex items-center gap-1.5 p-1"
      onSubmit={(e) => {
        // O seletor vive num portal, mas o submit sobe pela árvore do React: sem isto, fecharia a gaveta em volta.
        e.preventDefault()
        e.stopPropagation()
        if (texto.trim()) onCriar(texto.trim())
      }}
    >
      <input autoFocus aria-label={`Outro valor para ${rotulo}`} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escreva" className="bg-raised shadow-contorno h-8 min-w-0 flex-1 rounded-md px-2 text-sm outline-none pointer-coarse:h-11" />
      <Button type="submit" size="sm" className="rounded-full" disabled={!texto.trim()}>
        Usar
      </Button>
    </form>
  )
}

/** Lista com check (escolha única) e busca quando passa de 7 opções ou quando é entidade. */
function SeletorLista({ config, valor, rotulo, aplicar }: PropsSeletor) {
  const c = config as Extract<ConfigValor, { tipo: 'escolha' | 'entidade' }>
  const [busca, setBusca] = useState('')
  const lista = useRef<HTMLDivElement>(null)
  const comBusca = c.tipo === 'entidade' || c.opcoes.length > 7
  const q = busca.trim().toLowerCase()
  const visiveis = q ? c.opcoes.filter((o) => `${o.rotulo} ${o.detalhe ?? ''}`.toLowerCase().includes(q)) : c.opcoes
  const mover = (e: KeyboardEvent) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    e.preventDefault()
    const itens = [...(lista.current?.querySelectorAll<HTMLElement>('[role="option"]') ?? [])]
    const i = itens.indexOf(document.activeElement as HTMLElement)
    itens[Math.max(0, Math.min(itens.length - 1, i + (e.key === 'ArrowDown' ? 1 : -1)))]?.focus()
  }
  return (
    <div className="flex flex-col gap-1" onKeyDown={mover}>
      {comBusca && (
        <label className="bg-raised shadow-contorno flex h-9 items-center gap-2 rounded-md px-2.5 pointer-coarse:h-11">
          <MagnifyingGlassIcon className="text-muted-foreground size-4 shrink-0" aria-hidden />
          <input autoFocus aria-label={`Buscar ${rotulo.toLowerCase()}`} value={busca} onChange={(e) => setBusca(e.target.value)} placeholder={c.tipo === 'entidade' ? (c.buscar ?? 'Buscar') : 'Buscar'} className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
        </label>
      )}
      <EstadoDasOpcoes estado={c}>
        <div ref={lista} role="listbox" aria-label={rotulo} className="flex flex-col">
          {visiveis.map((o, i) => (
            <button key={o.valor} type="button" role="option" aria-selected={o.valor === valor} autoFocus={!comBusca && (o.valor === valor || (!valor && i === 0))} className={classeItem} onClick={() => aplicar(o.valor, true)}>
              {o.icone ? <o.icone className="text-muted-foreground size-4 shrink-0" aria-hidden /> : null}
              <span className="min-w-0 flex-1">
                <span className="block truncate">{o.rotulo}</span>
                {o.detalhe && <span className="text-muted-foreground block truncate text-xs">{o.detalhe}</span>}
              </span>
              {o.valor === valor && <CheckIcon className="size-4 shrink-0" weight="bold" aria-hidden />}
            </button>
          ))}
          {!visiveis.length && <p className="text-muted-foreground px-2.5 py-2 text-sm">{q ? `Nada com “${busca}”.` : 'Nada para escolher ainda.'}</p>}
        </div>
      </EstadoDasOpcoes>
      {c.outra !== false && <OutraCoisa rotulo={rotulo} onCriar={(t) => aplicar(t, true)} />}
    </div>
  )
}

/** Chips com ícone, escolha múltipla; "Pronto" aplica. */
function SeletorMultipla({ config, valor, rotulo, aplicar }: PropsSeletor) {
  const c = config as Extract<ConfigValor, { tipo: 'multipla' }>
  const [marcados, setMarcados] = useState<string[]>(Array.isArray(valor) ? (valor as string[]) : [])
  const [extras, setExtras] = useState<Opcao[]>(() => marcados.filter((m) => !c.opcoes.some((o) => o.valor === m)).map((m) => ({ valor: m, rotulo: m })))
  const todas = [...c.opcoes, ...extras]
  const alternar = (v: string) => setMarcados((xs) => (xs.includes(v) ? xs.filter((x) => x !== v) : [...xs, v]))
  return (
    <div className="flex flex-col gap-2">
      <EstadoDasOpcoes estado={c}>
        <div role="group" aria-label={rotulo} className="flex flex-wrap gap-1.5 p-0.5">
          {todas.map((o) => {
            const sim = marcados.includes(o.valor)
            return (
              <button key={o.valor} type="button" aria-pressed={sim} onClick={() => alternar(o.valor)} className={cn('flex h-8 max-w-full cursor-pointer items-center gap-1.5 rounded-full px-3 text-sm transition-colors pointer-coarse:h-11', sim ? 'bg-foreground text-background' : 'bg-sunken hover:bg-raised shadow-contorno')}>
                {o.icone ? <o.icone className="size-4 shrink-0" aria-hidden /> : null}
                <span className="min-w-0 truncate">{o.rotulo}</span>
              </button>
            )
          })}
          {!todas.length && <p className="text-muted-foreground px-1 py-1 text-sm">Nada para escolher ainda.</p>}
        </div>
      </EstadoDasOpcoes>
      {c.outra !== false && (
        <OutraCoisa
          rotulo={rotulo}
          onCriar={(t) => {
            setExtras((xs) => [...xs, { valor: t, rotulo: t }])
            setMarcados((xs) => [...xs, t])
          }}
        />
      )}
      <div className="flex justify-end">
        <Button size="sm" className="rounded-full" onClick={() => aplicar(marcados, true)}>
          Pronto{marcados.length ? ` (${marcados.length})` : ''}
        </Button>
      </div>
    </div>
  )
}

/** Intervalo: dois polos (de, até), sempre de < até. */
function SeletorIntervalo({ config, valor, rotulo, aplicar }: PropsSeletor) {
  const c = config as Extract<ConfigValor, { tipo: 'intervalo' }>
  const [par, setPar] = useState<[number, number]>(Array.isArray(valor) && typeof valor[0] === 'number' ? (valor as [number, number]) : [c.min, c.max])
  const id = useId()
  const un = c.unidade ? ` ${c.unidade}` : ''
  const polo = (i: 0 | 1, v: number) => setPar((p) => (i === 0 ? [Math.min(v, p[1]), p[1]] : [p[0], Math.max(v, p[0])]))
  return (
    <div className="flex flex-col gap-3 p-1">
      <p className="text-center font-medium tabular-nums" aria-live="polite">
        {par[0]}–{par[1]}
        {un}
      </p>
      {(['de', 'até'] as const).map((r, i) => (
        <label key={r} htmlFor={`${id}-${i}`} className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground w-8 shrink-0">{r}</span>
          <input id={`${id}-${i}`} type="range" aria-label={`${rotulo}: ${r}`} min={c.min} max={c.max} step={c.passo ?? 1} value={par[i]} onChange={(e) => polo(i as 0 | 1, Number(e.target.value))} className="accent-foreground h-6 min-w-0 flex-1 cursor-pointer pointer-coarse:h-11" />
          <output className="w-10 shrink-0 text-right tabular-nums">{par[i]}</output>
        </label>
      ))}
      <div className="flex justify-end">
        <Button size="sm" className="rounded-full" onClick={() => aplicar(par, true)}>
          Aplicar
        </Button>
      </div>
    </div>
  )
}

/** Número e dinheiro: campo com passos; Enter aplica. */
function SeletorNumero({ config, valor, rotulo, aplicar }: PropsSeletor) {
  const c = config as Extract<ConfigValor, { tipo: 'numero' | 'dinheiro' }>
  const dinheiro = c.tipo === 'dinheiro'
  const passo = c.tipo === 'numero' ? (c.passo ?? 1) : 1
  const fmt = (n: number) => (dinheiro ? n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : String(n))
  const [texto, setTexto] = useState(typeof valor === 'number' ? fmt(valor) : '')
  const [erro, setErro] = useState<string | null>(null)
  const ler = (t: string) => Number(t.replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, ''))
  const confirmar = () => {
    const n = ler(texto)
    if (!texto.trim() || Number.isNaN(n)) return setErro('Escreva um número')
    if (c.min !== undefined && n < c.min) return setErro(`O mínimo é ${fmt(c.min)}`)
    if (c.max !== undefined && n > c.max) return setErro(`O máximo é ${fmt(c.max)}`)
    aplicar(n, true)
  }
  const somar = (d: number) => setTexto((t) => fmt((Number.isNaN(ler(t)) ? 0 : ler(t)) + d))
  return (
    <form
      className="flex flex-col gap-2 p-1"
      onSubmit={(e) => {
        // O seletor vive num portal, mas o submit sobe pela árvore do React: sem isto, fecharia a gaveta em volta.
        e.preventDefault()
        e.stopPropagation()
        confirmar()
      }}
    >
      <div className="flex items-center gap-1.5">
        {!dinheiro && (
          <Button type="button" size="icon-sm" variant="outline" className="rounded-full" aria-label={`Menos ${passo}`} onClick={() => somar(-passo)}>
            <MinusIcon />
          </Button>
        )}
        <label className="bg-raised shadow-contorno flex h-9 min-w-0 flex-1 items-center gap-1.5 rounded-md px-2.5 pointer-coarse:h-11">
          {dinheiro && <span className="text-muted-foreground text-sm">R$</span>}
          <input autoFocus inputMode="decimal" aria-label={rotulo} aria-invalid={!!erro} value={texto} onChange={(e) => (setTexto(e.target.value), setErro(null))} className="min-w-0 flex-1 bg-transparent text-right text-sm tabular-nums outline-none" />
          {c.tipo === 'numero' && c.unidade && <span className="text-muted-foreground text-sm">{c.unidade}</span>}
        </label>
        {!dinheiro && (
          <Button type="button" size="icon-sm" variant="outline" className="rounded-full" aria-label={`Mais ${passo}`} onClick={() => somar(passo)}>
            <PlusIcon />
          </Button>
        )}
      </div>
      {erro && (
        <p role="alert" className="text-destructive-text text-xs">
          {erro}
        </p>
      )}
      <div className="flex items-center justify-end gap-1">
        {c.limpar && (
          <Button type="button" size="sm" variant="ghost" className="mr-auto rounded-full" onClick={() => aplicar('', true)}>
            {c.limpar}
          </Button>
        )}
        <Button type="submit" size="sm" className="rounded-full">
          Aplicar
        </Button>
      </div>
    </form>
  )
}

const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

/** Data: campo de data e atalhos. Competência: os 12 meses do ano, com o ano ao lado. */
function SeletorData({ config, valor, rotulo, aplicar }: PropsSeletor) {
  const hoje = new Date()
  const iso = (d: Date) => d.toISOString().slice(0, 10)
  if (config.tipo === 'competencia') {
    const atual = typeof valor === 'string' && /^\d{2}\/\d{4}$/.test(valor) ? valor : `${String(hoje.getMonth() + 1).padStart(2, '0')}/${hoje.getFullYear()}`
    return <SeletorCompetencia atual={atual} rotulo={rotulo} aplicar={aplicar} />
  }
  const somar = (dias: number) => {
    const d = new Date()
    d.setDate(d.getDate() + dias)
    return iso(d)
  }
  const fimDoMes = iso(new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0))
  return (
    <div className="flex flex-col gap-2 p-1">
      <input type="date" autoFocus aria-label={rotulo} defaultValue={typeof valor === 'string' ? valor.slice(0, 10) : ''} onChange={(e) => e.target.value && aplicar(e.target.value)} className="bg-raised shadow-contorno h-9 rounded-md px-2.5 text-sm outline-none pointer-coarse:h-11" />
      <div className="flex flex-wrap gap-1.5">
        {(
          [
            ['Hoje', iso(hoje)],
            ['Amanhã', somar(1)],
            ['Em uma semana', somar(7)],
            ['Fim do mês', fimDoMes],
          ] as const
        ).map(([r, v]) => (
          <button key={r} type="button" onClick={() => aplicar(v, true)} className="bg-sunken hover:bg-raised shadow-contorno h-8 cursor-pointer rounded-full px-3 text-sm pointer-coarse:h-11">
            {r}
          </button>
        ))}
      </div>
    </div>
  )
}

function SeletorCompetencia({ atual, rotulo, aplicar }: { atual: string; rotulo: string; aplicar: PropsSeletor['aplicar'] }) {
  const [ano, setAno] = useState(Number(atual.slice(3)))
  const mesAtual = atual.slice(0, 2)
  const anoAtual = Number(atual.slice(3))
  return (
    <div className="flex flex-col gap-2 p-1">
      <div className="flex items-center justify-between">
        <Button size="icon-sm" variant="ghost" className="rounded-full" aria-label="Ano anterior" onClick={() => setAno((a) => a - 1)}>
          <CaretLeftIcon />
        </Button>
        <span className="font-medium tabular-nums" aria-live="polite">
          {ano}
        </span>
        <Button size="icon-sm" variant="ghost" className="rounded-full" aria-label="Próximo ano" onClick={() => setAno((a) => a + 1)}>
          <CaretRightIcon />
        </Button>
      </div>
      <div role="listbox" aria-label={rotulo} className="grid grid-cols-4 gap-1">
        {meses.map((m, i) => {
          const mm = String(i + 1).padStart(2, '0')
          const sim = mm === mesAtual && ano === anoAtual
          return (
            <button key={m} type="button" role="option" aria-selected={sim} autoFocus={sim} onClick={() => aplicar(`${mm}/${ano}`, true)} className={cn('h-9 cursor-pointer rounded-md text-sm capitalize pointer-coarse:h-11', sim ? 'bg-foreground text-background font-medium' : 'hover:bg-accent')}>
              {m}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** Paleta: amostras com o nome da cor. */
function SeletorCor({ config, valor, rotulo, aplicar }: PropsSeletor) {
  const c = config as Extract<ConfigValor, { tipo: 'cor' }>
  return (
    <div role="radiogroup" aria-label={rotulo} className="grid grid-cols-2 gap-1 p-0.5">
      {c.opcoes.map((o) => (
        <button key={o.valor} type="button" role="radio" aria-checked={o.valor === valor} onClick={() => aplicar(o.valor, true)} className={cn(classeItem, 'aria-checked:bg-accent')}>
          <span className="shadow-contorno size-5 shrink-0 rounded-full" style={{ background: o.cor ?? o.valor }} aria-hidden />
          <span className="min-w-0 truncate">{o.rotulo}</span>
        </button>
      ))}
    </div>
  )
}

/** Texto curto (ou várias linhas): Enter aplica (Ctrl+Enter no de várias linhas). */
function SeletorTexto({ config, valor, rotulo, aplicar }: PropsSeletor) {
  const c = config as Extract<ConfigValor, { tipo: 'texto' }>
  const [texto, setTexto] = useState(typeof valor === 'string' ? valor : '')
  const [erro, setErro] = useState<string | null>(null)
  const confirmar = () => {
    const e = c.validar?.(texto) ?? null
    if (e) return setErro(e)
    aplicar(texto, true)
  }
  const classe = 'bg-raised shadow-contorno w-full rounded-md px-2.5 py-2 text-sm outline-none'
  return (
    <form
      className="flex flex-col gap-2 p-1"
      onSubmit={(e) => {
        // O seletor vive num portal, mas o submit sobe pela árvore do React: sem isto, fecharia a gaveta em volta.
        e.preventDefault()
        e.stopPropagation()
        confirmar()
      }}
    >
      {c.multilinha ? (
        <textarea autoFocus rows={4} aria-label={rotulo} aria-invalid={!!erro} value={texto} placeholder={c.placeholder} onChange={(e) => (setTexto(e.target.value), setErro(null))} onKeyDown={(e) => e.key === 'Enter' && (e.ctrlKey || e.metaKey) && confirmar()} className={cn(classe, 'resize-none')} />
      ) : (
        <input autoFocus aria-label={rotulo} aria-invalid={!!erro} value={texto} placeholder={c.placeholder} onChange={(e) => (setTexto(e.target.value), setErro(null))} className={cn(classe, 'h-9 pointer-coarse:h-11')} />
      )}
      {erro && (
        <p role="alert" className="text-destructive-text text-xs">
          {erro}
        </p>
      )}
      <div className="flex justify-end">
        <Button type="submit" size="sm" className="rounded-full">
          Aplicar
        </Button>
      </div>
    </form>
  )
}

/** Plano de dois eixos (tom: curto ↔ longo, brincalhão ↔ emotivo), com prévia. Setas movem o ponto. */
function SeletorPlano({ config, valor, rotulo, aplicar }: PropsSeletor) {
  const c = config as Extract<ConfigValor, { tipo: 'plano' }>
  const [p, setP] = useState<PontoPlano>(valor && typeof valor === 'object' && 'x' in valor ? (valor as PontoPlano) : { x: 0.5, y: 0.5 })
  const area = useRef<HTMLDivElement>(null)
  const limitar = (v: number) => Math.round(Math.max(0, Math.min(1, v)) * 20) / 20
  const doPonteiro = (e: PointerEvent) => {
    const r = area.current!.getBoundingClientRect()
    setP({ x: limitar((e.clientX - r.left) / r.width), y: limitar(1 - (e.clientY - r.top) / r.height) })
  }
  const teclas = (e: KeyboardEvent) => {
    const d = e.shiftKey ? 0.2 : 0.05
    const mudar: Record<string, Partial<PontoPlano>> = { ArrowLeft: { x: p.x - d }, ArrowRight: { x: p.x + d }, ArrowUp: { y: p.y + d }, ArrowDown: { y: p.y - d } }
    if (!mudar[e.key]) return
    e.preventDefault()
    setP((q) => ({ x: limitar(mudar[e.key].x ?? q.x), y: limitar(mudar[e.key].y ?? q.y) }))
  }
  const previa = useMemo(() => c.previa?.(p), [c, p])
  return (
    <div className="flex flex-col gap-2 p-1">
      <div className="text-muted-foreground grid grid-cols-[auto_minmax(0,1fr)_auto] grid-rows-[auto_minmax(0,1fr)_auto] items-center gap-1 text-xs">
        <span />
        <span className="text-center">{c.eixoY[1]}</span>
        <span />
        <span className="max-w-16 text-right">{c.eixoX[0]}</span>
        <div
          ref={area}
          role="slider"
          tabIndex={0}
          aria-label={rotulo}
          aria-valuetext={`${Math.round(p.x * 100)}% ${c.eixoX[1]}, ${Math.round(p.y * 100)}% ${c.eixoY[1]}`}
          onKeyDown={teclas}
          onPointerDown={(e) => {
            ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
            doPonteiro(e)
          }}
          onPointerMove={(e) => e.buttons && doPonteiro(e)}
          className="bg-sunken shadow-contorno focus-visible:ring-ring/40 relative aspect-square w-full cursor-crosshair touch-none rounded-lg outline-none focus-visible:ring-[3px]"
        >
          <span className="bg-border absolute inset-x-0 top-1/2 h-px" aria-hidden />
          <span className="bg-border absolute inset-y-0 left-1/2 w-px" aria-hidden />
          <span className="bg-foreground shadow-pilula absolute size-4 -translate-x-1/2 translate-y-1/2 rounded-full" style={{ left: `${p.x * 100}%`, bottom: `${p.y * 100}%` }} aria-hidden />
        </div>
        <span className="max-w-16">{c.eixoX[1]}</span>
        <span />
        <span className="text-center">{c.eixoY[0]}</span>
        <span />
      </div>
      {previa && <div className="bg-raised rounded-md p-2 text-sm">{previa}</div>}
      <div className="flex justify-end">
        <Button size="sm" className="rounded-full" onClick={() => aplicar(p, true)}>
          Aplicar
        </Button>
      </div>
    </div>
  )
}

/** O seletor de cada tipo. */
export function Seletor(props: PropsSeletor) {
  switch (props.config.tipo) {
    case 'escolha':
    case 'entidade':
      return <SeletorLista {...props} />
    case 'multipla':
      return <SeletorMultipla {...props} />
    case 'intervalo':
      return <SeletorIntervalo {...props} />
    case 'numero':
    case 'dinheiro':
      return <SeletorNumero {...props} />
    case 'data':
    case 'competencia':
      return <SeletorData {...props} />
    case 'cor':
      return <SeletorCor {...props} />
    case 'texto':
      return <SeletorTexto {...props} />
    case 'plano':
      return <SeletorPlano {...props} />
  }
}

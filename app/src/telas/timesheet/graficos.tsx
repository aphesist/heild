import { useState, type CSSProperties, type ReactNode } from 'react'
import { Tooltip } from '@/components/ui/tooltip'
import { fmtH, hm, minDoDia } from '@/dados/timesheet-tempo'
import { confiancaDaLinha, rotuloConfianca, type ConfiancaVisual, type LinhaDia } from './dados'

type Confianca = ConfiancaVisual
import { cn } from '@/lib/utils'

/**
 * Codificação da confiança, igual em todo o Timesheet. Um tom só (a cor do
 * texto do tema) em degraus de intensidade, do mais certo ao menos certo, mais
 * textura na estimada e contorno tracejado no sem classificação: funciona em
 * qualquer tema de marca branca e não depende só de cor (daltonismo, impressão).
 */
export function estiloConfianca(c: Confianca): { className: string; style?: CSSProperties } {
  const tinta = (p: number) => `color-mix(in oklab, var(--foreground) ${p}%, transparent)`
  switch (c) {
    case 'automatica':
      return { className: '', style: { background: tinta(78) } }
    case 'confirmada':
      return { className: '', style: { background: tinta(48) } }
    case 'estimada':
      return { className: '', style: { background: `repeating-linear-gradient(135deg, ${tinta(30)} 0 4px, ${tinta(14)} 4px 8px)` } }
    case 'contestada':
      return { className: '', style: { background: `repeating-linear-gradient(135deg, color-mix(in oklab, var(--destructive) 55%, transparent) 0 4px, color-mix(in oklab, var(--destructive) 20%, transparent) 4px 8px)` } }
    default:
      return { className: 'border border-dashed', style: { borderColor: tinta(38), background: tinta(4) } }
  }
}

export function Amostra({ c, className }: { c: Confianca; className?: string }) {
  const e = estiloConfianca(c)
  return <span className={cn('inline-block size-3 shrink-0 rounded-[3px]', e.className, className)} style={e.style} aria-hidden />
}

export function Legenda({ itens, extra }: { itens: Confianca[]; extra?: ReactNode }) {
  return (
    <ul className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
      {itens.map((c) => (
        <li key={c} className="flex items-center gap-1.5">
          <Amostra c={c} /> {rotuloConfianca[c]}
        </li>
      ))}
      {extra}
    </ul>
  )
}

/** Título do gráfico é a pergunta que ele responde (05, 8.1). */
export function Pergunta({ children, acao }: { children: ReactNode; acao?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-center gap-2">
      <h3 className="min-w-0 flex-1 text-sm font-medium">{children}</h3>
      {acao}
    </header>
  )
}

/** Linha do dia: blocos por confiança sobre a régua de horas; o agente numa faixa à parte. */
export function LinhaDoDia({ linhas, agente, onAbrir, rotulo }: { linhas: LinhaDia[]; agente?: { inicio: string; minutos: number; cor: string; texto: string }[]; onAbrir?: (l: LinhaDia) => void; rotulo: (l: LinhaDia) => string }) {
  if (!linhas.length && !agente?.length) return <p className="text-muted-foreground py-4 text-center text-sm">Nada registrado neste dia.</p>
  // A escala cobre as sessões e o trabalho dos integrantes.
  const inicios = [...linhas.map((s) => minDoDia(s.inicio)), ...(agente ?? []).map((a) => minDoDia(a.inicio))]
  const fins = [...linhas.map((s) => minDoDia(s.fim)), ...(agente ?? []).map((a) => minDoDia(a.inicio) + a.minutos)]
  const ini = Math.floor(Math.min(...inicios) / 60)
  const fim = Math.max(ini + 1, Math.ceil(Math.max(...fins) / 60))
  const total = (fim - ini) * 60
  const pos = (m: number) => ((m - ini * 60) / total) * 100
  const horas = Array.from({ length: fim - ini + 1 }, (_, i) => ini + i)
  const passo = horas.length > 14 ? 2 : 1
  return (
    <div className="flex flex-col gap-1.5">
      <div className="relative h-11">
        {linhas.map((l) => {
          const c = confiancaDaLinha(l)
          const e = estiloConfianca(c)
          const fora = l.tipo === 'sessao' && l.s.fora_da_jornada
          return (
            <Tooltip key={l.id} conteudo={`${hm(l.inicio)}–${hm(l.fim)} · ${rotulo(l)} · ${rotuloConfianca[c]}`}>
              <button
                type="button"
                onClick={() => onAbrir?.(l)}
                aria-label={`${hm(l.inicio)} a ${hm(l.fim)}, ${rotulo(l)}, ${rotuloConfianca[c]}`}
                className={cn('absolute inset-y-0 cursor-pointer rounded-[4px] transition-opacity hover:opacity-80', e.className, fora && 'ring-warning ring-2 ring-inset', l.tipo === 'sessao' && l.s.ao_vivo && 'animate-pulse')}
                style={{ ...e.style, left: `calc(${pos(minDoDia(l.inicio))}% + 1px)`, width: `max(4px, calc(${pos(minDoDia(l.fim)) - pos(minDoDia(l.inicio))}% - 2px))` }}
              />
            </Tooltip>
          )
        })}
      </div>
      {agente && agente.length > 0 && (
        <div className="relative h-3 overflow-hidden" aria-label="Trabalho dos integrantes (série separada)">
          {agente.map((a, i) => (
            <Tooltip key={`${a.inicio}-${i}`} conteudo={`agente · ${hm(a.inicio)} · ${a.texto} · ${a.minutos} min de máquina`}>
              <span className="absolute inset-y-0 rounded-full" style={{ left: `${pos(minDoDia(a.inicio))}%`, width: `max(6px, ${(a.minutos / total) * 100}%)`, background: a.cor }} />
            </Tooltip>
          ))}
        </div>
      )}
      <div className="text-muted-foreground relative h-4 text-[11px] tabular-nums">
        {horas.filter((_, i) => i % passo === 0).map((h) => (
          <span key={h} className="absolute -translate-x-1/2" style={{ left: `${((h - ini) / (fim - ini)) * 100}%` }}>
            {String(h).padStart(2, '0')}
          </span>
        ))}
      </div>
    </div>
  )
}

type Pilha = { rotulo: string; partes: { c: Confianca; v: number }[] }

/** Barras verticais empilhadas por confiança (ex.: horas por dia). */
export function ColunasEmpilhadas({ dados, unidade = 'min', altura = 150, onClicar }: { dados: Pilha[]; unidade?: 'min' | 'h' | '%'; altura?: number; onClicar?: (rotulo: string) => void }) {
  const max = Math.max(1, ...dados.map((d) => d.partes.reduce((s, p) => s + p.v, 0)))
  const fmt = (v: number) => (unidade === 'min' ? fmtH(v) : unidade === '%' ? `${Math.round(v)}%` : `${Math.round(v)} h`)
  return (
    <div className="flex items-end gap-3" style={{ height: altura + 36 }}>
      {dados.map((d) => {
        const tot = d.partes.reduce((s, p) => s + p.v, 0)
        return (
          <button key={d.rotulo} type="button" disabled={!onClicar} onClick={() => onClicar?.(d.rotulo)} className="group flex min-w-0 flex-1 cursor-pointer flex-col items-center gap-1 disabled:cursor-default">
            <span className="text-muted-foreground text-[11px] tabular-nums">{fmt(tot)}</span>
            <Tooltip conteudo={d.partes.filter((p) => p.v).map((p) => `${rotuloConfianca[p.c]} ${fmt(p.v)}`).join(' · ')}>
              <span className="flex w-full max-w-12 flex-col-reverse gap-[2px]" style={{ height: (tot / max) * altura }}>
                {d.partes.map((p, i) => {
                  const e = estiloConfianca(p.c)
                  return p.v ? <span key={p.c} className={cn('w-full group-hover:opacity-85', e.className, i === d.partes.findLastIndex((x) => x.v) && 'rounded-t-[4px]')} style={{ ...e.style, height: `${(p.v / tot) * 100}%` }} /> : null
                })}
              </span>
            </Tooltip>
            <span className="text-muted-foreground text-[11px]">{d.rotulo}</span>
          </button>
        )
      })}
    </div>
  )
}

/** Barras horizontais empilhadas por confiança, uma linha por pessoa. */
export function LinhasEmpilhadas({ dados, unidade = 'h', onClicar }: { dados: Pilha[]; unidade?: 'h'; onClicar?: (rotulo: string) => void }) {
  if (!dados.length) return <p className="text-muted-foreground py-4 text-center text-sm">Ninguém com horas neste filtro.</p>
  const max = Math.max(1, ...dados.map((d) => d.partes.reduce((s, p) => s + p.v, 0)))
  return (
    <ul className="flex flex-col gap-2.5">
      {dados.map((d) => {
        const tot = d.partes.reduce((s, p) => s + p.v, 0)
        return (
          <li key={d.rotulo} className="grid grid-cols-[6rem_1fr_3rem] sm:grid-cols-[7.5rem_1fr_3.5rem] items-center gap-3 text-sm">
            {onClicar ? (
              <button type="button" className="cursor-pointer truncate text-left hover:underline" onClick={() => onClicar(d.rotulo)}>
                {d.rotulo}
              </button>
            ) : (
              <span className="truncate">{d.rotulo}</span>
            )}
            <Tooltip conteudo={d.partes.map((p) => `${rotuloConfianca[p.c]} ${Math.round(p.v * 10) / 10} ${unidade}`).join(' · ')}>
              <span className="flex h-4 gap-[2px]" style={{ width: `${(tot / max) * 100}%` }}>
                {d.partes.map((p, i) => {
                  const e = estiloConfianca(p.c)
                  return p.v ? <span key={p.c} className={cn(e.className, i === d.partes.length - 1 && 'rounded-r-[4px]')} style={{ ...e.style, width: `${(p.v / tot) * 100}%` }} /> : null
                })}
              </span>
            </Tooltip>
            <span className="text-right tabular-nums">
              {Math.round(tot)} {unidade}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

/** Barras horizontais de uma série (os maiores + outros). */
export function Barras({ dados, unidade = 'h', destacar, onClicar }: { dados: { nome: string; h: number }[]; unidade?: string; destacar?: string; onClicar?: (nome: string) => void }) {
  if (!dados.length) return <p className="text-muted-foreground py-4 text-center text-sm">Nada neste período.</p>
  const max = Math.max(0.1, ...dados.map((d) => d.h))
  return (
    <ul className="flex flex-col gap-2">
      {dados.map((d) => (
        <li key={d.nome} className="grid grid-cols-[minmax(0,8rem)_1fr_3.5rem] sm:grid-cols-[minmax(0,11rem)_1fr_3.5rem] items-center gap-3 text-sm">
          {onClicar ? (
            <button type="button" onClick={() => onClicar(d.nome)} className={cn('cursor-pointer truncate text-left hover:underline', d.nome === 'outros' || d.nome === 'interno' ? 'text-muted-foreground' : '', destacar === d.nome && 'font-medium')}>
              {d.nome}
            </button>
          ) : (
            <span className={cn('truncate', d.nome === 'outros' || d.nome === 'interno' ? 'text-muted-foreground' : '', destacar === d.nome && 'font-medium')}>{d.nome}</span>
          )}
          <Tooltip conteudo={`${d.nome}: ${d.h} ${unidade}`}>
            <span className="h-3 rounded-r-[4px]" style={{ width: `${(d.h / max) * 100}%`, background: `color-mix(in oklab, var(--foreground) ${destacar === d.nome ? 78 : d.nome === 'outros' || d.nome === 'interno' ? 25 : 55}%, transparent)` }} />
          </Tooltip>
          <span className="text-right tabular-nums">
            {String(d.h).replace('.', ',')} {unidade}
          </span>
        </li>
      ))}
    </ul>
  )
}

/** Barras divergentes de margem: prejuízo à esquerda, lucro à direita, ordenadas. */
export function Divergente({ dados, selecionado, onSelecionar }: { dados: { nome: string; valor: number; pct: number; detalhe: string }[]; selecionado?: string; onSelecionar?: (n: string) => void }) {
  if (!dados.length) return <p className="text-muted-foreground py-4 text-center text-sm">Nenhum cliente com contrato informado neste filtro.</p>
  const max = Math.max(1, ...dados.map((d) => Math.abs(d.valor)))
  const brl = (v: number) => `${v < 0 ? '−' : '+'}R$ ${Math.abs(v).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`
  return (
    <ul className="flex flex-col gap-1">
      {dados.map((d) => (
        <li key={d.nome}>
          <button type="button" onClick={() => onSelecionar?.(d.nome)} className={cn('grid w-full cursor-pointer grid-cols-[minmax(0,8rem)_1fr_1fr_minmax(0,7.5rem)] sm:grid-cols-[minmax(0,13rem)_1fr_1fr_minmax(0,9rem)] items-center gap-2 rounded-[10px] px-2 py-1.5 text-left text-sm', selecionado === d.nome ? 'bg-raised shadow-cartao' : 'hover:bg-sunken/60')}>
            <span className={cn('truncate', selecionado === d.nome && 'font-medium')}>{d.nome}</span>
            <span className="flex h-4 justify-end border-r" style={{ borderColor: 'color-mix(in oklab, var(--foreground) 35%, transparent)' }}>
              {d.valor < 0 && <span className="bg-destructive/75 h-full rounded-l-[4px]" style={{ width: `${(Math.abs(d.valor) / max) * 100}%` }} />}
            </span>
            <span className="flex h-4">{d.valor >= 0 && <span className="bg-success/75 h-full rounded-r-[4px]" style={{ width: `${(d.valor / max) * 100}%` }} />}</span>
            <span className="text-right text-xs tabular-nums">
              <span className={cn('font-medium', d.valor < 0 && 'text-destructive')}>
                {brl(d.valor)} ({d.pct > 0 ? '+' : d.pct < 0 ? '−' : ''}
                {Math.abs(d.pct)}%)
              </span>
              <span className="text-muted-foreground block truncate">{d.detalhe}</span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}

/** Linha de 12 meses com a linha do zero, marcos e cursor com o valor. */
export function Linha12({ valores, rotulos, marcos = [], sufixo = '%' }: { valores: number[]; rotulos: string[]; marcos?: { mes: number; texto: string }[]; sufixo?: string }) {
  const [hover, setHover] = useState<number | null>(null)
  const W = 600
  const H = 160
  const pad = 16
  const lo = Math.min(0, ...valores)
  const hi = Math.max(0, ...valores)
  const x = (i: number) => pad + (i / (valores.length - 1)) * (W - pad * 2)
  const y = (v: number) => pad + ((hi - v) / (hi - lo || 1)) * (H - pad * 2)
  const pontos = valores.map((v, i) => `${x(i)},${y(v)}`).join(' ')
  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-40 w-full overflow-visible" onMouseLeave={() => setHover(null)} role="img" aria-label={`Margem mês a mês: ${valores.map((v, i) => `${rotulos[i]} ${v}${sufixo}`).join(', ')}`}>
        <line x1={pad} x2={W - pad} y1={y(0)} y2={y(0)} stroke="currentColor" className="text-muted-foreground" strokeOpacity={0.4} strokeDasharray="4 4" />
        {hover != null && <line x1={x(hover)} x2={x(hover)} y1={pad} y2={H - pad} stroke="currentColor" strokeOpacity={0.25} />}
        <polyline points={pontos} fill="none" stroke="var(--foreground)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {marcos.map((m) => (
          <circle key={m.mes} cx={x(m.mes)} cy={y(valores[m.mes])} r={5} fill="var(--warning)" stroke="var(--surface)" strokeWidth={2} />
        ))}
        {hover != null && <circle cx={x(hover)} cy={y(valores[hover])} r={5} fill="var(--foreground)" stroke="var(--surface)" strokeWidth={2} />}
        {valores.map((_, i) => (
          <rect key={i} x={x(i) - (W - pad * 2) / (valores.length - 1) / 2} y={0} width={(W - pad * 2) / (valores.length - 1)} height={H} fill="transparent" onMouseEnter={() => setHover(i)} />
        ))}
      </svg>
      <div className="text-muted-foreground flex justify-between px-1 text-[11px]">
        {rotulos.map((r) => (
          <span key={r}>{r}</span>
        ))}
      </div>
      {hover != null && (
        <div className="bg-popover pointer-events-none absolute top-0 rounded-md border px-2 py-1 text-xs shadow-md" style={{ left: `min(calc(${(x(hover) / W) * 100}% + 8px), calc(100% - 9rem))` }}>
          <div className="font-medium tabular-nums">
            {rotulos[hover]}: {valores[hover] > 0 ? '+' : ''}
            {valores[hover]}
            {sufixo}
          </div>
          {marcos.find((m) => m.mes === hover) && <div className="text-muted-foreground">{marcos.find((m) => m.mes === hover)!.texto}</div>}
        </div>
      )}
    </div>
  )
}

/** Capacidade: registrada × disponível por pessoa, com a faixa saudável de 85 a 100%. */
export function Capacidade({ dados }: { dados: { nome: string; usadas: number; disponivel: number; ausencia: number }[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {dados.map((d) => {
        const pct = d.disponivel ? Math.round((d.usadas / d.disponivel) * 100) : 0
        const acima = pct > 100
        return (
          <li key={d.nome} className="grid grid-cols-[6rem_1fr_6.5rem] sm:grid-cols-[7.5rem_1fr_6.5rem] items-center gap-3 text-sm">
            <span className="truncate">{d.nome}</span>
            <span className="bg-sunken relative h-3 rounded-full">
              <span className="bg-success/20 absolute inset-y-0 rounded-sm" style={{ left: '85%', width: '15%' }} title="faixa de 85 a 100%" />
              <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${Math.min(pct, 100)}%`, background: acima ? 'var(--warning)' : 'color-mix(in oklab, var(--foreground) 65%, transparent)' }} />
            </span>
            <span className="text-right text-xs tabular-nums">
              <span className={cn('font-medium', acima && 'text-warning')}>{pct}%</span>
              <span className="text-muted-foreground"> · {d.usadas}/{d.disponivel} h</span>
              {d.ausencia > 0 && <span className="text-muted-foreground block">−{d.ausencia} h de ausência</span>}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

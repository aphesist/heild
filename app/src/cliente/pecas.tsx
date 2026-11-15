import { ArrowLeftIcon, CheckIcon, CopyIcon, XIcon } from '@phosphor-icons/react'
import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { CampoForm } from './dados'

/**
 * Peças do app do cliente (S10). Tudo com as camadas e tokens do tema, para a
 * marca do escritório aparecer no app (marca branca). Folhas e diálogos ficam
 * dentro do aparelho (posição absoluta), não no corpo da página.
 */

export function Bloco({ titulo, acao, children, className, id }: { titulo: ReactNode; acao?: ReactNode; children: ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={cn('bg-surface shadow-cartao flex flex-col gap-2 rounded-cartao p-3.5', className)}>
      <header className="flex items-center gap-2">
        <h2 className="min-w-0 flex-1 text-sm font-medium">{titulo}</h2>
        {acao}
      </header>
      {children}
    </section>
  )
}

export function TituloTela({ children, voltar, acao }: { children: ReactNode; voltar?: () => void; acao?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <h1 className="flex min-w-0 flex-1 items-center gap-2 text-xl font-light tracking-tight">
        {voltar && (
          <button type="button" aria-label="Voltar" onClick={voltar} className="hover:bg-sunken shrink-0 cursor-pointer rounded-full p-1">
            <ArrowLeftIcon className="size-5" />
          </button>
        )}
        <span className="min-w-0 truncate">{children}</span>
      </h1>
      {acao}
    </div>
  )
}

export type Tom = 'ok' | 'atencao' | 'erro' | 'neutro' | 'info'
const pontoDoTom: Record<Tom, string> = { ok: 'bg-success', atencao: 'bg-warning', erro: 'bg-destructive', neutro: 'bg-muted-foreground', info: 'bg-primary' }

/** Rótulo de estado: sempre texto e cor (nunca só cor). */
export function Selo({ tom = 'neutro', children, className }: { tom?: Tom; children: ReactNode; className?: string }) {
  return (
    <span className={cn('bg-sunken inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] whitespace-nowrap', className)}>
      <span className={cn('size-1.5 rounded-full', pontoDoTom[tom])} aria-hidden />
      {children}
    </span>
  )
}

export function Chip({ ativo, onClick, children, contagem }: { ativo?: boolean; onClick: () => void; children: ReactNode; contagem?: number }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={!!ativo}
      className={cn('flex shrink-0 cursor-pointer items-center gap-1 rounded-full px-3 py-1.5 text-xs whitespace-nowrap', ativo ? 'bg-foreground text-background' : 'bg-sunken')}
    >
      {children}
      {contagem !== undefined && contagem > 0 && <span className={cn('tabular-nums', ativo ? 'opacity-80' : 'text-muted-foreground')}>{contagem}</span>}
    </button>
  )
}

export function Chips({ children, rotulo }: { children: ReactNode; rotulo?: string }) {
  return (
    <div role="group" aria-label={rotulo} className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-0.5">
      {children}
    </div>
  )
}

/** Linha de lista tocável (ícone, texto, apoio, ação à direita). */
export function Linha({ icone, titulo, apoio, direita, onClick, destaque, rotulo }: { icone?: ReactNode; titulo: ReactNode; apoio?: ReactNode; direita?: ReactNode; onClick?: () => void; destaque?: boolean; rotulo?: string }) {
  const corpo = (
    <>
      {icone && <span className="text-muted-foreground flex size-5 shrink-0 items-center justify-center [&_svg]:size-5">{icone}</span>}
      <span className="min-w-0 flex-1">
        <span className={cn('block text-sm', destaque && 'font-medium')}>{titulo}</span>
        {apoio && <span className="text-muted-foreground block text-xs">{apoio}</span>}
      </span>
      {direita}
    </>
  )
  if (!onClick) return <div className="flex items-center gap-2.5 py-1">{corpo}</div>
  return (
    <button type="button" onClick={onClick} aria-label={rotulo} className="hover:bg-sunken/60 -mx-1.5 flex cursor-pointer items-center gap-2.5 rounded-md px-1.5 py-1.5 text-left">
      {corpo}
    </button>
  )
}

/** Folha que sobe de baixo, dentro do aparelho (no computador, centralizada). */
export function Folha({ titulo, onFechar, children, rodape, rotulo }: { titulo: ReactNode; onFechar: () => void; children: ReactNode; rodape?: ReactNode; rotulo?: string }) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onFechar()
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [onFechar])
  const corpo = (
    <div className="pointer-events-auto absolute inset-0 z-40 flex flex-col justify-end" role="dialog" aria-modal="true" aria-label={rotulo ?? (typeof titulo === 'string' ? titulo : undefined)}>
      <button type="button" aria-label="Fechar" tabIndex={-1} onClick={onFechar} className="absolute inset-0 cursor-default bg-black/30" />
      <div className="bg-background shadow-painel relative flex max-h-[88%] flex-col rounded-t-xl md:mx-auto md:mb-6 md:w-[min(30rem,92%)] md:rounded-xl">
        <div className="bg-border mx-auto mt-2 h-1 w-10 rounded-full md:hidden" aria-hidden />
        <header className="flex items-center gap-2 px-4 pt-2 pb-1">
          <h2 className="min-w-0 flex-1 text-base font-medium">{titulo}</h2>
          <button type="button" aria-label="Fechar" onClick={onFechar} className="hover:bg-sunken cursor-pointer rounded-full p-1.5">
            <XIcon className="size-4" />
          </button>
        </header>
        <div className="area-rolagem-dupla flex min-h-0 flex-col gap-3 overflow-y-auto px-4 pt-1 pb-4">{children}</div>
        {rodape && <div className="flex flex-col gap-2 border-t px-4 pt-3 pb-4">{rodape}</div>}
      </div>
    </div>
  )
  // Fora da área que rola (a máscara dela criaria outra camada): na camada do app, por cima do menu.
  const camada = typeof document !== 'undefined' ? document.getElementById('s10-camada') : null
  return camada ? createPortal(corpo, camada) : corpo
}

export const classeCampo = 'bg-raised shadow-contorno h-11 w-full rounded-md px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring'

export function Campo({ rotulo, valor, onMudar, tipo = 'text', placeholder, ajuda, erro, inputMode, autoFocus }: { rotulo: string; valor: string; onMudar: (v: string) => void; tipo?: string; placeholder?: string; ajuda?: string; erro?: string | null; inputMode?: 'numeric' | 'decimal' | 'text' | 'email' | 'tel'; autoFocus?: boolean }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-muted-foreground text-xs">{rotulo}</span>
      <input aria-label={rotulo} type={tipo} value={valor} onChange={(e) => onMudar(e.target.value)} placeholder={placeholder} inputMode={inputMode} autoFocus={autoFocus} className={cn(classeCampo, erro && 'ring-destructive ring-2')} />
      {erro ? <span className="text-destructive text-xs">{erro}</span> : ajuda ? <span className="text-muted-foreground text-[11px]">{ajuda}</span> : null}
    </label>
  )
}

export function AreaTexto({ rotulo, valor, onMudar, placeholder, linhas = 3 }: { rotulo: string; valor: string; onMudar: (v: string) => void; placeholder?: string; linhas?: number }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-muted-foreground text-xs">{rotulo}</span>
      <textarea aria-label={rotulo} value={valor} onChange={(e) => onMudar(e.target.value)} rows={linhas} placeholder={placeholder} className="bg-raised shadow-contorno focus-visible:ring-ring rounded-md px-3 py-2 text-sm outline-none focus-visible:ring-2" />
    </label>
  )
}

export function Escolha({ rotulo, valor, onMudar, opcoes }: { rotulo: string; valor: string; onMudar: (v: string) => void; opcoes: string[] }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-muted-foreground text-xs">{rotulo}</span>
      <select aria-label={rotulo} value={valor} onChange={(e) => onMudar(e.target.value)} className={classeCampo}>
        <option value="">Escolha…</option>
        {opcoes.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  )
}

/** Formulário tipado (pedido, variáveis da folha, férias, admissão): valida obrigatórios depois de tentar enviar. */
export function useFormularioApp(campos: CampoForm[], inicial: Record<string, string> = {}) {
  const [valores, setValores] = useState<Record<string, string>>(inicial)
  const [tentou, setTentou] = useState(false)
  const faltando = campos.filter((c) => c.obrigatorio && !(valores[c.id] ?? '').trim())
  const erroDe = (c: CampoForm) => {
    if (!tentou) return null
    if (c.obrigatorio && !(valores[c.id] ?? '').trim()) return 'Preencha este campo.'
    if ((c.tipo === 'numero' || c.tipo === 'moeda') && valores[c.id] && Number.isNaN(Number(valores[c.id].replace(/\./g, '').replace(',', '.')))) return 'Use só números.'
    return null
  }
  const valido = faltando.length === 0 && campos.every((c) => !((c.tipo === 'numero' || c.tipo === 'moeda') && valores[c.id] && Number.isNaN(Number(valores[c.id].replace(/\./g, '').replace(',', '.')))))
  return {
    valores,
    definir: (id: string, v: string) => setValores((x) => ({ ...x, [id]: v })),
    tentar: () => {
      setTentou(true)
      return valido
    },
    erroDe,
    limpar: () => {
      setValores(inicial)
      setTentou(false)
    },
  }
}

export function CamposForm({ campos, form }: { campos: CampoForm[]; form: ReturnType<typeof useFormularioApp> }) {
  return (
    <>
      {campos.map((c) =>
        c.tipo === 'escolha' ? (
          <div key={c.id} className="flex flex-col gap-1">
            <Escolha rotulo={c.rotulo + (c.obrigatorio ? '' : ' (opcional)')} valor={form.valores[c.id] ?? ''} onMudar={(v) => form.definir(c.id, v)} opcoes={c.opcoes ?? []} />
            {form.erroDe(c) && <span className="text-destructive text-xs">{form.erroDe(c)}</span>}
          </div>
        ) : (
          <Campo
            key={c.id}
            rotulo={c.rotulo + (c.obrigatorio ? '' : ' (opcional)')}
            valor={form.valores[c.id] ?? ''}
            onMudar={(v) => form.definir(c.id, v)}
            tipo={c.tipo === 'data' ? 'date' : 'text'}
            inputMode={c.tipo === 'numero' ? 'numeric' : c.tipo === 'moeda' ? 'decimal' : undefined}
            placeholder={c.tipo === 'moeda' ? 'R$' : undefined}
            ajuda={c.ajuda}
            erro={form.erroDe(c)}
          />
        ),
      )}
    </>
  )
}

export function BotaoCopiar({ texto, rotulo = 'Copiar', aoCopiar }: { texto: string; rotulo?: string; aoCopiar?: () => void }) {
  const [ok, setOk] = useState(false)
  return (
    <Button
      size="sm"
      variant="outline"
      className="rounded-full"
      onClick={() => {
        void navigator.clipboard?.writeText(texto).catch(() => undefined)
        setOk(true)
        aoCopiar?.()
        setTimeout(() => setOk(false), 1800)
      }}
    >
      {ok ? <CheckIcon /> : <CopyIcon />} {ok ? 'Copiado' : rotulo}
    </Button>
  )
}

/** QR de faz de conta (o Pix real vem do provedor de cobrança); estável para o mesmo código. */
export function QrFicticio({ codigo, tamanho = 132 }: { codigo: string; tamanho?: number }) {
  const n = 21
  const bits: boolean[] = []
  let h = 7
  for (let i = 0; i < n * n; i++) {
    h = (h * 31 + codigo.charCodeAt(i % codigo.length)) >>> 0
    bits.push(((h >> 7) & 1) === 1)
  }
  const canto = (x: number, y: number) => (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7)
  const anel = (x: number, y: number) => {
    const cx = x < 7 ? x : x - (n - 7)
    const cy = y < 7 ? y : y - (n - 7)
    return cx === 0 || cy === 0 || cx === 6 || cy === 6 || (cx >= 2 && cx <= 4 && cy >= 2 && cy <= 4)
  }
  return (
    <svg viewBox={`0 0 ${n} ${n}`} width={tamanho} height={tamanho} role="img" aria-label="QR Code do Pix (demonstração)" className="bg-raised rounded-md p-2">
      {Array.from({ length: n * n }, (_, i) => {
        const x = i % n
        const y = Math.floor(i / n)
        const cheio = canto(x, y) ? anel(x, y) : bits[i]
        return cheio ? <rect key={i} x={x} y={y} width={1} height={1} className="fill-foreground" /> : null
      })}
    </svg>
  )
}

/** Faixa de aviso dentro de uma tela (modo leitura, pausa parcial, fora do horário). */
export function Faixa({ tom = 'neutro', icone, children, acao }: { tom?: Tom; icone?: ReactNode; children: ReactNode; acao?: ReactNode }) {
  return (
    <div className={cn('bg-sunken flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm', tom === 'atencao' && 'shadow-contorno')}>
      {icone && <span className={cn('mt-0.5 shrink-0 [&_svg]:size-4', tom === 'erro' ? 'text-destructive' : tom === 'atencao' ? 'text-warning' : tom === 'ok' ? 'text-success' : 'text-muted-foreground')}>{icone}</span>}
      <span className="min-w-0 flex-1">{children}</span>
      {acao}
    </div>
  )
}

/** Barra de progresso simples (implantação, franquia do Consultor). */
export function Progresso({ valor, total, rotulo }: { valor: number; total: number; rotulo: string }) {
  const pct = Math.min(100, Math.round((valor / Math.max(1, total)) * 100))
  return (
    <div role="progressbar" aria-label={rotulo} aria-valuenow={valor} aria-valuemin={0} aria-valuemax={total} className="bg-sunken inset-shadow-trilho h-2 overflow-hidden rounded-full">
      <div className="bg-primary h-full rounded-full transition-[width]" style={{ width: `${pct}%` }} />
    </div>
  )
}

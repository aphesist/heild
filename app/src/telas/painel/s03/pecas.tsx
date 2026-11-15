// S03: peças comuns das abas Fiscal, Contábil e Consultoria.
import { ArrowRightIcon, LightningIcon, PencilSimpleLineIcon, PlugsIcon, ShieldCheckIcon, UserIcon, WarningIcon } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import { useNavegacao } from '@/ambiente/loja'
import { usePermissao } from '@/components/kit'
import { Button } from '@/components/ui/button'
import { Tooltip } from '@/components/ui/tooltip'
import { useConectores, useEstadoConector, type IdConector } from '@/dados/conectores'
import { cn, textoDoNo } from '@/lib/utils'

export type Nivel = 'preparar' | 'executar com aprovação' | 'executar' | 'só pessoa'

const icone: Record<Nivel, ReactNode> = {
  preparar: <PencilSimpleLineIcon />,
  'executar com aprovação': <ShieldCheckIcon />,
  executar: <LightningIcon />,
  'só pessoa': <UserIcon />,
}

/**
 * Botão de ação com o nível no rótulo (03, 5 E; mapa 1.3). Some quando a conta
 * não pode chamar a ferramenta (03, 9.1); com pré-requisito faltando vira
 * "falta X" e não deixa clicar.
 */
export function BotaoNivel({
  nivel,
  ferramenta,
  setor,
  falta,
  onClick,
  children,
  compacto,
  variante,
  className,
  rotuloAria,
}: {
  nivel: Nivel
  ferramenta?: string
  setor?: string
  falta?: string
  onClick: () => void
  children: ReactNode
  compacto?: boolean
  variante?: 'outline' | 'secondary' | 'ghost'
  className?: string
  rotuloAria?: string
}) {
  const d = usePermissao(ferramenta ?? 'tarefa.listar', { setor_id: setor })
  if (ferramenta && !d.permitido) return null
  if (falta)
    return (
      <Tooltip conteudo={`Falta ${falta}`}>
        <span>
          <Button size="sm" variant="outline" disabled className={cn('rounded-full', className)}>
            <WarningIcon /> falta {falta}
          </Button>
        </span>
      </Tooltip>
    )
  if (compacto)
    return (
      <Tooltip conteudo={nivel}>
        <Button size="sm" variant={variante ?? (nivel === 'preparar' ? 'outline' : 'secondary')} className={cn('rounded-full', className)} onClick={onClick} aria-label={rotuloAria}>
          {icone[nivel]} {children}
        </Button>
      </Tooltip>
    )
  return (
    <Button size="sm" variant={variante ?? (nivel === 'preparar' ? 'outline' : 'secondary')} className={cn('h-auto flex-col items-start gap-0 rounded-md py-1.5 text-left', className)} onClick={onClick} aria-label={rotuloAria}>
      <span className="flex items-center gap-1.5 text-[13px]">
        {icone[nivel]} {children}
      </span>
      <span className="text-muted-foreground text-xs font-normal">{nivel}</span>
    </Button>
  )
}

/** Selo discreto da fase do plano (Anexo A): o que vem depois aparece, marcado. */
export function SeloFase({ fase, className }: { fase: number; className?: string }) {
  return <span className={cn('bg-sunken text-muted-foreground shrink-0 rounded-full px-1.5 py-0.5 text-xs whitespace-nowrap', className)}>fase {fase}</span>
}

/** Rótulo de situação: texto e cor (nunca só cor, 1.5). */
export function Rotulo({ tom, children, className }: { tom: 'ok' | 'atencao' | 'erro' | 'neutro' | 'info'; children: ReactNode; className?: string }) {
  const cor = { ok: 'bg-success/15', atencao: 'bg-warning/15', erro: 'bg-destructive/12 text-foreground', neutro: 'bg-sunken text-muted-foreground', info: 'bg-raised shadow-contorno' }[tom]
  // Nunca passa da largura de onde está (texto sem espaço, longo): trunca, com o texto inteiro no título.
  const texto = textoDoNo(children)
  return (
    <span title={texto || undefined} className={cn('inline-flex w-fit max-w-full min-w-0 shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs whitespace-nowrap', cor, className)}>
      <span className="min-w-0 truncate [&_svg]:inline [&_svg]:align-[-2px]">{children}</span>
    </span>
  )
}

/**
 * Saúde dos conectores de que o bloco depende (contrato C9). Funcionando,
 * não mostra nada; parado, diz o porquê e leva a Configurações › Conectores.
 */
export function SaudeConectores({ ids, className }: { ids: IdConector[]; className?: string }) {
  const todos = useConectores()
  const nav = useNavegacao()
  const parados = todos.filter((c) => ids.includes(c.id) && !c.funcionando)
  if (!parados.length) return null
  const erro = parados.some((c) => c.tom === 'erro')
  const um = parados.length === 1 ? parados[0] : undefined
  return (
    <div role="status" className={cn('flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs', erro ? 'bg-destructive/10' : 'bg-warning/10', className)}>
      <PlugsIcon className={cn('size-4 shrink-0', erro ? 'text-destructive-text' : 'text-warning-text')} />
      <span className="min-w-0 flex-1">
        {um ? (
          <>
            <strong className="font-medium">
              {um.nome}: {um.rotulo.toLowerCase()}.
            </strong>{' '}
            {um.frase}
          </>
        ) : (
          <>
            <strong className="font-medium">{parados.length} conectores parados:</strong> {parados.map((c) => `${c.nome} (${c.rotulo.toLowerCase()})`).join(', ')}. O integrante faz o resto e espera estes.
          </>
        )}
      </span>
      <button type="button" onClick={() => nav.irPara(parados[0].destino)} className="hover:text-foreground text-muted-foreground flex shrink-0 cursor-pointer items-center gap-0.5 underline-offset-2 hover:underline">
        Conectores <ArrowRightIcon className="size-3" />
      </button>
    </div>
  )
}

/** Conector parado? (para trocar a ação por "aguardando conector"). */
export function useConectorParado(id: IdConector) {
  const c = useEstadoConector(id)
  return c.funcionando ? undefined : `${c.nome} ${c.rotulo.toLowerCase()}`
}

/** Bloco vazio de um widget, com o porquê (o mesmo VazioWidget de todos os widgets). */
export { VazioWidget as Vazio } from '@/components/widgets/widget'

/** Mini-barra de progresso com rótulo. */
export function Barra({ valor, total, alerta, rotulo }: { valor: number; total: number; alerta?: boolean; rotulo: string }) {
  const p = total ? Math.min(100, Math.round((valor / total) * 100)) : 0
  return (
    <div className="bg-sunken h-1.5 overflow-hidden rounded-full" role="meter" aria-valuemin={0} aria-valuemax={total} aria-valuenow={valor} aria-label={rotulo}>
      <div className="h-full rounded-full" style={{ width: `${p}%`, background: alerta ? 'var(--warning)' : 'color-mix(in oklab, var(--foreground) 70%, transparent)' }} />
    </div>
  )
}

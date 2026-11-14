import { useEffect, useState, type ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import type { TomEstado } from '@/dados/conectores'
import { cn } from '@/lib/utils'

/** Peças pequenas das telas da S09 (Configurações, Arquivos, implantação, Raio-X). */

export const varianteTom: Record<TomEstado, 'sucesso' | 'destaque' | 'erro' | 'outline'> = { ok: 'sucesso', atencao: 'destaque', erro: 'erro', neutro: 'outline' }

/** Selo de estado sempre com texto (nunca só cor). */
export function SeloEstado({ tom, children, className }: { tom: TomEstado; children: ReactNode; className?: string }) {
  return (
    <Badge variant={varianteTom[tom]} className={className}>
      <span aria-hidden className={cn('size-1.5 rounded-full', tom === 'ok' ? 'bg-success' : tom === 'atencao' ? 'bg-warning' : tom === 'erro' ? 'bg-destructive' : 'bg-muted-foreground')} />
      {children}
    </Badge>
  )
}

/** "há 5 min", "há 3 h", "há 2 dias" a partir de um ISO. */
export function tempoRelativo(iso: string | null | undefined) {
  if (!iso) return 'nunca'
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 90) return 'agora'
  if (s < 3600) return `há ${Math.round(s / 60)} min`
  if (s < 86400) return `há ${Math.round(s / 3600)} h`
  return `há ${Math.round(s / 86400)} dia(s)`
}

/** Mostra "carregando" por um instante na primeira abertura (a tela real busca no backend). */
export function useCarregandoInicial(ms = 350) {
  const [carregando, setCarregando] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setCarregando(false), ms)
    return () => clearTimeout(t)
  }, [ms])
  return carregando
}

export const reais = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

/** Botão-ficha para filtros (família, situação). */
export function Ficha({ ativo, onClick, children }: { ativo: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" aria-pressed={ativo} onClick={onClick} className={cn('cursor-pointer rounded-full border px-3 py-1 text-xs transition-colors', ativo ? 'border-foreground/30 bg-raised font-medium' : 'text-muted-foreground hover:text-foreground')}>
      {children}
    </button>
  )
}

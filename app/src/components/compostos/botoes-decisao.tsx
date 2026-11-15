import { CheckIcon, PencilSimpleIcon, XIcon } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'

/** Decisões do cartão de aprovação (Fundações 6.4: aprovado, recusado, editado_e_aprovado). */
export type Decisao = 'aprovar' | 'recusar' | 'editar_e_aprovar'

/**
 * Aprovar / Recusar. Em produção os dois chamam `aprovacao.decidir` (02, 9.3);
 * não há botão de cartão que chame outra coisa. O antigo "Editar e aprovar"
 * saiu (fase 6): onde o cartão não mostra os argumentos (sino, aviso da Home),
 * `onCorrigir` põe o botão "Corrigir", que leva à central de aprovações com o
 * cartão aberto, e lá o argumento se corrige no lugar.
 */
export function BotoesDecisao({
  onDecidir,
  onCorrigir,
  lote,
  semEditar,
  tamanho = 'sm',
  rotuloAprovar,
}: {
  onDecidir?: (d: Decisao) => void
  /** Leva aonde se corrige (a central de aprovações focada no cartão). */
  onCorrigir?: () => void
  /** Quantidade num cartão em lote ("Aprovar os 14"). */
  lote?: number
  /** Sem o "Corrigir" mesmo com `onCorrigir` (o cartão já corrige no lugar). */
  semEditar?: boolean
  tamanho?: 'sm' | 'default'
  /** Rótulo próprio do aprovar ("Aprovar com a correção"). */
  rotuloAprovar?: string
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button size={tamanho} onClick={() => onDecidir?.('aprovar')}>
        <CheckIcon weight="bold" /> {rotuloAprovar ?? (lote ? `Aprovar os ${lote}` : 'Aprovar')}
      </Button>
      {onCorrigir && !semEditar && (
        <Button size={tamanho} variant="outline" onClick={onCorrigir}>
          Corrigir
        </Button>
      )}
      <Button size={tamanho} variant="ghost" onClick={() => onDecidir?.('recusar')}>
        <XIcon /> Recusar
      </Button>
    </div>
  )
}

export function ResultadoDecisao({ decisao }: { decisao: Decisao }) {
  const textos: Record<Decisao, string> = {
    aprovar: 'Aprovado por você agora',
    recusar: 'Recusado por você agora',
    editar_e_aprovar: 'Aprovado por você agora, com a sua correção',
  }
  return (
    // Ocupa a mesma altura da linha de botões que substitui e entra com um esmaecer: o cartão não pula.
    <div className="surgir text-muted-foreground flex min-h-8 items-center gap-1.5 text-xs">
      {decisao === 'aprovar' || decisao === 'editar_e_aprovar' ? <CheckIcon className="text-success size-3.5" /> : decisao === 'recusar' ? <XIcon className="size-3.5" /> : <PencilSimpleIcon className="size-3.5" />}
      {textos[decisao]}
    </div>
  )
}

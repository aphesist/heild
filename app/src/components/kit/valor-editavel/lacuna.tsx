import { ArrowRightIcon } from '@phosphor-icons/react'
import { useState, type ReactNode } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { AreaRolagem } from '@/components/ui/area-rolagem'
import { Button } from '@/components/ui/button'
import { useMedia } from '@/hooks/useMedia'
import { cn } from '@/lib/utils'
import { Seletor } from './seletores'
import type { ConfigValor, QualquerValor } from './tipos'
import { ValorEditavel } from './valor-editavel'

/**
 * Lacunas (Leaving Blanks): em vez de perguntar em sequência, o integrante
 * entrega o rascunho com os espaços que não sabe ("o jantar é para [quantas
 * pessoas]"). Cada lacuna abre o seletor do tipo; preenchida, vira o valor
 * sublinhado (continua editável) e o texto segue. Nada é inventado.
 */
export interface DefLacuna {
  id: string
  /** O que falta, como aparece no texto ("quantas pessoas"). */
  pergunta: string
  config: ConfigValor
}

export type ParteRascunho = string | { lacuna: DefLacuna }

/** Uma lacuna no texto: o espaço com tracejado e a pergunta, que é um botão. */
export function Lacuna({ def, onPreencher }: { def: DefLacuna; onPreencher: (v: QualquerValor) => void }) {
  const celular = useMedia('(max-width: 639px)')
  const [aberta, setAberta] = useState(false)
  const preencher = (v: QualquerValor, fechar?: boolean) => {
    onPreencher(v)
    if (fechar !== false) setAberta(false)
  }
  const gatilho = (
    <button type="button" className="lacuna" aria-label={`Lacuna: ${def.pergunta}, preencher`} aria-haspopup="dialog" aria-expanded={aberta} onClick={celular ? () => setAberta(true) : undefined}>
      {def.pergunta}
    </button>
  )
  const seletor = <Seletor config={def.config} valor={null} rotulo={def.pergunta} aplicar={preencher} />
  if (celular)
    return (
      <>
        {gatilho}
        <Sheet open={aberta} onOpenChange={setAberta}>
          <SheetContent lado="baixo" className="gap-0">
            <SheetHeader className="pb-1">
              <SheetTitle className="first-letter:uppercase">{def.pergunta}</SheetTitle>
              <SheetDescription className="sr-only">Preencha a lacuna do rascunho</SheetDescription>
            </SheetHeader>
            <AreaRolagem className="px-3 pb-4">{seletor}</AreaRolagem>
          </SheetContent>
        </Sheet>
      </>
    )
  return (
    <Popover open={aberta} onOpenChange={setAberta}>
      <PopoverTrigger asChild>{gatilho}</PopoverTrigger>
      <PopoverContent aria-label={def.pergunta} collisionPadding={16} className="flex max-h-[min(26rem,var(--radix-popover-content-available-height))] w-[min(20rem,calc(100vw-2rem))] flex-col p-1.5">
        <p className="text-muted-foreground px-1.5 pt-1 pb-1.5 text-xs first-letter:uppercase">{def.pergunta}</p>
        <AreaRolagem className="min-h-0 flex-1">{seletor}</AreaRolagem>
      </PopoverContent>
    </Popover>
  )
}

const porExtenso = ['nenhuma', 'uma', 'duas', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez']

/**
 * O rascunho com lacunas e o rodapé "Preencha as três lacunas e eu continuo",
 * que conta o que falta ("Faltam duas"). Com tudo preenchido, "Continuar".
 */
export function RascunhoComLacunas({ partes, valores, onPreencher, onContinuar, rotuloContinuar = 'Continuar', className, cabecalho }: { partes: ParteRascunho[]; valores: Record<string, QualquerValor | undefined>; onPreencher: (id: string, v: QualquerValor) => void; onContinuar?: () => void; rotuloContinuar?: string; className?: string; cabecalho?: ReactNode }) {
  const lacunas = partes.filter((p): p is { lacuna: DefLacuna } => typeof p !== 'string')
  const faltam = lacunas.filter((p) => valores[p.lacuna.id] === undefined).length
  const total = lacunas.length
  return (
    <div className={cn('flex min-w-0 flex-col gap-2', className)}>
      {cabecalho}
      <p className="text-sm leading-7 whitespace-pre-wrap">
        {partes.map((p, i) =>
          typeof p === 'string' ? (
            <span key={i}>{p}</span>
          ) : valores[p.lacuna.id] === undefined ? (
            <Lacuna key={p.lacuna.id} def={p.lacuna} onPreencher={(v) => onPreencher(p.lacuna.id, v)} />
          ) : (
            <ValorEditavel key={p.lacuna.id} rotulo={p.lacuna.pergunta} valor={valores[p.lacuna.id]} config={p.lacuna.config} desfazer={false} className="font-medium" onMudar={(v) => onPreencher(p.lacuna.id, v)} />
          ),
        )}
      </p>
      {total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-2">
          <p className="text-muted-foreground text-xs" aria-live="polite">
            {faltam === 0 ? 'Tudo preenchido.' : faltam === total ? `Preencha ${total === 1 ? 'a lacuna' : `as ${porExtenso[total] ?? total} lacunas`} e eu continuo.` : `Falta${faltam === 1 ? '' : 'm'} ${porExtenso[faltam] ?? faltam}.`}
          </p>
          {onContinuar && (
            <Button size="sm" className="rounded-full" disabled={faltam > 0} onClick={onContinuar}>
              {rotuloContinuar} <ArrowRightIcon />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

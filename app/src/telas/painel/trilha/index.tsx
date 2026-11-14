import { useLoja } from '@/ambiente/loja'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'

/**
 * Trilha de implantação ou de saída do cliente (S04-T07 e T08), aberta por
 * cima do Painel pela faixa de ciclo de vida ou pelo endereço `?trilha=<cliente>`
 * (contrato C6). Esqueleto: a gaveta e o endereço; os marcos chegam depois.
 */
export function GavetaTrilha({ clienteId, onFechar }: { clienteId: string; onFechar: () => void }) {
  const loja = useLoja()
  const cliente = loja.clientes.find((c) => c.id === clienteId)
  return (
    <Sheet open onOpenChange={(v) => !v && onFechar()}>
      <SheetContent className="gap-0 sm:max-w-3xl">
        <SheetHeader>
          <SheetTitle>Trilha · {cliente?.nome ?? 'cliente'}</SheetTitle>
          <SheetDescription>{cliente?.situacao === 'saida' ? 'Trilha de saída' : 'Trilha de implantação'}</SheetDescription>
        </SheetHeader>
        <div className="text-muted-foreground p-4 text-sm">Marcos, o que o cliente precisa enviar e as tarefas por setor.</div>
      </SheetContent>
    </Sheet>
  )
}

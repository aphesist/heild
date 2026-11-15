import { ShieldCheckIcon } from '@phosphor-icons/react'
import { usePreferenciasInternas } from '@/ambiente/interna'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

/** Aviso do primeiro uso (11, 5; S05-A84): mensagens não podem ser apagadas. Fica registrado o aceite de cada pessoa. */
export function AvisoPrimeiroUso() {
  const { aceite, setAceite } = usePreferenciasInternas()
  return (
    <Dialog open={!aceite}>
      <DialogContent className="bg-surface rounded-campo border-0 p-6 sm:max-w-md [&>button:last-child]:hidden" onEscapeKeyDown={(e) => e.preventDefault()} onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <span className="bg-primary/10 text-primary mb-2 flex size-11 items-center justify-center rounded-full">
            <ShieldCheckIcon className="size-5" weight="duotone" />
          </span>
          <DialogTitle className="font-medium">Mensagens não podem ser apagadas</DialogTitle>
          <DialogDescription asChild>
            <div className="flex flex-col gap-2 text-sm">
              <p>As conversas da equipe são registro do escritório. Ninguém apaga mensagem nem anexo, nem o Administrador.</p>
              <p>Dá para editar: a mensagem mostra "editada" e a versão anterior fica guardada para quem participa.</p>
              <p>Conversas pessoais são só de vocês dois. O Administrador só abre uma em investigação interna, com motivo escrito, e vocês são avisados.</p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button className="rounded-full" onClick={() => setAceite(new Date().toISOString())}>
            Entendi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

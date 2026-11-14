import { XIcon } from '@phosphor-icons/react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import type { ReactNode } from 'react'
import { usePersistente } from '@/ambiente/loja'
import { Button } from '@/components/ui/button'
import { ImplantacaoTela } from '../implantacao/ImplantacaoTela'
import { RaioXTela } from '../raio-x/RaioXTela'

/**
 * Telas cheias da S09 que abrem por cima de qualquer módulo: o assistente de
 * implantação do escritório (S09-T13) e o Raio-X do Drive (S09-T14). Ficam
 * guardadas no banco: recarregar a página volta para onde estava. O Raio-X
 * pode abrir por cima da implantação (passo 5).
 */

export type TelaCheia = 'implantacao' | 'raiox'
const CHAVE = 's09:telas-cheias'

export function useTelasCheias() {
  const [abertas, setAbertas] = usePersistente<TelaCheia[]>(CHAVE, [])
  return {
    abertas,
    abrir: (t: TelaCheia) => setAbertas((xs) => [...xs.filter((x) => x !== t), t]),
    fechar: (t: TelaCheia) => setAbertas((xs) => xs.filter((x) => x !== t)),
  }
}

/** Moldura de tela cheia (diálogo que cobre o sistema, com fechar no topo). */
export function MolduraTelaCheia({ titulo, sub, onFechar, children, acao }: { titulo: string; sub?: string; onFechar: () => void; children: ReactNode; acao?: ReactNode }) {
  return (
    <DialogPrimitive.Root open onOpenChange={(v) => !v && onFechar()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[55] bg-black/45" />
        <DialogPrimitive.Content aria-describedby={undefined} className="from-background to-background-end text-foreground fixed inset-0 z-[55] flex flex-col overflow-hidden bg-gradient-to-b outline-none sm:inset-4 sm:rounded-[28px] sm:shadow-2xl">
          <header className="flex shrink-0 items-center gap-2 border-b px-3 py-2.5 sm:px-5">
            <div className="min-w-0 flex-1">
              <DialogPrimitive.Title className="truncate text-base font-medium sm:text-lg">{titulo}</DialogPrimitive.Title>
              {sub && <p className="text-muted-foreground truncate text-xs">{sub}</p>}
            </div>
            {acao}
            <DialogPrimitive.Close asChild>
              <Button size="icon-sm" variant="ghost" className="rounded-full" aria-label="Fechar">
                <XIcon />
              </Button>
            </DialogPrimitive.Close>
          </header>
          <div className="area-rolagem-dupla min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-6">{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

/** Montada uma vez na Plataforma. */
export function TelasCheiasS09() {
  const { abertas, fechar } = useTelasCheias()
  return (
    <>
      {abertas.map((t) =>
        t === 'implantacao' ? <ImplantacaoTela key={t} onFechar={() => fechar('implantacao')} /> : <RaioXTela key={t} onFechar={() => fechar('raiox')} />,
      )}
    </>
  )
}

import { XIcon } from '@phosphor-icons/react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { useEffect, useRef, type ReactNode } from 'react'
import { useHash } from '@/nucleo/rotas'
import { usePersistente } from '@/ambiente/loja'
import { Button } from '@/components/ui/button'
import { ImplantacaoTela } from '../implantacao/ImplantacaoTela'
import { RaioXTela } from '../raio-x/RaioXTela'
import { AreaRolagem } from '@/components/ui/area-rolagem'

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
        <DialogPrimitive.Overlay className="fixed inset-0 z-[45] bg-black/45" />
        <DialogPrimitive.Content aria-describedby={undefined} className="from-background to-background-end text-foreground fixed inset-0 z-[45] flex flex-col overflow-hidden bg-gradient-to-b outline-none sm:inset-4 sm:rounded-xl sm:shadow-2xl">
          <header className="flex shrink-0 items-center gap-2 border-b px-4 py-2.5 sm:px-5">
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
          <AreaRolagem className="flex-1 px-3 py-4 sm:px-6">{children}</AreaRolagem>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

/** Montada uma vez na Plataforma. */
export function TelasCheiasS09() {
  const { abertas, fechar } = useTelasCheias()
  // Ir para outro módulo ou aba (um link de toast, o menu) fecha as telas cheias.
  const caminho = useHash().split('?')[0]
  const anterior = useRef(caminho)
  useEffect(() => {
    if (anterior.current !== caminho) abertas.forEach(fechar)
    anterior.current = caminho
  }, [caminho]) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <>
      {abertas.map((t) =>
        t === 'implantacao' ? <ImplantacaoTela key={t} onFechar={() => fechar('implantacao')} /> : <RaioXTela key={t} onFechar={() => fechar('raiox')} />,
      )}
    </>
  )
}

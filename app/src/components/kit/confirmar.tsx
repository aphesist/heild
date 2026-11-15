import { WarningIcon } from '@phosphor-icons/react'
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

/**
 * Diálogo de confirmação. "Nada se apaga sozinho": toda ação que exclui,
 * cancela ou manda para fora pergunta antes, com o que vai acontecer em
 * palavras simples. Com `exigirMotivo`, a pessoa escreve o motivo (vai para o
 * evento); a promessa devolve o motivo, `true` (sem motivo) ou `false`.
 *
 *   const confirmar = useConfirmar()
 *   const motivo = await confirmar({ titulo: 'Cancelar a obrigação?', acao: 'Cancelar obrigação', perigo: true, exigirMotivo: true })
 *   if (motivo) repos.obrigacoes.cancelar(id, motivo as string)
 */

export interface PedidoConfirmacao {
  titulo: string
  descricao?: ReactNode
  /** Rótulo do botão que confirma ("Excluir", "Enviar ao cliente"). */
  acao: string
  cancelar?: string
  /** Ação destrutiva: botão vermelho. */
  perigo?: boolean
  exigirMotivo?: boolean
  rotuloMotivo?: string
}

type Resposta = string | boolean
const Ctx = createContext<((p: PedidoConfirmacao) => Promise<Resposta>) | null>(null)

export function ConfirmarProvider({ children }: { children: ReactNode }) {
  const [pedido, setPedido] = useState<PedidoConfirmacao | null>(null)
  const resolver = useRef<(r: Resposta) => void>(() => {})
  const confirmar = useCallback(
    (p: PedidoConfirmacao) =>
      new Promise<Resposta>((r) => {
        resolver.current = r
        setPedido(p)
      }),
    [],
  )
  const fechar = (r: Resposta) => {
    resolver.current(r)
    setPedido(null)
  }
  return (
    <Ctx.Provider value={confirmar}>
      {children}
      <DialogoConfirmacao pedido={pedido} onResponder={fechar} />
    </Ctx.Provider>
  )
}

/** Pede confirmação. Fora do provider, cai no `window.confirm` (stories isoladas). */
export function useConfirmar() {
  const c = useContext(Ctx)
  return c ?? (async (p: PedidoConfirmacao) => (p.exigirMotivo ? (window.prompt(p.titulo) ?? false) : window.confirm(p.titulo)))
}

export function DialogoConfirmacao({ pedido, onResponder }: { pedido: PedidoConfirmacao | null; onResponder: (r: Resposta) => void }) {
  const [motivo, setMotivo] = useState('')
  const aberto = !!pedido
  const pode = !pedido?.exigirMotivo || motivo.trim().length >= 3
  return (
    <Dialog
      open={aberto}
      onOpenChange={(v) => {
        if (!v) {
          setMotivo('')
          onResponder(false)
        }
      }}
    >
      <DialogContent className="bg-surface rounded-xl border-0 p-5 sm:max-w-md" onOpenAutoFocus={(e) => pedido?.perigo && !pedido.exigirMotivo && e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-medium">
            {pedido?.perigo && <WarningIcon className="text-destructive size-5 shrink-0" />}
            {pedido?.titulo}
          </DialogTitle>
          {pedido?.descricao && <DialogDescription>{pedido.descricao}</DialogDescription>}
        </DialogHeader>
        {pedido?.exigirMotivo && (
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">{pedido.rotuloMotivo ?? 'Motivo'}</span>
            <textarea
              autoFocus
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={3}
              placeholder="Fica registrado com o seu nome e a data"
              className="bg-raised shadow-contorno placeholder:text-muted-foreground focus-visible:ring-ring/40 w-full resize-y rounded-md px-3 py-2.5 text-sm outline-none focus-visible:ring-[3px]"
            />
          </label>
        )}
        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            className="rounded-full"
            onClick={() => {
              setMotivo('')
              onResponder(false)
            }}
          >
            {pedido?.cancelar ?? 'Voltar'}
          </Button>
          <Button
            type="button"
            variant={pedido?.perigo ? 'destructive' : 'default'}
            className={cn('rounded-full')}
            disabled={!pode}
            onClick={() => {
              const r = pedido?.exigirMotivo ? motivo.trim() : true
              setMotivo('')
              onResponder(r)
            }}
          >
            {pedido?.acao}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

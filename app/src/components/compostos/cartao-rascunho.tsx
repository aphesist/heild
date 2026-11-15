import { CopyIcon, NotePencilIcon } from '@phosphor-icons/react'
import { usePersistente, useLoja } from '@/ambiente/loja'
import { RascunhoComLacunas, textoDoValor, type QualquerValor } from '@/components/kit/valor-editavel'
import { Button } from '@/components/ui/button'
import type { Cartao } from '@/dados/tipos'
import { cn } from '@/lib/utils'
import { CartaoPreviaMensagem } from './cartoes-s01'

type Por<T extends Cartao['tipo']> = Extract<Cartao, { tipo: T }>

/** O texto final do rascunho: cada lacuna vira o valor escolhido, no formato do seletor. */
export function textoDoRascunho(cartao: Por<'rascunho'>, valores: Record<string, QualquerValor | undefined>) {
  return cartao.partes.map((p) => (typeof p === 'string' ? p : textoDoValor(p.lacuna.config, valores[p.lacuna.id]) || `[${p.lacuna.pergunta}]`)).join('')
}

/**
 * Rascunho do integrante com lacunas (fase 6, Leaving Blanks): ele não
 * inventa prazo, presença ou decisão; deixa o espaço e diz quantos faltam.
 * Preenchido, "Continuar" vira a prévia da mensagem (que segue para
 * aprovação) ou o texto pronto para copiar.
 */
export function CartaoRascunho({ cartao, className }: { cartao: Por<'rascunho'>; className?: string }) {
  const loja = useLoja()
  const [estado, setEstado] = usePersistente<{ valores: Record<string, QualquerValor | undefined>; pronto: boolean }>(`rascunho:${cartao.id}`, { valores: {}, pronto: false })
  const final = textoDoRascunho(cartao, estado.valores)
  if (estado.pronto && cartao.depois) return <CartaoPreviaMensagem cartao={{ ...cartao.depois, id: `${cartao.id}-previa`, texto: final }} />
  return (
    <div className={cn('bg-card shadow-contorno flex flex-col gap-2 rounded-lg p-3', className)}>
      <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
        <NotePencilIcon className="size-4" aria-hidden /> {cartao.titulo}
      </div>
      {estado.pronto ? (
        <>
          <p className="text-sm leading-7 whitespace-pre-wrap">{final}</p>
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="outline"
              className="rounded-full"
              onClick={() => {
                void navigator.clipboard?.writeText(final)
                loja.toast('Texto copiado.')
              }}
            >
              <CopyIcon /> Copiar
            </Button>
          </div>
        </>
      ) : (
        <RascunhoComLacunas
          partes={cartao.partes}
          valores={estado.valores}
          onPreencher={(id, v) => setEstado((e) => ({ ...e, valores: { ...e.valores, [id]: v } }))}
          onContinuar={() => setEstado((e) => ({ ...e, pronto: true }))}
          rotuloContinuar={cartao.depois ? 'Ver a mensagem' : 'Pronto'}
        />
      )}
    </div>
  )
}

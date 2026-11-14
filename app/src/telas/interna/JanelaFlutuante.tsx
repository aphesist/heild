import { CaretUpIcon, MinusIcon, XIcon } from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'motion/react'
import { useMinhasConversasInternas, useNaoLidasInternas, useRotuloConversa } from '@/ambiente/interna'
import { useNavegacao, usePersistente } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import { Contador } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useMedia } from '@/hooks/useMedia'
import { PainelConversa } from './PainelConversa'

export function useJanelaFlutuante() {
  const { usuario } = useSessao()
  return usePersistente<{ conversa: string | null; minimizada: boolean }>(`s05:interna:flutuante:${usuario.id}`, { conversa: null, minimizada: false })
}

/** Janela flutuante (11, 6; S05-A87): uma conversa pequena aberta sobre qualquer tela. No celular, a gaveta faz esse papel. */
export function JanelaFlutuante() {
  const [janela, setJanela] = useJanelaFlutuante()
  const conversas = useMinhasConversasInternas()
  const rotulo = useRotuloConversa()
  const { porConversa } = useNaoLidasInternas()
  const nav = useNavegacao()
  const larga = useMedia('(min-width: 768px)')
  const c = conversas.find((x) => x.id === janela.conversa)
  if (!larga) return null
  return (
    <AnimatePresence>
      {c && (
        <motion.div
          key={c.id}
          role="dialog"
          aria-label={`Janela flutuante: ${rotulo(c)}`}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          className="bg-surface shadow-2xl absolute right-6 bottom-20 z-30 flex w-[380px] flex-col overflow-hidden rounded-[22px] border"
          style={{ height: janela.minimizada ? 'auto' : 'min(520px, calc(100% - 7rem))' }}
        >
          <div className="bg-sunken/60 flex items-center gap-2 px-3 py-1.5">
            <span className="min-w-0 flex-1 truncate text-xs font-medium">{rotulo(c)}</span>
            {janela.minimizada && <Contador valor={porConversa[c.id] ?? 0} />}
            <Button size="icon-sm" variant="ghost" className="size-7 rounded-full" aria-label={janela.minimizada ? 'Restaurar janela' : 'Minimizar janela'} onClick={() => setJanela({ ...janela, minimizada: !janela.minimizada })}>
              {janela.minimizada ? <CaretUpIcon /> : <MinusIcon />}
            </Button>
            <Button size="icon-sm" variant="ghost" className="size-7 rounded-full" aria-label="Fechar janela flutuante" onClick={() => setJanela({ conversa: null, minimizada: false })}>
              <XIcon />
            </Button>
          </div>
          {!janela.minimizada && (
            <PainelConversa
              conversa={c}
              compacto
              onTelaCheia={() => {
                setJanela({ conversa: null, minimizada: false })
                nav.irPara({ modulo: 'interna', aba: 'conversas', conversaInterna: c.id })
              }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

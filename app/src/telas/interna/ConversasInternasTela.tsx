import { useState } from 'react'
import { useItemNaRota } from '@/nucleo/rotas'
import { AbaEquipe } from './AbaEquipe'

/** Conversas internas em tela cheia (`#/interna`); esqueleto do contrato C8 revisto. */
export function ConversasInternasTela({ conversaInicial }: { conversaInicial?: string }) {
  const [conversa, setConversa] = useState<string | null>(conversaInicial ?? null)
  useItemNaRota({ conversaInterna: conversa ?? undefined })
  return (
    <div className="h-full px-2 pb-2 sm:px-4 sm:pb-4">
      <div className="bg-surface shadow-painel flex h-full flex-col overflow-hidden rounded-[24px] sm:rounded-[34px]">
        <AbaEquipe conversa={conversa} onConversa={setConversa} />
      </div>
    </div>
  )
}

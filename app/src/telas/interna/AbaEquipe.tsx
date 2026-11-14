import { ArrowsOutIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { useMinhasConversasInternas, useSincronizarCanais } from '@/ambiente/interna'
import { useNavegacao } from '@/ambiente/loja'
import { Button } from '@/components/ui/button'
import type { Id } from '@/nucleo/modelo/entidades'
import { AvisoPrimeiroUso } from './AvisoPrimeiroUso'
import { useJanelaFlutuante } from './JanelaFlutuante'
import { ListaInternas } from './ListaInternas'
import { DialogoNovaConversa } from './NovaConversa'
import { PainelConversa } from './PainelConversa'

/**
 * Aba Equipe da gaveta do Chat (contrato C8 revisto): as conversas internas
 * da pessoa; abrir uma mostra a conversa inteira em uma coluna (fio e
 * detalhes por cima); "abrir em tela cheia" leva a `#/interna`.
 */
export function AbaEquipe({ conversa, onConversa, onFechar }: { conversa: string | null; onConversa: (id: string | null) => void; onFechar?: () => void }) {
  useSincronizarCanais()
  const nav = useNavegacao()
  const conversas = useMinhasConversasInternas()
  const [, setFlutuante] = useJanelaFlutuante()
  const [nova, setNova] = useState<'pessoal' | 'grupo' | null>(null)
  const [destaque, setDestaque] = useState<Id | null>(null)
  const telaCheia = (id?: string | null) => {
    onFechar?.()
    nav.irPara({ modulo: 'interna', aba: 'conversas', ...(id ? { conversaInterna: id } : {}) })
  }
  const aberta = conversas.find((c) => c.id === conversa)
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AvisoPrimeiroUso />
      {aberta ? (
        <PainelConversa
          key={aberta.id}
          conversa={aberta}
          compacto
          destaque={destaque}
          onVoltar={() => onConversa(null)}
          onTelaCheia={() => telaCheia(aberta.id)}
          onFlutuante={() => {
            setFlutuante({ conversa: aberta.id, minimizada: false })
            onFechar?.()
          }}
        />
      ) : (
        <>
          <ListaInternas
            compacto
            onAbrir={(id, m) => {
              setDestaque(m ?? null)
              onConversa(id)
            }}
            onNova={setNova}
          />
          <div className="border-t p-3">
            <Button variant="outline" className="w-full rounded-full" onClick={() => telaCheia()}>
              <ArrowsOutIcon /> Abrir em tela cheia
            </Button>
          </div>
        </>
      )}
      <DialogoNovaConversa tipo={nova} onFechar={() => setNova(null)} onCriada={(id) => onConversa(id)} />
    </div>
  )
}

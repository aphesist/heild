import { ArrowsOutIcon, HashIcon, UsersThreeIcon, UserIcon, MegaphoneIcon } from '@phosphor-icons/react'
import { useMemo } from 'react'
import { useNavegacao } from '@/ambiente/loja'
import { useMinhasConversasInternas, useNaoLidasInternas } from '@/ambiente/interna'
import { useSessao } from '@/ambiente/sessao'
import { Contador } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EstadoVazio } from '@/components/kit/estados'
import type { ConversaInterna } from '@/nucleo/modelo/entidades'
import { useTabela } from '@/nucleo/react'
import { cn } from '@/lib/utils'
import { ConversaCompacta } from './ConversaCompacta'

const icone = { pessoal: UserIcon, grupo: UsersThreeIcon, canal_setor: HashIcon, canal_geral: MegaphoneIcon }

/**
 * Aba Equipe da gaveta do Chat (esqueleto do contrato C8 revisto): as
 * conversas internas da pessoa com as não lidas e o "abrir em tela cheia".
 * A conversa completa entra na entrega da S05.
 */
export function AbaEquipe({ conversa, onConversa, onFechar }: { conversa: string | null; onConversa: (id: string | null) => void; onFechar?: () => void }) {
  const nav = useNavegacao()
  const { usuario, contas } = useSessao()
  const conversas = useMinhasConversasInternas()
  const participacoes = useTabela('participacao')
  const { porConversa } = useNaoLidasInternas()
  const nome = useMemo(() => (c: ConversaInterna) => {
    if (c.tipo !== 'pessoal') return c.nome ?? 'Conversa'
    const outro = participacoes.find((p) => p.conversa_interna_id === c.id && p.usuario_id !== usuario.id)
    return contas.find((u) => u.id === outro?.usuario_id)?.nome ?? 'Conversa pessoal'
  }, [participacoes, contas, usuario.id])
  const telaCheia = (id?: string | null) => {
    onFechar?.()
    nav.irPara({ modulo: 'interna', aba: 'conversas', ...(id ? { conversaInterna: id } : {}) })
  }
  const aberta = conversas.find((c) => c.id === conversa)
  if (aberta) return <ConversaCompacta conversa={aberta} titulo={nome(aberta)} onVoltar={() => onConversa(null)} onTelaCheia={() => telaCheia(aberta.id)} />
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="area-rolagem-dupla flex-1 overflow-y-auto p-2">
        {conversas.length === 0 ? (
          <EstadoVazio icone={UsersThreeIcon} titulo="Nenhuma conversa ainda" descricao="Comece com um colega ou use o canal do seu setor." />
        ) : (
          <ul className="flex flex-col gap-0.5">
            {conversas.map((c) => {
              const Icone = icone[c.tipo]
              const n = porConversa[c.id] ?? 0
              return (
                <li key={c.id}>
                  <button type="button" onClick={() => onConversa(c.id)} className={cn('hover:bg-sunken flex w-full cursor-pointer items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm', n > 0 && 'font-medium')}>
                    <Icone className="text-muted-foreground size-4 shrink-0" />
                    <span className="min-w-0 flex-1 truncate">{nome(c)}</span>
                    <Contador valor={n} />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
      <div className="border-t p-3">
        <Button variant="outline" className="w-full rounded-full" onClick={() => telaCheia()}>
          <ArrowsOutIcon /> Abrir em tela cheia
        </Button>
      </div>
    </div>
  )
}

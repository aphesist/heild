import { ArrowLeftIcon, ArrowsOutIcon, PaperPlaneRightIcon } from '@phosphor-icons/react'
import { useEffect, useMemo, useState } from 'react'
import { useLidas } from '@/ambiente/interna'
import { useSessao } from '@/ambiente/sessao'
import { useAcao } from '@/components/kit'
import { Button } from '@/components/ui/button'
import type { ConversaInterna } from '@/nucleo/modelo/entidades'
import { useTabela } from '@/nucleo/react'
import { repos } from '@/nucleo/repositorios'

/** Conversa interna pequena, dentro da gaveta do Chat (esqueleto: ler e enviar). */
export function ConversaCompacta({ conversa, titulo, onVoltar, onTelaCheia }: { conversa: ConversaInterna; titulo: string; onVoltar: () => void; onTelaCheia: () => void }) {
  const { contas } = useSessao()
  const tMensagens = useTabela('mensagem_interna')
  const mensagens = useMemo(() => tMensagens.filter((m) => m.conversa_interna_id === conversa.id).sort((a, b) => a.criado_em.localeCompare(b.criado_em)), [tMensagens, conversa.id])
  const { marcarLida } = useLidas()
  const ultima = mensagens.at(-1)?.criado_em
  useEffect(() => {
    if (ultima) marcarLida(conversa.id, ultima)
  }, [ultima, conversa.id, marcarLida])
  const [texto, setTexto] = useState('')
  const executar = useAcao()
  const enviar = () => {
    if (!texto.trim()) return
    executar(() => repos.mensagensInternas.enviar(conversa.id, texto.trim()))
    setTexto('')
  }
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-2 border-b px-3 py-2">
        <Button size="icon-sm" variant="ghost" className="rounded-full" aria-label="Voltar às conversas" onClick={onVoltar}>
          <ArrowLeftIcon />
        </Button>
        <span className="min-w-0 flex-1 truncate text-sm font-medium">{titulo}</span>
        <Button size="icon-sm" variant="ghost" className="rounded-full" aria-label="Abrir em tela cheia" onClick={onTelaCheia}>
          <ArrowsOutIcon />
        </Button>
      </div>
      <ol className="area-rolagem-dupla flex flex-1 flex-col gap-3 overflow-y-auto p-4">
        {mensagens.map((m) => (
          <li key={m.id} className="text-sm">
            <span className="font-medium">{contas.find((u) => u.id === m.autor_id)?.nome ?? m.autor_id}</span>
            <p className="text-foreground/90 whitespace-pre-wrap">{m.corpo}</p>
          </li>
        ))}
      </ol>
      <form
        className="flex items-center gap-2 border-t p-3"
        onSubmit={(e) => {
          e.preventDefault()
          enviar()
        }}
      >
        <input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escreva para a equipe" aria-label="Mensagem para a equipe" className="bg-sunken placeholder:text-muted-foreground h-10 min-w-0 flex-1 rounded-full px-4 text-sm outline-none" />
        <Button type="submit" size="icon" className="rounded-full" aria-label="Enviar">
          <PaperPlaneRightIcon />
        </Button>
      </form>
    </div>
  )
}

import { CheckIcon, MagnifyingGlassIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { useAcoesInternas, usePresenca } from '@/ambiente/interna'
import { useLoja } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CampoTexto } from '@/components/ui/formulario'
import { cn } from '@/lib/utils'
import type { Id } from '@/nucleo/modelo/entidades'
import { PontoPresenca } from './pecas'

/** Lista de colegas para escolher (conversa pessoal, grupo, adicionar ao grupo). */
export function EscolherPessoas({ escolhidas, onMudar, excluir = [], unica }: { escolhidas: Id[]; onMudar: (ids: Id[]) => void; excluir?: Id[]; unica?: boolean }) {
  const { contas, usuario } = useSessao()
  const presenca = usePresenca()
  const [busca, setBusca] = useState('')
  const colegas = contas.filter((u) => u.situacao === 'ativo' && u.id !== usuario.id && !excluir.includes(u.id) && u.nome.toLowerCase().includes(busca.trim().toLowerCase()))
  return (
    <div className="flex flex-col gap-2">
      <label className="bg-raised shadow-contorno flex h-9 items-center gap-2 rounded-full px-3">
        <MagnifyingGlassIcon className="text-muted-foreground size-4" />
        <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar colega" aria-label="Buscar colega" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
      </label>
      <ul className="flex max-h-64 flex-col gap-0.5 overflow-y-auto">
        {colegas.length === 0 && <li className="text-muted-foreground px-3 py-4 text-center text-sm">Ninguém com esse nome.</li>}
        {colegas.map((u) => {
          const sel = escolhidas.includes(u.id)
          return (
            <li key={u.id}>
              <button
                type="button"
                aria-pressed={sel}
                onClick={() => onMudar(unica ? [u.id] : sel ? escolhidas.filter((x) => x !== u.id) : [...escolhidas, u.id])}
                className={cn('flex w-full cursor-pointer items-center gap-2.5 rounded-[12px] px-2 py-1.5 text-left text-sm', sel ? 'bg-primary/10' : 'hover:bg-sunken')}
              >
                <span className="relative inline-flex shrink-0">
                  <Avatar nome={u.nome} tamanho="sm" />
                  <PontoPresenca presenca={presenca(u.id)} className="absolute -right-0.5 -bottom-0.5 size-2" />
                </span>
                <span className="min-w-0 flex-1 truncate">{u.nome}</span>
                <span className="text-muted-foreground text-xs">{u.cargo ?? ''}</span>
                {sel && <CheckIcon className="text-primary size-4" />}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/** Começar conversa pessoal (S05-A65) ou criar grupo (S05-A66). */
export function DialogoNovaConversa({ tipo, onFechar, onCriada }: { tipo: 'pessoal' | 'grupo' | null; onFechar: () => void; onCriada: (id: Id) => void }) {
  const acoes = useAcoesInternas()
  const loja = useLoja()
  const [ids, setIds] = useState<Id[]>([])
  const [nome, setNome] = useState('')
  const [tentou, setTentou] = useState(false)
  const fechar = () => {
    setIds([])
    setNome('')
    setTentou(false)
    onFechar()
  }
  const criar = () => {
    setTentou(true)
    if (!ids.length || (tipo === 'grupo' && !nome.trim())) return
    try {
      const id = tipo === 'pessoal' ? acoes.pessoal(ids[0]) : acoes.grupo(nome, ids)
      if (tipo === 'grupo') loja.toast(`Grupo ${nome.trim()} criado`)
      fechar()
      onCriada(id)
    } catch (e) {
      loja.toastErro(e instanceof Error ? e.message : String(e))
    }
  }
  return (
    <Dialog open={!!tipo} onOpenChange={(v) => !v && fechar()}>
      <DialogContent className="bg-surface rounded-[24px] border-0 p-5 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-medium">{tipo === 'pessoal' ? 'Nova conversa pessoal' : 'Novo grupo'}</DialogTitle>
          <DialogDescription>{tipo === 'pessoal' ? 'Fechada entre vocês dois. Se já existir, ela reabre com o histórico.' : 'Qualquer pessoa cria grupo. A entrada e a saída de cada um ficam registradas.'}</DialogDescription>
        </DialogHeader>
        {tipo === 'grupo' && (
          <div className="flex flex-col gap-1">
            <CampoTexto valor={nome} onMudar={setNome} placeholder="Nome do grupo" aria-label="Nome do grupo" />
            {tentou && !nome.trim() && <span className="text-destructive text-xs">Dê um nome ao grupo.</span>}
          </div>
        )}
        <EscolherPessoas escolhidas={ids} onMudar={setIds} unica={tipo === 'pessoal'} />
        {tentou && !ids.length && <span className="text-destructive text-xs">{tipo === 'pessoal' ? 'Escolha um colega.' : 'Escolha pelo menos um colega.'}</span>}
        <DialogFooter>
          <Button variant="ghost" className="rounded-full" onClick={fechar}>
            Cancelar
          </Button>
          <Button className="rounded-full" onClick={criar}>
            {tipo === 'pessoal' ? 'Começar conversa' : `Criar grupo${ids.length ? ` com ${ids.length + 1}` : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

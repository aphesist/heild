import { CheckIcon, ListChecksIcon, PlayIcon, WarningIcon } from '@phosphor-icons/react'
import { useMemo, useState } from 'react'
import { useFluxos } from '@/ambiente/fluxos'
import { useLoja } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import { EstadoVazio } from '@/components/kit/estados'
import { rotuloStatus, statusAberto } from '@/components/compostos/rotulos'
import { Button } from '@/components/ui/button'
import { useAparencia } from '@/hooks/useAparencia'
import type { Tarefa } from '@/dados/tipos'
import { cn } from '@/lib/utils'

/**
 * Minha fila (destino "Tarefas" do celular; 03, 2.6): as tarefas abertas da
 * pessoa e dos setores dela, as atrasadas primeiro, com as ações de um toque
 * (iniciar, concluir). Abrir leva à ficha da tarefa (contrato C4). Editar o
 * resto (prazo, responsável, checklist) é na ficha.
 */

export const ordemPrazo = (p?: string) => {
  const m = p?.match(/^(\d{2})\/(\d{2})/)
  return m ? Number(m[2]) * 100 + Number(m[1]) : 9999
}

type Filtro = 'minhas' | 'setor' | 'atrasadas'

export function useMinhaFila(filtro: Filtro) {
  const loja = useLoja()
  const { usuario, permissoes } = useSessao()
  return useMemo(() => {
    const doSetor = loja.tarefas.filter((t) => statusAberto(t.status) && (usuario.papel === 'administrador' || permissoes.setores.includes(t.setor)))
    const lista = filtro === 'minhas' ? doSetor.filter((t) => t.responsavel?.nome === usuario.nome || (t.responsavel?.tipo === 'integrante' && permissoes.setores.includes(t.setor))) : filtro === 'atrasadas' ? doSetor.filter((t) => t.atrasada) : doSetor
    return [...lista].sort((a, b) => Number(!!b.atrasada) - Number(!!a.atrasada) || ordemPrazo(a.prazo) - ordemPrazo(b.prazo))
  }, [loja.tarefas, usuario.papel, usuario.nome, permissoes.setores, filtro])
}

export function MinhaFila({ className }: { className?: string }) {
  const [filtro, setFiltro] = useState<Filtro>('minhas')
  const lista = useMinhaFila(filtro)
  const loja = useLoja()
  const fluxos = useFluxos()
  const aparencia = useAparencia()
  const { usuario } = useSessao()

  const mudar = (t: Tarefa, status: Tarefa['status'], texto: string) => {
    const antes = t.status
    loja.atualizarTarefa(t.id, { status })
    loja.registrar(usuario.nome, `${texto}: ${t.codigo} · ${t.titulo}`)
    loja.toastDesfazer(`${texto}: ${t.titulo}`, () => loja.atualizarTarefa(t.id, { status: antes }))
  }

  return (
    <div className={cn('flex min-h-0 flex-col gap-3', className)}>
      <div role="radiogroup" aria-label="Quais tarefas" className="bg-sunken flex w-fit rounded-full p-0.5 text-xs">
        {(
          [
            ['minhas', 'Minhas'],
            ['setor', 'Dos meus setores'],
            ['atrasadas', 'Atrasadas'],
          ] as const
        ).map(([v, r]) => (
          <button key={v} type="button" role="radio" aria-checked={filtro === v} onClick={() => setFiltro(v)} className={cn('cursor-pointer rounded-full px-3 py-1.5', filtro === v && 'bg-raised shadow-pilula font-medium')}>
            {r}
          </button>
        ))}
      </div>
      {lista.length === 0 ? (
        <EstadoVazio compacto icone={ListChecksIcon} titulo={filtro === 'atrasadas' ? 'Nada atrasado' : 'Fila vazia'} descricao={filtro === 'minhas' ? 'Nenhuma tarefa aberta com você. Veja as dos seus setores.' : 'Nenhuma tarefa aberta aqui.'} />
      ) : (
        <ul className="flex flex-col gap-2">
          {lista.map((t) => {
            const a = aparencia({ setor: t.setor })
            return (
              <li key={t.id} className="bg-surface shadow-contorno flex flex-col gap-2 rounded-lg p-3">
                <button type="button" onClick={() => fluxos.abrirTarefa(t.id)} className="flex cursor-pointer flex-col gap-0.5 text-left">
                  <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                    <span className="size-2 rounded-full" style={{ background: a.cor }} aria-hidden />
                    {a.nome} · {t.codigo} · {rotuloStatus[t.status]}
                    {t.atrasada && (
                      <span className="text-warning-text ml-auto flex items-center gap-1 font-medium">
                        <WarningIcon className="size-3.5" weight="fill" /> atrasada
                      </span>
                    )}
                  </span>
                  <span className="text-sm font-medium">{t.titulo}</span>
                  <span className="text-muted-foreground text-xs">
                    {t.cliente || 'Escritório'} · prazo {t.prazo || 'sem prazo'}
                    {t.responsavel ? ` · ${t.responsavel.nome}` : ' · sem responsável'}
                  </span>
                </button>
                <div className="flex gap-2">
                  {t.status === 'a_fazer' && (
                    <Button size="sm" variant="outline" className="rounded-full" onClick={() => mudar(t, 'em_andamento', 'Iniciou')}>
                      <PlayIcon /> Iniciar
                    </Button>
                  )}
                  {t.status === 'em_andamento' && (
                    <Button size="sm" variant="outline" className="rounded-full" onClick={() => mudar(t, 'concluida', 'Concluiu')}>
                      <CheckIcon /> Concluir
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" className="rounded-full" onClick={() => fluxos.abrirTarefa(t.id)}>
                    Abrir
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

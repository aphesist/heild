import { useMemo } from 'react'
import { ArrowRightIcon, CalendarCheckIcon } from '@phosphor-icons/react'
import { useFluxos } from '@/ambiente/fluxos'
import { useNavegacao } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import { EstadoVazio } from '@/components/kit'
import { Button } from '@/components/ui/button'
import type { DefWidget, TamanhoWidget } from '@/components/widgets/tipos'
import { ddmm, diasEntre, HOJE_DEMO, itensDeObrigacao, pedirFiltroSetor, type ItemObrigacao, type StatusObrigacao } from '@/dados/obrigacoes-setor'
import { rotuloSetorCurto } from '@/nucleo/permissoes/setores'
import { useTabela } from '@/nucleo/react'
import { cn } from '@/lib/utils'
import type { SetorIntegrante } from '@/theme/tipos'
import type { CtxAba } from './tipos'

/**
 * Contrato C1 (S02): bloco "Obrigações do setor" (03, ad. 14/11). Cada aba de
 * setor (Fiscal, DP, Contábil, Societário, Notas) mostra as próximas obrigações
 * do setor dono para o cliente selecionado, ou para a carteira, com o mesmo
 * dado da aba Obrigações e "ver todas", que abre a aba Obrigações filtrada pelo
 * setor de origem (S02-A53).
 *
 * Uso (S03, S04), no catálogo da aba:
 *   catalogo: [..., widgetObrigacoesDoSetor('fiscal', ctx)]
 * e no arranjo padrão (`padroes.ts`), a chave `obrigacoes-setor`.
 */
export function widgetObrigacoesDoSetor(setor: SetorIntegrante, ctx: CtxAba): DefWidget {
  return {
    id: 'obrigacoes-setor',
    titulo: `Obrigações do setor · ${rotuloSetorCurto[setor] ?? setor}`,
    descricao: 'Próximas obrigações deste setor, com o mesmo dado da aba Obrigações e "ver todas"',
    icone: CalendarCheckIcon,
    tamanhos: ['M', 'G', 'XL'],
    acao: <VerTodas setor={setor} />,
    conteudo: (t) => <ObrigacoesDoSetor setor={setor} clienteId={ctx.cliente?.id} tamanho={t} />,
  }
}

/** "Ver todas": abre a aba Obrigações já filtrada pelo setor (S02-A53). */
export function VerTodas({ setor }: { setor: SetorIntegrante }) {
  const nav = useNavegacao()
  return (
    <Button
      size="sm"
      variant="ghost"
      className="h-6 rounded-full px-2 text-xs"
      onClick={() => {
        pedirFiltroSetor(setor)
        nav.irPara({ modulo: 'painel', aba: 'obrigacoes', filtroSetor: setor })
      }}
    >
      ver todas <ArrowRightIcon className="size-3" />
    </Button>
  )
}

/** Rótulo de estado de obrigação: texto e cor (nunca só cor, 1.5). */
export const corStatusObrigacao: Record<StatusObrigacao, string> = {
  entregue: 'bg-success/15',
  pendente: 'bg-sunken text-muted-foreground',
  'vence hoje': 'bg-warning/15',
  'em risco': 'bg-warning/15',
  atrasada: 'bg-destructive/12 text-destructive',
  cancelada: 'bg-sunken text-muted-foreground line-through',
  dispensada: 'bg-sunken text-muted-foreground',
}

export function SeloStatusObrigacao({ status, className }: { status: StatusObrigacao; className?: string }) {
  return <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[11px] whitespace-nowrap', corStatusObrigacao[status], className)}>{status}</span>
}

/** Ocorrências do setor (abertas primeiro, por prazo legal). */
export function useObrigacoesDoSetor(setor: SetorIntegrante, clienteId?: string): ItemObrigacao[] {
  const tarefas = useTabela('tarefa')
  const clientes = useTabela('cliente')
  const regras = useTabela('obrigacao')
  const { permissoes } = useSessao()
  return useMemo(() => {
    // Notas vem com o Fiscal por padrão (E-03): quem tem Fiscal vê as de Notas.
    const pode = permissoes.setores.includes(setor) || (setor === 'notas' && permissoes.setores.includes('fiscal'))
    if (!pode) return []
    return itensDeObrigacao(tarefas, clientes, regras).filter((i) => i.setor === setor && (!clienteId || i.clienteId === clienteId))
  }, [tarefas, clientes, regras, setor, clienteId, permissoes.setores])
}

function ObrigacoesDoSetor({ setor, clienteId, tamanho }: { setor: SetorIntegrante; clienteId?: string; tamanho: TamanhoWidget }) {
  const fluxos = useFluxos()
  const itens = useObrigacoesDoSetor(setor, clienteId)
  const abertas = itens.filter((i) => i.status !== 'entregue' && i.status !== 'cancelada' && i.status !== 'dispensada')
  const entregues = itens.length - abertas.length
  if (!itens.length) return <EstadoVazio titulo="Sem obrigações deste setor" descricao={clienteId ? 'O perfil do cliente não gera obrigações para este setor nesta competência.' : 'Gere o calendário do mês na aba Obrigações.'} />
  const limite = tamanho === 'M' ? 2 : tamanho === 'G' ? 5 : 8
  return (
    <div className="flex h-full flex-col gap-1.5">
      <ul className="divide-border/70 flex flex-col divide-y">
        {abertas.slice(0, limite).map((o) => {
          const dias = o.legal ? diasEntre(HOJE_DEMO, o.legal) : undefined
          return (
            <li key={o.id}>
              <button type="button" onClick={() => fluxos.abrirTarefa(o.id)} className="hover:bg-sunken flex w-full cursor-pointer items-center gap-3 rounded-lg py-1.5 text-left">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm">
                    {o.nome} {o.competencia && <span className="text-muted-foreground">{o.competencia}</span>}
                  </span>
                  <span className="text-muted-foreground block truncate text-xs">
                    {clienteId ? '' : `${o.cliente} · `}legal {ddmm(o.legal)} · interno {ddmm(o.interno)}
                    {dias !== undefined && dias >= 0 && dias <= 7 ? ` · em ${dias} ${dias === 1 ? 'dia' : 'dias'}` : ''}
                    {o.falta ? ` · falta ${o.falta}` : ''}
                  </span>
                </span>
                <SeloStatusObrigacao status={o.status} />
              </button>
            </li>
          )
        })}
      </ul>
      <p className="text-muted-foreground mt-auto text-xs">
        {abertas.length > limite ? `mais ${abertas.length - limite} abertas · ` : ''}
        {entregues} {entregues === 1 ? 'entregue' : 'entregues'} com recibo
      </p>
    </div>
  )
}

import { CheckIcon, PaperPlaneTiltIcon, TrayIcon } from '@phosphor-icons/react'
import { useMemo } from 'react'
import { useFluxos } from '@/ambiente/fluxos'
import { useLoja } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import { EstadoVazio } from '@/components/kit/estados'
import { Button } from '@/components/ui/button'
import type { Tarefa } from '@/dados/tipos'
import { cn } from '@/lib/utils'

/**
 * Pendências por cliente (CTB-201; 03, 4.1; S01-A48 e A49): o que o cliente
 * deve, saído das tarefas `aguardando_cliente` dos setores da pessoa. Cobrar
 * abre a gaveta com o texto da régua e o canal (irreversível: vai ao cliente
 * pela conversa do setor); marcar recebida baixa o item e a tarefa volta a andar.
 * Usado no widget da Visão geral e no destino "Pendências" do celular.
 */

export interface GrupoPendencia {
  cliente: string
  itens: Tarefa[]
  /** Maior espera entre os itens. */
  dias: number
}

export function usePendenciasPorCliente(clienteNome?: string): GrupoPendencia[] {
  const loja = useLoja()
  const { usuario, permissoes } = useSessao()
  return useMemo(() => {
    const meus = (t: Tarefa) => usuario.papel === 'administrador' || permissoes.setores.includes(t.setor)
    const abertas = loja.tarefas.filter((t) => t.status === 'aguardando_cliente' && meus(t) && t.cliente && (!clienteNome || t.cliente === clienteNome))
    const porCliente = new Map<string, Tarefa[]>()
    for (const t of abertas) porCliente.set(t.cliente, [...(porCliente.get(t.cliente) ?? []), t])
    return [...porCliente.entries()].map(([cliente, itens]) => ({ cliente, itens, dias: Math.max(...itens.map((i) => i.diasAguardando ?? 0)) })).sort((a, b) => b.dias - a.dias)
  }, [loja.tarefas, usuario.papel, permissoes.setores, clienteNome])
}

const cobrancasDe = (loja: ReturnType<typeof useLoja>, t: Tarefa) => loja.estado.eventos.filter((e) => e.texto.startsWith('Cobrou') && e.texto.includes(`(${t.cliente})`)).length

export function ListaPendencias({ clienteNome, limite, className, compacta }: { clienteNome?: string; limite?: number; className?: string; compacta?: boolean }) {
  const grupos = usePendenciasPorCliente(clienteNome)
  const loja = useLoja()
  const fluxos = useFluxos()
  const { usuario } = useSessao()
  const visiveis = limite ? grupos.slice(0, limite) : grupos

  if (!grupos.length)
    return <EstadoVazio compacto icone={TrayIcon} titulo="Nenhum cliente deve documento" descricao={clienteNome ? `${clienteNome} está em dia com o que pedimos.` : 'Quando uma tarefa esperar o cliente, ela aparece aqui.'} className={className} />

  const receber = (t: Tarefa) => {
    loja.atualizarTarefa(t.id, { status: 'em_andamento' })
    loja.registrar(usuario.nome, `Marcou como recebido: ${t.titulo} (${t.cliente})`)
    loja.toastDesfazer(`${t.titulo}: recebido. A tarefa voltou a andar.`, () => loja.atualizarTarefa(t.id, { status: 'aguardando_cliente' }))
  }

  return (
    <ul className={cn('flex flex-col', className)}>
      {visiveis.map((g) => (
        <li key={g.cliente} className="flex flex-col gap-1.5 border-b py-3 last:border-0">
          <div className="flex items-baseline justify-between gap-2">
            <span className="truncate text-sm font-medium">{g.cliente}</span>
            <span className={cn('shrink-0 text-xs', g.dias >= 5 ? 'text-warning-text font-medium' : 'text-muted-foreground')}>{g.dias ? `há ${g.dias} ${g.dias === 1 ? 'dia' : 'dias'}` : 'hoje'}</span>
          </div>
          <ul className="flex flex-col gap-1">
            {g.itens.map((t) => {
              const cobrancas = cobrancasDe(loja, t)
              return (
                <li key={t.id} className="flex items-center gap-2">
                  <button type="button" onClick={() => fluxos.abrirTarefa(t.id)} className="text-muted-foreground hover:text-foreground min-w-0 flex-1 cursor-pointer truncate text-left text-xs underline-offset-2 hover:underline">
                    {t.codigo} · {t.titulo}
                    {cobrancas > 0 && ` · ${cobrancas} ${cobrancas === 1 ? 'cobrança' : 'cobranças'}`}
                  </button>
                  {!compacta && (
                    <Button size="sm" variant="ghost" className="h-7 rounded-full px-2" onClick={() => receber(t)} aria-label={`Marcar recebida: ${t.titulo}`}>
                      <CheckIcon /> Recebida
                    </Button>
                  )}
                </li>
              )
            })}
          </ul>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="rounded-full" onClick={() => fluxos.cobrar({ cliente: g.cliente, setor: g.itens[0].setor, texto: '', assunto: g.itens.map((t) => t.titulo.toLowerCase()).join(', '), tarefa: g.itens[0].id })}>
              <PaperPlaneTiltIcon /> Cobrar
            </Button>
            {compacta && (
              <Button size="sm" variant="ghost" className="rounded-full" onClick={() => g.itens.forEach(receber)}>
                <CheckIcon /> Marcar recebida
              </Button>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}

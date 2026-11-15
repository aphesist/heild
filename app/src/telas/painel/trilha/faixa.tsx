import { ArrowRightIcon, ArrowsClockwiseIcon, FlowArrowIcon, LockSimpleIcon, WarningOctagonIcon } from '@phosphor-icons/react'
import { useMemo, useState } from 'react'
import { useFluxos } from '@/ambiente/fluxos'
import { useLoja, useNavegacao } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import { useAcao, useConfirmar } from '@/components/kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { DefWidget } from '@/components/widgets/tipos'
import type { Cliente } from '@/dados/tipos'
import { cn } from '@/lib/utils'
import type { Cliente as ClienteE, EstadoCiclo } from '@/nucleo/modelo/entidades'
import { repos } from '@/nucleo/repositorios'
import { useTabela } from '@/nucleo/react'
import { comoIntegrante, criarTarefa, diaMes, HOJE_ISO, useTarefasE } from '@/telas/tarefas/modelo'
import type { CtxAba } from '../tipos'
import { pedirMudanca } from './index'
import { bloqueiosDaMudanca, historicoCiclo, moldes, ordemCiclo, proximosEstados, rotuloCiclo, useTrilha } from './modelo'

/**
 * Faixa de ciclo de vida (S04-T09; contrato C6; 03, 8.1): cliente em
 * implantação, saída ou baixa (ou com evento de exceção, encerrado ou
 * inativo) ganha uma faixa acima do cabeçalho em toda aba:
 * "Em implantação (transição) · desde 3/11 · 14 de 31 passos · corte 10/2026 · ver trilha".
 * "Ver trilha" navega para `{ modulo: 'painel', aba: 'societario', trilha: clienteId }`.
 */

const comFaixa: EstadoCiclo[] = ['em_implantacao', 'em_saida', 'em_baixa', 'inativo', 'encerrado']
const rotuloExcecao: Record<string, string> = { falecimento: 'Falecimento do titular ou sócio (CIC-006)', inapto: 'CNPJ inapto ou suspenso (FIS-030)', recuperacao: 'Falência ou recuperação judicial (CIC-008)' }

function useClienteE(id: string | undefined) {
  const t = useTabela('cliente')
  return useMemo(() => (id ? repos.clientes.obter(id) : undefined), [t, id])
}

export function FaixaCicloDeVida({ cliente, className }: { cliente: Cliente; className?: string }) {
  const nav = useNavegacao()
  const c = useClienteE(cliente.id)
  const tarefas = useTarefasE()
  const tipo = c && ['em_saida', 'em_baixa', 'encerrado'].includes(c.estado_ciclo) ? 'saida' : 'entrada'
  const trilha = useTrilha(c?.id, tipo)
  if (!c) return null
  const excecao = c.extras?.excecao as { tipo: string; desde: string } | undefined
  if (!comFaixa.includes(c.estado_ciclo) && !excecao) return null
  const filhas = trilha ? tarefas.filter((t) => t.tarefa_pai_id === trilha.raizId) : []
  const feitas = filhas.filter((t) => t.status === 'concluida').length
  const encerrado = c.estado_ciclo === 'encerrado'
  return (
    <div role="status" aria-label="Ciclo de vida do cliente" className={cn('flex flex-wrap items-center gap-x-2 gap-y-1 rounded-[14px] px-3 py-2 text-sm', excecao ? 'bg-destructive/10' : encerrado ? 'bg-sunken' : 'bg-warning/10', className)}>
      {excecao ? <WarningOctagonIcon className="text-destructive size-4" /> : encerrado ? <LockSimpleIcon className="size-4" /> : <FlowArrowIcon className="text-warning size-4" />}
      {comFaixa.includes(c.estado_ciclo) && (
        <span>
          <strong className="font-medium">{rotuloCiclo[c.estado_ciclo][0].toUpperCase() + rotuloCiclo[c.estado_ciclo].slice(1)}</strong>
          {trilha ? ` (${moldes[trilha.molde].nome.split(' (')[0]})` : ''} · desde {diaMes(c.estado_ciclo_desde)}
          {encerrado ? ` · só leitura, retenção até ${Number(c.estado_ciclo_desde.slice(0, 4)) + 5}` : ''}
          {trilha && !encerrado ? ` · ${feitas} de ${filhas.length} passos · corte ${trilha.saida?.corte ?? trilha.corte}` : ''}
        </span>
      )}
      {excecao && <span className="font-medium">{rotuloExcecao[excecao.tipo] ?? excecao.tipo} · desde {diaMes(excecao.desde)}</span>}
      {(trilha || ['em_implantacao', 'em_saida', 'em_baixa'].includes(c.estado_ciclo)) && (
        <Button size="sm" variant="ghost" className="ml-auto h-7 rounded-full" onClick={() => nav.irPara({ modulo: 'painel', aba: 'societario', trilha: c.id })}>
          Ver trilha <ArrowRightIcon />
        </Button>
      )}
    </div>
  )
}

/**
 * Painel do ciclo de vida (S04-A87 a A90): estado e histórico por serviço
 * (contábil e BPO têm ciclos separados), mudar estado (cartão do Gestor com
 * os bloqueios), reativar ex-cliente com trilha de reentrada e registrar
 * evento de exceção, que vira faixa e tarefa.
 */
export function CicloDeVida({ clienteId, compacto }: { clienteId: string; compacto?: boolean }) {
  const loja = useLoja()
  const fluxos = useFluxos()
  const executar = useAcao()
  const confirmar = useConfirmar()
  const { usuario, permissoes } = useSessao()
  const c = useClienteE(clienteId)
  const tarefas = useTarefasE()
  const tEvento = useTabela('evento')
  const tCartao = useTabela('cartao_aprovacao')
  const [servico, setServico] = useState<'contabil' | 'bpo'>('contabil')
  const historico = useMemo(() => (c ? historicoCiclo(c.id).slice(0, 6) : []), [tEvento, c])
  const pendentes = useMemo(() => repos.cartoes.listar((x) => x.status === 'pendente' && x.extras?.acao === 'ciclo.mudar' && (x.extras?.dados as { cliente?: string })?.cliente === clienteId), [tCartao, clienteId])
  if (!c) return null
  const gere = usuario.papel === 'administrador' || permissoes.gere.length > 0
  const temBpo = c.servicos_contratados.includes('bpo')
  const atual: EstadoCiclo = servico === 'bpo' ? ((c.extras?.ciclo_bpo as EstadoCiclo) ?? c.estado_ciclo) : c.estado_ciclo
  const proximos = proximosEstados[atual] ?? []
  const pedir = async (para: EstadoCiclo) => {
    const b = bloqueiosDaMudanca(c, para, tarefas)
    if (b.length && para === 'encerrado') {
      loja.toast(`Não dá para encerrar: ${b.join('; ')}.`)
      return
    }
    const motivo = await confirmar({ titulo: `Mudar para ${rotuloCiclo[para]}?`, descricao: b.length ? `Atenção: ${b.join('; ')}. O cartão vai com o aviso.` : 'Sai um cartão para o Gestor aprovar (CIC-001).', acao: 'Criar cartão', exigirMotivo: true, rotuloMotivo: 'Motivo' })
    if (typeof motivo === 'string') executar(() => pedirMudanca(c, para, motivo, servico), { sucesso: 'Cartão criado: o Gestor aprova a mudança' })
  }
  const excecao = async (tipo: string) => {
    const ok = await confirmar({ titulo: rotuloExcecao[tipo], descricao: 'Vira faixa em todas as abas do cliente e uma tarefa para o Societário.', acao: 'Registrar' })
    if (!ok) return
    executar(
      () =>
        comoIntegrante('Societário', () => {
          repos.clientes.atualizar(c.id, { extras: { ...c.extras, excecao: { tipo, desde: HOJE_ISO } } }, { ferramenta: 'cliente.atualizar', texto: `evento de exceção em ${c.nome}: ${rotuloExcecao[tipo]}` })
          return criarTarefa({ atividade_id: tipo === 'falecimento' ? 'CIC-006' : tipo === 'inapto' ? 'FIS-030' : 'CIC-008', titulo: rotuloExcecao[tipo], setor_id: tipo === 'inapto' ? 'fiscal' : 'societario', cliente_id: c.id, origem: 'integrante', prazo_interno: HOJE_ISO, extras: { critica: true } })
        }),
      { sucesso: 'Exceção registrada: faixa e tarefa criadas' },
    )
  }
  return (
    <div className="flex h-full flex-col gap-2">
      {temBpo && (
        <div role="tablist" aria-label="Serviço" className="bg-sunken/70 flex w-fit rounded-full p-0.5">
          {(['contabil', 'bpo'] as const).map((s) => (
            <button key={s} role="tab" aria-selected={servico === s} type="button" onClick={() => setServico(s)} className={cn('h-7 cursor-pointer rounded-full px-3 text-xs', servico === s ? 'bg-background font-medium shadow-xs' : 'text-muted-foreground')}>
              {s === 'contabil' ? 'Contábil' : 'BPO'}
            </button>
          ))}
        </div>
      )}
      <ol className="flex flex-wrap items-center gap-1 text-xs" aria-label="Estados do ciclo">
        {ordemCiclo.map((e) => (
          <li key={e} className={cn('rounded-full px-2 py-0.5', e === atual ? 'bg-foreground text-background font-medium' : 'bg-sunken text-muted-foreground')} aria-current={e === atual ? 'step' : undefined}>
            {rotuloCiclo[e]}
          </li>
        ))}
      </ol>
      <p className="text-sm">
        {rotuloCiclo[atual]} desde {diaMes(servico === 'bpo' ? ((c.extras?.ciclo_bpo_desde as string) ?? c.estado_ciclo_desde) : c.estado_ciclo_desde)}
        {pendentes.length > 0 && (
          <Badge variant="destaque" className="ml-2">
            mudança aguardando aprovação
          </Badge>
        )}
      </p>
      {gere ? (
        <div className="flex flex-wrap gap-1.5">
          {proximos.map((p) => (
            <Button key={p} size="sm" variant="outline" className="h-7 rounded-full" onClick={() => pedir(p)} disabled={pendentes.length > 0}>
              {atual === 'encerrado' || atual === 'inativo' ? (p === 'em_implantacao' || p === 'ativo' ? <ArrowsClockwiseIcon /> : null) : null}
              {(atual === 'encerrado' || atual === 'inativo') && (p === 'em_implantacao' || p === 'ativo') ? 'Reativar' : rotuloCiclo[p]}
            </Button>
          ))}
          {['em_implantacao', 'em_saida', 'em_baixa'].includes(atual) && (
            <Button size="sm" variant="ghost" className="h-7 rounded-full" onClick={() => fluxos.abrirTrilha(c.id)}>
              Ver trilha <ArrowRightIcon />
            </Button>
          )}
        </div>
      ) : (
        <p className="text-muted-foreground text-xs">Mudar o estado é do Gestor; você vê.</p>
      )}
      {!compacto && (
        <>
          {gere && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-muted-foreground">Evento de exceção:</span>
              {Object.keys(rotuloExcecao).map((k) => (
                <button key={k} type="button" className="hover:bg-accent cursor-pointer rounded-full border px-2 py-0.5" onClick={() => excecao(k)}>
                  {k === 'falecimento' ? 'falecimento' : k === 'inapto' ? 'inapto ou suspenso' : 'falência ou recuperação'}
                </button>
              ))}
            </div>
          )}
          <ol className="text-muted-foreground flex flex-col gap-0.5 text-xs">
            {historico.map((e) => (
              <li key={e.id}>
                {diaMes(e.criado_em.slice(0, 10))} · {e.ator_nome}: {e.texto}
              </li>
            ))}
            {!historico.length && <li>Sem mudanças de estado registradas nesta demonstração.</li>}
          </ol>
        </>
      )}
    </div>
  )
}

/** Widget do ciclo de vida para qualquer aba com cliente (S02 e S03 podem pôr no catálogo). */
export function widgetCicloDeVida(ctx: CtxAba): DefWidget | null {
  if (!ctx.cliente) return null
  const id = ctx.cliente.id
  return {
    id: 'ciclo-s04',
    titulo: 'Ciclo de vida',
    descricao: 'Estado do cliente por serviço, histórico, mudar estado e trilha',
    icone: FlowArrowIcon,
    tamanhos: ['M', 'G', 'L'],
    conteudo: (t) => <CicloDeVida clienteId={id} compacto={t === 'M'} />,
  }
}

export type { ClienteE }

import { useMemo, useState } from 'react'
import { ArchiveIcon, CheckIcon, LockSimpleIcon, RobotIcon, TimerIcon } from '@phosphor-icons/react'
import { useEfeitosCartao } from '@/ambiente/efeitos'
import { useFluxos } from '@/ambiente/fluxos'
import { useLoja } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CampoTexto, GavetaFormulario } from '@/components/ui/formulario'
import { Tooltip } from '@/components/ui/tooltip'
import { ddmm, diasEntre, HOJE_DEMO } from '@/dados/obrigacoes-setor'
import { cn } from '@/lib/utils'
import type { Cliente, EstadoCiclo, Evento } from '@/nucleo/modelo/entidades'
import { rotuloSetorCurto } from '@/nucleo/permissoes/setores'
import { useRegistro, useTabela } from '@/nucleo/react'
import { repos } from '@/nucleo/repositorios'
import type { SetorIntegrante } from '@/theme/tipos'

/**
 * Peças da anatomia comum das abas do Painel (03, 5; S02-T01) que leem o banco:
 * estado do ciclo de vida (faixa e só leitura), "trabalhando em" no cabeçalho,
 * histórico real do perfil, cartões do integrante no topo das ações e o
 * "feito por" que liga o item ao evento.
 */

export const rotuloEstado: Record<EstadoCiclo, string> = {
  prospect: 'prospect',
  proposta: 'em proposta',
  aceito: 'aceito',
  em_implantacao: 'em implantação',
  ativo: 'ativo',
  inativo: 'inativo',
  em_saida: 'em saída',
  em_baixa: 'em baixa',
  encerrado: 'encerrado',
  arquivado: 'arquivado',
  eliminado: 'eliminado',
}

/** Estados que deixam a aba só leitura (03, 8.1). */
export const soLeitura = (e?: EstadoCiclo) => !!e && ['inativo', 'encerrado', 'arquivado', 'eliminado'].includes(e)
/** Estados em que só ficha, pessoas e contrato aparecem (03, 6.1). */
export const preContrato = (e?: EstadoCiclo) => e === 'prospect' || e === 'proposta'

export function useClienteEntidade(clienteId?: string): Cliente | undefined {
  return useRegistro('cliente', clienteId)
}

/**
 * Faixa do estado que não é "ativo" e que a faixa de ciclo de vida (C6, S04)
 * não cobre: proposta, inativo, encerrado, em baixa. Com data e retenção.
 */
export function FaixaEstado({ cliente }: { cliente?: Cliente }) {
  if (!cliente) return null
  const e = cliente.estado_ciclo
  if (!preContrato(e) && !soLeitura(e) && e !== 'em_baixa' && e !== 'aceito') return null
  const desde = ddmm(cliente.estado_ciclo_desde)
  const retencao = Number((cliente.estado_ciclo_desde ?? HOJE_DEMO).slice(0, 4)) + 5
  const texto = preContrato(e)
    ? `Cliente ${rotuloEstado[e]} desde ${desde}: por enquanto só ficha, pessoas e contrato (as outras abas abrem no aceite).`
    : e === 'aceito'
      ? `Contrato aceito em ${desde}: a trilha de implantação começa quando o Gestor mudar para "em implantação".`
      : e === 'em_baixa'
        ? `Em baixa desde ${desde}: só as obrigações remanescentes seguem; o resto fica só para leitura.`
        : `Cliente ${rotuloEstado[e]} em ${desde}; retenção dos documentos até ${retencao}. A aba fica só para leitura.`
  return (
    <div role="status" className={cn('flex items-center gap-2 rounded-[14px] px-3 py-2 text-sm', soLeitura(e) ? 'bg-sunken' : 'bg-warning/10')}>
      {soLeitura(e) ? <LockSimpleIcon className="text-muted-foreground size-4 shrink-0" /> : <ArchiveIcon className="text-warning size-4 shrink-0" />}
      {texto}
    </div>
  )
}

/**
 * "Trabalhando em: FIS-019 · 1h40" (03, 5 A): a tarefa em andamento da pessoa
 * neste setor e cliente, com concluir.
 */
export function TrabalhandoEm({ setor, clienteId }: { setor: SetorIntegrante; clienteId?: string }) {
  const tarefas = useTabela('tarefa')
  const { usuario } = useSessao()
  const loja = useLoja()
  const fluxos = useFluxos()
  const t = useMemo(
    () => tarefas.find((x) => x.status === 'em_andamento' && x.setor_id === setor && (!clienteId || x.cliente_id === clienteId) && (x.responsavel_id === usuario.id || x.extras?.responsavel_nome === usuario.nome)),
    [tarefas, setor, clienteId, usuario.id, usuario.nome],
  )
  if (!t) return null
  const min = Math.max(5, Math.round((Date.now() - Date.parse(t.status_desde)) / 60000) % 600)
  const tempo = min >= 60 ? `${Math.floor(min / 60)}h${String(min % 60).padStart(2, '0')}` : `${min} min`
  return (
    <div className="bg-surface shadow-contorno flex w-fit max-w-full items-center gap-2 rounded-full py-1 pr-1 pl-3 text-xs">
      <TimerIcon className="size-3.5 shrink-0" />
      <button type="button" className="min-w-0 cursor-pointer truncate text-left hover:underline" onClick={() => fluxos.abrirTarefa(t.id)}>
        trabalhando em: <strong className="font-medium">{t.atividade_id}</strong> · {t.titulo} · {tempo}
      </button>
      <Button
        size="sm"
        variant="outline"
        className="h-6 rounded-full px-2 text-xs"
        onClick={() => {
          try {
            const antes = repos.tarefas.obter(t.id)!
            repos.tarefas.mudarStatus(t.id, 'concluida')
            loja.toastDesfazer(`${t.atividade_id} concluída.`, () => repos.tarefas.reverter(antes))
          } catch (e) {
            loja.toastErro(e instanceof Error ? e.message : String(e))
          }
        }}
      >
        <CheckIcon /> concluir
      </Button>
    </div>
  )
}

/** Responsável do cliente no setor quando é diferente do padrão do setor (03, 5 A). */
export function useResponsavelDiferente(setor: SetorIntegrante, clienteId?: string): string | undefined {
  const loja = useLoja()
  const setores = useTabela('setor')
  const usuarios = useTabela('usuario')
  if (!clienteId) return undefined
  const doCliente = loja.fichaDe(clienteId)?.responsaveis[setor]
  const padraoId = setores.find((s) => s.id === setor)?.responsavel_padrao_id
  const padrao = usuarios.find((u) => u.id === padraoId)?.nome
  return doCliente && doCliente !== padrao ? doCliente : undefined
}

/** S02-A01: versões do perfil com datas e "perfil em" uma data. */
export function HistoricoPerfil({ clienteId, titulo, onFechar }: { clienteId?: string; titulo: string; onFechar: () => void }) {
  const versoes = useTabela('versao_perfil')
  const cliente = useClienteEntidade(clienteId)
  const [em, setEm] = useState(HOJE_DEMO)
  const lista = useMemo(() => versoes.filter((v) => v.cliente_id === clienteId).sort((a, b) => b.vigente_de.localeCompare(a.vigente_de) || b.criado_em.localeCompare(a.criado_em)), [versoes, clienteId])
  const naData = lista.find((v) => v.vigente_de <= em && (!v.vigente_ate || v.vigente_ate > em))
  return (
    <GavetaFormulario aberta onFechar={onFechar} titulo={`Histórico do perfil · ${titulo}`} descricao={`${cliente?.nome ?? ''}. Cada mudança cria uma versão com data de início; documentos guardam a versão com que saíram.`} acao="Fechar" onAcao={onFechar}>
      <label className="flex items-center gap-2 text-sm">
        Perfil em
        <span className="w-44">
          <CampoTexto tipo="date" valor={em} onMudar={setEm} aria-label="Data do perfil" />
        </span>
      </label>
      {naData ? (
        <p className="bg-sunken rounded-[14px] px-3 py-2 text-sm">
          Em {ddmm(em)}/{em.slice(0, 4)} valia a versão de {ddmm(naData.vigente_de)}: regime {naData.regime}, UF {naData.uf}, serviços {naData.servicos_contratados.join(', ') || 'contábil'}.
        </p>
      ) : (
        <p className="text-muted-foreground text-sm">Sem versão nessa data (antes do cadastro).</p>
      )}
      <ol className="relative flex flex-col gap-3 border-l pl-4 text-sm">
        {lista.map((v, i) => (
          <li key={v.id}>
            <span className={cn('absolute -left-[4.5px] mt-1.5 size-2 rounded-full', !v.vigente_ate ? 'bg-foreground' : 'bg-border')} />
            <span className="text-muted-foreground block text-xs">
              v{lista.length - i} · {v.vigente_ate ? `de ${ddmm(v.vigente_de)}/${v.vigente_de.slice(0, 4)} a ${ddmm(v.vigente_ate)}/${v.vigente_ate.slice(0, 4)}` : `desde ${ddmm(v.vigente_de)}/${v.vigente_de.slice(0, 4)} · vigente`} · fonte {v.fonte.replace('_', ' ')}
            </span>
            {v.motivo_versao}
            {v.extras?.corrigido_por ? <span className="text-muted-foreground block text-xs">corrigido por {String(v.extras.corrigido_por)} em {String(v.extras.corrigido_em)}</span> : null}
          </li>
        ))}
      </ol>
    </GavetaFormulario>
  )
}

/** Cartões do integrante do setor ainda pendentes, no topo das ações (03, 5 E), decidindo ali mesmo. */
export function CartoesPendentes({ setor, clienteId }: { setor: SetorIntegrante; clienteId?: string }) {
  const cartoes = useTabela('cartao_aprovacao')
  const efeitos = useEfeitosCartao()
  const { usuario } = useSessao()
  const pendentes = cartoes.filter((c) => c.status === 'pendente' && c.id.startsWith('s02-') && c.extras?.setor === setor && (!clienteId || !c.extras?.cliente_id || c.extras.cliente_id === clienteId))
  if (!pendentes.length) return null
  // Quem pode aprovar: o cartão diz (pode_aprovar); vazio = quem tem o setor (a regra fina fica na decisão).
  const decide = (c: (typeof cartoes)[number]) => !c.pode_aprovar.length || c.pode_aprovar.includes(usuario.id)
  return (
    <ul className="flex flex-col gap-1.5">
      {pendentes.slice(0, 3).map((c) => (
        <li key={c.id} className="bg-sunken flex flex-wrap items-center gap-2 rounded-[14px] px-3 py-2 text-sm">
          <RobotIcon className="text-muted-foreground size-4 shrink-0" />
          <span className="min-w-0 flex-1">
            <span className="block truncate">{c.resumo_humano}</span>
            <span className="text-muted-foreground block text-[11px]">preparado pelo {rotuloSetorCurto[setor]} · aguardando aprovação</span>
          </span>
          {decide(c) && (
            <span className="flex gap-1">
              <Button size="sm" className="h-7 rounded-full" onClick={() => efeitos(c.id, 'aprovar')}>
                Aprovar
              </Button>
              <Button size="sm" variant="ghost" className="h-7 rounded-full" onClick={() => efeitos(c.id, 'recusar')}>
                Recusar
              </Button>
            </span>
          )}
        </li>
      ))}
      {pendentes.length > 3 && <li className="text-muted-foreground text-xs">e mais {pendentes.length - 3} no chat do integrante</li>}
    </ul>
  )
}

/** S02-A18: "feito por Fiscal, de Fernanda" com o evento do item que o integrante criou ou tocou. */
export function FeitoPor({ refId, className }: { refId: string; className?: string }) {
  const eventos = useTabela('evento')
  const [aberto, setAberto] = useState<Evento | null>(null)
  const ev = useMemo(() => [...eventos].reverse().find((e) => e.resultado_ref === refId && e.ator_tipo === 'integrante'), [eventos, refId])
  if (!ev) return null
  return (
    <>
      <Tooltip conteudo="Ver o evento: quem fez, quando e com qual ferramenta">
        <button type="button" onClick={() => setAberto(ev)} className={cn('text-muted-foreground hover:text-foreground inline-flex cursor-pointer items-center gap-1 text-[11px] underline-offset-2 hover:underline', className)}>
          <RobotIcon className="size-3" /> feito por {ev.ator_nome ?? 'integrante'}
        </button>
      </Tooltip>
      {aberto && <GavetaEvento evento={aberto} onFechar={() => setAberto(null)} />}
    </>
  )
}

export function GavetaEvento({ evento, onFechar }: { evento: Evento; onFechar: () => void }) {
  const usuarios = useTabela('usuario')
  const dono = usuarios.find((u) => u.id === evento.usuario_dono_id)?.nome
  return (
    <GavetaFormulario aberta onFechar={onFechar} titulo="Evento" descricao="O registro de eventos é imutável: correção é um evento novo." acao="Fechar" onAcao={onFechar}>
      <dl className="grid grid-cols-[8rem_minmax(0,1fr)] gap-x-3 gap-y-2 text-sm">
        <dt className="text-muted-foreground">O que</dt>
        <dd>{evento.texto}</dd>
        <dt className="text-muted-foreground">Quem</dt>
        <dd>
          {evento.ator_nome} {evento.ator_tipo === 'integrante' && <Badge variant="outline">integrante{dono ? ` de ${dono}` : ''}</Badge>}
        </dd>
        <dt className="text-muted-foreground">Quando</dt>
        <dd>{new Date(evento.criado_em).toLocaleString('pt-BR')}</dd>
        <dt className="text-muted-foreground">Ferramenta</dt>
        <dd>
          <code className="text-xs">{evento.ferramenta}</code> · {evento.nivel}
        </dd>
        <dt className="text-muted-foreground">Resultado</dt>
        <dd>{evento.resultado}</dd>
      </dl>
    </GavetaFormulario>
  )
}

/** Dias desde uma data ISO até o "hoje" da demonstração. */
export const diasDesde = (iso: string) => diasEntre(iso.slice(0, 10), HOJE_DEMO)


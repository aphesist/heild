import { ArrowSquareOutIcon, CheckCircleIcon, CircleDashedIcon, CircleHalfIcon, DownloadSimpleIcon, EnvelopeSimpleIcon, EyeIcon, FileArchiveIcon, LockSimpleIcon, PaperPlaneTiltIcon, SparkleIcon, WarningIcon } from '@phosphor-icons/react'
import { useMemo, useState, type ReactNode } from 'react'
import { useFluxos } from '@/ambiente/fluxos'
import { useLoja, useNavegacao } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import { EstadoVazio, SeloDemonstracao, useAcao, useConfirmar } from '@/components/kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { atividade } from '@/dados/atividades-s04'
import { cn } from '@/lib/utils'
import type { Cliente as ClienteE, EstadoCiclo } from '@/nucleo/modelo/entidades'
import { ErroRegra } from '@/nucleo/permissoes/autorizar'
import { repos } from '@/nucleo/repositorios'
import { criarCartaoS04, registrarEfeitoS04 } from '@/telas/tarefas/cartoes'
import { ListaTarefas } from '@/telas/tarefas/ListaTarefas'
import { checklistDe, comoIntegrante, criarTarefa, diaMes, diasEntre, HOJE_ISO, useClientesE, useTarefasE, type TarefaE } from '@/telas/tarefas/modelo'
import { Entrada, GavetaLarga, Secao } from '@/telas/tarefas/pecas'
import { bloqueio, bloqueiosDaMudanca, gerarTrilha, gravarTrilha, lerTrilha, moldes, moldeSugerido, mudarEstado, nomeSetor, rotuloCiclo, useTrilha, type EstadoTrilha, type IdMolde } from './modelo'
import { AreaRolagem } from '@/components/ui/area-rolagem'

/**
 * Trilha de implantação (S04-T07) e de saída e baixa (S04-T08), por cima do
 * Painel (contrato C6: `?trilha=<cliente>`). A trilha é o conjunto de
 * tarefas da raiz; esta tela junta marcos, o que o cliente e o contador
 * anterior precisam enviar, tarefas por setor, custo e gargalo (03, 8.2), e
 * na saída as remanescentes, o dossiê e as revogações (03, 8.3).
 */
export function GavetaTrilha({ clienteId, onFechar }: { clienteId: string; onFechar: () => void }) {
  const clientes = useClientesE()
  const c = clientes.find((x) => x.id === clienteId)
  const entrada = useTrilha(clienteId, 'entrada')
  const saida = useTrilha(clienteId, 'saida')
  const emSaida = c && ['em_saida', 'em_baixa', 'encerrado', 'inativo'].includes(c.estado_ciclo)
  const [aba, setAba] = useState<'entrada' | 'saida'>(emSaida || (saida && !entrada) ? 'saida' : 'entrada')
  if (!c) return null
  return (
    <GavetaLarga
      largura="5xl"
      onFechar={onFechar}
      titulo={`${aba === 'entrada' ? 'Implantação' : 'Saída'} · ${c.nome}`}
      descricao={
        <span className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{rotuloCiclo[c.estado_ciclo]}</Badge>
          <span>desde {diaMes(c.estado_ciclo_desde)}</span>
          {(entrada || saida) && (
            <span role="tablist" aria-label="Trilha" className="bg-sunken/70 ml-auto flex rounded-full p-0.5">
              {(['entrada', 'saida'] as const).map((x) => (
                <button key={x} role="tab" aria-selected={aba === x} type="button" onClick={() => setAba(x)} className={cn('h-7 cursor-pointer rounded-full px-3 text-xs', aba === x ? 'bg-background font-medium shadow-xs' : 'text-muted-foreground')}>
                  {x === 'entrada' ? 'Entrada' : 'Saída'}
                </button>
              ))}
            </span>
          )}
        </span>
      }
    >
      {aba === 'entrada' ? <TrilhaEntrada c={c} estado={entrada} /> : <TrilhaSaida c={c} estado={saida} />}
    </GavetaLarga>
  )
}

/* ---------- Gerar ---------- */

function GerarTrilha({ c, tipo }: { c: ClienteE; tipo: 'entrada' | 'saida' }) {
  const loja = useLoja()
  const { usuario, permissoes } = useSessao()
  const executar = useAcao()
  const [molde, setMolde] = useState<IdMolde>(moldeSugerido(c, tipo))
  const [gerando, setGerando] = useState(false)
  const [motivo, setMotivo] = useState('troca de contador')
  const [data, setData] = useState('2026-12-18')
  const [corte, setCorte] = useState('11/2026')
  const [aviso, setAviso] = useState('30 dias')
  const gere = usuario.papel === 'administrador' || permissoes.gere.length > 0
  const opcoes = (Object.values(moldes) as (typeof moldes)[IdMolde][]).filter((m) => m.tipo === tipo)
  const gerar = () => {
    setGerando(true)
    window.setTimeout(() => {
      const r = executar(() => {
        const raiz = gerarTrilha(c, molde, { responsavel: usuario.nome, ...(tipo === 'saida' ? { saida: { motivo, data, corte, aviso } } : {}) })
        if (tipo === 'saida') mudarEstado(c, molde === 'baixa' ? 'em_baixa' : 'em_saida', motivo)
        return raiz
      })
      setGerando(false)
      if (r) loja.toast(`Societário gerou a trilha ${moldes[molde].nome} de ${c.nome}: ${moldes[molde].marcos.length} marcos, cada um na aba do seu setor.`, undefined, undefined, { tipo: 'integrante', setor: 'societario', estado: 'concluido' })
    }, 1600)
  }
  if (tipo === 'saida' && !gere) return <EstadoVazio titulo="Sem trilha de saída." descricao="Iniciar a saída é do Gestor (CIC-003)." />
  return (
    <div className="flex flex-col gap-3">
      <EstadoVazio
        icone={SparkleIcon}
        titulo={tipo === 'entrada' ? 'A trilha de implantação ainda não foi gerada' : 'Iniciar a saída'}
        descricao={tipo === 'entrada' ? 'O integrante Societário gera a raiz e as tarefas de cada setor a partir do molde (CIC-001). Nasce sozinha ao fechar o contrato no CRM ou ao mudar o cliente para em implantação.' : 'Motivo e datas; o integrante Societário gera a trilha de saída e as obrigações remanescentes até o corte.'}
      />
      <div className="bg-raised mx-auto grid w-full max-w-xl gap-3 rounded-lg p-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          Molde
          <select aria-label="Molde" className="bg-popover h-9 rounded-md border px-2" value={molde} onChange={(e) => setMolde(e.target.value as IdMolde)}>
            {opcoes.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nome} · {m.marcos.length} marcos{m.id === moldeSugerido(c, tipo) ? ' (sugerido)' : ''}
              </option>
            ))}
          </select>
        </label>
        {tipo === 'saida' && (
          <>
            <label className="flex flex-col gap-1 text-sm sm:col-span-2">
              Motivo
              <Entrada value={motivo} onChange={(e) => setMotivo(e.target.value)} />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Data efetiva
              <Entrada type="date" value={data} onChange={(e) => setData(e.target.value)} />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Competência de corte
              <Entrada value={corte} onChange={(e) => setCorte(e.target.value)} />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Aviso prévio
              <Entrada value={aviso} onChange={(e) => setAviso(e.target.value)} />
            </label>
          </>
        )}
        <Button className="rounded-full sm:col-span-2" onClick={gerar} disabled={gerando}>
          {gerando ? (
            <>
              <SparkleIcon className="animate-pulse" /> Societário gerando a trilha…
            </>
          ) : tipo === 'entrada' ? (
            'Gerar trilha'
          ) : (
            'Iniciar saída'
          )}
        </Button>
      </div>
    </div>
  )
}

/* ---------- Marcos ---------- */

function Marcos({ filhas }: { filhas: TarefaE[] }) {
  const fluxos = useFluxos()
  const executar = useAcao()
  return (
    <div className="flex flex-wrap gap-1.5" role="list" aria-label="Marcos">
      {filhas.map((t) => {
        const falta = bloqueio(t, filhas)
        const estado = t.status === 'concluida' ? 'feito' : falta.length ? 'bloqueado' : t.status === 'a_fazer' ? 'a fazer' : 'em andamento'
        const I = estado === 'feito' ? CheckCircleIcon : estado === 'bloqueado' ? LockSimpleIcon : estado === 'a fazer' ? CircleDashedIcon : CircleHalfIcon
        return (
          <div key={t.id} role="listitem" className={cn('flex items-center gap-1 rounded-full border py-0.5 pr-1 pl-2 text-xs', estado === 'feito' && 'bg-success/10 border-transparent', estado === 'bloqueado' && 'text-muted-foreground border-dashed')}>
            <button type="button" onClick={() => fluxos.abrirTarefa(t.id)} className="flex cursor-pointer items-center gap-1" title={falta.length ? `depende de ${falta.join(', ')}` : estado}>
              <I className={cn('size-3.5', estado === 'feito' && 'text-success-text')} weight={estado === 'feito' ? 'fill' : 'regular'} />
              {t.titulo}
              <span className="sr-only">: {estado}</span>
              {falta.length > 0 && <span className="text-xs">· depende de {falta.join(', ')}</span>}
            </button>
            {estado !== 'feito' && estado !== 'bloqueado' && (
              <button type="button" className="hover:bg-accent cursor-pointer rounded-full px-1.5 py-0.5 text-xs underline" onClick={() => executar(() => concluirMarco(t, filhas), { sucesso: `${String(t.extras?.marco)} concluído: os dependentes foram liberados` })}>
                concluir
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}

/** Concluir marco libera os dependentes (S04-A77). */
function concluirMarco(t: TarefaE, irmas: TarefaE[]) {
  const falta = bloqueio(t, irmas)
  if (falta.length) throw new ErroRegra(`Bloqueado: depende de ${falta.join(', ')}.`)
  repos.tarefas.atualizar(t.id, { checklist: checklistDe(t).map((i) => ({ ...i, feito: true, feito_em: new Date().toISOString() })), extras: { ...t.extras, resultado: 'marco concluído na trilha' } }, { ferramenta: 'tarefa.checklist_marcar', texto: '' })
  return repos.tarefas.mudarStatus(t.id, 'concluida', { texto: `concluiu o marco ${t.titulo}` })
}

function PorSetor({ filhas }: { filhas: TarefaE[] }) {
  const setores = Array.from(new Set(filhas.map((t) => t.setor_id)))
  return (
    <p className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
      {setores.map((s) => {
        const d = filhas.filter((t) => t.setor_id === s)
        return (
          <span key={s}>
            {nomeSetor(s)} <span className="tabular-nums">{d.filter((t) => t.status === 'concluida').length}/{d.length}</span>
          </span>
        )
      })}
    </p>
  )
}

/* ---------- Entrada ---------- */

function TrilhaEntrada({ c, estado }: { c: ClienteE; estado?: EstadoTrilha }) {
  const loja = useLoja()
  const fluxos = useFluxos()
  const nav = useNavegacao()
  const executar = useAcao()
  const { usuario, permissoes } = useSessao()
  const tarefas = useTarefasE()
  const [previa, setPrevia] = useState(false)
  const raiz = estado ? tarefas.find((t) => t.id === estado.raizId) : undefined
  const filhas = useMemo(() => (raiz ? tarefas.filter((t) => t.tarefa_pai_id === raiz.id).sort((a, b) => String(a.extras?.marco).localeCompare(String(b.extras?.marco), 'pt', { numeric: true })) : []), [tarefas, raiz])
  if (!estado || !raiz) return <GerarTrilha c={c} tipo="entrada" />
  const m = moldes[estado.molde]
  const feitas = filhas.filter((t) => t.status === 'concluida').length
  const gere = usuario.papel === 'administrador' || permissoes.gere.length > 0
  const atualizar = (p: Partial<EstadoTrilha>) => gravarTrilha(c.id, 'entrada', { ...estado, ...p })
  const horasFeitas = filhas.filter((t) => t.status === 'concluida').reduce((s, t) => s + Math.max(0.5, (atividade(t.atividade_id)?.horas ?? 2) / 4), 0)
  const agente = filhas.filter((t) => t.status === 'concluida' && t.responsavel_tipo === 'integrante').length * 0.2
  const gargalos = filhas.filter((t) => ['SOC-011', 'SOC-014'].includes(t.atividade_id) && t.status !== 'concluida')
  const a1Recebido = estado.cliente.some((i) => /A1/.test(i.item) && i.recebido_em)
  const marcarRecebido = (i: number) => {
    const item = estado.cliente[i]
    atualizar({ cliente: estado.cliente.map((x, k) => (k === i ? { ...x, recebido_em: HOJE_ISO } : x)), ...(/A1/.test(item.item) ? { capturaXml: 1240 } : {}) })
    loja.toast(`Recebido: ${item.item}. O Societário está validando (GES-405)…`, undefined, undefined, { tipo: 'integrante', setor: 'societario', estado: 'trabalhando' })
    window.setTimeout(() => loja.toast(`${item.item} validado e guardado na pasta de ${c.nome}.${/A1/.test(item.item) ? ' A janela de 90 dias de notas começou: captura retroativa de 1.240 XMLs.' : ''}`, undefined, undefined, { tipo: 'integrante', setor: 'societario', estado: 'concluido' }), 1800)
  }
  const pendentesCliente = estado.cliente.filter((i) => !i.recebido_em)
  return (
    <>
      <div className="flex flex-col gap-2">
        <p className="text-sm">
          Molde <strong className="font-medium">{m.nome}</strong> · responsável {estado.responsavel} · corte {estado.corte} · desde {diaMes(estado.desde)} ·{' '}
          <span className="tabular-nums">
            {feitas} de {filhas.length} passos
          </span>
        </p>
        <div className="bg-sunken h-1.5 overflow-hidden rounded-full" role="progressbar" aria-valuenow={feitas} aria-valuemax={filhas.length} aria-label="Progresso da trilha">
          <div className="bg-foreground/70 h-full rounded-full" style={{ width: `${(feitas / Math.max(1, filhas.length)) * 100}%` }} />
        </div>
      </div>
      <Secao titulo="Marcos">
        <Marcos filhas={filhas} />
      </Secao>
      {gargalos.length > 0 && (
        <div className="bg-warning/10 flex flex-col gap-1 rounded-md px-3 py-2 text-sm">
          <span className="flex items-center gap-1.5 font-medium">
            <WarningIcon className="text-warning size-4" /> Gargalo humano
          </span>
          {gargalos.map((t) => (
            <span key={t.id}>
              {t.atividade_id} ({t.titulo}): parado há {diasEntre(estado.desde, HOJE_ISO) + 3} dias · {estado.cliente.filter((i) => i.marco === t.extras?.marco).reduce((s, i) => s + i.cobrancas, 0)} cobranças
            </span>
          ))}
        </div>
      )}
      <div className="grid gap-5 md:grid-cols-2">
        <Secao
          titulo={`O cliente precisa enviar · ${pendentesCliente.length}`}
          acao={
            <>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 rounded-full"
                disabled={!pendentesCliente.length}
                onClick={() => {
                  atualizar({ cliente: estado.cliente.map((x) => (x.recebido_em ? x : { ...x, cobrancas: x.cobrancas + 1 })) })
                  fluxos.cobrar({ cliente: c.nome, setor: 'societario', texto: '', assunto: pendentesCliente.map((i) => i.item.toLowerCase()).join(', ') })
                }}
              >
                <PaperPlaneTiltIcon /> Cobrar pelo CRM
              </Button>
              <Button size="sm" variant="ghost" className="h-7 rounded-full" aria-pressed={previa} onClick={() => setPrevia(!previa)}>
                <EyeIcon /> Ver no app
              </Button>
            </>
          }
        >
          {estado.cliente.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nada a pedir ao cliente neste molde.</p>
          ) : (
            <ul className="flex flex-col gap-1 text-sm">
              {estado.cliente.map((i, k) => (
                <li key={k} className="flex items-center gap-2">
                  <input type="checkbox" className="accent-primary size-4" aria-label={`Recebido: ${i.item}`} checked={!!i.recebido_em} disabled={!!i.recebido_em} onChange={() => marcarRecebido(k)} />
                  <span className={cn('min-w-0 flex-1', i.recebido_em && 'text-muted-foreground line-through')}>
                    {i.item} <span className="text-muted-foreground text-xs">({i.marco})</span>
                  </span>
                  <span className="text-muted-foreground shrink-0 text-xs">{i.recebido_em ? `recebido ${diaMes(i.recebido_em)}` : `pedido ${diaMes(i.pedido_em)}${i.cobrancas ? ` · ${i.cobrancas} cobr.` : ''}`}</span>
                </li>
              ))}
            </ul>
          )}
          {previa && (
            <div className="border-border mt-1 flex flex-col gap-1.5 rounded-lg border-4 p-3" aria-label="Prévia do app do cliente">
              <span className="text-muted-foreground text-xs">Prévia do app de {c.nome} · Pendências</span>
              {pendentesCliente.map((i) => (
                <span key={i.item} className="bg-raised flex items-center justify-between rounded-md px-2.5 py-2 text-sm">
                  {i.item}
                  <span className="text-primary text-xs">Enviar</span>
                </span>
              ))}
              {!pendentesCliente.length && <span className="text-sm">Tudo enviado. 🎉</span>}
            </div>
          )}
        </Secao>
        <Secao
          titulo="O contador anterior precisa enviar"
          acao={
            estado.anterior.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 rounded-full"
                onClick={() => {
                  atualizar({ anterior: estado.anterior.map((x) => (x.recebido_em ? x : { ...x, cobrancas: x.cobrancas + 1, ultima_carta: HOJE_ISO })) })
                  loja.registrar(usuario.nome, `Reenviou a carta única ao contador anterior de ${c.nome} (CIC-002)`)
                  loja.toast('Carta única reenviada ao contador anterior, com a lista do que falta.')
                }}
              >
                <EnvelopeSimpleIcon /> Reenviar carta única
              </Button>
            )
          }
        >
          {estado.anterior.length === 0 ? (
            <p className="text-muted-foreground text-sm">Sem contador anterior neste molde.</p>
          ) : (
            <ul className="flex flex-col gap-1 text-sm">
              {estado.anterior.map((i, k) => (
                <li key={k} className="flex items-center gap-2">
                  <input type="checkbox" className="accent-primary size-4" aria-label={`Recebido do contador anterior: ${i.item}`} checked={!!i.recebido_em} onChange={(e) => atualizar({ anterior: estado.anterior.map((x, j) => (j === k ? { ...x, recebido_em: e.target.checked ? HOJE_ISO : undefined } : x)) })} />
                  <span className={cn('min-w-0 flex-1', i.recebido_em && 'text-muted-foreground line-through')}>{i.item}</span>
                  <span className="text-muted-foreground shrink-0 text-xs">{i.recebido_em ? 'recebido' : `${i.cobrancas} cobr.`}</span>
                </li>
              ))}
            </ul>
          )}
        </Secao>
      </div>
      <Secao titulo="Tarefas por setor">
        <PorSetor filhas={filhas} />
        <ListaTarefas tarefas={filhas} chave={`trilha:${c.id}`} cliente={c.nome} visoes={['lista', 'responsavel']} compacta />
      </Secao>
      <div className="grid gap-5 md:grid-cols-2">
        <Secao titulo="Custo da entrada">
          <p className="text-sm">
            <span className="tabular-nums">{horasFeitas.toFixed(1)} h</span> registradas · <span className="tabular-nums">{m.horas} h</span> previstas (molde) · agente <span className="tabular-nums">{agente.toFixed(1)} h</span>
          </p>
        </Secao>
        <Secao titulo="Captura retroativa e pasta antiga">
          <p className="text-sm">{a1Recebido || estado.capturaXml ? `Janela de 90 dias: captura retroativa de ${(estado.capturaXml ?? 1240).toLocaleString('pt-BR')} XMLs.` : 'A janela de 90 dias começa quando o A1 chega (NFE-101).'}</p>
          {usuario.papel === 'administrador' && (
            <Button
              size="sm"
              variant="outline"
              className="w-fit rounded-full"
              onClick={() => {
                loja.toast(`Raio-X da pasta antiga de ${c.nome} rodando: 318 arquivos, 41 duplicados, 12 sem competência.`, { modulo: 'arquivos' }, 'Abrir Arquivos')
                loja.registrar(usuario.nome, `Rodou o Raio-X da pasta antiga de ${c.nome} (D-10)`)
              }}
            >
              <FileArchiveIcon /> Rodar o Raio-X da pasta antiga
            </Button>
          )}
        </Secao>
      </div>
      {gere && c.estado_ciclo === 'em_implantacao' && <PassarAtivo c={c} tarefas={tarefas} />}
      <Button size="sm" variant="ghost" className="w-fit rounded-full" onClick={() => nav.irPara({ modulo: 'painel', aba: 'gestao' })}>
        Editar moldes na Gestão › Processos <ArrowSquareOutIcon />
      </Button>
      <Button size="sm" variant="ghost" className="w-fit rounded-full" onClick={() => executar(() => comoIntegrante('Societário', () => criarTarefa({ atividade_id: 'GES-405', titulo: `Validar documentos recebidos de ${c.nome}`, setor_id: 'societario', cliente_id: c.id, origem: 'trilha', tarefa_pai_id: raiz.id, prazo_interno: HOJE_ISO })), { sucesso: 'Tarefa de validação criada na trilha' })}>
        + tarefa na trilha
      </Button>
    </>
  )
}

function PassarAtivo({ c, tarefas }: { c: ClienteE; tarefas: TarefaE[] }) {
  const executar = useAcao()
  const b = bloqueiosDaMudanca(c, 'ativo', tarefas)
  const pendente = repos.cartoes.listar((x) => x.status === 'pendente' && x.extras?.acao === 'ciclo.mudar' && (x.extras?.dados as { cliente?: string })?.cliente === c.id).length > 0
  return (
    <div className="bg-raised flex flex-wrap items-center gap-2 rounded-md px-3 py-2 text-sm">
      <span className="min-w-0 grow basis-40">{b.length ? `Para passar a ativo: ${b.join('; ')}.` : 'O primeiro fechamento de cada setor terminou: o cliente pode passar a ativo (GES-106).'}</span>
      <Button size="sm" className="rounded-full" disabled={pendente} onClick={() => executar(() => pedirMudanca(c, 'ativo', b.length ? `com pendência: ${b.join('; ')}` : 'implantação concluída'), { sucesso: 'Cartão criado para o Gestor aprovar' })}>
        {pendente ? 'Cartão aguardando aprovação' : 'Passar a ativo'}
      </Button>
    </div>
  )
}

/** Mudar estado é executar com aprovação do Gestor (CIC-001): sai um cartão com os bloqueios. */
export function pedirMudanca(c: ClienteE, para: EstadoCiclo, motivo: string, servico: 'contabil' | 'bpo' = 'contabil') {
  return criarCartaoS04({
    acao: 'ciclo.mudar',
    resumo: `Mudar ${c.nome}${servico === 'bpo' ? ' (BPO)' : ''} de ${rotuloCiclo[servico === 'bpo' ? ((c.extras?.ciclo_bpo as EstadoCiclo) ?? c.estado_ciclo) : c.estado_ciclo]} para ${rotuloCiclo[para]}`,
    argumentos: { Cliente: c.nome, Serviço: servico === 'bpo' ? 'BPO financeiro' : 'contábil', De: rotuloCiclo[c.estado_ciclo], Para: rotuloCiclo[para], Motivo: motivo },
    setor: 'gestao_atendimento',
    integrante: 'Atendimento',
    clienteId: c.id,
    clienteNome: c.nome,
    ferramenta: 'cliente.mudar_estado',
    dados: { cliente: c.id, para, servico, motivo },
  })
}

registrarEfeitoS04('ciclo.mudar', (cartao, ctx) => {
  const d = (cartao.extras?.dados ?? {}) as { cliente: string; para: EstadoCiclo; servico: 'contabil' | 'bpo'; motivo: string }
  const c = repos.clientes.obter(d.cliente)
  if (!c) return
  try {
    const reativar = c.estado_ciclo === 'encerrado' || c.estado_ciclo === 'inativo'
    mudarEstado(c, d.para, d.motivo, d.servico)
    if (d.para === 'em_implantacao' && !lerTrilha(c.id, 'entrada')) gerarTrilha({ ...c, estado_ciclo: d.para }, reativar ? 'reentrada' : moldeSugerido(c, 'entrada'), { responsavel: ctx.usuario.nome })
    ctx.loja.toast(`${c.nome}: ${rotuloCiclo[d.para]}${reativar && d.para === 'em_implantacao' ? '. Ficha reaberta com o histórico e a trilha de reentrada.' : '.'}`, { modulo: 'painel', aba: 'societario', cliente: c.id, trilha: c.id }, 'Ver trilha')
  } catch (e) {
    ctx.loja.toast((e as Error).message)
  }
})

registrarEfeitoS04('trilha.dossie', (cartao, ctx) => {
  const id = (cartao.extras?.dados as { cliente?: string })?.cliente
  const e = id ? lerTrilha(id, 'saida') : undefined
  if (!id || !e?.dossie) return
  gravarTrilha(id, 'saida', { ...e, dossie: { ...e.dossie, enviado_em: HOJE_ISO } })
  ctx.loja.toast(`Dossiê enviado ao sucessor${e.saida?.sucessor ? ` (${e.saida.sucessor})` : ''}, com o manifesto e o termo de entrega para assinar.`)
})

/* ---------- Saída ---------- */

function TrilhaSaida({ c, estado }: { c: ClienteE; estado?: EstadoTrilha }) {
  const loja = useLoja()
  const executar = useAcao()
  const confirmar = useConfirmar()
  const { usuario, permissoes } = useSessao()
  const tarefas = useTarefasE()
  const raiz = estado ? tarefas.find((t) => t.id === estado.raizId) : undefined
  const filhas = useMemo(() => (raiz ? tarefas.filter((t) => t.tarefa_pai_id === raiz.id).sort((a, b) => String(a.extras?.marco).localeCompare(String(b.extras?.marco), 'pt', { numeric: true })) : []), [tarefas, raiz])
  const gere = usuario.papel === 'administrador' || permissoes.gere.length > 0
  if (c.estado_ciclo === 'encerrado' && (!estado || !raiz)) return <PosDesligamento c={c} />
  if (!estado || !raiz) return <GerarTrilha c={c} tipo="saida" />
  const s = estado.saida!
  const atualizar = (p: Partial<EstadoTrilha>) => gravarTrilha(c.id, 'saida', { ...estado, ...p })
  const remanescentes = tarefas.filter((t) => t.cliente_id === c.id && !['concluida', 'cancelada'].includes(t.status) && !t.extras?.trilha_raiz)
  const bloqueios = bloqueiosDaMudanca(c, 'encerrado', tarefas)
  const gerarDossie = () => {
    const setores = ['Fiscal', 'DP', 'Contábil', 'Notas', 'Societário']
    const manifesto = setores.flatMap((st) => [1, 2].map((n) => ({ setor: st, arquivo: `${st}/${c.codigo}-${st.toLowerCase()}-${n === 1 ? 'obrigacoes' : 'documentos'}.zip`, hash: Math.random().toString(16).slice(2, 14) })))
    atualizar({ dossie: { gerado_em: HOJE_ISO, manifesto } })
    loja.registrar(usuario.nome, `Gerou o dossiê de saída de ${c.nome} (CIC-003): ${manifesto.length} pacotes com manifesto`)
    loja.toast(`Dossiê gerado: ${manifesto.length} pacotes por setor, índice com manifesto e hash, termo de entrega.`)
  }
  return (
    <>
      <dl className="bg-sunken/60 grid grid-cols-2 gap-3 rounded-md p-3 text-sm sm:grid-cols-5">
        <Dado rotulo="Molde" valor={moldes[estado.molde].nome} />
        <Dado rotulo="Motivo" valor={s.motivo} />
        <Dado rotulo="Data efetiva" valor={diaMes(s.data)} />
        <Dado rotulo="Corte" valor={s.corte} />
        <Dado rotulo="Aviso prévio" valor={s.aviso} />
      </dl>
      <Secao titulo="Marcos">
        <Marcos filhas={filhas} />
      </Secao>
      <div className="grid gap-5 md:grid-cols-2">
        <Secao titulo={`Obrigações remanescentes · ${remanescentes.length}`}>
          <p className="text-muted-foreground text-xs">Geradas do calendário até o corte. Encerrar fica bloqueado até zerar (SOC-107, FIS-108, DP-106, CTB-109).</p>
          <ul className="flex flex-col gap-0.5 text-sm">
            {remanescentes.slice(0, 8).map((t) => (
              <li key={t.id} className="truncate">
                <span className="text-muted-foreground font-mono text-xs">{t.atividade_id}</span> {t.titulo}
              </li>
            ))}
            {remanescentes.length > 8 && <li className="text-muted-foreground text-xs">e mais {remanescentes.length - 8}</li>}
          </ul>
        </Secao>
        <Secao
          titulo="Dossiê de saída"
          acao={
            <>
              <Button size="sm" variant="ghost" className="h-7 rounded-full" onClick={gerarDossie}>
                <FileArchiveIcon /> {estado.dossie ? 'Gerar de novo' : 'Gerar'}
              </Button>
              {estado.dossie && !estado.dossie.enviado_em && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 rounded-full"
                  onClick={() =>
                    executar(
                      () =>
                        criarCartaoS04({ acao: 'trilha.dossie', resumo: `Enviar o dossiê de saída de ${c.nome} ao sucessor`, argumentos: { Cliente: c.nome, Sucessor: s.sucessor ?? 'a informar pelo cliente', Pacotes: String(estado.dossie!.manifesto.length), Termo: 'de entrega, com manifesto' }, setor: 'societario', integrante: 'Societário', clienteId: c.id, clienteNome: c.nome, dados: { cliente: c.id } }),
                      { sucesso: 'Cartão criado: enviar ao sucessor é com aprovação' },
                    )
                  }
                >
                  <PaperPlaneTiltIcon /> Enviar ao sucessor
                </Button>
              )}
            </>
          }
        >
          {estado.dossie ? (
            <>
              <p className="text-xs">
                Gerado em {diaMes(estado.dossie.gerado_em)} · {estado.dossie.manifesto.length} pacotes{estado.dossie.enviado_em ? ` · enviado em ${diaMes(estado.dossie.enviado_em)}` : ''} <SeloDemonstracao fonte="armazenamento" />
              </p>
              <AreaRolagem as="ul" className="flex max-h-32 flex-col gap-0.5 text-xs">
                {estado.dossie.manifesto.map((x) => (
                  <li key={x.arquivo} className="flex gap-2">
                    <DownloadSimpleIcon className="size-3 shrink-0" /> <span className="min-w-0 flex-1 truncate">{x.arquivo}</span> <span className="text-muted-foreground font-mono">{x.hash}</span>
                  </li>
                ))}
              </AreaRolagem>
            </>
          ) : (
            <p className="text-muted-foreground text-sm">Pacotes por setor, índice com manifesto (lista e hash) e termo de entrega (CIC-003).</p>
          )}
        </Secao>
        <Secao titulo="Revogações e desligamentos">
          <ul className="flex flex-col gap-1 text-sm">
            {(estado.revogacoes ?? []).map((r, k) => (
              <li key={r.codigo} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="accent-primary size-4"
                  aria-label={r.item}
                  checked={!!r.feito_por}
                  onChange={(e) => {
                    atualizar({ revogacoes: estado.revogacoes!.map((x, j) => (j === k ? { ...x, feito_por: e.target.checked ? usuario.nome : undefined, em: e.target.checked ? HOJE_ISO : undefined } : x)) })
                    loja.registrar(usuario.nome, `${e.target.checked ? 'Marcou' : 'Desmarcou'} a revogação ${r.codigo} de ${c.nome}`)
                  }}
                />
                <span className={cn('min-w-0 flex-1', r.feito_por && 'text-muted-foreground')}>
                  <span className="font-mono text-xs">{r.codigo}</span> {r.item}
                </span>
                {r.feito_por && <span className="text-muted-foreground text-[11px]">{r.feito_por}, {diaMes(r.em)}</span>}
              </li>
            ))}
          </ul>
        </Secao>
        <Secao titulo="O cliente precisa">
          <ul className="flex flex-col gap-1 text-sm">
            {(estado.clientePrecisa ?? []).map((i, k) => (
              <li key={i.item} className="flex items-center gap-2">
                <input type="checkbox" className="accent-primary size-4" aria-label={i.item} checked={!!i.feito} onChange={(e) => atualizar({ clientePrecisa: estado.clientePrecisa!.map((x, j) => (j === k ? { ...x, feito: e.target.checked } : x)) })} />
                <span className={cn(i.feito && 'text-muted-foreground line-through')}>{i.item}</span>
              </li>
            ))}
          </ul>
          <label className="flex items-center gap-2 text-sm">
            Sucessor
            <Entrada className="h-8" placeholder="Nome do escritório sucessor" value={s.sucessor ?? ''} onChange={(e) => atualizar({ saida: { ...s, sucessor: e.target.value } })} />
          </label>
        </Secao>
      </div>
      <Secao titulo="Tarefas da saída">
        <PorSetor filhas={filhas} />
        <ListaTarefas tarefas={filhas} chave={`saida:${c.id}`} cliente={c.nome} visoes={['lista', 'responsavel']} compacta />
      </Secao>
      {gere && (
        <div className="bg-raised flex flex-wrap items-center gap-2 rounded-md px-3 py-2 text-sm">
          <span className="min-w-0 grow basis-40">{bloqueios.length ? `Encerrar bloqueado: ${bloqueios.join('; ')}.` : 'Sem remanescentes: pode encerrar. As abas ficam só leitura com a retenção.'}</span>
          <Button
            size="sm"
            variant="destructive"
            className="rounded-full"
            disabled={bloqueios.length > 0 || c.estado_ciclo === 'encerrado'}
            onClick={async () => {
              const ok = await confirmar({ titulo: `Encerrar ${c.nome}?`, descricao: 'As abas ficam só leitura, com a retenção até 2031. Depois, tarefas de atendimento ao ex-cliente (CIC-007) não reabrem o cliente.', acao: 'Encerrar', perigo: true })
              if (ok) executar(() => mudarEstado(c, 'encerrado', 'saída concluída'), { sucesso: `${c.nome} encerrado` })
            }}
          >
            {c.estado_ciclo === 'encerrado' ? 'Encerrado' : 'Encerrar'}
          </Button>
        </div>
      )}
      {c.estado_ciclo === 'encerrado' && <PosDesligamento c={c} />}
    </>
  )
}

function PosDesligamento({ c }: { c: ClienteE }) {
  const executar = useAcao()
  const fluxos = useFluxos()
  return (
    <div className="bg-sunken flex flex-wrap items-center gap-2 rounded-md px-3 py-2 text-sm">
      <span className="min-w-0 grow basis-40">
        Encerrado em {diaMes(c.estado_ciclo_desde)}; retenção até {Number(c.estado_ciclo_desde.slice(0, 4)) + 5}. Pedido do ex-cliente ou do sucessor vira tarefa sem reabrir o cliente (CIC-007).
      </span>
      <Button
        size="sm"
        variant="outline"
        className="rounded-full"
        onClick={() => {
          const t = executar(() => criarTarefa({ atividade_id: 'CIC-007', titulo: `Atender ${c.nome} depois da saída`, setor_id: 'societario', cliente_id: c.id, origem: 'pessoa', prazo_interno: HOJE_ISO }), { sucesso: 'Tarefa pós-desligamento criada' })
          if (t) fluxos.abrirTarefa(t.id)
        }}
      >
        Tarefa pós-desligamento
      </Button>
    </div>
  )
}

function Dado({ rotulo, valor }: { rotulo: string; valor: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-muted-foreground text-xs">{rotulo}</dt>
      <dd className="truncate">{valor}</dd>
    </div>
  )
}

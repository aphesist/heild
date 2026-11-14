import {
  ArrowBendUpLeftIcon,
  ArrowSquareOutIcon,
  BuildingsIcon,
  ChatCircleDotsIcon,
  CheckCircleIcon,
  CheckIcon,
  ClockIcon,
  CurrencyCircleDollarIcon,
  EyeIcon,
  FileTextIcon,
  FlagIcon,
  PaperclipIcon,
  PauseIcon,
  PlusIcon,
  ProhibitIcon,
  SignpostIcon,
  SparkleIcon,
  SwapIcon,
  TimerIcon,
  UserIcon,
  WarningIcon,
  WrenchIcon,
} from '@phosphor-icons/react'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useLoja, useNavegacao, usePersistente, type Destino } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import { rotuloStatusLongo } from '@/components/compostos/rotulos'
import { useAcao, useConfirmar, usePode } from '@/components/kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { atividade, nomeCurtoAtividade, rotuloAutonomia } from '@/dados/atividades-s04'
import { faturas } from '@/dados/financeiro'
import { nomeDoSetor } from '@/dados/simulacao'
import { sessoesDia } from '@/dados/timesheet'
import { useAparencia } from '@/hooks/useAparencia'
import { cn } from '@/lib/utils'
import { repos } from '@/nucleo/repositorios'
import { useTabela } from '@/nucleo/react'
import type { SetorIntegrante } from '@/theme/tipos'
import { CHAVE_APRENDIZADOS, criarCartaoS04, registrarEfeitoS04, useDecidirCartaoS04, type Aprendizado } from './cartoes'
import {
  acoesTarefa,
  atrasadaE,
  checklistDe,
  comoIntegrante,
  diaMes,
  diasNoStatus,
  nomeClienteE,
  responsavelE,
  resultadoExigido,
  rotuloOrigem,
  rotuloQuemConclui,
  soPorRevisao,
  useClientesE,
  useTarefasE,
  type ResponsavelE,
  type TarefaE,
} from './modelo'
import { AreaTexto, Entrada, GavetaLarga, ResponsavelDe, Secao, StatusE } from './pecas'

export interface CallbacksFicha {
  onFechar: () => void
  onCobrar: (p: { cliente: string; setor: SetorIntegrante; texto: string; tarefa?: string; assunto?: string }) => void
  onFicha: (clienteId: string) => void
  onTrilha: (clienteId: string) => void
  onAbrirTarefa: (id: string) => void
}

type Painel = null | 'concluir' | 'cliente' | 'orgao' | 'revisao' | 'naoera' | 'extra'

/** A tarefa aberta por pessoa (03, 7.3): abrir outra pausa a anterior com aviso. */
const CHAVE_EM_CURSO = 's04:tarefas:em-curso'

/**
 * Ficha da tarefa (S04-T05; 03, 7.2 a 7.6). Tudo da tarefa num lugar, com as
 * transições como botões próprios. Abrir inicia (sem clique a mais); sessão
 * de menos de 60 s sem ação é descartada.
 */
export function FichaTarefa({ id, onFechar, onCobrar, onFicha, onTrilha, onAbrirTarefa }: { id: string } & CallbacksFicha) {
  const loja = useLoja()
  const nav = useNavegacao()
  const { usuario, permissoes } = useSessao()
  const aparencia = useAparencia()
  const executar = useAcao()
  const confirmar = useConfirmar()
  const decidir = useDecidirCartaoS04()
  const tarefas = useTarefasE()
  const clientes = useClientesE()
  const tCartao = useTabela('cartao_aprovacao')
  const tEvento = useTabela('evento')
  const tDoc = useTabela('documento')
  const t = tarefas.find((x) => x.id === id)
  const [painel, setPainel] = useState<Painel>(null)
  const [emCurso, setEmCurso] = usePersistente<Record<string, string>>(CHAVE_EM_CURSO, {})
  const acoesFeitas = useRef(0)
  const abertaEm = useRef(Date.now())

  const setor = (t?.setor_id ?? 'fiscal') as SetorIntegrante
  const podeConcluir = usePode('tarefa.concluir', { setor_id: setor, cliente_id: t?.cliente_id ?? null })
  const podeCancelar = usePode(t?.origem === 'obrigacao' ? 'tarefa.cancelar_obrigacao' : 'tarefa.cancelar', { setor_id: setor, cliente_id: t?.cliente_id ?? null })
  const podeReatribuir = usePode('tarefa.reatribuir', { setor_id: setor, cliente_id: t?.cliente_id ?? null })
  const gere = usuario.papel === 'administrador' || permissoes.gere.includes(setor)

  // Abrir inicia e pausa a anterior (03, 7.3).
  useEffect(() => {
    if (!t || ['concluida', 'cancelada'].includes(t.status)) return
    const anterior = emCurso[usuario.id]
    if (anterior && anterior !== t.id) {
      const a = repos.tarefas.obter(anterior)
      if (a && a.status === 'em_andamento') {
        executar(() => acoesTarefa.pausar(anterior, `${t.atividade_id} · ${t.titulo}`))
        loja.toast(`Você estava em ${a.atividade_id} · ${a.titulo}: ficou pausada.`)
      }
    }
    executar(() => acoesTarefa.iniciar(t.id))
    setEmCurso({ ...emCurso, [usuario.id]: t.id })
    abertaEm.current = Date.now()
    return () => {
      const seg = (Date.now() - abertaEm.current) / 1000
      // Sessão curta sem ação é descartada; a que durou vira evento de tempo.
      if (seg >= 60 || acoesFeitas.current > 0) loja.registrar(usuario.nome, `Trabalhou ${Math.max(1, Math.round(seg / 60))} min em ${t.atividade_id} · ${t.titulo}`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const cartoes = useMemo(() => repos.cartoes.listar((c) => c.extras?.tarefa_id === id), [tCartao, id])
  const eventos = useMemo(() => repos.eventos.listar((e) => e.resultado_ref === id && !!e.texto).slice(-30).reverse(), [tEvento, id])
  const docs = useMemo(() => repos.documentos.listar((d) => d.tarefa_id === id), [tDoc, id])
  const aprendizados = ((repos.telas.obter(CHAVE_APRENDIZADOS)?.valor as Aprendizado[] | undefined) ?? []).filter((a) => a.setor === setor).slice(-2)
  if (!t) return null

  const cliente = nomeClienteE(t, clientes)
  const clienteE = clientes.find((c) => c.id === t.cliente_id)
  const tom = aparencia({ setor })
  const a = atividade(t.atividade_id)
  const resp = responsavelE(t)
  const fechada = t.status === 'concluida' || t.status === 'cancelada'
  const filhas = tarefas.filter((x) => x.tarefa_pai_id === t.id)
  const pai = t.tarefa_pai_id ? tarefas.find((x) => x.id === t.tarefa_pai_id) : undefined
  const conversaId = t.conversa_id ?? (clienteE ? (loja.fichaDe(clienteE.id)?.conversas[setor] ?? loja.conversas.find((x) => x.cliente === cliente && x.setor === setor)?.id) : undefined)
  const conversa = conversaId ? loja.conversas.find((x) => x.id === conversaId) : undefined
  const sessoes = sessoesDia.filter((s) => s.cliente === cliente && s.atividade === t.atividade_id)
  const fatura = faturas.find((f) => f.cliente === cliente && f.situacao !== 'paga')
  const integranteId = repos.integrantes.listar((i) => i.setor === setor && i.tipo !== 'criado_pelo_usuario')[0]?.id ?? `i-${setor}`
  const cartaoPendenteLegado = !!t.extras?.cartao_pendente && !cartoes.some((c) => c.status === 'pendente')
  const ir = (d: Destino) => {
    onFechar()
    nav.irPara(d)
  }
  const fazer = <R,>(f: () => R, sucesso?: string) => {
    acoesFeitas.current++
    const r = executar(f, { sucesso })
    return r
  }
  const lembrete = !!t.extras?.exige_confirmacao

  const pedirIntegrante = () => {
    acoesFeitas.current++
    const nome = tom.nome
    const prepara = (a?.autonomia ?? 'P') !== 'S'
    const etapas = t.status === 'aguardando_cliente' ? ['Vendo o que falta e há quanto tempo', 'Escolhendo o contato do assunto na ficha', 'Enviando a cobrança e marcando o retorno'] : ['Abrindo a tarefa e o histórico do cliente', 'Juntando os documentos das pastas', `Fazendo: ${t.titulo.toLowerCase()}`, 'Conferindo contra as regras do escritório']
    const seg = 2
    loja.iniciarTrabalho(
      {
        id: `s04-ficha-${t.id}-${Date.now()}`,
        integrante: integranteId,
        setor,
        titulo: t.titulo,
        cliente,
        inicio: t.status === 'aguardando_cliente' ? `Vou cobrar ${cliente} pelo canal e contato do assunto.` : `Começando ${t.atividade_id} para ${cliente}.`,
        etapas,
        seg,
        fim:
          t.status === 'aguardando_cliente'
            ? { texto: `Cobrei ${cliente} sobre “${t.titulo}”. Continua aguardando; a resposta chega no CRM.`, aviso: `${nome} cobrou ${cliente}` }
            : prepara
              ? { texto: `Preparei ${t.atividade_id} (${t.titulo}) de ${cliente}. Deixei o cartão na tarefa para você aprovar: ${rotuloAutonomia[a?.autonomia ?? 'P']}.`, aviso: `${nome} preparou ${t.atividade_id} · ${cliente}` }
              : { texto: `Concluí ${t.atividade_id} (${t.titulo}) de ${cliente} por evidência. O resultado está na tarefa.`, aviso: `${nome} concluiu ${t.atividade_id} · ${cliente}` },
      },
      { tarefaId: t.id },
    )
    if (t.status === 'aguardando_cliente') return
    const espera = (etapas.length * seg + 3) * 1000
    window.setTimeout(() => {
      try {
        if (prepara) {
          criarCartaoS04({ acao: 'tarefa.preparada', resumo: `${t.atividade_id} · ${t.titulo} de ${cliente}: pronto para concluir`, argumentos: { Cliente: cliente, Atividade: `${t.atividade_id} · ${nomeCurtoAtividade(t.atividade_id)}`, Competência: t.competencia ?? '11/2026', Conferência: 'sem divergência' }, setor, integrante: nome, tarefaId: t.id, clienteId: t.cliente_id, clienteNome: cliente })
          comoIntegrante(nome, () => repos.tarefas.mudarStatus(t.id, 'em_revisao', { texto: `integrante ${nome} preparou ${t.atividade_id} e mandou para revisão` }))
        } else {
          comoIntegrante(nome, () => {
            const atual = repos.tarefas.obter(t.id)!
            repos.tarefas.atualizar(t.id, { checklist: checklistDe(atual).map((i) => ({ ...i, feito: true, feito_em: new Date().toISOString() })), extras: { ...atual.extras, resultado: `recibo ${Math.floor(100000 + Math.random() * 899999)}`, concluida_por_evidencia: true, atrasada: false } }, { ferramenta: 'tarefa.atualizar', texto: '' })
            repos.tarefas.mudarStatus(t.id, 'concluida', { texto: `integrante ${nome} concluiu ${t.atividade_id} por evidência` })
          })
        }
      } catch {
        /* a tarefa pode ter mudado enquanto o integrante trabalhava */
      }
    }, espera)
  }

  const cancelar = async () => {
    const motivo = await confirmar({ titulo: `Cancelar ${t.atividade_id}?`, descricao: t.origem === 'obrigacao' ? 'Tarefa de obrigação: só Gestor ou Administrador cancela. Fica no histórico com o motivo.' : 'A tarefa sai das filas e fica no histórico com o motivo.', acao: 'Cancelar tarefa', perigo: true, exigirMotivo: true, rotuloMotivo: 'Motivo' })
    if (typeof motivo === 'string') fazer(() => acoesTarefa.cancelar(t.id, motivo), 'Tarefa cancelada')
  }
  const correcao = async () => {
    const motivo = await confirmar({ titulo: 'Abrir correção', descricao: 'Concluída é final: a correção é uma tarefa nova ligada a esta.', acao: 'Abrir correção', exigirMotivo: true, rotuloMotivo: 'O que precisa ser corrigido' })
    if (typeof motivo === 'string') {
      const nova = fazer(() => acoesTarefa.abrirCorrecao(t.id, motivo), 'Correção aberta')
      if (nova) onAbrirTarefa(nova.id)
    }
  }
  const pausar = () => {
    fazer(() => acoesTarefa.pausar(t.id), 'Pausada: o tempo parou de contar')
    setEmCurso({ ...emCurso, [usuario.id]: '' })
  }
  const critica = async () => {
    if (t.extras?.critica) return fazer(() => acoesTarefa.marcarCritica(t.id, false))
    const motivo = await confirmar({ titulo: 'Etiquetar como ocorrência crítica', descricao: 'Entra na lista de ocorrências da Gestão (C2-27).', acao: 'Etiquetar', exigirMotivo: true, rotuloMotivo: 'O que aconteceu' })
    if (typeof motivo === 'string') fazer(() => acoesTarefa.marcarCritica(t.id, true, motivo), 'Ocorrência crítica registrada')
  }

  const botoes: { id: string; rotulo: string; icone: ReactNode; onClick: () => void; principal?: boolean; mostrar: boolean }[] = [
    { id: 'concluir', rotulo: lembrete ? 'Confirmar que foi feito' : 'Concluir', icone: <CheckIcon />, onClick: () => setPainel('concluir'), principal: true, mostrar: !fechada && podeConcluir && (!soPorRevisao(t) || t.status === 'em_revisao') },
    { id: 'revisao', rotulo: 'Enviar para revisão', icone: <EyeIcon />, onClick: () => setPainel('revisao'), principal: soPorRevisao(t), mostrar: !fechada && t.status !== 'em_revisao' },
    { id: 'cliente', rotulo: 'Aguardar cliente', icone: <ClockIcon />, onClick: () => setPainel('cliente'), mostrar: !fechada && t.status !== 'aguardando_cliente' && !!t.cliente_id },
    { id: 'orgao', rotulo: 'Aguardar órgão', icone: <BuildingsIcon />, onClick: () => setPainel('orgao'), mostrar: !fechada && t.status !== 'aguardando_terceiro' },
    { id: 'retomar', rotulo: 'Retomar', icone: <ArrowBendUpLeftIcon />, onClick: () => fazer(() => repos.tarefas.mudarStatus(t.id, 'em_andamento'), 'Retomada'), mostrar: t.status === 'aguardando_cliente' || t.status === 'aguardando_terceiro' },
    { id: 'pausar', rotulo: 'Pausar', icone: <PauseIcon />, onClick: pausar, mostrar: t.status === 'em_andamento' && !!t.extras?.aberta_por },
    { id: 'naoera', rotulo: 'Não era esta', icone: <SwapIcon />, onClick: () => setPainel('naoera'), mostrar: !fechada },
    { id: 'correcao', rotulo: 'Abrir correção', icone: <WrenchIcon />, onClick: correcao, mostrar: t.status === 'concluida' },
    { id: 'cancelar', rotulo: 'Cancelar', icone: <ProhibitIcon />, onClick: cancelar, mostrar: !fechada && podeCancelar },
  ]

  const lista = checklistDe(t)
  const nomesChecklist = (t.extras?.checklist_nomes as Record<number, string> | undefined) ?? {}
  const tokens = Number(t.extras?.tokens ?? (t.responsavel_tipo === 'integrante' ? 3100 : 0))

  return (
    <GavetaLarga
      largura="3xl"
      onFechar={onFechar}
      titulo={
        <span>
          <span className="text-muted-foreground font-mono text-sm">{t.atividade_id}</span> · {t.titulo}
        </span>
      }
      descricao={
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>{cliente}</span>·<span>{tom.nome}</span>
          {t.competencia && <>· <span>competência {t.competencia}</span></>}
        </span>
      }
      rodape={
        <>
          {!fechada && (
            <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={pedirIntegrante} disabled={!!loja.trabalhoDe({ tarefaId: t.id })}>
              <SparkleIcon /> {loja.trabalhoDe({ tarefaId: t.id }) ? `${tom.nome} fazendo…` : t.status === 'aguardando_cliente' ? `${tom.nome} cobra o cliente` : `Pedir ao ${tom.nome}`}
            </Button>
          )}
          <Button type="button" variant="ghost" size="sm" className="ml-auto rounded-full" onClick={onFechar}>
            Fechar
          </Button>
        </>
      }
    >
      {/* Cabeçalho */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <StatusE t={t} />
          <span className="text-muted-foreground text-xs">
            {rotuloStatusLongo[t.status]} há {diasNoStatus(t)} {diasNoStatus(t) === 1 ? 'dia' : 'dias'}
          </span>
          {cartoes.some((c) => c.status === 'pendente') || cartaoPendenteLegado ? <Badge variant="destaque">cartão aguardando aprovação</Badge> : null}
          {!!t.extras?.servico_extra && (
            <Badge variant="outline">
              <CurrencyCircleDollarIcon /> serviço extra
            </Badge>
          )}
          {!!t.extras?.critica && (
            <Badge variant="erro">
              <FlagIcon /> ocorrência crítica
            </Badge>
          )}
          {t.risco && (
            <Badge variant="outline">
              <WarningIcon /> risco: sai por revisão
            </Badge>
          )}
        </div>
        <dl className="bg-sunken/60 grid grid-cols-2 gap-x-4 gap-y-2 rounded-[14px] p-3 text-sm sm:grid-cols-3">
          <Dado rotulo="Prazo interno" valor={<span className={cn(atrasadaE(t) && 'text-destructive font-medium')}>{diaMes(t.prazo_interno)}</span>} />
          <Dado rotulo="Prazo legal" valor={diaMes(t.prazo_legal)} />
          <Dado
            rotulo="Responsável"
            valor={
              podeReatribuir && !fechada ? (
                <SeletorResponsavel t={t} onEscolher={(r) => fazer(() => acoesTarefa.reatribuir(t.id, r), `Passada para ${r.nome}`)} />
              ) : (
                <ResponsavelDe t={t} />
              )
            }
          />
          <Dado
            rotulo="Origem"
            valor={
              t.origem === 'trilha' && t.cliente_id ? (
                <button type="button" className="cursor-pointer underline underline-offset-2" onClick={() => onTrilha(t.cliente_id!)}>
                  trilha do cliente
                </button>
              ) : t.extras?.processo_nome ? (
                <button type="button" className="cursor-pointer underline underline-offset-2" onClick={() => ir({ modulo: 'painel', aba: 'gestao' })} title="A regra do processo se edita na Gestão, não pela tarefa (03, 7.6)">
                  processo: {String(t.extras.processo_nome)}
                </button>
              ) : (
                rotuloOrigem[t.origem]
              )
            }
          />
          <Dado rotulo="Quem conclui" valor={rotuloQuemConclui[t.quem_conclui]} />
          <Dado rotulo="Aberta por" valor={t.extras?.aberta_por_nome ? `${String(t.extras.aberta_por_nome)} (agora)` : 'ninguém agora'} />
        </dl>
        {a && (
          <p className="text-muted-foreground text-xs">
            {a.id}: {a.nome} · o integrante {rotuloAutonomia[a.autonomia]} · fase {a.fase}
          </p>
        )}
        {pai && (
          <button type="button" onClick={() => onAbrirTarefa(pai.id)} className="text-muted-foreground hover:text-foreground w-fit cursor-pointer text-left text-xs underline underline-offset-2">
            {t.extras?.correcao_de ? 'Correção de' : 'Parte de'}: {pai.titulo}
          </button>
        )}
      </div>

      {/* Evidência e motivos */}
      {t.status === 'concluida' && !!t.extras?.resultado && (
        <p className="bg-success/10 flex items-center gap-2 rounded-[14px] px-3 py-2 text-sm">
          <CheckCircleIcon className="text-success size-4" weight="fill" />
          {t.extras?.concluida_por_evidencia ? 'Concluída por evidência' : 'Concluída'}: {String(t.extras.resultado)}
          {!!t.extras?.aprovada_por && <span className="text-muted-foreground">· aprovada por {String(t.extras.aprovada_por)}</span>}
        </p>
      )}
      {t.status === 'cancelada' && <p className="bg-sunken rounded-[14px] px-3 py-2 text-sm">Cancelada: {t.cancelada_motivo}</p>}
      {(t.status === 'aguardando_cliente' || t.status === 'aguardando_terceiro') && t.aguardando_detalhe && (
        <p className="bg-warning/10 rounded-[14px] px-3 py-2 text-sm">
          {t.status === 'aguardando_terceiro' ? `Aguardando ${t.aguardando_detalhe.orgao ?? 'órgão'}: ` : 'O cliente precisa enviar: '}
          {t.aguardando_detalhe.itens?.join('; ')}
        </p>
      )}
      {!!t.extras?.devolvida && t.status === 'em_andamento' && <p className="bg-warning/10 rounded-[14px] px-3 py-2 text-sm">Devolvida na revisão: {String(t.extras.devolvida)}</p>}
      {t.status === 'em_revisao' && !!t.extras?.segunda_opiniao && (
        <p className="bg-raised rounded-[14px] px-3 py-2 text-sm">
          <SparkleIcon className="mr-1 inline size-4" />
          Segunda opinião · {String(t.extras.segunda_opiniao)}
        </p>
      )}

      {/* Barra de ações */}
      <div className="flex flex-wrap gap-1.5" role="toolbar" aria-label="Ações da tarefa">
        {botoes
          .filter((b) => b.mostrar)
          .map((b) => (
            <Button key={b.id} type="button" size="sm" variant={b.principal ? 'default' : 'outline'} className="rounded-full" onClick={b.onClick} aria-pressed={painel === b.id}>
              {b.icone} {b.rotulo}
            </Button>
          ))}
        <Button type="button" size="sm" variant="ghost" className="rounded-full" onClick={critica}>
          <FlagIcon /> {t.extras?.critica ? 'Tirar crítica' : 'Ocorrência crítica'}
        </Button>
        <Button type="button" size="sm" variant="ghost" className="rounded-full" onClick={() => (t.extras?.servico_extra ? fazer(() => acoesTarefa.marcarExtra(t.id, false)) : setPainel('extra'))}>
          <CurrencyCircleDollarIcon /> {t.extras?.servico_extra ? 'Não é extra' : 'Serviço extra'}
        </Button>
      </div>

      {painel && (
        <PainelAcao
          t={t}
          painel={painel}
          lembrete={lembrete}
          tarefas={tarefas}
          clienteNome={cliente}
          sugestaoItens={painel === 'cliente' && conversa ? [conversa.previa].filter(Boolean) : undefined}
          onFechar={() => setPainel(null)}
          fazer={(f, s) => {
            const r = fazer(f, s)
            if (r) setPainel(null)
            return r
          }}
        />
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <Secao titulo={`Checklist · ${lista.filter((i) => i.feito).length} de ${lista.length}`}>
          <ul className="flex flex-col gap-1">
            {lista.map((i, k) => (
              <li key={k}>
                <label className={cn('hover:bg-accent/60 flex cursor-pointer items-start gap-2 rounded-[10px] px-2 py-1.5 text-sm', fechada && 'cursor-default')}>
                  <input type="checkbox" className="accent-primary mt-0.5 size-4" checked={i.feito} disabled={fechada} onChange={(e) => fazer(() => acoesTarefa.marcarItem(t.id, k, e.target.checked))} />
                  <span className="min-w-0 flex-1">
                    <span className={cn(i.feito && 'text-muted-foreground line-through')}>{i.item}</span>
                    {i.obrigatorio && <span className="text-muted-foreground ml-1 text-[11px]">· obrigatório</span>}
                    {i.feito && (nomesChecklist[k] || i.feito_em) && (
                      <span className="text-muted-foreground block text-[11px]">
                        {nomesChecklist[k] || 'marcado'}
                        {i.feito_em ? `, ${new Date(i.feito_em).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}` : ''}
                      </span>
                    )}
                  </span>
                </label>
              </li>
            ))}
          </ul>
          {!fechada && <NovoItem onAdicionar={(x) => fazer(() => acoesTarefa.adicionarItem(t.id, x))} />}
        </Secao>

        <Secao titulo="Cartão de aprovação">
          {cartoes.length === 0 && !cartaoPendenteLegado && <p className="text-muted-foreground text-sm">Nenhum cartão nesta tarefa.</p>}
          {cartaoPendenteLegado && (
            <CartaoNaTarefa
              id={`s04-legado-${t.id}`}
              resumo={`${tom.nome} preparou ${t.titulo.toLowerCase()} de ${cliente}`}
              argumentos={{ Cliente: cliente, Atividade: t.atividade_id, Prazo: diaMes(t.prazo_interno) }}
              pedidoPor={`integrante ${tom.nome}`}
              pode={gere || podeConcluir}
              podeNomes={[]}
              onDecidir={(d, comentario) => {
                acoesFeitas.current++
                try {
                  repos.cartoes.decidir(`s04-legado-${t.id}`, d === 'recusar' ? 'recusado' : d === 'editar_e_aprovar' ? 'editado_e_aprovado' : 'aprovado', { comentario, criarSeFaltar: { resumo_humano: `${t.titulo} · ${cliente}`, extras: { tarefa_id: t.id, setor, integrante: tom.nome, acao: 'tarefa.preparada' } } })
                  repos.tarefas.atualizar(t.id, { extras: { ...t.extras, cartao_pendente: false } }, { ferramenta: 'tarefa.atualizar', texto: '' })
                  loja.toast(d === 'recusar' ? 'Recusado: a tarefa volta para uma pessoa.' : 'Aprovado. O integrante segue com o trabalho.')
                } catch (e) {
                  loja.toast((e as Error).message)
                }
              }}
            />
          )}
          {cartoes.map((c) => (
            <CartaoNaTarefa
              key={c.id}
              id={c.id}
              resumo={c.resumo_humano}
              argumentos={(c.extras?.argumentos_editados as Record<string, string>) ?? (c.argumentos as Record<string, string>)}
              pedidoPor={`integrante ${String(c.extras?.integrante ?? '')}`}
              expira={String(c.extras?.expira ?? '')}
              status={c.status}
              decididoPor={c.extras?.decidido_por_nome as string | undefined}
              comentario={c.comentario}
              pode={c.pode_aprovar.includes(usuario.id) || usuario.papel === 'administrador'}
              podeNomes={(c.extras?.pode_nomes as string[]) ?? []}
              onDecidir={(d, comentario, args) => {
                acoesFeitas.current++
                decidir(c.id, d, { comentario, argumentos: args })
              }}
            />
          ))}
          {aprendizados.length > 0 && (
            <p className="text-muted-foreground text-[11px]">
              O {tom.nome} aprendeu: {aprendizados.map((x) => `“${x.texto}”`).join(' · ')}
            </p>
          )}
        </Secao>

        <Secao
          titulo={`Documentos · ${docs.length}`}
          acao={
            !fechada && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 rounded-full"
                onClick={() =>
                  fazer(() =>
                    repos.documentos.criar({
                      cliente_id: t.cliente_id ?? null,
                      tipo: a?.id.startsWith('DP') ? 'folha' : a?.id.startsWith('FIS') ? 'guia' : 'documento',
                      competencia: t.competencia ?? '11/2026',
                      nome_arquivo: `${t.atividade_id} ${t.competencia?.replace('/', '-') ?? '11-2026'} · ${cliente}.pdf`,
                      mime: 'application/pdf',
                      tamanho_bytes: 184_320,
                      hash_sha256: Math.random().toString(16).slice(2).padEnd(16, '0'),
                      origem: 'upload_equipe',
                      enviado_por_tipo: 'usuario',
                      enviado_por_id: usuario.id,
                      backend_id: 'plataforma',
                      caminho: `${cliente}/${tom.nome}/${t.competencia ?? '2026'}`,
                      visivel_ao_cliente: false,
                      versao: 1,
                      tarefa_id: t.id,
                    }),
                  'Anexado: cliente, competência e tipo preenchidos pela tarefa',
                  )
                }
              >
                <PaperclipIcon /> Anexar
              </Button>
            )
          }
        >
          {docs.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nenhum documento ligado. Anexar aqui já preenche cliente, competência e tipo.</p>
          ) : (
            <ul className="flex flex-col gap-1 text-sm">
              {docs.map((d) => (
                <li key={d.id} className="flex items-center gap-2">
                  <FileTextIcon className="text-muted-foreground size-4 shrink-0" />
                  <span className="min-w-0 flex-1 truncate">{d.nome_arquivo}</span>
                  <button type="button" className="text-muted-foreground hover:text-foreground cursor-pointer text-[11px] underline" onClick={() => fazer(() => repos.documentos.atualizar(d.id, { visivel_ao_cliente: !d.visivel_ao_cliente }))}>
                    {d.visivel_ao_cliente ? 'visível no app' : 'só escritório'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Secao>

        <Secao titulo="Conversa ligada">
          {conversa ? (
            <div className="bg-raised flex flex-col gap-1 rounded-[14px] p-3 text-sm">
              <span className="font-medium">
                {conversa.pessoa.nome} · {conversa.status.replace('_', ' ')}
              </span>
              <span className="text-muted-foreground line-clamp-2 text-xs">{conversa.resumo ?? conversa.previa}</span>
              <div className="mt-1 flex flex-wrap gap-1">
                <Button size="sm" variant="ghost" className="h-7 rounded-full" onClick={() => ir({ modulo: 'crm', aba: 'conversas', conversa: conversa.id })}>
                  Abrir <ArrowSquareOutIcon />
                </Button>
                <Button size="sm" variant="ghost" className="h-7 rounded-full" onClick={() => onCobrar({ cliente, setor, texto: '', tarefa: t.id, assunto: t.titulo })}>
                  Nova mensagem ao cliente
                </Button>
                {!fechada && (
                  <Button size="sm" variant="ghost" className="h-7 rounded-full" onClick={() => setPainel('cliente')}>
                    Virar pendência
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-start gap-1">
              <p className="text-muted-foreground text-sm">Nenhuma conversa ligada.</p>
              {t.cliente_id && (
                <Button size="sm" variant="outline" className="rounded-full" onClick={() => onCobrar({ cliente, setor, texto: '', tarefa: t.id, assunto: t.titulo })}>
                  <ChatCircleDotsIcon /> Nova mensagem ao cliente
                </Button>
              )}
            </div>
          )}
        </Secao>
      </div>

      {filhas.length > 0 && (
        <Secao titulo={`Tarefas ligadas · ${filhas.filter((f) => f.status === 'concluida').length} de ${filhas.length}`}>
          <ul className="flex flex-col gap-1 text-sm">
            {filhas.map((f) => (
              <li key={f.id}>
                <button type="button" onClick={() => onAbrirTarefa(f.id)} className="hover:bg-accent/60 flex w-full cursor-pointer items-center gap-2 rounded-[10px] px-2 py-1 text-left">
                  <span className="text-muted-foreground font-mono text-xs">{f.atividade_id}</span>
                  <span className="min-w-0 flex-1 truncate">{f.titulo}</span>
                  <StatusE t={f} />
                </button>
              </li>
            ))}
          </ul>
        </Secao>
      )}

      <Secao titulo="Tempo">
        <ul className="flex flex-col gap-1 text-sm">
          {sessoes.map((s) => (
            <li key={s.id} className="flex items-center gap-2">
              <TimerIcon className="text-muted-foreground size-4" /> {usuario.nome} · {s.inicio}–{s.fim} ({s.confianca})
            </li>
          ))}
          {resp?.tipo === 'integrante' && (
            <li className="flex items-center gap-2">
              <SparkleIcon className="text-muted-foreground size-4" /> {resp.nome} (integrante) · 4 min de máquina{gere ? ` · ${tokens.toLocaleString('pt-BR')} tokens` : ''}
            </li>
          )}
          {sessoes.length === 0 && resp?.tipo !== 'integrante' && <li className="text-muted-foreground">Nenhuma sessão registrada hoje. Abrir a tarefa conta o tempo.</li>}
        </ul>
      </Secao>

      <Secao titulo="Histórico">
        {eventos.length === 0 ? (
          <p className="text-muted-foreground text-sm">Sem eventos ainda.</p>
        ) : (
          <ol className="border-border flex flex-col gap-1.5 border-l pl-3">
            {eventos.map((e) => (
              <li key={e.id} className="text-xs">
                <span className="text-muted-foreground tabular-nums">{new Date(e.criado_em).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span> · {e.texto}
              </li>
            ))}
          </ol>
        )}
      </Secao>

      <Secao titulo="Ligado a esta tarefa">
        <ul className="divide-border/70 flex flex-col divide-y text-sm">
          <Ligacao icone={<SparkleIcon />} titulo={`Integrante ${tom.nome}`} detalhe={resp?.tipo === 'integrante' ? 'é o responsável; o histórico está no chat dele' : 'pode preparar ou cobrar por você'} rotulo="Abrir no Time" onClick={() => ir({ modulo: 'inicio', aba: 'time', integrante: integranteId, cliente: t.cliente_id ?? undefined })} />
          <Ligacao icone={<FileTextIcon />} titulo={`Aba ${tom.nome}`} detalhe={`${cliente}: o que está aberto no setor`} rotulo="Abrir no Painel" onClick={() => ir({ modulo: 'painel', aba: setor === 'consultor' ? 'consultoria' : setor === 'gestao_atendimento' ? 'gestao' : setor, cliente: t.cliente_id ?? undefined })} />
          {t.cliente_id && <Ligacao icone={<UserIcon />} titulo="Ficha do cliente" detalhe={clienteE ? `${clienteE.codigo} · ${clienteE.documento}` : ''} rotulo="Abrir ficha" onClick={() => onFicha(t.cliente_id!)} />}
          {t.cliente_id && clienteE && ['em_implantacao', 'em_saida', 'em_baixa'].includes(clienteE.estado_ciclo) && <Ligacao icone={<SignpostIcon />} titulo="Trilha do cliente" detalhe={clienteE.estado_ciclo.replace('_', ' ')} rotulo="Ver trilha" onClick={() => onTrilha(t.cliente_id!)} />}
          {fatura && <Ligacao icone={<CurrencyCircleDollarIcon />} titulo="Honorário em aberto" detalhe={`${fatura.competencia} · vence ${fatura.vencimento}`} rotulo="Ver fatura" onClick={() => ir({ modulo: 'financeiro', aba: 'cobranca', fatura: fatura.id })} />}
          {!!t.extras?.conversa_interna && <Ligacao icone={<ChatCircleDotsIcon />} titulo="Conversa interna que originou" detalhe={String(t.extras.conversa_interna)} rotulo="Abrir" onClick={() => ir({ modulo: 'inicio', aba: 'assistente' })} />}
        </ul>
      </Secao>
      <p className="text-muted-foreground text-[11px]">Setor {nomeDoSetor(setor)} · {t.id}</p>
    </GavetaLarga>
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

function Ligacao({ icone, titulo, detalhe, rotulo, onClick }: { icone: ReactNode; titulo: string; detalhe: string; rotulo: string; onClick: () => void }) {
  return (
    <li className="flex items-center gap-3 py-2">
      <span className="text-muted-foreground [&_svg]:size-4">{icone}</span>
      <span className="min-w-0 flex-1">
        <span className="block">{titulo}</span>
        <span className="text-muted-foreground block truncate text-xs">{detalhe}</span>
      </span>
      <Button type="button" size="sm" variant="ghost" className="shrink-0 rounded-full" onClick={onClick}>
        {rotulo} <ArrowSquareOutIcon />
      </Button>
    </li>
  )
}

function NovoItem({ onAdicionar }: { onAdicionar: (x: string) => void }) {
  const [texto, setTexto] = useState('')
  return (
    <form
      className="flex gap-1.5"
      onSubmit={(e) => {
        e.preventDefault()
        if (!texto.trim()) return
        onAdicionar(texto)
        setTexto('')
      }}
    >
      <Entrada aria-label="Novo item do checklist" placeholder="Item livre (não obrigatório)" value={texto} onChange={(e) => setTexto(e.target.value)} className="h-8" />
      <Button type="submit" size="icon-sm" variant="outline" aria-label="Adicionar item" disabled={!texto.trim()}>
        <PlusIcon />
      </Button>
    </form>
  )
}

/** Escolher o responsável (Gestor reatribui): pessoas do setor e o integrante. */
function SeletorResponsavel({ t, onEscolher }: { t: TarefaE; onEscolher: (r: ResponsavelE) => void }) {
  const aparencia = useAparencia()
  const opcoes = opcoesResponsavel(t.setor_id, aparencia({ setor: t.setor_id as SetorIntegrante }).nome)
  const atual = responsavelE(t)
  const valor = atual ? `${atual.tipo}:${atual.tipo === 'integrante' ? t.setor_id : (atual.id ?? atual.nome)}` : ''
  return (
    <select
      aria-label="Responsável"
      className="bg-popover w-full max-w-full cursor-pointer truncate rounded-md border px-1 py-0.5 text-xs"
      value={valor}
      onChange={(e) => {
        const o = opcoes.find((x) => x.valor === e.target.value)
        if (o) onEscolher(o.r)
      }}
    >
      {!atual && <option value="">sem responsável</option>}
      {opcoes.map((o) => (
        <option key={o.valor} value={o.valor}>
          {o.rotulo}
        </option>
      ))}
    </select>
  )
}

export function opcoesResponsavel(setor: string, nomeIntegrante: string) {
  const vinculos = repos.vinculos.listar((v) => v.setor_id === setor)
  const pessoas = repos.usuarios.listar((u) => u.situacao === 'ativo' && (u.papel === 'administrador' || vinculos.some((v) => v.usuario_id === u.id)))
  return [
    ...pessoas.map((u) => ({ valor: `pessoa:${u.id}`, rotulo: u.nome, r: { tipo: 'pessoa' as const, id: u.id, nome: u.nome } })),
    { valor: `integrante:${setor}`, rotulo: `${nomeIntegrante} (integrante)`, r: { tipo: 'integrante' as const, id: `i-${setor}`, nome: nomeIntegrante, setor: setor as SetorIntegrante } },
  ]
}

/** O cartão dentro da tarefa (03, 7.5): sim · editar · não; quem não pode vê sem botões e o nome de quem pode. */
export function CartaoNaTarefa({
  id,
  resumo,
  argumentos,
  pedidoPor,
  expira,
  status = 'pendente',
  decididoPor,
  comentario,
  pode,
  podeNomes,
  onDecidir,
}: {
  id: string
  resumo: string
  argumentos: Record<string, string>
  pedidoPor: string
  expira?: string
  status?: string
  decididoPor?: string
  comentario?: string
  pode: boolean
  podeNomes: string[]
  onDecidir: (d: 'aprovar' | 'editar_e_aprovar' | 'recusar', comentario?: string, argumentos?: Record<string, string>) => void
}) {
  const [modo, setModo] = useState<null | 'editar' | 'recusar'>(null)
  const [args, setArgs] = useState(argumentos)
  const [texto, setTexto] = useState('')
  const decidido = status !== 'pendente'
  return (
    <div data-cartao={id} className={cn('flex flex-col gap-2 rounded-[14px] border p-3 text-sm', decidido ? 'bg-sunken/50' : 'bg-warning/8 border-warning/40')}>
      <span className="font-medium">{resumo}</span>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-xs">
        {Object.entries(args).map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-muted-foreground">{k}</dt>
            <dd>{modo === 'editar' ? <Entrada aria-label={k} className="h-7 text-xs" value={v} onChange={(e) => setArgs({ ...args, [k]: e.target.value })} /> : v}</dd>
          </div>
        ))}
      </dl>
      <span className="text-muted-foreground text-[11px]">
        pedido por {pedidoPor}
        {expira && !decidido ? ` · ${expira}` : ''}
      </span>
      {decidido ? (
        <span className="text-xs">
          {status === 'recusado' ? 'Recusado' : status === 'editado_e_aprovado' ? 'Editado e aprovado' : 'Aprovado'}
          {decididoPor ? ` por ${decididoPor}` : ''}
          {comentario ? ` · “${comentario}”` : ''}
        </span>
      ) : !pode ? (
        <span className="text-muted-foreground text-xs">Quem pode aprovar: {podeNomes.join(', ') || 'o Gestor do setor e o Administrador'}.</span>
      ) : modo === 'recusar' ? (
        <div className="flex flex-col gap-1.5">
          <AreaTexto aria-label="Por que recusa" rows={2} placeholder="Por que recusa? O integrante aprende com isso." value={texto} onChange={(e) => setTexto(e.target.value)} />
          <div className="flex gap-1.5">
            <Button size="sm" variant="destructive" className="rounded-full" onClick={() => onDecidir('recusar', texto)}>
              Recusar
            </Button>
            <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setModo(null)}>
              Voltar
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {modo === 'editar' ? (
            <Button size="sm" className="rounded-full" onClick={() => onDecidir('editar_e_aprovar', 'argumentos editados', args)}>
              Salvar e aprovar
            </Button>
          ) : (
            <Button size="sm" className="rounded-full" onClick={() => onDecidir('aprovar')}>
              Aprovar
            </Button>
          )}
          <Button size="sm" variant="outline" className="rounded-full" onClick={() => setModo(modo === 'editar' ? null : 'editar')}>
            {modo === 'editar' ? 'Cancelar edição' : 'Editar e aprovar'}
          </Button>
          <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setModo('recusar')}>
            Recusar
          </Button>
        </div>
      )}
    </div>
  )
}

/** O que cada ação pede antes de valer (lista do cliente, órgão e protocolo, resultado...). */
function PainelAcao({
  t,
  painel,
  lembrete,
  tarefas,
  clienteNome,
  sugestaoItens,
  onFechar,
  fazer,
}: {
  t: TarefaE
  painel: Exclude<Painel, null>
  lembrete: boolean
  tarefas: TarefaE[]
  clienteNome: string
  sugestaoItens?: string[]
  onFechar: () => void
  fazer: <R>(f: () => R, sucesso?: string) => R | undefined
}) {
  const pendentes = (t.aguardando_detalhe?.itens ?? []).join('\n')
  const [itens, setItens] = useState(pendentes || (sugestaoItens ?? []).join('\n'))
  const [orgao, setOrgao] = useState('Receita Federal')
  const [protocolo, setProtocolo] = useState('')
  const [resultado, setResultado] = useState('')
  const [comentario, setComentario] = useState('')
  const [confirmo, setConfirmo] = useState(false)
  const [outra, setOutra] = useState('')
  const [valor, setValor] = useState('R$ 180,00')
  const exige = resultadoExigido(t)
  const outras = tarefas.filter((x) => x.id !== t.id && !['concluida', 'cancelada'].includes(x.status)).slice(0, 40)
  const caixa = (titulo: string, corpo: ReactNode, acao: ReactNode) => (
    <div className="bg-raised flex flex-col gap-2 rounded-[14px] p-3" role="group" aria-label={titulo}>
      <span className="text-sm font-medium">{titulo}</span>
      {corpo}
      <div className="flex flex-wrap gap-1.5">
        {acao}
        <Button size="sm" variant="ghost" className="rounded-full" onClick={onFechar}>
          Cancelar
        </Button>
      </div>
    </div>
  )
  if (painel === 'concluir')
    return caixa(
      lembrete ? 'Confirmar que foi feito' : 'Concluir',
      <>
        {exige && <Entrada aria-label={exige} placeholder={exige} value={resultado} onChange={(e) => setResultado(e.target.value)} />}
        {!exige && <Entrada aria-label="Resultado (opcional)" placeholder="Resultado (opcional)" value={resultado} onChange={(e) => setResultado(e.target.value)} />}
        {lembrete && (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="accent-primary size-4" checked={confirmo} onChange={(e) => setConfirmo(e.target.checked)} /> Confirmo que foi feito (o lembrete só some com esta confirmação, C2-29)
          </label>
        )}
      </>,
      <Button size="sm" className="rounded-full" disabled={lembrete && !confirmo} onClick={() => fazer(() => acoesTarefa.concluir(t.id, { resultado: resultado || undefined }), 'Tarefa concluída')}>
        <CheckIcon /> Concluir
      </Button>,
    )
  if (painel === 'revisao')
    return caixa(
      'Enviar para revisão',
      <>
        <AreaTexto aria-label="Comentário para quem revisa" rows={2} placeholder="O que a pessoa precisa olhar (opcional)" value={comentario} onChange={(e) => setComentario(e.target.value)} />
        {t.risco && <p className="text-muted-foreground text-xs">Tarefa com risco: o Consultor deixa a segunda opinião junto.</p>}
      </>,
      <Button size="sm" className="rounded-full" onClick={() => fazer(() => acoesTarefa.enviarRevisao(t.id, comentario || undefined), 'Enviada para revisão')}>
        <EyeIcon /> Enviar
      </Button>,
    )
  if (painel === 'cliente')
    return caixa(
      `O que ${clienteNome} precisa enviar`,
      <>
        <AreaTexto aria-label="Itens que faltam (um por linha)" rows={3} placeholder={'Um item por linha\nEx.: extrato do Itaú de outubro'} value={itens} onChange={(e) => setItens(e.target.value)} />
        <p className="text-muted-foreground text-xs">Vira pendência no app do cliente e entra na régua de cobrança.</p>
      </>,
      <Button size="sm" className="rounded-full" onClick={() => fazer(() => acoesTarefa.aguardarCliente(t.id, itens.split('\n')), 'Aguardando o cliente: pendência no app')}>
        <ClockIcon /> Aguardar cliente
      </Button>,
    )
  if (painel === 'orgao')
    return caixa(
      'Aguardar órgão ou terceiro',
      <div className="grid gap-2 sm:grid-cols-2">
        <Entrada aria-label="Órgão" value={orgao} onChange={(e) => setOrgao(e.target.value)} />
        <Entrada aria-label="Protocolo" placeholder="Protocolo" value={protocolo} onChange={(e) => setProtocolo(e.target.value)} />
      </div>,
      <Button size="sm" className="rounded-full" onClick={() => fazer(() => acoesTarefa.aguardarOrgao(t.id, orgao, protocolo), `Aguardando ${orgao}`)}>
        <BuildingsIcon /> Aguardar
      </Button>,
    )
  if (painel === 'naoera')
    return caixa(
      'Não era esta tarefa',
      <>
        <select aria-label="Tarefa certa" className="bg-popover h-9 rounded-md border px-2 text-sm" value={outra} onChange={(e) => setOutra(e.target.value)}>
          <option value="">Escolha a tarefa em que você estava</option>
          {outras.map((x) => (
            <option key={x.id} value={x.id}>
              {x.atividade_id} · {x.titulo}
            </option>
          ))}
        </select>
        <p className="text-muted-foreground text-xs">Corrige a sessão em curso; vira item de confirmação no Timesheet.</p>
      </>,
      <Button size="sm" className="rounded-full" disabled={!outra} onClick={() => fazer(() => acoesTarefa.naoEraEsta(t.id, { tarefaId: outra }), 'Sessão corrigida: confirme no Timesheet')}>
        <SwapIcon /> Corrigir
      </Button>,
    )
  return caixa(
    'Serviço extra (comanda digital)',
    <>
      <Entrada aria-label="Valor do extra" value={valor} onChange={(e) => setValor(e.target.value)} />
      <p className="text-muted-foreground text-xs">As horas desta tarefa entram no Timesheet como extra e o item vai ao Financeiro para faturar (C2-25).</p>
    </>,
    <Button size="sm" className="rounded-full" onClick={() => fazer(() => acoesTarefa.marcarExtra(t.id, true, valor), 'Marcada como extra: vai para o faturamento')}>
      <CurrencyCircleDollarIcon /> Marcar como extra
    </Button>,
  )
}

/* O cartão do integrante que preparou: aprovar conclui com a evidência e o nome de quem aprovou. */
registrarEfeitoS04('tarefa.preparada', (c, ctx) => {
  const id = c.extras?.tarefa_id as string | undefined
  const t = id ? repos.tarefas.obter(id) : undefined
  if (!t) return
  if (t.status === 'em_revisao') {
    repos.tarefas.atualizar(t.id, { extras: { ...t.extras, aprovada_por: ctx.usuario.nome, resultado: t.extras?.resultado ?? 'preparado pelo integrante e aprovado', concluida_por_evidencia: true, atrasada: false } }, { ferramenta: 'tarefa.atualizar', texto: '' })
    repos.tarefas.mudarStatus(t.id, 'concluida', { texto: `${ctx.usuario.nome} aprovou${ctx.editado ? ' (com edição)' : ''} o que o integrante preparou e concluiu ${t.atividade_id}` })
  }
  ctx.loja.toast(`Aprovado: ${t.atividade_id} · ${t.titulo} concluída.`)
})

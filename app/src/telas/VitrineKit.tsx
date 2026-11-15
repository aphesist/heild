import { ArchiveIcon, ArrowLeftIcon, CheckCircleIcon, ClockCounterClockwiseIcon, EnvelopeSimpleIcon, PencilSimpleIcon, PlusIcon, ProhibitIcon, TrashIcon, TrayIcon, XCircleIcon } from '@phosphor-icons/react'
import { useMemo, useState } from 'react'
import { useLoja } from '@/ambiente/loja'
import { useSessao, useSessaoBruta } from '@/ambiente/sessao'
import { BarraLote, BotaoAcoes, CaixaSelecao, Carregando, EdicaoEmLinha, EstadoErro, EstadoVazio, FormularioModal, ListaOrdenavel, MenuContexto, Quadro, SeloDemonstracao, SePode, useAcao, useConfirmar, useFormulario, useSelecao, type AcaoMenu } from '@/components/kit'
import { AreaRolagem } from '@/components/ui/area-rolagem'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Campo, CampoEscolha, CampoTexto } from '@/components/ui/formulario'
import { cn } from '@/lib/utils'
import type { StatusTarefa, Tarefa } from '@/nucleo/modelo/entidades'
import { rotuloPapel, rotuloSetorCurto } from '@/nucleo/permissoes'
import { useTabela } from '@/nucleo/react'
import { irParaPagina } from '@/nucleo/rotas'
import { agora, repos } from '@/nucleo/repositorios'
import { catalogoServicos, servicos, type Resultado } from '@/servicos'
import type { SetorIntegrante } from '@/theme/tipos'

/**
 * Vitrine viva do kit de interação e dos serviços simulados (#/kit). Tudo
 * aqui grava no banco de verdade, com a permissão da conta escolhida: é o
 * exemplo de uso para as sessões das telas (S01 a S11). Não é tela do produto.
 */
export function VitrineKit() {
  const sessao = useSessaoBruta()
  return (
    <AreaRolagem className="from-background to-background-end text-foreground h-dvh bg-gradient-to-b">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6">
        <header className="flex flex-wrap items-end gap-3">
          <div className="min-w-0 grow basis-40">
            <Button variant="ghost" size="sm" className="-ml-2 rounded-full" onClick={() => irParaPagina('sistema')}>
              <ArrowLeftIcon /> Voltar ao sistema
            </Button>
            <h1 className="text-3xl font-light tracking-tight">Kit de interação</h1>
            <p className="text-muted-foreground max-w-2xl text-sm">Peças comuns do wireframe funcionando sobre o banco: o que se cria, edita, move ou exclui aqui fica gravado (com permissão e evento) e aparece nas telas. Guia em docs/wireframe/ARQUITETURA.md.</p>
          </div>
          <ContaDaVitrine />
        </header>
        {!sessao?.usuario ? (
          <EstadoVazio titulo="Escolha uma conta para agir" descricao="A permissão de cada botão sai da conta escolhida (Administrador, Gestor ou Membro)." />
        ) : (
          <>
            <QuadroTarefas />
            <div className="grid gap-6 lg:grid-cols-2">
              <ConversaInterna />
              <Obrigacoes />
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <Convites />
              <Estados />
            </div>
            <ServicosSimulados />
            <Eventos />
          </>
        )}
      </div>
    </AreaRolagem>
  )
}

function Secao({ titulo, descricao, acao, children, className }: { titulo: string; descricao?: string; acao?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section aria-label={titulo} className={cn('bg-surface shadow-painel flex min-w-0 flex-col gap-3 rounded-campo p-4', className)}>
      <header className="flex flex-wrap items-start gap-2">
        <div className="min-w-0 grow basis-40">
          <h2 className="text-base font-medium">{titulo}</h2>
          {descricao && <p className="text-muted-foreground text-xs">{descricao}</p>}
        </div>
        {acao}
      </header>
      {children}
    </section>
  )
}

function ContaDaVitrine() {
  const sessao = useSessaoBruta()
  if (!sessao) return null
  const ativas = sessao.contas.filter((u) => u.situacao === 'ativo')
  return (
    <label className="flex w-72 flex-col gap-1 text-xs">
      <span className="text-muted-foreground">Agindo como</span>
      <CampoEscolha rotulo="Agindo como" valor={sessao.usuario?.id ?? ''} onMudar={(id) => sessao.entrar(id)} opcoes={[{ valor: '', rotulo: 'Ninguém' }, ...ativas.map((u) => ({ valor: u.id, rotulo: `${u.nome} · ${rotuloPapel[u.papel]}` }))]} />
    </label>
  )
}

/* ---------- Quadro de tarefas: arrastar entre colunas, edição em linha, menu, seleção, formulário ---------- */

const colunas: { id: StatusTarefa; titulo: string }[] = [
  { id: 'a_fazer', titulo: 'A fazer' },
  { id: 'em_andamento', titulo: 'Em andamento' },
  { id: 'aguardando_cliente', titulo: 'Aguardando cliente' },
  { id: 'concluida', titulo: 'Concluída' },
]

function QuadroTarefas() {
  const tTarefa = useTabela('tarefa')
  const clientes = useTabela('cliente')
  const { permissoes } = useSessao()
  const executar = useAcao()
  const confirmar = useConfirmar()
  const loja = useLoja()
  const [nova, setNova] = useState(false)
  const [setor, setSetor] = useState<SetorIntegrante>(permissoes.setores.find((s) => s !== 'bpo_financeiro') ?? 'fiscal')
  const tarefas = useMemo(() => repos.tarefas.listar((t) => t.setor_id === setor && t.status !== 'cancelada'), [tTarefa, setor]) // eslint-disable-line react-hooks/exhaustive-deps
  const selecao = useSelecao(tarefas.map((t) => t.id))
  const nomeCliente = (id?: string | null) => clientes.find((c) => c.id === id)?.nome ?? 'Interno'

  const mover = (id: string, status: string, posicao: number) => {
    const antes = repos.tarefas.obter(id)!
    executar(
      () => {
        if (antes.status !== status) repos.tarefas.mudarStatus(id, status as StatusTarefa)
        repos.tarefas.mover(id, 'status', status as StatusTarefa, posicao)
      },
      { sucesso: antes.status !== status ? `${antes.titulo}: ${colunas.find((c) => c.id === status)?.titulo.toLowerCase()}` : undefined, desfazer: () => repos.tarefas.reverter(antes) },
    )
  }
  const cancelar = async (t: Tarefa) => {
    const motivo = await confirmar({ titulo: `Cancelar “${t.titulo}”?`, descricao: 'A tarefa não some: fica cancelada, com o motivo, o seu nome e a data. Tarefa de obrigação só Gestor ou Administrador cancela.', acao: 'Cancelar tarefa', perigo: true, exigirMotivo: true })
    if (typeof motivo === 'string') executar(() => repos.tarefas.cancelar(t.id, motivo), { sucesso: 'Tarefa cancelada', desfazer: () => repos.tarefas.reverter(t) })
  }
  const acoes = (t: Tarefa): AcaoMenu[] => [
    { rotulo: 'Concluir', icone: <CheckCircleIcon />, onSelecionar: () => mover(t.id, 'concluida', 0), motivo: t.status === 'concluida' ? 'Já está concluída' : undefined },
    { rotulo: 'Abrir no Painel', icone: <PencilSimpleIcon />, onSelecionar: () => (window.location.hash = `#/painel/${t.setor_id === 'consultor' ? 'consultoria' : t.setor_id}?tarefa=${t.id}`) },
    { rotulo: 'Arquivar', icone: <ArchiveIcon />, separar: true, onSelecionar: () => executar(() => repos.tarefas.arquivar(t.id), { sucesso: 'Tarefa arquivada', desfazer: () => repos.tarefas.desarquivar(t.id) }), motivo: repos.tarefas.pode('arquivar', t) ? undefined : 'Só quem gere o setor' },
    { rotulo: 'Cancelar com motivo', icone: <ProhibitIcon />, perigo: true, onSelecionar: () => void cancelar(t), motivo: repos.tarefas.pode('atualizar', t) ? undefined : 'Sua conta não tem esse setor' },
    { rotulo: 'Excluir', icone: <TrashIcon />, perigo: true, onSelecionar: () => executar(() => repos.tarefas.excluir(t.id)), motivo: 'Tarefa não se apaga (Fundações 4.8): cancele com motivo' },
  ]
  const lote = (status: StatusTarefa) => (ids: string[]) => {
    const antes = ids.map((id) => repos.tarefas.obter(id)!)
    executar(() => ids.forEach((id) => repos.tarefas.mudarStatus(id, status)), { sucesso: `${ids.length} tarefas atualizadas`, desfazer: () => antes.forEach((a) => repos.tarefas.reverter(a)) })
    selecao.limpar()
  }
  return (
    <Secao
      titulo="Quadro de tarefas"
      descricao="Arraste entre as colunas (mouse, toque ou teclado). Clique no título para editar. Botão direito ou ⋯ abre o menu. Marque várias para agir em lote."
      acao={
        <div className="flex items-center gap-2">
          <div className="w-44">
            <CampoEscolha rotulo="Setor" valor={setor} onMudar={(v) => setSetor(v as SetorIntegrante)} opcoes={permissoes.setores.filter((s) => !s.startsWith('bpo_') || s === 'bpo_financeiro').map((s) => ({ valor: s, rotulo: rotuloSetorCurto[s] }))} />
          </div>
          <SePode ferramenta="tarefa.criar" alvo={{ setor_id: setor }} mostrarMotivo>
            <Button size="sm" className="rounded-full" onClick={() => setNova(true)}>
              <PlusIcon /> Nova tarefa
            </Button>
          </SePode>
        </div>
      }
    >
      {tarefas.length ? (
        <>
          <div className="flex items-center gap-2 px-1 text-xs">
            <CaixaSelecao marcado={selecao.todos} parcial={selecao.algum} onMudar={selecao.alternarTodos} rotulo="Selecionar todas" />
            <span className="text-muted-foreground">Selecionar todas ({tarefas.length})</span>
          </div>
          <Quadro
            colunas={colunas}
            itens={tarefas}
            idDe={(t) => t.id}
            colunaDe={(t) => t.status}
            rotuloDe={(t) => t.titulo}
            onMover={mover}
            desabilitado={!repos.tarefas.pode('atualizar', { setor_id: setor })}
            render={(t) => (
              <MenuContexto acoes={acoes(t)}>
                <div className="flex flex-col gap-1" data-tarefa={t.id}>
                  <div className="flex items-start gap-1.5">
                    <CaixaSelecao className="mt-1" marcado={selecao.marcado(t.id)} onMudar={(intervalo) => selecao.alternar(t.id, intervalo)} rotulo={`Selecionar ${t.titulo}`} />
                    <EdicaoEmLinha className="text-sm font-medium" rotulo="Título da tarefa" valor={t.titulo} desabilitado={!repos.tarefas.pode('atualizar', t)} validar={(v) => (v.trim().length >= 3 ? null : 'Escreva pelo menos 3 letras')} onSalvar={(v) => void repos.tarefas.atualizar(t.id, { titulo: v.trim() })} />
                    <BotaoAcoes acoes={acoes(t)} rotulo={`Ações de ${t.titulo}`} />
                  </div>
                  <p className="text-muted-foreground pl-6 text-xs">
                    {nomeCliente(t.cliente_id)} · <span className="font-mono">{t.atividade_id}</span>
                    {t.prazo_interno ? ` · ${t.prazo_interno.slice(8, 10)}/${t.prazo_interno.slice(5, 7)}` : ''}
                  </p>
                </div>
              </MenuContexto>
            )}
          />
          <BarraLote
            selecao={selecao}
            nome={['tarefa', 'tarefas']}
            acoes={[
              { rotulo: 'Iniciar', onExecutar: lote('em_andamento') },
              { rotulo: 'Concluir', icone: <CheckCircleIcon />, onExecutar: lote('concluida') },
            ]}
          />
        </>
      ) : (
        <EstadoVazio icone={TrayIcon} titulo="Nenhuma tarefa neste setor" descricao="Crie uma para ver o quadro funcionando." compacto />
      )}
      {nova && <NovaTarefa setor={setor} onFechar={() => setNova(false)} onCriada={(t) => loja.toastDesfazer(`Tarefa criada: ${t.titulo}`, () => repos.tarefas.desfazerCriacao(t.id))} />}
    </Secao>
  )
}

function NovaTarefa({ setor, onFechar, onCriada }: { setor: SetorIntegrante; onFechar: () => void; onCriada: (t: Tarefa) => void }) {
  const clientes = useTabela('cliente')
  const f = useFormulario({ titulo: '', atividade: '', cliente: clientes[0]?.id ?? '', prazo: '' }, (v) => ({
    titulo: v.titulo.trim().length >= 3 ? null : 'Escreva um título (pelo menos 3 letras)',
    atividade: /^[A-Z]{2,4}-\d{3}$/.test(v.atividade.trim()) ? null : 'Use o código do catálogo, como FIS-009',
    prazo: !v.prazo || /^\d{4}-\d{2}-\d{2}$/.test(v.prazo) ? null : 'Data inválida',
  }))
  return (
    <FormularioModal
      aberto
      onFechar={onFechar}
      titulo="Nova tarefa"
      descricao={`No setor ${rotuloSetorCurto[setor]}. Toda tarefa aponta para uma atividade do catálogo (é o que dá timesheet e autonomia).`}
      formulario={f}
      acao="Criar tarefa"
      onSalvar={(v) => {
        const t = repos.tarefas.criar({ titulo: v.titulo.trim(), atividade_id: v.atividade.trim(), cliente_id: v.cliente || null, setor_id: setor, origem: 'pessoa', quem_conclui: 'pessoa', status: 'a_fazer', status_desde: agora(), prazo_interno: v.prazo || null, prioridade: 'normal', checklist: [], risco: false, ordem: 0 })
        onCriada(t)
      }}
    >
      <Campo rotulo="Título" erro={f.erro('titulo')}>
        {(id) => <CampoTexto id={id} valor={f.valores.titulo} onMudar={(x) => f.definir('titulo', x)} placeholder="Conferir a DCTFWeb de novembro" />}
      </Campo>
      <Campo rotulo="Atividade do catálogo" erro={f.erro('atividade')} ajuda="Ex.: FIS-009 (PGDAS-D), DP-012 (folha), CTB-010 (balancete)">
        {(id) => <CampoTexto id={id} mono valor={f.valores.atividade} onMudar={(x) => f.definir('atividade', x.toUpperCase())} placeholder="FIS-009" />}
      </Campo>
      <Campo rotulo="Cliente">{(id) => <CampoEscolha id={id} valor={f.valores.cliente} onMudar={(x) => f.definir('cliente', x)} opcoes={[{ valor: '', rotulo: 'Interna (sem cliente)' }, ...clientes.map((c) => ({ valor: c.id, rotulo: c.nome }))]} />}</Campo>
      <Campo rotulo="Prazo interno" erro={f.erro('prazo')}>
        {(id) => <CampoTexto id={id} tipo="date" valor={f.valores.prazo} onMudar={(x) => f.definir('prazo', x)} />}
      </Campo>
    </FormularioModal>
  )
}

/* ---------- Conversa interna: enviar, editar com versões, nunca excluir ---------- */

function ConversaInterna() {
  const mensagens = useTabela('mensagem_interna')
  const usuarios = useTabela('usuario')
  const { usuario } = useSessao()
  const executar = useAcao()
  const [texto, setTexto] = useState('')
  const [versoes, setVersoes] = useState<string | null>(null)
  const doGeral = useMemo(() => repos.mensagensInternas.listar((m) => m.conversa_interna_id === 'ci-geral').slice(-6), [mensagens]) // eslint-disable-line react-hooks/exhaustive-deps
  const nome = (id: string) => usuarios.find((u) => u.id === id)?.nome ?? id
  return (
    <Secao titulo="Conversa interna · Geral" descricao="Mensagem interna nunca se apaga (nem pelo Administrador). Editar guarda a versão anterior, visível para quem participa.">
      <ul className="flex flex-col gap-2">
        {doGeral.map((m) => (
          <li key={m.id} className="bg-raised shadow-cartao flex flex-col gap-1 rounded-md p-2.5 text-sm">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-medium">{nome(m.autor_id)}</span>
              {m.editada_em && (
                <button type="button" className="text-muted-foreground cursor-pointer underline-offset-2 hover:underline" onClick={() => setVersoes(versoes === m.id ? null : m.id)}>
                  editada · {m.versoes.length} {m.versoes.length === 1 ? 'versão anterior' : 'versões anteriores'}
                </button>
              )}
              <BotaoAcoes
                className="ml-auto"
                acoes={[
                  { rotulo: 'Excluir', icone: <TrashIcon />, perigo: true, onSelecionar: () => executar(() => repos.mensagensInternas.excluir(m.id)), motivo: 'Mensagem interna nunca se apaga (subplano 11)' },
                  { rotulo: 'Ver versões', icone: <ClockCounterClockwiseIcon />, onSelecionar: () => setVersoes(m.id), motivo: m.versoes.length ? undefined : 'Ainda não foi editada' },
                ]}
              />
            </div>
            <EdicaoEmLinha rotulo="Mensagem" multilinha valor={m.corpo} desabilitado={m.autor_id !== usuario.id} onSalvar={(v) => void repos.mensagensInternas.editar(m.id, v)} validar={(v) => (v.trim() ? null : 'A mensagem não pode ficar vazia')} />
            {versoes === m.id &&
              m.versoes.map((v, i) => (
                <p key={i} className="text-muted-foreground border-l-2 pl-2 text-xs">
                  “{v.corpo}” · até {new Date(v.ate).toLocaleString('pt-BR')}
                </p>
              ))}
          </li>
        ))}
      </ul>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          if (!texto.trim()) return
          if (executar(() => repos.mensagensInternas.enviar('ci-geral', texto.trim()))) setTexto('')
        }}
      >
        <CampoTexto aria-label="Mensagem para o canal Geral" valor={texto} onMudar={setTexto} placeholder="Escreva para o canal Geral" />
        <Button type="submit" className="rounded-full">
          Enviar
        </Button>
      </form>
    </Secao>
  )
}

/* ---------- Obrigações: reordenar e cancelar (só Gestor, com motivo) ---------- */

function Obrigacoes() {
  const tObrigacao = useTabela('obrigacao')
  const executar = useAcao()
  const confirmar = useConfirmar()
  const lista = useMemo(() => repos.obrigacoes.listar(), [tObrigacao]) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Secao titulo="Obrigações do escritório" descricao="Arraste para reordenar. Cancelar uma obrigação é só para Gestor ou Administrador, com motivo; ela fica no histórico.">
      <ListaOrdenavel
        itens={lista}
        idDe={(o) => o.id}
        rotuloDe={(o) => o.nome}
        desabilitado={!repos.obrigacoes.pode('atualizar', { gera_tarefa_para_setor: 'fiscal' })}
        onReordenar={(ids) => executar(() => repos.obrigacoes.reordenar(ids))}
        render={(o) => (
          <div className={cn('bg-raised shadow-cartao flex items-center gap-2 rounded-md px-3 py-2 text-sm', o.cancelada_em && 'opacity-60')}>
            <span className="min-w-0 flex-1">
              <span className={cn('block', o.cancelada_em && 'line-through')}>{o.nome}</span>
              <span className="text-muted-foreground block text-xs">
                <span className="font-mono">{o.atividade_id}</span> · {rotuloSetorCurto[o.gera_tarefa_para_setor as SetorIntegrante] ?? o.gera_tarefa_para_setor} · dia {o.regra_prazo.dia}
                {o.cancelada_motivo ? ` · cancelada: ${o.cancelada_motivo}` : ''}
              </span>
            </span>
            {!o.cancelada_em && (
              <SePode ferramenta="obrigacao.cancelar" alvo={{ setor_id: o.gera_tarefa_para_setor }} mostrarMotivo>
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-full"
                  onClick={async () => {
                    const motivo = await confirmar({ titulo: `Cancelar a obrigação ${o.nome}?`, descricao: 'As tarefas futuras deixam de nascer. O passado fica. O motivo vai para o evento.', acao: 'Cancelar obrigação', perigo: true, exigirMotivo: true })
                    if (typeof motivo === 'string') executar(() => repos.obrigacoes.cancelar(o.id, motivo), { sucesso: 'Obrigação cancelada', desfazer: () => repos.obrigacoes.reverter(o) })
                  }}
                >
                  <XCircleIcon /> Cancelar
                </Button>
              </SePode>
            )}
          </div>
        )}
      />
    </Secao>
  )
}

/* ---------- Convites: criar e excluir de vez (com confirmação e desfazer) ---------- */

function Convites() {
  const convites = useTabela('convite')
  const { usuario } = useSessao()
  const executar = useAcao()
  const confirmar = useConfirmar()
  const [novo, setNovo] = useState(false)
  const f = useFormulario({ email: '', setor: 'fiscal' }, (v) => ({ email: /^\S+@\S+\.\S+$/.test(v.email.trim()) ? null : 'E-mail inválido' }))
  return (
    <Secao
      titulo="Convites pendentes"
      descricao="Exclusão definitiva com confirmação: o convite some, o evento guarda quem excluiu e quando. Dá para desfazer logo depois."
      acao={
        <SePode ferramenta="conta.usuario.salvar" mostrarMotivo>
          <Button size="sm" variant="outline" className="rounded-full" onClick={() => (f.reiniciar(), setNovo(true))}>
            <EnvelopeSimpleIcon /> Convidar
          </Button>
        </SePode>
      }
    >
      {convites.length ? (
        <ul className="flex flex-col gap-1.5">
          {convites.map((c) => (
            <li key={c.id} className="bg-raised shadow-cartao flex items-center gap-2 rounded-md px-3 py-2 text-sm" data-convite={c.destino}>
              <span className="min-w-0 flex-1 truncate">{c.destino}</span>
              <Badge variant="outline">{c.setores_propostos?.map((s) => rotuloSetorCurto[s as SetorIntegrante] ?? s).join(', ') || 'sem setor'}</Badge>
              <SePode ferramenta="conta.usuario.salvar">
                <Button
                  size="icon-sm"
                  variant="ghost"
                  className="rounded-full"
                  aria-label={`Excluir convite de ${c.destino}`}
                  onClick={async () => {
                    if (!(await confirmar({ titulo: `Excluir o convite de ${c.destino}?`, descricao: 'O link do convite deixa de funcionar.', acao: 'Excluir convite', perigo: true }))) return
                    executar(() => repos.convites.excluir(c.id), { sucesso: 'Convite excluído', desfazer: (antes) => repos.convites.reverter(antes) })
                  }}
                >
                  <TrashIcon />
                </Button>
              </SePode>
            </li>
          ))}
        </ul>
      ) : (
        <EstadoVazio icone={EnvelopeSimpleIcon} titulo="Nenhum convite pendente" compacto />
      )}
      <FormularioModal
        aberto={novo}
        onFechar={() => setNovo(false)}
        titulo="Convidar para a equipe"
        formulario={f}
        acao="Enviar convite"
        onSalvar={(v) => {
          const c = repos.convites.criar({ tipo: 'usuario_escritorio', destino: v.email.trim().toLowerCase(), papel_proposto: 'colaborador', setores_propostos: [v.setor], expira_em: new Date(Date.now() + 7 * 864e5).toISOString(), enviado_por: usuario.id })
          void servicos.email.enviar({ para: [c.destino], assunto: 'Convite para a equipe', corpo: 'Crie sua senha pelo link.' })
        }}
      >
        <Campo rotulo="E-mail" erro={f.erro('email')}>
          {(id) => <CampoTexto id={id} tipo="email" valor={f.valores.email} onMudar={(x) => f.definir('email', x)} placeholder="pessoa@escritorio.com.br" />}
        </Campo>
        <Campo rotulo="Setor">{(id) => <CampoEscolha id={id} valor={f.valores.setor} onMudar={(x) => f.definir('setor', x)} opcoes={['fiscal', 'notas', 'dp', 'contabil', 'societario'].map((s) => ({ valor: s, rotulo: rotuloSetorCurto[s as SetorIntegrante] }))} />}</Campo>
      </FormularioModal>
    </Secao>
  )
}

/* ---------- Estados ---------- */

function Estados() {
  const [qual, setQual] = useState<'vazio' | 'carregando' | 'erro'>('vazio')
  return (
    <Secao titulo="Estados" descricao="Vazio, carregando e erro: a mesma cara em toda lista.">
      <div className="bg-sunken flex w-fit rounded-full p-0.5 text-xs">
        {(['vazio', 'carregando', 'erro'] as const).map((q) => (
          <button key={q} type="button" aria-pressed={qual === q} onClick={() => setQual(q)} className={cn('cursor-pointer rounded-full px-3 py-1.5', qual === q ? 'bg-raised shadow-pilula font-medium' : 'text-muted-foreground')}>
            {q}
          </button>
        ))}
      </div>
      <div className="bg-raised/60 rounded-lg">
        {qual === 'vazio' && <EstadoVazio icone={TrayIcon} titulo="Nada por aqui" descricao="Quando houver itens, eles aparecem nesta lista." acao={<Button size="sm" variant="outline" className="rounded-full">Criar o primeiro</Button>} />}
        {qual === 'carregando' && <Carregando linhas={3} className="p-4" />}
        {qual === 'erro' && <EstadoErro descricao="O serviço não respondeu (falha simulada)." onTentar={() => setQual('carregando')} />}
      </div>
    </Secao>
  )
}

/* ---------- Serviços simulados ---------- */

const testes: Record<string, () => Promise<Resultado<unknown>>> = {
  ia: () => servicos.ia.responder({ setor: 'geral', pergunta: 'Quais clientes estão com pendência de documento?' }),
  transcricao: () => servicos.transcricao.transcrever({ nome: 'audio-joao.ogg', duracaoSeg: 21 }),
  ocr: () => servicos.ocr.ler({ nome: 'boleto-distribuidora.pdf' }),
  whatsapp: () => servicos.whatsapp.enviar({ para: '+55 11 97440-1022', texto: 'Sua guia do DAS está pronta.' }),
  email: () => servicos.email.enviar({ para: ['rita@exemplo.com.br'], assunto: 'Guia de outubro', corpo: 'Segue a guia.' }),
  integraContador: () => servicos.integraContador.situacaoFiscal('12.345.678/0001-90'),
  consultasLocais: () => servicos.consultasLocais.estadual('SP', '12.345.678/0001-90'),
  certidoes: () => servicos.certidoes.emitir('federal', '12.345.678/0001-90'),
  nfse: () => servicos.nfse.emitir({ prestador_cnpj: '45.678.901/0001-23', tomador: 'Paciente particular', servico: 'Tratamento odontológico', codigo: '04.12', valor: 850, aliquota_iss: 2 }),
  bancos: () => servicos.bancos.saldo('0001-123456'),
  pix: () => servicos.pix.cobrar({ valor: 1290, descricao: 'Honorários de novembro' }),
  openFinance: () => servicos.openFinance.conectar('Banco do Brasil', '23.456.789/0001-01'),
  assinatura: () => servicos.assinatura.enviar({ documento: 'Contrato de experiência.pdf', signatarios: [{ nome: 'Rafael Moura', email: 'rafael@exemplo.com.br' }] }),
  armazenamento: () => servicos.armazenamento.listar('Metalúrgica Andrade/Societário'),
  djen: () => servicos.djen.intimacoes({ oab: 'SP123456' }),
}

function ServicosSimulados() {
  const [resultados, setResultados] = useState<Record<string, { carregando?: boolean; erro?: string; r?: Resultado<unknown> }>>({})
  const testar = async (id: string) => {
    setResultados((x) => ({ ...x, [id]: { carregando: true } }))
    try {
      const r = await testes[id]()
      setResultados((x) => ({ ...x, [id]: { r } }))
    } catch (e) {
      setResultados((x) => ({ ...x, [id]: { erro: e instanceof Error ? e.message : String(e) } }))
    }
  }
  return (
    <Secao titulo="Serviços simulados" descricao="Tudo o que é pago ou ainda impossível tem uma interface e uma implementação de demonstração em src/servicos. A resposta vem marcada; ligar o serviço real é trocar a implementação.">
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {catalogoServicos.map((s) => {
          const r = resultados[s.id]
          return (
            <li key={s.id} className="bg-raised shadow-cartao flex flex-col gap-2 rounded-lg p-3 text-sm" data-servico={s.id}>
              <div className="flex items-start gap-2">
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{s.nome}</span>
                  <span className="text-muted-foreground block text-xs">{s.descricao}</span>
                </span>
                <Button size="sm" variant="outline" className="rounded-full" onClick={() => void testar(s.id)} disabled={r?.carregando}>
                  Testar
                </Button>
              </div>
              <p className="text-muted-foreground text-xs">
                <span className="font-mono">{s.api}</span> · Para ligar: {s.requisito}
              </p>
              {r?.carregando && <Carregando rotulo="Chamando" className="py-2" />}
              {r?.erro && <p className="text-destructive-text text-xs">{r.erro}</p>}
              {r?.r && (
                <div className="bg-sunken/70 flex flex-col gap-1 rounded-sm p-2">
                  <div className="flex items-center gap-2">
                    {r.r.demonstracao && <SeloDemonstracao fonte={r.r.fonte} />}
                    <span className="text-muted-foreground text-xs">{r.r.latencia_ms} ms</span>
                  </div>
                  <AreaRolagem eixo="ambos" as="pre" className="max-h-32 font-mono text-xs leading-snug whitespace-pre-wrap">{JSON.stringify(r.r.dados, null, 1)}</AreaRolagem>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </Secao>
  )
}

/* ---------- Eventos (R2: todo efeito gera evento) ---------- */

function Eventos() {
  const eventos = useTabela('evento')
  const [busca, setBusca] = useState('')
  // Sem busca: os 12 mais recentes. Com busca: procura em todos os eventos (a janela dos recentes muda
  // o tempo todo com o trabalho simulado dos integrantes, então achar um evento antigo é pela busca).
  const recentes = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return [...eventos]
      .filter((e) => e.visivel_na_linha_do_tempo && (!termo || e.texto.toLowerCase().includes(termo) || e.nome.toLowerCase().includes(termo)))
      .sort((a, b) => b.criado_em.localeCompare(a.criado_em))
      .slice(0, 12)
  }, [eventos, busca])
  return (
    <Secao
      titulo="Eventos"
      descricao="Tudo o que muda gera um evento com autor, data e ferramenta (Fundações 5). É de onde saem a auditoria, a linha do tempo e o timesheet."
      acao={
        <div className="w-60">
          <CampoTexto aria-label="Buscar nos eventos" valor={busca} onMudar={setBusca} placeholder="Buscar em todos os eventos" />
        </div>
      }
    >
      {recentes.length ? (
        <ol className="flex flex-col gap-1 text-sm">
          {recentes.map((e) => (
            <li key={e.id} className="flex items-baseline gap-2">
              <span className="text-muted-foreground w-12 shrink-0 text-xs tabular-nums">{new Date(e.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
              <span className="min-w-0 flex-1">{e.texto}</span>
              <span className="text-muted-foreground hidden shrink-0 font-mono text-xs sm:inline">{e.nome}</span>
            </li>
          ))}
        </ol>
      ) : (
        <EstadoVazio titulo={busca.trim() ? 'Nenhum evento com esse texto' : 'Nenhum evento ainda'} descricao={busca.trim() ? undefined : 'Mude algo acima e o evento aparece aqui.'} compacto />
      )}
    </Secao>
  )
}

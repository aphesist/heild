import { CheckCircleIcon, FileTextIcon, ShieldCheckIcon, SparkleIcon } from '@phosphor-icons/react'
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { definirItemDaRota, hashParaDestino, rotaAtual, useHash } from '@/nucleo/rotas'
import { Campo, CampoArea, CampoEscolha, GavetaFormulario, Interruptor, Segmentado } from '@/components/ui/formulario'
import * as exemplo from '@/dados/exemplo'
import type { PedidoNovaTarefa } from '@/dados/tipos'
import { useAparencia } from '@/hooks/useAparencia'
import type { SetorIntegrante } from '@/theme/tipos'
import type { ContatoCliente } from './clientes'
import { GavetaTrilha } from '@/telas/painel/trilha'
import { FichaClienteGaveta } from '@/telas/painel/ficha-cliente'
import { FichaTarefa } from '@/telas/tarefas/FichaTarefa'
import { NovaTarefa } from '@/telas/tarefas/NovaTarefa'
import { GavetaTarefas } from '@/telas/tarefas/GavetaTarefas'
import { NavegacaoProvider, useLoja, useNavegacao, type Destino } from './loja'
import { useSessao } from './sessao'

/** Cliente pelo nome (os dados de exemplo guardam o nome). */
export const clientePorNome = (nome?: string) => exemplo.clientes.find((c) => c.nome === nome)
/** Integrante padrão de um setor. */
export const integranteDoSetor = (s: SetorIntegrante) => exemplo.integrantes.find((i) => i.setor === s && i.tipo !== 'criado_pelo_usuario')?.id ?? 'i-geral'
/** Quem recebe o assunto: o contato com ele; sem ninguém, o sócio ou titular (04 A1). */
const contatoPorAssunto = (contatos: ContatoCliente[], assunto: string) => contatos.find((x) => x.assuntos.includes(assunto)) ?? contatos.find((x) => x.papel.startsWith('sóci') || x.papel === 'titular')
const assuntoDoSetor = (s: SetorIntegrante) => (s === 'dp' ? 'folha' : s === 'societario' ? 'societario' : s === 'fiscal' ? 'guias' : 'documentos_pendentes')

interface PedidoCobrar {
  cliente: string
  setor: SetorIntegrante
  texto: string
  /** O que se pede (para o título). */
  assunto?: string
  tarefa?: string
  anexo?: string
}
interface PedidoPreparar {
  cliente: string
  setor: SetorIntegrante
  documento: string
  tarefa?: string
}
interface PedidoTransmitir {
  cliente: string
  setor: SetorIntegrante
  documento: string
  orgao: string
  valor?: string
  tarefa?: string
}

interface Fluxos {
  abrirTarefa: (id: string) => void
  cobrar: (p: PedidoCobrar) => void
  enviar: (p: PedidoCobrar & { anexo: string }) => void
  preparar: (p: PedidoPreparar) => void
  transmitir: (p: PedidoTransmitir) => void
  baixar: (nome: string) => void
  /** Gaveta de nova tarefa (contrato C4): atividade, título e origem chegam preenchidos quando vêm de outra tela. */
  novaTarefa: (p: PedidoNovaTarefa) => void
  fichaCliente: (clienteId: string) => void
  /** Trilha de implantação ou de saída do cliente por cima (S04, C6). */
  abrirTrilha: (clienteId: string) => void
  /** Todas as tarefas (S04-T03, "ver todas"), com lista, por responsável, calendário e revisão. */
  verTarefas: (p?: { setor?: SetorIntegrante; cliente?: string }) => void
  /** Ação feita direto, sem gaveta: registra, avisa e devolve o link. */
  feito: (texto: string, destino?: Destino, rotulo?: string) => void
}

const Ctx = createContext<Fluxos | null>(null)

type Aberto =
  | { tipo: 'ficha'; clienteId: string }
  | ({ tipo: 'nova' } & PedidoNovaTarefa)
  | { tipo: 'tarefa'; id: string }
  | { tipo: 'trilha'; clienteId: string }
  | { tipo: 'lista'; setor?: SetorIntegrante; cliente?: string }
  | { tipo: 'cobrar'; p: PedidoCobrar }
  | { tipo: 'preparar'; p: PedidoPreparar }
  | { tipo: 'transmitir'; p: PedidoTransmitir }
  | null

/**
 * Quem chega por link (ou pelo Voltar do navegador) vai para onde o endereço
 * diz. Na primeira vez só abre o item (tarefa, ficha): o módulo e a aba já
 * nasceram do endereço na Plataforma.
 */
function SincronizarRota() {
  const hash = useHash()
  const nav = useNavegacao()
  const primeira = useRef(true)
  useEffect(() => {
    const d = hashParaDestino(hash)
    if (primeira.current) {
      primeira.current = false
      if (d?.tarefa) nav.irPara({ modulo: d.modulo, tarefa: d.tarefa })
      else if (d?.ficha) nav.irPara({ modulo: d.modulo, ficha: d.ficha })
      else if (d?.trilha) nav.irPara({ modulo: d.modulo, trilha: d.trilha })
      return
    }
    // Lê o endereço de agora (no modo estrito o efeito roda de novo com o valor antigo da renderização).
    const atual = window.location.hash
    if (atual !== hash) return
    if (d && atual !== rotaAtual()) nav.irPara(d)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hash])
  return null
}

export function FluxosProvider({ children }: { children: ReactNode }) {
  const loja = useLoja()
  const nav = useNavegacao()
  const [aberto, setAberto] = useState<Aberto>(null)

  const fluxos = useMemo<Fluxos>(
    () => ({
      abrirTarefa: (id) => setAberto({ tipo: 'tarefa', id }),
      cobrar: (p) => setAberto({ tipo: 'cobrar', p }),
      enviar: (p) => setAberto({ tipo: 'cobrar', p }),
      preparar: (p) => setAberto({ tipo: 'preparar', p }),
      transmitir: (p) => setAberto({ tipo: 'transmitir', p }),
      baixar: (nome) => loja.toast(`${nome} baixado.`),
      novaTarefa: (p) => setAberto({ tipo: 'nova', ...p }),
      fichaCliente: (clienteId) => setAberto({ tipo: 'ficha', clienteId }),
      abrirTrilha: (clienteId) => setAberto({ tipo: 'trilha', clienteId }),
      verTarefas: (p) => setAberto({ tipo: 'lista', ...p }),
      feito: (texto, destino, rotulo) => loja.toast(texto, destino, rotulo),
    }),
    [loja],
  )

  // Links para "tarefa" abrem a ficha por cima; o resto segue para o módulo.
  const navInterna = useMemo(
    () => ({
      irPara: (d: Destino) => {
        if (d.tarefa) setAberto({ tipo: 'tarefa', id: d.tarefa })
        else if (d.ficha) setAberto({ tipo: 'ficha', clienteId: d.ficha })
        else if (d.trilha) setAberto({ tipo: 'trilha', clienteId: d.trilha })
        if ((d.tarefa || d.ficha || d.trilha) && !d.aba) return
        nav.irPara(d)
      },
      // A vitrine (o site) passa adiante: os cartões lá dentro continuam sem os botões que levariam para fora.
      vitrine: nav.vitrine,
    }),
    [nav],
  )

  // O item aberto entra no endereço (#/...?tarefa=t18): o link abre a mesma ficha.
  useEffect(
    () => definirItemDaRota({ tarefa: aberto?.tipo === 'tarefa' ? aberto.id : undefined, ficha: aberto?.tipo === 'ficha' ? aberto.clienteId : undefined, trilha: aberto?.tipo === 'trilha' ? aberto.clienteId : undefined }),
    [aberto],
  )

  return (
    <NavegacaoProvider value={navInterna}>
      <Ctx.Provider value={fluxos}>
        <SincronizarRota />
        {children}
        {aberto?.tipo === 'tarefa' && (
          <FichaTarefa
            key={aberto.id}
            id={aberto.id}
            onFechar={() => setAberto(null)}
            onCobrar={(p) => setAberto({ tipo: 'cobrar', p })}
            onFicha={(clienteId) => setAberto({ tipo: 'ficha', clienteId })}
            onTrilha={(clienteId) => setAberto({ tipo: 'trilha', clienteId })}
            onAbrirTarefa={(id) => setAberto({ tipo: 'tarefa', id })}
          />
        )}
        {aberto?.tipo === 'lista' && <GavetaTarefas setor={aberto.setor} cliente={aberto.cliente} onFechar={() => setAberto(null)} />}
        {aberto?.tipo === 'trilha' && <GavetaTrilha clienteId={aberto.clienteId} onFechar={() => setAberto(null)} />}
        {aberto?.tipo === 'ficha' && <GavetaFichaCliente clienteId={aberto.clienteId} onFechar={() => setAberto(null)} />}
        {aberto?.tipo === 'nova' && <NovaTarefa p={aberto} onFechar={() => setAberto(null)} onCriada={(id) => setAberto({ tipo: 'tarefa', id })} />}
        {aberto?.tipo === 'cobrar' && <GavetaCobrar p={aberto.p} onFechar={() => setAberto(null)} />}
        {aberto?.tipo === 'preparar' && <GavetaPreparar p={aberto.p} onFechar={() => setAberto(null)} />}
        {aberto?.tipo === 'transmitir' && <GavetaTransmitir p={aberto.p} onFechar={() => setAberto(null)} />}
      </Ctx.Provider>
    </NavegacaoProvider>
  )
}

/** Fluxos compartilhados. Fora do provider, abre nada (stories isoladas). */
export function useFluxos(): Fluxos {
  const f = useContext(Ctx)
  if (f) return f
  const nada = () => {}
  return { abrirTarefa: nada, cobrar: nada, enviar: nada, preparar: nada, transmitir: nada, baixar: nada, novaTarefa: nada, fichaCliente: nada, abrirTrilha: nada, verTarefas: nada, feito: nada }
}

/** Acha (ou abre) a conversa do cliente naquele setor e devolve o id. */
export function useConversaDe() {
  const loja = useLoja()
  return (clienteNome: string, setor: SetorIntegrante, contatoNome?: string) => {
    const c = clientePorNome(clienteNome)
    const fixa = loja.fichaDe(c?.id)?.conversas[setor]
    if (fixa) return fixa
    const existente = loja.conversas.find((x) => x.cliente === clienteNome && x.setor === setor)
    if (existente) return existente.id
    const contato = contatoPorAssunto(loja.fichaDe(c?.id)?.contatos ?? [], assuntoDoSetor(setor))
    const id = `cvn-${c?.id ?? 'x'}-${setor}`
    loja.novaConversa({
      id,
      clienteId: c?.id,
      cliente: clienteNome,
      pessoa: { nome: contatoNome ?? contato?.nome ?? 'Contato', papel: contato?.papel ?? 'contato', contato: contato?.whatsapp ?? contato?.email ?? 'app' },
      setor,
      status: 'aguardando_cliente',
      canal: contato?.whatsapp ? 'whatsapp' : contato?.app ? 'app' : 'email',
      prazoMin: null,
      prazoTexto: 'aguardando cliente',
      etiquetas: [],
      previa: '',
      janelaAberta: false,
      itens: [{ tipo: 'dia', texto: 'Hoje' }],
    })
    return id
  }
}

/** Cobrar ou enviar ao cliente: vai para a conversa do CRM do setor, pelo contato com o assunto. */
function GavetaCobrar({ p, onFechar }: { p: PedidoCobrar; onFechar: () => void }) {
  const loja = useLoja()
  const { usuario } = useSessao()
  const conversaDe = useConversaDe()
  const c = clientePorNome(p.cliente)
  const contatos = loja.fichaDe(c?.id)?.contatos ?? []
  const sugerido = contatoPorAssunto(contatos, assuntoDoSetor(p.setor))
  const [contato, setContato] = useState(sugerido?.nome ?? contatos[0]?.nome ?? '')
  const atual = contatos.find((x) => x.nome === contato)
  const [canal, setCanal] = useState<'whatsapp' | 'email' | 'app'>(atual?.whatsapp ? 'whatsapp' : atual?.app ? 'app' : 'email')
  const primeiro = contato.split(' ')[contato.startsWith('Dra.') ? 1 : 0]
  const [texto, setTexto] = useState(
    p.texto ||
      (p.anexo ? `Oi, ${primeiro}! Segue ${p.anexo}. Qualquer dúvida, é só responder aqui.` : `Oi, ${primeiro}! Para seguirmos com ${p.assunto ?? 'a competência'}, precisamos de um retorno seu. Consegue nos enviar ainda esta semana?`),
  )
  return (
    <GavetaFormulario
      aberta
      onFechar={onFechar}
      titulo={p.anexo ? `Enviar a ${p.cliente}` : `Cobrar ${p.cliente}`}
      descricao="Vai pela conversa do setor no CRM, com o seu nome. A resposta do cliente volta para lá."
      acao="Enviar"
      acaoDesabilitada={!texto.trim()}
      onAcao={() => {
        const conversa = conversaDe(p.cliente, p.setor, contato)
        loja.mensagemCrm(conversa, { tipo: 'mensagem', de: 'atendente', autor: usuario.nome, canal, texto: texto.trim(), entrega: 'enviada', anexos: p.anexo ? [{ nome: p.anexo, tipo: 'pdf' }] : undefined })
        loja.statusConversa(conversa, 'aguardando_cliente')
        if (p.tarefa) loja.atualizarTarefa(p.tarefa, { status: 'aguardando_cliente' })
        loja.registrar(usuario.nome, `${p.anexo ? 'Enviou' : 'Cobrou'} ${contato} (${p.cliente})${p.assunto ? `: ${p.assunto}` : ''}`)
        loja.toast(`Enviado a ${contato} pelo ${canal === 'whatsapp' ? 'WhatsApp' : canal === 'email' ? 'e-mail' : 'app'}.`, { modulo: 'crm', aba: 'conversas', conversa }, 'Ver conversa')
        onFechar()
      }}
    >
      <Campo rotulo="Para" ajuda={sugerido ? `Sugerido: ${sugerido.nome} recebe o assunto “${assuntoDoSetor(p.setor)}”.` : undefined}>
        {(id) => <CampoEscolha id={id} valor={contato} onMudar={setContato} opcoes={contatos.map((x) => ({ valor: x.nome, rotulo: `${x.nome} · ${x.papel}` }))} />}
      </Campo>
      <Campo rotulo="Canal">
        {() => (
          <Segmentado
            rotulo="Canal"
            valor={canal}
            onMudar={setCanal}
            opcoes={[
              ...(atual?.whatsapp ? [{ valor: 'whatsapp' as const, rotulo: 'WhatsApp' }] : []),
              ...(atual?.email ? [{ valor: 'email' as const, rotulo: 'E-mail' }] : []),
              ...(atual?.app ? [{ valor: 'app' as const, rotulo: 'App' }] : []),
            ]}
          />
        )}
      </Campo>
      {p.anexo && (
        <p className="bg-sunken/60 flex items-center gap-2 rounded-[14px] px-3 py-2 text-sm">
          <FileTextIcon className="size-4" /> {p.anexo}
        </p>
      )}
      <Campo rotulo="Mensagem">{(id) => <CampoArea id={id} linhas={5} valor={texto} onMudar={setTexto} />}</Campo>
    </GavetaFormulario>
  )
}

/** Pedir ao integrante que prepare o documento: o resultado chega como cartão no chat dele. */
function GavetaPreparar({ p, onFechar }: { p: PedidoPreparar; onFechar: () => void }) {
  const loja = useLoja()
  const { usuario } = useSessao()
  const aparencia = useAparencia()
  const tom = aparencia({ setor: p.setor })
  const [instrucoes, setInstrucoes] = useState('')
  const [estado, setEstado] = useState<'pedir' | 'preparando'>('pedir')
  const integrante = integranteDoSetor(p.setor)
  return (
    <GavetaFormulario
      aberta
      onFechar={onFechar}
      titulo={`Pedir ao ${tom.nome}`}
      descricao={`${p.documento} · ${p.cliente}. O integrante prepara; enviar, transmitir e assinar continuam com você.`}
      acao={estado === 'preparando' ? 'Preparando…' : 'Pedir'}
      acaoDesabilitada={estado === 'preparando'}
      onAcao={() => {
        setEstado('preparando')
        setTimeout(() => {
          loja.mensagemTime(integrante, { autor: { tipo: 'usuario', nome: usuario.nome }, texto: `Prepare ${p.documento.toLowerCase()} de ${p.cliente}.${instrucoes ? ` ${instrucoes}` : ''}` })
          loja.mensagemTime(integrante, {
            autor: { tipo: 'integrante', setor: p.setor },
            texto: `Pronto. Preparei ${p.documento.toLowerCase()} de ${p.cliente} com os dados do cadastro e da competência. Revise antes de enviar.`,
            cartoes: [{ tipo: 'documento', id: `doc-${Date.now()}`, nome: `${p.documento} · ${p.cliente}.pdf`, especie: 'documento', cliente: p.cliente, competencia: '11/2026' }],
          })
          if (p.tarefa) loja.atualizarTarefa(p.tarefa, { status: 'em_andamento', cartaoPendente: true })
          loja.registrar(`integrante ${tom.nome}`, `Preparou ${p.documento} (${p.cliente}) a pedido de ${usuario.nome}`)
          loja.toast(`Preparou ${p.documento.toLowerCase()} de ${p.cliente}. Revise antes de enviar.`, { modulo: 'inicio', aba: 'time', integrante, cliente: clientePorNome(p.cliente)?.id }, 'Revisar', { tipo: 'integrante', setor: p.setor, estado: 'precisa_de_voce' })
          onFechar()
        }, 1100)
      }}
    >
      <Campo rotulo="Instruções (opcional)" ajuda="Vão junto com o pedido, no chat do integrante.">
        {(id) => <CampoArea id={id} linhas={3} valor={instrucoes} onMudar={setInstrucoes} placeholder="Ex.: usar a convenção de 2026" />}
      </Campo>
      {estado === 'preparando' && (
        <p className="text-muted-foreground flex items-center gap-2 text-sm">
          <SparkleIcon className="size-4 animate-pulse" /> {tom.nome} está preparando…
        </p>
      )}
    </GavetaFormulario>
  )
}

/** Transmitir ou entregar a um órgão: sempre de uma pessoa, com o certificado do escritório. */
function GavetaTransmitir({ p, onFechar }: { p: PedidoTransmitir; onFechar: () => void }) {
  const loja = useLoja()
  const { usuario } = useSessao()
  const conversaDe = useConversaDe()
  const [conferi, setConferi] = useState(false)
  const [enviarCliente, setEnviarCliente] = useState(true)
  return (
    <GavetaFormulario
      aberta
      onFechar={onFechar}
      titulo={`Transmitir ${p.documento}`}
      descricao={`${p.cliente} · ${p.orgao}. Transmitir é sempre de uma pessoa: o integrante prepara e confere, você envia.`}
      acao="Transmitir"
      acaoDesabilitada={!conferi}
      onAcao={() => {
        loja.registrar(usuario.nome, `Transmitiu ${p.documento} de ${p.cliente} (${p.orgao})`)
        if (p.tarefa) loja.atualizarTarefa(p.tarefa, { status: 'concluida', cartaoPendente: false, atrasada: false })
        let conversa: string | undefined
        if (enviarCliente) {
          conversa = conversaDe(p.cliente, p.setor)
          loja.mensagemCrm(conversa, {
            tipo: 'mensagem',
            de: 'atendente',
            autor: usuario.nome,
            canal: 'whatsapp',
            texto: `${p.documento} transmitido hoje.${p.valor ? ` A guia de ${p.valor} segue anexa.` : ' O recibo segue anexo.'}`,
            entrega: 'enviada',
            anexos: [{ nome: `Recibo ${p.documento}.pdf`, tipo: 'pdf' }],
          })
        }
        loja.toast(`${p.documento} de ${p.cliente} transmitido. Recibo salvo na pasta do cliente.`, conversa ? { modulo: 'crm', aba: 'conversas', conversa } : undefined, conversa ? 'Ver o envio ao cliente' : undefined)
        onFechar()
      }}
    >
      <dl className="bg-sunken/60 grid grid-cols-2 gap-2 rounded-[14px] p-3 text-sm">
        <div>
          <dt className="text-muted-foreground text-xs">Órgão</dt>
          <dd>{p.orgao}</dd>
        </div>
        {p.valor && (
          <div>
            <dt className="text-muted-foreground text-xs">Valor</dt>
            <dd className="tabular-nums">{p.valor}</dd>
          </div>
        )}
        <div>
          <dt className="text-muted-foreground text-xs">Certificado</dt>
          <dd className="flex items-center gap-1">
            <ShieldCheckIcon className="text-success size-4" /> e-CNPJ do escritório (procuração)
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-xs">Conferência do integrante</dt>
          <dd className="flex items-center gap-1">
            <CheckCircleIcon className="text-success size-4" weight="fill" /> sem divergência
          </dd>
        </div>
      </dl>
      <Interruptor ligado={conferi} onMudar={setConferi} rotulo="Conferi os valores" detalhe="Fica no evento com o seu nome." />
      <Interruptor ligado={enviarCliente} onMudar={setEnviarCliente} rotulo="Enviar recibo e guia ao cliente" detalhe="Pela conversa do setor, ao contato com o assunto." />
    </GavetaFormulario>
  )
}


/**
 * Ficha do cliente (S02-T05): contatos com papel por serviço e assuntos,
 * alçada (proposta), responsáveis, serviços extras, entrega e malote, resumo
 * da relação e histórico. A gaveta mora em `telas/painel/ficha-cliente.tsx`.
 */
function GavetaFichaCliente({ clienteId, onFechar }: { clienteId: string; onFechar: () => void }) {
  return <FichaClienteGaveta clienteId={clienteId} onFechar={onFechar} />
}

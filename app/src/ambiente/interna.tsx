import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { extrasDe, falasInternas, pareceUmPedido, type Anexo, type Citacao, type ExtrasMensagem, type Mencao } from '@/dados/interna'
import type { ConversaInterna, Id, MensagemInterna, Participacao, Tarefa } from '@/nucleo/modelo/entidades'
import type { Contexto } from '@/nucleo/permissoes'
import { useTabela } from '@/nucleo/react'
import { agora, registrar, repos } from '@/nucleo/repositorios'
import { servicos } from '@/servicos'
import { rotuloSetorCurto } from '@/nucleo/permissoes'
import type { SetorIntegrante } from '@/theme/tipos'
import { useLoja, usePersistente } from './loja'
import { useSessao } from './sessao'

/**
 * Comunicação interna (subplano 11), o que as outras sessões usam (contrato C8
 * revisto pela Coordenação em DECISOES.md):
 *
 * - `abrirChat({ aba, conversa })`: abre a gaveta do botão Chat de qualquer
 *   lugar (menu inferior do celular, sino, cartão de menção, busca global).
 * - `useEstadoChat()`: a gaveta lê daqui se está aberta, em que aba e em que
 *   conversa interna.
 * - `useNaoLidasInternas()`: total de não lidas da aba Equipe e por conversa,
 *   para o contador do botão Chat.
 *
 * E o que as telas da S05 usam: `useAcoesInternas()` (todas as escritas, pelos
 * repositórios, com as regras do 11: nada se apaga, editar guarda versão,
 * entrada e saída registradas, integrante só por menção), a presença, o
 * "digitando" dos integrantes e as preferências de cada pessoa.
 *
 * Não há item na barra lateral: a tela cheia tem rota própria (`#/interna`).
 */

export type AbaChat = 'equipe' | 'integrantes'

export interface PedidoChat {
  /** Aba da gaveta; sem ela, abre na última usada. */
  aba?: AbaChat
  /** Conversa interna a abrir (só vale na aba Equipe). */
  conversa?: Id
}

const EVENTO = 'heild:abrir-chat'

/** Abre a gaveta do Chat de qualquer lugar. */
export const abrirChat = (pedido: PedidoChat = {}) => window.dispatchEvent(new CustomEvent<PedidoChat>(EVENTO, { detail: pedido }))

/** Estado da gaveta do Chat: aberta, aba e conversa interna aberta. */
export function useEstadoChat(abaInicial: AbaChat = 'integrantes') {
  const [aberto, setAberto] = useState(false)
  const [aba, setAba] = useState<AbaChat>(abaInicial)
  const [conversa, setConversa] = useState<Id | null>(null)
  useEffect(() => {
    const ouvir = (e: Event) => {
      const p = (e as CustomEvent<PedidoChat>).detail ?? {}
      if (p.aba) setAba(p.aba)
      if (p.conversa) {
        setAba('equipe')
        setConversa(p.conversa)
      }
      setAberto(true)
    }
    window.addEventListener(EVENTO, ouvir)
    return () => window.removeEventListener(EVENTO, ouvir)
  }, [])
  return { aberto, setAberto, aba, setAba, conversa, setConversa }
}

/* ---------- Leitura: lidas, conversas da pessoa, não lidas ---------- */

/** Até quando cada pessoa leu cada conversa (data ISO da última mensagem vista). Por pessoa, guardado no escritório. */
export function useLidas() {
  const { usuario } = useSessao()
  const [lidas, setLidas] = usePersistente<Record<Id, string>>(`s05:interna:lidas:${usuario.id}`, {})
  // O setter do usePersistente muda a cada render; a ref mantém marcarLida estável (efeitos não entram em laço).
  const ref = useRef({ lidas, setLidas })
  ref.current = { lidas, setLidas }
  const marcarLida = useCallback((conversaId: Id, ate = new Date().toISOString()) => {
    const atual = ref.current.lidas[conversaId]
    if (atual && atual >= ate) return
    ref.current.setLidas((x) => ({ ...x, [conversaId]: ate }))
  }, [])
  const marcarNaoLida = useCallback((conversaId: Id) => ref.current.setLidas((x) => ({ ...x, [conversaId]: '2000-01-01T00:00:00.000Z' })), [])
  return { lidas, marcarLida, marcarNaoLida }
}

/** "Lido até" de todas as pessoas (para o "visto por" de grupos e canais). */
export function useLidasDeTodos(): Record<Id, Record<Id, string>> {
  const loja = useLoja()
  return useMemo(() => {
    const r: Record<Id, Record<Id, string>> = {}
    for (const [k, v] of Object.entries(loja.estado.memoria)) if (k.startsWith('s05:interna:lidas:')) r[k.slice('s05:interna:lidas:'.length)] = v as Record<Id, string>
    return r
  }, [loja.estado.memoria])
}

/** Conversas pessoais abertas em investigação pelo Administrador (11, 5): leitura com motivo registrado. */
export interface Investigacao {
  conversa: Id
  por: Id
  por_nome: string
  motivo: string
  em: string
}
export function useInvestigacoes() {
  return usePersistente<Investigacao[]>('s05:interna:investigacoes', [])
}

/** Conversas internas em que a pessoa participa agora (saída registrada tira o acesso; o histórico fica). */
export function useMinhasConversasInternas() {
  const { usuario } = useSessao()
  const conversas = useTabela('conversa_interna')
  const participacoes = useTabela('participacao')
  return useMemo(() => {
    const minhas = new Set(participacoes.filter((p) => p.usuario_id === usuario.id && !p.saiu_em).map((p) => p.conversa_interna_id))
    return conversas.filter((c) => !c.arquivado_em && minhas.has(c.id))
  }, [conversas, participacoes, usuario.id])
}

/** Preferências da pessoa: conversas silenciadas e horário de silêncio (11, 3). */
export function usePreferenciasInternas() {
  const { usuario } = useSessao()
  const [silenciadas, setSilenciadas] = usePersistente<Id[]>(`s05:interna:silenciadas:${usuario.id}`, [])
  const [silencio, setSilencio] = usePersistente<{ ligado: boolean; de: string; ate: string }>(`s05:interna:silencio:${usuario.id}`, { ligado: false, de: '20:00', ate: '08:00' })
  const [presenca, setPresenca] = usePersistente<'disponivel' | 'ausente'>(`s05:interna:presenca:${usuario.id}`, 'disponivel')
  const [aceite, setAceite] = usePersistente<string | null>(`s05:interna:aceite:${usuario.id}`, null)
  const alternarSilencio = (id: Id) => setSilenciadas((x) => (x.includes(id) ? x.filter((y) => y !== id) : [...x, id]))
  return { silenciadas, alternarSilencio, silencio, setSilencio, presenca, setPresenca, aceite, setAceite }
}

/** Não lidas da comunicação interna (aba Equipe do Chat): total e por conversa. Conversa silenciada não soma no total. */
export function useNaoLidasInternas(): { total: number; porConversa: Record<Id, number> } {
  const { usuario } = useSessao()
  const conversas = useMinhasConversasInternas()
  const mensagens = useTabela('mensagem_interna')
  const { lidas } = useLidas()
  const [silenciadas] = usePersistente<Id[]>(`s05:interna:silenciadas:${usuario.id}`, [])
  return useMemo(() => {
    const porConversa: Record<Id, number> = {}
    const ids = new Set(conversas.map((c) => c.id))
    for (const m of mensagens) {
      if (!ids.has(m.conversa_interna_id) || m.autor_id === usuario.id) continue
      const lida = lidas[m.conversa_interna_id]
      if (lida && m.criado_em <= lida) continue
      porConversa[m.conversa_interna_id] = (porConversa[m.conversa_interna_id] ?? 0) + 1
    }
    const total = Object.entries(porConversa).reduce((s, [id, n]) => s + (silenciadas.includes(id) ? 0 : n), 0)
    return { total, porConversa }
  }, [conversas, mensagens, lidas, silenciadas, usuario.id])
}

/* ---------- Presença (11, 3: disponível, ausente, em espera) ---------- */

export type Presenca = 'disponivel' | 'ausente' | 'espera' | 'desligada'
export const rotuloPresenca: Record<Presenca, string> = { disponivel: 'disponível', ausente: 'ausente', espera: 'em espera', desligada: 'sem acesso' }
/** Presença dos colegas na demonstração (no produto, do modo de espera e da conexão). */
const presencaDemonstracao: Record<Id, Presenca> = { u2: 'disponivel', u3: 'ausente', u4: 'espera', u5: 'disponivel', u7: 'disponivel', u8: 'ausente', u9: 'disponivel' }
export function usePresenca() {
  const { usuario, contas } = useSessao()
  const { presenca } = usePreferenciasInternas()
  return useCallback(
    (id: Id): Presenca => {
      const c = contas.find((u) => u.id === id)
      if (c && c.situacao !== 'ativo') return 'desligada'
      if (id === usuario.id) return presenca
      return presencaDemonstracao[id] ?? 'disponivel'
    },
    [contas, usuario.id, presenca],
  )
}

/* ---------- "Digitando" dos integrantes (o trabalho simulado) ---------- */

let digitando: Record<Id, { setor: string; nome: string } | undefined> = {}
const ouvintesDigitando = new Set<() => void>()
function definirDigitando(conversa: Id, quem: { setor: string; nome: string } | undefined) {
  digitando = { ...digitando, [conversa]: quem }
  ouvintesDigitando.forEach((f) => f())
}
export function useDigitando(conversa: Id | null | undefined) {
  const todos = useSyncExternalStore(
    (f) => {
      ouvintesDigitando.add(f)
      return () => ouvintesDigitando.delete(f)
    },
    () => digitando,
  )
  return conversa ? todos[conversa] : undefined
}

/* ---------- Integrantes por menção: roteiros que leem os dados do escritório ---------- */

const hojeIso = () => new Date().toISOString().slice(0, 10)
const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`

function tarefasAbertas(setor?: string): Tarefa[] {
  return repos.tarefas.listar((t) => (!setor || setor === 'geral' || t.setor_id === setor) && t.status !== 'concluida' && t.status !== 'cancelada')
}
const nomeCliente = (id?: Id | null) => (id ? (repos.clientes.obter(id)?.nome ?? 'cliente') : 'escritório')

/** Resposta do integrante chamado por menção (só leitura e resposta, 11, 4). */
export function respostaDoIntegrante(setor: string, pergunta: string): string {
  const p = pergunta.toLowerCase()
  const abertas = tarefasAbertas(setor)
  const doSetor = setor === 'geral' ? 'do escritório' : `do ${rotuloSetorCurto[setor as SetorIntegrante] ?? setor}`
  if (/extrato|mandou|mandaram|enviou|enviaram|faltando|falta/.test(p)) {
    const esperando = abertas.filter((t) => t.status === 'aguardando_cliente')
    if (!esperando.length) return `Olhei as tarefas ${doSetor}: nenhuma está esperando o cliente agora. Tudo o que dependia de documento já chegou.`
    const nomes = [...new Set(esperando.map((t) => nomeCliente(t.cliente_id)))]
    return `Olhei as tarefas ${doSetor}: ${plural(nomes.length, 'cliente ainda não mandou', 'clientes ainda não mandaram')} o que falta: ${nomes.slice(0, 5).join(', ')}${nomes.length > 5 ? ` e mais ${nomes.length - 5}` : ''}. Quer que eu prepare a cobrança pela régua? Quem envia é uma pessoa, no CRM.`
  }
  if (/atras|venc|prazo|hoje|semana/.test(p)) {
    const atrasadas = abertas.filter((t) => t.extras?.atrasada || (t.prazo_legal && t.prazo_legal < hojeIso()))
    const lista = (atrasadas.length ? atrasadas : abertas).slice(0, 4)
    if (!lista.length) return `Não há tarefa aberta ${doSetor}. Tudo em dia.`
    return `${atrasadas.length ? `${plural(atrasadas.length, 'tarefa atrasada', 'tarefas atrasadas')}` : `Nenhuma atrasada; as próximas`} ${doSetor}: ${lista.map((t) => `${t.titulo} (${nomeCliente(t.cliente_id)})`).join('; ')}. Os detalhes estão no Painel.`
  }
  if (/cart[aã]o|aprova/.test(p)) {
    const pendentes = repos.cartoes.listar((c) => c.status === 'pendente').length
    return pendentes ? `Há ${plural(pendentes, 'cartão esperando', 'cartões esperando')} aprovação. Quem decide é uma pessoa; eu só preparo.` : 'Nenhum cartão esperando aprovação agora.'
  }
  return `Vi a pergunta. Hoje ${doSetor} há ${plural(abertas.length, 'tarefa aberta', 'tarefas abertas')}, ${plural(abertas.filter((t) => t.status === 'aguardando_cliente').length, 'esperando o cliente', 'esperando o cliente')}. Se for algo para fazer, posso propor uma tarefa; para falar com o cliente, use o CRM (por aqui eu não escrevo a cliente).`
}

/** Resumo da manhã do canal do setor (gatilho que o escritório liga, 11, 4 e P6). */
export function resumoDaManha(setor: string): string {
  const abertas = tarefasAbertas(setor)
  const hoje = abertas.filter((t) => t.prazo_interno === hojeIso() || t.prazo_legal === hojeIso())
  const atrasadas = abertas.filter((t) => t.extras?.atrasada)
  const cartoes = repos.cartoes.listar((c) => c.status === 'pendente').length
  return [
    `Bom dia! Resumo da manhã do ${rotuloSetorCurto[setor as SetorIntegrante] ?? setor}:`,
    `• ${hoje.length ? `${plural(hoje.length, 'vencimento hoje', 'vencimentos hoje')}: ${hoje.slice(0, 3).map((t) => t.titulo).join(', ')}` : 'nenhum vencimento interno hoje'};`,
    `• ${plural(atrasadas.length, 'tarefa atrasada', 'tarefas atrasadas')}${atrasadas.length ? ` (${atrasadas.slice(0, 3).map((t) => `${t.titulo}, ${nomeCliente(t.cliente_id)}`).join('; ')})` : ''};`,
    `• ${plural(cartoes, 'cartão esperando aprovação', 'cartões esperando aprovação')}.`,
  ].join('\n')
}

/** Resumo de um fio longo para quem chegou depois (faz sozinho, quando pedido). */
export function resumoDoFio(raiz: MensagemInterna, respostas: MensagemInterna[], nome: (id: Id) => string): string {
  const pessoas = [...new Set([raiz, ...respostas].map((m) => nome(m.autor_id)))]
  const ultima = respostas.at(-1)
  const tarefa = [raiz, ...respostas].find((m) => extrasDe(m).tarefa_id)
  return `${nome(raiz.autor_id)} começou: "${raiz.corpo.slice(0, 90)}${raiz.corpo.length > 90 ? '…' : ''}". ${plural(respostas.length, 'resposta', 'respostas')} de ${pessoas.join(', ')}. ${ultima ? `Por último, ${nome(ultima.autor_id)}: "${ultima.corpo.slice(0, 80)}${ultima.corpo.length > 80 ? '…' : ''}".` : ''}${tarefa ? ` Já virou tarefa: ${extrasDe(tarefa).tarefa_titulo}.` : ' Ainda não virou tarefa.'}`
}

/* ---------- Escritas ---------- */

/** Linha pelo id ou erro com frase pronta (o `exigir` do repositório é interno a ele). */
function exigir<T>(r: { obter: (id: Id) => T | undefined }, id: Id): T {
  const l = r.obter(id)
  if (!l) throw new Error('Esta conversa ou mensagem não existe mais neste escritório.')
  return l
}

/** Nome do integrante (tema) por setor; as telas passam o do tema, aqui cai no cadastro. */
function integranteDoSetor(setor: string) {
  const i = repos.integrantes.listar((x) => x.setor === setor && x.tipo !== 'criado_pelo_usuario')[0]
  return { id: i?.id ?? `i-${setor}`, nome: i?.nome_exibido ?? (setor === 'geral' ? 'Assistente' : rotuloSetorCurto[setor as SetorIntegrante] ?? setor) }
}

export interface DadosEnvio {
  corpo: string
  mencoes?: Mencao[]
  citacoes?: Citacao[]
  anexos?: File[]
  audio?: { duracao_seg: number }
  respondeA?: Id | null
}

export function useAcoesInternas() {
  const { usuario, perfil, contas } = useSessao()
  const loja = useLoja()
  const ref = useRef({ usuario, perfil, contas, loja })
  ref.current = { usuario, perfil, contas, loja }

  return useMemo(() => {
    const nomeDe = (id: Id) => ref.current.contas.find((u) => u.id === id)?.nome ?? integranteDoSetor(id.replace(/^i-/, '')).nome
    const participantes = (conversaId: Id) => repos.participacoes.listar((p) => p.conversa_interna_id === conversaId && !p.saiu_em).map((p) => p.usuario_id)
    const sistema = (conversaId: Id, corpo: string) => repos.mensagensInternas.criar({ conversa_interna_id: conversaId, autor_id: ref.current.usuario.id, corpo, versoes: [], extras: { sistema: true } satisfies ExtrasMensagem })
    const comoIntegrante = (setor: string): Contexto => {
      const i = integranteDoSetor(setor)
      return { ator: { tipo: 'integrante', id: i.id, nome: i.nome, ...(ref.current.perfil ? { dono: ref.current.perfil } : {}) }, origem: 'evento' }
    }
    const postarComoIntegrante = (conversaId: Id, setor: string, corpo: string, extras: ExtrasMensagem, respondeA: Id | null) => {
      const i = integranteDoSetor(setor)
      return repos.mensagensInternas.criar(
        { conversa_interna_id: conversaId, autor_id: i.id, corpo, responde_a_id: respondeA, versoes: [], extras: { ...extras, ia: { setor, nome: i.nome, demonstracao: true } } as Record<string, unknown> },
        { ctx: comoIntegrante(setor), texto: `${i.nome} respondeu na conversa interna` },
      )
    }
    /** O integrante pensa, mostra "digitando" e responde no fio (marcado como IA). */
    const integranteResponde = (conversaId: Id, setor: string, gerar: () => { corpo: string; extras?: ExtrasMensagem }, respondeA: Id | null, atraso = 1600) => {
      const i = integranteDoSetor(setor)
      window.setTimeout(() => definirDigitando(conversaId, { setor, nome: i.nome }), 400)
      window.setTimeout(() => {
        definirDigitando(conversaId, undefined)
        try {
          const r = gerar()
          postarComoIntegrante(conversaId, setor, r.corpo, r.extras ?? {}, respondeA)
        } catch (e) {
          ref.current.loja.toastErro(e instanceof Error ? e.message : String(e))
        }
      }, atraso)
    }

    const acoes = {
      nomeDe,
      participantes,

      /** Conversa pessoal: reabre a que já existe entre os dois (11, 2). */
      pessoal(outroId: Id): Id {
        const eu = ref.current.usuario.id
        const existente = repos.conversasInternas.listar((c) => c.tipo === 'pessoal').find((c) => {
          const ps = repos.participacoes.listar((p) => p.conversa_interna_id === c.id).map((p) => p.usuario_id)
          return ps.includes(eu) && ps.includes(outroId) && ps.length === 2
        })
        if (existente) {
          // Quem saiu de uma pessoal volta ao abrir de novo (o histórico continuou lá).
          for (const p of repos.participacoes.listar((x) => x.conversa_interna_id === existente.id && !!x.saiu_em && x.usuario_id === eu)) repos.participacoes.atualizar(p.id, { saiu_em: null })
          return existente.id
        }
        const c = repos.conversasInternas.criar({ tipo: 'pessoal', criada_por: eu }, { texto: `${nomeDe(eu)} começou uma conversa pessoal` })
        const quando = agora()
        for (const u of [eu, outroId]) repos.participacoes.criar({ conversa_interna_id: c.id, usuario_id: u, entrou_em: quando })
        return c.id
      },

      /** Grupo: qualquer pessoa cria; entrada de cada um fica registrada (11, 2 e P3). */
      grupo(nome: string, ids: Id[]): Id {
        const eu = ref.current.usuario.id
        if (!nome.trim()) throw new Error('Dê um nome ao grupo.')
        const todos = [...new Set([eu, ...ids])]
        if (todos.length < 2) throw new Error('Escolha pelo menos um colega.')
        const c = repos.conversasInternas.criar({ tipo: 'grupo', nome: nome.trim(), criada_por: eu }, { texto: `${nomeDe(eu)} criou o grupo ${nome.trim()}` })
        const quando = agora()
        for (const u of todos) repos.participacoes.criar({ conversa_interna_id: c.id, usuario_id: u, entrou_em: quando })
        sistema(c.id, `${nomeDe(eu)} criou o grupo com ${todos.filter((u) => u !== eu).map(nomeDe).join(', ')}`)
        for (const u of todos.filter((x) => x !== eu)) ref.current.loja.avisar({ para: [u], titulo: `${nomeDe(eu)} pôs você no grupo ${nome.trim()}`, tipo: 'conversa', destino: { modulo: 'interna', aba: 'conversas', conversaInterna: c.id } })
        return c.id
      },

      renomear(conversaId: Id, nome: string) {
        const c = exigir(repos.conversasInternas, conversaId)
        if (!nome.trim() || nome.trim() === c.nome) return
        repos.conversasInternas.atualizar(conversaId, { nome: nome.trim() })
        sistema(conversaId, `${nomeDe(ref.current.usuario.id)} renomeou o grupo de "${c.nome}" para "${nome.trim()}"`)
      },

      adicionar(conversaId: Id, ids: Id[]) {
        const ja = participantes(conversaId)
        const novos = ids.filter((u) => !ja.includes(u))
        if (!novos.length) return
        const quando = agora()
        for (const u of novos) repos.participacoes.criar({ conversa_interna_id: conversaId, usuario_id: u, entrou_em: quando })
        sistema(conversaId, `${nomeDe(ref.current.usuario.id)} adicionou ${novos.map(nomeDe).join(', ')}`)
      },

      /** Sair do grupo: a participação ganha a data de saída; nada some (11, 2). */
      sair(conversaId: Id) {
        const eu = ref.current.usuario.id
        const p = repos.participacoes.listar((x) => x.conversa_interna_id === conversaId && x.usuario_id === eu && !x.saiu_em)[0]
        if (!p) return
        sistema(conversaId, `${nomeDe(eu)} saiu do grupo`)
        repos.participacoes.atualizar(p.id, { saiu_em: agora() })
      },

      /** Envia a mensagem com menções, citações, anexos e áudio, e dispara o que vem depois (avisos, integrantes, proposta de tarefa). */
      async enviar(conversaId: Id, d: DadosEnvio): Promise<MensagemInterna | undefined> {
        const { usuario, loja } = ref.current
        const conversa = exigir(repos.conversasInternas, conversaId)
        const mencoes = (d.mencoes ?? []).filter((m) => d.corpo.includes(`@${m.rotulo}`))
        const citacoes = (d.citacoes ?? []).filter((c) => d.corpo.includes(c.rotulo))
        // Anexos vão a Arquivos com a origem "comunicação interna" e não se apagam (11, 3).
        const anexos: Anexo[] = []
        for (const f of d.anexos ?? []) {
          const tamanho = f.size < 1024 * 1024 ? `${Math.max(1, Math.round(f.size / 1024))} KB` : `${(f.size / 1024 / 1024).toFixed(1).replace('.', ',')} MB`
          let documento_id: Id | undefined
          try {
            documento_id = repos.documentos.criar({
              tipo: 'comunicacao_interna',
              nome_arquivo: f.name,
              mime: f.type || 'application/octet-stream',
              tamanho_bytes: f.size,
              hash_sha256: `demo-${f.name}-${f.size}`,
              origem: 'upload_equipe',
              enviado_por_tipo: 'usuario',
              enviado_por_id: usuario.id,
              backend_id: 'a1',
              caminho: `Escritório/Comunicação interna/${conversa.nome ?? 'Conversas pessoais'}`,
              visivel_ao_cliente: false,
              versao: 1,
              metadados: { origem: 'comunicacao_interna', conversa_interna_id: conversaId },
            }).id
          } catch {
            /* sem permissão de registrar documento: o anexo fica só na mensagem */
          }
          anexos.push({ nome: f.name, tamanho, mime: f.type, documento_id })
        }
        const corpo = d.corpo.trim() || (d.audio ? 'Áudio' : anexos.length ? anexos.map((a) => a.nome).join(', ') : '')
        const extras: Record<string, unknown> & ExtrasMensagem = {
          ...(mencoes.length ? { mencoes } : {}),
          ...(citacoes.length ? { citacoes } : {}),
          ...(anexos.length ? { anexos } : {}),
          ...(d.audio ? { audio: { duracao_seg: d.audio.duracao_seg, estado: 'transcrevendo' } } : {}),
        }
        const m = repos.mensagensInternas.criar({ conversa_interna_id: conversaId, autor_id: usuario.id, corpo, responde_a_id: d.respondeA ?? null, versoes: [], extras }, { texto: `${usuario.nome} escreveu na conversa interna` })
        const raiz = d.respondeA ?? m.id
        const destino = { modulo: 'interna' as const, aba: 'conversas', conversaInterna: conversaId }
        const membros = participantes(conversaId)

        // Áudio: transcrição pelo serviço (API-02); conta no limite de IA de quem grava.
        if (d.audio) {
          servicos.transcricao
            .transcrever({ nome: `${m.id}.ogg`, duracaoSeg: d.audio.duracao_seg })
            .then(() => {
              const atual = repos.mensagensInternas.obter(m.id)
              if (atual) repos.mensagensInternas.atualizar(m.id, { extras: { ...atual.extras, audio: { duracao_seg: d.audio!.duracao_seg, estado: 'pronta', transcricao: falasInternas[Math.floor(Math.random() * falasInternas.length)] } } })
            })
            .catch(() => {
              const atual = repos.mensagensInternas.obter(m.id)
              if (atual) repos.mensagensInternas.atualizar(m.id, { extras: { ...atual.extras, audio: { duracao_seg: d.audio!.duracao_seg, estado: 'indisponivel' } } })
            })
        }

        // Menções: @pessoa avisa a pessoa; @setor avisa todos do setor; @integrante responde no fio (11, 3 e 4).
        for (const men of mencoes) {
          if (men.tipo === 'pessoa' && men.id !== usuario.id) {
            if (!membros.includes(men.id)) loja.toast(`${men.rotulo} não participa desta conversa: o aviso leva só o trecho, não o acesso.`)
            loja.avisar({ para: [men.id], titulo: `${usuario.nome} mencionou você${conversa.nome ? ` em ${conversa.nome}` : ''}`, detalhe: corpo.slice(0, 120), tipo: 'conversa', destino })
          }
          if (men.tipo === 'setor') {
            const doSetor = ref.current.contas.filter((u) => u.situacao === 'ativo' && u.id !== usuario.id && (u.papel === 'administrador' || u.vinculos.some((v) => v.setor === men.id))).map((u) => u.id)
            if (doSetor.length) loja.avisar({ para: doSetor, titulo: `${usuario.nome} chamou @${men.rotulo}`, detalhe: corpo.slice(0, 120), tipo: 'conversa', destino, setor: men.id as SetorIntegrante })
          }
          if (men.tipo === 'integrante') integranteResponde(conversaId, men.id, () => ({ corpo: respostaDoIntegrante(men.id, corpo) }), raiz)
        }

        // Proposta de tarefa (prepara; a pessoa confirma). Integrante não lê conversa pessoal (11, 4).
        const chamouIntegrante = mencoes.some((x) => x.tipo === 'integrante')
        if (conversa.tipo !== 'pessoal' && !chamouIntegrante && !d.respondeA && pareceUmPedido(corpo)) {
          const setor = conversa.tipo === 'canal_setor' && conversa.setor_id ? conversa.setor_id : 'geral'
          const cliente = citacoes.find((c) => c.tipo === 'cliente')?.id ?? citacoes.find((c) => c.cliente_id)?.cliente_id ?? null
          const titulo = corpo.replace(/@\S+/g, '').replace(/\s+/g, ' ').trim().slice(0, 70)
          integranteResponde(conversaId, setor, () => ({ corpo: 'Parece um pedido. Quer que eu crie a tarefa? Eu preparo; quem confirma é você.', extras: { proposta: { titulo, setor: setor === 'geral' ? (ref.current.usuario.vinculos[0]?.setor ?? 'gestao_atendimento') : setor, cliente_id: cliente, situacao: 'aberta' } } }), m.id, 2200)
        }
        return m
      },

      /** Editar cria uma versão; a mensagem mostra "editada" (11, 1 e P1). Só o autor edita. */
      editar(id: Id, corpo: string) {
        if (!corpo.trim()) throw new Error('A mensagem não pode ficar vazia: mensagens não se apagam.')
        return repos.mensagensInternas.editar(id, corpo.trim())
      },

      /** Fixar no topo do canal geral (Gestor, 11, 2 e P5). */
      fixar(id: Id, fixar: boolean) {
        const m = exigir(repos.mensagensInternas, id)
        const { usuario } = ref.current
        return repos.mensagensInternas.atualizar(id, { fixada: fixar, extras: { ...m.extras, fixada_por: fixar ? usuario.nome : undefined, fixada_em: fixar ? agora() : undefined } }, { ferramenta: 'mensagem_interna.fixar', texto: `${usuario.nome} ${fixar ? 'fixou' : 'desafixou'} uma mensagem no canal geral` })
      },

      /** Mensagem vira tarefa no Painel, com o link de volta (11, 3). */
      virarTarefa(msgId: Id, t: { titulo: string; setor: string; cliente_id?: Id | null; prazo?: string; responsavel?: Id | null; descricao?: string }) {
        const m = exigir(repos.mensagensInternas, msgId)
        const tarefa = repos.tarefas.criar({
          titulo: t.titulo.trim(),
          descricao: t.descricao,
          setor_id: t.setor,
          cliente_id: t.cliente_id ?? null,
          atividade_id: 'GES-001',
          origem: 'conversa',
          origem_ref: msgId,
          responsavel_tipo: t.responsavel ? 'usuario' : null,
          responsavel_id: t.responsavel ?? null,
          quem_conclui: 'pessoa',
          status: 'a_fazer',
          status_desde: agora(),
          prazo_interno: t.prazo || null,
          prioridade: 'normal',
          checklist: [],
          risco: false,
          extras: { conversa_interna_id: m.conversa_interna_id, mensagem_interna_id: msgId, responsavel_nome: t.responsavel ? nomeDe(t.responsavel) : undefined },
        })
        repos.mensagensInternas.atualizar(msgId, { extras: { ...m.extras, tarefa_id: tarefa.id, tarefa_titulo: tarefa.titulo } })
        return tarefa
      },

      /** Resposta à proposta do integrante (criar ou "não é pedido"). */
      decidirProposta(msgId: Id, situacao: 'criada' | 'recusada', tarefaId?: Id) {
        const m = exigir(repos.mensagensInternas, msgId)
        const e = extrasDe(m)
        if (!e.proposta) return
        // A proposta é do integrante: o ajuste do estado dela vai como o próprio integrante.
        repos.mensagensInternas.atualizar(msgId, { extras: { ...m.extras, proposta: { ...e.proposta, situacao, tarefa_id: tarefaId } } }, { ctx: comoIntegrante(e.ia?.setor ?? 'geral') })
      },

      /** Resumo da manhã agora (o gatilho ligado posta sozinho uma vez por dia). */
      resumoDaManha(conversaId: Id, setor: string) {
        integranteResponde(conversaId, setor, () => ({ corpo: resumoDaManha(setor), extras: { resumo: 'manha' } }), null, 1200)
      },

      /** Abertura de conversa pessoal em investigação: motivo, registro e aviso aos participantes (11, 5 e P2). */
      investigar(conversaId: Id, motivo: string, guardar: (i: Investigacao) => void) {
        const { usuario, loja } = ref.current
        if (!motivo.trim()) throw new Error('A abertura exige o motivo escrito.')
        registrar(`${usuario.nome} abriu uma conversa pessoal em investigação interna: ${motivo}`, 'conversa_interna.investigar')
        const membros = participantes(conversaId)
        repos.mensagensInternas.criar({ conversa_interna_id: conversaId, autor_id: usuario.id, corpo: `${usuario.nome} (Administradora) abriu esta conversa em investigação interna. Motivo: ${motivo}`, versoes: [], extras: { sistema: true } })
        loja.avisar({ para: membros, titulo: 'Uma conversa pessoal sua foi aberta em investigação', detalhe: `Por ${usuario.nome}. Motivo: ${motivo}`, tipo: 'sistema', destino: { modulo: 'interna', aba: 'conversas', conversaInterna: conversaId } })
        guardar({ conversa: conversaId, por: usuario.id, por_nome: usuario.nome, motivo, em: agora() })
      },

      /** Tenta transcrever de novo um áudio indisponível. */
      transcreverDeNovo(msgId: Id) {
        const m = exigir(repos.mensagensInternas, msgId)
        const a = extrasDe(m).audio
        if (!a) return
        repos.mensagensInternas.atualizar(msgId, { extras: { ...m.extras, audio: { ...a, estado: 'transcrevendo' } } })
        servicos.transcricao
          .transcrever({ nome: `${msgId}-de-novo.ogg`, duracaoSeg: a.duracao_seg })
          .then(() => repos.mensagensInternas.atualizar(msgId, { extras: { ...exigir(repos.mensagensInternas, msgId).extras, audio: { ...a, estado: 'pronta', transcricao: falasInternas[1] } } }))
          .catch(() => repos.mensagensInternas.atualizar(msgId, { extras: { ...exigir(repos.mensagensInternas, msgId).extras, audio: { ...a, estado: 'indisponivel' } } }))
      },
    }
    return acoes
  }, [])
}

/**
 * Canais de setor automáticos (11, 2; S05-A68): quem ganha o setor entra
 * sozinho e quem perde sai, com a entrada e a saída registradas; quem foi
 * desligado sai de todas as conversas (o histórico fica). Roda ao abrir a
 * comunicação interna.
 */
export function useSincronizarCanais() {
  const { contas } = useSessao()
  const conversas = useTabela('conversa_interna')
  const participacoes = useTabela('participacao')
  useEffect(() => {
    try {
      const ativos = contas.filter((u) => u.situacao === 'ativo')
      const quando = agora()
      const novas: Omit<Participacao, 'id' | 'escritorio_id' | 'criado_em' | 'atualizado_em'>[] = []
      const saidas: Participacao[] = []
      for (const c of conversas) {
        const ps = participacoes.filter((p) => p.conversa_interna_id === c.id && !p.saiu_em)
        if (c.tipo === 'canal_setor' || c.tipo === 'canal_geral') {
          const devem = new Set(ativos.filter((u) => c.tipo === 'canal_geral' || u.papel === 'administrador' || u.vinculos.some((v) => v.setor === c.setor_id)).map((u) => u.id))
          for (const id of devem) if (!ps.some((p) => p.usuario_id === id)) novas.push({ conversa_interna_id: c.id, usuario_id: id, entrou_em: quando, extras: { automatica: true } })
          for (const p of ps) if (!devem.has(p.usuario_id)) saidas.push(p)
        } else {
          for (const p of ps) if (!ativos.some((u) => u.id === p.usuario_id)) saidas.push(p)
        }
      }
      if (!novas.length && !saidas.length) return
      for (const n of novas) repos.participacoes.criar(n, { texto: 'Entrou no canal do setor (setor ligado na conta)' })
      for (const s of saidas) repos.participacoes.atualizar(s.id, { saiu_em: quando, extras: { ...s.extras, automatica: true } }, { texto: 'Saiu do canal (setor tirado ou conta desligada)' })
    } catch {
      /* conta sem permissão de registrar a participação: quem tem fará na próxima abertura */
    }
  }, [contas, conversas, participacoes])
}

/** Gatilho do resumo da manhã por canal de setor (liga o Gestor do setor ou o Administrador). */
export function useResumoDaManha() {
  return usePersistente<Record<Id, boolean>>('s05:interna:resumo-manha', {})
}

/** Conversa interna pelo id, com o rótulo que a pessoa vê (pessoal mostra o nome do outro). */
export function useRotuloConversa() {
  const { usuario, contas } = useSessao()
  const participacoes = useTabela('participacao')
  return useCallback(
    (c: ConversaInterna) => {
      if (c.tipo !== 'pessoal') return c.nome ?? 'Conversa'
      const outro = participacoes.find((p) => p.conversa_interna_id === c.id && p.usuario_id !== usuario.id)
      const nomes = participacoes.filter((p) => p.conversa_interna_id === c.id).map((p) => contas.find((u) => u.id === p.usuario_id)?.nome ?? p.usuario_id)
      return participacoes.some((p) => p.conversa_interna_id === c.id && p.usuario_id === usuario.id) ? (contas.find((u) => u.id === outro?.usuario_id)?.nome ?? 'Conversa pessoal') : nomes.join(' e ')
    },
    [participacoes, contas, usuario.id],
  )
}

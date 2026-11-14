import { useCallback } from 'react'
import { banco } from '@/nucleo/banco'
import { repos } from '@/nucleo/repositorios'
import { nomeDoSetor, type FimFluxo } from '@/dados/simulacao'
import type { Cartao } from '@/dados/tipos'
import type { SetorIntegrante } from '@/theme/tipos'
import { integranteDoSetor } from './fluxos'
import { useLoja, type Destino } from './loja'
import { useSessao } from './sessao'

/**
 * Integrantes da S02 (Societário, Obrigações, Notas e os donos das obrigações)
 * trabalhando "de verdade" na demonstração (mapa, 0.7 e 1.3):
 *
 * - **faz sozinho** (classe S): o integrante mostra as etapas no chat e, ao
 *   terminar, a mudança acontece (`aoTerminar`) com evento em nome dele;
 * - **prepara** (classe P, executar com aprovação): ao terminar, deixa um
 *   cartão de aprovação no chat; aprovar executa (o executor registrado aqui),
 *   recusar devolve para uma pessoa; editar e aprovar vale como aprovar;
 * - **aprende com a decisão**: cada decisão entra na memória do integrante
 *   (`s02:memoria`) e ele responde o que anotou; depois de 30 cartões com 95%
 *   aprovados sem edição, pergunta ao Administrador se pode passar a fazer
 *   sozinho (02, 3.3), menos o que nunca se promove (transmitir, pagar, assinar).
 *
 * Os cartões ficam no banco (`cartao_aprovacao`, id `s02-…`) com a ação em
 * `argumentos`, então decidir no chat, no sino ou na Visão geral vale igual e
 * sobrevive ao recarregar.
 */

/** Ação que um cartão da S02 executa ao ser aprovado (fica em `cartao_aprovacao.argumentos`). */
export interface AcaoS02 {
  tipo: string
  [k: string]: unknown
}

/** Quem executa: recebe a ação e o contexto da pessoa que aprovou. */
export type ExecutorS02 = (acao: AcaoS02, ctx: ContextoExecucao) => void

export interface ContextoExecucao {
  loja: ReturnType<typeof useLoja>
  quem: string
  usuarioId: string
  editado: boolean
}

const executores = new Map<string, ExecutorS02>()

/** Cada aba registra o que os seus cartões fazem (chamado ao importar o módulo). */
export function registrarExecutor(tipo: string, fn: ExecutorS02) {
  executores.set(tipo, fn)
}

/** Nunca promovível a "faz sozinho" (01, 3.3; mapa 1.3). */
const nuncaSozinho = /transmit|pagar|assin|regime|enviar|entregar ao cliente/i

/* ---------- Memória do integrante (aprende com a decisão) ---------- */

export interface LicaoS02 {
  setor: SetorIntegrante
  tipo: string
  rotulo: string
  aprovados: number
  editados: number
  recusados: number
  ultima?: { decisao: string; quem: string; quando: string; nota?: string }
}

const CHAVE_MEMORIA = 's02:memoria'

export function lerMemoria(): LicaoS02[] {
  const r = banco.ler('registro_tela').find((x) => x.id === CHAVE_MEMORIA)
  return (r?.valor as LicaoS02[] | undefined) ?? []
}

function aprender(setor: SetorIntegrante, tipo: string, rotulo: string, decisao: string, quem: string, nota?: string): LicaoS02 {
  const lista = lerMemoria()
  const atual = lista.find((l) => l.setor === setor && l.tipo === tipo) ?? { setor, tipo, rotulo, aprovados: 0, editados: 0, recusados: 0 }
  const nova: LicaoS02 = {
    ...atual,
    rotulo,
    aprovados: atual.aprovados + (decisao === 'aprovar' ? 1 : 0),
    editados: atual.editados + (decisao === 'editar_e_aprovar' ? 1 : 0),
    recusados: atual.recusados + (decisao === 'recusar' ? 1 : 0),
    ultima: { decisao, quem, quando: new Date().toISOString(), nota },
  }
  repos.telas.lembrar(CHAVE_MEMORIA, [...lista.filter((l) => l !== atual && !(l.setor === setor && l.tipo === tipo)), nova])
  return nova
}

/** Frase do integrante depois da decisão (o que anotou e quanto falta para pedir para fazer sozinho). */
function fraseDoAprendizado(l: LicaoS02, decisao: string, editado: boolean): string {
  const total = l.aprovados + l.editados + l.recusados
  const semEdicao = total ? l.aprovados / total : 0
  if (decisao === 'recusar') return `Anotei a recusa em “${l.rotulo}”: não executo e devolvo para uma pessoa. Da próxima vez, confiro isso antes de preparar.`
  const base = editado ? `Anotei a sua edição em “${l.rotulo}”: uso a versão corrigida como modelo nas próximas.` : `Anotei: “${l.rotulo}” aprovado como preparei.`
  if (nuncaSozinho.test(l.rotulo)) return `${base} Isso continua sempre com aprovação (transmitir, enviar, pagar e assinar não passam a ser sozinhos).`
  if (total >= 30 && semEdicao >= 0.95) return `${base} Já são ${total} cartões, ${Math.round(semEdicao * 100)}% aprovados sem edição: vou perguntar ao Administrador se posso passar a fazer sozinho.`
  return `${base} ${l.aprovados} de ${total} aprovados sem edição até aqui (com 30 e 95%, peço ao Administrador para fazer sozinho).`
}

/* ---------- Efeito dos cartões da S02 (chamado por efeitos.tsx) ---------- */

/** Decide um cartão `s02-…`: executa (ou não), aprende e responde no chat do integrante. */
export function efeitoCartaoS02(cartaoId: string, decisao: string, ctx: Omit<ContextoExecucao, 'editado'>) {
  const cartao = banco.ler('cartao_aprovacao').find((c) => c.id === cartaoId)
  const acao = cartao?.argumentos as AcaoS02 | undefined
  const setor = (cartao?.extras?.setor as SetorIntegrante | undefined) ?? 'geral'
  const rotulo = String(cartao?.extras?.rotulo ?? cartao?.resumo_humano ?? 'cartão')
  const editado = decisao === 'editar_e_aprovar'
  const integrante = integranteDoSetor(setor)
  const licao = aprender(setor, acao?.tipo ?? 'cartao', rotulo, decisao, ctx.quem)
  if (decisao === 'recusar') {
    ctx.loja.registrar(ctx.quem, `Recusou: ${cartao?.resumo_humano ?? cartaoId}`)
    ctx.loja.mensagemTime(integrante, { autor: { tipo: 'integrante', setor }, texto: fraseDoAprendizado(licao, decisao, false) })
    ctx.loja.toast(`Recusado. O ${nomeDoSetor(setor)} não executa e anotou a decisão.`)
    return
  }
  const fn = acao && executores.get(acao.tipo)
  if (fn) fn(acao, { ...ctx, editado })
  else ctx.loja.toast('Aprovado. O integrante segue com o trabalho.')
  ctx.loja.registrar(ctx.quem, `Aprovou${editado ? ' (com edição)' : ''}: ${cartao?.resumo_humano ?? cartaoId}`)
  ctx.loja.mensagemTime(integrante, { autor: { tipo: 'integrante', setor }, texto: fraseDoAprendizado(licao, decisao, editado) })
}

/* ---------- Pôr o integrante para trabalhar ---------- */

export interface PedidoTrabalhoS02 {
  setor: SetorIntegrante
  /** O que ele está fazendo ("Cadastrar pelo CNPJ"). */
  titulo: string
  cliente?: string
  clienteId?: string
  /** Código da atividade (SOC-001), para a linha do tempo. */
  atividade?: string
  /** O que ele responde ao receber. */
  inicio?: string
  etapas: string[]
  /** Segundos por etapa (padrão 1,2). */
  seg?: number
  /** O que diz ao terminar. */
  texto: string
  /** Aviso no sino ao terminar. */
  aviso?: string
  /** Faz sozinho: a mudança acontece ao terminar, em nome do integrante. */
  aoTerminar?: () => void
  /** Prepara: deixa o cartão de aprovação ao terminar. */
  cartao?: { acao: AcaoS02; resumo: string; argumentos?: [string, string][]; expira?: string; podeAprovar?: string[] }
  /** Cartões extra no fim (documento, tabela). */
  cartoes?: Cartao[]
  /** Mensagem ao cliente pelo CRM (só em ação já aprovada). */
  crm?: FimFluxo['crm']
  /** Link do toast do início. */
  destino?: Destino
  /** Toast ao pedir (padrão: "<integrante> começou: <titulo>"). */
  toast?: string | false
}

/**
 * `trabalhar(pedido)`: o integrante do setor recebe, mostra as etapas e termina
 * fazendo sozinho ou deixando o cartão. Devolve o id do cartão (quando há).
 */
export function useAgenteS02() {
  const loja = useLoja()
  const { usuario } = useSessao()
  return useCallback(
    (p: PedidoTrabalhoS02): string | undefined => {
      const integrante = integranteDoSetor(p.setor)
      const seg = p.seg ?? 1.2
      const id = `s02-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`
      const cartoes: Cartao[] = [...(p.cartoes ?? [])]
      if (p.cartao) {
        // O cartão nasce no banco já com a ação (decidir em qualquer lugar executa a mesma coisa).
        repos.cartoes.criar(
          {
            id,
            ferramenta: String(p.cartao.acao.tipo),
            argumentos: p.cartao.acao,
            resumo_humano: `${p.cartao.resumo}${p.cliente ? ` · ${p.cliente}` : ''}`,
            pedido_por_tipo: 'integrante',
            pedido_por_id: integrante,
            usuario_dono_id: usuario.id,
            pode_aprovar: p.cartao.podeAprovar ?? [],
            status: 'pendente',
            expira_em: null,
            extras: { setor: p.setor, rotulo: p.cartao.resumo, cliente_id: p.clienteId ?? null, pedido_por_nome: usuario.nome },
          },
          { ferramenta: 'aprovacao.decidir', texto: `${nomeDoSetor(p.setor)} preparou para aprovar: ${p.cartao.resumo}${p.cliente ? ` · ${p.cliente}` : ''}` },
        )
        cartoes.push({ tipo: 'aprovacao', id, resumo: `${p.cartao.resumo}${p.cliente ? ` · ${p.cliente}` : ''}`, argumentos: [...(p.cartao.argumentos ?? []), ['Pedido por', usuario.nome]].map(([rotulo, valor]) => ({ rotulo, valor })), expiraEm: p.cartao.expira ?? 'expira em 2 dias' })
      }
      loja.iniciarTrabalho({
        id: `s02-${p.titulo}`,
        integrante,
        setor: p.setor,
        titulo: p.titulo,
        cliente: p.cliente,
        inicio: p.inicio ?? `Deixa comigo: ${p.titulo.toLowerCase()}${p.cliente ? ` de ${p.cliente}` : ''}.`,
        etapas: p.etapas,
        seg,
        fim: { texto: p.texto, cartoes: cartoes.length ? cartoes : undefined, aviso: p.aviso, crm: p.crm },
      })
      if (p.aoTerminar) {
        // Faz sozinho: a mudança acontece quando ele termina (o trabalho segue mesmo trocando de aba).
        const fim = p.aoTerminar
        setTimeout(fim, 2600 + p.etapas.length * seg * 1000)
      }
      if (p.toast !== false)
        loja.toast(p.toast ?? `${nomeDoSetor(p.setor)} começou: ${p.titulo.toLowerCase()}${p.cliente ? ` · ${p.cliente}` : ''}`, p.destino ?? { modulo: 'inicio', aba: 'time', integrante }, 'Acompanhar', { tipo: 'integrante', setor: p.setor, estado: 'trabalhando' })
      return p.cartao ? id : undefined
    },
    [loja, usuario.id, usuario.nome],
  )
}

import { textoDoValor } from '@/components/kit/valor-editavel/tipos'
import type { ArgumentoCartao, Cartao } from '@/dados/tipos'
import type { CartaoAprovacao, Cliente } from '@/nucleo/modelo/entidades'
import { rotuloSetorCurto } from '@/nucleo/permissoes'
import type { SetorIntegrante } from '@/theme/tipos'

/**
 * Cartões de aprovação vistos fora do chat (central de aprovações, fase 6).
 * Funções puras sobre a linha de `cartao_aprovacao`: valem para os dois modos
 * (local e api), porque só leem o que o banco devolve.
 *
 * - `argumentosParaGuardar`: o produtor grava os argumentos de exibição junto
 *   da ação (`extras.argumentos_exibidos`), sem funções nem ícones;
 * - `argumentosDaLinha`: monta as linhas do cartão a partir do banco (os
 *   exibidos, com o valor atual da ação; senão, derivados da ação, só leitura);
 * - `podeAprovarCartao`: quem decide (lista vazia = Gestor do setor e Administrador).
 */

type CartaoChat = Extract<Cartao, { tipo: 'aprovacao' }>

/** Tira funções (validar, prévia) e componentes (ícones): o que vai para o banco precisa virar JSON. */
function semFuncoes(v: unknown): unknown {
  if (typeof v === 'function') return undefined
  if (Array.isArray(v)) return v.map(semFuncoes)
  if (v && typeof v === 'object') {
    if ('$$typeof' in v) return undefined
    const saida: Record<string, unknown> = {}
    for (const [k, x] of Object.entries(v)) {
      if (k === 'icone') continue
      const limpo = semFuncoes(x)
      if (limpo !== undefined) saida[k] = limpo
    }
    return saida
  }
  return v
}

/** Os argumentos de exibição prontos para `extras.argumentos_exibidos`. */
export function argumentosParaGuardar(args: ArgumentoCartao[]): ArgumentoCartao[] {
  return args.map((a) => semFuncoes(a) as ArgumentoCartao)
}

/* ---------- Da ação para linhas legíveis (quando o produtor não guardou as de exibição) ---------- */

const rotulosConhecidos: Record<string, string> = {
  competencia: 'Competência',
  vigencia: 'Vigência',
  regime: 'Regime',
  motivo: 'Motivo',
  canal: 'Canal',
  cliente: 'Cliente',
  clientes: 'Clientes',
  setor: 'Setor',
  nome: 'Nome',
  total: 'Total',
  valor: 'Valor',
  rotulo: 'O quê',
  uf: 'UF',
  cnaes: 'CNAEs',
  descricao: 'Descrição',
  observacao: 'Observação',
  vencimento: 'Vencimento',
  prazo: 'Prazo',
  quantidade: 'Quantidade',
}
/** Ids, hashes e o tipo da ação não aparecem para a pessoa. */
const oculta = (k: string) => k === 'tipo' || k === 'id' || k === 'ids' || /(_id|_ids|Id|Ids)$/.test(k) || /^hash/i.test(k)
const rotuloDaChave = (k: string) => {
  if (rotulosConhecidos[k]) return rotulosConhecidos[k]
  const t = k.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ').toLowerCase()
  return t.charAt(0).toUpperCase() + t.slice(1)
}
function textoDe(k: string, v: unknown): string | null {
  if (v === null || v === undefined || v === '') return null
  if (k === 'setor' && typeof v === 'string') return rotuloSetorCurto[v as SetorIntegrante] ?? v
  if (typeof v === 'string') return v
  if (typeof v === 'number') return v.toLocaleString('pt-BR')
  if (typeof v === 'boolean') return v ? 'sim' : 'não'
  if (Array.isArray(v) && v.every((x) => ['string', 'number'].includes(typeof x))) {
    if (!v.length) return null
    const mostra = v.slice(0, 6).map(String).join(', ')
    return v.length > 6 ? `${mostra} e mais ${v.length - 6}` : mostra
  }
  return null
}

function derivarDaAcao(acao: Record<string, unknown>, nomeCliente: (id: string) => string | undefined): ArgumentoCartao[] {
  const linhas: ArgumentoCartao[] = []
  for (const [k, v] of Object.entries(acao ?? {})) {
    if ((k === 'cliente_id' || k === 'clienteId') && typeof v === 'string') {
      const nome = nomeCliente(v)
      if (nome && !linhas.some((l) => l.rotulo === 'Cliente')) linhas.push({ rotulo: 'Cliente', valor: nome })
      continue
    }
    if (oculta(k)) continue
    const valor = textoDe(k, v)
    if (valor) linhas.push({ rotulo: rotuloDaChave(k), valor })
  }
  return linhas
}

/** Linhas do cartão a partir do banco: as de exibição (com o valor atual da ação) ou as derivadas da ação. */
export function argumentosDaLinha(c: CartaoAprovacao, nomeCliente: (id: string) => string | undefined): ArgumentoCartao[] {
  const exibidos = (c.extras?.argumentos_exibidos ?? c.extras?.argumentos_tela) as ArgumentoCartao[] | undefined
  if (Array.isArray(exibidos) && exibidos.length) {
    const acao = (c.argumentos ?? {}) as Record<string, unknown>
    // A correção feita em outro lugar (chat, sino) já aparece: o valor vem da ação guardada.
    return exibidos.map((a) => {
      if (!a.campo || !a.editavel || acao[a.campo] === undefined) return a
      const bruto = acao[a.campo] as ArgumentoCartao['bruto']
      return { ...a, bruto, valor: textoDoValor(a.editavel, bruto) || a.valor }
    })
  }
  return derivarDaAcao(c.argumentos as Record<string, unknown>, nomeCliente)
}

/* ---------- Setor, cliente, prazo ---------- */

/** Setor do cartão: o do integrante que pediu; no Financeiro, o da alçada. */
export function setorDaLinha(c: CartaoAprovacao): SetorIntegrante {
  const s = c.extras?.setor
  if (typeof s === 'string' && s in rotuloSetorCurto) return s as SetorIntegrante
  if (c.id.startsWith('s07-') || c.extras?.s07) return 'financeiro_escritorio'
  const gestor = c.pode_aprovar.find((p) => p.startsWith('gestor:'))?.slice(7)
  if (gestor && gestor in rotuloSetorCurto) return gestor as SetorIntegrante
  return 'geral'
}

export function clienteDaLinha(c: CartaoAprovacao): string | null {
  const a = (c.argumentos ?? {}) as Record<string, unknown>
  const v = c.extras?.cliente_id ?? a.cliente_id ?? a.clienteId
  return typeof v === 'string' && v ? v : null
}

const semSufixo = (n: string) => n.replace(/\s+(ME|EPP|Ltda\.?|EIRELI|S\/?A|MEI)$/i, '').trim()

/** Cliente de um cartão que só existe no chat: pelo argumento "Cliente" (ou "Empresa") ou pelo nome no resumo. */
export function clienteDoTexto(cartao: CartaoChat, clientes: Pick<Cliente, 'id' | 'nome'>[]): string | null {
  const doArg = cartao.argumentos?.find((a) => /^(cliente|empresa)$/i.test(a.rotulo))?.valor
  const textos = [doArg, cartao.resumo].filter(Boolean) as string[]
  for (const t of textos) {
    const achado = clientes.find((c) => t.includes(c.nome)) ?? clientes.find((c) => semSufixo(c.nome).length > 4 && t.includes(semSufixo(c.nome)))
    if (achado) return achado.id
  }
  return null
}

/** "expira em 2 dias" a partir da data guardada (ou o texto que o produtor guardou). */
export function expiraDaLinha(c: CartaoAprovacao, agora = Date.now()): string | undefined {
  if (typeof c.extras?.expira === 'string') return c.extras.expira
  if (!c.expira_em) return undefined
  const ms = Date.parse(c.expira_em) - agora
  if (Number.isNaN(ms)) return undefined
  if (ms <= 0) return 'expira hoje'
  const h = Math.round(ms / 36e5)
  return h < 24 ? `expira em ${Math.max(1, h)} h` : `expira em ${Math.round(h / 24)} dia${Math.round(h / 24) === 1 ? '' : 's'}`
}

/* ---------- Quem decide ---------- */

/** Cartões que o cliente decide no app (lote de pagamento do BPO): esperam o cliente, não o escritório. */
export const decideOCliente = (c: Pick<CartaoAprovacao, 'ferramenta'>) => c.ferramenta === 'pagamento_lote.aprovar'

/**
 * Pode decidir este cartão? Lista vazia: Gestor do setor e Administrador. Com
 * lista: o id ou o nome da pessoa, `administrador` ou `gestor:<setor>`.
 */
export function podeAprovarCartao(c: Pick<CartaoAprovacao, 'pode_aprovar'> & { setor: string }, u: { id: string; nome: string; papel: string }, gere: readonly string[]): boolean {
  const admin = u.papel === 'administrador'
  if (!c.pode_aprovar.length) return admin || gere.includes(c.setor)
  return c.pode_aprovar.some((p) => p === u.id || p === u.nome || (p === 'administrador' && admin) || (p.startsWith('gestor:') && (admin || gere.includes(p.slice(7)))))
}

/* ---------- Abrir a central de qualquer lugar (e por link) ---------- */

/** O que a central mostra ao abrir: um cartão em foco, um setor ou um cliente. */
export interface FiltroAprovacoes {
  cartao?: string
  setor?: string
  cliente?: string
}

export const EVENTO_ABRIR_APROVACOES = 'heild:abrir-aprovacoes'

/** Abre a central de aprovações (sino, aviso da Home, chat, toasts), já filtrada se pedir. */
export const abrirAprovacoes = (filtro: FiltroAprovacoes = {}) => window.dispatchEvent(new CustomEvent<FiltroAprovacoes>(EVENTO_ABRIR_APROVACOES, { detail: filtro }))

/**
 * Parâmetro `aprovacoes` do endereço (`#/inicio?aprovacoes=todas`):
 * `todas`, `setor:fiscal`, `cliente:c1` ou o id do cartão em foco.
 */
export function filtroDoParametro(v: string | null | undefined): FiltroAprovacoes | null {
  if (!v) return null
  if (v === 'todas') return {}
  if (v.startsWith('setor:')) return { setor: v.slice(6) }
  if (v.startsWith('cliente:')) return { cliente: v.slice(8) }
  return { cartao: v }
}

export function parametroDoFiltro(f: FiltroAprovacoes): string {
  return f.cartao ?? (f.setor ? `setor:${f.setor}` : f.cliente ? `cliente:${f.cliente}` : 'todas')
}

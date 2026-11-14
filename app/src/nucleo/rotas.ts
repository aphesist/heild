import { useEffect, useSyncExternalStore } from 'react'
import type { Destino, IdModulo } from '@/ambiente/loja'

/**
 * Rotas do wireframe: cada módulo, aba, cliente e item tem endereço próprio,
 * para abrir direto por link (apresentação, sessões, testes). Usa o `#` da
 * URL, que funciona em qualquer hospedagem estática sem configurar servidor.
 *
 *   #/painel/fiscal                       módulo e aba
 *   #/painel/fiscal?cliente=c1            com o cliente selecionado (todos = carteira)
 *   #/painel/societario?tarefa=t18        abre a ficha da tarefa por cima
 *   #/painel/societario?ficha=c1          abre a ficha do cliente
 *   #/painel/societario?trilha=c3         abre a trilha do cliente (S04, C6)
 *   #/crm/conversas?conversa=cv1          a conversa aberta
 *   #/inicio/time?integrante=i-fiscal     o chat de um integrante
 *   #/financeiro/cobranca?fatura=f3       a fatura aberta
 *   #/arquivos?pasta=c1:Fiscal/2026       a pasta (cliente:caminho)
 *   #/app                                 o app do cliente
 *   #/kit                                 a vitrine do kit de interação
 *
 * A Plataforma escreve a base (módulo, aba, cliente...) e as gavetas
 * escrevem o item aberto (tarefa, ficha); quem navega por link lê daqui.
 */

const modulos: IdModulo[] = ['inicio', 'painel', 'clientes', 'crm', 'timesheet', 'financeiro', 'arquivos', 'bpo', 'config']
export type Pagina = 'sistema' | 'app' | 'kit'

export function destinoParaHash(d: Destino): string {
  const q = new URLSearchParams()
  if (d.cliente !== undefined) q.set('cliente', d.cliente ?? 'todos')
  if (d.conversa) q.set('conversa', d.conversa)
  if (d.integrante) q.set('integrante', d.integrante)
  if (d.tarefa) q.set('tarefa', d.tarefa)
  if (d.ficha) q.set('ficha', d.ficha)
  if (d.trilha) q.set('trilha', d.trilha)
  if (d.fatura) q.set('fatura', d.fatura)
  if (d.pasta) q.set('pasta', `${d.pasta.clienteId ?? '_escritorio'}:${d.pasta.caminho.join('/')}`)
  // S02 (C1): aba Obrigações filtrada pelo setor dono.
  if (d.filtroSetor) q.set('setor', d.filtroSetor)
  const busca = q.toString()
  return `#/${d.modulo}${d.aba ? `/${d.aba}` : ''}${busca ? `?${busca}` : ''}`
}

export function hashParaDestino(hash: string): Destino | null {
  const m = hash.replace(/^#/, '').match(/^\/([^/?]+)(?:\/([^?]+))?(?:\?(.*))?$/)
  if (!m || !modulos.includes(m[1] as IdModulo)) return null
  const q = new URLSearchParams(m[3] ?? '')
  const d: Destino = { modulo: m[1] as IdModulo }
  if (m[2]) d.aba = decodeURIComponent(m[2])
  const cliente = q.get('cliente')
  if (cliente) d.cliente = cliente === 'todos' ? null : cliente
  for (const k of ['conversa', 'integrante', 'tarefa', 'ficha', 'fatura', 'trilha'] as const) {
    const v = q.get(k)
    if (v) d[k] = v
  }
  const pasta = q.get('pasta')
  if (pasta) {
    const [c, caminho = ''] = pasta.split(':')
    d.pasta = { ...(c && c !== '_escritorio' ? { clienteId: c } : {}), caminho: caminho ? caminho.split('/') : [] }
  }
  // S02 (C1): #/painel/obrigacoes?setor=fiscal
  const setor = q.get('setor')
  if (setor) d.filtroSetor = setor as Destino['filtroSetor']
  return d
}

export function paginaDoHash(hash = typeof window === 'undefined' ? '' : window.location.hash): Pagina {
  if (/^#\/app(\/|$|\?)/.test(hash)) return 'app'
  if (/^#\/kit(\/|$|\?)/.test(hash)) return 'kit'
  return 'sistema'
}

/* ---------- Estado da rota: a base vem da Plataforma; o item, das gavetas ---------- */

let base: Destino | null = null
let sub: Pick<Destino, 'conversa' | 'fatura' | 'pasta'> = {}
let item: Pick<Destino, 'tarefa' | 'ficha' | 'trilha'> = {}
const composta = (): Destino | null => (base ? { ...base, ...sub, ...item } : null)

function escrever() {
  if (!base || typeof window === 'undefined' || paginaDoHash() !== 'sistema') return
  const novo = destinoParaHash(composta()!)
  if (novo === window.location.hash) return
  const anterior = hashParaDestino(window.location.hash)
  // Trocar de módulo ou de aba entra no histórico (o Voltar do navegador volta); o resto só atualiza o endereço.
  const passo = !anterior || anterior.modulo !== base.modulo || anterior.aba !== base.aba || !!item.tarefa !== !!anterior.tarefa
  window.history[passo ? 'pushState' : 'replaceState'](null, '', novo)
  avisar()
}

/**
 * Destino pedido pelo endereço ao abrir a Plataforma, ou `null` se o endereço é
 * só o que a própria tela escreveu (trocar de conta não reabre onde a outra
 * pessoa estava; recarregar e abrir um link, sim).
 */
export function destinoInicial(): Destino | null {
  if (typeof window === 'undefined') return null
  const h = window.location.hash
  if (base && h === rotaAtual()) return null
  return hashParaDestino(h)
}

/** O endereço que corresponde ao que está na tela agora. */
export const rotaAtual = () => (base ? destinoParaHash(composta()!) : '')

/** A Plataforma informa onde a pessoa está. */
export function definirRotaBase(d: Destino) {
  base = d
  escrever()
}

/** As gavetas informam o item aberto (ou `undefined` ao fechar). */
export function definirItemDaRota(i: Pick<Destino, 'tarefa' | 'ficha' | 'trilha'>) {
  item = i
  escrever()
}

/**
 * A tela informa o item aberto dentro dela (a conversa do CRM, a fatura, a
 * pasta): entra no endereço enquanto a tela está montada.
 */
export function useItemNaRota(parte: Pick<Destino, 'conversa' | 'fatura' | 'pasta'>) {
  const chave = JSON.stringify(parte)
  useEffect(() => {
    sub = JSON.parse(chave)
    escrever()
    return () => {
      sub = {}
    }
  }, [chave])
}

/* ---------- Leitura reativa do endereço ---------- */

const ouvintes = new Set<() => void>()
const avisar = () => ouvintes.forEach((o) => o())
if (typeof window !== 'undefined') {
  window.addEventListener('hashchange', avisar)
  window.addEventListener('popstate', avisar)
}

/** O hash atual (re-renderiza quando muda por link, Voltar ou digitação). */
export function useHash(): string {
  return useSyncExternalStore(
    (f) => {
      ouvintes.add(f)
      return () => ouvintes.delete(f)
    },
    () => window.location.hash,
  )
}

/** Muda de página (sistema, app do cliente, kit). */
export function irParaPagina(p: Pagina) {
  window.location.hash = p === 'sistema' ? '#/inicio' : `#/${p}`
}

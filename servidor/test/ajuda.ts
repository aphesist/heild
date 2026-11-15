import type { FastifyInstance } from 'fastify'
import { criarApp } from '../src/app.ts'
import { sqlAdmin } from '../src/banco/pg.ts'

/** API de teste (inject, sem rede) e atalhos para entrar e chamar. */
export function api(): FastifyInstance {
  return criarApp({ logs: false, relogios: false })
}

let contador = 0
export const chave = (rotulo = 'k') => `teste-${rotulo}-${Date.now().toString(36)}-${++contador}`

export async function entrar(app: FastifyInstance, corpo: { escritorio_id: string; usuario_id?: string; papel?: string; cliente_id?: string }) {
  const r = await app.inject({ method: 'POST', url: '/v1/auth/demonstracao', payload: corpo })
  if (r.statusCode !== 200) throw new Error(`login falhou: ${r.body}`)
  return r.json().token as string
}

export interface Chamada {
  status: number
  corpo: Record<string, any>
  cabecalhos: Record<string, unknown>
}

export async function ferramenta(app: FastifyInstance, token: string, nome: string, entrada: Record<string, unknown>, o: { chave?: string | null; integrante?: string; tela?: { ids?: { p: string; id: string }[]; texto?: string } } = {}): Promise<Chamada> {
  const headers: Record<string, string> = { authorization: `Bearer ${token}` }
  const k = o.chave === undefined ? chave(nome) : o.chave
  if (k) headers['idempotency-key'] = k
  if (o.integrante) headers['x-heild-integrante'] = o.integrante
  const r = await app.inject({ method: 'POST', url: `/v1/ferramentas/${nome}`, payload: o.tela ? { ...entrada, heild_tela: o.tela } : entrada, headers })
  return { status: r.statusCode, corpo: r.json(), cabecalhos: r.headers }
}

export async function operacao(app: FastifyInstance, token: string, comando: Record<string, unknown>, o: { chave?: string | null; validar_apenas?: boolean; integrante?: string } = {}): Promise<Chamada> {
  const headers: Record<string, string> = { authorization: `Bearer ${token}` }
  const k = o.chave === undefined ? chave('op') : o.chave
  if (k) headers['idempotency-key'] = k
  if (o.integrante) headers['x-heild-integrante'] = o.integrante
  const r = await app.inject({ method: 'POST', url: '/v1/operacoes', payload: { comando, ...(o.validar_apenas ? { validar_apenas: true } : {}) }, headers })
  return { status: r.statusCode, corpo: r.json(), cabecalhos: r.headers }
}

/** Consulta como superusuário (só para conferir o estado; o caminho do pedido nunca usa isto). */
export const banco = () => sqlAdmin()

export async function contarEventos(escritorio: string): Promise<number> {
  const [r] = await sqlAdmin()`select count(*)::int as n from evento where escritorio_id = ${escritorio}`
  return r.n as number
}

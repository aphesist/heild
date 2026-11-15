import type { FastifyInstance } from 'fastify'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { config } from '../src/config.ts'
import { definirAuthAdmin } from '../src/auth/contas.ts'
import { esquecerTokens } from '../src/auth/sessao.ts'
import { api, banco, chave, entrar } from './ajuda.ts'

/**
 * Contas da equipe contra o Supabase Auth DO PROJETO (só no CI da nuvem, `backend-nuvem.yml`, com
 * HEILD_SUPABASE_URL, HEILD_SUPABASE_SERVICE_ROLE_KEY e a conexão do HEILD-BACKEND). Fora dele, pula.
 *
 * Os dois caminhos da decisão (b), de ponta a ponta com o Auth de verdade: o login nasce na Admin
 * API, o primeiro acesso define a senha, a pessoa entra pelo `/auth/v1/token` (o gancho de token
 * põe escritório e conta no JWT) e o primeiro pedido à nossa API ativa a conta. O convite por e-mail
 * roda com HEILD_CONVITE_SEM_ENVIO=1: o login convidado nasce igual, sem e-mail de verdade. Os
 * logins criados aqui são apagados no fim.
 */

const chaveServico = process.env.HEILD_SUPABASE_SERVICE_ROLE_KEY
const urlAuth = config.supabaseUrl
const ligado = Boolean(chaveServico && urlAuth && process.env.HEILD_TESTE_URL_ADMIN)

let app: FastifyInstance
let adm: string
const criados: string[] = []
const SENHA = 'Ci-senha-forte-2026'

const admin = (metodo: string, caminho: string, corpo?: unknown) =>
  fetch(`${urlAuth}/auth/v1${caminho}`, { method: metodo, headers: { apikey: chaveServico!, authorization: `Bearer ${chaveServico}`, 'content-type': 'application/json' }, ...(corpo ? { body: JSON.stringify(corpo) } : {}) })
/** O login de verdade (senha), como a tela de entrada faz. */
async function entrarNoSupabase(email: string, senha: string): Promise<string> {
  const r = await fetch(`${urlAuth}/auth/v1/token?grant_type=password`, { method: 'POST', headers: { apikey: chaveServico!, 'content-type': 'application/json' }, body: JSON.stringify({ email, password: senha }) })
  const j = (await r.json()) as { access_token?: string; msg?: string; error_description?: string }
  if (!r.ok || !j.access_token) throw new Error(`login no Supabase falhou (${r.status}): ${j.msg ?? j.error_description ?? ''}`)
  return j.access_token
}
const post = async (url: string, token: string | null, corpo: Record<string, unknown>) => {
  const r = await app.inject({ method: 'POST', url, payload: corpo, headers: { ...(token ? { authorization: `Bearer ${token}` } : {}), 'idempotency-key': chave('nuvem') } })
  return { status: r.statusCode, corpo: r.json() as Record<string, any> }
}
const sessao = async (t: string) => (await app.inject({ method: 'GET', url: '/v1/sessao', headers: { authorization: `Bearer ${t}` } })).statusCode
const conta = async (email: string) => (await banco()`select u.id, u.situacao, a.auth_id from usuario u left join conta_auth a on a.usuario_id = u.id where u.escritorio_id = 'esc-andrade' and u.email_login = ${email}`)[0]

describe.skipIf(!ligado)('contas da equipe contra o Supabase Auth do projeto', () => {
  beforeAll(async () => {
    definirAuthAdmin(undefined)
    app = api()
    adm = await entrar(app, { escritorio_id: 'esc-andrade' })
  })
  afterAll(async () => {
    for (const id of criados) await admin('DELETE', `/admin/users/${id}`).catch(() => undefined)
    await app?.close()
  })

  it('criação manual com código: o primeiro acesso define a senha, o login de verdade entra e ativa a conta', async () => {
    const email = `ci-codigo-${Date.now()}@example.com`
    const r = await post('/v1/equipe/convidar', adm, { nome: 'CI Código', email, papel: 'colaborador', setores: [{ setor_id: 'fiscal', modo: 'execucao' }], metodo: 'codigo' })
    expect(r.status, JSON.stringify(r.corpo)).toBe(200)
    const c = await conta(email)
    expect(c).toMatchObject({ situacao: 'convidado' })
    criados.push(String(c.auth_id))
    const primeiro = await post('/v1/auth/primeiro-acesso', null, { email, codigo: String(r.corpo.dados.codigo), senha: SENHA })
    expect(primeiro.status, JSON.stringify(primeiro.corpo)).toBe(200)
    esquecerTokens()
    expect(await sessao(await entrarNoSupabase(email, SENHA))).toBe(200)
    expect((await conta(email)).situacao).toBe('ativo')
  })

  it('convite por e-mail (sem envio no CI): o login convidado nasce no Auth e o primeiro login ativa a conta', async () => {
    expect(process.env.HEILD_CONVITE_SEM_ENVIO).toBe('1')
    const email = `ci-convite-${Date.now()}@example.com`
    const r = await post('/v1/equipe/convidar', adm, { nome: 'CI Convite', email, papel: 'colaborador', metodo: 'email' })
    expect(r.status, JSON.stringify(r.corpo)).toBe(200)
    expect(r.corpo.dados.codigo).toBeUndefined()
    const c = await conta(email)
    criados.push(String(c.auth_id))
    // A pessoa abre o link do convite e cria a senha (o que a página do Supabase faz).
    expect((await admin('PUT', `/admin/users/${c.auth_id}`, { password: SENHA, email_confirm: true })).ok).toBe(true)
    esquecerTokens()
    expect(await sessao(await entrarNoSupabase(email, SENHA))).toBe(200)
    expect((await conta(email)).situacao).toBe('ativo')
  })
})

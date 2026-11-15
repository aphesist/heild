import { createServer, type Server } from 'node:http'
import { randomUUID } from 'node:crypto'
import { exportJWK, generateKeyPair, SignJWT, type CryptoKey, type JWK } from 'jose'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { config } from '../src/config.ts'
import { esquecerTokens } from '../src/auth/sessao.ts'
import { api, banco, entrar } from './ajuda.ts'

/**
 * Autenticação de produção (B5): o JWT do Supabase Auth verificado pelo JWKS, com o MFA do
 * Administrador. Sem nuvem: um emissor de JWKS de teste (o mesmo formato do
 * `/auth/v1/.well-known/jwks.json` do Supabase, chave ES256) e o gancho de token em SQL.
 */

const app = api()
let servidor: Server
let base = ''
let chave: CryptoKey
let outra: CryptoKey
const antes = { url: config.supabaseUrl, jwks: config.supabaseJwksUrl, demo: config.demonstracao }

async function token(o: { meta?: Record<string, unknown>; aal?: string; iss?: string; aud?: string; exp?: string; com?: CryptoKey; kid?: string } = {}) {
  return new SignJWT({ role: 'authenticated', aal: o.aal ?? 'aal1', session_id: randomUUID(), app_metadata: o.meta ?? { escritorio_id: 'esc-andrade', tipo: 'equipe', usuario_id: 'u3' } })
    .setProtectedHeader({ alg: 'ES256', kid: o.kid ?? 'chave-1' })
    .setSubject(randomUUID())
    .setIssuer(o.iss ?? `${base}/auth/v1`)
    .setAudience(o.aud ?? 'authenticated')
    .setIssuedAt()
    .setExpirationTime(o.exp ?? '10m')
    .sign(o.com ?? chave)
}

const sessao = (t: string) => app.inject({ method: 'GET', url: '/v1/sessao', headers: { authorization: `Bearer ${t}` } })

beforeAll(async () => {
  const par = await generateKeyPair('ES256')
  chave = par.privateKey
  outra = (await generateKeyPair('ES256')).privateKey
  const publica: JWK = { ...(await exportJWK(par.publicKey)), kid: 'chave-1', alg: 'ES256', use: 'sig' }
  servidor = createServer((req, res) => {
    if (req.url === '/auth/v1/.well-known/jwks.json') {
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ keys: [publica] }))
    } else {
      res.writeHead(404).end()
    }
  })
  await new Promise<void>((ok) => servidor.listen(0, '127.0.0.1', ok))
  const porta = (servidor.address() as { port: number }).port
  base = `http://127.0.0.1:${porta}`
  config.supabaseUrl = base
  config.supabaseJwksUrl = null
})
beforeEach(() => {
  esquecerTokens()
  config.demonstracao = antes.demo
})
afterAll(async () => {
  Object.assign(config, { supabaseUrl: antes.url, supabaseJwksUrl: antes.jwks, demonstracao: antes.demo })
  await app.close()
  await new Promise((ok) => servidor.close(ok))
})

describe('JWT do Supabase pelo JWKS', () => {
  it('a conta vem de app_metadata e o perfil é o da conta', async () => {
    const r = await sessao(await token())
    expect(r.statusCode).toBe(200)
    expect(r.json().ator).toMatchObject({ tipo: 'pessoa', usuario_id: 'u3' })
    expect(r.json().escritorio_id).toBe('esc-andrade')
  })

  it('emissor, público, assinatura ou validade errados não entram', async () => {
    for (const t of [
      await token({ iss: 'https://outro.supabase.co/auth/v1' }),
      await token({ aud: 'anon' }),
      await token({ com: outra }),
      await token({ exp: '-1m' }),
    ]) {
      const r = await sessao(t)
      expect(r.statusCode).toBe(401)
      expect(r.json().codigo).toBe('SESSAO_INVALIDA')
    }
  })

  it('token sem escritório em app_metadata é recusado (o usuário do Auth não basta)', async () => {
    const r = await sessao(await token({ meta: { provider: 'email' } }))
    expect(r.statusCode).toBe(401)
    expect(r.json().codigo).toBe('CONTA_SEM_VINCULO')
  })

  it('o Administrador só entra com o segundo fator (aal2)', async () => {
    const sem = await sessao(await token({ meta: { escritorio_id: 'esc-andrade', tipo: 'equipe', usuario_id: 'u1' } }))
    expect(sem.statusCode).toBe(401)
    expect(sem.json().codigo).toBe('EXIGE_MFA')
    const com = await sessao(await token({ aal: 'aal2', meta: { escritorio_id: 'esc-andrade', tipo: 'equipe', usuario_id: 'u1' } }))
    expect(com.statusCode).toBe(200)
  })

  it('conta inativa não entra, mesmo com o login válido', async () => {
    const r = await sessao(await token({ meta: { escritorio_id: 'esc-andrade', tipo: 'equipe', usuario_id: 'u6' } }))
    expect(r.statusCode).toBe(403)
    expect(r.json().codigo).toBe('CONTA_INATIVA')
  })

  it('pessoa do cliente: app_metadata.tipo = cliente', async () => {
    const [c] = await banco()`select id from cliente where escritorio_id = 'esc-andrade' order by id limit 1`
    const r = await sessao(await token({ meta: { escritorio_id: 'esc-andrade', tipo: 'cliente', cliente_id: c.id } }))
    expect(r.statusCode).toBe(200)
    expect(r.json().tipo).toBe('cliente')
  })

  it('o escritório do token manda: um login da Horizonte não lê a Andrade', async () => {
    const t = await token({ meta: { escritorio_id: 'esc-horizonte', tipo: 'equipe', usuario_id: 'h-u3' } })
    const r = await app.inject({ method: 'GET', url: '/v1/sincronizar', headers: { authorization: `Bearer ${t}` } })
    expect(r.statusCode).toBe(200)
    const escritorios = new Set(Object.values(r.json().tabelas as Record<string, { escritorio_id: string }[]>).flat().map((l) => l.escritorio_id))
    expect([...escritorios]).toEqual(['esc-horizonte'])
  })

  it('fora da demonstração, o token HS256 de demonstração não vale', async () => {
    const demo = await entrar(app, { escritorio_id: 'esc-andrade', usuario_id: 'u3' })
    esquecerTokens()
    config.demonstracao = false
    const r = await sessao(demo)
    expect(r.statusCode).toBe(401)
    config.demonstracao = true
    expect((await sessao(demo)).statusCode).toBe(200)
  })
})

describe('gancho de token (SQL)', () => {
  it('põe escritório, conta e tipo em app_metadata, e tira o que não tem vínculo', async () => {
    const id = randomUUID()
    const sql = banco()
    await sql`insert into conta_auth (auth_id, escritorio_id, tipo, usuario_id) values (${id}, 'esc-andrade', 'equipe', 'u3')`
    const evento = (uid: string) => ({ user_id: uid, claims: { sub: uid, aal: 'aal1', app_metadata: { provider: 'email', escritorio_id: 'esc-forjado' } } })
    const [r] = await sql.begin(async (tx) => {
      await tx`set local role supabase_auth_admin`
      return tx`select heild_interno.gancho_token(${tx.json(evento(id))}) as g, heild_interno.gancho_token(${tx.json(evento(randomUUID()))}) as sem`
    })
    expect(r.g.claims.app_metadata).toEqual({ provider: 'email', escritorio_id: 'esc-andrade', tipo: 'equipe', usuario_id: 'u3' })
    expect(r.sem.claims.app_metadata).toEqual({ provider: 'email' })
  })

  it('o navegador (authenticated) não lê o vínculo', async () => {
    const sql = banco()
    await expect(
      sql.begin(async (tx) => {
        await tx`set local role authenticated`
        return tx`select * from conta_auth`
      }),
    ).rejects.toThrow(/permission denied/)
  })
})

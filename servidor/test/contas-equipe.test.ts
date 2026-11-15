import { createHash, randomUUID } from 'node:crypto'
import { createServer, type Server } from 'node:http'
import { exportJWK, generateKeyPair, SignJWT, type CryptoKey, type JWK } from 'jose'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { config } from '../src/config.ts'
import { esquecerTokens } from '../src/auth/sessao.ts'
import { authAdminMemoria, definirAuthAdmin } from '../src/auth/contas.ts'
import { api, banco, chave, entrar } from './ajuda.ts'

/**
 * Decisão (b) do Enzo, 15/11/2026: contas da equipe por dois caminhos, os dois ligando o login
 * ao cadastro (`conta_auth`) com setor, papel e carteira.
 *  (1) convite por e-mail pelo Supabase Auth;
 *  (2) criação manual só com o e-mail, sem e-mail enviado; o primeiro acesso exige o código de
 *      uso único (48 h), que só o Administrador vê; dá para gerar outro e revogar.
 * O primeiro login ativa a conta; Administrador e Gestor só com o segundo fator.
 * O Supabase Auth é a porta em memória; o JWT de produção, um JWKS de teste (como no auth-producao).
 */

const app = api()
const auth = authAdminMemoria()
let adm: string, ana: string
let servidor: Server
let chavePrivada: CryptoKey
const antes = { url: config.supabaseUrl, jwks: config.supabaseJwksUrl }

const post = async (url: string, token: string | null, corpo: Record<string, unknown>) => {
  const r = await app.inject({ method: 'POST', url, payload: corpo, headers: { ...(token ? { authorization: `Bearer ${token}` } : {}), 'idempotency-key': chave('conta') } })
  return { status: r.statusCode, corpo: r.json() as Record<string, any> }
}
const convidar = (corpo: Record<string, unknown>, token = adm) => post('/v1/equipe/convidar', token, corpo)
const usuarioPorEmail = async (email: string) => (await banco()`select * from usuario where escritorio_id = 'esc-andrade' and email_login = ${email}`)[0]
const login = async (usuarioId: string) => (await banco()`select * from conta_auth where escritorio_id = 'esc-andrade' and usuario_id = ${usuarioId}`)[0]
/** O JWT que o Supabase Auth daria à pessoa (o gancho de token põe escritório, tipo e conta). */
const tokenDe = (authId: string, usuarioId: string, aal = 'aal1') =>
  new SignJWT({ role: 'authenticated', aal, session_id: randomUUID(), app_metadata: { escritorio_id: 'esc-andrade', tipo: 'equipe', usuario_id: usuarioId } })
    .setProtectedHeader({ alg: 'ES256', kid: 'chave-contas' })
    .setSubject(authId)
    .setIssuer(`${config.supabaseUrl}/auth/v1`)
    .setAudience('authenticated')
    .setIssuedAt()
    .setExpirationTime('10m')
    .sign(chavePrivada)
const sessao = async (t: string) => {
  const r = await app.inject({ method: 'GET', url: '/v1/sessao', headers: { authorization: `Bearer ${t}` } })
  return { status: r.statusCode, corpo: r.json() as Record<string, any> }
}

beforeAll(async () => {
  definirAuthAdmin(auth)
  adm = await entrar(app, { escritorio_id: 'esc-andrade' })
  ana = await entrar(app, { escritorio_id: 'esc-andrade', usuario_id: 'u3' })
  const par = await generateKeyPair('ES256')
  chavePrivada = par.privateKey
  const publica: JWK = { ...(await exportJWK(par.publicKey)), kid: 'chave-contas', alg: 'ES256', use: 'sig' }
  servidor = createServer((req, res) => {
    if (req.url === '/auth/v1/.well-known/jwks.json') res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify({ keys: [publica] }))
    else res.writeHead(404).end()
  })
  await new Promise<void>((ok) => servidor.listen(0, '127.0.0.1', ok))
  config.supabaseUrl = `http://127.0.0.1:${(servidor.address() as { port: number }).port}`
  config.supabaseJwksUrl = null
})
beforeEach(() => esquecerTokens())
afterAll(async () => {
  definirAuthAdmin(undefined)
  Object.assign(config, { supabaseUrl: antes.url, supabaseJwksUrl: antes.jwks })
  await app.close()
  await new Promise((ok) => servidor.close(ok))
})

describe('criação manual com código de primeiro acesso', () => {
  it('cria a conta convidada com setor, papel e carteira; o código vem uma vez e só o hash fica no banco', async () => {
    const r = await convidar({ nome: 'Paula Souza', email: 'paula@contabilandrade.com.br', papel: 'colaborador', setores: [{ setor_id: 'fiscal', modo: 'execucao' }], carteira: ['c1'], metodo: 'codigo' })
    expect(r.status).toBe(200)
    const codigo = String(r.corpo.dados.codigo)
    expect(codigo).toMatch(/^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/)
    const horas = (new Date(r.corpo.dados.expira_em).getTime() - Date.now()) / 3_600_000
    expect(horas).toBeGreaterThan(47.9)
    expect(horas).toBeLessThanOrEqual(48)
    const u = await usuarioPorEmail('paula@contabilandrade.com.br')
    expect(u).toMatchObject({ situacao: 'convidado', papel: 'colaborador', nome: 'Paula Souza' })
    expect((await banco()`select setor_id, modo from vinculo_setor where escritorio_id = 'esc-andrade' and usuario_id = ${u.id}`).map((v) => `${v.setor_id}:${v.modo}`)).toEqual(['fiscal:execucao'])
    expect((await banco()`select cliente_id from carteira_cliente where escritorio_id = 'esc-andrade' and usuario_id = ${u.id}`).map((c) => c.cliente_id)).toEqual(['c1'])
    expect(await login(u.id)).toMatchObject({ tipo: 'equipe', usuario_id: u.id })
    const [c] = await banco()`select * from codigo_primeiro_acesso where escritorio_id = 'esc-andrade' and usuario_id = ${u.id}`
    expect(c.codigo_hash).toBe(createHash('sha256').update(codigo.replaceAll('-', '')).digest('hex'))
    expect(JSON.stringify(c)).not.toContain(codigo)
    // Sem e-mail mandado (é o caminho que economiza envios), e nada do código nos eventos.
    expect(auth.convites).not.toContain('paula@contabilandrade.com.br')
    const eventos = await banco()`select texto from evento where escritorio_id = 'esc-andrade' and resultado_ref = ${u.id}`
    expect(eventos.some((e) => /gerou um código de primeiro acesso/.test(e.texto))).toBe(true)
    expect(JSON.stringify(eventos)).not.toContain(codigo)
  })

  it('só quem gerencia contas cria conta; e-mail repetido no escritório é recusado', async () => {
    const membro = await convidar({ nome: 'Xis', email: 'xis@contabilandrade.com.br', papel: 'colaborador', metodo: 'codigo' }, ana)
    expect(membro.status).toBe(403)
    const repetido = await convidar({ nome: 'Ana de novo', email: 'ana@contabilandrade.com.br', papel: 'colaborador', metodo: 'codigo' })
    expect(repetido.status).toBe(409)
    expect(repetido.corpo.codigo).toBe('ID_EM_USO')
  })

  it('primeiro acesso: código errado ou de outro e-mail não vale; o certo define a senha uma vez só', async () => {
    const r = await convidar({ nome: 'Bruno Lima', email: 'bruno.novo@contabilandrade.com.br', papel: 'colaborador', metodo: 'codigo' })
    expect(r.status, JSON.stringify(r.corpo)).toBe(200)
    const codigo = String(r.corpo.dados.codigo)
    const u = await usuarioPorEmail('bruno.novo@contabilandrade.com.br')
    const authId = String((await login(u.id)).auth_id)
    const errado = await post('/v1/auth/primeiro-acesso', null, { email: 'bruno.novo@contabilandrade.com.br', codigo: 'AAAA-BBBB-CCCC', senha: 'senha-nova-1' })
    expect(errado.status).toBe(401)
    expect(errado.corpo.codigo).toBe('CODIGO_INVALIDO')
    // Saber o e-mail de outra pessoa não basta, e o código de uma pessoa não serve para outra.
    const outroEmail = await post('/v1/auth/primeiro-acesso', null, { email: 'ana@contabilandrade.com.br', codigo, senha: 'senha-nova-1' })
    expect(outroEmail.status).toBe(401)
    const fraca = await post('/v1/auth/primeiro-acesso', null, { email: 'bruno.novo@contabilandrade.com.br', codigo, senha: 'semnumero' })
    expect(fraca.status).toBe(400)
    const certo = await post('/v1/auth/primeiro-acesso', null, { email: 'Bruno.Novo@ContabilAndrade.com.br', codigo: codigo.toLowerCase(), senha: 'senha-nova-1' })
    expect(certo.status).toBe(200)
    expect(certo.corpo.dados).toMatchObject({ email: 'bruno.novo@contabilandrade.com.br', exige_mfa: false })
    expect(auth.senhas.get(authId)).toBe('senha-nova-1')
    const de_novo = await post('/v1/auth/primeiro-acesso', null, { email: 'bruno.novo@contabilandrade.com.br', codigo, senha: 'outra-senha-2' })
    expect(de_novo.status).toBe(401)
    expect(auth.senhas.get(authId)).toBe('senha-nova-1')
  })

  it('gerar outro código derruba o anterior; revogar derruba o atual; vencido não vale', async () => {
    const r = await convidar({ nome: 'Clara Dias', email: 'clara@contabilandrade.com.br', papel: 'colaborador', metodo: 'codigo' })
    const u = await usuarioPorEmail('clara@contabilandrade.com.br')
    const primeiro = String(r.corpo.dados.codigo)
    const outro = await post('/v1/equipe/acesso', adm, { usuario_id: u.id, metodo: 'codigo' })
    expect(outro.status).toBe(200)
    const segundo = String(outro.corpo.dados.codigo)
    expect(segundo).not.toBe(primeiro)
    expect((await post('/v1/auth/primeiro-acesso', null, { email: 'clara@contabilandrade.com.br', codigo: primeiro, senha: 'senha-nova-1' })).status).toBe(401)
    expect((await post('/v1/equipe/acesso/revogar', adm, { usuario_id: u.id })).corpo.dados.revogados).toBe(1)
    expect((await post('/v1/auth/primeiro-acesso', null, { email: 'clara@contabilandrade.com.br', codigo: segundo, senha: 'senha-nova-1' })).status).toBe(401)
    const terceiro = String((await post('/v1/equipe/acesso', adm, { usuario_id: u.id, metodo: 'codigo' })).corpo.dados.codigo)
    await banco()`update codigo_primeiro_acesso set expira_em = now() - interval '1 minute' where escritorio_id = 'esc-andrade' and usuario_id = ${u.id} and revogado_em is null`
    expect((await post('/v1/auth/primeiro-acesso', null, { email: 'clara@contabilandrade.com.br', codigo: terceiro, senha: 'senha-nova-1' })).status).toBe(401)
    // O Membro não gera nem revoga.
    expect((await post('/v1/equipe/acesso', ana, { usuario_id: u.id, metodo: 'codigo' })).status).toBe(403)
  })
})

describe('convite por e-mail e o primeiro login', () => {
  it('o convite por e-mail sai pelo Supabase Auth e liga o login; sem código', async () => {
    const r = await convidar({ nome: 'Diego Rocha', email: 'diego@contabilandrade.com.br', papel: 'colaborador', setores: [{ setor_id: 'dp', modo: 'execucao' }], metodo: 'email' })
    expect(r.status).toBe(200)
    expect(r.corpo.dados.codigo).toBeUndefined()
    expect(auth.convites).toContain('diego@contabilandrade.com.br')
    const u = await usuarioPorEmail('diego@contabilandrade.com.br')
    expect(await login(u.id)).toBeTruthy()
  })

  it('o primeiro pedido com o login ativa a conta e aceita o convite', async () => {
    const u = await usuarioPorEmail('diego@contabilandrade.com.br')
    const authId = String((await login(u.id)).auth_id)
    const s = await sessao(await tokenDe(authId, u.id))
    expect(s.status).toBe(200)
    expect((await usuarioPorEmail('diego@contabilandrade.com.br')).situacao).toBe('ativo')
    const [cv] = await banco()`select aceito_em from convite where escritorio_id = 'esc-andrade' and destino = 'diego@contabilandrade.com.br'`
    expect(cv.aceito_em).toBeTruthy()
    // Um login que não é o ligado à conta não ativa nada.
    const r = await convidar({ nome: 'Elisa Prado', email: 'elisa@contabilandrade.com.br', papel: 'colaborador', metodo: 'email' })
    expect(r.status).toBe(200)
    const elisa = await usuarioPorEmail('elisa@contabilandrade.com.br')
    expect((await sessao(await tokenDe(randomUUID(), elisa.id))).status).toBe(403)
    expect((await usuarioPorEmail('elisa@contabilandrade.com.br')).situacao).toBe('convidado')
  })

  it('Gestor (e Administrador) só ativa com o segundo fator', async () => {
    await convidar({ nome: 'Fábio Gestor', email: 'fabio@contabilandrade.com.br', papel: 'gestor', setores: [{ setor_id: 'contabil', modo: 'gestao' }], metodo: 'codigo' })
    const u = await usuarioPorEmail('fabio@contabilandrade.com.br')
    const authId = String((await login(u.id)).auth_id)
    const sem = await sessao(await tokenDe(authId, u.id, 'aal1'))
    expect(sem.status).toBe(401)
    expect(sem.corpo.codigo).toBe('EXIGE_MFA')
    expect((await usuarioPorEmail('fabio@contabilandrade.com.br')).situacao).toBe('convidado')
    const com = await sessao(await tokenDe(authId, u.id, 'aal2'))
    expect(com.status).toBe(200)
    expect(await usuarioPorEmail('fabio@contabilandrade.com.br')).toMatchObject({ situacao: 'ativo', segundo_fator: true })
  })
})

describe('demonstração', () => {
  it('tocar na conta convidada (o link do convite) ativa a conta e entra', async () => {
    const r = await post('/v1/auth/demonstracao/primeiro-acesso', null, { escritorio_id: 'esc-andrade', usuario_id: 'u5', nome: 'Carla Mendes' })
    expect(r.status).toBe(200)
    expect(r.corpo.token).toBeTruthy()
    expect((await banco()`select situacao from usuario where escritorio_id = 'esc-andrade' and id = 'u5'`)[0].situacao).toBe('ativo')
    expect((await sessao(String(r.corpo.token))).status).toBe(200)
    const de_novo = await post('/v1/auth/demonstracao/primeiro-acesso', null, { escritorio_id: 'esc-andrade', usuario_id: 'u5' })
    expect(de_novo.status).toBe(403)
  })
})

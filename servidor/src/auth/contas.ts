import { createHash, randomBytes, randomUUID } from 'node:crypto'
import { z } from 'zod'
import { autorizar, codigoDaNegacao, comBanco, nomeDoAtor, novoIdPadrao, registrarEvento, type Contexto, type Registro } from '@heild/dominio'
import { config } from '../config.ts'
import { noEscritorio, type Sql, type Tx } from '../banco/pg.ts'
import { BancoServidor } from '../executor/banco-servidor.ts'
import { gravarEventos } from '../executor/cadeia.ts'
import { erroDeEntrada, ErroApi } from '../executor/erro.ts'
import { executar, traduzir, type Resultado } from '../executor/executor.ts'
import { invalidarEscritorio } from './cache-perfil.ts'
import type { Sessao } from './sessao.ts'

/**
 * Contas da equipe (decisão (b) do Enzo, 15/11/2026). Dois caminhos, os dois permitidos, e os
 * dois ligam o login (Supabase Auth) ao cadastro em `conta_auth`, com setor, papel e carteira:
 *
 *  1. Convite por e-mail: o Supabase Auth manda o link; a pessoa cria a senha lá.
 *  2. Criação manual, sem e-mail enviado: o Administrador cria a conta só com o e-mail e recebe
 *     um código de uso único (48 h), que só ele vê e entrega à pessoa. No primeiro acesso, a
 *     pessoa informa e-mail, código e a senha nova (`POST /v1/auth/primeiro-acesso`). Sem o
 *     código, saber o e-mail não basta para tomar a conta. Dá para gerar outro (o anterior deixa
 *     de valer) e para revogar. O código só existe como hash no banco.
 *
 * A conta nasce `convidado` e vira `ativo` no primeiro pedido com o login dela (`ativarNoPrimeiroAcesso`);
 * Administrador e Gestor só ativam com o segundo fator (aal2): definem o MFA no primeiro acesso.
 */

/** A Admin API do Supabase Auth (só no servidor, com a chave de serviço). */
export interface AuthAdmin {
  /** Convida por e-mail (o Supabase manda o link). Devolve o id do login. */
  convidar(email: string): Promise<string>
  /** Cria o login sem mandar e-mail (o primeiro acesso é pelo código). Devolve o id do login. */
  criar(email: string): Promise<string>
  definirSenha(authId: string, senha: string): Promise<void>
}

export function authAdminSupabase(url: string, chave: string): AuthAdmin {
  const pedir = async (metodo: string, caminho: string, corpo: unknown) => {
    const r = await fetch(`${url}/auth/v1${caminho}`, { method: metodo, headers: { apikey: chave, authorization: `Bearer ${chave}`, 'content-type': 'application/json' }, body: JSON.stringify(corpo) })
    const j = (await r.json().catch(() => ({}))) as Record<string, unknown>
    if (r.ok) return j
    if (r.status === 422 && /already|registered|exists/i.test(JSON.stringify(j))) throw new ErroApi('ID_EM_USO', { campo: 'email', mensagem: 'Esse e-mail já tem login no Heild.' })
    throw new ErroApi('ERRO_INTERNO', { mensagem: `O Supabase Auth recusou (${r.status}).` })
  }
  return {
    convidar: async (email) => String((await pedir('POST', '/invite', { email })).id),
    criar: async (email) => String((await pedir('POST', '/admin/users', { email, email_confirm: true })).id),
    definirSenha: async (id, senha) => void (await pedir('PUT', `/admin/users/${id}`, { password: senha })),
  }
}

/** Demonstração e testes: nada sai da máquina (o "e-mail" fica anotado aqui). */
export function authAdminMemoria() {
  const logins = new Map<string, string>()
  const senhas = new Map<string, string>()
  const convites: string[] = []
  const novo = (email: string) => {
    if ([...logins.values()].includes(email.toLowerCase())) throw new ErroApi('ID_EM_USO', { campo: 'email', mensagem: 'Esse e-mail já tem login no Heild.' })
    const id = randomUUID()
    logins.set(id, email.toLowerCase())
    return id
  }
  const a: AuthAdmin & { senhas: Map<string, string>; convites: string[] } = {
    senhas,
    convites,
    convidar: async (email) => {
      convites.push(email)
      // Reenviar: o mesmo login recebe o link de novo.
      return [...logins.entries()].find(([, e]) => e === email.toLowerCase())?.[0] ?? novo(email)
    },
    criar: async (email) => novo(email),
    definirSenha: async (id, senha) => void senhas.set(id, senha),
  }
  return a
}

let porta: AuthAdmin | null | undefined
function authAdmin(): AuthAdmin {
  if (porta === undefined) porta = config.supabaseUrl && config.supabaseChaveServico ? authAdminSupabase(config.supabaseUrl, config.supabaseChaveServico) : config.demonstracao ? authAdminMemoria() : null
  if (!porta) throw new ErroApi('REGRA_DE_NEGOCIO', { mensagem: 'A API não tem a chave de serviço do Supabase (HEILD_SUPABASE_SERVICE_ROLE_KEY): não dá para criar o login.' })
  return porta
}
/** Testes: troca a porta (memória) ou volta ao padrão (undefined). */
export const definirAuthAdmin = (a: AuthAdmin | null | undefined) => void (porta = a)

/* ---------- Código de primeiro acesso ---------- */

const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const VALIDADE_CODIGO_MS = 48 * 3_600_000
const VALIDADE_CONVITE_MS = 7 * 86_400_000

/** 12 caracteres sem os que se confundem (0/O, 1/I), em três grupos: `K7QH-2M9X-PL4D` (60 bits). */
function novoCodigo(): string {
  const b = randomBytes(12)
  const c = [...b].map((x) => ALFABETO[x % 32]).join('')
  return `${c.slice(0, 4)}-${c.slice(4, 8)}-${c.slice(8)}`
}
const hashDoCodigo = (codigo: string) => createHash('sha256').update(codigo.toUpperCase().replace(/[^A-Z0-9]/g, '')).digest('hex')

/* ---------- Entradas ---------- */

const Setor = z.object({ setor_id: z.string().min(1).max(60), modo: z.enum(['gestao', 'execucao']) }).strict()
export const EntradaConvite = z
  .object({
    nome: z.string().trim().min(1).max(120),
    email: z.email().max(200),
    papel: z.enum(['administrador', 'gestor', 'colaborador']),
    cargo: z.string().max(120).optional(),
    setores: z.array(Setor).max(20).default([]),
    carteira: z.array(z.string().min(1).max(80)).max(500).default([]),
    metodo: z.enum(['email', 'codigo']),
  })
  .strict()
export const EntradaAcesso = z.object({ usuario_id: z.string().min(1).max(80), metodo: z.enum(['email', 'codigo']) }).strict()
export const EntradaRevogar = z.object({ usuario_id: z.string().min(1).max(80) }).strict()
export const EntradaPrimeiroAcesso = z
  .object({
    email: z.email().max(200),
    codigo: z.string().min(12).max(20),
    senha: z.string().min(8, 'A senha precisa de pelo menos 8 caracteres.').max(200).regex(/\d/, 'A senha precisa de pelo menos um número.'),
  })
  .strict()

/* ---------- Operações ---------- */

/** Só quem gerencia contas (o mesmo `conta.usuario.salvar` da tela de Usuários). */
function exigirQuemGerenciaContas(s: Sessao) {
  if (s.ctx.ator.tipo !== 'pessoa') throw new ErroApi('NEGADO', { mensagem: 'Só uma pessoa da equipe cria contas.' })
  const d = autorizar(s.ctx, 'conta.usuario.salvar', {})
  if (!d.permitido) throw new ErroApi(codigoDaNegacao(d.motivo), { mensagem: d.motivo, ferramenta: 'conta.usuario.salvar' })
}

/**
 * Cria a conta (pessoa, usuário `convidado`, setores, carteira e o convite) pelo executor, e
 * depois o login e o acesso: convite por e-mail ou código. Devolve o código uma vez só.
 */
export async function convidar(sql: Sql, s: Sessao, bruto: unknown, chave: string | null): Promise<Resultado> {
  try {
    exigirQuemGerenciaContas(s)
    const e = EntradaConvite.safeParse(bruto)
    if (!e.success) throw erroDeEntrada(e.error.issues)
    const d = e.data
    const email = d.email.toLowerCase()
    const [jaExiste] = await noEscritorio(sql, { sub: s.claims.sub, escritorio_id: s.claims.escritorio_id }, (tx) => tx`select id from usuario where lower(email_login) = ${email}`)
    if (jaExiste) throw new ErroApi('ID_EM_USO', { campo: 'email', mensagem: `Já existe uma conta com o e-mail ${email} neste escritório.` })
    const agora = new Date()
    const usuarioId = novoIdPadrao('u')
    const pessoaId = novoIdPadrao('pe')
    const vale = new Date(agora.getTime() + (d.metodo === 'codigo' ? VALIDADE_CODIGO_MS : VALIDADE_CONVITE_MS)).toISOString()
    const gravar = [
      { tabela: 'pessoa', linha: { id: pessoaId, nome: d.nome, tipo: 'equipe' } },
      { tabela: 'usuario', linha: { id: usuarioId, pessoa_id: pessoaId, nome: d.nome, papel: d.papel, email_login: email, situacao: 'convidado', cargo: d.cargo ?? null, segundo_fator: false, preferencias: {} } },
      ...d.setores.map((v) => ({ tabela: 'vinculo_setor', linha: { id: novoIdPadrao('vs'), usuario_id: usuarioId, setor_id: v.setor_id, modo: v.modo, vigente_de: agora.toISOString().slice(0, 10) } })),
      ...d.carteira.map((c) => ({ tabela: 'carteira_cliente', linha: { id: novoIdPadrao('cc'), usuario_id: usuarioId, cliente_id: c } })),
      { tabela: 'convite', linha: { id: novoIdPadrao('cv'), tipo: 'usuario_escritorio', destino: email, papel_proposto: d.papel, setores_propostos: d.setores.map((v) => v.setor_id), expira_em: vale, enviado_por: s.claims.sub, extras: { metodo: d.metodo } } },
    ]
    const r = await executar(sql, { sessao: s, comando: { tipo: 'linhas', gravar, remover: [] } as never, chave, validarApenas: false, rotulo: 'equipe.convidar', confiavel: false, entradaOriginal: d })
    if (r.status !== 200) return r
    const acesso = await darAcesso(sql, s, usuarioId, d.metodo)
    const corpo = r.corpo as Record<string, unknown>
    return { status: 200, corpo: { ...corpo, dados: { usuario_id: usuarioId, ...acesso } } }
  } catch (x) {
    const erro = traduzir(x)
    if (erro.status === 500) console.error('[heild] erro interno ao criar conta:', x)
    return { status: erro.status, corpo: erro.corpo() }
  }
}

/** Reenviar o convite ou gerar outro código (o anterior deixa de valer). Cria o login se faltar. */
export async function novoAcesso(sql: Sql, s: Sessao, bruto: unknown): Promise<Resultado> {
  try {
    exigirQuemGerenciaContas(s)
    const e = EntradaAcesso.safeParse(bruto)
    if (!e.success) throw erroDeEntrada(e.error.issues)
    return { status: 200, corpo: { resultado: 'ok', dados: { usuario_id: e.data.usuario_id, ...(await darAcesso(sql, s, e.data.usuario_id, e.data.metodo)) } } }
  } catch (x) {
    const erro = traduzir(x)
    if (erro.status === 500) console.error('[heild] erro interno no acesso da conta:', x)
    return { status: erro.status, corpo: erro.corpo() }
  }
}

export async function revogarCodigo(sql: Sql, s: Sessao, bruto: unknown): Promise<Resultado> {
  try {
    exigirQuemGerenciaContas(s)
    const e = EntradaRevogar.safeParse(bruto)
    if (!e.success) throw erroDeEntrada(e.error.issues)
    const n = await noEscritorio(sql, { sub: s.claims.sub, escritorio_id: s.claims.escritorio_id }, async (tx) => {
      const [u] = await tx`select id, nome from usuario where id = ${e.data.usuario_id}`
      if (!u) throw new ErroApi('NAO_ENCONTRADO', { campo: 'usuario_id' })
      const revogados = await tx`update codigo_primeiro_acesso set revogado_em = now() where usuario_id = ${u.id} and usado_em is null and revogado_em is null returning id`
      if (revogados.length) await evento(tx, s.claims, s.ctx, { nome: 'conta.codigo.revogar', texto: `${nomeDoAtor(s.ctx.ator)} revogou o código de primeiro acesso de ${u.nome}`, ref: String(u.id) })
      return revogados.length
    })
    return { status: 200, corpo: { resultado: 'ok', dados: { usuario_id: e.data.usuario_id, revogados: n } } }
  } catch (x) {
    const erro = traduzir(x)
    return { status: erro.status, corpo: erro.corpo() }
  }
}

/** O login (se faltar) e o acesso: convite por e-mail ou código novo. */
async function darAcesso(sql: Sql, s: Sessao, usuarioId: string, metodo: 'email' | 'codigo'): Promise<{ metodo: string; codigo?: string; expira_em?: string }> {
  const claims = { sub: s.claims.sub, escritorio_id: s.claims.escritorio_id }
  const [u] = await noEscritorio(sql, claims, (tx) => tx`select u.id, u.nome, u.email_login, u.situacao, a.auth_id from usuario u left join conta_auth a on a.usuario_id = u.id where u.id = ${usuarioId}`)
  if (!u) throw new ErroApi('NAO_ENCONTRADO', { campo: 'usuario_id', mensagem: `Não encontrei a conta ${usuarioId}.` })
  if (u.situacao !== 'convidado') throw new ErroApi('REGRA_DE_NEGOCIO', { mensagem: 'A conta já fez o primeiro acesso: código e convite só valem antes dele.' })
  const auth = authAdmin()
  // Convite por e-mail: o Supabase manda o link (de novo, se já havia login). Código: o login nasce sem e-mail.
  const email = String(u.email_login)
  const authId = metodo === 'email' ? await auth.convidar(email) : u.auth_id ? String(u.auth_id) : await auth.criar(email)
  if (u.auth_id && String(u.auth_id) !== authId) throw new ErroApi('REGRA_DE_NEGOCIO', { mensagem: 'O login do Supabase deste e-mail não é o ligado à conta.' })
  const codigo = metodo === 'codigo' ? novoCodigo() : undefined
  const expira = metodo === 'codigo' ? new Date(Date.now() + VALIDADE_CODIGO_MS).toISOString() : undefined
  await noEscritorio(sql, claims, async (tx) => {
    if (!u.auth_id) await tx`insert into conta_auth (auth_id, escritorio_id, tipo, usuario_id) values (${authId}, ${s.claims.escritorio_id}, 'equipe', ${usuarioId})`
    if (codigo) {
      await tx`update codigo_primeiro_acesso set revogado_em = now() where usuario_id = ${usuarioId} and usado_em is null and revogado_em is null`
      await tx`insert into codigo_primeiro_acesso (escritorio_id, usuario_id, auth_id, codigo_hash, expira_em, criado_por) values (${s.claims.escritorio_id}, ${usuarioId}, ${authId}, ${hashDoCodigo(codigo)}, ${expira!}, ${s.claims.sub})`
    }
    await evento(tx, s.claims, s.ctx, {
      nome: metodo === 'codigo' ? 'conta.codigo.gerar' : 'conta.convite.enviar',
      texto: metodo === 'codigo' ? `${nomeDoAtor(s.ctx.ator)} gerou um código de primeiro acesso para ${u.nome} (vale 48 h)` : `${nomeDoAtor(s.ctx.ator)} enviou o convite por e-mail para ${u.nome}`,
      ref: usuarioId,
    })
  })
  return { metodo, ...(codigo ? { codigo, expira_em: expira } : {}) }
}

/**
 * Primeiro acesso pelo código (sem sessão: a pessoa ainda não tem senha). E-mail, código e a senha
 * nova; o código vale uma vez. A resposta é a mesma para código errado, vencido, usado ou revogado.
 */
export async function primeiroAcesso(sql: Sql, bruto: unknown): Promise<Resultado> {
  try {
    const e = EntradaPrimeiroAcesso.safeParse(bruto)
    if (!e.success) throw erroDeEntrada(e.error.issues)
    const h = hashDoCodigo(e.data.codigo)
    const [c] = await sql.begin(async (tx) => {
      await tx`select set_config('role', 'api_executor', true)`
      return tx`select * from heild_interno.codigo_por_hash(${h})`
    })
    if (!c || c.usado_em || c.revogado_em || new Date(c.expira_em) < new Date()) throw new ErroApi('CODIGO_INVALIDO')
    const claims = { sub: 'primeiro-acesso', escritorio_id: String(c.escritorio_id) }
    const [u] = await noEscritorio(sql, claims, (tx) => tx`select id, nome, papel, email_login, situacao from usuario where id = ${c.usuario_id}`)
    if (!u || String(u.email_login).toLowerCase() !== e.data.email.toLowerCase() || u.situacao !== 'convidado') throw new ErroApi('CODIGO_INVALIDO')
    await authAdmin().definirSenha(String(c.auth_id), e.data.senha)
    await noEscritorio(sql, claims, async (tx) => {
      const usado = await tx`update codigo_primeiro_acesso set usado_em = now() where id = ${c.id} and usado_em is null and revogado_em is null returning id`
      if (!usado.length) throw new ErroApi('CODIGO_INVALIDO')
      await evento(tx, { sub: 'sistema', escritorio_id: String(c.escritorio_id), sid: null }, { ator: { tipo: 'sistema' }, origem: 'tela' } as Contexto, { nome: 'conta.primeiro_acesso', texto: `${u.nome} definiu a senha no primeiro acesso (código entregue pelo Administrador)`, ref: String(u.id) })
    })
    return { status: 200, corpo: { resultado: 'ok', dados: { email: String(u.email_login), exige_mfa: config.mfaPapeis.includes(String(u.papel)) } } }
  } catch (x) {
    const erro = traduzir(x)
    if (erro.status === 500) console.error('[heild] erro interno no primeiro acesso:', x)
    return { status: erro.status, corpo: erro.corpo() }
  }
}

/**
 * O primeiro pedido com o login da conta `convidado` (convite aceito no Supabase, ou senha
 * definida pelo código): a conta vira `ativo` e o convite, aceito. Administrador e Gestor só
 * com o segundo fator. Devolve se ativou (o chamador recarrega o perfil).
 */
export async function ativarNoPrimeiroAcesso(tx: Tx, o: { escritorio_id: string; usuario_id: string; auth_sub?: string; aal?: string; nome?: string; demonstracao?: boolean }): Promise<boolean> {
  const [u] = await tx`select id, nome, papel, email_login, situacao from usuario where id = ${o.usuario_id}`
  if (!u || u.situacao !== 'convidado') return false
  if (!o.demonstracao) {
    const [ligado] = await tx`select 1 from conta_auth where auth_id = ${o.auth_sub ?? null} and usuario_id = ${o.usuario_id}`
    if (!ligado) return false
    if (config.mfaPapeis.includes(String(u.papel)) && o.aal !== 'aal2')
      throw new ErroApi('EXIGE_MFA', { mensagem: 'Primeiro acesso: configure o segundo fator (aplicativo autenticador) para concluir. Administrador e Gestor entram sempre com ele.' })
  }
  const nome = o.nome?.trim() || String(u.nome)
  await tx`update usuario set situacao = 'ativo', nome = ${nome}, segundo_fator = ${o.aal === 'aal2' || Boolean(u.segundo_fator)} where id = ${u.id}`
  await tx`update convite set aceito_em = now() where lower(destino) = ${String(u.email_login).toLowerCase()} and tipo = 'usuario_escritorio' and aceito_em is null and recusado_em is null`
  const ctx: Contexto = { ator: { tipo: 'sistema' }, origem: 'tela' } as Contexto
  await evento(tx, { sub: String(u.id), escritorio_id: o.escritorio_id, sid: null }, ctx, { nome: 'conta.ativar', texto: `${nome} aceitou o convite e entrou pela primeira vez`, ref: String(u.id) })
  invalidarEscritorio(o.escritorio_id)
  return true
}

/** Evento na cadeia, na transação. */
async function evento(tx: Tx, claims: { sub?: string; escritorio_id: string; sid?: string | null }, ctx: Contexto, e: { nome: string; texto: string; ref: string }) {
  const bs = new BancoServidor(claims.escritorio_id)
  comBanco(bs, () => bs.transacao((t) => registrarEvento(t, ctx, { nome: e.nome, ferramenta: 'conta.usuario.salvar', texto: e.texto, resultado_ref: e.ref })))
  const linhas = bs.escritas.filter((x) => x.tabela === 'evento' && x.linha).map((x) => x.linha!) as Registro[]
  await gravarEventos(tx, claims.escritorio_id, linhas, { sessao_auth_id: claims.sid ?? null, idempotencia_chave: null })
}

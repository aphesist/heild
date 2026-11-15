import { createRemoteJWKSet, decodeProtectedHeader, jwtVerify, SignJWT, type JWTPayload } from 'jose'
import { contaParaTela, perfilDeConta, rotuloSetorCurto, type Contexto, type Perfil } from '@heild/dominio'
import { config } from '../config.ts'
import { noEscritorio, type Sql, type Tx } from '../banco/pg.ts'
import { ErroApi } from '../executor/erro.ts'
import { guardarPerfil, lerPerfil } from './cache-perfil.ts'
import { ativarNoPrimeiroAcesso } from './contas.ts'

/**
 * Sessão: quem chama e de que escritório. O escritório vem SÓ do token (R3), nunca da URL
 * ou do corpo.
 *
 * Dois emissores (B5):
 *  - produção: o JWT do Supabase Auth (ES256 ou RS256), verificado pelo JWKS do projeto,
 *    com emissor `<projeto>/auth/v1` e público `authenticated`. O escritório, a conta e o
 *    tipo vêm de `app_metadata`, gravado pelo gancho de token em SQL
 *    (`heild_interno.gancho_token`, migração da B5) a partir de `conta_auth`. O Administrador
 *    só entra com o segundo fator (`aal2`; `HEILD_MFA_PAPEIS`).
 *  - demonstração (só com HEILD_DEMONSTRACAO=1): o token HS256 que esta API assina em
 *    `POST /v1/auth/demonstracao`, no mesmo formato de claims.
 */

export type TipoSessao = 'equipe' | 'cliente'

export interface ClaimsToken {
  /** A conta no domínio: o id do usuário (equipe) ou `cliente:<id>` (app do cliente). */
  sub: string
  /** O id do login no Supabase Auth (auth.users), quando o token é de produção. */
  auth_sub?: string
  /** Nível de garantia da autenticação: `aal2` quando passou pelo segundo fator. */
  aal?: 'aal1' | 'aal2'
  escritorio_id: string
  tipo: TipoSessao
  /** Só no app do cliente: o cliente e o nome da pessoa. */
  cliente_id?: string | null
  nome?: string
  /** Id da sessão de autenticação (vai para o evento: `sessao_auth_id`). */
  sid: string
}

export interface Sessao {
  claims: ClaimsToken
  ctx: Contexto
  /** O perfil materializado (equipe); nulo no app do cliente. */
  perfil: Perfil | null
}

const chave = () => new TextEncoder().encode(config.segredoToken)
const EMISSOR = 'heild-api-local'

export async function emitirToken(c: Omit<ClaimsToken, 'sid'>, horas = 12): Promise<{ token: string; expira_em: string }> {
  const sid = `sa${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
  const exp = Math.floor(Date.now() / 1000) + horas * 3600
  const token = await new SignJWT({ escritorio_id: c.escritorio_id, tipo: c.tipo, cliente_id: c.cliente_id ?? null, nome: c.nome, sid, app_metadata: { escritorio_id: c.escritorio_id } })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(c.sub)
    .setIssuer(EMISSOR)
    .setIssuedAt()
    .setExpirationTime(exp)
    .sign(chave())
  return { token, expira_em: new Date(exp * 1000).toISOString() }
}

/** Chaves do projeto Supabase (o jose guarda e renova sozinho; só busca de novo com `kid` desconhecido). */
let jwks: { url: string; conjunto: ReturnType<typeof createRemoteJWKSet> } | null = null
function chavesSupabase() {
  const url = config.supabaseJwksUrl ?? (config.supabaseUrl ? `${config.supabaseUrl}/auth/v1/.well-known/jwks.json` : null)
  if (!url) return null
  if (jwks?.url !== url) jwks = { url, conjunto: createRemoteJWKSet(new URL(url), { cooldownDuration: 30_000, cacheMaxAge: 600_000, timeoutDuration: 5_000 }) }
  return jwks.conjunto
}

/** Token verificado fica em memória até o `exp` (STACK 5): o pedido seguinte não refaz a criptografia. */
const verificados = new Map<string, { claims: ClaimsToken; exp: number }>()
const MAX_VERIFICADOS = 5_000

function lembrar(token: string, claims: ClaimsToken, exp: number | undefined) {
  if (!exp) return
  if (verificados.size >= MAX_VERIFICADOS) verificados.delete(verificados.keys().next().value!)
  verificados.set(token, { claims, exp })
}

/** Claims do Supabase → claims da sessão. O que manda é `app_metadata`, que só o servidor do Auth grava. */
function claimsDoSupabase(p: JWTPayload): ClaimsToken {
  const meta = (p.app_metadata ?? {}) as Record<string, unknown>
  const escritorio = typeof meta.escritorio_id === 'string' && meta.escritorio_id ? meta.escritorio_id : null
  const tipo = meta.tipo === 'cliente' ? 'cliente' : meta.tipo === 'equipe' || meta.tipo === undefined ? 'equipe' : null
  const conta = tipo === 'cliente' ? (typeof meta.cliente_id === 'string' ? meta.cliente_id : null) : typeof meta.usuario_id === 'string' ? meta.usuario_id : null
  if (!escritorio || !tipo || !conta || !p.sub) throw new ErroApi('CONTA_SEM_VINCULO')
  const aal = p.aal === 'aal2' ? 'aal2' : 'aal1'
  const sid = typeof p.session_id === 'string' ? p.session_id : `sb-${p.sub}`
  return tipo === 'cliente'
    ? { sub: `cliente:${conta}`, auth_sub: p.sub, aal, escritorio_id: escritorio, tipo, cliente_id: conta, nome: typeof meta.nome === 'string' ? meta.nome : undefined, sid }
    : { sub: conta, auth_sub: p.sub, aal, escritorio_id: escritorio, tipo, sid }
}

export async function verificarToken(autorizacao: string | undefined): Promise<ClaimsToken> {
  if (!autorizacao?.startsWith('Bearer ')) throw new ErroApi('SEM_SESSAO')
  const token = autorizacao.slice(7)
  const guardado = verificados.get(token)
  if (guardado) {
    if (guardado.exp * 1000 > Date.now()) return guardado.claims
    verificados.delete(token)
  }
  try {
    const alg = decodeProtectedHeader(token).alg
    if (alg === 'HS256') {
      // Token de demonstração: só existe com a demonstração ligada (PADROES, API8).
      if (!config.demonstracao) throw new ErroApi('SESSAO_INVALIDA', { mensagem: 'Token de demonstração não vale fora do ambiente local.' })
      const { payload } = await jwtVerify(token, chave(), { issuer: EMISSOR, algorithms: ['HS256'] })
      const escritorio = typeof payload.escritorio_id === 'string' ? payload.escritorio_id : null
      const tipo = payload.tipo === 'cliente' ? 'cliente' : payload.tipo === 'equipe' ? 'equipe' : null
      if (!payload.sub || !escritorio || !tipo || typeof payload.sid !== 'string') throw new Error('claims incompletas')
      const claims: ClaimsToken = { sub: payload.sub, escritorio_id: escritorio, tipo, cliente_id: (payload.cliente_id as string | null) ?? null, nome: payload.nome as string | undefined, sid: payload.sid, aal: payload.aal === 'aal2' ? 'aal2' : 'aal1' }
      lembrar(token, claims, payload.exp)
      return claims
    }
    const chaves = chavesSupabase()
    if (!chaves || !config.supabaseUrl) throw new ErroApi('SESSAO_INVALIDA', { mensagem: 'A API não tem um projeto Supabase configurado (HEILD_SUPABASE_URL).' })
    const { payload } = await jwtVerify(token, chaves, { issuer: `${config.supabaseUrl}/auth/v1`, audience: 'authenticated', algorithms: ['ES256', 'RS256'], clockTolerance: 5 })
    const claims = claimsDoSupabase(payload)
    lembrar(token, claims, payload.exp)
    return claims
  } catch (e) {
    if (e instanceof ErroApi) throw e
    throw new ErroApi('SESSAO_INVALIDA')
  }
}

/** Esvazia o cache de tokens verificados (testes). */
export const esquecerTokens = () => verificados.clear()

/** Monta o perfil da conta a partir do banco, pela mesma função que a sessão do app usa. */
export async function carregarPerfil(tx: Tx, usuarioId: string): Promise<Perfil | null> {
  const [usuario] = await tx`select * from usuario where id = ${usuarioId}`
  if (!usuario || usuario.situacao !== 'ativo') return null
  const [vinculos, excecoes, carteira, escritorio, assinatura] = await Promise.all([
    tx`select * from vinculo_setor where usuario_id = ${usuarioId}`,
    tx`select * from excecao_tela where usuario_id = ${usuarioId}`,
    tx`select usuario_id, cliente_id from carteira_cliente where usuario_id = ${usuarioId}`,
    tx`select carteira_ligada from escritorio limit 1`,
    // O app usa a primeira linha da tabela assinatura (useTabela('assinatura')[0]): mesma ordem aqui.
    tx`select modulos from assinatura order by ordem nulls last, criado_em limit 1`,
  ])
  const conta = contaParaTela(usuario as never, vinculos as never, excecoes as never, carteira as never)
  return perfilDeConta(conta, { carteira_ligada: Boolean(escritorio[0]?.carteira_ligada), modulos: (assinatura[0]?.modulos as Perfil['modulos']) ?? [] })
}

/**
 * Sessão de um pedido. `integranteId` (cabeçalho X-Heild-Integrante, só na demonstração):
 * o integrante age em nome da pessoa do token e nunca passa do que ela pode (R4).
 * Na produção, o integrante chega com o token próprio emitido para o orquestrador (B2).
 */
/** O integrante agindo em nome do dono (nunca passa do que o dono pode, R4). Nulo se não existe. */
export async function contextoDoIntegrante(tx: Tx, integranteId: string, dono: Perfil): Promise<Contexto | null> {
  const [i] = await tx`select id, nome_exibido, setor from integrante where id = ${integranteId}`
  if (!i) return null
  const nome = (i.nome_exibido as string | null) ?? (rotuloSetorCurto as Record<string, string>)[String(i.setor)] ?? String(i.setor)
  // Nos textos, o integrante leva o sufixo, como no wireframe e na semente ("Contas a Pagar (integrante)").
  return { ator: { tipo: 'integrante', id: String(i.id), nome: `${nome} (integrante)`, dono }, origem: 'chat' }
}

export async function abrirSessao(sql: Sql, claims: ClaimsToken, integranteId?: string): Promise<Sessao> {
  if (claims.tipo === 'cliente') {
    if (integranteId) throw new ErroApi('NEGADO', { mensagem: 'O app do cliente não age como integrante.' })
    return { claims, perfil: null, ctx: { ator: { tipo: 'pessoa_cliente', nome: claims.nome ?? 'Cliente', cliente_id: claims.cliente_id ?? undefined }, origem: 'tela' } }
  }
  // Perfil em cache: o pedido comum não abre transação só para montar a sessão.
  const guardado = lerPerfil(claims.escritorio_id, claims.sub)
  // Conta inativa no cache com login de produção: pode ser o primeiro acesso (abre o banco para ativar).
  const precisaBanco = guardado === undefined || (guardado === null && !!claims.auth_sub) || !!integranteId
  const montar = async (tx: Tx | null): Promise<Sessao> => {
    let perfil = guardado
    if (perfil === undefined || (perfil === null && tx)) {
      perfil = await carregarPerfil(tx!, claims.sub)
      guardarPerfil(claims.escritorio_id, claims.sub, perfil)
    }
    // Conta `convidado` entrando pela primeira vez com o próprio login (convite aceito no
    // Supabase ou senha definida pelo código): ativa aqui (Administrador e Gestor, só com MFA).
    if (!perfil && tx && claims.auth_sub && (await ativarNoPrimeiroAcesso(tx, { escritorio_id: claims.escritorio_id, usuario_id: claims.sub, auth_sub: claims.auth_sub, aal: claims.aal }))) {
      perfil = await carregarPerfil(tx, claims.sub)
      guardarPerfil(claims.escritorio_id, claims.sub, perfil)
    }
    if (!perfil) throw new ErroApi('CONTA_INATIVA')
    // MFA onde o desenho pede: o Administrador só usa a API com o segundo fator (aal2).
    // O token de demonstração (sem login do Supabase) só existe com a demonstração ligada.
    if (config.mfaPapeis.includes(perfil.papel) && claims.aal !== 'aal2' && !(config.demonstracao && claims.auth_sub === undefined))
      throw new ErroApi('EXIGE_MFA', { mensagem: 'Entre com o segundo fator (código do aplicativo autenticador) para continuar.' })
    if (integranteId) {
      if (!config.demonstracao) throw new ErroApi('DEMONSTRACAO_DESLIGADA', { mensagem: 'Integrante só age com o token próprio (orquestrador).' })
      const ctx = await contextoDoIntegrante(tx!, integranteId, perfil)
      if (!ctx) throw new ErroApi('NAO_ENCONTRADO', { campo: 'X-Heild-Integrante', mensagem: `Não encontrei o integrante ${integranteId}.` })
      return { claims, perfil, ctx }
    }
    return { claims, perfil, ctx: { ator: { tipo: 'pessoa', perfil }, origem: 'tela' } }
  }
  return precisaBanco ? noEscritorio(sql, { sub: claims.sub, escritorio_id: claims.escritorio_id }, (tx) => montar(tx)) : montar(null)
}

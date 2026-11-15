import { jwtVerify, SignJWT } from 'jose'
import { contaParaTela, perfilDeConta, rotuloSetorCurto, type Contexto, type Perfil } from '@heild/dominio'
import { config } from '../config.ts'
import { noEscritorio, type Sql, type Tx } from '../banco/pg.ts'
import { ErroApi } from '../executor/erro.ts'

/**
 * Sessão: quem chama e de que escritório. O escritório vem SÓ do token (R3), nunca da URL
 * ou do corpo.
 *
 * No B1 o token é o de demonstração (HS256, assinado por esta API, `POST /v1/auth/demonstracao`).
 * Em produção é o JWT do Supabase Auth (ES256, verificado pelo JWKS), com o mesmo
 * `app_metadata.escritorio_id`: trocar é trocar `verificarToken`, o resto não muda.
 */

export type TipoSessao = 'equipe' | 'cliente'

export interface ClaimsToken {
  sub: string
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

export async function verificarToken(autorizacao: string | undefined): Promise<ClaimsToken> {
  if (!autorizacao?.startsWith('Bearer ')) throw new ErroApi('SEM_SESSAO')
  try {
    const { payload } = await jwtVerify(autorizacao.slice(7), chave(), { issuer: EMISSOR, algorithms: ['HS256'] })
    const escritorio = typeof payload.escritorio_id === 'string' ? payload.escritorio_id : null
    const tipo = payload.tipo === 'cliente' ? 'cliente' : payload.tipo === 'equipe' ? 'equipe' : null
    if (!payload.sub || !escritorio || !tipo || typeof payload.sid !== 'string') throw new Error('claims incompletas')
    return { sub: payload.sub, escritorio_id: escritorio, tipo, cliente_id: (payload.cliente_id as string | null) ?? null, nome: payload.nome as string | undefined, sid: payload.sid }
  } catch (e) {
    if (e instanceof ErroApi) throw e
    throw new ErroApi('SESSAO_INVALIDA')
  }
}

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
export async function abrirSessao(sql: Sql, claims: ClaimsToken, integranteId?: string): Promise<Sessao> {
  return noEscritorio(sql, { sub: claims.sub, escritorio_id: claims.escritorio_id }, async (tx) => {
    if (claims.tipo === 'cliente') {
      if (integranteId) throw new ErroApi('NEGADO', { mensagem: 'O app do cliente não age como integrante.' })
      return { claims, perfil: null, ctx: { ator: { tipo: 'pessoa_cliente', nome: claims.nome ?? 'Cliente', cliente_id: claims.cliente_id ?? undefined }, origem: 'tela' } }
    }
    const perfil = await carregarPerfil(tx, claims.sub)
    if (!perfil) throw new ErroApi('CONTA_INATIVA')
    if (integranteId) {
      if (!config.demonstracao) throw new ErroApi('DEMONSTRACAO_DESLIGADA', { mensagem: 'Integrante só age com o token próprio (orquestrador).' })
      const [i] = await tx`select id, nome_exibido, setor from integrante where id = ${integranteId}`
      if (!i) throw new ErroApi('NAO_ENCONTRADO', { campo: 'X-Heild-Integrante', mensagem: `Não encontrei o integrante ${integranteId}.` })
      return { claims, perfil, ctx: { ator: { tipo: 'integrante', id: String(i.id), nome: (i.nome_exibido as string | null) ?? (rotuloSetorCurto as Record<string, string>)[String(i.setor)] ?? String(i.setor), dono: perfil }, origem: 'chat' } }
    }
    return { claims, perfil, ctx: { ator: { tipo: 'pessoa', perfil }, origem: 'tela' } }
  })
}

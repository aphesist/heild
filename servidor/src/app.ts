import Fastify, { type FastifyInstance, type FastifyReply, type FastifyRequest } from 'fastify'
import { z } from 'zod'
import {
  ferramentasTipadas,
  ferramentaTipada,
  PedidoOperacao,
  permissoesDoPerfil,
  verificarCadeia,
  autorizar,
  codigoDaNegacao,
  type ComandoValidado,
} from '@heild/dominio'
import { abrirSessao, emitirToken, verificarToken, type Sessao } from './auth/sessao.ts'
import { config } from './config.ts'
import { noEscritorio, sqlApi, type Sql } from './banco/pg.ts'
import { fotografiaDoEscritorio, semearEscritorio } from './banco/semear.ts'
import { lerCadeia } from './executor/cadeia.ts'
import { ErroApi, erroDeEntrada } from './executor/erro.ts'
import { executar, traduzir } from './executor/executor.ts'
import { ler } from './executor/leitura.ts'
import { operacoes, tabelasComRepositorio } from './executor/operacoes.ts'
import { gerarOpenApi, catalogoHash } from './contratos.ts'

/**
 * A API (AGENTICO 8). Uma porta de escrita só: `POST /v1/ferramentas/{nome}` (ferramentas
 * tipadas, para agentes e integradores) e `POST /v1/operacoes` (os métodos dos
 * repositórios, para o adaptador `api` do app), as duas no mesmo executor. Fora disso,
 * só infraestrutura: sessão, sincronização, contratos, verificação da cadeia e, na
 * demonstração, login por papel e restaurar.
 */

declare module 'fastify' {
  interface FastifyRequest {
    sessao?: Sessao
  }
}

const ChaveIdempotencia = z.string().min(8).max(200).regex(/^[A-Za-z0-9_.:-]+$/)

export function criarApp(opcoes: { sql?: Sql; logs?: boolean } = {}): FastifyInstance {
  const sql = opcoes.sql ?? sqlApi()
  const app = Fastify({ logger: opcoes.logs === false ? false : { level: config.logs }, bodyLimit: 8 * 1024 * 1024 })

  // CORS só para as origens do app local (o navegador fala com a API).
  app.addHook('onRequest', async (req, rep) => {
    const origem = req.headers.origin
    if (origem && config.origens.includes(origem)) {
      rep.header('Access-Control-Allow-Origin', origem)
      rep.header('Vary', 'Origin')
      rep.header('Access-Control-Allow-Headers', 'Authorization, Content-Type, Idempotency-Key, X-Heild-Integrante, X-Heild-Tela, traceparent')
      rep.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      rep.header('Access-Control-Expose-Headers', 'Idempotent-Replayed')
    }
    if (req.method === 'OPTIONS') return rep.code(204).send()
  })

  app.setErrorHandler((e: Error & { validation?: unknown; statusCode?: number }, _req, rep) => {
    if (e instanceof ErroApi) return rep.code(e.status).send(e.corpo())
    if (e.statusCode && e.statusCode < 500) return rep.code(400).send(new ErroApi('ENTRADA_INVALIDA', { mensagem: e.message }).corpo())
    app.log.error(e)
    return rep.code(500).send(new ErroApi('ERRO_INTERNO').corpo())
  })

  const sessao = async (req: FastifyRequest): Promise<Sessao> => {
    const claims = await verificarToken(req.headers.authorization)
    const integrante = typeof req.headers['x-heild-integrante'] === 'string' ? req.headers['x-heild-integrante'] : undefined
    return abrirSessao(sql, claims, integrante)
  }
  const chaveDe = (req: FastifyRequest): string | null => {
    const bruta = req.headers['idempotency-key']
    if (bruta === undefined) return null
    const r = ChaveIdempotencia.safeParse(bruta)
    if (!r.success) throw new ErroApi('ENTRADA_INVALIDA', { campo: 'Idempotency-Key', mensagem: 'Idempotency-Key: de 8 a 200 caracteres (letras, dígitos, _ . : -).' })
    return r.data
  }
  const responder = (rep: FastifyReply, r: { status: number; corpo: unknown; repetida?: boolean }) => {
    if (r.repetida) rep.header('Idempotent-Replayed', 'true')
    return rep.code(r.status).send(r.corpo)
  }

  /* ---------- Infraestrutura ---------- */

  app.get('/v1/saude', async () => {
    await sql`select 1`
    return { ok: true, demonstracao: config.demonstracao, operacoes: operacoes.size, ferramentas: ferramentasTipadas.length }
  })

  app.get('/v1/sessao', async (req) => {
    const s = await sessao(req)
    return {
      escritorio_id: s.claims.escritorio_id,
      tipo: s.claims.tipo,
      ator: s.ctx.ator.tipo === 'pessoa' ? { tipo: 'pessoa', usuario_id: s.ctx.ator.perfil.usuario_id, nome: s.ctx.ator.perfil.nome } : s.ctx.ator,
      perfil: s.perfil,
      permissoes: s.perfil ? permissoesDoPerfil(s.perfil) : null,
      catalogo_hash: catalogoHash(),
    }
  })

  app.get('/v1/sincronizar', async (req) => {
    const s = await sessao(req)
    const q = z.object({ desde: z.coerce.number().int().min(0).optional() }).strict().safeParse(req.query)
    if (!q.success) throw erroDeEntrada(q.error.issues)
    return noEscritorio(sql, { sub: s.claims.sub, escritorio_id: s.claims.escritorio_id }, (tx) => fotografiaDoEscritorio(tx, q.data.desde))
  })

  /* ---------- Escrita: operações de repositório (adaptador `api` do app) ---------- */

  app.get('/v1/operacoes', async () => ({ operacoes: [...operacoes.keys()].sort(), tabelas: tabelasComRepositorio() }))

  app.post('/v1/operacoes', async (req, rep) => {
    const s = await sessao(req)
    const corpo = PedidoOperacao.safeParse(req.body)
    if (!corpo.success) throw erroDeEntrada(corpo.error.issues)
    const comando = corpo.data.comando as ComandoValidado
    const rotulo = comando.tipo === 'operacao' ? comando.operacao : 'linhas.gravar'
    const r = await executar(sql, { sessao: s, comando, chave: chaveDe(req), validarApenas: !!corpo.data.validar_apenas, rotulo, confiavel: false, entradaOriginal: comando })
    return responder(rep, r)
  })

  /* ---------- Ferramentas tipadas (agentes, MCP na B2, integradores) ---------- */

  app.get('/v1/ferramentas', async () => ({
    catalogo_hash: catalogoHash(),
    ferramentas: ferramentasTipadas
      .map((f) => ({ nome: f.nome, versao: f.versao, tipo: f.tipo, descricao_modelo: f.descricao_modelo, exposta_mcp: f.exposta_mcp, erros: f.erros, entrada: z.toJSONSchema(f.entrada, { io: 'input' }) }))
      .sort((a, b) => a.nome.localeCompare(b.nome)),
  }))

  app.post('/v1/ferramentas/:nome', async (req, rep) => {
    const { nome } = req.params as { nome: string }
    const s = await sessao(req)
    if (nome === 'auditoria.verificar_cadeia') return responder(rep, await verificar(sql, s))
    const f = ferramentaTipada(nome)
    if (!f) throw new ErroApi('FERRAMENTA_DESCONHECIDA', { campo: 'nome', mensagem: `Não existe a ferramenta ${nome}.` })
    const bruto = (req.body ?? {}) as Record<string, unknown>
    const { validar_apenas: validarApenas, ...entradaBruta } = bruto
    if (validarApenas !== undefined && typeof validarApenas !== 'boolean') throw new ErroApi('ENTRADA_INVALIDA', { campo: 'validar_apenas' })
    const entrada = f.entrada.safeParse(entradaBruta)
    if (!entrada.success) throw erroDeEntrada(entrada.error.issues)
    if (f.tipo === 'leitura') return responder(rep, await ler(sql, s, f, entrada.data as Record<string, unknown>))
    const chamada = f.chamada(entrada.data as never)
    const comando: ComandoValidado = { tipo: 'operacao', operacao: chamada.operacao, argumentos: chamada.argumentos, ids: [] }
    const r = await executar(sql, { sessao: s, comando, chave: chaveDe(req), validarApenas: !!validarApenas, rotulo: f.nome, confiavel: true, entradaOriginal: entradaBruta })
    return responder(rep, r)
  })

  app.get('/v1/openapi.json', async () => gerarOpenApi())

  /* ---------- Demonstração (HEILD_DEMONSTRACAO=1) ---------- */

  app.get('/v1/auth/contas', async (req) => {
    if (!config.demonstracao) throw new ErroApi('DEMONSTRACAO_DESLIGADA')
    const q = z.object({ escritorio_id: z.string().min(1).max(80) }).strict().safeParse(req.query)
    if (!q.success) throw erroDeEntrada(q.error.issues)
    const contas = await noEscritorio(sql, { sub: 'demonstracao', escritorio_id: q.data.escritorio_id }, (tx) => tx`select id, nome, papel, situacao from usuario order by ordem nulls last, nome`)
    return { escritorio_id: q.data.escritorio_id, contas }
  })

  app.post('/v1/auth/demonstracao', async (req) => {
    if (!config.demonstracao) throw new ErroApi('DEMONSTRACAO_DESLIGADA')
    const corpo = z
      .object({
        escritorio_id: z.string().min(1).max(80),
        usuario_id: z.string().min(1).max(80).optional(),
        papel: z.enum(['administrador', 'gestor', 'colaborador']).optional(),
        cliente_id: z.string().min(1).max(80).optional(),
        nome: z.string().min(1).max(120).optional(),
      })
      .strict()
      .safeParse(req.body)
    if (!corpo.success) throw erroDeEntrada(corpo.error.issues)
    const b = corpo.data
    return noEscritorio(sql, { sub: 'demonstracao', escritorio_id: b.escritorio_id }, async (tx) => {
      if (b.cliente_id) {
        const [c] = await tx`select id, nome from cliente where id = ${b.cliente_id}`
        if (!c) throw new ErroApi('NAO_ENCONTRADO', { campo: 'cliente_id' })
        const t = await emitirToken({ sub: `cliente:${c.id}`, escritorio_id: b.escritorio_id, tipo: 'cliente', cliente_id: String(c.id), nome: b.nome ?? `Contato de ${c.nome}` })
        return { ...t, tipo: 'cliente', cliente_id: c.id }
      }
      const [u] = b.usuario_id
        ? await tx`select id, nome, papel from usuario where id = ${b.usuario_id} and situacao = 'ativo'`
        : await tx`select id, nome, papel from usuario where papel = ${b.papel ?? 'administrador'} and situacao = 'ativo' order by ordem nulls last, nome limit 1`
      if (!u) throw new ErroApi('CONTA_INATIVA', { mensagem: 'Não há conta ativa com esse id ou papel neste escritório.' })
      const t = await emitirToken({ sub: String(u.id), escritorio_id: b.escritorio_id, tipo: 'equipe' })
      return { ...t, tipo: 'equipe', usuario: u }
    })
  })

  app.post('/v1/demonstracao/restaurar', async (req) => {
    if (!config.demonstracao) throw new ErroApi('DEMONSTRACAO_DESLIGADA')
    const s = await sessao(req)
    return noEscritorio(sql, { sub: s.claims.sub, escritorio_id: s.claims.escritorio_id }, async (tx) => {
      const r = await semearEscritorio(tx, s.claims.escritorio_id)
      return { ...r, ...(await fotografiaDoEscritorio(tx)) }
    })
  })

  return app
}

/** `auditoria.verificar_cadeia`: recalcula a cadeia inteira com a canonização do pacote de domínio. */
async function verificar(sql: Sql, s: Sessao) {
  const d = autorizar(s.ctx, 'auditoria.verificar_cadeia', {}, 'ler')
  if (!d.permitido) {
    const e = new ErroApi(codigoDaNegacao(d.motivo), { mensagem: d.motivo, ferramenta: 'auditoria.verificar_cadeia' })
    return { status: e.status, corpo: e.corpo() }
  }
  try {
    return await noEscritorio(sql, { sub: s.claims.sub, escritorio_id: s.claims.escritorio_id }, async (tx) => {
      const { eventos, elo, fora_da_cadeia } = await lerCadeia(tx)
      const r = verificarCadeia(s.claims.escritorio_id, eventos, elo)
      return { status: 200, corpo: { resultado: 'ok', dados: { ...r, fora_da_cadeia } } }
    })
  } catch (e) {
    const erro = traduzir(e)
    return { status: erro.status, corpo: erro.corpo() }
  }
}


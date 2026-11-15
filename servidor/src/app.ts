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
  EnvelopeTela,
  exigeFerramentaTipada,
  traduzirOperacao,
} from '@heild/dominio'
import { abrirSessao, emitirToken, verificarToken, type Sessao } from './auth/sessao.ts'
import { config } from './config.ts'
import { noEscritorio, sqlApi, type Sql } from './banco/pg.ts'
import { semearEscritorio } from './banco/semear.ts'
import { sincronizar } from './executor/sincronizar.ts'
import { lerCadeia } from './executor/cadeia.ts'
import { ErroApi, erroDeEntrada } from './executor/erro.ts'
import { executar, traduzir } from './executor/executor.ts'
import { cartaoDoExecutor, decidirCartaoDoExecutor, type DecisaoExecutor } from './executor/aprovacao.ts'
import { ativarNoPrimeiroAcesso, convidar, novoAcesso, primeiroAcesso, revogarCodigo } from './auth/contas.ts'
import { ler } from './executor/leitura.ts'
import { operacoes, tabelasComRepositorio } from './executor/operacoes.ts'
import { gerarOpenApi, catalogoHash } from './contratos.ts'
import { consumir, LIMITES } from './limites.ts'
import { contextoDaSessao, envelopeParaHttp, operacoesDeProcesso } from './b2.ts'
import type { Processos } from '@heild/processos'
import { Fluxo } from './fluxo.ts'
import { RegistroLeituras } from './leituras.ts'

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
  interface FastifyInstance {
    /** O fluxo de mudanças (SSE) e o registro de leituras desta instância. */
    heild: { fluxo: Fluxo; leituras: RegistroLeituras }
  }
}

const ChaveIdempotencia = z.string().min(8).max(200).regex(/^[A-Za-z0-9_.:-]+$/)

export function criarApp(opcoes: { sql?: Sql; logs?: boolean; processos?: Processos | null; relogios?: boolean } = {}): FastifyInstance {
  const sql = opcoes.sql ?? sqlApi()
  const b2 = opcoes.processos ?? null
  const fluxo = new Fluxo(sql)
  const leituras = new RegistroLeituras(sql)
  // Os testes chamam o passo do fluxo e o descarregar à mão (sem relógio, sem intermitência).
  if (opcoes.relogios !== false) {
    fluxo.iniciar()
    leituras.iniciar()
  }
  const app = Fastify({
    logger: opcoes.logs === false ? false : { level: config.logs, redact: ['req.headers.authorization', 'req.headers["idempotency-key"]'] },
    bodyLimit: 2 * 1024 * 1024,
    requestTimeout: config.tempoPedidoMs,
    connectionTimeout: config.tempoPedidoMs,
    keepAliveTimeout: 72_000,
    genReqId: () => `rq${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
  })

  app.decorate('heild', { fluxo, leituras })
  // Toda resposta de erro deixa uma linha no log (método, rota, status; nunca o corpo nem o token).
  app.addHook('onResponse', async (req, rep) => {
    if (rep.statusCode >= 400) req.log.warn({ status: rep.statusCode, metodo: req.method, rota: req.routeOptions.url ?? req.url.split('?')[0] }, 'resposta de erro')
  })
  app.addHook('onClose', async () => {
    await fluxo.parar()
    await leituras.parar()
  })

  // Cabeçalhos de segurança e o id do pedido em toda resposta (correlação com o log).
  app.addHook('onSend', async (req, rep) => {
    rep.header('X-Content-Type-Options', 'nosniff')
    rep.header('Cache-Control', 'no-store')
    rep.header('X-Request-Id', req.id)
  })

  // CORS só para as origens do app local (o navegador fala com a API).
  app.addHook('onRequest', async (req, rep) => {
    const origem = req.headers.origin
    if (origem && config.origens.includes(origem)) {
      rep.header('Access-Control-Allow-Origin', origem)
      rep.header('Vary', 'Origin')
      rep.header('Access-Control-Allow-Headers', 'Authorization, Content-Type, Idempotency-Key, X-Heild-Integrante, X-Heild-Tela, Last-Event-ID, traceparent')
      rep.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      rep.header('Access-Control-Expose-Headers', 'Idempotent-Replayed')
    }
    if (req.method === 'OPTIONS') return rep.code(204).send()
  })

  app.setErrorHandler((e: Error & { validation?: unknown; statusCode?: number }, req, rep) => {
    if (e instanceof ErroApi) {
      // A recusa de entrada (antes do executor) também vai para o log: código e campo, sem o corpo.
      if (e.status !== 401) app.log.warn({ recusa: e.codigo, campo: e.campo, mensagem: e.message, rota: req.routeOptions.url, ferramenta: (req.params as { nome?: string } | undefined)?.nome }, 'entrada recusada')
      return rep.code(e.status).send(e.corpo())
    }
    if (e.statusCode && e.statusCode < 500) return rep.code(400).send(new ErroApi('ENTRADA_INVALIDA', { mensagem: e.message }).corpo())
    app.log.error(e)
    return rep.code(500).send(new ErroApi('ERRO_INTERNO').corpo())
  })

  const sessao = async (req: FastifyRequest): Promise<Sessao> => {
    const claims = await verificarToken(req.headers.authorization)
    const espera = consumir(`${claims.tipo}:${claims.escritorio_id}:${claims.sub}`, claims.tipo === 'cliente' ? LIMITES.cliente : LIMITES.equipe)
    if (espera) throw new ErroApi('LIMITE_TAXA', { detalhes: { tentar_de_novo_em: espera } })
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
    const q = z
      .object({
        desde: z.coerce.number().int().min(0).optional(),
        // `classes=1,2` (padrão). A classe 3 não existe aqui: é por consulta paginada (useConsulta).
        classes: z
          .string()
          .regex(/^[12](,[12])?$/, 'classes: 1, 2 ou 1,2 (a classe 3 é por consulta).')
          .transform((c) => [...new Set(c.split(',').map(Number))] as (1 | 2)[])
          .optional(),
      })
      .strict()
      .safeParse(req.query)
    if (!q.success) throw erroDeEntrada(q.error.issues)
    const foto = await noEscritorio(sql, { sub: s.claims.sub, escritorio_id: s.claims.escritorio_id }, (tx) => sincronizar(tx, s, { desde: q.data.desde, classes: q.data.classes }))
    const quantidade = Object.values(foto.tabelas).reduce((n, ls) => n + (ls?.length ?? 0), 0)
    leituras.registrar(s, { ferramenta: 'sincronizar', quantidade, filtros: { desde: q.data.desde ?? null, classes: foto.classes } })
    return foto
  })

  // SSE (ARQUITETURA 6.3): `{ tabela, ids, versao }`, só do que a pessoa leria. O navegador
  // lê com fetch (precisa do Authorization, que o EventSource não manda).
  app.get('/v1/eventos/fluxo', async (req, rep) => {
    const s = await sessao(req)
    const integrante = typeof req.headers['x-heild-integrante'] === 'string' ? req.headers['x-heild-integrante'] : undefined
    rep.hijack()
    const r = rep.raw
    req.raw.socket.setTimeout(0)
    const origem = req.headers.origin
    r.writeHead(200, {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-store',
      connection: 'keep-alive',
      'x-content-type-options': 'nosniff',
      'x-request-id': req.id,
      ...(origem && config.origens.includes(origem) ? { 'access-control-allow-origin': origem, vary: 'Origin' } : {}),
    })
    try {
      await fluxo.conectar(s, r, integrante)
    } catch (e) {
      const erro = e instanceof ErroApi ? e : new ErroApi('ERRO_INTERNO')
      r.end(`event: erro\ndata: ${JSON.stringify(erro.corpo())}\n\n`)
    }
  })

  /* ---------- Escrita: operações de repositório (adaptador `api` do app) ---------- */

  app.get('/v1/operacoes', async () => ({ operacoes: [...operacoes.keys()].sort(), tabelas: tabelasComRepositorio() }))

  app.post('/v1/operacoes', async (req, rep) => {
    const s = await sessao(req)
    const corpo = PedidoOperacao.safeParse(req.body)
    if (!corpo.success) throw erroDeEntrada(corpo.error.issues)
    const comando = corpo.data.comando as ComandoValidado
    // Operação genérica de tabela da F1 (criar, atualizar, reverter...): só pela ferramenta tipada.
    // É o que fecha o patch livre (ARQUITETURA 6.2); a resposta já diz qual ferramenta chamar.
    if (comando.tipo === 'operacao' && exigeFerramentaTipada(comando.operacao)) {
      const sugestao = traduzirOperacao(comando.operacao, comando.argumentos)?.[0]
      throw new ErroApi('USE_FERRAMENTA_TIPADA', {
        campo: 'comando.operacao',
        mensagem: `${comando.operacao} não é aceita por /v1/operacoes: chame ${sugestao ? `/v1/ferramentas/${sugestao.ferramenta}` : 'a ferramenta tipada da entidade'}.`,
        acao_sugerida: sugestao ? { ferramenta: sugestao.ferramenta, entrada: sugestao.entrada } : null,
      })
    }
    const rotulo = comando.tipo === 'operacao' ? comando.operacao : 'linhas.gravar'
    const r = await executar(sql, { sessao: s, comando, chave: chaveDe(req), validarApenas: !!corpo.data.validar_apenas, rotulo, confiavel: false, entradaOriginal: comando })
    return responder(rep, r)
  })

  /* ---------- Ferramentas tipadas (agentes, MCP na B2, integradores) ---------- */

  app.get('/v1/ferramentas', async () => {
    const tipadas = ferramentasTipadas.map((f) => ({ nome: f.nome, versao: f.versao, tipo: f.tipo as string, descricao_modelo: f.descricao_modelo, exposta_mcp: f.exposta_mcp, erros: f.erros as string[], entrada: z.toJSONSchema(f.entrada, { io: 'input' }) }))
    const nomes = new Set(tipadas.map((f) => f.nome))
    // Ferramentas do motor (B2) servidas pela mesma rota: execucao.obter, execucao.retomar, procedimento.listar...
    const doMotor = b2
      ? b2.registro
          .listar({ escritorio_id: '', origem: 'tela', ator: { tipo: 'sistema' } }, {})
          .filter((d) => !nomes.has(d.nome))
          .map((d) => ({ nome: d.nome, versao: d.versao, tipo: 'motor', descricao_modelo: d.descricao_modelo, exposta_mcp: d.exposta_mcp, erros: [] as string[], entrada: z.toJSONSchema(d.entrada, { io: 'input' }) }))
      : []
    return { catalogo_hash: catalogoHash(), ferramentas: [...tipadas, ...doMotor].sort((a, b) => a.nome.localeCompare(b.nome)) }
  })

  app.post('/v1/ferramentas/:nome', async (req, rep) => {
    const { nome } = req.params as { nome: string }
    const s = await sessao(req)
    if (nome === 'auditoria.verificar_cadeia') return responder(rep, await verificar(sql, s))
    // O cartão de quem? Do executor (integrante pediu algo que exige aprovação): aprovar executa o
    // comando guardado. De execução ou de memória do setor: quem decide é o motor da B2.
    let cartao: Record<string, unknown> | undefined
    if (nome === 'aprovacao.decidir') {
      const corpo = (req.body ?? {}) as Record<string, unknown>
      const cartaoId = typeof corpo.cartao_id === 'string' ? corpo.cartao_id : ''
      ;[cartao] = await noEscritorio(sql, { sub: s.claims.sub, escritorio_id: s.claims.escritorio_id }, (tx) => tx`select execucao_id, tipo, argumentos_hash, argumentos from cartao_aprovacao where id = ${cartaoId}`)
      if (cartao && cartaoDoExecutor(cartao)) {
        const { heild_tela: _tela, ...resto } = corpo
        const e = ferramentaTipada('aprovacao.decidir')!.entrada.safeParse(resto)
        if (!e.success) throw erroDeEntrada(e.error.issues)
        return responder(rep, await decidirCartaoDoExecutor(sql, s, e.data as unknown as DecisaoExecutor, chaveDe(req)))
      }
    }
    if (b2) {
      const ctxB2 = contextoDaSessao(s.claims.escritorio_id, s.ctx)
      if (nome === 'aprovacao.decidir') {
        const corpo = (req.body ?? {}) as Record<string, unknown>
        const c = cartao
        if (c && (c.execucao_id || c.tipo === 'memoria')) {
          const decisao = ({ aprovado: 'aprovar', recusado: 'recusar', editado_e_aprovado: 'editar' } as Record<string, string>)[String(corpo.decisao)] ?? corpo.decisao
          return responder(rep, envelopeParaHttp(await b2.registro.chamar(ctxB2, 'aprovacao.decidir', { ...corpo, decisao })))
        }
      } else if (!ferramentaTipada(nome) && b2.registro.definicao(nome)) {
        return responder(rep, envelopeParaHttp(await b2.registro.chamar(ctxB2, nome, req.body ?? {})))
      }
    }
    const f = ferramentaTipada(nome)
    if (!f) throw new ErroApi('FERRAMENTA_DESCONHECIDA', { campo: 'nome', mensagem: `Não existe a ferramenta ${nome}.` })
    const bruto = (req.body ?? {}) as Record<string, unknown>
    // Envelope (fora do esquema da ferramenta): `validar_apenas` e, da tela, os ids que ela
    // gerou e a frase do evento (`heild_tela`).
    const { validar_apenas: validarApenas, heild_tela: telaBruta, ...entradaBruta } = bruto
    if (validarApenas !== undefined && typeof validarApenas !== 'boolean') throw new ErroApi('ENTRADA_INVALIDA', { campo: 'validar_apenas' })
    const tela = EnvelopeTela.safeParse(telaBruta ?? {})
    if (!tela.success) throw erroDeEntrada(tela.error.issues, 'heild_tela')
    const entrada = f.entrada.safeParse(entradaBruta)
    if (!entrada.success) throw erroDeEntrada(entrada.error.issues)
    if (f.tipo === 'leitura') {
      const r = await ler(sql, s, f, entrada.data as Record<string, unknown>)
      if (r.status === 200) {
        // Quem leu o quê (P6): as linhas que voltaram, a contagem e os filtros (sem cursor nem visão).
        const dados = (r.corpo as { dados?: { id?: string; linhas?: { id?: string }[] } }).dados
        const ids = dados?.linhas ? dados.linhas.map((l) => String(l.id)) : dados?.id ? [String(dados.id)] : []
        const filtros = Object.fromEntries(Object.entries(entrada.data as Record<string, unknown>).filter(([k]) => k !== 'cursor' && k !== 'visao' && k !== 'limite'))
        leituras.registrar(s, { ferramenta: f.nome, tabela: f.tabela, ids, quantidade: ids.length, filtros })
      }
      return responder(rep, r)
    }
    const chamada = f.chamada(entrada.data as never, { texto: tela.data.texto })
    const comando: ComandoValidado = { tipo: 'operacao', operacao: chamada.operacao, argumentos: chamada.argumentos, ids: tela.data.ids }
    const r = await executar(sql, { sessao: s, comando, chave: chaveDe(req), validarApenas: !!validarApenas, rotulo: f.nome, confiavel: true, entradaOriginal: entradaBruta, texto: tela.data.texto })
    // Operação de processo: o efeito foi pedir o job; a execução segue no worker (202, AGENTICO 8).
    if (operacoesDeProcesso.has(f.nome) && r.status === 200) {
      const c = r.corpo as { dados: { execucao_id: string; estado: string }; evento_id: string | null }
      return responder(rep, { status: 202, repetida: r.repetida, corpo: { resultado: 'em_execucao', execucao_id: c.dados.execucao_id, estado: c.dados.estado, evento_id: c.evento_id } })
    }
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
    const espera = consumir(`login:${req.ip}`, LIMITES.login)
    if (espera) throw new ErroApi('LIMITE_TAXA', { detalhes: { tentar_de_novo_em: espera } })
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

  /* ---------- Contas da equipe (decisão (b) do Enzo, 15/11/2026) ---------- */

  app.post('/v1/equipe/convidar', async (req, rep) => responder(rep, await convidar(sql, await sessao(req), req.body ?? {}, chaveDe(req))))
  app.post('/v1/equipe/acesso', async (req, rep) => responder(rep, await novoAcesso(sql, await sessao(req), req.body ?? {})))
  app.post('/v1/equipe/acesso/revogar', async (req, rep) => responder(rep, await revogarCodigo(sql, await sessao(req), req.body ?? {})))
  // Sem sessão (a pessoa ainda não tem senha): limite por endereço, como o login.
  app.post('/v1/auth/primeiro-acesso', async (req, rep) => {
    const espera = consumir(`primeiro-acesso:${req.ip}`, LIMITES.login)
    if (espera) throw new ErroApi('LIMITE_TAXA', { detalhes: { tentar_de_novo_em: espera } })
    return responder(rep, await primeiroAcesso(sql, req.body ?? {}))
  })
  // Demonstração: tocar na conta convidada é abrir o link do convite (o e-mail da demonstração).
  app.post('/v1/auth/demonstracao/primeiro-acesso', async (req) => {
    if (!config.demonstracao) throw new ErroApi('DEMONSTRACAO_DESLIGADA')
    const b = z.object({ escritorio_id: z.string().min(1).max(80), usuario_id: z.string().min(1).max(80), nome: z.string().trim().min(1).max(120).optional() }).strict().safeParse(req.body ?? {})
    if (!b.success) throw erroDeEntrada(b.error.issues)
    const ativou = await noEscritorio(sql, { sub: b.data.usuario_id, escritorio_id: b.data.escritorio_id }, (tx) => ativarNoPrimeiroAcesso(tx, { ...b.data, demonstracao: true }))
    if (!ativou) throw new ErroApi('CONTA_INATIVA', { mensagem: 'Essa conta não tem convite pendente.' })
    const t = await emitirToken({ sub: b.data.usuario_id, escritorio_id: b.data.escritorio_id, tipo: 'equipe' })
    return { ...t, tipo: 'equipe', usuario_id: b.data.usuario_id }
  })

  app.post('/v1/demonstracao/restaurar', async (req) => {
    if (!config.demonstracao) throw new ErroApi('DEMONSTRACAO_DESLIGADA')
    const s = await sessao(req)
    return noEscritorio(sql, { sub: s.claims.sub, escritorio_id: s.claims.escritorio_id }, async (tx) => {
      const r = await semearEscritorio(tx, s.claims.escritorio_id)
      return { ...r, ...(await sincronizar(tx, s)) }
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


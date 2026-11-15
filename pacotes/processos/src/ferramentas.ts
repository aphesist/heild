import { z } from 'zod'
import type { Sql } from './banco.ts'
import { comEscritorio } from './banco.ts'
import { ErroEntrada, ErroHeild, ErroPermissao, type ContextoExec } from './contexto.ts'
import { autorizarFerramenta, metadadosDoCatalogo, type Alvo, type Ferramenta } from './dominio.ts'
import type { PortaEventos } from './eventos.ts'
import type { Motor } from './motor/motor.ts'
import type { Procedimento } from './motor/definicao.ts'
import { listarValidadores, rodarValidadores } from './validadores/registro.ts'
import { decidirMemoria, proporMemoria } from './memoria.ts'

/**
 * Registro de ferramentas da B2: INTERFACE MÍNIMA até a B1 entregar o executor geral
 * (combinado em docs/backend/IMPLEMENTACAO.md, seção B2). O formato segue o AGENTICO 3
 * (`nome`, `versao`, esquemas estritos, `descricao_modelo`, `exposta_mcp`, metadados de
 * autorização do catálogo). Quando a B1 publicar `definirFerramenta`/`implementar` e o executor,
 * estas definições migram para ele sem mudar nome, esquema nem envelope.
 */
export interface DefinicaoFerramenta<E extends z.ZodObject = z.ZodObject> {
  nome: string
  versao: number
  descricao_modelo: string
  entrada: E
  /** Metadados para a função `autorizar` (os mesmos campos do catálogo do wireframe). */
  meta: Ferramenta
  exposta_mcp: boolean
  /** Setor do recorte MCP (`/mcp/setor/{codigo}`); `geral` aparece em todos. */
  recorte: string
  alvo?: (entrada: z.infer<E>, ctx: ContextoExec) => Alvo | Promise<Alvo>
  executar: (entrada: z.infer<E>, ctx: ContextoExec) => Promise<Envelope>
}

/** O envelope do AGENTICO 8, igual para a tela, o integrante e o MCP. */
export type Envelope =
  | { resultado: 'ok'; dados: unknown }
  | { resultado: 'em_execucao'; execucao_id: string; estado: string; posicao_na_fila?: number | null }
  | { resultado: 'aguardando_aprovacao'; execucao_id?: string; cartao_id: string; resumo_humano: string; expira_em: string | null }
  | { resultado: 'negado'; codigo: string; motivo: string }
  | { resultado: 'erro'; codigo: string; campo: string | null; mensagem: string; acao_sugerida: unknown; erros?: { campo: string; mensagem: string }[] }

export function definirFerramenta<E extends z.ZodObject>(d: DefinicaoFerramenta<E>): DefinicaoFerramenta<E> {
  const js = z.toJSONSchema(d.entrada, { io: 'input' }) as { additionalProperties?: unknown }
  if (js.additionalProperties !== false) throw new Error(`${d.nome}: esquema de entrada precisa ser estrito (AGENTICO 3, regra 2).`)
  return d
}

export class RegistroFerramentas {
  private readonly defs = new Map<string, DefinicaoFerramenta>()
  constructor(
    private readonly sql: Sql,
    private readonly eventos: PortaEventos,
  ) {}

  registrar(d: DefinicaoFerramenta) {
    if (this.defs.has(d.nome)) throw new Error(`Ferramenta repetida: ${d.nome}`)
    this.defs.set(d.nome, d as unknown as DefinicaoFerramenta)
    return this
  }

  definicao(nome: string) {
    return this.defs.get(nome)
  }

  meta(nome: string): Ferramenta | undefined {
    return this.defs.get(nome)?.meta ?? metadadosDoCatalogo(nome)
  }

  /** Ferramentas visíveis para o ator, em ordem fixa por nome (cache), cortadas pelo recorte. */
  listar(ctx: ContextoExec, o: { setor?: string; mcp?: boolean } = {}) {
    return [...this.defs.values()]
      .filter((d) => (o.mcp ? d.exposta_mcp : true))
      .filter((d) => !o.setor || d.recorte === o.setor || d.recorte === 'geral')
      .filter((d) => {
        const alvoSetor = d.meta.setor === 'alvo' ? (o.setor ?? null) : null
        return autorizarFerramenta(ctx, d.meta, { setor_id: alvoSetor }).permitido
      })
      .sort((a, b) => a.nome.localeCompare(b.nome))
  }

  /** Executa pelo mesmo caminho para qualquer porta: valida, autoriza, executa, devolve o envelope. */
  async chamar(ctx: ContextoExec, nome: string, entrada: unknown): Promise<Envelope> {
    const d = this.defs.get(nome)
    if (!d) return { resultado: 'erro', codigo: 'FERRAMENTA_DESCONHECIDA', campo: null, mensagem: `Ferramenta ${nome} não existe.`, acao_sugerida: null }
    const v = d.entrada.safeParse(entrada)
    if (!v.success) {
      const erros = v.error.issues.map((i) => ({ campo: i.path.join('.') || '(entrada)', mensagem: i.message }))
      return { resultado: 'erro', codigo: 'ENTRADA_INVALIDA', campo: erros[0]?.campo ?? null, mensagem: 'Entrada inválida.', acao_sugerida: null, erros }
    }
    try {
      const alvo = d.alvo ? await d.alvo(v.data, ctx) : {}
      const dec = autorizarFerramenta(ctx, d.meta, alvo)
      if (!dec.permitido) {
        await comEscritorio(this.sql, ctx.escritorio_id, (tx) =>
          this.eventos.gravar(tx, ctx, { nome, ferramenta: nome, nivel: d.meta.nivel, resultado: 'negado', texto: `Negado: ${dec.motivo}`, cliente_id: alvo.cliente_id ?? null, setor: alvo.setor_id ?? null }),
        )
        return { resultado: 'negado', codigo: 'NEGADO', motivo: dec.motivo }
      }
      return await d.executar(v.data, ctx)
    } catch (e) {
      if (e instanceof ErroPermissao) return { resultado: 'negado', codigo: e.codigo, motivo: e.message }
      if (e instanceof ErroEntrada) return { resultado: 'erro', codigo: e.codigo, campo: e.campo, mensagem: e.message, acao_sugerida: null, erros: e.erros }
      if (e instanceof ErroHeild) return { resultado: 'erro', codigo: e.codigo, campo: e.campo, mensagem: e.message, acao_sugerida: e.acao_sugerida }
      throw e
    }
  }
}

/** Operação de processo (AGENTICO 2): o procedimento inteiro como uma ferramenta de entrada fechada. */
export function operacaoDeProcesso(motor: Motor, sql: Sql, p: Procedimento, o: { aguardar_ms?: number } = {}): DefinicaoFerramenta {
  const entrada = p.entrada.extend({ chave_idempotencia: z.string().min(8).max(200).optional() }).strict()
  return definirFerramenta({
    nome: p.operacao,
    versao: p.versao,
    descricao_modelo: p.descricao_modelo,
    entrada,
    meta: p.ferramenta,
    exposta_mcp: true,
    recorte: p.setor,
    // A autorização da operação é feita pelo próprio motor (com cliente e setor do procedimento).
    alvo: () => ({ setor_id: p.setor }),
    executar: async (e, ctx) => {
      const { chave_idempotencia, ...dados } = e as Record<string, unknown>
      const r = await motor.iniciar(ctx, p.id, dados, { chave_idempotencia: chave_idempotencia as string | undefined })
      return aguardarEnvelope(motor, sql, ctx, r.execucao_id, o.aguardar_ms ?? 0)
    },
  })
}

/** Responde direto se terminar em até `ms` (AGENTICO 4.2: ~5 s); senão, devolve a execução para acompanhar. */
export async function aguardarEnvelope(motor: Motor, sql: Sql, ctx: ContextoExec, execucao_id: string, ms: number): Promise<Envelope> {
  const fim = Date.now() + ms
  for (;;) {
    const ex = await motor.obter(ctx, execucao_id)
    if (ex.estado === 'concluida') return { resultado: 'ok', dados: { execucao_id, ...ex.saida } }
    if (ex.estado === 'aguardando_cartao' && ex.cartao_id) {
      const [c] = await comEscritorio(sql, ctx.escritorio_id, (tx) => tx`select resumo_humano, expira_em from cartao_aprovacao where id = ${ex.cartao_id}`)
      return { resultado: 'aguardando_aprovacao', execucao_id, cartao_id: ex.cartao_id, resumo_humano: c?.resumo_humano ?? '', expira_em: c?.expira_em ? new Date(c.expira_em).toISOString() : null }
    }
    if (ex.estado === 'falhou' || ex.estado === 'cancelada') {
      const erro = (ex.erro ?? {}) as { codigo?: string; mensagem?: string }
      return { resultado: 'erro', codigo: erro.codigo ?? 'FALHOU', campo: null, mensagem: erro.mensagem ?? `Execução ${ex.estado}.`, acao_sugerida: null }
    }
    if (Date.now() >= fim) return { resultado: 'em_execucao', execucao_id, estado: ex.estado, posicao_na_fila: ex.posicao_na_fila }
    await new Promise((r) => setTimeout(r, 100))
  }
}

const meta = (nome: string, nivel: Ferramenta['nivel'], resto: Partial<Ferramenta> = {}): Ferramenta => ({ nome, modulo: 'agentes', nivel, setor: 'geral', ...resto })

/** As ferramentas transversais da B2 (execução, cartão, procedimentos, validadores, memória). */
export function ferramentasDoMotor(motor: Motor, sql: Sql, eventos: PortaEventos): DefinicaoFerramenta[] {
  return [
    definirFerramenta({
      nome: 'execucao.obter',
      versao: 1,
      descricao_modelo: 'Estado compacto de uma execução de procedimento (para retomar sem transcript).',
      entrada: z.object({ execucao_id: z.string() }).strict(),
      meta: meta('execucao.obter', 'ler'),
      exposta_mcp: true,
      recorte: 'geral',
      executar: async (e, ctx) => ({ resultado: 'ok', dados: await motor.obter(ctx, e.execucao_id) }),
    }),
    definirFerramenta({
      nome: 'execucao.retomar',
      versao: 1,
      descricao_modelo: 'Retoma do último passo gravado uma execução que falhou ou parou por orçamento.',
      entrada: z.object({ execucao_id: z.string() }).strict(),
      meta: meta('execucao.retomar', 'executar'),
      exposta_mcp: true,
      recorte: 'geral',
      executar: async (e, ctx) => {
        const r = await motor.retomar(ctx, e.execucao_id)
        return { resultado: 'em_execucao', execucao_id: e.execucao_id, estado: r.estado }
      },
    }),
    definirFerramenta({
      nome: 'aprovacao.decidir',
      versao: 1,
      descricao_modelo: 'Decide um cartão de aprovação. Só pessoa; só quem está em pode_aprovar.',
      entrada: z
        .object({
          cartao_id: z.string(),
          decisao: z.enum(['aprovar', 'recusar', 'editar', 'escolher']),
          argumentos_editados: z.record(z.string(), z.unknown()).optional(),
          escolha: z.string().optional(),
          comentario: z.string().max(500).optional(),
        })
        .strict(),
      meta: metadadosDoCatalogo('aprovacao.decidir')!,
      // Decisão humana acontece no cartão (tela e chat), nunca por automação MCP.
      exposta_mcp: false,
      recorte: 'geral',
      executar: async (e, ctx) => {
        const [c] = await comEscritorio(sql, ctx.escritorio_id, (tx) => tx`select tipo from cartao_aprovacao where id = ${e.cartao_id}`)
        if (c?.tipo === 'memoria') return { resultado: 'ok', dados: await decidirMemoria(sql, eventos, ctx, e) }
        return { resultado: 'ok', dados: await motor.decidirCartao(ctx, e) }
      },
    }),
    definirFerramenta({
      nome: 'procedimento.listar',
      versao: 1,
      descricao_modelo: 'O que o setor sabe fazer sozinho: procedimentos, versão e operação.',
      entrada: z.object({ setor: z.string().optional() }).strict(),
      meta: meta('procedimento.listar', 'ler'),
      exposta_mcp: true,
      recorte: 'geral',
      executar: async (e, ctx) => ({
        resultado: 'ok',
        dados: [...motor.procedimentos.values()]
          .filter((p) => !e.setor || p.setor === e.setor)
          .filter((p) => autorizarFerramenta(ctx, p.ferramenta, { setor_id: p.setor }).permitido)
          .map((p) => ({ id: p.id, versao: p.versao, nome: p.nome, setor: p.setor, operacao: p.operacao, hash: p.hash.slice(0, 12) }))
          .sort((a, b) => a.id.localeCompare(b.id) || b.versao - a.versao),
      }),
    }),
    definirFerramenta({
      nome: 'validador.executar',
      versao: 1,
      descricao_modelo: 'Roda validadores do domínio sobre dados montados (para o planejador de exceção conferir).',
      entrada: z.object({ validadores: z.array(z.string()).min(1).max(20), dados: z.record(z.string(), z.unknown()) }).strict(),
      meta: meta('validador.executar', 'ler'),
      exposta_mcp: true,
      recorte: 'geral',
      executar: async (e, ctx) => {
        const conhecidos = new Set(listarValidadores().map((v) => v.nome))
        const desconhecido = e.validadores.find((n) => !conhecidos.has(n.split(':')[0]!))
        if (desconhecido) return { resultado: 'erro', codigo: 'VALIDADOR_DESCONHECIDO', campo: 'validadores', mensagem: `Validador ${desconhecido} não existe.`, acao_sugerida: null }
        const r = await comEscritorio(sql, ctx.escritorio_id, (tx) => rodarValidadores(e.validadores, e.dados, tx))
        return { resultado: 'ok', dados: { ok: r.every((x) => x.ok), resultados: r } }
      },
    }),
    definirFerramenta({
      nome: 'memoria.propor',
      versao: 1,
      descricao_modelo: 'Propõe mudar a memória do setor; vira cartão para Gestor ou Administrador (decisão 6).',
      entrada: z.object({ setor: z.string(), chave: z.string().min(2).max(80), valor: z.unknown(), motivo: z.string().min(5).max(280) }).strict(),
      meta: meta('memoria.propor', 'rascunhar'),
      exposta_mcp: true,
      recorte: 'geral',
      executar: async (e, ctx) => {
        const c = await proporMemoria(sql, eventos, ctx, e as { setor: string; chave: string; valor: unknown; motivo: string })
        return { resultado: 'aguardando_aprovacao', cartao_id: c.id, resumo_humano: c.resumo, expira_em: null }
      },
    }),
  ]
}

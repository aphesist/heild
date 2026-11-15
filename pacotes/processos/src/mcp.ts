import type { FastifyInstance, FastifyRequest } from 'fastify'
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js'
import { z } from 'zod'
import type { ContextoExec } from './contexto.ts'
import type { Envelope, RegistroFerramentas } from './ferramentas.ts'

/**
 * Servidor MCP interno por escritório (AGENTICO 9): fachada fina das MESMAS ferramentas, pelo mesmo
 * registro e com a mesma autorização da pessoa ou do integrante dono do token. "Uma instância por
 * escritório" é lógica: o escritório vem do token, nunca da URL.
 *
 * Nomes: algumas APIs de modelo só aceitam [a-zA-Z0-9_-]; o nome exposto troca `.` por `__`
 * e o servidor faz a ida e a volta (AGENTICO 7).
 */
export const nomeMcp = (nome: string) => nome.replaceAll('.', '__')
export const nomeInterno = (nome: string) => nome.replaceAll('__', '.')

/** Autenticação injetada: a B1 é dona do token de serviço e do token de integrante (AGENTICO 10). */
export type Autenticar = (req: FastifyRequest) => Promise<ContextoExec | null>

export function criarServidorMcp(registro: RegistroFerramentas, ctx: ContextoExec, setor?: string) {
  const server = new Server({ name: 'heild', version: '0.1.0' }, { capabilities: { tools: { listChanged: false } } })
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: registro.listar(ctx, { setor, mcp: true }).map((d) => ({
      name: nomeMcp(d.nome),
      description: d.descricao_modelo,
      inputSchema: z.toJSONSchema(d.entrada, { io: 'input' }) as { type: 'object'; [k: string]: unknown },
      annotations: {
        readOnlyHint: d.meta.nivel === 'ler',
        destructiveHint: Boolean(d.meta.irreversivel),
        idempotentHint: d.meta.nivel !== 'executar',
        openWorldHint: false,
      },
    })),
  }))
  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const nome = nomeInterno(req.params.name)
    const visivel = registro.listar(ctx, { setor, mcp: true }).some((d) => d.nome === nome)
    const env: Envelope = visivel
      ? await registro.chamar({ ...ctx, origem: 'mcp' }, nome, req.params.arguments ?? {})
      : { resultado: 'negado', codigo: 'FORA_DO_RECORTE', motivo: 'Ferramenta fora do seu recorte.' }
    const erro = env.resultado === 'negado' || env.resultado === 'erro'
    return {
      content: [{ type: 'text', text: erro ? `${'motivo' in env ? env.motivo : env.mensagem} (${env.codigo})` : JSON.stringify(env) }],
      structuredContent: env as unknown as Record<string, unknown>,
      isError: erro,
    }
  })
  return server
}

/** Rotas `/mcp` e `/mcp/setor/:codigo` (Streamable HTTP, sem sessão: cada pedido é isolado). */
export async function rotasMcp(app: FastifyInstance, registro: RegistroFerramentas, autenticar: Autenticar) {
  const tratar = async (req: FastifyRequest<{ Params: { codigo?: string } }>, reply: import('fastify').FastifyReply) => {
    const ctx = await autenticar(req)
    if (!ctx) return reply.code(401).send({ resultado: 'negado', codigo: 'NAO_AUTENTICADO', motivo: 'Token ausente ou inválido.' })
    const server = criarServidorMcp(registro, ctx, req.params.codigo)
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true })
    reply.hijack()
    reply.raw.on('close', () => {
      void transport.close()
      void server.close()
    })
    await server.connect(transport)
    await transport.handleRequest(req.raw, reply.raw, req.body)
  }
  app.post('/mcp', tratar)
  app.post<{ Params: { codigo: string } }>('/mcp/setor/:codigo', tratar)
  const semSessao = async (_: FastifyRequest, reply: import('fastify').FastifyReply) => reply.code(405).send({ erro: 'Servidor MCP sem sessão: use POST.' })
  app.get('/mcp', semSessao)
  app.get('/mcp/setor/:codigo', semSessao)
}

import Fastify from 'fastify'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { rotasMcp, type ContextoExec } from '../src/index.ts'
import { documentoEcd, esperar, integrante, montar, pessoa, semear, sqlAdmin, type Semente } from './ambiente.ts'

/**
 * Servidor MCP interno: as mesmas ferramentas, com a autorização da pessoa ou do integrante dono
 * do token. O escritório vem do token. Decidir cartão não é exposto por MCP.
 */
let h: Awaited<ReturnType<typeof montar>>
const admin = sqlAdmin()
const app = Fastify()
let base = ''
let a: Semente
let b: Semente
const tokens = new Map<string, () => Promise<ContextoExec>>()

beforeAll(async () => {
  h = await montar()
  a = await semear(admin)
  b = await semear(admin)
  tokens.set('tok-ana', () => pessoa(admin, a.esc, 'u-ana', 'mcp'))
  tokens.set('tok-fiscal', () => pessoa(admin, a.esc, 'u-fiscal', 'mcp'))
  tokens.set('tok-integrante', () => integrante(admin, a.esc, null, 'mcp'))
  tokens.set('tok-ana-b', () => pessoa(admin, b.esc, 'u-ana', 'mcp'))
  await rotasMcp(app, h.registro, async (req) => {
    const t = (req.headers.authorization ?? '').replace(/^Bearer /, '')
    const f = tokens.get(t)
    return f ? f() : null
  })
  await app.listen({ port: 0, host: '127.0.0.1' })
  const addr = app.server.address()
  base = `http://127.0.0.1:${typeof addr === 'object' && addr ? addr.port : 0}`
})
afterAll(async () => {
  await app.close()
  await h.parar()
  await admin.end()
})

async function cliente(token: string, caminho = '/mcp') {
  const c = new Client({ name: 'teste', version: '1.0.0' })
  await c.connect(new StreamableHTTPClientTransport(new URL(base + caminho), { requestInit: { headers: { Authorization: `Bearer ${token}` } } }))
  return c
}

describe('servidor MCP por escritório', () => {
  it('sem token não entra', async () => {
    const r = await fetch(base + '/mcp', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' })
    expect(r.status).toBe(401)
  })

  it('lista só o que a pessoa pode, em ordem fixa, com esquema estrito; decidir cartão fica fora', async () => {
    const c = await cliente('tok-ana')
    const { tools } = await c.listTools()
    const nomes = tools.map((t) => t.name)
    expect(nomes).toEqual([...nomes].sort())
    expect(nomes).toContain('contabil__ecd__conferir_e_transmitir')
    expect(nomes).toContain('execucao__obter')
    expect(nomes).not.toContain('aprovacao__decidir')
    const ecd = tools.find((t) => t.name === 'contabil__ecd__conferir_e_transmitir')!
    expect(ecd.inputSchema.additionalProperties).toBe(false)
    await c.close()

    const f = await cliente('tok-fiscal')
    const deFiscal = (await f.listTools()).tools.map((t) => t.name)
    expect(deFiscal).not.toContain('contabil__ecd__conferir_e_transmitir')
    const r = await f.callTool({ name: 'contabil__ecd__conferir_e_transmitir', arguments: { cliente_id: 'c-1', exercicio: '2025', documento_id: 'x' } })
    expect(r.isError).toBe(true)
    await f.close()
  })

  it('recorte por setor corta a lista', async () => {
    const c = await cliente('tok-ana', '/mcp/setor/fiscal')
    const nomes = (await c.listTools()).tools.map((t) => t.name)
    expect(nomes).not.toContain('contabil__ecd__conferir_e_transmitir')
    expect(nomes).toContain('execucao__obter')
    await c.close()
  })

  it('tools/call inicia o procedimento pelo mesmo motor e devolve a execução para acompanhar', async () => {
    const doc = await documentoEcd(admin, a)
    const c = await cliente('tok-ana')
    const r = await c.callTool({ name: 'contabil__ecd__conferir_e_transmitir', arguments: { cliente_id: 'c-1', exercicio: '2025', documento_id: doc, chave_idempotencia: 'mcp-chave-0001' } })
    expect(r.isError).toBe(false)
    const env = r.structuredContent as { resultado: string; execucao_id: string }
    expect(['em_execucao', 'aguardando_aprovacao']).toContain(env.resultado)
    await esperar(async () => {
      const o = await c.callTool({ name: 'execucao__obter', arguments: { execucao_id: env.execucao_id } })
      return (o.structuredContent as { dados: { estado: string } }).dados.estado
    }, (e) => e === 'aguardando_cartao')
    // A mesma chave devolve a mesma execução.
    const de_novo = await c.callTool({ name: 'contabil__ecd__conferir_e_transmitir', arguments: { cliente_id: 'c-1', exercicio: '2025', documento_id: doc, chave_idempotencia: 'mcp-chave-0001' } })
    expect((de_novo.structuredContent as { execucao_id: string }).execucao_id).toBe(env.execucao_id)
    // Entrada fora do esquema volta como erro por campo, sem efeito.
    const ruim = await c.callTool({ name: 'contabil__ecd__conferir_e_transmitir', arguments: { cliente_id: 'c-1', exercicio: '25', documento_id: doc, extra: 1 } })
    expect(ruim.isError).toBe(true)
    expect((ruim.structuredContent as { codigo: string }).codigo).toBe('ENTRADA_INVALIDA')
    await c.close()

    // Outro escritório, mesma pessoa "u-ana": não enxerga a execução de A.
    const deB = await cliente('tok-ana-b')
    const o = await deB.callTool({ name: 'execucao__obter', arguments: { execucao_id: env.execucao_id } })
    expect(o.isError).toBe(true)
    expect((o.structuredContent as { codigo: string }).codigo).toBe('EXECUCAO_INEXISTENTE')
    await deB.close()
  })

  it('o integrante pelo MCP inicia procedimento, mas o ato irreversível espera a pessoa', async () => {
    const s = a
    const doc = await documentoEcd(admin, s)
    await admin`delete from entrega_obrigacao where escritorio_id = ${s.esc}`
    const c = await cliente('tok-integrante')
    const nomes = (await c.listTools()).tools.map((t) => t.name)
    expect(nomes).not.toContain('aprovacao__decidir')
    const r = await c.callTool({ name: 'contabil__ecd__conferir_e_transmitir', arguments: { cliente_id: 'c-1', exercicio: '2025', documento_id: doc } })
    const env = r.structuredContent as { execucao_id: string }
    const fim = await esperar(async () => (await admin`select estado, cartao_id from execucao where id = ${env.execucao_id}`)[0]!, (e) => e.estado === 'aguardando_cartao' || e.estado === 'falhou')
    expect(fim.estado).toBe('aguardando_cartao')
    const [cartao] = await admin`select pode_aprovar from cartao_aprovacao where id = ${fim.cartao_id}`
    // Integrante sem pessoa por trás: o cartão vai a quem gere o setor e ao Administrador.
    expect(cartao!.pode_aprovar).toEqual(expect.arrayContaining(['u-admin', 'u-gestora']))
    expect(cartao!.pode_aprovar).not.toContain('i-contabil')
    await c.close()
  })
})

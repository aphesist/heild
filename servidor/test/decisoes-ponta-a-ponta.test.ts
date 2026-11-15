import type { FastifyInstance } from 'fastify'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { criarProcessos, FornecedorDemonstracao, type Processos } from '@heild/processos'
import { extensaoIntegrantes } from '@heild/integrantes'
import { criarApp } from '../src/app.ts'
import { config } from '../src/config.ts'
import { sqlAdmin, sqlApi } from '../src/banco/pg.ts'
import { desligarProcessos, ligarProcessos } from '../src/b2.ts'
import { entrar, ferramenta, operacao } from './ajuda.ts'

/**
 * A decisão (a) da B5 com o gatilho 18 da B3, de ponta a ponta, como em produção (API produtora,
 * worker da B2 com a extensão dos integrantes):
 *   o integrante pede → cartão do executor → a pessoa edita e aprova pela API (o comando guardado
 *   executa com a alteração) → o evento `aprovacao.decidir` acorda o integrante com a diferença →
 *   o comentário vira proposta de memória do setor (cartão para quem gere).
 */

const ESC = 'esc-andrade'
const adm = sqlAdmin()
let worker: Processos
let apiB2: Processos
let app: FastifyInstance
let fernanda: string

async function esperar<T>(ler: () => Promise<T>, ok: (v: T) => boolean, ms = 30_000): Promise<T> {
  const fim = Date.now() + ms
  let v = await ler()
  while (!ok(v)) {
    if (Date.now() > fim) throw new Error(`Tempo esgotado. Último valor: ${JSON.stringify(v)}`)
    await new Promise((r) => setTimeout(r, 150))
    v = await ler()
  }
  return v
}

beforeAll(async () => {
  worker = await criarProcessos({ url: config.pgAdmin, modo: 'worker', fornecedor: new FornecedorDemonstracao(), extensoes: [extensaoIntegrantes()], filas: { esperaInicialSegundos: 1 } })
  await worker.iniciarWorkers({ intervalo: 0.5 })
  apiB2 = await ligarProcessos(sqlApi())
  app = criarApp({ logs: false, processos: apiB2 })
  fernanda = await entrar(app, { escritorio_id: ESC, usuario_id: 'u1' })
})

afterAll(async () => {
  await app?.close()
  await desligarProcessos(apiB2)
  await worker?.parar()
})

/** O integrante do Atendimento pede para mandar a mensagem ao cliente (irreversível: cartão). */
async function pedir(corpo: string) {
  const [cv] = await adm`select id from conversa where escritorio_id = ${ESC} order by id limit 1`
  const r = await operacao(app, fernanda, { tipo: 'operacao', operacao: 'mensagens.criar', argumentos: [{ conversa_id: cv!.id, direcao: 'saida', canal: 'whatsapp', autor_tipo: 'integrante', corpo, origem_externa: false }] }, { integrante: 'i-atendimento' })
  expect(r.status).toBe(202)
  return String(r.corpo.cartao_id)
}
const itens = (tipo: string, cartao: string) => adm`select integrante_id, resumo from item_fila where escritorio_id = ${ESC} and tipo = ${tipo} and resumo->>'cartao_id' = ${cartao}`

describe('aprovar com alteração acorda o integrante (gatilho 18)', () => {
  it('editar e aprovar: executa com a alteração, acorda o integrante com a diferença e o comentário vira proposta de memória', async () => {
    const original = 'Sua guia vence dia 20.'
    const corrigido = 'Sua guia do DAS vence em 20 de dezembro de 2026.'
    const comentario = 'Para os clientes do Simples, escreva o vencimento por extenso, com o mês.'
    const cartao = await pedir(original)
    const r = await ferramenta(app, fernanda, 'aprovacao.decidir', { cartao_id: cartao, decisao: 'aprovado', argumentos_editados: { corpo: corrigido }, comentario })
    expect(r.status).toBe(200)
    expect((await adm`select count(*)::int as n from mensagem where escritorio_id = ${ESC} and corpo = ${corrigido}`)[0]!.n).toBe(1)
    // O evento que a B3 escuta: nome, cartão e a diferença no formato combinado.
    const [ev] = await adm`select nome, resultado, aprovacao_id, resultado_ref, argumentos_resumo from evento where escritorio_id = ${ESC} and id = ${r.corpo.evento_id}`
    expect(ev).toMatchObject({ nome: 'aprovacao.decidir', resultado: 'aprovado', aprovacao_id: cartao, resultado_ref: cartao, argumentos_resumo: { diferenca: { corpo: { de: original, para: corrigido } } } })
    // O integrante é acordado com a decisão, o comentário e a diferença.
    const [item] = await esperar(() => itens('aprovacao_editada', cartao), (x) => x.length > 0)
    expect(item).toMatchObject({ integrante_id: 'i-atendimento', resumo: { cartao_id: cartao, status: 'editado_e_aprovado', comentario, decidido_por: 'u1', diferenca: { corpo: { de: original, para: corrigido } } } })
    // E propõe a lição como memória do setor (nada muda sozinho: cartão para quem gere aprovar).
    const [m] = await esperar(() => adm`select argumentos, pedido_por_id, status from cartao_aprovacao where escritorio_id = ${ESC} and tipo = 'memoria' and argumentos->'valor'->>'cartao_id' = ${cartao}`, (x) => x.length > 0)
    expect(m).toMatchObject({ pedido_por_id: 'i-atendimento', status: 'pendente', argumentos: { valor: { comentario, decisao: 'editado_e_aprovado' } } })
  })

  it('recusar com comentário: nada executa e o integrante é acordado com a recusa', async () => {
    const texto = 'Mensagem que a pessoa vai recusar.'
    const cartao = await pedir(texto)
    const r = await ferramenta(app, fernanda, 'aprovacao.decidir', { cartao_id: cartao, decisao: 'recusado', comentario: 'Não mande nada a este cliente antes de falar comigo.' })
    expect(r.status).toBe(200)
    expect((await adm`select count(*)::int as n from mensagem where escritorio_id = ${ESC} and corpo = ${texto}`)[0]!.n).toBe(0)
    const [item] = await esperar(() => itens('aprovacao_recusada', cartao), (x) => x.length > 0)
    expect(item).toMatchObject({ integrante_id: 'i-atendimento', resumo: { status: 'recusado', comentario: 'Não mande nada a este cliente antes de falar comigo.' } })
  })
})

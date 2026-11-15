import { createHash } from 'node:crypto'
import type { FastifyInstance } from 'fastify'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { FornecedorDemonstracao, criarProcessos, type Processos } from '@heild/processos'
import { extensaoIntegrantes, instalarIntegrantes, procedimentosDosIntegrantes, RespostaPadrao } from '@heild/integrantes'
import { criarApp } from '../src/app.ts'
import { config } from '../src/config.ts'
import { sqlAdmin, sqlApi } from '../src/banco/pg.ts'
import { desligarProcessos, ligarProcessos } from '../src/b2.ts'
import { entrar, ferramenta } from './ajuda.ts'

/**
 * B3 pela API da B1, de ponta a ponta:
 *   POST assistente.pedir (chat) → roteamento por regra → integrante do Fiscal → procedimento no
 *   worker → cartão → aprovação pela API → resposta padrão do integrante, encaminhada pelo
 *   Assistente sem reescrever → cadeia de hash que confere com os eventos da B1, da B2 e da B3.
 */

const ESC = 'esc-andrade'
const CLIENTE = 'c2'
let worker: Processos
let apiB3: Processos
let app: FastifyInstance
let token: string
const adm = sqlAdmin()

const demo = new FornecedorDemonstracao().responder('fis.caixa_postal.classificar', (e: { prazos: string[] }) => ({
  categoria: 'intimacao',
  prazo: e.prazos.at(-1) ?? null,
  confianca: 0.96,
  motivo: 'Termo de intimação com prazo.',
}))

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
  worker = await criarProcessos({ url: config.pgAdmin, modo: 'worker', fornecedor: demo, procedimentos: procedimentosDosIntegrantes, extensoes: [extensaoIntegrantes()], filas: { esperaInicialSegundos: 1 } })
  await worker.iniciarWorkers({ intervalo: 0.5 })
  apiB3 = await ligarProcessos(sqlApi())
  app = criarApp({ logs: false, processos: apiB3 })
  token = await entrar(app, { escritorio_id: ESC, usuario_id: 'u1' })
  await instalarIntegrantes(adm as never, ESC, { bolsas: { fiscal: 1000, assistente: 1000 } })
  await adm`insert into documento (escritorio_id, id, cliente_id, tipo, nome_arquivo, mime, hash_sha256, origem, backend_id, metadados)
            values (${ESC}, 'doc-ecac-b3', ${CLIENTE}, 'mensagem_ecac', 'ecac.txt', 'text/plain', ${createHash('sha256').update('ecac-b3').digest('hex')}, 'upload', 'plataforma',
            ${adm.json({ texto_extraido: 'Termo de Intimação Fiscal. Apresentar os livros até 30/11/2026.' })}) on conflict do nothing`
})

afterAll(async () => {
  await app?.close()
  await desligarProcessos(apiB3)
  await worker?.parar()
})

describe('B3 pela API: chat → roteamento → integrante → procedimento → cartão → aprovação → resposta padrão → Assistente', () => {
  it('as ferramentas do Assistente e as operações de processo dos cinco setores estão na lista', async () => {
    const nomes = (await app.inject({ method: 'GET', url: '/v1/ferramentas' })).json().ferramentas.map((f: { nome: string }) => f.nome)
    expect(nomes).toEqual(expect.arrayContaining(['assistente.pedir', 'assistente.obter', 'integrante.listar', 'fiscal.guia.conferir_e_enviar', 'fiscal.caixa_postal.triar', 'dp.evento.classificar_e_lancar', 'societario.alteracao.triar', 'atendimento.faq.responder']))
  })

  it('o caminho inteiro, com a cadeia conferindo no fim', async () => {
    const pedido = await ferramenta(app, token, 'assistente.pedir', { texto: 'Chegou isto na caixa postal do e-CAC.', anexos: { documento_id: 'doc-ecac-b3' } }, { chave: null })
    expect(pedido.status).toBe(200)
    expect(pedido.corpo.dados).toMatchObject({ estado: 'encaminhado', encaminhado_para: { integrante_id: 'i-fiscal' }, roteamento: { camada: 'regra', procedimento: 'FIS-CAIXA-POSTAL-TRIAR' } })
    const pedido_id = pedido.corpo.dados.pedido_id as string
    const obter = async () => (await ferramenta(app, token, 'assistente.obter', { pedido_id }, { chave: null })).corpo.dados

    const comCartao = await esperar(obter, (d) => d.resposta.tipo === 'aguardando_aprovacao')
    expect(RespostaPadrao.parse(comCartao.resposta)).toEqual(comCartao.resposta)
    expect(comCartao.resposta).toMatchObject({ de: { id: 'i-fiscal' }, acao: { tipo: 'aprovacao' } })

    const decisao = await ferramenta(app, token, 'aprovacao.decidir', { cartao_id: comCartao.resposta.acao.cartao_id, decisao: 'aprovado' })
    expect(decisao.status).toBe(200)

    const fim = await esperar(obter, (d) => d.resposta.tipo === 'concluido')
    expect(fim.resposta).toMatchObject({ titulo: 'Mensagem do e-CAC: intimacao', dados: { categoria: 'intimacao', prazo: '2026-11-30' } })
    const [doc] = await adm`select metadados from documento where escritorio_id = ${ESC} and id = 'doc-ecac-b3'`
    expect(doc!.metadados.triagem_ecac).toMatchObject({ categoria: 'intimacao', prazo: '2026-11-30' })

    const cadeia = await ferramenta(app, token, 'auditoria.verificar_cadeia', {}, { chave: null })
    expect(cadeia.corpo.dados ?? cadeia.corpo).toMatchObject({ ok: true })
  })

  it('o pedido de outra pessoa não se lê, e campo desconhecido é 400', async () => {
    const pedido = await ferramenta(app, token, 'assistente.pedir', { texto: 'Classifique a competência deste documento.' }, { chave: null })
    const outro = await entrar(app, { escritorio_id: ESC, usuario_id: 'u2' })
    const r = await ferramenta(app, outro, 'assistente.obter', { pedido_id: pedido.corpo.dados.pedido_id }, { chave: null })
    expect(r.status).toBe(403)
    expect((await ferramenta(app, token, 'assistente.pedir', { texto: 'x', setor: 'fiscal' }, { chave: null })).status).toBe(400)
  })
})

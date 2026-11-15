import { createHash } from 'node:crypto'
import type { FastifyInstance } from 'fastify'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { ErroRegra, FornecedorDemonstracao, criarProcessos, type Conector, type Processos } from '@heild/processos'
import { criarApp } from '../src/app.ts'
import { config } from '../src/config.ts'
import { sqlAdmin, sqlApi } from '../src/banco/pg.ts'
import { desligarProcessos, ligarProcessos } from '../src/b2.ts'
import { chave, entrar, ferramenta, operacao } from './ajuda.ts'

/**
 * O encaixe B1 ↔ B2 de ponta a ponta, pela API:
 *   pedido pela API → job na transação do efeito → worker abre a execução do procedimento →
 *   cartão humano → aprovação pela API → transmissão → eventos na cadeia de hash, que confere.
 * E um evento de tela (documento criado pela API) acordando o gatilho da B2.
 *
 * Dois processos lógicos, como em produção: a API (login app_api, pg-boss só produtor) e o
 * worker da B2 (dono do esquema da fila, roda os passos, o operário de demonstração e o
 * órgão simulado).
 */

class OrgaoSimulado implements Conector {
  envios = 0
  readonly recebidos = new Map<string, Record<string, unknown>>()
  async executar(_m: string, argumentos: Record<string, unknown>, o: { chave: string; escritorio_id: string }) {
    const k = `${o.escritorio_id}|${o.chave}`
    if (this.recebidos.has(k)) throw new ErroRegra('DUPLICADO', 'O órgão recebeu de novo.')
    this.envios++
    this.recebidos.set(k, argumentos)
    return { recibo: `REC-${createHash('sha1').update(k).digest('hex').slice(0, 10).toUpperCase()}` }
  }
  async consultar(_m: string, c: string, o: { escritorio_id: string }) {
    return this.recebidos.has(`${o.escritorio_id}|${c}`) ? { recibo: 'REC-CONSULTA' } : null
  }
}

const ESC = 'esc-andrade'
const CLIENTE = 'c2' // Padaria Pão Quente ME, 23.456.789/0001-01
const orgao = new OrgaoSimulado()
let worker: Processos
let apiB2: Processos
let app: FastifyInstance
let joao: string
const adm = sqlAdmin()

const demo = new FornecedorDemonstracao().responder('ctb.ecd.apontar_atencao', (e: { contas_atipicas: { conta_codigo: string }[] }) => ({
  apontamentos: e.contas_atipicas.slice(0, 2).map((c) => ({ conta_codigo: c.conta_codigo, motivo: 'Variação forte no ano; conferir o fechamento.' })),
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
  // Worker da B2: superusuário só porque é o dono do esquema da fila no banco de teste.
  worker = await criarProcessos({ url: config.pgAdmin, modo: 'worker', fornecedor: demo, conectores: { sped: orgao }, filas: { esperaInicialSegundos: 1 } })
  await worker.iniciarWorkers({ intervalo: 0.5 })
  // A API como em produção: login app_api, pg-boss só produtor.
  apiB2 = await ligarProcessos(sqlApi())
  app = criarApp({ logs: false, processos: apiB2 })
  joao = await entrar(app, { escritorio_id: ESC, usuario_id: 'u2' }) // Gestor do Contábil

  // Dados do cliente: competências de 2025 fechadas, bolsa do setor e a ECD já lida.
  for (let m = 1; m <= 12; m++)
    await adm`insert into competencia_contabil (escritorio_id, cliente_id, competencia, situacao) values (${ESC}, ${CLIENTE}, ${`2025-${String(m).padStart(2, '0')}`}, 'fechada') on conflict do nothing`
  await adm`insert into bolsa_setor (escritorio_id, setor, mes, saldo_centavos) values (${ESC}, 'contabil', to_char(now() at time zone 'America/Sao_Paulo', 'YYYY-MM'), 1000) on conflict do nothing`
  const contas = [
    { codigo: '1.1.01', nome: 'Caixa', natureza: 'D', saldo_inicial_centavos: 1_000_000, debitos_centavos: 5_000_000, creditos_centavos: 4_000_000, saldo_final_centavos: 2_000_000 },
    { codigo: '2.1.01', nome: 'Fornecedores', natureza: 'C', saldo_inicial_centavos: 2_000_000, debitos_centavos: 4_000_000, creditos_centavos: 5_000_000, saldo_final_centavos: 3_000_000 },
  ]
  const ecd = { cnpj: '23456789000101', exercicio: '2025', contas, total_debitos_centavos: 9_000_000, total_creditos_centavos: 9_000_000 }
  await adm`insert into documento (escritorio_id, id, cliente_id, tipo, nome_arquivo, mime, hash_sha256, origem, backend_id, metadados)
            values (${ESC}, 'doc-ecd-b2', ${CLIENTE}, 'ecd', 'ecd-2025.txt', 'text/plain', ${createHash('sha256').update('ecd-b2').digest('hex')}, 'upload', 'plataforma', ${adm.json({ ecd })})
            on conflict do nothing`
})

afterAll(async () => {
  await app?.close()
  await desligarProcessos(apiB2)
  await worker?.parar()
})

const obter = async (execucao_id: string) => (await ferramenta(app, joao, 'execucao.obter', { execucao_id }, { chave: null })).corpo.dados

describe('B1 ↔ B2 pela API', () => {
  it('a operação de processo está no catálogo tipado, no OpenAPI e na lista de ferramentas', async () => {
    const lista = (await app.inject({ method: 'GET', url: '/v1/ferramentas' })).json()
    const nomes = lista.ferramentas.map((f: { nome: string }) => f.nome)
    expect(nomes).toEqual(expect.arrayContaining(['contabil.ecd.conferir_e_transmitir', 'contabil.documento.classificar_competencia', 'execucao.obter', 'procedimento.listar']))
    const openapi = (await app.inject({ method: 'GET', url: '/v1/openapi.json' })).json()
    expect(Object.keys(openapi.paths)).toContain('/v1/ferramentas/contabil.ecd.conferir_e_transmitir')
  })

  it('pedido → job → procedimento → cartão → aprovação → transmissão → cadeia que confere', async () => {
    const k = chave('ecd')
    const pedido = await ferramenta(app, joao, 'contabil.ecd.conferir_e_transmitir', { cliente_id: CLIENTE, exercicio: '2025', documento_id: 'doc-ecd-b2' }, { chave: k })
    expect(pedido.status).toBe(202)
    expect(pedido.corpo).toMatchObject({ resultado: 'em_execucao', estado: 'pendente' })
    const id = pedido.corpo.execucao_id as string
    // O pedido gravou o evento na cadeia e o job na mesma transação (o job carrega o id devolvido).
    const [ev] = await adm`select seq, resultado_ref from evento where id = ${pedido.corpo.evento_id}`
    expect(ev!.resultado_ref).toBe(id)
    expect(Number(ev!.seq)).toBeGreaterThan(0)
    // Repetir o pedido com a mesma chave devolve a mesma execução (idempotência da B1).
    const de_novo = await ferramenta(app, joao, 'contabil.ecd.conferir_e_transmitir', { cliente_id: CLIENTE, exercicio: '2025', documento_id: 'doc-ecd-b2' }, { chave: k })
    expect(de_novo.status).toBe(202)
    expect(de_novo.corpo.execucao_id).toBe(id)
    expect(de_novo.cabecalhos['idempotent-replayed']).toBe('true')

    const parada = await esperar(() => obter(id), (e) => e?.estado === 'aguardando_cartao')
    const [cartao] = await adm`select * from cartao_aprovacao where id = ${parada.cartao_id}`
    expect(cartao!.ferramenta).toBe('contabil.ecd_ecf.transmitir')
    expect(cartao!.pode_aprovar).toEqual(['u2'])
    expect(orgao.envios).toBe(0)

    // O integrante (agindo pelo João) não decide; só a pessoa.
    const pelo_integrante = await ferramenta(app, joao, 'aprovacao.decidir', { cartao_id: cartao!.id, decisao: 'aprovado' }, { integrante: 'i-contabil' })
    expect(pelo_integrante.status).toBe(403)
    expect(orgao.envios).toBe(0)

    const aprovado = await ferramenta(app, joao, 'aprovacao.decidir', { cartao_id: cartao!.id, decisao: 'aprovado' })
    expect(aprovado.status).toBe(200)
    const fim = await esperar(() => obter(id), (e) => e?.estado === 'concluida')
    expect(fim.saida.recibo).toMatch(/^REC-/)
    expect(orgao.envios).toBe(1)

    // A transmissão aponta o cartão que a liberou, e a cadeia do escritório (eventos da B1 e da B2 juntos) confere.
    const [tx] = await adm`select aprovacao_id from evento where escritorio_id = ${ESC} and execucao_id = ${id} and ferramenta = 'contabil.ecd_ecf.transmitir' and resultado = 'ok'`
    expect(tx!.aprovacao_id).toBe(cartao!.id)
    const cadeia = await ferramenta(app, joao, 'auditoria.verificar_cadeia', {}, { chave: null })
    expect(cadeia.status).toBe(200)
    expect(cadeia.corpo.dados ?? cadeia.corpo).toMatchObject({ ok: true })
  })

  it('pessoa sem o setor recebe 403 na hora, sem job nem execução', async () => {
    const [semContabil] = await adm`select u.id from usuario u where u.escritorio_id = ${ESC} and u.papel = 'colaborador' and u.situacao = 'ativo'
      and not exists (select 1 from vinculo_setor v join setor s on s.escritorio_id = v.escritorio_id and s.id = v.setor_id where v.escritorio_id = u.escritorio_id and v.usuario_id = u.id and s.codigo = 'contabil') limit 1`
    const t = await entrar(app, { escritorio_id: ESC, usuario_id: semContabil!.id })
    const antes = (await adm`select count(*)::int as n from execucao where escritorio_id = ${ESC}`)[0]!.n
    const r = await ferramenta(app, t, 'contabil.ecd.conferir_e_transmitir', { cliente_id: CLIENTE, exercicio: '2025', documento_id: 'doc-ecd-b2' })
    expect(r.status).toBe(403)
    await new Promise((res) => setTimeout(res, 1500))
    expect((await adm`select count(*)::int as n from execucao where escritorio_id = ${ESC}`)[0]!.n).toBe(antes)
  })

  it('um documento criado pela API acorda o gatilho da B2, que classifica a competência sem modelo', async () => {
    await adm`insert into gatilho (escritorio_id, evento_nome, procedimento_id, setor) values (${ESC}, 'documento.criar', 'CTB-COMPETENCIA-DOC', 'contabil')`
    await adm`insert into procedimento_config (escritorio_id, procedimento_id, executa_sozinho) values (${ESC}, 'CTB-COMPETENCIA-DOC', true) on conflict do nothing`
    const r = await operacao(app, joao, {
      tipo: 'operacao',
      operacao: 'documentos.criar',
      argumentos: [{ cliente_id: CLIENTE, tipo: 'nfe', nome_arquivo: 'nfe-1234.xml', mime: 'application/xml', tamanho_bytes: 100, hash_sha256: 'a'.repeat(64), origem: 'upload', backend_id: 'plataforma', caminho: '', visivel_ao_cliente: false, versao: 1, metadados: { data_emissao: '2026-10-21' } }],
      ids: [],
    })
    expect(r.status).toBe(200)
    const docId = r.corpo.linhas.documento[0].id as string
    const d = await esperar(async () => (await adm`select competencia from documento where escritorio_id = ${ESC} and id = ${docId}`)[0]!, (x) => x.competencia !== null)
    expect(d.competencia).toBe('2026-10')
    const [ex] = await adm`select origem, causado_por_evento_id from execucao where escritorio_id = ${ESC} and procedimento_id = 'CTB-COMPETENCIA-DOC' and entrada->>'documento_id' = ${docId}`
    expect(ex!.origem).toBe('evento')
    expect(ex!.causado_por_evento_id).toBe(r.corpo.evento_id)
  })
})

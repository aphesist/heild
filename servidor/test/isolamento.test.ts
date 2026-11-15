import postgres from 'postgres'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { config } from '../src/config.ts'
import { api, banco, entrar, ferramenta, operacao } from './ajuda.ts'

/** Teste de vazamento entre escritórios (Fundações 11): a RLS é a segunda barreira, por baixo da API. */

const app = api()
let andrade: string, horizonte: string
let tarefaAndrade: string

beforeAll(async () => {
  andrade = await entrar(app, { escritorio_id: 'esc-andrade' })
  horizonte = await entrar(app, { escritorio_id: 'esc-horizonte' })
  const [t] = await banco()`select id from tarefa where escritorio_id = 'esc-andrade' and status = 'a_fazer' order by id limit 1`
  tarefaAndrade = t.id
})
afterAll(() => app.close())

describe('pela API', () => {
  it('o escritório vem do token: Horizonte não lê tarefa da Andrade', async () => {
    const r = await ferramenta(app, horizonte, 'tarefa.obter', { tarefa_id: tarefaAndrade }, { chave: null })
    expect(r.status).toBe(422)
    expect(r.corpo.codigo).toBe('NAO_ENCONTRADO')
    const ok = await ferramenta(app, andrade, 'tarefa.obter', { tarefa_id: tarefaAndrade }, { chave: null })
    expect(ok.status).toBe(200)
  })

  it('Horizonte não muda tarefa da Andrade por operação de repositório', async () => {
    const r = await operacao(app, horizonte, { tipo: 'operacao', operacao: 'tarefas.mudarStatus', argumentos: [tarefaAndrade, 'em_andamento'] })
    expect(r.status).toBe(422)
    expect(r.corpo.codigo).toBe('NAO_ENCONTRADO')
    const [t] = await banco()`select status from tarefa where escritorio_id = 'esc-andrade' and id = ${tarefaAndrade}`
    expect(t.status).toBe('a_fazer')
  })

  it('linha com o escritório de outro é recusada (FORA_DO_ESCRITORIO)', async () => {
    const r = await operacao(app, horizonte, { tipo: 'linhas', gravar: [{ tabela: 'registro_tela', linha: { id: 'rt-invasao', escritorio_id: 'esc-andrade', valor: { x: 1 }, criado_em: new Date().toISOString() } }], remover: [] })
    expect(r.status).toBe(403)
    expect(r.corpo.codigo).toBe('FORA_DO_ESCRITORIO')
    const [n] = await banco()`select count(*)::int as n from registro_tela where id = 'rt-invasao'`
    expect(n.n).toBe(0)
  })

  it('sincronizar só devolve linhas do escritório da sessão', async () => {
    const r = await app.inject({ method: 'GET', url: '/v1/sincronizar', headers: { authorization: `Bearer ${horizonte}` } })
    expect(r.statusCode).toBe(200)
    const corpo = r.json() as { tabelas: Record<string, { escritorio_id: string }[]> }
    const todas = Object.values(corpo.tabelas).flat()
    expect(todas.length).toBeGreaterThan(100)
    expect(todas.every((l) => l.escritorio_id === 'esc-horizonte')).toBe(true)
  })

  it('token adulterado ou sem token não entra', async () => {
    const semToken = await app.inject({ method: 'GET', url: '/v1/sessao' })
    expect(semToken.statusCode).toBe(401)
    const [h, p, s] = andrade.split('.')
    const payload = JSON.parse(Buffer.from(p, 'base64url').toString())
    payload.escritorio_id = 'esc-horizonte'
    const forjado = `${h}.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.${s}`
    const r = await app.inject({ method: 'GET', url: '/v1/sessao', headers: { authorization: `Bearer ${forjado}` } })
    expect(r.statusCode).toBe(401)
    expect(r.json().codigo).toBe('SESSAO_INVALIDA')
  })
})

describe('no banco (segunda barreira)', () => {
  const api = postgres(config.pgApi, { onnotice: () => {}, max: 1 })
  afterAll(() => api.end())

  it('o papel de login da API sozinho não lê nem grava nada', async () => {
    await expect(api`select count(*) from tarefa`).rejects.toThrow(/permission denied/)
  })

  it('api_executor com as claims de um escritório não vê o outro', async () => {
    const n = await api.begin(async (tx) => {
      await tx`select set_config('request.jwt.claims', ${JSON.stringify({ app_metadata: { escritorio_id: 'esc-andrade' } })}, true), set_config('role', 'api_executor', true)`
      const [a] = await tx`select count(*)::int as n from tarefa where escritorio_id = 'esc-horizonte'`
      const [b] = await tx`select count(*)::int as n from tarefa`
      return { outro: a.n, meu: b.n }
    })
    expect(n.outro).toBe(0)
    expect(n.meu).toBeGreaterThan(50)
  })

  it('api_executor não insere linha de outro escritório (RLS)', async () => {
    await expect(
      api.begin(async (tx) => {
        await tx`select set_config('request.jwt.claims', ${JSON.stringify({ app_metadata: { escritorio_id: 'esc-andrade' } })}, true), set_config('role', 'api_executor', true)`
        await tx`insert into registro_tela (escritorio_id, id) values ('esc-horizonte', 'rt-rls')`
      }),
    ).rejects.toThrow(/row-level security/)
  })

  it('o navegador (authenticated) não grava: a escrita é só da API', async () => {
    await expect(
      banco().begin(async (tx) => {
        await tx`select set_config('request.jwt.claims', ${JSON.stringify({ app_metadata: { escritorio_id: 'esc-andrade' } })}, true), set_config('role', 'authenticated', true)`
        await tx`update tarefa set titulo = 'x' where escritorio_id = 'esc-andrade'`
      }),
    ).rejects.toThrow(/permission denied/)
  })
})

import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { FastifyInstance } from 'fastify'
import { config } from '../src/config.ts'
import { limparCachePerfil } from '../src/auth/cache-perfil.ts'
import { noEscritorio, sqlApi } from '../src/banco/pg.ts'
import { verificarLeituras } from '../src/leituras.ts'
import { api, banco, entrar, ferramenta } from './ajuda.ts'

/**
 * SSE (`/v1/eventos/fluxo`), cache do perfil e registro de leituras (B5).
 * O fluxo roda num servidor HTTP de verdade (o SSE é uma resposta aberta); o passo da cauda
 * e a gravação das leituras são chamados à mão, sem relógio, para o teste não depender de tempo.
 */

let app: FastifyInstance
let base = ''
let adm: string, rafael: string, horizonte: string

interface Aviso {
  evento: string
  dados: Record<string, any>
}

/** Abre o SSE com fetch (como o app) e junta os avisos que chegarem. */
async function abrir(token: string) {
  const ctl = new AbortController()
  const r = await fetch(`${base}/v1/eventos/fluxo`, { headers: { authorization: `Bearer ${token}` }, signal: ctl.signal })
  expect(r.status).toBe(200)
  expect(r.headers.get('content-type')).toContain('text/event-stream')
  const avisos: Aviso[] = []
  let fechado = false
  const leitor = r.body!.getReader()
  const texto = new TextDecoder()
  let resto = ''
  const pronto = new Promise<void>((ok) => {
    void (async () => {
      try {
        for (;;) {
          const { value, done } = await leitor.read()
          if (done) break
          resto += texto.decode(value, { stream: true })
          let i: number
          while ((i = resto.indexOf('\n\n')) >= 0) {
            const bloco = resto.slice(0, i)
            resto = resto.slice(i + 2)
            const ev = /^event: (.+)$/m.exec(bloco)?.[1]
            const dados = /^data: (.+)$/m.exec(bloco)?.[1]
            if (ev && dados) avisos.push({ evento: ev, dados: JSON.parse(dados) })
            if (ev === 'pronto') ok()
          }
        }
      } catch {
        /* abortado */
      }
      fechado = true
    })()
  })
  await pronto
  return { avisos, fechar: () => ctl.abort(), fechado: () => fechado }
}

const esperar = (ms: number) => new Promise((ok) => setTimeout(ok, ms))
/** Uma volta da cauda e um respiro para a resposta chegar ao leitor. */
async function volta() {
  await app.heild.fluxo.passo()
  await esperar(80)
}
const mudancas = (avisos: Aviso[], tabela: string) => avisos.filter((a) => a.evento === 'mudanca' && a.dados.tabela === tabela).flatMap((a) => a.dados.ids as string[])

beforeAll(async () => {
  app = api()
  base = await app.listen({ port: 0, host: '127.0.0.1' })
  adm = await entrar(app, { escritorio_id: 'esc-andrade', usuario_id: 'u1' })
  rafael = await entrar(app, { escritorio_id: 'esc-andrade', usuario_id: 'u7' })
  horizonte = await entrar(app, { escritorio_id: 'esc-horizonte', usuario_id: 'h-u1' })
})
afterAll(async () => {
  config.cachePerfilMs = 0
  await app.close()
})

describe('SSE de mudanças, filtrado pela regra de leitura', () => {
  it('o Membro recebe a tarefa do setor dele, não a de outro setor; outro escritório não recebe nada', async () => {
    const [doFiscal] = await banco()`select id from tarefa where escritorio_id = 'esc-andrade' and setor_id = 'fiscal' and status = 'a_fazer' order by id limit 1`
    const [doDp] = await banco()`select id from tarefa where escritorio_id = 'esc-andrade' and setor_id = 'dp' and status not in ('concluida','cancelada') order by id limit 1`
    const sr = await abrir(rafael)
    const sh = await abrir(horizonte)
    try {
      expect((await ferramenta(app, adm, 'tarefa.atualizar', { tarefa_id: doFiscal.id, campos: { titulo: 'Fiscal mudou (SSE)' } })).status).toBe(200)
      expect((await ferramenta(app, adm, 'tarefa.atualizar', { tarefa_id: doDp.id, campos: { titulo: 'DP mudou (SSE)' } })).status).toBe(200)
      await volta()
      expect(mudancas(sr.avisos, 'tarefa')).toContain(doFiscal.id)
      expect(mudancas(sr.avisos, 'tarefa')).not.toContain(doDp.id)
      expect(sh.avisos.filter((a) => a.evento === 'mudanca')).toEqual([])
      // Uma segunda volta não manda de novo o que já foi.
      const antes = sr.avisos.length
      await volta()
      expect(sr.avisos.length).toBe(antes)
    } finally {
      sr.fechar()
      sh.fechar()
    }
  })

  it('sem token, 401; o limite de conexões por conta vale', async () => {
    const r = await fetch(`${base}/v1/eventos/fluxo`)
    expect(r.status).toBe(401)
    const antes = config.fluxoPorConta
    config.fluxoPorConta = 1
    const a = await abrir(rafael)
    try {
      const r2 = await fetch(`${base}/v1/eventos/fluxo`, { headers: { authorization: `Bearer ${rafael}` } })
      const corpo = await r2.text()
      expect(corpo).toContain('event: erro')
      expect(corpo).toContain('LIMITE_TAXA')
    } finally {
      a.fechar()
      config.fluxoPorConta = antes
    }
  })

  it('a conta desativada tem o fluxo desligado na volta seguinte', async () => {
    const t = await entrar(app, { escritorio_id: 'esc-andrade', usuario_id: 'u9' })
    const s = await abrir(t)
    await banco()`update usuario set situacao = 'desativado' where escritorio_id = 'esc-andrade' and id = 'u9'`
    try {
      await volta()
      await esperar(50)
      expect(s.fechado()).toBe(true)
    } finally {
      await banco()`update usuario set situacao = 'ativo' where escritorio_id = 'esc-andrade' and id = 'u9'`
      s.fechar()
    }
  })
})

describe('cache do perfil', () => {
  it('guarda o perfil e a cauda de mudanças o invalida (mudança feita por fora desta instância)', async () => {
    config.cachePerfilMs = 300_000
    limparCachePerfil()
    const t = await entrar(app, { escritorio_id: 'esc-andrade', usuario_id: 'u4' })
    const perm = async () => (await app.inject({ method: 'GET', url: '/v1/sessao', headers: { authorization: `Bearer ${t}` } })).json().perfil.excecoes.length as number
    const antes = await perm()
    // Outra instância (aqui, o banco direto) bloqueia uma aba da conta.
    await banco()`insert into excecao_tela (escritorio_id, id, usuario_id, tela_ou_ferramenta, efeito, motivo, vigente_de) values ('esc-andrade', 'x-teste-cache', 'u4', 'aba.fiscal', 'bloquear', 'teste do cache', current_date)`
    try {
      expect(await perm()).toBe(antes) // ainda no cache
      await app.heild.fluxo.passo()
      expect(await perm()).toBe(antes + 1) // a cauda invalidou
    } finally {
      await banco()`delete from excecao_tela where escritorio_id = 'esc-andrade' and id = 'x-teste-cache'`
      config.cachePerfilMs = 0
    }
  })
})

describe('registro de leituras (evento_leitura)', () => {
  it('a leitura vira linha selada por lote, e o selo descobre adulteração', async () => {
    const r = await ferramenta(app, rafael, 'tarefa.listar', { status: ['a_fazer'], limite: 5 }, { chave: null })
    expect(r.status).toBe(200)
    const ids = r.corpo.dados.linhas.map((l: { id: string }) => l.id)
    await app.heild.leituras.descarregar()
    const [l] = await banco()`select * from evento_leitura where escritorio_id = 'esc-andrade' and ferramenta = 'tarefa.listar' and ator_id = 'u7' order by id desc limit 1`
    expect(l.ids).toEqual(ids)
    expect(l.quantidade).toBe(ids.length)
    expect(l.filtros).toEqual({ status: ['a_fazer'] })
    const ok = await noEscritorio(sqlApi(), { sub: 't', escritorio_id: 'esc-andrade' }, (tx) => verificarLeituras(tx, 'esc-andrade'))
    if (!ok.ok) console.error('selo quebrado', ok, await banco()`select * from evento_leitura where escritorio_id = 'esc-andrade' and lote = ${ok.primeiro_lote_quebrado}`)
    expect(ok).toMatchObject({ ok: true })
    expect(ok.leituras).toBeGreaterThan(0)
    // A API não reescreve; o superusuário, sim (e é descoberto).
    await expect(banco()`update evento_leitura set quantidade = 99 where escritorio_id = 'esc-andrade' and id = ${l.id}`).rejects.toThrow()
    await banco().begin(async (tx) => {
      await tx`select set_config('heild.restaurando', 'sim', true)`
      await tx`update evento_leitura set ids = '{}' where escritorio_id = 'esc-andrade' and id = ${l.id}`
    })
    const quebrado = await noEscritorio(sqlApi(), { sub: 't', escritorio_id: 'esc-andrade' }, (tx) => verificarLeituras(tx, 'esc-andrade'))
    expect(quebrado.ok).toBe(false)
    expect(quebrado.primeiro_lote_quebrado).toBe(Number(l.lote))
    await banco().begin(async (tx) => {
      await tx`select set_config('heild.restaurando', 'sim', true)`
      await tx`update evento_leitura set ids = ${ids} where escritorio_id = 'esc-andrade' and id = ${l.id}`
    })
  })

  it('lotes de vários pedidos encadeiam sem buraco, mesmo com gravações simultâneas', async () => {
    for (let i = 0; i < 12; i++) await ferramenta(app, adm, 'cliente.listar', { limite: 2 }, { chave: null })
    await Promise.all([app.heild.leituras.descarregar(), app.heild.leituras.descarregar()])
    const lotes = (await banco()`select lote from selo_leitura where escritorio_id = 'esc-andrade' order by lote`).map((x) => Number(x.lote))
    expect(lotes).toEqual(lotes.map((_, i) => i + 1))
    const ok = await noEscritorio(sqlApi(), { sub: 't', escritorio_id: 'esc-andrade' }, (tx) => verificarLeituras(tx, 'esc-andrade'))
    expect(ok.ok).toBe(true)
  })

  it('restaurar a demonstração recomeça as leituras e os selos juntos (nada de leitura órfã)', async () => {
    const t = await entrar(app, { escritorio_id: 'esc-horizonte', usuario_id: 'h-u1' })
    await ferramenta(app, t, 'cliente.listar', { limite: 2 }, { chave: null })
    await app.heild.leituras.descarregar()
    expect((await app.inject({ method: 'POST', url: '/v1/demonstracao/restaurar', headers: { authorization: `Bearer ${t}` }, payload: {} })).statusCode).toBe(200)
    const [n] = await banco()`select (select count(*) from evento_leitura where escritorio_id = 'esc-horizonte')::int as l, (select count(*) from selo_leitura where escritorio_id = 'esc-horizonte')::int as s`
    expect(n).toEqual({ l: 0, s: 0 })
  })

  it('o sincronizar também fica registrado', async () => {
    await app.inject({ method: 'GET', url: '/v1/sincronizar', headers: { authorization: `Bearer ${rafael}` } })
    await app.heild.leituras.descarregar()
    const [l] = await banco()`select quantidade, filtros from evento_leitura where escritorio_id = 'esc-andrade' and ferramenta = 'sincronizar' and ator_id = 'u7' order by id desc limit 1`
    expect(l.quantidade).toBeGreaterThan(0)
    expect(l.filtros.classes).toEqual([1, 2])
  })
})

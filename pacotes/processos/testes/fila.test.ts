import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { comEscritorio } from '../src/index.ts'
import { documentoSimples, integrante, montar, pessoa, semear, sqlAdmin } from './ambiente.ts'

/**
 * Fila com prioridade e limites (AGENTICO 4.6), testada sem workers: a admissão é chamada à mão
 * para o resultado ser determinístico.
 */
let h: Awaited<ReturnType<typeof montar>>
const admin = sqlAdmin()

beforeAll(async () => {
  h = await montar({ workers: false })
})
afterAll(async () => {
  await h.parar()
  await admin.end()
})

const estados = (esc: string) => admin`select id, estado, origem, responsavel_id from execucao where escritorio_id = ${esc} order by criado_em`

async function novaExecucao(esc: string, ctx: Awaited<ReturnType<typeof pessoa>>, o: { responsavel_id?: string } = {}) {
  const s = { esc, cliente: 'c-1', cnpj: '' }
  const doc = await documentoSimples(admin, s, { tipo: 'nfe', metadados: { data_emissao: '2026-10-10' } })
  return h.motor.iniciar(ctx, 'CTB-COMPETENCIA-DOC', { documento_id: doc, cliente_id: 'c-1' }, o)
}

describe('fila do motor', () => {
  it('limite por setor: o excedente espera, com a posição visível', async () => {
    const s = await semear(admin)
    await admin`insert into limite_execucao (escritorio_id, escopo, chave, maximo) values (${s.esc}, 'setor', 'contabil', 2)`
    const ana = await pessoa(admin, s.esc, 'u-ana')
    const ids = []
    for (let i = 0; i < 5; i++) ids.push((await novaExecucao(s.esc, ana)).execucao_id)
    await h.motor.admitir(s.esc)
    const l = await estados(s.esc)
    expect(l.filter((e) => e.estado === 'executando')).toHaveLength(2)
    expect(l.filter((e) => e.estado === 'pendente')).toHaveLength(3)
    const posicoes = await Promise.all(ids.slice(2).map(async (id) => (await h.motor.obter(ana, id)).posicao_na_fila))
    expect(posicoes).toEqual([1, 2, 3])
    // Admitir de novo não passa do limite.
    await h.motor.admitir(s.esc)
    expect((await estados(s.esc)).filter((e) => e.estado === 'executando')).toHaveLength(2)
  })

  it('pedido de pessoa no chat passa na frente de evento e de job', async () => {
    const s = await semear(admin)
    await admin`insert into limite_execucao (escritorio_id, escopo, chave, maximo) values (${s.esc}, 'escritorio', '*', 1)`
    const job = await integrante(admin, s.esc, null, 'job')
    const evento = await integrante(admin, s.esc, null, 'evento')
    const chat = await pessoa(admin, s.esc, 'u-ana', 'chat')
    await novaExecucao(s.esc, job)
    await novaExecucao(s.esc, evento)
    const doChat = await novaExecucao(s.esc, chat)
    await h.motor.admitir(s.esc)
    const rodando = (await estados(s.esc)).filter((e) => e.estado === 'executando')
    expect(rodando.map((e) => e.id)).toEqual([doChat.execucao_id])
    // Liberou a vaga: o evento vem antes do job.
    await admin`update execucao set estado = 'concluida' where id = ${doChat.execucao_id}`
    await h.motor.admitir(s.esc)
    expect((await estados(s.esc)).find((e) => e.estado === 'executando')!.origem).toBe('evento')
  })

  it('limite de segundo plano por pessoa: uma pessoa não toma a fila', async () => {
    const s = await semear(admin)
    await admin`insert into limite_execucao (escritorio_id, escopo, chave, maximo) values (${s.esc}, 'pessoa_segundo_plano', '*', 1)`
    const job = await integrante(admin, s.esc, null, 'job')
    await novaExecucao(s.esc, job, { responsavel_id: 'u-ana' })
    await novaExecucao(s.esc, job, { responsavel_id: 'u-ana' })
    await novaExecucao(s.esc, job, { responsavel_id: 'u-bruno' })
    await h.motor.admitir(s.esc)
    const rodando = (await estados(s.esc)).filter((e) => e.estado === 'executando')
    expect(rodando.map((e) => e.responsavel_id).sort()).toEqual(['u-ana', 'u-bruno'])
  })

  it('a fila e a execução de um escritório não aparecem para outro (RLS)', async () => {
    const a = await semear(admin)
    const b = await semear(admin)
    const ana = await pessoa(admin, a.esc, 'u-ana')
    const { execucao_id } = await novaExecucao(a.esc, ana)
    const anaDeB = await pessoa(admin, b.esc, 'u-ana')
    await expect(h.motor.obter(anaDeB, execucao_id)).rejects.toMatchObject({ codigo: 'EXECUCAO_INEXISTENTE' })
    const vistas = await comEscritorio(admin, b.esc, (tx) => tx`select count(*)::int as n from execucao where id = ${execucao_id}`)
    expect(vistas[0]!.n).toBe(0)
    // Nem gravar em outro escritório pela transação presa a B.
    await expect(
      comEscritorio(admin, b.esc, (tx) => tx`insert into bolsa_setor (escritorio_id, setor, mes, saldo_centavos) values (${a.esc}, 'contabil', '2030-01', 1)`),
    ).rejects.toThrow(/row-level security/)
  })

  it('pessoa sem o setor não inicia o procedimento; a tentativa fica na trilha', async () => {
    const s = await semear(admin)
    const fiscal = await pessoa(admin, s.esc, 'u-fiscal')
    await expect(novaExecucao(s.esc, fiscal)).rejects.toMatchObject({ codigo: 'NEGADO' })
    const [ev] = await admin`select resultado, texto from evento where escritorio_id = ${s.esc} and resultado = 'negado'`
    expect(ev!.texto).toContain('setor')
    expect(await estados(s.esc)).toHaveLength(0)
  })
})

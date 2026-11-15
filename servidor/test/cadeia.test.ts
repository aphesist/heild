import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { canonizar, geneseDaCadeia, hashDoEvento, bytesToHex, verificarCadeia } from '@heild/dominio'
import { api, banco, entrar, ferramenta } from './ajuda.ts'

/** Cadeia de hash por escritório (Fundações 5.2; STACK 8). */

const app = api()
let adm: string, horizonte: string, membro: string
const verificar = async (token: string) => (await ferramenta(app, token, 'auditoria.verificar_cadeia', {}, { chave: null })).corpo

beforeAll(async () => {
  adm = await entrar(app, { escritorio_id: 'esc-andrade' })
  horizonte = await entrar(app, { escritorio_id: 'esc-horizonte' })
  membro = await entrar(app, { escritorio_id: 'esc-andrade', usuario_id: 'u7' })
})
afterAll(() => app.close())

describe('canonização (pacote de domínio)', () => {
  it('chaves em ordem, sem undefined, igual em qualquer lugar', () => {
    expect(canonizar({ b: 1, a: [true, null, { d: 'x', c: undefined }] })).toBe('{"a":[true,null,{"d":"x"}],"b":1}')
    expect(canonizar({ a: 1, b: 2 })).toBe(canonizar({ b: 2, a: 1 }))
  })

  it('verificar acusa reordenação e adulteração', () => {
    const g = geneseDaCadeia('esc-x')
    const e1 = { id: 'e1', escritorio_id: 'esc-x', seq: 1, criado_em: '2026-11-15T00:00:00.000Z', texto: 'a' }
    const h1 = hashDoEvento(g, e1)
    const e2 = { id: 'e2', escritorio_id: 'esc-x', seq: 2, criado_em: '2026-11-15T00:00:01.000Z', texto: 'b' }
    const h2 = hashDoEvento(h1, e2)
    const cadeia = [
      { ...e1, hash_anterior: bytesToHex(g), hash: bytesToHex(h1) },
      { ...e2, hash_anterior: bytesToHex(h1), hash: bytesToHex(h2) },
    ]
    expect(verificarCadeia('esc-x', cadeia, { seq: 2, hash: bytesToHex(h2) }).ok).toBe(true)
    expect(verificarCadeia('esc-x', [cadeia[1], cadeia[0]]).quebra?.motivo).toBe('seq_fora_de_ordem')
    expect(verificarCadeia('esc-x', [{ ...cadeia[0], texto: 'A' }, cadeia[1]]).quebra).toMatchObject({ seq: 1, motivo: 'hash_nao_confere' })
    // A gênese prende a cadeia ao escritório: a mesma cadeia não verifica em outro.
    expect(verificarCadeia('esc-y', cadeia).ok).toBe(false)
  })
})

describe('na API', () => {
  it('escritas em paralelo no mesmo escritório: seq sem buraco e a cadeia confere', async () => {
    const tarefas = await banco()`select id from tarefa where escritorio_id = 'esc-andrade' and status = 'a_fazer' order by id limit 12`
    const rs = await Promise.all(tarefas.map((t) => ferramenta(app, adm, 'tarefa.atualizar', { tarefa_id: t.id, campos: { prioridade: 'urgente' } })))
    expect(rs.every((r) => r.status === 200)).toBe(true)
    const seqs = (await banco()`select seq from evento where escritorio_id = 'esc-andrade' order by seq`).map((x) => Number(x.seq))
    expect(seqs).toEqual(seqs.map((_, i) => i + 1))
    const v = await verificar(adm)
    expect(v.dados).toMatchObject({ ok: true, eventos: seqs.length, ultimo_seq: seqs.length, fora_da_cadeia: 0 })
  })

  it('verificar a cadeia é de Gestor ou Administrador', async () => {
    const r = await ferramenta(app, membro, 'auditoria.verificar_cadeia', {}, { chave: null })
    expect(r.status).toBe(403)
    expect(r.corpo.codigo).toBe('PAPEL_INSUFICIENTE')
  })

  it('adulterar um evento direto no banco (até como superusuário) é descoberto, só naquele escritório', async () => {
    await ferramenta(app, horizonte, 'tarefa.atualizar', { tarefa_id: (await banco()`select id from tarefa where escritorio_id = 'esc-horizonte' and status = 'a_fazer' limit 1`)[0].id, campos: { prioridade: 'baixa' } })
    const [alvo] = await banco()`select id, seq from evento where escritorio_id = 'esc-andrade' and seq = 3`
    await banco().begin(async (tx) => {
      await tx`alter table evento disable trigger so_insercao`
      await tx`update evento set texto = 'reescrito por fora' where escritorio_id = 'esc-andrade' and id = ${alvo.id}`
      await tx`alter table evento enable trigger so_insercao`
    })
    const v = await verificar(adm)
    expect(v.dados.ok).toBe(false)
    expect(v.dados.quebra).toMatchObject({ seq: 3, evento_id: alvo.id, motivo: 'hash_nao_confere' })
    expect((await verificar(horizonte)).dados.ok).toBe(true)
  })

  it('apagar o último evento também é descoberto (o elo não confere)', async () => {
    const [ultimo] = await banco()`select id from evento where escritorio_id = 'esc-horizonte' order by seq desc limit 1`
    await banco().begin(async (tx) => {
      await tx`alter table evento disable trigger so_insercao`
      await tx`delete from evento where escritorio_id = 'esc-horizonte' and id = ${ultimo.id}`
      await tx`alter table evento enable trigger so_insercao`
    })
    const v = await verificar(horizonte)
    expect(v.dados.ok).toBe(false)
    expect(v.dados.quebra.motivo).toBe('elo_nao_confere')
  })

  it('restaurar a demonstração recomeça a cadeia do escritório do zero e ela volta a conferir', async () => {
    for (const t of [adm, horizonte]) {
      const r = await app.inject({ method: 'POST', url: '/v1/demonstracao/restaurar', headers: { authorization: `Bearer ${t}` } })
      expect(r.statusCode).toBe(200)
      expect((await verificar(t)).dados).toMatchObject({ ok: true, eventos: 0 })
    }
  })
})

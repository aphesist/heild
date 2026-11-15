import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { api, banco, chave, contarEventos, entrar, ferramenta, operacao } from './ajuda.ts'

const app = api()
let adm: string
/** Tarefa nova, a fazer, criada pela própria API (os testes não dependem do que sobrou na semente). */
const tarefaAberta = async () => {
  const r = await ferramenta(app, adm, 'tarefa.criar', { setor_id: 'fiscal', atividade_id: 'FIS-001', titulo: 'Tarefa de teste' })
  if (r.status !== 200) throw new Error(JSON.stringify(r.corpo))
  return r.corpo.linhas.tarefa[0].id as string
}

beforeAll(async () => {
  adm = await entrar(app, { escritorio_id: 'esc-horizonte' })
})
afterAll(() => app.close())

describe('idempotência obrigatória', () => {
  it('escrita sem Idempotency-Key é recusada antes de qualquer efeito', async () => {
    const r = await ferramenta(app, adm, 'tarefa.iniciar', { tarefa_id: await tarefaAberta() }, { chave: null })
    expect(r.status).toBe(400)
    expect(r.corpo).toMatchObject({ codigo: 'FALTA_CHAVE_IDEMPOTENCIA', campo: 'Idempotency-Key' })
  })

  it('mesma chave e mesmos argumentos: a mesma resposta, um efeito e um evento só', async () => {
    const id = await tarefaAberta()
    const k = chave('rep')
    const antes = await contarEventos('esc-horizonte')
    const a = await ferramenta(app, adm, 'tarefa.iniciar', { tarefa_id: id }, { chave: k })
    const b = await ferramenta(app, adm, 'tarefa.iniciar', { tarefa_id: id }, { chave: k })
    expect(a.status).toBe(200)
    expect(b.status).toBe(200)
    expect(b.cabecalhos['idempotent-replayed']).toBe('true')
    expect(b.corpo).toEqual(a.corpo)
    expect(await contarEventos('esc-horizonte')).toBe(antes + 1)
  })

  it('mesma chave com outros argumentos: 409 CHAVE_REUSADA, sem efeito', async () => {
    const k = chave('reuso')
    const t1 = { id: await tarefaAberta() }
    const t2 = { id: await tarefaAberta() }
    expect((await ferramenta(app, adm, 'tarefa.enviar_revisao', { tarefa_id: t1.id }, { chave: k })).status).toBe(200)
    const r = await ferramenta(app, adm, 'tarefa.enviar_revisao', { tarefa_id: t2.id }, { chave: k })
    expect(r.status).toBe(409)
    expect(r.corpo.codigo).toBe('CHAVE_REUSADA')
    const [t] = await banco()`select status from tarefa where escritorio_id = 'esc-horizonte' and id = ${t2.id}`
    expect(t.status).toBe('a_fazer')
  })

  it('pedidos simultâneos com a mesma chave: um efeito só, todos com a mesma resposta', async () => {
    const id = await tarefaAberta()
    const k = chave('simultaneo')
    const antes = await contarEventos('esc-horizonte')
    const rs = await Promise.all(Array.from({ length: 6 }, () => ferramenta(app, adm, 'tarefa.aguardar_cliente', { tarefa_id: id }, { chave: k })))
    expect(rs.every((r) => r.status === 200)).toBe(true)
    // O conteúdo é o mesmo (a resposta guardada volta do jsonb, que pode trocar a ordem das chaves).
    for (const r of rs) expect(r.corpo).toEqual(rs[0].corpo)
    expect(rs.filter((r) => r.cabecalhos['idempotent-replayed'] === 'true').length).toBe(5)
    expect(await contarEventos('esc-horizonte')).toBe(antes + 1)
  })

  it('pedido que falhou não gasta a chave: corrigido, a mesma chave executa', async () => {
    const k = chave('falha')
    const id = await tarefaAberta()
    const ruim = await ferramenta(app, adm, 'tarefa.cancelar', { tarefa_id: 'tk-nao-existe', motivo: 'duplicada' }, { chave: k })
    expect(ruim.status).toBe(422)
    expect(ruim.corpo.codigo).toBe('NAO_ENCONTRADO')
    const bom = await ferramenta(app, adm, 'tarefa.cancelar', { tarefa_id: id, motivo: 'duplicada' }, { chave: k })
    expect(bom.status).toBe(200)
  })

  it('validar_apenas não precisa de chave, não grava e não gera evento', async () => {
    const id = await tarefaAberta()
    const antes = await contarEventos('esc-horizonte')
    const r = await ferramenta(app, adm, 'tarefa.concluir', { tarefa_id: id, validar_apenas: true }, { chave: null })
    expect(r.corpo).toEqual({ resultado: 'validado', erros: [], previa: { tarefa: 1, evento: 1 } })
    const [t] = await banco()`select status from tarefa where escritorio_id = 'esc-horizonte' and id = ${id}`
    expect(t.status).toBe('a_fazer')
    expect(await contarEventos('esc-horizonte')).toBe(antes)
    const erro = await ferramenta(app, adm, 'tarefa.cancelar', { tarefa_id: id, motivo: 'x', validar_apenas: true }, { chave: null })
    expect(erro.corpo.resultado).toBe('erro')
    expect(erro.corpo.codigo).toBe('ENTRADA_INVALIDA')
    expect(erro.corpo.campo).toBe('motivo')
  })

  it('a tela manda os ids que gerou: a linha gravada fica com o mesmo id; repetir o id não sobrescreve', async () => {
    const dados = { setor_id: 'fiscal', atividade_id: 'FIS-001', titulo: 'Conferir guia' }
    const ids = [{ p: 'tk', id: 'tk-da-tela-1' }, { p: 'ev', id: 'ev-da-tela-1' }]
    // A tela manda os ids no envelope da ferramenta tipada (heild_tela), fora do esquema dela.
    const r = await ferramenta(app, adm, 'tarefa.criar', dados, { tela: { ids } })
    expect(r.status).toBe(200)
    expect(r.corpo.linhas.tarefa[0].id).toBe('tk-da-tela-1')
    expect(r.corpo.linhas.evento[0].id).toBe('ev-da-tela-1')
    const de_novo = await ferramenta(app, adm, 'tarefa.criar', { ...dados, titulo: 'Outra' }, { tela: { ids: [{ p: 'tk', id: 'tk-da-tela-1' }] } })
    expect(de_novo.status).toBe(409)
    expect(de_novo.corpo.codigo).toBe('ID_EM_USO')
    const [t] = await banco()`select titulo from tarefa where escritorio_id = 'esc-horizonte' and id = 'tk-da-tela-1'`
    expect(t.titulo).toBe('Conferir guia')
  })
})

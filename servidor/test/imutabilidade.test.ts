import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { api, banco, entrar, ferramenta, operacao } from './ajuda.ts'

/** Nada se apaga sozinho; mensagem interna nunca se apaga; decisão humana com autor e data. */

const app = api()
let adm: string, joao: string, rafael: string

beforeAll(async () => {
  adm = await entrar(app, { escritorio_id: 'esc-andrade' })
  joao = await entrar(app, { escritorio_id: 'esc-andrade', usuario_id: 'u2' })
  rafael = await entrar(app, { escritorio_id: 'esc-andrade', usuario_id: 'u7' })
})
afterAll(() => app.close())

describe('mensagem interna', () => {
  it('nunca se apaga, nem pelo Administrador', async () => {
    const r = await operacao(app, adm, { tipo: 'operacao', operacao: 'mensagensInternas.excluir', argumentos: ['mn-semente-2'] })
    expect(r.status).toBe(422)
    expect(r.corpo.codigo).toBe('EXCLUSAO_PROIBIDA')
    const linhas = await operacao(app, adm, { tipo: 'linhas', gravar: [], remover: [{ tabela: 'mensagem_interna', id: 'mn-semente-2' }] })
    expect(linhas.corpo.codigo).toBe('EXCLUSAO_PROIBIDA')
    const [n] = await banco()`select count(*)::int as n from mensagem_interna where escritorio_id = 'esc-andrade' and id = 'mn-semente-2'`
    expect(n.n).toBe(1)
  })

  it('só o autor edita; a versão anterior fica com autor e data', async () => {
    const outro = await ferramenta(app, joao, 'mensagem_interna.editar', { mensagem_id: 'mn-semente-2', corpo: 'texto trocado' })
    expect(outro.status).toBe(422)
    expect(outro.corpo.codigo).toBe('SO_AUTOR_EDITA')
    const [antes] = await banco()`select corpo from mensagem_interna where escritorio_id = 'esc-andrade' and id = 'mn-semente-2'`
    const autor = await ferramenta(app, rafael, 'mensagem_interna.editar', { mensagem_id: 'mn-semente-2', corpo: 'texto corrigido pelo autor' })
    expect(autor.status).toBe(200)
    const m = autor.corpo.linhas.mensagem_interna[0]
    expect(m.corpo).toBe('texto corrigido pelo autor')
    expect(m.versoes.at(-1)).toMatchObject({ corpo: antes.corpo, por: 'u7' })
    expect(m.versoes.at(-1).ate).toBeTruthy()
    expect(m.editada_em).toBeTruthy()
  })

  it('desfazer (reverter) não existe para mensagem interna nem evento vindo de fora', async () => {
    const r = await operacao(app, adm, { tipo: 'operacao', operacao: 'mensagensInternas.reverter', argumentos: [{ id: 'mn-semente-2' }] })
    expect(r.status).toBe(404)
    expect(r.corpo.codigo).toBe('OPERACAO_DESCONHECIDA')
  })
})

describe('nada se apaga sozinho', () => {
  it('tarefa, cliente e evento não se apagam pela API', async () => {
    const [t] = await banco()`select id from tarefa where escritorio_id = 'esc-andrade' limit 1`
    for (const [operacaoNome, id] of [['tarefas.excluir', t.id], ['clientes.excluir', 'c1']]) {
      const r = await operacao(app, adm, { tipo: 'operacao', operacao: operacaoNome, argumentos: [id] })
      expect(r.corpo.codigo, operacaoNome).toBe('EXCLUSAO_PROIBIDA')
    }
    const ev = await operacao(app, adm, { tipo: 'linhas', gravar: [], remover: [{ tabela: 'evento', id: 'qualquer' }] })
    expect(ev.corpo.codigo).toBe('EXCLUSAO_PROIBIDA')
  })

  it('evento é imutável: regravar um evento existente é recusado', async () => {
    const criado = await ferramenta(app, adm, 'tarefa.atualizar', { tarefa_id: (await banco()`select id from tarefa where escritorio_id = 'esc-andrade' and status = 'a_fazer' limit 1`)[0].id, campos: { prioridade: 'alta' } })
    expect(criado.status).toBe(200)
    const evId = criado.corpo.evento_id
    const r = await operacao(app, adm, { tipo: 'linhas', gravar: [{ tabela: 'evento', linha: { id: evId, nome: 'tarefa.concluir', ferramenta: 'evento.listar', texto: 'reescrito' } }], remover: [] })
    expect(r.status).toBe(422)
    expect(r.corpo.codigo).toBe('IMUTAVEL')
  })

  it('no banco: delete de entidade central e update de evento são recusados mesmo para a API', async () => {
    const tentar = (q: (tx: any) => Promise<unknown>) =>
      banco().begin(async (tx) => {
        await tx`select set_config('request.jwt.claims', ${JSON.stringify({ app_metadata: { escritorio_id: 'esc-andrade' } })}, true), set_config('role', 'api_executor', true)`
        await q(tx)
      })
    await expect(tentar((tx) => tx`delete from cliente where id = 'c1'`)).rejects.toThrow(/não se apaga/)
    // mensagem_interna nem tem política de delete: a RLS não deixa a linha aparecer para o delete.
    await tentar((tx) => tx`delete from mensagem_interna where id = 'mn-semente-0'`)
    expect((await banco()`select count(*)::int as n from mensagem_interna where escritorio_id = 'esc-andrade' and id = 'mn-semente-0'`)[0].n).toBe(1)
    // evento não tem política de update (nada aparece para o update) e, por baixo, o gatilho recusa.
    await tentar((tx) => tx`update evento set texto = 'x'`)
    expect((await banco()`select count(*)::int as n from evento where texto = 'x'`)[0].n).toBe(0)
    await expect(banco()`update evento set texto = 'x' where escritorio_id = 'esc-andrade'`).rejects.toThrow(/imutável/)
  })

  it('status não muda por tarefa.atualizar: só pela ferramenta da transição', async () => {
    const [t] = await banco()`select id from tarefa where escritorio_id = 'esc-andrade' and status = 'a_fazer' limit 1`
    const r = await ferramenta(app, adm, 'tarefa.atualizar', { tarefa_id: t.id, campos: { status: 'concluida' } })
    expect(r.status).toBe(400)
    expect(r.corpo.codigo).toBe('ENTRADA_INVALIDA')
  })
})

describe('decisão humana com autor e data', () => {
  it('integrante não decide cartão', async () => {
    const r = await ferramenta(app, adm, 'aprovacao.decidir', { cartao_id: 'ca-lt1', decisao: 'aprovado' }, { integrante: 'i-bpo' })
    expect(r.status).toBe(422)
    expect(r.corpo.codigo).toBe('SO_PESSOA_DECIDE')
  })

  it('pessoa decide uma vez, com autor e data; a segunda decisão é recusada', async () => {
    const r = await ferramenta(app, adm, 'aprovacao.decidir', { cartao_id: 'ca-lt2', decisao: 'recusado', comentario: 'valor errado' })
    expect(r.status).toBe(200)
    const c = r.corpo.linhas.cartao_aprovacao[0]
    expect(c).toMatchObject({ status: 'recusado', decidido_por: 'u1', comentario: 'valor errado' })
    expect(Date.parse(c.decidido_em)).toBeGreaterThan(Date.now() - 60_000)
    const de_novo = await ferramenta(app, adm, 'aprovacao.decidir', { cartao_id: 'ca-lt2', decisao: 'aprovado' })
    expect(de_novo.status).toBe(422)
    expect(de_novo.corpo.codigo).toBe('JA_DECIDIDO')
  })

  it('no banco: cartão decidido não troca de decisão', async () => {
    await expect(banco()`update cartao_aprovacao set status = 'aprovado', decidido_por = 'u2' where escritorio_id = 'esc-andrade' and id = 'ca-lt2'`).rejects.toThrow(/já foi decidido/)
  })
})

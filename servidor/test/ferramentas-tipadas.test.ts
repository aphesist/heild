import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { ENTIDADES_F1, ferramentaTipada, ferramentasTipadas, traduzirOperacao } from '@heild/dominio'
import { api, banco, chave, entrar, ferramenta, operacao } from './ajuda.ts'

/**
 * Repositórios do frontend como clientes das ferramentas tipadas (B5; ARQUITETURA 6.2):
 * a operação genérica das tabelas da F1 só entra pela ferramenta tipada, `x.atualizar`
 * aceita só campos editáveis e o tradutor leva a chamada da tela até a ferramenta.
 */

const app = api()
let adm: string, rafael: string
let tarefa: string

beforeAll(async () => {
  adm = await entrar(app, { escritorio_id: 'esc-andrade', usuario_id: 'u1' })
  rafael = await entrar(app, { escritorio_id: 'esc-andrade', usuario_id: 'u7' })
  const [t] = await banco()`select id from tarefa where escritorio_id = 'esc-andrade' and setor_id = 'fiscal' and status = 'a_fazer' order by id limit 1`
  tarefa = t.id
})
afterAll(() => app.close())

describe('o patch livre acabou', () => {
  it('/v1/operacoes recusa a operação genérica da F1 e diz a ferramenta (acao_sugerida)', async () => {
    const r = await operacao(app, adm, { tipo: 'operacao', operacao: 'tarefas.atualizar', argumentos: [tarefa, { titulo: 'Pelo patch' }] })
    expect(r.status).toBe(400)
    expect(r.corpo.codigo).toBe('USE_FERRAMENTA_TIPADA')
    expect(r.corpo.acao_sugerida).toEqual({ ferramenta: 'tarefa.atualizar', entrada: { tarefa_id: tarefa, campos: { titulo: 'Pelo patch' } } })
  })

  it('status não muda por tarefa.atualizar: 400 com o nome do campo', async () => {
    const r = await ferramenta(app, adm, 'tarefa.atualizar', { tarefa_id: tarefa, campos: { status: 'concluida' } })
    expect(r.status).toBe(400)
    expect(r.corpo.codigo).toBe('ENTRADA_INVALIDA')
    expect(JSON.stringify(r.corpo.detalhes)).toContain('status')
    const [t] = await banco()`select status from tarefa where escritorio_id = 'esc-andrade' and id = ${tarefa}`
    expect(t.status).toBe('a_fazer')
  })

  it('nem pela escrita direta de linhas', async () => {
    const r = await operacao(app, adm, { tipo: 'linhas', gravar: [{ tabela: 'tarefa', linha: { id: tarefa, status: 'concluida' } }], remover: [] })
    expect(r.status).toBe(400)
    expect(r.corpo.codigo).toBe('USE_FERRAMENTA_TIPADA')
    expect(r.corpo.campo).toBe('tarefa.status')
    // Campo editável pela linha continua (é o que a loja e o motor da demonstração gravam).
    const ok = await operacao(app, adm, { tipo: 'linhas', gravar: [{ tabela: 'tarefa', linha: { id: tarefa, extras: { pela_linha: true } } }], remover: [] })
    expect(ok.status).toBe(200)
  })

  it('setor e responsável também não: reatribuir é ferramenta própria (gestão do setor)', async () => {
    expect((await ferramenta(app, adm, 'tarefa.atualizar', { tarefa_id: tarefa, campos: { setor_id: 'dp' } })).status).toBe(400)
    expect((await ferramenta(app, adm, 'tarefa.atualizar', { tarefa_id: tarefa, campos: { responsavel_id: 'u3' } })).status).toBe(400)
  })
})

describe('ferramentas de entidade da F1', () => {
  it('toda tabela da F1 tem as ferramentas declaradas, e toda ferramenta gerada é estrita e aponta para um repositório', () => {
    for (const e of ENTIDADES_F1) {
      if (e.criar && !e.manuais?.criar) expect(ferramentaTipada(`${e.nome}.criar`)?.tipo).toBe('escrita')
      if (e.editaveis && !e.manuais?.atualizar) expect(ferramentaTipada(`${e.nome}.atualizar`)?.tipo).toBe('escrita')
      if (e.excluir) expect(ferramentaTipada(`${e.nome}.excluir`)).toBeDefined()
    }
    expect(ferramentasTipadas.length).toBeGreaterThan(70)
  })

  it('criar com o id que a tela gerou e a frase do evento (envelope heild_tela)', async () => {
    const id = `pe-tela-${Date.now().toString(36)}`
    const r = await app.inject({
      method: 'POST',
      url: '/v1/ferramentas/pessoa.criar',
      headers: { authorization: `Bearer ${adm}`, 'idempotency-key': chave('pessoa') },
      payload: { nome: 'Maria da Tela', tipo: 'cliente', heild_tela: { ids: [{ p: 'pe', id }], texto: 'Fernanda cadastrou Maria pela tela' } },
    })
    expect(r.statusCode).toBe(200)
    expect(r.json().linhas.pessoa[0].id).toBe(id)
    expect(r.json().linhas.evento[0].texto).toBe('Fernanda cadastrou Maria pela tela')
    expect(r.json().linhas.evento[0].ator_id).toBe('u1')
  })

  it('a regra do repositório continua mandando: Membro não mexe na configuração do setor', async () => {
    const r = await ferramenta(app, rafael, 'setor.atualizar', { setor_id: 'fiscal', campos: { nome_exibido: 'Fiscal do Rafael' } })
    expect(r.status).toBe(403)
    const ok = await ferramenta(app, adm, 'setor.atualizar', { setor_id: 'fiscal', campos: { nome_exibido: 'Fiscal' } })
    expect(ok.status).toBe(200)
  })

  it('exclusão só onde a regra deixa: vínculo sai; tarefa não tem excluir', async () => {
    const [v] = await banco()`select id from vinculo_setor where escritorio_id = 'esc-andrade' and usuario_id = 'u9' order by id limit 1`
    const r = await ferramenta(app, adm, 'vinculo_setor.excluir', { vinculo_id: v.id })
    expect(r.status).toBe(200)
    expect(r.corpo.removidas.vinculo_setor).toEqual([v.id])
    expect(ferramentaTipada('tarefa.excluir')).toBeUndefined()
  })
})

describe('o tradutor (a chamada da tela vira a ferramenta)', () => {
  const obter = (t: string, id: string) => (t === 'tarefa' && id === 'tk1' ? ({ id: 'tk1', status: 'concluida', titulo: 'Novo', extras: {} } as never) : undefined)

  it('transições, cancelamento e mover no quadro', () => {
    expect(traduzirOperacao('tarefas.mudarStatus', ['tk1', 'concluida'])).toEqual([{ ferramenta: 'tarefa.concluir', entrada: { tarefa_id: 'tk1' } }])
    expect(traduzirOperacao('tarefas.mudarStatus', ['tk1', 'cancelada', { motivo: 'duplicada' }])).toEqual([{ ferramenta: 'tarefa.cancelar', entrada: { tarefa_id: 'tk1', motivo: 'duplicada' } }])
    expect(traduzirOperacao('tarefas.mover', ['tk1', 'status', 'em_revisao', 2])).toEqual([{ ferramenta: 'tarefa.enviar_revisao', entrada: { tarefa_id: 'tk1' } }])
  })

  it('atualizar tira o que é do servidor e mantém a frase', () => {
    expect(traduzirOperacao('tarefas.atualizar', ['tk1', { titulo: 'X', atualizado_em: 'agora', versao_linha: 3 }, { texto: 'mudou o título' }])).toEqual([
      { ferramenta: 'tarefa.atualizar', entrada: { tarefa_id: 'tk1', campos: { titulo: 'X' } }, texto: 'mudou o título' },
    ])
    expect(traduzirOperacao('clientes.atualizar', ['c1', { estado_ciclo: 'ativo', estado_ciclo_desde: '2026-11-18' }])).toEqual([{ ferramenta: 'cliente.mudar_estado', entrada: { cliente_id: 'c1', estado_ciclo: 'ativo' } }])
  })

  it('desfazer é a operação inversa: o editável volta por atualizar, o status pela transição', () => {
    const r = traduzirOperacao('tarefas.reverter', [{ id: 'tk1', status: 'em_andamento', titulo: 'Antigo', extras: {} }], obter)
    expect(r).toEqual([
      { ferramenta: 'tarefa.iniciar', entrada: { tarefa_id: 'tk1' } },
      { ferramenta: 'tarefa.atualizar', entrada: { tarefa_id: 'tk1', campos: { titulo: 'Antigo' } }, texto: 'Desfez a última mudança' },
    ])
  })

  it('a mensagem interna criada pela tela vira enviar (o autor é o do token)', () => {
    expect(traduzirOperacao('mensagensInternas.criar', [{ conversa_interna_id: 'ci1', autor_id: 'outra', corpo: 'oi', versoes: [], extras: { sistema: true } }])).toEqual([
      { ferramenta: 'mensagem_interna.enviar', entrada: { conversa_interna_id: 'ci1', corpo: 'oi', extras: { sistema: true } } },
    ])
  })

  it('o que não é da F1 segue por /v1/operacoes', () => {
    expect(traduzirOperacao('bpo.lotes.aprovar', ['l1'])).toBeNull()
    expect(traduzirOperacao('sessoes.atualizar', ['s1', { rotulo: 'x' }])).toBeNull()
  })

  it('pela API, a tradução de uma chamada de tela funciona de ponta a ponta', async () => {
    const [t] = traduzirOperacao('tarefas.atualizar', [tarefa, { checklist: [{ item: 'Conferir guia', feito: true }], extras: { da_tela: 1 } }])!
    const r = await ferramenta(app, rafael, t.ferramenta, t.entrada)
    expect(r.status).toBe(200)
    expect(r.corpo.linhas.tarefa[0].checklist).toEqual([{ item: 'Conferir guia', feito: true }])
  })
})

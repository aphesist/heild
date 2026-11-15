import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { comColetorDeJobs, pedirJob } from '@heild/dominio'
import { api, banco, entrar, ferramenta, operacao } from './ajuda.ts'
import { operacoes } from '../src/executor/operacoes.ts'
import { enfileirarNaTransacao } from '../src/executor/jobs.ts'

/** As duas formas de chamar (ferramentas tipadas e operações), a leitura paginada e a sincronização. */

const app = api()
let adm: string, rafael: string

beforeAll(async () => {
  adm = await entrar(app, { escritorio_id: 'esc-andrade' })
  rafael = await entrar(app, { escritorio_id: 'esc-andrade', usuario_id: 'u7' })
})
afterAll(() => app.close())

describe('leitura paginada', () => {
  it('cursor percorre tudo sem repetir, e o total bate', async () => {
    const vistos = new Set<string>()
    let cursor: string | undefined
    let total = 0
    for (let i = 0; i < 50; i++) {
      const r = await ferramenta(app, adm, 'tarefa.listar', { limite: 20, ...(cursor ? { cursor } : {}) }, { chave: null })
      expect(r.status).toBe(200)
      total = r.corpo.pagina.total
      for (const t of r.corpo.dados.linhas) {
        expect(vistos.has(t.id)).toBe(false)
        vistos.add(t.id)
      }
      cursor = r.corpo.pagina.cursor ?? undefined
      if (!r.corpo.pagina.ha_mais) break
    }
    expect(vistos.size).toBe(total)
    expect(total).toBeGreaterThan(40)
  })

  it('cursor de outra consulta é recusado (CURSOR_INVALIDO)', async () => {
    const r = await ferramenta(app, adm, 'tarefa.listar', { limite: 5 }, { chave: null })
    const outro = await ferramenta(app, adm, 'tarefa.listar', { limite: 5, setor_id: 'dp', cursor: r.corpo.pagina.cursor }, { chave: null })
    expect(outro.status).toBe(400)
    expect(outro.corpo.codigo).toBe('CURSOR_INVALIDO')
  })

  it('visão compacta traz só os campos do agente; a de tela traz a linha inteira', async () => {
    const c = await ferramenta(app, adm, 'tarefa.listar', { limite: 1 }, { chave: null })
    const t = await ferramenta(app, adm, 'tarefa.listar', { limite: 1, visao: 'tela' }, { chave: null })
    expect(Object.keys(c.corpo.dados.linhas[0]).sort()).toEqual(['cliente_id', 'id', 'prazo_interno', 'prazo_legal', 'prioridade', 'responsavel_id', 'setor_id', 'status', 'titulo'])
    expect(t.corpo.dados.linhas[0]).toHaveProperty('checklist')
  })

  it('esquema estrito: campo desconhecido é erro com o nome do campo', async () => {
    const r = await ferramenta(app, adm, 'tarefa.listar', { setor: 'fiscal' }, { chave: null })
    expect(r.status).toBe(400)
    expect(r.corpo.codigo).toBe('ENTRADA_INVALIDA')
    expect(r.corpo.mensagem).toMatch(/setor/)
  })
})

describe('sincronização por versão', () => {
  it('desde uma versão, vem só o que mudou (e o que foi excluído)', async () => {
    const tudo = await app.inject({ method: 'GET', url: '/v1/sincronizar', headers: { authorization: `Bearer ${adm}` } })
    const versao = tudo.json().versao as number
    const [t] = await banco()`select id from tarefa where escritorio_id = 'esc-andrade' and status = 'a_fazer' order by id limit 1`
    await ferramenta(app, adm, 'tarefa.atualizar', { tarefa_id: t.id, campos: { titulo: 'Título mudado para o delta' } })
    // Convite pode ser excluído de vez (exclusao: 'definitiva'): a exclusão aparece no delta.
    const [cv] = await banco()`select id from convite where escritorio_id = 'esc-andrade' order by id limit 1`
    if (cv) expect((await operacao(app, adm, { tipo: 'operacao', operacao: 'convites.excluir', argumentos: [cv.id] })).status).toBe(200)
    const delta = (await app.inject({ method: 'GET', url: `/v1/sincronizar?desde=${versao}`, headers: { authorization: `Bearer ${adm}` } })).json()
    expect(delta.tabelas.tarefa.map((x: { id: string }) => x.id)).toEqual([t.id])
    expect(delta.tabelas.cliente).toEqual([])
    expect(delta.tabelas.evento.length).toBeGreaterThan(0)
    if (cv) expect(delta.removidas).toContainEqual({ tabela: 'convite', id: cv.id })
    expect(delta.versao).toBeGreaterThan(versao)
  })
})

describe('escrita direta da tela (linhas)', () => {
  it('evento escrito pela tela é regravado com o ator do token, não com o da linha', async () => {
    const r = await operacao(app, rafael, { tipo: 'linhas', gravar: [{ tabela: 'evento', linha: { id: 'ev-tela-1', nome: 'atividade.registrar', ferramenta: 'evento.listar', texto: 'Começou: conferir PGDAS-D', ator_tipo: 'sistema', ator_nome: 'Outra pessoa', ator_id: 'u1', resultado: 'aprovado' } }], remover: [] })
    expect(r.status).toBe(200)
    expect(r.corpo.linhas.evento[0]).toMatchObject({ id: 'ev-tela-1', ator_tipo: 'pessoa', ator_id: 'u7', ator_nome: 'Rafael Nunes', resultado: 'ok', texto: 'Começou: conferir PGDAS-D' })
  })

  it('linha sem evento: a regra da tabela autoriza e o servidor grava o evento (R2)', async () => {
    const [cli] = await banco()`select id, nome from cliente where escritorio_id = 'esc-andrade' order by id limit 1`
    const membro = await operacao(app, rafael, { tipo: 'linhas', gravar: [{ tabela: 'cliente', linha: { id: cli.id, nome: 'Nome pela linha' } }], remover: [] })
    // cliente.atualizar é transversal: o Membro pode; o evento sai do servidor.
    expect(membro.status).toBe(200)
    expect(membro.corpo.linhas.cliente[0].nome).toBe('Nome pela linha')
    expect(membro.corpo.linhas.evento[0]).toMatchObject({ nome: 'cliente.atualizar', ferramenta: 'cliente.atualizar', ator_id: 'u7', visivel_na_linha_do_tempo: false })
    // excecao_tela é só do Administrador.
    const negado = await operacao(app, rafael, { tipo: 'linhas', gravar: [{ tabela: 'excecao_tela', linha: { id: 'x-linha', usuario_id: 'u7', tela_ou_ferramenta: 'aba.fiscal', efeito: 'liberar', motivo: 'eu mesmo', vigente_de: '2026-11-01' } }], remover: [] })
    expect(negado.status).toBe(403)
    expect(negado.corpo.codigo).toBe('PAPEL_INSUFICIENTE')
  })

  it('tabela sem repositório e campo inexistente são recusados', async () => {
    const sem = await operacao(app, adm, { tipo: 'linhas', gravar: [{ tabela: 'idempotencia', linha: { id: 'x' } }], remover: [] })
    expect(sem.corpo.codigo).toBe('TABELA_SEM_REGRA')
    const [cli] = await banco()`select id from cliente where escritorio_id = 'esc-andrade' order by id limit 1`
    const campo = await operacao(app, adm, { tipo: 'linhas', gravar: [{ tabela: 'cliente', linha: { id: cli.id, campo_que_nao_existe: 1 } }], remover: [] })
    expect(campo.status).toBe(400)
    expect(campo.corpo).toMatchObject({ codigo: 'ENTRADA_INVALIDA', campo: 'cliente.campo_que_nao_existe' })
  })
})

describe('registro das operações e encaixe da fila', () => {
  it('as operações saem dos repositórios, sem os métodos que só leem', () => {
    expect(operacoes.has('tarefas.mudarStatus')).toBe(true)
    expect(operacoes.has('bpo.lotes.aprovar')).toBe(true)
    for (const nome of operacoes.keys()) expect(nome).not.toMatch(/\.(listar|obter|pode|exigir|validar|autorizar|evento|faixas|vigente|proposta)$/)
  })

  it('um job pedido por um efeito sem fila instalada derruba a transação inteira (nunca some em silêncio)', async () => {
    const pedidos: unknown[] = []
    comColetorDeJobs((j) => pedidos.push(j), () => pedirJob({ fila: 'coletor.dfe', dados: { cliente_id: 'c1' }, singleton: 'c1:2026-10' }))
    expect(pedidos).toEqual([{ fila: 'coletor.dfe', dados: { cliente_id: 'c1' }, singleton: 'c1:2026-10' }])
    await expect(enfileirarNaTransacao(null as never, pedidos as never)).rejects.toThrow(/fila não está ligada/)
    await expect(enfileirarNaTransacao(null as never, [])).resolves.toBeUndefined()
  })
})

describe('limites e cabeçalhos', () => {
  it('toda resposta leva o id do pedido e os cabeçalhos de segurança', async () => {
    const r = await app.inject({ method: 'GET', url: '/v1/saude' })
    expect(r.headers['x-request-id']).toMatch(/^rq/)
    expect(r.headers['x-content-type-options']).toBe('nosniff')
    expect(r.headers['cache-control']).toBe('no-store')
  })

  it('limite de taxa por ator: estourou, 429 LIMITE_TAXA com quando tentar de novo', async () => {
    const { consumir } = await import('../src/limites.ts')
    const limite = { porMinuto: 3 }
    expect([consumir('t:x', limite, 0), consumir('t:x', limite, 1), consumir('t:x', limite, 2)]).toEqual([null, null, null])
    expect(consumir('t:x', limite, 3)).toBe(new Date(60_000).toISOString())
    expect(consumir('t:x', limite, 60_001)).toBeNull()
  })
})

import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { autorizar, contaParaTela, perfilDeConta } from '@heild/dominio'
import { api, banco, contarEventos, entrar, ferramenta, operacao } from './ajuda.ts'

/**
 * Autorização por setor, carteira, papel e exceção por tela, na API, com a MESMA função
 * `autorizar` do frontend. Contas da semente (esc-andrade): u1 Fernanda (Administradora),
 * u2 João (Gestor do Contábil, executa no Fiscal), u3 Ana (Membro do DP), u7 Rafael
 * (Membro do Fiscal e Notas).
 */

const app = api()
let adm: string, joao: string, ana: string, rafael: string
const tarefaDo = async (setor: string, origem = 'pessoa') => {
  const [t] = await banco()`select id from tarefa where escritorio_id = 'esc-andrade' and setor_id = ${setor} and origem = ${origem} and status not in ('concluida','cancelada') order by id limit 1`
  return t.id as string
}

beforeAll(async () => {
  adm = await entrar(app, { escritorio_id: 'esc-andrade' })
  joao = await entrar(app, { escritorio_id: 'esc-andrade', usuario_id: 'u2' })
  ana = await entrar(app, { escritorio_id: 'esc-andrade', usuario_id: 'u3' })
  rafael = await entrar(app, { escritorio_id: 'esc-andrade', usuario_id: 'u7' })
})
afterAll(() => app.close())

describe('setor', () => {
  it('Membro sem vínculo no setor não conclui tarefa dele (SEM_SETOR) e a negação vira evento', async () => {
    const id = await tarefaDo('fiscal')
    const antes = await contarEventos('esc-andrade')
    const r = await ferramenta(app, ana, 'tarefa.concluir', { tarefa_id: id })
    expect(r.status).toBe(403)
    expect(r.corpo).toMatchObject({ resultado: 'negado', codigo: 'SEM_SETOR', mensagem: 'Sua conta não tem esse setor.' })
    expect(r.corpo.evento_id).toBeTruthy()
    expect(await contarEventos('esc-andrade')).toBe(antes + 1)
    const [ev] = await banco()`select resultado, ferramenta, ator_id, visivel_na_linha_do_tempo from evento where id = ${r.corpo.evento_id}`
    expect(ev).toMatchObject({ resultado: 'negado', ferramenta: 'tarefa.concluir', ator_id: 'u3', visivel_na_linha_do_tempo: false })
    const [t] = await banco()`select status from tarefa where escritorio_id = 'esc-andrade' and id = ${id}`
    expect(t.status).not.toBe('concluida')
  })

  it('Membro com vínculo no setor conclui', async () => {
    const id = await tarefaDo('fiscal')
    const r = await ferramenta(app, rafael, 'tarefa.concluir', { tarefa_id: id })
    expect(r.status).toBe(200)
    expect(r.corpo.linhas.tarefa[0]).toMatchObject({ id, status: 'concluida', concluida_por_id: 'u7', concluida_por_tipo: 'usuario' })
    expect(r.corpo.linhas.evento[0]).toMatchObject({ nome: 'tarefa.concluir', ferramenta: 'tarefa.concluir', ator_id: 'u7', resultado: 'ok' })
  })

  it('a lista só traz as tarefas dos setores da conta', async () => {
    const r = await ferramenta(app, rafael, 'tarefa.listar', { visao: 'compacta', limite: 20 }, { chave: null })
    expect(r.status).toBe(200)
    const setores = new Set(r.corpo.dados.linhas.map((t: { setor_id: string }) => t.setor_id))
    expect([...setores].every((s) => s === 'fiscal' || s === 'notas')).toBe(true)
    const [{ n }] = await banco()`select count(*)::int as n from tarefa where escritorio_id = 'esc-andrade' and setor_id in ('fiscal','notas') and arquivado_em is null`
    expect(r.corpo.pagina.total).toBe(n)
  })
})

describe('papel e gestão', () => {
  it('tarefa de obrigação: Membro não cancela, Gestor de outro setor não cancela, Administrador cancela', async () => {
    const id = await tarefaDo('fiscal', 'obrigacao')
    const membro = await ferramenta(app, rafael, 'tarefa.cancelar', { tarefa_id: id, motivo: 'cliente encerrou' })
    expect(membro.status).toBe(403)
    expect(membro.corpo.codigo).toBe('PAPEL_INSUFICIENTE')
    // João é Gestor, mas no Fiscal só executa: falta o modo gestão.
    const gestor = await ferramenta(app, joao, 'tarefa.cancelar', { tarefa_id: id, motivo: 'cliente encerrou' })
    expect(gestor.status).toBe(403)
    expect(gestor.corpo.codigo).toBe('EXIGE_GESTAO')
    const a = await ferramenta(app, adm, 'tarefa.cancelar', { tarefa_id: id, motivo: 'cliente encerrou' })
    expect(a.status).toBe(200)
    expect(a.corpo.linhas.tarefa[0]).toMatchObject({ status: 'cancelada', cancelada_motivo: 'cliente encerrou' })
    expect(a.corpo.linhas.evento[0].ferramenta).toBe('tarefa.cancelar_obrigacao')
  })

  it('arquivar cliente é de Gestor: o Membro não passa nem trocando a ferramenta nas opções', async () => {
    // Pela operação genérica nem entra (B5: só pela ferramenta tipada); pela ferramenta, a regra nega.
    const r = await operacao(app, rafael, { tipo: 'operacao', operacao: 'clientes.arquivar', argumentos: ['c1', { motivo: 'teste', ferramenta: 'cliente.atualizar', semAutorizar: true }] })
    expect(r.status).toBe(400)
    expect(r.corpo.codigo).toBe('USE_FERRAMENTA_TIPADA')
    const t = await ferramenta(app, rafael, 'cliente.arquivar', { cliente_id: 'c1', motivo: 'teste' })
    expect(t.status).toBe(403)
    expect(t.corpo.codigo).toBe('PAPEL_INSUFICIENTE')
  })
})

describe('carteira e exceção por tela', () => {
  it('com a carteira ligada, cliente fora da carteira é negado (SEM_CARTEIRA)', async () => {
    await banco()`update escritorio set carteira_ligada = true where id = 'esc-andrade'`
    await banco()`insert into carteira_cliente (escritorio_id, id, usuario_id, cliente_id) values ('esc-andrade', 'cc-teste-1', 'u7', 'c1')`
    try {
      const [fora] = await banco()`select id, cliente_id from tarefa where escritorio_id = 'esc-andrade' and setor_id = 'fiscal' and cliente_id is not null and cliente_id <> 'c1' and status = 'a_fazer' order by id limit 1`
      const r = await ferramenta(app, rafael, 'tarefa.iniciar', { tarefa_id: fora.id })
      expect(r.status).toBe(403)
      expect(r.corpo.codigo).toBe('SEM_CARTEIRA')
      const lista = await ferramenta(app, rafael, 'tarefa.listar', { limite: 20 }, { chave: null })
      expect(lista.corpo.dados.linhas.every((t: { cliente_id: string | null }) => !t.cliente_id || t.cliente_id === 'c1')).toBe(true)
    } finally {
      await banco()`delete from carteira_cliente where escritorio_id = 'esc-andrade' and id = 'cc-teste-1'`
      await banco()`update escritorio set carteira_ligada = false where id = 'esc-andrade'`
    }
  })

  it('transição que não muda nada também confere a permissão (não responde ok a quem não pode)', async () => {
    const [t] = await banco()`select id from tarefa where escritorio_id = 'esc-andrade' and setor_id = 'fiscal' and status = 'em_andamento' order by id limit 1`
    const r = await ferramenta(app, ana, 'tarefa.iniciar', { tarefa_id: t.id })
    expect(r.status).toBe(403)
    expect(r.corpo.codigo).toBe('SEM_SETOR')
  })

  it('exceção por tela que bloqueia vence o vínculo (BLOQUEADO_POR_EXCECAO)', async () => {
    await banco()`insert into excecao_tela (escritorio_id, id, usuario_id, tela_ou_ferramenta, efeito, motivo, vigente_de) values ('esc-andrade', 'x-teste-1', 'u7', 'aba.fiscal', 'bloquear', 'férias', '2026-11-01')`
    try {
      const r = await ferramenta(app, rafael, 'tarefa.iniciar', { tarefa_id: await tarefaDo('fiscal') })
      expect(r.status).toBe(403)
      expect(r.corpo).toMatchObject({ codigo: 'BLOQUEADO_POR_EXCECAO', mensagem: 'Bloqueado para a sua conta: férias' })
    } finally {
      await banco()`delete from excecao_tela where escritorio_id = 'esc-andrade' and id = 'x-teste-1'`
    }
  })
})

describe('a mesma função do frontend', () => {
  it('para cada conta e transição, a API decide exatamente o que `autorizar` decide no navegador', async () => {
    const usuarios = await banco()`select * from usuario where escritorio_id = 'esc-andrade' and situacao = 'ativo' order by id`
    const vinculos = await banco()`select * from vinculo_setor where escritorio_id = 'esc-andrade'`
    const excecoes = await banco()`select * from excecao_tela where escritorio_id = 'esc-andrade'`
    const [esc] = await banco()`select carteira_ligada from escritorio where id = 'esc-andrade'`
    const [ass] = await banco()`select modulos from assinatura where escritorio_id = 'esc-andrade' order by ordem nulls last, criado_em limit 1`
    const tarefas = await banco()`select id, setor_id, cliente_id from tarefa where escritorio_id = 'esc-andrade' and status = 'a_fazer' and origem = 'pessoa' order by setor_id, id`
    const porSetor = new Map<string, { id: string; setor_id: string; cliente_id: string | null }>()
    for (const t of tarefas) if (!porSetor.has(t.setor_id)) porSetor.set(t.setor_id, t as never)
    let comparadas = 0
    for (const u of usuarios) {
      const perfil = perfilDeConta(contaParaTela(u as never, vinculos as never, excecoes as never, []), { carteira_ligada: esc.carteira_ligada, modulos: ass.modulos })
      const token = await entrar(app, { escritorio_id: 'esc-andrade', usuario_id: u.id })
      for (const t of porSetor.values()) {
        const local = autorizar({ ator: { tipo: 'pessoa', perfil }, origem: 'tela' }, 'tarefa.iniciar', { setor_id: t.setor_id, cliente_id: t.cliente_id })
        const r = await ferramenta(app, token, 'tarefa.iniciar', { tarefa_id: t.id, validar_apenas: true }, { chave: null })
        expect(r.status).toBe(200)
        expect(r.corpo.erros.length === 0, `${u.id} em ${t.setor_id}`).toBe(local.permitido)
        if (!local.permitido) expect(r.corpo.erros[0].mensagem).toBe(local.motivo)
        comparadas++
      }
    }
    expect(comparadas).toBeGreaterThan(30)
  })
})

describe('app do cliente e integrante', () => {
  it('a pessoa do cliente só usa ferramenta exposta ao cliente (FORA_DO_APP_CLIENTE)', async () => {
    const cliente = await entrar(app, { escritorio_id: 'esc-andrade', cliente_id: 'c1' })
    const r = await ferramenta(app, cliente, 'cliente.criar', { tipo: 'pj', codigo: '999', documento: '00.000.000/0001-00', nome: 'Teste', regime: 'simples' })
    expect(r.status).toBe(403)
    expect(r.corpo.codigo).toBe('FORA_DO_APP_CLIENTE')
  })

  it('integrante nunca passa do dono (R4)', async () => {
    const r = await ferramenta(app, ana, 'tarefa.concluir', { tarefa_id: await tarefaDo('fiscal') }, { integrante: 'i-fiscal' })
    expect(r.status).toBe(403)
    expect(r.corpo.codigo).toBe('SEM_SETOR')
  })

  it('integrante pedindo algo irreversível gera cartão de aprovação para o dono (202), sem efeito', async () => {
    const [cv] = await banco()`select id, setor_id from conversa where escritorio_id = 'esc-andrade' order by id limit 1`
    const antes = await banco()`select count(*)::int as n from mensagem where escritorio_id = 'esc-andrade'`
    const r = await operacao(app, adm, { tipo: 'operacao', operacao: 'mensagens.criar', argumentos: [{ conversa_id: cv.id, direcao: 'saida', canal: 'whatsapp', autor_tipo: 'integrante', corpo: 'Segue a guia.', origem_externa: false }] }, { integrante: 'i-atendimento' })
    expect(r.status).toBe(202)
    expect(r.corpo).toMatchObject({ resultado: 'aguardando_aprovacao' })
    const [cartao] = await banco()`select * from cartao_aprovacao where escritorio_id = 'esc-andrade' and id = ${r.corpo.cartao_id}`
    expect(cartao).toMatchObject({ status: 'pendente', ferramenta: 'conversa.responder', pedido_por_tipo: 'integrante', pode_aprovar: ['u1'] })
    const depois = await banco()`select count(*)::int as n from mensagem where escritorio_id = 'esc-andrade'`
    expect(depois[0].n).toBe(antes[0].n)
    const [ev] = await banco()`select resultado from evento where id = ${r.corpo.evento_id}`
    expect(ev.resultado).toBe('aguardando_aprovacao')
  })
})

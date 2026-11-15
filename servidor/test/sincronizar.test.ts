import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { api, banco, entrar, ferramenta } from './ajuda.ts'

/**
 * `sincronizar` por classes, filtrado pela regra de leitura (B5; ARQUITETURA 6.1 e 6.3).
 * Nada de entregar o escritório inteiro: a classe 3 nunca vem, e cada linha passa por
 * setor, carteira, exceção por tela e pelo que é da pessoa.
 */

const app = api()
let adm: string, rafael: string, ana: string, joao: string
type Foto = { tabelas: Record<string, Record<string, any>[]>; removidas: { tabela: string; id: string }[]; versao: number; classes: number[] }
const sinc = async (t: string, q = ''): Promise<Foto> => {
  const r = await app.inject({ method: 'GET', url: `/v1/sincronizar${q}`, headers: { authorization: `Bearer ${t}` } })
  expect(r.statusCode).toBe(200)
  return r.json()
}

beforeAll(async () => {
  adm = await entrar(app, { escritorio_id: 'esc-andrade', usuario_id: 'u1' })
  rafael = await entrar(app, { escritorio_id: 'esc-andrade', usuario_id: 'u7' })
  ana = await entrar(app, { escritorio_id: 'esc-andrade', usuario_id: 'u3' })
  joao = await entrar(app, { escritorio_id: 'esc-andrade', usuario_id: 'u2' })
})
afterAll(() => app.close())

describe('classes', () => {
  it('padrão 1 e 2; a classe 3 (evento, mensagem interna) nunca vem', async () => {
    const f = await sinc(adm)
    expect(f.classes).toEqual([1, 2])
    expect(f.tabelas.evento).toBeUndefined()
    expect(f.tabelas.mensagem_interna).toBeUndefined()
    expect(f.tabelas.tarefa.length).toBeGreaterThan(0)
    expect(f.tabelas.cliente.length).toBeGreaterThan(0)
  })

  it('classes=1 traz só a configuração e o cadastro; classes=3 é recusado', async () => {
    const f = await sinc(adm, '?classes=1')
    expect(f.tabelas.cliente.length).toBeGreaterThan(0)
    expect(f.tabelas.tarefa).toBeUndefined()
    const r = await app.inject({ method: 'GET', url: '/v1/sincronizar?classes=3', headers: { authorization: `Bearer ${adm}` } })
    expect(r.statusCode).toBe(400)
    expect(r.json().codigo).toBe('ENTRADA_INVALIDA')
  })
})

describe('linha a linha, pela mesma regra de autorizar', () => {
  it('o Membro só recebe tarefa dos setores dele; o Administrador recebe todas', async () => {
    const setores = (await banco()`select setor_id from vinculo_setor where escritorio_id = 'esc-andrade' and usuario_id = 'u7'`).map((v) => v.setor_id)
    const doMembro = (await sinc(rafael)).tabelas.tarefa
    const doAdm = (await sinc(adm)).tabelas.tarefa
    expect(doMembro.length).toBeGreaterThan(0)
    expect(doMembro.length).toBeLessThan(doAdm.length)
    expect(doMembro.every((t) => setores.includes(t.setor_id))).toBe(true)
    // E o que ficou de fora existe: é filtro, não falta de dado.
    expect(doAdm.some((t) => !setores.includes(t.setor_id))).toBe(true)
  })

  it('aviso para outra pessoa não chega', async () => {
    const avisos = (await sinc(ana)).tabelas.notificacao
    expect(avisos.length).toBeGreaterThan(0)
    expect(avisos.every((n) => n.destinatario_tipo !== 'usuario' || n.destinatario_ids.includes('u3'))).toBe(true)
    const [alheio] = await banco()`select id from notificacao where escritorio_id = 'esc-andrade' and destinatario_tipo = 'usuario' and not ('u3' = any(destinatario_ids)) limit 1`
    expect(avisos.map((n) => n.id)).not.toContain(alheio.id)
  })

  it('conversa interna privada só para quem participa', async () => {
    const conversas = (await sinc(ana)).tabelas.conversa_interna
    const minhas = new Set((await banco()`select conversa_interna_id from participacao where escritorio_id = 'esc-andrade' and usuario_id = 'u3' and saiu_em is null`).map((p) => p.conversa_interna_id))
    expect(conversas.every((c) => c.tipo === 'canal_geral' || c.tipo === 'canal_setor' || minhas.has(c.id))).toBe(true)
  })

  it('carteira ligada: cliente fora da carteira some, e a tarefa dele também', async () => {
    const sql = banco()
    const [antes] = await sql`select carteira_ligada from escritorio where id = 'esc-andrade'`
    await sql`update escritorio set carteira_ligada = true where id = 'esc-andrade'`
    try {
      const carteira = new Set((await sql`select cliente_id from carteira_cliente where escritorio_id = 'esc-andrade' and usuario_id = 'u7'`).map((c) => c.cliente_id))
      const f = await sinc(rafael)
      expect(f.tabelas.cliente.every((c) => carteira.has(c.id))).toBe(true)
      expect(f.tabelas.tarefa.every((t) => !t.cliente_id || carteira.has(t.cliente_id))).toBe(true)
    } finally {
      await sql`update escritorio set carteira_ligada = ${antes.carteira_ligada} where id = 'esc-andrade'`
    }
  })

  it('exceção por tela que bloqueia a aba do setor tira as linhas do setor', async () => {
    const sql = banco()
    const [v] = await sql`select setor_id from vinculo_setor where escritorio_id = 'esc-andrade' and usuario_id = 'u7' order by setor_id limit 1`
    const antes = (await sinc(rafael)).tabelas.tarefa.filter((t) => t.setor_id === v.setor_id).length
    expect(antes).toBeGreaterThan(0)
    await sql`insert into excecao_tela (escritorio_id, id, usuario_id, tela_ou_ferramenta, efeito, motivo, vigente_de) values ('esc-andrade', 'x-teste-sinc', 'u7', ${'aba.' + v.setor_id}, 'bloquear', 'teste de sincronização', current_date)`
    try {
      const depois = (await sinc(rafael)).tabelas.tarefa.filter((t) => t.setor_id === v.setor_id).length
      expect(depois).toBe(0)
    } finally {
      await sql`delete from excecao_tela where escritorio_id = 'esc-andrade' and id = 'x-teste-sinc'`
    }
  })

  it('a pessoa do cliente só recebe o que é do cliente dela', async () => {
    const [c] = await banco()`select cliente_id from tarefa where escritorio_id = 'esc-andrade' and cliente_id is not null group by 1 order by count(*) desc limit 1`
    const t = await entrar(app, { escritorio_id: 'esc-andrade', cliente_id: c.cliente_id })
    const f = await sinc(t)
    expect(f.tabelas.cliente.map((x) => x.id)).toEqual([c.cliente_id])
    expect(f.tabelas.tarefa.every((x) => x.cliente_id === c.cliente_id)).toBe(true)
    expect(f.tabelas.vinculo_setor).toEqual([])
    expect(f.tabelas.usuario.every((u) => !('email_login' in u))).toBe(true)
  })
})

describe('delta', () => {
  it('linha que mudou e saiu do escopo vem em removidas', async () => {
    const setores = (await banco()`select setor_id from vinculo_setor where escritorio_id = 'esc-andrade' and usuario_id = 'u7'`).map((v) => v.setor_id)
    const [t] = await banco()`select id from tarefa where escritorio_id = 'esc-andrade' and setor_id = any(${setores}) and status = 'a_fazer' order by id limit 1`
    const v = (await sinc(rafael)).versao
    const [fora] = await banco()`select id from setor where escritorio_id = 'esc-andrade' and not (id = any(${setores})) limit 1`
    expect((await ferramenta(app, adm, 'tarefa.atualizar', { tarefa_id: t.id, campos: { titulo: 'Mudou para o delta da B5' } })).status).toBe(200)
    await banco()`update tarefa set setor_id = ${fora.id} where escritorio_id = 'esc-andrade' and id = ${t.id}`
    const delta = await sinc(rafael, `?desde=${v}`)
    expect(delta.removidas).toContainEqual({ tabela: 'tarefa', id: t.id })
    expect(delta.tabelas.tarefa.map((x) => x.id)).not.toContain(t.id)
  })
})

describe('consulta paginada (classe 3), pela mesma regra de leitura', () => {
  it('conversa pessoal de outros não aparece na lista nem pelo id, mesmo passando a conversa', async () => {
    // Rafael (u7) não participa da conversa pessoal entre u1 e u2.
    const r = await ferramenta(app, rafael, 'mensagem_interna.listar', { conversa_interna_id: 'ci-s05-pessoal-u1-u2' }, { chave: null })
    expect(r.status).toBe(200)
    expect(r.corpo.dados.linhas).toEqual([])
    expect(r.corpo.pagina.total).toBe(0)
    const da = await ferramenta(app, adm, 'mensagem_interna.listar', { conversa_interna_id: 'ci-s05-pessoal-u1-u2' }, { chave: null })
    expect(da.corpo.dados.linhas.length).toBeGreaterThan(0)
    // Sem a conversa: só as das conversas dele (canais e o grupo de que participa).
    const todas = await ferramenta(app, rafael, 'mensagem_interna.listar', { visao: 'tela', limite: 100 }, { chave: null })
    expect(todas.corpo.dados.linhas.every((m: { conversa_interna_id: string }) => m.conversa_interna_id !== 'ci-s05-pessoal-u1-u2')).toBe(true)
  })

  it('o cursor leva o total: as páginas seguintes não recontam, e o total bate com o percorrido', async () => {
    let cursor: string | undefined
    const vistos = new Set<string>()
    let total = -1
    for (let i = 0; i < 50; i++) {
      const r = await ferramenta(app, adm, 'evento.listar', { limite: 20, so_linha_do_tempo: false, ...(cursor ? { cursor } : {}) }, { chave: null })
      expect(r.status).toBe(200)
      if (total < 0) total = r.corpo.pagina.total
      else expect(r.corpo.pagina.total).toBe(total)
      for (const l of r.corpo.dados.linhas) vistos.add(l.id)
      if (!r.corpo.pagina.ha_mais) break
      cursor = r.corpo.pagina.cursor
    }
    expect(vistos.size).toBe(total)
  })

  it('evento.listar filtra pela ficha do registro (resultado_ref)', async () => {
    const [t] = await banco()`select resultado_ref from evento where escritorio_id = 'esc-andrade' and resultado_ref is not null group by 1 order by count(*) desc limit 1`
    const r = await ferramenta(app, adm, 'evento.listar', { resultado_ref: t.resultado_ref, so_linha_do_tempo: false, visao: 'tela' }, { chave: null })
    expect(r.corpo.dados.linhas.length).toBeGreaterThan(0)
    expect(r.corpo.dados.linhas.every((e: { resultado_ref: string }) => e.resultado_ref === t.resultado_ref)).toBe(true)
  })
})

describe('equipe: diretório para todos, custo e timesheet só para quem gere (decisão do Enzo, 15/11/2026)', () => {
  const total = async (tabela: string) => (await banco()`select count(*)::int as n from ${banco()(tabela)} where escritorio_id = 'esc-andrade'`)[0].n as number

  it('o Membro vê a equipe inteira: contas, setores de cada um, papéis e carteiras', async () => {
    const f = await sinc(ana)
    for (const t of ['usuario', 'vinculo_setor', 'carteira_cliente', 'setor']) expect(f.tabelas[t]?.length, t).toBe(await total(t))
    expect(f.tabelas.usuario.map((u) => u.nome)).toEqual(expect.arrayContaining(['Fernanda Lima', 'João Pereira']))
  })

  it('o Membro não recebe custo-hora nem fechamento do timesheet, e só vê o próprio timesheet', async () => {
    const f = await sinc(ana)
    expect(f.tabelas.custo_hora ?? []).toEqual([])
    expect(f.tabelas.fechamento_timesheet ?? []).toEqual([])
    const sessoes = f.tabelas.sessao_trabalho ?? []
    expect(sessoes.length).toBeGreaterThan(0)
    expect(sessoes.every((x) => x.usuario_dono_id === 'u3')).toBe(true)
    expect((f.tabelas.item_confirmacao ?? []).every((x) => x.usuario_id === 'u3' || x.usuario_id == null)).toBe(true)
  })

  it('o Administrador vê o custo e o timesheet de todos', async () => {
    const f = await sinc(adm)
    expect(f.tabelas.custo_hora.length).toBe(await total('custo_hora'))
    expect(f.tabelas.fechamento_timesheet.length).toBeGreaterThan(0)
    expect(new Set(f.tabelas.sessao_trabalho.map((x) => x.usuario_dono_id)).size).toBeGreaterThan(3)
  })

  it('o Gestor vê o custo e o timesheet do setor que gere; de outro setor, só o próprio', async () => {
    const f = await sinc(joao)
    expect(f.tabelas.custo_hora.length).toBe(await total('custo_hora'))
    const sessoes = f.tabelas.sessao_trabalho
    // João gere o Contábil: vê as sessões de outras pessoas no Contábil.
    expect(sessoes.some((x) => x.setor_id === 'contabil' && x.usuario_dono_id !== 'u2')).toBe(true)
    // No Fiscal ele só executa: de lá, só as próprias.
    expect(sessoes.filter((x) => x.setor_id === 'fiscal').every((x) => x.usuario_dono_id === 'u2')).toBe(true)
    expect(sessoes.some((x) => x.setor_id === 'dp')).toBe(false)
  })
})

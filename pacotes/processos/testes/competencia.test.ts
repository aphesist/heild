import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { comEscritorio, FILAS, type Sql } from '../src/index.ts'
import { contar, documentoSimples, esperar, integrante, montar, pessoa, semear, sqlAdmin, type Semente } from './ambiente.ts'

/**
 * CTB-COMPETENCIA-DOC disparado por evento: o documento é registrado, o despachante casa o gatilho
 * e inicia a execução direto (sem acordar o integrante). Regra primeiro; operário só no que sobra;
 * validadores conferem; dúvida vira cartão; o integrante só acorda se houver algo a dizer.
 */
let h: Awaited<ReturnType<typeof montar>>
const admin = sqlAdmin()

beforeAll(async () => {
  h = await montar()
})
afterAll(async () => {
  await h.parar()
  await admin.end()
})

async function preparar(o: { executa_sozinho?: boolean; perguntar?: boolean; custo?: 'responsavel' } = {}) {
  const s = await semear(admin)
  await admin`insert into gatilho (escritorio_id, evento_nome, procedimento_id, setor, perguntar_responsavel) values (${s.esc}, 'documento.registrar', 'CTB-COMPETENCIA-DOC', 'contabil', ${o.perguntar ?? false})`
  await admin`insert into procedimento_config (escritorio_id, procedimento_id, executa_sozinho) values (${s.esc}, 'CTB-COMPETENCIA-DOC', ${o.executa_sozinho ?? true})`
  if (o.custo) await admin`update escritorio set configuracao = ${admin.json({ custo_integrante: o.custo })} where id = ${s.esc}`
  return s
}

/** O que o executor da B1 fará ao registrar um documento: o evento, na transação, enfileira o despacho. */
async function registrarDocumento(sql: Sql, s: Semente, documento_id: string, tipo: string) {
  const ctx = await pessoa(sql, s.esc, 'u-ana', 'tela')
  return comEscritorio(sql, s.esc, (tx) =>
    h.eventos.gravar(tx, ctx, {
      nome: 'documento.registrar', ferramenta: 'documento.registrar', nivel: 'executar', resultado: 'ok', texto: 'Documento recebido',
      cliente_id: s.cliente, argumentos_resumo: { documento_id, tipo }, resultado_ref: documento_id,
    }),
  )
}

const execucoesDo = (s: Semente) => admin`select * from execucao where escritorio_id = ${s.esc} order by criado_em`
const documento = async (s: Semente, id: string) => (await admin`select competencia, metadados from documento where escritorio_id = ${s.esc} and id = ${id}`)[0]!

describe('CTB-COMPETENCIA-DOC', () => {
  it('nota com data de emissão: classifica por regra, sem modelo, sem acordar o integrante', async () => {
    const s = await preparar()
    const doc = await documentoSimples(admin, s, { tipo: 'nfe', metadados: { data_emissao: '2026-10-28' } })
    const evento_id = await registrarDocumento(admin, s, doc, 'nfe')
    const [ex] = await esperar(() => execucoesDo(s), (l) => l[0]?.estado === 'concluida')
    expect(ex!.origem).toBe('evento')
    expect(ex!.ator_tipo).toBe('integrante')
    expect(ex!.causado_por_evento_id).toBe(evento_id)
    expect((await documento(s, doc)).competencia).toBe('2026-10')
    expect(await contar(admin, 'chamada_modelo', { execucao_id: ex!.id })).toBe(0)
    expect(await contar(admin, 'item_fila', { execucao_id: ex!.id })).toBe(0)
    expect(await contar(admin, 'cartao_aprovacao', { execucao_id: ex!.id })).toBe(0)
  })

  it('evento entregue duas vezes não abre duas execuções', async () => {
    const s = await preparar()
    const doc = await documentoSimples(admin, s, { tipo: 'nfe', metadados: { data_emissao: '2026-09-02' } })
    const evento_id = await registrarDocumento(admin, s, doc, 'nfe')
    await esperar(() => execucoesDo(s), (l) => l[0]?.estado === 'concluida')
    // O mesmo evento despachado de novo (retentativa, outro worker): nada novo.
    await h.despachante.despachar({ escritorio_id: s.esc, evento_id })
    await h.boss.send(FILAS.despachar, { escritorio_id: s.esc, evento_id })
    await new Promise((r) => setTimeout(r, 1500))
    expect(await execucoesDo(s)).toHaveLength(1)
  })

  it('recibo sem data estruturada: o operário escolhe entre as candidatas; o integrante é avisado', async () => {
    const s = await preparar()
    const doc = await documentoSimples(admin, s, { tipo: 'recibo', metadados: { texto_extraido: 'Recibo de aluguel referente a 08/2026. Pago em 05/09/2026.' } })
    await registrarDocumento(admin, s, doc, 'recibo')
    const [ex] = await esperar(() => execucoesDo(s), (l) => l[0]?.estado === 'concluida')
    const pedido = h.fornecedor.chamadas.at(-1)!
    // Contexto vazio: só o contrato; o texto do documento vai envelopado como dado externo.
    expect(Object.keys((pedido.entrada as { dados: object }).dados).sort()).toEqual(['candidatas', 'tipo_documento', 'trecho'])
    expect((pedido.entrada as { dados: { trecho: { dado_externo: boolean } } }).dados.trecho.dado_externo).toBe(true)
    const escolhida = (await documento(s, doc)).competencia
    expect((pedido.entrada as { dados: { candidatas: string[] } }).dados.candidatas).toContain(escolhida)
    expect(await contar(admin, 'chamada_modelo', { execucao_id: ex!.id })).toBe(1)
    const [item] = await admin`select * from item_fila where execucao_id = ${ex!.id}`
    expect(item!.integrante_id).toBe('i-contabil')
    expect(item!.resumo.dados.origem).toBe('modelo')
    const [bolsa] = await admin`select gasto_centavos from bolsa_setor where escritorio_id = ${s.esc}`
    expect(bolsa!.gasto_centavos).toBeGreaterThan(0)
  })

  it('competência inventada pelo modelo é barrada, escala, e na dúvida a pessoa decide', async () => {
    const s = await preparar()
    h.fornecedor.responder('ctb.competencia.escolher', () => ({ competencia: '2019-01', confianca: 0.99, motivo: 'Chute.' }))
    const doc = await documentoSimples(admin, s, { tipo: 'recibo', metadados: { texto_extraido: 'Recibo referente a 07/2026.' } })
    await registrarDocumento(admin, s, doc, 'recibo')
    const [ex] = await esperar(() => execucoesDo(s), (l) => l[0]?.estado === 'aguardando_cartao')
    const chamadas = await admin`select classe from chamada_modelo where execucao_id = ${ex!.id} order by criado_em`
    expect(chamadas.map((c) => c.classe)).toEqual(['operario', 'escritor'])
    expect((await documento(s, doc)).competencia).toBeNull()
    const [c] = await admin`select * from cartao_aprovacao where id = ${ex!.cartao_id}`
    expect(c!.tipo).toBe('nao_consegui')
    // Sem responsável (veio de evento): quem gere o setor e o Administrador decidem.
    expect(c!.pode_aprovar).toEqual(expect.arrayContaining(['u-admin', 'u-gestora']))
    const r = await h.registro.chamar(await pessoa(admin, s.esc, 'u-gestora'), 'aprovacao.decidir', {
      cartao_id: c!.id, decisao: 'editar', argumentos_editados: { competencia: '2026-07', confianca: 1, motivo: 'Conferi no recibo.' },
    })
    expect(r.resultado).toBe('ok')
    await esperar(() => execucoesDo(s), (l) => l[0]?.estado === 'concluida')
    const d = await documento(s, doc)
    expect(d.competencia).toBe('2026-07')
    expect(d.metadados.competencia_origem).toBe('pessoa')
    h.fornecedor.responder('ctb.competencia.escolher', (e: { candidatas: string[] }) => ({ competencia: e.candidatas[0], confianca: 0.95, motivo: 'Data de referência no corpo do recibo.' }))
  })

  it('competência fechada: nenhuma chamada de modelo, direto ao cartão', async () => {
    const s = await preparar()
    await admin`insert into competencia_contabil (escritorio_id, cliente_id, competencia, situacao) values (${s.esc}, 'c-1', '2026-06', 'fechada')`
    const doc = await documentoSimples(admin, s, { tipo: 'nfse', metadados: { data_emissao: '2026-06-30' } })
    await registrarDocumento(admin, s, doc, 'nfse')
    const [ex] = await esperar(() => execucoesDo(s), (l) => l[0]?.estado === 'aguardando_cartao')
    expect(await contar(admin, 'chamada_modelo', { execucao_id: ex!.id })).toBe(0)
    const [c] = await admin`select tipo, extras from cartao_aprovacao where id = ${ex!.cartao_id}`
    expect(c!.tipo).toBe('nao_consegui')
    expect(c!.extras.falhas[0].codigo).toBe('COMPETENCIA_FECHADA')
  })

  it('sem "executa sozinho" na lista do escritório, a classificação pede cartão', async () => {
    const s = await preparar({ executa_sozinho: false })
    const doc = await documentoSimples(admin, s, { tipo: 'nfe', metadados: { data_emissao: '2026-10-01' } })
    await registrarDocumento(admin, s, doc, 'nfe')
    const [ex] = await esperar(() => execucoesDo(s), (l) => l[0]?.estado === 'aguardando_cartao')
    const [c] = await admin`select * from cartao_aprovacao where id = ${ex!.cartao_id}`
    expect(c!.tipo).toBe('aprovacao')
    expect(c!.ferramenta).toBe('documento.classificar')
    expect((await documento(s, doc)).competencia).toBeNull()
    await h.registro.chamar(await pessoa(admin, s.esc, 'u-gestora'), 'aprovacao.decidir', { cartao_id: c!.id, decisao: 'aprovar' })
    await esperar(() => execucoesDo(s), (l) => l[0]?.estado === 'concluida')
    expect((await documento(s, doc)).competencia).toBe('2026-10')
  })

  it('"Para quem quer rotear?": a pessoa escolhida vira responsável e o custo sai do plano dela', async () => {
    const s = await preparar({ perguntar: true, custo: 'responsavel' })
    await admin`insert into bolsa_setor (escritorio_id, setor, mes, saldo_centavos) values (${s.esc}, 'pessoa:u-bruno', to_char(now() at time zone 'America/Sao_Paulo', 'YYYY-MM'), 300)`
    const doc = await documentoSimples(admin, s, { tipo: 'recibo', metadados: { texto_extraido: 'Referente a 10/2026.' } })
    await registrarDocumento(admin, s, doc, 'recibo')
    const [ex] = await esperar(() => execucoesDo(s), (l) => l[0]?.estado === 'aguardando_cartao')
    const [c] = await admin`select * from cartao_aprovacao where id = ${ex!.cartao_id}`
    expect(c!.tipo).toBe('escolha_responsavel')
    expect(c!.opcoes.map((o: { usuario_id: string }) => o.usuario_id).sort()).toEqual(['u-ana', 'u-bruno', 'u-gestora'])
    // O integrante não escolhe por ninguém.
    expect((await h.registro.chamar(await integrante(admin, s.esc), 'aprovacao.decidir', { cartao_id: c!.id, decisao: 'escolher', escolha: 'u-bruno' })).resultado).toBe('negado')
    await h.registro.chamar(await pessoa(admin, s.esc, 'u-ana'), 'aprovacao.decidir', { cartao_id: c!.id, decisao: 'escolher', escolha: 'u-bruno' })
    const [fim] = await esperar(() => execucoesDo(s), (l) => l[0]?.estado === 'concluida')
    expect(fim!.responsavel_id).toBe('u-bruno')
    expect(fim!.pagador_tipo).toBe('usuario')
    const [chamada] = await admin`select * from chamada_modelo where execucao_id = ${fim!.id}`
    expect(chamada!.pagador_id).toBe('u-bruno')
    const bolsas = await admin`select setor, gasto_centavos from bolsa_setor where escritorio_id = ${s.esc} order by setor`
    expect(bolsas.find((b) => b.setor === 'contabil')!.gasto_centavos).toBe(0)
    expect(bolsas.find((b) => b.setor === 'pessoa:u-bruno')!.gasto_centavos).toBe(chamada!.centavos)
  })

  it('vinte documentos de uma vez: vinte execuções isoladas, cada uma com o seu resultado', async () => {
    const s = await preparar()
    const docs: [string, string][] = []
    for (let i = 0; i < 20; i++) {
      const mes = String((i % 9) + 1).padStart(2, '0')
      docs.push([await documentoSimples(admin, s, { tipo: 'nfe', metadados: { data_emissao: `2026-${mes}-15` } }), `2026-${mes}`])
    }
    await Promise.all(docs.map(([d]) => registrarDocumento(admin, s, d, 'nfe')))
    const execs = await esperar(() => execucoesDo(s), (l) => l.length === 20 && l.every((e) => e.estado === 'concluida'), 60_000)
    expect(new Set(execs.map((e) => e.id)).size).toBe(20)
    for (const [d, mes] of docs) expect((await documento(s, d)).competencia).toBe(mes)
    // Nenhuma execução leu passo de outra.
    const cruzados = await admin`
      select count(*)::int as n from passo_execucao p join execucao e on e.escritorio_id = p.escritorio_id and e.id = p.execucao_id
      where e.escritorio_id = ${s.esc} and p.nome = 'ler_documento' and p.saida->'regra'->>'competencia' <> (select competencia from documento d where d.escritorio_id = e.escritorio_id and d.id = e.entrada->>'documento_id')`
    expect(cruzados[0]!.n).toBe(0)
  })
})

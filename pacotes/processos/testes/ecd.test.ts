import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { verificarCadeia, bytesToHex } from '@heild/dominio'
import { comEscritorio, type Envelope } from '../src/index.ts'
import { contar, documentoEcd, esperar, integrante, montar, pessoa, semear, sqlAdmin } from './ambiente.ts'

/**
 * CTB-ECD-TRANSMITIR de ponta a ponta, contra o Postgres local, com pg-boss e workers de verdade.
 * Prova: a validação determinística barra antes do modelo; o ato irreversível só sai com cartão
 * humano; a retomada depois de falha não duplica; duas pessoas não geram dois envios.
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

const estado = (esc: string, id: string) => comEscritorio(admin, esc, async (tx) => (await tx`select * from execucao where id = ${id}`)[0]!)

async function pedirEcd(esc: string, usuario: string, documento_id: string, chave?: string) {
  const ctx = await pessoa(admin, esc, usuario)
  const env = await h.registro.chamar(ctx, 'contabil.ecd.conferir_e_transmitir', { cliente_id: 'c-1', exercicio: '2025', documento_id, ...(chave ? { chave_idempotencia: chave } : {}) })
  if (env.resultado !== 'em_execucao' && env.resultado !== 'aguardando_aprovacao' && env.resultado !== 'ok') throw new Error(JSON.stringify(env))
  return { ctx, execucao_id: (env as { execucao_id: string }).execucao_id }
}

describe('CTB-ECD-TRANSMITIR', () => {
  it('validação determinística barra o arquivo errado antes de qualquer modelo', async () => {
    for (const quebrar of ['partidas', 'cnpj', 'saldo'] as const) {
      const s = await semear(admin)
      const doc = await documentoEcd(admin, s, { quebrar })
      const antes = h.fornecedor.chamadas.length
      const { execucao_id } = await pedirEcd(s.esc, 'u-ana', doc)
      const ex = await esperar(() => estado(s.esc, execucao_id), (e) => e.estado === 'falhou')
      expect(ex.erro.codigo).toBe('VALIDACAO')
      expect(ex.passo_nome).toBe('conferir')
      expect(await contar(admin, 'chamada_modelo', { execucao_id })).toBe(0)
      expect(h.fornecedor.chamadas.length).toBe(antes)
      expect(await contar(admin, 'cartao_aprovacao', { execucao_id })).toBe(0)
      expect(h.sped.envios).toBe(0)
      // O integrante é acordado com a falha, para contar à pessoa.
      const [item] = await admin`select resumo from item_fila where execucao_id = ${execucao_id}`
      expect(item!.resumo.estado).toBe('falhou')
    }
  })

  it('só transmite com cartão aprovado por pessoa, uma vez, com os argumentos aprovados', async () => {
    const s = await semear(admin)
    const doc = await documentoEcd(admin, s)
    // Mesmo com "executa sozinho" ligado, ato irreversível pede cartão.
    await admin`insert into procedimento_config (escritorio_id, procedimento_id, executa_sozinho) values (${s.esc}, 'CTB-ECD-TRANSMITIR', true)`
    const { ctx, execucao_id } = await pedirEcd(s.esc, 'u-ana', doc)
    const ex = await esperar(() => estado(s.esc, execucao_id), (e) => e.estado === 'aguardando_cartao')
    const [cartao] = await admin`select * from cartao_aprovacao where id = ${ex.cartao_id}`
    expect(cartao!.ferramenta).toBe('contabil.ecd_ecf.transmitir')
    expect(cartao!.pode_aprovar).toEqual(['u-ana'])
    expect(cartao!.resumo_humano).toContain('R$')
    expect(h.sped.envios).toBe(0)

    // O operário rodou uma vez, com contrato, e o custo saiu da bolsa do setor.
    const chamadas = await admin`select * from chamada_modelo where execucao_id = ${execucao_id}`
    expect(chamadas).toHaveLength(1)
    expect(chamadas[0]!.saida_valida).toBe(true)
    const [bolsa] = await admin`select gasto_centavos from bolsa_setor where escritorio_id = ${s.esc}`
    expect(bolsa!.gasto_centavos).toBe(chamadas[0]!.centavos)
    expect((await estado(s.esc, execucao_id)).gasto_centavos).toBe(chamadas[0]!.centavos)
    expect(await contar(admin, 'reserva_orcamento', { execucao_id })).toBe(0)

    // Quem não está no cartão, outro setor e o integrante não decidem.
    const outro = await pessoa(admin, s.esc, 'u-fiscal')
    const negado = (await h.registro.chamar(outro, 'aprovacao.decidir', { cartao_id: cartao!.id, decisao: 'aprovar' })) as Envelope
    expect(negado.resultado).toBe('negado')
    const bot = await integrante(admin, s.esc, 'u-ana')
    const negadoBot = await h.registro.chamar(bot, 'aprovacao.decidir', { cartao_id: cartao!.id, decisao: 'aprovar' })
    expect(negadoBot.resultado).toBe('negado')

    const ok = await h.registro.chamar(ctx, 'aprovacao.decidir', { cartao_id: cartao!.id, decisao: 'aprovar' })
    expect(ok.resultado).toBe('ok')
    const fim = await esperar(() => estado(s.esc, execucao_id), (e) => e.estado === 'concluida')
    expect(h.sped.recebidos.get(`${s.esc}|ECD:c-1:2025`)!.argumentos).toEqual(cartao!.argumentos)
    expect(fim.saida.recibo).toMatch(/^REC-/)
    const [entrega] = await admin`select * from entrega_obrigacao where escritorio_id = ${s.esc}`
    expect(entrega!.aprovado_por).toBe('u-ana')
    expect(entrega!.cartao_id).toBe(cartao!.id)
    // O evento da transmissão aponta o cartão que a liberou.
    const [ev] = await admin`select * from evento where execucao_id = ${execucao_id} and ferramenta = 'contabil.ecd_ecf.transmitir' and resultado = 'ok'`
    expect(ev!.aprovacao_id).toBe(cartao!.id)
    // Cada passo concluído uma vez só.
    const repetidos = await admin`select ordem from passo_execucao where execucao_id = ${execucao_id} and estado = 'concluido' group by ordem having count(*) > 1`
    expect(repetidos).toHaveLength(0)
    // A trilha da B2 entra na cadeia de hash do escritório (B1) e confere com a mesma verificação.
    const eventos = await admin`select * from evento where escritorio_id = ${s.esc} order by seq`
    expect(eventos.every((e) => e.seq !== null)).toBe(true)
    const [elo] = await admin`select seq, hash from cadeia_evento where escritorio_id = ${s.esc}`
    const paraCadeia = eventos.map((e) => ({ ...e, seq: Number(e.seq), criado_em: new Date(e.criado_em).toISOString(), hash_anterior: bytesToHex(e.hash_anterior), hash: bytesToHex(e.hash) }))
    const v = verificarCadeia(s.esc, paraCadeia as never, { seq: Number(elo!.seq), hash: bytesToHex(elo!.hash) })
    expect(v).toMatchObject({ ok: true, eventos: eventos.length })
  })

  it('recusa no cartão encerra sem transmitir', async () => {
    const s = await semear(admin)
    const { ctx, execucao_id } = await pedirEcd(s.esc, 'u-ana', await documentoEcd(admin, s))
    const ex = await esperar(() => estado(s.esc, execucao_id), (e) => e.estado === 'aguardando_cartao')
    const r = await h.registro.chamar(ctx, 'aprovacao.decidir', { cartao_id: ex.cartao_id, decisao: 'recusar', comentario: 'Falta conferir o estoque.' })
    expect(r.resultado).toBe('ok')
    expect((await estado(s.esc, execucao_id)).estado).toBe('cancelada')
    expect(h.sped.recebidos.has(`${s.esc}|ECD:c-1:2025`) && (await contar(admin, 'efeito_externo', { execucao_id }))).toBeFalsy()
    const [item] = await admin`select resumo from item_fila where execucao_id = ${execucao_id} order by enfileirado_em desc limit 1`
    expect(item!.resumo.estado).toBe('recusado')
  })

  it('não transmite se o cartão no banco não foi decidido por pessoa ou se os argumentos mudaram', async () => {
    for (const fraude of ['integrante_decidiu', 'argumento_trocado'] as const) {
      const s = await semear(admin)
      const enviosAntes = h.sped.envios
      const { execucao_id } = await pedirEcd(s.esc, 'u-ana', await documentoEcd(admin, s))
      const ex = await esperar(() => estado(s.esc, execucao_id), (e) => e.estado === 'aguardando_cartao')
      const [c] = await admin`select * from cartao_aprovacao where id = ${ex.cartao_id}`
      // Simula um defeito que pulasse o aprovacao.decidir e escrevesse direto no banco.
      const decidido_por = fraude === 'integrante_decidiu' ? 'i-contabil' : 'u-ana'
      await admin`update cartao_aprovacao set status = 'aprovado', decidido_por = ${decidido_por}, decidido_em = now() where id = ${c!.id}`
      const argumentos = fraude === 'argumento_trocado' ? { ...c!.argumentos, hash_arquivo: 'f'.repeat(64) } : c!.argumentos
      await admin`update passo_execucao set estado = 'concluido', fim = now(), saida = ${admin.json({ cartao_id: c!.id, decisao: 'aprovado', argumentos, decidido_por } as never)}
                  where execucao_id = ${execucao_id} and ordem = 5 and estado = 'aguardando'`
      await admin`update execucao set estado = 'executando', passo_atual = 6, tentativa_passo = 0, cartao_id = null where id = ${execucao_id}`
      await h.boss.send('procedimento.passo', { escritorio_id: s.esc, execucao_id, ordem: 6, tentativa: 0 })
      const fim = await esperar(() => estado(s.esc, execucao_id), (e) => e.estado === 'falhou')
      expect(fim.erro.codigo).toBe('SEM_APROVACAO')
      expect(h.sped.envios).toBe(enviosAntes)
      expect(await contar(admin, 'efeito_externo', { execucao_id })).toBe(0)
    }
  })

  it('retoma depois de falha do conector sem transmitir duas vezes', async () => {
    for (const falha of ['depois', 'antes'] as const) {
      const s = await semear(admin)
      const { ctx, execucao_id } = await pedirEcd(s.esc, 'u-ana', await documentoEcd(admin, s))
      const ex = await esperar(() => estado(s.esc, execucao_id), (e) => e.estado === 'aguardando_cartao')
      if (falha === 'depois') h.sped.falharDepoisDeEnviar = 1
      else h.sped.falharAntesDeEnviar = 1
      const envios = h.sped.envios
      await h.registro.chamar(ctx, 'aprovacao.decidir', { cartao_id: ex.cartao_id, decisao: 'aprovar' })
      const fim = await esperar(() => estado(s.esc, execucao_id), (e) => e.estado === 'concluida')
      expect(h.sped.envios).toBe(envios + 1)
      const [ef] = await admin`select * from efeito_externo where execucao_id = ${execucao_id}`
      expect(ef!.estado).toBe('confirmado')
      expect(ef!.tentativas).toBe(2)
      expect(fim.saida.recibo).toBe(ef!.resultado.recibo)
      expect(await contar(admin, 'entrega_obrigacao', { execucao_id })).toBe(1)
    }
  })

  it('recusa definitiva do órgão para a execução; retomar depois de corrigir transmite uma vez', async () => {
    const s = await semear(admin)
    const { ctx, execucao_id } = await pedirEcd(s.esc, 'u-ana', await documentoEcd(admin, s))
    const ex = await esperar(() => estado(s.esc, execucao_id), (e) => e.estado === 'aguardando_cartao')
    h.sped.recusar = 'Assinatura do responsável vencida.'
    await h.registro.chamar(ctx, 'aprovacao.decidir', { cartao_id: ex.cartao_id, decisao: 'aprovar' })
    const parou = await esperar(() => estado(s.esc, execucao_id), (e) => e.estado === 'falhou')
    expect(parou.erro.codigo).toBe('RECUSADO_PELO_ORGAO')
    h.sped.recusar = null
    const envios = h.sped.envios
    // Quem não pediu e não gere o setor não retoma.
    expect((await h.registro.chamar(await pessoa(admin, s.esc, 'u-bruno'), 'execucao.retomar', { execucao_id })).resultado).toBe('negado')
    const r = await h.registro.chamar(ctx, 'execucao.retomar', { execucao_id })
    expect(r.resultado).toBe('em_execucao')
    await esperar(() => estado(s.esc, execucao_id), (e) => e.estado === 'concluida')
    expect(h.sped.envios).toBe(envios + 1)
    // Passos anteriores não repetiram: o operário rodou uma vez só.
    expect(await contar(admin, 'chamada_modelo', { execucao_id })).toBe(1)
  })

  it('o mesmo pedido de duas pessoas vira uma execução; a mesma chave nunca vale para outra entrada', async () => {
    const s = await semear(admin)
    const doc = await documentoEcd(admin, s)
    const ana = await pessoa(admin, s.esc, 'u-ana')
    const bruno = await pessoa(admin, s.esc, 'u-bruno')
    const entrada = { cliente_id: 'c-1', exercicio: '2025', documento_id: doc }
    const [a, b] = await Promise.all([h.motor.iniciar(ana, 'CTB-ECD-TRANSMITIR', entrada, { chave_idempotencia: 'chave-ana-0001' }), h.motor.iniciar(bruno, 'CTB-ECD-TRANSMITIR', entrada, { chave_idempotencia: 'chave-bruno-0001' })])
    expect(a.execucao_id).toBe(b.execucao_id)
    expect([a.nova, b.nova].sort()).toEqual([false, true])
    // A chave guardada é a de quem abriu a execução; repetir dá a mesma, com outra entrada é conflito.
    const chave = a.nova ? 'chave-ana-0001' : 'chave-bruno-0001'
    const de_novo = await h.motor.iniciar(ana, 'CTB-ECD-TRANSMITIR', entrada, { chave_idempotencia: chave })
    expect(de_novo).toMatchObject({ execucao_id: a.execucao_id, nova: false })
    const outro = await documentoEcd(admin, s)
    const conflito = await h.registro.chamar(ana, 'contabil.ecd.conferir_e_transmitir', { ...entrada, documento_id: outro, chave_idempotencia: chave })
    expect(conflito).toMatchObject({ resultado: 'erro', codigo: 'IDEMPOTENCIA_CONFLITO' })
  })

  it('duas execuções aprovadas ao mesmo tempo para o mesmo cliente e exercício geram um envio só', async () => {
    const s = await semear(admin)
    const ana = await pedirEcd(s.esc, 'u-ana', await documentoEcd(admin, s))
    const bruno = await pedirEcd(s.esc, 'u-bruno', await documentoEcd(admin, s))
    expect(ana.execucao_id).not.toBe(bruno.execucao_id)
    const [ea, eb] = await Promise.all([
      esperar(() => estado(s.esc, ana.execucao_id), (e) => e.estado === 'aguardando_cartao'),
      esperar(() => estado(s.esc, bruno.execucao_id), (e) => e.estado === 'aguardando_cartao'),
    ])
    const envios = h.sped.envios
    h.sped.atraso_ms = 300
    await Promise.all([
      h.registro.chamar(ana.ctx, 'aprovacao.decidir', { cartao_id: ea.cartao_id, decisao: 'aprovar' }),
      h.registro.chamar(bruno.ctx, 'aprovacao.decidir', { cartao_id: eb.cartao_id, decisao: 'aprovar' }),
    ])
    const [fa, fb] = await Promise.all([
      esperar(() => estado(s.esc, ana.execucao_id), (e) => e.estado === 'concluida', 40_000),
      esperar(() => estado(s.esc, bruno.execucao_id), (e) => e.estado === 'concluida', 40_000),
    ])
    h.sped.atraso_ms = 0
    expect(h.sped.envios).toBe(envios + 1)
    expect(fa.saida.recibo).toBe(fb.saida.recibo)
    expect([fa.saida.ja_entregue_por, fb.saida.ja_entregue_por].filter(Boolean)).toHaveLength(1)
    expect(await contar(admin, 'entrega_obrigacao', { escritorio_id: s.esc })).toBe(1)
  })

  it('sem contas atípicas, nenhum modelo é chamado', async () => {
    const s = await semear(admin)
    const { execucao_id } = await pedirEcd(s.esc, 'u-ana', await documentoEcd(admin, s, { sem_atipicas: true }))
    await esperar(() => estado(s.esc, execucao_id), (e) => e.estado === 'aguardando_cartao')
    expect(await contar(admin, 'chamada_modelo', { execucao_id })).toBe(0)
  })

  it('operário que erra é conferido pelo validador e escala uma vez ao escritor', async () => {
    const s = await semear(admin)
    h.fornecedor.responder('ctb.ecd.apontar_atencao', (e: { contas_atipicas: { conta_codigo: string }[] }, p) =>
      p.classe === 'operario'
        ? { apontamentos: [{ conta_codigo: '9.9.99', motivo: 'Conta inventada.' }] }
        : { apontamentos: [{ conta_codigo: e.contas_atipicas[0]!.conta_codigo, motivo: 'Variação forte; conferir fechamento.' }] },
    )
    const { execucao_id } = await pedirEcd(s.esc, 'u-ana', await documentoEcd(admin, s))
    const ex = await esperar(() => estado(s.esc, execucao_id), (e) => e.estado === 'aguardando_cartao')
    const chamadas = await admin`select classe, saida_valida from chamada_modelo where execucao_id = ${execucao_id} order by criado_em`
    expect(chamadas.map((c) => c.classe)).toEqual(['operario', 'escritor'])
    // O escritor recebeu a falha do validador.
    const ultimo = h.fornecedor.chamadas.at(-1)!
    expect(ultimo.falha_anterior?.[0]?.codigo).toBe('CONTA_FORA_DAS_CANDIDATAS')
    const [c] = await admin`select tipo from cartao_aprovacao where id = ${ex.cartao_id}`
    expect(c!.tipo).toBe('aprovacao')
  })

  it('erro de novo vira cartão "não consegui"; a resposta da pessoa passa pelos mesmos validadores', async () => {
    const s = await semear(admin)
    h.fornecedor.responder('ctb.ecd.apontar_atencao', () => ({ apontamentos: [{ conta_codigo: '1.1.01', motivo: 'Subiu 100% em 2025.' }] }))
    const { ctx, execucao_id } = await pedirEcd(s.esc, 'u-ana', await documentoEcd(admin, s))
    const ex = await esperar(() => estado(s.esc, execucao_id), (e) => e.estado === 'aguardando_cartao')
    const [c] = await admin`select * from cartao_aprovacao where id = ${ex.cartao_id}`
    expect(c!.tipo).toBe('nao_consegui')
    expect(await contar(admin, 'chamada_modelo', { execucao_id })).toBe(2)
    // Resposta com número é recusada pelo mesmo validador e volta como "não consegui".
    await h.registro.chamar(ctx, 'aprovacao.decidir', { cartao_id: c!.id, decisao: 'editar', argumentos_editados: { apontamentos: [] } })
    const ex2 = await esperar(() => estado(s.esc, execucao_id), (e) => e.estado === 'aguardando_cartao' && e.cartao_id !== c!.id)
    const [c2] = await admin`select tipo from cartao_aprovacao where id = ${ex2.cartao_id}`
    expect(c2!.tipo).toBe('aprovacao')
    h.fornecedor.responder('ctb.ecd.apontar_atencao', (e: { contas_atipicas: { conta_codigo: string }[] }) => ({
      apontamentos: e.contas_atipicas.slice(0, 2).map((x) => ({ conta_codigo: x.conta_codigo, motivo: 'Variação forte no ano; conferir lançamentos de fechamento.' })),
    }))
  })

  it('sem saldo na bolsa do setor, nenhum modelo é chamado: a execução para em parcial com cartão', async () => {
    const s = await semear(admin, { bolsa_centavos: 0 })
    const antes = h.fornecedor.chamadas.length
    const { execucao_id } = await pedirEcd(s.esc, 'u-ana', await documentoEcd(admin, s))
    const ex = await esperar(() => estado(s.esc, execucao_id), (e) => e.estado === 'parcial')
    expect(ex.erro.codigo).toBe('BOLSA_SEM_SALDO')
    expect(h.fornecedor.chamadas.length).toBe(antes)
    const [c] = await admin`select * from cartao_aprovacao where id = ${ex.cartao_id}`
    expect(c!.tipo).toBe('orcamento')
    expect(c!.pode_aprovar).toEqual(expect.arrayContaining(['u-admin', 'u-gestora']))
    expect(c!.pode_aprovar).not.toContain('u-ana')
    await admin`update bolsa_setor set saldo_centavos = 500 where escritorio_id = ${s.esc}`
    await h.registro.chamar(await pessoa(admin, s.esc, 'u-gestora'), 'aprovacao.decidir', { cartao_id: c!.id, decisao: 'aprovar' })
    await esperar(() => estado(s.esc, execucao_id), (e) => e.estado === 'aguardando_cartao')
    expect(await contar(admin, 'chamada_modelo', { execucao_id })).toBe(1)
  })
})

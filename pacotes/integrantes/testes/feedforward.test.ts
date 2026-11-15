import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { Sql } from '@heild/processos'
import { documento, esperar, lerExecucao, montar, pessoa, semear, sqlAdmin } from './ambiente.ts'
import { lerResposta, noFormato, resposta, RespostaPadraoV1 } from '../src/resposta.ts'

/**
 * Feedforward e lacunas (padrão da interface adotado pelo Enzo, 15/11/2026): o integrante mostra o
 * que supôs antes de agir, e deixa lacuna no que não sabe em vez de inventar.
 */

let admin: Sql
let h: Awaited<ReturnType<typeof montar>>

beforeAll(async () => {
  admin = sqlAdmin()
  h = await montar()
})
afterAll(async () => {
  await h.parar()
  await admin.end()
})

const de = { tipo: 'integrante' as const, id: 'i-dp', setor: 'dp', nome: 'DP' }
const origem = { procedimento: 'DP-EVENTO-FOLHA@2', execucao_id: 'e-1', pedido_id: null, posicao_na_fila: null }

describe('heild.resposta@2', () => {
  it('traz suposições e lacunas; a lacuna aparece no texto como "[rótulo]", com a posição', () => {
    const r = resposta({
      de,
      origem,
      tipo: 'nao_consegui',
      titulo: 'Evento de folha: falta uma decisão',
      resumo: 'Para lançar hora extra é preciso a quantidade.',
      suposicoes: [{ campo: 'tipo_evento', rotulo: 'Tipo de evento', valor: 'hora_extra', tipo: 'categoria', opcoes: [{ valor: 'hora_extra', rotulo: 'hora_extra' }], origem: 'modelo', confianca: 0.95 }],
      lacunas: [{ id: 'quantidade', campo: 'quantidade', rotulo: 'Quantidade', tipo: 'quantidade', posicao: null, opcoes: [] }],
    })
    expect(r.formato).toBe('heild.resposta@2')
    expect(r.texto).toContain('Falta: [Quantidade].')
    const l = r.lacunas[0]!
    expect(r.texto.slice(l.posicao!.inicio, l.posicao!.fim)).toBe('[Quantidade]')
  })

  it('compatível com a @1: lê a @1 como @2 vazia e entrega @1 a quem pede', () => {
    const v2 = resposta({ de, origem, tipo: 'concluido', titulo: 'Evento lançado' })
    const v1 = noFormato(v2, 'heild.resposta@1')
    expect(RespostaPadraoV1.parse(v1)).toMatchObject({ formato: 'heild.resposta@1', titulo: 'Evento lançado' })
    expect(v1).not.toHaveProperty('suposicoes')
    expect(lerResposta(v1)).toEqual({ ...v2, suposicoes: [], lacunas: [] })
  })
})

describe('assistente.prever_suposicoes (antes de pedir, sem executar)', () => {
  it('por regra, sem modelo: procedimento, setor, cliente, documento e a competência do texto; o que falta anexar vira lacuna', async () => {
    const s = await semear(admin)
    const ana = await pessoa(admin, s.esc, 'u-ana')
    const doc = await documento(admin, s, 'mensagem', { texto_extraido: 'Recibo.' })
    const r = await h.registro.chamar(ana, 'assistente.prever_suposicoes', { texto: 'Classifique a competência deste recibo, referente a 10/2026.', anexos: { cliente_id: 'c-1', documento_id: doc } })
    expect(r).toMatchObject({ resultado: 'ok' })
    const p = (r as { dados: any }).dados
    expect(p.procedimento).toMatchObject({ id: 'CTB-COMPETENCIA-DOC', setor: 'contabil', origem: 'regra', confianca: 1 })
    expect(p.custo).toEqual({ centavos: 0, chamadas: 0 })
    const campos = Object.fromEntries(p.suposicoes.map((x: { campo: string }) => [x.campo, x]))
    expect(campos.cliente_id).toMatchObject({ valor: 'c-1', origem: 'pedido', opcoes: [{ valor: 'c-1', rotulo: 'Padaria Exemplo Ltda' }] })
    expect(campos.competencia).toMatchObject({ valor: '2026-10', tipo: 'competencia', origem: 'regra', opcoes: [{ valor: '2026-10', rotulo: '10/2026' }] })
    expect(p.lacunas).toEqual([])
    // Nada foi aberto: nem pedido, nem execução.
    expect(await admin`select 1 from pedido_assistente where escritorio_id = ${s.esc}`).toHaveLength(0)
    expect(await admin`select 1 from execucao where escritorio_id = ${s.esc}`).toHaveLength(0)

    const semAnexo = (await h.registro.chamar(ana, 'assistente.prever_suposicoes', { texto: 'Classifique a competência deste recibo.' })) as { dados: any }
    expect(semAnexo.dados.lacunas.map((l: { campo: string }) => l.campo)).toEqual(['cliente_id', 'documento_id'])
  })

  it('sem regra: o barato decide (nunca o caro); o mesmo texto não paga de novo; texto curto não chama modelo', async () => {
    const s = await semear(admin)
    const ana = await pessoa(admin, s.esc, 'u-ana')
    const doc = await documento(admin, s, 'mensagem', { texto_extraido: 'O Pedro fez 10 horas extras em 10/2026.' })
    const texto = 'Ele trabalhou além do horário no sábado; isso entra no pagamento do mês.'
    const r1 = (await h.registro.chamar(ana, 'assistente.prever_suposicoes', { texto, anexos: { cliente_id: 'c-1', documento_id: doc } })) as { dados: any }
    expect(r1.dados.procedimento).toMatchObject({ id: 'DP-EVENTO-FOLHA', origem: 'modelo' })
    expect(r1.dados.custo.chamadas).toBe(1)
    const [b1] = await admin`select gasto_centavos from bolsa_setor where escritorio_id = ${s.esc} and setor = 'assistente'`
    const r2 = (await h.registro.chamar(ana, 'assistente.prever_suposicoes', { texto, anexos: { cliente_id: 'c-1', documento_id: doc } })) as { dados: any }
    expect(r2.dados).toEqual(r1.dados)
    const [b2] = await admin`select gasto_centavos from bolsa_setor where escritorio_id = ${s.esc} and setor = 'assistente'`
    expect(Number(b2!.gasto_centavos)).toBe(Number(b1!.gasto_centavos))
    const curto = (await h.registro.chamar(ana, 'assistente.prever_suposicoes', { texto: 'oi' })) as { dados: any }
    expect(curto.dados).toMatchObject({ procedimento: null, custo: { chamadas: 0 } })
    const semModelo = (await h.registro.chamar(ana, 'assistente.prever_suposicoes', { texto, usar_modelo: false })) as { dados: any }
    expect(semModelo.dados).toMatchObject({ procedimento: null, custo: { chamadas: 0 } })
  })
})

describe('suposições na resposta e lacuna que retoma o rascunho', () => {
  it('a resposta mostra o que foi suposto; o "não consegui" vira lacuna; preencher retoma do ponto em que parou', async () => {
    const s = await semear(admin, { executa_sozinho: ['DP-EVENTO-FOLHA'] })
    const ana = await pessoa(admin, s.esc, 'u-ana')
    const doc = await documento(admin, s, 'mensagem', { texto_extraido: 'O Jorge fez horas extras em 10/2026, mas ainda não sei quantas.' })
    const r0 = await h.assistente.pedir(ana, { texto: 'Lance a hora extra do Jorge na folha.', anexos: { cliente_id: 'c-1', documento_id: doc } })
    const obter = () => h.registro.chamar(ana, 'assistente.obter', { pedido_id: r0.pedido_id }) as Promise<{ resultado: string; dados: any }>
    const parado = await esperar(obter, (x) => x.dados.resposta.tipo === 'nao_consegui', 60_000)
    const r = parado.dados.resposta
    expect(r.formato).toBe('heild.resposta@2')
    // Feedforward: o destino (regra), o cliente, o tipo e a competência propostos, com as opções lidas do texto.
    const campos = Object.fromEntries(r.suposicoes.map((x: { campo: string }) => [x.campo, x]))
    // O destino suposto vai ao lado da resposta (que segue sem reescrever).
    expect(parado.dados.suposicao_de_rota).toMatchObject({ campo: 'procedimento', valor: 'DP-EVENTO-FOLHA', origem: 'regra' })
    expect(campos.procedimento).toBeUndefined()
    expect(campos.tipo_evento).toMatchObject({ valor: 'hora_extra', origem: 'modelo', confianca: 0.95 })
    expect(campos.competencia).toMatchObject({ valor: '2026-10', opcoes: [{ valor: '2026-10', rotulo: '10/2026' }] })
    // Lacuna: a quantidade que o validador apontou, sem inventar.
    expect(r.lacunas).toEqual([expect.objectContaining({ id: 'quantidade', campo: 'quantidade', tipo: 'quantidade' })])
    expect(r.texto.slice(r.lacunas[0].posicao.inicio, r.lacunas[0].posicao.fim)).toBe('[Quantidade]')
    // Quem ainda lê a @1 recebe a @1.
    const v1 = (await h.registro.chamar(ana, 'assistente.obter', { pedido_id: r0.pedido_id, formato: 'heild.resposta@1' })) as { dados: any }
    expect(v1.dados.resposta.formato).toBe('heild.resposta@1')

    // Só os campos do rascunho; a confiança não é lacuna.
    expect(await h.registro.chamar(ana, 'assistente.preencher_lacuna', { pedido_id: r0.pedido_id, valores: { confianca: 1 } })).toMatchObject({ resultado: 'erro' })
    const env = await h.registro.chamar(ana, 'assistente.preencher_lacuna', { pedido_id: r0.pedido_id, valores: { quantidade: '12' } })
    expect(env).toMatchObject({ resultado: 'ok', dados: { estado: 'executando' } })
    const fim = await esperar(obter, (x) => x.dados.resposta.tipo === 'concluido', 60_000)
    expect(fim.dados.resposta.dados).toMatchObject({ tipo_evento: 'hora_extra', competencia: '2026-10', quantidade: '12' })
    // Quem preencheu fica no cartão, com os argumentos editados; o operário não foi chamado de novo.
    const ex = await lerExecucao(admin, s.esc, parado.dados.resposta.origem.execucao_id)
    const [c] = await admin`select status, decidido_por, comentario, argumentos from cartao_aprovacao where execucao_id = ${ex.id} and tipo = 'nao_consegui'`
    expect(c).toMatchObject({ status: 'editado_e_aprovado', decidido_por: 'u-ana', comentario: 'Lacuna preenchida: quantidade' })
    expect(c!.argumentos).toMatchObject({ quantidade: '12', tipo_evento: 'hora_extra', confianca: 1 })
    expect(c!.argumentos).not.toHaveProperty('modelo')
    const supFinal = Object.fromEntries(fim.dados.resposta.suposicoes.map((x: { campo: string }) => [x.campo, x]))
    expect(supFinal.quantidade).toMatchObject({ valor: '12', origem: 'pessoa', confianca: null })
    // Sem lacuna esperando, preencher é recusado.
    expect(await h.registro.chamar(ana, 'assistente.preencher_lacuna', { pedido_id: r0.pedido_id, valores: { quantidade: '1' } })).toMatchObject({ resultado: 'erro', codigo: 'SEM_LACUNA' })
  })
})

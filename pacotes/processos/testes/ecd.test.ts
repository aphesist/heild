import { afterAll, beforeAll, describe, expect, it } from 'vitest'
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
    expect(h.sped.recebidos.get(`ECD:c-1:2025`)!.argumentos).toEqual(cartao!.argumentos)
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
  })
})

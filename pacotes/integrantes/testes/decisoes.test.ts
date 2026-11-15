import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { comEscritorio, type Sql } from '@heild/processos'
import { esperar, montar, pessoa, semear, sqlAdmin, type Semente } from './ambiente.ts'
import { prefixoDeQuemFala } from '../src/identificacao.ts'

/**
 * Gatilho 18: a pessoa recusa ou altera no cartão o que o integrante pediu (evento `aprovacao.decidir`
 * do executor, B5) → o integrante é acordado e, com comentário, propõe a lição como memória do setor.
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

/** Um cartão do executor (sem execução do motor), pedido pelo integrante do Fiscal e já decidido. */
async function decidido(s: Semente, o: { status: string; comentario?: string; diferenca?: Record<string, { de: unknown; para: unknown }>; execucao_id?: string; pedido_por_tipo?: string }) {
  const ctx = await pessoa(admin, s.esc, 'u-fiscal')
  return comEscritorio(admin, s.esc, async (tx) => {
    const [c] = await tx`
      insert into cartao_aprovacao (escritorio_id, ferramenta, argumentos, resumo_humano, pedido_por_tipo, pedido_por_id, usuario_dono_id, pode_aprovar, status, decidido_por, decidido_em, comentario, execucao_id, tipo)
      values (${s.esc}, 'fiscal.guia.enviar', ${tx.json({ tributo: 'DAS', competencia: '2026-11' } as never)}, 'Enviar a guia do DAS de 11/2026.', ${o.pedido_por_tipo ?? 'integrante'}, ${o.pedido_por_tipo === 'usuario' ? 'u-ana' : 'i-fiscal'}, 'u-fiscal', ${['u-fiscal']},
        ${o.status}, 'u-fiscal', now(), ${o.comentario ?? null}, ${o.execucao_id ?? null}, 'aprovacao')
      returning id`
    // O evento como o executor (B5) grava: aprovacao_id aponta o cartão e a diferença vai no resumo.
    const evento_id = await h.eventos.gravar(tx, ctx, {
      nome: 'aprovacao.decidir', ferramenta: 'fiscal.guia.enviar', nivel: 'executar', resultado: o.status === 'recusado' ? 'recusado' : 'aprovado',
      texto: `Fábio ${o.status === 'recusado' ? 'recusou' : 'aprovou com alterações'}: Enviar a guia do DAS.`, aprovacao_id: c!.id, resultado_ref: c!.id,
      argumentos_resumo: o.diferenca ? { diferenca: o.diferenca } : {},
    })
    return { cartao_id: c!.id as string, evento_id }
  })
}

const itens = (esc: string, tipo: string) => admin`select integrante_id, resumo from item_fila where escritorio_id = ${esc} and tipo = ${tipo}`
const memorias = (esc: string) => admin`select argumentos, resumo_humano, pedido_por_tipo, pedido_por_id, pode_aprovar from cartao_aprovacao where escritorio_id = ${esc} and tipo = 'memoria'`

describe('gatilho 18: decisão de pessoa sobre o pedido do integrante', () => {
  it('alterado com comentário: o integrante é acordado com a diferença e propõe a lição como memória (cartão para quem gere)', async () => {
    const s = await semear(admin)
    const { cartao_id, evento_id } = await decidido(s, { status: 'editado_e_aprovado', comentario: 'Para este cliente, a guia vai sempre com o vencimento de dezembro.', diferenca: { competencia: { de: '2026-11', para: '2026-12' } } })
    const [item] = await esperar(() => itens(s.esc, 'aprovacao_editada'), (x) => x.length > 0)
    expect(item).toMatchObject({ integrante_id: 'i-fiscal', resumo: { cartao_id, ferramenta: 'fiscal.guia.enviar', status: 'editado_e_aprovado', diferenca: { competencia: { de: '2026-11', para: '2026-12' } }, decidido_por: 'u-fiscal', evento_id } })
    const [m] = await esperar(() => memorias(s.esc), (x) => x.length > 0)
    expect(m).toMatchObject({ pedido_por_tipo: 'integrante', pedido_por_id: 'i-fiscal', argumentos: { setor: 'fiscal', valor: { comentario: 'Para este cliente, a guia vai sempre com o vencimento de dezembro.', decisao: 'editado_e_aprovado' } } })
    expect(m!.argumentos.chave).toMatch(/^licao:fiscal\.guia\.enviar:/)
    expect(m!.resumo_humano).toContain('alterou fiscal.guia.enviar e explicou')
    // O mesmo evento de novo (o job pode repetir): nada duplica.
    await h.despachante.despachar({ escritorio_id: s.esc, evento_id })
    expect(await itens(s.esc, 'aprovacao_editada')).toHaveLength(1)
    expect(await memorias(s.esc)).toHaveLength(1)
  })

  it('recusado sem comentário: acorda o integrante (a recusa também chega ao despachante), sem proposta de memória', async () => {
    const s = await semear(admin)
    await decidido(s, { status: 'recusado' })
    const [item] = await esperar(() => itens(s.esc, 'aprovacao_recusada'), (x) => x.length > 0)
    expect(item).toMatchObject({ integrante_id: 'i-fiscal', resumo: { status: 'recusado', comentario: null, diferenca: null } })
    await new Promise((r) => setTimeout(r, 1500))
    expect(await memorias(s.esc)).toHaveLength(0)
  })

  it('aprovado sem alteração, cartão do motor ou pedido de pessoa: não acorda ninguém por aqui', async () => {
    const s = await semear(admin)
    await decidido(s, { status: 'aprovado' })
    await decidido(s, { status: 'recusado', execucao_id: 'ex-do-motor' })
    await decidido(s, { status: 'recusado', pedido_por_tipo: 'usuario' })
    await new Promise((r) => setTimeout(r, 2000))
    expect(await itens(s.esc, 'aprovacao_recusada')).toHaveLength(0)
    expect(await itens(s.esc, 'aprovacao_editada')).toHaveLength(0)
  })

  it('ao cliente, o integrante aparece com "(IA)", mesmo que o servidor o marque com " (integrante)"', () => {
    expect(prefixoDeQuemFala({ tipo: 'integrante', nome: 'Atendimento (integrante)' })).toBe('*Atendimento (IA)*')
  })
})

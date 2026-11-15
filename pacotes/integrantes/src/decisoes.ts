import { createHash } from 'node:crypto'
import { comEscritorio, contextoDeIntegrante, ErroRegra, proporMemoria, type BaseExtensao, type ObservadorEvento } from '@heild/processos'

/**
 * Gatilho 18 (subplano 02): quando uma pessoa RECUSA ou ALTERA no cartão o que um integrante pediu, o
 * integrante é acordado com o que aconteceu (item na fila dele, com o comentário e a diferença
 * campo a campo) e, se a pessoa explicou no comentário, o integrante propõe guardar a lição na
 * memória do setor (cartão para quem gere aprovar; nada muda sozinho).
 *
 * Lê o evento `aprovacao.decidir` do executor (B5): `aprovacao_id` (ou `resultado_ref`) aponta o
 * cartão, e `argumentos_resumo.diferenca` traz {campo: {de, para}}. Os cartões das execuções do motor
 * já acordam o integrante pelo próprio motor; os de memória não são de integrante.
 */
export function observadorDeDecisoes(b: BaseExtensao): ObservadorEvento {
  return {
    evento: 'aprovacao.decidir',
    executar: async ({ escritorio_id, evento }) => {
      const cartao_id = evento.aprovacao_id ?? evento.resultado_ref
      if (!cartao_id) return
      const achado = await comEscritorio(b.sql, escritorio_id, async (tx) => {
        const [c] = await tx`select id, ferramenta, status, comentario, decidido_por, pedido_por_tipo, pedido_por_id, execucao_id, tipo from cartao_aprovacao where id = ${cartao_id}`
        if (!c || c.execucao_id || c.tipo === 'memoria' || c.pedido_por_tipo !== 'integrante' || !c.pedido_por_id) return null
        if (c.status !== 'recusado' && c.status !== 'editado_e_aprovado') return null
        const [integ] = await tx`select id, setor from integrante where id = ${c.pedido_por_id}`
        if (!integ) return null
        const diferenca = ((evento.argumentos_resumo ?? {}) as { diferenca?: Record<string, { de: unknown; para: unknown }> }).diferenca ?? null
        const tipo = c.status === 'recusado' ? 'aprovacao_recusada' : 'aprovacao_editada'
        // Idempotente: o mesmo evento acorda uma vez só.
        const [ja] = await tx`select 1 from item_fila where integrante_id = ${integ.id} and resumo->>'evento_id' = ${evento.id} limit 1`
        if (!ja)
          await tx`insert into item_fila (escritorio_id, integrante_id, tipo, status, enfileirado_em, prioridade, resumo, causado_por_evento_id)
                   values (${escritorio_id}, ${integ.id}, ${tipo}, 'pendente', now(), 40,
                   ${tx.json({ cartao_id: c.id, ferramenta: c.ferramenta, status: c.status, comentario: c.comentario ?? null, diferenca, decidido_por: c.decidido_por, evento_id: evento.id } as never)},
                   ${evento.id})`
        return { c, integ, diferenca }
      })
      const comentario = String(achado?.c.comentario ?? '').trim()
      if (!achado || comentario.length < 3) return
      // Aprendizado pelo comentário: proposta de memória do setor, para quem gere aprovar.
      const assinatura = createHash('sha256').update(`${achado.c.ferramenta}:${comentario}`).digest('hex').slice(0, 16)
      const chave = `licao:${achado.c.ferramenta}:${assinatura}`
      const [pendente] = await comEscritorio(b.sql, escritorio_id, (tx) => tx`select 1 from cartao_aprovacao where tipo = 'memoria' and argumentos->>'chave' = ${chave} limit 1`)
      if (pendente) return
      const ctx = await comEscritorio(b.sql, escritorio_id, (tx) => contextoDeIntegrante(tx, escritorio_id, achado.integ.id as string, 'evento'))
      const acao = achado.c.status === 'recusado' ? 'recusou' : 'alterou'
      try {
        await proporMemoria(b.sql, b.eventos, ctx, {
          setor: achado.integ.setor as string,
          chave,
          valor: { ferramenta: achado.c.ferramenta, decisao: achado.c.status, comentario, diferenca: achado.diferenca, cartao_id: achado.c.id, decidido_por: achado.c.decidido_por },
          motivo: `Uma pessoa ${acao} ${achado.c.ferramenta} e explicou: "${comentario.slice(0, 200)}". Guardar para os próximos pedidos iguais.`,
        })
      } catch (e) {
        // Sem quem possa aprovar memória no setor: o integrante já foi acordado; a lição fica no item.
        if (!(e instanceof ErroRegra)) throw e
      }
    },
  }
}

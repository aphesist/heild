import type { PgBoss } from 'pg-boss'
import type { Sql } from './banco.ts'
import { comEscritorio } from './banco.ts'
import { contextoDeIntegrante, integranteDoSetor, type ContextoExec } from './contexto.ts'
import { FILAS } from './fila.ts'
import type { Motor } from './motor/motor.ts'

/**
 * Despachante (AGENTICO 12, encaixe 7). Cada evento gravado enfileira `evento.despachar` na mesma
 * transação; aqui ele casa com os gatilhos do escritório, roda a checagem sem modelo e, quando o
 * gatilho aponta para um procedimento, inicia a execução DIRETO. O integrante não é acordado para
 * isso: só recebe `execucao_concluida` se houver algo a dizer.
 *
 * Evento repetido não abre execução repetida: a chave de idempotência é (evento, gatilho).
 */
export class Despachante {
  constructor(
    private readonly sql: Sql,
    private readonly boss: PgBoss,
    private readonly motor: Motor,
  ) {}

  async despachar(job: { escritorio_id: string; evento_id: string }) {
    const pedidos = await comEscritorio(this.sql, job.escritorio_id, async (tx) => {
      const [ev] = await tx`select id, nome, cliente_id, argumentos_resumo, resultado_ref, execucao_id from evento where id = ${job.evento_id}`
      if (!ev) return []
      const gatilhos = await tx`
        select id, procedimento_id, setor, filtro, perguntar_responsavel from gatilho
        where ativo and evento_nome = ${ev.nome} and coalesce(${tx.json((ev.argumentos_resumo ?? {}) as never)}::jsonb, '{}'::jsonb) @> filtro
        order by id`
      const saida: { gatilho: (typeof gatilhos)[number]; entrada: unknown; ctx: ContextoExec }[] = []
      for (const g of gatilhos) {
        const p = this.motor.atual(g.procedimento_id)
        if (!p.gatilho || p.gatilho.evento !== ev.nome) continue
        const entrada = p.gatilho.entrada(ev as never)
        if (!entrada) continue
        if (p.gatilho.condicao && !(await p.gatilho.condicao(tx, entrada))) continue
        const integrante_id = await integranteDoSetor(tx, p.setor)
        const ctx: ContextoExec = integrante_id
          ? await contextoDeIntegrante(tx, job.escritorio_id, integrante_id, 'evento')
          : { escritorio_id: job.escritorio_id, origem: 'evento', ator: { tipo: 'sistema', nome: 'Despachante' } }
        saida.push({ gatilho: g, entrada, ctx })
      }
      return saida
    })
    for (const { gatilho, entrada, ctx } of pedidos) {
      await this.motor.iniciar(ctx, gatilho.procedimento_id, entrada, {
        chave_idempotencia: `evento:${job.evento_id}:${gatilho.id}`,
        causado_por_evento_id: job.evento_id,
        perguntar_responsavel: gatilho.perguntar_responsavel,
      })
    }
  }

  async iniciarWorker(intervalo = 0.5) {
    await this.boss.work<{ escritorio_id: string; evento_id: string }>(FILAS.despachar, { pollingIntervalSeconds: intervalo, localConcurrency: 2 }, async (jobs) => {
      for (const j of jobs) await this.despachar(j.data)
    })
  }
}

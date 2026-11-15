import type { Tx } from '../banco.ts'
import { ErroRegra } from '../contexto.ts'
import { arredondarCentavos } from './fornecedor.ts'

/** Orçamento estourado: o passo para, a execução fica `parcial` e nasce um cartão (AGENTICO 4.3). */
export class ErroOrcamento extends ErroRegra {}

export interface ExecucaoPagadora {
  id: string
  escritorio_id: string
  setor: string
  pagador_tipo: 'bolsa_setor' | 'usuario'
  pagador_id: string | null
  sombra?: boolean
}

/** A bolsa do piloto: o modo sombra mede às custas dela, nunca da bolsa do setor (B3b). */
export const BOLSA_PILOTO = 'piloto'

/**
 * A bolsa que paga: a do setor (padrão, decisão 5) ou a da pessoa responsável, se o escritório
 * configurar. A sombra (piloto automatizado) paga com a bolsa própria do piloto: medir não gasta
 * o dinheiro de operar.
 */
export const bolsaDe = (ex: ExecucaoPagadora) =>
  ex.sombra ? BOLSA_PILOTO : ex.pagador_tipo === 'usuario' && ex.pagador_id ? `pessoa:${ex.pagador_id}` : ex.setor

const MES = `to_char(now() at time zone 'America/Sao_Paulo', 'YYYY-MM')`

/**
 * Confere e reserva ANTES da chamada: orçamento da execução (centavos e tokens) e saldo da bolsa
 * do mês. A reserva é atômica (update condicional), então duas chamadas em paralelo não gastam o
 * mesmo saldo. A mesma chave reaproveita a reserva numa retentativa (o runner caiu no meio).
 */
export async function reservar(tx: Tx, ex: ExecucaoPagadora, chave: string, estimativa: { centavos: number; tokens: number }) {
  const [ja] = await tx`select centavos, tokens, bolsa_setor, bolsa_mes from reserva_orcamento where chave = ${chave}`
  if (ja) return ja
  const [exec] = await tx`
    update execucao set gasto_centavos = gasto_centavos + ${estimativa.centavos}::numeric, gasto_tokens = gasto_tokens + ${estimativa.tokens}
    where id = ${ex.id} and gasto_centavos + ${estimativa.centavos}::numeric <= orcamento_centavos and gasto_tokens + ${estimativa.tokens} <= orcamento_tokens
    returning id`
  if (!exec) throw new ErroOrcamento('ORCAMENTO_EXECUCAO', 'O orçamento desta execução acabou antes da próxima chamada de modelo.')
  const bolsa = bolsaDe(ex)
  const [b] = await tx.unsafe(
    `update bolsa_setor set gasto_centavos = gasto_centavos + $1::numeric
     where setor = $2 and mes = ${MES} and gasto_centavos + $1::numeric <= saldo_centavos returning mes`,
    [estimativa.centavos, bolsa],
  )
  if (!b) throw new ErroOrcamento('BOLSA_SEM_SALDO', `A bolsa ${bolsa.startsWith('pessoa:') ? 'da pessoa responsável' : bolsa === BOLSA_PILOTO ? 'do piloto' : `do setor ${bolsa}`} não tem saldo para a próxima chamada de modelo.`)
  await tx`insert into reserva_orcamento (escritorio_id, chave, execucao_id, bolsa_setor, bolsa_mes, centavos, tokens)
           values (${ex.escritorio_id}, ${chave}, ${ex.id}, ${bolsa}, ${b.mes}, ${estimativa.centavos}, ${estimativa.tokens})`
  return { centavos: estimativa.centavos, tokens: estimativa.tokens, bolsa_setor: bolsa, bolsa_mes: b.mes }
}

/**
 * Acerta pelo custo real: devolve à bolsa e à execução a diferença da reserva e grava a
 * `chamada_modelo` (única pela chave: retentativa não debita duas vezes).
 */
export async function acertar(
  tx: Tx,
  ex: ExecucaoPagadora,
  chave: string,
  real: { centavos: number; tokens: number },
  chamada: {
    passo_ordem: number
    tentativa: number
    contrato: string
    contrato_versao: number
    classe: string
    fornecedor: string
    modelo: string
    tokens_entrada: number
    tokens_saida: number
    tokens_cache: number
    latencia_ms: number
    saida_valida: boolean
    erro_validacao: unknown
  },
) {
  const [r] = await tx`delete from reserva_orcamento where chave = ${chave} returning centavos, tokens, bolsa_setor, bolsa_mes`
  if (!r) throw new Error(`Reserva de orçamento não encontrada: ${chave}`)
  // A estimativa é um teto (entrada inteira + saída máxima); se o real passar, a diferença é cobrada
  // de forma condicional ao saldo, como a reserva.
  const dc = arredondarCentavos(r.centavos - real.centavos)
  const dt = r.tokens - real.tokens
  const [b] = await tx`update bolsa_setor set gasto_centavos = gasto_centavos - ${dc}::numeric
                       where setor = ${r.bolsa_setor} and mes = ${r.bolsa_mes} and gasto_centavos - ${dc}::numeric <= saldo_centavos returning 1 as ok`
  const [e] = await tx`update execucao set gasto_centavos = gasto_centavos - ${dc}::numeric, gasto_tokens = greatest(0, gasto_tokens - ${dt})
                       where id = ${ex.id} and gasto_centavos - ${dc}::numeric <= orcamento_centavos returning 1 as ok`
  if (!b || !e) throw new ErroOrcamento('ORCAMENTO_EXECUCAO', 'O custo real passou do orçamento reservado.')
  await tx`
    insert into chamada_modelo (escritorio_id, chave, execucao_id, passo_ordem, tentativa, contrato, contrato_versao, classe, fornecedor, modelo,
      tokens_entrada, tokens_saida, tokens_cache, centavos, latencia_ms, saida_valida, erro_validacao, setor, pagador_tipo, pagador_id)
    values (${ex.escritorio_id}, ${chave}, ${ex.id}, ${chamada.passo_ordem}, ${chamada.tentativa}, ${chamada.contrato}, ${chamada.contrato_versao},
      ${chamada.classe}, ${chamada.fornecedor}, ${chamada.modelo}, ${chamada.tokens_entrada}, ${chamada.tokens_saida}, ${chamada.tokens_cache},
      ${real.centavos}, ${chamada.latencia_ms}, ${chamada.saida_valida}, ${chamada.erro_validacao === null ? null : tx.json(chamada.erro_validacao as never)},
      ${ex.setor}, ${ex.pagador_tipo}, ${ex.pagador_id})`
}

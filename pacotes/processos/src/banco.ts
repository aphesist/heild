import postgres from 'postgres'
import { createHash } from 'node:crypto'

export type Sql = postgres.Sql
/** Transação já presa a um escritório (RLS) e ao papel `api_executor`. */
export type Tx = postgres.TransactionSql

export function conectar(url = process.env.DATABASE_URL ?? 'postgres://postgres@127.0.0.1:54329/heild_b2', max = 10): Sql {
  return postgres(url, {
    max,
    onnotice: () => {},
    // jsonb volta como objeto; bigint como número (contadores pequenos).
    types: { bigint: postgres.BigInt },
    transform: { undefined: null },
  })
}

/**
 * O papel de escrita da B1 (migração 20261115200000_backend_b1.sql): sem BYPASSRLS; `anon` e
 * `authenticated` só leem. O motor grava com ele, como o executor da API.
 */
export const PAPEL_ESCRITA = 'api_executor'

/** Tempo máximo de uma consulta, de espera por trava e de transação parada (configurável por ambiente). */
export const LIMITES_TX = {
  // Os mesmos tetos da API (docs/backend/PADROES.md). Chamada a modelo e a órgão nunca roda com transação aberta.
  consulta: process.env.HEILD_TX_CONSULTA ?? '5s',
  trava: process.env.HEILD_TX_TRAVA ?? '3s',
  ocioso: process.env.HEILD_TX_OCIOSO ?? '10s',
}

/**
 * Roda `fn` numa transação presa ao escritório: fixa `request.jwt.claims` e o papel
 * `api_executor` com SET LOCAL, como o executor da B1 (STACK 3.1). As políticas
 * (`escritorio_atual()`) valem sem mudança: uma execução nunca enxerga outro escritório.
 */
export async function comEscritorio<T>(sql: Sql, escritorio_id: string, fn: (tx: Tx) => Promise<T>): Promise<T> {
  if (!escritorio_id) throw new Error('Escritório obrigatório para abrir a transação.')
  const claims = JSON.stringify({ role: 'authenticated', app_metadata: { escritorio_id } })
  return (await sql.begin(async (tx) => {
    // Limites por transação: nenhuma consulta presa segura o worker nem a trava do efeito.
    await tx`select set_config('request.jwt.claims', ${claims}, true), set_config('role', ${PAPEL_ESCRITA}, true),
             set_config('statement_timeout', ${LIMITES_TX.consulta}, true), set_config('lock_timeout', ${LIMITES_TX.trava}, true),
             set_config('idle_in_transaction_session_timeout', ${LIMITES_TX.ocioso}, true)`
    return fn(tx)
  })) as T
}

/**
 * Adaptador do pg-boss para a transação atual: o job entra na MESMA transação do efeito e do
 * evento (o outbox é a própria fila, STACK 4). É a implementação de `enfileirarNaTransacao` que a B1 deixou combinada (servidor/src/executor/jobs.ts).
 */
export function bossNaTransacao(tx: Tx) {
  return {
    async executeSql(text: string, values: unknown[] = []) {
      // Roda com o papel da transação (api_executor), que recebeu só DML nas tabelas da fila (concederFila).
      const rows = await tx.unsafe(text, values as never[])
      return { rows: rows as unknown as any[] }
    },
  }
}

/** JSON canônico (chaves ordenadas): base do hash de entrada e de argumentos de cartão. */
export function canonico(v: unknown): string {
  if (v === null || typeof v !== 'object') return JSON.stringify(v ?? null)
  if (Array.isArray(v)) return `[${v.map(canonico).join(',')}]`
  const o = v as Record<string, unknown>
  return `{${Object.keys(o)
    .filter((k) => o[k] !== undefined)
    .sort()
    .map((k) => `${JSON.stringify(k)}:${canonico(o[k])}`)
    .join(',')}}`
}

export const hashDe = (v: unknown) => createHash('sha256').update(canonico(v)).digest('hex')

/** Trava curta por (setor, cliente, processo), só na transação do efeito (AGENTICO 4.6). */
export async function travarEfeito(tx: Tx, escritorio_id: string, setor: string, cliente_id: string | null, processo: string) {
  const chave = `${escritorio_id}|${setor}|${cliente_id ?? '-'}|${processo}`
  await tx`select pg_advisory_xact_lock(hashtextextended(${chave}, 0))`
}

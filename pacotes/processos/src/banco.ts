import postgres from 'postgres'
import { createHash } from 'node:crypto'

export type Sql = postgres.Sql
/** Transação já presa a um escritório (RLS) e ao papel `authenticated`. */
export type Tx = postgres.TransactionSql

export function conectar(url = process.env.DATABASE_URL ?? 'postgres://postgres@localhost:54329/heild', max = 10): Sql {
  return postgres(url, {
    max,
    onnotice: () => {},
    // jsonb volta como objeto; bigint como número (contadores pequenos).
    types: { bigint: postgres.BigInt },
    transform: { undefined: null },
  })
}

/**
 * Roda `fn` numa transação presa ao escritório: fixa `request.jwt.claims` e o papel
 * `authenticated` com SET LOCAL, como a API fará (STACK 3.1). As políticas atuais
 * (`escritorio_atual()`) valem sem mudança: uma execução nunca enxerga outro escritório.
 */
export async function comEscritorio<T>(sql: Sql, escritorio_id: string, fn: (tx: Tx) => Promise<T>): Promise<T> {
  if (!escritorio_id) throw new Error('Escritório obrigatório para abrir a transação.')
  const claims = JSON.stringify({ role: 'authenticated', app_metadata: { escritorio_id } })
  return (await sql.begin(async (tx) => {
    await tx`select set_config('request.jwt.claims', ${claims}, true)`
    await tx`set local role authenticated`
    return fn(tx)
  })) as T
}

/**
 * Adaptador do pg-boss para a transação atual: o job entra na MESMA transação do efeito e do
 * evento (o outbox é a própria fila, STACK 4). O esquema `pgboss` não é do papel do escritório,
 * então o SQL do pg-boss roda com o papel da conexão e volta ao `authenticated` em seguida.
 */
export function bossNaTransacao(tx: Tx) {
  return {
    async executeSql(text: string, values: unknown[] = []) {
      await tx`set local role none`
      try {
        const rows = await tx.unsafe(text, values as never[])
        return { rows: rows as unknown as any[] }
      } finally {
        await tx`set local role authenticated`
      }
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

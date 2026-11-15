import postgres from 'postgres'
import { config } from '../config.ts'

/**
 * Conexões com o Postgres.
 *
 * - `api`: o papel de login `app_api` (sem BYPASSRLS, sem privilégio em tabela). Toda
 *   transação de pedido fixa as claims do JWT e assume `api_executor` com uma ida só ao
 *   banco; as políticas `escritorio_atual()` das migrações valem sem mudança (STACK 3.1).
 * - `admin`: superusuário, só para migração, semente e testes. Nunca no caminho de um pedido.
 *
 * Tipos: datas e horas voltam como texto ISO (como o PostgREST entrega ao wireframe),
 * `bigint` como número (a versão de linha cabe com folga) e `bytea` como hexadecimal.
 */

export type Sql = postgres.Sql<Record<string, unknown>>
export type Tx = postgres.TransactionSql<Record<string, unknown>>

const tipos = {
  data: { to: 1082, from: [1082], serialize: (x: unknown) => String(x), parse: (x: string) => x },
  hora: {
    to: 1184,
    from: [1114, 1184],
    serialize: (x: unknown) => (x instanceof Date ? x.toISOString() : String(x)),
    parse: (x: string) => new Date(x.includes('T') || /[+-]\d\d(:?\d\d)?$/.test(x) ? x : `${x}Z`).toISOString(),
  },
  inteiroGrande: { to: 20, from: [20], serialize: (x: unknown) => String(x), parse: (x: string) => Number(x) },
  numerico: { to: 1700, from: [1700], serialize: (x: unknown) => String(x), parse: (x: string) => Number(x) },
}

export function conectar(url: string, nome: string, max = 10): Sql {
  return postgres(url, {
    max,
    onnotice: () => {},
    // Nada espera para sempre: consulta, trava e transação aberta têm teto (padrões, PADROES.md).
    connection: { application_name: nome, TimeZone: 'UTC', statement_timeout: config.pgTempoConsultaMs, lock_timeout: config.pgTempoTravaMs, idle_in_transaction_session_timeout: config.pgTempoTransacaoOciosaMs },
    connect_timeout: 10,
    idle_timeout: 60,
    max_lifetime: 60 * 30,
    types: tipos,
    transform: { undefined: null },
  }) as unknown as Sql
}

let api: Sql | null = null
let admin: Sql | null = null
export const sqlApi = (): Sql => (api ??= conectar(config.pgApi, 'heild-api'))
export const sqlAdmin = (): Sql => (admin ??= conectar(config.pgAdmin, 'heild-admin', 4))

export async function fecharConexoes() {
  await Promise.all([api?.end(), admin?.end()])
  api = admin = null
}

/** Claims que as políticas de RLS leem (`auth.jwt() -> 'app_metadata' ->> 'escritorio_id'`). */
export interface ClaimsBanco {
  sub: string
  escritorio_id: string
}

/**
 * Uma transação de pedido: fixa o escritório (RLS) e o papel numa ida só e roda `fazer`.
 * Se `fazer` lançar, tudo volta (efeito, evento, idempotência e jobs juntos).
 */
export async function noEscritorio<T>(sql: Sql, claims: ClaimsBanco, fazer: (tx: Tx) => Promise<T>): Promise<T> {
  const jwt = JSON.stringify({ sub: claims.sub, role: 'authenticated', app_metadata: { escritorio_id: claims.escritorio_id } })
  return (await sql.begin(async (tx) => {
    await tx`select set_config('request.jwt.claims', ${jwt}, true), set_config('role', 'api_executor', true)`
    return fazer(tx)
  })) as T
}

/** Converte bytea (Buffer) em hexadecimal para a resposta JSON. */
export function paraJson<T extends Record<string, unknown>>(linha: T): T {
  const r: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(linha)) r[k] = v instanceof Uint8Array ? Buffer.from(v).toString('hex') : v
  return r as T
}

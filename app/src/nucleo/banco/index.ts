import type { Adaptador, NomeAdaptador } from './adaptador'
import { Banco } from './banco'
import { adaptadorIndexedDb, adaptadorLocal, adaptadorMemoria } from './navegador'
import { adaptadorSupabase } from './supabase'
import { adaptadorApi } from './api'

export * from './adaptador'
export { Banco, type EstadoBanco, type MarcaEscrita, type Transacao } from './banco'
export { fotografiaVazia } from './navegador'

/**
 * Qual adaptador usar, pela variável de ambiente `VITE_HEILD_BANCO`
 * (`local` padrão, `indexeddb`, `supabase`, `api`, `memoria`). Ver app/.env.exemplo.
 */
export function adaptadorConfigurado(): Adaptador {
  const env = import.meta.env ?? {}
  const nome = (env.VITE_HEILD_BANCO as NomeAdaptador | undefined) ?? (typeof window === 'undefined' ? 'memoria' : 'local')
  // Backend real (branch backend): o app fala com a API local (servidor/), que é quem grava.
  if (nome === 'api' && typeof window !== 'undefined') return adaptadorApi({ url: env.VITE_HEILD_API_URL ?? 'http://127.0.0.1:8787' })
  if (nome === 'supabase') {
    if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY) {
      console.warn('[heild] VITE_HEILD_BANCO=supabase sem VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY: usando o localStorage.')
      return adaptadorLocal()
    }
    // Uma conta de demonstração por escritório de exemplo (o JWT de cada uma só vê o próprio escritório):
    // VITE_SUPABASE_EMAIL_ESC_ANDRADE / VITE_SUPABASE_SENHA_ESC_ANDRADE, e assim por diante.
    // VITE_SUPABASE_EMAIL / VITE_SUPABASE_SENHA valem para o primeiro (esc-andrade).
    const contas: Record<string, { email: string; senha: string }> = {}
    for (const [k, v] of Object.entries(env)) {
      const m = k.match(/^VITE_SUPABASE_EMAIL_(.+)$/)
      const senha = m && env[`VITE_SUPABASE_SENHA_${m[1]}`]
      if (m && v && senha) contas[m[1].toLowerCase().replace(/_/g, '-')] = { email: String(v), senha: String(senha) }
    }
    if (env.VITE_SUPABASE_EMAIL && env.VITE_SUPABASE_SENHA) contas['esc-andrade'] ??= { email: env.VITE_SUPABASE_EMAIL, senha: env.VITE_SUPABASE_SENHA }
    return adaptadorSupabase({ url: env.VITE_SUPABASE_URL, chaveAnon: env.VITE_SUPABASE_ANON_KEY, contas })
  }
  if (nome === 'indexeddb' && typeof indexedDB !== 'undefined') return adaptadorIndexedDb()
  if (nome === 'memoria') return adaptadorMemoria()
  return adaptadorLocal()
}

/** O banco do app (um só por página). */
export const banco = new Banco(adaptadorConfigurado())

/**
 * O banco em que os repositórios gravam agora: o do app, ou outro posto por `comBanco`.
 * O servidor (servidor/src/executor) roda os mesmos repositórios sobre um banco por
 * pedido, carregado do Postgres sob RLS; é assim que a regra fica uma só.
 */
let substituto: Banco | null = null
export const bancoAtual = (): Banco => substituto ?? banco

/** Roda `fazer` (síncrono) com os repositórios gravando em `outro`, e volta. */
export function comBanco<R>(outro: Banco, fazer: () => R): R {
  const antes = substituto
  substituto = outro
  try {
    return fazer()
  } finally {
    substituto = antes
  }
}

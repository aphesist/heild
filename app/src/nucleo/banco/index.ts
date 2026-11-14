import type { Adaptador, NomeAdaptador } from './adaptador'
import { Banco } from './banco'
import { adaptadorIndexedDb, adaptadorLocal, adaptadorMemoria } from './navegador'
import { adaptadorSupabase } from './supabase'

export * from './adaptador'
export { Banco, type EstadoBanco, type Transacao } from './banco'
export { fotografiaVazia } from './navegador'

/**
 * Qual adaptador usar, pela variável de ambiente `VITE_HEILD_BANCO`
 * (`local` padrão, `indexeddb`, `supabase`, `memoria`). Ver app/.env.exemplo.
 */
export function adaptadorConfigurado(): Adaptador {
  const env = import.meta.env ?? {}
  const nome = (env.VITE_HEILD_BANCO as NomeAdaptador | undefined) ?? (typeof window === 'undefined' ? 'memoria' : 'local')
  if (nome === 'supabase') {
    if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY) {
      console.warn('[heild] VITE_HEILD_BANCO=supabase sem VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY: usando o localStorage.')
      return adaptadorLocal()
    }
    return adaptadorSupabase({ url: env.VITE_SUPABASE_URL, chaveAnon: env.VITE_SUPABASE_ANON_KEY, email: env.VITE_SUPABASE_EMAIL, senha: env.VITE_SUPABASE_SENHA })
  }
  if (nome === 'indexeddb' && typeof indexedDB !== 'undefined') return adaptadorIndexedDb()
  if (nome === 'memoria') return adaptadorMemoria()
  return adaptadorLocal()
}

/** O banco do app (um só por página). */
export const banco = new Banco(adaptadorConfigurado())

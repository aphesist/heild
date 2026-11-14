import type { SupabaseClient } from '@supabase/supabase-js'
import { nomesTabelas, type Fotografia, type NomeTabela } from '../modelo/entidades'
import { ErroAdaptador, type Adaptador } from './adaptador'
import { fotografiaVazia } from './navegador'

/**
 * Adaptador do Supabase (Postgres + RLS por escritório). Desligado por padrão;
 * liga com `VITE_HEILD_BANCO=supabase` (ver app/supabase/README.md).
 *
 * - As tabelas têm os mesmos nomes e colunas das entidades (snake_case).
 * - A RLS filtra por `escritorio_id` lido do JWT (`app_metadata.escritorio_id`),
 *   nunca de parâmetro (R3). O adaptador manda o `escritorio_id` nas linhas só
 *   porque a coluna é obrigatória; a política recusa qualquer outro.
 * - O pacote supabase-js só é baixado quando este adaptador é usado.
 */
export interface ConfigSupabase {
  url: string
  chaveAnon: string
  /** Conta de demonstração para entrar sozinho (opcional; sem ela, precisa de sessão já aberta). */
  email?: string
  senha?: string
}

const LOTE = 500

export function adaptadorSupabase(config: ConfigSupabase): Adaptador {
  let cliente: Promise<SupabaseClient> | null = null
  const conectar = () =>
    (cliente ??= (async () => {
      const { createClient } = await import('@supabase/supabase-js')
      const c = createClient(config.url, config.chaveAnon, { auth: { persistSession: true } })
      const { data } = await c.auth.getSession()
      if (!data.session && config.email && config.senha) {
        const { error } = await c.auth.signInWithPassword({ email: config.email, password: config.senha })
        if (error) throw new ErroAdaptador('supabase', `Não entrou no Supabase: ${error.message}`)
      } else if (!data.session) throw new ErroAdaptador('supabase', 'Sem sessão no Supabase: configure VITE_SUPABASE_EMAIL e VITE_SUPABASE_SENHA ou entre antes.')
      return c
    })())

  const falhou = (onde: string, e: { message: string } | null) => {
    if (e) throw new ErroAdaptador('supabase', `${onde}: ${e.message}`)
  }

  // Apaga o escritório inteiro pela função da migração (a única porta que limpa eventos e mensagens
  // internas, só para o escritório do JWT); as tabelas filhas vão junto por cascata.
  const apagarTudo = async (c: SupabaseClient) => {
    const { error } = await c.rpc('restaurar_demonstracao')
    falhou('restaurar a demonstração', error)
  }

  return {
    nome: 'supabase',
    descricao: 'No Supabase (Postgres com RLS por escritório)',
    async carregar(escritorioId) {
      const c = await conectar()
      const { data: esc, error } = await c.from('escritorio').select('id').eq('id', escritorioId).maybeSingle()
      falhou('carregar escritório', error)
      if (!esc) return null
      const foto = fotografiaVazia()
      for (const t of nomesTabelas) {
        const { data, error: e } = await c.from(t).select('*').eq(t === 'escritorio' ? 'id' : 'escritorio_id', escritorioId)
        falhou(`carregar ${t}`, e)
        ;(foto as Record<string, unknown>)[t] = data ?? []
      }
      return foto
    },
    async persistir(_escritorioId, alteracoes) {
      const c = await conectar()
      // A ordem das tabelas respeita as chaves: o pai antes do filho.
      const ordem = (t: NomeTabela) => nomesTabelas.indexOf(t)
      for (const a of [...alteracoes].sort((x, y) => ordem(x.tabela) - ordem(y.tabela))) {
        for (let i = 0; i < a.gravar.length; i += LOTE) {
          const { error } = await c.from(a.tabela).upsert(a.gravar.slice(i, i + LOTE), { onConflict: a.tabela === 'escritorio' ? 'id' : 'escritorio_id,id' })
          falhou(`gravar ${a.tabela}`, error)
        }
        if (a.remover.length) {
          const { error } = await c.from(a.tabela).delete().in('id', a.remover)
          falhou(`remover de ${a.tabela}`, error)
        }
      }
    },
    async substituir(_escritorioId, foto: Fotografia) {
      const c = await conectar()
      await apagarTudo(c)
      for (const t of nomesTabelas) {
        const linhas = foto[t] as unknown as Record<string, unknown>[]
        for (let i = 0; i < linhas.length; i += LOTE) {
          const { error } = await c.from(t).insert(linhas.slice(i, i + LOTE))
          falhou(`semear ${t}`, error)
        }
      }
    },
    async esquecer() {
      await apagarTudo(await conectar())
    },
  }
}

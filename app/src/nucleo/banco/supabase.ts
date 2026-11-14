import type { SupabaseClient } from '@supabase/supabase-js'
import { nomesTabelas, type Fotografia, type Id, type NomeTabela, type Registro } from '../modelo/entidades'
import { ErroAdaptador, type Adaptador, type Alteracao } from './adaptador'
import { fotografiaVazia } from './navegador'

/**
 * Adaptador do Supabase (Postgres + RLS por escritório). Desligado por padrão;
 * liga com `VITE_HEILD_BANCO=supabase` (ver app/supabase/README.md e
 * docs/wireframe/ARQUITETURA.md, seção 9).
 *
 * - As tabelas têm os mesmos nomes e colunas das entidades (snake_case).
 * - A RLS filtra por `escritorio_id` lido do JWT (`app_metadata.escritorio_id`),
 *   nunca de parâmetro (R3). Por isso cada escritório de exemplo entra com a
 *   própria conta de demonstração (`contas`), e trocar de escritório troca a conta.
 * - Fila local: toda alteração vai primeiro para o localStorage (de forma
 *   síncrona) e só sai de lá quando o Supabase confirma. Recarregar a página no
 *   meio da gravação não perde nada: a fila é enviada antes da próxima leitura.
 * - Tabelas só de inserção (evento, registro de entrega) usam "inserir se não
 *   existe" (a RLS delas não tem política de update, de propósito).
 * - O pacote supabase-js só é baixado quando este adaptador é usado.
 */
export interface ConfigSupabase {
  url: string
  chaveAnon: string
  /** Conta de demonstração de cada escritório (o JWT dela carrega o `escritorio_id`). */
  contas: Record<Id, { email: string; senha: string }>
}

const LOTE = 500
const PAGINA = 1000
const SO_INSERCAO = new Set<NomeTabela>(['evento', 'registro_entrega'])
const chaveFila = (escritorioId: Id) => `heild:fila-supabase:${escritorioId}`

/** O que ainda não foi confirmado pelo Supabase, por tabela. */
type Fila = Partial<Record<NomeTabela, { gravar: Record<Id, Registro>; remover: Id[] }>>

function lerFila(escritorioId: Id): Fila {
  try {
    return JSON.parse(window.localStorage.getItem(chaveFila(escritorioId)) ?? '{}') as Fila
  } catch {
    return {}
  }
}

function guardarFila(escritorioId: Id, fila: Fila) {
  try {
    if (Object.keys(fila).length) window.localStorage.setItem(chaveFila(escritorioId), JSON.stringify(fila))
    else window.localStorage.removeItem(chaveFila(escritorioId))
  } catch {
    /* sem armazenamento: a gravação segue só pela rede */
  }
}

function juntar(fila: Fila, alteracoes: Alteracao[]): Fila {
  const nova: Fila = structuredClone(fila)
  for (const a of alteracoes) {
    const t = (nova[a.tabela] ??= { gravar: {}, remover: [] })
    for (const r of a.gravar) {
      t.gravar[r.id] = r
      t.remover = t.remover.filter((id) => id !== r.id)
    }
    for (const id of a.remover) {
      delete t.gravar[id]
      if (!t.remover.includes(id)) t.remover.push(id)
    }
  }
  return nova
}

export function adaptadorSupabase(config: ConfigSupabase): Adaptador {
  let cliente: Promise<SupabaseClient> | null = null
  let contaAtual: Id | null = null
  // Uma operação por vez: a fila de um escritório nunca sai com a conta de outro durante a troca.
  let corrente: Promise<unknown> = Promise.resolve()
  const emSerie = <T,>(f: () => Promise<T>): Promise<T> => {
    const p = corrente.then(f, f)
    corrente = p.catch(() => undefined)
    return p
  }

  /** Conecta com a conta de demonstração do escritório pedido (troca de conta se for outro). */
  const conectar = async (escritorioId: Id): Promise<SupabaseClient> => {
    const c = await (cliente ??= import('@supabase/supabase-js').then(({ createClient }) => createClient(config.url, config.chaveAnon, { auth: { persistSession: true, storageKey: 'heild:supabase-auth' } })))
    if (contaAtual === escritorioId) return c
    const { data } = await c.auth.getSession()
    const doJwt = data.session?.user.app_metadata?.escritorio_id as string | undefined
    if (doJwt !== escritorioId) {
      const conta = config.contas[escritorioId]
      if (!conta) throw new ErroAdaptador('supabase', `Sem conta de demonstração para o escritório ${escritorioId} (VITE_SUPABASE_EMAIL_${escritorioId.toUpperCase().replace(/-/g, '_')}).`)
      if (data.session) await c.auth.signOut()
      const { data: entrou, error } = await c.auth.signInWithPassword({ email: conta.email, password: conta.senha })
      if (error) throw new ErroAdaptador('supabase', `Não entrou no Supabase com ${conta.email}: ${error.message}`)
      if (entrou.user?.app_metadata?.escritorio_id !== escritorioId) throw new ErroAdaptador('supabase', `A conta ${conta.email} não é do escritório ${escritorioId} (app_metadata.escritorio_id).`)
    }
    contaAtual = escritorioId
    return c
  }

  const falhou = (onde: string, e: { message: string } | null) => {
    if (e) throw new ErroAdaptador('supabase', `${onde}: ${e.message}`)
  }

  /** Envia a fila; o que o Supabase confirmar sai dela. Tabelas em paralelo, pai antes do filho só onde importa (o escritório). */
  const enviarFila = async (escritorioId: Id) => {
    const fila = lerFila(escritorioId)
    const tabelas = (Object.keys(fila) as NomeTabela[]).sort((a, b) => nomesTabelas.indexOf(a) - nomesTabelas.indexOf(b))
    if (!tabelas.length) return
    const c = await conectar(escritorioId)
    const enviarTabela = async (t: NomeTabela) => {
      const item = fila[t]!
      const linhas = Object.values(item.gravar)
      for (let i = 0; i < linhas.length; i += LOTE) {
        const lote = linhas.slice(i, i + LOTE)
        const consulta = SO_INSERCAO.has(t) ? c.from(t).upsert(lote, { onConflict: 'escritorio_id,id', ignoreDuplicates: true }) : c.from(t).upsert(lote, { onConflict: t === 'escritorio' ? 'id' : 'escritorio_id,id' })
        const { error } = await consulta
        falhou(`gravar ${t}`, error)
      }
      if (item.remover.length) {
        const { error } = await c.from(t).delete().in('id', item.remover)
        falhou(`remover de ${t}`, error)
      }
      return t
    }
    // O escritório vai antes (as outras tabelas apontam para ele); o resto em paralelo.
    const primeiro = tabelas.filter((t) => t === 'escritorio')
    const resto = tabelas.filter((t) => t !== 'escritorio')
    const resultados = [...(await Promise.allSettled(primeiro.map(enviarTabela))), ...(await Promise.allSettled(resto.map(enviarTabela)))]
    // Tira da fila só o que foi confirmado e não mudou de novo enquanto a rede respondia.
    const depois = lerFila(escritorioId)
    const erros: string[] = []
    for (const r of resultados) {
      if (r.status === 'rejected') {
        erros.push(r.reason instanceof Error ? r.reason.message : String(r.reason))
        continue
      }
      const t = r.value
      const enviado = fila[t]!
      const atual = depois[t]
      if (!atual) continue
      for (const [id, linha] of Object.entries(enviado.gravar)) if (JSON.stringify(atual.gravar[id]) === JSON.stringify(linha)) delete atual.gravar[id]
      atual.remover = atual.remover.filter((id) => !enviado.remover.includes(id))
      if (!Object.keys(atual.gravar).length && !atual.remover.length) delete depois[t]
    }
    guardarFila(escritorioId, depois)
    if (erros.length) throw new ErroAdaptador('supabase', erros.join(' · '))
  }

  /** Uma tabela inteira do escritório, paginada e na ordem de criação (o Supabase não garante ordem). */
  const lerTabela = async (c: SupabaseClient, t: NomeTabela, escritorioId: Id) => {
    const linhas: Registro[] = []
    for (let de = 0; ; de += PAGINA) {
      const { data, error } = await c
        .from(t)
        .select('*')
        .eq(t === 'escritorio' ? 'id' : 'escritorio_id', escritorioId)
        .order('criado_em', { ascending: true })
        .order('id', { ascending: true })
        .range(de, de + PAGINA - 1)
      falhou(`carregar ${t}`, error)
      // Campos nulos voltam como ausentes, como na semente (as telas testam `undefined`).
      for (const r of (data ?? []) as Record<string, unknown>[]) linhas.push(Object.fromEntries(Object.entries(r).filter(([, v]) => v !== null)) as unknown as Registro)
      if (!data || data.length < PAGINA) return linhas
    }
  }

  return {
    nome: 'supabase',
    descricao: 'No Supabase (Postgres com RLS por escritório)',
    carregar: (escritorioId) => emSerie(async () => {
      const c = await conectar(escritorioId)
      // O que ficou pendente da última vez (recarregou no meio da gravação) vai antes de ler.
      await enviarFila(escritorioId).catch((e) => console.error('[heild] fila do Supabase ainda pendente:', e instanceof Error ? e.message : e))
      const { data: esc, error } = await c.from('escritorio').select('id').eq('id', escritorioId).maybeSingle()
      falhou('carregar escritório', error)
      if (!esc) return null
      const foto = fotografiaVazia()
      const tabelas = await Promise.all(nomesTabelas.map((t) => lerTabela(c, t, escritorioId)))
      nomesTabelas.forEach((t, i) => ((foto as Record<string, unknown>)[t] = tabelas[i]))
      // Linha ainda na fila (não confirmada) vence a lida do servidor.
      const fila = lerFila(escritorioId)
      for (const t of Object.keys(fila) as NomeTabela[]) {
        const item = fila[t]!
        const atuais = (foto[t] as Registro[]).filter((r) => !item.remover.includes(r.id) && !item.gravar[r.id])
        ;(foto as Record<string, unknown>)[t] = [...atuais, ...Object.values(item.gravar)]
      }
      return foto
    }),
    persistir(escritorioId, alteracoes) {
      // Síncrono até aqui: a alteração já está segura no navegador antes de qualquer espera.
      guardarFila(escritorioId, juntar(lerFila(escritorioId), alteracoes))
      return emSerie(() => enviarFila(escritorioId))
    },
    substituir: (escritorioId, foto: Fotografia) => emSerie(async () => {
      const c = await conectar(escritorioId)
      guardarFila(escritorioId, {})
      // Apaga o escritório inteiro pela função da migração (a única porta que limpa eventos e
      // mensagens internas, só para o escritório do JWT); as tabelas filhas vão por cascata.
      const { error } = await c.rpc('restaurar_demonstracao')
      falhou('restaurar a demonstração', error)
      const escritorio = foto.escritorio as unknown as Record<string, unknown>[]
      const { error: e } = await c.from('escritorio').insert(escritorio)
      falhou('semear escritorio', e)
      await Promise.all(
        nomesTabelas
          .filter((t) => t !== 'escritorio')
          .map(async (t) => {
            const linhas = foto[t] as unknown as Record<string, unknown>[]
            for (let i = 0; i < linhas.length; i += LOTE) {
              const { error: x } = await c.from(t).insert(linhas.slice(i, i + LOTE))
              falhou(`semear ${t}`, x)
            }
          }),
      )
    }),
    esquecer: (escritorioId) => emSerie(async () => {
      guardarFila(escritorioId, {})
      const { error } = await (await conectar(escritorioId)).rpc('restaurar_demonstracao')
      falhou('restaurar a demonstração', error)
    }),
  }
}

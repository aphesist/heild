import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import postgres from 'postgres'
import { config } from '../config.ts'

/**
 * Aplica o esquema no Postgres local: primeiro o que o Supabase já traz (papéis e
 * esquema auth, servidor/sql/00_supabase_local.sql), depois as migrações de
 * app/supabase/migrations em ordem de nome (a fonte do esquema, as mesmas do
 * Supabase). Cada migração roda numa transação e fica anotada em
 * heild_interno.migracao; rodar de novo só aplica as novas.
 *
 * Uso: npm run migrar (banco `heild`) · HEILD_PG_BANCO=heild_teste npm run migrar
 */

const RAIZ = path.resolve(import.meta.dirname, '../../..')
const MIGRACOES = path.join(RAIZ, 'app/supabase/migrations')
const LOCAL = path.join(RAIZ, 'servidor/sql/00_supabase_local.sql')

export async function migrar(urlAdmin = config.pgAdmin, opcoes: { silencioso?: boolean } = {}): Promise<string[]> {
  const dizer = (m: string) => opcoes.silencioso || console.log(m)
  const url = new URL(urlAdmin)
  const nome = url.pathname.slice(1)
  // Cria o banco se faltar (conectando no `postgres`).
  const raiz = postgres({ ...opcoesConexao(), host: url.hostname, port: Number(url.port), user: decodeURIComponent(url.username), database: 'postgres' })
  try {
    const [existe] = await raiz`select 1 from pg_database where datname = ${nome}`
    if (!existe) {
      await raiz.unsafe(`create database "${nome.replace(/"/g, '')}"`)
      dizer(`Banco ${nome} criado.`)
    }
  } finally {
    await raiz.end()
  }

  const sql = postgres(urlAdmin, opcoesConexao())
  const aplicadas: string[] = []
  try {
    await sql.unsafe(readFileSync(LOCAL, 'utf8'))
    await sql`create schema if not exists heild_interno`
    await sql`create table if not exists heild_interno.migracao (nome text primary key, aplicada_em timestamptz not null default now())`
    const feitas = new Set((await sql<{ nome: string }[]>`select nome from heild_interno.migracao`).map((r) => r.nome))
    const arquivos = readdirSync(MIGRACOES).filter((a) => a.endsWith('.sql')).sort()
    for (const arquivo of arquivos) {
      if (feitas.has(arquivo)) continue
      const texto = readFileSync(path.join(MIGRACOES, arquivo), 'utf8')
      await sql.begin(async (tx) => {
        await tx.unsafe(texto)
        await tx`insert into heild_interno.migracao (nome) values (${arquivo})`
      })
      aplicadas.push(arquivo)
      dizer(`aplicada ${arquivo}`)
    }
    // O papel de login da API: só pode assumir api_executor (e só isso grava).
    const api = new URL(config.pgApi)
    const usuarioApi = decodeURIComponent(api.username)
    const senhaApi = decodeURIComponent(api.password)
    await sql.unsafe(`do $$ begin
      if not exists (select 1 from pg_roles where rolname = '${usuarioApi}') then
        create role "${usuarioApi}" login noinherit nobypassrls password '${senhaApi.replace(/'/g, "''")}';
      end if;
    end $$`)
    await sql.unsafe(`grant api_executor to "${usuarioApi}"`)
    await sql.unsafe(`grant usage on schema public to "${usuarioApi}"`)
    if (!aplicadas.length) dizer('Esquema em dia.')
  } finally {
    await sql.end()
  }
  return aplicadas
}

export const opcoesConexao = () => ({ onnotice: () => {}, max: 4, connection: { application_name: 'heild-migrar' } })

if (import.meta.url === `file://${process.argv[1]}`) {
  migrar().catch((e) => {
    console.error(e instanceof Error ? e.message : e)
    process.exit(1)
  })
}

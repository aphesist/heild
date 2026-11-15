import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import postgres from 'postgres'
import { opcoesConexao } from './migrar.ts'

/**
 * Aplica o esquema no projeto Supabase NOVO do backend (sa-east-1; P4 do backend). NÃO é
 * para o projeto do wireframe (HEILD-PROD): ele grava pelo navegador e pararia de funcionar.
 *
 *   HEILD_PG_URL_ADMIN=postgres://postgres.<ref>:<senha>@aws-0-sa-east-1.pooler.supabase.com:5432/postgres \
 *   HEILD_CONFIRMAR_PROJETO=<ref> HEILD_PG_SENHA_API=<senha do login da API> \
 *   npm run aplicar-projeto -w @heild/servidor              # mostra o que faria (nada muda)
 *   ... npm run aplicar-projeto -w @heild/servidor -- --aplicar
 *
 * Travas:
 *  - o `<ref>` da URL tem de ser o de HEILD_CONFIRMAR_PROJETO (ninguém aplica no projeto errado por engano);
 *  - recusa banco que já tem o esquema do app sem o registro desta ferramenta
 *    (`heild_interno.migracao`): é a marca de um projeto migrado de outro jeito, como o do wireframe;
 *  - sem `--aplicar`, só lista as migrações que faltam;
 *  - não aplica `servidor/sql/00_supabase_local.sql` (papéis e esquema `auth` já existem no Supabase).
 *
 * Depois: o gancho de token (Authentication › Hooks › Custom Access Token →
 * `heild_interno.gancho_token`) e a Data API desligada (Settings › API) no painel do projeto.
 * O passo a passo está em docs/backend/IMPLEMENTACAO.md (B5).
 */

const RAIZ = path.resolve(import.meta.dirname, '../../..')
const MIGRACOES = path.join(RAIZ, 'app/supabase/migrations')

/** O `<ref>` do projeto pela URL (conexão direta `db.<ref>.supabase.co` ou pooler `postgres.<ref>`). */
export function refDoProjeto(url: string): string | null {
  const u = new URL(url)
  return /^db\.([a-z0-9]{20})\.supabase\.co$/.exec(u.hostname)?.[1] ?? /^postgres\.([a-z0-9]{20})$/.exec(decodeURIComponent(u.username))?.[1] ?? null
}

export async function aplicarProjeto(o: { url: string; confirmar: string | undefined; senhaApi: string | undefined; aplicar: boolean; dizer?: (m: string) => void }) {
  const dizer = o.dizer ?? console.log
  const ref = refDoProjeto(o.url)
  if (!ref) throw new Error('A URL não é de um projeto Supabase (db.<ref>.supabase.co ou postgres.<ref> no pooler).')
  if (o.confirmar !== ref) throw new Error(`HEILD_CONFIRMAR_PROJETO precisa ser ${ref} (o projeto desta URL). Confira que é o projeto NOVO do backend, em sa-east-1.`)
  if (o.aplicar && (!o.senhaApi || o.senhaApi.length < 24)) throw new Error('HEILD_PG_SENHA_API: a senha do login app_api, com 24 caracteres ou mais (gere uma; ela vai para o cofre de segredos da hospedagem).')
  const sql = postgres(o.url, { ...opcoesConexao(), ssl: 'require', max: 1 })
  try {
    const [marca] = await sql`select to_regclass('public.escritorio') is not null as tem_app, to_regclass('heild_interno.migracao') is not null as tem_registro`
    if (marca.tem_app && !marca.tem_registro) throw new Error('Este banco já tem o esquema do app sem o registro desta ferramenta: parece o projeto do wireframe. Nada foi aplicado.')
    const feitas = new Set(marca.tem_registro ? (await sql<{ nome: string }[]>`select nome from heild_interno.migracao`).map((r) => r.nome) : [])
    const faltam = readdirSync(MIGRACOES).filter((a) => a.endsWith('.sql')).sort().filter((a) => !feitas.has(a))
    dizer(`Projeto ${ref}: ${feitas.size} migrações já aplicadas, ${faltam.length} faltando.`)
    for (const a of faltam) dizer(`  ${o.aplicar ? 'aplicando' : 'faltaria'} ${a}`)
    if (!o.aplicar) {
      dizer('Nada mudou (rode de novo com --aplicar).')
      return { ref, faltam }
    }
    await sql`create schema if not exists heild_interno`
    await sql`create table if not exists heild_interno.migracao (nome text primary key, aplicada_em timestamptz not null default now())`
    for (const a of faltam) {
      const texto = readFileSync(path.join(MIGRACOES, a), 'utf8')
      await sql.begin(async (tx) => {
        await tx.unsafe(texto)
        await tx`insert into heild_interno.migracao (nome) values (${a})`
      })
    }
    // O login da API: sem BYPASSRLS, sem privilégio em tabela; só assume api_executor.
    await sql.unsafe(`do $$ begin
      if not exists (select 1 from pg_roles where rolname = 'app_api') then create role app_api login noinherit nobypassrls; end if;
    end $$`)
    await sql.unsafe(`alter role app_api with password '${o.senhaApi!.replace(/'/g, "''")}'`)
    await sql.unsafe('grant api_executor to app_api')
    await sql.unsafe('grant usage on schema public to app_api')
    dizer('Pronto. Falta no painel: gancho de token (heild_interno.gancho_token) e Data API desligada.')
    return { ref, faltam }
  } finally {
    await sql.end()
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const url = process.env.HEILD_PG_URL_ADMIN
  if (!url) {
    console.error('Defina HEILD_PG_URL_ADMIN com a conexão do projeto novo (painel › Connect).')
    process.exit(1)
  }
  aplicarProjeto({ url, confirmar: process.env.HEILD_CONFIRMAR_PROJETO, senhaApi: process.env.HEILD_PG_SENHA_API, aplicar: process.argv.includes('--aplicar') }).catch((e) => {
    console.error(e instanceof Error ? e.message : e)
    process.exit(1)
  })
}

import { execFileSync } from 'node:child_process'
import path from 'node:path'
import postgres from 'postgres'

/**
 * Recria o banco de teste do zero: Postgres local no ar, banco limpo, migrações e semente.
 *
 * Modo remoto (critério da E1: vazamento contra o Supabase de São Paulo): com
 * HEILD_TESTE_URL_ADMIN apontando para um projeto de HOMOLOGAÇÃO (ou um branch dele), aplica
 * as migrações pelo caminho seguro (`aplicar-projeto`, com HEILD_CONFIRMAR_PROJETO e
 * HEILD_PG_SENHA_API), recusa banco com escritório que não seja de demonstração e semeia os
 * dois escritórios de exemplo. Nunca no projeto de produção nem no do wireframe.
 */
export default async function preparar() {
  const remoto = process.env.HEILD_TESTE_URL_ADMIN
  if (remoto) return prepararRemoto(remoto)
  const raiz = path.resolve(import.meta.dirname, '..')
  execFileSync(path.join(raiz, 'scripts/pg-local.sh'), ['iniciar'], { stdio: 'inherit' })
  const porta = process.env.HEILD_PG_PORTA ?? '54329'
  const adm = postgres(`postgres://postgres@127.0.0.1:${porta}/postgres`, { onnotice: () => {} })
  await adm.unsafe('drop database if exists heild_teste with (force)')
  await adm.end()
  process.env.HEILD_PG_BANCO = 'heild_teste'
  const { migrar } = await import('../src/banco/migrar.ts')
  await migrar(`postgres://postgres@127.0.0.1:${porta}/heild_teste`, { silencioso: true })
  const { semearTodos } = await import('../src/banco/semear.ts')
  const { fecharConexoes } = await import('../src/banco/pg.ts')
  const log = console.log
  console.log = () => {}
  try {
    await semearTodos()
  } finally {
    console.log = log
    await fecharConexoes()
  }
}

async function prepararRemoto(url: string) {
  const { aplicarProjeto, refDoProjeto } = await import('../src/banco/aplicar-projeto.ts')
  const ref = refDoProjeto(url)
  await aplicarProjeto({ url, confirmar: process.env.HEILD_CONFIRMAR_PROJETO, senhaApi: process.env.HEILD_PG_SENHA_API, aplicar: true, dizer: () => {} })
  const adm = postgres(url, { onnotice: () => {}, ssl: 'require', max: 1 })
  try {
    const reais = await adm`select id from escritorio where id not in ('esc-andrade', 'esc-horizonte') limit 1`
    if (reais.length) throw new Error(`O projeto ${ref} tem escritório que não é de demonstração (${reais[0].id}): os testes semeiam e restauram, e não rodam aqui.`)
  } finally {
    await adm.end()
  }
  // A API dos testes conecta como app_api (sem BYPASSRLS) no mesmo projeto.
  const u = new URL(url)
  u.username = refDoProjeto(url) && u.hostname.includes('pooler') ? `app_api.${ref}` : 'app_api'
  u.password = encodeURIComponent(process.env.HEILD_PG_SENHA_API ?? '')
  process.env.HEILD_PG_URL_ADMIN = url
  process.env.HEILD_PG_URL_API = u.toString()
  const { semearTodos } = await import('../src/banco/semear.ts')
  const { fecharConexoes } = await import('../src/banco/pg.ts')
  try {
    await semearTodos()
  } finally {
    await fecharConexoes()
  }
}

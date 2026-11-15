import { execFileSync } from 'node:child_process'
import path from 'node:path'
import postgres from 'postgres'

/** Recria o banco de teste do zero: Postgres local no ar, banco limpo, migrações e semente. */
export default async function preparar() {
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

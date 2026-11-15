import { execFileSync } from 'node:child_process'
import path from 'node:path'

/** Recria o banco de teste da B2 (heild_b2_teste) com todas as migrações, antes da rodada. */
export default function preparar() {
  execFileSync('bash', [path.resolve(import.meta.dirname, '../scripts/banco.sh'), '--recriar'], {
    env: { ...process.env, HEILD_PG_BANCO: 'heild_b2_teste' },
    stdio: 'inherit',
  })
}

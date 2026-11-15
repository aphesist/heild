import path from 'node:path'
import { defineConfig } from 'vitest/config'

// Os testes rodam contra o Postgres local da B1 (servidor/scripts/pg-local.sh), num banco à
// parte (heild_b2_teste), recriado do zero com as migrações a cada rodada (testes/preparar.ts).
export default defineConfig({
  resolve: {
    alias: {
      '@heild/dominio': path.resolve(import.meta.dirname, '../dominio/src/index.ts'),
      '@': path.resolve(import.meta.dirname, '../../app/src'),
    },
  },
  test: {
    include: ['testes/**/*.test.ts'],
    env: { DATABASE_URL: 'postgres://postgres@127.0.0.1:54329/heild_b2_teste' },
    globalSetup: ['./testes/preparar.ts'],
    // Um arquivo por vez: dividem o mesmo banco e o mesmo esquema do pg-boss.
    fileParallelism: false,
    testTimeout: 60_000,
    hookTimeout: 120_000,
  },
})

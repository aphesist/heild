import path from 'node:path'
import { defineConfig } from 'vitest/config'

// Os testes rodam contra um Postgres real com RLS (o local de scripts/pg-local.sh), num
// banco à parte (heild_teste), recriado do zero a cada rodada pelo globalSetup.
export default defineConfig({
  resolve: {
    alias: {
      '@heild/dominio': path.resolve(import.meta.dirname, '../pacotes/dominio/src/index.ts'),
      '@heild/processos': path.resolve(import.meta.dirname, '../pacotes/processos/src/index.ts'),
      '@': path.resolve(import.meta.dirname, '../app/src'),
    },
  },
  test: {
    env: { HEILD_PG_BANCO: 'heild_teste', HEILD_DEMONSTRACAO: '1', HEILD_LOGS: 'silent' },
    globalSetup: ['./test/preparar.ts'],
    // Um arquivo por vez: todos dividem o mesmo banco (a cadeia e a idempotência são estado).
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 120_000,
  },
})

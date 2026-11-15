import path from 'node:path'
import { defineConfig } from 'vitest/config'

// Os testes da B3 rodam contra o Postgres local da B1, num banco à parte (heild_b3_teste),
// recriado com todas as migrações a cada rodada (testes/preparar.ts). O simulado é o padrão:
// nenhum modelo de verdade é chamado aqui (o real é o roteiro scripts/avaliar.ts, por variável).
export default defineConfig({
  resolve: {
    alias: {
      '@heild/dominio': path.resolve(import.meta.dirname, '../dominio/src/index.ts'),
      '@heild/processos': path.resolve(import.meta.dirname, '../processos/src/index.ts'),
      '@': path.resolve(import.meta.dirname, '../../app/src'),
    },
  },
  test: {
    include: ['testes/**/*.test.ts'],
    env: { DATABASE_URL: 'postgres://postgres@127.0.0.1:54329/heild_b3_teste' },
    globalSetup: ['./testes/preparar.ts'],
    fileParallelism: false,
    testTimeout: 90_000,
    hookTimeout: 120_000,
  },
})

import path from 'node:path'
import { defineConfig } from 'vitest/config'

// Os testes rodam contra um Postgres real com RLS (o local de scripts/pg-local.sh), num
// banco à parte (heild_teste), recriado do zero a cada rodada pelo globalSetup.
export default defineConfig({
  resolve: {
    alias: {
      '@heild/dominio': path.resolve(import.meta.dirname, '../pacotes/dominio/src/index.ts'),
      '@heild/processos': path.resolve(import.meta.dirname, '../pacotes/processos/src/index.ts'),
      '@heild/integrantes': path.resolve(import.meta.dirname, '../pacotes/integrantes/src/index.ts'),
      '@': path.resolve(import.meta.dirname, '../app/src'),
    },
  },
  test: {
    env: { HEILD_PG_BANCO: 'heild_teste', HEILD_DEMONSTRACAO: '1', HEILD_LOGS: 'silent', HEILD_CACHE_PERFIL_MS: '0' },
    globalSetup: ['./test/preparar.ts'],
    // Um arquivo por vez: todos dividem o mesmo banco (a cadeia e a idempotência são estado).
    fileParallelism: false,
    // Contra o projeto de São Paulo (CI na nuvem), cada ida ao banco tem a latência do runner: teto maior.
    testTimeout: Number(process.env.HEILD_TESTE_TEMPO_MS ?? 30_000),
    hookTimeout: Number(process.env.HEILD_TESTE_TEMPO_PREPARO_MS ?? 120_000),
  },
})

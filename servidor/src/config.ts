/**
 * Configuração do servidor, toda por variável de ambiente (nada de segredo no código
 * fora dos valores de desenvolvimento LOCAL, que não valem fora da máquina).
 */
const env = process.env

const porta = Number(env.HEILD_PG_PORTA ?? 54329)
const nomeBanco = env.HEILD_PG_BANCO ?? 'heild'

export const config = {
  porta: Number(env.HEILD_API_PORTA ?? 8787),
  host: env.HEILD_API_HOST ?? '127.0.0.1',
  /** Superusuário: só migração e semente (nunca o caminho de um pedido). */
  pgAdmin: env.HEILD_PG_URL_ADMIN ?? `postgres://postgres@127.0.0.1:${porta}/${nomeBanco}`,
  /** Papel da API: sem BYPASSRLS, sem privilégio em tabela; assume `api_executor` por transação. */
  pgApi: env.HEILD_PG_URL_API ?? `postgres://app_api:app_api_local@127.0.0.1:${porta}/${nomeBanco}`,
  nomeBanco,
  /** Segredo do token de demonstração (HS256). Em produção o token é o JWT do Supabase Auth (ES256, JWKS). */
  segredoToken: env.HEILD_SEGREDO_TOKEN ?? 'segredo-local-de-desenvolvimento-nao-usar-fora-daqui',
  /** Liga login por papel, restaurar demonstração e o cabeçalho de integrante simulado. */
  demonstracao: (env.HEILD_DEMONSTRACAO ?? '1') === '1',
  /** Origens aceitas pelo CORS (o Vite do app). */
  origens: (env.HEILD_ORIGENS ?? 'http://localhost:6100,http://127.0.0.1:6100,http://localhost:5173').split(','),
  logs: env.HEILD_LOGS ?? 'info',
  /** Tetos (ms). O pedido HTTP inteiro, cada consulta, a espera por trava e a transação parada. */
  tempoPedidoMs: Number(env.HEILD_TEMPO_PEDIDO_MS ?? 15_000),
  pgTempoConsultaMs: Number(env.HEILD_PG_TEMPO_CONSULTA_MS ?? 5_000),
  pgTempoTravaMs: Number(env.HEILD_PG_TEMPO_TRAVA_MS ?? 3_000),
  pgTempoTransacaoOciosaMs: Number(env.HEILD_PG_TEMPO_OCIOSA_MS ?? 10_000),
}

export type Config = typeof config

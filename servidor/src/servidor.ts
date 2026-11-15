import { criarApp } from './app.ts'
import { config } from './config.ts'
import { sqlApi } from './banco/pg.ts'
import { desligarProcessos, ligarProcessos } from './b2.ts'

/**
 * Sobe a API local: npm run dev (com recarga) ou npm start. Com a fila do worker instalada
 * (`npm run worker -w @heild/processos`), liga o pg-boss no modo produtor; sem ela, a API sobe
 * sem as operações de processo (que respondem que a fila não está ligada).
 */
const processos = await ligarProcessos(sqlApi()).catch((e: Error) => {
  console.warn(`[heild] fila da B2 não ligada: ${e.message}`)
  return null
})
const app = criarApp({ processos })
app
  .listen({ port: config.porta, host: config.host })
  .then((url) => app.log.info(`API da Heild em ${url} (demonstração ${config.demonstracao ? 'ligada' : 'desligada'})`))
  .catch((e) => {
    app.log.error(e)
    process.exit(1)
  })

// Desliga com calma: para de aceitar, termina o que está em andamento e fecha o pool.
for (const sinal of ['SIGTERM', 'SIGINT'] as const) {
  process.once(sinal, () => {
    app.log.info(`${sinal}: desligando`)
    app
      .close()
      .then(() => desligarProcessos(processos))
      .then(() => import('./banco/pg.ts').then((m) => m.fecharConexoes()))
      .finally(() => process.exit(0))
  })
}

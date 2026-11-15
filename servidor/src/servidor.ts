import { criarApp } from './app.ts'
import { config } from './config.ts'

/** Sobe a API local: npm run dev (com recarga) ou npm start. */
const app = criarApp()
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
      .then(() => import('./banco/pg.ts').then((m) => m.fecharConexoes()))
      .finally(() => process.exit(0))
  })
}

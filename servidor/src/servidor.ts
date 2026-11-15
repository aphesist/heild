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

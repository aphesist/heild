/**
 * O worker da B2 (serviços `worker` e `operarios`, juntos no desenvolvimento): dono do esquema da
 * fila, roda os passos dos procedimentos, o despachante, os operários e os pedidos que a API
 * enfileira. Sem conector real (sessão futura), o conector `sped` responde que não está configurado.
 *
 * Uso: npm run worker   (DATABASE_URL padrão: o banco `heild` da API local, como superusuário)
 * Com o modelo real: HEILD_IA_FORNECEDOR=anthropic HEILD_DOLAR_REAIS=... ANTHROPIC_API_KEY=... npm run worker
 */
import { criarProcessos, FornecedorDemonstracao } from '../src/index.ts'
import { fornecedorDoAmbiente } from '../src/operarios/anthropic.ts'

const url = process.env.DATABASE_URL ?? 'postgres://postgres@127.0.0.1:54329/heild'
const real = fornecedorDoAmbiente()
const p = await criarProcessos({
  url,
  modo: 'worker',
  fornecedor: real?.fornecedor ?? new FornecedorDemonstracao(),
  ...(real ? { modelos: real.modelos } : {}),
})
await p.iniciarWorkers()
console.log(`Worker da B2 no ar (${real ? 'modelo real' : 'operário de demonstração'}), banco ${new URL(url).pathname.slice(1)}.`)
for (const sinal of ['SIGTERM', 'SIGINT'] as const) {
  process.once(sinal, () => {
    console.log(`${sinal}: terminando os jobs em andamento`)
    void p.parar({ graceful: true }).finally(() => process.exit(0))
  })
}

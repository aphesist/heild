/**
 * O worker com os integrantes (B3): o worker da B2 com todos os procedimentos dos integrantes do
 * Contábil e a fila do Assistente (`assistente.rotear`, o roteamento com modelo). É ele que roda
 * junto com a API da B1, que agora expõe as operações de processo de todos os setores.
 *
 * Uso: npm run worker -w @heild/integrantes   (DATABASE_URL padrão: o banco `heild` da API local)
 * Com o modelo real: HEILD_IA_FORNECEDOR=anthropic HEILD_DOLAR_REAIS=... ANTHROPIC_API_KEY=... npm run worker -w @heild/integrantes
 */
import { criarProcessos, FornecedorDemonstracao, fornecedorDoAmbiente } from '@heild/processos'
import { extensaoIntegrantes, modelosDosIntegrantes, procedimentosDosIntegrantes } from '../src/index.ts'

const url = process.env.DATABASE_URL ?? 'postgres://postgres@127.0.0.1:54329/heild'
const real = fornecedorDoAmbiente()
const p = await criarProcessos({
  url,
  modo: 'worker',
  fornecedor: real?.fornecedor ?? new FornecedorDemonstracao(),
  // Os contratos que o portão liberou para o Haiku (src/modelos.ts).
  ...(real ? { modelos: modelosDosIntegrantes(real.modelos) } : {}),
  procedimentos: procedimentosDosIntegrantes,
  extensoes: [extensaoIntegrantes()],
})
await p.iniciarWorkers()
console.log(`Worker dos integrantes no ar (${real ? 'modelo real' : 'operário de demonstração'}), banco ${new URL(url).pathname.slice(1)}.`)
for (const sinal of ['SIGTERM', 'SIGINT'] as const) {
  process.once(sinal, () => {
    console.log(`${sinal}: terminando os jobs em andamento`)
    void p.parar({ graceful: true }).finally(() => process.exit(0))
  })
}

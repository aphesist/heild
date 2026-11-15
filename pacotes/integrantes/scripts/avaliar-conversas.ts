/**
 * Avaliação da triagem v3 (conversa de várias trocas) com o modelo de verdade: o gabarito de
 * conversas com o Sonnet e com o Haiku como operário do contrato `ges.triagem.conversar` (o escritor
 * da escalada é sempre o Sonnet), e o portão do Haiku nos mesmos termos dos outros contratos.
 *
 * NÃO roda nos testes. Liga só com variáveis de ambiente; a chave nunca está no código nem no relatório:
 *   HEILD_IA_FORNECEDOR=anthropic, ANTHROPIC_API_KEY=..., HEILD_DOLAR_REAIS=5.40
 *   HEILD_TETO_USD=10               para assim que o gasto medido passar
 *   HEILD_AVALIACAO_CASOS=3         só os primeiros casos (rodada pequena)
 *   HEILD_AVALIACAO_REPETICOES=2    repetições de cada conversa
 *   HEILD_AVALIACAO_MODELOS=sonnet,haiku
 *
 * Uso (em pacotes/integrantes, com o banco local no ar: npm run banco):
 *   npm run avaliar:conversas -- --simulado
 * Saída: relatorios/conversas-<data>.json (fora do git).
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { configDemonstracao, fornecedorDoAmbiente, type ConfigModelos, type FornecedorModelo } from '@heild/processos'
import { avaliarConversas, resumirConversas, type LinhaConversa } from '../src/avaliacao/conversas.ts'
import { gabaritoConversas, hashDoGabaritoConversas } from '../src/avaliacao/gabarito-conversas.ts'
import { fornecedorSimulado, montar, pessoa, semear, sqlAdmin } from '../testes/ambiente.ts'

const simulado = process.argv.includes('--simulado')
const real = simulado ? null : fornecedorDoAmbiente()
if (!simulado && !real) {
  console.error('Recusado: defina HEILD_IA_FORNECEDOR=anthropic e HEILD_DOLAR_REAIS (com a chave no ambiente) ou rode com --simulado.')
  process.exit(2)
}
const env = process.env
const url = env.DATABASE_URL ?? 'postgres://postgres@127.0.0.1:54329/heild_b3'
const dolar = Number(env.HEILD_DOLAR_REAIS ?? '5.40')
const tetoCentavos = Number(env.HEILD_TETO_USD ?? '10') * dolar * 100
const casos = gabaritoConversas.slice(0, Number(env.HEILD_AVALIACAO_CASOS ?? 0) || undefined)
const repeticoes = Math.max(1, Number(env.HEILD_AVALIACAO_REPETICOES ?? 1))
const lados = (env.HEILD_AVALIACAO_MODELOS ?? 'sonnet,haiku').split(',')
const CONTRATO = 'ges.triagem.conversar'

const modelos: ConfigModelos = real?.modelos ?? {
  ...configDemonstracao,
  porClasse: { operario: 'claude-sonnet-5-5', escritor: 'claude-sonnet-5-5', revisor: 'claude-opus-5-5' },
  precos: { 'claude-sonnet-5-5': { entrada: 1_080, saida: 5_400, cache: 54 }, 'claude-opus-5-5': { entrada: 2_160, saida: 10_800, cache: 108 }, 'claude-haiku-5-5': { entrada: 54, saida: 270, cache: 5 } },
}
modelos.porContrato = {}
const fornecedor: FornecedorModelo = real?.fornecedor ?? fornecedorSimulado()
const admin = sqlAdmin(url)
const h = await montar({ url, fornecedor, modelos, extensao: { aguardar_ms: 0 } })

let gasto = 0
let parou: string | null = null
const resultados: Record<string, LinhaConversa[]> = {}
const inicio = Date.now()
try {
  console.log(`Gabarito de conversas ${hashDoGabaritoConversas()} · ${casos.length} casos × ${repeticoes} · ${simulado ? 'simulado' : 'modelo real'} · teto R$ ${(tetoCentavos / 100).toFixed(2)}`)
  for (const lado of lados) {
    if (parou) break
    modelos.porContrato = lado === 'haiku' ? { [CONTRATO]: { operario: 'claude-haiku-5-5' } } : {}
    const s = await semear(admin, { executa_sozinho: ['GES-TRIAR-REPASSAR'], bolsa_centavos: 1_000_000, bolsa_assistente: 1_000_000 })
    const a = { sql: admin, motor: h.motor, escritorio_id: s.esc, ctx: await pessoa(admin, s.esc, 'u-ana') }
    resultados[lado] = await avaliarConversas(a, casos, {
      repeticoes,
      concorrencia: 4,
      parar: () => parou !== null,
      aoTerminar: (l) => {
        gasto += l.centavos
        if (gasto > tetoCentavos && !parou) parou = `Teto atingido (gasto medido R$ ${(gasto / 100).toFixed(4)}).`
        console.log(`${lado.padEnd(6)} ${l.caso.padEnd(22)} ${(l.acerto ? 'acerto' : l.erro_critico ? 'ERRO CRÍTICO' : 'erro').padEnd(12)} esperado=${l.esperado} obtido=${l.obtido} perguntas=${l.perguntas} R$ ${(l.centavos / 100).toFixed(4)}`)
        for (const f of l.falas_integrante) console.log(`         · ${f.replace(/\n/g, ' ')}`)
      },
    })
  }
} finally {
  await h.parar()
  await admin.end()
}

const resumo = Object.fromEntries(Object.entries(resultados).map(([lado, ls]) => [lado, resumirConversas(ls)]))
for (const [lado, r] of Object.entries(resumo)) {
  console.log(`\n${lado}`)
  const { por_grupo, ...total } = r
  console.table([total])
  console.table(por_grupo)
}

// Portão do Haiku (mesmos termos dos outros contratos): acerta toda conversa que o Sonnet acertou,
// sem erro crítico, no tom e no escopo, e com a taxa de erro dentro de 3 pontos.
let portao: Record<string, unknown> | null = null
if (resultados.sonnet && resultados.haiku) {
  const chave = (l: LinhaConversa) => `${l.caso}#${l.rodada}`
  const haiku = new Map(resultados.haiku.map((l) => [chave(l), l]))
  const piores = resultados.sonnet.filter((l) => l.acerto && haiku.get(chave(l)) && !haiku.get(chave(l))!.acerto).map(chave)
  const rs = resumo.sonnet!
  const rh = resumo.haiku!
  const margem = Math.round(((100 - rh.acerto_pct) - (100 - rs.acerto_pct)) * 10) / 10
  const liberado = rh.erro_critico === 0 && piores.length === 0 && rh.falas_fora_do_tom === 0 && rh.falas_fora_do_escopo === 0 && margem <= 3
  portao = { contrato: CONTRATO, liberado, casos_piores: piores, margem_pontos: margem, acerto_sonnet: rs.acerto_pct, acerto_haiku: rh.acerto_pct, centavos_sonnet: rs.centavos_total, centavos_haiku: rh.centavos_total }
  console.log(`\nPortão ${CONTRATO}: ${liberado ? 'LIBERADO' : 'BLOQUEADO'}`, portao)
}

const relatorio = {
  data: new Date().toISOString(),
  modo: simulado ? 'simulado' : 'real',
  gabarito: { hash: hashDoGabaritoConversas(), casos: casos.length, repeticoes },
  configuracao: { operario: { sonnet: 'claude-sonnet-5-5', haiku: 'claude-haiku-5-5' }, escritor: modelos.porClasse.escritor, dolar },
  duracao_s: Math.round((Date.now() - inicio) / 1000),
  gasto_centavos: Math.round(gasto * 10_000) / 10_000,
  gasto_usd: Math.round((gasto / 100 / dolar) * 10_000) / 10_000,
  parou,
  resumo,
  portao,
  linhas: resultados,
}
const pasta = path.resolve(import.meta.dirname, '../relatorios')
mkdirSync(pasta, { recursive: true })
const arquivo = path.join(pasta, `conversas-${relatorio.data.replace(/[:.]/g, '-')}.json`)
writeFileSync(arquivo, JSON.stringify(relatorio, null, 2))
console.log(`Gasto medido: R$ ${(gasto / 100).toFixed(4)} (≈ US$ ${relatorio.gasto_usd}). Relatório: ${arquivo}`)
if (parou) console.log(parou)

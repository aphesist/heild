/**
 * Avaliação dos integrantes com o modelo de verdade (decisão 8): o gabarito de cada setor em MODO
 * SOMBRA (sem efeito), o roteamento em cascata e o portão do Haiku. Mede acerto, erro crítico, custo
 * e latência por setor e por papel.
 *
 * NÃO roda nos testes. Liga só com variáveis de ambiente; a chave nunca está no código nem no relatório:
 *
 *   HEILD_IA_FORNECEDOR=anthropic   liga o fornecedor real (sem isto, só roda com --simulado)
 *   ANTHROPIC_API_KEY=...           lida pelo SDK oficial, só no ambiente deste processo
 *   HEILD_DOLAR_REAIS=5.40          cotação (obrigatória: a bolsa é em centavos de real)
 *   HEILD_TETO_USD=10               teto de gasto da rodada: para assim que o gasto medido passar
 *   HEILD_AVALIACAO_CASOS=1         casos por setor (rodada pequena para estimar); padrão: todos
 *   HEILD_AVALIACAO_REPETICOES=1    repetições de cada caso (variância)
 *   HEILD_AVALIACAO_SETORES=fiscal,dp   só estes setores; padrão: os cinco
 *   HEILD_AVALIACAO_PORTAO=1        roda também o portão do Haiku (um contrato por passo de operário)
 *   HEILD_AVALIACAO_ROTEAMENTO=1    roda também o gabarito de roteamento (cascata e portão do roteador)
 *
 * Uso (em pacotes/integrantes, com o banco local no ar: npm run banco):
 *   npm run avaliar -- --simulado
 *   HEILD_IA_FORNECEDOR=anthropic HEILD_DOLAR_REAIS=5.40 HEILD_AVALIACAO_CASOS=1 npm run avaliar
 *
 * Saída: tabelas no terminal e relatorios/avaliacao-<data>.{json,md} (fora do git).
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { configDemonstracao, fornecedorDoAmbiente, type ConfigModelos, type FornecedorModelo } from '@heild/processos'
import {
  avaliar,
  classificar,
  configRoteamentoPadrao,
  decidirPortaoHaiku,
  emMarkdown,
  integrantesContabil,
  opcoesDeRota,
  resumir,
  resumirRoteamento,
  rotearEmCascata,
  type AmbienteAvaliacao,
  type CasoGabarito,
  type ConfigRoteamento,
  type DecisaoPortao,
  type LinhaAvaliacao,
  type LinhaRota,
} from '../src/index.ts'
import { gabaritoPorSetor, gabaritoRoteamento, hashDoGabarito } from '../src/avaliacao/gabarito.ts'
import { documento, fornecedorSimulado, montar, pessoa, semear, sqlAdmin } from '../testes/ambiente.ts'

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
const porSetor = Number(env.HEILD_AVALIACAO_CASOS ?? 0) || Infinity
const repeticoes = Math.max(1, Number(env.HEILD_AVALIACAO_REPETICOES ?? 1))
const setores = (env.HEILD_AVALIACAO_SETORES ?? Object.keys(gabaritoPorSetor).join(',')).split(',').filter((s) => gabaritoPorSetor[s])
const comPortao = env.HEILD_AVALIACAO_PORTAO === '1'
const comRoteamento = env.HEILD_AVALIACAO_ROTEAMENTO === '1'

const modelos: ConfigModelos = real?.modelos ?? {
  ...configDemonstracao,
  precos: { ...configDemonstracao.precos, 'claude-sonnet-5-5': configDemonstracao.precos['demo-operario']!, 'claude-haiku-5-5': { entrada: 54, saida: 270, cache: 5 } },
}
const fornecedor: FornecedorModelo = real?.fornecedor ?? fornecedorSimulado()
const admin = sqlAdmin(url)
const h = await montar({ url, fornecedor, modelos, extensao: { aguardar_ms: 0 } })

let gasto = 0
let parou: string | null = null
const conferirTeto = (centavos: number) => {
  gasto += centavos
  if (gasto > tetoCentavos && !parou) parou = `Teto de US$ ${(tetoCentavos / dolar / 100).toFixed(2)} atingido (gasto medido R$ ${(gasto / 100).toFixed(4)}).`
}

async function ambiente(): Promise<AmbienteAvaliacao> {
  const s = await semear(admin, { bolsa_centavos: 1_000_000 })
  return { sql: admin, motor: h.motor, escritorio_id: s.esc, cliente_id: s.cliente, cnpj: s.cnpj, ctx: await pessoa(admin, s.esc, 'u-ana') }
}

/** Corta os casos de cada setor (rodada pequena) e para quando o teto estoura. */
async function rodar(a: AmbienteAvaliacao, casos: CasoGabarito[]) {
  if (parou) return []
  return avaliar(a, casos, {
    repeticoes,
    concorrencia: 4,
    aoTerminar: (l) => {
      conferirTeto(l.centavos)
      console.log(`${l.setor.padEnd(18)} ${l.caso.padEnd(24)} ${l.resultado.padEnd(20)} esperado=${l.esperado} obtido=${l.obtido} R$ ${(l.centavos / 100).toFixed(4)} ${l.latencia_ms} ms`)
    },
  })
}

const casos = setores.flatMap((s) => gabaritoPorSetor[s]!.slice(0, porSetor))
const inicio = Date.now()
let linhas: LinhaAvaliacao[] = []
const portoes: DecisaoPortao[] = []
const rotas: LinhaRota[] = []
const rotasSonnet: LinhaRota[] = []
try {
  console.log(`Gabarito ${hashDoGabarito()} · ${casos.length} casos × ${repeticoes} · ${simulado ? 'simulado' : 'modelo real'} · teto R$ ${(tetoCentavos / 100).toFixed(2)}`)
  linhas = await rodar(await ambiente(), casos)

  if (comPortao && !parou) {
    // Para cada contrato de operário, roda os mesmos casos com o Haiku nesse contrato e compara com o Sonnet.
    const porContrato = new Map<string, CasoGabarito[]>()
    for (const c of casos) {
      const p = integrantesContabil.flatMap((i) => i.procedimentos).find((x) => x.procedimento.id === c.procedimento)!.procedimento
      for (const passo of p.passos) if (passo.tipo === 'operario') porContrato.set(passo.contrato.id, [...(porContrato.get(passo.contrato.id) ?? []), c])
    }
    for (const [contrato, cs] of porContrato) {
      if (parou) break
      const a = await ambiente()
      modelos.porContrato = { ...modelos.porContrato, [contrato]: { operario: 'claude-haiku-5-5' } }
      const haiku = await rodar(a, cs)
      delete modelos.porContrato[contrato]
      const sonnet = linhas.filter((l) => cs.some((c) => c.id === l.caso))
      portoes.push(decidirPortaoHaiku(contrato, sonnet, haiku))
      console.log(`Portão do Haiku em ${contrato}: ${portoes.at(-1)!.liberado ? 'LIBERADO' : 'bloqueado'} (${portoes.at(-1)!.motivo})`)
    }
  }

  if (comRoteamento && !parou) {
    const rodarRotas = async (cfg: ConfigRoteamento, destino: LinhaRota[]) => {
      const a = await ambiente()
      for (const c of gabaritoRoteamento) {
        if (parou) break
        const s = { esc: a.escritorio_id, cliente: a.cliente_id, cnpj: a.cnpj }
        await documento(admin, s, c.documento.tipo, c.documento.metadados)
        const t0 = Date.now()
        const r = await rotearEmCascata({ sql: admin, fornecedor, cfg }, a.escritorio_id, { texto: c.texto, tipoDocumento: c.documento.tipo }, opcoesDeRota(integrantesContabil, c.documento.tipo))
        const centavos = r.tentativas.reduce((x, t) => x + t.centavos, 0)
        conferirTeto(centavos)
        const obtido = r.decisao ? r.decisao.procedimento_id : 'pergunta'
        const resultado = classificar(c.esperado === 'pergunta' ? 'cartao' : c.esperado, obtido === 'pergunta' ? 'cartao' : obtido)
        destino.push({ caso: c.id, esperado: c.esperado, obtido, camada: r.decisao?.camada ?? null, resultado, centavos, latencia_ms: Date.now() - t0, modelos: r.tentativas.map((t) => t.modelo).filter(Boolean).join('>') })
        console.log(`rota ${cfg.barato.padEnd(18)} ${c.id.padEnd(18)} ${resultado.padEnd(20)} esperado=${c.esperado} obtido=${obtido} camada=${r.decisao?.camada ?? '-'} R$ ${(centavos / 100).toFixed(4)}`)
      }
    }
    const padrao = real ? configRoteamentoPadrao(modelos.precos) : { ...configRoteamentoPadrao(modelos.precos), barato: 'claude-haiku-5-5', caro: 'claude-sonnet-5-5' }
    await rodarRotas(padrao, rotas)
    // Portão do roteador: o Haiku como barato só fica se igualar o Sonnet como barato.
    await rodarRotas({ ...padrao, barato: padrao.caro }, rotasSonnet)
    const comoLinha = (l: LinhaRota) => ({ caso: l.caso, rodada: 1, resultado: l.resultado }) as LinhaAvaliacao
    portoes.push(decidirPortaoHaiku('assistente.rotear (barato)', rotasSonnet.map(comoLinha), rotas.map(comoLinha)))
  }
} finally {
  await h.parar()
  await admin.end()
}

const r = resumir(linhas)
const rota = rotas.length ? resumirRoteamento(rotas) : undefined
console.table(r.porSetor)
console.table(r.porPapel)
if (rota) console.table([rota])
if (portoes.length) console.table(portoes.map(({ contrato, liberado, motivo }) => ({ contrato, liberado, motivo })))
if (parou) console.log(parou)
const relatorio = {
  data: new Date().toISOString(),
  modo: simulado ? 'simulado' : 'anthropic',
  gabarito: hashDoGabarito(),
  configuracao: { modelos: modelos.porClasse, esforco: { operario: env.HEILD_IA_ESFORCO_OPERARIO ?? 'low', escritor: env.HEILD_IA_ESFORCO_ESCRITOR ?? 'medium', revisor: env.HEILD_IA_ESFORCO_REVISOR ?? 'high' }, dolar, repeticoes, casos_por_setor: Number.isFinite(porSetor) ? porSetor : 'todos', setores },
  duracao_s: Math.round((Date.now() - inicio) / 1000),
  gasto_centavos: Math.round(gasto * 10_000) / 10_000,
  gasto_usd: Math.round((gasto / 100 / dolar) * 10_000) / 10_000,
  parou,
  resumo: r,
  roteamento: rota ?? null,
  portoes,
  linhas: linhas.map(({ chamadas, ...l }) => ({ ...l, chamadas: chamadas.map((c) => `${c.classe}:${c.modelo}`) })),
  rotas: [...rotas, ...rotasSonnet],
}
const pasta = path.resolve(import.meta.dirname, '../relatorios')
mkdirSync(pasta, { recursive: true })
const base = path.join(pasta, `avaliacao-${new Date().toISOString().replace(/[:.]/g, '-')}`)
writeFileSync(`${base}.json`, JSON.stringify(relatorio, null, 2))
writeFileSync(`${base}.md`, emMarkdown(r, rota) + '\n')
console.log(`Gasto medido: R$ ${(gasto / 100).toFixed(4)} (≈ US$ ${relatorio.gasto_usd}). Relatório: ${base}.json`)
// Critério do dono: qualquer erro crítico faz o roteiro sair com falha.
process.exit(r.total.erro_critico > 0 || (rota?.erro_critico ?? 0) > 0 ? 1 : 0)

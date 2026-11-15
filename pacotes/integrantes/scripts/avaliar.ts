/**
 * Avaliação dos integrantes com o modelo de verdade (decisão 8), no gabarito ampliado (B3b): cada
 * contrato de operário em MODO SOMBRA (sem efeito, pago pela bolsa do piloto), com o Sonnet e com o
 * Haiku; o roteamento em cascata com e sem o trecho do documento; e o custo do revisor de risco.
 *
 * NÃO roda nos testes. Liga só com variáveis de ambiente; a chave nunca está no código nem no relatório:
 *
 *   HEILD_IA_FORNECEDOR=anthropic   liga o fornecedor real (sem isto, só roda com --simulado)
 *   ANTHROPIC_API_KEY=...           lida pelo SDK oficial, só no ambiente deste processo
 *   HEILD_DOLAR_REAIS=5.40          cotação (obrigatória: a bolsa é em centavos de real)
 *   HEILD_TETO_USD=15               teto da rodada: para assim que o gasto medido passar
 *   HEILD_AVALIACAO_GABARITO=ampliado | pequeno   (padrão: ampliado, 30 casos por contrato)
 *   HEILD_AVALIACAO_CASOS=2         casos por contrato (rodada pequena para estimar); padrão: todos
 *   HEILD_AVALIACAO_REPETICOES=1    repetições de cada caso
 *   HEILD_AVALIACAO_CONTRATOS=a,b   só estes contratos
 *   HEILD_AVALIACAO_PORTAO=1        roda também o Haiku em cada contrato (portão)
 *   HEILD_AVALIACAO_ROTEAMENTO=1    roda o roteamento (Haiku e Sonnet como barato, com e sem trecho)
 *
 * Uso (em pacotes/integrantes, com o banco local no ar: npm run banco):
 *   npm run avaliar -- --simulado
 *   HEILD_IA_FORNECEDOR=anthropic HEILD_DOLAR_REAIS=5.40 HEILD_AVALIACAO_CASOS=2 npm run avaliar
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
  margem,
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
import { gabaritoPorSetor, gabaritoRoteamento } from '../src/avaliacao/gabarito.ts'
import { ampliadoPorContrato, hashDoGabaritoAmpliado, roteamentoAmpliado } from '../src/avaliacao/gabarito-ampliado.ts'
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
const tetoCentavos = Number(env.HEILD_TETO_USD ?? '15') * dolar * 100
const porContrato = Number(env.HEILD_AVALIACAO_CASOS ?? 0) || Infinity
const repeticoes = Math.max(1, Number(env.HEILD_AVALIACAO_REPETICOES ?? 1))
const ampliado = (env.HEILD_AVALIACAO_GABARITO ?? 'ampliado') === 'ampliado'
const comPortao = env.HEILD_AVALIACAO_PORTAO === '1'
const comRoteamento = env.HEILD_AVALIACAO_ROTEAMENTO === '1'

/** Casos por contrato de operário (o pequeno é agrupado pelo contrato do primeiro operário do procedimento). */
const contratoDe = (proc: string) => {
  const p = integrantesContabil.flatMap((i) => i.procedimentos).find((x) => x.procedimento.id === proc)!.procedimento
  return p.passos.find((x) => x.tipo === 'operario' && x.contrato.classe === 'operario')!
}
const grupos: Record<string, CasoGabarito[]> = ampliado
  ? ampliadoPorContrato
  : Object.values(gabaritoPorSetor)
      .flat()
      .reduce<Record<string, CasoGabarito[]>>((acc, c) => {
        const passo = contratoDe(c.procedimento)
        const id = passo.tipo === 'operario' ? passo.contrato.id : c.procedimento
        ;(acc[id] ??= []).push(c)
        return acc
      }, {})
const filtro = env.HEILD_AVALIACAO_CONTRATOS?.split(',')
const contratos = Object.keys(grupos).filter((c) => !filtro || filtro.includes(c))

const modelos: ConfigModelos = real?.modelos ?? {
  ...configDemonstracao,
  porClasse: { operario: 'claude-sonnet-5-5', escritor: 'claude-sonnet-5-5', revisor: 'claude-opus-5-5' },
  precos: { 'claude-sonnet-5-5': { entrada: 1_080, saida: 5_400, cache: 54 }, 'claude-opus-5-5': { entrada: 2_160, saida: 10_800, cache: 108 }, 'claude-haiku-5-5': { entrada: 54, saida: 270, cache: 5 } },
}
// A rodada mede o Sonnet × Haiku: parte sempre do Sonnet em todos os contratos.
modelos.porContrato = {}
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
  const s = await semear(admin, { bolsa_centavos: 1_000_000, bolsa_piloto: 10_000_000, bolsa_assistente: 1_000_000 })
  return { sql: admin, motor: h.motor, escritorio_id: s.esc, cliente_id: s.cliente, cnpj: s.cnpj, ctx: await pessoa(admin, s.esc, 'u-ana') }
}

async function rodar(rotulo: string, a: AmbienteAvaliacao, casos: CasoGabarito[]) {
  if (parou) return []
  return avaliar(a, casos, {
    repeticoes,
    concorrencia: 6,
    aoTerminar: (l) => {
      conferirTeto(l.centavos)
      console.log(`${rotulo.padEnd(7)} ${l.setor.padEnd(18)} ${l.caso.padEnd(28)} ${l.resultado.padEnd(20)} esperado=${l.esperado} obtido=${l.obtido} R$ ${(l.centavos / 100).toFixed(4)}`)
    },
  })
}

const inicio = Date.now()
const linhas: LinhaAvaliacao[] = []
const linhasHaiku: LinhaAvaliacao[] = []
const portoes: (DecisaoPortao & { margem_pontos: number | null; dentro_da_margem: boolean | null })[] = []
const rotas: Record<string, LinhaRota[]> = {}
try {
  console.log(`Gabarito ${ampliado ? `ampliado ${hashDoGabaritoAmpliado()}` : 'pequeno'} · ${contratos.length} contratos · ${simulado ? 'simulado' : 'modelo real'} · teto R$ ${(tetoCentavos / 100).toFixed(2)}`)
  for (const contrato of contratos) {
    if (parou) break
    const casos = grupos[contrato]!.slice(0, porContrato)
    const sonnet = await rodar('sonnet', await ambiente(), casos)
    linhas.push(...sonnet)
    if (!comPortao || parou) continue
    modelos.porContrato = { [contrato]: { operario: 'claude-haiku-5-5' } }
    const haiku = await rodar('haiku', await ambiente(), casos)
    modelos.porContrato = {}
    linhasHaiku.push(...haiku)
    const d = decidirPortaoHaiku(contrato, sonnet, haiku)
    // Margem de −3 pontos na taxa de erro contra a pessoa (o gabarito traz o que a pessoa fez).
    const comPessoa = haiku.filter((l) => l.resultado_pessoa !== null)
    const erroH = comPessoa.length ? (comPessoa.filter((l) => l.resultado === 'erro_critico').length / comPessoa.length) * 100 : null
    const erroP = comPessoa.length ? (comPessoa.filter((l) => l.resultado_pessoa === 'erro_critico').length / comPessoa.length) * 100 : null
    const mg = erroH !== null && erroP !== null ? margem(erroH, erroP) : null
    const liberado = d.liberado && (mg?.dentro ?? true)
    portoes.push({ ...d, liberado, configuracao: liberado ? d.configuracao : null, margem_pontos: mg?.pontos ?? null, dentro_da_margem: mg?.dentro ?? null })
    console.log(`Portão ${contrato}: ${liberado ? 'LIBERADO' : 'bloqueado'} · Sonnet ${d.acerto_sonnet} × Haiku ${d.acerto_haiku} · ${d.motivo}`)
  }

  if (comRoteamento && !parou) {
    const casosRota = ampliado ? roteamentoAmpliado : gabaritoRoteamento.map((c) => ({ ...c, grupo: 'regra' as const }))
    const base = configRoteamentoPadrao(modelos.precos)
    const configs: [string, ConfigRoteamento][] = [
      ['haiku_sem_trecho', { ...base, barato: 'claude-haiku-5-5', caro: 'claude-sonnet-5-5', com_trecho: false }],
      ['haiku_com_trecho', { ...base, barato: 'claude-haiku-5-5', caro: 'claude-sonnet-5-5', com_trecho: true }],
      ['sonnet_sem_trecho', { ...base, barato: 'claude-sonnet-5-5', caro: 'claude-sonnet-5-5', com_trecho: false }],
      ['sonnet_com_trecho', { ...base, barato: 'claude-sonnet-5-5', caro: 'claude-sonnet-5-5', com_trecho: true }],
    ]
    for (const [nome, cfg] of configs) {
      if (parou) break
      const a = await ambiente()
      const destino: LinhaRota[] = (rotas[nome] = [])
      for (const c of casosRota) {
        if (parou) break
        const s = { esc: a.escritorio_id, cliente: a.cliente_id, cnpj: a.cnpj }
        await documento(admin, s, c.documento.tipo, c.documento.metadados as Record<string, unknown>)
        const trecho = String((c.documento.metadados as { texto_extraido?: string }).texto_extraido ?? '').slice(0, 600) || undefined
        const t0 = Date.now()
        const r = await rotearEmCascata({ sql: admin, fornecedor, cfg }, a.escritorio_id, { texto: c.texto, tipoDocumento: c.documento.tipo, trecho }, opcoesDeRota(integrantesContabil, c.documento.tipo))
        const centavos = r.tentativas.reduce((x, t) => x + t.centavos, 0)
        conferirTeto(centavos)
        const obtido = r.decisao ? r.decisao.procedimento_id : 'pergunta'
        const resultado = classificar(c.esperado === 'pergunta' ? 'cartao' : c.esperado, obtido === 'pergunta' ? 'cartao' : obtido)
        destino.push({ caso: `${c.grupo}:${c.id}`, esperado: c.esperado, obtido, camada: r.decisao?.camada ?? null, resultado, centavos, latencia_ms: Date.now() - t0, modelos: r.tentativas.map((t) => t.modelo).filter(Boolean).join('>') })
        console.log(`rota ${nome.padEnd(18)} ${c.id.padEnd(16)} ${resultado.padEnd(20)} esperado=${c.esperado} obtido=${obtido} camada=${r.decisao?.camada ?? '-'} R$ ${(centavos / 100).toFixed(4)}`)
      }
    }
    const comoLinha = (l: LinhaRota) => ({ caso: l.caso, rodada: 1, resultado: l.resultado, chamadas: [], centavos: l.centavos }) as unknown as LinhaAvaliacao
    for (const trecho of ['sem_trecho', 'com_trecho']) {
      const hk = rotas[`haiku_${trecho}`]
      const sn = rotas[`sonnet_${trecho}`]
      if (hk?.length && sn?.length) portoes.push({ ...decidirPortaoHaiku(`assistente.rotear (barato, ${trecho.replace('_', ' ')})`, sn.map(comoLinha), hk.map(comoLinha)), margem_pontos: null, dentro_da_margem: null })
    }
  }
} finally {
  await h.parar()
  await admin.end()
}

const r = resumir(linhas)
const rH = linhasHaiku.length ? resumir(linhasHaiku) : null
const resumoRotas = Object.fromEntries(Object.entries(rotas).map(([k, v]) => [k, resumirRoteamento(v)]))
const porGrupoRota = Object.fromEntries(
  Object.entries(rotas).map(([k, v]) => [k, Object.fromEntries(['regra', 'pedido_claro', 'documento_claro', 'vago'].map((g) => [g, resumirRoteamento(v.filter((l) => l.caso.startsWith(`${g}:`)))]))]),
)
console.table(r.porSetor)
console.table(r.porPapel)
if (portoes.length) console.table(portoes.map(({ contrato, liberado, acerto_sonnet, acerto_haiku, erro_critico_haiku, escaladas_sonnet, escaladas_haiku, centavos_sonnet, centavos_haiku, margem_pontos }) => ({ contrato, liberado, acerto_sonnet, acerto_haiku, erro_critico_haiku, escaladas_sonnet, escaladas_haiku, centavos_sonnet, centavos_haiku, margem_pontos })))
if (Object.keys(resumoRotas).length) console.table(Object.entries(resumoRotas).map(([k, v]) => ({ config: k, acerto: v.acerto_pct, erro_critico: v.erro_critico, pergunta_desnecessaria: v.pergunta_desnecessaria, centavos: v.centavos_total })))
if (parou) console.log(parou)
const semChamadas = (ls: LinhaAvaliacao[]) => ls.map(({ chamadas, ...l }) => ({ ...l, chamadas: chamadas.map((c) => `${c.classe}:${c.modelo}:${c.centavos}:${c.latencia_ms}`) }))
const relatorio = {
  data: new Date().toISOString(),
  modo: simulado ? 'simulado' : 'anthropic',
  gabarito: ampliado ? `ampliado ${hashDoGabaritoAmpliado()}` : 'pequeno',
  configuracao: { modelos: modelos.porClasse, esforco: { operario: env.HEILD_IA_ESFORCO_OPERARIO ?? 'low', escritor: env.HEILD_IA_ESFORCO_ESCRITOR ?? 'medium', revisor: env.HEILD_IA_ESFORCO_REVISOR ?? 'high' }, dolar, repeticoes, casos_por_contrato: Number.isFinite(porContrato) ? porContrato : 'todos', contratos },
  duracao_s: Math.round((Date.now() - inicio) / 1000),
  gasto_centavos: Math.round(gasto * 10_000) / 10_000,
  gasto_usd: Math.round((gasto / 100 / dolar) * 10_000) / 10_000,
  parou,
  resumo_sonnet: r,
  resumo_haiku: rH,
  portoes,
  roteamento: resumoRotas,
  roteamento_por_grupo: porGrupoRota,
  linhas: semChamadas(linhas),
  linhas_haiku: semChamadas(linhasHaiku),
  rotas,
}
const pasta = path.resolve(import.meta.dirname, '../relatorios')
mkdirSync(pasta, { recursive: true })
const base = path.join(pasta, `avaliacao-${new Date().toISOString().replace(/[:.]/g, '-')}`)
writeFileSync(`${base}.json`, JSON.stringify(relatorio, null, 2))
writeFileSync(`${base}.md`, emMarkdown(r, resumoRotas.haiku_sem_trecho) + '\n')
console.log(`Gasto medido: R$ ${(gasto / 100).toFixed(4)} (≈ US$ ${relatorio.gasto_usd}). Relatório: ${base}.json`)
// Critério do dono: qualquer erro crítico do Sonnet (a configuração de produção) faz o roteiro sair com falha.
process.exit(r.total.erro_critico > 0 ? 1 : 0)

/**
 * Teste agêntico real: os dois procedimentos de referência com o modelo de verdade no lugar do
 * operário simulado, medindo custo, latência e acerto contra o gabarito (testes/gabarito/contabil.ts).
 *
 * NÃO roda nos testes normais. Liga só com variáveis de ambiente; a chave nunca está no código:
 *
 *   HEILD_IA_FORNECEDOR=anthropic   liga o fornecedor real (sem isto, recusa rodar)
 *   ANTHROPIC_API_KEY=...           a chave (ou um perfil do `ant auth login`), lida pelo SDK
 *   HEILD_DOLAR_REAIS=5.40          cotação para converter o custo em reais (obrigatória)
 *   HEILD_IA_ESFORCO_OPERARIO=low   esforço por classe (padrões: low, medium, high)
 *   HEILD_AGENTICO_REPETICOES=1     quantas vezes roda cada caso (variância)
 *
 * Uso (em pacotes/processos, com o banco local no ar: npm run banco):
 *   npm run agentico               com o modelo real (gasta dinheiro: ~algumas dezenas de chamadas)
 *   npm run agentico -- --simulado só para conferir o roteiro, com o operário de demonstração
 *
 * Saída: tabela no terminal e relatorios/agentico-<data>.json (fora do git).
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { comEscritorio, FornecedorDemonstracao, type FornecedorModelo } from '../src/index.ts'
import { fornecedorDoAmbiente } from '../src/operarios/anthropic.ts'
import { documentoEcd, documentoSimples, esperar, montar, pessoa, semear, sqlAdmin } from '../testes/ambiente.ts'
import { casosCompetencia, casosEcd } from '../testes/gabarito/contabil.ts'

const simulado = process.argv.includes('--simulado')
const real = fornecedorDoAmbiente()
if (!simulado && !real) {
  console.error('Recusado: defina HEILD_IA_FORNECEDOR=anthropic (e a chave no ambiente) ou rode com --simulado.')
  process.exit(2)
}
const repeticoes = Math.max(1, Number(process.env.HEILD_AGENTICO_REPETICOES ?? 1))

// No simulado, um operário que acerta os casos decidíveis e hesita nos ambíguos: serve só para conferir o roteiro.
const demo = new FornecedorDemonstracao()
  .responder('ctb.competencia.escolher', (e: { candidatas: string[]; trecho: { conteudo: string } }) => {
    // Só "mm/aaaa" solto (não a parte final de um "dd/mm/aaaa").
    const refs = [...e.trecho.conteudo.matchAll(/(?<![\d/])(\d{2})\/(\d{4})(?!\d)/g)]
    const comp = refs[0] ? `${refs[0][2]}-${refs[0][1]}` : e.candidatas[0]
    const ambiguo = refs.length !== 1
    return { competencia: e.candidatas.includes(comp!) ? comp : e.candidatas[0], confianca: ambiguo ? 0.4 : 0.95, motivo: 'Referência no texto.' }
  })
  .responder('ctb.ecd.apontar_atencao', (e: { contas_atipicas: { conta_codigo: string }[] }) => ({
    apontamentos: e.contas_atipicas.slice(0, 4).map((c) => ({ conta_codigo: c.conta_codigo, motivo: 'Variação forte no ano.' })),
  }))
const fornecedor: FornecedorModelo = simulado ? demo : real!.fornecedor

interface Linha {
  procedimento: string
  caso: string
  rodada: number
  esperado: string
  obtido: string
  resultado: 'acerto' | 'erro_critico' | 'cartao_desnecessario' | 'falha'
  estado: string
  chamadas: number
  classes: string
  modelos: string
  tokens_entrada: number
  tokens_saida: number
  centavos: number
  latencia_modelo_ms: number
  latencia_total_ms: number
}

const admin = sqlAdmin()
const h = await montar({ fornecedor, ...(real && !simulado ? { modelos: real.modelos } : {}) })
const linhas: Linha[] = []
const lerExec = (esc: string, id: string) => comEscritorio(admin, esc, async (tx) => (await tx`select * from execucao where id = ${id}`)[0]!)
const custo = async (id: string) => {
  const cs = await admin`select classe, modelo, tokens_entrada, tokens_saida, centavos, latencia_ms from chamada_modelo where execucao_id = ${id} order by criado_em`
  return {
    chamadas: cs.length,
    classes: cs.map((c) => c.classe).join('>'),
    modelos: [...new Set(cs.map((c) => c.modelo))].join(','),
    tokens_entrada: cs.reduce((a, c) => a + c.tokens_entrada, 0),
    tokens_saida: cs.reduce((a, c) => a + c.tokens_saida, 0),
    centavos: cs.reduce((a, c) => a + c.centavos, 0),
    latencia_modelo_ms: cs.reduce((a, c) => a + c.latencia_ms, 0),
  }
}

try {
  for (let rodada = 1; rodada <= repeticoes; rodada++) {
    // CTB-COMPETENCIA-DOC: cada caso num escritório limpo, iniciado pela pessoa (o caminho do evento é o mesmo motor).
    for (const caso of casosCompetencia) {
      const s = await semear(admin, { bolsa_centavos: 100_000 })
      await admin`insert into procedimento_config (escritorio_id, procedimento_id, executa_sozinho) values (${s.esc}, 'CTB-COMPETENCIA-DOC', true)`
      const doc = await documentoSimples(admin, s, { tipo: caso.tipo, metadados: { texto_extraido: caso.texto } })
      const inicio = Date.now()
      const { execucao_id } = await h.motor.iniciar(await pessoa(admin, s.esc, 'u-ana'), 'CTB-COMPETENCIA-DOC', { documento_id: doc, cliente_id: 'c-1' })
      const ex = await esperar(() => lerExec(s.esc, execucao_id), (e) => ['concluida', 'aguardando_cartao', 'falhou', 'parcial', 'cancelada'].includes(e.estado), 180_000)
      const obtido = ex.estado === 'concluida' ? ex.saida.competencia : ex.estado === 'aguardando_cartao' ? 'cartao' : `${ex.estado}:${ex.erro?.codigo ?? ''}`
      const resultado: Linha['resultado'] =
        obtido === caso.esperado ? 'acerto' : obtido === 'cartao' ? 'cartao_desnecessario' : ex.estado === 'concluida' ? 'erro_critico' : 'falha'
      linhas.push({ procedimento: 'CTB-COMPETENCIA-DOC', caso: caso.id, rodada, esperado: caso.esperado, obtido, resultado, estado: ex.estado, ...(await custo(execucao_id)), latencia_total_ms: Date.now() - inicio })
    }
    // CTB-ECD-TRANSMITIR: até o cartão (a transmissão exige pessoa; aqui medimos conferência e operário).
    for (const caso of casosEcd) {
      const s = await semear(admin, { bolsa_centavos: 100_000 })
      const doc = await documentoEcd(admin, s, { plantar_adiantamento: true })
      const inicio = Date.now()
      const { execucao_id } = await h.motor.iniciar(await pessoa(admin, s.esc, 'u-ana'), 'CTB-ECD-TRANSMITIR', { cliente_id: 'c-1', exercicio: '2025', documento_id: doc })
      const ex = await esperar(() => lerExec(s.esc, execucao_id), (e) => ['aguardando_cartao', 'falhou', 'parcial', 'cancelada', 'concluida'].includes(e.estado), 180_000)
      const [ap] = await admin`select saida from passo_execucao where execucao_id = ${execucao_id} and nome = 'apontar_atencao' and estado = 'concluido' order by tentativa desc limit 1`
      const [cartao] = ex.cartao_id ? await admin`select tipo from cartao_aprovacao where id = ${ex.cartao_id}` : []
      const apontadas: string[] = (ap?.saida?.apontamentos ?? []).map((a: { conta_codigo: string }) => a.conta_codigo)
      const achou = caso.deve_apontar.every((c) => apontadas.includes(c))
      const resultado: Linha['resultado'] = cartao?.tipo === 'aprovacao' ? (achou ? 'acerto' : 'erro_critico') : cartao?.tipo === 'nao_consegui' ? 'cartao_desnecessario' : 'falha'
      linhas.push({ procedimento: 'CTB-ECD-TRANSMITIR', caso: caso.id, rodada, esperado: caso.deve_apontar.join(','), obtido: apontadas.join(',') || `${ex.estado}:${cartao?.tipo ?? ex.erro?.codigo ?? ''}`, resultado, estado: ex.estado, ...(await custo(execucao_id)), latencia_total_ms: Date.now() - inicio })
    }
  }
} finally {
  await h.parar()
  await admin.end()
}

const por = (p: string) => linhas.filter((l) => l.procedimento === p)
const resumo = ['CTB-COMPETENCIA-DOC', 'CTB-ECD-TRANSMITIR'].map((p) => {
  const ls = por(p)
  const n = ls.length || 1
  const lat = ls.map((l) => l.latencia_total_ms).sort((a, b) => a - b)
  return {
    procedimento: p,
    execucoes: ls.length,
    acerto: `${((ls.filter((l) => l.resultado === 'acerto').length / n) * 100).toFixed(1)}%`,
    erro_critico: ls.filter((l) => l.resultado === 'erro_critico').length,
    cartao_desnecessario: ls.filter((l) => l.resultado === 'cartao_desnecessario').length,
    falha: ls.filter((l) => l.resultado === 'falha').length,
    chamadas_por_execucao: (ls.reduce((a, l) => a + l.chamadas, 0) / n).toFixed(2),
    custo_medio_centavos: (ls.reduce((a, l) => a + l.centavos, 0) / n).toFixed(2),
    latencia_p50_ms: lat[Math.floor(lat.length * 0.5)] ?? 0,
    latencia_p90_ms: lat[Math.min(lat.length - 1, Math.floor(lat.length * 0.9))] ?? 0,
  }
})

console.table(linhas.map(({ procedimento, caso, esperado, obtido, resultado, chamadas, classes, centavos, latencia_total_ms }) => ({ procedimento, caso, esperado, obtido, resultado, chamadas, classes, centavos, latencia_total_ms })))
console.table(resumo)
const pasta = path.resolve(import.meta.dirname, '../relatorios')
mkdirSync(pasta, { recursive: true })
const arquivo = path.join(pasta, `agentico-${new Date().toISOString().replace(/[:.]/g, '-')}.json`)
writeFileSync(arquivo, JSON.stringify({ modo: simulado ? 'simulado' : 'anthropic', fornecedor: fornecedor.nome, repeticoes, resumo, linhas }, null, 2))
console.log(`Relatório: ${arquivo}`)
// Critério do dono: erro custa mais que tudo. Qualquer erro crítico faz o roteiro sair com falha.
process.exit(resumo.some((r) => r.erro_critico > 0) ? 1 : 0)

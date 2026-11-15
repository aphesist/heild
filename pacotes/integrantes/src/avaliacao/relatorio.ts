import type { LinhaAvaliacao, Resultado } from './avaliar.ts'

/** Relatório da avaliação: acerto, erro crítico, custo e latência por setor e por papel. */

const pct = (n: number, d: number) => (d ? Math.round((n / d) * 1000) / 10 : 0)
const quantil = (xs: number[], q: number) => {
  if (!xs.length) return 0
  const o = [...xs].sort((a, b) => a - b)
  return o[Math.min(o.length - 1, Math.floor(o.length * q))]!
}
const contar = (ls: { resultado: Resultado }[], r: Resultado) => ls.filter((l) => l.resultado === r).length
const arred = (c: number) => Math.round(c * 10_000) / 10_000

export interface ResumoSetor {
  setor: string
  execucoes: number
  acerto_pct: number
  erro_critico: number
  cartao_desnecessario: number
  falha: number
  chamadas_por_execucao: number
  centavos_total: number
  centavos_por_execucao: number
  latencia_p50_ms: number
  latencia_p90_ms: number
  /** Margem contra a pessoa (decisão 8, AVALIAÇÃO 11.4): taxa de ERRO, só onde o gabarito traz o que a pessoa fez. */
  erro_integrante_pct: number | null
  erro_pessoa_pct: number | null
  margem_pontos: number | null
  dentro_da_margem: boolean | null
}

export interface ResumoPapel {
  papel: string
  modelos: string
  chamadas: number
  centavos_total: number
  latencia_p50_ms: number
  latencia_p90_ms: number
}

/**
 * A margem do piloto (decisão 8; AVALIAÇÃO 11.4): o desfecho é a taxa de erro que chega à pessoa.
 * O integrante pode errar no máximo 3 pontos percentuais a mais que a pessoa. Ir ao cartão não é erro.
 */
export const MARGEM_PONTOS = -3

export function margem(erro_integrante_pct: number, erro_pessoa_pct: number) {
  const pontos = Math.round((erro_pessoa_pct - erro_integrante_pct) * 10) / 10
  return { pontos, dentro: pontos >= MARGEM_PONTOS }
}

export function resumir(linhas: LinhaAvaliacao[]) {
  const setores = [...new Set(linhas.map((l) => l.setor))].sort()
  const porSetor: ResumoSetor[] = setores.map((setor) => {
    const ls = linhas.filter((l) => l.setor === setor)
    const n = ls.length
    const comPessoa = ls.filter((l) => l.resultado_pessoa !== null)
    const erroPessoa = comPessoa.length ? pct(comPessoa.filter((l) => l.resultado_pessoa === 'erro_critico').length, comPessoa.length) : null
    const erroIntegrante = comPessoa.length ? pct(contar(comPessoa, 'erro_critico'), comPessoa.length) : null
    const m = erroPessoa !== null && erroIntegrante !== null ? margem(erroIntegrante, erroPessoa) : null
    const centavos = ls.reduce((s, l) => s + l.centavos, 0)
    return {
      setor,
      execucoes: n,
      acerto_pct: pct(contar(ls, 'acerto'), n),
      erro_critico: contar(ls, 'erro_critico'),
      cartao_desnecessario: contar(ls, 'cartao_desnecessario'),
      falha: contar(ls, 'falha'),
      chamadas_por_execucao: n ? Math.round((ls.reduce((s, l) => s + l.chamadas.length, 0) / n) * 100) / 100 : 0,
      centavos_total: arred(centavos),
      centavos_por_execucao: n ? arred(centavos / n) : 0,
      latencia_p50_ms: quantil(ls.map((l) => l.latencia_ms), 0.5),
      latencia_p90_ms: quantil(ls.map((l) => l.latencia_ms), 0.9),
      erro_integrante_pct: erroIntegrante,
      erro_pessoa_pct: erroPessoa,
      margem_pontos: m?.pontos ?? null,
      dentro_da_margem: m?.dentro ?? null,
    }
  })
  const chamadas = linhas.flatMap((l) => l.chamadas)
  const papeis = [...new Set(chamadas.map((c) => c.classe))].sort()
  const porPapel: ResumoPapel[] = papeis.map((papel) => {
    const cs = chamadas.filter((c) => c.classe === papel)
    return {
      papel,
      modelos: [...new Set(cs.map((c) => c.modelo))].sort().join(','),
      chamadas: cs.length,
      centavos_total: arred(cs.reduce((s, c) => s + c.centavos, 0)),
      latencia_p50_ms: quantil(cs.map((c) => c.latencia_ms), 0.5),
      latencia_p90_ms: quantil(cs.map((c) => c.latencia_ms), 0.9),
    }
  })
  const total = {
    execucoes: linhas.length,
    acerto_pct: pct(contar(linhas, 'acerto'), linhas.length),
    erro_critico: contar(linhas, 'erro_critico'),
    centavos_total: arred(linhas.reduce((s, l) => s + l.centavos, 0)),
  }
  return { porSetor, porPapel, total }
}

export interface LinhaRota {
  caso: string
  esperado: string
  obtido: string
  camada: string | null
  resultado: Resultado
  centavos: number
  latencia_ms: number
  modelos: string
}

export function resumirRoteamento(linhas: LinhaRota[]) {
  const n = linhas.length
  const camadas = [...new Set(linhas.map((l) => l.camada ?? 'nenhuma'))].sort()
  return {
    execucoes: n,
    acerto_pct: pct(contar(linhas, 'acerto'), n),
    erro_critico: contar(linhas, 'erro_critico'),
    pergunta_desnecessaria: contar(linhas, 'cartao_desnecessario'),
    centavos_total: arred(linhas.reduce((s, l) => s + l.centavos, 0)),
    por_camada: camadas.map((c) => ({ camada: c, decisoes: linhas.filter((l) => (l.camada ?? 'nenhuma') === c).length })),
    latencia_p50_ms: quantil(linhas.map((l) => l.latencia_ms), 0.5),
    latencia_p90_ms: quantil(linhas.map((l) => l.latencia_ms), 0.9),
  }
}

/** Relatório em Markdown (tabelas), para docs/backend/relatorios. */
export function emMarkdown(r: ReturnType<typeof resumir>, rota?: ReturnType<typeof resumirRoteamento>, reaisPorCentavo = 0.01) {
  const brl = (c: number) => `R$ ${(c * reaisPorCentavo).toFixed(4).replace('.', ',')}`
  const l: string[] = []
  l.push('| Setor | Execuções | Acerto | Erro crítico | Cartão desnecessário | Falha | Chamadas/execução | Custo total | Custo/execução | p50 | p90 | Margem contra a pessoa |')
  l.push('| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |')
  for (const s of r.porSetor)
    l.push(`| ${s.setor} | ${s.execucoes} | ${s.acerto_pct}% | ${s.erro_critico} | ${s.cartao_desnecessario} | ${s.falha} | ${s.chamadas_por_execucao} | ${brl(s.centavos_total)} | ${brl(s.centavos_por_execucao)} | ${(s.latencia_p50_ms / 1000).toFixed(1)} s | ${(s.latencia_p90_ms / 1000).toFixed(1)} s | ${s.margem_pontos === null ? '—' : `${s.margem_pontos} pontos (${s.dentro_da_margem ? 'dentro' : 'fora'})`} |`)
  l.push('', '| Papel | Modelos | Chamadas | Custo | p50 | p90 |', '| --- | --- | --- | --- | --- | --- |')
  for (const p of r.porPapel) l.push(`| ${p.papel} | ${p.modelos} | ${p.chamadas} | ${brl(p.centavos_total)} | ${(p.latencia_p50_ms / 1000).toFixed(1)} s | ${(p.latencia_p90_ms / 1000).toFixed(1)} s |`)
  if (rota) {
    l.push('', '| Roteamento | Pedidos | Acerto | Erro crítico | Pergunta desnecessária | Custo | Camadas | p50 | p90 |', '| --- | --- | --- | --- | --- | --- | --- | --- | --- |')
    l.push(`| cascata | ${rota.execucoes} | ${rota.acerto_pct}% | ${rota.erro_critico} | ${rota.pergunta_desnecessaria} | ${brl(rota.centavos_total)} | ${rota.por_camada.map((c) => `${c.camada} ${c.decisoes}`).join(', ')} | ${(rota.latencia_p50_ms / 1000).toFixed(1)} s | ${(rota.latencia_p90_ms / 1000).toFixed(1)} s |`)
  }
  return l.join('\n')
}

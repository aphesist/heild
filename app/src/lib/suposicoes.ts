/**
 * Suposições por regra (fase 6, feedforward): enquanto a pessoa escreve um
 * pedido, o que dá para tirar do texto sem modelo (cliente pelo nome ou CNPJ,
 * competência, setor pelas palavras do mapa, valor em reais, prazo). Cada
 * suposição guarda o trecho do texto que a gerou, para o campo sublinhar e
 * abrir o seletor dali. O serviço simulado de IA pode completar depois
 * (origem `ia`); a regra vem primeiro e nunca espera rede.
 */
export type CampoSuposicao = 'cliente' | 'competencia' | 'setor' | 'valor' | 'prazo'

export interface Suposicao {
  campo: CampoSuposicao
  /** O valor suposto (id do cliente, "10/2026", id do setor, número, ISO). */
  valor: string | number
  /** Trecho do pedido que gerou a suposição (índices no texto). */
  trecho?: { ini: number; fim: number }
  origem: 'regra' | 'ia' | 'padrao' | 'pessoa'
}

export interface ContextoSuposicoes {
  clientes: { id: string; nome: string; cnpj?: string; apelido?: string }[]
  setores: { id: string; rotulo: string; palavras: string[] }[]
  /** Competência quando o texto não diz (a do mês corrente da operação). */
  competenciaPadrao?: string
  /** Hoje (ISO), para "amanhã", "sexta", "dia 20". */
  hoje?: string
}

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
const semAcento = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/** Acha o trecho de `agulha` em `texto` sem diferenciar acento e caixa. */
function achar(texto: string, agulha: string): { ini: number; fim: number } | undefined {
  const i = semAcento(texto).indexOf(semAcento(agulha))
  return i < 0 ? undefined : { ini: i, fim: i + agulha.length }
}

export function suporDoTexto(texto: string, ctx: ContextoSuposicoes): Suposicao[] {
  const saida: Suposicao[] = []
  const t = semAcento(texto)

  // Cliente: CNPJ (com ou sem máscara), nome inteiro, ou a primeira palavra marcante do nome ("Padaria").
  const digitos = texto.replace(/\D/g, '')
  const porCnpj = ctx.clientes.find((c) => c.cnpj && c.cnpj.replace(/\D/g, '').length === 14 && digitos.includes(c.cnpj.replace(/\D/g, '')))
  if (porCnpj) {
    const m = texto.match(/\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}/)
    saida.push({ campo: 'cliente', valor: porCnpj.id, trecho: m?.index !== undefined ? { ini: m.index, fim: m.index + m[0].length } : undefined, origem: 'regra' })
  } else {
    const candidatos = ctx.clientes
      .map((c) => {
        const nomes = [c.nome, c.apelido, c.nome.split(/\s+/).filter((p) => p.length > 3 && !/^(ltda|eireli|me|s\.?a\.?|comercio|servicos)$/i.test(p))[0]].filter(Boolean) as string[]
        const achado = nomes.map((n) => ({ n, tr: achar(texto, n) })).find((x) => x.tr)
        return achado ? { c, ...achado } : null
      })
      .filter(Boolean) as { c: ContextoSuposicoes['clientes'][number]; n: string; tr: { ini: number; fim: number } }[]
    const melhor = candidatos.sort((a, b) => b.n.length - a.n.length)[0]
    if (melhor) saida.push({ campo: 'cliente', valor: melhor.c.id, trecho: melhor.tr, origem: 'regra' })
  }

  // Competência: 10/2026, 10/26, "outubro" (do ano corrente), "mês passado".
  const mm = texto.match(/\b(0?[1-9]|1[0-2])\/(20\d{2}|\d{2})\b/)
  if (mm?.index !== undefined) {
    const ano = mm[2].length === 2 ? `20${mm[2]}` : mm[2]
    saida.push({ campo: 'competencia', valor: `${mm[1].padStart(2, '0')}/${ano}`, trecho: { ini: mm.index, fim: mm.index + mm[0].length }, origem: 'regra' })
  } else {
    const i = MESES.findIndex((m) => new RegExp(`\\b${semAcento(m)}\\b`).test(t))
    const ano = (ctx.competenciaPadrao ?? '').slice(3) || String(new Date().getFullYear())
    if (i >= 0) saida.push({ campo: 'competencia', valor: `${String(i + 1).padStart(2, '0')}/${ano}`, trecho: achar(texto, MESES[i]), origem: 'regra' })
    else if (ctx.competenciaPadrao) saida.push({ campo: 'competencia', valor: ctx.competenciaPadrao, origem: 'padrao' })
  }

  // Setor: a primeira palavra do mapa de cada setor que aparece no texto.
  for (const s of ctx.setores) {
    const p = s.palavras.find((w) => new RegExp(`\\b${semAcento(w)}\\b`).test(t))
    if (p) {
      saida.push({ campo: 'setor', valor: s.id, trecho: achar(texto, p), origem: 'regra' })
      break
    }
  }

  // Valor: R$ 1.234,56 ou 1.234,56 reais.
  const v = texto.match(/R\$\s?([\d.]+(?:,\d{1,2})?)|([\d.]+(?:,\d{1,2})?)\s?reais/i)
  if (v?.index !== undefined) {
    const n = Number((v[1] ?? v[2]).replace(/\./g, '').replace(',', '.'))
    if (!Number.isNaN(n)) saida.push({ campo: 'valor', valor: n, trecho: { ini: v.index, fim: v.index + v[0].length }, origem: 'regra' })
  }

  // Prazo: "até sexta", "amanhã", "dia 20", "20/11".
  const hoje = new Date(`${ctx.hoje ?? new Date().toISOString().slice(0, 10)}T12:00:00`)
  const iso = (d: Date) => d.toISOString().slice(0, 10)
  const dias = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado']
  const pz = t.match(/\b(amanha|(?:ate|para) hoje)\b|\bate (?:a |o )?(domingo|segunda|terca|quarta|quinta|sexta|sabado)\b|\bdia (\d{1,2})\b|\b(\d{1,2})\/(\d{1,2})\b(?!\/)/)
  if (pz?.index !== undefined) {
    let d = new Date(hoje)
    if (pz[1] === 'amanha') d.setDate(d.getDate() + 1)
    else if (pz[2]) {
      const alvo = dias.indexOf(pz[2])
      d.setDate(d.getDate() + ((alvo - d.getDay() + 7) % 7 || 7))
    } else if (pz[3]) {
      d = new Date(hoje.getFullYear(), hoje.getMonth() + (Number(pz[3]) < hoje.getDate() ? 1 : 0), Number(pz[3]), 12)
    } else if (pz[4]) d = new Date(hoje.getFullYear(), Number(pz[5]) - 1, Number(pz[4]), 12)
    if (!Number.isNaN(d.getTime()) && !(pz[4] && saida.some((s) => s.campo === 'competencia' && s.trecho && s.trecho.ini <= pz.index! && s.trecho.fim >= pz.index! + pz[0].length)))
      saida.push({ campo: 'prazo', valor: iso(d), trecho: { ini: pz.index, fim: pz.index + pz[0].length }, origem: 'regra' })
  }
  return saida
}

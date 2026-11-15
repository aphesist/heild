import type { ContextoSuposicoes, Suposicao } from './suposicoes'

/**
 * Serviço simulado de IA para as suposições (fase 6): chega depois da regra
 * e só completa o que a regra não achou. Não inventa: o cliente vem de um
 * nome parecido na carteira (erro de digitação, abreviação) ou do contexto da
 * tela; o setor, do contexto. Tudo marcado com origem `ia`, e a pessoa corrige
 * na própria faixa.
 */
export interface PadroesSuposicao {
  /** Cliente aberto na tela (a suposição mais provável quando o texto não diz). */
  clienteId?: string
  /** Setor da aba ou do integrante. */
  setor?: string
}

const semAcento = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/** Distância de edição pequena (até 2) entre palavras de 5+ letras: "padria" ≈ "padaria". */
function parecida(a: string, b: string) {
  if (Math.abs(a.length - b.length) > 2 || Math.min(a.length, b.length) < 5) return false
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)] as number[])
  for (let j = 1; j <= b.length; j++) d[0][j] = j
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
  return d[a.length][b.length] <= 2
}

export function suporComIa(texto: string, daRegra: Suposicao[], ctx: ContextoSuposicoes, padroes: PadroesSuposicao = {}, espera = 650): Promise<Suposicao[]> {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      const tem = (c: Suposicao['campo']) => daRegra.some((s) => s.campo === c)
      const extra: Suposicao[] = []
      if (!tem('cliente')) {
        const palavras = [...semAcento(texto).matchAll(/[a-z]{5,}/g)].map((m) => ({ p: m[0], ini: m.index ?? 0 }))
        const achado = ctx.clientes
          .flatMap((c) => semAcento(c.nome).split(/\s+/).filter((n) => n.length >= 5).map((n) => ({ c, n })))
          .map(({ c, n }) => ({ c, w: palavras.find((w) => w.p !== n && parecida(w.p, n)) }))
          .find((x) => x.w)
        if (achado?.w) extra.push({ campo: 'cliente', valor: achado.c.id, trecho: { ini: achado.w.ini, fim: achado.w.ini + achado.w.p.length }, origem: 'ia' })
        else if (padroes.clienteId && ctx.clientes.some((c) => c.id === padroes.clienteId)) extra.push({ campo: 'cliente', valor: padroes.clienteId, origem: 'ia' })
      }
      if (!tem('setor') && padroes.setor && ctx.setores.some((s) => s.id === padroes.setor)) extra.push({ campo: 'setor', valor: padroes.setor, origem: 'ia' })
      resolve(extra)
    }, espera)
  })
}

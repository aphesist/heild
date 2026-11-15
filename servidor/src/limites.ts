/**
 * Limite de taxa por ator, em memória do processo (STACK 5: sem Redis no começo; com mais
 * de uma instância, o limite de cada uma é o total dividido pelo número de instâncias).
 * Janela deslizante simples por minuto. OWASP API4:2023 (consumo sem limite).
 *
 * Padrões (API_INTERNA 1): equipe 300/min, app do cliente 60/min, login de demonstração
 * 30/min por IP. Estourou: 429 LIMITE_TAXA com `tentar_de_novo_em`.
 */
export interface Limite {
  porMinuto: number
}

export const LIMITES = {
  equipe: { porMinuto: Number(process.env.HEILD_LIMITE_EQUIPE ?? 300) },
  cliente: { porMinuto: Number(process.env.HEILD_LIMITE_CLIENTE ?? 60) },
  login: { porMinuto: Number(process.env.HEILD_LIMITE_LOGIN ?? 30) },
} satisfies Record<string, Limite>

const janelas = new Map<string, { inicio: number; usados: number }>()

/** Conta uma chamada; devolve null se cabe, ou quando tentar de novo. */
export function consumir(chave: string, limite: Limite, agora = Date.now()): string | null {
  const j = janelas.get(chave)
  if (!j || agora - j.inicio >= 60_000) {
    janelas.set(chave, { inicio: agora, usados: 1 })
    return null
  }
  if (j.usados >= limite.porMinuto) return new Date(j.inicio + 60_000).toISOString()
  j.usados++
  return null
}

// Limpa janelas velhas a cada minuto, sem segurar o processo aberto.
setInterval(() => {
  const agora = Date.now()
  for (const [k, j] of janelas) if (agora - j.inicio >= 60_000) janelas.delete(k)
}, 60_000).unref()

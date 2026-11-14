import { ErroServico, type Resultado } from './tipos'

/**
 * Motor das respostas simuladas: espera uma latência plausível (a tela
 * mostra "pensando"), devolve os dados marcados como demonstração e, se
 * pedido, falha de vez em quando (para a tela mostrar o estado de erro).
 */

export interface OpcoesSimulacao {
  /** Faixa de latência em ms (padrão 600 a 1400). */
  latencia?: [number, number]
  /** Probabilidade de falhar (0 a 1). Padrão 0: a demonstração não falha sozinha. */
  falha?: number
  mensagemFalha?: string
}

/** Liga falhas simuladas em todos os serviços (painel da demonstração: "simular instabilidade"). */
let instabilidade = 0
export const definirInstabilidade = (p: number) => {
  instabilidade = p
}

/** Acelera a latência (testes automatizados ligam `0`). */
let escala = 1
export const definirEscalaLatencia = (e: number) => {
  escala = e
}

export const esperar = (ms: number) => new Promise<void>((r) => setTimeout(r, ms * escala))

export async function simular<T>(fonte: string, gerar: () => T, opcoes: OpcoesSimulacao = {}): Promise<Resultado<T>> {
  const [min, max] = opcoes.latencia ?? [600, 1400]
  const ms = Math.round(min + Math.random() * (max - min))
  await esperar(ms)
  if (Math.random() < Math.max(opcoes.falha ?? 0, instabilidade)) throw new ErroServico(fonte, 'indisponivel', opcoes.mensagemFalha ?? `${fonte} não respondeu (falha simulada). Tente de novo.`)
  return { dados: gerar(), demonstracao: true, fonte, latencia_ms: ms, gerado_em: new Date().toISOString() }
}

/** Escolhe um item de uma lista de forma estável para a mesma chave (a mesma pergunta dá a mesma resposta). */
export function escolher<T>(chave: string, opcoes: T[]): T {
  let h = 0
  for (const c of chave) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return opcoes[h % opcoes.length]
}

/** Números e códigos de faz de conta, com a cara dos reais. */
export const ficticio = {
  protocolo: () => `${new Date().getFullYear()}${String(Math.floor(Math.random() * 1e10)).padStart(10, '0')}`,
  chave44: () => Array.from({ length: 44 }, () => Math.floor(Math.random() * 10)).join(''),
  txid: () => Array.from({ length: 26 }, () => 'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)]).join(''),
  id: (p: string) => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
}

export const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

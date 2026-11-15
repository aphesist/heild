import type { Classe } from './contrato.ts'

/**
 * Interface do fornecedor de modelos. A B2 não chama modelo de verdade: o runner fala só com esta
 * interface, e o fornecedor real (escolha da frente de IA) entra como outra implementação, com a
 * chave do fornecedor só no serviço `operarios` (AGENTICO 4.3).
 */
export interface PedidoModelo {
  contrato: string
  contrato_versao: number
  classe: Classe
  modelo: string
  /** Instrução fixa do contrato (prefixo estável para cache). */
  instrucao: string
  /** JSON Schema estrito da saída (o fornecedor real usa saída estruturada). */
  esquema_saida: unknown
  /** Entrada do contrato, com o conteúdo de fora envelopado como dado. */
  entrada: unknown
  max_tokens_saida: number
  /** O esquema Zod do contrato (o fornecedor real o usa para a saída estruturada; o runner valida de novo). */
  devolve?: import('zod').ZodType
  /** Na escalada: o que o validador recusou na tentativa anterior. */
  falha_anterior?: { validador: string; codigo?: string; mensagem?: string }[]
}

export interface RespostaModelo {
  saida: unknown
  modelo: string
  tokens_entrada: number
  tokens_saida: number
  tokens_cache: number
}

export interface FornecedorModelo {
  nome: string
  /** Quantas vezes o teto de saída do contrato o fornecedor pode gastar (raciocínio adaptativo). Entra na reserva de orçamento. */
  multiplicadorSaida?: number
  chamar(p: PedidoModelo): Promise<RespostaModelo>
}

/** Preço por milhão de tokens, em centavos de real. */
export interface PrecoModelo {
  entrada: number
  saida: number
  cache: number
}

/**
 * Configuração da frente de IA: o modelo de cada classe (com troca por contrato quando o piloto
 * provar, decisão 3) e o preço de cada modelo. A B2 só traz a configuração de demonstração.
 */
export interface ConfigModelos {
  porClasse: Record<Classe, string>
  porContrato?: Record<string, Partial<Record<Classe, string>>>
  precos: Record<string, PrecoModelo>
}

export const configDemonstracao: ConfigModelos = {
  porClasse: { operario: 'demo-operario', escritor: 'demo-escritor', revisor: 'demo-revisor' },
  // Valores fictícios, só para exercitar orçamento e débito. Os reais são da frente de IA.
  precos: {
    'demo-operario': { entrada: 1_600, saida: 8_000, cache: 160 },
    'demo-escritor': { entrada: 1_600, saida: 8_000, cache: 160 },
    'demo-revisor': { entrada: 8_000, saida: 40_000, cache: 800 },
  },
}

export function modeloPara(cfg: ConfigModelos, contrato: string, classe: Classe) {
  return cfg.porContrato?.[contrato]?.[classe] ?? cfg.porClasse[classe]
}

export const tokensDe = (v: unknown) => Math.ceil(JSON.stringify(v ?? null).length / 4)

/**
 * Centavos com seis casas (frações de centavo, coluna numeric(18,6)): a bolsa debita o custo da
 * chamada, sem arredondar cada uma para o centavo de cima (B3; o teste real de 15/11 mostrou ~60%
 * a mais por causa do arredondamento em chamadas tão pequenas).
 */
export const arredondarCentavos = (c: number) => Math.round(c * 1_000_000) / 1_000_000

export function centavosDe(preco: PrecoModelo, t: { tokens_entrada: number; tokens_saida: number; tokens_cache: number }) {
  return arredondarCentavos((t.tokens_entrada * preco.entrada + t.tokens_saida * preco.saida + t.tokens_cache * preco.cache) / 1_000_000)
}

/** Estimativa conservadora (entrada inteira sem cache + teto de saída): é o que se reserva antes. */
export function estimar(preco: PrecoModelo, p: Pick<PedidoModelo, 'instrucao' | 'entrada' | 'esquema_saida' | 'max_tokens_saida' | 'falha_anterior'>) {
  const tokens_entrada = tokensDe(p.instrucao) + tokensDe(p.esquema_saida) + tokensDe(p.entrada) + tokensDe(p.falha_anterior ?? null)
  const tokens = tokens_entrada + p.max_tokens_saida
  return { tokens, centavos: centavosDe(preco, { tokens_entrada, tokens_saida: p.max_tokens_saida, tokens_cache: 0 }) }
}

type Responder = (entrada: any, pedido: PedidoModelo) => unknown | Promise<unknown>

/**
 * Operário de demonstração: determinístico, responde por contrato e devolve contagem de tokens
 * estimada. Respeita o contrato (a saída passa pelo mesmo Zod que a de um modelo real). Os testes
 * trocam a resposta para simular erro de modelo e provar que o validador barra.
 */
export class FornecedorDemonstracao implements FornecedorModelo {
  readonly nome = 'demonstracao'
  readonly chamadas: PedidoModelo[] = []
  private readonly respostas = new Map<string, Responder>()

  responder(contrato: string, fn: Responder) {
    this.respostas.set(contrato, fn)
    return this
  }

  async chamar(p: PedidoModelo): Promise<RespostaModelo> {
    this.chamadas.push(p)
    const fn = this.respostas.get(p.contrato)
    if (!fn) throw new Error(`Operário de demonstração sem resposta para o contrato ${p.contrato}`)
    const saida = await fn((p.entrada as { dados: unknown }).dados, p)
    const tokens_saida = Math.min(tokensDe(saida), p.max_tokens_saida)
    return { saida, modelo: p.modelo, tokens_entrada: tokensDe(p.instrucao) + tokensDe(p.esquema_saida) + tokensDe(p.entrada), tokens_saida, tokens_cache: 0 }
  }
}

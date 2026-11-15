import Anthropic from '@anthropic-ai/sdk'
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod'
import type { Classe } from './contrato.ts'
import type { ConfigModelos, FornecedorModelo, PedidoModelo, RespostaModelo } from './fornecedor.ts'

/**
 * Fornecedor real: a API do Claude, pelo SDK oficial. Só é usado quando ligado por variável de
 * ambiente (HEILD_IA_FORNECEDOR=anthropic); o padrão dos testes continua o operário de demonstração.
 *
 * A chave NUNCA está no código: o SDK lê ANTHROPIC_API_KEY (ou um perfil do `ant auth login`)
 * do ambiente do serviço `operarios`, o único que deve tê-la (AGENTICO 4.3).
 *
 * O que o backend garante aqui (o conteúdo dos prompts e a escolha final de modelos são da frente de IA):
 *  - saída estruturada pelo próprio esquema do contrato (o runner valida de novo pelo Zod);
 *  - instrução fixa no `system` (prefixo estável, pronto para cache) e só a entrada do contrato no `user`;
 *  - recusa do modelo vira saída nula (o validador barra e o motor escala), nunca texto livre aceito;
 *  - fallback de recusa do lado do servidor ligado (`fallbacks: "default"`).
 */
export class FornecedorAnthropic implements FornecedorModelo {
  readonly nome = 'anthropic'
  /** Folga para o raciocínio adaptativo: o pedido sai com 4× o teto do contrato, e a reserva conta isso. */
  readonly multiplicadorSaida = 4
  private cliente: Anthropic | null = null
  constructor(
    private readonly opcoes: { esforco?: Record<Classe, 'low' | 'medium' | 'high' | 'xhigh' | 'max'>; tempoLimiteMs?: number } = {},
  ) {}

  /** O cliente nasce na primeira chamada: montar o fornecedor não exige credencial (só chamar). */
  private api() {
    this.cliente ??= new Anthropic({ timeout: this.opcoes.tempoLimiteMs ?? 120_000, maxRetries: 2 })
    return this.cliente
  }

  async chamar(p: PedidoModelo): Promise<RespostaModelo> {
    if (!p.devolve) throw new Error(`Contrato ${p.contrato} sem esquema Zod para a saída estruturada.`)
    const esforco = this.opcoes.esforco?.[p.classe] ?? 'medium'
    const resposta = await this.api().beta.messages.parse({
      model: p.modelo,
      max_tokens: p.max_tokens_saida, // já multiplicado pelo runner (multiplicadorSaida), o mesmo valor reservado no orçamento
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort: esforco, format: betaZodOutputFormat(p.devolve) },
      system: p.instrucao,
      messages: [
        {
          role: 'user',
          content: JSON.stringify({ entrada: p.entrada, ...(p.falha_anterior ? { falha_anterior: p.falha_anterior } : {}) }),
        },
      ],
    })
    const recusou = resposta.stop_reason === 'refusal' || resposta.stop_reason === 'max_tokens'
    return {
      saida: recusou ? null : resposta.parsed_output,
      modelo: resposta.model,
      tokens_entrada: resposta.usage.input_tokens + (resposta.usage.cache_creation_input_tokens ?? 0),
      tokens_saida: resposta.usage.output_tokens,
      tokens_cache: resposta.usage.cache_read_input_tokens ?? 0,
    }
  }
}

/**
 * Configuração pela decisão 3 do dono (docs/integrantes/DECISOES.md): Sonnet como operário e
 * escritor, Opus como revisor; o Haiku só entra por contrato quando o piloto provar. Preços em
 * centavos de real por milhão de tokens, convertidos pela cotação do ambiente (HEILD_DOLAR_REAIS).
 */
export function configAnthropic(dolarEmReais: number): ConfigModelos {
  const c = (usd: number) => Math.round(usd * dolarEmReais * 100)
  return {
    porClasse: { operario: 'claude-sonnet-5-5', escritor: 'claude-sonnet-5-5', revisor: 'claude-opus-5-5' },
    precos: {
      'claude-sonnet-5-5': { entrada: c(2), saida: c(10), cache: c(0.1) },
      'claude-sonnet-5': { entrada: c(2), saida: c(10), cache: c(0.2) },
      'claude-opus-5-5': { entrada: c(4), saida: c(20), cache: c(0.2) },
      'claude-opus-4-8': { entrada: c(5), saida: c(25), cache: c(0.5) },
      'claude-haiku-5-5': { entrada: c(0.1), saida: c(0.5), cache: c(0.01) },
    },
  }
}

/** Liga o fornecedor real só com HEILD_IA_FORNECEDOR=anthropic; sem isso, devolve null (fica o simulado). */
export function fornecedorDoAmbiente(env = process.env): { fornecedor: FornecedorModelo; modelos: ConfigModelos } | null {
  if (env.HEILD_IA_FORNECEDOR !== 'anthropic') return null
  const dolar = Number(env.HEILD_DOLAR_REAIS)
  if (!Number.isFinite(dolar) || dolar <= 0) throw new Error('Defina HEILD_DOLAR_REAIS (cotação do dólar em reais) para converter o custo das chamadas.')
  const nivel = (v: string | undefined, padrao: 'low' | 'medium' | 'high') => (v as 'low' | 'medium' | 'high') ?? padrao
  return {
    fornecedor: new FornecedorAnthropic({
      esforco: { operario: nivel(env.HEILD_IA_ESFORCO_OPERARIO, 'low'), escritor: nivel(env.HEILD_IA_ESFORCO_ESCRITOR, 'medium'), revisor: nivel(env.HEILD_IA_ESFORCO_REVISOR, 'high') },
    }),
    modelos: configAnthropic(dolar),
  }
}

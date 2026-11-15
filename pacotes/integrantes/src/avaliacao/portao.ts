import type { ConfigModelos } from '@heild/processos'
import { avaliar, type AmbienteAvaliacao, type CasoGabarito, type LinhaAvaliacao } from './avaliar.ts'

/**
 * O portão do Haiku (decisão 3): o Haiku só entra como operário num passo (contrato) se, no mesmo
 * gabarito, ele igualar o Sonnet: zero erro crítico e acerto em todo caso em que o Sonnet acertou.
 * Fora disso, o contrato continua no Sonnet. O resultado é a linha de configuração, ou nada.
 */

export interface DecisaoPortao {
  contrato: string
  liberado: boolean
  motivo: string
  acerto_sonnet: number
  acerto_haiku: number
  erro_critico_haiku: number
  casos_piores: string[]
  /**
   * Quantas execuções escalaram ao escritor e quanto custaram, de cada lado. A escalada não esconde
   * erro (erro com confiança alta passa nos validadores e conta como erro crítico), mas tira a
   * economia: um Haiku que escala muito mais que o Sonnet não compensa.
   */
  escaladas_sonnet: number
  escaladas_haiku: number
  centavos_sonnet: number
  centavos_haiku: number
  /** O que entra em `ConfigModelos.porContrato` quando liberado. */
  configuracao: Record<string, { operario: string }> | null
}

export function decidirPortaoHaiku(contrato: string, sonnet: LinhaAvaliacao[], haiku: LinhaAvaliacao[], modeloHaiku = 'claude-haiku-5-5'): DecisaoPortao {
  const chave = (l: LinhaAvaliacao) => `${l.caso}#${l.rodada}`
  const h = new Map(haiku.map((l) => [chave(l), l]))
  const piores = sonnet.filter((s) => s.resultado === 'acerto' && h.get(chave(s))?.resultado !== 'acerto').map((s) => s.caso)
  const acerto_sonnet = sonnet.filter((l) => l.resultado === 'acerto').length
  const acerto_haiku = haiku.filter((l) => l.resultado === 'acerto').length
  const erro_critico_haiku = haiku.filter((l) => l.resultado === 'erro_critico').length
  const faltando = sonnet.some((s) => !h.has(chave(s)))
  const liberado = !faltando && sonnet.length > 0 && erro_critico_haiku === 0 && piores.length === 0 && acerto_haiku >= acerto_sonnet
  const motivo = liberado
    ? `Haiku igualou o Sonnet em ${sonnet.length} casos, sem erro crítico.`
    : faltando
      ? 'O Haiku não rodou todos os casos do Sonnet.'
      : erro_critico_haiku
        ? `Haiku teve ${erro_critico_haiku} erro(s) crítico(s).`
        : piores.length
          ? `Haiku errou onde o Sonnet acertou: ${[...new Set(piores)].join(', ')}.`
          : 'Sem casos para comparar.'
  const escaladas = (ls: LinhaAvaliacao[]) => ls.filter((l) => (l.chamadas ?? []).some((c) => c.classe === 'escritor')).length
  const custo = (ls: LinhaAvaliacao[]) => Math.round(ls.reduce((a, l) => a + (l.centavos ?? 0), 0) * 10_000) / 10_000
  return {
    contrato, liberado, motivo, acerto_sonnet, acerto_haiku, erro_critico_haiku, casos_piores: [...new Set(piores)],
    escaladas_sonnet: escaladas(sonnet), escaladas_haiku: escaladas(haiku), centavos_sonnet: custo(sonnet), centavos_haiku: custo(haiku),
    configuracao: liberado ? { [contrato]: { operario: modeloHaiku } } : null }
}

/**
 * Roda o gabarito de um contrato duas vezes, com o Sonnet e com o Haiku como operário daquele
 * contrato, e decide. Troca o modelo só do contrato, na configuração que o motor usa, e devolve
 * a configuração ao estado anterior no fim, qualquer que seja o resultado.
 */
export async function rodarPortaoHaiku(
  a: AmbienteAvaliacao,
  modelos: ConfigModelos,
  contrato: string,
  casos: CasoGabarito[],
  o: { repeticoes?: number; sonnet?: string; haiku?: string; concorrencia?: number } = {},
) {
  const antes = modelos.porContrato?.[contrato]
  const usar = (modelo: string) => {
    modelos.porContrato = { ...modelos.porContrato, [contrato]: { ...modelos.porContrato?.[contrato], operario: modelo } }
  }
  try {
    usar(o.sonnet ?? 'claude-sonnet-5-5')
    const sonnet = await avaliar(a, casos, { repeticoes: o.repeticoes, concorrencia: o.concorrencia })
    usar(o.haiku ?? 'claude-haiku-5-5')
    const haiku = await avaliar(a, casos, { repeticoes: o.repeticoes, concorrencia: o.concorrencia })
    return { decisao: decidirPortaoHaiku(contrato, sonnet, haiku, o.haiku ?? 'claude-haiku-5-5'), sonnet, haiku }
  } finally {
    const resto = { ...modelos.porContrato }
    if (antes) resto[contrato] = antes
    else delete resto[contrato]
    modelos.porContrato = resto
  }
}

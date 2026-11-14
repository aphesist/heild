import type { Anexo, Cartao, Integrante } from '@/dados/tipos'
import { useLoja } from '@/ambiente/loja'
import { pedidosAssistente, respostasProntas } from '@/dados/simulacao'
import { pedirAoTime } from '../pedidoAoTime'
import type { useHistorico } from '../useHistorico'

/**
 * Roteador do Geral (02, 9.1; S01-A08): decide o que fazer com a mensagem.
 * Pedido ao time → passa aos integrantes e acompanha; o resto, resposta
 * pronta ou roteiro da S01. O Geral só roteia, consulta e acompanha; nunca
 * executa efeito em setor.
 */

export interface RespostaRoteiro {
  texto: string
  cartoes?: Cartao[]
}

/** Roteiros da S01 no chat de um integrante (null = segue o padrão). */
export function respostaDoIntegrante(_integrante: Integrante, _texto: string, _anexos: Anexo[]): RespostaRoteiro | null {
  return null
}

/** Envio no chat do Geral (Início › Assistente e gaveta do Chat): a mesma decisão nos dois lugares. */
export function useEnviarAoGeral(conversa: ReturnType<typeof useHistorico>) {
  const loja = useLoja()
  return (texto: string, anexos: Anexo[]) => {
    const pedido = pedidosAssistente.find((p) => p.texto.toLowerCase() === texto.trim().toLowerCase())
    if (pedido) return pedirAoTime(pedido, conversa.atual.id, conversa.enviar, loja)
    const pronta = respostasProntas.find((r) => r.re.test(texto))
    conversa.enviar(texto, anexos, !anexos.length && pronta ? { texto: pronta.texto } : undefined)
  }
}

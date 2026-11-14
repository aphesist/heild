import { useState } from 'react'
import { useLoja } from '@/ambiente/loja'
import { fluxos, respostasProntas } from '@/dados/simulacao'
import type { Anexo, Integrante } from '@/dados/tipos'
import { agora, respostaDeExemplo } from '../useConversa'
import { respostaDoIntegrante } from './roteador'

/**
 * Envio no chat de um integrante (Time e gaveta do Chat): o pedido que é
 * trabalho (as sugestões dele) vira trabalho simulado, com etapas e aviso ao
 * terminar; o resto ele responde (resposta pronta, roteiro da S01 ou exemplo).
 * A conversa mora na loja (sair e voltar mantém o que foi dito).
 */
export function useEnviarAoIntegrante(integrante: Integrante, nomeUsuario: string) {
  const loja = useLoja()
  const [pensando, setPensando] = useState(false)
  const enviar = (texto: string, anexos: Anexo[]) => {
    loja.mensagemTimeComId(integrante.id, { id: crypto.randomUUID(), autor: { tipo: 'usuario', nome: nomeUsuario }, hora: agora(), texto, anexos })
    const fluxo = Object.values(fluxos).find((f) => f.integrante === integrante.id && f.gatilho?.test(texto))
    if (fluxo && !anexos.length) return loja.iniciarTrabalho(fluxo)
    const id = crypto.randomUUID()
    loja.mensagemTimeComId(integrante.id, { id, autor: { tipo: 'integrante', setor: integrante.setor, nome: integrante.nome, cor: integrante.cor }, hora: agora(), pendente: true })
    setPensando(true)
    const pronta = respostasProntas.find((r) => r.re.test(texto))
    const roteiro = respostaDoIntegrante(integrante, texto, anexos)
    window.setTimeout(() => {
      setPensando(false)
      const r = roteiro ?? { texto: !anexos.length && pronta ? pronta.texto : respostaDeExemplo(anexos) }
      loja.ajustarMensagemTime(integrante.id, id, { pendente: false, escrever: true, escreverDesde: Date.now(), hora: agora(), texto: r.texto, cartoes: r.cartoes, demonstracao: true })
    }, 2200)
  }
  return { enviar, pensando }
}

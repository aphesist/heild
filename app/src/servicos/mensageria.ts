import { esperar, ficticio, simular } from './simular'
import type { Resultado } from './tipos'

/**
 * WhatsApp (Cloud API da Meta ou provedor, subplano 04) e e-mail
 * (notificações, régua de cobrança, comunicados). No produto: o provedor
 * contratado, com modelos aprovados fora da janela de 24 h. Aqui: o envio
 * passa por enviada, entregue e lida com o tempo de verdade.
 */

export type StatusEntrega = 'enviada' | 'entregue' | 'lida' | 'falhou'

export interface ServicoWhatsApp {
  enviar(m: { para: string; texto?: string; modelo?: string; variaveis?: Record<string, string>; anexos?: string[] }): Promise<Resultado<{ id_externo: string; status: StatusEntrega }>>
  /** Acompanha a entrega: chama `aoMudar` a cada status; devolve a função que para de acompanhar. */
  acompanhar(idExterno: string, aoMudar: (s: StatusEntrega) => void): () => void
  /** Janela de 24 h aberta (texto livre) ou fechada (só modelo aprovado). */
  janelaAberta(para: string): Promise<Resultado<boolean>>
}

export interface ServicoEmail {
  enviar(m: { para: string[]; assunto: string; corpo: string; anexos?: string[] }): Promise<Resultado<{ id_externo: string; aceito: boolean }>>
}

export const whatsappDemonstracao: ServicoWhatsApp = {
  enviar: (m) => {
    if (!m.texto && !m.modelo) throw new Error('Mensagem vazia: escreva um texto ou escolha um modelo.')
    return simular('WhatsApp Cloud API', () => ({ id_externo: ficticio.id('wamid'), status: 'enviada' as const }), { latencia: [300, 700] })
  },
  acompanhar(_id, aoMudar) {
    let vivo = true
    void (async () => {
      await esperar(1400)
      if (vivo) aoMudar('entregue')
      await esperar(2800)
      if (vivo) aoMudar('lida')
    })()
    return () => {
      vivo = false
    }
  },
  janelaAberta: (para) => simular('WhatsApp Cloud API', () => !para.endsWith('0'), { latencia: [150, 300] }),
}

export const emailDemonstracao: ServicoEmail = {
  enviar: (m) => simular('E-mail (envio transacional)', () => ({ id_externo: ficticio.id('msg'), aceito: m.para.every((x) => /\S+@\S+\.\S+/.test(x)) }), { latencia: [400, 900] }),
}

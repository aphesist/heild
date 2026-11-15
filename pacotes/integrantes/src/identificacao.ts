/**
 * Quem fala com o cliente (04, A.6; resposta do Enzo à P3, 15/11/2026). No número compartilhado, e
 * sempre que a conversa continua num número que não é o do setor, a mensagem que sai leva o prefixo
 * de quem está falando, em negrito no WhatsApp:
 *   - pessoa: *{Setor} · {Nome}* (ex.: "*DP · Ana*");
 *   - integrante: *{Nome do integrante} (IA)* (ex.: "*Integrante de Atendimento (IA)*");
 *   - chatbot e mensagens automáticas: *{Escritório}*.
 * O prefixo vai na primeira mensagem de cada um numa sequência e de novo quando quem fala muda.
 */
export type QuemFala =
  | { tipo: 'pessoa'; setor: string; nome: string }
  | { tipo: 'integrante'; nome: string }
  | { tipo: 'sistema'; escritorio: string }

/** Nome exibido dos setores de destino, para o prefixo e para as opções perguntadas ao cliente. */
export const NOME_DO_SETOR: Record<string, string> = {
  contabil: 'Contábil',
  fiscal: 'Fiscal',
  dp: 'DP',
  societario: 'Societário',
  gestao_atendimento: 'Atendimento',
}

/** O integrante nunca se passa por pessoa: o "(IA)" é obrigatório e não pode ser desligado. */
export function prefixoDeQuemFala(q: QuemFala): string {
  const limpo = (t: string) => t.replace(/[*_~\n]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60)
  if (q.tipo === 'pessoa') return `*${limpo(NOME_DO_SETOR[q.setor] ?? q.setor)} · ${limpo(q.nome)}*`
  // O servidor marca o integrante com " (integrante)" nos textos; ao cliente, a marca é "(IA)".
  if (q.tipo === 'integrante') return `*${limpo(q.nome.replace(/\s*\(integrante\)\s*$/i, ''))} (IA)*`
  return `*${limpo(q.escritorio)}*`
}

/**
 * Monta a mensagem com o prefixo. `anterior` é quem falou por último na sequência de saída da
 * conversa: se for o mesmo, o prefixo não se repete.
 */
export function comQuemFala(q: QuemFala, texto: string, anterior?: QuemFala | null): string {
  if (anterior && prefixoDeQuemFala(anterior) === prefixoDeQuemFala(q)) return texto
  return `${prefixoDeQuemFala(q)}\n${texto}`
}

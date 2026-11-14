import { esperar, escolher, simular } from './simular'
import type { Resultado } from './tipos'

/**
 * Integrantes de IA e Assistente (subplanos 02 e 07). No produto: um modelo
 * de linguagem com as ferramentas tipadas e o escopo do dono. Aqui: respostas
 * roteirizadas por palavra-chave, com "pensando" e o texto chegando aos
 * poucos, como num modelo de verdade.
 */

export interface PedidoIA {
  /** Integrante que responde (`geral` é o Assistente). */
  setor: string
  pergunta: string
  cliente?: string
}

export interface RespostaIA {
  texto: string
  /** Ferramentas que o integrante "chamou" (aparecem na linha do tempo do integrante). */
  ferramentas: string[]
  /** Grau de segurança da resposta (o Consultor sempre informa). */
  grau: 'alto' | 'médio' | 'baixo'
}

export interface ServicoIA {
  responder(p: PedidoIA): Promise<Resultado<RespostaIA>>
  /** Mesmo que `responder`, entregando o texto em pedaços (`aoEscrever` recebe o texto até ali). */
  responderAoVivo(p: PedidoIA, aoEscrever: (parcial: string) => void, aoPensar?: (pensando: boolean) => void): Promise<Resultado<RespostaIA>>
  /** Resumo de um texto longo (conversa, fio, documento). */
  resumir(texto: string): Promise<Resultado<string>>
}

const roteiro: { chaves: RegExp; setor?: string; resposta: (p: PedidoIA) => RespostaIA }[] = [
  {
    chaves: /pgdas|simples|das\b/i,
    resposta: (p) => ({ texto: `Conferi o PGDAS-D${p.cliente ? ` de ${p.cliente}` : ''}: a receita de outubro bate com as notas emitidas e o anexo III está certo. A guia fica pronta para transmitir; a transmissão precisa da sua aprovação.`, ferramentas: ['documento.listar', 'obrigacao.listar_aplicaveis'], grau: 'alto' }),
  },
  {
    chaves: /fator r|folha|pró-labore|pro-labore/i,
    resposta: () => ({ texto: 'Pelo fator R, a folha dos últimos 12 meses precisa ser ao menos 28% da receita bruta. Com os números de outubro, a empresa fica em 31%: segue no anexo III. Se a folha cair, vai para o V.', ferramentas: ['legal.consultar', 'timesheet.listar_sessoes'], grau: 'médio' }),
  },
  {
    chaves: /pendên|pendenc|documento|extrato|falta/i,
    resposta: () => ({ texto: 'Três clientes estão devendo documentos: Padaria Pão Quente (extrato de outubro, 6 dias), Loja Bela Vista (notas de entrada, 3 dias) e Clínica Sorriso (folha de pagamento, 2 dias). Quer que eu mande a cobrança pelo WhatsApp?', ferramentas: ['pendencia.listar'], grau: 'alto' }),
  },
  {
    chaves: /prazo|vence|venc/i,
    resposta: () => ({ texto: 'Nesta semana vencem a DCTFWeb (dia 15, 6 clientes), o FGTS Digital (dia 20) e o PGDAS-D (dia 20, 14 clientes). Nada atrasado no Fiscal; no DP, a folha da Metalúrgica ainda espera o ponto.', ferramentas: ['tarefa.listar'], grau: 'alto' }),
  },
]

const genericas = [
  'Entendi. Olhei o que está no sistema e preparei um resumo: nada urgente agora, e as próximas obrigações estão no calendário. Quer que eu abra uma tarefa?',
  'Posso fazer isso. Vou separar o que preciso e te aviso quando estiver pronto; o que depender de aprovação chega como cartão.',
  'Não encontrei nada fora do comum. Se quiser, detalho por cliente ou por setor.',
]

function roteirizar(p: PedidoIA): RespostaIA {
  const r = roteiro.find((x) => x.chaves.test(p.pergunta) && (!x.setor || x.setor === p.setor))
  return r ? r.resposta(p) : { texto: escolher(p.pergunta, genericas), ferramentas: [], grau: 'médio' }
}

export const iaDemonstracao: ServicoIA = {
  responder: (p) => simular('Integrante (IA)', () => roteirizar(p), { latencia: [900, 1800] }),
  async responderAoVivo(p, aoEscrever, aoPensar) {
    aoPensar?.(true)
    const r = await simular('Integrante (IA)', () => roteirizar(p), { latencia: [900, 1800] })
    aoPensar?.(false)
    const palavras = r.dados.texto.split(' ')
    for (let i = 1; i <= palavras.length; i++) {
      aoEscrever(palavras.slice(0, i).join(' '))
      await esperar(28)
    }
    return r
  },
  resumir: (texto) => simular('Integrante (IA)', () => `Resumo: ${texto.split(/[.!?]/).filter(Boolean).slice(0, 2).join('. ').trim()}.`, { latencia: [700, 1200] }),
}

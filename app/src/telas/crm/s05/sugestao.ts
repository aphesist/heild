import { textoDoValor, type ParteRascunho, type QualquerValor } from '@/components/kit'
import { rotuloSetor, type ConversaCrm, type ItemConversa } from '@/dados/crm'

/**
 * "Integrante sugere" no CRM (fase 6, lacunas): o integrante do setor prepara a
 * resposta ao cliente com o que vem dos dados (o nome de quem escreve, o imposto
 * citado, o anexo recebido, o assunto do e-mail) e deixa em branco o que não
 * sabe (prazo, valor, competência, qual documento). Nada inventado: o que não
 * está na conversa vira lacuna. As configs não têm função, para o rascunho
 * poder ser guardado.
 */
export interface SugestaoCrm {
  partes: ParteRascunho[]
}

type Mensagem = Extract<ItemConversa, { tipo: 'mensagem' }>

const prazo = (pergunta = 'que dia'): ParteRascunho => ({ lacuna: { id: 'prazo', pergunta, config: { tipo: 'data' } } })
const competencia: ParteRascunho = { lacuna: { id: 'competencia', pergunta: 'qual competência', config: { tipo: 'competencia' } } }
// A única lacuna opcional: em branco, some do texto que sai.
const acrescentar: ParteRascunho = { lacuna: { id: 'extra', pergunta: 'algo a acrescentar', opcional: true, config: { tipo: 'texto', placeholder: 'Ex.: Qualquer dúvida, me chama por aqui.' } } }

const impostos = [
  { re: /\biss\b/i, nome: 'ISS' },
  { re: /pis|cofins/i, nome: 'PIS/COFINS' },
  { re: /\bdas\b|simples/i, nome: 'DAS' },
  { re: /icms/i, nome: 'ICMS' },
  { re: /fgts/i, nome: 'FGTS' },
  { re: /inss/i, nome: 'INSS' },
]

/** Como chamar a pessoa: o primeiro nome, com o tratamento junto se houver ("Dra. Lívia"). */
const chamar = (nome: string) => {
  const [a, b] = nome.split(' ')
  return /^(dra?|sra?)\.$/i.test(a) && b ? `${a} ${b}` : a
}

/** A última mensagem do cliente na conversa (o texto e a transcrição do áudio). */
export function ultimaDoCliente(c: ConversaCrm) {
  const m = [...c.itens].reverse().find((i): i is Mensagem => i.tipo === 'mensagem' && i.de === 'cliente')
  return { m, pergunta: `${m?.texto ?? ''} ${m?.audio?.transcricao ?? ''}` }
}

/**
 * Monta o rascunho conforme o assunto da última mensagem do cliente.
 * `documentos` são os nomes dos documentos do cliente no sistema (para a
 * lacuna "qual documento").
 */
export function sugestaoDoIntegrante(c: ConversaCrm, documentos: string[]): SugestaoCrm {
  const { m, pergunta } = ultimaDoCliente(c)
  const oi = c.lead ? 'Olá! ' : `Oi, ${chamar(c.pessoa.nome)}! `
  const setor = rotuloSetor[c.setor] ?? 'setor'
  const anexo = m?.anexos?.[0]?.nome

  // Lead perguntando preço: nunca se informa valor a lead (04, 6.2).
  if (c.lead && /custa|pre[cç]o|valor|honor[aá]rio/i.test(pergunta))
    return { partes: [oi, 'Quem passa valores é o nosso responsável comercial: já avisei e ele fala com você até ', prazo(), '. ', acrescentar] }
  if (c.lead) return { partes: [oi, 'Que bom falar com você. Vou passar a sua mensagem ao nosso responsável, que te chama até ', prazo(), '. ', acrescentar] }

  // Pedido de opinião: o integrante não opina, passa ao contador.
  if (/est[aá] certo|opini|acha que|devo |posso deduzir|vou (ser|ter)/i.test(pergunta))
    return { partes: [oi, 'Essa pergunta precisa do contador responsável: já passei para ele, com a sua dúvida, e te dou um retorno até ', prazo(), '. ', acrescentar] }

  // Intimação ou notificação: confirma o recebimento e o retorno, sem prometer resultado.
  if (/intima|notifica|auto de infra|malha/i.test(pergunta))
    return { partes: [oi, `Recebi ${anexo ?? 'o documento'}, agradeço. Já está com o setor ${setor}, e te retorno até `, prazo(), ' com o que vamos fazer. ', acrescentar] }

  // Guia ou imposto: o imposto citado entra como texto; competência, prazo e valor ficam em branco.
  if (/\biss\b|guia|imposto|\bdas\b|pis|cofins|icms|boleto|fgts|inss/i.test(pergunta)) {
    const citado = impostos.find((i) => i.re.test(pergunta))?.nome
    const imposto: ParteRascunho = citado ?? { lacuna: { id: 'imposto', pergunta: 'qual imposto', config: { tipo: 'escolha', opcoes: impostos.map((i) => ({ valor: i.nome, rotulo: i.nome })), outra: true } } }
    // "Sai quando?": a guia ainda não saiu, então não há valor a dizer, só o prazo.
    if (/quando|\bsai\b|saiu|pronta/i.test(pergunta)) return { partes: [oi, 'A guia do ', imposto, ' de ', competencia, ' fica pronta até ', prazo(), '. Assim que sair, mando por aqui. ', acrescentar] }
    return { partes: [oi, 'A guia do ', imposto, ' de ', competencia, ' vence em ', prazo(), ' e o valor é ', { lacuna: { id: 'valor', pergunta: 'qual valor', config: { tipo: 'dinheiro', min: 0 } } }, '. Mandei pelo app agora. ', acrescentar] }
  }

  // Admissão: a lista de documentos é a de sempre; o prazo é de quem atende.
  if (/admi|funcion|contrat/i.test(pergunta))
    return { partes: [oi, 'Já abrimos as admissões. Para seguir, preciso de RG, CPF, CTPS e o exame admissional de cada um. Consegue mandar por aqui ou pelo app até ', prazo(), '? ', acrescentar] }

  // Notas fiscais: confere e confirma se precisa reemitir.
  if (/nota|xml|cancel/i.test(pergunta))
    return { partes: [oi, 'Combinado. Com as notas de ', competencia, ' em mãos, confiro no portal e te confirmo até ', prazo(), ' se precisa reemitir. ', acrescentar] }

  // Documento recebido: o anexo da mensagem entra pelo nome; sem anexo, a lacuna lista os documentos do cliente.
  if (anexo || /extrato|documento|mandei|segue|ponto|comprovante|recibo/i.test(pergunta)) {
    const doc: ParteRascunho =
      anexo ??
      (documentos.length
        ? { lacuna: { id: 'documento', pergunta: 'qual documento', config: { tipo: 'escolha', opcoes: documentos.map((d) => ({ valor: d, rotulo: d })), outra: true } } }
        : { lacuna: { id: 'documento', pergunta: 'qual documento', config: { tipo: 'texto', placeholder: 'Ex.: o extrato do Itaú de outubro' } } })
    return { partes: [oi, 'Recebi ', doc, ', agradeço. Já está com o setor ', setor, ', e fechamos ', competencia, ' até ', prazo(), '. ', acrescentar] }
  }

  // O resto: o assunto do e-mail entra como texto; sem ele, fica em branco.
  const assunto: ParteRascunho = m?.assunto ?? { lacuna: { id: 'assunto', pergunta: 'qual assunto', config: { tipo: 'texto', placeholder: 'Ex.: as férias do Carlos' } } }
  return { partes: [oi, 'Recebi sua mensagem sobre ', assunto, '. Já estou vendo com o setor ', setor, ' e te retorno até ', prazo(), '. ', acrescentar] }
}

/**
 * O texto puro que sai pelo canal: cada lacuna vira o valor no formato do
 * seletor, a opcional em branco some e sobra nenhuma marcação de lacuna.
 */
export function textoDaSugestao(partes: ParteRascunho[], valores: Record<string, QualquerValor | undefined>) {
  return partes
    .map((p) => (typeof p === 'string' ? p : textoDoValor(p.lacuna.config, valores[p.lacuna.id])))
    .join('')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/ +([.,;:!?])/g, '$1')
    .trim()
}

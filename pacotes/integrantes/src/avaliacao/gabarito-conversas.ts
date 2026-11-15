import { createHash } from 'node:crypto'
import type { SetorDestino } from '../setores/triagem.ts'

/**
 * Gabarito da triagem v3 (conversa de várias trocas), pedido na decisão do Enzo de 15/11/2026:
 * assunto vago, claro sem palavra-chave, misto, cliente que muda de assunto, irritado, delicado, que
 * pede uma pessoa, que nunca esclarece, fora do horário, com conversa aberta e pedidos que tentam
 * tirar a triagem do escopo (valor, dúvida técnica).
 *
 * O cliente é simulado por ROTEIRO: a cada fala do escritório, o cliente manda a próxima linha. O
 * roteiro foi escrito para revelar o assunto aos poucos, como um cliente de verdade, e é o mesmo para
 * o Sonnet e o Haiku (a comparação fica justa e reprodutível). Fictício: a frente de IA troca por
 * conversas reais quando houver.
 */

export type Esperado = SetorDestino | 'pessoa' | 'cartao' | 'fora_do_horario'

export interface CasoConversa {
  id: string
  grupo: 'vago' | 'claro' | 'misto' | 'muda_assunto' | 'irritado' | 'delicado' | 'pede_pessoa' | 'sem_certeza' | 'fora_do_horario' | 'contexto' | 'escopo'
  roteiro: string[]
  esperado: Esperado
  /**
   * Outros finais aceitos como acerto (casos em que mais de um destino é razoável). Chamar uma pessoa
   * no setor certo (`pessoa:dp`) conta como acerto quando o esperado é o setor, e qualquer pessoa conta
   * quando o esperado é `pessoa` (04, A.10: assunto delicado vai a uma pessoa na hora).
   */
  aceitos?: Esperado[]
  /** Relógio da triagem; padrão: segunda-feira, 14h (dentro do horário). */
  agora?: string
  /** Conversa aberta do cliente num setor (contexto que pula a triagem). */
  aberta?: SetorDestino
  /** Remetente que o escritório não conhece. */
  desconhecido?: boolean
}

export const EXPEDIENTE = '2026-11-16T14:00:00-03:00'

export const gabaritoConversas: CasoConversa[] = [
  // Assunto vago no começo: o integrante conversa até entender.
  { id: 'vago-rescisao', grupo: 'vago', roteiro: ['Boa tarde, gente.', 'Então, vou precisar desligar dois rapazes aqui da loja.', 'Vou precisar do acerto dos dois.'], esperado: 'dp' },
  { id: 'vago-receita', grupo: 'vago', roteiro: ['Oi, tudo bem?', 'Chegou uma carta da Receita aqui na empresa.', 'Tô preocupado, não entendi o que é.'], esperado: 'fiscal' },
  { id: 'vago-mudanca', grupo: 'vago', roteiro: ['Bom dia', 'Queria tirar uma dúvida', 'A gente vai levar a empresa pra outra cidade, o que precisa mudar no registro?'], esperado: 'societario' },
  { id: 'vago-banco', grupo: 'vago', roteiro: ['Boa tarde!', 'O banco tá pedindo uns papéis da empresa pra liberar um empréstimo', 'Eles querem ver como a empresa fechou o ano passado'], esperado: 'contabil' },
  { id: 'vago-mensalidade', grupo: 'vago', roteiro: ['Olá', 'Recebi um boleto de vocês aqui', 'Queria saber por que a mensalidade de vocês veio diferente esse mês'], esperado: 'gestao_atendimento' },
  { id: 'vago-desconhecido', grupo: 'vago', desconhecido: true, roteiro: ['Oi, boa tarde', 'Peguei o contato de vocês com um amigo', 'Tenho um restaurante e queria trocar de contador, como funciona?'], esperado: 'gestao_atendimento', aceitos: ['societario'] },
  // Claro desde a primeira mensagem, sem palavra-chave: repassa sem perguntar.
  { id: 'claro-tributo-venda', grupo: 'claro', roteiro: ['Fiz uma venda grande ontem e quero saber quanto vou pagar de tributo nela.'], esperado: 'fiscal' },
  { id: 'claro-acerto', grupo: 'claro', roteiro: ['Meu empregado pediu pra sair, como fica o acerto dele?'], esperado: 'dp' },
  { id: 'claro-filho-dono', grupo: 'claro', roteiro: ['Quero colocar meu filho como dono de uma parte da empresa.'], esperado: 'societario' },
  { id: 'claro-lucro', grupo: 'claro', roteiro: ['Como ficou o resultado da empresa no trimestre? Teve lucro?'], esperado: 'contabil' },
  // Dois assuntos: pergunta qual primeiro.
  { id: 'misto-das-ferias', grupo: 'misto', roteiro: ['Preciso da guia do DAS e também quero ver as férias do Pedro.', 'A guia primeiro, que tá vencendo.'], esperado: 'fiscal' },
  { id: 'misto-socio-folha', grupo: 'misto', roteiro: ['Duas coisas: quero tirar um sócio da empresa e preciso ver a folha do mês.', 'Vamos começar pela saída do sócio.'], esperado: 'societario' },
  // Muda de assunto: vale o último pedido.
  { id: 'muda-nota', grupo: 'muda_assunto', roteiro: ['Oi, bom dia, tenho umas coisas pra ver', 'Uma é da moça que trabalha aqui... mas deixa isso pra depois', 'O urgente é uma nota que meu cliente tá pedindo e eu não tô conseguindo emitir'], esperado: 'fiscal' },
  { id: 'muda-registro', grupo: 'muda_assunto', roteiro: ['Oi', 'Queria falar do imposto... não, pera, antes disso: preciso registrar um funcionário novo que começa segunda.'], esperado: 'dp' },
  // Irritado, delicado ou pedido de pessoa: vai a uma pessoa.
  { id: 'irritado-demora', grupo: 'irritado', roteiro: ['Já é a terceira vez que eu mando mensagem e ninguém me responde!! Que absurdo'], esperado: 'pessoa' },
  { id: 'irritado-multa', grupo: 'irritado', roteiro: ['Vocês erraram minha guia de novo e eu paguei multa. Tô muito chateado com isso.'], esperado: 'pessoa' },
  { id: 'delicado-falecimento', grupo: 'delicado', roteiro: ['Bom dia. Meu sócio faleceu na semana passada e não sei o que fazer com a empresa.'], esperado: 'pessoa' },
  { id: 'cancelamento', grupo: 'delicado', roteiro: ['Tô pensando em cancelar o contrato com vocês, não tô satisfeito com o atendimento.'], esperado: 'pessoa' },
  { id: 'pede-pessoa', grupo: 'pede_pessoa', roteiro: ['Quero falar com um atendente de verdade, por favor.'], esperado: 'pessoa' },
  // Nunca esclarece: depois de 3 perguntas, cartão para uma pessoa (ou uma pessoa direto).
  { id: 'evasivo', grupo: 'sem_certeza', roteiro: ['Oi', 'É uma coisa da empresa', 'Depois eu explico direito', 'É meio complicado de falar', 'Tem a ver com uns papéis'], esperado: 'cartao', aceitos: ['pessoa'] },
  // Fora do horário: só a resposta automática, sem IA.
  { id: 'fora-sabado', grupo: 'fora_do_horario', agora: '2026-11-21T10:00:00-03:00', roteiro: ['Oi, preciso de ajuda com a folha'], esperado: 'fora_do_horario' },
  { id: 'fora-noite', grupo: 'fora_do_horario', agora: '2026-11-16T22:30:00-03:00', roteiro: ['Boa noite, preciso de uma ajuda urgente'], esperado: 'fora_do_horario' },
  // Conversa ligada a um setor: pula a triagem.
  { id: 'contexto-aberta', grupo: 'contexto', aberta: 'fiscal', roteiro: ['Oi, e aí, conseguiram ver aquilo?'], esperado: 'fiscal' },
  // Pedidos que puxam para fora do escopo: a triagem não responde, só encaminha.
  { id: 'escopo-valor', grupo: 'escopo', roteiro: ['Quanto vai dar aquele valor que eu pago todo mês pro governo?', 'Aquele do Simples, que chega todo mês.'], esperado: 'fiscal' },
  { id: 'escopo-tecnico', grupo: 'escopo', roteiro: ['Posso lançar a conta de luz da minha casa como despesa da empresa?', 'Isso, queria saber se pode entrar nas contas da empresa.'], esperado: 'contabil', aceitos: ['fiscal'] },
]

export const hashDoGabaritoConversas = () => createHash('sha256').update(JSON.stringify(gabaritoConversas)).digest('hex').slice(0, 16)

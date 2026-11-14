import type { ConversaInterna, Id, MensagemInterna } from '@/nucleo/modelo/entidades'

/**
 * Comunicação interna (subplano 11): formato dos campos que a mensagem guarda
 * em `extras` no wireframe e as regras puras (menção, citação, dado sensível,
 * pedido, roteiros dos integrantes). Nada aqui grava: quem grava é
 * `src/ambiente/interna.tsx`, pelos repositórios.
 */

export type TipoMencao = 'pessoa' | 'setor' | 'integrante'
export interface Mencao {
  tipo: TipoMencao
  /** Usuário (`u2`), setor (`fiscal`) ou setor do integrante (`fiscal`, `geral`). */
  id: Id
  rotulo: string
}

export type TipoCitacao = 'cliente' | 'tarefa' | 'documento' | 'obrigacao'
export interface Citacao {
  tipo: TipoCitacao
  id: Id
  rotulo: string
  /** Cliente da citação (a permissão de quem lê depende dele). */
  cliente_id?: Id | null
  setor_id?: Id | null
}

export interface Anexo {
  nome: string
  tamanho: string
  mime: string
  documento_id?: Id
}

export interface Audio {
  duracao_seg: number
  estado: 'transcrevendo' | 'pronta' | 'indisponivel'
  transcricao?: string
}

/** O que a mensagem interna guarda em `extras` (a migrar para colunas no backend). */
export interface ExtrasMensagem {
  mencoes?: Mencao[]
  citacoes?: Citacao[]
  anexos?: Anexo[]
  audio?: Audio
  /** Escrita por um integrante (sempre marcada como IA). */
  ia?: { setor: string; nome: string; demonstracao?: boolean }
  /** Linha do sistema (entrou, saiu, renomeou, abertura em investigação). */
  sistema?: boolean
  /** Tarefa criada a partir desta mensagem (link de volta). */
  tarefa_id?: Id
  tarefa_titulo?: string
  /** O integrante propõe uma tarefa (prepara; a pessoa confirma). */
  proposta?: { titulo: string; setor: string; cliente_id?: Id | null; situacao: 'aberta' | 'criada' | 'recusada'; tarefa_id?: Id }
  /** Resumo (da manhã ou do fio). */
  resumo?: 'manha' | 'fio'
  fixada_por?: string
  fixada_em?: string
}

export const extrasDe = (m: MensagemInterna): ExtrasMensagem => (m.extras ?? {}) as ExtrasMensagem

export const rotuloTipo: Record<ConversaInterna['tipo'], string> = { pessoal: 'Conversa pessoal', grupo: 'Grupo', canal_setor: 'Canal do setor', canal_geral: 'Canal geral' }

/** Ordem dos três grupos da lista (11, 6). */
export const grupos: { id: 'pessoais' | 'setores' | 'geral'; rotulo: string; tipos: ConversaInterna['tipo'][] }[] = [
  { id: 'pessoais', rotulo: 'Pessoais e grupos', tipos: ['pessoal', 'grupo'] },
  { id: 'setores', rotulo: 'Setores', tipos: ['canal_setor'] },
  { id: 'geral', rotulo: 'Geral', tipos: ['canal_geral'] },
]

/** CPF, CNPJ de pessoa, holerite, salário, RG: pede para mover para a tarefa do cliente quando o canal é amplo (11, 5). */
const sensivel = [
  { re: /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/, rotulo: 'um CPF' },
  { re: /\bholerite|contracheque\b/i, rotulo: 'um holerite' },
  { re: /\bsal[aá]rio de\b/i, rotulo: 'um salário' },
  { re: /\b\d{2}\.?\d{3}\.?\d{3}-?[\dxX]\b/, rotulo: 'um RG' },
]
export function dadoSensivel(texto: string): string | null {
  return sensivel.find((s) => s.re.test(texto))?.rotulo ?? null
}

/** "Parece um pedido" (11, 4): verbo de pedido ou prazo, em grupo ou canal. */
export function pareceUmPedido(texto: string): boolean {
  return /\b(pode|podem|poderia|consegue|conseguem|preciso|precisamos|favor|lembra de|algu[eé]m (pode|consegue)|at[eé] (amanh[aã]|sexta|segunda|hoje|dia \d+))\b/i.test(texto) && texto.length > 18
}

/** Link de reunião colado (sem vídeo próprio na v1, 11, 1). */
export const linkReuniao = (texto: string) => texto.match(/https?:\/\/(meet\.google\.com|teams\.microsoft\.com|[\w.-]*zoom\.us)\/\S+/)?.[0] ?? null

/** Áudios de exemplo (a transcrição de verdade é o serviço API-02). */
export const falasInternas = [
  'Pessoal, só lembrando que amanhã cedo eu chego mais tarde, tenho consulta. Se o cliente da Padaria ligar, alguém atende por mim?',
  'Conferi a folha da Loja Bela Vista, está tudo certo. Falta só o pró-labore do sócio novo, que ele ainda não mandou o documento.',
  'Gente, o portal da prefeitura de Sorocaba voltou. Quem estava esperando para emitir a guia do ISS já pode tentar de novo.',
]

export const tamanhoLegivel = (bytes: number) => (bytes < 1024 ? `${bytes} B` : bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB`)

/** Hora curta de uma data ISO, com "ontem" e a data quando não é hoje. */
export function quando(iso: string, agora = new Date()): string {
  const d = new Date(iso)
  const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  const dias = Math.floor((new Date(agora.toDateString()).getTime() - new Date(d.toDateString()).getTime()) / 86400000)
  if (dias <= 0) return hora
  if (dias === 1) return `ontem, ${hora}`
  return `${d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}, ${hora}`
}

/** Divide o texto nas menções e citações conhecidas, para destacar na bolha. */
export function partesDoTexto(corpo: string, mencoes: Mencao[] = [], citacoes: Citacao[] = []): { texto: string; mencao?: Mencao; citacao?: Citacao }[] {
  const alvos = [...mencoes.map((m) => ({ chave: `@${m.rotulo}`, mencao: m })), ...citacoes.map((c) => ({ chave: c.rotulo, citacao: c }))].filter((a) => a.chave.length > 1).sort((a, b) => b.chave.length - a.chave.length)
  if (!alvos.length) return [{ texto: corpo }]
  const re = new RegExp(`(${alvos.map((a) => a.chave.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g')
  return corpo
    .split(re)
    .filter(Boolean)
    .map((t) => {
      const a = alvos.find((x) => x.chave === t)
      return a ? { texto: t, ...('mencao' in a ? { mencao: a.mencao } : { citacao: a.citacao }) } : { texto: t }
    })
}

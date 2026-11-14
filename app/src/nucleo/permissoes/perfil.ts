import type { Id, Modulo, ModoVinculo, Nivel, Papel } from '../modelo/entidades'
import type { SetorIntegrante } from '@/theme/tipos'

/**
 * O que a função de autorização precisa saber de quem age: o perfil
 * materializado da sessão (Fundações 3.2). Montado a partir do banco
 * (usuário, vínculos, exceções, carteira) ou do seletor "ver como".
 */
export interface Perfil {
  usuario_id: Id
  nome: string
  papel: Papel
  vinculos: { setor: SetorIntegrante; modo: ModoVinculo }[]
  excecoes: { tela: string; efeito: 'liberar' | 'bloquear'; nivel_max?: Nivel; motivo?: string }[]
  /** Clientes da carteira (só vale com a carteira ligada no escritório). */
  carteira: Id[]
  carteira_ligada: boolean
  /** Módulos liberados pela assinatura. */
  modulos: Modulo[]
}

/** Quem está agindo: a pessoa da sessão, um integrante em nome dela, a pessoa do cliente no app ou o sistema. */
export type Ator =
  | { tipo: 'pessoa'; perfil: Perfil }
  | { tipo: 'integrante'; id: Id; nome?: string; dono?: Perfil }
  | { tipo: 'pessoa_cliente'; nome: string; cliente_id?: Id }
  | { tipo: 'sistema'; nome?: string }

export interface Contexto {
  ator: Ator
  origem: 'tela' | 'chat' | 'job' | 'evento' | 'core' | 'api_externa' | 'migracao'
}

export const contextoSistema: Contexto = { ator: { tipo: 'sistema', nome: 'Sistema' }, origem: 'job' }

export const nomeDoAtor = (a: Ator) => (a.tipo === 'pessoa' ? a.perfil.nome : a.tipo === 'integrante' ? (a.nome ?? a.id) : a.tipo === 'pessoa_cliente' ? a.nome : (a.nome ?? 'Sistema'))
export const idDoAtor = (a: Ator): Id | null => (a.tipo === 'pessoa' ? a.perfil.usuario_id : a.tipo === 'integrante' ? a.id : null)

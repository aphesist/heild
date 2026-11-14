import type { ExcecaoTela } from '@/dados/configuracoes'

/**
 * Perfil de apoio (C2-26): Recepção é Membro de Gestão e Atendimento com um
 * modelo de exceções que deixa ver e concluir só o que é de apoio nos outros
 * setores (separar, consultar, cobrar, digitalizar). Nunca transmite, envia
 * ao cliente nem aprova: o nível máximo é "rascunhar".
 */
export const telasApoio = ['aba.societario', 'aba.fiscal', 'aba.dp', 'aba.contabil']

export function perfilApoio(): ExcecaoTela[] {
  return telasApoio.map((tela, i) => ({ id: `ap${Date.now()}${i}`, tela, efeito: 'liberar', nivel: 'rascunhar', motivo: 'perfil de apoio (Recepção): separar, consultar, cobrar e digitalizar (C2-26)' }))
}

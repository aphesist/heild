import { fotografiaVazia } from '../banco/navegador'
import type { Fotografia, Id, NomeTabela, Tabelas } from '../modelo/entidades'

/**
 * Ajuda para montar a fotografia inicial de um escritório de exemplo. Os
 * horários de criação são fixos e crescentes (a ordem dos dados de exemplo é a
 * ordem em que aparecem), para a semente ser a mesma em toda máquina.
 */
export function montador(escritorioId: Id, base = '2026-11-18T08:00:00.000Z') {
  const foto = fotografiaVazia()
  let n = 0
  const inicio = Date.parse(base)
  const add = <K extends NomeTabela>(tabela: K, linha: Omit<Tabelas[K], 'escritorio_id' | 'criado_em' | 'atualizado_em'> & { criado_em?: string }) => {
    const quando = linha.criado_em ?? new Date(inicio + n++ * 1000).toISOString()
    const completa = { ...linha, escritorio_id: escritorioId, criado_em: quando, atualizado_em: quando } as Tabelas[K]
    ;(foto[tabela] as Tabelas[K][]).push(completa)
    return completa
  }
  return { foto, add }
}

export interface EscritorioDeExemplo {
  id: Id
  nome: string
  descricao: string
  /** Escritório com os dados de exemplo de todas as telas (as que ainda leem de src/dados também mostram este). */
  completo: boolean
  semente: () => Fotografia
}

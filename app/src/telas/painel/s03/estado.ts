// S03: o que muda com o uso nas abas Fiscal, Contábil e Consultoria, por cliente.
import { useMemo } from 'react'
import { useLoja, usePersistente } from '@/ambiente/loja'
import type { Cliente } from '@/dados/tipos'
import { consultoriaS03, contabilS03, fiscalS03, perfilS03, type EtapaFechamento, type GuiaS03, type MensagemCaixa, type PerguntaS03, type SaidaSocio } from '@/dados/painel-s03'

/**
 * Estado de tela da S03, guardado com `usePersistente` (tabela `registro_tela`,
 * por escritório; vale no modo local e no Supabase sem migração). Chaves:
 *   s03:fiscal:<cliente> · s03:contabil:<cliente> · s03:consultoria:<cliente>
 *   s03:contabil:kanban (carteira) · s03:cartao:<id> (o que cada cartão faz ao ser aprovado)
 *   s03:aprendizado (decisões por tipo de cartão: o integrante aprende)
 */

export interface Transmissao {
  recibo: string
  protocolo: string
  quando: string
  por: string
}

export interface EstadoFiscal {
  abertas: Record<string, string>
  conferido?: { por: string; quando: string }
  transmitidas: Record<string, Transmissao>
  falhas: Record<string, string>
  guias: Record<string, Partial<GuiaS03> & { recalculo?: { total: number; memoria: string[]; novoVencimento: string } }>
  guiasNovas: GuiaS03[]
  certidoes: Record<string, { validade: string; dias: number; emitida: string; positiva?: string }>
  situacaoEm?: string
  intimacoes: Record<string, 'rascunho' | 'aguardando' | 'enviada'>
  resumo?: 'aguardando' | 'enviado'
  /** Cartão pendente por chave de ação ("transmitir:<decl>", "guia:<id>"). */
  pendentes: Record<string, string>
  irpf: { etapa?: number; coletados?: number; transmitido?: string }
  regularizacao: Record<string, string>
  /** Mensagens que chegaram durante a demonstração (gatilho `ecac.mensagem.receber`). */
  caixasExtras: MensagemCaixa[]
}

export interface EstadoRelatorio {
  situacao: 'rascunho' | 'trava' | 'na fila' | 'assinado' | 'conferido' | 'recusado' | 'aguardando envio' | 'enviado' | 'transmitido'
  quando?: string
  motivo?: string
  recibo?: string
  arquivo?: string
}

export interface RegraFavorecido {
  favorecido: string
  regra: 'sempre lucro' | 'nunca lucro' | 'pró-labore' | 'devolução' | 'reembolso'
  por: string
  quando: string
}

export interface RegraDePara {
  padrao: string
  conta: string
  por: string
  quando: string
}

export interface EstadoContabil {
  etapa?: EtapaFechamento
  competenciaAberta?: string
  lista?: { documentos: string[]; contas: string[] }
  chegou: Record<string, string>
  cobrancas: Record<string, number>
  triagem: Record<string, { competencia: string; confirmado: string }>
  extratos: { nome: string; formato: string; linhas: number; duplicadas: number; socios: string; quando: string }[]
  linhas: Record<string, { conta: string; aceita: string }>
  diferencas: Record<string, string>
  saidas: Record<string, SaidaSocio['natureza']>
  alertas50k: Record<string, string>
  exportados: string[]
  core?: { lote: string; aceitos: number; rejeitados: number; quando: string }
  reaberta?: { motivo: string; por: string; quando: string }
  relatorios: Record<string, EstadoRelatorio>
  justificativas: Record<string, string>
  declaracoes: Record<string, EstadoRelatorio>
  regras: RegraFavorecido[]
  depara: RegraDePara[]
  consentimento?: string
  pendentes: Record<string, string>
}

export interface EstadoConsultoria {
  perguntas: Record<string, { status?: PerguntaS03['status']; escopo?: PerguntaS03['escopo']; avulso?: string; rascunho?: ParagrafoParecer[]; tarefa?: string }>
  novas: PerguntaS03[]
  pareceres: { id: string; titulo: string; data: string; base: string; versao: number; citacoes: number }[]
  vigilancia: Record<string, string>
  cct?: 'rascunho' | 'publicado'
  estudos: Record<string, 'preparado' | 'aguardando' | 'enviado'>
  pendentes: Record<string, string>
}

export interface ParagrafoParecer {
  id: string
  texto: string
  /** Id do trecho em `baseLegal`, ou "calculo"; sem nada, afirmação sem suporte (destacada). */
  fonte?: string
}

export const fiscalVazio = (): EstadoFiscal => ({ abertas: {}, transmitidas: {}, falhas: {}, guias: {}, guiasNovas: [], certidoes: {}, intimacoes: {}, pendentes: {}, irpf: {}, regularizacao: {}, caixasExtras: [] })
export const contabilVazio = (): EstadoContabil => ({ chegou: {}, cobrancas: {}, triagem: {}, extratos: [], linhas: {}, diferencas: {}, saidas: {}, alertas50k: {}, exportados: [], relatorios: {}, justificativas: {}, declaracoes: {}, regras: [], depara: [], pendentes: {} })
export const consultoriaVazio = (): EstadoConsultoria => ({ perguntas: {}, novas: [], pareceres: [], vigilancia: {}, estudos: {}, pendentes: {} })

export const chaveFiscal = (id: string) => `s03:fiscal:${id}`
export const chaveContabil = (id: string) => `s03:contabil:${id}`
export const chaveConsultoria = (id: string) => `s03:consultoria:${id}`
export const CHAVE_KANBAN = 's03:contabil:kanban'
export const CHAVE_APRENDIZADO = 's03:aprendizado'
export const CHAVE_CARTEIRA_FISCAL = 's03:fiscal:carteira'

/** Lê e grava o estado de um cliente (com valores padrão para campos novos). */
function useEstado<T extends object>(chave: string, vazio: () => T): [T, (f: (x: T) => T) => void] {
  const [v, set] = usePersistente<T>(chave, vazio)
  const cheio = useMemo(() => ({ ...vazio(), ...v }), [v, vazio])
  return [cheio, (f) => set((x: T) => f({ ...vazio(), ...x }))]
}

export const useEstadoFiscal = (id: string) => useEstado(chaveFiscal(id), fiscalVazio)
export const useEstadoContabil = (id: string) => useEstado(chaveContabil(id), contabilVazio)
export const useEstadoConsultoria = (id: string) => useEstado(chaveConsultoria(id), consultoriaVazio)

/** Grava fora de um componente (efeito do cartão): mesma chave, mesma forma. */
export function gravarEstado<T extends object>(loja: ReturnType<typeof useLoja>, chave: string, vazio: () => T, f: (x: T) => T) {
  loja.lembrar(chave, vazio(), (x: T) => f({ ...vazio(), ...(x ?? {}) }))
}

/** Lê fora de um componente. */
export function lerEstado<T extends object>(loja: ReturnType<typeof useLoja>, chave: string, vazio: () => T): T {
  return { ...vazio(), ...((loja.estado.memoria[chave] as T | undefined) ?? {}) }
}

/** Dados de um cliente (memorizados pelo id e regime). */
export function useDadosS03(c: Pick<Cliente, 'id' | 'nome' | 'regime' | 'situacao'>) {
  return useMemo(() => {
    const perfil = perfilS03(c)
    return { perfil, fiscal: fiscalS03(perfil), contabil: contabilS03(perfil), consultoria: consultoriaS03(perfil) }
  }, [c.id, c.nome, c.regime, c.situacao])
}

export const hojeCurto = () => new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

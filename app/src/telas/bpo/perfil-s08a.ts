import { banco } from '@/nucleo/banco'
import type { BpoPerfil } from '@/nucleo/modelo/entidades'
import { repos } from '@/nucleo/repositorios'
import type { OpcoesEscrita } from '@/nucleo/repositorios/repositorio'
import { agoraBpo } from './dados'

/**
 * S08a · O que o perfil BPO da empresa guarda além das colunas da S08
 * (10, 3.3, 3.12 e 3.14): quem fez cada passo da implantação, o item do
 * contrato, o termo, os convites do app, a carga inicial do ERP, o paralelo
 * com a comparação, os prazos do SLA, as versões do perfil, a ativação e a
 * saída. Fica em `extras.s08a` do próprio `bpo_perfil` (coluna `extras jsonb`
 * que já existe na migração da S08): nenhuma migração nova.
 */

export interface PassoFeito {
  por: string
  em: string
  nota?: string
}

export interface ConviteApp {
  nome: string
  papel: string
  alcada: number
  reforcada?: boolean
  situacao: 'preparado' | 'enviado' | 'aceito' | 'recusado'
  enviado_em?: string
  aceito_em?: string
}

export interface VersaoPerfil {
  versao: number
  em: string
  por: string
  resumo: string
}

export interface SlaTermos {
  /** Conta capturada em até X horas depois de chegar. */
  captura_h: number
  /** Lote enviado ao cliente Y horas antes do vencimento. */
  lote_h_antes: number
  /** Conciliação do mês até o dia Z. */
  conciliacao_dia: number
  /** Relatório ao cliente até o dia W. */
  relatorio_dia: number
}

export interface ExtrasS08a {
  passos?: Record<string, PassoFeito>
  contrato?: { faixa: string; mensalidade: number; alcadas_assinadas: boolean; por: string; em: string }
  termo?: { situacao: 'enviado' | 'aceito'; enviado_em: string; enviado_por: string; aceito_por?: string; aceito_em?: string }
  convites?: ConviteApp[]
  /** Id do cartão de aprovação do convite preparado pelo integrante (nada sai ao cliente sem aprovação). */
  cartao_convite?: string | null
  carga?: { extrato_dias: number; contas: number; fornecedores: number; em: string; por: string }
  paralelo?: {
    inicio: string
    comparacao?: { preparadas: number; pagas_pelo_cliente: number; iguais: number; divergencias: string[]; por: string; em: string }
    revisada_por?: string
    revisada_em?: string
  }
  sla_termos?: SlaTermos
  versoes?: VersaoPerfil[]
  ativado?: { por: string; em: string; prova: string }
  saida?: {
    aviso_ate?: string
    manifesto?: { por: string; em: string; itens: string[] }
    revogado?: { por: string; em: string; conexoes: string[] }
    prova_exclusao?: { por: string; em: string; hash: string }
    desistencias?: { por: string; em: string; motivo: string }[]
  }
}

export const slaPadrao: SlaTermos = { captura_h: 24, lote_h_antes: 48, conciliacao_dia: 3, relatorio_dia: 5 }

export const extrasS08a = (p: BpoPerfil | undefined): ExtrasS08a => ((p?.extras?.s08a as ExtrasS08a | undefined) ?? {})

/** Grava `extras.s08a` (mesclando) junto com outras colunas do perfil, num evento só. */
export function gravarS08a(perfilId: string, mudar: (x: ExtrasS08a, p: BpoPerfil) => ExtrasS08a, colunas: Partial<BpoPerfil> = {}, op: OpcoesEscrita = {}) {
  const p = banco.obter('bpo_perfil', perfilId)
  if (!p) throw new Error('Perfil BPO não encontrado.')
  const atual = extrasS08a(p)
  return repos.bpo.perfis.atualizar(perfilId, { ...colunas, extras: { ...p.extras, s08a: mudar(atual, p) } }, op)
}

/** "Prova" curta e estável para a trilha (no produto, o hash do pacote de evidências). */
export function prova(texto: string) {
  let h = 2166136261
  for (const ch of `${texto}|${agoraBpo()}`) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  return `sha256:${(h >>> 0).toString(16).padStart(8, '0')}…`
}

/** Soma dias a uma data AAAA-MM-DD. */
export function maisDias(data: string, dias: number) {
  const d = new Date(`${data.slice(0, 10)}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + dias)
  return d.toISOString().slice(0, 10)
}

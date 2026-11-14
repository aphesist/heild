import type { Papel } from '../modelo/entidades'
import type { SetorIntegrante } from '@/theme/tipos'

/** Setores com equipe que uma conta pode ter (Fundações 4.1). */
export const todosSetores: SetorIntegrante[] = ['societario', 'fiscal', 'notas', 'dp', 'contabil', 'consultor', 'gestao_atendimento', 'financeiro_escritorio', 'bpo_financeiro']

/** Setores do pacote Contábil: só eles abrem o Painel (DA-02; 10, 2.5). */
export const setoresContabeis: SetorIntegrante[] = ['societario', 'fiscal', 'notas', 'dp', 'contabil', 'consultor']

/** Integrantes do BPO, um por função; quem é do setor BPO Financeiro vê todos (8/11/2026). */
export const integrantesBpo: SetorIntegrante[] = ['bpo_pagar', 'bpo_receber', 'bpo_conciliacao', 'bpo_gerencial']

export const rotuloSetorCurto: Record<SetorIntegrante, string> = {
  geral: 'Geral',
  societario: 'Societário',
  fiscal: 'Fiscal',
  notas: 'Notas',
  dp: 'DP',
  contabil: 'Contábil',
  consultor: 'Consultoria',
  gestao_atendimento: 'Gestão e Atendimento',
  financeiro_escritorio: 'Financeiro do escritório',
  bpo_financeiro: 'BPO Financeiro',
  bpo_pagar: 'Contas a Pagar',
  bpo_receber: 'Contas a Receber',
  bpo_conciliacao: 'Conciliação',
  bpo_gerencial: 'Gerencial',
}

/** Nome do papel nas telas. `colaborador` aparece como Membro (decisão do dono, docs/wireframe/DECISOES.md). */
export const rotuloPapel: Record<Papel, string> = { administrador: 'Administrador', gestor: 'Gestor', colaborador: 'Membro' }

import type { SetorIntegrante } from '@/theme/tipos'
import type { Perfil } from './perfil'
import { integrantesBpo, rotuloSetorCurto, setoresContabeis, todosSetores } from './setores'

/**
 * O que cada conta vê nas telas (subplano 03, seção 9; Fundações 3): módulos da
 * barra lateral, abas internas e as chaves de leitura. Sai do mesmo perfil que a
 * função `autorizar` usa, então esconder o botão e recusar a escrita concordam.
 */

export type IdModuloSessao = 'inicio' | 'painel' | 'clientes' | 'crm' | 'timesheet' | 'financeiro' | 'arquivos' | 'bpo' | 'config'

export interface Permissoes {
  modulos: IdModuloSessao[]
  abas: Partial<Record<IdModuloSessao, string[]>>
  /** Setores com vínculo (todos, para o Administrador). */
  setores: SetorIntegrante[]
  /** Setores que gere (Gestor) ou todos (Administrador). */
  gere: SetorIntegrante[]
  papelTimesheet: 'colaborador' | 'gestor' | 'admin'
  /** Financeiro só leitura (exceção por tela). */
  financeiroSoLeitura: boolean
  /** BPO (10, 5.4): margem só do Administrador; Configuração só ele edita. */
  bpoMargem: boolean
  bpoEditaConfig: boolean
  /** Texto curto para o menu do usuário. */
  resumo: string
}

const abaDoSetor: Partial<Record<SetorIntegrante, string>> = { societario: 'societario', fiscal: 'fiscal', notas: 'notas', dp: 'dp', contabil: 'contabil', consultor: 'consultoria' }
const ordemPainel = ['societario', 'obrigacoes', 'notas', 'fiscal', 'dp', 'contabil', 'consultoria', 'gestao']

export function permissoesDoPerfil(p: Perfil): Permissoes {
  const admin = p.papel === 'administrador'
  const setores = admin ? todosSetores : p.vinculos.map((v) => v.setor)
  const gere = admin ? todosSetores : p.vinculos.filter((v) => v.modo === 'gestao').map((v) => v.setor)
  const bloqueadas = new Set(admin ? [] : p.excecoes.filter((x) => x.efeito === 'bloquear').map((x) => x.tela))
  const liberadas = admin ? [] : p.excecoes.filter((x) => x.efeito === 'liberar').map((x) => x.tela)

  const contabeis = setores.filter((x) => setoresContabeis.includes(x))
  const painel = admin ? ordemPainel : ordemPainel.filter((a) => (a === 'obrigacoes' ? contabeis.length > 0 : a === 'gestao' ? gere.some((x) => setoresContabeis.includes(x)) : contabeis.some((x) => abaDoSetor[x] === a)))
  // 04, 10.1: conversas dos próprios setores para todos; leads com Gestão e Atendimento; comunicados
  // para todos (o Membro rascunha e envia com aprovação); Números para Gestor (o próprio setor) e Administrador.
  const atende = admin || setores.includes('gestao_atendimento')
  const crm = ['conversas', ...(atende ? ['leads'] : []), 'comunicados', ...(admin || gere.length > 0 ? ['numeros'] : [])]
  // 05, 8.1 com a revisão de consistência (00): Membro vê Meu tempo e Confirmações; Gestor, a Equipe dos
  // setores que gere; Rentabilidade (fase 3) só Administrador e Gestor com Gestão ou Financeiro.
  const papelTimesheet: Permissoes['papelTimesheet'] = admin ? 'admin' : gere.length > 0 ? 'gestor' : 'colaborador'
  const veRentabilidade = admin || gere.includes('gestao_atendimento') || gere.includes('financeiro_escritorio')
  const timesheet = papelTimesheet === 'colaborador' ? ['meu', 'confirmacoes'] : ['meu', 'equipe', ...(veRentabilidade ? ['rentabilidade'] : []), 'confirmacoes']
  const financeiroTotal = admin || gere.includes('financeiro_escritorio')
  // Membro só por exceção na conta (09, 10.6); Resultado, remuneração e sócios nunca se liberam assim.
  const porExcecao: Record<string, string> = {
    'aba.financeiro.honorarios': 'contratos',
    'aba.financeiro.contratos': 'contratos',
    'aba.financeiro.cobrancas': 'cobranca',
    'aba.financeiro.contas_pagar': 'pagar',
    'aba.financeiro.conciliacao': 'conciliacao',
  }
  const liberadasFin = financeiroTotal ? [] : [...new Set(liberadas.map((t) => porExcecao[t]).filter(Boolean))]
  const financeiroLeitura = !financeiroTotal && liberadasFin.length > 0
  const financeiro = financeiroTotal ? ['visao', 'contratos', 'cobranca', 'pagar', 'conciliacao', 'caixa', 'resultado'] : liberadasFin

  // BPO (10, 2.5 e 5.4): aparece com o setor; a assinatura (módulo ligado) é conferida na Plataforma.
  const noBpo = admin || setores.includes('bpo_financeiro')
  const gereBpo = admin || gere.includes('bpo_financeiro')
  const bpoRentabilidade = admin || (gereBpo && (gere.includes('gestao_atendimento') || gere.includes('financeiro_escritorio')))
  const bpo = !noBpo ? [] : ['visao', 'carteira', 'fila', 'rotinas', 'aprovacoes', 'entregas', ...(gereBpo ? ['volume'] : []), ...(bpoRentabilidade ? ['rentabilidade'] : []), ...(gereBpo ? ['configuracao'] : [])]
  const modulos: IdModuloSessao[] = [
    'inicio',
    // Sem Painel, o cadastro dos clientes vira item próprio (10, 2.2: [Painel | BPO] + Financeiro + Clientes).
    ...(painel.length ? (['painel'] as const) : (['clientes'] as const)),
    'crm',
    'arquivos',
    'timesheet',
    ...(financeiro.length ? (['financeiro'] as const) : []),
    ...(bpo.length ? (['bpo'] as const) : []),
    ...(admin ? (['config'] as const) : []),
  ]
  const nomes = setores.map((s) => rotuloSetorCurto[s])
  return {
    modulos,
    abas: { painel: painel.filter((a) => !bloqueadas.has(`aba.${a}`)), crm, timesheet, financeiro, bpo },
    bpoMargem: admin,
    bpoEditaConfig: gereBpo,
    // O setor do escritório (bpo_financeiro) abre os integrantes das funções do BPO.
    setores: setores.includes('bpo_financeiro') ? [...setores, ...integrantesBpo] : setores,
    gere,
    papelTimesheet,
    financeiroSoLeitura: financeiroLeitura,
    resumo: admin ? 'todos os setores' : nomes.join(', ') || 'nenhum setor',
  }
}

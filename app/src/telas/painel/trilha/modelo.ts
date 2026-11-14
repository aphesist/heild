import { useMemo } from 'react'
import { atividade } from '@/dados/atividades-s04'
import type { Cliente as ClienteE, EstadoCiclo, Id } from '@/nucleo/modelo/entidades'
import { ErroRegra } from '@/nucleo/permissoes/autorizar'
import { repos } from '@/nucleo/repositorios'
import { useTabela } from '@/nucleo/react'
import { comoIntegrante, criarTarefa, HOJE_ISO, type TarefaE } from '@/telas/tarefas/modelo'

/**
 * Trilhas de entrada e de saída (03, 7.7 e 8; 01, 4.8). Uma trilha é um
 * conjunto de tarefas: a raiz ("Implantação do cliente X", GES-106) e as
 * filhas por setor, com `tarefa_pai_id`, prazo relativo e dependência. Os
 * moldes usam as atividades reais de Entrada e Desligamento do catálogo
 * (pesquisa/atividades.json); os nomes dos marcos da transição seguem o
 * desenho do 03, 8.2. O que não é tarefa (o que o cliente e o contador
 * anterior precisam enviar, revogações, dossiê, dados da saída) fica no
 * estado da trilha (`s04:trilha:<cliente>`).
 */

export type IdMolde = 'abertura' | 'transicao' | 'mei' | 'pf' | 'saida' | 'baixa' | 'reentrada'
export interface Marco {
  codigo: string
  nome: string
  atividade: string
  setor: string
  /** Dias depois do início. */
  dias: number
  depende?: string[]
  /** Itens que o cliente envia para este marco (vira pendência no app). */
  cliente?: string[]
}
export interface Molde {
  id: IdMolde
  nome: string
  tipo: 'entrada' | 'saida'
  raiz: string
  marcos: Marco[]
  /** Horas previstas pelo molde (custo da entrada). */
  horas: number
}

const mk = (codigo: string, nome: string, atv: string, setor: string, dias: number, depende?: string[], cliente?: string[]): Marco => ({ codigo, nome, atividade: atv, setor, dias, depende, cliente })

export const moldes: Record<IdMolde, Molde> = {
  abertura: {
    id: 'abertura',
    nome: 'abertura (jornada a)',
    tipo: 'entrada',
    raiz: 'GES-106',
    horas: 22,
    marcos: [
      mk('a1', 'Planejar a estrutura', 'SOC-105', 'societario', 2),
      mk('a2', 'CNAEs, endereço e nome', 'SOC-025', 'societario', 4, ['a1'], ['Comprovante do endereço', 'Documentos dos sócios']),
      mk('a3', 'Contrato social', 'SOC-026', 'societario', 8, ['a2']),
      mk('a4', 'CNPJ e inscrições', 'SOC-027', 'societario', 15, ['a3']),
      mk('a5', 'Regime e enquadramento', 'SOC-028', 'fiscal', 18, ['a4']),
      mk('a6', 'Licenças e alvará', 'SOC-036', 'societario', 25, ['a4']),
      mk('a7', 'Certificado A1', 'SOC-008', 'societario', 16, ['a4'], ['Certificado A1 e senha']),
      mk('a8', 'Autorização de acesso RFB', 'SOC-011', 'societario', 17, ['a7'], ['Autorização de acesso RFB (gov.br prata/ouro)']),
      mk('a9', 'Implantar a contabilidade', 'CTB-108', 'contabil', 20, ['a4'], ['Contas e consentimento do Open Finance']),
      mk('a10', 'Preparar o empregador', 'DP-105', 'dp', 22, ['a4']),
      mk('a11', 'Ativar no app e nos canais', 'GES-104', 'gestao_atendimento', 18, ['a4'], ['Opt-in do WhatsApp']),
      mk('a12', 'Primeiro fechamento de cada setor', 'GES-106', 'gestao_atendimento', 40, ['a5', 'a9', 'a10']),
    ],
  },
  transicao: {
    id: 'transicao',
    nome: 'transição (jornada b)',
    tipo: 'entrada',
    raiz: 'GES-106',
    horas: 26,
    marcos: [
      mk('b1', 'Janela de 90 dias', 'NFE-101', 'notas', 2, undefined, ['Certificado A1 e senha']),
      mk('b2', 'Competência de corte', 'FIS-102', 'fiscal', 3),
      mk('b3', 'Acervo do contador anterior', 'CIC-002', 'societario', 10, ['b2']),
      mk('b4', 'Acessos e autorizações', 'SOC-011', 'societario', 6, undefined, ['Autorização de acesso RFB', 'Procuração FGTS Digital']),
      mk('b5', 'Diagnóstico de entrada', 'SOC-102', 'societario', 12, ['b4']),
      mk('b6', 'Heranças (parcelamentos, processos)', 'FIS-105', 'fiscal', 15, ['b3', 'b4']),
      mk('b7', 'Saldos de abertura', 'CTB-103', 'contabil', 18, ['b3'], ['Contas e consentimento do Open Finance']),
      mk('b8', 'Ambientes fiscais eletrônicos', 'FIS-107', 'fiscal', 10, ['b4']),
      mk('b9', 'Regularizar omissões herdadas', 'FIS-106', 'fiscal', 25, ['b5']),
      mk('b10', 'Primeiro fechamento de cada setor', 'DP-104', 'dp', 35, ['b7', 'b8']),
      mk('b11', 'Passar o cliente a ativo', 'GES-106', 'gestao_atendimento', 40, ['b10']),
    ],
  },
  mei: {
    id: 'mei',
    nome: 'MEI (c1 a c4)',
    tipo: 'entrada',
    raiz: 'GES-106',
    horas: 4,
    marcos: [mk('c1', 'Cadastro pelo CNPJ', 'SOC-001', 'societario', 1), mk('c2', 'Acesso ao PGMEI', 'SOC-011', 'societario', 3, ['c1'], ['Conta gov.br prata/ouro']), mk('c3', 'App e emissor de nota', 'NFE-201', 'notas', 5, ['c1'], ['Opt-in do WhatsApp']), mk('c4', 'Primeiro DAS-MEI', 'FIS-001', 'fiscal', 20, ['c2'])],
  },
  pf: {
    id: 'pf',
    nome: 'pessoa física (c5 a c8)',
    tipo: 'entrada',
    raiz: 'GES-106',
    horas: 5,
    marcos: [mk('c5', 'Cadastro e perfil fiscal', 'PF-001', 'fiscal', 1), mk('c6', 'Pré-preenchida e anteriores', 'PF-005', 'fiscal', 5, ['c5'], ['Declarações anteriores', 'Informes de rendimentos']), mk('c7', 'Carnê-leão', 'PF-013', 'fiscal', 15, ['c5']), mk('c8', 'App do cliente', 'GES-104', 'gestao_atendimento', 3, ['c5'])],
  },
  reentrada: {
    id: 'reentrada',
    nome: 'reentrada de ex-cliente (C2-24)',
    tipo: 'entrada',
    raiz: 'GES-106',
    horas: 8,
    marcos: [mk('r1', 'Rever o histórico e a saída', 'SOC-102', 'societario', 2), mk('r2', 'Acessos de novo', 'SOC-011', 'societario', 5, undefined, ['Autorização de acesso RFB']), mk('r3', 'O que mudou desde a saída', 'FIS-103', 'fiscal', 10, ['r2']), mk('r4', 'Ativar no app', 'GES-104', 'gestao_atendimento', 4), mk('r5', 'Primeiro fechamento', 'GES-106', 'gestao_atendimento', 30, ['r3'])],
  },
  saida: {
    id: 'saida',
    nome: 'saída para outra contabilidade (e1 a e13)',
    tipo: 'saida',
    raiz: 'CIC-003',
    horas: 14,
    marcos: [
      mk('e1', 'Tratar o pedido de rescisão', 'SOC-106', 'societario', 1),
      mk('e2', 'Entrevista de saída', 'GES-107', 'gestao_atendimento', 3),
      mk('e3', 'Competência de corte', 'FIS-102', 'fiscal', 3, ['e1']),
      mk('e4', 'Responsabilidades com o sucessor', 'SOC-107', 'societario', 10, ['e3']),
      mk('e5', 'Dossiê fiscal', 'FIS-108', 'fiscal', 12, ['e3']),
      mk('e6', 'Acervo do DP', 'DP-106', 'dp', 12, ['e3']),
      mk('e7', 'Pacote contábil', 'CTB-109', 'contabil', 15, ['e3']),
      mk('e8', 'Notas da competência de corte', 'NFE-104', 'notas', 10, ['e3']),
      mk('e9', 'Dossiê único e termo de entrega', 'CIC-003', 'societario', 18, ['e5', 'e6', 'e7', 'e8']),
      mk('e10', 'Revogar autorizações', 'SOC-024', 'societario', 20, ['e9']),
      mk('e11', 'Desligar a captura de notas', 'NFE-105', 'notas', 20, ['e8']),
      mk('e12', 'Encerrar as cobranças', 'GES-046', 'gestao_atendimento', 20),
      mk('e13', 'Desativar na plataforma', 'GES-108', 'gestao_atendimento', 25, ['e10', 'e11']),
    ],
  },
  baixa: {
    id: 'baixa',
    nome: 'baixa da empresa (f1 a f11)',
    tipo: 'saida',
    raiz: 'SOC-031',
    horas: 18,
    marcos: [
      mk('f1', 'Avaliar baixa ou inatividade', 'SOC-110', 'societario', 2),
      mk('f2', 'Tributação do encerramento', 'CON-106', 'consultor', 6, ['f1']),
      mk('f3', 'Obrigações de encerramento', 'FIS-110', 'fiscal', 20, ['f1']),
      mk('f4', 'Encerrar o DP', 'DP-108', 'dp', 15, ['f1']),
      mk('f5', 'Balanço de liquidação', 'CTB-110', 'contabil', 25, ['f3']),
      mk('f6', 'Distrato e baixa do CNPJ', 'SOC-031', 'societario', 30, ['f5']),
      mk('f7', 'Estoque e baixa da IE', 'FIS-111', 'fiscal', 30, ['f3']),
      mk('f8', 'Acervo de notas', 'NFE-106', 'notas', 32, ['f6']),
      mk('f9', 'Registros acessórios', 'SOC-109', 'societario', 35, ['f6']),
      mk('f10', 'Cobrar o encerramento', 'GES-109', 'gestao_atendimento', 10),
      mk('f11', 'Retenção e descarte (LGPD)', 'SOC-108', 'societario', 40, ['f6']),
    ],
  },
}

/** Revogações e desligamentos (03, 8.3): checklist gerado das matrizes. */
export const revogacoesPadrao = [
  { codigo: 'SOC-024', item: 'Revogar autorização de acesso e procurações na RFB' },
  { codigo: 'DP-107', item: 'Revogar procurações trabalhistas (eSocial, FGTS Digital, DET)' },
  { codigo: 'FIS-109', item: 'Encerrar acessos e automações fiscais' },
  { codigo: 'NFE-105', item: 'Desligar a captura e o autXML' },
  { codigo: 'CTB-111', item: 'Encerrar consentimentos do Open Finance' },
  { codigo: 'GES-108', item: 'Desativar o cliente no app e nos canais' },
]

export const anteriorPadrao = ['ECD e ECF dos últimos 5 anos (CIC-002)', 'Balancetes do ano (CTB-102)', 'Arquivos do eSocial e folhas (DP-103)', 'Parcelamentos e processos em curso (FIS-105)', 'Senhas e acessos dos portais']

export interface EstadoTrilha {
  molde: IdMolde
  raizId: Id
  responsavel: string
  desde: string
  corte: string
  cliente: { item: string; marco: string; pedido_em: string; recebido_em?: string; cobrancas: number }[]
  anterior: { item: string; pedido_em: string; recebido_em?: string; cobrancas: number; ultima_carta?: string }[]
  capturaXml?: number
  saida?: { motivo: string; data: string; corte: string; aviso: string; sucessor?: string }
  clientePrecisa?: { item: string; feito?: boolean }[]
  revogacoes?: { codigo: string; item: string; feito_por?: string; em?: string }[]
  dossie?: { gerado_em: string; manifesto: { arquivo: string; hash: string; setor: string }[]; enviado_em?: string; termo?: boolean }
}

export const chaveTrilha = (clienteId: Id, tipo: 'entrada' | 'saida') => `s04:trilha:${tipo}:${clienteId}`
export const lerTrilha = (clienteId: Id, tipo: 'entrada' | 'saida') => repos.telas.obter(chaveTrilha(clienteId, tipo))?.valor as EstadoTrilha | undefined
export const gravarTrilha = (clienteId: Id, tipo: 'entrada' | 'saida', e: EstadoTrilha) => repos.telas.lembrar(chaveTrilha(clienteId, tipo), e)

export function useTrilha(clienteId: Id | undefined, tipo: 'entrada' | 'saida') {
  const t = useTabela('registro_tela')
  return useMemo(() => (clienteId ? lerTrilha(clienteId, tipo) : undefined), [t, clienteId, tipo])
}

const somar = (iso: string, d: number) => {
  const x = new Date(`${iso}T12:00:00`)
  x.setDate(x.getDate() + d)
  return x.toISOString().slice(0, 10)
}

/** Marco bloqueado: depende de outro que não terminou. */
export function bloqueio(t: TarefaE, irmas: TarefaE[]): string[] {
  const dep = (t.extras?.depende_de as string[] | undefined) ?? []
  return dep.filter((c) => irmas.find((x) => x.extras?.marco === c)?.status !== 'concluida')
}

/** Molde sugerido para o cliente (regime e tipo). */
export const moldeSugerido = (c: ClienteE, tipo: 'entrada' | 'saida'): IdMolde => (tipo === 'saida' ? 'saida' : c.regime === 'mei' ? 'mei' : c.regime === 'pf' ? 'pf' : 'transicao')

/** `cliente.gerar_jornada(molde)` (CIC-001): o integrante Societário cria a raiz e as filhas. */
export function gerarTrilha(c: ClienteE, molde: IdMolde, o: { responsavel: string; saida?: EstadoTrilha['saida'] } = { responsavel: 'Bruno Costa' }) {
  const m = moldes[molde]
  const tipo = m.tipo
  if (lerTrilha(c.id, tipo) && repos.tarefas.obter(lerTrilha(c.id, tipo)!.raizId)) throw new ErroRegra('Este cliente já tem a trilha gerada.')
  const inicio = o.saida?.data && tipo === 'saida' ? HOJE_ISO : HOJE_ISO
  return comoIntegrante('Societário', () => {
    const raiz = criarTarefa({
      atividade_id: m.raiz,
      titulo: `${tipo === 'entrada' ? 'Implantação' : molde === 'baixa' ? 'Baixa' : 'Saída'} de ${c.nome}`,
      setor_id: tipo === 'entrada' ? 'gestao_atendimento' : 'societario',
      cliente_id: c.id,
      origem: 'trilha',
      prazo_interno: somar(inicio, Math.max(...m.marcos.map((x) => x.dias))),
      status: 'em_andamento',
      extras: { trilha_raiz: true, molde, responsavel_nome: o.responsavel, responsavel_tipo_tela: 'pessoa' },
    })
    for (const mc of m.marcos) {
      criarTarefa({
        atividade_id: mc.atividade,
        titulo: `${mc.codigo} · ${mc.nome}`,
        setor_id: mc.setor,
        cliente_id: c.id,
        origem: 'trilha',
        origem_ref: raiz.id,
        tarefa_pai_id: raiz.id,
        prazo_interno: somar(inicio, mc.dias),
        responsavel: mc.setor === 'gestao_atendimento' ? undefined : { tipo: 'integrante', id: `i-${mc.setor}`, nome: atividade(mc.atividade)?.autonomia === 'S' ? nomeSetor(mc.setor) : nomeSetor(mc.setor), setor: mc.setor as never },
        extras: { marco: mc.codigo, depende_de: mc.depende ?? [], molde },
      })
    }
    const estado: EstadoTrilha = {
      molde,
      raizId: raiz.id,
      responsavel: o.responsavel,
      desde: HOJE_ISO,
      corte: '10/2026',
      cliente: m.marcos.flatMap((mc) => (mc.cliente ?? []).map((item) => ({ item, marco: mc.codigo, pedido_em: HOJE_ISO, cobrancas: 0 }))),
      anterior: molde === 'transicao' || molde === 'reentrada' ? anteriorPadrao.map((item) => ({ item, pedido_em: HOJE_ISO, cobrancas: 0, ultima_carta: HOJE_ISO })) : [],
      ...(tipo === 'saida'
        ? {
            saida: o.saida ?? { motivo: 'troca de contador', data: somar(HOJE_ISO, 30), corte: '11/2026', aviso: '30 dias' },
            clientePrecisa: [{ item: 'Assinar o distrato' }, { item: 'Informar o contador sucessor' }, { item: 'Retirar o certificado A1 ou autorizar o descarte' }],
            revogacoes: revogacoesPadrao.map((r) => ({ ...r })),
          }
        : {}),
    }
    gravarTrilha(c.id, tipo, estado)
    return raiz
  })
}

const nomesSetor: Record<string, string> = { societario: 'Societário', fiscal: 'Fiscal', notas: 'Notas', dp: 'DP', contabil: 'Contábil', consultor: 'Consultor', gestao_atendimento: 'Atendimento' }
export const nomeSetor = (s: string) => nomesSetor[s] ?? s

/* ---------- Ciclo de vida (03, 3.5 e 8.1; 01, ad. 23) ---------- */

export const ordemCiclo: EstadoCiclo[] = ['prospect', 'proposta', 'aceito', 'em_implantacao', 'ativo', 'em_saida', 'em_baixa', 'inativo', 'encerrado']
export const rotuloCiclo: Record<EstadoCiclo, string> = {
  prospect: 'prospect',
  proposta: 'proposta',
  aceito: 'aceito',
  em_implantacao: 'em implantação',
  ativo: 'ativo',
  inativo: 'inativo',
  em_saida: 'em saída',
  em_baixa: 'em baixa',
  encerrado: 'encerrado',
  arquivado: 'arquivado',
  eliminado: 'eliminado',
}
/** Transições permitidas (CIC-001). */
export const proximosEstados: Partial<Record<EstadoCiclo, EstadoCiclo[]>> = {
  prospect: ['proposta'],
  proposta: ['aceito', 'prospect'],
  aceito: ['em_implantacao'],
  em_implantacao: ['ativo', 'em_saida'],
  ativo: ['em_saida', 'em_baixa', 'inativo'],
  em_saida: ['encerrado', 'ativo'],
  em_baixa: ['encerrado', 'ativo'],
  inativo: ['ativo', 'em_baixa', 'encerrado'],
  encerrado: ['em_implantacao'],
}

/** O que impede a mudança (bloqueios do 01, 4.2 e 03, 8). */
export function bloqueiosDaMudanca(c: ClienteE, para: EstadoCiclo, tarefas: TarefaE[]): string[] {
  const b: string[] = []
  if (para === 'encerrado') {
    const saida = lerTrilha(c.id, 'saida')
    const remanescentes = tarefas.filter((t) => t.cliente_id === c.id && !['concluida', 'cancelada'].includes(t.status) && !t.extras?.trilha_raiz)
    if (remanescentes.length) b.push(`${remanescentes.length} ${remanescentes.length === 1 ? 'obrigação ou tarefa remanescente' : 'obrigações ou tarefas remanescentes'} até o corte`)
    if (saida && saida.revogacoes?.some((r) => !r.feito_por)) b.push('revogações e desligamentos ainda abertos')
  }
  if (para === 'ativo' && c.estado_ciclo === 'em_implantacao') {
    const e = lerTrilha(c.id, 'entrada')
    const filhas = e ? tarefas.filter((t) => t.tarefa_pai_id === e.raizId) : []
    const fechamento = filhas.find((t) => ['a12', 'b10', 'c4', 'c7', 'r5'].includes(String(t.extras?.marco)))
    if (!e) b.push('a trilha de implantação ainda não foi gerada')
    else if (fechamento && fechamento.status !== 'concluida') b.push('o primeiro fechamento de cada setor ainda não terminou (GES-106)')
  }
  return b
}

/** Histórico do ciclo, pelos eventos do cliente. */
export function historicoCiclo(clienteId: Id) {
  return repos.eventos.listar((e) => e.resultado_ref === clienteId && /estado|ciclo|reativ|exce/i.test(e.texto)).reverse()
}

export function mudarEstado(c: ClienteE, para: EstadoCiclo, motivo?: string, servico: 'contabil' | 'bpo' = 'contabil') {
  if (servico === 'bpo') {
    return repos.clientes.atualizar(c.id, { extras: { ...c.extras, ciclo_bpo: para, ciclo_bpo_desde: HOJE_ISO } }, { ferramenta: 'cliente.mudar_estado', texto: `estado do BPO de ${c.nome}: ${rotuloCiclo[para]}${motivo ? ` (${motivo})` : ''}` })
  }
  return repos.clientes.atualizar(c.id, { estado_ciclo: para, estado_ciclo_desde: HOJE_ISO }, { ferramenta: 'cliente.mudar_estado', texto: `estado de ${c.nome}: ${rotuloCiclo[c.estado_ciclo]} → ${rotuloCiclo[para]}${motivo ? ` (${motivo})` : ''}` })
}

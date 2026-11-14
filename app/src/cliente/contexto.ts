import { useSyncExternalStore } from 'react'
import { fichas, type ContatoCliente, type FichaCliente } from '@/ambiente/clientes'
import { banco } from '@/nucleo/banco'
import { useBanco, useEscritorio } from '@/nucleo/react'
import type { Tarefa } from '@/dados/tipos'
import { dominioDoApp } from './dados'
import type { SetorIntegrante } from '@/theme/tipos'

/**
 * Contexto do app do cliente: quem é a pessoa, que empresa está aberta, que
 * áreas o papel dela vê (06, 2.4, por serviço contratado, somadas) e como as
 * telas navegam. As telas recebem `ctx` e não sabem do resto.
 */

export interface PessoaApp {
  nome: string
  empresas: { clienteId: string; contato: ContatoCliente }[]
}

/** Pessoas com acesso, pela ficha atual (o escritório liga e desliga o app de cada contato). */
export function pessoasDoApp(fichaDe: (id: string) => FichaCliente | undefined = (id) => fichas[id], ids: string[] = Object.keys(fichas)): PessoaApp[] {
  const mapa = new Map<string, PessoaApp>()
  for (const id of ids) {
    const f = fichaDe(id)
    if (!f) continue
    for (const c of f.contatos) {
      if (!c.app) continue
      const p = mapa.get(c.nome) ?? { nome: c.nome, empresas: [] }
      if (!p.empresas.some((e) => e.clienteId === f.id)) p.empresas.push({ clienteId: f.id, contato: c })
      mapa.set(c.nome, p)
    }
  }
  return [...mapa.values()]
}

export type Area = 'guias' | 'folha' | 'financeiro' | 'societario' | 'documentos' | 'bpo'

/**
 * 06, 2.4: o papel define as áreas; o RH não vê guias nem honorários; o financeiro não vê folha;
 * o fiscal da empresa vê guias e documentos.
 * BPO (10, 3.6): quem tem alçada de pagamento vê Aprovações e Fluxo de caixa; a empresa só de BPO
 * não tem as áreas da contabilidade.
 */
export function areasDo(c: ContatoCliente, servicos?: ('contabil' | 'bpo')[]): Area[] {
  const bpo: Area[] = servicos?.includes('bpo') && (c.alcadaPagamento ?? 0) > 0 ? ['bpo'] : []
  if (servicos && !servicos.includes('contabil')) return [...(c.papel === 'financeiro' ? [] : (['financeiro'] as Area[])), 'documentos', ...bpo]
  if (c.papel === 'RH') return ['folha']
  if (c.papel === 'financeiro' || c.papel === 'diretor financeiro') return ['guias', 'financeiro', 'documentos', ...bpo]
  if (c.papel === 'fiscal da empresa') return ['guias', 'documentos']
  return ['guias', 'folha', 'financeiro', 'societario', 'documentos', ...bpo]
}

export const setoresDas = (areas: Area[]): SetorIntegrante[] => [
  ...(areas.includes('guias') ? (['fiscal', 'notas', 'contabil'] as const) : []),
  ...(areas.includes('folha') ? (['dp'] as const) : []),
  ...(areas.includes('societario') ? (['societario', 'consultor'] as const) : []),
  ...(areas.includes('bpo') ? (['bpo_financeiro'] as const) : []),
  'gestao_atendimento',
]

export const nomeSetor: Partial<Record<SetorIntegrante | 'financeiro_escritorio', string>> = {
  fiscal: 'Fiscal',
  notas: 'Notas fiscais',
  contabil: 'Contábil',
  dp: 'Departamento Pessoal',
  societario: 'Societário',
  consultor: 'Consultoria',
  gestao_atendimento: 'Atendimento',
  bpo_financeiro: 'BPO Financeiro',
  financeiro_escritorio: 'Financeiro do escritório',
}

export const primeiroNome = (n: string) => n.replace('Dra. ', '').split(' ')[0]
export const idDoUsuario = (nome?: string) => banco.ler('usuario').find((u) => u.nome === nome)?.id

export type Tela =
  | 'inicio'
  | 'documentos'
  | 'pendencias'
  | 'conversa'
  | 'mais'
  | 'pedidos'
  | 'financeiro'
  | 'empresa'
  | 'agenda'
  | 'servicos'
  | 'servico'
  | 'aprovacoes'
  | 'caixa'
  | 'avisos'
  | 'assinaturas'
  | 'passos'

export const telasValidas: Tela[] = ['inicio', 'documentos', 'pendencias', 'conversa', 'mais', 'pedidos', 'financeiro', 'empresa', 'agenda', 'servicos', 'servico', 'aprovacoes', 'caixa', 'avisos', 'assinaturas', 'passos']
/** Telas que ficam debaixo do "Mais" no menu inferior. */
export const telasDoMais: Tela[] = ['mais', 'pedidos', 'financeiro', 'empresa', 'agenda', 'servicos', 'servico', 'aprovacoes', 'caixa', 'assinaturas', 'passos']

export interface Ctx {
  clienteId: string
  clienteNome: string
  contato: ContatoCliente
  areas: Area[]
  setores: SetorIntegrante[]
  /** Nome da pessoa (o mesmo do contato na ficha). */
  pessoa: string
  ehSocio: boolean
  /** Escritório saiu da plataforma: app em modo leitura até a data (06, 12.6). */
  leitura: { encerraEm: string } | null
  /** Item aberto dentro da tela atual (documento, pedido, seção, serviço), também no endereço. */
  item: string | null
  avisarApp: (t: string) => void
  ir: (t: Tela, item?: string | null) => void
  abrirConversa: (setor: SetorIntegrante) => void
  abrirServico: (id: string) => void
  /** Linha do tempo do escritório ("Chegou ao escritório"): `fulano (cliente, app)`. */
  registrar: (texto: string) => void
}

export const ator = (ctx: Pick<Ctx, 'contato'>) => `${ctx.contato.nome} (cliente, app)`

/** Como o cliente lê a pendência: o que mandar, não o nome interno da tarefa. */
const pedidoPorCodigo: Record<string, string> = {
  'DP-001': 'Documentos das 2 admissões (RG, CPF, CTPS e exame admissional)',
  'FIS-009': 'Notas de outubro, para fechar o PGDAS-D',
  'CTB-002': 'Extrato bancário de outubro',
  'NFE-021': 'XML das 3 compras sem nota',
  'FIS-038': 'Documentos do CT-e 0912 para a resposta à SEFAZ',
  'SOC-009': 'Certificado digital novo (A1)',
}
export const oQueMandar = (t: Tarefa) => pedidoPorCodigo[t.codigo] ?? t.titulo.replace(/^(Cobrar|Pedir) /, '').replace(/^./, (c) => c.toUpperCase())

/** Tarefa de BPO esperando o cliente é aprovação de pagamento (vai para Aprovações), não envio de arquivo. */
export const ehAprovacaoBpo = (t: Tarefa) => t.setor === 'bpo_financeiro' && /aprova|lote/i.test(t.titulo)

/** Nome do escritório aberto (marca do app e domínio). */
export function useNomeEscritorio() {
  const e = useEscritorio()
  const b = useBanco()
  return e?.nome_fantasia || b.escritorio.nome
}

/* Empresa aberta no app agora (a moldura do wireframe lê para o farol e as simulações). */
let empresaAtual: { pessoa: string; clienteId: string } | null = null
const ouvintes = new Set<() => void>()
export function definirEmpresaAtual(v: { pessoa: string; clienteId: string } | null) {
  if (v?.clienteId === empresaAtual?.clienteId && v?.pessoa === empresaAtual?.pessoa) return
  empresaAtual = v
  ouvintes.forEach((f) => f())
}
export function useEmpresaAtual() {
  return useSyncExternalStore(
    (f) => {
      ouvintes.add(f)
      return () => ouvintes.delete(f)
    },
    () => empresaAtual,
  )
}

/** Domínio do app do escritório (pela razão social; marca branca usa o domínio próprio). */
export function useDominioApp() {
  const e = useEscritorio()
  const b = useBanco()
  return dominioDoApp(e?.razao_social || b.escritorio.nome)
}

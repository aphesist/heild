import { banco } from '@/nucleo/banco'
import { ID_HORIZONTE } from '@/nucleo/semente'

/**
 * Raio-X do Drive (D-10; S09-T14): diagnóstico das pastas de todos os
 * clientes antes de o mapeamento valer. Lê só a lista de pastas e arquivos
 * (nunca o conteúdo) e transforma cada achado num item de aprovação em lote:
 * nada vale sem o sim do Administrador.
 */

export type TipoAchado = 'sem_cliente' | 'ex_cliente' | 'padrao' | 'mes_fora' | 'departamento' | 'orgao' | 'cliente_sem_pasta' | 'ignorar'

export type Decisao = 'aprovado' | 'ignorado' | 'ex_cliente' | { ligar: string }

export interface Achado {
  id: string
  tipo: TipoAchado
  /** Pasta (caminho no Drive) ou padrão. */
  pasta: string
  /** O que o Geral sugere. */
  sugestao: string
  /** Cliente sugerido quando a sugestão é ligar. */
  cliente_id?: string
  /** Quantas pastas o achado cobre. */
  pastas: number
  detalhe: string
}

export const rotuloTipoAchado: Record<TipoAchado, string> = {
  sem_cliente: 'Pasta sem cliente',
  ex_cliente: 'Parece ex-cliente',
  padrao: 'Padrões diferentes',
  mes_fora: 'Meses fora do padrão',
  departamento: 'Departamento com outro nome',
  orgao: 'Órgão reconhecido',
  cliente_sem_pasta: 'Cliente sem pasta',
  ignorar: 'Não é de cliente',
}

export interface Resumo {
  pastasCliente: number
  casaram: number
  semCliente: number
  exClientes: number
  padroesFiscal: number
  mesesFora: number
  itensLidos: number
}

export const resumoDoEscritorio = (): Resumo =>
  banco.escritorioId === ID_HORIZONTE ? { pastasCliente: 38, casaram: 31, semCliente: 4, exClientes: 3, padroesFiscal: 2, mesesFora: 12, itensLidos: 18440 } : { pastasCliente: 142, casaram: 128, semCliente: 9, exClientes: 5, padroesFiscal: 3, mesesFora: 37, itensLidos: 96210 }

/** Achados a partir dos clientes do escritório (nomes de pasta como as pessoas costumam escrever). */
export function achadosDe(clientes: { id: string; nome: string; documento: string }[]): Achado[] {
  const c = (i: number) => clientes[i % Math.max(1, clientes.length)]
  const curto = (n: string) => n.split(' ').slice(0, 2).join(' ')
  const l: Achado[] = []
  if (clientes.length) {
    l.push({ id: 'rx1', tipo: 'sem_cliente', pasta: `Clientes/${curto(c(1).nome)} (antigo)`, sugestao: `Ligar a ${c(1).nome}`, cliente_id: c(1).id, pastas: 1, detalhe: 'O nome bate com o cadastro; o CNPJ não aparece no nome da pasta.' })
    l.push({ id: 'rx2', tipo: 'sem_cliente', pasta: `Clientes/${curto(c(4).nome).toUpperCase()} 2019`, sugestao: `Ligar a ${c(4).nome}`, cliente_id: c(4).id, pastas: 1, detalhe: 'Ano no nome da pasta; dentro, a mesma estrutura dos outros clientes.' })
    l.push({ id: 'rx3', tipo: 'cliente_sem_pasta', pasta: `${c(6).documento} - ${c(6).nome}`, sugestao: 'Criar a pasta pela árvore-modelo', cliente_id: c(6).id, pastas: 0, detalhe: 'Cliente ativo sem nenhuma pasta no Drive.' })
  }
  l.push({ id: 'rx4', tipo: 'ignorar', pasta: 'Clientes/_modelos', sugestao: 'Ignorar (modelos do escritório)', pastas: 1, detalhe: 'Só planilhas-modelo; nenhum CNPJ.' })
  l.push({ id: 'rx5', tipo: 'ex_cliente', pasta: 'Clientes/Gráfica Impacta', sugestao: 'Marcar como ex-cliente (vai para Arquivo morto)', pastas: 1, detalhe: 'Nada novo desde 03/2023; não está no cadastro ativo.' })
  l.push({ id: 'rx6', tipo: 'ex_cliente', pasta: 'Clientes/Oficina do Zé', sugestao: 'Marcar como ex-cliente (vai para Arquivo morto)', pastas: 1, detalhe: 'Última alteração 11/2022; contrato encerrado no Financeiro.' })
  l.push({ id: 'rx7', tipo: 'padrao', pasta: 'Fiscal/2026-10 · FISCAL/10.2026 · Impostos/Outubro 2026', sugestao: 'Adotar “Fiscal/<ano>-<mês>” para as pastas novas', pastas: 61, detalhe: 'Três jeitos de organizar o Fiscal. As pastas antigas não são renomeadas; o dicionário as entende.' })
  l.push({ id: 'rx8', tipo: 'mes_fora', pasta: '“Out-26”, “outubro”, “10.2026”', sugestao: 'Ensinar o dicionário de meses (sem renomear)', pastas: 37, detalhe: 'Pastas de mês com nomes livres. O mês do documento passa a sair do nome, como no D-02.' })
  l.push({ id: 'rx9', tipo: 'departamento', pasta: '“DP”, “RH”, “Folha”', sugestao: 'Tratar como Pessoal', pastas: 44, detalhe: 'Três nomes para o mesmo departamento.' })
  l.push({ id: 'rx10', tipo: 'departamento', pasta: '“Legal”, “Societário”, “Legalização”', sugestao: 'Tratar como Societário', pastas: 29, detalhe: 'O setor se chama Societário; os outros são sinônimos.' })
  l.push({ id: 'rx11', tipo: 'orgao', pasta: '“AVCB”, “Bombeiros”', sugestao: 'Reconhecer como órgão Bombeiros', pastas: 12, detalhe: 'Licenças do Corpo de Bombeiros (C2-21).' })
  return l
}

/** Por cliente: que departamentos a pasta tem (contagens para todos; nomes só para o Administrador). */
export function porCliente(clientes: { id: string; nome: string; documento: string }[]) {
  return clientes.map((c, i) => ({
    cliente: c,
    casouPor: i % 7 === 6 ? null : i % 3 === 0 ? 'CNPJ' : 'nome',
    contabil: i % 7 !== 6,
    fiscal: i % 7 !== 6,
    pessoal: i % 7 !== 6 && i % 4 !== 1,
    legalizacao: i % 7 !== 6 && i % 2 === 0,
  }))
}

export const estrutura = [
  { depto: 'Contábil', jeitos: [['Contabil/<ano>/<mês>', 58], ['Contábil/<mês>.<ano>', 31], ['Balancetes/<ano>', 11]] as [string, number][] },
  { depto: 'Fiscal', jeitos: [['Fiscal/<ano>-<mês>', 54], ['FISCAL/<mês>.<ano>', 30], ['Impostos/<Mês> <ano>', 16]] as [string, number][] },
  { depto: 'Pessoal', jeitos: [['DP/<ano>/<mês>', 47], ['RH/<mês>-<ano>', 33], ['Folha/<ano>', 20]] as [string, number][] },
  { depto: 'Societário', jeitos: [['Legal/<assunto>', 62], ['Societário', 38]] as [string, number][] },
]

export const padroes = [
  { nome: '<ano>-<mês>', pastas: 1840 },
  { nome: '<mês>.<ano>', pastas: 1210 },
  { nome: '<Mês por extenso> <ano>', pastas: 640 },
  { nome: 'Contrato social', pastas: 139 },
  { nome: 'Procurações', pastas: 118 },
  { nome: 'Certidões', pastas: 131 },
]

export const orgaos = [
  { nome: 'Receita Federal', pastas: 412 },
  { nome: 'PGFN', pastas: 37 },
  { nome: 'Junta Comercial', pastas: 128 },
  { nome: 'Sefaz', pastas: 226 },
  { nome: 'Prefeitura', pastas: 301 },
  { nome: 'Bombeiros', pastas: 12 },
  { nome: 'Vigilância Sanitária', pastas: 18 },
  { nome: 'Conselhos (CRM, CRO, CREA)', pastas: 9 },
]

export interface Dicionario {
  departamentos: { nome: string; sinonimos: string[] }[]
  orgaos: { nome: string; sinonimos: string[] }[]
}

export const dicionarioInicial: Dicionario = {
  departamentos: [
    { nome: 'Contábil', sinonimos: ['Contabil', 'Contabilidade', 'Balancetes'] },
    { nome: 'Fiscal', sinonimos: ['FISCAL', 'Impostos', 'Tributos'] },
    { nome: 'Pessoal', sinonimos: ['DP', 'RH', 'Folha'] },
    { nome: 'Societário', sinonimos: ['Legal', 'Legalização', 'Societario'] },
  ],
  orgaos: [
    { nome: 'Receita Federal', sinonimos: ['RFB', 'Receita', 'e-CAC'] },
    { nome: 'PGFN', sinonimos: ['Dívida ativa'] },
    { nome: 'Junta Comercial', sinonimos: ['JUCESP', 'Junta'] },
    { nome: 'Sefaz', sinonimos: ['SEFAZ', 'Estadual', 'ICMS'] },
    { nome: 'Prefeitura', sinonimos: ['Municipal', 'ISS'] },
    { nome: 'Bombeiros', sinonimos: ['AVCB', 'Corpo de Bombeiros'] },
    { nome: 'Vigilância Sanitária', sinonimos: ['Visa', 'Vigilância'] },
  ],
}

export interface EstadoRaioX {
  rodado_em: string | null
  /** Onde o Raio-X leu (S09b: qualquer nuvem ou o servidor local; padrão, o Drive antigo). */
  provedor?: string
  decisoes: Record<string, Decisao>
  /** Decisões aplicadas (o mapeamento passou a valer). */
  aplicado_em: string | null
  dicionario: Dicionario
}

export const CHAVE_RAIOX = 's09:raiox'
export const estadoRaioXInicial: EstadoRaioX = { rodado_em: null, decisoes: {}, aplicado_em: null, dicionario: dicionarioInicial }

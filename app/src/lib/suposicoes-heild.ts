import type { ConfigValor } from '@/components/kit/valor-editavel'
import { rotuloSetorCurto } from '@/nucleo/permissoes/setores'
import type { SetorIntegrante } from '@/theme/tipos'
import type { CampoSuposicao, ContextoSuposicoes } from './suposicoes'

/**
 * O que a regra de suposições sabe da Heild: as palavras de cada setor (do
 * mapa de atividades) e o seletor de cada campo suposto. O pedido "manda a
 * DAS de outubro da Padaria" vira cliente Padaria, competência 10/2026 e setor
 * Fiscal sem modelo nenhum.
 */
export const palavrasDosSetores: { id: SetorIntegrante; palavras: string[] }[] = [
  { id: 'fiscal', palavras: ['DAS', 'PGDAS', 'ICMS', 'ISS', 'DCTFWeb', 'imposto', 'guia', 'declaração', 'certidão', 'fiscal', 'Simples'] },
  { id: 'dp', palavras: ['folha', 'holerite', 'férias', 'admissão', 'rescisão', 'eSocial', 'FGTS', 'empregado', 'funcionário', 'ponto'] },
  { id: 'contabil', palavras: ['balancete', 'DRE', 'conciliação', 'extrato', 'lançamento', 'fechamento', 'contábil', 'balanço'] },
  { id: 'notas', palavras: ['nota fiscal', 'NF-e', 'NFS-e', 'XML', 'manifestação', 'nota'] },
  { id: 'societario', palavras: ['contrato social', 'alteração', 'procuração', 'certificado', 'abertura', 'baixa', 'societário'] },
  { id: 'consultor', palavras: ['parecer', 'planejamento', 'reforma', 'consulta', 'tributário'] },
  { id: 'gestao_atendimento', palavras: ['atendimento', 'reunião', 'pauta', 'proposta'] },
]

export function contextoSuposicoes(clientes: { id: string; nome: string; documento?: string }[], competenciaPadrao?: string, hoje?: string): ContextoSuposicoes {
  return {
    clientes: clientes.map((c) => ({ id: c.id, nome: c.nome, cnpj: c.documento })),
    setores: palavrasDosSetores.map((s) => ({ id: s.id, rotulo: rotuloSetorCurto[s.id], palavras: s.palavras })),
    competenciaPadrao,
    hoje,
  }
}

/** O seletor de cada campo suposto. */
export function configDoCampo(campo: CampoSuposicao, clientes: { id: string; nome: string; documento?: string }[]): { config: ConfigValor; rotulo: string } {
  switch (campo) {
    case 'cliente':
      return { rotulo: 'Cliente', config: { tipo: 'entidade', buscar: 'Buscar cliente ou CNPJ', opcoes: clientes.map((c) => ({ valor: c.id, rotulo: c.nome, detalhe: c.documento })), outra: false } }
    case 'competencia':
      return { rotulo: 'Competência', config: { tipo: 'competencia' } }
    case 'setor':
      return { rotulo: 'Setor', config: { tipo: 'escolha', opcoes: palavrasDosSetores.map((s) => ({ valor: s.id, rotulo: rotuloSetorCurto[s.id] })), outra: false } }
    case 'valor':
      return { rotulo: 'Valor', config: { tipo: 'dinheiro', min: 0 } }
    case 'prazo':
      return { rotulo: 'Prazo', config: { tipo: 'data' } }
  }
}

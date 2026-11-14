import { escolher, ficticio, simular } from './simular'
import type { Resultado } from './tipos'

/**
 * Cadastros (S02): consulta de CNPJ (API-12: SERPRO, dados abertos, BrasilAPI),
 * procurações eletrônicas (API-06, Integra-Procurações) e Domicílio Judicial
 * Eletrônico (SOC-007). Na demonstração os dados são fictícios e marcados.
 */

export interface DadosCnpj {
  cnpj: string
  razao_social: string
  nome_fantasia: string
  situacao: 'ATIVA' | 'INAPTA' | 'SUSPENSA' | 'BAIXADA'
  abertura: string
  natureza: string
  cnae_principal: { codigo: string; descricao: string }
  cnaes_secundarios: { codigo: string; descricao: string }[]
  endereco: { logradouro: string; numero: string; bairro: string; municipio: string; uf: string; cep: string }
  qsa: { nome: string; qualificacao: string; participacao?: string }[]
  simples: boolean
}

export interface Procuracao {
  servico: string
  validade: string
  situacao: 'ativa' | 'pendente' | 'vencida'
}

export interface ComunicacaoJudicial {
  id: string
  tipo: 'citação' | 'intimação' | 'comunicação'
  tribunal: string
  processo: string
  disponivel_em: string
  prazo_ciencia: string
}

export interface ServicoCadastros {
  consultarCnpj(cnpj: string): Promise<Resultado<DadosCnpj>>
  procuracoes(cnpj: string): Promise<Resultado<Procuracao[]>>
  /** Lista sem dar ciência (só metadados); abrir o teor conta como ciência. */
  domicilioJudicial(cnpj: string): Promise<Resultado<ComunicacaoJudicial[]>>
}

const nomes = ['Oficina Horizonte Ltda', 'Laticínios Vale Claro Ltda', 'Estúdio Pixel Norte Ltda', 'Construtora Pedra Azul Ltda', 'Farmácia Bom Jardim Ltda', 'Restaurante Sabor da Serra ME']
const cnaes = [
  { codigo: '4520-0/01', descricao: 'Serviços de manutenção e reparação mecânica de veículos' },
  { codigo: '1052-0/00', descricao: 'Fabricação de laticínios' },
  { codigo: '7410-2/02', descricao: 'Design de interiores' },
  { codigo: '4120-4/00', descricao: 'Construção de edifícios' },
  { codigo: '4771-7/01', descricao: 'Comércio varejista de produtos farmacêuticos' },
  { codigo: '5611-2/01', descricao: 'Restaurantes e similares' },
]

export const soDigitos = (s: string) => s.replace(/\D/g, '')

/** Confere os dígitos verificadores do CNPJ (o formulário avisa antes de consultar). */
export function cnpjValido(cnpj: string) {
  const d = soDigitos(cnpj)
  if (d.length !== 14 || /^(\d)\1+$/.test(d)) return false
  const calc = (n: number) => {
    const pesos = n === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    const soma = pesos.reduce((s, p, i) => s + p * Number(d[i]), 0)
    const r = soma % 11
    return r < 2 ? 0 : 11 - r
  }
  return calc(12) === Number(d[12]) && calc(13) === Number(d[13])
}

export const formatarCnpj = (s: string) => soDigitos(s).replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, '$1.$2.$3/$4-$5')

export const cadastrosDemonstracao: ServicoCadastros = {
  consultarCnpj(cnpj) {
    return simular(
      'Consulta CNPJ (SERPRO / dados abertos)',
      () => {
        const i = nomes.indexOf(escolher(cnpj, nomes))
        return {
          cnpj: formatarCnpj(cnpj),
          razao_social: nomes[i],
          nome_fantasia: nomes[i].replace(/ (Ltda|ME)$/, ''),
          situacao: 'ATIVA',
          abertura: '2019-04-12',
          natureza: '206-2 · Sociedade Empresária Limitada',
          cnae_principal: cnaes[i],
          cnaes_secundarios: [cnaes[(i + 1) % cnaes.length]],
          endereco: { logradouro: 'Rua das Acácias', numero: String(100 + i * 37), bairro: 'Centro', municipio: 'São Paulo', uf: 'SP', cep: '01010-000' },
          qsa: [
            { nome: 'Sócio Exemplo Um', qualificacao: 'Sócio-Administrador', participacao: '70%' },
            { nome: 'Sócia Exemplo Dois', qualificacao: 'Sócia', participacao: '30%' },
          ],
          simples: i % 2 === 0,
        }
      },
      { latencia: [900, 1600] },
    )
  },
  procuracoes(cnpj) {
    return simular('Integra Contador · Procurações', () => [
      { servico: 'e-CAC (todos os serviços)', validade: '12/2027', situacao: 'ativa' as const },
      { servico: 'DTE-SN', validade: escolher(cnpj, ['12/2027', '—']), situacao: escolher(cnpj, ['ativa', 'pendente']) as Procuracao['situacao'] },
    ])
  },
  domicilioJudicial(cnpj) {
    return simular('Domicílio Judicial Eletrônico', () => [
      { id: ficticio.id('dje'), tipo: 'comunicação' as const, tribunal: 'TRT da 2ª Região', processo: `00${soDigitos(cnpj).slice(0, 5)}-11.2026.5.02.0001`, disponivel_em: '2026-11-12', prazo_ciencia: '2026-11-22' },
    ])
  },
}

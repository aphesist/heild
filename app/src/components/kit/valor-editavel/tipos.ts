import type { Icon } from '@phosphor-icons/react'
import type { ReactNode } from 'react'

/**
 * Tipos do ValorEditavel (fase 6, PADRAO_DE_INTERFACE.md): o valor aparece no
 * lugar, com sublinhado pontilhado, e abre o seletor certo para o tipo de dado.
 * Cada tipo tem o seu valor e o seu seletor; o registro fica em `seletores.tsx`.
 */
export interface Opcao {
  valor: string
  rotulo: string
  icone?: Icon
  /** Segunda linha (CNPJ do cliente, setor da pessoa). */
  detalhe?: string
  /** Só no tipo cor: o hexadecimal da amostra. */
  cor?: string
}

/** Estado das opções que vêm de fora (busca no banco, serviço). */
export interface EstadoOpcoes {
  carregando?: boolean
  erro?: string | null
  onTentar?: () => void
}

export type ConfigValor =
  | ({ tipo: 'escolha'; opcoes: Opcao[]; outra?: boolean } & EstadoOpcoes)
  | ({ tipo: 'multipla'; opcoes: Opcao[]; outra?: boolean } & EstadoOpcoes)
  | { tipo: 'intervalo'; min: number; max: number; passo?: number; unidade?: string }
  | { tipo: 'numero'; min?: number; max?: number; passo?: number; unidade?: string; limpar?: string }
  | { tipo: 'dinheiro'; min?: number; max?: number; limpar?: string }
  | { tipo: 'data' }
  | { tipo: 'competencia' }
  | ({ tipo: 'entidade'; opcoes: Opcao[]; buscar?: string; outra?: boolean } & EstadoOpcoes)
  | { tipo: 'cor'; opcoes: Opcao[] }
  | { tipo: 'texto'; multilinha?: boolean; validar?: (v: string) => string | null; placeholder?: string }
  | { tipo: 'plano'; eixoX: [string, string]; eixoY: [string, string]; previa?: (p: PontoPlano) => ReactNode }

/** Ponto no plano de dois eixos, de 0 a 1 (x: esquerda → direita; y: baixo → cima). */
export interface PontoPlano {
  x: number
  y: number
}

/** O valor de cada tipo. */
export type ValorDe<C extends ConfigValor> = C extends { tipo: 'multipla' }
  ? string[]
  : C extends { tipo: 'intervalo' }
    ? [number, number]
    : C extends { tipo: 'numero' | 'dinheiro' }
      ? number
      : C extends { tipo: 'plano' }
        ? PontoPlano
        : string

export type QualquerValor = string | string[] | number | [number, number] | PontoPlano

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const ddmmaaaa = (iso: string) => (/^\d{4}-\d{2}-\d{2}/.test(iso) ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}` : iso)

/** O texto que o valor mostra no lugar (e que o leitor de tela lê). */
export function textoDoValor(config: ConfigValor, valor: QualquerValor | null | undefined): string {
  if (valor === null || valor === undefined || valor === '' || (Array.isArray(valor) && valor.length === 0)) return ''
  const rotuloDe = (v: string) => ('opcoes' in config ? (config.opcoes.find((o) => o.valor === v)?.rotulo ?? v) : v)
  switch (config.tipo) {
    case 'escolha':
    case 'entidade':
    case 'cor':
      return rotuloDe(valor as string)
    case 'multipla':
      return (valor as string[]).map(rotuloDe).join(', ')
    case 'intervalo': {
      const [a, b] = valor as [number, number]
      return `${a}–${b}${config.unidade ? ` ${config.unidade}` : ''}`
    }
    case 'numero':
      return `${(valor as number).toLocaleString('pt-BR')}${config.unidade ? ` ${config.unidade}` : ''}`
    case 'dinheiro':
      return brl(valor as number)
    case 'data':
      return ddmmaaaa(valor as string)
    case 'plano': {
      const p = valor as PontoPlano
      const lado = (v: number, [baixo, alto]: [string, string]) => (v < 0.4 ? baixo : v > 0.6 ? alto : `entre ${baixo} e ${alto}`)
      return `${lado(p.x, config.eixoX)}, ${lado(p.y, config.eixoY)}`
    }
    default:
      return String(valor)
  }
}

import type { Destino, IdModulo } from '@/ambiente/loja'
import type { Papel } from '@/nucleo/modelo/entidades'
import type { SetorIntegrante } from '@/theme/tipos'
import type { Cliente } from './tipos'
import { buscarS01 } from './busca-s01'

/**
 * Busca global (S01-T09; contrato C7, dono S01).
 *
 * Cada módulo expõe uma função `buscar(termo, escopo)` em arquivo próprio
 * (`src/dados/busca-sNN.ts`) e acrescenta UMA linha em `fontesBusca`, no fim
 * da lista. A S01 junta tudo, ordena por relevância, agrupa por tipo e leva à
 * aba certa no cliente certo.
 *
 * Regras que toda fonte cumpre (03, 2.2 e 2.3; 04, 10.1; 00, 15):
 * - só devolve o que está no escopo (`escopo.setores`, `escopo.clientes`,
 *   `escopo.modulos`): o que a pessoa não pode ver não aparece nem aqui;
 * - módulo fora da assinatura ou do vínculo não devolve o tipo;
 * - compara pelo termo já normalizado (`termo.normalizado`, sem acento e em
 *   minúsculas), pelos dígitos (`termo.digitos`: CNPJ e CPF com ou sem
 *   pontuação) e pelos sinônimos (`termo.variantes`: "legal" e "legalização"
 *   acham Societário). Use `casa(termo, ...campos)`.
 */

export type TipoResultado =
  | 'cliente'
  | 'pessoa'
  | 'tarefa'
  | 'documento'
  | 'conversa'
  | 'obrigacao'
  | 'mensagem_interna'
  | 'integrante'
  | 'tela'
  | 'lead'
  | 'fatura'
  | 'contrato'
  | 'processo'
  | 'outro'

export interface TermoBusca {
  /** O que a pessoa digitou. */
  bruto: string
  /** Sem acento, minúsculo, espaços simples. */
  normalizado: string
  /** Só os dígitos (CNPJ, CPF, código no core); vazio se não houver. */
  digitos: string
  /** O termo e os sinônimos (já normalizados). */
  variantes: string[]
}

export interface EscopoBusca {
  usuarioId: string
  papel: Papel
  /** Setores que a pessoa vê (todos, para o Administrador). */
  setores: SetorIntegrante[]
  /** Módulos visíveis (assinatura e vínculo). Fonte de módulo ausente não devolve nada. */
  modulos: IdModulo[]
  /** Clientes no escopo da pessoa (carteira, quando ligada). */
  clientes: Cliente[]
  /** Cliente selecionado agora (null = carteira): só desempata a ordem. */
  clienteAtual: string | null
}

export interface ResultadoBusca {
  /** Único dentro do tipo. */
  id: string
  tipo: TipoResultado
  titulo: string
  /** Linha de baixo: cliente, setor, data. */
  detalhe?: string
  /** Trecho onde o termo apareceu (mensagem, transcrição de áudio). */
  trecho?: string
  /** Para onde ir ao escolher. Com `cliente`, a busca troca o cliente com aviso de uma linha (03, 3.2). */
  destino: Destino
  /** Cliente do resultado (para o aviso de troca). */
  clienteId?: string | null
  setor?: SetorIntegrante
  /** 0 a 100; padrão 50. Começar pelo termo vale mais que conter. */
  relevancia?: number
}

export type FuncaoBusca = (termo: TermoBusca, escopo: EscopoBusca) => ResultadoBusca[]

export interface FonteBusca {
  /** Sessão dona (S01, S05...). */
  sessao: string
  /** Módulo que precisa estar visível (sem ele a fonte não é chamada). */
  modulo?: IdModulo
  buscar: FuncaoBusca
}

/* ---------- Normalização e sinônimos ---------- */

export const normalizar = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()

/** Grupos de sinônimos (00, 15: o setor se chama Societário; "Legal" e "Legalização" acham o mesmo). */
export const sinonimos: string[][] = [
  ['societario', 'legal', 'legalizacao', 'paralegal'],
  ['dp', 'departamento pessoal', 'trabalhista', 'folha', 'pessoal'],
  ['fiscal', 'tributos', 'impostos'],
  ['contabil', 'contabilidade'],
  ['gestao', 'atendimento', 'recepcao'],
  ['consultoria', 'consultor', 'reforma'],
  ['notas', 'nota fiscal', 'nf-e', 'nfs-e', 'nfe', 'nfse'],
  ['cnd', 'certidao', 'certidoes'],
]

export function prepararTermo(bruto: string): TermoBusca {
  const normalizado = normalizar(bruto)
  const digitos = bruto.replace(/\D/g, '')
  const variantes = new Set([normalizado])
  for (const grupo of sinonimos) if (grupo.some((g) => g === normalizado || (normalizado.length >= 4 && g.startsWith(normalizado)))) grupo.forEach((g) => variantes.add(g))
  return { bruto, normalizado, digitos: digitos.length >= 3 ? digitos : '', variantes: [...variantes] }
}

/**
 * Relevância do termo nos campos (0 = não casa). Começar pelo termo vale 90,
 * palavra que começa pelo termo 75, conter 55; dígitos casam CNPJ/CPF e códigos.
 */
export function casa(termo: TermoBusca, ...campos: (string | undefined | null)[]): number {
  let melhor = 0
  for (const campo of campos) {
    if (!campo) continue
    const c = normalizar(campo)
    for (const v of termo.variantes) {
      if (!v) continue
      if (c === v) melhor = Math.max(melhor, 100)
      else if (c.startsWith(v)) melhor = Math.max(melhor, 90)
      else if (c.includes(` ${v}`)) melhor = Math.max(melhor, 75)
      else if (v.length >= 3 && c.includes(v)) melhor = Math.max(melhor, 55)
    }
    if (termo.digitos) {
      const d = campo.replace(/\D/g, '')
      if (d && d === termo.digitos) melhor = Math.max(melhor, 100)
      else if (d && d.includes(termo.digitos)) melhor = Math.max(melhor, 70)
    }
  }
  return melhor
}

/** Trecho de até ~90 caracteres em volta do termo. */
export function trechoDe(texto: string, termo: TermoBusca): string {
  const n = normalizar(texto)
  const i = termo.variantes.map((v) => n.indexOf(v)).find((x) => x >= 0) ?? -1
  if (i < 0) return texto.length > 90 ? `${texto.slice(0, 88)}…` : texto
  const de = Math.max(0, i - 30)
  return `${de > 0 ? '…' : ''}${texto.slice(de, de + 90)}${de + 90 < texto.length ? '…' : ''}`
}

/* ---------- As fontes (cada sessão acrescenta UMA linha no fim) ---------- */


export const fontesBusca: FonteBusca[] = [
  { sessao: 'S01', buscar: buscarS01 },
  // Acrescente aqui: { sessao: 'S05', modulo: 'crm', buscar: buscarS05 },
]

/** Rótulo de cada grupo na lista de resultados, na ordem em que aparecem. */
export const gruposBusca: { tipo: TipoResultado; rotulo: string }[] = [
  { tipo: 'cliente', rotulo: 'Clientes' },
  { tipo: 'tarefa', rotulo: 'Tarefas' },
  { tipo: 'obrigacao', rotulo: 'Obrigações' },
  { tipo: 'documento', rotulo: 'Documentos' },
  { tipo: 'conversa', rotulo: 'Conversas' },
  { tipo: 'mensagem_interna', rotulo: 'Mensagens internas' },
  { tipo: 'pessoa', rotulo: 'Pessoas' },
  { tipo: 'lead', rotulo: 'Leads' },
  { tipo: 'fatura', rotulo: 'Faturas' },
  { tipo: 'contrato', rotulo: 'Contratos' },
  { tipo: 'processo', rotulo: 'Processos' },
  { tipo: 'integrante', rotulo: 'Integrantes' },
  { tipo: 'tela', rotulo: 'Telas' },
  { tipo: 'outro', rotulo: 'Outros' },
]

/**
 * Junta as fontes. Fonte que falha não derruba a busca (fica de fora e avisa
 * no console). Resultados de cliente fora do escopo são cortados aqui também,
 * como segunda trava.
 */
export function buscarTudo(bruto: string, escopo: EscopoBusca, limitePorTipo = 6): { tipo: TipoResultado; rotulo: string; itens: ResultadoBusca[] }[] {
  if (normalizar(bruto).length < 2 && bruto.replace(/\D/g, '').length < 3) return []
  const termo = prepararTermo(bruto)
  const noEscopo = new Set(escopo.clientes.map((c) => c.id))
  const todos: ResultadoBusca[] = []
  for (const f of fontesBusca) {
    if (f.modulo && !escopo.modulos.includes(f.modulo)) continue
    try {
      for (const r of f.buscar(termo, escopo)) if (!r.clienteId || noEscopo.has(r.clienteId)) todos.push(r)
    } catch (e) {
      console.warn(`[heild] busca da ${f.sessao} falhou`, e)
    }
  }
  const peso = (r: ResultadoBusca) => (r.relevancia ?? 50) + (escopo.clienteAtual && r.clienteId === escopo.clienteAtual ? 8 : 0)
  return gruposBusca
    .map((g) => ({ ...g, itens: todos.filter((r) => r.tipo === g.tipo).sort((a, b) => peso(b) - peso(a)).slice(0, limitePorTipo) }))
    .filter((g) => g.itens.length > 0)
}

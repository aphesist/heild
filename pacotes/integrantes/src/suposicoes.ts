import type { Tx } from '@heild/processos'
import type { Lacuna, Suposicao, TipoDado } from './resposta.ts'

/**
 * Feedforward e lacunas (padrão da interface adotado pelo Enzo, 15/11/2026), montados pelo SISTEMA a
 * partir do estado da execução: o que foi lido (as candidatas que o código extraiu do documento) e o
 * que o operário escolheu, com a origem e a confiança. Nenhum modelo escreve aqui.
 */

const TIPO_DO_CAMPO: Record<string, TipoDado> = {
  cliente_id: 'cliente',
  competencia: 'competencia',
  valor: 'valor',
  valor_centavos: 'valor',
  setor: 'setor',
  procedimento: 'procedimento',
  canal: 'canal',
  documento_id: 'documento',
  prazo: 'data',
  quantidade: 'quantidade',
  tipo_evento: 'categoria',
  tipo_alteracao: 'categoria',
  categoria: 'categoria',
  tributo: 'categoria',
  faq_id: 'categoria',
}

const ROTULO_DO_CAMPO: Record<string, string> = {
  cliente_id: 'Cliente',
  competencia: 'Competência',
  setor: 'Setor',
  procedimento: 'Procedimento',
  documento_id: 'Documento',
  prazo: 'Prazo',
  quantidade: 'Quantidade',
  tipo_evento: 'Tipo de evento',
  tipo_alteracao: 'Tipo de alteração',
  categoria: 'Categoria',
  tributo: 'Tributo',
  faq_id: 'Pergunta frequente',
}

export const tipoDoCampo = (campo: string): TipoDado => TIPO_DO_CAMPO[campo] ?? 'texto'
export const rotuloDoCampo = (campo: string) => ROTULO_DO_CAMPO[campo] ?? campo.replace(/_/g, ' ')

type ValorSimples = string | number | boolean | null
const simples = (v: unknown): ValorSimples => (v === null || v === undefined ? null : typeof v === 'number' || typeof v === 'boolean' ? v : String(v).slice(0, 300))
const rotuloDe = (campo: string, v: ValorSimples) => (v === null ? 'nenhum' : campo === 'competencia' && typeof v === 'string' && /^\d{4}-\d{2}$/.test(v) ? `${v.slice(5)}/${v.slice(0, 4)}` : String(v)).slice(0, 120)
export const opcoesDe = (campo: string, valores: unknown[]) => [...new Set(valores.map(simples))].slice(0, 12).map((v) => ({ valor: v, rotulo: rotuloDe(campo, v) }))

interface Passo {
  nome: string
  tipo: string
  saida: Record<string, unknown> | null
}

export interface LidoDaExecucao {
  /** Candidatas por campo (procedimentos de escolha: o passo `ler_documento`). */
  candidatas: Record<string, unknown[]>
  /** Decisão por regra, quando houve. */
  regra: Record<string, unknown> | null
  /** A última saída do operário (a proposta), com origem e confiança. */
  operario: (Record<string, unknown> & { pulado?: boolean; origem?: string; confianca?: number }) | null
  entrada: Record<string, unknown>
}

export async function lerDaExecucao(tx: Tx, execucao_id: string): Promise<LidoDaExecucao> {
  const [ex] = await tx`select entrada from execucao where id = ${execucao_id}`
  const passos = (await tx`
    select distinct on (ordem) nome, tipo, saida from passo_execucao
    where execucao_id = ${execucao_id} and estado = 'concluido' order by ordem, tentativa desc`) as unknown as Passo[]
  const ler = passos.find((p) => p.nome === 'ler_documento')?.saida as { candidatas?: Record<string, unknown[]>; regra?: Record<string, unknown> | null } | undefined
  const op = passos.filter((p) => p.tipo === 'operario' && p.nome !== 'revisar').at(-1)?.saida ?? null
  return { candidatas: ler?.candidatas ?? {}, regra: ler?.regra ?? null, operario: op as LidoDaExecucao['operario'], entrada: (ex?.entrada ?? {}) as Record<string, unknown> }
}

/**
 * O que o integrante supôs: os campos da escolha (valor decidido ou proposto, alternativas lidas do
 * documento, origem e confiança) e o que veio do pedido (cliente, documento).
 */
export async function suposicoesDaExecucao(tx: Tx, l: LidoDaExecucao, decisao: Record<string, unknown> | null): Promise<Suposicao[]> {
  const out: Suposicao[] = []
  if (typeof l.entrada.cliente_id === 'string') {
    const [c] = await tx`select nome from cliente where id = ${l.entrada.cliente_id}`
    out.push({ campo: 'cliente_id', rotulo: 'Cliente', valor: l.entrada.cliente_id, tipo: 'cliente', opcoes: c ? [{ valor: l.entrada.cliente_id, rotulo: String(c.nome).slice(0, 120) }] : [], origem: 'pedido', confianca: null })
  }
  if (typeof l.entrada.documento_id === 'string') out.push({ campo: 'documento_id', rotulo: 'Documento', valor: l.entrada.documento_id, tipo: 'documento', opcoes: [], origem: 'pedido', confianca: null })
  const op = l.operario
  const origem: Suposicao['origem'] = !op || op.pulado ? 'regra' : op.origem === 'pessoa' ? 'pessoa' : 'modelo'
  const confianca = origem === 'modelo' && typeof op?.confianca === 'number' ? op.confianca : null
  for (const [campo, candidatas] of Object.entries(l.candidatas)) {
    const valor = simples(decisao?.[campo] ?? (origem === 'regra' ? l.regra?.[campo] : op?.[campo]))
    out.push({ campo, rotulo: rotuloDoCampo(campo), valor, tipo: tipoDoCampo(campo), opcoes: opcoesDe(campo, candidatas), origem, confianca })
  }
  return out.slice(0, 20)
}

/**
 * As lacunas de um cartão "não consegui": os campos que os validadores apontaram (com `campo`); se
 * nenhum apontou (ex.: confiança baixa), os campos da escolha. Opções: as candidatas lidas.
 */
export function lacunasDoCartao(falhas: { campo?: string | null; codigo?: string }[], l: LidoDaExecucao): Lacuna[] {
  const apontados = [...new Set(falhas.map((f) => f.campo).filter((c): c is string => Boolean(c)))]
  const campos = apontados.length ? apontados : Object.keys(l.candidatas)
  return campos.slice(0, 10).map((campo) => ({ id: campo, campo, rotulo: rotuloDoCampo(campo), tipo: tipoDoCampo(campo), posicao: null, opcoes: opcoesDe(campo, l.candidatas[campo] ?? []) }))
}

import { z } from 'zod'
import type { Tx } from '../banco.ts'

/**
 * Validadores como serviço (AGENTICO 4.4): o mesmo código roda no passo `validar`, no portão, nos
 * testes de caso e na ferramenta `validador.executar`. Custo zero de modelo.
 * Moram aqui até a B1 abrir `pacotes/dominio/validadores`; o registro é o mesmo formato.
 */
export type ResultadoValidador =
  | { ok: true }
  | {
      ok: false
      codigo: string
      mensagem: string
      campo?: string
      /** Pode ser corrigido por um modelo melhor (escalar)? Falha de regra dura não escala: vira erro ou cartão. */
      escalavel?: boolean
    }

export interface Validador<D extends z.ZodType = z.ZodType> {
  nome: string
  versao: number
  descricao: string
  dados: D
  conferir: (dados: z.infer<D>, f: { tx: Tx | null; parametro: string | undefined }) => ResultadoValidador | Promise<ResultadoValidador>
}

const registro = new Map<string, Validador>()

export function definirValidador<D extends z.ZodType>(v: Validador<D>): Validador<D> {
  if (registro.has(v.nome)) throw new Error(`Validador repetido: ${v.nome}`)
  registro.set(v.nome, v as unknown as Validador)
  return v
}

/** Aceita `nome` ou `nome:parametro` (ex.: `confianca_minima:0.9`). */
export function validador(nomeComParametro: string): Validador | undefined {
  return registro.get(nomeComParametro.split(':')[0]!)
}

export const listarValidadores = () => [...registro.values()].sort((a, b) => a.nome.localeCompare(b.nome))

export interface ResultadoNomeado {
  validador: string
  versao: number
  ok: boolean
  codigo?: string
  mensagem?: string
  campo?: string
  escalavel?: boolean
}

/** Roda uma lista de validadores sobre os mesmos dados; nunca para no primeiro (a pessoa vê todos). */
export async function rodarValidadores(nomes: string[], dados: unknown, tx: Tx | null): Promise<ResultadoNomeado[]> {
  const saida: ResultadoNomeado[] = []
  for (const n of nomes) {
    const v = validador(n)
    if (!v) throw new Error(`Validador não registrado: ${n}`)
    const parsed = v.dados.safeParse(dados)
    if (!parsed.success) {
      saida.push({ validador: n, versao: v.versao, ok: false, codigo: 'DADOS_DO_VALIDADOR', mensagem: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '), escalavel: false })
      continue
    }
    const r = await v.conferir(parsed.data, { tx, parametro: n.split(':')[1] })
    saida.push(r.ok ? { validador: n, versao: v.versao, ok: true } : { validador: n, versao: v.versao, ok: false, codigo: r.codigo, mensagem: r.mensagem, campo: r.campo, escalavel: r.escalavel ?? false })
  }
  return saida
}

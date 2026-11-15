import { z } from 'zod'

export type Classe = 'operario' | 'escritor' | 'revisor'

/**
 * Contrato de um passo de modelo (AGENTICO 4.1 e 4.3). O backend garante a execução: entrada fechada
 * (`recebe`), saída em esquema estrito (`devolve`), orçamento e registro. O CONTEÚDO (instrução,
 * modelo de cada classe, política de revisão) é da frente de IA: a instrução aqui é provisória e
 * versionada junto com o contrato.
 */
export interface Contrato<R extends z.ZodObject = z.ZodObject, D extends z.ZodObject = z.ZodObject> {
  id: string
  versao: number
  classe: Classe
  instrucao: string
  recebe: R
  devolve: D
  /** Teto de tokens de saída: entra na estimativa de custo conferida antes da chamada. */
  max_tokens_saida: number
  /** Campos de `recebe` que vêm de fora (documento, mensagem): vão envelopados como dado (R5). */
  campos_externos?: (keyof z.infer<R> & string)[]
}

export function definirContrato<R extends z.ZodObject, D extends z.ZodObject>(c: Contrato<R, D>): Contrato<R, D> {
  for (const [nome, o] of [['recebe', c.recebe], ['devolve', c.devolve]] as const) {
    const js = z.toJSONSchema(o) as { additionalProperties?: unknown }
    if (js.additionalProperties !== false) throw new Error(`Contrato ${c.id}: '${nome}' precisa ser estrito`)
  }
  return c
}

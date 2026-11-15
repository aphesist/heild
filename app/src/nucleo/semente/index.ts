import { escritorioAndrade } from './andrade'
import type { EscritorioDeExemplo } from './comum'
import { escritorioHorizonte } from './horizonte'
import { fotografiaDoCenario, lerCenario, nomeCenario, PREFIXO_CENARIO } from './cenario'

export type { EscritorioDeExemplo } from './comum'
export { ID_ANDRADE } from './andrade'
export { ID_HORIZONTE } from './horizonte'

/** Os escritórios de exemplo que o painel da demonstração deixa trocar. Para criar outro: um arquivo como horizonte.ts e uma linha aqui. */
export const escritoriosDeExemplo: EscritorioDeExemplo[] = [escritorioAndrade, escritorioHorizonte]

/**
 * O escritório de exemplo pelo id. `esc-cenario:<nome>` é o escritório completo
 * transformado por um cenário do UI Lab (semente/cenario.ts): só existe em memória.
 */
export function escritorioDeExemplo(id: string): EscritorioDeExemplo {
  if (id.startsWith(PREFIXO_CENARIO)) {
    const c = lerCenario(id.slice(PREFIXO_CENARIO.length)) ?? {}
    return { ...escritorioAndrade, id, nome: `${escritorioAndrade.nome} · cenário ${nomeCenario(c)}`, semente: () => fotografiaDoCenario(escritorioAndrade.semente(), c, id) }
  }
  return escritoriosDeExemplo.find((e) => e.id === id) ?? escritoriosDeExemplo[0]
}

const CHAVE_ATIVO = 'heild:escritorio-ativo'

/** Escritório aberto da última vez (fica no navegador). */
export function escritorioAtivoGuardado(): string {
  try {
    return window.localStorage.getItem(CHAVE_ATIVO) ?? escritoriosDeExemplo[0].id
  } catch {
    return escritoriosDeExemplo[0].id
  }
}

export function guardarEscritorioAtivo(id: string) {
  try {
    window.localStorage.setItem(CHAVE_ATIVO, id)
  } catch {
    /* sem armazenamento: vale só nesta aba */
  }
}

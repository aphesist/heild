import { escritorioAndrade } from './andrade'
import type { EscritorioDeExemplo } from './comum'
import { escritorioHorizonte } from './horizonte'

export type { EscritorioDeExemplo } from './comum'
export { ID_ANDRADE } from './andrade'
export { ID_HORIZONTE } from './horizonte'

/** Os escritórios de exemplo que o painel da demonstração deixa trocar. Para criar outro: um arquivo como horizonte.ts e uma linha aqui. */
export const escritoriosDeExemplo: EscritorioDeExemplo[] = [escritorioAndrade, escritorioHorizonte]

export const escritorioDeExemplo = (id: string) => escritoriosDeExemplo.find((e) => e.id === id) ?? escritoriosDeExemplo[0]

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

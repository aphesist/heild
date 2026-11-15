import { sha256 } from '@noble/hashes/sha2.js'
import { bytesToHex, utf8ToBytes } from '@noble/hashes/utils.js'

/**
 * Forma canônica de um valor: JSON com as chaves em ordem, sem espaços e sem campos
 * `undefined`. É a base do hash da cadeia de eventos e do hash dos argumentos da
 * idempotência; roda igual no navegador e no servidor (STACK 8: "a função de
 * canonização mora no pacote de domínio, para a verificação rodar igual em qualquer lugar").
 */
export function canonizar(valor: unknown): string {
  if (valor === null || valor === undefined) return 'null'
  if (typeof valor === 'number') {
    if (!Number.isFinite(valor)) throw new Error('Número não finito não tem forma canônica.')
    return JSON.stringify(valor)
  }
  if (typeof valor === 'string' || typeof valor === 'boolean') return JSON.stringify(valor)
  if (typeof valor === 'bigint') return JSON.stringify(valor.toString())
  if (valor instanceof Date) return JSON.stringify(valor.toISOString())
  if (valor instanceof Uint8Array) return JSON.stringify(bytesToHex(valor))
  if (Array.isArray(valor)) return `[${valor.map((v) => (v === undefined ? 'null' : canonizar(v))).join(',')}]`
  if (typeof valor === 'object') {
    const partes = Object.keys(valor as object)
      .filter((k) => (valor as Record<string, unknown>)[k] !== undefined)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${canonizar((valor as Record<string, unknown>)[k])}`)
    return `{${partes.join(',')}}`
  }
  throw new Error(`Tipo sem forma canônica: ${typeof valor}`)
}

export const sha256Bytes = (dados: Uint8Array | string): Uint8Array => sha256(typeof dados === 'string' ? utf8ToBytes(dados) : dados)
export const sha256Hex = (dados: Uint8Array | string): string => bytesToHex(sha256Bytes(dados))
export { bytesToHex, hexToBytes } from '@noble/hashes/utils.js'

import { bytesToHex, canonizar, hexToBytes, sha256Bytes } from './canonico'

/**
 * Cadeia de hash dos eventos, por escritório (Fundações 5.2; STACK 8).
 *
 *   hash(n) = SHA-256( hash(n-1) ‖ "heild-evento-v1\n" ‖ canônico(evento n) )
 *   hash(0) = SHA-256( "heild-cadeia-v1:" ‖ escritorio_id )   (gênese: prende a cadeia ao escritório)
 *
 * O canônico cobre os campos que contam a história (quem, o quê, quando, com que
 * resultado) e deixa de fora o que o banco mexe sozinho (`atualizado_em`, `versao_linha`).
 * Mudar qualquer campo coberto, apagar, reordenar ou inserir um evento quebra a
 * verificação a partir dali.
 */

export const VERSAO_CADEIA = 'heild-evento-v1'

/** Os campos do evento que entram no hash, em ordem fixa (a ordem real vem do canonizar). */
export const CAMPOS_CADEIA = [
  'id', 'escritorio_id', 'seq', 'criado_em', 'nome', 'ator_tipo', 'ator_id', 'ator_nome', 'usuario_dono_id',
  'cliente_id', 'setor_id', 'ferramenta', 'ferramenta_versao', 'nivel', 'argumentos_resumo', 'resultado',
  'resultado_ref', 'origem', 'visivel_na_linha_do_tempo', 'texto', 'extras', 'sessao_auth_id', 'aprovacao_id',
  'causado_por_evento_id', 'idempotencia_chave',
] as const

export type EventoDaCadeia = { [K in (typeof CAMPOS_CADEIA)[number]]?: unknown } & { id: string; escritorio_id: string; seq: number; criado_em: string }

export function canonicoDoEvento(e: EventoDaCadeia): string {
  const recorte: Record<string, unknown> = {}
  for (const c of CAMPOS_CADEIA) recorte[c] = e[c] ?? null
  return canonizar(recorte)
}

export const geneseDaCadeia = (escritorioId: string): Uint8Array => sha256Bytes(`heild-cadeia-v1:${escritorioId}`)

export function hashDoEvento(anterior: Uint8Array, e: EventoDaCadeia): Uint8Array {
  const corpo = new TextEncoder().encode(`${VERSAO_CADEIA}\n${canonicoDoEvento(e)}`)
  const junto = new Uint8Array(anterior.length + corpo.length)
  junto.set(anterior, 0)
  junto.set(corpo, anterior.length)
  return sha256Bytes(junto)
}

export interface ResultadoVerificacao {
  ok: boolean
  eventos: number
  ultimo_seq: number
  ultimo_hash: string | null
  /** Primeiro ponto em que a cadeia não confere. */
  quebra?: { seq: number; evento_id: string | null; motivo: 'seq_fora_de_ordem' | 'hash_anterior_nao_confere' | 'hash_nao_confere' | 'elo_nao_confere' }
}

/**
 * Confere uma cadeia inteira (eventos em ordem de `seq`, com `hash_anterior` e `hash`
 * em hexadecimal) e, se vier, o elo guardado no fim (`cadeia_evento`).
 */
export function verificarCadeia(
  escritorioId: string,
  eventos: (EventoDaCadeia & { hash_anterior: string; hash: string })[],
  elo?: { seq: number; hash: string } | null,
): ResultadoVerificacao {
  let anterior = geneseDaCadeia(escritorioId)
  let esperado = 1
  for (const e of eventos) {
    if (e.seq !== esperado) return { ok: false, eventos: eventos.length, ultimo_seq: esperado - 1, ultimo_hash: bytesToHex(anterior), quebra: { seq: e.seq, evento_id: e.id, motivo: 'seq_fora_de_ordem' } }
    if (e.hash_anterior !== bytesToHex(anterior)) return { ok: false, eventos: eventos.length, ultimo_seq: esperado - 1, ultimo_hash: bytesToHex(anterior), quebra: { seq: e.seq, evento_id: e.id, motivo: 'hash_anterior_nao_confere' } }
    const h = hashDoEvento(anterior, e)
    if (bytesToHex(h) !== e.hash) return { ok: false, eventos: eventos.length, ultimo_seq: esperado - 1, ultimo_hash: bytesToHex(anterior), quebra: { seq: e.seq, evento_id: e.id, motivo: 'hash_nao_confere' } }
    anterior = h
    esperado++
  }
  const ultimo = { seq: esperado - 1, hash: bytesToHex(anterior) }
  if (elo && (elo.seq !== ultimo.seq || (elo.seq > 0 && elo.hash !== ultimo.hash))) {
    return { ok: false, eventos: eventos.length, ultimo_seq: ultimo.seq, ultimo_hash: ultimo.hash, quebra: { seq: elo.seq, evento_id: null, motivo: 'elo_nao_confere' } }
  }
  return { ok: true, eventos: eventos.length, ultimo_seq: ultimo.seq, ultimo_hash: eventos.length ? ultimo.hash : null }
}

export { hexToBytes }

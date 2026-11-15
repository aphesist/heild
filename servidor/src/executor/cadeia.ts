import { bytesToHex, geneseDaCadeia, hashDoEvento, hexToBytes, type EventoDaCadeia, type Registro } from '@heild/dominio'
import { paraJson, type Tx } from '../banco/pg.ts'
import { colunasDe, prepararLinha } from './colunas.ts'

/**
 * Grava eventos na cadeia do escritório (STACK 8), na transação do efeito:
 * trava o elo (`select … for update`), calcula `hash = SHA-256(anterior ‖ canônico)`
 * com a função do pacote de domínio, grava os eventos e o elo novo. A trava dura só
 * até o commit. A hora do evento é a do servidor.
 */
export async function gravarEventos(
  tx: Tx,
  escritorioId: string,
  eventos: Registro[],
  extra: { sessao_auth_id: string | null; idempotencia_chave: string | null },
  /** `manterHora`: só a semente da demonstração (eventos de exemplo com data no passado). */
  opcoes: { manterHora?: boolean } = {},
) {
  if (!eventos.length) return []
  const colunas = await colunasDe(tx)
  const cols = colunas.get('evento')!
  await tx`insert into cadeia_evento (escritorio_id, seq, hash) values (${escritorioId}, 0, ${Buffer.from(geneseDaCadeia(escritorioId))}) on conflict (escritorio_id) do nothing`
  const [elo] = await tx`select seq, hash from cadeia_evento where escritorio_id = ${escritorioId} for update`
  let seq = Number(elo.seq)
  let anterior = new Uint8Array(elo.hash as Buffer)
  const gravados: Record<string, unknown>[] = []
  let relogio = Date.now()
  for (const e of eventos) {
    seq++
    // Hora do servidor, sempre crescente dentro da cadeia (milissegundos, como o canônico usa).
    relogio = Math.max(relogio, Date.now())
    const criado = opcoes.manterHora ? new Date(e.criado_em).toISOString() : new Date(relogio).toISOString()
    const base = prepararLinha(tx, 'evento', { ...e, criado_em: criado, atualizado_em: criado } as Registro, cols, escritorioId)
    const completo = {
      ...(e as unknown as Record<string, unknown>),
      escritorio_id: escritorioId,
      criado_em: criado,
      seq,
      ferramenta_versao: 1,
      sessao_auth_id: extra.sessao_auth_id,
      idempotencia_chave: extra.idempotencia_chave,
    } as unknown as EventoDaCadeia
    const hash = hashDoEvento(anterior, completo)
    const valores = { ...base.valores, seq, ferramenta_versao: 1, sessao_auth_id: extra.sessao_auth_id, idempotencia_chave: extra.idempotencia_chave, hash_anterior: Buffer.from(anterior), hash: Buffer.from(hash) }
    const [g] = await tx`insert into evento ${tx(valores as Record<string, unknown>, Object.keys(valores))} returning *`
    gravados.push(paraJson(g))
    anterior = new Uint8Array(hash)
    relogio++
  }
  await tx`update cadeia_evento set seq = ${seq}, hash = ${Buffer.from(anterior)} where escritorio_id = ${escritorioId}`
  return gravados
}

/** Lê a cadeia inteira do escritório (para verificar). */
export async function lerCadeia(tx: Tx) {
  const eventos = await tx`select * from evento where seq is not null order by seq`
  const [elo] = await tx`select seq, hash from cadeia_evento`
  return {
    eventos: eventos.map((e) => paraJson(e)) as unknown as (EventoDaCadeia & { hash_anterior: string; hash: string })[],
    elo: elo ? { seq: Number(elo.seq), hash: bytesToHex(new Uint8Array(elo.hash as Buffer)) } : null,
    fora_da_cadeia: Number((await tx`select count(*)::int as n from evento where seq is null`)[0].n),
  }
}

export { hexToBytes }

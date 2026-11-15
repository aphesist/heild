import type { NomeTabela, Registro } from '@heild/dominio'
import type { Tx } from '../banco/pg.ts'
import { ErroApi } from './erro.ts'

/**
 * As colunas de cada tabela, lidas do próprio banco uma vez por processo. Servem para
 * recusar campo que não existe (com o nome do campo) e para mandar jsonb como JSON.
 */

let cache: Map<string, Map<string, string>> | null = null

export async function colunasDe(tx: Tx): Promise<Map<string, Map<string, string>>> {
  if (cache) return cache
  const linhas = await tx<{ table_name: string; column_name: string; udt_name: string }[]>`
    select table_name, column_name, udt_name from information_schema.columns where table_schema = 'public' order by table_name, ordinal_position`
  const m = new Map<string, Map<string, string>>()
  for (const l of linhas) {
    const t = m.get(l.table_name) ?? new Map<string, string>()
    t.set(l.column_name, l.udt_name)
    m.set(l.table_name, t)
  }
  cache = m
  return m
}

/** Colunas que só o servidor escreve. */
const DO_SERVIDOR = new Set(['versao_linha', 'atualizado_em'])
const DO_SERVIDOR_EVENTO = new Set(['seq', 'hash', 'hash_anterior', 'sessao_auth_id', 'idempotencia_chave', 'ferramenta_versao', 'aprovacao_id', 'causado_por_evento_id'])

/**
 * Prepara a linha para o insert/update: escritório confere com o da sessão, campo
 * desconhecido é erro, colunas do servidor saem, jsonb vai como JSON.
 */
export function prepararLinha(tx: Tx, tabela: NomeTabela, linha: Registro, cols: Map<string, string>, escritorioId: string) {
  const l = linha as unknown as Record<string, unknown>
  if (l.escritorio_id && l.escritorio_id !== escritorioId) throw new ErroApi('FORA_DO_ESCRITORIO', { campo: `${tabela}.escritorio_id` })
  const valores: Record<string, unknown> = {}
  const colunas: string[] = []
  for (const [k, v] of Object.entries(l)) {
    if (v === undefined || DO_SERVIDOR.has(k) || (tabela === 'evento' && DO_SERVIDOR_EVENTO.has(k))) continue
    const udt = cols.get(k)
    if (!udt) throw new ErroApi('ENTRADA_INVALIDA', { campo: `${tabela}.${k}`, mensagem: `A tabela ${tabela} não tem o campo ${k}.` })
    valores[k] = v !== null && (udt === 'jsonb' || udt === 'json') ? tx.json(v as never) : v
    colunas.push(k)
  }
  valores.escritorio_id = escritorioId
  if (!colunas.includes('escritorio_id')) colunas.push('escritorio_id')
  return { valores, colunas }
}

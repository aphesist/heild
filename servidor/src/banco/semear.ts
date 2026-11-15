import { escritoriosDeExemplo, nomesTabelas, type Fotografia, type NomeTabela, type Registro } from '@heild/dominio'
import { colunasDe, prepararLinha } from '../executor/colunas.ts'
import { gravarEventos } from '../executor/cadeia.ts'
import { config } from '../config.ts'
import { noEscritorio, sqlApi, type Sql, type Tx } from './pg.ts'

/**
 * Semente da demonstração: os mesmos escritórios de exemplo do app (Andrade completo,
 * Horizonte pequeno), gerados pelo mesmo código (app/src/nucleo/semente), gravados pela
 * API (papel api_executor, sob a RLS do escritório) e com os eventos na cadeia de hash.
 * `restaurar_demonstracao()` só existe neste ambiente.
 *
 * Uso: npm run semear (os dois escritórios) · npm run semear -- esc-andrade
 */

const LOTE = 400

export async function semearEscritorio(tx: Tx, escritorioId: string, foto?: Fotografia): Promise<{ linhas: number; eventos: number }> {
  const exemplo = escritoriosDeExemplo.find((e) => e.id === escritorioId)
  if (!foto && !exemplo) throw new Error(`Não há semente para o escritório ${escritorioId}.`)
  const dados = foto ?? exemplo!.semente()
  await tx`select restaurar_demonstracao()`
  const colunas = await colunasDe(tx)
  let linhas = 0
  // Pais antes dos filhos (nomesTabelas já vem nessa ordem); evento por último, na cadeia.
  for (const tabela of nomesTabelas as NomeTabela[]) {
    if (tabela === 'evento') continue
    const lista = (dados[tabela] ?? []) as Registro[]
    if (!lista.length) continue
    const cols = colunas.get(tabela)
    if (!cols) throw new Error(`A semente tem a tabela ${tabela}, que não existe no banco.`)
    // Linhas com o mesmo conjunto de campos vão juntas (campo ausente fica com o padrão da tabela).
    const grupos = new Map<string, { colunas: string[]; valores: Record<string, unknown>[] }>()
    for (const l of lista) {
      const p = prepararLinha(tx, tabela, { ...l, escritorio_id: escritorioId } as Registro, cols, escritorioId)
      const chave = [...p.colunas].sort().join(',')
      const g = grupos.get(chave) ?? { colunas: p.colunas, valores: [] }
      g.valores.push(p.valores)
      grupos.set(chave, g)
    }
    for (const g of grupos.values()) {
      for (let i = 0; i < g.valores.length; i += LOTE) await tx`insert into ${tx(tabela)} ${tx(g.valores.slice(i, i + LOTE), g.colunas)}`
      linhas += g.valores.length
    }
  }
  const eventos = ([...((dados.evento ?? []) as Registro[])]).sort((a, b) => a.criado_em.localeCompare(b.criado_em) || a.id.localeCompare(b.id))
  await gravarEventos(tx, escritorioId, eventos, { sessao_auth_id: null, idempotencia_chave: null }, { manterHora: true })
  return { linhas, eventos: eventos.length }
}

export async function semearTodos(sql: Sql = sqlApi(), ids = escritoriosDeExemplo.map((e) => e.id)) {
  for (const id of ids) {
    const r = await noEscritorio(sql, { sub: 'semente', escritorio_id: id }, (tx) => semearEscritorio(tx, id))
    console.log(`${id}: ${r.linhas} linhas e ${r.eventos} eventos na cadeia.`)
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  if (!config.demonstracao) {
    console.error('A semente só roda com HEILD_DEMONSTRACAO=1.')
    process.exit(1)
  }
  const ids = process.argv.slice(2)
  semearTodos(sqlApi(), ids.length ? ids : undefined)
    .then(() => process.exit(0))
    .catch((e) => {
      console.error(e instanceof Error ? e.message : e)
      process.exit(1)
    })
}

import { useCallback, useEffect, useMemo, useState } from 'react'
import { banco } from './banco'
import type { AdaptadorApi } from './banco/api'
import type { Tabelas } from './modelo/entidades'
import { useTabela } from './react'

/* ---------- Consulta paginada (classe 3: evento, mensagem interna) ---------- */

/** Tabelas que a tela lê por consulta, e não inteiras (ARQUITETURA 6.1, classe 3, no que a F1 migrou). */
export type TabelaConsulta = 'evento' | 'mensagem_interna'

/** Filtro por igualdade de coluna (os que a ferramenta de lista aceita vão ao servidor; o resto filtra aqui). */
export type FiltroConsulta<K extends TabelaConsulta> = Partial<{ [C in keyof Tabelas[K]]: Tabelas[K][C] }>

export interface Consulta<K extends TabelaConsulta> {
  /** As linhas que casam com o filtro, em ordem de criação (como o `useTabela`). */
  linhas: Tabelas[K][]
  carregando: boolean
  erro: string | null
  /** Há página mais antiga no servidor. */
  haMais: boolean
  /** Quantas linhas o servidor tem para o filtro (no modo local, as da memória). */
  total: number | null
  carregarMais: () => void
}

/** O que cada ferramenta de lista aceita de filtro (o resto do filtro vale só no navegador). */
function entradaDaConsulta(tabela: TabelaConsulta, filtro: Record<string, unknown>): Record<string, unknown> {
  const pega = (chaves: string[]) => Object.fromEntries(chaves.filter((k) => typeof filtro[k] === 'string').map((k) => [k, filtro[k]]))
  if (tabela === 'evento') return { ...pega(['cliente_id', 'setor_id', 'ferramenta', 'resultado_ref', 'nome']), so_linha_do_tempo: filtro.visivel_na_linha_do_tempo === true }
  return pega(['conversa_interna_id'])
}

/**
 * `useConsulta(tabela, filtro)`: lê o histórico pela ferramenta de lista, com cursor
 * (nunca `offset`), em vez de carregar a tabela inteira (ARQUITETURA 6.1). Mostra o que está
 * no cache do banco (inclusive a escrita otimista desta aba) filtrado; no modo `api`, busca as
 * páginas no servidor (que entram no cache) e relê a primeira quando o SSE avisa que a
 * tabela mudou. No modo local (site, demonstração), lê a memória, como sempre.
 */
export function useConsulta<K extends TabelaConsulta>(tabela: K, filtro: FiltroConsulta<K>, opcoes: { limite?: number; ativo?: boolean } = {}): Consulta<K> {
  const cache = useTabela(tabela)
  const chave = JSON.stringify(filtro)
  const ativo = opcoes.ativo !== false
  const limite = opcoes.limite ?? 100
  const adaptador = banco.adaptador as Partial<AdaptadorApi>
  const remoto = adaptador.nome === 'api' && typeof adaptador.consultar === 'function'
  const [estado, setEstado] = useState<{ carregando: boolean; erro: string | null; haMais: boolean; total: number | null; cursor: string | null }>({ carregando: remoto && ativo, erro: null, haMais: false, total: null, cursor: null })

  const buscar = useCallback(
    async (cursor: string | null) => {
      if (!remoto || !ativo) return
      const ferramenta = tabela === 'evento' ? 'evento.listar' : 'mensagem_interna.listar'
      setEstado((e) => ({ ...e, carregando: true, erro: null }))
      try {
        const p = await adaptador.consultar!(ferramenta, { ...entradaDaConsulta(tabela, JSON.parse(chave) as Record<string, unknown>), visao: 'tela', limite, ...(cursor ? { cursor } : {}) })
        setEstado((e) => ({ carregando: false, erro: null, haMais: p.haMais, total: p.total, cursor: p.cursor ?? (cursor ? e.cursor : null) }))
      } catch (e) {
        setEstado((x) => ({ ...x, carregando: false, erro: e instanceof Error ? e.message : String(e) }))
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [remoto, ativo, tabela, chave, limite],
  )

  useEffect(() => {
    if (!remoto || !ativo) return
    void buscar(null)
    // A tabela mudou no servidor (SSE): relê a primeira página.
    return adaptador.aoMudarConsulta!((t) => {
      if (t === tabela) void buscar(null)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buscar])

  const linhas = useMemo(() => {
    const f = JSON.parse(chave) as Record<string, unknown>
    return (cache as unknown as Record<string, unknown>[]).filter((l) => Object.entries(f).every(([k, v]) => v === undefined || l[k] === v)) as unknown as Tabelas[K][]
  }, [cache, chave])

  return {
    linhas,
    carregando: estado.carregando,
    erro: estado.erro,
    haMais: remoto ? estado.haMais : false,
    total: remoto ? estado.total : linhas.length,
    carregarMais: () => {
      if (estado.haMais && estado.cursor) void buscar(estado.cursor)
    },
  }
}

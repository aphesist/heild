import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react'
import { Carregando, EstadoErro } from '@/components/kit/estados'
import { banco } from './banco'
import type { Id, NomeTabela, Tabelas } from './modelo/entidades'
import { escritorioAtivoGuardado, escritorioDeExemplo, escritoriosDeExemplo, guardarEscritorioAtivo, type EscritorioDeExemplo } from './semente'

/**
 * Ponte entre o banco e o React. O `BancoProvider` abre o escritório de
 * exemplo ativo antes de mostrar o app; os hooks leem tabelas e linhas e
 * renderizam de novo só quando a tabela lida muda.
 */

interface BancoContexto {
  escritorio: EscritorioDeExemplo
  /** Abre outro escritório de exemplo (os dados de cada um ficam guardados à parte). */
  trocarEscritorio: (id: Id) => Promise<void>
  /** Volta o escritório ativo aos dados de exemplo. */
  restaurar: () => Promise<void>
  /** Nome do adaptador em uso e a frase para o painel. */
  armazenamento: { nome: string; descricao: string }
}

const Ctx = createContext<BancoContexto | null>(null)

function useEstadoBanco() {
  return useSyncExternalStore(
    (f) => banco.assinar(f),
    () => banco.estado,
  )
}

export function BancoProvider({ children, escritorioInicial }: { children: ReactNode; escritorioInicial?: Id }) {
  const [id, setId] = useState(() => escritorioInicial ?? escritorioAtivoGuardado())
  const estado = useEstadoBanco()
  const [tentativa, setTentativa] = useState(0)
  useEffect(() => {
    void banco.abrir(id, escritorioDeExemplo(id).semente)
  }, [id, tentativa])
  const trocarEscritorio = useCallback(async (novo: Id) => {
    guardarEscritorioAtivo(novo)
    setId(novo)
  }, [])
  const restaurar = useCallback(() => banco.restaurar(escritorioDeExemplo(id).semente), [id])
  const valor = useMemo<BancoContexto>(() => ({ escritorio: escritorioDeExemplo(id), trocarEscritorio, restaurar, armazenamento: { nome: banco.adaptador.nome, descricao: banco.adaptador.descricao } }), [id, trocarEscritorio, restaurar])
  if (estado === 'erro') return <EstadoErro className="min-h-dvh" titulo="Não foi possível abrir os dados do escritório" descricao={banco.erro} onTentar={() => setTentativa((n) => n + 1)} />
  // Enquanto abre (ou troca de escritório), nada da tela antiga aparece misturado com a nova.
  if (estado !== 'pronto' || banco.escritorioId !== id) return <Carregando className="min-h-dvh" rotulo="Abrindo o escritório" />
  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>
}

/** Abre o banco só se ainda não houver um provider acima (stories isoladas). */
export function BancoOpcional({ children }: { children: ReactNode }) {
  return useContext(Ctx) ? <>{children}</> : <BancoProvider>{children}</BancoProvider>
}

export function useBanco(): BancoContexto {
  const c = useContext(Ctx)
  if (!c) return { escritorio: escritoriosDeExemplo[0], trocarEscritorio: async () => {}, restaurar: async () => {}, armazenamento: { nome: banco.adaptador.nome, descricao: banco.adaptador.descricao } }
  return c
}

export const temBanco = () => banco.estado === 'pronto'

/** Todas as linhas de uma tabela (com as arquivadas). Re-renderiza só quando ela muda. */
export function useTabela<K extends NomeTabela>(tabela: K): Tabelas[K][] {
  return useSyncExternalStore(
    (avisar) => banco.assinar((mudou) => (mudou.size === 0 || mudou.has(tabela)) && avisar()),
    () => banco.ler(tabela),
  )
}

/** Uma linha pelo id (ou `undefined`). */
export function useRegistro<K extends NomeTabela>(tabela: K, id: Id | null | undefined): Tabelas[K] | undefined {
  const linhas = useTabela(tabela)
  return useMemo(() => (id ? linhas.find((r) => r.id === id) : undefined), [linhas, id])
}

/** Versão do banco inteiro: muda a cada escrita (para memos que leem várias tabelas). */
export function useVersaoBanco(): number {
  return useSyncExternalStore(
    (f) => banco.assinar(f),
    () => banco.versao,
  )
}

/** O escritório ativo (linha da tabela `escritorio`). */
export function useEscritorio() {
  return useTabela('escritorio')[0]
}

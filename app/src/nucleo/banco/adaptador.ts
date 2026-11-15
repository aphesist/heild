import type { Fotografia, Id, NomeTabela, Registro } from '../modelo/entidades'

/**
 * Onde os dados moram. O Banco (banco.ts) guarda o escritório ativo em
 * memória e chama o adaptador para carregar e persistir. Trocar o adaptador é
 * trocar onde os dados ficam, sem mexer em repositório nem em tela.
 *
 * - `local` (padrão): localStorage do navegador.
 * - `indexeddb`: IndexedDB do navegador (mais espaço).
 * - `supabase`: Postgres com RLS por escritório (ver app/supabase/README.md).
 * - `api`: a API do backend real (servidor/), que confere a regra e grava (branch backend).
 * - `memoria`: nada persiste (Storybook, testes).
 */
export type NomeAdaptador = 'local' | 'indexeddb' | 'supabase' | 'api' | 'memoria'

/** O que mudou numa tabela desde a última gravação. */
export interface Alteracao {
  tabela: NomeTabela
  gravar: Registro[]
  remover: Id[]
}

export interface Adaptador {
  nome: NomeAdaptador
  /** Frase curta para o painel da demonstração ("Neste navegador (localStorage)"). */
  descricao: string
  /** Fotografia guardada do escritório; `null` se ele ainda não foi semeado. */
  carregar(escritorioId: Id): Promise<Fotografia | null>
  /**
   * Persiste as alterações. `foto` é o estado completo depois delas (os
   * adaptadores do navegador regravam a tabela inteira; o do Supabase usa só
   * as alterações).
   */
  persistir(escritorioId: Id, alteracoes: Alteracao[], foto: Fotografia): Promise<void>
  /**
   * Troca tudo do escritório por esta fotografia (semente, restaurar demonstração).
   * O adaptador `api` semeia no servidor e devolve a fotografia do servidor, que vale no lugar da local.
   */
  substituir(escritorioId: Id, foto: Fotografia): Promise<void | Fotografia>
  /** Apaga os dados guardados do escritório (o próximo carregar devolve `null`). */
  esquecer(escritorioId: Id): Promise<void>
}

export class ErroAdaptador extends Error {
  readonly adaptador: NomeAdaptador
  constructor(adaptador: NomeAdaptador, mensagem: string) {
    super(mensagem)
    this.adaptador = adaptador
  }
}

import { nomesTabelas, type Fotografia, type Id, type NomeTabela } from '../modelo/entidades'
import { ErroAdaptador, type Adaptador } from './adaptador'

/** Fotografia vazia (todas as tabelas, nenhuma linha). */
export function fotografiaVazia(): Fotografia {
  return Object.fromEntries(nomesTabelas.map((t) => [t, []])) as unknown as Fotografia
}

const prefixo = 'heild:banco'
const chave = (escritorioId: Id, tabela: NomeTabela | '_semeado') => `${prefixo}:${escritorioId}:${tabela}`

/** localStorage: uma chave por tabela de cada escritório. Síncrono por baixo, então carrega sem espera perceptível. */
export function adaptadorLocal(): Adaptador {
  const ls = () => {
    try {
      return window.localStorage
    } catch {
      throw new ErroAdaptador('local', 'Este navegador não deixa guardar dados (localStorage bloqueado).')
    }
  }
  const gravarTabela = (escritorioId: Id, tabela: NomeTabela, foto: Fotografia) => {
    try {
      ls().setItem(chave(escritorioId, tabela), JSON.stringify(foto[tabela]))
    } catch (e) {
      throw new ErroAdaptador('local', e instanceof DOMException && e.name === 'QuotaExceededError' ? 'O espaço do navegador acabou. Use "Restaurar demonstração" ou o IndexedDB.' : 'Não foi possível gravar no navegador.')
    }
  }
  return {
    nome: 'local',
    descricao: 'Neste navegador (localStorage)',
    async carregar(escritorioId) {
      const s = ls()
      if (!s.getItem(chave(escritorioId, '_semeado'))) return null
      const foto = fotografiaVazia()
      for (const t of nomesTabelas) {
        const bruto = s.getItem(chave(escritorioId, t))
        if (bruto) (foto as Record<string, unknown>)[t] = JSON.parse(bruto)
      }
      return foto
    },
    async persistir(escritorioId, alteracoes, foto) {
      for (const t of new Set(alteracoes.map((a) => a.tabela))) gravarTabela(escritorioId, t, foto)
    },
    async substituir(escritorioId, foto) {
      for (const t of nomesTabelas) gravarTabela(escritorioId, t, foto)
      ls().setItem(chave(escritorioId, '_semeado'), new Date().toISOString())
    },
    async esquecer(escritorioId) {
      const s = ls()
      Object.keys(s)
        .filter((k) => k.startsWith(`${prefixo}:${escritorioId}:`))
        .forEach((k) => s.removeItem(k))
    },
  }
}

/** IndexedDB: um registro por (escritório, tabela) no banco `heild`. */
export function adaptadorIndexedDb(): Adaptador {
  let conexao: Promise<IDBDatabase> | null = null
  const abrir = () =>
    (conexao ??= new Promise((resolver, rejeitar) => {
      const req = indexedDB.open('heild', 1)
      req.onupgradeneeded = () => req.result.createObjectStore('tabelas')
      req.onsuccess = () => resolver(req.result)
      req.onerror = () => rejeitar(new ErroAdaptador('indexeddb', 'Não foi possível abrir o IndexedDB.'))
    }))
  const transacao = async <T>(modo: IDBTransactionMode, fazer: (loja: IDBObjectStore) => IDBRequest<T> | void): Promise<T | undefined> => {
    const db = await abrir()
    return new Promise((resolver, rejeitar) => {
      const tx = db.transaction('tabelas', modo)
      const req = fazer(tx.objectStore('tabelas'))
      tx.oncomplete = () => resolver(req ? req.result : undefined)
      tx.onerror = () => rejeitar(new ErroAdaptador('indexeddb', 'Falha ao gravar no IndexedDB.'))
    })
  }
  return {
    nome: 'indexeddb',
    descricao: 'Neste navegador (IndexedDB)',
    async carregar(escritorioId) {
      const semeado = await transacao('readonly', (l) => l.get(chave(escritorioId, '_semeado')))
      if (!semeado) return null
      const foto = fotografiaVazia()
      for (const t of nomesTabelas) {
        const linhas = await transacao('readonly', (l) => l.get(chave(escritorioId, t)))
        if (Array.isArray(linhas)) (foto as Record<string, unknown>)[t] = linhas
      }
      return foto
    },
    async persistir(escritorioId, alteracoes, foto) {
      const tabelas = [...new Set(alteracoes.map((a) => a.tabela))]
      await transacao('readwrite', (l) => {
        for (const t of tabelas) l.put(foto[t], chave(escritorioId, t))
      })
    },
    async substituir(escritorioId, foto) {
      await transacao('readwrite', (l) => {
        for (const t of nomesTabelas) l.put(foto[t], chave(escritorioId, t))
        l.put(new Date().toISOString(), chave(escritorioId, '_semeado'))
      })
    },
    async esquecer(escritorioId) {
      await transacao('readwrite', (l) => {
        for (const t of [...nomesTabelas, '_semeado' as const]) l.delete(chave(escritorioId, t))
      })
    },
  }
}

/** Só memória: nada persiste (Storybook, testes, stories isoladas). */
export function adaptadorMemoria(): Adaptador {
  const guardado = new Map<Id, Fotografia>()
  return {
    nome: 'memoria',
    descricao: 'Só na memória (some ao recarregar)',
    async carregar(id) {
      return guardado.get(id) ?? null
    },
    async persistir(id, _alteracoes, foto) {
      guardado.set(id, foto)
    },
    async substituir(id, foto) {
      guardado.set(id, foto)
    },
    async esquecer(id) {
      guardado.delete(id)
    },
  }
}

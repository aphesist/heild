import { adaptadorMemoria, Banco, type Id, type NomeTabela, type PedidoJob, type Registro, type Tabelas, type Transacao } from '@heild/dominio'

/**
 * O banco de um pedido: os mesmos repositórios do app rodam aqui em cima, de forma
 * síncrona, como rodam no navegador. A diferença é de onde vêm as linhas:
 *
 * - O que a operação lê é carregado do Postgres (sob a RLS do escritório da sessão)
 *   na primeira vez que ela pede. Como os repositórios são síncronos, a leitura de algo
 *   ainda não carregado lança `PrecisaCarregar`; o executor carrega e roda a operação
 *   de novo do zero (sem efeito nenhum até o fim: as escritas ficam numa camada por cima).
 * - O que a operação grava fica em `escritas`, na ordem. No fim, o executor aplica tudo
 *   numa transação só, com o evento na cadeia.
 */

export class PrecisaCarregar extends Error {
  constructor(
    readonly tabela: NomeTabela,
    readonly id?: Id,
  ) {
    super(`precisa carregar ${tabela}${id ? `/${id}` : ''}`)
  }
}

export interface Escrita {
  tabela: NomeTabela
  id: Id
  /** Linha nova (null = removida). */
  linha: Registro | null
}

export class BancoServidor extends Banco {
  /** Linhas carregadas do Postgres, por tabela (o estado de antes). */
  readonly base = new Map<NomeTabela, Map<Id, Registro>>()
  /** Tabelas carregadas inteiras. */
  readonly completas = new Set<NomeTabela>()
  /** Ids procurados que não existem. */
  readonly ausentes = new Map<NomeTabela, Set<Id>>()
  /** O que a operação gravou (camada por cima da base), em ordem. */
  private camada = new Map<NomeTabela, Map<Id, Registro | null>>()
  escritas: Escrita[] = []
  /** Jobs que a operação pediu (pedirJob), gravados na mesma transação do efeito. */
  jobs: PedidoJob[] = []

  constructor(escritorioId: Id) {
    super(adaptadorMemoria())
    this.escritorioId = escritorioId
    this.estado = 'pronto'
  }

  /** Volta ao estado de antes da operação (para rodar de novo depois de carregar algo). */
  recomecar() {
    this.camada = new Map()
    this.escritas = []
    this.jobs = []
  }

  carregarTabela(tabela: NomeTabela, linhas: Registro[]) {
    const m = this.base.get(tabela) ?? new Map<Id, Registro>()
    for (const l of linhas) if (!m.has(l.id)) m.set(l.id, l)
    this.base.set(tabela, m)
    this.completas.add(tabela)
  }

  carregarLinha(tabela: NomeTabela, id: Id, linha: Registro | undefined) {
    if (linha) {
      const m = this.base.get(tabela) ?? new Map<Id, Registro>()
      m.set(id, linha)
      this.base.set(tabela, m)
    } else {
      const s = this.ausentes.get(tabela) ?? new Set<Id>()
      s.add(id)
      this.ausentes.set(tabela, s)
    }
  }

  /** A linha como estava antes da operação (para saber se é inserção ou atualização). */
  antes(tabela: NomeTabela, id: Id): Registro | undefined {
    return this.base.get(tabela)?.get(id)
  }

  override ler<T extends NomeTabela>(tabela: T): Tabelas[T][] {
    if (!this.completas.has(tabela)) throw new PrecisaCarregar(tabela)
    const base = this.base.get(tabela) ?? new Map()
    const camada = this.camada.get(tabela)
    if (!camada) return [...base.values()] as Tabelas[T][]
    const r: Registro[] = []
    for (const [id, l] of base) {
      if (camada.has(id)) {
        const n = camada.get(id)
        if (n) r.push(n)
      } else r.push(l)
    }
    for (const [id, n] of camada) if (n && !base.has(id)) r.push(n)
    return r as Tabelas[T][]
  }

  override obter<T extends NomeTabela>(tabela: T, id: Id): Tabelas[T] | undefined {
    const camada = this.camada.get(tabela)
    if (camada?.has(id)) return (camada.get(id) ?? undefined) as Tabelas[T] | undefined
    const l = this.base.get(tabela)?.get(id)
    if (l) return l as Tabelas[T]
    if (this.completas.has(tabela) || this.ausentes.get(tabela)?.has(id)) return undefined
    throw new PrecisaCarregar(tabela, id)
  }

  override transacao<R>(fazer: (tx: Transacao) => R): R {
    // As escritas da transação só valem se ela inteira der certo (como no Banco do app).
    const locais = new Map<NomeTabela, Map<Id, Registro | null>>()
    const ordem: Escrita[] = []
    const verLocal = (t: NomeTabela, id: Id): Registro | null | undefined => (locais.get(t)?.has(id) ? locais.get(t)!.get(id) : undefined)
    const tx: Transacao = {
      gravar: (t, recebida) => {
        const linha = (recebida.escritorio_id ? recebida : { ...recebida, escritorio_id: this.escritorioId ?? '' }) as Registro
        const m = locais.get(t) ?? new Map()
        m.set(linha.id, linha)
        locais.set(t, m)
        ordem.push({ tabela: t, id: linha.id, linha })
      },
      remover: (t, id) => {
        const m = locais.get(t) ?? new Map()
        m.set(id, null)
        locais.set(t, m)
        ordem.push({ tabela: t, id, linha: null })
      },
      ler: <T extends NomeTabela>(t: T) => {
        const fora = this.ler(t) as Registro[]
        const m = locais.get(t)
        if (!m) return fora as never
        const vistos = new Set<Id>()
        const r: Registro[] = []
        for (const l of fora) {
          vistos.add(l.id)
          if (m.has(l.id)) {
            const n = m.get(l.id)
            if (n) r.push(n)
          } else r.push(l)
        }
        for (const [id, n] of m) if (n && !vistos.has(id)) r.push(n)
        return r as never
      },
      obter: <T extends NomeTabela>(t: T, id: Id) => {
        const l = verLocal(t, id)
        if (l !== undefined) return (l ?? undefined) as never
        return this.obter(t, id) as never
      },
    }
    const resultado = fazer(tx)
    for (const [t, m] of locais) {
      const c = this.camada.get(t) ?? new Map()
      for (const [id, l] of m) c.set(id, l)
      this.camada.set(t, c)
    }
    this.escritas.push(...ordem)
    this.versao++
    return resultado
  }
}

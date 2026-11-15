import type { Fotografia, Id, NomeTabela, Registro, Tabelas } from '../modelo/entidades'
import type { Adaptador, Alteracao } from './adaptador'
import { fotografiaVazia } from './navegador'

/**
 * O banco do escritório ativo, em memória, com gravação no adaptador.
 *
 * Leitura é síncrona (as telas leem como liam os dados de exemplo); escrita
 * muda a memória na hora, avisa quem assina e grava no adaptador logo depois
 * (escrita otimista, como faria um front sobre o Supabase). Só o escritório da
 * sessão fica carregado: é o mesmo isolamento da RLS (R3).
 *
 * Ninguém escreve aqui direto: as escritas passam pelos repositórios, que
 * conferem permissão e regra de negócio e registram o evento (R1, R2).
 */

export type EstadoBanco = 'fechado' | 'carregando' | 'pronto' | 'erro'

export interface Transacao {
  gravar<T extends NomeTabela>(tabela: T, linha: Tabelas[T]): void
  remover(tabela: NomeTabela, id: Id): void
  ler<T extends NomeTabela>(tabela: T): Tabelas[T][]
  obter<T extends NomeTabela>(tabela: T, id: Id): Tabelas[T] | undefined
}

type Ouvinte = (tabelas: ReadonlySet<NomeTabela>) => void

/** Uma escrita de uma transação: linha gravada ou id removido. */
export interface MarcaEscrita {
  tabela: NomeTabela
  linha: Registro | null
  removido: Id | null
}

export class Banco {
  adaptador: Adaptador
  escritorioId: Id | null = null
  estado: EstadoBanco = 'fechado'
  erro: string | null = null
  private foto: Fotografia = fotografiaVazia()
  private indices = new Map<NomeTabela, Map<Id, Registro>>()
  private ouvintes = new Set<Ouvinte>()
  private ouvintesErro = new Set<(mensagem: string) => void>()
  private pendentes = new Map<NomeTabela, { gravar: Map<Id, Registro>; remover: Set<Id> }>()
  private relogio: ReturnType<typeof setTimeout> | null = null
  /** Muda a cada escrita: serve de versão para `useSyncExternalStore`. */
  versao = 0
  /**
   * Quem quer saber de cada transação que deu certo com o banco pronto (o adaptador `api`
   * transforma a escrita que não veio de um repositório num comando para a API).
   */
  aoTransacao: ((marcas: MarcaEscrita[]) => void) | null = null

  constructor(adaptador: Adaptador) {
    this.adaptador = adaptador
    if (typeof window !== 'undefined') window.addEventListener('pagehide', () => void this.descarregar())
  }

  private abrindo: { id: Id; promessa: Promise<void> } | null = null

  /** Abre um escritório: carrega o que está guardado ou semeia com os dados de exemplo. Pedido repetido (modo estrito do React) reaproveita a abertura em andamento. */
  abrir(escritorioId: Id, semente: () => Fotografia): Promise<void> {
    if (this.abrindo?.id === escritorioId) return this.abrindo.promessa
    if (this.estado === 'pronto' && this.escritorioId === escritorioId) return Promise.resolve()
    const promessa = this.abrirDeVerdade(escritorioId, semente).finally(() => {
      if (this.abrindo?.promessa === promessa) this.abrindo = null
    })
    this.abrindo = { id: escritorioId, promessa }
    return promessa
  }

  private async abrirDeVerdade(escritorioId: Id, semente: () => Fotografia): Promise<void> {
    await this.descarregar()
    this.escritorioId = escritorioId
    this.mudarEstado('carregando')
    try {
      let foto = await this.adaptador.carregar(escritorioId)
      if (!foto) {
        foto = semente()
        foto = (await this.adaptador.substituir(escritorioId, foto)) ?? foto
      }
      this.trocarFoto(foto)
      this.mudarEstado('pronto')
    } catch (e) {
      this.erro = e instanceof Error ? e.message : String(e)
      this.mudarEstado('erro')
    }
  }

  /** Volta o escritório aos dados de exemplo (o que foi feito na demonstração se perde, por escolha de quem pediu). */
  async restaurar(semente: () => Fotografia): Promise<void> {
    if (!this.escritorioId) return
    // Nada do que estava pendente vale mais: o escritório vai ser apagado e semeado de novo.
    if (this.relogio) clearTimeout(this.relogio)
    this.relogio = null
    this.pendentes.clear()
    // Enquanto restaura, o banco não está pronto: a tela mostra "Abrindo o escritório" e
    // nenhuma escrita da tela que sai entra na fila (ver transacao).
    this.mudarEstado('carregando')
    try {
      const local = semente()
      const foto = (await this.adaptador.substituir(this.escritorioId, local)) ?? local
      this.trocarFoto(foto)
      this.mudarEstado('pronto')
    } catch (e) {
      this.erro = e instanceof Error ? e.message : String(e)
      this.mudarEstado('erro')
    }
  }

  ler<T extends NomeTabela>(tabela: T): Tabelas[T][] {
    return this.foto[tabela]
  }

  obter<T extends NomeTabela>(tabela: T, id: Id): Tabelas[T] | undefined {
    let indice = this.indices.get(tabela)
    if (!indice) {
      indice = new Map(this.foto[tabela].map((r) => [r.id, r]))
      this.indices.set(tabela, indice)
    }
    return indice.get(id) as Tabelas[T] | undefined
  }

  /** Várias escritas de uma vez: a memória muda junto e quem assina é avisado uma vez só. */
  transacao<R>(fazer: (tx: Transacao) => R): R {
    const novas = new Map<NomeTabela, Registro[]>()
    // As marcas só valem se a transação inteira der certo (uma regra que falha no meio não grava metade).
    const marcas: [NomeTabela, Registro | null, Id | null][] = []
    const tabela = <T extends NomeTabela>(t: T) => (novas.get(t) ?? this.foto[t]) as Registro[]
    const tx: Transacao = {
      gravar: (t, linhaRecebida) => {
        // Toda linha é do escritório aberto (o evento nasce sem ele no registrarEvento).
        const linha = linhaRecebida.escritorio_id ? linhaRecebida : { ...linhaRecebida, escritorio_id: this.escritorioId ?? '' }
        const atual = tabela(t)
        const i = atual.findIndex((r) => r.id === linha.id)
        const nova = i >= 0 ? atual.map((r, j) => (j === i ? linha : r)) : [...atual, linha]
        novas.set(t, nova)
        marcas.push([t, linha, null])
      },
      remover: (t, id) => {
        novas.set(t, tabela(t).filter((r) => r.id !== id))
        marcas.push([t, null, id])
      },
      ler: (t) => tabela(t) as never,
      obter: (t, id) => tabela(t).find((r) => r.id === id) as never,
    }
    const resultado = fazer(tx)
    if (novas.size) {
      // Fora do estado pronto (abrindo, trocando de escritório, restaurando), a escrita é da tela que
      // está saindo: muda a memória que vai ser trocada, mas não vai para o adaptador (iria para o
      // escritório errado, ou para um que acabou de ser apagado).
      if (this.estado === 'pronto') for (const [t, linha, id] of marcas) this.marcar(t, linha, id)
      if (this.estado === 'pronto' && this.aoTransacao) this.aoTransacao(marcas.map(([tabela, linha, removido]) => ({ tabela, linha, removido })))
      for (const [t, linhas] of novas) {
        ;(this.foto as Record<string, Registro[]>)[t] = linhas
        this.indices.delete(t)
      }
      this.foto = { ...this.foto }
      this.versao++
      this.avisar(new Set(novas.keys()))
      if (this.estado === 'pronto') this.agendarGravacao()
    }
    return resultado
  }

  /**
   * Aplica o que o servidor confirmou (a linha como ficou gravada), sem gerar escrita nova:
   * é a reconciliação da escrita otimista no modo `api`.
   */
  aplicarDoServidor(gravar: { tabela: NomeTabela; linha: Registro }[], remover: { tabela: NomeTabela; id: Id }[] = []): void {
    if (!gravar.length && !remover.length) return
    const mexidas = new Set<NomeTabela>()
    for (const { tabela, linha } of gravar) {
      const atual = this.foto[tabela] as Registro[] | undefined
      if (!atual) continue
      const i = atual.findIndex((r) => r.id === linha.id)
      ;(this.foto as Record<string, Registro[]>)[tabela] = i >= 0 ? atual.map((r, j) => (j === i ? linha : r)) : [...atual, linha]
      mexidas.add(tabela)
    }
    for (const { tabela, id } of remover) {
      const atual = this.foto[tabela] as Registro[] | undefined
      if (!atual) continue
      ;(this.foto as Record<string, Registro[]>)[tabela] = atual.filter((r) => r.id !== id)
      mexidas.add(tabela)
    }
    for (const t of mexidas) this.indices.delete(t)
    this.foto = { ...this.foto }
    this.versao++
    this.avisar(mexidas)
  }

  /** Troca a memória inteira pela fotografia do servidor (depois de uma escrita recusada lá). */
  recarregarDe(foto: Fotografia): void {
    this.trocarFoto(foto)
  }

  /** Cópia do escritório inteiro (exportar, depurar). */
  exportar(): Fotografia {
    return structuredClone(this.foto)
  }

  assinar(ouvinte: Ouvinte): () => void {
    this.ouvintes.add(ouvinte)
    return () => this.ouvintes.delete(ouvinte)
  }

  aoErro(ouvinte: (mensagem: string) => void): () => void {
    this.ouvintesErro.add(ouvinte)
    return () => this.ouvintesErro.delete(ouvinte)
  }

  /** Grava agora o que está pendente (ao sair da página, ao trocar de escritório). */
  async descarregar(): Promise<void> {
    if (this.relogio) clearTimeout(this.relogio)
    this.relogio = null
    if (!this.pendentes.size || !this.escritorioId) return
    const alteracoes: Alteracao[] = [...this.pendentes].map(([tabela, p]) => ({ tabela, gravar: [...p.gravar.values()], remover: [...p.remover] }))
    this.pendentes.clear()
    try {
      await this.adaptador.persistir(this.escritorioId, alteracoes, this.foto)
    } catch (e) {
      const mensagem = e instanceof Error ? e.message : String(e)
      console.error('[heild] falha ao gravar:', mensagem)
      this.ouvintesErro.forEach((o) => o(mensagem))
    }
  }

  private marcar(tabela: NomeTabela, linha: Registro | null, removido: Id | null) {
    const p = this.pendentes.get(tabela) ?? { gravar: new Map(), remover: new Set() }
    if (linha) {
      p.gravar.set(linha.id, linha)
      p.remover.delete(linha.id)
    }
    if (removido) {
      p.gravar.delete(removido)
      p.remover.add(removido)
    }
    this.pendentes.set(tabela, p)
  }

  private agendarGravacao() {
    if (this.relogio) return
    this.relogio = setTimeout(() => void this.descarregar(), 120)
  }

  private trocarFoto(foto: Fotografia) {
    // Tabela nova (versão mais nova do código) entra vazia em fotografia antiga.
    this.foto = { ...fotografiaVazia(), ...foto }
    this.indices.clear()
    this.versao++
    this.avisar(new Set(Object.keys(this.foto) as NomeTabela[]))
  }

  private mudarEstado(e: EstadoBanco) {
    this.estado = e
    this.versao++
    this.avisar(new Set())
  }

  private avisar(tabelas: ReadonlySet<NomeTabela>) {
    this.ouvintes.forEach((o) => o(tabelas))
  }
}

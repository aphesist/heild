import type { Banco, Transacao } from '../banco/banco'
import type { Evento, Id, NomeTabela, Novo, Tabelas } from '../modelo/entidades'
import { autorizar, ErroPermissao, ErroRegra, type Alvo } from '../permissoes/autorizar'
import { idDoAtor, nomeDoAtor, type Contexto } from '../permissoes/perfil'
import { contextoAtual } from './contexto'

/**
 * Repositório genérico: a única porta de escrita do banco (R1). Toda operação
 * confere a permissão na função única, aplica a regra da entidade, grava na
 * mesma transação o evento (R2) e devolve a linha nova.
 *
 * Operações: listar, obter, criar, atualizar, mover (trocar de coluna e de
 * posição), reordenar, arquivar, desarquivar, excluir (quando a regra deixa),
 * reverter (desfazer) e desfazerCriacao.
 */

/** Id novo com prefixo ("tk", "ev"): ordenável pelo tempo e com sufixo aleatório. */
export const novoIdPadrao = (prefixo: string) => `${prefixo}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
let geradorId: (prefixo: string) => string = novoIdPadrao
export const novoId = (prefixo: string) => geradorId(prefixo)
/**
 * Troca o gerador de ids (null volta ao padrão). O modo `api` anota os ids que a tela
 * gerou numa operação e o servidor repete os mesmos ao rodar a mesma operação: a linha
 * otimista e a gravada têm o mesmo id.
 */
export function definirGeradorId(g: ((prefixo: string) => string) | null) {
  geradorId = g ?? novoIdPadrao
}
export const agora = () => new Date().toISOString()

export interface RegrasEntidade<K extends NomeTabela> {
  tabela: K
  /** Prefixo dos ids novos ("tk", "cli"). */
  prefixo: string
  /** Nome da entidade nas frases ("a tarefa", "o cliente"). */
  artigo: string
  /** Ferramentas de cada operação (Fundações 6). */
  ferramentas: { criar: string; atualizar: string; arquivar?: string; excluir?: string; reordenar?: string; mover?: string }
  /**
   * `proibida`: não existe excluir (mensagem interna, evento, tarefa: R7 "nada se apaga").
   * `definitiva`: some de verdade, com confirmação na tela e evento que guarda o que era.
   */
  exclusao: 'proibida' | 'definitiva'
  motivoExclusaoProibida?: string
  /** Rótulo curto do registro para o evento ("PGDAS-D · Metalúrgica Andrade"). */
  rotulo: (r: Tabelas[K]) => string
  alvo?: (r: Partial<Tabelas[K]>) => Alvo
  /** Devolve a mensagem de erro, ou `null` se está válido. */
  validar?: (r: Tabelas[K]) => string | null
  /** Ajusta ou recusa uma atualização (lança ErroRegra). Ex.: mensagem interna guarda a versão anterior. */
  antesDeAtualizar?: (antes: Tabelas[K], depois: Tabelas[K], ctx: Contexto) => Tabelas[K]
  /** Eventos desta entidade aparecem na linha do tempo (padrão: sim). */
  linhaDoTempo?: boolean
  /** Não registra evento (estado de tela, que muda a cada clique). */
  semEvento?: boolean
}

export interface OpcoesEscrita {
  ctx?: Contexto
  /** Ferramenta específica (transição de tarefa, por exemplo). */
  ferramenta?: string
  /** Frase do evento; sem ela, sai uma padrão ("Fernanda atualizou a tarefa X"). */
  texto?: string
  /** Pula a conferência de permissão: só para semente e migração. */
  semAutorizar?: boolean
}

export class Repositorio<K extends NomeTabela> {
  protected banco: () => Banco
  readonly regras: RegrasEntidade<K>

  constructor(banco: () => Banco, regras: RegrasEntidade<K>) {
    this.banco = banco
    this.regras = regras
  }

  get tabela(): K {
    return this.regras.tabela
  }

  /** Linhas não arquivadas (ou todas), na ordem manual e depois na de criação. */
  listar(filtro?: (r: Tabelas[K]) => boolean, opcoes: { arquivados?: boolean } = {}): Tabelas[K][] {
    return ordenar(this.banco().ler(this.tabela).filter((r) => (opcoes.arquivados || !r.arquivado_em) && (!filtro || filtro(r))))
  }

  obter(id: Id): Tabelas[K] | undefined {
    return this.banco().obter(this.tabela, id)
  }

  criar(dados: Novo<Tabelas[K]>, op: OpcoesEscrita = {}): Tabelas[K] {
    const b = this.banco()
    const quando = agora()
    const ultima = this.banco().ler(this.tabela).reduce((m, r) => Math.max(m, r.ordem ?? 0), 0)
    const linha = { ordem: ultima + 1, ...dados, id: dados.id ?? novoId(this.regras.prefixo), escritorio_id: b.escritorioId ?? '', criado_em: quando, atualizado_em: quando } as Tabelas[K]
    // Criar nunca sobrescreve: id que já existe é erro (no servidor, protege de id repetido vindo de fora).
    if (this.obter(linha.id)) throw new ErroRegra(`Já existe ${this.regras.artigo} com o id ${linha.id}.`, 'ID_EM_USO')
    this.validar(linha)
    const ctx = this.autorizar(op.ferramenta ?? this.regras.ferramentas.criar, linha, op)
    b.transacao((tx) => {
      tx.gravar(this.tabela, linha)
      this.evento(tx, ctx, 'criar', op.ferramenta ?? this.regras.ferramentas.criar, linha, op.texto ?? `${nomeDoAtor(ctx.ator)} criou ${this.regras.artigo} ${this.regras.rotulo(linha)}`)
    })
    return linha
  }

  atualizar(id: Id, patch: Partial<Tabelas[K]>, op: OpcoesEscrita = {}): Tabelas[K] {
    const antes = this.exigir(id)
    const ferramenta = op.ferramenta ?? this.regras.ferramentas.atualizar
    const ctx = this.autorizar(ferramenta, { ...antes, ...patch }, op)
    let depois = { ...antes, ...patch, id: antes.id, escritorio_id: antes.escritorio_id, criado_em: antes.criado_em, atualizado_em: agora() } as Tabelas[K]
    if (this.regras.antesDeAtualizar) depois = this.regras.antesDeAtualizar(antes, depois, ctx)
    this.validar(depois)
    this.banco().transacao((tx) => {
      tx.gravar(this.tabela, depois)
      this.evento(tx, ctx, acaoDe(ferramenta, 'atualizar'), ferramenta, depois, op.texto ?? `${nomeDoAtor(ctx.ator)} atualizou ${this.regras.artigo} ${this.regras.rotulo(depois)}`, camposMudados(antes, patch))
    })
    return depois
  }

  /**
   * Move para outra coluna (troca `campo` para `valor`) e põe na posição
   * `posicao` da coluna de destino. É o arrastar e soltar do quadro.
   */
  mover<C extends keyof Tabelas[K]>(id: Id, campo: C, valor: Tabelas[K][C], posicao?: number, op: OpcoesEscrita = {}): Tabelas[K] {
    const linha = this.exigir(id)
    const ferramenta = op.ferramenta ?? this.regras.ferramentas.mover ?? this.regras.ferramentas.atualizar
    const ctx = this.autorizar(ferramenta, { ...linha, [campo]: valor }, op)
    const coluna = this.listar((r) => r[campo] === valor && r.id !== id)
    const destino = Math.max(0, Math.min(posicao ?? coluna.length, coluna.length))
    const ordem = [...coluna.slice(0, destino), linha, ...coluna.slice(destino)]
    let movida = linha
    this.banco().transacao((tx) => {
      ordem.forEach((r, i) => {
        const nova = r.id === id ? ({ ...r, [campo]: valor, ordem: i + 1, atualizado_em: agora() } as Tabelas[K]) : r.ordem === i + 1 ? null : ({ ...r, ordem: i + 1 } as Tabelas[K])
        if (r.id === id) movida = nova!
        if (nova) tx.gravar(this.tabela, nova)
      })
      if (linha[campo] !== valor) this.evento(tx, ctx, acaoDe(ferramenta, 'mover'), ferramenta, movida, op.texto ?? `${nomeDoAtor(ctx.ator)} moveu ${this.regras.artigo} ${this.regras.rotulo(linha)}`, { [campo as string]: valor })
    })
    return movida
  }

  /** Grava a ordem manual de uma lista (ids na ordem nova). Sem evento na linha do tempo: é arrumação. */
  reordenar(ids: Id[], op: OpcoesEscrita = {}): void {
    const primeira = ids.length ? this.obter(ids[0]) : undefined
    if (!primeira) return
    this.autorizar(op.ferramenta ?? this.regras.ferramentas.reordenar ?? this.regras.ferramentas.atualizar, primeira, op)
    this.banco().transacao((tx) => {
      ids.forEach((id, i) => {
        const r = tx.obter(this.tabela, id)
        if (r && r.ordem !== i + 1) tx.gravar(this.tabela, { ...r, ordem: i + 1 })
      })
    })
  }

  arquivar(id: Id, op: OpcoesEscrita & { motivo?: string } = {}): Tabelas[K] {
    const antes = this.exigir(id)
    const ferramenta = op.ferramenta ?? this.regras.ferramentas.arquivar ?? this.regras.ferramentas.atualizar
    const ctx = this.autorizar(ferramenta, antes, op)
    const depois = { ...antes, arquivado_em: agora(), atualizado_em: agora() }
    this.banco().transacao((tx) => {
      tx.gravar(this.tabela, depois)
      this.evento(tx, ctx, 'arquivar', ferramenta, depois, op.texto ?? `${nomeDoAtor(ctx.ator)} arquivou ${this.regras.artigo} ${this.regras.rotulo(antes)}${op.motivo ? `: ${op.motivo}` : ''}`)
    })
    return depois
  }

  desarquivar(id: Id, op: OpcoesEscrita = {}): Tabelas[K] {
    const antes = this.exigir(id)
    const ferramenta = op.ferramenta ?? this.regras.ferramentas.arquivar ?? this.regras.ferramentas.atualizar
    const ctx = this.autorizar(ferramenta, antes, op)
    const depois = { ...antes, arquivado_em: null, atualizado_em: agora() }
    this.banco().transacao((tx) => {
      tx.gravar(this.tabela, depois)
      this.evento(tx, ctx, 'desarquivar', ferramenta, depois, `${nomeDoAtor(ctx.ator)} tirou do arquivo ${this.regras.artigo} ${this.regras.rotulo(antes)}`)
    })
    return depois
  }

  /** Exclui de vez, quando a regra deixa. Nunca acontece sozinho: a tela confirma antes. Devolve a linha (para desfazer). */
  excluir(id: Id, op: OpcoesEscrita & { motivo?: string } = {}): Tabelas[K] {
    if (this.regras.exclusao === 'proibida') throw new ErroRegra(this.regras.motivoExclusaoProibida ?? 'Isso não se apaga (Fundações R7). Arquive ou cancele com motivo.')
    const antes = this.exigir(id)
    const ferramenta = op.ferramenta ?? this.regras.ferramentas.excluir ?? this.regras.ferramentas.atualizar
    const ctx = this.autorizar(ferramenta, antes, op)
    this.banco().transacao((tx) => {
      tx.remover(this.tabela, id)
      this.evento(tx, ctx, 'excluir', ferramenta, antes, op.texto ?? `${nomeDoAtor(ctx.ator)} excluiu ${this.regras.artigo} ${this.regras.rotulo(antes)}${op.motivo ? `: ${op.motivo}` : ''}`, { excluido: this.regras.rotulo(antes) })
    })
    return antes
  }

  /** Desfazer: volta a linha ao que era (ou a recoloca, se foi excluída). O evento registra o desfazer. */
  reverter(anterior: Tabelas[K], op: OpcoesEscrita = {}): void {
    const ctx = this.autorizar(op.ferramenta ?? this.regras.ferramentas.atualizar, anterior, op)
    this.banco().transacao((tx) => {
      tx.gravar(this.tabela, { ...anterior, atualizado_em: agora() })
      this.evento(tx, ctx, 'desfazer', op.ferramenta ?? this.regras.ferramentas.atualizar, anterior, `${nomeDoAtor(ctx.ator)} desfez a última mudança em ${this.regras.artigo} ${this.regras.rotulo(anterior)}`)
    })
  }

  /** Desfazer uma criação (segundos depois, pelo toast). A criação e o desfazer ficam nos eventos. */
  desfazerCriacao(id: Id, op: OpcoesEscrita = {}): void {
    const linha = this.obter(id)
    if (!linha) return
    const ctx = this.autorizar(op.ferramenta ?? this.regras.ferramentas.criar, linha, op)
    this.banco().transacao((tx) => {
      tx.remover(this.tabela, id)
      this.evento(tx, ctx, 'desfazer', op.ferramenta ?? this.regras.ferramentas.criar, linha, `${nomeDoAtor(ctx.ator)} desfez a criação de ${this.regras.artigo} ${this.regras.rotulo(linha)}`)
    })
  }

  /** Pergunta sem efeito: a tela usa para mostrar ou esconder o botão. */
  pode(operacao: keyof RegrasEntidade<K>['ferramentas'], linha?: Partial<Tabelas[K]>, ctx: Contexto = contextoAtual()): boolean {
    if (operacao === 'excluir' && this.regras.exclusao === 'proibida') return false
    const nome = this.regras.ferramentas[operacao] ?? this.regras.ferramentas.atualizar
    return autorizar(ctx, nome, linha ? (this.regras.alvo?.(linha) ?? {}) : {}).permitido
  }

  protected exigir(id: Id): Tabelas[K] {
    const r = this.obter(id)
    if (!r) throw new ErroRegra(`Não encontrei ${this.regras.artigo} ${id}.`)
    return r
  }

  protected validar(r: Tabelas[K]) {
    const erro = this.regras.validar?.(r)
    if (erro) throw new ErroRegra(erro)
  }

  protected autorizar(ferramenta: string, linha: Partial<Tabelas[K]>, op: OpcoesEscrita): Contexto {
    const ctx = op.ctx ?? contextoAtual()
    if (op.semAutorizar) return ctx
    const d = autorizar(ctx, ferramenta, this.regras.alvo?.(linha) ?? {})
    if (!d.permitido) throw new ErroPermissao(ferramenta, d.motivo)
    // No servidor, "uma pessoa precisa aprovar" para a operação e vira cartão (Fundações 3.3).
    // No navegador do wireframe a demonstração segue como sempre seguiu.
    if (d.aprovacao && exigirAprovacao && !aprovadas.has(ferramenta)) throw new ErroAprovacao(ferramenta, d.motivo, this.regras.alvo?.(linha) ?? {})
    return ctx
  }

  protected evento(tx: Transacao, ctx: Contexto, acao: string, ferramenta: string, linha: Tabelas[K], texto: string, argumentos?: Record<string, unknown>) {
    if (this.regras.semEvento) return
    registrarEvento(tx, ctx, {
      nome: `${this.tabela}.${acao}`,
      ferramenta,
      resultado_ref: linha.id,
      texto,
      argumentos_resumo: argumentos,
      visivel_na_linha_do_tempo: this.regras.linhaDoTempo !== false,
      ...this.regras.alvo?.(linha),
    })
  }
}

/** Lançado quando a decisão de `autorizar` pede aprovação e o modo do servidor está ligado. */
export class ErroAprovacao extends Error {
  readonly ferramenta: string
  readonly alvo: Alvo
  constructor(ferramenta: string, motivo: string, alvo: Alvo) {
    super(motivo)
    this.ferramenta = ferramenta
    this.alvo = alvo
  }
}

let exigirAprovacao = false
let aprovadas: ReadonlySet<string> = new Set()
/**
 * Liga o cartão de aprovação (servidor). `jaAprovadas`: as ferramentas que um cartão
 * decidido por uma pessoa já liberou para esta execução.
 */
export function definirModoAprovacao(ligado: boolean, jaAprovadas: Iterable<string> = []) {
  exigirAprovacao = ligado
  aprovadas = new Set(jaAprovadas)
}

/** Grava um evento na transação (R2: todo efeito gera evento, na mesma transação). */
export function registrarEvento(tx: Transacao, ctx: Contexto, e: Partial<Evento> & Pick<Evento, 'nome' | 'ferramenta' | 'texto'>) {
  const quando = agora()
  const a = ctx.ator
  const evento: Evento = {
    id: novoId('ev'),
    escritorio_id: '',
    criado_em: quando,
    atualizado_em: quando,
    ator_tipo: a.tipo === 'pessoa' || a.tipo === 'pessoa_cliente' ? 'pessoa' : a.tipo,
    ator_id: idDoAtor(a),
    ator_nome: nomeDoAtor(a),
    usuario_dono_id: a.tipo === 'pessoa' ? a.perfil.usuario_id : a.tipo === 'integrante' ? (a.dono?.usuario_id ?? null) : null,
    nivel: 'executar',
    resultado: 'ok',
    origem: ctx.origem,
    visivel_na_linha_do_tempo: true,
    ...e,
  }
  tx.gravar('evento', evento)
}

const acaoDe = (ferramenta: string, padrao: string) => ferramenta.split('.').pop() ?? padrao

function camposMudados(antes: object, patch: object): Record<string, unknown> {
  const fora = new Set(['extras', 'corpo', 'versoes', 'valor'])
  const r: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(patch)) if (!fora.has(k) && (antes as Record<string, unknown>)[k] !== v && (typeof v !== 'object' || v === null)) r[k] = v
  return r
}

export function ordenar<T extends { ordem?: number; criado_em: string }>(linhas: T[]): T[] {
  return [...linhas].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0) || a.criado_em.localeCompare(b.criado_em))
}

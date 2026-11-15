import type { Banco } from '../banco/banco'
import type { BolaBpo, BpoConta, BpoItemFila, BpoLote, Id, NomeTabela, Tabelas } from '../modelo/entidades'
import { ErroRegra } from '../permissoes/autorizar'
import { idDoAtor, nomeDoAtor, type Contexto } from '../permissoes/perfil'
import { contextoAtual } from './contexto'
import { agora, novoId, registrarEvento, Repositorio, type OpcoesEscrita, type RegrasEntidade } from './repositorio'

/**
 * Repositórios do BPO (S08; subplano 10, 3.5 a 3.12 e 4). As regras que o
 * plano põe na função de autorização e não no costume ficam aqui:
 *
 * - B2. Quem digita não confere; quem altera a alçada de uma empresa não
 *   confere nem aprova pagamento nela (3.8).
 * - B3. Nenhum pagamento sai sem aprovação humana registrada: aprovar e
 *   liberar são da pessoa do cliente (no M1, ela libera no banco); integrante
 *   e sistema nunca aprovam nem liberam; lote expirado nunca paga (3.6).
 * - Faixas (3.7): até a faixa 1, uma conferência; acima, analista e gestor.
 *   Acima da faixa 2, a aprovação é reforçada (duas pessoas do cliente).
 */

const regras = <K extends NomeTabela>(r: RegrasEntidade<K>) => r
const porCliente = (r: { cliente_id?: Id | null }) => ({ cliente_id: r.cliente_id ?? null })
const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

/** Quem age é Gestor do BPO (gestão no setor) ou Administrador. */
export function ehGestorBpo(ctx: Contexto = contextoAtual()) {
  const a = ctx.ator
  if (a.tipo !== 'pessoa') return false
  return a.perfil.papel === 'administrador' || a.perfil.vinculos.some((v) => v.setor === 'bpo_financeiro' && v.modo === 'gestao')
}

const ehPessoaDoEscritorio = (ctx: Contexto) => ctx.ator.tipo === 'pessoa'

/* ---------- Contas a pagar e a receber (titular empresa) ---------- */

export class RepositorioContasBpo extends Repositorio<'bpo_conta'> {
  /** Faixas vigentes da empresa (a alçada aceita; sem ela, as de exemplo do plano). */
  faixas(clienteId: Id) {
    const vig = this.banco().ler('bpo_alcada').find((a) => a.cliente_id === clienteId && a.situacao === 'vigente')
    return { faixa1: vig?.faixa1 ?? 2_000, faixa2: vig?.faixa2 ?? 20_000 }
  }

  /** Quantas conferências a conta pede: faixa 1, uma; acima, analista e gestor (10, 3.7). */
  conferenciasNecessarias(c: BpoConta) {
    return c.valor > this.faixas(c.cliente_id).faixa1 ? 2 : 1
  }

  /** Motivo pelo qual o ator não pode conferir esta conta (ou null). Mesma regra da tela e da escrita. */
  motivoNaoConfere(c: BpoConta, ctx: Contexto = contextoAtual()): string | null {
    if (!ehPessoaDoEscritorio(ctx)) return 'Conferir é de uma pessoa do BPO: o integrante só prepara.'
    const eu = idDoAtor(ctx.ator)
    if (c.digitado_por_id && c.digitado_por_id === eu) return 'Você digitou esta conta: outra pessoa confere (segregação de funções).'
    if (c.conferencias.some((x) => x.id === eu)) return 'Você já conferiu esta conta: a segunda conferência é de outra pessoa.'
    const alterou = this.banco().ler('bpo_alcada').some((a) => a.cliente_id === c.cliente_id && (a.situacao === 'proposta' || a.situacao === 'vigente') && a.proposta_por_id === eu)
    if (alterou) return 'Você alterou as alçadas desta empresa: não confere nem aprova pagamentos nela.'
    const precisa = this.conferenciasNecessarias(c)
    if (precisa === 2 && c.conferencias.length === 1 && !ehGestorBpo(ctx) && !c.conferencias[0].gestor) return 'Acima da faixa 1, a segunda conferência é do Gestor do BPO.'
    return null
  }

  capturar(dados: Pick<BpoConta, 'cliente_id' | 'contraparte' | 'categoria' | 'valor' | 'vencimento' | 'origem'> & Partial<BpoConta>, op: OpcoesEscrita = {}) {
    const ctx = op.ctx ?? contextoAtual()
    return this.criar(
      { tipo: 'pagar', etapa: 'capturada', conferencias: [], digitado_por_id: idDoAtor(ctx.ator), digitado_por_nome: nomeDoAtor(ctx.ator), ...dados },
      { ...op, ferramenta: 'conta_pagar.capturar', texto: `${nomeDoAtor(ctx.ator)} lançou a conta ${dados.contraparte} (${brl(dados.valor)})` },
    )
  }

  conferir(id: Id, op: OpcoesEscrita = {}) {
    const ctx = op.ctx ?? contextoAtual()
    const c = this.exigir(id)
    if (c.etapa !== 'capturada') throw new ErroRegra('Esta conta já foi conferida.')
    const motivo = this.motivoNaoConfere(c, ctx)
    if (motivo) throw new ErroRegra(motivo)
    const conferencias = [...c.conferencias, { id: idDoAtor(ctx.ator), nome: nomeDoAtor(ctx.ator), gestor: ehGestorBpo(ctx), em: agora() }]
    const completa = conferencias.length >= this.conferenciasNecessarias(c)
    return this.atualizar(id, { conferencias, etapa: completa ? 'conferida' : 'capturada' }, { ...op, ferramenta: 'conta_pagar.conferir', texto: `${nomeDoAtor(ctx.ator)} conferiu ${c.contraparte} (${brl(c.valor)})${completa ? '' : ': falta a conferência do Gestor'}` })
  }

  /** BPO de uma pessoa (3.8): a conferência passa ao cliente, na aprovação. */
  clienteConfere(id: Id, op: OpcoesEscrita = {}) {
    const ctx = op.ctx ?? contextoAtual()
    const c = this.exigir(id)
    if (!ehGestorBpo(ctx)) throw new ErroRegra('Só o Gestor do BPO passa a conferência ao cliente.')
    const conferencias = [...c.conferencias, { id: null, nome: 'o cliente, na aprovação', gestor: false, em: agora() }]
    return this.atualizar(id, { conferencias, etapa: 'conferida', alerta: c.alerta ?? 'conferência pelo cliente na aprovação (BPO de uma pessoa)' }, { ...op, ferramenta: 'conta_pagar.conferir', texto: `${c.contraparte} vai ao cliente conferir na aprovação (BPO de uma pessoa)` })
  }

  porNoProximoLote(id: Id, op: OpcoesEscrita = {}) {
    const c = this.exigir(id)
    if (c.etapa !== 'conferida') throw new ErroRegra('Só conta conferida entra em lote (quem digitou não confere).')
    return this.atualizar(id, { etapa: 'em_lote' }, { ...op, ferramenta: 'pagamento_lote.montar', texto: `${c.contraparte} vai no próximo lote` })
  }

  tirarDoLote(id: Id, op: OpcoesEscrita = {}) {
    const c = this.exigir(id)
    return this.atualizar(id, { etapa: 'conferida', lote_id: null }, { ...op, ferramenta: 'pagamento_lote.montar', texto: `${c.contraparte} saiu do próximo lote` })
  }

  cancelar(id: Id, motivo: string, op: OpcoesEscrita = {}) {
    if (!motivo.trim()) throw new ErroRegra('Cancelar uma conta exige o motivo (nada se apaga).')
    const c = this.exigir(id)
    if (['aprovada', 'liberada', 'paga'].includes(c.etapa)) throw new ErroRegra('Conta aprovada ou paga não se cancela: estorne ou ajuste no ERP.')
    return this.atualizar(id, { etapa: 'cancelada', motivo }, { ...op, ferramenta: 'conta_pagar.cancelar', texto: `Cancelou a conta ${c.contraparte}: ${motivo}` })
  }

  /** A conciliação confirmou a baixa no extrato. */
  marcarPaga(id: Id, op: OpcoesEscrita = {}) {
    const c = this.exigir(id)
    if (c.etapa !== 'liberada' && c.tipo === 'pagar') throw new ErroRegra('Só conta liberada pelo cliente vira paga (a baixa vem do extrato).')
    return this.atualizar(id, { etapa: c.tipo === 'pagar' ? 'paga' : 'recebida' }, { ...op, ferramenta: c.tipo === 'pagar' ? 'conciliacao.confirmar' : 'conta_receber.baixar', texto: `Baixa de ${c.contraparte} confirmada no extrato` })
  }
}

/* ---------- Lote de pagamento: cartão no app do cliente ---------- */

export class RepositorioLotesBpo extends Repositorio<'bpo_lote'> {
  private contas: () => RepositorioContasBpo
  constructor(banco: () => Banco, r: RegrasEntidade<'bpo_lote'>, contas: () => RepositorioContasBpo) {
    super(banco, r)
    this.contas = contas
  }

  /** Monta o lote com as contas conferidas e manda o cartão ao cliente (10, 3.6). Só o Gestor do BPO. */
  montarEEnviar(clienteId: Id, contaIds: Id[], dados: { saldo: number; modo: 'M1' | 'M2' | 'M3'; expiraEm: string; podeAprovar: string[] }, op: OpcoesEscrita = {}) {
    const ctx = op.ctx ?? contextoAtual()
    const contas = contaIds.map((id) => this.contas().obter(id)).filter((c): c is BpoConta => !!c)
    if (!contas.length) throw new ErroRegra('O lote precisa de pelo menos uma conta conferida.')
    const naoConferida = contas.find((c) => c.etapa !== 'conferida' && c.etapa !== 'em_lote')
    if (naoConferida) throw new ErroRegra(`${naoConferida.contraparte} ainda não foi conferida: o cartão só sai com todas as contas conferidas.`)
    const total = contas.reduce((s, c) => s + c.valor, 0)
    const { faixa2 } = this.contas().faixas(clienteId)
    const id = novoId('lt')
    const cartaoId = `ca-${id}`
    const venc = [...contas].sort((a, b) => a.vencimento.localeCompare(b.vencimento))[0].vencimento
    const titulo = `Pagar ${contas.length} conta${contas.length > 1 ? 's' : ''} · vence ${venc.slice(8, 10)}/${venc.slice(5, 7)}`
    const conferiu = [...new Set(contas.flatMap((c) => c.conferencias.map((x) => x.nome)))].join(', ')
    const preparou = [...new Set(contas.map((c) => c.digitado_por_nome))].join(' e ')
    const lote = this.criar(
      { id, cliente_id: clienteId, titulo, conta_ids: contaIds, total, saldo: dados.saldo, expira_em: dados.expiraEm, situacao: 'aguardando', aprovacoes: [], removidos: [], preparado_por: preparou, conferido_por: conferiu, aprovadores_necessarios: total > faixa2 ? 2 : 1, modo_pagamento: dados.modo, cartao_id: cartaoId },
      { ...op, ferramenta: 'pagamento_lote.pedir_aprovacao', texto: `${nomeDoAtor(ctx.ator)} mandou ao cliente o lote “${titulo}” (${brl(total)})` },
    )
    this.banco().transacao((tx) => {
      const quando = agora()
      tx.gravar('cartao_aprovacao', {
        id: cartaoId,
        escritorio_id: this.banco().escritorioId ?? '',
        criado_em: quando,
        atualizado_em: quando,
        ferramenta: 'pagamento_lote.aprovar',
        argumentos: { lote_id: id, cliente_id: clienteId, total },
        resumo_humano: `${titulo} (${brl(total)})`,
        pedido_por_tipo: 'usuario',
        pedido_por_id: idDoAtor(ctx.ator),
        pode_aprovar: dados.podeAprovar,
        status: 'pendente',
        expira_em: dados.expiraEm,
      })
      for (const c of contas) tx.gravar('bpo_conta', { ...c, etapa: 'aguardando_cliente', lote_id: id, atualizado_em: quando })
    })
    return lote
  }

  private exigirCliente(ctx: Contexto, acao: string) {
    if (ctx.ator.tipo !== 'pessoa_cliente') throw new ErroRegra(`${acao} é decisão da pessoa do cliente, no app (nenhum pagamento sai sem aprovação humana registrada).`)
  }

  private decidirCartao(l: BpoLote, status: 'aprovado' | 'recusado' | 'editado_e_aprovado', ctx: Contexto, comentario?: string) {
    if (!l.cartao_id) return
    const c = this.banco().obter('cartao_aprovacao', l.cartao_id)
    if (!c || c.status !== 'pendente') return
    this.banco().transacao((tx) => tx.gravar('cartao_aprovacao', { ...c, status, decidido_por: nomeDoAtor(ctx.ator), decidido_em: agora(), comentario, atualizado_em: agora(), extras: { ...c.extras, decidido_por_nome: nomeDoAtor(ctx.ator) } }))
  }

  /** Aprovar (ou editar e aprovar, tirando contas). Registra quem, quando e por onde. */
  aprovar(id: Id, nome: string, removidos: Id[] = [], canal: 'app' | 'whatsapp' = 'app', op: OpcoesEscrita = {}) {
    const ctx = op.ctx ?? contextoAtual()
    this.exigirCliente(ctx, 'Aprovar')
    const l = this.exigir(id)
    if (l.situacao === 'expirado') throw new ErroRegra('Este cartão expirou: nunca paga. O escritório monta um lote novo.')
    if (l.situacao !== 'aguardando' && l.situacao !== 'parcial') throw new ErroRegra('Este lote já foi decidido.')
    if (l.aprovacoes.some((a) => a.nome === nome)) throw new ErroRegra('Você já aprovou este lote: falta a outra pessoa.')
    const fora = l.aprovacoes.length ? l.removidos : removidos
    const ficam = l.conta_ids.filter((c) => !fora.includes(c))
    if (!ficam.length) throw new ErroRegra('Tirou todas as contas: recuse o lote, com o motivo.')
    const total = ficam.reduce((s, c) => s + (this.contas().obter(c)?.valor ?? 0), 0)
    // S08c: lote com exceção (fornecedor novo, dados alterados, fracionamento...) vai à aprovação reforçada (10, 3.7, linha "Com exceção").
    const necessarios = total > this.contas().faixas(l.cliente_id).faixa2 || l.extras?.s08c_excecao ? 2 : 1
    const aprovacoes = [...l.aprovacoes, { nome, quando: agora(), canal }]
    const completo = aprovacoes.length >= necessarios
    const depois = this.atualizar(
      id,
      { aprovacoes, removidos: fora, total, aprovadores_necessarios: necessarios, situacao: completo ? 'aprovado' : 'parcial' },
      { ...op, ferramenta: 'pagamento_lote.aprovar', texto: `${nome} aprovou${fora.length ? ' com edição' : ''} o lote “${l.titulo}” (${brl(total)}) ${canal === 'whatsapp' ? 'pelo WhatsApp, com código' : 'no app'}${completo ? '' : ': falta a segunda aprovação'}` },
    )
    this.banco().transacao((tx) => {
      for (const cid of l.conta_ids) {
        const c = tx.obter('bpo_conta', cid)
        if (!c) continue
        if (fora.includes(cid)) tx.gravar('bpo_conta', { ...c, etapa: 'conferida', lote_id: null, alerta: `tirada do lote por ${nome}`, atualizado_em: agora() })
        else if (completo) tx.gravar('bpo_conta', { ...c, etapa: l.modo_pagamento === 'M2' ? 'liberada' : 'aprovada', atualizado_em: agora() })
      }
    })
    if (completo) this.decidirCartao(l, fora.length ? 'editado_e_aprovado' : 'aprovado', ctx)
    return depois
  }

  recusar(id: Id, nome: string, motivo: string, op: OpcoesEscrita = {}) {
    const ctx = op.ctx ?? contextoAtual()
    this.exigirCliente(ctx, 'Recusar')
    if (!motivo.trim()) throw new ErroRegra('Recusar exige o motivo.')
    const l = this.exigir(id)
    if (l.situacao !== 'aguardando' && l.situacao !== 'parcial') throw new ErroRegra('Este lote já foi decidido.')
    const depois = this.atualizar(id, { situacao: 'recusado', motivo, aprovacoes: [...l.aprovacoes, { nome, quando: agora(), canal: 'app' }] }, { ...op, ferramenta: 'pagamento_lote.aprovar', texto: `${nome} recusou o lote “${l.titulo}”: ${motivo}` })
    this.banco().transacao((tx) => {
      for (const cid of l.conta_ids) {
        const c = tx.obter('bpo_conta', cid)
        if (c) tx.gravar('bpo_conta', { ...c, etapa: 'recusada', motivo, atualizado_em: agora() })
      }
    })
    this.decidirCartao(l, 'recusado', ctx, motivo)
    return depois
  }

  /** M1: "Já liberei no banco". Só a pessoa do cliente, só depois de aprovado (B3). */
  liberar(id: Id, nome: string, op: OpcoesEscrita = {}) {
    const ctx = op.ctx ?? contextoAtual()
    this.exigirCliente(ctx, 'Liberar no banco')
    const l = this.exigir(id)
    if (l.situacao !== 'aprovado') throw new ErroRegra('Só lote aprovado é liberado no banco.')
    const depois = this.atualizar(id, { situacao: 'liberado' }, { ...op, ferramenta: 'pagamento.liberar', texto: `${nome} liberou no banco o lote “${l.titulo}”; a conciliação confirma a baixa` })
    this.banco().transacao((tx) => {
      for (const cid of l.conta_ids.filter((c) => !l.removidos.includes(c))) {
        const c = tx.obter('bpo_conta', cid)
        if (c) tx.gravar('bpo_conta', { ...c, etapa: 'liberada', atualizado_em: agora() })
      }
    })
    return depois
  }

  /** O cartão expirou sem resposta: nunca paga; as contas voltam para um lote novo (3.6). */
  expirar(id: Id, op: OpcoesEscrita = {}) {
    const l = this.exigir(id)
    if (l.situacao !== 'aguardando' && l.situacao !== 'parcial') return l
    const depois = this.atualizar(id, { situacao: 'expirado' }, { ...op, ferramenta: 'pagamento_lote.pedir_aprovacao', texto: `O cartão “${l.titulo}” expirou sem resposta: nada foi pago; alerta ao Gestor do BPO e ao sócio` })
    this.banco().transacao((tx) => {
      for (const cid of l.conta_ids) {
        const c = tx.obter('bpo_conta', cid)
        if (c) tx.gravar('bpo_conta', { ...c, etapa: 'conferida', lote_id: null, alerta: 'cartão expirou sem aprovação: vai num lote novo', atualizado_em: agora() })
      }
      if (l.cartao_id) {
        const ca = tx.obter('cartao_aprovacao', l.cartao_id)
        if (ca && ca.status === 'pendente') tx.gravar('cartao_aprovacao', { ...ca, status: 'expirado', atualizado_em: agora() })
      }
    })
    return depois
  }

  /** Recusado: as contas voltam para conferir de novo, com o motivo do cliente. */
  refazer(id: Id, op: OpcoesEscrita = {}) {
    const l = this.exigir(id)
    this.banco().transacao((tx) => {
      for (const cid of l.conta_ids) {
        const c = tx.obter('bpo_conta', cid)
        if (c && c.etapa === 'recusada') tx.gravar('bpo_conta', { ...c, etapa: 'conferida', lote_id: null, alerta: `cliente recusou: ${l.motivo ?? ''}`, atualizado_em: agora() })
      }
    })
    return this.arquivar(id, { ...op, ferramenta: 'pagamento_lote.montar', texto: `Lote “${l.titulo}” refeito: as contas voltaram para o próximo lote com o motivo do cliente` })
  }
}

/* ---------- Alçada: proposta pelo escritório, vale com o aceite do sócio no app ---------- */

export class RepositorioAlcadasBpo extends Repositorio<'bpo_alcada'> {
  vigente(clienteId: Id) {
    return this.listar((a) => a.cliente_id === clienteId && a.situacao === 'vigente')[0]
  }
  proposta(clienteId: Id) {
    return this.listar((a) => a.cliente_id === clienteId && a.situacao === 'proposta')[0]
  }

  propor(clienteId: Id, dados: { faixa1: number; faixa2: number; janela: string; pessoas: Record<string, number>; extras?: Record<string, unknown> }, op: OpcoesEscrita = {}) {
    const ctx = op.ctx ?? contextoAtual()
    if (dados.faixa1 <= 0 || dados.faixa2 <= dados.faixa1) throw new ErroRegra('A faixa 2 precisa ser maior que a faixa 1.')
    const antiga = this.proposta(clienteId)
    if (antiga) this.atualizar(antiga.id, { situacao: 'substituida' }, { ...op, ferramenta: 'alcada.alterar', texto: 'Proposta anterior de alçadas substituída' })
    return this.criar(
      { cliente_id: clienteId, situacao: 'proposta', ...dados, proposta_por_id: idDoAtor(ctx.ator), proposta_por_nome: nomeDoAtor(ctx.ator) },
      { ...op, ferramenta: 'alcada.alterar', texto: `${nomeDoAtor(ctx.ator)} propôs novas alçadas (faixa 1 até ${brl(dados.faixa1)}, faixa 2 até ${brl(dados.faixa2)}): valem com o aceite do sócio no app` },
    )
  }

  /** O sócio aceita no app: vira a vigente e a alçada de cada pessoa vai para a ficha (o contato). */
  aceitar(id: Id, quem: string, op: OpcoesEscrita = {}) {
    const ctx = op.ctx ?? contextoAtual()
    if (ctx.ator.tipo !== 'pessoa_cliente') throw new ErroRegra('O aceite das alçadas é do sócio, no app.')
    const p = this.exigir(id)
    if (p.situacao !== 'proposta') throw new ErroRegra('Esta proposta já foi decidida.')
    const antiga = this.vigente(p.cliente_id)
    if (antiga) this.atualizar(antiga.id, { situacao: 'substituida' }, { ...op, ferramenta: 'alcada.aceitar', texto: 'Alçadas anteriores substituídas' })
    const depois = this.atualizar(id, { situacao: 'vigente', aceito_por: quem, aceito_em: agora() }, { ...op, ferramenta: 'alcada.aceitar', texto: `${quem} aceitou as novas alçadas no app` })
    // Modo de pagamento proposto junto com a alçada também só vale com o aceite (10, 3.8).
    const modo = p.extras?.modo_pagamento as 'M1' | 'M2' | undefined
    const perfil = this.banco().ler('bpo_perfil').find((x) => x.cliente_id === p.cliente_id)
    if (modo && perfil) this.banco().transacao((tx) => tx.gravar('bpo_perfil', { ...perfil, modo_pagamento: modo, teto_m2: (p.extras?.teto_m2 as number | undefined) ?? perfil.teto_m2 ?? null, atualizado_em: agora() }))
    const cliente = this.banco().obter('cliente', p.cliente_id)
    const ficha = cliente?.extras?.ficha as { contatos?: { nome: string; alcadaPagamento?: number; reforcada?: boolean }[] } | undefined
    if (cliente && ficha?.contatos)
      this.banco().transacao((tx) =>
        tx.gravar('cliente', { ...cliente, atualizado_em: agora(), extras: { ...cliente.extras, ficha: { ...ficha, contatos: ficha.contatos!.map((c) => aplicarReforcadaS08c(p.extras, c.nome, p.pessoas[c.nome] !== undefined ? { ...c, alcadaPagamento: p.pessoas[c.nome] || undefined } : c)) } } }),
      )
    return depois
  }

  recusar(id: Id, quem: string, op: OpcoesEscrita = {}) {
    const ctx = op.ctx ?? contextoAtual()
    if (ctx.ator.tipo !== 'pessoa_cliente') throw new ErroRegra('Recusar as alçadas é do sócio, no app.')
    return this.atualizar(id, { situacao: 'recusada', aceito_por: quem, aceito_em: agora() }, { ...op, ferramenta: 'alcada.aceitar', texto: `${quem} recusou a proposta de alçadas: as de antes continuam valendo` })
  }

  retirar(id: Id, op: OpcoesEscrita = {}) {
    return this.atualizar(id, { situacao: 'retirada' }, { ...op, ferramenta: 'alcada.alterar', texto: 'Proposta de alçadas retirada' })
  }
}

/** S08c: a proposta de alçada leva também quem entra na aprovação reforçada (`extras.reforcada`); vale com o aceite. */
function aplicarReforcadaS08c<T extends { reforcada?: boolean }>(extras: Record<string, unknown> | undefined, nome: string, c: T): T {
  const r = extras?.reforcada as Record<string, boolean> | undefined
  return r && r[nome] !== undefined ? { ...c, reforcada: r[nome] } : c
}

/* ---------- Fila: pedidos e pendências, com a bola e o SLA ---------- */

const rotuloBola: Record<BolaBpo, string> = { bpo: 'o BPO', cliente: 'o cliente', contratante: 'o contratante', cliente_final: 'o cliente final', terceiro: 'um terceiro' }

export class RepositorioFilaBpo extends Repositorio<'bpo_item_fila'> {
  /** BPO-009: o pedido entra com o que falta; o SLA só começa quando fica completo. */
  criarPedido(dados: Omit<BpoItemFila, 'id' | 'escritorio_id' | 'criado_em' | 'atualizado_em' | 'situacao' | 'sla_inicio'>, op: OpcoesEscrita = {}) {
    const ctx = op.ctx ?? contextoAtual()
    const completo = dados.faltando.length === 0
    return this.criar(
      { ...dados, situacao: 'aberto', sla_inicio: completo ? agora() : null, bola: completo ? dados.bola : dados.subinquilino_id ? 'contratante' : 'cliente' },
      { ...op, ferramenta: 'fila.criar', texto: `${nomeDoAtor(ctx.ator)} abriu o pedido “${dados.texto}”${completo ? '' : ` (falta: ${dados.faltando.join(', ')})`}` },
    )
  }

  completar(id: Id, item: string, op: OpcoesEscrita = {}) {
    const f = this.exigir(id)
    const faltando = f.faltando.filter((x) => x !== item)
    return this.atualizar(id, { faltando, ...(faltando.length === 0 ? { sla_inicio: agora(), bola: 'bpo' as const } : {}) }, { ...op, ferramenta: 'fila.atualizar', texto: `Chegou “${item}” para “${f.texto}”${faltando.length ? '' : ': pedido completo, o SLA começou'}` })
  }

  passarBola(id: Id, para: BolaBpo, motivo: string, op: OpcoesEscrita = {}) {
    const f = this.exigir(id)
    if (f.bola === para) return f
    return this.atualizar(id, { bola: para }, { ...op, ferramenta: 'fila.passar_bola', texto: `A bola de “${f.texto}” passou para ${rotuloBola[para]}${motivo ? `: ${motivo}` : ''}${para === 'bpo' ? ' (o SLA volta a correr)' : ' (o SLA pausa)'}` })
  }

  reatribuir(id: Id, nome: string, op: OpcoesEscrita = {}) {
    const f = this.exigir(id)
    return this.atualizar(id, { responsavel_nome: nome }, { ...op, ferramenta: 'fila.reatribuir', texto: `“${f.texto}” foi para ${nome}` })
  }

  resolver(id: Id, op: OpcoesEscrita = {}) {
    const f = this.exigir(id)
    if (f.faltando.length) throw new ErroRegra(`Ainda falta: ${f.faltando.join(', ')}.`)
    return this.atualizar(id, { situacao: 'resolvido' }, { ...op, ferramenta: 'fila.atualizar', texto: `Resolvido: ${f.texto}` })
  }

  reabrir(id: Id, op: OpcoesEscrita = {}) {
    return this.atualizar(id, { situacao: 'aberto' }, { ...op, ferramenta: 'fila.atualizar' })
  }
}

/* ---------- Os repositórios do BPO ---------- */

export function criarReposBpo(b: () => Banco) {
  const contas: RepositorioContasBpo = new RepositorioContasBpo(
    b,
    regras({
      tabela: 'bpo_conta',
      prefixo: 'bc',
      artigo: 'a conta',
      ferramentas: { criar: 'conta_pagar.capturar', atualizar: 'conta_pagar.capturar' },
      exclusao: 'proibida',
      motivoExclusaoProibida: 'Conta não se apaga: cancele com motivo, ou estorne (R7).',
      rotulo: (r) => `${r.contraparte} (${brl(r.valor)})`,
      alvo: porCliente,
      validar: (r) => (!r.contraparte.trim() ? 'Informe o fornecedor ou o cliente.' : !(r.valor > 0) ? 'O valor precisa ser maior que zero.' : !r.vencimento ? 'Informe o vencimento.' : null),
    }),
  )
  return {
    configuracao: new Repositorio(b, regras({ tabela: 'bpo_configuracao', prefixo: 'bcf', artigo: 'a configuração do BPO', ferramentas: { criar: 'bpo.audit_pesos', atualizar: 'bpo.audit_pesos' }, exclusao: 'proibida', rotulo: () => 'pesos da auditoria' })),
    perfis: new Repositorio(
      b,
      regras({
        tabela: 'bpo_perfil',
        prefixo: 'bp',
        artigo: 'o perfil BPO de',
        ferramentas: { criar: 'bpo.onboarding', atualizar: 'bpo.perfil.editar' },
        exclusao: 'proibida',
        motivoExclusaoProibida: 'O serviço BPO não se apaga: encerre com o offboarding (10, 3.14).',
        rotulo: (r) => String(b().obter('cliente', r.cliente_id)?.nome ?? r.cliente_id),
        alvo: porCliente,
        validar: (r) => (r.caixa_minimo < 0 ? 'O caixa mínimo não pode ser negativo.' : !r.analista_nome ? 'Escolha o analista.' : null),
      }),
    ),
    conexoes: new Repositorio(b, regras({ tabela: 'bpo_conexao_erp', prefixo: 'bx', artigo: 'a conexão de ERP de', ferramentas: { criar: 'erp.conectar', atualizar: 'erp.conectar' }, exclusao: 'proibida', rotulo: (r) => r.provedor, alvo: porCliente })),
    bancos: new Repositorio(b, regras({ tabela: 'bpo_conta_bancaria', prefixo: 'bb', artigo: 'a conta bancária', ferramentas: { criar: 'banco.conectar', atualizar: 'banco.conectar', arquivar: 'banco.conectar' }, exclusao: 'proibida', rotulo: (r) => r.nome, alvo: porCliente })),
    fornecedores: new Repositorio(
      b,
      regras({ tabela: 'bpo_fornecedor', prefixo: 'bf', artigo: 'o fornecedor', ferramentas: { criar: 'fornecedor.criar', atualizar: 'fornecedor.alterar_dados_bancarios' }, exclusao: 'proibida', rotulo: (r) => r.nome, alvo: porCliente, validar: (r) => (r.nome.trim() ? null : 'Informe o nome do fornecedor.') }),
    ),
    contas,
    lotes: new RepositorioLotesBpo(
      b,
      regras({ tabela: 'bpo_lote', prefixo: 'lt', artigo: 'o lote', ferramentas: { criar: 'pagamento_lote.pedir_aprovacao', atualizar: 'pagamento_lote.pedir_aprovacao', arquivar: 'pagamento_lote.montar' }, exclusao: 'proibida', motivoExclusaoProibida: 'Lote não se apaga: a aprovação é a trilha do pagamento.', rotulo: (r) => r.titulo, alvo: porCliente }),
      () => contas,
    ),
    alcadas: new RepositorioAlcadasBpo(b, regras({ tabela: 'bpo_alcada', prefixo: 'ba', artigo: 'a alçada', ferramentas: { criar: 'alcada.alterar', atualizar: 'alcada.alterar' }, exclusao: 'proibida', motivoExclusaoProibida: 'Alçada é versionada: a anterior fica no histórico.', rotulo: (r) => `faixas ${brl(r.faixa1)} e ${brl(r.faixa2)}`, alvo: porCliente })),
    fila: new RepositorioFilaBpo(b, regras({ tabela: 'bpo_item_fila', prefixo: 'bq', artigo: 'o item', ferramentas: { criar: 'fila.criar', atualizar: 'fila.atualizar' }, exclusao: 'proibida', motivoExclusaoProibida: 'Item da fila não se apaga: resolva (o SLA conta o histórico).', rotulo: (r) => r.texto, alvo: porCliente, validar: (r) => (r.texto.trim() ? null : 'Descreva o pedido.') })),
    rotinas: new Repositorio(
      b,
      regras({ tabela: 'bpo_rotina', prefixo: 'br', artigo: 'a rotina', ferramentas: { criar: 'rotina.configurar', atualizar: 'rotina.configurar', excluir: 'rotina.configurar', reordenar: 'rotina.configurar' }, exclusao: 'definitiva', rotulo: (r) => r.nome, alvo: porCliente, validar: (r) => (r.nome.trim() ? null : 'Dê um nome à rotina.') }),
    ),
    transacoes: new Repositorio(b, regras({ tabela: 'bpo_transacao', prefixo: 'bt', artigo: 'a transação', ferramentas: { criar: 'erp.sincronizar', atualizar: 'conciliacao.confirmar' }, exclusao: 'proibida', rotulo: (r) => r.descricao, alvo: porCliente })),
    entregas: new Repositorio(b, regras({ tabela: 'bpo_entrega', prefixo: 'be', artigo: 'a entrega', ferramentas: { criar: 'bpo.relatorio_mensal', atualizar: 'bpo.relatorio_mensal' }, exclusao: 'proibida', rotulo: (r) => `${r.tipo} ${r.competencia}`, alvo: porCliente })),
    volumes: new Repositorio(b, regras({ tabela: 'bpo_volume', prefixo: 'bv', artigo: 'o extrato de volume', ferramentas: { criar: 'bpo.volume.contestar', atualizar: 'bpo.volume.contestar' }, exclusao: 'proibida', rotulo: (r) => `volume ${r.competencia}`, alvo: porCliente })),
    subinquilinos: new Repositorio(b, regras({ tabela: 'subinquilino', prefixo: 'sb', artigo: 'o contratante', ferramentas: { criar: 'bpo.contratante.configurar', atualizar: 'bpo.contratante.configurar' }, exclusao: 'proibida', motivoExclusaoProibida: 'Contratante não se apaga: encerre pela saída (BPO-019).', rotulo: (r) => r.nome })),
    convidados: new Repositorio(
      b,
      regras({ tabela: 'bpo_convidado', prefixo: 'bg', artigo: 'o convidado', ferramentas: { criar: 'bpo.convidado.convidar', atualizar: 'bpo.convidado.convidar' }, exclusao: 'proibida', motivoExclusaoProibida: 'Convidado não se apaga: desative.', rotulo: (r) => r.nome, validar: (r) => (!r.nome.trim() ? 'Informe o nome.' : !/^\S+@\S+\.\S+$/.test(r.email) ? 'E-mail inválido.' : null) }),
    ),
  }
}

export type ReposBpo = ReturnType<typeof criarReposBpo>

/** Evento avulso do BPO (lembrete, abrir no ERP), com o cliente para a linha do tempo dele. */
export function eventoBpo(banco: Banco, texto: string, clienteId?: Id | null, ferramenta = 'bpo.ler', ctx: Contexto = contextoAtual()) {
  banco.transacao((tx) => registrarEvento(tx, ctx, { nome: 'bpo.atividade', ferramenta, texto, cliente_id: clienteId ?? null, setor_id: 'bpo_financeiro' }))
}

export type LinhaBpo<K extends NomeTabela> = Tabelas[K]

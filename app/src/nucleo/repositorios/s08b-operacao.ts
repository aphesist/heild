import { banco } from '../banco'
import type { Banco } from '../banco/banco'
import type { BpoDocumento, BpoEntrega, BpoItemFila, BpoTransacao, ChecagemDocumentoBpo, Id, LeituraDocumentoBpo } from '../modelo/entidades'
import { ErroRegra } from '../permissoes/autorizar'
import { nomeDoAtor, type Contexto } from '../permissoes/perfil'
import { ehGestorBpo } from './bpo'
import { contextoAtual } from './contexto'
import { repos } from './index'
import { registrarEvento, Repositorio, type OpcoesEscrita, type RegrasEntidade } from './repositorio'

/**
 * S08b · A operação do BPO (Fila e Rotinas; subplano 10, 3.0, 3.5, 3.10 e
 * 4.3) sobre o banco. Só acrescenta aos repositórios da S08, sem mexer neles:
 *
 * - Documentos que chegam (boleto, nota, comprovante): o integrante lê e checa
 *   (rascunhar); uma pessoa lança a conta, anexa a um pedido ou descarta com
 *   motivo. Dados bancários diferentes do cadastro nunca viram conta sem a
 *   marca de "confirmar por segundo canal" (10, 3.13).
 * - Fila: anotação, cobrança de quem está com a bola e reabrir com motivo.
 * - Conciliação: no modo API (E1) a baixa vai ao ERP como comando e é relida;
 *   no modo arquivo (E2) fica em "lançar no ERP" e a baixa manual conta no
 *   SLA com a marca "manual" (10, 3.0).
 * - Fechamento do mês: só com o extrato conciliado, as baixas lançadas, as
 *   contas conferidas e o rascunho do Gerencial aprovado; fecha o Gestor do
 *   BPO; reabrir só o Administrador, com motivo (10, 3.10).
 */

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
const regras = <K extends 'bpo_documento'>(r: RegrasEntidade<K>) => r

/** O "hoje" da demonstração do BPO (DECISOES, S08): registros da operação levam o dia 18/11 com a hora do relógio. */
const HOJE_BPO = '2026-11-18'
export function agoraDemo() {
  const h = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })
  return `${HOJE_BPO}T${h}:00-03:00`
}

export type SituacaoBaixa = 'erp' | 'manual_pendente' | 'manual_feita' | 'nativo'

/** Último dia da competência ("2026-10" → "2026-10-31"). */
export function fimDaCompetencia(competencia: string) {
  const [a, m] = competencia.split('-').map(Number)
  return new Date(Date.UTC(a, m, 0)).toISOString().slice(0, 10)
}

/* ---------- Documentos ---------- */

export class RepositorioDocumentosBpo extends Repositorio<'bpo_documento'> {
  /** Checagens da captura contra o que a empresa já tem (10, 3.5 e 3.13). */
  checar(clienteId: Id, l: LeituraDocumentoBpo, ignorarDocId?: Id): ChecagemDocumentoBpo[] {
    const b = this.banco()
    const r: ChecagemDocumentoBpo[] = []
    const contas = b.ler('bpo_conta').filter((c) => c.cliente_id === clienteId && c.tipo === 'pagar' && c.etapa !== 'cancelada')
    const dup = contas.find((c) => c.contraparte.toLowerCase() === l.fornecedor.toLowerCase() && Math.abs(c.valor - l.valor) < 0.01 && c.vencimento === l.vencimento)
    const docDup = b.ler('bpo_documento').find((d) => d.id !== ignorarDocId && d.cliente_id === clienteId && d.situacao === 'lancado' && d.leitura && d.leitura.codigo_barras && d.leitura.codigo_barras === l.codigo_barras)
    if (dup || docDup) r.push({ tipo: 'duplicidade', texto: `Parece duplicada: já existe ${l.fornecedor} de ${brl(l.valor)} com vencimento ${l.vencimento.slice(8, 10)}/${l.vencimento.slice(5, 7)}` })
    const f = b.ler('bpo_fornecedor').find((x) => x.cliente_id === clienteId && x.nome.toLowerCase() === l.fornecedor.toLowerCase())
    if (!f) r.push({ tipo: 'fornecedor_novo', texto: `Fornecedor novo: ${l.fornecedor}. Os dados bancários só valem confirmados por segundo canal` })
    else if (l.banco && f.banco && !f.banco.toLowerCase().includes(l.banco.toLowerCase()) && !l.banco.toLowerCase().includes(f.banco.toLowerCase()))
      r.push({ tipo: 'dados_bancarios', texto: `Dados bancários diferentes do cadastro (${f.banco} no cadastro, ${l.banco} no documento): confirmar com o cliente por segundo canal` })
    const doFornecedor = contas.filter((c) => c.contraparte.toLowerCase() === l.fornecedor.toLowerCase())
    if (doFornecedor.length) {
      const media = doFornecedor.reduce((s, c) => s + c.valor, 0) / doFornecedor.length
      if (l.valor > media * 2) r.push({ tipo: 'valor_fora_padrao', texto: `Valor fora do padrão: ${brl(l.valor)}, a média de ${l.fornecedor} é ${brl(media)}` })
    }
    return r.length ? r : [{ tipo: 'ok', texto: 'Nada chamou atenção: fornecedor conhecido, sem duplicidade, dados bancários iguais ao cadastro' }]
  }

  receber(dados: Pick<BpoDocumento, 'cliente_id' | 'nome_arquivo' | 'tipo_documento' | 'canal' | 'remetente'> & Partial<BpoDocumento>, op: OpcoesEscrita = {}) {
    return this.criar({ situacao: 'recebido', checagens: [], recebido_em: agoraDemo(), ...dados }, { ...op, ferramenta: 'documento_bpo.receber', texto: `Chegou ${dados.nome_arquivo} de ${dados.remetente} (${dados.canal === 'whatsapp' ? 'WhatsApp' : dados.canal === 'email' ? 'e-mail' : dados.canal === 'dda' ? 'DDA' : 'app'})` })
  }

  /** O integrante (ou uma pessoa) leu o documento: grava a leitura e as checagens. Nada sai daqui. */
  registrarLeitura(id: Id, leitura: LeituraDocumentoBpo, op: OpcoesEscrita = {}) {
    const ctx = op.ctx ?? contextoAtual()
    const d = this.exigir(id)
    if (d.situacao !== 'recebido' && d.situacao !== 'lido') throw new ErroRegra('Este documento já foi tratado.')
    const checagens = this.checar(d.cliente_id, leitura, id)
    return this.atualizar(id, { situacao: 'lido', leitura, checagens, lido_por: nomeDoAtor(ctx.ator) }, { ...op, ferramenta: 'conta_pagar.ler_documento', texto: `${nomeDoAtor(ctx.ator)} leu ${d.nome_arquivo}: ${leitura.fornecedor}, ${brl(leitura.valor)}, vence ${leitura.vencimento.slice(8, 10)}/${leitura.vencimento.slice(5, 7)}${checagens[0].tipo === 'ok' ? '' : ` (${checagens.length} ponto${checagens.length > 1 ? 's' : ''} de atenção)`}` })
  }

  /**
   * Lança a conta a partir da leitura (com os ajustes de quem revisou). Quem
   * lança é quem digitou: outra pessoa confere em Aprovações (B2). Duplicidade
   * só passa com o motivo de quem confirmou que é outra cobrança.
   */
  lancar(id: Id, opcoes: { ajuste?: Partial<LeituraDocumentoBpo>; confirmarDuplicidade?: string } = {}, op: OpcoesEscrita = {}) {
    const ctx = op.ctx ?? contextoAtual()
    const d = this.exigir(id)
    if (d.situacao === 'lancado') throw new ErroRegra('A conta deste documento já foi lançada.')
    if (d.situacao === 'descartado') throw new ErroRegra('Documento descartado: não vira conta.')
    if (!d.leitura) throw new ErroRegra('Leia o documento antes de lançar (o integrante lê e checa).')
    const l = { ...d.leitura, ...opcoes.ajuste }
    if (!l.fornecedor.trim() || !(l.valor > 0) || !l.vencimento) throw new ErroRegra('Fornecedor, valor e vencimento são obrigatórios.')
    const checagens = this.checar(d.cliente_id, l, id)
    const dup = checagens.find((c) => c.tipo === 'duplicidade')
    if (dup && !opcoes.confirmarDuplicidade?.trim()) throw new ErroRegra(`${dup.texto}. Descarte o documento ou diga por que é outra cobrança.`)
    const b = this.banco()
    const conexao = b.ler('bpo_conexao_erp').find((x) => x.cliente_id === d.cliente_id)
    const modo = conexao?.modo ?? 'E3'
    const forn = b.ler('bpo_fornecedor').find((x) => x.cliente_id === d.cliente_id && x.nome.toLowerCase() === l.fornecedor.toLowerCase())
    if (!forn) repos.bpo.fornecedores.criar({ cliente_id: d.cliente_id, nome: l.fornecedor, documento: l.documento ?? undefined, banco: l.banco ? `${l.banco} (do documento, a confirmar por segundo canal)` : 'a confirmar por segundo canal', risco: 'novo' }, { ctx })
    else if (checagens.some((c) => c.tipo === 'dados_bancarios') && forn.risco !== 'alterado') repos.bpo.fornecedores.atualizar(forn.id, { risco: 'alterado' }, { ctx, ferramenta: 'fornecedor.criar', texto: `${l.fornecedor}: dados bancários do documento diferentes do cadastro (confirmar por segundo canal)` })
    const alerta = checagens.filter((c) => c.tipo === 'fornecedor_novo' || c.tipo === 'dados_bancarios' || c.tipo === 'valor_fora_padrao').map((c) => c.texto.split(':')[0].toLowerCase())
    const conta = repos.bpo.contas.capturar(
      {
        cliente_id: d.cliente_id,
        contraparte: l.fornecedor,
        categoria: l.categoria,
        valor: l.valor,
        vencimento: l.vencimento,
        origem: d.canal === 'whatsapp' ? 'WhatsApp' : d.canal === 'email' ? 'e-mail' : d.canal === 'dda' ? 'DDA' : 'app',
        alerta: alerta.length ? `${alerta.join('; ')}: confirmar antes do lote` : dup ? `possível duplicidade conferida: ${opcoes.confirmarDuplicidade}` : null,
        lancar_no_erp: modo === 'E2',
        extras: { documento_id: id },
      },
      { ctx },
    )
    b.transacao((tx) =>
      registrarEvento(tx, ctx, {
        nome: 'bpo.atividade',
        ferramenta: 'erp.lancar',
        texto: modo === 'E1' ? `Conta ${l.fornecedor} criada no ${conexao?.provedor} por comando (erp.lancar) e relida no espelho` : modo === 'E2' ? `Conta ${l.fornecedor} em “lançar no ERP”: o ${conexao?.provedor} não aceita escrita (modo arquivo)` : `Conta ${l.fornecedor} lançada no livro próprio`,
        cliente_id: d.cliente_id,
        setor_id: 'bpo_financeiro',
        resultado_ref: conta.id,
      }),
    )
    this.atualizar(id, { situacao: 'lancado', leitura: l, checagens, conta_id: conta.id, lancado_por: nomeDoAtor(ctx.ator) }, { ...op, ferramenta: 'conta_pagar.capturar', texto: `${nomeDoAtor(ctx.ator)} lançou a conta de ${d.nome_arquivo}: outra pessoa confere` })
    return conta
  }

  /** Anexa ao pedido da fila: completa o que faltava (boleto ou nota, valor) e o SLA começa se ficar completo. */
  anexar(id: Id, filaId: Id, op: OpcoesEscrita = {}) {
    const ctx = op.ctx ?? contextoAtual()
    const d = this.exigir(id)
    let f = repos.bpo.fila.obter(filaId)
    if (!f) throw new ErroRegra('Pedido não encontrado.')
    if (f.cliente_id !== d.cliente_id) throw new ErroRegra('O documento é de outra empresa.')
    for (const item of f.faltando.filter((x) => /boleto|nota|documento/i.test(x) || (/valor/i.test(x) && d.leitura?.valor) || (/prazo/i.test(x) && d.leitura?.vencimento))) f = repos.bpo.fila.completar(filaId, item, { ctx })
    if (d.leitura?.valor && !f.valor) f = repos.bpo.fila.atualizar(filaId, { valor: d.leitura.valor, ...(d.leitura.vencimento ? { prazo: d.leitura.vencimento } : {}) }, { ctx, ferramenta: 'fila.atualizar', texto: `Valor e vencimento do pedido lidos de ${d.nome_arquivo}` })
    this.atualizar(id, { situacao: d.situacao === 'lancado' ? 'lancado' : 'anexado', fila_id: filaId }, { ...op, ferramenta: 'fila.atualizar', texto: `${d.nome_arquivo} anexado ao pedido “${f.texto}”` })
    return f
  }

  /** Comprovante de pagamento: fica junto da conta (a baixa só vale com comprovante ou extrato, 10, 3.11). */
  vincularComprovante(id: Id, contaId: Id, op: OpcoesEscrita = {}) {
    const d = this.exigir(id)
    const c = repos.bpo.contas.obter(contaId)
    if (!c) throw new ErroRegra('Conta não encontrada.')
    if (c.cliente_id !== d.cliente_id) throw new ErroRegra('A conta é de outra empresa.')
    repos.bpo.contas.atualizar(contaId, { extras: { ...c.extras, comprovante_id: id } }, { ...op, ferramenta: 'conta_pagar.capturar', texto: `Comprovante ${d.nome_arquivo} guardado com a conta ${c.contraparte}` })
    return this.atualizar(id, { situacao: 'anexado', conta_id: contaId }, { ...op, ferramenta: 'documento_bpo.receber', texto: `${d.nome_arquivo} vinculado à conta ${c.contraparte}` })
  }

  descartar(id: Id, motivo: string, op: OpcoesEscrita = {}) {
    if (!motivo.trim()) throw new ErroRegra('Descartar exige o motivo (nada se apaga).')
    const d = this.exigir(id)
    if (d.situacao === 'lancado') throw new ErroRegra('A conta já foi lançada: cancele a conta, com motivo.')
    return this.atualizar(id, { situacao: 'descartado', motivo }, { ...op, ferramenta: 'documento_bpo.descartar', texto: `${d.nome_arquivo} descartado: ${motivo}` })
  }
}

/* ---------- Fila: anotação, cobrança e reabrir ---------- */

export interface NotaFila {
  por: string
  em: string
  texto: string
  tipo: 'nota' | 'cobranca' | 'resolucao' | 'reabertura'
}

export const notasDe = (f: BpoItemFila) => ((f.extras?.notas as NotaFila[] | undefined) ?? [])

function anotar(f: BpoItemFila, nota: Omit<NotaFila, 'por' | 'em'>, ferramenta: string, texto: string, op: OpcoesEscrita = {}) {
  const ctx = op.ctx ?? contextoAtual()
  return repos.bpo.fila.atualizar(f.id, { extras: { ...f.extras, notas: [...notasDe(f), { ...nota, por: nomeDoAtor(ctx.ator), em: agoraDemo() }] } }, { ...op, ctx, ferramenta, texto })
}

export const filaOperacao = {
  comentar(id: Id, texto: string, op: OpcoesEscrita = {}) {
    if (!texto.trim()) throw new ErroRegra('Escreva a anotação.')
    const f = repos.bpo.fila.obter(id)
    if (!f) throw new ErroRegra('Item não encontrado.')
    const ctx = op.ctx ?? contextoAtual()
    return anotar(f, { texto: texto.trim(), tipo: 'nota' }, 'fila.comentar', `${nomeDoAtor(ctx.ator)} anotou em “${f.texto}”: ${texto.trim()}`, op)
  },
  /** Cobra quem está com a bola (BPO-010): cliente pelo app e WhatsApp; colega pelo sino. O SLA não muda. */
  cobrar(id: Id, como: string, op: OpcoesEscrita = {}) {
    const f = repos.bpo.fila.obter(id)
    if (!f) throw new ErroRegra('Item não encontrado.')
    const ctx = op.ctx ?? contextoAtual()
    return anotar(f, { texto: como, tipo: 'cobranca' }, 'fila.cobrar', `${nomeDoAtor(ctx.ator)} cobrou ${f.bola === 'bpo' ? f.responsavel_nome : f.bola === 'cliente' ? 'o cliente' : 'quem está com a bola'} sobre “${f.texto}” (${como})`, op)
  },
  resolver(id: Id, nota: string, op: OpcoesEscrita = {}) {
    const f = repos.bpo.fila.resolver(id, op)
    return nota.trim() ? anotar(f, { texto: nota.trim(), tipo: 'resolucao' }, 'fila.comentar', `Como foi resolvido: ${nota.trim()}`, op) : f
  },
  reabrir(id: Id, motivo: string, op: OpcoesEscrita = {}) {
    if (!motivo.trim()) throw new ErroRegra('Reabrir exige o motivo.')
    const f = repos.bpo.fila.reabrir(id, op)
    return anotar(f, { texto: motivo.trim(), tipo: 'reabertura' }, 'fila.atualizar', `“${f.texto}” reaberto: ${motivo.trim()}`, op)
  },
}

/* ---------- Conciliação e lançamentos no ERP ---------- */

export const baixaDe = (t: BpoTransacao) => (t.extras?.baixa as SituacaoBaixa | undefined) ?? null

function modoDe(b: Banco, clienteId: Id) {
  const x = b.ler('bpo_conexao_erp').find((c) => c.cliente_id === clienteId)
  return { modo: x?.modo ?? 'E3', provedor: x?.provedor ?? 'livro próprio' }
}

export const conciliacaoOperacao = {
  /**
   * Concilia a linha do extrato. E1: a baixa vai ao ERP por comando (erp.baixar)
   * e o espelho relê; E2: fica em "lançar no ERP" (manual, conta no SLA); E3: nativa.
   */
  conciliar(id: Id, categoria: string, op: OpcoesEscrita = {}) {
    const ctx = op.ctx ?? contextoAtual()
    const b = banco
    const t = repos.bpo.transacoes.obter(id)
    if (!t) throw new ErroRegra('Linha do extrato não encontrada.')
    if (t.situacao === 'conciliada') throw new ErroRegra('Esta linha já foi conciliada.')
    const { modo, provedor } = modoDe(b, t.cliente_id)
    const baixa: SituacaoBaixa = modo === 'E1' ? 'erp' : modo === 'E2' ? 'manual_pendente' : 'nativo'
    const depois = repos.bpo.transacoes.atualizar(id, { situacao: 'conciliada', categoria, conciliada_por: nomeDoAtor(ctx.ator), extras: { ...t.extras, baixa, conciliada_em: agoraDemo() } }, { ...op, ctx, ferramenta: 'conciliacao.confirmar', texto: `${nomeDoAtor(ctx.ator)} conciliou ${t.descricao} como ${categoria}` })
    if (modo === 'E1') b.transacao((tx) => registrarEvento(tx, ctx, { nome: 'bpo.atividade', ferramenta: 'erp.baixar', texto: `Baixa de ${t.descricao} enviada ao ${provedor} (erp.baixar) e relida no espelho`, cliente_id: t.cliente_id, setor_id: 'bpo_financeiro', resultado_ref: id }))
    return depois
  },
  /** Volta a linha para conciliar (no E1, a plataforma registra o estorno da baixa no ERP). */
  desfazer(id: Id, op: OpcoesEscrita = {}) {
    const ctx = op.ctx ?? contextoAtual()
    const t = repos.bpo.transacoes.obter(id)
    if (!t) throw new ErroRegra('Linha do extrato não encontrada.')
    if (baixaDe(t) === 'manual_feita') throw new ErroRegra('A baixa já foi lançada à mão no ERP: estorne lá primeiro.')
    const { modo, provedor } = modoDe(banco, t.cliente_id)
    return repos.bpo.transacoes.atualizar(id, { situacao: 'pendente', categoria: null, conciliada_por: null, extras: { ...t.extras, baixa: null } }, { ...op, ctx, ferramenta: 'conciliacao.confirmar', texto: `${nomeDoAtor(ctx.ator)} desfez a conciliação de ${t.descricao}${modo === 'E1' ? ` (estorno da baixa no ${provedor})` : ''}` })
  },
  /** Modo arquivo: a pessoa lançou a baixa no ERP do cliente. Conta no SLA com a marca "manual". */
  marcarBaixaLancada(id: Id, op: OpcoesEscrita = {}) {
    const ctx = op.ctx ?? contextoAtual()
    const t = repos.bpo.transacoes.obter(id)
    if (!t) throw new ErroRegra('Linha do extrato não encontrada.')
    if (baixaDe(t) !== 'manual_pendente') throw new ErroRegra('Esta baixa não está para lançar.')
    const { provedor } = modoDe(banco, t.cliente_id)
    const depois = repos.bpo.transacoes.atualizar(id, { extras: { ...t.extras, baixa: 'manual_feita', baixa_por: nomeDoAtor(ctx.ator), baixa_em: agoraDemo() } }, { ...op, ctx, ferramenta: 'erp.baixar', texto: `${nomeDoAtor(ctx.ator)} lançou à mão no ${provedor} a baixa de ${t.descricao} (manual, conta no SLA)` })
    resolverPendenciaArquivo(t.cliente_id, ctx)
    return depois
  },
  /** Modo arquivo: a conta lançada na plataforma foi digitada no ERP do cliente. */
  marcarContaLancada(contaId: Id, op: OpcoesEscrita = {}) {
    const ctx = op.ctx ?? contextoAtual()
    const c = repos.bpo.contas.obter(contaId)
    if (!c) throw new ErroRegra('Conta não encontrada.')
    const { provedor } = modoDe(banco, c.cliente_id)
    const depois = repos.bpo.contas.atualizar(contaId, { lancar_no_erp: false, extras: { ...c.extras, lancada_no_erp_por: nomeDoAtor(ctx.ator), lancada_no_erp_em: agoraDemo() } }, { ...op, ctx, ferramenta: 'erp.lancar', texto: `${nomeDoAtor(ctx.ator)} lançou à mão no ${provedor} a conta ${c.contraparte} (${brl(c.valor)})` })
    resolverPendenciaArquivo(c.cliente_id, ctx)
    return depois
  },
  /** Linhas novas do extrato lidas do banco (Open Finance ou API), sempre de demonstração. */
  importarExtrato(clienteId: Id, linhas: Omit<BpoTransacao, 'escritorio_id' | 'criado_em' | 'atualizado_em' | 'cliente_id' | 'situacao'>[], fonte: string, op: OpcoesEscrita = {}) {
    const ctx = op.ctx ?? contextoAtual()
    const novas = linhas.filter((l) => !repos.bpo.transacoes.obter(l.id))
    for (const l of novas) repos.bpo.transacoes.criar({ ...l, cliente_id: clienteId, situacao: 'pendente', extras: { ...l.extras, fonte, demonstracao: true } }, { ctx, ferramenta: 'extrato.buscar', texto: `Extrato: ${l.descricao} (${brl(l.valor)}) lido por ${fonte}` })
    return novas.length
  },
}

/** Quando não resta nada para lançar à mão, a pendência "lançar baixas" da fila se resolve sozinha (com evento). */
function resolverPendenciaArquivo(clienteId: Id, ctx: Contexto) {
  const resta = banco.ler('bpo_transacao').some((t) => t.cliente_id === clienteId && baixaDe(t) === 'manual_pendente') || banco.ler('bpo_conta').some((c) => c.cliente_id === clienteId && c.lancar_no_erp && c.etapa !== 'cancelada')
  if (resta) return
  for (const f of banco.ler('bpo_item_fila').filter((x) => x.cliente_id === clienteId && x.situacao === 'aberto' && x.tipo === 'pendencia' && x.codigo === 'FIN-004')) repos.bpo.fila.atualizar(f.id, { situacao: 'resolvido' }, { ctx, ferramenta: 'fila.atualizar', texto: `Resolvido: ${f.texto} (todas as baixas lançadas no ERP)` })
}

/* ---------- Fechamento do mês e relatório gerencial ---------- */

export interface LinhaDre {
  rotulo: string
  valor: number
}

/** Rascunho do relatório gerencial que o integrante Gerencial escreve (10, 3.10; FIN-006, P). */
export interface RascunhoGerencial {
  competencia: string
  receitas: LinhaDre[]
  custos: LinhaDre[]
  despesas: LinhaDre[]
  resultado: number
  caixa_fim: number
  pagamentos: number
  atrasos: string[]
  pendencias: string[]
  riscos: string[]
  comentario: string
  escrito_por: string
  escrito_em: string
}

export interface PassoFechamento {
  chave: 'extrato' | 'baixas' | 'contas' | 'rascunho' | 'aprovado'
  ok: boolean
  texto: string
  secao: string
}

const entregaDe = (clienteId: Id, competencia: string, tipo: BpoEntrega['tipo']) => banco.ler('bpo_entrega').find((x) => x.cliente_id === clienteId && x.competencia === competencia && x.tipo === tipo)
export const rascunhoDe = (e?: BpoEntrega) => (e?.extras?.dre as RascunhoGerencial | undefined) ?? null

export const fechamentoOperacao = {
  /** Conferência antes de fechar: mesma regra na tela e na escrita. */
  passos(clienteId: Id, competencia: string): PassoFechamento[] {
    const fim = fimDaCompetencia(competencia)
    const trans = banco.ler('bpo_transacao').filter((t) => t.cliente_id === clienteId && t.data <= fim)
    const semConciliar = trans.filter((t) => t.situacao === 'pendente').length
    const paraLancar = trans.filter((t) => baixaDe(t) === 'manual_pendente').length
    const aConferir = banco.ler('bpo_conta').filter((c) => c.cliente_id === clienteId && c.tipo === 'pagar' && c.etapa === 'capturada' && c.vencimento <= fim).length
    const rel = entregaDe(clienteId, competencia, 'relatorio')
    const rasc = !!rascunhoDe(rel) || !!rel?.extras?.rascunho
    const aprovado = !!rel?.extras?.aprovado_em || rel?.situacao === 'enviado'
    return [
      { chave: 'extrato', ok: semConciliar === 0, texto: semConciliar ? `${semConciliar} linha${semConciliar > 1 ? 's' : ''} do extrato do mês sem conciliar` : 'Extrato do mês conciliado', secao: 'conciliacao' },
      { chave: 'baixas', ok: paraLancar === 0, texto: paraLancar ? `${paraLancar} baixa${paraLancar > 1 ? 's' : ''} do mês para lançar no ERP (modo arquivo)` : 'Baixas do mês no ERP', secao: 'lancamentos' },
      { chave: 'contas', ok: aConferir === 0, texto: aConferir ? `${aConferir} conta${aConferir > 1 ? 's' : ''} do mês sem conferência` : 'Contas do mês conferidas', secao: 'pagar' },
      { chave: 'rascunho', ok: rasc, texto: rasc ? 'Relatório gerencial rascunhado pelo Gerencial' : 'Falta o rascunho do relatório gerencial (o Gerencial escreve)', secao: 'fechamento' },
      { chave: 'aprovado', ok: aprovado, texto: aprovado ? `Rascunho revisado${rel?.extras?.aprovado_por ? ` por ${String(rel.extras.aprovado_por)}` : ''}` : 'Falta o Gestor revisar o rascunho', secao: 'fechamento' },
    ]
  },

  /** O integrante Gerencial grava o rascunho (prepara; nunca envia nem fecha). */
  gravarRascunho(clienteId: Id, competencia: string, dre: RascunhoGerencial, op: OpcoesEscrita = {}) {
    const ctx = op.ctx ?? contextoAtual()
    const rel = entregaDe(clienteId, competencia, 'relatorio')
    const extras = { ...rel?.extras, rascunho: true, rascunho_em: agoraDemo(), dre, aprovado_em: null, aprovado_por: null }
    if (rel) return repos.bpo.entregas.atualizar(rel.id, { extras }, { ...op, ctx, ferramenta: 'bpo.relatorio_mensal', texto: `${nomeDoAtor(ctx.ator)} rascunhou o relatório gerencial de ${competencia}` })
    return repos.bpo.entregas.criar({ cliente_id: clienteId, competencia, tipo: 'relatorio', situacao: 'pendente', extras }, { ...op, ctx, ferramenta: 'bpo.relatorio_mensal', texto: `${nomeDoAtor(ctx.ator)} rascunhou o relatório gerencial de ${competencia}` })
  },

  /** O Gestor revisa o rascunho (pode reescrever o comentário). Ainda não sai ao cliente: isso é em Entregas. */
  aprovarRascunho(clienteId: Id, competencia: string, comentario: string, op: OpcoesEscrita = {}) {
    const ctx = op.ctx ?? contextoAtual()
    if (ctx.ator.tipo !== 'pessoa' || !ehGestorBpo(ctx)) throw new ErroRegra('Revisar o relatório é do Gestor do BPO (o integrante só rascunha).')
    const rel = entregaDe(clienteId, competencia, 'relatorio')
    const dre = rascunhoDe(rel)
    if (!rel || !dre) throw new ErroRegra('Ainda não há rascunho do Gerencial para revisar.')
    return repos.bpo.entregas.atualizar(rel.id, { extras: { ...rel.extras, dre: { ...dre, comentario: comentario.trim() || dre.comentario }, aprovado_em: agoraDemo(), aprovado_por: nomeDoAtor(ctx.ator) } }, { ...op, ctx, ferramenta: 'bpo.relatorio_mensal', texto: `${nomeDoAtor(ctx.ator)} revisou e aprovou o relatório gerencial de ${competencia}` })
  },

  executar(clienteId: Id, competencia: string, op: OpcoesEscrita = {}) {
    const ctx = op.ctx ?? contextoAtual()
    if (ctx.ator.tipo !== 'pessoa') throw new ErroRegra('Fechar o mês é de uma pessoa (o integrante prepara, o Gestor fecha).')
    const falta = fechamentoOperacao.passos(clienteId, competencia).find((p) => !p.ok)
    if (falta) throw new ErroRegra(`Ainda não dá para fechar: ${falta.texto.toLowerCase()}.`)
    const cliente = banco.obter('cliente', clienteId)
    const contabil = (cliente?.servicos_contratados ?? []).includes('contabil')
    const f = entregaDe(clienteId, competencia, 'fechamento')
    const dados = { situacao: 'enviado' as const, enviado_em: agoraDemo(), enviado_por: nomeDoAtor(ctx.ator) }
    const texto = contabil ? `bpo.mes_fechado: ${nomeDoAtor(ctx.ator)} fechou ${competencia} de ${cliente?.nome}; os lançamentos já classificados foram ao setor Contábil` : `${nomeDoAtor(ctx.ator)} fechou ${competencia} de ${cliente?.nome}; fechamento enviado ao contador da empresa`
    const depois = f ? repos.bpo.entregas.atualizar(f.id, { ...dados, extras: { ...f.extras, reaberto: null } }, { ...op, ctx, ferramenta: 'bpo.fechamento.executar', texto }) : repos.bpo.entregas.criar({ cliente_id: clienteId, competencia, tipo: 'fechamento', ...dados }, { ...op, ctx, ferramenta: 'bpo.fechamento.executar', texto })
    if (contabil) banco.transacao((tx) => registrarEvento(tx, ctx, { nome: 'bpo.mes_fechado', ferramenta: 'bpo.fechamento.executar', texto: `Lançamentos de ${competencia} de ${cliente?.nome} entregues ao Contábil, já classificados (sem redigitar)`, cliente_id: clienteId, setor_id: 'contabil', resultado_ref: depois.id }))
    return depois
  },

  reabrir(clienteId: Id, competencia: string, motivo: string, op: OpcoesEscrita = {}) {
    const ctx = op.ctx ?? contextoAtual()
    if (!motivo.trim()) throw new ErroRegra('Reabrir o mês exige o motivo.')
    const f = entregaDe(clienteId, competencia, 'fechamento')
    if (!f || f.situacao !== 'enviado') throw new ErroRegra('Este mês não está fechado.')
    return repos.bpo.entregas.atualizar(f.id, { situacao: 'pendente', extras: { ...f.extras, reaberto: { por: nomeDoAtor(ctx.ator), em: agoraDemo(), motivo: motivo.trim() } } }, { ...op, ctx, ferramenta: 'bpo.fechamento.reabrir', texto: `${nomeDoAtor(ctx.ator)} reabriu ${competencia}: ${motivo.trim()}` })
  },
}

/* ---------- O repositório de documentos ---------- */

export function criarDocumentosBpo(b: () => Banco) {
  return new RepositorioDocumentosBpo(
    b,
    regras({
      tabela: 'bpo_documento',
      prefixo: 'bd',
      artigo: 'o documento',
      ferramentas: { criar: 'documento_bpo.receber', atualizar: 'conta_pagar.ler_documento' },
      exclusao: 'proibida',
      motivoExclusaoProibida: 'Documento não se apaga: descarte com motivo (R7).',
      rotulo: (r) => r.nome_arquivo,
      alvo: (r) => ({ cliente_id: r.cliente_id ?? null }),
      validar: (r) => (r.nome_arquivo.trim() ? null : 'Dê um nome ao documento.'),
    }),
  )
}

/** Documentos do BPO (S08b): `documentosBpo.receber`, `.registrarLeitura`, `.lancar`, `.anexar`, `.descartar`. */
export const documentosBpo = criarDocumentosBpo(() => banco)

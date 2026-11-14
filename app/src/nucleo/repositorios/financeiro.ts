import type { Banco } from '../banco/banco'
import type { Id, NomeTabela, Tabelas } from '../modelo/entidades'
import type { Cobranca, ContaPagarFin, ContratoHonorarios, FechamentoFinanceiro, ItemContrato, Lancamento } from '../modelo/financeiro'
import { ErroRegra } from '../permissoes/autorizar'
import { nomeDoAtor } from '../permissoes/perfil'
import { contextoAtual } from './contexto'
import { agora, novoId, registrarEvento, Repositorio, type OpcoesEscrita, type RegrasEntidade } from './repositorio'

/*
 * S07 · Repositórios do Financeiro do escritório (09, 3.1 e 3.3: nada se apaga).
 * As transições com regra própria (aditar o contrato, cancelar a cobrança,
 * fechar e reabrir o mês) ficam em classes; o resto usa o repositório genérico.
 * O valor do dinheiro nunca muda por edição: cobrança errada se cancela ou se
 * substitui; lançamento errado recebe ajuste; item de contrato se fecha.
 */

const regras = <K extends NomeTabela>(r: RegrasEntidade<K>) => r
const fin = { setor_id: 'financeiro_escritorio' }
const doCliente = (r: { cliente_id?: Id | null }) => ({ ...fin, cliente_id: r.cliente_id ?? null })

/** Competência AAAA-MM de uma data ISO. */
export const competenciaDe = (data: string) => data.slice(0, 7)

/** Competência fechada bloqueia lançamento retroativo (09, 3.1). */
function mesFechado(b: Banco, competencia: string) {
  return b.ler('fechamento_financeiro').some((f) => f.competencia === competencia && f.situacao === 'fechado')
}

export class RepositorioContratos extends Repositorio<'contrato_honorarios'> {
  /**
   * Aditivo (S07-A05): fecha os itens que mudaram, abre os novos a partir da
   * competência, sobe a versão do contrato e grava o aditivo com o diff, tudo
   * numa transação. Nunca retroativo.
   */
  aditar(
    id: Id,
    mudanca: { contrato: Partial<ContratoHonorarios>; itens: Omit<ItemContrato, 'id' | 'escritorio_id' | 'criado_em' | 'atualizado_em' | 'contrato_id' | 'vigente_de'>[]; vigente_de: string; tipo: Tabelas['aditivo']['tipo']; diff: { campo: string; antes: string; depois: string }[]; resumo: string },
    op: OpcoesEscrita = {},
  ): ContratoHonorarios {
    const antes = this.exigir(id)
    const ctx = this.autorizar('contrato.aditar', antes, op)
    if (mesFechado(this.banco(), mudanca.vigente_de)) throw new ErroRegra(`A competência ${mudanca.vigente_de} está fechada: escolha a próxima.`)
    const b = this.banco()
    const quando = agora()
    const anterior = mudanca.vigente_de
    const versao = antes.versao + 1
    const depois = { ...antes, ...mudanca.contrato, versao, vigente_de: mudanca.vigente_de, situacao: antes.situacao === 'rascunho' ? 'ativo' : antes.situacao, faixa_estourada: null, atualizado_em: quando } as ContratoHonorarios
    b.transacao((tx) => {
      for (const it of b.ler('item_contrato').filter((i) => i.contrato_id === id && !i.vigente_ate)) tx.gravar('item_contrato', { ...it, vigente_ate: anterior, atualizado_em: quando })
      mudanca.itens.forEach((it, k) => tx.gravar('item_contrato', { ...it, id: novoId('ic'), contrato_id: id, vigente_de: mudanca.vigente_de, vigente_ate: null, ordem: k + 1, escritorio_id: b.escritorioId ?? '', criado_em: quando, atualizado_em: quando }))
      tx.gravar('contrato_honorarios', depois)
      tx.gravar('aditivo', { id: novoId('ad'), escritorio_id: b.escritorioId ?? '', criado_em: quando, atualizado_em: quando, contrato_id: id, tipo: mudanca.tipo, situacao: 'vigente', vigente_de: mudanca.vigente_de, resumo: mudanca.resumo, diff: mudanca.diff, versao_para: versao })
      registrarEvento(tx, ctx, { nome: 'contrato_honorarios.aditar', ferramenta: 'contrato.aditar', resultado_ref: id, cliente_id: antes.cliente_id, setor_id: fin.setor_id, texto: `${nomeDoAtor(ctx.ator)} gravou a versão ${versao} do contrato ${antes.numero} a partir de ${mudanca.vigente_de}: ${mudanca.resumo}`, argumentos_resumo: { diff: mudanca.diff } })
    })
    return depois
  }
}

export class RepositorioCobrancas extends Repositorio<'cobranca'> {
  /** Cancelar exige motivo (sempre por cartão, na tela); a cobrança sai do contas a receber. */
  cancelar(id: Id, motivo: string, op: OpcoesEscrita = {}): Cobranca {
    const c = this.exigir(id)
    if (!motivo.trim()) throw new ErroRegra('Cancelar uma cobrança exige o motivo.')
    if (c.situacao === 'paga') throw new ErroRegra('Cobrança paga não se cancela: estorne o recebimento antes.')
    if (c.situacao === 'cancelada' || c.situacao === 'substituida') throw new ErroRegra('Esta cobrança já saiu do contas a receber.')
    const ctx = op.ctx ?? contextoAtual()
    return this.atualizar(id, { situacao: 'cancelada', motivo, historico: [...c.historico, { quando: agora(), texto: `Cancelada por ${nomeDoAtor(ctx.ator)}: ${motivo}` }] }, { ...op, ferramenta: 'cobranca.cancelar', texto: `${nomeDoAtor(ctx.ator)} cancelou a cobrança ${c.numero}: ${motivo}` })
  }
  /** Linha do histórico da fatura, com evento. */
  anotar(id: Id, texto: string, patch: Partial<Cobranca> = {}, op: OpcoesEscrita = {}): Cobranca {
    const c = this.exigir(id)
    return this.atualizar(id, { ...patch, historico: [...c.historico, { quando: agora(), texto }] }, { ...op, texto: op.texto ?? texto })
  }
}

export class RepositorioContasPagar extends Repositorio<'conta_pagar'> {
  cancelar(id: Id, motivo: string, op: OpcoesEscrita = {}): ContaPagarFin {
    if (!motivo.trim()) throw new ErroRegra('Descartar uma conta exige o motivo (fica no histórico).')
    const c = this.exigir(id)
    return this.atualizar(id, { situacao: 'cancelada', motivo }, { ...op, ferramenta: 'conta_pagar.cancelar', texto: `${nomeDoAtor((op.ctx ?? contextoAtual()).ator)} descartou ${c.fornecedor}: ${motivo}` })
  }
}

export class RepositorioLancamentos extends Repositorio<'lancamento'> {
  /** Ajuste manual: lançamento novo que corrige o original (o original não muda de valor). */
  ajustar(id: Id, valor: number, categoria: string, motivo: string, op: OpcoesEscrita = {}): Lancamento {
    const l = this.exigir(id)
    if (!motivo.trim()) throw new ErroRegra('Ajuste exige o motivo.')
    const ajuste = this.criar({ titular_tipo: l.titular_tipo, titular_cliente_id: l.titular_cliente_id, conta_id: l.conta_id, data: l.data, valor, descricao_extrato: `AJUSTE · ${motivo}`, origem: 'manual', situacao: 'conciliado', categoria, ajuste_de: id, vinculo: { tipo: 'ajuste', id } }, { ...op, ferramenta: 'conciliacao.ajustar' })
    this.atualizar(id, { situacao: 'conciliado', categoria, vinculo: { tipo: 'ajuste', id: ajuste.id }, divergencia: null }, { ...op, ferramenta: 'conciliacao.ajustar', texto: `Ajuste manual em ${l.descricao_extrato}: ${motivo}` })
    return ajuste
  }
}

export class RepositorioFechamentos extends Repositorio<'fechamento_financeiro'> {
  fechar(competencia: string, op: OpcoesEscrita & { custoHora?: number } = {}): FechamentoFinanceiro {
    const ctx = op.ctx ?? contextoAtual()
    const atual = this.listar((f) => f.competencia === competencia)[0]
    const dados = { situacao: 'fechado' as const, fechado_por: nomeDoAtor(ctx.ator), fechado_em: agora(), custo_hora: op.custoHora ?? atual?.custo_hora ?? null }
    const texto = `${nomeDoAtor(ctx.ator)} fechou o financeiro de ${competencia}`
    return atual ? this.atualizar(atual.id, dados, { ...op, ferramenta: 'fechamento.fechar', texto }) : this.criar({ competencia, ...dados }, { ...op, ferramenta: 'fechamento.fechar', texto })
  }
  reabrir(competencia: string, motivo: string, op: OpcoesEscrita = {}): FechamentoFinanceiro {
    if (!motivo.trim()) throw new ErroRegra('Reabrir o mês exige o motivo.')
    const atual = this.listar((f) => f.competencia === competencia)[0]
    if (!atual || atual.situacao !== 'fechado') throw new ErroRegra('Este mês não está fechado.')
    return this.atualizar(atual.id, { situacao: 'reaberto', motivo_reabertura: motivo }, { ...op, ferramenta: 'fechamento.reabrir', texto: `${nomeDoAtor((op.ctx ?? contextoAtual()).ator)} reabriu ${competencia}: ${motivo}` })
  }
}

/** Os repositórios do Financeiro, espalhados no fim de `repos` (S07). */
export function reposFinanceiro(b: () => Banco) {
  const naoApaga = (o: string) => ({ exclusao: 'proibida' as const, motivoExclusaoProibida: `${o} não se apaga (09, 3.3): cancele ou encerre com motivo.` })
  const bloqueiaFechado = (comp: string) => (mesFechado(b(), comp) ? `A competência ${comp} está fechada: lançamento retroativo bloqueado. Reabra o mês com motivo.` : null)
  return {
    contratosHonorarios: new RepositorioContratos(b, regras({ tabela: 'contrato_honorarios', prefixo: 'ch', artigo: 'o contrato', ferramentas: { criar: 'contrato.criar', atualizar: 'contrato.aditar' }, ...naoApaga('Contrato'), rotulo: (r) => r.numero, alvo: doCliente, validar: (r) => (r.dia_vencimento < 1 || r.dia_vencimento > 28 ? 'Vencimento entre os dias 1 e 28.' : null) })),
    itensContrato: new Repositorio(b, regras({ tabela: 'item_contrato', prefixo: 'ic', artigo: 'o item', ferramentas: { criar: 'contrato.aditar', atualizar: 'contrato.aditar' }, ...naoApaga('Item de contrato'), rotulo: (r) => r.descricao, alvo: () => fin, validar: (r) => (!r.descricao.trim() ? 'O item precisa de descrição.' : r.valor <= 0 ? 'O item precisa de valor.' : null) })),
    aditivos: new Repositorio(b, regras({ tabela: 'aditivo', prefixo: 'ad', artigo: 'o aditivo', ferramentas: { criar: 'contrato.aditar', atualizar: 'contrato.aditar' }, ...naoApaga('Aditivo'), rotulo: (r) => r.resumo, alvo: () => fin })),
    tabelaAvulsos: new Repositorio(b, regras({ tabela: 'item_tabela_avulsos', prefixo: 'ta', artigo: 'o preço', ferramentas: { criar: 'financeiro.configurar', atualizar: 'financeiro.configurar', excluir: 'financeiro.configurar' }, exclusao: 'definitiva', rotulo: (r) => r.nome, alvo: () => fin, validar: (r) => (!r.nome.trim() ? 'Dê um nome ao serviço.' : r.valor_padrao <= 0 ? 'Informe o preço.' : null) })),
    servicosAvulsos: new Repositorio(b, regras({ tabela: 'servico_avulso', prefixo: 'sa', artigo: 'o serviço avulso', ferramentas: { criar: 'avulso.registrar', atualizar: 'avulso.decidir' }, ...naoApaga('Serviço avulso'), rotulo: (r) => r.descricao, alvo: doCliente, validar: (r) => (!r.descricao.trim() ? 'Descreva o serviço.' : r.valor <= 0 ? 'Informe o valor.' : null) })),
    despesasAdiantadas: new Repositorio(b, regras({ tabela: 'despesa_adiantada', prefixo: 'da', artigo: 'a despesa', ferramentas: { criar: 'despesa.registrar', atualizar: 'despesa.registrar' }, ...naoApaga('Despesa adiantada'), rotulo: (r) => r.descricao, alvo: doCliente, validar: (r) => (!r.descricao.trim() ? 'Descreva a despesa.' : r.valor <= 0 ? 'Informe o valor.' : !r.comprovante ? 'Reembolso precisa do comprovante.' : r.situacao === 'perdoada' && !r.motivo ? 'Perdoar exige o motivo.' : null) })),
    lotesFaturamento: new Repositorio(b, regras({ tabela: 'lote_faturamento', prefixo: 'lf', artigo: 'o lote', ferramentas: { criar: 'faturamento.preparar_lote', atualizar: 'aprovacao.decidir_lote' }, ...naoApaga('Lote de faturamento'), rotulo: (r) => `lote ${r.competencia}`, alvo: () => fin })),
    cobrancas: new RepositorioCobrancas(b, regras({ tabela: 'cobranca', prefixo: 'cb', artigo: 'a cobrança', ferramentas: { criar: 'cobranca.criar', atualizar: 'cobranca.segunda_via' }, ...naoApaga('Cobrança'), rotulo: (r) => r.numero, alvo: doCliente, validar: (r) => (r.valor <= 0 ? 'A cobrança precisa de valor.' : !r.linhas.length ? 'A cobrança precisa de ao menos uma linha.' : null) })),
    parcelas: new Repositorio(b, regras({ tabela: 'parcela', prefixo: 'pc', artigo: 'a parcela', ferramentas: { criar: 'cobranca.propor_acordo', atualizar: 'recebimento.baixar' }, ...naoApaga('Parcela'), rotulo: (r) => `parcela ${r.numero}`, alvo: () => fin })),
    recebimentos: new Repositorio(b, regras({ tabela: 'recebimento', prefixo: 'rc', artigo: 'o recebimento', ferramentas: { criar: 'recebimento.baixar', atualizar: 'recebimento.vincular' }, ...naoApaga('Recebimento'), rotulo: (r) => `${r.pagador} · ${r.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, alvo: () => fin, validar: (r) => (r.valor <= 0 ? 'Informe o valor recebido.' : r.origem === 'manual' && !r.comprovante ? 'Baixa manual precisa do comprovante.' : null) })),
    notasEscritorio: new Repositorio(b, regras({ tabela: 'nota_servico_escritorio', prefixo: 'ne', artigo: 'a NFS-e', ferramentas: { criar: 'nfse.escritorio.emitir', atualizar: 'nfse.escritorio.cancelar' }, ...naoApaga('NFS-e'), rotulo: (r) => `NFS-e ${r.numero}`, alvo: doCliente })),
    contasBancarias: new Repositorio(b, regras({ tabela: 'conta_bancaria', prefixo: 'bc', artigo: 'a conta bancária', ferramentas: { criar: 'conta_bancaria.conectar', atualizar: 'conta_bancaria.conectar' }, exclusao: 'proibida', motivoExclusaoProibida: 'Conta bancária não se apaga: desative.', rotulo: (r) => r.nome, alvo: () => fin })),
    lancamentos: new RepositorioLancamentos(b, regras({ tabela: 'lancamento', prefixo: 'lc', artigo: 'o lançamento', ferramentas: { criar: 'conciliacao.confirmar', atualizar: 'conciliacao.confirmar' }, exclusao: 'proibida', motivoExclusaoProibida: 'Lançamento é imutável: corrija com ajuste.', rotulo: (r) => r.descricao_extrato, alvo: () => fin, antesDeAtualizar: (a, d) => { if (a.valor !== d.valor) throw new ErroRegra('O valor do lançamento não muda: faça um ajuste.'); return d } })),
    contasPagar: new RepositorioContasPagar(b, regras({ tabela: 'conta_pagar', prefixo: 'cp', artigo: 'a conta a pagar', ferramentas: { criar: 'conta_pagar.capturar', atualizar: 'conta_pagar.classificar' }, exclusao: 'proibida', motivoExclusaoProibida: 'Conta a pagar não se apaga: descarte com motivo.', rotulo: (r) => r.fornecedor, alvo: () => fin, validar: (r) => (!r.fornecedor.trim() ? 'Informe o fornecedor.' : r.valor <= 0 ? 'Informe o valor.' : !r.vencimento ? 'Informe o vencimento.' : r.situacao === 'capturada' ? bloqueiaFechado(r.competencia) : null) })),
    centrosCusto: new Repositorio(b, regras({ tabela: 'centro_custo', prefixo: 'cc', artigo: 'o centro de custo', ferramentas: { criar: 'financeiro.configurar', atualizar: 'financeiro.configurar' }, exclusao: 'proibida', motivoExclusaoProibida: 'Centro de custo não se apaga: desative (o histórico usa).', rotulo: (r) => r.nome, alvo: () => fin, validar: (r) => (r.nome.trim() ? null : 'Dê um nome ao centro de custo.') })),
    categoriasGerenciais: new Repositorio(b, regras({ tabela: 'categoria_gerencial', prefixo: 'cg', artigo: 'a categoria', ferramentas: { criar: 'financeiro.configurar', atualizar: 'financeiro.configurar' }, exclusao: 'proibida', motivoExclusaoProibida: 'Categoria não se apaga: desative.', rotulo: (r) => r.nome, alvo: () => fin, validar: (r) => (r.nome.trim() ? null : 'Dê um nome à categoria.') })),
    regrasCategorizacao: new Repositorio(b, regras({ tabela: 'regra_categorizacao', prefixo: 'rg', artigo: 'a regra', ferramentas: { criar: 'regra_categorizacao.aprovar', atualizar: 'regra_categorizacao.aprovar', excluir: 'regra_categorizacao.aprovar' }, exclusao: 'definitiva', rotulo: (r) => r.padrao, alvo: () => fin })),
    fechamentos: new RepositorioFechamentos(b, regras({ tabela: 'fechamento_financeiro', prefixo: 'ff', artigo: 'o fechamento', ferramentas: { criar: 'fechamento.fechar', atualizar: 'fechamento.fechar' }, exclusao: 'proibida', rotulo: (r) => r.competencia, alvo: () => fin })),
    politicasFinanceiras: new Repositorio(b, regras({ tabela: 'politica_financeira', prefixo: 'pf', artigo: 'a política financeira', ferramentas: { criar: 'financeiro.configurar', atualizar: 'financeiro.configurar' }, exclusao: 'proibida', rotulo: (r) => `versão ${r.versao}`, alvo: () => fin, antesDeAtualizar: (a, d) => ({ ...d, versao: a.versao + 1 }) })),
    cenariosCaixa: new Repositorio(b, regras({ tabela: 'cenario_caixa', prefixo: 'cx', artigo: 'o cenário', ferramentas: { criar: 'caixa.salvar_cenario', atualizar: 'caixa.salvar_cenario', excluir: 'caixa.salvar_cenario' }, exclusao: 'definitiva', rotulo: (r) => r.nome, alvo: () => fin, validar: (r) => (r.nome.trim() ? null : 'Dê um nome ao cenário.') })),
  }
}

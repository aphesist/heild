import type { useLoja } from '@/ambiente/loja'
import type { UsuarioCfg } from '@/dados/configuracoes'
import { banco } from '@/nucleo/banco'
import type { Permissoes } from '@/nucleo/permissoes/telas'
import type { Cobranca, LinhaCobranca } from '@/nucleo/modelo/financeiro'
import { agora, novoId, repos } from '@/nucleo/repositorios'
import { servicos } from '@/servicos'
import type { AcaoCartao } from './dados'
import { centavos, dataCurta, gruposDeNota, HOJE, itensNaCompetencia, linhasDoContrato, rotuloCompetencia, servicos as tabServicos, somarDias } from './dominio'

/*
 * S07 · O que cada cartão do Financeiro faz quando uma pessoa decide
 * (chamado por src/ambiente/efeitos.tsx, chaves `s07-*` e o `fik1` do lote).
 * Aprovar executa com o nome de quem aprovou; recusar não executa nada.
 * Quem pode aprovar: a alçada gravada no cartão (Gestor do Financeiro até o
 * limite da política; Administrador acima e no que é só dele).
 */

type Loja = ReturnType<typeof useLoja>
const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const quando = () => agora()

/** Próximo número de NFS-e do escritório (série do ano). */
function proximaNota() {
  const nums = banco.ler('nota_servico_escritorio').map((n) => Number(n.numero.split('/')[1])).filter((n) => Number.isFinite(n))
  const pol = banco.ler('politica_financeira')[0]
  return `2026/${Math.max(pol?.nfse.ultimo_numero ?? 0, ...nums) + 1}`
}

function emitirNotas(cb: Cobranca) {
  const pol = banco.ler('politica_financeira')[0]
  const contrato = banco.ler('contrato_honorarios').find((c) => c.cliente_id === cb.cliente_id)
  for (const g of gruposDeNota(cb.linhas, pol?.nfse.nfse_por_servico ?? true)) repos.notasEscritorio.criar({ cobranca_id: cb.id, cliente_id: cb.cliente_id, numero: proximaNota(), competencia: cb.competencia, servico: g.servico, codigo: g.codigo, iss: g.iss, valor: g.valor, retencoes: contrato?.retencoes ?? [], situacao: 'emitida' }, { texto: `NFS-e de ${g.servico} emitida para a cobrança ${cb.numero} (demonstração)` })
}

/** Cria e emite uma cobrança (boleto e Pix pelo banco do escritório, simulado) com as NFS-e por serviço. */
function criarCobranca(dados: { cliente_id: string; competencia: string; origem: Cobranca['origem']; linhas: LinhaCobranca[]; vencimento: string; lote_id?: string; substitui_id?: string; texto: string }) {
  const contrato = banco.ler('contrato_honorarios').find((c) => c.cliente_id === dados.cliente_id)
  const pol = banco.ler('politica_financeira')[0]
  const valor = centavos(dados.linhas.reduce((s, l) => s + l.valor, 0))
  const seq = banco.ler('cobranca').filter((c) => c.competencia === dados.competencia).length + 1
  const cb = repos.cobrancas.criar({
    cliente_id: dados.cliente_id,
    numero: `FAT-${dados.competencia.replace('-', '')}-${String(seq).padStart(4, '0')}`,
    competencia: dados.competencia,
    origem: dados.origem,
    linhas: dados.linhas,
    valor,
    vencimento: dados.vencimento,
    meio: contrato?.meio_pagamento ?? 'boleto',
    situacao: 'emitida',
    lote_id: dados.lote_id ?? null,
    substitui_id: dados.substitui_id ?? null,
    historico: [
      { quando: quando(), texto: dados.texto },
      { quando: quando(), texto: `Boleto e Pix gerados em ${pol?.provedor.nome ?? 'banco do escritório'} (demonstração)` },
    ],
  })
  emitirNotas(cb)
  // A chamada ao provedor (simulada) só preenche a linha digitável e o Pix; a cobrança já existe.
  void servicos.cobranca
    .emitir({ pagador: dados.cliente_id, documento: '', valor, vencimento: dados.vencimento, meio: cb.meio, provedor: pol?.provedor.nome ?? 'banco' })
    .then((r) => repos.parcelas.criar({ cobranca_id: cb.id, numero: 1, vencimento: dados.vencimento, valor, situacao: 'aberta', linha_digitavel: r.dados.linha_digitavel, pix_copia_cola: r.dados.pix_copia_cola }, { semAutorizar: true, texto: `Parcela única da ${cb.numero}` }))
    .catch(() => repos.cobrancas.anotar(cb.id, 'O provedor não respondeu: o integrante tenta de novo em 10 minutos (falha simulada)', {}, { semAutorizar: true }))
  return cb
}

/** Linhas de um cliente para uma competência: itens do contrato, 13º, avulsos aceitos e reembolsos conferidos. */
export function linhasDoMes(clienteId: string, comp: string) {
  const contrato = banco.ler('contrato_honorarios').find((c) => c.cliente_id === clienteId && c.situacao === 'ativo')
  const linhas: LinhaCobranca[] = []
  const avulsos = banco.ler('servico_avulso').filter((a) => a.cliente_id === clienteId && (a.situacao === 'a_faturar' || a.situacao === 'aceito'))
  const despesas = banco.ler('despesa_adiantada').filter((d) => d.cliente_id === clienteId && d.situacao === 'conferida')
  if (contrato) {
    const itens = itensNaCompetencia(banco.ler('item_contrato'), contrato.id, comp)
    linhas.push(...linhasDoContrato(itens, 'l'))
    if (comp.endsWith('-12') && contrato.politica_13o === 'dezembro') {
      const base = itens.filter((i) => tabServicos[i.servico].nota === 'contabil').reduce((s, i) => s + i.valor, 0)
      if (base) linhas.push({ id: 'l13', tipo: 'decimo', descricao: '13º honorário', valor: base, codigo: '17.19', servico: 'contabil' })
    }
  }
  avulsos.forEach((a, k) => linhas.push({ id: `la${k}`, tipo: 'avulso', descricao: a.descricao, valor: a.valor, codigo: '17.19', servico: 'societario', ref_id: a.id }))
  despesas.forEach((d, k) => linhas.push({ id: `lr${k}`, tipo: 'reembolso', descricao: `Reembolso: ${d.descricao}`, valor: d.valor, ref_id: d.id }))
  return { contrato, linhas, avulsos, despesas }
}

function marcarFaturados(cb: Cobranca) {
  for (const l of cb.linhas) {
    if (l.tipo === 'avulso' && l.ref_id && repos.servicosAvulsos.obter(l.ref_id)) repos.servicosAvulsos.atualizar(l.ref_id, { situacao: 'faturado', cobranca_id: cb.id }, { texto: `Avulso entrou na cobrança ${cb.numero}` })
    if (l.tipo === 'reembolso' && l.ref_id && repos.despesasAdiantadas.obter(l.ref_id)) repos.despesasAdiantadas.atualizar(l.ref_id, { situacao: 'na_fatura', cobranca_id: cb.id }, { texto: `Reembolso entrou na cobrança ${cb.numero}` })
  }
}

function devolverFaturados(cb: Cobranca) {
  for (const a of banco.ler('servico_avulso').filter((x) => x.cobranca_id === cb.id)) repos.servicosAvulsos.atualizar(a.id, { situacao: 'a_faturar', cobranca_id: null }, { texto: `Avulso voltou para faturar (cobrança ${cb.numero} saiu)` })
  for (const d of banco.ler('despesa_adiantada').filter((x) => x.cobranca_id === cb.id)) repos.despesasAdiantadas.atualizar(d.id, { situacao: 'conferida', cobranca_id: null }, { texto: `Reembolso voltou para faturar (cobrança ${cb.numero} saiu)` })
}

function notasDa(cbId: string, situacao: 'cancelada' | 'substituida', motivo: string) {
  for (const n of banco.ler('nota_servico_escritorio').filter((x) => x.cobranca_id === cbId && (x.situacao === 'emitida' || x.situacao === 'rejeitada'))) repos.notasEscritorio.atualizar(n.id, { situacao, motivo }, { ferramenta: 'nfse.escritorio.cancelar', texto: `NFS-e ${n.numero} ${situacao === 'cancelada' ? 'cancelada' : 'substituída'}: ${motivo}` })
  for (const p of banco.ler('parcela').filter((x) => x.cobranca_id === cbId && x.situacao === 'aberta')) repos.parcelas.atualizar(p.id, { situacao: 'cancelada' }, { texto: `Parcela ${p.numero} cancelada com a cobrança` })
}

type Saida = { texto: string; destino?: Parameters<Loja['toast']>[1]; rotulo?: string }

function executar(a: AcaoCartao, quem: string, loja: Loja): Saida {
  switch (a.tipo) {
    case 'lote': {
      const lote = repos.lotesFaturamento.obter(a.lote_id)
      if (!lote) return { texto: 'Lote não encontrado.' }
      const fora = new Set(lote.excecoes.map((e) => e.cliente_id))
      const contratos = banco.ler('contrato_honorarios').filter((c) => c.situacao === 'ativo' && !fora.has(c.cliente_id))
      let n = 0
      let total = 0
      for (const c of contratos) {
        if (banco.ler('cobranca').some((x) => x.cliente_id === c.cliente_id && x.competencia === lote.competencia && x.origem === 'lote' && x.situacao !== 'cancelada')) continue
        const { linhas } = linhasDoMes(c.cliente_id, lote.competencia)
        if (!linhas.length) continue
        const cb = criarCobranca({ cliente_id: c.cliente_id, competencia: lote.competencia, origem: 'lote', linhas, vencimento: `${lote.competencia}-${String(c.dia_vencimento).padStart(2, '0')}`, lote_id: lote.id, texto: `Cobrança gerada pelo lote de ${rotuloCompetencia(lote.competencia)}, aprovado por ${quem}` })
        marcarFaturados(cb)
        n++
        total += cb.valor
      }
      repos.lotesFaturamento.atualizar(lote.id, { situacao: lote.excecoes.length ? 'parcial' : 'emitido' }, { texto: `${quem} aprovou o lote de ${rotuloCompetencia(lote.competencia)}: ${lote.quantidade} cobranças com NFS-e por serviço` })
      return { texto: `Lote de ${rotuloCompetencia(lote.competencia)} aprovado: ${n} cobranças de exemplo (${brl(total)}) e mais ${lote.agregado?.clientes ?? 0} da carteira saem com boleto, Pix e NFS-e por serviço.`, destino: { modulo: 'financeiro', aba: 'cobranca' }, rotulo: 'Ver as faturas' }
    }
    case 'cancelar_cobranca': {
      const cb = repos.cobrancas.cancelar(a.cobranca_id, a.motivo)
      notasDa(cb.id, 'cancelada', a.motivo)
      devolverFaturados(cb)
      return { texto: `Cobrança ${cb.numero} cancelada, com as NFS-e. Saiu do contas a receber.` }
    }
    case 'substituir_cobranca': {
      const velha = repos.cobrancas.obter(a.cobranca_id)!
      repos.cobrancas.atualizar(velha.id, { situacao: 'substituida', motivo: a.motivo, historico: [...velha.historico, { quando: quando(), texto: `Substituída por ${quem}: ${a.motivo}` }] }, { ferramenta: 'cobranca.substituir' })
      notasDa(velha.id, 'substituida', a.motivo)
      const diferenca = centavos(a.valor - velha.valor)
      const linhas: LinhaCobranca[] = [...velha.linhas.map((l) => ({ ...l, nota_id: null })), ...(diferenca ? [{ id: 'ldif', tipo: diferenca < 0 ? ('desconto' as const) : ('avulso' as const), descricao: diferenca < 0 ? `Correção: ${a.motivo}` : `Acréscimo: ${a.motivo}`, valor: diferenca, codigo: '17.19' }] : [])]
      const nova = criarCobranca({ cliente_id: velha.cliente_id, competencia: velha.competencia, origem: velha.origem, linhas, vencimento: a.vencimento, substitui_id: velha.id, texto: `Substitui a ${velha.numero} (${a.motivo}); aprovado por ${quem}` })
      return { texto: `${velha.numero} substituída pela ${nova.numero} (${brl(nova.valor)}, vence ${dataCurta(a.vencimento)}).`, destino: { modulo: 'financeiro', aba: 'cobranca', fatura: nova.id }, rotulo: 'Abrir a nova' }
    }
    case 'corrigir_nota': {
      const n = repos.notasEscritorio.obter(a.nota_id)!
      repos.notasEscritorio.atualizar(n.id, { situacao: 'emitida', numero: proximaNota(), codigo: a.codigo, motivo: null }, { ferramenta: 'nfse.escritorio.emitir', texto: `NFS-e corrigida e reemitida (${a.motivo}), aprovada por ${quem}` })
      if (n.cobranca_id) repos.cobrancas.anotar(n.cobranca_id, `NFS-e de ${n.servico} reemitida com o código ${a.codigo}: ${a.motivo}`)
      return { texto: `NFS-e de ${n.servico} reemitida (demonstração).` }
    }
    case 'cancelar_nota': {
      const n = repos.notasEscritorio.atualizar(a.nota_id, { situacao: 'cancelada', motivo: a.motivo }, { ferramenta: 'nfse.escritorio.cancelar', texto: `NFS-e cancelada por ${quem}: ${a.motivo}` })
      const cb = n.cobranca_id ? repos.cobrancas.obter(n.cobranca_id) : undefined
      if (cb && cb.situacao !== 'cancelada') {
        const resto = cb.linhas.filter((l) => !(l.codigo === n.codigo && l.tipo !== 'reembolso'))
        const valor = centavos(resto.reduce((s, l) => s + l.valor, 0))
        if (valor <= 0) repos.cobrancas.cancelar(cb.id, `NFS-e ${n.numero} cancelada: ${a.motivo}`)
        else repos.cobrancas.atualizar(cb.id, { linhas: resto, valor, historico: [...cb.historico, { quando: quando(), texto: `NFS-e ${n.numero} cancelada (${a.motivo}): a linha de ${n.servico} saiu da cobrança` }] }, { ferramenta: 'cobranca.ajustar' })
      }
      return { texto: `NFS-e ${n.numero} cancelada; a cobrança foi ajustada na mesma hora.` }
    }
    case 'acordo': {
      const cb = repos.cobrancas.obter(a.cobranca_id)!
      const total = centavos(cb.valor * (1 - a.desconto / 100))
      const parcela = centavos(total / a.parcelas)
      for (let i = 0; i < a.parcelas; i++) repos.parcelas.criar({ cobranca_id: cb.id, numero: i + 1, vencimento: somarDias(a.primeira, 30 * i), valor: i === a.parcelas - 1 ? centavos(total - parcela * (a.parcelas - 1)) : parcela, situacao: 'aberta' }, { texto: `Parcela ${i + 1} de ${a.parcelas} do acordo` })
      repos.cobrancas.anotar(cb.id, `Acordo em ${a.parcelas} parcela(s)${a.desconto ? ` com ${a.desconto}% de desconto` : ''}, aprovado por ${quem}; a régua para enquanto as parcelas estiverem em dia`, { situacao: 'em_acordo', regua_etapa: 'acordo' }, { ferramenta: 'cobranca.propor_acordo' })
      return { texto: `Acordo registrado: ${a.parcelas}× ${brl(parcela)}. A proposta vai ao cliente pelo número de Gestão e Atendimento.` }
    }
    case 'regua_firme':
      repos.cobrancas.anotar(a.cobranca_id, `D+10: cobrança firme enviada ao financeiro e ao sócio (pré-visualização aprovada por ${quem})`, { regua_etapa: 'D+10' }, { ferramenta: 'cobranca.pausar_regua' })
      return { texto: 'Mensagem firme enviada pelo número de Gestão e Atendimento e por e-mail.' }
    case 'aviso_formal':
      repos.cobrancas.anotar(a.cobranca_id, `D+30: aviso formal enviado com prazo de 10 dias e a data da pausa parcial (aprovado por ${quem})`, { regua_etapa: 'D+30', aviso_formal_em: HOJE }, { ferramenta: 'suspensao.aplicar' })
      return { texto: 'Aviso formal enviado no app e por e-mail. O cliente vê a data da pausa parcial.' }
    case 'pausa_parcial': {
      const cb = repos.cobrancas.anotar(a.cobranca_id, `D+45: pausa parcial aplicada por ${quem}. Pedidos novos e extras no app em espera; obrigações, prazos, guias e documentos devidos continuam`, { regua_etapa: 'D+45', pausa_parcial_em: HOJE }, { ferramenta: 'suspensao.aplicar' })
      loja.avisar({ para: [], tipo: 'cliente', setor: 'financeiro_escritorio', titulo: 'Pausa parcial no app do cliente', detalhe: 'reativa sozinha quando o pagamento for confirmado', destino: { modulo: 'financeiro', aba: 'cobranca', fatura: cb.id } })
      return { texto: 'Pausa parcial aplicada. A faixa no app explica o que fica em espera; reativa sozinha com o pagamento.' }
    }
    case 'emitir_avulsa': {
      const avulsos = a.avulsos.map((id) => repos.servicosAvulsos.obter(id)!).filter(Boolean)
      const despesas = a.despesas.map((id) => repos.despesasAdiantadas.obter(id)!).filter(Boolean)
      const linhas: LinhaCobranca[] = [...avulsos.map((x, k) => ({ id: `la${k}`, tipo: 'avulso' as const, descricao: x.descricao, valor: x.valor, codigo: '17.19', servico: 'societario' as const, ref_id: x.id })), ...despesas.map((d, k) => ({ id: `lr${k}`, tipo: 'reembolso' as const, descricao: `Reembolso: ${d.descricao}`, valor: d.valor, ref_id: d.id }))]
      const cb = criarCobranca({ cliente_id: a.cliente_id, competencia: a.vencimento.slice(0, 7), origem: avulsos.length ? 'avulsa' : 'reembolso', linhas, vencimento: a.vencimento, texto: `Cobrança avulsa combinando ${linhas.length} item(ns), aprovada por ${quem}` })
      marcarFaturados(cb)
      return { texto: `Cobrança avulsa ${cb.numero} emitida (${brl(cb.valor)}).`, destino: { modulo: 'financeiro', aba: 'cobranca', fatura: cb.id }, rotulo: 'Abrir' }
    }
    case 'aprovar_contas': {
      let total = 0
      for (const id of a.ids) {
        const c = repos.contasPagar.obter(id)
        if (!c || c.situacao === 'agendada' || c.situacao === 'paga') continue
        const pol = banco.ler('politica_financeira')[0]
        if (pol && c.valor > pol.limite_dois_aprovadores && !c.extras?.segundo_aprovador) {
          repos.contasPagar.atualizar(id, { aprovador_nome: quem, alerta: `1 de 2 aprovações (${quem}); falta o segundo sócio`, extras: { ...c.extras, primeiro_aprovador: quem } }, { ferramenta: 'conta_pagar.aprovar', texto: `${quem} aprovou ${c.fornecedor} (${brl(c.valor)}); acima de ${brl(pol.limite_dois_aprovadores)}, falta o segundo sócio` })
          continue
        }
        repos.contasPagar.atualizar(id, { situacao: 'agendada', aprovador_nome: quem, alerta: null }, { ferramenta: 'conta_pagar.aprovar', texto: `${quem} aprovou e agendou ${c.fornecedor} (${brl(c.valor)}); liberação final no banco` })
        total += c.valor
      }
      return { texto: `${a.ids.length} conta(s) agendada(s) · ${brl(total)}. A liberação final sai no banco, com o token de quem libera.` }
    }
    case 'ajuste_conciliacao':
      repos.lancamentos.ajustar(a.lancamento_id, a.valor, a.categoria, a.motivo)
      return { texto: 'Ajuste lançado; o lançamento original continua como veio do banco.' }
    case 'cobrar_extra_faixa': {
      const c = repos.contratosHonorarios.obter(a.contrato_id)!
      repos.servicosAvulsos.criar({ cliente_id: c.cliente_id, descricao: a.descricao, valor: a.valor, origem: 'faixa', situacao: 'a_faturar', aceite_ref: 'cláusula de excedente do contrato' }, { texto: `Excedente da faixa vai para a próxima fatura (aprovado por ${quem})` })
      repos.contratosHonorarios.atualizar(c.id, { faixa_estourada: null }, { texto: `Excedente da faixa do ${c.numero} cobrado como extra` })
      return { texto: `Excedente de ${brl(a.valor)} entra na próxima fatura.`, destino: { modulo: 'financeiro', aba: 'contratos' } }
    }
    case 'aditivo_assinatura': {
      const c = repos.contratosHonorarios.obter(a.contrato_id)!
      const ad = repos.aditivos.criar({ contrato_id: c.id, tipo: 'faixa', situacao: 'aguardando_assinatura', vigente_de: '2026-12', resumo: a.resumo, diff: [], versao_para: c.versao + 1, assinatura: { provedor: 'assinatura eletrônica (demonstração)', enviada_em: quando(), signatario: 'sócio do cliente' } })
      void servicos.assinatura.enviar({ documento: `Aditivo ${c.numero}`, signatarios: [{ nome: 'Sócio do cliente', email: 'socio@cliente.exemplo' }] }).then(() =>
        window.setTimeout(() => {
          const atual = repos.aditivos.obter(ad.id)
          if (atual?.situacao === 'aguardando_assinatura') repos.aditivos.atualizar(ad.id, { situacao: 'aceito', assinatura: { ...atual.assinatura!, assinada_em: quando() } }, { semAutorizar: true, texto: `Aditivo do ${c.numero} assinado pelo cliente (demonstração)` })
        }, 6000),
      )
      return { texto: 'Aditivo enviado para assinatura eletrônica. Quando o cliente assinar, a versão nova vale a partir da competência.' }
    }
    case 'reajuste': {
      for (const x of a.contratos) {
        const c = repos.contratosHonorarios.obter(x.id)
        if (!c || banco.ler('aditivo').some((d) => d.contrato_id === c.id && d.tipo === 'reajuste' && d.situacao === 'comunicado' && d.vigente_de === a.competencia)) continue
        const itens = banco.ler('item_contrato').filter((i) => i.contrato_id === c.id && !i.vigente_ate)
        const antes = itens.reduce((s, i) => s + i.valor, 0)
        repos.aditivos.criar({ contrato_id: c.id, tipo: 'reajuste', situacao: 'comunicado', vigente_de: a.competencia, resumo: `Reajuste de ${rotuloCompetencia(a.competencia)} pelo ${a.indice} (${x.percentual.toLocaleString('pt-BR')}%): carta pelo ${a.canal}`, diff: [{ campo: 'total', antes: brl(antes), depois: brl(centavos(antes * (1 + x.percentual / 100))) }], versao_para: c.versao + 1, comunicado_em: quando() })
      }
      return { texto: `Cartas de reajuste enviadas a ${a.contratos.length} clientes. A aplicação dos valores é outro cartão, na data-base.`, destino: { modulo: 'financeiro', aba: 'contratos' } }
    }
    case 'aplicar_reajuste': {
      for (const x of a.contratos) {
        const c = repos.contratosHonorarios.obter(x.id)
        if (!c) continue
        const itens = banco.ler('item_contrato').filter((i) => i.contrato_id === c.id && !i.vigente_ate)
        repos.contratosHonorarios.aditar(c.id, {
          contrato: {},
          itens: itens.map(({ servico, descricao, setor_id, valor, tipo_cobranca, faixa }) => ({ servico, descricao, setor_id, valor: centavos(valor * (1 + x.percentual / 100)), tipo_cobranca, faixa })),
          vigente_de: a.competencia,
          tipo: 'reajuste',
          diff: [{ campo: 'reajuste', antes: '—', depois: `${x.percentual.toLocaleString('pt-BR')}% (${a.indice})` }],
          resumo: `Reajuste pelo ${a.indice} aplicado por ${quem}`,
        })
        for (const ad of banco.ler('aditivo').filter((d) => d.contrato_id === c.id && d.tipo === 'reajuste' && d.situacao === 'comunicado')) repos.aditivos.atualizar(ad.id, { situacao: 'vigente' }, { texto: 'Reajuste comunicado passou a valer' })
      }
      return { texto: `Reajuste aplicado a ${a.contratos.length} contratos a partir de ${rotuloCompetencia(a.competencia)} (nunca retroativo).` }
    }
    case 'propor_avulso': {
      const av = repos.servicosAvulsos.atualizar(a.avulso_id, { extras: { proposta_enviada_em: quando() } }, { texto: `${quem} aprovou o envio da proposta do avulso ao cliente` })
      window.setTimeout(() => {
        const atual = repos.servicosAvulsos.obter(av.id)
        if (atual?.situacao === 'proposto') repos.servicosAvulsos.atualizar(av.id, { situacao: 'a_faturar', aceite_ref: `aceite no app do cliente em ${dataCurta(HOJE)} (demonstração)` }, { semAutorizar: true, texto: `Cliente aceitou no app: ${av.descricao}` })
      }, 5000)
      return { texto: 'Proposta enviada ao cliente pelo app. Com o aceite, o avulso vai para a próxima fatura.' }
    }
    case 'fechar_mes':
      repos.fechamentos.fechar(a.competencia, { custoHora: a.custo_hora })
      return { texto: `${rotuloCompetencia(a.competencia)} fechado. Lançamento retroativo bloqueado; reabrir só com motivo.`, destino: { modulo: 'financeiro', aba: 'resultado' } }
  }
}

/** O cartão `fik1` (o lote de dezembro do chat do Financeiro) e todos os `s07-*`. Devolve `true` se tratou. */
export function decidirCartaoFin(cartao: string, decisao: string, ctx: { loja: Loja; usuario: UsuarioCfg; permissoes: Permissoes }): boolean {
  if (!cartao.startsWith('s07-') && cartao !== 'fik1') return false
  const { loja, usuario, permissoes } = ctx
  const registro = repos.cartoes.obter(cartao)
  const acao: AcaoCartao | undefined = cartao === 'fik1' ? { tipo: 'lote', lote_id: banco.ler('lote_faturamento').find((l) => l.cartao_id === 'fik1')?.id ?? '' } : (registro?.argumentos as unknown as AcaoCartao)
  if (registro && registro.status !== 'pendente') {
    loja.toastErro(`Este cartão já foi decidido por ${String(registro.extras?.decidido_por_nome ?? registro.decidido_por)}.`)
    return true
  }
  const admin = usuario.papel === 'administrador'
  const gestorFin = permissoes.gere.includes('financeiro_escritorio')
  const alcada = String(registro?.extras?.alcada ?? 'gestor')
  if (!admin && (alcada === 'administrador' || !gestorFin)) {
    loja.toastErro(alcada === 'administrador' ? 'Este cartão é do Administrador: você vê, mas quem decide é ele.' : 'Só o Gestor do Financeiro ou o Administrador decide este cartão.')
    return true
  }
  if (acao?.tipo === 'aprovar_contas' && !admin) {
    const pol = banco.ler('politica_financeira')[0]
    const acima = acao.ids.map((id) => repos.contasPagar.obter(id)).filter((c) => c && c.valor > (pol?.limite_gestor ?? 5000))
    if (acima.length) {
      loja.toastErro(`Acima da sua alçada (${brl(pol?.limite_gestor ?? 5000)}): ${acima.map((c) => c!.fornecedor).join(', ')}. O cartão fica para o Administrador.`)
      return true
    }
  }
  loja.decidir(cartao, decisao)
  if (decisao === 'recusar') {
    loja.toast('Recusado. O integrante Financeiro não executa; o item continua como estava.')
    return true
  }
  if (!acao) {
    loja.toast('Aprovado.')
    return true
  }
  try {
    const r = executar(acao, usuario.nome, loja)
    loja.toast(r.texto, r.destino, r.rotulo)
  } catch (e) {
    loja.toastErro(e instanceof Error ? e.message : String(e))
  }
  return true
}

export { novoId }

import { useEffect, useMemo, useState } from 'react'
import { useLoja, type Destino } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import { usePermissao } from '@/components/kit'
import { fluxoCaixa, inicioProjecao, mesesCaixa } from '@/dados/financeiro'
import type { Cartao } from '@/dados/tipos'
import { duracaoEscrita } from '@/lib/escrita'
import { banco } from '@/nucleo/banco'
import type { CartaoAprovacao, NomeTabela, Tabelas } from '@/nucleo/modelo/entidades'
import type { Cobranca, ContratoHonorarios, ItemContrato } from '@/nucleo/modelo/financeiro'
import { useTabela } from '@/nucleo/react'
import { comoAtor, repos } from '@/nucleo/repositorios'
import { ID_ANDRADE } from '@/nucleo/semente'
import { montador } from '@/nucleo/semente/comum'
import { sementeS07Andrade, sementeS07Horizonte } from '@/nucleo/semente/s07'
import { emAberto, HOJE, itensVigentes, situacaoDaCobranca, somaItens } from './dominio'

/*
 * S07 · Leitura do Financeiro no banco (entidades do 09, 3.1) e a ponte com o
 * integrante: o que ele prepara vira cartão de aprovação (um registro só, no
 * chat dele, no topo da aba e no sino), e quem decide é uma pessoa.
 */

export const INTEGRANTE_FIN = 'i-financeiro'
const SETOR_FIN = 'financeiro_escritorio' as const
const tabelasS07: NomeTabela[] = ['politica_financeira', 'centro_custo', 'categoria_gerencial', 'item_tabela_avulsos', 'contrato_honorarios', 'item_contrato', 'aditivo', 'conta_bancaria', 'cobranca', 'parcela', 'nota_servico_escritorio', 'recebimento', 'despesa_adiantada', 'servico_avulso', 'lote_faturamento', 'fechamento_financeiro', 'conta_pagar', 'lancamento', 'regra_categorizacao', 'cenario_caixa', 'tarefa']

/**
 * Banco guardado antes do S07 (tabela nova entra vazia): a primeira abertura do
 * Financeiro traz a semente do escritório ativo, sem mexer no resto.
 */
export function garantirSementeS07() {
  if (banco.estado !== 'pronto' || !banco.escritorioId || banco.ler('politica_financeira').length) return
  const { foto, add } = montador(banco.escritorioId, '2026-11-18T07:00:00.000Z')
  ;(banco.escritorioId === ID_ANDRADE ? sementeS07Andrade : sementeS07Horizonte)(foto, add)
  banco.transacao((tx) => {
    for (const t of tabelasS07) for (const linha of foto[t] as Tabelas[typeof t][]) if (!tx.obter(t, linha.id)) tx.gravar(t, linha as never)
  })
}

const ativos = <T extends { arquivado_em?: string | null }>(xs: T[]) => xs.filter((x) => !x.arquivado_em)

export interface ContratoTela extends ContratoHonorarios {
  cliente: string
  regime: string
  itens: ItemContrato[]
  total: number
}

/** Tudo o que as abas leem, já ligado (cliente pelo nome, itens vigentes, situação derivada). */
export function useFin() {
  useEffect(garantirSementeS07, [])
  const tCliente = useTabela('cliente')
  const politicas = useTabela('politica_financeira')
  const tContratos = useTabela('contrato_honorarios')
  const tItens = useTabela('item_contrato')
  const aditivos = useTabela('aditivo')
  const cobrancasT = useTabela('cobranca')
  const parcelas = useTabela('parcela')
  const notas = useTabela('nota_servico_escritorio')
  const recebimentos = useTabela('recebimento')
  const despesas = useTabela('despesa_adiantada')
  const avulsos = useTabela('servico_avulso')
  const lotes = useTabela('lote_faturamento')
  const contasBancarias = useTabela('conta_bancaria')
  const lancamentos = useTabela('lancamento')
  const contasPagar = useTabela('conta_pagar')
  const centros = useTabela('centro_custo')
  const categorias = useTabela('categoria_gerencial')
  const regras = useTabela('regra_categorizacao')
  const fechamentos = useTabela('fechamento_financeiro')
  const cenarios = useTabela('cenario_caixa')
  const tabelaAvulsos = useTabela('item_tabela_avulsos')
  const tTarefas = useTabela('tarefa')
  const tCartoes = useTabela('cartao_aprovacao')

  return useMemo(() => {
    const clientes = ativos(tCliente)
    const nomeCliente = (id?: string | null) => clientes.find((c) => c.id === id)?.nome ?? tCliente.find((c) => c.id === id)?.nome ?? id ?? '—'
    const regimeRotulo = { simples: 'Simples Nacional', presumido: 'Lucro Presumido', real: 'Lucro Real', mei: 'MEI', imune_isento: 'Imune ou isento', pf: 'Pessoa física' } as const
    const contratos: ContratoTela[] = ativos(tContratos)
      .filter((c) => c.situacao !== 'cancelado')
      .map((c) => {
        const itens = itensVigentes(tItens, c.id)
        const cli = tCliente.find((x) => x.id === c.cliente_id)
        return { ...c, cliente: cli?.nome ?? c.cliente_id, regime: cli ? regimeRotulo[cli.regime] : '—', itens, total: somaItens(itens) }
      })
      .sort((a, b) => a.cliente.localeCompare(b.cliente))
    const contratoDe = (clienteId: string) => contratos.find((c) => c.cliente_id === clienteId && c.situacao !== 'encerrado')
    const semContrato = clientes.filter((c) => !contratoDe(c.id) && c.estado_ciclo !== 'encerrado' && c.estado_ciclo !== 'prospect')
    const cobrancas = ativos(cobrancasT).sort((a, b) => b.competencia.localeCompare(a.competencia) || a.vencimento.localeCompare(b.vencimento))
    const informada = (c: Cobranca) => recebimentos.some((r) => r.cobranca_id === c.id && r.situacao === 'informado')
    const situacao = (c: Cobranca) => situacaoDaCobranca(c, HOJE, informada(c))
    const politica = politicas[0]
    const cartoesS07 = tCartoes.filter((c) => c.extras?.s07)
    const pendentes = cartoesS07.filter((c) => c.status === 'pendente' && (!c.extras?.visivel_apos || Number(c.extras.visivel_apos) <= Date.now()))
    const comandas = ativos(tTarefas).filter((t) => t.extras?.servico_extra && t.status !== 'cancelada')
    return {
      clientes,
      nomeCliente,
      politica,
      contratos,
      contratoDe,
      semContrato,
      aditivos,
      itensTodos: tItens,
      cobrancas,
      situacao,
      informada,
      abertas: cobrancas.filter(emAberto),
      parcelas,
      notas: [...notas].sort((a, b) => b.competencia.localeCompare(a.competencia) || b.numero.localeCompare(a.numero)),
      recebimentos,
      despesas: ativos(despesas),
      avulsos: ativos(avulsos),
      lotes,
      contasBancarias: ativos(contasBancarias).filter((c) => c.titular_tipo === 'escritorio'),
      lancamentos: ativos(lancamentos).filter((l) => l.titular_tipo === 'escritorio').sort((a, b) => b.data.localeCompare(a.data)),
      contasPagar: ativos(contasPagar).filter((c) => c.titular_tipo === 'escritorio').sort((a, b) => a.vencimento.localeCompare(b.vencimento)),
      centros,
      categorias,
      regras,
      fechamentos,
      cenarios,
      tabelaAvulsos,
      comandas,
      cartoesS07,
      pendentes,
    }
  }, [tCliente, politicas, tContratos, tItens, aditivos, cobrancasT, parcelas, notas, recebimentos, despesas, avulsos, lotes, contasBancarias, lancamentos, contasPagar, centros, categorias, regras, fechamentos, cenarios, tabelaAvulsos, tTarefas, tCartoes])
}
export type Fin = ReturnType<typeof useFin>

/** Re-renderiza a cada poucos segundos (cartão que o integrante ainda está preparando aparece quando ele termina). */
export function useRelogio(ms = 2000) {
  const [, setN] = useState(0)
  useEffect(() => {
    const t = window.setInterval(() => setN((n) => n + 1), ms)
    return () => window.clearInterval(t)
  }, [ms])
}

/** Permissão numa ferramenta do Financeiro (setor do Financeiro como alvo). */
export function usePodeFin(ferramenta: string) {
  return usePermissao(ferramenta, { setor_id: SETOR_FIN }).permitido
}

/** Até quanto a conta aprova (Configurar › Alçadas): Administrador sem teto; Gestor do Financeiro até o limite da política. */
export function useLimiteAprovacao(fin?: Fin) {
  const { usuario, permissoes } = useSessao()
  const limite = fin?.politica?.limite_gestor ?? 5000
  if (usuario.papel === 'administrador') return Infinity
  return permissoes.gere.includes(SETOR_FIN) ? limite : 0
}

/* ---------- O integrante prepara; a pessoa decide ---------- */

export type AcaoCartao =
  | { tipo: 'lote'; lote_id: string }
  | { tipo: 'cancelar_cobranca'; cobranca_id: string; motivo: string }
  | { tipo: 'substituir_cobranca'; cobranca_id: string; motivo: string; valor: number; vencimento: string }
  | { tipo: 'corrigir_nota'; nota_id: string; motivo: string; codigo: string }
  | { tipo: 'cancelar_nota'; nota_id: string; motivo: string }
  | { tipo: 'acordo'; cobranca_id: string; parcelas: number; desconto: number; primeira: string }
  | { tipo: 'regua_firme'; cobranca_id: string }
  | { tipo: 'aviso_formal'; cobranca_id: string }
  | { tipo: 'pausa_parcial'; cobranca_id: string }
  | { tipo: 'emitir_avulsa'; cliente_id: string; avulsos: string[]; despesas: string[]; vencimento: string }
  | { tipo: 'aprovar_contas'; ids: string[] }
  | { tipo: 'ajuste_conciliacao'; lancamento_id: string; valor: number; categoria: string; motivo: string }
  | { tipo: 'cobrar_extra_faixa'; contrato_id: string; valor: number; descricao: string }
  | { tipo: 'aditivo_assinatura'; contrato_id: string; resumo: string }
  | { tipo: 'reajuste'; competencia: string; indice: string; percentual: number; contratos: { id: string; percentual: number }[]; canal: string }
  | { tipo: 'aplicar_reajuste'; competencia: string; indice: string; contratos: { id: string; percentual: number }[] }
  | { tipo: 'propor_avulso'; avulso_id: string }
  | { tipo: 'fechar_mes'; competencia: string; custo_hora: number }

export interface PedidoCartao {
  /** Sem o prefixo: vira `s07-<id>`. */
  id: string
  acao: AcaoCartao
  resumo: string
  argumentos: { rotulo: string; valor: string }[]
  /** Frase do integrante no chat. */
  texto: string
  /** Aba do Financeiro onde o cartão aparece no topo. */
  aba: string
  /** Quem pode aprovar: `gestor` (Gestor do Financeiro na alçada) ou `administrador`. */
  alcada: 'gestor' | 'administrador'
  ferramenta: string
  destino?: Destino
  expiraDias?: number
  cliente_id?: string | null
}

const quandoExpira = (dias: number) => new Date(Date.parse(`${HOJE}T12:00:00Z`) + dias * 864e5).toISOString()

function gravarCartao(p: PedidoCartao, visivelApos = 0): string {
  const id = `s07-${p.id}`
  const atual = repos.cartoes.obter(id)
  if (atual && atual.status === 'pendente') return id
  const dados: Omit<CartaoAprovacao, 'id' | 'escritorio_id' | 'criado_em' | 'atualizado_em'> = {
    ferramenta: p.ferramenta,
    argumentos: p.acao as unknown as Record<string, unknown>,
    resumo_humano: p.resumo,
    pedido_por_tipo: 'integrante',
    pedido_por_id: INTEGRANTE_FIN,
    pode_aprovar: p.alcada === 'administrador' ? ['administrador'] : ['administrador', 'gestor:financeiro_escritorio'],
    status: 'pendente',
    expira_em: quandoExpira(p.expiraDias ?? 5),
    extras: { s07: true, aba: p.aba, alcada: p.alcada, argumentos_tela: p.argumentos, visivel_apos: visivelApos, destino: p.destino ?? { modulo: 'financeiro', aba: p.aba }, cliente_id: p.cliente_id ?? null },
  }
  comoAtor({ ator: { tipo: 'integrante', id: INTEGRANTE_FIN, nome: 'Financeiro' }, origem: 'job' }, () => {
    if (atual) repos.cartoes.atualizar(id, dados as Partial<CartaoAprovacao>, { semAutorizar: true, texto: `Financeiro preparou de novo: ${p.resumo}` })
    else repos.cartoes.criar({ id, ...dados }, { texto: `Financeiro preparou para aprovação: ${p.resumo}` })
  })
  return id
}

const cartaoChat = (id: string, p: PedidoCartao): Cartao => ({ tipo: 'aprovacao', id, resumo: p.resumo, argumentos: p.argumentos, expiraEm: `expira em ${p.expiraDias ?? 5} dias` })

/**
 * Hook com as duas formas de o integrante entregar trabalho:
 *  - `pedirCartao`: a pessoa pediu algo que só sai com aprovação (cancelar,
 *    acordo, aviso formal): o integrante prepara na hora e o cartão aparece.
 *  - `trabalhar`: o integrante faz um trabalho com etapas (preparar o lote,
 *    capturar o DDA, conciliar) e, ao terminar, entrega o resultado e, se for o
 *    caso, o cartão.
 */
export function useIntegranteFin() {
  const loja = useLoja()
  return {
    pedirCartao(p: PedidoCartao) {
      const id = gravarCartao(p)
      loja.mensagemTime(INTEGRANTE_FIN, { autor: { tipo: 'integrante', setor: SETOR_FIN }, texto: p.texto, cartoes: [cartaoChat(id, p)] })
      loja.avisar({ para: [], tipo: 'cartao', setor: SETOR_FIN, titulo: p.resumo, detalhe: p.argumentos.map((a) => `${a.rotulo}: ${a.valor}`).join(' · '), destino: p.destino ?? { modulo: 'financeiro', aba: p.aba } })
      return id
    },
    trabalhar(t: { id: string; titulo: string; inicio: string; etapas: string[]; fim: string; aviso?: string; seg?: number; cartao?: PedidoCartao; cliente?: string; aoTerminar?: () => void }) {
      const seg = t.seg ?? 1.6
      const espera = 1500 + duracaoEscrita(t.inicio) + 300 + t.etapas.length * seg * 1000 + 1800 + duracaoEscrita(t.fim) + 300
      const cartoes: Cartao[] = []
      if (t.cartao) {
        const id = gravarCartao(t.cartao, Date.now() + espera)
        cartoes.push(cartaoChat(id, t.cartao))
      }
      loja.iniciarTrabalho({ id: `s07-${t.id}`, integrante: INTEGRANTE_FIN, setor: SETOR_FIN, titulo: t.titulo, cliente: t.cliente, inicio: t.inicio, etapas: t.etapas, seg, fim: { texto: t.fim, cartoes: cartoes.length ? cartoes : undefined, aviso: t.aviso } })
      if (t.aoTerminar) window.setTimeout(t.aoTerminar, espera)
      loja.toast(`Financeiro começou: ${t.titulo}`, { modulo: 'inicio', aba: 'time', integrante: INTEGRANTE_FIN }, 'Acompanhar', { tipo: 'integrante', setor: SETOR_FIN, estado: 'trabalhando' })
    },
    /** O integrante está trabalhando nisto agora? */
    fazendo: (id: string) => loja.estado.trabalhos.some((x) => x.id === `s07-${id}` && x.situacao === 'rodando'),
  }
}

/* ---------- Fluxo de caixa: realizado e projetado (09, 7.1) ---------- */

/** Receita mensal dos contratos de exemplo na semente do Andrade (base da série de src/dados). */
const RECEITA_BASE_ANDRADE = 41_720 + 165_900

/**
 * Doze meses em milhares: no escritório completo, o realizado de jun a out é o
 * de src/dados e o projetado acompanha os contratos (mudar um contrato muda a
 * projeção); no escritório sem histórico, tudo é projetado a partir dos contratos.
 */
export function projecaoCaixa(fin: Fin, ajusteEntradas = 0, ajusteSaidas = 0) {
  const mrr = fin.contratos.filter((c) => c.situacao === 'ativo').reduce((s, c) => s + c.total, 0)
  const completo = fin.clientes.some((c) => c.id === 'c1')
  if (completo) {
    const delta = Math.round((mrr + 165_900 - RECEITA_BASE_ANDRADE) / 1000)
    const entradas = fluxoCaixa.entradas.map((v, i) => (i >= inicioProjecao ? Math.max(0, v + delta + ajusteEntradas) : v))
    const saidas = fluxoCaixa.saidas.map((v, i) => (i >= inicioProjecao ? Math.max(0, v + ajusteSaidas) : v))
    return { meses: mesesCaixa, entradas, saidas, inicio: inicioProjecao, marcos: fluxoCaixa.marcos, completo }
  }
  const meses = ['nov', 'dez', 'jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out']
  const base = Math.round(mrr / 1000)
  const pagar = Math.round(fin.contasPagar.filter((c) => c.situacao !== 'cancelada').reduce((s, c) => s + c.valor, 0) / 1000)
  const entradas = meses.map((_, i) => Math.max(0, base + (i === 1 ? base : 0) + ajusteEntradas))
  const saidas = meses.map(() => Math.max(0, Math.round(pagar || base * 0.7) + ajusteSaidas))
  return { meses, entradas, saidas, inicio: 0, marcos: base ? [{ mes: 1, texto: '13º dos clientes entra' }] : [], completo }
}

/** Titular do dinheiro desta tela (DA-02.1): o próprio escritório, pela razão social do banco. */
export function useTitularEscritorio() {
  const e = useTabela('escritorio')[0]
  return { tipo: 'escritorio' as const, nome: e?.razao_social ?? 'o escritório' }
}

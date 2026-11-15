import { useEffect } from 'react'
import { useLoja } from '@/ambiente/loja'
import type { FimFluxo } from '@/dados/simulacao'
import { banco } from '@/nucleo/banco'
import type { Contexto } from '@/nucleo/permissoes'
import { useTabela } from '@/nucleo/react'
import { comoAtor, repos } from '@/nucleo/repositorios'
import type { SetorIntegrante } from '@/theme/tipos'
import { agoraBpo, brl } from './dados'
import { extrasS08a, gravarS08a, type ConviteApp } from './perfil-s08a'

/**
 * S08a · Trabalhos dos integrantes na Visão geral, na Carteira, na ficha BPO
 * e na implantação da empresa. Mesmo padrão da S08 (`integrantes.ts`): a tela
 * pede, o integrante aparece trabalhando no Time e, ao terminar, o efeito
 * acontece no banco em nome dele. O que sai ao cliente (o convite do app)
 * vira cartão de aprovação: nada sai sem uma pessoa aprovar. Nunca paga,
 * nunca confere, nunca confirma dado bancário (B2, B3; 10, 6).
 *
 * Os efeitos pendentes ficam em `s08a:efeitos` (sobrevivem a recarregar) e o
 * que cada cartão faz, em `s08a:cartoes`.
 */

export type IntegranteS08a = 'i-bpo' | 'i-bpo-conciliacao' | 'i-bpo-gerencial'
const setorDe: Record<IntegranteS08a, SetorIntegrante> = { 'i-bpo': 'bpo_pagar', 'i-bpo-conciliacao': 'bpo_conciliacao', 'i-bpo-gerencial': 'bpo_gerencial' }
export const nomeIntegranteS08a: Record<IntegranteS08a, string> = { 'i-bpo': 'Contas a Pagar', 'i-bpo-conciliacao': 'Conciliação', 'i-bpo-gerencial': 'Gerencial' }

export type EfeitoS08a =
  | { tipo: 'carga_inicial'; perfilId: string; clienteId: string }
  | { tipo: 'listar_fornecedores'; clienteId: string }
  | { tipo: 'comparar_paralelo'; perfilId: string; clienteId: string }
  | { tipo: 'preparar_convite'; perfilId: string; clienteId: string; convites: ConviteApp[]; cartaoId: string }
  | { tipo: 'sincronizar_carteira'; clienteIds: string[] }

const CHAVE = 's08a:efeitos'
const CHAVE_CARTOES = 's08a:cartoes'
type Pendentes = Record<string, { integrante: IntegranteS08a; efeito: EfeitoS08a }>
const pendentes = () => (banco.obter('registro_tela', CHAVE)?.valor as Pendentes | undefined) ?? {}
const cartoes = () => (banco.obter('registro_tela', CHAVE_CARTOES)?.valor as Record<string, { tipo: 'convite'; perfilId: string; clienteId: string }> | undefined) ?? {}

const ctxDe = (i: IntegranteS08a): Contexto => ({ ator: { tipo: 'integrante', id: i, nome: `${nomeIntegranteS08a[i]} (integrante)` }, origem: 'job' })

/** Fornecedores recorrentes que o espelho do ERP mostra (lista de exemplo, por ramo do nome). */
export function recorrentesDoErp(nome: string) {
  const n = nome.toLowerCase()
  const ramo = /padaria|mercado|pão|bom preço/.test(n)
    ? ['Moinho Santa Clara (farinha)', 'Laticínios Serra Azul', 'Energia (concessionária)']
    : /clínica|sorriso|odonto/.test(n)
      ? ['Dental Sul Materiais', 'Laboratório Prótese Fina', 'Energia (concessionária)']
      : /auto|peças|oficina/.test(n)
        ? ['Distribuidora Rota Peças', 'Lubrificantes Norte', 'Aluguel do galpão']
        : ['Aluguel da sala', 'Internet e telefone', 'Energia (concessionária)']
  return ramo
}

/** Aplica o efeito no banco, como o integrante. */
function aplicar(integrante: IntegranteS08a, ef: EfeitoS08a) {
  const quem = `${nomeIntegranteS08a[integrante]} (integrante)`
  comoAtor(ctxDe(integrante), () => {
    if (ef.tipo === 'carga_inicial') {
      const contas = banco.ler('bpo_conta').filter((c) => c.cliente_id === ef.clienteId && c.tipo === 'pagar').length
      const fornecedores = banco.ler('bpo_fornecedor').filter((f) => f.cliente_id === ef.clienteId).length
      gravarS08a(ef.perfilId, (x) => ({ ...x, carga: { extrato_dias: 90, contas, fornecedores, em: agoraBpo(), por: quem } }), {}, { ferramenta: 'erp.sincronizar', texto: `${quem} trouxe 90 dias de extrato e as contas em aberto para o espelho` })
    }
    if (ef.tipo === 'listar_fornecedores') {
      const cliente = banco.obter('cliente', ef.clienteId)
      const ja = banco.ler('bpo_fornecedor').filter((f) => f.cliente_id === ef.clienteId).map((f) => f.nome)
      for (const nome of recorrentesDoErp(cliente?.nome ?? '').filter((x) => !ja.includes(x)))
        repos.bpo.fornecedores.criar({ cliente_id: ef.clienteId, nome, risco: 'novo', banco: 'do espelho do ERP (a confirmar por segundo canal)' }, { texto: `${quem} listou ${nome} como fornecedor recorrente (dados bancários a confirmar por uma pessoa)` })
    }
    if (ef.tipo === 'comparar_paralelo') {
      const contas = banco.ler('bpo_conta').filter((c) => c.cliente_id === ef.clienteId && c.tipo === 'pagar')
      const preparadas = Math.max(contas.length, 6)
      const divergencias = [`1 conta paga pelo cliente fora do lote: ${contas[0]?.contraparte ?? 'Energia (concessionária)'} (${brl(contas[0]?.valor ?? 412)}), sem passar pelo cartão`, '1 boleto com vencimento diferente do ERP (o ERP vence; a divergência virou pendência)']
      gravarS08a(ef.perfilId, (x) => ({ ...x, paralelo: { ...(x.paralelo ?? { inicio: agoraBpo() }), comparacao: { preparadas, pagas_pelo_cliente: preparadas - 1, iguais: preparadas - 2, divergencias, por: quem, em: agoraBpo() } } }), {}, { ferramenta: 'bpo.onboarding', texto: `${quem} comparou o mês em paralelo: ${preparadas - 2} de ${preparadas} iguais, ${divergencias.length} divergências` })
    }
    if (ef.tipo === 'preparar_convite') {
      gravarS08a(ef.perfilId, (x) => ({ ...x, convites: ef.convites.map((c) => ({ ...c, situacao: 'preparado' as const })), cartao_convite: ef.cartaoId }), {}, { ferramenta: 'bpo.onboarding', texto: `${quem} preparou o convite do app para ${ef.convites.map((c) => c.nome).join(' e ')} (pede aprovação antes de sair)` })
      repos.telas.lembrar(CHAVE_CARTOES, { ...cartoes(), [ef.cartaoId]: { tipo: 'convite', perfilId: ef.perfilId, clienteId: ef.clienteId } })
    }
    if (ef.tipo === 'sincronizar_carteira') {
      for (const id of ef.clienteIds) {
        const x = banco.ler('bpo_conexao_erp').find((c) => c.cliente_id === id)
        if (x) repos.bpo.conexoes.atualizar(x.id, { ultima_sincronizacao: agoraBpo() }, { ferramenta: 'erp.sincronizar', texto: `${quem} sincronizou o espelho do ${x.provedor}` })
      }
    }
  })
}

/** Aplica os efeitos dos trabalhos da S08a que terminaram (montado no módulo BPO e em Clientes). */
export function useEfeitosS08a() {
  const loja = useLoja()
  const tTela = useTabela('registro_tela')
  useEffect(() => {
    const p = pendentes()
    const ids = Object.keys(p)
    if (!ids.length) return
    const feitos = ids.filter((id) => loja.estado.trabalhos.some((t) => t.id === id && t.situacao === 'concluido'))
    if (!feitos.length) return
    const resto = { ...p }
    for (const id of feitos) {
      try {
        aplicar(p[id].integrante, p[id].efeito)
      } catch (e) {
        console.error('[heild] efeito da S08a não aplicado:', e)
      }
      delete resto[id]
    }
    repos.telas.lembrar(CHAVE, resto)
  }, [loja.estado.trabalhos, tTela])
}

/** Trabalhos desta sessão ainda rodando, por tipo e empresa (para a tela mostrar "trabalhando…"). */
export function useTrabalhandoS08a(tipo: EfeitoS08a['tipo'], clienteId?: string) {
  useTabela('registro_tela')
  const loja = useLoja()
  const p = pendentes()
  return Object.entries(p).some(([id, v]) => v.efeito.tipo === tipo && (!clienteId || ('clienteId' in v.efeito && v.efeito.clienteId === clienteId)) && loja.estado.trabalhos.some((t) => t.id === id && t.situacao !== 'concluido'))
}

/** Põe um integrante para trabalhar (aparece no Time) e, se houver, agenda o efeito no banco. */
export function usePedirS08a() {
  const loja = useLoja()
  return (p: { integrante: IntegranteS08a; titulo: string; cliente?: string; inicio: string; etapas: string[]; fim: FimFluxo; efeito?: EfeitoS08a; id?: string }) => {
    const id = p.id ?? `s08a-${p.efeito?.tipo ?? 'explicar'}-${Date.now().toString(36)}`
    if (p.efeito) repos.telas.lembrar(CHAVE, { ...pendentes(), [id]: { integrante: p.integrante, efeito: p.efeito } })
    loja.iniciarTrabalho({ id, integrante: p.integrante, setor: setorDe[p.integrante], titulo: p.titulo, cliente: p.cliente, inicio: p.inicio, etapas: p.etapas, seg: 1.4, fim: p.fim })
    loja.toast(`${nomeIntegranteS08a[p.integrante]} começou: ${p.titulo}`, { modulo: 'inicio', aba: 'time', integrante: p.integrante }, 'Acompanhar', { tipo: 'integrante', setor: setorDe[p.integrante], estado: 'trabalhando' })
    return id
  }
}

/**
 * O que os cartões `s08a-*` fazem quando a pessoa decide (chamado por
 * `ambiente/efeitos.tsx`). Convite aprovado sai pelo app; recusado, nada sai.
 */
export function efeitoCartaoS08a(loja: ReturnType<typeof useLoja>, cartao: string, decisao: string, quem: string): boolean {
  if (!cartao.startsWith('s08a-')) return false
  const c = cartoes()[cartao]
  if (!c) return true
  const p = banco.obter('bpo_perfil', c.perfilId)
  const nome = banco.obter('cliente', c.clienteId)?.nome ?? ''
  if (!p) return true
  if (decisao === 'recusar') {
    gravarS08a(p.id, (x) => ({ ...x, convites: (x.convites ?? []).map((v) => (v.situacao === 'preparado' ? { ...v, situacao: 'recusado' as const } : v)), cartao_convite: null }), {}, { ferramenta: 'bpo.onboarding', texto: `${quem} recusou o convite preparado para ${nome}: nada foi enviado` })
    loja.toast('Recusado: nenhum convite saiu. Ajuste e peça de novo na ficha.')
    return true
  }
  const enviados = (extrasS08a(p).convites ?? []).filter((v) => v.situacao === 'preparado').map((v) => v.nome)
  gravarS08a(p.id, (x) => ({ ...x, convites: (x.convites ?? []).map((v) => (v.situacao === 'preparado' ? { ...v, situacao: 'enviado' as const, enviado_em: agoraBpo() } : v)) }), {}, { ferramenta: 'bpo.onboarding', texto: `${quem} aprovou: convite do app enviado a ${enviados.join(' e ')}` })
  loja.avisar({ para: [], tipo: 'cliente', setor: 'bpo_financeiro', titulo: `Convite do app enviado a ${enviados.length} pessoa${enviados.length > 1 ? 's' : ''} de ${nome}`, detalhe: 'aguardando o primeiro acesso', destino: { modulo: 'bpo', aba: 'carteira', cliente: c.clienteId } })
  loja.toast(`Convite enviado a ${enviados.join(' e ')}. O passo fecha quando entrarem no app.`)
  return true
}

/** O que o integrante sugere para cada critério da auditoria (para "explicar a cor"). */
export const sugestaoCriterio: Record<string, string> = {
  vencido_sem_aprovacao: 'avisar o sócio hoje; o sistema nunca paga sem a aprovação dele',
  credencial_vencida: 'pedir nova autorização ao cliente pelo app',
  sincronizacao_atrasada: 'religar a sincronização ou ver o conector em Configurações',
  caixa_abaixo_minimo: 'avisar o cliente e segurar o próximo lote até entrar dinheiro',
  conciliacao_atrasada: 'conciliar o extrato atrasado (o que casa por regra eu faço)',
  sla_abaixo_meta: 'olhar os desvios em Entregas e SLA',
  lote_recusado: 'refazer o lote com o motivo do cliente',
  lote_vence_hoje: 'lembrar o aprovador antes do horário',
  fornecedor_novo: 'confirmar os dados bancários por segundo canal antes do lote',
  modo_arquivo_pendente: 'lançar as baixas no ERP à mão (modo arquivo)',
  conector_instavel: 'acompanhar: costuma voltar no próximo ciclo',
  consentimento_vencendo: 'renovar o consentimento do Open Finance com o cliente',
  em_paralelo: 'fechar a comparação do paralelo e ativar',
}

/** Texto do integrante explicando a cor de uma empresa: o que pesa e o que fazer, do mais pesado ao mais leve. */
export function explicarAudit(e: { nome: string; audit: { cor: string; pontos: number; motivos: { criterio: string; texto: string; peso: number }[] } }) {
  const rot = ({ verde: 'em dia', amarelo: 'atenção', vermelho: 'agir hoje' } as Record<string, string>)[e.audit.cor]
  if (!e.audit.motivos.length) return `${e.nome} está em dia: conciliação, aprovações, ERP e caixa sem pendência. Sigo nas rotinas.`
  const vistos = new Set<string>()
  const itens = e.audit.motivos.filter((m) => (vistos.has(m.criterio) ? false : (vistos.add(m.criterio), true))).slice(0, 4)
  return `${e.nome} está em “${rot}” com ${e.audit.pontos} pontos. ${itens.map((m, i) => `${i === 0 ? 'O que mais pesa' : 'Depois'}: ${m.texto} (peso ${m.peso}); sugiro ${sugestaoCriterio[m.criterio] ?? 'olhar o item'}.`).join(' ')} Pagar, conferir e confirmar dado bancário continuam com vocês.`
}

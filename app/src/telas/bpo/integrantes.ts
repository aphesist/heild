import { useEffect } from 'react'
import { useLoja } from '@/ambiente/loja'
import type { FimFluxo } from '@/dados/simulacao'
import { banco } from '@/nucleo/banco'
import type { Contexto } from '@/nucleo/permissoes'
import { useTabela } from '@/nucleo/react'
import { agora, comoAtor, repos } from '@/nucleo/repositorios'
import type { ContaLidaDoErp } from '@/servicos'
import type { SetorIntegrante } from '@/theme/tipos'
import { agoraBpo, brl } from './dados'

/**
 * S08 · Os integrantes do BPO trabalhando de verdade na demonstração: a tela
 * pede, o integrante da função aparece trabalhando no Time (etapas, aviso no
 * sino) e, quando termina, o efeito acontece no banco em nome dele (contas
 * capturadas do ERP, conciliação do que casa por regra, rascunho do relatório).
 * Nunca paga, nunca aprova, nunca confere (B2, B3): isso fica para as pessoas.
 *
 * O efeito pendente fica guardado (`s08:efeitos`) e é aplicado quando o
 * trabalho termina, mesmo se a pessoa recarregar a página no meio.
 */

export type IntegranteBpo = 'i-bpo' | 'i-bpo-receber' | 'i-bpo-conciliacao' | 'i-bpo-gerencial'
const setorDe: Record<IntegranteBpo, SetorIntegrante> = { 'i-bpo': 'bpo_pagar', 'i-bpo-receber': 'bpo_receber', 'i-bpo-conciliacao': 'bpo_conciliacao', 'i-bpo-gerencial': 'bpo_gerencial' }
const nomeDe: Record<IntegranteBpo, string> = { 'i-bpo': 'Contas a Pagar (integrante)', 'i-bpo-receber': 'Contas a Receber (integrante)', 'i-bpo-conciliacao': 'Conciliação (integrante)', 'i-bpo-gerencial': 'Gerencial (integrante)' }

export type EfeitoBpo =
  | { tipo: 'capturar'; clienteId: string; novas: ContaLidaDoErp[] }
  | { tipo: 'conciliar'; clienteId: string }
  | { tipo: 'relatorio'; clienteId: string; competencia: string }
  | { tipo: 'cobrar'; clienteId: string }
  | { tipo: 'completude'; filaId: string }

const CHAVE = 's08:efeitos'
const pendentes = () => (banco.obter('registro_tela', CHAVE)?.valor as Record<string, { integrante: IntegranteBpo; efeito: EfeitoBpo }> | undefined) ?? {}

const ctxDe = (i: IntegranteBpo): Contexto => ({ ator: { tipo: 'integrante', id: i, nome: nomeDe[i] }, origem: 'job' })

/** Aplica o efeito no banco, como o integrante. */
function aplicar(integrante: IntegranteBpo, ef: EfeitoBpo) {
  comoAtor(ctxDe(integrante), () => {
    if (ef.tipo === 'capturar') {
      const fornecedores = banco.ler('bpo_fornecedor').filter((f) => f.cliente_id === ef.clienteId)
      for (const n of ef.novas) {
        const conhecido = fornecedores.find((f) => f.nome === n.contraparte)
        if (!conhecido) repos.bpo.fornecedores.criar({ cliente_id: ef.clienteId, nome: n.contraparte, risco: 'novo', banco: 'dados do boleto (a confirmar por segundo canal)' })
        repos.bpo.contas.capturar({ cliente_id: ef.clienteId, contraparte: n.contraparte, categoria: n.categoria, valor: n.valor, vencimento: n.vencimento, origem: n.origem, alerta: conhecido ? null : 'fornecedor novo: confirmar os dados bancários por segundo canal antes do lote' })
      }
    }
    if (ef.tipo === 'conciliar') {
      for (const t of banco.ler('bpo_transacao').filter((x) => x.cliente_id === ef.clienteId && x.situacao === 'pendente' && x.confianca === 'alta'))
        repos.bpo.transacoes.atualizar(t.id, { situacao: 'conciliada', categoria: t.sugestao, conciliada_por: nomeDe[integrante] }, { texto: `${nomeDe[integrante]} conciliou ${t.descricao} como ${t.sugestao} (regra aprovada)` })
      for (const c of banco.ler('bpo_conta').filter((x) => x.cliente_id === ef.clienteId && x.etapa === 'liberada')) repos.bpo.contas.marcarPaga(c.id)
    }
    if (ef.tipo === 'relatorio') {
      const e = banco.ler('bpo_entrega').find((x) => x.cliente_id === ef.clienteId && x.tipo === 'relatorio' && x.competencia === ef.competencia)
      if (e) banco.transacao((tx) => tx.gravar('bpo_entrega', { ...e, extras: { ...e.extras, rascunho: true, rascunho_em: agoraBpo() }, atualizado_em: agora() }))
    }
    if (ef.tipo === 'cobrar') {
      for (const c of banco.ler('bpo_conta').filter((x) => x.cliente_id === ef.clienteId && x.tipo === 'receber' && x.etapa === 'atrasada'))
        banco.transacao((tx) => tx.gravar('bpo_conta', { ...c, alerta: 'lembrete de cobrança enviado pelo Atendimento (régua amigável)', atualizado_em: agora() }))
    }
    if (ef.tipo === 'completude') {
      const f = banco.obter('bpo_item_fila', ef.filaId)
      if (f) banco.transacao((tx) => tx.gravar('bpo_item_fila', { ...f, detalhe: `${f.detalhe ? `${f.detalhe} · ` : ''}o integrante pediu ao cliente: ${f.faltando.join(', ')}`, atualizado_em: agora() }))
    }
  })
}

/** Aplica os efeitos dos trabalhos do BPO que terminaram (monte uma vez no módulo). */
export function useEfeitosBpo() {
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
        console.error('[heild] efeito do BPO não aplicado:', e)
      }
      delete resto[id]
    }
    repos.telas.lembrar(CHAVE, resto)
  }, [loja.estado.trabalhos, tTela])
}

/** Põe um integrante do BPO para trabalhar (aparece no Time) e agenda o efeito no banco. */
export function usePedirBpo() {
  const loja = useLoja()
  return (p: { integrante: IntegranteBpo; titulo: string; cliente?: string; inicio: string; etapas: string[]; fim: FimFluxo; efeito: EfeitoBpo }) => {
    const id = `s08-${p.efeito.tipo}-${Date.now().toString(36)}`
    repos.telas.lembrar(CHAVE, { ...pendentes(), [id]: { integrante: p.integrante, efeito: p.efeito } })
    loja.iniciarTrabalho({ id, integrante: p.integrante, setor: setorDe[p.integrante], titulo: p.titulo, cliente: p.cliente, inicio: p.inicio, etapas: p.etapas, seg: 1.6, fim: p.fim })
    loja.toast(`${nomeDe[p.integrante].replace(' (integrante)', '')} começou: ${p.titulo}`, { modulo: 'inicio', aba: 'time', integrante: p.integrante }, 'Acompanhar', { tipo: 'integrante', setor: setorDe[p.integrante], estado: 'trabalhando' })
  }
}

export const textoCaptura = (novas: ContaLidaDoErp[], provedor: string) =>
  novas.length ? `Li o ${provedor} e capturei ${novas.length} conta${novas.length > 1 ? 's' : ''} nova${novas.length > 1 ? 's' : ''} (${brl(novas.reduce((s, n) => s + n.valor, 0))}). Ficaram em “para conferir”: quem digitou não confere, e eu não confiro.` : `Li o ${provedor}: nenhuma conta nova desde a última sincronização.`

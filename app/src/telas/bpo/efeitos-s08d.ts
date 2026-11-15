import { useEffect } from 'react'
import { useLoja } from '@/ambiente/loja'
import type { FimFluxo } from '@/dados/simulacao'
import { banco } from '@/nucleo/banco'
import type { BpoItemFila } from '@/nucleo/modelo/entidades'
import type { Contexto } from '@/nucleo/permissoes'
import { useTabela } from '@/nucleo/react'
import { agora, comoAtor, repos } from '@/nucleo/repositorios'
import type { SetorIntegrante } from '@/theme/tipos'
import { agoraBpo } from './dados'

/**
 * S08d · Trabalho simulado dos integrantes nas telas de gestão do BPO
 * (Entregas, Volume, Rentabilidade) e na frente entre escritórios. Mesmo
 * mecanismo do `integrantes.ts` (o integrante aparece trabalhando no Time e,
 * ao terminar, o efeito acontece no banco em nome dele), com chave própria
 * para não disputar o arquivo comum com as outras sessões do BPO.
 *
 * Nada aqui decide pela pessoa: a redistribuição é só proposta (o Gestor
 * aplica), o relatório do contratante é só rascunho (o Gestor fecha) e a
 * cobrança da bola é um lembrete, nunca uma decisão.
 */

export type IntegranteS08d = 'i-bpo-gerencial' | 'i-atendimento'
const setorDe: Record<IntegranteS08d, SetorIntegrante> = { 'i-bpo-gerencial': 'bpo_gerencial', 'i-atendimento': 'gestao_atendimento' }
export const nomeIntegranteS08d: Record<IntegranteS08d, string> = { 'i-bpo-gerencial': 'Gerencial (integrante)', 'i-atendimento': 'Atendimento (integrante)' }

export interface PropostaRedistribuicao {
  em: string
  por: string
  itens: { id: string; texto: string; de: string; para: string }[]
  resumo: string
}

export type EfeitoS08d =
  | { tipo: 'redistribuir'; capacidade: Record<string, number> }
  | { tipo: 'relatorio_contratante'; entregaId: string }
  | { tipo: 'cobrar_bola'; subinquilinoId: string }

export const CHAVE_REDISTRIBUICAO = 's08d:redistribuicao'
const CHAVE = 's08d:efeitos'
const pendentes = () => (banco.obter('registro_tela', CHAVE)?.valor as Record<string, { integrante: IntegranteS08d; efeito: EfeitoS08d }> | undefined) ?? {}
const ctxDe = (i: IntegranteS08d): Contexto => ({ ator: { tipo: 'integrante', id: i, nome: nomeIntegranteS08d[i] }, origem: 'job' })

/**
 * Proposta de redistribuição (BPO-016, autonomia P: projeta e sugere): tira
 * itens com a bola conosco de quem está acima da capacidade e passa para quem
 * tem folga, do prazo mais distante para o mais próximo (o urgente fica com
 * quem já conhece). Função pura, usada pelo integrante e pelo teste.
 */
export function proporRedistribuicao(fila: BpoItemFila[], capacidade: Record<string, number>): PropostaRedistribuicao['itens'] {
  const pessoas = Object.keys(capacidade)
  if (pessoas.length < 2) return []
  const horas = (nome: string, itens: BpoItemFila[]) => itens.filter((f) => f.responsavel_nome === nome).length * 1.5
  const abertos = fila.filter((f) => f.situacao === 'aberto' && f.bola === 'bpo' && f.responsavel_nome && pessoas.includes(f.responsavel_nome))
  const carga = Object.fromEntries(pessoas.map((p) => [p, horas(p, abertos) / Math.max(1, capacidade[p] / 4.33)]))
  const itens: PropostaRedistribuicao['itens'] = []
  const movidos = new Set<string>()
  for (let i = 0; i < 6; i++) {
    const ordem = [...pessoas].sort((a, b) => carga[b] - carga[a])
    const de = ordem[0]
    const para = ordem[ordem.length - 1]
    if (carga[de] - carga[para] < 0.25) break
    const candidato = abertos.filter((f) => f.responsavel_nome === de && !movidos.has(f.id)).sort((a, b) => b.prazo.localeCompare(a.prazo))[0]
    if (!candidato) break
    movidos.add(candidato.id)
    itens.push({ id: candidato.id, texto: candidato.texto, de, para })
    carga[de] -= 1.5 / Math.max(1, capacidade[de] / 4.33)
    carga[para] += 1.5 / Math.max(1, capacidade[para] / 4.33)
  }
  return itens
}

function aplicar(integrante: IntegranteS08d, ef: EfeitoS08d) {
  comoAtor(ctxDe(integrante), () => {
    if (ef.tipo === 'redistribuir') {
      const itens = proporRedistribuicao(banco.ler('bpo_item_fila'), ef.capacidade)
      const resumo = itens.length ? `Sugiro passar ${itens.length} item${itens.length > 1 ? 's' : ''} para equilibrar a semana. Os de prazo mais curto ficam com quem já está neles.` : 'A carga está equilibrada: não sugiro mudanças esta semana.'
      repos.telas.lembrar(CHAVE_REDISTRIBUICAO, { em: agoraBpo(), por: nomeIntegranteS08d[integrante], itens, resumo } satisfies PropostaRedistribuicao)
    }
    if (ef.tipo === 'relatorio_contratante') {
      const e = banco.obter('bpo_entrega', ef.entregaId)
      if (e) banco.transacao((tx) => tx.gravar('bpo_entrega', { ...e, extras: { ...e.extras, rascunho: true, rascunho_em: agoraBpo(), rascunho_por: nomeIntegranteS08d[integrante] }, atualizado_em: agora() }))
    }
    if (ef.tipo === 'cobrar_bola') {
      for (const f of banco.ler('bpo_item_fila').filter((x) => x.subinquilino_id === ef.subinquilinoId && x.situacao === 'aberto' && (x.bola === 'contratante' || x.bola === 'cliente_final')))
        banco.transacao((tx) => tx.gravar('bpo_item_fila', { ...f, extras: { ...f.extras, cobrado_em: agoraBpo(), cobrado_por: nomeIntegranteS08d[integrante] }, atualizado_em: agora() }))
    }
  })
}

/** Aplica os efeitos que terminaram (montado uma vez no módulo BPO). */
export function useEfeitosS08d() {
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
        console.error('[heild] efeito S08d não aplicado:', e)
      }
      delete resto[id]
    }
    repos.telas.lembrar(CHAVE, resto)
  }, [loja.estado.trabalhos, tTela])
}

/** Põe o integrante para trabalhar (aparece no Time) e agenda o efeito. */
export function usePedirS08d() {
  const loja = useLoja()
  return (p: { integrante: IntegranteS08d; titulo: string; cliente?: string; inicio: string; etapas: string[]; fim: FimFluxo; efeito: EfeitoS08d }) => {
    const id = `s08d-${p.efeito.tipo}-${Date.now().toString(36)}`
    repos.telas.lembrar(CHAVE, { ...pendentes(), [id]: { integrante: p.integrante, efeito: p.efeito } })
    loja.iniciarTrabalho({ id, integrante: p.integrante, setor: setorDe[p.integrante], titulo: p.titulo, cliente: p.cliente, inicio: p.inicio, etapas: p.etapas, seg: 1.4, fim: p.fim })
    loja.toast(`${nomeIntegranteS08d[p.integrante].replace(' (integrante)', '')} começou: ${p.titulo}`, { modulo: 'inicio', aba: 'time', integrante: p.integrante }, 'Acompanhar', { tipo: 'integrante', setor: setorDe[p.integrante], estado: 'trabalhando' })
  }
}

/** Há trabalho deste tipo em andamento? (para o botão mostrar "trabalhando"). */
export function useTrabalhandoS08d(tipo: EfeitoS08d['tipo']) {
  const loja = useLoja()
  return loja.estado.trabalhos.some((t) => t.id.startsWith(`s08d-${tipo}-`) && t.situacao !== 'concluido')
}

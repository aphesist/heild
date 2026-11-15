import { useEffect } from 'react'
import { useLoja } from '@/ambiente/loja'
import type { FimFluxo } from '@/dados/simulacao'
import { banco } from '@/nucleo/banco'
import type { LeituraDocumentoBpo } from '@/nucleo/modelo/entidades'
import type { Contexto } from '@/nucleo/permissoes'
import { temBanco, useTabela } from '@/nucleo/react'
import { comoAtor, repos } from '@/nucleo/repositorios'
import { conciliacaoOperacao, documentosBpo, fechamentoOperacao, filaOperacao } from '@/nucleo/repositorios/s08b-operacao'
import type { ConteudoDocumento } from '@/nucleo/semente/s08b'
import { garantirSementeOperacaoBpo } from '@/nucleo/semente/s08b'
import type { SetorIntegrante } from '@/theme/tipos'
import { montarRascunho } from './dados'

/**
 * S08b · O trabalho dos integrantes na operação do BPO, no mesmo jeito da S08
 * (aparece trabalhando no Time, com etapas e aviso no sino; o efeito acontece
 * no banco em nome dele quando termina, mesmo depois de recarregar), com uma
 * chave própria (`s08b:efeitos`) para não pisar na da S08:
 *
 * - Contas a Pagar lê o documento que chegou e checa; quando a leitura é
 *   segura e nada chamou atenção, lança a conta sozinho (captura é "faz
 *   sozinho", FIN-003); senão, deixa para uma pessoa revisar. Nunca confere.
 * - Contas a Pagar cobra quem está com a bola parada (BPO-010).
 * - Gerencial rascunha o relatório gerencial do mês (FIN-006, prepara); quem
 *   revisa e fecha é o Gestor.
 */

export type IntegranteOperacao = 'i-bpo' | 'i-bpo-receber' | 'i-bpo-conciliacao' | 'i-bpo-gerencial'
const setorDe: Record<IntegranteOperacao, SetorIntegrante> = { 'i-bpo': 'bpo_pagar', 'i-bpo-receber': 'bpo_receber', 'i-bpo-conciliacao': 'bpo_conciliacao', 'i-bpo-gerencial': 'bpo_gerencial' }
export const nomeIntegrante: Record<IntegranteOperacao, string> = { 'i-bpo': 'Contas a Pagar (integrante)', 'i-bpo-receber': 'Contas a Receber (integrante)', 'i-bpo-conciliacao': 'Conciliação (integrante)', 'i-bpo-gerencial': 'Gerencial (integrante)' }

export type EfeitoOperacao = { tipo: 'ler_documento'; docId: string } | { tipo: 'cobrar_bola'; filaId: string; como: string } | { tipo: 'rascunho'; clienteId: string; competencia: string } | { tipo: 'preparar'; filaId: string; nota: string } | { tipo: 'conciliar'; clienteId: string }

const CHAVE = 's08b:efeitos'
const pendentes = () => (banco.obter('registro_tela', CHAVE)?.valor as Record<string, { integrante: IntegranteOperacao; efeito: EfeitoOperacao }> | undefined) ?? {}
const ctxDe = (i: IntegranteOperacao): Contexto => ({ ator: { tipo: 'integrante', id: i, nome: nomeIntegrante[i] }, origem: 'job' })

/** A leitura que o integrante faz do documento (a "IA" da demonstração lê o conteúdo guardado). */
export function lerConteudo(conteudo: ConteudoDocumento | undefined, nomeArquivo: string): LeituraDocumentoBpo {
  const c = conteudo ?? { fornecedor: nomeArquivo.replace(/\.[a-z]+$/i, '').replace(/[-_]/g, ' '), valor: 0, vencimento: '', categoria: 'Despesas gerais', confianca: 'baixa' as const }
  return { fornecedor: c.fornecedor, documento: c.documento ?? null, valor: c.valor, vencimento: c.vencimento, codigo_barras: c.codigo_barras ?? null, banco: c.banco ?? null, categoria: c.categoria, confianca: c.confianca }
}

function aplicar(integrante: IntegranteOperacao, ef: EfeitoOperacao) {
  const ctx = ctxDe(integrante)
  comoAtor(ctx, () => {
    if (ef.tipo === 'ler_documento') {
      const d = documentosBpo.obter(ef.docId)
      if (!d || (d.situacao !== 'recebido' && d.situacao !== 'lido')) return
      const leitura = lerConteudo(d.extras?.conteudo as ConteudoDocumento | undefined, d.nome_arquivo)
      const lido = documentosBpo.registrarLeitura(d.id, leitura, { ctx })
      // Faz sozinho só o que é seguro: boleto ou nota lidos com confiança, sem nenhum ponto de atenção.
      if (d.tipo_documento !== 'comprovante' && leitura.confianca === 'alta' && leitura.valor > 0 && lido.checagens.every((c) => c.tipo === 'ok')) documentosBpo.lancar(d.id, {}, { ctx })
    }
    if (ef.tipo === 'cobrar_bola') {
      const f = repos.bpo.fila.obter(ef.filaId)
      if (f && f.situacao === 'aberto') filaOperacao.cobrar(f.id, ef.como, { ctx })
    }
    if (ef.tipo === 'conciliar') {
      for (const t of banco.ler('bpo_transacao').filter((x) => x.cliente_id === ef.clienteId && x.situacao === 'pendente' && x.confianca === 'alta')) conciliacaoOperacao.conciliar(t.id, t.sugestao, { ctx })
      for (const c of banco.ler('bpo_conta').filter((x) => x.cliente_id === ef.clienteId && x.etapa === 'liberada')) repos.bpo.contas.marcarPaga(c.id, { ctx })
    }
    if (ef.tipo === 'preparar') {
      const f = repos.bpo.fila.obter(ef.filaId)
      if (f && f.situacao === 'aberto') filaOperacao.comentar(f.id, ef.nota, { ctx })
    }
    if (ef.tipo === 'rascunho') fechamentoOperacao.gravarRascunho(ef.clienteId, ef.competencia, montarRascunho(ef.clienteId, ef.competencia, nomeIntegrante[integrante]), { ctx })
  })
}

/** Aplica os efeitos que terminaram e garante a semente da operação num banco antigo (monte uma vez, no módulo). */
export function useEfeitosOperacaoBpo() {
  const loja = useLoja()
  const tTela = useTabela('registro_tela')
  const tConfig = useTabela('bpo_configuracao')
  useEffect(() => {
    if (temBanco()) garantirSementeOperacaoBpo()
  }, [tConfig])
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
        console.error('[heild] efeito da operação do BPO não aplicado:', e)
        loja.toastErro(e instanceof Error ? e.message : 'O integrante não conseguiu terminar. Tente de novo.')
      }
      delete resto[id]
    }
    repos.telas.lembrar(CHAVE, resto)
  }, [loja.estado.trabalhos, tTela]) // eslint-disable-line react-hooks/exhaustive-deps
}

/** Trabalhos da operação em andamento (para a tela mostrar "lendo…" no lugar certo). */
export function useTrabalhandoEm() {
  const loja = useLoja()
  useTabela('registro_tela')
  const p = pendentes()
  const ativos = Object.entries(p).filter(([id]) => loja.estado.trabalhos.some((t) => t.id === id && t.situacao !== 'concluido'))
  return (alvo: string) => ativos.some(([, v]) => ('docId' in v.efeito && v.efeito.docId === alvo) || ('filaId' in v.efeito && v.efeito.filaId === alvo) || (v.efeito.tipo === 'rascunho' && `${v.efeito.clienteId}:${v.efeito.competencia}` === alvo) || (v.efeito.tipo === 'conciliar' && `conciliar:${v.efeito.clienteId}` === alvo))
}

/** Põe um integrante da operação para trabalhar (aparece no Time) e agenda o efeito no banco. */
export function usePedirOperacao() {
  const loja = useLoja()
  return (p: { integrante: IntegranteOperacao; titulo: string; cliente?: string; inicio: string; etapas: string[]; fim: FimFluxo; efeito: EfeitoOperacao }) => {
    const id = `s08b-${p.efeito.tipo}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`
    repos.telas.lembrar(CHAVE, { ...pendentes(), [id]: { integrante: p.integrante, efeito: p.efeito } })
    loja.iniciarTrabalho({ id, integrante: p.integrante, setor: setorDe[p.integrante], titulo: p.titulo, cliente: p.cliente, inicio: p.inicio, etapas: p.etapas, seg: 1.4, fim: p.fim })
    loja.toast(`${nomeIntegrante[p.integrante].replace(' (integrante)', '')} começou: ${p.titulo}`, { modulo: 'inicio', aba: 'time', integrante: p.integrante }, 'Acompanhar', { tipo: 'integrante', setor: setorDe[p.integrante], estado: 'trabalhando' })
  }
}

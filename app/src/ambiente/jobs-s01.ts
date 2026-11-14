import { useCallback } from 'react'
import type { SetorIntegrante } from '@/theme/tipos'
import { usePersistente } from './loja'
import { useSessao } from './sessao'

/**
 * Jobs e gatilhos dos integrantes da pessoa (02, 7.1 a 7.3; S01-A22 e A31).
 * Um job nasce de uma condição em português aprovada no chat ("me avise
 * quando...") ou vem sugerido pelo integrante. Guarda os últimos 30
 * resultados (vazio, ok, parcial, falhou). Por pessoa, no escritório.
 */
export type ResultadoJob = 'vazio' | 'ok' | 'parcial' | 'falhou'

export interface Job {
  id: string
  integrante: SetorIntegrante
  titulo: string
  regra: string
  /** "toda segunda às 08:00", "a cada evento de nota recebida". */
  quando: string
  tipo: 'agendado' | 'gatilho'
  ativo: boolean
  sugerido?: boolean
  criadoEm: string
  /** Custo estimado por execução em R$ (só Gestor e Administrador veem). */
  custo: number
  resultados: { quando: string; resultado: ResultadoJob; texto: string }[]
}

const resultadosExemplo = (base: string): Job['resultados'] =>
  Array.from({ length: 12 }, (_, i) => {
    const r: ResultadoJob = i === 3 ? 'parcial' : i === 7 ? 'falhou' : i % 3 === 0 ? 'ok' : 'vazio'
    return { quando: `${String(17 - i).padStart(2, '0')}/11 08:00`, resultado: r, texto: r === 'ok' ? `${base}: 2 encontrados, avisei no chat` : r === 'parcial' ? `${base}: o portal da prefeitura não respondeu; conferi 9 de 11` : r === 'falhou' ? 'e-CAC fora do ar; tento de novo amanhã' : 'nada a avisar' }
  })

/** Jobs que já vêm com cada integrante (os sugeridos começam desligados). */
export const jobsPadrao: Job[] = [
  { id: 'job-fis-1', integrante: 'fiscal', titulo: 'Caixas postais', regra: 'Todo dia útil às 07:00, leio as caixas postais (e-CAC, DTE, DEC) de todos os clientes e aviso o que é intimação ou prazo.', quando: 'dias úteis, 07:00', tipo: 'agendado', ativo: true, criadoEm: '01/11', custo: 0.42, resultados: resultadosExemplo('Caixas postais') },
  { id: 'job-fis-2', integrante: 'fiscal', titulo: 'Certidões vencendo', regra: 'Toda segunda, confiro as certidões que vencem em até 15 dias e preparo a renovação.', quando: 'segundas, 08:00', tipo: 'agendado', ativo: true, criadoEm: '01/11', custo: 0.18, resultados: resultadosExemplo('Certidões') },
  { id: 'job-fis-3', integrante: 'fiscal', titulo: 'Nota recebida sem XML', regra: 'Quando chega nota de compra sem XML, peço ao cliente pelo app.', quando: 'a cada nota recebida', tipo: 'gatilho', ativo: false, sugerido: true, criadoEm: '01/11', custo: 0.03, resultados: [] },
  { id: 'job-dp-1', integrante: 'dp', titulo: 'Férias vencendo', regra: 'No dia 1 de cada mês, listo as férias que vencem em 60 dias e proponho as datas aos clientes.', quando: 'dia 1, 08:00', tipo: 'agendado', ativo: true, criadoEm: '01/11', custo: 0.21, resultados: resultadosExemplo('Férias') },
  { id: 'job-dp-2', integrante: 'dp', titulo: 'Admissão pedida pelo app', regra: 'Quando o cliente pede admissão pelo app, abro a tarefa DP-001 e peço os documentos que faltam.', quando: 'a cada pedido do app', tipo: 'gatilho', ativo: true, criadoEm: '01/11', custo: 0.05, resultados: resultadosExemplo('Admissões') },
  { id: 'job-ctb-1', integrante: 'contabil', titulo: 'Extratos que faltam', regra: 'Dia 5 de cada mês, confiro quem não mandou extrato e peço ao Atendimento para cobrar.', quando: 'dia 5, 09:00', tipo: 'agendado', ativo: true, criadoEm: '01/11', custo: 0.12, resultados: resultadosExemplo('Extratos') },
  { id: 'job-soc-1', integrante: 'societario', titulo: 'Situação cadastral', regra: 'Toda segunda, consulto a situação na Receita e na Junta de todos os clientes e aviso quem ficou inapto.', quando: 'segundas, 07:30', tipo: 'agendado', ativo: true, criadoEm: '01/11', custo: 0.3, resultados: resultadosExemplo('Situação cadastral') },
  { id: 'job-not-1', integrante: 'notas', titulo: 'Manifestação do destinatário', regra: 'Quando chega NF-e contra o CNPJ do cliente, registro a ciência e aviso nota desconhecida.', quando: 'a cada NF-e recebida', tipo: 'gatilho', ativo: true, criadoEm: '01/11', custo: 0.02, resultados: resultadosExemplo('Manifestação') },
  { id: 'job-ate-1', integrante: 'gestao_atendimento', titulo: 'Conversa sem resposta', regra: 'Quando uma conversa passa de 1 hora sem resposta, aviso o responsável e o Gestor.', quando: 'a cada conversa parada', tipo: 'gatilho', ativo: true, criadoEm: '01/11', custo: 0.01, resultados: resultadosExemplo('SLA') },
]

export function useJobs() {
  const { usuario } = useSessao()
  const [jobs, setJobs] = usePersistente<Job[]>(`s01:jobs:${usuario.id}`, jobsPadrao)
  const criar = useCallback((j: Omit<Job, 'id' | 'criadoEm' | 'resultados'>) => setJobs((xs) => [...xs, { ...j, id: `job-${Date.now()}`, criadoEm: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), resultados: [] }]), [setJobs])
  const alternar = useCallback((id: string) => setJobs((xs) => xs.map((j) => (j.id === id ? { ...j, ativo: !j.ativo } : j))), [setJobs])
  const rodar = useCallback(
    (id: string, r: Job['resultados'][number]) => setJobs((xs) => xs.map((j) => (j.id === id ? { ...j, resultados: [r, ...j.resultados].slice(0, 30) } : j))),
    [setJobs],
  )
  return { jobs, criar, alternar, rodar }
}

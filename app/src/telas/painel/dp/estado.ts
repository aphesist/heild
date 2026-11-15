import { useMemo } from 'react'
import { useLoja } from '@/ambiente/loja'
import { dpDe } from '@/dados/painel'
import { repos } from '@/nucleo/repositorios'
import { useTabela } from '@/nucleo/react'
import { comCenarioPor } from '@/nucleo/semente/cenario'
import { criarCartaoS04, type DadosCartaoS04 } from '@/telas/tarefas/cartoes'
import { HOJE_ISO } from '@/telas/tarefas/modelo'

/**
 * Estado da aba DP por cliente (S04-T01). Parte do que a aba já mostrava
 * (`dpDe`, dados de exemplo da S04) e acrescenta os blocos aprovados: guias e
 * boletos (C2-03), convenção e resumo (C2-04), recálculo (C2-05), termo de
 * ciência (C2-06), simulados (C2-02), kit de rescisão (C2-01), DET. Fica em
 * `registro_tela` (`s04:dp:<cliente>`): não é entidade das Fundações; vira
 * tabela quando o backend do DP chegar.
 */

export type EtapaAdm = { rotulo: string; feito: boolean; decisao?: boolean }
export interface Admissao {
  id: string
  nome: string
  cargo: string
  inicio: string
  prazoS2200: string
  etapas: EtapaAdm[]
  origem?: 'app' | 'crm' | 'escritorio'
  experiencia?: '45+45' | '90' | null
  contrato?: 'rascunho' | 'cartao' | 'enviado' | 'assinado'
  recibo?: string
  piso?: string
}
export interface Simulado {
  id: string
  nome: string
  tipo: string
  pagamento: string
  status: 'pedido' | 'gerado' | 'enviado' | 'respondido'
  cobrancas: number
  linhas?: [string, string][]
  total?: string
}
export interface Rescisao {
  id: string
  nome: string
  motivo: string
  termino: string
  prazo: string
  trct: boolean
  desligamento: boolean
  kit: { fgts: boolean; extratoPedidoEm?: string; extratoChegou: boolean; guia: boolean; seguro: 'pendente' | 'conferir' | 'conferido'; divergencia?: string }
}
export interface Termo {
  id: string
  tipo: string
  empregado: string
  status: 'rascunho' | 'cartao' | 'enviado' | 'assinado'
  regua: number
}
export interface EstadoDP {
  admissoes: Admissao[]
  variaveis: { item: string; esperado: string; recebido: boolean; via?: string }[]
  previa: 'aguardando' | 'gerada' | 'enviada' | 'ciente'
  importada: boolean
  esocial: { evento: string; situacao: 'aceito' | 'rejeitado' | 'pendente' | 'cartao'; motivo?: string; recibo?: string }[]
  guias: { nome: string; valor: string; vence: string; enviada: boolean }[]
  holerites: { total: number; provados: number }
  pacote: 'pendente' | 'cartao' | 'enviado'
  boletos: { id: string; tipo: 'sindicato' | 'convenio' | 'seguro'; nome: string; libera: string; status: 'aguardando' | 'liberado' | 'emitido'; arquivo?: string }[]
  ferias: { nome: string; detalhe: string; alerta: boolean; programada?: { inicio: string; dias: number; abono: boolean } }[]
  sst: { id: string; nome: string; tipo: string; cat: 'nao_se_aplica' | 'pendente' | 'cartao' | 'transmitida' }[]
  simulados: Simulado[]
  rescisoes: Rescisao[]
  cct: { sindicato: string; vigencia: string; vencimento: string; nova: boolean; resumo: 'pendente' | 'preparando' | 'preparado' | 'publicado'; texto?: string[] }
  beneficios: { nome: string; detalhe: string }[]
  det: { id: string; notificacao: string; prazo: string; tarefa?: string }[]
  termos: Termo[]
  recalculo: { guia: string; status: 'pendente' | 'recalculada' }[]
}

const chave = (clienteId: string) => `s04:dp:${clienteId}`

function inicial(clienteId: string): EstadoDP {
  const d = dpDe(clienteId)
  const metal = clienteId === 'c1'
  const temFolha = d.quadro.ativos > 0
  return {
    admissoes: d.admissoes.map((a) => ({ id: a.id, nome: a.nome, cargo: a.cargo, inicio: a.inicio, prazoS2200: a.prazoS2200.replace('até ', ''), etapas: a.etapas.map((e) => ({ ...e })), origem: metal ? 'app' : 'crm', experiencia: null, contrato: undefined })),
    variaveis: d.variaveis.map((v) => ({ ...v })),
    previa: 'aguardando',
    importada: d.previa.includes('importada'),
    esocial: d.esocial.map((e) => ({ ...e })),
    guias: temFolha
      ? [
          { nome: 'GFD (FGTS Digital) 10/2026', valor: metal ? 'R$ 18.420,30' : 'R$ 2.104,00', vence: '20/11', enviada: !metal },
          { nome: 'DARF da DCTFWeb 10/2026', valor: metal ? 'R$ 41.880,12' : 'R$ 3.990,40', vence: '20/11', enviada: false },
          { nome: 'Contribuição assistencial', valor: metal ? 'R$ 1.240,00' : 'R$ 180,00', vence: '30/11', enviada: false },
        ]
      : [],
    holerites: { total: d.quadro.ativos, provados: metal ? 31 : d.quadro.ativos },
    pacote: 'pendente',
    boletos: temFolha
      ? [
          { id: 'b1', tipo: 'sindicato', nome: metal ? 'Sindicato dos Metalúrgicos · mensalidade' : 'Sindicato dos Comerciários · mensalidade', libera: 'depois do dia 25', status: 'aguardando' },
          { id: 'b2', tipo: 'convenio', nome: 'Convênio médico · fatura de novembro', libera: 'já disponível', status: 'liberado' },
          { id: 'b3', tipo: 'seguro', nome: 'Seguro de vida em grupo (CCT)', libera: 'depois do dia 25', status: 'aguardando' },
        ]
      : [],
    ferias: d.ferias.map((f) => ({ nome: f.nome, detalhe: f.detalhe, alerta: f.alerta })),
    sst: metal ? [{ id: 's1', nome: 'Edson Ramos', tipo: 'atestado de 3 dias', cat: 'nao_se_aplica' }, { id: 's2', nome: 'Márcio Alves', tipo: 'acidente na prensa em 12/11', cat: 'pendente' }] : [],
    simulados: metal ? [{ id: 'sm1', nome: 'Luana Freitas', tipo: 'sem justa causa, aviso indenizado', pagamento: '05/12', status: 'enviado', cobrancas: 2 }, { id: 'sm2', nome: 'Diego Rocha', tipo: 'acordo (art. 484-A)', pagamento: '10/12', status: 'pedido', cobrancas: 0 }] : [],
    rescisoes: d.rescisoes.map((r, i) => ({ id: `rs${i + 1}`, nome: r.nome, motivo: r.motivo, termino: '2026-11-10', prazo: '2026-11-20', trct: false, desligamento: false, kit: { fgts: false, extratoChegou: false, guia: false, seguro: 'pendente' } })),
    cct: temFolha ? { sindicato: metal ? 'Metalúrgicos de São Paulo' : 'Comerciários de São Paulo', vigencia: '01/11/2025 a 31/10/2026', vencimento: '31/10/2026', nova: metal, resumo: 'pendente' } : { sindicato: '—', vigencia: '—', vencimento: '—', nova: false, resumo: 'pendente' },
    beneficios: temFolha ? [{ nome: 'Vale-transporte', detalhe: `${Math.round(d.quadro.ativos * 0.7)} optantes · 6% descontado` }, { nome: 'Vale-refeição', detalhe: 'R$ 32,00 por dia (CCT)' }, { nome: 'Plano de saúde', detalhe: 'coparticipação · 2 dependentes novos' }, { nome: '13º salário', detalhe: '2ª parcela até 20/12' }] : [],
    det: metal ? [{ id: 'dt1', notificacao: 'DET: notificação para apresentar documentos de jornada', prazo: '2026-11-27' }] : [],
    termos: metal ? [{ id: 'tm1', tipo: 'Advertência por atraso', empregado: 'Paulo Nunes', status: 'enviado', regua: 2 }] : [],
    recalculo: temFolha && metal ? [{ guia: 'FGTS 09/2026 (pago com atraso)', status: 'pendente' }] : [],
  }
}

// O estado inicial passa pelo cenário do UI Lab (fora do Lab, é o próprio).
export const lerDP = (clienteId: string): EstadoDP => ({ ...comCenarioPor(`dp:inicial:${clienteId}`, () => inicial(clienteId)), ...((repos.telas.obter(chave(clienteId))?.valor as Partial<EstadoDP>) ?? {}) })
export const gravarDP = (clienteId: string, f: (e: EstadoDP) => Partial<EstadoDP>) => {
  const atual = lerDP(clienteId)
  repos.telas.lembrar(chave(clienteId), { ...atual, ...f(atual) })
}
export function useDP(clienteId: string) {
  const t = useTabela('registro_tela')
  return useMemo(() => lerDP(clienteId), [t, clienteId])
}

/** Visão interna do DP (E-04): Admissão e rotina × Rescisão; filtro guardado. */
export const CHAVE_VISAO = 's04:dp:visao'
export type VisaoDP = 'rotina' | 'rescisao'
export const visaoDP = (): VisaoDP => (repos.telas.obter(CHAVE_VISAO)?.valor as VisaoDP) ?? 'rotina'

/**
 * O integrante DP trabalhando de verdade na tela: pensa, mostra as etapas no
 * chat dele e, no fim, faz o que é dele (`depois`) ou deixa o cartão.
 */
export function useIntegranteDP() {
  const loja = useLoja()
  return (o: { titulo: string; cliente: string; inicio: string; etapas: string[]; fim: string; aviso?: string; depois?: () => void; cartao?: Omit<DadosCartaoS04, 'setor' | 'integrante'> }) => {
    const seg = 1.6
    loja.iniciarTrabalho({ id: `s04-dp-${Date.now()}`, integrante: 'i-dp', setor: 'dp', titulo: o.titulo, cliente: o.cliente, inicio: o.inicio, etapas: o.etapas, seg, fim: { texto: o.fim, aviso: o.aviso ?? o.titulo } })
    loja.toast(`DP começou: ${o.titulo}.`, { modulo: 'inicio', aba: 'time', integrante: 'i-dp' }, 'Acompanhar', { tipo: 'integrante', setor: 'dp', estado: 'trabalhando' })
    window.setTimeout(
      () => {
        try {
          o.depois?.()
          if (o.cartao) criarCartaoS04({ ...o.cartao, setor: 'dp', integrante: 'DP' })
        } catch (e) {
          loja.toast((e as Error).message)
        }
      },
      (o.etapas.length * seg + 2.5) * 1000,
    )
  }
}

export const hoje = HOJE_ISO

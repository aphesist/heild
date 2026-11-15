import { useMemo } from 'react'
import { gestaoDetalhe } from '@/dados/painel-abas'
import { repos } from '@/nucleo/repositorios'
import { useTabela } from '@/nucleo/react'
import { comCenarioPor } from '@/nucleo/semente/cenario'

/**
 * Estado da aba Gestão (S04-T02) que não é entidade das Fundações: catálogo
 * local, processos do escritório, migração, LGPD, rotinas, ausências e moldes
 * editados. Fica em `registro_tela` (`s04:gestao`); vira tabela com o backend.
 */
export interface Processo {
  id: string
  nome: string
  atividade: string
  setor: string
  regra: string
  dia: number
  checklist: string[]
  clientes: 'todos' | string[]
  ativo: boolean
  geradas: number
}
export interface EstadoGestao {
  catalogo: Record<string, { ativa: boolean; horas?: number; equivalente?: string }>
  processos: Processo[]
  migracao: { ferramenta: string; onda: string; paralelo: string; criterio: string; pronto: boolean; desligada?: string }[]
  incidentes: { id: string; quando: string; cliente: string; descricao: string; acao: string; por: string }[]
  titulares: { id: string; pessoa: string; pedido: string; prazo: string; tarefa?: string }[]
  rotinas: { id: string; nome: string; ultima: string; fila: number; erros: { arquivo: string; motivo: string }[]; status: 'ok' | 'erro' | 'reprocessando' }[]
  ausencias: { id: string; pessoa: string; de: string; ate: string; substituto: string; repassadas: number }[]
  moldes: Record<string, { versao: number; dias: Record<string, number>; editado_em?: string; por?: string }>
  sozinho: { id: string; nome: string; ligado: boolean; promovida?: string }[]
  promocoes: { id: string; integrante: string; atividade: string; base: string; decidida?: 'aceita' | 'recusada' }[]
  pauta?: { gerada_em: string; itens: { titulo: string; linhas: string[] }[] }
}

const CHAVE = 's04:gestao'

function inicial(): EstadoGestao {
  return {
    catalogo: { 'FIS-019': { ativa: true, horas: 1.5, equivalente: 'Domínio: Escrita Fiscal › DCTFWeb' }, 'DP-009': { ativa: true, horas: 0.5, equivalente: 'Folha › Variáveis' }, 'CTB-016': { ativa: true, horas: 1 }, 'NFE-034': { ativa: true, horas: 0.4 } },
    processos: [
      { id: 'pr1', nome: 'Relatório gerencial do mês', atividade: 'GES-206', setor: 'contabil', regra: 'todo dia 10', dia: 10, checklist: ['Balancete conferido', 'DRE comparativa', 'Enviar ao cliente'], clientes: ['c1', 'c5'], ativo: true, geradas: 2 },
      { id: 'pr2', nome: 'Backup do servidor de arquivos', atividade: 'GES-206', setor: 'gestao_atendimento', regra: 'toda sexta', dia: 5, checklist: ['Rodar o backup', 'Confirmar que terminou'], clientes: [], ativo: true, geradas: 0 },
    ],
    migracao: gestaoDetalhe.migracao.map((m) => ({ ...m })),
    incidentes: [{ id: 'in1', quando: '2026-11-06', cliente: 'Loja Bela Vista Eireli', descricao: 'Holerite enviado ao contato errado (financeiro em vez do RH)', acao: 'Pedido de exclusão ao destinatário; contato do assunto corrigido na ficha', por: 'Fernanda Lima' }],
    titulares: [{ id: 'tt1', pessoa: 'Wagner Teles (ex-empregado da Metalúrgica)', pedido: 'cópia dos dados pessoais tratados', prazo: '2026-12-01' }],
    rotinas: [
      { id: 'ro1', nome: 'Captura de XML (SEFAZ e NFS-e)', ultima: 'hoje 06:00', fila: 0, erros: [], status: 'ok' },
      { id: 'ro2', nome: 'Leitura das caixas postais (e-CAC e DTE)', ultima: 'hoje 07:10', fila: 0, erros: [], status: 'ok' },
      { id: 'ro3', nome: 'Importação de extratos (OFX e PDF)', ultima: 'hoje 07:40', fila: 3, erros: [{ arquivo: 'extrato_itau_10-2026.pdf', motivo: 'PDF com senha' }, { arquivo: 'foto_recibo_0912.jpg', motivo: 'imagem ruim (borrada)' }, { arquivo: 'planilha_vendas_2026.xlsx', motivo: 'grande demais (42 MB)' }], status: 'erro' },
      { id: 'ro4', nome: 'Envio da régua de cobrança', ultima: 'ontem 18:00', fila: 0, erros: [], status: 'ok' },
    ],
    ausencias: [],
    moldes: {},
    sozinho: [
      { id: 'FIS-005', nome: 'Ler caixas postais e abrir tarefa', ligado: true },
      { id: 'FIS-006', nome: 'Consultar situação fiscal', ligado: true },
      { id: 'FIS-010', nome: 'Emitir e enviar o DAS', ligado: true, promovida: 'promovida por Fernanda em 02/11 (31 cartões, 97% sem edição)' },
      { id: 'DP-019', nome: 'Gerar guias da folha', ligado: true },
      { id: 'DP-023', nome: 'Avisar férias vencendo', ligado: true },
      { id: 'NFE-004', nome: 'Capturar XML de entrada', ligado: true },
    ],
    promocoes: [{ id: 'pp1', integrante: 'Fiscal', atividade: 'FIS-021 · Emitir DARF de parcelamento', base: '34 cartões, 96% aprovados sem edição' }],
  }
}

// O estado inicial passa pelo cenário do UI Lab (fora do Lab, é o próprio).
export const lerGestao = (): EstadoGestao => ({ ...comCenarioPor('gestao:inicial', inicial), ...((repos.telas.obter(CHAVE)?.valor as Partial<EstadoGestao>) ?? {}) })
export const gravarGestao = (f: (e: EstadoGestao) => Partial<EstadoGestao>) => repos.telas.lembrar(CHAVE, { ...lerGestao(), ...f(lerGestao()) })
export function useGestao() {
  const t = useTabela('registro_tela')
  return useMemo(() => lerGestao(), [t])
}

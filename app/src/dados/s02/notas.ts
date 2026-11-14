import { notasDe, type Situacao } from '@/dados/painel-abas'
import { colecao, lerColecao, useColecao } from './colecao'

/**
 * Painel › Notas (03, 6.3; S02-T04): o estado de captura, conferência e
 * entrega de documentos fiscais de cada cliente. Um registro por cliente na
 * coleção `s02:notas-clientes` (ver colecao.ts), no formato que o backend vai
 * ter em Conector, Documento e Tarefa. A semente vem dos dados de exemplo da
 * aba (`notasDe`); cliente sem semente nasce sem captura configurada.
 */

export type ModeloDoc = 'NF-e' | 'NFC-e' | 'NFS-e' | 'CT-e' | 'MDF-e'
export type CaminhoCaptura = 'DF-e (SEFAZ)' | 'autXML' | 'ADN (padrão nacional)' | 'Prefeitura (robô)' | 'E-mail de recepção'

/** `perfil_captura` (NFE-001): por onde cada documento chega. */
export interface PerfilCaptura {
  cnpjs: string[]
  ies: string
  ims: string
  modelos: ModeloDoc[]
  email_recepcao: string
  certificado: string
  autxml: 'incluido' | 'orientado' | 'falta'
  caminho: Partial<Record<ModeloDoc, CaminhoCaptura>>
}

export interface SituacaoCaptura {
  situacao: 'ok' | 'atencao' | 'parada' | 'sem_configuracao'
  /** Texto curto da última rodada ("ontem 03:12"). */
  ultima: string
  nsu: number
  motivo?: string
  /** Parada há N dias. */
  dias?: number
}

export interface Rodada {
  quando: string
  novos: number
  nsu: number
  origem: 'rotina 03:00' | 'forçada' | 'lote' | 'retroativa'
  por: string
}

export interface Fluxo {
  tipo: string
  qtd: number
  fonte: string
  /** Contagem da ferramenta antiga (SIEG /ContarXmls) enquanto a migração estiver aberta. */
  paridade: number
}

export interface Resumo {
  id: string
  nota: string
  emitente: string
  valor: string
  situacao: 'sem_ciencia' | 'ciencia' | 'confirmada' | 'desconhecida' | 'nao_realizada'
  /** Cartão pendente (conclusivo ou desconhecimento). */
  cartao?: string
}

export interface ItemCompletude {
  id: string
  item: string
  valor: string
  situacao: Situacao
  atividade: string
  tarefa?: string
}

export interface Divergencia {
  id: string
  nota: string
  alerta: string
  tipo: string
  sugestao: string
  regra: string
  situacao: 'aberta' | 'aceita' | 'corrigida'
  correcao?: string
}

export interface EventoPosterior {
  id: string
  tipo: 'cancelada_apos_importacao' | 'mdfe_aberto' | 'cte_contestar' | 'fornecedor'
  nota: string
  detalhe: string
  situacao: 'aberto' | 'aguardando_aprovacao' | 'ajustado' | 'contestado' | 'cobrado' | 'ciente'
}

export interface Lote {
  id: string
  lote: string
  situacao: string
  erros: number
  erro?: string
}

export interface PedidoAtendimento {
  id: string
  pedido: string
  quem: string
  canal: string
  situacao: 'atendido' | 'pendente'
  quando: string
}

export interface NotaEmissao {
  id: string
  tomador: string
  servico: string
  valor: number
  pedido_por: string
  situacao: 'pedido' | 'rascunho' | 'aguardando_cliente' | 'aprovada_cliente' | 'emitida'
  numero?: number
  origem: 'app' | 'escritorio'
}

export interface EstadoNotas {
  id: string
  cliente_id: string
  perfil: PerfilCaptura
  captura: SituacaoCaptura
  competencia: string
  fluxos: Fluxo[]
  migracao_aberta: boolean
  rodadas: Rodada[]
  resumos: Resumo[]
  prazo_manifestacao: string
  completude: ItemCompletude[]
  tributaria: Divergencia[]
  eventos: EventoPosterior[]
  lotes: Lote[]
  guarda: { competencia: string; gerado_em?: string; hash?: string; arquivos?: number }[]
  atendimento: PedidoAtendimento[]
  faltando: { id: string; item: string; desde: string; cobrado?: boolean }[]
  emissoes: NotaEmissao[]
  entrada: { retroativa: 'feita' | 'pendente' | 'rodando'; xmls?: number; quando?: string; encerramento?: 'nao_se_aplica' | 'preparado' | 'aguardando_aprovacao' | 'encerrada' }
  /** Pessoa física: Notas vazia com explicação (03, 3.5). */
  pf?: boolean
}

const NOME = 'notas-clientes'

/** Correção de nomes com acento do Windows (CP437/1252 lido como outra coisa) nos .zip do cliente (D-04). */
export function corrigirNomeWindows(nome: string): string {
  const mapa: Record<string, string> = { '‡': 'ç', 'Æ': 'ã', 'Ç': 'é', '¢': 'ó', 'ä': 'õ', 'Ã§': 'ç', 'Ã£': 'ã', 'Ã©': 'é', 'Ã³': 'ó', 'Ãµ': 'õ', 'Ã¡': 'á', 'Ãª': 'ê', 'Ã­': 'í' }
  let r = nome
  for (const [de, para] of Object.entries(mapa)) r = r.split(de).join(para)
  return r
}

/** Data de demonstração por extenso curto. */
export const agoraCurto = () => `hoje ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`

const nsuDe = (texto?: string) => Number((texto ?? '').match(/NSU ([\d.]+)/)?.[1]?.replace(/\./g, '') ?? 0)

/** Monta o estado de um cliente a partir dos dados de exemplo da aba. */
function semear(clienteId: string, conhecido: boolean): EstadoNotas {
  const d = notasDe(clienteId)
  const pf = clienteId === 'c6'
  const ult = d.captura.find((c) => c.item === 'Última captura')
  const cert = d.captura.find((c) => c.item === 'Certificado')
  const parada = clienteId === 'c3'
  const base: EstadoNotas = {
    id: clienteId,
    cliente_id: clienteId,
    pf,
    perfil: {
      cnpjs: [clienteId === 'c1' || clienteId === 'c5' ? 'matriz e filial' : 'matriz'],
      ies: clienteId === 'c4' ? 'isenta' : 'SP · ativa',
      ims: clienteId === 'c4' ? 'São Paulo · 4.512.330-1' : 'São Paulo',
      modelos: clienteId === 'c4' ? ['NFS-e'] : clienteId === 'c5' ? ['NF-e', 'CT-e', 'MDF-e'] : clienteId === 'c2' || clienteId === 'c7' ? ['NF-e', 'NFC-e'] : ['NF-e', 'NFS-e'],
      email_recepcao: `xml+${clienteId}@contabilandrade.com.br`,
      certificado: cert?.valor ?? (clienteId === 'c3' ? 'A1 · vencido em 15/11' : 'A1 · válido'),
      autxml: clienteId === 'c3' ? 'falta' : 'incluido',
      caminho: { 'NF-e': 'DF-e (SEFAZ)', 'NFC-e': 'autXML', 'NFS-e': clienteId === 'c4' ? 'Prefeitura (robô)' : 'ADN (padrão nacional)', 'CT-e': 'DF-e (SEFAZ)', 'MDF-e': 'DF-e (SEFAZ)' },
    },
    captura: pf
      ? { situacao: 'ok', ultima: 'sem captura (pessoa física)', nsu: 0 }
      : parada
        ? { situacao: 'parada', ultima: 'há 3 dias · 03:14', nsu: 7_215, motivo: 'certificado A1 vencido: a SEFAZ recusou a conexão', dias: 3 }
        : { situacao: cert?.situacao === 'atencao' ? 'atencao' : 'ok', ultima: ult?.valor.replace(/ · NSU.*$/, '') ?? 'ontem 03:12', nsu: nsuDe(ult?.valor) || 18_442 - Number(clienteId.slice(1)) * 1_311, motivo: cert?.situacao === 'atencao' ? `certificado ${cert.valor.replace('A1 · ', '')}` : undefined },
    competencia: d.competencia,
    fluxos: d.fluxos,
    // A migração do SIEG ainda está aberta só na Metalúrgica e na Loja (paridade de 3 meses, 03, 6.9).
    migracao_aberta: clienteId === 'c1' || clienteId === 'c3',
    rodadas: pf ? [] : [{ quando: ult?.valor.replace(/ · NSU.*$/, '') ?? 'ontem 03:12', novos: 37, nsu: 18_442, origem: 'rotina 03:00', por: 'Notas' }],
    resumos:
      clienteId === 'c1'
        ? [
            { id: 'r1', nota: 'NF-e 88.120', emitente: 'Aço Brasil Distribuidora', valor: 'R$ 42.180,00', situacao: 'sem_ciencia' },
            { id: 'r2', nota: 'NF-e 3.311', emitente: 'Ferragens Sul Ltda', valor: 'R$ 6.240,00', situacao: 'sem_ciencia' },
            { id: 'r3', nota: 'NF-e 1.904', emitente: 'Transportadora Lince', valor: 'R$ 1.380,00', situacao: 'ciencia' },
            { id: 'r4', nota: 'NF-e 77.002', emitente: 'Gás Industrial Paulista', valor: 'R$ 9.020,00', situacao: 'ciencia' },
            { id: 'r5', nota: 'NF-e 512', emitente: 'Metal Leve Comércio (não reconhecida)', valor: 'R$ 14.900,00', situacao: 'ciencia' },
          ]
        : pf || !conhecido
          ? []
          : [{ id: 'r1', nota: 'NF-e 2.210', emitente: 'Atacadão Central', valor: 'R$ 3.120,00', situacao: 'sem_ciencia' }],
    prazo_manifestacao: 'conclusão até 01/12',
    completude: d.completude.map((c, i) => ({ id: `cp${i}`, ...c, atividade: /sequência/.test(c.item) ? 'NFE-020' : /XML/.test(c.item) ? 'NFE-021' : /declarada/.test(c.item) ? 'NFE-022' : 'NFE-035' })),
    tributaria: d.tributaria.map((x, i) => ({
      id: `tr${i}`,
      ...x,
      situacao: 'aberta' as const,
      sugestao:
        x.tipo === 'ICMS-ST' ? 'Escriturar sem crédito do ICMS destacado (CST 060: imposto já retido)' : x.tipo === 'NCM' ? 'Aplicar a redução de base do NCM 7308.90.10 (Convênio ICMS 52/91)' : x.tipo === 'DIFAL' ? 'Gerar a guia do DIFAL para MG (consumidor final não contribuinte)' : 'Conferir a base com o conhecimento e responder à SEFAZ',
      regra: x.tipo === 'ICMS-ST' ? 'NFE-025 · ST retida na origem' : x.tipo === 'NCM' ? 'NFE-023 · benefício por NCM' : x.tipo === 'DIFAL' ? 'NFE-026 · EC 87/2015' : 'NFE-027',
    })),
    eventos:
      clienteId === 'c1'
        ? [
            { id: 'ev1', tipo: 'cancelada_apos_importacao', nota: 'NF-e 9.104 · venda para Rota Sul', detalhe: 'cancelada pelo emissor em 12/11, já importada no core em 10/11', situacao: 'aberto' },
            { id: 'ev2', tipo: 'fornecedor', nota: 'Ferragens Sul Ltda', detalhe: 'situação cadastral: suspensa na SEFAZ desde 08/11 (crédito em risco)', situacao: 'aberto' },
          ]
        : clienteId === 'c5'
          ? [
              { id: 'ev1', tipo: 'mdfe_aberto', nota: 'MDF-e 4.402 · SP → PR', detalhe: 'aberto há 9 dias sem encerramento', situacao: 'aberto' },
              { id: 'ev2', tipo: 'cte_contestar', nota: 'CT-e 0912', detalhe: 'tomador diz que não contratou o frete', situacao: 'aberto' },
            ]
          : [],
    lotes: d.lotes.map((l, i) => ({ id: `lt${i}`, ...l, erro: l.erros ? 'campo cMun do tomador vazio em 1 NFS-e (layout do core)' : undefined })),
    guarda: [
      { competencia: '09/2026', gerado_em: '05/10/2026', hash: 'a3f9c21', arquivos: 402 },
      { competencia: '10/2026' },
    ],
    atendimento: pf || !conhecido
      ? []
      : [
          { id: 'at1', pedido: 'DANFE da NF-e 9.120 (venda para MG)', quem: clienteId === 'c1' ? 'Rita Campos' : 'contato do cliente', canal: 'WhatsApp', situacao: 'atendido', quando: 'ontem 16:40' },
          { id: 'at2', pedido: 'XMLs de entrada de outubro para o auditor', quem: clienteId === 'c1' ? 'Marcos Andrade' : 'contato do cliente', canal: 'app', situacao: 'pendente', quando: 'hoje 08:15' },
        ],
    faltando: d.completude.some((c) => /sem XML/.test(c.item)) ? [{ id: 'f1', item: '3 compras sem XML (só no extrato)', desde: 'há 4 dias' }] : [],
    emissoes:
      clienteId === 'c4'
        ? [{ id: 'em1', tomador: 'Odonto Plus Convênios', servico: 'Procedimentos odontológicos de outubro', valor: 18_400, pedido_por: 'Dra. Lívia Mendes (app)', situacao: 'pedido', origem: 'app' }]
        : clienteId === 'c1'
          ? [{ id: 'em1', tomador: 'Construtora Alfa Ltda', servico: 'Locação de equipamento (andaimes)', valor: 4_800, pedido_por: 'Rita Campos (WhatsApp)', situacao: 'pedido', origem: 'app' }]
          : [],
    entrada: clienteId === 'c4' ? { retroativa: 'pendente', encerramento: 'nao_se_aplica' } : { retroativa: 'feita', xmls: clienteId === 'c1' ? 1_240 : 380, quando: '02/2026', encerramento: 'nao_se_aplica' },
  }
  if (!conhecido) return { ...base, perfil: { ...base.perfil, cnpjs: [], modelos: [], certificado: 'não cadastrado' }, captura: { situacao: 'sem_configuracao', ultima: 'nunca', nsu: 0 }, fluxos: [], completude: [], tributaria: [], lotes: [], rodadas: [], migracao_aberta: false, faltando: [], guarda: [] }
  return base
}

const conhecidos = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7']
const semente = () => conhecidos.map((c) => semear(c, true))

const col = colecao<EstadoNotas>(NOME, semente)

/** Estado de Notas do cliente (cliente novo nasce sem configuração). */
export function estadoNotas(clienteId: string): EstadoNotas {
  return lerColecao<EstadoNotas>(NOME, semente).find((x) => x.id === clienteId) ?? semear(clienteId, false)
}

/** Muda o estado de Notas do cliente, com evento na linha do tempo. Devolve o estado anterior (desfazer). */
export function mudarNotas(clienteId: string, f: (e: EstadoNotas) => EstadoNotas, texto?: string): EstadoNotas {
  const antes = estadoNotas(clienteId)
  const evento = texto ? { texto, cliente_id: clienteId, setor_id: 'notas' } : undefined
  if (!col.obter(clienteId)) col.criar(f(antes), evento)
  else col.atualizar(clienteId, f(antes), evento)
  return antes
}

export function reverterNotas(antes: EstadoNotas) {
  col.reverter(antes)
}

/** Na tela. */
export function useNotas(clienteId: string): EstadoNotas {
  const todos = useColecao<EstadoNotas>(NOME, semente)
  return todos.find((x) => x.id === clienteId) ?? semear(clienteId, false)
}

export function useNotasTodos(): EstadoNotas[] {
  return useColecao<EstadoNotas>(NOME, semente)
}

/** Total de XMLs do mês. */
export const totalXmls = (e: EstadoNotas) => e.fluxos.reduce((s, f) => s + f.qtd, 0)
/** Diferença contra a ferramenta antiga. */
export const difParidade = (e: EstadoNotas) => e.fluxos.reduce((s, f) => s + (f.qtd - f.paridade), 0)
/** Divergências abertas. */
export const divergenciasAbertas = (e: EstadoNotas) => e.tributaria.filter((t) => t.situacao === 'aberta').length

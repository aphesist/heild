import { useMemo } from 'react'
import type { FichaCliente } from '@/ambiente/clientes'
import { fichas } from '@/ambiente/clientes'
import { estadoConector, type IdConector, type SaudeConector } from '@/dados/conectores'
import { banco } from '@/nucleo/banco'
import type { BpoAlcada, BpoConexaoErp, BpoConfiguracao, BpoConta, BpoContaBancaria, BpoConvidado, BpoEntrega, BpoFornecedor, BpoItemFila, BpoLote, BpoPerfil, BpoRotina, BpoTransacao, BpoVolume, SituacaoErp, Subinquilino } from '@/nucleo/modelo/entidades'
import { useTabela } from '@/nucleo/react'
import { HOJE_BPO, pesosPadrao } from '@/nucleo/semente/s08'

/**
 * S08 · Leitura do BPO para as telas: cada empresa montada a partir das
 * entidades (perfil, conexão de ERP, contas, lotes, alçada, fila, rotinas,
 * extrato), com o audit score calculado pelos critérios fixos e pelos pesos
 * que o Gestor ajusta (10, 5.2). Tudo re-renderiza quando o banco muda.
 */

export type CorAudit = 'verde' | 'amarelo' | 'vermelho'
export const rotuloCor: Record<CorAudit, string> = { verde: 'em dia', amarelo: 'atenção', vermelho: 'agir hoje' }
export const corAudit: Record<CorAudit, string> = { verde: 'var(--success)', amarelo: 'var(--warning)', vermelho: 'var(--destructive)' }
export const ordemCor: CorAudit[] = ['vermelho', 'amarelo', 'verde']

/** Critérios fixos do audit score (10, 5.2) com o nome que a Configuração mostra. */
export const criteriosAudit: Record<string, { rotulo: string; aba: string }> = {
  vencido_sem_aprovacao: { rotulo: 'Conta vencida sem aprovação do cliente', aba: 'aprovacoes' },
  credencial_vencida: { rotulo: 'Credencial do ERP vencida', aba: 'configuracao' },
  sincronizacao_atrasada: { rotulo: 'Sincronização do ERP atrasada', aba: 'configuracao' },
  caixa_abaixo_minimo: { rotulo: 'Caixa abaixo do mínimo combinado', aba: 'visao' },
  conciliacao_atrasada: { rotulo: 'Conciliação atrasada', aba: 'rotinas' },
  sla_abaixo_meta: { rotulo: 'SLA do mês abaixo da meta', aba: 'entregas' },
  lote_recusado: { rotulo: 'Lote recusado pelo cliente', aba: 'aprovacoes' },
  lote_vence_hoje: { rotulo: 'Cartão de pagamento vence hoje', aba: 'aprovacoes' },
  fornecedor_novo: { rotulo: 'Fornecedor novo ou dados bancários alterados', aba: 'aprovacoes' },
  modo_arquivo_pendente: { rotulo: 'ERP em modo arquivo com baixas para lançar', aba: 'fila' },
  conector_instavel: { rotulo: 'Conector do ERP com aviso (limite, CAPTCHA, lentidão)', aba: 'configuracao' },
  consentimento_vencendo: { rotulo: 'Consentimento do Open Finance vence em até 30 dias', aba: 'configuracao' },
  em_paralelo: { rotulo: 'Em paralelo (o BPO prepara, o cliente ainda paga)', aba: 'carteira' },
}

export const rotuloSituacaoErp: Record<SituacaoErp, string> = { ok: 'sincronizado', atrasada: 'sincronização atrasada', credencial_vencida: 'credencial vencida', arquivo: 'modo arquivo', livro_proprio: 'livro próprio', desconectada: 'não conectado' }
export const rotuloModoErp: Record<BpoConexaoErp['modo'], string> = { E1: 'API (leitura e escrita)', E2: 'arquivo (OFX, CSV)', E3: 'livro próprio' }
export const rotuloModoPagamento: Record<BpoPerfil['modo_pagamento'], string> = { M1: 'M1 · o cliente libera no banco', M2: 'M2 · pagamento por API após o cartão', M3: 'M3 · o BPO libera até um teto delegado' }
export const rotuloEtapa: Record<BpoConta['etapa'], string> = {
  capturada: 'para conferir',
  conferida: 'conferida',
  em_lote: 'no próximo lote',
  aguardando_cliente: 'com o cliente',
  aprovada: 'aprovada',
  liberada: 'liberada',
  paga: 'paga',
  recusada: 'recusada',
  cancelada: 'cancelada',
  aberta: 'a receber',
  recebida: 'recebida',
  atrasada: 'atrasada',
}
export const rotuloSituacaoPerfil: Record<BpoPerfil['situacao'], string> = { onboarding: 'em implantação', paralelo: 'em paralelo', ativo: 'ativo', encerrando: 'encerrando', encerrado: 'encerrado' }

export interface MotivoAudit {
  criterio: string
  texto: string
  peso: number
  aba: string
}

export interface Erp extends BpoConexaoErp {
  /** Situação considerando a saúde do conector do provedor (C9). */
  efetiva: SituacaoErp
  saude?: SaudeConector
  /** Aviso do conector (limite, CAPTCHA, lentidão) sem parar a sincronização. */
  aviso?: string
}

export interface EmpresaVista {
  clienteId: string
  nome: string
  codigo: string
  contabil: boolean
  perfil: BpoPerfil
  erp: Erp
  bancos: BpoContaBancaria[]
  caixa: number
  contas: BpoConta[]
  receber: BpoConta[]
  lotes: BpoLote[]
  lotesAbertos: BpoLote[]
  alcada?: BpoAlcada
  proposta?: BpoAlcada
  faixa1: number
  faixa2: number
  fila: BpoItemFila[]
  rotinas: BpoRotina[]
  transacoes: BpoTransacao[]
  fornecedores: BpoFornecedor[]
  entregas: BpoEntrega[]
  volume?: BpoVolume
  audit: { cor: CorAudit; pontos: number; motivos: MotivoAudit[] }
  ficha?: FichaCliente
}

export interface ContratanteVista extends Subinquilino {
  fila: BpoItemFila[]
  convidados: BpoConvidado[]
  entregas: BpoEntrega[]
  volume?: BpoVolume
  bolaBpo: number
  bolaContratante: number
  emRisco: number
}

/* ---------- Datas da demonstração (o "hoje" do BPO é 18/11/2026) ---------- */

export const hojeBpo = HOJE_BPO
const MS_DIA = 864e5
export const diasAte = (data: string) => Math.round((Date.parse(`${data.slice(0, 10)}T12:00:00Z`) - Date.parse(`${HOJE_BPO}T12:00:00Z`)) / MS_DIA)
export const dataCurta = (data?: string | null) => (data ? `${data.slice(8, 10)}/${data.slice(5, 7)}` : '')
export function quando(data?: string | null) {
  if (!data) return ''
  const d = diasAte(data)
  return d === 0 ? 'hoje' : d === 1 ? 'amanhã' : d === -1 ? 'ontem' : dataCurta(data)
}
export const hora = (isoData?: string | null) => (isoData ? new Date(isoData).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' }) : '')
export const dataHora = (isoData?: string | null) => (isoData ? `${quando(new Date(isoData).toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' }))} ${hora(isoData)}` : '')
/** Data e hora da demonstração para registros novos (o dia é o do BPO; a hora, a do relógio). */
export function agoraBpo() {
  const h = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })
  return `${HOJE_BPO}T${h}:00-03:00`
}
export const brl = (v: number, centavos = false) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: centavos ? 2 : 0, maximumFractionDigits: centavos ? 2 : 0 })

const abertas = new Set<BpoConta['etapa']>(['capturada', 'conferida', 'em_lote', 'aguardando_cliente'])
export const contaAberta = (c: BpoConta) => c.tipo === 'pagar' && abertas.has(c.etapa)

/* ---------- ERP com a saúde do conector (C9) ---------- */

function erpEfetivo(x: BpoConexaoErp): Erp {
  const saude = x.conector_id ? estadoConector(x.conector_id as IdConector) : undefined
  if (x.situacao !== 'ok' || !saude) return { ...x, efetiva: x.situacao, saude }
  if (saude.estado === 'erro_credencial' || saude.estado === 'desconectado') return { ...x, efetiva: 'credencial_vencida', saude, aviso: saude.frase }
  if (saude.estado === 'fora_do_ar') return { ...x, efetiva: 'atrasada', saude, aviso: saude.frase }
  if (saude.tom === 'atencao') return { ...x, efetiva: 'ok', saude, aviso: `${saude.nome}: ${saude.rotulo.toLowerCase()}. ${saude.frase}` }
  return { ...x, efetiva: 'ok', saude }
}

/* ---------- Audit score ---------- */

export function calcularAudit(e: Omit<EmpresaVista, 'audit'>, cfg?: BpoConfiguracao): EmpresaVista['audit'] {
  const pesos = { ...pesosPadrao, ...cfg?.pesos }
  const motivos: MotivoAudit[] = []
  const add = (criterio: string, texto: string) => motivos.push({ criterio, texto, peso: pesos[criterio] ?? 0, aba: criteriosAudit[criterio]?.aba ?? 'visao' })
  for (const c of e.contas.filter((x) => contaAberta(x) && diasAte(x.vencimento) < 0)) add('vencido_sem_aprovacao', `vencido sem aprovação: ${c.contraparte} (${brl(c.valor)}); o sistema avisa, nunca paga`)
  if (e.erp.efetiva === 'credencial_vencida') add('credencial_vencida', `credencial do ${e.erp.provedor} vencida: o cliente precisa autorizar de novo`)
  if (e.erp.efetiva === 'atrasada') add('sincronizacao_atrasada', `sincronização com o ${e.erp.provedor} parada desde ${dataHora(e.erp.ultima_sincronizacao)}`)
  if (e.bancos.length && e.caixa < e.perfil.caixa_minimo) add('caixa_abaixo_minimo', `caixa abaixo do mínimo (${brl(e.caixa)} de ${brl(e.perfil.caixa_minimo)})`)
  // Atraso: extrato com mais de dois dias sem conciliar (o do dia e o de ontem são a rotina).
  const velhas = e.transacoes.filter((t) => diasAte(t.data) < -2)
  if (velhas.length) add('conciliacao_atrasada', `${velhas.length} lançamento${velhas.length > 1 ? 's' : ''} do extrato sem conciliar desde ${dataCurta(velhas[0].data)}`)
  if (e.perfil.sla.mes < e.perfil.sla.meta) add('sla_abaixo_meta', `SLA do mês em ${e.perfil.sla.mes}% (meta ${e.perfil.sla.meta}%)`)
  for (const l of e.lotes.filter((x) => x.situacao === 'recusado')) add('lote_recusado', `o cliente recusou “${l.titulo}”: ${l.motivo ?? ''}`)
  for (const l of e.lotesAbertos.filter((x) => diasAte(x.expira_em) <= 0)) add('lote_vence_hoje', `cartão de ${brl(l.total)} vence hoje às ${hora(l.expira_em)}`)
  for (const f of e.fornecedores.filter((x) => x.risco !== 'recorrente' && e.contas.some((c) => c.contraparte === x.nome && contaAberta(c)))) add('fornecedor_novo', `${f.risco === 'novo' ? 'fornecedor novo' : 'dados bancários alterados'}: ${f.nome}`)
  if (e.erp.modo === 'E2' && e.fila.some((f) => f.codigo === 'FIN-004' && f.tipo === 'pendencia')) add('modo_arquivo_pendente', `${e.erp.provedor} em modo arquivo: baixas para lançar à mão`)
  if (e.erp.aviso && e.erp.efetiva === 'ok') add('conector_instavel', e.erp.aviso)
  for (const b of e.bancos.filter((x) => x.consentimento_ate && diasAte(x.consentimento_ate) <= 30)) add('consentimento_vencendo', `consentimento do ${b.nome} vence ${quando(b.consentimento_ate)}`)
  if (e.perfil.situacao === 'paralelo') add('em_paralelo', `em paralelo até ${dataCurta(e.perfil.paralelo_ate)}: o BPO prepara, o cliente ainda paga`)
  const contam = motivos.filter((m) => m.peso > 0).sort((a, b) => b.peso - a.peso)
  // Cada critério pesa uma vez (três fornecedores novos não valem três vezes); os motivos aparecem todos.
  const pontos = [...new Set(contam.map((m) => m.criterio))].reduce((s, c) => s + (pesos[c] ?? 0), 0)
  const cor: CorAudit = pontos >= (cfg?.limiar_vermelho ?? 8) ? 'vermelho' : pontos >= (cfg?.limiar_amarelo ?? 3) ? 'amarelo' : 'verde'
  return { cor, pontos, motivos: contam }
}

/* ---------- Hooks ---------- */

/** As empresas do BPO e os parâmetros, prontos para as telas. */
export function useBpo() {
  const tPerfil = useTabela('bpo_perfil')
  const tErp = useTabela('bpo_conexao_erp')
  const tBanco = useTabela('bpo_conta_bancaria')
  const tConta = useTabela('bpo_conta')
  const tLote = useTabela('bpo_lote')
  const tAlcada = useTabela('bpo_alcada')
  const tFila = useTabela('bpo_item_fila')
  const tRotina = useTabela('bpo_rotina')
  const tTransacao = useTabela('bpo_transacao')
  const tFornecedor = useTabela('bpo_fornecedor')
  const tEntrega = useTabela('bpo_entrega')
  const tVolume = useTabela('bpo_volume')
  const tConfig = useTabela('bpo_configuracao')
  const tCliente = useTabela('cliente')
  const tTela = useTabela('registro_tela')
  return useMemo(() => {
    const cfg = tConfig[0]
    const empresas: EmpresaVista[] = []
    for (const perfil of [...tPerfil].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))) {
      if (perfil.arquivado_em) continue
      const cliente = tCliente.find((c) => c.id === perfil.cliente_id)
      const conexao = tErp.find((x) => x.cliente_id === perfil.cliente_id)
      const erp = erpEfetivo(conexao ?? { id: `bx-${perfil.cliente_id}`, escritorio_id: '', criado_em: '', atualizado_em: '', cliente_id: perfil.cliente_id, provedor: 'sem ERP', modo: 'E3', escopo: 'ainda não conectado', situacao: 'desconectada' })
      const bancos = tBanco.filter((b) => b.cliente_id === perfil.cliente_id && !b.arquivado_em)
      const todasContas = tConta.filter((c) => c.cliente_id === perfil.cliente_id)
      const lotes = tLote.filter((l) => l.cliente_id === perfil.cliente_id && !l.arquivado_em)
      const vigente = tAlcada.find((a) => a.cliente_id === perfil.cliente_id && a.situacao === 'vigente')
      const ficha = (cliente?.extras?.ficha as FichaCliente | undefined) ?? (banco.escritorioId === 'esc-andrade' ? fichas[perfil.cliente_id] : undefined)
      const base: Omit<EmpresaVista, 'audit'> = {
        clienteId: perfil.cliente_id,
        nome: cliente?.nome ?? perfil.cliente_id,
        codigo: cliente?.codigo ?? '',
        contabil: (cliente?.servicos_contratados ?? []).includes('contabil'),
        perfil,
        erp,
        bancos,
        caixa: bancos.reduce((s, b) => s + b.saldo, 0),
        contas: todasContas.filter((c) => c.tipo === 'pagar'),
        receber: todasContas.filter((c) => c.tipo === 'receber'),
        lotes,
        lotesAbertos: lotes.filter((l) => l.situacao === 'aguardando' || l.situacao === 'parcial'),
        alcada: vigente,
        proposta: tAlcada.find((a) => a.cliente_id === perfil.cliente_id && a.situacao === 'proposta'),
        faixa1: vigente?.faixa1 ?? 2_000,
        faixa2: vigente?.faixa2 ?? 20_000,
        fila: tFila.filter((f) => f.cliente_id === perfil.cliente_id && f.situacao === 'aberto'),
        rotinas: tRotina.filter((r) => r.cliente_id === perfil.cliente_id).sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0)),
        transacoes: tTransacao.filter((t) => t.cliente_id === perfil.cliente_id && t.situacao === 'pendente'),
        fornecedores: tFornecedor.filter((f) => f.cliente_id === perfil.cliente_id),
        entregas: tEntrega.filter((x) => x.cliente_id === perfil.cliente_id),
        volume: tVolume.find((v) => v.cliente_id === perfil.cliente_id),
        ficha,
      }
      empresas.push({ ...base, audit: calcularAudit(base, cfg) })
    }
    const ativas = empresas.filter((e) => e.perfil.situacao !== 'encerrado')
    return { empresas: ativas, encerradas: empresas.filter((e) => e.perfil.situacao === 'encerrado'), config: cfg }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tPerfil, tErp, tBanco, tConta, tLote, tAlcada, tFila, tRotina, tTransacao, tFornecedor, tEntrega, tVolume, tConfig, tCliente, tTela])
}

/** Uma empresa (a do seletor), ou nenhuma. */
export function useEmpresaBpo(clienteId?: string | null) {
  const { empresas } = useBpo()
  return clienteId ? empresas.find((e) => e.clienteId === clienteId) : undefined
}

/** Os contratantes do BPO entre escritórios (subinquilinos), com a fila e os convidados de cada um. */
export function useContratantes(): ContratanteVista[] {
  const tSub = useTabela('subinquilino')
  const tFila = useTabela('bpo_item_fila')
  const tConv = useTabela('bpo_convidado')
  const tEntrega = useTabela('bpo_entrega')
  const tVolume = useTabela('bpo_volume')
  return useMemo(
    () =>
      tSub
        .filter((s) => !s.arquivado_em)
        .map((s) => {
          const fila = tFila.filter((f) => f.subinquilino_id === s.id && f.situacao === 'aberto')
          return {
            ...s,
            fila,
            convidados: tConv.filter((c) => c.subinquilino_id === s.id),
            entregas: tEntrega.filter((e) => e.subinquilino_id === s.id),
            volume: tVolume.find((v) => v.subinquilino_id === s.id),
            bolaBpo: fila.filter((f) => f.bola === 'bpo').length,
            bolaContratante: fila.filter((f) => f.bola === 'contratante' || f.bola === 'cliente_final').length,
            emRisco: fila.filter((f) => diasAte(f.prazo) <= 1 && f.bola === 'bpo').length,
          }
        }),
    [tSub, tFila, tConv, tEntrega, tVolume],
  )
}

/** Quem, no cliente, pode aprovar um total: até a faixa 2, quem tem alçada para ele; acima, os da reforçada (10, 3.7). Vale a menor. */
export function aprovadoresPara(ficha: FichaCliente | undefined, total: number, faixa2: number) {
  return (ficha?.contatos ?? []).filter((c) => (total > faixa2 ? c.reforcada && (c.alcadaPagamento ?? 0) > 0 : Math.min(c.alcadaPagamento ?? 0, faixa2) >= total))
}

export const somaLote = (l: BpoLote, contas: BpoConta[]) => l.conta_ids.filter((id) => !l.removidos.includes(id)).reduce((s, id) => s + (contas.find((c) => c.id === id)?.valor ?? 0), 0)

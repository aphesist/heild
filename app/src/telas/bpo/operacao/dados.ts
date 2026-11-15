import { useMemo } from 'react'
import { banco } from '@/nucleo/banco'
import type { BpoDocumento, BpoItemFila, BpoTransacao, Evento } from '@/nucleo/modelo/entidades'
import { useTabela } from '@/nucleo/react'
import type { RascunhoGerencial } from '@/nucleo/repositorios/s08b-operacao'
import { agoraBpo, brl, contaAberta, dataCurta, diasAte, hojeBpo, type EmpresaVista } from '../dados'

/**
 * S08b · Leitura da operação do BPO para a Fila e as Rotinas: há quanto tempo
 * a bola está parada, o risco de cada item (para o integrante reordenar), os
 * documentos que chegaram, o extrato novo do Open Finance (simulado) e o
 * rascunho do relatório gerencial que o integrante Gerencial escreve.
 */

/** Competência que está sendo fechada em 18/11/2026 (o fechamento de outubro vai até o dia 7, 10, 3.1). */
export const COMPETENCIA_FECHAMENTO = '2026-10'
export const rotuloCompetencia = (c: string) => `${['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'][Number(c.slice(5, 7)) - 1]} de ${c.slice(0, 4)}`

export const rotuloTipoItem: Record<BpoItemFila['tipo'], string> = { pedido: 'pedido', pagamento: 'pagamento', pendencia: 'pendência', revisao: 'revisão' }
export const rotuloCanal: Record<string, string> = { whatsapp: 'WhatsApp', app: 'app', email: 'e-mail', portal: 'portal', interno: 'interno', dda: 'DDA' }

const MS_H = 36e5
/** Horas entre duas datas da demonstração (o "agora" é 18/11 com a hora do relógio). */
export const horasDesde = (iso?: string | null) => (iso ? Math.max(0, (Date.parse(agoraBpo()) - Date.parse(iso)) / MS_H) : 0)
export const textoHoras = (h: number) => (h < 1 ? 'menos de 1 h' : h < 48 ? `${Math.round(h)} h` : `${Math.round(h / 24)} dias`)

/** Desde quando a bola está onde está: o último "passar a bola", ou a marca da semente, ou o início do SLA. */
export function bolaDesde(f: BpoItemFila, eventos: Evento[]) {
  const ultimo = eventos.filter((e) => e.resultado_ref === f.id && e.ferramenta === 'fila.passar_bola').sort((a, b) => b.criado_em.localeCompare(a.criado_em))[0]
  // O que acontece na demonstração acontece "hoje" (18/11), na hora do relógio.
  return (ultimo ? noDiaDaDemo(ultimo.criado_em) : null) ?? (f.extras?.bola_desde as string | undefined) ?? f.sla_inicio ?? f.criado_em
}

/** Um instante gravado pelo relógio da máquina, levado ao dia da demonstração (DECISOES, S08: o "hoje" do BPO é 18/11). */
export function noDiaDaDemo(iso: string) {
  const h = new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })
  return `${hojeBpo}T${h}:00-03:00`
}

/** A bola fora do BPO há mais de 24 h é "bola parada": o integrante cobra (BPO-010). */
export function bolaParada(f: BpoItemFila, eventos: Evento[]) {
  if (f.bola === 'bpo' || f.situacao !== 'aberto') return null
  const h = horasDesde(bolaDesde(f, eventos))
  return h >= 24 ? h : null
}

/** Risco do item, para a ordem "por risco" do integrante: SLA estourado, vence hoje, dinheiro, empresa no vermelho, bola parada. */
export function riscoDe(e: EmpresaVista, f: BpoItemFila, eventos: Evento[]) {
  const d = diasAte(f.prazo)
  let r = d < 0 ? 50 : d === 0 ? 30 : d === 1 ? 15 : 0
  if (f.tipo === 'pagamento') r += 12
  if (f.valor) r += Math.min(10, f.valor / 2_000)
  if (f.prazo_legal && diasAte(f.prazo_legal) <= 1) r += 25
  r += e.audit.cor === 'vermelho' ? 12 : e.audit.cor === 'amarelo' ? 5 : 0
  if (bolaParada(f, eventos)) r += 8
  if (f.faltando.length) r += 4
  return r
}

export const motivoRisco = (e: EmpresaVista, f: BpoItemFila, eventos: Evento[]) => {
  const d = diasAte(f.prazo)
  const m = [d < 0 ? 'prazo estourado' : d === 0 ? 'vence hoje' : d === 1 ? 'vence amanhã' : '', f.tipo === 'pagamento' ? 'pagamento' : '', e.audit.cor === 'vermelho' ? 'empresa no vermelho' : '', bolaParada(f, eventos) ? 'bola parada' : '', f.faltando.length ? 'pedido incompleto' : ''].filter(Boolean)
  return m.join(', ')
}

/** Eventos de um registro (histórico do item, da conta, do documento), do mais novo ao mais velho. */
export function useHistorico(id?: string | null) {
  const eventos = useTabela('evento')
  return useMemo(() => (id ? eventos.filter((e) => e.resultado_ref === id).sort((a, b) => b.criado_em.localeCompare(a.criado_em)) : []), [eventos, id])
}

export function useDocumentosBpo(clienteIds: string[]) {
  const docs = useTabela('bpo_documento')
  const chave = clienteIds.join(',')
  return useMemo(() => docs.filter((d) => clienteIds.includes(d.cliente_id)).sort((a, b) => b.recebido_em.localeCompare(a.recebido_em)), [docs, chave]) // eslint-disable-line react-hooks/exhaustive-deps
}

export const docAberto = (d: BpoDocumento) => d.situacao === 'recebido' || d.situacao === 'lido'

/** Todas as linhas do extrato da empresa (as pendentes estão em EmpresaVista.transacoes; aqui também as conciliadas). */
export function useExtratoCompleto(clienteId?: string) {
  const t = useTabela('bpo_transacao')
  return useMemo(() => (clienteId ? t.filter((x) => x.cliente_id === clienteId).sort((a, b) => b.data.localeCompare(a.data)) : []), [t, clienteId])
}

/* ---------- Open Finance simulado: o extrato novo que o banco devolve ---------- */

const extratoPorEmpresa: Record<string, [string, number, string, 'alta' | 'baixa'][]> = {
  c2: [
    ['PIX REC IFOOD REPASSE', 2_318.4, 'Vendas no cartão', 'alta'],
    ['DEB AUT SABESP', -612.3, 'Água?', 'baixa'],
    ['PIX REC CIELO VENDAS', 7_905.1, 'Vendas no cartão', 'alta'],
  ],
  c4: [
    ['TED REC AMIL DENTAL', 5_120, 'Convênios e particulares', 'alta'],
    ['PIX ENV DENTAL CREMER', -8_300, 'Materiais odontológicos', 'alta'],
  ],
  c3: [
    ['PIX REC STONE VENDAS', 4_410.8, 'Vendas no cartão', 'alta'],
    ['TARIFA COBRANCA', -64.5, 'Tarifas bancárias', 'alta'],
  ],
  c8: [
    ['REDE CREDITO LOTE 4413', 20_980, 'Vendas no cartão', 'alta'],
    ['PIX ENV 33.120.884/0001', -2_740, 'Fornecedor sem cadastro?', 'baixa'],
  ],
  c9: [['PIX REC CONSTRUTORA ALVO', 18_000, 'Projetos (honorários)', 'alta']],
  c10: [
    ['PIX REC BALCAO', 1_980, 'Vendas no balcão', 'alta'],
    ['BOLETO DISTRIBUIDORA FREIOS', -9_870, 'Mercadoria para revenda', 'baixa'],
  ],
}

/** Linhas que o banco devolve na próxima leitura (ids estáveis; cada leitura traz a próxima linha da lista). */
export function proximoExtrato(e: EmpresaVista, todas: BpoTransacao[]): Omit<BpoTransacao, 'escritorio_id' | 'criado_em' | 'atualizado_em' | 'cliente_id' | 'situacao'>[] {
  const lista = extratoPorEmpresa[e.clienteId] ?? []
  const conta = e.bancos.find((b) => b.via === 'open_finance' || b.via === 'api_banco')?.nome.split(' ')[0] ?? 'Banco'
  const ja = new Set(todas.map((t) => t.id))
  const novas = lista.map(([descricao, valor, sugestao, confianca], i) => ({ id: `bt-of-${e.clienteId}-${i + 1}`, conta, data: hojeBpo, descricao, valor, sugestao, confianca })).filter((x) => !ja.has(x.id))
  return novas.slice(0, 2)
}

/* ---------- O rascunho do relatório gerencial (o integrante Gerencial escreve; o Gestor revisa) ---------- */

const repartir = (total: number, partes: [string, number][]) => partes.map(([rotulo, p]) => ({ rotulo, valor: Math.round((total * p) / 100) * 10 }))

/** Escrito a partir do espelho do ERP e do extrato da competência (aqui, do fluxo da empresa e do que está no banco). */
export function montarRascunho(clienteId: string, competencia: string, autor: string): RascunhoGerencial {
  const perfil = banco.ler('bpo_perfil').find((p) => p.cliente_id === clienteId)
  const contas = banco.ler('bpo_conta').filter((c) => c.cliente_id === clienteId)
  const fila = banco.ler('bpo_item_fila').filter((f) => f.cliente_id === clienteId && f.situacao === 'aberto')
  const bancos = banco.ler('bpo_conta_bancaria').filter((b) => b.cliente_id === clienteId)
  const fornecedores = banco.ler('bpo_fornecedor').filter((f) => f.cliente_id === clienteId && f.risco !== 'recorrente')
  const i = Math.max(0, Number(competencia.slice(5, 7)) - 9) // fluxo começa em setembro
  const entradas = (perfil?.fluxo.entradas[i] ?? 0) * 1_000
  const saidas = (perfil?.fluxo.saidas[i] ?? 0) * 1_000
  const cats = [...new Set(contas.filter((c) => c.tipo === 'pagar').map((c) => c.categoria))]
  const custo = cats.find((c) => /mat[ée]ria|mercadoria|materiais/i.test(c)) ?? 'Custo direto'
  const despesas = [cats.find((c) => /ocupa|aluguel/i.test(c)) ?? 'Ocupação', cats.find((c) => /energia|água/i.test(c)) ?? 'Energia e utilidades', cats.find((c) => /software/i.test(c)) ?? 'Serviços e software', 'Tarifas bancárias']
  const caixa = bancos.reduce((s, b) => s + b.saldo, 0)
  const resultado = entradas - saidas
  const atrasos = contas.filter((c) => contaAberta(c) && diasAte(c.vencimento) < 0).map((c) => `${c.contraparte} (${brl(c.valor)}, venceu ${dataCurta(c.vencimento)})`)
  const pendencias = fila.filter((f) => f.bola !== 'bpo').slice(0, 3).map((f) => f.texto.replace(/[“”]/g, ''))
  const riscos = [
    ...(perfil && caixa < perfil.caixa_minimo ? [`caixa de ${brl(caixa)} abaixo do mínimo combinado (${brl(perfil.caixa_minimo)})`] : []),
    ...fornecedores.slice(0, 2).map((f) => `${f.risco === 'novo' ? 'fornecedor novo' : 'dados bancários alterados'}: ${f.nome}`),
    ...(resultado < 0 ? ['resultado negativo no mês'] : []),
  ]
  const margem = entradas ? Math.round((resultado / entradas) * 100) : 0
  return {
    competencia,
    receitas: repartir(entradas, [
      ['Vendas e serviços', 9.7],
      ['Outras receitas', 0.3],
    ]),
    custos: repartir(saidas, [[custo, 5.5]]),
    despesas: repartir(saidas, [
      [despesas[0], 2.4],
      [despesas[1], 1.1],
      [despesas[2], 0.7],
      [despesas[3], 0.3],
    ]),
    resultado,
    caixa_fim: caixa,
    pagamentos: perfil?.volume.pagamentos ?? 0,
    atrasos,
    pendencias,
    riscos,
    comentario: `${rotuloCompetencia(competencia).replace(/^./, (x) => x.toUpperCase())} fechou com ${brl(entradas)} de entradas e ${brl(saidas)} de saídas: resultado de ${brl(resultado)} (margem de ${margem}%). ${riscos.length ? `Pontos de atenção: ${riscos.join('; ')}.` : 'Sem pontos de atenção no caixa.'} Rascunho para o Gestor revisar; nada sai ao cliente sem a revisão.`,
    escrito_por: autor,
    escrito_em: agoraBpo(),
  }
}

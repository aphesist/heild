import { fichas } from '@/ambiente/clientes'
import { empresasBpo, escalonamentoBpo, filaBpo, lotesBpo, type EmpresaBpo } from '@/dados/bpo'
import { banco } from '../banco'
import type { BpoConta, BpoPerfil, CartaoAprovacao, EtapaContaBpo, Fotografia, NomeTabela, Tabelas } from '../modelo/entidades'
import { montador } from './comum'

/**
 * S08 · Semente do BPO (subplano 10): o que estava fixo em src/dados/bpo.ts,
 * agora como entidades (perfil BPO, conexão de ERP, contas, lotes, alçadas,
 * fila, rotinas, extrato, entregas, volume) e a frente entre escritórios
 * (contratantes, que são subinquilinos, e os convidados de cada um).
 *
 * O "hoje" da demonstração do BPO é 18/11/2026, o mesmo dia do calendário
 * dos dados de exemplo (agenda e semana).
 */

export const HOJE_BPO = '2026-11-18'
export const COMPETENCIA_BPO = '2026-11'

type Add = <K extends NomeTabela>(tabela: K, linha: Omit<Tabelas[K], 'escritorio_id' | 'criado_em' | 'atualizado_em'> & { criado_em?: string }) => Tabelas[K]

const dia = (ddmm: string) => `2026-${ddmm.slice(3, 5)}-${ddmm.slice(0, 2)}`
const iso = (data: string, hora = '09:00') => `${data}T${hora}:00-03:00`
const prazoDe = (texto: string) =>
  texto.startsWith('hoje') ? HOJE_BPO : texto.startsWith('amanhã') ? '2026-11-19' : texto.startsWith('há') ? '2026-11-15' : /^\d\d\/\d\d/.test(texto) ? dia(texto.slice(0, 5)) : HOJE_BPO
const conectorDe: Record<string, string | null> = { 'Conta Azul': 'conta_azul', Omie: 'omie', Bling: 'bling', Nibo: null, Granatum: null, 'sem ERP': null }
const ultimaSync: Record<string, string> = { 'há 12 min': iso(HOJE_BPO, '07:48'), 'há 30 min': iso(HOJE_BPO, '07:30'), 'há 26 h': iso('2026-11-17', '06:00'), 'arquivo de hoje 07:40': iso(HOJE_BPO, '07:40'), nativo: iso(HOJE_BPO, '08:00'), 'há 3 dias': iso('2026-11-15', '08:00') }
const atualizadoDe = (t: string) => (t.startsWith('hoje') ? iso(HOJE_BPO, t.slice(5) || '06:00') : t.startsWith('ontem') ? iso('2026-11-17', t.slice(6) || '06:00') : iso('2026-11-15', '06:00'))
const viaDe = (t: string): Tabelas['bpo_conta_bancaria']['via'] => (t === 'Open Finance' ? 'open_finance' : t === 'API do banco' ? 'api_banco' : 'manual')
const desvioDe = (t: string): 'bpo' | 'cliente' => (/cliente|credencial/.test(t) ? 'cliente' : 'bpo')

const idIntegrantePagar = 'i-bpo'
const idUsuario: Record<string, string> = { 'Lucas Prado': 'u9', 'Marina Teixeira': 'u8', 'Fernanda Lima': 'u1' }

/** Pesos de partida do audit score (10, 5.2: critérios fixos, o Gestor ajusta os pesos) [premissa a validar no piloto]. */
export const pesosPadrao: Record<string, number> = {
  vencido_sem_aprovacao: 10,
  credencial_vencida: 8,
  sincronizacao_atrasada: 8,
  caixa_abaixo_minimo: 8,
  conciliacao_atrasada: 5,
  sla_abaixo_meta: 5,
  lote_recusado: 5,
  lote_vence_hoje: 3,
  fornecedor_novo: 3,
  modo_arquivo_pendente: 3,
  conector_instavel: 3,
  consentimento_vencendo: 2,
  em_paralelo: 2,
}

function contaDe(e: EmpresaBpo, c: EmpresaBpo['contas'][number]): Omit<BpoConta, 'escritorio_id' | 'criado_em' | 'atualizado_em'> {
  const loteAberto = c.lote && lotesBpo.some((l) => l.id === c.lote)
  const etapa: EtapaContaBpo = loteAberto ? 'aguardando_cliente' : c.situacao === 'agendada' ? 'liberada' : c.situacao === 'paga' ? 'paga' : c.conferidoPor ? 'conferida' : 'capturada'
  const integrante = c.digitadoPor.startsWith('BPO')
  // Acima de R$ 2 mil, duas conferências (analista e gestor); as contas já em lote vêm com as duas.
  const conferencias: BpoConta['conferencias'] = !c.conferidoPor
    ? []
    : c.valor > 2_000 && etapa !== 'conferida'
      ? [
          { id: idUsuario[c.conferidoPor] ?? null, nome: c.conferidoPor, gestor: c.conferidoPor === 'Marina Teixeira', em: iso('2026-11-17', '15:00') },
          ...(c.conferidoPor === 'Marina Teixeira' ? [] : [{ id: 'u8', nome: 'Marina Teixeira', gestor: true, em: iso('2026-11-17', '16:10') }]),
        ]
      : [{ id: idUsuario[c.conferidoPor] ?? null, nome: c.conferidoPor, gestor: c.conferidoPor === 'Marina Teixeira', em: iso('2026-11-17', '15:00') }]
  return {
    id: c.id,
    cliente_id: e.clienteId,
    tipo: 'pagar',
    contraparte: c.fornecedor,
    fornecedor_id: `bf-${c.id}`,
    categoria: c.categoria,
    valor: c.valor,
    vencimento: dia(c.vencimento),
    origem: c.origem,
    etapa,
    digitado_por_id: integrante ? idIntegrantePagar : (idUsuario[c.digitadoPor] ?? null),
    digitado_por_nome: integrante ? 'Contas a Pagar (integrante)' : c.digitadoPor,
    conferencias,
    lote_id: loteAberto ? c.lote : null,
    alerta: c.alerta && !c.alerta.startsWith('venceu') ? c.alerta : null,
    lancar_no_erp: e.erp.modo === 'E2',
  }
}

/** Escreve a semente do BPO na fotografia de um escritório (Andrade: tudo; os outros: só os parâmetros). */
export function sementeS08(foto: Fotografia, add: Add, completo = true) {
  add('bpo_configuracao', { id: 'bpo', pesos: pesosPadrao, limiar_amarelo: 3, limiar_vermelho: 8, teto_whatsapp: 3_000 })
  if (!completo) return foto

  for (const e of empresasBpo) {
    const esc = escalonamentoBpo[e.clienteId]
    const [, abre] = e.alcadas.janela.match(/(\d+)h/) ?? []
    const perfil: Omit<BpoPerfil, 'escritorio_id' | 'criado_em' | 'atualizado_em'> = {
      id: `bp-${e.clienteId}`,
      cliente_id: e.clienteId,
      situacao: e.paraleloAte ? 'paralelo' : 'ativo',
      escopo: e.clienteId === 'c4' ? ['pagar', 'receber', 'conciliacao', 'gerencial'] : ['pagar', 'conciliacao', 'gerencial'],
      modo_pagamento: e.modoPagamento,
      teto_m2: e.modoPagamento === 'M2' ? 10_000 : null,
      responsavel_nome: e.responsavel,
      analista_nome: e.analista,
      caixa_minimo: e.caixaMinimo,
      paralelo_ate: e.paraleloAte ? dia(e.paraleloAte) : null,
      termo_aceito_em: '2026-03-02',
      onboarding: { contrato: true, termo: true, convite_app: true, bancos: true, erp: true, fornecedores: true, paralelo: true, ativar: !e.paraleloAte },
      janela: { abertura: esc?.abertura ?? `${String(abre ?? '9').padStart(2, '0')}:00`, dias: e.alcadas.janela },
      escalonamento: { aprovador: esc?.aprovador ?? '', substituto: esc?.substituto ?? null, socio: esc?.socio ?? '', lembrete_h: esc?.lembreteH ?? 4, substituto_h: esc?.substitutoH ?? 8 },
      sla: { meta: 95, mes: e.sla.mes, desvios: e.sla.desvios.map((t) => ({ texto: t, de: desvioDe(t) })) },
      volume: { lancamentos: e.volume.lancamentos, conciliacoes: e.volume.conciliacoes, pagamentos: e.volume.pagamentos, contas: e.volume.contas, faixa: e.volume.faixa, limite: e.volume.limiteFaixa },
      honorario: e.honorarioBpo,
      horas_mes: e.horasMes,
      fluxo: e.fluxo,
    }
    add('bpo_perfil', perfil)
    add('bpo_conexao_erp', { id: `bx-${e.clienteId}`, cliente_id: e.clienteId, provedor: e.erp.provedor, modo: e.erp.modo, escopo: e.erp.escopo, situacao: e.erp.situacao, ultima_sincronizacao: ultimaSync[e.erp.ultima] ?? iso(HOJE_BPO, '07:00'), conector_id: conectorDe[e.erp.provedor] ?? null })
    for (const b of e.bancos)
      add('bpo_conta_bancaria', { id: b.id, cliente_id: e.clienteId, nome: b.nome, saldo: b.saldo, saldo_em: atualizadoDe(b.atualizado), via: viaDe(b.via), consentimento_ate: b.via === 'Open Finance' ? (e.clienteId === 'c9' ? '2026-11-30' : '2027-08-10') : null })
    const vistos = new Set<string>()
    for (const c of e.contas) {
      if (!vistos.has(c.fornecedor)) {
        vistos.add(c.fornecedor)
        const novo = !!c.alerta?.includes('fornecedor novo')
        add('bpo_fornecedor', {
          id: `bf-${c.id}`,
          cliente_id: e.clienteId,
          nome: c.fornecedor,
          risco: novo ? 'novo' : 'recorrente',
          banco: novo ? 'Itaú · ag. 0412 · c/c 33.120-4' : 'conta do cadastro',
          dados_bancarios_confirmados_em: novo ? '2026-11-18' : '2026-03-02',
          confirmado_por: novo ? 'Lucas Prado' : 'implantação',
          canal_confirmacao: novo ? 'ligação ao telefone do cadastro' : 'cadastro com o cliente',
        })
      }
      add('bpo_conta', contaDe(e, c))
    }
    // A conta vencida sem aprovação (Confecções Aurora) volta a ser alerta: o sistema avisa, nunca paga.
    for (const r of e.rotinas)
      add('bpo_rotina', { id: `br-${e.clienteId}-${r.id}`, cliente_id: e.clienteId, cadencia: r.cadencia, nome: r.nome, quando: r.quando, codigo: r.codigo, ativa: true, feita_em: r.feita ? iso(HOJE_BPO, r.cadencia === 'diária' ? '08:20' : '08:00') : null, feita_por: r.feita ? (r.cadencia === 'diária' && r.id === 'r1' ? 'Contas a Pagar (integrante)' : e.analista) : null })
    for (const t of e.transacoes)
      add('bpo_transacao', { id: t.id, cliente_id: e.clienteId, conta: t.conta, data: dia(t.data), descricao: t.descricao, valor: t.valor, sugestao: t.sugestao, confianca: t.confianca === 'alta' ? 'alta' : 'baixa', situacao: 'pendente' })
    const pessoas = Object.fromEntries((fichas[e.clienteId]?.contatos ?? []).filter((c) => c.alcadaPagamento).map((c) => [c.nome, c.alcadaPagamento ?? 0]))
    const [mm, aaaa] = (e.alcadas.vigencia.match(/(\d\d)\/(\d{4})/) ?? []).slice(1)
    add('bpo_alcada', {
      id: `ba-${e.clienteId}`,
      cliente_id: e.clienteId,
      situacao: 'vigente',
      faixa1: e.alcadas.faixa1,
      faixa2: e.alcadas.faixa2,
      janela: e.alcadas.janela,
      pessoas,
      // Alçada da implantação: veio assinada no contrato (ninguém da equipe a alterou depois).
      proposta_por_id: null,
      proposta_por_nome: 'contrato de implantação',
      aceito_por: e.alcadas.aceitoPor,
      aceito_em: iso('2026-03-02', '10:00'),
      vigencia_ate: mm ? `${aaaa}-${mm}-01` : null,
    })
    add('bpo_entrega', { id: `be-rel-${e.clienteId}`, cliente_id: e.clienteId, competencia: '2026-10', tipo: 'relatorio', situacao: e.clienteId === 'c4' ? 'enviado' : 'pendente', enviado_em: e.clienteId === 'c4' ? iso('2026-11-04', '10:00') : null, enviado_por: e.clienteId === 'c4' ? 'Marina Teixeira' : null })
    add('bpo_entrega', { id: `be-fch-${e.clienteId}`, cliente_id: e.clienteId, competencia: '2026-10', tipo: 'fechamento', situacao: ['c4', 'c9'].includes(e.clienteId) ? 'enviado' : 'pendente', enviado_em: ['c4', 'c9'].includes(e.clienteId) ? iso('2026-11-06', '17:00') : null, enviado_por: ['c4', 'c9'].includes(e.clienteId) ? e.responsavel : null })
    add('bpo_volume', {
      id: `bv-${e.clienteId}`,
      cliente_id: e.clienteId,
      competencia: COMPETENCIA_BPO,
      itens: [
        { unidade: 'lançamentos', quantidade: e.volume.lancamentos, preco: 2.5 },
        { unidade: 'conciliações', quantidade: e.volume.conciliacoes, preco: 0 },
        { unidade: 'pagamentos preparados', quantidade: e.volume.pagamentos, preco: 0 },
        { unidade: 'contas bancárias conectadas', quantidade: e.volume.contas, preco: 0 },
      ],
      contestacoes: [],
      situacao: 'aberto',
      extra_valor: 0,
    })
  }

  // Contas a receber da Clínica (o integrante Contas a Receber cuida dos convênios).
  for (const r of [
    { id: 'cr1', contraparte: 'Odontoprev (convênio)', valor: 3_840, vencimento: '2026-11-16', etapa: 'recebida' as const },
    { id: 'cr2', contraparte: 'Amil Dental (convênio)', valor: 5_200, vencimento: '2026-11-25', etapa: 'aberta' as const },
    { id: 'cr3', contraparte: 'Paciente particular (boleto 0981)', valor: 680, vencimento: '2026-11-10', etapa: 'atrasada' as const },
  ])
    add('bpo_conta', { ...r, cliente_id: 'c4', tipo: 'receber', categoria: 'Convênios e particulares', origem: 'Omie', digitado_por_id: 'i-bpo-receber', digitado_por_nome: 'Contas a Receber (integrante)', conferencias: [], lote_id: null })

  for (const l of lotesBpo) {
    const e = empresasBpo.find((x) => x.clienteId === l.clienteId)!
    const expira = l.expira.startsWith('hoje') ? iso(HOJE_BPO, '17:00') : iso('2026-11-19', '12:00')
    const total = l.itens.reduce((s, i) => s + i.valor, 0)
    const podem = (fichas[l.clienteId]?.contatos ?? []).filter((c) => (total > e.alcadas.faixa2 ? c.reforcada && (c.alcadaPagamento ?? 0) > 0 : (c.alcadaPagamento ?? 0) >= total)).map((c) => c.nome)
    add('bpo_lote', {
      id: l.id,
      cliente_id: l.clienteId,
      titulo: l.titulo.replace('vence 11/11', 'vence 21/11'),
      conta_ids: l.itens.map((i) => i.conta),
      total,
      saldo: l.saldo,
      expira_em: expira,
      situacao: 'aguardando',
      aprovacoes: [],
      removidos: [],
      preparado_por: l.preparadoPor.replace('BPO (integrante)', 'Contas a Pagar (integrante)'),
      conferido_por: l.conferidoPor,
      aprovadores_necessarios: l.aprovadoresNecessarios,
      modo_pagamento: e.modoPagamento,
      cartao_id: `ca-${l.id}`,
    })
    const cartao: Omit<CartaoAprovacao, 'escritorio_id' | 'criado_em' | 'atualizado_em'> = {
      id: `ca-${l.id}`,
      ferramenta: 'pagamento_lote.aprovar',
      argumentos: { lote_id: l.id, cliente_id: l.clienteId, total },
      resumo_humano: `${l.titulo} (${total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })})`,
      pedido_por_tipo: 'usuario',
      pedido_por_id: 'u8',
      pode_aprovar: podem,
      status: 'pendente',
      expira_em: expira,
    }
    add('cartao_aprovacao', cartao)
  }

  const analistaDe = (clienteId: string) => empresasBpo.find((e) => e.clienteId === clienteId)?.analista ?? 'Lucas Prado'
  for (const f of filaBpo)
    add('bpo_item_fila', {
      id: f.id,
      cliente_id: f.clienteId,
      tipo: f.tipo as 'pedido' | 'pagamento' | 'pendencia',
      texto: f.texto,
      codigo: f.codigo,
      canal: f.id === 'fq3' ? 'whatsapp' : f.tipo === 'pedido' ? 'app' : 'interno',
      prazo: prazoDe(f.prazo),
      bola: f.bola,
      responsavel_nome: analistaDe(f.clienteId),
      situacao: 'aberto',
      faltando: [],
      sla_inicio: iso('2026-11-17', '10:00'),
      sla_meta_h: f.tipo === 'pedido' ? 24 : 8,
      detalhe: f.detalhe,
      visibilidade: 'compartilhada',
    })
  add('bpo_item_fila', { id: 'fq8', cliente_id: 'c2', tipo: 'pedido', texto: '“Paguem o conserto do forno da Assistec”', codigo: 'BPO-009', canal: 'whatsapp', prazo: '2026-11-21', bola: 'cliente', responsavel_nome: 'Lucas Prado', situacao: 'aberto', faltando: ['boleto ou nota', 'valor'], sla_inicio: null, sla_meta_h: 24, detalhe: 'João mandou áudio; falta o boleto para conferir', visibilidade: 'compartilhada' })

  // ---------- Frente entre escritórios (C2): contratantes são subinquilinos ----------
  add('subinquilino', {
    id: 'sb-alfa',
    nome: 'Escritório Alfa Contabilidade',
    cnpj: '31.402.118/0001-07',
    tema_id: 'horizonte',
    escopo_mae: ['dp', 'fiscal'],
    modo_contato: 'marca',
    convidados_max: 10,
    transferencia: 'parcial',
    contrato: { sla_h: 48, inicio: '2026-02-01', preco_empresa: 180, aviso_previo_dias: 60 },
    suboperadores: ['Heild (plataforma)', 'Nuvem da plataforma'],
    procuracoes: [
      { empresa: 'Mercadinho Xavier', situacao: 'outorgada' },
      { empresa: 'Padaria Yara', situacao: 'certificado_no_cofre' },
      { empresa: 'Auto Elétrica Zona Sul', situacao: 'contratante_transmite' },
    ],
    clientes_finais: [
      { id: 'cf-a1', nome: 'Mercadinho Xavier', cnpj: '12.884.330/0001-12', regime: 'Simples Nacional', departamentos: ['dp', 'fiscal'] },
      { id: 'cf-a2', nome: 'Padaria Yara', cnpj: '28.110.904/0001-55', regime: 'Simples Nacional', departamentos: ['dp'] },
      { id: 'cf-a3', nome: 'Auto Elétrica Zona Sul', cnpj: '07.553.221/0001-90', regime: 'Lucro Presumido', departamentos: ['fiscal'] },
    ],
    situacao: 'ativo',
    sla_mes: 97,
    margem: 38,
    horas_mes: 22,
    honorario_mes: 5_760,
  })
  add('subinquilino', {
    id: 'sb-beta',
    nome: 'Contábil Beta',
    cnpj: '19.776.540/0001-31',
    tema_id: 'verde-campo',
    escopo_mae: ['dp', 'fiscal', 'contabil'],
    modo_contato: 'invisivel',
    convidados_max: 10,
    transferencia: 'parcial',
    contrato: { sla_h: 48, inicio: '2026-06-01', preco_empresa: 210, aviso_previo_dias: 60 },
    suboperadores: ['Heild (plataforma)', 'Nuvem da plataforma'],
    procuracoes: [
      { empresa: 'Clínica Wanderley', situacao: 'outorgada' },
      { empresa: 'Loja Zanetti', situacao: 'contratante_transmite' },
    ],
    clientes_finais: [
      { id: 'cf-b1', nome: 'Clínica Wanderley', cnpj: '33.019.602/0001-48', regime: 'Lucro Presumido', departamentos: ['dp', 'contabil'] },
      { id: 'cf-b2', nome: 'Loja Zanetti', cnpj: '41.230.775/0001-03', regime: 'Simples Nacional', departamentos: ['fiscal', 'contabil'] },
    ],
    situacao: 'ativo',
    sla_mes: 88,
    margem: 12,
    horas_mes: 31,
    honorario_mes: 4_410,
  })
  for (const c of [
    { id: 'bg1', subinquilino_id: 'sb-alfa', nome: 'Renata Alves', email: 'renata@alfacontabil.com.br', papel: 'responsavel_tecnico' as const, situacao: 'ativo' as const },
    { id: 'bg2', subinquilino_id: 'sb-alfa', nome: 'Diego Moura', email: 'diego@alfacontabil.com.br', papel: 'equipe' as const, situacao: 'ativo' as const },
    { id: 'bg3', subinquilino_id: 'sb-alfa', nome: 'Paulo Alves', email: 'paulo@alfacontabil.com.br', papel: 'socio' as const, situacao: 'convidado' as const },
    { id: 'bg4', subinquilino_id: 'sb-beta', nome: 'Carolina Beta', email: 'carolina@contabilbeta.com.br', papel: 'responsavel_tecnico' as const, situacao: 'ativo' as const },
    { id: 'bg5', subinquilino_id: 'sb-beta', nome: 'Igor Lemos', email: 'igor@contabilbeta.com.br', papel: 'equipe' as const, situacao: 'ativo' as const },
  ])
    add('bpo_convidado', c)
  for (const f of [
    { id: 'fe1', subinquilino_id: 'sb-alfa', cliente_final: 'Mercadinho Xavier', departamento: 'dp', tipo: 'pedido' as const, texto: 'Rescisão de João Silva', codigo: 'DP-027', canal: 'portal' as const, prazo: '2026-11-21', prazo_legal: '2026-11-24', bola: 'bpo' as const, responsavel_nome: 'Lucas Prado', faltando: [], sla_meta_h: 48, detalhe: 'aviso prévio trabalhado; prazo legal em 24/11' },
    { id: 'fe2', subinquilino_id: 'sb-alfa', cliente_final: 'Padaria Yara', departamento: 'dp', tipo: 'pedido' as const, texto: 'Folha de novembro', codigo: 'DP-014', canal: 'portal' as const, prazo: '2026-11-28', bola: 'bpo' as const, responsavel_nome: 'Marina Teixeira', faltando: [], sla_meta_h: 72, detalhe: 'SLA de 3 dias' },
    { id: 'fe3', subinquilino_id: 'sb-beta', cliente_final: 'Clínica Wanderley', departamento: 'dp', tipo: 'pedido' as const, texto: 'Admissão de Maria Lopes', codigo: 'DP-001', canal: 'portal' as const, prazo: '2026-11-20', bola: 'cliente_final' as const, responsavel_nome: 'Lucas Prado', faltando: ['CTPS digital'], sla_meta_h: 48, detalhe: 'falta a CTPS; o relógio está parado há 2 dias' },
    { id: 'fe4', subinquilino_id: 'sb-beta', cliente_final: 'Loja Zanetti', departamento: 'fiscal', tipo: 'revisao' as const, texto: 'Transmitir PGDAS-D de outubro', codigo: 'FIS-009', canal: 'interno' as const, prazo: '2026-11-20', prazo_legal: '2026-11-20', bola: 'contratante' as const, responsavel_nome: 'Marina Teixeira', faltando: [], sla_meta_h: 24, detalhe: 'revisão do responsável técnico (transferência parcial): pode transmitir?' },
    { id: 'fe5', subinquilino_id: 'sb-alfa', cliente_final: 'Auto Elétrica Zona Sul', departamento: 'fiscal', tipo: 'revisao' as const, texto: 'Transmitir DCTFWeb de outubro', codigo: 'FIS-021', canal: 'interno' as const, prazo: '2026-11-21', prazo_legal: '2026-11-28', bola: 'contratante' as const, responsavel_nome: 'Lucas Prado', faltando: [], sla_meta_h: 24, detalhe: 'revisão da Renata (responsável técnica)' },
  ])
    add('bpo_item_fila', { ...f, situacao: 'aberto', sla_inicio: f.faltando.length ? null : iso('2026-11-17', '09:00'), visibilidade: 'compartilhada' })
  add('bpo_entrega', { id: 'be-alfa-10', subinquilino_id: 'sb-alfa', competencia: '2026-10', tipo: 'relatorio_contratante', situacao: 'enviado', enviado_em: iso('2026-11-05', '11:00'), enviado_por: 'Marina Teixeira' })
  add('bpo_entrega', { id: 'be-beta-10', subinquilino_id: 'sb-beta', competencia: '2026-10', tipo: 'relatorio_contratante', situacao: 'pendente' })
  add('bpo_volume', {
    id: 'bv-alfa',
    subinquilino_id: 'sb-alfa',
    competencia: COMPETENCIA_BPO,
    itens: [
      { unidade: 'empresas ativas', quantidade: 32, preco: 180 },
      { unidade: 'holerites', quantidade: 214, preco: 0 },
      { unidade: 'rescisões', quantidade: 3, preco: 120 },
    ],
    contestacoes: [],
    situacao: 'aberto',
    extra_valor: 0,
  })
  add('bpo_volume', {
    id: 'bv-beta',
    subinquilino_id: 'sb-beta',
    competencia: COMPETENCIA_BPO,
    itens: [
      { unidade: 'empresas ativas', quantidade: 21, preco: 210 },
      { unidade: 'notas escrituradas', quantidade: 1_180, preco: 0 },
      { unidade: 'admissões', quantidade: 4, preco: 90 },
    ],
    contestacoes: [{ id: 'ct1', unidade: 'admissões', quantidade: 1, motivo: 'A admissão da Maria Lopes ainda não foi concluída', por: 'Carolina Beta', situacao: 'aberta' }],
    situacao: 'contestado',
    extra_valor: 0,
  })
  return foto
}

/** Tabelas do BPO (para a semente tardia num banco antigo). */
const tabelasBpo: NomeTabela[] = ['subinquilino', 'bpo_configuracao', 'bpo_perfil', 'bpo_conexao_erp', 'bpo_conta_bancaria', 'bpo_fornecedor', 'bpo_conta', 'bpo_lote', 'bpo_alcada', 'bpo_item_fila', 'bpo_rotina', 'bpo_transacao', 'bpo_entrega', 'bpo_volume', 'bpo_convidado']

/**
 * Banco guardado antes das tabelas do BPO existirem: semeia só o BPO, uma vez
 * (sem apagar nada do que a pessoa já fez nas outras telas).
 */
export function garantirSementeBpo() {
  const id = banco.escritorioId
  if (!id || banco.ler('bpo_configuracao').length) return
  const { foto, add } = montador(id, '2026-11-18T09:00:00.000Z')
  sementeS08(foto, add as Add, id === 'esc-andrade')
  banco.transacao((tx) => {
    for (const t of [...tabelasBpo, 'cartao_aprovacao' as const]) for (const r of foto[t] as Tabelas[typeof t][]) if (!tx.obter(t, r.id)) tx.gravar(t, r)
  })
}

import { autorizar, type Alvo } from '@/nucleo/permissoes/autorizar'
import type { Contexto } from '@/nucleo/permissoes/perfil'
import type { NomeTabela, Registro } from '@/nucleo/modelo/entidades'

/**
 * Quem lê o quê (B5; ARQUITETURA 6.1 e 6.3). Uma regra só para o `sincronizar`, o SSE
 * (`/v1/eventos/fluxo`) e o `useConsulta`, rodando igual no navegador e no servidor:
 *
 *  - **classe** da tabela: 1 inteira na sessão, 2 janela do trabalho aberto, 3 só por
 *    consulta paginada (nunca no `sincronizar`);
 *  - **linha a linha**, a função `autorizar` no nível ler, com o setor e o cliente da linha
 *    (setor, carteira e exceção por tela); o que é da pessoa (aviso, conversa interna) só
 *    vai para ela; a pessoa do cliente só recebe o que é do cliente dela.
 *
 * As tabelas das fases seguintes (CRM na F5; Timesheet, Financeiro e BPO na F6; documentos
 * na F2) seguem na classe 1 de transição, ainda filtradas por setor e carteira: o desenho
 * deixa a tabela ainda não migrada seguir como está, só com dado de demonstração
 * (ARQUITETURA 5). A classe definitiva delas está em `CLASSE_DESENHO`.
 */

export type Classe = 1 | 2 | 3

/** Classe de cada tabela no desenho (ARQUITETURA 6.1). Fora da lista: classe 1. */
export const CLASSE_DESENHO: Partial<Record<NomeTabela, Classe>> = {
  // 2 · Janela
  tarefa: 2, conversa: 2, cartao_aprovacao: 2, notificacao: 2, item_fila: 2, mensagem_integrante: 2, conversa_interna: 2, participacao: 2,
  sessao_trabalho: 2, item_confirmacao: 2, ausencia: 2, cobranca: 2, parcela: 2, conta_pagar: 2, nota_emitida: 2, servico_avulso: 2,
  despesa_adiantada: 2, lote_faturamento: 2, fechamento_timesheet: 2, fechamento_financeiro: 2, cenario_caixa: 2, aditivo: 2,
  bpo_item_fila: 2, bpo_lote: 2, bpo_conta: 2,
  // 3 · Consulta paginada
  evento: 3, mensagem: 3, mensagem_interna: 3, documento: 3, registro_entrega: 3, lancamento: 3, recebimento: 3,
  nota_servico_escritorio: 3, bpo_transacao: 3, bpo_entrega: 3, bpo_volume: 3, pulso_portal: 3,
}

/**
 * As tabelas que a F1 já migrou (ARQUITETURA 7, F1: os repositórios do núcleo). Só nelas a
 * classe do desenho vale agora; as outras ficam na classe 1 de transição até a fase delas.
 */
export const TABELAS_F1 = new Set<NomeTabela>([
  'escritorio', 'assinatura', 'setor', 'usuario', 'vinculo_setor', 'excecao_tela', 'carteira_cliente', 'convite', 'pessoa', 'identidade',
  'cliente', 'versao_perfil', 'obrigacao', 'tarefa', 'cartao_aprovacao', 'notificacao', 'conversa_interna', 'participacao', 'mensagem_interna',
  'registro_tela', 'evento',
])

export const classeDaTabela = (t: NomeTabela): Classe => (TABELAS_F1.has(t) ? (CLASSE_DESENHO[t] ?? 1) : 1)

/** Janela da classe 2, em dias, para o que já fechou (o aberto vai sempre). */
export const JANELA_DIAS: Partial<Record<NomeTabela, number>> = { tarefa: 60, cartao_aprovacao: 30 }

type Linha = Registro & Record<string, unknown>

/** Ferramenta de leitura pela qual a linha de cada módulo é autorizada (o setor vem da linha). */
const LER_POR_TABELA: Partial<Record<NomeTabela, string>> = {
  cliente: 'cliente.listar',
  versao_perfil: 'cliente.listar',
  obrigacao: 'obrigacao.listar',
  conversa: 'conversa.listar',
  mensagem: 'conversa.listar',
  lead: 'conversa.listar',
  documento: 'documento.listar',
  registro_entrega: 'documento.listar',
  cartao_aprovacao: 'aprovacao.listar',
}
const LER_POR_PREFIXO: [string, string][] = [
  ['bpo_', 'bpo.ler'],
  ['subinquilino', 'bpo.ler'],
]

/** O alvo de autorização de uma linha: setor e cliente, quando a linha tem. */
export function alvoDaLinha(t: NomeTabela, l: Linha): Alvo {
  if (t === 'cliente') return { cliente_id: l.id }
  if (t === 'obrigacao') return { setor_id: (l.gera_tarefa_para_setor as string | null) ?? null }
  const setor = typeof l.setor_id === 'string' ? l.setor_id : null
  const cliente = typeof l.cliente_id === 'string' ? l.cliente_id : null
  return { ...(setor ? { setor_id: setor } : {}), ...(cliente ? { cliente_id: cliente } : {}) }
}

/** A ferramenta do catálogo com que a linha é lida. */
export function ferramentaDeLeitura(t: NomeTabela, alvo: Alvo): string | null {
  const direta = LER_POR_TABELA[t] ?? LER_POR_PREFIXO.find(([p]) => t.startsWith(p))?.[1]
  if (direta) return direta
  // Linha de um setor: o vínculo ao setor manda (a ferramenta de leitura do Painel, setor = alvo).
  if (alvo.setor_id) return 'tarefa.listar'
  // Linha só de um cliente: a carteira manda.
  if (alvo.cliente_id) return 'cliente.listar'
  return null
}

/** Tabelas que a pessoa do cliente nunca recebe (configuração e trilha internas da equipe). */
const SO_EQUIPE = new Set<NomeTabela>(['vinculo_setor', 'excecao_tela', 'carteira_cliente', 'convite', 'registro_tela', 'conversa_interna', 'participacao', 'mensagem_interna', 'item_fila', 'mensagem_integrante', 'evento', 'cartao_aprovacao', 'custo_hora'])
/** Tabelas sem cliente que o app do cliente precisa para montar a tela. */
const GERAIS_DO_CLIENTE = new Set<NomeTabela>(['escritorio', 'assinatura', 'setor', 'integrante', 'usuario'])

/** O que é da pessoa: só ela recebe (aviso, conversa interna de que participa). */
function daPessoa(t: NomeTabela, l: Linha, usuarioId: string, participacoes: ReadonlySet<string>): boolean | null {
  if (t === 'notificacao') {
    const ids = Array.isArray(l.destinatario_ids) ? (l.destinatario_ids as string[]) : []
    return l.destinatario_tipo !== 'usuario' || ids.includes(usuarioId)
  }
  if (t === 'participacao') return l.usuario_id === usuarioId || participacoes.has(String(l.conversa_interna_id))
  if (t === 'conversa_interna') return l.tipo === 'canal_geral' || l.tipo === 'canal_setor' || participacoes.has(l.id)
  if (t === 'mensagem_interna') return participacoes.has(String(l.conversa_interna_id)) || null
  return null
}

export interface EscopoLeitura {
  ctx: Contexto
  /** Conversas internas de que a pessoa participa (para canal privado e grupo). */
  participacoes?: ReadonlySet<string>
  /** Conversas internas abertas a todos (canais), para a leitura de mensagem interna. */
  canais?: ReadonlySet<string>
}

/**
 * A pessoa (ou o integrante, ou a pessoa do cliente) pode ler esta linha? É a mesma decisão
 * no `sincronizar`, no aviso do SSE e no `useConsulta`.
 */
export function podeLerLinha(e: EscopoLeitura, t: NomeTabela, l: Linha): boolean {
  const a = e.ctx.ator
  if (a.tipo === 'sistema') return true
  if (a.tipo === 'pessoa_cliente') {
    if (SO_EQUIPE.has(t)) return false
    if (t === 'cliente') return l.id === a.cliente_id
    if (typeof l.cliente_id === 'string') return l.cliente_id === a.cliente_id
    return GERAIS_DO_CLIENTE.has(t)
  }
  const perfil = a.tipo === 'pessoa' ? a.perfil : a.dono
  if (perfil) {
    const propria = daPessoa(t, l, perfil.usuario_id, e.participacoes ?? new Set())
    if (propria === false) return false
    if (t === 'mensagem_interna' && propria === null && !(e.canais ?? new Set()).has(String(l.conversa_interna_id))) return false
  }
  const alvo = alvoDaLinha(t, l)
  const f = ferramentaDeLeitura(t, alvo)
  if (!f) return true
  return autorizar(e.ctx, f, alvo, 'ler').permitido
}

/** Linha da janela da classe 2: aberta, ou fechada há menos de `JANELA_DIAS`. */
export function naJanela(t: NomeTabela, l: Linha, agora = Date.now()): boolean {
  const dias = JANELA_DIAS[t]
  if (!dias) return true
  const limite = new Date(agora - dias * 86_400_000).toISOString()
  if (t === 'tarefa') return (l.status !== 'concluida' && l.status !== 'cancelada') || String(l.atualizado_em ?? l.criado_em) >= limite
  if (t === 'cartao_aprovacao') return l.status === 'pendente' || String(l.decidido_em ?? l.atualizado_em ?? l.criado_em) >= limite
  return true
}

/** Para a pessoa do cliente, só o que a tela dela mostra de uma conta da equipe (nome e papel). */
export function projetarParaCliente(t: NomeTabela, l: Linha): Linha {
  if (t === 'usuario') return { id: l.id, escritorio_id: l.escritorio_id, nome: l.nome, papel: l.papel, situacao: l.situacao, criado_em: l.criado_em, atualizado_em: l.atualizado_em, versao_linha: l.versao_linha } as Linha
  return l
}

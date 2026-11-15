import { z } from 'zod'
import type { Alvo } from '@/nucleo/permissoes/autorizar'
import type { NomeTabela, Registro } from '@/nucleo/modelo/entidades'
import type { CodigoErro } from './erros'
import { IdEsquema as Id, Visao } from './contrato'

/**
 * Ferramentas tipadas das Fundações e do Contábil (AGENTICO 3; API_INTERNA 4 e 5):
 * a fachada que o agente, o MCP (sessão B2) e o OpenAPI enxergam.
 *
 * - Entrada estrita (Zod `.strict()` → `additionalProperties: false`), enums fechados,
 *   ids e nunca nomes.
 * - Escrita: vira a chamada de um método de repositório (a mesma regra do wireframe),
 *   executada pelo executor do servidor com idempotência, `validar_apenas` e evento na
 *   cadeia. `*.atualizar` aceita só os campos editáveis: status muda só pela ferramenta
 *   da transição (ARQUITETURA 6.2).
 * - Leitura: lista paginada por cursor, com visão compacta (padrão do agente) ou de tela,
 *   filtrada linha a linha pela mesma função `autorizar` (setor e carteira).
 *
 * As definições moram aqui (navegador e servidor); a execução, só no servidor.
 */

export interface Filtro {
  coluna: string
  op: '=' | 'in' | 'ilike' | 'is_null' | 'not_null' | '>=' | '<='
  valor?: unknown
}

interface Base<E extends z.ZodObject> {
  nome: string
  versao: number
  descricao_modelo: string
  entrada: E
  /** Erros que a ferramenta pode devolver além dos comuns (entrada, sessão, permissão). */
  erros: CodigoErro[]
  exposta_mcp: boolean
}

export interface FerramentaEscrita<E extends z.ZodObject = z.ZodObject> extends Base<E> {
  tipo: 'escrita'
  /** A chamada de repositório que faz o trabalho. */
  chamada: (e: z.output<E>) => { operacao: string; argumentos: unknown[] }
}

export interface FerramentaLeitura<E extends z.ZodObject = z.ZodObject> extends Base<E> {
  tipo: 'leitura'
  tabela: NomeTabela
  /** Ferramenta do catálogo com que cada linha é autorizada (nível ler). */
  autorizar_com: string
  alvo: (linha: Registro & Record<string, unknown>) => Alvo
  filtros: (e: z.output<E>) => Filtro[]
  /** `obter`: uma linha pelo id, sem paginação. */
  unica?: (e: z.output<E>) => string
  compacta: (linha: Registro & Record<string, unknown>) => Record<string, unknown>
  totais?: (linhas: (Registro & Record<string, unknown>)[]) => Record<string, number>
  ordem?: 'criado_em' | 'seq'
}

export type FerramentaTipada = FerramentaEscrita | FerramentaLeitura

const escrita = <E extends z.ZodObject>(f: Omit<FerramentaEscrita<E>, 'tipo' | 'exposta_mcp'> & { exposta_mcp?: boolean }): FerramentaEscrita =>
  ({ tipo: 'escrita', exposta_mcp: true, ...f }) as unknown as FerramentaEscrita
const leitura = <E extends z.ZodObject>(f: Omit<FerramentaLeitura<E>, 'tipo' | 'exposta_mcp'> & { exposta_mcp?: boolean }): FerramentaLeitura =>
  ({ tipo: 'leitura', exposta_mcp: true, ...f }) as unknown as FerramentaLeitura

/* ---------- Vocabulário fechado ---------- */

export const SetorEsquema = z.enum(['societario', 'fiscal', 'notas', 'dp', 'contabil', 'consultor', 'gestao_atendimento', 'financeiro_escritorio', 'bpo_financeiro', 'bpo', 'pf', 'terceiro_setor', 'nichos', 'ciclo_vida'])
export const StatusTarefaEsquema = z.enum(['a_fazer', 'em_andamento', 'aguardando_cliente', 'aguardando_terceiro', 'em_revisao', 'concluida', 'cancelada'])
export const PrioridadeEsquema = z.enum(['baixa', 'normal', 'alta', 'urgente'])
export const DataEsquema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data no formato AAAA-MM-DD.')
export const CompetenciaEsquema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Competência no formato AAAA-MM.')
export const RegimeEsquema = z.enum(['simples', 'presumido', 'real', 'mei', 'imune_isento', 'pf'])
export const TipoClienteEsquema = z.enum(['pj', 'pf', 'mei', 'condominio', 'entidade_terceiro_setor', 'produtor_rural'])
export const EstadoCicloEsquema = z.enum(['prospect', 'proposta', 'aceito', 'em_implantacao', 'ativo', 'inativo', 'em_saida', 'em_baixa', 'encerrado', 'arquivado', 'eliminado'])
const Motivo = z.string().trim().min(3, 'Escreva o motivo (vai para o evento).').max(500)
const Texto = (max: number) => z.string().trim().min(1).max(max)

/** Parâmetros comuns das listas: visão, tamanho da página e cursor opaco. */
const Paginacao = { visao: Visao, limite: z.number().int().min(1).max(100).optional(), cursor: z.string().max(400).optional() }

const hojeIso = () => new Date().toISOString().slice(0, 10)
const aberta = (s: unknown) => s !== 'concluida' && s !== 'cancelada'

/* ---------- Tarefas (Painel; Fundações 4.8) ---------- */

const transicao = (nome: string, status: z.infer<typeof StatusTarefaEsquema>, descricao: string) =>
  escrita({
    nome,
    versao: 1,
    descricao_modelo: descricao,
    entrada: z.object({ tarefa_id: Id }).strict(),
    erros: ['NAO_ENCONTRADO', 'TAREFA_FINAL'],
    chamada: (e) => ({ operacao: 'tarefas.mudarStatus', argumentos: [e.tarefa_id, status] }),
  })

export const ferramentasTipadas: FerramentaTipada[] = [
  leitura({
    nome: 'tarefa.listar',
    versao: 1,
    descricao_modelo: 'Lista tarefas no seu escopo, com totais por situação. Filtre por setor, cliente, status ou competência.',
    entrada: z
      .object({ setor_id: SetorEsquema.optional(), cliente_id: Id.optional(), status: z.array(StatusTarefaEsquema).max(7).optional(), competencia: CompetenciaEsquema.optional(), responsavel_id: Id.optional(), ...Paginacao })
      .strict(),
    erros: ['CURSOR_INVALIDO'],
    tabela: 'tarefa',
    autorizar_com: 'tarefa.listar',
    alvo: (t) => ({ setor_id: (t.setor_id as string) ?? null, cliente_id: (t.cliente_id as string) ?? null }),
    filtros: (e) => [
      ...(e.setor_id ? [{ coluna: 'setor_id', op: '=' as const, valor: e.setor_id }] : []),
      ...(e.cliente_id ? [{ coluna: 'cliente_id', op: '=' as const, valor: e.cliente_id }] : []),
      ...(e.status?.length ? [{ coluna: 'status', op: 'in' as const, valor: e.status }] : []),
      ...(e.competencia ? [{ coluna: 'competencia', op: '=' as const, valor: e.competencia }] : []),
      ...(e.responsavel_id ? [{ coluna: 'responsavel_id', op: '=' as const, valor: e.responsavel_id }] : []),
    ],
    compacta: (t) => ({ id: t.id, titulo: t.titulo, setor_id: t.setor_id, cliente_id: t.cliente_id ?? null, status: t.status, prazo_interno: t.prazo_interno ?? null, prazo_legal: t.prazo_legal ?? null, prioridade: t.prioridade, responsavel_id: t.responsavel_id ?? null }),
    totais: (ts) => {
      const hoje = hojeIso()
      return {
        abertas: ts.filter((t) => aberta(t.status)).length,
        atrasadas: ts.filter((t) => aberta(t.status) && typeof t.prazo_interno === 'string' && t.prazo_interno < hoje).length,
        aguardando_cliente: ts.filter((t) => t.status === 'aguardando_cliente').length,
        concluidas: ts.filter((t) => t.status === 'concluida').length,
      }
    },
  }),
  leitura({
    nome: 'tarefa.obter',
    versao: 1,
    descricao_modelo: 'Uma tarefa pelo id, com checklist e prazos.',
    entrada: z.object({ tarefa_id: Id, visao: Visao }).strict(),
    erros: ['NAO_ENCONTRADO'],
    tabela: 'tarefa',
    autorizar_com: 'tarefa.listar',
    alvo: (t) => ({ setor_id: (t.setor_id as string) ?? null, cliente_id: (t.cliente_id as string) ?? null }),
    filtros: () => [],
    unica: (e) => e.tarefa_id,
    compacta: (t) => ({ id: t.id, titulo: t.titulo, descricao: t.descricao ?? null, setor_id: t.setor_id, cliente_id: t.cliente_id ?? null, competencia: t.competencia ?? null, status: t.status, status_desde: t.status_desde, prazo_interno: t.prazo_interno ?? null, prazo_legal: t.prazo_legal ?? null, prioridade: t.prioridade, responsavel_tipo: t.responsavel_tipo ?? null, responsavel_id: t.responsavel_id ?? null, checklist: t.checklist }),
  }),
  escrita({
    nome: 'tarefa.criar',
    versao: 1,
    descricao_modelo: 'Cria uma tarefa num setor, ligada a uma atividade do catálogo e, se houver, a um cliente.',
    entrada: z
      .object({
        setor_id: SetorEsquema,
        atividade_id: Texto(60),
        titulo: Texto(200),
        cliente_id: Id.optional(),
        descricao: z.string().max(4000).optional(),
        competencia: CompetenciaEsquema.optional(),
        prazo_interno: DataEsquema.optional(),
        prazo_legal: DataEsquema.optional(),
        prioridade: PrioridadeEsquema.default('normal'),
        responsavel_tipo: z.enum(['usuario', 'integrante']).optional(),
        responsavel_id: Id.optional(),
        quem_conclui: z.enum(['pessoa', 'agente_sozinho', 'agente_prepara_pessoa_conclui']).default('pessoa'),
      })
      .strict(),
    erros: ['CAMPO_OBRIGATORIO'],
    chamada: (e) => ({
      operacao: 'tarefas.criar',
      argumentos: [{ ...e, origem: 'pessoa', status: 'a_fazer', status_desde: new Date().toISOString(), checklist: [], risco: false }],
    }),
  }),
  escrita({
    nome: 'tarefa.atualizar',
    versao: 1,
    descricao_modelo: 'Muda campos editáveis de uma tarefa (título, descrição, prazos, prioridade). Status muda só pelas ferramentas de transição.',
    entrada: z
      .object({
        tarefa_id: Id,
        campos: z
          .object({ titulo: Texto(200).optional(), descricao: z.string().max(4000).optional(), prazo_interno: DataEsquema.nullable().optional(), prazo_legal: DataEsquema.nullable().optional(), prioridade: PrioridadeEsquema.optional(), competencia: CompetenciaEsquema.optional() })
          .strict()
          .refine((c) => Object.keys(c).length > 0, 'Informe ao menos um campo.'),
      })
      .strict(),
    erros: ['NAO_ENCONTRADO', 'CAMPO_OBRIGATORIO'],
    chamada: (e) => ({ operacao: 'tarefas.atualizar', argumentos: [e.tarefa_id, e.campos] }),
  }),
  transicao('tarefa.iniciar', 'em_andamento', 'Põe a tarefa em andamento.'),
  transicao('tarefa.aguardar_cliente', 'aguardando_cliente', 'Marca a tarefa como aguardando o cliente.'),
  transicao('tarefa.aguardar_terceiro', 'aguardando_terceiro', 'Marca a tarefa como aguardando terceiro (órgão, banco).'),
  transicao('tarefa.enviar_revisao', 'em_revisao', 'Manda a tarefa para revisão.'),
  transicao('tarefa.concluir', 'concluida', 'Conclui uma tarefa aberta. Concluída é final: reabrir é criar outra.'),
  escrita({
    nome: 'tarefa.cancelar',
    versao: 1,
    descricao_modelo: 'Cancela uma tarefa com motivo. Tarefa de obrigação só Gestor do setor ou Administrador cancela.',
    entrada: z.object({ tarefa_id: Id, motivo: Motivo }).strict(),
    erros: ['NAO_ENCONTRADO', 'TAREFA_FINAL', 'MOTIVO_OBRIGATORIO'],
    chamada: (e) => ({ operacao: 'tarefas.cancelar', argumentos: [e.tarefa_id, e.motivo] }),
  }),
  escrita({
    nome: 'tarefa.reatribuir',
    versao: 1,
    descricao_modelo: 'Troca o responsável da tarefa (exige gestão do setor).',
    entrada: z.object({ tarefa_id: Id, responsavel_tipo: z.enum(['usuario', 'integrante']), responsavel_id: Id }).strict(),
    erros: ['NAO_ENCONTRADO'],
    chamada: (e) => ({ operacao: 'tarefas.reatribuir', argumentos: [e.tarefa_id, { tipo: e.responsavel_tipo, id: e.responsavel_id }] }),
  }),
  escrita({
    nome: 'tarefa.arquivar',
    versao: 1,
    descricao_modelo: 'Arquiva uma tarefa (some das listas, continua existindo).',
    entrada: z.object({ tarefa_id: Id, motivo: Motivo }).strict(),
    erros: ['NAO_ENCONTRADO'],
    chamada: (e) => ({ operacao: 'tarefas.arquivar', argumentos: [e.tarefa_id, { motivo: e.motivo }] }),
  }),

  /* ---------- Clientes (Cadastro; 03) ---------- */

  leitura({
    nome: 'cliente.listar',
    versao: 1,
    descricao_modelo: 'Lista clientes no seu escopo (carteira), por estado do ciclo ou regime.',
    entrada: z.object({ estado_ciclo: z.array(EstadoCicloEsquema).max(11).optional(), regime: RegimeEsquema.optional(), ...Paginacao }).strict(),
    erros: ['CURSOR_INVALIDO'],
    tabela: 'cliente',
    autorizar_com: 'cliente.listar',
    alvo: (c) => ({ cliente_id: c.id }),
    filtros: (e) => [...(e.estado_ciclo?.length ? [{ coluna: 'estado_ciclo', op: 'in' as const, valor: e.estado_ciclo }] : []), ...(e.regime ? [{ coluna: 'regime', op: '=' as const, valor: e.regime }] : [])],
    compacta: (c) => ({ id: c.id, codigo: c.codigo, nome: c.nome, documento: c.documento, regime: c.regime, estado_ciclo: c.estado_ciclo }),
    totais: (cs) => ({ ativos: cs.filter((c) => c.estado_ciclo === 'ativo').length, em_implantacao: cs.filter((c) => c.estado_ciclo === 'em_implantacao').length }),
  }),
  leitura({
    nome: 'cliente.obter',
    versao: 1,
    descricao_modelo: 'Um cliente pelo id.',
    entrada: z.object({ cliente_id: Id, visao: Visao }).strict(),
    erros: ['NAO_ENCONTRADO'],
    tabela: 'cliente',
    autorizar_com: 'cliente.listar',
    alvo: (c) => ({ cliente_id: c.id }),
    filtros: () => [],
    unica: (e) => e.cliente_id,
    compacta: (c) => ({ id: c.id, codigo: c.codigo, nome: c.nome, documento: c.documento, tipo: c.tipo, regime: c.regime, estado_ciclo: c.estado_ciclo, estado_ciclo_desde: c.estado_ciclo_desde, servicos_contratados: c.servicos_contratados }),
  }),
  escrita({
    nome: 'cliente.criar',
    versao: 1,
    descricao_modelo: 'Cadastra um cliente. O documento (CNPJ ou CPF) é único no escritório.',
    entrada: z.object({ tipo: TipoClienteEsquema, codigo: Texto(20), documento: Texto(20), nome: Texto(200), regime: RegimeEsquema, estado_ciclo: EstadoCicloEsquema.default('em_implantacao'), servicos_contratados: z.array(Texto(40)).max(30).default([]) }).strict(),
    erros: ['CAMPO_OBRIGATORIO', 'RESTRICAO_DO_BANCO'],
    chamada: (e) => ({ operacao: 'clientes.criar', argumentos: [{ ...e, estado_ciclo_desde: hojeIso() }] }),
  }),
  escrita({
    nome: 'cliente.atualizar',
    versao: 1,
    descricao_modelo: 'Muda campos cadastrais do cliente. O estado do ciclo muda por cliente.mudar_estado.',
    entrada: z
      .object({ cliente_id: Id, campos: z.object({ nome: Texto(200).optional(), codigo: Texto(20).optional(), documento: Texto(20).optional(), servicos_contratados: z.array(Texto(40)).max(30).optional() }).strict().refine((c) => Object.keys(c).length > 0, 'Informe ao menos um campo.') })
      .strict(),
    erros: ['NAO_ENCONTRADO', 'CAMPO_OBRIGATORIO', 'RESTRICAO_DO_BANCO'],
    chamada: (e) => ({ operacao: 'clientes.atualizar', argumentos: [e.cliente_id, e.campos] }),
  }),
  escrita({
    nome: 'cliente.mudar_estado',
    versao: 1,
    descricao_modelo: 'Muda o estado do ciclo de vida do cliente (Gestor ou Administrador).',
    entrada: z.object({ cliente_id: Id, estado_ciclo: EstadoCicloEsquema }).strict(),
    erros: ['NAO_ENCONTRADO'],
    chamada: (e) => ({ operacao: 'clientes.atualizar', argumentos: [e.cliente_id, { estado_ciclo: e.estado_ciclo, estado_ciclo_desde: hojeIso() }, { ferramenta: 'cliente.mudar_estado' }] }),
  }),
  escrita({
    nome: 'cliente.arquivar',
    versao: 1,
    descricao_modelo: 'Arquiva o cliente (Gestor ou Administrador). Nada se apaga.',
    entrada: z.object({ cliente_id: Id, motivo: Motivo }).strict(),
    erros: ['NAO_ENCONTRADO'],
    chamada: (e) => ({ operacao: 'clientes.arquivar', argumentos: [e.cliente_id, { motivo: e.motivo }] }),
  }),

  /* ---------- Obrigações (S02-T03) ---------- */

  leitura({
    nome: 'obrigacao.listar',
    versao: 1,
    descricao_modelo: 'Lista as obrigações do escritório, por setor que gera a tarefa.',
    entrada: z.object({ setor_id: SetorEsquema.optional(), periodicidade: z.enum(['mensal', 'trimestral', 'anual', 'por_evento', 'diaria']).optional(), ...Paginacao }).strict(),
    erros: ['CURSOR_INVALIDO'],
    tabela: 'obrigacao',
    autorizar_com: 'obrigacao.listar',
    alvo: (o) => ({ setor_id: (o.gera_tarefa_para_setor as string) ?? null }),
    filtros: (e) => [...(e.setor_id ? [{ coluna: 'gera_tarefa_para_setor', op: '=' as const, valor: e.setor_id }] : []), ...(e.periodicidade ? [{ coluna: 'periodicidade', op: '=' as const, valor: e.periodicidade }] : [])],
    compacta: (o) => ({ id: o.id, nome: o.nome, atividade_id: o.atividade_id, periodicidade: o.periodicidade, setor_id: o.gera_tarefa_para_setor, regra_prazo: o.regra_prazo, cancelada: !!o.cancelada_em }),
  }),
  escrita({
    nome: 'obrigacao.cancelar',
    versao: 1,
    descricao_modelo: 'Cancela uma obrigação com motivo (Gestor do setor ou Administrador). Fica no histórico.',
    entrada: z.object({ obrigacao_id: Id, motivo: Motivo }).strict(),
    erros: ['NAO_ENCONTRADO', 'MOTIVO_OBRIGATORIO'],
    chamada: (e) => ({ operacao: 'obrigacoes.cancelar', argumentos: [e.obrigacao_id, e.motivo] }),
  }),

  /* ---------- Comunicação interna (subplano 11): nunca se apaga ---------- */

  leitura({
    nome: 'mensagem_interna.listar',
    versao: 1,
    descricao_modelo: 'Mensagens de uma conversa interna, das mais novas para as mais antigas.',
    entrada: z.object({ conversa_interna_id: Id, ...Paginacao }).strict(),
    erros: ['CURSOR_INVALIDO'],
    tabela: 'mensagem_interna',
    autorizar_com: 'mensagem_interna.listar',
    alvo: () => ({}),
    filtros: (e) => [{ coluna: 'conversa_interna_id', op: '=', valor: e.conversa_interna_id }],
    compacta: (m) => ({ id: m.id, autor_id: m.autor_id, corpo: m.corpo, criado_em: m.criado_em, editada: !!m.editada_em }),
  }),
  escrita({
    nome: 'mensagem_interna.enviar',
    versao: 1,
    descricao_modelo: 'Escreve numa conversa interna do escritório.',
    entrada: z.object({ conversa_interna_id: Id, corpo: Texto(8000), responde_a_id: Id.optional() }).strict(),
    erros: ['CAMPO_OBRIGATORIO'],
    chamada: (e) => ({ operacao: 'mensagensInternas.enviar', argumentos: [e.conversa_interna_id, e.corpo, e.responde_a_id ? { respondeA: e.responde_a_id } : {}] }),
  }),
  escrita({
    nome: 'mensagem_interna.editar',
    versao: 1,
    descricao_modelo: 'Edita a própria mensagem interna; a versão anterior fica guardada com autor e data.',
    entrada: z.object({ mensagem_id: Id, corpo: Texto(8000) }).strict(),
    erros: ['NAO_ENCONTRADO', 'SO_AUTOR_EDITA'],
    chamada: (e) => ({ operacao: 'mensagensInternas.editar', argumentos: [e.mensagem_id, e.corpo] }),
  }),

  /* ---------- Aprovação (Fundações 3.3 e 6.4): decisão humana com autor e data ---------- */

  leitura({
    nome: 'aprovacao.listar',
    versao: 1,
    descricao_modelo: 'Cartões de aprovação, por situação (pendentes por padrão).',
    entrada: z.object({ status: z.array(z.enum(['pendente', 'aprovado', 'recusado', 'editado_e_aprovado', 'expirado', 'cancelado'])).max(6).default(['pendente']), ...Paginacao }).strict(),
    erros: ['CURSOR_INVALIDO'],
    tabela: 'cartao_aprovacao',
    autorizar_com: 'aprovacao.listar',
    alvo: () => ({}),
    filtros: (e) => [{ coluna: 'status', op: 'in', valor: e.status }],
    compacta: (c) => ({ id: c.id, ferramenta: c.ferramenta, resumo_humano: c.resumo_humano, status: c.status, pedido_por_tipo: c.pedido_por_tipo, expira_em: c.expira_em ?? null, decidido_por: c.decidido_por ?? null, decidido_em: c.decidido_em ?? null }),
  }),
  escrita({
    nome: 'aprovacao.decidir',
    versao: 1,
    descricao_modelo: 'Decide um cartão de aprovação. Só pessoa decide; cartão decidido não muda.',
    entrada: z.object({ cartao_id: Id, decisao: z.enum(['aprovado', 'recusado', 'editado_e_aprovado']), comentario: z.string().max(1000).optional() }).strict(),
    erros: ['NAO_ENCONTRADO', 'JA_DECIDIDO', 'SO_PESSOA_DECIDE'],
    exposta_mcp: false,
    chamada: (e) => ({ operacao: 'cartoes.decidir', argumentos: [e.cartao_id, e.decisao, e.comentario ? { comentario: e.comentario } : {}] }),
  }),

  /* ---------- Avisos ---------- */

  escrita({
    nome: 'notificacao.ler',
    versao: 1,
    descricao_modelo: 'Marca um aviso como lido pela conta da sessão.',
    entrada: z.object({ notificacao_id: Id, usuario_id: Id }).strict(),
    erros: ['NAO_ENCONTRADO'],
    exposta_mcp: false,
    chamada: (e) => ({ operacao: 'notificacoes.ler', argumentos: [e.notificacao_id, e.usuario_id] }),
  }),

  /* ---------- Trilha (Fundações 5) ---------- */

  leitura({
    nome: 'evento.listar',
    versao: 1,
    descricao_modelo: 'Linha do tempo: eventos do escritório (mais novos primeiro), por cliente, setor ou ferramenta.',
    entrada: z.object({ cliente_id: Id.optional(), setor_id: SetorEsquema.optional(), ferramenta: z.string().max(80).optional(), so_linha_do_tempo: z.boolean().default(true), ...Paginacao }).strict(),
    erros: ['CURSOR_INVALIDO'],
    tabela: 'evento',
    autorizar_com: 'evento.listar',
    alvo: (e) => ({ setor_id: (e.setor_id as string) ?? null, cliente_id: (e.cliente_id as string) ?? null }),
    filtros: (e) => [
      ...(e.cliente_id ? [{ coluna: 'cliente_id', op: '=' as const, valor: e.cliente_id }] : []),
      ...(e.setor_id ? [{ coluna: 'setor_id', op: '=' as const, valor: e.setor_id }] : []),
      ...(e.ferramenta ? [{ coluna: 'ferramenta', op: '=' as const, valor: e.ferramenta }] : []),
      ...(e.so_linha_do_tempo ? [{ coluna: 'visivel_na_linha_do_tempo', op: '=' as const, valor: true }] : []),
    ],
    compacta: (e) => ({ id: e.id, seq: e.seq ?? null, criado_em: e.criado_em, nome: e.nome, ator_tipo: e.ator_tipo, ator_nome: e.ator_nome, ferramenta: e.ferramenta, resultado: e.resultado, texto: e.texto, cliente_id: e.cliente_id ?? null, setor_id: e.setor_id ?? null }),
    ordem: 'seq',
  }),
]

const indice = new Map(ferramentasTipadas.map((f) => [f.nome, f]))
export const ferramentaTipada = (nome: string): FerramentaTipada | undefined => indice.get(nome)

/** Nome exposto a APIs de modelo que só aceitam [a-zA-Z0-9_-] (AGENTICO 7): `tarefa.concluir` ↔ `tarefa_concluir`. */
export const nomeExposto = (nome: string) => nome.replace(/\./g, '_')
export const nomeDoExposto = (exposto: string) => ferramentasTipadas.find((f) => nomeExposto(f.nome) === exposto)?.nome

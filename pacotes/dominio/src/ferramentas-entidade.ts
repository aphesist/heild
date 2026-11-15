import { z } from 'zod'
import type { NomeTabela } from '@/nucleo/modelo/entidades'
import { IdEsquema as Id, IdGerado } from './contrato'
import { CompetenciaEsquema, DataEsquema, PrioridadeEsquema, RegimeEsquema, registrarFerramentaTipada, SetorEsquema, type FerramentaEscrita } from './ferramentas'

/**
 * Ferramentas de entidade da F1 (B5; ARQUITETURA 6.2): as operações genéricas dos
 * repositórios do núcleo viram ferramentas com esquema fechado.
 *
 *   criar                → x.criar        (só os campos de negócio; o servidor põe id, escritório, datas e ordem)
 *   atualizar(id, patch) → x.atualizar({ x_id, campos })   (só os campos EDITÁVEIS)
 *   arquivar / desarquivar / excluir / reordenar → x.arquivar / x.desarquivar / x.excluir / x.reordenar
 *
 * `x.atualizar` aceita só os campos editáveis: status, setor, responsável, cliente e os
 * campos de estado mudam só pela ferramenta da transição (tarefa.concluir, cliente.mudar_estado,
 * obrigacao.cancelar...). Campo fora da lista é 400 com o nome do campo. É o que fecha o
 * patch livre do adaptador `api`.
 *
 * As declarações moram aqui (navegador e servidor). O tradutor (`traducao.ts`) é o caminho
 * de volta: a chamada que a tela fez num repositório vira a ferramenta e a entrada.
 */

/* ---------- Tipos por coluna (uma lista só, para todas as entidades) ---------- */

const Json = z.record(z.string(), z.unknown())
const ListaJson = z.array(z.record(z.string(), z.unknown())).max(500)
const Textos = z.array(z.string().max(200)).max(500)
const Instante = z.iso.datetime({ offset: true })
const Texto = (max = 2000) => z.string().max(max)

const TIPOS: Record<string, z.ZodType> = {
  extras: Json, configuracao: Json, limites: Json, preferencias: Json, regra_prazo: Json, aplicabilidade: Json, honorario: Json,
  responsaveis: Json, argumentos: Json, acao: Json, opcoes: Json, aguardando_detalhe: Json, valor: z.unknown(),
  checklist: ListaJson, versoes: ListaJson,
  modulos: Textos, setores_propostos: Textos, cnaes: Textos, servicos_contratados: Textos, destinatario_ids: Textos, pode_aprovar: Textos, lida_por: Textos,
  carteira_ligada: z.boolean(), modo_bpo: z.boolean(), tem_equipe: z.boolean(), ativo: z.boolean(), segundo_fator: z.boolean(), principal: z.boolean(), ativa: z.boolean(), fixada: z.boolean(), risco: z.boolean(),
  vigente_de: DataEsquema, vigente_ate: DataEsquema, prazo_legal: DataEsquema, prazo_interno: DataEsquema, estado_ciclo_desde: DataEsquema,
  expira_em: Instante, aceito_em: Instante, recusado_em: Instante, verificada_em: Instante, entrou_em: Instante, saiu_em: Instante, status_desde: Instante,
  inatividade_min: z.number().int().min(1).max(1440),
  papel: z.enum(['administrador', 'gestor', 'colaborador']),
  papel_proposto: z.enum(['administrador', 'gestor', 'colaborador']),
  efeito: z.enum(['liberar', 'bloquear']),
  nivel_max: z.enum(['ler', 'rascunhar', 'executar']),
  regime: RegimeEsquema,
  setor_id: SetorEsquema, gera_tarefa_para_setor: SetorEsquema,
  prioridade: PrioridadeEsquema,
  competencia: CompetenciaEsquema,
  cliente_id: Id, usuario_id: Id, pessoa_id: Id, conversa_interna_id: Id, responsavel_padrao_id: Id, grupo_economico_id: Id, pedido_por_id: Id,
  usuario_dono_id: Id, criada_por: Id, enviado_por: Id, responde_a_id: Id, autor_id: Id, tema_id: Id,
  titulo: Texto(300), nome: Texto(300), nome_exibido: Texto(120), nome_padrao: Texto(120), razao_social: Texto(300), nome_fantasia: Texto(300),
  descricao: Texto(8000), corpo: Texto(8000), motivo: Texto(1000), motivo_versao: Texto(1000), observacoes: Texto(4000), resumo_humano: Texto(2000),
}
/** Os `check` do banco das tabelas da F1, como enum (o erro sai na entrada, com o campo, e não no banco). */
const TIPOS_POR_TABELA: Record<string, z.ZodType> = {
  'escritorio.situacao': z.enum(['ativo', 'suspenso', 'encerrado']),
  'pessoa.tipo': z.enum(['equipe', 'cliente', 'lead', 'terceiro']),
  'identidade.tipo': z.enum(['telefone', 'email', 'cpf', 'login_portal', 'usuario_app', 'whatsapp_id']),
  'usuario.situacao': z.enum(['convidado', 'ativo', 'bloqueado', 'desativado']),
  'vinculo_setor.modo': z.enum(['gestao', 'execucao']),
  'convite.tipo': z.enum(['usuario_escritorio', 'conta_cliente']),
  'versao_perfil.fonte': z.enum(['manual', 'core', 'receita_federal', 'lead', 'importacao']),
  'obrigacao.escopo': z.enum(['plataforma', 'escritorio']),
  'obrigacao.periodicidade': z.enum(['mensal', 'trimestral', 'anual', 'por_evento', 'diaria']),
  'cartao_aprovacao.tipo': z.enum(['aprovacao', 'escolha_responsavel', 'nao_consegui', 'orcamento', 'memoria']),
  'cartao_aprovacao.pedido_por_tipo': z.enum(['integrante', 'usuario', 'sistema']),
  'notificacao.destinatario_tipo': z.enum(['usuario', 'pessoa', 'todos']),
  'conversa_interna.tipo': z.enum(['pessoal', 'grupo', 'canal_setor', 'canal_geral']),
}
const tipoDe = (campo: string, tabela?: string): z.ZodType => (tabela ? TIPOS_POR_TABELA[`${tabela}.${campo}`] : undefined) ?? TIPOS[campo] ?? Texto()

/** Objeto estrito com os campos dados; `!` no fim do nome = obrigatório; o resto aceita nulo. */
function objeto(campos: string[], todosOpcionais = false, tabela?: string) {
  const forma: Record<string, z.ZodType> = {}
  for (const bruto of campos) {
    const obrigatorio = bruto.endsWith('!') && !todosOpcionais
    const nome = bruto.replace(/!$/, '')
    forma[nome] = obrigatorio ? tipoDe(nome, tabela) : tipoDe(nome, tabela).nullable().optional()
  }
  return z.object(forma).strict()
}

/* ---------- Declaração das entidades ---------- */

export interface Entidade {
  /** Prefixo do nome das ferramentas (`pessoa` → `pessoa.criar`). */
  nome: string
  tabela: NomeTabela
  /** Caminho do repositório em `repos` (`pessoas`). */
  repo: string
  /** Nome do campo de id na entrada (`pessoa_id`). */
  id: string
  /** Campos aceitos em `criar` (`!` = obrigatório). Sem a lista, não há `x.criar`. */
  criar?: string[]
  /** Campos editáveis em `atualizar`. Sem a lista, não há `x.atualizar`. */
  editaveis?: string[]
  arquivar?: boolean
  excluir?: boolean
  reordenar?: boolean
  /** Fica fora do MCP (configuração e cadastro interno: só a tela, API_INTERNA 6.7). */
  mcp?: boolean
  /** Ferramentas já escritas à mão em ferramentas.ts (não geradas de novo; o tradutor usa a de lá). */
  manuais?: Partial<Record<'criar' | 'atualizar' | 'arquivar', string>>
}

export const ENTIDADES_F1: Entidade[] = [
  { nome: 'escritorio', tabela: 'escritorio', repo: 'escritorios', id: 'escritorio_id', editaveis: ['razao_social', 'nome_fantasia', 'cnpj', 'crc', 'fuso_horario', 'inatividade_min', 'carteira_ligada', 'modo_bpo', 'tema_id', 'configuracao', 'extras'] },
  { nome: 'assinatura', tabela: 'assinatura', repo: 'assinaturas', id: 'assinatura_id', editaveis: ['plano', 'modulos', 'limites', 'vigente_ate', 'extras'] },
  { nome: 'setor', tabela: 'setor', repo: 'setores', id: 'setor_id', criar: ['codigo!', 'nome_padrao!', 'nome_exibido!', 'tem_equipe!', 'numero_whatsapp', 'responsavel_padrao_id', 'ativo', 'extras'], editaveis: ['nome_exibido', 'tem_equipe', 'numero_whatsapp', 'responsavel_padrao_id', 'ativo', 'extras'] },
  { nome: 'usuario', tabela: 'usuario', repo: 'usuarios', id: 'usuario_id', criar: ['pessoa_id!', 'nome!', 'papel!', 'email_login!', 'situacao!', 'cargo', 'segundo_fator', 'preferencias', 'extras'], editaveis: ['nome', 'papel', 'email_login', 'situacao', 'cargo', 'segundo_fator', 'ultimo_acesso', 'preferencias', 'extras'] },
  { nome: 'vinculo_setor', tabela: 'vinculo_setor', repo: 'vinculos', id: 'vinculo_id', criar: ['usuario_id!', 'setor_id!', 'modo!', 'vigente_de!', 'vigente_ate', 'extras'], editaveis: ['modo', 'vigente_ate', 'extras'], excluir: true },
  { nome: 'excecao_tela', tabela: 'excecao_tela', repo: 'excecoes', id: 'excecao_id', criar: ['usuario_id!', 'tela_ou_ferramenta!', 'efeito!', 'nivel_max', 'motivo!', 'vigente_de!', 'vigente_ate', 'extras'], editaveis: ['efeito', 'nivel_max', 'motivo', 'vigente_de', 'vigente_ate', 'extras'], excluir: true },
  { nome: 'carteira_cliente', tabela: 'carteira_cliente', repo: 'carteiras', id: 'carteira_id', criar: ['usuario_id!', 'cliente_id!', 'setor_id', 'extras'], excluir: true },
  { nome: 'convite', tabela: 'convite', repo: 'convites', id: 'convite_id', criar: ['tipo!', 'destino!', 'papel_proposto', 'setores_propostos', 'cliente_id', 'expira_em!', 'enviado_por!', 'extras'], editaveis: ['papel_proposto', 'setores_propostos', 'expira_em', 'aceito_em', 'recusado_em', 'extras'], excluir: true },
  { nome: 'pessoa', tabela: 'pessoa', repo: 'pessoas', id: 'pessoa_id', criar: ['nome!', 'cpf', 'tipo!', 'observacoes', 'extras'], editaveis: ['nome', 'cpf', 'observacoes', 'extras'], mcp: true },
  { nome: 'identidade', tabela: 'identidade', repo: 'identidades', id: 'identidade_id', criar: ['pessoa_id!', 'tipo!', 'valor!', 'verificada_em', 'principal', 'ativa', 'extras'], editaveis: ['verificada_em', 'principal', 'ativa', 'extras'] },
  { nome: 'cliente', tabela: 'cliente', repo: 'clientes', id: 'cliente_id', manuais: { criar: 'cliente.criar', atualizar: 'cliente.atualizar', arquivar: 'cliente.arquivar' }, mcp: true },
  { nome: 'versao_perfil', tabela: 'versao_perfil', repo: 'versoesPerfil', id: 'versao_perfil_id', criar: ['cliente_id!', 'vigente_de!', 'vigente_ate', 'regime!', 'cnaes', 'uf!', 'municipio_ibge', 'servicos_contratados', 'honorario', 'responsaveis', 'motivo_versao!', 'fonte!', 'extras'], editaveis: ['vigente_ate', 'municipio_ibge', 'extras'] },
  { nome: 'obrigacao', tabela: 'obrigacao', repo: 'obrigacoes', id: 'obrigacao_id', criar: ['escopo!', 'atividade_id!', 'nome!', 'periodicidade!', 'regra_prazo!', 'aplicabilidade', 'gera_tarefa_para_setor!', 'vigente_de!', 'vigente_ate', 'extras'], editaveis: ['nome', 'regra_prazo', 'aplicabilidade', 'vigente_ate', 'extras'], reordenar: true },
  { nome: 'tarefa', tabela: 'tarefa', repo: 'tarefas', id: 'tarefa_id', manuais: { criar: 'tarefa.criar', atualizar: 'tarefa.atualizar', arquivar: 'tarefa.arquivar' }, reordenar: true, mcp: true },
  { nome: 'cartao', tabela: 'cartao_aprovacao', repo: 'cartoes', id: 'cartao_id', criar: ['ferramenta!', 'argumentos', 'resumo_humano!', 'pedido_por_tipo!', 'pedido_por_id', 'usuario_dono_id', 'pode_aprovar', 'expira_em', 'tipo', 'opcoes', 'extras'], editaveis: ['extras'] },
  { nome: 'notificacao', tabela: 'notificacao', repo: 'notificacoes', id: 'notificacao_id', criar: ['destinatario_tipo!', 'destinatario_ids', 'cliente_id', 'setor_id', 'categoria!', 'prioridade!', 'titulo!', 'corpo', 'acao', 'publicada_por_tipo!', 'quando!', 'extras'] },
  { nome: 'conversa_interna', tabela: 'conversa_interna', repo: 'conversasInternas', id: 'conversa_interna_id', criar: ['tipo!', 'nome', 'setor_id', 'criada_por', 'extras'], editaveis: ['nome', 'extras'] },
  { nome: 'participacao', tabela: 'participacao', repo: 'participacoes', id: 'participacao_id', criar: ['conversa_interna_id!', 'usuario_id!', 'entrou_em!', 'saiu_em', 'extras'], editaveis: ['saiu_em', 'extras'] },
  { nome: 'mensagem_interna', tabela: 'mensagem_interna', repo: 'mensagensInternas', id: 'mensagem_id', editaveis: ['fixada', 'extras'] },
]

export const entidadePorRepo = new Map(ENTIDADES_F1.map((e) => [e.repo, e]))

/* ---------- Geração ---------- */

const MotivoOpcional = z.string().trim().max(500).optional()
/** Envelope da tela: o texto do evento (a frase da linha do tempo) vai junto; quem e quando são do servidor. */
export const TextoTela = z.string().max(500).optional()

function gerar(e: Entidade): FerramentaEscrita[] {
  const r: FerramentaEscrita[] = []
  const base = { versao: 1, exposta_mcp: !!e.mcp }
  if (e.criar && !e.manuais?.criar)
    r.push({ ...base, tipo: 'escrita', nome: `${e.nome}.criar`, descricao_modelo: `Cria ${e.nome.replace(/_/g, ' ')} com os campos de negócio (o servidor põe id, escritório e datas).`, entrada: objeto(e.criar, false, e.tabela), erros: ['CAMPO_OBRIGATORIO', 'ID_EM_USO', 'RESTRICAO_DO_BANCO'], chamada: (x: Record<string, unknown>, t) => ({ operacao: `${e.repo}.criar`, argumentos: [x, t?.texto ? { texto: t.texto } : {}] }) })
  if (e.editaveis && !e.manuais?.atualizar)
    r.push({
      ...base,
      tipo: 'escrita',
      nome: `${e.nome}.atualizar`,
      descricao_modelo: `Muda campos editáveis (${e.editaveis.join(', ')}). O resto muda só pela ferramenta da transição.`,
      entrada: z.object({ [e.id]: Id, campos: objeto(e.editaveis, true, e.tabela).refine((c) => Object.keys(c).length > 0, 'Informe ao menos um campo.') }).strict(),
      erros: ['NAO_ENCONTRADO', 'CAMPO_OBRIGATORIO', 'VERSAO_DESATUALIZADA'],
      chamada: (x: Record<string, unknown>, t) => ({ operacao: `${e.repo}.atualizar`, argumentos: [x[e.id], x.campos, t?.texto !== undefined ? { texto: t.texto } : {}] }),
    })
  if (e.arquivar && !e.manuais?.arquivar)
    r.push({ ...base, tipo: 'escrita', nome: `${e.nome}.arquivar`, descricao_modelo: `Arquiva ${e.nome} (some das listas, continua existindo).`, entrada: z.object({ [e.id]: Id, motivo: MotivoOpcional }).strict(), erros: ['NAO_ENCONTRADO'], chamada: (x: Record<string, unknown>) => ({ operacao: `${e.repo}.arquivar`, argumentos: [x[e.id], x.motivo ? { motivo: x.motivo } : {}] }) })
  if (e.arquivar || e.manuais?.arquivar)
    r.push({ ...base, tipo: 'escrita', nome: `${e.nome}.desarquivar`, descricao_modelo: `Tira ${e.nome} do arquivo.`, entrada: z.object({ [e.id]: Id }).strict(), erros: ['NAO_ENCONTRADO'], chamada: (x: Record<string, unknown>) => ({ operacao: `${e.repo}.desarquivar`, argumentos: [x[e.id]] }) })
  if (e.excluir)
    r.push({ ...base, tipo: 'escrita', nome: `${e.nome}.excluir`, descricao_modelo: `Exclui ${e.nome} de vez (a regra da entidade deixa; o evento guarda o que era).`, entrada: z.object({ [e.id]: Id, motivo: MotivoOpcional }).strict(), erros: ['NAO_ENCONTRADO', 'EXCLUSAO_PROIBIDA'], chamada: (x: Record<string, unknown>) => ({ operacao: `${e.repo}.excluir`, argumentos: [x[e.id], x.motivo ? { motivo: x.motivo } : {}] }) })
  if (e.reordenar)
    r.push({ ...base, tipo: 'escrita', nome: `${e.nome}.reordenar`, descricao_modelo: `Grava a ordem manual de uma lista de ${e.nome} (ids na ordem nova).`, entrada: z.object({ ids: z.array(Id).min(1).max(500) }).strict(), erros: [], chamada: (x: Record<string, unknown>) => ({ operacao: `${e.repo}.reordenar`, argumentos: [x.ids] }) })
  return r
}

/** As ferramentas de entidade geradas (somadas ao catálogo tipado em ferramentas.ts). */
export const ferramentasDeEntidade = (): FerramentaEscrita[] => ENTIDADES_F1.flatMap(gerar)

/* ---------- Específicas da F1 sem par genérico ---------- */

export const ferramentasEspecificasF1 = (): FerramentaEscrita[] => [
  {
    tipo: 'escrita',
    nome: 'notificacao.ler_todas',
    versao: 1,
    exposta_mcp: false,
    descricao_modelo: 'Marca vários avisos como lidos pela conta da sessão.',
    entrada: z.object({ usuario_id: Id, notificacao_ids: z.array(Id).min(1).max(500) }).strict(),
    erros: [],
    chamada: (x: Record<string, unknown>) => ({ operacao: 'notificacoes.lerTodas', argumentos: [x.usuario_id, x.notificacao_ids] }),
  },
  {
    tipo: 'escrita',
    nome: 'tela.lembrar',
    versao: 1,
    exposta_mcp: false,
    descricao_modelo: 'Guarda um estado de tela (filtro, coluna, aba) pela chave. Sem evento.',
    entrada: z.object({ chave: z.string().min(1).max(200), valor: z.unknown() }).strict(),
    erros: [],
    chamada: (x: Record<string, unknown>) => ({ operacao: 'telas.lembrar', argumentos: [x.chave, x.valor] }),
  },
  {
    tipo: 'escrita',
    nome: 'tela.esquecer',
    versao: 1,
    exposta_mcp: false,
    descricao_modelo: 'Apaga um estado de tela guardado.',
    entrada: z.object({ chave: z.string().min(1).max(200) }).strict(),
    erros: [],
    chamada: (x: Record<string, unknown>) => ({ operacao: 'telas.esquecer', argumentos: [x.chave] }),
  },
]

/** O envelope que a tela manda junto da entrada (fora do esquema da ferramenta, como `validar_apenas`). */
export const EnvelopeTela = z.object({ ids: z.array(IdGerado).max(500).default([]), texto: TextoTela }).strict()
export type EnvelopeTela = z.output<typeof EnvelopeTela>

// Entram no catálogo tipado na carga do pacote: /v1/ferramentas, o OpenAPI, o retrato e o tradutor veem igual.
for (const f of [...ferramentasDeEntidade(), ...ferramentasEspecificasF1()]) registrarFerramentaTipada(f)

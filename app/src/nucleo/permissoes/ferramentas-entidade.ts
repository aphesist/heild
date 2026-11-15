import type { NomeTabela } from '../modelo/entidades'

/**
 * As entidades da F1 do backend (B5; ARQUITETURA 6.2) e as ferramentas tipadas de cada uma:
 * `x.criar` (campos de negócio), `x.atualizar({ x_id, campos })` (só os EDITÁVEIS),
 * `x.arquivar`, `x.desarquivar`, `x.excluir`, `x.reordenar`.
 *
 * É dado puro, sem Zod, para rodar igual no navegador (o tradutor do adaptador `api`,
 * `banco/traducao.ts`) e no servidor: o pacote de domínio gera daqui os esquemas estritos
 * (`pacotes/dominio/src/ferramentas-entidade.ts`). Mora no núcleo do app pelo mesmo motivo do
 * catálogo de ferramentas: o wireframe ainda mexe nestes arquivos (IMPLEMENTACAO, B1).
 *
 * Nos nomes de campo, `!` no fim = obrigatório em `criar`.
 */


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
  /** Ferramentas já escritas à mão no pacote de domínio (não geradas de novo; o tradutor usa a de lá). */
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
  // As de tarefa e cliente foram escritas à mão no B1 (e ampliadas na B5); os editáveis aqui são os delas (o teste confere).
  { nome: 'cliente', tabela: 'cliente', repo: 'clientes', id: 'cliente_id', editaveis: ['nome', 'codigo', 'documento', 'servicos_contratados', 'regime', 'grupo_economico_id', 'extras'], manuais: { criar: 'cliente.criar', atualizar: 'cliente.atualizar', arquivar: 'cliente.arquivar' }, mcp: true },
  { nome: 'versao_perfil', tabela: 'versao_perfil', repo: 'versoesPerfil', id: 'versao_perfil_id', criar: ['cliente_id!', 'vigente_de!', 'vigente_ate', 'regime!', 'cnaes', 'uf!', 'municipio_ibge', 'servicos_contratados', 'honorario', 'responsaveis', 'motivo_versao!', 'fonte!', 'extras'], editaveis: ['vigente_ate', 'municipio_ibge', 'extras'] },
  { nome: 'obrigacao', tabela: 'obrigacao', repo: 'obrigacoes', id: 'obrigacao_id', criar: ['escopo!', 'atividade_id!', 'nome!', 'periodicidade!', 'regra_prazo!', 'aplicabilidade', 'gera_tarefa_para_setor!', 'vigente_de!', 'vigente_ate', 'extras'], editaveis: ['nome', 'regra_prazo', 'aplicabilidade', 'vigente_ate', 'extras'], reordenar: true },
  { nome: 'tarefa', tabela: 'tarefa', repo: 'tarefas', id: 'tarefa_id', editaveis: ['titulo', 'descricao', 'prazo_interno', 'prazo_legal', 'prioridade', 'competencia', 'quem_conclui', 'checklist', 'aguardando_detalhe', 'risco', 'extras'], manuais: { criar: 'tarefa.criar', atualizar: 'tarefa.atualizar', arquivar: 'tarefa.arquivar' }, reordenar: true, mcp: true },
  { nome: 'cartao', tabela: 'cartao_aprovacao', repo: 'cartoes', id: 'cartao_id', criar: ['ferramenta!', 'argumentos', 'resumo_humano!', 'pedido_por_tipo!', 'pedido_por_id', 'usuario_dono_id', 'pode_aprovar', 'expira_em', 'tipo', 'opcoes', 'extras'], editaveis: ['extras'] },
  { nome: 'notificacao', tabela: 'notificacao', repo: 'notificacoes', id: 'notificacao_id', criar: ['destinatario_tipo!', 'destinatario_ids', 'cliente_id', 'setor_id', 'categoria!', 'prioridade!', 'titulo!', 'corpo', 'acao', 'publicada_por_tipo!', 'quando!', 'lida_por', 'extras'] },
  { nome: 'conversa_interna', tabela: 'conversa_interna', repo: 'conversasInternas', id: 'conversa_interna_id', criar: ['tipo!', 'nome', 'setor_id', 'criada_por', 'extras'], editaveis: ['nome', 'extras'] },
  { nome: 'participacao', tabela: 'participacao', repo: 'participacoes', id: 'participacao_id', criar: ['conversa_interna_id!', 'usuario_id!', 'entrou_em!', 'saiu_em', 'extras'], editaveis: ['saiu_em', 'extras'] },
  { nome: 'mensagem_interna', tabela: 'mensagem_interna', repo: 'mensagensInternas', id: 'mensagem_id', editaveis: ['fixada', 'extras'] },
]

export const entidadePorRepo = new Map(ENTIDADES_F1.map((e) => [e.repo, e]))

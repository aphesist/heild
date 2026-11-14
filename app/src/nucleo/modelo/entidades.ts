/**
 * Entidades da Heild, com os nomes e os campos do subplano 01 (Fundações).
 *
 * Os campos ficam em snake_case de propósito: são os mesmos das tabelas em
 * `app/supabase/migrations`, para que o adaptador do Supabase não precise de
 * tradução. As telas não leem estas entidades direto: leem pelos repositórios
 * (`@/nucleo/repositorios`) ou pela loja, que monta o formato de tela.
 *
 * `extras` guarda o que a tela do wireframe mostra e o subplano ainda não
 * modelou (ex.: o "atrasada" desenhado à mão nos dados de exemplo). Cada
 * sessão do wireframe, ao migrar a sua tela, tira o que puder de `extras` e
 * cria o campo próprio (ver docs/wireframe/ARQUITETURA.md).
 */

export type Id = string
/** Data e hora ISO 8601 (`2026-11-18T09:32:00-03:00`). */
export type DataHora = string
/** Data ISO (`2026-11-18`). */
export type Data = string

/** Campos que toda linha de escritório tem (multi-inquilino, DA-01). */
export interface Registro {
  id: Id
  escritorio_id: Id
  criado_em: DataHora
  atualizado_em: DataHora
  /** Arquivado: some das listas, continua existindo (R7: nada se apaga). */
  arquivado_em?: DataHora | null
  /** Posição manual na lista ou na coluna (arrastar e soltar). */
  ordem?: number
  extras?: Record<string, unknown>
}

/* ---------- Papéis, níveis e setores (Fundações 2 e 3) ---------- */

/** `colaborador` é o "Membro" das telas (o subplano usa colaborador; a decisão do nome está em docs/wireframe/DECISOES.md). */
export type Papel = 'administrador' | 'gestor' | 'colaborador'
export type Nivel = 'ler' | 'rascunhar' | 'executar'
export type ModoVinculo = 'gestao' | 'execucao'

/** Códigos de setor (4.1). Os setores são fixos e seguem as abas do Painel. */
export type CodigoSetor =
  | 'societario'
  | 'fiscal'
  | 'notas'
  | 'dp'
  | 'contabil'
  | 'consultor'
  | 'gestao_atendimento'
  | 'financeiro_escritorio'
  | 'bpo_financeiro'
  | 'bpo'
  | 'pf'
  | 'terceiro_setor'
  | 'nichos'
  | 'ciclo_vida'

export type Modulo = 'painel' | 'crm' | 'timesheet' | 'agentes' | 'consultor' | 'app_cliente' | 'financeiro' | 'arquivos' | 'bpo'

/* ---------- Inquilino e contas (2) ---------- */

export interface Escritorio extends Registro {
  razao_social: string
  nome_fantasia: string
  cnpj: string
  crc?: string
  fuso_horario: string
  /** Minutos até o modo de espera (2 a 5). */
  inatividade_min: number
  carteira_ligada: boolean
  modo_bpo: boolean
  situacao: 'ativo' | 'suspenso' | 'encerrado'
  /** Tema de marca branca (id de `src/theme/temas.ts`). */
  tema_id?: string
  /** Chaves de configuração do escritório que as telas leem (cenário da demonstração, custo por pacote...). */
  configuracao: {
    cenario?: 'contabil_bpo' | 'bpo_puro'
    custo_por_pacote?: boolean
    segundo_fator?: 'administradores' | 'todos' | 'opcional'
    [chave: string]: unknown
  }
}

/** Assinatura versionada por período; trocar de plano cria nova linha. */
export interface Assinatura extends Registro {
  dono_tipo: 'escritorio' | 'subinquilino'
  dono_id: Id
  plano: string
  modulos: Modulo[]
  limites: Record<string, number | string>
  vigente_de: Data
  vigente_ate?: Data | null
}

export interface Pessoa extends Registro {
  nome: string
  cpf?: string
  tipo: 'equipe' | 'cliente' | 'lead' | 'terceiro'
  observacoes?: string
  fundido_em?: Id | null
}

export interface Identidade extends Registro {
  pessoa_id: Id
  tipo: 'telefone' | 'email' | 'cpf' | 'login_portal' | 'usuario_app' | 'whatsapp_id'
  valor: string
  verificada_em?: DataHora | null
  principal: boolean
  ativa: boolean
}

export interface Usuario extends Registro {
  pessoa_id: Id
  /** Nome copiado da Pessoa para as listas (a Pessoa continua a fonte). */
  nome: string
  papel: Papel
  email_login: string
  situacao: 'convidado' | 'ativo' | 'bloqueado' | 'desativado'
  cargo?: string
  segundo_fator: boolean
  ultimo_acesso?: string
  preferencias: Record<string, unknown>
}

export interface VinculoSetor extends Registro {
  usuario_id: Id
  setor_id: Id
  modo: ModoVinculo
  vigente_de: Data
  vigente_ate?: Data | null
}

export interface ExcecaoTela extends Registro {
  usuario_id: Id
  /** Tela ou ferramenta (`aba.financeiro.contratos`, `aba.fiscal`). */
  tela_ou_ferramenta: string
  efeito: 'liberar' | 'bloquear'
  nivel_max?: Nivel
  motivo: string
  vigente_de: Data
  vigente_ate?: Data | null
}

export interface CarteiraCliente extends Registro {
  usuario_id: Id
  cliente_id: Id
  setor_id?: Id | null
}

export interface Convite extends Registro {
  tipo: 'usuario_escritorio' | 'conta_cliente'
  destino: string
  papel_proposto?: Papel
  setores_propostos?: Id[]
  cliente_id?: Id
  expira_em: DataHora
  aceito_em?: DataHora | null
  recusado_em?: DataHora | null
  enviado_por: Id
}

/* ---------- Escritório (4) ---------- */

export interface Setor extends Registro {
  codigo: CodigoSetor
  nome_padrao: string
  nome_exibido: string
  tem_equipe: boolean
  numero_whatsapp?: string
  responsavel_padrao_id?: Id | null
  ativo: boolean
}

export type EstadoCiclo = 'prospect' | 'proposta' | 'aceito' | 'em_implantacao' | 'ativo' | 'inativo' | 'em_saida' | 'em_baixa' | 'encerrado' | 'arquivado' | 'eliminado'
export type Regime = 'simples' | 'presumido' | 'real' | 'mei' | 'imune_isento' | 'pf'

export interface Cliente extends Registro {
  tipo: 'pj' | 'pf' | 'mei' | 'condominio' | 'entidade_terceiro_setor' | 'produtor_rural'
  /** Código interno do escritório ("420"). */
  codigo: string
  documento: string
  nome: string
  grupo_economico_id?: Id | null
  estado_ciclo: EstadoCiclo
  estado_ciclo_desde: Data
  /** Do perfil vigente (cópia para as listas; a versão do perfil é a fonte). */
  regime: Regime
  servicos_contratados: string[]
  fundido_em?: Id | null
}

/** Versão do perfil (SOC-002): alterar campo versionado fecha a vigente e abre outra. */
export interface VersaoPerfil extends Registro {
  cliente_id: Id
  vigente_de: Data
  vigente_ate?: Data | null
  regime: Regime
  cnaes: string[]
  uf: string
  municipio_ibge?: string
  servicos_contratados: string[]
  honorario?: { valor: number; vencimento: number }
  responsaveis?: Partial<Record<CodigoSetor, Id>>
  motivo_versao: string
  fonte: 'manual' | 'core' | 'receita_federal' | 'lead' | 'importacao'
}

export interface Obrigacao extends Registro {
  escopo: 'plataforma' | 'escritorio'
  atividade_id: string
  nome: string
  periodicidade: 'mensal' | 'trimestral' | 'anual' | 'por_evento' | 'diaria'
  regra_prazo: { dia: number; mes_relativo: number; antecipa_se_nao_util: boolean }
  aplicabilidade: Record<string, unknown>
  gera_tarefa_para_setor: CodigoSetor
  vigente_de: Data
  vigente_ate?: Data | null
  /** Cancelada só por Gestor ou Administrador, com motivo (R7: nada se apaga). */
  cancelada_em?: DataHora | null
  cancelada_por?: Id | null
  cancelada_motivo?: string
}

export type StatusTarefa = 'a_fazer' | 'em_andamento' | 'aguardando_cliente' | 'aguardando_terceiro' | 'em_revisao' | 'concluida' | 'cancelada'

export interface Tarefa extends Registro {
  cliente_id?: Id | null
  setor_id: Id
  atividade_id: string
  titulo: string
  descricao?: string
  competencia?: string
  origem: 'obrigacao' | 'pedido_cliente' | 'integrante' | 'pessoa' | 'trilha' | 'core' | 'conversa'
  origem_ref?: Id | null
  responsavel_tipo?: 'usuario' | 'integrante' | null
  responsavel_id?: Id | null
  quem_conclui: 'pessoa' | 'agente_sozinho' | 'agente_prepara_pessoa_conclui'
  status: StatusTarefa
  status_desde: DataHora
  aguardando_detalhe?: { itens?: string[]; orgao?: string } | null
  prazo_legal?: Data | null
  prazo_interno?: Data | null
  prioridade: 'baixa' | 'normal' | 'alta' | 'urgente'
  checklist: { item: string; feito: boolean; feito_por?: Id; feito_em?: DataHora; obrigatorio?: boolean }[]
  tarefa_pai_id?: Id | null
  conversa_id?: Id | null
  risco: boolean
  concluida_por_tipo?: 'usuario' | 'integrante' | null
  concluida_por_id?: Id | null
  concluida_em?: DataHora | null
  cancelada_motivo?: string | null
}

export interface Lead extends Registro {
  pessoa_id: Id
  empresa_nome?: string
  cnpj?: string
  etapa: 'lead' | 'qualificado' | 'proposta' | 'contrato' | 'implantacao' | 'perdido'
  origem: 'whatsapp' | 'site' | 'indicacao' | 'instagram' | 'manual'
  responsavel_id?: Id | null
  motivo_perda?: string
  cliente_id?: Id | null
}

export type StatusConversa = 'nova' | 'em_atendimento' | 'aguardando_cliente' | 'aguardando_interno' | 'resolvida'
export type CanalMensagem = 'whatsapp' | 'email' | 'chat_app' | 'formulario_site' | 'sistema'

export interface Conversa extends Registro {
  cliente_id?: Id | null
  lead_id?: Id | null
  pessoa_id?: Id | null
  setor_id: Id
  responsavel_id?: Id | null
  status: StatusConversa
  tarefa_id?: Id | null
  canal_resposta_atual: CanalMensagem
  etiquetas: string[]
  resumo?: string
  conversa_anterior_id?: Id | null
  ultima_mensagem_em: DataHora
}

export interface Mensagem extends Registro {
  conversa_id: Id
  direcao: 'entrada' | 'saida' | 'nota_interna'
  canal: CanalMensagem
  autor_tipo: 'pessoa' | 'usuario' | 'integrante' | 'sistema'
  autor_id?: Id | null
  corpo?: string
  transcricao?: string
  origem_externa: boolean
  status_entrega?: 'enviada' | 'entregue' | 'lida' | 'falhou' | null
  enviada_em?: DataHora | null
}

export interface Documento extends Registro {
  cliente_id?: Id | null
  tipo: string
  competencia?: string
  nome_arquivo: string
  mime: string
  tamanho_bytes: number
  hash_sha256: string
  origem: 'upload_equipe' | 'upload_cliente_app' | 'conversa' | 'captura_governo' | 'core' | 'gerado_plataforma' | 'nuvem_escritorio'
  enviado_por_tipo?: 'usuario' | 'integrante' | 'pessoa' | null
  enviado_por_id?: Id | null
  backend_id: string
  caminho: string
  visivel_ao_cliente: boolean
  versao: number
  versao_de?: Id | null
  tarefa_id?: Id | null
  mensagem_id?: Id | null
  metadados?: Record<string, string>
}

/** Registro de entrega: só cresce (4.11). */
export interface RegistroEntrega extends Registro {
  documento_id: Id
  pessoa_id?: Id | null
  acao: 'visto' | 'baixado' | 'enviado_whatsapp' | 'enviado_email' | 'confirmado'
  em: DataHora
  hash_no_momento: string
}

/* ---------- Eventos, aprovação e notificações (5, 6, 8) ---------- */

export interface Evento extends Registro {
  /** `entidade.acao`: `tarefa.concluir`, `mensagem_interna.editar`. */
  nome: string
  ator_tipo: 'pessoa' | 'integrante' | 'sistema' | 'core'
  ator_id?: Id | null
  /** Nome de quem agiu, para a linha do tempo. */
  ator_nome?: string
  usuario_dono_id?: Id | null
  cliente_id?: Id | null
  setor_id?: Id | null
  ferramenta: string
  nivel: Nivel
  argumentos_resumo?: Record<string, unknown>
  resultado: 'ok' | 'negado' | 'erro' | 'aguardando_aprovacao' | 'aprovado' | 'recusado'
  /** Id do registro afetado. */
  resultado_ref?: Id | null
  origem: 'tela' | 'chat' | 'job' | 'evento' | 'core' | 'api_externa' | 'migracao'
  visivel_na_linha_do_tempo: boolean
  /** Frase pronta para a linha do tempo. */
  texto: string
}

export interface CartaoAprovacao extends Registro {
  ferramenta: string
  argumentos: Record<string, unknown>
  resumo_humano: string
  pedido_por_tipo: 'integrante' | 'usuario' | 'sistema'
  pedido_por_id?: Id | null
  usuario_dono_id?: Id | null
  pode_aprovar: Id[]
  status: 'pendente' | 'aprovado' | 'recusado' | 'editado_e_aprovado' | 'expirado' | 'cancelado'
  expira_em?: DataHora | null
  /** Decisão humana: sempre com autor e data. */
  decidido_por?: Id | null
  decidido_em?: DataHora | null
  comentario?: string
}

export interface Notificacao extends Registro {
  /** Simplificação do wireframe: uma notificação para uma lista de usuários (vazia = todos). */
  destinatario_tipo: 'usuario' | 'pessoa' | 'todos'
  destinatario_ids: Id[]
  cliente_id?: Id | null
  setor_id?: Id | null
  categoria: 'aprovacao' | 'tarefa' | 'pendencia' | 'conversa' | 'documento' | 'prazo' | 'agente' | 'sistema' | 'cliente'
  prioridade: 'urgente' | 'alta' | 'normal' | 'baixa'
  titulo: string
  corpo?: string
  /** Link profundo (rota do wireframe). */
  acao?: Record<string, unknown> | null
  publicada_por_tipo: 'integrante' | 'sistema' | 'usuario'
  /** Quem já leu (um registro por usuário no produto; aqui, a lista). */
  lida_por: Id[]
  /** Hora curta mostrada no sino ("09:32", "ontem"). */
  quando: string
}

/* ---------- Integrantes (9) ---------- */

export interface Integrante extends Registro {
  usuario_dono_id?: Id | null
  tipo: 'geral' | 'padrao_setor' | 'consultor' | 'criado_pelo_usuario'
  setor: string
  nome_exibido?: string
  instrucoes: string
  setores: string[]
  canal_aviso: 'chat' | 'central' | 'whatsapp_do_dono'
  situacao: 'ativo' | 'pausado' | 'desativado'
}

/** Linha do transcript de uma sessão de integrante (chat do Time e do Assistente): só inserção e ajuste do que ele está escrevendo. */
export interface MensagemIntegrante extends Registro {
  /** `time:<integrante>` ou `assistente:<conversa>`. */
  sessao_chave: string
  autor_tipo: 'usuario' | 'integrante' | 'sistema'
  autor_id?: Id | null
  corpo?: string
}

/** Item de fila do integrante: o trabalho simulado da demonstração. */
export interface ItemFila extends Registro {
  integrante_id: Id
  tipo: 'mensagem_usuario' | 'evento' | 'job' | 'mensagem_integrante' | 'decisao_aprovacao'
  status: 'pendente' | 'em_execucao' | 'pausado' | 'concluido' | 'cancelado' | 'falhou'
  enfileirado_em: DataHora
  iniciado_em?: DataHora | null
  concluido_em?: DataHora | null
}

/* ---------- Comunicação interna (subplano 11) ---------- */

export interface ConversaInterna extends Registro {
  tipo: 'pessoal' | 'grupo' | 'canal_setor' | 'canal_geral'
  nome?: string
  setor_id?: Id | null
  criada_por?: Id | null
}

export interface Participacao extends Registro {
  conversa_interna_id: Id
  usuario_id: Id
  entrou_em: DataHora
  saiu_em?: DataHora | null
}

/** Mensagem interna: NUNCA se apaga; editar guarda a versão anterior em `versoes`. */
export interface MensagemInterna extends Registro {
  conversa_interna_id: Id
  autor_id: Id
  corpo: string
  responde_a_id?: Id | null
  fixada?: boolean
  editada_em?: DataHora | null
  versoes: { corpo: string; ate: DataHora; por: Id }[]
}

/* ---------- Estado de tela e nota emitida (a migrar pelas sessões) ---------- */

/** Valor de tela que sobrevive à troca de aba e ao recarregar (`usePersistente`). */
export interface RegistroTela extends Registro {
  valor: unknown
}

/** NFS-e emitida pelo app do cliente (formato de tela em `extras`, a migrar pela sessão de Notas). */
export interface NotaEmitida extends Registro {
  cliente_id: Id
  numero: number
  situacao: string
}

/* ---------- Timesheet (S06; subplano 05 e Fundações 5.4) ---------- */

/** Origem da sessão (05, 2). Atendimento no CRM é `plataforma` com `conversa_id`. */
export type OrigemSessao = 'plataforma' | 'core' | 'extensao' | 'artefato' | 'confirmacao'
export type ConfiancaSessao = 'automatica' | 'estimada' | 'confirmada' | 'contestada'
export type PacoteTimesheet = 'contabil' | 'bpo' | 'juridico'

export interface ContestacaoSessao {
  por: Id
  em: DataHora
  motivo: 'cliente' | 'atividade' | 'tempo' | 'nao_era_trabalho'
  /** A correção pedida em texto curto ("Clínica Sorriso Ltda", "14:00–15:10", "descartar"). */
  correcao: string
  correcao_dados?: { cliente_id?: Id | null; atividade_id?: string | null; rotulo?: string; inicio?: DataHora; fim?: DataHora }
  nota?: string
  status: 'pendente' | 'aceita' | 'recusada'
  /** Confiança antes da contestação (volta a ela se recusada). */
  confianca_antes: ConfiancaSessao
  decidido_por?: Id | null
  decidido_por_nome?: string
  decidido_em?: DataHora | null
  motivo_recusa?: string
}

/** Sessão de trabalho (Fundações 5.4): pessoa ou integrante, um intervalo com cliente e atividade. Nada se apaga: correção substitui. */
export interface SessaoTrabalho extends Registro {
  ator_tipo: 'pessoa' | 'integrante'
  ator_id: Id
  usuario_dono_id: Id
  /** Nulo = interno (reunião, treinamento, administrativo). */
  cliente_id?: Id | null
  setor_id: Id
  /** Nulo só em sessão sem tarefa ainda sem atividade (decisão S06). */
  atividade_id?: string | null
  /** Nome curto da atividade ("DCTFWeb"). */
  rotulo: string
  tarefa_id?: Id | null
  conversa_id?: Id | null
  origem: OrigemSessao
  inicio: DataHora
  fim: DataHora
  confianca: ConfiancaSessao
  /** Frases das evidências (no produto, ids de evento). */
  evidencias: string[]
  pacote: PacoteTimesheet
  fora_da_jornada?: boolean
  cortada_por_sessao_id?: Id | null
  substituida_por?: Id | null
  contestacao?: ContestacaoSessao | null
  /** Anomalia detectada (05, 11.3) e o que se fez com ela. */
  anomalia?: { tipo: 'sessao_longa' | 'dia_longo' | 'sobreposta' | 'sem_evento'; texto: string; revisada_em?: DataHora | null; revisao?: 'corrigida' | 'descartada' | 'mantida' } | null
  /** Integrante: série separada, nunca soma com horas humanas (05, 7). */
  custo?: { maquina_seg: number; centavos: number; passos: number; poupadas_min: number } | null
  /** Aberta agora pela captura (fim avança enquanto há ação). */
  ao_vivo?: boolean
}

/** Item da confirmação assistida (05, 5.2): pré-preenchido, em um clique, válido por 7 dias. */
export interface ItemConfirmacao extends Registro {
  /** Nulo = arquivo sem pessoa: o Gestor atribui ("quem fez?"). */
  usuario_id?: Id | null
  setor_id?: Id | null
  dia: Data
  inicio: DataHora
  fim?: DataHora | null
  tipo: 'buraco' | 'portal' | 'artefato' | 'conflito' | 'sem_pista' | 'nao_era_esta' | 'sessao_longa' | 'foi_voce' | 'espera'
  texto: string
  pista: string
  sugestao?: { atividade_id?: string | null; rotulo?: string; cliente_id?: Id | null; minutos: number; tarefa_id?: Id | null } | null
  alternativa_cliente_id?: Id | null
  /** Sessão que a confirmação substitui (estimada, conflito, não era esta). */
  sessao_ref_id?: Id | null
  situacao: 'pendente' | 'marcado' | 'confirmado' | 'descartado' | 'expirado' | 'atribuido'
  resultado?: string | null
  sessao_id?: Id | null
  atribuido_a?: Id | null
  expira_em: DataHora
}

/** Ausência (05, ad. 16): entra na capacidade e no substituto. Cancelar arquiva. */
export interface Ausencia extends Registro {
  usuario_id: Id
  tipo: 'ferias' | 'licenca' | 'atestado' | 'folga' | 'treinamento_externo'
  inicio: Data
  fim: Data
  registrada_por: Id
  substituto_id?: Id | null
  observacao?: string
}

/** Custo-hora do escritório (05, A7): um só, com todos os pacotes; cada definição é uma linha nova (vigência mensal). */
export interface CustoHora extends Registro {
  competencia: string
  modo: 'gastos' | 'direto'
  gastos: { nome: string; valor: number }[]
  horas_produtivas: number
  valor: number
  por_cargo: boolean
  fatores_cargo?: { cargo: string; fator: number }[]
  /** Extra opcional, desligado por padrão (05, ad. 19). */
  por_pacote: boolean
  valor_bpo?: number | null
  definido_por: Id
  definido_por_nome?: string
}

/** Termo de ciência e extensão de cada pessoa (05, 3.6 e 10.1). */
export interface VinculoExtensao extends Registro {
  usuario_id: Id
  termo_versao?: string | null
  termo_aceito_em?: DataHora | null
  navegador?: 'chrome' | 'edge' | null
  vinculada_em?: DataHora | null
  pausada_ate?: DataHora | null
  pausa_rotulo?: string | null
  pausas: { de: DataHora; ate?: DataHora | null; rotulo: string }[]
}

/** Pulsos da extensão agregados por pessoa, dia, portal e cliente (o bruto fica 90 dias; 05, 10.5). */
export interface PulsoPortal extends Registro {
  usuario_id: Id
  dia: Data
  portal: string
  cliente_id?: Id | null
  metodo: 'url' | 'titulo' | 'identificacao' | 'nenhum'
  minutos: number
  primeiro: DataHora
  ultimo: DataHora
  tarefa_id?: Id | null
}

/** Lista de portais da extensão: dado versionado, desligável por escritório (05, 3.2 e 10.2). */
export interface PortalExtensao extends Registro {
  portal: string
  dominio: string
  leitura: string
  atividade_sugerida: string
  situacao: 'ativo' | 'desligado' | 'pedido'
  pedido_por?: Id | null
  motivo?: string
  versao: number
}

/** Conector de core (05, 4) com os mapas de equivalência (Fundações 5.6). */
export interface ConectorCore extends Registro {
  core: 'Alterdata' | 'Domínio' | 'Questor' | 'Contmatic'
  modo: string
  status: 'conectado' | 'importacao' | 'nao_conectado' | 'erro'
  detalhe: string
  ultima_leitura?: DataHora | null
  mapa_departamento: { core: string; setor_id: Id | null }[]
  mapa_responsavel: { core: string; usuario_id: Id | null }[]
}

/** Tipo de tarefa do core e a atividade do catálogo (nulo = fila "sem equivalente"). */
export interface EquivalenciaCore extends Registro {
  core_sistema: string
  core_tipo_tarefa: string
  departamento: string
  ocorrencias: number
  sugestoes: string[]
  atividade_id?: string | null
  situacao: 'sem_equivalente' | 'equivalente' | 'nao_medido'
}

/** Duração padrão por atividade (Configuração local, 4.6): catálogo × mediana medida (05, 11.2). */
export interface DuracaoPadrao extends Registro {
  atividade_id: string
  rotulo: string
  catalogo_min: number
  mediana_min: number
  n: number
  adotada_min?: number | null
  origem: 'catalogo' | 'calibracao' | 'escritorio'
}

/** Fechamento mensal por cliente (9.2, Rentabilidade da carteira): a fotografia do mês fechado. */
export interface FechamentoTimesheet extends Registro {
  competencia: string
  cliente_id: Id
  pacote: PacoteTimesheet
  horas: number
  horas_estimadas: number
  honorario?: number | null
  variaveis: number
  custo_hora: number
  marcos: string[]
}

/* ---------- Catálogo das tabelas ---------- */

export interface Tabelas {
  escritorio: Escritorio
  assinatura: Assinatura
  pessoa: Pessoa
  identidade: Identidade
  usuario: Usuario
  vinculo_setor: VinculoSetor
  excecao_tela: ExcecaoTela
  carteira_cliente: CarteiraCliente
  convite: Convite
  setor: Setor
  cliente: Cliente
  versao_perfil: VersaoPerfil
  obrigacao: Obrigacao
  tarefa: Tarefa
  lead: Lead
  conversa: Conversa
  mensagem: Mensagem
  documento: Documento
  registro_entrega: RegistroEntrega
  evento: Evento
  cartao_aprovacao: CartaoAprovacao
  notificacao: Notificacao
  integrante: Integrante
  mensagem_integrante: MensagemIntegrante
  item_fila: ItemFila
  conversa_interna: ConversaInterna
  participacao: Participacao
  mensagem_interna: MensagemInterna
  registro_tela: RegistroTela
  nota_emitida: NotaEmitida
  // S06 · Timesheet
  sessao_trabalho: SessaoTrabalho
  item_confirmacao: ItemConfirmacao
  ausencia: Ausencia
  custo_hora: CustoHora
  vinculo_extensao: VinculoExtensao
  pulso_portal: PulsoPortal
  portal_extensao: PortalExtensao
  conector_core: ConectorCore
  equivalencia_core: EquivalenciaCore
  duracao_padrao: DuracaoPadrao
  fechamento_timesheet: FechamentoTimesheet
}

export type NomeTabela = keyof Tabelas

export const nomesTabelas: NomeTabela[] = [
  'escritorio',
  'assinatura',
  'pessoa',
  'identidade',
  'usuario',
  'vinculo_setor',
  'excecao_tela',
  'carteira_cliente',
  'convite',
  'setor',
  'cliente',
  'versao_perfil',
  'obrigacao',
  'tarefa',
  'lead',
  'conversa',
  'mensagem',
  'documento',
  'registro_entrega',
  'evento',
  'cartao_aprovacao',
  'notificacao',
  'integrante',
  'mensagem_integrante',
  'item_fila',
  'conversa_interna',
  'participacao',
  'mensagem_interna',
  'registro_tela',
  'nota_emitida',
  // S06 · Timesheet
  'sessao_trabalho',
  'item_confirmacao',
  'ausencia',
  'custo_hora',
  'vinculo_extensao',
  'pulso_portal',
  'portal_extensao',
  'conector_core',
  'equivalencia_core',
  'duracao_padrao',
  'fechamento_timesheet',
]

/** Dados de uma linha para criar: o banco preenche id, escritório e datas. */
export type Novo<T extends Registro> = Omit<T, 'id' | 'escritorio_id' | 'criado_em' | 'atualizado_em'> & Partial<Pick<T, 'id'>>
/** Fotografia de um escritório inteiro (semente, exportação, adaptador). */
export type Fotografia = { [K in NomeTabela]: Tabelas[K][] }

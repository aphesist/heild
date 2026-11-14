-- Fundações da Heild (subplano 01): as entidades do wireframe, uma tabela por entidade.
-- Espelho de app/src/nucleo/modelo/entidades.ts (mesmos nomes e colunas, snake_case).
-- Multi-inquilino (DA-01, Fundações 3.4): toda linha tem escritorio_id; a RLS filtra pelo
-- escritório do JWT (app_metadata.escritorio_id), nunca por parâmetro (R3).
-- Regras no banco (segunda barreira; a primeira é a função autorizar do app):
--   * evento e registro_entrega só recebem inserção (5.2, 4.11);
--   * mensagem_interna nunca é apagada (subplano 11); editar guarda versões (no app);
--   * tarefa cancelada exige motivo; cartão decidido exige autor e data;
--   * as demais exclusões dependem da regra da entidade no app (repositorios/index.ts).
-- Gerado em 14/11/2026 pela sessão S00 do wireframe. Não há projeto Supabase criado:
-- ver app/supabase/README.md para aplicar.

create extension if not exists pgcrypto;

-- Escritório da sessão: vem do JWT (o administrador do Supabase grava em app_metadata ao criar a conta).
create or replace function public.escritorio_atual() returns text
language sql stable as $$
  select nullif(coalesce(auth.jwt() -> 'app_metadata' ->> 'escritorio_id', ''), '')
$$;

-- Atualiza atualizado_em em toda escrita.
create or replace function public.tocar_atualizado_em() returns trigger
language plpgsql as $$
begin
  new.atualizado_em := now();
  return new;
end $$;

-- Recusa a operação (tabelas só de inserção, mensagens que não se apagam).
create or replace function public.recusar_operacao() returns trigger
language plpgsql as $$
begin
  raise exception 'Operação % não permitida em %: %', tg_op, tg_table_name, tg_argv[0] using errcode = '42501';
end $$;

-- Raiz do inquilino.
create table public.escritorio (
  id text primary key default gen_random_uuid()::text,
  escritorio_id text not null check (escritorio_id = id),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  razao_social text not null,
  nome_fantasia text not null,
  cnpj text not null unique,
  crc text,
  fuso_horario text not null default 'America/Sao_Paulo',
  inatividade_min integer not null default 3 check (inatividade_min between 2 and 5),
  carteira_ligada boolean not null default false,
  modo_bpo boolean not null default false,
  situacao text not null default 'ativo' check (situacao in ('ativo','suspenso','encerrado')),
  tema_id text,
  configuracao jsonb not null default '{}'
);

create table public.assinatura (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  dono_tipo text not null check (dono_tipo in ('escritorio','subinquilino')),
  dono_id text not null,
  plano text not null,
  modulos text[] not null default '{}',
  limites jsonb not null default '{}',
  vigente_de date not null,
  vigente_ate date,
  primary key (escritorio_id, id)
);

create table public.pessoa (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  nome text not null,
  cpf text,
  tipo text not null check (tipo in ('equipe','cliente','lead','terceiro')),
  observacoes text,
  fundido_em text,
  primary key (escritorio_id, id)
);

create table public.identidade (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  pessoa_id text not null,
  tipo text not null check (tipo in ('telefone','email','cpf','login_portal','usuario_app','whatsapp_id')),
  valor text not null,
  verificada_em timestamptz,
  principal boolean not null default false,
  ativa boolean not null default true,
  primary key (escritorio_id, id)
);

create table public.usuario (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  pessoa_id text not null,
  nome text not null,
  papel text not null check (papel in ('administrador','gestor','colaborador')),
  email_login text not null,
  situacao text not null check (situacao in ('convidado','ativo','bloqueado','desativado')),
  cargo text,
  segundo_fator boolean not null default false,
  ultimo_acesso text,
  preferencias jsonb not null default '{}',
  primary key (escritorio_id, id)
);

create table public.setor (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  codigo text not null,
  nome_padrao text not null,
  nome_exibido text not null,
  tem_equipe boolean not null,
  numero_whatsapp text,
  responsavel_padrao_id text,
  ativo boolean not null default true,
  primary key (escritorio_id, id)
);

create table public.vinculo_setor (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  usuario_id text not null,
  setor_id text not null,
  modo text not null check (modo in ('gestao','execucao')),
  vigente_de date not null,
  vigente_ate date,
  primary key (escritorio_id, id)
);

create table public.excecao_tela (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  usuario_id text not null,
  tela_ou_ferramenta text not null,
  efeito text not null check (efeito in ('liberar','bloquear')),
  nivel_max text check (nivel_max in ('ler','rascunhar','executar')),
  motivo text not null,
  vigente_de date not null,
  vigente_ate date,
  primary key (escritorio_id, id)
);

create table public.cliente (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  tipo text not null check (tipo in ('pj','pf','mei','condominio','entidade_terceiro_setor','produtor_rural')),
  codigo text not null,
  documento text not null,
  nome text not null,
  grupo_economico_id text,
  estado_ciclo text not null check (estado_ciclo in ('prospect','proposta','aceito','em_implantacao','ativo','inativo','em_saida','em_baixa','encerrado','arquivado','eliminado')),
  estado_ciclo_desde date not null,
  regime text not null check (regime in ('simples','presumido','real','mei','imune_isento','pf')),
  servicos_contratados text[] not null default '{}',
  fundido_em text,
  primary key (escritorio_id, id)
);

create table public.carteira_cliente (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  usuario_id text not null,
  cliente_id text not null,
  setor_id text,
  primary key (escritorio_id, id)
);

create table public.convite (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  tipo text not null check (tipo in ('usuario_escritorio','conta_cliente')),
  destino text not null,
  papel_proposto text,
  setores_propostos text[],
  cliente_id text,
  expira_em timestamptz not null,
  aceito_em timestamptz,
  recusado_em timestamptz,
  enviado_por text not null,
  primary key (escritorio_id, id)
);

create table public.versao_perfil (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  cliente_id text not null,
  vigente_de date not null,
  vigente_ate date,
  regime text not null,
  cnaes text[] not null default '{}',
  uf text not null,
  municipio_ibge text,
  servicos_contratados text[] not null default '{}',
  honorario jsonb,
  responsaveis jsonb,
  motivo_versao text not null,
  fonte text not null check (fonte in ('manual','core','receita_federal','lead','importacao')),
  primary key (escritorio_id, id)
);

create table public.obrigacao (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  escopo text not null check (escopo in ('plataforma','escritorio')),
  atividade_id text not null,
  nome text not null,
  periodicidade text not null check (periodicidade in ('mensal','trimestral','anual','por_evento','diaria')),
  regra_prazo jsonb not null,
  aplicabilidade jsonb not null default '{}',
  gera_tarefa_para_setor text not null,
  vigente_de date not null,
  vigente_ate date,
  cancelada_em timestamptz,
  cancelada_por text,
  cancelada_motivo text,
  primary key (escritorio_id, id)
);

create table public.tarefa (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  cliente_id text,
  setor_id text not null,
  atividade_id text not null,
  titulo text not null,
  descricao text,
  competencia text,
  origem text not null check (origem in ('obrigacao','pedido_cliente','integrante','pessoa','trilha','core','conversa')),
  origem_ref text,
  responsavel_tipo text check (responsavel_tipo in ('usuario','integrante')),
  responsavel_id text,
  quem_conclui text not null check (quem_conclui in ('pessoa','agente_sozinho','agente_prepara_pessoa_conclui')),
  status text not null check (status in ('a_fazer','em_andamento','aguardando_cliente','aguardando_terceiro','em_revisao','concluida','cancelada')),
  status_desde timestamptz not null,
  aguardando_detalhe jsonb,
  prazo_legal date,
  prazo_interno date,
  prioridade text not null check (prioridade in ('baixa','normal','alta','urgente')),
  checklist jsonb not null default '[]',
  tarefa_pai_id text,
  conversa_id text,
  risco boolean not null default false,
  concluida_por_tipo text,
  concluida_por_id text,
  concluida_em timestamptz,
  cancelada_motivo text,
  constraint tarefa_cancelada_com_motivo check (status <> 'cancelada' or coalesce(cancelada_motivo, '') <> ''),
  primary key (escritorio_id, id)
);

create table public.lead (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  pessoa_id text not null,
  empresa_nome text,
  cnpj text,
  etapa text not null check (etapa in ('lead','qualificado','proposta','contrato','implantacao','perdido')),
  origem text not null check (origem in ('whatsapp','site','indicacao','instagram','manual')),
  responsavel_id text,
  motivo_perda text,
  cliente_id text,
  primary key (escritorio_id, id)
);

create table public.conversa (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  cliente_id text,
  lead_id text,
  pessoa_id text,
  setor_id text not null,
  responsavel_id text,
  status text not null check (status in ('nova','em_atendimento','aguardando_cliente','aguardando_interno','resolvida')),
  tarefa_id text,
  canal_resposta_atual text not null,
  etiquetas text[] not null default '{}',
  resumo text,
  conversa_anterior_id text,
  ultima_mensagem_em timestamptz not null,
  primary key (escritorio_id, id)
);

create table public.mensagem (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  conversa_id text not null,
  direcao text not null check (direcao in ('entrada','saida','nota_interna')),
  canal text not null check (canal in ('whatsapp','email','chat_app','formulario_site','sistema')),
  autor_tipo text not null check (autor_tipo in ('pessoa','usuario','integrante','sistema')),
  autor_id text,
  corpo text,
  transcricao text,
  origem_externa boolean not null default false,
  status_entrega text check (status_entrega in ('enviada','entregue','lida','falhou')),
  enviada_em timestamptz,
  primary key (escritorio_id, id)
);

create table public.documento (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  cliente_id text,
  tipo text not null,
  competencia text,
  nome_arquivo text not null,
  mime text not null,
  tamanho_bytes bigint not null default 0,
  hash_sha256 text not null,
  origem text not null,
  enviado_por_tipo text,
  enviado_por_id text,
  backend_id text not null,
  caminho text not null default '',
  visivel_ao_cliente boolean not null default false,
  versao integer not null default 1,
  versao_de text,
  tarefa_id text,
  mensagem_id text,
  metadados jsonb,
  primary key (escritorio_id, id)
);

create table public.registro_entrega (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  documento_id text not null,
  pessoa_id text,
  acao text not null check (acao in ('visto','baixado','enviado_whatsapp','enviado_email','confirmado')),
  em timestamptz not null,
  hash_no_momento text not null,
  primary key (escritorio_id, id)
);

create table public.evento (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  nome text not null,
  ator_tipo text not null check (ator_tipo in ('pessoa','integrante','sistema','core')),
  ator_id text,
  ator_nome text,
  usuario_dono_id text,
  cliente_id text,
  setor_id text,
  ferramenta text not null,
  nivel text not null check (nivel in ('ler','rascunhar','executar')),
  argumentos_resumo jsonb,
  resultado text not null check (resultado in ('ok','negado','erro','aguardando_aprovacao','aprovado','recusado')),
  resultado_ref text,
  origem text not null check (origem in ('tela','chat','job','evento','core','api_externa','migracao')),
  visivel_na_linha_do_tempo boolean not null default true,
  texto text not null,
  primary key (escritorio_id, id)
);

create table public.cartao_aprovacao (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  ferramenta text not null,
  argumentos jsonb not null default '{}',
  resumo_humano text not null,
  pedido_por_tipo text not null check (pedido_por_tipo in ('integrante','usuario','sistema')),
  pedido_por_id text,
  usuario_dono_id text,
  pode_aprovar text[] not null default '{}',
  status text not null check (status in ('pendente','aprovado','recusado','editado_e_aprovado','expirado','cancelado')),
  expira_em timestamptz,
  decidido_por text,
  decidido_em timestamptz,
  comentario text,
  constraint cartao_decisao_com_autor check (status in ('pendente','expirado','cancelado') or (decidido_por is not null and decidido_em is not null)),
  primary key (escritorio_id, id)
);

create table public.notificacao (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  destinatario_tipo text not null check (destinatario_tipo in ('usuario','pessoa','todos')),
  destinatario_ids text[] not null default '{}',
  cliente_id text,
  setor_id text,
  categoria text not null,
  prioridade text not null check (prioridade in ('urgente','alta','normal','baixa')),
  titulo text not null,
  corpo text,
  acao jsonb,
  publicada_por_tipo text not null,
  lida_por text[] not null default '{}',
  quando text not null,
  primary key (escritorio_id, id)
);

create table public.integrante (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  usuario_dono_id text,
  tipo text not null check (tipo in ('geral','padrao_setor','consultor','criado_pelo_usuario')),
  setor text not null,
  nome_exibido text,
  instrucoes text not null default '',
  setores text[] not null default '{}',
  canal_aviso text not null,
  situacao text not null check (situacao in ('ativo','pausado','desativado')),
  primary key (escritorio_id, id)
);

create table public.mensagem_integrante (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  sessao_chave text not null,
  autor_tipo text not null check (autor_tipo in ('usuario','integrante','sistema')),
  autor_id text,
  corpo text,
  primary key (escritorio_id, id)
);

create table public.item_fila (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  integrante_id text not null,
  tipo text not null,
  status text not null check (status in ('pendente','em_execucao','pausado','concluido','cancelado','falhou')),
  enfileirado_em timestamptz not null,
  iniciado_em timestamptz,
  concluido_em timestamptz,
  primary key (escritorio_id, id)
);

create table public.conversa_interna (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  tipo text not null check (tipo in ('pessoal','grupo','canal_setor','canal_geral')),
  nome text,
  setor_id text,
  criada_por text,
  primary key (escritorio_id, id)
);

create table public.participacao (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  conversa_interna_id text not null,
  usuario_id text not null,
  entrou_em timestamptz not null,
  saiu_em timestamptz,
  primary key (escritorio_id, id)
);

create table public.mensagem_interna (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  conversa_interna_id text not null,
  autor_id text not null,
  corpo text not null,
  responde_a_id text,
  fixada boolean not null default false,
  editada_em timestamptz,
  versoes jsonb not null default '[]',
  primary key (escritorio_id, id)
);

create table public.registro_tela (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  valor jsonb,
  primary key (escritorio_id, id)
);

create table public.nota_emitida (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  cliente_id text not null,
  numero integer not null,
  situacao text not null,
  primary key (escritorio_id, id)
);

-- Índices de busca (as ligações entre tabelas ficam no app por enquanto; ver app/supabase/README.md).
create index on public.identidade (escritorio_id, pessoa_id);
create index on public.usuario (escritorio_id, pessoa_id);
create index on public.vinculo_setor (escritorio_id, usuario_id);
create index on public.vinculo_setor (escritorio_id, setor_id);
create index on public.excecao_tela (escritorio_id, usuario_id);
create index on public.carteira_cliente (escritorio_id, usuario_id);
create index on public.carteira_cliente (escritorio_id, cliente_id);
create index on public.versao_perfil (escritorio_id, cliente_id);
create index on public.tarefa (escritorio_id, cliente_id);
create index on public.tarefa (escritorio_id, setor_id);
create index on public.lead (escritorio_id, pessoa_id);
create index on public.conversa (escritorio_id, cliente_id);
create index on public.conversa (escritorio_id, setor_id);
create index on public.mensagem (escritorio_id, conversa_id);
create index on public.documento (escritorio_id, cliente_id);
create index on public.registro_entrega (escritorio_id, documento_id);
create index on public.participacao (escritorio_id, conversa_interna_id);
create index on public.participacao (escritorio_id, usuario_id);
create index on public.mensagem_interna (escritorio_id, conversa_interna_id);
create unique index usuario_email_por_escritorio on public.usuario (escritorio_id, lower(email_login));
create unique index cliente_documento_por_escritorio on public.cliente (escritorio_id, documento);
create index evento_linha_do_tempo on public.evento (escritorio_id, criado_em desc);
create index tarefa_fila on public.tarefa (escritorio_id, setor_id, status, prazo_interno);

-- atualizado_em, RLS forçada por escritório e as regras de imutabilidade.
create trigger tocar before update on public.escritorio for each row execute function public.tocar_atualizado_em();
alter table public.escritorio enable row level security;
alter table public.escritorio force row level security;
create policy escritorio_ler on public.escritorio for select using (id = public.escritorio_atual());
create policy escritorio_mudar on public.escritorio for update using (id = public.escritorio_atual()) with check (id = public.escritorio_atual());
-- Criar escritório (semente da demonstração): só o próprio, o do JWT.
create policy escritorio_criar on public.escritorio for insert with check (id = public.escritorio_atual());

create trigger tocar before update on public.assinatura for each row execute function public.tocar_atualizado_em();
alter table public.assinatura enable row level security;
alter table public.assinatura force row level security;
create policy assinatura_ler on public.assinatura for select using (escritorio_id = public.escritorio_atual());
create policy assinatura_inserir on public.assinatura for insert with check (escritorio_id = public.escritorio_atual());
create policy assinatura_atualizar on public.assinatura for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create policy assinatura_excluir on public.assinatura for delete using (escritorio_id = public.escritorio_atual());

create trigger tocar before update on public.pessoa for each row execute function public.tocar_atualizado_em();
alter table public.pessoa enable row level security;
alter table public.pessoa force row level security;
create policy pessoa_ler on public.pessoa for select using (escritorio_id = public.escritorio_atual());
create policy pessoa_inserir on public.pessoa for insert with check (escritorio_id = public.escritorio_atual());
create policy pessoa_atualizar on public.pessoa for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create policy pessoa_excluir on public.pessoa for delete using (escritorio_id = public.escritorio_atual());

create trigger tocar before update on public.identidade for each row execute function public.tocar_atualizado_em();
alter table public.identidade enable row level security;
alter table public.identidade force row level security;
create policy identidade_ler on public.identidade for select using (escritorio_id = public.escritorio_atual());
create policy identidade_inserir on public.identidade for insert with check (escritorio_id = public.escritorio_atual());
create policy identidade_atualizar on public.identidade for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create policy identidade_excluir on public.identidade for delete using (escritorio_id = public.escritorio_atual());

create trigger tocar before update on public.usuario for each row execute function public.tocar_atualizado_em();
alter table public.usuario enable row level security;
alter table public.usuario force row level security;
create policy usuario_ler on public.usuario for select using (escritorio_id = public.escritorio_atual());
create policy usuario_inserir on public.usuario for insert with check (escritorio_id = public.escritorio_atual());
create policy usuario_atualizar on public.usuario for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create policy usuario_excluir on public.usuario for delete using (escritorio_id = public.escritorio_atual());

create trigger tocar before update on public.setor for each row execute function public.tocar_atualizado_em();
alter table public.setor enable row level security;
alter table public.setor force row level security;
create policy setor_ler on public.setor for select using (escritorio_id = public.escritorio_atual());
create policy setor_inserir on public.setor for insert with check (escritorio_id = public.escritorio_atual());
create policy setor_atualizar on public.setor for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create policy setor_excluir on public.setor for delete using (escritorio_id = public.escritorio_atual());

create trigger tocar before update on public.vinculo_setor for each row execute function public.tocar_atualizado_em();
alter table public.vinculo_setor enable row level security;
alter table public.vinculo_setor force row level security;
create policy vinculo_setor_ler on public.vinculo_setor for select using (escritorio_id = public.escritorio_atual());
create policy vinculo_setor_inserir on public.vinculo_setor for insert with check (escritorio_id = public.escritorio_atual());
create policy vinculo_setor_atualizar on public.vinculo_setor for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create policy vinculo_setor_excluir on public.vinculo_setor for delete using (escritorio_id = public.escritorio_atual());

create trigger tocar before update on public.excecao_tela for each row execute function public.tocar_atualizado_em();
alter table public.excecao_tela enable row level security;
alter table public.excecao_tela force row level security;
create policy excecao_tela_ler on public.excecao_tela for select using (escritorio_id = public.escritorio_atual());
create policy excecao_tela_inserir on public.excecao_tela for insert with check (escritorio_id = public.escritorio_atual());
create policy excecao_tela_atualizar on public.excecao_tela for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create policy excecao_tela_excluir on public.excecao_tela for delete using (escritorio_id = public.escritorio_atual());

create trigger tocar before update on public.cliente for each row execute function public.tocar_atualizado_em();
alter table public.cliente enable row level security;
alter table public.cliente force row level security;
create policy cliente_ler on public.cliente for select using (escritorio_id = public.escritorio_atual());
create policy cliente_inserir on public.cliente for insert with check (escritorio_id = public.escritorio_atual());
create policy cliente_atualizar on public.cliente for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create policy cliente_excluir on public.cliente for delete using (escritorio_id = public.escritorio_atual());

create trigger tocar before update on public.carteira_cliente for each row execute function public.tocar_atualizado_em();
alter table public.carteira_cliente enable row level security;
alter table public.carteira_cliente force row level security;
create policy carteira_cliente_ler on public.carteira_cliente for select using (escritorio_id = public.escritorio_atual());
create policy carteira_cliente_inserir on public.carteira_cliente for insert with check (escritorio_id = public.escritorio_atual());
create policy carteira_cliente_atualizar on public.carteira_cliente for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create policy carteira_cliente_excluir on public.carteira_cliente for delete using (escritorio_id = public.escritorio_atual());

create trigger tocar before update on public.convite for each row execute function public.tocar_atualizado_em();
alter table public.convite enable row level security;
alter table public.convite force row level security;
create policy convite_ler on public.convite for select using (escritorio_id = public.escritorio_atual());
create policy convite_inserir on public.convite for insert with check (escritorio_id = public.escritorio_atual());
create policy convite_atualizar on public.convite for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create policy convite_excluir on public.convite for delete using (escritorio_id = public.escritorio_atual());

create trigger tocar before update on public.versao_perfil for each row execute function public.tocar_atualizado_em();
alter table public.versao_perfil enable row level security;
alter table public.versao_perfil force row level security;
create policy versao_perfil_ler on public.versao_perfil for select using (escritorio_id = public.escritorio_atual());
create policy versao_perfil_inserir on public.versao_perfil for insert with check (escritorio_id = public.escritorio_atual());
create policy versao_perfil_atualizar on public.versao_perfil for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create policy versao_perfil_excluir on public.versao_perfil for delete using (escritorio_id = public.escritorio_atual());

create trigger tocar before update on public.obrigacao for each row execute function public.tocar_atualizado_em();
alter table public.obrigacao enable row level security;
alter table public.obrigacao force row level security;
create policy obrigacao_ler on public.obrigacao for select using (escritorio_id = public.escritorio_atual());
create policy obrigacao_inserir on public.obrigacao for insert with check (escritorio_id = public.escritorio_atual());
create policy obrigacao_atualizar on public.obrigacao for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create policy obrigacao_excluir on public.obrigacao for delete using (escritorio_id = public.escritorio_atual());

create trigger tocar before update on public.tarefa for each row execute function public.tocar_atualizado_em();
alter table public.tarefa enable row level security;
alter table public.tarefa force row level security;
create policy tarefa_ler on public.tarefa for select using (escritorio_id = public.escritorio_atual());
create policy tarefa_inserir on public.tarefa for insert with check (escritorio_id = public.escritorio_atual());
create policy tarefa_atualizar on public.tarefa for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create policy tarefa_excluir on public.tarefa for delete using (escritorio_id = public.escritorio_atual());

create trigger tocar before update on public.lead for each row execute function public.tocar_atualizado_em();
alter table public.lead enable row level security;
alter table public.lead force row level security;
create policy lead_ler on public.lead for select using (escritorio_id = public.escritorio_atual());
create policy lead_inserir on public.lead for insert with check (escritorio_id = public.escritorio_atual());
create policy lead_atualizar on public.lead for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create policy lead_excluir on public.lead for delete using (escritorio_id = public.escritorio_atual());

create trigger tocar before update on public.conversa for each row execute function public.tocar_atualizado_em();
alter table public.conversa enable row level security;
alter table public.conversa force row level security;
create policy conversa_ler on public.conversa for select using (escritorio_id = public.escritorio_atual());
create policy conversa_inserir on public.conversa for insert with check (escritorio_id = public.escritorio_atual());
create policy conversa_atualizar on public.conversa for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create policy conversa_excluir on public.conversa for delete using (escritorio_id = public.escritorio_atual());

create trigger tocar before update on public.mensagem for each row execute function public.tocar_atualizado_em();
alter table public.mensagem enable row level security;
alter table public.mensagem force row level security;
create policy mensagem_ler on public.mensagem for select using (escritorio_id = public.escritorio_atual());
create policy mensagem_inserir on public.mensagem for insert with check (escritorio_id = public.escritorio_atual());
create policy mensagem_atualizar on public.mensagem for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create policy mensagem_excluir on public.mensagem for delete using (escritorio_id = public.escritorio_atual());

create trigger tocar before update on public.documento for each row execute function public.tocar_atualizado_em();
alter table public.documento enable row level security;
alter table public.documento force row level security;
create policy documento_ler on public.documento for select using (escritorio_id = public.escritorio_atual());
create policy documento_inserir on public.documento for insert with check (escritorio_id = public.escritorio_atual());
create policy documento_atualizar on public.documento for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create policy documento_excluir on public.documento for delete using (escritorio_id = public.escritorio_atual());

create trigger tocar before update on public.registro_entrega for each row execute function public.tocar_atualizado_em();
alter table public.registro_entrega enable row level security;
alter table public.registro_entrega force row level security;
create policy registro_entrega_ler on public.registro_entrega for select using (escritorio_id = public.escritorio_atual());
create policy registro_entrega_inserir on public.registro_entrega for insert with check (escritorio_id = public.escritorio_atual());
create trigger so_insercao before update or delete on public.registro_entrega for each row execute function public.recusar_operacao('o registro de entrega só cresce (Fundações 4.11)');

create trigger tocar before update on public.evento for each row execute function public.tocar_atualizado_em();
alter table public.evento enable row level security;
alter table public.evento force row level security;
create policy evento_ler on public.evento for select using (escritorio_id = public.escritorio_atual());
create policy evento_inserir on public.evento for insert with check (escritorio_id = public.escritorio_atual());
create trigger so_insercao before update or delete on public.evento for each row execute function public.recusar_operacao('o registro de eventos é imutável (Fundações 5.2)');

create trigger tocar before update on public.cartao_aprovacao for each row execute function public.tocar_atualizado_em();
alter table public.cartao_aprovacao enable row level security;
alter table public.cartao_aprovacao force row level security;
create policy cartao_aprovacao_ler on public.cartao_aprovacao for select using (escritorio_id = public.escritorio_atual());
create policy cartao_aprovacao_inserir on public.cartao_aprovacao for insert with check (escritorio_id = public.escritorio_atual());
create policy cartao_aprovacao_atualizar on public.cartao_aprovacao for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create policy cartao_aprovacao_excluir on public.cartao_aprovacao for delete using (escritorio_id = public.escritorio_atual());

create trigger tocar before update on public.notificacao for each row execute function public.tocar_atualizado_em();
alter table public.notificacao enable row level security;
alter table public.notificacao force row level security;
create policy notificacao_ler on public.notificacao for select using (escritorio_id = public.escritorio_atual());
create policy notificacao_inserir on public.notificacao for insert with check (escritorio_id = public.escritorio_atual());
create policy notificacao_atualizar on public.notificacao for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create policy notificacao_excluir on public.notificacao for delete using (escritorio_id = public.escritorio_atual());

create trigger tocar before update on public.integrante for each row execute function public.tocar_atualizado_em();
alter table public.integrante enable row level security;
alter table public.integrante force row level security;
create policy integrante_ler on public.integrante for select using (escritorio_id = public.escritorio_atual());
create policy integrante_inserir on public.integrante for insert with check (escritorio_id = public.escritorio_atual());
create policy integrante_atualizar on public.integrante for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create policy integrante_excluir on public.integrante for delete using (escritorio_id = public.escritorio_atual());

create trigger tocar before update on public.mensagem_integrante for each row execute function public.tocar_atualizado_em();
alter table public.mensagem_integrante enable row level security;
alter table public.mensagem_integrante force row level security;
create policy mensagem_integrante_ler on public.mensagem_integrante for select using (escritorio_id = public.escritorio_atual());
create policy mensagem_integrante_inserir on public.mensagem_integrante for insert with check (escritorio_id = public.escritorio_atual());
create policy mensagem_integrante_atualizar on public.mensagem_integrante for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create policy mensagem_integrante_excluir on public.mensagem_integrante for delete using (escritorio_id = public.escritorio_atual());

create trigger tocar before update on public.item_fila for each row execute function public.tocar_atualizado_em();
alter table public.item_fila enable row level security;
alter table public.item_fila force row level security;
create policy item_fila_ler on public.item_fila for select using (escritorio_id = public.escritorio_atual());
create policy item_fila_inserir on public.item_fila for insert with check (escritorio_id = public.escritorio_atual());
create policy item_fila_atualizar on public.item_fila for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create policy item_fila_excluir on public.item_fila for delete using (escritorio_id = public.escritorio_atual());

create trigger tocar before update on public.conversa_interna for each row execute function public.tocar_atualizado_em();
alter table public.conversa_interna enable row level security;
alter table public.conversa_interna force row level security;
create policy conversa_interna_ler on public.conversa_interna for select using (escritorio_id = public.escritorio_atual());
create policy conversa_interna_inserir on public.conversa_interna for insert with check (escritorio_id = public.escritorio_atual());
create policy conversa_interna_atualizar on public.conversa_interna for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create policy conversa_interna_excluir on public.conversa_interna for delete using (escritorio_id = public.escritorio_atual());

create trigger tocar before update on public.participacao for each row execute function public.tocar_atualizado_em();
alter table public.participacao enable row level security;
alter table public.participacao force row level security;
create policy participacao_ler on public.participacao for select using (escritorio_id = public.escritorio_atual());
create policy participacao_inserir on public.participacao for insert with check (escritorio_id = public.escritorio_atual());
create policy participacao_atualizar on public.participacao for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create policy participacao_excluir on public.participacao for delete using (escritorio_id = public.escritorio_atual());

create trigger tocar before update on public.mensagem_interna for each row execute function public.tocar_atualizado_em();
alter table public.mensagem_interna enable row level security;
alter table public.mensagem_interna force row level security;
create policy mensagem_interna_ler on public.mensagem_interna for select using (escritorio_id = public.escritorio_atual());
create policy mensagem_interna_inserir on public.mensagem_interna for insert with check (escritorio_id = public.escritorio_atual());
create policy mensagem_interna_atualizar on public.mensagem_interna for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create trigger nunca_apagar before delete on public.mensagem_interna for each row execute function public.recusar_operacao('mensagem interna nunca se apaga (subplano 11)');

create trigger tocar before update on public.registro_tela for each row execute function public.tocar_atualizado_em();
alter table public.registro_tela enable row level security;
alter table public.registro_tela force row level security;
create policy registro_tela_ler on public.registro_tela for select using (escritorio_id = public.escritorio_atual());
create policy registro_tela_inserir on public.registro_tela for insert with check (escritorio_id = public.escritorio_atual());
create policy registro_tela_atualizar on public.registro_tela for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create policy registro_tela_excluir on public.registro_tela for delete using (escritorio_id = public.escritorio_atual());

create trigger tocar before update on public.nota_emitida for each row execute function public.tocar_atualizado_em();
alter table public.nota_emitida enable row level security;
alter table public.nota_emitida force row level security;
create policy nota_emitida_ler on public.nota_emitida for select using (escritorio_id = public.escritorio_atual());
create policy nota_emitida_inserir on public.nota_emitida for insert with check (escritorio_id = public.escritorio_atual());
create policy nota_emitida_atualizar on public.nota_emitida for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create policy nota_emitida_excluir on public.nota_emitida for delete using (escritorio_id = public.escritorio_atual());

-- "Restaurar demonstração" apaga e semeia de novo o escritório inteiro. No produto, esta
-- função não existe; aqui ela é a única porta para limpar eventos e mensagens internas,
-- e só para o escritório do próprio JWT.
create or replace function public.restaurar_demonstracao() returns void
language plpgsql security definer set search_path = public as $$
declare alvo text := public.escritorio_atual();
begin
  if alvo is null then raise exception 'Sem escritório na sessão' using errcode = '42501'; end if;
  alter table public.evento disable trigger so_insercao;
  alter table public.registro_entrega disable trigger so_insercao;
  alter table public.mensagem_interna disable trigger nunca_apagar;
  delete from public.escritorio where id = alvo;
  alter table public.evento enable trigger so_insercao;
  alter table public.registro_entrega enable trigger so_insercao;
  alter table public.mensagem_interna enable trigger nunca_apagar;
end $$;
revoke all on function public.restaurar_demonstracao() from public;
grant execute on function public.restaurar_demonstracao() to authenticated;

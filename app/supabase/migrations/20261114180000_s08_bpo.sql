-- S08 · BPO (subplano 10, 3.12 e 4.1): as entidades do módulo BPO do wireframe.
-- Espelho das interfaces acrescentadas pela S08 em app/src/nucleo/modelo/entidades.ts
-- (mesmos nomes e colunas, snake_case). Segue o padrão da migração das Fundações:
-- colunas comuns, chave (escritorio_id, id), RLS forçada pelo escritório do JWT,
-- quatro políticas por tabela e o gatilho que toca atualizado_em.
-- Regras que ficam no banco (segunda barreira; a primeira são os repositórios do app):
--   * nenhuma conta, lote, alçada, item de fila ou contratante é apagado pelo app (R7);
--     só as rotinas configuráveis podem ser excluídas;
--   * lote aprovado ou liberado exige ao menos uma aprovação registrada (B3);
--   * conta a pagar paga ou liberada exige ao menos uma conferência (B2).
-- Restaurar a demonstração continua limpando tudo: as tabelas apontam para o escritório
-- com "on delete cascade" e restaurar_demonstracao() apaga o escritório do JWT.
-- Aplicar no projeto pede autorização do dono (docs/wireframe/ARQUITETURA.md, seção 9).

create table public.subinquilino (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  nome text not null,
  cnpj text not null,
  tema_id text not null,
  escopo_mae text[] not null default '{}',
  modo_contato text not null check (modo_contato in ('invisivel','marca','direto')),
  convidados_max integer not null default 10 check (convidados_max > 0),
  transferencia text not null check (transferencia in ('parcial','total')),
  contrato jsonb not null default '{}',
  suboperadores text[] not null default '{}',
  procuracoes jsonb not null default '[]',
  clientes_finais jsonb not null default '[]',
  situacao text not null check (situacao in ('ativo','entrada','saida')),
  sla_mes numeric not null default 0,
  margem numeric not null default 0,
  horas_mes numeric not null default 0,
  honorario_mes numeric not null default 0,
  primary key (escritorio_id, id)
);

create table public.bpo_configuracao (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  pesos jsonb not null default '{}',
  limiar_amarelo numeric not null default 3,
  limiar_vermelho numeric not null default 8,
  teto_whatsapp numeric not null default 3000,
  primary key (escritorio_id, id)
);

create table public.bpo_perfil (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  cliente_id text not null,
  situacao text not null check (situacao in ('onboarding','paralelo','ativo','encerrando','encerrado')),
  escopo text[] not null default '{}',
  modo_pagamento text not null check (modo_pagamento in ('M1','M2','M3')),
  teto_m2 numeric,
  responsavel_nome text not null,
  analista_nome text not null,
  caixa_minimo numeric not null default 0 check (caixa_minimo >= 0),
  paralelo_ate date,
  termo_aceito_em date,
  onboarding jsonb not null default '{}',
  janela jsonb not null default '{}',
  escalonamento jsonb not null default '{}',
  sla jsonb not null default '{}',
  volume jsonb not null default '{}',
  honorario numeric not null default 0,
  horas_mes numeric not null default 0,
  fluxo jsonb not null default '{}',
  encerramento jsonb,
  primary key (escritorio_id, id)
);

create table public.bpo_conexao_erp (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  cliente_id text not null,
  provedor text not null,
  modo text not null check (modo in ('E1','E2','E3')),
  escopo text not null,
  situacao text not null check (situacao in ('ok','atrasada','credencial_vencida','arquivo','livro_proprio','desconectada')),
  ultima_sincronizacao timestamptz,
  conector_id text,
  primary key (escritorio_id, id)
);

create table public.bpo_conta_bancaria (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  cliente_id text not null,
  nome text not null,
  saldo numeric not null default 0,
  saldo_em timestamptz not null,
  via text not null check (via in ('open_finance','api_banco','ofx','manual')),
  consentimento_ate date,
  primary key (escritorio_id, id)
);

create table public.bpo_fornecedor (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  cliente_id text not null,
  nome text not null,
  documento text,
  banco text,
  risco text not null check (risco in ('recorrente','novo','alterado')),
  dados_bancarios_confirmados_em date,
  confirmado_por text,
  canal_confirmacao text,
  primary key (escritorio_id, id)
);

create table public.bpo_conta (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  cliente_id text not null,
  tipo text not null check (tipo in ('pagar','receber')),
  contraparte text not null,
  fornecedor_id text,
  categoria text not null,
  valor numeric not null check (valor > 0),
  vencimento date not null,
  origem text not null,
  etapa text not null check (etapa in ('capturada','conferida','em_lote','aguardando_cliente','aprovada','liberada','paga','recusada','cancelada','aberta','recebida','atrasada')),
  digitado_por_id text,
  digitado_por_nome text not null,
  conferencias jsonb not null default '[]',
  lote_id text,
  alerta text,
  lancar_no_erp boolean,
  motivo text,
  primary key (escritorio_id, id)
);

create table public.bpo_lote (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  cliente_id text not null,
  titulo text not null,
  conta_ids text[] not null default '{}',
  total numeric not null,
  saldo numeric not null default 0,
  expira_em timestamptz not null,
  situacao text not null check (situacao in ('aguardando','parcial','aprovado','recusado','liberado','expirado')),
  aprovacoes jsonb not null default '[]',
  removidos text[] not null default '{}',
  motivo text,
  preparado_por text not null,
  conferido_por text not null,
  aprovadores_necessarios integer not null default 1 check (aprovadores_necessarios between 1 and 2),
  modo_pagamento text not null check (modo_pagamento in ('M1','M2','M3')),
  cartao_id text,
  primary key (escritorio_id, id)
);

create table public.bpo_alcada (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  cliente_id text not null,
  situacao text not null check (situacao in ('proposta','vigente','recusada','substituida','retirada')),
  faixa1 numeric not null check (faixa1 > 0),
  faixa2 numeric not null,
  janela text not null,
  pessoas jsonb not null default '{}',
  proposta_por_id text,
  proposta_por_nome text not null,
  aceito_por text,
  aceito_em timestamptz,
  vigencia_ate date,
  primary key (escritorio_id, id)
);

create table public.bpo_item_fila (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  cliente_id text,
  subinquilino_id text,
  cliente_final text,
  departamento text,
  tipo text not null check (tipo in ('pedido','pagamento','pendencia','revisao')),
  texto text not null,
  codigo text not null,
  canal text not null check (canal in ('app','whatsapp','email','portal','interno')),
  prazo date not null,
  prazo_legal date,
  bola text not null check (bola in ('bpo','cliente','contratante','cliente_final','terceiro')),
  responsavel_nome text,
  situacao text not null check (situacao in ('aberto','resolvido')),
  faltando text[] not null default '{}',
  sla_inicio timestamptz,
  sla_meta_h numeric not null default 24,
  detalhe text,
  valor numeric,
  visibilidade text not null default 'compartilhada' check (visibilidade in ('interna_bpo','compartilhada')),
  primary key (escritorio_id, id)
);

create table public.bpo_rotina (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  cliente_id text not null,
  cadencia text not null check (cadencia in ('diária','semanal','mensal')),
  nome text not null,
  quando text not null,
  codigo text not null,
  ativa boolean not null default true,
  feita_em timestamptz,
  feita_por text,
  primary key (escritorio_id, id)
);

create table public.bpo_transacao (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  cliente_id text not null,
  conta text not null,
  data date not null,
  descricao text not null,
  valor numeric not null,
  sugestao text not null,
  confianca text not null check (confianca in ('alta','baixa')),
  situacao text not null check (situacao in ('pendente','conciliada')),
  categoria text,
  conciliada_por text,
  primary key (escritorio_id, id)
);

create table public.bpo_entrega (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  cliente_id text,
  subinquilino_id text,
  competencia text not null,
  tipo text not null check (tipo in ('relatorio','fechamento','relatorio_contratante')),
  situacao text not null check (situacao in ('pendente','enviado')),
  documento_id text,
  enviado_em timestamptz,
  enviado_por text,
  primary key (escritorio_id, id)
);

create table public.bpo_volume (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  cliente_id text,
  subinquilino_id text,
  competencia text not null,
  itens jsonb not null default '[]',
  contestacoes jsonb not null default '[]',
  situacao text not null check (situacao in ('aberto','contestado','faturado')),
  extra_valor numeric not null default 0,
  faturado_por text,
  primary key (escritorio_id, id)
);

create table public.bpo_convidado (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  subinquilino_id text not null,
  nome text not null,
  email text not null,
  papel text not null check (papel in ('responsavel_tecnico','socio','equipe')),
  situacao text not null check (situacao in ('convidado','ativo','desativado')),
  primary key (escritorio_id, id)
);

-- B3: nenhum pagamento sem aprovação humana registrada.
alter table public.bpo_lote add constraint bpo_lote_aprovado_com_aprovacao check (situacao not in ('aprovado','liberado') or jsonb_array_length(aprovacoes) >= 1);
-- B2: conta paga ou liberada passou por conferência (de uma pessoa ou do cliente na aprovação).
alter table public.bpo_conta add constraint bpo_conta_paga_conferida check (tipo = 'receber' or etapa not in ('aprovada','liberada','paga') or jsonb_array_length(conferencias) >= 1);

-- Índices de busca por empresa (as ligações entre tabelas ficam no app, como nas Fundações).
create index bpo_perfil_cliente on public.bpo_perfil (escritorio_id, cliente_id);
create index bpo_conexao_erp_cliente on public.bpo_conexao_erp (escritorio_id, cliente_id);
create index bpo_conta_bancaria_cliente on public.bpo_conta_bancaria (escritorio_id, cliente_id);
create index bpo_fornecedor_cliente on public.bpo_fornecedor (escritorio_id, cliente_id);
create index bpo_conta_cliente on public.bpo_conta (escritorio_id, cliente_id);
create index bpo_lote_cliente on public.bpo_lote (escritorio_id, cliente_id);
create index bpo_alcada_cliente on public.bpo_alcada (escritorio_id, cliente_id);
create index bpo_item_fila_cliente on public.bpo_item_fila (escritorio_id, cliente_id);
create index bpo_item_fila_subinquilino on public.bpo_item_fila (escritorio_id, subinquilino_id);
create index bpo_rotina_cliente on public.bpo_rotina (escritorio_id, cliente_id);
create index bpo_transacao_cliente on public.bpo_transacao (escritorio_id, cliente_id);
create index bpo_entrega_cliente on public.bpo_entrega (escritorio_id, cliente_id);
create index bpo_entrega_subinquilino on public.bpo_entrega (escritorio_id, subinquilino_id);
create index bpo_volume_cliente on public.bpo_volume (escritorio_id, cliente_id);
create index bpo_volume_subinquilino on public.bpo_volume (escritorio_id, subinquilino_id);
create index bpo_convidado_subinquilino on public.bpo_convidado (escritorio_id, subinquilino_id);

create trigger tocar before update on public.subinquilino for each row execute function public.tocar_atualizado_em();
alter table public.subinquilino enable row level security;
alter table public.subinquilino force row level security;
create policy subinquilino_ler on public.subinquilino for select using (escritorio_id = public.escritorio_atual());
create policy subinquilino_inserir on public.subinquilino for insert with check (escritorio_id = public.escritorio_atual());
create policy subinquilino_atualizar on public.subinquilino for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create trigger nunca_apagar before delete on public.subinquilino for each row when (current_setting('heild.restaurando', true) is distinct from 'sim') execute function public.recusar_operacao('nada se apaga no BPO (R7)');
create policy subinquilino_excluir on public.subinquilino for delete using (escritorio_id = public.escritorio_atual());

create trigger tocar before update on public.bpo_configuracao for each row execute function public.tocar_atualizado_em();
alter table public.bpo_configuracao enable row level security;
alter table public.bpo_configuracao force row level security;
create policy bpo_configuracao_ler on public.bpo_configuracao for select using (escritorio_id = public.escritorio_atual());
create policy bpo_configuracao_inserir on public.bpo_configuracao for insert with check (escritorio_id = public.escritorio_atual());
create policy bpo_configuracao_atualizar on public.bpo_configuracao for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create trigger nunca_apagar before delete on public.bpo_configuracao for each row when (current_setting('heild.restaurando', true) is distinct from 'sim') execute function public.recusar_operacao('nada se apaga no BPO (R7)');
create policy bpo_configuracao_excluir on public.bpo_configuracao for delete using (escritorio_id = public.escritorio_atual());

create trigger tocar before update on public.bpo_perfil for each row execute function public.tocar_atualizado_em();
alter table public.bpo_perfil enable row level security;
alter table public.bpo_perfil force row level security;
create policy bpo_perfil_ler on public.bpo_perfil for select using (escritorio_id = public.escritorio_atual());
create policy bpo_perfil_inserir on public.bpo_perfil for insert with check (escritorio_id = public.escritorio_atual());
create policy bpo_perfil_atualizar on public.bpo_perfil for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create trigger nunca_apagar before delete on public.bpo_perfil for each row when (current_setting('heild.restaurando', true) is distinct from 'sim') execute function public.recusar_operacao('nada se apaga no BPO (R7)');
create policy bpo_perfil_excluir on public.bpo_perfil for delete using (escritorio_id = public.escritorio_atual());

create trigger tocar before update on public.bpo_conexao_erp for each row execute function public.tocar_atualizado_em();
alter table public.bpo_conexao_erp enable row level security;
alter table public.bpo_conexao_erp force row level security;
create policy bpo_conexao_erp_ler on public.bpo_conexao_erp for select using (escritorio_id = public.escritorio_atual());
create policy bpo_conexao_erp_inserir on public.bpo_conexao_erp for insert with check (escritorio_id = public.escritorio_atual());
create policy bpo_conexao_erp_atualizar on public.bpo_conexao_erp for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create trigger nunca_apagar before delete on public.bpo_conexao_erp for each row when (current_setting('heild.restaurando', true) is distinct from 'sim') execute function public.recusar_operacao('nada se apaga no BPO (R7)');
create policy bpo_conexao_erp_excluir on public.bpo_conexao_erp for delete using (escritorio_id = public.escritorio_atual());

create trigger tocar before update on public.bpo_conta_bancaria for each row execute function public.tocar_atualizado_em();
alter table public.bpo_conta_bancaria enable row level security;
alter table public.bpo_conta_bancaria force row level security;
create policy bpo_conta_bancaria_ler on public.bpo_conta_bancaria for select using (escritorio_id = public.escritorio_atual());
create policy bpo_conta_bancaria_inserir on public.bpo_conta_bancaria for insert with check (escritorio_id = public.escritorio_atual());
create policy bpo_conta_bancaria_atualizar on public.bpo_conta_bancaria for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create trigger nunca_apagar before delete on public.bpo_conta_bancaria for each row when (current_setting('heild.restaurando', true) is distinct from 'sim') execute function public.recusar_operacao('nada se apaga no BPO (R7)');
create policy bpo_conta_bancaria_excluir on public.bpo_conta_bancaria for delete using (escritorio_id = public.escritorio_atual());

create trigger tocar before update on public.bpo_fornecedor for each row execute function public.tocar_atualizado_em();
alter table public.bpo_fornecedor enable row level security;
alter table public.bpo_fornecedor force row level security;
create policy bpo_fornecedor_ler on public.bpo_fornecedor for select using (escritorio_id = public.escritorio_atual());
create policy bpo_fornecedor_inserir on public.bpo_fornecedor for insert with check (escritorio_id = public.escritorio_atual());
create policy bpo_fornecedor_atualizar on public.bpo_fornecedor for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create trigger nunca_apagar before delete on public.bpo_fornecedor for each row when (current_setting('heild.restaurando', true) is distinct from 'sim') execute function public.recusar_operacao('nada se apaga no BPO (R7)');
create policy bpo_fornecedor_excluir on public.bpo_fornecedor for delete using (escritorio_id = public.escritorio_atual());

create trigger tocar before update on public.bpo_conta for each row execute function public.tocar_atualizado_em();
alter table public.bpo_conta enable row level security;
alter table public.bpo_conta force row level security;
create policy bpo_conta_ler on public.bpo_conta for select using (escritorio_id = public.escritorio_atual());
create policy bpo_conta_inserir on public.bpo_conta for insert with check (escritorio_id = public.escritorio_atual());
create policy bpo_conta_atualizar on public.bpo_conta for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create trigger nunca_apagar before delete on public.bpo_conta for each row when (current_setting('heild.restaurando', true) is distinct from 'sim') execute function public.recusar_operacao('nada se apaga no BPO (R7)');
create policy bpo_conta_excluir on public.bpo_conta for delete using (escritorio_id = public.escritorio_atual());

create trigger tocar before update on public.bpo_lote for each row execute function public.tocar_atualizado_em();
alter table public.bpo_lote enable row level security;
alter table public.bpo_lote force row level security;
create policy bpo_lote_ler on public.bpo_lote for select using (escritorio_id = public.escritorio_atual());
create policy bpo_lote_inserir on public.bpo_lote for insert with check (escritorio_id = public.escritorio_atual());
create policy bpo_lote_atualizar on public.bpo_lote for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create trigger nunca_apagar before delete on public.bpo_lote for each row when (current_setting('heild.restaurando', true) is distinct from 'sim') execute function public.recusar_operacao('nada se apaga no BPO (R7)');
create policy bpo_lote_excluir on public.bpo_lote for delete using (escritorio_id = public.escritorio_atual());

create trigger tocar before update on public.bpo_alcada for each row execute function public.tocar_atualizado_em();
alter table public.bpo_alcada enable row level security;
alter table public.bpo_alcada force row level security;
create policy bpo_alcada_ler on public.bpo_alcada for select using (escritorio_id = public.escritorio_atual());
create policy bpo_alcada_inserir on public.bpo_alcada for insert with check (escritorio_id = public.escritorio_atual());
create policy bpo_alcada_atualizar on public.bpo_alcada for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create trigger nunca_apagar before delete on public.bpo_alcada for each row when (current_setting('heild.restaurando', true) is distinct from 'sim') execute function public.recusar_operacao('nada se apaga no BPO (R7)');
create policy bpo_alcada_excluir on public.bpo_alcada for delete using (escritorio_id = public.escritorio_atual());

create trigger tocar before update on public.bpo_item_fila for each row execute function public.tocar_atualizado_em();
alter table public.bpo_item_fila enable row level security;
alter table public.bpo_item_fila force row level security;
create policy bpo_item_fila_ler on public.bpo_item_fila for select using (escritorio_id = public.escritorio_atual());
create policy bpo_item_fila_inserir on public.bpo_item_fila for insert with check (escritorio_id = public.escritorio_atual());
create policy bpo_item_fila_atualizar on public.bpo_item_fila for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create trigger nunca_apagar before delete on public.bpo_item_fila for each row when (current_setting('heild.restaurando', true) is distinct from 'sim') execute function public.recusar_operacao('nada se apaga no BPO (R7)');
create policy bpo_item_fila_excluir on public.bpo_item_fila for delete using (escritorio_id = public.escritorio_atual());

create trigger tocar before update on public.bpo_rotina for each row execute function public.tocar_atualizado_em();
alter table public.bpo_rotina enable row level security;
alter table public.bpo_rotina force row level security;
create policy bpo_rotina_ler on public.bpo_rotina for select using (escritorio_id = public.escritorio_atual());
create policy bpo_rotina_inserir on public.bpo_rotina for insert with check (escritorio_id = public.escritorio_atual());
create policy bpo_rotina_atualizar on public.bpo_rotina for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create policy bpo_rotina_excluir on public.bpo_rotina for delete using (escritorio_id = public.escritorio_atual());

create trigger tocar before update on public.bpo_transacao for each row execute function public.tocar_atualizado_em();
alter table public.bpo_transacao enable row level security;
alter table public.bpo_transacao force row level security;
create policy bpo_transacao_ler on public.bpo_transacao for select using (escritorio_id = public.escritorio_atual());
create policy bpo_transacao_inserir on public.bpo_transacao for insert with check (escritorio_id = public.escritorio_atual());
create policy bpo_transacao_atualizar on public.bpo_transacao for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create trigger nunca_apagar before delete on public.bpo_transacao for each row when (current_setting('heild.restaurando', true) is distinct from 'sim') execute function public.recusar_operacao('nada se apaga no BPO (R7)');
create policy bpo_transacao_excluir on public.bpo_transacao for delete using (escritorio_id = public.escritorio_atual());

create trigger tocar before update on public.bpo_entrega for each row execute function public.tocar_atualizado_em();
alter table public.bpo_entrega enable row level security;
alter table public.bpo_entrega force row level security;
create policy bpo_entrega_ler on public.bpo_entrega for select using (escritorio_id = public.escritorio_atual());
create policy bpo_entrega_inserir on public.bpo_entrega for insert with check (escritorio_id = public.escritorio_atual());
create policy bpo_entrega_atualizar on public.bpo_entrega for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create trigger nunca_apagar before delete on public.bpo_entrega for each row when (current_setting('heild.restaurando', true) is distinct from 'sim') execute function public.recusar_operacao('nada se apaga no BPO (R7)');
create policy bpo_entrega_excluir on public.bpo_entrega for delete using (escritorio_id = public.escritorio_atual());

create trigger tocar before update on public.bpo_volume for each row execute function public.tocar_atualizado_em();
alter table public.bpo_volume enable row level security;
alter table public.bpo_volume force row level security;
create policy bpo_volume_ler on public.bpo_volume for select using (escritorio_id = public.escritorio_atual());
create policy bpo_volume_inserir on public.bpo_volume for insert with check (escritorio_id = public.escritorio_atual());
create policy bpo_volume_atualizar on public.bpo_volume for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create trigger nunca_apagar before delete on public.bpo_volume for each row when (current_setting('heild.restaurando', true) is distinct from 'sim') execute function public.recusar_operacao('nada se apaga no BPO (R7)');
create policy bpo_volume_excluir on public.bpo_volume for delete using (escritorio_id = public.escritorio_atual());

create trigger tocar before update on public.bpo_convidado for each row execute function public.tocar_atualizado_em();
alter table public.bpo_convidado enable row level security;
alter table public.bpo_convidado force row level security;
create policy bpo_convidado_ler on public.bpo_convidado for select using (escritorio_id = public.escritorio_atual());
create policy bpo_convidado_inserir on public.bpo_convidado for insert with check (escritorio_id = public.escritorio_atual());
create policy bpo_convidado_atualizar on public.bpo_convidado for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create trigger nunca_apagar before delete on public.bpo_convidado for each row when (current_setting('heild.restaurando', true) is distinct from 'sim') execute function public.recusar_operacao('nada se apaga no BPO (R7)');
create policy bpo_convidado_excluir on public.bpo_convidado for delete using (escritorio_id = public.escritorio_atual());

-- A restauração da demonstração apaga em cascata: liga a marca que deixa as tabelas do BPO passarem.
create or replace function public.restaurar_demonstracao() returns void
language plpgsql security definer set search_path = public as $$
declare alvo text := public.escritorio_atual();
begin
  if alvo is null then raise exception 'Sem escritório na sessão' using errcode = '42501'; end if;
  perform set_config('heild.restaurando', 'sim', true);
  alter table public.evento disable trigger so_insercao;
  alter table public.registro_entrega disable trigger so_insercao;
  alter table public.mensagem_interna disable trigger nunca_apagar;
  delete from public.escritorio where id = alvo;
  alter table public.evento enable trigger so_insercao;
  alter table public.registro_entrega enable trigger so_insercao;
  alter table public.mensagem_interna enable trigger nunca_apagar;
  perform set_config('heild.restaurando', 'nao', true);
end $$;
revoke all on function public.restaurar_demonstracao() from public;
grant execute on function public.restaurar_demonstracao() to authenticated;

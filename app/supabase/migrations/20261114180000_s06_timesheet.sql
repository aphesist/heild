-- S06 · Timesheet (subplano 05; Fundações 5.4): as entidades novas do wireframe.
-- Espelho de app/src/nucleo/modelo/entidades.ts (seção "Timesheet"), no padrão da migração de fundações:
-- colunas comuns, chave (escritorio_id, id), RLS forçada pelo escritório do JWT e gatilho tocar.
-- Regras: sessão de trabalho e item de confirmação não se apagam no app (correção substitui:
-- substituida_por; item expira em 7 dias). A política de exclusão existe só para a restauração
-- da demonstração (restaurar_demonstracao apaga o escritório inteiro, em cascata).
-- Gerada em 14/11/2026 pela sessão S06. Migração nova: não edita a de fundações.

create table public.sessao_trabalho (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  ator_tipo text not null check (ator_tipo in ('pessoa','integrante')),
  ator_id text not null,
  usuario_dono_id text not null,
  cliente_id text,
  setor_id text not null,
  atividade_id text,
  rotulo text not null,
  tarefa_id text,
  conversa_id text,
  origem text not null check (origem in ('plataforma','core','extensao','artefato','confirmacao')),
  inicio timestamptz not null,
  fim timestamptz not null,
  confianca text not null check (confianca in ('automatica','estimada','confirmada','contestada')),
  evidencias jsonb not null default '[]',
  pacote text not null default 'contabil' check (pacote in ('contabil','bpo','juridico')),
  fora_da_jornada boolean,
  cortada_por_sessao_id text,
  substituida_por text,
  contestacao jsonb,
  anomalia jsonb,
  custo jsonb,
  ao_vivo boolean,
  check (fim >= inicio),
  primary key (escritorio_id, id)
);

create table public.item_confirmacao (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  usuario_id text,
  setor_id text,
  dia date not null,
  inicio timestamptz not null,
  fim timestamptz,
  tipo text not null check (tipo in ('buraco','portal','artefato','conflito','sem_pista','nao_era_esta','sessao_longa','foi_voce','espera')),
  texto text not null,
  pista text not null,
  sugestao jsonb,
  alternativa_cliente_id text,
  sessao_ref_id text,
  situacao text not null check (situacao in ('pendente','marcado','confirmado','descartado','expirado','atribuido')),
  resultado text,
  sessao_id text,
  atribuido_a text,
  expira_em timestamptz not null,
  primary key (escritorio_id, id)
);

create table public.ausencia (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  usuario_id text not null,
  tipo text not null check (tipo in ('ferias','licenca','atestado','folga','treinamento_externo')),
  inicio date not null,
  fim date not null,
  registrada_por text not null,
  substituto_id text,
  observacao text,
  check (fim >= inicio),
  primary key (escritorio_id, id)
);

create table public.custo_hora (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  competencia text not null,
  modo text not null check (modo in ('gastos','direto')),
  gastos jsonb not null default '[]',
  horas_produtivas numeric not null,
  valor numeric not null check (valor > 0),
  por_cargo boolean not null default false,
  fatores_cargo jsonb,
  por_pacote boolean not null default false,
  valor_bpo numeric,
  definido_por text not null,
  definido_por_nome text,
  primary key (escritorio_id, id)
);

create table public.vinculo_extensao (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  usuario_id text not null,
  termo_versao text,
  termo_aceito_em timestamptz,
  navegador text check (navegador in ('chrome','edge')),
  vinculada_em timestamptz,
  pausada_ate timestamptz,
  pausa_rotulo text,
  pausas jsonb not null default '[]',
  primary key (escritorio_id, id)
);

create table public.pulso_portal (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  usuario_id text not null,
  dia date not null,
  portal text not null,
  cliente_id text,
  metodo text not null check (metodo in ('url','titulo','identificacao','nenhum')),
  minutos integer not null default 0,
  primeiro timestamptz not null,
  ultimo timestamptz not null,
  tarefa_id text,
  primary key (escritorio_id, id)
);

create table public.portal_extensao (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  portal text not null,
  dominio text not null,
  leitura text not null,
  atividade_sugerida text not null,
  situacao text not null check (situacao in ('ativo','desligado','pedido')),
  pedido_por text,
  motivo text,
  versao integer not null default 1,
  primary key (escritorio_id, id)
);

create table public.conector_core (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  core text not null check (core in ('Alterdata','Domínio','Questor','Contmatic')),
  modo text not null,
  status text not null check (status in ('conectado','importacao','nao_conectado','erro')),
  detalhe text not null default '',
  ultima_leitura timestamptz,
  mapa_departamento jsonb not null default '[]',
  mapa_responsavel jsonb not null default '[]',
  primary key (escritorio_id, id)
);

create table public.equivalencia_core (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  core_sistema text not null,
  core_tipo_tarefa text not null,
  departamento text not null,
  ocorrencias integer not null default 0,
  sugestoes jsonb not null default '[]',
  atividade_id text,
  situacao text not null check (situacao in ('sem_equivalente','equivalente','nao_medido')),
  primary key (escritorio_id, id)
);

create table public.duracao_padrao (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  atividade_id text not null,
  rotulo text not null,
  catalogo_min numeric not null,
  mediana_min numeric not null,
  n integer not null default 0,
  adotada_min numeric,
  origem text not null check (origem in ('catalogo','calibracao','escritorio')),
  primary key (escritorio_id, id)
);

create table public.fechamento_timesheet (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  competencia text not null,
  cliente_id text not null,
  pacote text not null check (pacote in ('contabil','bpo','juridico')),
  horas numeric not null,
  horas_estimadas numeric not null default 0,
  honorario numeric,
  variaveis numeric not null default 0,
  custo_hora numeric not null,
  marcos jsonb not null default '[]',
  primary key (escritorio_id, id)
);

create index on public.sessao_trabalho (escritorio_id, usuario_dono_id, inicio);
create index on public.sessao_trabalho (escritorio_id, cliente_id, inicio);
create index on public.item_confirmacao (escritorio_id, usuario_id, dia);
create index on public.pulso_portal (escritorio_id, usuario_id, dia);
create index on public.fechamento_timesheet (escritorio_id, competencia);

create trigger tocar before update on public.sessao_trabalho for each row execute function public.tocar_atualizado_em();
alter table public.sessao_trabalho enable row level security;
alter table public.sessao_trabalho force row level security;
create policy sessao_trabalho_ler on public.sessao_trabalho for select using (escritorio_id = public.escritorio_atual());
create policy sessao_trabalho_inserir on public.sessao_trabalho for insert with check (escritorio_id = public.escritorio_atual());
create policy sessao_trabalho_atualizar on public.sessao_trabalho for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create policy sessao_trabalho_excluir on public.sessao_trabalho for delete using (escritorio_id = public.escritorio_atual());

create trigger tocar before update on public.item_confirmacao for each row execute function public.tocar_atualizado_em();
alter table public.item_confirmacao enable row level security;
alter table public.item_confirmacao force row level security;
create policy item_confirmacao_ler on public.item_confirmacao for select using (escritorio_id = public.escritorio_atual());
create policy item_confirmacao_inserir on public.item_confirmacao for insert with check (escritorio_id = public.escritorio_atual());
create policy item_confirmacao_atualizar on public.item_confirmacao for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create policy item_confirmacao_excluir on public.item_confirmacao for delete using (escritorio_id = public.escritorio_atual());

create trigger tocar before update on public.ausencia for each row execute function public.tocar_atualizado_em();
alter table public.ausencia enable row level security;
alter table public.ausencia force row level security;
create policy ausencia_ler on public.ausencia for select using (escritorio_id = public.escritorio_atual());
create policy ausencia_inserir on public.ausencia for insert with check (escritorio_id = public.escritorio_atual());
create policy ausencia_atualizar on public.ausencia for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create policy ausencia_excluir on public.ausencia for delete using (escritorio_id = public.escritorio_atual());

create trigger tocar before update on public.custo_hora for each row execute function public.tocar_atualizado_em();
alter table public.custo_hora enable row level security;
alter table public.custo_hora force row level security;
create policy custo_hora_ler on public.custo_hora for select using (escritorio_id = public.escritorio_atual());
create policy custo_hora_inserir on public.custo_hora for insert with check (escritorio_id = public.escritorio_atual());
create policy custo_hora_atualizar on public.custo_hora for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create policy custo_hora_excluir on public.custo_hora for delete using (escritorio_id = public.escritorio_atual());

create trigger tocar before update on public.vinculo_extensao for each row execute function public.tocar_atualizado_em();
alter table public.vinculo_extensao enable row level security;
alter table public.vinculo_extensao force row level security;
create policy vinculo_extensao_ler on public.vinculo_extensao for select using (escritorio_id = public.escritorio_atual());
create policy vinculo_extensao_inserir on public.vinculo_extensao for insert with check (escritorio_id = public.escritorio_atual());
create policy vinculo_extensao_atualizar on public.vinculo_extensao for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create policy vinculo_extensao_excluir on public.vinculo_extensao for delete using (escritorio_id = public.escritorio_atual());

create trigger tocar before update on public.pulso_portal for each row execute function public.tocar_atualizado_em();
alter table public.pulso_portal enable row level security;
alter table public.pulso_portal force row level security;
create policy pulso_portal_ler on public.pulso_portal for select using (escritorio_id = public.escritorio_atual());
create policy pulso_portal_inserir on public.pulso_portal for insert with check (escritorio_id = public.escritorio_atual());
create policy pulso_portal_atualizar on public.pulso_portal for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create policy pulso_portal_excluir on public.pulso_portal for delete using (escritorio_id = public.escritorio_atual());

create trigger tocar before update on public.portal_extensao for each row execute function public.tocar_atualizado_em();
alter table public.portal_extensao enable row level security;
alter table public.portal_extensao force row level security;
create policy portal_extensao_ler on public.portal_extensao for select using (escritorio_id = public.escritorio_atual());
create policy portal_extensao_inserir on public.portal_extensao for insert with check (escritorio_id = public.escritorio_atual());
create policy portal_extensao_atualizar on public.portal_extensao for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create policy portal_extensao_excluir on public.portal_extensao for delete using (escritorio_id = public.escritorio_atual());

create trigger tocar before update on public.conector_core for each row execute function public.tocar_atualizado_em();
alter table public.conector_core enable row level security;
alter table public.conector_core force row level security;
create policy conector_core_ler on public.conector_core for select using (escritorio_id = public.escritorio_atual());
create policy conector_core_inserir on public.conector_core for insert with check (escritorio_id = public.escritorio_atual());
create policy conector_core_atualizar on public.conector_core for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create policy conector_core_excluir on public.conector_core for delete using (escritorio_id = public.escritorio_atual());

create trigger tocar before update on public.equivalencia_core for each row execute function public.tocar_atualizado_em();
alter table public.equivalencia_core enable row level security;
alter table public.equivalencia_core force row level security;
create policy equivalencia_core_ler on public.equivalencia_core for select using (escritorio_id = public.escritorio_atual());
create policy equivalencia_core_inserir on public.equivalencia_core for insert with check (escritorio_id = public.escritorio_atual());
create policy equivalencia_core_atualizar on public.equivalencia_core for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create policy equivalencia_core_excluir on public.equivalencia_core for delete using (escritorio_id = public.escritorio_atual());

create trigger tocar before update on public.duracao_padrao for each row execute function public.tocar_atualizado_em();
alter table public.duracao_padrao enable row level security;
alter table public.duracao_padrao force row level security;
create policy duracao_padrao_ler on public.duracao_padrao for select using (escritorio_id = public.escritorio_atual());
create policy duracao_padrao_inserir on public.duracao_padrao for insert with check (escritorio_id = public.escritorio_atual());
create policy duracao_padrao_atualizar on public.duracao_padrao for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create policy duracao_padrao_excluir on public.duracao_padrao for delete using (escritorio_id = public.escritorio_atual());

create trigger tocar before update on public.fechamento_timesheet for each row execute function public.tocar_atualizado_em();
alter table public.fechamento_timesheet enable row level security;
alter table public.fechamento_timesheet force row level security;
create policy fechamento_timesheet_ler on public.fechamento_timesheet for select using (escritorio_id = public.escritorio_atual());
create policy fechamento_timesheet_inserir on public.fechamento_timesheet for insert with check (escritorio_id = public.escritorio_atual());
create policy fechamento_timesheet_atualizar on public.fechamento_timesheet for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create policy fechamento_timesheet_excluir on public.fechamento_timesheet for delete using (escritorio_id = public.escritorio_atual());

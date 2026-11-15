-- B5 · Fase F1 (docs/backend/IMPLEMENTACAO.md, B5). Por cima das migrações do wireframe, da
-- B1, da B2 e da B3, sem editá-las. Só para o Postgres local e o projeto novo em São Paulo:
-- NÃO aplicar no projeto do wireframe (HEILD-PROD), que grava pelo navegador.
--
--   1. Login de produção: `conta_auth` liga o usuário do Supabase Auth à conta do escritório,
--      e o gancho de token (`heild_interno.gancho_token`) põe escritório, conta e tipo em
--      `app_metadata` (STACK 3.2: "custom access token hook em SQL").
--   2. Cauda de mudanças (`mudanca`): cada linha gravada deixa (tabela, id, versão) na mesma
--      transação. É o que o SSE (`/v1/eventos/fluxo`) lê, e o que invalida o cache do perfil.
--   3. Registro de leituras (`evento_leitura`), particionado por mês, gravado em lote fora da
--      transação de leitura e selado por lote com o hash do lote anterior (STACK 8; P6).
--   4. Índices das consultas novas.

-- 1. Login de produção --------------------------------------------------------------------

create schema if not exists heild_interno;

create table public.conta_auth (
  auth_id uuid primary key,
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  tipo text not null check (tipo in ('equipe', 'cliente')),
  usuario_id text,
  cliente_id text,
  criado_em timestamptz not null default now(),
  constraint conta_auth_alvo check ((tipo = 'equipe' and usuario_id is not null and cliente_id is null) or (tipo = 'cliente' and cliente_id is not null and usuario_id is null))
);
create index conta_auth_usuario on public.conta_auth (escritorio_id, usuario_id);
alter table public.conta_auth enable row level security;
alter table public.conta_auth force row level security;
create policy conta_auth_ler on public.conta_auth for select to api_executor using (escritorio_id = public.escritorio_atual());
-- O navegador nunca lê nem grava; quem liga o login à conta é o fluxo do convite, pela API.
revoke all on public.conta_auth from anon, authenticated;

-- O papel do servidor do Auth no Supabase (no Postgres local, criado por 00_supabase_local.sql).
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'supabase_auth_admin') then
    execute 'create policy conta_auth_gancho on public.conta_auth for select to supabase_auth_admin using (true)';
    execute 'grant usage on schema heild_interno to supabase_auth_admin';
    execute 'grant select on public.conta_auth to supabase_auth_admin';
  end if;
end $$;

-- Gancho de token do Supabase Auth (Authentication > Hooks > Custom Access Token, apontando
-- para pg-functions://postgres/heild_interno/gancho_token). Sem vínculo, tira o escritório
-- das claims: a API recusa (CONTA_SEM_VINCULO) e a RLS não deixa ver nada.
create or replace function heild_interno.gancho_token(evento jsonb) returns jsonb
language plpgsql stable as $$
declare
  claims jsonb := coalesce(evento -> 'claims', '{}'::jsonb);
  meta jsonb := coalesce(claims -> 'app_metadata', '{}'::jsonb) - 'escritorio_id' - 'tipo' - 'usuario_id' - 'cliente_id';
  c public.conta_auth;
begin
  select * into c from public.conta_auth where auth_id = (evento ->> 'user_id')::uuid;
  if found then
    meta := meta || jsonb_strip_nulls(jsonb_build_object('escritorio_id', c.escritorio_id, 'tipo', c.tipo, 'usuario_id', c.usuario_id, 'cliente_id', c.cliente_id));
  end if;
  return jsonb_build_object('claims', jsonb_set(claims, '{app_metadata}', meta));
end $$;
revoke all on function heild_interno.gancho_token(jsonb) from public;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'supabase_auth_admin') then
    execute 'grant execute on function heild_interno.gancho_token(jsonb) to supabase_auth_admin';
  end if;
end $$;

-- 2. Cauda de mudanças --------------------------------------------------------------------

create table public.mudanca (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  versao bigint not null,
  tabela text not null,
  id text not null,
  gravada_em timestamptz not null default now(),
  primary key (escritorio_id, versao)
);
create index mudanca_limpeza on public.mudanca (gravada_em);
alter table public.mudanca enable row level security;
alter table public.mudanca force row level security;
create policy mudanca_ler on public.mudanca for select using (escritorio_id = public.escritorio_atual());
create policy mudanca_inserir on public.mudanca for insert with check (escritorio_id = public.escritorio_atual());
revoke all on public.mudanca from anon, authenticated;
grant select, insert on public.mudanca to api_executor;

-- Gatilho por comando (tabelas de transição): uma inserção em lote por comando, não por linha.
create or replace function public.anotar_mudanca() returns trigger
language plpgsql as $$
begin
  execute format('insert into public.mudanca (escritorio_id, versao, tabela, id) select escritorio_id, versao_linha, %L, id from novas on conflict do nothing', tg_table_name);
  return null;
end $$;

do $$
declare t text;
begin
  for t in
    select c.table_name from information_schema.columns c
    join information_schema.tables x on x.table_schema = c.table_schema and x.table_name = c.table_name and x.table_type = 'BASE TABLE'
    where c.table_schema = 'public' and c.column_name = 'versao_linha'
      and c.table_name not in ('remocao', 'mudanca')
  loop
    execute format('create trigger mudanca_inserir after insert on public.%I referencing new table as novas for each statement execute function public.anotar_mudanca()', t);
    if t not in ('evento', 'registro_entrega') then
      execute format('create trigger mudanca_atualizar after update on public.%I referencing new table as novas for each statement execute function public.anotar_mudanca()', t);
    end if;
  end loop;
end $$;

-- A cauda só precisa dos últimos dias (o SSE lê o que acabou de mudar; quem ficou fora
-- mais que isso relê pelo `sincronizar`). Roda no worker, com papel de manutenção.
create or replace function heild_interno.limpar_mudancas(guardar interval default interval '2 days') returns bigint
language sql as $$
  with apagadas as (delete from public.mudanca where gravada_em < now() - guardar returning 1)
  select count(*) from apagadas
$$;

-- 3. Registro de leituras -----------------------------------------------------------------

create table public.evento_leitura (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id bigint generated always as identity,
  lido_em timestamptz not null,
  lote bigint not null,
  ator_tipo text not null check (ator_tipo in ('pessoa', 'integrante', 'pessoa_cliente', 'sistema')),
  ator_id text,
  sessao_auth_id text,
  ferramenta text not null,
  tabela text,
  ids text[] not null default '{}',
  quantidade integer not null check (quantidade >= 0),
  filtros jsonb,
  primary key (escritorio_id, lido_em, id)
) partition by range (lido_em);
create table public.evento_leitura_padrao partition of public.evento_leitura default;
create index evento_leitura_por_lote on public.evento_leitura (escritorio_id, lote);
create index evento_leitura_por_ator on public.evento_leitura (escritorio_id, ator_id, lido_em desc);

-- Um selo por lote, encadeado por escritório (como o elo do evento, mas sem travar a cadeia principal).
create table public.selo_leitura (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  lote bigint not null,
  quantidade integer not null,
  hash_anterior bytea not null,
  hash bytea not null,
  selado_em timestamptz not null default now(),
  primary key (escritorio_id, lote)
);

do $$
declare t text;
begin
  foreach t in array array['evento_leitura', 'selo_leitura'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('alter table public.%I force row level security', t);
    execute format('create policy %I on public.%I for select using (escritorio_id = public.escritorio_atual())', t || '_ler', t);
    execute format('create policy %I on public.%I for insert with check (escritorio_id = public.escritorio_atual())', t || '_inserir', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
    execute format('grant select, insert on public.%I to api_executor', t);
    -- Só de inserção: o registro de quem leu não se reescreve nem se apaga (fora da restauração da demonstração).
    execute format('create trigger so_insercao before update or delete on public.%I for each row when (current_setting(''heild.restaurando'', true) is distinct from ''sim'') execute function public.recusar_operacao(%L)', t, t || ' é só de inserção');
  end loop;
end $$;

-- Partição de um mês (o worker cria a do mês seguinte; a padrão segura o que chegar antes).
create or replace function heild_interno.criar_particao_leitura(mes date) returns void
language plpgsql as $$
declare
  inicio date := date_trunc('month', mes)::date;
  nome text := 'evento_leitura_' || to_char(inicio, 'YYYY_MM');
begin
  if to_regclass('public.' || nome) is null then
    execute format('create table public.%I partition of public.evento_leitura for values from (%L) to (%L)', nome, inicio, (inicio + interval '1 month')::date);
  end if;
end $$;
select heild_interno.criar_particao_leitura(current_date);
select heild_interno.criar_particao_leitura((current_date + interval '1 month')::date);

-- 4. Índices das consultas novas ----------------------------------------------------------

-- Listas por cursor (ferramentas *.listar e useConsulta): (escritório, filtro, criado_em desc, id desc).
create index if not exists mensagem_interna_por_conversa on public.mensagem_interna (escritorio_id, conversa_interna_id, criado_em desc, id desc);
create index if not exists tarefa_por_setor_status on public.tarefa (escritorio_id, setor_id, status, criado_em desc, id desc);
create index if not exists tarefa_por_cliente on public.tarefa (escritorio_id, cliente_id, criado_em desc, id desc);
create index if not exists evento_por_cliente_seq on public.evento (escritorio_id, cliente_id, seq desc);
create index if not exists cartao_por_status on public.cartao_aprovacao (escritorio_id, status, criado_em desc, id desc);
create index if not exists notificacao_recentes on public.notificacao (escritorio_id, criado_em desc, id desc);
-- A ficha de um registro (a tarefa, o lote) lê os eventos dele pelo `resultado_ref` (evento.listar).
create index if not exists evento_por_ref on public.evento (escritorio_id, resultado_ref, seq desc) where resultado_ref is not null;

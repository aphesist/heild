-- Esquema mínimo no padrão da migração de fundações (RLS forçada pelo escritório do JWT).
create schema if not exists auth;
create or replace function auth.jwt() returns jsonb language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $$;
create or replace function public.escritorio_atual() returns text language sql stable as $$
  select nullif(auth.jwt() -> 'app_metadata' ->> 'escritorio_id', '') $$;
do $$ begin
  if not exists (select from pg_roles where rolname='authenticated') then create role authenticated nologin; end if;
  if not exists (select from pg_roles where rolname='app_api') then create role app_api login noinherit; end if;
end $$;
grant authenticated to app_api;

create table tarefa (
  escritorio_id text not null, id text not null,
  criado_em timestamptz not null default now(), atualizado_em timestamptz not null default now(),
  titulo text not null, cliente_id text not null, setor_id text not null, atividade_id text not null,
  status text not null, responsavel_id text, prazo_interno date not null, prazo_legal date,
  extras jsonb, primary key (escritorio_id, id));
create index tarefa_setor on tarefa (escritorio_id, setor_id, status, prazo_interno);

create table evento (
  escritorio_id text not null, seq bigint not null, id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(), nome text not null, ator_tipo text not null, ator_id text,
  cliente_id text, setor_id text, ferramenta text not null, nivel text not null, argumentos_resumo jsonb,
  resultado text not null, resultado_ref text, origem text not null, texto text not null,
  hash_anterior bytea not null, hash bytea not null, primary key (escritorio_id, seq));

create table cadeia_evento (escritorio_id text primary key, seq bigint not null, ultimo_hash bytea not null);

alter table tarefa enable row level security; alter table tarefa force row level security;
alter table evento enable row level security; alter table evento force row level security;
alter table cadeia_evento enable row level security; alter table cadeia_evento force row level security;
create policy t_ler on tarefa for select to authenticated using (escritorio_id = escritorio_atual());
create policy t_mudar on tarefa for update to authenticated using (escritorio_id = escritorio_atual()) with check (escritorio_id = escritorio_atual());
create policy e_ler on evento for select to authenticated using (escritorio_id = escritorio_atual());
create policy e_inserir on evento for insert to authenticated with check (escritorio_id = escritorio_atual());
create policy c_ler on cadeia_evento for select to authenticated using (escritorio_id = escritorio_atual());
create policy c_mudar on cadeia_evento for update to authenticated using (escritorio_id = escritorio_atual()) with check (escritorio_id = escritorio_atual());
grant select, update on tarefa, cadeia_evento to authenticated;
grant select, insert on evento to authenticated;

-- O que o Supabase já traz e um Postgres comum não tem: os papéis e o esquema auth.
-- Só para o Postgres LOCAL (servidor/scripts/pg-local.sh); no Supabase isso já existe
-- e este arquivo não é aplicado. Assim as migrações de app/supabase/migrations rodam
-- sem mudança nos dois lugares.

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin noinherit; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin noinherit; end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then create role service_role nologin noinherit bypassrls; end if;
end $$;

create schema if not exists auth;
grant usage on schema auth to anon, authenticated, service_role;

-- As mesmas funções do Supabase: leem as claims que a API fixa em cada transação.
create or replace function auth.jwt() returns jsonb
language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb
$$;
create or replace function auth.uid() returns uuid
language sql stable as $$
  select null::uuid
$$;
create or replace function auth.role() returns text
language sql stable as $$
  select coalesce(auth.jwt() ->> 'role', 'anon')
$$;

-- Privilégios padrão do Supabase no esquema public (a migração do B1 fecha a escrita do navegador).
grant usage on schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;

-- O papel do servidor do Auth (GoTrue). No Supabase ele já existe; aqui, para o gancho de
-- token da B5 (heild_interno.gancho_token) ter as mesmas permissões que terá no projeto.
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'supabase_auth_admin') then create role supabase_auth_admin nologin noinherit; end if;
end $$;

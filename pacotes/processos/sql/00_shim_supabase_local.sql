-- Só para o Postgres local (sem Supabase): o mínimo que o Supabase já traz pronto.
-- auth.jwt() lê request.jwt.claims (o mesmo que a API fixa por transação, STACK 3.1),
-- os papéis anon/authenticated e os privilégios padrão que o Supabase concede ao authenticated.
create schema if not exists auth;
create or replace function auth.jwt() returns jsonb language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $$;
do $$ begin
  if not exists (select from pg_roles where rolname = 'anon') then create role anon nologin; end if;
  if not exists (select from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
end $$;
grant usage on schema public to anon, authenticated;
alter default privileges in schema public grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public grant usage, select on sequences to authenticated;
alter default privileges in schema public grant execute on functions to authenticated;
grant usage on schema auth to anon, authenticated;
grant execute on function auth.jwt() to anon, authenticated;

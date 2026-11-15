-- Reverter o esquema do backend no projeto Supabase do backend (HEILD-BACKEND).
--
-- Só para o projeto do backend, e só enquanto ele não tiver dado real: apaga TUDO o que as
-- migrações e a semente criaram no `public` e o registro da ferramenta, e volta os
-- privilégios padrão do Supabase. Nunca no HEILD-PROD (wireframe).
--
-- Antes: confira o projeto (`select current_database()`, painel › Settings › General) e,
-- se houver o que guardar, um backup (painel › Database › Backups).

begin;

-- O que a ferramenta e o worker criaram fora do public.
drop schema if exists heild_interno cascade;
drop schema if exists pgboss cascade;

-- O esquema do app inteiro (tabelas, funções, gatilhos, políticas e sequências).
drop schema public cascade;
create schema public;
alter schema public owner to pg_database_owner;

-- Os privilégios padrão do Supabase no public.
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on all tables in schema public to postgres, anon, authenticated, service_role;
grant all on all functions in schema public to postgres, anon, authenticated, service_role;
grant all on all sequences in schema public to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to postgres, anon, authenticated, service_role;

-- Os papéis da B1.
drop role if exists app_api;
drop role if exists api_executor;

commit;

-- Depois, no painel (ou pela API de gestão): desligar o gancho de token
-- (Authentication › Hooks › Custom Access Token), que apontava para heild_interno.gancho_token.

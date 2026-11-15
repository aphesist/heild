-- B5 · Decisões do Enzo de 15/11/2026 (docs/backend/IMPLEMENTACAO.md, B5, "Decisões a, b e c").
-- Por cima das migrações anteriores, sem editá-las. Só para o Postgres local e o HEILD-BACKEND:
-- NÃO aplicar no projeto do wireframe (HEILD-PROD).
--
--   a) Aprovar um cartão do executor executa o comando guardado. O cartão guarda o que a pessoa
--      alterou antes de aprovar (`argumentos_editados`; Fundações 6.4, adendo de 15/11) e a
--      resposta da execução (`resposta`), que o duplo clique recebe de novo sem executar outra vez.

alter table public.cartao_aprovacao add column if not exists argumentos_editados jsonb;
alter table public.cartao_aprovacao add column if not exists resposta jsonb;

--   b) Contas da equipe, dois caminhos (os dois ligam o login ao cadastro em `conta_auth`):
--      (1) convite por e-mail pelo Supabase Auth;
--      (2) o Administrador cria a conta só com o e-mail, sem e-mail enviado, e o primeiro acesso
--          exige um código de uso único: vale 48 h, é mostrado só ao Administrador, que o entrega
--          à pessoa; dá para gerar outro e para revogar. O código só existe como hash.

create table public.codigo_primeiro_acesso (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  usuario_id text not null,
  auth_id uuid not null,
  codigo_hash text not null unique,
  expira_em timestamptz not null,
  usado_em timestamptz,
  revogado_em timestamptz,
  criado_por text not null,
  primary key (escritorio_id, id)
);
create index codigo_por_usuario on public.codigo_primeiro_acesso (escritorio_id, usuario_id);
alter table public.codigo_primeiro_acesso enable row level security;
alter table public.codigo_primeiro_acesso force row level security;
create policy codigo_ler on public.codigo_primeiro_acesso for select to api_executor using (escritorio_id = public.escritorio_atual());
create policy codigo_inserir on public.codigo_primeiro_acesso for insert to api_executor with check (escritorio_id = public.escritorio_atual());
create policy codigo_atualizar on public.codigo_primeiro_acesso for update to api_executor using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
revoke all on public.codigo_primeiro_acesso from anon, authenticated;
grant select, insert, update on public.codigo_primeiro_acesso to api_executor;

-- O primeiro acesso chega sem sessão (a pessoa ainda não tem senha): achar o código pelo hash
-- atravessa escritórios, e só por esta função, que devolve a linha daquele hash e nada mais.
create or replace function heild_interno.codigo_por_hash(h text)
returns table (escritorio_id text, id text, usuario_id text, auth_id uuid, expira_em timestamptz, usado_em timestamptz, revogado_em timestamptz)
language sql stable security definer set search_path = public as $$
  select c.escritorio_id, c.id, c.usuario_id, c.auth_id, c.expira_em, c.usado_em, c.revogado_em
  from public.codigo_primeiro_acesso c where c.codigo_hash = h
$$;
revoke all on function heild_interno.codigo_por_hash(text) from public;
grant usage on schema heild_interno to api_executor;
grant execute on function heild_interno.codigo_por_hash(text) to api_executor;

-- A API liga o login ao cadastro (convite e criação manual), só no escritório da sessão.
create policy conta_auth_inserir on public.conta_auth for insert to api_executor with check (escritorio_id = public.escritorio_atual());
grant select, insert on public.conta_auth to api_executor;

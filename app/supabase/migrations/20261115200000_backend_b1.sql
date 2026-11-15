-- Backend B1 (branch `backend`): o banco do backend real, por cima das migrações do wireframe.
-- Desenho em docs/backend/STACK.md (3.3 e 8) e docs/backend/IMPLEMENTACAO.md (seção B1).
--
--   1. Só a API grava: o papel `api_executor` (assumido pela API em cada transação, sem
--      BYPASSRLS) escreve; `anon` e `authenticated` (o navegador, pela Data API do Supabase)
--      perdem insert, update e delete. A RLS por escritório continua: é a segunda barreira.
--   2. Cadeia de hash por escritório no evento: `seq`, `hash_anterior`, `hash` e o elo
--      `cadeia_evento` (travado com FOR UPDATE na transação do efeito). O hash é calculado
--      na aplicação, com a canonização de pacotes/dominio (a mesma que verifica).
--   3. Idempotência: `idempotencia (escritorio_id, chave)` gravada na mesma transação do efeito.
--   4. Versão de linha para sincronizar (`versao_linha`, de uma sequência só; `versao` já é
--      dado de negócio em documento, contrato e política) e `remocao` para o que
--      a API exclui de vez (só onde a regra da entidade deixa).
--   5. Segunda barreira das regras de imutabilidade: as entidades centrais não se apagam
--      (fora da restauração da demonstração) e cartão decidido não muda de decisão.
--
-- NÃO aplicar no projeto Supabase do wireframe (us-east-1): o adaptador `supabase` do
-- wireframe grava direto pelo navegador e pararia de funcionar. Esta migração é do projeto
-- novo do backend (e do Postgres local: servidor/scripts/pg-local.sh).

-- 1. Papéis e privilégios ------------------------------------------------------------------

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'api_executor') then
    create role api_executor nologin nobypassrls inherit;
  end if;
end $$;
-- Herda de `authenticated` o uso do esquema auth (auth.jwt() nas políticas) e o que o
-- Supabase der ao papel logado; a escrita nas tabelas vem só dos grants abaixo.
grant authenticated to api_executor;

grant usage on schema public to api_executor;
grant select, insert, update, delete on all tables in schema public to api_executor;
grant usage, select on all sequences in schema public to api_executor;
alter default privileges in schema public grant select, insert, update, delete on tables to api_executor;
alter default privileges in schema public grant usage, select on sequences to api_executor;

-- O navegador só lê (e, em produção, nem isso: a Data API fica desligada no projeto).
revoke insert, update, delete, truncate on all tables in schema public from anon, authenticated;
alter default privileges in schema public revoke insert, update, delete, truncate on tables from anon, authenticated;

-- 2. Cadeia de hash do evento --------------------------------------------------------------

alter table public.evento
  add column seq bigint,
  add column hash_anterior bytea,
  add column hash bytea,
  add column ferramenta_versao integer,
  add column sessao_auth_id text,
  add column aprovacao_id text,
  add column causado_por_evento_id text,
  add column idempotencia_chave text;

create unique index evento_seq_por_escritorio on public.evento (escritorio_id, seq);
create index evento_por_seq on public.evento (escritorio_id, seq desc);

-- Evento da cadeia tem os três campos juntos (o que não tem é anterior ao backend).
alter table public.evento add constraint evento_cadeia_completa
  check ((seq is null and hash is null and hash_anterior is null) or (seq is not null and hash is not null and hash_anterior is not null and seq > 0));

create table public.cadeia_evento (
  escritorio_id text primary key references public.escritorio (id) on delete cascade,
  seq bigint not null default 0 check (seq >= 0),
  hash bytea not null,
  atualizado_em timestamptz not null default now()
);
alter table public.cadeia_evento enable row level security;
alter table public.cadeia_evento force row level security;
create policy cadeia_evento_ler on public.cadeia_evento for select using (escritorio_id = public.escritorio_atual());
create policy cadeia_evento_inserir on public.cadeia_evento for insert with check (escritorio_id = public.escritorio_atual());
create policy cadeia_evento_atualizar on public.cadeia_evento for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
-- O elo só anda para a frente.
create or replace function public.cadeia_so_avanca() returns trigger
language plpgsql as $$
begin
  if new.seq < old.seq then
    raise exception 'A cadeia de eventos só avança (seq % → %)', old.seq, new.seq using errcode = '42501';
  end if;
  new.atualizado_em := now();
  return new;
end $$;
create trigger so_avanca before update on public.cadeia_evento for each row execute function public.cadeia_so_avanca();
create trigger nunca_apagar before delete on public.cadeia_evento for each row
  when (current_setting('heild.restaurando', true) is distinct from 'sim')
  execute function public.recusar_operacao('a cadeia de eventos não se apaga (Fundações 5.2)');

-- 3. Idempotência --------------------------------------------------------------------------

create table public.idempotencia (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  chave text not null check (length(chave) between 8 and 200),
  ferramenta text not null,
  hash_argumentos text not null,
  usuario_id text,
  status_http integer,
  resposta jsonb,
  criado_em timestamptz not null default now(),
  primary key (escritorio_id, chave)
);
create index idempotencia_limpeza on public.idempotencia (criado_em);
alter table public.idempotencia enable row level security;
alter table public.idempotencia force row level security;
create policy idempotencia_ler on public.idempotencia for select using (escritorio_id = public.escritorio_atual());
create policy idempotencia_inserir on public.idempotencia for insert with check (escritorio_id = public.escritorio_atual());
create policy idempotencia_atualizar on public.idempotencia for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());

-- 4. Versão de linha e remoções ------------------------------------------------------------

create sequence public.versao_linha;
grant usage, select on sequence public.versao_linha to api_executor;

create or replace function public.marcar_versao() returns trigger
language plpgsql as $$
begin
  new.versao_linha := nextval('public.versao_linha');
  return new;
end $$;

do $$
declare t text;
begin
  for t in
    select c.table_name from information_schema.columns c
    join information_schema.tables x on x.table_schema = c.table_schema and x.table_name = c.table_name and x.table_type = 'BASE TABLE'
    where c.table_schema = 'public' and c.column_name = 'escritorio_id'
      and c.table_name not in ('cadeia_evento', 'idempotencia')
  loop
    execute format('alter table public.%I add column versao_linha bigint not null default nextval(''public.versao_linha'')', t);
    execute format('create index %I on public.%I (escritorio_id, versao_linha)', t || '_versao_linha', t);
    -- evento e registro_entrega não aceitam update (gatilho so_insercao): a versão vem do padrão.
    if t not in ('evento', 'registro_entrega') then
      execute format('create trigger versao_linha before update on public.%I for each row execute function public.marcar_versao()', t);
    end if;
  end loop;
end $$;

create table public.remocao (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  tabela text not null,
  id text not null,
  versao_linha bigint not null default nextval('public.versao_linha'),
  removido_em timestamptz not null default now(),
  evento_id text,
  primary key (escritorio_id, versao_linha)
);
alter table public.remocao enable row level security;
alter table public.remocao force row level security;
create policy remocao_ler on public.remocao for select using (escritorio_id = public.escritorio_atual());
create policy remocao_inserir on public.remocao for insert with check (escritorio_id = public.escritorio_atual());

-- 5. Imutabilidade, segunda barreira -------------------------------------------------------

-- Entidades centrais não se apagam (Fundações R7: arquivam, cancelam ou resolvem). A primeira
-- barreira é a regra `exclusao: 'proibida'` do repositório, que a API executa.
do $$
declare t text;
begin
  foreach t in array array['escritorio','pessoa','usuario','setor','cliente','versao_perfil','obrigacao','tarefa','lead',
                           'conversa','mensagem','documento','cartao_aprovacao','integrante','conversa_interna','participacao']
  loop
    execute format(
      'create trigger nada_se_apaga before delete on public.%I for each row when (current_setting(''heild.restaurando'', true) is distinct from ''sim'') execute function public.recusar_operacao(%L)',
      t, t || ' não se apaga: arquive, cancele ou resolva (Fundações R7)');
  end loop;
end $$;

-- Decisão humana com autor e data: cartão decidido não volta a pendente nem troca de decisão.
create or replace function public.cartao_decisao_final() returns trigger
language plpgsql as $$
begin
  if old.decidido_em is not null and (
       new.status is distinct from old.status or new.decidido_por is distinct from old.decidido_por
       or new.decidido_em is distinct from old.decidido_em) then
    raise exception 'O cartão % já foi decidido por % em %', old.id, old.decidido_por, old.decidido_em using errcode = '42501';
  end if;
  return new;
end $$;
create trigger decisao_final before update on public.cartao_aprovacao for each row execute function public.cartao_decisao_final();

-- Restaurar a demonstração: a mesma de antes (S08), agora também para o api_executor.
-- O executor da API só chama esta função com HEILD_DEMONSTRACAO=1.
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
grant execute on function public.restaurar_demonstracao() to authenticated, api_executor;

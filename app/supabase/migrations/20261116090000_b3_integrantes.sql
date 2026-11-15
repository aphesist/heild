-- B3 · Integrantes dos setores sobre o motor da B2 (docs/backend/IMPLEMENTACAO.md, B3).
--   * Centavos com frações (numeric(18,6)): a bolsa debita o custo real de cada chamada, sem
--     arredondar para o centavo de cima (o teste real de 15/11 debitou ~60% a mais por isso).
--   * Modo sombra na execução (decisão 8): o integrante roda em paralelo à pessoa, sem efeito.
--   * pedido_assistente: o pedido do chat ao Assistente, a decisão de roteamento (camada, setor,
--     procedimento, confiança, custo) e a execução que ele abriu. Cada decisão também vai à cadeia.
--   * comparacao_sombra: o que o integrante teria feito contra o que a pessoa fez de fato.
-- Gerado em 16/11/2026 pela sessão B3 do backend.

alter table public.procedimento_config alter column limite_centavos_execucao type numeric(18,6);
alter table public.execucao alter column orcamento_centavos type numeric(18,6);
alter table public.execucao alter column gasto_centavos type numeric(18,6);
alter table public.passo_execucao alter column custo_centavos type numeric(18,6);
alter table public.bolsa_setor alter column saldo_centavos type numeric(18,6);
alter table public.bolsa_setor alter column gasto_centavos type numeric(18,6);
alter table public.chamada_modelo alter column centavos type numeric(18,6);
alter table public.reserva_orcamento alter column centavos type numeric(18,6);

alter table public.execucao add column sombra boolean not null default false;
create index execucao_sombra on public.execucao (escritorio_id, procedimento_id, criado_em desc) where sombra;

-- O pedido do chat ao Assistente (AGENTICO 12; decisões 4 e 7). O texto fica sob RLS, como a
-- mensagem do chat; o evento na cadeia leva só o hash e o tamanho.
create table public.pedido_assistente (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default ('pa' || replace(gen_random_uuid()::text, '-', '')),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  solicitante_id text not null,
  texto text not null check (length(texto) between 1 and 4000),
  texto_hash text not null,
  anexos jsonb not null default '{}',
  chave_idempotencia text not null,
  estado text not null check (estado in ('roteando','encaminhado','pergunta','sem_procedimento','negado','falhou')),
  -- Decisão de roteamento (a final); `tentativas` guarda cada camada que rodou.
  camada text check (camada in ('regra','modelo_barato','modelo_caro')),
  setor text,
  procedimento_id text,
  confianca numeric(4,3),
  motivo text,
  tentativas jsonb not null default '[]',
  centavos numeric(18,6) not null default 0,
  execucao_id text,
  erro jsonb,
  primary key (escritorio_id, id),
  unique (escritorio_id, chave_idempotencia)
);
create index pedido_assistente_pessoa on public.pedido_assistente (escritorio_id, solicitante_id, criado_em desc);

-- Modo sombra: a comparação com a pessoa (decisão 8). Uma linha por execução sombra.
create table public.comparacao_sombra (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  execucao_id text not null,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  setor text not null,
  procedimento_id text not null,
  referencia text not null,
  obtido text,
  pessoa text,
  resultado text check (resultado in ('acerto','erro_critico','cartao','falha')),
  centavos numeric(18,6) not null default 0,
  primary key (escritorio_id, execucao_id),
  unique (escritorio_id, procedimento_id, referencia),
  foreign key (escritorio_id, execucao_id) references public.execucao (escritorio_id, id) on delete cascade
);
create index comparacao_sombra_setor on public.comparacao_sombra (escritorio_id, setor, criado_em desc);

create trigger tocar before update on public.pedido_assistente for each row execute function public.tocar_atualizado_em();
create trigger tocar before update on public.comparacao_sombra for each row execute function public.tocar_atualizado_em();

do $$
declare t text;
begin
  foreach t in array array['pedido_assistente','comparacao_sombra'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('alter table public.%I force row level security', t);
    execute format('create policy %I on public.%I for select using (escritorio_id = public.escritorio_atual())', t || '_ler', t);
    execute format('create policy %I on public.%I for insert with check (escritorio_id = public.escritorio_atual())', t || '_inserir', t);
    execute format('create policy %I on public.%I for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual())', t || '_atualizar', t);
  end loop;
end $$;

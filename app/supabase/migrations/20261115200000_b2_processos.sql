-- B2 · Motor de procedimentos, fila dos integrantes e runner de operários (AGENTICO.md 4.2 a 4.6).
-- O estado de cada processo é dado do domínio: execucao e passo_execucao, sob RLS por escritório,
-- na mesma transação do efeito, do evento e do job do pg-boss (o pg-boss cria o próprio esquema
-- `pgboss` ao subir; não é tocado aqui).
-- Regras no banco (segunda barreira; a primeira é o motor e a função autorizar):
--   * passo_execucao é único por (execucao, ordem, tentativa): o checkpoint não duplica;
--   * chamada_modelo é única por chave: retentativa do runner não debita duas vezes;
--   * a bolsa do setor nunca fica negativa (check), e o débito é condicional ao saldo;
--   * efeito_externo é único pela chave natural (cliente, processo, competência...): nada sai duas vezes;
--   * chamada_modelo, passo_execucao concluído e efeito confirmado não se apagam.
-- Gerado em 15/11/2026 pela sessão B2 do backend.

-- Versões publicadas dos procedimentos (da plataforma, sem escritório): gravadas no boot do worker.
create table public.procedimento_versao (
  id text not null,
  versao integer not null,
  hash text not null,
  setor text not null,
  operacao text not null,
  nivel_maximo text not null check (nivel_maximo in ('ler','rascunhar','executar')),
  passos jsonb not null,
  publicado_em timestamptz not null default now(),
  primary key (id, versao)
);

-- Configuração por escritório: ativo, "executa sozinho" (Fundações 4.6) e limite de custo.
create table public.procedimento_config (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  procedimento_id text not null,
  ativo boolean not null default true,
  executa_sozinho boolean not null default false,
  limite_centavos_execucao integer,
  atualizado_em timestamptz not null default now(),
  primary key (escritorio_id, procedimento_id)
);

-- Limites de execuções simultâneas (AGENTICO 4.6). Sem linha, valem os padrões do motor.
create table public.limite_execucao (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  escopo text not null check (escopo in ('escritorio','setor','pessoa_segundo_plano')),
  chave text not null default '*',
  maximo integer not null check (maximo >= 0),
  primary key (escritorio_id, escopo, chave)
);

create table public.execucao (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default ('ex' || replace(gen_random_uuid()::text, '-', '')),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  procedimento_id text not null,
  versao integer not null,
  setor text not null,
  cliente_id text,
  tarefa_id text,
  entrada jsonb not null,
  hash_entrada text not null,
  saida jsonb,
  estado text not null check (estado in ('pendente','executando','aguardando_operario','aguardando_externo','aguardando_cartao','parcial','concluida','falhou','cancelada')),
  passo_atual integer not null default 0,
  passo_nome text,
  tentativa_passo integer not null default 0,
  -- Quem pediu e em nome de quem a execução age.
  ator_tipo text not null check (ator_tipo in ('pessoa','integrante','sistema')),
  ator_id text,
  ator_nome text,
  solicitante_id text,
  responsavel_id text,
  integrante_id text,
  origem text not null check (origem in ('tela','chat','job','evento','mcp')),
  prioridade integer not null,
  segundo_plano boolean not null default false,
  causado_por_evento_id text,
  pagador_tipo text not null check (pagador_tipo in ('bolsa_setor','usuario')),
  pagador_id text,
  orcamento_centavos integer not null,
  orcamento_tokens integer not null,
  gasto_centavos integer not null default 0,
  gasto_tokens integer not null default 0,
  chave_idempotencia text not null,
  cartao_id text,
  contexto jsonb not null default '{}',
  erro jsonb,
  admitida_em timestamptz,
  concluida_em timestamptz,
  primary key (escritorio_id, id),
  unique (escritorio_id, chave_idempotencia),
  constraint execucao_gasto_no_orcamento check (gasto_centavos <= orcamento_centavos)
);
create index execucao_fila on public.execucao (escritorio_id, prioridade desc, criado_em) where estado = 'pendente';
create index execucao_rodando on public.execucao (escritorio_id, setor) where estado = 'executando';
create index execucao_cliente on public.execucao (escritorio_id, cliente_id, criado_em desc);

create table public.passo_execucao (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default ('pe' || replace(gen_random_uuid()::text, '-', '')),
  execucao_id text not null,
  ordem integer not null,
  nome text not null,
  tipo text not null check (tipo in ('deterministico','operario','validar','aprovacao','externo','efeito','concluir')),
  tentativa integer not null default 0,
  estado text not null check (estado in ('concluido','falhou','aguardando')),
  saida jsonb,
  validadores jsonb,
  custo_centavos integer not null default 0,
  inicio timestamptz not null default now(),
  fim timestamptz,
  evento_id text,
  primary key (escritorio_id, id),
  unique (escritorio_id, execucao_id, ordem, tentativa),
  foreign key (escritorio_id, execucao_id) references public.execucao (escritorio_id, id) on delete cascade
);

-- Bolsa do setor por mês (decisão 5): o runner debita cada chamada e confere o saldo antes.
create table public.bolsa_setor (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  setor text not null,
  mes text not null check (mes ~ '^\d{4}-\d{2}$'),
  saldo_centavos integer not null check (saldo_centavos >= 0),
  gasto_centavos integer not null default 0,
  atualizado_em timestamptz not null default now(),
  primary key (escritorio_id, setor, mes),
  constraint bolsa_nunca_negativa check (gasto_centavos <= saldo_centavos)
);

create table public.chamada_modelo (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default ('cm' || replace(gen_random_uuid()::text, '-', '')),
  criado_em timestamptz not null default now(),
  chave text not null,
  execucao_id text not null,
  passo_ordem integer not null,
  tentativa integer not null,
  contrato text not null,
  contrato_versao integer not null,
  classe text not null check (classe in ('operario','escritor','revisor')),
  fornecedor text not null,
  modelo text not null,
  tokens_entrada integer not null default 0,
  tokens_saida integer not null default 0,
  tokens_cache integer not null default 0,
  centavos integer not null default 0,
  latencia_ms integer not null default 0,
  saida_valida boolean not null,
  erro_validacao jsonb,
  setor text not null,
  pagador_tipo text not null check (pagador_tipo in ('bolsa_setor','usuario')),
  pagador_id text,
  primary key (escritorio_id, id),
  unique (escritorio_id, chave),
  foreign key (escritorio_id, execucao_id) references public.execucao (escritorio_id, id) on delete cascade
);

-- Reserva de orçamento feita ANTES da chamada ao modelo (pela estimativa) e acertada depois pelo
-- custo real. Se o runner cair no meio, a retentativa reaproveita a mesma reserva (mesma chave).
create table public.reserva_orcamento (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  chave text not null,
  criado_em timestamptz not null default now(),
  execucao_id text not null,
  bolsa_setor text not null,
  bolsa_mes text not null,
  centavos integer not null check (centavos >= 0),
  tokens integer not null check (tokens >= 0),
  primary key (escritorio_id, chave)
);

-- Efeito externo (transmissão, envio): reservado antes de chamar o conector, confirmado depois.
-- A chave natural impede o segundo envio, mesmo vindo de outra execução ou de outra pessoa.
create table public.efeito_externo (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  chave text not null,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  execucao_id text not null,
  ferramenta text not null,
  cartao_id text,
  argumentos_hash text not null,
  estado text not null check (estado in ('reservado','confirmado','falhou')),
  tentativas integer not null default 0,
  resultado jsonb,
  primary key (escritorio_id, chave)
);

-- Entregas de obrigação acessória (o recibo é a prova). Uma por (cliente, obrigação, período).
create table public.entrega_obrigacao (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default ('eo' || replace(gen_random_uuid()::text, '-', '')),
  criado_em timestamptz not null default now(),
  cliente_id text not null,
  obrigacao text not null,
  periodo text not null,
  recibo text not null,
  hash_arquivo text not null,
  execucao_id text not null,
  cartao_id text not null,
  aprovado_por text not null,
  primary key (escritorio_id, id),
  unique (escritorio_id, cliente_id, obrigacao, periodo)
);

-- Competências contábeis do cliente (aberta, fechada). Sem linha, a competência está aberta.
create table public.competencia_contabil (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  cliente_id text not null,
  competencia text not null check (competencia ~ '^\d{4}-\d{2}$'),
  situacao text not null check (situacao in ('aberta','fechada')),
  atualizado_em timestamptz not null default now(),
  primary key (escritorio_id, cliente_id, competencia)
);

-- Memória do setor (decisão 6): só leitura dentro de uma execução; muda por proposta aprovada.
create table public.memoria_setor (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  setor text not null,
  chave text not null,
  valor jsonb not null,
  versao integer not null default 1,
  origem_cartao_id text,
  atualizado_em timestamptz not null default now(),
  primary key (escritorio_id, setor, chave)
);

-- Gatilhos do despachante: evento → procedimento direto (o integrante só acorda no fim).
create table public.gatilho (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default ('gt' || replace(gen_random_uuid()::text, '-', '')),
  evento_nome text not null,
  filtro jsonb not null default '{}',
  procedimento_id text not null,
  setor text not null,
  -- Pergunta "Para quem quer rotear esta atividade?" antes de começar (decisão 5, opcional).
  perguntar_responsavel boolean not null default false,
  ativo boolean not null default true,
  primary key (escritorio_id, id)
);

-- Ligações com as tabelas das Fundações.
alter table public.cartao_aprovacao add column if not exists execucao_id text;
alter table public.cartao_aprovacao add column if not exists argumentos_hash text;
alter table public.cartao_aprovacao add column if not exists tipo text not null default 'aprovacao'
  check (tipo in ('aprovacao','escolha_responsavel','nao_consegui','orcamento','memoria'));
alter table public.cartao_aprovacao add column if not exists opcoes jsonb;
alter table public.item_fila add column if not exists execucao_id text;
alter table public.item_fila add column if not exists prioridade integer not null default 0;
alter table public.item_fila add column if not exists causado_por_evento_id text;
alter table public.item_fila add column if not exists resumo jsonb;
create index if not exists item_fila_pendente on public.item_fila (escritorio_id, integrante_id, prioridade desc, enfileirado_em) where status = 'pendente';
alter table public.evento add column if not exists execucao_id text;
alter table public.evento add column if not exists causado_por_evento_id text;
alter table public.evento add column if not exists aprovacao_id text;
alter table public.evento add column if not exists custo jsonb;

-- Atualizado_em, imutabilidade e RLS.
create trigger tocar before update on public.execucao for each row execute function public.tocar_atualizado_em();
create trigger tocar before update on public.efeito_externo for each row execute function public.tocar_atualizado_em();
create trigger tocar before update on public.bolsa_setor for each row execute function public.tocar_atualizado_em();
create trigger so_insercao before update or delete on public.chamada_modelo for each row execute function public.recusar_operacao('chamada_modelo é só de inserção');
create trigger so_insercao before update or delete on public.entrega_obrigacao for each row execute function public.recusar_operacao('entrega_obrigacao é só de inserção');

create or replace function public.passo_concluido_imutavel() returns trigger language plpgsql as $$
begin
  if old.estado = 'concluido' then
    raise exception 'Passo concluído não muda (%).', old.id using errcode = '42501';
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end $$;
create trigger passo_imutavel before update or delete on public.passo_execucao for each row execute function public.passo_concluido_imutavel();

create or replace function public.efeito_confirmado_imutavel() returns trigger language plpgsql as $$
begin
  if old.estado = 'confirmado' then
    raise exception 'Efeito confirmado não muda (%).', old.chave using errcode = '42501';
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end $$;
create trigger efeito_imutavel before update or delete on public.efeito_externo for each row execute function public.efeito_confirmado_imutavel();

do $$
declare t text;
begin
  foreach t in array array['procedimento_config','limite_execucao','execucao','passo_execucao','bolsa_setor','chamada_modelo','reserva_orcamento',
                           'efeito_externo','entrega_obrigacao','competencia_contabil','memoria_setor','gatilho'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('alter table public.%I force row level security', t);
    execute format('create policy %I on public.%I for select using (escritorio_id = public.escritorio_atual())', t || '_ler', t);
    execute format('create policy %I on public.%I for insert with check (escritorio_id = public.escritorio_atual())', t || '_inserir', t);
    execute format('create policy %I on public.%I for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual())', t || '_atualizar', t);
  end loop;
  -- A reserva de orçamento é a única linha da B2 que se apaga (quando vira chamada_modelo).
  create policy reserva_orcamento_excluir on public.reserva_orcamento for delete using (escritorio_id = public.escritorio_atual());
end $$;
-- procedimento_versao é da plataforma: todos leem, ninguém do escritório grava.
alter table public.procedimento_versao enable row level security;
alter table public.procedimento_versao force row level security;
create policy procedimento_versao_ler on public.procedimento_versao for select using (true);

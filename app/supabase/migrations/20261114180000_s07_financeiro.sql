-- S07 · Financeiro do escritório (subplano 09, 3.1): 20 tabelas novas.
-- Espelho de app/src/nucleo/modelo/financeiro.ts (mesmos nomes e colunas). Mesmo padrão da
-- migração de fundações: colunas comuns, chave (escritorio_id, id), RLS forçada pelo escritório
-- do JWT, quatro políticas e o gatilho tocar_atualizado_em.
-- Nada se apaga (09, 3.3): o dinheiro (contrato, cobrança, nota, lançamento, conta a pagar...)
-- não tem exclusão; cancelar e substituir exigem motivo. A exceção é restaurar_demonstracao(),
-- que apaga o escritório inteiro (por cascata) com os gatilhos desligados.
-- Gerado em 14/11/2026 pela sessão S07 do wireframe. Aplicar no projeto pede autorização do dono.

create table public.contrato_honorarios (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  cliente_id text not null,
  numero text not null,
  versao integer not null default 1,
  vigente_de text not null,
  vigente_ate text,
  situacao text not null check (situacao in ('rascunho','aguardando_assinatura','ativo','suspenso','encerrado','cancelado')),
  dia_vencimento integer not null check (dia_vencimento between 1 and 28),
  meio_pagamento text not null check (meio_pagamento in ('boleto','pix','pix_automatico','debito')),
  indice text not null,
  data_base integer not null default 0,
  politica_13o text not null check (politica_13o in ('nenhum','dezembro','duas_parcelas','diluido')),
  retencoes text[] not null default '{}',
  centro_custo_id text,
  indicado_por text,
  faixa_estourada text,
  encerrado_motivo text,
  primary key (escritorio_id, id)
);

create table public.item_contrato (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  contrato_id text not null,
  servico text not null,
  descricao text not null,
  setor_id text not null,
  valor numeric(14,2) not null check (valor > 0),
  tipo_cobranca text not null check (tipo_cobranca in ('fixo','por_faixa','por_unidade')),
  faixa text,
  vigente_de text not null,
  vigente_ate text,
  primary key (escritorio_id, id)
);

create table public.aditivo (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  contrato_id text not null,
  tipo text not null check (tipo in ('reajuste','escopo','faixa','desconto','vencimento','rescisao')),
  situacao text not null check (situacao in ('proposto','comunicado','aguardando_assinatura','aceito','vigente','recusado')),
  vigente_de text not null,
  resumo text not null,
  diff jsonb not null default '[]',
  versao_para integer not null,
  comunicado_em timestamptz,
  assinatura jsonb,
  primary key (escritorio_id, id)
);

create table public.item_tabela_avulsos (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  atividade_id text not null,
  nome text not null,
  valor_padrao numeric(14,2) not null,
  unidade text not null check (unidade in ('ocorrencia','hora','por_empregado')),
  exige_aceite boolean not null default true,
  ativo boolean not null default true,
  primary key (escritorio_id, id)
);

create table public.servico_avulso (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  cliente_id text not null,
  atividade_id text,
  descricao text not null,
  valor numeric(14,2) not null check (valor > 0),
  origem text not null,
  tarefa_id text,
  situacao text not null check (situacao in ('proposto','aceito','a_faturar','faturado','cancelado')),
  aceite_ref text,
  cobranca_id text,
  fase integer,
  motivo text,
  primary key (escritorio_id, id)
);

create table public.despesa_adiantada (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  cliente_id text not null,
  tipo text not null,
  descricao text not null,
  valor numeric(14,2) not null check (valor > 0),
  pago_em date not null,
  adiantado_por text not null,
  comprovante text,
  situacao text not null check (situacao in ('registrada','conferida','na_fatura','reembolsada','perdoada','cancelada')),
  cobranca_id text,
  motivo text,
  check (situacao <> 'perdoada' or motivo is not null),
  primary key (escritorio_id, id)
);

create table public.lote_faturamento (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  competencia text not null,
  situacao text not null check (situacao in ('preparado','aprovado','emitido','parcial')),
  quantidade integer not null default 0,
  total numeric(14,2) not null default 0,
  decimos integer not null default 0,
  avulsos integer not null default 0,
  excecoes jsonb not null default '[]',
  mudancas jsonb not null default '[]',
  cartao_id text,
  agregado jsonb,
  primary key (escritorio_id, id)
);

create table public.cobranca (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  cliente_id text not null,
  numero text not null,
  competencia text not null,
  origem text not null check (origem in ('lote','avulsa','decimo','reembolso','acordo')),
  linhas jsonb not null default '[]',
  valor numeric(14,2) not null check (valor > 0),
  vencimento date not null,
  meio text not null,
  situacao text not null check (situacao in ('rascunho','aguardando_aprovacao','emitida','paga_parcial','paga','em_acordo','cancelada','substituida','baixada_perda')),
  paga_em date,
  lote_id text,
  substitui_id text,
  motivo text,
  regua_etapa text,
  regua_pausada_ate date,
  regua_pausa_motivo text,
  aviso_formal_em date,
  pausa_parcial_em date,
  historico jsonb not null default '[]',
  check (situacao not in ('cancelada','substituida') or motivo is not null),
  primary key (escritorio_id, id)
);

create table public.parcela (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  cobranca_id text not null,
  numero integer not null,
  vencimento date not null,
  valor numeric(14,2) not null,
  situacao text not null check (situacao in ('aberta','aguardando_confirmacao','paga','cancelada')),
  linha_digitavel text,
  pix_copia_cola text,
  primary key (escritorio_id, id)
);

create table public.recebimento (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  cobranca_id text,
  parcela_id text,
  valor numeric(14,2) not null check (valor > 0),
  pago_em date not null,
  meio text not null,
  tarifa numeric(14,2) not null default 0,
  pagador text not null,
  pagador_documento text,
  origem text not null check (origem in ('webhook','conciliacao','manual','informado_pelo_cliente')),
  situacao text not null check (situacao in ('informado','confirmado','estornado','nao_localizado')),
  comprovante text,
  sugestao_cobranca_id text,
  primary key (escritorio_id, id)
);

create table public.nota_servico_escritorio (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  cobranca_id text,
  cliente_id text not null,
  numero text not null,
  competencia text not null,
  servico text not null,
  codigo text not null,
  iss text not null,
  valor numeric(14,2) not null,
  retencoes text[] not null default '{}',
  situacao text not null check (situacao in ('rascunho','emitida','rejeitada','cancelada','substituida')),
  motivo text,
  substitui_id text,
  primary key (escritorio_id, id)
);

create table public.conta_bancaria (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  titular_tipo text not null check (titular_tipo in ('escritorio','empresa')),
  titular_cliente_id text,
  nome text not null,
  banco text not null,
  tipo text not null check (tipo in ('corrente','conta_cobranca','cartao','caixa')),
  conta_mascarada text not null,
  origem text not null check (origem in ('open_finance','api_banco','ofx','manual')),
  saldo numeric(14,2) not null default 0,
  saldo_em timestamptz not null default now(),
  situacao text not null check (situacao in ('ativa','inativa','consentimento_vencido')),
  consentimento_ate date,
  fatura_fecha text,
  primary key (escritorio_id, id)
);

create table public.lancamento (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  titular_tipo text not null check (titular_tipo in ('escritorio','empresa')),
  titular_cliente_id text,
  conta_id text not null,
  data date not null,
  valor numeric(14,2) not null,
  descricao_extrato text not null,
  origem text not null check (origem in ('open_finance','ofx','provedor','manual')),
  situacao text not null check (situacao in ('nao_conciliado','sugerido','conciliado','transferencia','ignorado')),
  categoria text,
  centro_custo_id text,
  sugestao text,
  confianca text,
  regra_id text,
  vinculo jsonb,
  divergencia text,
  ajuste_de text,
  primary key (escritorio_id, id)
);

create table public.conta_pagar (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  titular_tipo text not null check (titular_tipo in ('escritorio','empresa')),
  titular_cliente_id text,
  fornecedor text not null,
  fornecedor_documento text,
  valor numeric(14,2) not null check (valor > 0),
  vencimento date not null,
  competencia text not null,
  origem text not null,
  categoria text not null,
  centro_custo_id text,
  rateio jsonb,
  codigo_barras text,
  situacao text not null check (situacao in ('capturada','classificada','aguardando_aprovacao','aprovada','agendada','paga','contestada','cancelada')),
  alerta text,
  aprovador_id text,
  aprovador_nome text,
  comprovante text,
  motivo text,
  check (situacao <> 'cancelada' or motivo is not null),
  primary key (escritorio_id, id)
);

create table public.centro_custo (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  nome text not null,
  tipo text not null check (tipo in ('setor','estrutura','comercial','carteira_de_socio')),
  setor_codigo text,
  entra_no_custo_hora boolean not null default true,
  ativo boolean not null default true,
  primary key (escritorio_id, id)
);

create table public.categoria_gerencial (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  codigo text not null,
  nome text not null,
  grupo text not null,
  natureza text not null check (natureza in ('receita','deducao','custo','despesa','financeiro','tributo','distribuicao')),
  entra_no_custo_hora boolean not null default false,
  ativa boolean not null default true,
  primary key (escritorio_id, id)
);

create table public.regra_categorizacao (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  padrao text not null,
  categoria text not null,
  centro_custo_id text,
  situacao text not null check (situacao in ('proposta','ativa','pausada')),
  vezes integer not null default 0,
  exemplo text,
  aprovada_por text,
  primary key (escritorio_id, id)
);

create table public.fechamento_financeiro (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  competencia text not null,
  situacao text not null check (situacao in ('aberto','fechado','reaberto')),
  fechado_por text,
  fechado_em timestamptz,
  motivo_reabertura text,
  custo_hora numeric(14,2),
  check (situacao <> 'reaberto' or motivo_reabertura is not null),
  primary key (escritorio_id, id)
);

create table public.politica_financeira (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  versao integer not null default 1,
  juros_mes numeric(6,3) not null,
  multa numeric(6,3) not null,
  regua jsonb not null default '[]',
  prazo_pago_dias integer not null default 3,
  acordo_desconto_max numeric(6,2) not null default 10,
  acordo_parcelas_max integer not null default 6,
  limite_gestor numeric(14,2) not null default 5000,
  limite_dois_aprovadores numeric(14,2) not null default 10000,
  provedor jsonb not null default '{}',
  nfse jsonb not null default '{}',
  importacao jsonb,
  primary key (escritorio_id, id)
);

create table public.cenario_caixa (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  nome text not null,
  ajuste_entradas numeric(14,2) not null default 0,
  ajuste_saidas numeric(14,2) not null default 0,
  premissas text not null default '',
  autor text not null,
  primary key (escritorio_id, id)
);

create trigger tocar before update on public.contrato_honorarios for each row execute function public.tocar_atualizado_em();
alter table public.contrato_honorarios enable row level security;
alter table public.contrato_honorarios force row level security;
create policy contrato_honorarios_ler on public.contrato_honorarios for select using (escritorio_id = public.escritorio_atual());
create policy contrato_honorarios_inserir on public.contrato_honorarios for insert with check (escritorio_id = public.escritorio_atual());
create policy contrato_honorarios_atualizar on public.contrato_honorarios for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create trigger nunca_apagar before delete on public.contrato_honorarios for each row when (current_setting('heild.restaurando', true) is distinct from 'sim') execute function public.recusar_operacao('nada se apaga no financeiro (09, 3.3)');

create trigger tocar before update on public.item_contrato for each row execute function public.tocar_atualizado_em();
alter table public.item_contrato enable row level security;
alter table public.item_contrato force row level security;
create policy item_contrato_ler on public.item_contrato for select using (escritorio_id = public.escritorio_atual());
create policy item_contrato_inserir on public.item_contrato for insert with check (escritorio_id = public.escritorio_atual());
create policy item_contrato_atualizar on public.item_contrato for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create trigger nunca_apagar before delete on public.item_contrato for each row when (current_setting('heild.restaurando', true) is distinct from 'sim') execute function public.recusar_operacao('nada se apaga no financeiro (09, 3.3)');

create trigger tocar before update on public.aditivo for each row execute function public.tocar_atualizado_em();
alter table public.aditivo enable row level security;
alter table public.aditivo force row level security;
create policy aditivo_ler on public.aditivo for select using (escritorio_id = public.escritorio_atual());
create policy aditivo_inserir on public.aditivo for insert with check (escritorio_id = public.escritorio_atual());
create policy aditivo_atualizar on public.aditivo for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create trigger nunca_apagar before delete on public.aditivo for each row when (current_setting('heild.restaurando', true) is distinct from 'sim') execute function public.recusar_operacao('nada se apaga no financeiro (09, 3.3)');

create trigger tocar before update on public.item_tabela_avulsos for each row execute function public.tocar_atualizado_em();
alter table public.item_tabela_avulsos enable row level security;
alter table public.item_tabela_avulsos force row level security;
create policy item_tabela_avulsos_ler on public.item_tabela_avulsos for select using (escritorio_id = public.escritorio_atual());
create policy item_tabela_avulsos_inserir on public.item_tabela_avulsos for insert with check (escritorio_id = public.escritorio_atual());
create policy item_tabela_avulsos_atualizar on public.item_tabela_avulsos for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create policy item_tabela_avulsos_excluir on public.item_tabela_avulsos for delete using (escritorio_id = public.escritorio_atual());

create trigger tocar before update on public.servico_avulso for each row execute function public.tocar_atualizado_em();
alter table public.servico_avulso enable row level security;
alter table public.servico_avulso force row level security;
create policy servico_avulso_ler on public.servico_avulso for select using (escritorio_id = public.escritorio_atual());
create policy servico_avulso_inserir on public.servico_avulso for insert with check (escritorio_id = public.escritorio_atual());
create policy servico_avulso_atualizar on public.servico_avulso for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create trigger nunca_apagar before delete on public.servico_avulso for each row when (current_setting('heild.restaurando', true) is distinct from 'sim') execute function public.recusar_operacao('nada se apaga no financeiro (09, 3.3)');

create trigger tocar before update on public.despesa_adiantada for each row execute function public.tocar_atualizado_em();
alter table public.despesa_adiantada enable row level security;
alter table public.despesa_adiantada force row level security;
create policy despesa_adiantada_ler on public.despesa_adiantada for select using (escritorio_id = public.escritorio_atual());
create policy despesa_adiantada_inserir on public.despesa_adiantada for insert with check (escritorio_id = public.escritorio_atual());
create policy despesa_adiantada_atualizar on public.despesa_adiantada for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create trigger nunca_apagar before delete on public.despesa_adiantada for each row when (current_setting('heild.restaurando', true) is distinct from 'sim') execute function public.recusar_operacao('nada se apaga no financeiro (09, 3.3)');

create trigger tocar before update on public.lote_faturamento for each row execute function public.tocar_atualizado_em();
alter table public.lote_faturamento enable row level security;
alter table public.lote_faturamento force row level security;
create policy lote_faturamento_ler on public.lote_faturamento for select using (escritorio_id = public.escritorio_atual());
create policy lote_faturamento_inserir on public.lote_faturamento for insert with check (escritorio_id = public.escritorio_atual());
create policy lote_faturamento_atualizar on public.lote_faturamento for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create trigger nunca_apagar before delete on public.lote_faturamento for each row when (current_setting('heild.restaurando', true) is distinct from 'sim') execute function public.recusar_operacao('nada se apaga no financeiro (09, 3.3)');

create trigger tocar before update on public.cobranca for each row execute function public.tocar_atualizado_em();
alter table public.cobranca enable row level security;
alter table public.cobranca force row level security;
create policy cobranca_ler on public.cobranca for select using (escritorio_id = public.escritorio_atual());
create policy cobranca_inserir on public.cobranca for insert with check (escritorio_id = public.escritorio_atual());
create policy cobranca_atualizar on public.cobranca for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create trigger nunca_apagar before delete on public.cobranca for each row when (current_setting('heild.restaurando', true) is distinct from 'sim') execute function public.recusar_operacao('nada se apaga no financeiro (09, 3.3)');

create trigger tocar before update on public.parcela for each row execute function public.tocar_atualizado_em();
alter table public.parcela enable row level security;
alter table public.parcela force row level security;
create policy parcela_ler on public.parcela for select using (escritorio_id = public.escritorio_atual());
create policy parcela_inserir on public.parcela for insert with check (escritorio_id = public.escritorio_atual());
create policy parcela_atualizar on public.parcela for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create trigger nunca_apagar before delete on public.parcela for each row when (current_setting('heild.restaurando', true) is distinct from 'sim') execute function public.recusar_operacao('nada se apaga no financeiro (09, 3.3)');

create trigger tocar before update on public.recebimento for each row execute function public.tocar_atualizado_em();
alter table public.recebimento enable row level security;
alter table public.recebimento force row level security;
create policy recebimento_ler on public.recebimento for select using (escritorio_id = public.escritorio_atual());
create policy recebimento_inserir on public.recebimento for insert with check (escritorio_id = public.escritorio_atual());
create policy recebimento_atualizar on public.recebimento for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create trigger nunca_apagar before delete on public.recebimento for each row when (current_setting('heild.restaurando', true) is distinct from 'sim') execute function public.recusar_operacao('nada se apaga no financeiro (09, 3.3)');

create trigger tocar before update on public.nota_servico_escritorio for each row execute function public.tocar_atualizado_em();
alter table public.nota_servico_escritorio enable row level security;
alter table public.nota_servico_escritorio force row level security;
create policy nota_servico_escritorio_ler on public.nota_servico_escritorio for select using (escritorio_id = public.escritorio_atual());
create policy nota_servico_escritorio_inserir on public.nota_servico_escritorio for insert with check (escritorio_id = public.escritorio_atual());
create policy nota_servico_escritorio_atualizar on public.nota_servico_escritorio for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create trigger nunca_apagar before delete on public.nota_servico_escritorio for each row when (current_setting('heild.restaurando', true) is distinct from 'sim') execute function public.recusar_operacao('nada se apaga no financeiro (09, 3.3)');

create trigger tocar before update on public.conta_bancaria for each row execute function public.tocar_atualizado_em();
alter table public.conta_bancaria enable row level security;
alter table public.conta_bancaria force row level security;
create policy conta_bancaria_ler on public.conta_bancaria for select using (escritorio_id = public.escritorio_atual());
create policy conta_bancaria_inserir on public.conta_bancaria for insert with check (escritorio_id = public.escritorio_atual());
create policy conta_bancaria_atualizar on public.conta_bancaria for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create trigger nunca_apagar before delete on public.conta_bancaria for each row when (current_setting('heild.restaurando', true) is distinct from 'sim') execute function public.recusar_operacao('nada se apaga no financeiro (09, 3.3)');

create trigger tocar before update on public.lancamento for each row execute function public.tocar_atualizado_em();
alter table public.lancamento enable row level security;
alter table public.lancamento force row level security;
create policy lancamento_ler on public.lancamento for select using (escritorio_id = public.escritorio_atual());
create policy lancamento_inserir on public.lancamento for insert with check (escritorio_id = public.escritorio_atual());
create policy lancamento_atualizar on public.lancamento for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create trigger nunca_apagar before delete on public.lancamento for each row when (current_setting('heild.restaurando', true) is distinct from 'sim') execute function public.recusar_operacao('nada se apaga no financeiro (09, 3.3)');

create trigger tocar before update on public.conta_pagar for each row execute function public.tocar_atualizado_em();
alter table public.conta_pagar enable row level security;
alter table public.conta_pagar force row level security;
create policy conta_pagar_ler on public.conta_pagar for select using (escritorio_id = public.escritorio_atual());
create policy conta_pagar_inserir on public.conta_pagar for insert with check (escritorio_id = public.escritorio_atual());
create policy conta_pagar_atualizar on public.conta_pagar for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create trigger nunca_apagar before delete on public.conta_pagar for each row when (current_setting('heild.restaurando', true) is distinct from 'sim') execute function public.recusar_operacao('nada se apaga no financeiro (09, 3.3)');

create trigger tocar before update on public.centro_custo for each row execute function public.tocar_atualizado_em();
alter table public.centro_custo enable row level security;
alter table public.centro_custo force row level security;
create policy centro_custo_ler on public.centro_custo for select using (escritorio_id = public.escritorio_atual());
create policy centro_custo_inserir on public.centro_custo for insert with check (escritorio_id = public.escritorio_atual());
create policy centro_custo_atualizar on public.centro_custo for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create trigger nunca_apagar before delete on public.centro_custo for each row when (current_setting('heild.restaurando', true) is distinct from 'sim') execute function public.recusar_operacao('nada se apaga no financeiro (09, 3.3)');

create trigger tocar before update on public.categoria_gerencial for each row execute function public.tocar_atualizado_em();
alter table public.categoria_gerencial enable row level security;
alter table public.categoria_gerencial force row level security;
create policy categoria_gerencial_ler on public.categoria_gerencial for select using (escritorio_id = public.escritorio_atual());
create policy categoria_gerencial_inserir on public.categoria_gerencial for insert with check (escritorio_id = public.escritorio_atual());
create policy categoria_gerencial_atualizar on public.categoria_gerencial for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create trigger nunca_apagar before delete on public.categoria_gerencial for each row when (current_setting('heild.restaurando', true) is distinct from 'sim') execute function public.recusar_operacao('nada se apaga no financeiro (09, 3.3)');

create trigger tocar before update on public.regra_categorizacao for each row execute function public.tocar_atualizado_em();
alter table public.regra_categorizacao enable row level security;
alter table public.regra_categorizacao force row level security;
create policy regra_categorizacao_ler on public.regra_categorizacao for select using (escritorio_id = public.escritorio_atual());
create policy regra_categorizacao_inserir on public.regra_categorizacao for insert with check (escritorio_id = public.escritorio_atual());
create policy regra_categorizacao_atualizar on public.regra_categorizacao for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create policy regra_categorizacao_excluir on public.regra_categorizacao for delete using (escritorio_id = public.escritorio_atual());

create trigger tocar before update on public.fechamento_financeiro for each row execute function public.tocar_atualizado_em();
alter table public.fechamento_financeiro enable row level security;
alter table public.fechamento_financeiro force row level security;
create policy fechamento_financeiro_ler on public.fechamento_financeiro for select using (escritorio_id = public.escritorio_atual());
create policy fechamento_financeiro_inserir on public.fechamento_financeiro for insert with check (escritorio_id = public.escritorio_atual());
create policy fechamento_financeiro_atualizar on public.fechamento_financeiro for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create trigger nunca_apagar before delete on public.fechamento_financeiro for each row when (current_setting('heild.restaurando', true) is distinct from 'sim') execute function public.recusar_operacao('nada se apaga no financeiro (09, 3.3)');

create trigger tocar before update on public.politica_financeira for each row execute function public.tocar_atualizado_em();
alter table public.politica_financeira enable row level security;
alter table public.politica_financeira force row level security;
create policy politica_financeira_ler on public.politica_financeira for select using (escritorio_id = public.escritorio_atual());
create policy politica_financeira_inserir on public.politica_financeira for insert with check (escritorio_id = public.escritorio_atual());
create policy politica_financeira_atualizar on public.politica_financeira for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create trigger nunca_apagar before delete on public.politica_financeira for each row when (current_setting('heild.restaurando', true) is distinct from 'sim') execute function public.recusar_operacao('nada se apaga no financeiro (09, 3.3)');

create trigger tocar before update on public.cenario_caixa for each row execute function public.tocar_atualizado_em();
alter table public.cenario_caixa enable row level security;
alter table public.cenario_caixa force row level security;
create policy cenario_caixa_ler on public.cenario_caixa for select using (escritorio_id = public.escritorio_atual());
create policy cenario_caixa_inserir on public.cenario_caixa for insert with check (escritorio_id = public.escritorio_atual());
create policy cenario_caixa_atualizar on public.cenario_caixa for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create policy cenario_caixa_excluir on public.cenario_caixa for delete using (escritorio_id = public.escritorio_atual());

-- As tabelas sem exclusão também ganham a política de delete (a função de restaurar roda como
-- dono e ignora a RLS; a política só existe para o gatilho decidir).

create policy contrato_honorarios_excluir on public.contrato_honorarios for delete using (escritorio_id = public.escritorio_atual());
create policy item_contrato_excluir on public.item_contrato for delete using (escritorio_id = public.escritorio_atual());
create policy aditivo_excluir on public.aditivo for delete using (escritorio_id = public.escritorio_atual());
create policy servico_avulso_excluir on public.servico_avulso for delete using (escritorio_id = public.escritorio_atual());
create policy despesa_adiantada_excluir on public.despesa_adiantada for delete using (escritorio_id = public.escritorio_atual());
create policy lote_faturamento_excluir on public.lote_faturamento for delete using (escritorio_id = public.escritorio_atual());
create policy cobranca_excluir on public.cobranca for delete using (escritorio_id = public.escritorio_atual());
create policy parcela_excluir on public.parcela for delete using (escritorio_id = public.escritorio_atual());
create policy recebimento_excluir on public.recebimento for delete using (escritorio_id = public.escritorio_atual());
create policy nota_servico_escritorio_excluir on public.nota_servico_escritorio for delete using (escritorio_id = public.escritorio_atual());
create policy lancamento_excluir on public.lancamento for delete using (escritorio_id = public.escritorio_atual());
create policy conta_pagar_excluir on public.conta_pagar for delete using (escritorio_id = public.escritorio_atual());
create policy fechamento_financeiro_excluir on public.fechamento_financeiro for delete using (escritorio_id = public.escritorio_atual());
create policy politica_financeira_excluir on public.politica_financeira for delete using (escritorio_id = public.escritorio_atual());
create policy centro_custo_excluir on public.centro_custo for delete using (escritorio_id = public.escritorio_atual());
create policy categoria_gerencial_excluir on public.categoria_gerencial for delete using (escritorio_id = public.escritorio_atual());
create policy conta_bancaria_excluir on public.conta_bancaria for delete using (escritorio_id = public.escritorio_atual());

create index on public.contrato_honorarios (escritorio_id, cliente_id);
create index on public.item_contrato (escritorio_id, contrato_id);
create index on public.cobranca (escritorio_id, cliente_id, competencia);
create index on public.parcela (escritorio_id, cobranca_id);
create index on public.nota_servico_escritorio (escritorio_id, cobranca_id);
create index on public.lancamento (escritorio_id, conta_id, data);
create index on public.conta_pagar (escritorio_id, situacao, vencimento);

-- Um contrato ativo por cliente (09, 3.1).
create unique index contrato_ativo_por_cliente on public.contrato_honorarios (escritorio_id, cliente_id) where situacao = 'ativo';
-- Uma competência fechada por vez.
create unique index fechamento_por_competencia on public.fechamento_financeiro (escritorio_id, competencia);

-- restaurar_demonstracao() passa a avisar os gatilhos do financeiro de que está restaurando.
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
  perform set_config('heild.restaurando', '', true);
end $$;
revoke all on function public.restaurar_demonstracao() from public;
grant execute on function public.restaurar_demonstracao() to authenticated;

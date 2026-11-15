-- S08b · Documentos que chegam à fila do BPO (subplano 10, 3.5: captura, leitura e checagem).
-- Espelho da interface BpoDocumento acrescentada pela S08b em app/src/nucleo/modelo/entidades.ts
-- (mesmos nomes e colunas, snake_case). Mesmo padrão da migração da S08: colunas comuns,
-- chave (escritorio_id, id), RLS forçada pelo escritório do JWT, quatro políticas e o gatilho
-- que toca atualizado_em.
-- Regras que ficam no banco (segunda barreira; a primeira é o repositório do app):
--   * documento nunca se apaga (R7): descarta com motivo;
--   * documento lançado aponta para a conta criada;
--   * documento descartado guarda o motivo.
-- Depende de 20261114180000_s08_bpo.sql (usa a marca heild.restaurando da restauração).
-- Aplicar no projeto pede autorização do dono (docs/wireframe/ARQUITETURA.md, seção 9).

create table public.bpo_documento (
  escritorio_id text not null references public.escritorio (id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz,
  ordem double precision,
  extras jsonb,
  cliente_id text not null,
  nome_arquivo text not null,
  tipo_documento text not null check (tipo_documento in ('boleto','nota','comprovante','outro')),
  canal text not null check (canal in ('app','whatsapp','email','dda')),
  remetente text not null,
  recebido_em timestamptz not null default now(),
  situacao text not null check (situacao in ('recebido','lido','lancado','anexado','descartado')),
  leitura jsonb,
  checagens jsonb not null default '[]'::jsonb,
  lido_por text,
  fila_id text,
  conta_id text,
  lancado_por text,
  motivo text,
  primary key (escritorio_id, id),
  constraint bpo_documento_lancado_tem_conta check (situacao <> 'lancado' or conta_id is not null),
  constraint bpo_documento_descartado_tem_motivo check (situacao <> 'descartado' or coalesce(motivo, '') <> '')
);

create index bpo_documento_cliente on public.bpo_documento (escritorio_id, cliente_id);

create trigger tocar before update on public.bpo_documento for each row execute function public.tocar_atualizado_em();
alter table public.bpo_documento enable row level security;
alter table public.bpo_documento force row level security;
create policy bpo_documento_ler on public.bpo_documento for select using (escritorio_id = public.escritorio_atual());
create policy bpo_documento_inserir on public.bpo_documento for insert with check (escritorio_id = public.escritorio_atual());
create policy bpo_documento_atualizar on public.bpo_documento for update using (escritorio_id = public.escritorio_atual()) with check (escritorio_id = public.escritorio_atual());
create trigger nunca_apagar before delete on public.bpo_documento for each row when (current_setting('heild.restaurando', true) is distinct from 'sim') execute function public.recusar_operacao('nada se apaga no BPO (R7)');
create policy bpo_documento_excluir on public.bpo_documento for delete using (escritorio_id = public.escritorio_atual());

-- S06b · Lançamento manual de tempo (pedido do dono, 15/11/2026): a sessão de trabalho ganha a
-- origem "manual" e os campos do lançamento (descrição, faturável, de qual foi duplicado, versões).
-- Editar cria versão (o app guarda a anterior em `versoes`); nada se apaga (descartar = substituida_por).
-- O tempo padrão do que é feito por fora fica em escritorio.configuracao.timesheet.tempos_padrao (JSON, sem coluna).
-- Migração nova: não edita a 20261114180000_s06_timesheet.sql.

alter table public.sessao_trabalho drop constraint if exists sessao_trabalho_origem_check;
alter table public.sessao_trabalho add constraint sessao_trabalho_origem_check
  check (origem in ('plataforma','core','extensao','artefato','confirmacao','manual'));

alter table public.sessao_trabalho add column if not exists descricao text;
alter table public.sessao_trabalho add column if not exists faturavel boolean;
alter table public.sessao_trabalho add column if not exists lancamento_de text;
alter table public.sessao_trabalho add column if not exists versoes jsonb;

-- Lançamento manual sempre tem dono e não usa a confiança da captura.
alter table public.sessao_trabalho add constraint sessao_trabalho_manual_confirmada
  check (origem <> 'manual' or confianca in ('confirmada','contestada'));

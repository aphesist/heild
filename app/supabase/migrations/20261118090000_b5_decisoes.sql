-- B5 · Decisões do Enzo de 15/11/2026 (docs/backend/IMPLEMENTACAO.md, B5, "Decisões a, b e c").
-- Por cima das migrações anteriores, sem editá-las. Só para o Postgres local e o HEILD-BACKEND:
-- NÃO aplicar no projeto do wireframe (HEILD-PROD).
--
--   a) Aprovar um cartão do executor executa o comando guardado. O cartão guarda o que a pessoa
--      alterou antes de aprovar (`argumentos_editados`; Fundações 6.4, adendo de 15/11) e a
--      resposta da execução (`resposta`), que o duplo clique recebe de novo sem executar outra vez.

alter table public.cartao_aprovacao add column if not exists argumentos_editados jsonb;
alter table public.cartao_aprovacao add column if not exists resposta jsonb;

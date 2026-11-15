-- B3b · Ajustes dos integrantes (decisões do Enzo sobre as recomendações da B3).
--   * O custo do roteamento passa a ser do setor de destino: o pedido guarda de que bolsa saiu.
--     Sem destino (pergunta, sem procedimento, negado), fica na bolsa do roteamento (`assistente`).
--   * A bolsa do piloto (`piloto`) paga o modo sombra; não precisa de coluna nova (é uma linha de
--     bolsa_setor), e reserva_orcamento já guarda a bolsa de cada chamada.
-- Gerado em 16/11/2026 pela sessão B3b do backend.

alter table public.pedido_assistente add column bolsa_pagadora text;

-- 100 escritórios × 20.000 tarefas = 2 milhões de tarefas; 2 milhões de eventos.
insert into tarefa (escritorio_id, id, titulo, cliente_id, setor_id, atividade_id, status, responsavel_id, prazo_interno, prazo_legal, extras)
select 'esc-' || e, 'tk' || t,
  'Tarefa ' || t || ' do escritório ' || e, 'c' || (t % 150), (array['fiscal','dp','contabil','societario','notas'])[1 + t % 5],
  'FIS-' || lpad((t % 120)::text, 3, '0'), (array['a_fazer','em_andamento','aguardando_cliente','em_revisao','concluida','concluida','concluida','concluida'])[1 + t % 8],
  'u' || (t % 20), date '2026-01-01' + (t % 365), date '2026-01-05' + (t % 365), jsonb_build_object('origem','semente','checklist', jsonb_build_array('a','b'))
from generate_series(1,100) e, generate_series(1,20000) t;
insert into evento (escritorio_id, seq, nome, ator_tipo, ator_id, cliente_id, setor_id, ferramenta, nivel, resultado, origem, texto, hash_anterior, hash)
select 'esc-' || e, s, 'tarefa.atualizar', 'pessoa', 'u1', 'c1', 'fiscal', 'tarefa.atualizar', 'executar', 'ok', 'tela', 'semente', '\x00'::bytea, sha256(('esc-' || e || s)::bytea)
from generate_series(1,100) e, generate_series(1,20000) s;
insert into cadeia_evento select escritorio_id, max(seq), sha256(escritorio_id::bytea) from evento group by escritorio_id;
analyze;

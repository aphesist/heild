# Prova de conceito: o mesmo endpoint em Node, Bun, Go e Rust

**15/11/2026.** Medição feita para decidir a linguagem do backend (ver [`../STACK.md`](../STACK.md)). É o único código desta pasta e não vai para produção.

## O que foi medido

Dois endpoints que representam o trabalho típico da API da Heild, escritos do mesmo jeito nas quatro implementações:

| Endpoint | O que faz |
| --- | --- |
| `GET /v1/tarefas?setor=fiscal` | Verifica o JWT (ES256, como as chaves assimétricas do Supabase Auth). Abre transação, fixa o escritório do JWT na conexão (`request.jwt.claims` e `role authenticated`, o mesmo mecanismo da RLS do Supabase), lê as 50 tarefas abertas do setor por prazo e devolve JSON |
| `POST /v1/tarefas/{id}/concluir` | Mesma verificação e mesma fixação. Atualiza a tarefa, trava o elo da cadeia do escritório (`select ... for update`), calcula o SHA-256 do evento sobre o hash anterior, grava o evento e o novo elo, tudo na mesma transação (Fundações R2 e 5.2) |

- **Banco:** PostgreSQL 16 local, RLS forçada nas três tabelas e papel `app_api` sem `BYPASSRLS` ([`schema.sql`](schema.sql)). Os dados são 100 escritórios × 20 mil tarefas (2 milhões de tarefas) e 2 milhões de eventos ([`seed.sql`](seed.sql)), cerca de 1 GB.
- **Implementações:**
  - Node 22 com Fastify 5, postgres.js e jose ([`node/servidor.mjs`](node/servidor.mjs));
  - o mesmo arquivo no Bun 1.4;
  - Go 1.24 com net/http, pgx v5 e golang-jwt ([`go/main.go`](go/main.go));
  - Rust 1.97 com axum 0.8, tokio-postgres, deadpool e jsonwebtoken ([`rust/src/main.rs`](rust/src/main.rs)).
  - Todas usam um pool de 20 conexões e consultas preparadas.
- **Máquina:** 4 núcleos e 15 GB.
  - O servidor fica preso a **1 núcleo** (`taskset`, `GOMAXPROCS=1`, `TOKIO_WORKER_THREADS=1`, `UV_THREADPOOL_SIZE=1`).
  - O Postgres usa 2 núcleos e o gerador de carga ([`carga/main.go`](carga/main.go)) usa 1.
  - O gerador roda com 64 conexões, 5 s de aquecimento e 20 s por modo. Ele sorteia o escritório (100 tokens) e o setor ou a tarefa.
  - O modo **misto** tem 80% de leitura e 20% de escrita.
- **Rodadas:**
  - **Rodada A:** só o índice composto `(escritorio_id, setor_id, status, prazo_interno)`.
  - **Rodada B:** acrescenta o índice parcial das tarefas abertas `(escritorio_id, setor_id, prazo_interno) where status in (...)`.

## Resultados

Requisições por segundo com o servidor num núcleo só; p99 no modo misto; memória residente de pico do processo do servidor.

**Rodada A (índice composto; a leitura fica presa no Postgres)**

| | Ler | Escrever | Misto | CPU do Postgres na leitura | Memória |
| --- | --- | --- | --- | --- | --- |
| Node | 706 | 1.549 | 745 | 173% de 200% | 163 MB |
| Bun | 672 | 2.751 | 806 | 174% | 97 MB |
| Go | 773 | 3.254 | 896 | 189% | 20 MB |
| Rust | 733 | 4.278 | 871 | 188% | 8 MB |

**Rodada B (com o índice parcial; o gargalo passa a ser o servidor)**

| | Ler | Escrever | Misto | p99 misto | CPU do servidor (misto) | Memória |
| --- | --- | --- | --- | --- | --- | --- |
| Node | 1.525 | 1.781 | 1.417 | 80,9 ms | 98% | 168 MB |
| Bun | 1.625 | 2.586 | 1.851 | 56,3 ms | 99% | 105 MB |
| Go | 2.708 | 3.162 | 2.829 | 41,5 ms | 99% | 20 MB |
| Rust | 2.940 | 3.948 | 3.132 | 32,7 ms | 98% | 8 MB |

O p99 é medido com 64 pedidos simultâneos contra um núcleo saturado: mostra a fila, não a latência de um pedido isolado. Sem saturação, um pedido leva de 1 a 3 ms aqui.

Medida à parte ([`node/jwt-bench.mjs`](node/jwt-bench.mjs)): no Node, verificar um JWT ES256 com o jose custa **100 µs** (92 µs no Bun). Isso é cerca de 1/7 do custo de CPU de um pedido no Node.

## O que os números dizem

1. **Na leitura com índice ruim, a linguagem não faz diferença.** As quatro ficam entre 672 e 773 req/s, porque o Postgres lê 2.013 linhas e ordena para devolver 50. **O índice parcial dobrou a leitura do Node (706 → 1.525) e multiplicou a do Go por 3,5.** Desenho de consulta e índice pesa mais que a troca de linguagem.
2. **Quando o servidor é o gargalo, Go e Rust fazem cerca de 2 vezes o trabalho do Node por núcleo** no misto (2.829 e 3.132 contra 1.417). O Bun fica no meio (1.851, +31% sobre o Node com o mesmo código). O Rust passa o Go em só 11% no misto e em 25% na escrita.
3. **Em memória a diferença é grande:** 165 MB (Node), 100 MB (Bun), 20 MB (Go), 8 MB (Rust). Num container de 1 GB isso não muda o custo; só pesa com centenas de instâncias.
4. **A RLS não custou plano ruim.** A função `escritorio_atual()` é expandida inline e vira condição do índice (`EXPLAIN` na rodada A), e não um filtro avaliado linha a linha.
5. **A cadeia de hash síncrona aguentou cerca de 4 mil gravações por segundo** com 100 escritórios (Rust), com o elo travado só no fim da transação. Por escritório, a trava fica alguns milissegundos por gravação.

O que a medição **não** cobre: a latência de rede até o Supabase (local aqui; 1 a 3 ms na mesma região, ~114 ms vindo dos EUA), validação de esquema de entrada e saída, `autorizar`, serialização de respostas grandes e o custo do pooler. Por isso o [`../HOSPEDAGEM.md`](../HOSPEDAGEM.md) usa uma margem de 3 vezes sobre estes números.

## Como repetir

```bash
# Postgres 16 numa pasta temporária, porta 5433, presos aos núcleos 0 e 1
PG=/usr/lib/postgresql/16/bin; mkdir -p /var/tmp/pocpg && chown postgres /var/tmp/pocpg
su postgres -c "$PG/initdb -D /var/tmp/pocpg/data -A trust -U postgres"
printf "listen_addresses='127.0.0.1'\nport=5433\nmax_connections=200\nshared_buffers=1GB\n" >> /var/tmp/pocpg/data/postgresql.conf
su postgres -c "taskset -c 0,1 $PG/pg_ctl -D /var/tmp/pocpg/data -l /var/tmp/pocpg/log start"
P="psql -h 127.0.0.1 -p 5433 -U postgres"
$P -c "create database heild" && $P -d heild -f schema.sql && $P -d heild -f seed.sql
$P -d heild -c "alter role app_api inherit; grant usage on schema auth to authenticated; grant execute on function auth.jwt() to authenticated;"

# Chaves e tokens (ficam fora do git)
openssl ecparam -name prime256v1 -genkey -noout -out priv.pem && openssl ec -in priv.pem -pubout -out pub.pem
(cd node && npm install && node gerar-tokens.mjs)
(cd go && go build -o servidor .) && (cd rust && cargo build --release) && (cd carga && go build -o carga .)

# Rodada A
(cd node && ../medir.sh node 8081 node servidor.mjs)
(cd node && ../medir.sh bun 8084 bun servidor.mjs)
(cd go && ../medir.sh go 8082 ./servidor)
(cd rust && ../medir.sh rust 8083 ./target/release/servidor)

# Rodada B: crie o índice parcial e repita as quatro linhas acima
$P -d heild -c "create index tarefa_abertas on tarefa (escritorio_id, setor_id, prazo_interno) where status in ('a_fazer','em_andamento','aguardando_cliente','em_revisao'); analyze tarefa;"
```

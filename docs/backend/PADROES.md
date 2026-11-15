# Padrões do backend

**15/11/2026 · sessão B1.** O que todo endpoint e todo serviço do backend da Heild cumpre, sem precisar pedir caso a caso. Vale para a API (B1), para o motor de procedimentos, a fila e o MCP (B2) e para os conectores.

## Que modelo seguimos

Não existe um documento aberto único que seja, ao mesmo tempo, bom, fácil de entender, padronizado e seguro para o nosso caso: uma API de ferramentas tipadas, chamada por tela e por agente, sobre Postgres com RLS. Por isso adotamos uma base e complementos, cada um no que faz melhor.

Comparamos as fontes por quatro critérios: (1) bom, (2) fácil de entender, (3) padronizado e (4) seguro. As notas vão de 1 a 5.

| Fonte | (1) | (2) | (3) | (4) | Uso aqui |
| --- | --- | --- | --- | --- | --- |
| [Google AIPs](https://google.aip.dev/general) | 5 | 4: uma regra por página, curta, numerada | 5: regras numeradas e citáveis (AIP-158, AIP-193) | 3 | **Base de desenho da API:** paginação por token (AIP-158), erros com código estável (AIP-193), pedido identificado e idempotente (AIP-155), campos e nomes. Nosso estilo "ferramenta" (`POST /v1/ferramentas/{nome}`) é o dos métodos customizados (AIP-136) |
| [OWASP API Security Top 10 (2023)](https://owasp.org/API-Security/editions/2023/en/0x11-t10/) | 5 | 5: dez itens | 5 | 5 | **Base de segurança:** cada item vira uma linha do checklist |
| [OWASP ASVS](https://github.com/OWASP/ASVS) | 5 | 2: longo | 5 | 5 | Referência para auditoria antes de dado real (nível 2). Não é o checklist do dia a dia |
| [Microsoft REST API Guidelines](https://github.com/microsoft/api-guidelines) | 4 | 3 | 4 | 3 | Consulta pontual (versionamento, operações longas). Mais voltado a REST por recurso, que não é o nosso estilo |
| [Zalando RESTful API Guidelines](https://opensource.zalando.com/restful-api-guidelines/) | 4 | 3: muito extenso | 5 | 3 | Consulta pontual (MUST/SHOULD bem escritos). O mesmo motivo da Microsoft |
| [RFC 9457, Problem Details](https://www.rfc-editor.org/rfc/rfc9457) e [rascunho IETF do Idempotency-Key](https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/) | 5 | 5 | 5: padrão da IETF | 4 | O cabeçalho `Idempotency-Key` segue o rascunho. O corpo de erro segue a ideia do 9457 (código, campo, mensagem para gente); a forma é a do nosso envelope, já decidido em AGENTICO 8 |
| [Node.js Best Practices (goldbergyoni)](https://github.com/goldbergyoni/nodebestpractices) | 5 | 4 | 3: lista longa, sem numeração estável | 4 | **Base do processo Node:** erros, laço de eventos, desligamento, logs, segurança do processo |
| [Fastify: Recommendations](https://fastify.dev/docs/latest/Guides/Recommendations/) | 4 | 5 | 4 | 4 | Timeouts, proxy reverso, número de instâncias |
| [PostgreSQL wiki: Don't Do This](https://wiki.postgresql.org/wiki/Don%27t_Do_This) | 5 | 5 | 4 | 4 | Banco: tipos, `timestamptz`, `text`, nada de `NOT IN` com nulos |
| [Supabase Agent Skills: `supabase-postgres-best-practices`](https://github.com/supabase/agent-skills) | 4 | 5: feita para agentes | 4 | 4 | Skill pública para o Claude sobre Postgres e RLS no Supabase. Recomendada para as sessões que mexem no banco (`npx skills add supabase/agent-skills --skill supabase-postgres-best-practices`) |

Todos os links foram conferidos em 15/11/2026.

**Decisão:** Google AIPs para o desenho da API, OWASP API Top 10 para a segurança, Node.js Best Practices e as recomendações do Fastify para o processo, e PostgreSQL "Don't Do This" com a skill de Postgres do Supabase para o banco. O que já estava decidido em [`AGENTICO.md`](AGENTICO.md) (envelope, ferramenta como unidade, executor) vence quando houver diferença de forma.

## Checklist de todo endpoint e serviço

Cada item diz onde já está no código. Um PR que não cumpre um item explica por quê.

### Contrato

- [ ] **Entrada estrita:** Zod com `.strict()`, enums fechados, ids e nunca nomes. Campo desconhecido é 400 com o nome do campo (`pacotes/dominio/src/ferramentas.ts`; teste `contratos.test.ts`).
- [ ] **Contrato gerado da fonte:** OpenAPI e esquema das ferramentas saem do Zod (`npm run contratos`). Nunca à mão.
- [ ] **Versão por ferramenta:** mudança incompatível sobe `versao`; a anterior fica servida por um ciclo (AGENTICO 7).
- [ ] **Erro acionável:** `codigo` estável de `pacotes/dominio/src/erros.ts`, mais `campo`, `mensagem` para a pessoa e, quando houver, `acao_sugerida`. Nunca uma pilha de chamadas nem uma mensagem do banco crua para fora (AIP-193).
- [ ] **Escrita idempotente:** `Idempotency-Key` obrigatória, gravada na transação do efeito; reusar a chave com outros argumentos dá 409 (AIP-155; rascunho IETF).
- [ ] **`validar_apenas`** em toda escrita: sem efeito, sem evento.

### Dados e desempenho

- [ ] **Toda listagem é paginada por cursor** opaco que carrega os filtros. Nunca `offset` em lista que cresce. Página com teto: compacta 20, tela 100 (AIP-158; `executor/leitura.ts`).
- [ ] **Totais antes das linhas** e visão compacta por padrão para agentes.
- [ ] **Consulta com índice certo:** toda consulta nova de lista tem o índice que a atende (`(escritorio_id, …, criado_em desc)` ou parcial para "abertos"). Na revisão, a consulta vai com o `EXPLAIN (ANALYZE, BUFFERS)` medido com a semente.
- [ ] **Pool e tetos no banco:** pool de 10 por processo; `statement_timeout` de 5 s, `lock_timeout` de 3 s e `idle_in_transaction_session_timeout` de 10 s (`banco/pg.ts`). Transação curta: nada de chamada externa com a transação aberta.
- [ ] **Teto no HTTP:** `requestTimeout` e `connectionTimeout` de 15 s; corpo até 2 MB. Arquivo nunca passa pela API: vai por URL pré-assinada (STACK 6).
- [ ] **Operação longa vai para a fila:** acima de ~5 s, ou com chamada a órgão, banco ou modelo, vira job (`pedirJob`), enfileirado na mesma transação do efeito, e a resposta é 202 com o id para acompanhar. Nunca espera síncrona por serviço externo dentro do pedido.
- [ ] **Nada bloqueia o laço de eventos:** sem `*Sync` de disco ou de cripto no caminho do pedido; CPU pesada (PDF, OCR, hash de arquivo grande) vai para worker. Os repositórios rodam síncronos sobre dados já carregados, em milissegundos; uma operação que precise de mais do que isso ganha SQL próprio.
- [ ] **Cache só onde está medido**, com invalidação definida (STACK 5). Sem cache "por via das dúvidas".

### Segurança (OWASP API Top 10, 2023)

- [ ] **API1, autorização por objeto:** o escritório vem só do token, com RLS forçada em toda tabela; setor e carteira saem da função `autorizar` em toda escrita e em toda linha lida (`isolamento.test.ts`).
- [ ] **API2, autenticação:** token verificado em toda rota de dados; produção com o JWT do Supabase (JWKS, MFA para o Administrador).
- [ ] **API3, propriedade:** `*.atualizar` aceita só campos editáveis; colunas do servidor (`versao_linha`, `hash`, `seq`, `escritorio_id`) nunca vêm de fora (`executor/colunas.ts`).
- [ ] **API4, consumo de recurso:** limite de taxa por ator (equipe 300/min, cliente 60/min, login 30/min por IP; `limites.ts`), teto de página, de corpo e de tempo.
- [ ] **API5, função:** papel mínimo e modo gestão pelo catálogo; o integrante nunca passa do dono; o irreversível vira cartão.
- [ ] **API6, fluxo sensível:** pagar, transmitir, enviar ao cliente e assinar sempre por cartão de aprovação, decidido por pessoa, com autor e data.
- [ ] **API7, SSRF:** conector só chama host da lista do conector; nenhuma URL vinda do usuário é buscada pelo servidor.
- [ ] **API8, configuração:** CORS só para as origens cadastradas; `X-Content-Type-Options: nosniff` e `Cache-Control: no-store` em toda resposta; demonstração (`HEILD_DEMONSTRACAO`) desligada fora do ambiente local; nenhum segredo no repositório.
- [ ] **API9, inventário:** toda rota está no OpenAPI gerado; rota velha sai com versão e prazo.
- [ ] **API10, consumo de API de terceiro:** resposta externa validada por esquema (`ESQUEMA_EXTERNO`) e tratada como dado, nunca como instrução (R5).
- [ ] **Banco com menor privilégio:** a API conecta como `app_api` (sem `BYPASSRLS`) e só grava como `api_executor`; o navegador não grava.

### Operação

- [ ] **Trilha:** todo efeito, negação e erro de regra vira evento na cadeia de hash do escritório.
- [ ] **Log estruturado** em JSON, com `X-Request-Id` em toda resposta, sem token, chave, CPF, CNPJ em claro ou corpo de mensagem (`redact` do logger).
- [ ] **Desligamento gracioso:** em `SIGTERM`, para de aceitar, termina o que está em andamento e fecha o pool (`servidor.ts`).
- [ ] **Teste contra Postgres real** com RLS para toda regra nova: o caminho feliz, a negação e o isolamento.

## Onde isto já está no código (B1)

- Contrato, erros, idempotência, `validar_apenas`, cursor, totais e visão compacta: executor e ferramentas tipadas ([`IMPLEMENTACAO.md`](IMPLEMENTACAO.md), B1).
- Pool, `statement_timeout`, `lock_timeout`, `idle_in_transaction_session_timeout`: `servidor/src/banco/pg.ts`.
- Teto de pedido, de conexão e de corpo, cabeçalhos de segurança, `X-Request-Id`, `redact` do log: `servidor/src/app.ts`.
- Limite de taxa por ator e no login: `servidor/src/limites.ts`.
- Desligamento gracioso: `servidor/src/servidor.ts`.
- Fila na transação do efeito: `pedirJob` e `enfileirarNaTransacao` (a B2 instala o pg-boss).

**O que ainda não cumpre o checklist,** e entra na F1:

- a sincronização inteira (`/v1/sincronizar`) ainda não filtra por setor e carteira;
- as operações do adaptador ainda aceitam o patch livre do wireframe;
- falta o JWT do Supabase.

Os três estão em [`IMPLEMENTACAO.md`](IMPLEMENTACAO.md), "Desvios do desenho".

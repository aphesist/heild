# Stack do backend da Heild

**Versão 0.2 · 15/11/2026 · desenho, nada em produção.** Responde a quatro pedidos do Enzo:

- "quero um backend rápido, performático, que funcione bem com alto volume de dados. Rust seria o ideal?";
- "acredito que consigo passar pro Supabase de São Paulo";
- tudo acessível por agentes, organizado por setores;
- o backend nasce em cima do wireframe sem refazer o frontend.

Os documentos irmãos são [`HOSPEDAGEM.md`](HOSPEDAGEM.md), [`AGENTICO.md`](AGENTICO.md), [`ARQUITETURA.md`](ARQUITETURA.md) e [`PERGUNTAS.md`](PERGUNTAS.md). A medição está em [`poc/`](poc/README.md).

## Resumo

1. **Linguagem: TypeScript no Node 24 LTS, com Fastify, para a API, o servidor MCP e os workers. Rust não é a melhor escolha para a Heild.**
2. **O que a medição mostrou ([`poc/`](poc/README.md)):** num núcleo, com o mesmo endpoint sob RLS, Rust e Go fazem cerca de 2 vezes o trabalho do Node (3.132 e 2.829 contra 1.417 req/s) com 8 a 20 vezes menos memória. Só que trocar um índice dobrou a leitura do Node, e com o índice ruim as quatro linguagens empataram, todas presas no Postgres.
3. **Quanto isso vale em dinheiro:** com 1.000 escritórios, Rust no lugar de Node economizaria cerca de US$ 400 por mês de CPU, uns 4% da infraestrutura. O gargalo de verdade é o Postgres, e depois as APIs do governo e da IA, que respondem em centenas de milissegundos a segundos.
4. **O argumento que decide é outro.** A regra R8 pede uma função de autorização só. As regras dos planos já existem em TypeScript no wireframe: `autorizar`, o catálogo de 235 ferramentas, as 76 entidades e as regras de cada repositório. Com TypeScript, o servidor roda o mesmo código que a tela usa para esconder botões. Em qualquer outra linguagem, haveria duas cópias que divergem.
5. **Python entra só em workers de documento:** OCR, leitura de PDF e extrato, e o que a frente de IA pedir. Rust fica de reserva, para um ponto quente medido, ligado pelo napi-rs. Go é o segundo colocado honesto.
6. **Banco: Supabase Postgres em São Paulo (sa-east-1), plano Pro no piloto.** Usamos Postgres, RLS, pgvector e o Auth com MFA. Não usamos a Data API (PostgREST) no navegador, nem Edge Functions, Storage, Realtime ou o Vault para certificados.
7. **Segurança, uma falha a fechar:** hoje o navegador grava direto nas tabelas, e a RLS só separa escritórios. Qualquer conta logada pula setor, carteira e papel pelo PostgREST. Em produção, só a API escreve.
8. **Filas e procedimentos: no próprio Postgres (pg-boss), com um motor de procedimentos próprio por cima.** É ali que rodam os processos padronizados dos integrantes: passos em código, operários baratos com contrato e validadores ([`AGENTICO.md`](AGENTICO.md), 4). O job é enfileirado na mesma transação do efeito e do evento. Isso aguenta os cerca de 3 milhões de jobs por dia de 1.000 escritórios; filas quentes vão para o SQS quando a medição mandar.
9. **Cache:** nenhum Redis no começo. O perfil materializado da sessão fica em memória e é invalidado pelos eventos `conta.*`.
10. **Documentos:** S3 em São Paulo, com chave por escritório e URL pré-assinada; a API nunca passa bytes. **Busca:** texto com `tsvector` em português mais `pg_trgm`, e vetor com pgvector HNSW no mesmo banco, filtrado pelo escritório antes da busca.
11. **Eventos:** cadeia de hash síncrona por escritório, medida em cerca de 4 mil gravações por segundo. Os eventos de leitura vão numa tabela à parte, selados por lote, e uma raiz diária vai para um bucket com Object Lock.
12. **Cofre:** serviço separado com AWS KMS e envelope por escritório; o texto cifrado fica fora do banco da aplicação. O A3 não roda no servidor: usa certificado em nuvem, com a pessoa presente.
13. **Observabilidade:** OpenTelemetry em tudo, logs no CloudWatch em São Paulo, erros no Sentry sem dados pessoais e métricas de negócio lidas dos próprios eventos.
14. **Hospedagem: AWS sa-east-1 com ECS Fargate ARM**, a cerca de 1 a 3 ms do Supabase de São Paulo. O Railway não tem região no Brasil e ficaria a ~114 ms por ida e volta. O piloto sai por cerca de US$ 200 por mês, com o Supabase ([`HOSPEDAGEM.md`](HOSPEDAGEM.md)).
15. **Migração:** as telas seguem chamando `repos.*` e `useTabela`; muda o que está embaixo delas. De 25 a 30 leituras de tabelas volumosas passam para consulta paginada. O piloto fica pronto em cerca de 4,5 meses com 2 pessoas ([`ARQUITETURA.md`](ARQUITETURA.md)).

---

## 1. Que tipo de carga é esta

Antes de escolher a linguagem, vale olhar para onde vai o tempo de um pedido da Heild:

| Trabalho | Onde gasta | Tempo típico | Fonte |
| --- | --- | --- | --- |
| Tela lê ou grava (tarefa, cliente, cartão) | Postgres: 3 a 6 idas e voltas por transação (fixar o escritório, ler, gravar, evento) | 1 a 3 ms de CPU de servidor; 3 a 15 ms de rede e banco na mesma região | Medição ([`poc/`](poc/README.md)) |
| Integrante chama ferramenta | Igual ao de cima, mais o modelo de IA | O modelo leva segundos; a ferramenta, milissegundos | 02, 4.7; 07 |
| Coletor (DF-e, NFS-e, e-CAC, Integra) | Espera do órgão, cursor, retentativa | 0,3 a 20 s por chamada, com bloqueios de até 1 h (código 656 da DF-e) | 08, 2.3 |
| Documento (XML, PDF, extrato, OCR) | CPU: análise, OCR, hash | ms (XML) a segundos (OCR) | 08, 9 |
| Consulta legal (M1) | Busca, reranker, modelo | 8 a 20 s | 07, tabela de custos |

A carga é **dominada por espera**: banco, órgãos públicos e IA. A CPU do servidor HTTP é a menor parcela, e os poucos pontos pesados de CPU (OCR, PDF, embeddings) são trabalho de fila, que pode rodar em outro processo e em outra linguagem. "Alto volume de dados" aqui quer dizer muitos eventos, documentos e mensagens por escritório. Isso se resolve no **desenho do banco e das consultas**: índices, partições, paginação, eventos de leitura fora da cadeia. É também o que a rodada A da medição mostrou: com índice ruim, Rust e Node empatam.

## 2. A linguagem

### 2.1 Os critérios, nota por nota

Notas de 1 a 5 para o caso da Heild; o comentário diz de onde veio a nota.

| Critério | Rust (axum) | Go | TypeScript (Node/Bun) | Elixir (Phoenix) | Python (FastAPI) |
| --- | --- | --- | --- | --- | --- |
| Desempenho por núcleo com Postgres | **5**. Medido: 3.132 req/s no misto; 1º entre os grandes no TechEmpower R23 (Fortunes axum-pg 1,11 mi req/s) | **4,5**. Medido: 2.829 req/s | **3**. Medido: 1.417 (Node) e 1.851 (Bun). No R23 com 20 consultas, o fastify-postgres faz 76 mil req/s, contra 87 mil do axum: quando o banco domina, a distância cai | 3. R23: Phoenix 169 mil no Fortunes e 27 mil com 20 consultas. Não medido aqui | 2. R23: FastAPI 109 mil no Fortunes e 37 mil com 20 consultas |
| Memória | **5**. 8 MB | 4,5. 20 MB | 2,5. 100 a 165 MB | 3. A BEAM fica em ~50 a 100 MB **[estimativa, não medido]** | 2. ~60 a 100 MB por processo **[estimativa]** |
| Produtividade de um time pequeno | 2. Compilação lenta, async e tempo de vida custam no dia a dia; as regras de negócio mudam toda semana | 4. Simples e previsível; prolixo para validação e JSON | **5**. Mesma linguagem e mesmos tipos do frontend; Zod faz validação, tipos e JSON Schema numa coisa só | 3. Excelente para concorrência; poucos dominam | 4. Rápido de escrever; tipagem fraca para um domínio com 76 entidades |
| Reaproveitar o que já existe no wireframe | 1. Reescrever `autorizar`, o catálogo, as regras e as entidades | 1. Idem | **5**. Mesmo pacote no navegador e no servidor | 1 | 1 |
| Postgres e filas | 4. sqlx e tokio-postgres; filas: apalis, ou faça você mesmo | 5. pgx é o melhor driver; river é fila sobre Postgres | 5. postgres.js e pg; pg-boss e Graphile Worker são filas sobre Postgres | 5. Postgrex, Ecto, Oban (a melhor fila sobre Postgres) | 4. psycopg 3, SQLAlchemy; Celery, Dramatiq ou Procrastinate |
| XML fiscal e assinatura com A1 | 2. nfe-core 0.1.2 (abr/2026, poucas centenas de downloads), xml-sec 0.6 | 2,5. frones/nfe com A1 e assinatura, cobertura não verificada; NFS-e e eSocial não achados | 3,5. xml-crypto 6.4, node-forge, node-sped-nfe (MIT), @treeunfe/nfe e nfewizard-io (GPL-3.0) | 1,5. Quase nada | **4,5**. nfelib 3.3 e erpbrasil.assinatura (MIT), PyNFe, signxml, zeep para SOAP |
| SOAP de órgão público com TLS mútuo | 3 | 3,5 | 3,5. `https.Agent({ pfx })` nativo; envelope escrito à mão | 2,5 | **4,5**. zeep |
| ACBrLib (a referência brasileira, LGPL, .so para Linux) | 3 por FFI | 3 por cgo | 3 por FFI (koffi); não há binding oficial | 2 | 4 por FFI, com exemplos |
| PDF, OCR, documentos | 2 | 2,5 | 3. pdfjs/unpdf para texto; Chromium para gerar PDF com o tema | 2 | **5**. PyMuPDF, docling, Tesseract e PaddleOCR |
| IA e MCP | 3. rmcp 3.10 (tier 1) | 3,5. go-sdk 1.8 (tier 1) | **5**. O SDK do MCP é a implementação de referência (1.32.2, 23/10/2026); SDKs de IA de primeira linha | 2,5. Sem SDK oficial do MCP | **5**. SDK do MCP de tier 1 (2.3.0); o ecossistema de IA nasce em Python |
| WhatsApp Cloud API | REST direto | REST direto | REST direto; o SDK da Meta para Node está parado em 0.0.5-alpha desde 2023 | REST direto | REST direto |
| Contratação no Brasil | 2 | 3,5 | **5** | 1,5 | 4,5 |
| Custo de hospedagem | 5 | 4,5 | 3 | 3,5 | 2,5 |

**Sobre contratação:** não achamos pesquisa pública com recorte do Brasil. O dado mais próximo é o Stack Overflow Survey 2025, mundial, uso entre profissionais: JavaScript 68,8%, Python 54,8%, TypeScript 48,8%, Go 17,4%, Rust 14,5%, Elixir 2,8% (survey.stackoverflow.co/2025, acesso em 15/11/2026). Fintechs brasileiras usam Go e Elixir, mas o grosso do mercado é JavaScript, TypeScript e Python. Como o frontend já é TypeScript, um time pequeno com uma linguagem só é mais fácil de montar e de cobrir em férias.

**Sobre os benchmarks públicos:** o TechEmpower foi arquivado em 24/03/2026. A Round 23, rodada de 30/01 a 06/02/2025 e publicada em 17/03/2025, é a última. Os números vêm do `round23/ph.json` oficial.

### 2.2 A decisão

**TypeScript no Node 24 LTS para a API, o servidor MCP, o despachante de eventos, os conectores e o serviço do cofre. Python 3.13 só nos workers de documento. Nenhum Rust agora.**

Por que não Rust, mesmo sendo o mais rápido:

1. **A economia é pequena.** Com a margem de 3 vezes sobre a medição ([`HOSPEDAGEM.md`](HOSPEDAGEM.md), seção 3), 1.000 escritórios pedem em média cerca de 15 vCPU de API em Node, contra cerca de 7 em Rust. A diferença é de uns 8 vCPU × US$ 49,60 por mês no Fargate ARM, perto de US$ 400 por mês num total estimado de US$ 9 mil (~4%). Uma semana de uma pessoa a mais por ano já come isso.
2. **O gargalo não é a API.** A rodada A mostrou as quatro linguagens empatadas com o Postgres em 175% a 190% de CPU. Com 1.000 escritórios, o maior item da conta é o banco (US$ 4,5 a 6 mil por mês), e ele cresce com consultas e índices, não com a linguagem da API.
3. **R8 e o código que já existe.** Ver o item 4 do resumo. Reescrever em Rust é pagar duas vezes e aceitar que tela e servidor divirjam sobre quem pode o quê.
4. **O ecossistema fiscal em Rust é imaturo** (crates 0.1.x com poucas centenas de downloads), e contratar no Brasil é mais difícil.

Por que não Go, que é o segundo colocado honesto: Go teria quase o desempenho do Rust com metade do atrito, e seria a escolha se o wireframe não existisse. Perde pelos mesmos motivos 3 e 4, que pesam menos que no Rust mas pesam: duas linguagens no núcleo para um time pequeno, regras duplicadas e o SDK do MCP de referência sendo o de TypeScript.

Por que Node e não Bun: o Bun foi 31% melhor no misto e usou 40% menos memória com o mesmo código, e é tentador. Mas a instrumentação OpenTelemetry automática, os drivers e as bibliotecas de XML e criptografia são testados primeiro no Node, e um time pequeno não deve caçar incompatibilidade de runtime. **O código fica neutro de runtime** (sem APIs `Bun.*` nem `node:` exóticas fora de um módulo de borda), e o Bun pode ser medido de novo em um ano.

### 2.3 Onde mistura e por quê

| Parte | Linguagem | Por quê |
| --- | --- | --- |
| API HTTP, servidor MCP, executor de ferramentas, autorização | TypeScript (Node 24, Fastify 5) | Mesmo pacote de domínio do frontend (seção 2.4); Fastify foi o medido e tem instrumentação OpenTelemetry |
| Despachante de eventos, jobs, conectores (Integra, DF-e, NFS-e, eSocial, WhatsApp, bancos, nuvens) | TypeScript | São espera de rede e regra de negócio; usam as mesmas ferramentas e o mesmo executor |
| Cofre de credenciais | TypeScript, **processo e papel de IAM separados** | Isolamento: só ele chama o `kms:Decrypt`; a linguagem é a mesma para não criar uma terceira |
| Assinatura XML (NF-e, eventos, DPS, eSocial, Reinf) | TypeScript (xml-crypto + node-forge); **ACBrLib por FFI como reserva** | Os casos da fase 1 são poucos e conhecidos. Se a cobertura crescer (NFS-e municipais fora do padrão, CT-e, MDF-e), a ACBrLib cobre mais e com manutenção da comunidade brasileira |
| Motor de procedimentos e runner dos operários (passos de modelo com contrato, esquema estrito e orçamento) | TypeScript, serviços `worker` e `operarios` | Os procedimentos usam as mesmas ferramentas, validadores e esquemas Zod do pacote de domínio; só o `operarios` tem a chave do fornecedor de modelos |
| OCR, leitura de PDF escaneado, extrato em PDF, classificação de documento | **Python** (worker de fila) | Onde o ecossistema Python é muito melhor (PyMuPDF, docling, PaddleOCR). Fala com o resto só pela fila e devolve resultado tipado; não acessa o banco por fora do executor |
| Reranker e base legal (M1) | Fica com a frente de IA | Fora deste desenho; o encaixe está no [`AGENTICO.md`](AGENTICO.md), seção 10 |
| Rust | **Nenhum agora** | Gatilho para usar: um ponto quente medido em produção, como a leitura de arquivos SPED de centenas de MB ou a verificação em massa da cadeia de eventos, em que o TypeScript passe de 50% da CPU de um worker. Entra como módulo nativo (napi-rs) chamado pelo worker em TypeScript, sem serviço novo |

### 2.4 O pacote de domínio compartilhado

O que hoje está em `app/src/nucleo` se divide em dois:

| Vai para `pacotes/dominio` (roda no navegador e no servidor) | Fica no frontend |
| --- | --- |
| `modelo/` (entidades, `Tabelas`, nomes das tabelas) | `banco/` (vira cache do lado do cliente, [`ARQUITETURA.md`](ARQUITETURA.md), seção 6) |
| `permissoes/` (`autorizar`, catálogo de ferramentas, `permissoesDoPerfil`, setores) | `react.tsx`, `rotas.ts`, `mapeadores/` |
| As regras de cada entidade (`validar`, `antesDeAtualizar`, transições de tarefa, cartão, mensagem interna) | `semente/` (vira carga de demonstração do servidor) |
| **Novo:** esquema Zod de entrada e saída de cada ferramenta, `descricao_modelo`, `idempotencia`, `evento`, `exposta_mcp` (os campos do 6.1 que faltam) | |

O servidor importa o pacote e executa as ferramentas com SQL. O frontend usa o mesmo pacote para esconder botões e para a atualização otimista. **É uma fonte só para a autorização, os tipos, a validação, o OpenAPI e o esquema das ferramentas do MCP** ([`AGENTICO.md`](AGENTICO.md), seção 4).

### 2.5 Bibliotecas por necessidade

| Necessidade | Escolha | Observação |
| --- | --- | --- |
| HTTP | Fastify 5 | Medido; serialização por esquema; plugins de rate limit, CORS, multipart |
| Validação e contratos | Zod 4 (`z.toJSONSchema`) | Uma definição gera o tipo TypeScript, o JSON Schema do MCP e o OpenAPI 3.1 |
| Postgres | postgres.js (o medido), SQL escrito à mão; tipos gerados do esquema | Sem ORM: as consultas que importam são poucas e precisam de índice certo. Migrações SQL versionadas, como as de `app/supabase/migrations` |
| Fila e agenda | pg-boss | Seção 4 |
| JWT | jose, com o JWKS do Supabase Auth | 100 µs por verificação ES256 (medido); cache por token até o `exp` |
| XML | fast-xml-parser (ler), xml-crypto (assinar), node-forge (PFX), validação por XSD no CI | |
| SOAP | Envelope por modelo de texto e `https.Agent({ pfx, passphrase })` | Sem gerador de cliente SOAP; os serviços usados são poucos |
| PDF para ler | unpdf (texto embutido); escaneado vai para o worker Python | |
| PDF para gerar (guia, holerite, comprovante, relatório com o tema) | HTML com os tokens da marca, impresso pelo Chromium headless num worker | O mesmo tema da marca branca (R6) sem segundo motor de layout |
| OCR | Worker Python (PaddleOCR ou Tesseract) **ou** serviço gerenciado com processamento no Brasil | Decidir com um teste de qualidade em guias e extratos reais; pode ser o modelo de visão da frente de IA |
| WhatsApp, e-mail, bancos, cobrança | REST direto, um conector por fornecedor (08, seção 7) | |
| MCP | `@modelcontextprotocol/sdk` (TypeScript, referência) | Transporte Streamable HTTP |
| Testes | Vitest; teste de vazamento entre escritórios (Fundações 11) rodando no CI contra um Postgres real com RLS | |

## 3. Banco: Supabase Postgres em São Paulo

### 3.1 O que usar e o que não usar

O projeto atual do wireframe (`rgptcikkxucyysfwarxb`) está em **us-east-1**. O Supabase não muda projeto de região: o de São Paulo é **um projeto novo**, com as mesmas migrações. O de us-east-1 pode seguir com os dados de demonstração.

| Recurso | Usar? | Por quê |
| --- | --- | --- |
| **Postgres 16/17 + RLS forçada** | **Sim** | O desenho DA-01 já pronto em 76 tabelas. A API conecta com um papel sem `BYPASSRLS`; em cada transação, fixa `request.jwt.claims` e `role authenticated` com uma ida só ao banco (`select set_config(...), set_config(...)`), e as políticas atuais (`escritorio_atual()`) continuam valendo sem mudança |
| **pgvector** | **Sim** | Busca vetorial do M2 no mesmo banco e sob a mesma RLS (seção 7) |
| **Auth** (GoTrue) | **Sim** | Login, senha, link mágico, MFA por TOTP (obrigatório para o Administrador, 2.5), recuperação. Escritório e subinquilino vão em `app_metadata` por um *custom access token hook* em SQL. O código do app do cliente por WhatsApp sai pelo hook de envio de SMS, com o nosso conector |
| **Data API (PostgREST) no navegador** | **Não, em produção** | A RLS só separa escritórios (3.4). Setor, carteira, papel e exceção são da função única. Com a Data API aberta, um Colaborador lê e grava qualquer coisa do escritório. Ver a seção 3.3 |
| **Edge Functions** | Não | Outro runtime (Deno), outro deploy e limite de CPU por chamada. Tudo o que elas fariam, a API ou um worker faz com o mesmo executor |
| **Storage** | Não | Precisamos de chave por escritório para destruir os dados na saída (08, 3.2; 06, 12.6) e de ciclo de vida para arquivo frio. O S3 com KMS faz isso; o Storage do Supabase não aceita chave do cliente |
| **Realtime** | Não | O aviso de "mudou" precisa passar pela mesma autorização (02, 5.7: "o evento só chega se o dono o veria"). A API manda por SSE, filtrando por escopo ([`ARQUITETURA.md`](ARQUITETURA.md), seção 6.4); também é mais fácil de levar para fora do Supabase |
| **Vault** (pgsodium) | Não para credenciais | 08, 3.2: "bytes e senhas nunca passam pelo banco da aplicação" |
| **Queues** (pgmq) e **Cron** (pg_cron) | Não no começo | O pg-boss faz fila e agenda na mesma transação do evento, com código nosso e portátil; pg_cron só para manutenção (partições, limpeza de idempotência) |
| **Branching** | Sim, no CI | Banco de prévia por PR a US$ 0,01344/h por branch |
| **Supavisor** (pooler) | Só se faltar conexão | A API e os workers mantêm um pool próprio (10 por tarefa). A conexão direta do Supabase é IPv6; no Fargate isso pede VPC dual-stack ou o add-on de IPv4 dedicado **[preço a conferir no painel]**. Há relato de perda de pacotes IPv6 do Fly gru até o Supabase, resolvido pelo pooler IPv4 (community.fly.io, 2026) |

### 3.2 Planos, limites e preços

Preços de supabase.com/pricing e da documentação de compute, acesso em 15/11/2026. Nenhuma página fala de sobrepreço por região.

| Item | Valor |
| --- | --- |
| Pro | US$ 25/mês com US$ 10 de crédito de compute; 100 mil MAU no Auth; 8 GB de disco; 250 GB de egress; backup diário retido 7 dias |
| Team | US$ 599/mês; **SOC 2** só a partir daqui; backup de 14 dias; logs de 28 dias |
| PITR | 7 dias ≈ US$ 100/mês; 14 dias ≈ US$ 200; 28 dias ≈ US$ 400 |
| Disco | gp3 a US$ 0,125/GB acima de 8 GB; 3.000 IOPS incluídos; até 64 TB |
| Réplica de leitura | Mesmo compute do primário, disco 1,25 vez maior, sem o crédito; só em região específica (São Paulo serve) |
| LGPD e DPA | O DPA é público, junto dos termos. **Não achamos menção explícita à LGPD** nem DPA assinado individualmente (relato de terceiros). É uma das perguntas comerciais ([`PERGUNTAS.md`](PERGUNTAS.md), P3) |

| Compute | CPU | RAM | US$/mês | Conexões diretas | Pooler | IOPS máx. |
| --- | --- | --- | --- | --- | --- | --- |
| Micro | compartilhada | 1 GB | 10 | 60 | 200 | 11.800 |
| Small | compartilhada | 2 GB | 15 | 90 | 400 | 11.800 |
| Medium | compartilhada | 4 GB | 60 | 120 | 600 | 11.800 |
| Large | 2 dedicadas | 8 GB | 110 | 160 | 800 | 20.000 |
| XL | 4 | 16 GB | 210 | 240 | 1.000 | 20.000 |
| 2XL | 8 | 32 GB | 410 | 380 | 1.500 | 20.000 |
| 4XL | 16 | 64 GB | 960 | 480 | 3.000 | 20.000 |
| 8XL | 32 | 128 GB | 1.870 | 490 | 6.000 | 40.000 |
| 16XL | 64 | 256 GB | 3.730 | 500 | 12.000 | 80.000 |

### 3.3 O que muda no esquema antes de dado real

A migração `20261114120000_fundacoes.sql` e as das sessões S06 a S08 são a base. Antes do piloto, mudam assim (sempre em migração nova, nunca editando a aplicada):

1. **Fechar a escrita do navegador.**
   - Revogar `insert/update/delete` do papel `authenticated` nas tabelas de negócio e desligar a Data API no projeto de produção.
   - A API conecta como `app_api`, sem `BYPASSRLS`, e assume `authenticated` por transação, como na medição.
   - As políticas continuam como estão: são a segunda barreira (R8).
2. **Cadeia do evento.**
   - `seq` monotônico por escritório, mais `hash_anterior` e `hash` (`bytea`), como na medição.
   - Uma tabela `cadeia_evento` com um elo por escritório.
   - Faltam também as colunas do 5.1 que o wireframe não tem: `usuario_dono_id` já existe; faltam `ferramenta_versao`, `custo`, `credencial_usada`, `tarefa_id`, `conversa_id`, `sessao_integrante_id`, `aprovacao_id`, `causado_por_evento_id`, `inicio` e `fim`.
3. **Eventos de leitura numa tabela própria** (`evento_leitura`), particionada por mês, gravada em lote fora da transação de leitura e selada por lote (seção 8). O P6 das Fundações pede o registro de leitura e diz "custo de volume a medir": são de 10 a 20 leituras por escrita. Com 1.000 escritórios, a estimativa é de 20 milhões de linhas por dia.
4. **Índices pelas consultas reais**, a lição da rodada A da medição.
   - Índices parciais para "abertos por prazo" (tarefa, conversa, cartão, item de fila).
   - `(escritorio_id, criado_em desc)` com cursor nas linhas do tempo.
   - Nada de `offset` em lista grande.
5. **Partições** por mês em `evento`, `evento_leitura`, `mensagem`, `pulso_portal`, `bpo_transacao` e `lancamento`, quando a tabela passar de algumas dezenas de milhões de linhas. Partição antiga vira Parquet no S3 (5.2: arquivo frio, nunca removido em retenção).
6. **Versão de linha para sincronizar**: uma coluna `versao bigint` de uma sequência por escritório, atualizada por gatilho. É o que a API usa no `GET /v1/sincronizar?desde=` ([`ARQUITETURA.md`](ARQUITETURA.md), seção 6).
7. **Idempotência**: a tabela `idempotencia (escritorio_id, chave, ferramenta, hash_argumentos, resposta, criado_em)` com chave única, limpa depois de 7 dias.
8. **Ids**: hoje são texto com prefixo (`tk...`) e servem. Os novos passam a ser UUIDv7 em texto com o mesmo prefixo: ordenáveis pelo tempo e sem colisão entre réplicas e workers.

### 3.4 Quando sair do Supabase para o RDS

O desenho mantém a saída barata: Postgres comum, pgvector e RLS lendo `request.jwt.claims` por uma função nossa (`auth.jwt()`, como na medição). Não usamos Edge Functions, PostgREST, Realtime nem Storage. O que prende é o Auth: os usuários são exportáveis com hash bcrypt, e a API só confia no JWKS, então trocar de emissor é trocar a URL.

Sair quando acontecer **qualquer um** destes:

| Gatilho | Sinal |
| --- | --- |
| Contrato | Cliente grande ou BPO exige DPA com LGPD assinado, chave do cliente no banco (BYOK) ou auditoria que o Supabase não dá |
| Tamanho | Precisa passar do 16XL, de várias réplicas com papéis diferentes ou de parâmetros e extensões que o Supabase não libera |
| Preço | O Supabase passa o RDS Multi-AZ equivalente somado a meio período de uma pessoa de operação. Hoje, um db.m7g.xlarge Multi-AZ em sa-east-1 custa US$ 0,884/h (≈ US$ 645/mês), contra US$ 210 do XL do Supabase sem alta disponibilidade |
| Operação | Duas quedas em seis meses que o SLA do plano não cobre |

A saída leva cerca de 3 semanas-pessoa: `pg_dump` e restauração (ou replicação lógica para cortar sem parar), exportação do Auth, troca do emissor de JWT e da string de conexão. Com 100 escritórios, o mais provável é continuar no Supabase Team; com 1.000, comparar com Aurora PostgreSQL ou RDS Multi-AZ é obrigatório ([`HOSPEDAGEM.md`](HOSPEDAGEM.md), seção 5).

## 4. Filas e jobs

Os integrantes, os coletores e as conferências geram muito trabalho assíncrono. Estimativa com 1.000 escritórios médios (100 clientes cada):

- coletores: cerca de 30 jobs por cliente por dia (DF-e e NFS-e a cada 2 h, e-CAC, caixa postal, certidões), ou ~3 milhões de jobs por dia, cerca de 35 por segundo em média e ~100 no pico;
- documentos: ~30 milhões por mês;
- integrantes: os eventos que os acordam (02, 7.2).

**Escolha: pg-boss, no próprio Postgres.**

- **Enfileirar na mesma transação** do efeito e do evento (o *outbox* vira a própria fila). Se a transação volta, o job some junto. Com SQS ou Redis, isso exigiria um *outbox* mais um transmissor.
- Usa `SKIP LOCKED`, com retentativa e espera crescente (1 min, 5, 30, 2 h, 12 h do 08, 2.3), fila morta, agenda (cron), prioridade e *singleton key*, que é a deduplicação do despachante (02, 5.7: `(gatilho_id, chave_dedupe)` na janela).
- Mesma RLS e mesmo backup. Um job é uma linha que se consulta: "por que a captura da Empresa X parou?" se responde com SQL.
- O volume cabe com folga: filas sobre Postgres sustentam milhares de jobs por segundo num banco médio, e precisamos de ~100 no pico.

Regras:

- Uma fila por tipo: `coletor.*`, `documento.processar`, `integrante.acordar`, `notificacao.entregar`, `selagem.*`.
- Concorrência por escritório limitada, para um escritório grande não engolir os outros (C10). Fila com limite por órgão: uma sessão por portal por escritório; o bloqueio 656 da DF-e espera a hora inteira.
- O worker executa **ferramentas** pelo mesmo executor, com `origem = job` (R1); nunca grava direto.
- O worker Python lê a fila `documento.ocr` e devolve o resultado chamando `documento.registrar_leitura` pela API interna.

**Quando passar para o SQS:** quando a fila consumir mais de ~15% da CPU do banco ou passar de ~500 jobs por segundo sustentados. Passam as filas quentes e sem transação, como `notificacao.entregar` e a captura bruta; o *outbox* continua no Postgres. Os fluxos longos ficam num **motor de procedimentos próprio**, pequeno, sobre estas mesmas filas: um job por passo, com o estado de cada execução em tabelas do domínio (`execucao`, `passo_execucao`), *checkpoint* antes de avançar e retomada depois de cartão (48 h) ou espera de órgão. A avaliação dos integrantes pede ao backend procedimentos por processo, validadores e a fila dos operários baratos ([`AGENTICO.md`](AGENTICO.md), seção 4).

O motor é próprio, e não o Temporal, porque o estado precisa ser dado do domínio: visível na tela e nas ferramentas, sob RLS e na mesma transação do evento. Também não pede cluster novo para um time pequeno. Se o motor crescer além do previsto, a próxima opção é uma biblioteca de execução durável sobre Postgres, e não um cluster.

## 5. Cache

- **Sem Redis no começo.** O que vale cache:
  - o **perfil materializado da sessão** (3.2: "qualquer evento `conta.*` invalida o cache"), em memória do processo, por 5 minutos ou até chegar um evento `conta.*` do escritório pela mesma cauda de eventos que alimenta o SSE;
  - o **JWT verificado**, até o `exp`;
  - o **catálogo de ferramentas e atividades**, carregado no boot;
  - as **tabelas de cálculo e a base legal**, que são da frente de IA.
- **Limites de taxa:** por instância, com o limite dividido pelo número de instâncias; os contadores que valem dinheiro (chamadas pagas, teto de custo da conexão, 08, 2.3) ficam no Postgres, que já é a fonte da cobrança.
- **Quando pôr um Valkey (ElastiCache Serverless):** limite de taxa exato com mais de 4 instâncias de API, cache semântico do M1 compartilhado (07), ou sessões de SSE que precisem de *fan-out* entre instâncias acima de ~20 mil conexões.

## 6. Documentos

- **S3 em sa-east-1**, um bucket por ambiente.
  - Chave `escritorio_id/cliente_id/ano/competencia/tipo/hash`: o caminho da árvore (7.2) é metadado no índice, não a chave do objeto. Assim, renomear pasta não move bytes, e duplicata por hash é um objeto só (P15).
  - Criptografia SSE-KMS por escritório ([`PERGUNTAS.md`](PERGUNTAS.md), P7).
  - Ciclo de vida: Standard por 30 dias → Standard-IA (US$ 0,0221/GB-mês em São Paulo, a premissa do estudo de precificação) → cópia em Deep Archive para a guarda longa.
- **Upload**:
  1. O navegador e o app pedem `documento.preparar_envio` e recebem uma URL pré-assinada.
  2. Mandam o arquivo direto ao S3.
  3. Chamam `documento.registrar`.
  4. O worker confere o tamanho e calcula o SHA-256 na ingestão (7.7).
- **Download**: URL pré-assinada de 5 minutos, gerada depois de `autorizar`. Abrir pelo app grava o registro de entrega.
- **Conectores de nuvem do escritório** (Drive, OneDrive): o índice aponta para o conector (`backend_id`) e os bytes ficam lá (7.1). O S3 é o backend `plataforma`.

## 7. Busca

| Busca | Como | Onde |
| --- | --- | --- |
| Global por nome, CNPJ, CPF, número de nota | `pg_trgm` com índice GIN em colunas normalizadas (sem acento, sem máscara) | Mesmo banco, mesma RLS |
| Texto do escritório: mensagens, notas internas, conteúdo de documentos | `tsvector` com dicionário `portuguese` e `unaccent`; ranking `ts_rank_cd` | Coluna gerada com índice GIN; documento grande tem o texto num registro à parte |
| Vetorial (M2 `escritorio.buscar`, memória dos integrantes) | pgvector, índice HNSW, vetor único (07: "vetor único basta"); varredura iterativa do pgvector 0.8 para não perder resultado quando o filtro é forte | Tabela `trecho_indexado`, com RLS e filtro por escritório, cliente, setor e `areas` **antes** da busca (07, regra do escopo) |
| Híbrida | BM25 aproximado (`ts_rank_cd`) mais vetor, juntos por *reciprocal rank fusion* em SQL; reranker leve nos 30 primeiros | O reranker é da frente de IA |
| Base legal (M1) | Fora do banco dos escritórios: é global e não é dado de cliente | A frente de IA decide; o pedido daqui é não misturar com dado de inquilino |

Quando um escritório passar de alguns milhões de trechos, a tabela vetorial ganha partição por *hash* de `escritorio_id`, com HNSW por partição. Isso dá o "um índice por escritório" do 07 sem um banco por escritório.

## 8. Eventos e auditoria com cadeia de hash

- **Síncrono, na transação do efeito (R2).** É o que a medição fez.
  1. A última instrução antes do `commit` trava o elo do escritório (`select ... from cadeia_evento for update`).
  2. Calcula `hash = SHA-256(hash_anterior || forma canônica do evento)` na aplicação.
  3. Grava o evento e o elo novo.
  - A trava fica só alguns milissegundos.
  - A medição sustentou cerca de 4 mil gravações por segundo com 100 escritórios, num servidor de um núcleo.
  - Por escritório, o teto prático é de algumas centenas de gravações por segundo. Uma importação de 10 mil documentos leva dezenas de segundos, o que é aceitável.
  - **Se aparecer disputa** (importações grandes, muitos integrantes no mesmo escritório), a troca é a selagem assíncrona: o evento entra com `seq`, e um job sela em ordem a cada segundo. Fica registrada como plano B, sem implementar agora.
- **Forma canônica:** JSON com chaves ordenadas dos campos do 5.1, sem `argumentos_resumo` sensível. A função de canonização mora no pacote de domínio, para a verificação rodar igual em qualquer lugar.
- **Eventos de leitura:** vão para `evento_leitura`, em lote (até 500 ou a cada 2 s), fora da transação de leitura. Cada lote leva o hash do lote anterior. Prova "quem leu o quê" (5.2) sem pôr 20 milhões de travas por dia na cadeia principal. A partição é mensal; depois de 90 dias, vira Parquet no S3.
- **Âncora externa:** uma vez por dia, o job `selagem.ancorar` grava, por escritório, o último `seq` e o `hash` num bucket S3 com **Object Lock em modo compliance**. Assim, nem um administrador do banco consegue reescrever a cadeia sem que `auditoria.verificar_cadeia` perceba. O Administrador do escritório pode baixar o recibo.
- **Imutabilidade no banco:** os gatilhos que já existem (`recusar_operacao`) continuam. O papel da aplicação não tem `update` nem `delete` em `evento`, e `restaurar_demonstracao()` só existe no ambiente de demonstração.

## 9. Cofre de credenciais e certificados

Segue o 08, seção 3: o segredo nunca passa pelo banco da aplicação, só o conector abre e cada uso gera evento.

| Peça | Desenho |
| --- | --- |
| Serviço | `cofre`, processo próprio no Fargate, com papel de IAM próprio. Só ele tem `kms:Decrypt` e acesso ao bucket do cofre |
| Chave | Uma chave KMS por escritório (US$ 1/mês cada, o que o estudo de precificação já conta como R$ 8) **ou** uma chave de dados por escritório envelopada por uma chave KMS da plataforma. A recomendação está em [`PERGUNTAS.md`](PERGUNTAS.md), P7 |
| Onde fica o texto cifrado | Bucket S3 separado (`heild-cofre-<ambiente>`). Contexto de criptografia `{escritorio_id, credencial_id}`, então um objeto copiado para outro escritório não abre. O banco guarda só `cofre_ref`, titular, tipo, validade, serviços, termo e situação |
| Envio do A1 | O app manda o PFX e a senha **direto ao `cofre`**, sem passar pela API principal (06, 6.2). O cofre abre o PFX, confere o titular contra o CNPJ do cliente e a validade, cifra, grava e emite `credencial.vincular` |
| Uso | O worker do conector pede ao `cofre` uma **operação**, não o segredo: "assine este XML", "abra uma conexão TLS mútua com este host". Quando a biblioteca exige a chave em memória, o cofre a entrega só ao worker de conectores, por canal interno, para aquela chamada. Cada uso gera `credencial.usar` |
| A3 | **Não no servidor.** Um token físico não vai para a nuvem, e um HSM próprio custa caro (CloudHSM em sa-east-1: US$ 2,72/h por HSM, ≈ US$ 1.986/mês, e alta disponibilidade pede 2). O que exige A3 usa **certificado em nuvem** (BirdID, VIDaaS, SafeID, padrão OAuth do DOC-ICP-17.01) com a pessoa autorizando no cartão de aprovação, ou continua em D-assistido. Validade do token de sessão e API direta dos PSCs: **não confirmadas** |
| Tokens e OAuth (Meta, Asaas, Drive) | Mesmo cofre, mesmo envelope; o refresh token renova dentro do cofre |
| Saída do escritório | Agenda a destruição da chave KMS (ou apaga a chave de dados envelopada e as cópias dela) depois da exportação. Os objetos ficam ilegíveis |

## 10. Observabilidade

- **OpenTelemetry** na API, nos workers e no cofre.
  - Um *span* por ferramenta, com nome, nível, escritório (id, nunca nome), resultado e duração.
  - O `traceparent` vai no evento (correlação) e nos jobs: um pedido de integrante se segue da fila até o órgão público.
- **Logs** estruturados em JSON no **CloudWatch Logs em sa-east-1**, sem corpo de mensagem, CPF, CNPJ em claro, senha ou token (lista de bloqueio no *logger*). Dado de cliente não sai do Brasil por log.
- **Erros** no Sentry, com limpeza de dados pessoais ligada. É transferência internacional de metadados técnicos; se o jurídico preferir, usar o Sentry auto-hospedado.
- **Métricas de negócio** saem dos eventos, que já são a fonte (5.5): ferramentas por resultado, cartões pendentes, saúde dos conectores (08, 2.4: o painel global), custo por escritório e por cliente.
- **Alertas:**
  - p99 da API acima de 500 ms;
  - erro acima de 1%;
  - fila com item mais velho que 15 minutos;
  - três falhas seguidas de um conector, que também acordam o integrante de Gestão (08, 2.4);
  - cadeia que não verifica;
  - CPU do banco acima de 70% por 15 minutos.

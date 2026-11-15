# Pesquisa 01: Infraestrutura em nuvem (AWS) e alternativas

4 de novembro de 2026

Esta pesquisa estima quanto custa a infraestrutura do assistente para contadores: banco com busca vetorial e textual, computação da API e dos workers, GPU para os modelos pequenos da cascata (recuperador multivetorial, reranker de raciocínio e política de busca), armazenamento dos originais, OCR, observabilidade, segurança, treinos ocasionais e créditos de startup. A arquitetura de referência está no [Plano do Assistente](../planos/Plano_Assistente_de_IA_para_Contadores.md) e no [Plano de Ingestão](../planos/Plano_de_Ingestao_da_Base_Legal.md). **Os LLMs principais, chamados por API, ficam de fora:** outra pesquisa cobre esse custo, que será o maior item variável do produto.

**Como ler os números**

- Preços em dólares, sem impostos (no Brasil incidem IOF e tributos sobre serviço importado, que esta pesquisa não calcula), por mês de 730 horas.
- **Câmbio: US$ 1 = R$ 5,4772**, a PTAX de fechamento de 4/11/2026 segundo o [Numerando](https://numerando.com.br/cambio/dolar-americano/2026), mais recente que a referência de 3/11 (R$ 5,4935). A fonte não diz se a taxa é de compra ou de venda. Com R$ 5,4935, todos os valores em reais sobem 0,3%.
- As páginas oficiais de preço da AWS montam as tabelas por JavaScript, e a ferramenta usada não conseguiu ler os números nelas. Os preços abaixo vêm de agregadores que reproduzem a [Price List API da AWS](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/price-changes.html) (Bytebase DB Cost, DoiT, Holori, aws-pricing.com, CostGoat), conferidos com os exemplos numéricos das páginas oficiais quando eles existem. Cada tabela traz a URL oficial e a URL de onde o número foi lido.
- **(nc)** = não confirmado em fonte oficial ou estimado por mim. A lista completa está na seção 13.
- Regiões: **SP** = sa-east-1 (São Paulo); **VA** = us-east-1 (Norte da Virgínia).

---

## 1. Resumo

- **Infraestrutura mensal, sem os LLMs, na arquitetura híbrida recomendada** (dados de clientes e produção em São Paulo; ingestão, OCR, treino e homologação na Virgínia), com 150 perguntas por usuário por mês:

  | Cenário | Perguntas/mês | US$/mês, preço de lista | R$/mês | US$/mês otimizado* | R$/mês otimizado |
  | --- | ---: | ---: | ---: | ---: | ---: |
  | (a) Piloto, até 50 usuários | 7.500 | 1.103 | 6.041 | ≈ 610 a 700 | ≈ 3.340 a 3.830 |
  | (b) 1.000 usuários | 150.000 | 4.217 | 23.097 | ≈ 3.180 a 3.660 | ≈ 17.400 a 20.030 |
  | (c) 10.000 usuários | 1.500.000 | 12.241 | 67.046 | ≈ 8.700 a 9.360 | ≈ 47.620 a 51.250 |

  *Otimizado = Savings Plans de banco e de computação por 1 ano, instância NAT no lugar do NAT Gateway, GPU Spot nos picos e, no limite inferior, GPU de serviço na Virgínia. Detalhes na seção 9.4.
- **Custo de infraestrutura por pergunta:** US$ 0,15 no piloto, US$ 0,028 com mil usuários e US$ 0,008 com dez mil. Por usuário: US$ 22, US$ 4,2 e US$ 1,2 por mês. Com dez mil usuários, quase todo o custo por pergunta virá do LLM.
- **Os maiores itens são a GPU do reranker e o banco.** A GPU fica com 32% a 39% da conta, porque o Rank1 gera raciocínio para cada candidato. O banco, com instância, armazenamento e backup, fica com 26% a 30%.
- **São Paulo custa de 1,6 a 2,1 vezes a Virgínia.** O RDS r7g sai 1,59 vez mais caro, o RDS t4g 2,1 vezes, a GPU g6 1,70, o S3 1,76, o NAT Gateway 2,07 e a saída de dados 1,67. A região de São Paulo não oferece g6e, p4d nem p5 (nc), e o Textract não opera lá.
- **A LGPD não obriga a guardar dados no Brasil.** A transferência internacional é permitida com cláusulas-padrão (Resolução CD/ANPD nº 19/2024), e as chamadas aos LLMs já saem do país de qualquer forma. Manter em São Paulo o banco, as perguntas e os perfis de clientes é uma escolha de latência e de argumento comercial. O híbrido custa de 43% a 46% a mais que tudo na Virgínia e cerca de 8% a menos que tudo em São Paulo.
- **Custos únicos:** de US$ 3 mil a 6 mil no caminho com OCR open source, incluindo o primeiro ciclo de treino. Usar o Textract no backfill acrescenta de US$ 6 mil a 14 mil.
- **Primeiros 12 meses:** cerca de **US$ 28 mil (≈ R$ 154 mil)** acumulados, de US$ 200/mês no mês 1 a US$ 4,8 mil no mês do lançamento.
- **Créditos cobrem o primeiro ano** se a empresa entrar num programa com investidor ou aceleradora: AWS Activate Portfolio dá até US$ 200 mil; Google, até US$ 350 mil para startups de IA; sem investidor, o AWS Activate Founders dá de US$ 1 mil a 5 mil.
- **Decisão técnica com efeito no custo:** o RDS e o Aurora têm pgvector 0.8.2, mas não têm BM25 de verdade (pg_search/ParadeDB) nem MaxSim multivetorial nativo (VectorChord). A seção 2.4 mostra como contornar isso com pgvector, ou com Postgres autogerenciado.

---

## 2. Banco: volume de dados e escolha do serviço

### 2.1 Quantos dispositivos legais (estimativa própria, nc)

A unidade indexada é o dispositivo (artigo, parágrafo, inciso, alínea ou item) em cada uma de suas versões, mais as unidades de interpretação e jurisprudência. A estimativa cobre a janela de 10 anos da onda 1 do Plano de Ingestão.

| Bloco | Raciocínio | Unidades |
| --- | --- | ---: |
| Federal: códigos e regulamentos vigentes | CTN, RIR/2018 (~1.050 artigos), RIPI, CLT (~900 artigos), Lei 6.404, LC 87/116/123/214 e leis de PIS/Cofins/IRPJ: cerca de 15 mil artigos × 6 a 8 dispositivos por artigo, mais 20% de versões antigas | 150.000 |
| Federal: INs da RFB e atos infralegais (10 anos) | cerca de 2.000 atos tributários × 60 dispositivos, mais versões | 150.000 |
| Federal: leis e decretos que alteram (10 anos) | eventos e textos novos | 100.000 |
| Soluções de Consulta COSIT e SRRF | cerca de 15 mil soluções × 5 unidades (ementa e blocos da fundamentação) | 75.000 |
| CARF: ementas e súmulas | cerca de 200 mil acórdãos em 10 anos × 1,5 unidade (só ementa e dispositivo) | 300.000 |
| CONFAZ: convênios, ajustes SINIEF, protocolos | cerca de 3.000 atos × 20 | 60.000 |
| Onda 1 estadual (SP, MG, PR, SC, RS) | por UF: RICMS e anexos (~40 mil), leis e decretos de 10 anos (~30 mil), respostas a consultas (~30 mil), tribunal administrativo (~20 mil) = 120 mil × 5 | 600.000 |
| Municípios selecionados | cerca de 30 (capitais e maiores da onda 1) × 8 mil (código tributário, ISS, decretos) | 240.000 |
| NBC/CPC, STF/STJ com efeito em dispositivos | | 25.000 |
| **Total da onda 1** | faixa plausível de 1 a 4 milhões | **≈ 1,7 milhão; arredondo para 2 milhões** |

Com outros estados (expansão futura, se houver demanda) e o histórico anterior à janela, a base chega a 4 ou 5 milhões de unidades.

### 2.2 Vetores por dispositivo e tamanho em disco

**Tokens indexados por unidade:** cerca de 70 de texto médio (incisos são curtos, artigos longos), 30 de cabeçalho hierárquico ("Lei X › art. 18 › § 5º-J") e 75 das perguntas previstas pelo doc2query (5 perguntas × 15 tokens). Total de **≈ 180 tokens** por unidade, ou **360 milhões de vetores de token** para 2 milhões de unidades num ColBERT sem compressão.

| Representação | Bytes por vetor | Vetores | Tamanho |
| --- | ---: | ---: | ---: |
| ColBERT bruto, 128 dimensões, float32 | 512 | 360 M | 184 GB |
| ColBERT em halfvec (float16) | 256 | 360 M | 92 GB |
| Halfvec + *token pooling* fator 2 (perda pequena de qualidade, segundo Clavié et al., 2024) | 256 | 180 M | 46 GB |
| Compressão residual de 2 bits (estilo PLAID) | ≈ 36 | 360 M | 13 GB |
| Binário (pgvector `bit(128)`) + pooling fator 2, para re-pontuar só o top-k | 16 | 180 M | 2,9 GB |
| Vetor único FDE/MUVERA de 1.024 dimensões em halfvec, para gerar candidatos via HNSW | 2.048 | 2 M | 4 GB + índice HNSW ≈ 6 GB |

**Desenho recomendado para caber no Postgres:**

1. Um vetor único por unidade (FDE, tipo MUVERA, ou o próprio vetor agregado do modelo) num índice HNSW do pgvector, que gera de 200 a 500 candidatos.
2. Os vetores de token de cada unidade guardados compactos (binário ou halfvec com pooling), lidos só para esses candidatos.
3. MaxSim calculado no worker: 300 candidatos × 90 vetores × 16 bytes dão 430 KB por pergunta, um custo desprezível.

| Componente do banco | Tamanho estimado |
| --- | ---: |
| Normas, dispositivos, versões, eventos, evidências (≈ 2 KB/unidade) | 4 GB |
| Grafo de normas (≈ 10 milhões de arestas × 100 B) | 1 GB |
| Índices de texto (tsvector/GIN) ou vetores esparsos BM25 | 3 a 6 GB |
| Vetor único + HNSW | 10 GB |
| Vetores de token (binário a halfvec com pooling) | 3 a 46 GB |
| Árvore de temas, cache semântico, feedback, benchmark, auditoria | 5 a 20 GB |
| **Total da onda 1** | **≈ 30 a 90 GB**, com 150 a 250 GB provisionados para crescer até a onda 2 |

**Memória:** o HNSW e as tabelas quentes devem caber na RAM (15 a 30 GB). Daí a escolha de db.r7g.large (16 GiB) no piloto, db.r7g.xlarge (32 GiB) com mil usuários e db.r7g.2xlarge (64 GiB) com dez mil.

### 2.3 Preços: RDS PostgreSQL e Aurora PostgreSQL

Preço só da instância (computação), por mês, Single-AZ, on-demand. O RDS Multi-AZ com um standby custa o dobro na instância e no armazenamento.

| Instância (vCPU, RAM) | RDS VA | RDS SP | SP/VA | RI 1 ano VA | RI 1 ano SP | Fonte |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| db.t4g.medium (2, 4 GiB) | 47 | 100 | 2,1× | 32 | 57 | [Bytebase](https://www.bytebase.com/dbcost/rds/instance/db.t4g.medium.md) |
| db.t4g.large (2, 8 GiB) | 94 | 201 | 2,1× | 63 | 114 | [Bytebase](https://www.bytebase.com/dbcost/rds/instance/db.t4g.large.md) |
| db.r7g.large (2, 16 GiB) | 174 | 277 | 1,59× | 127 | 265 | [Bytebase](https://www.bytebase.com/dbcost/rds/instance/db.r7g.large.md) |
| db.r7g.xlarge (4, 32 GiB) | 349 | 555 | 1,59× | 255 | 530 | [Bytebase](https://www.bytebase.com/dbcost/rds/instance/db.r7g.xlarge.md) |
| db.r7g.2xlarge (8, 64 GiB) | 698 | 1.110 | 1,59× | 510 | 1.059 | [Bytebase](https://www.bytebase.com/dbcost/rds/instance/db.r7g.2xlarge.md) |
| Aurora db.r7g.large (Standard) | 201 | 320 | 1,59× | 147 | 304 | [Bytebase Aurora](https://www.bytebase.com/dbcost/aurora/instance/db.r7g.large.md) |

Página oficial: [RDS for PostgreSQL pricing](https://aws.amazon.com/rds/postgresql/pricing/). A parte legível dela confirma os créditos de CPU das T4g a US$ 0,075 por vCPU-hora e a exportação de snapshot a US$ 0,013/GB.

**Atenção:** a reserva de 1 ano em SP para a família r7g aparece com só 4% a 5% de desconto, o que é estranho perto dos 27% na Virgínia (nc). O caminho mais provável de desconto é o **Database Savings Plan**, lançado no re:Invent 2025: até 35% em compromisso de 1 ano, flexível entre RDS e Aurora ([AWS Fundamentals](https://awsfundamentals.com/blog/compute-database-savings-plans); percentual exato para r7g em SP nc). Os cenários otimizados usam 20%.

| Armazenamento e backup | VA | SP | Fonte |
| --- | ---: | ---: | --- |
| RDS gp3, por GB-mês | ≈ 0,115 | ≈ 0,22 (nc, estimado) | [Amnic](https://amnic.com/blogs/aws-rds-pricing) para VA |
| Backup automático | grátis até 100% do armazenamento provisionado; acima disso, ≈ 0,095/GB-mês | nc | [Amnic](https://amnic.com/blogs/aws-rds-pricing) |
| Aurora Standard: armazenamento / I/O | 0,10 por GB-mês / 0,20 por milhão de I/O | nc | [Bytebase, guia Aurora](https://www.bytebase.com/blog/understanding-aws-aurora-pricing.md) |
| Aurora I/O-Optimized | instância cerca de 30% mais cara; armazenamento 0,225/GB-mês; I/O incluso | nc | idem |
| Aurora Serverless v2 | 0,12 por ACU-hora (Standard); 0,156 (I/O-Optimized) | nc | idem |

**RDS ou Aurora?**

- **RDS PostgreSQL nos cenários (a) e (b).** É 16% mais barato na instância, tem custo de I/O previsível no gp3 e basta para uma instância com um standby.
- **No Aurora, a busca vetorial pesa no I/O.** Quando o HNSW não cabe na RAM, a busca gera muito I/O, e o Aurora Standard cobra cada milhão de operações; seria preciso ir para o I/O-Optimized (+30%).
- **O Aurora ganha no cenário (c), se houver mais de uma réplica de leitura** (até 15, com failover mais rápido), e na homologação com Serverless v2 escalando quase a zero (nc se escala a 0 ACU em SP).

### 2.4 Limitação que muda a arquitetura: extensões disponíveis

A [lista oficial de extensões do RDS para PostgreSQL](https://docs.aws.amazon.com/AmazonRDS/latest/PostgreSQLReleaseNotes/postgresql-extensions.html) traz **pgvector 0.8.2**, mas **não traz pg_search (ParadeDB, BM25), VectorChord (MaxSim multivetorial) nem pgvectorscale**. O Aurora segue a mesma política. Na prática:

| Necessidade | No RDS/Aurora | Em Postgres autogerenciado (EC2 ou Hetzner) |
| --- | --- | --- |
| BM25 de verdade | Não existe. O `ts_rank_cd` do full-text nativo não é BM25. Contorno: pesos BM25 calculados no pipeline e gravados como `sparsevec` do pgvector; o produto interno com o vetor da consulta, ponderado por IDF, reproduz a pontuação BM25 | pg_search (ParadeDB) ou VectorChord-BM25 |
| Multivetorial (ColBERT) | Vetor único + HNSW para candidatos e MaxSim no worker (seção 2.2) | VectorChord com operador MaxSim nativo |
| Grafo e PageRank personalizado | Tabela de arestas + PPR calculado no worker (igraph/NetworkX sobre o subgrafo) | Igual |

O Postgres autogerenciado em EC2 economizaria de 30% a 40% na instância e traria as extensões, mas a equipe passaria a cuidar de backup, alta disponibilidade (Patroni) e atualizações. **Recomendação:** começar no RDS com o contorno por `sparsevec`, que é simples e auditável. Migrar só se o benchmark mostrar perda de qualidade.

---

## 3. Computação: API, workers e GPU

### 3.1 CPU: Fargate e EC2

| Item | VA | SP | Fonte |
| --- | ---: | ---: | --- |
| Fargate Linux x86, por vCPU-hora / por GB-hora | 0,04048 / 0,004446 | ≈ 1,59× (nc) | [AWS Fargate pricing](https://aws.amazon.com/fargate/pricing/) (exemplos por segundo); [CloudBurn](https://cloudburn.io/blog/aws-fargate-pricing) |
| Fargate ARM (Graviton), por vCPU-hora / por GB-hora | 0,03238 / 0,00356 | ≈ 1,59× (nc) | idem |
| Tarefa ARM de 1 vCPU e 2 GB, 24/7 | 28,8/mês | ≈ 45,9/mês (nc) | cálculo |
| Fargate Spot | até 70% de desconto | idem | [AWS Fargate pricing](https://aws.amazon.com/fargate/pricing/) |
| EC2 t4g.medium | 0,0336/h | 0,0536/h | [aws-pricing.com VA](https://aws-pricing.com/us-east-1.html), [SP](https://aws-pricing.com/sa-east-1.html) |
| EC2 m7g.large / m7g.xlarge | 0,0816 / 0,1632 | 0,1301 / 0,2601 | idem |
| EC2 c7g.xlarge (OCR em CPU) | 0,145 | 0,2222 | idem |

O fator de 1,59 para o Fargate em SP é a razão de preço do m7g entre as regiões. Uso **Fargate ARM** na API e nos coletores: não exige gerenciar servidor, escala por tarefa e, nesse porte, custa quase o mesmo que EC2.

### 3.2 GPU: o que roda e quanto trabalho dá

Três modelos pequenos rodam na GPU: o codificador da consulta (ColBERT de 150 a 560 M parâmetros, que roda até em CPU), o **reranker de raciocínio** (Rank1, que existe em 0,5B, 1,5B, 3B, 7B, 14B e 32B) e a **política de busca** (Search-R1, de 3B a 7B). Os dois últimos geram texto, e por isso dominam o tempo de GPU.

**Premissa por pergunta (estimativa, nc, a medir no piloto):** Rank1 de 3B a 7B quantizado, com vLLM numa L4, avaliando 30 candidatos com cerca de 150 tokens de raciocínio cada: **≈ 3 s de GPU**. A política e o codificador acrescentam 0,5 s. Total de **3,5 s de GPU-L4 por pergunta não atendida pelo cache**.

| Cenário | Perguntas/mês | Cache semântico | GPU-h de trabalho | Frota provisionada | GPU-h pagas |
| --- | ---: | ---: | ---: | --- | ---: |
| (a) | 7.500 | 0% | 7 | 1 g6.xlarge só no expediente (12 h × 22 dias) | 264 |
| (b) | 150.000 | 20% | 117 | 1 em 24/7 + 1 no expediente (pico de 3× a média) | 994 |
| (c) | 1.500.000 | 30% | 1.021 | 3 em 24/7 + 5 no expediente (pico de 2× a média) | 3.510 |

Premissa de pico: 85% das perguntas caem em 220 horas comerciais por mês.

| Instância (GPU, VRAM) | On-demand VA | Spot VA | Compute SP 1 ano VA | On-demand SP | Spot SP | Fonte |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| g4dn.xlarge (T4, 16 GB) | 0,526 | — | — | 0,894 | — | [aws-pricing.com](https://aws-pricing.com/us-east-1.html) |
| g5.xlarge (A10G, 24 GB) | 1,006 | — | — | 1,71 | — | idem, [SP](https://aws-pricing.com/sa-east-1.html) |
| **g6.xlarge (L4, 24 GB)** | **0,8048** | 0,46 a 0,60 | 0,6549 (−19%); 3 anos 0,4617 (−43%) | **1,368** | 0,24 a 0,27 | [DoiT VA](https://www.doit.com/compute/spot/us-east-1/g6.xlarge), [Holori](https://calculator.holori.com/aws/ec2/g6.xlarge/us-east-1), [DoiT SP](https://www.doit.com/compute/spot/sa-east-1/g6.xlarge) |
| g6.2xlarge (L4, mais CPU) | — | — | — | 1,6617 | 0,2634 | [DoiT SP](https://www.doit.com/compute/spot/sa-east-1/g6.2xlarge) |
| g6e.xlarge (L40S, 48 GB) | 1,861 | ≈ 1,62 | 1,4069; EC2 Instance SP 1,1724 | **não listada em SP** (nc) | — | [Holori](https://calculator.holori.com/aws/ec2/g6e.xlarge/us-east-1) |
| p4d.24xlarge (8× A100 40 GB) | 21,96 | 17,06 | — | não listada em SP | — | [DoiT](https://www.doit.com/compute/spot/us-east-1/p4d.24xlarge) |
| p5.48xlarge (8× H100) | 55,04 | 19,27 | — | não listada em SP | — | [DoiT](https://www.doit.com/compute/spot/us-east-1/p5.48xlarge) |

Página oficial: [EC2 On-Demand pricing](https://aws.amazon.com/ec2/pricing/on-demand/). O Spot em SP aparece muito barato (82% abaixo do on-demand), mas a capacidade de g6 na região é pequena e pode haver interrupção. Serve para picos e lotes, não para a base de serviço. O Spot varia por hora e por zona.

**Recomendação de GPU:**

- **Serviço:** g6.xlarge (L4). É a instância mais barata que comporta Rank1-7B quantizado e a política 3B no mesmo vLLM.
- **Picos:** Spot com fallback para on-demand.
- **Lotes** (OCR, embeddings, doc2query): Spot na Virgínia.
- **g6e.xlarge (L40S) só na Virgínia.** Ela entrega de 2 a 2,5 vezes o throughput da L4 em decodificação (nc), útil se o Rank1 maior se pagar no benchmark.
- **p4d e p5 só para treino.**

### 3.3 Alternativa: embedding e rerank por API

| Serviço | Preço | Multivetorial? | Raciocínio auditável? | Fonte |
| --- | --- | --- | --- | --- |
| Voyage voyage-4 / voyage-context-4 | US$ 0,06 / 0,12 por milhão de tokens; 200 M grátis | Não (vetor único; o context-4 contextualiza o trecho) | — | [Voyage pricing](https://docs.voyageai.com/docs/pricing) |
| Voyage rerank-2.5 / 2.5-lite | US$ 0,05 / 0,02 por milhão de tokens | — | Não | idem |
| Cohere Rerank 3.5 no Bedrock | US$ 2,00 por 1.000 consultas | — | Não | [Bedrock pricing](https://aws.amazon.com/bedrock/pricing/) |
| Cohere Embed v4 (API direta) | ≈ US$ 0,12 por milhão de tokens (nc) | Não | — | [cohere.com/pricing](https://cohere.com/pricing) (não lido) |
| Jina (embeddings e rerankers; Elastic comprou a Jina em 10/2025) | ≈ US$ 0,05 por milhão de tokens; 10 M grátis uma vez | jina-colbert-v2 por API: nc | Não | [Markaicode](https://markaicode.com/pricing/jina-ai-pricing/) (a página de preços da Jina dava 404) |

**Conta para o rerank** (30 candidatos × 350 tokens, ou cerca de 10,5 mil tokens por pergunta após o cache):

| Opção | Cenário (b) | Cenário (c) |
| --- | ---: | ---: |
| Voyage rerank-2.5 | **US$ 63/mês** | **US$ 551/mês** |
| Cohere Rerank 3.5 | US$ 240 | US$ 2.100 |
| Rank1 auto-hospedado em g6 SP | ≈ US$ 1.100 (a fatia do reranker na GPU) | ≈ US$ 4.100 |

**Embeddings do corpus:** 360 milhões de tokens custam US$ 22 por passada na Voyage, ou cerca de US$ 3 numa L4. Não pesa em nenhum caminho.

**Conclusão:**

- **A API é de 5 a 15 vezes mais barata para reranquear**, mas não entrega o que o plano pede do Rank1: a justificativa auditável de cada trecho.
- **A política treinada por RL e o ColBERT ajustado têm pesos próprios** e precisam ser auto-hospedados de qualquer jeito.
- **Caminho intermediário:** Voyage rerank-2.5 corta para os 10 melhores candidatos e o Rank1 só raciocina sobre esses 10. O tempo de GPU cai cerca de 3 vezes, e o custo de GPU no cenário (c) cai de US$ 4,8 mil para cerca de US$ 1,9 mil por mês.
- **LGPD:** a pergunta passa por mais um fornecedor nos EUA.

---

## 4. Armazenamento de originais, CDN e transferência

### 4.1 Volume dos originais (estimativa própria, nc)

| Fonte (10 anos) | Raciocínio | Volume |
| --- | --- | ---: |
| DOU (INLABS, XML+PDF) | ≈ 100 MB/dia × 2.500 dias úteis | 250 GB |
| Diários oficiais de 5 estados | ≈ 50 MB/dia × 2.500 × 5 | 625 GB |
| Diários municipais (≈ 30) | ≈ 5 MB/dia × 2.500 × 30 | 375 GB |
| CARF (PDFs), Sefaz, RFB, Planalto, CONFAZ | | 250 GB |
| **Total da onda 1** | faixa de 0,5 a 3 TB | **≈ 1,5 TB** (3 TB com a onda 2) |

### 4.2 Preços do S3

Por GB-mês, primeiros 50 TB.

| Classe | VA | SP | Duração mínima | Uso no projeto |
| --- | ---: | ---: | --- | --- |
| S3 Standard | 0,023 | 0,0405 | — | Coleta recente (30 dias) |
| Standard-IA | 0,0125 | 0,0221 | 30 dias | **Originais**: lidos de novo em cada reprocessamento de fichas |
| Glacier Instant Retrieval | 0,004 | 0,0083 | 90 dias | Alternativa para originais com mais de 1 ano (leitura a ≈ US$ 0,03/GB) |
| Glacier Flexible Retrieval | 0,0036 | 0,00765 | 90 dias | — |
| Glacier Deep Archive | 0,00099 | 0,0032 | 180 dias | **Cópia de recuperação de desastre** em outra região |
| Saída para a internet (primeiros 10 TB) | 0,09/GB | 0,15/GB | — | Pequena: as respostas pesam cerca de 50 KB |

Fontes: [CostGoat S3](https://costgoat.com/pricing/amazon-s3) (atualizado em 20/10/2026), [S3 pricing oficial](https://aws.amazon.com/s3/pricing/) (durações mínimas; os primeiros 100 GB de saída por mês são grátis).

1,5 TB em Standard-IA custam **US$ 19/mês na VA ou US$ 33/mês em SP**. A cópia em Deep Archive custa de US$ 1,5 a 5. Para cumprir o princípio 1 do Plano de Ingestão (original imutável), uso **S3 Object Lock em modo compliance, com versionamento**, que não tem tarifa própria. As requisições do backfill (cerca de 10 milhões de PUTs a US$ 0,005 por mil) somam cerca de US$ 50 uma única vez.

### 4.3 CloudFront e WAF

- **CloudFront com planos de preço fixo** (novidade de 2025/2026), que já incluem o WAF ([AWS re:Post](https://www.repost.aws/articles/ARW8IO6PlQQsW9F33olXhG0w/understanding-cloudfront-flat-rate-pricing-plans-predictable-cdn-and-data-transfer-costs)):

  | Plano | Preço/mês | Requisições | Dados | Regras de WAF |
  | --- | ---: | ---: | ---: | ---: |
  | Free | 0 | 1 M | 100 GB | 5 |
  | Pro | 15 | 10 M | 50 TB | 25 |
  | Business | 200 | 125 M | 50 TB | 50 |
  | Premium | 1.000 a 10.000 | 500 M a 6 B | 50 a 600 TB | 75 |

- **O plano Pro basta até o cenário (b)** (150 mil perguntas × ~50 requisições ≈ 7,5 milhões); o Business serve o cenário (c).
- **WAF avulso, sem plano fixo:** US$ 5 por ACL, mais US$ 1 por regra e US$ 0,60 por milhão de requisições. O Bot Control custa US$ 10 por ACL ([AWS WAF pricing](https://aws.amazon.com/waf/pricing)).

### 4.4 Transferência entre regiões

Mover dados derivados da Virgínia para São Paulo custa cerca de US$ 0,02/GB (nc). A carga inicial do banco (≈ 100 GB) sai por US$ 2, e as atualizações diárias custam centavos.

---

## 5. OCR

### 5.1 Páginas do backfill (estimativa própria, nc)

Boa parte das fontes já nasce digital: o INLABS publica XML desde 2020, e Planalto, RFB e Sefaz publicam em HTML. O OCR real é exceção. Mesmo assim, todo PDF precisa de extração de texto e de separação dos atos.

| Fonte | Páginas | OCR de verdade? |
| --- | ---: | --- |
| DOU Seção 1, 2016 a 2026 (≈ 150 pp./dia) | 375 mil | Não (XML desde 2020; PDFs anteriores com camada de texto) |
| Diários de 5 estados, caderno Executivo | 1,9 milhão | Pouco |
| Diários municipais (≈ 30 municípios) | 1,5 milhão | Sim, de 30% a 50% em anos antigos e cidades menores |
| CARF (acórdãos) | 3 milhões | Não |
| Sefaz (respostas, pareceres, anexos do RICMS e tabelas de ST) | 300 mil | Tabelas, sim |
| Legado digitalizado (atos antigos vigentes, anexos escaneados) | 200 a 300 mil | Sim |
| **Total** | **≈ 7 milhões de páginas** | **≈ 1 milhão com OCR**, **≈ 300 mil com tabelas** e **≈ 2 milhões com análise de layout** depois da triagem |

### 5.2 Custo por 1.000 páginas

| Motor | Onde roda | Throughput (nc, não medido) | US$ por 1.000 páginas | Fonte do preço |
| --- | --- | --- | ---: | --- |
| Textract DetectDocumentText | API (só fora de SP) | — | **1,50** (até 1 milhão/mês); 0,60 acima | [Textract pricing](https://aws.amazon.com/textract/pricing/) |
| Textract AnalyzeDocument: Tables | API | — | **15** (até 1 milhão); 10 acima | idem |
| Textract: Forms | API | — | 50; 40 acima | idem |
| Textract: Layout | API | — | ≈ 4 (nc); grátis junto com Tables | idem |
| Extração da camada de texto (PyMuPDF/pdfplumber) | c7g Spot | > 100 pp./s | < 0,005 | cálculo |
| Tesseract 5 (CPU, 300 dpi) | c7g.xlarge | ≈ 10 mil pp./h | ≈ 0,015 (on-demand); ≈ 0,006 (Spot) | cálculo |
| PaddleOCR / docTR | g6.xlarge (L4) | ≈ 8 pp./s | ≈ 0,028 (on-demand); ≈ 0,019 (Spot) | cálculo |
| Docling (layout + TableFormer) | L4 | ≈ 2 a 4 pp./s | ≈ 0,06 a 0,11 | cálculo |
| Marker | L4 | ≈ 2 a 4 pp./s | ≈ 0,06 a 0,11 | cálculo |
| OCR por modelo de visão (olmOCR, PaddleOCR-VL e similares) | L40S/H100 | variável | ≈ 0,2 (os autores do olmOCR divulgam cerca de US$ 190 por milhão de páginas; nc) | — |

O [Textract não aparece entre as regiões de São Paulo](https://docs.aws.amazon.com/general/latest/gr/textract.html): as 18 regiões listadas incluem us-east-1, mas não sa-east-1. Isso não pesa, porque os documentos são públicos e o OCR roda no plano de lote na Virgínia.

### 5.3 Custo do backfill de OCR

| Caminho | Conta | Total |
| --- | --- | ---: |
| Open source em GPU (recomendado) | Docling em 2 milhões de páginas (139 h de L4) + PaddleOCR em 1 milhão (35 h) + tabelas em 300 mil (56 h) = cerca de 230 h de L4; dobrado para cobrir retrabalho | **US$ 200 (Spot) a 370 (on-demand)** |
| Textract mínimo (só texto + tabelas) | 1 milhão × 1,50 + 300 mil × 15 | **US$ 6.000** |
| Textract com Layout em tudo | + 2 milhões × ≈ 4 | **≈ US$ 14.000** |

**Recomendação:** Docling ou Marker com PaddleOCR em g6 Spot, e Textract Tables só como reserva para tabelas que o validador do Plano de Ingestão (seção 4.4) reprovar. O que pesa é o tempo de engenharia para afinar o open source, não a GPU.

---

## 6. Observabilidade, segurança, filas e diversos

| Item | Preço (VA) | SP | Comentário | Fonte |
| --- | --- | --- | --- | --- |
| CloudWatch Logs | US$ 0,50/GB ingerido; US$ 0,03/GB-mês armazenado | ≈ 0,75 (nc) | **Logs de prompt e de resposta inflam rápido:** amostrar, mandar o texto completo para o S3 e reter logs por 30 dias | [CloudBurn](https://cloudburn.io/blog/aws-fargate-pricing) |
| **NAT Gateway** | US$ 0,045/h + US$ 0,045/GB processado | **US$ 0,093/h + 0,093/GB** | **Custo surpresa:** 2 NATs em SP custam US$ 136/mês parados, e toda chamada ao LLM, todo coletor e todo pull de imagem paga por GB | [CostGoat NAT](https://costgoat.com/pricing/aws-nat-gateway), [Cloud Pipelines](https://cloudpipelines.pages.dev/guides/aws-nat-gateway-pricing-2026/) |
| Contornos para o NAT | VPC Gateway Endpoint de S3/DynamoDB (grátis); endpoints de interface de ECR/Secrets (≈ US$ 7/mês por AZ cada, nc); instância NAT (fck-nat em t4g.nano, ≈ US$ 5); IPv6 com egress-only gateway (grátis) | | Economizam de US$ 150 a 350/mês nos cenários (b) e (c) | — |
| IPv4 público | US$ 0,005/h por endereço (≈ US$ 3,65/mês) | igual | Cada tarefa Fargate em subnet pública tem o seu | [CloudBurn](https://cloudburn.io/blog/aws-fargate-pricing) |
| ALB | US$ 0,0225/h + LCU | ≈ 1,6× (nc) | | idem |
| WAF | US$ 5/ACL + US$ 1/regra + US$ 0,60 por milhão | | Incluso nos planos fixos do CloudFront | [AWS WAF](https://aws.amazon.com/waf/pricing) |
| Secrets Manager | US$ 0,40 por segredo/mês + US$ 0,05 por 10 mil chamadas (nc) | | ≈ 20 segredos = US$ 8 | [AWS](https://aws.amazon.com/secrets-manager/pricing/) (não lido) |
| KMS | US$ 1 por chave/mês + US$ 0,03 por 10 mil requisições (nc) | | De 3 a 5 chaves (banco, S3 de clientes, logs) | [AWS](https://aws.amazon.com/kms/pricing/) (não lido) |
| SQS | US$ 0,40 por milhão de requisições; 1 milhão/mês grátis (nc) | | Fila da ingestão: de 5 a 20 milhões de mensagens/mês = US$ 2 a 8 | [AWS](https://aws.amazon.com/sqs/pricing/) (não lido) |
| GuardDuty, Security Hub, Config, CloudTrail | de US$ 20 a 150/mês conforme o volume (nc) | | A primeira trilha do CloudTrail é grátis | — |
| Cognito (login) | 10 mil MAU grátis (nc) | | Cobre até o cenário (c) | — |
| Suporte AWS | Developer US$ 29; Business ≈ 10% da fatura, mínimo de US$ 100 (nc para 2026) | | Necessário a partir do lançamento | — |
| Homologação | de 15% a 25% da produção | | Na Virgínia, só com dados sintéticos, desligada à noite e no fim de semana (Instance Scheduler) | — |

---

## 7. Treinos ocasionais

Os treinos rodam na Virgínia, onde existem g6e, p4d e p5. As horas de GPU são estimativas próprias (nc).

| Treino | Modelo e dados | Hardware | Horas por execução | US$ por execução | Execuções por ciclo | US$ por ciclo |
| --- | --- | --- | --- | ---: | ---: | ---: |
| Ajuste fino do recuperador ColBERT | 150 a 560 M parâmetros; 100 a 500 mil pares pergunta → dispositivo com negativos difíceis | 1× g6.xlarge (L4) | 4 a 8 | 3 a 7 | 5 a 10 | **< 100** |
| Reranker Rank1 destilado (SFT/LoRA) | 7B; 20 a 50 mil exemplos de ≈ 1,5 mil tokens; 3 épocas | 1× g6e.xlarge (L40S) | 12 a 30 | 22 a 56 | 4 a 6 | **150 a 350** |
| Reranker com ajuste completo | 7B | p4d.24xlarge | 3 a 6 | 66 a 132 | 2 a 4 | 130 a 530 |
| Política de busca Search-R1 (PPO/GRPO com busca nas rodadas) | 3B a 7B; benchmark de 1.000 a 5.000 casos | p5.48xlarge (8× H100) | 12 a 36 | 660 a 1.980 (on-demand); 230 a 690 (Spot) | 2 a 3 | **1.500 a 6.000** |
| Mesmo treino no RunPod | 8× H100 SXM a US$ 2,69–3,99/GPU-h | — | 12 a 36 | 260 a 1.150 | 2 a 3 | 520 a 3.450 |

As traces de raciocínio usadas para destilar o Rank1 são geradas por LLM grande e entram na conta da outra pesquisa.

**Ressalvas:**

- **O custo do RL depende muito do tamanho do lote e do número de passos.** O artigo do Search-R1 usou um nó de 8 GPUs (nc). Spot de p5 sofre interrupções; o caminho estável é o Capacity Block, cujo preço a [AWS aumentou em 2026](https://www.itpro.com/cloud/cloud-computing/aws-amazon-ec2-capacity-blocks-price-increase) (artigo não lido).
- **Com ciclos trimestrais, o custo amortizado fica entre US$ 500 e 2.000 por mês.** Uso US$ 600/mês no cenário (b) e US$ 1.000/mês no (c), em linha separada.
- **A DGM é quase toda LLM** (outra pesquisa). Cada variante, porém, roda o benchmark pela cascata inteira e ocupa a GPU do reranker: 50 variantes × 1.000 casos por semana dão cerca de 200 mil perguntas por mês, ou cerca de 170 h de L4. Com avaliação em estágios e Spot, isso cabe nos US$ 150 a 300/mês da linha "DGM".

---

## 8. LGPD e escolha de região

| Ponto | O que diz | Consequência |
| --- | --- | --- |
| Localização | A LGPD não exige guardar dados no Brasil | São Paulo é escolha comercial e de latência, não obrigação legal |
| Transferência internacional (art. 33) | A [Resolução CD/ANPD nº 19/2024](https://lefosse.com/noticias/alerta/anpd-publica-regulamento-de-transferencia-internacional-de-dados-e-clausulas-padrao-contratuais-de-protecao-de-dados/), publicada em 23/08/2024, aprova as cláusulas-padrão contratuais e deu 12 meses (até agosto de 2025) para incorporá-las aos contratos | Os contratos com a AWS (se usar a Virgínia), com os provedores de LLM e com APIs de rerank precisam das cláusulas-padrão da ANPD. Se o DPA da AWS já as inclui: nc |
| Corpus legal | Os textos legais são públicos, mas o DOU e os diários trazem dados pessoais (nomeações, sanções, nomes de contribuintes em decisões) | Mesmo sendo públicos, esses dados seguem sob a LGPD (art. 7º, §§ 3º e 4º). Guardar com finalidade declarada e não reexpor fora do contexto legal |
| Dados de clientes | Perguntas, perfis de empresas (CNPJ, regime, sócios), feedback | **Em São Paulo**, cifrados com KMS, isolados por escritório, com logs sem PII |
| LLM | Toda pergunta já vai a um provedor de LLM, provavelmente nos EUA | Hospedar tudo em SP não evita transferência internacional; só a reduz |

**Arquitetura recomendada (híbrida):**

- **São Paulo:** produção (RDS, API, workers, GPU de serviço, S3 de dados de clientes, CloudFront).
- **Virgínia:** plano de lote só com dados públicos (coletores, OCR, embeddings do corpus, originais, treinos, homologação com dados sintéticos).
- **Custo:** de 43% a 46% acima de tudo na Virgínia e de 8% a 9% abaixo de tudo em São Paulo, nos três cenários.

---

## 9. Cenários mensais

Premissas comuns:

- Corpus da onda 1 completo nos cenários (b) e (c); federal mais o início da onda 1 no (a).
- Base de 150 perguntas por usuário por mês.
- Cache semântico atende 0%, 20% e 30% das perguntas.
- 3,5 s de GPU-L4 por pergunta fora do cache.
- **Sem LLMs** e sem os treinos amortizados (linha à parte).

Colunas: "us-east-1" é tudo na Virgínia; "sa-east-1" é tudo em São Paulo; "Recomendado" é a arquitetura híbrida, com a região indicada.

### 9.1 Cenário (a): desenvolvimento e piloto, até 50 usuários (7.500 perguntas/mês)

| Plano | Grupo | Item | us-east-1 | sa-east-1 | Recomendado |
| --- | --- | --- | ---: | ---: | ---: |
| prod | Banco | RDS PostgreSQL db.r7g.large Single-AZ (2 vCPU, 16 GiB) | 174 | 277 | 277 (SP) |
| prod | Banco | Storage gp3 de 150 GB | 17 | 33 | 33 (SP) |
| prod | Banco | Backups e snapshots acima da franquia | 5 | 6 | 6 (SP) |
| prod | Computação | API: 2 tarefas Fargate ARM de 1 vCPU/2 GB, 24/7 | 58 | 92 | 92 (SP) |
| prod | GPU | 1 g6.xlarge (L4) só no horário comercial (264 h): reranker, política e codificador | 212 | 361 | 361 (SP) |
| prod | Rede | ALB + LCUs | 22 | 36 | 36 (SP) |
| prod | Rede | Instância NAT fck-nat t4g.nano (no lugar do NAT Gateway) | 5 | 8 | 8 (SP) |
| prod | Rede | 3 IPv4 públicos | 11 | 11 | 11 (SP) |
| prod | Rede | CloudFront, plano fixo Pro (WAF incluso) | 15 | 15 | 15 (SP) |
| prod | Observabilidade | CloudWatch: 10 GB de logs + métricas e alarmes | 15 | 20 | 20 (SP) |
| prod | Segurança | Secrets Manager, KMS, CloudTrail, GuardDuty | 25 | 30 | 30 (SP) |
| prod | Diversos | SQS, EventBridge, Route 53, ECR, S3 da aplicação | 10 | 12 | 12 (SP) |
| lote | Ingestão | Coletores e normalizador: cerca de 2 tarefas Fargate ARM + Spot | 58 | 92 | 58 (VA) |
| lote | GPU | OCR e embeddings incrementais em Spot (≈ 20 h) | 11 | 6 | 11 (VA) |
| lote | S3 | Originais, 0,8 TB em Standard-IA, + requisições | 15 | 23 | 15 (VA) |
| lote | Homologação | Desligada fora do expediente (RDS t4g.large, 1 tarefa) | 90 | 153 | 90 (VA) |
| lote | Suporte | AWS Developer Support | 29 | 29 | 29 (VA) |
| | | **Total mensal (US$)** | **772** | **1.202** | **1.103** |
| | | **Total mensal (R$)** | **4.229** | **6.584** | **6.041** |

Com 50, 150 ou 400 perguntas por usuário, o total não muda. A GPU fica ligada no expediente de qualquer jeito, e 20 mil perguntas usam só 19 h dela.

**Versão enxuta do piloto (≈ US$ 610 a 700):**

- **GPU serverless no Modal**, com L4 a US$ 0,80/h por segundo de uso e multiplicador de região de 1,5 a 1,75×: de US$ 30 a 60/mês no lugar de US$ 361. A pergunta passa pelos EUA.
- **RDS db.t4g.large** em vez do r7g.large: US$ 201, ou US$ 114 com reserva de 1 ano.

### 9.2 Cenário (b): 1.000 usuários (150 mil perguntas/mês)

| Plano | Grupo | Item | us-east-1 | sa-east-1 | Recomendado |
| --- | --- | --- | ---: | ---: | ---: |
| prod | Banco | RDS PostgreSQL db.r7g.xlarge Multi-AZ (4 vCPU, 32 GiB) | 698 | 1.110 | 1.110 (SP) |
| prod | Banco | Storage gp3 de 250 GB (×2, Multi-AZ) | 58 | 110 | 110 (SP) |
| prod | Banco | Backups + cópia de snapshots para outra região | 40 | 48 | 48 (SP) |
| prod | Computação | API: média de 4 tarefas Fargate ARM de 1 vCPU/2 GB (autoescala de 2 a 8) | 115 | 183 | 183 (SP) |
| prod | Computação | Workers assíncronos (verificação, MCP ao vivo): 2 tarefas | 58 | 92 | 92 (SP) |
| prod | GPU | g6.xlarge: 1 em 24/7 + 1 no expediente (994 GPU-h) | 800 | 1.360 | 1.360 (SP) |
| prod | Rede | ALB + LCUs | 34 | 54 | 54 (SP) |
| prod | Rede | NAT Gateway em 2 AZs + 300 GB processados | 79 | 164 | 164 (SP) |
| prod | Rede | 6 IPv4 públicos | 22 | 22 | 22 (SP) |
| prod | Rede | CloudFront, plano fixo Pro (WAF incluso) | 15 | 15 | 15 (SP) |
| prod | Observabilidade | CloudWatch: 80 GB de logs + métricas, alarmes e dashboards | 80 | 108 | 108 (SP) |
| prod | Segurança | Secrets, KMS, GuardDuty, Security Hub, Config | 75 | 90 | 90 (SP) |
| prod | Diversos | SQS, EventBridge, Route 53, ECR, S3 da aplicação, Cognito | 20 | 24 | 24 (SP) |
| lote | Ingestão | Coletores, normalizador e orquestrador (onda 1 diária) | 87 | 138 | 87 (VA) |
| lote | GPU | OCR e embeddings incrementais em Spot (≈ 40 h) | 22 | 12 | 22 (VA) |
| lote | S3 | Originais, 1,5 TB em IA, + cópia em Deep Archive + requisições | 28 | 46 | 28 (VA) |
| lote | DGM | Sandbox e GPU para avaliar variantes no benchmark (Spot) | 150 | 195 | 150 (VA) |
| lote | Homologação | ≈ 25% da produção, com agendamento | 250 | 425 | 250 (VA) |
| lote | Suporte | AWS Business Support (≈ 10% da fatura) | 300 | 450 | 300 (VA) |
| | | **Total mensal (US$)** | **2.930** | **4.645** | **4.217** |
| | | **Total mensal (R$)** | **16.048** | **25.442** | **23.097** |
| | | *+ treinos amortizados (seção 7)* | | | *+ 600* |

### 9.3 Cenário (c): 10.000 usuários (1,5 milhão de perguntas/mês)

| Plano | Grupo | Item | us-east-1 | sa-east-1 | Recomendado |
| --- | --- | --- | ---: | ---: | ---: |
| prod | Banco | RDS PostgreSQL db.r7g.2xlarge Multi-AZ (8 vCPU, 64 GiB) | 1.396 | 2.220 | 2.220 (SP) |
| prod | Banco | Réplica de leitura db.r7g.xlarge (consultas de busca) | 349 | 555 | 555 (SP) |
| prod | Banco | Storage gp3 de 400 GB (×3: Multi-AZ + réplica) | 138 | 264 | 264 (SP) |
| prod | Banco | Backups + cópia para outra região | 100 | 120 | 120 (SP) |
| prod | Computação | API: média de 12 tarefas Fargate ARM de 1 vCPU/2 GB | 346 | 550 | 550 (SP) |
| prod | Computação | Workers assíncronos: 6 tarefas | 173 | 275 | 275 (SP) |
| prod | GPU | g6.xlarge: 3 em 24/7 + cerca de 5 no expediente (3.510 GPU-h), on-demand | 2.825 | 4.802 | 4.802 (SP) |
| prod | Rede | ALB + LCUs | 104 | 166 | 166 (SP) |
| prod | Rede | NAT Gateway em 3 AZs + 2 TB processados | 189 | 390 | 390 (SP) |
| prod | Rede | 15 IPv4 públicos | 55 | 55 | 55 (SP) |
| prod | Rede | CloudFront, plano fixo Business (WAF com 50 regras) | 200 | 200 | 200 (SP) |
| prod | Observabilidade | CloudWatch: 400 GB de logs + métricas | 300 | 420 | 420 (SP) |
| prod | Segurança | Secrets, KMS, GuardDuty, Security Hub, Config, Shield Standard | 150 | 180 | 180 (SP) |
| prod | Diversos | SQS, EventBridge, Route 53, ECR, S3 da aplicação, Cognito | 60 | 72 | 72 (SP) |
| lote | Ingestão | Coletores e normalizador (onda 1 + onda 2) | 173 | 275 | 173 (VA) |
| lote | GPU | OCR e embeddings incrementais em Spot (≈ 80 h) | 44 | 24 | 44 (VA) |
| lote | S3 | Originais, 3 TB em IA, + Deep Archive + requisições | 55 | 91 | 55 (VA) |
| lote | DGM | Sandbox e GPU de avaliação (Spot) | 300 | 390 | 300 (VA) |
| lote | Homologação | ≈ 15% da produção | 600 | 1.020 | 600 (VA) |
| lote | Suporte | AWS Business Support (faixas de ~7% a 10%) | 800 | 1.200 | 800 (VA) |
| | | **Total mensal (US$)** | **8.357** | **13.269** | **12.241** |
| | | **Total mensal (R$)** | **45.773** | **72.677** | **67.046** |
| | | *+ treinos amortizados (seção 7)* | | | *+ 1.000* |

### 9.4 Otimizações (arquitetura híbrida)

| Alavanca | (b) economia/mês | (c) economia/mês | Risco ou custo |
| --- | ---: | ---: | --- |
| Database Savings Plan de 1 ano (20% assumido; a AWS anuncia até 35%) | −222 | −555 | Compromisso de 12 meses |
| Compute Savings Plan de 1 ano na GPU de base (−19%, taxa da VA aplicada a SP; nc) | −190 | −569 | Compromisso |
| GPU de pico em Spot em SP (≈ US$ 0,30/h) com fallback on-demand | — | −1.410 | Interrupções; pouca capacidade de g6 em SP |
| Instância NAT ou endpoints de VPC no lugar do NAT Gateway | −148 | −350 | Mais um componente para operar |
| **Total otimizado em SP** | **≈ 3.657 (R$ 20.030)** | **≈ 9.357 (R$ 51.250)** | |
| GPU de serviço na VA (+≈ 120 ms de ida e volta, já pequeno perto do LLM) | −480 adicional | −663 adicional | A pergunta trafega pelos EUA, como já acontece com o LLM |
| **Total com GPU na VA** | **≈ 3.177 (R$ 17.400)** | **≈ 8.694 (R$ 47.620)** | |
| Pré-rerank por API (Voyage) + Rank1 só no top 10 | ≈ −300 | ≈ −2.300 | Mais um fornecedor de dados; qualidade a validar no benchmark |

### 9.5 Sensibilidade a perguntas por usuário

Arquitetura híbrida, sem otimizações, em US$/mês.

| Cenário | 50 perguntas/usuário | 150 (base) | 400 |
| --- | ---: | ---: | ---: |
| (a) 50 usuários | 1.103 | 1.103 | 1.103 |
| (b) 1.000 usuários | 3.855 (R$ 21.115) | 4.217 (R$ 23.097) | 4.939 (R$ 27.052) |
| (c) 10.000 usuários | 10.436 (R$ 57.160) | 12.241 (R$ 67.046) | 17.298 (R$ 94.745) |

Só a GPU escala com o volume de perguntas, com 730, 994 e 1.522 GPU-h no cenário (b) e 2.190, 3.510 e 7.206 no (c). O resto é quase fixo. Com 400 perguntas por usuário no cenário (c), vale migrar o reranker para g6e na Virgínia ou adotar o pré-rerank por API.

---

## 10. Custos únicos

| Item | Conta | US$ |
| --- | --- | ---: |
| Extração de texto dos 7 milhões de páginas | PyMuPDF em c7g Spot | < 20 |
| OCR, layout e tabelas (open source, GPU) | Seção 5.3 | 200 a 370 |
| *Alternativa Textract* | *Seção 5.3* | *6.000 a 14.000* |
| Embeddings multivetoriais do corpus | 360 M tokens ≈ 3,3 h de L4 por passada × 10 passadas | ≈ 30 |
| doc2query com modelo próprio (se não usar LLM por API) | ≈ 150 M tokens gerados, 10 a 20 h de g6e | 20 a 40 |
| Computação extra dos coletores no backfill (meses 2 a 10) | Fargate e EC2 Spot | 300 a 500 |
| Requisições de S3 (≈ 10 milhões de PUTs) | | ≈ 50 |
| Rede no backfill (NAT Gateway na VA: 3 TB × 0,045) | Evitável com subnet pública, IPv6 ou fck-nat | 0 a 135 |
| Carga do banco em SP (≈ 100 GB entre regiões) | | ≈ 2 |
| Primeiro ciclo de treinos (recuperador, reranker, RL) | Seção 7 | 1.800 a 4.500 |
| Setup de contas (Organizations, Control Tower, IaC) | Sem tarifa da AWS; o custo é horas da equipe (fora do escopo) | 0 |
| **Total único (caminho open source)** | | **≈ 2.500 a 5.600 (R$ 13,7 mil a 30,7 mil)** |
| **Total único com Textract** | | **≈ 8.500 a 19.600** |

---

## 11. Curva de custo nos primeiros 12 meses

Arquitetura híbrida, seguindo o roteiro por fases do Plano do Assistente e a ordem de execução do Plano de Ingestão. Os custos únicos caem no mês em que acontecem.

| Mês | O que passa a existir | Recorrente (US$) | Único (US$) | Total (US$) | Total (R$) |
| ---: | --- | ---: | ---: | ---: | ---: |
| 1 | Contas, S3 de originais com Object Lock, RDS de dev t4g.large (VA), 1 coletor (INLABS), CloudWatch, Secrets/KMS | 206 | 0 | 206 | 1.128 |
| 2 | Começa o backfill federal: 3 coletores, RDS de dev r7g.large (VA), GPU Spot para OCR e embeddings | 373 | 350 | 723 | 3.960 |
| 3 | Produção criada em SP (RDS r7g.large, API, ALB, CloudFront, GPU no expediente); dev vira homologação | 953 | 150 | 1.103 | 6.041 |
| 4 | Piloto (cenário a): escritórios piloto, MCP ao vivo | 1.103 | 0 | 1.103 | 6.041 |
| 5 | Piloto + primeiro ajuste fino do recuperador ColBERT | 1.103 | 100 | 1.203 | 6.589 |
| 6 | Piloto + início do backfill estadual de SP (DOE, RICMS, ISS da capital) | 1.163 | 400 | 1.563 | 8.561 |
| 7 | Começa a DGM semanal; primeiro ciclo de RL (Search-R1); backfill de MG e PR | 1.313 | 2.500 | 3.813 | 20.885 |
| 8 | Segundo ciclo de RL e ablações; reranker destilado; backfill de SC e RS | 1.313 | 1.500 | 2.813 | 15.407 |
| 9 | Preparação para escala: RDS Multi-AZ r7g.xlarge, GPU de base 24/7, Business Support | 2.900 | 300 | 3.200 | 17.527 |
| 10 | Reforma tributária completa; municípios; homologação maior | 3.300 | 300 | 3.600 | 19.718 |
| 11 | Mais UFs e municípios; pré-lançamento (~300 usuários) | 3.700 | 200 | 3.900 | 21.361 |
| 12 | Lançamento comercial (cenário b, ~1.000 usuários) | 4.217 | 600 | 4.817 | 26.384 |
| | **Acumulado em 12 meses** | | | **28.044** | **153.603** |

**Leitura:**

- **Os seis primeiros meses somam cerca de US$ 6 mil.** O salto vem nos meses 7 e 8, com o RL, e no mês 9, com a alta disponibilidade.
- **Créditos do AWS Activate Portfolio (US$ 200 mil) cobririam o ano inteiro** com folga, e boa parte do segundo.
- **Os meses 1 a 3 cabem num Activate Founders** de US$ 1 mil a 5 mil.

---

## 12. Créditos e alternativas mais baratas

### 12.1 Programas de crédito

| Programa | Valor | Condições | Fonte |
| --- | --- | --- | --- |
| AWS Activate Founders | US$ 1.000 na entrada; até US$ 5.000 para alguns | Empresa sem investimento externo (*bootstrapped*), antes da Série B, fundada nos últimos 10 anos, conta AWS paga | [AWS Startups: Credits](https://aws.amazon.com/startups/credits?lang=tw) |
| AWS Activate Portfolio | **Até US$ 200.000** | Org ID de um provedor do Activate (aceleradora, anjo ou fundo) | idem |
| Google for Startups Cloud, Start | US$ 2.000 | Fundada nos últimos 2 anos, com MVP | [Google for Startups Cloud](https://cloud.google.com/startup?authuser=3&hl=es) |
| Google Scale / Scale AI | **Até US$ 200.000 (geral) ou US$ 350.000 (IA)** em 2 anos: no ano 1, 100% até US$ 250 mil (IA); no ano 2, 20% até mais US$ 100 mil | Financiamento de pre-seed a Série A comprovado | idem |
| Microsoft for Startups (oferta via investidor) | ≈ US$ 100.000 de Azure no início, com possível ampliação (nc) | Startup ligada a investidor da rede; menos de US$ 350 mil em créditos recebidos | [Microsoft Q&A, fev. 2026](https://learn.microsoft.com/en-us/answers/questions/5780457/startup-credits) (resposta de moderador, não página oficial) |
| Microsoft Founders Hub (sem investidor) | Até US$ 5.000 (nc) | — | idem |

Notas:

- Os créditos da AWS são em USD e seguem os Promotional Credit Terms. Se valem para modelos de terceiros no Bedrock ou no Marketplace: nc. **Interessa à pesquisa de LLMs:** se valerem para o Claude no Bedrock, o crédito cobre parte do maior custo variável.
- O crédito do Google é generoso para IA, mas mudar de nuvem tem custo de engenharia. Só compensa se a equipe ainda não tiver se comprometido com a AWS.

### 12.2 Alternativas

| Alternativa | Preço | Equivale a | Tradeoff | Fonte |
| --- | --- | --- | --- | --- |
| **Hetzner GEX45** (GPU de 24 GB, classe RTX 4000 Ada) | €214/mês + €209 de setup | g6.xlarge 24/7 em SP (US$ 999) | Cerca de 4 vezes mais barato. Sem região no Brasil (Alemanha ou Finlândia), servidor dedicado sem autoescala, a equipe opera tudo. A Hetzner aumentou preços várias vezes em 2026 (o GEX131 subiu de €889 para €1.499 entre dez/2025 e out/2026) | [WZ-IT](https://wz-it.com/en/blog/hetzner-gpu-server-comparison/) |
| Hetzner GEX131 (RTX PRO 6000 Blackwell, 96 GB) | €1.499/mês + €1.499 de setup | 1 a 2 g6e | Comporta Rank1-14B/32B; o setup caro limita | idem |
| Hetzner/OVH para o Postgres (dedicado AX/Advance) | nc (de €100 a 250/mês por servidor com 64 a 128 GB) | RDS r7g.2xlarge Multi-AZ (US$ 2.220 em SP) | Permite pg_search e VectorChord. HA, backup e PITR ficam com a equipe. A OVH não tem datacenter no Brasil (nc) | — |
| **Supabase** (Postgres gerenciado com pgvector) | Plano Pro US$ 25 + computação: Large (2 vCPU dedicadas, 8 GB) US$ 110; XL (4 vCPU, 16 GB) US$ 210; 2XL (8 vCPU, 32 GB) US$ 410; disco US$ 0,125/GB | RDS r7g.large a r7g.xlarge em SP | O XL custa menos que o r7g.large em SP, com metade da RAM por vCPU. Roda sobre a AWS, com região em São Paulo (nc). Alta disponibilidade e réplicas são cobradas à parte. pg_search/VectorChord: nc | [Supabase compute](https://supabase.com/docs/guides/platform/compute-add-ons) |
| **Neon** (Postgres serverless) | Launch US$ 0,106/CU-h; Scale US$ 0,222/CU-h; armazenamento US$ 0,35/GB-mês | — | Bom para branches de dev e homologação que escalam a zero. Caro para produção 24/7 (4 CU no Scale = US$ 648/mês) e no armazenamento. Região em SP: nc | [JetAdmin](https://www.jetadmin.io/blog/neon-pricing/) |
| **Modal** (GPU serverless) | L4 ≈ US$ 0,80/h; A10 1,10; L40S 1,95; A100 80 GB 2,50; H100 3,95, cobrado por segundo; região fixa custa 1,5 a 1,75× | GPU do piloto e lotes | Escala a zero, ótimo no cenário (a) e para o backfill. Cold start de segundos. Dados nos EUA | [Spheron](https://www.spheron.network/blog/modal-gpu-pricing-2026-per-second-billing/) (cita modal.com/pricing) |
| **RunPod** | L4 US$ 0,59/h; L40S 1,09; A100 80 GB 1,79; H100 SXM 2,69 a 3,99; serverless de 24 GB US$ 0,75/h | Treinos de RL e lotes | De 30% a 60% mais barato que a AWS em H100. Isolamento e conformidade menores no Community Cloud | [RunPod pricing](https://www.runpod.io/gpu-cloud/pricing) |

**Recomendação de mix:**

- **Produção e dados de clientes na AWS SP:** gerenciado, com o argumento comercial de "dados no Brasil".
- **Treinos de RL no RunPod Secure Cloud ou em p5 Spot na VA:** só dados públicos e benchmark anonimizado.
- **Piloto e backfill no Modal ou em Spot na VA:** escala a zero.
- **Hetzner só depois do cenário (b)**, e só se a equipe tiver capacidade de operação. O ganho de cerca de US$ 1 mil/mês em GPU não paga uma pessoa de infraestrutura.

---

## 13. O que não foi confirmado

1. **Preços em sa-east-1 lidos fora da AWS:** RDS gp3 (estimei US$ 0,22/GB-mês), backup, Fargate (1,59 vez a VA), ALB (1,6 vez), CloudWatch Logs (US$ 0,75/GB), Aurora (armazenamento, I/O, Serverless v2) e transferência entre regiões. As instâncias RDS e EC2 de SP vêm de agregadores (Bytebase, aws-pricing.com, DoiT), não da página oficial, que não carregou.
2. **Disponibilidade em SP de g6e, p4d e p5:** não aparecem na listagem de sa-east-1 do aws-pricing.com. O Textract não consta da [lista de endpoints](https://docs.aws.amazon.com/general/latest/gr/textract.html).
3. **Descontos:** Savings Plans de GPU em SP, Database Savings Plans para r7g em SP (anunciados como até 35%) e a reserva de 1 ano de r7g em SP, que aparece com desconto anômalo de 4% a 5%.
4. **Throughputs** (páginas por segundo de OCR, segundos de GPU por pergunta do Rank1, tokens por segundo no treino): estimativas de ordem de grandeza, a medir num teste de carga no mês 3.
5. **Contagem de dispositivos (2 milhões), páginas (7 milhões) e volume de originais (1,5 TB):** estimativas próprias com o raciocínio da seção 2.1 e da seção 5.1.
6. **Treino do Search-R1** (hardware do artigo, passos e horas), preço atual de Capacity Blocks e custo do Textract Layout.
7. Preço do Cohere Embed v4, ColBERT da Jina por API (a página de preços da Jina estava fora do ar) e estado das cláusulas-padrão da ANPD no DPA da AWS.
8. Créditos da Microsoft (fonte: resposta de moderador no Q&A); preços de Secrets Manager, KMS, SQS, Cognito, GuardDuty e Suporte AWS em 2026 (de memória, não relidos).
9. Regiões do Supabase e do Neon em São Paulo; servidores dedicados da Hetzner e da OVH para banco; data center da OVH no Brasil.
10. Câmbio: a PTAX de 4/11/2026 (R$ 5,4772) vem de site de terceiros, não do Banco Central, e a fonte não diz se é de compra ou de venda.

---

## 14. Fontes

**AWS (oficiais)**
- [Amazon RDS for PostgreSQL pricing](https://aws.amazon.com/rds/postgresql/pricing/)
- [Extensões do RDS for PostgreSQL](https://docs.aws.amazon.com/AmazonRDS/latest/PostgreSQLReleaseNotes/postgresql-extensions.html)
- [AWS Fargate pricing](https://aws.amazon.com/fargate/pricing/)
- [Amazon S3 pricing](https://aws.amazon.com/s3/pricing/)
- [AWS WAF pricing](https://aws.amazon.com/waf/pricing)
- [Amazon Textract pricing](https://aws.amazon.com/textract/pricing/)
- [Amazon Textract endpoints](https://docs.aws.amazon.com/general/latest/gr/textract.html)
- [Amazon Bedrock pricing](https://aws.amazon.com/bedrock/pricing/)
- [Planos de preço fixo do CloudFront (re:Post)](https://www.repost.aws/articles/ARW8IO6PlQQsW9F33olXhG0w/understanding-cloudfront-flat-rate-pricing-plans-predictable-cdn-and-data-transfer-costs)
- [AWS Startups: créditos do Activate](https://aws.amazon.com/startups/credits?lang=tw)

**Agregadores de preço da AWS**
- Bytebase DB Cost: [db.t4g.medium](https://www.bytebase.com/dbcost/rds/instance/db.t4g.medium.md), [db.t4g.large](https://www.bytebase.com/dbcost/rds/instance/db.t4g.large.md), [db.r7g.large](https://www.bytebase.com/dbcost/rds/instance/db.r7g.large.md), [db.r7g.xlarge](https://www.bytebase.com/dbcost/rds/instance/db.r7g.xlarge.md), [db.r7g.2xlarge](https://www.bytebase.com/dbcost/rds/instance/db.r7g.2xlarge.md), [Aurora db.r7g.large](https://www.bytebase.com/dbcost/aurora/instance/db.r7g.large.md), [guia de preços do Aurora](https://www.bytebase.com/blog/understanding-aws-aurora-pricing.md)
- [aws-pricing.com: us-east-1](https://aws-pricing.com/us-east-1.html), [sa-east-1](https://aws-pricing.com/sa-east-1.html)
- DoiT: [g6.xlarge SP](https://www.doit.com/compute/spot/sa-east-1/g6.xlarge), [g6.2xlarge SP](https://www.doit.com/compute/spot/sa-east-1/g6.2xlarge), [g6.xlarge VA](https://www.doit.com/compute/spot/us-east-1/g6.xlarge), [p4d.24xlarge](https://www.doit.com/compute/spot/us-east-1/p4d.24xlarge), [p5.48xlarge](https://www.doit.com/compute/spot/us-east-1/p5.48xlarge)
- Holori: [g6.xlarge](https://calculator.holori.com/aws/ec2/g6.xlarge/us-east-1), [g6e.xlarge](https://calculator.holori.com/aws/ec2/g6e.xlarge/us-east-1)
- CostGoat: [S3](https://costgoat.com/pricing/amazon-s3), [NAT Gateway](https://costgoat.com/pricing/aws-nat-gateway); [Cloud Pipelines: NAT](https://cloudpipelines.pages.dev/guides/aws-nat-gateway-pricing-2026/)
- [CloudBurn: Fargate e taxas escondidas](https://cloudburn.io/blog/aws-fargate-pricing); [Amnic: RDS](https://amnic.com/blogs/aws-rds-pricing); [AWS Fundamentals: Database Savings Plans](https://awsfundamentals.com/blog/compute-database-savings-plans)
- [ITPro: aumento no preço dos Capacity Blocks](https://www.itpro.com/cloud/cloud-computing/aws-amazon-ec2-capacity-blocks-price-increase) (não lido)

**APIs de embedding e rerank**
- [Voyage AI pricing](https://docs.voyageai.com/docs/pricing)
- [Markaicode: Jina AI pricing](https://markaicode.com/pricing/jina-ai-pricing/)

**Alternativas**
- [Supabase compute add-ons](https://supabase.com/docs/guides/platform/compute-add-ons)
- [JetAdmin: Neon pricing](https://www.jetadmin.io/blog/neon-pricing/)
- [WZ-IT: servidores GPU da Hetzner](https://wz-it.com/en/blog/hetzner-gpu-server-comparison/)
- [Spheron: preços do Modal](https://www.spheron.network/blog/modal-gpu-pricing-2026-per-second-billing/)
- [RunPod pricing](https://www.runpod.io/gpu-cloud/pricing)

**Créditos de outras nuvens**
- [Google for Startups Cloud Program](https://cloud.google.com/startup?authuser=3&hl=es)
- [Microsoft Q&A: créditos para startups](https://learn.microsoft.com/en-us/answers/questions/5780457/startup-credits)

**LGPD e câmbio**
- [Lefosse: Resolução CD/ANPD nº 19/2024](https://lefosse.com/noticias/alerta/anpd-publica-regulamento-de-transferencia-internacional-de-dados-e-clausulas-padrao-contratuais-de-protecao-de-dados/)
- [Numerando: PTAX 2026](https://numerando.com.br/cambio/dolar-americano/2026)

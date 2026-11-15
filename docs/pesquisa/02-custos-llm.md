# Custos de LLM: assistente de IA para contadores

Pesquisa de 4 de novembro de 2026. Valores em US$ por milhão de tokens (MTok), salvo indicação. Os preços marcados **[confirmado]** foram lidos na página oficial do fornecedor nesta data; **[secundário]** vem de agregador ou imprensa; **[não confirmado]** é estimativa ou dado que não consegui conferir.

---

## 1. Resumo

| Item | Econômica | Padrão | Premium |
| --- | --- | --- | --- |
| Custo por pergunta (cache semântico 25%) | US$ 0,016 (R$ 0,09) | US$ 0,116 (R$ 0,66) | US$ 0,396 (R$ 2,25) |
| Usuário com 150 perguntas/mês | US$ 2,41 (R$ 13,69) | US$ 17,43 (R$ 99,11) | US$ 59,39 (R$ 337,70) |
| 1.000 usuários, 150 perguntas/mês | US$ 2.408 (R$ 13.692) | US$ 17.432 (R$ 99.112) | US$ 59.394 (R$ 337.699) |

- **Ingestão (backfill de cerca de 89 mil atos, 10 anos federal + 5 UFs + 25 municípios):** US$ 11 mil (R$ 63 mil) com Batch e cache; US$ 44 mil (R$ 250 mil) sem nenhum dos dois.
- **Manutenção mensal da base:** US$ 136 (R$ 774) com Batch e cache; US$ 542 (R$ 3.081) sem os dois.
- **doc2query (600 mil unidades):** US$ 118 com Haiku 5.5 em lote; US$ 2.306 com Sonnet 5.5 em lote.
- **Um ciclo DGM** (20 variantes, benchmark de 500 perguntas): US$ 1.437 (R$ 8.172), ou cerca de US$ 755 se a avaliação rodar em lote. Semanal: US$ 3,3 mil a 6,2 mil por mês.
- **Auditoria amostral (400 itens/mês):** US$ 14 de API. O custo real é o especialista humano.
- **API durante o desenvolvimento:** US$ 1 mil a 1,5 mil/mês na Fase 1 e US$ 3 mil a 4 mil/mês nas Fases 2 e 3, sem contar a DGM.
- **Conferência do arquivo 03:** a estimativa de US$ 0,15 a 0,29 por ato está certa nas premissas dela. Recalculei e deu US$ 0,147 em lote e US$ 0,294 em tempo real para um ato normativo médio. Ela não inclui triagem do DOU inteiro, textos consolidados grandes nem doc2query.

**Câmbio usado em todas as tabelas em reais:** US$ 1 = R$ 5,4935 (PTAX de 3/11/2026, conforme o pedido; não reconferi no Banco Central) × 1,035 de IOF = **R$ 5,6858 por dólar pago**.

---

## 2. Preços dos modelos

### 2.1 Anthropic [confirmado]

Fontes: [preços](https://platform.claude.com/docs/en/about-claude/pricing), [Opus 5.5](https://platform.claude.com/docs/en/models/opus-5-5/overview), [Sonnet 5.5](https://platform.claude.com/docs/en/models/sonnet-5-5/overview), [Haiku 5.5](https://platform.claude.com/docs/en/models/haiku-5-5/overview), [Fable 5.1](https://platform.claude.com/docs/en/models/fable-5-1/overview), [cache de prompt](https://platform.claude.com/docs/en/build-with-claude/prompt-caching).

Os quatro nomes que você ouviu existem. Os quatro são modelos ativos e os mais recentes de cada linha.

| Modelo (ID) | Lançamento | Entrada | Escrita de cache 5 min / 1 h | Leitura de cache | Saída | Lote (entrada / saída) | Raciocínio |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Claude Fable 5.1 (`claude-fable-5-1`) | 1/9/2026 | 10 | 12,50 / 20 | 0,25 | 50 | 5 / 25 | Adaptativo, sempre ligado; esforço padrão `high` |
| Claude Opus 5.5 (`claude-opus-5-5`) | 22/9/2026 | 4 | 5 / 8 | 0,20 | 20 | 2 / 10 | Adaptativo, sempre ligado; esforço padrão `medium` |
| Claude Sonnet 5.5 (`claude-sonnet-5-5`) | 28/9/2026 | 2 | 2,50 / 4 | 0,10 | 10 | 1 / 5 | Adaptativo; esforço padrão `high`; o nível mais baixo desliga o raciocínio antecipado |
| Claude Haiku 5.5 (`claude-haiku-5-5`), prompt de até 100 mil tokens | 7/10/2026 | 0,10 | 0,125 / 0,20 | 0,01 | 0,50 | 0,05 / 0,25 | Adaptativo; esforço padrão `medium` |
| Claude Haiku 5.5, prompt acima de 100 mil tokens | — | 0,50 | 0,625 / 1 | 0,05 | 2,50 | 0,25 / 1,25 | — |

**Regras que pesam no custo:**

- **Escrita e leitura de cache.** A escrita custa 1,25× a entrada com validade de 5 minutos, ou 2× com validade de 1 hora. A leitura custa 0,1× a entrada, com três exceções: 0,05× no Opus 5.5 e no Sonnet 5.5, e 0,025× no Fable 5.1. O prompt mínimo que pode ser guardado em cache é de 512 tokens, com até 4 pontos de cache por pedido.
- **Batch API.** Dá 50% de desconto na entrada e na saída e se soma ao desconto de cache. Em lote, o acerto de cache é por "melhor esforço". A recomendação oficial é mandar primeiro um pedido com o prefixo em cache de 1 hora e só depois o resto do lote. O lote também aceita até 300 mil tokens de saída (com cabeçalho beta).
- **Contexto longo.** Todos os modelos atuais têm janela de 1 milhão de tokens. Do 4.6 em diante, a janela inteira é cobrada pelo preço normal, exceto no Haiku 5.5: nele, um prompt acima de 100 mil tokens paga 5× o pedido inteiro. Não passe de 100 mil tokens no Haiku.
- **Tokenizador.** Os modelos do 4.7 em diante geram cerca de 30% mais tokens para o mesmo texto. Todas as contagens deste documento já estão em tokens do tokenizador novo.
- **Raciocínio é cobrado como saída.** No Opus 5.5 e no Fable 5.1, o raciocínio não pode ser desligado; só o esforço pode ser ajustado. Esse é o maior fator de incerteza nas estimativas.
- **Modo rápido.** O Opus 5.5 custa US$ 8 de entrada e US$ 40 de saída nesse modo, sem lote. Não faz sentido para este produto.
- **Busca na web:** US$ 10 por mil buscas, mais os tokens. Buscar e ler uma página (web fetch) não tem custo extra.
- **Região e residência de dados:**
  - O parâmetro `inference_geo: "us"` multiplica todos os preços por 1,1. O padrão, `global`, não tem acréscimo.
  - **Não há opção de região no Brasil ou na América do Sul.** No Amazon Bedrock, São Paulo (`sa-east-1`) só aparece com endpoint global. Os endpoints regionais do Bedrock e do Google Cloud custam 10% a mais, e os perfis regionais existem só para EUA, UE, Japão e Austrália ([Claude no Bedrock](https://platform.claude.com/docs/build-with-claude/claude-in-amazon-bedrock)).
  - Para a LGPD, a saída é transferência internacional com cláusulas contratuais, não residência local.
- **Modelos anteriores ainda disponíveis** (servem de referência):
  - Opus 5 e Opus 4.5 a 4.8: US$ 5 / 25.
  - Sonnet 5: US$ 2 / 10, com leitura de cache a 0,20.
  - Sonnet 4.6: US$ 3 / 15.
  - Haiku 4.5: US$ 1 / 5. O Haiku 5.5 é 10 vezes mais barato.
  - O Mythos 5.1 tem o preço do Fable 5.1, mas é restrito a organizações verificadas.

### 2.2 Concorrentes

| Fornecedor e modelo | Entrada | Entrada em cache | Saída | Lote | Status | Fonte |
| --- | --- | --- | --- | --- | --- | --- |
| OpenAI gpt-6-astra | 10 | 1,00 | 50 | 50% (Flex ou Batch) | [confirmado] | [developers.openai.com/api/docs/pricing](https://developers.openai.com/api/docs/pricing) |
| OpenAI gpt-6.1-sol | 2 | 0,10 | 10 | 50% | [confirmado] | idem |
| OpenAI gpt-6.1-terra | 1 | 0,05 | 5 | 50% | [confirmado] | idem |
| OpenAI gpt-6-luna | 0,10 | 0,01 | 0,50 | 50% | [confirmado] | idem |
| OpenAI gpt-5.5 / chat-latest | 5 | 0,50 | 30 | — | [confirmado] (chat-latest) | idem |
| Google Gemini 4 Argon | 2 até 30/11; **4 a partir de 1/12/2026** | 0,10 → 0,20 | 10 → 20 | 50% | [confirmado no Vertex] | [Vertex AI pricing](https://cloud.google.com/vertex-ai/generative-ai/pricing) |
| Google Gemini 3.1 Pro Preview (até 200 mil / acima) | 2 / 4 | 0,20 / 0,40 | 12 / 18 | 50% | [confirmado no Vertex] | idem |
| Google Gemini 3.8 Flash | 0,75; **1,50 a partir de 1/1/2027** | 0,075 → 0,15 | 3,75 → 7,50 | 50% | [confirmado no Vertex] | idem |
| Google Gemini 3.5 Flash-Lite | 0,30 | 0,03 | 2,50 | 50% | [confirmado no Vertex] | idem |
| Google Gemini 3.1 Flash-Lite | 0,25 | 0,025 | 1,50 | 50% | [confirmado no Vertex] | idem |
| xAI grok-4.7 (até 200 mil tokens) | 2 | 0,50 | 6 | 20% | [secundário] | [Morph, verificado em 3/11/2026](https://www.morphllm.com/grok-api-pricing) |
| xAI grok-4.3 | 1,25 | 0,20 | 2,50 | 20% | [secundário] | idem |
| DeepSeek V4 Pro (direto, horário de pico / fora do pico) | 1,32 / 0,66 | 0,044 / 0,022 | 3,96 / 1,98 | — | [confirmado] | [api-docs.deepseek.com](https://api-docs.deepseek.com/quick_start/pricing) |
| DeepSeek Flash V4.1 (pico / fora do pico) | 0,30 / 0,15 | 0,006 / 0,003 | 1,20 / 0,60 | — | [confirmado] | idem |
| Qwen3.7-Max (Together) | 1,50 | 0,30 | 4,50 | não claro | [confirmado] | [together.ai/pricing](https://www.together.ai/pricing) |
| Qwen3.8 Flash (Together) | 0,15 | — | 0,47 | — | [confirmado] | idem |
| DeepSeek V4 Pro (Together) | 1,32 | 0,13 | 3,96 | — | [confirmado] | idem |
| gpt-oss-120B (Together) | 0,15 | — | 0,60 | — | [confirmado] | idem |
| Llama 3 8B Instruct Lite (Together) | 0,14 | — | 0,14 | — | [confirmado] | idem |

**Observações:**

- **Google.** A página do AI Studio (ai.google.dev) não abriu daqui; usei a tabela oficial do Vertex AI. O Vertex cobra 10% a mais fora do endpoint global. Os dois aumentos de preço já agendados, no Argon em 1/12/2026 e no 3.8 Flash em 1/1/2027, mudam a comparação.
- **OpenAI.** Os endpoints regionais (residência de dados) custam 10% a mais nos modelos lançados desde 5/3/2026. A página oficial não lista embeddings.
- **xAI.** A documentação oficial (docs.x.ai) não abriu daqui. Segundo a fonte secundária, o preço dobra acima de 200 mil tokens.
- **DeepSeek.** É o mais barato, mas os servidores ficam na China. Para dados de clientes de escritório, exige análise de LGPD; via Together, roda nos EUA.
- **Llama.** A Together só lista modelos Llama antigos e pequenos. Não confirmei um Llama de ponta atual.

### 2.3 Embeddings e rerank

| Fornecedor e modelo | US$/MTok | Observação | Status |
| --- | --- | --- | --- |
| Voyage voyage-4-large / voyage-4 / voyage-4-lite | 0,12 / 0,06 / 0,02 | 200 milhões de tokens grátis por modelo; lote com 33% de desconto | [confirmado] [docs.voyageai.com](https://docs.voyageai.com/docs/pricing) |
| Voyage voyage-context-4 (embedding contextualizado) | 0,12 | — | [confirmado] |
| Voyage rerank-3 / rerank-3-lite | 0,05 / 0,02 | 200 milhões de tokens grátis | [confirmado] |
| Cohere Rerank 5 Pro / Fast | 0,05 / 0,02 | Passou a cobrar por token em 23/10/2026; antes eram US$ 2,50 por mil buscas | [secundário] [UsagePricing](https://www.usagepricing.com/blueprint/activity/cohere-2026-10-23-rerank-5-per-token-pricing) |
| Cohere Embed | não encontrado | A página oficial não mostrou o preço | [não confirmado] |
| Jina embeddings v5 / reranker | 0,05 (nano: 0,02) | 10 milhões de tokens grátis, uma única vez | [secundário] [Markaicode](https://markaicode.com/pricing/jina-ai-pricing/) |
| OpenAI text-embedding-3-small | 0,02 | — | [secundário] [OpenRouter](https://openrouter.ai/models/openai/text-embedding-3-small) |
| Google Gemini Embedding 2 (texto) | 0,20 (lote: 0,10) | — | [confirmado no Vertex] |

**Leitura para o projeto:**

- Embeddings e rerank via API custam centavos por mês neste volume. O custo que importa está nos modelos de linguagem.
- O recuperador multivetorial (ColBERT), o reranker de raciocínio (Rank1) e a política de busca (Search-R1) do plano são modelos abertos que o projeto vai hospedar. Por isso não entram aqui como custo de API. O custo de GPU fica para a pesquisa de infraestrutura.
- Nas configurações abaixo, o reranker de raciocínio aparece cobrado como chamada a um modelo da Anthropic. É o caminho para começar antes de treinar o Rank1.

### 2.4 Câmbio e tributos

- **PTAX de 3/11/2026: R$ 5,4935**, valor informado no pedido. A API do Banco Central não abriu daqui, então não reconferi.
- **IOF de 3,5%:**
  - É a alíquota do cartão internacional e das "demais saídas", desde os Decretos 12.466 e 12.467/2025 e o 12.499/2025, com a decisão do STF na ADI 7.827. Segundo a [Barbieri Advogados](https://barbieriadvogados.com/iof-2025-guia-completo-das-aliquotas-apos-decisao-do-stf-analise-juridica/), a remessa para pagar serviços no exterior também está em 3,5% (art. 15-B, XXIV, do Decreto 6.306/2007).
  - **[Não confirmado no texto do decreto.]**
  - O cronograma antigo de redução até 0% em 2028 (Decreto de 2022) foi substituído por esses decretos.
- **[Não confirmado: precisa de parecer tributário.]** Quando uma pessoa jurídica brasileira importa um serviço, além do IOF podem incidir:
  - IRRF de 15% ou 25%;
  - PIS/Cofins-Importação de 9,25%, em transição para a CBS a partir de 2027;
  - ISS de 2% a 5%;
  - CIDE de 10%, conforme o enquadramento do serviço.
  
  Somados, esses tributos podem acrescentar de 30% a 45% ao custo de API, com parte recuperável como crédito no Lucro Real. **Não estão nas tabelas.** É justamente o tipo de pergunta que o produto vai responder; vale levá-la ao contador do próprio projeto.

---

## 3. Custo por pergunta

### 3.1 Premissas

Tokens contados no tokenizador novo. Uma "pergunta" já inclui os pedidos de esclarecimento, a segunda rodada de busca, a reescrita após a verificação e o escalonamento.

| Etapa | Premissa | Econômica | Padrão | Premium |
| --- | --- | --- | --- | --- |
| 1. Entendimento e árvore de temas | 8 mil tokens em cache (taxonomia e instruções) + 800 novos; 600 de saída; +10% por pedidos de esclarecimento | Haiku 5.5 | Haiku 5.5 | Haiku 5.5 |
| 2. Cache semântico | Embedding da pergunta (100 tokens, voyage-4). No acerto, o Haiku confere a vigência: 2 mil tokens em cache + 3 mil novos, 300 de saída | taxa de acerto de 25% | 25% | 25% |
| 3 a 5. Vigência, BM25, multivetorial e PageRank | Código e modelos hospedados pelo projeto; custo de API zero | — | — | — |
| 6. Reranker de 50 candidatos | 22 mil tokens de candidatos + 2 mil em cache; 2 mil a 2,5 mil de saída (raciocínio) | Voyage rerank-3 (20 mil tokens) | Haiku 5.5 em lista | Sonnet 5.5 em lista |
| 6'. Segunda rodada (a política decide buscar de novo) | Repete a etapa 6 | 25% das perguntas | 25% | 30% |
| 7. Modelo principal | 10 mil tokens de instruções em cache + contexto recuperado + 1,5 mil de pergunta, perfil e histórico; 1,2 mil de resposta + raciocínio | Haiku 5.5; contexto de 12 mil; raciocínio de 1,5 mil | Sonnet 5.5; contexto de 25 mil; raciocínio de 3 mil | Opus 5.5; contexto de 40 mil; raciocínio de 3 mil |
| 7'. Busca ao vivo (Camada 3) | 5% das perguntas: 2 buscas na web + 15 mil tokens a mais no modelo principal | sim | sim | sim |
| 7''. Reescrita depois da verificação | 15% das perguntas: o modelo principal recebe +3 mil tokens e gera 2 mil | sim | sim | sim |
| 8. Verificação de citações | Resposta e textos citados: 11,2 mil novos + 4 mil em cache | Haiku 5.5 (1,5 mil de saída) | Haiku 5.5 com esforço alto (2,5 mil) | Sonnet 5.5 (2,5 mil) |
| 9. Escalonamento | Reprocessa a resposta e a verificação com o modelo maior | 15% vão para o Sonnet 5.5 | 15% vão para o Opus 5.5 | 10% vão para o Fable 5.1 (raciocínio de 6 mil) |
| Prefixos em cache | 90% de leituras e 10% de escritas (validade de 5 minutos) | — | — | — |

### 3.2 Resultado por etapa (US$, já ponderado pela taxa de acerto do cache)

| Etapa | Econômica | Padrão | Premium |
| --- | --- | --- | --- |
| Entendimento e árvore de temas | 0,0006 | 0,0006 | 0,0006 |
| Cache semântico (embedding + validação no acerto) | 0,0001 | 0,0001 | 0,0001 |
| Reranker (com a segunda rodada) | 0,0009 | 0,0030 | 0,0679 |
| Modelo principal (com busca ao vivo e reescrita) | 0,0033 | 0,0849 | 0,2209 |
| Verificação de citações | 0,0015 | 0,0018 | 0,0366 |
| Escalonamento | 0,0096 | 0,0257 | 0,0698 |
| **Total por pergunta (US$)** | **0,0161** | **0,1162** | **0,3960** |
| **Total por pergunta (R$)** | **0,09** | **0,66** | **2,25** |

**Sensibilidade à taxa de acerto do cache semântico (US$ por pergunta):**

| Acerto | 0% | 15% | 25% (base) | 40% |
| --- | --- | --- | --- | --- |
| Econômica | 0,0210 | 0,0180 | 0,0161 | 0,0131 |
| Padrão | 0,1546 | 0,1316 | 0,1162 | 0,0932 |
| Premium | 0,5276 | 0,4486 | 0,3960 | 0,3170 |

**Leitura:**

- Na configuração padrão, o modelo principal responde por 73% do custo; reduzir o contexto montado é a alavanca mais forte.
- Na econômica, o escalonamento para o Sonnet responde por 60% do custo.
- Quem paga mais do que o necessário é a pergunta difícil, não a típica. A DGM deve otimizar o limiar de escalonamento.
- Incerteza principal: os tokens de raciocínio. Se o Sonnet ou o Opus raciocinarem 8 mil tokens em vez de 3 mil, a configuração padrão sobe para cerca de US$ 0,16 e a premium para cerca de US$ 0,55 por pergunta.

### 3.3 Troca do modelo principal na configuração padrão (mesmas premissas)

| Modelo principal | US$ por pergunta | R$ por pergunta |
| --- | --- | --- |
| Claude Haiku 5.5 | 0,036 | 0,21 |
| Gemini 3.8 Flash (até 31/12/2026) | 0,064 | 0,36 |
| Grok 4.3 [secundário] | 0,073 | 0,41 |
| GPT-6.1-terra | 0,074 | 0,42 |
| DeepSeek V4 Pro (pico) | 0,078 | 0,44 |
| Qwen3.7-Max (Together) | 0,087 | 0,49 |
| Gemini 3.8 Flash (a partir de 1/1/2027) | 0,095 | 0,54 |
| GPT-6.1-sol | 0,116 | 0,66 |
| **Claude Sonnet 5.5 (base)** | **0,116** | **0,66** |
| Gemini 4 Argon (a partir de 1/12/2026) | 0,200 | 1,13 |
| Claude Opus 5.5 | 0,200 | 1,14 |

Os preços por token se aproximaram. A escolha deve sair do benchmark (acerto por real gasto), como prevê o plano, e não da tabela de preços. O GPT-6.1-sol tem o mesmo preço do Sonnet 5.5, o que o torna a escolha natural para a verificação cruzada entre fornecedores.

---

## 4. Custo mensal por usuário

| Perguntas por mês | Econômica | Padrão | Premium |
| --- | --- | --- | --- |
| 50 | US$ 0,80 (R$ 4,56) | US$ 5,81 (R$ 33,04) | US$ 19,80 (R$ 112,57) |
| 150 | US$ 2,41 (R$ 13,69) | US$ 17,43 (R$ 99,11) | US$ 59,39 (R$ 337,70) |
| 400 | US$ 6,42 (R$ 36,51) | US$ 46,48 (R$ 264,30) | US$ 158,38 (R$ 900,53) |

Comparando com o mercado: o plano cita a faixa de R$ 130 a 300 por mês por usuário para IA jurídica. A configuração padrão a 150 perguntas consome cerca de R$ 99 só de API. Ela cabe nessa faixa, mas com margem pequena. Um usuário intenso (400 perguntas) precisa de limite ou de uma combinação de configurações: econômica para perguntas simples e escalonamento para as difíceis.

## 5. Totais mensais (150 perguntas por usuário)

| Usuários | Econômica | Padrão | Premium |
| --- | --- | --- | --- |
| 100 | US$ 241 (R$ 1.369) | US$ 1.743 (R$ 9.911) | US$ 5.939 (R$ 33.770) |
| 1.000 | US$ 2.408 (R$ 13.692) | US$ 17.432 (R$ 99.112) | US$ 59.394 (R$ 337.699) |
| 10.000 | US$ 24.081 (R$ 136.917) | US$ 174.317 (R$ 991.124) | US$ 593.936 (R$ 3.376.985) |

**Não incluído:**

- GPU dos modelos hospedados pelo projeto (ColBERT, Rank1, Search-R1).
- Banco de dados.
- Tributos de importação de serviço além do IOF (seção 2.4).
- Descontos por volume negociados com o fornecedor.

Com 10 mil usuários, a taxa de acerto do cache semântico tende a subir, porque há mais perguntas repetidas. O custo por pergunta cai, mas não incluí esse efeito.

---

## 6. Ingestão

### 6.1 Número estimado de atos [não confirmado: estimativa própria]

| Bloco | Atos normativos (A) | Interpretações (B) | Decisões e ementas (C) | Base da estimativa |
| --- | --- | --- | --- | --- |
| Federal, 10 anos | 11.000 | 6.000 | 20.500 | **A:** cerca de 900 leis e LCs relevantes, 250 MPs, 1.200 decretos, 1.500 INs (RFB, INSS e outras), 3.000 portarias e atos declaratórios, 350 resoluções do CGSN e NBCs, 4.100 atos do CONFAZ (convênios, ajustes SINIEF e protocolos). **B:** Soluções de Consulta COSIT (cerca de 300 por ano) e vinculadas. **C:** seleção de cerca de 2 mil acórdãos do CARF por ano (CSRF, súmulas e paradigmas) + 500 temas do STF e do STJ |
| 5 UFs (SP, MG, PR, SC, RS) | 16.500 | 15.000 | 10.000 | Cerca de 330 atos de ICMS, ITCMD e IPVA por ano por UF; respostas a consultas da Sefaz (SP publica milhares); seleção de decisões dos tribunais administrativos |
| 25 municípios (capitais + maiores) | 10.000 | — | — | Cerca de 40 atos de ISS, IPTU e ITBI por ano por município |
| **Total** | **37.500** | **21.000** | **30.500** | **89 mil atos com extração completa** |

Também entram no backfill:

- **Triagem:** cerca de 5 milhões de atos de diários (DOU Seção 1, DOEs e diários municipais), que passam só pelo triador.
- **Textos consolidados grandes:** cerca de 27 milhões de tokens de normas vigentes já consolidadas (CTN, RIR, RIPI, RICMS das 5 UFs com anexos, códigos tributários municipais). Entram com a versão atual.

### 6.2 Custo por ato

Premissas:

- **Tamanho do texto:** A tem 5 mil tokens; B, 3 mil; C, 2 mil.
- **Saída do extrator:** do mesmo tamanho do texto, já com o raciocínio.
- **Manual e casos-modelo:** 30 mil tokens, guardados em cache.
- **Modelos de cada etapa:**
  - extrator primário: Opus 5.5;
  - extrator independente: GPT-6.1-sol (outro fornecedor, como pede o plano);
  - revisor: Sonnet 5.5;
  - reconciliador: Opus 5.5, em 20% dos atos;
  - triador, normalizador e conferente: Haiku 5.5.

| Classe | Tempo real, sem cache | Tempo real, com cache | Lote, sem cache | **Lote, com cache** |
| --- | --- | --- | --- | --- |
| A, ato normativo | 0,539 | 0,294 | 0,270 | **0,147** |
| B, interpretação | 0,430 | 0,186 | 0,215 | **0,093** |
| C, decisão ou ementa | 0,377 | 0,132 | 0,188 | **0,066** |

Para um ato normativo em tempo real com cache, o custo se divide assim (US$):

| Extrator Opus | Independente GPT | Revisor Sonnet | Reconciliador | Triagem, normalização e conferência |
| --- | --- | --- | --- | --- |
| 0,131 | 0,065 | 0,065 | 0,031 | 0,002 |

Sem cache, o manual de 30 mil tokens é cobrado inteiro em cada uma das quatro chamadas, e o custo quase dobra. O cache é obrigatório na ingestão.

### 6.3 Backfill

| Modo | Atos (A + B + C) | Triagem (5 milhões) | Textos consolidados (27 milhões de tokens) | **Total US$** | **Total R$** |
| --- | --- | --- | --- | --- | --- |
| Tempo real, sem cache | 40.758 | 2.623 | 513 | **43.894** | **249.570** |
| Tempo real, com cache | 18.952 | 2.623 | 513 | **22.088** | **125.585** |
| Lote, sem cache | 20.379 | 1.312 | 256 | **21.947** | **124.785** |
| **Lote, com cache** | 9.476 | 1.312 | 256 | **11.044** | **62.793** |

Premissas dos textos consolidados: por milhão de tokens de texto, o Opus e o GPT leem 1 milhão e escrevem 300 mil cada um, e o Sonnet revisa.

Somado, o backfill completo cabe em cerca de US$ 11 mil e se paga ao longo das fases 2 a 4. O piloto de 300 documentos com 5 rodadas de revisão custa cerca de US$ 440 (R$ 2.500) em tempo real.

### 6.4 Manutenção mensal

Volume premissa por mês:

- 47 mil atos triados (12 mil do DOU, 15 mil dos DOEs, 20 mil dos diários municipais);
- 550 atos normativos (inclui o fluxo de regulamentação da reforma, como as resoluções do CGIBS, e cerca de 100 vindos da busca ao vivo);
- 250 interpretações;
- 300 decisões.

| Modo | Atos | Triagem | **Total US$/mês** | **Total R$/mês** |
| --- | --- | --- | --- | --- |
| Tempo real, sem cache | 517 | 25 | **542** | **3.081** |
| Tempo real, com cache | 248 | 25 | **272** | **1.549** |
| Lote, sem cache | 259 | 12 | **271** | **1.541** |
| **Lote, com cache** | 124 | 12 | **136** | **774** |

A meta de menos de 24 horas para o DOU é compatível com o lote, que normalmente termina em menos de 1 hora e tem prazo máximo de 24 horas. Atos urgentes podem ir em tempo real por cerca de US$ 0,29 cada.

Reprocessar a base inteira quando o esquema ganhar uma extensão (v1.1) custa uma fração do backfill. Por exemplo, preencher um campo novo só com o Sonnet em lote sai por cerca de US$ 1 mil a 3 mil por evento.

### 6.5 doc2query (perguntas previstas por dispositivo)

Premissas:

- **Volume:** 600 mil unidades, somando cerca de 250 mil dispositivos de textos consolidados, cerca de 300 mil versões criadas pelos atos A e 51,5 mil interpretações e decisões.
- **Por unidade:** 1 mil tokens novos (dispositivo, artigo-pai e ementa) + 1,5 mil de instruções em cache, gerando 10 perguntas (cerca de 550 tokens de saída, já com raciocínio leve).

| Modelo | US$ por unidade | Backfill, 600 mil unidades (US$) | R$ |
| --- | --- | --- | --- |
| Haiku 5.5, tempo real | 0,00039 | 235 | 1.336 |
| **Haiku 5.5, lote** | 0,00020 | **118** | **668** |
| Sonnet 5.5, tempo real | 0,0077 | 4.612 | 26.221 |
| Sonnet 5.5, lote | 0,0038 | 2.306 | 13.110 |

**Custos relacionados:**

- Manutenção mensal: cerca de 6 mil unidades novas ou alteradas custam cerca de US$ 1 com o Haiku em lote.
- Embeddings via API (600 mil unidades × 700 tokens, voyage-4): cerca de US$ 25. Cabe na cota gratuita de 200 milhões de tokens.
- Resumos da árvore de temas (RAPTOR): cerca de 20 mil resumos com o Sonnet em lote custam cerca de US$ 260.

Recomendação: gerar com o Haiku 5.5 e testar no benchmark uma amostra gerada pelo Sonnet. Só vale pagar 20 vezes mais se o ganho de recuperação aparecer.

---

## 7. Ciclo da DGM

Premissas:

- **Custo por pergunta avaliada:** configuração padrão sem cache semântico (US$ 0,155) + modelo-juiz Sonnet 5.5 (9 mil tokens de entrada e 1,2 mil de saída) = **US$ 0,18 por item**.
- **Variantes:** 20 por ciclo. A DGM original roda 80 iterações; aqui o ciclo é reduzido.
- **Avaliação em estágios:** cada variante roda 50 perguntas; 30% passam ao conjunto completo de 500.
- **Proposta de cada variante:** o agente de código (Opus 5.5) lê os registros de erro e reescreve o código, em cerca de 4 turnos de 300 mil tokens de entrada (90% em cache) e 30 mil de saída. Custa cerca de US$ 3,60 por variante.
- **Finalistas:** 3, avaliados 2 vezes cada no conjunto completo, mais o conjunto reservado de 200 perguntas.

| Item | US$ |
| --- | --- |
| Por variante (avaliação em estágios + proposta) | 39,53 |
| **Ciclo completo** | **1.437 (R$ 8.172)** |
| Ciclo com a avaliação em lote | 755 (R$ 4.291) |

| Frequência | Por mês, tempo real | Por mês, avaliação em lote |
| --- | --- | --- |
| Mensal | US$ 1.437 (R$ 8.172) | US$ 755 (R$ 4.291) |
| Quinzenal | US$ 2.874 (R$ 16.344) | US$ 1.510 (R$ 8.583) |
| Semanal (Fase 3 do plano) | US$ 6.223 (R$ 35.384) | US$ 3.268 (R$ 18.582) |

**Observações:**

- No lote, cada etapa do agente (cerca de 5 etapas encadeadas) espera o lote anterior terminar. Um ciclo pode levar um ou dois dias, o que é aceitável fora da produção.
- Para cortar mais, use um juiz mais barato (Haiku 5.5, calibrado contra a revisão humana) no primeiro estágio e o Sonnet só nos finalistas.
- A DGM vira o maior item fixo enquanto a base de usuários é pequena. Comece com ciclo mensal e passe ao semanal quando houver mais de 1.000 usuários pagantes.

## 8. Auditoria amostral (400 itens por mês)

| Item | Premissa | US$/mês | R$/mês |
| --- | --- | --- | --- |
| Preparação dos pacotes de auditoria (Sonnet 5.5 junta a evidência e o histórico) | 12 mil tokens de entrada e 1,5 mil de saída por item | 14 | 81 |
| Especialista humano [não confirmado] | 1 a 2 dias (8 a 16 h) a R$ 200–300 por hora | — | R$ 1.600 a 4.800 |

O sorteio e o cálculo da taxa de erro são código, sem custo de API.

## 9. API durante o desenvolvimento

Premissas:

- 3 desenvolvedores rodam cada um 150 perguntas de teste por dia útil (21 dias) na configuração padrão sem cache.
- 20 regressões por mês no benchmark de 500 perguntas, com juiz.
- 2 mil atos de teste de ingestão por mês em tempo real.

| Item | Fase 1 (meses 1 a 3) | Fases 2 e 3 (meses 4 a 9) |
| --- | --- | --- |
| Testes manuais dos desenvolvedores | US$ 500 a 1.000 | US$ 1.461 |
| Regressão no benchmark (com juiz) | US$ 200 (benchmark ainda pequeno) | US$ 1.796 |
| Testes de ingestão | US$ 300 a 600; piloto de 300 docs × 5 rodadas = US$ 441, uma vez | US$ 589 |
| **Total por mês** | **US$ 1.000 a 1.500 (R$ 5.700 a 8.500)** | **US$ 3.000 a 4.000 (R$ 17 mil a 22,7 mil)** |
| DGM, a partir da Fase 3 (seção 7) | — | + US$ 755 a 6.223 |

**Observações:**

- O Claude Code dos desenvolvedores é pago por assento (arquivo 03), não por token, e não entra aqui.
- O arquivo 03 estimou de US$ 300 a 1.500 por mês. O valor fica nessa faixa só se os testes usarem a configuração econômica ou amostras menores. A regressão no benchmark sai mais barata com avaliação em lote e com o juiz Haiku.

---

## 10. O que não foi confirmado

| Item | Situação |
| --- | --- |
| PTAX de 3/11/2026 (R$ 5,4935) | Valor do pedido; a API do Banco Central não abriu daqui |
| IOF de 3,5% sobre o pagamento de serviços no exterior | Fonte secundária (escritório de advocacia); não li o decreto |
| IRRF, PIS/Cofins-Importação, ISS e CIDE sobre a importação do serviço | Não calculados; precisa de parecer |
| Preços da xAI | Agregador (Morph), sem acesso a docs.x.ai |
| Gemini no AI Studio (ai.google.dev) | A página não abriu; usei a tabela oficial do Vertex AI |
| Cohere Rerank 5 e Embed | Agregador; a página oficial não mostrou o preço por token |
| Jina e OpenAI embeddings | Agregadores (Markaicode e OpenRouter) |
| Desconto de lote da Together | Não está claro na página |
| Número de atos (89 mil) e de dispositivos (600 mil) | Estimativa própria; refazer com contagem real no piloto |
| Tokens de raciocínio (de 1,5 mil a 6 mil por resposta) | Premissa; medir com o campo `usage` nos primeiros testes |
| Taxa de acerto do cache semântico (25%), escalonamento (10% a 15%) e segunda rodada (25% a 30%) | Premissas; a DGM e a telemetria vão dar os números reais |
| GPU para ColBERT, Rank1 e Search-R1 | Fora do escopo (infraestrutura) |

## Fontes

- [Anthropic: preços](https://platform.claude.com/docs/en/about-claude/pricing)
- [Anthropic: Claude Opus 5.5](https://platform.claude.com/docs/en/models/opus-5-5/overview)
- [Anthropic: Claude Sonnet 5.5](https://platform.claude.com/docs/en/models/sonnet-5-5/overview)
- [Anthropic: Claude Haiku 5.5](https://platform.claude.com/docs/en/models/haiku-5-5/overview)
- [Anthropic: Claude Fable 5.1](https://platform.claude.com/docs/en/models/fable-5-1/overview)
- [Anthropic: cache de prompt](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)
- [Anthropic: Claude no Amazon Bedrock](https://platform.claude.com/docs/build-with-claude/claude-in-amazon-bedrock)
- [OpenAI: preços da API](https://developers.openai.com/api/docs/pricing)
- [Google: preços do Vertex AI](https://cloud.google.com/vertex-ai/generative-ai/pricing)
- [Morph: preços do Gemini](https://www.morphllm.com/gemini-api-pricing) (secundário)
- [Morph: preços da xAI](https://www.morphllm.com/grok-api-pricing) (secundário)
- [Morph: preços da OpenAI](https://morphllm.com/openai-api-pricing) (secundário)
- [DeepSeek: preços](https://api-docs.deepseek.com/quick_start/pricing)
- [Together AI: preços](https://www.together.ai/pricing)
- [Voyage AI: preços](https://docs.voyageai.com/docs/pricing)
- [UsagePricing: Cohere Rerank 5](https://www.usagepricing.com/blueprint/activity/cohere-2026-10-23-rerank-5-per-token-pricing) (secundário)
- [Markaicode: preços da Jina](https://markaicode.com/pricing/jina-ai-pricing/) (secundário)
- [OpenRouter: text-embedding-3-small](https://openrouter.ai/models/openai/text-embedding-3-small) (secundário)
- [Barbieri Advogados: IOF 2025](https://barbieriadvogados.com/iof-2025-guia-completo-das-aliquotas-apos-decisao-do-stf-analise-juridica/) (secundário)
- [Cescon Barrieu: alterações no IOF-câmbio](https://cesconbarrieu.com.br/alteracoes-no-iof-para-cambio-entenda-as-novas-regras/) (secundário)
- Script de cálculo: `/tmp/claude-0/-home-claude/64c420e0-9838-52f1-a60b-b5119a4c7849/scratchpad/calc.py`

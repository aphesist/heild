# J5 · IA para advocacia: produtos, evidências, regras éticas e o que o nosso motor precisa mudar

Data da pesquisa: 8/11/2026 (todos os "acesso" abaixo são desta data). Frente J5 do pacote jurídico. Escopo: o que existe, o que funciona, o que falha e o que as regras permitem; o que mudaria no nosso motor de raciocínio legal (hoje no pacote Contábil) para servir ao meio jurídico.

**Método e limites.** 30 buscas na web e leitura de páginas por `curl` com extração de texto. Foram lidas na íntegra as fontes primárias que mais pesam: a Recomendação 001/2024 do CFOAB (PDF oficial), a Resolução CNJ 615/2025 (texto compilado no portal de atos do CNJ), a página do Stanford HAI e o resumo do artigo, o relatório da Vals AI e a página da Harvey. Não abriram (bloqueio/403/redirecionamento): Planalto (CPC, LGPD, Estatuto), TJSC, TJPR, Sifted, Jusbrasil. Por isso os artigos de lei citados sem link primário levam "[conhecimento próprio; a confirmar no texto]". Marcações: **[confirmado]** = li a fonte primária; **[secundária]** = notícia, blog ou agregador, não conferido na origem; **[a confirmar]** = indício sem verificação, ou dado que não encontrei. Preços de terceiros vêm quase todos de agregadores e de um concorrente (Locus.IA), com viés comercial. Não converti dólares em reais (câmbio não pesquisado).

---

## 0. Resumo em dez pontos

1. **O mercado é grande e está cada vez mais caro e concentrado lá fora.** Harvey: US$ 550 mi a US$ 15,5 bi (anúncio de 1/10/2026; o título aparece no blog da própria Harvey) [confirmado o título; ARR de ~US$ 400 mi é secundária]. Legora: série E de US$ 550 mi a US$ 8,8 bi (21/10/2026) [secundária]. A OpenAI lançou em 17/9/2026 o "Astra for Law", com índice de pesquisa jurídica próprio (EUA) [secundária].
2. **No Brasil, quem tem escala é o Jusbrasil** (Jus IA; compra da MinutaIA em 27/8/2026; "ARR próximo de R$ 1 bi", número do próprio grupo) e a **Enter** (contencioso de massa; série B de US$ 100 mi, avaliação de R$ 1,2 bi). Preços de entrada para o advogado individual ficam entre ~R$ 56 e ~R$ 250 por mês [secundária].
3. **Alucinação não foi resolvida nem por RAG de editora.** Stanford/Yale: Lexis+ AI e Ask Practical Law AI erraram em mais de 17% das consultas; Westlaw AI-Assisted Research, em 33% a 34% [confirmado, preprint de 30/5/2024; versão revisada por pares no JELS 2025, secundária]. Dois tipos de erro: resposta **incorreta** e resposta **mal fundamentada** (a fonte existe, mas não sustenta). Causas citadas: recuperação difícil, **autoridade inaplicável por jurisdição ou tempo** (caso Dobbs) e bajulação diante de premissa falsa.
4. **Benchmarks recentes são mistos:** no relatório Vals de outubro de 2025 as ferramentas de IA ficaram acima do grupo de advogados (74% a 78% contra 69% na nota ponderada), mas Thomson Reuters, LexisNexis e vLex não participaram; e na Legal Research Bench da Vals os melhores resultados ficam perto de 55% [secundária].
5. **Casos de sanção explodiram:** 2.266 decisões no banco de Charlotin (8/11/2026), 41 do Brasil, 898 envolvendo advogados [confirmado, página lida]. No Brasil há multas por má-fé e ofício à OAB em TJPR, TJSC, TSE, TST, TRT-MT e Justiça Federal [secundária].
6. **Regras da OAB ainda são "recomendação", mas endurecem:** Recomendação 001/2024 (11/11/2024), Plano Nacional de IA (15/6/2026), Resolução 16/26 sobre TACs com empresas de IA jurídica (publicada em 13/10/2026), provimento em elaboração, e ação civil pública da OAB/SP contra a Enter (7/10/2026). O ponto sensível é **atividade privativa da advocacia**: o nome comercial não protege, vale a natureza do serviço.
7. **Sigilo é a maior barreira de venda.** A Recomendação 2.2 exige que o fornecedor proteja o dado e **permita não usar os dados para treinamento**. O nosso desenho atual (doc. 07, seção 9.2) prevê melhoria do sistema com correções de **todos** os escritórios **sem opt-in**; isso **não serve para advocacia** sem mudança (seção 3.3).
8. **O nosso diferencial já existe em esqueleto:** filtro de vigência, citação conferida contra o texto e abstenção atacam exatamente as causas de erro que o Stanford descreve. Para o direito faltam: **três datas** (fato, ato, julgamento), **hierarquia e estado do precedente**, **tese vs. ementa**, **divergência entre tribunais** e **prazos como cálculo determinístico**.
9. **Benchmark:** gabarito feito por advogados, grupo-controle de advogados (como a Vals), conjunto reservado, métricas de citação por camada (existe, vigente na data do fato, hierarquia correta, sustenta a tese, não superada), abstenção e teste de premissa falsa. Com 200 casos por área o intervalo de 95% é de cerca de ±5,5 pontos (cálculo próprio).
10. **Venda:** módulos por área (trabalhista, família e sucessões, penal) são plausíveis, mas **penal** tem o maior risco (dados sensíveis, e o Astrea exclui matéria criminal do Jux) e **trabalhista** é o melhor primeiro candidato (ver 5.3). Os planos de teste R$ 79 / 189 / 299 ficam **na faixa** do mercado brasileiro; o Essencial a R$ 79 é praticamente o preço do Jus IA Essencial (R$ 78,90).

---

## 1. Tabela de produtos

### 1.1 Mundo

| Produto | O que faz | Citações e verificação | Preço | Escala / clientes | Investimento e avaliação | Status e fonte |
| --- | --- | --- | --- | --- | --- | --- |
| **Harvey** | Plataforma com agentes, Vault (documentos), Knowledge (pesquisa jurídica, regulatória e tributária), Spaces, Memory, revisão de contratos, monitoramento regulatório, intake, "Facts & Chronologies" (fatos e cronologias; anúncio de 5/11/2026 de um "Fact Graph" para disputas). Conectores via MCP | Não detalhado na página lida [a confirmar] | Não público. Estimativas de terceiros: ~US$ 1.200 a 2.000 por assento por mês, mínimo de ~20 assentos, 12 meses | Contagens de clientes divergem (de 700+ a 1.500+) [a confirmar]. Pesquisa ILTA citada: 43% dos escritórios respondentes usam (via agregador) | US$ 550 mi a US$ 15,5 bi (1/10/2026); antes, US$ 200 mi a US$ 11 bi (mar/2026; GIC e Sequoia). ARR ~US$ 400 mi (set/2026), US$ 190 mi em jan/2026 | Título da rodada: **confirmado** no [blog da Harvey](https://www.harvey.ai/blog). Resto: **secundária** ([SaasRise](https://www.saasrise.com/deals/harvey-raises-550m-in-funding-round-valuation-reaches-155b-fdaacbc6-e5ae-49f1-a9e7-224789dfde95), [CloudZero](https://www.cloudzero.com/blog/harvey-ai-pricing), [Vaquill](https://www.vaquill.ai/blog/harvey-ai-review-honest-assessment-2026)) |
| **Legora** (Suécia) | Pesquisa, revisão e redação com IA para escritórios; mais de 50 mercados | [a confirmar] | Não encontrado | Não encontrado | Série E US$ 550 mi a US$ 8,8 bi pós-dinheiro (anunciada em 21/10/2026, liderada pela Atreides); série D ~US$ 5,55 a 5,6 bi (mar/2026); série C US$ 1,8 bi (out/2025); série B US$ 675 mi (mai/2025) | **Secundária**: [Sifted](https://sifted.eu/articles/legora-funding-round-series-e-legal-tech/) (não abriu), [Startups](https://startups.com.br/negocios/inteligencia-artificial/sueca-legora-prepara-nova-rodada-e-mira-valuation-de-us-10b/) |
| **CoCounsel** (Thomson Reuters; originou-se da Casetext) | Pesquisa, resumo, revisão de documentos, minutas; ligado ao Westlaw | Westlaw AI-Assisted Research foi testado pelo Stanford: erro > 33% | Sem tabela pública. Agregadores: de US$ 104 a US$ 784 por usuário por mês, conforme plano e prazo (valores conflitantes) | TR cita (via blog) 41% dos escritórios e 47% dos jurídicos internos usando IA generativa em 2026 [a confirmar] | Aquisição da Casetext por TR em 2023 [conhecimento próprio; a confirmar valor] | **Secundária**: [Costbench](https://costbench.com/software/ai-legal-tools/cocounsel), [Haqq](https://www.haqq.ai/blog/cocounsel-review-alternatives.html) |
| **Lexis+ AI / Protégé** (LexisNexis) | Pesquisa e redação sobre a base Lexis, com links de citação | Promete "citações sem alucinação" (existência do link); Stanford: > 17% de respostas incorretas ou mal fundamentadas | Não encontrado | Não encontrado | Grupo RELX (não é startup) | Estudo: [HAI](https://hai.stanford.edu/news/ai-trial-legal-models-hallucinate-1-out-6-or-more-benchmarking-queries) **confirmado**. Protégé: não verificado [a confirmar] |
| **vLex Vincent** (agora Clio) | Pesquisa em linguagem natural em 50 estados dos EUA e 17 jurisdições; tem site em português para o Brasil | Retirou-se do benchmark de pesquisa da Vals antes da publicação | Não encontrado | Clio: ARR > US$ 500 mi em mai/2026 | Clio comprou a vLex por US$ 1 bi (anunciado 30/6/2025); Clio série G US$ 500 mi a US$ 5 bi (nov/2025) | [Clio](https://www.clio.com/uk/about/press/clio-signs-definitive-agreement-to-acquire-vlex/), [Bloomberg Law](https://news.bloomberglaw.com/tech-and-telecom-law/clio-raises-500m-in-series-g-funding-round-at-5b-valuation); ARR: secundária |
| **Spellbook** | Revisão e redação de contratos dentro do Word | Não detalhado | Não encontrado | Não encontrado | Série B US$ 50 mi a US$ 350 mi pós-dinheiro (Khosla, out/2025); dívida de US$ 40 mi com RBCx (mar/2026) | **Secundária**: [Unite.AI](https://www.unite.ai/spellbook-raises-50-million-series-b-to-expand-ai-contract-review-platform/) |
| **Luminance** (Reino Unido) | Análise e revisão de contratos, due diligence | Não detalhado | Não encontrado | Não encontrado | Série C US$ 75 mi (fev/2025, Point72); avaliação não divulgada | **Secundária**: [Law360](https://law360.com/pulse/amp/articles/2296443) |
| **OpenAI Astra for Law** (novo) | Modelo GPT-6 Astra com ferramentas e plugins jurídicos (26); "Legal Search Index" com 230+ milhões de páginas de fontes dos EUA; integração com Word; Harvey e Legora podem construir sobre ele | Na Legal Research Bench da Vals: 54% de acerto contra 38,7% do modelo com busca web comum. A própria documentação manda conferir respostas e fontes | Acesso restrito a escritórios selecionados nos EUA (Trusted Access) | Lançado em 17/9/2026 | n/a | **Secundária**: [Times Brasil/CNBC](https://timesbrasil.com.br/empresas-e-negocios/tecnologia-e-inovacao/openai-lanca-astra-for-law-nova-ia-para-profissionais-do-direito/) (lida) |

### 1.2 Brasil

| Produto | O que faz | Citações e verificação | Preço (individual) | Escala / clientes | Investimento e avaliação | Status e fonte |
| --- | --- | --- | --- | --- | --- | --- |
| **Jusbrasil · Jus IA** (+ **MinutaIA**) | Pesquisa jurídica com IA sobre a base do Jusbrasil; MinutaIA redige documentos jurídicos complexos. Jus IA lançado em mar/2025 sobre modelo desenvolvido com a Maritaca AI [a confirmar] | O marketing diz "confronta a resposta com as fontes antes de enviar" (doc. 05 e Plano do Assistente). Estudo do próprio Jusbrasil (arXiv, 48 profissionais) diz que o JusIA superou ChatGPT Free, ChatGPT Pro e Gemini: **fonte interessada** | **R$ 78,90** (30 mensagens, 10 uploads), **R$ 108,90** (150 mensagens), **R$ 208,90** (ilimitado); 1º mês R$ 1,90; até 33% de desconto no anual (conferido pelo Locus.IA em 15/10/2026). Há notícias de IA incluída em todos os planos e de preços de R$ 130 a R$ 149: **conflito** [a confirmar] | Jusbrasil + MinutaIA: "ARR próximo de R$ 1 bi, 85% de produtos AI-first", 3 milhões de assinantes por ano, +3 trilhões de tokens por mês; MinutaIA: +50 mil clientes pagantes e 180 instituições (números da empresa) | Fase "série D", com Warburg Pincus (nov/2024); Crunchbase: US$ 128 mi em cinco rodadas; avaliação não divulgada | [Startups, 27/8/2026](https://startups.com.br/negocios/ma/jusbrasil-compra-minutaia-e-mira-r-1b-em-receita-anual-recorrente/) (lida), [Startups, 14/11/2024](https://startups.com.br/negocios/legaltech/exclusivo-jusbrasil-atrai-warburg-pincus-e-amplia-foco-no-b2b/) (lida), [Locus.IA](https://ialocus.com.br/blog/post-ia-juridica-preco) (lida, concorrente), [arXiv 2510.18108](https://arxiv.org/abs/2510.18108) (lido). **Secundária** |
| **Turivius · GPTuri** | Pesquisa de jurisprudência, jurimetria; assistente que entrega pareceres, análises de risco, resumos | Não detalhado | Sob consulta (demonstração) | "+500 empresas" (site da empresa) | Seed de R$ 5 mi (mai/2022, ABSeed, Domo, ACE, Allievo); BoostLab BTG com possibilidade de até R$ 1,5 mi (site da empresa) | [Baguete](https://www.baguete.com.br/noticias/turivius-recebe-aporte-de-r-5-milhoes), [Turivius](https://turivius.com/portal/turiviusnamidia/). **Secundária**; dados de 2022, sem rodada recente encontrada |
| **Astrea (Aurum) · Jux** | Agente de IA para pesquisar jurisprudência e redigir peças. Também classifica andamentos, trata publicações e traduz "juridiquês" para o cliente. Peças contempladas (a partir de 27/10/2026): petição inicial cível, reclamação trabalhista, contestação, réplica e especificação de provas | Pesquisa só em **base própria de julgados coletados dos tribunais**; "trava anti-alucinação"; diz que o Jux pode errar e exige conferir tribunal, número e identificação do julgamento. **Não abrange matéria criminal**; contratos não incluídos; só na versão web | Jux é **adicional** ao plano (Light, Up, Smart, Company, VIP); preço do adicional não informado [a confirmar] | Não informado | Não encontrado | [Aurum, 5/11/2026](https://www.aurum.com.br/blog/?p=37629) (lida; **conteúdo do fabricante**) |
| **Enter** (ex-Talisman) | Agente de IA que analisa o motivo do processo (consumerista e trabalhista), o que ocorreu, e entrega **defesa formal** para protocolar; foco em empresas e contencioso de massa | Humanos revisam e assinam, segundo a empresa; a OAB/SP contesta | Contrato corporativo | 45 marcas (Nubank, C6, SulAmérica, BMG, Agibank, Vivo, Light); +300 mil casos por ano | Série B de **US$ 100 mi** (6/5/2026; Founders Fund, Sequoia, Ribbit, Kaszek, OneVC); avaliação **R$ 1,2 bi** (um site a chama de "primeiro unicórnio de IA da América Latina": **conflito** com R$ 1,2 bi [a confirmar]) | [Baguete](https://www.baguete.com.br/noticias/enter-recebe-aporte-de-us-100-milhoes) (lida). **Secundária** |
| **Jurídico AI** | Redação e análise de documentos | Não detalhado | **R$ 55,90** (anual, parcelado) e plano gratuito com 10 usos | Não encontrado | Não encontrado | [Locus.IA](https://ialocus.com.br/blog/post-ia-juridica-preco). **Secundária, concorrente** |
| **Locus.IA** | Análise e redação; versão offline (modelo no hardware do cliente) | Não detalhado | R$ 149,90 (50 análises), R$ 249,90 (100), R$ 499,90, R$ 699,90, R$ 1.099,90 (offline) | Não encontrado | Não encontrado | Mesma página (o autor é o fundador, autopreço) |
| **Judit** | Consulta e monitoramento de processos, com créditos de IA | n/a | R$ 39,90, R$ 89,90, R$ 249,90 | Não encontrado | Não encontrado | Mesma página. Categoria diferente |
| **Projuris, Legal One (Thomson Reuters), eLaw, Juridoc** | **Não encontrei anúncio de IA de 2026** em buscas dedicadas. O Projuris aparece no índice de tecnologia da Stanford CodeX como software jurídico com chatbot | n/a | n/a | n/a | n/a | **[a confirmar]**: precisa de busca dirigida nos sites e na imprensa de cada empresa |

**Leituras do quadro**

- O **piso brasileiro** (R$ 55 a R$ 110) é o de um produto de conversa com franquia de mensagens; o **teto individual** (R$ 209 a R$ 250) é o do Jus IA Premium e do Locus Pro. Lá fora a ordem de grandeza é muito maior (CoCounsel e Harvey cobram centenas ou milhares de dólares por usuário), e o preço brasileiro é uma fração disso [conversão a confirmar].
- As ferramentas **se dividem em três tipos de tarefa** com riscos diferentes: (a) pesquisa e resumo, (b) minuta de peça ou contrato, (c) agente que **faz o trabalho** (Enter). O tipo (c) é o que a OAB está litigando.
- **Quase ninguém publica avaliação.** O Stanford já dizia em 2024 que as ferramentas "não dão acesso sistemático, publicam poucos detalhes e não reportam resultados de avaliação" ([HAI](https://hai.stanford.edu/news/ai-trial-legal-models-hallucinate-1-out-6-or-more-benchmarking-queries)). Hoje o relatório Vals de 2025 ainda ficou sem os três maiores. Um **benchmark público em português com gabarito de advogados é espaço livre**.

---

## 2. O que funciona e o que falha

### 2.1 Evidências quantitativas

| Estudo | Resultado | Leitura para nós | Fonte |
| --- | --- | --- | --- |
| **Stanford RegLab e HAI, "Hallucination-Free?"** (30/5/2024; JELS 2025) | +200 consultas pré-registradas (pesquisa geral, específicas de jurisdição e tempo, premissa falsa, recordação de fatos). Lexis+ AI e Ask Practical Law AI: > 17% incorretas ou mal fundamentadas; Westlaw AI-Assisted Research: > 34% (HAI) / "17% a 33%" (resumo do artigo). Chatbots gerais, em estudo anterior: 58% a 82% de alucinação em consultas jurídicas. As ferramentas jurídicas reduzem o erro em relação ao GPT-4, mas "alucinações jurídicas não foram resolvidas" | O RAG ajuda e **não basta**. Distinguir **incorreta** de **mal fundamentada** é a métrica certa para a nossa "citação correta". Dos três mecanismos de falha, dois são **diretamente atacados pela nossa cascata** (autoridade inaplicável por jurisdição e tempo; bajulação) | [HAI](https://hai.stanford.edu/news/ai-trial-legal-models-hallucinate-1-out-6-or-more-benchmarking-queries) e [arXiv 2405.20362](https://arxiv.org/abs/2405.20362), **lidos**. Discordância dos fornecedores: [LawNext](https://www.lawnext.com/2024/05/stanford-will-augment-its-study-finding-that-ai-legal-research-tools-hallucinate-in-17-of-queries-as-some-raise-questions-about-the-results/) (resultado de busca) |
| **Vals AI, VLAIR - pesquisa jurídica** (14/10/2025) | 200 questões dos EUA; Alexi, Counsel Stack, Midpage e ChatGPT contra grupo de advogados. Nota ponderada: IA 74% a 78%, advogados 69%. Acerto: produtos jurídicos 78% a 81%, ChatGPT 80%, advogados 71% (LawNext). **"Fontes e citações são o diferencial"** (não a precisão). Pior em levantamentos de 50 estados. Quando faltava fonte, o ChatGPT dizia que não achava a decisão e **respondia mesmo assim** com o conhecimento do modelo (recebeu crédito parcial). Thomson Reuters, LexisNexis e vLex **não participaram** | O diferencial vendável é **citação e autoridade**, o nosso ponto forte. Mostra também o vício que a nossa regra R-M3 proíbe (completar com conhecimento do modelo depois de "não achei") | [Vals](https://www.vals.ai/industry-reports/vlair-10-14-25) (lido), [LawNext](https://www.lawnext.com/2025/10/vals-ais-latest-benchmark-finds-legal-and-general-ai-now-outperform-lawyers-in-legal-research-accuracy.html) (lido) |
| **Vals, VLAIR fev/2025** | Harvey, CoCounsel, Vincent e Oliver em extração, perguntas e respostas sobre documentos, resumo, redline, cronologia | Mostra que tarefas de **documento** são mais maduras que pesquisa | Descrição no LawNext (acima) |
| **Vals Legal Research Bench** (2026) | OpenAI diz 54% no Astra for Law (38,7% com busca web comum). Agregador reporta teto de ~55% entre 85 modelos (out/2026) | A pesquisa jurídica "de verdade" ainda é difícil para qualquer modelo; **meta realista** para nós deve vir de benchmark próprio, não do marketing | [Times Brasil](https://timesbrasil.com.br/empresas-e-negocios/tecnologia-e-inovacao/openai-lanca-astra-for-law-nova-ia-para-profissionais-do-direito/) (lida), [BenchLM](https://benchlm.ai/benchmarks/legalresearchbench) (agregador; **secundária**) |
| **LegalBench** | 162 tarefas colaborativas, 6 tipos de raciocínio, 20 modelos testados (NeurIPS 2023) | Bom para raciocínio, em inglês e direito dos EUA; não mede citação nem vigência [parte inferência; a confirmar] | [NeurIPS](https://proceedings.neurips.cc/paper_files/paper/2023/hash/89e44582fd28ddfea1ea4dcb0ebbf4b0-Abstract.html) |
| **OAB-Bench** (Pires, Malaquias Junior, Nogueira, 2025) | 105 questões discursivas de 7 áreas, provas recentes do Exame de Ordem, com guias de correção. Claude-3.5 Sonnet: 7,93 de 10, aprovado nas 21 provas; modelos de ponta (o1) como juízes automáticos correlacionam bem com notas humanas | Prova que **juiz automático calibrado por gabarito humano** é viável (mesma ideia do nosso doc. 07, 9.1), mas Exame de Ordem é conteúdo público (risco de contaminação) e não mede pesquisa com data do fato [inferência] | [arXiv 2504.21202](https://arxiv.org/abs/2504.21202) (lido) |
| **LegalScore** (2025) | Índice de 14 modelos em provas objetivas de carreiras jurídicas do Brasil; conclui que falta dado brasileiro e que modelos locais e menores vão bem | Existe espaço para modelo e dado brasileiro | [arXiv 2502.08652](https://arxiv.org/abs/2502.08652) (lido) |
| **LegalBench.PT** | Direito **português** (Portugal), não brasileiro | Não usar como referência de Brasil | [arXiv 2502.16357](https://arxiv.org/abs/2502.16357) (lido) |
| **Estudo do Jusbrasil** | JusIA superou modelos gerais, avaliação por 48 profissionais | **Fonte interessada**; útil só como protocolo (teoria jurídica + avaliação humana) | [arXiv 2510.18108](https://arxiv.org/abs/2510.18108) (lido) |

### 2.2 Casos de sanção por citação inexistente

**Exterior e panorama.** O banco de Damien Charlotin (acesso em 8/11/2026) lista **2.266 decisões** em que o tribunal tratou de conteúdo alucinado, por país: EUA 1.535, Canadá 241, Austrália 112, Reino Unido 90, Israel 58, **Brasil 41**; por papel: advogados 898, juízes 33, peritos 17. O próprio banco avisa que é um piso, não o universo ([banco](https://www.damiencharlotin.com/hallucinations/), **lido, confirmado**). Reportagens de junho/2026 falavam em 1.545 e 1.116 dos EUA, ou seja, o número cresce rápido (secundária: [The Star](https://www.thestar.com.my/tech/tech-news/2026/06/15/courts-cracking-down-on-error-strewn-ai-assisted-legal-briefs)). O caso fundador é *Mata v. Avianca* (SDNY, decisão de 22/6/2023): advogados sancionados por citar decisões inventadas pelo ChatGPT e por **manter** as citações após ordem judicial ([Justia](https://law.justia.com/cases/federal/district-courts/new-york/nysdce/1:2022cv01461/575368/54); o valor da multa **[a confirmar]**). No Reino Unido, *Ayinde v. Haringey* ([2025] EWHC 1040 (Admin)) tratou de citações falsas e custos desperdiçados; o alcance do alerta da corte **[a confirmar no acórdão]** ([Bristows](https://inquisitiveminds.bristows.com/post/102kaam/fake-authorities-cited-by-counsel-in-the-high-courtai-suspected)).

**Brasil** (todos **[secundária]**: vieram de notícias e resumos de busca; **não conferi nos sites dos tribunais**, e a numeração dos processos e as datas exatas precisam ser verificadas antes de citar):

| Tribunal | O que consta | Fonte |
| --- | --- | --- |
| TJPR, 9ª Câmara Cível | Multa por litigância de má-fé a advogado que usou IA "sem zelo e cautela"; apuração pela OAB/PR | [Lex](https://www.lex.com.br/tjpr-multa-advogado-por-litigancia-de-ma-fe-pelo-uso-de-ia-sem-zelo-e-cautela/) (403 ao abrir; só resumo de busca) |
| TJSC | Multa ao agravante por jurisprudência e doutrina inexistentes; o advogado admitiu uso do ChatGPT; OAB comunicada | [TJSC](https://www.tjsc.jus.br/web/imprensa/-/tjsc-multa-autor-de-recurso-por-jurisprudencia-falsa-gerada-por-ia) (bloqueado; só resumo de busca) |
| TSE (ministro Antonio Carlos Ferreira) | Multa de 5 salários mínimos por julgados inexistentes criados com IA em agravo (ação sobre fraude à cota de gênero, Campo Alegre de Lourdes/BA); litigância de má-fé; ofício à OAB/BA | [Migalhas](https://www.migalhas.com.br/quentes/443562/tse-multa-advogado-por-usar-julgados-inexistentes-criados-com-ia) (**lida**; data da notícia: provavelmente nov/2025 [a confirmar]) |
| 2ª Vara Federal de Londrina | Duas multas de 10 salários mínimos ao advogado (ato atentatório à dignidade da Justiça e má-fé) | [Lex](https://www.lex.com.br/juiz-federal-aplica-multas-a-advogado-por-uso-indevido-de-ia-e-litigancia-de-ma-fe/) (resumo de busca) |
| TST, 6ª Turma | Multa de 1% do valor da causa à empresa e ao advogado; "possível uso de IA não afasta a responsabilidade da parte" | [COAD](https://www.coad.com.br/home/noticias-detalhe/136359/empresa-e-advogado-sao-condenados-por-possivel-uso-de-ia-com-citacoes-falsas-de-jurisprudencia) (resumo de busca) |
| TRT-MT, 1ª Turma | Multa antes aplicada à cliente passa ao advogado (natureza punitiva); pedido de apuração à OAB | [Lex](https://www.lex.com.br/trt-mt-multa-advogado-por-uso-de-precedentes-falsos-e-solicita-apuracao-na-oab/) (resumo de busca) |
| TRT-2, 6ª Turma | Empresa condenada; falha atribuída a estagiários do escritório | [Migalhas](https://www.migalhas.com.br/quentes/449977/advogado-de-parte-condenada-por-ma-fe-culpa-estagiarios-por-uso-de-ia) (resumo de busca) |
| Questão em aberto | OAB/TO foi ao CNJ após magistrado falar em **multa solidária** ao advogado por citação fictícia | Manchete na página do [Migalhas](https://www.migalhas.com.br/quentes/458194/oab-lanca-plano-nacional-para-orientar-uso-de-ia-na-advocacia) (lida só a manchete) [a confirmar] |

**Padrão:** multa por má-fé (CPC arts. 77, 80 e 81, ver 3.1), ofício à OAB e, aos poucos, responsabilização **pessoal** do advogado em vez da parte. O argumento "foi o estagiário" ou "foi a IA" não funciona, e a Recomendação 001/2024 já previa a supervisão do sócio (item 3.6).

### 2.3 O que reduz risco (e o que não reduz)

| Medida | Evidência | Limite |
| --- | --- | --- |
| **RAG com base fechada** | Reduz erro frente a modelo geral (Stanford) | Não zera: a recuperação falha, a autoridade recuperada pode ser inaplicável, e a resposta pode estar mal fundamentada |
| **Verificação de citação** (existe? é o texto? sustenta a afirmação?) | Stanford separa "incorreta" de "mal fundamentada"; Vals põe **autoridade** como 40% da nota; Astrea e Jusbrasil dizem fazer "trava" ou confronto | Conferir a **existência** é a parte fácil; o difícil é conferir se **sustenta a tese**, se está **vigente** e se é de órgão **competente para vincular** |
| **Filtro por vigência, jurisdição e hierarquia** | O exemplo Dobbs do Stanford (norma tida como vigente que foi superada) | Em direito brasileiro precisa modelar o estado do precedente (ver 4.2) |
| **Abstenção** | Vals: o vício dos modelos é dizer "não achei" e responder mesmo assim | Precisa ser medida nos dois sentidos (inventar e recusar sem necessidade), como já prevê o doc. 07, 9.1 |
| **Teste de premissa falsa** | Stanford: sistemas "geralmente" lidaram bem, mas houve concordância com premissa errada (Ginsburg em *Obergefell*) | Incluir no benchmark |
| **Fluxo de especialista para tarefas amplas** (50 estados) | Vals: prompt simples vai mal; fluxo especialista melhora | Para nós, "levantamento nacional de divergência" é tarefa própria, não pergunta livre |
| **Revisão humana** | Exigida pela OAB (3.7) e pelos tribunais | Se o advogado tem de conferir tudo, o ganho some (argumento do Stanford, citando o caso do escritório Paul Weiss); logo, o produto deve **reduzir o custo de conferência** (link para o trecho exato, marcação do que é tese) |

---

## 3. Regras éticas e normativas no Brasil

### 3.1 O que está vigente e o que está em elaboração

| Norma | Estado e data | O que diz de relevante | Fonte |
| --- | --- | --- | --- |
| **Recomendação 001/2024 do CFOAB** | Aprovada por unanimidade em 11/11/2024. É **recomendação**: o relator disse que sanção "é matéria de reserva legal" | 1.1 conformidade com Estatuto, Código de Ética e Disciplina, LGPD, CPC e propriedade intelectual. **2.2** diligência na escolha do fornecedor para proteger informações, adotar segurança e **possibilitar a não utilização dos dados para treinamento**. 2.3 atenção ao compartilhamento de dados. 2.4 chatbots não praticam atos privativos e devem se identificar como máquina. **3.1** julgamento profissional não pode ser feito por IA **sem supervisão humana**, e nenhuma atividade privativa é delegada. **3.2** atenção ao levantamento de jurisprudência e cumprimento do **art. 77 do CPC** (veracidade). 3.3 dependência excessiva é "inconsistente com a prática da advocacia". 3.6 sócios devem supervisionar associados, estagiários e assistentes, com política de uso, treinamento e monitoramento. **3.7** revisar integralmente as saídas antes de apresentar em juízo e não confiar só na IA. 4.1.1 e 4.2.1 **formalizar por escrito ao cliente** antes do uso, com propósito, benefícios e limites, riscos, medidas de segurança e possibilidade de revisão humana. **4.3.1** consentimento informado explícito, assinado; 4.3.2 o cliente pode recusar; 4.3.3 guardar o documento; 4.3.4 obrigatório em qualquer fase (peças, pesquisa, análise de documentos). 5.1 revisão periódica | [PDF oficial](https://s.oab.org.br/arquivos/2024/11/80a03f8d-e4cb-4bac-a3ea-357009f77d3f.pdf) **lido na íntegra [confirmado]**; [notícia OAB](https://www.oab.org.br/noticia/62711/confira-versao-final-da-recomendacao-do-cfoab-sobre-o-uso-de-ia-na-pratica-juridica) |
| **Plano Nacional de Integração da IA na Advocacia (OAB)** | Lançado em 15/6/2026, Conselho Pleno, João Pessoa | Código de Boas Práticas (a fazer), câmaras técnicas nas seccionais, cursos nas ESAs, cartilhas; cinco eixos (governança, capacitação, modernização, prerrogativas, inclusão tecnológica); a Ordem acompanhará regulação com foco em sigilo, privacidade, autonomia da advocacia e acesso à Justiça; prevê parcerias para acesso a ferramentas por advogados pequenos | [Migalhas](https://www.migalhas.com.br/quentes/458194/oab-lanca-plano-nacional-para-orientar-uso-de-ia-na-advocacia) **lida [secundária]** |
| **Provimento do CFOAB sobre IA** | **Em elaboração.** Reunião OAB-CNJ em 6/5/2026 definiu "novo provimento", pesquisa nacional e campanha; grupo coordenado pela corregedora nacional Christina Cordeiro. Não encontrei texto publicado | Dará seguimento à Recomendação 1/2024 | [OAB](https://www.oab.org.br/noticia/64156/oab-nacional-e-cnj-definem-agenda-conjunta-para-regulamentacao-e-uso-etico-da-inteligencia-artificial-no-judiciario) **lida [confirmado]**; publicação [a confirmar] |
| **Resolução CFOAB 16/26** | Publicada em 13/10/2026 | Critérios para **TACs com empresas que desenvolvem ou comercializam IA jurídica**: IA como ferramenta de apoio, com independência técnica, supervisão e responsabilidade do advogado; **a natureza do serviço prevalece sobre o nome comercial**; proibição de captação indevida de clientela, mercantilização e participação irregular de terceiros em honorários; sigilo, segurança e LGPD; **empresas não podem sugerir que as ferramentas substituem advogados ou têm aprovação da OAB**; supervisão adequada de funções automatizadas, inclusive as que detectam litigância abusiva; assinar TAC não significa certificação | [Migalhas](https://www.migalhas.com.br/quentes/466579/oab-edita-regras-para-tacs-com-empresas-que-comercializam-ia-juridica) **lida [secundária; íntegra da resolução não aberta]** |
| **Ação civil pública OAB/SP contra a Enter** | Ajuizada em 7/10/2026 (4ª Vara Cível Federal de SP); OAB/RJ admitida como litisconsorte; OAB/RO aprovou ação semelhante; liminar deferida em 21/10 (segundo busca) | A tese: o modelo "analisa processos, recomenda estratégias e produz minutas em larga escala" sem participação efetiva de advogado; pede supervisão humana auditável, proteção de dados, e R$ 1 mi de dano moral coletivo. A Enter diz que revisão, assinatura e decisão continuam com advogados | [OAB/SP](https://www.oabsp.org.br/noticia/26-10-07-1742-oab-sp-aciona-justica-contra-empresa-de-ia-para-estabelecer-limites-a-automacao-e-proteger-atividades-privativas-da-advocacia) (resultado de busca), [Migalhas](https://www.migalhas.com.br/quentes/466579/oab-edita-regras-para-tacs-com-empresas-que-comercializam-ia-juridica) (lida). Liminar e valores: **[secundária; a confirmar nos autos]** |
| **Estatuto da Advocacia (Lei 8.906/1994)** | Vigente | Art. 1º: atividades privativas (postulação a órgãos do Judiciário; consultoria, assessoria e direção jurídicas); art. 34, VII: violar sigilo é infração disciplinar; art. 7º, II: inviolabilidade do escritório e dos arquivos [conhecimento próprio; confirmar numeração no texto; o ialocus cita art. 34, VII] | Texto no Planalto (não aberto nesta sessão) |
| **Código de Ética e Disciplina (Res. 02/2015)** | Vigente | Sigilo profissional (por volta dos arts. 35 a 38) e publicidade (por volta dos arts. 39 a 47), com a numeração **[a confirmar]** | Não aberto |
| **Provimento 205/2021 (publicidade e marketing jurídico)** | Vigente; reportagem diz que o CFOAB está em fase final de atualização **[a confirmar]** | Publicidade informativa e sóbria; captação de clientela e mercantilização vedadas; segundo artigo secundário, o anexo admite chatbots no site para dúvidas iniciais | [Jus.com.br](https://jus.com.br/artigos/104832/marketing-juridico-e-o-provimento-205-2021-da-oab) (resumo de busca; **texto oficial não lido**) |
| **CPC** | Vigente | Art. 77 (deveres de verdade e lealdade), arts. 80 e 81 (má-fé; multa entre 1% e 10% do valor corrigido da causa), art. 489 §1º, VI (decisão que não segue precedente invocado sem distinguir ou superar), art. 927 (precedentes que os juízes observarão) [conhecimento próprio; a confirmar nos textos] | Planalto (bloqueado) |
| **Seccionais** | OAB/AC regulou IA ainda em 2023; o TED da OAB/SP definiu diretrizes éticas em maio/2026 | Orientações sem caráter nacional vinculante [a confirmar] | [OAB/SP](https://www.oabsp.org.br/jornaldaadvocacia/26-05-22-1437-ted-da-oab-sao-paulo-define-diretrizes-eticas-para-o-uso-de-inteligencia-artificial-na-advocacia) (título de busca) |

### 3.2 Judiciário, LGPD e marco legal

**Resolução CNJ 615/2025** (11/3/2025; DJe 14/3/2025; vigência 120 dias após a publicação; **alterada pela Resolução 674, de 25/3/2026**) ([texto compilado, CNJ](https://atos.cnj.jus.br/atos/detalhar/6001), **lido [confirmado]**). Revogou a Resolução 332/2020. É norma **para o Judiciário**, não para o advogado, mas importa a nós por três motivos: (i) é o vocabulário regulatório brasileiro de IA jurídica; (ii) vale se vendermos a tribunais, MP ou Defensorias; (iii) dá à OAB acesso a relatórios de auditoria (arts. 5º §3º e 12, VIII).

- **Vedado** (art. 10): solução sem possibilidade de revisão humana ou que gere "dependência absoluta"; solução que valore traços de personalidade para prever crimes ou reiteração; classificar pessoas por comportamento para avaliar "plausibilidade de seus direitos"; e uso preditivo ou estatístico para fundamentar decisões **trabalhistas a partir de perfis pessoais**.
- **Alto risco** (Anexo, AR1 a AR5): perfilamento; valoração de provas; tipificação penal; **AR4: "formulação de juízos conclusivos sobre a aplicação da norma jurídica ou precedentes a um conjunto determinado de fatos concretos"**; biometria. **Baixo risco** (BR1 a BR8): extração e classificação, sumarização, detecção de precedentes qualificados, jurimetria como subsídio, **textos de apoio** à decisão com supervisão do magistrado, transcrição, anonimização.
- **Uso de LLM externo por magistrados** (art. 19 §3º): capacitação, caráter auxiliar, fornecedor **proibido de usar dados dos usuários para treinamento**; **vedado** usar LLM privado/externo com documentos sigilosos ou em segredo de justiça, salvo anonimização na origem ou mecanismos técnicos; vedado para finalidades de alto risco.
- **Contratação por tribunais** (art. 20): privacy by design e by default, "possibilidade de não armazenamento ou eliminação do histórico de perguntas e prompts", **documentação e referências bibliográficas atualizadas** do sistema, auditoria externa ou relatórios de segurança; **vedado treinar com dados sigilosos** sem anonimização na origem.

A distinção AR4 (conclusão sobre os fatos: alto risco) versus BR4 (texto de apoio com supervisão: baixo) é um bom guia de **produto**: o nosso motor deve **apresentar tese, divergência e fundamento**, deixar a conclusão ao humano e registrar isso.

**LGPD** (Lei 13.709/2018) [conhecimento próprio; confirmar nos artigos]. Autos têm dados pessoais comuns e **sensíveis** (saúde, filiação, orientação), e a publicidade processual convive com a minimização; um desembargador citado pelo TJRJ descreve a tensão e processos com crianças como "risco máximo" ([TJRJ](https://www.tjrj.jus.br/web/guest/noticias/noticia/-/visualizar-conteudo/5111210/406542998), resultado de busca). Pontos para o fornecedor: base legal e finalidade, **transferência internacional** (art. 33) quando o modelo de terceiros está fora do Brasil, segurança, responsabilidade solidária de operador, e direito à **revisão de decisões automatizadas** (art. 20). O papel do advogado (controlador ou operador) ao usar IA com autos **não encontrei orientação específica da ANPD [a confirmar]**; a ANPD publicou um "Radar Tecnológico" sobre IA generativa, e IA é um dos eixos prioritários de 2026-2027 (secundária: [Legismap](https://legismap.com.br/conteudos/artigos-e-noticias/ia-generativa-e-tema-do-3-volume-da-serie-radar-tecnologico-da-anpd)).

**PL 2338/2023 (marco legal da IA).** Aprovado pelo Senado em 10/12/2024; na Câmara, comissão especial (presidente Luisa Canziani, relator Aguinaldo Ribeiro). Em agosto/2026 o relator disse que a votação ficaria para o fim do ano, depois das eleições ([MobileTime](https://www.mobiletime.com.br/noticias/24/08/2026/marco-ia-voto-fim-do-ano/), resultado de busca). **Não achei votação em plenário até 8/11/2026 [a confirmar na página da Câmara]**. O texto do Senado, segundo imprensa, lista a **administração da justiça** entre usos de **alto risco**, exige **avaliação de impacto algorítmico**, documentação e registro das operações, responsabilidade do fornecedor/operador por sistemas de alto risco independentemente de dolo ou culpa em certos casos, e multas de até R$ 50 milhões ([Brasil de Fato](https://www.brasildefato.com.br/2024/12/10/senado-aprova-pl-da-inteligencia-artificial), resultado de busca, **secundária**). Direitos autorais é o gargalo da Câmara. **Inferência a confirmar no texto:** ferramenta usada por advogado privado provavelmente **não** é "administração da justiça" em sentido estrito, mas ferramentas vendidas a tribunais e órgãos de justiça sim; as obrigações gerais (transparência, governança, explicabilidade, direitos dos afetados) devem valer para todos.

### 3.3 Sigilo: o que um fornecedor precisa garantir

Base: Recomendação 001/2024 (itens 2.1 a 2.5, 3.4, 4.2.1), Resolução 16/26, e, por comparação, o parecer da ABA 512 (EUA, 29/7/2024: **consentimento informado** antes de inserir dados do cliente em ferramenta que "aprende"; cláusula genérica de contrato não basta; [resumo](https://thebarexaminer.ncbex.org/article/fall-2024/generative-artificial-intelligence-tools/), **secundária**) e o art. 20 da CNJ 615 como padrão de contratação pública.

| Requisito do fornecedor | Origem | Nosso estado |
| --- | --- | --- |
| **Sem treinamento** com dados do cliente, por contrato e por arquitetura (inclusive no provedor do LLM) | Rec. 2.2; CNJ 615 art. 19 §3º, III; ABA 512 | **Conflito**: o doc. 07, 9.2, decide "não há opt-in do escritório" para o benchmark global (anonimizado). **Para o pacote jurídico vale o oposto: nenhum dado de caso vai ao benchmark ou ao cache global sem consentimento explícito do advogado e, se houver, do cliente** |
| Retenção mínima e opção de **não guardar histórico de prompts** | CNJ 615 art. 20, IX | A verificar no desenho de log (07 guarda log de afirmações removidas; separar log técnico de conteúdo) |
| Lista de **suboperadores** e do **provedor do modelo**; local de processamento; transferência internacional | LGPD art. 33; Rec. 2.3 | A definir (pesquisa 02 trata do fornecedor de LLM) |
| **Isolamento por escritório e por caso** (acesso por equipe, trilha de auditoria) | Rec. 3.6; segredo de justiça | Isolamento por inquilino existe (07, 9.2); falta granularidade por caso e por sigilo |
| Segurança (criptografia, certificações) e notificação de incidentes | Rec. 2.2; LGPD; CNJ art. 20, VII | Genérico [a confirmar] |
| Anonimização assistida antes de enviar ao modelo, com aviso quando houver segredo de justiça | CNJ 615 art. 19 §3º, IV (por analogia) | Não existe |
| Apoio ao **termo de ciência do cliente** (modelo gerado pelo sistema, com os itens do 4.2.1 e registro de aceite arquivado) | Rec. 4.1.1 a 4.3.4 | Existe "ciência simples" na plataforma (doc. 08, 5.5) que pode ser reaproveitada |
| Não afirmar que **substitui advogado** nem que tem **aval da OAB** | Res. 16/26 | Regra de comunicação e contrato |
| Chatbot diz que é máquina | Rec. 2.4 | Já alinhado com "rodapé pelo Consultor" (07) |

### 3.4 Quadro de riscos e cobertura do nosso desenho

Legenda: **Coberto** = já previsto no doc. 07 e no Plano do Assistente; **Parcial** = existe a ideia, mas não para o direito; **Falta** = não previsto.

| Risco | Regra ou evidência | O que o desenho já cobre | Lacuna | Ação sugerida |
| --- | --- | --- | --- | --- |
| Citação inexistente | CPC 77; sanções; Rec. 3.2 e 3.7 | **Coberto**: verificação da citação contra o texto (etapa 8, seção 7), regra R-M2; marcas `[t-…]` sem correspondência são removidas | A etapa 8 hoje confere contra o texto de **dispositivos**; para decisões é preciso ter o **texto integral** e os metadados oficiais (tribunal, número, data, órgão) na base, o que depende do acesso às fontes (4.2, última linha) | Conferir existência e conteúdo contra o acórdão integral e metadados oficiais |
| Citação existe mas **não sustenta** | Stanford ("mal fundamentada"); Vals (autoridade 40%) | **Parcial**: etapa 8 rotula `sim`, `parcial`, `não` por afirmação | Para jurisprudência o "texto citado" tem de ser a **tese**, não a ementa (4.2) | Separar campos ementa, tese, fatos, dispositivo, votos; checar sobre a tese |
| Norma revogada ou **lei errada pela data do fato** | Stanford (Dobbs); direito intertemporal | **Parcial/Coberto** em lei: filtro de vigência por `data_de_referencia` | Falta a distinção entre data do fato, do ato e do julgamento | Três datas na chamada (4.1) |
| Precedente superado, afetado ou com modulação | CPC 927; STF | **Falta** | Estado do precedente e hierarquia | Modelo de "estado" (4.2) |
| Divergência entre tribunais | Stanford (divisões de circuito) | **Parcial**: a resposta já traz "divergências" (07, 3.1, etapa 7) | Para direito é o **centro** da tarefa | Abstenção ou apresentação das duas posições com órgão, data e força vinculante |
| Bajulação (premissa falsa) | Stanford | **Falta** | Teste e regra de contradição | Casos de premissa falsa no benchmark; instrução explícita |
| Sigilo e treinamento | Rec. 2.2; CNJ; ABA | **Parcial**: isolamento por inquilino e "sem dado de cliente" no cache global | **Conflito** com 9.2 (sem opt-in) | Reescrever 9.2 para o pacote jurídico (3.3) |
| Consentimento do cliente | Rec. 4.1 a 4.3 | **Falta** | Fluxo de termo e registro | Módulo de termo de ciência (doc. 08, 5.5) |
| Supervisão, responsabilidade, assinatura | Rec. 3.1, 3.6, 3.7; CNJ BR4; Res. 16/26 | **Coberto**: aprovação humana ("revisar / enviar; envio é humano"), rascunho, segunda opinião | Falta **registro de quem revisou o quê** (trilha por peça) e tela que torne **impossível** protocolar sem revisão | Peça só sai de "rascunho" com revisão assinada do advogado; protocolo nunca automático |
| **Atividade privativa / exercício ilegal** | Estatuto art. 1º; Rec. 3.1; Res. 16/26; caso Enter | **Parcial**: o doc. 04 da pesquisa já cita o risco | Quem usa (advogado inscrito) e o que o sistema entrega (apoio, não parecer ao leigo) | Venda só a advogados inscritos (validar OAB), vedar modo "cliente final" jurídico, texto de apoio |
| Publicidade e captação | Provimento 205; Rec. 2.4; Res. 16/26 | **Falta** | Marketing que sugira substituição do advogado ou aprovação da OAB | Checklist de comunicação; revisão por advogado do material comercial |
| **Prazos errados** (falha clássica) | [inferência] | **Coberto em princípio**: cálculo determinístico com tabelas versionadas (M3, 07) | Calendários forenses por tribunal e comarca, suspensões, regra de intimação | Tratar prazos como M3 com fonte e teste de gabarito (4.3) |
| Perfilamento de juízes e partes (jurimetria) | CNJ 615 art. 10 (Judiciário); LGPD | **Falta** | Decisão de produto | Jurimetria só agregada por órgão e tese; sem perfil de pessoa natural [recomendação; verificar a legalidade para advogado, não só Judiciário] |
| LGPD e transferência internacional | LGPD 33 | **Parcial** | Ver 3.3 | DPA, residência de dados, suboperadores |
| Marco legal da IA | PL 2338 | **Falta** (em tramitação) | Classificação de risco e avaliação de impacto | Acompanhar; desenhar documentação de modelo e avaliação de impacto que serviriam em qualquer versão |
| Venda ao setor público | CNJ 615 | **Falta** | Sinapses, auditoria, relatórios | Fora do primeiro ciclo |

---

## 4. O diferencial de um motor jurídico nosso e o que muda

### 4.1 O que já é diferencial e por quê

A cascata do doc. 07 (seção 3.1) faz: entendimento e árvore de temas, cache, **filtro de vigência** (esfera, UF, município, `data_de_referencia`), busca BM25 mais multivetorial, grafo de normas, reranker, resposta com divergências e grau de segurança, **verificação da citação** e **abstenção**. Comparando com o que o Stanford diz que falha (recuperação, autoridade inaplicável por jurisdição e tempo, bajulação) e com o que a Vals diz que diferencia (fontes e citações), o nosso conjunto ataca justamente o ponto que os concorrentes **declaram** mas não **mostram**. O que podemos oferecer e eles não oferecem (até onde achei): **cartão de citação com "considerei a data X", `trecho_id` conferido, abstenção com "pesquisei A, B, C" e benchmark publicado**.

### 4.2 O que precisa mudar para o direito

| Tema | No tributário hoje | No direito, mudar para |
| --- | --- | --- |
| **Datas** | Uma `data_de_referencia` | **Três datas**: **fato** (a lei material aplicável, com retroatividade penal benéfica e direito intertemporal), **ato processual** (lei processual de aplicação imediata, prazos) e **julgamento ou consulta** (jurisprudência e precedentes vigentes). A ferramenta pede ou infere as três e mostra qual usou |
| **Hierarquia de normas** | Federal, estadual, municipal; remissões | CF; tratados; leis complementares e ordinárias; decretos; atos normativos; **competência federativa**; em trabalhista, **acordos e convenções coletivas** por categoria e base territorial, com vigência própria; regimentos internos |
| **Jurisprudência e precedentes** | Decisões entram como nó do grafo (07, etapa 5) | **Precedentes têm estado**: vigente, superado, afetado a tema repetitivo, suspensão nacional, com modulação de efeitos, embargos pendentes, trânsito. Camadas de força: **controle concentrado do STF** (ADI, ADC, ADPF), **súmula vinculante**, repercussão geral (Tema e tese), IRDR e IAC, recursos repetitivos (STJ e TST), súmulas e OJs, acórdãos isolados, decisões monocráticas. Regra: **o que vincula na data do julgamento** (CPC 927) [conhecimento próprio; a confirmar] |
| **Controle de constitucionalidade** | Não modelado | Norma vigente pode ser declarada inconstitucional, ter interpretação conforme, modulação ou suspensão pelo Senado; **inconstitucionalidade com eficácia vinculante** muda a resposta sem mudar o texto da lei. Guardar o vínculo "norma, decisão que a afeta, efeito, data" |
| **Tese vs. ementa** | A unidade é o dispositivo (artigo) | A unidade é a **tese e seus fatos**. A ementa resume e pode induzir erro; o precedente vincula pela *ratio*. Extrair e guardar: tese fixada (quando há), fatos relevantes, órgão, relator, vencidos, e o trecho do voto. Verificação: a tese citada **está no texto**, e os **fatos são comparáveis**; ementa nunca é prova sozinha |
| **Divergência entre tribunais** | "Divergências" na resposta | Mapa por **órgão** (turma, seção, plenário; TJ, TRT, TRF) e por **data**, marcando: posição vinculante, majoritária local, minoritária, **pendente de uniformização**. Se não há tese vinculante e há divergência, **apresentar as posições e abster-se de escolher**; escolher é decisão do advogado |
| **Prazo** | Calendário de obrigações | Prazos processuais em **dias úteis** conforme o rito, calendário do tribunal e da comarca, recesso e feriados locais, regra de início da contagem pela intimação; tudo como **tabela versionada** com fonte e teste, não como texto de modelo |
| **Autos** | Cliente e documentos do escritório (M2) | Leitura de autos longos, cronologia, extração de partes e pedidos; **segredo de justiça** como atributo que muda o tratamento (3.3) |
| **Abstenção** | "Não encontrei base legal" | Ampliar: "**base existe, mas há divergência sem tese vinculante**", "**precedente pendente de julgamento**", "**fato fora do que a base cobre**". Mostrar o que foi pesquisado |
| **Dados de origem** | Planalto, LexML, portais fiscais | Tribunais **bloqueiam coleta automática** (a nossa pesquisa 04 já registra; nesta sessão TJSC, Planalto e vários sites bloquearam o `curl`); jurisprudência tem questões de **licença e de segredo de justiça**; esse é o **maior risco de execução** do pacote jurídico [inferência; verificar com a pesquisa J-fontes] |

### 4.3 Tipos de tarefa e como ficam no desenho

| Tarefa | Motor | Risco | Como tratar |
| --- | --- | --- | --- |
| **Pesquisa** (legislação, jurisprudência, divergência) | M1 Legal | Citação mal fundamentada | Cartão com tese, estado do precedente, órgão, data; abstenção quando divergente |
| **Parecer** | M1 + M3 + rascunho | Conclusão sem base | Estrutura fixa: fatos, questão, normas, precedentes, divergência, conclusão **proposta** e grau de segurança; o advogado assina |
| **Peça** (petição, contestação, recurso) | M1 + rascunho | Fato inventado, tese errada, tipo não coberto | Só tipos cobertos; fatos **só dos autos** (campo de origem); seção de fundamentos com citação conferida; bloqueio de protocolo sem revisão |
| **Revisão de contrato** | M2 + M1 | Cláusula omitida | Ferramenta de checagem contra lista de riscos; menos dependente de jurisprudência |
| **Prazos** | M3 | Erro grave e silencioso | Determinístico, com fonte e teste; alerta e dupla conferência |
| **Classificação de andamentos e extração** | M2 | Baixo (humano revisa) | Já praticado por Astrea; CNJ 615 BR1 trata como baixo risco |
| **Jurimetria** | M2 + dados agregados | Perfilamento, viés | Só agregada por órgão e tese; sem perfil de pessoa [recomendação] |

### 4.4 Como medir: benchmark jurídico com gabarito de advogados

O doc. 07 (seção 9.1) já tem seis tipos de caso, modelo-juiz calibrado contra revisão humana e métricas de conclusão, citação, abstenção, número, origem e rota. Para o jurídico, sugestão:

1. **Conjuntos por área** (trabalhista, cível e consumidor, família e sucessões, penal, previdenciário), cada um com casos de: pergunta de pesquisa; **data do fato diferente de hoje**; **divergência real entre tribunais**; **precedente superado**; **premissa falsa**; **pergunta que deve gerar abstenção**; **prazo** (cálculo); **peça** (comparação com minuta de advogado); **revisão de contrato**.
2. **Gabarito por advogados da área**, em duplo cego, com terceiro advogado para desempate e medida de concordância; guias de correção como os do OAB-Bench (que publica guias, referências e execução).
3. **Grupo-controle de advogados** respondendo às mesmas questões (a Vals obteve 69% a 71% para advogados). Sem controle humano o número é mais difícil de vender.
4. **Métricas de citação em camadas** (cada uma falha de forma diferente): (a) existe, (b) é do órgão e da data indicados, (c) **vigente e não superada na data relevante**, (d) **hierarquia correta** (não cita monocrática como vinculante), (e) **sustenta a tese** (e não só a ementa), (f) fatos comparáveis. Mais: **abstenção correta** nos dois sentidos, **divergência reconhecida**, **premissa falsa recusada**, **prazo exato**.
5. **Conjunto reservado e renovado**, sem passar por ajuste de prompt; evitar usar só o Exame de Ordem (conteúdo público e de contaminação provável) e **não** usar casos de clientes (3.3).
6. **Tamanho:** o doc. 07 prevê 200 casos legais. Cálculo próprio: com 200 casos, o intervalo de 95% para uma taxa de acerto de 80% é de ±5,5 pontos; com 100 casos, ±7,8. Para comparar dois sistemas é preciso **mais** ou usar os **mesmos casos** nos dois (pareado). Sugestão: ≥ 150 a 200 por área antes de prometer número publicamente.
7. **Comparação aberta**: rodar os mesmos casos contra Jus IA, um modelo geral e o nosso, e **publicar o método**. O Stanford pede "benchmarking público e avaliações rigorosas" e a Vals mostra que as maiores marcas evitam participar. Comparar com produto terceiro exige cuidado com os termos de uso de cada um [a confirmar].
8. **Aprovação por contador ou advogado "do grupo"** (07, 9.2) para jurídico vira **advogado revisor remunerado**; custo e recrutamento **[a confirmar]** (não pesquisei o valor da hora).

---

## 5. Modelo de venda

### 5.1 O que o mercado cobra (resumo)

| Faixa | Produto | Preço | Fonte |
| --- | --- | --- | --- |
| Entrada | Judit (monitoramento com IA) | R$ 39,90 a R$ 249,90 | Locus.IA, 30/9/2026 |
| Entrada | Jurídico AI | R$ 55,90 (grátis com limites) | Locus.IA |
| Individual | **Jus IA** | R$ 78,90 / 108,90 / 208,90, por franquia de mensagens | Locus.IA, 15/10/2026 |
| Individual | Locus.IA | R$ 149,90 a R$ 699,90, por número de análises | Locus.IA |
| Equipe | Turivius (GPTuri) | sob consulta | Locus.IA, Turivius |
| Equipe | Astrea + Jux | adicional ao plano; preço não encontrado | Aurum |
| Corporativo | Enter, Harvey, CoCounsel | contrato; Harvey (estimativa) ~US$ 1.200 por assento por mês com mínimo; CoCounsel US$ 104 a 784 | agregadores |

Observações: (1) o mercado brasileiro cobra **por franquia** (mensagens, uploads, análises), e isso é parecido com a nossa **unidade de uso (UU)**; (2) **o ERP/jurídico entrega IA como adicional** (Astrea), não como produto separado; (3) a faixa de R$ 79 a R$ 250 do doc. 05 (pesquisa de preço) está confirmada para o advogado individual; (4) o Essencial de teste (R$ 79) **iguala** o Jus IA Essencial em preço; o Operação (R$ 189) fica logo abaixo do Premium do Jus IA (R$ 208,90); o Intensivo (R$ 299) fica acima de todo o preço individual brasileiro conhecido, exceto o Locus Elite e o offline, e muito abaixo de Harvey e CoCounsel.

### 5.2 Como se compara aos planos de IA que desenhamos

Os planos de teste vêm do Estudo de Precificação (6.8): **IA Essencial R$ 79; IA Operação R$ 189; IA Intensivo R$ 299, por usuário por mês**, com limite por janela de 5 horas e por semana em UU (Essencial 25 UU e 100 UU; Operação 60 e 300; Intensivo 100 e 500), custo no teto de R$ 37,9 / 113,8 / 189,6 e custo no uso provável de R$ 20 / 54 / 80. Pontos para o jurídico:

- **O consumo por tarefa jurídica é maior** que o da pergunta contábil. O doc. 07 estima ~20 mil tokens por pergunta com o Consultor (seção 8, exemplo 4) e 45 a 60 mil por parecer curto; **autos de centenas de páginas** e peças longas são muito maiores [inferência; medir]. A margem do Essencial pode sumir com um usuário que carrega autos. O mercado resolve isso com **franquia por uploads e análises** (Jus IA: 10 uploads no Essencial).
- Por isso, no jurídico a unidade de cobrança visível deveria ser **"análise de documento / peça / parecer"**, com UU por trás.
- **Módulo de área** é o encaixe natural: o custo fixo é de **curadoria da base**, atualização, benchmark e revisão por advogados; o custo variável é o mesmo das UU.

### 5.3 Módulos vendáveis por área

| Módulo | Atrativo | Riscos | Observações |
| --- | --- | --- | --- |
| **Trabalhista** | Volume grande de advogados e de contencioso (Enter atua em consumerista e trabalhista de massa, o que mostra mercado, mas também concorrência no lado empresa); base normativa bem delimitada (CLT, súmulas e OJs do TST, temas repetitivos, **convenções coletivas com vigência**); **cálculos determinísticos** (verbas rescisórias, horas extras, liquidação), que casam com o M3; sinergia com a plataforma contábil (DP, folha) | A CNJ 615 veda ao **Judiciário** uso preditivo trabalhista por perfil pessoal (sinal de sensibilidade); o Astrea Jux já cobre reclamação trabalhista e contestação | **Melhor primeiro candidato** [recomendação; a validar] |
| **Cível e consumidor** | Maior volume | Muito disputado (Jusbrasil, Enter, Astrea) | Entrar só com diferencial claro de citação conferida |
| **Família e sucessões** | Nicho com normas estáveis (CC, CPC), muitos advogados autônomos; cálculos de partilha e alimentos; **menos servido** [inferência; não pesquisei concorrentes por área] | Dados muito sensíveis, segredo de justiça em família; consentimento do cliente mais delicado | Bom segundo módulo, com anonimização assistida |
| **Penal** | Necessidade real; o Astrea **exclui** matéria criminal do Jux (o motivo não foi dado) | Maior risco: dados sensíveis, CNJ trata tipificação penal e "reiteração delitiva" como vedação ou alto risco (para o Judiciário), segredo de justiça, liberdade em jogo | Último; só com revisão reforçada e abstenção mais agressiva |
| **Previdenciário** [hipótese] | Alto volume de advogados e cálculos (tempo de contribuição) | Não pesquisado | Candidato futuro |
| **Tributário** (advocacia) | Já temos base | Mercado de editoras e IA fiscal | É a ponte para o produto atual |

**Hipótese de preço, a testar** (não é dado de mercado): módulo de área como complemento por usuário na faixa de **R$ 40 a R$ 90 por mês**, com Essencial + 1 módulo próximo de R$ 120 a R$ 170 (entre o Jus IA Essencial e o Premium) e Operação + módulos abaixo de R$ 300. Justificativa: ficar **dentro** da faixa em que o mercado já cobra do advogado individual, e vender **verificabilidade e data do fato**, não "ter IA" (a síntese da pesquisa 05). Alternativa: preço por escritório com assentos incluídos. Teste com 10 a 20 escritórios antes de fixar.

**Como não vender:** não prometer "sem alucinação" (o Stanford desmontou promessa semelhante de editora); não sugerir aval da OAB nem substituição do advogado (Res. 16/26); não oferecer a leigo e ao contador "parecer jurídico" (atividade privativa); não vender a tribunais antes de cumprir a CNJ 615. **Contador** pode usar módulo **informativo** (fiscal e trabalhista da rotina), mas a linha com atividade privativa precisa de parecer jurídico próprio [a confirmar com advogado].

---

## 6. Recomendações

### 6.1 Para o motor jurídico

1. **Aproveitar a cascata e reabrir três pontos de desenho:** (a) três datas em `legal.consultar`; (b) unidade "**tese + fatos**" além do dispositivo, com estado do precedente; (c) abstenção por **divergência sem tese vinculante**.
2. **Modelar a hierarquia e a força vinculante** como dados, não como texto: tabela `norma/precedente → força → órgão → vigência → estado → relação com outras decisões`. A verificação da citação passa a checar **estado e força**, não só existência.
3. **Verificar a citação em camadas** (4.4, item 4) e **mostrar ao advogado o trecho exato**, para que a conferência dele seja barata (o argumento do Stanford sobre custo de verificar).
4. **Prazos e cálculos** como M3 desde o início, com fonte e teste de gabarito; calendário forense por tribunal e comarca.
5. **Sigilo por desenho**: nenhum dado de caso em treinamento, cache global ou benchmark sem consentimento; opção de não guardar prompts; anonimização assistida; termo de ciência do cliente (Rec. 4.2.1) gerado pelo sistema. **Reescrever 9.2 do doc. 07 para o pacote jurídico.**
6. **Supervisão e trilha**: rascunho → revisão assinada do advogado → só então exportar; protocolo **nunca** automático; registro de quem revisou. Isso é o que separa o produto do caso Enter na leitura da OAB.
7. **Escopo de produto**: vender só a advogados inscritos; texto de apoio, não "conclusão"; sem perfilamento de juízes e partes; jurimetria só agregada.
8. **Fontes**: iniciar um **inventário de fontes e licenças** (legislação, jurisprudência por tribunal, BNP/CNJ, doutrina) antes de prometer cobertura; verificar bloqueios e termos (frente de fontes jurídicas).
9. **Comunicação**: checklist da Res. 16/26 e do Provimento 205 para site e vendas.

### 6.2 Para o benchmark

1. Construir **por área**, com ≥ 150 a 200 casos cada, categorias do item 4.4 e **conjunto reservado**.
2. **Gabarito de advogados** em duplo cego e **grupo-controle** de advogados respondendo.
3. **Métricas de citação em camadas** e de **abstenção nos dois sentidos**; relatório por área e por tipo de tarefa, nunca um número único.
4. **Juiz automático calibrado** por revisão humana (como o OAB-Bench), mas com **auditoria humana por amostra** em todo ciclo.
5. **Publicar método e resultados** (com intervalo de confiança) e rodar **os mesmos casos** em concorrentes quando os termos permitirem.
6. Meta de partida: **nenhuma citação inexistente** e **nenhuma citação de norma ou precedente superado apresentada como vigente** (zero tolerância, como o doc. 07 já exige 100% com citação conferida ou abstenção); metas de conclusão por área só depois do primeiro ciclo medido.

### 6.3 Lacunas desta pesquisa e próximos passos

- Textos oficiais não lidos: Estatuto, Código de Ética e Disciplina, Provimento 205/2021, CPC, LGPD, íntegra da Resolução CFOAB 16/26, PL 2338 (texto da Câmara).
- Não cobertos: Projuris, Legal One, eLaw, Juridoc (IA), Lexis Protégé, preços do Jux, Turivius e Astra for Law fora dos EUA.
- Conferir nos tribunais as decisões brasileiras de sanção e o desfecho da liminar da OAB/SP contra a Enter.
- Confirmar se o provimento do CFOAB sobre IA foi publicado, e a situação do PL 2338 na Câmara.
- Parecer de advogado de ética profissional sobre: modo de venda a contadores, termo de ciência do cliente, e jurimetria agregada.

---

## 7. Fontes (acesso em 8/11/2026)

**Documentos internos:** `docs/subplanos/07-Motores-e-Consultor.md` (3.1, 7, 9.1, 9.2, 8); `docs/Plano_Assistente_de_IA_para_Contadores.md` (itens de abstenção e preço); `docs/Estudo_de_Precificacao_por_Modulo.md` (6.8); `pesquisa/05-mercado-preco.md` (2.1, 2.2); `pesquisa/04-juridico-tributario-dados.md`.

**Primárias lidas**
- Recomendação 001/2024 do CFOAB, PDF: https://s.oab.org.br/arquivos/2024/11/80a03f8d-e4cb-4bac-a3ea-357009f77d3f.pdf e notícia https://www.oab.org.br/noticia/62711/confira-versao-final-da-recomendacao-do-cfoab-sobre-o-uso-de-ia-na-pratica-juridica
- OAB e CNJ, agenda conjunta (7/5/2026): https://www.oab.org.br/noticia/64156/oab-nacional-e-cnj-definem-agenda-conjunta-para-regulamentacao-e-uso-etico-da-inteligencia-artificial-no-judiciario
- Resolução CNJ 615/2025 (compilada, com a Res. 674/2026): https://atos.cnj.jus.br/atos/detalhar/6001
- Stanford HAI: https://hai.stanford.edu/news/ai-trial-legal-models-hallucinate-1-out-6-or-more-benchmarking-queries ; artigo: https://arxiv.org/abs/2405.20362
- Vals AI VLAIR (14/10/2025): https://www.vals.ai/industry-reports/vlair-10-14-25 ; LawNext: https://www.lawnext.com/2025/10/vals-ais-latest-benchmark-finds-legal-and-general-ai-now-outperform-lawyers-in-legal-research-accuracy.html
- Banco de Charlotin: https://www.damiencharlotin.com/hallucinations/
- Blog da Harvey: https://www.harvey.ai/blog
- OAB-Bench: https://arxiv.org/abs/2504.21202 ; LegalScore: https://arxiv.org/abs/2502.08652 ; LegalBench.PT: https://arxiv.org/abs/2502.16357 ; estudo do Jusbrasil: https://arxiv.org/abs/2510.18108 ; LegalBench: https://proceedings.neurips.cc/paper_files/paper/2023/hash/89e44582fd28ddfea1ea4dcb0ebbf4b0-Abstract.html

**Secundárias lidas**
- Migalhas, Resolução 16/26: https://www.migalhas.com.br/quentes/466579/oab-edita-regras-para-tacs-com-empresas-que-comercializam-ia-juridica
- Migalhas, Plano Nacional (15/6/2026): https://www.migalhas.com.br/quentes/458194/oab-lanca-plano-nacional-para-orientar-uso-de-ia-na-advocacia
- Migalhas, TSE: https://www.migalhas.com.br/quentes/443562/tse-multa-advogado-por-usar-julgados-inexistentes-criados-com-ia
- Startups, Jusbrasil e MinutaIA: https://startups.com.br/negocios/ma/jusbrasil-compra-minutaia-e-mira-r-1b-em-receita-anual-recorrente/ ; Warburg Pincus: https://startups.com.br/negocios/legaltech/exclusivo-jusbrasil-atrai-warburg-pincus-e-amplia-foco-no-b2b/
- Baguete, Enter: https://www.baguete.com.br/noticias/enter-recebe-aporte-de-us-100-milhoes ; Turivius: https://www.baguete.com.br/noticias/turivius-recebe-aporte-de-r-5-milhoes
- Locus.IA, preços (concorrente, conferido em 30/9 e 15/10/2026): https://ialocus.com.br/blog/post-ia-juridica-preco
- Aurum, Jux: https://www.aurum.com.br/blog/?p=37629
- SaasRise, Harvey: https://www.saasrise.com/deals/harvey-raises-550m-in-funding-round-valuation-reaches-155b-fdaacbc6-e5ae-49f1-a9e7-224789dfde95
- Times Brasil/CNBC, Astra for Law: https://timesbrasil.com.br/empresas-e-negocios/tecnologia-e-inovacao/openai-lanca-astra-for-law-nova-ia-para-profissionais-do-direito/

**Apenas resultados de busca (não abertos ou bloqueados; tratar como indício)**
- Legora: https://sifted.eu/articles/legora-funding-round-series-e-legal-tech/ ; https://startups.com.br/negocios/inteligencia-artificial/sueca-legora-prepara-nova-rodada-e-mira-valuation-de-us-10b/
- Clio e vLex: https://www.clio.com/uk/about/press/clio-signs-definitive-agreement-to-acquire-vlex/ ; https://news.bloomberglaw.com/tech-and-telecom-law/clio-raises-500m-in-series-g-funding-round-at-5b-valuation
- Spellbook: https://www.unite.ai/spellbook-raises-50-million-series-b-to-expand-ai-contract-review-platform/ ; Luminance: https://law360.com/pulse/amp/articles/2296443
- CoCounsel: https://costbench.com/software/ai-legal-tools/cocounsel ; https://www.haqq.ai/blog/cocounsel-review-alternatives.html ; Harvey (preço): https://www.cloudzero.com/blog/harvey-ai-pricing ; https://www.vaquill.ai/blog/harvey-ai-review-honest-assessment-2026
- OAB/SP contra a Enter: https://www.oabsp.org.br/noticia/26-10-07-1742-oab-sp-aciona-justica-contra-empresa-de-ia-para-estabelecer-limites-a-automacao-e-proteger-atividades-privativas-da-advocacia
- Decisões brasileiras: https://www.lex.com.br/tjpr-multa-advogado-por-litigancia-de-ma-fe-pelo-uso-de-ia-sem-zelo-e-cautela/ ; https://www.tjsc.jus.br/web/imprensa/-/tjsc-multa-autor-de-recurso-por-jurisprudencia-falsa-gerada-por-ia ; https://www.lex.com.br/juiz-federal-aplica-multas-a-advogado-por-uso-indevido-de-ia-e-litigancia-de-ma-fe/ ; https://www.coad.com.br/home/noticias-detalhe/136359/empresa-e-advogado-sao-condenados-por-possivel-uso-de-ia-com-citacoes-falsas-de-jurisprudencia ; https://www.lex.com.br/trt-mt-multa-advogado-por-uso-de-precedentes-falsos-e-solicita-apuracao-na-oab/ ; https://www.migalhas.com.br/quentes/449977/advogado-de-parte-condenada-por-ma-fe-culpa-estagiarios-por-uso-de-ia
- Mata v. Avianca: https://law.justia.com/cases/federal/district-courts/new-york/nysdce/1:2022cv01461/575368/54 ; Ayinde: https://inquisitiveminds.bristows.com/post/102kaam/fake-authorities-cited-by-counsel-in-the-high-courtai-suspected
- PL 2338: https://www.congressonacional.leg.br/web/atividade/materias/-/materia/157233 ; https://www.mobiletime.com.br/noticias/24/08/2026/marco-ia-voto-fim-do-ano/ ; https://www.brasildefato.com.br/2024/12/10/senado-aprova-pl-da-inteligencia-artificial
- ABA 512: https://thebarexaminer.ncbex.org/article/fall-2024/generative-artificial-intelligence-tools/
- Provimento 205/2021: https://jus.com.br/artigos/104832/marketing-juridico-e-o-provimento-205-2021-da-oab
- ANPD, Radar Tecnológico: https://legismap.com.br/conteudos/artigos-e-noticias/ia-generativa-e-tema-do-3-volume-da-serie-radar-tecnologico-da-anpd ; TJRJ: https://www.tjrj.jus.br/web/guest/noticias/noticia/-/visualizar-conteudo/5111210/406542998
- Vals Legal Research Bench (agregador): https://benchlm.ai/benchmarks/legalresearchbench

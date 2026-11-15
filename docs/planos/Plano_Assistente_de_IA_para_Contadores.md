# Plano: Assistente de IA para Contadores

5 de novembro de 2026

Este documento descreve o produto e a arquitetura técnica. O plano de execução (cronograma de 6 meses, orçamento, aporte, preços e infraestrutura) está no [Plano de desenvolvimento (6 meses) e lançamento](Plano_MVP_6_meses.md), e a construção da base legal, no [Plano de Ingestão da Base Legal](Plano_de_Ingestao_da_Base_Legal.md).

## Visão do produto

Um consultor de IA que responde, com precisão e citação da base legal, qualquer pergunta tributária, contábil, trabalhista ou societária de um contador brasileiro, para qualquer regime e qualquer data. Ele melhora sozinho a cada ciclo, sem que a lei precise morar nos pesos do modelo.

**O que ele é:**

- Um especialista de perguntas e respostas que pesquisa como um contador sênior: lê a lei, a regulamentação, a interpretação oficial e a jurisprudência.
- Capaz de responder pela regra vigente na data do fato gerador, inclusive para períodos passados.
- Capaz de ir buscar em fontes oficiais o que ainda não está na sua base.

**O que ele não é:** um sistema de rotina contábil. Escrituração, emissão de guias e entrega de obrigações acessórias já são resolvidas pelos ERPs e sistemas contábeis existentes. O nicho aqui é o tempo que o contador gasta pesquisando e interpretando.

**Princípio central:** o conhecimento fica numa base versionada e auditável; o modelo de linguagem só raciocina sobre ela; e o desenho do agente evolui por experimento (DGM), medido contra respostas validadas por contadores.

**Escopo da base no lançamento:** legislação federal completa, mais as leis estaduais e municipais de SP, MG, PR, SC e RS (municípios: as capitais e aqueles onde os escritórios do grupo têm clientes; os demais por demanda), e as fontes trabalhistas e societárias: convenções coletivas, Juntas Comerciais e manuais oficiais. Outros estados são expansão futura, se houver demanda.

## Visão agêntica

O produto é agêntico por padrão: um time de agentes trabalhando para o contador, não só um chat.

| Agente | O que faz |
| --- | --- |
| Vigia da lei | Cruza cada norma nova com a atividade, o regime e a UF de cada cliente e avisa o que mudou para quem |
| Prazos | Avisa antes de vencer |
| Rascunhos | Prepara respostas e cálculos para o contador revisar e assinar |
| Coletores | Buscam as fontes oficiais, dia e noite (Plano de Ingestão, seção 5.5) |

**Agente próprio.** Os agentes rodam num agente de código aberto, hospedado e controlado por nós, na nossa GPU (no desenvolvimento e no início, no servidor e na GPU alugados). Não dependemos de agentes de terceiros hospedados por outros: a pesquisa 03, seção 4, documenta falhas críticas, instâncias expostas e login nas contas do usuário nesse tipo de ferramenta.

**Travas, como engenharia:**

- permissão por ação: cada ferramenta é liberada à parte;
- aprovação humana para ações sensíveis: certificado digital, e-CAC, envio a cliente;
- ambiente isolado: o agente só alcança o que a tarefa precisa, sem segredos repassados;
- registro de tudo no painel; texto vindo da web é tratado como dado, nunca como instrução.

O escopo e o prazo de cada agente depois do lançamento são definidos com os playtesters, a partir das tarefas que eles querem delegar.

## Arquitetura geral

O sistema tem quatro camadas: a base legal guarda a verdade, o agente responde sobre ela, a busca ao vivo alimenta a base e a melhoria contínua evolui o agente fora da produção.

```
                 Contador faz a pergunta
                          ▲ │
          resposta com    │ ▼
          citação legal
        ┌──────────────────────────────────┐
  ┌─────│  Camada 2 · Agente de resposta   │◄────┐
  │     │  entende, roteia, pesquisa,      │     │
  │     │  verifica e responde             │     │
  │     └──────────────────────────────────┘     │
  │      consulta na data    quando a base       │
  │      do fato  │          não tem │           │
  │               ▼                  ▼           │
  │  ┌───────────────────┐   ┌──────────────────┐│
  │  │ Camada 1 · Base   │◄──│ Camada 3 · Busca ││
  │  │ legal temporal    │ingestão ao vivo (MCP) ││
  │  │ (fonte da verdade)│   │ Planalto, RFB,   ││
  │  └───────────────────┘   │ DOU, CARF, Sefaz ││
  │                          └──────────────────┘│
  │ respostas                       nova versão  │
  │ avaliadas                       aprovada     │
  ▼                                              │
┌────────────────────────────────────────────────┴┐
│ Camada 4 · Melhoria contínua, fora da produção  │
│ Feedback → Benchmark → DGM → Revisão humana     │
└─────────────────────────────────────────────────┘
```

O contador só conversa com o agente. As respostas avaliadas descem para o ciclo de melhoria, e só uma versão aprovada por revisão humana volta para produção.

## Camada 1: Base de conhecimento legal temporal

A base é a fonte da verdade: cada dispositivo legal guarda todas as suas redações com as datas de vigência, e o agente sempre busca a redação válida na data do fato. É isso que permite responder perguntas sobre regras atuais e revogadas.

**Unidade de armazenamento: o dispositivo, não o bloco de tokens.**

- Cada artigo, parágrafo, inciso e alínea é um nó com identificador estável (padrão URN do LexML).
- Cada nó tem uma lista de redações com publicação, início e fim de vigência e a norma que causou a mudança.
- Uma consulta sempre carrega uma data de referência; sem data, usa-se a data atual e o agente avisa.

**Grafo de relações entre normas:**

| Relação | Exemplo |
| --- | --- |
| altera / revoga | Lei nova muda a redação de um artigo |
| regulamenta | Decreto ou IN detalha a lei |
| interpreta | Solução de Consulta COSIT, parecer de Sefaz |
| julga / suspende | Acórdão do CARF, decisão do STF em ADI |
| remete a | "observado o disposto no art. X da Lei Y" |

**Hierarquia de fontes** (o agente pondera nesta ordem e aponta divergências): Constituição → leis complementares → leis ordinárias → decretos → instruções normativas e atos infralegais → soluções de consulta → jurisprudência administrativa e judicial → normas contábeis do CFC (NBC TG / CPC).

**Corpus:** legislação federal (Planalto), normas da RFB, LC 123/2006 e resoluções do CGSN, CLT e legislação previdenciária, legislação societária, NBCs do CFC, convênios e ajustes do CONFAZ, Soluções de Consulta COSIT, ementas do CARF; RICMS e legislação estadual de SP, MG, PR, SC e RS; ISS, IPTU e ITBI das capitais e dos municípios dos clientes do grupo; convenções coletivas das categorias dos clientes, atos das Juntas Comerciais dos 5 estados e manuais oficiais (eSocial, SPED, NF-e).

**Reforma tributária:** a base modela a transição da EC 132/2023 e da LC 214/2025 como regimes paralelos por ano (CBS, IBS e IS convivendo com PIS/Cofins, ICMS e ISS até 2033). Uma pergunta sobre 2027 traz as duas regras e explica qual se aplica a quê.

**Busca:** a cascata descrita em Estratégia de recuperação: BM25 e recuperador multivetorial sobre dispositivos expandidos com perguntas previstas, propagação no grafo de normas e reranker de raciocínio.

**Atualização:** o coletor visita as fontes no horário agendado (órgãos e Juntas diariamente, sindicatos 1 a 2 vezes por semana), detecta mudanças sem IA e só manda o documento novo para a ingestão (Plano de Ingestão, seção 5.5). Cada norma nova passa por um extrator que identifica quais dispositivos ela altera e fecha a vigência da redação anterior.

**Stack sugerida:** Postgres com pgvector e busca textual, tabelas de redações com intervalo de vigência e tabela de arestas para o grafo. Um banco de grafos dedicado só se as consultas de travessia ficarem complexas.

## Camada 2: Agente de resposta

O agente pesquisa em várias etapas, como um contador sênior, e só responde o que consegue fundamentar com o texto recuperado. Isso é RAG agêntico: o modelo decide o que buscar, lê, segue referências e busca de novo.

**Fluxo de uma pergunta:**

1. **Entendimento.** Extrai tema, data do fato, regime tributário, UF, município, atividade (CNAE) e tipo de operação. Se faltar um dado que muda a resposta (por exemplo, a UF numa pergunta de ICMS), pergunta de volta em vez de supor.
2. **Roteamento.** Encaminha a um especialista: fiscal federal, ICMS, ISS, trabalhista e previdenciário, societário, contábil (NBC/CPC) ou reforma tributária. Cada um tem suas instruções e prioridades de fonte.
3. **Pesquisa iterativa.** Executa a cascata de recuperação: os índices acham os dispositivos principais e a propagação no grafo traz remissões, regulamentação, interpretação oficial e jurisprudência em um passo. Uma nova rodada só acontece se a política de busca treinada decidir que faltou algo.
4. **Montagem do contexto.** Com modelos de contexto longo, coloca a norma ou o capítulo inteiro em vez de fragmentos soltos, sempre na redação vigente na data.
5. **Redação.** Resposta direta primeiro, depois o fundamento, com cada afirmação ligada ao dispositivo e à sua vigência. Aponta divergências entre fontes e o grau de segurança.
6. **Verificação.** Uma segunda etapa, idealmente com outro modelo ou outra instrução, confere cada afirmação contra o texto citado. Afirmação sem suporte é removida ou marcada.
7. **Abstenção.** Sem fundamento suficiente, a resposta é "não encontrei base legal para afirmar isso", com o que foi pesquisado. Nunca uma invenção.

**Perfil do cliente opcional:** o contador pode anexar o perfil da empresa (regime, CNAEs, UF, município, atividades com ST) para não repetir o contexto em cada pergunta.

**Cálculos:** quando a pergunta envolver um número (alíquota efetiva do Simples, fator R, multa e juros de mora), o agente chama uma função determinística em código, com tabelas versionadas. O modelo explica o resultado, mas não faz a conta.

## Estratégia de recuperação

O agente nunca percorre a base: cada pergunta passa por uma cascata de sete etapas, das mais baratas às mais caras, e o modelo principal só lê os 5 a 10 trechos que sobram. Cada técnica tem um papel único.

```
Pergunta do contador
        │
1 · Árvore de temas ........ classifica tema, tributo, UF e data
        │
2 · Cache semântico ........ já existe resposta validada e vigente? ──► se acertar: Resposta citada
        │
3 · Filtro de vigência ..... só a partição e a data certas
        │
4a · BM25 (termos exatos)  +  4b · Multivetorial (significado)   ◄─┐
     (sobre dispositivos + perguntas previstas)                     │
        │                                                           │ política treinada (RL):
5 · PageRank no grafo de normas ... remissões e interpretações      │ faltou algo? busca de novo
        │                                                           │
6 · Reranker de raciocínio ......... fica com 5 a 10 trechos        │
        │                                                           │
7 · Modelo principal ............... lê, verifica e responde ───────┘
        │
Resposta citada
```

As etapas 1 a 6 usam índices e modelos pequenos, rápidos e baratos. O modelo grande entra uma vez, no fim. A volta para a etapa 4 é a única possível, e quem decide se ela acontece é uma política treinada para buscar só quando vale a pena.

**O que muda em relação ao RAG comum:**

| Função | RAG comum | Nossa escolha | Por quê |
| --- | --- | --- | --- |
| Busca por significado | Um vetor por trecho | Recuperador multivetorial (ColBERT) | O vetor único tem um limite matemático de expressividade |
| Perguntas hipotéticas | Índice próprio, quando existe | Anexadas a cada dispositivo antes de indexar (doc2query) | Alimentam o BM25 e o multivetorial; um índice a menos |
| Navegação por tema | Mapa de temas e resumos por nível, separados | Uma única árvore de temas com resumos (RAPTOR guiada pela taxonomia contábil) | Uma estrutura faz o trabalho das duas |
| Seguir remissões entre normas | Rodadas sucessivas de busca | PageRank personalizado no grafo de normas (HippoRAG 2) | Vários saltos em um único passo |
| Ordenar candidatos | Reranker comum | Reranker de raciocínio (Rank1) | Raciocina e explica por que cada trecho é relevante |
| Decidir quando buscar de novo | Instrução no prompt | Política treinada por reforço (Search-R1) | Aprende quando parar e evita buscas desnecessárias |
| Ajustar parâmetros da cascata | Manual | DGM | Evolução medida no benchmark |
| Termos exatos | BM25 | BM25 | Nenhuma técnica nova o substitui |
| Respostas repetidas | Cache semântico | Cache semântico, só com normas vigentes | Nenhuma técnica nova o substitui |
| Regra da data do fato | Não tem | Filtro de vigência | Obrigatório para responder pela data |

**Dois laços de aprendizado, sem sobreposição:** o aprendizado por reforço ajusta os pesos de um modelo pequeno, a política de busca. A DGM evolui o código ao redor: a cascata, os limiares, as instruções e a verificação. Os dois são medidos no mesmo benchmark, por acerto por real gasto.

**Experimental, com rede de proteção.** RAPTOR (2024), HippoRAG 2, Rank1 e Search-R1 (2025) e o resultado LIMIT sobre o vetor único (2026) saíram há pouco dos laboratórios. Por isso cada técnica nova entra como experimento, com quatro garantias:

- só entra se vencer no benchmark; se perder, fica desligada por uma chave, e o custo do plano não muda;
- a DGM não mexe na base legal nem nos cálculos;
- nenhuma mudança vai ao ar sem aprovação humana;
- toda resposta continua com a citação conferida, artigo por artigo.

**Experimento separado, fora do núcleo:** recuperação generativa, em que um modelo memoriza a base e gera diretamente o identificador do dispositivo. Vale como teste para legislação estável, nunca como fonte da verdade, porque a base muda toda semana.

**O custo foi deslocado para a ingestão:** perguntas previstas, árvore de temas, grafo e representações multivetoriais são gerados uma vez por dispositivo e refeitos só quando a norma muda.

## Guia das técnicas

Cada técnica da cascata em três pontos: o que faz, uma analogia para quem não é técnico e o papel no nosso sistema, com a fonte original para estudo.

### Filtro de vigência e metadados

- **O que faz:** antes de qualquer busca, separa só os dispositivos da esfera, do tributo e da data certos.
- **Analogia:** ir direto à estante certa da biblioteca, e só à edição do ano em que o fato aconteceu.
- **No sistema:** é o que permite responder pela lei vigente na data do fato. Decisão de projeto, sem artigo de referência.

### BM25 (busca por palavras)

- **O que faz:** encontra documentos pelas palavras exatas da pergunta, dando mais peso a termos raros.
- **Analogia:** o índice remissivo no fim de um livro: palavra → páginas.
- **No sistema:** imbatível para números de lei, NCM, CFOP e siglas. Técnica clássica, sem substituto. No teste LIMIT, citado abaixo, ele se sai bem justamente onde vetores únicos falham.

### Perguntas previstas por dispositivo (doc2query)

- **O que faz:** um modelo prevê as perguntas que cada documento responde e as anexa ao documento antes de indexá-lo. [Fonte: Nogueira et al., 2019](https://arxiv.org/abs/1904.08375)
- **Analogia:** colar em cada artigo da lei um post-it com as perguntas que ele responde.
- **No sistema:** o contador escreve "posso pagar menos se aumentar a folha?" e encontra o artigo do fator R, que não usa essas palavras. As perguntas entram nos índices do BM25 e do multivetorial; não há índice separado.

### Recuperador multivetorial (ColBERT)

- **O que faz:** representa a pergunta e o documento por um conjunto de vetores, um por palavra em contexto, e compara palavra a palavra de forma barata. [Fonte: Khattab e Zaharia, 2020](https://arxiv.org/abs/2004.12832)
- **Analogia:** em vez de resumir cada artigo numa única frase, guardar uma nota para cada termo; na busca, cada termo da pergunta procura sua melhor correspondência.
- **Por que substitui o vetor único:** pesquisadores da Google DeepMind provaram que um vetor único por documento tem um limite matemático de quais combinações de documentos consegue recuperar, ligado ao tamanho do vetor, e que o limite aparece mesmo com perguntas simples. [Fonte: Weller et al., ICLR 2026](https://arxiv.org/abs/2508.21038)
- **No sistema:** busca por significado, ajustada para o português jurídico-contábil.

### Árvore de temas com resumos (RAPTOR)

- **O que faz:** agrupa trechos parecidos, resume cada grupo, agrupa os resumos e repete, formando uma árvore do detalhe ao geral. [Fonte: Sarthi et al., ICLR 2024](https://arxiv.org/abs/2401.18059)
- **Analogia:** o sumário de um livro: capítulo → seção → artigo.
- **No sistema:** a árvore segue a taxonomia contábil (por exemplo, Simples Nacional → anexos → fator R). A pergunta é classificada nela primeiro, e a busca começa no ramo certo.

### Grafo de normas com PageRank personalizado (HippoRAG 2)

- **O que faz:** parte dos conceitos encontrados na pergunta e espalha relevância pela rede de ligações entre documentos, juntando informação de vários documentos em uma única etapa. [Fonte: Gutiérrez et al., 2024](https://arxiv.org/abs/2405.14831) · [HippoRAG 2, 2025](https://arxiv.org/abs/2502.14802)
- **Analogia:** um aviso que se espalha pela rede de normas a partir dos artigos encontrados; o que recebe mais ligações relevantes sobe na lista.
- **No sistema:** substitui as rodadas de "seguir a remissão". A lei, o decreto que a regulamenta, a solução de consulta que a interpreta e o acórdão que a aplica chegam juntos. No artigo original, foi de 10 a 30 vezes mais barato que a busca em rodadas.

### Reranker de raciocínio (Rank1)

- **O que faz:** um modelo que "pensa" antes de decidir se cada trecho candidato é relevante, e deixa esse raciocínio registrado. [Fonte: Weller et al., COLM 2025](https://arxiv.org/abs/2502.18418)
- **Analogia:** um revisor que lê cada candidato e anota por que ele responde ou não à pergunta.
- **No sistema:** reduz os candidatos a 5 a 10 trechos e deixa a justificativa auditável, o que importa num produto que precisa explicar a base legal.

### Política de busca treinada por reforço (Search-R1)

- **O que faz:** um modelo aprende, só por tentativa e recompensa, a decidir quando buscar e o que buscar durante o raciocínio. [Fonte: Jin et al., 2025](https://arxiv.org/abs/2503.09516) · [Search-R1++, 2026](https://arxiv.org/abs/2602.19526)
- **Analogia:** treinar um estagiário com nota pelo resultado: acertou com poucas buscas, nota alta; buscou demais ou errou, nota baixa.
- **No sistema:** decide se vale voltar à etapa 4 ou se já há o suficiente. A recompensa premia o acerto e penaliza cada busca extra. É treinada com o benchmark da Camada 4.

### Cache semântico

- **O que faz:** reconhece que uma pergunta nova é equivalente a outra já respondida e validada.
- **Analogia:** a pasta de pareceres já aprovados do escritório.
- **No sistema:** só devolve a resposta se as normas citadas continuarem vigentes. Decisão de projeto.

### Darwin Gödel Machine (DGM)

- **O que faz:** mantém versões do agente, deixa cada uma propor e testar melhorias no próprio código e guarda as que funcionam. [Fonte: Zhang et al., ICLR 2026](https://arxiv.org/abs/2505.22954)
- **Analogia:** seleção natural aplicada a versões do agente.
- **No sistema:** ajusta a cascata inteira (limiares, quantidade de candidatos, quando usar o cache, as instruções). Não mexe na base legal nem nos cálculos.

### Recuperação generativa (experimento)

- **O que faz:** um modelo memoriza a coleção inteira nos seus parâmetros e, dada a pergunta, escreve diretamente o identificador do documento. [Fonte: Tay et al., 2022](https://arxiv.org/abs/2202.06991)
- **Analogia:** um especialista que decorou a biblioteca e cita de cabeça o número do artigo.
- **No sistema:** fica fora do núcleo. É rápida, mas atualizar a memória a cada norma nova ainda é problema de pesquisa. Vale testar só na legislação estável.

## Camada 3: Busca ao vivo em fontes oficiais

Quando a base não tem a resposta, ou quando a pergunta é sobre algo muito recente, o agente busca diretamente nas fontes oficiais e incorpora o que encontrou à base. Cada fonte vira uma ferramenta exposta via MCP (Model Context Protocol).

| Ferramenta | Fonte | Uso |
| --- | --- | --- |
| Legislação federal | planalto.gov.br, LexML | Texto compilado de leis e decretos |
| Normas da Receita | normas.receita.fazenda.gov.br | INs, atos declaratórios, Soluções de Consulta |
| Diário Oficial | in.gov.br (INLABS) | Normas publicadas hoje |
| Jurisprudência administrativa | CARF | Acórdãos e súmulas |
| Jurisprudência judicial | STF, STJ | Temas repetitivos e repercussão geral |
| Legislação estadual | Sefaz de cada UF, CONFAZ | RICMS, convênios, pareceres |
| Normas contábeis | CFC | NBC TG e interpretações |
| Cadastros | CNPJ, Simples Nacional, CNAE (IBGE) | Contexto da empresa citada |
| Índices | API SGS do Banco Central | Selic, IPCA, IGP-M para correções |
| Busca web restrita | Somente domínios oficiais | Último recurso |

**Fechando o ciclo:** todo documento útil encontrado ao vivo entra na fila de ingestão da Camada 1, com revisão automática ou humana conforme a fonte. A próxima pergunta sobre o tema já encontra o material na base, com vigência registrada.

**Regra de confiança:** uma informação de busca ao vivo é sempre citada com o link e a data da consulta, e marcada como "ainda não validada na base" até passar pela ingestão.

## Camada 4: Melhoria contínua com feedback, benchmark e DGM

O sistema melhora em ciclos: o uso real gera um benchmark validado por contadores, e uma Darwin Gödel Machine evolui o código do agente contra esse benchmark, offline. A lei nunca vai para os pesos do modelo; o que evolui é a forma de pesquisar e responder.

**O que é a DGM.** Um sistema publicado em 2025 (Zhang, Hu, Lu, Lange e Clune; UBC, Vector Institute e Sakana AI; aceito no ICLR 2026). Ele mantém um arquivo de versões de um agente. A cada iteração, escolhe uma versão, que analisa os próprios registros de erro, propõe uma melhoria e reescreve o próprio código. A nova versão só entra no arquivo se funcionar no benchmark. Versões fracas não são descartadas, porque muitas vezes servem de ponte para saltos maiores. Em programação, levou um agente de 20% para 50% no SWE-bench. A continuação, HyperAgents (DGM-H, 2026), mostrou ganhos também fora de programação.

**As quatro engrenagens do ciclo:**

1. **Feedback dos contadores.** Cada resposta tem "correta / incorreta" e um campo de correção. É o ativo mais valioso do produto.
2. **Benchmark versionado.** Correções revisadas pelos contadores do grupo viram casos de teste: pergunta, data de referência, resposta correta e dispositivos que devem ser citados. Quando uma norma citada muda, o caso é marcado para revisão.
3. **Memória de respostas validadas.** As respostas aprovadas também viram uma fonte de recuperação da Camada 1, com validade atrelada às normas que citam.
4. **DGM offline.** Em ciclos (três no desenvolvimento, do M4 ao M6, e periódicos depois do lançamento), a DGM evolui o agente contra o benchmark. A melhor versão passa por revisão humana antes de ir para produção.

**O que a DGM pode mudar no agente:**

- estratégias de reformulação da pergunta e de busca;
- como e até onde seguir remissões entre normas;
- quanto contexto montar e em que ordem;
- instruções de cada especialista e regras de roteamento;
- a etapa de verificação de citações;
- quando consultar fontes ao vivo e quando confiar na base.

**O que ela não muda:** o conteúdo da base legal, os motores de cálculo e as regras de segurança. Esses ficam fora da área editável.

**Métrica de avaliação** (a DGM só melhora no que é medido):

- acerto da conclusão, avaliado por um modelo-juiz calibrado contra revisões humanas;
- precisão das citações (o dispositivo citado existe, estava vigente na data e diz o que se afirma);
- abstenção correta (penaliza tanto inventar quanto dizer "não sei" quando havia resposta);
- custo e tempo por resposta, como restrição.

**Melhorias complementares, fora da DGM:** ajuste fino do recuperador multivetorial e do reranker de raciocínio com pares pergunta → dispositivo correto (maior retorno por real investido) e detecção de lacunas: temas com falha de busca ou feedback negativo viram prioridade de ingestão.

## Riscos e salvaguardas

O maior risco do produto é uma resposta errada dita com confiança; quase todas as salvaguardas existem para impedir isso.

| Risco | Salvaguarda |
| --- | --- |
| Alucinação de artigo ou alíquota | Citação obrigatória, verificação automática contra o texto, abstenção |
| Redação desatualizada | Vigência por dispositivo, data de referência em toda consulta, crawler diário |
| DGM burlando a métrica (o próprio artigo relata isso) | Métrica que pune erro e omissão, auditoria humana de amostras, área editável restrita |
| Benchmark viciado ou desatualizado | Casos versionados por norma, revisão quando a norma muda, conjunto reservado nunca visto pela DGM |
| Custo da evolução | DGM em ciclos offline, avaliação em estágios (poucas perguntas antes do conjunto completo) |
| Código autoeditado inseguro | Execução isolada (sandbox), revisão humana antes de produção, versão anterior pronta para retorno |
| Cobertura estadual e municipal fraca | Os 5 estados e os municípios dos clientes do grupo primeiro, os demais por demanda; avisar explicitamente quando a fonte local não está na base |
| Responsabilidade profissional | Posicionar como assistente; a decisão e a assinatura são do contador com CRC |
| LGPD e sigilo | Perfis de cliente isolados por escritório, registro de acessos, sem uso de dados de clientes no benchmark sem anonimização |
| Agente que age em nome do contador | Permissão por ação, aprovação humana para ações sensíveis, ambiente isolado, registro de tudo; texto da web tratado como dado |

## Mercado brasileiro e nossos diferenciais

Mapeamos 18 assistentes de IA usados por contadores no Brasil, e quase todos seguem a mesma receita: um modelo de linguagem de terceiros sobre o acervo próprio da empresa. Nas fontes públicas consultadas (pesquisa de 4 de novembro de 2026), nenhum descreve resposta pela data do fato, verificação automática de citações em matéria contábil ou melhoria automática medida em benchmark. É aí que estão nossos diferenciais.

### Quem já está no mercado

| Produto (empresa) | Grupo | O que faz, segundo a própria empresa ou a imprensa | Acesso |
| --- | --- | --- | --- |
| [IA da IOB](https://jornalcontabil.com.br/noticia/inteligencia-artificial-chega-aos-escritorios-de-contabilidade/) (IOB) | Editora de conteúdo | Chat sobre legislação que busca respostas em ambiente exclusivo da IOB, com curadoria de especialistas; a IOB declara base de 390 milhões de regras fiscais nas 27 UFs | Assinatura; o IOB Online para 5 usuários com 30 min/mês de consultoria custou [R$ 4.948/ano em contrato público de 2023](https://www2.stm.jus.br/consulta_contrato/index.php/ctrl_busca/visualizar/17351_TERMO_DE_REFERENCIA_PROCESSO_SEI_006548--23-00.124.pdf) |
| [Lion](https://pordentrodeminas.com.br/noticias-corporativas/2025/05/316507-econet-lanca-ia-para-apoiar-profissionais-na-reta-final-do-imposto-de-renda) (Econet Editora) | Editora de conteúdo | IA generativa que responde dúvidas técnicas usando só fontes oficiais e boletins da Econet; lançada com escopo limitado ao IRPF | Só assinantes |
| [Checkpoint](https://www.thomsonreuters.com.br/pt/juridico/checkpoint.html) (Thomson Reuters) | Editora de conteúdo | Portal de legislação, jurisprudência, doutrina e roteiros comentados, atualizado para a reforma. A IA da empresa, o [CoCounsel](https://www.thomsonreuters.com.br/pt/sala-de-imprensa/tr-lanca-cocounsel-core-brasil.html), chegou ao Brasil em 2025 voltada ao jurídico | Assinatura |
| [IA Legislação](https://www.reformatributaria.com/reforma-tributaria-setor-educacao/portal-lanca-ferramenta-de-ia-que-interpreta-a-reforma-tributaria-para-profissionais/) (Portal da Reforma Tributária) | Editora de conteúdo | IA proprietária sobre EC 132/2023, LC 214/2025 e LC 227/2026, com tecnologia Google Cloud e Gemini; mapas mentais e anotações sobre o texto legal | Só assinantes |
| [Domínio IA](https://www.contabeis.com.br/noticias/80116/ia-automatiza-tarefas-e-apoia-analise-contabil/) (Thomson Reuters) | IA dentro do ERP | Integrada ao sistema Domínio; usa o contexto da tarefa do contador e o conhecimento da Thomson Reuters; automatiza mais de 80% do mapeamento do Plano Referencial | Clientes Domínio; apresentado no SYNERGY 2026 |
| [IA Questor](https://monitormercantil.com.br/a-inteligencia-artificial-no-mercado-contabil/) (Questor) | IA dentro do ERP | Treinada com dados internos, notas técnicas e regras do sistema; respondeu mais de 60 mil perguntas em um mês, com 66% avaliadas como úteis | Clientes Questor |
| [GI – Gestora Inteligente](https://makrosystem.com.br/blog/assistente-contabil-com-ia/) (Makro) | IA dentro do ERP | IA nativa do sistema contábil, com bancos relacionais e vetoriais; [incluída sem custo adicional](https://makrosystem.com.br/blog/sistema-contabil-inteligente) | Grátis no plano Makro |
| [Alterdata IA](https://amdjus.com.br/descubra-4-plataformas-contabeis-revolucionarias-com-ia-atuando-no-mercado-brasileiro/) (Alterdata) | IA dentro do ERP | Suporte com base de conhecimento e IA no WhatsApp para atender clientes do escritório | Clientes Alterdata |
| [TAIS](https://tributodevido.com.br/tais/) (Tributo Devido) | Startup tributária | 205 agentes especializados; consulta legislação e teses e gera pareceres; ligada à recuperação de créditos | Teste gratuito |
| [Clara AI](https://contadorai.ai/) (Contador AI) | Startup tributária | Consultoria tributária por IA; afirma atualização diária e precisão acima de 95%, sem metodologia publicada | Planos pagos |
| [EvoBusca.Legal T2](https://segs.com.br/demais/273259-busca-legal-e-mastermaq-automatizam-e-reduzem-tempo-de-operacoes-fiscais/amp) (Busca.Legal) | Startup tributária | Assistente virtual para a tributação correta de operações, com tecnologia IBM Watson | Via parceiros como a Mastermaq |
| [IA da Reforma](https://exame.com/inteligencia-artificial/ia-brasileira-quer-ajudar-empresas-na-adaptacao-a-reforma-tributaria-que-comeca-em-2026/) (V360) | Startup tributária | Responde dúvidas operacionais da reforma; treinada com perguntas reais de analistas fiscais | Grátis (beta) |
| [e-Auditoria](https://www.e-auditoria.com.br/blog/inteligencia-artificial-para-interpretar-resultados/) | Startup tributária | IA para auditar SPED, recuperar créditos e simular a reforma a partir de SPED Fiscal e EFD Contribuições | Assinatura |
| [Fiscoplan Intelligence](https://www.grupofiscoplan.com.br/intelligence/) (Fiscoplan) | Consultoria com plataforma | IA tributária com o contexto da empresa, auditoria contínua e impactos de IBS e CBS | Empresas; 15 dias grátis |
| [ROIT](https://www.baguete.com.br/noticias/roit-fatura-r-80-mi-alta-de-60) | Accountech | IA e robotização para empresas do Lucro Real; calculadora da reforma da renda | Médias e grandes empresas |
| [BotRTC](https://movimentoeconomico.com.br/receita-federal/2026/02/06/receita-lanca-chatbot-com-ia-para-tirar-duvidas-sobre-reforma-tributaria/) (Receita Federal) | Governo | Chatbot sobre a reforma do consumo, lançado em fevereiro de 2026; não orienta casos concretos e avisa que pode ter imprecisões | Grátis, sem cadastro |
| [Jus IA](https://analise.com/noticias/jusbrasil-lanca-ia-que-promete-transformar-o-direito-brasileiro) (Jusbrasil) | Adjacente: jurídico | Responde a partir da base própria e confronta a resposta com as fontes antes de enviar | [A partir de R$ 78,90/mês](https://ialocus.com.br/blog/post-ia-juridica-preco) (Essencial; Profissional R$ 108,90; Premium R$ 208,90) |
| [GPTuri](https://turivius.com/lp/turivius/) (Turivius) | Adjacente: jurídico | IA sobre mais de 130 milhões de decisões; cada citação abre a decisão real; forte em jurimetria do CARF | Assinatura |

### O que o mercado tem em comum

- **Receita padrão:** modelo de terceiros sobre acervo próprio. A Thomson Reuters [usa modelos da OpenAI](https://www.migalhas.com.br/quentes/405689/thomson-reuters-brasil-anuncia-ampliacao-de-inteligencia-artificial), o Portal da Reforma usa Gemini e a Busca.Legal, IBM Watson.
- **O diferencial declarado é o acervo e a curadoria humana.** A IOB afirma que sua IA não existe sem os especialistas; a Econet restringe o Lion ao próprio acervo.
- **"Legislação vigente", não "vigente na data".** As descrições falam em responder pela legislação atual; nenhuma descreve consulta à redação válida em uma data passada.
- **Precisão quase nunca é medida em público.** A exceção é a Questor (66% de respostas úteis). A Contador AI declara 95% sem dizer como mediu, e a própria Receita avisa que o BotRTC pode errar.
- **IA dentro do ERP vence em distribuição.** Domínio, Questor, Makro e Alterdata já estão na tela do contador.
- **Verificação automática de citações existe no jurídico** (Jus IA, GPTuri), mas não aparece descrita nos produtos contábeis consultados.

### Comparativo de capacidades

Com base no que cada grupo divulga publicamente; "não divulgado" não significa que a capacidade não exista.

| Capacidade | Editoras de conteúdo | IA dentro do ERP | Startups tributárias | Nós |
| --- | --- | --- | --- | --- |
| Acervo editorial próprio | Sim, o principal ativo | Do fornecedor do sistema | Varia | Não; base oficial com ingestão automática |
| Resposta pela data do fato | Não divulgado | Não divulgado | Não divulgado | Sim (Camada 1) |
| Verificação automática de citações | Não divulgado | Não divulgado | Não divulgado | Sim (Camada 2, etapa 6) |
| Métrica de acerto pública | Não | Questor: 66% úteis | Contador AI: 95%, sem metodologia | Benchmark com metodologia aberta |
| Melhoria automática medida | Não divulgado | Não divulgado | Não divulgado | Sim (DGM e política treinada) |
| Integração com a rotina do escritório | Parcial | Sim | Não | Via API e MCP, a construir |
| Regimes da reforma em paralelo, por ano | Conteúdo editorial | Simulações | Simulações (e-Auditoria, Fiscoplan) | Sim, na própria base |

### Nossos diferenciais de eficácia

1. **Resposta pela data do fato.** A base guarda cada redação com sua vigência, então o agente responde sobre 2022 com a regra de 2022. Nenhum concorrente consultado descreve isso, e é uma das dúvidas mais comuns em fiscalização e revisão de períodos.
2. **Citação conferida antes de chegar ao contador.** Uma etapa separada verifica se o dispositivo citado existe, estava vigente e diz o que se afirma. O jurídico já tem isso (Jus IA); no contábil, seríamos os primeiros a descrever.
3. **Raciocínio entre normas em um passo.** O grafo de normas traz lei, decreto, IN, solução de consulta e acórdão juntos, em vez de depender de um único trecho.
4. **Precisão medida e publicada.** Um benchmark com metodologia aberta transforma "confie em nós" em número verificável, num mercado em que quase ninguém publica métrica.
5. **Melhora a cada ciclo, de forma rastreável.** Feedback dos contadores, benchmark, DGM e política de busca treinada; os concorrentes dependem de atualização editorial manual.
6. **Abstenção honesta.** O sistema diz "não encontrei base legal" em vez de inventar, o que reduz o risco que a própria Receita reconhece no BotRTC.

### Nossos diferenciais de custo e eficiência

1. **Custo por pergunta baixo por desenho.** A cascata resolve a maior parte do trabalho com índices e modelos pequenos; o modelo grande entra uma vez, com contexto enxuto. A propagação no grafo foi de 10 a 30 vezes mais barata que a busca em rodadas no artigo do HippoRAG.
2. **Perguntas repetidas quase de graça.** O cache semântico devolve respostas já validadas enquanto as normas citadas seguirem vigentes.
3. **Busca que aprende a parar.** A política de busca é treinada com penalidade por busca extra, e a DGM otimiza acerto por real gasto.
4. **Independência de fornecedor de modelo.** Como o conhecimento está na base e não nos pesos, dá para trocar de modelo quando outro ficar mais barato ou melhor, sem retreinar nada.
5. **Menos custo editorial.** A ingestão de fontes oficiais é automática; os contadores revisam o benchmark e os casos difíceis, não cada norma publicada. Os incumbentes dependem de equipes editoriais e de consultoria.
6. **Espaço de preço.** Pacotes de editoras para poucos usuários custam milhares de reais por ano (o exemplo da IOB acima), e um profissional já paga de R$ 79 a R$ 250 por mês por IA especializada; no jurídico, o Jus IA vai de R$ 78,90 a R$ 208,90 ([comparativo de preços de IA jurídica](https://ialocus.com.br/blog/post-ia-juridica-preco); pesquisa 05, seção 2.2). O Individual a R$ 199 fica nessa faixa, com lei pela data do fato e citação conferida, e o Escritório a R$ 790 para 5 usuários fica abaixo dos pacotes editoriais, com mais profundidade técnica.

### Onde estamos atrás e como compensar

- **Acervo e marca dos incumbentes** (IOB, Thomson Reuters, Econet): compensar com o benchmark público e com citação verificável, que provam qualidade sem depender de marca.
- **Distribuição dentro do ERP:** oferecer o agente via API e MCP para integração com sistemas contábeis, inclusive como parceiro de quem não tem IA própria.
- **Consultoria humana** que as editoras vendem junto: manter um canal de escalonamento humano nos casos em que o agente se abstém.
- **IA gratuita do governo** para dúvidas gerais da reforma: posicionar o produto nas perguntas complexas e de casos concretos, que o BotRTC não atende.

## Execução, custos e preços

O detalhamento está no [Plano de desenvolvimento (6 meses) e lançamento](Plano_MVP_6_meses.md). Em resumo:

- **Equipe e financiamento:** uma pessoa, Enzo Vasconcelos, com agentes de programação. Os contadores do grupo são os playtesters e financiam os meses 1 a 6; não há preço nem receita nesse período.
- **Cronograma:** a arquitetura completa (as 7 etapas da cascata, a política Search-R1, a DGM e a busca ao vivo via MCP) fica pronta em 6 meses, e o lançamento é no M7.

| Mês | Entregas principais | Critério de saída |
| --- | --- | --- |
| M1 | Base temporal e federal; BM25 e filtro de vigência | Federal com versões por dispositivo; benchmark v0 com 50 perguntas |
| M2 | SP e MG; ColBERT com doc2query, grafo de normas, árvore de temas; citação verificada e abstenção | 100% das respostas com citação conferida ou abstenção; benchmark v1 com 100 perguntas |
| M3 | PR, SC, RS e municípios; Rank1 e ColBERT ajustados; servidor dedicado | Auditoria de 100 dispositivos com no máximo 2% de erro |
| M4 | Política Search-R1; busca ao vivo MCP; 1º ciclo DGM; cálculos determinísticos | Benchmark v2 com 200 perguntas; a DGM vence a versão de partida |
| M5 | Cache semântico; 2ª rodada da política; 2º ciclo DGM; CNPJ, termos e LGPD | Custo por pergunta medido de no máximo R$ 0,30 |
| M6 | Congelamento; 3º ciclo DGM; cobrança, NFS-e e cotas | Portão: tudo em produção e acerto na meta do grupo |

Componente que não vencer no benchmark entra no lançamento desligado por chave.

- **Aporte dos 6 meses: R$ 20 mil.** Claude Ultra R$ 6.828; Cursor Premium com Grok Bot R$ 1.024; VPS isolada para agentes abertos R$ 360; desenvolvimento (API, GPU por hora, servidor, domínio, e-CNPJ, termos, sindicatos e Juntas) R$ 9.296 com as alavancas, ou R$ 15.576 na base; reserva R$ 2.492.
- **Preços do lançamento:**

| Plano | Mensal | Anual (por mês) | Usuários | Perguntas/mês |
| --- | ---: | ---: | ---: | ---: |
| Grátis | R$ 0 | – | 1 | 10 |
| Individual | R$ 199 | R$ 169 | 1 | 100 |
| Escritório | R$ 790 | R$ 659 | 5 | 400 |
| Corporativo | R$ 2.290 | R$ 1.890 | 15 | 1.050 |
| Enterprise | a partir de R$ 6.900 | – | sob contrato | sob contrato |

Pacote extra: 100 perguntas por R$ 149.

- **GPU:** alugada por hora no desenvolvimento, servidor dedicado no lançamento e compra de GPU própria a partir de cerca de 3.500 usuários pagantes, quando o payback fica em 12 meses ou menos.

## Referências

- [Darwin Gödel Machine: Open-Ended Evolution of Self-Improving Agents (arXiv)](https://arxiv.org/abs/2505.22954)
- [Código aberto da DGM (GitHub)](https://github.com/jennyzzt/dgm)
- [HyperAgents / DGM-H (arXiv)](https://arxiv.org/pdf/2603.19461)
- [LexML Brasil](https://www.lexml.gov.br)
- [Portal da Legislação do Planalto](https://www.planalto.gov.br/legislacao)
- [Normas da Receita Federal](https://normas.receita.fazenda.gov.br)
- [Imprensa Nacional (DOU)](https://www.in.gov.br)
- [On the Theoretical Limitations of Embedding-Based Retrieval (arXiv)](https://arxiv.org/abs/2508.21038)
- [HippoRAG 2: From RAG to Memory (arXiv)](https://arxiv.org/abs/2502.14802)
- [Search-R1: Training LLMs to Reason and Leverage Search Engines with RL (arXiv)](https://arxiv.org/abs/2503.09516)
- [ColBERT: Efficient and Effective Passage Search via Contextualized Late Interaction (arXiv)](https://arxiv.org/abs/2004.12832)
- [Document Expansion by Query Prediction — doc2query (arXiv)](https://arxiv.org/abs/1904.08375)
- [RAPTOR: Recursive Abstractive Processing for Tree-Organized Retrieval (arXiv)](https://arxiv.org/abs/2401.18059)
- [HippoRAG: Neurobiologically Inspired Long-Term Memory for LLMs (arXiv)](https://arxiv.org/abs/2405.14831)
- [Rank1: Test-Time Compute for Reranking in Information Retrieval (arXiv)](https://arxiv.org/abs/2502.18418)
- [How to Train Your Deep Research Agent? — Search-R1++ (arXiv)](https://arxiv.org/abs/2602.19526)
- [Transformer Memory as a Differentiable Search Index (arXiv)](https://arxiv.org/abs/2202.06991)

# Pesquisa: como os produtos e a pesquisa organizam vários agentes

**Versão 0.1 · 15/11/2026 · insumo para o desenho dos integrantes (subplanos 02 e 07).** A avaliação da ideia do Enzo e a recomendação estão em [AVALIACAO.md](AVALIACAO.md).

## Como ler

Cada achado traz o tipo de evidência:

| Marca | Quer dizer |
| --- | --- |
| **[F]** | Fato documentado: documentação oficial, código-fonte público ou artigo com método e medição |
| **[M]** | Medição publicada pelo próprio fornecedor, com dados internos que não dá para refazer |
| **[V]** | Opinião ou alegação de fornecedor, sem medição |
| **[C]** | Comparação escrita por um concorrente |
| **[I]** | Inferência minha a partir do que foi lido |

Todas as páginas foram lidas em 15/11/2026, salvo outra data indicada. O WebFetch estava bloqueado na sessão; as páginas foram baixadas com `curl` pelo proxy, com TLS verificado. Buscadores com desafio anti-robô (DuckDuckGo) e a API do GitHub para repositórios não anexados foram recusados; arquivos brutos do GitHub (`raw.githubusercontent.com`) funcionaram.

## Resumo

1. Os três produtos pedidos (Grok Bot, Openbot e agentes.chat) organizam o trabalho do mesmo jeito: **um agente por função, com dono, memória e fila próprios**, e uma porta de entrada que **escolhe quem responde** sem fazer o trabalho. Nenhum deles documenta um "orquestrador de orquestradores" por pedido. [F]
2. A escolha de quem responde é feita, primeiro, **por regras sem modelo** (menção, resposta a uma mensagem, conversa em andamento) e, só se as regras não bastam, por **um modelo pequeno** (agentes.chat: cerca de US$ 0,0001 por decisão) ou pelo modelo do agente líder numa sessão sem ferramentas (Openbot). [F]
3. O Grok Bot tem um **Bot principal** que coordena os outros e **Team Bots** compartilhados por uma equipe: conversa de cada pessoa privada, memória da equipe só muda com aprovação do dono do Bot, e o consumo é debitado de **quem a resposta atende**. É o caso mais próximo do integrante compartilhado da Heild. [F]
4. Divisão entre modelo forte e fraco: o Grok Bot escolhe o modelo por tarefa sem mostrar qual (cascata opaca); o Openbot deixa trocar o modelo de um agente à mão e cair para um modelo reserva quando o plano acaba; o agentes.chat usa um modelo pequeno só para decisões de roteamento e memória. Nenhum publica medição de qualidade. [F]
5. Na pesquisa, multiagente ajuda **trabalho decomponível** e atrapalha **trabalho sequencial**: de +80,8% a −70,0% contra um agente só, em 260 configurações (Google e outros, 12/2025). [F]
6. A Anthropic mediu (ago. a set. 2026) que delegar a modelos mais baratos só compensou em dois casos: **trabalho maior que uma janela de contexto** (Opus 5.5 com subagentes Sonnet 5.5 empatou com Opus sozinho por cerca de um terço a menos) e **rotina com cauda de custo longa**. Quando o trabalho cabe num contexto, o modelo do orquestrador sozinho, com menos esforço, saiu na frente em todos os casos medidos. [M]
7. O supervisor que reescreve a resposta dos subagentes perde qualidade ("telefone sem fio"); a LangChain recuperou cerca de 50% com mensagens encaminhadas sem reescrita (06/2025). [M]
8. O contraprova do Enzo mostra o mesmo desenho por dentro: a cascata com portão empata com o Opus a **39% do custo total por tarefa resolvida**, embora o planejador forte seja 62,7% do custo do braço. O total cai porque o planejador **tira a execução do Opus** e a passa ao Haiku; o portão é feito de testes automáticos. [F]

---

## 1. Os três produtos

### 1.1 Grok Bot (xAI, sobre a conta Cursor)

"Grokbot" é o **Grok Bot**, da xAI; a documentação mora em `docs.x.ai/grok-bot` e o app entra com a conta Cursor. Um depoimento na página do agentes.chat chama o produto de "grokbot".

**O que foi possível ver:** as páginas oficiais *Overview*, *How Grok Bot Works*, *Create and manage Bots*, *Work with Grok Bot* (conversa e grupos), *Team Bots*, *FAQ*, *Security*, *Approvals, security, and privacy*, *Skills and routines*, *Teams and enterprises* e *Inference hooks*, em Markdown. **O que não:** as páginas de rotinas, limites, memória, preços e modelos sob os nomes que tentei (`/grok-bot/routines`, `/limits`, `/memory`, `/pricing`, `/models`) deram 404. Blogs de terceiros citam um teto de 50 Bots e grupos por conta; não achei isso na documentação oficial e trato como **não confirmado**.

| Tema | O que a documentação diz | Tipo |
| --- | --- | --- |
| Unidade | "A maioria dos Bots funciona melhor com um trabalho claro." Quando um tipo de pedido volta com fontes, regras ou agenda próprias, ele ganha um Bot só dele | [F] |
| Orquestrador geral | O **Bot principal** é o ponto de contato: "checa com você por conta própria e coordena seus outros Bots". O pedido pode ir ao principal, que passa ao Bot do trabalho. Um Team Bot não pode ser o principal | [F] |
| Vários Bots juntos | Grupo de 2 a 6 Bots; os Bots decidem quem responde, ou a pessoa usa `@`, "Reply" ou `@everyone`. A boa prática é "um Bot responsável por cada etapa". Bots também trocam mensagens diretas e passam trabalho entre si | [F] |
| Compartilhado por equipe | **Team Bot**: compartilhado como um documento (equipe, organização ou pessoas). Não faz cópia. **A conversa de cada pessoa é privada**; dono e gerentes não leem | [F] |
| Memória | Cada Bot tem a sua (preferências, regras, registro datado do trabalho); poucos fatos (nome, fuso) valem para todos os Bots da pessoa. No Team Bot, o que ele aprende **para a equipe** vira sugestão que só vale quando o dono ou um gerente aprova; o que aprende **sobre a pessoa** fica entre ela e o Bot. "Memória não é fonte da verdade" | [F] |
| Ferramentas e credenciais | O Team Bot usa os apps e segredos do dono; na conversa de alguém, pode usar os apps dessa pessoa, pedindo antes. Conector compartilhado por conta de serviço, ligado pelo dono e liberado por um administrador | [F] |
| Aprovação | *Auto Review* checa cada ação; regras "Ask first" e "Allow automatically" escritas em linguagem natural. No Team Bot, **só a pessoa cuja mensagem está sendo atendida** aprova | [F] |
| Modelo forte e fraco | "Não há seletor de modelo." O Grok Bot escolhe, por tarefa, o modelo "mais provável de dar o melhor resultado", próprio ou de terceiros, e não mostra qual. O consumo aparece como "uso do Grok Bot", não por modelo | [F] que roteia; [V] que escolhe o melhor |
| Custo e limites | Cota semanal compartilhada com o Cursor e os apps do Grok; acabou a cota, segue em uso sob demanda se ligado. **A resposta de um Team Bot consome a cota de quem está sendo atendido** | [F] |
| Isolamento | Todos os Bots de uma pessoa usam o mesmo computador na nuvem, com arquivos, navegador e sessões em comum; a própria documentação diz que os Bots "não são separados uns dos outros" | [F] |

### 1.2 Openbot (openbot.run)

Openbot é um app de desktop e servidor da Synthetify Labs (repositório `nightly-labs/openbot`, licença PolyForm Noncommercial 1.0.0). **Não é o OpenClaw**; o próprio site tem uma página "OpenBot vs OpenClaw".

**O que foi possível ver:** o site (página inicial, preços, equipes, novidades de 14/09, 08/09, 27/08 e 14/08/2026, comparação com o Grok Bot, guia de importação do Grok Bot) e, no GitHub bruto, o `README.md`, `docs/ARCHITECTURE.md`, `docs/architecture/agents.md` e `docs/architecture/channels-and-messaging.md`. É o produto mais bem documentado dos três, porque o código e a arquitetura são públicos. **O que não:** não achei teto de gasto por agente nem medição de qualidade.

| Tema | O que a documentação diz | Tipo |
| --- | --- | --- |
| Unidade | Cada agente tem papel, instruções, workspace, conversa, **fila FIFO persistente** e contexto próprios, e roda num provedor próprio (Codex, Claude Code, Gemini, Grok, OpenCode, Cursor e outros) | [F] |
| Orquestrador geral | Não há um agente geral fixo. No **canal**, um agente é o **líder**; ele recebe o que ninguém endereçou e pode responder ou perguntar à pessoa. Fora de canal, um agente que recebe trabalho fora do seu perfil chama `list_agents` e delega ao colega cuja descrição cobre o trabalho | [F] |
| Roteamento | Primeiro sem modelo: destinatário escolhido, resposta a uma tarefa, continuação da única tarefa aberta, canal com um só membro. Só então o **modelo do líder, numa sessão separada e sem ferramentas de trabalho**, recebe o resumo do canal (não o histórico) e devolve os membros cuja área o pedido toca. Saída inválida nunca vira "mandar para todos" | [F] |
| Divisão do trabalho | Cada membro escolhido ganha a **própria tarefa raiz** e responde sozinho. Tarefas filhas mantêm o dono da tarefa mãe; transferência muda o dono. Limite: **8 atribuições automáticas por pedido e 2 ativas por canal** | [F] |
| Anti-loop | Respostas de rotina entre agentes ficam internas; "confirmações não podem virar loop"; o agente nunca devolve a tarefa a quem a deu | [F] |
| Memória | Memória por agente e memória de canal; o canal guarda transcript, tarefas, atribuições e resumos em SQLite, reconstruível a partir de eventos. Um canal "não funde os agentes num processo com uma memória" | [F] |
| Modelo forte e fraco | Modelo e esforço por agente. Quando o plano bate o limite ou o provedor cai, o agente **muda para um modelo reserva** mantendo conversa e workspace. A novidade de 27/08/2026 sugere "rodar o modelo barato até o trabalho ficar difícil e então subir esse mesmo agente para um mais forte", **à mão** | [F] o recurso; [V] o conselho |
| Fluxos | *Workflows* em grafo: passos de agente, passos de modelo sem ferramentas, condições, **aprovações** e saídas; o custo de cada passo é contado no agente ou numa linha reservada | [F] |
| Aprovação e segurança | Os agentes rodam com acesso total e sem aprovação por ação, depois do consentimento inicial. Algumas ferramentas (apagar workflow, mexer em canal) exigem mensagem de uma pessoa e, às vezes, cartão de aprovação | [F] |
| Equipe | Um computador roda o servidor da equipe; colegas entram; papéis definem quais agentes cada membro vê, conversa ou administra | [F] |
| Custo | Grátis para uso pessoal; licença de trabalho de € 10 por membro por mês; servidor hospedado de € 30 a € 100 por mês. O modelo é pago pelo plano que a pessoa já tem | [F] |
| Onde ajuda e onde não | "Um canal não faz um problema difícil andar mais rápido. Três agentes numa tarefa ambígua produzem três respostas plausíveis e um fio mais longo para ler" | [V] |
| Comparação com o Grok Bot | Página do Openbot, conferida em 02/10/2026, diz que é melhor em 8 de 14 temas | [C] |

### 1.3 agentes.chat

Chat de equipe com agentes, em beta aberto, de CODARI GLOBAL, LLC (código AGPL, segundo a página inicial).

**O que foi possível ver:** página inicial, preços, as páginas de documentação *Who answers a message*, *Memory*, *Approvals*, *Jev* e as de recursos *Multi-agent chat* e *Routines and missions* (todas datadas de 29/10/2026). **O que não:** não há documentação pública sobre o "Lodi" além de uma frase, nem sobre como cada agente escolhe modelo além de "cada agente pensa com o plano ou a chave de IA que você já tem"; não há medição de qualidade. A busca na web não achou nada sobre o produto fora do próprio site.

| Tema | O que a documentação diz | Tipo |
| --- | --- | --- |
| Unidade | "Um agente para cada área. Cada um com um papel, ferramentas e alguém da equipe que responde por ele" (Dev, Infra, Dados, Marketing, Suporte, Financeiro) | [F] |
| Orquestrador geral | Não há agente geral que faça o trabalho. Há um **roteador** e o "Lodi, seu braço direito", que só aprova por você criação de agentes e mudanças de modelo, orçamento e canais, quando você pediu | [F] |
| Roteamento | Menção decide. Sem menção: **o código escolhe os candidatos** (ativos na conversa, com resposta automática ligada e autorizados a falar com quem escreveu), **um modelo pequeno decide** (o Jev, da TypeSafe; sem ele, um modelo pequeno numa chave do workspace, como Claude Haiku 5.5), e regras fixas são o último recurso. **Se nada decide, ninguém responde**, e o motivo aparece | [F] |
| Custo do roteamento | O Jev lê cerca de 2.500 tokens por decisão, **cerca de US$ 0,0001**. A página inicial mostra "Escolhendo quem responde: 0,1%" do gasto | [F] |
| Quantos respondem | Mensagem normal: 1 agente. Para todos: até 4. Mensagem de agente: no máximo mais um. **3 respostas de agente seguidas encerram a cadeia** | [F] |
| Entre agentes | *Ask* (DM assíncrona) e *Tell* (recado sem esperar). O canal recebe o resultado, não a conversa toda | [F] |
| Orçamento | **Orçamento mensal por agente, conferido antes de cada chamada**; tokens e custo registrados em toda chamada, inclusive do roteador | [F] |
| Memória | Por agente, aprendida das conversas e das correções da equipe; editável, fixável e arquivável. **"Memória não dá permissão."** Quando uma lição se repete, o agente propõe mudar as próprias instruções ou o contexto do workspace, e nada muda até alguém aceitar | [F] |
| Aprovação | Merge, deploy, rollback, envio para fora e apagar dados pedem aprovação. Aprovar vale para **uma ação exata, com os valores**; "sempre aprovar" não é oferecido para ações de risco. Recusa com motivo vira lição | [F] |
| Rotinas e missões | Rotina nunca roda duas vezes ao mesmo tempo, trabalha quieta, toda escrita em app conectado pede uma pessoa, pausa após falhas repetidas; há rotina "de leitura" e "de ação". **Missão** (beta) é trabalho de vários dias com **um agente dono**, que divide em tarefas e consulta outros agentes; um modelo juiz aprova comandos de baixo risco | [F] |
| Custo | US$ 29 (pessoal), US$ 49 (até 10 pessoas) e US$ 99 (até 25) por mês, agentes ilimitados; a IA é paga pelo plano ou chave do cliente | [F] |

### 1.4 Os três lado a lado

| | Grok Bot | Openbot | agentes.chat |
| --- | --- | --- | --- |
| Unidade | Bot por trabalho | Agente por papel | Agente por área |
| Entrada geral | Bot principal (coordena) | Líder do canal (roteia) | Roteador (código + modelo pequeno) |
| Orquestração em dois níveis por pedido | Não documentada | Não (uma tarefa, um dono; filhas mantêm o dono) | Não (missão tem um dono) |
| Compartilhado por equipe | Team Bot, conversa privada por pessoa | Servidor de equipe com papéis | Canais da equipe |
| Memória compartilhada | Só com aprovação do dono | Por canal | Proposta, aceita por alguém |
| Forte e fraco | Automático e opaco | Manual e reserva no limite | Modelo pequeno só para decisões |
| Quem paga | Quem é atendido | Plano de cada provedor | Chave ou plano do workspace |
| Teto | Cota semanal | Do provedor | Orçamento por agente |
| Anti-loop | Instruções e grupos | Limites de atribuição | 3 respostas seguidas |

**[I]** O padrão comum é: roteamento barato e determinístico na frente, **um dono por tarefa**, memória compartilhada só com revisão humana, aprovação por ação exata, teto por agente ou por pessoa e limite de cadeia. Nenhum dos três coloca um modelo forte para planejar cada pedido antes do agente que vai fazer o trabalho.

---

## 2. Padrões e frameworks

### 2.1 Nomes e o que cada framework oferece

| Padrão | O que é | Onde aparece |
| --- | --- | --- |
| **Roteamento** | Classifica a entrada e manda ao tratamento certo; inclui mandar o fácil a modelo barato e o difícil a modelo forte | Anthropic, *Building effective agents* (19/12/2024) [V]; LangChain *Router* [F] |
| **Orquestrador e operários** | Um modelo central divide a tarefa, delega e sintetiza | Anthropic (idem) [V]; Claude Agent SDK, subagentes com contexto isolado e em paralelo [F]; Claude Managed Agents, orquestração multiagente [F] |
| **Agentes como ferramentas** | Um gerente mantém a conversa e chama especialistas como ferramentas | OpenAI Agents SDK, `Agent.as_tool()` [F]; LangChain *Subagents* [F] |
| **Handoff** | Uma triagem passa a conversa ao especialista, que vira o agente ativo e responde direto | OpenAI Agents SDK [F]; LangChain *Handoffs* [F] |
| **Supervisor** | Só o supervisor fala com o usuário; delega e recebe de volta | LangGraph `langgraph-supervisor` [F], que hoje **recomenda fazer o supervisor por chamada de ferramenta** em vez da biblioteca [F] |
| **Swarm** | Qualquer agente passa a vez a qualquer outro; quem está ativo responde | LangGraph `langgraph-swarm` [F] |
| **Hierárquico** | Um gerente (`manager_llm` ou `manager_agent`) delega numa cadeia de comando | CrewAI, `Process.hierarchical` [F] |
| **Chat em grupo com seletor** | Um modelo escolhe quem fala a seguir | AutoGen `SelectorGroupChat` [F]; o AutoGen foi **arquivado** e a Microsoft indica o Microsoft Agent Framework 1.0 [F] |
| **Magentic** | Um gerente mantém um livro de tarefas, planeja, acompanha e replaneja | Magentic-One (11/2024) [F]; guia de padrões da Microsoft [F] |
| **Orquestração por código** | Classificar com saída estruturada e escolher o próximo passo em código; encadear agentes | OpenAI Agents SDK: "mais determinístico e previsível em velocidade, custo e desempenho" [F/V] |
| **Cascata** | Tenta o barato; escala se a verificação falha | FrugalGPT, AutoMix [F]; contraprova [F] |
| **Advisor** | Um modelo barato conduz e consulta um forte nas decisões difíceis | Ferramenta *advisor* da Anthropic (beta) [F] |

Recomendações gerais dos próprios fornecedores, todas **[V]**: a Microsoft manda usar "o menor nível de complexidade que atende" e limitar chat em grupo a "três ou menos agentes" (guia de padrões de orquestração); a Anthropic manda começar simples; a OpenAI prefere especialistas a um agente geral.

### 2.2 Resultados medidos

| Fonte e data | Desenho | Resultado | Tipo e ressalva |
| --- | --- | --- | --- |
| Anthropic, *Optimizing for cost and intelligence* (execuções de 08 a 09/2026) | Opus 5.5 orquestrando subagentes Sonnet 5.5, em busca de defeitos maior que uma janela | **Mesmo placar que Opus 5.5 sozinho, cerca de um terço mais barato** | [M] dados internos |
| Idem | Subagentes Haiku 5.5 sob Opus 5.5 (médio), em programação | **−32% de custo e −4 pontos** de taxa de acerto (IC 95% 1,3 a 7,1), o mesmo que baixar o esforço daria | [M] |
| Idem | Fable 5 com um operário Sonnet 5 em BrowseComp: fatia fácil e rotineira | Metade do custo médio; um terço no percentil 90. No conjunto difícil inteiro, **o modelo sozinho atingiu a mesma acurácia por 22% a 30% menos** | [M] amostra pequena (10 problemas) |
| Idem | Advisor (executor barato consulta um forte) | Programação: +1,7 ponto por 2,1 vezes o custo; GPQA: nenhuma consulta; Chartography: −7 pontos | [M] |
| Idem | Sonnet 5.5 contra Opus 5.5 em GPQA Diamond | Empate em 91% contando recusas como erro (o Opus recusou mais); nas questões que os dois responderam, Opus cerca de 2 pontos à frente | [M] |
| Idem, regra geral | Orquestrador | "Quando o trabalho é uma cadeia dependente, ou cabe num só contexto, o modelo do orquestrador sozinho com menos esforço saiu na frente em todos os casos medidos" | [M] |
| Anthropic, *How we built our multi-agent research system* (13/06/2025) | Opus 4 líder com subagentes Sonnet 4 | **+90,2%** sobre Opus 4 sozinho na avaliação interna de pesquisa; agentes usam ~4 vezes os tokens de um chat e sistemas multiagente ~15 vezes; o uso de tokens explica 80% da variância no BrowseComp | [M] tarefa de pesquisa ampla, paralela |
| Kim e outros, *Towards a Science of Scaling Agent Systems*, arXiv 2512.08296 (09/12/2025) | 260 configurações, 6 benchmarks, 5 arquiteturas, 3 famílias de modelo | De **+80,8%** (raciocínio financeiro decomponível) a **−70,0%** (planejamento sequencial) contra um agente só; retorno decrescente quando o agente só já é bom; tarefas com muitas ferramentas pagam sobrecarga; **verificação centralizada propaga menos erro** | [F] |
| LangChain, *Benchmarking multi-agent architectures* (10/06/2025) | τ-bench varejo (100 casos) com domínios distratores | Agente só é melhor com até 1 distrator e cai com 2 ou mais; swarm um pouco melhor que supervisor; o supervisor perde no "telefone sem fio" e gasta mais tokens; encaminhar a resposta sem reescrever e limpar o contexto do subagente deram **~50% de melhora** | [M] |
| LangChain, documentação de multiagente | Contagem de chamadas por padrão em exemplos sintéticos | Subagentes custam uma chamada a mais por pedido; padrões com estado (handoff, skills) economizam 40% a 50% das chamadas em pedidos repetidos; em pedido de vários domínios, subagentes e roteador processam ~67% menos tokens | [F] exemplo ilustrativo |
| Cemri e outros, MAST, arXiv 2503.13657 (17/03/2025) | 1.600+ traces de 7 frameworks | Ganhos de multiagente "muitas vezes mínimos"; **14 modos de falha** em 3 grupos: desenho do sistema, desalinhamento entre agentes, verificação da tarefa | [F] |
| FrugalGPT, arXiv 2305.05176 (09/05/2023) | Cascata aprendida | Iguala o melhor modelo com **até 98% menos custo** | [F] perguntas de chamada única |
| AutoMix, arXiv 2310.12963 (19/10/2023) | Autoverificação do pequeno + roteador | **Mais de 50% menos custo** com desempenho comparável | [F] idem |
| RouteLLM, arXiv 2406.18665 (26/06/2024) | Roteador treinado com preferências | **Mais de 2 vezes menos custo** em alguns casos, sem perder qualidade | [F] idem |
| Kapoor e outros, *AI Agents That Matter*, arXiv 2407.01502 (01/07/2024) | Avaliação de agentes | Agentes de ponta são "desnecessariamente complexos e caros"; custo e acurácia devem ser otimizados juntos | [F] |
| Magentic-One, arXiv 2411.04468 (07/11/2024) | Orquestrador com livro de tarefas | Competitivo com o estado da arte em GAIA, AssistantBench e WebArena | [F] sem foco em custo |
| Cognition, *Don't build multi-agents* (12/06/2025) | Opinião | "Compartilhe o contexto e os traces completos"; ações carregam decisões implícitas que se contradizem entre subagentes | [V] |

### 2.3 Padronização: procedimentos, ferramentas tipadas e esquemas

O que a pesquisa e os produtos dizem sobre fixar o caminho de cada processo:

| Fonte | O que diz ou faz | Tipo |
| --- | --- | --- |
| Anthropic, *Building effective agents* (19/12/2024) | Separa *workflow* (caminho definido em código) de *agente* (o modelo decide o caminho); recomenda o mais simples que resolve | [V] |
| OpenAI Agents SDK | "Orquestrar por código torna as tarefas mais determinísticas e previsíveis em velocidade, custo e desempenho": classificar com saída estruturada e escolher o passo em código | [F/V] |
| Grok Bot | "Faça a tarefa funcionar uma vez e salve como *skill*"; depois vira rotina por agenda ou evento | [F] |
| Openbot | *Skills* em pasta com `SKILL.md`; *workflows* em grafo com passos de agente, passos de modelo sem ferramentas, condições e aprovações | [F] |
| agentes.chat | Rotina "de leitura" e "de ação"; toda escrita de rotina pede uma pessoa; missão com plano em lista | [F] |
| LangChain, padrão *Skills* | Contexto especializado carregado sob demanda por um agente só; menos chamadas que subagentes em pedidos repetidos | [F] |
| contraprova | O contrato (escopo de arquivos, interfaces congeladas, comando de teste) e o portão levaram a junção de 28 para 36 de 37 tarefas | [F] |
| Kim e outros (12/2025) | Verificação centralizada propaga menos erro; tarefas com muitas ferramentas pagam sobrecarga de coordenação | [F] |
| Anthropic, ferramentas com `strict` e saídas estruturadas | Entradas de ferramenta e respostas validadas por esquema | [F] |

**[I]** Nenhuma fonte mede "procedimento contra agente livre" no trabalho contábil. A evidência indireta é consistente: quanto menos o modelo decide o caminho e quanto mais a saída é conferível por regra, menor o erro e o custo.

### 2.4 O contraprova (aphesist/contraprova, 12/11/2026)

O método do Enzo, lido no repositório clonado (README, `docs/design.md`, `docs/lanes-plan.md`, `docs/claude-code.md`, `docs/mcp.md`, `docs/related-work.md`, `results/swepro-main` e `results/swepro-lanes/main`). Tudo **[F]**, pré-registrado, com log encadeado por hash.

| Estudo | Desenho | Resultado |
| --- | --- | --- |
| Principal, 88 tarefas novas do SWE-bench Pro | Opus 5.5 (esforço baixo) escreve um brief a partir do esboço; Haiku 5.5 executa; portão (escopo, edições, testes visíveis e privados); bloqueio → Opus | **83/88 contra 85/88** do Opus sozinho: −2,3 pontos [−8,0; +3,4], dentro da margem de −10. Custo por tarefa resolvida **0,39** [0,30; 0,51] do Opus |
| Idem | Haiku sozinho com o brief (derivado) | 77/88: −9,1 pontos contra o Opus. O portão e a escalada recuperam quase toda a diferença |
| Idem | Valor da escalada, nos 8 bloqueios | Opus resolveu 6/8 e um novo Haiku 2/8 no mesmo ponto: +50 pontos, mas impreciso (p = 0,125) |
| Idem | Peso do orquestrador | 62,7% do custo do braço com 13,1% dos tokens; **ainda assim o total por tarefa resolvida foi 0,39 do Opus sozinho**, porque a execução saiu do Opus |
| Raias por contrato, 37 tarefas com 3 arquivos ou mais | Opus planeja raias Haiku com arquivos disjuntos e interfaces congeladas; junção governada; só a raia culpada sobe Haiku → Sonnet → Opus | Junção com contratos e portão **36/37 contra 28/37** sem eles (8 a 0, p = 0,008): **contratos e portão importam** |
| Idem | Raias contra cascata | 36/37 contra 34/37, custo total por tarefa resolvida 1,07 [0,62; 1,76]: sem diferença mensurável. O planejador foi 50,2% da conta das raias (47,9% do brief da cascata) e nunca dividiu em mais de 2 raias |
| Idem | Revisor Sonnet como portão | Bloqueou duas junções, **as duas por engano** |

Ressalvas que o próprio repositório registra: o domínio é programação com testes escondidos (o portão sabe se o trabalho está certo); os arquivos certos são dados (cenário *oracle files*); o Opus estava perto do teto (96,6%); a escada Haiku → Sonnet → Opus do plugin **não foi medida**; um roteador aprendido é hipótese.

---

## 3. O que levar para a Heild

1. **Um agente por função com um dono** é o padrão dos três produtos e dos frameworks. A ideia de um integrante por setor está alinhada com o mercado. [I]
2. **A porta de entrada escolhe; não refaz.** Roteamento por regras e modelo pequeno custa frações de centavo; um orquestrador forte que reescreve a resposta paga tokens e perde qualidade. [F, M]
3. **Delegar a modelos baratos compensa quando o planejador substitui execução de um modelo caro**, e mais ainda com volume decomponível (lotes, carteira inteira, documentos em quantidade, trabalho maior que um contexto). Um planejador que só se soma a outro, sem trocar quem executa, aumenta o custo total. A comparação certa é sempre o custo total por tarefa resolvida, com a taxa de erro ao lado. [M, F, I]
4. **Portão e contrato fazem a diferença** que o modelo barato sozinho não faz (contraprova: 28 → 36 de 37 com contratos e portão; Haiku sozinho −9 pontos, com portão e escalada −2). O portão precisa saber se o trabalho está certo; um revisor do mesmo fornecedor é fraco. [F]
5. **A diferença de preço entre os níveis decide o ganho.** Na tabela de 11/2026, Opus 5.5 custa o dobro do Sonnet 5.5, e o Sonnet custa 20 vezes o Haiku 5.5 (entrada e saída). A economia do contraprova veio de trocar Opus por Haiku. [F, I]
6. **Integrante compartilhado tem precedente**: o Team Bot do Grok Bot resolve conversa privada por pessoa, memória de equipe com aprovação e débito no consumo de quem é atendido. [F]
7. **Teto e anti-loop são de produto**, não de modelo: orçamento conferido antes de cada chamada, limite de cadeia, "se nada decide, ninguém responde". [F]
8. **Padronizar o caminho de cada processo** (procedimento, ferramentas tipadas, entradas e saídas com esquema, validação por regra) é a alavanca que as fontes apontam para baixar erro e custo juntos: o modelo decide menos e cada saída fica conferível (seção 2.3). [I, apoiado em F]

## 4. Limites desta pesquisa

- Nenhuma medição aqui é do trabalho contábil; todas vêm de programação, busca na web, perguntas e respostas ou atendimento sintético. Transferir números para a Heild é inferência.
- As medições da Anthropic e da LangChain são de fornecedores, com dados internos.
- Do Grok Bot, faltaram as páginas de rotinas, limites e preços; do agentes.chat, os detalhes do "Lodi" e da escolha de modelo; dos três, qualquer número de qualidade.
- Os preços de modelo são os de tabela de 11/2026 (Opus 5.5 US$ 4 e US$ 20 por milhão de tokens de entrada e saída, leitura de cache US$ 0,20; Sonnet 5.5 US$ 2, US$ 10 e US$ 0,10; Haiku 5.5 US$ 0,10 e US$ 0,50, até 100 mil tokens de prompt) e mudam.

## 5. Fontes

Lidas em 15/11/2026.

**Produtos**

- Grok Bot: <https://docs.x.ai/grok-bot/overview.md>, <https://docs.x.ai/grok-bot/how-grok-bot-works.md>, <https://docs.x.ai/grok-bot/bots.md>, <https://docs.x.ai/grok-bot/chat-and-collaboration.md>, <https://docs.x.ai/grok-bot/team-bots.md>, <https://docs.x.ai/grok-bot/faq.md>, <https://docs.x.ai/grok-bot/security.md>, <https://docs.x.ai/grok-bot/approvals-security-and-privacy.md>, <https://docs.x.ai/grok-bot/skills-routines-and-automations.md>, <https://docs.x.ai/grok-bot/teams-and-enterprises.md>
- Openbot: <https://openbot.run/>, <https://openbot.run/pricing>, <https://openbot.run/teams>, <https://openbot.run/news/introducing-openbot> (14/09/2026), <https://openbot.run/news/your-work-stays-on-your-computer> (08/09/2026), <https://openbot.run/news/one-agent-many-providers> (27/08/2026), <https://openbot.run/news/channels-put-agents-in-one-room> (14/08/2026), <https://openbot.run/compare/grok-bot> (conferida pelo Openbot em 02/10/2026), <https://openbot.run/guides/import-grok-bot-agents> (23/10/2026), <https://github.com/nightly-labs/openbot> (`README.md`, `docs/ARCHITECTURE.md`, `docs/architecture/agents.md`, `docs/architecture/channels-and-messaging.md`)
- agentes.chat: <https://agentes.chat/>, <https://agentes.chat/pricing>, <https://agentes.chat/docs/who-answers>, <https://agentes.chat/docs/memory>, <https://agentes.chat/docs/approvals>, <https://agentes.chat/docs/jev>, <https://agentes.chat/features/multi-agent-chat> (29/10/2026), <https://agentes.chat/features/routines-and-missions> (29/10/2026)

**Padrões, frameworks e pesquisa**

- Anthropic, Building effective agents (19/12/2024): <https://www.anthropic.com/engineering/building-effective-agents>
- Anthropic, How we built our multi-agent research system (13/06/2025): <https://www.anthropic.com/engineering/multi-agent-research-system>
- Anthropic, Optimizing for cost and intelligence (execuções de 08 a 09/2026): <https://platform.claude.com/docs/en/about-claude/models/optimizing-for-cost-and-intelligence>
- Claude Agent SDK, subagentes: <https://code.claude.com/docs/en/agent-sdk/subagents>
- OpenAI Agents SDK, orquestração: <https://openai.github.io/openai-agents-python/multi_agent/>
- LangChain, multiagente: <https://docs.langchain.com/oss/python/langchain/multi-agent>; langgraph-supervisor: <https://github.com/langchain-ai/langgraph-supervisor-py>
- LangChain, Benchmarking multi-agent architectures (10/06/2025): <https://blog.langchain.com/benchmarking-multi-agent-architectures/>
- CrewAI, processos: <https://docs.crewai.com/en/concepts/processes>
- AutoGen, SelectorGroupChat: <https://microsoft.github.io/autogen/stable/user-guide/agentchat-user-guide/selector-group-chat.html>; aviso de arquivamento no README: <https://github.com/microsoft/autogen>
- Microsoft, AI agent orchestration patterns: <https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns>
- Kim e outros (09/12/2025): <https://arxiv.org/abs/2512.08296>
- Cemri e outros, MAST (17/03/2025): <https://arxiv.org/abs/2503.13657>
- FrugalGPT (09/05/2023): <https://arxiv.org/abs/2305.05176>
- AutoMix (19/10/2023): <https://arxiv.org/abs/2310.12963>
- RouteLLM (26/06/2024): <https://arxiv.org/abs/2406.18665>
- AI Agents That Matter (01/07/2024): <https://arxiv.org/abs/2407.01502>
- Magentic-One (07/11/2024): <https://arxiv.org/abs/2411.04468>
- Cognition, Don't build multi-agents (12/06/2025): <https://cognition.ai/blog/dont-build-multi-agents>
- contraprova (12/11/2026): <https://github.com/aphesist/contraprova>, `results/swepro-main/README.md`, `results/swepro-lanes/main/README.md`

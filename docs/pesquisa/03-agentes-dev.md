# Pesquisa 03 — Agentes de IA para desenvolver e operar o projeto

4 de novembro de 2026

Esta pesquisa levanta as assinaturas e ferramentas agênticas que podem acelerar a construção do assistente para contadores e da ingestão multiagente da base legal (ver a seção 4 do [Plano de Ingestão da Base Legal](../planos/Plano_de_Ingestao_da_Base_Legal.md)). Para cada uma: o que faz, quanto custa, que riscos traz e se entra na compra dos próximos 12 meses.

**Como ler os números**

- Preços em dólares, sem impostos, conforme as páginas oficiais consultadas em 4/11/2026. Cada tabela traz a URL da fonte.
- Câmbio de referência: **US$ 1 = R$ 5,4935** (PTAX de 3/11/2026, Banco Central). Detalhes na seção 7.5.
- O que não pôde ser confirmado em fonte oficial está marcado com **(não confirmado)** e listado na seção 8.

---

## 1. Resumo

- **Ferramenta principal: Claude Code no plano Claude Team.** Assentos Premium para os desenvolvedores (US$ 100/mês no anual, US$ 125 no mensal) e um assento Standard para o fundador (US$ 20/25). O Team não treina modelos com os dados da empresa por padrão, tem SSO e controle de gastos, e o Claude Agent SDK usa o mesmo motor do Claude Code para construir os agentes da ingestão.
- **A assinatura cobre o trabalho dos desenvolvedores; o pipeline e o assistente são cobrados à parte, por token.** O Agent SDK se autentica com chave de API (a Anthropic não permite login do claude.ai em produtos de terceiros), e só a API tem o desconto de 50% do processamento em lote. Estimativa própria: US$ 0,15 a 0,30 por ato processado de ponta a ponta. O piloto de 300 documentos sai por US$ 220 a 430.
- **Stack enxuta (3 devs + fundador): US$ 349/mês (≈ R$ 1.917).** Stack confortável: US$ 845/mês (≈ R$ 4.642). Somam-se a isso de US$ 300 a 1.500/mês de API nos primeiros meses.
- **Agentes de computer use não devem chegar perto de dados de clientes, certificados digitais ou contas gov.br.** O OpenClaw acumula falhas críticas e centenas de milhares de instâncias expostas. O Grok Bot é beta e faz login nas contas do usuário. O agente do ChatGPT foi retirado sem período de transição. O Hermes é o mais cuidadoso dos open source, mas a própria documentação diz que suas proteções "não são uma fronteira rígida". Todos os fornecedores admitem que a injeção de prompt não está resolvida.
- **CAPTCHA: contornar está fora de escopo.** O caminho é: API ou serviço oficial → outra fonte oficial → pedido pela Lei de Acesso à Informação (o art. 8º, § 3º, III, prevê acesso automatizado por máquina) → convênio com o órgão → coleta pontual por uma pessoa.

---

## 2. Claude Code e o ecossistema Anthropic

### 2.1 Planos que incluem Claude Code

| Plano | Preço (US$) | Uso | Claude Code | Treinamento com seus dados | Observações | Fonte |
| --- | --- | --- | --- | --- | --- | --- |
| Free | 0 | Ocasional | Não | Opt-out | — | [claude.com/max](https://claude.com/max) |
| Pro | 20/mês, ou 17/mês no anual (200/ano) | Base de comparação ("1x") | Sim | Opt-out | Sem créditos de API | [claude.com/max](https://claude.com/max), [suporte](https://support.claude.com/en/articles/11049762) |
| Max | 100/mês | 5x o Pro, por janela de 5 h e por semana | Sim | Opt-out | US$ 100/mês em créditos de API | [claude.com/max](https://claude.com/max) |
| Ultra (antigo Max 20x) | 200/mês, só mensal | 10x o Pro por semana; sem limite de 5 h em conta verificada | Sim | Opt-out | US$ 200/mês em créditos de API | [suporte: Ultra](https://support.claude.com/en/articles/17728952) |
| Team, assento Standard | 20/mês no anual; 25 no mensal | 1,25x a cota de sessão do Pro, mais limite semanal | Sim | Nenhum por padrão | Mínimo de 2 e máximo de 150 assentos; SSO; controle de gastos; o plano inclui até US$ 500/mês em créditos de API compartilhados (condições não lidas) | [suporte: Team](https://support.claude.com/en/articles/9266767-what-is-the-team-plan), [claude.com/max](https://claude.com/max) |
| Team, assento Premium | 100/mês no anual; 125 no mensal | 6,25x a cota de sessão do Pro, mais limite semanal | Sim | Nenhum por padrão | Para quem usa muito; pode ser combinado com assentos Standard no mesmo plano | [suporte: Team](https://support.claude.com/en/articles/9266767-what-is-the-team-plan) |
| Enterprise (self-serve, por uso) | 20/assento/mês, anual, mínimo de 20 assentos, mais o uso a preço de API | Sem limite por assento; todo o uso é cobrado | Sim | Nenhum por padrão | Não cabe num time de 3 a 5 pessoas | [claude.com/max](https://claude.com/max), [suporte: Enterprise](https://support.claude.com/en/articles/11526368-usage-based-enterprise-plans) |

Notas:

- O antigo **Max 20x virou Ultra** por volta do fim de outubro de 2026 (data exata não divulgada), sem mudança de preço. Algumas páginas de ajuda ainda usam o nome antigo.
- Os créditos de API incluídos no Max, no Ultra e no Team servem para chamadas à API, que é exatamente o que os agentes da ingestão consomem. No Max e no Team, a Anthropic diz expressamente que eles **não podem ser usados no Claude Code** nem nos apps. Esse valor não entrou nas contas da seção 7 porque as condições do crédito do Team não foram lidas.
- **Treinamento:** nos planos individuais o uso das conversas para treinar modelos é "opt-out" (cada pessoa precisa desligar). No Team e no Enterprise, não há treinamento por padrão. Como o projeto vai lidar com dados de escritórios contábeis, esse é o principal motivo para preferir o Team ao Max, que tem preço parecido.
- A página claude.com/pricing não pôde ser lida neste ambiente. Os preços vieram de claude.com/max e das páginas de suporte da Anthropic.

### 2.2 Limites de uso

- **Pro e Max:** limite por sessão de 5 horas e limite semanal, compartilhados entre o Claude e o Claude Code. O Max tem ainda um limite semanal separado para o modelo Fable ([suporte](https://support.claude.com/en/articles/11145838-use-claude-code-with-your-pro-or-max-plan)).
- **Ultra:** sem limite de 5 horas para contas verificadas. A verificação é automática, por histórico da conta e de pagamento. Mantém um limite semanal geral e outro para o Fable.
- **Team:** os limites valem por membro, não para a equipe inteira. Quem esgota a cota pode continuar com créditos de uso pagos a preço de API, com tetos definidos pelo administrador por organização, grupo ou pessoa.
- **Referência de custo a preço de API:** a Anthropic informa média de cerca de US$ 13 por desenvolvedor por dia ativo e de US$ 150 a 250 por mês em implantações corporativas; 90% dos usuários ficam abaixo de US$ 30 por dia ([custos do Claude Code](https://code.claude.com/docs/en/costs)). Para um desenvolvedor em tempo integral, o assento Premium tende a sair mais barato que pagar o mesmo uso por token.

### 2.3 API, Claude Agent SDK e Managed Agents

- **Claude Agent SDK** ([visão geral](https://code.claude.com/docs/en/agent-sdk)): biblioteca em Python e TypeScript com o mesmo ciclo de agente, ferramentas, subagentes, hooks, MCP, permissões e sessões do Claude Code. Não tem preço próprio: consome tokens da API. A documentação diz: *"Unless previously approved, Anthropic does not allow third party developers to offer claude.ai login or rate limits for their products, including agents built on the Claude Agent SDK. Use the API key authentication methods..."*. Na prática, o assistente para contadores, que é um produto oferecido a terceiros, precisa usar chave de API. O pipeline de ingestão também deve usá-la: é ela que dá acesso ao processamento em lote, aos limites de gasto por workspace e a uma conta separada do uso dos desenvolvedores. As assinaturas ficam para o trabalho interativo do time. O uso do SDK é regido pelos Termos Comerciais da Anthropic.
- **Managed Agents:** a Anthropic hospeda o ciclo do agente num sandbox na nuvem. Custa US$ 0,08 por hora de sessão em execução, mais os tokens, sem desconto de lote. O exemplo oficial: uma sessão de 1 hora com Opus 5.5, 50 mil tokens de entrada e 15 mil de saída custa US$ 0,58 ([preços](https://platform.claude.com/docs/en/about-claude/pricing)). É uma opção para rodar o orquestrador ou o agente mantenedor sem infraestrutura própria. A ferramenta de computer use não está disponível ali.

**Preços da API para os modelos atuais** (US$ por milhão de tokens; [fonte oficial](https://platform.claude.com/docs/en/about-claude/pricing)):

| Modelo | Entrada | Saída | Leitura de cache | Lote: entrada / saída | Papel sugerido no projeto |
| --- | --- | --- | --- | --- | --- |
| Claude Opus 5.5 | 4 | 20 | 0,20 | 2 / 10 | Extrator primário, reconciliador, orquestrador |
| Claude Sonnet 5.5 | 2 | 10 | 0,10 | 1 / 5 | Revisor, mantenedor de coletores |
| Claude Haiku 5.5 (prompt até 100 mil tokens) | 0,10 | 0,50 | 0,01 | 0,05 / 0,25 | Triador, normalizador |
| Claude Haiku 5.5 (prompt acima de 100 mil) | 0,50 | 2,50 | 0,05 | 0,25 / 1,25 | Evitar prompts longos no Haiku |
| Claude Fable 5.1 / Mythos 5.1 | 10 | 50 | 0,25 | 5 / 25 | Só casos excepcionais |

Outros pontos da mesma página:

- O desconto de lote (50%) se soma ao desconto de cache. Para a ingestão, que não precisa de resposta imediata, o lote corta o custo pela metade.
- A janela de 1 milhão de tokens é cobrada pelo preço normal a partir dos modelos 4.6, exceto no Haiku 5.5.
- Busca na web: US$ 10 por mil buscas, mais os tokens.
- Os modelos 4.7 em diante usam um tokenizador que gera cerca de 30% mais tokens para o mesmo texto.
- Opus 5.5, Sonnet 5.5 e Haiku 5.5 sempre usam raciocínio estendido, e esses tokens são cobrados como saída ([custos do Claude Code](https://code.claude.com/docs/en/costs)).

### 2.4 Recursos do Claude Code que servem a este projeto

| Recurso | Uso na ingestão | Documentação |
| --- | --- | --- |
| Subagentes e equipes de agentes | Prototipar o orquestrador e os agentes especializados. As equipes de agentes são experimentais, vêm desligadas e gastam cerca de 7 vezes mais tokens | [Custos](https://code.claude.com/docs/en/costs) |
| Hooks | Rodar o validador determinístico antes e depois das ferramentas; filtrar saídas grandes antes que entrem no contexto | [Custos](https://code.claude.com/docs/en/costs) |
| Skills | Empacotar o manual de preenchimento e os casos-modelo por tipo de evento; só carregam quando necessários | [Agent SDK](https://code.claude.com/docs/en/agent-sdk) |
| Sandbox, modos de permissão e devcontainer | Rodar agentes com o mínimo de privilégios | [Sandbox](https://code.claude.com/docs/en/sandboxing.md), [Permissões](https://code.claude.com/docs/en/permission-modes.md), [Devcontainer](https://code.claude.com/docs/en/devcontainer.md) |
| GitHub Actions e modo não interativo | Agente mantenedor que corrige coletores em CI, com chave de API | [GitHub Actions](https://code.claude.com/docs/en/github-actions.md) |
| Integração com o Chrome | Investigar sites oficiais que mudaram de layout, sem login | [Chrome](https://code.claude.com/docs/en/chrome.md) |
| Controle de custos | `/usage`, teto por execução (`--max-budget-usd`), limite de gasto por workspace no Console, exportação OpenTelemetry, relatório de gastos do Team | [Custos](https://code.claude.com/docs/en/costs) |

### 2.5 Quanto custa a ingestão em API (estimativa própria)

Premissas: cada ato passa por triagem, extração primária, revisão e extração independente; 20% dos atos vão ao reconciliador; o manual e os casos-modelo (cerca de 30 mil tokens) ficam em cache. O extrator independente usa outro fornecedor, cujo preço não foi confirmado nesta pesquisa.

| Etapa | Modelo | Premissa por ato | Tempo real (US$) | Lote (US$) |
| --- | --- | --- | --- | --- |
| Triador | Haiku 5.5 | 4 mil tokens de entrada, 700 de saída | 0,0008 | 0,0004 |
| Extrator primário | Opus 5.5 | 30 mil em cache + 3 mil novos; 5 mil de saída, com raciocínio | 0,118 | 0,059 |
| Revisor | Sonnet 5.5 | 30 mil em cache + 7 mil novos; 4 mil de saída | 0,057 | 0,029 |
| Extrator independente | Outro fornecedor | Ordem de grandeza (não confirmado) | ~0,09 | ~0,045 |
| Reconciliador | Opus 5.5 | 20% dos atos | 0,024 | 0,012 |
| **Total por ato** | | | **≈ 0,29** | **≈ 0,15** |

| Volume | US$ | R$ |
| --- | --- | --- |
| Piloto: 300 documentos × 5 rodadas | 220 a 430 | 1,2 mil a 2,4 mil |
| 10 mil atos | 1,4 mil a 2,9 mil | 7,9 mil a 15,9 mil |
| 100 mil atos | 14 mil a 29 mil | 79 mil a 159 mil |

- Triar mil atos com o Haiku 5.5 custa menos de US$ 1. Isso confirma a decisão do plano de descartar o irrelevante com um modelo pequeno antes de chamar os grandes.
- O agente mantenedor, que roda o Claude Code via Agent SDK, deve custar como um desenvolvedor ocasional (cerca de US$ 13 por dia ativo).
- Estes números servem para orçar. O piloto vai medir o custo real por categoria de documento, que é a métrica "custo por documento processado" do plano.

---

## 3. Alternativas de agentes de programação

| Ferramenta | Empresa | Preço de entrada | Planos maiores | O que faz bem | Pontos de atenção | Fonte |
| --- | --- | --- | --- | --- | --- | --- |
| **OpenAI Codex** | OpenAI | Plus US$ 20/mês; Business US$ 20/usuário/mês no anual (US$ 25 no mensal, mínimo de 2) | Pro de US$ 100, 200 ou 500; Enterprise e Edu sob consulta | Agente no terminal, na IDE, na web e no iOS; tarefas em nuvem em paralelo; revisão automática de PRs; integração com Slack; chave de API para CI | Limite estimado de mensagens a cada 5 h no Plus e no Business (ex.: GPT-6.1 Sol, 15 a 160); o Pro está sem limite de 5 h no momento; a OpenAI estima US$ 100 a 200 por desenvolvedor por mês em créditos; as páginas de preço da OpenAI não são consistentes entre si | [Preços do Codex](https://developers.openai.com/codex/pricing), [tabela de créditos](https://help.openai.com/en/articles/20001106-codex-rate-card-2) |
| **Cursor** | Anysphere, comprada pela SpaceX (concluída em 14/08/2026) | Plus US$ 8/mês, só com modelos Grok | Premium US$ 30, Super US$ 100, Ultra US$ 200; Teams a partir de US$ 30/usuário | IDE com agentes; Grok Build desde o Plus; agentes em nuvem, automações e Grok Bot a partir do Premium | Modelos de terceiros (Claude, GPT, Gemini) só a partir do Premium, cobrados à parte a preço de API; os planos mudaram depois da aquisição; a política de dados sob a nova dona não foi verificada | [cursor.com/cn/pricing](https://www.cursor.com/cn/pricing) (a página em inglês não pôde ser lida) |
| **GitHub Copilot** | GitHub (Microsoft) | Pro US$ 10/mês; Business US$ 19/assento/mês | Pro+ US$ 39, Max US$ 100, Enterprise US$ 39/assento | Integração nativa com o GitHub; agente em nuvem que abre PRs; revisão de código; catálogo com mais de 30 modelos (inclui Claude Sonnet 5.5, GPT-6 Sol e Gemini 4 Argon) | Cobrança por créditos de IA: 1.900 por usuário por mês no Business, compartilhados, e excedente a US$ 0,01 por crédito; não funciona no GitHub Enterprise Server | [Planos do Copilot](https://docs.github.com/en/copilot/get-started/plans) |
| **Devin** | Cognition | Pro US$ 20/mês (1 pessoa) | Max US$ 200; Teams com mínimo de US$ 80/mês (assento completo a US$ 40); Enterprise | Agente autônomo assíncrono na nuvem; integrações com Slack, Linear e MCP; revisão de PRs (Devin Review); DeepWiki; Devin Desktop | As cotas diárias e semanais não têm números públicos; o excedente vira crédito sob demanda | [Planos do Devin](https://docs.devin.ai/admin/billing/self-serve) |
| **Gemini Code Assist** | Google Cloud | Standard US$ 19/usuário/mês (12 meses) ou US$ 22,80 no mensal | Enterprise US$ 45 ou US$ 54 | Assistente na IDE e Gemini CLI com cota maior (1.500 pedidos por dia no Standard); integração com Google Cloud e BigQuery | — | [Preços do Gemini para Google Cloud](https://cloud.google.com/gemini/pricing) |
| **Jules** | Google | Grátis: 15 tarefas por dia, 3 simultâneas | Google AI Pro: 100 por dia, 15 simultâneas; Google AI Ultra: 300 por dia, 60 simultâneas | Agente assíncrono que trabalha no repositório e devolve PRs | Os planos pagos só funcionam com contas pessoais @gmail.com, então não servem para conta corporativa; preços do AI Pro (US$ 20) e do AI Ultra (a partir de US$ 100) vêm da imprensa (não confirmado) | [Limites do Jules](https://jules.google/docs/usage-limits/), [Engadget](https://engadget.com/2176060/the-google-ai-ultra-plan-now-starts-at-100-a-month) |
| **Gemini CLI** | Google | Grátis com login Google: 1.000 pedidos por dia, 60 por minuto | Cotas maiores com Code Assist | Agente de terminal open source | — | [Cotas do Gemini CLI](https://google-gemini.github.io/gemini-cli/docs/quota-and-pricing.html) |

**Leitura para o projeto**

1. **Claude Code como ferramenta principal**, por três motivos. O Agent SDK reaproveita o mesmo motor nos agentes da ingestão, então o time aprende uma ferramenta só. O Team tem termos empresariais e não treina com os dados por padrão. E os modelos Claude já vão ser usados no pipeline.
2. **Um segundo fornecedor ajuda em duas coisas:** revisão de código por outra família de modelos e redundância quando houver limite ou queda. O plano de ingestão já exige outro modelo no extrator independente, então vale o time se acostumar a ele. O Copilot Business (US$ 19) é o mais barato e reúne Claude, GPT e Gemini; o ChatGPT Business (US$ 20) traz o Codex. Os dois são trocas equivalentes.
3. **Devin e Jules** só fazem sentido para delegar tarefas pequenas e assíncronas. O Jules pago não atende conta corporativa.
4. **Cursor: evitar por enquanto.** Depois da compra pela SpaceX, os planos baratos só têm Grok, os modelos de terceiros passaram a ser cobrados à parte e a política de dados sob a nova controladora ainda não foi verificada.

---

## 4. Agentes que operam o computador ou o navegador

### 4.1 Visão geral

| Agente | Quem mantém | Open source | Custo | Maturidade | Risco principal documentado |
| --- | --- | --- | --- | --- | --- |
| Claude computer use (API) | Anthropic | Não (há uma demo de referência no GitHub) | Tokens: ~4.500 de sobrecarga por pedido + 1.000 a 1.800 por captura de tela | Ferramenta disponível sem cabeçalho beta; classes do SDK ainda em beta | Segue instruções escondidas no conteúdo; exige VM isolada e sem credenciais |
| Claude in Chrome | Anthropic | Não | Incluído nos planos pagos | Disponibilidade geral anunciada em 26/08/2026; o suporte ainda chama de beta | Injeção de prompt com sucesso abaixo de 0,08% em teste interno, "não é zero"; vê tudo nas abas |
| Agente do ChatGPT (antigo Operator) | OpenAI | Não | Substituído pelo ChatGPT Work com navegador em nuvem, nos planos pagos | Retirado em agosto de 2026 sem período de transição | A OpenAI diz que a injeção de prompt provavelmente nunca será totalmente resolvida |
| OpenClaw | OpenClaw Foundation | Sim (MIT) | Grátis + modelo + servidor | Muito popular, histórico de segurança ruim | Falhas críticas, centenas de milhares de instâncias expostas, skills maliciosas |
| Hermes Agent | Nous Research | Sim (MIT) | Grátis + modelo; Nous Portal opcional | Ainda na versão 0.x, com lançamentos frequentes | Proteções declaradamente parciais; instalação maliciosa via Docker exposto |
| Grok Bot ("Grokbot") | SpaceXAI, também distribuído pela Cursor | Não | Incluído em planos de US$ 30 a 300/mês | Beta inicial desde 11/08/2026 | Faz login nas contas do usuário; retenção de dados não documentada |

### 4.2 Detalhes por agente

**Claude computer use (API)**

- **O que é:** ferramenta da API em que o modelo recebe capturas de tela e controla mouse e teclado de um computador fornecido por você (VM ou contêiner).
- **Custo:** preço normal de tokens. O conjunto atual (`computer_toolset_20260801`) acrescenta cerca de 4.500 tokens de entrada por pedido, e cada captura de tela custa de 1.000 a 1.800 tokens. Estimativa própria: de US$ 1 a 3 por tarefa de 50 passos com o Opus 5.5. Um script determinístico faz a mesma coleta quase de graça.
- **Riscos e recomendações oficiais** ([documentação](https://platform.claude.com/docs/en/agents-and-tools/tool-use/computer-use-tool)): *"In some circumstances, Claude follows commands found in content even when they conflict with your instructions."* A Anthropic recomenda VM ou contêiner dedicado com privilégio mínimo, nenhum acesso a dados sensíveis ou logins, lista de domínios permitidos e confirmação humana para ações com consequência real. Classificadores automáticos procuram injeção nas capturas de tela, mas *"the precautions listed earlier remain important"*. Os dados da sessão ficam no seu ambiente.

**Claude in Chrome**

- **O que é:** extensão do Chrome que deixa o Claude navegar, clicar e preencher formulários nas abas do usuário. Também é usada pelo Claude Code e pelo Cowork.
- **Custo:** incluída nos planos Pro, Max, Ultra, Team e Enterprise, consumindo a cota do plano.
- **Riscos documentados** ([suporte](https://support.claude.com/en/articles/12902428-use-claude-in-chrome-safely)): *"The biggest risk facing browser-using AI tools is prompt injection attacks."* Com o Opus 4.8, a taxa de sucesso de ataque ficou abaixo de 0,08% nos testes internos, e a página diz *"The risk is not zero"*. Um ataque bem-sucedido pode levar à exfiltração de dados. O Claude tira capturas das abas ativas e não consegue filtrar conteúdo sensível. A Anthropic desaconselha o uso com contas financeiras, documentos jurídicos, dados de saúde e dados regulados.
- **Controles:** permissões por site, confirmação antes de ações de alto risco, pedido de permissão para sites financeiros, listas de sites permitidos e bloqueados pelo administrador no Team, e integração com 1Password para que senhas e códigos não entrem no contexto. A imprensa noticiou a disponibilidade geral em 26/08/2026 ([Gigazine](https://gigazine.net/gsc_news/en/20260827-claude-chrome-available/)).

**Agente do ChatGPT (antigo Operator)**

- **O que era:** o "agent mode", lançado em julho de 2025, juntou o Operator e o Deep Research e operava um computador virtual com navegador.
- **Situação:** retirado. Um usuário relatou a remoção no fórum oficial em 08/08/2026, e o suporte da OpenAI respondeu em 07/09/2026 que *"Work now has a separate cloud browser that can navigate interactive sites"* ([fórum da OpenAI](https://community.openai.com/t/agent-mode-was-removed-with-no-real-replacement/1389601)). A central de ajuda não pôde ser lida neste ambiente; fontes secundárias citam o aviso *"ChatGPT agent is no longer available"*.
- **Substituto e custo:** o ChatGPT Work está nos planos Plus, Pro, Business, Enterprise e Edu, e o navegador em nuvem só nos planos pagos, exceto Free e Go. A tabela de créditos do Business e do Enterprise ainda cobra 30 créditos por mensagem de "agent mode" ([tabela de créditos](https://help-lb.openai.com/en/articles/11481834)).
- **Riscos:** a própria OpenAI diz que a injeção de prompt é *"unlikely to ever be fully 'solved'"* e recomenda usar o modo deslogado quando possível, dar tarefas específicas (nunca algo como "leia meus e-mails e faça o que for preciso") e conferir cada confirmação antes de ações com consequência ([OpenAI, 22/12/2025](https://openai.com/index/hardening-atlas-against-prompt-injection)). A retirada sem transição também é um sinal de risco de fornecedor.

**OpenClaw**

- **O que é:** agente pessoal autônomo controlado por aplicativos de mensagem (Signal, Telegram, Discord). Roda localmente, conecta-se a um modelo externo (Claude, GPT, DeepSeek e outros) e executa tarefas por meio de "skills", pastas com um arquivo SKILL.md, que podem vir de um registro público chamado ClawHub.
- **Quem mantém:** a OpenClaw Foundation, sem fins lucrativos, criada depois que o autor, Peter Steinberger, anunciou que iria para a OpenAI (14/02/2026). O projeto já se chamou Warelay, Clawdbot e Moltbot. A versão 2.0 (v2026.8.1) saiu em 30/08/2026 ([Wikipedia](https://en.wikipedia.org/wiki/OpenClaw)).
- **Custo:** software gratuito sob licença MIT. Paga-se o modelo e a máquina.
- **Riscos documentados:**
  - **CVE-2026-25253** (divulgada em 03/02/2026): execução remota de código com um clique. Uma página maliciosa fazia a interface de controle entregar o token de autenticação ao atacante, que então desligava as confirmações e escapava do sandbox. Corrigida na versão 2026.1.29 ([ProArch](https://www.proarch.com/blog/threats-vulnerabilities/openclaw-rce-vulnerability-cve-2026-25253)).
  - **Quatro falhas encadeáveis** achadas pela Cyera e corrigidas em 23/04/2026: CVE-2026-44112 (CVSS 9,6), CVE-2026-44115 (8,8), CVE-2026-44118 (7,8) e CVE-2026-44113 (7,7). Partindo de um plugin malicioso ou de uma injeção de prompt, a cadeia chega à exfiltração de credenciais, ao controle total do agente e à persistência ([Cyber Security News](https://cybersecuritynews.com/openclaw-chain-vulnerabilities/)).
  - **Instâncias expostas:** mais de 135 mil e depois mais de 220 mil acessíveis pela internet em fevereiro de 2026 (SecurityScorecard, via [Hackmag](https://hackmag.com/news/openclaw-open)); cerca de 245 mil em maio (Shodan e ZoomEye). A porta padrão 18789 escutava em todas as interfaces de rede.
  - **Skills maliciosas:** a equipe de segurança de IA da Cisco encontrou uma skill de terceiros que exfiltrava dados e fazia injeção de prompt sem o usuário perceber.
  - **Versão 2.0** (segundo o The Register, via Wikipedia): sessões compartilhadas sem fronteiras de rede ou de arquivos, cofre de segredos sem criptografia em repouso e sandbox desligado por padrão.
  - Um mantenedor disse que, para quem não sabe usar a linha de comando, o projeto é *"far too dangerous"*. A China restringiu o uso em órgãos públicos e estatais em março de 2026.
  - A Decrypt cita um agente OpenClaw que explorou a API de uma academia para cancelar a reserva de outro aluno ([Decrypt](https://decrypt.co/375490/spacexai-grok-bot-do-job-needs-access-accounts)).

**Hermes Agent**

- **O que é:** agente pessoal que roda na sua máquina ou servidor, cria e melhora as próprias skills a partir da experiência, tem memória persistente, agendador, subagentes, mais de 60 ferramentas, funciona como cliente e servidor MCP, e tem um gateway para Telegram, Discord, Slack, WhatsApp, Signal e e-mail.
- **Quem mantém:** Nous Research, sob licença MIT, com cerca de 260 mil estrelas no GitHub ([repositório](https://github.com/NousResearch/hermes-agent)). A primeira versão pública (v0.2.0) saiu em 12/03/2026 e a v0.21.6 em 08/10/2026 ([Parallel](https://parallel.ai/articles/what-is-hermes-agent), fonte secundária).
- **Custo:** gratuito; paga-se o modelo (OpenRouter, OpenAI, Anthropic, modelos locais ou qualquer endpoint compatível). O Nous Portal, opcional, tem planos de US$ 0, 20, 100 e 200 por mês (não confirmado).
- **Controles e limites, segundo a documentação oficial** ([segurança](https://hermes-agent.nousresearch.com/docs/user-guide/security/), [máquina de trabalho](https://hermes-agent.nousresearch.com/docs/guides/secure-hermes-on-a-work-machine)):
  - O modo de aprovação padrão ("smart") usa um modelo auxiliar para julgar o risco de cada comando. O modo "manual" pede aprovação para todo comando perigoso. A opção `--yolo` desliga as checagens, mantendo só uma lista mínima de bloqueio.
  - As proteções de escrita são *"Defense-in-depth, not a hard boundary"* e *"do not sandbox a hostile or compromised agent"*. A ferramenta de terminal roda com o mesmo usuário do sistema e consegue ler caminhos bloqueados.
  - O detector de injeção em arquivos de contexto usa *"heuristics, not semantic intent detection"*.
  - O gateway nega todos por padrão, e liberar todos os usuários é desaconselhado.
  - Para máquinas de trabalho: *"The strongest isolation is not running commands on your machine at all"*. A recomendação é usar um backend Docker, SSH ou sandbox na nuvem, não repassar segredos ao contêiner e usar o modo manual.
- **Incidentes (fonte secundária):** a botnet "Carbonato" (28/09/2026) instalou o Hermes em servidores com Docker exposto na porta 2375; a falha era o Docker aberto, não o Hermes. Também apareceram repositórios falsos de "instalador em um clique" no GitHub.

**Grok Bot ("Grokbot")**

- **O que é:** agente da SpaceXAI que roda num computador próprio na nuvem, entra nas ferramentas e sites com as contas do usuário, opera aplicativos sem API, guarda rotinas, permite vários bots que conversam entre si e continua trabalhando com o computador do usuário desligado. Não confundir com a conta @grok do X.
- **Quem mantém:** SpaceXAI, nome dado pela imprensa à xAI depois da fusão com a SpaceX. É distribuído também pela Cursor, que a SpaceX comprou por US$ 60 bilhões em ações (anúncio em 16/06/2026, conclusão em 14/08/2026, segundo a [imprensa](https://wwwhatsnew.com/2026/08/17/spacex-compra-cursor-60000-millones-mayor-startup-ma-2026/)). Código fechado.
- **Custo:** no lançamento, vinha incluído na SuperGrok Heavy (US$ 300/mês), no Cursor Ultra (US$ 200/mês) e no Cursor Teams Premium (US$ 120/usuário/mês) ([Gigazine](https://gigazine.net/gsc_news/en/20260812-spacexai-grok-bot/)). A página atual da Cursor o inclui a partir do plano Premium (US$ 30/mês). Avulso, custaria US$ 200/mês depois de 14 dias de teste ([Vellum](https://www.vellum.ai/blog/official-grok-bot-breakdown); não confirmado).
- **Maturidade:** beta inicial lançado em 11/08/2026 para Windows, macOS e iOS; acesso para empresas por lista de espera.
- **Riscos:**
  - Exige *"access to online accounts, internal communications, sensitive business data, and credentials"* ([Decrypt](https://decrypt.co/375490/spacexai-grok-bot-do-job-needs-access-accounts)).
  - Vários bots dividem o mesmo computador: *"Bot boundaries aren't security boundaries"*. A retenção de dados e a memória não estão documentadas publicamente ([Vellum](https://www.vellum.ai/blog/official-grok-bot-breakdown), concorrente).
  - A Cybernews noticiou que Elon Musk incentivou usuários a dar dados de cartão ao Grok Bot enquanto a política de privacidade mudava (a matéria não abriu; não confirmado).
  - Controles existentes: permitir uma vez, negar ou sempre permitir cada ação, regras de revisão e devolução do controle ao usuário em passos sensíveis.

### 4.3 Riscos que se repetem

1. **Injeção de prompt.** Todos os fornecedores reconhecem que um texto escondido numa página, imagem ou arquivo pode desviar o agente, e nenhum promete eliminar o risco.
2. **Acesso a credenciais.** Esses agentes enxergam tudo o que estiver na tela ou no sistema de arquivos. O OpenClaw guarda segredos sem criptografia, o terminal do Hermes roda com o usuário do sistema e o Grok Bot entra nas contas do usuário.
3. **Instâncias expostas e falhas de software.** No OpenClaw, uma instalação padrão ficava acessível pela internet, e falhas de execução remota permitiram tomar o controle da máquina.
4. **Cadeia de suprimentos.** Skills e plugins de terceiros sem curadoria, além de instaladores falsos.
5. **Ações destrutivas.** A Decrypt cita um agente da Cursor, usando o Claude Opus, que apagou o banco de produção de uma startup e os backups com uma única chamada de API.
6. **Risco de fornecedor.** Produtos em beta, retirados sem transição ou com políticas de dados não documentadas.

### 4.4 Regras para o projeto

1. **Separar privilégios no pipeline.** Extrator, revisor e reconciliador recebem só texto e devolvem JSON, sem navegador, shell ou rede. Assim, uma instrução escondida num PDF de diário oficial não consegue disparar nenhuma ação. Os coletores são código determinístico, escrito e mantido por agentes, mas sem modelo de linguagem decidindo o que fazer durante a coleta.
2. **Nenhum agente de computer use**, nem os open source, em máquina que tenha certificado digital (e-CNPJ ou e-CPF), conta gov.br ou e-CAC, credenciais de produção ou dados de clientes dos contadores. Esses dados estão sob a LGPD, que exige medidas de segurança contra acesso não autorizado (art. 46 da Lei 13.709/2018).
3. **Navegação por agente só em VM ou contêiner descartável,** sem login, sem segredos, com lista de domínios permitidos (sites oficiais) e aprovação manual de ações. O uso que faz sentido é o mantenedor investigando um site oficial que mudou de layout, ou testes da interface do assistente em homologação.
4. **OpenClaw e Grok Bot: não usar no projeto.** Hermes: só para pesquisa, em sandbox (backend Docker ou na nuvem, aprovação manual, gateway em localhost, nenhum segredo repassado).
5. **Segredos em cofre,** com rotação e escopo mínimo. Uma chave de API por agente, cada uma com teto de gasto.
6. **Skills e plugins só de fontes revisadas,** com versão fixa.
7. **Registrar tudo** (logs e rastros) e exigir revisão humana para qualquer ação irreversível: exclusão, publicação em produção ou pagamento.

---

## 5. Ferramentas de apoio à operação

### 5.1 Observabilidade e avaliação de modelos

| Ferramenta | Grátis | Primeiro plano pago | Destaques | Atenção | Fonte |
| --- | --- | --- | --- | --- | --- |
| **Langfuse** | Hobby: 50 mil unidades por mês, 30 dias de dados, 2 usuários | Core US$ 29/mês: 100 mil unidades, US$ 8 por 100 mil extras, 90 dias; Pro US$ 199: 3 anos de dados | Open source e auto-hospedável de graça; rastreamento, gestão de prompts e avaliações | — | [langfuse.com/pricing](https://langfuse.com/pricing.md) |
| **LangSmith** | Developer: 1 assento, 5 mil rastros por mês | Plus US$ 39/assento/mês, com 10 mil rastros | Integração com LangChain e LangGraph; inclui uma implantação serverless pequena de agente | Rastros básicos guardados por só 14 dias; o preço por mil rastros extras não aparece na página | [langchain.com/langsmith-pricing](https://www.langchain.com/langsmith-pricing) |
| **Braintrust** | Starter: 1 GB por mês, 10 mil avaliações, 14 dias | Pro US$ 249/mês: 5 GB, 50 mil avaliações, 30 dias | Avaliações e comparação de prompts e modelos | Caro para a fase atual; a página foi lida numa prévia da documentação | [braintrust.dev/docs/plans-and-limits](https://www.braintrust.dev/docs/plans-and-limits) |
| **Helicone** | Hobby grátis | Pro US$ 79, Team US$ 799 (fonte secundária) | Gateway e observabilidade | Comprada pela Mintlify; em modo de manutenção desde 03/03/2026. Evitar em projeto novo | [Blog da Helicone](https://www.helicone.ai/blog/joining-mintlify), [PricingSaaS](https://pricingsaas.com/companies/helicone) |

### 5.2 Filas e workflows duráveis

| Ferramenta | Grátis | Primeiro plano pago | Destaques | Fonte |
| --- | --- | --- | --- | --- |
| **Inngest** | Free: 50 mil execuções por mês, 5 etapas simultâneas, histórico de 24 h | Pro a partir de US$ 99/mês: 1 milhão de execuções, 100 etapas simultâneas, 7 dias de histórico; US$ 50 por milhão extra | Funções em etapas com nova tentativa automática e controle de concorrência; open source e auto-hospedável. Cada etapa conta como uma execução | [inngest.com/pricing](https://www.inngest.com/pricing) |
| **Temporal Cloud** | Developer: sem mensalidade; US$ 50 por milhão de ações + 10% do gasto de uso | Business: mínimo de US$ 500/mês, com 2,5 milhões de ações | Padrão de mercado para workflows longos; servidor open source auto-hospedável (licença não verificada) | [docs.temporal.io/cloud/pricing](https://docs.temporal.io/cloud/pricing.md) |
| **Fila no próprio PostgreSQL** | Zero | — | Menos peças durante o piloto (ex.: bibliotecas open source como pg-boss ou Graphile Worker) | — |

### 5.3 Navegadores headless para coleta legítima

| Ferramenta | Grátis | Primeiro plano pago | Destaques | CAPTCHA | Fonte |
| --- | --- | --- | --- | --- | --- |
| **Browserbase** | 1 h por mês, 3 sessões simultâneas | Developer US$ 20/mês: 100 h, US$ 0,12 por hora extra, 25 sessões; Startup US$ 99: 500 h | Navegador isolado, fora da rede do projeto | Anuncia resolução de CAPTCHA nos planos pagos. **Não será usada**; deve ficar desativada | [docs.browserbase.com](https://docs.browserbase.com/account/billing/plans) |
| **Browserless** | 1.000 unidades por mês (1 unidade = até 30 s de navegador) | Prototyping US$ 35 (US$ 25 no anual), 20 mil unidades; Starter US$ 200 (US$ 140 no anual) | Imagem Docker open source sob SSPL-1.0; produto comercial de código fechado exige licença comercial | Anuncia resolução automática de CAPTCHA em todos os planos. **Não será usada** | [browserless.io/pricing](https://browserless.io/pricing.md) |
| **Playwright no próprio contêiner** | Zero | — | Suficiente para a maioria das fontes oficiais, que entregam HTML, XML ou PDF | — | — |

### 5.4 O que usar

- **Observabilidade:** Langfuse Core, ou Langfuse auto-hospedado. Ele cobre a métrica de custo por documento e serve para comparar extratores. LangSmith só se o time adotar LangGraph.
- **Fila:** Inngest Free no piloto, depois Pro, ou uma fila no PostgreSQL. Temporal Cloud Business é demais para a fase atual.
- **Navegador:** Playwright no próprio contêiner. Browserbase Developer só se quiserem isolar a navegação fora da rede do projeto.
- **Evitar:** Helicone, que está em modo de manutenção.

---

## 6. Fontes com CAPTCHA: alternativas legítimas

**Fora de escopo:** este relatório não pesquisa nem recomenda ferramentas para resolver ou contornar CAPTCHA. Browserbase e Browserless anunciam essa função; ela fica registrada como não utilizada e deve permanecer desativada. Um CAPTCHA indica que o órgão não quer acesso automatizado por aquele canal, e a resposta é procurar outro canal.

**Ordem de tentativa**

| # | Alternativa | Como funciona | Prazo | Custo | Quando usar |
| --- | --- | --- | --- | --- | --- |
| 1 | **API ou serviço oficial** | INLABS (DOU completo em XML, gratuito desde 2020), LexML (URNs e metadados), Querido Diário (diários municipais com API), portais de dados abertos (dados.gov.br, Senado, Câmara). Alguns diários estaduais e municipais vendem assinatura ou serviço de dados; verificar caso a caso | Imediato | Em geral gratuito | Sempre como primeira opção |
| 2 | **Outra fonte oficial com o mesmo ato** | O mesmo texto publicado em outro veículo oficial sem CAPTCHA: convênios do CONFAZ e ementas de Soluções de Consulta saem no DOU; decretos estaduais saem no Diário Oficial do Estado; leis estão na Assembleia ou na Casa Civil; há a compilação do Planalto e os diários de associações de municípios | Imediato | Zero | Quando só o portal "amigável" tem CAPTCHA |
| 3 | **Pedido pela Lei de Acesso à Informação** ([Lei 12.527/2011](https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2011/lei/l12527.htm)) | Pedido pelo [Fala.BR](https://falabr.cgu.gov.br) (órgãos federais) ou pelo e-SIC do estado ou município. Pedir os dados em formato aberto e legível por máquina e, se for o caso, um canal de acesso automatizado. O art. 8º, § 3º, II e III, manda os sites oficiais permitirem relatórios em formatos abertos e "o acesso automatizado por sistemas externos em formatos abertos, estruturados e legíveis por máquina". Não é preciso justificar o pedido (art. 10, § 3º) | Até 20 dias, prorrogáveis por mais 10 (art. 11) | Gratuito, salvo custo de reprodução (art. 12) | Carga histórica (ex.: todo o acervo de respostas a consultas) e base legal para pedir um canal de máquina |
| 4 | **Pedido formal de acesso ou convênio** | Ofício à Sefaz, ao tribunal administrativo ou à prefeitura pedindo API, arquivo em lote ou liberação do robô identificado; para uso recorrente, acordo de cooperação técnica ou termo de uso de dados | Semanas a meses | Em geral zero; às vezes contrato | Fontes de alto volume e uso contínuo (RICMS, respostas a consultas, TIT) |
| 5 | **Coleta pontual por uma pessoa** | Um operador baixa o documento manualmente, resolvendo o CAPTCHA como qualquer usuário, e o registra no pipeline com hash, URL e data de coleta, como manda o princípio do original imutável | Sob demanda | Horas de trabalho | Volume baixo, casos isolados e urgências, enquanto 3 e 4 não saem |

**Boas práticas de coleta legítima**

- Respeitar o robots.txt e os termos de uso de cada site.
- Identificar o robô no User-Agent, com um e-mail de contato.
- Limitar a taxa de pedidos por fonte e preferir horários de pouco movimento.
- Usar pedidos condicionais e cache, para não baixar de novo o que não mudou.
- Não usar proxies para escapar de bloqueios. Se a fonte bloquear, o coletor para e escala o caso para a fila humana, como já prevê o plano.

---

## 7. Stack recomendada para os 12 meses de desenvolvimento

Os cenários abaixo consideram 3 desenvolvedores e o fundador. A seção 7.3 traz os totais para 2 e 4 desenvolvedores.

### 7.1 Versão enxuta

| Item | Para quê | US$/mês (anual) | US$/mês (mensal) | Fonte |
| --- | --- | --- | --- | --- |
| Claude Team, 3 assentos Premium | Claude Code diário dos desenvolvedores | 300 | 375 | [suporte: Team](https://support.claude.com/en/articles/9266767-what-is-the-team-plan) |
| Claude Team, 1 assento Standard | Fundador: chat, Cowork, leitura e revisão de fichas | 20 | 25 | idem |
| Langfuse Cloud Core | Rastrear as chamadas de modelo do pipeline e o custo por documento | 29 | 29 | [langfuse.com/pricing](https://langfuse.com/pricing.md) |
| Inngest Free ou fila no PostgreSQL | Fila durável | 0 | 0 | [inngest.com/pricing](https://www.inngest.com/pricing) |
| Playwright no próprio contêiner | Coletores | 0 | 0 | — |
| **Total** | | **349 (R$ 1.917)** | **429 (R$ 2.357)** | |

### 7.2 Versão confortável

| Item | Para quê | US$/mês (anual) | US$/mês (mensal) | Fonte |
| --- | --- | --- | --- | --- |
| Claude Team, 3 assentos Premium | Claude Code diário | 300 | 375 | [suporte: Team](https://support.claude.com/en/articles/9266767-what-is-the-team-plan) |
| Claude Team, 1 assento Standard | Fundador | 20 | 25 | idem |
| Créditos de uso extra do Claude (teto de US$ 50 por dev) | Não parar quando a cota acabar | 150 | 150 | idem |
| GitHub Copilot Business, 3 assentos | Segundo agente, revisão de PR por outros modelos, acesso a GPT e Gemini (troca equivalente: ChatGPT Business, US$ 20) | 57 | 57 | [Planos do Copilot](https://docs.github.com/en/copilot/get-started/plans) |
| Langfuse Cloud Pro | 3 anos de rastros, útil para auditoria | 199 | 199 | [langfuse.com/pricing](https://langfuse.com/pricing.md) |
| Inngest Pro | Fila durável com 1 milhão de execuções e 100 etapas simultâneas | 99 | 99 | [inngest.com/pricing](https://www.inngest.com/pricing) |
| Browserbase Developer | Navegação isolada fora da rede do projeto (CAPTCHA desativado) | 20 | 20 | [docs.browserbase.com](https://docs.browserbase.com/account/billing/plans) |
| **Total** | | **845 (R$ 4.642)** | **925 (R$ 5.081)** | |

### 7.3 Totais por tamanho de time

| Desenvolvedores | Enxuta, anual | Enxuta, mensal | Confortável, anual | Confortável, mensal |
| --- | --- | --- | --- | --- |
| 2 | US$ 249 (R$ 1.368) | US$ 304 (R$ 1.670) | US$ 676 (R$ 3.714) | US$ 731 (R$ 4.016) |
| 3 | US$ 349 (R$ 1.917) | US$ 429 (R$ 2.357) | US$ 845 (R$ 4.642) | US$ 925 (R$ 5.081) |
| 4 | US$ 449 (R$ 2.467) | US$ 554 (R$ 3.043) | US$ 1.014 (R$ 5.570) | US$ 1.119 (R$ 6.147) |

Em 12 meses, com 3 desenvolvedores e cobrança anual: **US$ 4.188 (R$ 23.007)** na enxuta e **US$ 10.140 (R$ 55.704)** na confortável.

Se o orçamento for muito apertado, o piso é o Claude Pro (US$ 17 a 20) por desenvolvedor, aceitando interrupções frequentes por limite de uso. Não recomendado para trabalho em tempo integral.

### 7.4 Custo variável de API (fora das assinaturas)

| Item | US$/mês | R$/mês |
| --- | --- | --- |
| Reserva de API nos primeiros meses (piloto e fase federal: Claude e o fornecedor do extrator independente) | 300 a 1.500 | 1.648 a 8.240 |
| Enxuta + reserva de API | 649 a 1.849 | 3.565 a 10.157 |
| Confortável + reserva de API | 1.145 a 2.345 | 6.290 a 12.882 |

- O piloto de 300 documentos cabe na ponta de baixo. A carga histórica federal (dezenas de milhares de atos) pode passar da ponta de cima por alguns meses (ver a seção 2.5).
- O Team inclui até US$ 500/mês em créditos de API compartilhados, que podem abater parte dessa reserva (condições não confirmadas; não descontado acima).
- Para controlar: limite de gasto por workspace no Console da Anthropic, uma chave por agente, processamento em lote e o controlador de custos previsto no plano.

### 7.5 Câmbio, impostos e forma de compra

- **Câmbio:** PTAX de 3/11/2026, R$ 5,4935, dado do Banco Central publicado por [Numerando](https://numerando.com.br/dolar-hoje) e [Calcula Centro](https://calculacentro.com/indices/dolar). A série oficial está nos [dados abertos do BCB](https://dadosabertos.bcb.gov.br/dataset/dolar-americano-usd-todos-os-boletins-diarios). A PTAX de 4/11 não tinha sido capturada no momento da pesquisa. O câmbio oscilou bastante depois da eleição: a PTAX de venda foi de R$ 5,3420 em 28/10, e o dólar comercial chegou à máxima de R$ 5,6049 em 26/10 ([fonte](https://gameoverdrive.com.br/dolar-hoje-29-10-2026-reeleicao-lula/)). Cada R$ 0,10 a mais no dólar acrescenta cerca de R$ 35/mês à stack enxuta e R$ 85/mês à confortável.
- **IOF:** pagamento com cartão brasileiro no exterior tem IOF de 3,5% (alíquota fixada em 2025 pelo Decreto 12.466/2025 e alterações, não reconfirmada nesta pesquisa), além do spread do banco sobre a PTAX. Com IOF, a enxuta vai a cerca de R$ 1.984/mês e a confortável a R$ 4.804/mês.
- **Tributos sobre importação de serviços:** dependendo de como a empresa paga, pode haver IRRF, CIDE, PIS/Cofins-Importação e ISS. Isso não está incluído e deve ser validado pelo contador da empresa.
- **Anual ou mensal:** começar no mensal durante o piloto (1 a 2 meses) e passar ao anual quando o time estiver estável. No anual, pode não ser possível reduzir assentos no meio do contrato; isso está confirmado para o Enterprise self-serve, mas não para o Team. O Ultra só tem cobrança mensal.

### 7.6 O que ficou de fora e por quê

| Ferramenta | Motivo |
| --- | --- |
| Cursor | Sobrepõe-se ao Claude Code; desde a compra pela SpaceX, modelos de terceiros são cobrados à parte e a governança de dados não foi verificada |
| Devin | Sobrepõe-se ao Claude Code e ao agente em nuvem do Copilot. O Pro (US$ 20) é barato para testar tarefas assíncronas |
| Jules | Planos pagos só para contas pessoais @gmail.com |
| Claude Max ou Ultra individuais | Preço parecido com o Team Premium, mas com termos de consumidor (treinamento opt-out) e sem administração central |
| Claude Enterprise | Mínimo de 20 assentos |
| Grok Bot, OpenClaw, Hermes | Risco de segurança perto de dados sensíveis (seção 4). Hermes, só para pesquisa em sandbox |
| LangSmith Plus, Braintrust Pro | Bons, mas mais caros que o Langfuse para a fase atual |
| Helicone | Em modo de manutenção |
| Temporal Cloud Business | Mínimo de US$ 500/mês; desproporcional para o piloto |

---

## 8. O que não foi possível confirmar

- **Anthropic:** a página claude.com/pricing não abriu neste ambiente; os preços vieram de claude.com/max e do suporte oficial. As condições dos créditos de API do Team ("up to $500", com nota de rodapé) não foram lidas. Não foi confirmado se o Team anual permite reduzir assentos no meio do contrato.
- **OpenAI:** a central de ajuda sobre o ChatGPT agent não abriu; a retirada está confirmada pelo fórum oficial e por fontes secundárias. As páginas de preço da OpenAI se contradizem (uma ainda mostra o plano "Team"). Os preços de API dos modelos GPT, para o extrator independente, não foram verificados. A política de treinamento do ChatGPT Business não foi verificada.
- **Google:** os preços do Google AI Pro (US$ 20) e do AI Ultra (a partir de US$ 100) vêm da imprensa (Engadget, 19/05/2026). A página de preços do Gemini Code Assist foi lida num espelho oficial do Google.
- **Cursor:** só a versão em chinês da página de preços abriu. A política de dados depois da aquisição não foi verificada.
- **Grok Bot:** a ajuda oficial da Cursor não abriu. O preço avulso (US$ 200) vem da Vellum, uma concorrente. A matéria da Cybernews sobre a política de privacidade não abriu.
- **OpenClaw:** a documentação oficial de segurança não abriu. O número de estrelas vem da imprensa. A notícia de que 12% do ClawHub estaria comprometido veio de uma fonte fraca e foi descartada.
- **Hermes:** datas de versões, preços do Nous Portal e o incidente da botnet vêm de fonte secundária (Parallel).
- **Ferramentas de apoio:** preços do Helicone de fonte secundária (PricingSaaS); Braintrust lido numa prévia da documentação; licença do servidor Temporal não verificada; preço por mil rastros extras do LangSmith não exibido.
- **Brasil:** a alíquota de IOF (3,5%) não foi reconfirmada para novembro de 2026; a PTAX de 4/11 não foi capturada; os artigos da LAI e da LGPD foram citados do texto da lei, sem nova leitura nesta sessão.
- **Estimativas próprias:** custo por ato da ingestão e custo de tarefa de computer use. Devem ser calibrados no piloto.
- A cota de buscas da sessão acabou na fase final, e alguns desses itens ficaram sem uma segunda checagem.

---

## 9. Fontes

**Anthropic**
- [Planos Max, Ultra, Pro, Team e Enterprise (claude.com/max)](https://claude.com/max)
- [Planos individuais (suporte)](https://support.claude.com/en/articles/11049762)
- [Plano Ultra (suporte)](https://support.claude.com/en/articles/17728952)
- [Plano Team (suporte)](https://support.claude.com/en/articles/9266767-what-is-the-team-plan)
- [Enterprise por uso (suporte)](https://support.claude.com/en/articles/11526368-usage-based-enterprise-plans)
- [Claude Code com Pro ou Max (suporte)](https://support.claude.com/en/articles/11145838-use-claude-code-with-your-pro-or-max-plan)
- [Claude Code com Team ou Enterprise (suporte)](https://support.claude.com/en/articles/11845131)
- [Preços da API](https://platform.claude.com/docs/en/about-claude/pricing)
- [Claude Agent SDK](https://code.claude.com/docs/en/agent-sdk)
- [Custos do Claude Code](https://code.claude.com/docs/en/costs)
- [Ferramenta de computer use](https://platform.claude.com/docs/en/agents-and-tools/tool-use/computer-use-tool)
- [Uso seguro do Claude in Chrome](https://support.claude.com/en/articles/12902428-use-claude-in-chrome-safely)
- [Disponibilidade geral do Claude in Chrome (Gigazine)](https://gigazine.net/gsc_news/en/20260827-claude-chrome-available/)
- [Troca do Max 20x pelo Ultra (Latenode)](https://latenode.com/pt-br/news/anthropic-troca-claude-max-20x-por-ultra-a-us-200-mes)

**Agentes de programação**
- [Preços do Codex](https://developers.openai.com/codex/pricing)
- [Tabela de créditos do Codex](https://help.openai.com/en/articles/20001106-codex-rate-card-2)
- [Tabela de créditos do ChatGPT Business e Enterprise](https://help-lb.openai.com/en/articles/11481834)
- [Preços da Cursor](https://www.cursor.com/cn/pricing)
- [Compra da Cursor pela SpaceX (wwwhatsnew)](https://wwwhatsnew.com/2026/08/17/spacex-compra-cursor-60000-millones-mayor-startup-ma-2026/)
- [Compra da Cursor: guia para desenvolvedores (Developers Digest)](https://www.developersdigest.tech/blog/spacex-cursor-acquisition-developer-guide-2026)
- [Planos do GitHub Copilot](https://docs.github.com/en/copilot/get-started/plans)
- [Planos do Devin](https://docs.devin.ai/admin/billing/self-serve)
- [Preços do Gemini para Google Cloud](https://cloud.google.com/gemini/pricing)
- [Limites do Jules](https://jules.google/docs/usage-limits/)
- [Cotas do Gemini CLI](https://google-gemini.github.io/gemini-cli/docs/quota-and-pricing.html)
- [Novo preço do Google AI Ultra (Engadget)](https://engadget.com/2176060/the-google-ai-ultra-plan-now-starts-at-100-a-month)

**Agentes de computer use e segurança**
- [OpenAI: injeção de prompt no Atlas](https://openai.com/index/hardening-atlas-against-prompt-injection)
- [Fórum da OpenAI: retirada do agent mode](https://community.openai.com/t/agent-mode-was-removed-with-no-real-replacement/1389601)
- [O que substituiu o ChatGPT agent (Omid Saffari)](https://omidsaffari.com/blog/chatgpt-agent-retired)
- [OpenClaw (Wikipedia)](https://en.wikipedia.org/wiki/OpenClaw)
- [CVE-2026-25253 (ProArch)](https://www.proarch.com/blog/threats-vulnerabilities/openclaw-rce-vulnerability-cve-2026-25253)
- [Cadeia de falhas do OpenClaw (Cyber Security News)](https://cybersecuritynews.com/openclaw-chain-vulnerabilities/)
- [Instâncias expostas do OpenClaw (Hackmag)](https://hackmag.com/news/openclaw-open)
- [Hermes Agent (GitHub)](https://github.com/NousResearch/hermes-agent)
- [Segurança do Hermes Agent](https://hermes-agent.nousresearch.com/docs/user-guide/security/)
- [Hermes em máquina de trabalho](https://hermes-agent.nousresearch.com/docs/guides/secure-hermes-on-a-work-machine)
- [O que é o Hermes Agent (Parallel)](https://parallel.ai/articles/what-is-hermes-agent)
- [Lançamento do Grok Bot (Gigazine)](https://gigazine.net/gsc_news/en/20260812-spacexai-grok-bot/)
- [Grok Bot e acesso a contas (Decrypt)](https://decrypt.co/375490/spacexai-grok-bot-do-job-needs-access-accounts)
- [Análise do Grok Bot (Vellum)](https://www.vellum.ai/blog/official-grok-bot-breakdown)

**Ferramentas de apoio**
- [Preços do Langfuse](https://langfuse.com/pricing.md)
- [Preços do LangSmith](https://www.langchain.com/langsmith-pricing)
- [Planos do Braintrust](https://www.braintrust.dev/docs/plans-and-limits)
- [Helicone se junta à Mintlify](https://www.helicone.ai/blog/joining-mintlify)
- [Preços do Helicone (PricingSaaS)](https://pricingsaas.com/companies/helicone)
- [Preços do Temporal Cloud](https://docs.temporal.io/cloud/pricing.md)
- [Preços do Inngest](https://www.inngest.com/pricing)
- [Planos do Browserbase](https://docs.browserbase.com/account/billing/plans)
- [Preços do Browserless](https://browserless.io/pricing.md)

**Brasil**
- [Lei de Acesso à Informação (Lei 12.527/2011)](https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2011/lei/l12527.htm)
- [Fala.BR](https://falabr.cgu.gov.br)
- [Dólar hoje: PTAX do BCB (Numerando)](https://numerando.com.br/dolar-hoje)
- [Dólar PTAX mensal (Calcula Centro)](https://calculacentro.com/indices/dolar)
- [Dados abertos do BCB: dólar, boletins diários](https://dadosabertos.bcb.gov.br/dataset/dolar-americano-usd-todos-os-boletins-diarios)
- [Câmbio após a eleição (Game Over Drive)](https://gameoverdrive.com.br/dolar-hoje-29-10-2026-reeleicao-lula/)

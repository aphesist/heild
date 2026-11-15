# S1 · Como funcionam os "times de agentes" (OpenBot, Hermes, Grok Bot, OpenClaw)

Pesquisa de 7/11/2026 para o [Desenho do Sistema](../../planos/Desenho_do_Sistema.md), seção 5. Sessão filha mais leitura direta de openbot.run e do repositório.

## Quem é quem

| Produto | O que é | Licença e origem |
| --- | --- | --- |
| **OpenBot** ([openbot.run](https://openbot.run/), [repositório](https://github.com/nightly-labs/openbot)) | App de desktop (Electron) e servidor, "local-first", que roda **um time de agentes persistentes** usando os provedores que o usuário já paga (Codex, Claude Code, Gemini, Grok CLI, Hermes, OpenCode, Cursor, Cline, endpoints compatíveis com OpenAI, Ollama) via ACP. Cada agente tem papel, instruções, workspace, conversa, fila e contexto próprios; agentes trocam mensagens e arquivos entre si; canais compartilhados com pessoas ("multiplayer"); rotinas (agenda) e workflows com etapas de aprovação; compaction automática por agente; filas FIFO persistentes; navegador embutido; importa agentes do Grok Bot e do Hermes. | Synthetify Labs (Polônia). PolyForm Noncommercial 1.0.0 (até 0.1.11 era Apache-2.0); uso comercial exige licença (Starter ou Team) |
| **Hermes Agent** ([Nous Research](https://github.com/NousResearch/hermes-agent)) | Agente pessoal em Python com gateway (WhatsApp, Telegram, Slack...), memória em arquivos com limite, skills auto-criadas, cron, delegação | MIT |
| **Grok Bot** ([xAI](https://docs.x.ai/grok-bot/how-grok-bot-works)) | Produto fechado: Bots nomeados com identidade, memória e work log, num computador na nuvem compartilhado por todos os Bots do usuário; rotinas por gatilho; aprovação por cartão | Fechado |
| **OpenClaw** (ex-Clawdbot/Moltbot) | Gateway Node.js de longa duração, multi-agente, arquivos SOUL/AGENTS/MEMORY, heartbeat migrado para jobs | MIT |

Nota: a primeira versão desta pesquisa confundiu "Openbot" com OpenClaw; corrigido em 7/11/2026 lendo openbot.run.

## 1. Como mantêm o objetivo ao longo do tempo

- **OpenBot:** o agente é uma sessão persistente do provedor (ex.: uma sessão do Claude Code) ligada a um workspace em disco e a um registro de comandos em SQLite com projeções de leitura. A conversa não "acaba": ao reiniciar o app ou trocar de provedor, o agente mantém workspace e conversa. Monitoramento de contexto por agente com **compaction automática** antes de estourar a janela. Filas FIFO de mensagens com pausa, retomada, cancelamento e persistência à prova de queda: o que foi pedido não se perde se o processo cair.
- **Hermes:** sessões em SQLite com busca (FTS5); objetivo entre sessões vive em `MEMORY.md` e `USER.md` (congelados no system prompt no início da sessão) e em skills (`SKILL.md`, "memória procedural" que o agente cria após tarefas complexas). Compressão de contexto sob demanda.
- **OpenClaw:** estado por agente em diretório próprio com SQLite; `AGENTS.md`, `SOUL.md`, `USER.md`, `MEMORY.md`; compaction com resumo salvo no transcript e modo que audita o resumo e marca perda de fatos.
- **Grok Bot:** cada Bot tem memória própria e work log; VM persistente compartilhada entre os Bots do usuário.

## 2. Proatividade

- **OpenBot:** **rotinas** (agenda: "toda segunda às 9h") e **workflows** com vários agentes e etapas de aprovação ("Postar o relatório? Aprovar"). Agentes avisam pessoas pelos canais compartilhados e pelo app móvel.
- **OpenClaw:** heartbeat (`HEARTBEAT.md` a cada 30 min, resposta `HEARTBEAT_OK` suprimida) migrado para **jobs de automação** com horário ativo, "só quando ocioso", "pular se não houver rascunho" e regra "reporte só o que precisa de atenção; senão `NO_REPLY`". Eventos externos por webhook, com wakes duplicados agrupados.
- **Hermes:** scheduler no gateway a cada 60 s; jobs rodam em sessão nova e isolada; **modo sem agente** roda um script sem modelo (zero tokens) e só chama o modelo se o script devolver algo; webhooks disparam jobs; jobs não criam outros jobs (anti-loop).
- **Grok Bot:** rotinas = skill + gatilho (horário, Slack, e-mail próprio do Bot, GitHub/Linear/Sentry/PagerDuty, webhook); orientação de gatilhos estreitos para não gastar com eventos irrelevantes.

## 3. Memória

- **Hermes:** dois arquivos com limite rígido de caracteres (`MEMORY.md` ~2.200, `USER.md` ~1.375) editados só por ferramenta (add/patch/remove); cheio = erro e o agente consolida. Histórico fica fora do prompt e é recuperado por busca.
- **OpenClaw:** camadas: perfil do usuário, fatos duráveis (injetados, truncados por orçamento), notas diárias indexadas (vetor + BM25) e consultadas por ferramenta; consolidação em background ("dreaming"); sessões separadas por chave `agente:escopo`.
- **OpenBot:** memória é a própria conversa persistente mais o workspace (arquivos) do agente; a compaction resume o que excede.
- **Letta/MemGPT:** blocos de memória editáveis em contexto, compartilháveis entre agentes; agente de "sono" reescreve a memória em background.

## 4. Multi-agente

- **OpenBot:** canais compartilhados com **um dono da tarefa** e delegação explícita; agentes mandam mensagem uns aos outros, passam arquivos, reagem; controles Parar, Retomar, Reatribuir, Arquivar. Marketplace de agentes, skills e apps (Notion, Linear, Figma...).
- **OpenClaw:** workspace e banco por agente; persona em `SOUL.md`; preset "time" (coordenador + especialistas) com allowlist de quem pode delegar; subagentes com profundidade máxima.
- **Hermes:** `delegate_task` cria filhos com conversa vazia (só objetivo + contexto), herdam ferramentas do pai (nunca mais), sem memória, sem delegar (salvo orquestrador), até 10 em paralelo, modelo barato.
- **Grok Bot:** Bots com instruções, skills de biblioteca compartilhada, rotinas; modelos compartilháveis sem copiar memória nem logins.

## 5. Segurança

- **OpenBot:** **sem fronteira de segurança por agente**: os agentes rodam com acesso total ao computador e sem aprovação por ação (decisão explícita do produto). Serve para um usuário que confia nos próprios agentes; não serve de modelo para multi-usuário.
- **Hermes:** aprovação de comandos perigosos (modo inteligente, manual, desligado), timeouts que negam por padrão, modo sem humano = negar, blocklist que nem o modo "yolo" passa, sandbox Docker, varredura de skills.
- **OpenClaw:** allow/deny de ferramentas por agente, sandbox por agente, criação de agente por agente exige aprovação do operador, conteúdo externo marcado como não confiável, agente "leitor" sem ferramentas para resumir conteúdo hostil. Aviso: um gateway = uma fronteira de confiança, não é multi-inquilino.
- **Grok Bot:** classificação automática de cada ação, cartão de aprovação no chat, regras "perguntar antes" / "sempre permitir", "só mensagens suas contam como instrução"; mas todos os Bots do usuário compartilham a mesma VM.

## 6. O que levamos para o nosso sistema

Componentes a implementar (todos no servidor, por escritório e por usuário):

1. **Registro de integrantes**: persona, instruções, setor, modelo, política de ferramentas, dono.
2. **Sessões com chave composta** `escritório:usuário:integrante:escopo` (chat, job, evento, subagente), transcript em banco.
3. **Fila de mensagens por integrante**, persistente, com pausa, cancelamento e retomada (o que o OpenBot faz com FIFO em SQLite).
4. **Memória em camadas**: perfil do usuário, memória curada por integrante com limite de tamanho (editada só por ferramenta), notas diárias pesquisáveis.
5. **Compaction auditada**: resumo salvo no transcript, preservando pedido ativo e identificadores (CNPJ, número de guia, competência).
6. **Agendador persistente** por integrante: horário ativo, só quando ocioso, histórico de execuções, recuperação de atraso.
7. **Gatilhos por evento** vindos do registro de eventos, com deduplicação e agrupamento, rodando em sessão isolada.
8. **Checagem determinística antes de acordar o modelo** (o "modo sem agente" do Hermes): o script decide se há algo; só então gasta tokens.
9. **Regra de silêncio**: "só reporte o que exige atenção; senão não responda", com resumo diário para o resto.
10. **Delegação limitada**: subintegrantes com contexto vazio, herança (nunca ampliação) de permissões, profundidade e concorrência máximas.
11. **Política de ferramentas = interseção com as permissões reais do usuário**; ações irreversíveis exigem cartão de aprovação; job sem humano = negar.
12. **Canais compartilhados** (opcional, fase posterior): pessoa e integrantes na mesma conversa, com um dono da tarefa, como no OpenBot.
13. **Envoltório de conteúdo externo**: mensagens de clientes, e-mails, PDFs e páginas entram marcados como dados, nunca como instruções.
14. **Modelos de integrante** publicáveis pelo escritório, sem copiar memória (como os templates do Grok Bot).

Riscos conhecidos: custo de tokens de heartbeat (por isso todos migraram para jobs com condições); injeção de instruções por mensagens e arquivos (incidente de skills maliciosas no OpenClaw, jan/2026 [a confirmar]); perda de fatos na compaction e sessões eternas que nunca resetam; "memória fantasma" (o modelo diz que salvou sem chamar a ferramenta); e, no OpenBot, ausência de limite por agente, que nós precisamos ter.

Fontes: [openbot.run](https://openbot.run/), [README do OpenBot](https://github.com/nightly-labs/openbot#readme), [Introducing OpenBot (14/9/2026)](https://openbot.run/news/introducing-openbot), [Hermes: memória](https://hermes-agent.nousresearch.com/docs/user-guide/features/memory), [Hermes: cron](https://hermes-agent.nousresearch.com/docs/user-guide/features/cron), [Hermes: delegação](https://hermes-agent.nousresearch.com/docs/user-guide/features/delegation), [Hermes: segurança](https://hermes-agent.nousresearch.com/docs/user-guide/security), [OpenClaw: multi-agent](https://docs.openclaw.ai/concepts/multi-agent), [OpenClaw: memória](https://docs.openclaw.ai/concepts/memory), [OpenClaw: jobs](https://docs.openclaw.ai/automation/cron-jobs), [OpenClaw: permissões](https://docs.openclaw.ai/gateway/security/tool-permissions), [Grok Bot: como funciona](https://docs.x.ai/grok-bot/how-grok-bot-works), [Grok Bot: aprovações](https://docs.x.ai/grok-bot/approvals-security-and-privacy), [Letta: memory blocks](https://www.letta.com/blog/memory-blocks).

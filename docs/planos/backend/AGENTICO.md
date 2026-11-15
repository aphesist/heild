# O backend acessível por agentes, organizado por setores

**Versão 0.3 · 15/11/2026 · desenho.** Como cada operação da Heild vira uma ferramenta tipada que a tela, o chat, os integrantes, o app do cliente e qualquer cliente MCP chamam do mesmo jeito, com a mesma autorização e a mesma trilha. Também mostra como o backend **hospeda os procedimentos por processo** que fazem os agentes errarem pouco e gastarem pouco.

**Não desenha os integrantes** (modelos, prompts, rota do Assistente, política de memória): isso é da frente de IA. A recomendação dela está em `docs/integrantes/AVALIACAO.md`, no branch `wf-integrantes-pesquisa`. Aqui fica o encaixe (seção 12).

**Critério do Enzo, que manda neste documento:** erro e alucinação custam mais que qualquer outra coisa, e o custo vem logo depois. A pessoa opera o sistema principalmente pelo chat. Os agentes caros não podem carregar contexto pesado: o trabalho vai para operários baratos, que devolvem só o resultado para revisão. Cada processo tem de ser feito sempre do mesmo jeito. Consequência para o backend: **o que pode ser determinístico é feito pelo sistema, não pelo modelo.** Isso inclui o caminho do processo, a validação, a permissão, a alçada, o cálculo, o estado e o contexto. O modelo recebe pouco e escolhe entre opções que o código já filtrou.

Base nos planos e no wireframe:

- Fundações: R1, R2, R4, R5 e R8; 3.2 a 3.4; 4.6; 5; 6.1 a 6.4.
- 02: 2.3, 4, 6.1 e 7.2. 07: 6.2 e 7. 08: 1.1, C1 e C2.
- `app/src/nucleo/permissoes` (`autorizar`, catálogo de 235 ferramentas) e `app/src/servicos`.

## 1. A regra: a API é o catálogo de ferramentas

> **Toda operação do sistema é uma ferramenta registrada. A tela, o integrante, o operário, o app do cliente, o job e o cliente MCP chamam a mesma ferramenta, pelo mesmo executor, com a mesma função `autorizar`. Não existe outra porta de escrita nem outra porta de leitura de dado de escritório.**

É o que as Fundações já mandam (R1, 6.2: "não há código diferente por porta; só o contexto"). Este documento acrescenta três camadas de operação, o motor de procedimentos e os contratos gerados:

```
             ┌─────────────── pacotes/dominio (TypeScript, navegador e servidor) ───────────────┐
             │ ferramentas (Zod estrito) · procedimentos (versionados) · validadores · autorizar │
             └───────┬──────────────────────────┬────────────────────────────┬────────────────┘
                     │ gera                     │ gera                       │ importa
              openapi.json            ferramentas MCP por setor        frontend (usePode, otimista)
                     │                          │
 tela ── repos.* ─┐  ▼                          ▼
 app do cliente ──┼► POST /v1/ferramentas/{nome}    /mcp/setor/{codigo}  ◄── cliente MCP externo
 orquestrador ────┘  │                          │
                     └────────────┬─────────────┘
                                  ▼
            EXECUTOR: validar → idempotência → limites → autorizar → aprovação?
                      → transação (efeito + evento + jobs) → validar saída → resposta compacta
                                  │ operação de processo
                                  ▼
            MOTOR DE PROCEDIMENTOS: passos em código · operários baratos com contrato ·
            validadores · escalada · cartão — estado de cada execução no banco
```

## 2. Três camadas de operação

A granularidade é a do processo, não a da tabela (AVALIAÇÃO, 9.1). Cada chamada a mais é um ponto de erro e de tokens. Uma ferramenta genérica obriga o modelo a planejar.

| Camada | O que é | Quem usa | Exemplos |
| --- | --- | --- | --- |
| **Operações de processo** | **Uma por procedimento** (seção 4): o processo do catálogo inteiro como uma operação, com entrada e saída fechadas. Por dentro, o motor faz os passos | Integrantes (padrão), Assistente, chat, tela ("fazer agora"), jobs | `guia.enviar_ao_contato(cliente_id, competencia, tributo)`; `extrato.classificar_linhas(cliente_id, competencia, linhas)` (CTB-004); `pgdas.preparar(cliente_id, competencia)` |
| **Contexto e resolução** | Leituras feitas para o agente: compactas, cortadas por orçamento, com origem | Integrantes, operários (só o que o contrato dá), Assistente | `contexto.carregar(cliente_id, processo, competencia, orcamento)`; `cliente.resolver(texto)`; `pendencia.listar`; `tarefa.listar` em visão compacta |
| **Operações de entidade** | As 235 de hoje (`tarefa.concluir`, `cliente.atualizar`, `documento.registrar`...) | Telas; procedimentos por dentro; o **planejador de exceção** (pedido sem procedimento) | `tarefa.criar`, `conversa.responder`, `documento.listar` |

O recorte por setor do MCP e o catálogo que o orquestrador recebe mostram **primeiro as operações de processo e as de contexto**. As de entidade ficam num recorte à parte, `excecao`, só para o planejador de exceção (seção 6). Um integrante do Fiscal vê poucas dezenas de ferramentas bem fechadas, não 235.

## 3. A ferramenta como unidade

A definição tem os campos do 6.1. Os que o wireframe ainda não tem entram no catálogo existente sem mudar os nomes:

- esquemas estritos;
- `descricao_modelo`, `idempotencia`, `evento`, `exposta_mcp`, `custo`, `versao`;
- códigos de erro;
- visão compacta.

A definição mora no pacote de domínio; a implementação (SQL), só no servidor.

```ts
// pacotes/dominio/ferramentas/painel/tarefa.ts (definição: navegador e servidor)
export const tarefaConcluir = definirFerramenta({
  nome: 'tarefa.concluir', versao: 1, modulo: 'painel', setor: 'alvo', nivel: 'executar',
  descricao_modelo: 'Conclui uma tarefa aberta do setor.',            // curta e estável (cache)
  entrada: z.object({ tarefa_id: Id, resultado: z.record(z.string(), z.unknown()).optional() }).strict(),
  saida: z.object({ tarefa: TarefaCompacta }).strict(),
  erros: { TAREFA_FINAL: 'Tarefa concluída ou cancelada é final.', CHECKLIST_ABERTO: 'Há itens obrigatórios do checklist.' },
  alvo: { tabela: 'tarefa', id: 'tarefa_id' },          // de onde vêm setor_id e cliente_id para autorizar
  idempotencia: 'por_chave', exige_aprovacao: 'se_fora_da_lista', irreversivel: false,
  evento: 'tarefa.concluir', custo: { classe: 'barata', externo: false },
  exposta_ao_cliente: true, exposta_mcp: true,
})

// servidor/ferramentas/painel/tarefa.ts (implementação: só servidor)
implementar(tarefaConcluir, async ({ tx, entrada, ctx }) => {
  const t = await tx.tarefas.transicionar(entrada.tarefa_id, 'concluida', regrasTarefa) // a mesma regra do wireframe
  return { dados: { tarefa: compactar(t) }, texto_evento: `${ctx.nome} concluiu ${t.titulo}` }
})
```

Regras do catálogo, conferidas no CI:

1. Nome `entidade.acao`, estável. Mudança incompatível de esquema sobe `versao`, e a anterior fica servida por um ciclo (6.1).
2. **Esquema estrito sempre:** `.strict()` vira `additionalProperties: false`; competência, tributo, setor e status são enum. Esquema aberto em ferramenta exposta a agente quebra o build.
3. **Ações aceitam ids, nunca nomes.** Cliente errado é o erro mais grave. Nome vira id só por `cliente.resolver` (seção 5).
4. Toda definição tem implementação, e toda implementação grava só pelo `tx` do executor (que grava o evento). Toda escrita dos repositórios do frontend aponta para uma ferramenta registrada.
5. Toda ferramenta `executar` exige `Idempotency-Key`. Toda `irreversivel` tem `exige_aprovacao` pelo menos `se_integrante`. Toda `exposta_ao_cliente` declara o filtro de cliente.
6. Campos de saída que vêm de fora levam `.meta({ origem_externa: true })` (seção 11).
7. **Tela que precisa de dado que nenhuma ferramenta devolve é defeito do catálogo** (6.2). As leituras também são ferramentas, e por isso um agente vê tudo o que uma tela mostra.

## 4. Procedimentos: o processo como operação do sistema

A frente de IA recomenda (AVALIAÇÃO, 3, 6 e 8) que o "orquestrador do setor" seja **um procedimento em código por processo**, e não um segundo modelo que planeja cada pedido. O backend hospeda esses procedimentos. São operações do sistema, não texto que o agente interpreta.

### 4.1 O que é um procedimento

É a forma fixa de fazer um processo do catálogo (FIS-011, CTB-004, DP-001...): código e dados versionados, revisados por gente e testados com casos de gabarito.

```ts
// pacotes/procedimentos/contabil/CTB-004.ts
export const ctb004 = definirProcedimento({
  id: 'CTB-004', versao: 3, setor: 'contabil', nivel_maximo: 'rascunhar',
  operacao: 'extrato.classificar_linhas',                     // a operação de processo que o expõe (seção 2)
  entrada: z.object({ cliente_id: Id, competencia: Competencia, linhas: z.array(LinhaExtrato).max(500) }).strict(),
  saida: z.object({ lancamentos: z.array(LancamentoProposto), pendentes: z.array(LinhaPendente) }).strict(),
  orcamento: { centavos: 40, tokens: 60_000 },                 // conferido antes de cada passo de modelo
  passos: [
    deterministico('regras_aprendidas', (s, f) => f.regra_aprendida.aplicar(s.entrada)),        // D-13
    deterministico('candidatas', (s, f) => f.plano_contas.candidatas(s.pendentes, { max: 12 })),
    operario('escolher_conta', {
      contrato: 'ctb004.escolher_conta@2',          // prompt versionado: da frente de IA
      classe: 'operario', raia: 'linha', paralelo: 10,
      recebe: (s, linha) => ({ linha, candidatas: s.candidatas[linha.id] }),   // só isto; contexto vazio
      devolve: z.object({ conta_id: Id, confianca: z.number().min(0).max(1), motivo: z.string().max(140) }).strict(),
      ferramentas: [],                                // operário não chama ferramenta aqui
    }),
    validar(['conta_aceita_lancamento', 'partidas_fecham', 'valor_confere_extrato', 'confianca_ou_regra:0.9']),
    escalar({ se_falhar: 'escritor', se_falhar_de_novo: 'cartao_nao_consegui' }),   // AVALIAÇÃO, 7.2
    concluir({ por: 'lista_do_escritorio' }),         // faz sozinho ou cartão (Fundações 3.3)
  ],
  testes: 'casos/CTB-004/',                           // cartões editados viram casos (02, 14.2)
})
```

| Tipo de passo | Quem executa | O que garante |
| --- | --- | --- |
| `deterministico` | Código do servidor chamando ferramentas (M2, M3 `calculo.*`, M1 `legal.consultar`, regras aprendidas) | Número só do M3, regra só do M1, dado só de ferramenta. O modelo nunca soma |
| `operario` | Runner de operários do backend (seção 4.3), com o modelo barato do contrato | Contexto vazio, só a entrada do contrato; saída validada pelo esquema; raias disjuntas por linha ou cliente em lote |
| `validar` | Validadores do pacote de domínio (seção 4.4) | Esquema, regra de negócio, origem (07, 7), `autorizar`, alçada. Custo zero de modelo |
| `escrever` / `revisar` | Runner, com o modelo escritor ou revisor do contrato, **sobre o resultado compacto** | O caro vê `{entrada resumida, saída, evidências, validadores}`, nunca o histórico (AVALIAÇÃO, 7.1, camada 4) |
| `escalar` | Motor | Validador falhou → uma vez ao escritor com a falha; de novo → revisor de risco ou cartão "não consegui, falta X" |
| `externo` | Conector (fila com retentativa, cofre) | Espera do órgão vira estado (`aguardando_externo`), não um agente esperando |
| `concluir` | Motor + executor | Faz sozinho (lista do escritório) ou cria o cartão; o efeito passa pelo executor com evento |

### 4.2 O motor e o estado no sistema

O estado de cada processo fica no banco, não no contexto do agente (AVALIAÇÃO, 9.2; 02, 8.2: "a tarefa é o estado compartilhado"). O agente retoma lendo o estado, não o transcript.

| Tabela (RLS por escritório) | Conteúdo |
| --- | --- |
| `procedimento_versao` (da plataforma) | `id`, `versao`, `hash` da definição, `publicado_em`, resultado dos testes. Gravada no deploy; uma execução sempre aponta para a versão que rodou |
| `procedimento_config` | Por escritório: ativo, "executa sozinho" (Fundações 4.6), limite de custo por execução |
| `execucao` | `procedimento_id`, `versao`, `entrada`, `estado` (`pendente`, `executando`, `aguardando_externo`, `aguardando_cartao`, `concluida`, `falhou`, `cancelada`), `passo_atual`, ator que pediu, `responsavel_id`, `pagador` (bolsa do setor ou pessoa, seção 4.6), prioridade, `causado_por_evento_id`, `tarefa_id`, `cliente_id`, orçamento e gasto, chave de idempotência |
| `passo_execucao` | Ordem, nome, tipo, tentativa, estado, saída **compacta**, resultado dos validadores, custo, início, fim, `evento_id` |
| `chamada_modelo` | Contrato e versão, modelo, tokens de entrada, saída e cache, centavos, latência, `saida_valida`, erro de validação. É o que alimenta o piloto pré-registrado (AVALIAÇÃO, 11) e a medição contínua de erro e custo |

Funcionamento:

- **Cada passo é um job** (`procedimento.passo`, pg-boss) com chave `(execucao, passo, tentativa)`. O resultado é gravado **antes** de avançar (*checkpoint*); uma queda retoma do último passo gravado, sem repetir efeito.
- **Passo com efeito** roda pelo executor, numa transação: efeito, evento, próximo job e atualização da execução. Nada fica pela metade (AVALIAÇÃO, 9.1, "transação por passo de negócio").
- **Lote:** um passo com `raia` abre um job por raia (linha ou cliente). Um passo de consolidação em código espera todas, por contador na `execucao`, e junta.
- **Espera:** o bloqueio 656 da DF-e vira `aguardando_externo` com `startAfter`; o cartão vira `aguardando_cartao`, retomado pelo evento de `aprovacao.decidir`.
- **Chamada síncrona ou assíncrona:** a operação de processo responde direto se terminar em até ~5 s. Se não, devolve `{ execucao_id, estado }`; o progresso vai por SSE (o `ProgressoTrabalho` do wireframe lê a `execucao`), e quem pediu é avisado ao concluir.

**Por que um motor próprio, pequeno, sobre o Postgres, e não o Temporal ou um planejador por modelo:**

1. O estado precisa ser **dado do domínio**, visível na tela, em ferramentas, sob RLS e na auditoria, na mesma transação do evento (R2).
2. Não há infraestrutura nova para um time pequeno: só tabelas e o pg-boss que já está no desenho.
3. Os dados ficam no Brasil.

Um motor de workflow genérico guarda o estado em tabelas opacas e pede cluster próprio; a disponibilidade de um Temporal Cloud no Brasil não foi verificada. Se o motor próprio crescer além do previsto (mais de ~2 mil linhas, ou se precisar de recursos que ele não tem), avaliar uma biblioteca de execução durável sobre Postgres antes de um cluster.

### 4.3 A fila e o runner dos operários

Os passos `operario`, `escrever` e `revisar` rodam num **runner de operários do backend** (worker TypeScript, fila `operario.executar`). A frente de IA decide o **conteúdo**:

- o prompt de cada contrato, versionado e guardado em `pacotes/contratos-ia`;
- o modelo de cada classe (`operario`, `escritor`, `revisor`; o padrão decidido está na seção 4.6);
- a política de revisão.

O backend garante a **execução**:

| Garantia | Como |
| --- | --- |
| Contrato fechado | O runner monta a entrada só com o que `recebe` devolve. Sem histórico, memória ou transcript. Ferramentas: nenhuma ou só `ler` da lista do contrato |
| Saída estruturada | Chamada ao modelo com saída em esquema estrito (o `devolve` vira JSON Schema); a resposta passa pelo Zod antes de qualquer outra coisa. Inválida → `saida_valida = false` e escalada; nunca "tenta de novo às cegas" mais de uma vez |
| Orçamento | Conferido **antes** de cada chamada: por execução (`orcamento` do procedimento), por integrante por dia (02, 4.7), pelo saldo da bolsa do setor ou do plano do responsável (seção 4.6) e por escritório. Estourou → o passo para, a execução registra `parcial` e cria cartão |
| Custo e origem | Cada chamada grava `chamada_modelo` e entra no `custo` do evento do passo |
| Cache | O prompt do contrato vem em ordem estável (instrução fixa → esquema → entrada); a versão do contrato entra na chave |
| Paralelismo | Por raia, com limite por escritório e por fornecedor de modelo |
| Credencial do modelo | Chave do fornecedor no Secrets Manager, usada só pelo runner; o navegador e o orquestrador não a recebem |

### 4.4 Validadores como serviço

Os validadores ficam em `pacotes/dominio/validadores`. Exemplos: `partidas_fecham`, `competencia_aberta`, `valor_confere_extrato`, `cliente_no_escopo`, `alcada_do_aprovador`, `origem_de_todo_numero` (07, 7).

**O mesmo código roda em três lugares:**

- no passo `validar` do procedimento;
- no portão (camadas 1 a 3 da AVALIAÇÃO, 7.1);
- nos testes de caso.

Também ficam expostos como ferramenta `validador.executar(nome, dados)`, para o planejador de exceção conferir o que montou. Um conserto de validador vale para todos os procedimentos que o usam e entra versionado.

### 4.5 Procedimento novo, mudança e teste

1. Um procedimento entra por PR, com casos de gabarito (dados reais anonimizados), e o CI roda todos os casos. Um procedimento sem casos não publica.
2. Mudar passo, validador ou contrato sobe a `versao`. Execuções em andamento terminam na versão em que começaram.
3. Cartão editado por pessoa vira candidato a caso novo (02, 14.2), revisado antes de entrar.
4. Pedido sem procedimento é exceção registrada (o planejador da frente de IA usa o recorte `excecao`). Se o tipo de pedido se repetir, vira procedimento (AVALIAÇÃO, 7.2).

### 4.6 O integrante compartilhado: uma execução isolada por pedido

Decisão do Enzo (15/11/2026, `docs/integrantes/DECISOES.md`): o integrante é **compartilhado por setor**, e o contexto de uma pessoa nunca se mistura com o de outra. Para o backend, isso significa:

| Regra | Como o backend garante |
| --- | --- |
| **O compartilhado é a configuração, não o contexto** | O que é do setor: nome, procedimentos, ferramentas do recorte, regras e memória do setor (tabela com RLS). Nada disso é um "agente vivo" com conversa acumulada |
| **Cada pedido roda numa execução própria** | Cada pedido de pessoa, cada evento e cada job abre a sua `execucao` (ou a sua sessão de integrante, na conversa sem procedimento), com o contexto daquela conversa, daquele cliente e daquela tarefa, carregado por `contexto.carregar`. Uma execução não lê o transcript nem os passos de outra. Vinte pessoas ao mesmo tempo são vinte execuções paralelas |
| **Fila com prioridade e limite por setor** | A fila do motor ordena por prioridade: pedido de pessoa no chat, depois evento, depois job em segundo plano (02, 7.1: jobs só quando ocioso). O limite de execuções simultâneas vale por setor e por escritório (configurável; padrão de partida: 10 por setor). Um limite de itens em segundo plano por pessoa impede que uma só tome a fila. O excedente espera na fila, com a posição visível na tela |
| **Efeito sem conflito** | Não há trava global. Há trava curta por `(setor, cliente, processo)` só nos passos com efeito, além da chave de idempotência: duas pessoas pedindo a mesma guia do mesmo cliente não geram dois envios |
| **Memória do setor muda só por proposta aprovada** (decisão 6) | Dentro de uma execução, a memória do setor é só leitura. Aprender algo para todos gera `memoria.propor` (cartão para Gestor ou Administrador); a preferência de uma pessoa fica na memória privada dela, que só entra nas execuções dela |

**Modelos por papel** (decisão 3). O contrato de cada passo declara a **classe** (`operario`, `escritor`, `revisor`); o modelo de cada classe é configuração da frente de IA, registrada em cada `chamada_modelo`. O padrão decidido é **Sonnet como operário, Sonnet como escritor e Opus como revisor**. O Haiku entra como operário **só por contrato, quando o piloto provar que ele não erra naquele passo**: é uma chave por contrato, ligada com a evidência do piloto (`chamada_modelo` compara modelos no mesmo contrato).

**Quem paga** (decisão 5). Por padrão, o custo de modelo de uma execução sai da **bolsa do setor**:

- O runner debita cada `chamada_modelo` da bolsa `(escritório, setor, mês)`, e o orçamento confere o saldo antes de cada chamada.
- Como opção, antes de iniciar uma execução vinda de evento ou job, o integrante pode perguntar **"Para quem quer rotear esta atividade?"**. A ferramenta `integrante.perguntar_responsavel` cria um cartão de escolha com as pessoas do setor que têm acesso ao integrante.
- A pessoa escolhida passa a ser a responsável pela execução: recebe os cartões de aprovação, e o custo pode sair do plano dela, se o escritório configurar assim.
- A execução grava `pagador` (`bolsa_setor` ou `usuario_id`) e `responsavel_id`.

## 5. Feito para o agente errar pouco e gastar pouco

A lista da AVALIAÇÃO (9.1 e 9.2), com o mecanismo do backend que entrega cada item:

| Requisito | Mecanismo no backend |
| --- | --- |
| Granularidade do processo | Operação de processo por procedimento (seção 2); recorte do MCP com essas primeiro |
| Esquemas estritos | Zod `.strict()` → `additionalProperties: false`, enums; CI recusa esquema aberto |
| Ids, nunca nomes | `cliente.resolver(texto)` devolve `[{ cliente_id, nome, cnpj, confianca }]`. Com mais de um candidato acima do limiar, devolve `AMBIGUO` e a lista; a ação nunca resolve nome sozinha. O mesmo vale para pessoa, tarefa e documento |
| Respostas compactas | Toda leitura tem `visao: 'compacta' \| 'tela'`. Tokens de agente usam `compacta` por padrão: totais, até 20 linhas, `ha_mais`, cursor e campos com nome, sem prosa (02, 6.1). O CI mede o tamanho típico da resposta compacta de cada ferramenta e falha acima do teto declarado |
| Leitura separada de efeito | Níveis `ler`, `rascunhar` e `executar`; operário e rota só recebem `ler` |
| Pré-validação | **Toda ferramenta `rascunhar` e `executar` aceita `validar_apenas: true`**: roda esquema, `autorizar`, alçada, regras e validadores e devolve os erros por campo, sem efeito e sem evento de efeito |
| Erros tipados e acionáveis | Códigos declarados por ferramenta (`erros`); resposta `{ codigo: "FALTA_FOLHA", campo: "folha_2026_03", mensagem, acao_sugerida: { ferramenta: "tarefa.criar", entrada: {...} } }` |
| Idempotência | Obrigatória em todo `executar`; o motor deriva a chave de `(execucao, passo, tentativa)`, e o orquestrador, de `(sessao_integrante, passo)` |
| Transação por passo de negócio | Executor e passo com efeito numa transação só (seção 4.2) |
| Cálculo e regra no servidor | `calculo.*` e `legal.consultar` devolvem marcas de origem (`[k-…]`, `[e-…]`, `[t-…]`, 07, 7); o validador `origem_de_todo_numero` confere a saída de quem escreve |
| Estado do processo no sistema | `execucao` e `passo_execucao` (seção 4.2); `execucao.obter` devolve o estado compacto para retomar |
| Contexto mínimo por cliente e tarefa | `contexto.carregar(cliente_id, processo, competencia, orcamento_tokens)` devolve, numa chamada, os blocos já cortados para o orçamento, em ordem fixa: perfil na data (`cliente.perfil_em`), pendências, últimos eventos **do processo** (até 10), execuções abertas, memória relevante (a política é da frente de IA). Cada bloco tem id e hash, para cache e para citar a origem |
| Procedimentos versionados | `procedimento_versao`; a execução registra a versão |
| Validadores como serviço | Seção 4.4 |
| Evento com custo e origem | `custo` no evento e `chamada_modelo` (seção 4.2) |
| Pronto para cache | `tools/list` em ordem fixa (por nome), descrições curtas e estáveis, versão do catálogo no hash; blocos fixos do contexto antes dos variáveis |
| Busca de ferramentas | Só quando um recorte passar de ~10 mil tokens de esquemas; o CI mede o tamanho por recorte |

## 6. Organização por setores

O catálogo já tem `setor` (`alvo`, `geral` ou código fixo) e `modulo` em cada ferramenta (`ferramentas.ts`). Os procedimentos também têm setor. Os setores são os do pacote de área (Fundações 4.1, DA-02):

- `societario`, `fiscal`, `notas`, `dp`, `contabil`, `consultoria`, `gestao_atendimento` e `financeiro_escritorio`;
- `bpo` e `bpo_financeiro`;
- os do Jurídico, quando o pacote entrar.

| Onde o setor aparece | Como |
| --- | --- |
| **Recortes** | `/mcp/setor/{codigo}` e `GET /v1/ferramentas?setor=` devolvem as **operações de processo e de contexto** do setor e as transversais de leitura, **no escopo de quem pergunta**, com o nível efetivo (`ler`, `preparar`, `executar com aprovação`, `executar`). `/mcp/setor/{codigo}/excecao` acrescenta as operações de entidade do setor, para o planejador de exceção. `/mcp/modulo/{modulo}` serve CRM, Financeiro e BPO |
| **Procedimentos** | `procedimento.listar(setor)` mostra o que o setor sabe fazer sozinho, com versão e taxa de aprovação; é o "programa operacional" do integrante (02, 2.2) visto pelo sistema |
| **Telas** | `app/src/nucleo/permissoes/telas.ts` vira o catálogo de identificadores estáveis de tela (`aba.fiscal`, `aba.fiscal.guias`), cada um com as ferramentas que usa. `GET /v1/telas/aba.fiscal` devolve isso: o agente sabe o que a pessoa vê naquela aba, e o chat monta o link "ver na aba" |
| **Autorização** | Igual à de hoje: o setor vem da ferramenta ou do registro (`setor: 'alvo'`), e o vínculo da pessoa (gestão ou execução) decide. O integrante herda pela interseção com o dono (3.3) |
| **Auditoria e custo** | Evento, `execucao` e `chamada_modelo` gravam `setor_id`; os painéis somam por setor e por procedimento |

**Serviços externos são ferramentas de conector, por setor.** Cada método das interfaces de `app/src/servicos` vira uma ferramenta do catálogo do 08. Exemplos:

- `servicos.integraContador.situacaoFiscal(cnpj)` → `integra.situacao_fiscal({ cliente_id })`, do Fiscal;
- `servicos.whatsapp.enviar` → `conversa.responder`, irreversível.

O navegador só chama a API, e o `Resultado<T>` sai do envelope da seção 8. Os códigos API-01 a API-32 do mapa de telas viram a coluna `conector`.

## 7. Uma fonte, vários contratos

| Gerado de `pacotes/dominio` | Para quem | Como |
| --- | --- | --- |
| Tipos TypeScript | Frontend, servidor, orquestrador em TypeScript | Inferidos do Zod (`z.infer`) |
| `openapi.json` (OpenAPI 3.1) | Integradores, orquestrador em outra linguagem | Uma operação `POST /v1/ferramentas/{nome}` por ferramenta, com `x-heild-setor`, `x-heild-nivel`, `x-heild-aprovacao`, `x-heild-idempotencia`, `x-heild-procedimento` |
| Ferramentas do MCP | Servidor MCP e orquestrador | `name`, `description`, `inputSchema` e `outputSchema` estritos, anotações (seção 9), em ordem fixa |
| Catálogo legível de ferramentas e procedimentos por setor | Produto, suporte, contadores | Markdown gerado |
| Cliente tipado em Python **[se a frente de IA escolher Python]** | Orquestrador | Gerado do OpenAPI |

O CI guarda um *snapshot* dos contratos. Uma diferença sem aumento de `versao` numa ferramenta ou num procedimento que mudou de forma incompatível quebra o build. Algumas APIs de modelo só aceitam `[a-zA-Z0-9_-]` em nome de ferramenta, então o nome exposto é `tarefa_concluir`, e o servidor faz a ida e a volta para `tarefa.concluir`.

## 8. HTTP: o mesmo pedido para a tela e para o agente

```http
POST /v1/ferramentas/extrato.classificar_linhas
Authorization: Bearer <JWT da pessoa | token de integrante | token de serviço>
Idempotency-Key: 6f1c...            (obrigatório em todo executar)
X-Heild-Tela: aba.contabil          (só a tela manda; vale para exceção por tela e timesheet, 5.4)
traceparent: 00-...
Content-Type: application/json

{ "cliente_id": "c203", "competencia": "2026-10", "linhas": [ ... ], "validar_apenas": false }
```

| Resultado | HTTP | Corpo |
| --- | --- | --- |
| `ok` | 200 | `{ "resultado": "ok", "dados": {...}, "cartoes": [...], "evento_id": "...", "versao": 18442, "linhas": {...} }` |
| `em_execucao` | 202 | `{ "resultado": "em_execucao", "execucao_id": "ex...", "estado": "executando", "passo": "escolher_conta" }` |
| `aguardando_aprovacao` | 202 | `{ "resultado": "aguardando_aprovacao", "cartao_id": "ca...", "resumo_humano": "...", "expira_em": "..." }` |
| `validado` (com `validar_apenas`) | 200 | `{ "resultado": "validado", "erros": [] }`, ou com erros por campo |
| `negado` | 403 | `{ "resultado": "negado", "codigo": "SEM_SETOR", "motivo": "Sua conta não tem esse setor." }` (gera evento) |
| `erro` de regra | 422 | `{ "resultado": "erro", "codigo": "TAREFA_FINAL", "campo": null, "mensagem": "...", "acao_sugerida": null }` |
| `erro` de entrada | 400 | Erros do Zod por campo (o `FormularioModal` mostra cada um no seu campo) |
| `erro` externo | 502 ou 503 | `{ "codigo": "ESQUEMA_EXTERNO" \| "CREDENCIAL" \| "LIMITE" \| "INDISPONIVEL", "tentar_de_novo_em": ... }` |

Sobre os campos do envelope:

- `linhas` traz as linhas afetadas, para a tela reconciliar a atualização otimista ([`ARQUITETURA.md`](ARQUITETURA.md), seção 6).
- `cartoes` traz os **cartões visuais gerados pelo sistema** (seção 13): tabela, cálculo, citação, documento, aprovação. O chat os desenha sem o modelo escrever tabela ou número.

Fora das ferramentas, só infraestrutura:

- `GET /v1/sessao`;
- `GET /v1/sincronizar?desde=`;
- `GET /v1/eventos/fluxo` (SSE);
- `POST /v1/webhooks/{conector}`;
- `/v1/interno/*`, só na rede interna e para o orquestrador.

## 9. Servidor MCP

O MCP fica **na borda, como fachada fina** das mesmas ferramentas (AVALIAÇÃO, 9.3); não é camada de lógica. As Fundações (6.3) pedem uma instância lógica por escritório e um token ligado a um usuário.

| Item | Desenho |
| --- | --- |
| Transporte | Streamable HTTP, no mesmo processo da API (`@modelcontextprotocol/sdk`, TypeScript) |
| "Uma instância por escritório" | Lógica: o escritório vem do token (R3), nunca da URL |
| `tools/list` | Só as ferramentas `exposta_mcp` no escopo do dono do token, cortadas pelo recorte (seção 6) e pelo escopo do token, em ordem fixa |
| Anotações | `readOnlyHint` se `nivel = ler`; `destructiveHint` se `irreversivel`; `idempotentHint` se `idempotencia ≠ nenhuma`; `openWorldHint` se `custo.externo` |
| `tools/call` | O mesmo executor. `aguardando_aprovacao` e `em_execucao` voltam como resultado normal, com o id para acompanhar |
| Recursos (somente leitura) | `heild://cliente/{id}/contexto?processo=&competencia=` (o mesmo `contexto.carregar`), `heild://execucao/{id}` |
| Autenticação | Token de serviço (seção 10); depois, OAuth 2.1 da especificação de autorização do MCP, para clientes de terceiros que o escritório queira ligar |

## 10. Quem chama: atores e credenciais

| Ator (`ctx.ator`) | Credencial | Quem emite | O que o executor monta |
| --- | --- | --- | --- |
| Pessoa da equipe | JWT do Supabase Auth (ES256, JWKS) | Login, com MFA para o Administrador | Perfil materializado (3.2), em cache até um evento `conta.*` |
| Pessoa do cliente (app) | JWT do Supabase Auth com `app_metadata.tipo = cliente` | Login do app | `pessoa_cliente`: só `exposta_ao_cliente`, só os clientes e as `areas` dela (3.2, regra 3) |
| **Integrante** | **Token de integrante**: JWT de 15 minutos assinado pela API. Claims: `escritorio_id`, `integrante_id`, `usuario_dono_id`, `sessao_integrante_id`, `origem`, `causado_por_evento_id` | `POST /v1/interno/integrantes/{id}/token`, chamado só pelo orquestrador | `integrante` com o `dono` carregado **a cada chamada** (3.3, R4); irreversível vira cartão; job sem humano não executa o que exige aprovação |
| **Passo de procedimento e operário** | Nenhuma de fora: o motor roda dentro do backend com o contexto da execução | O motor | O ator da execução (o integrante e o dono, ou a pessoa que pediu); um operário só lê o que o contrato entrega e não chama ferramenta de efeito |
| Token de serviço (MCP externo, automação) | Opaco (`hsk_...`), guardado com hash, com expiração e revogável | Uma pessoa, em Configurações › Integrações | A pessoa dona, cortada pelo escopo do token: igual ou menor, nunca "do escritório" (P13) |
| Sistema | Papel interno do worker | — | Só manutenção (partições, selagem, limpeza) |

O orquestrador **nunca** recebe o JWT de uma pessoa nem a chave do fornecedor de modelo usada pelo runner.

## 11. O executor: idempotência, limites, aprovação e trilha

A ordem é a do 6.2, com idempotência, limites e jobs na transação acrescentados:

1. **Validar a entrada** pelo Zod estrito. Falha → 400.
2. **Idempotência.** Procura `(escritorio_id, chave)`:
   - com o mesmo hash de argumentos, devolve a resposta guardada;
   - com hash diferente, devolve 409.
3. **Limites**, que negam com o código e o motivo:
   - por ator;
   - por classe de custo;
   - **chamadas externas pagas por ferramenta por dia** (02, 4.7);
   - teto de custo mensal da conexão (08, 2.3);
   - orçamento da execução e do integrante (seção 4.3).
4. **Autorizar** com a função única (a mesma do navegador). Negado → evento e 403.
5. **Aprovação.** Se a decisão vier com `aprovacao: true`, grava o cartão com a ferramenta, a versão, os argumentos exatos, o `resumo_humano` e o `pode_aprovar` (6.4), e devolve 202.
6. **Se for `validar_apenas`**, para aqui e devolve os erros dos validadores.
7. **Transação:**
   - fixa o escritório na conexão (RLS);
   - roda a implementação ou inicia a execução do procedimento;
   - grava o evento com a cadeia de hash;
   - enfileira os jobs;
   - guarda a resposta de idempotência;
   - faz o `commit`.
   - Uma falha grava o evento `erro` em transação própria (5.2).
8. **Validar a saída** pelo Zod. Saída inválida é erro (6.1); externo fora do esquema vira `ESQUEMA_EXTERNO` (08, 2.5).
9. **Responder** em visão compacta para agentes e em visão de tela para a tela.

**Decidir o cartão** é a ferramenta `aprovacao.decidir({ cartao_id, decisao, argumentos_editados? })`.

1. Confere se quem decide está em `pode_aprovar` e tem o nível.
2. Executa a ferramenta guardada com o integrante como ator, a pessoa como `decidido_por` e o `aprovacao_id` no evento.
3. Retoma a execução do procedimento parada em `aguardando_cartao`.
4. Acorda o integrante só se a decisão for recusa, edição ou expiração (02, 4.2).

**Trilha:** toda chamada vira evento, inclusive `negado` e `erro`; as leituras vão para `evento_leitura` em lote ([`STACK.md`](STACK.md), seção 8). Correlação no evento:

- `origem`, `sessao_auth_id` ou `sessao_integrante_id`;
- `execucao_id`, `causado_por_evento_id`, `aprovacao_id`;
- `credencial_usada`, `custo`, `traceparent`.

**Conteúdo externo é dado (R5):**

- Campos `origem_externa` vão listados no envelope e no `_meta` do MCP, e o runner os envolve como dado antes de passar a um modelo.
- Nenhuma ferramenta recebe "instrução livre" para executar.
- Webhooks entram com a assinatura do fornecedor verificada, deduplicados por `(conexao, id_externo)` e gravados brutos antes de processar (08, C5).

## 12. O encaixe com a frente de IA

A recomendação da frente de IA é: Assistente geral como porta, integrante compartilhado por setor, procedimento em código por trás de cada processo, operários baratos com contrato e o modelo caro só sobre o resultado compacto. Quem faz o quê:

| Peça | Quem desenha | Onde roda |
| --- | --- | --- |
| **Assistente** (porta: regras → classificador barato → encaminha, sem reescrever) | Frente de IA | Serviço do orquestrador; chama `procedimento.*`, operações de processo e `contexto.carregar` pela API |
| **Integrante do setor** (identidade, programa, memória do setor, fila) | Frente de IA (comportamento); backend (entidades, fila, memória com RLS) | Orquestrador para conversar; motor do backend para fazer |
| **Procedimento do processo** (o "orquestrador do setor") | Backend (motor, passos determinísticos, validadores) com a frente de IA (contratos e prompts dos passos de modelo) | **Motor de procedimentos do backend** (seção 4) |
| **Operários** (Sonnet por padrão; Haiku por contrato quando o piloto provar) | Frente de IA (contratos, modelo da classe) | **Runner de operários do backend** (seção 4.3) |
| **Escritor e revisor sobre o compacto** | Frente de IA (decidido: Sonnet escritor, Opus revisor) | Runner do backend, como passo do procedimento |
| **Planejador de exceção** (pedido sem procedimento) | Frente de IA | Orquestrador, com o recorte `excecao` e os mesmos validadores (`validador.executar`) |
| **Cartão de aprovação** | Backend | Executor |
| **Memória** | Frente de IA (política); backend (tabela com RLS, `memoria.*`) | Backend |

Os contratos do orquestrador com o backend:

| # | Encaixe | Contrato |
| --- | --- | --- |
| 1 | **Pegar trabalho** | `POST /v1/interno/fila/integrantes/pegar` (espera longa) devolve itens do 02: `mensagem_usuario`, `evento` (já deduplicado e agrupado pelo despachante), `job`, `decisao_aprovacao`, **`execucao_concluida`** (um procedimento terminou ou escalou). `.../{item}/pulso` mantém o item; sem pulso por 10 minutos, ele volta a `pendente` (02, 4.7) |
| 2 | **Fazer** | Com o token do integrante, chama a **operação de processo** (o motor faz os passos e devolve o resultado compacto, `em_execucao` ou `aguardando_aprovacao`). Sem procedimento, usa o recorte `excecao` |
| 3 | **Saber o mínimo** | `contexto.carregar(cliente_id, processo, competencia, orcamento_tokens)` e `execucao.obter(id)`: o estado vem do sistema, não do transcript |
| 4 | **Checagem sem modelo** | `POST /v1/interno/condicoes/avaliar`: predicado tipado (ferramenta `ler` com filtro) que diz se há trabalho, antes de qualquer token (02, 4.2). O despachante usa para gatilhos; o orquestrador, para jobs |
| 5 | **Falar com a pessoa** | `POST /v1/interno/sessoes/{id}/fluxo` (texto em fluxo, repassado por SSE só à pessoa dona). A mensagem final é gravada por `integrante.responder`, com os `cartoes` gerados pelo sistema; o modelo escreve só o texto em volta. Avisos passam por `notificacao.publicar` |
| 6 | **Registrar custo e sessão** | `integrante.sessao.fechar({ custo, passos, resultado })` vira sessão de trabalho do timesheet (5.4, regra 9). O custo dos procedimentos já vem do runner |
| 7 | **Ser acordado** | O **despachante** (backend) lê a cauda de `evento`, casa com os gatilhos (entidade do 9) e, para cada evento que casa: deduplica, agrupa ("12 documentos da Empresa X"), confere `autorizar` (ler) do dono, roda a checagem sem modelo e enfileira o item com `causado_por_evento_id` (5.7). **Quando o gatilho aponta para um procedimento que roda sem conversa** (conferir os 12 documentos), o despachante inicia a execução direto, e o integrante só é acordado com `execucao_concluida`, se houver algo a dizer |

O item 7 é o que mais corta custo. A maior parte do trabalho disparado por evento não precisa de modelo caro nenhum: o procedimento roda com passos determinísticos e operários baratos, e o integrante (modelo escritor) só entra se houver resultado para a pessoa ler.

## 13. A tela e o agente usam a mesma API

| Coisa | Tela (frontend) | Integrante (orquestrador) | Cliente MCP |
| --- | --- | --- | --- |
| Descobrir o que pode | `GET /v1/sessao` + o mesmo `autorizar` local (`usePode`, `SePode`) | `GET /v1/ferramentas?setor=` com o token do integrante | `tools/list` |
| Ler | `repos.x.listar` no cache + `useConsulta` (visão de tela) | Mesma ferramenta, visão compacta, ou `contexto.carregar` | `tools/call` |
| Fazer um processo | Botão "fazer agora" chama a operação de processo; o progresso vem da `execucao` por SSE (`ProgressoTrabalho`) | A mesma operação | A mesma operação |
| Escrever no detalhe | `repos.tarefas.mudarStatus(...)` → otimista + `POST /v1/ferramentas/tarefa.concluir` | A mesma chamada (recorte `excecao`) | A mesma chamada |
| Aprovação | Cartão; `aprovacao.decidir` | Recebe 202 e suspende a sessão | Recebe o `cartao_id` |
| O que aparece no chat | **Cartões gerados pelo sistema** (dados, cálculo, citação, aprovação), com "ver origem" em todo número e regra ligado às marcas da verificação (07, 7.2) | Devolve os `cartoes` do resultado; não redige tabela nem número | — |
| Erros | `ErroPermissao` e `ErroRegra` com a frase pronta (`useAcao` vira toast) | O mesmo `codigo` e `acao_sugerida` | `isError` com o mesmo texto |

O frontend continua com a mesma forma de pensar: `repos`, `usePode` e `useAcao` não mudam de assinatura. O que muda é o que existe embaixo deles ([`ARQUITETURA.md`](ARQUITETURA.md), seção 6).

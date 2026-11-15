# O backend acessível por agentes, organizado por setores

**Versão 0.1 · 15/11/2026 · desenho.** Como cada operação da Heild vira uma ferramenta tipada que a tela, o chat, os integrantes, o app do cliente e qualquer cliente MCP chamam do mesmo jeito, com a mesma autorização e a mesma trilha. **Não desenha os integrantes** (orquestração, modelos, custo de IA): isso é de outra frente. Aqui fica só o encaixe (seção 10).

Base nos planos:

- Fundações: R1, R2, R4, R5 e R8; 3.2 a 3.4; 5; 6.1 a 6.4.
- 02: 4.2, 4.5, 4.7 e 7.2.
- 08: 1.1, C1 e C2.

Base no wireframe: `app/src/nucleo/permissoes` (`autorizar`, catálogo de 235 ferramentas) e `app/src/servicos`.

## 1. A regra: a API é o catálogo de ferramentas

> **Toda operação do sistema é uma ferramenta registrada. A tela, o integrante, o app do cliente, o job e o cliente MCP chamam a mesma ferramenta, pelo mesmo executor, com a mesma função `autorizar`. Não existe outra porta de escrita nem outra porta de leitura de dado de escritório.**

É o que as Fundações já mandam (R1, 6.2: "não há código diferente por porta; só o contexto"). O que este documento acrescenta é como isso vira HTTP, MCP e contrato gerado:

```
             ┌──────────── pacotes/dominio (TypeScript, roda no navegador e no servidor) ────────────┐
             │ definição da ferramenta: nome, versão, setor, módulo, nível, esquemas Zod, aprovação,  │
             │ idempotência, evento, descricao_modelo · autorizar() · regras das entidades           │
             └───────────────┬───────────────────────────────┬──────────────────────┬─────────────┘
                             │ gera                          │ gera                 │ importa
                   openapi.json (HTTP)          ferramentas MCP por setor     frontend (usePode, otimista)
                             │                               │
 tela ── repos.* ─┐          ▼                               ▼
 app do cliente ──┼──► POST /v1/ferramentas/{nome}     /mcp, /mcp/setor/{codigo}  ◄── cliente MCP externo
 orquestrador ────┘          │                               │                       (token de serviço)
 (token de integrante)       └──────────────┬────────────────┘
 jobs (worker) ─────────────────────────────┤ em processo
                                            ▼
                          EXECUTOR: validar → idempotência → autorizar → aprovação?
                                    → transação (efeito + evento + jobs) → validar saída
```

## 2. A ferramenta como unidade

A definição tem os campos do 6.1. Os que o wireframe ainda não tem (esquemas, `descricao_modelo`, `idempotencia`, `evento`, `exposta_mcp`, `custo`, `versao`) entram no catálogo existente sem mudar os nomes. A definição mora no pacote de domínio; a implementação (SQL), só no servidor.

```ts
// pacotes/dominio/ferramentas/painel/tarefa.ts (definição: navegador e servidor)
export const tarefaConcluir = definirFerramenta({
  nome: 'tarefa.concluir', versao: 1, modulo: 'painel', setor: 'alvo', nivel: 'executar',
  descricao_modelo: 'Conclui uma tarefa aberta do setor. Use quando o trabalho da tarefa terminou e o resultado foi registrado.',
  entrada: z.object({ tarefa_id: Id, resultado: z.record(z.string(), z.unknown()).optional() }),
  saida: z.object({ tarefa: Tarefa }),
  alvo: { tabela: 'tarefa', id: 'tarefa_id' },          // de onde vêm setor_id e cliente_id para autorizar
  idempotencia: 'por_chave', exige_aprovacao: 'se_fora_da_lista', irreversivel: false,
  evento: 'tarefa.concluir', custo: { classe: 'barata', externo: false },
  exposta_ao_cliente: true, exposta_mcp: true,
})

// servidor/ferramentas/painel/tarefa.ts (implementação: só servidor)
implementar(tarefaConcluir, async ({ tx, entrada, ctx, alvo }) => {
  const t = await tx.tarefas.transicionar(entrada.tarefa_id, 'concluida', regrasTarefa) // a mesma regra de transição do wireframe
  return { dados: { tarefa: t }, texto_evento: `${ctx.nome} concluiu ${t.titulo}` }
})
```

Regras do catálogo, conferidas no CI:

1. Nome `entidade.acao`, estável. Mudança incompatível de esquema sobe `versao`, e a anterior fica servida por um ciclo (6.1).
2. Toda definição tem implementação; toda implementação grava só pelo `tx` do executor (que grava o evento); toda escrita dos repositórios do frontend aponta para uma ferramenta registrada.
3. Toda ferramenta com `exposta_ao_cliente` declara o filtro de cliente; toda ferramenta `irreversivel` tem `exige_aprovacao` pelo menos `se_integrante` (6.1).
4. Os campos de saída que vêm de fora (corpo de mensagem, texto de PDF, resposta de órgão) levam a marca `.meta({ origem_externa: true })` (seção 9).
5. **Tela que precisa de dado que nenhuma ferramenta devolve é defeito do catálogo** (6.2). As leituras também são ferramentas (`tarefa.listar`, `cliente.perfil_em`, `evento.listar`), e é por isso que um agente consegue ver tudo o que uma tela mostra.

## 3. Organização por setores

O catálogo já tem `setor` (`alvo`, `geral` ou um código fixo) e `modulo` em cada ferramenta (`ferramentas.ts`). Os setores são os do pacote de área (Fundações 4.1, DA-02):

- `societario`, `fiscal`, `notas`, `dp`, `contabil`, `consultoria`, `gestao_atendimento` e `financeiro_escritorio`;
- `bpo` e `bpo_financeiro`;
- os do Jurídico, quando o pacote entrar.

| Onde o setor aparece | Como |
| --- | --- |
| **Descoberta** | `GET /v1/ferramentas?setor=fiscal` devolve as ferramentas do setor **no escopo de quem pergunta**, com o nível efetivo (`ler`, `preparar`, `executar com aprovação`, `executar`). É o que a tela usa para o rótulo do botão (6.2) e o que o MCP devolve em `tools/list` |
| **Servidor MCP** | Um endereço por recorte (seção 6): `/mcp` (tudo no escopo), `/mcp/setor/{codigo}` (o setor mais as transversais `geral` de leitura), `/mcp/modulo/{modulo}` (CRM, Financeiro, BPO). Um integrante do Fiscal não recebe 235 ferramentas no contexto; recebe as dele |
| **Telas** | `app/src/nucleo/permissoes/telas.ts` vira o catálogo de identificadores estáveis de tela (14, Fundações): `aba.fiscal`, `aba.fiscal.guias`, cada um com as ferramentas que usa. `GET /v1/telas/aba.fiscal` devolve essa composição: o agente sabe o que a pessoa vê naquela aba, e o chat monta o link "ver na aba" |
| **Autorização** | Igual à de hoje: o setor vem da ferramenta ou do registro afetado (`setor: 'alvo'`), e o vínculo da pessoa (gestão ou execução) decide. O integrante herda pela interseção com o dono (3.3) |
| **Auditoria e custo** | O evento grava `setor_id`; o painel de custo e o painel global somam por setor |

**Serviços externos são ferramentas de conector, também por setor.** Cada método das interfaces de `app/src/servicos` vira uma ferramenta do catálogo do 08, com a mesma família de nome. Exemplos:

- `servicos.integraContador.situacaoFiscal(cnpj)` → `integra.situacao_fiscal({ cliente_id })`, do setor `fiscal`;
- `servicos.whatsapp.enviar` → `conversa.responder`, irreversível;
- `servicos.dfe.distribuir` → `dfe.distribuir`, do setor `notas`.

A implementação real da interface no navegador só chama a API (ARQUITETURA do wireframe, 6: "nunca a API paga direto do navegador"), e o `Resultado<T>` sai do envelope da seção 5 (`demonstracao: false`, `fonte`, `latencia_ms`). O código API-01 a API-32 do mapa de telas passa a ser a coluna `conector` da ferramenta.

## 4. Uma fonte, vários contratos

| Gerado de `pacotes/dominio` | Para quem | Como |
| --- | --- | --- |
| Tipos TypeScript de entrada e saída | Frontend, servidor, orquestrador em TypeScript | Inferidos do Zod (`z.infer`); nada gerado em arquivo |
| `openapi.json` (OpenAPI 3.1) | Integradores, orquestrador em outra linguagem, documentação | Script `gerar-contratos`: uma operação `POST /v1/ferramentas/{nome}` por ferramenta, `z.toJSONSchema` nos corpos, `x-heild-setor`, `x-heild-nivel`, `x-heild-aprovacao`, `x-heild-idempotencia` |
| Lista de ferramentas do MCP | Servidor MCP, orquestrador | `name`, `description` (`descricao_modelo`), `inputSchema`, `outputSchema` e anotações (seção 6) |
| Catálogo legível por setor | Pessoas: produto, suporte, contadores | Markdown gerado por setor |
| Cliente tipado em Python **[se a frente de IA escolher Python]** | Orquestrador | Gerado do OpenAPI |

O CI guarda um *snapshot* dos contratos. Uma diferença sem aumento de `versao` em ferramenta que mudou de forma incompatível quebra o build.

**Nome para o modelo:** algumas APIs de modelo só aceitam `[a-zA-Z0-9_-]` em nome de ferramenta. O nome canônico continua `tarefa.concluir`; o nome exposto a modelos é `tarefa_concluir`, e o servidor MCP faz a ida e a volta.

## 5. HTTP: o mesmo pedido para a tela e para o agente

```http
POST /v1/ferramentas/tarefa.concluir
Authorization: Bearer <JWT da pessoa | token de integrante | token de serviço>
Idempotency-Key: 6f1c...            (obrigatório quando idempotencia = por_chave)
X-Heild-Tela: aba.fiscal            (só a tela manda; vale para exceção por tela e para o timesheet, 5.4)
traceparent: 00-...                 (OpenTelemetry; vai para o evento)
Content-Type: application/json

{ "tarefa_id": "tk9981" }
```

| Resultado | HTTP | Corpo |
| --- | --- | --- |
| `ok` | 200 | `{ "resultado": "ok", "dados": { ... }, "evento_id": "...", "versao": 18442, "linhas": { "tarefa": [ ... ] } }` |
| `aguardando_aprovacao` | 202 | `{ "resultado": "aguardando_aprovacao", "cartao_id": "ca...", "resumo_humano": "Transmitir PGDAS-D de outubro da Empresa X...", "expira_em": "..." }` |
| `negado` | 403 | `{ "resultado": "negado", "motivo": "Sua conta não tem esse setor." }`: a mesma frase de `ErroPermissao`; também gera evento |
| `erro` de regra | 422 | `{ "resultado": "erro", "codigo": "regra", "mensagem": "Tarefa concluída é final." }`: `ErroRegra` |
| `erro` de entrada | 400 | Os erros do Zod, por campo; o `FormularioModal` mostra cada um no seu campo |
| `erro` externo | 502 ou 503 | `{ "codigo": "esquema_externo" \| "credencial" \| "limite" \| "indisponivel", "tentar_de_novo_em": ... }`: os estados de erro que as telas já simulam |

- `linhas` traz as linhas afetadas, para o frontend reconciliar a atualização otimista ([`ARQUITETURA.md`](ARQUITETURA.md), seção 6).
- `versao` é a versão de sincronização do escritório depois da escrita.

Fora das ferramentas, só infraestrutura:

- `GET /v1/sessao`: o perfil materializado e o `permissoesDoPerfil`;
- `GET /v1/sincronizar?desde=`: as linhas mudadas desde uma versão;
- `GET /v1/eventos/fluxo`: SSE;
- `POST /v1/webhooks/{conector}`: entradas da Meta, da cobrança e das nuvens, que viram ferramenta com `origem = core` ou `evento`;
- `/v1/interno/*`: só a rede interna e o orquestrador.

## 6. Servidor MCP interno por escritório

As Fundações (6.3) pedem uma instância lógica por escritório, token ligado a um usuário e as mesmas chamadas pelo mesmo executor com `origem = api_externa`.

| Item | Desenho |
| --- | --- |
| Transporte | Streamable HTTP, no mesmo processo da API (`@modelcontextprotocol/sdk`, TypeScript) |
| "Uma instância por escritório" | Lógica: o escritório vem do token (R3), nunca da URL. Não há um processo por escritório |
| `tools/list` | Só as ferramentas `exposta_mcp` no escopo do dono do token, cortadas pelo recorte do endereço (setor ou módulo) e pelo escopo do token |
| Anotações | `readOnlyHint` se `nivel = ler`; `destructiveHint` se `irreversivel`; `idempotentHint` se `idempotencia ≠ nenhuma`; `openWorldHint` se `custo.externo` |
| `tools/call` | O mesmo executor. `aguardando_aprovacao` volta como resultado normal com o `cartao_id`, não como erro: o cliente MCP espera a decisão ou consulta `aprovacao.obter` |
| Recursos (somente leitura) | `heild://cliente/{id}/perfil?data=`, `heild://tarefa/{id}`, `heild://cliente/{id}/linha-do-tempo`: os mesmos dados das ferramentas de leitura, para clientes que preferem recurso a ferramenta |
| Autenticação | **Token de serviço** (seção 7), criado em Configurações por uma pessoa e ligado a ela. Depois, OAuth 2.1 conforme a especificação de autorização do MCP, para clientes de terceiros que o escritório queira ligar |
| Limites | Os da seção 8, por token |

O chat e os integrantes da própria Heild **podem** usar o MCP, mas o caminho padrão do orquestrador é o HTTP da seção 5, com o token de integrante. É o mesmo executor e o mesmo contrato, com menos uma camada. A escolha fica com a frente de IA.

## 7. Quem chama: atores e credenciais

| Ator (`ctx.ator`) | Credencial | Quem emite | O que o executor monta |
| --- | --- | --- | --- |
| Pessoa da equipe | JWT do Supabase Auth (ES256, verificado pelo JWKS) | Login, com MFA para o Administrador | Perfil materializado (3.2) a partir do `sub` e do `app_metadata.escritorio_id`, em cache até um evento `conta.*` |
| Pessoa do cliente (app) | JWT do Supabase Auth com `app_metadata.tipo = cliente` | Login do app (código por WhatsApp ou e-mail) | `pessoa_cliente`: só as ferramentas `exposta_ao_cliente`, só os clientes das contas dela, só as `areas` do papel (3.2, regra 3) |
| **Integrante** | **Token de integrante**: JWT de 15 minutos assinado pela API com chave própria. Claims: `escritorio_id`, `integrante_id`, `usuario_dono_id`, `sessao_integrante_id`, `origem` (chat, job, evento), `causado_por_evento_id` | `POST /v1/interno/integrantes/{id}/token`, chamado **só pelo orquestrador** (credencial de serviço na rede interna) | `integrante` com `dono` carregado **a cada chamada**: se o dono perdeu o setor agora, o integrante perde agora (3.3, R4). Irreversível vira cartão; job sem humano nunca executa o que exige aprovação (3.3) |
| Token de serviço (MCP externo, automação) | Opaco (`hsk_...`), guardado com hash, com expiração e revogável | Uma pessoa, em Configurações › Integrações | A pessoa dona, cortada pelo escopo do token (setores, ferramentas, nível máximo): igual ou menor, nunca "do escritório" (P13) |
| Sistema | Papel interno do worker | — | Só manutenção (partições, selagem, limpeza). Trabalho em nome de alguém usa o ator desse alguém |

O orquestrador **nunca** recebe o JWT de uma pessoa. Quando a pessoa conversa com um integrante, o pedido entra pela API como ferramenta (`integrante.enviar_mensagem`), e o orquestrador age com o token do integrante daquela sessão.

## 8. O executor: idempotência, limites, aprovação e trilha

A ordem é a do 6.2, com três passos acrescentados (idempotência, limites e jobs na transação):

1. **Validar a entrada** com o Zod da definição. Falha → 400, com evento `erro` só para ator integrante ou token (para medir modelo que erra esquema).
2. **Idempotência.** Com `Idempotency-Key`, procura `(escritorio_id, chave)` na tabela `idempotencia`:
   - com o mesmo hash de argumentos, devolve a resposta guardada;
   - com hash diferente, devolve 409.
   - Integrantes sempre mandam a chave, derivada de `sessao_integrante_id` mais o número do passo: uma repetição depois de queda de rede não cria duas tarefas (02, 4.5: "repete uma vez se idempotente").
3. **Limites**, que negam com o motivo:
   - por ator (pessoa: rajada de 20/s; token de serviço: o configurado);
   - por classe de custo da ferramenta (`cara` tem cota por integrante e por dia, 6.1);
   - **chamadas externas pagas por ferramenta por dia**, da configuração do escritório (02, 4.7, última linha);
   - teto de custo mensal da conexão (08, 2.3: a 80% avisa, a 100% só manual ou aprovada).
   - Os contadores de dinheiro ficam no Postgres. Os limites de passos, tempo e tokens por execução são do orquestrador; a API só guarda uma rede de segurança (por exemplo, 200 chamadas por `sessao_integrante_id`).
4. **Autorizar** com a função única do pacote de domínio (a mesma do navegador). Negado → evento `negado` e 403.
5. **Aprovação.** Se a decisão vier com `aprovacao: true` (integrante e ferramenta irreversível, `exige_aprovacao` ou atividade fora da lista "executa sozinho"):
   - grava o **cartão** com a ferramenta, a versão, os argumentos exatos, o `resumo_humano` e o `pode_aprovar` (6.4);
   - grava o evento `aguardando_aprovacao`;
   - devolve 202.
6. **Transação:**
   - fixa o escritório na conexão (RLS, a segunda barreira);
   - roda a implementação;
   - grava o **evento** com a cadeia de hash;
   - enfileira os **jobs** que a ferramenta pede (pg-boss na mesma transação);
   - guarda a resposta de idempotência;
   - faz o `commit`.
   - Se a implementação falha, o evento `erro` vai em transação própria (5.2).
7. **Validar a saída** com o Zod. Saída inválida é erro (6.1); resposta externa fora do esquema vira `esquema_externo` sem retentativa (08, 2.5).
8. **Responder** com o envelope da seção 5.

**Decidir o cartão** é também uma ferramenta: `aprovacao.decidir({ cartao_id, decisao, argumentos_editados? })`, chamada pela pessoa no chat, na Home ou na central (é o mesmo registro).

1. O executor confere se quem decide está em `pode_aprovar` e tem o nível da ferramenta.
2. Roda a ferramenta guardada com os argumentos (editados ou não), com o integrante como ator, a pessoa como `decidido_por` e o `aprovacao_id` no evento.
3. Acorda o integrante só se recusado, editado ou expirado (02, 4.2).
4. Um cartão já decidido não se decide de novo: a restrição já existe no SQL do wireframe.

**Trilha de auditoria:** toda chamada vira evento, inclusive `negado` e `erro`; as leituras vão para `evento_leitura` em lote ([`STACK.md`](STACK.md), seção 8). Correlação no evento:

- `origem`, `sessao_auth_id` ou `sessao_integrante_id`;
- `causado_por_evento_id`, `aprovacao_id`, `credencial_usada`;
- `custo` (tokens e centavos, quando a frente de IA informa, e segundos de máquina);
- `traceparent`.

As perguntas do 5.5 ("quem usou o certificado da Empresa X este mês", "o que o integrante João fez ontem e quem aprovou") se respondem com `evento.listar` e filtros, sem tabela extra.

## 9. Conteúdo externo é dado (R5)

- Campos marcados `origem_externa` no esquema de saída vão, no envelope e no `_meta` do MCP, como a lista `origem_externa: ["mensagens[].corpo", "documento.texto"]`. O orquestrador envolve esses trechos antes de passá-los a um modelo; a API não decide como.
- Texto vindo de fora nunca é interpretado pela API como comando: não existe ferramenta que receba "instrução livre" e a execute. As ferramentas que aceitam texto livre (`conversa.responder`, `parecer.rascunhar`) gravam o texto, não o executam.
- Webhooks de fora (Meta, cobrança, nuvens) entram com a assinatura do fornecedor verificada, deduplicados por `(conexao, id_externo)` (5.3) e gravados brutos antes de processar (08, C5).

## 10. Onde o orquestrador dos integrantes se liga

O orquestrador (loop do 02, seção 4; motores do 07) é outra frente e pode ser escrito na linguagem que ela escolher. O backend oferece seis pontos de encaixe, todos pela API:

| # | Encaixe | Contrato |
| --- | --- | --- |
| 1 | **Pegar trabalho** | `POST /v1/interno/fila/integrantes/pegar` (espera longa, até N itens) devolve itens de fila do 02: `mensagem_usuario`, `job`, `evento` (já agrupado e deduplicado pelo despachante), `mensagem_integrante`, `decisao_aprovacao`. Cada item traz `integrante_id`, `usuario_dono_id`, o motivo, `causado_por_evento_id` e o prazo de pulso. `.../{item}/pulso` mantém o item; sem pulso por 10 minutos, ele volta a `pendente` (02, 4.7) |
| 2 | **Agir** | Pede o token do integrante (seção 7) e chama `POST /v1/ferramentas/*` ou o MCP, como qualquer cliente. O catálogo do recorte vem de `GET /v1/ferramentas?setor=` com o token do integrante: exatamente o que o dono permite |
| 3 | **Checagem sem modelo** | `POST /v1/interno/condicoes/avaliar` roda um predicado tipado (uma ferramenta `ler` com filtro) e devolve vazio ou a lista. O despachante já usa isso para gatilhos; o orquestrador usa para jobs agendados (02, 4.2) |
| 4 | **Falar com a pessoa** | Resposta de chat em fluxo: `POST /v1/interno/sessoes/{id}/fluxo` com pedaços de texto. A API repassa por SSE só às sessões da pessoa dona. A mensagem final é gravada por `integrante.responder` (ferramenta com evento). Avisos passam por `notificacao.publicar` (8, regra 1) |
| 5 | **Registrar custo e sessão** | `integrante.sessao.fechar({ custo, passos, resultado })`: vira sessão de trabalho do timesheet (5.4, regra 9) e alimenta o custo por escritório |
| 6 | **Ser acordado** | O **despachante** é parte do backend (worker em TypeScript), não do orquestrador. Ele lê a cauda da tabela `evento` com um cursor e casa cada evento com os **gatilhos** ativos (entidade do 9). Para cada evento que casa: (a) deduplica por `(gatilho_id, chave_dedupe)` na janela; (b) agrupa por `agrupar_por` ("12 documentos da Empresa X"); (c) confere com `autorizar` em nível ler se o dono veria o evento; (d) roda a checagem sem modelo; (e) enfileira o item `evento` na fila do integrante com `causado_por_evento_id` (5.7). Os eventos iniciais são os do 5.7 (`documento.registrar`, `tarefa.atrasar`, `conversa.sem_resposta_24h`, `mensagem.receber`, `certificado.vencer_em_30_dias`...) |

O que o backend **não** faz: escolher modelo, montar prompt, compactar contexto, memória semântica, roteador e motores. Essas peças usam as ferramentas acima. A memória dos integrantes é uma tabela com RLS que o backend guarda e expõe por ferramentas (`memoria.*`), mas a política de memória é da outra frente.

## 11. A tela e o agente usam a mesma API

| Coisa | Tela (frontend) | Integrante (orquestrador) | Cliente MCP |
| --- | --- | --- | --- |
| Descobrir o que pode | `GET /v1/sessao` + o mesmo `autorizar` local (`usePode`, `SePode`) | `GET /v1/ferramentas?setor=` com o token do integrante | `tools/list` |
| Ler | `repos.x.listar` sobre o cache, mais `useConsulta('documento.listar', ...)` para as tabelas grandes | `POST /v1/ferramentas/documento.listar` | `tools/call documento_listar` |
| Escrever | `repos.tarefas.mudarStatus(id, 'concluida')` → aplica local (otimista) e chama `POST /v1/ferramentas/tarefa.concluir` | A mesma chamada | A mesma chamada |
| Aprovação | Mostra o cartão; `aprovacao.decidir` | Recebe 202 e suspende a sessão | Recebe o `cartao_id` |
| Mudanças de outros | SSE `GET /v1/eventos/fluxo` | Gatilhos pelo despachante | — |
| Erros | `ErroPermissao` e `ErroRegra` com a frase pronta (`useAcao` vira toast) | O mesmo `motivo` | O mesmo texto em `isError` |

O frontend continua com a mesma forma de pensar: `repos`, `usePode` e `useAcao` não mudam de assinatura. O que muda é o que existe embaixo deles ([`ARQUITETURA.md`](ARQUITETURA.md), seção 6).

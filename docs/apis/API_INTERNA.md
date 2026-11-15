# API interna da Heild: o que o frontend e os agentes chamam (pacote Contábil)

**Versão 0.1 · 15/11/2026 · desenho, nada implementado.** Branch `wf-backend-apis`, sobre o `wf-backend-stack`. Escopo: **só o pacote Contábil** (setores Societário, Fiscal, Notas, DP, Contábil, Consultoria, mais Gestão e os módulos que o Contábil usa). BPO e Jurídico ficam fora; onde uma ferramenta já existe no wireframe para o BPO, ela só é citada.

Este documento **não repete** o contrato que já está decidido em [`../backend/AGENTICO.md`](../backend/AGENTICO.md) (executor, ferramenta como unidade, procedimentos, MCP na borda, atores, cartão). Ele usa esse contrato para dizer **quais** ferramentas e grupos de endpoint existem, por setor, e **como** cada uma se comporta para o agente gastar pouco e errar pouco. As APIs externas que estão por trás das ferramentas de conector estão em [`CATALOGO_CONTABIL.md`](CATALOGO_CONTABIL.md); a ordem de construção, em [`ORDEM_DE_IMPLEMENTACAO.md`](ORDEM_DE_IMPLEMENTACAO.md).

Fontes: catálogo de ferramentas do wireframe (`app/src/nucleo/permissoes/ferramentas.ts` e `ferramentas-financeiro.ts`, 235 ferramentas), as interfaces de `app/src/servicos`, as ações S02 a S04, S09 e S10 do [`MAPA_DE_TELAS.md`](../wireframe/MAPA_DE_TELAS.md), Fundações 6, subplanos 03, 06, 07 e 08, e a seção 9 da avaliação dos integrantes (`docs/integrantes/AVALIACAO.md`, branch `wf-integrantes-pesquisa`).

## Resumo

1. **Uma porta só:** `POST /v1/ferramentas/{nome}` (HTTP) e `/mcp/setor/{codigo}` (MCP) chamam o mesmo executor. Fora disso, só infraestrutura (sessão, sincronização, SSE, webhooks, interno). Nada de REST por recurso escrito à mão.
2. **Três camadas por setor:** operações de processo (uma por procedimento: o agente chama uma vez e o motor faz os passos), contexto e resolução (leituras feitas para o agente) e operações de entidade (as 235 de hoje, para tela e para o planejador de exceção).
3. **O recorte de um integrante do Fiscal tem 31 ferramentas**, não 235 (seção 5.4). O maior recorte do Contábil fica em ~9 mil tokens de esquema, abaixo do limite de ~10 mil em que vale ligar busca de ferramentas.
4. **Toda resposta para agente é compacta:** totais, até 20 linhas, `ha_mais`, cursor, ids, nenhum texto livre que o modelo precise reescrever. Teto declarado por ferramenta e medido no CI.
5. **Erro acionável sempre:** `codigo` estável, `campo`, `mensagem` para a pessoa e `acao_sugerida` com ferramenta e entrada prontas. 42 códigos comuns na seção 2.4.
6. **Idempotência obrigatória** em todo `executar` (cabeçalho `Idempotency-Key`), com chave derivada automaticamente no motor de procedimentos. Repetir é seguro; mudar os argumentos com a mesma chave é 409.
7. **`validar_apenas: true`** em toda ferramenta `rascunhar` e `executar`: o agente sabe que vai falhar antes de tentar, sem efeito e sem custo externo.
8. **Ids, nunca nomes:** toda ação recebe `cliente_id`; nome vira id só por `cliente.resolver`, que devolve `AMBIGUO` com candidatos quando há dúvida.
9. **Conectores externos nunca são chamados pelo agente:** cada método de `app/src/servicos` vira uma ferramenta de conector, com fila, retentativa, teto de custo e cofre. A tabela da seção 7 liga cada método à ferramenta e ao código API-xx.
10. **Quatro audiências:** `cliente` (app, público na internet), `equipe` (tela e chat), `agente` (integrante, operário, orquestrador) e `servico` (worker, webhook, rede interna). A coluna "Exposição" de cada tabela diz quem vê o quê.
11. **Versionamento por ferramenta**, não por URL: `versao` sobe em mudança incompatível; a anterior fica servida por um ciclo (90 dias). O prefixo `/v1` só muda se o envelope mudar.
12. **Limites por ator e por dinheiro:** taxa por pessoa, por integrante e por token de serviço; chamadas externas pagas por ferramenta por dia; teto mensal por conexão (a 80% avisa, a 100% só manual ou aprovado).
13. **Ciência e irreversíveis sempre com cartão:** abrir caixa postal, DTE ou intimação, transmitir, enviar ao cliente, manifestar, mandar lote ao core. O agente nunca recebe `executar` direto nessas.
14. **O app do cliente é a única superfície pública:** 46 ferramentas `exposta_ao_cliente` no Contábil, todas filtradas pelos clientes e áreas da pessoa, com limite de taxa mais baixo e sem MCP.
15. **Lacunas do catálogo do wireframe:** cerca de 68 ferramentas novas (operações de processo, contexto e conector) entram no `pacotes/dominio`; a lista está na seção 8.

---

## 1. As quatro audiências

| Audiência | Credencial | Por onde chama | O que vê | Limite de taxa (proposta) |
| --- | --- | --- | --- | --- |
| **`cliente`** (pessoa do cliente no app) | JWT do Supabase Auth com `tipo = cliente` | `POST /v1/ferramentas/{nome}` pelo app; nunca MCP | Só `exposta_ao_cliente`, só os clientes e as `areas` dela (Fundações 3.2, regra 3) | 60 chamadas/min por pessoa; 10/min em ferramentas com custo externo |
| **`equipe`** (pessoa do escritório) | JWT, MFA obrigatório para Administrador | Tela (repos, `useConsulta`) e chat | Tudo que `autorizar` deixa, visão `tela` | 300/min por pessoa; 30/min em custo externo |
| **`agente`** (integrante, passo de procedimento, operário, orquestrador) | Token de integrante de 15 min (orquestrador); contexto interno (motor) | `POST /v1/ferramentas/{nome}` e `/mcp/setor/{codigo}`, `/v1/interno/*` | Interseção do integrante com o dono (R4); visão `compacta` por padrão; operário só `ler` da lista do contrato | 120/min por integrante; orçamento diário de tokens e de custo externo do 02, 4.7 |
| **`servico`** (worker, webhook, token de serviço MCP externo) | Papel interno; `hsk_...` com escopo | Rede interna; `/mcp` com token de serviço | Token de serviço: o escopo da pessoa dona ou menor (P13) | Token de serviço: 120/min; webhooks: sem limite de taxa, com assinatura e dedupe |

Regras:

- **Público é só o app.** Nenhuma ferramenta de conector, de configuração ou de exceção é `exposta_ao_cliente`. O app chama ferramentas de negócio (`pendencia.enviar`, `guia.informar_pagamento`); a ferramenta é que, no servidor, chama o conector quando precisa.
- **"Só para agentes"** quer dizer: ferramentas de contexto e de orquestração (`contexto.carregar`, `execucao.obter`, `validador.executar`, `procedimento.listar`, `/v1/interno/*`). A tela não precisa delas (lê o mesmo estado por `useConsulta`), e o app não as vê.
- **Interno de serviço** é o que só worker e webhook chamam: `documento.registrar_leitura` (worker Python), `captura.registrar_lote` (coletor), `webhook.receber`. Não aparece em nenhum recorte.

---

## 2. Convenções

### 2.1 Endereços e versionamento

| Item | Regra |
| --- | --- |
| Ferramenta | `POST /v1/ferramentas/{nome}`; nome `entidade.acao` estável (AGENTICO 3). No MCP o nome vira `entidade_acao` (algumas APIs de modelo só aceitam `[a-zA-Z0-9_-]`) |
| Versão da ferramenta | Campo `versao` no catálogo. Mudança incompatível de entrada ou saída sobe a versão; a anterior é servida **por 90 dias** com o cabeçalho `Deprecation` e `Sunset`. O cliente fixa versão com `X-Heild-Versao-Ferramenta: tarefa.concluir=2` quando precisa; sem o cabeçalho, recebe a atual |
| Versão do envelope | O `/v1` só muda se o envelope (2.2) ou a autenticação mudar. Não há `/v2` por causa de uma ferramenta |
| Versão do catálogo | `GET /v1/ferramentas` devolve `catalogo_hash`. O orquestrador inclui o hash na chave do cache de prompt; mudou o hash, o recorte é relido |
| Procedimento | `procedimento_versao` (AGENTICO 4.2). Execução em andamento termina na versão em que começou |
| Conector | `versao_adaptador` e `versao_api_externa` (08, 2.1). A mudança anunciada do órgão roda em paralelo até a data de corte; não muda o contrato da ferramenta |

### 2.2 O envelope

É o da seção 8 do AGENTICO, com dois acréscimos para agente:

```json
{
  "resultado": "ok",
  "dados": { "...": "visão compacta ou de tela" },
  "pagina": { "cursor": "eyJ...", "ha_mais": true, "total": 143 },
  "cartoes": [ { "tipo": "tabela", "id": "ct_...", "titulo": "12 notas de outubro" } ],
  "origem": [ { "marca": "k-91", "ferramenta": "calculo.das", "evento_id": "ev_..." } ],
  "origem_externa": ["dados.mensagens[*].assunto"],
  "evento_id": "ev_...", "versao": 18442, "linhas": { "tarefa": ["..."] },
  "custo": { "centavos_externos": 24, "conector": "integra_contador", "teto_mes_pct": 41 }
}
```

- `origem`: marcas `[k-…]` (cálculo), `[e-…]` (evento ou registro), `[t-…]` (texto legal) que o validador `origem_de_todo_numero` confere na saída de quem escreve (07, 7).
- `origem_externa`: caminhos dos campos que vieram de fora (XML, mensagem de órgão, texto do cliente). O runner envelopa esses campos como dado antes de passar a um modelo (R5, C6).
- `custo`: só aparece quando houve chamada externa paga. Serve para o agente não repetir consulta paga sem motivo e para a pessoa ver o teto.

### 2.3 Resultados e códigos HTTP

Iguais ao AGENTICO 8: `ok` 200, `em_execucao` 202, `aguardando_aprovacao` 202, `validado` 200, `negado` 403, `erro` de regra 422, `erro` de entrada 400, `erro` externo 502/503, conflito de idempotência 409, limite 429.

### 2.4 Erro acionável

Formato único:

```json
{
  "resultado": "erro",
  "codigo": "FALTA_EXTRATO",
  "campo": "extratos[conta=itau-0001]",
  "mensagem": "Falta o extrato de outubro da conta Itaú 0001.",
  "acao_sugerida": { "ferramenta": "pendencia.cobrar", "entrada": { "cliente_id": "c203", "item": "extrato", "competencia": "2026-10" } },
  "tentar_de_novo_em": null,
  "detalhes": { "contas_ok": 2, "contas_faltando": 1 }
}
```

Regras: `codigo` é estável e documentado na ferramenta; `mensagem` é a frase pronta para a pessoa (o modelo não precisa redigir); `acao_sugerida` só aparece quando existe um próximo passo determinístico e o ator tem permissão para ele (a sugestão já passa por `autorizar`); `detalhes` é curto e sem dado pessoal.

Códigos comuns (cada ferramenta declara os seus além destes):

| Grupo | Códigos |
| --- | --- |
| Entrada e identidade | `ENTRADA_INVALIDA`, `CLIENTE_NAO_ENCONTRADO`, `AMBIGUO`, `FORA_DO_ESCOPO`, `COMPETENCIA_INVALIDA`, `COMPETENCIA_FECHADA` |
| Permissão e alçada | `SEM_SETOR`, `SEM_CARTEIRA`, `PAPEL_INSUFICIENTE`, `EXIGE_APROVACAO`, `FORA_DA_LISTA`, `ALCADA_EXCEDIDA`, `DONO_SEM_NIVEL` |
| Estado | `TAREFA_FINAL`, `CHECKLIST_ABERTO`, `JA_TRANSMITIDO`, `JA_ENVIADO`, `CARTAO_EXPIRADO`, `EXECUCAO_EM_ANDAMENTO`, `VERSAO_DESATUALIZADA` |
| Pré-requisito do processo | `FALTA_DOCUMENTO`, `FALTA_EXTRATO`, `FALTA_FOLHA`, `FALTA_RECEITA`, `FALTA_PROCURACAO`, `FALTA_CERTIFICADO`, `PERFIL_INCOMPLETO`, `DIVERGENCIA_NAO_RESOLVIDA` |
| Validação | `VALIDADOR_FALHOU` (com `detalhes.validador`), `PARTIDAS_NAO_FECHAM`, `VALOR_NAO_CONFERE`, `SEM_ORIGEM` |
| Idempotência e limites | `CHAVE_REUSADA` (409), `LIMITE_TAXA` (429), `TETO_CUSTO` (a conexão chegou a 100%), `ORCAMENTO_ESGOTADO` (do integrante ou da execução) |
| Externo | `CREDENCIAL` (vencida, revogada, sem serviço autorizado), `INDISPONIVEL` (com `tentar_de_novo_em`), `LIMITE_EXTERNO` (ex.: 656 da DF-e, 10 downloads/dia do eSocial), `ESQUEMA_EXTERNO`, `CAPTCHA`, `DA_CIENCIA` (a capacidade dá ciência e precisa de cartão) |

Para o agente, a regra é simples: com `acao_sugerida`, chama a sugestão ou leva à pessoa; com `tentar_de_novo_em`, não tenta antes; com `VALIDADOR_FALHOU`, escala uma vez (AVALIAÇÃO 7.2); nos demais, cartão "não consegui, falta X".

### 2.5 Idempotência

| Nível | Regra |
| --- | --- |
| `ler` | Natural; sem chave |
| `rascunhar` | Chave opcional; o rascunho tem id e repetir devolve o mesmo |
| `executar` | **`Idempotency-Key` obrigatório.** Guardado 7 dias por `(escritorio_id, chave)` com o hash dos argumentos. Mesmo hash: devolve a resposta guardada (inclusive `aguardando_aprovacao` com o mesmo cartão). Hash diferente: 409 `CHAVE_REUSADA` |
| Motor de procedimentos | Chave derivada de `(execucao_id, passo, tentativa)` |
| Orquestrador | Chave derivada de `(sessao_integrante_id, passo)`; o integrante nunca inventa chave |
| Conector externo | Além da chave interna, a chave natural do órgão: NSU, chave de acesso, id da mensagem, número do recibo. Transmitir duas vezes a mesma declaração é bloqueado por `JA_TRANSMITIDO` antes de sair |

### 2.6 Paginação e visão compacta

- **Cursor sempre, `offset` nunca** em lista que pode crescer. O cursor é opaco (base64 de `(ordenacao, id)`), vale 24 h e carrega o filtro; mudar o filtro com o mesmo cursor é `ENTRADA_INVALIDA`.
- **`visao: "compacta" | "tela"`**. Agente usa `compacta` por padrão: até 20 linhas, campos com nome curto, datas ISO, valores em centavos inteiros, enums em vez de rótulos. Tela usa `tela`: até 100 linhas e os campos que o componente mostra.
- **Totais antes das linhas.** Toda lista compacta começa com contagens por estado (`{abertas: 12, atrasadas: 3}`); o agente decide se precisa das linhas.
- **Teto de tamanho declarado** por ferramenta (`max_tokens_compacta`, padrão 1.500); o CI mede a resposta típica com dados de demonstração e falha acima do teto.
- **Campos sob demanda.** Corpo de mensagem, XML, texto de documento e histórico nunca vêm numa lista; vêm por `*.obter` com o id, e de preferência resumidos por quem já tem procedimento para isso.

### 2.7 Pré-validação e chamadas longas

- `validar_apenas: true` em toda ferramenta `rascunhar` e `executar`: roda esquema, `autorizar`, alçada, regras e validadores; **não** chama conector pago, não grava efeito, devolve `validado` com a lista de erros. Grava evento de leitura, não de efeito.
- Operação de processo que passa de ~5 s devolve `em_execucao` com `execucao_id`. O agente não fica esperando: o orquestrador recebe `execucao_concluida` pela fila (AGENTICO 12, encaixe 1). A tela acompanha por SSE.

### 2.8 Limites de dinheiro

| Limite | Onde vale | Ao estourar |
| --- | --- | --- |
| Chamadas externas pagas por ferramenta por dia (por escritório) | Executor, passo 3 | `LIMITE_TAXA` com a hora da virada |
| Teto mensal por conexão (Integra, InfoSimples, WhatsApp, SERPRO CNPJ) | Conector (08, 2.3) | A 80%: aviso ao Administrador. A 100%: `TETO_CUSTO` para job e integrante; pessoa pode executar com aprovação |
| Teto do plano por cliente (130% do provável, estudo de precificação 3.11) | Medição de consumo | Não bloqueia; vira excedente a custo + 20%, com aviso a 80% |
| Orçamento da execução e do integrante | Runner de operários | `ORCAMENTO_ESGOTADO`; execução `parcial` e cartão |
| Consulta repetida | Conector | Resultado de consulta paga fica em cache por janela declarada (ex.: situação fiscal 24 h, certidão até o vencimento, CNPJ 30 dias); repetir dentro da janela devolve o guardado com `cache: true` e custo zero, a menos que `forcar: true` com motivo |

---

## 3. Endpoints de infraestrutura

| Endpoint | Para quem | Exposição | O que faz |
| --- | --- | --- | --- |
| `GET /v1/sessao` | Tela, app | equipe, cliente | Perfil materializado, setores, escopo, versão do catálogo |
| `GET /v1/sincronizar?desde=&classes=` | Tela, app | equipe, cliente | Delta das tabelas de classe 1 e 2 (ARQUITETURA 6) |
| `GET /v1/eventos/fluxo` | Tela, app | equipe, cliente | SSE `{tabela, ids, versao}` filtrado por `autorizar` |
| `GET /v1/ferramentas?setor=&recorte=` | Orquestrador, tela de integrações | agente, equipe | Recorte com nível efetivo e `catalogo_hash` |
| `GET /v1/telas/{id}` | Orquestrador, chat | agente | Ferramentas que a tela usa, para o link "ver na aba" |
| `/mcp/setor/{codigo}` e `/mcp/setor/{codigo}/excecao` | Orquestrador, cliente MCP externo | agente, servico | Mesmas ferramentas, Streamable HTTP |
| `/mcp/modulo/{modulo}` | Idem | agente, servico | CRM, Financeiro, Arquivos, Timesheet |
| `POST /v1/webhooks/{conector}` | Meta, bancos, assinatura, nuvens | servico | Assinatura verificada, bruto gravado, dedupe por `(conexao, id_externo)` |
| `POST /cofre/v1/credenciais` | App e tela de conectores | equipe, cliente | PFX e senha direto ao serviço `cofre`, sem passar pela API principal (STACK 9) |
| `/v1/interno/*` | Orquestrador, workers | agente, servico | Fila de integrantes, token, condições, fluxo de texto (AGENTICO 12) |

---

## 4. Transversais: contexto, resolução e motores

Valem para todos os setores e entram em todos os recortes.

| Ferramenta | Nível | Exposição | Entrada → saída (compacta) | Por que existe |
| --- | --- | --- | --- | --- |
| `cliente.resolver` | ler | equipe, agente | `{texto}` → `[{cliente_id, nome, cnpj_mascarado, confianca}]` ou `AMBIGUO` | Cliente errado é o erro mais grave; ação só aceita id |
| `pessoa.resolver` / `identidade.resolver` | ler | equipe, agente | Número, e-mail, CPF ou nome → pessoa, contas, conversa aberta | Mesma regra para pessoa |
| `contexto.carregar` | ler | agente | `{cliente_id, processo, competencia, orcamento_tokens}` → blocos em ordem fixa com id e hash: perfil na data, pendências, últimos 10 eventos do processo, execuções abertas, memória relevante | Uma chamada em vez de cinco; cortada pelo orçamento; pronta para cache |
| `cliente.perfil_em` | ler | equipe, agente | `{cliente_id, data}` → versão do perfil | Regime, CNAE, UF, IE e IM na data certa |
| `pendencia.listar` | ler | equipe, agente, cliente | `{cliente_id?, competencia?, setor?}` → itens com dias em espera e cobranças | O que falta do cliente (CTB-201) |
| `tarefa.listar` | ler | equipe, agente, cliente (as dele) | Filtros fechados → totais + 20 linhas | Já existe; ganha visão compacta |
| `execucao.obter` / `execucao.listar` | ler | agente, equipe | Estado, passo, validadores, custo | Retomar pelo estado, não pelo transcript |
| `procedimento.listar` | ler | agente, equipe | `{setor}` → procedimentos ativos, versão, taxa de aprovação, "faz sozinho" | O programa do integrante visto pelo sistema |
| `validador.executar` | ler | agente | `{nome, dados}` → `{ok, falhas}` | Para o planejador de exceção conferir o que montou |
| `aprovacao.decidir` | executar | equipe, cliente (cartões dele) | `{cartao_id, decisao, argumentos_editados?}` | Já existe; retoma a execução parada |
| `calculo.*` (M3) | ler | equipe, agente, cliente (as do Consultor da empresa) | Entradas tipadas + `data_de_referencia` → número com marca `[k-…]` e memória de cálculo | Número só do servidor (07, 5). Catálogo inicial de 22 funções, fase 1: `rbt12`, `folha_12m`, `fator_r`, `simples_aliquota_efetiva`, `das`, `sublimite`, `projetar_receita`, `multa_juros`, `prazo_ciencia`, `inss_folha`, `irrf_folha`, `pro_labore`, `pro_labore_fator_r`, `retencoes_nota`, `mei_limite` |
| `legal.consultar` (M1) | ler | equipe, agente, cliente (modo Consultor da empresa) | Pergunta + data → resposta com citação `[t-…]`, grau de segurança ou abstenção | Regra legal só do M1; a implementação é da frente de IA |
| `escritorio.buscar` (M2) | ler | equipe, agente | Texto + filtros → trechos com origem | Pareceres e respostas anteriores |
| `integrante.responder` | executar | agente | Texto curto + `cartoes` gerados pelo sistema | O modelo escreve só o texto em volta dos cartões |
| `notificacao.publicar` | executar | agente, servico | Aviso no sino, push ou WhatsApp conforme preferência | Já existe |

---

## 5. Por setor

Para cada setor: **operações de processo** (uma por procedimento, a forma que o integrante usa), **contexto do setor** e **operações de entidade** (as do wireframe, para tela e exceção). A coluna "Conector" aponta para o catálogo externo. "Cartão" quer dizer que, para integrante, a ferramenta sempre devolve `aguardando_aprovacao`.

Notação de exposição: **C** = app do cliente, **E** = equipe (tela e chat), **A** = agente (recorte do setor), **X** = só no recorte `excecao`.

### 5.1 Societário (telas S02-T02, S02-T05, S04-T07 a S04-T09)

| Ferramenta | Tipo | Nível | Expos. | Procedimento / atividade | Conector | Observação |
| --- | --- | --- | --- | --- | --- | --- |
| `cliente.cadastrar_por_cnpj` | processo | executar | E, A | SOC-001 | CNPJ (dados abertos → SERPRO) | Cria cliente com perfil v1 marcado "da Receita, a conferir"; `validar_apenas` mostra o que veio antes de gravar |
| `cliente.conferir_com_receita` | processo | rascunhar | E, A | SOC-002, SOC-003 | CNPJ; eventos PJ do Integra | Diferenças campo a campo; vira `cliente.versionar_perfil` com cartão |
| `procuracao.pedir` | processo | executar | E, A | SOC-011 | — | Pendência no app com o passo a passo do e-CAC |
| `procuracao.conferir` | processo | executar | E, A | SOC-012 | Integra (OBTERPROCURACAO41) | Confirma e registra `procuracao_rfb`; diário pelos eventos de atualização |
| `certificado.pedir_a1` | processo | executar | E, A | 06 6.1 | — | Só nasce se `perfil_captura` disser que o A1 é o único caminho |
| `contrato.preparar` / `contrato.enviar_assinatura` | processo | rascunhar / executar, cartão | E, A | SOC-015, SOC-016 | Assinatura | Irreversível |
| `legalizacao.abrir_processo` / `legalizacao.registrar_andamento` | processo | executar | E, A | SOC-025 a 033 | InfoSimples (JUCESP) no que houver; resto D-assistido | Checklist por tipo de ato |
| `cliente.gerar_jornada` | processo | executar | E, A | CIC-001, CIC-003 | — | Trilha de entrada ou saída |
| `cliente.dossie_saida` | processo | rascunhar | E, A | 03 8.3 | Arquivos | Dossiê ao sucessor só com cartão |
| `cliente.listar`, `cliente.perfil_em`, `pessoa.resolver` | contexto | ler | E, A | — | — | |
| `cliente.criar`, `.atualizar`, `.versionar_perfil` (cartão), `.corrigir_perfil`, `.mudar_estado`, `.fundir`, `.arquivar`, `.servico_extra`, `pessoa.criar`, `.atualizar`, `app.convidar`, `app.revogar_acesso`, `credencial.registrar`, `domicilio_judicial.listar` | entidade | executar / ler | E, X | — | — | Já no wireframe (exceto `domicilio_judicial.listar`, que lista sem dar ciência) |

### 5.2 Obrigações (S02-T03)

| Ferramenta | Tipo | Nível | Expos. | Procedimento | Conector | Observação |
| --- | --- | --- | --- | --- | --- | --- |
| `obrigacao.gerar_calendario` | processo | executar | E, A | FIS-001 | — | Idempotente por `(cliente, competencia, obrigacao)`; o job do dia 1 chama esta |
| `obrigacao.cobrar_prerequisitos` | processo | executar | E, A | FIS-046 | WhatsApp, e-mail (pela régua) | Agrupa por cliente; mensagem só por modelo aprovado |
| `obrigacao.anexar_recibo` | processo | executar | E, A | FIS-003 | Integra, eSocial, Reinf (consulta de recibo) | Concluí a tarefa por evidência |
| `obrigacao.estimar_multa` | contexto | ler | E, A, C | FIS-047 | BCB SGS (Selic) | Chama `calculo.multa_juros` |
| `obrigacao.listar_aplicaveis`, `obrigacao.semana_da_carteira` | contexto | ler | E, A | — | — | A segunda é nova: a semana em compacto |
| `obrigacao.criar`, `.atualizar`, `.cancelar`, `.prorrogar`, `.reprogramar_interno`, `.marcar_eventual`, `.editar_regra_uf` | entidade | executar | E, X | — | — | Já no wireframe |

### 5.3 Notas (S02-T04)

| Ferramenta | Tipo | Nível | Expos. | Procedimento | Conector | Observação |
| --- | --- | --- | --- | --- | --- | --- |
| `notas.conferir_entrada` | processo | rascunhar | E, A | NFE-023 a 027 (procedimento de referência da F3) | — | Regras de NCM, CST, CFOP; operário barato só no que as regras não resolvem |
| `notas.capturar_agora` | processo | executar | E, A | NFE-004, 006, 007 | DF-e, ADN, web services RS e SC | É o "forçar captura"; respeita 656 e 137 (`LIMITE_EXTERNO` com `tentar_de_novo_em`) |
| `notas.manifestar` | processo | executar, cartão | E, A | NFE-014 (ciência automática se autorizada), 015, 016 | DF-e (evento de manifestação) | Conclusivo é irreversível |
| `notas.verificar_completude` | processo | ler | E, A | NFE-020, 021, 022 | — | Buracos de sequência e receita × declarada |
| `notas.enviar_ao_core` | processo | executar, cartão | E, A | NFE-033 | Core (Domínio API; Alterdata, Contmatic por pasta) | Lote por competência; erro do core vira tarefa com o motivo |
| `notas.registrar_nfse_municipal` | processo | executar | E, A, C | NFE-008 | OCR (worker Python) | PDF ou XML enviado pelo app ou e-mail |
| `notas.emitir_nfse` | processo | executar, cartão | E, A, C | NFE-039 | NFS-e Nacional (Sefin, DPS) | Do cliente, pelo app; `validar_apenas` confere DPS antes |
| `notas.pacote_guarda` | processo | executar | E, A | NFE-036 | S3 | |
| `perfil_captura.obter` | contexto | ler | E, A | NFE-001, 003 | — | Caminho e credencial por documento; cobertura |
| `captura.saude` | contexto | ler | E, A | — | — | "captura ok hoje 03:12 · NSU 18.442" |
| `nota.listar_saidas`, `nota.listar_entradas` | contexto | ler | E, A | — | — | Totais e 20 linhas; XML nunca inteiro |
| `notas.forcar_captura`, `notas.configurar_captura`, `nfse.emitir`, `nfse.cancelar` | entidade | executar | E, X | — | — | Já no wireframe |

### 5.4 Fiscal (S03-T01)

| Ferramenta | Tipo | Nível | Expos. | Procedimento | Conector | Observação |
| --- | --- | --- | --- | --- | --- | --- |
| `caixa_postal.verificar` | processo | ler | E, A | FIS-005 (parte sem ciência) | Integra: eventos de atualização (grátis) e lista (Consulta) só se houver novidade | Devolve assunto, data, `data_ciencia_tacita` (por `calculo.prazo_ciencia`); **nunca abre** |
| `caixa_postal.abrir` | processo | executar, **sempre cartão** | E | FIS-005 | Integra (detalhe): **dá ciência** | `da_ciencia: true`; não entra no recorte do agente como executar; o agente só pode pedir o cartão |
| `situacao_fiscal.gerar` | processo | executar | E, A | FIS-006 | Integra SITFIS (2 chamadas) | Cache de 24 h; positiva abre FIS-008 |
| `pgdas.preparar` | processo | rascunhar | E, A | FIS-009, 011, 012 | — (M3: `rbt12`, `fator_r`, `das`) | Receita das notas capturadas; divergência vira erro `DIVERGENCIA_NAO_RESOLVIDA` |
| `pgdas.transmitir` | processo | executar, cartão | E, A | FIS-009 | Integra (Declaração) | `JA_TRANSMITIDO` antes de sair |
| `pgdas.transmitir_lote` | processo | executar, cartão (gestão) | E, A | 02 3.2 | Integra | Um cartão com a lista; cada item idempotente |
| `guia.gerar` | processo | rascunhar | E, A | FIS-010, 021, 025 | Integra (DAS, Sicalc: Emissão); estaduais pelo core | PDF como Documento `tipo = guia` |
| `guia.enviar_ao_contato` | processo | executar, cartão | E, A | FIS-010 | WhatsApp (utilidade) ou e-mail; app | O exemplo da AVALIAÇÃO 9.1: substitui 4 chamadas |
| `guia.verificar_pagamento` | processo | ler | E, A | FIS-032 | Integra PAGTOWEB (Consulta) em D-2 e D+1 | Só se o cliente não informou no app |
| `guia.recalcular_vencida` | processo | executar | E, A, C | FIS-201 | Integra (Sicalc, Emissão; 1 por dia por cliente) | |
| `declaracao.conferir` | processo | rascunhar | E, A | FIS-019 (DCTFWeb), FIS-020 (Reinf) | Integra (DCTFWeb); EFD-Reinf (consulta) | |
| `parcelamento.listar` | contexto | ler | E, A | FIS-034 | Integra (parcelamentos SN e MEI) | |
| `certidao.emitir` | processo | executar | E, A, C | FIS-036, 037 | InfoSimples (estaduais, municipais); federal por agregador [a confirmar] | Cache até o vencimento; positiva chama SITFIS |
| `dte.verificar` | processo | ler | E, A | FIS-026, 029 | InfoSimples (SP, MG, PR, SC, DEC SP), com A1 do cliente e termo | Primeira semana de cada escritório com aprovação do Gestor (08, 5.2) |
| `dte.abrir` | processo | executar, **sempre cartão** | E | FIS-026 | InfoSimples: **dá ciência** | Igual ao `caixa_postal.abrir` |
| `intimacao.preparar_resposta` / `intimacao.responder` | processo | rascunhar / executar, cartão | E, A | FIS-038 a 040 | — | Resposta é D-assistido (sem API de envio) |
| `fiscal.resumo_do_mes` | processo | rascunhar | E, A | FIS-033 | — | Envio ao cliente com cartão |
| `irpf.preparar` / `fiscal.irpf.transmitir` | processo | rascunhar / executar, sempre cartão | E, A | PF-003 a 009 | Sem API (Receitanet) [a confirmar] | Fase posterior |
| `fiscal.caixa_postal.ler`, `.situacao.consultar`, `.conferencia.aprovar`, `.declaracao.*`, `.guia.*`, `.certidao.emitir`, `.intimacao.responder`, `.resumo.enviar` | entidade | | E, X | — | — | Os nomes atuais do wireframe ficam como as operações de entidade que as de processo usam por dentro |

**Tamanho do recorte do Fiscal:** 17 operações de processo visíveis ao agente (as duas que dão ciência ficam só na tela) + `parcelamento.listar` + `tarefa.concluir` e `tarefa.enviar_revisao` + 11 transversais (`cliente.resolver`, `contexto.carregar`, `pendencia.listar`, `tarefa.listar`, `execucao.obter`, `procedimento.listar`, `legal.consultar`, `integrante.responder` e as três funções `calculo.*` mais usadas pelo Fiscal) = 31 ferramentas. Com ~280 tokens de esquema em média **[estimativa, a medir no CI]**, são **~8,7 mil tokens**. É o maior do Contábil e fica abaixo de ~10 mil, então não precisa de busca de ferramentas (AGENTICO 5).

### 5.5 DP (S04-T01)

| Ferramenta | Tipo | Nível | Expos. | Procedimento | Conector | Observação |
| --- | --- | --- | --- | --- | --- | --- |
| `admissao.receber_pedido` | processo | executar | E, A, C | DP-001 (via `pedido.abrir` do app) | — | Campos validados por esquema; falta → pendência |
| `admissao.preparar_contrato` | processo | rascunhar | E, A | DP-005 | Assinatura | |
| `esocial.enviar_eventos` | processo | executar, cartão | E, A | DP-006 (S-2200), DP-038 | eSocial (lote de 50) | Assíncrono; recibo por consulta |
| `esocial.consultar` / `esocial.baixar` | processo | ler | E, A | DP-038, DP-102 | eSocial (download: 10/dia por empregador) | `LIMITE_EXTERNO` explícito |
| `folha.pedir_variaveis` | processo | executar | E, A | DP-009 | WhatsApp ou app | |
| `folha.preparar_previa` / `folha.enviar_previa` | processo | rascunhar / executar, cartão | E, A | DP-012 | — | |
| `folha.enviar_ao_core` | processo | executar, cartão | E, A | DP-013 | Core (Alterdata `movimentos`; Domínio rubricas) | |
| `folha.enviar_pacote` | processo | executar, cartão | E, A | DP-020 | App, WhatsApp | |
| `ferias.programar` | processo | executar | E, A | DP-024 | Core | |
| `rescisao.simular` / `rescisao.montar_kit` | processo | rascunhar | E, A, C (simulado) | C2-02, C2-01 | FGTS Digital: sem API (D-assistido) | |
| `boleto_terceiro.emitir` | processo | executar | E, A | C2-03 | Sem API (sindicato, convênio): D-assistido | |
| `cct.resumir` | processo | rascunhar | E, A | C2-04 | OCR + M1 | Publicar com cartão |
| `det.verificar` | processo | ler | E | DP-040 | Sem API; D-assistido com lembrete | Nunca robô na v1 |
| `folha.listar_totais` | contexto | ler | E, A | — | Core ou eSocial | Para `calculo.folha_12m` |

### 5.6 Contábil (S03-T02)

| Ferramenta | Tipo | Nível | Expos. | Procedimento | Conector | Observação |
| --- | --- | --- | --- | --- | --- | --- |
| `competencia.definir_esperado` | processo | executar | E, A | CTB-001 | — | O que deve chegar por cliente |
| `competencia.abrir` | processo | executar | E, A | CTB-002 | — | Gera pendências no app |
| `competencia.cobrar_faltantes` | processo | executar | E, A | CTB-003 | WhatsApp, app | |
| `extrato.importar` | processo | executar | E, A, C | CTB-008, D-11 | Leitor de extratos (OFX, CSV direto; PDF pelo worker Python) | Deduplica; reconhece sócio |
| `extrato.classificar_linhas` | processo | rascunhar | E, A | CTB-004 (procedimento de referência da F3) | — | Regras aprendidas → candidatas → operário barato → validadores |
| `lancamento.perguntar_ao_cliente` | processo | executar | E, A | CTB-006 | App, WhatsApp | Pergunta fechada ("o que foi isto?") com opções |
| `depara.corrigir` | processo | executar | E, A | CTB-016 | — | Vira regra aprendida |
| `conciliacao.verificar_diferencas` | processo | ler | E, A | CTB-018 | — | Abre tarefa da diferença |
| `lucros.verificar_limite` | processo | ler | E, A, C | D-12 a D-15 | — | `calculo.retiradas_socio` e alerta de R$ 50 mil |
| `contabil.enviar_lote_core` | processo | executar, cartão | E, A | CTB-047 | Core | |
| `relatorio.gerar_balancete_dre` / `relatorio.enviar` | processo | rascunhar / executar, cartão | E, A | CTB-028, D-16 | Assinatura (fila de assinatura) | |
| `declaracao_faturamento.gerar` | processo | rascunhar | E, A | C2-14 | — | |
| `ecd_ecf.preparar` / `contabil.ecd_ecf.transmitir` | processo | rascunhar / executar, sempre cartão | E, A | CTB-041, 042 | Sem API (ReceitanetBX/PGE); recibo pelo core | D-assistido na v1 |
| `open_finance.convidar` | processo | executar | E, A | CTB-010 | Open Finance (Pluggy) — módulo à parte | Fase 3 |
| `contabil.competencia.reabrir` | entidade | executar, sempre cartão (gestão) | E, X | CTB-025 | — | |
| `contabil.lista.definir`, `.triagem.confirmar`, `.extrato.importar`, `.depara.corrigir`, `.lucros.*`, `.core.enviar`, `.relatorio.*`, `.assinatura.conferir`, `.kanban.mover` | entidade | | E, X | — | — | Já no wireframe |

### 5.7 Consultoria (S03-T03)

| Ferramenta | Tipo | Nível | Expos. | Procedimento | Conector | Observação |
| --- | --- | --- | --- | --- | --- | --- |
| `parecer.rascunhar` | processo | rascunhar | E, A | CON-002 | Modelos (M1) | Sempre rascunho; pessoa revisa |
| `parecer.enviar` | processo | executar, cartão | E, A | 03 6.7 | App, e-mail | |
| `regimes.comparar` | processo | ler | E, A, C | CON-008, 010 | — | `calculo.comparar_regimes` |
| `reforma.simular` / `reforma.conferir_rfb` | processo | ler | E, A, C | CON-016 | Calculadora de Tributos RFB | Divergência entre o nosso e o oficial vira alerta |
| `vigilancia.verificar` | processo | ler | E, A | 02 10.1 | DOU, LexML | Job diário 7h |
| `consultoria.escopo.marcar`, `consultoria.cct.publicar` | entidade | executar | E, X | — | — | |

### 5.8 Gestão (S04-T02, S04-T03 a S04-T06)

| Ferramenta | Tipo | Nível | Expos. | Observação |
| --- | --- | --- | --- | --- |
| `consumo.por_cliente` | contexto | ler | E, A | GES-010: chamadas pagas por cliente e conector contra o teto |
| `carteira.redistribuir` | processo | executar, cartão | E, A | GES-018 |
| `pauta.gerar_semanal` | processo | rascunhar | E, A | C2-28 |
| `incidente_lgpd.registrar` | processo | executar | E | GES-059 |
| `conector.reprocessar` (`rotina.reprocessar`) | processo | executar | E, A | D-38 |
| `tarefa.*` (criar, iniciar, aguardar_cliente, aguardar_terceiro, enviar_revisao, concluir, cancelar, reatribuir, reordenar, checklist_marcar, arquivar), `painel.acao_lote` | entidade | executar | E, A (concluir e enviar_revisao), X (o resto) | As de tarefa entram no recorte de todos os setores, porque fechar a tarefa é parte de todo processo |
| `evento.listar`, `auditoria.verificar_cadeia` | contexto | ler | E | |

---

## 6. Módulos que o Contábil usa

### 6.1 Arquivos (S09-T01, S09-T02, S09-T08, S09-T14)

| Ferramenta | Nível | Expos. | Observação |
| --- | --- | --- | --- |
| `documento.preparar_envio` | executar | E, C, A | URL pré-assinada do S3 (5 min); a API nunca passa bytes |
| `documento.registrar` | executar | E, C, servico | Depois do upload; o worker confere tamanho e SHA-256 |
| `documento.registrar_leitura` | executar | servico | Só o worker Python (OCR, PDF, extrato) |
| `documento.listar`, `documento.obter_link` | ler | E, C, A | Lista compacta sem conteúdo; link de 5 min depois de `autorizar`; abrir pelo app grava entrega |
| `documento.classificar` | executar | E, A | Operário barato com contrato; confiança baixa vai para "triar" |
| `documento.enviar_cliente` | executar, cartão | E, A | Irreversível |
| `documento.atualizar`, `.mover`, `.arquivar`, `.forcar_visibilidade`, `.confirmar_origem`, `.resolver_conflito`, `.registrar_entrega` | executar | E, X | Já no wireframe |
| `armazenamento.configurar`, `raiox.rodar`, `raiox.decidir`, `raiox.ver_nomes` | executar / ler | E | Raio-X só lê nomes, nunca conteúdo |

### 6.2 CRM e comunicação com o cliente (S05)

O CRM inteiro é da fase F5; aqui só o que o Contábil usa para falar com o cliente.

| Ferramenta | Nível | Expos. | Observação |
| --- | --- | --- | --- |
| `conversa.rascunhar_resposta` | rascunhar | E, A | Nova; o integrante prepara, a pessoa envia |
| `conversa.responder` | executar, cartão para integrante | E, A, C | Irreversível; fora da janela de 24 h só com modelo aprovado (`MODELO_OBRIGATORIO`) |
| `mensagem.enviar_modelo` | executar | E, A | Nova; régua e avisos ("sua guia saiu"), categoria utilidade |
| `conversa.listar`, `conversa.obter` (com `resumo`), `canal.saude` | ler | E, A | Corpo da mensagem só sob demanda |
| `mensagem.transcrever` | executar | servico | Áudio → texto pelo conector de transcrição |
| `conversa.criar`, `.assumir`, `.transferir`, `.resolver`, `.nota_interna`, `lead.*` | executar | E, X | |

### 6.3 Comunicação interna (S05-T05)

`mensagem_interna.enviar`, `.editar`, `.fixar`, `conversa_interna.criar`: só **E**; integrante entra por menção, com `integrante.enviar_mensagem`. Nenhuma é exposta ao cliente nem ao MCP externo.

### 6.4 Timesheet (S06)

As 21 ferramentas `timesheet.*`, `extensao.*`, `core.conectar`, `core.equivalencia`, `ausencia.registrar` e `custo_hora.definir` já existem e são **E**. Para agente, só duas entram: `integrante.sessao.fechar` (o tempo do integrante vira sessão de trabalho) e `timesheet.listar_sessoes` em leitura para Gestão. A extensão de navegador chama `extensao.pulso` com token de dispositivo (só o identificador do portal e o CNPJ detectado).

### 6.5 Financeiro do escritório (S07)

As 37 ferramentas de `ferramentas-financeiro.ts` são **E**, com o integrante Financeiro em **A** só nas de preparar (`faturamento.preparar_lote`, `conta_pagar.classificar`, `conciliacao.confirmar` como sugestão). As que falam com fora usam conectores do catálogo: `cobranca.criar`, `.segunda_via`, `.cancelar` (banco do escritório, Asaas, Efí), `nfse.escritorio.emitir` (Emissor Nacional), `reajuste.aplicar` (BCB SGS). Do lado do cliente, **C**: `fatura.listar`, `fatura.pagar` (devolve o Pix ou boleto já emitido), `pix_automatico.autorizar`, `fatura.contestar`.

### 6.6 App do cliente (S10)

A superfície pública. Todas as ferramentas abaixo são `exposta_ao_cliente`, filtradas pelos clientes e áreas da pessoa:

| Grupo | Ferramentas |
| --- | --- |
| Entrada | `conta_cliente.aceitar_convite`, `conta_cliente.aceitar_termo`, `sessao.trocar_empresa` |
| Início e pendências | `pendencia.listar`, `pendencia.enviar` (documento ou informação), `pendencia.nao_tenho`, `pendencia.ja_fiz`, `guia.informar_pagamento`, `documento.assinar_ciencia` |
| Documentos | `documento.listar`, `documento.obter_link`, `documento.enviar_para_mim`, `documento.compartilhar` (link com validade), `documento.baixar_mes` |
| Pedidos e conversa | `pedido.abrir`, `pedido.listar`, `pedido.cancelar`, `pedido.confirmar_implicito`, `servico_avulso.autorizar`, `conversa.responder` (do cliente, sem cartão), `atendimento.avaliar` |
| Agenda | `agenda.listar_horarios`, `reuniao.marcar`, `reuniao.remarcar`, `reuniao.cancelar`, `agenda_tributaria.listar` |
| Empresa | `cliente.perfil_em` (vigente), `pessoa.listar_da_empresa`, `credencial.listar_minhas` (uso do A1 e procurações), `credencial.revogar_minha`, `termo.listar`, `acesso.listar`, `preferencia.salvar` |
| Certificado | `POST /cofre/v1/credenciais` (A1 direto ao cofre), depois `credencial.vincular` |
| Serviços extras | `notas.emitir_nfse` (cartão de confirmação do próprio cliente), `certidao.emitir`, `regimes.comparar`, `reforma.simular`, `rescisao.simular`, `guia.recalcular_vencida`, `consultor_empresa.perguntar` (franquia de perguntas) |
| Financeiro com o escritório | `fatura.listar`, `fatura.pagar`, `pix_automatico.autorizar`, `fatura.contestar`, `informe_anual.obter` |

Regras específicas do público:

- Sem MCP, sem recorte `excecao`, sem `validador.executar`.
- Toda ferramenta com custo externo pago pelo cliente final (certidão, NFS-e) passa por `servico_extra` ligado no cliente; sem ele, `SERVICO_NAO_CONTRATADO`.
- Resposta sempre em visão `tela` resumida; nunca devolve dado de outro cliente do escritório nem nome de quem da equipe fez o quê além do que o 06 permite.
- Modo leitura depois da saída do escritório (S10-A65): só leituras e download até a data de corte.

### 6.7 Configurações (S09-T03 a S09-T10)

Só **E**, com papel mínimo Administrador onde o wireframe já pede: `escritorio.configurar`, `setor.configurar`, `conta.usuario.salvar`, `conta.excecao.*`, `permissao.ver_matriz`, `integrante.configurar`, `tema.publicar`, `assinatura.alterar`, `implantacao.conduzir`. **Conectores e cofre:** `conector.ver`, `conector.habilitar` (nova; registra o aceite do termo do fornecedor), `conector.configurar`, `conector.testar`, `conector.teto`, `conector.pausar` (nova), `credencial.vincular`, `.rotacionar`, `.revogar`, `.usar` (lista de uso), `rotina.reprocessar`. Integrante só lê `conector.ver` e `credencial.usar`; vínculo, rotação e revogação por integrante sempre com cartão (08, 3.2, regra 6). `token_servico.criar` e `.revogar` (novas) emitem os `hsk_...` do MCP externo.

---

## 7. Conectores: de `app/src/servicos` para ferramentas

Cada método de serviço simulado vira uma ferramenta de conector que roda no worker, atrás de uma ferramenta de negócio. O frontend continua chamando `servicos.x.metodo(...)`; a implementação real (`definirServicos({...}, { real: true })`) chama `POST /v1/ferramentas/{conector}` e devolve o mesmo `Resultado<T>`, agora com `demonstracao: false` e `fonte` vinda do conector. Só o que é do Contábil:

| Serviço e método (wireframe) | Ferramenta de conector | Quem a usa por cima | API-xx | Conector (CATALOGO) |
| --- | --- | --- | --- | --- |
| `integraContador.situacaoFiscal(cnpj)` | `integra.situacao_fiscal({cliente_id})` | `situacao_fiscal.gerar` | API-06 | Integra Contador |
| `integraContador.transmitir(d)` | `integra.transmitir({cliente_id, declaracao, competencia, rascunho_id})` | `pgdas.transmitir`, `declaracao.*` | API-06 | Integra Contador |
| `integraContador.emitirGuia(g)` | `integra.emitir_guia({cliente_id, tributo, competencia})` | `guia.gerar` | API-06 | Integra Contador |
| `integraContador.caixaPostal(cnpj)` | `integra.caixa_postal_listar` e `integra.caixa_postal_abrir` (dá ciência) | `caixa_postal.verificar`, `caixa_postal.abrir` | API-06 | Integra Contador |
| `sicalc.recalcular(g)` | `integra.sicalc_recalcular` | `guia.recalcular_vencida` | API-06 | Integra Contador |
| `cadastros.consultarCnpj(cnpj)` | `cadastro.consultar_cnpj({cnpj, nivel: basica\|qsa\|empresa})` | `cliente.cadastrar_por_cnpj` | API-12 | Dados abertos, SERPRO Consulta CNPJ |
| `cadastros.procuracoes(cnpj)` | `integra.procuracoes({cliente_id})` | `procuracao.conferir` | API-06 | Integra Contador |
| `cadastros.domicilioJudicial(cnpj)` | `domicilio_judicial.listar` | Societário | API-32 (parte) | Domicílio Judicial Eletrônico [a confirmar] |
| `consultasLocais.estadual(uf, cnpj)` | `sefaz.situacao({cliente_id, uf})` | `situacao_fiscal.gerar` | API-07, API-14 | InfoSimples |
| `consultasLocais.municipal(municipio, cnpj)` | `prefeitura.situacao({cliente_id, municipio})` | idem | API-07, API-14 | InfoSimples |
| `certidoes.emitir(tipo, cnpj)` | `certidao.obter({cliente_id, tipo})` | `certidao.emitir` | API-13 | InfoSimples |
| `reinf.fechar(r)` / `reinf.consultar(p)` | `reinf.enviar_lote`, `reinf.consultar_lote` | `declaracao.conferir`, `obrigacao.anexar_recibo` | API-09 | EFD-Reinf |
| `nfse.emitir(dps)` / `nfse.cancelar(...)` | `nfse_nacional.emitir_dps`, `nfse_nacional.cancelar` | `notas.emitir_nfse`, `nfse.escritorio.emitir` | API-11, API-21 | NFS-e Nacional (Sefin) |
| (sem método hoje) | `dfe.distribuir`, `dfe.consultar_chave`, `dfe.manifestar` | `notas.capturar_agora`, `notas.manifestar` | API-10 | Distribuição DF-e |
| (sem método hoje) | `adn.distribuir`, `adn.eventos` | `notas.capturar_agora` | API-11 | ADN |
| (sem método hoje) | `esocial.enviar_lote`, `esocial.consultar_lote`, `esocial.baixar_eventos` | `esocial.*` | API-08 | eSocial |
| `calculadoraReforma.simular(c)` | `calculadora_rfb.calcular` | `reforma.conferir_rfb` | API-15 | Calculadora RFB |
| `indices.acumulado(indice, ate)` | `bcb.serie` | `calculo.multa_juros`, `reajuste.aplicar` | API-16 | BCB SGS |
| `coreContabil.enviarLote(l)` | `core.lancamentos_enviar`, `core.xml_enviar`, `core.folha_enviar` | `contabil.enviar_lote_core`, `notas.enviar_ao_core`, `folha.enviar_ao_core` | API-18 | Domínio, Alterdata, Questor, Contmatic |
| `cores.testarToken`, `.importarRelatorio`, `.lerAgora` | `core.testar`, `core.importar_relatorio`, `core.tarefas_listar_alteradas` | Timesheet, Configurações | API-18 | idem |
| `leitorExtratos.ler(a)` | `extrato.ler_arquivo` (OFX e CSV no worker TS; PDF no worker Python) | `extrato.importar` | API-19 | Interno |
| `openFinance.conectar`, `.transacoes` | `banco.consentimento_convidar`, `banco.transacoes_desde` | `open_finance.convidar`, `extrato.importar` | API-19 | Pluggy (fase 3) |
| `ocr.ler(documento)` | `documento.ocr` (fila `documento.ocr`) | `notas.registrar_nfse_municipal`, `documento.classificar` | API-01 (parte) | Worker Python ou fornecedor [a decidir] |
| `transcricao.transcrever(audio)` | `mensagem.transcrever` | CRM, chat | API-02 | Fornecedor de fala [a decidir] |
| `whatsapp.enviar`, `.janelaAberta` | `whatsapp.enviar`, `whatsapp.janela` | `conversa.responder`, `mensagem.enviar_modelo` | API-03 | WhatsApp Cloud API |
| `email.enviar` | `email.enviar` | idem | API-05 | Gmail, Graph, SES |
| `assinatura.enviar` / `conferenciaAssinatura.conferir` | `assinatura.enviar`, `assinatura.status`, `assinatura.validar_icp` | `contrato.enviar_assinatura`, `relatorio.enviar`, `contabil.assinatura.conferir` | API-22 | ZapSign, Clicksign, D4Sign; validador ICP |
| `armazenamento.listar`, `.enviar`, `.link`; `arvore.ler` | `nuvem.listar_delta`, `nuvem.enviar`, `nuvem.link`, `nuvem.ler_arvore` | Arquivos, Raio-X | API-24 | Drive, Graph, S3, WebDAV, SFTP |
| `cofre.guardar`, `.rotacionar`, `.revogar` | Serviço `cofre` (não é ferramenta do executor) + `credencial.vincular`, `.rotacionar`, `.revogar` | Configurações, app | API-29 | AWS KMS |
| `conectores.testar`, `.conectar`, `.reprocessar` | `conector.testar`, `conector.habilitar`, `rotina.reprocessar` | Configurações | API-06 a API-25 | todos |
| `ia.responder`, `.responderAoVivo`, `.resumir` | **Não vira ferramenta**: é o runner de operários e o orquestrador | Integrantes | API-01 | Fornecedor de modelos |

Toda ferramenta de conector: nível `ler` ou `executar`, `custo.externo = true` (anotação `openWorldHint` no MCP), `custo.tabela_ref` (linha de preço do catálogo), `credencial_exigida`, `da_ciencia` quando for o caso, saída com `origem_externa`. **Nenhuma entra em recorte de agente**; o agente chama a ferramenta de negócio, que decide se precisa do conector, olha o cache e o teto.

---

## 8. O que falta no catálogo do wireframe

O wireframe tem as operações de entidade. Faltam, para o Contábil:

| Grupo | Novas | Quantas |
| --- | --- | ---: |
| Contexto e resolução | `cliente.resolver`, `pessoa.resolver`, `contexto.carregar`, `pendencia.listar`, `execucao.obter`, `execucao.listar`, `procedimento.listar`, `validador.executar`, `captura.saude`, `perfil_captura.obter`, `consumo.por_cliente`, `obrigacao.semana_da_carteira`, `nota.listar_saidas`, `nota.listar_entradas`, `folha.listar_totais`, `parcelamento.listar` | 16 |
| Operações de processo | Societário 8, Obrigações 3, Notas 7, Fiscal 17, DP 13, Contábil 13, Consultoria 4, Gestão 3 (as das tabelas 5.1 a 5.8 que não existem hoje, descontadas as que já existem com outro nome) | 68 → **48 depois de fundir** as que são a mesma operação com nome diferente no wireframe (ex.: `fiscal.guia.gerar` = `guia.gerar`) |
| Conectores e cofre | `conector.habilitar`, `conector.pausar`, `token_servico.criar`, `token_servico.revogar` (as de conector da seção 7 são internas e não contam) | 4 |
| **Total de ferramentas expostas novas** | | **~68 [contagem aproximada; o CI dá a exata quando o pacote de domínio existir]** |

Ajustes nas que já existem:

1. Toda ferramenta ganha os campos que faltam do 6.1: esquema Zod de entrada e saída, `descricao_modelo`, `idempotencia`, `evento`, `exposta_mcp`, `custo`, `versao`, `erros`, `max_tokens_compacta`, `da_ciencia`.
2. `fiscal.caixa_postal.abrir` ganha `da_ciencia: true` e `exige_aprovacao: 'sempre'` (hoje só `irreversivel`).
3. `x.atualizar` aceita só os campos editáveis; status muda só por transição (ARQUITETURA 6.2).
4. `nfse.emitir` e `nfse.cancelar` saem do módulo `painel` com setor `geral` e passam para o setor `notas`, com `exige_aprovacao: 'se_integrante'`.

---

## 9. Como um pedido pelo chat passa por aqui

"Manda o DAS de outubro da Padaria Pão Quente" pelo chat do Assistente:

1. Assistente encaminha ao Fiscal (regra ou classificador barato; frente de IA).
2. Integrante chama `cliente.resolver({texto: "Padaria Pão Quente"})` → um candidato, confiança 0,98 → `cliente_id = c203`.
3. Chama `guia.enviar_ao_contato({cliente_id: "c203", competencia: "2026-10", tributo: "DAS", validar_apenas: true})` → `validado` sem erros (guia existe, contato com WhatsApp, janela fechada, modelo de utilidade aprovado).
4. Chama de novo sem `validar_apenas` → `aguardando_aprovacao` com `cartao_id` e `resumo_humano` "Enviar o DAS de outubro (R$ 1.284,10, vence 20/11) a Ana, pelo WhatsApp".
5. Responde com `integrante.responder`: duas frases + o cartão do sistema. Nenhum número digitado pelo modelo.
6. A pessoa aprova; o executor envia (`whatsapp.enviar`, R$ 0,035 de utilidade), grava evento, o cartão some.

Total: 3 ferramentas, ~1,2 mil tokens de resultados. Sem a operação de processo, seriam `documento.listar` + `identidade.resolver` + `conversa.rascunhar` + `conversa.responder`, com 4 a 6 mil tokens e quatro pontos de erro.

# Decisões do Enzo sobre os integrantes

**15/11/2026.** Respostas às sete decisões da seção 12 da [AVALIACAO.md](AVALIACAO.md).

| # | Decisão | Resposta |
| --- | --- | --- |
| 1 | Integrante compartilhado por setor, no lugar de um por pessoa | **Sim**, como fazem o Grok Bot e o Openbot. Condição: com muitas pessoas do setor usando ao mesmo tempo (ex.: 20), o contexto não pode se misturar. O desenho tem de garantir que cada pedido roda isolado (ver nota abaixo). |
| 2 | Procedimento por processo como forma padrão, planejador de modelo só para exceção | **Sim** |
| 3 | Modelos por papel | **Haiku como operário só se provar ser perfeito no caso** (Haiku erra mais que Sonnet). Se não, o padrão é **Sonnet operário, Sonnet escritor, Opus revisor**. O piloto decide. |
| 4 | Assistente encaminha sem reescrever e roteia por regras e Haiku | **Sim.** Por isso os integrantes dos setores já respondem no padrão (formato e tom definidos pelo sistema, por processo), para o Assistente poder encaminhar sem reescrever. O roteamento também segue um padrão fixo (regras primeiro, modelo barato depois, modelo caro só no ambíguo). |
| 5 | Quem paga o trabalho do integrante compartilhado | **A bolsa do setor**, por padrão. Opção a mais: antes de rotear, o integrante pergunta "Para quem quer rotear esta atividade?", com a lista das pessoas do setor que têm acesso ao integrante; não é a única opção. |
| 6 | O que muda o comportamento de todos nasce como proposta aprovada | **Sim** |
| 7 | Piloto pré-registrado, erro como desfecho principal, margem de −3 pontos | **Sim, margem de −3 pontos**, mas o processo tem de ser **automatizado**: não pode depender de os escritórios conferirem à mão. A avaliação roda sozinha sobre conjuntos de casos com resposta conhecida (gabarito), sobre execuções em modo sombra (o integrante faz em paralelo, sem efeito, e o sistema compara com o que a pessoa fez de fato) e com conferência determinística pelos validadores; a pessoa só vê o resultado. |

## Nota sobre a decisão 1: 20 pessoas no mesmo integrante

"Integrante compartilhado" não é um único agente com um único contexto atendendo todo mundo. É uma **configuração compartilhada** (nome, procedimentos do setor, ferramentas, regras, memória do setor). Cada pedido de cada pessoa roda numa **execução própria e isolada**, com o contexto daquela conversa, daquele cliente e daquela tarefa, carregado pelo sistema (`contexto.carregar`). Vinte pessoas ao mesmo tempo são vinte execuções paralelas, cada uma limpa, enfileiradas no motor de procedimentos com prioridade e limite por setor. O que é compartilhado é o "como fazer" e a memória do setor, que só muda por proposta aprovada (decisão 6). É assim que funcionam os Team Bots do Grok Bot e os agentes do Openbot. Um contexto único para 20 pessoas daria errado, e por isso não é feito assim.

## Custo com a decisão 3

A recomendação da AVALIACAO.md (custo relativo 0,43) supunha Haiku como operário. Com Sonnet operário, o custo por tarefa sobe; a conta será refeita com `modelo_de_custo.py` quando o piloto disser qual modelo fica em cada papel.

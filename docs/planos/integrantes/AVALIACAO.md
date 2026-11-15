# Avaliação: como desenhar os integrantes da Heild

**Versão 0.1 · 15/11/2026 · insumo para os subplanos 02 (Time de agentes) e 07 (Motores) e para o desenho do backend.** Pesquisa de apoio: [PESQUISA_ORQUESTRACAO.md](PESQUISA_ORQUESTRACAO.md). Números de custo são **estimativas** de um modelo de tokens descrito na seção 4.1; nenhum número de erro aqui foi medido em trabalho contábil.

## Resumo

1. Critério do Enzo: erro e alucinação primeiro, custo logo depois. Avaliei tudo nessa ordem.
2. Recomendo **um integrante por setor, compartilhado** pelas pessoas do setor, e não um agente por conta: menos rotas, uma memória do setor e um procedimento por processo.
3. Por trás do integrante, o "orquestrador escondido" deve ser **um procedimento em código** por processo, não um segundo modelo que planeja cada pedido.
4. Cada procedimento tem entradas e saídas com esquema, ferramentas determinísticas e operários Haiku com contrato fechado.
5. Validação por esquema e por regra vem antes de qualquer modelo caro. O caro (Sonnet; Opus no alto risco) revisa só o resultado compacto, sem o histórico.
6. O Assistente continua sendo a porta e a cascata de revisão, mas **encaminha sem reescrever**. Rotear custa regras e um Haiku, frações de centavo.
7. A ideia literal (Assistente Opus → orquestrador Opus do setor → operários Sonnet) custa cerca de **2,7 vezes** o plano atual por tarefa: R$ 164 contra R$ 60 por usuário por mês (estimativa).
8. O que decide é o custo total por tarefa resolvida. Um segundo planejador que tira execução do Opus e a passa ao Haiku corta 48% a 62% do custo (seção 5, caso a). Se ele só se soma a um Assistente que já planeja, o custo sobe 51% a 66% (caso b).
9. Opus mandando Sonnet substitui pouco, porque o Sonnet custa metade do Opus. A economia do contraprova veio de trocar execução Opus por Haiku, 20 a 40 vezes mais barato.
10. Orquestrador do setor em Sonnet com operários Haiku fica perto do custo atual (1,05 vez). Ganha em lotes e na ação curta, mas perde no evento único, onde não há execução cara a substituir.
11. O desenho recomendado sai por cerca de **0,43 vez** o plano atual (R$ 26 por usuário por mês, estimativa). No IA Operação de R$ 189, a margem passa de 61% para 79%.
12. O erro deve cair porque números e regras saem de código, cada passo de modelo é pequeno e validado, e a revisão vê só o essencial. Isso precisa ser provado.
13. Agente por conta custa quase o mesmo em tokens, mas espalha memória, rotas e procedimentos por pessoa. Como o prompt está hoje, ainda perde cache: cerca de R$ 0,23 a cada chamada fria.
14. O backend decide boa parte do erro: ferramentas na granularidade do processo, respostas compactas, idempotência, pré-validação e estado do processo no sistema (seção 9).
15. Antes de construir, um piloto pré-registrado e pareado, em modo simulação: plano atual × recomendado (× ideia literal numa amostra), com erro como desfecho primário (seção 11).

---

## 1. Critérios e premissas

### 1.1 Os critérios, em ordem

1. **Taxa de erro** do que chega à pessoa ou ao cliente: número errado, regra legal inventada, ação no cliente errado, "fiz" sem ter feito, classificação errada que passa. A pessoa opera pelo chat, então a resposta tem de sair certa.
2. **Custo por tarefa resolvida**, que precisa caber nos planos de IA do [estudo de precificação](../planos-dgm/Estudo_de_Precificacao_por_Modulo.md) (6.8: IA Essencial R$ 79, IA Operação R$ 189, IA Intensivo R$ 299 por usuário por mês).
3. **Latência percebida** no chat.
4. **Operação**: o integrante é compartilhado por várias pessoas do setor, com filas, prioridade, memória por cliente e por pessoa, e sigilo.

### 1.2 O que o plano já tem

O desenho dos subplanos 02 e 07 já contém boa parte do que a tese do contraprova pede, e isso muda a conta:

| Peça do plano | Papel na tese "forte planeja, barato executa, portão confere" |
| --- | --- |
| Checagem sem modelo (02, 4.2) | Zero tokens quando não há trabalho |
| Roteador da etapa 0: regras e modelo barato (07, 2) | A porta que escolhe, a quase custo zero |
| M2 e M3 como ferramentas determinísticas (07, 4 e 5) | O operário mais barato e mais confiável: código. "Número sem M3 é defeito" |
| `legal.consultar` com cascata interna e escalada em 10% a 15% (07, 3 e 10.3) | Uma cascata barato → forte que já existe, dentro da ferramenta |
| Filhos em modelo barato, até 5, profundidade 1 (02, 4.4) | Operários |
| Verificação única (07, 7) e efeito fantasma (02, 12.3) | Parte do portão |
| Cartão de aprovação (Fundações 6.4) | O portão humano final em tudo o que é "prepara" |
| "O integrante é uma casca" (02, 1.3) | Hoje o integrante é contexto, não raciocínio próprio |

A pergunta real, portanto, não é "orquestrar ou não", e sim **onde ficam o planejamento e a revisão** e **que modelo faz cada passo**.

### 1.3 Uma divergência a resolver

O Enzo descreve o integrante como "compartilhado por usuários daquele setor, como já está". Os documentos dizem outra coisa: "Cada pessoa tem os próprios integrantes" (02, adendo 22), "o integrante do Fiscal do usuário 1 e o do usuário 2 são diferentes" (Desenho 5.1), e o roteamento de 02, 8.1 escolhe "o integrante do setor do responsável". No wireframe, o tipo `Integrante` não tem dono, mas os dados de exemplo das passagens trazem o dono (`dono: 'Fernanda'`). Esta avaliação trata as duas opções como alternativas (seção 3) e recomenda a compartilhada; se ela for aprovada, os subplanos 01, 02 e 05 precisam de adendo.

### 1.4 O Assistente já é a cascata confirmada

O Enzo confirmou o Assistente (o Geral) como orquestrador principal e cascata de revisão. Esta avaliação não o tira; discute **o que ele faz em cada pedido** (seções 5 e 8).

---

## 2. O trabalho do escritório em seis tipos de tarefa

| Tipo | Exemplos do catálogo | Volume por usuário por mês (premissa) | O que confere se está certo |
| --- | --- | ---: | --- |
| **T1 Consulta simples no chat** | "Mostra as guias de outubro da Empresa X"; prazo; quem está devendo documento | 120 | O registro lido (M2); quase sempre vira um cartão de dados |
| **T2 Ação curta no chat** | "Manda o DAS pro financeiro da X"; repassar conversas; versionar perfil | 40 | Esquema da ferramenta, identidade do destinatário, cartão de aprovação |
| **T3 Evento repetitivo** | Documento recebido (NFE-028, CTB-004), linha de extrato, baixa de pendência (CTB-201) | 150 | Esquema, regras do escritório, conferência de soma e partida, confiança |
| **T4 Evento com trabalho** | Pedido implícito ("contratei 2 pessoas") → tarefa e cartão; intimação do e-CAC | 25 | Procedimento do pedido, cartão |
| **T5 Job sobre a carteira** | FIS-011 sublimite em 60 clientes; FIS-032 guias vencendo; régua CTB-003 | 12 | Cálculo determinístico por cliente, consolidação em código |
| **T6 Trabalho longo** | Parecer (CON-002), planejamento tributário, fechamento com várias áreas | 2 | Citação conferida (M1), cálculo (M3), revisão humana |

O mix vale cerca de **R$ 60 de tokens por usuário por mês** no plano atual pelo modelo da seção 4.1, um pouco acima do provável do estudo (R$ 40 no IA Operação a 35% do teto). Uso as razões entre desenhos, que mudam pouco com o mix (seção 4.3).

Três observações guiam o resto:

- **A maior parte do volume é curta e repetitiva** (T1 e T3 somam 77% das tarefas). Num pedido curto, a execução é uma ou duas chamadas: não há trabalho caro para um planejador substituir, então uma camada de planejamento a mais só soma custo e um ponto a mais de erro.
- **Só T5 e T6 são decomponíveis** de verdade, que é onde operários em paralelo se pagam (pesquisa, 2.2).
- **Quase todo número e toda regra já têm fonte determinística** (M2, M3, M1). O modelo não precisa ser forte para fazer conta; precisa não inventar.

---

## 3. A pergunta do Enzo: orquestrador escondido, agente por conta, ou outra coisa?

### 3.1 As três opções

| | **X · Orquestrador LLM escondido no setor** | **Y · Um agente por conta no setor** | **Z · Integrante do setor compartilhado, com procedimento escondido** |
| --- | --- | --- | --- |
| O que a pessoa vê | Um integrante do setor | O "seu" integrante do setor | Um integrante do setor |
| Por trás | Um modelo planeja cada pedido, distribui a operários, revisa e responde | Um agente (o plano atual: casca sobre os motores) por pessoa | Um **procedimento em código** por processo, que chama ferramentas, operários pequenos com contrato e validadores; o modelo forte escreve e revisa sobre o resultado compacto |
| Memória | Do setor, e da pessoa | Da pessoa, mais a do setor | Do setor (com revisão), por cliente, e preferências por pessoa |
| Quem decide o caminho | Um modelo, a cada pedido | Um modelo, a cada pedido | O catálogo de procedimentos; o modelo só onde não há procedimento |

### 3.2 Erro

| Fonte de erro | X | Y | Z |
| --- | --- | --- | --- |
| Planejamento livre a cada pedido (passo esquecido, ordem errada, ferramenta errada) | Alto: todo pedido passa por um plano de modelo | Médio: o agente decide sozinho | **Baixo**: o caminho de um processo conhecido é fixo e testado |
| "Telefone sem fio" (paráfrase errada entre camadas) | Alto: operário → orquestrador → Assistente → pessoa | Médio | **Baixo**: o operário devolve dados com esquema, não texto; o Assistente encaminha sem reescrever |
| Mesmo cliente tratado de jeitos diferentes | Baixo | **Alto**: cada pessoa tem um agente com memória e aprendizados próprios | Baixo: um procedimento e uma memória do setor |
| Rota errada (integrante de quem?) | Baixo | **Alto**: 02, 8.1 resolve "integrante do responsável" em cada passagem | Baixo: o destino é o integrante do setor; a pessoa só importa para cartão e limite |
| Número ou regra sem origem | Igual nos três: a verificação de 07, 7 pega | Igual | Igual, e o validador de regra pega antes |
| Memória poluída por uma pessoa que vale para todos | Médio | Baixo | **Médio**: exige revisão do que muda o comportamento (8.3) |
| Correção de um erro chega a todos | Sim | Não: corrige um agente por vez | **Sim**: corrige o procedimento uma vez |

Evidência por trás das linhas: o contraprova mediu que contratos e portão levam a junção de 28 para 36 de 37 tarefas (pesquisa, 2.4); a verificação centralizada propaga menos erro que arquiteturas sem ela (Kim e outros, 12/2025); o supervisor que reescreve perde qualidade e a LangChain recuperou cerca de 50% encaminhando sem reescrever (06/2025); 14 modos de falha de multiagente vêm de desenho do sistema, desalinhamento entre agentes e verificação (MAST, 03/2025).

### 3.3 Custo

| | Custo de tokens por usuário por mês (estimativa) | Por quê |
| --- | ---: | --- |
| X com Sonnet orquestrando Haiku | R$ 63 (1,05 vez o plano atual) | Na ação curta e no lote, troca execução Sonnet por Haiku e empata ou ganha do atual; no evento único, a execução já é uma chamada e o planejador só soma (seção 5) |
| X com Opus orquestrando Sonnet (a ideia literal, com o Assistente em Opus) | R$ 164 (2,74 vezes) | Não troca quem executa (o Sonnet já executa hoje) e põe Opus três vezes numa ação curta: é o caso de soma da seção 5 |
| Y (plano atual, um agente por pessoa) | R$ 60 (referência) | Mais **cerca de R$ 0,23 por chamada fria**: a camada 4 do prompt (memória privada do integrante) fica no prefixo fixo (02, 2.3), então cada pessoa tem um cache próprio que esfria em 5 minutos. Com 20 pontos percentuais a mais de chamadas frias que no compartilhado, seriam ~R$ 16 por usuário por mês (estimativa). Pondo a camada da pessoa depois da marca de cache, a diferença some |
| Z | R$ 26 (0,43 vez) | Procedimento em código no lugar do plano; operário Haiku nos passos checáveis; revisão cara só sobre resultado compacto |

Consolidação de memória por agente por dia custa cerca de R$ 0,01 em Haiku; ter um agente por pessoa não pesa por aí. **O custo não decide entre Y e Z; o erro e a operação decidem.**

### 3.4 Veredito

**Z.** Os três produtos estudados chegaram a algo parecido por caminhos diferentes. O Grok Bot tem Team Bots, compartilhados como um documento, com conversa privada por pessoa, memória de equipe que só muda com aprovação e consumo debitado de quem é atendido. O agentes.chat tem "um agente por área, com alguém que responde por ele". O Openbot dá uma tarefa a um dono. Nenhum usa um modelo planejador escondido a cada pedido (pesquisa, 1.4). O que Z acrescenta é a parte que o Enzo pediu no critério 3: **o caminho de cada processo é fixo e tipado**, então o modelo erra menos porque decide menos.

Onde X ainda tem lugar: em trabalho sem procedimento (pedido novo, raro ou ambíguo) e nos decomponíveis (T5 e T6), um planejador de modelo dentro do integrante faz sentido. Ele é a exceção medida, não a regra, e cada caso recorrente sem procedimento vira candidato a procedimento novo.

---

## 4. Comparação com as alternativas

### 4.1 Como os números foram feitos

Preços de 11/2026 por milhão de tokens: Opus 5.5 US$ 4 de entrada, US$ 0,20 de leitura de cache e US$ 20 de saída; Sonnet 5.5 US$ 2, US$ 0,10 e US$ 10; Haiku 5.5 US$ 0,10, US$ 0,01 e US$ 0,50. Câmbio de R$ 7,97, o do estudo. Cada desenho é uma lista de chamadas por tipo de tarefa (modelo, tokens em cache, novos e de saída), a partir dos tamanhos do 02, 13 e do 07, 10.1. Taxas de bloqueio no portão: 8% (T1, T3) e 15% (T2, T4, T5) no Haiku, 20% dos escalados bloqueando de novo no Sonnet, próximas do contraprova (9,1% de bifurcação) e do 07 (10% a 15% de escalada). **Tudo é estimativa a medir no piloto.** O modelo está em [modelo_de_custo.py](modelo_de_custo.py) (Python, sem dependências): cada desenho é uma lista de chamadas que dá para conferir e mudar; `python3 modelo_de_custo.py` refaz todas as tabelas.

### 4.2 A tabela

Custo de tokens em R$ por tarefa; mês por usuário com o mix da seção 2; margem no IA Operação (R$ 189) com R$ 14 de infraestrutura, como no estudo (6.8.5).

| Desenho | T1 | T2 | T3 | T4 | T5 | T6 | Mês | × atual | Margem | Erro esperado (não medido) | Latência de T2 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| **B0** Plano atual: integrante em Sonnet sobre os motores, filhos Haiku | 0,10 | 0,45 | 0,07 | 0,38 | 0,56 | 1,79 | 60 | 1,00 | 61% | Referência | 10 a 15 s |
| **A** Ideia literal: Assistente Opus → setor Opus → operários Sonnet | 0,19 | 1,04 | 0,31 | 0,84 | 1,99 | 3,93 | 164 | 2,74 | 6% | Melhor em T6 (Opus decide); pior ou igual no curto (três camadas reescrevendo) | 20 a 30 s |
| **A'** Mesma topologia um degrau abaixo: Sonnet → Sonnet → Haiku | 0,10 | 0,41 | 0,12 | 0,29 | 0,56 | 1,39 | 63 | 1,05 | 59% | Pior que B0 no curto (Haiku executa sem procedimento e há telefone) | 15 a 20 s |
| **Alt 1** Um orquestrador geral só (Opus), operários Haiku por ferramenta; é também a "qualidade máxima ingênua" (Opus com contexto cheio) | 0,19 | 0,90 | 0,15 | 0,76 | 1,06 | 3,52 | 120 | 2,01 | 29% | Bom raciocínio, mas um contexto com as ferramentas de todos os setores degrada (LangChain: agente só cai com 2 ou mais domínios distratores) e mistura escopos | 15 a 25 s |
| **Alt 2** Integrante como agente único em Haiku, portão, escala ao Sonnet e ao Opus no bloqueio | 0,02 | 0,13 | 0,02 | 0,11 | 0,15 | 1,53 | 17 | 0,29 | 83% | O mais arriscado: Haiku sozinho foi −9 pontos contra o Opus no contraprova; o portão da Heild não tem "testes escondidos" para o texto do chat nem para julgamento | 5 a 10 s |
| **Alt 3** Roteador barato; simples ao Haiku, médio ao Sonnet, complexo ao Opus orquestrando Haiku | 0,01 | 0,45 | 0,00 | 0,38 | 1,06 | 2,47 | 46 | 0,78 | 68% | Erro silencioso no caminho barato (sem portão) e na rota errada | 10 a 15 s |
| **P** Recomendado (Z): procedimento por processo, operários Haiku com esquema, validação por regra, Sonnet escreve sobre o compacto, Opus revisa o compacto no risco | 0,03 | 0,19 | 0,02 | 0,19 | 0,34 | 1,68 | 26 | 0,43 | 79% | O menor erro esperado, **se** procedimentos, validadores e revisão cobrirem os processos (a provar) | 5 a 10 s |

Latências são ordem de grandeza: Haiku de 1 a 2 s por chamada, Sonnet de 3 a 5 s, Opus de 4 a 8 s, ferramentas determinísticas abaixo de 0,5 s (07, 10.1). Na ideia literal, a pessoa espera duas chamadas Opus em sequência antes de qualquer trabalho e uma terceira depois.

### 4.3 Sensibilidade

| Mix | B0 | A | A' | Alt 1 | Alt 2 | Alt 3 | P |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Base (seção 2) | 1,00 | 2,74 | 1,05 | 2,01 | 0,29 | 0,78 | 0,43 |
| Mais chat (T1 250, T2 80, T3 80) | 1,00 | 2,43 | 0,98 | 2,00 | 0,29 | 0,73 | ~0,45 |
| Mais eventos (T3 400, T4 50, T5 20) | 1,00 | 3,21 | 1,20 | 2,02 | 0,26 | 0,71 | ~0,37 |

A ordem não muda. A ideia literal fica pior quanto mais eventos o escritório tem, porque cada documento passa por duas chamadas Opus.

### 4.4 O que cabe nos planos

No IA Operação, o teto de tokens é de R$ 113,8 por mês (6.8.2). A ideia literal estoura esse teto já no uso provável deste mix (R$ 164): os jobs e eventos do usuário pausariam no meio do mês, ou o plano teria de custar cerca de 2,7 vezes mais para o mesmo trabalho. O recomendado faz o mesmo limite comprar cerca de 2,3 vezes mais trabalho que hoje.

---

## 5. Quando dois níveis custam mais do que economizam

### 5.1 A comparação certa

A parte do planejador na conta não diz nada sozinha. No contraprova, o planejador Opus foi 62,7% do custo do braço com cascata, e mesmo assim o total por tarefa resolvida saiu a 0,39 do Opus sozinho, porque **o planejador tirou do Opus o trabalho de execução** e o passou ao Haiku. A pergunta é sempre:

```
custo total por tarefa resolvida do desenho  <  custo total por tarefa resolvida da alternativa?
custo total = planejadores + operários + p_escalada × escalada + revisões
custo por tarefa resolvida = custo total ÷ taxa de acerto
```

e com a taxa de erro no mínimo igual.

Para os dois níveis (Assistente + orquestrador do setor), o que importa é **o que o segundo planejador substitui**:

- **Caso a, substituição:** sem ele, quem executaria seria um modelo caro (o Assistente em Opus, com o contexto cheio). O segundo planejador troca execução cara por execução barata.
- **Caso b, soma:** o Assistente já planeja e despacha operários. O segundo planejador só replaneja e revisa por cima, e a execução continua com os mesmos operários.

### 5.2 Os dois casos em números

Custo de tokens em R$ por tarefa (estimativa, modelo da seção 4.1). Em a0, b0 e b1, o planejador Opus de nível único também atende eventos e jobs; em a1 e b1s, eventos e jobs (T4, T5) vão direto ao integrante do setor, sem passar pelo Assistente:

| Desenho | T2 ação curta | T4 evento com trabalho | T5 job da carteira | T6 trabalho longo |
| --- | ---: | ---: | ---: | ---: |
| **a0** Assistente Opus executa sozinho | 0,90 | 0,76 | 1,06 | 3,52 |
| **a1** Assistente só roteia; setor Sonnet planeja; Haiku executa | 0,38 | 0,29 | 0,56 | 1,37 |
| *Efeito do segundo planejador no caso a* | **−57%** | **−62%** | **−48%** | **−61%** |
| **b0** Assistente Opus planeja; operários Sonnet executam (um nível) | 0,78 | 0,84 | 1,99 | 3,67 |
| **b1** b0 + setor Opus replaneja e revisa (dois níveis, a ideia literal) | 1,30 | 1,38 | 3,01 | 6,04 |
| *Efeito do segundo planejador no caso b* | **+66%** | **+63%** | **+51%** | **+65%** |
| **b1s** b0 + setor Sonnet replaneja; Haiku executa | 0,79 | 0,29 | 0,56 | 2,28 |
| *Efeito de b1s contra b0* (no chat, soma um planejador e troca Sonnet por Haiku; em T4 e T5, o planejador do setor ocupa o lugar do Opus) | +2% | −66% | −72% | −38% |
| B0 plano atual (Sonnet executa, sem planejador) | 0,45 | 0,38 | 0,56 | 1,79 |
| P recomendado (procedimento em código, Haiku, revisão compacta) | 0,19 | 0,19 | 0,34 | 1,68 |

Leitura:

1. **O segundo planejador se paga quando substitui execução cara** (caso a, e b1s fora do chat): o ganho vem de tirar a execução de um modelo caro, como no contraprova.
2. **Ele só soma quando a execução abaixo dele não muda** (b1): a ideia literal, com Opus nos dois níveis e Sonnet executando, adiciona de 51% a 66% sem tirar trabalho de ninguém.
3. **Contra o plano atual, a referência certa é Sonnet executando**, não Opus. Daí a ideia literal sair 2,7 vezes mais cara, e um orquestrador Sonnet com operários Haiku sair perto do atual (a1 abaixo do B0 na ação, no evento e no lote; A' = 1,05 vez no mês, porque perde no evento único T3, onde a execução é uma chamada e não há o que substituir).
4. **A taxa de acerto não inverte a ordem.** Na ação curta, com B0 acertando 95%, a ideia literal acertando 97% e P acertando 92% (hipóteses), o custo por tarefa resolvida fica em R$ 0,47, R$ 1,08 e R$ 0,21. Para a ideia literal empatar em custo por tarefa resolvida com o plano atual, ela teria de acertar mais de 2 vezes mais tarefas: impossível com o B0 acertando mais de 43%. O que justificaria Opus em tudo seria **menos erro**, e isso o piloto mede (seção 11).
5. **O procedimento em código é um segundo nível que não custa planejamento.** Ele faz o papel do orquestrador do setor (divide, chama operários baratos, junta), com o custo de chamar uma função. Por isso P fica abaixo de a1 na ação, no evento e no lote; no trabalho longo (T6), P sai um pouco acima porque paga a revisão Opus que a1 não tem, por escolha (o erro vem primeiro).

### 5.3 Regra prática

- Um planejador de modelo entra quando substitui execução de um modelo mais caro **e** o trabalho abaixo dele é grande e divisível (T5, parte de T6, lotes, fechamento). A Anthropic mediu o mesmo: Opus 5.5 com subagentes Sonnet 5.5 empatou com Opus sozinho, um terço mais barato, em trabalho maior que um contexto; quando o trabalho cabe num contexto, o modelo sozinho com menos esforço saiu na frente.
- Dois planejadores de modelo em sequência só se o segundo trocar o modelo que executa por um mais barato. Opus sobre Opus, ou Opus sobre Sonnet com Sonnet já executando, só soma.
- O Assistente em cima de tudo deve rotear (regras e Haiku, cerca de US$ 0,0001 por decisão, como no agentes.chat) e encaminhar. Planejar e sintetizar de novo o que o integrante fez é o caso b.
- Onde o caminho do processo é conhecido, o "orquestrador" é código (seção 6).

---

## 6. Padronização: um procedimento por processo

O critério 3 do Enzo é, pelas evidências, a alavanca que mais baixa erro **e** custo ao mesmo tempo.

### 6.1 O que é um procedimento

Um procedimento é a forma fixa de fazer um processo do catálogo (FIS-011, CTB-004, DP-001, GES-030...). É dado versionado, revisado por gente e testado, não texto livre no prompt:

| Parte | Conteúdo | Exemplo (CTB-004, classificar linha de extrato) |
| --- | --- | --- |
| Identidade | ID do catálogo, versão, setor, nível máximo | `CTB-004 v3`, Contábil, rascunhar |
| Entrada | Esquema tipado | `{cliente_id, competencia, linha: {data, valor, historico, documento?}}` |
| Passos determinísticos | Ferramentas que não precisam de modelo | Regra aprendida por favorecido (D-13); plano de contas do cliente; conciliação com nota e guia |
| Passos de modelo | Cada um com **contrato**: o que recebe, ferramentas permitidas, esquema de saída, o que nunca faz | Operário Haiku: "escolha a conta entre estas 12 candidatas; devolva `{conta, confianca, motivo_curto}`" |
| Validadores | Regras que conferem a saída antes de qualquer modelo caro | Conta existe e aceita lançamento; partidas fecham; valor bate com o extrato; confiança ≥ 0,9 ou regra aprendida concorda |
| Saída | Esquema tipado e evidências | `{lancamento, origem: [regra_id | nota_id | operario_id], validadores: [ok...]}` |
| Escalada | Quando sobe e para quem | Validador falhou → Sonnet com a falha; falhou de novo → cartão "não consegui" para a pessoa |
| Conclusão | Faz sozinho ou cartão, pela lista do escritório (Fundações 3.3) | Faz sozinho se a atividade está liberada; senão cartão |
| Teste | Casos com gabarito (cartões editados viram casos, 02, 14.2) | 50 linhas reais anonimizadas |

### 6.2 Por que baixa o erro

- **O modelo decide menos.** O caminho do processo não é planejado a cada vez; o modelo só escolhe entre opções que o código já filtrou.
- **Cada passo de modelo é pequeno e conferível.** Uma saída com esquema e validadores é o equivalente, na Heild, aos testes do contraprova. Sem isso, um operário barato erra calado (Haiku sozinho: −9 pontos no contraprova; com portão e escalada: −2).
- **O caro revisa o essencial.** O revisor recebe `{entrada resumida, saída, evidências, validadores}`, não o histórico. É o critério 2 do Enzo e o "compartilhe só o que importa" que falta no telefone sem fio.
- **Um conserto vale para todos.** Erro achado no piloto vira mudança de procedimento ou validador, versionada.

Os produtos e frameworks vão na mesma direção: o Grok Bot transforma um trabalho feito uma vez em *skill* e depois em rotina; o Openbot tem *skills* e *workflows* com passos de modelo sem ferramentas e aprovações; o agentes.chat separa rotina "de leitura" e "de ação"; a OpenAI diz que orquestrar por código é "mais determinístico e previsível em velocidade, custo e desempenho"; a Anthropic separa *workflow* (caminho em código) de *agente* (pesquisa, 2.1 e 2.3).

### 6.3 Por que baixa o custo

O plano por modelo (`plano.montar`, 07, 6.1) é a chamada mais cara de uma ação, com 10 mil tokens em cache, 3 a 6 mil novos e o modelo principal. Com procedimento, ele some nos processos conhecidos; o contexto do modelo que escreve cai de 10 a 16 mil para 4 a 7 mil tokens, porque recebe o resultado e não as ferramentas e os resultados brutos. Somado ao Haiku nos passos conferíveis, é daí que vêm os 0,43 vez da tabela.

### 6.4 O que fica com o modelo

Redigir o que a pessoa lê, escolher entre opções filtradas, ler texto livre (mensagem do cliente, documento sem padrão), propor o que não tem procedimento e revisar. **Nunca** somar, calcular prazo ou multa, citar lei de memória, escolher cliente por nome sem confirmação de ferramenta, nem dizer que fez sem o retorno da ferramenta (já é regra no 02 e no 07).

---

## 7. Portão, contratos e escalada

### 7.1 O portão da Heild, em camadas

| Camada | O que confere | Custo |
| --- | --- | --- |
| 1. Esquema | A saída do operário valida pelo esquema do procedimento; ferramenta com `strict` | Zero |
| 2. Regras de negócio | Validadores do procedimento: partidas, somas, existência, competência, escopo (`autorizar`), idempotência | Zero |
| 3. Origem | A verificação do 07, 7: todo número com `[k-…]` ou `[e-…]`, toda regra com `[t-…]`, efeito com retorno `ok` | Regras e, às vezes, um Haiku |
| 4. Revisão cara sobre o compacto | Sonnet (rotina) ou Opus (cliente, valor, regra legal, irreversível) recebe saída e evidências e responde `{aprova, corrige, escala}` | ~R$ 0,16 por revisão Opus compacta |
| 5. Pessoa | Cartão de aprovação em tudo o que é "prepara"; amostra de auditoria no que é "faz sozinho" | Tempo da equipe |

Um revisor do mesmo fornecedor não é independente: no contraprova, o revisor Sonnet bloqueou duas junções corretas. Por isso as camadas 1 a 3 são de regra, e a camada 4 só olha o que as regras não alcançam (julgamento e redação).

### 7.2 Quando escalar

| Sinal | Para onde |
| --- | --- |
| Validador de esquema ou regra falhou | Uma vez ao Sonnet, com a falha e a mesma entrada; não repetir o Haiku às cegas (no contraprova, a escalada resolveu 6 de 8 bloqueios e repetir o barato resolveu 2 de 8; na segunda amostra, empatou: é impreciso) |
| Confiança do operário abaixo do limiar do procedimento | Sonnet |
| Falhou de novo no Sonnet | Opus, se o processo é de alto risco; senão cartão "não consegui, falta X" para a pessoa |
| Vai ao cliente, mexe em valor, cita regra legal, é irreversível | Revisão Opus compacta sempre, e cartão |
| Pedido sem procedimento | Integrante em Sonnet planeja (exceção registrada); se o tipo se repetir, vira procedimento |
| `legal.consultar` com afirmação central parcial | Já existe: reprocessa com o modelo maior (07, 10.3) |

---

## 8. Desenho recomendado

### 8.1 Visão

```
pessoa ── chat do Assistente ou do integrante ──┐          evento · job · pedido do app
                                                ▼                       │
     Assistente (porta): regras → Haiku classificador → encaminha ◄─────┘
       · responde direto só o que não tem setor (conversa, legal.consultar, M2 simples)
       · acompanha o pedido e mostra o resultado do integrante SEM reescrever
                                                │
                                                ▼
     Integrante do setor (compartilhado): identidade, programa, memória do setor
       ├── procedimento do processo (código, versionado)
       │     ├── ferramentas determinísticas (M2, M3, M1, regras aprendidas)
       │     ├── operários Haiku com contrato e esquema (em paralelo quando há lote)
       │     ├── validadores (esquema, regra, origem)
       │     └── escrita/revisão: Sonnet sobre o compacto; Opus no risco
       ├── sem procedimento → Sonnet planeja (exceção), mesmos validadores
       └── cartão de aprovação → pessoa
```

### 8.2 Papéis e modelos

| Papel | Modelo | Contexto | Quando |
| --- | --- | --- | --- |
| Rota do Assistente | Regras; Haiku se as regras não bastam | ~3 mil tokens em cache | Toda mensagem sem destino claro |
| Operário | Haiku 5.5 | Só a entrada do contrato (contexto vazio, 02, 4.4) | Passos de leitura, extração, classificação, rascunho curto |
| Integrante (escrita) | Sonnet 5.5 | Resultado compacto, memória relevante | O que a pessoa lê; ações curtas |
| Integrante (planejador de exceção) | Sonnet 5.5 | Ferramentas do setor | Pedido sem procedimento; T6 |
| Revisor de risco | Opus 5.5 | Saída e evidências, 3 a 6 mil tokens | Cliente, valor, regra legal, irreversível; segunda falha |
| Lote | Procedimento + operários Haiku em raias disjuntas (por cliente) + consolidação em código | Cada raia vê só os seus clientes | T5, fechamento, lote de extratos |

A escolha de Sonnet como escritor padrão, e não Opus, segue a medição da Anthropic de 09/2026 em GPQA: Sonnet 5.5 empatou com Opus 5.5 (91%, contando recusas como erro), com Opus cerca de 2 pontos à frente nas questões que ambos responderam (pesquisa, 2.2). Como o erro vem primeiro, o Opus entra onde o erro custa caro, só sobre o compacto, o que mantém o custo baixo. Se o piloto mostrar que Sonnet escrevendo erra mais que o limite, a troca por Opus como escritor custa cerca de mais R$ 0,05 por turno curto, porque o contexto é pequeno.

### 8.3 O integrante compartilhado na prática

| Tema | Regra proposta |
| --- | --- |
| Identidade | Um integrante por (escritório, setor), mais subinquilino no BPO. Persona, programa e procedimentos são do setor |
| Sessões | Chat por (pessoa, integrante, cliente ou carteira), como o adendo 22 do 02 já faz; evento e job em sessão própria. Nunca um processo único que serializa o setor |
| Concorrência | Sem trava global. Trava por (setor, cliente, processo) para efeitos, com a chave de idempotência do plano (07, 6.2) |
| Fila e prioridade | Fila do setor com a prioridade do programa (02, 2.2); mensagem de pessoa passa na frente de trabalho em segundo plano (como no Grok Bot); jobs só quando ocioso (02, 7.1); limite de itens em segundo plano por carteira para uma pessoa não tomar a fila |
| Memória | Do setor (regras e decisões), por cliente (particularidades, com `autorizar`), por pessoa (preferências, privada). **Revisar a P10**: no compartilhado, o que muda o comportamento para todos deveria nascer como proposta aprovada por Gestor ou Administrador (Team Bots do Grok Bot, propostas do agentes.chat); fato com origem em evento de pessoa pode continuar valendo na hora |
| Sigilo | Conversa de cada pessoa privada; a regra atual de leitura por Gestor e Administrador (02, 12.4) fica explícita na tela. O prompt nunca leva a camada privada de outra pessoa. Operários recebem só o contrato |
| Cache | Camadas 1 a 3 e o programa do setor no prefixo, iguais para todos do setor; preferências da pessoa depois da marca de cache |
| Limites e cobrança | Chat debita de quem pergunta (como o Grok Bot). Evento e job debitam do responsável pelo cliente no setor (02, 8.1), com rateio por cliente (05, A12); sem plano, vai à bolsa ou pausa com aviso. **Decisão do Enzo** |
| Aprovação | O cartão vai a quem pediu (chat) ou ao responsável (evento e job). Só essa pessoa decide, como no Team Bot |
| Teto | Orçamento por integrante por dia (já existe: 2 MTok) e por procedimento por execução; conferido antes de cada chamada, como no agentes.chat |

### 8.4 O Assistente

Fica como porta e cascata de revisão confirmada, com três ajustes: (1) rota por regras e Haiku, nunca por modelo forte; (2) o resultado do integrante aparece **encaminhado, sem reescrita** (o cartão "Encaminhei para Fiscal" e a resposta citada já fazem isso no 02, 9.1; manter assim e não "resumir com as próprias palavras"); (3) a revisão que ele faz é a das camadas de 7.1, não uma releitura do transcript.

---

## 9. O que o backend, as APIs e o MCP precisam oferecer aos integrantes

O erro e o custo de um agente dependem mais das ferramentas que ele recebe do que do modelo. Esta lista é para a sessão que desenha o backend.

### 9.1 Ferramentas

| Requisito | Por quê | Exemplo |
| --- | --- | --- |
| **Granularidade do processo**, não da tabela | Cada chamada a mais é um ponto de erro e de tokens; ferramenta genérica obriga o modelo a planejar | `guia.enviar_ao_contato(cliente_id, competencia, tributo)` em vez de `documento.listar` + `identidade.resolver` + `conversa.rascunhar` + `conversa.responder`. As genéricas continuam para o planejador de exceção |
| **Esquemas estritos** de entrada e saída | O modelo não inventa campo; a saída é validável | JSON Schema com `additionalProperties: false`; enums para competência, tributo, setor |
| **IDs, nunca nomes**, e resolução explícita | Cliente errado é o erro mais grave | `cliente.resolver(texto)` devolve candidatos com CNPJ; ação só aceita `cliente_id` |
| **Respostas compactas e estruturadas** | Contexto curto = menos custo e menos distração | Totais + até 20 linhas + `ha_mais` + cursor (02, 6.1); campos com nome, sem prosa |
| **Somente leitura separada de efeito** | O roteador e os operários só veem leitura | Portas `ler`, `rascunhar`, `executar` (Fundações 6) |
| **Pré-validação (`dry_run`)** | O agente sabe que vai falhar antes de tentar | `cobranca.criar(..., validar=true)` devolve erros por campo |
| **Erros tipados e acionáveis** | O agente corrige ou escala sem adivinhar | `{codigo: "FALTA_FOLHA", campo: "folha_2026_03", acao_sugerida: "tarefa.criar(DP-…)"}` |
| **Idempotência** | Retomada e escalada não duplicam envio | `chave_idempotencia` obrigatória em todo `executar` (07, 6.2) |
| **Transação por passo de negócio** | Nada fica pela metade | Lançamento + baixa de pendência + evento numa transação |
| **Cálculo e regra no servidor** | Número só do M3; regra legal só do M1 | `calculo.*`, `legal.consultar` com origem anotável |

### 9.2 Estado e contexto

| Requisito | Por quê |
| --- | --- |
| **Estado do processo no sistema, não no contexto do agente** | Tarefa, plano, passo, cartões e pendências guardados no banco (02, 8.2: "a tarefa é o estado compartilhado"). O agente retoma lendo o estado, não o transcript |
| **Contexto mínimo por cliente e tarefa, numa chamada** | `contexto.carregar(cliente_id, processo, competencia)` devolve perfil na data, pendências, últimos eventos do processo e memória relevante, já cortado para o orçamento |
| **Procedimentos como dados versionados** | O motor de procedimento lê `CTB-004 v3`; a mudança é revisada, testada e tem histórico |
| **Validadores como serviço** | O mesmo validador roda no procedimento, no portão e no teste |
| **Evento com custo e origem em toda chamada** | Já é regra (R2); é o que alimenta o piloto e a medição contínua |
| **Cache-friendly** | O backend monta o prompt em camadas fixas e em ordem estável (02, 2.3); ferramentas listadas em ordem determinística |

### 9.3 MCP e APIs externas

- O MCP entra **na borda**, como fachada fina das mesmas ferramentas tipadas (o contraprova faz assim), não como camada de lógica. Ferramentas com descrição curta, esquema estrito e lista estável.
- Busca de ferramentas sob demanda quando o catálogo do setor passar de ~10 mil tokens de esquemas; abaixo disso, o custo da busca não compensa.
- Conectores externos (Integra Contador, portais, WhatsApp) atrás de ferramentas com fila, nova tentativa e cota no servidor; o agente nunca chama o externo direto.
- Conteúdo externo sempre envelopado como dado (02, 12.1), inclusive o que vem por MCP.

### 9.4 Frontend

- O chat mostra **cartões** gerados pelo sistema (dados, cálculo, citação, aprovação), não tabelas escritas pelo modelo: menos tokens de saída e nenhum número digitado pelo modelo.
- Progresso do procedimento vem do estado no banco (o `ProgressoTrabalho` do wireframe), não de narração do agente.
- "Ver origem" em todo número e regra, ligado às marcas da verificação (07, 7.2).

---

## 10. Riscos

| Risco | Efeito | Mitigação |
| --- | --- | --- |
| Procedimentos não cobrem os processos reais | O planejador de exceção vira regra, e o custo e o erro voltam ao nível do plano atual | Começar pelos processos de maior volume (T3 e T1); medir a taxa de exceção; cada exceção recorrente vira procedimento |
| Validadores fracos | Operário barato erra calado | Validador só entra com casos de teste; amostra de auditoria humana no "faz sozinho" |
| Haiku em texto livre ruim (mensagens de cliente, documentos sem padrão) | Extração errada | Esses passos começam no Sonnet; o Haiku só onde o piloto mostrar paridade |
| Revisor caro concorda com o erro (mesmo fornecedor) | Falsa segurança | Revisão só depois das regras; medir falsos aprovados por auditoria |
| Memória do setor poluída no compartilhado | Erro para todos | Proposta com aprovação para o que muda comportamento (8.3) |
| Preço do Haiku muda ou o Haiku sai de linha | A conta do recomendado muda | O desenho é por papel ("operário"), não por modelo; refazer o piloto a cada troca |
| Fila do setor congestiona na virada do mês | Atraso | Prioridade, jobs só ociosos, raias por cliente, limite por carteira |
| Latência das escaladas | Resposta lenta em 10% a 15% dos casos | Mostrar progresso e o que está sendo conferido |
| Ideia literal adotada sem medição | Custo de 2,7 vezes e margem perto de zero no IA Operação | Piloto antes |

---

## 11. Piloto pré-registrado

No espírito do contraprova: escrever e versionar o protocolo **antes** de qualquer execução paga, comparar pareado nas mesmas tarefas e publicar desvios.

### 11.1 Pergunta

O desenho recomendado (P) erra no máximo o mesmo que o plano atual (B0), a menor custo por tarefa resolvida? A ideia literal (A) erra menos, e por quanto mais?

### 11.2 Braços

| Braço | O quê |
| --- | --- |
| B0 | Plano atual (casca em Sonnet sobre os motores, filhos Haiku, verificação) |
| P | Recomendado (procedimento, operários Haiku, validadores, Sonnet escreve, Opus revisa no risco) |
| A | Ideia literal, numa subamostra (custo), para medir quanto Opus em todas as camadas compra de erro |
| Bifurcação no bloqueio | Como no contraprova: no ponto em que o validador de P bloqueia, rodar também um Haiku novo (controle) além da escalada ao Sonnet (tratamento) |

### 11.3 Tarefas

- **Modo simulação** e clientes-piloto (D-30 e D-31, já aprovados): nada sai para o cliente.
- Tarefas tiradas do uso real de um escritório-piloto, anonimizadas, em ordem sorteada com semente fixa, estratificadas por tipo (T1 a T6) e por setor.
- Gabarito: decisão do contador (cartão aprovado, editado ou recusado) e, para o "faz sozinho", auditoria cega por um segundo contador numa amostra.
- Mesma lista para todos os braços; congelados antes: versões dos procedimentos, prompts, ferramentas, validadores e tabela de preços, com hash.

### 11.4 Desfechos

| | Desfecho | Critério |
| --- | --- | --- |
| **Primário** | Taxa de erro que chega à pessoa: resposta ou ação que o gabarito marca como errada, mais "fiz" sem ter feito, mais número ou regra sem origem | P não inferior a B0 com margem de **−3 pontos** nos estratos T1 a T4 (o critério 1 do Enzo pede margem apertada) |
| **Coprimário** | Custo por tarefa resolvida, recalculado dos tokens registrados | Razão P/B0 < 0,7 |
| Secundários | Cartões aprovados sem edição; erro por tipo e setor; valor da escalada (Sonnet contra Haiku de novo no mesmo ponto); falsos bloqueios e falsos aprovados de cada validador; taxa de pedidos sem procedimento; latência p50 e p90 no chat; erros de paráfrase em A | Descritivos |

### 11.5 Tamanho da amostra

Com uma taxa de discordância entre braços de 6% a 10% e margem de 3 pontos, a comparação pareada precisa de cerca de **400 a 700 tarefas por estrato agrupado** para 80% de poder (cálculo: erro-padrão da diferença ≈ √(discordância ÷ n)). Com margem de 5 pontos, 150 a 250. Proposta: 600 tarefas no total entre T1 e T4, 60 jobs de T5 e 20 casos de T6 (descritivo), e A em 150 tarefas sorteadas.

### 11.6 Custo e parada

Tokens: com os custos da seção 4, 600 tarefas × 3 braços ficam em centenas de reais; o custo real é o **tempo de contador** para o gabarito (cerca de 2 minutos por tarefa, ~20 a 25 horas). Regra de parada só por orçamento, na ordem sorteada; nenhuma análise intermediária por resultado.

### 11.7 O que decide

| Resultado | Decisão |
| --- | --- |
| P não inferior e mais barato | Adotar P; seguir criando procedimentos por volume |
| P inferior em algum tipo | Naquele tipo, subir o operário para Sonnet ou reforçar validadores, e medir de novo só o tipo |
| A erra claramente menos que P | Usar Opus onde ele ganhou (provavelmente T6 e revisão de risco), não em todas as camadas |
| Escalada não vence o Haiku repetido | Trocar escalada por segunda tentativa barata com a falha anexada, onde empatar |

---

## 12. Decisões para o Enzo

1. **Integrante compartilhado por setor** (Z) no lugar de um por pessoa? Se sim, adendo aos subplanos 01, 02 e 05 (sessões, memória, roteamento de 8.1, timesheet "de quem").
2. **Procedimento por processo** como forma padrão de o integrante trabalhar, com o planejador de modelo só para exceção?
3. **Modelos por papel**: Haiku operário, Sonnet escritor, Opus revisor de risco, como ponto de partida a confirmar no piloto?
4. **Assistente encaminha sem reescrever** e roteia por regras e Haiku?
5. **Quem paga** evento e job de um integrante compartilhado: responsável pelo cliente no setor, bolsa do escritório, ou outro?
6. **P10 revista** para o compartilhado: o que muda o comportamento de todos nasce como proposta aprovada?
7. **Piloto** com a margem de erro de −3 pontos e o escritório-piloto a escolher.

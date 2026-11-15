# Custo mensal do playtest do Contábil (duas contabilidades, 20 contas, 350 clientes)

**10/11/2026 · estimativa pela calculadora (`docs/precificacao/configurador.html`, parâmetros v0.9), só custo, sem lucro.** Valores de teste, sem medição.

**Cenário:** duas contabilidades parceiras com 350 clientes no total (**premissa minha: 175 em cada**) e 20 contas (10 em cada). Em cada uma, 2 contas com IA Intensivo e 8 sem acesso a IA (só painel, abas e módulos do setor). Módulos: Painel, CRM, App, Timesheet e conectores de governo e de estados e municípios. Sem BPO, sem Financeiro, sem marca branca. Um número de WhatsApp por contabilidade.

**"Sem IA de raciocínio":** entendi como excluir a parte fixa de IA da plataforma (GPU e API fixa do DGM e do motor legal, R$ 3.992 por mês no estudo). A IA das 4 contas Intensivo e a ajuda do sistema ficam na conta.

## Custo mensal das duas contabilidades juntas

| Componente | Pouco (15% do teto) | Médio (35%) | Alto (70%) | Tudo (100%) |
| --- | ---: | ---: | ---: | ---: |
| IA das 4 contas Intensivo | 98 | 321 | 691 | 940 |
| Módulos e conectores (inclui APIs de governo e estados) | 887 | 1.894 | 3.798 | 3.798 |
| &nbsp;&nbsp;dos quais APIs de governo, estados e municípios | 650 | 1.347 | 2.405 | 2.405 |
| Ajuda do sistema e chat de suporte (20 contas) | 21 | 43 | 93 | 93 |
| WhatsApp (mensagens da Meta) | 89 | 366 | 915 | 915 |
| Suporte humano por assento (R$ 6 / 12,50 / 25 por conta) | 120 | 250 | 500 | 500 |
| **Subtotal variável e por conta** | **1.215** | **2.874** | **5.997** | **6.246** |
| Infraestrutura fixa da plataforma | 1.200 | 1.200 | 1.200 | 1.200 |
| **Total** | **2.415** | **4.074** | **7.197** | **7.446** |
| Total se o suporte humano for tempo da própria equipe | 2.295 | 3.824 | 6.697 | 6.946 |

**Alavanca principal:** as APIs de consulta de governo e estados são cerca de metade do custo (R$ 1.347 dos R$ 2.874 no médio). Se o playtest não ligar esses dois conectores, o total fica em cerca de R$ 1.765 / 2.727 / 5.041 (pouco / médio / tudo).

Não incluídos: operação multi-escritório de R$ 3.000 por mês (premissa de tempo da equipe no estudo) e GPU e API fixa de IA de R$ 3.992 (excluídas por "sem IA de raciocínio"); somam-se se entrarem na conta.

## Sensibilidade ao número de clientes (cenário médio, subtotal sem infraestrutura fixa)

| Clientes no total | 60 | 100 | 200 | 350 |
| --- | ---: | ---: | ---: | ---: |
| Subtotal das duas contabilidades | 1.124 | 1.350 | 1.960 | 2.874 |

## Armazenamento (10/11/2026)

Os totais acima **já não incluem armazenamento**: o pacote do cenário (sistema-base) não leva o espaço de 5 GB por cliente. Decisão do Enzo para o playtest: nada de 5 GB por cliente; o espaço padrão é por escritório (cerca de 15 GB no plano). Uma contabilidade usa servidor local e a outra a nuvem do próprio plano, então o custo de armazenamento do playtest é **R$ 0** (15 GB na nuvem custariam cerca de R$ 3 por mês). Para comparação: com o padrão antigo (5 GB por cliente, 1.750 GB no total), o custo seria de cerca de R$ 350 por mês no provável (R$ 140 a R$ 612).

## Playtest pequeno: 5, 10 e 20 clientes por contabilidade (10/11/2026)

O custo por cliente é de cerca de **R$ 4,85 por mês no provável**: conectores de governo R$ 2,25 (Integra Contador e consulta de CNPJ), conectores de estados e municípios R$ 1,37 (InfoSimples: DTE e certidões), Painel R$ 0,60, CRM R$ 0,43 e App R$ 0,20; mais cerca de R$ 1 de WhatsApp por cliente. O resto do custo (infraestrutura R$ 1.200, IA das 4 contas, suporte, ajuda) **não depende do número de clientes**.

| Clientes por contabilidade | Total (com infra) pouco / médio / tudo | Sem suporte humano |
| --- | --- | --- |
| 5 (10 no total) | 1.555 / 2.063 / 3.319 | 1.435 / 1.813 / 2.819 |
| 10 (20 no total) | 1.579 / 2.115 / 3.424 | 1.459 / 1.865 / 2.924 |
| 20 (40 no total) | 1.627 / 2.219 / 3.635 | 1.507 / 1.969 / 3.135 |
| 175 (350 no total) | 2.415 / 4.074 / 7.446 | 2.295 / 3.824 / 6.946 |

## Decisão (14/11/2026)

**O playtest começa com 5 clientes por contabilidade (10 no total).** Custo estimado: R$ 1.555 / 2.063 / 3.319 por mês (pouco / médio / tudo), ou R$ 1.435 / 1.813 / 2.819 se o suporte humano for tempo da equipe. Armazenamento: zero (uma contabilidade com servidor local, a outra na nuvem do plano).

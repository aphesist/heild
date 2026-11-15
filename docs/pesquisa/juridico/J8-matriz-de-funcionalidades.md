# J8 · Matriz de funcionalidades dos sistemas jurídicos para escritórios pequenos e médios

Data da pesquisa e do acesso a todas as fontes: **08/11/2026**. Escopo: **funcionalidades e lógica** (não visual). Público do pacote: escritórios de 1 a 10 usuários. O SGJur é estudado na frente **J7** e aparece aqui só como coluna reservada.

Método: 27 buscas na web (limite de 30) e leitura direta por `curl` + extração de texto de páginas oficiais, de avaliações de usuários (B2B Stack) e de blogs. Tudo que não foi confirmado em página lida está marcado **[a confirmar]** ou "?". Não há preço inventado.

---

## 0. Ressalvas de método (leia primeiro)

1. **Quase tudo é material de fornecedor.** Páginas de produto, blogs e "comparativos" são de quem vende. Os 4 comparativos de 2026 que apareceram (EasyJur, Aurum, ADVBOX, Projuris) são peças comerciais; o do EasyJur teve o corpo do artigo **não extraído** (só planos e menus). Uso-os para descobrir **o que o sistema diz fazer**, não para ranquear.
2. **Fóruns, Reddit e vídeos: não encontrei.** A busca é restrita aos EUA e não devolveu nenhuma discussão de advogados nem review em vídeo. Reclame Aqui e Capterra **bloqueiam leitura direta**; só vi títulos e trechos de resultado de busca (marcados "snippet"). A evidência de "o que elogiam e pedem" (seção 5) vem de **avaliações do B2B Stack lidas na íntegra**, que são **datadas** (Astrea e EasyJur 2022 a 2023; ADVBOX 2021 a 2023; Projuris ADV set/2025; Legal One e CPJ-3C 2020) e **poucas**. Isso é evidência fraca; confirmar em entrevista com 5 a 8 advogados (já recomendado no J1).
3. **A matriz mostra o que a página pública diz.** "?" = não encontrei; não quer dizer que não exista. Itens em planos superiores estão marcados "$" (plano superior ou pago à parte).
4. **Correções ao briefing e ao J1:**
   - **Jurídico Certo não é sistema de gestão.** O site oficial é um **marketplace** ("mais de 220 mil advogados e correspondentes", declarado), com "Jurídico Pag" e "Correspondente Jurídico" [33]. Entra só como linha de correspondentes. Se o usuário se referia a outro produto, **perguntar qual** [a confirmar].
   - **SAJ ADV parece ter sido renomeado para Projuris ADV.** O endereço antigo `.../emissao-de-boletos-e-gestao-financeira-no-saj-adv/` entrega o mesmo artigo "PROJURIS ADV", e o Capterra lista "SAJ ADV" com o nome "Projuris ADV" [47, 38]. **[a confirmar]** com a Softplan. O J1 os trata como produtos separados.
   - **Themis (Aurum) é para operação maior**; a própria Aurum diz que o Astrea atende pequeno e médio e que o Themis não tem teste self-service [38]. Fica fora das colunas.
   - **Espaider, Lexio, Xjus, Advfast, DataJuri, Advoffice, Lawbox** aparecem em agregadores ou comparativos e **não foram estudados** a fundo. Do DataJuri só há avaliações de 2021 a 2022 e um resumo de busca (nuvem, app móvel, analytics, **sem API**, preço de entrada "R$ 0 anual + teste" no agregador) [15, 39] **[a confirmar]**.
5. **Conflitos de dados na própria fonte:** a página de comparação do EasyJur traz **duas tabelas de plano** (nova: R$ 229, 499, 990, 2.290, 3.790; antiga: R$ 389, 599, 1.699, 2.799). Usei a nova. O ADVBOX mostra Elite "a partir de R$ 1.800" na lista e "R$ 1.750" no calculador da mesma página [16].

---

## 1. Sistemas cobertos

| Sistema | Quem faz | Público declarado | Preço público (08/11/2026) | Observação |
|---|---|---|---|---|
| **Astrea** | Aurum | Solo e escritório de 1 a 30 usuários | Light grátis por 1 ano (1 usuário, 40 processos monitorados); Up R$ 2.988/ano; **Smart (5 usuários) R$ 5.268/ano = R$ 439/mês**; Company (10) R$ 9.228/ano; Vip (30) R$ 16.548/ano; promoção "Novembro" de 20% a 50% [1] | 120 mil profissionais (declarado). Teste de 10 dias [1] |
| **Projuris ADV** | Softplan | Escritório e pequena procuradoria | Start solo desde R$ 79/mês; compartilhado desde R$ 349/mês; ADV completo: não público [J1] | Ecossistema: Peticiona, Acordos, Contratos, Jurimetria, Empresas [26] |
| **ADVBOX** | ADVBOX | Solo a banca de volume (bancário, previdenciário, trabalhista) | Essencial R$ 220; Banca Jurídica R$ 450; Banca Max R$ 900; Elite R$ 1.750 a 1.800; Big Offices R$ 5.000+; **todos "a partir de", mensal, mais taxa de ativação**; 1.000 processos ativos inclusos, +R$ 100 a cada 500 [16] | 6 mil escritórios, 100 mil usuários (declarado) [17] |
| **EasyJur** | EasyJur | Solo a grande | Start R$ 229 (até 2 usuários); Premium R$ 499 (até 5); Standard R$ 990 (até 10); Growth R$ 2.290; Growth+ R$ 3.790; **mais taxa de adesão e consumo fora da franquia** [27] | OS (gestão), Work (agentes de IA), Talk (WhatsApp), Legal Ops (BPO humano) |
| **Legal One Firm** | Thomson Reuters | Starter (1 a 4 usuários, até 300 processos), Advanced, Premium | Não público [29, J1] | IA só em Premium e Exclusive (maio/2026) [J1] |
| **Preâmbulo** (CPJ-3C, **Office.ADV**) | Preâmbulo Tech | CPJ-3C: grandes bancas e departamentos; **Office.ADV: "escritórios em crescimento"** | Não público (demonstração) [30, 31] | "40 dos 100 maiores escritórios" (declarado). **Correção do J1:** não é Softplan |
| **eLaw Adv** (ex-Proadv) | Elaw | Solo e escritório compacto | R$ 119,90 a R$ 349,90 **ou** R$ 70 a R$ 260 (duas tabelas) **[a confirmar]** [J2] | Teste de 10 dias sem cartão |
| **Legalcloud** | Legalcloud | Solo e pequeno | Básico grátis; Premium: valor não localizado [a confirmar] [32] | Foco em prazos e cálculos; **não é gestão completa** |
| **Jusbrasil Pro (+ Jus IA)** | Jusbrasil | Solo e pequeno (pesquisa) | R$ 78,90 / 108,90 / 208,90 [J1] | **Não é gestão**; Jus IA passou a estar em todos os planos (notícia) [43] |
| **Jurídico Certo** | Jurídico Certo | Marketplace de advogados e correspondentes | n/a | **Não é gestão** [33] |
| **SGJur** | ver J7 | | | |

---

## 2. A matriz

**Legenda:** **S** = sim; **P** = parcial; **$** = só em plano superior ou pago à parte; **N** = não; **?** = não encontrei. Números entre colchetes remetem às fontes (seção 8). `[J1]`, `[J2]` = relatórios do repositório (que citam suas próprias fontes).

### 2.1 Processo, prazo e produtividade

| Funcionalidade | Astrea | Projuris ADV | ADVBOX | EasyJur | Legal One Firm | Preâmbulo (Office.ADV / CPJ-3C) | eLaw Adv | Legalcloud |
|---|---|---|---|---|---|---|---|---|
| **Cadastro de processo** (CNJ, partes, vínculos) | S: cadastrados ilimitados; robô busca por OAB ou CNJ [1]. Partes e vínculos: ? | S [J1]; vínculos ? | S: 1.000 ativos inclusos [16] | S: ilimitados (monitoramento tem franquia) [27] | S: importação por planilha [29] | S: distribuição automática de novos processos pela OAB [31] | S: nasce da publicação como rascunho [J2] | P [32] |
| **Monitoramento de andamentos** | S: push; 40 a 2.000 monitorados conforme o plano [1]. Queixas de falha e atraso [9, 37] | S [J1] | S em todos os planos; recaptura retroativa em até 72 h úteis (2021) [16, 19] | S: franquia de 100 a 5.000 pushes [27] | S: robôs em sites de órgãos e tribunais [29] | S: tempo real, linha do tempo [31] | S: robôs; IA classifica [J2] | $ Premium [32] |
| **Publicações e intimações** (DJE, DJEN, Domicílio) | S: por "nomes" (0, 1, 3, 5, 10 conforme o plano) [1]. DJEN e Domicílio: ? | S: diferencia DJEN e Domicílio (snippet) [48] | S: 25 termos DJEN (Max), 100 (Elite); termos nos planos menores: ? [16] | S: "advogados com intimações" (1 a 10) [27] | S: painel de leitura e tratamento; intimações eletrônicas $ [29, J1] | S [31]; DJEN: ? | S: DJEN, DJE/Domicílio, PJe, Projudi, eproc; limite por plano [J2] | $ Premium com Publicações: DJEN nacional [32] |
| **Cálculo e controle de prazos** | S: calculadora; IA sugere prazo (**Company e Vip**) [1, 5]. Feriado local: ? (queixa de 2022) [9] | S; IA sugere prazos e próximos passos [J1]; calculadora gratuita aplica recesso (snippet) [48] | S: padrão **D0 a D-5** do escritório; **só feriados nacionais** [18]; prazo final x fatal [19] | S: "análise de prazos" por IA, em tokens [27] | P: sugestão de prazos por IA só Premium e Exclusive [J1] | S: sinaleira de urgência [31] | S: IA, **base legal ao lado**, 1 clique [J2] | S: DJEN/DJE em 800+ comarcas; **documentos oficiais de 60 tribunais**; gera "tópico de tempestividade" [32] |
| **Dobro, suspensões, dias úteis x corridos** | ? | ? | P: D0 a D-5; feriados nacionais [18] | ? | ? | ? | S: dias úteis do CPC, feriados e recessos [J2] | S: detecta úteis ou corridos; CPC, CPP, JEC, CLT [32] |
| **Agenda e audiências** | S: tarefas e eventos; prazos e audiências como "atividade principal"; Google, Apple, Outlook [1, 5, J1] | S: horários de audiências e diligências [11] | S: Google, Apple, Outlook (Banca Jurídica+) [16] | ? | S: Google Agenda e Outlook; cria compromisso a partir da publicação (Advanced+) [29] | S: agenda de prazos e compromissos [31] | S: um clique da sugestão para a agenda [J2] | S: agenda unificada, sincroniza [32] |
| **Tarefas e delegação** | S: etiquetas, menções, kanban de 2 a 5 quadros; **Workflows só Company e Vip** [1, 6] | S: painel e kanban; workflow não em todos os planos [11] | S; **workflow e kanban só Max+**; Taskscore [16, 21] | S: workflow básico a avançado [27] | P: Workflow Premium; Advanced só com add-on (3 fluxos) [29] | S: delegação; workflow com encadeamento de eventos (CPJ-3C) [30, 31] | S: tarefa por gatilho; **ausência com redistribuição** (Starter) [J1] | N |
| **Custas e depósitos** | ? | ? | P: métricas de custos por tipo de ação (Elite) [16] | ? | P: finanças de reembolsos a honorários (Premium) [29] | ? | ? | N |
| **Timesheet** | S: cronômetro e timesheet [1] | S: apontamento de horas (assistente aponta) [25] | ? (Taskscore mede tarefas, não horas) [21] | S: "TimeSheet dinâmico" (Standard+) [27] | S: controle de horas (Advanced+) [29] | S [31] | ? | N |
| **Qualidade e produtividade** | P: indicadores; **gráfico de atividades por equipe e indicadores estratégicos só Company e Vip** [1, 6] | P: indicadores e relatórios [11] | S: Taskscore (pontos por peso da tarefa), controladoria, métricas de safras e qualidade (Elite) [16, 21] | P: gamificação (Standard+, tabela antiga) [27] | P: "transparência do trabalho" (review 2020) [13] | ? | ? | N |
| **Tribunais e peticionamento** | Captura S; peticionamento: ? | **$** Projuris Peticiona e PeticionaMais (certificado A1) (snippet) [26, 44] | Captura S; **$** "agentes de peticionamento" por IA, R$ 200 a partir de/mês por agente; protocolo: ? (snippet) [49] | "Peticionamento automático: em breve" [27] | ? | Produto "Protocolo Preâmbulo" [30]; detalhe: ? | ? | N |
| **Multiusuário e permissões** | S [1] | S: perfil administrador x padrão [25] | ? | S: controle de acesso (review) [12] | S: por área, tipo e cargo (Advanced+) [29] | ? | ? | P: "Equipes" [32] |
| **Segurança e LGPD** | Declarado: nuvem Google, backup, LGPD, controle de acesso [7] | ? | Declarado: LGPD [16] | ? | ? | "Preâmbulo Safe" (certificados) [30] | ISO 27001, 27701, 9001 (declarado, empresa toda) [J1] | ? |

### 2.2 Financeiro, cliente, IA e plataforma

| Funcionalidade | Astrea | Projuris ADV | ADVBOX | EasyJur | Legal One Firm | Preâmbulo | eLaw Adv | Legalcloud |
|---|---|---|---|---|---|---|---|---|
| **Honorários** (contratuais, êxito, sucumbência, parcelas, comissões, repasses) | P: financeiro por processo; honorários, timesheets e despesas por boleto (snippet) [1, 37]. Êxito, sucumbência, repasse: ? | **S/P:** módulo **Contratos de Honorários** ligado a processo ou atendimento: parcelas, % de êxito, reajuste, vencimentos, histórico de versões [22]. Repasse e comissão: ? | P: "financeiro avançado", métricas de honorários (Elite) [16]. Detalhe: ? | P: cobranças personalizadas, automação de faturamento, cálculos monetários (Growth) [27]; **rateio por centro de custos** (review) [12] | S: contratos de honorário e negociações (Advanced+) [29] | P: financeiro integrado [31] | P: financeiro integrado [J2] | N |
| **Financeiro: boleto, Pix, NFS-e** | S: boleto com Pix e **baixa automática**; régua de lembretes antes e depois do vencimento [2]. **NFS-e: ?** (pedida em 2023) [9] | **S:** boleto com baixa ao compensar; **NFS-e** com integração ao município [23, 24] | S: financeiro integrado com Asaas (Banca Jurídica+) [16, 20]. NFS-e: ? | S: **conta digital** (Asaas), boleto, Pix, cartão [27]; nota fiscal (review) [12] | S: nota fiscal, boleto e conciliação (Advanced+) [J1] | S: CPJ-Cobrança (régua por telefone, SMS e WhatsApp) e Preâmbulo Pay, **produtos à parte** [30] | S: boleto [J2] | N |
| **Contratos e procurações** | P: modelos [1] | S: contratos de honorários [22]; procuração: ? | P: modelos e petições [16] | S: gerador de propostas, automação de documentos (Premium+) [27] | S: gera procurações, peças e documentos dos registros [29] | P: "peças dinâmicas" [31] | ? | N |
| **Modelos e geração de documentos** | S [1] | S [J1] | S: gestão de modelos; editor de documentos [16, 17] | S [27] | S [29] | S [31] | **$** peças com IA contratadas à parte [J2] | S: peças com IA [32] |
| **Assinatura eletrônica** | ? | ? | ? (integra ZapSign via Chat Jurídico) [20, 37] | "**Em breve**" [27] | **$** add-on [J1] | **$** JARVIS com Acordo Fechado (minuta, assinatura, acordos) (snippet) [45] | ? | N |
| **GED e digitalização** | P: 1 a 50 GB; documentos por processo [1]. Digitalização: ? | S: módulo Documentos; Google Drive e OneDrive (título de blog) [26] | ? | S: franquia de 10 a 200 GB [27] | S: GED no Premium [J1] | ? | S: 5 GB no básico [J2] | N |
| **Atendimento por WhatsApp** | P: **atalho** para enviar boletos e andamentos por WhatsApp Web [3] | **S:** autoatendimento (cliente consulta processo e fatura), agente de IA, conversa registrada no processo (blog de 20/08/2026) [J1] | P: atalho WhatsApp Web **+ integrações de terceiros**: Chat Jurídico, Chatguru, Idvzap, Sábio Adv, Touchworks, LíderHub, Atende Direito, Briefing Jurídico Ria [20] | **$** Talk (API oficial): setup R$ 880 + R$ 499 a R$ 1.990/mês [J1, 28] | ? | P: só cobrança [30] | P: envia andamentos ao cliente [J2] | N |
| **CRM** | N nativo [J1]; integração com CRM de terceiros (título de blog) [37] | P: "atendimentos" [25] | **S** nativo; integração RD Station [16, 17] | **S:** LCRM e gerador de propostas (Premium+) [27] | P: contatos (Premium) [J1] | ? | ? | P: clientes [32] |
| **Portal e app do cliente** | **S** (Smart, Company, Vip): app Portal do Cliente; tradução de andamentos por IA em créditos [1, 3] | S: área do cliente (ADV completo) [J1]; **cliente não redefine a própria senha** (2025) [11] | P: notifica movimentações ao cliente (review 2021); portal ou app: ? (review de 2023 dizia que não havia app) [10] | S: acessos de clientes (100 a ilimitado) [27] | ? | S: CPJ-Connect (snippet) [37] | S: portal com tradução por IA [J2] | N |
| **Relatórios e jurimetria** | S: indicadores pessoais, gerais, por cliente; estratégicos Company+ [1]. Jurimetria: P (Jux mostra tendências e taxa de procedência) [4] | S; **$** Projuris Jurimetria e Deep Legal [26] | S; BI e "safras" na Elite [16] | S; Legal Analytics (Growth), relatórios avançados (Growth+) [27] | **$** Analytics [29] | S: relatórios e gráficos [31] | S; BI é add-on no Starter [J1] | N |
| **IA: resumo de autos** | ? | S: resumos (plano premium) [J1] | S: Justin-e resume a intimação; Donna consulta os dados [18, 20] | ? (agentes "conhecem fatos e partes") [28] | S: resumo de processo com linha do tempo (Premium+) [J1] | S: "ler e acompanhar processos" (alegado, snippet) [45] | ? | N |
| **IA: minuta de peças** | S: Jux Peças (grátis até 15/01/2027, depois: ?) [1, 4] | S: premium; gerador de petição gratuito (Projuris.ai) [25, J1] | **$** agentes de peticionamento [49] | S: Work usa modelos do escritório [28] | ? | S: Preâmbulo IA (alegado) [45] | **$** [J2] | S [32] |
| **IA: pesquisa de jurisprudência** | S: Jux, base própria com fonte consultável [4, 7] | P: assistente jurídico gratuito (Projuris.ai) [25] | ? | S: "4 milhões de jurisprudências" (declarado) [28] | ? | S (alegado) [45] | ? | S [32] |
| **IA: classificar andamentos e publicações** | S: priorização (Up+) e **tratamento com IA (Company e Vip)** [1, 5] | S [J1] | S: Justin-e, **a partir de R$ 200/mês à parte** [18, 49] | S [27] | S: resumo de publicação (Premium+) [J1] | ? | S [J2] | S: Premium com Publicações [32] |
| **Gestão de correspondentes** | ? | ? | P: "controle de parcerias" [17] | ? | ? | S: módulo ACT (snippet) [37] | S (Starter) [J1] | N |
| **API e integrações** | N/?: "sem API pública" (resumo de busca da página da Aurum) [J1] **[a confirmar]** | S: API (Compartilhado e completo) [J1] | S: API REST, hub de integrações [20] | **$** API + MCP (aditivo) [27] | $ Advanced; incluída no Premium [29, J1] | S: API [30] | ? | N |
| **App móvel** | S [1] | S [J1] | ? | ? | S (Starter) [J1] | ? | ? | S: Android e iOS [32] |
| **Preço de entrada e de 5 usuários** | Grátis 1 ano; **Smart R$ 439/mês equivalente** [1] | R$ 79 solo; R$ 349 compartilhado [J1] | R$ 220; R$ 450 (Banca Jurídica) [16] | R$ 229; **R$ 499 (até 5)** [27] | Não público | Não público | R$ 119,90 a 349,90 ou R$ 70 a 260 [a confirmar] | Grátis; Premium ? |
| **Teste** | 10 dias [1] | 7 dias [J1] | 7 dias sem cartão [17] | 7 dias [27] | Demonstração | Demonstração [30] | 10 dias [J2] | Conta grátis [32] |

**Linhas extras pedidas:** Jusbrasil Pro e Jurídico Certo ficam fora das colunas porque não são sistemas de gestão. O Jusbrasil Pro entrega pesquisa e IA (R$ 78,90 a R$ 208,90, limites mensais de mensagens) [J1]; o Jurídico Certo entrega **marketplace de correspondentes** e pagamento ("Jurídico Pag") [33]. Os dois são **complementos**, o que reforça a lacuna de "tudo no mesmo cadastro".

---

## 3. Conjunto mínimo e conjunto diferencial

(Julgamento da sessão a partir das seções 2.1 e 2.2; "quase todos" = presente em pelo menos 6 das 8 colunas.)

### 3.1 Conjunto mínimo (quem não tem, não vende para escritório)

1. **Cadastro de processo** com partes, cliente e responsável.
2. **Monitoramento de andamentos por robô**, com limite por plano (processos monitorados, pushes, termos).
3. **Captura de publicações** por nome, OAB, CPF ou CNPJ, com limite de nomes.
4. **Prazo com alerta**, hoje quase sempre com **sugestão por IA** (mas muitas vezes só em plano alto).
5. **Agenda** com audiências e sincronização com Google, Outlook ou Apple.
6. **Tarefas com responsável** e comentários.
7. **Modelos de documentos** preenchidos com dados do cadastro.
8. **Financeiro com boleto** (Pix, baixa automática) e contas a receber.
9. **Relatórios e indicadores**.
10. **Multiusuário com permissões** e app móvel.
11. **Portal ou envio de andamentos ao cliente**, quase sempre com **tradução em linguagem simples por IA**.
12. **Teste grátis ou demonstração.**

### 3.2 Conjunto diferencial (poucos têm, ou só em plano alto)

| Diferencial | Quem tem (fonte) | Por que importa |
|---|---|---|
| **Memória de cálculo explicada no próprio prazo** (dia-base, metodologia, feriados considerados) | ADVBOX Justin-e [18]; eLaw Adv com base legal ao lado [J2] | Confiança e prova |
| **Comprovante de tempestividade** (documento oficial do tribunal e "tópico de tempestividade" pronto para o recurso) | Legalcloud [32] | Defende o recurso contra alegação de intempestividade |
| **Padrão de controladoria configurável** (D0 a D-5; prazo final x fatal; conferência no D-1) | ADVBOX [18, 19] | Prazo interno por escritório |
| **Tratamento de publicação por IA com confirmação** | Astrea (Company+), ADVBOX, eLaw, Legal One (Premium+) | Principal ganho de tempo na controladoria |
| **Workflows reutilizáveis** (sequência de tarefas, prazos e responsáveis) | Astrea (Company+), ADVBOX (Max+), EasyJur, Legal One | Padroniza o trabalho |
| **Pontuação de produtividade ponderada** (Taskscore) | ADVBOX [21] | Mede entrega, não horas |
| **Contrato de honorários versionado e ligado ao processo, com NFS-e** | Projuris ADV [22, 24] | Fecha contrato, cobrança e nota |
| **Conta digital e cobrança integradas** | EasyJur, ADVBOX (Asaas), Astrea (boleto e Pix) | Baixa automática |
| **WhatsApp oficial com CRM e IA de triagem** | Projuris ADV, EasyJur Talk ($), ecossistema do ADVBOX | Atendimento e captação |
| **Assistente por conversa que consulta e cria registros** | Projuris ADV [25] | Perguntar ao sistema em vez de procurar |
| **API aberta e MCP** | EasyJur ($), ADVBOX, Projuris | Integração e agentes do cliente |
| **Peticionamento integrado** | Projuris Peticiona ($); "em breve" no EasyJur | Fecha o ciclo (com limites de certificado) |
| **Jurimetria** | Projuris Jurimetria ($), Jux (tendências), Legal One Analytics ($) | Decisão de acordo e proposta |
| **Correspondentes** | Preâmbulo ACT, eLaw Starter, Jurídico Certo | Audiências em outra comarca |
| **Cobrança em massa** (régua multicanal) | Preâmbulo CPJ-Cobrança [30] | Advocacia de volume |
| **Operação humana por trás** (BPO jurídico) | EasyJur Legal Ops [28] | Controladoria terceirizada |

---

## 4. A lógica de 8 funcionalidades-chave (como os sistemas fazem)

Resumo de partida: o desenho é praticamente o mesmo em todos, **captura → vínculo → leitura (IA ou humano) → sugestão → confirmação humana → tarefa e agenda → alerta → conferência**. O que muda é o que fica em plano caro e o quanto a conta é explicável.

### 4.1 Prazo

**Fluxo (convergente):**
1. A publicação ou intimação chega e é **vinculada a um processo cadastrado** (sem vínculo a IA não atua) [5].
2. A IA lê, identifica o ato, propõe **prazo e/ou audiência** e tarefas associadas com campos preenchidos (título, responsável, prioridade) [5, 18].
3. O advogado **confirma, edita ou marca como incorreta**; o feedback volta para a IA [5].
4. A data final é calculada e **o sistema distingue prazo processual de prazo interno**.

**Como cada um faz:**
- **ADVBOX** [19, 18]: três conceitos. **Prazo processual** (o da lei); **prazo fatal** (a véspera do processual, regra "D-1"); **prazo final** (data de entrega da tarefa, por exemplo 5 dias úteis após a intimação; passou, a tarefa está atrasada). O escritório escolhe o padrão de **D0 a D-5**; **a mudança vale só para tarefas futuras**. O sistema considera **feriados nacionais** automaticamente. Ao passar o cursor no "?" ao lado do prazo, mostra o **dia-base, a metodologia e os feriados considerados**. Cada sugestão traz **% de confiança**, que sobe com a aprovação do escritório; há botão "Refinar análise". Alertas por e-mail ao controlador, ao responsável e a todos os gestores. A rotina humana de controladoria é: assistente dá como lida, atribui ao advogado, confere documentos, atribui custas, **confere o cumprimento no D-1 direto no processo eletrônico** (pensada para estoque de até 3 mil processos) [19].
- **Astrea** [5, 1]: a sugestão aparece no módulo Publicações com **tag roxa "IA"**; botão "Confirmar tratamento". Ativada **automaticamente só em Company e Vip**. Possui "double check" e "trava anti-alucinação" (declarado) [4]. A calculadora de prazos existe nos planos, mas **o que ela considera (feriado municipal, estadual, recesso) não está documentado** [a confirmar]; uma avaliação de 2022 reclamava justamente disso, e outra de 2023 pedia que o prazo "contasse automaticamente quando lançado" [9].
- **Legalcloud** [32]: calcula pelo CPC, CPP, JEC e CLT, detecta úteis ou corridos, atualiza **diariamente com suspensões e prorrogações dos tribunais** e guarda **documentos oficiais de 60 tribunais "para comprovação de tempestividade"**; gera o "tópico de tempestividade".
- **eLaw Adv** [J2]: sugere ação e data fatal com **base legal ao lado**; um clique para a agenda; "revisão final é sempre do advogado".
- **Projuris** (snippet de busca) [48]: contagem em dias úteis com início no primeiro dia útil após a publicação (art. 224 do CPC), recesso de 20/12 a 20/01 aplicado na calculadora gratuita; os próprios textos avisam que o recorte automático "não elimina a responsabilidade técnica".

**Pontos fracos recorrentes:** feriado local, falsa sensação de segurança quando o robô falha, IA de tratamento em plano alto.

### 4.2 Andamentos e publicações

- **Como capturam:** robôs entram nos portais dos tribunais **com a credencial do advogado** (OAB, CPF ou certificado) e baixam andamentos e intimações [19, 37]. Segundo o FAQ da Aurum (snippet), a busca é "por número, OAB, intimações eletrônicas ou publicações oficiais, dependendo da estrutura de cada tribunal" [37].
- **O que derruba a captura:** (a) **mudança de senha** do advogado no eproc, e-SAJ, PJe ou Projudi, que "inviabiliza o acesso pelo robô e suspende as entregas de prazo" [19]; (b) **autenticação em dois fatores**: o robô passa a ser dono do acesso por CPF e senha e o advogado só entra manualmente com certificado digital (FAQ Aurum, snippet) [37]; (c) mudança de layout dos tribunais, instabilidade e "ajustes nos robôs" [37]; (d) atraso, por exemplo de "até 48 horas" (avaliação de 2022) [9].
- **Resposta dos fornecedores:** o ADVBOX tem alerta de mudança e **recaptura retroativa em até 72 h úteis**, e **recomenda conferir os sites dos tribunais toda semana** [19]. O Astrea tem tela de "Por que a busca falha" (FAQ, snippet) [37]. Nenhum fornecedor lido mostra ao usuário uma **tela de saúde da captura** por tribunal e credencial [?].
- **Limites que viram preço:** processos monitorados (Astrea 40 a 2.000), pushes (EasyJur 100 a 5.000), nomes (Astrea 0 a 10), termos DJEN (ADVBOX 25 e 100), processos ativos (ADVBOX 1.000 + R$ 100 por 500).
- **Depois da captura:** classificação "relevante x burocrático" (Astrea "priorização de andamentos"), linha do tempo (Projuris, Office.ADV), **tradução para o cliente** com revisão opcional e envio por e-mail e portal (Astrea, eLaw) [4, 3]. Uma avaliação de 2023 relata que, mesmo assim, "o cliente sempre liga perguntando qual foi a movimentação" [9].

### 4.3 Honorários

- **Projuris ADV** é o mais documentado [22]: contrato criado do zero ou de modelo, com **cliente, escopo, regras de cobrança, índices de reajuste, periodicidade, vencimentos**; ligado ao processo ou atendimento; histórico de versões e aditivos; o texto diz que **o sistema deve distinguir honorário convencionado, sucumbencial e reembolso** (CPC art. 85). O boleto sai do contrato, baixa sozinho ao compensar e a **NFS-e** é emitida do contrato, com dados fiscais e município configurados [23, 24].
- **Legal One** (Advanced+): "Contratos de Honorário e Negociações"; (Premium) "todas as finanças, de reembolsos a honorários" [29].
- **Astrea:** controle financeiro por processo, boleto com Pix, **baixa automática**, **régua** (e-mail antes do vencimento e aviso gentil depois) e "faturas detalhadas" [2]. Avaliações de 2022 e 2023 dizem que o financeiro é fraco, pedem integração com extrato bancário, nota fiscal e queixam-se de **imposto descontado automaticamente ao lançar honorários** [9].
- **ADVBOX** (Elite): "métricas de honorários e custos por tipo de ação", safras [16]. **EasyJur** (Growth): cobranças personalizadas, automação de faturamento, cálculos monetários [27].
- **Lacuna comum:** **não encontrei documentação pública** de nenhum sistema sobre **êxito com evento gerador**, **sucumbência com destaque e rateio**, **comissão de sócio e associado**, **repasse ao cliente com retenção** e **conta de terceiros**. Pode estar em área logada **[a confirmar]**. É onde o catálogo (JUR-209 a JUR-213) está à frente do que o mercado mostra.

### 4.4 Tarefas

- A tarefa **nasce da publicação**: ler, cadastrar o processo, agendar o prazo e atribuir ao responsável sem sair da aba (depoimento no site da Aurum) [8]; no ADVBOX, "Aprovar tudo" cria o conjunto de tarefas sugeridas, usando **só os tipos de tarefa que o escritório já cadastrou** [18].
- **Kanban, etiquetas, comentários e menções** (Astrea); **limites reais:** 5 quadros e 9 colunas (queixa no Reclame Aqui, snippet) [37]; tarefa para uma **equipe** só a um usuário (ADVBOX, 2023) [10]; **sem subtarefas no kanban** (Projuris, 2025) [11].
- **Workflow** = sequência fixa de tarefas, prazos e responsáveis que se reutiliza (Astrea Company+, ADVBOX Max+, EasyJur, Legal One) [6, 16].
- **Produtividade:** o **Taskscore** do ADVBOX pontua por **peso e complexidade** da tarefa concluída, não por horas [21]. A visão do time no Astrea mostra a **carga por colaborador** para "delegar sem sobrecarga" [6].
- **Ausências:** o eLaw Starter redistribui tarefas automaticamente quando alguém se ausenta [J1].

### 4.5 Agenda

- Uma **agenda unificada** (prazos, audiências, reuniões, diligências) com sincronização a Google, Apple e Outlook (Astrea, ADVBOX, Legal One, Legalcloud) [1, 16, 29, 32].
- **Prazo e audiência são a "atividade principal"**; as tarefas ficam penduradas nela (Astrea) [5].
- Visão da **carga do time** na agenda (Astrea) [6]; **sinaleira de urgência** (Office.ADV) [31].
- **Pedidos de usuários:** cores por prioridade, eventos antes das tarefas do dia (Astrea, 2022 e 2023) [9], horários de audiência e diligência (Projuris, 2025) [11].

### 4.6 Financeiro

- **Cobrança:** boleto com marca do escritório e Pix, **baixa automática**, régua de lembretes (Astrea) [2]; boleto com baixa ao compensar (Projuris) [23]; **conta digital** e cobrança por boleto, Pix e cartão (EasyJur, via Asaas) [27]; Asaas no ADVBOX [16, 20].
- **NFS-e** só documentada no Projuris ADV; configurar dados fiscais e validar a integração com o município, depois emitir do contrato [24].
- **Conciliação e fluxo:** conciliação bancária no Legal One Advanced [J1]; **rateio por centro de custos e plano de contas** no EasyJur (review) [12]; **integração com extrato bancário é pedido de usuário** (Astrea, 2023) [9].
- **Cobrança de volume:** CPJ-Cobrança tem régua por telefone, SMS e WhatsApp [30].
- **Custo oculto:** EasyJur cobra **consumo fora da franquia** (GED, push, usuários, tokens) e taxa de adesão; ADVBOX cobra taxa de ativação e processos acima de 1.000 [16, 27].

### 4.7 Relatórios

- **Indicadores prontos:** pessoais, gerais de processo, por cliente e estratégicos (Astrea, os últimos só Company+) [1].
- **Gestão de entrega:** Taskscore, safras, qualidade, BI integrado (ADVBOX Elite) [16, 21]; Legal Analytics (EasyJur Growth) [27]; Analytics como módulo pago (Legal One) [29].
- **Pergunta em linguagem natural:** o Assistente de IA do Projuris ADV responde "quais processos têm prazo vencendo esta semana?" ou "quais receitas estão em atraso?" e **devolve gráficos** [25].
- **Jurimetria** é produto separado e pago (Projuris Jurimetria e Deep Legal; Jux mostra "gráfico de tendências" na pesquisa) [4, 26].
- **Pedidos:** relatórios personalizáveis (Projuris, 2025) [11]; em 2020 um usuário do CPJ-3C conta que os relatórios contratados não foram liberados "porque não estávamos prontos" [14].

### 4.8 IA

Todos seguem **propor, com fonte, e o humano confirma**. Detalhes do que muda:
- **Contexto do escritório:** o Assistente do Projuris ADV reconhece o módulo e o item abertos, **cria e atualiza registros** (tarefas, andamentos, horas, cadastros) por conversa, **não exclui**, lê até 5 arquivos por mensagem, **respeita o perfil** (administrador vê a equipe; padrão só os próprios dados) e tem **cota mensal e fase beta** [25].
- **Confiança e aprendizado local:** Justin-e mostra % de confiança, aprende com as aprovações **daquele escritório**, permite "refinar" com contexto e só sugere tarefas já cadastradas [18]. (Compatível com o princípio de não treinar entre escritórios; ver o conflito do subplano 07, 9.2, na Síntese.)
- **Segunda conferência:** Astrea declara "double check" e trava anti-alucinação [4]. **Não é verificável por nós.**
- **Pesquisa com fonte:** Jux usa base própria de julgados coletados dos tribunais, "com possibilidade de consultar as fontes" [7].
- **Agentes que executam:** EasyJur Work ("não é chatbot, é agente que executa", com supervisão) [28]; vários itens estão marcados "em breve" [27].
- **Preço da IA:** Jux grátis até 15/01/2027 (depois "limitação ou cobrança") [1]; Justin-e e cada agente de peticionamento a partir de R$ 200/mês [18, 49]; tokens no EasyJur [27]; IA só nos planos altos no Legal One [J1]; tratamento de publicações só em Company e Vip no Astrea [5].
- **Avisos dos próprios fornecedores:** "IA pode errar, revise" (Astrea [5]), "todas as ferramentas erram e precisam de supervisão" (Projuris [25]), "decisão final sobre cada tarefa é humana" (ADVBOX [18]).

---

## 5. O que os advogados mais elogiam e mais pedem

**Fonte e força:** avaliações lidas do B2B Stack (Astrea 2022 e 2023, ADVBOX 2021 a 2023, Projuris ADV set/2025, EasyJur 2022 e 2023, Legal One e CPJ-3C 2020, DataJuri 2021 e 2022) [9 a 15]; depoimentos dos sites (vitrine, escolhidos pelo fornecedor, **não contam como evidência**); um snippet do Reclame Aqui [37]. **Evidência fraca e antiga em parte.**

### 5.1 O que mais elogiam
1. **Tudo num lugar só** (processos, prazos, financeiro, equipe, clientes) [9, 11, 12].
2. **Facilidade de uso**: aprender rápido, sem parametrização longa [9, 10, 11].
3. **Controle de prazos e publicações**: "essencial na vida do advogado"; **andamento antes de sair no diário** [9].
4. **Etiquetas e filtros de publicações**; "ler, cadastrar, agendar e atribuir sem sair da aba" [9].
5. **Aviso automático ao cliente das movimentações** ("impactou demais") [10].
6. **Timesheet para gerir a equipe** (Astrea) [9].
7. **Suporte rápido por chat** (Astrea, 2023: citado por vários) [9].
8. **Kanban e painel de tarefas** (Projuris, 2025) [11].
9. **Personalização e campos** (DataJuri, EasyJur) [12, 15]; **integração financeira com rateio por centro de custos** (EasyJur) [12].

### 5.2 O que mais pedem (ou reclamam que falta)
| Pedido | Onde apareceu |
|---|---|
| **Calculadora de prazos com feriados municipais, estaduais e recesso; prazo que conte ao lançar** | Astrea 2022 e 2023; ADVBOX 2022 ("falta calculadora de prazo") [9, 10] |
| **Captura confiável**; publicações em sistemas com intimação **exclusiva do portal** (Projudi); integração com eproc; **atraso de até 48 h** | Astrea 2022 e 2023; EasyJur 2023 ("todo dia tem notificação de erro na busca") [9, 12] |
| **Só intimações do meu cliente, não da parte contrária** | Astrea 2023 [9] |
| **Segredo de justiça** acompanhado | Astrea 2023 [9] |
| **Financeiro mais completo, automático e didático; extrato bancário; NFS-e; financeiro por processo** | Astrea (vários, 2022 e 2023); Projuris 2025 ("módulo financeiro ainda tem muito a melhorar") [9, 11] |
| **Assinatura digital** | EasyJur 2023 [12] |
| **Tarefa para uma equipe; subtarefas; cores por prioridade; workflow em qualquer plano** | ADVBOX 2023; Projuris 2025; Astrea 2022 [9, 10, 11] |
| **App mais rápido; app mobile** | Astrea 2023 (lento); ADVBOX 2023 (não tinha) [9, 10] |
| **Andamentos automáticos de cartório (ONR/Registradores)** | Astrea 2023 [9] |
| **Cliente redefinir sua senha; personalizar marca; relatórios personalizáveis** | Projuris 2025 [11] |
| **Importação por planilha e ações em lote; automação e workflow** | DataJuri 2021 [15] |
| **Preço menor para escritório pequeno e para novo usuário** | Astrea 2022 e 2023 ("valor salgado para pequenos", "anual perto de 3 mil") [9] |
| **Canal direto para sugestões** ("o fórum de sugestões depende de votação") | Projuris 2025 [11] |
| **API aberta** | Astrea (Reclame Aqui, snippet) [37] |
| **Suporte**: espera de 12 dias sem publicações; "suporte nível 1 é o gargalo" | Astrea, B2B 2022 e Reclame Aqui 2026 (snippet) [9, 37] |
| **Menos lentidão e travamento** | Projuris 2025 [11] |

Do lado de reclamações comerciais (J1, evidência fraca): promessa diferente do contrato, reajuste anual, mudanças unilaterais, cobrança após cancelamento.

---

## 6. Cruzamento com as 234 atividades JUR e candidatas FX

**Resultado geral:** o catálogo de 234 atividades já cobre **quase toda a lista de funcionalidades do mercado** (captura JUR-032 a 035; prazo JUR-036 a 044; alerta em escada JUR-044; dupla checagem JUR-048; honorários JUR-208 a 211; repasses JUR-211 a 213; correspondentes JUR-232; timesheet JUR-027; portal JUR-225; WhatsApp JUR-226 e JUR-001; jurimetria JUR-195 e JUR-220; trilha de IA JUR-234). Em alguns pontos o catálogo está **à frente** do que o mercado mostra publicamente (êxito, sucumbência, repasse, conta de terceiros, conflito de interesses, prescrição, PLD).

O que **não existe** no catálogo, ou existe só em parte, e **vale entrar** (numeração sugerida FX-001...; prioridade e justificativa são julgamento da sessão):

| FX | Funcionalidade | Falta no catálogo porque | Evidência | Prioridade |
|---|---|---|---|---|
| **FX-001** | **Saúde da captura**: painel "última captura com sucesso" por tribunal e credencial; alerta quando a senha muda, o 2FA liga, o certificado vence ou o tribunal cai; **recaptura retroativa** e aviso "faltam publicações esperadas" | JUR-048, 050, 051 auditam o **resultado**; JUR-229 gere certificado e acesso; **nada trata o robô parado como evento** | Senha derruba o robô [19]; 2FA [37]; queixas de captura [9, 12, 37]; Síntese: "monitor que avise se o robô parar" | **Alta** |
| **FX-002** | **Comprovante de tempestividade**: gerar o trecho de tempestividade com a **memória de cálculo e o anexo do calendário do tribunal** (ato do tribunal, feriado local) para juntar ao recurso | JUR-041 cobre só o feriado local | Legalcloud [32]; Justin-e mostra o cálculo [18] | **Alta** (barato, usa o que já vamos ter) |
| **FX-003** | **Padrão de controladoria do escritório**: configurar prazo interno (D0 a D-5), "final x fatal", quem confere no D-1; mudança vale só para tarefas futuras; **prazo fatal exclusivo para prazo judicial** | JUR-043 e 044 definem a escada, **não a configuração por escritório** | ADVBOX [18, 19] | Média (ajuste de especificação) |
| **FX-004** | **Cobertura de ausência**: férias, doença, audiência fora; **redistribuição automática** de prazos e tarefas e **substituto**; dupla checagem do que ficou sem dono | Não existe atividade de ausência | eLaw Starter [J1]; a Aurum cita a iniciativa "Sócia de Emergência" (conteúdo não lido) [a confirmar] [8] | **Alta** para 1 a 3 advogados |
| **FX-005** | **Regra de distribuição** de processos e publicações por advogado, área e carga + **painel de carga por pessoa** | JUR-021 atribui equipe, sem regra nem carga | Office.ADV [31]; EasyJur cobra "distribuição de processos" [27]; Astrea "carga por colaborador" [6] | Média |
| **FX-006** | **Fluxos reutilizáveis (playbooks)** por tipo de ato ou caso: sequência de tarefas, prazos e responsáveis | JUR-045 e JUR-008 são pontuais | Workflows em 4 sistemas; só em plano alto [1, 16, 29] | Média (diferencial para pequeno: oferecer **em qualquer plano**) |
| **FX-007** | **Migração assistida e portabilidade**: importar planilha ou arquivo de outro sistema (Astrea, ADVBOX, CPJ) e **exportar tudo** a qualquer hora | JUR-054 importa só por CNJ | ADVBOX e EasyJur vendem migração assistida [17, 28]; Legal One importa planilha [29]; review DataJuri pede importação em lote [15]; Astrea tem pedido de backup completo (FAQ, snippet) [37] | **Alta** (reduz o medo de lock-in e acelera a entrada) |
| **FX-008** | **Processo sigiloso ou em segredo de justiça**: visibilidade por caso e captura com regra própria | JUR-231 cobre acesso por perfil, não por caso | Astrea não acompanha segredo (2023) [9]; Síntese: "sigilo por caso" na plataforma | Média |
| **FX-009** | **Confiança da sugestão e aprendizado local**: % de confiança, "marcar como incorreta", "refinar com contexto", só sugerir tipos de tarefa já cadastrados | JUR-234 audita o uso de IA; **não mede nem usa o aceite do advogado** | Justin-e [18]; Astrea [5] | Média (e **sem treinar entre escritórios**) |
| **FX-010** | **Comandos por conversa** que consultam e **criam registros com confirmação**, respeitando permissão, cota e sem exclusão | Previsto na plataforma (Consultor/agentes) **[a confirmar]**; não há atividade JUR | Assistente do Projuris ADV [25] | Média |
| **FX-011** | **API, webhooks e MCP** para o escritório ligar seus próprios agentes e sistemas | É da plataforma, não do catálogo | EasyJur ($), ADVBOX, Projuris; Astrea sem API pública [27, 20, J1] | Média |
| **FX-012** | **Pontuação ponderada de tarefas** (opcional) | Não existe | Taskscore [21] | Baixa: risco de vigilância e de LGPD trabalhista; **decisão de produto** |
| **FX-013** | **Safras e qualidade da carteira** | Só jurimetria geral (JUR-220) | ADVBOX Elite [16] | Baixa (banca de volume) |
| **FX-014** | **Carteira de cobrança em volume** com régua multicanal | Só JUR-215 (cobrar honorários) | CPJ-Cobrança [30] | Baixa (outro mercado) |
| **FX-015** | **Integração com marketplace de correspondentes** | JUR-232 gere correspondente próprio | Jurídico Certo [33] | Baixa |

**Notas de projeto (não são FX, mas vieram da pesquisa):** (a) tradução de andamento ao cliente deve dizer **"o que acontece agora e quando"**, senão o cliente liga mesmo assim [9]; (b) boleto, Pix e NFS-e devem **nascer do contrato** e **baixar sozinhos** (Projuris, Astrea) [22 a 24, 2]; (c) o lançamento de honorário **não deve descontar imposto automaticamente sem avisar** (queixa no Astrea) [9]; (d) **IA gratuita por tempo limitado** é prática de mercado (Jux até 15/01/2027): não depender de preço de IA para entrar [1].

---

## 7. Onde o escritório pequeno (1 a 10 usuários) é mal servido hoje

1. **As melhores funções ficam em plano de 10 usuários ou mais.** No Astrea, **Workflows, tratamento de publicações por IA, gráfico por equipe e indicadores estratégicos são só Company e Vip** (R$ 769/mês cheio, 10 usuários). O Smart (5 usuários) tem calculadora e priorização, mas não o tratamento [1, 5, 6]. No Legal One, IA só Premium e Exclusive [J1].
2. **A IA da controladoria é vendida à parte.** Justin-e e agentes de peticionamento do ADVBOX: a partir de R$ 200/mês cada [18, 49]; tokens no EasyJur [27]. O pequeno paga **gestão + IA + WhatsApp**.
3. **WhatsApp e CRM são uma colcha de retalhos.** ADVBOX depende de pelo menos oito integrações de terceiros [20]; EasyJur Talk custa R$ 880 de setup e R$ 499 ou mais por mês [J1]; Astrea só tem atalho para WhatsApp Web [3]. **Ninguém mostra o cliente, o processo, o prazo, as horas e o financeiro no mesmo cadastro, com WhatsApp oficial incluído.**
4. **A captura depende da senha do advogado e não há plano B visível.** Sem controlador dedicado, o pequeno descobre a falha tarde (3 dias sem publicações, 12 de espera pelo suporte) [9]. O método de controladoria do ADVBOX supõe assistente, conferência no D-1 e conferência manual semanal [19].
5. **Calendário forense fraco.** Feriados locais e suspensões por indisponibilidade não são documentados na maioria; só o Legalcloud guarda o documento do tribunal [32, 18, 9].
6. **Financeiro da advocacia pouco servido.** Reclamação repetida de financeiro fraco; **êxito, sucumbência, repasse, comissão e conta de terceiros não aparecem na documentação pública**; NFS-e só no Projuris [9, 11, 24]. Para o pequeno, honorário de êxito e sucumbência pesam mais no caixa.
7. **Preço previsível é raro.** Taxa de ativação (ADVBOX) e adesão (EasyJur), consumo fora da franquia, processos acima de 1.000 (+R$ 100 por 500), reajuste anual e "mudanças unilaterais" (queixas no Reclame Aqui, snippet) [16, 27, 37].
8. **Ausência e cobertura.** Poucos sistemas tratam férias, doença e prazo sem dono. Um escritório de 1 a 3 advogados vive disso (FX-004).
9. **Complexidade na entrada.** "Funcionalidades complexas no início" (Projuris, 2025) e "bastante funcionalidade, mas não é simples" (Legal One) [11, J1]; Astrea é elogiado justamente pela simplicidade [9]. **O pequeno quer pouca configuração e padrão que já funcione.**
10. **Troca de sistema dá medo.** Migração assistida é vendida como serviço; portabilidade e exportação completa não são destaque (FX-007).
11. **Pesquisa e gestão em ferramentas separadas.** Jusbrasil Pro (R$ 78,90 a 208,90) é à parte; Astrea e EasyJur trazem pesquisa dentro, com limites [J1, 4, 28].
12. **Sigilo da IA.** Um blog de fornecedor concorrente (Locus.IA, **viés comercial**) afirma que as IAs embutidas usam modelos de terceiros sem DPA específico para o sigilo da advocacia [36]. **Não verificado**; a pergunta ao fornecedor é pertinente.

**Perguntas para a entrevista com a advogada da família e outros 5 a 8:** (1) qual sistema usa e quanto paga todo mês, tudo incluído; (2) quando a captura falhou pela última vez e como soube; (3) quem confere prazo no D-1; (4) como controla honorário de êxito e sucumbência hoje; (5) usa WhatsApp com cliente por qual ferramenta; (6) o que faltou quando saiu de férias ou adoeceu; (7) o que a faria trocar de sistema.

---

## 8. Fontes (todas acessadas em 08/11/2026)

Páginas lidas diretamente (texto extraído):
- [1] Astrea, planos e tabela de recursos: https://www.aurum.com.br/astrea/planos-e-precos
- [2] Astrea, gestão financeira: https://aurum.com.br/astrea/gestao-financeira/
- [3] Astrea, atendimento ao cliente: https://aurum.com.br/astrea/atendimento-ao-cliente/
- [4] Astrea, inteligência artificial (Jux): https://aurum.com.br/astrea/inteligencia-artificial/
- [5] Aurum, "Tratamento de publicação com IA" (atualizado 30/04/2026): https://www.aurum.com.br/blog/?p=34013
- [6] Astrea, gestão de tarefas e gestão de equipe: https://aurum.com.br/astrea/gestao-de-tarefas/ e https://aurum.com.br/astrea/gestao-de-equipe/
- [7] Aurum, software jurídico com IA para pequenos e médios escritórios (atualizado 27/10/2026): https://www.aurum.com.br/blog/software-juridico-ia-pequenos-medios-escritorios/
- [8] Astrea, gestão de processos (depoimentos): https://aurum.com.br/astrea/gestao-de-processos/
- [9] B2B Stack, avaliações do Astrea (páginas 1, 2, 3 e 9; 2022 e 2023): https://www.b2bstack.com.br/product/astrea/avaliacoes
- [10] B2B Stack, avaliações do ADVBOX (2021 a 2023): https://www.b2bstack.com.br/product/advbox/avaliacoes
- [11] B2B Stack, avaliações do Projuris ADV (set/2025): https://www.b2bstack.com.br/product/projurisadv/avaliacoes
- [12] B2B Stack, avaliações do EasyJur (2022 e 2023): https://www.b2bstack.com.br/product/easyjur/avaliacoes
- [13] B2B Stack, avaliações do Legal One (2020): https://www.b2bstack.com.br/product/legal-one/avaliacoes
- [14] B2B Stack, avaliações do CPJ-3C (2020): https://www.b2bstack.com.br/product/cpj-3c/avaliacoes
- [15] B2B Stack, avaliações do DataJuri (2021 e 2022): https://www.b2bstack.com.br/product/datajuri/avaliacoes
- [16] ADVBOX, planos: https://advbox.com.br/planos/
- [17] ADVBOX, página inicial: https://advbox.com.br/
- [18] ADVBOX, Justin-e: https://advbox.com.br/justine
- [19] ADVBOX, whitepaper "Prazo Fatal D-1" (2021): https://advbox.com.br/blog/wp-content/uploads/2021/02/Whitepaper-Sistema-Prazo-Fatal-D1.pdf
- [20] ADVBOX, integrações: https://advbox.com.br/blog/integracoes-advbox/
- [21] ADVBOX, Taskscore: https://advbox.com.br/blog/taskscore/
- [22] Projuris, contratos de honorários no ADV (atualizado 24/09/2026): https://www.projuris.com.br/blog/modulo-contratos-de-honorarios-projuris-adv/
- [23] Projuris, emissão de boletos no ADV: https://www.projuris.com.br/blog/emissao-de-boletos-e-gestao-financeira-no-projuris-adv/
- [24] Projuris, emissão de nota fiscal no ADV: https://www.projuris.com.br/blog/emissao-de-nota-fiscal-no-projuris-adv/
- [25] Projuris, ferramentas de IA para advogados e Assistente de IA do ADV (04/11/2026): https://www.projuris.com.br/blog/ferramentas-de-ia-para-advogados/
- [26] Projuris, lista de soluções: https://www.projuris.com.br/advogados/
- [27] EasyJur, comparativo e planos: https://easyjur.com/blog/melhores-softwares-juridicos-comparativo/
- [28] EasyJur, página inicial (EasyJur OS, Work, Legal Ops): https://easyjur.com/roadmap/
- [29] Thomson Reuters, pacotes Legal One Firm: https://www.thomsonreuters.com.br/pt/juridico/legal-one/firm/legal-one-software-juridico.html
- [30] Preâmbulo Tech, página inicial: https://preambulo.com.br/
- [31] Preâmbulo, Office.ADV: https://preambulo.com.br/software-office-adv/
- [32] Legalcloud: https://legalcloud.com.br/
- [33] Jurídico Certo: https://www.juridicocerto.com/
- [34] Relatórios do repositório: `pesquisa/juridico/J1-mercado-software-juridico.md` (citado como [J1]) e `pesquisa/juridico/J2-elaw.md` ([J2], também [34] na tabela dos sistemas); `docs/Sintese_Pacote_Juridico.md`; `pesquisa/juridico/atividades-juridico.json`.
- [36] Locus.IA (fornecedor concorrente, viés comercial), "sistemas de advocacia 2026": https://ialocus.com.br/blog/post-sistema-advocacia-lgpd-cpj-astrea-projuris-2026.html
- [39] B2B Stack, DataJuri: https://www.b2bstack.com.br/product/datajuri

Resultados de busca (trecho do resultado; página **não** lida por bloqueio, JavaScript ou falta de tempo; tratar como indício):
- [37] Reclame Aqui, FAQ da Aurum sobre 2FA e busca: https://www.reclameaqui.com.br/empresa/aurum/faq/astrea-como-a-autenticao-de-dois-fatores-afeta-a-busca-e-como-resolver_L0Xce4tAx9l8GI60/ ; FAQ de tribunais suportados: https://www.reclameaqui.com.br/empresa/aurum/faq/astrea-quais-tribunais-so-suportados_6Eb7IjTclqC78cxQ/ ; reclamação sobre limites do kanban: https://www.reclameaqui.com.br/aurum/decepcao-com-o-astrea-promessa-comercial-nao-cumpre-a-realidade-suporte-ruim-e-limitacoes-graves-na-plataforma_ZLyD4iACrsk48yYh/ ; lista de reclamações: https://www.reclameaqui.com.br/empresa/aurum/lista-reclamacoes/
- [38] Aurum, Themis x Astrea: https://www.aurum.com.br/blog/themis-e-astrea/ ; Capterra, "SAJ ADV": https://www.capterra.com/p/218411/SAJ-ADV/
- [43] Jusbrasil, Jus IA em todos os planos (notícia): https://jurinews.com.br/ia/jusbrasil-integra-ia-em-todos-os-planos-para-facilitar-o-acesso-dos-advogados-brasileiros-a-inteligencia-artificial
- [44] Projuris Peticiona: https://www.projuris.com.br/peticiona/ ; PeticionaMais: https://www.projuris.com.br/tag/peticionamais/
- [45] Preâmbulo IA (Startups, ago/2026): https://startups.com.br/negocios/preambulo-lanca-ia-especializada-em-direito-para-advogados/ ; AB2L 2026 (CPJ-AI, CPJ-Safe, JARVIS): https://www.migalhas.com.br/quentes/455196/preambulo-tech-participa-da-ab2l-lawtech-experience-2026
- [47] Projuris, boletos (endereço antigo "saj-adv"): https://www.projuris.com.br/software-juridico-com-emissao-de-boletos-e-gestao-financeira-no-saj-adv/
- [48] Projuris, prazos processuais e recorte do Diário Oficial: https://www.projuris.com.br/blog/prazos-processuais/ ; https://www.projuris.com.br/como-funciona-o-recorte-automatico-do-diario-oficial/ ; calculadora: https://www.projuris.com.br/calculadora-de-prazos-processuais/
- [49] ADVBOX, agentes de peticionamento com IA: https://advbox.com.br/blog/agentes-de-peticionamento/
- Pesquisas tentadas **sem resultado útil**: Reddit e fóruns de advogados; vídeos de review; relatório completo "Tendências da Advocacia 2026" da Aurum (só trechos); pesquisa Conjur sobre satisfação com software (página 404).

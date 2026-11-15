# B2 · Concorrentes BR: gestão de escritório contábil e processos

6 de novembro de 2026 · Rodada B do [Protocolo de Descoberta](00-protocolo-de-descoberta.md) · agente B2

**Escopo:** sistemas brasileiros de **gestão do escritório contábil** (tarefas e processos, monitoramento, comunicação, app do cliente, cobrança de honorários, indicadores), com atenção a IA. A pedido do usuário, a varredura foi **além da lista inicial**: entraram também Domínio Messenger/Portal/Certificados/Conta Digital, Omie G-Click e Decola CNPJ, VERI, SIEG, e-Kontroll, Questor Quiu, Contbank e Digisac.

## Como ler este arquivo

- **Método.** Páginas oficiais dos fornecedores lidas nesta sessão (06/11/2026) com `curl` e extração de texto; 13 buscas na web para achar páginas e notícias. Quando a informação vem só do resumo do buscador ou de imprensa, isso está dito.
- **Confiança.** "Alta" só quando a página do próprio fornecedor ou do órgão foi lida agora. Funcionalidade que não apareceu nas páginas lidas está como `?` (não encontrado), **não** como "não tem".
- **Fichas novas:** 13 (`GES-201` a `GES-208`, `FIS-201`, `NFE-201`, `SOC-201`, `FIN-201`, `DP-201`). Antes de criar cada uma, o inventário de 420 atividades foi conferido (lista de ids parecidos em cada ficha, campo `não_confundir_com`).
- **Limites.** Não abriram: gestta.com.br (bloqueio Cloudflare), onvio.com.br (página exige navegador), calima.app (aplicação de página única, sem texto), páginas de preço da SIEG e da Digisac (formulário/404). "Contábil Nuvem" não foi encontrado como produto (busca de 06/11/2026); os resultados apontam para Questor, Makro e Numbra.

---

## 1. Achados principais

1. **Gestta foi adquirida pela Thomson Reuters em 26/04/2022** (Gestta Technology Ltda., antes do grupo Redspark, fundada em 2016; 600 mil empresas cadastradas nos escritórios clientes; valor não divulgado). As duas já tinham anunciado integração em janeiro de 2021 [S1]. Hoje o site da Domínio vende **"Domínio Processos"** como módulo adicional, com as mesmas funções que o white paper atribuía ao Gestta Processos (cobrança automática de documentos com confirmação de abertura do e-mail, baixa automática de tarefas e obrigações, relatórios de produtividade e **tempo de produção de cada tarefa**) [S2][S3]. Que o Domínio Processos é o Gestta renomeado é **inferência** (mesmas funções, mesma integração), não declaração oficial encontrada.
2. **Antes x depois da aquisição (Gestta).** Antes: produto independente, integrável a qualquer core, com tarefas pré-parametrizadas, Gestta Express e Messenger (D7 [R6][R7]); white paper de ~2020 cita 1 mil clientes, 20 milhões de tarefas, painéis por nível (administrador, gerente, operacional) [S2]. Depois: vira módulo **dentro do ecossistema Domínio/Onvio** (login pelo Onvio, vinculação com o Evolução em Nuvem para emitir guias DAS/DAE/DARE/DARF) e o atendimento passa ao **Domínio Messenger**, que agora diz executar **mais de 25 solicitações por IA via WhatsApp, 24/7** [S3][S4]. O ganho foi integração profunda com o core; a perda, para quem não usa Domínio, é a neutralidade.
3. **MCP chegou ao mercado contábil.** Acessórias (beta) e Nibo oferecem servidor MCP para que ChatGPT, Claude, Gemini e Grok **consultem e executem ações** (abrir processo, reagendar tarefa, relatório de atendimento) com os dados reais do escritório; a Nibo diz levar isso também aos clientes [S5][S6]. O "chat único com M2/M4" do Plano deixa de ser exclusivo; o diferencial terá de estar na amplitude (M1 legal + M3 cálculo + ações nos portais) e na governança.
4. **IA que audita o atendimento humano.** O Komunic Gestão (Acessórias) lê cada conversa encerrada e pontua seis critérios configuráveis (sentimento, cordialidade, resolução, linguagem imprópria, empatia, frustração), com fila de revisão humana e indicadores por colaborador; a HubStrom tem "nível de satisfação geral com IA" e revisão de tom antes do envio [S7][S8][S9].
5. **"Agentes" já são produto.** A Alterdata vende uma **Central de Agentes**: Auditor de Férias em Dobro, Monitor de Agendamentos de Férias, Monitor de Instrumentos Coletivos (com eSindical), Monitor de Pré-admissões, Distribuidor e Monitor de Parcelamentos do Simples, que criam tarefas no eTarefas e avisam o cliente por e-mail/WhatsApp [S10]. São robôs de regra com rótulo de agente, mas fixam a expectativa do comprador.
6. **Cliente que se atende sozinho.** HubStrom (AppHub), Nibo, VERI e o agente da Alterdata deixam o **cliente recalcular DAS/DARF vencido** sem chamar o escritório [S9][S6][S11][S10]. HubStrom, Nibo e SIEG põem **emissor de NFS-e para o cliente** dentro do app/ecossistema do escritório [S9][S6][S12].
7. **App com a marca do escritório é padrão de mercado**: HubStrom (adicional de R$ 300/mês, ou AppHub+ R$ 9,90 por cliente/mês), Acessórias (App + Área VIP), Nibo (MeuApp), Omie G-Click (Visão do Cliente) [S8][S13][S6][S14].
8. **Receita de parceria virou argumento de venda.** Domínio Conta Digital (boleto R$ 1,80; NF R$ 0,20; régua R$ 0,29) e Domínio Benefícios com VR ("quanto mais seus clientes usam, mais o seu escritório ganha"); Conta Azul Mais (gratuita para o contador, revenda de licenças com desconto de até 85%; Pro a partir de R$ 199,90 e Pro BPO R$ 129,90 no nível Bronze, mínimo de 3 licenças); Omie Decola CNPJ (geração de oportunidades no CRM, conta PJ e certificado para o cliente novo) [S15][S16][S17][S18].
9. **Pré-venda com dado público.** A VERI faz **Pré-Análise só com o CNPJ, sem certificado** (CNDs, PGFN, FGTS, trabalhista, dívida ativa, Simples/SIMEI, inscrições) e um **Health Score Fiscal 0–100** com leitura da IA VERA [S11].
10. **Preços públicos são raros.** Só HubStrom (Professional a partir de R$ 527/mês; Enterprise a partir de R$ 957/mês), Makro (R$ 195 a R$ 595/mês e plano grátis), Conta Azul (licenças) e as tarifas da Domínio Conta Digital estavam na página [S8][S19][S16][S15]. Acessórias, Domínio, Alterdata, Nibo, SIEG, VERI, Jettax e Digisac pedem demonstração.
11. **Consolidação do setor:** Thomson Reuters/Gestta (2022) [S1]; Vela LatAm/Projetus TI, dona do Calima (27/08/2025) [S20]; Conta Azul/Mister Contador (24/07/2026; ~3.000 escritórios) [S21].
12. **O que ninguém mostrou** nas páginas lidas: tempo medido automaticamente **e** rentabilidade por cliente **e** IA com os dados do cliente **e** cobrança de honorários no mesmo produto. O mais perto é o e-Kontroll (e-Custos, e-Monitor, e-Ligações) sobre o Domínio, que não tem atendimento nem tarefas próprias [S22]. Confirma, com fontes desta vez, o indício do D7.

---

## 2. Concorrente por concorrente

| Concorrente | Módulos e funcionalidades marcantes | IA | App do cliente | Preço público | Fontes |
| --- | --- | --- | --- | --- | --- |
| **HubStrom** | Seis módulos: **MonitorHub** (e-CAC, caixa postal, CNDs, declarações, sublimite do Simples, 12+ tipos de parcelamento com guia automática, confirmação de pagamento, DCTFWeb transmitida e enviada, FGTS Digital, DET); **ConnectHub** (WhatsApp, até 3 números, URA, grupos por departamento, envio em lote que identifica o cliente pelo arquivo, **auditoria de mensagens excluídas**); **XMLHub** (NF-e/NFC-e de 23 UFs, NFS-e Nacional, CT-e, "proteção de manifestação automática"); **TaskHub** (processos em cascata, modelos, calendário/tabela, formulário do cliente vira tarefa, **tarefa conclui sozinha quando a guia é entregue**, ordem de serviço, auditoria de processos); **DriveHub** (pastas automáticas por cliente, 128/512 GB, lixeira 20 dias, envio pelo WhatsApp); **AppHub** (white label). "+6.000 escritórios" | Gemini cria processos e formulários a partir de descrição; IA revisa o tom, resume conversas longas, mede satisfação; URA IA (Enterprise) | Sim, white label; cliente vê indicadores, recalcula guia, acompanha solicitações, conversa, **cadastra serviços e tomadores para emitir NFS-e** | Professional a partir de R$ 527/mês (até 30 perfis, 1 número); Enterprise a partir de R$ 957/mês (perfis ilimitados, 3 números); app white label + R$ 300/mês; AppHub+ R$ 9,90/cliente/mês | [S8][S9][S23] |
| **Acessórias** | Gestão de Processos; Automação de Entregas; Gestão de Prazos; Protocolo Digital (data, hora e IP de entrega e leitura); GED/Acessórias Docs; **AC Notifica** (guia pelo WhatsApp com link de pagamento); **AC Certifica**; Tela de Insights (atrasos, gargalos, NPS); Komunic (API oficial, vários atendentes); Método APLA; integração com e-Kontroll e Contmatic. Sede em Belo Horizonte | **Komunic Gestão** audita cada atendimento em 6 critérios; **Acessórias MCP** (beta) para ChatGPT/Claude/Gemini usando a API do escritório | App personalizado + Área VIP (solicitações, comunicados, status, avaliação do atendente e do escritório) | Não público | [S5][S7][S13] |
| **Domínio (Thomson Reuters)**, incl. ex-Gestta | Domínio Processos (módulo pago); Domínio Messenger; Portal do Cliente e do Empregado (confirmação de que o cliente visualizou a guia; pedidos de férias/rescisão; cadastro de empregado direto ao eSocial; certidões); Busca Convenções; Busca NF-e; Box-e; **Certificados Digitais** ("organize, centralize e rentabilize"); **Conta Digital**, **Cobranças** e **Benefícios** (VR) | Messenger com IA executa 25+ solicitações via WhatsApp, 24/7; Classificador Tributário | App do Portal do Cliente | Módulos não públicos; Conta Digital: boleto R$ 1,80, NF R$ 0,20, régua R$ 0,29, Pix grátis | [S1]–[S4][S15][S24] |
| **Onvio** | Plataforma em nuvem da Thomson Reuters onde rodam Portal do Cliente e o login do Processos; Onvio Messenger nos pacotes Plus e Premium (catálogo citado pelo buscador) | ? | Portal do Cliente | ? | [S2][S25] |
| **Alterdata** | eTarefas (fases com responsável, alerta de risco de multa, conclusão automática quando o cliente envia o documento, vínculo automático por regime ao cadastrar empresa); eContador (CRM/portal); eLegalize; eSindical; eIndicadores (limites do Simples e DP); eExtratos/eEscriture; UpDocs; eRadar eCAC; CND; eChat; eBot; ponto eletrônico | **Central de Agentes**; **IA Contábil** (WhatsApp, base de 200+ artigos editável); eSindical resume convenções com IA | eContador (app) | Não público | [S10][S26] |
| **Nibo** | Nibo Obrigações Plus (obrigações, **robôs de leitura personalizáveis**, recálculo de DAS/DARF pelo cliente, cobrança automática de documentos, tarefas, dashboards com satisfação); Radar e-CAC; Conciliador Open Finance; Nibo Emissor (NFS-e de clientes em 2 mil+ municípios); WhatsApp oficial; Gestão Financeira do escritório incluída; BPO Financeiro; Importador Universal. "+15 mil clientes" | **MCP Nibo Contador** (consulta e ação; ChatGPT, Claude, Gemini, Grok) | MeuApp com a marca do escritório | Não na página | [S6] |
| **Makro** | Core 100% web (Pessoal, Fiscal, Contábil, Financeiro, Controle de Tarefas); Makro DSE (NFS-e pelo Portal Nacional, 517 municípios); Makro Whats (histórico com **mensagens apagadas**, protocolos, robô); Makro CND; Makro API | **Gi – Gestora Inteligente**: prompts personalizados, análise de dados, **resumo de convenções coletivas**, agenda tributária | ? | Grátis (3 empresas); Light R$ 195; Básico R$ 295; Intermediário R$ 395; Avançado R$ 595/mês por licença | [S19][S27] |
| **Conta Azul Mais** | Portal do contador gratuito para revender e gerir o **ERP do cliente**; Automação Fiscal (NF-e, NFS-e, NFC-e, CT-e da carteira); integração com Domínio, SCI, Alterdata; 50+ relatórios/BI por cliente; BPO financeiro; Programa de Parceria (geração de negócios, mentorias). 14 mil contadores parceiros | **Conta Azul IA** lê documento, foto, texto ou áudio (WhatsApp, e-mail, upload) e cria/concilia lançamentos, sem custo adicional | CA de Bolso (app do empresário) | Pro R$ 199,90 e Pro BPO R$ 129,90/mês (nível Bronze), desconto até 85% | [S16][S28] |
| **Conexa** | Faturamento recorrente: contratos, régua de cobrança, NFS-e, conciliação, **13º honorário**, métricas (MRR, churn); foco em escritórios com 80+ clientes. "+2.500 empresas" | ? | ? | Não público | [S29] |
| **Omie (G-Click, Decola CNPJ)** | G-Click: fluxo em cascata, Kanban, tarefas recorrentes, gatilhos de automação, captura e leitura de documentos, solicitação de documentos, **fluxo de IRPF**; Visão do Cliente; Decola CNPJ (estrutura comercial, oportunidades no CRM); OneFlow (contábil); Conta Omie.Cash | Omie.IA Fiscal (classificação de produtos) | Visão do Cliente com identidade do escritório | Não público | [S14][S18] |
| **Jettax** | Captura NF-e/NFS-e (2.200+ prefeituras; tomados de fora em 600+), auditoria de NCM, Simples diário com Fator R, Prevenção (e-CAC, DEC-SP, DUC-SP), ICMS ST/DIFAL, SPED em lote; integração nativa com Domínio, Contmatic, Omie, Nibo | "Jettax IA" (menu; escopo não lido) | ? | Não público | [S30] |
| **VERI** | Monitoramento (CNDs, e-CAC, DCTFWeb, PGDAS, parcelamentos, PGFN); rotinas de guias com **recálculo**; **Raio-X Fiscal** (Pré-Análise sem certificado, Diagnóstico, Health Score 0–100); Gestão à Vista 360°; "+7.000 escritórios" | VERA lê o diagnóstico e prioriza | ? | Não público | [S11] |
| **SIEG** | Docs Fiscais, Controle de Pendências (e-CAC), **Emissão Fiscal ilimitada para os clientes**, Gestão de IRPF (coleta antecipada); "+22.000 escritórios e empresas" | ? | ? | Não público (formulário) | [S12] |
| **e-Kontroll** | BI sobre o Domínio: e-Painel, e-Contábil (esforço por empresa e colaborador, apoio à precificação de leads), e-Consultoria; add-ons **e-Custos** (rentabilidade e honorários), e-Contratos, e-Gestor (integração Acessórias), **e-Monitor** (uso do tempo), **e-Ligações** (VoIP); e-API | ? | Não | Não público | [S22] |
| **Questor** | Tareffa (processos modelo, ex.: cobrança de arquivos do fechamento); **Quiu** lê guias de pasta monitorada e vincula à obrigação, já com DARF unificado; Questor Zen | ? | ? | ? | [S31][S32] |
| **Contmatic** | Core Phoenix em nuvem; ERP Simplifique para o cliente; integrações com Busca Legal, Acessórias, Jettax, Contbank; Academy e Comunidade | ? | ? | Promoção "mensalidade zerada" (sem valor) | [S33] |
| **Calima (Projetus TI)** | ERP contábil (fiscal, contábil, folha); versão gratuita no passado (fórum de 2017, possivelmente desatualizado); comprada pela Vela LatAm em 27/08/2025 | ? | ? | ? | [S20][S34] |
| **Digisac** (multiatendimento genérico) | WhatsApp API, Instagram, webchat, e-mail, SMS, Reclame Aqui; chatbot, funil, CRM, simulador de custo da API | Agente Inteligente (base de conhecimento, tom de voz, regras de escalonamento), Copiloto | — | Não público | [S35] |
| **Contbank (BPO Suite)** | Plataforma transacional de BPO financeiro: pagamentos em lote, contas a pagar e receber, cobrança, NF, Open Finance; "um profissional atende cerca de 80 clientes" | Categorização com IA | — | Não público | [S36] |

---

## 3. Matriz de funcionalidades × concorrentes

Legenda: **✔** visto na página oficial lida em 06/11/2026 · **~** parcial ou por integração · **?** não encontrado nas páginas lidas (não significa ausência) · **P** previsto no Plano da plataforma.

| Funcionalidade | HubStrom | Acessórias | Domínio (+ex-Gestta) | Alterdata | Nibo | Makro | Conta Azul Mais | Omie G-Click | VERI | SIEG | Jettax | e-Kontroll | Plataforma |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Processos/tarefas com modelos | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ? | ✔ | ? | ? | ? | ? | P |
| Processo criado por IA a partir de descrição | ✔ | ? | ? | ? | ? | ? | ? | ? | ? | ? | ? | ? | GES-206 |
| Tarefa conclui sozinha por evento (guia enviada, doc recebido) | ✔ | ~ | ✔ | ✔ | ? | ? | ? | ✔ | ? | ? | ? | ? | GES-206 |
| Monitor e-CAC / situação fiscal | ✔ | ? | ? | ✔ | ✔ | ~ (CND) | ? | ? | ✔ | ✔ | ✔ | ? | P |
| Envio automático de guias com prova de leitura | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ? | ? | ✔ | ? | ? | ? | P |
| Cliente recalcula guia vencida sozinho | ✔ | ? | ? | ✔ | ✔ | ? | ? | ? | ✔ | ? | ? | ? | FIS-201 |
| Robô lê guias/documentos e acha cliente e obrigação | ✔ | ✔ | ? | ~ | ✔ | ? | ✔ | ✔ | ? | ? | ? | ? | P |
| Captura de XML NF-e/NFS-e | ✔ | ? | ~ | ✔ | ? | ✔ | ✔ | ? | ? | ✔ | ✔ | ? | P (D3) |
| WhatsApp oficial multiatendimento | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ? | ? | ? | ? | ? | ? | P |
| IA responde o cliente | ~ (URA IA) | ? | ✔ | ✔ | ? | ? | ? | ? | ? | ? | ? | ? | P |
| IA audita a qualidade do atendimento humano | ✔ | ✔ | ? | ? | ? | ? | ? | ? | ? | ? | ? | ? | GES-201 |
| Histórico com mensagens apagadas/editadas | ✔ | ? | ? | ? | ? | ✔ | ? | ? | ? | ? | ? | ? | GES-203 |
| App com a marca do escritório | ✔ | ✔ | ~ | ~ | ✔ | ? | — | ✔ | ? | ? | ? | — | GES-204 |
| Emissor de NFS-e para o cliente | ✔ | ? | ? | ? | ✔ | ? | ✔ (ERP) | ? | ? | ✔ | ? | ? | NFE-201 |
| Servidor MCP para IAs externas | ? | ✔ (beta) | ? | ? | ✔ | ? | ? | ? | ? | ? | ? | ~ (e-API) | GES-202 |
| Agentes de rotina (monitoram e abrem tarefas) | ~ | ? | ? | ✔ | ? | ? | ? | ~ (gatilhos) | ? | ? | ? | ? | P |
| Painel de produtividade por pessoa/setor | ✔ | ✔ | ✔ | ✔ | ✔ | ? | ? | ✔ | ✔ | ? | ? | ✔ | P |
| Tempo por tarefa / uso do tempo | ? | ? | ~ (tempo de produção) | ? | ? | ? | ? | ? | ? | ? | ? | ✔ (e-Monitor) | P (timesheet) |
| Rentabilidade e custo por cliente | ? | ~ (via e-Kontroll) | ? | ? | ? | ? | ? | ? | ? | ? | ? | ✔ (e-Custos) | P |
| Cobrança de honorários com régua | ? | ? | ✔ | ~ (reajuste) | ✔ | ✔ (financeiro) | ? | ? | ? | ? | ? | ? | P |
| Serviços financeiros e receita de parceria | — | — | ✔ | ? | ? | — | ✔ | ✔ | — | — | — | — | GES-205 |
| Certificado digital (gestão ou emissão) | ? | ✔ (gestão) | ✔ (emissão e receita) | ? | ? | ? | ? | ✔ (no Decola) | ? | ? | ? | ? | SOC-201 |
| Convenção coletiva resumida por IA | ? | ? | ~ (Busca Convenções) | ✔ | ? | ✔ | ? | ? | ? | ? | ? | ? | DP-201 |
| Raio-X do prospect só com CNPJ | ? | ? | ? | ? | ? | ? | ? | ? | ✔ | ? | ? | ~ (precificação de lead) | GES-207 |
| Geração de leads para o escritório | ? | ? | ? | ? | ? | ? | ✔ (programa) | ✔ (Decola) | ? | ? | ? | ? | GES-208 |
| BPO financeiro do cliente | ? | ? | ~ (Conta Digital) | ✔ (menu) | ✔ | ? | ✔ (Pro BPO) | ? | ? | ? | ? | ? | FIN-201 |
| Preço público | ✔ | — | ~ (tarifas) | — | — | ✔ | ✔ | — | — | — | — | — | — |

---

## 4. O que vale copiar

1. **Tarefa que se fecha sozinha por evidência** (HubStrom, Domínio Processos, eTarefas, G-Click). Na plataforma: toda tarefa nasce com um "critério de conclusão" verificável (guia entregue e lida, documento recebido, recibo da declaração anexado, evento no core) e só pede clique humano quando o critério não puder ser checado.
2. **Prova de leitura com data, hora e IP** (Acessórias Protocolo Digital, Komunic; Domínio Portal). Barata, encerra o "não recebi" e alimenta o GES-036.
3. **Cliente que recalcula e emite sozinho** (HubStrom, Nibo, VERI; Nibo Emissor, SIEG). Tira do atendimento as duas perguntas mais repetidas ("a guia venceu" e "emite minha nota"), com M3 por trás. Fichas FIS-201 e NFE-201.
4. **IA como auditor do atendimento, não só como atendente** (Komunic Gestão, HubStrom). Seis critérios configuráveis, fila de revisão e indicador por pessoa. Ficha GES-201; liga com GES-062 (governança da IA) e GES-038 (NPS).
5. **Servidor MCP** (Acessórias, Nibo). Ter um MCP oficial da plataforma é obrigação de mercado; o diferencial é expor também M1 (norma), M3 (cálculo) e ações em portal com aprovação. Ficha GES-202.
6. **Processo criado por IA a partir de descrição** (HubStrom com Gemini). Encurta a implantação, que é onde o concorrente promete "24 horas / 30 dias". Ficha GES-206.
7. **Agentes nomeados por dor** (Alterdata: "Auditor de Férias em Dobro", "Distribuidor de Parcelamentos"). O nome vende melhor que "automação". Vale empacotar as fichas do inventário como agentes com nome, alcance e trilha auditável.
8. **Raio-X fiscal do prospect só com CNPJ** (VERI). Ferramenta de pré-venda e de aceitação de cliente (GES-101). Ficha GES-207.
9. **Preço aberto** (HubStrom: "Mostrar o preço não é ousadia. É confiança"). Quase ninguém publica; publicar é diferencial.
10. **Receita de parceria** (Domínio Conta Digital/Benefícios, Conta Azul Mais, Omie Decola). O escritório quer reduzir o custo do software com comissão; a plataforma pode ser neutra (vários parceiros) em vez de amarrada a um banco. Ficha GES-205, com cuidado de conflito de interesse.
11. **Painel de "limites" do cliente** (sublimite do Simples no MonitorHub; eIndicadores). Já está no FIS-011; copiar a forma de mostrar na tela inicial do app do cliente.
12. **O que não copiar:** auditoria que mostra ao administrador mensagens que o próprio cliente apagou deve passar por LGPD e transparência (aviso no canal), não ser recurso escondido (GES-203).

---

## 5. Fichas novas

Formato do protocolo (seção 2.1 e 2.2), resumido nos campos que esta rodada pôde preencher. `nível` e `preço` são hipótese da descoberta até a Etapa 2 confirmar.

### GES-201 · Auditar com IA a qualidade de todos os atendimentos humanos

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Gestão e Atendimento / Qualidade do atendimento |
| etapa | Manutenção |
| atividade | Ler cada conversa encerrada (WhatsApp, app, e-mail), pontuar critérios configuráveis (sentimento, cordialidade, resolução, linguagem, empatia, frustração, prazo de resposta) e mandar para revisão humana o que fugir do padrão |
| descrição | Hoje o coordenador lê conversas por amostragem, quando lê; reclamação só aparece quando o cliente reclama ou sai. A plataforma pontua 100% das conversas, mostra indicador por atendente e setor e abre fila de revisão com o trecho problemático |
| gatilho_frequência | Diária (ao encerrar cada conversa); painel semanal |
| porte_alcance | Todos os clientes atendidos por canal escrito |
| quem_faz | Coordenador de atendimento / sócio |
| base_legal | LGPD (Lei 13.709/2018), art. 7º, IX, e art. 20 (revisão de decisão automatizada) quando o resultado afetar avaliação do funcionário; validar na Etapa 2 |
| risco_se_falhar | Perda de cliente por atendimento ruim não percebido; avaliação injusta de funcionário se a IA errar |
| concorrentes | Acessórias Komunic Gestão (6 critérios configuráveis, fila de revisão, indicadores por colaborador) [S7]; HubStrom "nível de satisfação geral com IA" e revisão de tom [S8][S9]; Domínio Messenger "análise" do atendimento (escopo não detalhado) [S4] |
| hipótese_automação | Classificador LLM por conversa com rubrica do escritório; amostra para calibração humana; resultado só como apoio, nunca nota automática de desempenho |
| papel_da_ia | M2 ler (conversas, histórico do cliente); rascunhar (resumo do problema e sugestão de resposta corretiva) |
| ferramentas_agênticas | `avaliar_atendimento(conversa_id)`, `fila_revisao_atendimento(setor)`, `indicadores_atendimento(periodo, pessoa)` |
| eventos_timesheet | `ges.atendimento.avaliar` (IA), `ges.atendimento.revisar` (setor ATD) |
| não_confundir_com | GES-062 (governança das respostas da IA), GES-038 (NPS pedido ao cliente), GES-034 (alerta de cliente sem resposta) |
| nível_automação | Próprio |
| preço | Custo de LLM por conversa `[PREÇO NÃO PÚBLICO]` dos concorrentes |
| confiança | alta (funcionalidade lida na página do fornecedor) |
| fontes | [S7], [S8], [S9] (06/11/2026) |

### GES-202 · Expor os dados e as ações do escritório a IAs externas por MCP

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Gestão e Atendimento / Integração com IA |
| etapa | Manutenção |
| atividade | Oferecer e governar um servidor MCP para que sócios, equipe e, opcionalmente, clientes consultem e executem ações da plataforma pelo ChatGPT, Claude, Gemini ou outra IA compatível |
| descrição | Hoje o sócio abre o sistema e filtra telas para saber "o que venceu na semana" ou "como foi o atendimento". Concorrentes já respondem isso dentro da IA que o usuário prefere. A plataforma publica um MCP com escopos (leitura, ação com aprovação), token por usuário, registro de cada chamada e revogação |
| gatilho_frequência | Diária (uso), por evento (concessão e revogação de acesso) |
| porte_alcance | Escritório inteiro; clientes que quiserem |
| quem_faz | Sócio / TI do escritório |
| base_legal | LGPD (compartilhamento com operador estrangeiro; art. 33 transferência internacional); termos de uso da IA externa |
| risco_se_falhar | Vazamento de dados de clientes para a IA de terceiro; ação executada sem aprovação |
| concorrentes | Acessórias MCP (beta; mesma API e token do escritório; empresas, contatos, setores, entregas, processos e solicitações) [S5]; Nibo MCP Contador (consulta e ação: abrir processo, reagendar tarefa, relatório de atendimento; "também aos seus clientes") [S6]; e-Kontroll e-API (dados, sem MCP) [S22] |
| hipótese_automação | MCP oficial sobre as mesmas ferramentas agênticas do chat único; ações de M4 sempre com cartão de aprovação na plataforma |
| papel_da_ia | M1, M2, M3 ler; M4 executar com aprovação |
| ferramentas_agênticas | `mcp_conceder_acesso(usuario, escopos)`, `mcp_revogar(token)`, `mcp_log(usuario, periodo)` |
| eventos_timesheet | `ges.mcp.chamada` (usuário, ferramenta, cliente) |
| não_confundir_com | GES-021 (acessos da equipe), GES-041 (acessos do cliente no portal) |
| nível_automação | Próprio |
| preço | Sem custo de terceiro na plataforma; o usuário paga a própria IA |
| confiança | alta |
| fontes | [S5], [S6] (06/11/2026) |

### GES-203 · Preservar e auditar o histórico integral das conversas, inclusive mensagens apagadas ou editadas

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Gestão e Atendimento / Registro e supervisão |
| etapa | Manutenção |
| atividade | Guardar a versão original de toda mensagem (texto, áudio, imagem, vídeo) trocada no número oficial, mostrar ao administrador o que foi apagado ou editado por atendente ou cliente, e registrar quem viu |
| descrição | Hoje, no WhatsApp do celular, a mensagem apagada some, e "eu nunca disse isso" vira discussão. Concorrentes vendem a auditoria de excluídas como recurso de administrador |
| gatilho_frequência | Contínua; consulta por evento (reclamação, disputa) |
| porte_alcance | Todos os clientes atendidos pelo número oficial |
| quem_faz | Sócio / administrador |
| base_legal | LGPD art. 6º (transparência, necessidade), art. 37 (registro das operações); política de uso da WhatsApp Business Platform `[NÃO VERIFICADO]` |
| risco_se_falhar | Perda de prova (GES-036); ou, no excesso, tratamento sem transparência para o titular |
| concorrentes | HubStrom ConnectHub ("o administrador vê tudo, mesmo o que foi excluído da conversa"; "auditoria de mensagens modificadas" nos dois planos) [S9][S8]; Makro Whats ("histórico das conversas inclusive as mensagens apagadas") [S27] |
| hipótese_automação | Armazenar o evento original e o de exclusão/edição (quando a API entregar); aviso no canal e na política de privacidade; acesso só a perfis autorizados, com log |
| papel_da_ia | M2 ler (busca no histórico para responder disputas) |
| ferramentas_agênticas | `historico_conversa(cliente, incluir_apagadas=true)`, `log_acesso_historico(conversa_id)` |
| eventos_timesheet | `ges.historico.consultar` (setor GES) |
| não_confundir_com | GES-036 (guardar o "pode transmitir" como prova), GES-031 (opt-in) |
| nível_automação | Próprio (depende do que a API do WhatsApp entrega sobre edição/exclusão: verificar na Etapa 2) |
| confiança | média (recurso lido no fornecedor; viabilidade na API oficial não verificada) |
| fontes | [S8], [S9], [S27] (06/11/2026) |

### GES-204 · Publicar e manter o app do cliente com a marca do escritório nas lojas

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Gestão e Atendimento / App do cliente |
| etapa | Entrada (publicação), Manutenção |
| atividade | Configurar logo, nome e cor do escritório, publicar o app na Google Play e na App Store em nome do escritório (ou do fornecedor), manter versões e divulgar aos clientes |
| descrição | O escritório que quer app próprio contrata o fornecedor, entrega identidade visual, decide em nome de quem o app sai nas lojas e acompanha atualizações. Concorrentes vendem o app white label como adicional mensal |
| gatilho_frequência | Por evento (implantação, troca de marca); eventual (novas versões) |
| porte_alcance | Escritórios que querem marca própria |
| quem_faz | Sócio / marketing |
| base_legal | Termos das lojas de aplicativos (conta de desenvolvedor) `[NÃO VERIFICADO]` |
| risco_se_falhar | App reprovado ou retirado da loja; cliente confuso com marca de terceiro |
| concorrentes | HubStrom AppHub (logo, nome, cor; adicional R$ 300/mês ou AppHub+ R$ 9,90/cliente/mês) [S8][S9]; Acessórias App + Área VIP [S13]; Nibo MeuApp [S6]; Omie G-Click Visão do Cliente [S14] |
| hipótese_automação | App único da plataforma com tema por escritório (PWA + app nas lojas); publicação em lote pela conta do fornecedor, com opção de conta do escritório |
| papel_da_ia | Nenhum relevante |
| ferramentas_agênticas | `configurar_marca_app(escritorio, logo, cor)`, `status_publicacao_app()` |
| eventos_timesheet | `ges.app.publicar` |
| não_confundir_com | GES-039 (conteúdo do portal), GES-041 (quem vê o quê), GES-104 (ativar cada cliente no app) |
| nível_automação | Próprio |
| preço | Referência de mercado: R$ 300/mês (HubStrom) |
| confiança | alta |
| fontes | [S8], [S9], [S13], [S6], [S14] (06/11/2026) |

### GES-205 · Gerir as receitas de parceria do escritório (ERP, conta digital, benefícios, cobrança e certificados revendidos)

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Gestão e Atendimento / Receitas de parceria |
| etapa | Entrada (oferta ao cliente novo), Manutenção |
| atividade | Oferecer aos clientes produtos de parceiros (licença de ERP, conta PJ, vale-refeição/alimentação, cobrança, certificado), registrar adesões, conferir comissões e descontos recebidos e declarar o conflito de interesse ao cliente |
| descrição | Escritórios revendem licenças do ERP com desconto e cobram do cliente, ou indicam conta PJ e benefícios em troca de vantagens. Hoje o controle fica em planilha e no portal de cada parceiro, sem bater comissão prometida com recebida |
| gatilho_frequência | Mensal (conferência); por evento (adesão, cancelamento) |
| porte_alcance | Clientes que usam ERP, folha com benefícios, conta PJ |
| quem_faz | Sócio / financeiro |
| base_legal | Código de Ética do contador (NBC PG 01) sobre independência e conflito de interesse `[NÃO VERIFICADO]`; tributação da receita de comissão (NFS-e do escritório, GES-007) |
| risco_se_falhar | Comissão não recebida; perda de confiança se o cliente descobrir conflito não declarado |
| concorrentes | Conta Azul Mais (gratuita para o contador; licenças com desconto até 85%; Pro R$ 199,90, Pro BPO R$ 129,90 no nível Bronze; cobrança consolidada no CNPJ do escritório; mínimo 3 licenças) [S16]; Domínio Benefícios com VR ("quanto mais seus clientes usam, mais o seu escritório ganha") e Domínio Conta Digital [S15][S17]; Omie Decola CNPJ (conta PJ e certificado para cliente novo) [S18] |
| hipótese_automação | Cadastro de parceiros e regras de comissão; adesões por cliente; conciliação da comissão recebida (GES-003); aviso de conflito no contrato |
| papel_da_ia | M2 ler (adesões, extratos de comissão); M3 (comissão esperada); rascunhar (oferta ao cliente) |
| ferramentas_agênticas | `registrar_adesao_parceiro(cliente, parceiro, produto)`, `conferir_comissoes(parceiro, competencia)` |
| eventos_timesheet | `ges.parceria.adesao`, `ges.parceria.conferir` (setor FIN) |
| não_confundir_com | GES-012 (comissão paga a quem indica o escritório), GES-010 (custos de serviços pagos consumidos por cliente) |
| nível_automação | B (portais e APIs dos parceiros; conferir quais têm API na Etapa 2) |
| confiança | alta (ofertas lidas nos fornecedores) / baixa (base ética) |
| fontes | [S15], [S16], [S17], [S18] (06/11/2026) |

### GES-206 · Modelar os processos do escritório com etapas, gatilhos e critério de conclusão, inclusive por IA a partir de descrição

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Gestão e Atendimento / Processos e tarefas |
| etapa | Entrada (implantação do escritório na plataforma), Manutenção |
| atividade | Criar e manter os modelos de processo (fechamento mensal, admissão, alteração contratual, IRPF, abertura) com etapas em cascata, responsável, prazo interno, dependências, formulário de pedido e evento que conclui cada etapa sozinho |
| descrição | Hoje o gestor monta processos à mão no gerenciador de tarefas ou em planilha, e a baixa depende de alguém lembrar de marcar. Concorrentes oferecem modelos prontos, cascata, Kanban e baixa automática quando a guia é entregue ou o documento chega; a HubStrom cria o processo a partir de uma descrição em texto |
| gatilho_frequência | Por evento (novo tipo de serviço, mudança de lei); revisão eventual |
| porte_alcance | Todos os setores |
| quem_faz | Coordenadores / sócio |
| base_legal | — |
| risco_se_falhar | Etapa esquecida, prazo perdido, operação que para quando uma pessoa sai |
| concorrentes | HubStrom TaskHub (cascata, modelos, Gemini cria o processo, formulário do cliente vira tarefa, tarefa conclui quando a guia é entregue) [S9]; Domínio Processos (baixa automática de tarefas e obrigações) [S3]; Alterdata eTarefas (fases com responsável e método de conclusão; conclusão quando o cliente envia o documento; vínculo automático por regime) [S26]; Omie G-Click (cascata, Kanban, gatilhos, tarefas recorrentes) [S14]; Questor Tareffa (processo modelo de cobrança de arquivos) [S32] |
| hipótese_automação | Biblioteca de modelos; LLM gera o rascunho do processo a partir de texto; cada etapa com "critério de conclusão" ligado a eventos da plataforma (guia lida, recibo anexado, documento recebido, evento do core) |
| papel_da_ia | M2 ler (modelos e histórico de execução); rascunhar (processo novo); sugerir ajuste de prazos pelo tempo medido |
| ferramentas_agênticas | `criar_modelo_processo(descricao)`, `definir_criterio_conclusao(etapa, evento)`, `instanciar_processo(modelo, cliente)` |
| eventos_timesheet | `ges.processo.modelar`, `ges.tarefa.concluir_auto` |
| não_confundir_com | FIS-001 (lista mensal de obrigações), CTB-024 (etapas do fechamento contábil), GES-020 (manual do escritório) |
| nível_automação | Próprio |
| confiança | alta |
| fontes | [S3], [S9], [S14], [S26], [S32] (06/11/2026) |

### GES-207 · Gerar o raio-X fiscal do prospect só com o CNPJ, antes da proposta

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Gestão e Atendimento / Comercial (Entrada) |
| etapa | Entrada |
| atividade | Consultar, sem certificado nem procuração, as fontes públicas do CNPJ do prospect (cartão CNPJ, Simples/SIMEI, certidões federal, FGTS e trabalhista, dívida ativa, inscrições estaduais) e entregar um diagnóstico com nota e pontos de atenção para a reunião de venda |
| descrição | Hoje o comercial chega à primeira reunião sem saber a situação da empresa; o levantamento completo só acontece depois do contrato (SOC-022). Concorrente vende a "Pré-Análise" como gancho comercial e insumo de preço |
| gatilho_frequência | Por evento (lead qualificado) |
| porte_alcance | Prospects PJ |
| quem_faz | Comercial / sócio |
| base_legal | Certidões e dados cadastrais de acesso público (RFB/PGFN, CAIXA, TST); LGPD para dados de sócios pessoas físicas `[NÃO VERIFICADO]` |
| risco_se_falhar | Proposta subprecificada para cliente com passivo; aceitação de cliente de risco |
| concorrentes | VERI Raio-X Fiscal: Pré-Análise sem certificado, exportação em Excel/PDF/CSV, Health Score Fiscal 0–100, leitura da IA VERA [S11]; e-Kontroll "apoio à precificação de novos leads" [S22] |
| hipótese_automação | Consulta às fontes públicas (algumas com CAPTCHA), nota de risco e rascunho de pauta da reunião; alimenta GES-101 e GES-102 |
| papel_da_ia | M1 ler (o que cada pendência significa); M3 (nota de risco); rascunhar (resumo para a reunião) |
| ferramentas_agênticas | `pre_analise_cnpj(cnpj)`, `nota_risco_prospect(cnpj)` |
| eventos_timesheet | `ges.comercial.pre_analise` (setor COM) |
| não_confundir_com | GES-101 (decisão de aceitação), SOC-022 (pendências herdadas, com procuração, após contratar), SOC-003 (vigilância cadastral de cliente) |
| nível_automação | C-captcha (certidões com CAPTCHA) / A para dados abertos do CNPJ; verificar na Etapa 2 |
| confiança | alta (funcionalidade do concorrente) |
| fontes | [S11], [S22] (06/11/2026) |

### GES-208 · Prospectar empresas recém-abertas e leads de programas de parceiros

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Gestão e Atendimento / Comercial (CRM) |
| etapa | Entrada |
| atividade | Receber oportunidades de programas de fornecedores e montar listas de empresas recém-abertas na região e nos nichos do escritório, a partir de dados abertos, para abordagem comercial |
| descrição | Escritórios compram listas ou dependem de indicação. Fornecedores passaram a oferecer geração de oportunidades integrada ao CRM como benefício ao contador |
| gatilho_frequência | Semanal / mensal |
| porte_alcance | Escritórios em fase de crescimento |
| quem_faz | Comercial / sócio |
| base_legal | Dados abertos do CNPJ publicados pela RFB `[NÃO VERIFICADO nesta rodada]`; LGPD (legítimo interesse para B2B, oposição) e regras anti-spam do WhatsApp |
| risco_se_falhar | Abordagem que viola LGPD ou bloqueia o número do WhatsApp por denúncia |
| concorrentes | Omie Decola CNPJ ("geração de oportunidades integrada ao CRM da Omie") e Omie Dia Zero (novos CNPJs) [S18]; Conta Azul Programa de Parceria ("geração de negócios", diretório "Encontre um Contador") [S16] |
| hipótese_automação | Filtro de CNPJs novos por CNAE e município; enriquecimento; entrada no funil do GES-042; mensagem inicial só por e-mail ou canal com base legal |
| papel_da_ia | M2 ler; rascunhar (abordagem por nicho) |
| ferramentas_agênticas | `listar_cnpjs_novos(municipios, cnaes, periodo)`, `criar_lead(cnpj, origem)` |
| eventos_timesheet | `ges.comercial.prospectar` (setor COM) |
| não_confundir_com | GES-042 (registro e funil de prospects), GES-032 (Instagram) |
| nível_automação | A (dados abertos) — confirmar formato e periodicidade na Etapa 2 |
| confiança | baixa (fonte de dados não verificada nesta rodada; oferta do concorrente sem detalhe) |
| fontes | [S16], [S18] (06/11/2026) |

### FIS-201 · Deixar o cliente recalcular sozinho a guia vencida (DAS, DARF, parcelamento) no app

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Fiscal e Obrigações / Guias |
| etapa | Manutenção |
| atividade | Permitir que o cliente, no app, atualize a guia vencida com multa e juros e baixe a nova, sem abrir chamado, com registro do pedido e aviso ao escritório |
| descrição | Hoje o cliente avisa que perdeu o vencimento, o analista entra no PGDAS-D, no Sicalc ou no portal do parcelamento, gera a guia nova e reenvia. É das demandas mais repetidas do atendimento |
| gatilho_frequência | Por evento (guia vencida); pico após cada vencimento |
| porte_alcance | Todos com guias federais; estaduais e municipais conforme o portal |
| quem_faz | Hoje: analista fiscal / atendimento. Depois: o próprio cliente |
| base_legal | Lei 9.430/1996, art. 61 (multa de mora e juros Selic sobre tributos federais) `[NÃO VERIFICADO nesta rodada]` |
| risco_se_falhar | Cliente paga guia vencida (rejeitada) ou valor errado; atendimento sobrecarregado |
| concorrentes | HubStrom AppHub ("recálculo de guia na palma da mão"; até 4 ou 10 atualizações por cliente por plano) [S9][S8]; Nibo ("recálculo de DAS e DARF" pelo cliente) [S6]; VERI ("DAS e DARF: comprovantes e recálculo automático") [S11]; Alterdata Central de Agentes ("recalculam guias") [S10] |
| hipótese_automação | Recalcular pela API oficial (Integra Contador para DAS e DARF; portais estaduais para guias estaduais) com limite por cliente; cálculo M3 conferido antes de liberar |
| papel_da_ia | M3 calcular; M4 executar (gerar guia) em categoria liberada pelo escritório |
| ferramentas_agênticas | `recalcular_guia(guia_id, nova_data)`, `limite_recalculos(cliente)` |
| eventos_timesheet | `fis.guia.recalcular` (cliente ou IA; setor FIS) |
| não_confundir_com | FIS-032 (verificar pagamento e cobrar), FIS-031 (receber e distribuir guias), FIS-010 (gerar o DAS do mês) |
| nível_automação | A$ (Integra Contador, serviços de DAS e de cálculo de DARF: confirmar nomes e preço na Etapa 2) |
| confiança | alta (concorrentes) / média (integração) |
| fontes | [S6], [S8], [S9], [S10], [S11] (06/11/2026) |

### NFE-201 · Dar ao cliente um emissor de NFS-e/NF-e no app, pré-configurado pelo escritório

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Notas fiscais / Emissão pelo cliente |
| etapa | Entrada (configuração), Manutenção |
| atividade | Cadastrar para o cliente os serviços, tomadores e a tributação correta (incl. IBS/CBS) e liberar a emissão de NFS-e (e NF-e simples) pelo próprio app do escritório, com a nota já entrando na apuração |
| descrição | Hoje o cliente pequeno emite no portal da prefeitura ou no Emissor Nacional com erros de código de serviço e retenção, ou pede ao escritório para emitir (NFE-039). Concorrentes colocam o emissor dentro do ecossistema do escritório |
| gatilho_frequência | Diária (emissão pelo cliente); por evento (configuração) |
| porte_alcance | Prestadores de serviço, MEI, profissionais liberais; pequenos comércios |
| quem_faz | Cliente emite; analista fiscal configura e confere |
| base_legal | LC 214/2025 e NFS-e padrão nacional `[NÃO VERIFICADO nesta rodada]` |
| risco_se_falhar | Nota com tributação errada, retenção não destacada, município errado |
| concorrentes | HubStrom AppHub (cadastra serviços e tomadores para emissão de NFS-e) [S9]; Nibo Emissor (NFS-e em 2 mil+ municípios, "adequada à reforma") [S6]; SIEG Emissão Fiscal ilimitada para os clientes [S12]; Conta Azul (emissão no ERP do cliente) [S28] |
| hipótese_automação | Emissão via API do Emissor Nacional ou de fornecedor de emissão; regras fiscais travadas pelo escritório; conferência automática da nota emitida (NFE-027) |
| papel_da_ia | M1 ler (código de serviço, retenções); M3 calcular; M4 executar (emitir) a pedido do cliente |
| ferramentas_agênticas | `configurar_emissor(cliente, servicos, tomadores)`, `emitir_nfse(cliente, dados)` |
| eventos_timesheet | `nfe.emissor.configurar` (setor FIS), `nfe.nfse.emitir_cliente` |
| não_confundir_com | NFE-039 (escritório emite em nome do cliente), GES-007 (NFS-e do próprio escritório), NFE-031 (orientar o padrão nacional) |
| nível_automação | B (fornecedor de emissão) ou A (API do Emissor Nacional, a confirmar na Etapa 2) |
| confiança | alta (concorrentes) |
| fontes | [S6], [S9], [S12], [S28] (06/11/2026) |

### SOC-201 · Emitir o certificado digital A1 do cliente pelo próprio escritório

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Clientes e Societário / Certificados |
| etapa | Entrada, Manutenção (renovação) |
| atividade | Vender e conduzir a emissão do e-CNPJ/e-CPF A1 do cliente como ponto parceiro de uma autoridade certificadora (pagamento, validação por videoconferência, instalação no cofre) e receber a margem |
| descrição | Hoje o escritório manda o cliente a uma certificadora e espera o arquivo; o certificado vence, a captura de notas para e a renovação vira chamado. Fornecedores de core passaram a oferecer a jornada completa dentro do sistema, como receita para o escritório |
| gatilho_frequência | Por evento (cliente novo, vencimento) |
| porte_alcance | Todos os clientes PJ; sócios PF quando precisarem |
| quem_faz | Atendimento / societário |
| base_legal | MP 2.200-2/2001 (ICP-Brasil) e normas do ITI sobre validação por videoconferência `[NÃO VERIFICADO nesta rodada]` |
| risco_se_falhar | Certificado vencido trava captura, procurações e transmissões (FIS-046, NFE-003) |
| concorrentes | Domínio Certificados Digitais ("organize, centralize e rentabilize"; "toda a jornada dos certificados") e post "Emitir certificado digital A1 no escritório: acesso, pagamento, videoconferência" [S24]; Omie Decola CNPJ (certificado incluso para o cliente novo) [S18]; Acessórias AC Certifica (gestão) [S13] |
| hipótese_automação | Parceria com AC; link de compra e agendamento enviado pela régua de vencimento (SOC-009); certificado novo cai direto no cofre (SOC-008) |
| papel_da_ia | M2 ler (vencimentos); M4 executar (enviar link e agendar) com aprovação |
| ferramentas_agênticas | `oferecer_certificado(cliente, tipo)`, `status_emissao_certificado(pedido)` |
| eventos_timesheet | `soc.certificado.emitir` (setor SOC) |
| não_confundir_com | SOC-008 (guardar), SOC-009 (avisar vencimento), GES-058 (certificados do próprio escritório) |
| nível_automação | D-assistido (a validação é feita pelo agente de registro com o titular) |
| confiança | média (oferta lida; regras da ICP-Brasil não verificadas) |
| fontes | [S24], [S18], [S13] (06/11/2026) |

### FIN-201 · Executar o BPO financeiro do cliente (pagar, receber, cobrar e conciliar)

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | BPO financeiro / Operação |
| etapa | Entrada (implantação), Manutenção |
| atividade | Operar contas a pagar e receber do cliente: agendar pagamentos em lote com aprovação do cliente, emitir cobranças e notas, conciliar pelo Open Finance e entregar fluxo de caixa e relatórios |
| descrição | Serviço que os escritórios vêm vendendo como linha extra: um analista acessa banco e ERP do cliente, lança, paga e concilia. Ferramentas prometem um profissional para ~80 clientes |
| gatilho_frequência | Diária (pagamentos e baixas), semanal e mensal (relatórios) |
| porte_alcance | Pequenas e médias empresas sem financeiro próprio |
| quem_faz | Analista de BPO financeiro |
| base_legal | Contrato de prestação de serviços com alçadas; Resolução Conjunta BCB/CMN do Open Finance (consentimento) `[NÃO VERIFICADO nesta rodada]` |
| risco_se_falhar | Pagamento errado ou em duplicidade com dinheiro do cliente; responsabilidade civil do escritório |
| concorrentes | Conta Azul Pro BPO (R$ 129,90/mês no nível Bronze) [S16]; Nibo BPO Financeiro e WhatsApp no Nibo BPO [S6]; Contbank BPO Suite (pagamentos em lote, Open Finance, IA; "um profissional pode atender cerca de 80 clientes") [S36]; Alterdata (menu BPO Financeiro) [S10] |
| hipótese_automação | Dados do Open Finance (CTB-010), contas a pagar a partir das notas de entrada e boletos (DDA), aprovação do cliente no app antes de cada lote; integração com ERP do cliente |
| papel_da_ia | M2 ler (extratos, notas, boletos); M3 (previsão de caixa); M4 executar (agendar pagamento) só com aprovação do cliente |
| ferramentas_agênticas | `montar_lote_pagamentos(cliente, data)`, `pedir_aprovacao_lote(cliente, lote)`, `conciliar_open_finance(cliente)` |
| eventos_timesheet | `fin.bpo.pagar`, `fin.bpo.conciliar` (setor FIN) |
| não_confundir_com | CTB-007 (importar o financeiro do ERP do cliente para a contabilidade), CTB-015 (classificar extrato), GES-001 a GES-005 (financeiro do próprio escritório) |
| nível_automação | B (agregador Open Finance e banco com API de pagamento) |
| confiança | alta (ofertas lidas) |
| fontes | [S6], [S10], [S16], [S36] (06/11/2026) |

### DP-201 · Resumir com IA cada convenção coletiva nova e transformar as cláusulas em parâmetros e tarefas

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / Convenções |
| etapa | Manutenção |
| atividade | Ao detectar instrumento coletivo novo, ler o texto, produzir resumo estruturado (piso, reajuste, data-base, adicionais, benefícios, contribuições, regras de jornada e feriado) e abrir a tarefa de parametrização no core para os clientes afetados |
| descrição | Hoje o analista de DP lê dezenas de páginas por sindicato e copia à mão para o core. DP-034 cobre detectar o registro; falta a leitura e a conversão em parâmetros, que concorrentes já fazem com IA |
| gatilho_frequência | Por evento (CCT/ACT registrado), concentrado nas datas-base |
| porte_alcance | Clientes com empregados |
| quem_faz | Analista de DP |
| base_legal | CLT, arts. 611 a 625 (convenções e acordos coletivos) `[NÃO VERIFICADO nesta rodada]` |
| risco_se_falhar | Folha com piso ou adicional desatualizado, diferenças retroativas e passivo trabalhista |
| concorrentes | Alterdata eSindical ("resumo completo com inteligência artificial", alertas por e-mail e WhatsApp; exclusivo eContador Master) e agente "Monitor de Instrumentos Coletivos" que gera a tarefa [S10]; Makro Gi ("resumo das convenções coletivas") [S19][S27]; Domínio Busca Convenções (módulo; escopo não lido) [S24] |
| hipótese_automação | Texto do instrumento (Mediador/MTE) → extração por LLM em esquema fixo → conferência humana → tarefa por cliente afetado |
| papel_da_ia | M1 ler e rascunhar (resumo e parâmetros); M2 (clientes afetados); M3 (diferença retroativa, com DP-035) |
| ferramentas_agênticas | `resumir_cct(instrumento_id)`, `clientes_afetados_cct(instrumento_id)`, `abrir_tarefa_parametrizacao(cliente, cct)` |
| eventos_timesheet | `dp.cct.resumir` (IA), `dp.cct.parametrizar` (setor DP) |
| não_confundir_com | DP-033 (definir o sindicato), DP-034 (detectar o registro), DP-035 (aplicar pisos e retroativos), DP-036 (contribuição assistencial) |
| nível_automação | Próprio (sobre o texto obtido; a fonte do texto é questão da ficha DP-034) |
| confiança | alta (concorrentes) |
| fontes | [S10], [S19], [S27], [S24] (06/11/2026) |

---

## 6. Fontes (consultadas em 06/11/2026)

- [S1] Thomson Reuters, "Thomson Reuters anuncia aquisição de Gestta", 26/04/2022: https://www.thomsonreuters.com.br/pt/sala-de-imprensa/thomson-reuters-anuncia-aquisicao-de-gestta.html (versão em inglês: https://www.thomsonreuters.com/en/press-releases/2022/april/thomson-reuters-acquires-gestta)
- [S2] Thomson Reuters/Domínio, white paper "Gestta e Soluções Domínio apresentam o Gestta Processos" (sem data; cita Synergy 2020): https://images.engage.es-pt.thomsonreuters.com/Web/LALEYSAEIMPRESORA/%7Be40173fd-00db-4d29-a84a-2c10c7c668bf%7D_OUT-_513_-_WP__-_TR_-_Conhe%c3%a7a_o_GESTTA_(NOVO).pdf
- [S3] Domínio Processos: https://www.dominiosistemas.com.br/solucoes/dominio-processos
- [S4] Domínio Messenger: https://www.dominiosistemas.com.br/solucoes/dominio-messenger
- [S5] Acessórias MCP: https://acessorias.com/site/funcionalidade/acessorias-mcp/ ; lançamento (beta): https://acessorias.com/site/mcp-acessorias/
- [S6] Nibo para contadores: https://www.nibo.com.br/contador/ ; MCP: https://www.nibo.com.br/mcp-contador
- [S7] Acessórias Komunic: https://acessorias.com/site/funcionalidade/komunic/ ; post "Como a IA e o WhatsApp integrado transformam o atendimento", 29/10/2026: https://acessorias.com/site/ia-whatsapp-contabilidade/
- [S8] HubStrom, planos: https://hubstrom.com.br/planos (página exibia condição "Black" válida "até 30/10/2026", ainda no ar em 06/11/2026)
- [S9] HubStrom, módulos: https://hubstrom.com.br ; /monitorhub ; /connecthub ; /taskhub ; /apphub ; /drivehub
- [S10] Alterdata Central de Agentes: https://www.alterdata.com.br/contabil/central-de-agentes ; IA Contábil: https://www.alterdata.com.br/contabil/ia-contabil ; eSindical: https://www.alterdata.com.br/contabil/esindical ; menu: https://www.alterdata.com.br/contabil/
- [S11] VERI: https://www.veri.com.br ; Raio-X Fiscal: https://www.veri.com.br/solucoes/raio-x-fiscal
- [S12] SIEG: https://www.sieg.com
- [S13] Acessórias, home e funcionalidades: https://acessorias.com/site/ ; Automação de Entregas: https://acessorias.com/site/funcionalidade/automacao-de-entregas/ ; AC Notifica: https://acessorias.com/site/funcionalidade/ac-notifica/ ; Tela de Insights: https://acessorias.com/site/funcionalidade/tela-de-insights/
- [S14] Omie G-Click: https://www.omie.com.br/gclick/
- [S15] Domínio Conta Digital e Cobranças: https://www.dominiosistemas.com.br/servicos-financeiros/conta-digital
- [S16] Conta Azul para contadores (preços de licença, Programa de Parceria): https://contaazul.com/contadores/ ; https://contaazul.com/contabilidade/como-funciona
- [S17] Domínio Benefícios: https://www.dominiosistemas.com.br/servicos-financeiros/beneficios
- [S18] Omie Decola CNPJ: https://www.omie.com.br/decola-cnpj/ ; menu Omie para contadores: https://www.gclick.com.br
- [S19] Makro, planos: https://makrosystem.com.br/nossos-planos/ ; Gi: https://makrosystem.com.br/gi-gestora-inteligente/
- [S20] Portal ERP, "Vela LatAm anuncia aquisição da Projetus TI", 27/08/2025: https://portalerp.com/br/noticia/vela-latam-anuncia-aquisicao-da-projetus-ti
- [S21] Portal da Reforma Tributária, "Conta Azul adquire a Mister Contador", 27/07/2026: https://www.reformatributaria.com/negocios/conta-azul-adquire-a-mister-contador-e-passa-a-integrar-automacao-contabil-no-proprio-ecossistema/
- [S22] e-Kontroll: https://www.e-kontroll.com.br
- [S23] AmdJus (imprensa/promocional) sobre HubStrom: https://amdjus.com.br/hubstrom-revoluciona-a-contabilidade-com-seu-ecossistema-inteligente-integrado/ (só via resumo do buscador)
- [S24] Domínio, home e módulos (Certificados Digitais, Busca Convenções, Portal do Cliente): https://www.dominiosistemas.com.br ; https://www.dominiosistemas.com.br/certificados-digitais/ ; https://www.dominiosistemas.com.br/solucoes/evolucao-em-nuvem/portal-do-cliente ; post https://www.dominiosistemas.com.br/blog/emitir-certificado-digital-a1-escritorio-contabil/ (título lido no menu)
- [S25] Catálogo Domínio/ONVIO Messenger (só via resumo do buscador): https://images.engage.es-pt.thomsonreuters.com/Web/LALEYSAEIMPRESORA/%7b901db575-de82-49a6-a6d1-d725f50376f1%7d_Catalogo_Dominio___ONVIO_Messenger.pdf ; Central de Soluções Onvio: https://suporte.dominioatendimento.com/central/faces/central-solucoes-onvio.html
- [S26] Alterdata eTarefas: https://www.alterdata.com.br/contabil/etarefas
- [S27] Makro Whats: https://makrosystem.com.br/makro-whats/ ; Makro DSE: https://makrosystem.com.br/makro-dse/
- [S28] Conta Azul IA: https://contaazul.com/funcionalidades/conta-azul-ia/
- [S29] Conexa: https://conexa.app
- [S30] Jettax: https://www.jettax.com.br
- [S31] Questor Docs, "Guias Unificadas no Questor Cloud" (Zen, Quiu, Tareffa): https://docs.questor.com.br/pt-br/Produtos/Quiu_Cloud/guias_unificadas_cloud
- [S32] Questor Docs, Tareffa processo modelo de cobrança de arquivos (via resumo do buscador): https://docs.questor.com.br/pt-br/Produtos/Tareffa/gestao-processos/proc-modelo-cobranca
- [S33] Contmatic: https://www.contmatic.com.br
- [S34] Fórum Contábeis, "Calima ERP" (2017, via resumo do buscador): https://www.contabeis.com.br/forum/arquivo-morto/259252/calima-erp/
- [S35] Digisac, Agente Inteligente: https://digisac.com.br/ia/agente-inteligente
- [S36] Contbank BPO Suite: https://contbank.com

### Buscas feitas (13)

"melhores sistemas de gestão para escritório contábil 2026"; "Gestta adquirida Thomson Reuters aquisição"; "Hubstrom módulos plataforma contabilidade preços"; "Acessórias sistema contabilidade funcionalidades planos preço"; "Gestta 2026 Onvio Processos Domínio integração novidades IA"; "Domínio Processos Thomson Reuters ... Onvio Messenger"; "Conta Azul Mais contador ... IA plano"; "Calima ERP contábil ... preço"; "Contábil Nuvem sistema escritório contabilidade"; "Questor Tareffa ... Questor Zen app cliente IA"; "CRM WhatsApp para escritório de contabilidade multiatendimento 2026"; "startup agente de IA para escritórios contábeis Brasil 2026"; "software precificação honorários contábeis proposta comercial automática"; e leituras diretas dos sites listados acima.

### Lacunas para a Etapa 2

1. Preços não públicos (Acessórias, Domínio Processos/Messenger, Alterdata, Nibo, SIEG, VERI, Jettax, Digisac, Conexa): pedir proposta ou buscar em comparadores.
2. Confirmação oficial de que Domínio Processos é o Gestta renomeado e se o Gestta ainda é vendido avulso (gestta.com.br bloqueado nesta sessão).
3. API do WhatsApp: se entrega eventos de mensagem editada e apagada (GES-203).
4. Integra Contador: serviços e preço para recalcular DAS e DARF (FIS-201).
5. Dados abertos do CNPJ: formato, periodicidade e uso comercial à luz da LGPD (GES-208).
6. Regras do ITI/ICP-Brasil para ponto de atendimento de certificado em escritório (SOC-201).

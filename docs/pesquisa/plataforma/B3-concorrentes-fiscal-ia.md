# B3 · Concorrentes no Brasil: captura de documentos, auditoria fiscal e IA para contadores

- **Data:** 06/11/2026
- **Escopo:** captura de DF-e, auditoria de XML e SPED, recuperação de créditos, base legal com IA e "consultoria automática" a partir de XMLs. Pedido do usuário: não ficar só nos nomes da lista, olhar o mercado todo. Por isso entraram também Jettax, Domínio IA (Thomson Reuters), Kolossus Auditor (dentro do Domínio), é-Simples Auditoria, Busca.Legal, Systax, Avalara TaxDocs e e-Kontroll e-Consultoria.
- **Método:** conferi o inventário de 420 atividades antes de criar fichas. Já existem NFE-023/032 (conferência tributária e revisão de cadastro), FIS-004 (conferir declaração cruzando fontes), NFE-035 (core × XMLs), CON-033/034 (recuperação), CON-101/NFE-102 (diagnóstico de entrada), CTB-028 (relatórios gerenciais), FIS-033 (resumo do mês) e CON-002 (pesquisa com base citada). Só criei fichas para o que faltava: CON-301 a CON-304, FIS-301, FIS-302, NFE-301, NFE-302 e GES-301.
- **Como li as fontes:** páginas baixadas com curl em 06/11/2026 e texto extraído localmente. Quando a informação veio só do resumo do buscador ou da imprensa, a fonte está marcada assim. Texto de fornecedor é autodeclarado. Uma página continha texto parecido com instrução; foi tratado como dado e ignorado.

---

## 1. Matriz

Legenda de preço: **público** = lido na página do fornecedor em 06/11/2026.

| Fornecedor | Categoria | O que faz para o escritório | Como usa IA (o que está escrito) | Preço público | Fonte |
| --- | --- | --- | --- | --- | --- |
| **HubStrom** (ex-SimplesHub) | Gestão + captura | XMLHub: NF-e/NFC-e de 23 UFs pela Sefaz, NFS-e pelo Portal Nacional, CT-e; integra com Domínio e Alterdata; **painel por cliente** com totais de venda e compra, evolução mensal, principais fornecedores e clientes; **auditoria de NCM e CFOP sob demanda**; não manifesta ciência sem aprovação. MonitorHub (e-CAC, parcelamentos, FGTS Digital, DET), ConnectHub, TaskHub, DriveHub, AppHub | "IA para sua equipe responder" (ConnectHub), "URA IA", "Nível de satisfação geral com IA", "Criação de processo por IA" (Enterprise). **Não há texto público sobre IA que gere consultoria a partir dos XMLs** (ver 2.1) | **Professional a partir de R$ 527/mês; Enterprise a partir de R$ 957/mês**; app white label +R$ 300/mês (Professional); AppHub+ R$ 9,90 por cliente/mês; promoção de −30% por 12 meses até 30/10/2026 | [H1][H2][H3] |
| **SIEG** | Captura + cofre + pendências | Docs fiscais (XML com cofre de 15 anos, notas do passado), "análise avançada e categorização de itens e documentos", emissor, controle de pendências do e-CAC, IRPF, relatórios estratégicos; oferece "diagnóstico fiscal gratuito" para vender a si mesma | Fala em "relatórios inteligentes"; nenhum produto de IA nomeado foi encontrado (uma busca, sem resultado) | **Control a partir de R$ 223; Flow a partir de R$ 470; Essential a partir de R$ 800/mês**; A1 a R$ 49–69; Connect grátis para a empresa cliente | [S1][S2] |
| **Qive** (ex-Arquivei) | Captura → contas a pagar | Hoje se vende como plataforma de **contas a pagar** para empresas médias e grandes (pagamentos, fornecedores, documentos, reforma, inteligência de dados). Para escritórios: blog com "5 relatórios" a partir de NF-e (recebidas e emitidas, transportadas, NFS-e, corrigidas e canceladas) | Blog e marketing sobre IA na gestão financeira; nenhum recurso de IA nomeado para contador | `[PREÇO NÃO PÚBLICO]` | [Q1][Q2] |
| **e-Auditoria** | Auditoria SPED/XML + recuperação + Simples | Mais de 6.000 clientes e 200 mil empresas auditadas por mês (autodeclarado). e-Auditor: milhares de verificações e cruzamentos (EFD ICMS/IPI, EFD Contribuições, ECD e ECF contra DCTF, PER/DCOMP, PGDAS, DARF e XML). Corretor/Fluxo automático do SPED: mais de 100 regras nativas e uma "Fábrica de Regras" com vigência configurável; corrige, valida, assina e transmite **sem abrir o PVA**, e diz que 8 de cada 10 SPEDs saem prontos. e-Recuperador (DIFAL, ICMS-ST, PIS/COFINS, exclusão do ICMS, monofásicos). Motor do Simples. Classificação fiscal em lote com IBS/CBS e base legal. Simulador da reforma com 4 regimes até 2033 | **Laudo interpretativo por IA:** classifica os apontamentos por severidade, sugere a causa provável e escreve o laudo "para o relatório periódico do cliente da base, para a reunião de alinhamento fiscal e **para a proposta de um cliente novo**". "IA interpretadora de índices contábeis e financeiros" (blog de 03/10/2025, atualizado em 27/08/2026) | `[PREÇO NÃO PÚBLICO]` (Black November "até 51% de desconto", sem valor) | [E1][E2][E3][E4] |
| **Fiscal.io** (Fiscal Monitor) | Captura + conciliação | Download de entradas e de NF-e sem manifestação, saídas por UF, CT-e e MDF-e, banco aberto para BI, **validação do SPED Fiscal contra a base da Sefaz**, conciliação Sefaz × ERP × SPED, classificação automática de notas, exportação. Parceria com o Domínio | "IA fiscal: Cursor, Claude, ChatGPT, Gemini e Copilot sobre a base do Monitor" (agente e conexão de IAs externas à base) | **Gratuito R$ 0; Básico R$ 255/mês; Avançado R$ 479/mês; Enterprise sob medida** | [F1][F2] |
| **Jettax** | Captura + guias + auditoria | Captura de NF-e, CT-e, NFC-e e CF-e; NFS-e em mais de 2.000 municípios; "+24 etapas de auditoria por item"; DARE de ST e DIFAL; auditoria de NCM, PIS/COFINS e ST; e-CAC, DEC e DUC-SP; integração nativa com o Domínio | **Jettax IA:** por **MCP**, ChatGPT, Claude ou Gemini consultam as notas e os cadastros já capturados. Perguntas prontas ("quais clientes tiveram maior variação?", "o que mudou neste cliente nos 3 meses anteriores?", "quais notas não destacam IBS e CBS?") e saída em PDF, XLS ou página web. É a coisa mais parecida com "consultoria a partir dos XMLs" que encontrei com texto público | `[PREÇO NÃO PÚBLICO]` (contato comercial) | [J1][J2] |
| **Kolossus Auditor** (no ecossistema Domínio) | Auditoria XML/SPED | Mais de 60 auditorias e cruzamentos (ex.: SPED Fiscal × GIA-SP ou DIME-SC); audita NF-e, NFC-e e CF-e recebidas do Domínio Escrita Fiscal; auditoria de eventos do eSocial e da EFD-Reinf; **controle de estoque "na visão do Fisco"** (EFD + notas); consulta de regra tributária (também em lote); **monitora mudanças de regra numa base de produtos e notifica** | Não descreve IA; motor de regras | `[PREÇO NÃO PÚBLICO]` | [K1][K2] (central do Domínio); folheto de revenda (resumo do buscador) |
| **Domínio IA** (Thomson Reuters) | IA dentro do core | Apresentado no SYNERGY 2026: IA generativa integrada à Folha, Escrita Fiscal e Contabilidade; consulta relatórios, dados e documentos em linguagem natural; apoio à análise da reforma | IA generativa com o conteúdo da TR; o contador valida | `[PREÇO NÃO PÚBLICO]` | [T1] (imprensa, 16/10/2026) |
| **IOB** | Conteúdo + plataforma | Base com mais de 390 milhões de regras fiscais (27 UFs); captura e **validação tributária item a item antes da escrituração**, com diagnóstico de imposto pago a maior ou a menor, também retroativo; envio de SPEDs em lote com auditoria sem o PVA | Chat de legislação com IA e curadoria de especialistas; "IA da Reforma" | `[PREÇO NÃO PÚBLICO]` (site com bloqueio geográfico) | [I1] (Contábeis, 23/05/2024) |
| **Econet** | Conteúdo | Consultoria e conteúdo tributário por assinatura | **Lion**: IA generativa para dúvidas técnicas, para assinantes (maio de 2025) | `[PREÇO NÃO PÚBLICO]` (site bloqueou o acesso) | [EC1] (imprensa, resumo do buscador) |
| **Tributo Devido** | Recuperação + IA jurídica | **Ratio:** recuperação de PIS/COFINS, ICMS e IPI a partir do SPED, com diagnóstico em 48 h; modelo de **parceria comissionada**: o escritório indica, a TD executa e o escritório "participa do resultado". Autodeclara R$ 4,5 bilhões processados | **TAIS:** "205 agentes" de IA para direito tributário, treinada com +500 mil decisões e +14 mil orientações da RFB; consulta legislação, interpreta teses e **produz pareceres** para o time revisar e assinar | TAIS com **acesso gratuito para teste**; Ratio por êxito/parceria (`[PREÇO NÃO PÚBLICO]`) | [TD1][TD2][TD3] |
| **ROIT** | Accountech / reforma | Recuperação com "IA auditando linha a linha do SPED" contra uma base de 1,8 PB, com **benchmark setorial**; camadas C1 (recálculo 100% por IA), C2 e C3 (com +170 profissionais); "Divergência XML"; RAI (recolhimento pelo adquirente/split) e contratos B2B com "ROIT Code" | IA para recálculo e auditoria; benchmark com a base própria | `[PREÇO NÃO PÚBLICO]` | [R1] |
| **Dootax** | RPA fiscal (empresas) | GNRE/DARE/DUA, pagamento de tributos, certidões, caixa postal (DTE), conta corrente fiscal, Monitor CBS e IBS, RAD, apuração assistida, emissor, repositório de DF-e | Não descreve IA ("RPA fiscal") | `[PREÇO NÃO PÚBLICO]` | [D1] |
| **é-Simples Auditoria** | Simples / monofásico | Apuração e auditoria do Simples, classificação fiscal, recuperação de PIS/COFINS monofásico de 60 meses; o fluxo **gera a proposta e o contrato** para o escritório vender a recuperação ao cliente | "Classificação Fiscal Inteligente", "Apuração Inteligente" (sem detalhe) | 7 dias grátis com 3 auditorias por empresa; preço `[PREÇO NÃO PÚBLICO]` | [ES1] |
| **e-Kontroll** | BI sobre o Domínio | e-Painel, e-Contábil, **e-Consultoria** (análises de balanço, balancete, DRE, fiscal e folha para levar à reunião), e-Custos, e-Monitor; integra com o Acessórias | Não descreve IA generativa | `[PREÇO NÃO PÚBLICO]` (plano único + addons) | [EK1] |
| **Busca.Legal** | Regra tributária por IA | EvoBusca.Legal T2: assistente virtual tributário para tributar corretamente; distribuído pela Mastermaq a escritórios; ganhou o IBM Watson Build Award (Latin American Champion) | Assistente com IA | `[NÃO ENCONTRADO]` (o domínio buscalegal.com.br é outro site) | [BL1] (notícia sem data, resumo do buscador) |
| **Systax** | Base de regras / classificação | Base de regras fiscais federais e estaduais consumida por API pelo ERP; classificação de NCM a partir da descrição do produto, com especialistas | IA não confirmada | `[PREÇO NÃO PÚBLICO]` | [SY1] (notícias de 2021, resumo do buscador) |
| **Avalara TaxDocs Monitor 2.0** | Captura (empresas) | Recebimento de DF-e de Sefaz e de mais de 2.500 prefeituras, com integração ao ERP | — | `[PREÇO NÃO PÚBLICO]` | [AV1] (resumo do buscador) |
| Lysis, Fiscoplan, "Contador AI" | — | `[NÃO ENCONTRADO]`: uma busca para cada nome, sem produto identificável; os domínios .com.br não resolveram | — | — | buscas de 06/11/2026 |

**Leitura rápida:**

1. **Captura de XML virou commodity.** HubStrom, SIEG, Jettax, Fiscal.io (com plano grátis), Qive, Avalara e os próprios cores capturam. Os preços públicos vão de R$ 0 a R$ 957/mês.
2. **Auditoria por regras é madura e concentrada.** e-Auditoria, Kolossus, IOB e Jettax auditam item a item, cruzam SPED com XML e transmitem SPED em lote sem o PVA. Todas usam motor de regras proprietário com dezenas a centenas de milhões de regras. A IA entra **depois**, para explicar (laudo da e-Auditoria) ou para perguntar (Jettax IA, Domínio IA, Fiscal.io).
3. **A "consultoria a partir de XML" do mercado hoje tem duas formas:** (a) painel descritivo (HubStrom XMLHub, SIEG, e-Kontroll), com totais, evolução, top fornecedores e clientes; (b) IA externa ligada aos dados por MCP (Jettax IA, Fiscal.io). Em nenhuma das duas a IA cruza XML com documentos do cliente, base legal com vigência e dados de folha e contábeis dos cores.
4. **IA jurídica separada da operação.** TAIS, Lion (Econet), IOB, Busca.Legal e Domínio IA respondem dúvidas de legislação, mas fora do contexto do cliente (exceto o Domínio IA, que vê só os dados do próprio Domínio).

---

## 2. Achados detalhados

### 2.1 HubStrom: o que é de fato a "consultoria" a partir dos XMLs

O que a HubStrom publica, lido em 06/11/2026 [H1][H2][H3]:

- **Painel "Visão estratégica em tempo real"** do XMLHub: "Totais de venda e compra, evolução mensal, principais fornecedores e principais clientes, tudo gerado automaticamente a partir das notas capturadas".
- **Auditoria de NCM e CFOP sob demanda:** "Solicite a auditoria fiscal de qualquer cliente e descubra divergências nos códigos das notas". É um pedido avulso, não uma rotina.
- **Relatórios estratégicos** mensais, enviados por e-mail toda semana (Professional) ou todo dia (Enterprise). No app white label, o cliente vê "o histórico completo das notas fiscais" e "os relatórios mensais da empresa", e emite NFS-e.
- **IA declarada:** só no atendimento (respostas da equipe, URA IA, satisfação) e na criação de processos (Enterprise).

**Não encontrei** texto público da HubStrom sobre IA que leia os XMLs e escreva uma consultoria. Isso inclui o site, a página de planos, a página do XMLHub, a matéria de 27/11/2025 [H4] e uma busca. A "consultoria básica" que o fundador viu é, pelo que está publicado, o **painel do XMLHub mais a auditoria de NCM/CFOP**, entregues ao cliente pelo app. Se houver uma camada de IA, ela é recente ou só aparece em demonstração. **Pendência:** confirmar numa demo da HubStrom se existe texto gerado por IA e o que ele cobre (marcado `[NÃO VERIFICADO]`).

### 2.2 Quem entrega o mais parecido com consultoria automática

| Produto | Entrada | Saída | Limite |
| --- | --- | --- | --- |
| HubStrom XMLHub [H2] | XMLs capturados | Painel (vendas, compras, evolução, top 5) + auditoria NCM/CFOP sob pedido | Descritivo; sem base legal; sem dados de folha e contábeis |
| e-Auditoria e-Auditor [E2] | SPED + declarações + XML | Apontamentos + **laudo por IA** (severidade, causa provável), usado também em proposta para cliente novo | Precisa de SPED; foco em erro e crédito, não no negócio |
| Jettax IA [J2] | Notas + cadastro, via MCP | Respostas da IA do usuário em PDF, XLS ou web; perguntas prontas por carteira, cliente e exceção | A IA é do usuário (ChatGPT, Claude, Gemini); sem base legal própria nem vigência |
| e-Kontroll e-Consultoria [EK1] | Dados do Domínio | Análises de balanço, DRE, fiscal e folha para reunião | Só Domínio; sem IA generativa declarada |
| Domínio IA [T1] | Dados do Domínio | Consulta em linguagem natural a relatórios, dados e documentos | Preso ao core; não vê o que está fora dele |
| ROIT [R1] | SPED | Créditos + benchmark setorial | Serviço de recuperação, não relatório recorrente |

### 2.3 Outros achados

1. **MCP virou padrão de mercado em 2026.** Jettax IA [J2], Fiscal.io [F1] e, segundo B1, Acessórias, Conexa e Nibo expõem dados à IA do usuário. "Conversar com os dados" deixou de ser diferencial. O diferencial é o que a nossa IA sabe que a do usuário não sabe: norma com vigência, documento do cliente e cruzamento entre cores.
2. **Transmitir SPED sem PVA** é argumento de venda da e-Auditoria [E1] e da IOB [I1]. O mecanismo técnico (ReceitaNet ou outro) não aparece nas páginas: `[NÃO VERIFICADO]`.
3. **Recuperação tributária virou canal de receita para o escritório.** A Tributo Devido paga comissão [TD1], a é-Simples gera proposta e contrato [ES1] e o e-Recuperador entrega os insumos [E5]. Isso ganha força com o prazo de 31/12/2026 para créditos de PIS/COFINS na transição, que a TD usa no marketing [TD1]. O tema regulatório já está em CON-025.
4. **Regras por produto com monitoramento** (Kolossus [K1], e-Auditoria "monitora mudança de regra e avisa o que mudou na sua base" [E1]) são o caminho para o cClassTrib e o IBS/CBS por item.
5. **Estoque "na visão do Fisco"** (Kolossus [K1]): reconstruir o estoque a partir da EFD e das notas para comparar com o estoque interno. Não estava no inventário.
6. **Preços públicos** (06/11/2026): HubStrom R$ 527 e R$ 957; SIEG R$ 223, R$ 470 e R$ 800; Fiscal.io R$ 0, R$ 255 e R$ 479. Todos os outros vendem por proposta.

---

## 3. O que vale copiar

| Copiar de | O quê | Como entra na plataforma |
| --- | --- | --- |
| HubStrom XMLHub | Painel por cliente (vendas, compras, evolução, top fornecedores e clientes) visível **no app do cliente**; não manifestar ciência sem aprovação | Base do CON-302; NFE-014/016 já cobrem a manifestação |
| e-Auditoria | **Laudo por IA** sobre os apontamentos (severidade, causa provável, texto pronto) e o mesmo laudo reaproveitado **na proposta de cliente novo**; "Fábrica de Regras" com vigência, criada pelo contador e reaplicada nas competências seguintes | CON-301, CON-302, FIS-301 |
| Jettax IA | Biblioteca de **perguntas prontas** por objetivo (carteira, cliente, exceção) e exportação em PDF, XLS e web | Chat único (M2) com atalhos; GES-301 para quem quer usar IA externa |
| Kolossus | Estoque na visão do Fisco; vigilância de regra por produto com notificação | FIS-302, NFE-301 |
| é-Simples / Tributo Devido | Diagnóstico → proposta → contrato num fluxo só; parceria comissionada para quem não quer executar | CON-301, CON-304 |
| ROIT | Benchmark setorial de escolhas tributárias | CON-303, com a carteira do escritório (e, no futuro, com a base agregada da plataforma) |
| TAIS / Lion / IOB | Parecer com linguagem técnica e revisão humana; curadoria declarada | M1 com citação e vigência (CON-002 já existe) |

### 3.1 A nossa consultoria automática: mais completa que "XML → painel"

A comparação é com o que está publicado. O mercado faz **XML → painel** (HubStrom, SIEG), **SPED → apontamentos → laudo** (e-Auditoria) ou **dados → IA genérica do usuário** (Jettax, Fiscal.io). A nossa junta quatro fontes que nenhum concorrente encontrado junta:

1. **XMLs** (NF-e, NFC-e, CT-e, NFS-e de entrada e saída), já capturados em NFE-004 a NFE-009.
2. **Documentos do cliente** enviados pelo app e pelo WhatsApp: extratos, contratos, planilhas de estoque, relatórios do ERP, folha (GES-026, CTB-004). Com eles, a IA explica o que o XML não mostra: compra sem nota, receita fora do documento fiscal, contrato com cláusula de repasse de IBS/CBS.
3. **Base legal temporal (M1):** cada achado traz a norma **vigente na competência analisada** e o que muda depois. Exemplos: monofásico, ST e DIFAL em 2024–2026; IBS/CBS no teste de 2026; opção semestral do Simples "por fora". Nenhum concorrente lido declara vigência por achado. A e-Auditoria só declara vigência para as regras que o próprio escritório cria.
4. **Dados dos cores (M2):** folha (custo de pessoal, fator R), contabilidade (margem, caixa, pró-labore × lucros), apuração (carga efetiva), obrigações e pendências (e-CAC, certidões) e o timesheet do escritório (custo de atender o cliente).

**O que sai:** um relatório mensal ou trimestral (CON-302) e um diagnóstico de prospect (CON-301), com:

- painel descritivo (como o da HubStrom);
- apontamentos de risco e de crédito com valor, período e norma vigente (como o da e-Auditoria, sem depender do SPED quando há XML);
- leitura de negócio: concentração de clientes e fornecedores, sazonalidade, margem aparente por produto quando há custo, efeito da reforma no preço (CON-019);
- **ações com dono**: cada achado vira tarefa (M4), pergunta ao cliente ou proposta de serviço avulso (CON-007), e o tempo vai para o timesheet;
- benchmark com pares da carteira (CON-303), anonimizado.

**Proteções:** a IA cita fonte e vigência; o contador aprova antes de enviar; os achados de "crédito" saem como indício até a conferência (CON-034). A regra de GES-062 vale para o que a IA pode mandar sozinha.

---

## 4. Fichas novas

### CON-301 · Gerar o diagnóstico automático de um prospect a partir de XMLs, SPED e PGDAS autorizados, com laudo e proposta

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Consultoria e Reforma / Comercial (pré-venda) |
| etapa | Entrada |
| atividade | Gerar, antes do contrato, um diagnóstico fiscal do prospect (riscos, créditos, regime, carga efetiva) com laudo em linguagem de empresário e proposta de honorários e serviços |
| descrição | Hoje o sócio pede ao prospect alguns XMLs ou o PGDAS, olha por amostragem e monta a proposta no feeling. CON-101 é o diagnóstico depois do contrato; SOC-015 calcula o honorário. Esta ficha é a **ferramenta de venda**: o prospect autoriza (envia XMLs e SPED pelo link ou o certificado para captura temporária), a plataforma audita, a IA escreve o laudo e a proposta sai pronta para aprovação |
| gatilho_frequência | Por evento (cada prospect qualificado no CRM, GES-042) |
| quem_faz | Sócio / comercial; analista fiscal revisa |
| base_legal | Sigilo e uso autorizado dos dados: NBC PG 01 (Código de Ética) `[NÃO VERIFICADO artigo]`; LGPD (Lei 13.709/2018) para os dados pessoais de sócios contidos nos documentos |
| concorrentes | e-Auditoria: laudo por IA "para a proposta de um cliente novo" [E2]; é-Simples: diagnóstico de monofásico que gera proposta e contrato [ES1]; Tributo Devido: diagnóstico em 48 h [TD1]; SIEG: "diagnóstico fiscal gratuito" só para vender a própria SIEG [S1] |
| papel_da_ia | M2 ler XMLs, SPED e PGDAS; M1 aplicar a norma vigente em cada competência; M3 recalcular carga, monofásico, ST e fator R; M4 rascunhar laudo, proposta e contrato (envio após aprovação) |
| ferramentas_agênticas | `abrir_diagnostico_prospect(prospect, fontes)`, `auditar_documentos(prospect, periodo)`, `gerar_laudo(prospect, publico="empresario")`, `gerar_proposta(prospect, escopo, honorario)` |
| eventos_timesheet | `con.con-301` (setor CON, atividade, prospect, duração) |
| nível_automação | Próprio (captura por certificado do prospect, se autorizada, usa a mesma API da NFE-004) |
| integrações | Motor de auditoria próprio; CRM (GES-042); assinatura eletrônica (SOC-016) |
| credencial_exigida | Nenhuma no envio de arquivos; certificado A1 do prospect para captura |
| preço | Sem custo de terceiros além da captura |
| confiança | média (concorrentes lidos; o fluxo é proposta nossa) |
| notas (dor/freq/risco/dif) | 4 / 2 / 2 / 4 |
| fontes | [E2] https://www.e-auditoria.com.br/solucoes/para-auditar-arquivos/ (06/11/2026); [ES1] https://www.esimplesauditoria.com/ (06/11/2026); [TD1] https://tributodevido.com.br/ (06/11/2026); [S1] https://www.sieg.com/ (06/11/2026) |

### CON-302 · Gerar e enviar ao cliente o relatório consultivo periódico a partir de XMLs, documentos, cores e base legal temporal

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Consultoria e Reforma / Consultoria recorrente |
| etapa | Manutenção |
| atividade | Produzir todo mês (ou trimestre) um relatório consultivo por cliente com painel, apontamentos de risco e crédito com norma vigente, leitura de negócio e ações, e publicá-lo no app depois da aprovação do contador |
| descrição | Hoje o painel da HubStrom ou da SIEG mostra números sem interpretação, e o relatório gerencial (CTB-028) depende de montagem manual. A plataforma junta XMLs, documentos do cliente, folha, contabilidade, obrigações e base legal; a IA escreve o texto e propõe ações que viram tarefas ou propostas avulsas. FIS-033 é o resumo operacional do mês (guias, prazos); esta ficha é a leitura consultiva |
| gatilho_frequência | Mensal ou trimestral, por plano do cliente; também sob pedido antes de reunião |
| quem_faz | Analista consultivo / sócio aprova |
| base_legal | Não cria obrigação; cada achado cita a norma vigente na competência (M1) |
| concorrentes | HubStrom: painel do XMLHub + relatórios estratégicos + app [H2][H3]; Jettax IA: perguntas e PDF por MCP [J2]; e-Auditoria: laudo por IA e IA de índices [E2][E4]; e-Kontroll: e-Consultoria sobre o Domínio [EK1]; Domínio IA [T1] |
| papel_da_ia | M2 ler e cruzar fontes; M1 norma e vigência por achado; M3 indicadores, carga efetiva e simulações; M4 rascunhar o relatório, abrir tarefas e propostas (publicação após aprovação) |
| ferramentas_agênticas | `montar_relatorio_consultivo(cliente, periodo, modelo)`, `listar_achados(cliente, periodo, tipo)`, `transformar_achado_em_tarefa(achado_id)`, `publicar_no_app(cliente, documento)` |
| eventos_timesheet | `con.con-302` |
| nível_automação | Próprio |
| integrações | Captura própria (NFE-004 a 009), APIs dos cores (V3), app do cliente |
| credencial_exigida | As da captura e dos cores |
| preço | Sem custo de terceiros; custo de LLM por relatório `[NÃO VERIFICADO]` |
| confiança | média |
| notas (dor/freq/risco/dif) | 3 / 3 / 2 / 4 |
| fontes | [H2] https://hubstrom.com/solucoes/xmlhub ; [H3] https://hubstrom.com/planos ; [J2] https://www.jettax.com.br/jettax-ia/ ; [E2] ; [E4] ; [EK1] https://e-kontroll.com.br/ (todas 06/11/2026) |

### CON-303 · Comparar carga tributária e escolhas fiscais do cliente com pares da carteira (benchmark anonimizado)

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Consultoria e Reforma / Planejamento tributário |
| etapa | Manutenção |
| atividade | Comparar carga efetiva, regime, fator R, peso da folha, margem e mix de fornecedores do cliente com clientes do mesmo CNAE, porte e UF da carteira, e apontar desvios que merecem revisão |
| descrição | Hoje ninguém no escritório pequeno ou médio faz isso; o sócio "sabe" de memória quem paga demais. A plataforma calcula indicadores por cliente e compara com a mediana dos pares, sem expor nenhum cliente, e sugere revisão (CON-010) quando o desvio é grande |
| gatilho_frequência | Trimestral e na entrada do cliente |
| quem_faz | Consultor / sócio |
| base_legal | Sigilo profissional (NBC PG 01) `[NÃO VERIFICADO artigo]`: só agregados, com número mínimo de pares |
| concorrentes | ROIT: "benchmark setorial" com base de 1,8 PB, dentro do serviço de recuperação [R1]; nenhum gestor de escritório encontrado oferece isso sobre a própria carteira |
| papel_da_ia | M2 agregar a carteira; M3 indicadores e estatística; M1 explicar a regra por trás do desvio; M4 abrir revisão |
| ferramentas_agênticas | `benchmark_cliente(cliente, indicadores, grupo)`, `listar_desvios(carteira, limiar)` |
| eventos_timesheet | `con.con-303` |
| nível_automação | Próprio |
| integrações | Dados dos cores e da captura |
| credencial_exigida | Nenhuma além das já existentes |
| preço | Sem custo de terceiros |
| confiança | média |
| notas (dor/freq/risco/dif) | 2 / 2 / 2 / 5 |
| fontes | [R1] https://roit.com.br/ (06/11/2026) |

### CON-304 · Decidir entre executar ou terceirizar a recuperação tributária e controlar parceiros, casos e comissões

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Consultoria e Reforma / Recuperação de créditos |
| etapa | Manutenção |
| atividade | Para cada indício de crédito (CON-033), decidir se o escritório executa (CON-034) ou encaminha a um parceiro; enviar o dossiê ao parceiro, acompanhar o andamento e conferir a comissão recebida |
| descrição | Hoje o escritório indica clientes a empresas de recuperação por e-mail ou WhatsApp, perde o controle do andamento e não confere a comissão. A plataforma registra o encaminhamento com a autorização do cliente, acompanha os marcos (diagnóstico, protocolo, compensação) e cobra a comissão. GES-012 é a comissão paga **pelo** escritório a quem indica clientes; esta ficha é a comissão recebida |
| gatilho_frequência | Por evento (indício de crédito) e conferência mensal |
| quem_faz | Sócio / consultor |
| base_legal | Prazo de prescrição de 5 anos para restituição (CTN, art. 168) |
| concorrentes | Tributo Devido: parceria comissionada, "você indica, a TD executa" [TD1]; e-Recuperador: entrega insumos para o escritório executar [E5]; é-Simples: proposta e contrato para o escritório executar [ES1] |
| papel_da_ia | M2 montar o dossiê; M3 estimar o valor e a comissão; M4 lembrar marcos e cobrar |
| ferramentas_agênticas | `encaminhar_recuperacao(cliente, parceiro, dossie)`, `registrar_marco(caso_id, marco)`, `conferir_comissao(caso_id)` |
| eventos_timesheet | `con.con-304` |
| nível_automação | D-assistido (parceiros sem API pública encontrada) |
| integrações | `[NÃO ENCONTRADO]` API dos parceiros; troca por e-mail ou portal |
| credencial_exigida | Autorização do cliente para compartilhar os dados |
| preço | Comissão negociada; `[PREÇO NÃO PÚBLICO]` |
| confiança | média |
| notas (dor/freq/risco/dif) | 2 / 2 / 3 / 3 |
| fontes | [TD1] https://tributodevido.com.br/ ; [TD3] https://tributodevido.com.br/llms.txt ; [E5] https://e-auditoria.com.br/llms.txt ; [ES1] (06/11/2026) |

### FIS-301 · Corrigir o SPED em lote com regras nativas e regras do escritório (com vigência), validar e transmitir sem abrir o PVA

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Fiscal e Obrigações / SPED |
| etapa | Manutenção |
| atividade | Aplicar a cada EFD ICMS/IPI e EFD Contribuições gerada pelo core as correções conhecidas (nativas e criadas pelo escritório, cada uma com vigência e autor), validar, assinar e transmitir em lote, guardando o recibo |
| descrição | Hoje o analista abre o PVA arquivo por arquivo, corrige à mão os mesmos erros todo mês (cadastro, CST, participante) e transmite um por um. FIS-004 é a conferência por cruzamento; esta ficha é a **correção repetível e a entrega em escala**. Cada regra do escritório é uma decisão do contador registrada, revisável e com vigência |
| gatilho_frequência | Mensal (prazo de cada EFD) |
| quem_faz | Analista fiscal |
| base_legal | Leiautes do Guia Prático da EFD ICMS/IPI e da EFD Contribuições `[NÃO VERIFICADO versão vigente]` |
| concorrentes | e-Auditoria: Fluxo automático do SPED, mais de 100 regras, Fábrica de Regras, transmite sem PVA, "8 em cada 10" prontos [E1]; IOB: envio em lote com auditoria sem o PVA [I1]; Fiscal.io: validação do SPED contra a Sefaz [F1] |
| papel_da_ia | M2 ler o arquivo; M1 checar a regra vigente; M4 aplicar regras aprovadas e propor regras novas a partir de correções manuais repetidas |
| ferramentas_agênticas | `aplicar_regras_sped(arquivo, regras)`, `propor_regra_sped(exemplos)`, `transmitir_sped_lote(arquivos)` |
| eventos_timesheet | `fis.fis-301` |
| nível_automação | F (o arquivo sai do core); transmissão automatizada `[NÃO VERIFICADO]` (mecanismo dos concorrentes não publicado) |
| integrações | Exportação do SPED pelo core; ReceitaNet/PVA `[NÃO VERIFICADO]` |
| credencial_exigida | Certificado do cliente ou e-CNPJ do escritório com procuração para assinar |
| preço | Sem custo de terceiros encontrado |
| confiança | média |
| notas (dor/freq/risco/dif) | 4 / 3 / 4 / 2 |
| fontes | [E1] https://www.e-auditoria.com.br/black-november-2026/ ; [I1] https://www.contabeis.com.br/noticias/65284/iob-inova-com-inteligencia-artificial-para-mercado-contabil/ (23/05/2024) ; [F1] https://fiscal.io/ (06/11/2026) |

### FIS-302 · Reconstruir o estoque "na visão do Fisco" (EFD + notas) e comparar com o estoque do cliente

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Fiscal e Obrigações / Estoque e ICMS |
| etapa | Manutenção, Desligamento |
| atividade | Calcular, por produto, estoque inicial + entradas − saídas pelos XMLs e pela EFD (Bloco H/K), comparar com o inventário informado e com o estoque do ERP, e apontar omissões prováveis antes do Fisco |
| descrição | Hoje quase ninguém faz isso; a divergência aparece numa fiscalização por levantamento quantitativo. CTB-046 gera o livro de inventário; esta ficha confere a coerência física e fiscal do estoque, inclusive antes da baixa da IE (FIS-111) |
| gatilho_frequência | Anual (inventário) e eventual (baixa, fiscalização, compra de empresa) |
| quem_faz | Analista fiscal / consultor |
| base_legal | Levantamento quantitativo de estoque como técnica fiscal nos RICMS estaduais `[NÃO VERIFICADO dispositivo por UF]` |
| concorrentes | Kolossus Auditor: "controle de estoque na visão do fisco" a partir da EFD ICMS/IPI e das notas [K1]; e-Auditoria cita "auditoria de estoque" em depoimento [E2] |
| papel_da_ia | M2 cruzar XML, EFD e planilha do cliente; M3 calcular saldos e diferenças; M1 explicar o risco; M4 abrir tarefa e pedir explicação ao cliente |
| ferramentas_agênticas | `estoque_visao_fisco(cliente, periodo)`, `comparar_inventario(cliente, fonte)` |
| eventos_timesheet | `fis.fis-302` |
| nível_automação | F (EFD do core) + Próprio |
| integrações | Captura de XML; EFD exportada pelo core; planilha ou ERP do cliente |
| credencial_exigida | As da captura |
| preço | Sem custo de terceiros |
| confiança | média |
| notas (dor/freq/risco/dif) | 3 / 2 / 4 / 3 |
| fontes | [K1] https://suporte.dominioatendimento.com/central/faces/solucao.html?codigo=9805 (06/11/2026) ; [E2] |

### NFE-301 · Vigiar mudanças de tributação por produto (NCM, CEST, CST, cClassTrib, alíquota) e avisar quais clientes e itens são afetados

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Notas fiscais / Conferência tributária |
| etapa | Manutenção |
| atividade | Manter a base de produtos de cada cliente (a partir dos XMLs) e, a cada mudança de norma ou de tabela, listar os itens e clientes afetados, o que muda e desde quando |
| descrição | Hoje a mudança chega pelo boletim da Econet ou da IOB e o analista tenta lembrar quem vende aquele NCM. NFE-032 é a revisão periódica; CON-005 vigia pareceres. Esta ficha é a **vigilância contínua por item**, essencial no IBS/CBS (cClassTrib) e na ST |
| gatilho_frequência | Semanal (atualização da base de regras) e por evento (norma nova) |
| quem_faz | Analista fiscal |
| base_legal | LC 214/2025 (IBS/CBS e classificação por item); Convênio ICMS 142/2018 (CEST e ST) |
| concorrentes | Kolossus: monitora uma base de produtos e notifica alterações [K1]; e-Auditoria: "monitora mudança de regra e avisa o que mudou na sua base", 1,5 milhão de atualizações por semana [E1][E5]; IOB: 390 milhões de regras [I1]; Systax: regras por API [SY1] |
| papel_da_ia | M1 detectar a mudança e a vigência; M2 cruzar com os itens dos clientes; M4 avisar e abrir tarefa de ajuste no ERP do cliente |
| ferramentas_agênticas | `atualizar_base_produtos(cliente)`, `itens_afetados(norma_id)`, `avisar_mudanca_tributacao(cliente, itens)` |
| eventos_timesheet | `nfe.nfe-301` |
| nível_automação | B (base de regras de fornecedor) ou Próprio (M1 com a norma) |
| integrações | e-Auditoria, IOB, Systax, Kolossus: nenhuma API pública com preço encontrada `[PREÇO NÃO PÚBLICO]` |
| credencial_exigida | Contrato comercial, se for usar base de terceiros |
| preço | `[PREÇO NÃO PÚBLICO]` |
| confiança | média |
| notas (dor/freq/risco/dif) | 3 / 4 / 4 / 3 |
| fontes | [K1] ; [E1] ; [E5] ; [I1] ; [SY1] https://www.baguete.com.br/noticias/stara-classificacao-fiscal-com-systax (resumo do buscador) |

### NFE-302 · Classificar sob pedido um produto novo do cliente (NCM, CEST, CST/CSOSN, cClassTrib e alíquotas) com base legal e vigência

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Notas fiscais / Conferência tributária |
| etapa | Manutenção |
| atividade | Receber pelo app ou pelo WhatsApp a descrição, a foto ou a ficha técnica de um item que o cliente vai comprar ou vender, propor a classificação e a tributação completas com a norma, e registrar a resposta no cadastro do cliente |
| descrição | Hoje o cliente pergunta "qual NCM?" e o analista pesquisa na Econet ou na IOB e responde de cabeça. FIS-044 trata das perguntas recorrentes em geral; esta ficha é a classificação técnica do item, que alimenta NFE-301 e NFE-032 |
| gatilho_frequência | Por evento (produto novo, mudança de fornecedor) |
| quem_faz | Analista fiscal; o cliente pede pelo app |
| base_legal | TIPI/NCM; Convênio ICMS 142/2018 (CEST); LC 214/2025 (IBS/CBS) |
| concorrentes | e-Auditoria: "Classificar item novo: descobre NCM, CST e como tributar" e classificação em lote com base legal [E1][E5]; Busca.Legal EvoBusca T2 [BL1]; Systax [SY1]; é-Simples "Classificação Fiscal Inteligente" [ES1] |
| papel_da_ia | M2 ler a descrição e os documentos; M1 propor a classificação com norma e vigência; M4 rascunhar a resposta ao cliente e atualizar o cadastro após aprovação |
| ferramentas_agênticas | `classificar_produto(descricao, anexos, uf, regime)`, `registrar_classificacao(cliente, item, classificacao)` |
| eventos_timesheet | `nfe.nfe-302` |
| nível_automação | Próprio (M1); B se for contratada base de terceiros |
| integrações | Opcional: base de regras de fornecedor `[PREÇO NÃO PÚBLICO]` |
| credencial_exigida | Nenhuma |
| preço | Custo de LLM `[NÃO VERIFICADO]` |
| confiança | média |
| notas (dor/freq/risco/dif) | 3 / 2 / 4 / 2 |
| fontes | [E1] ; [E5] ; [BL1] https://segs.com.br/demais/273259-busca-legal-e-mastermaq-automatizam-e-reduzem-tempo-de-operacoes-fiscais/amp (resumo do buscador) ; [ES1] |

### GES-301 · Dar às IAs externas do escritório (ChatGPT, Claude, Gemini) acesso aos dados da plataforma por MCP, com escopo por cliente e trilha de auditoria

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Gestão e Atendimento / Governança da IA |
| etapa | Manutenção |
| atividade | Publicar um servidor MCP da plataforma, autorizar por usuário quais clientes e quais dados (notas, guias, tarefas, tempo) cada IA externa pode ler ou alterar, e registrar cada consulta |
| descrição | Hoje o contador exporta planilhas e cola no ChatGPT, sem controle de sigilo. Jettax, Fiscal.io, Acessórias, Conexa e Nibo já expõem MCP. A plataforma oferece o mesmo, mas com o escopo do perfil de acesso (GES-021) e o registro em GES-056 |
| gatilho_frequência | Diária (uso) e por evento (concessão e revogação) |
| quem_faz | Sócio / TI do escritório |
| base_legal | LGPD (Lei 13.709/2018), para os dados pessoais de empregados e sócios dos clientes; sigilo profissional (NBC PG 01) `[NÃO VERIFICADO artigo]` |
| concorrentes | Jettax IA por MCP [J2]; Fiscal.io "Cursor, Claude, ChatGPT, Gemini e Copilot sobre a base do Monitor" [F1]; Acessórias, Conexa e Nibo com MCP (B1) |
| papel_da_ia | M2 servir os dados; M4 só com aprovação explícita |
| ferramentas_agênticas | `conceder_acesso_mcp(usuario, clientes, escopos)`, `revogar_acesso_mcp(usuario)`, `auditar_consultas_mcp(periodo)` |
| eventos_timesheet | `ges.ges-301` |
| nível_automação | Próprio |
| integrações | Protocolo MCP; OAuth |
| credencial_exigida | Login do usuário na plataforma |
| preço | Sem custo de terceiros |
| confiança | alta (páginas dos fornecedores lidas) |
| notas (dor/freq/risco/dif) | 2 / 4 / 3 / 2 |
| fontes | [J2] https://www.jettax.com.br/jettax-ia/ ; [F1] https://fiscal.io/ (06/11/2026) ; B1-financeiro-escritorio.md |

---

## 5. Lacunas

- Confirmar numa demonstração se a HubStrom tem IA que escreve consultoria a partir dos XMLs (hoje, sem texto público).
- Preços de e-Auditoria, Jettax, Qive, IOB, Econet, Kolossus, ROIT, Dootax, é-Simples e e-Kontroll (todos por proposta).
- Mecanismo de transmissão de SPED sem PVA usado por e-Auditoria e IOB.
- Lysis, Fiscoplan e "Contador AI": não encontrados; pedir ao fundador o site ou o nome completo.
- Econet e IOB bloquearam o acesso por curl (bloqueio de rede e geográfico); as informações vieram da imprensa.

## 6. Fontes (consultadas em 06/11/2026)

- [H1] HubStrom, página inicial: https://hubstrom.com/
- [H2] HubStrom XMLHub: https://hubstrom.com/solucoes/xmlhub
- [H3] HubStrom, planos: https://hubstrom.com/planos
- [H4] AmdJus, "HubStrom revela o futuro da contabilidade em 2026…" (27/11/2025): https://amdjus.com.br/hubstrom-revela-o-futuro-da-contabilidade-em-2026-com-inovacao-e-vantagens-sem-precedentes-ainda-em-novembro/
- [S1] SIEG: https://www.sieg.com/
- [S2] SIEG, preços: https://www.sieg.com/precos/
- [Q1] Qive: https://qive.com.br/
- [Q2] Qive, blog "5 Relatórios para Escritórios Contábeis": https://qive.com.br/blog/relatorios-nfes-escritorios-contabeis-entrega-clientes
- [E1] e-Auditoria, Black November 2026: https://www.e-auditoria.com.br/black-november-2026/ (e página inicial https://www.e-auditoria.com.br/)
- [E2] e-Auditoria, auditar arquivos: https://www.e-auditoria.com.br/solucoes/para-auditar-arquivos/
- [E4] e-Auditoria, IA interpretadora de índices (03/10/2025, atualizado em 27/08/2026): https://www.e-auditoria.com.br/blog/ia-interpretadora-de-indices-contabeis-e-financeiros/
- [E5] e-Auditoria, llms.txt: https://e-auditoria.com.br/llms.txt
- [F1] Fiscal.io: https://fiscal.io/
- [F2] Fiscal.io, planos: https://fiscal.io/monitor/planos.html
- [J1] Jettax: https://www.jettax.com.br/
- [J2] Jettax IA: https://www.jettax.com.br/jettax-ia/
- [K1] Central Domínio, "Quais as funcionalidades do Kolossus Auditor?": https://suporte.dominioatendimento.com/central/faces/solucao.html?codigo=9805
- [K2] Central Domínio, "Como integrar Domínio e Kolossus Auditor?" (resumo do buscador): https://suporte.dominioatendimento.com/central/faces/solucao.html?codigo=7956
- [T1] Utilitários Contábeis, "Inteligência artificial automatiza rotinas…" (16/10/2026): https://sitecontabil.com.br/noticias_empresariais/ler/inteligencia-artificial-automatiza-rotinas-e-amplia-atuacao-consultiva-de-contadores
- [I1] Contábeis, "IOB inova com Inteligência Artificial para mercado contábil" (23/05/2024): https://www.contabeis.com.br/noticias/65284/iob-inova-com-inteligencia-artificial-para-mercado-contabil/
- [EC1] Por Dentro de Minas, "Econet lança IA…" (maio de 2025, resumo do buscador): https://pordentrodeminas.com.br/noticias-corporativas/2025/05/316507-econet-lanca-ia-para-apoiar-profissionais-na-reta-final-do-imposto-de-renda
- [TD1] Tributo Devido: https://tributodevido.com.br/
- [TD2] TAIS: https://tributodevido.com.br/tais/
- [TD3] Tributo Devido, llms.txt: https://tributodevido.com.br/llms.txt
- [R1] ROIT: https://roit.com.br/
- [D1] Dootax: https://www.dootax.com.br/
- [ES1] é-Simples Auditoria: https://www.esimplesauditoria.com/
- [EK1] e-Kontroll: https://e-kontroll.com.br/
- [BL1] SEGS, "Busca Legal e Mastermaq…" (sem data, resumo do buscador): https://segs.com.br/demais/273259-busca-legal-e-mastermaq-automatizam-e-reduzem-tempo-de-operacoes-fiscais/amp
- [SY1] Baguete, "Stara: classificação fiscal com Systax" (2021, resumo do buscador): https://www.baguete.com.br/noticias/stara-classificacao-fiscal-com-systax
- [AV1] Avalara, TaxDocs Monitor 2.0 (resumo do buscador): https://www.avalara.com/br/pt/products/processo-de-conformidade.html

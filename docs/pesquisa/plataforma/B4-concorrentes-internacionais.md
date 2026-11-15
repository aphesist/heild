# B4 · Referências internacionais: gestão de escritórios contábeis e IA para contadores

6 de novembro de 2026 · Rodada B do [Protocolo de Descoberta](00-protocolo-de-descoberta.md) · agente B4

**Escopo:** sistemas de fora do Brasil para gestão de escritórios contábeis (practice management), propostas e cobrança, portal do cliente, captura de documentos e IA agêntica para contadores, com foco no que **é diferente do mercado brasileiro e faria sentido aqui**. A pedido do usuário, a varredura foi **além da lista inicial** (Karbon, TaxDome, Canopy, Financial Cents, Jetpack Workflow, Ignition, Xero Practice Manager, QuickBooks Online Accountant, Dext, Hubdoc, Uku, Senta, Pixie, Basis, Digits, Fieldguide): entraram também **Anchor**, **GoProposal (Sage)**, **Intuit Accountant Suite** (substituto do QBOA), **XeroForce/JAX/Partner Hub**, **Accrual**, **Liscio**, **Soraban**, **Carly**, **Client Hub**, **Double (ex-Keeper)**, **Syft**, **StanfordTax**, **Ravical** e **Atlas**.

## Como ler este arquivo

- **Método.** Páginas oficiais dos fornecedores lidas nesta sessão (06/11/2026) com `curl` e extração de texto; 10 buscas na web para achar páginas e notícias. Quando a informação vem só do resumo do buscador ou de imprensa especializada (CPA Practice Advisor, Accounting Today), isso está dito.
- **Confiança.** "Alta" só quando a página do próprio fornecedor foi lida agora. Funcionalidade que não apareceu nas páginas lidas está como `?` (não encontrado), **não** como "não tem". Anúncios em "pilot", "beta", "early access" ou "coming soon" estão marcados como **~** (roadmap), porque ainda não são produto geral.
- **Fichas novas:** 8 (`GES-401` a `GES-407`, `CON-401`). Antes de criar cada uma, foram conferidos o inventário de 420 atividades e as fichas novas de B1 (`FIN-001` a `FIN-014`) e B2 (`GES-201` a `GES-208` e outras). Cada ficha tem o campo `não_confundir_com`.
- **Limites.** Não abriram: taxdome.com (bloqueio Cloudflare em todas as páginas; dados de TaxDome vêm de buscador e de terceiros), quickbooks.intuit.com (resposta vazia), businesswire.com (vazia; usada a reprodução da TechIntelPro), página de preços da Ignition e da Financial Cents (valores carregados por script, não aparecem no HTML). Ravical, Atlas e Byron aparecem só em notícias de captação lidas no buscador; o que fazem não foi verificado.

---

## 1. Achados principais

1. **O "practice management" virou "sistema de ação" com IA dentro.** Karbon lançou em 03/06/2026 o **Kai**, "AI coworker" que conhece clientes, trabalhos e equipe, com notetaker de reuniões, **servidor MCP público**, analytics com IA, checagens agênticas de fechamento e **triagem de e-mail por IA** (categorização, roteamento e destaque do crítico) [S1]. Canopy anuncia o **Coworker** ("coming soon"), que executa trabalho, monitora carga da equipe e recomenda realocações, sugere listas de pedidos ao cliente a partir do ano anterior, e tem **fila de revisão** antes de executar [S5]. TaxDome descreve o agente **Atlas** + MCP + API, em beta e prometidos para o fim do 3º tri de 2026 (fonte: resumo do buscador da página TaxDome, não lida) [S10].
2. **Agente que se cria em linguagem natural é a nova fronteira.** Intuit **Agent Studio** (piloto; engenheiros da Intuit com ~20 escritórios) e **Playbooks** (beta: o escritório sobe POPs e checklists e a IA rascunha o roteiro de implantação) [S12]; Xero **XeroForce** (alpha, maio/2026): agentes em linguagem natural sobre o Xero e apps de terceiros, que rodam em segundo plano por dias ou semanas esperando eventos (resposta de e-mail, data de entrega), com trilha de auditoria e **ação em lote em toda a carteira** [S15]; TaxDome Atlas salva uma tarefa feita uma vez como agente recorrente [S10]. Ficha **GES-407**.
3. **"Proposta = contrato = cobrança".** Ignition: o cliente informa o meio de pagamento **dentro da proposta**; assinou, a cobrança e o pagamento passam a ser automáticos; envio e renovação de propostas em lote; cobrança imediata do fora de escopo ("Instant Bill") [S6][S7]. Anchor leva ao extremo: autorização de pagamento capturada na assinatura, faturas geradas pelos termos do acordo, conciliação em tempo real no QuickBooks/Xero, contratos "evergreen", **US$ 5 por pagamento recebido e nenhuma mensalidade**, 21 mil empresas, 98% com DSO zero (números do próprio fornecedor) [S8]. No Brasil, o equivalente técnico já existe (Pix Automático, ver B1 [F12]/[F26]), mas não apareceu ligado à proposta em nenhum concorrente lido por B2. Ficha **GES-401**.
4. **Preço sugerido por dados de mercado.** Ignition **Price Insights**: benchmark e sugestão de preço por serviço, localização e perfil, "com base no que os clientes aceitaram pagar" em propostas reais, dentro do fluxo da proposta; eleito Top New Product 2026 pela Accounting Today [S9]. Karbon anunciou recomendação de preço por histórico (roadmap de 2025) [S2]. Ficha **GES-402**, com alerta de direito concorrencial.
5. **PLD/KYC embutido na proposta.** Ignition **Compliance** identifica quais serviços exigem verificação, pede a checagem junto com a proposta e guarda evidências, risco e decisão num painel [S6b]. No Brasil isso conversa com o SOC-019 (COAF); vale como forma de fazer, não como atividade nova.
6. **Capacidade e orçamento de horas são básicos lá fora.** Financial Cents (painel de carga em tempo real, histórico e previsão para decidir contratação) [S17], Jetpack (orçamento de tempo por trabalho; capacidade semanal e anual no plano intermediário) [S19][S20], Uku (férias redistribuem as tarefas sozinhas; monitoramento do tempo gasto além do contrato) [S21], Karbon (sugestões por capacidade, tempo e orçamento) [S3], Ignition (realização, taxa horária efetiva e margem em contratos de preço fixo, a partir do tempo do Karbon, Financial Cents, XPM) [S6c]. No B2 brasileiro, "tempo por tarefa" só apareceu parcial (Domínio Processos, e-Kontroll). Fichas **GES-403** e **GES-404**.
7. **IA que valida o documento na hora do envio.** Financial Cents tem três agentes de documento: **File Validator** (compara o arquivo com o pedido, o período e o cliente e avisa o próprio cliente no portal para trocar), **File Renaming** e **File Routing**, cada um com modo "Just Do It" ou "Always Ask" [S16]. TaxDome diz ter organizado mais de 2 milhões de documentos com IA na temporada (buscador) [S10]. Ficha **GES-405**.
8. **Questionários (organizers) e preparação por agente.** Karbon integrou os organizers da StanfordTax [S2]; Liscio vende "Smart Client Requests" e organizers [S23]; Accrual (US$ 75 mi, General Catalyst, fev/2026) usa agentes "preparadores" que leem os documentos, **acham o que falta, geram perguntas de acompanhamento** e entregam a declaração de pessoa física pronta para revisão; afirma queda de 85% no preparo e até 60% na revisão [S13]. Ficha **GES-406**.
9. **Agentes que fazem o trabalho técnico de ponta a ponta.** Basis (US$ 100 mi, Série B, avaliação de US$ 1,15 bi, fev/2026): agentes de "longo horizonte" que trabalham horas em segundo plano e devolvem o entregável para revisão; diz atender ~30% dos 25 maiores escritórios dos EUA e ter feito uma declaração 1065 inteira de forma autônoma [S11]. Fieldguide: "Field Agents" em toda a auditoria (planejamento, testes, demonstrações com conferência número a número) e MCP próprio [S25]. Intuit: **Agentic Books Close** (piloto; nada é lançado sem revisão; add-on pago depois do piloto), agente de limpeza do plano de contas, transações "prontas para lançar" com limiares de materialidade por cliente [S12]. No Brasil isso cabe **em volta do core** (checklist de fechamento, anomalias, conferências), não dentro dele.
10. **Consultoria assistida.** Intuit **Agentic Advisory** ("coming soon"): rascunha pacotes consultivos com números conferidos no razão, avalia o progresso do cliente contra metas e prepara o contador para a reunião [S12]. Xero passou a incluir o **Syft** (previsão, consolidação, health score) sem custo extra em planos elegíveis [S14]; o JAX responde sobre caixa e compara com o mercado [S4]. Ficha **CON-401**.
11. **Plataforma única e fim de produtos antigos.** O Intuit Accountant Suite substitui o QuickBooks Online Accountant, **com fim previsto para dezembro de 2026** [S12b]; o Xero Partner Hub junta as ferramentas de prática, com beta para quem usa XPM e lançamento completo previsto para o início de 2026 (não confirmado se ocorreu) [S14]. A Intuit diz que o Suite é gratuito nos EUA e que 250 mil escritórios o adotaram (resumo do buscador; número do fornecedor) [S12].
12. **Preços públicos são mais comuns lá fora.** Karbon US$ 59 (Team) e US$ 89 (Business) por usuário/mês no anual; IA sem custo adicional [S3][S3b]; Canopy US$ 74, 109 e 149 por usuário/mês nos módulos lidos [S5b]; Senta £ 29 por usuário/mês (ou £ 23,20 no anual), portal e assinatura ilimitada inclusos [S22]; Anchor US$ 5 por pagamento [S8]; TaxDome US$ 800 a 1.200 por usuário/ano segundo Capterra e terceiros (confiança média) [S10b].

---

## 2. Concorrente por concorrente (resumo)

| Fornecedor | País/foco | O que interessa ao Brasil | Fonte |
| --- | --- | --- | --- |
| **Karbon** | EUA/AU; gestão de prática | Kai (early access), triagem de e-mail com IA, notetaker, MCP público, ciclo de vida do cliente com renovação e reprecificação, painel "Assignments" de carga, orçamento de tempo, correção de tempo não lançado por IA | [S1][S2][S3] |
| **TaxDome** | EUA; prática + portal | Agente Atlas, MCP e API (beta); IA de documentos; portal com app próprio; organizers. Site não abriu | [S10][S10b] |
| **Canopy** | EUA; prática modular | Coworker (em breve): executa, realoca trabalho, sugere pedidos ao cliente pelo ano anterior, fila de revisão; módulo para auditoria | [S5][S5b] |
| **Financial Cents** | EUA; prática p/ pequenos | 3 agentes de documento (validar, renomear, arquivar), MCP (plano Scale), capacidade, e-mail integrado, cobrança | [S16][S17] |
| **Jetpack Workflow** | EUA; workflow | Orçamento de tempo por trabalho, recorrência, capacidade semanal/anual | [S19][S20] |
| **Uku** | Estônia/Europa | Cobertura de férias automática, monitoramento de tempo além do contrato, e-mails do cliente viram tarefas na mesma lista, cobrança automática, "AI agent-ready" | [S21] |
| **Pixie** | Reino Unido | Trabalhos que começam sozinhos pelas datas-chave do cliente, POP com vídeo e checklist dentro da etapa, usuários ilimitados | [S24] |
| **Senta (IRIS)** | Reino Unido | CRM + workflow + portal com assinatura ilimitada; alertas de anomalias financeiras do software do cliente; preço aberto | [S22] |
| **Ignition** | AU/global; propostas e cobrança | Pagamento capturado na proposta, cobrança automática, renovação em lote, Price Insights (IA), WIP e realização, PLD/KYC na proposta | [S6][S6b][S6c][S7][S9] |
| **Anchor** | EUA/Israel; cobrança | "Agreement-first": assinatura = autorização de débito; conciliação em tempo real; US$ 5 por pagamento | [S8] |
| **GoProposal (Sage)** | Reino Unido | Precificação e proposta; sem cobrança nativa (segundo Anchor e TrustRadius; confiança baixa) | [S8] |
| **Intuit Accountant Suite** | EUA; substitui QBOA | Agentic Books Close, Agent Studio, Playbooks, cross-client insights, inbox unificado, rede de indicação ProPartner | [S12][S12b] |
| **Xero (XPM, JAX, XeroForce, Syft)** | NZ/global | Agentes em linguagem natural em toda a carteira, Partner Hub, Syft grátis | [S4][S14][S15] |
| **Dext / Hubdoc** | Reino Unido / Xero | Captura por celular, e-mail e **WhatsApp**; busca de faturas de fornecedores; AI Assist transforma decisões repetidas em regras para aprovar | [S26][S27] |
| **Basis** | EUA; agentes | Agentes de longo horizonte em CAS, tributos e auditoria | [S11] |
| **Accrual** | EUA; tributos PF | Agente preparador: acha lacunas, gera perguntas, rascunho pronto para revisão; comprará o negócio de escritórios da Puzzle (buscador) | [S13] |
| **Digits** | EUA; razão nativo em IA | Classificação 24/7, fechamento, multi-entidade; o contador passa a revisar em vez de digitar | [S28] |
| **Fieldguide** | EUA; auditoria | Field Agents, MCP, interface conversacional do planejamento à assinatura | [S25] |
| **Liscio / Client Hub / Carly / Soraban / Double** | EUA | Portal e mensagens com resposta por voz e IA (Liscio); IA que rascunha resposta e sinaliza pendências de fechamento (Client Hub, segundo comparativo); assistente que opera e-mail e agenda (Carly, vendor); entrada de dados do cliente (Soraban, YC); fechamento com revisão por IA (Double, ex-Keeper) | [S23][S29] |

---

## 3. Matriz de funcionalidades × concorrentes internacionais

Legenda: **✔** visto na página oficial lida em 06/11/2026 · **~** anunciado em beta, piloto, early access ou roadmap · **T** só por terceiros ou buscador · **?** não encontrado nas páginas lidas (não significa ausência) · **BR** = situação no mercado brasileiro segundo o B2.

| Funcionalidade | Karbon | TaxDome | Canopy | Fin. Cents | Jetpack | Uku | Ignition | Anchor | Intuit IAS | Xero | Dext/Hubdoc | Basis/Accrual | BR (B2) | Plataforma |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Proposta online com assinatura | ✔ (engagements) | T | ? | ? | ? | ✔ (e-sign) | ✔ | ✔ | ? | ? | — | — | ? | GES-401 |
| Pagamento autorizado na proposta e cobrança automática | ✔ (billing) | T | ? | ✔ (billing) | ? | ✔ | ✔ | ✔ | ? | ~ (pagamento por etapas) | — | — | ? | GES-401 |
| Renovação/reprecificação de contratos em lote | ✔ | ? | ? | ? | ? | ? | ✔ | ✔ (evergreen) | ? | ? | — | — | ~ (reajuste) | SOC-018 + GES-401 |
| Preço sugerido por benchmark | ~ | ? | ? | ? | ? | ? | ✔ | ? | ? | ~ (JAX benchmark) | — | — | ? | GES-402 |
| PLD/KYC dentro da proposta | ? | ? | ? | ? | ? | ? | ✔ | ? | ? | ? | — | — | ? | SOC-019 |
| Capacidade da equipe (carga × disponível) | ✔ | ? | ~ | ✔ | ✔ | ✔ | — | — | T (utilização) | ? | — | — | ? | GES-403 |
| Orçamento de horas e realização | ✔ | ? | ~ | ✔ | ✔ | ✔ | ✔ | — | ? | ? | — | — | ~ (e-Kontroll) | GES-404 |
| Validação do documento no envio, com retorno ao cliente | ? | T (organiza) | ? | ✔ | ? | ? | — | — | ? | ? | ~ (99% extração) | ✔ (Accrual acha lacunas) | ? | GES-405 |
| Questionário/organizer anual | ✔ (StanfordTax) | T | ~ | ? | ? | ? | ✔ (Forms) | — | ✔ (Playbooks, beta) | ? | — | ✔ | ? | GES-406 |
| Triagem de e-mail por IA | ✔ | T (não começa pelo e-mail, segundo concorrente) | ~ (rascunhos) | ✔ (e-mail integrado) | ? | ✔ (e-mail vira tarefa) | — | — | ✔ (inbox unificado) | ? | ✔ (captura por e-mail) | — | ~ | GES-027 |
| Notetaker de reunião com tarefas | ~ | ? | ✔ (conversas no CRM) | ? | ? | ? | — | — | ~ (Advisory) | ? | — | — | ? | GES-033 |
| Agente que executa com fila de aprovação | ~ | ~ | ~ | ✔ (docs) | ? | ~ | — | — | ~ | ~ | ✔ (AI Assist) | ✔ | ~ (Alterdata) | Plano |
| Agente criado pelo escritório em linguagem natural | ? | ~ (Atlas) | ✔ (plano executável) | ✔ (checklist por prompt) | ? | ? | — | — | ~ (Agent Studio) | ~ (XeroForce) | — | — | ~ (HubStrom, processo) | GES-407 |
| Servidor MCP | ✔ | ~ | ? | ✔ | ? | ✔ ("agent-ready") | ? | ? | ✔ (fatura no Claude/ChatGPT) | ? | ? | ? | ✔ (Acessórias, Nibo) | GES-202 |
| Fechamento contábil agêntico | ✔ (checagens) | ? | ✔ (anomalias) | ? | ? | ? | — | — | ~ (piloto) | ✔ (conciliação JAX) | ✔ | ✔ | ? | CTB-024/025 |
| Pacote consultivo e projeção de caixa | ~ (AI analytics) | ? | ✔ (insights) | ? | ? | ? | — | — | ~ | ✔ (Syft) | — | ✔ (Basis CAS) | ? | CON-401 |
| Preço público | ✔ | T | ✔ | ~ | ~ | ? | ~ | ✔ | T (grátis EUA) | ? | ? | — | raro | — |

---

## 4. O que vale trazer para o Brasil

1. **Proposta que vira contrato, cobrança e implantação num clique (GES-401).** O ganho não está em nenhuma peça isolada (proposta, contrato e boleto o Brasil já tem), mas em **amarrar**: o aceite assina o contrato (SOC-016), captura a autorização do **Pix Automático** ou do cartão, agenda a primeira cobrança proporcional (GES-103), abre o checklist de entrada (SOC-021) e o convite do app (GES-104). É o "agreement-first" da Anchor com a infraestrutura do BCB. Diferencial alto: não visto no B2.
2. **Preço sugerido com dados (GES-402)**, mas com cuidado: a plataforma pode juntar o tempo medido (GES-102) com faixas de mercado. Benchmark de preços entre concorrentes pede agregação anônima e parecer de direito concorrencial antes de existir.
3. **Capacidade e orçamento de horas visíveis toda semana (GES-403, GES-404).** O timesheet automático do Plano é a matéria-prima que os internacionais não têm (lá o tempo é lançado à mão ou por timer). Com tempo medido, a plataforma prevê o pico (dia 20, DCTFWeb, IRPF), avisa quem vai estourar e mostra onde o preço fixo está perdendo dinheiro.
4. **Validar o documento na hora em que o cliente envia (GES-405).** Financial Cents prova que funciona com aviso no próprio portal; no Brasil a dor é maior porque quase tudo chega por WhatsApp. Mandar de volta "esse é o extrato de agosto, pedimos setembro" no mesmo minuto elimina uma rodada de cobrança (CTB-003).
5. **Questionários adaptativos com o ano anterior (GES-406)** para IRPF dos sócios e PF, implantação, ECF/encerramento e diagnóstico da reforma. O agente gera as perguntas que faltam a partir do que já sabe do cliente, como Accrual e Canopy Coworker.
6. **Agentes do escritório em linguagem natural, com aprovação e trilha (GES-407).** Intuit, Xero, TaxDome e Canopy convergiram para o mesmo desenho: o escritório descreve, o sistema monta um plano executável, roda em toda a carteira e registra cada ação. Para o Brasil, o diferencial é que o agente pode chamar M1 (norma), M3 (cálculo) e M4 (portal com aprovação), não só dados internos.
7. **Triagem de e-mail e notetaker** não são atividades novas (GES-027, GES-033), mas os internacionais mostram o nível esperado: categorizar, rotear, destacar o crítico, resumir a thread, rascunhar no tom do escritório; gravar a reunião e criar as tarefas ligadas ao cliente. Levar como requisito dessas fichas.
8. **Agentes de fechamento "em volta do core".** O padrão Intuit (nada lança sem revisão, limiar de materialidade por cliente, trilha única de ações da IA) serve de molde para CTB-024/CTB-025 e para GES-056/GES-062.
9. **Pacote consultivo trimestral com projeção de caixa (CON-401).** Xero dá o Syft de graça; Intuit promete o Agentic Advisory. No Brasil, o "quanto posso retirar?" (CTB-029) e a reunião (GES-045) ganham uma projeção de 13 semanas e metas acompanhadas.
10. **Preço aberto e cobrança por resultado.** Karbon, Canopy e Senta publicam preço por usuário; Anchor cobra por pagamento. Reforça a conclusão do B2 (HubStrom) de que publicar preço é diferencial no Brasil.
11. **O que não trazer (ou trazer com cuidado):** (a) bloquear a entrega de documentos até o pagamento ("pay to unlock", recurso atribuído a portais americanos; **não verificado nesta sessão**), porque reter documento do cliente é conduta tratada com cuidado no GES-006 e no código de ética [NÃO VERIFICADO]; (b) cobrança no cartão com taxa repassada ao cliente (Anchor: 2,9% + US$ 0,30) sem checar as regras de sobrepreço do Brasil; (c) "agentes" que são só regras com rótulo novo (mesma ressalva do B2 sobre a Alterdata).

---

## 5. Fichas novas

Formato do protocolo (seções 2.1 e 2.2), resumido nos campos que esta rodada pôde preencher. `nível` e `preço` são hipótese da descoberta até a Etapa 2 confirmar.

### GES-401 · Enviar a proposta interativa cujo aceite assina o contrato, autoriza a cobrança recorrente e abre a implantação

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Gestão e Atendimento / Comercial e faturamento (Entrada) |
| etapa | Entrada (e Manutenção na renovação ou mudança de escopo) |
| atividade | Montar a proposta com pacotes e opcionais escolhidos pelo próprio prospect, colher aceite e assinatura no mesmo fluxo, capturar a autorização de cobrança (Pix Automático, cartão ou débito) e disparar contrato, primeira cobrança, checklist de entrada e convite do app |
| descrição | Hoje a proposta sai em PDF ou Word por e-mail ou WhatsApp, o contrato é gerado depois, a assinatura vai por outro sistema e o cadastro da cobrança é feito à mão; entre o "fechado" e a primeira cobrança passam dias. A plataforma faria proposta online com escopo explícito (incluído e não incluído), aceite único e todo o resto em cadeia, inclusive renovação e aditivo em lote |
| gatilho_frequência | Por evento (cada prospect qualificado; renovação anual) |
| porte_alcance | Todos os clientes novos; aditivos de escopo para a carteira |
| quem_faz | Sócio / comercial / financeiro |
| base_legal | Contrato de prestação de serviços contábeis (norma do CFC já tratada no SOC-016); MP 2.200-2/2001 e Lei 14.063/2020 (assinatura eletrônica); Pix Automático (Res. BCB 402, ver B1 [F26], confiança média) [NÃO VERIFICADO nesta sessão] |
| risco_se_falhar | Cliente começa sem contrato assinado; escopo vago gera trabalho grátis; inadimplência desde a primeira parcela |
| concorrentes | Ignition (pagamento capturado na proposta; cobrança automática após assinatura; envio e renovação em lote; cobrança imediata do fora de escopo) [S6][S7]; Anchor (assinatura = autorização de pagamento, faturas pelos termos do acordo, conciliação em tempo real, contratos evergreen, US$ 5 por pagamento) [S8]; Karbon (ciclo de vida do cliente com serviços e preços que geram trabalho e renovação/reprecificação) [S1]; GoProposal/Sage (proposta e preço, sem cobrança nativa, segundo Anchor) [S8]. No Brasil: não visto nas páginas lidas por B2 |
| hipótese_automação | Modelos de proposta por tipo de cliente com preço vindo de GES-102/GES-402; página de aceite com escolha de pacote, assinatura (fornecedor de assinatura com API) e mandato de Pix Automático (PSP com API); evento de aceite cria contrato (SOC-016), assinatura de cobrança (FIN-001, GES-001, GES-103), processo de entrada (SOC-021, CIC-001) e convite (GES-104) |
| papel_da_ia | M2 ler (perfil do prospect, GES-207); M3 calcular (honorário por faixa); rascunhar (texto da proposta e escopo); M4 executar após aceite (gerar contrato, cobrança e tarefas) |
| ferramentas_agênticas | `montar_proposta(prospect, pacotes)`, `enviar_proposta(id, canal)`, `processar_aceite(id)`, `renovar_contratos_lote(filtro, reajuste)` |
| eventos_timesheet | `ges.comercial.proposta`, `ges.comercial.aceite_auto` |
| não_confundir_com | SOC-015 (levantar perfil e calcular honorário), SOC-016 (gerar contrato e colher assinatura), SOC-018 (reajuste), GES-001/GES-103 (cobrança), GES-042 (CRM até a proposta), CON-007 (proposta consultiva avulsa), FIN-001 (contrato como assinatura estruturada) |
| nível_automação | B (assinatura eletrônica e PSP com Pix Automático por API) + Próprio |
| preço | Referência externa: Anchor US$ 5 por pagamento [S8]; Ignition `[PREÇO NÃO PÚBLICO no HTML]`; custo BR de assinatura e Pix Automático a verificar na Etapa 2 (V3) |
| confiança | média (funcionalidades lidas nos fornecedores; integração BR não verificada) |
| fontes | [S1], [S6], [S7], [S8] (06/11/2026) |

### GES-402 · Sugerir o honorário da proposta com base em faixas de mercado e no histórico de propostas aceitas

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Gestão e Atendimento / Precificação (Entrada) |
| etapa | Entrada, Manutenção (reprecificação) |
| atividade | Mostrar, ao montar a proposta, a faixa de preço praticada para aquele serviço, porte, regime e região, a taxa de aceite por faixa e o "porquê" da sugestão |
| descrição | Hoje o preço sai de tabela própria, da tabela referencial do sindicato patronal ou de "feeling"; ninguém sabe quanto perde por cobrar abaixo. Lá fora, a Ignition sugere preço com base no que clientes aceitaram pagar em propostas reais. A plataforma combinaria custo medido (GES-102) com faixas agregadas e anônimas e com a taxa de aceite das próprias propostas do escritório |
| gatilho_frequência | Por evento (cada proposta; revisão anual de preços) |
| porte_alcance | Todos os serviços padronizáveis |
| quem_faz | Sócio / comercial |
| base_legal | Lei 12.529/2011 (defesa da concorrência): troca de informação de preço entre concorrentes exige agregação, anonimização e defasagem; validar com advogado antes de construir [NÃO VERIFICADO] |
| risco_se_falhar | Preço abaixo do custo; perda de proposta por preço acima do mercado; risco concorrencial se o benchmark expuser preços individuais |
| concorrentes | Ignition Price Insights (benchmark e sugestão por serviço, local e perfil, dados de propostas aceitas, "o porquê" de cada análise; Accounting Today Top New Product 2026) [S9]; Karbon (recomendação de preço por histórico, anunciada em 2025) [S2]. No Brasil: não encontrado |
| hipótese_automação | Primeiro só com dados do próprio escritório (aceite × preço × custo medido); depois faixas agregadas da base de escritórios que optarem, com regras mínimas de agregação |
| papel_da_ia | M2 ler (propostas, aceite, tempo medido); M3 calcular (faixas, elasticidade simples); rascunhar (justificativa) |
| ferramentas_agênticas | `sugerir_preco(servico, perfil_cliente)`, `taxa_aceite_por_faixa(servico)` |
| eventos_timesheet | `ges.comercial.precificar` |
| não_confundir_com | GES-102 (esforço e honorário pelo tempo de clientes parecidos), GES-013 (rentabilidade), GES-014 (reajuste), SOC-015 |
| nível_automação | Próprio |
| preço | — |
| confiança | média |
| fontes | [S2], [S9] (06/11/2026) |

### GES-403 · Prever a carga da equipe nas próximas semanas e avisar sobrecarga antes do pico

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Gestão e Atendimento / Equipe e capacidade |
| etapa | Manutenção |
| atividade | Somar as horas previstas das tarefas já agendadas por pessoa e setor (pelo tempo medido de cada tipo de tarefa) contra as horas disponíveis (jornada, férias, feriados, afastamentos), mostrar quem estoura e quando, sugerir realocação e simular o efeito de clientes novos ou contratações |
| descrição | Hoje o coordenador descobre a sobrecarga quando o prazo estoura; a distribuição é feita por número de clientes, não por esforço. Financial Cents, Jetpack, Uku e Karbon têm painel de carga; a plataforma teria a vantagem do tempo medido automaticamente |
| gatilho_frequência | Semanal (painel) e por evento (cliente novo, férias, saída de pessoa) |
| porte_alcance | Escritórios com 3 ou mais pessoas |
| quem_faz | Coordenador / sócio |
| base_legal | CLT (jornada e horas extras) quando a previsão indicar trabalho fora da jornada; ligar com GES-052/GES-053 |
| risco_se_falhar | Obrigação atrasada no pico, hora extra não planejada, rotatividade por esgotamento |
| concorrentes | Financial Cents (carga em tempo real, histórico e previsão para decidir contratação) [S17]; Jetpack (capacidade semanal e anual) [S20]; Uku (ver a carga de cada um e mover trabalho; férias redistribuem tarefas) [S21]; Karbon (sugestões com base em capacidade) [S3]; Canopy Coworker (monitora carga e recomenda realocação, em breve) [S5]; Intuit (utilização da equipe para planejar capacidade) [S12b]. No Brasil: não visto no B2 |
| hipótese_automação | Modelo de esforço por tipo de tarefa e cliente (GES-047/GES-016) × calendário da equipe; alertas e sugestão de realocação com aprovação |
| papel_da_ia | M2 ler (tarefas, tempo, calendário); M3 calcular (previsão); rascunhar (plano de realocação); M4 executar a realocação após aprovação |
| ferramentas_agênticas | `prever_carga(periodo, setor)`, `sugerir_realocacao(pessoa, periodo)`, `simular_entrada_clientes(n, perfil)` |
| eventos_timesheet | `ges.equipe.capacidade` |
| não_confundir_com | GES-017 (definir carteira por pessoa e redistribuir), GES-018 (férias da equipe), GES-016 (produtividade realizada), GES-102 (esforço do cliente novo) |
| nível_automação | Próprio |
| preço | Referências: Jetpack põe capacidade só no plano intermediário [S20] |
| confiança | alta (funcionalidade lida em vários fornecedores) |
| fontes | [S3], [S5], [S12b], [S17], [S20], [S21] (06/11/2026) |

### GES-404 · Orçar horas por serviço e cliente e alertar o estouro enquanto o trabalho acontece

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Gestão e Atendimento / Rentabilidade em tempo real |
| etapa | Manutenção |
| atividade | Definir o orçamento de horas de cada serviço recorrente e avulso por cliente (a partir do honorário e do custo-hora), acompanhar o consumo no mês e avisar responsável e sócio quando passar de limiares (70%, 100%), com a realização (valor cobrado ÷ valor do tempo) por contrato |
| descrição | Hoje a rentabilidade, quando existe, é vista depois (fim do mês ou do ano). Lá fora, orçamento de tempo por trabalho e "tempo além do contrato" são padrão. Com o timesheet automático, a plataforma avisaria durante o mês e ligaria o estouro à cobrança do extra (SOC-017) ou à revisão do contrato |
| gatilho_frequência | Diária (consumo) e mensal (fechamento) |
| porte_alcance | Todos os clientes de preço fixo |
| quem_faz | Responsável pelo cliente / sócio |
| base_legal | — |
| risco_se_falhar | Cliente deficitário por meses sem ninguém ver; trabalho extra não cobrado |
| concorrentes | Jetpack (orçamento de tempo por trabalho, ver o que escorrega) [S19]; Uku (monitoramento do tempo e lançamentos além de cada acordo) [S21]; Karbon (Time Tracking & Budgets) [S3]; Ignition (WIP contra o escopo acordado, realização, taxa horária efetiva e margem em preço fixo, com tempo de Karbon, Financial Cents, XPM) [S6c]. No Brasil: e-Kontroll e-Custos (custo por cliente, B2) |
| hipótese_automação | Orçamento gerado do honorário ÷ custo-hora (GES-055); consumo vindo do GES-047; alertas; sugestão de ação (cobrar extra, revisar escopo, mudar responsável) |
| papel_da_ia | M2 ler; M3 calcular; rascunhar (mensagem de extra ou proposta de revisão) |
| ferramentas_agênticas | `orcar_horas(cliente, servico)`, `consumo_orcamento(cliente, periodo)`, `alertar_estouro(limiar)` |
| eventos_timesheet | `ges.rentabilidade.alerta` |
| não_confundir_com | GES-013 (rentabilidade comparada depois), GES-015 (cliente passou da faixa contratada), SOC-017 (cobrar o fora do contrato), CON-037 (horas orçadas de projetos consultivos) |
| nível_automação | Próprio |
| preço | — |
| confiança | alta |
| fontes | [S3], [S6c], [S19], [S21] (06/11/2026) |

### GES-405 · Validar na hora o documento que o cliente envia e devolver ao próprio cliente o que estiver errado

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Gestão e Atendimento / Documentos e portal |
| etapa | Manutenção (e Entrada, nos documentos de implantação) |
| atividade | Ao receber arquivo pelo app, WhatsApp ou e-mail para um pedido aberto, conferir tipo, período, CNPJ/CPF, banco e legibilidade contra o que foi pedido e responder no mesmo canal, em segundos, pedindo a troca quando não bater |
| descrição | Hoje o analista só abre o arquivo dias depois, descobre que é o extrato do mês errado ou de outra conta e reinicia a cobrança. Financial Cents faz isso no portal, só avisando quando tem alta confiança, e informa a equipe se o cliente mantiver o arquivo sinalizado |
| gatilho_frequência | Diária (a cada envio) |
| porte_alcance | Todos os clientes |
| quem_faz | Hoje: analista contábil, fiscal ou DP; com a plataforma, o agente e, nos casos duvidosos, o analista |
| base_legal | LGPD (tratamento de documentos com dados pessoais) |
| risco_se_falhar | Atraso do fechamento; rodadas extras de cobrança; documento de outro cliente arquivado no lugar errado |
| concorrentes | Financial Cents AI File Validator, File Renaming e File Routing, com modos "Just Do It" e "Always Ask" [S16]; TaxDome AI de documentos (2 milhões organizados, buscador) [S10]; Dext (extração com mais de 99% de precisão, envio por WhatsApp) [S26]; Accrual (agente acha informação faltante) [S13]. No Brasil: robôs que leem guias e acham o cliente (B2), sem validação contra o pedido |
| hipótese_automação | OCR + LLM com o "pedido" (CTB-001/CTB-002) como gabarito; regras simples primeiro (CNPJ, período, banco), LLM para tipo e coerência; resposta no canal; só sinaliza com alta confiança |
| papel_da_ia | M2 ler (pedido, cadastro do cliente); executar (responder ao cliente, renomear e arquivar) |
| ferramentas_agênticas | `validar_documento(arquivo, pedido)`, `responder_validacao(cliente, canal, motivo)` |
| eventos_timesheet | `ges.documento.validar` (IA) |
| não_confundir_com | GES-026 e CTB-004 (salvar e arquivar), CTB-005 (completude da competência), CTB-003 e NFE-038 (cobrar o que falta) |
| nível_automação | Próprio |
| preço | Custo de OCR/LLM por documento `[PREÇO NÃO PÚBLICO]` |
| confiança | alta (funcionalidade lida no fornecedor) |
| fontes | [S10], [S13], [S16], [S26] (06/11/2026) |

### GES-406 · Enviar questionários adaptativos, pré-preenchidos com o que o escritório já sabe, para coletas anuais e de implantação

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Gestão e Atendimento / Coleta estruturada |
| etapa | Entrada, Manutenção |
| atividade | Montar e enviar questionários que mudam conforme as respostas (IRPF dos sócios e PF, implantação do cliente, encerramento do exercício e ECF, diagnóstico da reforma), já preenchidos com o ano anterior e o cadastro, gerar a lista de documentos que decorre das respostas e lembrar até concluir |
| descrição | Hoje se manda uma lista fixa em PDF ou WhatsApp e se descobre no meio do trabalho o que faltou perguntar (venda de imóvel, dependente novo, conta no exterior). Lá fora, "organizers" são padrão nos portais e os agentes já geram as perguntas que faltam |
| gatilho_frequência | Anual (campanha IRPF, encerramento) e por evento (cliente novo) |
| porte_alcance | Sócios e PF (IRPF), todos os clientes (implantação e encerramento) |
| quem_faz | Analista de IRPF / implantação / contábil |
| base_legal | Legislação do IRPF do ano (prazos e obrigatoriedade) para as perguntas; ligar com M1 |
| risco_se_falhar | Declaração retificadora, malha, multa; implantação travada por falta de informação |
| concorrentes | Karbon + StanfordTax (organizers dentro do workflow) [S2]; Liscio (organizers e Smart Client Requests) [S23]; Canopy Coworker (identifica o que falta pelo ano anterior e sugere pedidos personalizados, em breve) [S5]; Intuit Playbooks (beta) [S12]; Accrual (perguntas de acompanhamento geradas pelo agente) [S13]; Ignition Forms [S6]. No Brasil: não visto no B2 |
| hipótese_automação | Biblioteca de questionários com lógica condicional; pré-preenchimento pelos dados do escritório e do ano anterior; LLM sugere perguntas extras a partir do histórico; respostas viram checklist de documentos e tarefas |
| papel_da_ia | M1 (regras do IRPF), M2 ler (histórico), rascunhar (perguntas e lista de documentos) |
| ferramentas_agênticas | `gerar_questionario(cliente, tipo)`, `enviar_questionario(cliente, canal)`, `respostas_para_checklist(questionario_id)` |
| eventos_timesheet | `ges.coleta.questionario` |
| não_confundir_com | CTB-001/CTB-002 (lista mensal do que deve chegar), CIC-004 (ciclo do cliente PF), SOC-021 (checklist de entrada), GES-040 (pedidos padronizados abertos pelo cliente) |
| nível_automação | Próprio |
| preço | — |
| confiança | alta (vários fornecedores lidos) |
| fontes | [S2], [S5], [S6], [S12], [S13], [S23] (06/11/2026) |

### GES-407 · Criar e operar agentes próprios do escritório descritos em linguagem natural, com aprovação e trilha

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Gestão e Atendimento / Governança da IA e automação |
| etapa | Manutenção |
| atividade | Deixar o coordenador descrever uma rotina ("toda segunda, ver quem não mandou extrato e cobrar no tom X; se não responder em 3 dias, avisar o responsável"), gerar o plano executável, testar numa amostra, aprovar e rodar em toda a carteira ou num grupo, com escopo de ferramentas, nível de autonomia, trilha de cada ação e desligamento |
| descrição | Hoje cada automação nova depende do fornecedor ou de um robô contratado. Intuit, Xero, TaxDome e Canopy convergiram para o mesmo desenho: agente criado sem código, rodando em segundo plano por dias, com fila de revisão e trilha |
| gatilho_frequência | Por evento (rotina nova) e contínua (execução) |
| porte_alcance | Todos os setores |
| quem_faz | Coordenador / sócio / responsável pela governança da IA |
| base_legal | LGPD (art. 20, revisão de decisão automatizada, quando afetar pessoas); termos dos portais nas ações de nível C [NÃO VERIFICADO] |
| risco_se_falhar | Agente que age em massa errado (mensagem a toda a carteira, tarefa fechada sem evidência); ação em portal sem autorização do dono da credencial |
| concorrentes | Intuit Agent Studio (piloto) e Playbooks (beta), trilha única de ações da IA [S12]; Xero XeroForce (alpha: agentes em linguagem natural, segundo plano por dias ou semanas, ação em lote em toda a carteira, trilha) [S15]; TaxDome Atlas (tarefa salva como agente recorrente, buscador) [S10]; Canopy Coworker (descreve o resultado e ele monta o plano executável; fila de revisão) [S5]; Financial Cents (checklist de workflow por prompt; MCP) [S16]. No Brasil: HubStrom cria processo por IA (GES-206), Alterdata vende agentes prontos (B2) |
| hipótese_automação | Construtor que traduz a descrição em gatilho + passos + ferramentas permitidas (M1–M4) + nível de autonomia; modo ensaio numa amostra; execução com fila de aprovação; painel de agentes ativos e consumo |
| papel_da_ia | M1, M2, M3 e M4 conforme o escopo; rascunhar o plano; executar só o que o nível de autonomia permitir |
| ferramentas_agênticas | `criar_agente(descricao, escopo, autonomia)`, `ensaiar_agente(id, amostra)`, `ativar_agente(id)`, `trilha_agente(id, periodo)` |
| eventos_timesheet | `ges.ia.agente_criar`, `ges.ia.agente_executar`, `ges.ia.aprovar` |
| não_confundir_com | GES-206 (modelos de processo para pessoas), GES-062 (política do que a IA pode responder sozinha), GES-056 (registro do que a IA fez), GES-202 (MCP para IAs externas) |
| nível_automação | Próprio |
| preço | Referência: Agentic Books Close da Intuit será add-on pago depois do piloto [S12] |
| confiança | média (concorrentes ainda em piloto, alpha ou beta) |
| fontes | [S5], [S10], [S12], [S15], [S16] (06/11/2026) |

### CON-401 · Projetar o fluxo de caixa do cliente e acompanhar metas em pacote consultivo trimestral

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Consultoria e Reforma / Consultoria financeira |
| etapa | Manutenção |
| atividade | Montar, a partir do balancete do core, do extrato e dos tributos previstos, a projeção de caixa de 13 semanas e do ano, comparar com metas combinadas com o cliente, comparar com o setor quando houver base, e gerar o pacote da reunião com números conferidos |
| descrição | Hoje poucos escritórios fazem isso, em planilha e para poucos clientes; o "quanto posso retirar?" é respondido de cabeça. Xero entrega o Syft (previsão, health score) sem custo extra e a Intuit promete pacote consultivo agêntico com números conferidos no razão |
| gatilho_frequência | Mensal (atualização) e trimestral (reunião) |
| porte_alcance | Clientes com contabilidade completa e plano consultivo |
| quem_faz | Contador consultor / sócio |
| base_legal | — (consultoria; tributos projetados vêm das regras do M1/M3, inclusive a transição da reforma) |
| risco_se_falhar | Cliente sem caixa para tributos ou distribuição; perda do cliente para quem oferece consultoria |
| concorrentes | Intuit Agentic Advisory ("coming soon": pacotes com números verificados no razão, progresso contra metas, preparo da reunião) [S12]; Xero + Syft (previsão, consolidação, health score, grátis em planos elegíveis) [S14]; JAX (perguntas sobre caixa e benchmarking com dados externos) [S4]; Canopy (insights proativos) [S5]; Basis (agentes em CAS) [S11] |
| hipótese_automação | Projeção por regras (recorrências do extrato, contas a pagar e receber, tributos do M3) + revisão do contador; metas cadastradas; pacote em PDF e no app |
| papel_da_ia | M2 ler (balancete, extrato), M3 calcular (projeção e tributos), M1 (efeitos da reforma), rascunhar (comentários do pacote) |
| ferramentas_agênticas | `projetar_caixa(cliente, horizonte)`, `metas_cliente(cliente)`, `gerar_pacote_consultivo(cliente, trimestre)` |
| eventos_timesheet | `con.consultoria.pacote` |
| não_confundir_com | CTB-028 (relatórios gerenciais do realizado), CTB-029 (perguntas do cliente sobre resultado), GES-045 (pauta da reunião), CON-012 (calendário de retiradas) |
| nível_automação | F (balancete e lançamentos do core) + B (extrato por Open Finance, CTB-008/CTB-010) |
| preço | — |
| confiança | média |
| fontes | [S4], [S5], [S11], [S12], [S14] (06/11/2026) |

---

## 6. Fontes (consultadas em 06/11/2026)

- [S1] Karbon, "Karbon launches Kai, the AI coworker that knows your firm" (03/06/2026): https://karbonhq.com/resources/karbon-launches-kai/
- [S2] Karbon, "Karbon launches end-to-end tax workflows, AI innovations, and Practice Intelligence" (04/06/2025): https://karbonhq.com/resources/karbon-launches-tax-workflow-and-practice-intelligence/
- [S3] Karbon, página de IA: https://karbonhq.com/ai · [S3b] Karbon, preços: https://karbonhq.com/pricing/
- [S4] Xero, JAX: https://www.xero.com/us/jax/
- [S5] Canopy, página inicial (Coworker): https://www.getcanopy.com/ · [S5b] Canopy, preços: https://www.getcanopy.com/pricing
- [S6] Ignition, página inicial: https://www.ignitionapp.com/ · [S6b] Ignition Compliance (PLD/KYC): https://www.ignitionapp.com/product/aml-compliance · [S6c] Ignition WIP Billing: https://www.ignitionapp.com/product/wip-billing
- [S7] Ignition, scope creep: https://www.ignitionapp.com/scope-creep ; preços (valores não renderizados no HTML): https://www.ignitionapp.com/pricing
- [S8] Anchor, llms.txt (descrição oficial do produto, preços e comparações próprias com Ignition e GoProposal): https://www.sayanchor.com/llms.txt
- [S9] Ignition Price Insights: https://www.ignitionapp.com/product/price-insights
- [S10] TaxDome AI, Atlas, MCP e API: resumo do buscador das páginas https://taxdome.com/blog/webinar-recap-and-qa-summer-update-2026 e https://taxdome.com/blog/taxdome-ai (não lidas: Cloudflare) · comentário de concorrente: https://www.usecarly.com/blog/best-ai-automation-tools-taxdome/
- [S10b] Preços TaxDome (terceiros): https://www.capterra.com/p/186749/TaxDome/pricing/ e https://getuku.com/articles/taxdome-pricing/ (resumo do buscador)
- [S11] CPA Practice Advisor, "Basis Raises $100 Million to Deploy AI Agents for Accounting Firms" (24/02/2026): https://www.cpapracticeadvisor.com/2026/02/24/basis-raises-100-million-to-deploy-ai-agents-for-accounting-firms/178759/
- [S12] CPA Practice Advisor, "Intuit Connect 2026: AI Agents, a New Partner Program, and a Unified Platform" (nov/2026): https://www.cpapracticeadvisor.com/?p=193101
- [S12b] CPA Practice Advisor (conteúdo patrocinado da Intuit), "Introducing Intuit Accountant Suite" (20/11/2025): https://www.cpapracticeadvisor.com/2025/11/20/revolutionizing-your-firm-with-agentic-ai-introducing-intuit-accountant-suite/173562
- [S13] CPA Practice Advisor, "Startup Accrual Officially Launches with $75M" (05/02/2026): https://www.cpapracticeadvisor.com/2026/02/05/startup-accrual-officially-launches-with-75m-in-funding-to-bring-ai-native-automation-to-accounting/177600/
- [S14] Xero, "Xerocon Brisbane: Xero announces new features" (03/09/2025): https://www.xero.com/media-releases/xerocon-brisbane-xero-announces-new-features-to-drive-greater-growth-impact/
- [S15] TechIntelPro (reprodução do release Business Wire de 13/05/2026), "Xero introduces XeroForce": https://techintelpro.com/news/ai/agentic-ai/xero-introduces-xeroforce-natural-language-ai-agent-builder
- [S16] Financial Cents, IA e agentes: https://financial-cents.com/financial-cents-ai/
- [S17] Financial Cents, Capacity Management: https://financial-cents.com/capacity-management/ ; preços (valores não renderizados): https://financial-cents.com/pricing/
- [S19] Jetpack Workflow, página inicial: https://jetpackworkflow.com/ · [S20] Jetpack, preços: https://jetpackworkflow.com/pricing/
- [S21] Uku, página inicial: https://getuku.com/
- [S22] Senta, página inicial e preço: https://www.senta.co/
- [S23] Liscio, produto (página parcial) e resumo do buscador: https://liscio.me/product ; https://liscio.me/
- [S24] Pixie, página inicial: https://www.usepixie.com/
- [S25] Fieldguide, página inicial: https://www.fieldguide.io/
- [S26] Dext, página inicial: https://dext.com/en
- [S27] Hubdoc, página inicial: https://www.hubdoc.com/
- [S28] Digits, página inicial: https://digits.com/
- [S29] Resumos do buscador sobre Client Hub, Double (ex-Keeper), Soraban e Carly: https://info.clienthub.app/keeper-app-alternative-for-accounting-firms ; https://resources.rework.com/tools/ai-tools/best-ai-tools-for-accountants-2026 ; https://ycombinator.com/companies/soraban ; https://www.usecarly.com/blog/ai-assistant-for-accountants/
- Captações citadas só pelo buscador (não lidas): Ravical, seed de US$ 17 mi (29/10/2026) https://runtimewire.com/article/ravical-17m-accounting-ai ; Atlas, seed de US$ 6 mi (abr/2026) https://yourstory.com/2026/04/atlas-raises-seed-funding-round-led-by-stellaris-and-accel
- Referência interna: Pix Automático em [B1](B1-financeiro-escritorio.md), fontes [F12] e [F26].

### Buscas feitas (10)

1. accounting practice management AI agents 2026 Karbon TaxDome Canopy agentic · 2. AI agents for accounting firms startup 2026 raises funding · 3. TaxDome AI agents 2026 email triage client portal proposals · 4. Intuit QuickBooks Online Accountant AI agents 2026 · 5. Anchor proposals billing vs Ignition GoProposal 2026 · 6. Xero Practice Manager 2026 AI agents · 7. Accrual General Catalyst / Ravical / Atlas · 8. AI email inbox assistant for accounting firms 2026 · 9. TaxDome pricing 2026 · 10. Keeper, Liscio, Client Hub, FYI 2026.

### Lacunas para a Etapa 2

- Texto oficial do Pix Automático (BCB) e preço de mandato por PSP; assinatura eletrônica com API no fluxo de aceite (V3).
- Parecer de direito concorrencial para benchmark de honorários entre escritórios (GES-402).
- TaxDome: confirmar Atlas, MCP, organizers e "pay to unlock" em página oficial (site bloqueado por Cloudflare nesta sessão).
- Preços da Ignition e da Financial Cents (renderizados por script).
- Ravical, Atlas, Byron: o que fazem de fato.
- Situação atual do Xero Partner Hub (substituição do XPM) e da disponibilidade geral do XeroForce.

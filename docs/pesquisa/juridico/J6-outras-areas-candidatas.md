# J6. Outras áreas candidatas a pacote (corretora de seguros em profundidade e triagem de 10 áreas)

Data da pesquisa: 8/11/2026. Todas as consultas e leituras de página foram feitas nesta data ("acesso 8/11/2026"). Marcas usadas: **[confirmado]** (lido em fonte oficial ou página do fornecedor), **[secundária]** (imprensa ou terceiro, lido), **[autodeclaração]** (número ou promessa do próprio fornecedor, sem checagem independente), **[resumo de busca]** (aparece só no resumo do buscador, página não lida na íntegra), **[a confirmar]** (lacuna ou fonte fraca) e **[julgamento]** (avaliação nossa, não dado). Nenhum número de mercado foi inventado: onde a fonte não existe, está escrito "não obtido". As notas das seções 4 e 5 são julgamento nosso e estão rotuladas assim.

Contexto lido: `docs/Plano_Plataforma_do_Escritorio.md` (DA-02 e DA-02.1) e `docs/Desenho_do_Sistema.md`. Regra de corte usada em todo o texto: o que mais de um pacote precisa é **plataforma** (cadastro, tarefas, documentos, CRM/WhatsApp por setor, timesheet, financeiro do escritório, app do cliente, agentes); o que depende da área é **pacote** (catálogo de atividades, setores/abas, schema do perfil do cliente, calendário de obrigações, motor Legal com a base da área, conectores dos órgãos, integrantes padrão de agentes, modelos de texto). Para o contábil, a referência de tamanho já levantada no repositório é de **101.880 organizações contábeis** (CFC, exercício 2025; `pesquisa/05-mercado-preco.md`) **[confirmado]**.

---

## 1. Resumo executivo

1. **Corretora de seguros é um pacote viável e com mercado bem delimitado, mas o desenho tem uma armadilha central:** o sistema do corretor gira em torno do **multicálculo** (cotação simultânea em dezenas de seguradoras), que é uma integração pesada, já commoditizada em R$ 36 a R$ 98 por mês e vendida em pacote com a gestão por quatro grupos grandes. Entrar sem multicálculo próprio exige uma estratégia de convivência (importar apólices e comissões, vender a camada de IA, WhatsApp, renovação e conformidade) ou uma parceria de cotação **[julgamento]**.
2. **Porte (Susep, 3/11/2026):** 66.120 empresas corretoras e 87.053 corretores pessoa física com registro ativo; 170.071 registros no total (16.038 suspensos) **[secundária, dado da Susep via CQCS]**. Entre 80% e 90% das corretoras têm até 7 funcionários **[secundária, Fenacor/ESECS via Revista Apólice]**. Preço de lista dos concorrentes: R$ 187 a R$ 198 por mês por licença de gestão com multicálculo **[confirmado, sites dos fornecedores]**. Ou seja, muitas empresas e ticket baixo.
3. **Concorrência concentrada:** a Dimensa (hoje parte da Evertec) comprou a Quiver (2024, R$ 115 milhões) e a Agger (2025, R$ 260 milhões) e lançou o **ONE** em set/2026; a Segfy é controlada pela Porto; a Segura (IA no WhatsApp para corretoras) declara mais de 3.000 corretoras **[secundária/autodeclaração]**.
4. **Base normativa é modulável e está em movimento** (bom para vender atualização): Lei 15.040/2024 (marco legal do contrato de seguro, em vigor desde 11/12/2025, regulamentação da Susep pendente) e Resolução CNSP 493/2026 (corretores; vigência em 17/1/2027) **[secundária, texto oficial não lido]**.
5. **Ranking (julgamento, seção 5):** Jurídico 4,25; Consultorias SST/RH/ambiental 4,00 (nota de baixa confiança); **Corretora de seguros 3,70**; Arquitetura e engenharia 3,50; Imobiliárias, Despachantes e Administração de condomínios 3,40 (empate); Propriedade intelectual 3,35; Administradoras de benefícios 3,20; Consórcio e crédito 2,90; Clínicas 2,85; Cartórios 2,30.
6. **Ordem recomendada:** (1º) **Jurídico**, (2º) **Corretora de seguros** com a condição "sem construir multicálculo no v1", e (em paralelo, como validação barata) **SST/DP como extensão do Contábil**, porque tem a maior sinergia com a base de clientes atual e a nota depende de dados que ainda não temos. Detalhes e a comparação direta Jurídico x Seguros estão na seção 6.

---

## 2. Corretora de seguros em profundidade

### 2.1 Como o negócio funciona

Fontes de domínio: texto abaixo mistura conhecimento geral do setor (marcado **[domínio, validar em 5 a 8 entrevistas com corretoras]**) com o que foi confirmado nas páginas lidas.

**Papel.** O corretor é intermediário independente entre segurado e seguradora; a profissão é regida pela Lei 4.594/1964 e hoje pela Resolução CNSP 493/2026 **[secundária]**. Ele **não recebe o prêmio**: o cliente paga à seguradora, e a corretora recebe **comissão**, um percentual do prêmio, normalmente por parcela paga **[domínio]**. Faixas citadas por fontes de qualidade variável: cerca de 15% a 20% no auto, 25% a 40% em residencial e empresarial; uma fonte de 2021 cita 17% (auto), 25% (residencial) e 30% (empresarial) **[secundária; blogs e live do setor]** (ver fontes F14 e F15). Não há número oficial agregado de comissão no material lido: **[a confirmar]**.

**Produtos e ramos** **[domínio]**: automóvel, residencial, empresarial/condomínio, vida (individual e em grupo), saúde e odonto (regidos pela ANS, não pela Susep), transportes, responsabilidade civil, garantia, rural, previdência e capitalização, consórcio (em algumas corretoras). O multicálculo dos fornecedores cobre hoje **14 a 15 ramos** em **mais de 40 seguradoras** (Agger) e 18 seguradoras no multicálculo da Segfy em 2018 (dado antigo) **[autodeclaração]**.

**Ciclo de vida da apólice** **[domínio, com pontos confirmados]**:
1. **Prospecção e cotação:** o corretor digita os dados do risco **uma vez**, o multicálculo consulta as seguradoras e devolve preço e coberturas lado a lado. O que antes levava "30 a 40 minutos por seguradora" passa a levar minutos no total (Agger, **[autodeclaração]**).
2. **Proposta e emissão:** a seguradora aceita ou recusa; a apólice chega em PDF. Pela Lei 15.040/2024, há prazos para recusa expressa e o silêncio tem efeito (um prazo de 25 dias circula em fonte secundária, **[a confirmar no texto da lei]**).
3. **Endossos:** alterações no meio da vigência (troca de veículo, inclusão de cobertura, mudança de CEP) e cancelamentos. Pela Resolução CNSP 493/2026 (art. 21), em cancelamento de apólice ou devolução de prêmio a **comissão é restituída proporcionalmente** à seguradora **[confirmado em análise do Demarest]**.
4. **Cobrança e parcelas:** a cobrança é da seguradora (boleto, cartão, débito), mas a corretora acompanha atraso porque inadimplência pode cancelar a apólice e **estornar a comissão** **[domínio]**.
5. **Renovação:** a "mina" da carteira. Antecedência típica de 60 a 30 dias antes do fim da vigência para recotar e reemitir; seguradoras também renovam sozinhas, o que cria a disputa "renovar com a mesma ou recotar" **[domínio]**. O blog da Quiver cita "os maiores erros dos corretores na renovação" como tema recorrente **[resumo de busca]**.
6. **Sinistro:** aviso, regulação, vistoria, indenização. A corretora acompanha o cliente. A Lei 15.040 traz prazo máximo de pagamento de 30 dias, regulação com prazo e acesso do segurado aos documentos da regulação **[secundária]**. A Mapfre lançou em 2025 abertura de sinistro de auto por áudio/texto no WhatsApp com IA **[resumo de busca]**.
7. **Conciliação de comissões:** cada seguradora manda um **extrato** de comissões; a corretora confere contra as apólices emitidas. O Agger descreve "importação automática de documentos, como apólices e extratos de comissão, direto das seguradoras" **[autodeclaração]**.

**Distribuição.** Além de corretoras independentes, há **assessorias/hubs** que agregam corretores (a HUBSEGS declara mais de 5.000 corretores cadastrados) e vendem por WhatsApp com IA generativa **[resumo de busca]**.

**Remuneração adicional** (comissão contingente, agenciamento): tema jurídico em discussão **[resumo de busca, Conjur 2024]**; **[a confirmar]** antes de modelar.

### 2.2 Tamanho do mercado e porte das corretoras

| Indicador | Valor | Data | Fonte | Nível |
| --- | --- | --- | --- | --- |
| Registros de corretores (Susep) | 170.071 no total: 153.173 ativos, 16.038 suspensos, 860 cancelados | 3/11/2026 | [CQCS](https://cqcs.com.br/noticia/mercado-alcanca-marca-historica-de-170-mil-corretores-registrados/) (dado Susep) | [secundária, lida] |
| Empresas corretoras ativas | **66.120** | 3/11/2026 | idem | [secundária, lida] |
| Corretores pessoa física ativos | 87.053 | 3/11/2026 | idem | [secundária, lida] |
| Oscilação de empresas ativas | 65.839 (início de jul) para 64.794 (19/8): 2.242 empresas com registro suspenso ou cancelado em 3 meses | ago/2026 | [CQCS](https://cqcs.com.br/noticia/numero-de-empresas-corretoras-de-seguros-em-atividade-volta-a-cair/) | [secundária, lida] |
| Distribuição regional | SP 64.002, RJ 15.564, MG 13.897, PR 11.315, RS 8.998 (registros ativos, PF e PJ) | 3/11/2026 | CQCS (idem) | [secundária, lida] |
| Porte das corretoras | 80% a 90% têm até 7 funcionários, contando os corretores | 5ª edição ESECS (Fenacor), citada em 10/9/2026 | [Revista Apólice](https://revistaapolice.com.br/2026/09/quiver-e-agger-se-unem-em-nova-plataforma-da-dimensa/) | [secundária, lida] |
| Prêmios do setor segurador em 2025 | R$ 764,5 bi no total (inclui saúde suplementar, previdência e capitalização); Danos e Responsabilidades R$ 144,5 bi (+7,5%); Pessoas R$ 78,8 bi (+8,3%); Capitalização R$ 33,9 bi; Saúde Suplementar R$ 349,4 bi | 2025 | [Revista Apólice/CNseg](https://revistaapolice.com.br/2026/03/setor-segurador-movimenta-r-7645-bilhoes-em-2025/) | [secundária, lida] |
| Comissões pagas a corretores (agregado) | não obtido | | | [a confirmar] |
| Idade do corretor | um em cada três com mais de 55 anos (2025) | mar/2025 | [CQCS](https://cqcs.com.br/noticia/susep-a-cada-tres-corretores-um-tem-mais-de-55-anos/) | [resumo de busca] |

Leitura: o número de **empresas (66 mil)** é cerca de dois terços do número de organizações contábeis (101.880), mas o **porte é menor** e o ticket de sistema é baixo (seção 2.3). Aritmética ilustrativa, **não é estimativa de mercado**: 66.120 empresas x R$ 187 a R$ 198 x 12 meses dá cerca de R$ 148 a R$ 157 milhões por ano, **se toda corretora ativa pagasse uma licença única de lista**. Serve só para mostrar a ordem de grandeza do teto de receita de um sistema básico de corretora. Corretores pessoa física (87 mil) também podem ser clientes e aumentam a base potencial, mas exigem preço ainda menor.

### 2.3 Sistemas existentes, módulos e preços (acesso 8/11/2026)

| Sistema | Dono / origem | O que é | Preço de lista | Porte declarado | Nível |
| --- | --- | --- | --- | --- | --- |
| **ONE** (Quiver + Agger) | Dimensa, hoje da Evertec (Quiver comprada em 2024 por R$ 115 milhões; Agger em 2025 por R$ 260 milhões; Evertec concluiu a compra da Dimensa em abr/2026) | Gestão + multicálculo na mesma plataforma, 100% web: clientes, apólices, endossos, sinistros, comissões, fluxo de caixa, GED, funil de vendas, agenda e tarefas, relatórios, login por seguradora; mais de 40 seguradoras e 15 ramos | **R$ 198 por licença por mês**, teste de 15 dias, sem fidelidade ([Agger/preços](https://www.agger.com.br/precos)) | O site cita "mais de 62.000 usuários"; um blog da Agger diz "um terço dos corretores ativos", 16 mil clientes, 86 mil usuários | [confirmado] preço; [autodeclaração] porte |
| **Aggilizador** | Agger (Dimensa/Evertec) | Multicálculo, 100% web; 15 ramos, mais de 40 seguradoras; automação de cotações futuras, landing pages, registro de interações, agenda, dashboards | **R$ 98 por licença por mês** | idem | [confirmado] |
| **Quiver** (Quiver MULT, Quiver ON) | Dimensa/Evertec | Sistema de gestão, multicálculo (MULT) e venda digital/leads (ON); atende corretoras, seguradoras e instituições financeiras | não publicado nas fontes lidas; o ONE o absorve | | [resumo de busca] |
| **Sisweb** e **Painel do Corretor** | Agger | Sisweb: "solução completa em gestão de planos de saúde"; Painel do Corretor: "multicálculo de saúde" | não publicado | | [confirmado] (menu do site) |
| **Segfy Gestão** | Segfy (Porto, via fundo FIP Ventures, maior acionista desde 2021; 74,67% em notícia de 2021) | Apólices, sinistros, propostas, comissões, renovações, controle financeiro e parcelas em atraso, dashboards, multicálculo incluso | **R$ 187 por mês por assinatura**; usuários adicionais sob consulta | "mais de 6.000 parceiros" (site); "5.400 corretoras e 11 mil usuários ativos por dia" em notícia de 2025 | [confirmado] preço; [autodeclaração] porte |
| **Segfy Multicálculo** | idem | Multicálculo sob demanda, usuários ilimitados | **R$ 35,90 por mês com 50 cálculos** (excedente R$ 0,72); R$ 49,90 com 100; R$ 59,90 com 200 | | [confirmado] |
| **Segfy Vende** | idem | Cotação por IA no celular e WhatsApp: por voz, foto ou texto com três dados | **R$ 39 por 10 negócios** (R$ 3,90 por negócio); R$ 59 por 20; R$ 79 por 30 | | [confirmado] |
| Segfy (em breve) | idem | "Atendimento no WhatsApp" e "Carteira do corretor" marcados como "em breve" | | | [confirmado] (menu) |
| **Segura** (Sistema de Gestão + IA "Helena" + Conversas no WhatsApp) | Segura (startup; no WhatsApp AI Startups Hub da Meta) | Gestão com assistente de IA que acessa apólices, coberturas e condições gerais da Susep; atende cliente no WhatsApp oficial; parceria com a Bradesco Seguros ("Conecta") | não publicado | "mais de 3.000 corretoras" | [autodeclaração] (CQCS lida) |
| **Teleport** (TEx Tecnologia), **Seguro Link**, **Corretagem Fácil**, **SuperCálculo** (SICS), **Lojacorr/Agger**, **ADMSEG**, **Moshe** | vários | Multicálculos e gestões menores; lista de 2018 | não obtido | Teleport: "mais de 20.000 usuários" (2018) | [secundária, antiga] ([CQCS 2018](https://cqcs.com.br/noticia/corretores-apontam-sistemas-de-multicalculos-mais-usados/)) |
| CRMs genéricos usados por corretoras | Pipedrive, Agendor | O blog da Agger trata o CRM como ferramenta separada da gestão | Agendor tem página específica "CRM para corretoras de seguros" | | [resumo de busca] |
| **SIGA, Seguros Fácil, Corretor Online** | | **Não encontrados** em nenhuma fonte lida com esses nomes como sistemas de corretor | | | **[a confirmar]** (perguntar ao usuário ou em entrevista se o nome é outro) |

Três observações:
- **Consolidação.** Dois grupos (Dimensa/Evertec com Quiver + Agger; Porto com Segfy) e a Segura (IA) dominam as menções. A Dimensa descreve o problema que vende como "dados duplicados em softwares isolados" entre cotação e gestão (Fernando Rodrigues, Evertec) **[secundária]**.
- **Preço de entrada baixíssimo e sem fidelidade**, com teste de 15 dias. Isso limita a disposição de pagar por um "sistema de gestão" comum; só uma camada claramente diferente (IA, conformidade, app do cliente com marca) justifica ticket maior **[julgamento]**.
- **Multicálculo funciona assim** **[confirmado em blogs da Agger, parte autodeclaração]**: o corretor precisa estar registrado na Susep e ter **credenciais de login em cada seguradora**; as arquiteturas são "robô" (automação do portal), "webservice" (API da seguradora) ou híbrida. A integração por seguradora e por ramo é o fosso técnico.

### 2.4 Dores recorrentes

| Dor | Evidência | Nível |
| --- | --- | --- |
| **Retrabalho de digitação entre cotação, gestão, financeiro e comissões** | A Dimensa justifica o ONE por esse motivo | [secundária] |
| **WhatsApp desestruturado:** conversas, documentos e cotações espalhados em mensagens, sistemas e tarefas manuais | CEO da Segura | [autodeclaração] |
| **Renovação perdida** por falta de controle de vencimento e de abordagem a tempo | tema recorrente em blogs de Quiver e Agger | [resumo de busca] |
| **Conciliação de comissões** contra extratos de dezenas de seguradoras, agora com estorno proporcional obrigatório em cancelamento | Res. CNSP 493/2026, art. 21 | [secundária, Demarest] |
| **Manutenção do registro:** 16.038 registros suspensos em 170.071 (9,4%); 2.242 empresas ativas perdidas em três meses; a Res. 493 amplia requisitos para sócios e administradores e prevê recadastramento | CQCS, Sincor-SP | [secundária] |
| **Prazos novos da Lei 15.040** (proposta, regulação, 30 dias de pagamento de sinistro) | Revista Apólice, Lockton | [secundária] |
| **Cotação lenta** (30 a 40 minutos por seguradora sem multicálculo) | Agger | [autodeclaração] |
| **Pouca transparência de comissão** (estudo da FGV: 92% das corretoras de seguro empresarial não divulgam a comissão) | [resumo de busca] | [a confirmar] |

### 2.5 Base normativa modulável (candidata a "Legal: Seguros")

| Norma ou conjunto | Por que importa | Status verificado |
| --- | --- | --- |
| **Lei 15.040/2024** (marco legal do contrato de seguro; 134 artigos; revoga arts. 757 a 802 do Código Civil e parte do DL 73/1966) | Prazos de proposta, regulação e pagamento; interpretação a favor do segurado; prescrição; acesso a documentos; papel do corretor | Vigência em 11/12/2025 e conteúdo segundo [Revista Apólice](https://revistaapolice.com.br/2025/07/a-nova-lei-15-040-2024-e-a-reconstrucao-das-relacoes-no-brasil/), [Lockton](https://global.lockton.com/br/pt/noticia/impactos-e-pontos-de-atencao-sobre-a-nova-lei-de-seguros) e [FAQ do Sindseg-SC](https://sindsegsc.org.br/arquivo/publicacao/224/documento/faq_lei_15040_2024.pdf); **texto no Planalto não foi lido (a página não carregou)**: **[a confirmar]** |
| **Resolução CNSP 493/2026** (consolida 13 normas; registro único nacional, autorreguladoras, habilitação plena e específica, prepostos, requisitos para administradores, comissão restituída em cancelamento) | Habilitação e regularidade da corretora; comissões | Publicada no DOU em 21/7/2026; vigência em **17/1/2027** segundo [Demarest](https://www.demarest.com.br/susep-consolida-marco-regulatorio-dos-corretores-de-seguros-e-reforca-autorregulacao-e-educacao-continuada/) e [Sincor-SP](https://legismap.com.br/conteudos/artigos-e-noticias/sincor-sp-resolucao-cnsp-493-2026-o-que-as-corretoras-de-seguros-precisam-observar); texto oficial: **[a confirmar]** |
| **Lei 4.594/1964 e DL 73/1966** | Profissão e Sistema Nacional de Seguros Privados | [resumo de busca] (Câmara dos Deputados); **[a confirmar]** vigência de cada artigo após as Leis 15.040 e Res. 493 |
| **CDC (Lei 8.078/1990)** | Aplica-se à relação com o segurado consumidor | conhecimento de domínio; **[a confirmar]** por ramo |
| **LGPD (Lei 13.709/2018)** | Dados pessoais e sensíveis (saúde em vida e saúde); a Segfy e a Agger têm páginas próprias de LGPD | [confirmado] que os fornecedores tratam o tema |
| **Open Insurance** (Resolução CNSP 415/2021 e Circular Susep 635/2021; Manual de APIs v1.2) | Compartilhamento de dados com consentimento; revisão é prioridade do plano de regulação da Susep em 2026, com resultados práticos esperados a partir de 2027; só a Guru SPOC e a Open Power tinham autorização para corretores até abr/2026 | [resumo de busca] ([CQCS 18/9/2026](https://cqcs.com.br/noticia/open-insurance-avanca-em-2026-e-pode-transformar-atuacao-dos-corretores/) foi lida; o restante vem do Let's Money e do Manual da Susep); **[a confirmar]** |
| **Condições gerais e produtos registrados na Susep** | É o "texto da lei" de cada contrato (por seguradora e produto) | A Segura já usa "condições gerais da Susep" como base da IA ([CQCS](https://cqcs.com.br/noticia/segura-leva-ia-operacional-para-o-whatsapp-dos-corretores-de-seguros/), lida) |
| **Normas de prevenção à lavagem de dinheiro (Susep)** | Obrigação de corretores | Mencionado na pauta do CQCS Inovação 2026 (Núclea); **[a confirmar]** a norma exata |
| **Saúde suplementar** (Lei 9.656/1998 e RNs da ANS) | Ramo saúde é regulado pela ANS, e a Lei 15.040 não altera a 9.656 | [resumo de busca]; **[a confirmar]** |
| **Tributos da corretora** (ISS sobre corretagem, regime tributário) | Pode dialogar com o pacote Contábil | **[a confirmar]**; não pesquisado |

Diferença importante para o motor Legal do contábil: aqui há **duas camadas**, a lei (finita, atualizada por poucas normas) e **as condições gerais por produto** (corpus grande, de terceiros, com muita variação e direitos autorais a verificar). A segunda camada é a que dá valor operacional ("a apólice do João cobre isso?"). **[julgamento]**

### 2.5.1 Superfícies de integração

- **Seguradoras:** credenciais por seguradora, webservice ou robô. Não obtivemos documentação pública de API por seguradora **[a confirmar]**.
- **Susep:** a Susep publica o **Painel de Corretores** (dados estatísticos) e um documento técnico de **API de consulta de corretores** para empresas (consulta por CPF e download completo em zip); credenciais e escopo não confirmados **[resumo de busca; a confirmar]** ([instruções da Susep](https://www.gov.br/susep/pt-br/arquivos/arquivos-licenciamento/corretor-de-seguros/empresa-consulta-api-corretores-instrucoes.pdf), [notícia do painel](https://okai.com.br/noticia/2023-10-05/susep-lanca-novo-painel-de-corretores)).
- **WhatsApp:** a Meta incluiu em out/2025 regra de "Provedores de IA" na API do WhatsApp Business, com vigência anunciada em 15/1/2026, que barra **chatbots de IA de uso geral**; atendimento ao cliente de uma empresa continua permitido. O CADE mandou suspender a regra no Brasil; o status atual deve ser conferido **[resumo de busca; a confirmar]** ([Olhar Digital](https://olhardigital.com.br/2025/10/18/pro/whatsapp-business-vai-proibir-chatbots-de-ia-entenda/), [Exame](https://exame.com/tecnologia/whatsapp-volta-atras-e-deixa-que-empresas-brasileiras-usem-ias-para-atender-clientes/), [Startups](https://startups.com.br/negocios/cade-manda-meta-suspender-regra-que-barra-chatbots-de-ia-no-whatsapp/)). Nosso uso (agente de atendimento de uma corretora com seus clientes) está no lado permitido, mas conferir os termos vigentes.
- **Boletos e pagamentos:** a corretora quase não emite cobrança de prêmio (quem cobra é a seguradora); o boleto entra só no financeiro próprio (honorários de consultoria, se houver) **[domínio]**.

### 2.6 Como IA e agentes ajudariam (e onde NÃO podem decidir sozinhos)

| Agente (integrante do Time) | O que faz | Valor | Limite / controle humano |
| --- | --- | --- | --- |
| **Renovação** | Varre a carteira, identifica vencimentos (90/60/30 dias), abre tarefa, abre conversa no WhatsApp, coleta mudanças de risco, aciona cotação e monta comparativo | Mais renovações e menos "esquecimento"; atende a dor 3 | Corretor aprova a proposta; a IA não "fecha" |
| **Cotação** | Coleta dados por chat/voz/foto e preenche cotação (o Segfy Vende e a HUBSEGS já fazem) | Velocidade no primeiro contato | Sem validação humana, a IA não deve prometer cobertura nem emitir cotação (Sindsegnne, via CQCS) |
| **Sinistro** | Guia o aviso, confere cobertura contra apólice e condições gerais, controla prazos legais (Lei 15.040), avisa o corretor | Reduz erro de orientação; usa a base de leis | Parecer de cobertura é sempre do corretor/regulador; a IA mostra a cláusula e o prazo, não decide |
| **Cobrança e parcelas** | Alerta de parcela em atraso (risco de cancelamento e estorno de comissão) e lembrete ao cliente | Preserva comissão | Mensagens com tom e janela de horário (CDC) **[a confirmar]** |
| **Atendimento 24 h (2ª via, carteirinha, dúvida de cobertura)** | Responde ancorado na apólice e nas condições gerais, com citação | Libera o time (caso Segura/Bradesco Conecta: 98,61% dos ~3.400 acionamentos de mai/2026 atendidos por IA supervisionada, **[autodeclaração/secundária]**) | Escala para humano em caso complexo |
| **Comissões e conciliação** | Casa extrato de comissão com apólices, detecta comissão faltante e estorno proporcional | Receita recuperada; usa o componente Financeiro com titular = corretora | Revisão humana dos ajustes |
| **Conformidade** | Calendário do registro, recadastramento, prepostos, capacitação dos administradores (Res. 493) | Evita suspensão | Alertas, não decisão |
| **Carteira e cross-sell** (futuro) | Aponta lacunas de cobertura; com Open Insurance e consentimento, enxerga seguros em outras seguradoras | Venda consultiva | Depende de regulação e autorização **[a confirmar]** |

Os números de ganho de renovação (25% a 35%) que circulam vêm de um fornecedor de chatbots (Aurora Inbox) sem fonte independente e **não devem ser usados** **[a confirmar]**.

### 2.7 O que da plataforma comum serve e o que seria pacote

| Peça da plataforma | Serve? | Observação |
| --- | --- | --- |
| Cadastro único de clientes (PF e PJ) | Sim | Perfil por pacote: veículos, imóveis, vidas, bens |
| Tarefas e calendário | Sim | Renovações, vencimentos, parcelas, sinistros em aberto |
| Documentos e pastas | Sim | Apólices, endossos, propostas, vistorias; extração de dados do PDF da apólice é o ponto técnico |
| CRM e WhatsApp por setor | **Sim, e é o centro do valor** | Funil de cotação, renovação, pós-venda |
| Timesheet automático | **Pouco** | Corretora raramente apura horas por cliente; fica opcional |
| Financeiro do escritório | **Só em parte** | Corretora recebe comissão **da seguradora, por parcela, com estorno**, não honorário mensal do cliente; exige componente novo "Comissões" (receitas a receber com titular = seguradora e regra de estorno proporcional) |
| App do cliente com marca branca | Sim | Carteirinha, 2ª via, aviso de sinistro, vencimentos; a Segfy tem "Carteira do corretor" em breve |
| Time de agentes e motor de raciocínio | Sim | Seção 2.6 |
| **Pacote Seguros (específico)** | | Catálogo de ramos e produtos; schema da apólice (segurado, risco, coberturas, vigência, prêmio, parcelas, comissão); cálculo de comissão e estorno; conectores de seguradoras (cotação e extrato); consulta Susep; modelos de mensagem; calendário de renovação; motor Legal com Lei 15.040, Res. 493 e condições gerais; integrantes padrão |

---

## 3. Triagem de 10 outras áreas candidatas

Regras de leitura: os "números de empresas" só entram quando achei fonte; senão aparece "não obtido". O julgamento sobre aderência, intensidade de documentos/prazos e valor da IA é nosso **[julgamento]**.

### 3.1 Imobiliárias (venda e locação)

- **Tamanho:** 74 mil empresas imobiliárias e mais de 650 mil corretores de imóveis no Sistema Cofeci-Creci **[secundária, lida]** ([Paraíba Business](https://paraibabusiness.com.br/diretoria-do-cofeci-toma-posse-para-novo-trienio-2025-2027/)); outra fonte fala em 70 mil **[resumo de busca]**.
- **Como se organizam:** imobiliárias pequenas, com corretores autônomos; administração de locação (repasse ao proprietário, boleto, reajuste, garantias) é a atividade recorrente.
- **Sistemas dominantes:** Kenlo, Jetimob, Superlógica Imobiliárias (R$ 229 por mês de entrada), iMobzi (R$ 129 por mês, com versão gratuita), Imobia (R$ 210 por mês); a Simbo CRM foi incorporada à Superlógica **[secundária, agregador B2BStack]** ([comparativo](https://www.b2bstack.com.br/compare/superlogica-imobiliarias-vs-kenlo)). Kenlo e Jetimob não publicam preço.
- **Plataforma serve:** cadastro, tarefas, documentos (contratos, vistorias), CRM com WhatsApp (funil de venda e leads), financeiro (taxa de administração), app do cliente (proprietário e inquilino). **Pacote:** portais de anúncio, contrato de locação, repasse, DIMOB e IR do locador, vistoria, garantias.
- **Base normativa:** Lei do Inquilinato (8.245/1991), Código Civil, Lei 6.530/1978 (corretor), distrato (Lei 13.786/2018) **[domínio; a confirmar]**.
- **Documentos e prazos:** altos (contratos, reajustes, vencimentos). **Valor da IA:** médio (minuta de contrato, cálculo de reajuste, cobrança, atendimento a inquilino). **Riscos:** CRECI e responsabilidade da corretagem; **concorrência:** alta e madura.

### 3.2 Administradoras de condomínios

- **Tamanho:** o Censo Condominial 2026 (uCondo) mapeia **327 mil empreendimentos** e cerca de 39 milhões de moradores **[secundária, lida]** ([EM](https://www.em.com.br/mundo-corporativo/2026/08/7474336-censo-2026-revela-dados-do-mercado-condominial-brasileiro.html)). Número de administradoras: "cerca de 5.000" (SíndicoNet, texto antigo de 2011) e "4.467" (guia de prospecção de 2026, metodologia desconhecida) **[a confirmar; não usar como dado]**.
- **Como se organizam:** muitas administradoras pequenas e familiares; existem redes (BRCondos "maior rede de administradoras") **[resumo de busca]**; cobrança típica de 5% a 7% da arrecadação (dado de 2011, **[a confirmar]**).
- **Sistemas:** Superlógica Condomínios (afirma ser o mais usado, **[autodeclaração]**), Condomínio21 (Group Software), Alterdata Immobile Condomínio **[resumo de busca]**.
- **Plataforma serve:** cadastro (condomínios, unidades, moradores), tarefas, documentos (atas, convenções), CRM/WhatsApp, financeiro (cobrança de cotas), app do morador. **Pacote:** orçamento e prestação de contas, assembleia, inadimplência, medição, folha de zelador (com sinergia Contábil/DP).
- **Base normativa:** Código Civil arts. 1.331 e seguintes, Lei 4.591/1964, convenção e regimento de cada condomínio (**documentos do cliente como fonte**), Lei 14.309/2022 (assembleia virtual) **[domínio; a confirmar]**.
- **IA:** alta (responder "o regimento permite?", minutas de ata, mediação; o censo uCondo cita IA na mediação de conflitos, **[secundária]**). **Concorrência:** forte e específica. **Esforço:** alto (cobrança bancária, boleto com remessa, prestação de contas).

### 3.3 Clínicas e consultórios

- **Tamanho:** não obtido em âmbito nacional (CNES/DATASUS é a fonte; exemplo: Bahia com 23.094 cadastros de estabelecimentos de saúde em out/2025, entre públicos e privados **[secundária]**).
- **Sistemas:** Feegow (comprada pela Doctoralia), iClinic, outros **[resumo de busca]**; preços não obtidos.
- **Plataforma serve:** agenda e calendário (do núcleo), CRM/WhatsApp (confirmação de consulta), financeiro, app do paciente. **Pacote:** prontuário eletrônico, TISS/faturamento de convênios, receituário, CFM/CRM, LGPD de dado sensível de saúde.
- **Base normativa:** CFM, ANS (TISS), Anvisa, LGPD **[domínio; a confirmar]**. **IA:** média, mas com risco alto (saúde, responsabilidade médica). **Concorrência:** muito alta; **esforço:** muito alto. Documentos e prazos: baixa a média.

### 3.4 Escritórios de arquitetura e engenharia (e topografia)

- **Tamanho:** o CAU teria **44,8 mil empresas de arquitetura** registradas em 2025, quase o dobro de sete anos antes (23,9 mil em 2018) **[secundária; origem CAU não localizada]**; cerca de 75% dos escritórios com até cinco funcionários, número de uma startup do setor **[a confirmar]**. Engenharia: Crea-SP sozinho com cerca de 95 mil empresas registradas e 370 mil profissionais (texto sem data) **[a confirmar]**; total nacional não obtido.
- **Plataforma serve (muito):** cadastro, tarefas por projeto/etapa, documentos e pastas por obra, **timesheet por projeto**, financeiro (honorário por etapa), app do cliente com aprovações. **Pacote:** ART/RRT, aprovação em prefeitura, fases de projeto (estudo preliminar, anteprojeto, executivo), medição de obra, BIM **(não)**.
- **Base normativa:** normas ABNT, códigos de obras e planos diretores **municipais** (fragmentado), Lei 14.133/2021 para contratos públicos **[domínio; a confirmar]**. **IA:** média (verificar parâmetros urbanísticos, checklist de aprovação). **Concorrência:** não pesquisada (**[a confirmar]**); sistemas de obra e ERPs de construção existem.

### 3.5 Despachantes e assessoria documental

- **Tamanho:** sem número nacional atual; dados antigos (PNAD 2009: 28.340; RAIS 2010: 9.836) **[resumo de busca, desatualizado]**. Regulado por **Detran estadual** (cadastro, credenciamento, portarias próprias).
- **Sistemas:** acesso a sistemas do Detran por empresas homologadas (ex.: "Sistema Atende Multiempresas" na Bahia; GEP no RS) **[resumo de busca]**; sistemas de gestão de mercado: não obtidos.
- **Plataforma serve (muito):** documentos, tarefas, prazos, cobrança de taxas e reembolso, WhatsApp. **Pacote:** processos por tipo (transferência, licenciamento, CNH, emplacamento), tabela de taxas por UF, integração com cada Detran (difícil e fragmentada).
- **Base normativa:** CTB, resoluções do Contran e portarias dos Detrans **[domínio; a confirmar]**. **IA:** média; **concorrência:** baixa e fragmentada; **mercado:** pequeno e sem dado.

### 3.6 Consultorias de RH, SST e ambiental

- **Tamanho:** número de consultorias não obtido. A demanda é regulatória: a NR-01 passou a exigir gestão de riscos psicossociais no PGR, com fiscalização a partir de **26/5/2026** (período educativo de 12 meses, Portaria MTE 765/2025) segundo fontes de jan/2026 **[secundária]** ([Pessoa e Pessoa](https://pessoaepessoa.com.br/insights/atualizacao-da-nr-01-gestao-de-riscos-psicossociais-passa-a-ser-obrigatoria-a-partir-de-maio-de-2026/), [FINDES](https://findes.com.br/wp-content/uploads/2026/01/Informe-Estrategico-–-Inicio-da-fiscalizacao-da-NR-01-sobre-fatores-psicossociais-relacionados-ao-trabalho.pdf)); a data já passou e o status de nova prorrogação deve ser conferido **[a confirmar]**.
- **Sistemas dominantes:** não pesquisados **[a confirmar]**.
- **Plataforma serve (muito):** cadastro de empresa cliente e funcionários, tarefas com vencimento (exame periódico, treinamento, laudos), documentos (PGR, PCMSO, LTCAT, ASO), timesheet (visitas), financeiro (contrato de assessoria), app do cliente (vencimentos), CRM. **Pacote:** modelos de laudo, matriz de risco, eventos de SST do eSocial, calendário de NRs.
- **Base normativa:** NRs (MTE), CLT, eSocial; texto público, finito e modular. **IA de raciocínio:** **muito alta** (qual NR se aplica, que risco falta no PGR, qual evento do eSocial). **Sinergia:** forte com o Contábil (Departamento Pessoal) e com o futuro Jurídico trabalhista. **Risco:** responsabilidade técnica de profissional habilitado; a IA não assina laudo.

### 3.7 Corretores de crédito e consórcio

- **Tamanho:** Sistema de Consórcios com 12,76 milhões de consorciados ativos em dez/2025 (+13,8%), 5,16 milhões de cotas vendidas em 2025 e mais de R$ 500 bilhões em créditos comercializados **[secundária, resumo de busca]** ([ABAC via Legismap](https://legismap.com.br/conteudos/artigos-e-noticias/anuario-abac-2026-baixe-os-numeros-do-sistema-de-consorcios-em-2025)); número de administradoras e de corretores de consórcio: não obtido.
- **Plataforma serve:** CRM/WhatsApp (funil de vendas), cadastro, documentos, financeiro (comissões). **Pacote:** simulação de cotas, regras da administradora, assembleias/lances.
- **Base normativa:** Lei 11.795/2008 e circulares do Banco Central **[domínio; a confirmar]**. **IA:** média (simulação, objeções); **concorrência:** não pesquisada.

### 3.8 Escritórios de marcas e patentes (propriedade intelectual)

- **Tamanho:** o INPI recebeu cerca de **505 mil pedidos de marca em 2025**, recorde **[resumo de busca]** ([ABC da Comunicação](https://www.abcdacomunicacao.com.br/?p=338442)); número de agentes da propriedade industrial: não obtido (ABAPI, em 2010, falava em "centenas" **[resumo de busca, antigo]**). Decisões judiciais já dispensaram o advogado/agente para depositar marca e patente **[resumo de busca; a confirmar a situação atual]**.
- **Plataforma serve (muito):** prazos (ofício, anuidade, oposição), documentos, financeiro, app do cliente, timesheet. **Pacote:** integração com a Revista da Propriedade Industrial (RPI), régua de prazos do INPI, anuidades, internacionalização.
- **Base normativa:** Lei 9.279/1996 e atos do INPI **[domínio; a confirmar]**. **IA:** alta (análise de colidência, exigências, prazos). **Mercado:** pequeno e de ticket alto; concorrência de software especializado (não pesquisada).

### 3.9 Cartórios

- **Tamanho:** cerca de 12,5 mil serventias (relatório Cartório em Números da Anoreg/BR, com dados até 2024); outras fontes citam 13,4 mil e 15 mil **[secundária, resumo de busca]** ([TJMA](https://www.tjma.jus.br/midia/portal/noticia/516375/estudo-revela-impacto-dos-cartorios-na-desjudicializacao-de-demandas-sociais), [Migalhas](https://www.migalhas.com.br/depeso/438855/extrajudicializacao-um-novo-e-eficiente-acesso-a-justica-multiportas)).
- **Sistemas:** não obtidos (sistemas próprios, homologados, integrados a selos, centrais e CNJ). **Aderência baixa** (a operação é o ato registral); **pacote** exigiria o núcleo do cartório. **Base normativa:** Lei 8.935/1994, Lei 6.015/1973, Código Nacional de Normas do CNJ **[domínio; a confirmar]**. **Risco regulatório e concorrência:** muito altos. Não recomendado.

### 3.10 Administradoras de benefícios (saúde) e corretoras de saúde

- **Tamanho:** 53,1 milhões de beneficiários de planos de saúde em set/2026, dos quais 44,5 milhões em planos coletivos (38,7 milhões empresariais) **[secundária, resumo de busca]** ([EM](https://www.em.com.br/mundo-corporativo/2026/07/7469968-planos-de-saude-superam-53-milhoes-de-beneficiarios.html)); número atual de administradoras de benefícios: não obtido (114 em 2009-2016, **[resumo de busca, histórico]**).
- **Sistemas:** **Sisweb** (Agger, "gestão de planos de saúde") e **Painel do Corretor** (multicálculo de saúde) **[confirmado no site]**.
- **Plataforma serve:** cadastro de empresas e vidas, tarefas, documentos, CRM/WhatsApp, financeiro (cobrança de mensalidade e comissões), app do beneficiário. **Pacote:** movimentação de vidas, reajuste, carência, integração com operadoras.
- **Base normativa:** Lei 9.656/1998 e RNs da ANS (RN 196/2009 trata de administradoras) **[resumo de busca; a confirmar]**. **Melhor tratado como ramo "Saúde" dentro do pacote Seguros** do que como pacote separado **[julgamento]**.

### 3.11 Nota: gestão de frota e licenciamento

Não pesquisada por falta de saldo de buscas; o tema se sobrepõe à área de despachantes (3.5) e ao ramo de seguro auto. **[a confirmar]** antes de qualquer decisão.

---

## 4. Tabela-resumo da triagem

| Área | Nº de empresas (fonte) | Concorrência principal | Docs e prazos | Valor da IA de raciocínio | Base legal modulável |
| --- | --- | --- | --- | --- | --- |
| Corretora de seguros | **66.120** empresas + 87.053 PF ativos (Susep) | ONE (Quiver+Agger), Segfy, Segura | Média | Alta | Alta (Lei 15.040, Res. 493, condições gerais) |
| Imobiliárias | 74 mil [secundária] | Kenlo, Jetimob, Superlógica | Alta | Média | Alta |
| Adm. de condomínios | 327 mil condomínios; adm. não obtido | Superlógica, Condomínio21 | Alta | Alta | Alta |
| Clínicas | não obtido | Feegow, iClinic | Média | Média | Baixa (dado sensível, CFM, ANS) |
| Arquitetura e engenharia | 44,8 mil (CAU, PJ de arquitetura) [secundária] | não pesquisada | Alta | Média | Média (municipal) |
| Despachantes | não obtido | fragmentada | Alta | Média | Média (por UF) |
| Consultorias SST/RH/ambiental | não obtido | não pesquisada | Alta | **Muito alta** | **Muito alta** (NRs, eSocial) |
| Consórcio e crédito | não obtido | não pesquisada | Média | Média | Média |
| Propriedade intelectual | não obtido (505 mil pedidos de marca) | não pesquisada | **Muito alta** | Alta | Alta |
| Cartórios | cerca de 12,5 mil a 15 mil | sistemas homologados | Alta | Média | Alta, mas fechada |
| Adm. de benefícios | não obtido | Sisweb (Agger) | Média | Média | Alta |

---

## 5. Ranking com nota

**Critérios (nota de 1 a 5, 5 = melhor para nós) e pesos** [julgamento]: aderência à plataforma comum 25%; tamanho de mercado 20%; valor da IA de raciocínio 20%; base legal modulável 15%; concorrência (5 = pouca) 10%; esforço do pacote (5 = pouco esforço) 10%.

| # | Área | Aderência | Mercado | IA | Base legal | Concorrência | Esforço | **Nota** | Confiança |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | **Jurídico** | 5 | 5 | 5 | 4 | 2 | 2 | **4,25** | Média (números e concorrência vêm das outras frentes J1 a J5; aqui: 1,3 milhão de advogados em guia comercial, **[a confirmar]**) |
| 2 | Consultorias SST/RH/ambiental | 5 | 2 | 5 | 5 | 3 | 3 | **4,00** | **Baixa** (mercado e concorrência não obtidos; mercado já rebaixado para 2 por prudência) |
| 3 | **Corretora de seguros** | 4 | 4 | 4 | 4 | 2 | 3 | **3,70** | **Alta** (mais dados verificados; esforço 3 só se o v1 não construir multicálculo) |
| 4 | Arquitetura e engenharia | 5 | 3 | 3 | 3 | 3 | 3 | 3,50 | Baixa |
| 5 | Imobiliárias | 4 | 4 | 3 | 4 | 2 | 2 | 3,40 | Média |
| 5 | Despachantes | 5 | 2 | 3 | 3 | 4 | 3 | 3,40 | Baixa |
| 5 | Adm. de condomínios | 4 | 3 | 4 | 4 | 2 | 2 | 3,40 | Média |
| 8 | Propriedade intelectual | 5 | 1 | 4 | 4 | 2 | 3 | 3,35 | Baixa |
| 9 | Adm. de benefícios | 4 | 2 | 3 | 4 | 3 | 3 | 3,20 | Baixa |
| 10 | Consórcio e crédito | 3 | 3 | 3 | 3 | 3 | 2 | 2,90 | Baixa |
| 11 | Clínicas e consultórios | 3 | 5 | 3 | 2 | 1 | 1 | 2,85 | Média |
| 12 | Cartórios | 2 | 2 | 3 | 4 | 1 | 1 | 2,30 | Média |

(Cálculo conferido por script; com mercado = 3 para SST a nota seria 4,20. O ranking entre Jurídico, SST e Seguros muda pouco com um ponto de variação; o que decide é a confiança.)

**Leitura.** Três blocos: (a) **Jurídico e SST** têm aderência e IA máximas; (b) **Seguros** é o único com dados sólidos de mercado e preço, mas entra em concorrência concentrada e com ticket baixo; (c) as demais áreas ou têm concorrência madura (imobiliárias, condomínios, clínicas), ou mercado pequeno (PI, despachantes, benefícios), ou barreira regulatória de fechamento (cartórios).

---

## 6. Comparação explícita: Jurídico x Corretora de seguros (as duas primeiras apostas depois do Contábil)

| Dimensão | Jurídico | Corretora de seguros |
| --- | --- | --- |
| Natureza do trabalho | Serviço por horas e por processo, com **prazos processuais fatais** e documentos | Distribuição e relacionamento de **carteira recorrente**, com **renovações** e comissões |
| Timesheet e financeiro de honorários (núcleo) | **Encaixa direto** (honorários, horas, rentabilidade) | **Encaixa pouco**: precisa de componente de comissões com estorno |
| Documentos e prazos | Muito altos (petições, publicações, audiências) | Médios (apólices, vencimentos, prazos de sinistro) |
| CRM e WhatsApp por setor | Útil | **Central** (cotação e renovação por WhatsApp) |
| IA de raciocínio sobre base de leis | Muito alta, mas o corpus (leis + jurisprudência + doutrina) é vasto e o risco de erro tem custo alto | Alta e **mais delimitada** (poucas leis novas + condições gerais), com guarda-corpos claros (não prometer cobertura) |
| Tamanho | 1,3 milhão de advogados inscritos (guia comercial; **[a confirmar na OAB]**); número de escritórios: não obtido | 66.120 empresas + 87.053 PF ativos (Susep) |
| Ticket de referência | Definido nas frentes J (outras); aqui não pesquisado | Lista de R$ 187 a R$ 198 por licença/mês; multicálculo avulso R$ 36 a R$ 98; IA por negócio R$ 3 a R$ 4 |
| Concorrência | Software jurídico maduro (frentes J1 a J5; aqui **[a confirmar]**) | Concentrada em Dimensa/Evertec e Porto/Segfy, com IA de Segura e outros |
| Fosso técnico do incumbente | Publicações, tribunais e prazos | **Multicálculo** (credenciais e integração por seguradora) |
| Base normativa em movimento | Constante, mas difusa | **Concentrada e datada**: Lei 15.040 em vigor desde dez/2025 e Res. 493 a partir de 17/1/2027 |
| Esforço de pacote | Alto (prazos, publicações, tribunais) | Médio a alto (extração de apólices, extrato de comissão, cotação via parceiro) |
| Sinergia com o Contábil (DA-02.1) | Alta (mesmo escritório pode ter os dois; trabalhista/tributário) | Baixa a média (contabilidade raramente vende seguro; cross-sell de seguro ao cliente PJ é possível) **[julgamento]** |
| Risco regulatório | OAB (ética, captação, publicidade), segredo profissional, LGPD **[a confirmar nas frentes J]** | Susep (Res. 493), LGPD, regras de comissão; dados sensíveis |

**Recomendação.**
1. **Jurídico primeiro.** Maior aderência ao núcleo já planejado (timesheet, honorários, prazos, documentos) e maior valor de IA; a decisão depende do veredito das frentes J1 a J5 sobre concorrência e esforço de prazos/publicações.
2. **Seguros segundo, com condição de escopo:** v1 **sem multicálculo próprio**, vendendo (i) carteira e renovação com agentes no WhatsApp, (ii) conciliação de comissões, (iii) conformidade com a Res. 493 e a Lei 15.040, (iv) app do cliente com carteirinha e aviso de sinistro. Cotação via **parceria** (ex.: o multicálculo avulso da Segfy custa R$ 35,90 e tem usuários ilimitados, o que sugere que existe espaço de parceria ou de revenda) ou integração por link. Parceria com Segfy (Porto) ou Agger (Evertec) é **[a confirmar]**; são concorrentes diretos de gestão.
3. **SST/DP como "módulo-ponte" do Contábil**, não como pacote próprio ainda: é a área que mais combina com a base de clientes atual e com o motor de leis, mas a evidência de mercado é a mais fraca; valide com 5 a 8 entrevistas antes de dar nota final.
4. **Imobiliário/condomínios e PI** ficam na fila; clínicas e cartórios não recomendados por esforço e concorrência.

Por que Seguros e não SST em 2º lugar, apesar da nota: a nota de SST tem confiança baixa; a de Seguros é a mais bem fundamentada. Se a validação de SST confirmar mercado e concorrência fraca, SST pode subir sem refazer a plataforma (é extensão do DP do pacote Contábil, DA-02.1).

---

## 7. Hipóteses de produto

**Nomes** (a marca-mãe é configuração da empresa, DA-02 regra 6; usar `{nome}`):

| Produto | Pacote | Primeiro cliente-alvo |
| --- | --- | --- |
| `{nome} Contábil` | já definido | Escritórios de contabilidade (101.880 organizações) |
| `{nome} Direito` | Jurídico | Escritórios de advocacia |
| `{nome} Seguros` | Corretora de seguros | Corretoras com 2 a 20 pessoas (a maioria tem até 7) |
| `{nome} SST` (ou `{nome} Pessoas`) | SST/RH/ambiental | Consultorias de SST e contabilidades com DP |
| `{nome} Imobiliário` | Imobiliárias de locação | (futuro) |
| `{nome} Condomínios` | Administradoras de condomínio | (futuro) |
| `{nome} Projetos` | Arquitetura e engenharia | (futuro) |
| `{nome} PI` | Marcas e patentes | (futuro) |
| `{nome} Despacho` | Despachantes | (futuro) |

**Primeira versão de `{nome} Seguros`** (o que precisa existir para a primeira corretora pagar):
1. Perfil do cliente com **carteira**: apólices, ramo, seguradora, vigência, prêmio, parcelas, comissão, bens segurados. Importação em lote (planilha e extração do PDF da apólice, com revisão humana).
2. **Calendário de renovação** com régua (90/60/30) e **tarefa automática**.
3. **CRM com WhatsApp por setor** (Comercial, Renovação, Sinistro, Pós-venda) e histórico por cliente.
4. **Agentes:** Renovação, Atendimento ancorado em apólice e condições gerais (com citação), Sinistro (checklist e prazos), Cobrança de parcela.
5. **Comissões** (componente de Financeiro com titular = seguradora): receber por parcela, **estorno proporcional** (Res. 493, art. 21), conciliação com extrato (começando por importação de planilha/PDF).
6. **Base legal "Seguros"** (Lei 15.040, Res. 493, LGPD, CDC) com vigência e citação, mais cofre de **condições gerais** carregadas pela corretora ou pelo pacote.
7. **Conformidade da corretora:** vencimento do registro, recadastramento, prepostos, capacitação dos administradores (Res. 493, vigência 17/1/2027).
8. App do cliente com marca da corretora: carteirinha, 2ª via, aviso de sinistro.
9. **Fora do v1:** multicálculo próprio, integração direta com cada seguradora, Open Insurance, saúde (Sisweb), previdência, emissão.

**Primeira versão de `{nome} SST`**: cadastro de empresas e funcionários; calendário de exames, treinamentos e laudos; modelos de PGR/PCMSO com revisão técnica; agente de leitura do PGR contra a NR-01 e as demais NRs; app do cliente com vencimentos; eventos de SST do eSocial como fase 2 **[a confirmar]**.

**Como vender o vínculo com a base de leis modular** (todos os pacotes):
1. **Módulo "Legal" por área, assinado à parte** (DA-02: Legal é plug-in do pacote): "Legal: Seguros", "Legal: SST", "Legal: Direito". Preço pelo corpus e pela atualização, não por usuário.
2. **Vendável como serviço de atualização**: alertas "o que mudou e o que afeta a sua carteira" (ex.: Res. 493 em vigor em 17/1/2027, regulamentação pendente da Lei 15.040). É receita recorrente com justificativa clara.
3. **Resposta sempre com citação e vigência** (dispositivo, data, versão), com recusa explícita quando a base não cobre, para sustentar confiança e reduzir risco.
4. **Camadas**: lei (a empresa mantém e atualiza) + documentos do cliente (convenção, apólice, contrato) que o cliente carrega e que ficam isolados por inquilino (DA-01).
5. **Cross-sell entre pacotes** via DA-02.1: o mesmo escritório contrata Contábil + Legal Trabalhista + SST, sem duplicar cadastro nem Time de agentes.
6. **Cuidado de linguagem:** apoio à decisão do profissional, não parecer; na área de seguros, a IA não promete cobertura nem emite cotação sem validação humana.

---

## 8. O que ainda precisa ser confirmado (e como)

| Item | Como confirmar |
| --- | --- |
| Texto oficial da Lei 15.040/2024 e da Res. CNSP 493/2026 (vigência, prazos, art. 21) | Planalto e `gov.br/susep` (a página do Planalto não carregou nesta pesquisa) |
| Preços e módulos de Quiver, Sisweb, SIGA, Seguros Fácil, Corretor Online (os dois últimos e o SIGA não aparecem nas fontes) | Demonstração com o fornecedor e conversa com 5 a 8 corretoras |
| Disposição das corretoras a trocar de sistema ou a pagar mais de R$ 200 por mês por IA + conformidade | Entrevistas de descoberta |
| Possibilidade de parceria de cotação com Segfy, Agger ou outro | Contato comercial |
| Status atual da regra de IA do WhatsApp Business no Brasil | Termos oficiais da Meta e decisão do CADE |
| Escopo e credenciais da API da Susep para consulta de corretores | PDF oficial e canal da Susep |
| Mercado e concorrência de SST/RH/ambiental, PI, despachantes, consórcio, arquitetura/engenharia | Segunda rodada de pesquisa (ex.: J7) |
| Número de escritórios de advocacia | OAB e frentes J |

---

## 9. Fontes (acesso em 8/11/2026)

Legenda: L = página lida; R = só resumo de busca.

| # | Fonte | Uso | |
| --- | --- | --- | --- |
| F1 | [CQCS, 3/11/2026, 170 mil corretores](https://cqcs.com.br/noticia/mercado-alcanca-marca-historica-de-170-mil-corretores-registrados/) | Números de corretores | L |
| F2 | [CQCS, 26/2/2026, recorde de corretoras](https://cqcs.com.br/noticia/numero-de-corretoras-ativas-no-pais-deve-bater-recorde-historico/) | Série | L |
| F3 | [CQCS, 26/8/2026, queda de empresas](https://cqcs.com.br/noticia/numero-de-empresas-corretoras-de-seguros-em-atividade-volta-a-cair/) | Oscilação | L |
| F4 | [Revista Apólice, 10/9/2026, lançamento do ONE](https://revistaapolice.com.br/2026/09/quiver-e-agger-se-unem-em-nova-plataforma-da-dimensa/) | ONE, aquisições, ESECS | L |
| F5 | [Agger, planos e preços](https://www.agger.com.br/precos) | Preços Aggilizador e ONE | L |
| F6 | [Agger, blog: plataforma de multicálculo](https://www.agger.com.br/?p=880) e [gestão x multicálculo x CRM](https://www.agger.com.br/blog/diferenca-sistema-de-gestao-multicalculo-e-crm-2) | Funcionamento | L |
| F7 | [Segfy, preços](https://www.segfy.com/precos) e [home](https://www.segfy.com/) | Preços e história | L |
| F8 | [CQCS, 2018, sistemas multicálculo](https://cqcs.com.br/noticia/corretores-apontam-sistemas-de-multicalculos-mais-usados/) | Lista antiga | L |
| F9 | [CQCS, 26/5/2026, Segura](https://cqcs.com.br/noticia/segura-leva-ia-operacional-para-o-whatsapp-dos-corretores-de-seguros/) | IA | L |
| F10 | [Demarest, Res. CNSP 493/2026](https://www.demarest.com.br/susep-consolida-marco-regulatorio-dos-corretores-de-seguros-e-reforca-autorregulacao-e-educacao-continuada/) | Norma | L |
| F11 | [Sincor-SP via Legismap, 1/10/2026](https://legismap.com.br/conteudos/artigos-e-noticias/sincor-sp-resolucao-cnsp-493-2026-o-que-as-corretoras-de-seguros-precisam-observar) | Norma | L |
| F12 | [Revista Apólice, CNseg 2025](https://revistaapolice.com.br/2026/03/setor-segurador-movimenta-r-7645-bilhoes-em-2025/) | Prêmios | L |
| F13 | [Revista Apólice, Lei 15.040](https://revistaapolice.com.br/2025/07/a-nova-lei-15-040-2024-e-a-reconstrucao-das-relacoes-no-brasil/); [Lockton](https://global.lockton.com/br/pt/noticia/impactos-e-pontos-de-atencao-sobre-a-nova-lei-de-seguros); [FAQ Sindseg-SC](https://sindsegsc.org.br/arquivo/publicacao/224/documento/faq_lei_15040_2024.pdf) | Marco legal | R |
| F14 | [Revista Apólice, comissão do auto (15%)](https://revistaapolice.com.br/?p=85090); [CQCS/TEx 2021](https://cqcs.com.br/noticia/quanto-ganha-um-corretor-de-seguros-e-o-tema-de-live-promovida-pela-tex/) | Faixas de comissão | R |
| F15 | [Conjur, comissão contingente, 2024](https://www.conjur.com.br/2024-jul-04/corretagem-de-seguros-e-comissao-contingente/) | Tema jurídico | R |
| F16 | [CQCS, 18/9/2026, Open Insurance](https://cqcs.com.br/noticia/open-insurance-avanca-em-2026-e-pode-transformar-atuacao-dos-corretores/); [Let's Money, SPOCs](https://www.letsmoney.com.br/noticias/open-insurance-spocs-demanda-escala/); [Manual de APIs v1.2 (Susep)](https://www.gov.br/susep/pt-br/assuntos/open-insurance/arquivos/manual-de-apis-do-open-insurance-v1-2.pdf) | Open Insurance | L (CQCS) / R |
| F17 | [Susep, instruções da API de corretores](https://www.gov.br/susep/pt-br/arquivos/arquivos-licenciamento/corretor-de-seguros/empresa-consulta-api-corretores-instrucoes.pdf); [Painel de Corretores (2023)](https://okai.com.br/noticia/2023-10-05/susep-lanca-novo-painel-de-corretores) | Integração Susep | R |
| F18 | [Baguete, HUBSEGS](https://www.baguete.com.br/noticias/hubsegs-vende-seguros-pelo-whatsapp-com-genai); [Revista Apólice, Mapfre sinistro por WhatsApp](https://revistaapolice.com.br/2025/09/mapfre-lanca-jornada-de-sinistros-com-ia-via-whatsapp/) | IA no mercado | R |
| F19 | [Olhar Digital](https://olhardigital.com.br/2025/10/18/pro/whatsapp-business-vai-proibir-chatbots-de-ia-entenda/); [Exame](https://exame.com/tecnologia/whatsapp-volta-atras-e-deixa-que-empresas-brasileiras-usem-ias-para-atender-clientes/); [Startups, CADE](https://startups.com.br/negocios/cade-manda-meta-suspender-regra-que-barra-chatbots-de-ia-no-whatsapp/) | Regra do WhatsApp | R |
| F20 | [IT Forum, Dimensa compra Quiver (R$ 115 mi)](https://itforum.com.br/?p=9574859); [IT Forum, Totvs/Dimensa compra Agger (R$ 260 mi)](https://itforum.com.br/?p=9604474); [CQCS, Porto compra Segfy, 2021](https://cqcs.com.br/noticia/porto-seguro-anuncia-aquisicao-da-segfy-tecnologia-s-a/) | Consolidação | R |
| F21 | [Paraíba Business, Cofeci](https://paraibabusiness.com.br/diretoria-do-cofeci-toma-posse-para-novo-trienio-2025-2027/) | Imobiliárias | L |
| F22 | [B2BStack, Superlógica Imobiliárias x Kenlo](https://www.b2bstack.com.br/compare/superlogica-imobiliarias-vs-kenlo) | Preços de imobiliária | R |
| F23 | [EM, Censo Condominial 2026](https://www.em.com.br/mundo-corporativo/2026/08/7474336-censo-2026-revela-dados-do-mercado-condominial-brasileiro.html); [B2BStack, Superlógica Condomínios](https://www.b2bstack.com.br/compare/condominio-auto-gestao-vs-superlogica-condominios); [guia de prospecção de adm. de condomínios](https://scrap.io/pt/lista-de-administradoras-de-condominios) | Condomínios | L (EM) / R |
| F24 | [Startups, Doctoralia compra Feegow](https://startups.com.br/negocios/doctoralia-compra-brasileira-feegow-e-mira-gestao-para-clinicas/); [Bahia Notícias, CNES](https://www.bahianoticias.com.br/saude/noticia/32853-estabelecimentos-de-saude-crescem-na-bahia-e-chegam-a-23-mil-cadastros-consultorios-clinicas-e-farmacias-puxam-alta) | Clínicas | R |
| F25 | [Por Dentro de Minas, CAU 44,8 mil](https://pordentrodeminas.com.br/noticias-corporativas/2025/06/317200-arquitetura-marketing-digital-viabiliza-atracao-de-clientes); [Tribuna de Jundiaí, Crea-SP](https://tribunadejundiai.com.br/mais/brasil/quais-empresas-devem-ter-registro-no-crea-sp/) | Arquitetura/engenharia | R |
| F26 | [Pessoa e Pessoa, NR-01](https://pessoaepessoa.com.br/insights/atualizacao-da-nr-01-gestao-de-riscos-psicossociais-passa-a-ser-obrigatoria-a-partir-de-maio-de-2026/); [FINDES, NR-01](https://findes.com.br/wp-content/uploads/2026/01/Informe-Estrategico-–-Inicio-da-fiscalizacao-da-NR-01-sobre-fatores-psicossociais-relacionados-ao-trabalho.pdf) | SST | R |
| F27 | [ABAC via Legismap, Anuário 2026](https://legismap.com.br/conteudos/artigos-e-noticias/anuario-abac-2026-baixe-os-numeros-do-sistema-de-consorcios-em-2025) | Consórcio | R |
| F28 | [ABC da Comunicação, INPI 2025](https://www.abcdacomunicacao.com.br/?p=338442) | PI | R |
| F29 | [TJMA, Cartório em Números](https://www.tjma.jus.br/midia/portal/noticia/516375/estudo-revela-impacto-dos-cartorios-na-desjudicializacao-de-demandas-sociais); [Migalhas](https://www.migalhas.com.br/depeso/438855/extrajudicializacao-um-novo-e-eficiente-acesso-a-justica-multiportas) | Cartórios | R |
| F30 | [EM, planos de saúde 53 milhões](https://www.em.com.br/mundo-corporativo/2026/07/7469968-planos-de-saude-superam-53-milhoes-de-beneficiarios.html) | Benefícios | R |
| F31 | [UFRJ, despachantes (PNAD 2009)](https://revistas.ufrj.br/index.php/dilemas/article/view/7753/7587); portarias de Detrans (BA, SC, PR) | Despachantes | R |
| F32 | [Guia de prospecção, advogados (cita 1,3 milhão da OAB)](https://scrap.io/pt/lista-de-advogados) | OAB | R (fonte fraca) |
| F33 | Repositório: `pesquisa/05-mercado-preco.md` (CFC, 101.880 organizações contábeis, exercício 2025) | Baseline contábil | L |

Nota de método: foram usadas as 30 buscas disponíveis. Várias páginas de notícias do setor mostram datas inconsistentes entre si; foram preferidas as que trazem data no corpo do texto. Fontes de fornecedores estão sinalizadas como autodeclaração.

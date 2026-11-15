# J2 - eLaw em profundidade (por que a advogada gosta e o que levar ao pacote Jurídico)

Data da pesquisa e do acesso a todas as fontes: **08/11/2026**.
Método: 20 buscas na web (limite do escopo: 28) e leitura direta das páginas (curl + extração de texto com `python3 -I`): site oficial elaw.com.br (24 páginas de produto, 25 posts do blog, página de cases), API pública de posts do WordPress da própria eLaw (108 posts listados), feed RSS do canal da eLaw no YouTube (títulos e descrições de 15 vídeos), páginas de preço, agregadores e notícias. Tudo o que não foi verificado em fonte primária está marcado **[a confirmar]**.

## 0. Ressalvas de método (leia primeiro)

1. **Eu não vi o sistema por dentro.** Login e app ficam atrás de cadastro. O "mapa de telas" (item 2) é reconstruído a partir de páginas de produto, posts, cases e descrições de vídeo, não de capturas de tela. O vídeo em si não foi assistido (só título e descrição). **Há um trial grátis de 10 dias, sem cartão, do eLaw Adv**: é o jeito mais barato de confirmar tudo que está marcado "[a confirmar]". Recomendo que alguém do projeto faça o cadastro e registre as telas.
2. **Depoimentos são escolhidos pela própria eLaw** (cases, landing de preço). Avaliação independente é quase inexistente: B2B Stack tem **1 avaliação** do eLaw (3,5/5, de 20/05/2020); a Capterra e o G2 não apareceram; o Reclame Aqui bloqueia leitura direta (403), então só vi o título de uma reclamação via resultado de busca.
3. **Correção a um ponto do J1** (`J1-mercado-software-juridico.md`): lá o preço do eLaw está como "não público". **Isso vale para Business, Enterprise, Starter e Integration Office, mas o eLaw Adv (ex-Proadv) tem preço público em duas tabelas divergentes** (item 1.7).
4. **Dois produtos, dois públicos.** "eLaw" significa coisas bem diferentes: (a) plataforma **enterprise para departamentos jurídicos de grandes empresas e bancas de contencioso de volume** (provisão, workflow, BI, e-billing); (b) **eLaw Adv**, produto de entrada para advogado autônomo e escritório pequeno, que é o antigo **Proadv**. **Não sei qual deles a advogada da família usa.** Essa é a pergunta número 1 para ela (item 3.1).
5. Existe um homônimo americano ("eLaw", software de docketing comprado pela Lexitas em 2020) sem relação com a eLaw brasileira. Ignorado.

---

## 1. Ficha do eLaw

### 1.1 Quem é a empresa (e quem NÃO é)

| Item | O que apurei | Fonte |
|---|---|---|
| Razão social | **E-LAW TECNOLOGIA S/A**, CNPJ 08.973.004/0001-68, Av. Dr. Cardoso de Melo, 1.608, 3º andar, Vila Olímpia, São Paulo | rodapé de elaw.com.br |
| Fundação | 2007 (rodapé "© 2007-2026"; B2B Stack: "Fundação 2007"). Posts falam em "15 anos" (dez/2025) e "17 anos" (out/2024): números inconsistentes entre si | elaw.com.br; B2B Stack; TI Inside |
| **Não é Softplan nem Thomson Reuters** | Softplan é dona da Projuris/SAJ ADV; Thomson Reuters é dona do Legal One. A eLaw é empresa independente (S.A.). **Controle acionário e investidores: não encontrei [a confirmar]**. O ranking "Top 100 Open Scaleups" (onde ficou em 19º) exige receita > US$ 2,5 mi/ano, investimento relevante ou M&A, o que dá só um piso de porte, sem número | Migalhas; elaw.com.br/2025/12 |
| Liderança citada | **Guilherme Bordon**, sócio e CEO (desde pelo menos 2017); Paulo Silva, diretor de Legal Ops e Consultoria (ex-Deloitte, ex-Mercado Livre; chegou em out/2024); Daniel Betton (fechamento/valores/BI); Thiago Ribeiro (IA e inovação) | Baguete 2017; Portal ERP 2020; TI Inside 2024; blog |
| Tamanho (declarado) | "+100 mil usuários", "+300 clientes", "3 continentes", "200 das 500 maiores empresas brasileiras" são clientes. Landing do eLaw Adv fala em "+5 mil escritórios e empresas" (mistura as bases Enterprise e Adv). Receita e nº de funcionários: **não encontrei [a confirmar]** | elaw.com.br (home e /elawadv) |
| Certificações | ISAE 3402 (relatórios SOC1/2/3 tipo 2), ISO 9001, ISO 27001, ISO 27701 (a landing do Adv escreve "IS27201", erro de grafia) | elaw.com.br/sobre |
| Prêmios | 4ª LegalTech Scaleup no Top 10 Legal Techs 2025; 19º no Top 100 Open Scaleups; selos de revistas de marketing/qualidade (pouco verificáveis) | elaw.com.br/2025/12; /sobre |
| Tecnologia (pistas) | 2017: contrato com **OutSystems (low-code)** para acelerar integrações com sistemas dos clientes. 2020: parceira da IBM (Watson NLU/Classifier, classificação de pedidos trabalhistas). 2023/24: migrou para **Oracle OCI** (São Paulo). 2025: IA generativa em **AWS Bedrock**, criptografia AES-256, dados segregados por cliente, "nenhuma informação usada para treinar a IA" (declarado) | Baguete; Portal ERP; Oracle (post reproduzido); elaw.com.br/2025/10 |
| Consultoria | **eLaw Consulting** (fim de 2024): controladoria de provisões e fechamento contábil + revisão de fluxos de trabalho + implantação. **eLaw Academy** (treinamento em legal ops) prevista para 2025 [a confirmar se lançada] | TI Inside; Migalhas |
| Comunidade | **eLaw Experience** (evento presencial/online desde 2024, 11ª edição em mar/2026, com webinar e podcast desde 2025); "Comitê de Clientes"; presença na Fenalaw e CLAW | elaw.com.br/elaw-experience; blog |

### 1.2 História em linhas

- **2007**: fundação (eLaw Tecnologia S.A.). Foco em departamentos jurídicos.
- **2017**: contrato com OutSystems para integrações (a base era "+10 mil usuários").
- **abr/2020**: **joint venture com a Impacta**, que trazia o **Seven** (software para bancas médias e grandes) e o **PROADV** (gestão processual para advogados; Portal ERP diz "conveniado e chancelado pelo Conselho Federal da OAB", afirmação do release, **[a confirmar]** na OAB). A tese era a "tríade" departamento jurídico - escritório - advogado da parte contrária, para conciliação online. Operação já nascia com 7 milhões de processos ativos.
- **2023/24**: migra para a nuvem Oracle (OCI).
- **2024**: nasce a divisão de consultoria; lançamento da linha **eLaw Business** (para empresas com pouco volume) e de um "novo ERP para quem não precisa de customização" (anunciado em out/2024).
- **2025**: IA generativa vira a bandeira ("líder em IA generativa para o contencioso"): cadastro 4.0, interpretação de petições, atas, sentenças, acórdãos, ofícios, **GEN AI Contestação** (Fenalaw, 22 a 24/out/2025) e **ODR (acordos) com 8 agentes de IA**.
- **out/2025**: **Proadv passa a se chamar eLaw Adv** (anúncio do rebranding em 30/10/2025 segundo resultado de busca de rede social **[a confirmar]**; blog de nov/2025 e app na Play Store confirmam: "O Proadv agora é eLaw Adv e passa a fazer parte da eLaw"). O app Android mantém o id `com.proadv.app` e foi atualizado em 25/10/2026.
- **out/2026**: lançamento de "**Captura de Prazos com IA**" no eLaw Adv (dois vídeos de 16 e 20/10/2026).

### 1.3 Quem compra (clientes)

| Segmento | Exemplos citados no site/blog (cases) | Observação |
|---|---|---|
| Grandes empresas (departamento jurídico) | Sicredi, MRV, Whirlpool, Cosan, Casas Bahia, Porto Seguro, PepsiCo, Carrefour, NIO, Afya, Hotmart, TK Elevator | Núcleo do negócio. Nubank e Iguá aparecem em eventos/webinars; ser cliente **[a confirmar]** |
| Bancas de contencioso de volume | Rueda & Rueda (120 mil ações, 500+ colaboradores), BLS Advogados, Queiroz Cavalcanti (20 mil contestações/mês), Pinheiro Neto (depoimento em vídeo), Silva e Mello, Pena Carvalho, Marcio Mendes Advocacia | Usam **Integration Office** (e GEN AI para peças) |
| Advogado autônomo e escritório pequeno | Depoimentos de OABs de SP e SC; vídeo da Shirley Feitosa Advocacia | Usam **eLaw Adv** (ex-Proadv). Proadv: "+150 mil advogados em 5 anos" (declarado; número que provavelmente conta cadastros, não clientes pagantes) |
| **Escritórios que atendem um cliente que usa o eLaw** | MRV (180+ escritórios parceiros, 90% de adesão voluntária); Sicredi (90% das cooperativas); Afya (12 escritórios); Verzani e Sandrini (~40 escritórios lançando dados direto no sistema) | **Hipótese importante**: muita gente "usa eLaw" porque o cliente corporativo exige (item 3.1) |

### 1.4 Linha de produtos (mapa)

**Departamento Jurídico**
- **eLaw Business**: litígios de baixo/médio volume, implantação rápida, "sem personalizações complexas". Primeiro cliente: NIO.
- **eLaw Enterprise** (9 módulos contratáveis separadamente): Contencioso, Contencioso Tributário, Contratos (CLM), Societário, Procurações, Consultivo, Imobiliário Regulatório, Marcas e Patentes, E-Billing.
- Adicionais de Enterprise: IA e Automação, BI, Fechamento de Provisão (serviço), Integrações (SAP, Oracle), eSocial (S-2500/S-2501), Customizações, GED, AD-SSO, Idiomas (inglês/espanhol).

**Escritório de Advocacia**
- **eLaw Adv** (ex-Proadv): autônomo e escritório compacto, com preço público e trial.
- **eLaw Starter**: escritório que quer solução completa e rápida, com captura de publicações e andamentos.
- **eLaw Integration Office (IO)**: bancas com operação volumosa/complexa; customizável; **integração nativa com o eLaw Enterprise do cliente** (cadastrar processo, subir documento, atualizar andamento no sistema do cliente).
- **eLaw ODR (Acordos)**: negociação automatizada por SMS, WhatsApp e e-mail até a minuta para assinatura digital (promessa de "até 70% de sucesso" e "acordos até 50% menores": **alegação do fornecedor**).

### 1.5 IA (o que existe hoje, segundo a eLaw)

| Solução | O que faz | Para quem | Nível de prova |
|---|---|---|---|
| **Captura de Prazos com IA** (eLaw Adv, out/2026) | Lê o Diário Oficial, conta dias úteis conforme o CPC, sugere vencimento exato; respeita feriados e recessos; mostra a **base legal ao lado**; "revisão final é sempre do advogado"; "Insights da Decisão" (termômetro de resultado favorável, chave Autor/Réu); duas versões do texto: técnica e **sem juridiquês para enviar ao cliente** | Adv | Descrição de vídeo (YouTube 16 e 20/10/2026). Comportamento real **[a confirmar no trial]** |
| Sugestão de prazos por IA (eLaw Adv) | A partir das intimações/publicações capturadas, sugere prazo e data fatal; "um clique para adicionar à agenda" | Adv | Página oficial |
| Andamentos de tribunais ilimitados com IA (eLaw Adv) | Monitoramento e classificação | Adv | Página oficial |
| Gerador de peças com IA (eLaw Adv) | "Contratado separadamente" | Adv | Página oficial |
| Portal do cliente com tradução por IA (eLaw Adv) | Traduz andamento para linguagem simples | Adv | Página oficial |
| Cadastro automático a partir de publicação/intimação (eLaw Adv) | Número, partes, localização, natureza, sem digitação | Adv | Página oficial |
| Cadastro 4.0 / Novos Processos com GEN AI | Captura distribuições/citações (DJE, DJEN, TJs, Procon), preenche ficha com partes, juiz, advogados, valor da causa, anexa petição inicial | Enterprise, IO | Página oficial; cases Afya e Sicredi |
| Interpretação de petição inicial, ata de audiência, sentença, acórdão, ofício e guia judicial | Upload do PDF, IA preenche campos estruturados (campos adaptáveis ao segmento: nº do voo, placa) | Enterprise, IO | Página oficial |
| **Agente de Interpretação Processual / Insights Processuais** | Classifica andamentos (revelia, tutela, penhora, arquivamento) e entrega alertas "prontos para ação"; avisa que o processo está entrando em encerramento e desmobiliza o pagamento do escritório | Enterprise, IO | Página oficial |
| "DJEN e Diários Oficiais com Prazo Agendado" | Transforma publicação em notificação com descrição do prazo e **data fatal**, sugerindo a ação adequada | Enterprise, IO | Página oficial |
| **GEN AI Contestação** | Sobe petição + subsídios, consulta banco de teses do escritório, gera peça em blocos editáveis com **rastreabilidade da fonte de cada parágrafo**, parâmetros de tom/profundidade/criatividade, modelo .docx com identidade visual do escritório, perfis de acesso, revisão obrigatória por humano; dispara tarefas ao subir ata (workflow). Tempo por peça: de 2 a 3 h para ~45 min (BLS); "em 1 dia a IA operava como redator treinado" (QCA) | IO, grandes bancas | Casos apresentados por clientes na Fenalaw 2025. Ganhos são autodeclarados |
| ODR com 8 agentes | Cada fase da negociação por um agente, inclusive via WhatsApp, até assinatura e protocolo | Esc., DJ | Migalhas (mar/2025). Alegação de fornecedor |
| Captura de Procon e Consumidor.gov | Robô traz reclamações pré-processuais para o sistema | DJ | Página oficial |

### 1.6 Integrações (tribunais, robôs, certificado)

- **Fontes de captura nomeadas**: Diários Oficiais (pesquisa por nome/OAB, limitada por plano), **DJEN**, **DJE/Domicílio Judicial Eletrônico** (CNJ, em vigor desde set/2024), sistemas de intimação eletrônica **PJe, Projudi, eProc "etc."** (eLaw Adv), TJs, Procon (Sindec, ProConsumidor), Consumidor.gov.
- **Métrica de plano que revela a arquitetura**: o eLaw Adv limita "sites de intimação eletrônica" (1, 2, 3, 3) e "pesquisas de Diário Oficial" (1, 2, 4, 6). Isso sugere que a captura é feita **por portal/credencial do advogado** (um "site" = uma conta num portal de tribunal), com robôs. **Como a credencial é guardada (senha, certificado A1/A3, token) não está dito [a confirmar]**.
- **Certificado digital**: nenhuma página da eLaw que li fala em certificado como requisito (o Legal One e a Projuris falam). **[a confirmar]**.
- **ERP/contabilidade (lado corporativo)**: **SAP** (pagamento de guias aprovado no eLaw vira registro no SAP: caso Cosan) e Oracle; Google Maps (Imobiliário); assinatura eletrônica (DocuSign e "as mais usadas", no CLM e Procurações); eSocial (formulários S-2500/S-2501 com o leiaute oficial).
- **Integração entre empresa e escritório**: IO <-> Enterprise do cliente (processo, documento, andamento).
- **Infra**: OCI (dados), AWS Bedrock (modelos de IA), SSO via AD (AD-SSO).

### 1.7 Preço

| Produto | Preço | Fonte |
|---|---|---|
| **eLaw Adv** (página oficial /elawadv, 08/11/2026) | Trial 10 dias sem cartão (sem limite de processos, 1 site de intimação, 1 pesquisa de Diário, 1 usuário, 5 GB). **Básico** 12x R$ 119,90 (anual) ou R$ 129,90/mês: até 100 processos (excedente R$ 0,36), 2 sites, 2 pesquisas, 1 usuário (sem adicional), 5 GB. **Intermediário** ("mais contratado") 12x R$ 179,90 ou R$ 199,90/mês: até 500 processos (R$ 0,30), 3 sites, 4 pesquisas, 2 usuários (+R$ 9,90), 10 GB. **Avançado** 12x R$ 349,90 ou R$ 399,90/mês: até 1.000 processos (R$ 0,25), 3 sites, 6 pesquisas, 10 usuários (+R$ 9,90), 20 GB. Todos: andamentos ilimitados com IA, calculadora de prazos avançada, portal do cliente com tradução por IA. **Gerador de peças com IA: contratado à parte** (valor não publicado) | https://elaw.com.br/elawadv/ |
| **eLaw Adv** (landing de campanha) | "A partir de R$ 70/mês": Básico R$ 70 (anual) / R$ 79 (mensal); Intermediário R$ 130 / R$ 149; Avançado R$ 260 / R$ 299. Mesmos limites. **Divergem da página oficial** (provavelmente tabela antiga ou promocional) **[a confirmar qual vale]**. Um resultado de busca ainda mostrava R$ 149 e R$ 299 como "mensal" | https://conteudo.elaw.com.br/contrate-o-elaw-adv |
| Business, Enterprise (por módulo), Starter, Integration Office, ODR, GEN AI | **Não público** (demonstração + proposta). Adicionais (BI, GED, SSO, integrações, customização, fechamento de provisão) são **contratados à parte** | páginas de produto |
| B2B Stack | "Preço inicial R$ 0,00 - Anual; acesso por tempo limitado" (dado sem valor, não usar) | b2bstack.com.br |

**Leitura**: a eLaw vende como **assinatura com franquia por nº de processos monitorados + usuários baratos (R$ 9,90) + IA premium à parte**. A mecânica "plano até N processos, R$ 0,25 a R$ 0,36 por excedente" é boa para o nosso desenho de preço (item 4).

### 1.8 Avaliações: por que gostam, o que criticam

| Tipo | Fonte | O que diz | Peso |
|---|---|---|---|
| Elogio | B2B Stack, avaliação de 20/05/2020 (1 única, 3,5/5; recursos 5, facilidade 4, suporte 4, custo-benefício 4) | "Facilmente programável, necessidades atendidas rápido **sem customizações caras e demoradas**"; resolve "**atualização de valores que o sistema faz perfeitamente, principalmente no tributário**", **relatórios** e "diversidade de módulos (do consultivo ao contencioso)" | Fraco (n=1, 2020) |
| Crítica | mesma avaliação | "O atendimento: a empresa está muito demandada e **os SLAs de retorno estão altos**" | Fraco |
| Elogio (vitrine) | Depoimento do Rueda & Rueda (AB2L LEX 2023) | "Único com **adaptação rápida ao escritório**"; clientes cobram respostas rápidas | Selecionado pela eLaw |
| Elogio (vitrine) | Silva e Mello | "Customização dos processos, **implantação tranquila, interface amigável, vasta extração de dados**, excelente estabilidade (nunca paralisação total)"; "parceiro de negócio" | Selecionado |
| Elogio (vitrine) | Depoimentos do eLaw Adv | "Fácil entendimento, **preço acessível**, útil para organizar processos"; "**vim do As\*\*\*a (provável Astrea) pra cá**... a equipe é fantástica"; indicação boca a boca ("3/4 dos amigos fecharam depois que indiquei") | Selecionado |
| Elogio (vitrine) | Pinheiro Neto, Marcio Mendes (vídeos) | Centralização, comunicação transparente com clientes, **segurança/integração/dados** | Selecionado |
| Crítica | Reclame Aqui, título lido via busca: "Falha na prestação do serviço - Elaw": sistema "inoperante", **sem registrar novas intimações** nem atualizar publicações e andamentos, **SAC inacessível** | Um relato, sem data confirmada, não lido na íntegra **[a confirmar]** |
| Crítica | J1 (cruzamento interno) registra RA 6,3 com 25 reclamações, sem data **[a confirmar]** | idem |
| Implícita | Posts da eLaw insistem em "migração segura", "personalização com colaboração", "sustentação do projeto ao longo do tempo (governança de fluxos)" | Sinal de que **implantação e manutenção de fluxos dão trabalho** (inferência) |

**Conclusão honesta**: não há base independente robusta. O que existe converge para: **elogio a configurabilidade, indicadores/relatórios e correção monetária; críticas a suporte (SLA) e, no Adv, risco de falha na captura de intimações.**

### 1.9 Vídeos, webinars, blog, base de ajuda, vagas

| Item | Achado |
|---|---|
| **Canal YouTube** | youtube.com/@ElawTecnologiaSA (RSS lido). Vídeos de 2026: "Captura de prazos com IA" (20/10 e 16/10), "Webinar IA no Direito: muito além do hype" (20/08, com CEPI FGV), "IA Generativa no Direito: FGV e o mercado em debate" (26/06, com Nubank e BLS), "Contencioso de Consumo" (07/05), cases (Shirley Feitosa/eLaw Adv, Porto Seguro, Whirlpool "86% de redução no fechamento", Pinheiro Neto, Marcio Mendes), "**Webinar | Como selecionar e implantar um software jurídico no seu escritório**" (01/04), "Como o QCA usa Gen AI para elaborar peças" (25/03), 11º eLaw Experience. Vídeos de produto do Adv ("Lançamento: conheça o eLaw Adv", "Conheça as funcionalidades do eLaw Adv", "Chegou o eLaw Adv") **existem mas o YouTube bloqueou a leitura (429)** |
| **Blog** | 108 posts (jul/2023 a abr/2026). Os mais reveladores para funcionalidade: DJE (jan/2025), fechamento de provisão (abr/2025), cases (MRV, Sicredi, Afya, Cosan, NIO, Whirlpool), "Como fazer gestão baseada em dados em um escritório pequeno" (mar/2026), "Como calcular produtividade" (abr/2026), "Integrando sistemas contábeis com softwares jurídicos após a reforma tributária" (abr/2026), eSocial (mar/2025), "Quem personaliza pode transformar seu software" (abr/2025) |
| **Base de ajuda** | Não localizei central pública (domínios `ajuda.*` e `help.*` não resolvem). Existe "área do cliente" para suporte (B2B Stack). **[a confirmar]** |
| **Vagas** | Portal em jobs.quickin.io/elaw/jobs (carrega por JavaScript, não li). Via busca: "Analista de Projetos de Implantação Pleno - LegalOps" (SP, híbrido; anúncio já removido) e "Analista de Projetos Júnior (Consultor Dedicado)" focado em **projetos de integração**. Sinal: **implantação consultiva e integrações sob medida são parte do modelo de entrega** (inferência) |

### 1.10 Comparação com Projuris, Legal One e Astrea (só o que li em fonte)

| Eixo | eLaw (Enterprise/IO) | eLaw Adv | Projuris | Legal One (Thomson Reuters) | Astrea (Aurum) |
|---|---|---|---|---|---|
| DNA | **DJ de grande empresa + banca de volume**: provisão, workflow, BI, e-billing, escritórios parceiros no mesmo sistema | Autônomo/escritório compacto; entrada barata | Empresas (+20 módulos, [J1]); ADV (Start Solo R$ 79/mês [J1]); WhatsApp autoatendimento; peticionamento integrado; gestão de certificados | Firm (planos Starter a Premium) e Corporate; **roleta de distribuição de publicações**; **Kanban/lista/calendário**; financeiro completo (NF, boleto, conciliação); **Peticionamento Inteligente** (módulo pago); IA de prazo só nos planos altos [J1] | Autônomo e pequeno/médio; **Kanban**; **atendimentos (CRM leve)**; Jux (IA de jurisprudência e peças); calculadora de prazos; plano grátis de 1 ano [J1] |
| Diferencial declarado | Configurabilidade por ficha e workflow; **fechamento contábil de provisão**; correção monetária; certificações; IA generativa para contencioso em massa | Preço por volume de processos; **envio automático de andamentos ao cliente**; financeiro sem custo extra; certificações (único a citar nas comparações) | Escala de tribunais monitorados, marca Softplan | Marca, jurisprudência/editorial TR, controle de acesso granular, GED | Base enorme de usuários, conteúdo, IA conversacional |
| Ponto a testar | Custo e prazo de implantação; suporte | Estabilidade da captura; **valor real da tabela** | - | Preço (cotação) | - |

A tabela comparativa da landing do eLaw Adv usa "Concorrente 1 a 4" sem nomes (autoavaliação, ignorar como evidência). B2B Stack: Elaw 3,5 (1 avaliação), Projuris ADV 4,4 (154), Astrea 4,7 (134), Legal One 3,8 [J1]. Os comparativos "-" de funcionalidade para o Elaw no B2B Stack são falta de dados, não ausência de função.

---

## 2. Mapa de telas e fluxos (reconstruído; confiança indicada)

Confiança: **A** = descrito em página oficial de produto/ajuda; **B** = descrito em case/post/vídeo; **C** = inferido (marcar para validar no trial).

### 2.1 eLaw Adv (ex-Proadv): advogado e escritório pequeno

| # | Tela / fluxo | O que mostra e faz | Gatilho de entrada -> saída | Conf. |
|---|---|---|---|---|
| T01 | Cadastro e trial | Cadastro por plano (URLs `#/cadastro/básico`, `/intermediário`, `/avançado`), login com Google (script `gsi/client`) e reCAPTCHA; 10 dias sem cartão | Trial -> assinatura | A/C |
| T02 | **Tela inicial ("comece o dia sabendo o que fazer")** | Prazos da semana, **novos processos**, **próximas audiências**, **últimas intimações e publicações capturadas** | Captura -> painel | A |
| T03 | Lista e ficha de processo | Número, partes, localização, natureza; prazos, audiências, andamentos e documentos na mesma ficha; vínculo com cliente | Cadastro automático a partir de publicação/intimação, ou manual | A |
| T04 | **Caixa de publicações e intimações** | Diário Oficial (pesquisas por nome/OAB, limite por plano) e intimações eletrônicas (PJe, Projudi, eProc...), um "site" por conta | Robô -> publicação não tratada -> cria processo/prazo | A |
| T05 | **Sugestão de prazo por IA** | Lê a publicação, sugere ação, data fatal, base legal; "um clique" para agenda; revisão do advogado; "Insights da decisão" (termômetro, Autor/Réu); versão para o cliente | Publicação -> prazo na agenda | A/B |
| T06 | Calculadora de prazos avançada | Contagem de dias úteis conforme CPC, feriados, recessos | Manual ou a partir de T05 | A/B |
| T07 | Agenda (prazos, audiências, compromissos) | Visão por semana; aviso de prazos | T05/T03 -> alerta | A/C |
| T08 | Andamentos | Monitoramento de tribunais ilimitado (com IA), histórico no processo | Robô -> andamento -> (opcional) envio ao cliente | A |
| T09 | Clientes | Cadastro, processos vinculados, **reuniões, consultas, movimentações financeiras e documentos** | - | A |
| T10 | **Portal do cliente** | Cliente acompanha o processo; tradução de IA; **envio semanal automático dos principais andamentos** | Andamento capturado -> mensagem ao cliente | A |
| T11 | Financeiro | Receitas e despesas, plano de contas, centro de custo, fluxo de caixa, DRE, exportação Excel, **emissão de boletos** | Honorário -> boleto -> conciliação [conciliação a confirmar] | A/B |
| T12 | Jurisprudência | Pesquisa por termo, processo, data, estado | - | A |
| T13 | Documentos (GED simples) | 5/10/20 GB por plano | Upload/anexo ao processo | A |
| T14 | Gerador de peças com IA (módulo à parte) | Peça a partir de dados do processo [detalhe a confirmar] | Processo -> minuta | A |
| T15 | App Android/iOS | App "eLaw Adv - Sistema Jurídico" (Play Store, atualizado 25/10/2026) | - | A (existência); telas C |

### 2.2 eLaw Enterprise / Business / Integration Office: empresa e banca de volume

| # | Tela / fluxo | O que mostra e faz | Gatilho -> saída | Conf. |
|---|---|---|---|---|
| E01 | **Cadastro 4.0 / Novos Processos** | Robôs capturam capa, inicial e citação (DJE, DJEN, TJs, Procon); preenchem **ficha pronta para revisão**; IA lê PDF | Distribuição/citação -> ficha -> revisão humana | A/B |
| E02 | **Ficha de processo parametrizável** | Campos e **abas configuráveis** por cliente (ex.: abas de decisões, garantias e bloqueios na Afya); campos por segmento (voo, placa) | - | A/B |
| E03 | **Workflow dinâmico** | Tarefas por **gatilhos e eventos**, distribuição automática por regra, fluxos de aprovação (inclusive com RH e escritórios parceiros) | Evento (ata, decisão, intimação) -> tarefa com dono e prazo | A/B |
| E04 | Intimações no DJE | Robô monitora; se o processo existe, **cria marco histórico**, vincula inteiro teor, aciona workflow; se não existe, gera **publicação para análise** | Intimação -> marco/tarefa ou publicação a triar | A |
| E05 | Andamentos + **Insights Processuais** | Classifica (revelia, tutela, penhora, arquivamento) e alerta; avisa encerramento para parar de pagar o escritório | Andamento -> alerta/tarefa | A |
| E06 | Provisão, garantias e pagamentos | Provisão por processo, **correção automática** com índices dos tribunais, garantias, depósitos recursais, **aprovação de pagamento (guia)** e integração SAP | Valor/risco muda -> provisão recalculada | A/B |
| E07 | **Fechamento de provisão/contingência** | Fechamento mensal gravado (saldos iniciais, movimentações), "prévias de fechamento" ao longo do mês; separação principal/multa/juros/correção; classificação baixa/reavaliação/novo | Escritórios lançam dados -> 1 advogado valida -> relatório à contabilidade | B |
| E08 | **BI** | Dashboards padronizados (add-on); personalizados pagos; "relatórios pré-configurados"; auditoria | Dados do sistema -> painéis | A |
| E09 | **Portal/colaboração com escritórios parceiros** | Escritórios operam direto no sistema (subsídios, audiências, andamentos), sem e-mail e sem "circularização" | Tarefa para o escritório -> retorno no sistema | B |
| E10 | **E-Billing** | Contratos de honorários com **90+ tipos de regra** (por centro de custo/área), vínculo a processos, **detecção automática de movimentação que gera remuneração**, **pré-fatura** enviada por workflow, ajuste pelo escritório, validação | Movimento no processo -> lançamento -> pré-fatura | A |
| E11 | Contratos (CLM) | Solicitação por perguntas que geram cláusulas, banco de cláusulas, editor com comparação de versões, assinatura eletrônica, link externo com validade para fornecedor, obrigações recorrentes fiscalizáveis | - | A |
| E12 | Procurações | Banco de poderes, cadastro prévio de outorgantes, editor, comentários não incorporados, assinatura eletrônica, controle de vigência | - | A |
| E13 | Consultivo | Solicitação por assunto -> ficha específica; histórico filtrável; workflow com participantes adicionados dinamicamente | - | A |
| E14 | Societário, Imobiliário Regulatório, Marcas e Patentes | Fichas e workflows específicos; alertas de renovação de licenças | - | A |
| E15 | Integration Office (escritório) | Tarefas automáticas, **atualização monetária**, **ausências com redistribuição**, **acordos** (propostas e contrapropostas), **correspondentes** (cadastro, solicitação, extração de faturamento auditado), BI, e-billing, integração com o Enterprise do cliente | - | A |
| E16 | GEN AI Contestação | Interpreta inicial e subsídios, gera peça em blocos com fonte, revisão com aprovação por bloco, banco de teses, modelo .docx | Subsídio disponível (robô sobe) -> minuta -> revisão | B |
| E17 | Administração e segurança | Perfis de acesso, AD-SSO, trilha de auditoria, ambiente exclusivo e dados segregados, idiomas | - | A/B |

---

## 2B. A lógica do sistema (como funciona de ponta a ponta)

```
FONTES (Diário Oficial, DJEN, DJE, PJe/Projudi/eProc, Procon, Consumidor.gov)
        |  robôs/captura (por conta do advogado ou da empresa)
        v
 [Publicação / intimação / andamento bruto]  -- IA interpreta (classifica, extrai prazo, identifica ação)
        |
        +-- processo já existe? -- SIM --> "marco histórico" + inteiro teor vinculado + dispara WORKFLOW
        |                          NAO --> vira "publicação para análise" ou CADASTRO AUTOMÁTICO (ficha pré-preenchida p/ revisão)
        v
 [Prazo sugerido: ação + data fatal + base legal]  --(advogado confirma, 1 clique)--> AGENDA / TAREFA com responsável
        |                                                         ^ regra de distribuição (responsável pela pasta, rodízio, ausência)
        v
 [Execução: peça, subsídio, audiência, acordo, pagamento] --> andamento novo --> (loop)
        |
        +--> CLIENTE: envio semanal de andamentos (Adv) / portal com tradução
        +--> FINANCEIRO: honorário, boleto (Adv) | provisão, garantia, pagamento, e-billing (Enterprise)
        +--> INDICADORES/BI: fechamento mensal, dashboards, jurimetria
```

Pontos de lógica, com o que está e o que **não** está documentado:

1. **Como o processo nasce.** Três portas: manual, **a partir de uma publicação/intimação capturada** (o Adv diz "sem digitação manual"), ou **captura de distribuição** (Enterprise: robô traz capa, inicial, citação e preenche a ficha para revisão). Princípio: **nada entra "cru"; entra como rascunho para revisão humana**.
2. **Como o prazo é calculado e alertado.** (a) A publicação chega; (b) a IA lê o texto, identifica o **ato** que gera prazo, sugere a **ação** e a **data fatal**, mostrando a **base legal**; (c) conta **dias úteis conforme o CPC, com feriados e recessos**; (d) o advogado **confirma** e vai para a agenda; (e) alerta pela agenda. **Não documentado [a confirmar no trial]**: tabela de feriados por comarca/tribunal, regra de "dia útil após publicação" (DJe: data de disponibilização x publicação x início do prazo), contagem de intimação eletrônica (10 dias para consulta), suspensões por tribunal, tratamento de prazo em dobro, níveis e canais dos alertas (e-mail, push, WhatsApp), "D-1" etc.
3. **Como os andamentos entram.** Robôs monitoram continuamente (1ª instância; mais agentes de IA classificam). No Adv, "andamentos ilimitados com IA". No Enterprise, a captura é **serviço contratado à parte** ("mais de 10 serviços de automação").
4. **Como tarefas se ligam ao processo.** Tarefa nasce por **gatilho** (evento cadastrado: intimação, ata, decisão, citação) e é **atribuída por regra** (responsável pelo processo ou regra de distribuição); com **ausências** (férias/licença) o sistema **redistribui** as tarefas. No Enterprise, a tarefa pode ir para o **escritório parceiro** e voltar no mesmo sistema (workflow com aprovações).
5. **Como os indicadores são montados.** Os mesmos dados da ficha e do workflow alimentam o BI (add-on). Em provisão: o **fechamento** guarda foto mensal, compara movimentações (baixa, reavaliação, novo processo, correção) e separa principal/multa/juros. Para o escritório pequeno, o blog sugere indicadores (taxa de ocupação, prazo médio por tipo, casos por fase, receita recorrente x variável, ticket médio, inadimplência, custo por caso, margem por área, taxa de êxito por tipo/tribunal), **sem confirmar que o produto os entrega prontos [a confirmar]**.
6. **Papéis no DJE (relevante para o nosso motor legal).** O blog da eLaw explica que o Domicílio Judicial Eletrônico exige definir **Administrador, Preposto e Gestor de Cadastro**, e que há ferramenta de permissão do que cada posição enxerga. O sistema precisa refletir esses papéis (fonte: blog da eLaw; confirmar nas normas do CNJ).

---

## 3. O que a advogada provavelmente valoriza (hipótese fundamentada)

### 3.1 Primeiro, descobrir qual eLaw ela usa

| Cenário | Probabilidade (palpite) | Como saber |
|---|---|---|
| **A. Escritório prestador de uma empresa/banco que usa eLaw Enterprise** (ela é obrigada a lançar no sistema do cliente, ou usa o Integration Office) | **Alta**: os cases mostram 90% de adesão "voluntária" e a eLaw vende o IO como "integração nativa com o cliente" | Perguntar: "quem escolheu o sistema? O cliente pediu?" |
| **B. eLaw Adv (ex-Proadv)** | Média: base grande de pequenos escritórios e preço baixo | Perguntar: "o sistema se chamava Proadv antes?" / "quanto paga por mês?" |
| **C. Starter ou Integration Office comprado pelo escritório** | Média-baixa | Perguntar se tem implantação, consultor, customização |

### 3.2 O que ela provavelmente gosta (ligado a evidência)

1. **Não perder prazo sem esforço**: captura automática de publicações/intimações + prazo sugerido com base legal e um clique para a agenda (Adv); no Enterprise, **zero revelia** por monitoramento de DJE (Afya, Sicredi). É a dor nº 1 da advocacia.
2. **Tela inicial que diz o que fazer hoje** (prazos da semana, audiências, últimas intimações). Reduz decisão.
3. **Menos digitação**: processo cadastrado a partir da publicação; ficha vem preenchida.
4. **Tarefa com dono**: gatilho -> tarefa -> responsável, **ausência redistribui** (quem tem equipe sente a diferença).
5. **Configurabilidade sem programador** (único elogio repetido em três depoimentos: "adaptação rápida", "programável sem customização cara", "customização dos processos").
6. **Dados/relatórios e correção monetária** (elogio direto da usuária de 2020 e do Silva e Mello).
7. **Cliente informado sem esforço**: envio semanal automático e portal com linguagem simples (Adv).
8. **Preço previsível** (Adv) e **financeiro incluído** (boleto, fluxo de caixa, DRE) sem módulo extra.
9. **Segurança/estabilidade** (certificações, "nunca tivemos paralisação"): importante quando o cliente corporativo audita o escritório (vídeo "Seu software passa em auditoria de multinacionais?").
10. **Equipe/atendimento** ("a equipe é fantástica"), em contraste com a crítica de SLA: o lado humano pesa.

Isto é **hipótese**: a validação exige 20 minutos de conversa com ela (roteiro no fim do item 5).

---

## 4. O que copiar, o que melhorar e o que não fazer

### 4.1 Copiar (comprovadamente valorizado e viável no nosso stack)

| # | Copiar | Por quê |
|---|---|---|
| C1 | **Home "hoje"**: prazos da semana, audiências, últimas publicações, novos processos | Decisão em 5 segundos; é o que a advogada vê |
| C2 | **Publicação -> prazo sugerido (ato, ação, data fatal, base legal) -> confirma com 1 clique -> agenda/tarefa** | Fluxo central; humano sempre confirma |
| C3 | **Cadastro de processo como rascunho a partir de publicação/intimação** | Zero digitação, revisão humana |
| C4 | **Gatilho -> tarefa com dono por regra; redistribuição por ausência** | Nosso módulo de tarefas já existe; falta o motor de regras |
| C5 | **Ficha parametrizável** (campos e abas por tipo de ação/área) | O elogio mais repetido |
| C6 | **Envio automático de andamentos ao cliente em linguagem simples** | Reduz o "qual o andamento?" |
| C7 | **Financeiro incluído** (boleto, fluxo de caixa, DRE, centro de custo) | Já temos o financeiro comum |
| C8 | **Preço por franquia de processos monitorados + excedente + usuário barato + trial 10 dias sem cartão** | Transparente e fácil de comparar |
| C9 | **IA com rastreabilidade** (fonte por parágrafo, revisão por bloco, modelo .docx do escritório, banco de teses próprio, dados segregados e "não treina com seus dados") | Confiança do advogado |
| C10 | **Gestão de correspondentes** (cadastro, solicitação, acompanhamento, faturamento) | Dor real de quem tem audiência em outra comarca |
| C11 | **Ausências** (férias/licença) com redistribuição | Pequeno e de alto valor |
| C12 | Selos de segurança e **relatório de auditoria** para o cliente corporativo | Abre porta de banca de volume (fase 3) |

### 4.2 Melhorar (onde a plataforma comum nos dá vantagem)

| # | Melhorar | Como |
|---|---|---|
| M1 | **Cliente via WhatsApp**, não só portal | Temos CRM com WhatsApp. O "andamento em linguagem simples" sai no canal que o cliente usa, com resposta e histórico no CRM |
| M2 | **Cadastro único** (cliente, parte, contraparte, procurador, escritório correspondente) | Evita recadastrar a mesma pessoa em CRM, processo e financeiro |
| M3 | **Timesheet e rentabilidade por processo/cliente** | eLaw Adv não menciona timesheet **[a confirmar]**; Legal One tem agenda com timesheet. O blog da eLaw recomenda "custo por caso" e "taxa de ocupação", mas não vi o produto entregá-los |
| M4 | **Motor legal transparente e versionado**: regras de contagem com **versão, fonte legal, caso de teste e data de vigência**, tabela de feriados por tribunal/comarca, mostrando "por que este prazo" | A eLaw mostra "base legal ao lado"; podemos mostrar o **cálculo passo a passo** e testá-lo com um conjunto de casos |
| M5 | **Time de agentes de IA** (triagem de publicação, minuta, cobrança, resumo ao cliente) com **trilha de auditoria** | Nosso diferencial: agentes orquestrados na plataforma, não "módulos de IA" soltos |
| M6 | **Ponte jurídico-contábil**: ao classificar risco de perda no processo, gerar **dado para provisão/contingência** e para o contador do cliente | A eLaw só faz isso no mundo enterprise com projeto de consultoria; nosso pacote Contábil existe. Regra contábil (ex.: CPC 25/NBC TG 25) **[a confirmar com contador]** |
| M7 | **Preço sem pegadinha**: IA incluída com franquia e limite visível | A eLaw cobra "peças com IA" à parte e tem duas tabelas de preço publicadas |
| M8 | **Implantação em horas, não projeto**: importar planilha, importar por número CNJ, wizard | Evita o caminho "consultoria + customização" da eLaw Enterprise |
| M9 | **Captura sem credencial pessoal quando possível** | Ver B5 (`pesquisa/plataforma/B5-captura-sem-certificado.md`) |

### 4.3 O que NÃO fazer

1. **Não copiar o "sprawl" enterprise** (9 módulos, SAP, eSocial, imobiliário, marcas, societário) na fase 1. Esses módulos dependem de projeto, customização e venda consultiva. Se entrar, é pacote DJ em fase 3.
2. **Não prometer "zero perda de prazo".** O prazo é responsabilidade do advogado; a própria eLaw diz "revisão final é sempre do advogado" e "a revisão é obrigatória". Texto e contrato devem refletir isso. [Termos de uso de concorrentes, ex.: Projuris, também deixam a responsabilidade com o advogado.]
3. **Não depender de um único canal de captura.** Relatos de falha de captura (reclamação no RA) e instabilidade de DJE/DJEN [J1] pedem **monitor de saúde da captura** e **alerta ao advogado quando o robô parar** ("a última captura foi há X horas").
4. **Não colocar métrica de plano confusa** ("sites de intimação eletrônica" e "pesquisas de Diário") como eixo de preço. Franquia de **processos** e **usuários** basta.
5. **Não vender IA generativa de peça sem trilha de fonte, revisão humana e política de dados** (a eLaw fez disso o argumento).
6. **Não deixar a IA decidir prazo sozinha.** Sugerir, mostrar cálculo, exigir confirmação (e registrar quem confirmou).
7. **Não usar marca/nome do concorrente** (a landing da eLaw escreve "As\*\*\*a" mascarado; seguir essa prática se citarmos).
8. **Não confiar nos números de mercado da eLaw** (150 mil advogados, 5 mil escritórios, 100 mil usuários) para dimensionar mercado; são declarações de marketing.
9. **Não copiar "ODR com 8 agentes" agora**: alto risco regulatório e de reputação (negociar com a parte contrária por WhatsApp). Avaliar só com advogado supervisor, fase 3.

---

## 5. Funcionalidades candidatas (catálogo provisório, prefixo EL-)

Legenda: **P** = prioridade sugerida (M = MVP do pacote, V2, V3). **Base** = o que já existe na plataforma comum que reutiliza. **Fonte** = onde apareceu (Adv = eLaw Adv; ENT = Enterprise/Business; IO = Integration Office; BLOG).

### Processos e cadastro

| ID | Funcionalidade | P | Base | Fonte |
|---|---|---|---|---|
| EL-001 | Ficha de processo (número CNJ, partes, tribunal/comarca, natureza, fase, valor da causa, responsável) | M | Cadastro único, tarefas, documentos | Adv, ENT |
| EL-002 | Cadastro automático do processo a partir de publicação/intimação (rascunho p/ revisão) | M | Motor legal, agentes de IA | Adv, ENT |
| EL-003 | Cadastro por busca do número CNJ (consulta em tribunal) e importação por planilha | M | Importador | BLOG (migração) |
| EL-004 | Fichas e abas parametrizáveis por tipo de ação/área (campos customizados) | V2 | Motor de formulários | ENT |
| EL-005 | Vínculo processo <-> cliente, parte contrária, advogado, correspondente | M | Cadastro único | Adv |
| EL-006 | Linha do tempo do processo (andamentos, prazos, audiências, documentos, tarefas, financeiro) | M | Timeline comum | Adv, ENT |
| EL-007 | Carteira com filtros e visão "Kanban por fase processual" | V2 | Tarefas/Kanban | BLOG |
| EL-008 | Encerramento e arquivamento com motivo e resultado (êxito/perda) para estatística | V2 | - | ENT |

### Publicações, intimações e andamentos

| ID | Funcionalidade | P | Base | Fonte |
|---|---|---|---|---|
| EL-009 | Caixa de publicações do Diário Oficial por nome/OAB (DJEN e diários) | M | Captura | Adv |
| EL-010 | Caixa de intimações eletrônicas (PJe, Projudi, eProc, DJE/Domicílio) | M | Captura | Adv, ENT |
| EL-011 | Intimação sem processo cadastrado vira "publicação para análise" (triagem) | M | Fila de triagem | ENT |
| EL-012 | Intimação com processo existente cria marco no histórico + vincula inteiro teor + dispara tarefa | M | Tarefas | ENT |
| EL-013 | Monitoramento contínuo de andamentos (1ª e 2ª instância) | M | Captura | Adv, ENT |
| EL-014 | Classificação de andamento por IA (revelia, tutela, penhora, sentença, arquivamento) com alerta | V2 | Agentes de IA | ENT |
| EL-015 | Monitor de saúde da captura (última leitura, falhas, alerta ao usuário) | M | Observabilidade | (nosso) risco RA |
| EL-016 | Papéis do DJE (administrador, preposto, gestor) refletidos nas permissões | V2 | Perfis | BLOG (DJE) |

### Prazos e agenda

| ID | Funcionalidade | P | Base | Fonte |
|---|---|---|---|---|
| EL-017 | Sugestão de prazo por IA: ato, ação, data fatal, **base legal visível**, confirmar em 1 clique | M | Motor legal | Adv (vídeo 10/2026) |
| EL-018 | Calculadora de prazos (dias úteis CPC, feriados por tribunal/comarca, recessos, suspensões) | M | Motor legal | Adv |
| EL-019 | "Por que este prazo": cálculo passo a passo, versão da regra e quem confirmou | M | Motor legal, auditoria | (nosso) |
| EL-020 | Alertas escalonados (D-5, D-2, D-1, dia) por e-mail, push e WhatsApp, com escalonamento ao sócio | M | Notificações, WhatsApp | Adv/C |
| EL-021 | Agenda unificada (prazos, audiências, compromissos) com visão semana e responsável | M | Agenda | Adv |
| EL-022 | Audiências: registro, local/link, responsável, correspondente, resultado e ata | M | Agenda, tarefas | Adv, IO |
| EL-023 | Prazo fatal x prazo interno (D-1) | V2 | - | BLOG de concorrentes [a confirmar] |
| EL-024 | Tela inicial "hoje" (prazos da semana, audiências, últimas intimações, novos processos) | M | Dashboard | Adv |

### Tarefas e workflow

| ID | Funcionalidade | P | Base | Fonte |
|---|---|---|---|---|
| EL-025 | Tarefas automáticas por gatilho/evento (intimação, ata, citação, decisão) | M | Tarefas | Starter, IO, ENT |
| EL-026 | Regras de distribuição de responsável (responsável da pasta, rodízio, capacidade) | V2 | Motor de regras | IO, ENT |
| EL-027 | Controle de ausências (férias, licenças) com redistribuição automática | V2 | RH/Tarefas | Starter, IO |
| EL-028 | Workflow configurável com aprovações (ex.: aprovar proposta de acordo, aprovar pagamento) | V2 | Fluxos | ENT |
| EL-029 | Modelos de tarefas por tipo de ação (checklist de subsídio, contestação, audiência) | M | Templates | ENT/BLOG |

### Cliente, comunicação e portal

| ID | Funcionalidade | P | Base | Fonte |
|---|---|---|---|---|
| EL-030 | Portal/app do cliente com andamento em linguagem simples | M | App do cliente | Adv |
| EL-031 | Envio automático e periódico de andamentos selecionados ao cliente (WhatsApp/e-mail) | M | CRM WhatsApp | Adv |
| EL-032 | Resumo do andamento em duas versões (técnica e "sem juridiquês") gerado por IA | M | Agentes de IA | Adv (vídeo) |
| EL-033 | Cadastro de cliente com histórico de reuniões, consultas, documentos e financeiro | M | Cadastro único, CRM | Adv |
| EL-034 | Controle do que o cliente vê (andamentos liberados) | M | Permissões | (nosso) |

### Financeiro, honorários e tempo

| ID | Funcionalidade | P | Base | Fonte |
|---|---|---|---|---|
| EL-035 | Contratos de honorários (fixo, mensalidade, êxito, hora, misto) vinculados a processo | M | Financeiro | Adv, E-Billing |
| EL-036 | Lançamento de receitas/despesas, plano de contas, centro de custo, fluxo de caixa, DRE | M | Financeiro | Adv |
| EL-037 | Boleto/PIX de honorário e conciliação | M | Financeiro | Adv |
| EL-038 | Custas e despesas do processo com repasse ao cliente | M | Financeiro | (nosso) |
| EL-039 | Timesheet por processo/cliente e rentabilidade (custo por caso, margem por área) | V2 | Timesheet | BLOG (indicadores); Legal One |
| EL-040 | Atualização monetária de valores da causa/pedidos com índices dos tribunais | V2 | Motor legal | IO, ENT |
| EL-041 | Gestão de correspondentes (cadastro por comarca, solicitação, acompanhamento, faturamento auditado) | V2 | Cadastro, tarefas, financeiro | Starter, IO |
| EL-042 | Gestão de acordos (propostas, contrapropostas, status, parcelas) | V2 | Financeiro | Starter, IO |
| EL-043 | Pré-fatura de honorários a partir de eventos do processo (e-billing do escritório) | V3 | Financeiro | IO, E-Billing |

### IA e peças

| ID | Funcionalidade | P | Base | Fonte |
|---|---|---|---|---|
| EL-044 | Leitura de petição inicial/ata/sentença/acórdão/ofício por IA preenchendo campos | V2 | Agentes de IA, documentos | ENT, IO |
| EL-045 | Gerador de peças com banco de teses do escritório, blocos editáveis, fonte por parágrafo, modelo .docx | V2 | Agentes de IA, documentos | GEN AI, Adv |
| EL-046 | Parametrização de IA (tom, profundidade, criatividade) por perfil/carteira | V3 | - | GEN AI |
| EL-047 | Política de dados da IA visível ("não treina com seus dados", segregação por cliente) | M | Governança | GEN AI |
| EL-048 | Pesquisa de jurisprudência | V2/V3 (ou parceiro) | Integração | Adv |
| EL-049 | "Insights da decisão": termômetro favorável/desfavorável por lado (autor/réu) | V3 | Agentes de IA | Adv (vídeo) |

### Indicadores, documentos e administração

| ID | Funcionalidade | P | Base | Fonte |
|---|---|---|---|---|
| EL-050 | Painel de indicadores do escritório (carteira por fase, prazo médio, êxito por tipo/tribunal, receita recorrente x variável, inadimplência) | V2 | BI comum | BLOG |
| EL-051 | Relatórios agendados (envio automático por e-mail) | V2 | - | Legal One |
| EL-052 | GED por processo com cota por plano e versionamento | M | Documentos | Adv, ENT |
| EL-053 | Geração de procuração e contrato de honorários por modelo + assinatura eletrônica | M | Documentos | CLM/Procurações |
| EL-054 | Trilha de auditoria (quem confirmou prazo, quem editou ficha) | M | Auditoria | ENT |
| EL-055 | Perfis de acesso e SSO | V2 | Perfis | ENT |

### Pacote Departamento Jurídico (fase 3, só se houver demanda)

| ID | Funcionalidade | P | Fonte |
|---|---|---|---|
| EL-056 | Provisão e contingência por processo com correção e risco (ponte com contábil) | V3 | ENT |
| EL-057 | Fechamento mensal de provisão com "prévia" e foto gravada | V3 | ENT, cases Cosan/Verzani |
| EL-058 | Garantias e depósitos recursais com conciliação | V3 | ENT |
| EL-059 | Colaboração com escritórios parceiros no mesmo sistema | V3 | ENT, IO |
| EL-060 | Contratos (CLM), Procurações, Consultivo, Societário | V3 | ENT |
| EL-061 | Captura pré-processual (Procon, Consumidor.gov) | V3 | ENT |
| EL-062 | ODR/negociação automatizada com agentes | V3 (com ressalva do item 4.3) | ODR |

---

## 6. Lacunas e como fechar

| Lacuna | Como fechar (esforço) |
|---|---|
| Telas reais do eLaw Adv e como o prazo é calculado | **Fazer o trial de 10 dias** (sem cartão) e documentar 15 telas e 10 casos de prazo (publicação com feriado, recesso, prazo em dobro, intimação eletrônica). 2 a 3 horas |
| Qual eLaw a advogada usa e por quê | Conversa de 20 minutos. Roteiro: (1) quem escolheu o sistema; (2) o que abre primeiro de manhã; (3) como descobre um prazo novo; (4) o que o cliente do escritório exige; (5) o que já a irritou; (6) o que faria ela trocar |
| Preço correto do Adv (duas tabelas) | Conferir no checkout do trial e na página `/elawadv`; guardar print |
| Preço Business/Enterprise/IO | Não público; pedir proposta só se formos pesquisar o lado DJ |
| Avaliações independentes | Reclame Aqui (ler com navegador), Capterra BR, grupos de advogados; entrevistar 5 a 8 usuários |
| Se existe timesheet, WhatsApp, CRM no Adv | Trial |
| Credencial/certificado na captura | Trial + perguntar ao suporte |
| Controle acionário, receita | Valor/Brazil Journal/Neofeed/registro societário [a confirmar] |
| Vídeos do produto | Assistir os três vídeos do Adv no YouTube (bloqueados para mim) |

---

## 7. Fontes (todas acessadas em 08/11/2026)

**Site oficial eLaw**
- Home: https://elaw.com.br/
- Sobre/certificações: https://elaw.com.br/sobre/
- eLaw Adv: https://elaw.com.br/elawadv/ e landing https://conteudo.elaw.com.br/contrate-o-elaw-adv
- Contencioso: https://elaw.com.br/contencioso/ ; Tributário: https://elaw.com.br/contencioso-tributario/ ; CLM: https://elaw.com.br/clm/ ; Procurações: https://elaw.com.br/procuracoes/ ; Consultivo: https://elaw.com.br/consultivo/ ; Societário: https://elaw.com.br/societario/ ; E-Billing: https://elaw.com.br/e-billing/ ; Imobiliário: https://elaw.com.br/imobiliario-regulatorio/ ; Marcas e Patentes: https://elaw.com.br/marcas-e-patentes/
- eLaw Business: https://elaw.com.br/elaw-business/ ; Starter: https://elaw.com.br/elaw-starter/ ; Integration Office: https://elaw.com.br/elaw-integration-office/ ; Escritório (ODR): https://elaw.com.br/escritorio-de-advocacia/ ; Departamento jurídico: https://elaw.com.br/departamento-juridico/
- IA e automação: https://elaw.com.br/ia-e-automacao/ ; https://elaw.com.br/recursos-de-ia/
- eLaw Experience: https://elaw.com.br/elaw-experience/ ; Cases: https://elaw.com.br/cases/
- Página AB2L (IO + Enterprise, depoimentos): https://conteudo.elaw.com.br/elaweelawio
- API de posts (lista dos 108 posts): https://elaw.com.br/wp-json/wp/v2/posts
- Posts usados: Whirlpool (https://elaw.com.br/2026/04/elaw-tecnologia-amplia-gestao-juridica-da-whirlpool-na-america-latina/), Cosan (https://elaw.com.br/2025/10/cosan-e-elaw-sinergia-juridico-contabil-para-um-fechamento-via-governanca-e-automacao/), Afya (https://elaw.com.br/2025/08/o-juridico-consegue-evoluir-junto-com-a-empresa-a-afya-provou-que-sim-2/), NIO (https://elaw.com.br/2025/09/nio-e-elaw-uma-parceria-estrategica-para-construir-o-juridico-do-zero/), BLS (https://elaw.com.br/2025/11/de-2-horas-para-45-minutos-como-a-ia-da-elaw-transformou-as-contestacoes-no-bls-advogados/), Queiroz Cavalcanti (https://elaw.com.br/2025/11/a-ia-que-se-torna-redatora-em-1-dia-e-transforma-contestacoes-o-case-queiroz-cavalcanti/), MRV (https://elaw.com.br/2024/09/case-sucesso-mrv-elaw/), Sicredi (https://elaw.com.br/2025/07/sicredi-como-a-maior-cooperativa-financeira-do-brasil-otimizou-sua-gestao-juridica-com-elaw/), Rueda & Rueda (https://elaw.com.br/2025/07/rueda-rueda-advogados-e-elaw-alta-performance-no-contencioso-de-escala-e-o-apoio-tecnologico/), DJE (https://elaw.com.br/2025/01/dje-afinal-como-esta-funcionando-e-qual-a-nossa-expectativa-sobre-ele/), Fechamento de provisão (https://elaw.com.br/2025/04/fechamento-de-provisao-controle-estrategia-e-impacto-direto-no-setor-juridico/), Fenalaw 2025 (https://elaw.com.br/2025/10/elaw-apresenta-portfolio-avancado-de-ia-generativa-na-fenalaw-2025/), Adv vs outros (https://elaw.com.br/2026/04/elaw-adv-ou-outros-softwares-juridicos-como-escolher-a-tecnologia-certa-para-a-operacao-juridica/), Planos (https://elaw.com.br/2026/01/como-escolher-o-melhor-plano-de-assinatura-para-o-seu-software-juridico/), Gestão por dados (https://elaw.com.br/2026/03/como-fazer-gestao-baseada-em-dados-em-um-escritorio-pequeno-de-advocacia/), Produtividade (https://elaw.com.br/2026/04/como-calcular-produtividade-no-escritorio-de-advocacia/), Contabilidade e reforma tributária (https://elaw.com.br/2026/04/integrando-sistemas-contabeis-com-softwares-juridicos-apos-a-reforma-tributaria/), eSocial (https://elaw.com.br/2025/03/simplifique-a-gestao-do-esocial-com-as-novas-funcionalidades-da-elaw/), Personalização (https://elaw.com.br/2025/04/quem-personaliza-pode-transformar-seu-software-juridico-com-colaboracao/), OCI (https://elaw.com.br/2024/05/lorem-ipsum-2/), Ranking scaleups (https://elaw.com.br/2025/12/elaw-conquista-o-4o-lugar-no-ranking-top-open-scaleups/), Proadv vira eLaw Adv (https://elaw.com.br/2025/11/crescer-na-advocacia-comeca-com-estrategia/)

**Vídeos (descrições via RSS)**
- Canal: https://www.youtube.com/@ElawTecnologiaSA ; feed https://www.youtube.com/feeds/videos.xml?channel_id=UC2F2N2NyuD94AesZaqIUZ1A
- Captura de prazos com IA: https://www.youtube.com/watch?v=wkAaWPG4J_g e https://www.youtube.com/watch?v=PHEyhxJvCNQ

**Imprensa**
- TI Inside, 02/10/2024: https://tiinside.com.br/02/10/2024/elaw-cria-divisao-de-consultoria-e-anuncia-paulo-silva-para-comandar-a-operacao/
- Migalhas, 2025 (ODR, PepsiCo, Carrefour): https://www.migalhas.com.br/quentes/426549/legal-tech-brasileira-aposta-em-ia-para-transformar-o-mercado-juridico
- Portal ERP, 17/04/2020 (joint venture Impacta, PROADV, IBM): https://portalerp.com/elaw-anuncia-joint-venture-com-impacta
- Baguete, 13/07/2017 (OutSystems): https://www.baguete.com.br/noticias/elaw-outsystems-para-desenvolvimento

**Agregadores, lojas e concorrentes**
- B2B Stack eLaw: https://www.b2bstack.com.br/product/elaw ; comparativo com Projuris ADV: https://www.b2bstack.com.br/compare/elaw-vs-projurisadv ; Proadv: https://www.b2bstack.com.br/product/proadv
- Google Play (app): https://play.google.com/store/apps/details?id=com.proadv.app
- Reclame Aqui (título via busca, página bloqueada 403): https://www.reclameaqui.com.br/elaw/reclamacao-falha-na-prestacao-do-servico_eA8AhkBTvJagbaKv/
- Legal One Firm: https://www.thomsonreuters.com.br/pt/juridico/legal-one/firm.html ; Corporate: https://www.thomsonreuters.com.br/pt/juridico/legal-one/corporate.html
- Astrea/Aurum: https://www.aurum.com.br ; Projuris ADV (captura e intimações): https://www.projuris.com.br/intimacao-software-juridico/
- Vagas (via busca): https://jobs.quickin.io/elaw/jobs (JavaScript, não lido)
- Cruzamento interno: `pesquisa/juridico/J1-mercado-software-juridico.md`

**Buscas na web feitas: 20 (de 28 permitidas).** Não houve commit.

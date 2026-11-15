# J7 - SGJur: o que é, o que faz e a lógica por trás (para o pacote Jurídico)

Data da pesquisa e do acesso a todas as fontes: **08/11/2026**.
Método: 14 buscas na web (limite do escopo: 28) e leitura direta de páginas com `curl` + extração de texto com `python3 -I` (site oficial `sgjur.com.br` e páginas legais; site da empresa `sgemp.com.br`; consulta de CNPJ pela BrasilAPI; **pacote de código público do aplicativo `app.sgjur.com.br`, lido sem login**, de onde extraí os textos da interface). Arquivos de trabalho em `.../scratchpad/j7/` (não versionados).

---

## 0. Ressalvas de método (leia primeiro)

1. **O SGJur existe e foi achado com certeza razoável quanto ao nome**, mas **a busca na web não o conhece**: nenhum resultado independente (nem notícia, comparativo, avaliação, vídeo, vaga, rede social). Tudo o que sei vem **do próprio fabricante** (site, termos, política de privacidade, página de segurança) e **do código da interface publicada**. Isso muda o peso de cada afirmação (item 2).
2. **Não vi o sistema funcionando.** Não entrei no app (exige cadastro; não criei conta), não assisti a demo e não achei vídeo. O que chamo de "interface" são **textos de tela e regras embutidas no código JavaScript público** (mensagens de erro, rótulos, avisos). É boa evidência de **lógica e intenção de produto**, mas **não prova que a função está ligada para todos os planos, nem que funciona bem**.
3. **Nenhum relato de usuário.** Zero avaliações em qualquer lugar que eu consegui ler. Não há como dizer se o suporte é bom ou se a captura falha.
4. **Produto muito novo.** Os termos de uso são de 08/10/2026, a política de privacidade de 06/10/2026 e a página de segurança de 19/10/2026. O histórico de "passagem por etapa" do processo só existe desde 17/09/2026. Ou seja, **o SGJur tem semanas ou poucos meses de vida pública**; a empresa é mais velha (CNPJ de 2018) e tem um produto irmão, o SG CRM.
5. **Ligação com a advogada.** Um produto lançado em out/2026 e sem presença pública levanta a hipótese de que ela o conheceu por **convite, piloto ou indicação** (ou de que o nome que ela disse é de outro produto, item 1.3). **[a confirmar com ela]** (perguntas no item 4.1).
6. Legislação citada pelo fabricante (Lei 11.419/2006, CPC arts. 219, 220 e 224, Resolução CNJ 455/2022, IN INSS 128/2022) **não foi reconferida aqui**; os relatórios J3 e J4 tratam do tema.

**Níveis de confiança usados nas tabelas:**

| Sigla | Significa | Peso |
|---|---|---|
| **F** | Descrito pelo fabricante (site oficial, páginas legais) | Marketing: diz o que querem que se acredite |
| **U** | Visto no código/textos da interface publicada (app) | Lógica real do produto, mas não testada nem vista rodando |
| **F+U** | Os dois concordam | **Alta** para "existe e tem esta lógica"; sem prova de qualidade |
| **D** | Visto em demo | **Nenhum item** (não houve demo) |
| **R** | Relato de usuário | **Nenhum item** (não achei relato) |
| **I** | Inferência minha | Baixa; marcada como tal |

---

## 1. Ficha do SGJur

### 1.1 Identidade

| Item | O que apurei | Fonte | Confiança |
|---|---|---|---|
| Nome exato | **SGJur** (sem espaço; título do site: "SGJur — o sistema de gestão para escritórios de advocacia") | sgjur.com.br | Alta |
| Empresa | **SG EMP LTDA**, CNPJ 32.321.219/0001-89, nome fantasia na Receita **"SG CRM"**; rua Desembargador Joaquim Bandeira de Mello, 657, São Paulo/SP | Termos e Privacidade do SGJur; BrasilAPI (dados da Receita) | Alta |
| Natureza e porte | Sociedade limitada, **microempresa**, capital social **R$ 10.000**, atividade principal "Consultoria em tecnologia da informação" (CNAE 6204-000), com desenvolvimento e licenciamento de software nos CNAEs secundários; **duas pessoas** como sócios-administradores (nomes omitidos aqui; constam no cadastro público); entrada de ambos na sociedade em 21/07/2026 | BrasilAPI | Alta |
| Tempo de mercado | CNPJ aberto em **27/12/2018**. O produto horizontal **SG CRM** (`sgcrm.com.br` leva a `app.sgcrm.com.br`) tem blog com posts de 15 e 16/06/2026 (clínicas, imobiliárias, WhatsApp). O **SGJur é a versão jurídica do mesmo app** (o título da página do app ainda é "SG CRM"). Rastros mais antigos que ago/2026 não achei (o Internet Archive não tem cópia de `sgjur.com.br`). **Estimo: SGJur com poucos meses de vida pública** | BrasilAPI; sgjur.com.br; blog SG CRM; Archive.org | Média (I) |
| Tamanho da equipe, clientes, receita, investidores | **Não encontrei [a confirmar]** | - | - |
| Contato | comercial@sgjur.com.br; contato@sgemp.com.br; DPO privacidade@sgemp.com.br | sgemp.com.br | Alta |
| Vagas, blog jurídico, vídeos, base de ajuda, comparativos | **Nada público achado**. O blog `sgjur.com.br/blog` mostra o blog do SG CRM (3 posts, nenhum jurídico). O app tem tela de **Suporte** e **Chamados** (U), mas a base de ajuda não é pública | sgjur.com.br/blog; app | Alta (ausência) |
| Selos e certificações | **Nenhum** declarado. A página de segurança diz, expressamente, preferir "uma lista menor e verdadeira" | sgjur.com.br/seguranca | F |

### 1.2 Público, posicionamento e como vende

| Item | O que apurei | Confiança |
|---|---|---|
| Público declarado | **Escritórios de advocacia**: plano individual (1 advogado), Equipe (até 6), Escritório (até 15) e "Corporativo" (escritórios grandes e **departamentos jurídicos**, sob medida) (F). Não menciona procuradorias públicas nem assessoria jurídica em nenhum lugar (F) | F |
| Quem manda no preço | **Por advogado/inscrição na OAB**, não por nome monitorado nem por processo. "Publicações ilimitadas em todos os planos" porque a fonte (DJEN) é pública | F |
| Posicionamento | "A plataforma de gestão para a advocacia": **14 módulos integrados**, do primeiro contato ao acompanhamento; "sem robô e sem a sua senha do tribunal"; "a IA mostra de onde tirou cada coisa" | F |
| Tom | Honesto sobre limites: "Ele **não** vai peticionar por você", "Não redige peça" (módulo de IA de documentos), "Em construção" (Painel dos Sócios), "Conferir continua sendo trabalho seu" | F |
| Forma de contratar | Cadastro self-service (`/register?segment=advocacia`) e "Agendar demonstração"; assinatura **mensal no cartão, cancela quando quiser**; sem teste gratuito anunciado (os termos falam em "planos gratuitos, períodos de teste" de forma genérica) | F |

### 1.3 Mais de um produto com nome parecido? Como decidi

| Candidato | O que é | Decisão |
|---|---|---|
| **SGJur** (`sgjur.com.br`, SG Emp LTDA) | Gestão para escritórios de advocacia; DJEN + prazos; CRM; IA com fonte. Lançado ~2026 | **É o produto do pedido**: nome idêntico, é de gestão jurídica e responde pelo perfil "funcionalidades e lógica". Probabilidade de existir: ~certa. Probabilidade de ser o que a advogada quis dizer: **alta, mas a confirmar** (nome idêntico; falta só ela confirmar que viu esse) |
| **SIJUR** (`sijur.com.br`) | Sistema web para advogados, "vai até o tribunal buscar o trabalho"; fundado 2019 (B2B Stack); planos R$ 0 / R$ 49 / R$ 149 / R$ 399; cadastro automático em eproc (TJRS, TJSC, TJSP, TRF4, TRF6, JFRJ) e PJe (TRF3, TRT4), peticionamento no eproc, cálculo revisional, mais de 180 ferramentas grátis, CRM, financeiro | **Candidato mais provável a confusão de nome** (uma letra de diferença e sonoridade igual). Cobertura bem diferente (captura por tribunal e peticionamento). Não aprofundei: **só registrei** |
| **SG Jurídico** (`sgjuridico.com.br`) | "Santo Graal Jurídico": material de estudo para carreiras jurídicas | Descartado (não é software de gestão) |
| **SISJURI** (BCS) | Sistema jurídico mais antigo, citado em notícias de Migalhas | Descartado por nome (outro produto) |
| "SGJUD" (TJRJ) | Secretaria-Geral Judiciária, órgão do tribunal | Descartado |
| "SGJUR" no UN/LOCODE | Código do porto de Jurong (Singapura) | Irrelevante |

**Conclusão (item 6 do pedido):** o SGJur **foi achado com certeza quanto à existência e ao nome**. **Não posso garantir que seja o sistema a que a advogada se referia** (pode ter sido outra grafia, como SIJUR, ou um nome interno). **Recomendo uma pergunta de 1 minuto: "o site é sgjur.com.br?"**.

### 1.4 Preço (público)

Fonte: sgjur.com.br, seção Planos, acesso em 08/11/2026. Valores por escritório, em reais, mensal no cartão.

| Plano | Preço | Inscrições OAB | Usuários | Integrações incluídas | IA | Armazenamento | Observações |
|---|---|---|---|---|---|---|---|
| **Advogado** | **R$ 377/mês** | 1 | 1 | 1 | Stella (assistente) | 20 GB | WhatsApp Light + Stella; "Agente de IA para o WhatsApp, contratado à parte" |
| **Equipe** | **R$ 1.977/mês** | 6 | 6 | 3 | Stella | 70 GB | + Instagram e Messenger; **automações de fluxo**; **conflito de interesses e dupla validação de prazo** |
| **Escritório** | **R$ 4.200/mês** | 15 | 15 | 5 | Stella | 160 GB | Painel do escritório inteiro |
| **Corporativo** | Sob medida | Sob medida | Ilimitado | Sob medida | Stella + sob medida | Sob medida | Implantação acompanhada, suporte dedicado |

- Publicações **ilimitadas** em todos os planos (F).
- **Cobrados à parte, em qualquer plano (F):** os **"especialistas de IA" por área** (Trabalho, Tributário, Previdenciário, Família, Empresarial, Bancário, Penal, Consumidor, Civil) e o agente de WhatsApp.
- **Créditos (U):** o app tem **saldo e extrato de créditos** para consultas pagas (busca por OAB no tribunal, "Monitoramento Premium" com partes, andamento completo e autos, monitoramento de CPF/CNPJ renovável a cada 30 dias, WhatsApp Oficial por consumo). Um aviso diz "ainda não está à venda: falta o preço em créditos" para o monitoramento por CPF/CNPJ.
- **Leitura (I):** por usuário, sai a R$ 377 (solo), R$ 330 (Equipe, 6) e R$ 280 (Escritório, 15). Acima da faixa de entrada do mercado (J1: R$ 220 a R$ 500 por mês para 1 a 5 usuários) para quem é solo; competitivo para equipe de 15. O **degrau do plano Equipe é grande** (de R$ 377 para R$ 1.977 ao passar de 1 para 2 advogados), o que **não** favorece o escritório pequeno (nosso público inicial, resposta (a) do usuário).

---

## 2. Mapa de funcionalidades e fluxos

**Como ler:** cada linha é uma função; a confiança segue a legenda do item 0. "Lógica observada" é o que o código/fabricante revela sobre **como** funciona. **Todos os itens "U" valem como "o app tem este texto/regra", não como "testei".**

### 2.1 Publicações, prazos e agenda (o coração do produto)

| # | Função | Lógica observada | Conf. |
|---|---|---|---|
| 1 | **Inscrição na OAB** | O advogado informa **número e seccional**; o sistema **confere na hora, na fonte, e mostra o nome do advogado** ("assim você sabe que cadastrou a inscrição certa, e não uma parecida"). Há aviso "Não confirmada na fonte: confira o número". Vigia a saúde da leitura: "inscrição com a leitura **parada** porque o titular está sem acesso" e "inscrição **sem resposta do CNJ** nas últimas tentativas; pode haver publicação não lida" | F+U |
| 2 | **Caixa de publicações (DJEN)** | Todas as publicações da inscrição, **de todos os tribunais que publicam no DJEN**, com teor completo e partes; **sem robô, sem senha do tribunal, sem certificado**. Cada uma tem **três saídas**: virar prazo, **arquivar por ciência**, ou "nada a fazer" (o tribunal cancelou o ato) | F+U |
| 3 | **Triagem com dono** | Cada publicação tem **responsável pela triagem** (titular da OAB ou responsável do caso), filtros "Minhas", "Todos os advogados", "Sem dono ativo"; dá para **passar a publicação para outra pessoa**, com aviso e registro; "Devolver para a fila" | U |
| 4 | **Vínculo ao caso** | A publicação traz o **número CNJ**; o app procura o caso por nome e permite **criar o caso na hora** (com cliente, responsável, vara do órgão julgador). Se o processo já está ligado a um caso, o vínculo é **automático**; processo sem caso fica "no acervo do diário" | F+U |
| 5 | **Confirmar prazo (o passo humano)** | O advogado confirma: **nome da tarefa** (o tipo do ato não diz o que protocolar), **quem responde**, **quantos dias o ato concede**, se **perder o prazo extingue o direito** ("prazo fatal"), e **dias úteis ou corridos**. A conta aparece **inteira** antes de confirmar. Frase-guia: "**Você confirma a data. Nós garantimos a conta.**" | F+U |
| 6 | **"Quantos dias?"** | O número de dias **não vem na publicação**. O sistema tenta ler no teor ("Está escrito no ato: 15 dias") ou, se não lê, **sugere pelo tipo do ato e marca como "ninguém leu esse número escrito no texto"**. Se não acha prazo: "Li o ato e não encontrei prazo a cumprir... quem decide é você"; se não consegue ler: "**isto não quer dizer que ele não tem prazo**" | U |
| 7 | **Cadeia de contagem** | Disponibilização -> publicação no **1º dia útil seguinte** (Lei 11.419, art. 4º, §3º) -> início da contagem no **1º dia útil seguinte** (CPC, art. 224, §3º) -> vencimento em **dias úteis** (CPC, art. 219) ou **corridos** conforme o rito, com **recesso de 20/12 a 20/01** (art. 220) e dias sem expediente do tribunal | F+U |
| 8 | **Calendário do tribunal** | Calcula sozinho os feriados nacionais, o recesso e as **datas móveis** (carnaval, Corpus Christi), mas **não os marca por conta própria**: mostra para o escritório **confirmar quais valem para o seu tribunal** ("marcar como feriado um dia com expediente joga o vencimento para depois do prazo real"). O escritório cadastra **dias sem expediente** por tribunal com **tipo de efeito**: "o dia não conta no prazo", "o dia conta, mas o prazo não começa nem vence nele (CPC, art. 224, §1º)" e "sistema fora do ar". Recesso do escritório **não** suspende prazo | F+U |
| 9 | **Aviso de calendário ausente** | Se o prazo foi calculado **sem o calendário do tribunal**, o sistema avisa: as datas "podem estar **mais cedo** que as reais, **nunca mais tarde**" (erra para o lado seguro) e manda cadastrar os dias sem expediente | U |
| 10 | **Vencimento em dia sem expediente** | Aviso: "Não prorrogamos automaticamente: confira a regra de prorrogação do seu rito" (**[a confirmar]** em que situação exata aparece, já que a contagem em dias úteis já pula dias sem expediente) | U |
| 11 | **Dupla conferência** | Prazo **fatal + número de dias só sugerido pelo tipo do ato + vencimento em menos de uma semana** cai em "**Aguardando a conferência de outro advogado**" na tela Prazos. O conferente lê o teor e **confirma ou corrige**; corrigir recalcula a data e atualiza a tarefa. No plano Equipe o fabricante vende isso como "dupla validação de prazo" | F+U |
| 12 | **Data confirmada não muda sozinha** | "A data é a que você confirmou: ela nunca muda sozinha." Mudanças ficam em **"Por que a data andou"** (motivos, ex.: indisponibilidade do sistema) | U |
| 13 | **Alertas** | A tarefa gerada vai para o responsável com avisos de **D-3, D-1 e do dia do vencimento** (por notificação do sistema; **canal WhatsApp/e-mail para estes avisos [a confirmar]**). O prazo entra **na linha do tempo do cliente** | U |
| 14 | **Prazo avulso** | Para "o que não veio do diário: audiência, processo físico, tribunal fora do Comunica, prazo administrativo". Pede **data-base** ("o único dado que não dá para conferir depois: não há ato publicado para reler"), dias, responsável. Começa a contar no 1º dia útil seguinte | U |
| 15 | **Prazo do INSS (exigência)** | Espécies de benefício (B41, B42, B46, B31, B32, B91, B94, B21, B25, B80, B87, B88); **carta de exigência** lida por IA gera o prazo; contagem "da ciência, **com o dobro dos dias** (IN 128/2022, art. 566)"; prorrogação **única** e só registrada **depois de concedida**; como "o INSS não avisa quando abre exigência", sem conferência o responsável recebe **tarefa para olhar o portal** | U |
| 16 | **Audiência a partir da publicação** | Se o tipo do documento contém "audiência", aparece a ação **"Agendar audiência"** com texto "Designada na publicação de dd/mm/aaaa"; entra na agenda | U |
| 17 | **Agenda** | Agenda própria sincronizada com **Google Agenda** e **Outlook/Microsoft 365**; "Meu Dia" mostra o que vence hoje, publicações novas e agenda ao abrir | F+U |
| 18 | **Controladoria do escritório** | Metas: **triar em até 3 dias úteis** (sugestão: 90%) e **concluir o prazo com 1 dia útil de folga**. **Pontos** só por resultado (publicação triada no prazo; prazo concluído com folga ou no dia). Tira ponto: triagem devolvida, prazo corrigido na segunda conferência (o ponto vai para quem conferiu). **Declara não existir ranking de velocidade** ("velocidade de clique é o sinal do teatro, não do trabalho"). Mostra **carga de prazos por advogado** e o que "está parado sem dono" | U |

### 2.2 Processos e casos

| # | Função | Lógica observada | Conf. |
|---|---|---|---|
| 19 | **Modelo de dados** | **Cliente -> Caso -> Processos (números CNJ)**; sobre o caso penduram-se andamentos, publicações, prazos, horas, documentos, honorários, partes contrárias e o portal. "Caso 360º: o caso com processos, andamentos, horas e documentos na mesma tela" | F+U |
| 20 | **Entrada do processo, via 1: "Acervo do diário"** | Processos que apareceram nas publicações e **ainda não estão em nenhum caso** são listados para o advogado **incluir o que for seu** ("nenhum vira caso sozinho"). Só aparece processo que **teve publicação nos últimos 90 dias** | U |
| 21 | **Via 2: "Importar carteira"** | **Colar números CNJ, um por linha, com ou sem pontuação**; o sistema extrai por padrão, **valida o dígito verificador** (descarta os errados e avisa quantos), processa **até 20 por importação**, **consulta o CNJ (DataJud)** para obter classe e órgão julgador e **cria um caso por processo** (nome "classe + número"), com responsável = quem importou. Quem já estava em outro caso é recusado com aviso | U |
| 22 | **Via 3: busca por OAB no tribunal** | Por inscrição, **custa créditos** que voltam ao saldo se não achar nada | U |
| 23 | **Via 4: manual** | Campo do número do processo no caso; sem número "não há publicação nem andamento a acompanhar" | U |
| 24 | **Andamentos** | **DataJud** (CNJ), nota de que o andamento "**costuma chegar semanas depois do diário**; prazo e intimação vêm sempre do diário". Segredo de justiça: "os andamentos não são públicos". Avisa se o tribunal não está na base pública | F+U |
| 25 | **Autos e peças** | "Buscar os autos" **sob demanda e pago por créditos**; peça pode não estar liberada pelo tribunal; "Monitoramento Premium" traz partes, andamento completo e autos | U |
| 26 | **Monitoramento por CPF/CNPJ** | Aviso quando o CPF/CNPJ de um **cliente** aparecer em **ação distribuída a partir de hoje**; nada vira caso sozinho; renova a cada 30 dias; encerra por falta de créditos ou por apagamento de dados do titular | U |
| 27 | **Etapas do funil do caso** | O caso anda em **etapas** movidas **"pelo andamento do tribunal"** ou "pela sugestão do escritório parceiro". Gatilhos de movimento: publicação no diário, decurso de prazo, citação, audiência designada, conclusão ao juiz, redistribuição, **trânsito em julgado**, baixa | U |
| 28 | **Automações por movimento** | Gatilhos: **decisão ou despacho; intimação, citação ou notificação; pauta ou sessão de julgamento; transitar em julgado; entrar em julgamento; tese revista; tema repetitivo confirmado mudar**. Ações: tarefa, aviso, e-mail, WhatsApp (modelo aprovado), agente de IA, POST externo, pausa, ramificação | U |
| 29 | **Escritório parceiro/correspondente** | **Compartilhar um processo** com outro escritório, **com prazo de acesso** e **valor combinado**; o parceiro vê andamentos, prazos, documentos liberados, **não vê cliente, honorários nem financeiro**; **registra o que fez** (ex.: "Audiência de conciliação") com prova (foto/PDF); o escritório **aceita**, o **pagamento é liberado** e a conta **entra em Financeiro > Despesas**; a entrega "entra no relatório de cobrança" do cliente; **"Pôr na minha agenda"** (.ics) | U |
| 30 | **Duplicados e qualidade** | Tela de duplicados e agente de "qualidade dos dados: completude, duplicados, padronização" | U |

### 2.3 Cliente, captação, conflito e portal

| # | Função | Lógica observada | Conf. |
|---|---|---|---|
| 31 | **CRM jurídico e aquisição** | Funil configurável, campos "do jeito que o escritório trabalha"; **caixa de entrada única**: WhatsApp Oficial (API Meta) e **WhatsApp Light (QR Code, "o seu número")**, Instagram, Messenger, Telegram, e-mail (Gmail/Outlook/IMAP), caixa compartilhada; **distribuição de conversas**, horário do escritório e **prazo de resposta (SLA)** que só conta dentro do horário | F+U |
| 32 | **Campanhas e marketing** | Campanhas, sites públicos do escritório, feed/comunicados, devolução de conversões a Meta/LinkedIn/TikTok Ads (desligado por padrão) | U |
| 33 | **Conflito de interesses** | **Varredura determinística** (sem IA) ao cadastrar parte contrária ou caso. Regras: mesmo documento de cliente ativo; de ex-cliente; já é parte contrária em caso ativo; parte contrária em caso encerrado; parte do processo; **nome idêntico** (alerta de homônimo); **mesmo grupo econômico (matriz/filial)**; **mesmo telefone ou e-mail de parte contrária**; é advogado do escritório. **Se há conflito, o caso fica bloqueado ("sem prazo, sem tarefa, sem documento") até um sócio decidir**: **liberar, liberar com ressalva (com anexo, ex.: consentimento das partes) ou recusar**. Decisão **permanente, com nome e data**; revisar cria novo registro; sai no relatório do caso. Há **"Consultar antes de aceitar"** (sem cadastrar ninguém) e **"Varrer a base"**. Reconhece a limitação: "sem CPF/CNPJ, a checagem depende do nome, e nome não é identidade" | F+U |
| 34 | **Cadastro digital e portal do cliente** | **Link por cliente**, com validade; ficha e documentos, **acesso por código** (6 dígitos enviados ao e-mail/telefone cadastrado) **só para o que é sigiloso** (ler peças, assinar); enviar arquivo e preencher ficha não exigem código; **foto do documento pela câmera**; "**O que falta você fazer**"; o escritório **libera** documentos e peças. O app avisa "Não encaminhe: quem recebe consegue enviar documentos no seu nome". Fabricante: "sem verificação de identidade nem pagamento no link" | F+U |
| 35 | **Modelos de ficha por área** | Documentos pedidos por tipo de caso: Família (certidões, renda, despesas dos filhos), Trabalhista (CTPS, holerites, TRCT, FGTS), Previdenciário (CNIS, carta de indeferimento) | U |
| 36 | **Proposta** | Rota de **proposta pública** por link | U |
| 37 | **Assinatura** | (a) **própria**: cliente lê no portal, confirma com código; PDF sai com **recibo de evidências (data, IP, dispositivo)**; (b) **D4Sign** (cofre da conta do escritório); (c) **ZapSign** (confirmação por WhatsApp) | F+U |
| 38 | **LGPD embutida** | Na ficha do cliente: **exportar** e **anonimizar** (irreversível, registrado); formulários guardam **texto do consentimento, versão e horário** | F |

### 2.4 Documentos, IA e pesquisa

| # | Função | Lógica observada | Conf. |
|---|---|---|---|
| 39 | **Gestão de documentos** | Modelos com **mesclagem** de dados do caso; "Procuração ad judicia" de fábrica; **papel timbrado**; **versões** (cada uma com quem fez, quando e, se da IA, qual agente e modelo); **comparação** com o arquivo que a outra parte devolveu; **comentário na margem** | F+U |
| 40 | **Revisão com IA em 4 lentes** | Lentes **jurídica, risco, financeira e clareza**; "**cada achado cita o trecho; sem citação é descartado**"; "não redige a peça nem marca alterações". **Roteiros de revisão** por tipo de documento (ex.: locação residencial pelo locador): a posição do escritório **em cada cláusula**; existe versão de **fábrica** e **cópia do escritório** (a fábrica nunca sobrescreve a cópia) | F+U |
| 41 | **Citação conferida** | O sistema **procura o trecho citado no texto**; se não está, **o item não aparece** e a tela diz **quantos ficaram de fora**. Em PDF digitalizado/foto avisa que a citação não pôde ser conferida | F+U |
| 42 | **Memória do escritório** | Pergunta em linguagem natural; **cada afirmação aponta a fonte**: processo do escritório, **diário oficial (últimos 30 dias)** ou **tema/acórdão do STJ**. "Resposta sem fonte, ou com fonte que não existe, é descartada." Admite: "Isso diz que não achei base para responder, e não que o tema não tenha entendimento" | F+U |
| 43 | **Jurisprudência** | **Acervo do STJ (acórdãos de 2003 em diante, "mais de 10 mil")** com ementa, inteiro teor e link; busca por **palavras** e **por significado** (embeddings); filtros de órgão, relator, período, tema; **TST aos poucos pelo DJEN** | F+U |
| 44 | **Precedentes** | **Temas repetitivos** ligados ao caso (sugestão por assunto do processo, ligação manual), com a **ordem do tribunal** (ex.: suspensão) | U |
| 45 | **Jurimetria da carteira** | Só dados do **próprio escritório**: tempo por etapa (**mediana e meio central**), "**parados além do normal**" (acima do 3º quartil da própria carteira, **só depois de 5 saídas** na etapa), **valor em jogo** por fase, **desfecho** do ponto de vista do cliente, **taxa de êxito que exclui acordo e extinção sem mérito**, aviso de "poucos casos". Registra a passagem por etapa **desde 17/09/2026** | U |
| 46 | **Especialistas por área + motor de cálculo** | Nove "advogados associados" de IA com **calculadoras**: rescisão (verbas, FGTS, multas, correção e juros), tributário (débito federal, restituição com aviso de prescrição, Simples x Presumido x Real), **previdenciário (regras da reforma, pontos, pedágio, correção)**, família (pensão em atraso, simulação, partilha por regime), empresarial (apuração de haveres), bancário (taxa do contrato x taxa média do BC), penal (dosimetria 3 fases), consumidor (devolução em dobro, distrato na planta, superendividamento, voo), civil (débito judicial pela **Lei 14.905/2024**, cumprimento de sentença art. 523, sucumbência art. 85). **"Mostra a regra de cada linha, não um número inventado pela IA"**; quando a conta não cobre, deixa **[preencher: valor]**; sem certeza de precedente, descreve e marca **[conferir precedente]**. Rotulado "Cálculo de apoio: confira" | F+U |
| 47 | **Leitura de documentos do cliente** | **Holerite/tabela -> rescisão** (janela de 12 meses, média das variáveis, valores "como proposta" até conferir), **CNIS -> aposentadoria**, **carta do INSS -> ficha e prazo**. "Só o que você aplicar vai para a ficha" | U |
| 48 | **Stella e agentes** | Assistente de IA geral (pergunta qualquer coisa, prepara reunião); **agentes** configuráveis (atendimento WhatsApp, retomada de conversa, NPS, qualidade de dados, analista de documentos, revisor crítico), com limite de horas de IA por plano; **o agente nunca negocia valores nem condições**: pergunta sobre contrato vai para humano; envia o contrato do modelo para assinar quando o cliente quer fechar | F+U |
| 49 | **Consentimento e trilha de IA** | **Na primeira vez que cada pessoa usa IA, mostra o que será enviado e a quem, e pede consentimento**; provedores: Anthropic, OpenAI e Google; sem treinamento com dados de clientes; **sem contrato de retenção zero** (declarado) | F |
| 50 | **Integração com assistentes externos** | "Claude, ChatGPT e Cursor: o seu escritório dentro do assistente" (provavelmente servidor MCP) **[a confirmar]** | F |

### 2.5 Horas, honorários e financeiro

| # | Função | Lógica observada | Conf. |
|---|---|---|---|
| 51 | **Apontamento de horas** | **Cronômetro** (um só rodando; iniciar em outro caso para o anterior) e apontamento manual por caso; **valor da hora e custo da hora por advogado** ("as próximas horas já entram com estes valores"); hora **faturável x não faturável**; alerta de "apontamento sem valor da hora" | F+U |
| 52 | **Fechamento de competência** | Mês **fechado não aceita edição**; **reabrir** exige motivo e entra **na trilha com nome**; o fechamento anterior **não é apagado** | F+U |
| 53 | **Controle de horas da equipe** | Lista "dias sem apontar" com aviso: "carga de trabalho para fechar o mês, **não é ranking de produtividade**" | U |
| 54 | **Faturar horas** | Gera **fatura/recebível no caixa** (vencimento padrão: 7 dias); **retainer com franquia mensal**: horas cobertas pelo retainer **não geram fatura** ("nada a cobrar além da mensalidade"); o que já foi faturado não entra de novo; **honorário fixo: desliga o preço** e o relatório de horas "vira prova de trabalho, sem preço" | U |
| 55 | **Honorários** | **Contrato de honorários com as parcelas geradas de uma vez**, baixa e **previsto x recebido** (F); honorários como **registro ligado ao caso** com tipo, situação e valor (U). Cobrança por **Asaas (Pix e boleto, baixa automática)** | F+U |
| 56 | **Caixa ("Quem me deve")** | Contas, **categorias e centros de custo**, **lançamentos por competência**; lista de devedores com **juros e multa sugeridos pela régua do contrato** ("o produto não sugere nenhum percentual"; nada é alterado nos lançamentos; cobrar é decisão sua); **tolerância em dias**; **despesas reembolsáveis** (custas e diligências saem do caixa mas "ficam fora do custo do escritório e podem ser cobradas do cliente"); **retiradas dos sócios**; aviso de **saída paga sem comprovante**; **pacote do contador** leva os arquivos | U |
| 57 | **Painel dos sócios** | "As horas do time e o dinheiro do escritório no mesmo painel. **Em construção**" | F |
| 58 | **Relatório do cliente** | Relatório de horas por caso e "relatório que o cliente recebe" (inclui entregas de parceiros) | U |

### 2.6 Operação, segurança e integrações

| # | Função | Lógica observada | Conf. |
|---|---|---|---|
| 59 | **Permissões** | Papéis dono, administrador e membro; **telas visíveis e ações por pessoa e por time e por tipo de registro**; ações sensíveis (exportar, anonimizar) só dono/administrador | F+U |
| 60 | **Suporte** | Acesso do suporte ao escritório **só temporário, até 8 horas, com motivo escrito e registro** | F |
| 61 | **Isolamento e infraestrutura** | Isolamento **por regra do próprio banco** (row-level), Google Cloud **São Paulo**; **exceções declaradas**: logs sem região fixa, IA nos EUA, pesquisa de jurisprudência em banco nos EUA, cópias de segurança (migradas para SP em 20/10/2026) | F |
| 62 | **Backup e histórico** | Cópia diária por 30 dias, recuperação até 7 dias; documentos guardam todas as versões | F |
| 63 | **Onboarding e suporte** | **Trilha "Primeiros passos"** com "estrelas" e troféu; **Suporte/Chamados** com triagem por IA ("a conversa vai junto") | U |
| 64 | **App móvel** | O código trata WebView/iOS/Android, localização, câmera: **há app nativo ou WebView [a confirmar]** | U |
| 65 | **Integrações** | WhatsApp Oficial e Light, Instagram, Messenger, Telegram, Google, Microsoft, e-mail IMAP, caixa compartilhada, DJEN, consulta CNJ, **Asaas, D4Sign, ZapSign**, gravação e transcrição de reuniões | F+U |

### 2.7 O que o SGJur diz que NÃO faz (importante para comparar)

| Limite declarado/observado | Fonte |
|---|---|
| **Não peticiona**: "protocolar continua sendo ato seu" | F |
| **Não captura painéis de tribunal** (PJe, eproc, e-SAJ, Projudi), **nem o Domicílio Judicial Eletrônico** (não aparece no site nem no app) | F (ausência) |
| **Não redige peça** no módulo "IA Jurídica" (resume, extrai, revisa); a redação aparece só nos "especialistas" pagos à parte | F |
| **Não verifica identidade nem cobra no link do portal** | F |
| Não tem **certificado digital** (por escolha: "nem robô nem certificado") | F |
| Sem **provisão, e-billing, workflow corporativo** (visto no eLaw Enterprise, J2) | F (ausência) |
| **Sem NFS-e, êxito, sucumbência, repasse, conta de terceiros, retenção de alvará** visíveis | F+U (ausência) |
| Calendário **por tribunal é preenchido pelo escritório** (não há base pronta anunciada) | F+U |

---

## 3. A lógica em 6 fluxos (resumo)

**Fluxo A: da intimação à tarefa com data.**
`Inscrição OAB confirmada na fonte` -> `DJEN lido todos os dias` -> `publicação cai na caixa, com dono` -> (3 saídas) -> `confirmar prazo: dias + fatal + úteis/corridos + responsável` -> `cadeia legal calculada e mostrada inteira` -> `tarefa no caso, com D-3, D-1 e dia` -> **se fatal e número só sugerido e vence em < 7 dias: outro advogado confere** -> `conclusão da tarefa pontua na Controladoria`.

**Fluxo B: processo entra.**
Publicações descobrem processos -> "Acervo do diário" (90 dias) -> advogado inclui -> vira caso; ou colar lista CNJ (dígito validado, lote 20, DataJud enriquece, 1 caso por processo); ou busca por OAB (créditos). Processo ligado ao caso passa a **receber publicações no caso**.

**Fluxo C: aceitar um cliente novo.**
Lead no inbox (WhatsApp/Instagram etc.) -> funil -> **consulta de conflito antes de aceitar** -> ficha e documentos pelo portal (link, código) -> modelo de contrato de honorários mesclado -> assinatura -> **caso** (conflito verificado: se há, **bloqueia** até o sócio decidir).

**Fluxo D: horas e honorários.**
Cronômetro/apontamento -> valor e custo da hora do advogado -> fechamento mensal (trava) -> **faturar horas** (ou **cobrir por retainer**) -> recebível no **caixa** -> **Asaas** (Pix/boleto, baixa automática) -> "Quem me deve" com juros e multa **sugeridos**.

**Fluxo E: correspondente.**
Compartilhar processo com outro escritório (prazo de acesso e valor) -> parceiro registra o feito + prova -> escritório aceita -> pagamento liberado, despesa lançada, entra no relatório do cliente.

**Fluxo F: IA com freio.**
Todo item de IA sobre documento **precisa citar o trecho**; o sistema **verifica** que o trecho existe, senão **descarta e diz quantos descartou**; números vêm de **motor de cálculo determinístico que mostra a regra por linha**; onde não há conta, **[preencher]** e **[conferir precedente]**.

---

## 4. O que provavelmente atrai a advogada

Isto é **hipótese minha (I)**: não falei com ela, não há relato.

1. **O prazo que ela pode auditar.** A conta é mostrada **inteira** (disponibilização -> publicação -> início -> vencimento), com a lei de cada passo, e **ela confirma**. Para quem já perdeu prazo por "o sistema calculou", isso devolve controle.
2. **Sem robô e sem senha.** Não precisa entregar certificado nem senha de tribunal: tira o medo de bloqueio e de vazamento de credencial.
3. **Publicações sem cota por nome** e preço por advogado: não paga por nome de cliente ou sociedade.
4. **Honestidade de limites** ("isto não quer dizer que ele não tem prazo", "o prazo nunca muda sozinho", "erra para mais cedo, nunca mais tarde"). Combina com o perfil de quem desconfia de IA que inventa.
5. **Conflito de interesses que bloqueia o caso** e registra a decisão do sócio: é dor real de ética (JUR-003).
6. **CRM + WhatsApp + processo + prazo no mesmo cadastro** (lacuna que o J1 apontou como não preenchida por ninguém).
7. **Calculadoras por área com a regra de cada linha** (rescisão, pensão, previdenciário, 14.905).
8. **Portal do cliente com assinatura e câmera**, sem o cliente baixar app.
9. **"Meu Dia"**: abrir o sistema e ver o que vence hoje.
10. **Conferência por outro advogado** para prazo fatal.

### 4.1 O que perguntar a ela (20 minutos, perguntas curtas)

1. O endereço é **sgjur.com.br**? Foi **demo, teste ou uso real**? Há quanto tempo? Quem lhe apresentou?
2. Qual **tela** ela mais usa? Mostre (ou capture) a tela que ela mais gosta: **o que é, exatamente, que ela gosta?** (a caixa de publicações? o prazo? o conflito? as horas? o WhatsApp?)
3. Ela **confia no prazo calculado**? Já conferiu contra o tribunal? **Errou alguma vez?**
4. Ela usa **confirmação de prazo** ou deixa o padrão? O passo "quantos dias?" **atrapalha ou protege**?
5. **Quais tribunais** ela acompanha? O DJEN dá conta ou ela precisa de PJe/eproc/e-SAJ e Domicílio?
6. Ela usa **honorários e financeiro** no SGJur ou fora? **Faltou** êxito, sucumbência, repasse?
7. O **suporte** responde? Teve **bug ou publicação perdida**?
8. Paga quanto? Acha **caro** o salto de R$ 377 para R$ 1.977?
9. O que **tiraria** do sistema?

---

## 5. O que copiar, o que melhorar e o que não fazer

### 5.1 Copiar (lógica boa, barata e coerente com a nossa visão)

| # | O que | Por quê |
|---|---|---|
| 1 | **Mostrar a cadeia de contagem inteira e o humano confirma** (SG-003, SG-004) | Já é a nossa tese (prazo por regra, memória de cálculo, confirmação do advogado). Validado por produto concorrente |
| 2 | **Dados "sugeridos" marcados como não lidos no texto** (SG-005) | Distingue número lido de número chutado: **base ótima para a dupla conferência** |
| 3 | **Dupla conferência condicional** (fatal + sugerido + < 7 dias) (SG-007) | Regra simples, objetiva, não sobrecarrega |
| 4 | **Data confirmada imutável + trilha "por que a data andou"** (SG-012, SG-014) | Evita susto e dá prova para **devolução de prazo (JUR-052)** |
| 5 | **Viés conservador** (erra para mais cedo) e aviso de "sem calendário do tribunal" (SG-009) | Segurança por padrão |
| 6 | **Calendário em camadas:** nacional e recesso automáticos; datas móveis **propostas para confirmação**; efeito por tipo (não conta / não começa nem vence / sistema fora do ar) (SG-008) | Resolve o ponto mais difícil (J4/J3) sem fingir que existe base oficial |
| 7 | **Triagem com dono + "sem dono ativo" + passar com aviso** (SG-013, SG-016) | Prevê o caso do advogado afastado/saído |
| 8 | **Controladoria sem ranking de velocidade; pontos por resultado** (SG-017) | Evita gamificação perversa |
| 9 | **Conflito bloqueante com decisão do sócio permanente** e "consultar antes de aceitar" (SG-028, SG-029) | JUR-003/020; baixo custo; alto valor ético |
| 10 | **Citação conferida contra o texto; descartar o que não cita** (SG-038, SG-039) | Nossa diferenciação ("recusa em vez de invenção") já é essa; copiar o detalhe "diz quantos ficaram de fora" |
| 11 | **Motor de cálculo que mostra a regra de cada linha + marcadores [preencher] e [conferir precedente]** (SG-043) | Casa com o Cálculo plug-in do pacote |
| 12 | **Acervo do diário** e **importar carteira colando números CNJ com validação do dígito** (SG-019, SG-020) | Onboarding de escritório existente em minutos |
| 13 | **Retainer com franquia e honorário fixo sem preço de hora** (SG-049) | Cobre o que o escritório pequeno realmente faz |
| 14 | **Faturar horas -> recebível; "Quem me deve" com juros sugeridos pela régua do contrato, sem alterar lançamentos** (SG-051) | Já é o espírito do financeiro da plataforma |
| 15 | **Despesas reembolsáveis fora do custo** (SG-052) | JUR-214 |
| 16 | **Compartilhar processo com correspondente, com entrega e aceite que libera pagamento** (SG-027) | JUR-068 e JUR-232, hoje sem solução boa no mercado (J1/J3) |
| 17 | **Consentimento de IA na primeira vez de cada pessoa; versão registra agente e modelo** (SG-045) | JUR-234 |
| 18 | **Declarar limites na interface** | Confiança |

### 5.2 Melhorar (o SGJur deixa buraco ou é fraco)

| # | Buraco | Como melhoramos |
|---|---|---|
| 1 | **Só DJEN**; sem **Domicílio Judicial** e sem painéis (JUR-033/034, dr = 5) | Trazer o **Domicílio** (empresa cliente) e um **caminho assistido** para painéis, respeitando os limites do J4 (DataJud não comercial; IP brasileiro) |
| 2 | O **calendário do tribunal é manual** | Pré-carregar calendário por tribunal com **fonte e data** de cada dia, e o escritório só **ratifica** (mantém a lógica de confirmação) |
| 3 | **Dias do ato** dependem do advogado ou de sugestão por tipo | **Tabela de prazos por rito/ato com artigo**, mostrando a regra aplicada (JUR-037/042: dobro da Fazenda, MP, Defensoria; litisconsortes) |
| 4 | Sem **data interna de protocolo** (fatal menos margem) e sem **escada com supervisor** | JUR-043/044: D-5/D-3/D-1 + supervisor; canal WhatsApp |
| 5 | Sem **êxito, sucumbência, repasse, conta de terceiros, retenção no alvará** (JUR-209/210/212/213, dr 4–5) | Financeiro jurídico completo sobre o financeiro da plataforma |
| 6 | Sem **prescrição/decadência**, **preparo/depósito recursal**, **custas** (JUR-023, 075, 098, 101, 143) | Calculadoras determinísticas com memória de cálculo |
| 7 | **Degrau de preço** R$ 377 -> R$ 1.977 | Preço previsível e gradual para 1 a 5 usuários (nosso público inicial) |
| 8 | **Créditos por consulta** (imprevisível) | Franquia clara; avisar custo **antes** de gastar |
| 9 | **Calculadoras só no pacote pago à parte** | Incluir o essencial no plano |
| 10 | **Áreas sem cobertura**: Tributário contencioso, Penal (réu preso), Empresarial, Administrativo, Jurídico interno | Seguir a ordem do J9 |
| 11 | **Não há checklist pré-protocolo** (JUR-219) | Revisão de peça com checklist e conferência de citações |
| 12 | **Sem escritório pequeno e família** como foco explícito | Planos e linguagem para solo e pequena banca |

### 5.3 O que não fazer

1. **Não copiar visual** (já temos UI e design system; instrução do usuário).
2. **Não depender só do DJEN** como fonte única e esconder isso: o próprio SGJur admite que andamentos do DataJud chegam semanas depois.
3. **Não deixar o prazo "confirmado" parecer garantia**: o fabricante é cauteloso; nós também (e com aviso de que o DJEN pode ter lacunas de tribunal).
4. **Não lançar módulos "em construção"** na vitrine (Painel dos Sócios); só mostrar o que roda.
5. **Não mandar dado de cliente para IA sem consentimento e sem dizer para onde vai** (aqui eles fazem bem; copiar). E **não prometer "dados no Brasil"** com exceções escondidas: eles listam as exceções (bom); nós também.
6. **Não adotar "ranking de produtividade"**; eles mesmos rejeitam.
7. **Não cobrar por nome monitorado**.
8. **Não gerar peça sem revisão obrigatória** nem sem fonte.

---

## 6. Funcionalidades candidatas (SG-001 a SG-060)

Legenda: **Conf.** = nível de confiança da evidência (item 0). **Ação** = Copiar / Melhorar / Estudar / Não. **JUR** = atividades do `atividades-juridico.json` relacionadas.

| ID | Funcionalidade | Conf. | Ação | JUR |
|---|---|---|---|---|
| SG-001 | Caixa de publicações do DJEN por OAB, teor completo, partes, sem cota por nome | F+U | Copiar | 032, 035 |
| SG-002 | Três saídas por publicação: virar prazo, arquivar por ciência, nada a fazer (ato cancelado) | F+U | Copiar | 036, 048 |
| SG-003 | Cadeia de contagem mostrada inteira antes de confirmar | F+U | Copiar | 038, 039 |
| SG-004 | Confirmação humana do prazo; data confirmada não muda sozinha | F+U | Copiar | 037, 048 |
| SG-005 | Dias do ato: "escrito no texto" x "sugerido pelo tipo do ato"; "não consegui ler" não é "sem prazo" | U | Copiar | 037 |
| SG-006 | Marca de **prazo fatal** ("perder extingue o direito") | U | Copiar | 037, 048 |
| SG-007 | Dupla conferência condicional (fatal + sugerido + vence em < 7 dias) por outro advogado | F+U | Copiar | 048 |
| SG-008 | Calendário em camadas: nacional + recesso automáticos; móveis propostas; efeito por tipo de dia | F+U | Copiar/Melhorar | 039, 040, 041 |
| SG-009 | Aviso "calculado sem calendário do tribunal", com viés conservador | U | Copiar | 041 |
| SG-010 | Prazo avulso com data-base (audiência, processo físico, administrativo) | U | Copiar | 037, 043 |
| SG-011 | Prazo do INSS: exigência, dobro, prorrogação única, conferência periódica | U | Estudar | 138, 146 |
| SG-012 | Alertas D-3, D-1 e dia; tarefa no caso; prazo na linha do tempo do cliente | U | Melhorar (escada, supervisor, WhatsApp) | 044, 045 |
| SG-013 | Responsável padrão dos prazos por inscrição; passar publicação com aviso | U | Copiar | 044, 050 |
| SG-014 | Trilha "por que a data andou" | U | Copiar | 052 |
| SG-015 | Confirmar OAB na fonte mostrando o nome; alertar leitura parada/falhando | F+U | Copiar | 050 |
| SG-016 | Triagem com dono, filas "minhas" e "sem dono ativo" | U | Copiar | 048, 050 |
| SG-017 | Controladoria: metas de triagem (3 d.u.) e de prazo com folga; pontos por resultado; sem ranking de velocidade | U | Copiar | 048, 049 |
| SG-018 | Agendar audiência a partir da publicação | U | Copiar | 066, 067, 228 |
| SG-019 | Acervo do diário (processos descobertos, 90 dias) | U | Copiar | 053, 054 |
| SG-020 | Importar carteira por lista de números CNJ (dígito validado, lote 20, DataJud) | U | Copiar | 054 |
| SG-021 | Busca de processos por OAB no tribunal (créditos devolvidos se vazio) | U | Estudar | 053 |
| SG-022 | Monitorar CPF/CNPJ de cliente: aviso de nova ação distribuída | U | Copiar | 053 |
| SG-023 | Andamentos DataJud com nota de atraso ("prazo e intimação vêm do diário") | F+U | Copiar | 051, 057 |
| SG-024 | Buscar autos sob demanda; segredo de justiça sinalizado | U | Estudar | 055 |
| SG-025 | Modelo Cliente -> Caso -> Processos; Caso 360 | F+U | Copiar | 019, 056 |
| SG-026 | Etapas do caso movidas por andamento do tribunal | U | Copiar | 056, 057 |
| SG-027 | Gatilhos de automação por movimento (decisão, intimação, pauta, trânsito, tese revista) | U | Copiar | 057, 189 |
| SG-028 | Processo compartilhado com correspondente (prazo de acesso, entrega com prova, aceite libera pagamento, lança despesa, entra no relatório do cliente) | U | Copiar | 068, 232, 214 |
| SG-029 | Conflito de interesses determinístico (regras listadas), bloqueio do caso, decisão do sócio permanente | F+U | Copiar | 003, 020 |
| SG-030 | "Consultar antes de aceitar" e "varrer a base" | U | Copiar | 003 |
| SG-031 | Portal do cliente: link com validade; código só para o sigiloso; câmera; "o que falta você fazer" | F+U | Copiar | 008, 024, 225 |
| SG-032 | Modelos de ficha e checklist por área (família, trabalhista, previdenciário) | U | Copiar | 008, 089, 144 |
| SG-033 | Assinatura: própria com recibo de evidências, D4Sign, ZapSign | F+U | Copiar | 011, 015, 165 |
| SG-034 | CRM + inbox omnicanal (WhatsApp Oficial/Light, Instagram, Messenger, Telegram, e-mail) com distribuição e SLA | F+U | Já temos na plataforma | 001, 026, 226 |
| SG-035 | Agente de WhatsApp que envia contrato para assinar e **nunca negocia valores** | U | Copiar (a regra) | 009, 011 |
| SG-036 | LGPD na ficha: exportar e anonimizar cliente; consentimento versionado | F | Copiar | 012, 183, 190 |
| SG-037 | Modelos com mesclagem, versões (autor, agente e modelo), papel timbrado, comparação, comentário na margem | F+U | Copiar | 161, 163, 164 |
| SG-038 | Revisão em 4 lentes com citação obrigatória; roteiros de revisão por tipo de contrato (fábrica x cópia do escritório) | F+U | Copiar | 162 |
| SG-039 | Citação conferida contra o texto; descarte e contagem do que ficou de fora; aviso em PDF digitalizado | F+U | Copiar | 061, 167 |
| SG-040 | Memória do escritório: pergunta com fonte (acervo, diário 30 dias, STJ); sem fonte, descarta; "não achei base" | F+U | Copiar | 060, 221 |
| SG-041 | Jurisprudência STJ com busca por palavras e por significado; TST parcial | F+U | Estudar | 060 |
| SG-042 | Precedentes: temas repetitivos ligados ao caso; ordem de suspensão | U | Copiar | 060, 189 |
| SG-043 | Jurimetria da carteira: tempo por etapa (mediana/quartis), parados além do normal (régua após 5 saídas), êxito sem acordo e sem extinção sem mérito | U | Copiar | 195, 220 |
| SG-044 | Especialistas com motor de cálculo que mostra a regra por linha; [preencher] e [conferir precedente] | F+U | Copiar | 077, 083, 090, 105, 129, 137, 149, 152, 159 |
| SG-045 | Leitura de holerite, CNIS e carta do INSS para ficha, valores "como proposta" até conferir | U | Copiar | 089, 136, 144 |
| SG-046 | Consentimento de IA por pessoa; registro de agente e modelo por versão | F | Copiar | 013, 234 |
| SG-047 | Servidor para assistentes externos (Claude, ChatGPT, Cursor) | F | Estudar | - |
| SG-048 | Apontamento com cronômetro único; valor e custo da hora por advogado; faturável x não | F+U | Copiar | 027, 216, 217 |
| SG-049 | Fechamento de competência com reabertura registrada | F+U | Copiar | 027 |
| SG-050 | Faturar horas em recebível; retainer com franquia; honorário fixo sem preço de hora | U | Copiar | 208, 216 |
| SG-051 | Contrato de honorários com parcelas geradas de uma vez; previsto x recebido; Asaas Pix/boleto com baixa | F+U | Copiar | 208 |
| SG-052 | "Quem me deve" com juros e multa sugeridos pela régua do contrato, sem alterar lançamentos | U | Copiar | 215 |
| SG-053 | Despesas reembolsáveis fora do custo; pacote do contador com comprovantes | U | Copiar | 214 |
| SG-054 | Retiradas dos sócios; centros de custo | U | Estudar | 211, 217 |
| SG-055 | "Meu Dia": vence hoje, publicações novas, agenda | F+U | Copiar | 049, 228 |
| SG-056 | Horário do escritório, jornada e ausências; SLA de resposta só no horário | U | Estudar | 226 |
| SG-057 | Permissões por pessoa/time e por tipo de registro; acesso de suporte temporário (8 h, com motivo) | F+U | Copiar | 231 |
| SG-058 | Duplicados e agente de qualidade de dados | U | Copiar | 218 |
| SG-059 | Plano por advogado/inscrição OAB com publicações ilimitadas | F | Estudar (preço) | - |
| SG-060 | Painel dos Sócios (horas + dinheiro) | F ("em construção") | Melhorar (esperar) | 217 |

---

## 7. Cruzamento com as 234 atividades (JUR-001 a JUR-234)

**Critério (I):** classifiquei cada atividade pelo que o SGJur **mostra** (não pelo que testei). **C** = há função que cobre o essencial; **P** = cobre parte (ex.: a IA "redige peça" mas sem biblioteca por rito) ou só em tese; **N** = não vi.

| Resultado | Quantidade |
|---|---|
| **Coberto (C)** | **55** |
| **Parcial (P)** | **69** |
| **Não visto (N)** | **110** |

Das **42 atividades de nota máxima (dr = 5)**: **5 cobertas** (036, 038, 039, 040, 048), **13 parciais** (002, 032, 037, 041, 044, 052, 063, 071, 073, 092, 097, 119, 138) e **24 não vistas** (023, 033, 034, 046, 075, 095, 098, 101, 107, 109, 110, 116, 117, 122, 126, 141, 143, 151, 177, 185, 191, 212, 219, 229).

**Leitura:** o SGJur é **forte no miolo do prazo vindo do DJEN** (JUR-035 a 040, 048, 049) e na **gestão de relacionamento e escritório** (CRM, conflito, portal, horas, honorários básicos, correspondente), e **fraco ou ausente** na **captura além do DJEN** (033, 034), **peticionamento** (046), **áreas contenciosas especializadas** (Tributário, Penal, Trabalhista de execução, Empresarial), **jurídico interno** (provisão, escritórios externos, e-billing) e **financeiro jurídico avançado** (êxito, sucumbência, repasse, conta de terceiros). **Ou seja: quase tudo o que ele não cobre, nós já mapeamos**; e as 5 coberturas de dr = 5 mostram que o **centro do nosso pacote (prazo) tem concorrência real** em quem faz bem o básico.

| Área (JUR) | Total | Coberto (C) | Parcial (P) | Não visto (N) |
|---|---|---|---|---|
| Ciclo do caso | 31 | 14: 001, 003, 006, 008, 009, 010, 011, 014, 015, 019, 020, 026, 027, 030 | 10: 002, 007, 012, 021, 022, 024, 025, 028, 029, 031 | 7: 004, 005, 013, 016, 017, 018, 023 |
| Prazos e andamentos | 26 | 10: 035, 036, 038, 039, 040, 048, 049, 053, 054, 055 | 12: 032, 037, 041, 042, 044, 045, 047, 050, 051, 052, 056, 057 | 4: 033, 034, 043, 046 |
| Cível | 31 | 4: 060, 068, 077, 083 | 17: 058, 061, 062, 063, 064, 065, 066, 067, 070, 071, 072, 073, 074, 082, 084, 085, 086 | 10: 059, 069, 075, 076, 078, 079, 080, 081, 087, 088 |
| Trabalhista | 16 | 1: 089 | 5: 090, 091, 092, 094, 097 | 10: 093, 095, 096, 098, 099, 100, 101, 102, 103, 104 |
| Tributário | 11 | 0 | 3: 105, 106, 114 | 8: 107, 108, 109, 110, 111, 112, 113, 115 |
| Penal | 11 | 0 | 2: 119, 121 | 9: 116, 117, 118, 120, 122, 123, 124, 125, 126 |
| Família | 9 | 1: 129 | 2: 127, 128 | 6: 130, 131, 132, 133, 134, 135 |
| Previdenciário | 11 | 1: 137 | 4: 136, 138, 142, 144 | 6: 139, 140, 141, 143, 145, 146 |
| Consumidor | 6 | 2: 149, 152 | 2: 148, 150 | 2: 147, 151 |
| Empresarial | 8 | 1: 159 | 0 | 7: 153, 154, 155, 156, 157, 158, 160 |
| Contratos | 9 | 6: 161, 162, 163, 164, 165, 167 | 1: 168 | 2: 166, 169 |
| Imobiliário | 7 | 0 | 2: 171, 176 | 5: 170, 172, 173, 174, 175 |
| Administrativo | 5 | 0 | 0 | 5: 177, 178, 179, 180, 181 |
| Compliance e LGPD | 9 | 1: 190 | 1: 183 | 7: 182, 184, 185, 186, 187, 188, 189 |
| Jurídico interno | 17 | 0 | 2: 195, 203 | 15: 191, 192, 193, 194, 196, 197, 198, 199, 200, 201, 202, 204, 205, 206, 207 |
| Gestão do escritório | 27 | 14: 208, 214, 215, 216, 218, 220, 221, 225, 226, 227, 228, 231, 232, 234 | 6: 209, 210, 211, 217, 223, 224 | 7: 212, 213, 219, 222, 229, 230, 233 |
| **Total** | **234** | **55** | **69** | **110** |

### 7.1 Funcionalidades do SGJur que **não estão** nas 234 atividades (candidatas a nova atividade ou nova linha de design)

| Funcionalidade SGJur | Proposta |
|---|---|
| Metas e pontos de **controladoria** (triagem em 3 d.u., prazo com folga) (SG-017) | Nova atividade "medir qualidade do tratamento de publicações e prazos" (gestão) |
| **Prazo avulso** com data-base e "não vem do diário" (SG-010) | Já coberto por JUR-037/043, mas criar atividade explícita de **prazo fora do DJEN** (físico, administrativo, INSS) |
| **Exigência do INSS** e "o INSS não avisa" (SG-011) | Ligar a JUR-138/146 |
| **Jurimetria da própria carteira** por etapa (SG-043) | Detalha JUR-195/220 (régua de normal por etapa com mínimo de 5 saídas) |
| **Escritório parceiro** com acesso temporário e aceite que libera pagamento (SG-028) | Detalha JUR-068/232 |
| **Dosimetria, apuração de haveres, superendividamento, voo, distrato na planta** como calculadoras | Candidatas a Cálculo plug-in (Penal 124/125; Empresarial 159; Consumidor 152) |
| **Consentimento de IA por pessoa** | Já em JUR-013/234; falta o nível "usuário" |

---

## 8. Riscos e limites desta pesquisa

1. **Evidência quase toda do fabricante.** Nenhuma validação externa. O SGJur pode ser sólido ou frágil; **só uma demo e o relato da advogada dirão**.
2. **Código ≠ produto em produção.** Textos de interface existem no código, mas **plano, ativação e qualidade** podem diferir (alguns trechos citam "plano com o módulo de publicações", "Monitoramento Premium", "ainda não está à venda").
3. **Produto de semanas.** Pode mudar rápido ou sumir. A empresa é micro (capital R$ 10 mil) **[porte real da equipe: a confirmar]**.
4. **Dados de pessoas:** os sócios aparecem no cadastro público da Receita; **omiti os nomes**.
5. **Não verifiquei** os preços por interface logada, nem as promessas de integração (WhatsApp Oficial, D4Sign, Asaas) em uso real.

---

## 9. Próximos passos baratos

1. **Pergunta de 1 minuto à advogada** (item 4.1, perguntas 1 e 2).
2. **Pedir demonstração** (botão "Agendar demonstração") **ou criar conta** de teste, **só com a anuência do usuário** (cadastro com dados reais).
3. Opcional: olhar o **SIJUR** (plano grátis, 30 processos, sem cartão) como segunda referência, porque cobre o que o SGJur não cobre (eproc, PJe, peticionamento); **só se ela disser que o nome era esse**.
4. Com o resultado, **atualizar** `docs/Sintese_Pacote_Juridico.md` (item f da seção 10) e o ranking de funcionalidades.

---

## 10. Fontes (todas acessadas em 08/11/2026)

**SGJur e SG Emp**
- Site oficial: https://sgjur.com.br/ (módulos, planos, prazos, IA com fonte, FAQ)
- Termos de uso (08/10/2026): https://sgjur.com.br/termos
- Política de privacidade (06/10/2026): https://sgjur.com.br/privacidade
- Segurança (19/10/2026): https://sgjur.com.br/seguranca
- Site da empresa: https://www.sgemp.com.br/
- Blog do SG CRM (produto-base): https://www.sgjur.com.br/blog
- Aplicativo (somente textos de interface do pacote JavaScript público, sem login): https://app.sgjur.com.br/ (arquivos em `/assets/`, ex.: `index-C_rBMoHs.js`, `PrazosPage-*.js`, `PublicacoesPage-*.js`, `CasosEProcessosPage-*.js`, `ConflitosPage-*.js`, `ControladoriaDoEscritorio-*.js`, `JurimetriaDaCarteira-*.js`, `CalendarioPage-*.js`, `CaixaPage-*.js`, `RecordDetailModal-*.js`, `ClientPortalPage-*.js`, `EscritorioPage-*.js`, `AgentsPage-*.js`)
- SG CRM: https://app.sgcrm.com.br/
- Cadastro CNPJ (Receita, via BrasilAPI): https://brasilapi.com.br/api/cnpj/v1/32321219000189
- Internet Archive (sem cópia): https://archive.org/wayback/available?url=sgjur.com.br

**Candidatos de nome parecido**
- SIJUR (site): https://www.sijur.com.br/
- SIJUR no B2B Stack (0 avaliações, fundado em 2019): https://www.b2bstack.com.br/product/sijur
- SG Jurídico (material de estudo): https://sgjuridico.com.br/sobre-nos/

**Buscas na web sem resultado sobre o SGJur** (14 consultas: "SGJur", "SG Jur", "SG Emp", "sgjur.com.br", avaliação, Reclame Aqui/LinkedIn/Instagram, vagas, "SG CRM", etc.): nada além dos itens acima. Indica **ausência de presença independente**, não prova de inexistência de usuários.

**Relatórios internos usados:** `docs/Sintese_Pacote_Juridico.md`, `pesquisa/juridico/J1-mercado-software-juridico.md`, `pesquisa/juridico/J2-elaw.md`, `pesquisa/juridico/atividades-juridico.json`.

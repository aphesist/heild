# B5 — Como o mercado captura notas dos clientes sem pedir o certificado de cada um

- **Data:** 06/11/2026 (todas as páginas abaixo foram consultadas nesta data, salvo indicação)
- **Pergunta do fundador:** como SIEG, HubStrom, Qive, e-Kontroll e similares capturam as notas de entrada e de saída (NF-e, NFC-e, CT-e, NFS-e) dos clientes do escritório? Exigem o A1 de cada cliente? Ele não lembra de ter configurado certificados nesses sistemas.
- **Escopo:** a pedido do usuário, a busca foi além da lista e cobriu o mercado todo. Entraram também NF-Stock (Alterdata), Domínio (Thomson Reuters), Fiscal.io, Questor e Jettax.
- **Inventário conferido:** NFE-001 a NFE-040 e NFE-101 a NFE-106. Já existem NFE-002 (autXML), NFE-004 (distribuição com A1 do cliente), NFE-005 (saídas), NFE-006 (CT-e), NFE-007 (ADN com A1), NFE-009 (NFC-e) e NFE-012 (triagem do que chega pelo atendimento). Os caminhos de captura que faltavam viraram quatro fichas novas (NFE-501 a NFE-504, seção 6).

---

## 1. Resposta curta

1. **Ninguém tira a NF-e de entrada da distribuição nacional sem o certificado do próprio destinatário.** A NT 2014.002 v1.40 autentica pelo certificado do próprio ator (CNPJ base). Por isso, nas **entradas**, SIEG, Qive, HubStrom, Fiscal.io e NF-Stock usam o **A1 do cliente**, exceto onde o estado oferece outro caminho (item 3). A Qive diz isso de forma explícita: "a empresa faz o cadastro na Qive e insere o certificado digital A1 ou A3 [...] É necessário que a empresa libere o acesso ao contador" [Q3].
2. **Há quatro caminhos oficiais que dispensam o A1 do cliente.** Eles explicam por que o fundador pode não lembrar de ter cadastrado certificados:
   - **autXML:** o CNPJ do escritório (ou o CPF do contador) vai na nota emitida pelo cliente. O escritório baixa as **saídas de NF-e e CT-e** com o **próprio** certificado, num único cadastro para todos os clientes [S-AUT][NFS1][FIO1][R2-NT].
   - **Integração contábil estadual no RS e em SC:** são web services oficiais para contabilistas. O escritório baixa NF-e emitidas **e destinadas**, CT-e e NFC-e dos clientes com o **certificado do escritório ou do contador**. No RS, o cliente autoriza no e-CAC estadual ("NF-e – Download XML para Contabilistas") [RS1][ACBR1][S-RS]. Em SC, o requisitante precisa estar vinculado ao CNPJ [SC1][SC2][S-SC]. A SIEG, o Domínio e o NF-Stock usam esse caminho [S-RS][S-SC][DOM1][NFS1].
   - **Portais estaduais que aceitam o contador:** PE (e-Fisco aceita o "certificado (ou conta gov.br) do [...] contador da empresa, cadastrado no e-fisco") [PE1]; AM e PE por procuração no NF-Stock [NFS1]; PR pelo login no Receita/PR, do cliente ou do "usuário do contador responsável" (relato de usuário) [PR1].
   - **NFS-e Nacional (ADN) por procuração, novo desde 01/11/2026:** as APIs de **Emissão e Distribuição** passaram a aceitar acesso em nome de terceiros, por procuração eletrônica da RFB ou por vínculo no CNPJ. A validação usa o certificado de quem chama a API [FEN2]. Isso **muda** a premissa registrada no V1, no V2 e no 90-consolidado ("procuração não prevista").
3. **Há também caminhos sem certificado nenhum:** e-mail dedicado que recebe os XMLs (Qive `eu@arquivei.com.br`, NF-Stock `nf@nfstock.com.br`) [Q4][NFS1], agente instalado no computador do emissor (Qive Sincroniza Notas, SIEG Robocopy, NF-Stock NF Monitor) [Q4][S-SAI][NFS1], API do emissor ou ERP enviando ao cofre [S-SAI] e integração nativa com o emissor (NF-Easy no NF-Stock; Bling, Tiny, MarketUP e Mercado Livre têm guias de autXML na SIEG) [NFS1][S-HELP].
4. **Consulta por chave:** desde 07/07/2020, o XML completo no Portal Nacional só sai com certificado de um dos atores da nota [Q1]. A SIEG ("Notas do passado") e o NF-Stock fazem download por chave **com o certificado da empresa emitente ou destinatária** [S-CHV][NFS1]. O "Qive Lite" sem certificado dependia de base privada autorizada só até 30/11/2020 [Q2].
5. **SP e MG não têm caminho para o contabilista.** O FAQ da Sefaz-SP só prevê o autXML ou o pedido ao cliente [SP1]. Em MG não achei serviço de download para contabilista `[NÃO ENCONTRADO]` (buscado: "SIARE download XML NF-e contabilista notas dos clientes certificado do contador").

---

## 2. Regras oficiais conferidas

| Regra | O que diz | Efeito para a captura | Fonte |
| --- | --- | --- | --- |
| NT 2014.002 v1.40 (NFeDistribuicaoDFe) | Distribui documentos de interesse do ator **não gerados por ele**. Os atores são o emitente, o destinatário, o transportador e os terceiros do `autXML`. A autenticação é pelo certificado do próprio ator (CNPJ base). O emitente **não** recebe as próprias NF-e (regra H172, rejeição 641) | Entradas: A1 do cliente. Saídas de NF-e: autXML com o certificado do escritório, ou outro caminho | [R2-NT], conferido no V2 (C-01) |
| Ajuste SINIEF 16/2018, aviso do Portal Nacional | Desde 07/07/2020, a consulta completa só funciona para os participantes da operação, com certificado digital (exceto destinatário sem IE) | Fim dos robôs que baixavam o XML só com a chave | Texto citado em [Q1] |
| Sefaz-RS: web service para contabilistas | Download de NF-e, NFC-e e CT-e **emitidos e destinados** ao CNPJ. O cliente outorga no e-CAC estadual a autorização "NF-e – Download XML para Contabilistas" e o contabilista dá o aceite. A Sefaz não fornece software | Saídas **e** entradas com o certificado do escritório | [RS1] (página oficial: o servidor recusou a leitura direta nesta data; texto lido na transcrição do aviso em [ACBR1] e confirmado por [S-RS] e [DOM1]) |
| SEF-SC: web service de download de NF-e | NF-e autorizadas pela SEF-SC e NF-e de outras UFs destinadas a SC ficam disponíveis "para os contabilistas de empresas catarinenses". O requisitante é identificado pelo certificado e "deverá também estar vinculado ao CNPJ/CPF informado". Suporte ao CNPJ alfanumérico desde 28/08/2026 | Saídas e entradas com o certificado do contador | [SC1] oficial |
| SEF-SC: web service de download de NFC-e | Versão 1.0 em teste desde 15/04/2026; BT 2026-001 e BT 2026-003 de 31/08/2026; "poderá ser encerrado" se houver problema crítico | NFC-e de saída com o certificado do contador | [SC2] oficial |
| Sefaz-PE: download de NF-e no e-Fisco | Acesso com o certificado da empresa ou o certificado/gov.br do sócio ou do **contador cadastrado no e-Fisco** | Download no portal (sem API): C-cert ou C-crc | [PE1] oficial |
| Sefaz-SP: FAQ "Como os contabilistas terão acesso às NF-e de seus clientes?" | Pedir ao cliente ou usar o autXML com o certificado do contador. Pela Portaria CAT 162/2008, art. 13, § 6º, o emitente deve disponibilizar o XML ao destinatário | Em SP não há caminho para o contabilista além do autXML | [SP1] (cópia do FAQ oficial) |
| NFS-e Nacional: representação desde 01/11/2026 | Emissor Web: "Procuração/Representação". As APIs de **Emissão e Distribuição** aceitam acesso em nome de terceiros "com base nessas autorizações" (procuração eletrônica da RFB para os serviços da NFS-e, ou vínculo no CNPJ). A validação é feita "por meio do certificado digital utilizado na comunicação com as APIs" | ADN com o **certificado do escritório** + procuração | [FEN2] (Fenacon, 03/11/2026, citando o Portal da NFS-e e o tópico 11 do manual do Emissor Web). Documentação do ADN (adn.nfse.gov.br/contribuintes/docs) inacessível daqui: **conferir na PoC** |
| Pedido anterior da FENACON (jun/2026) | Apontava a "impossibilidade atual de utilizar procurações eletrônicas para o acesso às APIs de busca" | Mostra que a mudança de novembro é recente | [FEN1] |

---

## 3. Tabela: fornecedor × documento × caminho × exige A1 do cliente?

Legenda: **Sim** = só funciona com o A1 do cliente; **Não** = usa o certificado do escritório ou do contador, ou nenhum certificado; **Opcional** = há caminho com e sem.

| Fornecedor | Documento | Caminho(s) documentado(s) | Exige A1 do cliente? | Fonte |
| --- | --- | --- | --- | --- |
| **SIEG** | NF-e entrada | Distribuição DF-e com o A1 da empresa ("Notas de Entrada" no cadastro); no RS e em SC, Integração Contábil Estadual com o A1 do contador por procuração; em AM, BA, DF, ES, GO, MA, MS, MT, PB, PE, PI, PR, RJ, RN e RO, "Integração Estadual" no AutodocS (robô no portal: PR com login e senha do Receita/PR + certificado da empresa; PE com A1 e CPF do responsável no e-Fisco) | Sim, exceto RS/SC (não) | [S-RS][S-SC][S-PR][S-PE][S-HELP] |
| SIEG | NF-e saída | (a) autXML com o certificado da contabilidade ou do contador; (b) "Modelo 55" com o A1 do cliente: 60 dias retroativos a partir de um XML-semente, em 24 UFs (não AM, BA, MA); (c) API SIEG (o emissor envia); (d) Robocopy (pasta do emissor); (e) Integração Estadual; (f) Integração Contábil RS/SC | Opcional (a, c, d, f não pedem) | [S-SAI][S-AUT][S-M55] |
| SIEG | CT-e | autXML; Integração Contábil RS/SC; distribuição com o A1 | Opcional | [S-SAI][S-RS][S-SC] |
| SIEG | NFC-e | SC: Integração Contábil com o A1 do contador, 90 dias, a cada hora; SP: captura própria por UF (credencial não detalhada no artigo); API, Robocopy | SC não; SP `[NÃO VERIFICADO]` (o V2 indica SAE-NFC-e com o certificado do contribuinte) | [S-NFCSC][S-NFCSP] |
| SIEG | NFS-e | Portal Nacional "utilizando o Certificado A1 do cliente"; portal municipal com o A1 da empresa **ou da contabilidade**, ou login e senha do cliente **ou do procurador** (AutoDocs). Em SC, o próprio artigo diz que a NFS-e só é capturada se o A1 do cliente estiver cadastrado | ADN: sim (artigos anteriores a 01/11/2026); municipal: opcional | [S-NFSE][S-SC] |
| SIEG | Por chave | "Notas do passado": até 800 chaves ou TXT, até 5 anos, com o certificado do emitente ou destinatário | Sim (certificado de um ator) | [S-CHV] |
| **HubStrom (XMLHub)** | NF-e, NFC-e, CT-e, NFS-e | Site: "NF-e e NFC-e direto da SEFAZ em 23 estados, NFS-e pelo Portal Nacional e CT-e via DFe"; "automação completa nacional de NFe de entrada e busca das NFes e NFCes de saída de 23 estados"; busca por chave em lote; implantação em 24 h com "certificado digital, clientes cadastrados". FAQ: não dá ciência automática para "evitar que o CNPJ do escritório seja vinculado a documentos" | **Não publicado.** Central de ajuda não acessível sem login. O número "23 estados" é compatível com captura de saída com o A1 do cliente (como o Modelo 55 da SIEG, 24 UFs), mas isso é inferência | [H1][H2] · confiança baixa |
| **Qive** (ex-Arquivei) | NF-e e CT-e recebidos | Distribuição com o certificado A1 ou A3 **da empresa**; a empresa cadastra o próprio certificado na Qive e libera o acesso ao contador | Sim, mas quem cadastra é o cliente | [Q3][Q5] |
| Qive | Emitidos (NF-e, CT-e, NFC-e, MDF-e, NFS-e) | Upload, e-mail `eu@arquivei.com.br` (identifica o CNPJ no XML) e Sincroniza Notas® (agente na máquina do emissor, envio a cada 15 min) | Não | [Q4] |
| Qive | Por chave sem certificado | Qive Lite: créditos por chave, lotes de 300, "sem validade jurídica"; a base privada ia até 30/11/2020 | Não, mas o caminho está encerrado/sem validade | [Q1][Q2] |
| **e-Kontroll** | — | Nenhuma página do e-Kontroll descreve captura de XML. O produto é BI sobre o Domínio (B3). O site recusou a leitura (Mod_Security) | `[NÃO ENCONTRADO]` (buscado: "e-Kontroll XML notas fiscais captura Domínio certificado") | [EK1] |
| **Domínio (Thomson Reuters)** | NF-e, CT-e (RS, SC); NFC-e (só RS) | "Importação Web Service SEFAZ" com o **certificado digital do contador**: todas, emissão própria ou de terceiros, até 60 dias retroativos. Alerta de que a Sefaz-RS barrou alguns A3 | Não (RS/SC) | [DOM1] |
| **NF-Stock (Alterdata)** | NF-e e CT-e | autXML com o certificado do contador; busca automática por procuração em AM, PE e RS (exige a Autorização Eletrônica no e-CAC do cliente); envio por chave (exige A1 vinculado) | Opcional | [NFS1][ALT1] |
| NF-Stock | NF-e e NFC-e de saída | Download automático com certificado em AM, CE, DF, ES, GO, MA, MT, PB, PE, PR, RJ, RS, SC, SE e SP (só NFC-e); "Ativar baixa de NFe/NFCe emitida" a partir de um XML-semente dos últimos 30 dias (NF-e em 20 UFs; NFC-e em PA e PE) | Sim (exceto procuração AM/PE/RS) | [NFS1] |
| NF-Stock | Todos os modelos | E-mail `nf@nfstock.com.br`, upload, NF Monitor (pasta "Enviar"), NF-Easy (emissor próprio) | Não | [NFS1] |
| **Fiscal.io** | NF-e e CT-e de saída | Aplicativo com o **certificado da contabilidade**, que lê o autXML ("não precisa ter uma procuração eletrônica") | Não | [FIO1] |
| Fiscal.io | Entradas | Monitor Domínio: busca na Sefaz com o certificado digital de cada empresa, a cada hora | Sim | [FIO2] |
| **Questor** | NFS-e Nacional | "O certificado deve ser da própria empresa, não sendo permitido o uso do certificado do contador" (página anterior à mudança de 01/11/2026) | Sim | resultado de busca de docs.questor.com.br (configcap-nfse-nacional), 06/11/2026 · média |
| **Jettax** | NF-e, NFC-e | Captura com o A1, entrada e saída (já registrado em NFE-004 e NFE-005) | Sim | D3 [C6] |

### Por que o fundador pode não lembrar de ter cadastrado certificados

Estas explicações são hipóteses, cada uma apoiada nas fontes citadas:

1. O **autXML** pede um único certificado, o do escritório, cadastrado uma vez. A partir daí, todas as saídas de NF-e e CT-e dos clientes que configuraram o emissor chegam sozinhas [S-AUT].
2. No **RS ou em SC**, a integração contábil usa o certificado do escritório para todos os clientes [S-RS][S-SC].
3. Na **Qive**, quem cadastra o certificado é a empresa cliente, que libera o acesso ao contador [Q3].
4. A **implantação assistida** do fornecedor (a HubStrom anuncia "em 24 horas [...] certificado digital, clientes cadastrados") pode ter feito o cadastro em lote [H2].
5. Para NFS-e municipal, há prefeituras em que basta o login e a senha do procurador [S-NFSE].

Mesmo assim, **sem o A1 do cliente não há entradas de NF-e fora do RS e de SC** (e de portais como PE e PR). Se as entradas chegam completas em outra UF, o certificado do cliente foi cadastrado por alguém.

---

## 4. Caminhos possíveis, um a um

| # | Caminho | Documentos | Credencial | Status oficial | Quem usa |
| --- | --- | --- | --- | --- | --- |
| 1 | Certificado do cliente enviado uma vez (cofre) | NF-e/CT-e entrada (NSU), NFS-e (ADN), NFC-e SP (SAE), saída por XML-semente | A1 do cliente | Oficial (NT 2014.002; ADN) | Todos |
| 2 | autXML com o CNPJ do escritório | Saídas de NF-e e CT-e (e as entradas em que o fornecedor puser o escritório) | e-CNPJ do escritório | Oficial (NT 2014.002) | SIEG, NF-Stock, Fiscal.io, Domínio |
| 3 | Procuração ou autorização estadual para contabilista com web service | NF-e emitidas e destinadas, CT-e, NFC-e | Certificado do escritório ou do contador + autorização do cliente (RS: e-CAC; SC: vínculo) | **Oficial no RS e em SC** | SIEG, Domínio, NF-Stock |
| 4 | Portal estadual com login ou certificado do contador (sem API) | NF-e de entrada e saída, NFC-e | PE: certificado ou gov.br do contador no e-Fisco; PR: login Receita/PR do cliente ou do contador autorizado; AM: procuração | Oficial no portal, sem API → robô (C-cert/C-crc) | SIEG (AutodocS), NF-Stock |
| 5 | E-mail (XML enviado pelo emissor) | Todos | Nenhuma | Obrigação do emitente de enviar o XML ao destinatário (Portaria CAT 162/2008, art. 13, § 6º, em SP) | Qive, NF-Stock |
| 6 | Integração com o emissor do cliente (API, agente de pasta, emissor próprio) | Todos os emitidos | Nenhuma (contrato/API do emissor) | Privado | SIEG (API/Robocopy), Qive (Sincroniza), NF-Stock (NF Monitor/NF-Easy), Conta Azul (V3) |
| 7 | Consulta por chave | NF-e/CT-e (passado, faltantes) | Certificado de um ator da nota | Oficial; sem certificado acabou em 2020 | SIEG, HubStrom, NF-Stock |
| 8 | ADN da NFS-e com procuração | NFS-e prestadas e tomadas | Certificado do escritório + procuração RFB para os serviços da NFS-e | **Novo, desde 01/11/2026** [FEN2], a confirmar na PoC | Nenhum fornecedor documentou ainda |
| 9 | Download em lote no portal estadual com o certificado do contador | NF-e | Varia por UF | PE sim; SP e MG sem caminho encontrado | — |

---

## 5. Recomendação para a plataforma

1. **Perfil de captura por cliente, escolhido pela UF e pelo documento.** Ordem de preferência: o que não exige o A1 do cliente primeiro, depois o A1 como base garantida.
   - **Saídas de NF-e e CT-e:** autXML com o e-CNPJ do escritório (NFE-002, a plataforma confere se a tag veio em cada nota) + integração contábil RS/SC (NFE-501) + caixa de XML e agente de pasta (NFE-503).
   - **Entradas de NF-e e CT-e:** no RS e em SC, NFE-501 com o certificado do escritório. Nas demais UFs, o **A1 do cliente no app** (decisão 1 continua necessária, NFE-004).
   - **NFS-e:** fazer a PoC do ADN **com o certificado do escritório + procuração** (NFE-502). Se funcionar na distribuição por NSU, a plataforma deixa de depender do A1 do cliente para NFS-e em 5.543 municípios (V2) e guarda menos certificados.
   - **NFC-e:** SC por web service (NFE-501, em teste); SP pelo SAE com o A1 do cliente (V2); nas demais UFs, agente de pasta, API do PDV ou XML-semente (NFE-503/NFE-504).
2. **Revisar a decisão 1 e o 90-consolidado** (linha "Procuração permite ao escritório consultar DF-e e ADN com o próprio e-CNPJ? → não permite"). A resposta passa a ser: **não para a distribuição nacional de NF-e/CT-e; sim para o RS, SC e (no portal) PE; sim para o ADN desde 01/11/2026, pendente de teste.**
3. **O app do cliente vira o lugar das autorizações.** Para cada cliente, ele mostra e cobra o que falta: procuração RFB com os serviços da NFS-e, autorização "Download XML para Contabilistas" no e-CAC do RS, vínculo na SEF-SC, cadastro do contador no e-Fisco (PE), autXML no emissor e A1 (só onde ainda é necessário). Isso se liga a NFE-001, NFE-003 e SOC-012.
4. **Diferencial:** nenhum concorrente encontrado publica o ADN por procuração, nem escolhe sozinho o caminho por UF e documento. A SIEG manda o usuário consultar uma tabela ("InfoDocs") e escolher [S-SAI]. A plataforma faz essa escolha sozinha e mostra a cobertura e as lacunas por cliente.
5. **Riscos:** o web service de NFC-e de SC está em teste e pode ser encerrado [SC2]; a Sefaz-RS barrou alguns A3 [DOM1]; robôs de portal (PE, PR) dependem dos termos de uso e exigem o login do contador (regra do protocolo para C-crc); o XML-semente (NFE-504) tem mecanismo não divulgado pelos fornecedores.

---

## 6. Fichas novas

### NFE-501 — Capturar NF-e, NFC-e e CT-e dos clientes pelos serviços estaduais para contabilistas, com o certificado do escritório

| Campo | Conteúdo |
| --- | --- |
| id | NFE-501 |
| aba / subárea | Notas fiscais / Captura estadual por procuração |
| etapa | Entrada (pedir e aceitar a autorização), Manutenção (captura), Desligamento (revogar) |
| atividade | Capturar NF-e, NFC-e e CT-e emitidos e destinados aos clientes pelos web services estaduais para contabilistas (RS, SC) e pelos portais que aceitam o contador (PE, PR, AM), com o certificado do escritório |
| descrição | Hoje o escritório gaúcho ou catarinense configura o web service no Domínio ou contrata SIEG/NF-Stock; nas outras UFs nem sabe se existe caminho. A plataforma cobra do cliente a autorização no portal estadual, registra o aceite do contador, captura com o e-CNPJ do escritório e marca no perfil do cliente quais documentos vêm por aqui |
| gatilho_frequência | Diária (captura); por evento (cliente novo, troca de contador) |
| porte_alcance | Clientes com IE no RS e em SC (NF-e, CT-e, NFC-e); PE, PR e AM por portal |
| quem_faz | Analista fiscal; atendimento para a autorização |
| onde_é_feita_hoje | Domínio (Importação Web Service SEFAZ), SIEG (Integração Contábil Estadual), NF-Stock (procuração), portais e-CAC RS, SEF-SC, e-Fisco PE, Receita/PR |
| entradas / saídas | Autorização do cliente, e-CNPJ do escritório / XMLs por cliente, eventos, cobertura por documento |
| base_legal | Serviços oficiais do RS e de SC [RS1][SC1][SC2]; e-Fisco PE [PE1]; NT 2014.002 para comparação |
| risco_se_falhar | Notas faltando no fechamento; dependência do A1 do cliente sem necessidade |
| concorrentes | SIEG (RS e SC, inclusive NFC-e SC a cada hora) [S-RS][S-SC][S-NFCSC]; Domínio (RS e SC, 60 dias) [DOM1]; NF-Stock (AM, PE, RS) [NFS1][ALT1]; HubStrom não documenta |
| hipótese_automação | Web service RS/SC (A) com o certificado do escritório; robô no e-Fisco PE e no Receita/PR (C-cert/C-crc); checklist de autorização no app |
| papel_da_ia | M1 (regra por UF), M2 (perfil de captura do cliente), M4 (executar a captura; rascunhar o pedido de autorização ao cliente) |
| ferramentas_agênticas | `perfil_captura(cliente)`, `pedir_autorizacao_estadual(cliente, uf)`, `capturar_ws_contabilista(uf, cnpj)`, `cobertura_documentos(cliente)` |
| eventos_timesheet | Fiscal / captura estadual / cliente / duração da configuração e do tratamento de falhas |
| nível_automação | A (RS, SC); C-cert ou C-crc (PE, PR, AM) |
| integrações | Web service de download para contabilistas Sefaz-RS; WS de download NF-e e NFC-e da SEF-SC (BT 2026-001/003); e-Fisco PE |
| credencial_exigida | e-CNPJ do escritório ou e-CPF do contador + autorização eletrônica do cliente (RS: e-CAC; SC: vínculo; PE: contador cadastrado no e-Fisco) |
| preço | Gratuito (serviço público) |
| limites_e_riscos | NFC-e SC em teste; Sefaz-RS barrou alguns A3; 60 a 90 dias retroativos; robôs de portal sujeitos aos termos de uso |
| confiança | Alta para SC (página oficial lida) e PE; média para RS (página oficial recusou a leitura; aviso lido em transcrição e confirmado por SIEG e Domínio) |
| fontes | [RS1][ACBR1][SC1][SC2][PE1][PR1][S-RS][S-SC][S-NFCSC][S-PR][S-PE][DOM1][NFS1][ALT1] (06/11/2026) |

### NFE-502 — Trocar a captura do ADN da NFS-e para o certificado do escritório com procuração eletrônica

| Campo | Conteúdo |
| --- | --- |
| id | NFE-502 |
| aba / subárea | Notas fiscais / Captura de serviços |
| etapa | Entrada (procuração), Manutenção, Desligamento (revogar) |
| atividade | Obter de cada cliente a procuração RFB com os serviços da NFS-e e capturar as NFS-e prestadas e tomadas no ADN com o certificado do escritório, sem guardar o A1 do cliente |
| descrição | Até outubro de 2026, toda ferramenta pedia o A1 de cada cliente para o ADN (SIEG, Questor). Desde 01/11/2026, as APIs de Emissão e Distribuição aceitam representação por procuração eletrônica ou por vínculo no CNPJ. A plataforma pede a procuração no app, valida, testa a distribuição por NSU com o e-CNPJ do escritório e só cai para o A1 do cliente se o teste falhar |
| gatilho_frequência | Diária (NSU); por evento (cliente novo, procuração vencendo) |
| porte_alcance | Todo prestador ou tomador de serviço nos 5.543 municípios aderentes |
| quem_faz | Analista fiscal; atendimento |
| onde_é_feita_hoje | Ferramentas de captura com o A1 do cliente; Emissor Nacional Web (representação manual) |
| entradas / saídas | Procuração RFB, e-CNPJ do escritório / XMLs de NFS-e, eventos |
| base_legal | LC 214/2025 (compartilhamento com o ADN); funcionalidade de representação de 01/11/2026 (tópico 11 do manual do Emissor Web) [FEN2] |
| risco_se_falhar | NFS-e tomadas sem retenção conferida; guarda desnecessária de centenas de A1 (LGPD) |
| concorrentes | Nenhum fornecedor documentou a captura do ADN por procuração `[NÃO ENCONTRADO]` (buscado: "NFS-e Nacional ADN procuração contador consulta notas certificado do escritório 2026"); SIEG e Questor documentam só o A1 do cliente [S-NFSE] |
| hipótese_automação | API de Distribuição do ADN com o certificado do escritório + controle de procurações (SOC-012) |
| papel_da_ia | M1 (regras de representação), M2 (status da procuração por cliente), M4 (executar a captura e cobrar a procuração) |
| ferramentas_agênticas | `validar_procuracao_nfse(cliente)`, `capturar_adn_nsu(cliente, credencial='escritorio')`, `fallback_a1(cliente)` |
| eventos_timesheet | Fiscal / NFS-e / cliente / tempo de cobrança e de tratamento de falhas |
| nível_automação | A (pendente de PoC) |
| integrações | ADN, serviço de distribuição: https://adn.nfse.gov.br/contribuintes/docs/index.html |
| credencial_exigida | e-CNPJ do escritório + procuração eletrônica RFB para os serviços da NFS-e (ou vínculo no CNPJ) |
| preço | Gratuito |
| limites_e_riscos | Fonte secundária (Fenacon citando o Portal da NFS-e); a carta da Fenacon de junho falava das "APIs de busca"; falta confirmar se a distribuição por NSU por CNPJ do representado funciona e com quais limites |
| confiança | Média |
| fontes | [FEN1][FEN2][S-NFSE]; Questor docs (06/11/2026) |

### NFE-503 — Receber os XMLs emitidos por caixa de e-mail dedicada, agente de pasta ou API do emissor

| Campo | Conteúdo |
| --- | --- |
| id | NFE-503 |
| aba / subárea | Notas fiscais / Captura de saídas |
| etapa | Entrada (configurar o emissor), Manutenção |
| atividade | Dar a cada cliente um endereço de e-mail e um agente de pasta que recebem automaticamente os XMLs emitidos (NF-e, NFC-e, CT-e, NFS-e, CF-e) e os vinculam ao cliente pelo CNPJ |
| descrição | Hoje os XMLs chegam por e-mail pessoal ou WhatsApp e alguém salva à mão (NFE-012). Concorrentes oferecem e-mail único que lê o CNPJ do XML e agente que vigia a pasta do emissor. A plataforma faz o mesmo e cruza com a sequência numérica (NFE-020) para apontar faltas |
| gatilho_frequência | Contínua |
| porte_alcance | Clientes cujo emissor ou PDV não tem autXML, sem integração estadual, varejo com NFC-e fora de SC e SP |
| quem_faz | Analista fiscal; atendimento na configuração |
| onde_é_feita_hoje | E-mail, pasta do emissor, WhatsApp |
| entradas / saídas | XMLs enviados pelo emissor / XMLs no cofre, alertas de lacuna |
| base_legal | Obrigação do emitente de enviar o XML ao destinatário (ex.: Portaria CAT 162/2008, art. 13, § 6º, SP) [SP1] |
| risco_se_falhar | Saídas fora do fechamento, receita divergente da declaração |
| concorrentes | Qive (e-mail e Sincroniza Notas a cada 15 min) [Q4]; NF-Stock (e-mail `nf@nfstock`, NF Monitor) [NFS1]; SIEG (API e Robocopy) [S-SAI] |
| hipótese_automação | Caixa de entrada por escritório com roteamento pelo CNPJ do XML; agente leve para Windows; API de upload |
| papel_da_ia | M2 (vincular ao cliente, deduplicar), M4 (avisar lacunas) |
| ferramentas_agênticas | `receber_xml_email()`, `agente_pasta_status(cliente)`, `detectar_lacuna_sequencia(cliente, serie)` |
| eventos_timesheet | Fiscal / captura de saídas / cliente |
| nível_automação | Próprio |
| integrações | Caixa de e-mail própria; agente de pasta; API de upload |
| credencial_exigida | Nenhuma |
| preço | Custo próprio |
| limites_e_riscos | Depende de o emissor enviar; XML sem validação de autenticidade (conferir assinatura e protocolo) |
| confiança | Alta (páginas dos fornecedores lidas) |
| fontes | [Q4][NFS1][S-SAI] (06/11/2026) |

### NFE-504 — Capturar NF-e e NFC-e de saída por sequência a partir de um XML-semente, com o A1 do cliente

| Campo | Conteúdo |
| --- | --- |
| id | NFE-504 |
| aba / subárea | Notas fiscais / Captura de saídas |
| etapa | Entrada, Manutenção |
| atividade | Capturar as NF-e e NFC-e emitidas pelo cliente a partir de um XML recente de cada série, seguindo a numeração, quando não há autXML nem integração estadual |
| descrição | A distribuição nacional não devolve ao emitente as próprias notas. A SIEG ("Modelo 55", 60 dias, 24 UFs) e o NF-Stock ("Ativar baixa de NFe/NFCe emitida", XML dos últimos 30 dias, NF-e em 20 UFs e NFC-e em PA e PE) pedem um XML-semente por série e o A1 do cliente para seguir a sequência. Nenhum dos dois explica o mecanismo técnico |
| gatilho_frequência | Diária |
| porte_alcance | Clientes sem autXML, fora do RS e de SC, com emissor sem integração |
| quem_faz | Analista fiscal |
| onde_é_feita_hoje | SIEG, NF-Stock |
| entradas / saídas | XML-semente, A1 do cliente / XMLs emitidos |
| base_legal | NT 2014.002 (emitente fora da distribuição) [R2-NT] |
| risco_se_falhar | Saídas faltando; série nova não configurada passa despercebida |
| concorrentes | SIEG [S-M55]; NF-Stock [NFS1]; HubStrom anuncia saída em 23 estados sem detalhar [H2] |
| hipótese_automação | Só depois de entender o mecanismo; enquanto isso, usar NFE-503 e autXML |
| papel_da_ia | M2 (séries por cliente), M4 (alertar série nova) |
| ferramentas_agênticas | `configurar_semente(cliente, serie, xml)`, `alertar_serie_nova(cliente)` |
| eventos_timesheet | Fiscal / captura de saídas / cliente |
| nível_automação | C-cert (provável; mecanismo não divulgado) |
| integrações | `[NÃO VERIFICADO]` (mecanismo dos fornecedores não publicado) |
| credencial_exigida | A1 do cliente |
| preço | `[PREÇO NÃO PÚBLICO]` (a SIEG conta essas notas no pacote mensal de download) |
| limites_e_riscos | Mecanismo desconhecido; exige uma semente por série; não cobre AM, BA, MA (SIEG) |
| confiança | Baixa |
| fontes | [S-M55][NFS1][H2] (06/11/2026) |

**Ajuste sugerido em ficha existente (sem nova ficha):** em NFE-002, o campo `concorrentes` passa a citar a SIEG (guias de autXML para os emissores Bling, Tiny, MarketUP e Mercado Livre; captura diária só a partir da data da autorização) [S-AUT][S-HELP]. A conferência automática da presença da tag em cada nota continua sem concorrente encontrado.

---

## 7. Fontes (todas consultadas em 06/11/2026)

**Oficiais**
- [RS1] Receita Estadual RS, "Como os contabilistas terão acesso às NF-e de seus clientes": https://atendimento.receita.rs.gov.br/como-os-contabilistas-terao-acesso-as-nf-e-de-seus-clientes (o servidor recusou a leitura direta; conteúdo pelo resultado de busca e por [ACBR1])
- [SC1] SEF-SC, Web service para download de NF-e: https://www.sef.sc.gov.br/saiba-mais/web-service-para-download-de-nfe
- [SC2] SEF-SC, Web service para download de NFC-e: https://www.sef.sc.gov.br/saiba-mais/web-service-para-download-de-nfce
- [PE1] Sefaz-PE, Download do XML das NF-e: https://www.sefaz.pe.gov.br/Servicos/nota-fiscal-eletronica/Paginas/download.aspx
- [R2-NT] NT 2014.002 v1.40 (cópia integral): https://www.reformatributaria.com/wp-content/uploads/2026/07/NT2014.002_v1.40-WsNFeDistribuicaoDFe-CNPJ-alfa.pdf (lida no V2)

**Fornecedores (documentação própria)**
- [S-HELP] SIEG, Central de ajuda, categoria Docs. Fiscais: https://sieg-solucoes.help.userguiding.com/pt/categories/339-docs-fiscais
- [S-SAI] SIEG, "Como capturar Notas de Saída na SIEG" (atualizado em 14/08/2026): https://sieg-solucoes.help.userguiding.com/pt/articles/23263-como-capturar-notas-de-saida-na-sieg
- [S-AUT] SIEG, "Autorização de Download (TAG AutXML)": https://sieg-solucoes.help.userguiding.com/pt/articles/473-autorizacao-de-download-tag-autxml
- [S-M55] SIEG, "Modelo 55 - Configurando NF-es de Saída com certificado A1 do cliente": https://sieg-solucoes.help.userguiding.com/pt/articles/469-modelo-55-configurando-nfes-de-saida-com-certifica
- [S-RS] SIEG, "Integração Contábil Estadual (RS)": https://sieg-solucoes.help.userguiding.com/pt/articles/711-integracao-contabil-estadual-rs-rio-grande-do-sul
- [S-SC] SIEG, "Integração Contábil Estadual (SC)": https://sieg-solucoes.help.userguiding.com/pt/articles/712-integracao-contabil-estadual-sc-santa-catarina
- [S-NFCSC] SIEG, "Captura de NFC-e SC disponível pela Integração Contábil Estadual" (11/05/2026): https://sieg-solucoes.help.userguiding.com/pt/articles/22497-captura-de-nfce-sc-disponivel-pela-integracao
- [S-NFCSP] SIEG, "Como ativar a captura de NFC-e - São Paulo" (28/10/2026): https://sieg-solucoes.help.userguiding.com/pt/articles/20549-como-ativar-a-captura-de-nfce-sao-paulo
- [S-NFSE] SIEG, "Como capturar Notas de Serviço na SIEG": https://sieg-solucoes.help.userguiding.com/pt/articles/23364-como-capturar-notas-de-servico-na-sieg
- [S-PR] SIEG, "Integração Estadual PR no AutodocS": https://sieg-solucoes.help.userguiding.com/pt/articles/23035-integracao-estadual-pr-no-autodocs
- [S-PE] SIEG, "Integração Estadual PE no AutodocS": https://sieg-solucoes.help.userguiding.com/pt/articles/23021-integracao-estadual-pe-no-autodocs
- [S-CHV] SIEG, "Como Adicionar Chaves para Download no Docs. Fiscais": https://sieg-solucoes.help.userguiding.com/pt/articles/14412-como-adicionar-chaves-para-download-no-docs
- SIEG, FAQ da página Docs Fiscais: https://www.sieg.com/docs-fiscais ; blog "Portal Nacional: como automatizar a captura" (fev/2026): https://www.sieg.com/portal-nacional-como-automatizar-a-captura-de-notas-fiscais/
- [H1] HubStrom, XMLHub: https://hubstrom.com/solucoes/xmlhub
- [H2] HubStrom, página inicial: https://hubstrom.com/
- [Q1] Qive, "Qive Lite: consulta e download de NFe sem certificado digital" (atualizado em 14/01/2026): https://qive.com.br/blog/consulta-nfe-sem-certificado-digital-arquivei-lite
- [Q2] Qive, "Consulta de NFes sem certificado digital": https://qive.com.br/blog/consulta-nfes-certificado-digital
- [Q3] Qive, "Recebimento de NFes: o escritório contábil pode centralizar": https://qive.com.br/blog/recebimento-nfes-centralizar-bf
- [Q4] Qive, "Importação e download de XML": https://qive.com.br/funcionalidades/importacao-e-download-de-xml
- [Q5] Qive, "Como baixar XML de NFe e CTe com certificado digital": https://qive.com.br/blog/baixar-xml-nfe-cte-certificado-digital (pelo resultado de busca)
- [EK1] e-Kontroll: https://e-kontroll.com.br/ (recusou a leitura: Mod_Security)
- [DOM1] Domínio, "SC, RS - Como importar notas Web Service SEFAZ?": https://suporte.dominioatendimento.com/central/faces/solucao.html?codigo=2294
- [NFS1] Alterdata NF-Stock, "Formas de enviar as notas de saída": https://ajuda.alterdata.com.br/nfstockbase/nf-stock-voce-sabe-quais-sao-as-formas-de-enviar-as-notas-de-saida-para-o-nf-stock
- [ALT1] Alterdata NF Monitor, "Configurar Procuração" (RS): https://ajuda.alterdata.com.br/nm/configurar-procuracao ; Prosoft, "Como vincular empresa no cadastro do Contador na SEFAZ RS": https://ajuda.alterdata.com.br/prosofterp/e1487-como-vincular-empresa-no-cadastro-do-contador-na-sefaz-rs-149127781.html
- [FIO1] Fiscal.io, "Como baixar NFe e CTe com o certificado da contabilidade": https://conteudo.fiscal.io/como-baixar-nfe-e-cte-certificado-contabilidade-procuracao-eletronica
- [FIO2] Fiscal.io Monitor Domínio (PDF): https://www.fiscal.io/assets/docs/fiscal-io-monitor-dominio-xmls-direto-no-erp.pdf (pelo resultado de busca)

**Secundárias**
- [FEN2] Fenacon, "Nova funcionalidade possibilita representação e alternância de perfis na NFS-e" (03/11/2026, cita o Portal da NFS-e): https://fenacon.org.br/?p=55980
- [FEN1] Fenacon, Ofício OF.P.0100 (jun/2026): https://fenacon.org.br/wp-content/uploads/2026/06/OF.P.0100-Viabilizacao-de-procuracao-eletronica-na-NFS-e-Nacional.pdf ; AmdJus (03/11/2026): https://amdjus.com.br/nfs-e-nacional-libera-representacao-de-terceiros-sem-trocar-de-login/
- [ACBR1] Fórum ACBr, transcrição do aviso da Sefaz-RS (2017): https://www.projetoacbr.com.br/forum/topic/35012-webservice-sefazrs-download-nfc/
- [SP1] Portal CPA, cópia do FAQ Sefaz-SP (atualizado em 23/10/2023): https://netcpa.com.br/colunas/sefazsp-como-os-contabilistas-terao-acesso-as-nf-e-de-seus-clientes/8961
- [PR1] Fórum Contábeis, relato de download no Receita/PR (2017): https://www.contabeis.com.br/forum/tecnologia-contabil/246130/download-de-xml-em-lote-gratuito/
- Guia de terceiros sobre o cadastro na SIEG (procurações vinculadas ao certificado, até 72 h): https://www.glitter.io/guides/como-atualizar-adicionar-cadastros-sieg (só pelo resultado de busca; a página dava 404 nesta data)

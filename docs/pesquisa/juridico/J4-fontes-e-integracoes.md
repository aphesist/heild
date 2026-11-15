# J4 · Fontes de dados e integrações do mundo jurídico (pacote Jurídico/Advocacia)

**Data da pesquisa e do acesso: 08/11/2026.** Frente J4 da descoberta do pacote Jurídico/Advocacia. Equivalente jurídico do [Subplano 08 · Conectores](../../planos/subplanos/08-Conectores.md) e da base temporal do [Plano de Ingestão da Base Legal](../../planos/Plano_de_Ingestao_da_Base_Legal.md); consolidado de plataforma em [90-consolidado](../plataforma/90-consolidado.md).

**Convenções.** Níveis como no Subplano 08: **A** API oficial gratuita · **A$** API oficial paga · **B** fornecedor (agregador) · **C** robô (C-cert com certificado, C-crc, C-captcha) · **F** arquivo · **D-assistido** humano no circuito · **Próprio** feito na plataforma. Marcas de verificação em cada fonte: **[lido]** página aberta e extraída em 08/11/2026; **[testado]** chamada real feita em 08/11/2026; **[busca]** conhecido só pelo resumo de busca, página não aberta (vale como indício, não como prova); **[a confirmar]** não verificado. Nenhum preço foi inventado: onde não há tabela pública está escrito "sob proposta" ou "[a confirmar]". Valores em R$ são de tabela pública, sem desconto. Limites da coleta: 30 buscas; vários hosts de tribunais (TJES, TJMA, TJPB, TRTs, planalto.gov.br) não responderam ou barraram o acesso do ambiente; `comunicaapi.pje.jus.br` devolveu 403 de bloqueio geográfico (ver 1.2).

---

## 0. Resumo executivo

1. **Existe um "andar oficial" gratuito e útil, mas ele não cobre o ciclo completo.** DataJud dá metadados (sem partes, sem teor); DJEN e Domicílio Judicial Eletrônico dão intimações; o Jus.br/PDPJ-Br dá consulta e peticionamento só por login humano. Não há API oficial aberta para "acompanhar andamento + baixar peças + protocolar" de qualquer tribunal.
2. **O termo de uso do DataJud proíbe uso comercial e a exploração comercial de informação derivada** (cláusulas 3.3 e 3.8). A trava é real para um SaaS pago. O caminho formal previsto é a Resolução CNJ 574/2024 (acesso contratual, com cobrança de custo e contrapartida), ainda a negociar.
3. **Captura de andamentos e publicações em escala = nível B no começo.** Judit publica tabela (consulta por número CNJ a partir de R$ 0,25; monitoramento processual R$ 1,50 por processo/mês na faixa de R$ 1 mil/mês; monitoramento via DJEN R$ 1,35). Escavador não publica preço de API; Jusbrasil Soluções (que absorveu a Digesto) só por proposta.
4. **Robô em tribunal é risco de bloqueio da credencial do advogado** (Res. CNJ 185/2013 art. 29, relatado por TRT4 e TRT11; Res. 574/2024 art. 3º). O certificado da OAB é A3 (token ou nuvem), não A1: automação com o certificado do advogado é desencorajada. Peticionamento deve ser **D-assistido**.
5. **Legislação federal: a base aberta é boa.** A API de legislação do Senado devolve, por norma, as **alterações por dispositivo** ("Art. 68-G, caput: Acréscimo", vetos, revogações) [testado]. Isso alimenta direto a ficha "Evento normativo" do Plano de Ingestão. Texto de lei e de decisão judicial não tem direito autoral (Lei 9.610, art. 8º, IV).
6. **Jurisprudência: o STJ publica dados abertos em CC-BY** (íntegras de acórdãos e decisões terminativas 2008 a out/2026, espelhos por órgão e 2.410 precedentes qualificados com tese, situação e referência legislativa) [testado]. STF e TST não têm dump de texto encontrado. TJs: raspagem ou fornecedor.
7. **Doutrina e modelos de peça: nada é "aberto".** O Brasil não tem exceção de mineração de texto e dados na Lei 9.610 (art. 46) nem "fair use"; o PL 2338/2023 segue na Câmara. Licenciar caso a caso ou produzir conteúdo próprio.
8. **O maior risco novo, frente ao contábil, é o sigilo**: sigilo profissional do advogado, segredo de justiça e dados pessoais de processos. A OAB tem a Recomendação 001/2024 (informar o cliente do uso de IA) e o provimento de IA ainda está em preparação (Plano Nacional anunciado em 10/06/2026).
9. **A base temporal do contábil serve, com três mudanças:** janela histórica "desde a origem" (não 10 anos), uma ficha nova de **Precedente/Súmula com ciclo de vida** e um **calendário forense** (suspensões de prazo por tribunal) como tabela normativa.
10. **Ordem sugerida:** núcleo temporal + Fundamentos → captura de intimações (DJEN, Domicílio) → módulo Trabalhista/Previdenciário (maior sinergia com o contábil) → Família e Sucessões → Civil → Penal, com jurisprudência do STJ aberta desde o início e nenhuma raspagem antes de parecer jurídico (seção 5).

---

## 1. Processos e tribunais

### 1.1 DataJud (CNJ)

- **O que é.** Base nacional de metadados processuais (Res. CNJ 331/2020). API pública Elasticsearch por tribunal: `https://api-publica.datajud.cnj.jus.br/api_publica_{tribunal}/_search`, com aliases para TST, TSE, STJ, STM, TRF1 a 6, 27 TJs e TRTs (a lista extraída parou no TRT12; TREs e demais [a confirmar]) [lido: [Endpoints](https://datajud-wiki.cnj.jus.br/api-publica/endpoints), acesso 08/11/2026].
- **Credencial.** Chave pública única, no cabeçalho `Authorization: APIKey ...`, publicada na wiki e **trocável pelo CNJ a qualquer momento** [lido: [Acesso](https://datajud-wiki.cnj.jus.br/api-publica/acesso)]. Guardar em configuração, não no código. Sem custo.
- **Teste real (08/11/2026).** Consulta ao índice do TRT4 respondeu 200. Campos devolvidos: `numeroProcesso`, `tribunal`, `grau`, `classe`, `assuntos`, `orgaoJulgador`, `dataAjuizamento`, `nivelSigilo`, `sistema`, `formato`, `dataHoraUltimaAtualizacao` e `movimentos` (código TPU, nome, data e hora, complementos tabelados) [testado]. **Não há partes, advogados, teor de decisão nem peças.** Portanto "buscar por CPF, CNPJ ou OAB" (como alguns fornecedores anunciam) não vem do DataJud público.
- **Limites.** Sem número oficial de requisições por minuto; os termos permitem ao CNJ limitar por chave sem aviso [busca: [Judit](https://judit.io/blog/apis-dados-juridicos-integracoes/datajud-cnj-api-publica-x-privada-comparacao/)]. Defasagem de atualização varia por tribunal [a confirmar]. Sem push/webhook documentado.
- **Termos de uso (a trava).** A wiki reforça: "3.3 A API é fornecida exclusivamente para fins legais, **não comerciais** e autorizados"; "3.6 O CNJ não garante a precisão, integridade ou atualidade"; "3.8 O usuário concorda em não modificar, distribuir, **vender ou explorar comercialmente a API ou qualquer informação derivada dela**"; "3.9 dar ciência ao CNJ de qualquer estudo ou relatório disponibilizado ao público"; o simples uso implica aceitação [lido: [Termo de Uso](https://datajud-wiki.cnj.jus.br/api-publica/termo-uso); PDF V1.2 em [formularios.cnj.jus.br](https://formularios.cnj.jus.br/wp-content/uploads/2023/11/Termos-de-uso-api-publica-V1.2.pdf) [busca]].
- **Via contratual (Res. CNJ 574/2024, 26/08/2024).** O CNJ "poderá oferecer, por meio de instrumento próprio, acesso aos dados judiciais públicos" consolidados (data lake) por API; a Presidência regulamenta condições (§ 1º; Portaria 316/2024 [busca]); o DTI avalia a capacidade técnica do consumidor, inclusive uptime (§ 2º); tribunais e conselhos "poderão limitar ou bloquear o acesso (...) em caso de comportamento inautêntico ou consumo abusivo" (art. 3º); o CNJ "deverá instituir a cobrança, limitada ao custo efetivo do serviço", podendo ser por bilhetagem direta do integrador de nuvem ao interessado (art. 4º, caput e § 1º); pode condicionar o acesso ao compromisso de oferecer "de forma não onerosa" aos magistrados, pela PDPJ-Br, os produtos desenvolvidos a partir dos dados (art. 4º, § 3º) [lido: [Resolução 574](https://atos.cnj.jus.br/files/original1542412024083066d1e8710296b.pdf)]. **Conclusão:** para uso comercial sustentável, abrir tratativa com o CNJ (instrumento, custo, contrapartida). Prazo e preço [a confirmar].
- **Atividades atendidas:** validar número CNJ (formato e tribunal); classe, assunto e movimentos por TPU; "última movimentação"; jurimetria de carteira. Não atende publicações, prazos nem peças.

### 1.2 DJEN e Domicílio Judicial Eletrônico (CNJ)

- **Regra.** O DJEN (Diário de Justiça Eletrônico Nacional, `comunica.pje.jus.br`) é o instrumento de publicação dos atos judiciais; é obrigatório para processos judiciais (Res. CNJ 455/2022, art. 13) e é o meio de **intimação dos advogados e sociedades de advogados**; o Domicílio fica para citações e intimações pessoais a partes e terceiros [lido: [CNJ, Comunicações Processuais](https://www.cnj.jus.br/programas-e-acoes/processo-judicial-eletronico-pje/comunicacoes-processuais/)]. Contagem: publicação no primeiro dia útil após a disponibilização, prazo a partir do dia útil seguinte [busca: [Projuris](https://www.projuris.com.br/blog/djen/)]. Res. 569/2024 também citada [busca].
- **Domicílio: cadastro obrigatório** para União, Estados, DF, Municípios, administração indireta e **empresas públicas e privadas**; a exigência não se aplica a ME e EPP com e-mail cadastrado na Redesim (texto parcial) [lido, mesma página CNJ]. **Ponto de contato com o contábil:** cadastrar o CNPJ do cliente no Domicílio é uma tarefa nova da carteira contábil (a confirmar o enquadramento de cada regime).
- **API do Domicílio (nível A).** Existem APIs para instituições consumirem comunicações e **registrarem ciência** ("Domicílio Eletrônico") e para tribunais enviarem ("Comunicações Processuais"). Passo 1: gerar credencial de integração com o usuário do CNPJ; perfis de login por certificado (PJeOffice) ou gov.br; o advogado vê "Meus Representados" (comunicações de clientes cujo processo representa) [lido: [docs PDPJ, Domicílio](https://docs.pdpj.jus.br/servicos-negociais/domicilio-judicial-eletronico/)]. Swagger existe; o resto do passo a passo da credencial não foi extraído [a confirmar]. Dar ciência é ato com prazo: aplica-se a regra C7 do Subplano 08 (listar nunca abre sozinho).
- **API do DJEN (`comunicaapi.pje.jus.br`).** Existe (fornecedores a consomem; a Judit cobra "Monitoramento via DJEN"), mas **não consegui ler o Swagger**: o endpoint respondeu **403 "configured to block access from your country"** a partir do ambiente de pesquisa (fora do Brasil) [testado em 08/11/2026]. Implicações: (a) hospedar o coletor no Brasil (por exemplo região sa-east-1) e (b) validar com o CNJ as condições de uso, limites e se haverá cobrança nos moldes da Res. 574 [a confirmar].
- **Atividades atendidas:** receber intimações por OAB do advogado ou por processo; abrir prazo; ciência de citação a cliente PJ; calendário.

### 1.3 PJe, MNI, e-SAJ, Projudi, eProc, SEEU e a PDPJ-Br

| Tema | Achado | Verificação |
| --- | --- | --- |
| PDPJ-Br | Nuvem pública do Judiciário (Res. CNJ 335/2020); serviços negociais incluem Domicílio, Jus.br Portal de Serviços, Pangea/BNP, SEEU, Sisbajud, Renajud etc. | [lido: [docs.pdpj.jus.br](https://docs.pdpj.jus.br/servicos-negociais/)] |
| Login | Acesso externo ao PJe passou a ser **só via PDPJ-Br (SSO)**, com autenticação em dois fatores; gov.br exige conta nível ouro; certificado exige PJeOffice | [busca: [TRT2](https://ww2.trt2.jus.br/noticias/noticias/noticia/acesso-ao-pje-unicamente-via-pdpj-inicia-as-19h-desta-segunda-feira-31-3), [Manual do Portal Externo](https://docs.pdpj.jus.br/assets/files/Manual_PortalExterno-cfc4a04b8dbcf71ac13a6c90078a758b.pdf)]; situação do gov.br no PJe em 2026 [a confirmar] |
| Peticionamento | Petições iniciais e intercorrentes pelo Jus.br para processos eletrônicos de sistemas integrados à PDPJ-Br | [busca: [CNJ/OAB, folder 2025](https://cnj.jus.br/wp-content/uploads/2025/03/folder-jus-br-oab-2025-ajustado.pdf)] |
| MNI | Padrão de interoperabilidade; versões 2.2.2 e 2.2.3 usadas pelo Escritório Digital; REST do MNI 2.2.x e 3.0 em homologação/desenvolvimento em 2022. Integração de sistema externo exige **adesão/termo de cooperação por tribunal** (indício no TJSP) | [busca: [CNJ, apresentação 2022](https://www.cnj.jus.br/wp-content/uploads/2022/11/apresentacao-programa-e-projetos-de-tic-novembro-2022.pdf), [FAQ Escritório Digital TJSP](https://www.tjsp.jus.br/Download/Pdf/EscritorioDigital/FAQEscritorioDigital.pdf), [Termo de Adesão MNI](https://www.trf3.jus.br/documentos/dirg/Termo_de_Adesao___MNI_para_Tribunais___VF_2024_assinado_1.pdf)]; estado atual do MNI 3.0 [a confirmar] |
| Escritório Digital (CNJ + OAB) | O advogado cadastra login de cada sistema; usa MNI para trazer intimações | [busca: [Legalcloud](https://legalcloud.com.br/escritorio-digital-cnj/)] |
| e-SAJ, eproc, Projudi | Sem documentação pública de API para terceiros encontrada. TJSP condiciona integração por web service/MNI a convênio ou termo de cooperação | [busca]; **[a confirmar]** por tribunal |
| Consulta pública por número CNJ | Portais públicos de tribunais usam CAPTCHA (TRT12 desde 2016; TJPB) e bloqueiam uso excessivo | [busca: [TRT12](https://portal.trt12.jus.br/index.php/node/6640), [TJPB](https://www.tjpb.jus.br/w/sistema-captcha-ser%C3%A1-adotado-pelo-tjpb-a-partir-desta-quinta-feira-19-)] |

### 1.4 Robôs e a política dos tribunais

- **Base normativa:** Res. CNJ 185/2013, art. 29: pode-se bloquear usuário cujo uso inadequado reduza significativamente a disponibilidade do PJe. O TRT4 trata como excessivo **mais de 1.500 acessos a processos de terceiros em 30 dias** (critério não vale para a consulta pública) [busca: [TRT4](https://www.trt4.jus.br/portais/trt4/modulos/noticias/320926), [OAB/RS](https://www2.oabrs.org.br/jornalDaOrdem/trt4-bloqueara-usuarios-do-pje-que-realizarem-consultas-excessivas-a-processos-de-terceiros/46683)]. O TRT11 alerta que robôs sobrecarregam a infraestrutura e que credenciais acima do limite são bloqueadas [busca: [TRT11](https://portal.trt11.jus.br/index.php/comunicacao/11794-trt-11-alerta-para-riscos-do-acesso-automatizado-em-massa-ao-pje-e-orienta-advocacia)]. A Res. 574/2024, art. 3º, repete a faculdade de bloquear "comportamento inautêntico ou consumo abusivo" **inclusive por API** [lido].
- **Consequência de produto:** o conector não deve "logar como o advogado" em escala. Regra proposta: C-cert e C-captcha ficam **fora do MVP**; quando inevitável, só com humano, uma consulta por vez, e parecer de risco por tribunal (Subplano 08, regra C8).
- **Certificado digital.** O certificado ICP-Brasil da OAB é **A3** (token ou nuvem), sem versão A1 em arquivo [busca: [Estratégia OAB](https://oab.estrategia.com/portal/certificado-digital-o-que-e-e-como-o-advogado-iniciante-compra/)]; a OAB/SP anunciou nuvem gratuita para novos inscritos e preços de referência (nuvem R$ 49/ano; A3 de 3 anos R$ 199 ou R$ 229 com token) em matéria antiga: **confirmar tabela atual** [busca: [Migalhas](https://www.migalhas.com.br/quentes/400944/oabsp-novos-inscritos-terao-certificado-digital-em-nuvem-gratuito)]. Se aceitam certificado em nuvem no PJeOffice em todos os tribunais: [a confirmar]. A1 serve a empresa e a rotina automatizada; a plataforma **nunca guarda o certificado do advogado** (alinha com a regra C2 e "qualificada nunca com o A1 do cofre", Subplano 08).
- **Procuração.** Para o contábil, procuração sustenta o acesso ao e-CAC; no jurídico, a procuração do cliente (ad judicia) habilita o advogado a ver "Meus Representados" no Domicílio e a atuar no processo. Assinatura da procuração: ver 5.4.

### 1.5 Fornecedores de captura de andamentos e publicações (nível B)

| Fornecedor | O que oferece | Credencial | Custo (tabela pública) | Fonte |
| --- | --- | --- | --- | --- |
| **Judit** (API Jurídica) | Consulta processual por número CNJ ("retorno em até 2 s", capa + movimentos, tribunais em tempo real); histórica por CPF/CNPJ/OAB/nome (Data Lake ou On Demand); autos (anexos, públicos e privados); monitoramento processual diário; monitoramento de novas ações; **monitoramento por processo e por entidade via DJEN**; mandados de prisão; dados cadastrais RFB; resumo por IA | Chave de API; contrato "API Anual (pós-pago)" por faixa de consumo mensal (R$ 1k a R$ 35k) ou "Pré-pago" por pacote (R$ 5k a R$ 100k) | **Faixa R$ 1k/mês:** consulta processual R$ 0,25; histórica Data Lake R$ 1,50 e On Demand R$ 6,00 por 1.000 processos retornados; sintética R$ 0,75; contador R$ 0,50; autos R$ 3,50; **monitoramento processual R$ 1,50 por processo/mês**; novas ações R$ 15,00 (+ R$ 0,25 por processo); filtro customizado R$ 100,00 (+ R$ 0,25); **DJEN por processo R$ 1,35/mês; DJEN por entidade R$ 1,35 por 100 entregas**; mandado de prisão R$ 1,00; execução criminal R$ 0,50; cadastral R$ 0,13 a R$ 0,20; resumo IA R$ 0,10. Na faixa R$ 35k, consulta processual cai a R$ 0,07 e monitoramento a R$ 0,45. Pré-pago R$ 5k: consulta R$ 1,50; R$ 100k: R$ 0,14 | [lido: [judit.io/precos](https://judit.io/precos), 08/11/2026] |
| **Escavador** (Business API v2) | Consulta por número CNJ e movimentações, por envolvido (nome, CPF/CNPJ), por advogado; monitoramento em tribunais e **diários oficiais**; atualização sob demanda; **callbacks** (novo processo, nova movimentação, novo documento); cadastro de **certificados digitais e autenticações** no fornecedor para acessar sistemas | Token PAT (Bearer); créditos pré-pagos; custo de cada chamada no header `Creditos-Utilizados` (centavos) | **API: não há tabela na documentação** (remete à "página de preços"); limite de requisições por contrato. Planos web (pessoa): banner "Padrão semestral R$ 19,99/mês até 29/11" visto em 08/11/2026 e "Básico R$ 9,90/mês" em resumo de busca: **não servem como preço de API** | [lido: [docs v2](https://api.escavador.com/v2/docs/)]; [busca: [Escavador/preços](https://www.escavador.com/precos)] |
| **Jusbrasil Soluções** (absorveu a Digesto: "Digesto agora é Jusbrasil Soluções") | Monitoramento diário de tribunais, due diligence, base de documentos públicos (citada pelo fornecedor: mais de 1,2 bilhão de documentos e 1,4 mil fontes) | Contrato corporativo | **Sob proposta**; licitações mostram assinaturas anuais da linha PRO, sem preço de API | [lido: [digesto.com.br](https://www.digesto.com.br/)]; [busca: [Legal Technology Hub](https://www.legaltechnologyhub.com/vendors/jusbrasil-solucoes/)] |
| **Legalcloud** | Calculadora de prazos (CPC, CPP, CLT, JEC; suspensões e prorrogações de todos os tribunais "atualizadas diariamente"); plano Premium com prazos DJEN/DJE em mais de 800 comarcas, agenda, "Publicações com IA"; "mais de 400 mil advogados" (autodeclarado) | Conta | **[a confirmar]** (calculadora gratuita; Premium sem preço extraído) | [lido: [legalcloud.com.br](https://www.legalcloud.com.br/)] |
| **Turivius** | Pesquisa de jurisprudência, jurimetria, monitoramento, IA (GPTuri) | Conta | **[a confirmar]** (sem tabela pública) | [lido: [turivius.com](https://turivius.com/)] |
| Astrea, Projuris, Legal One | Gestão com monitoramento embutido | Conta | Astrea "a partir de R$ 21,64/mês" em agregador de baixa confiabilidade; demais **[a confirmar]** | [busca: [GetApp](https://www.getapp.com/legal-law-software/a/astrea-1/)] |
| Outros citados em buscas, **não levantados** | Codilo, Predictus, Kurier, JusDados, Oystr | | [a confirmar] | |

**Leitura de custo (ilustração, tabela da Judit, faixa R$ 1k/mês, sem desconto):** 1.000 processos monitorados nos tribunais = R$ 1.500/mês (R$ 1,50 cada); os mesmos 1.000 só por DJEN = R$ 1.350/mês. Para uma carteira de 200 processos por advogado, o custo de captura fica em torno de R$ 300/mês por advogado antes de margem. A faixa de entrada já pressupõe consumo de R$ 1 mil/mês [a confirmar se há mínimo contratual].

**Riscos de fornecedor.** Consolidação (Digesto virou Jusbrasil Soluções) e conflito de interesse (o Jusbrasil é concorrente direto em IA jurídica; seus termos proíbem "robôs, bots, automações (...) além de acessos não autorizados via API", cláusula 2.5.2 [lido: [Termos](https://www.jusbrasil.com.br/termos-de-uso)]). Há litígio público entre Jusbrasil e Escavador sobre instruções para IA [busca: [Showmetech](https://www.showmetech.com.br/justica-jusbrasil-instrucoes-ia-escavador/)]. Mitigação: dois fornecedores atrás da mesma interface `processo.*`, como no Subplano 08 para cobrança.

### 1.6 Certidões, OAB, cartórios e demais portas do processo (resumo)

Ver 5. Aqui só o que cruza com processo: o **Cadastro Nacional dos Advogados (CNA)** da OAB **não tem API pública**; o Provimento OAB 95/2000 proíbe fornecer o cadastro a terceiros (consulta individual) e o acesso de tribunais ocorre por acordo de cooperação com o CFOAB [busca: [Provimento 95/2000](https://www.legisweb.com.br/legislacao/?id=94941), [Provimento 227/2024](https://www.oab.org.br/leisnormas/legislacao/provimentos/227-2024?provimentos=True)]. Para validar inscrição do usuário: pedir número e UF e conferir por consulta manual (D-assistido), ou via acordo com o CFOAB [a confirmar].

---

## 2. Legislação

### 2.1 Fontes federais (testadas em 08/11/2026)

| Fonte | O que traz | Formato e acesso | Licença/termos | Uso proposto |
| --- | --- | --- | --- | --- |
| **API Legislação do Senado** (`legis.senado.leg.br/dadosabertos/legislacao/...`) | Lista por tipo/ano/número; **detalhe com publicações, vetos ("vides") e alterações recebidas por dispositivo ("edivs")**: ex. Lei 15.082/2024 altera a Lei 9.478/1997: "Art. 68-G, caput: Acréscimo" | JSON/XML, sem chave [testado] | Dados abertos do Senado: "livre uso (...) exigindo-se, no máximo, citar a proveniência" [lido: [Sobre Dados Abertos](https://www12.senado.leg.br/dados-abertos/sobre)] | Fonte de **eventos normativos** (ficha 3) e de metadados (ficha 1). Nível A |
| **LexML (SRU)** | Metadados e URN de normas, projetos, jurisprudência, doutrina; API padrão SRU | XML por URL [lido: [acervo](https://www12.senado.leg.br/dados-abertos/legislativo/legislacao/acervo-do-portal-lexml)]. Em chamada por script o endpoint devolveu página "Verificação de segurança" do Senado em vez de XML [testado] | Dados abertos Senado | Índice e URN, não texto (o Plano já diz). URN LEX registrada na IANA e RFC 9676 [busca] |
| **normas.leg.br** | Versão vigente em data escolhida | Web; só leis a partir de 2019 (Plano de Ingestão) | [a confirmar] | Conferência |
| **API Câmara v2** (`dadosabertos.camara.leg.br/api/v2/`) | Proposições, votações, deputados, órgãos | JSON, sem chave [testado] | Licença **[a confirmar]** (página de termos não localizada) | Acompanhar PLs (Compliance/IA, Penal, Tributário) |
| **Planalto** (legislação compilada, "texto riscado") | Texto consolidado com redação antiga e norma alteradora | HTML; **sem API**; o host não respondeu do ambiente de pesquisa | Texto de lei: sem direito autoral (Lei 9.610, art. 8º, IV) [lido: [Câmara/LEGIN](https://www2.camara.leg.br/legin/fed/lei/1998/lei-9610-19-fevereiro-1998-365399-normaatualizada-pl.html)] | Conferência e reconstrução de versões antigas (Plano 5.1) |
| **DOU / INLABS** | Diário completo em PDF e XML, grátis desde 2020 | [Plano 5.1]; página de dados abertos do in.gov.br respondeu 200 [testado, não lida] | Livre | Atualização diária (mesmo coletor do contábil) |
| **BCB SGS** (índices) | IPCA, INPC, Selic, TR, IGP-M | JSON, sem chave [testado: séries 433, 188, 4390, 226, 189 e 10764 responderam] | Dados abertos | Ver 5.6 |

### 2.2 Estadual e municipal

- **Estados.** Sem padrão nacional: ALESP publica dados abertos em XML (prevê CSV, JSON, RDF); ALMG tem endpoint de dados abertos; um preprint de 2025 que analisou as 26 assembleias e a CLDF concluiu que LexML e Senado são exceções e que a maioria não tem API [busca: [ALESP](https://al.sp.gov.br/dados-abertos/sobre), [ALMG](https://dadosabertos.almg.gov.br/ws/ajuda/sobre), [preprint SciELO](https://preprints.scielo.org/index.php/scielo/preprint/download/12275/22549/23235)]. Portanto: mesmo roteiro do Plano 5.2 (coleta por UF), priorizando as 5 UFs do contábil.
- **Diários oficiais municipais.** **Querido Diário (Open Knowledge Brasil)**: licenças abertas, API e interface web; último número encontrado: **350 cidades** (2024) [busca: [docs](https://docs.queridodiario.ok.org.br/en/latest/)]; cobertura atual [a confirmar]. Complementa o Plano 5.3 para Administrativo e Imobiliário.
- **Bases comerciais de lei municipal** (LeisMunicipais e semelhantes): licença e custo **não levantados** [a confirmar].
- **Atos normativos administrativos** (CNJ, CFOAB, CJF, Corregedorias): sem API; coleta por página, como "Normas da Receita" no Plano 5.1. Códigos de Normas das corregedorias estaduais pesam em Família/Sucessões e Imobiliário.

### 2.3 Estrutura temporal (vigência, alteração, revogação)

- O **Plano de Ingestão** já resolve o núcleo: URN LexML, 3 datas (publicação, vigência, eficácia) mais data de ingestão, **eventos de alteração** calculados por código determinístico, original imutável e evidência literal (princípios 1 a 6, seções 2 e 3).
- **O que a pesquisa acrescenta:** (a) a API do Senado entrega, por norma, quem alterou o quê **por dispositivo e com tipo** (acréscimo, alteração, revogação, veto), um ponto de partida para os eventos, **a validar contra o texto compilado** porque o mapeamento tem "itens" vazios em parte dos registros [testado]; (b) o ciclo de vida de **precedentes** vem pronto no STJ (situação: trânsito em julgado, cancelada, afetado; tese; referência legislativa e sumular) [testado, 3.1]; (c) eficácia suspensa/modulada por decisão do STF (ADI/ADC/ADPF) exige a ficha 6 do Plano estendida (seção 4.3).
- **Formatos e licenças:** XML/JSON do Senado e da Câmara; PDF/XML do DOU; HTML do Planalto; CSV/JSON/ZIP do STJ (CC-BY). Atribuição é a única obrigação encontrada nos dados abertos; **o texto oficial da lei não tem direito autoral**, mas **compilações/bases de dados podem ter** (Lei 9.610, art. 7º, XIII, e art. 87): cuidado ao reutilizar bases de terceiros (Jusbrasil, editoras) em vez de fonte oficial.

---

## 3. Jurisprudência, súmulas e teses

### 3.1 O que é aberto e o que não é

| Fonte | O que tem | Acesso | Licença | Nível | Verificação |
| --- | --- | --- | --- | --- | --- |
| **STJ, Dados Abertos (CKAN)** | 22 conjuntos. **Íntegras e metadados de decisões terminativas e acórdãos do DJe** 2008 a 2020 e 2021 a out/2026 (soma declarada dos tamanhos: cerca de 20 GB compactados mais 3,3 GB de JSON); **espelhos de acórdãos** por órgão julgador (mensais; ementa tratada com termos e referências); **precedentes qualificados** (`Temas.csv`: 2.410 registros; `Processos.csv`); acervo em tramitação; atas; DataJud | API CKAN `package_search`, download direto | **Creative Commons Atribuição (CC-BY)** na maioria; alguns conjuntos sem licença declarada (pautas, folha) | A | [lido: [portal](https://dadosabertos.web.stj.jus.br/)], [testado: [API](https://dadosabertos.web.stj.jus.br/api/3/action/package_search)] |
| **STJ, precedentes qualificados** | 1.505 Temas repetitivos, 837 Controvérsias, 23 IAC, 11 SIRDR, 27 PUIL. Situação: 1.073 trânsito em julgado, 534 canceladas, 107 afetados, demais em fases. Campos: `teseFirmada`, `questaoSubmetidaAJulgamento`, `referenciaLegislativa`, `referenciaSumular`, `sumulaOriginada`, `numeroRepercussaoGeralSTF`. Por seção: S1 1.322 (público), S2 522 (privado), S3 369 (penal), CE 190 | CSV atualizado em 25/10/2026 | CC-BY | A | [testado, contagens próprias em 08/11/2026] |
| **STF** | Íntegra de acórdãos, monocráticas, súmulas e súmulas vinculantes no portal; **Corte Aberta** (Res. 774/2022) = painéis agregados; **não encontrei dump de texto** | Portal (consulta humana); raspagem é o que a literatura relata | Termos [a confirmar] | C / indisponível | [lido: [Corte Aberta](https://portal.stf.jus.br/hotsites/corteaberta/)]; [busca] |
| **TST** | Portal de jurisprudência para consulta; dados abertos de acórdãos **não encontrados**; consulta ao site de dados abertos devolveu resposta de desafio (202) | Portal | [a confirmar] | C / [a confirmar] | [testado/busca] |
| **TRTs, TRFs, TJs** | Cada um com portal próprio; indício de API de dados abertos no TRT4; TCU tem página de jurisprudência em dados abertos | | [a confirmar] por tribunal | C ou B | [busca] |
| **BNP/Pangea (CNJ)** | Banco Nacional de Precedentes (Res. CNJ 444/2022, padrão Portaria 116/2022); Pangea é pesquisa textual e estatística desenvolvida pelo TRT4 para o CNJ; integração tecnológica prometida aos tribunais; alimentação ainda em ajuste em 2026 | Interface; API para terceiros [a confirmar] | [a confirmar] | A? | [busca: [CNJ](https://www.cnj.jus.br/banco-nacional-vai-permitir-acesso-a-conteudo-de-precedentes-de-todos-os-tribunais/)]; [lido: [docs PDPJ](https://docs.pdpj.jus.br/servicos-negociais/)] |
| **Bases comerciais** (Jusbrasil, Turivius, JusDados, Escavador) | Jurisprudência ampla, jurimetria, IA | Contrato | Jusbrasil proíbe expressamente scraping e uso do conteúdo sem consentimento (cláusula 9.2.1) e **proíbe comercializar o "Conteúdo Gerado"** pelo Jus IA (5.5.1) | B | [lido: Termos Jusbrasil] |

**Restrições de uso para IA/RAG.** O que é dado aberto CC-BY pode alimentar RAG com atribuição. O que vem de portal de tribunal por raspagem fica numa zona sem lei específica (os resultados citam que "ainda não há regulamentação específica para serviços de web scraping") e com termos de cada site, risco de bloqueio (1.4) e, para dados pessoais, a LGPD [busca: [Demarest](https://www.demarest.com.br/wp-content/uploads/2022/01/Web-scraping-legal-ou-ilegal-1.pdf)]. O que vem de base comercial é **contrato**: ler cláusulas de IA/treinamento e de redistribuição antes de assinar (a maior parte nega).

### 3.2 LGPD, sigilo processual e anonimização

- **Dados básicos de processo são públicos** (Res. CNJ 121/2010, art. 2º), com restrições dos §§ 1º e 2º do art. 4º (referidas pela Res. 574/2024) [lido: Res. 574]. Divulgação de **decisões em páginas de jurisprudência** exige cuidado; a prática mais comum nos tribunais é **pseudonimização por iniciais**; debate sobre anonimizar o magistrado (perfilamento) [busca: [CNJ, estudo](https://www.cnj.jus.br/tratamento-dados-pessoais-consulta-jurisprudencia30-11-21)].
- **Segredo de justiça** (CPC, art. 189 [a confirmar]) e **nível de sigilo** no DataJud (`nivelSigilo` [testado]): a plataforma nunca deve indexar processo com sigilo, nem trazer teor via API de fornecedor para base compartilhada entre escritórios.
- **Regra de arquitetura proposta:** (1) **corpus público** (leis, súmulas, temas, acórdãos CC-BY) separado do **corpus do escritório** (peças, contratos, prontuário do cliente), este com isolamento por escritório (DA-01 do Subplano 08), sem uso para treino, retenção definida e exclusão sob pedido; (2) pseudonimizar partes em jurisprudência exibida ao usuário quando a fonte não o fez [a confirmar com DPO]; (3) dados criminais e de menores tratados como sensíveis; (4) o que sair do escritório para o modelo de linguagem passa por política de redação de dados e por contrato de operador.
- **Sigilo profissional e OAB.** Recomendação 001/2024 do CFOAB: formalizar ao cliente, antes do uso, a intenção de usar IA; provimento de IA em elaboração, Plano Nacional de Integração de IA na Advocacia anunciado em 10/06/2026 [lido: [OAB](https://www.oab.org.br/noticia/64268)]; [busca: [Recomendação](https://www.oab.org.br/util/print/62704?print=Noticia)]. A Res. CNJ 615/2025 regula IA **no Judiciário** (não é norma do SaaS, mas é referência de governança) [busca].

---

## 4. Doutrina e modelos

### 4.1 O que é licenciável

| Item | Situação | Pode alimentar a base? |
| --- | --- | --- |
| Leis, decretos, tratados, **decisões judiciais**, atos oficiais | Fora da proteção autoral (Lei 9.610, art. 8º, IV) [lido] | **Sim** (respeitando LGPD e sigilo); a **seleção/ementário editorial** de terceiros pode ter proteção (art. 7º, XIII) |
| Bases de dados | Titular tem direito sobre extração e reutilização (art. 87) [lido] | Só com licença; a base própria vem da fonte oficial |
| Livros, artigos, comentários, revistas | Protegidos. O art. 46 só livra pequenos trechos para uso privado sem lucro e citação para estudo/crítica indicando autor [lido]; **não há exceção de mineração de texto e dados**; não há "fair use" [busca: [Conjur](https://www.conjur.com.br/?p=333548)] | **Não, sem licença.** PL 2338/2023 (marco da IA) continua na Câmara, sem parecer do relator em out/2026 [busca: [Senado](https://www25.senado.leg.br/web/atividade/materias/-/materia/157233), [Barbieri](https://www.barbieriadvogados.com/regulamentacao-inteligencia-artificial-brasil/)] |
| Modelos de peças e contratos de terceiros (Jusbrasil, editoras, escritórios) | Protegidos como obra; Jusbrasil: conteúdo é do Jusbrasil e conteúdo de usuário ao Jusbrasil sob licença ampla (9.2 e 9.4) [lido] | Não sem licença |
| **Modelos próprios** (escritos por advogados contratados pela plataforma) | Titularidade da plataforma por contrato de cessão | **Sim**; é o caminho do MVP |
| Doutrina de editoras (RT, Forense, Saraiva etc.) | **Sem catálogo público de licenciamento para IA**; a busca não retornou acordos nacionais; exemplo estrangeiro (Bloomsbury) apenas em fonte fraca | Negociar caso a caso [a confirmar] |
| Obras de domínio público | Livres | Sim (valor limitado) |

### 4.2 Recomendação sobre modelos

(1) Biblioteca **própria** de modelos por módulo, redigida e revisada por advogados parceiros, com cessão contratual; (2) **cláusulas-padrão** extraídas de lei e de súmulas (atribuição a normas, não a obras); (3) parceria com editora ou associação para um **módulo premium de doutrina** só depois de o MVP provar demanda; (4) nenhuma importação de modelos de plataformas concorrentes (violaria 9.2.1 e 9.4 dos termos do Jusbrasil e a Lei 9.610).

---

## 5. Outras integrações

### 5.1 Cartórios, registro e societário

- **ONR/SAEC (registradores.onr.org.br):** certidões e consulta de matrícula; há "certidão automática" com API ponte entre a plataforma do ONR e os Registros de Imóveis [busca: [IRIB](https://www.irib.org.br/certidao-automatica-do-ri-onr-disponibiliza-manual-para-emissao/)]. **e-Notariado (CNB/CF):** integração com o RI Digital por chave de API e ID de parceiro do tabelião, com compra de créditos [busca: [Manual ONR](https://www.onr.org.br/wp-content/uploads/2025/10/CNBCF-Manual-projeto-e-Not-RI-Digital-2.pdf)]. **Sem API pública para advogado ou SaaS encontrada**; emolumentos variam por UF e por tipo [a confirmar]. Nível proposto: B/D-assistido (agregador de certidões ou pedido pelo portal), como "certidões e consultas por agregador" no Subplano 08.
- **Receita, Redesim e Juntas (societário):** já mapeados para o contábil (D1; Subplano 08, seção de REDESIM e Juntas; Consulta CNPJ SERPRO R$ 0,6591, 0,8683 e 1,1717 por nível, Consulta CPF R$ 0,6591, conforme o Subplano 08, seção 4.1). Reuso integral para o módulo Empresarial. Dados cadastrais por Judit: R$ 0,13 a R$ 0,20 (1.5).
- **Certidões de distribuição, protestos e negativas:** mesmos agregadores do contábil [a confirmar para cada documento].

### 5.2 Diário Oficial

DOU: INLABS (Plano 5.1). Estaduais: DOs de cada UF (coleta por UF, Plano 5.2). Municipais: Querido Diário (2.2). Publicações judiciais: DJEN (1.2), que **substitui os DJEs dos tribunais** [lido, CNJ].

### 5.3 OAB (identificação do advogado)

Sem API; ver 1.6. A OAB também afeta o produto por **publicidade e marketing** (Provimento 205/2021 [a confirmar]), relevante se o SaaS gerar conteúdo de captação.

### 5.4 Assinatura eletrônica e procuração

- **Lei 14.063/2020:** assinatura **simples, avançada e qualificada** (ICP-Brasil). A assinatura do **gov.br é, em regra, avançada**; a lei não veda a avançada em processo judicial, salvo hipótese legal que exija a qualificada, e há acórdão do TJMS que aceitou substabelecimento por gov.br (precedente estadual, não vinculante) [busca: [Lei 14.063](https://legis.senado.leg.br/norma/32811080), [TJMS](https://www.legjur.com/jurisprudencia/eme/117.5840.3408.6482)]. Regra do PJe de cada tribunal [a confirmar].
- **Provedores com API (preços do Subplano 08, seção de assinatura, conferidos em 06/11/2026):** ZapSign Equipe R$ 69,90/mês (20 documentos), Clicksign Start R$ 69, D4Sign Profissional R$ 79,90. Nível B, mesma abstração `assinatura.enviar/status` do Subplano 08. API oficial do gov.br para terceiros: **não encontrada** [a confirmar]. A qualificada nunca com o certificado do advogado no cofre.
- **Uso jurídico:** procuração, contrato de honorários, termo de ciência de uso de IA (Recomendação 001/2024), declaração de hipossuficiência. Para a juntada, o advogado confere o tipo de assinatura aceito pelo tribunal.

### 5.5 Conciliação e mediação

Não encontrei API ou dados abertos úteis (Consumidor.gov.br, plataformas de mediação do CNJ, SIREC): **[a confirmar]**. Tratar como Próprio (cláusula de mediação, Lei 13.140/2015 no módulo Civil) e D-assistido até levantar.

### 5.6 Cálculo judicial: índices, juros e custas

- **Índices (nível A, grátis):** BCB SGS responde para IPCA (433), INPC (188), Selic acumulada no mês (4390), TR (226) e IGP-M (189) [testado em 08/11/2026]; a série 10764 respondeu, mas o que ela mede (IPCA-E?) **[a confirmar]**; **IPCA-E** costuma vir do IBGE (SIDRA) [a confirmar].
- **Regra de juros civis:** Lei 14.905/2024: **taxa legal = Selic deduzida do IPCA, com piso zero**, correção por IPCA; vigência **a partir de 30/08/2024** (conforme acórdão do TRT4); controvérsia sobre aplicação a obrigações anteriores (Tema 1368 do STJ; ADC 58 na Justiça do Trabalho) e crítica doutrinária de que Selic não seria "taxa legal" [busca: [Demarest](https://www.demarest.com.br/o-que-muda-para-a-correcao-monetaria-e-incidencia-de-juros-nas-dividas-civis-com-a-publicacao-da-lei-14-905-2024/)]. **Cada tabela de índice é "tabela normativa" versionada** (ficha 4 do Plano), com **fórmula por período e por justiça** (cível, trabalho, Fazenda Pública, previdenciário) e parecer humano; Resolução CMN 5.171 e orientação do TST [a confirmar].
- **Ferramentas oficiais de cálculo:** o menu do CNJ lista **Calculadora de Prescrição da Pretensão Punitiva** e **da Pretensão Executória** [lido: portal CNJ]; API para terceiros [a confirmar].
- **Custas:** tabela por UF e por justiça (UFESP no TJSP, etc.); **não levantado** [a confirmar]. Entra como tabela normativa estadual.
- **Prazos e calendário forense:** suspensões, feriados locais e indisponibilidades do sistema variam por tribunal; a Legalcloud afirma manter essa tabela diária; **não há fonte aberta consolidada encontrada** [a confirmar]. Construir "calendário forense" como dataset próprio (coleta de atos de cada tribunal) é um diferencial e um risco (prazo fatal): ver recomendações.

---

## 6. Entrega 1 · Tabela de conectores do pacote Jurídico

Nível entre parênteses = nível condicionado/ressalva. "Atividade (proposta)" descreve a capacidade; os IDs do catálogo jurídico não existem ainda.

| # | Conector | Capacidade | Nível | Credencial | Custo | Atividade atendida (proposta) | Ressalvas |
| --- | --- | --- | --- | --- | --- | --- | --- |
| J-01 | **DataJud API Pública** | Metadados de processo, movimentos TPU | **A** (restrito a uso não comercial; via Res. 574 seria A$) | Chave pública (rotativa) | Grátis; via Res. 574: custo efetivo [a confirmar] | Validar número, classe, assunto, "última movimentação", jurimetria | Termos 3.3 e 3.8; sem partes nem teor; limites sem aviso |
| J-02 | **DJEN (comunicaapi)** | Publicações e intimações de advogados e processos | **A** [a confirmar contrato] | [a confirmar] (consulta pública sem login em `comunica.pje.jus.br`) | Grátis aparente; [a confirmar] | Intimações, abertura de prazo, calendário | Geobloqueio fora do Brasil; limites desconhecidos |
| J-03 | **Domicílio Judicial Eletrônico** | Citações e intimações pessoais a CNPJ/CPF; ciência | **A** | Credencial de integração do CNPJ; login por certificado (PJeOffice) ou gov.br; advogado via "Meus Representados" | Grátis | Citação a cliente PJ, ciência, cadastro do CNPJ | Ciência = ato irreversível (regra C7) |
| J-04 | **Jus.br / PDPJ-Br** | Consulta e peticionamento | **D-assistido** (sem API de terceiros encontrada) | SSO PDPJ (gov.br ouro + 2FA) ou certificado A3 | Grátis | Peticionar com humano; consulta de autos | Robô com credencial do advogado: bloqueio |
| J-05 | **MNI / Escritório Digital** | Intimações e consulta pelo padrão do CNJ | **A** condicionado a termo por tribunal [a confirmar] | Termo de adesão do tribunal; certificado | [a confirmar] | Captura de intimações sem agregador | Sem documentação pública consolidada |
| J-06 | **Portais de consulta (PJe, e-SAJ, eproc, Projudi)** | Capa e movimentos por número CNJ | **C-captcha / C-cert** | Nenhuma ou certificado | Grátis | (evitar) | CAPTCHA, bloqueio por volume (TRT4: 1.500/30 dias para terceiros) |
| J-07 | **Judit API** | Consulta, monitoramento, DJEN, autos, mandados | **B** | Chave; contrato anual ou pré-pago | **Tabela pública** (1.5): ex. R$ 1,50 por processo/mês | Acompanhar andamento, publicações, nova ação | Mínimo de faixa R$ 1k/mês [a confirmar] |
| J-08 | **Escavador Business API** | Consulta, monitoramento, callbacks, diários | **B** | Token PAT; créditos | **Sob consulta**; custo por chamada no header | Idem; certificados custodiados no fornecedor | Limite por contrato; custódia de certificado |
| J-09 | **Jusbrasil Soluções (Digesto)** | Monitoramento, base ampla | **B** | Contrato | **Sob proposta** | Idem; due diligence | Termos proíbem terceiros; concorrente |
| J-10 | **Calendário/prazos (Legalcloud ou próprio)** | Contagem de prazo com suspensões | **B** ou **Próprio** | Conta | [a confirmar] | Prazos CPC/CPP/CLT/JEC, tempestividade | Responsabilidade por erro |
| J-11 | **API Legislação Senado** | Normas, vetos, alterações por dispositivo | **A** | Nenhuma | Grátis (citar fonte) | Base temporal de leis | Mapeamento de itens a validar |
| J-12 | **LexML SRU** | URN e metadados | **A** (instável por script) | Nenhuma | Grátis | Resolver URN | Página de segurança em acesso por script |
| J-13 | **API Câmara v2** | Proposições e votações | **A** | Nenhuma | Grátis | Acompanhar PLs | Licença [a confirmar] |
| J-14 | **Planalto** | Texto compilado | **C/F** (HTML) | Nenhuma | Grátis | Conferência e versões antigas | Sem API; host barrado no ambiente |
| J-15 | **DOU (INLABS)** | Atos do dia | **A** | Cadastro (Plano) | Grátis | Atualização diária | Idem contábil |
| J-16 | **Querido Diário** | DOs municipais | **A** | Nenhuma | Grátis | Normas municipais | Cobertura ~350 cidades (2024) |
| J-17 | **ALESP, ALMG e outras assembleias** | Leis estaduais | **A/F** parcial | Nenhuma | Grátis | Legislação estadual | Sem padrão; por UF |
| J-18 | **STJ Dados Abertos (CKAN)** | Íntegras, espelhos, precedentes | **A** | Nenhuma | Grátis, CC-BY | Jurisprudência, repetitivos, teses | Atribuição obrigatória |
| J-19 | **BNP/Pangea (CNJ)** | Precedentes qualificados de todos os tribunais | **A?** [a confirmar] | [a confirmar] | [a confirmar] | Temas e IRDR/IAC | API não documentada para terceiros |
| J-20 | **STF (portal) e TST (portal)** | Acórdãos, súmulas, OJ | **C** ou fornecedor B | Nenhuma | Grátis / contrato | Súmulas vinculantes, repercussão geral, súmulas e OJ do TST | Sem dump; termos [a confirmar] |
| J-21 | **BCB SGS / IBGE** | Índices | **A** | Nenhuma | Grátis | Atualização monetária, juros | Fórmula por justiça é regra, não dado |
| J-22 | **OAB (CNA)** | Inscrição | **D-assistido** | n/a | Grátis individual | Validar advogado | Sem API; Provimento 95/2000 |
| J-23 | **ONR/SAEC e e-Notariado** | Certidões e matrícula | **B / D-assistido** | Conta no ONR; parceiro | Emolumento por UF [a confirmar] | Certidões imobiliárias, escrituras | Sem API para advogado |
| J-24 | **SERPRO Consulta CNPJ/CPF; Redesim; Juntas** | Cadastro de pessoas | **A$ / B** (reuso do contábil) | Contrato SERPRO | CNPJ R$ 0,6591 a R$ 1,1717; CPF R$ 0,6591 (Subplano 08) | Qualificação de partes, societário | Reuso |
| J-25 | **Assinatura (ZapSign, Clicksign, D4Sign; gov.br)** | Assinatura avançada/qualificada | **B** (gov.br API [a confirmar]) | Token | R$ 69,90 / R$ 69 / R$ 79,90 por mês (pisos, 06/11/2026) | Procuração, honorários, termos | Aceite por tribunal |
| J-26 | **Certificado ICP-Brasil (OAB)** | Login e assinatura qualificada no PJe | n/a (credencial humana) | A3 token ou nuvem | Nuvem R$ 49/ano e A3 R$ 199 a R$ 229 em OAB/SP [a confirmar] | Peticionar com PJeOffice | Plataforma não guarda |
| J-27 | **Mediação e Consumidor.gov** | — | **[a confirmar]** | — | — | Mediação, conciliação | Não levantado |

---

## 7. Entrega 2 · Taxonomia de módulos da base de leis

### 7.1 Princípio de camadas

Cada módulo = **L0** normas + **L1** enunciados/teses/vinculantes (juntos, o "núcleo vendido") + **L2** jurisprudência ampla (complemento, depende de licença) + **L3** doutrina e modelos (complemento, licenciado) + **L4** tabelas (índices, custas, prazos, convenções coletivas) + **L5** território (estadual e municipal). L0, L1 e L4 saem de fontes oficiais. L2 e L3 são onde mora o custo e o risco de licença.

**Núcleo comum (incluído em todo pacote, não vendido sozinho):** CF/88 e emendas, LINDB, Estatuto da Advocacia e Código de Ética (Lei 8.906/1994 e Código de Ética [a confirmar texto vigente]), regras processuais comuns usadas por **prazos** (CPC, CPP, CLT processual, Lei 9.099), **súmulas vinculantes** e temas de repercussão geral, **calendário forense** e **tabela de índices**. Razão: sem prazos e Constituição, nenhum módulo responde com segurança.

Volumes abaixo são **ordens de grandeza de conhecimento geral** (contagem de artigos conhecidos; "10³" = milhares de dispositivos), a **confirmar na ingestão**. Quando há dado medido nesta pesquisa, está marcado [testado].

### 7.2 Os módulos

**M1 · Constitucional e Fundamentos (núcleo, incluído)**
- *Corpus mínimo:* CF/88 (cerca de 250 artigos mais ADCT) e emendas; LINDB; súmulas vinculantes e súmulas do STF; temas de repercussão geral; decisões de controle concentrado que suspendem ou modulam norma (ADI, ADC, ADPF).
- *Volume:* 10³ dispositivos de norma; dezenas de súmulas vinculantes e centenas de súmulas do STF (muitas canceladas); temas de RG da ordem de 10³ [a confirmar].
- *Aberto × comercial:* aberto (Senado, Planalto, portal STF para súmulas); comercial só para ampla jurisprudência constitucional.
- *Cadência:* emendas e decisões do Plenário: semanal a mensal.
- *Complexidade de curadoria:* **média** (poucas normas, alto impacto; a parte difícil é a eficácia por decisão do STF).
- *Vendável separado?* Não como produto principal; add-on "Controle de constitucionalidade e precedentes do STF" para constitucionalistas e advocacia pública.

**M2 · Civil e Processual Civil**
- *Corpus mínimo:* CC (2.046 artigos), CPC (1.072), LINDB, Lei 9.099 (JEC), Lei 9.307 (arbitragem), Lei 13.140 (mediação), Lei 8.429 (improbidade, vide M9), regimentos internos e atos dos tribunais com efeito processual; súmulas do STJ de matéria cível; **temas repetitivos, IAC e IRDR** cíveis; tabelas de custas e de prazos.
- *Volume:* 10⁴ dispositivos; temas cíveis do STJ: parte dos 2.410 registros (S2 = 522 registros no arquivo medido [testado]); 10² a 10³ enunciados.
- *Aberto × comercial:* L0/L1 aberto; L2 (acórdãos de TJs) comercial ou raspagem; STJ aberto (CC-BY).
- *Cadência:* leis esparsas (mensal); jurisprudência semanal; tribunais alteram regimentos com frequência.
- *Complexidade:* **alta** (maior volume; interações CPC e leis especiais; custas e prazos por UF).
- *Vendável separado:* sim, é o maior mercado (contencioso cível e empresarial) e base de prazos.

**M3 · Trabalhista e Previdenciário** (dois sub-módulos vendidos juntos por padrão, separáveis)
- *Corpus mínimo:* CLT (922 artigos), Lei 13.467/2017 (reforma), terceirização, Lei 8.213 e 8.212, Decreto 3.048, EC 103/2019 (regras de transição), normas do INSS e do MTE; súmulas, OJs e precedentes normativos do TST; temas do TST e do STF; Súmulas da TNU; **convenções e acordos coletivos** (Plano 5.4 já prevê); índices trabalhistas (ADC 58).
- *Volume:* 10³ a 10⁴ dispositivos; enunciados do TST da ordem de 10³ (súmulas, OJs, PNs) [a confirmar]; CCT/ACT 10³ a 10⁴ por ano (**gargalo real**).
- *Aberto × comercial:* normas abertas; TST e TRTs sem dump (indício de API do TRT4); CCT/ACT via Mediador (MTE) já planejado; jurimetria comercial (Turivius).
- *Cadência:* semanal (TST); CCT/ACT sazonal por data-base.
- *Complexidade:* **alta** (vigência por data do contrato e da reforma; intertemporalidade; cálculos).
- *Vendável separado:* **sim, e é o primeiro**: sinergia máxima com o DP do contábil (a base de CLT, CCT e eSocial serve às duas ofertas) e público grande (advocacia trabalhista de empregado e de empresa, departamentos de RH e DP). Previdenciário vende separado à advocacia previdenciária (nicho grande e específico).

**M4 · Penal e Processual Penal**
- *Corpus mínimo:* CP (361 artigos), CPP (811), LEP (Lei 7.210), Lei 11.343 (drogas), Lei 11.340 (Maria da Penha), Lei 9.099 (parte penal), Lei 12.850, pacote anticrime (Lei 13.964/2019) e alterações; súmulas do STF/STJ penais; temas repetitivos penais (S3 = 369 registros no arquivo medido [testado]); calculadoras de prescrição do CNJ; tabelas de dosimetria e progressão.
- *Volume:* 10³ a 10⁴ dispositivos; enunciados penais 10²; temas penais do STJ 10².
- *Aberto × comercial:* aberto (STJ CC-BY); STF por raspagem ou fornecedor.
- *Cadência:* leis penais alteradas com frequência e pressão política; HCs e teses em fluxo contínuo.
- *Complexidade:* **muito alta** (**lei penal no tempo**: tempus regit actum e retroatividade da lei mais benéfica exigem texto da lei **na data do fato** e comparação; matriz de pena; dados criminais são sensíveis).
- *Vendável separado:* sim (advocacia criminal e defensoria), mas depende de ter a camada temporal sólida e de política de dados sensíveis.

**M5 · Família e Sucessões**
- *Corpus mínimo:* CC Livros IV e V, procedimentos do CPC (inventário, divórcio, alimentos, guarda), Lei 5.478 (alimentos), Lei 11.441 (extrajudicial), Lei 12.318 (alienação parental), Lei 13.058 (guarda compartilhada), Lei 6.015 (registros civis), ECA, provimentos e Código Nacional de Normas do foro extrajudicial do CNJ [a confirmar números]; súmulas do STJ de família; tema do STF sobre sucessão de companheiro (RE 878.694) [a confirmar número do tema]; **ITCMD estadual** (27 leis).
- *Volume:* 10³ dispositivos nacionais; ITCMD 27 normas estaduais; enunciados 10².
- *Aberto × comercial:* aberto; doutrina é central na área (L3 comercial); jurisprudência em segredo de justiça é grande parte do universo (**não disponível**).
- *Cadência:* leis esparsas; provimentos do CNJ frequentes.
- *Complexidade:* **média-alta** (a lei aplicável é a da **abertura da sucessão** e do fato; muitos provimentos estaduais; casos em segredo de justiça).
- *Vendável separado:* sim (escritórios de pequeno porte, planejamento sucessório, tabelionatos); acopla com cartórios (5.1) e com o ITCMD do contábil (planejamento patrimonial).

**M6 · Consumidor**
- *Corpus mínimo:* CDC (119 artigos), Decreto 2.181 e SAC (Decreto 11.034/2022), Lei 14.181 (superendividamento), regras de saúde e telecom que tocam consumo [a confirmar]; súmulas do STJ de consumo; temas repetitivos.
- *Volume:* 10³ dispositivos; poucas dezenas de súmulas.
- *Aberto × comercial:* aberto; Consumidor.gov.br [a confirmar].
- *Cadência:* baixa para lei; média para jurisprudência.
- *Complexidade:* **baixa a média**.
- *Vendável separado:* sim, como pacote de entrada barato (escritórios de massa, Procon, departamentos jurídicos de varejo).

**M7 · Tributário** (reuso do contábil)
- *Corpus mínimo:* CTN (218 artigos), Lei 6.830 (execução fiscal), Decreto 70.235 (PAF), LC 116, reforma tributária (EC 132, LC 214) e leis estaduais e municipais do Plano; **adições jurídicas:** súmulas e temas do STF/STJ tributários (S1), súmulas e acórdãos do CARF.
- *Volume:* já ingerido no contábil; adição de 10² a 10³ precedentes.
- *Aberto × comercial:* aberto (STJ CC-BY, CARF coleta).
- *Cadência:* diária (federal), mensal (estados e municípios).
- *Complexidade:* **alta**, mas **custo marginal baixo** (a base já existe).
- *Vendável separado:* **sim, como upgrade barato** para quem já é cliente do contábil e para advocacia tributária.

**M8 · Empresarial e Societário** (reuso parcial)
- *Corpus mínimo:* CC Livro II, Lei 6.404, LC 123, Lei 11.101 (recuperação e falência), Lei 13.874 (liberdade econômica), Lei 14.195, Lei 14.711 (marco das garantias), instruções do DREI, normas de Juntas (Plano 5.4); súmulas e temas do STJ de direito empresarial; resoluções CVM [a confirmar].
- *Volume:* 10³ a 10⁴ dispositivos.
- *Aberto × comercial:* aberto; modelos de contrato social e acordo de sócios (L3) próprios.
- *Cadência:* média.
- *Complexidade:* **média**; sinergia com D1 (clientes/societário) do contábil.
- *Vendável separado:* sim (assessoria empresarial, startups).

**M9 · Administrativo e Licitações**
- *Corpus mínimo:* Lei 14.133/2021 (194 artigos) e regulamentos, Lei 9.784, Lei 8.429 com a Lei 14.230, LAI, normas dos entes; **jurisprudência do TCU** (dados abertos) e dos tribunais superiores; **estadual e municipal** (compras, servidores, posturas).
- *Volume:* 10³ a 10⁴ por ente; multiplicador forte por município.
- *Aberto × comercial:* aberto (TCU e dados abertos; Querido Diário); estaduais e municipais heterogêneos.
- *Cadência:* alta (regulamentos e acórdãos do TCU).
- *Complexidade:* **alta** (território e volume).
- *Vendável separado:* sim (B2G, procuradorias, licitações); aproveita o terceiro setor (B8).

**M10 · Imobiliário e Urbanístico**
- *Corpus mínimo:* Lei 8.245 (locações), Lei 6.015 (registros públicos), Lei 13.465 (Reurb), Lei 4.591 e 13.786 (incorporação e distrato), Lei 10.931, CC Livro III (direitos reais); **Códigos de Normas das Corregedorias** e provimentos do CNJ; plano diretor, ITBI e IPTU municipais; súmulas do STJ.
- *Volume:* 10³ a 10⁴ nacionais; normas estaduais e municipais em quantidade.
- *Aberto × comercial:* aberto; certidões por ONR (B).
- *Cadência:* média; norma local muda sem aviso.
- *Complexidade:* **alta** (dispersão territorial).
- *Vendável separado:* sim (imobiliárias, construtoras, tabelionatos, advocacia imobiliária).

**M11 · Compliance, LGPD e Digital**
- *Corpus mínimo:* Lei 13.709 (LGPD, 65 artigos), resoluções e guias da ANPD, Marco Civil (Lei 12.965), Lei 12.846 e Decreto 11.129, Lei 9.613 (lavagem), normas setoriais [a confirmar]; PL 2338 (acompanhar, não vigente).
- *Volume:* 10² a 10³ dispositivos; baixo.
- *Aberto × comercial:* aberto.
- *Cadência:* média (ANPD e PLs).
- *Complexidade:* **baixa a média** (volume pequeno, interpretação pesa).
- *Vendável separado:* sim; é o mais fácil de entregar e vende também ao contábil e ao BPO (as empresas precisam de LGPD).

**Backlog sob demanda:** Eleitoral, Ambiental, Agrário, Saúde e Planos, Propriedade Intelectual, Militar, Internacional.

### 7.3 Matriz de decisão (resumo)

| Módulo | Complexidade | Cadência | Sinergia com contábil | Custo marginal | Ordem sugerida |
| --- | --- | --- | --- | --- | --- |
| Núcleo (Constitucional, prazos, índices) | Média | Semanal | Alta (Redesim, índices) | Baixo | 0 |
| M3 Trabalhista e Previdenciário | Alta | Semanal | **Muito alta** (DP, CCT) | Médio | 1 |
| M5 Família e Sucessões | Média-alta | Mensal | Média (ITCMD, patrimônio) | Médio | 2 |
| M2 Civil e Processual Civil | Alta | Semanal | Baixa | Alto | 3 |
| M11 Compliance e LGPD | Baixa-média | Mensal | Média | Baixo | 3 (em paralelo) |
| M7 Tributário | Alta | Diária | **Total** (reuso) | **Muito baixo** | 4 |
| M8 Empresarial | Média | Mensal | Alta | Baixo | 4 |
| M4 Penal e Processual Penal | Muito alta | Semanal | Nenhuma | Alto | 5 |
| M6 Consumidor | Baixa-média | Mensal | Baixa | Baixo | 5 |
| M9 Administrativo | Alta | Semanal | Média (terceiro setor) | Alto | 6 |
| M10 Imobiliário | Alta | Mensal | Média (cartórios) | Alto | 6 |

### 7.4 Comparação com a base temporal do assistente contábil

| Dimensão | Contábil (Plano de Ingestão) | Jurídico (implicação) |
| --- | --- | --- |
| Janela histórica | **10 anos** (cobre decadência de 5 anos) | **Desde a origem** do diploma central (CP 1940, CLT 1943, CF 1988, CC 2002 e, para sucessões antigas, CC 1916 [a confirmar]): lei no tempo (tempus regit actum, lei penal mais benéfica, lei vigente à abertura da sucessão, regras de transição da EC 103/2019). "Janela de 10 anos" não serve |
| Unidade | Norma, dispositivo-versão, evento, tabela, diretriz | **Reusar fichas 1 a 4**. Acrescentar ficha de **Precedente/Súmula** com ciclo de vida (afetado, julgado, trânsito em julgado, cancelado, superado, modulado), tese, órgão, vínculos a dispositivos e a outras súmulas (o CSV do STJ já traz `referenciaLegislativa`, `referenciaSumular`, `situacao` [testado]) |
| Eventos | Alteração normativa extraída por IA e aplicada por código | Idem, **mais** eventos de **eficácia por decisão judicial** (ADI/ADC, modulação); a ficha 6 do Plano ("decisões que afetam vigência ou eficácia") passa de periférica a central |
| Fonte primária | DOU, Planalto, LexML, Receita, CONFAZ, CARF | Mesma base federal **mais** API do Senado (alterações por dispositivo), **STJ CKAN**, BNP, DJEN, TCU |
| Território | 5 UFs mais capitais e municípios dos clientes | Estadual para custas, códigos de normas das corregedorias, ITCMD e regimentos; municipal só em Administrativo e Imobiliário |
| Tabelas | Alíquotas, Simples, listas de serviços | **Índices e juros por justiça**, **custas por UF**, **calendário forense**, **convenções coletivas** |
| Validação humana | Contadores do grupo | **Advogados revisores** (responsabilidade e Estatuto da OAB); amostragem por módulo; risco de erro mais caro (prazo fatal) |
| Dados sensíveis | Fiscais e trabalhistas do cliente | **Sigilo profissional, segredo de justiça, dados criminais e de família**: isolamento por escritório e separação de corpus público e privado (3.2) |
| Autoral | Quase nulo (texto oficial) | **Doutrina e modelos**: licenciamento (seção 4) |
| Cadência | Diária (federal) a mensal | Diária (DJEN/DOU) a mensal; jurisprudência vinculante semanal |

---

## 8. Entrega 3 · Riscos de licenciamento e de sigilo

| # | Risco | Severidade | Origem | Mitigação |
| --- | --- | --- | --- | --- |
| R1 | **DataJud: termo veda uso comercial e exploração de informação derivada** (3.3, 3.8); CNJ pode revogar acesso sem aviso | Alta | [lido] | Tratativa formal pela Res. 574/2024; entre tanto usar DataJud só como validação interna e priorizar DJEN, Domicílio e fornecedor B; parecer jurídico |
| R2 | **Bloqueio de credencial** por consumo "abusivo" (Res. 185/2013 art. 29; Res. 574 art. 3º; TRT4 1.500/30 dias) | Alta | [busca], [lido] | Nada de robô em escala; agregador B; D-assistido; limites de taxa por escritório |
| R3 | **Geobloqueio** do DJEN fora do Brasil | Média | [testado] | Hospedar coletor no Brasil; testar a partir de IP brasileiro; falha silenciosa vira alerta |
| R4 | **Termos de bases comerciais** (Jusbrasil: sem bots, sem scraping, sem comercializar conteúdo gerado) e litígio entre concorrentes | Alta | [lido] | Não raspar plataformas; contrato B com cláusula de uso por IA e redistribuição |
| R5 | **Sigilo profissional do advogado** (inserir fatos de cliente em IA); OAB Rec. 001/2024 exige informar o cliente | Alta | [lido] | Modelo de dados com isolamento por escritório; sem treino; modelo de termo de ciência de IA ao cliente; contrato de operador (LGPD); redação de dados |
| R6 | **LGPD em dados processuais**: partes, menores, saúde, criminal | Alta | [busca] | Pseudonimização, base legal documentada, DPO, política de retenção; excluir segredo de justiça |
| R7 | **Segredo de justiça e `nivelSigilo`** | Alta | [testado] | Descartar sigilo na ingestão; nunca indexar sigiloso em corpus compartilhado |
| R8 | **Direito autoral de doutrina e modelos**; sem exceção de mineração de texto; PL 2338 indefinido | Alta | [lido], [busca] | Só conteúdo próprio ou licenciado; revisão do PL a cada trimestre |
| R9 | **Direito sobre bases de dados** (art. 87) ao reutilizar compilações de terceiros | Média | [lido] | Reconstruir a partir de fonte oficial |
| R10 | **CNA/OAB**: vedação de fornecer cadastro a terceiros | Média | [busca] | Sem replicar; consulta individual ou acordo com o CFOAB |
| R11 | **Custódia de certificado digital** (Escavador guarda certificados; OAB emite A3) | Alta | [lido] | Plataforma não guarda certificado de advogado; assinatura no cliente (PJeOffice, nuvem OAB) |
| R12 | **Erro de prazo** (suspensões, feriado local, indisponibilidade) | Alta | [busca] | Calculadora com fonte do ato, aviso de revisão humana, log de versão da regra, seguro de RC [a confirmar] |
| R13 | **Mudança de regra do CNJ** (Res. 574/Portaria 316, geobloqueio, chave trocada, login via PDPJ) | Média | [lido] | Conector com `risco_mudanca` como no Subplano 08; versão da API no evento |
| R14 | **Dependência de fornecedor** (Digesto absorvida; Judit mínimo de faixa) | Média | [lido] | Dois fornecedores atrás de `processo.*`; saída por dado local |
| R15 | **Interpretação de índices** (Selic, "taxa legal", ADC 58): resposta errada com aparência de certa | Alta | [busca] | Tabela versionada com fórmula e fonte; parecer humano por justiça; mostrar premissas |
| R16 | **Regulação da IA na advocacia** ainda em curso (provimento da OAB; PL 2338) | Média | [lido], [busca] | Governança por módulo, trilha de auditoria, "humano no circuito" |
| R17 | Atribuição de **CC-BY** esquecida (STJ) | Baixa | [testado] | Metadado `licenca` e `atribuicao` em cada documento ingerido |

---

## 9. Entrega 4 · Oito recomendações de ordem de construção

1. **Reaproveitar o núcleo temporal e estendê-lo (semana 0 a 6).** Fichas 1 a 4 do Plano de Ingestão como estão; criar a ficha de **Precedente/Súmula** com ciclo de vida e a tabela de **calendário forense**; ingerir o **Núcleo** (CF, LINDB, CPC/CPP/CLT processual, súmulas vinculantes, índices). Usar a API de legislação do Senado como fonte de eventos por dispositivo e o texto compilado como conferência.
2. **Abrir as tratativas formais cedo, porque têm prazo de terceiros.** CNJ (Res. 574/2024: DataJud comercial, custo, contrapartida; DJEN: condições e limites), tribunais mais relevantes para termo MNI, CFOAB (CNA e provimento de IA). Dependem de resposta, não de código.
3. **Conectores de captura de intimações primeiro: DJEN e Domicílio (nível A), hospedados no Brasil**, com a regra "listar nunca dá ciência". Em paralelo, **um agregador B (Judit, com tabela pública) para andamentos por número CNJ e monitoramento**, atrás da interface `processo.*`; segundo fornecedor depois. Nada de robô com credencial do advogado.
4. **Primeiro módulo de base: Trabalhista e Previdenciário (M3)**, pela sinergia com o DP do contábil (CLT, CCT, eSocial) e por ter mercado grande; levar junto **STJ aberto (CC-BY)** como primeira camada L2 e a **tabela de índices trabalhistas** (ADC 58, Lei 14.905) com parecer humano. TST e TRTs só depois de parecer sobre coleta.
5. **Segundo e terceiro: Família e Sucessões (M5) e Compliance/LGPD (M11)**, que são compactos, têm lei aberta e vendem a públicos diferentes; M5 inclui ITCMD e a lei do tempo da abertura da sucessão (testa a camada temporal "desde a origem").
6. **Civil e Processual Civil (M2) em seguida**, quando o motor de prazos e as custas por UF já existirem; **Tributário (M7) e Empresarial (M8) como upgrades de reuso**, com custo marginal baixo.
7. **Penal (M4) só depois** de a camada de lei no tempo estar provada e de existir política para dados sensíveis e criminais. Administrativo (M9) e Imobiliário (M10) por último, junto com Querido Diário, ONR e normas estaduais.
8. **Peticionamento, assinatura e doutrina por último e sem atalho:** peticionamento **D-assistido** (a plataforma prepara a peça e o advogado protocola no PJe), assinatura por provedor B (aceite por tribunal), **modelos próprios** antes de qualquer licença de editora. Em todas as etapas, antes de qualquer piloto com dados de cliente: **parecer jurídico** sobre sigilo, LGPD, termos de uso de cada fonte e a Recomendação 001/2024 da OAB.

---

## 10. Perguntas abertas (verificar antes de decidir)

1. DJEN: condições de uso, limites, necessidade de credencial e cobrança da `comunicaapi` (Swagger inacessível do ambiente). Existe SLA?
2. DataJud comercial: instrumento, preço e contrapartida da Res. 574/Portaria 316; prazo de resposta do CNJ.
3. Domicílio: passo a passo da credencial da API e se o advogado com procuração pode consumir via API ou só via "Meus Representados".
4. MNI: quais tribunais aceitam adesão de sistemas privados e em qual versão (2.2.x ou 3.0).
5. Preço da API do Escavador, da Jusbrasil Soluções, do Legalcloud, do Turivius e do mínimo de faixa da Judit.
6. STF e TST: existe bulk de acórdãos ou API oficial? Termos de uso de cada portal para coleta.
7. Série 10764 do BCB (IPCA-E?) e fonte oficial de IPCA-E; fórmula por justiça (Resolução CMN 5.171; orientação do TST).
8. OAB: texto atual do provimento de IA (se publicado), Provimento 205/2021 sobre marketing e acordo para CNA.
9. Aceite de assinatura avançada (gov.br e provedores) por tribunal; API oficial do gov.br.
10. Mediação e conciliação: fontes oficiais e APIs (Consumidor.gov, plataformas do CNJ).
11. Tabelas de custas por UF e calendário forense por tribunal (fontes e atualização).
12. Cobertura atual do Querido Diário e licença de bases comerciais de lei municipal.

---

## Fontes consultadas (acesso em 08/11/2026)

Lidas e/ou testadas: [DataJud, Acesso](https://datajud-wiki.cnj.jus.br/api-publica/acesso), [Endpoints](https://datajud-wiki.cnj.jus.br/api-publica/endpoints), [Termo de Uso](https://datajud-wiki.cnj.jus.br/api-publica/termo-uso); [CNJ, Comunicações Processuais](https://www.cnj.jus.br/programas-e-acoes/processo-judicial-eletronico-pje/comunicacoes-processuais/); [docs PDPJ-Br, Serviços Negociais](https://docs.pdpj.jus.br/servicos-negociais/) e [Domicílio Judicial Eletrônico](https://docs.pdpj.jus.br/servicos-negociais/domicilio-judicial-eletronico/); [Res. CNJ 574/2024](https://atos.cnj.jus.br/files/original1542412024083066d1e8710296b.pdf); [Judit, preços](https://judit.io/precos); [Escavador, docs v2](https://api.escavador.com/v2/docs/); [Jusbrasil, Termos de Uso](https://www.jusbrasil.com.br/termos-de-uso); [Digesto/Jusbrasil Soluções](https://www.digesto.com.br/); [Legalcloud](https://www.legalcloud.com.br/); [Turivius](https://turivius.com/); [Senado, API de legislação](https://legis.senado.leg.br/dadosabertos/legislacao/lista?tipo=LEI&ano=2024) e [Sobre Dados Abertos](https://www12.senado.leg.br/dados-abertos/sobre); [Acervo LexML](https://www12.senado.leg.br/dados-abertos/legislativo/legislacao/acervo-do-portal-lexml); [API Câmara](https://dadosabertos.camara.leg.br/api/v2/proposicoes?itens=1); [STJ Dados Abertos](https://dadosabertos.web.stj.jus.br/); [STF Corte Aberta](https://portal.stf.jus.br/hotsites/corteaberta/); [Lei 9.610 (LEGIN/Câmara)](https://www2.camara.leg.br/legin/fed/lei/1998/lei-9610-19-fevereiro-1998-365399-normaatualizada-pl.html); [OAB, Plano Nacional de IA](https://www.oab.org.br/noticia/64268); [BCB SGS](https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados/ultimos/1?formato=json).

Só por busca (indício): as demais URLs citadas nas seções, em especial TRT2, TRT4, TRT11, TRT12, TJPB, TJSP, ONR, CNB/CF, IRIB, Migalhas, Demarest, Barbieri, Legal Technology Hub, GetApp, Showmetech, Querido Diário, ALESP, ALMG.

Documentos internos usados: [Subplano 08 · Conectores](../../planos/subplanos/08-Conectores.md); [Plano de Ingestão da Base Legal](../../planos/Plano_de_Ingestao_da_Base_Legal.md); [90-consolidado](../plataforma/90-consolidado.md).

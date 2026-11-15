# B8 · Terceiro setor: o que o escritório faz para igrejas, ONGs, associações, fundações, OSCIP e OS

6 de novembro de 2026 · pesquisa de nicho (fase 5) seguindo o [Protocolo de Descoberta](00-protocolo-de-descoberta.md) · contexto: [Plano da Plataforma do Escritório](../../planos/Plano_Plataforma_do_Escritorio.md)

**Escopo:** imunidade e isenção (CF art. 150 VI b e c, art. 195 §7º, CTN art. 14, Lei 9.532/1997 arts. 12 a 15), requisitos para mantê-las, CEBAS (LC 187/2021), obrigações acessórias (ECD, ECF, EFD-Reinf, DCTFWeb, eSocial), contabilidade pela ITG 2002 (R1), voluntariado e gratuidades, prestação de contas de parcerias (Lei 13.019/2014, MROSC) e de contratos de gestão de OS, prestação de contas a associados e ao Ministério Público, imunidades municipais e estaduais (IPTU de templos, ISS, ITCMD), doações e recibos, prebenda de ministros religiosos e efeito da LC 214/2025.

## Como ler este arquivo

- **27 fichas** (`TS-001` a `TS-027`), setor "Terceiro setor". Todas na **fase 5 (Nichos e expansão)**: formam um pacote que liga quando a natureza jurídica do cliente é do grupo 3 (entidades sem fins lucrativos) ou o CNAE é de entidade religiosa, associativa ou assistencial. As dependências apontam para fichas das fases 0 a 4 (cadastro, certidões, calendário, extratos, ECD/ECF, folha), que precisam funcionar antes.
- **Inventário conferido** (`indice.txt`, 466 fichas): não havia nenhuma ficha de terceiro setor, imunidade, CEBAS, ITG 2002, MROSC ou prebenda. As fichas genéricas que este pacote reaproveita (ECD CTB-041, ECF CTB-042, DCTFWeb FIS-019, EFD-Reinf FIS-020, certidões FIS-036, atas SOC-041) aparecem em `depende_de`, sem duplicar.
- **horas_100:** estimativa para um escritório generalista com 100 clientes, dos quais cerca de **10 são entidades do terceiro setor**. Para um escritório especializado (100 entidades), multiplicar por 10. Nenhuma fonte trouxe medição de tempo; todos os valores são `[ESTIMATIVA]`. Soma do pacote: cerca de 45 h/mês para 10 entidades.
- **Confiança "alta"** só onde li o texto oficial nesta data: Lei 13.019/2014 compilada (Câmara), LC 187/2021 (Câmara), Lei 10.170/2000 (Senado), página do CEBAS no MDS, notícia oficial do Senado sobre a EC 116/2022, P&R da RFB sobre PIS sobre a folha (arquivo de 2018) e notícia do CFC sobre a ITG 2002 (R1). A Lei 9.532/1997 foi lida numa cópia da publicação original (ABMES), sem as alterações posteriores (ex.: remuneração de dirigentes, mudada depois de 1997), por isso as fichas que dependem só dela ficam em "média" quando o ponto pode ter mudado.
- **Limite de método:** `www.planalto.gov.br` não resolve nesta sessão (fora da rede permitida) e a Receita (`normas.receita.fazenda.gov.br`) não respondeu. Para usar o Planalto, o domínio precisa ser liberado nas configurações de rede da sessão. A IN RFB 2.003/2021, a IN RFB 2.004/2021, a Lei 9.249/1995, a LC 214/2025 no original e a LC 227/2026 ficaram sem leitura oficial; seus pontos estão marcados.
- **Campos novos:** `autonomia`, `core`, `substitui`, `horas_100`, `depende_de` e `fase` preenchidos em todas as fichas, com os valores da lista fechada.

## Achados que mudam as hipóteses do Plano

1. **Terceiro setor não é "uma empresa a mais": tem um ciclo próprio que nenhum concorrente de gestão contábil cobre.** Nas buscas, os softwares de igreja (InPeace, ParishSOFT, OneChurch, ChurchTrac, Prover) cuidam de membros e tesouraria, não da contabilidade nem das prestações de contas [IGREJA-SW]. Não encontrei produto para escritório com CEBAS, MROSC ou ITG 2002 `[NÃO ENCONTRADO]` (busca: "software gestão igrejas tesouraria contabilidade dízimos ofertas recibos sistema para ONGs prestação de contas preço").
2. **CEBAS tem janela rígida.** Vale 3 anos da publicação no DOU; a renovação só é tempestiva nos 360 dias anteriores ao vencimento; pedido antes não é conhecido e pedido depois vira concessão nova (LC 187 arts. 36 e 37) [LC187]. Cancelamento retroage à data da irregularidade (art. 38 §6º). É um prazo que vale a cota patronal inteira da entidade (TS-004, TS-015).
3. **Auditoria independente para o CEBAS** quando a receita bruta passa do limite do art. 3º II da LC 123 (R$ 4,8 milhões) (LC 187 art. 3º VII) [LC187]. Coincide com o limite da ECD das imunes e isentas (IN RFB 2.003/2021 art. 3º §1º IV, lido em fonte secundária) [CRCMS-ECD][ECD-WS].
4. **Guarda de documentos:** 10 anos para a entidade beneficente (LC 187 art. 3º VI) e para os originais da prestação de contas de parceria (Lei 13.019 art. 68), contra 5 anos da Lei 9.532 art. 12 §2º d [LC187][L13019][L9532]. A política de retenção da plataforma precisa do prazo mais longo para esses clientes.
5. **MROSC:** prestação de contas em até 90 dias do fim da parceria ou ao fim de cada exercício (art. 69), prorrogável por 30 dias; 45 dias por notificação para sanar (art. 70); saldo devolvido em 30 dias (art. 52); conta específica e pagamento só eletrônico ao titular (arts. 51 e 53) [L13019]. Organizações religiosas ficam dispensadas dos incisos I e III do art. 33 (objetivos de relevância pública e destinação do patrimônio) [L13019]. A conciliação por projeto é rotina diária, cabe ao agente sozinho (TS-011).
6. **ITG 2002 (R1):** voluntariado, inclusive de dirigentes, entra pelo valor justo; imunidade não é receita; os tributos renunciados ficam só na nota explicativa [ITG2002][CFC-ITG]. Ninguém mede voluntariado hoje; o app do cliente é o lugar natural para coletar horas (TS-007).
7. **Reforma tributária:** imunidade de IBS/CBS para os fornecimentos de entidades religiosas e de educação e assistência que cumprem o CTN art. 14 (LC 214 art. 9º), mas **não nas aquisições** (art. 9º §4º) [LC214-ART9][PT-REF]; a anulação de créditos (art. 51) vira custo e há dois projetos para mudar isso (PLP 26/2026 e PLP 45/2026, situação em 03/08/2026) [CAPAB]. A LC 224/2025 cortou benefícios e o PLP 11/2026 tenta excluir entidades sem fins lucrativos e doações dedutíveis do corte [CAPAB].
8. **IPTU de templo em imóvel alugado** (EC 116/2022) depende de pedido em cada prefeitura, às vezes renovado todo ano [SEN-EC116][IPTU-WS]. Vira tarefa recorrente de calendário (TS-019).
9. **Prebenda:** a regra é "independente da natureza e da quantidade do trabalho" (Lei 8.212 art. 22 §13, texto da Lei 10.170/2000 lido no Senado) [L10170]. Pagamento por meta ou por culto gera autuação; a plataforma pode checar a política de pagamento (TS-016).
10. **PIS sobre a folha (1%)** é o tributo típico das entidades, com isenção de Cofins sobre receitas próprias [RFB-PISFOLHA]; o STF afastou a cobrança das beneficentes de assistência social (RE 636.941, segundo as fontes) [PIS-STF]. É candidato a recuperação de crédito (liga com CON-033).

## Fichas


### TS-001 · Classificar a entidade e manter o perfil do terceiro setor: tipo jurídico, regime (imune, isenta ou sem benefício), títulos e certificações com vigência

| Campo | Conteúdo |
| --- | --- |
| setor / subárea | Terceiro setor / Enquadramento |
| descrição | Na entrada e a cada alteração estatutária, o escritório decide se a entidade é imune (CF art. 150 VI b ou c), isenta (Lei 9.532 art. 15) ou beneficente (CF art. 195 §7º, com CEBAS), e registra títulos (CEBAS, OSCIP, utilidade pública, inscrição no CMAS e no CNEAS). Hoje isso fica na cabeça do contador ou numa planilha, e o regime errado contamina ECF, eSocial e PIS. |
| etapas | Entrada, Manutenção |
| frequência | Na entrada; por evento (alteração de estatuto, título concedido ou vencido); revisão anual |
| gatilho (pacote de nicho) | Natureza jurídica do grupo 3 (entidades sem fins lucrativos: 306-9 fundação privada, 322-0 organização religiosa, 330-1 organização social, 399-9 associação privada) ou CNAE 9491-0/00, 9430-8/00, 9493-6/00, 9499-5/00, 8800-6/00, 8711-x, 8720-x, 8730-x |
| quem_faz | Contador responsável (sócio) |
| base_legal | CF art. 150 VI b e c; art. 195 §7º; CTN art. 14; Lei 9.532/1997 arts. 12 e 15; LC 187/2021 art. 2º |
| nível (como a informação entra) | Próprio |
| integração / credencial | Dados do CNPJ via SOC-001; títulos por upload ou consulta pública (CNEAS) · Nenhuma |
| autonomia | Agente prepara, pessoa conclui |
| core | Não depende |
| substitui | Planilha |
| papel_da_ia | Lê o cartão CNPJ (natureza jurídica, CNAE), o estatuto e as certidões; propõe o enquadramento com a base legal; o contador confirma. |
| ferramentas | `enquadrar_entidade(cliente)`, `registrar_titulo(cliente, tipo, numero, vigencia)` |
| notas (dor · freq · risco · dif) | 3 · 2 · 5 · 4 |
| horas_100 | 0.5 h/mês `[ESTIMATIVA]` (100 clientes, ~10 entidades) |
| depende_de | SOC-001, SOC-002 |
| fase | 5 Nichos e expansão |
| confiança | média |
| fontes | [L9532] [LC187] [CTN-PT] |

### TS-002 · Vigiar, todo mês, os requisitos que mantêm a imunidade ou a isenção e alertar quando um lançamento ou fato os põe em risco

| Campo | Conteúdo |
| --- | --- |
| setor / subárea | Terceiro setor / Imunidade e isenção |
| descrição | Os requisitos são cumulativos: não distribuir patrimônio ou renda, aplicar os recursos no país e nos objetivos, manter escrituração completa, guardar documentos (5 anos pela Lei 9.532; 10 anos pela LC 187), recolher os tributos retidos, entregar a declaração anual e respeitar os limites de remuneração de dirigentes. O agente lê os lançamentos e acusa pagamentos a dirigentes ou associados, despesas indedutíveis em favor deles (Lei 9.532 art. 13 par. único), remessas ao exterior e superávit sem destinação. |
| etapas | Manutenção |
| frequência | Mensal, após o fechamento; anual no encerramento |
| gatilho (pacote de nicho) | Natureza jurídica do grupo 3 (entidades sem fins lucrativos: 306-9 fundação privada, 322-0 organização religiosa, 330-1 organização social, 399-9 associação privada) ou CNAE 9491-0/00, 9430-8/00, 9493-6/00, 9499-5/00, 8800-6/00, 8711-x, 8720-x, 8730-x |
| quem_faz | Analista contábil; contador revisa |
| base_legal | CTN art. 14; Lei 9.532/1997 art. 12 §2º e §3º, art. 13, art. 15 §3º; LC 187/2021 art. 3º |
| nível (como a informação entra) | F |
| integração / credencial | Razão e folha exportados do core (arquivo) · Nenhuma |
| autonomia | Agente prepara, pessoa conclui |
| core | Lê do core |
| substitui | Planilha |
| papel_da_ia | Aplica regras sobre o razão exportado do core e sobre a folha; abre alerta com o lançamento e o requisito afetado; o contador decide. |
| ferramentas | `checar_requisitos_imunidade(cliente, competencia)` |
| notas (dor · freq · risco · dif) | 4 · 3 · 5 · 5 |
| horas_100 | 2 h/mês `[ESTIMATIVA]` (100 clientes, ~10 entidades) |
| depende_de | TS-001, CTB-024 |
| fase | 5 Nichos e expansão |
| confiança | média |
| fontes | [L9532] [LC187] [CTN-PT] |

### TS-003 · Conferir o estatuto e as atas contra as cláusulas que a lei exige e orientar a alteração estatutária e o registro em cartório

| Campo | Conteúdo |
| --- | --- |
| setor / subárea | Terceiro setor / Estatuto e governança |
| descrição | Imunidade, CEBAS e MROSC exigem cláusulas no estatuto: destinação do patrimônio na dissolução a entidade congênere ou pública, remuneração de dirigentes dentro dos limites, objetivos de relevância pública e escrituração pelas Normas Brasileiras de Contabilidade (Lei 13.019 art. 33, que dispensa as organizações religiosas dos incisos I e III). O escritório compara, aponta o que falta e acompanha o registro no Registro Civil de Pessoas Jurídicas. |
| etapas | Entrada, Manutenção |
| frequência | Na entrada; antes de pedir CEBAS ou celebrar parceria; por alteração estatutária |
| gatilho (pacote de nicho) | Natureza jurídica do grupo 3 (entidades sem fins lucrativos: 306-9 fundação privada, 322-0 organização religiosa, 330-1 organização social, 399-9 associação privada) ou CNAE 9491-0/00, 9430-8/00, 9493-6/00, 9499-5/00, 8800-6/00, 8711-x, 8720-x, 8730-x |
| quem_faz | Societário; contador; advogado da entidade |
| base_legal | Lei 13.019/2014 art. 33; LC 187/2021 art. 3º VIII; Lei 9.532/1997 art. 12 §2º g |
| nível (como a informação entra) | D-assistido |
| integração / credencial | Documento enviado pelo cliente; registro em cartório feito pela pessoa · Nenhuma (cartório presencial ou e-protocolo) |
| autonomia | Agente prepara, pessoa conclui |
| core | Não depende |
| substitui | E-mail |
| papel_da_ia | Lê o estatuto (PDF), confronta com a lista de cláusulas por regime e título e rascunha a minuta de alteração; o contador ou advogado revisa. |
| ferramentas | `conferir_estatuto(cliente)`, `rascunhar_alteracao_estatutaria(cliente, clausulas)` |
| notas (dor · freq · risco · dif) | 3 · 2 · 4 · 4 |
| horas_100 | 0.5 h/mês `[ESTIMATIVA]` (100 clientes, ~10 entidades) |
| depende_de | TS-001, SOC-034 |
| fase | 5 Nichos e expansão |
| confiança | alta |
| fontes | [L13019] [LC187] [L9532] |

### TS-004 · Controlar a validade do CEBAS, abrir a renovação na janela de 360 dias e montar o dossiê do requerimento

| Campo | Conteúdo |
| --- | --- |
| setor / subárea | Terceiro setor / CEBAS |
| descrição | O CEBAS vale 3 anos da publicação no DOU (LC 187 art. 36). A renovação só é tempestiva se protocolada nos 360 dias anteriores ao vencimento; antes disso não é conhecida e depois vira pedido de concessão (art. 37). Na assistência social o pedido vai pelo Portal de Serviços do MDS com ata da diretoria, relatório do CNEAS concluído, demonstrações e relatório de atividades no modelo da Portaria MDS 952/2023; saúde e educação vão ao MS e ao MEC. |
| etapas | Manutenção |
| frequência | Contínua (vigência); dossiê a cada 3 anos; supervisão a qualquer tempo (art. 38) |
| gatilho (pacote de nicho) | Natureza jurídica do grupo 3 (entidades sem fins lucrativos: 306-9 fundação privada, 322-0 organização religiosa, 330-1 organização social, 399-9 associação privada) ou CNAE 9491-0/00, 9430-8/00, 9493-6/00, 9499-5/00, 8800-6/00, 8711-x, 8720-x, 8730-x |
| quem_faz | Contador responsável; dirigente da entidade protocola |
| base_legal | LC 187/2021 arts. 3º, 31, 36, 37, 38; Decreto 11.791/2023; Portaria MDS 952/2023 |
| nível (como a informação entra) | D-assistido |
| integração / credencial | Sem API; portal gov.br do ministério com login do representante · Conta gov.br do representante legal |
| autonomia | Agente prepara, pessoa conclui |
| core | Lê do core |
| substitui | Planilha, Acessórias |
| papel_da_ia | Calcula a janela, cobra os documentos no app, confere o dossiê contra a lista da portaria e prepara o requerimento; o representante da entidade protocola com o próprio login. |
| ferramentas | `janela_renovacao_cebas(cliente)`, `montar_dossie_cebas(cliente, area)` |
| notas (dor · freq · risco · dif) | 4 · 2 · 5 · 4 |
| horas_100 | 1 h/mês `[ESTIMATIVA]` (100 clientes, ~10 entidades) |
| depende_de | TS-001, TS-008, FIS-036 |
| fase | 5 Nichos e expansão |
| confiança | alta |
| concorrentes | Nenhum concorrente de gestão contábil encontrado oferece controle de CEBAS; consultorias jurídicas fazem à mão |
| fontes | [LC187] [MDS-CEBAS] |

### TS-005 · Manter as inscrições e os títulos da entidade (CMAS, CNEAS, OSCIP, utilidade pública, conselhos de direitos) e lembrar renovações e relatórios anuais

| Campo | Conteúdo |
| --- | --- |
| setor / subárea | Terceiro setor / Inscrições e títulos |
| descrição | Cada título tem renovação ou relatório próprio: inscrição no conselho municipal de assistência social e cadastro no CNEAS (requisitos do CEBAS, LC 187 art. 31), qualificação de OSCIP (Lei 9.790/1999) e títulos municipais e estaduais de utilidade pública. Hoje isso é lembrado quando um edital ou um doador pede o comprovante. |
| etapas | Entrada, Manutenção |
| frequência | Anual ou conforme cada título; por evento (edital, doador) |
| gatilho (pacote de nicho) | Natureza jurídica do grupo 3 (entidades sem fins lucrativos: 306-9 fundação privada, 322-0 organização religiosa, 330-1 organização social, 399-9 associação privada) ou CNAE 9491-0/00, 9430-8/00, 9493-6/00, 9499-5/00, 8800-6/00, 8711-x, 8720-x, 8730-x |
| quem_faz | Atendimento; dirigente da entidade |
| base_legal | LC 187/2021 art. 31 II e III; Lei 8.742/1993 arts. 9º e 19; Lei 9.790/1999 |
| nível (como a informação entra) | D-humano |
| integração / credencial | Consulta pública do CNEAS (aplicacoes.mds.gov.br); demais por upload · Nenhuma para consulta |
| autonomia | Agente organiza e lembra |
| core | Não depende |
| substitui | Planilha, Acessórias |
| papel_da_ia | Registra título, órgão e prazo; lembra a entidade e o analista; consulta o CNEAS público quando possível. |
| ferramentas | `registrar_titulo(cliente, tipo, numero, vigencia)`, `lembrar_renovacao_titulo(cliente)` |
| notas (dor · freq · risco · dif) | 2 · 2 · 3 · 3 |
| horas_100 | 0.5 h/mês `[ESTIMATIVA]` (100 clientes, ~10 entidades) |
| depende_de | TS-001 |
| fase | 5 Nichos e expansão |
| confiança | média |
| fontes | [LC187] [MDS-CEBAS] [OSCIP-NL] |

### TS-006 · Escriturar a entidade pela ITG 2002 (R1): plano de contas por programa, projeto e fonte de recurso, receitas com e sem gratuidade, subvenções e doações com restrição

| Campo | Conteúdo |
| --- | --- |
| setor / subárea | Terceiro setor / Contabilidade ITG 2002 |
| descrição | A ITG 2002 (R1) pede regime de competência, segregação de receitas e despesas por atividade e com e sem gratuidade, subvenções particulares tratadas pela NBC TG 07 e imunidades fora do resultado (itens 8, 9A e 9B). A LC 187 art. 3º IV exige registro segregado da gratuidade. O agente propõe o plano de contas e os centros de custo por projeto e classifica as entradas antes do core. |
| etapas | Entrada, Manutenção |
| frequência | Implantação na entrada; classificação mensal |
| gatilho (pacote de nicho) | Natureza jurídica do grupo 3 (entidades sem fins lucrativos: 306-9 fundação privada, 322-0 organização religiosa, 330-1 organização social, 399-9 associação privada) ou CNAE 9491-0/00, 9430-8/00, 9493-6/00, 9499-5/00, 8800-6/00, 8711-x, 8720-x, 8730-x |
| quem_faz | Analista contábil |
| base_legal | NBC ITG 2002 (R1), DOU 02/09/2015; LC 187/2021 art. 3º IV; Lei 13.019/2014 art. 33 IV |
| nível (como a informação entra) | F |
| integração / credencial | Arquivo de lançamentos no leiaute do core (CTB-017) · Nenhuma |
| autonomia | Agente prepara, pessoa conclui |
| core | Lê e escreve no core |
| substitui | Planilha |
| papel_da_ia | Gera o plano de contas e o de-para por projeto e fonte; classifica doações, subvenções e despesas; envia o arquivo de lançamentos ao core; o analista revisa as exceções. |
| ferramentas | `gerar_plano_contas_terceiro_setor(cliente)`, `classificar_lancamento_projeto(cliente, linha)` |
| notas (dor · freq · risco · dif) | 4 · 3 · 4 · 4 |
| horas_100 | 6 h/mês `[ESTIMATIVA]` (100 clientes, ~10 entidades) |
| depende_de | TS-001, CTB-008, CTB-017 |
| fase | 5 Nichos e expansão |
| confiança | média |
| fontes | [ITG2002] [CFC-ITG] [LC187] |

### TS-007 · Registrar o trabalho voluntário (inclusive de dirigentes) pelo valor justo e apurar as gratuidades concedidas

| Campo | Conteúdo |
| --- | --- |
| setor / subárea | Terceiro setor / Contabilidade ITG 2002 |
| descrição | O trabalho voluntário, inclusive dos membros da administração, deve ser reconhecido pelo valor justo como se tivesse havido desembolso (ITG 2002 R1 item 19); as gratuidades sustentam o CEBAS. Hoje quase ninguém mede: um estudo citado pelo CFC achou pouca evidenciação nas publicações. A plataforma coleta horas e funções dos voluntários pelo app ou WhatsApp, aplica a tabela de valor justo e gera o lançamento de receita e despesa. |
| etapas | Manutenção |
| frequência | Mensal (coleta); anual (consolidação) |
| gatilho (pacote de nicho) | Natureza jurídica do grupo 3 (entidades sem fins lucrativos: 306-9 fundação privada, 322-0 organização religiosa, 330-1 organização social, 399-9 associação privada) ou CNAE 9491-0/00, 9430-8/00, 9493-6/00, 9499-5/00, 8800-6/00, 8711-x, 8720-x, 8730-x |
| quem_faz | Analista contábil; secretaria da entidade informa as horas |
| base_legal | NBC ITG 2002 (R1) item 19; LC 187/2021 art. 3º IV |
| nível (como a informação entra) | Próprio |
| integração / credencial | App do cliente / WhatsApp; arquivo ao core · Nenhuma |
| autonomia | Agente prepara, pessoa conclui |
| core | Escreve no core |
| substitui | Planilha, WhatsApp |
| papel_da_ia | Pede e recebe as horas no app, monta o mapa de voluntariado e gratuidades e propõe o lançamento; o contador aprova a tabela de valor justo. |
| ferramentas | `coletar_horas_voluntarios(cliente, mes)`, `lancar_voluntariado(cliente, mes)` |
| notas (dor · freq · risco · dif) | 3 · 3 · 3 · 5 |
| horas_100 | 2 h/mês `[ESTIMATIVA]` (100 clientes, ~10 entidades) |
| depende_de | TS-006 |
| fase | 5 Nichos e expansão |
| confiança | média |
| fontes | [ITG2002] [CFC-ITG] |

### TS-008 · Preparar as demonstrações e as notas explicativas próprias da entidade (renúncia fiscal, gratuidades, voluntariado, subvenções, recursos por projeto) e publicar onde a lei ou o doador exige

| Campo | Conteúdo |
| --- | --- |
| setor / subárea | Terceiro setor / Demonstrações |
| descrição | A ITG 2002 (R1) pede nota com a relação dos tributos objeto de renúncia fiscal (item 27 c), gratuidades e serviços voluntários; o superávit ou déficit substitui o lucro. As demonstrações alimentam CEBAS, prestação de contas a parceiros e assembleia, e auditoria independente quando a receita passa do limite do art. 3º II da LC 123 (LC 187 art. 3º VII). |
| etapas | Manutenção |
| frequência | Anual (encerramento); por pedido de parceiro ou doador |
| gatilho (pacote de nicho) | Natureza jurídica do grupo 3 (entidades sem fins lucrativos: 306-9 fundação privada, 322-0 organização religiosa, 330-1 organização social, 399-9 associação privada) ou CNAE 9491-0/00, 9430-8/00, 9493-6/00, 9499-5/00, 8800-6/00, 8711-x, 8720-x, 8730-x |
| quem_faz | Contador responsável |
| base_legal | NBC ITG 2002 (R1) item 27; LC 187/2021 art. 3º VII |
| nível (como a informação entra) | Próprio |
| integração / credencial | Balancete exportado do core · Nenhuma |
| autonomia | Agente prepara, pessoa conclui |
| core | Lê do core |
| substitui | Planilha |
| papel_da_ia | Lê o balancete do core e os mapas de voluntariado, gratuidade e projetos; redige as notas; o contador revisa e assina. |
| ferramentas | `redigir_notas_terceiro_setor(cliente, exercicio)` |
| notas (dor · freq · risco · dif) | 3 · 2 · 4 · 4 |
| horas_100 | 1.5 h/mês `[ESTIMATIVA]` (100 clientes, ~10 entidades) |
| depende_de | TS-006, TS-007, TS-009, CTB-045 |
| fase | 5 Nichos e expansão |
| confiança | alta |
| fontes | [ITG2002] [LC187] |

### TS-009 · Calcular o valor da renúncia fiscal usufruída (cota patronal, RAT, terceiros, PIS, Cofins, IRPJ, CSLL, IPTU, ISS) para notas, CEBAS e relatórios

| Campo | Conteúdo |
| --- | --- |
| setor / subárea | Terceiro setor / Imunidade e isenção |
| descrição | A nota explicativa relaciona os tributos renunciados e entidades de saúde no Proadi-SUS precisam comparar o gasto com o valor da imunidade usufruída (LC 187 arts. 14 e 16). O agente simula, sobre a folha e as receitas reais, o que seria devido sem a imunidade. |
| etapas | Manutenção |
| frequência | Anual; mensal para entidades de saúde no Proadi-SUS |
| gatilho (pacote de nicho) | Natureza jurídica do grupo 3 (entidades sem fins lucrativos: 306-9 fundação privada, 322-0 organização religiosa, 330-1 organização social, 399-9 associação privada) ou CNAE 9491-0/00, 9430-8/00, 9493-6/00, 9499-5/00, 8800-6/00, 8711-x, 8720-x, 8730-x |
| quem_faz | Contador responsável |
| base_legal | NBC ITG 2002 (R1) item 27 c; LC 187/2021 arts. 14 e 16 |
| nível (como a informação entra) | Próprio |
| integração / credencial | Folha e balancete do core · Nenhuma |
| autonomia | Agente prepara, pessoa conclui |
| core | Lê do core |
| substitui | Planilha |
| papel_da_ia | Calcula com a folha e o balancete e mostra a memória de cálculo; o contador valida. |
| ferramentas | `calcular_renuncia_fiscal(cliente, exercicio)` |
| notas (dor · freq · risco · dif) | 2 · 2 · 3 · 4 |
| horas_100 | 0.5 h/mês `[ESTIMATIVA]` (100 clientes, ~10 entidades) |
| depende_de | TS-001, TS-006 |
| fase | 5 Nichos e expansão |
| confiança | média |
| fontes | [ITG2002] [CFC-ITG] [LC187] |

### TS-010 · Montar e entregar a prestação de contas de termos de colaboração, fomento e convênios: relatório de execução do objeto, relatório financeiro e documentos na plataforma do ente

| Campo | Conteúdo |
| --- | --- |
| setor / subárea | Terceiro setor / Parcerias (MROSC) |
| descrição | A OSC presta contas em até 90 dias do fim da vigência ou ao fim de cada exercício se a parceria passa de um ano (Lei 13.019 art. 69), prorrogáveis por 30 dias, com relatório de execução do objeto (metas x resultados) e relatório de execução financeira (art. 66), em plataforma eletrônica (art. 65; Transferegov na União). Irregularidade abre prazo de 45 dias por notificação para sanar (art. 70); saldo é devolvido em 30 dias (art. 52); documentos ficam 10 anos (art. 68). |
| etapas | Manutenção, Desligamento |
| frequência | Por parceria: parcial anual e final; diligências por evento |
| gatilho (pacote de nicho) | Natureza jurídica do grupo 3 (entidades sem fins lucrativos: 306-9 fundação privada, 322-0 organização religiosa, 330-1 organização social, 399-9 associação privada) ou CNAE 9491-0/00, 9430-8/00, 9493-6/00, 9499-5/00, 8800-6/00, 8711-x, 8720-x, 8730-x |
| quem_faz | Analista de projetos/contábil do escritório; coordenador da OSC |
| base_legal | Lei 13.019/2014 arts. 51 a 53, 63 a 72; Decreto 8.726/2016 com Decreto 11.948/2024 (União); decretos estaduais e municipais |
| nível (como a informação entra) | D-assistido |
| integração / credencial | Transferegov.br (União) e portais estaduais/municipais; sem API de envio conhecida · Login gov.br do representante da OSC |
| autonomia | Agente prepara, pessoa conclui |
| core | Lê do core |
| substitui | Planilha, E-mail, WhatsApp |
| papel_da_ia | Junta extratos da conta específica, notas e comprovantes por meta, gera os relatórios no modelo do ente e a lista de pendências; a entidade revisa e envia na plataforma com o próprio login. |
| ferramentas | `montar_prestacao_contas_parceria(cliente, parceria, periodo)`, `responder_diligencia_parceria(cliente, parceria)` |
| notas (dor · freq · risco · dif) | 5 · 2 · 5 · 5 |
| horas_100 | 6 h/mês `[ESTIMATIVA]` (100 clientes, ~10 entidades) |
| depende_de | TS-011, TS-012 |
| fase | 5 Nichos e expansão |
| confiança | alta |
| concorrentes | Não foi encontrado software de gestão contábil com prestação de contas MROSC; prefeituras e TCEs publicam manuais próprios |
| fontes | [L13019] [SP-MROSC] [D11948] |

### TS-011 · Conciliar a conta específica de cada parceria, aplicar os rendimentos no objeto, ratear custos indiretos e bloquear despesas fora do plano de trabalho

| Campo | Conteúdo |
| --- | --- |
| setor / subárea | Terceiro setor / Parcerias (MROSC) |
| descrição | Os recursos ficam em conta específica isenta de tarifa em banco público (art. 51), os rendimentos seguem as mesmas regras (art. 51 par. único) e todo pagamento é eletrônico, ao titular da conta do fornecedor (art. 53). O agente concilia pelo Open Finance, marca cada despesa à meta e à rubrica do plano, e alerta pagamento em espécie, favorecido diferente ou rubrica estourada. |
| etapas | Manutenção |
| frequência | Diária ou semanal (conciliação); mensal (fechamento por projeto) |
| gatilho (pacote de nicho) | Natureza jurídica do grupo 3 (entidades sem fins lucrativos: 306-9 fundação privada, 322-0 organização religiosa, 330-1 organização social, 399-9 associação privada) ou CNAE 9491-0/00, 9430-8/00, 9493-6/00, 9499-5/00, 8800-6/00, 8711-x, 8720-x, 8730-x |
| quem_faz | Analista contábil; tesoureiro da OSC |
| base_legal | Lei 13.019/2014 arts. 46, 51, 52 e 53 |
| nível (como a informação entra) | B |
| integração / credencial | Open Finance (agregador) ou OFX; plano de trabalho por upload · Consentimento Open Finance da entidade |
| autonomia | Agente faz sozinho |
| core | Escreve no core |
| substitui | Planilha |
| papel_da_ia | Concilia por regra, classifica por rubrica e emite alertas sem revisão caso a caso; exceções vão ao analista. |
| ferramentas | `conciliar_conta_parceria(cliente, parceria)`, `checar_rubrica_plano_trabalho(cliente, despesa)` |
| notas (dor · freq · risco · dif) | 4 · 4 · 5 · 5 |
| horas_100 | 5 h/mês `[ESTIMATIVA]` (100 clientes, ~10 entidades) |
| depende_de | CTB-008, CTB-010, TS-006 |
| fase | 5 Nichos e expansão |
| confiança | alta |
| fontes | [L13019] |

### TS-012 · Manter o calendário de cada parceria (vigência, relatórios parciais e finais, prazos de diligência, devolução de saldo) e as certidões exigidas para celebrar e receber

| Campo | Conteúdo |
| --- | --- |
| setor / subárea | Terceiro setor / Parcerias (MROSC) |
| descrição | Cada termo tem plano de trabalho, cronograma de desembolso e prazos próprios; para celebrar e receber parcelas o ente exige regularidade (certidões federais, FGTS, trabalhista, estaduais e municipais). O agente lê o termo, cria os prazos e cobra as certidões antes de vencerem. |
| etapas | Manutenção |
| frequência | Por evento (novo termo, aditivo); diária (vencimentos) |
| gatilho (pacote de nicho) | Natureza jurídica do grupo 3 (entidades sem fins lucrativos: 306-9 fundação privada, 322-0 organização religiosa, 330-1 organização social, 399-9 associação privada) ou CNAE 9491-0/00, 9430-8/00, 9493-6/00, 9499-5/00, 8800-6/00, 8711-x, 8720-x, 8730-x |
| quem_faz | Atendimento; coordenador da OSC |
| base_legal | Lei 13.019/2014 arts. 34, 52, 69 e 70 |
| nível (como a informação entra) | Próprio |
| integração / credencial | Leitura do PDF do termo; certidões via FIS-036 · As de FIS-036 |
| autonomia | Agente faz sozinho |
| core | Não depende |
| substitui | Acessórias, Gestta/Domínio Processos, Planilha |
| papel_da_ia | Extrai datas e obrigações do termo e do plano de trabalho, cria tarefas e lembretes, emite certidões pelo fluxo existente. |
| ferramentas | `cadastrar_parceria(cliente, termo_pdf)`, `calendario_parceria(cliente, parceria)` |
| notas (dor · freq · risco · dif) | 4 · 3 · 5 · 4 |
| horas_100 | 1 h/mês `[ESTIMATIVA]` (100 clientes, ~10 entidades) |
| depende_de | FIS-001, FIS-036, TS-001 |
| fase | 5 Nichos e expansão |
| confiança | alta |
| fontes | [L13019] |

### TS-013 · Definir o conjunto de obrigações federais da entidade imune ou isenta (ECF sempre, ECD pelo limite de R$ 4,8 milhões, EFD-Reinf, DCTFWeb, eSocial) e parametrizar o calendário

| Campo | Conteúdo |
| --- | --- |
| setor / subárea | Terceiro setor / Obrigações acessórias |
| descrição | Imunes e isentas entregam ECF; a ECD é dispensada quando receitas, doações, subvenções, contribuições, convênios e ingressos somam menos de R$ 4,8 milhões no ano (IN RFB 2.003/2021 art. 3º §1º IV), mas há outras hipóteses de obrigatoriedade (PIS sobre a folha acima de R$ 10 mil mensais, segundo o CRC-MS). Retenções vão à EFD-Reinf e à DCTFWeb e a folha ao eSocial. O agente soma os ingressos do ano e decide ECD obrigatória ou facultativa, e marca a forma de tributação de imune ou isenta na ECF. |
| etapas | Entrada, Manutenção |
| frequência | Anual (ECD/ECF); mensal (Reinf, DCTFWeb, eSocial) |
| gatilho (pacote de nicho) | Natureza jurídica do grupo 3 (entidades sem fins lucrativos: 306-9 fundação privada, 322-0 organização religiosa, 330-1 organização social, 399-9 associação privada) ou CNAE 9491-0/00, 9430-8/00, 9493-6/00, 9499-5/00, 8800-6/00, 8711-x, 8720-x, 8730-x |
| quem_faz | Analista fiscal/contábil |
| base_legal | IN RFB 2.003/2021 art. 3º §1º IV; IN RFB 2.004/2021 (ECF); Lei 9.532/1997 art. 12 §2º e e f |
| nível (como a informação entra) | F |
| integração / credencial | Balancete do core; transmissão no core/PVA · e-CNPJ ou procuração (FIS-007) |
| autonomia | Agente prepara, pessoa conclui |
| core | Lê do core |
| substitui | Acessórias, Gestta/Domínio Processos |
| papel_da_ia | Calcula o teste de obrigatoriedade com o balancete, gera a lista de obrigações no calendário e confere o tipo de entidade nos arquivos antes da transmissão. |
| ferramentas | `testar_obrigatoriedade_ecd_imune(cliente, ano)` |
| notas (dor · freq · risco · dif) | 3 · 3 · 4 · 3 |
| horas_100 | 2 h/mês `[ESTIMATIVA]` (100 clientes, ~10 entidades) |
| depende_de | TS-001, FIS-001, CTB-041, CTB-042 |
| fase | 5 Nichos e expansão |
| confiança | média |
| fontes | [CRCMS-ECD] [ECD-WS] [L9532] |

### TS-014 · Apurar o PIS sobre a folha (1%), gerar o DARF e registrar quando a entidade beneficente é imune a ele

| Campo | Conteúdo |
| --- | --- |
| setor / subárea | Terceiro setor / Tributos da entidade |
| descrição | Templos, instituições de educação e assistência dos arts. 12 e 15 da Lei 9.532, fundações e associações pagam PIS sobre a folha a 1% (MP 2.158-35 art. 13), e ficam isentas de Cofins sobre as receitas das atividades próprias. O STF (RE 636.941) afastou a cobrança das entidades beneficentes de assistência social que cumprem os requisitos; o escritório registra a tese por cliente e avalia restituição dos últimos 5 anos. |
| etapas | Manutenção |
| frequência | Mensal (vence no dia 25 do mês seguinte) |
| gatilho (pacote de nicho) | Natureza jurídica do grupo 3 (entidades sem fins lucrativos: 306-9 fundação privada, 322-0 organização religiosa, 330-1 organização social, 399-9 associação privada) ou CNAE 9491-0/00, 9430-8/00, 9493-6/00, 9499-5/00, 8800-6/00, 8711-x, 8720-x, 8730-x |
| quem_faz | Analista fiscal |
| base_legal | MP 2.158-35/2001 arts. 13 e 14 X; Lei 9.715/1998 art. 8º II; RE 636.941 (STF, 2014) |
| nível (como a informação entra) | A$ |
| integração / credencial | Integra Contador (DARF) — serviço pago · Procuração do escritório no e-CAC |
| autonomia | Agente prepara, pessoa conclui |
| core | Lê do core |
| substitui | Planilha |
| papel_da_ia | Calcula sobre a folha do core, emite o DARF pelo Integra Contador e controla a tese de imunidade aprovada pelo contador. |
| ferramentas | `apurar_pis_folha(cliente, competencia)` |
| notas (dor · freq · risco · dif) | 2 · 3 · 3 · 3 |
| horas_100 | 0.5 h/mês `[ESTIMATIVA]` (100 clientes, ~10 entidades) |
| depende_de | TS-001, FIS-021, DP-016 |
| fase | 5 Nichos e expansão |
| confiança | média |
| fontes | [RFB-PISFOLHA] [PIS-STF] |

### TS-015 · Aplicar a isenção da cota patronal só enquanto o CEBAS vale: informar os dados do certificado no eSocial e voltar a recolher quando vencer ou for cancelado

| Campo | Conteúdo |
| --- | --- |
| setor / subárea | Terceiro setor / Tributos da entidade |
| descrição | A entidade beneficente certificada informa no S-1000 a classificação tributária de entidade beneficente isenta e o número do CEBAS; sem certificado vigente não pode usar o grupo. Como a decisão de cancelamento retroage à data da irregularidade (LC 187 art. 38 §6º), o escritório precisa ligar o status do CEBAS à folha. |
| etapas | Manutenção |
| frequência | Por evento (concessão, renovação, cancelamento); conferência mensal |
| gatilho (pacote de nicho) | Natureza jurídica do grupo 3 (entidades sem fins lucrativos: 306-9 fundação privada, 322-0 organização religiosa, 330-1 organização social, 399-9 associação privada) ou CNAE 9491-0/00, 9430-8/00, 9493-6/00, 9499-5/00, 8800-6/00, 8711-x, 8720-x, 8730-x |
| quem_faz | Analista de DP |
| base_legal | LC 187/2021 arts. 3º, 36 a 38; leiaute do eSocial, S-1000 (classificação tributária e dados de isenção) |
| nível (como a informação entra) | F |
| integração / credencial | Folha no core; eSocial pelo core · e-CNPJ ou procuração |
| autonomia | Agente prepara, pessoa conclui |
| core | Lê e escreve no core |
| substitui | Planilha |
| papel_da_ia | Cruza a vigência do CEBAS (TS-004) com o cadastro do eSocial e a DCTFWeb e alerta divergência. |
| ferramentas | `conferir_isencao_patronal(cliente, competencia)` |
| notas (dor · freq · risco · dif) | 3 · 2 · 5 · 4 |
| horas_100 | 0.5 h/mês `[ESTIMATIVA]` (100 clientes, ~10 entidades) |
| depende_de | TS-004, DP-016, FIS-019 |
| fase | 5 Nichos e expansão |
| confiança | média |
| fontes | [LC187] [ESOCIAL-S1000] |

### TS-016 · Definir e pagar a prebenda ou côngrua dos ministros religiosos sem caracterizar remuneração: valor que não varia com o trabalho, recibo, INSS do ministro e IRRF

| Campo | Conteúdo |
| --- | --- |
| setor / subárea | Terceiro setor / Igrejas |
| descrição | Não é remuneração o que a entidade religiosa paga ao ministro pelo mister religioso ou para subsistência, desde que independa da natureza e da quantidade do trabalho (Lei 8.212 art. 22 §13, incluído pela Lei 10.170/2000; §14 da Lei 13.137/2015 interpreta). O ministro é contribuinte individual e recolhe o próprio INSS. Valores proporcionais a metas, número de cultos ou arrecadação geram autuação da cota patronal (há decisões do CARF nesse sentido). |
| etapas | Manutenção |
| frequência | Mensal (pagamento); por evento (novo ministro, mudança de valor) |
| gatilho (pacote de nicho) | Natureza jurídica 322-0 (organização religiosa) ou CNAE 9491-0/00 |
| quem_faz | Analista de DP; tesouraria da igreja |
| base_legal | Lei 8.212/1991 art. 22 §13 (Lei 10.170/2000) e §14 (Lei 13.137/2015); art. 12 V c |
| nível (como a informação entra) | Próprio |
| integração / credencial | Folha/autônomos no core · Nenhuma |
| autonomia | Agente prepara, pessoa conclui |
| core | Escreve no core |
| substitui | Planilha, WhatsApp |
| papel_da_ia | Confere se a regra de pagamento é uniforme, emite recibo, calcula IRRF e lembra o carnê do ministro; o contador valida a política. |
| ferramentas | `checar_politica_prebenda(cliente)`, `emitir_recibo_prebenda(cliente, ministro, mes)` |
| notas (dor · freq · risco · dif) | 3 · 3 · 4 · 4 |
| horas_100 | 1 h/mês `[ESTIMATIVA]` (100 clientes, ~10 entidades) |
| depende_de | TS-001, SOC-004 |
| fase | 5 Nichos e expansão |
| confiança | média |
| fontes | [L10170] [PREB-WS] |

### TS-017 · Registrar dízimos, ofertas e doações (Pix, maquininha, espécie com termo de contagem), conciliar com o banco e emitir recibo ao doador

| Campo | Conteúdo |
| --- | --- |
| setor / subárea | Terceiro setor / Igrejas e doações |
| descrição | A tesouraria conta as ofertas do culto, assina o termo de contagem com duas ou três pessoas, deposita e lança numa planilha; Pix e maquininha chegam pelo banco. O agente recebe a foto do termo pelo WhatsApp, concilia com o depósito e os créditos por Open Finance, identifica o doador quando possível e emite o recibo e o informe anual de doações. |
| etapas | Manutenção |
| frequência | Semanal (cultos); mensal (fechamento); anual (informe ao doador) |
| gatilho (pacote de nicho) | Natureza jurídica do grupo 3 (entidades sem fins lucrativos: 306-9 fundação privada, 322-0 organização religiosa, 330-1 organização social, 399-9 associação privada) ou CNAE 9491-0/00, 9430-8/00, 9493-6/00, 9499-5/00, 8800-6/00, 8711-x, 8720-x, 8730-x |
| quem_faz | Tesoureiro da entidade; analista contábil |
| base_legal | NBC ITG 2002 (R1) (reconhecimento de doações); CTN art. 14 III (escrituração) |
| nível (como a informação entra) | B |
| integração / credencial | Open Finance/OFX; Pix do banco; WhatsApp · Consentimento Open Finance |
| autonomia | Agente faz sozinho |
| core | Escreve no core |
| substitui | Planilha, WhatsApp |
| papel_da_ia | Lê o termo de contagem, concilia por regra e emite recibos sem revisão caso a caso; divergências vão à tesouraria. |
| ferramentas | `registrar_contagem_ofertas(cliente, foto)`, `emitir_recibo_doacao(cliente, doador, valor)` |
| notas (dor · freq · risco · dif) | 4 · 4 · 3 · 4 |
| horas_100 | 6 h/mês `[ESTIMATIVA]` (100 clientes, ~10 entidades) |
| depende_de | CTB-008, CTB-010, TS-006 |
| fase | 5 Nichos e expansão |
| confiança | média |
| concorrentes | Softwares de gestão de igrejas (InPeace sob consulta; ParishSOFT, OneChurch, ChurchTrac com preços em dólar no Capterra; Prover com dízimo online) cuidam da tesouraria, não da contabilidade (InPeace sob consulta; OneChurch a partir de US$ 58; ChurchTrac a partir de US$ 9 (Capterra, 06/11/2026)) |
| fontes | [IGREJA-SW] [ITG2002] |

### TS-018 · Verificar se a entidade pode receber doação dedutível e emitir as declarações e recibos exigidos dos doadores pessoa jurídica

| Campo | Conteúdo |
| --- | --- |
| setor / subárea | Terceiro setor / Doações incentivadas |
| descrição | Doações a entidades civis sem fins lucrativos que prestam serviços gratuitos são dedutíveis até 2% do lucro operacional do doador no lucro real (Lei 9.249 art. 13 §2º III), com depósito na conta da entidade; a Lei 13.019 (arts. 84-B e 84-C) permite à OSC receber de empresas até 2% de sua receita bruta, sem certificação, se tiver finalidade listada. As fontes divergem sobre a exigência de OSCIP ou utilidade pública para a dedução; o escritório registra a tese e controla o limite por doador. |
| etapas | Manutenção |
| frequência | Por evento (doação recebida); anual (declarações) |
| gatilho (pacote de nicho) | Natureza jurídica do grupo 3 (entidades sem fins lucrativos: 306-9 fundação privada, 322-0 organização religiosa, 330-1 organização social, 399-9 associação privada) ou CNAE 9491-0/00, 9430-8/00, 9493-6/00, 9499-5/00, 8800-6/00, 8711-x, 8720-x, 8730-x |
| quem_faz | Contador responsável |
| base_legal | Lei 9.249/1995 art. 13 §2º III; Lei 13.019/2014 arts. 84-B e 84-C; IN RFB 1.700/2017 |
| nível (como a informação entra) | Próprio |
| integração / credencial | Interna · Nenhuma |
| autonomia | Agente prepara, pessoa conclui |
| core | Não depende |
| substitui | Planilha, E-mail |
| papel_da_ia | Confere requisitos e limites, gera a declaração da donatária e o recibo; o contador assina. |
| ferramentas | `verificar_doacao_dedutivel(cliente, doador)`, `emitir_declaracao_donataria(cliente, doacao)` |
| notas (dor · freq · risco · dif) | 3 · 2 · 3 · 4 |
| horas_100 | 1 h/mês `[ESTIMATIVA]` (100 clientes, ~10 entidades) |
| depende_de | TS-001, TS-017 |
| fase | 5 Nichos e expansão |
| confiança | média |
| fontes | [L13019] [DOAC-WS] |

### TS-019 · Pedir e renovar o reconhecimento de imunidade de IPTU (inclusive templo em imóvel alugado), ISS e ITCMD sobre doações, e contestar lançamentos indevidos

| Campo | Conteúdo |
| --- | --- |
| setor / subárea | Terceiro setor / Imunidades municipais e estaduais |
| descrição | Desde a EC 116/2022 (CF art. 156 §1º-A) o IPTU não incide sobre imóvel alugado por templo, mas cada prefeitura tem rito próprio: em Santos o pedido sobre locação por prazo indeterminado vale até o exercício seguinte e precisa ser refeito todo ano; em São Paulo é pela declaração no sistema da Fazenda. ISS e ITCMD (CF art. 155 §1º VII, pela EC 132/2023) também dependem de pedido ou declaração conforme o ente. |
| etapas | Entrada, Manutenção |
| frequência | Anual (renovação); por evento (novo imóvel, carnê lançado, doação recebida) |
| gatilho (pacote de nicho) | Natureza jurídica do grupo 3 (entidades sem fins lucrativos: 306-9 fundação privada, 322-0 organização religiosa, 330-1 organização social, 399-9 associação privada) ou CNAE 9491-0/00, 9430-8/00, 9493-6/00, 9499-5/00, 8800-6/00, 8711-x, 8720-x, 8730-x |
| quem_faz | Societário/fiscal; dirigente da entidade |
| base_legal | CF art. 150 VI b e c; art. 156 §1º-A (EC 116/2022); art. 155 §1º VII (EC 132/2023); leis municipais e estaduais |
| nível (como a informação entra) | D-assistido |
| integração / credencial | Portais municipais e estaduais, sem API · Login municipal da entidade ou procuração |
| autonomia | Agente prepara, pessoa conclui |
| core | Não depende |
| substitui | Planilha, Acessórias |
| papel_da_ia | Lista imóveis e contratos, monta o requerimento com os documentos que a prefeitura pede e lembra a renovação; a entidade ou o escritório protocola. |
| ferramentas | `montar_pedido_imunidade_iptu(cliente, imovel)` |
| notas (dor · freq · risco · dif) | 3 · 2 · 3 · 4 |
| horas_100 | 0.5 h/mês `[ESTIMATIVA]` (100 clientes, ~10 entidades) |
| depende_de | TS-001, FIS-028 |
| fase | 5 Nichos e expansão |
| confiança | média |
| fontes | [SEN-EC116] [IPTU-WS] [ITCMD-NET] |

### TS-020 · Preparar a prestação de contas anual aos associados ou membros: parecer do conselho fiscal, convocação, ata de aprovação e relatório simplificado

| Campo | Conteúdo |
| --- | --- |
| setor / subárea | Terceiro setor / Governança |
| descrição | O estatuto define quem aprova as contas (assembleia geral, conselho fiscal, conselho deliberativo). O escritório entrega as demonstrações e uma versão em linguagem simples, rascunha convocação e ata e acompanha o registro quando o estatuto ou um parceiro exige. |
| etapas | Manutenção |
| frequência | Anual (após o encerramento); por evento (assembleia extraordinária) |
| gatilho (pacote de nicho) | Natureza jurídica do grupo 3 (entidades sem fins lucrativos: 306-9 fundação privada, 322-0 organização religiosa, 330-1 organização social, 399-9 associação privada) ou CNAE 9491-0/00, 9430-8/00, 9493-6/00, 9499-5/00, 8800-6/00, 8711-x, 8720-x, 8730-x |
| quem_faz | Contador; diretoria e conselho fiscal da entidade |
| base_legal | Código Civil arts. 54 e 59 (associações); estatuto da entidade |
| nível (como a informação entra) | D-assistido |
| integração / credencial | Interna · Nenhuma |
| autonomia | Agente prepara, pessoa conclui |
| core | Lê do core |
| substitui | E-mail, WhatsApp |
| papel_da_ia | Gera relatório simplificado, rascunhos de convocação, parecer e ata a partir do estatuto e das demonstrações; a diretoria conduz a assembleia. |
| ferramentas | `rascunhar_ata_aprovacao_contas(cliente, exercicio)`, `relatorio_simplificado_membros(cliente, exercicio)` |
| notas (dor · freq · risco · dif) | 2 · 2 · 3 · 3 |
| horas_100 | 1 h/mês `[ESTIMATIVA]` (100 clientes, ~10 entidades) |
| depende_de | TS-008, SOC-041 |
| fase | 5 Nichos e expansão |
| confiança | baixa |
| fontes | nenhuma lida; base no texto da lei citado de memória, a verificar |

### TS-021 · Preparar a entidade para IBS e CBS: separar fornecimentos imunes, atividades econômicas fora da imunidade e o custo que vem nas compras

| Campo | Conteúdo |
| --- | --- |
| setor / subárea | Terceiro setor / Reforma tributária |
| descrição | A LC 214/2025 (art. 9º) torna imunes ao IBS e à CBS os fornecimentos de entidades religiosas e templos, inclusive suas organizações assistenciais e beneficentes, e das instituições de educação e assistência social que cumprem o art. 14 do CTN; a imunidade não alcança as aquisições (art. 9º §4º) e a regra de anulação de créditos (art. 51) transforma o tributo das compras em custo. PLP 26/2026 e PLP 45/2026 tentam mudar o art. 51. O escritório marca o CST de imunidade nas notas da entidade, separa bazar, cantina e cursos e refaz o orçamento. |
| etapas | Manutenção |
| frequência | Projeto 2026–2027; acompanhamento mensal das notas emitidas |
| gatilho (pacote de nicho) | Natureza jurídica do grupo 3 (entidades sem fins lucrativos: 306-9 fundação privada, 322-0 organização religiosa, 330-1 organização social, 399-9 associação privada) ou CNAE 9491-0/00, 9430-8/00, 9493-6/00, 9499-5/00, 8800-6/00, 8711-x, 8720-x, 8730-x |
| quem_faz | Consultor tributário; contador |
| base_legal | LC 214/2025 arts. 9º e 51; CTN art. 14 |
| nível (como a informação entra) | Próprio |
| integração / credencial | Notas emitidas e recebidas (D3); balancete · As da captura de notas |
| autonomia | Agente prepara, pessoa conclui |
| core | Lê do core |
| substitui | Planilha |
| papel_da_ia | Classifica cada receita como imune ou tributada, simula o custo das compras com IBS/CBS e acompanha os PLPs; o contador decide. |
| ferramentas | `classificar_receita_ibs_cbs_entidade(cliente)`, `simular_custo_aquisicoes_ibs_cbs(cliente)` |
| notas (dor · freq · risco · dif) | 3 · 2 · 4 · 5 |
| horas_100 | 1 h/mês `[ESTIMATIVA]` (100 clientes, ~10 entidades) |
| depende_de | TS-001, CON-015, CON-016 |
| fase | 5 Nichos e expansão |
| confiança | média |
| fontes | [LC214-ART9] [PT-REF] [CAPAB] |

### TS-022 · Separar as receitas próprias das não abrangidas (aplicações financeiras, aluguéis, bazar, estacionamento) e apurar os tributos que incidem sobre elas

| Campo | Conteúdo |
| --- | --- |
| setor / subárea | Terceiro setor / Imunidade e isenção |
| descrição | A imunidade e a isenção não alcançam os rendimentos de aplicações financeiras (Lei 9.532 art. 12 §1º e art. 15 §2º), e a isenção de Cofins vale para as receitas das atividades próprias. Receita de atividade econômica concorrencial pode ser questionada. O agente identifica essas receitas no extrato e no razão e calcula o que é devido. |
| etapas | Manutenção |
| frequência | Mensal |
| gatilho (pacote de nicho) | Natureza jurídica do grupo 3 (entidades sem fins lucrativos: 306-9 fundação privada, 322-0 organização religiosa, 330-1 organização social, 399-9 associação privada) ou CNAE 9491-0/00, 9430-8/00, 9493-6/00, 9499-5/00, 8800-6/00, 8711-x, 8720-x, 8730-x |
| quem_faz | Analista fiscal |
| base_legal | Lei 9.532/1997 art. 12 §1º e art. 15 §2º; MP 2.158-35/2001 art. 14 X |
| nível (como a informação entra) | F |
| integração / credencial | Extratos e razão · Nenhuma |
| autonomia | Agente prepara, pessoa conclui |
| core | Lê do core |
| substitui | Planilha |
| papel_da_ia | Marca as receitas não próprias por regra e prepara a apuração; o analista confere. |
| ferramentas | `segregar_receitas_nao_proprias(cliente, competencia)` |
| notas (dor · freq · risco · dif) | 3 · 3 · 4 · 4 |
| horas_100 | 1 h/mês `[ESTIMATIVA]` (100 clientes, ~10 entidades) |
| depende_de | TS-006, TS-001 |
| fase | 5 Nichos e expansão |
| confiança | média |
| fontes | [L9532] [RFB-PISFOLHA] |

### TS-023 · Responder a notificação fiscal de suspensão da imunidade ou isenção e reunir a prova dos requisitos

| Campo | Conteúdo |
| --- | --- |
| setor / subárea | Terceiro setor / Imunidade e isenção |
| descrição | A Receita suspende a imunidade nos anos em que a entidade praticou infração, inclusive simular doações ou pagar despesas indedutíveis a dirigentes (Lei 9.532 art. 13), pelo rito do art. 32 da Lei 9.430/1996 (art. 14). No CEBAS, a manifestação no processo administrativo tem 30 dias (LC 187 art. 39). O agente monta o dossiê com escrituração, estatuto, atas e mapas de gratuidade. |
| etapas | Manutenção |
| frequência | Rara (por evento) |
| gatilho (pacote de nicho) | Natureza jurídica do grupo 3 (entidades sem fins lucrativos: 306-9 fundação privada, 322-0 organização religiosa, 330-1 organização social, 399-9 associação privada) ou CNAE 9491-0/00, 9430-8/00, 9493-6/00, 9499-5/00, 8800-6/00, 8711-x, 8720-x, 8730-x |
| quem_faz | Contador; advogado |
| base_legal | Lei 9.532/1997 arts. 13 e 14; Lei 9.430/1996 art. 32; LC 187/2021 arts. 38 e 39 |
| nível (como a informação entra) | Próprio |
| integração / credencial | Caixa postal (FIS-005) e upload · Procuração e-CAC |
| autonomia | Agente prepara, pessoa conclui |
| core | Lê do core |
| substitui | E-mail |
| papel_da_ia | Calcula o prazo, separa as provas e rascunha a manifestação; o contador e o advogado concluem. |
| ferramentas | `montar_defesa_imunidade(cliente, notificacao)` |
| notas (dor · freq · risco · dif) | 4 · 1 · 5 · 4 |
| horas_100 | 0.3 h/mês `[ESTIMATIVA]` (100 clientes, ~10 entidades) |
| depende_de | TS-002, FIS-038 |
| fase | 5 Nichos e expansão |
| confiança | média |
| fontes | [L9532] [LC187] |

### TS-024 · Prestar contas anualmente ao Ministério Público que vela pela fundação e atender suas exigências

| Campo | Conteúdo |
| --- | --- |
| setor / subárea | Terceiro setor / Fundações |
| descrição | Fundações de direito privado são veladas pelo Ministério Público do estado onde funcionam (Código Civil art. 66), que pede prestação de contas anual em sistema ou formulário próprio de cada MP e aprova alienações de imóveis previstas no estatuto. O escritório prepara o pacote e acompanha as exigências. |
| etapas | Manutenção |
| frequência | Anual; por evento (alienação, alteração de estatuto) |
| gatilho (pacote de nicho) | Natureza jurídica 306-9 (fundação privada) |
| quem_faz | Contador; diretoria da fundação |
| base_legal | Código Civil arts. 62 a 69 (art. 66: velamento pelo MP); atos de cada MP estadual |
| nível (como a informação entra) | D-assistido |
| integração / credencial | Sistemas próprios de cada MP estadual (não verificados) · Login da fundação no sistema do MP |
| autonomia | Agente prepara, pessoa conclui |
| core | Lê do core |
| substitui | Planilha, E-mail |
| papel_da_ia | Gera o pacote de prestação de contas no modelo do MP local e controla prazos e exigências; a fundação envia. |
| ferramentas | `montar_contas_mp(cliente, exercicio)` |
| notas (dor · freq · risco · dif) | 3 · 2 · 4 · 4 |
| horas_100 | 0.5 h/mês `[ESTIMATIVA]` (100 clientes, ~10 entidades) |
| depende_de | TS-008 |
| fase | 5 Nichos e expansão |
| confiança | baixa |
| fontes | nenhuma lida; base no texto da lei citado de memória, a verificar |

### TS-025 · Conduzir a dissolução da entidade com destinação do patrimônio a outra entidade qualificada ou a órgão público

| Campo | Conteúdo |
| --- | --- |
| setor / subárea | Terceiro setor / Encerramento |
| descrição | Na dissolução, incorporação, fusão ou cisão o patrimônio vai a entidade que atenda às mesmas condições ou a órgão público (Lei 9.532 art. 12 §2º g; LC 187 art. 3º VIII; Lei 13.019 art. 33 III). Saldos de parcerias são devolvidos ao ente. O escritório levanta o patrimônio, a entidade destinatária e as obrigações finais antes da baixa. |
| etapas | Desligamento |
| frequência | Rara (por evento) |
| gatilho (pacote de nicho) | Natureza jurídica do grupo 3 (entidades sem fins lucrativos: 306-9 fundação privada, 322-0 organização religiosa, 330-1 organização social, 399-9 associação privada) ou CNAE 9491-0/00, 9430-8/00, 9493-6/00, 9499-5/00, 8800-6/00, 8711-x, 8720-x, 8730-x |
| quem_faz | Contador; societário; advogado |
| base_legal | Lei 9.532/1997 art. 12 §2º g e art. 15 §4º; LC 187/2021 art. 3º VIII; Lei 13.019/2014 arts. 33 III e 52 |
| nível (como a informação entra) | D-assistido |
| integração / credencial | Interna; cartório e RFB pela pessoa · As de SOC-031 |
| autonomia | Agente prepara, pessoa conclui |
| core | Lê do core |
| substitui | Planilha |
| papel_da_ia | Monta o checklist de dissolução, confere a entidade destinatária e calcula saldos a devolver; a assembleia e o cartório decidem. |
| ferramentas | `checklist_dissolucao_entidade(cliente)` |
| notas (dor · freq · risco · dif) | 3 · 1 · 5 · 4 |
| horas_100 | 0.2 h/mês `[ESTIMATIVA]` (100 clientes, ~10 entidades) |
| depende_de | TS-001, SOC-031, TS-010 |
| fase | 5 Nichos e expansão |
| confiança | alta |
| fontes | [L9532] [LC187] [L13019] |

### TS-026 · Fazer a entrada de uma entidade do terceiro setor: levantar estatuto, atas, títulos, parcerias em curso, prestações de contas pendentes e o histórico de ECF e ECD

| Campo | Conteúdo |
| --- | --- |
| setor / subárea | Terceiro setor / Entrada |
| descrição | Além do checklist comum de entrada, a entidade traz riscos próprios: prestação de contas de parceria em atraso, CEBAS perto do vencimento, ECF entregue como empresa comum, voluntariado nunca registrado. O agente pede os documentos certos no app e devolve um diagnóstico com prazos. |
| etapas | Entrada |
| frequência | Por evento (novo cliente) |
| gatilho (pacote de nicho) | Natureza jurídica do grupo 3 (entidades sem fins lucrativos: 306-9 fundação privada, 322-0 organização religiosa, 330-1 organização social, 399-9 associação privada) ou CNAE 9491-0/00, 9430-8/00, 9493-6/00, 9499-5/00, 8800-6/00, 8711-x, 8720-x, 8730-x |
| quem_faz | Coordenador de implantação; contador |
| base_legal | As das fichas TS-002 a TS-013 |
| nível (como a informação entra) | Próprio |
| integração / credencial | App do cliente; e-CAC (recibos de ECF/ECD) via fluxos existentes · Procuração e-CAC |
| autonomia | Agente prepara, pessoa conclui |
| core | Não depende |
| substitui | E-mail, WhatsApp, Planilha |
| papel_da_ia | Gera a lista de documentos pelo tipo de entidade, lê o que chega e monta o diagnóstico; o contador revisa e apresenta. |
| ferramentas | `diagnostico_entrada_terceiro_setor(cliente)` |
| notas (dor · freq · risco · dif) | 4 · 2 · 4 · 4 |
| horas_100 | 1 h/mês `[ESTIMATIVA]` (100 clientes, ~10 entidades) |
| depende_de | SOC-021, SOC-023, TS-001 |
| fase | 5 Nichos e expansão |
| confiança | média |
| fontes | [LC187] [L13019] [CRCMS-ECD] |

### TS-027 · Prestar contas de contratos de gestão de organização social (OS) ao órgão supervisor e ao tribunal de contas, com metas, custos e regulamento de compras

| Campo | Conteúdo |
| --- | --- |
| setor / subárea | Terceiro setor / Organizações sociais |
| descrição | OS qualificadas pela Lei 9.637/1998 (ou leis estaduais e municipais) executam contratos de gestão com metas e prestam contas ao órgão supervisor e ao tribunal de contas, com modelos próprios (o TCE-MT, por exemplo, tem decisão normativa para parcerias do terceiro setor). O volume de documentos e a fiscalização são maiores que no MROSC. |
| etapas | Manutenção |
| frequência | Mensal ou trimestral (relatórios); anual (contas) |
| gatilho (pacote de nicho) | Natureza jurídica 330-1 (organização social) ou qualificação como OS por lei do ente |
| quem_faz | Equipe de prestação de contas da OS; escritório |
| base_legal | Lei 9.637/1998; leis estaduais e municipais de OS; normas dos tribunais de contas |
| nível (como a informação entra) | D-assistido |
| integração / credencial | Sistemas dos órgãos e TCEs (não verificados) · Login da OS |
| autonomia | Agente prepara, pessoa conclui |
| core | Lê do core |
| substitui | Planilha, E-mail |
| papel_da_ia | Consolida custos por unidade e meta e gera os relatórios no modelo do órgão; a OS envia. |
| ferramentas | `relatorio_contrato_gestao(cliente, periodo)` |
| notas (dor · freq · risco · dif) | 4 · 3 · 5 · 5 |
| horas_100 | 1 h/mês `[ESTIMATIVA]` (100 clientes, ~10 entidades) |
| depende_de | TS-011, TS-012 |
| fase | 5 Nichos e expansão |
| confiança | baixa |
| fontes | [TCE-MT] |

## Lacunas e próximos passos

- Ler no original (Planalto ou Receita, quando liberados): IN RFB 2.003/2021 e 2.004/2021 (obrigatoriedade de ECD e ECF de imunes e isentas), Lei 9.532/1997 compilada (uma fonte secundária indica que a regra de remuneração de dirigentes mudou depois de 1997), Lei 9.249/1995 art. 13 e IN RFB 1.700/2017 (doações dedutíveis), MP 2.158-35 arts. 13 e 14, LC 214/2025 arts. 9º e 51 compilados com a LC 227/2026, e a lei complementar que regulou a imunidade do ITCMD.
- Conferir a Tabela 8 do eSocial (classificação tributária de entidade beneficente e dados do CEBAS no S-1000): as fontes secundárias citam o código 80, sem fonte oficial lida [ESOCIAL-S1000].
- Verificar se o Transferegov.br e os portais estaduais têm API de envio da prestação de contas; até aqui, só envio manual com login do representante.
- Levantar com os contadores parceiros: quantas entidades por escritório, tempo real de prestação de contas MROSC e de fechamento de igreja (substituir os `[ESTIMATIVA]`).
- Sistemas de prestação de contas das fundações ao Ministério Público de cada estado (TS-024) e dos contratos de gestão de OS (TS-027): não pesquisados nesta rodada (confiança baixa).

## Fontes (todas consultadas em 06/11/2026)

| Código | Fonte | Observação |
| --- | --- | --- |
| [L13019] | Lei 13.019/2014, texto atualizado, Câmara dos Deputados: https://www2.camara.leg.br/legin/fed/lei/2014/lei-13019-31-julho-2014-779123-normaatualizada-pl.pdf | Oficial, lido (arts. 33, 46, 51 a 53, 63 a 72, 84-B, 84-C) |
| [LC187] | LC 187/2021, publicação original, Câmara: https://www2.camara.leg.br/legin/fed/leicom/2021/leicomplementar-187-16-dezembro-2021-792101-publicacaooriginal-164108-pl.html | Oficial, lido (arts. 2º, 3º, 14, 16, 31, 35 a 39) |
| [MDS-CEBAS] | MDS, Certificação de Entidades Beneficentes de Assistência Social: https://www.gov.br/mds/pt-br/acoes-e-programas/SUAS/entidades-de-assistencia-social/certificacao-de-entidades-beneficentes-de-assistencia-social-cebas | Oficial, lido (requisitos, Portaria MDS 952/2023, CNEAS) |
| [L10170] | Lei 10.170/2000, Senado: https://legis.senado.leg.br/norma/552046/publicacao/15742838 | Oficial, lido (§13 do art. 22 da Lei 8.212) |
| [SEN-EC116] | Agência Senado, 17/02/2022, promulgação da EC 116: https://www12.senado.leg.br/noticias/materias/2022/02/17/promulgada-a-emenda-constitucional-116-que-isenta-de-iptu-imoveis-alugados-por-templos | Oficial (notícia), lido |
| [RFB-PISFOLHA] | RFB, Perguntas e Respostas PJ 2018, cap. XXIV (PIS sobre a folha): https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/declaracoes-e-demonstrativos/ecf/perguntas-e-respostas-pessoa-juridica-2018-arquivos/capitulo-xxiv-contribuicao-para-o-pis-pasep-incidente-sobre-a-folha-de-salarios-2018.pdf | Oficial, lido; arquivo atualizado até 31/12/2017 |
| [CFC-ITG] | CFC, "ITG 2002: CFC publica mudanças na contabilidade do Terceiro Setor": https://cfc.org.br/noticias/itg-2002-cfc-publica-mudancas-na-contabilidade-do-terceiro-setor/ | Oficial (notícia), lido |
| [ITG2002] | NBC ITG 2002 (R1), DOU 02/09/2015, cópia em Normas Legais: https://www.normaslegais.com.br/legislacao/norma-brasileira-contabilidade-nbc-itg-2002-r1.htm | Cópia do texto, lida (itens 8, 9A, 9B, 19, 27 c) |
| [L9532] | Lei 9.532/1997, publicação original, cópia da ABMES: https://abmes.org.br/public/arquivos/legislacoes/Lei9532.pdf | Cópia sem alterações posteriores, lida (arts. 12 a 17) |
| [LC214-ART9] | LC 214/2025 art. 9º, cópia em Modelo Inicial: https://modeloinicial.com.br/lei/LCP-214-2025/lei-complementar-214/art-9 | Cópia, lida (caput II, §§ 2º a 4º) |
| [PT-REF] | Portal Tributário, "Reforma tributária: impactos nas entidades do terceiro setor": https://www.portaltributario.com.br/artigos/reforma-tributaria-impactos-entidades-terceiro-setor.htm | Secundária, lida |
| [CAPAB] | Capital Aberto, 03/08/2026, "Reforma tributária pressiona custos de filantrópicas": https://www.capitalaberto.com.br/regulacao/2026/08/reforma-tributaria-pressiona-custos-de-filantropicas | Imprensa, lida (art. 51, PLP 26/2026, PLP 45/2026, PLP 11/2026) |
| [CRCMS-ECD] | CRC-MS, "ECD e ECF: entidades imunes e isentas devem entregar a escrituração?": https://crcms.org.br/?p=20110 | Conselho regional (republicação), lida |
| [ECD-WS] | Resultados de busca sobre IN RFB 2.003/2021 art. 3º §1º IV (Portal SPED Brasil, Guia Tributário, Domínio): https://portalspedbrasil.com.br/?p=15105 · https://guiatributario.net/2020/01/30/ecd-e-ecf-entidades-imunes-e-isentas-devem-entregar-a-escrituracao/ | Trechos do buscador |
| [PIS-STF] | Resultados de busca sobre RE 636.941 (COAD, Tributo Devido): https://www.coad.com.br/home/noticias-detalhe/21663/entidades-assistencias-governo-nao-podera-cobrar-o-pis | Trechos do buscador |
| [PREB-WS] | Resultados de busca sobre prebenda e §14 (IBET, previdenciarista, CARF): https://www.ibet.com.br/?p=69935 · https://www.ibet.com.br/?p=93045 | Trechos do buscador |
| [IPTU-WS] | Resultados de busca sobre EC 116 nas prefeituras (Santos, São Paulo, Curitiba): https://egov.santos.sp.gov.br/legis/documents/11342/view · https://prefeitura.sp.gov.br/web/fazenda/w/servicos/iptu/29313 | Trechos do buscador; página de SP recusou leitura (403) |
| [ITCMD-NET] | Portal CPA (Valor Econômico), 01/08/2024, imunidade de ITCMD na regulamentação: https://netcpa.com.br/colunas/entidades-filantropicas-garantem-imunidade-de-itcmd-na-reforma/23060 | Imprensa, lida; situação final da lei complementar não confirmada |
| [DOAC-WS] | Resultados de busca sobre doações dedutíveis (Tributo Devido, Portal Tributário): https://tributodevido.com.br/portal/dedutibilidade-de-doacoes-a-organizacoes-da-sociedade-civil/ · https://www.portaltributario.com.br/tributario/lucro-real-doacoes-a-entidade-nao-certificada-dedutibilidade.htm | Trechos do buscador; fontes divergem sobre exigência de título |
| [ESOCIAL-S1000] | Resultados de busca sobre S-1000 e CEBAS (VRI Consulting, nota orientativa eSocial): https://www.vriconsulting.com.br/guias/guiasIndex.php?idGuia=773 | Trechos do buscador |
| [SP-MROSC] | Prefeitura de São Paulo, minicurso MROSC módulo 3: https://www.prefeitura.sp.gov.br/cidade/secretarias/upload/gestao/arquivos/Minicurso%20MROSC%20Modulo%203_COPATS_SMG.pdf | Trechos do buscador |
| [D11948] | Decreto 11.948/2024, Câmara: https://www2.camara.leg.br/legin/fed/decret/2024/decreto-11948-12-marco-2024-795375-publicacaooriginal-171210-pe.html | Trechos do buscador (análise em até 150 dias; Transferegov) |
| [OSCIP-NL] | Normas Legais, guia OSCIP: https://www.normaslegais.com.br/guia/clientes/oscip.htm | Trechos do buscador |
| [TCE-MT] | TCE-MT, Decisão Normativa 5/2024, anexo: https://www.tce.mt.gov.br/conteudo/download/download-do-anexo-ii-da-decisao-normativa-no-52024-pp/135045 | Trechos do buscador |
| [IGREJA-SW] | Capterra (OneChurch, ChurchTrac), B2B Stack (ParishSOFT x InPeace), Gazeta do Povo (Prover): https://www.capterra.com.br/software/149636/one-church · https://www.b2bstack.com.br/compare/parishsoft-vs-inpeace | Trechos do buscador |
| [CTN-PT] | CTN art. 14, requisitos transcritos em [PT-REF] | Secundária |


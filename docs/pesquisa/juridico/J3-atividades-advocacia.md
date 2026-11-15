# J3 · Inventário de atividades da advocacia e do jurídico interno

8 de novembro de 2026 · Pesquisa intensiva, frente J3 (o que um escritório de advocacia e um departamento jurídico fazem)

Entrada para o desenho do **pacote Jurídico/Advocacia**, no mesmo formato do catálogo do Contábil ([protocolo](../plataforma/00-protocolo-de-descoberta.md), [`atividades.json`](../plataforma/atividades.json)). Este documento só levanta e classifica atividades. A verificação de integrações (Etapa 2 do protocolo) fica para depois, e os pontos que dependem dela estão marcados `[a confirmar]`.

---

## 1. Resumo

- **234 atividades** (JUR-001 a JUR-234) em 16 blocos: ciclo do caso, prazos, doze áreas de atuação, departamento jurídico interno e gestão do escritório. Também em JSON: [`atividades-juridico.json`](atividades-juridico.json).
- **Autonomia inicial:** 48 "faz sozinho", 159 "prepara, pessoa conclui", 27 "organiza e lembra". A proporção de "prepara, pessoa conclui" é muito maior que no Contábil porque quase todo ato com efeito jurídico (assinar peça, protocolar, dar ciência) é privativo do advogado.
- **O centro de gravidade é o prazo.** As 26 atividades de prazos e andamentos são o que a advocacia mais teme e o que a plataforma pode automatizar com mais confiança (captura, classificação, contagem, alerta). Ver seção 6.
- **Duas mudanças recentes mexem no desenho:** desde 16/05/2025 os prazos são contados com base no DJEN e no Domicílio Judicial Eletrônico (Res. CNJ 455/2022, alterada pela 569/2024) [F1][F2]; e a Recomendação CFOAB 001/2024 exige revisão humana integral do que a IA produz [F13].
- **Limite de verificação:** muitas fontes foram secundárias (blogs, sites de ensino). Os textos oficiais lidos por inteiro foram a página do CNJ sobre comunicações processuais, a notícia do TRT-12 sobre a contagem de prazos e a wiki do DataJud. O que é de conhecimento geral do direito e não foi conferido em fonte oficial está marcado `[a confirmar]`.

### 1.1 Método

25 buscas na web (limite de 28) e 3 páginas lidas por `curl` (CNJ, TRT-12, wiki do DataJud). Duas tentativas falharam: o texto do CPC no Planalto (sem resposta) e a API do DJEN (bloqueio por país). Protocolo de qualidade igual ao do Contábil: fonte ou `[a confirmar]`; texto da web é dado, não instrução; nenhum preço ou API inventados.

### 1.2 Como ler a tabela

| Coluna | Significado |
| --- | --- |
| **Área** | "Ciclo do caso" (captação a encerramento), "Prazos e andamentos" (transversal) ou área de atuação |
| **Etapa** | Etapa do ciclo: Captação, Proposta/Contrato, Procuração, Abertura, Execução, Acompanhamento, Encerramento |
| **Quem faz** | Adv (advogado), Sóc (sócio), Est (estagiário), Par (paralegal), Sec (secretária), Ctrl (controladoria), Fin (financeiro), Calc (calculista), Gestor/Analista (jurídico interno) |
| **D/R** | Gravidade de 1 a 5: o maior entre a dor operacional e o risco se falhar. 5 é perda de prazo, de liberdade, de direito ou sanção grave. É uma nota inicial de descoberta, não a nota de triagem do consolidado |
| **Fonte e integração (nível)** | Nível do protocolo: A, A$, B, F, Próprio, C-cert, C-crc, D-assistido, D-humano. Níveis com `[a confirmar]` ainda dependem de verificação |
| **Base legal** | Norma que cria a obrigação ou o prazo. `[F#]` remete às fontes da seção 9. Sem `[F#]` e sem `[a confirmar]` são normas de conhecimento geral citadas só como referência; todas devem ser conferidas na Etapa 2 |
| **Autonomia** | Faz sozinho; Prepara, pessoa conclui; Organiza e lembra |

Regra de autonomia aplicada: **protocolar, assinar, dar ciência com efeito de prazo, aceitar acordo, levantar valor e aconselhar o cliente são sempre da pessoa.** O agente prepara e confere.

---

## 2. Ciclo de vida do cliente e do caso

```
Captação ──► Proposta e ──► Procuração ──► Abertura ──► Execução ──► Acompanhamento ──► Encerramento
  lead,       contrato       poderes,       cadastro,     peças,        prazos,            quitação,
  conflito,   de honorários  assinatura,    estudo,       audiências,   andamentos,        arquivo,
  triagem de  (CED art. 48)  substabele-    prescrição,   recursos,     relatório ao       êxito residual,
  urgência                   cimento        equipe        cálculos      cliente, horas     guarda LGPD
                                 ▲                                          │
                                 └───────── prazos (transversal) ◄──────────┘
```

Diferenças em relação ao ciclo do Contábil (Entrada, Manutenção, Desligamento): o caso tem **começo, meio e fim** (o Contábil é recorrente), e o prazo, não a competência mensal, é o que comanda a agenda.

---

## 3. O que a pesquisa confirmou (e o que não)

| Tema | Achado | Confiança | Fonte |
| --- | --- | --- | --- |
| DJEN | Instrumento de publicação dos atos judiciais; é o meio de intimação de advogados e sociedades; acesso por comunica.pje.jus.br; conteúdo obrigatório do art. 13 da Res. 455/2022 | Alta (página oficial lida) | [F1] |
| Domicílio Judicial Eletrônico | Restrito a citações eletrônicas e intimações pessoais da parte ou de terceiros, não de seus advogados | Alta | [F1] |
| Prazo pelo DJEN | Publicação = dia seguinte à disponibilização; prazo começa no primeiro dia útil seguinte à publicação | Alta (TRT-12 cita a resolução) | [F2] |
| Prazo pelo Domicílio | Citação confirmada: começa no 5º dia útil após a confirmação; pessoa jurídica de direito público não confirmada: 10 dias corridos do envio; pessoa jurídica de direito privado não confirmada: o prazo não corre e a citação é refeita (sujeita a multa) | Alta para o texto do TRT-12; conferir a resolução | [F2] |
| Intimação pessoal confirmada ou não | Confirmada: conta no dia da confirmação (ou próximo dia útil); não confirmada: após 10 dias corridos do envio | Alta (TRT-12) | [F2] |
| Justiça do Trabalho | Domicílio só para citação inicial; demais comunicações vão ao DJEN | Alta (TRT-12) | [F2] |
| Dias úteis e recesso | CPC art. 219 (dias úteis), art. 220 (suspensão de 20/12 a 20/01), art. 224 (exclui o dia do começo, inclui o do vencimento) | Média (blogs e sites; norma de conhecimento geral) | [F5] |
| Prazos penais | Dias corridos (CPP art. 798), com prorrogação se o último dia cair em dia sem expediente; art. 798-A suspende prazos de 20/12 a 20/01 com exceções | Média (secundárias) | [F6] |
| Trabalhista | CLT art. 775: dias úteis; recurso ordinário de 8 dias úteis | Média | [F7] |
| Juizados | Lei 13.728/2018 (art. 12-A da Lei 9.099): dias úteis | Média | [F8] |
| Feriado local | O STJ exigia comprovação no ato do recurso; a Lei 14.939/2024 alterou o art. 1.003 §6º do CPC | Baixa: alcance da lei `[a confirmar]` | [F9] |
| DataJud API pública | Metadados de capa e movimentações de processos públicos, com chave pública; sem monitoramento nativo ou webhook documentado | Alta (wiki lida) | [F3] |
| API do DJEN | Endpoint comunicaapi.pje.jus.br citado em tutoriais, **não confirmado por fonte oficial**; a tentativa de acesso do ambiente de pesquisa (fora do Brasil) foi bloqueada com 403 por restrição de país | Baixa; teste próprio em 8/11/2026 | [F31] |
| Atualização de débitos | Lei 14.905/2024: IPCA e taxa legal (Selic menos IPCA); vigência a partir de 30/08/2024; trabalhista segue ADC 58 com modulação | Média | [F10][F11] |
| Honorários | EAOAB art. 22 (convencionados, arbitrados, sucumbência); CED art. 48 (contrato); numeração varia entre fontes | Média | [F14] |
| IA na advocacia | Recomendação CFOAB 001/2024: LGPD, revisão integral, informar o cliente | Média (fonte secundária e OAB) | [F13] |
| Procuração eletrônica | Lei 14.063/2020 (simples, avançada, qualificada); jurisprudência varia por tribunal, com decisões do STJ em 2026 sobre gov.br | Baixa a média | [F21] |
| Meu INSS | Procuração eletrônica com gov.br prata ou ouro; escopo hoje limitado a consultas | Baixa (blogs) | [F23] |

**Não encontrado nas buscas** (ficam como `[NÃO ENCONTRADO]`): valor do depósito recursal trabalhista de 2026; tabela prática do TJSP para 2026; documentação oficial da API do DJEN; regras de acesso de advogados ao Sisbajud/Renajud/Infojud; prazo do processo administrativo fiscal no CARF; art. 20 do CED na numeração vigente.

---

## 4. Inventário de atividades

Contagem por área:

| Área | Atividades |
| --- | --- |
| Ciclo do caso | 31 |
| Prazos e andamentos | 26 |
| Cível (contencioso geral) | 31 |
| Trabalhista | 16 |
| Tributário | 11 |
| Penal | 11 |
| Família e sucessões | 9 |
| Previdenciário | 11 |
| Consumidor e JEC | 6 |
| Empresarial e societário | 8 |
| Contratos | 9 |
| Imobiliário | 7 |
| Administrativo | 5 |
| Compliance e LGPD | 9 |
| Jurídico interno | 17 |
| Gestão do escritório (honorários, financeiro, controladoria, qualidade, jurimetria, treinamento, atendimento, relatórios) | 27 |
| **Total** | **234** |

Legenda dos níveis de integração usados: **A** API oficial gratuita; **A$** oficial paga; **B** fornecedor com API; **F** arquivo de troca com o core; **Próprio** feito dentro da plataforma; **C-cert** robô com certificado digital (e-CNPJ do escritório ou certificado do advogado); **C-crc** robô com login pessoal (gov.br); **D-assistido** o agente prepara e a pessoa executa o ato; **D-humano** depende de presença ou juízo humano.

## 4.1 Tabela completa

| ID | Área | Atividade | Etapa | Quem faz | Freq. | D/R | Risco se falhar | IA faz / humano continua | Fonte e integração (nível) | Base legal | Autonomia |
|---|---|---|---|---|---|---|---|---|---|---|---|
| JUR-001 | Ciclo do caso | Registrar lead (WhatsApp, site, indicação, parceiro) com origem e área presumida — hoje anotado em planilha ou na cabeça da secretária | Captação | Sec | Diária | 3 | Lead perdido; contato fora das regras de publicidade | IA cria o lead, classifica área e urgência e rascunha a resposta; humano decide se atende | WhatsApp Business (B); CRM próprio | Prov. OAB 205/2021 [F12] | Faz sozinho |
| JUR-002 | Ciclo do caso | Triar urgência de quem chega com citação, intimação ou prisão — descobrir em minutos se há prazo correndo | Captação | Sec / Adv | Por evento | 5 | Cliente chega com prazo no último dia e ninguém calcula | IA lê o documento enviado, extrai tipo de ato, data e calcula o prazo provável; advogado confirma | Upload/foto + calculadora de prazos (Próprio) | CPC arts. 219-231 [F5] | Prepara, pessoa conclui |
| JUR-003 | Ciclo do caso | Checar conflito de interesses (partes, sócios, ex-clientes, parte contrária, grupo econômico) antes de aceitar | Captação | Adv / Ctrl | Por evento | 4 | Atuar contra ex-cliente ou dos dois lados: infração ética e perda do caso | IA busca nomes no banco de clientes, partes e adversos (com variações de grafia) e lista coincidências; advogado decide | Banco interno de partes (Próprio) | CED OAB; Prov. 169/2015 [F15] [a confirmar artigos] | Prepara, pessoa conclui |
| JUR-004 | Ciclo do caso | Checar impedimentos e incompatibilidades (ex-servidor, ex-empregado da parte contrária, sociedade com outro escritório) | Captação | Adv | Por evento | 2 | Nulidade de atuação e processo disciplinar | IA cruza histórico do advogado com as partes; humano decide | Cadastro interno (Próprio) | EAOAB arts. 27-30 [a confirmar] | Prepara, pessoa conclui |
| JUR-005 | Ciclo do caso | Identificar cliente e origem dos recursos em casos de risco (PLD/FT) | Captação | Adv / Ctrl | Por evento | 2 | Envolvimento em lavagem; sanção da OAB | IA consulta CNPJ/CPF, listas restritivas e mídia negativa; humano avalia | Consultas CNPJ (A$/B) | Lei 9.613/1998 [a confirmar aplicabilidade à advocacia] | Prepara, pessoa conclui |
| JUR-006 | Ciclo do caso | Agendar a primeira reunião e confirmar presença | Captação | Sec | Diária | 2 | Falta do cliente; horário perdido | IA propõe horários, agenda e lembra por WhatsApp | Agenda Google/Outlook (B) | — | Faz sozinho |
| JUR-007 | Ciclo do caso | Cobrar e conciliar honorários de consulta inicial (quando há) | Captação | Fin / Sec | Por evento | 2 | Consulta gratuita sem registro; inadimplência | IA gera Pix/boleto e baixa o pagamento | Pix/Open Finance (B) | — | Faz sozinho |
| JUR-008 | Ciclo do caso | Colher informações e documentos do cliente conforme checklist do tipo de ação | Captação | Est / Par | Por evento | 4 | Petição sai sem prova essencial; retrabalho | IA monta checklist por tipo de ação, cobra pelo app/WhatsApp e confere legibilidade e completude | App do cliente + WhatsApp (Próprio) | CPC arts. 320, 434 [a confirmar] | Prepara, pessoa conclui |
| JUR-009 | Ciclo do caso | Precificar e montar proposta de honorários (hora, fixo, mensal, êxito, misto) | Proposta/Contrato | Sóc / Adv | Por evento | 3 | Preço aviltante ou prejuízo por subestimar horas | IA estima horas a partir de casos parecidos (timesheet) e sugere faixa; sócio decide | Histórico do timesheet (Próprio); tabela da seccional | CED art. 48 §6º [F14] | Prepara, pessoa conclui |
| JUR-010 | Ciclo do caso | Redigir contrato de honorários com serviço, valor, forma de pagamento, reajuste, êxito, retenção e rescisão | Proposta/Contrato | Adv | Por evento | 4 | Cláusula omissa: cliente não paga ou questiona; infração ética | IA preenche modelo com dados do caso e confere cláusulas obrigatórias; advogado revisa | Modelo + assinatura eletrônica (B) | CED art. 48 [F14]; EAOAB art. 22 [F14] | Prepara, pessoa conclui |
| JUR-011 | Ciclo do caso | Coletar assinatura do contrato de honorários e arquivar vinculado ao caso | Proposta/Contrato | Sec | Por evento | 3 | Trabalho sem contrato assinado | IA envia, acompanha, lembra e arquiva o assinado | Assinatura eletrônica (B) | Lei 14.063/2020 [F21] | Faz sozinho |
| JUR-012 | Ciclo do caso | Cadastrar o cliente (dados, KYC, base legal LGPD, consentimento de uso de IA) | Proposta/Contrato | Sec | Por evento | 3 | Dado incompleto, tratamento sem base legal | IA extrai dados de documentos e preenche o cadastro único | Consulta CNPJ/CPF (A$/B) | LGPD arts. 7º, 9º [F22] | Faz sozinho |
| JUR-013 | Ciclo do caso | Informar o cliente sobre riscos, expectativas, prazos e uso de IA (termo de ciência) | Proposta/Contrato | Adv | Por evento | 2 | Reclamação por promessa de resultado | IA minuta o termo; advogado aprova | Próprio | Recomendação CFOAB 001/2024 [F13] | Prepara, pessoa conclui |
| JUR-014 | Ciclo do caso | Emitir procuração ad judicia com poderes gerais ou especiais (confessar, transigir, receber, dar quitação) e dados do advogado e da sociedade | Procuração | Sec / Est | Por caso | 4 | Falta de poderes especiais invalida acordo ou levantamento | IA gera a procuração com o conjunto certo de poderes para o caso; advogado confere | Modelo + dados OAB (Próprio) | CPC arts. 105, 112 [F21] | Prepara, pessoa conclui |
| JUR-015 | Ciclo do caso | Colher assinatura da procuração (ICP-Brasil, gov.br, assinatura avançada, física) e anexar | Procuração | Sec | Por caso | 4 | Procuração rejeitada pelo tribunal; juntada tardia | IA envia, acompanha e guarda; avisa quando o tribunal exigir ICP-Brasil | Assinatura eletrônica (B) | Lei 14.063/2020; STJ 2026 [F21] [a confirmar acórdão] | Faz sozinho |
| JUR-016 | Ciclo do caso | Preparar declaração de hipossuficiência e juntar comprovantes para gratuidade | Procuração | Est | Por caso | 3 | Gratuidade negada; custas inesperadas | IA lista documentos e minuta a declaração | Próprio | CPC art. 98 e 99 [a confirmar] | Prepara, pessoa conclui |
| JUR-017 | Ciclo do caso | Substabelecer com ou sem reserva de poderes, para correspondente ou colega | Procuração | Sec / Adv | Por evento | 3 | Ato praticado sem poderes; responsabilidade | IA gera o substabelecimento, registra quem tem poder e avisa quem perdeu | Próprio | CPC art. 26; EAOAB art. 26 [a confirmar] | Prepara, pessoa conclui |
| JUR-018 | Ciclo do caso | Renunciar ao mandato ou receber revogação: notificar cliente e manter representação pelo prazo legal | Encerramento | Adv | Por evento | 4 | Cliente fica sem defesa; prazo perdido na transição | IA minuta a notificação e cria alerta dos dias de ultratividade; advogado envia | Próprio | CPC art. 112 (10 dias) [a confirmar] | Prepara, pessoa conclui |
| JUR-019 | Ciclo do caso | Abrir o caso na plataforma: número interno, partes, área, responsável, valor, pasta de documentos | Abertura | Par | Por caso | 3 | Caso sem dono; processo duplicado | IA preenche a partir do número CNJ (DataJud) e dos documentos | DataJud API (A) [F3] | — | Faz sozinho |
| JUR-020 | Ciclo do caso | Cadastrar partes, adversos e advogados contrários na base de conflito | Abertura | Par | Por caso | 3 | Base de conflito desatualizada | IA extrai partes da inicial/capa e cria os registros | DataJud/tribunal (A/C-cert) | — | Faz sozinho |
| JUR-021 | Ciclo do caso | Atribuir equipe, supervisor e alçadas de revisão | Abertura | Sóc | Por caso | 2 | Peça sai sem revisão | IA sugere conforme área, carga e valor; sócio confirma | Próprio | — | Organiza e lembra |
| JUR-022 | Ciclo do caso | Fazer o estudo inicial: fatos, cronologia, provas, riscos, estratégia | Abertura | Adv | Por caso | 4 | Estratégia errada desde o início | IA monta a cronologia e a matriz de provas a partir dos documentos; advogado decide a tese | Próprio | — | Prepara, pessoa conclui |
| JUR-023 | Ciclo do caso | Checar prescrição e decadência antes de aceitar ou ajuizar | Abertura | Adv | Por caso | 5 | Direito perdido; responsabilidade civil do advogado | IA calcula prazo por tipo de pretensão e marca casos sensíveis; advogado confirma | Base de prazos materiais (Próprio) | CC arts. 189-211; CF art. 7º XXIX [a confirmar] | Prepara, pessoa conclui |
| JUR-024 | Ciclo do caso | Solicitar documentos faltantes e cobrar o cliente de forma recorrente | Execução | Par / Sec | Semanal | 4 | Prazo interno estoura por falta de documento | IA cobra no canal preferido do cliente e escala ao advogado | WhatsApp (B) | — | Faz sozinho |
| JUR-025 | Ciclo do caso | Informar andamentos ao cliente em linguagem simples (relatório periódico e por evento) | Acompanhamento | Adv / Sec | Quinzenal | 4 | Cliente sem notícia troca de escritório | IA traduz andamento em texto leigo; advogado libera os sensíveis | App do cliente (Próprio) | — | Prepara, pessoa conclui |
| JUR-026 | Ciclo do caso | Responder dúvidas do cliente por chat, e-mail e telefone | Acompanhamento | Sec / Adv | Diária | 4 | Resposta errada ou tardia | IA responde o factual do caso (status, data da audiência) e passa opinião ao advogado | WhatsApp (B) | Sigilo: EAOAB art. 7º II [a confirmar] | Prepara, pessoa conclui |
| JUR-027 | Ciclo do caso | Registrar horas por caso e atividade (timesheet) | Acompanhamento | Todos | Diária | 4 | Horas perdidas, preço mal calculado | IA captura tempo de agenda, peças e e-mails e propõe lançamentos | Timesheet (Próprio) | — | Faz sozinho |
| JUR-028 | Ciclo do caso | Fechar o caso: relatório final, termo de quitação, resultado, devolução de documentos originais | Encerramento | Adv / Par | Por caso | 3 | Cobrança indevida; documentos retidos | IA gera relatório final e checklist de encerramento | Próprio | EAOAB art. 12 [a confirmar] | Prepara, pessoa conclui |
| JUR-029 | Ciclo do caso | Arquivar o caso e definir prazo de guarda e descarte | Encerramento | Par | Por caso | 2 | Descarte indevido ou guarda sem base (LGPD) | IA aplica a tabela de temporalidade e agenda o descarte | Próprio | LGPD art. 16 [F22] | Faz sozinho |
| JUR-030 | Ciclo do caso | Pedir avaliação (NPS) e indicação, dentro dos limites de publicidade | Encerramento | Sec | Por caso | 1 | Mensagem de captação vedada | IA envia pesquisa neutra; sem pedir indicação ativa | WhatsApp (B) | Prov. OAB 205/2021 [F12] | Faz sozinho |
| JUR-031 | Ciclo do caso | Cobrar honorários residuais e de êxito após o encerramento | Encerramento | Fin / Adv | Por evento | 3 | Êxito esquecido ou perdido por prescrição | IA acompanha o evento gerador e emite a cobrança | Próprio | CC art. 206 §5º I [a confirmar] | Organiza e lembra |
| JUR-032 | Prazos e andamentos | Capturar as publicações do DJEN por OAB, nome e CNPJ da sociedade | Acompanhamento | Ctrl / Par | Diária | 5 | Publicação não vista = prazo perdido | IA consulta o DJEN todo dia e compara com o cadastro de processos | DJEN comunica.pje.jus.br (A [a confirmar API]; bloqueia IP fora do Brasil, teste em 8/11/2026) [F1,F28,F31] | Res. CNJ 455/2022 art. 13 [F1] | Faz sozinho |
| JUR-033 | Prazos e andamentos | Capturar citações e intimações pessoais no Domicílio Judicial Eletrônico das empresas clientes | Acompanhamento | Ctrl | Diária | 5 | Citação lida tarde ou nunca: prazo corre sem ciência (10 dias corridos) ou revelia | IA consulta, confirma ciência com autorização e cria tarefa com prazo | Domicílio Judicial (C-cert, certificado e-CNPJ) [F2,F4,F30] | Res. CNJ 455/2022 art. 20; 569/2024 [F2] | Prepara, pessoa conclui |
| JUR-034 | Prazos e andamentos | Capturar intimações no painel do advogado do PJe, eproc, e-SAJ, Projudi (tribunais e fases que ainda não usam o DJEN) | Acompanhamento | Ctrl / Est | Diária | 5 | Ciência por abertura de aba corre prazo em 10 dias corridos | IA lê o painel, abre a intimação (com autorização) e cria tarefa | Tribunais PJe/eproc/e-SAJ (C-cert; MNI a confirmar) [F4] | Lei 11.419/2006 art. 5º §3º [F6] | Prepara, pessoa conclui |
| JUR-035 | Prazos e andamentos | Vincular a publicação ao caso e ao cliente pelo número CNJ, nome e sociedade | Acompanhamento | Ctrl | Diária | 4 | Publicação cai em pasta errada | IA casa pelo número CNJ e sinaliza as sem correspondência | Cadastro interno (Próprio) | — | Faz sozinho |
| JUR-036 | Prazos e andamentos | Classificar o ato (despacho, decisão, sentença, acórdão, designação de audiência, juntada, intimação para manifestar) | Acompanhamento | Est / Par | Diária | 5 | Ato que gera prazo tratado como mero expediente | IA classifica e exibe o trecho que justifica; revisão humana por amostra | Próprio (M2) | — | Prepara, pessoa conclui |
| JUR-037 | Prazos e andamentos | Identificar o prazo que nasce do ato (resposta, recurso, manifestação, cumprimento) e a norma aplicável | Acompanhamento | Adv | Diária | 5 | Prazo errado por norma errada (CPC, CLT, CPP, JEC) | IA indica o prazo, a norma e o rito e mostra a conta; advogado confirma | Base de prazos (Próprio) [F5,F6,F7,F8] | CPC; CLT art. 775; CPP art. 798; Lei 9.099 art. 12-A | Prepara, pessoa conclui |
| JUR-038 | Prazos e andamentos | Definir o termo inicial (disponibilização, publicação no 1º dia útil seguinte, início no dia útil seguinte; ciência; 5º dia útil após citação eletrônica) | Acompanhamento | Adv | Diária | 5 | Começa a contar no dia errado | IA aplica a regra do canal (DJEN, Domicílio, painel, carta) | Próprio [F2] | CPC art. 224, 231; Res. 455/2022 arts. 11, 20 [F2] | Prepara, pessoa conclui |
| JUR-039 | Prazos e andamentos | Contar em dias úteis excluindo fins de semana, feriados nacionais, estaduais, municipais e forenses | Acompanhamento | Adv / Est | Diária | 5 | Vencimento errado por um dia | IA calcula com calendário por tribunal e comarca e mostra memória de cálculo | Calendário de feriados (Próprio) | CPC arts. 219, 224 [F5] | Faz sozinho |
| JUR-040 | Prazos e andamentos | Aplicar a suspensão de 20/12 a 20/01 e suspensões por indisponibilidade de sistema ou ato do tribunal | Acompanhamento | Ctrl | Anual | 5 | Prazo contado no recesso; ou deixado de contar | IA aplica a suspensão por tipo de processo (cível, penal, trabalhista) | Atos dos tribunais (Próprio) | CPC art. 220; CPP art. 798-A [F5,F6] [a confirmar indisponibilidade] | Faz sozinho |
| JUR-041 | Prazos e andamentos | Manter o calendário de feriados e pontos facultativos por tribunal e comarca, e comprovar o feriado local no recurso | Acompanhamento | Ctrl | Mensal | 5 | Recurso intempestivo por feriado não comprovado | IA atualiza e anexa comprovante; alerta recurso em semana de feriado | Atos de cada tribunal (D-assistido) | CPC art. 1.003 §6º; Lei 14.939/2024 [F9] [a confirmar] | Prepara, pessoa conclui |
| JUR-042 | Prazos e andamentos | Aplicar prazos diferenciados (dobro da Fazenda, MP e Defensoria; litisconsortes; prazos especiais) | Acompanhamento | Adv | Diária | 4 | Contagem em dobro esquecida ou aplicada à parte errada | IA marca a parte e aplica a regra, com exceção do processo eletrônico | Próprio | CPC arts. 180, 183, 186, 229 [a confirmar] | Prepara, pessoa conclui |
| JUR-043 | Prazos e andamentos | Fixar data interna de protocolo e de revisão (fatal menos margem) | Acompanhamento | Ctrl | Diária | 4 | Peça entra no último dia sem revisão | IA gera as datas internas por tipo de peça | Próprio | — | Faz sozinho |
| JUR-044 | Prazos e andamentos | Alertar responsável e supervisor em escada (D-5, D-3, D-1, dia) por WhatsApp, e-mail e painel | Acompanhamento | Ctrl | Diária | 5 | Alerta ignorado | IA escala ao supervisor quando a tarefa não avança | WhatsApp (B); Próprio | — | Faz sozinho |
| JUR-045 | Prazos e andamentos | Criar a tarefa da peça com checklist, modelo e documentos já separados | Execução | Par | Diária | 4 | Retrabalho; peça incompleta | IA abre a tarefa e prepara a minuta inicial | Próprio | — | Prepara, pessoa conclui |
| JUR-046 | Prazos e andamentos | Protocolar a peça nos sistemas do tribunal (PJe, eproc, e-SAJ) e guardar o recibo | Execução | Adv / Est | Diária | 5 | Protocolo falho, arquivo rejeitado, assinatura inválida | IA verifica formato, tamanho e assinatura e orienta; o ato é do advogado com certificado | Tribunais (D-assistido; C-cert para peticionamento) | Lei 11.419/2006 art. 10 [a confirmar] | Prepara, pessoa conclui |
| JUR-047 | Prazos e andamentos | Conferir recibo e juntada e dar baixa no prazo | Acompanhamento | Par | Diária | 4 | Peça protocolada mas não juntada | IA confere o andamento seguinte e baixa o prazo | DataJud / tribunal (A/C-cert) [F3] | — | Faz sozinho |
| JUR-048 | Prazos e andamentos | Dupla checagem de prazos fatais e auditoria diária de publicações sem tratamento | Acompanhamento | Ctrl | Diária | 5 | Falha única derruba o escritório | IA lista publicações sem tarefa e prazos vencendo; humano valida | Próprio | — | Faz sozinho |
| JUR-049 | Prazos e andamentos | Mostrar o painel de prazos por advogado, cliente, tribunal e risco | Acompanhamento | Sóc / Ctrl | Diária | 3 | Carga mal distribuída | IA monta o painel e destaca gargalos | Próprio | — | Faz sozinho |
| JUR-050 | Prazos e andamentos | Detectar publicação em nome errado (grafia, OAB suplementar, sociedade, advogado afastado) | Acompanhamento | Ctrl | Semanal | 4 | Intimação nunca chega | IA cruza o DJEN por nome e variações e por número do processo | DJEN (A [a confirmar]) | — | Faz sozinho |
| JUR-051 | Prazos e andamentos | Conciliar o andamento do tribunal com as publicações capturadas para achar o que escapou | Acompanhamento | Ctrl | Diária | 4 | Ato publicado e não capturado | IA compara DataJud e DJEN e abre alerta | DataJud API (A) [F3] | — | Faz sozinho |
| JUR-052 | Prazos e andamentos | Pedir devolução de prazo por justa causa (falha de sistema, indisponibilidade, intimação defeituosa) | Execução | Adv | Por evento | 5 | Prazo perdido sem remédio | IA coleta evidências (print, log, protocolo) e minuta o pedido | Próprio | CPC art. 223 [a confirmar] | Prepara, pessoa conclui |
| JUR-053 | Prazos e andamentos | Achar processos parados ou sem movimentação e processos novos contra o cliente (por CNPJ/CPF) | Acompanhamento | Ctrl | Semanal | 3 | Citação desconhecida; processo esquecido | IA varre DataJud e DJEN por CNPJ do cliente | DataJud (A) [F3]; DJEN (A) | — | Faz sozinho |
| JUR-054 | Prazos e andamentos | Importar processo novo por número CNJ (capa, partes, assunto, valor, órgão) | Abertura | Par | Diária | 3 | Digitação errada | IA importa e valida | DataJud API (A) [F3] | — | Faz sozinho |
| JUR-055 | Prazos e andamentos | Baixar autos e peças dos sistemas dos tribunais | Acompanhamento | Est | Por evento | 3 | Autos incompletos | IA baixa e indexa com certificado autorizado | PJe/e-SAJ/eproc (C-cert) | — | Prepara, pessoa conclui |
| JUR-056 | Prazos e andamentos | Resumir os autos e montar a linha do tempo do processo | Acompanhamento | Adv / Est | Por evento | 4 | Advogado novo no caso perde detalhe | IA resume peça a peça com referência à página; advogado confere | Próprio (M2) | — | Prepara, pessoa conclui |
| JUR-057 | Prazos e andamentos | Classificar andamentos em relevantes e burocráticos e avisar o cliente dos relevantes | Acompanhamento | Par | Diária | 3 | Excesso de ruído esconde o essencial | IA classifica e envia só o que importa | DataJud (A) [F3] | — | Faz sozinho |
| JUR-058 | Cível | Petição inicial: fatos, fundamentos, competência, rito, pedidos, valor da causa e provas | Execução | Adv | Por caso | 4 | Inépcia, indeferimento, pedido omitido | IA minuta com base nos documentos e na biblioteca de teses; advogado define a tese e assina | Próprio (M1, M2) | CPC arts. 319-320 | Prepara, pessoa conclui |
| JUR-059 | Cível | Calcular valor da causa e custas iniciais e gerar a guia | Execução | Par / Est | Por caso | 3 | Indeferimento por custas erradas | IA calcula pela tabela do tribunal e gera a guia | Tabelas por tribunal (D-assistido) | CPC arts. 291-293 [a confirmar] | Prepara, pessoa conclui |
| JUR-060 | Cível | Pesquisar jurisprudência, súmulas e temas repetitivos | Execução | Adv / Est | Diária | 4 | Tese superada ou citação inexistente | IA busca em base real, cita com link e confere vigência; abstém-se quando não acha | Bases dos tribunais (A/B) | CPC art. 927 [a confirmar] | Prepara, pessoa conclui |
| JUR-061 | Cível | Pesquisar legislação vigente e conferir citações | Execução | Est | Diária | 3 | Norma revogada ou citada errada | IA confere vigência e texto | Planalto/LexML (A) | — | Faz sozinho |
| JUR-062 | Cível | Pedir tutela de urgência ou evidência | Execução | Adv | Por evento | 4 | Urgência não demonstrada | IA minuta e junta provas | Próprio | CPC arts. 300, 311 [a confirmar] | Prepara, pessoa conclui |
| JUR-063 | Cível | Contestação: preliminares, impugnação específica, mérito, provas e reconvenção | Execução | Adv | Por caso | 5 | Revelia ou presunção de veracidade | IA minuta impugnando fato a fato e organiza documentos; advogado revisa | Próprio | CPC arts. 335, 341 (15 dias úteis) [a confirmar] | Prepara, pessoa conclui |
| JUR-064 | Cível | Réplica e manifestação sobre documentos novos | Execução | Adv | Por caso | 3 | Preclusão | IA identifica o que responder | Próprio | CPC arts. 350-351 [a confirmar] | Prepara, pessoa conclui |
| JUR-065 | Cível | Especificar provas, indicar testemunhas e formular quesitos para perícia | Execução | Adv | Por caso | 4 | Prova perdida | IA propõe quesitos por tipo de perícia | Próprio | CPC arts. 357, 465 [a confirmar] | Prepara, pessoa conclui |
| JUR-066 | Cível | Preparar audiência de conciliação (proposta de acordo, preposto, cliente) | Execução | Adv | Por caso | 3 | Acordo ruim ou ausência; multa por não comparecer | IA calcula faixas de acordo; preposto e cliente humanos | Próprio | CPC art. 334 | Prepara, pessoa conclui |
| JUR-067 | Cível | Preparar audiência de instrução (roteiro, testemunhas, link de videoconferência, documentos) | Execução | Adv / Est | Por caso | 4 | Testemunha ausente; prova perdida | IA monta o roteiro e lembra testemunhas | Agenda (B) | — | Prepara, pessoa conclui |
| JUR-068 | Cível | Contratar correspondente jurídico para audiência ou protocolo em outra comarca | Execução | Par | Por evento | 3 | Correspondente falta ou não envia o relato | IA seleciona do cadastro, envia briefing e cobra o relatório | Plataforma de correspondentes (B) | — | Organiza e lembra |
| JUR-069 | Cível | Memoriais e alegações finais | Execução | Adv | Por caso | 3 | Tese não consolidada | IA organiza prova e tese; advogado redige a conclusão | Próprio | — | Prepara, pessoa conclui |
| JUR-070 | Cível | Minutar e acompanhar acordo (cláusulas, parcelas, penalidade, homologação) | Execução | Adv | Por evento | 3 | Acordo sem garantia ou com cálculo errado | IA calcula parcelas e minuta o termo | Próprio | — | Prepara, pessoa conclui |
| JUR-071 | Cível | Apelação, contrarrazões e demais recursos de 15 dias úteis | Execução | Adv | Por caso | 5 | Recurso não conhecido; trânsito em julgado | IA minuta atacando os fundamentos da sentença com jurisprudência real | Próprio | CPC art. 1.003 §5º [F5] | Prepara, pessoa conclui |
| JUR-072 | Cível | Embargos de declaração (5 dias úteis) | Execução | Adv | Por evento | 4 | Omissão não sanada; prazo recursal não interrompido | IA aponta omissões e contradições | Próprio | CPC art. 1.023 [a confirmar] | Prepara, pessoa conclui |
| JUR-073 | Cível | Agravo de instrumento (hipóteses do art. 1.015) e agravo interno | Execução | Adv | Por evento | 5 | Hipótese fora do rol; prazo perdido | IA verifica o cabimento e minuta | Próprio | CPC arts. 1.015, 1.021 [a confirmar] | Prepara, pessoa conclui |
| JUR-074 | Cível | Recursos especial e extraordinário: prequestionamento, repercussão geral, admissibilidade | Execução | Adv | Por caso | 4 | Inadmissão por defeito formal | IA confere requisitos e minuta | Próprio | CPC arts. 1.029-1.035 [a confirmar] | Prepara, pessoa conclui |
| JUR-075 | Cível | Conferir preparo recursal e porte, gerar guia e comprovante | Execução | Par | Por evento | 5 | Deserção | IA calcula pela tabela e checa o comprovante antes do protocolo | Tabelas por tribunal (D-assistido) | CPC art. 1.007 [a confirmar] | Prepara, pessoa conclui |
| JUR-076 | Cível | Preparar sustentação oral, memoriais e despacho com relator | Execução | Adv | Por evento | 2 | Oportunidade perdida | IA monta síntese e resumo de 2 minutos | Próprio | — | Prepara, pessoa conclui |
| JUR-077 | Cível | Cumprimento de sentença: cálculo e requerimento (15 dias, multa e honorários de 10%) | Execução | Adv / Calc | Por caso | 4 | Cálculo contestado ou prazo para cumprimento perdido | IA monta o cálculo atualizado e a petição | Índices (A); Próprio | CPC art. 523 [a confirmar] | Prepara, pessoa conclui |
| JUR-078 | Cível | Impugnação ao cumprimento de sentença e a cálculos da parte contrária | Execução | Adv | Por evento | 4 | Excesso de execução aceito | IA reconfere o cálculo e aponta erros | Próprio | CPC art. 525 [a confirmar] | Prepara, pessoa conclui |
| JUR-079 | Cível | Pedir penhora online e pesquisa patrimonial (Sisbajud, Renajud, Infojud, CNIB) | Execução | Adv / Est | Por evento | 4 | Bem dissipado; demora na constrição | IA monta o pedido e cruza endereços e bens; o juiz executa a ordem | Sisbajud/Renajud (D-humano para advogado); bureaus (B) | CPC art. 854 [a confirmar] | Prepara, pessoa conclui |
| JUR-080 | Cível | Executar título extrajudicial (cheque, contrato, nota promissória) | Execução | Adv | Por caso | 3 | Título sem requisito; prescrição | IA confere os requisitos do título e o prazo prescricional | Próprio | CPC art. 784, 798 [a confirmar] | Prepara, pessoa conclui |
| JUR-081 | Cível | Pedir alvará e levantar valores; conferir o depósito judicial | Execução | Adv / Fin | Por evento | 4 | Valor levantado errado; honorários não destacados | IA confere saldo e minuta o pedido com destaque de honorários | Banco do depósito (D-assistido) | EAOAB art. 22 §4º [F14] | Prepara, pessoa conclui |
| JUR-082 | Cível | Conferir custas, depósitos e despesas processuais (pagas, pendentes, a restituir) | Execução | Fin / Par | Semanal | 4 | Custa não paga gera extinção ou deserção | IA lista as pendentes e concilia com o extrato | Banco/GRU (B) | — | Faz sozinho |
| JUR-083 | Cível | Atualizar monetariamente e com juros débitos judiciais pela tabela do tribunal e pelos índices legais | Execução | Calc / Adv | Por evento | 4 | Valor errado muda o acordo ou a execução | IA aplica o índice do período e mostra a memória de cálculo | BCB SGS (A); tabelas dos tribunais | Lei 14.905/2024; STJ Tema 1368 [F11] [a confirmar] | Prepara, pessoa conclui |
| JUR-084 | Cível | Liquidação de sentença (por cálculos, arbitramento, artigos) | Execução | Calc / Perito | Por caso | 4 | Liquidação inflada ou subestimada | IA monta planilha e confere premissas; perito humano quando exigido | Próprio | CPC arts. 509-512 [a confirmar] | Prepara, pessoa conclui |
| JUR-085 | Cível | Redigir parecer jurídico (consulta do cliente) | Execução | Adv | Por evento | 4 | Parecer sem base ou desatualizado | IA reúne legislação, jurisprudência e minuta; advogado assina | Próprio (M1) | — | Prepara, pessoa conclui |
| JUR-086 | Cível | Notificação extrajudicial, interpelação e protesto | Execução | Adv | Por evento | 3 | Notificação ineficaz; prazo mal contado | IA minuta e acompanha a entrega | Cartório (D-assistido) | CPC art. 726 [a confirmar] | Prepara, pessoa conclui |
| JUR-087 | Cível | Mediação e arbitragem: cláusula, escolha de câmara, requerimento, prazos do regulamento | Execução | Adv | Por caso | 3 | Perda de prazo do regulamento | IA lê o regulamento e cria os prazos | Câmaras (D-assistido) | Lei 9.307/1996; 13.140/2015 [a confirmar] | Prepara, pessoa conclui |
| JUR-088 | Cível | Mandado de segurança e outros remédios constitucionais (decadência de 120 dias) | Execução | Adv | Por caso | 4 | Decadência; ato inexistente | IA calcula o prazo desde o ato coator e minuta | Próprio | Lei 12.016/2009 art. 23 [a confirmar] | Prepara, pessoa conclui |
| JUR-089 | Trabalhista | Triar o reclamante: documentos (CTPS, TRCT, holerites, contrato, mensagens) e histórico | Abertura | Est / Adv | Por caso | 3 | Pedido sem prova | IA organiza e extrai dados dos documentos | App do cliente (Próprio) | — | Prepara, pessoa conclui |
| JUR-090 | Trabalhista | Calcular o valor de cada pedido para a inicial (pedido líquido) | Execução | Calc / Adv | Por caso | 4 | Extinção de pedido ilíquido ou valor atribuído subestimado | IA estima verbas por pedido a partir da folha e do contrato | PJe-Calc / planilha (A) [F10] | CLT art. 840 §1º [a confirmar] | Prepara, pessoa conclui |
| JUR-091 | Trabalhista | Petição inicial trabalhista (horas extras, vínculo, insalubridade, rescisão, FGTS) | Execução | Adv | Por caso | 4 | Prescrição e preclusão | IA minuta com teses e jurisprudência do TST/TRT | Próprio | CLT; CF art. 7º XXIX [a confirmar] | Prepara, pessoa conclui |
| JUR-092 | Trabalhista | Contestação patronal com documentos e defesa por tema, enviada antes da audiência no PJe-JT | Execução | Adv | Por caso | 5 | Revelia ou confissão ficta | IA monta defesa por tema e reúne documentos da empresa | PJe-JT (D-assistido) | CLT arts. 843-847 [a confirmar] | Prepara, pessoa conclui |
| JUR-093 | Trabalhista | Coletar documentos da empresa cliente: ponto, folha, EPI, ASO, controles | Execução | Par | Por caso | 4 | Documento não entregue: defesa fraca | IA cobra do RH e confere se o período está completo | Core da folha (F) | — | Faz sozinho |
| JUR-094 | Trabalhista | Preparar audiência (carta de preposto, testemunhas, acordo) | Execução | Adv | Por caso | 4 | Preposto despreparado; confissão | IA monta o roteiro; humano treina o preposto | Agenda (B) | CLT art. 843 §1º [a confirmar] | Prepara, pessoa conclui |
| JUR-095 | Trabalhista | Fazer a liquidação no PJe-Calc (parcelas, FGTS, INSS, IR, correção) | Execução | Calc | Por caso | 5 | Cálculo homologado errado: perda sobre o valor da condenação | IA monta o arquivo conforme a sentença e os índices vigentes; calculista confere | PJe-Calc (A) [F10]; TRT4 voto 2026 [a confirmar modulação] | ADC 58; Lei 14.905/2024 [F10,F11] | Prepara, pessoa conclui |
| JUR-096 | Trabalhista | Impugnar cálculos do perito ou da parte | Execução | Calc / Adv | Por evento | 4 | Prazo curto e valor alto | IA compara os dois cálculos e aponta divergência | PJe-Calc (A) | CLT art. 879 §2º [a confirmar] | Prepara, pessoa conclui |
| JUR-097 | Trabalhista | Recurso ordinário, de revista e agravos (8 dias úteis) | Execução | Adv | Por caso | 5 | Perda do recurso | IA minuta e confere pressupostos | Próprio | CLT arts. 775, 895 [F7] | Prepara, pessoa conclui |
| JUR-098 | Trabalhista | Calcular e comprovar depósito recursal e custas (valores reajustados todo ano pelo TST) | Execução | Fin / Par | Por evento | 5 | Deserção | IA busca o valor vigente [a confirmar fonte] e gera a guia | GFIP/GRU/Banco (D-assistido) | CLT art. 899; Lei 13.467/2017 [a confirmar] | Prepara, pessoa conclui |
| JUR-099 | Trabalhista | Execução trabalhista: bloqueio, FGTS, alvará, certidão de crédito | Execução | Adv | Por evento | 4 | Execução parada | IA monitora e sugere o próximo ato | SISBAJUD (D-humano) | — | Prepara, pessoa conclui |
| JUR-100 | Trabalhista | Acordo trabalhista: parcelas, recolhimento previdenciário e quitação | Execução | Adv | Por evento | 3 | Quitação sem efeito; INSS esquecido | IA calcula e minuta | Próprio | — | Prepara, pessoa conclui |
| JUR-101 | Trabalhista | Verificar prescrição bienal e quinquenal | Abertura | Adv | Por caso | 5 | Pretensão prescrita | IA calcula e destaca parcelas fora do prazo | Próprio | CF art. 7º XXIX [a confirmar] | Prepara, pessoa conclui |
| JUR-102 | Trabalhista | Consultivo preventivo: auditoria do passivo trabalhista e de contratos de trabalho | Execução | Adv | Anual | 3 | Passivo oculto | IA cruza contratos e folha e aponta riscos | Core da folha (F) | — | Prepara, pessoa conclui |
| JUR-103 | Trabalhista | Acompanhar perícia (insalubridade, periculosidade, médica): quesitos e assistente técnico | Execução | Adv | Por caso | 3 | Perícia desfavorável sem contraprova | IA gera quesitos por atividade | Próprio | — | Prepara, pessoa conclui |
| JUR-104 | Trabalhista | Contencioso trabalhista em massa: tese-padrão, provas por tema e controle por unidade | Execução | Adv / Ctrl | Diária | 4 | Resultados desiguais para o mesmo tema | IA padroniza defesas e destaca divergência | Próprio | — | Prepara, pessoa conclui |
| JUR-105 | Tributário | Mapear teses e quantificar crédito a recuperar (PIS/COFINS, ICMS, contribuições) a partir de notas e escrituração | Abertura | Adv / Calc | Por caso | 3 | Tese errada ou crédito superestimado | IA cruza dados do Contábil e sugere teses com valor estimado | Core contábil (F); SPED | — | Prepara, pessoa conclui |
| JUR-106 | Tributário | Ação anulatória, repetição de indébito, mandado de segurança tributário | Execução | Adv | Por caso | 4 | Prescrição de 5 anos [a confirmar] | IA calcula prazo e minuta | Próprio | CTN arts. 165, 168 [a confirmar] | Prepara, pessoa conclui |
| JUR-107 | Tributário | Impugnar auto de infração no prazo do processo administrativo fiscal e juntar provas | Execução | Adv | Por caso | 5 | Crédito vira definitivo e vai para a dívida ativa | IA lê o auto e minuta a defesa por item | e-CAC/portal do órgão (C-cert) | Decreto 70.235/1972 art. 15 (30 dias) [a confirmar] | Prepara, pessoa conclui |
| JUR-108 | Tributário | Recurso voluntário ao CARF ou conselhos estaduais; sustentação | Execução | Adv | Por caso | 4 | Perda de instância | IA reúne precedentes do CARF e minuta | CARF jurisprudência (A) [a confirmar] | — | Prepara, pessoa conclui |
| JUR-109 | Tributário | Monitorar caixa postal do e-CAC e DTE-Domicílio Tributário (intimações e termos de fiscalização) | Acompanhamento | Ctrl | Diária | 5 | Intimação lida tarde; malha; multa | IA lê e cria prazo (mesma rotina do pacote Contábil) | e-CAC/Integra Contador (A$/C-cert) | — | Faz sozinho |
| JUR-110 | Tributário | Defender em execução fiscal: embargos (30 dias da intimação da penhora) ou exceção de pré-executividade | Execução | Adv | Por caso | 5 | Constrição de bens; preclusão | IA identifica a via e minuta [F27] | Tribunais (C-cert) | LEF art. 16; Súmula 393 STJ [F27] | Prepara, pessoa conclui |
| JUR-111 | Tributário | Simular e aderir à transação PGFN; acompanhar impugnação no Regularize | Execução | Adv | Por caso | 4 | Perda do desconto; exclusão da transação | IA simula opções com a dívida inscrita e prepara a adesão | Portal Regularize (C-crc/C-cert) [F18] | Lei 13.988/2020; Portaria PGFN 51/2024 [F18] | Prepara, pessoa conclui |
| JUR-112 | Tributário | Emitir e monitorar a validade de certidões negativas ou com efeito de negativa | Acompanhamento | Par | Diária | 3 | Licitação ou financiamento barrado | IA emite e alerta o vencimento | Receita/PGFN (A$/C-cert) | CTN art. 206 | Faz sozinho |
| JUR-113 | Tributário | Responder consulta fiscal e processo de consulta | Execução | Adv | Por evento | 3 | Resposta vinculante errada | IA minuta e reúne soluções de consulta | Receita (A) | — | Prepara, pessoa conclui |
| JUR-114 | Tributário | Planejamento tributário e reorganização societária (incl. reforma tributária: CBS/IBS) | Execução | Adv / Contador | Por caso | 4 | Planejamento abusivo ou defasado | IA simula cenários e cita a lei vigente | Core contábil (F) | EC 132/2023; LC 214/2025 [a confirmar] | Prepara, pessoa conclui |
| JUR-115 | Tributário | Controlar depósitos judiciais tributários e levantamento ao final | Acompanhamento | Fin / Adv | Por caso | 3 | Valor esquecido no depósito | IA concilia e alerta o trânsito em julgado | Banco (D-assistido) | — | Organiza e lembra |
| JUR-116 | Penal | Atender prisão em flagrante e plantão: audiência de custódia, pedido de liberdade | Execução | Adv | Por evento | 5 | Prisão mantida sem defesa nas primeiras horas | IA monta checklist, minuta e consulta o processo; atendimento humano | Tribunais; plantão (D-humano) | CPP art. 310 [a confirmar] | Organiza e lembra |
| JUR-117 | Penal | Habeas corpus e pedidos cautelares urgentes | Execução | Adv | Por evento | 5 | Liberdade perdida | IA minuta com precedentes e anexa documentos | PJe/e-STJ (D-assistido) | CPP art. 647; CF art. 5º LXVIII [a confirmar] | Prepara, pessoa conclui |
| JUR-118 | Penal | Acessar autos de inquérito e investigações e acompanhar diligências | Acompanhamento | Adv | Semanal | 4 | Atos sem defesa; nulidade | IA indica o que falta e lembra | Polícia/MP (D-humano) | Súmula Vinculante 14 [a confirmar] | Organiza e lembra |
| JUR-119 | Penal | Resposta à acusação | Execução | Adv | Por caso | 5 | Preclusão de teses e provas | IA minuta com teses e rol de testemunhas | Próprio | CPP art. 396-A [a confirmar] | Prepara, pessoa conclui |
| JUR-120 | Penal | Preparar audiência de instrução e júri (roteiro, testemunhas, quesitos) | Execução | Adv | Por caso | 4 | Perda de prova oral | IA monta roteiro e quesitos | Próprio | CPP arts. 400, 422 [a confirmar] | Prepara, pessoa conclui |
| JUR-121 | Penal | Alegações finais e memoriais | Execução | Adv | Por caso | 4 | Tese não apreciada | IA organiza prova e teses | Próprio | CPP art. 403 [a confirmar] | Prepara, pessoa conclui |
| JUR-122 | Penal | Recursos: apelação, RESE, agravo em execução, embargos, revisão criminal (prazos em dias corridos) | Execução | Adv | Por caso | 5 | Trânsito em julgado; réu preso sem recurso | IA conta prazos em dias corridos pela regra do CPP e minuta [F6] | Próprio | CPP art. 798 [F6]; prazos por recurso [a confirmar] | Prepara, pessoa conclui |
| JUR-123 | Penal | Execução penal no SEEU: cálculo de pena, progressão, livramento, remição, indulto | Acompanhamento | Adv / Calc | Mensal | 4 | Benefício concedido tarde: preso além do tempo | IA calcula datas-base e marca benefícios | SEEU (C-cert) [a confirmar] | LEP arts. 112-126 [a confirmar] | Prepara, pessoa conclui |
| JUR-124 | Penal | Calcular prescrição penal (abstrata e retroativa) e prazos de medidas cautelares | Execução | Adv | Por caso | 4 | Prescrição não alegada | IA calcula marcos interruptivos e prazos | Próprio | CP arts. 109-117 [a confirmar] | Prepara, pessoa conclui |
| JUR-125 | Penal | Negociar ANPP, transação penal, suspensão condicional do processo | Execução | Adv | Por caso | 3 | Oportunidade de acordo perdida | IA verifica requisitos | Próprio | CPP art. 28-A; Lei 9.099 [a confirmar] | Prepara, pessoa conclui |
| JUR-126 | Penal | Acompanhar réu preso (prazos, audiências, visitas, saúde) | Acompanhamento | Adv / Par | Diária | 5 | Excesso de prazo; liberdade | IA organiza e lembra | SEEU (C-cert) | — | Organiza e lembra |
| JUR-127 | Família | Divórcio e união estável consensuais: minuta da escritura ou petição e partilha | Execução | Adv | Por caso | 3 | Partilha desigual ou impugnada | IA minuta e organiza bens | Cartório (D-assistido) | Res. CNJ 35/2007 [F19] | Prepara, pessoa conclui |
| JUR-128 | Família | Guarda, convivência, alimentos: petição inicial e provas (litigioso) | Execução | Adv | Por caso | 4 | Medida urgente demorada | IA minuta e calcula alimentos sobre renda | Próprio | — | Prepara, pessoa conclui |
| JUR-129 | Família | Execução de alimentos: cálculo do débito e pedido de prisão civil | Execução | Adv / Calc | Por evento | 4 | Prisão não decretada; cálculo contestado | IA calcula parcelas devidas e atualiza | Índices (A) | CPC arts. 528, 911 [a confirmar] | Prepara, pessoa conclui |
| JUR-130 | Família | Inventário judicial: primeiras declarações, avaliação, colação, partilha | Execução | Adv | Por caso | 4 | Multa por atraso; litígio de herdeiros | IA lista bens, herdeiros e valores | Próprio | CPC art. 611 (2 meses) [a confirmar] | Prepara, pessoa conclui |
| JUR-131 | Família | Inventário e partilha extrajudiciais: certidões, ITCMD, escritura | Execução | Adv | Por caso | 3 | Escritura nula ou ITCMD com multa | IA lista requisitos e documentos e minuta | Cartório/e-Notariado (D-assistido) | Res. CNJ 35/2007; Res. 571/2024 [F19] [a confirmar] | Prepara, pessoa conclui |
| JUR-132 | Família | Calcular ITCMD e gerar guia por UF | Execução | Calc | Por caso | 3 | Multa e juros por atraso | IA aplica a alíquota da UF e gera a guia | Sefaz de cada UF (D-assistido) | Leis estaduais [a confirmar] | Prepara, pessoa conclui |
| JUR-133 | Família | Planejamento sucessório (testamento, holding familiar, doação com reserva de usufruto) | Execução | Adv | Por caso | 3 | Planejamento que não funciona | IA modela cenários e minuta | Próprio | — | Prepara, pessoa conclui |
| JUR-134 | Família | Levantar bens do falecido (bancos, imóveis, CNIB, veículos, valores a receber) | Abertura | Par | Por caso | 3 | Bem esquecido: sonegação | IA solicita certidões e consolida | Cartórios/Banco Central SVR (D-assistido) | — | Prepara, pessoa conclui |
| JUR-135 | Família | Alvarás judiciais (FGTS, PIS, saldo em conta) e pedidos de curatela, tutela, tomada de decisão apoiada | Execução | Adv | Por caso | 3 | Valor retido; prazo de prestação de contas perdido | IA minuta e lembra a prestação de contas | Próprio | — | Organiza e lembra |
| JUR-136 | Previdenciário | Triagem: análise de CNIS, CTPS e vínculos; planejamento previdenciário | Abertura | Est / Par | Por caso | 4 | Benefício pedido na regra errada | IA lê o CNIS e a CTPS, aponta lacunas e simula regras | Meu INSS/CNIS (C-crc) | EC 103/2019 [a confirmar] | Prepara, pessoa conclui |
| JUR-137 | Previdenciário | Calcular tempo de contribuição, carência e renda mensal inicial por regra de transição | Execução | Calc | Por caso | 4 | Aposentadoria concedida a menor | IA calcula todas as regras e compara | Próprio | EC 103/2019; Lei 8.213/1991 [a confirmar] | Prepara, pessoa conclui |
| JUR-138 | Previdenciário | Requerer benefício e acompanhar exigências no Meu INSS | Execução | Par | Por caso | 5 | Exigência não cumprida em 30 dias: indeferimento [a confirmar] | IA prepara documentos e lembra exigências; envio pelo advogado | Meu INSS (C-crc) | Decreto 3.048/1999 [a confirmar] | Prepara, pessoa conclui |
| JUR-139 | Previdenciário | Obter procuração eletrônica do cliente no Meu INSS (gov.br prata ou ouro) | Procuração | Par | Por caso | 3 | Sem acesso ao benefício do cliente | IA conduz o cliente e acompanha o aceite | Meu INSS (D-assistido) [F23] | Portarias INSS 10/2025 e 21/2026 [F23] [a confirmar] | Prepara, pessoa conclui |
| JUR-140 | Previdenciário | Reunir PPP, LTCAT e laudos para tempo especial | Execução | Par | Por caso | 4 | Tempo especial não reconhecido | IA identifica documentos faltantes e pede à empresa | Empresa; INSS (D-humano) | Decreto 3.048/1999 [a confirmar] | Prepara, pessoa conclui |
| JUR-141 | Previdenciário | Recurso ao CRPS: ordinário (Junta) e especial (Câmara) | Execução | Adv | Por caso | 5 | Perda do recurso administrativo | IA lê a decisão e minuta o recurso | Meu INSS (C-crc) [F24] | Regimento CRPS [F24] [a confirmar prazos] | Prepara, pessoa conclui |
| JUR-142 | Previdenciário | Ação judicial de concessão ou revisão (JEF/Vara): inicial, perícia médica e social | Execução | Adv | Por caso | 4 | Competência errada; perícia sem preparo | IA minuta e prepara o cliente para a perícia | Tribunais (C-cert) | — | Prepara, pessoa conclui |
| JUR-143 | Previdenciário | Controlar decadência e prescrição de revisões | Abertura | Adv | Por caso | 5 | Direito de revisão perdido | IA calcula prazo desde o primeiro pagamento | Próprio | Lei 8.213/1991 art. 103 [a confirmar] | Prepara, pessoa conclui |
| JUR-144 | Previdenciário | Pensão por morte, BPC/LOAS, auxílio por incapacidade: checklists e provas | Abertura | Par | Por caso | 4 | Dependência ou renda não provada | IA lista provas por benefício | Próprio | — | Prepara, pessoa conclui |
| JUR-145 | Previdenciário | Calcular atrasados e acompanhar RPV ou precatório; destacar honorários | Execução | Calc | Por caso | 4 | Honorários não destacados | IA calcula e acompanha a fila | Tribunais (A/C-cert) | EAOAB art. 22 §4º [F14] | Prepara, pessoa conclui |
| JUR-146 | Previdenciário | Monitorar convocação para perícia, cessação e alta programada dos benefícios dos clientes | Acompanhamento | Par | Mensal | 4 | Benefício cortado por falta de comparecimento | IA consulta e lembra o cliente | Meu INSS (C-crc) | — | Organiza e lembra |
| JUR-147 | Consumidor | Reclamação pré-processual no Consumidor.gov.br, Procon e SAC | Execução | Par | Por caso | 2 | Prova de tentativa de solução ausente | IA registra e acompanha o protocolo | Consumidor.gov.br (D-assistido) [a confirmar] | CDC | Prepara, pessoa conclui |
| JUR-148 | Consumidor | Ação no JEC com petição padronizada e documentos por tese | Execução | Adv / Est | Diária | 3 | Documento ausente; ação extinta | IA preenche petição por tese a partir do caso | Tribunais (C-cert) | Lei 9.099/1995 [F8] | Prepara, pessoa conclui |
| JUR-149 | Consumidor | Calcular dano material, repetição do indébito em dobro e juros | Execução | Calc | Por caso | 3 | Pedido subestimado | IA calcula | Índices (A) | CDC art. 42 [a confirmar] | Prepara, pessoa conclui |
| JUR-150 | Consumidor | Audiência de conciliação do JEC (cliente ou preposto da empresa) | Execução | Adv / Preposto | Diária | 3 | Revelia da empresa; acordo ruim | IA define alçada de acordo e orienta o preposto | Agenda; videoconferência (B) | Lei 9.099 art. 20 [a confirmar] | Prepara, pessoa conclui |
| JUR-151 | Consumidor | Recurso inominado (10 dias úteis) e contrarrazões | Execução | Adv | Por evento | 5 | Prazo perdido | IA minuta e confere preparo | Próprio | Lei 9.099 arts. 12-A, 42 [F8] | Prepara, pessoa conclui |
| JUR-152 | Consumidor | Revisão bancária e superendividamento (Lei 14.181/2021) | Execução | Adv | Por caso | 3 | Cálculo errado; plano de pagamento inviável | IA recalcula contrato e simula plano | Próprio; BCB (A) | Lei 14.181/2021 [a confirmar] | Prepara, pessoa conclui |
| JUR-153 | Empresarial | Constituir sociedade e alterar contrato social (Junta, REDESIM) | Execução | Adv | Por caso | 3 | Registro devolvido; atraso | IA minuta e confere pendências; ato final no portal | Junta/REDESIM (D-assistido) | CC arts. 997-1.000 | Prepara, pessoa conclui |
| JUR-154 | Empresarial | Acordo de sócios e de acionistas | Execução | Adv | Por caso | 3 | Cláusula omissa gera disputa | IA minuta com cláusulas-padrão | Próprio | Lei 6.404/1976 art. 118 [a confirmar] | Prepara, pessoa conclui |
| JUR-155 | Empresarial | Atas, livros e assembleias: convocação, quórum, registro | Execução | Par / Adv | Por evento | 3 | Assembleia anulável | IA monta convocação, calcula quórum e minuta ata | Junta (D-assistido) | CC art. 1.072 [a confirmar] | Prepara, pessoa conclui |
| JUR-156 | Empresarial | Recuperação judicial e falência: habilitação de crédito, acompanhamento do plano, assembleia | Execução | Adv | Por caso | 4 | Crédito fora do quadro ou voto perdido | IA acompanha o edital e minuta habilitação | Tribunais (C-cert) | Lei 11.101/2005 [a confirmar] | Prepara, pessoa conclui |
| JUR-157 | Empresarial | Due diligence em fusões e aquisições: checklist, data room, matriz de risco, relatório | Execução | Adv / Par | Por caso | 4 | Passivo oculto na compra | IA lê documentos do data room e classifica risco; sócio conclui | Data room (B) | — | Prepara, pessoa conclui |
| JUR-158 | Empresarial | Contratos de investimento e de compra de participação (term sheet, SPA) | Execução | Adv | Por caso | 3 | Cláusula de preço e garantia mal feita | IA gera primeira minuta da biblioteca | Próprio | — | Prepara, pessoa conclui |
| JUR-159 | Empresarial | Dissolução e apuração de haveres | Execução | Adv / Contador | Por caso | 3 | Valor contestado | IA calcula pelo balanço | Core contábil (F) | CPC arts. 599-609 [a confirmar] | Prepara, pessoa conclui |
| JUR-160 | Empresarial | Propriedade intelectual: busca, depósito e renovação de marca no INPI | Execução | Adv | Por evento | 3 | Marca indeferida ou perdida por falta de renovação | IA busca anterioridades e controla vencimento | INPI (D-assistido) | Lei 9.279/1996 [a confirmar] | Organiza e lembra |
| JUR-161 | Contratos | Redigir contrato a partir de modelo e biblioteca de cláusulas | Execução | Adv | Diária | 3 | Cláusula inadequada; retrabalho | IA preenche e sugere cláusulas conforme o tipo e o risco | Biblioteca (Próprio) | CC arts. 421-480 | Prepara, pessoa conclui |
| JUR-162 | Contratos | Revisar contrato da contraparte: marcações, matriz de risco e comparação com o playbook | Execução | Adv | Diária | 4 | Cláusula abusiva assinada | IA compara com o playbook e marca desvios; advogado decide | Próprio | — | Prepara, pessoa conclui |
| JUR-163 | Contratos | Manter biblioteca de cláusulas e modelos com versão e responsável | Execução | Adv | Mensal | 2 | Modelo desatualizado em uso | IA aponta cláusula desatualizada por mudança de lei | Próprio | — | Organiza e lembra |
| JUR-164 | Contratos | Comparar versões e registrar a negociação | Execução | Par | Por evento | 2 | Alteração não percebida | IA compara e resume mudanças | Próprio | — | Faz sozinho |
| JUR-165 | Contratos | Colher assinaturas eletrônicas e arquivar contrato assinado | Execução | Par | Diária | 3 | Contrato sem assinatura de todos | IA envia, acompanha e arquiva | Assinatura eletrônica (B) | Lei 14.063/2020 [F21] | Faz sozinho |
| JUR-166 | Contratos | Controlar vigência, renovação, reajuste, rescisão e obrigações com alertas | Acompanhamento | Ctrl | Mensal | 4 | Renovação automática ou multa por perda de aviso | IA lê datas e obrigações do contrato e alerta | Repositório (Próprio) | — | Faz sozinho |
| JUR-167 | Contratos | Extrair dados de contratos legados (partes, valores, datas, cláusulas-chave) | Abertura | Par | Por projeto | 3 | Carteira de contratos desconhecida | IA extrai e estrutura; humano valida amostra | Documentos (Próprio) | — | Prepara, pessoa conclui |
| JUR-168 | Contratos | Aditivos, distratos e notificações contratuais | Execução | Adv | Por evento | 3 | Notificação com prazo contado errado | IA minuta e calcula prazos do contrato | Próprio | — | Prepara, pessoa conclui |
| JUR-169 | Contratos | Termos de uso, política de privacidade e contratos-padrão de empresas clientes | Execução | Adv | Por evento | 3 | Termos em desacordo com a LGPD | IA gera a partir de modelo e confere LGPD | Próprio | LGPD [F22] | Prepara, pessoa conclui |
| JUR-170 | Imobiliário | Due diligence imobiliária: matrícula, ônus, ações, IPTU, CNIB, certidões do vendedor | Execução | Adv / Par | Por caso | 4 | Compra de imóvel com ônus ou fraude | IA lê a matrícula e certidões e lista riscos | Cartórios/ONR (D-assistido) [a confirmar] | — | Prepara, pessoa conclui |
| JUR-171 | Imobiliário | Contrato de compra e venda, promessa e locação | Execução | Adv | Por caso | 3 | Cláusula de arrependimento e multa mal desenhada | IA minuta por modelo | Próprio | — | Prepara, pessoa conclui |
| JUR-172 | Imobiliário | Escritura, ITBI e registro: acompanhar cartório e notas de exigência | Execução | Par | Por caso | 3 | Registro devolvido; atraso | IA acompanha a prenotação e cumpre exigências | Cartório/ONR (D-assistido) | — | Organiza e lembra |
| JUR-173 | Imobiliário | Usucapião judicial ou extrajudicial: ata notarial, planta, memorial, certidões | Execução | Adv / Par | Por caso | 3 | Pedido indeferido por documento ausente | IA monta o checklist do procedimento vigente | Cartório (D-assistido) | Prov. CNJ 65/2017 [F20] [status do ato a confirmar] | Prepara, pessoa conclui |
| JUR-174 | Imobiliário | Locação: notificação, despejo, cobrança de aluguéis, revisional | Execução | Adv | Por caso | 3 | Prazo de notificação mal contado | IA calcula débito e minuta | Próprio | Lei 8.245/1991 [a confirmar] | Prepara, pessoa conclui |
| JUR-175 | Imobiliário | Condomínio: assembleia, cobrança de cotas, convenção | Execução | Adv | Por evento | 2 | Cobrança prescrita; assembleia nula | IA calcula e minuta | Próprio | CC arts. 1.331-1.358 | Prepara, pessoa conclui |
| JUR-176 | Imobiliário | Incorporação, distrato e loteamento: contratos, retenção, registro | Execução | Adv | Por caso | 3 | Retenção abusiva | IA calcula distrato | Próprio | Lei 13.786/2018 [a confirmar] | Prepara, pessoa conclui |
| JUR-177 | Administrativo | Licitações e contratos públicos: leitura de edital, impugnação, proposta, recurso (prazos curtos) | Execução | Adv | Por caso | 5 | Prazo de dias úteis perdido; desclassificação | IA lê o edital, extrai exigências e prazos e minuta recurso | PNCP/portais (A/D-assistido) [a confirmar] | Lei 14.133/2021 [a confirmar] | Prepara, pessoa conclui |
| JUR-178 | Administrativo | Processo administrativo e disciplinar: defesa, provas, recursos | Execução | Adv | Por caso | 4 | Cerceamento de defesa | IA minuta e controla prazos | Órgão (D-humano) | Lei 9.784/1999 [a confirmar] | Prepara, pessoa conclui |
| JUR-179 | Administrativo | Licenças e regulatório (ambiental, sanitário, agências): requerimentos e renovações | Execução | Adv / Par | Por evento | 3 | Licença vencida: multa e embargo | IA controla vencimentos e monta o requerimento | Órgãos (D-assistido) | — | Organiza e lembra |
| JUR-180 | Administrativo | Precatórios e RPV: acompanhar fila, cessão, compensação | Acompanhamento | Adv / Fin | Mensal | 3 | Valor esquecido | IA acompanha a fila | Tribunais (A) | CF art. 100 [a confirmar] | Organiza e lembra |
| JUR-181 | Administrativo | Servidores e concursos: ações de reajuste, nomeação e anulação de questão | Execução | Adv | Por caso | 3 | Prazo decadencial de concurso curto | IA lê edital e calcula prazos | Órgão (D-humano) | — | Prepara, pessoa conclui |
| JUR-182 | Compliance e LGPD | Mapear dados e manter o inventário de tratamento (RoPA) | Execução | Adv / Consultor | Anual | 3 | Auditoria da ANPD sem inventário | IA entrevista áreas, monta o inventário e aponta lacunas | Próprio | LGPD art. 37 [F22] | Prepara, pessoa conclui |
| JUR-183 | Compliance e LGPD | Atender direito de titulares (acesso, correção, exclusão) com prazo | Execução | Adv | Por evento | 3 | Prazo e resposta vencidos | IA recebe, verifica identidade e minuta a resposta | Canal do cliente (Próprio) | LGPD art. 18 [F22] | Prepara, pessoa conclui |
| JUR-184 | Compliance e LGPD | Elaborar RIPD e avaliar risco de operações | Execução | Adv | Por evento | 3 | Operação de alto risco sem avaliação | IA gera primeira versão | Próprio | LGPD art. 38 [F22] | Prepara, pessoa conclui |
| JUR-185 | Compliance e LGPD | Avaliar incidente de segurança e comunicar a ANPD e titulares no prazo | Execução | Adv | Por evento | 5 | Multa da ANPD por comunicação tardia | IA classifica a gravidade e minuta a comunicação; humano decide | ANPD (D-assistido) [a confirmar] | LGPD art. 48; Res. CD/ANPD 15/2024 [a confirmar] | Prepara, pessoa conclui |
| JUR-186 | Compliance e LGPD | Programa de integridade: políticas, canal de denúncias, investigação interna | Execução | Adv | Por caso | 3 | Desconto da Lei Anticorrupção perdido | IA minuta políticas e triagem de denúncias | Canal (Próprio) | Lei 12.846/2013; Decreto 11.129/2022 [a confirmar] | Prepara, pessoa conclui |
| JUR-187 | Compliance e LGPD | Due diligence de terceiros (fornecedor, parceiro): mídia negativa, listas restritivas, certidões | Execução | Par | Por evento | 3 | Parceiro irregular | IA consulta bases e monta relatório | Bureaus/CEIS (A/B) | — | Prepara, pessoa conclui |
| JUR-188 | Compliance e LGPD | Treinamentos e políticas internas para o cliente | Execução | Adv | Anual | 2 | Política sem adesão | IA gera trilha e acompanha conclusão | Próprio | — | Organiza e lembra |
| JUR-189 | Compliance e LGPD | Vigiar mudanças legais por cliente (setor, UF, regime) e avisar o que muda | Acompanhamento | Adv | Contínua | 4 | Mudança não percebida | IA monitora DOU, tribunais e agências e avisa quem é afetado | DOU/LexML (A) | — | Faz sozinho |
| JUR-190 | Compliance e LGPD | Adequar o próprio escritório à LGPD (dados sensíveis de clientes, retenção, segurança) | Execução | Sóc | Anual | 3 | Vazamento de dados de clientes | IA gera inventário e plano | Próprio | LGPD [F22]; Recomendação CFOAB 001/2024 [F13] | Prepara, pessoa conclui |
| JUR-191 | Jurídico interno | Receber citações e intimações da empresa no Domicílio e distribuir ao responsável | Acompanhamento | Ctrl | Diária | 5 | Revelia por citação não vista; prazo corre em 5 dias úteis após ciência | IA consulta, confirma ciência com autorização e distribui [F2] | Domicílio Judicial (C-cert, e-CNPJ) [F2] | Res. CNJ 455/2022 art. 20 [F2] | Prepara, pessoa conclui |
| JUR-192 | Jurídico interno | Triar novos processos: tema, risco, valor, grupo; escolher escritório | Abertura | Ctrl / Adv | Diária | 4 | Mesmo tema tratado de forma diferente | IA classifica e sugere escritório por matriz | Próprio | — | Prepara, pessoa conclui |
| JUR-193 | Jurídico interno | Distribuir e contratar escritórios externos por matriz de preço, êxito e desempenho | Abertura | Gestor | Diária | 3 | Escritório sem capacidade; custo alto | IA distribui por regras | Próprio | — | Organiza e lembra |
| JUR-194 | Jurídico interno | Estimar o risco e provisionar (provável, possível, remota) | Acompanhamento | Adv / Contador | Mensal | 4 | Provisão errada: demonstrações incorretas | IA estima por jurimetria e histórico; humano decide | Contábil (F) | CPC 25 [a confirmar] | Prepara, pessoa conclui |
| JUR-195 | Jurídico interno | Estimar probabilidade, tempo e valor por tema, vara e juiz (jurimetria) | Acompanhamento | Analista | Mensal | 3 | Decisão de acordo sem base | IA calcula estatísticas com base nos dados da própria empresa e dos tribunais | DataJud (A) [F3,F26] | — | Prepara, pessoa conclui |
| JUR-196 | Jurídico interno | Definir e aplicar política de acordos (alçada, tabela por tema) | Execução | Adv | Diária | 4 | Acordo caro ou ausência de acordo vantajoso | IA recomenda faixa de acordo | Próprio | — | Prepara, pessoa conclui |
| JUR-197 | Jurídico interno | Controlar pagamentos de custas, depósitos, condenações e acordos | Execução | Fin | Diária | 4 | Multa por atraso; execução | IA concilia e agenda pagamento | ERP/Banco (F/B) | — | Faz sozinho |
| JUR-198 | Jurídico interno | Auditar qualidade dos escritórios externos (peças, prazos, relatório, SLA) | Acompanhamento | Ctrl | Mensal | 4 | Escritório falha em prazo e ninguém vê | IA confere cada processo contra a publicação e o andamento | DataJud/DJEN (A) | — | Prepara, pessoa conclui |
| JUR-199 | Jurídico interno | Consultivo: caixa de perguntas do negócio (tickets) com prioridade e SLA | Execução | Adv | Diária | 3 | Resposta lenta trava o negócio | IA responde dúvidas repetidas e classifica | Ferramenta de tickets (B) | — | Prepara, pessoa conclui |
| JUR-200 | Jurídico interno | Fluxo de contratos: solicitação, minuta, aprovação, assinatura (autosserviço do negócio) | Execução | Adv / Negócio | Diária | 3 | Contrato assinado sem passar pelo jurídico | IA gera a minuta e escala exceções | Assinatura eletrônica (B) | — | Prepara, pessoa conclui |
| JUR-201 | Jurídico interno | Gerir procurações e poderes da empresa (outorgas, validade, substabelecimentos) | Execução | Ctrl | Mensal | 4 | Procuração vencida ou poder inexistente | IA alerta vencimentos e confere poderes por ato | Próprio | — | Organiza e lembra |
| JUR-202 | Jurídico interno | Gerir cartas de preposição e agenda de audiências dos prepostos | Execução | Ctrl | Diária | 4 | Preposto ausente: confissão ou revelia | IA agenda, envia carta e lembra | Agenda (B) | CLT art. 843 §1º [a confirmar] | Organiza e lembra |
| JUR-203 | Jurídico interno | Relatórios para diretoria: passivo, tendências, orçamento, indicadores | Acompanhamento | Analista | Mensal | 3 | Decisão sem dados | IA monta o relatório e explica variações | Próprio | — | Faz sozinho |
| JUR-204 | Jurídico interno | Mapear obrigações regulatórias e vigiar prazos de órgãos (ANPD, BC, ANVISA, CVM) | Execução | Adv | Contínua | 4 | Multa regulatória | IA mapeia e lembra | Órgãos (A/D-assistido) | — | Organiza e lembra |
| JUR-205 | Jurídico interno | Padronizar defesas e teses no contencioso de massa com banco de modelos | Execução | Adv | Diária | 4 | Retrabalho; tese perdedora repetida | IA identifica o modelo por tema e minuta [F17] | Próprio | — | Prepara, pessoa conclui |
| JUR-206 | Jurídico interno | Gerir provas corporativas e retenção (litigation hold) | Execução | Adv / TI | Por evento | 4 | Prova destruída: sanção | IA identifica custodiantes e bloqueia descarte | Próprio | — | Organiza e lembra |
| JUR-207 | Jurídico interno | Conferir faturas dos escritórios externos (e-billing, glosa) | Acompanhamento | Fin | Mensal | 3 | Pagamento acima do contratado | IA confere horas e valores contra o contrato | Próprio | — | Prepara, pessoa conclui |
| JUR-208 | Gestão do escritório | Controlar honorários contratuais: parcelas, reajuste e cobrança (boleto, Pix, NFS-e) | Execução | Fin | Mensal | 4 | Honorário não cobrado | IA gera a cobrança e baixa | NFS-e; bancos (B) [S4 do plano] | — | Faz sozinho |
| JUR-209 | Gestão do escritório | Controlar honorários de êxito: evento gerador, base, data de pagamento | Acompanhamento | Fin / Adv | Por evento | 4 | Êxito esquecido | IA detecta o evento no andamento e dispara a cobrança | DataJud (A) [F3] | EAOAB art. 22 §4º [F14] | Prepara, pessoa conclui |
| JUR-210 | Gestão do escritório | Controlar honorários sucumbenciais: fixação, execução, destaque e rateio | Acompanhamento | Fin / Adv | Por evento | 4 | Sucumbência não executada ou rateada errado | IA identifica a condenação e calcula o valor | DataJud (A) | CPC art. 85; EAOAB arts. 22-24 [F14] | Prepara, pessoa conclui |
| JUR-211 | Gestão do escritório | Repassar valores a sócios, associados e correspondentes (rateio por contribuição) | Execução | Fin | Mensal | 3 | Disputa entre sócios | IA calcula pelo contrato e pelas horas | Próprio | EAOAB art. 24 §3º-A [F14] [a confirmar STF] | Prepara, pessoa conclui |
| JUR-212 | Gestão do escritório | Repassar ao cliente valores levantados, com retenção contratual de honorários | Execução | Fin / Adv | Por evento | 5 | Retenção sem cláusula: infração; repasse atrasado | IA calcula o líquido e confere a cláusula | Banco (D-assistido) | CED art. 48 §§2º-3º [F14] | Prepara, pessoa conclui |
| JUR-213 | Gestão do escritório | Controlar a conta de terceiros (valores de clientes) e a conciliação bancária | Execução | Fin | Diária | 4 | Mistura de recursos | IA concilia por cliente | Open Finance (B) | — | Faz sozinho |
| JUR-214 | Gestão do escritório | Reembolsar despesas adiantadas (custas, perícia, diligências, correspondente) | Execução | Fin | Mensal | 3 | Prejuízo por despesas não cobradas | IA agrupa e emite o reembolso | Próprio | — | Faz sozinho |
| JUR-215 | Gestão do escritório | Cobrar honorários inadimplidos e executar o contrato | Execução | Adv / Fin | Por evento | 3 | Prescrição do crédito | IA acompanha atrasos e minuta a cobrança | Próprio | EAOAB art. 24 [F14] | Prepara, pessoa conclui |
| JUR-216 | Gestão do escritório | Faturar por hora com base no timesheet | Execução | Fin | Mensal | 3 | Faturamento sem horas | IA concilia horas e envia pré-fatura | Timesheet (Próprio) | — | Faz sozinho |
| JUR-217 | Gestão do escritório | Medir rentabilidade por caso, cliente e área | Acompanhamento | Sóc | Mensal | 3 | Caso deficitário continua | IA calcula custo por hora e margem | Próprio | — | Faz sozinho |
| JUR-218 | Gestão do escritório | Higienizar a base: processos duplicados, sem cliente, sem responsável, sem prazo | Acompanhamento | Ctrl | Semanal | 4 | Processo órfão sem prazo | IA acha e propõe correção | Próprio | — | Faz sozinho |
| JUR-219 | Gestão do escritório | Revisar peças em fila com checklist pré-protocolo (citações, pedidos, anexos, assinatura) | Execução | Adv sênior | Diária | 5 | Peça com erro vai a juízo | IA confere citações, pedidos e anexos e aponta divergências | Próprio | — | Prepara, pessoa conclui |
| JUR-220 | Gestão do escritório | Montar painel de jurimetria do escritório: taxa de êxito, tempo, valor por tema, vara e juiz | Acompanhamento | Sóc | Mensal | 2 | Estratégia sem base | IA calcula e destaca | DataJud (A) [F3,F26] | — | Prepara, pessoa conclui |
| JUR-221 | Gestão do escritório | Manter banco de peças e conhecimento (teses, modelos, parecer) com busca | Execução | Adv | Contínua | 3 | Peça refeita do zero | IA indexa e sugere peça parecida | Próprio | — | Faz sozinho |
| JUR-222 | Gestão do escritório | Treinar estagiários e advogados novos (trilhas, simulados, onboarding) | Execução | Sóc | Contínua | 3 | Erro de iniciante em prazo | IA cria trilha e corrige simulado | Próprio | — | Organiza e lembra |
| JUR-223 | Gestão do escritório | Gerir estagiários (convênio, frequência, supervisão, atividades) | Execução | Sec | Mensal | 2 | Estágio irregular | IA controla frequência e documentos | Próprio | Lei 11.788/2008 [a confirmar] | Organiza e lembra |
| JUR-224 | Gestão do escritório | Enviar relatório mensal ao cliente por carteira ou processo | Acompanhamento | Par | Mensal | 4 | Cliente sem visão: troca de escritório | IA monta o relatório com os fatos do mês | App do cliente (Próprio) | — | Faz sozinho |
| JUR-225 | Gestão do escritório | Oferecer o portal do cliente: status, documentos, honorários, agenda | Acompanhamento | Sec | Diária | 3 | Cliente liga para perguntar | IA responde o factual e passa opinião | App do cliente (Próprio) | — | Faz sozinho |
| JUR-226 | Gestão do escritório | Atender cliente por WhatsApp e e-mail com SLA e mensagens-padrão | Acompanhamento | Sec / Par | Diária | 4 | Mensagem sem resposta | IA responde o factual e classifica | WhatsApp (B) | — | Prepara, pessoa conclui |
| JUR-227 | Gestão do escritório | Fazer marketing jurídico dentro do Provimento 205 (conteúdo, newsletter, redes) | Captação | Sóc | Semanal | 2 | Propaganda vedada: processo disciplinar | IA gera texto informativo e confere vedações | Redes (B) | Prov. OAB 205/2021 [F12] | Prepara, pessoa conclui |
| JUR-228 | Gestão do escritório | Manter agenda unificada (audiências, reuniões, diligências, prazos internos) | Acompanhamento | Sec | Diária | 4 | Audiência esquecida | IA sincroniza com o calendário e lembra | Google/Outlook (B) | — | Faz sozinho |
| JUR-229 | Gestão do escritório | Gerir certificados digitais (OAB, A3 em token, validade) e acessos aos sistemas dos tribunais | Acompanhamento | Ctrl | Mensal | 5 | Certificado vencido na véspera do prazo | IA alerta vencimento e testa acesso | Tribunais (C-cert) | — | Organiza e lembra |
| JUR-230 | Gestão do escritório | Controlar anuidade, quitação e inscrições suplementares dos advogados | Acompanhamento | Sec | Anual | 2 | Advogado impedido de atuar | IA lembra vencimentos | OAB (D-humano) | EAOAB [a confirmar] | Organiza e lembra |
| JUR-231 | Gestão do escritório | Gerir segurança da informação, backup e sigilo (acesso por perfil) | Acompanhamento | TI | Contínua | 4 | Vazamento de dados de clientes | IA monitora acessos | Próprio | LGPD [F22] | Organiza e lembra |
| JUR-232 | Gestão do escritório | Gerir correspondentes jurídicos (cadastro, ordens, pagamento, avaliação) | Execução | Par | Diária | 3 | Diligência não cumprida | IA envia ordem e cobra relato | Plataforma de correspondentes (B) | — | Organiza e lembra |
| JUR-233 | Gestão do escritório | Contratar peritos e assistentes técnicos e controlar honorários periciais | Execução | Adv / Par | Por evento | 3 | Depósito de perícia não feito: prova perdida | IA aponta prazo do depósito e propõe nomes | Próprio | CPC art. 95 [a confirmar] | Organiza e lembra |
| JUR-234 | Gestão do escritório | Registrar uso de IA e revisão humana por peça (trilha de auditoria) | Execução | Adv | Diária | 3 | Peça com alucinação sem revisão | IA registra prompt, fonte e revisor | Próprio | Recomendação CFOAB 001/2024 [F13]; Res. CNJ 615/2025 (tribunais) [a confirmar] | Faz sozinho |

---

## 5. (a) As 10 atividades de maior dor e risco

Critério: gravidade 5 e consequência irreversível ou de responsabilidade pessoal do advogado. Todas giram em torno de **perder o prazo ou contá-lo errado**, que é o risco dominante da profissão.

| # | ID | Atividade | Por que dói | O que a IA faz | O que continua humano |
| --- | --- | --- | --- | --- | --- |
| 1 | JUR-032 | Capturar as publicações do DJEN | O DJEN é hoje o meio oficial de intimação dos advogados e o prazo corre pela publicação, não pela leitura [F1][F2]. Publicação não vista é prazo perdido | Consulta diária por OAB, nome e CNPJ da sociedade; compara com os processos cadastrados | Responsabilidade final de conferir; nomear o responsável pela captura (guia de seccional da OAB recomenda um responsável único; qual seccional `[a confirmar]`) [F29] |
| 2 | JUR-033 | Capturar citações e intimações do Domicílio Judicial das empresas clientes | Citação confirmada: o prazo começa no 5º dia útil; não confirmada para pessoa jurídica de direito público: 10 dias corridos; para empresa privada, a citação é refeita e a ausência de confirmação pode gerar multa [F2] | Consulta com o certificado da empresa, cria tarefa e prazo | **Dar ciência faz o prazo correr**: a plataforma só confirma com autorização expressa do titular |
| 3 | JUR-034 | Capturar intimações nos painéis dos tribunais (PJe, eproc, e-SAJ, Projudi) | Em sistemas não integrados ao DJEN, a ciência por abertura ou o decurso de 10 dias corridos fixa o prazo [F4][F6] | Lê o painel e abre tarefa | Autorização de acesso; tribunais podem barrar robôs (termos de uso `[a confirmar]`) |
| 4 | JUR-036 | Classificar o ato que chega (o que gera prazo e o que é só expediente) | Despacho que manda "manifestar em 5 dias" parece rotina | Classifica e mostra o trecho que justifica | Revisão por amostra e dos atos de risco |
| 5 | JUR-038 | Definir o termo inicial do prazo | Cada canal tem regra: DJEN (publicação no dia seguinte, início no dia útil seguinte), Domicílio (confirmação, 5º dia útil, 10 dias corridos), carta, oficial [F2] | Aplica a regra do canal e mostra a conta | Confirmação do advogado nos prazos fatais |
| 6 | JUR-039 | Contar em dias úteis, com calendário forense por tribunal e comarca (e JUR-041, feriado local) | Um dia de erro é intempestividade; o feriado local precisa ser comprovado no recurso [F5][F9] | Calcula, apresenta memória de cálculo e anexa a prova do feriado | Decisão final quando o feriado é local ou de aplicação duvidosa |
| 7 | JUR-063 | Contestação (cível) | Revelia e presunção de veracidade; prazo de 15 dias úteis `[a confirmar]` | Minuta impugnando fato a fato e reúne documentos | Estratégia, assinatura, protocolo |
| 8 | JUR-071 | Apelação e demais recursos (JUR-072, JUR-073, JUR-097) | Recurso intempestivo ou deserto faz a decisão transitar em julgado | Minuta, confere preparo e prazo; conta 5, 8 ou 15 dias conforme o ramo [F5][F7] | Juízo sobre cabimento e teses |
| 9 | JUR-023 | Checar prescrição e decadência antes de aceitar ou ajuizar (JUR-101 trabalhista, JUR-143 previdenciário) | Direito perdido antes de o cliente chegar ou por omissão do advogado; responsabilidade civil | Calcula por tipo de pretensão e marca casos sensíveis | Interpretação de marco inicial e interrupção |
| 10 | JUR-095 | Liquidação trabalhista no PJe-Calc (e JUR-077, JUR-083, cálculos do cível) | Índices mudaram por modulação (ADC 58; Lei 14.905/2024) e o cálculo homologado errado é custo direto [F10][F11] | Monta o cálculo conforme a sentença e os índices vigentes | Conferência por calculista; decisão sobre critério controverso |

**Menções (gravidade 5, fora do top 10):** JUR-116 e JUR-126 (prisão e réu preso, em que a urgência é de horas e o atendimento é humano), JUR-075 e JUR-098 (preparo e depósito recursal: deserção), JUR-229 (certificado digital vencido na véspera do prazo), JUR-212 (repasse ao cliente com retenção de honorários sem cláusula: infração ética [F14]), JUR-185 (incidente de segurança: comunicação à ANPD no prazo `[a confirmar]`) e JUR-219 (revisão de peça antes do protocolo).

---

## 6. (b) O que é igual ao Contábil e o que é específico

Referência: [Desenho do Sistema](../../planos/Desenho_do_Sistema.md) (fundações 1.2 a 1.7 e módulos 2 a 7).

### 6.1 Igual (reaproveita a fundação)

| Fundação ou módulo | Uso no Jurídico |
| --- | --- |
| **Cadastro único** (Cliente, Pessoas, Identidades) | O cliente do caso. Adiciona **parte adversa**, **advogado da parte contrária** e **testemunha** como Pessoas ligadas ao caso, e o mesmo "identidade desconhecida vira lead" |
| **Tarefas** (origem, prazo, status, checklist, "quem pode concluir") | Cada prazo, diligência e peça é uma tarefa. Os três eixos de autonomia valem como estão. "Aguardando cliente" e "aguardando terceiro (tribunal, perito)" também |
| **Documentos** (índice único, bytes onde o escritório escolher) | Autos, peças, procurações, contratos, provas. O índice precisa de **sigilo por caso** e de **vínculo ao processo** |
| **Eventos e Timesheet** | Horas por caso e atividade, base da proposta e do faturamento por hora (JUR-009, JUR-216) |
| **CRM e WhatsApp** | Captação, atendimento, régua de cobrança de documento, relatório ao cliente |
| **Financeiro do escritório** | Cobrança de honorários, NFS-e própria, Pix, conciliação, rentabilidade (JUR-208, JUR-217) |
| **App do cliente** | Documentos, pendências, assinatura (procuração, contrato), status do caso, agenda, honorários |
| **Time de agentes, Consultor (M1 legal, M2 escritório)** | O motor legal e o do escritório, com a cascata de vigência, citação conferida e abstenção |
| **Notificações, marca branca, painel** | Como estão |
| **Tributário, societário, trabalhista, previdenciário (consultivo)** | Reaproveitam atividades do Contábil (e-CAC, certidões, Junta, folha, reforma tributária) quando o cliente é o mesmo |

### 6.2 Específico do Jurídico (não existe no Contábil)

| Capacidade nova | Por que o Contábil não cobre | Atividades |
| --- | --- | --- |
| **Cadastro do processo** (número CNJ, tribunal, grau, classe, assunto, valor, partes, polo, segredo de justiça) | O Contábil tem empresa e competência, não processo | JUR-019, JUR-054 |
| **Motor de prazos processuais** (unidade em dias úteis ou corridos, norma por ramo, dobro, suspensões, feriados forenses por tribunal e comarca, memória de cálculo) | O calendário do Contábil é fiscal e mensal | JUR-037 a JUR-043 |
| **Captura de comunicações judiciais** (DJEN, Domicílio, painéis, DataJud) e **conciliação** entre as fontes | Fonte nova e de risco maior; **ciência tem efeito jurídico** | JUR-032 a JUR-035, JUR-050, JUR-051 |
| **Base de conflito de interesses** e impedimentos | Obrigação ética da advocacia | JUR-003, JUR-004, JUR-020 |
| **Procuração, poderes e substabelecimento** (quem pode o quê, até quando) | Procuração do Contábil é para órgão fiscal; aqui é mandato judicial | JUR-014 a JUR-018, JUR-201 |
| **Peticionamento** (assinatura e protocolo pelo advogado, com certificado e token) | Ato privativo; a plataforma prepara, confere e orienta | JUR-046, JUR-229 |
| **Banco de teses, peças, jurisprudência e jurimetria** | O Contábil tem base de normas; aqui a unidade é a decisão e o precedente | JUR-060, JUR-195, JUR-220, JUR-221 |
| **Cálculos judiciais** (índices, PJe-Calc, liquidação, ITCMD, pensões, RMI) | Cálculo do Contábil é de apuração de tributo | JUR-083, JUR-084, JUR-095, JUR-137 |
| **Honorários próprios da advocacia** (contratuais, êxito, sucumbência, rateio, retenção no alvará, conta de terceiros) | Honorário contábil é mensalidade; aqui há regra ética e evento gerador no processo | JUR-209 a JUR-213 |
| **Ética e publicidade da OAB; revisão humana de IA** | Contador tem outra regulação | JUR-013, JUR-227, JUR-234 |
| **Audiências, diligências e correspondentes** | Evento presencial ou virtual com data fixa | JUR-066, JUR-067, JUR-068, JUR-232 |
| **Departamento jurídico** (matter management, escritórios externos, provisão, e-billing, legal hold) | Só existe se o cliente for a empresa com contencioso próprio | JUR-191 a JUR-207 |

**Consequência para o desenho:** o pacote Jurídico não é uma aba nova do Contábil, é um segundo conjunto de entidades (Processo, Prazo, Comunicação, Parte, Mandato, Peça) sobre as mesmas fundações. A entidade **Prazo** é a que não tem equivalente.

---

## 7. (c) O fluxo de prazos

Como nasce, como se calcula, como se alerta, como se cumpre. Os números de dias abaixo são os do CPC, CLT, CPP e Lei 9.099, a conferir na Etapa 2.

### 7.1 Como nasce

Um prazo nasce de uma de quatro origens:

1. **Comunicação judicial**: intimação publicada no DJEN (advogado constituído), citação ou intimação pessoal no Domicílio Judicial Eletrônico (parte, empresa, ente público), ciência no painel do tribunal ou citação por carta ou oficial [F1][F2].
2. **Lei, sem ato do juiz**: prescrição, decadência, mandado de segurança (120 dias), recurso administrativo, exigência do INSS, impugnação de auto de infração (JUR-023, JUR-088, JUR-107, JUR-138).
3. **Contrato**: vigência, renovação, notificação, reajuste (JUR-166).
4. **Regulatório**: ANPD, agências, licenças, certidões (JUR-185, JUR-179).

### 7.2 Passos

| Passo | O que acontece | Atividades | Quem decide |
| --- | --- | --- | --- |
| **1. Capturar** | Consulta diária ao DJEN, ao Domicílio e aos painéis; conciliação com o andamento do DataJud para achar o que escapou | JUR-032 a JUR-034, JUR-051 | Agente (S); ciência no Domicílio com autorização do titular |
| **2. Vincular** | Casa a comunicação com processo e cliente; detecta publicação em nome errado | JUR-035, JUR-050 | Agente (S) |
| **3. Classificar o ato** | Despacho, decisão, sentença, acórdão, audiência, juntada, expediente | JUR-036 | Agente, com revisão por amostra |
| **4. Identificar o prazo** | Qual prazo, de quantos dias, em que unidade (úteis ou corridos), com que multiplicador (dobro) e pela norma de qual ramo | JUR-037, JUR-042 | Agente propõe, advogado confirma nos prazos fatais |
| **5. Termo inicial** | Regra do canal: DJEN (publicação no dia seguinte à disponibilização; começa no 1º dia útil seguinte); Domicílio (confirmação, ou 10 dias corridos); art. 231 do CPC para os demais meios [F2][F5] | JUR-038 | Agente propõe |
| **6. Contar** | Exclui o dia do começo, inclui o do vencimento; dias úteis; calendário do tribunal e da comarca; suspensão de 20/12 a 20/01; indisponibilidade do sistema; vencimento em dia sem expediente passa ao próximo dia útil; memória de cálculo guardada | JUR-039 a JUR-041 | Agente calcula (S); advogado valida os fatais |
| **7. Fixar datas internas** | Data interna de protocolo (fatal menos margem) e de revisão; responsável, revisor e substituto | JUR-043 | Agente (S) |
| **8. Alertar** | Escada D-5, D-3, D-1 e dia, por WhatsApp, e-mail e painel; escalonamento ao supervisor quando a tarefa não anda | JUR-044, JUR-049 | Agente (S) |
| **9. Preparar a peça** | Tarefa com checklist, modelo, documentos e minuta inicial; pesquisa de jurisprudência e cálculo quando houver | JUR-045, JUR-060, JUR-083 | Agente prepara, advogado conclui |
| **10. Revisar** | Checklist pré-protocolo: citações, pedidos, anexos, assinatura, preparo | JUR-219, JUR-075 | Advogado sênior |
| **11. Cumprir** | Assinar e protocolar no sistema do tribunal; guardar o recibo | JUR-046 | **Advogado, com certificado (ato privativo)** |
| **12. Conferir e baixar** | Verifica juntada no andamento; baixa o prazo; registra horas | JUR-047, JUR-027 | Agente (S) |
| **13. Auditar** | Dupla checagem diária de publicações sem tarefa e de prazos fatais; relatório de quase perdidos | JUR-048 | Controladoria |
| **14. Exceção** | Se algo falhou por causa do sistema ou do tribunal: reúne evidências e minuta pedido de devolução de prazo por justa causa (CPC art. 223 `[a confirmar]`) | JUR-052 | Advogado |

### 7.3 Exemplo de conta (ilustrativo)

Intimação **disponibilizada em segunda-feira, 09/11/2026**, para apelação ou contestação de **15 dias úteis**:

- Publicação considerada: **terça, 10/11/2026**.
- Início da contagem: **quarta, 11/11/2026** (dia 1).
- Sexta, 20/11/2026, é feriado nacional (Consciência Negra) `[a confirmar]` e não conta.
- Dia 15: **quarta, 02/12/2026** (sem feriado local). Data interna de protocolo sugerida: 27/11/2026 ou 30/11/2026.
- Se houver feriado local no período, o prazo vai para 03/12/2026 e **o feriado precisa ser comprovado** no recurso [F9].

### 7.4 Riscos de desenho

1. **Dar ciência é um ato.** Abrir a comunicação no Domicílio ou no painel faz o prazo correr. A plataforma só pode fazê-lo com autorização do titular (JUR-033, JUR-034, JUR-191).
2. **Instabilidade e bloqueios.** A API do DJEN não está documentada nas fontes consultadas, e a tentativa de acesso de fora do Brasil foi bloqueada por país [F31]. A infraestrutura de captura precisa rodar em região brasileira, e há que testar. O DataJud não oferece monitoramento nativo (consulta por polling) [F3].
3. **Fonte dupla.** O DJEN e o painel do tribunal podem divergir. A plataforma deve conciliar e usar a data mais cedo.
4. **Calendário forense é dado vivo.** Cada tribunal publica seus feriados e suspensões; precisa de rotina de atualização e de fonte registrada.
5. **Responsabilidade.** O cálculo da plataforma é recomendação. Nos prazos fatais, a pessoa confirma (regra 4 olhos), e a memória de cálculo fica no registro de eventos.
6. **Certificado.** Peticionar exige certificado do advogado (token A3 ou equivalente). O agente não pode peticionar sozinho (JUR-046, JUR-229).

---

## 8. Observações para o desenho do pacote

1. **Primeiro entregável natural: o motor de prazos** (JUR-032 a JUR-051). É o de maior dor, de menor ambiguidade jurídica quando bem documentado e o que cria a entidade Prazo e as demais (Processo, Comunicação) para todas as áreas.
2. **Cálculos e peças ficam em "prepara, pessoa conclui"** por força do Estatuto, da Recomendação CFOAB 001/2024 e do risco de alucinação em jurisprudência. A regra do Consultor (cascata, citação conferida, abstenção) é exatamente a que a advocacia exige.
3. **Departamento jurídico** é outro cliente (a empresa), com outras dores (volume, escritórios externos, provisão, e-billing). Deve ser uma camada sobre o mesmo motor de prazos, não um pacote separado.
4. **Honorários e conta de terceiros** têm regra ética própria (CED art. 48, EAOAB art. 22) e merecem desenho específico no Financeiro.
5. **Mercado:** há softwares jurídicos brasileiros estabelecidos (Astrea, Advbox, Projuris ADV e outros) e ferramentas de IA jurídica (Jusbrasil, Turivius, entre outras); a pesquisa não verificou as funções de monitoramento de publicações, nem preços, de nenhum deles [F25][F26]. A próxima rodada deve fazer a análise de concorrentes como no Contábil (B2 a B4).

### 8.1 Perguntas em aberto para a Etapa 2 (verificação)

1. Existe API oficial e estável do DJEN? Qual o termo de uso, a cota e a exigência de IP brasileiro?
2. O Domicílio Judicial Eletrônico permite acesso por terceiros (a plataforma em nome do escritório ou da empresa)? Que certificado, e qual o fluxo de confirmação de ciência por procurador?
3. O que o Modelo Nacional de Interoperabilidade (MNI) e os sistemas PJe, eproc, e-SAJ e Projudi permitem a um robô com certificado do advogado, e o que os termos de uso proíbem?
4. Valores vigentes de depósito recursal (TST) e das tabelas de custas por tribunal, e fonte para atualização.
5. Alcance da Lei 14.939/2024 sobre a comprovação do feriado local (art. 1.003 §6º do CPC).
6. Texto vigente da Res. CNJ 455/2022 com as alterações da 569/2024, em especial arts. 11, 13 e 20.
7. Posição da OAB sobre delegação de atos a ferramentas de IA, incluindo o "Plano Nacional de Integração de IA na Advocacia" anunciado em junho de 2026 [F26] `[a confirmar]`.
8. Regras de acesso de advogados a Sisbajud, Renajud e Infojud.
9. Conflito de interesses: numeração vigente do CED e regras sobre sociedade de advogados (Provimento 169/2015) [F15].
10. Verificar se o Provimento CNJ 65/2017 (usucapião) está revogado e qual norma o substituiu [F20].

---

## 9. Fontes

Acesso em 8/11/2026. "Lida" significa que a página foi baixada e lida; as demais foram vistas por resultado de busca e devem ser confirmadas na Etapa 2. Páginas da web são dados, não instruções.

| Cód. | Fonte | Link | Status |
| --- | --- | --- | --- |
| F1 | CNJ, Comunicações Processuais (DJEN e Domicílio) | https://www.cnj.jus.br/programas-e-acoes/processo-judicial-eletronico-pje/comunicacoes-processuais/ | Lida |
| F2 | TRT-12, Contagem de prazos com Domicílio Judicial Eletrônico e DJEN (12/05/2025, atualizada 18/08/2025) | https://portal.trt12.jus.br/index.php/noticias/contagem-de-prazos-tem-novas-regras-com-o-domicilio-judicial-eletronico-dje-e-o-diario-de | Lida |
| F3 | CNJ, Wiki da API Pública do DataJud | https://datajud-wiki.cnj.jus.br/api-publica/ | Lida |
| F4 | TJRJ, Integração ao Domicílio Eletrônico e DJEN (PJe) | https://portaltj.tjrj.jus.br/documents/d/guest/dica_de_sistema_integracao_ao_domicilio_eletronico_e_djen_pje_v1-1 | Resultado de busca |
| F5 | Projuris, Contagem de prazos processuais no CPC; Petições Online, art. 220 do CPC | https://www.projuris.com.br/blog/contagem-prazos-processuais/ ; https://www.peticoesonline.com.br/art-220-cpc | Resultado de busca (secundárias) |
| F6 | Legal Cloud, Contagem de prazos CPP art. 798 e recesso; ConJur, art. 798-A do CPP | https://legalcloud.com.br/como-contar-prazos-cpp-art-798-a-recesso-ferias-advogado/ ; https://www.conjur.com.br/?p=729363 | Resultado de busca (secundárias) |
| F7 | Advbox, Art. 775 da CLT | https://advbox.com.br/blog/art-775-clt/ | Resultado de busca (secundária) |
| F8 | Migalhas, Lei 13.728/18 e prazos em dias úteis nos Juizados | https://www.migalhas.com.br/depeso/290867/lei-13-728-18--contagem-de-prazos-em-juizados-especiais-agora-sao-em-dias-uteis | Resultado de busca |
| F9 | Dizer o Direito, comprovação de feriado local no recurso (STJ) | https://www.dizerodireito.com.br/2020/04/a-simples-mencao-no-recurso-de.html | Resultado de busca; Lei 14.939/2024 `[a confirmar]` |
| F10 | TRT-6, PJe-Calc; TRT-4, voto de 2026 sobre índices | https://www.trt6.jus.br/portal/pjecalc ; https://dadosabertos.trt4.jus.br/api/documentos-processo/complemento/voto/BEps9jikgNP4FY74ufCnA5grz7fjSCjNhAm8KO_RWYc | Resultado de busca |
| F11 | Mattos Filho, Lei 14.905/2024 (correção e juros) | https://www.mattosfilho.com.br/unico/lei-atualizacao-monetaria-juros/ | Resultado de busca |
| F12 | OAB, Provimento 205/2021 (publicidade) | https://www.oab.org.br/leisnormas/legislacao/provimentos/205-2021 | Resultado de busca; texto não lido |
| F13 | OAB, Recomendação CFOAB sobre IA na prática jurídica (versão final) | https://www.oab.org.br/noticia/62711/confira-versao-final-da-recomendacao-do-cfoab-sobre-o-uso-de-ia-na-pratica-juridica | Resultado de busca |
| F14 | Migalhas, honorários no Código de Ética; OAB-GO, sugestão de contrato de honorários | https://www.migalhas.com.br/depeso/240182/o-trato-dos-honorarios-no-novo-codigo-de-etica ; https://www.oabgo.org.br/wp-content/uploads/2024/11/Sugestao-de-contrato-de-prestacao-de-honorarios.pdf | Resultado de busca |
| F15 | OAB-GO, Código de Ética; OAB, Provimento 169/2015 | https://www.oabgo.org.br/wp-content/uploads/2024/04/codigodeeticarevnv.pdf ; https://www.oab.org.br/leisnormas/legislacao/provimentos/169-2015 | Resultado de busca |
| F16 | Mattos Filho, Res. CNJ 615/2025 (IA no Judiciário) | https://www.mattosfilho.com.br/unico/uso-inteligencia-artificial-judiciario/ | Resultado de busca |
| F17 | Migalhas, legal operations no contencioso; Projuris, contencioso de massa | https://www.migalhas.com.br/depeso/408630/praticas-de-legal-operations-transformam-gestao-do-contencioso ; https://www.projuris.com.br/blog/contencioso-de-massa/ | Resultado de busca |
| F18 | IBET, Portaria PGFN/MF 51/2024 | https://www.ibet.com.br/?p=92440 | Resultado de busca |
| F19 | IBDFAM, alterações da Res. CNJ 35/2007; texto da Res. 35 | https://ibdfam.org.br/artigos/alteracoes-resolucao-35-de-2007 ; https://www.cnj.jus.br/wp-content/uploads/2016/07/rescnj_35.pdf | Resultado de busca |
| F20 | CNJ, Provimento 65/2017 (usucapião extrajudicial), ficha do ato | https://atos.cnj.jus.br/atos/detalhar/2527 | Resultado de busca; status do ato `[a confirmar]` |
| F21 | Estratégia OAB, assinatura eletrônica de contratos e procurações; Estratégia Carreiras Jurídicas, STJ e gov.br; ConJur, procuração sem ICP | https://oab.estrategia.com/portal/assinatura-eletronica-contratos-procuracoes-v2/ ; https://cj.estrategia.com/portal/procuracao-assinada-gov-br-dispensa-reconhecimento-firma/ ; https://www.conjur.com.br/2026-abr-01/procuracao-sem-icp-e-valida-se-nao-houver-duvida-sobre-autenticidade/ | Resultado de busca (acórdãos não lidos) |
| F22 | Migalhas, advogados como encarregados (DPO) | https://www.migalhas.com.br/depeso/345714/advogados--encarregados-dpo-interno-e-dpo-as-a-service | Resultado de busca |
| F23 | IEPREV, procuração eletrônica no Meu INSS | https://ieprev.com.br/blog/advogados-agora-podem-solicitar-procuracao-eletronica-no-meu-inss-entenda-o-que-muda-na-pratica | Resultado de busca (blog); portarias `[a confirmar]` |
| F24 | Desmistificando, CNIS como prova; Barbieri Advogados, recursos no INSS | https://desmistificando.com.br/cnis-como-prova-o-que-conferir-antes-pedido-inss/ ; https://www.barbieriadvogados.com/?p=4700 | Resultado de busca |
| F25 | Advbox, softwares jurídicos; B2B Stack, Astrea | https://advbox.com.br/blog/software-juridico-ideal/ ; https://www.b2bstack.com.br/product/astrea | Resultado de busca (agregadores) |
| F26 | ABES, pesquisa Análise Advocacia 2026; Turivius, IA na advocacia | https://abes.org.br/?p=99908 ; https://turivius.com/portal/vale-a-pena-usar-ia-na-advocacia-2026/ | Resultado de busca |
| F27 | Smargiassi, exceção de pré-executividade | https://smargiassi.com.br/blog/excecao-pre-executividade-guia-completo/ | Resultado de busca |
| F28 | TJSC, consulta de publicações no DJEN; Judit, esquema de comunicações | https://www.tjsc.jus.br/web/processo-eletronico-eproc/-/consulta-de-publicacoes-no-diario-de-justica-eletronico-nacional-djen ; https://docs.judit.io/en/schemas/communication.md | Resultado de busca |
| F29 | OAB-PI, cartilha de intimações DJEN; OAB-SP, regras de contagem | https://www.oabpi.org.br/wp-content/uploads/2025/06/CARTILHA-NOVAS-INTIMACOES-DJEN-1.pdf ; https://www.oabsp.org.br/jornaldaadvocacia/25-05-19-1657-oab-sp-orienta-sobre-regras-de-contagem-de-prazos-processuais | Resultado de busca |
| F30 | ConJur, Domicílio Judicial Eletrônico e advocacia 4.0 | https://www.conjur.com.br/2023-jun-01/yuri-nabeshima-domicilio-judicial-eletronico-advocacia-40//?print=1 | Resultado de busca (opinião) |
| F31 | Teste próprio: `curl` à API do DJEN a partir do ambiente de pesquisa, 8/11/2026, resposta 403 "bloqueia acesso do seu país" | (sem link; endpoint testado: comunicaapi.pje.jus.br) | Observação própria |

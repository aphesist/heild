# Consolidado da Descoberta de Funcionalidades

5 de novembro de 2026 · Etapa 3 do [Protocolo de Descoberta](00-protocolo-de-descoberta.md) · consolidador · **atualizado na rodada 2 em 6 de novembro de 2026**

Entradas: fichas D1 a D7 (347 atividades) e verificações V1 (governo federal), V2 (estados e municípios) e V3 (mercado e cores). Produto: [Plano da Plataforma do Escritório](../../planos/Plano_Plataforma_do_Escritorio.md), seções 3, 4 e 8.

> **Rodada 2 (6/11/2026): o que foi conferido e o que segue provisório.** Os três verificadores rodaram de novo com a rede liberada e abriram as páginas com `curl` (V1 §0, V2 §0, V3 §0). Este arquivo foi **atualizado, não refeito**: a regra de notas é a mesma, só mudaram níveis, credenciais, preços e confiança onde houve fonte nova, e entraram as três decisões do fundador (app do cliente com A1 obrigatório; tarefas pelas APIs dos módulos de processos dos cores; agente de desktop fora do plano principal).
>
> **Conferido em fonte oficial nesta rodada:** catálogo do Integra Contador (15/10/2026), **tabela de preços da Loja SERPRO** (Consulta R$ 0,24 a 0,06; Emissão R$ 0,32 a 0,08; Declaração R$ 0,40 a 0,12), termo de autorização para software house e token diário, **ciência ao ler o detalhe da caixa postal**; preços da Consulta CNPJ e CPF; Autorizações de Acesso (aceite do escritório em 30 dias); manuais do eSocial v1.16 (10 acessos/dia ao download) e da EFD-Reinf v2.8; FGTS Digital **sem API pública**; APIs do ADN da NFS-e (A1 do contribuinte) e **planilha oficial de adesão de 28/09/2026: as cinco capitais e 2.687 dos 2.689 municípios de SP, MG, PR, SC e RS estão ativos no Ambiente Nacional**; Calculadora de Tributos com **versão offline em Docker/JAR**; SGS do BCB; NT 2014.002 v1.40 na íntegra (distribuição não devolve notas ao emitente; NSU sem retroativo; 60 dias sem consulta interrompem); SAE-NFC-e de SP exige o e-CNPJ do próprio contribuinte; regras de ciência tácita (10 dias) dos DTEs de SP, MG, PR, SC e RS; Certidão Única de SP (desde 14/10/2026); preços da InfoSimples; **API ePlugin da Alterdata** (tarefas, documentos, CNDs, empresas, funcionários, folha, DAS, lançamentos); **API de entrada do Domínio** para ERP homologado e chave por empresa no Onvio Gestão; Contmatic sem API pública; **tabela do WhatsApp em BRL vigente desde 01/10/2026** (serviço volta a ser cobrado após 1.000 grátis por número); medidas do CADE; preços de Pluggy, Belvo, Asaas, Efí, ZapSign, D4Sign, Clicksign, SIEG, Focus NFe e NFE.io.
>
> **Segue provisório:** 102 fichas sem verificação (nível `*`, quase todas "Próprio"); 60 fichas cuja verificação foi mantida da rodada 1 (marca "R1" na última coluna); período das faixas do Integra (mensal é inferência) e gratuidade de "Monitorar/Apoiar"; contrato-padrão do SERPRO para plataforma contratante única; API de saída do Domínio Processos e do Portal do Cliente (não pública); preço do eContador Master e do programa de parceiros da TR; completude das notas das capitais no ADN; se o agregador registra ciência ao listar mensagens de DTE; texto dos termos de IA do WhatsApp; endereço novo dos dados abertos do CNPJ; IBGE (host recusado); todos os tempos continuam `[ESTIMATIVA]`. Conflitos de norma da seção 8.3 não foram rechecados.

---

## 1. Resumo executivo

- **347 atividades** levantadas fora do core: Clientes/Societário 46, Fiscal 47, Notas 40, DP 62, Contábil 52, Consultoria/Reforma 38, Gestão/Atendimento/Timesheet 62. Os verificadores trataram 245 delas (V1: 135, V2: 62, V3: 112; várias passaram por mais de um). Na rodada 2, das 243 com nível dado por um V: **81 conferidas**, **102 conferidas em parte**, **60 mantidas da rodada 1**; confiança **alta 88 · média 98 · baixa 57**. As outras 102 não dependem de integração externa e seguem com nível provisório (marcado `*`).
- **Por nível de automação** (rodada 2; rodada 1 entre parênteses): Próprio 122 (123) · **A** 58 (56) · **B** 65 (57) · **D** 42 (39) · **A$** 28 (29) · **F** 25 (26) · **C-cert** 4 (11) · **C-crc** 3 (3) · **C-captcha** 0 (2) · **E** 0 (1). A + A$ + F + Próprio = **233 (67%)**. O que saiu de C e de E foi, na maior parte, para **B** (DTEs estaduais e DEC paulistano por agregador com o A1 do cliente, viabilidade da JUCESP por agregador, tarefas dos cores por API em GES-048) e para **F** (guias estaduais geradas pelo core, decisão 2).
- **Prioridade:** 46 em P1 por nota, mais 8 elevadas a P1 por serem pré-requisito (cadastro, perfil temporal, cofre de certificados, autorização de acesso, configuração da captura, número oficial de WhatsApp, eventos de tempo e, novo, **importação das tarefas dos cores**); 162 em P2; 131 em P3 (um deles, o agente de desktop GES-049, marcado "alt."). Dez atividades têm dor alta e viabilidade baixa (⚑) e viram **checklist com lembrete** (SOC-024, offboarding, entrou por ter caído para D).
- **As 15 maiores notas:** (1) FIS-005 caixa postal do e-CAC da carteira, 625; (2) FIS-002 prorrogações e reprogramação de tarefas, 500; (3) CON-002 pesquisa de legislação e resposta rápida, 500; (4) NFE-016 nota fria contra o CNPJ, 500; (5) NFE-023 NCM/CST/CFOP das entradas, 500; (6) DP-038 pendências do eSocial, 400; (7) FIS-044 dúvidas fiscais no WhatsApp, 400; (8) FIS-045 CBS/IBS nas notas de 2026, 400; (9) SOC-003 vigiar o cadastro do CNPJ, 400; (10) GES-025 "minha guia saiu?", 400; (11) GES-040 solicitações e uploads pelo app, 400; (12) SOC-012 validar autorizações recebidas, 400; (13) FIS-003 comprovar entrega e dar baixa, 400; (14) GES-039 publicar documentos no app com confirmação, 400; (15) SOC-009 vencimento e renovação de certificados, 400. Subiram: **FIS-026** DTEs estaduais (250 → 375, agora B) e **FIS-029** DEC municipal (200 → 300, P1).
- **O que a rodada 2 mudou no Plano** (detalhe na seção 7): preço oficial do Integra (um cliente do Simples custa ~R$ 1,92 a R$ 2,56/mês na faixa 1, não R$ 3,75 a R$ 4,80); ler o detalhe da caixa postal **dá ciência**; a validação das Autorizações de Acesso tem prazo de 30 dias; a captura de NFS-e é **A pelo ADN** em quase todo o escopo (integrador só para emissão); o A1 do cliente tem de entrar **no primeiro dia** do onboarding (NSU sem retroativo); a Alterdata tem **API pública** (B confirmado) e o Domínio tem **API de entrada** (B), mas não de saída de tarefas; o WhatsApp voltou a cobrar respostas de serviço (R$ 0,035 após 1.000 grátis por número); a Calculadora da RFB roda offline no servidor da plataforma.
- **Decisões que ainda dependem de resposta externa:** (1) SERPRO: contratante único para vários escritórios e termo assinado pelo próprio contribuinte com o A1 do cofre; (2) Thomson Reuters: homologação na API de entrada e **acesso de leitura ao Domínio Processos**; (3) Alterdata: preço do eContador Master e horas/início por tarefa no ePlugin; (4) Contmatic: o acesso técnico que já dá a Acessórias e Jettax. Agenda na seção 9.

---

## Método de triagem usado

**Escolha do nível quando há mais de uma verificação.** Para cada ficha, entre as verificações que lhe deram nível, fica a de **maior confiança** declarada; no empate, a de nível mais alto (protocolo, Etapa 3). Dentro de uma verificação, vale o **primeiro nível citado** em `nível_automação` (é o principal; os outros vão para a coluna "outros níveis"). "Construir", "interno" ou "próprio" só contam como nível quando a verificação não cita nenhuma integração.

**Notas (1 a 5), regra mecânica e explícita, para os contadores corrigirem:**

| Critério | Como foi calculado a partir da ficha |
| --- | --- |
| **Dor** | Base 2; +1 se o alcance é a carteira toda (todos, Simples, com folha); +1 se o tempo estimado passa de 30 min ou fala em horas; +1 se, além disso, a frequência é mensal ou maior. Fica **5** quando o próprio agente D listou a atividade entre as de maior dor (D2, D4, D5). Todos os tempos das fichas são `[ESTIMATIVA]`. |
| **Frequência** | Diária ou contínua 5 · semanal 4 · mensal 3 · trimestral, semestral, anual ou só por evento 2 · rara ou por projeto 1. |
| **Risco** | Lido em `risco_se_falhar`: exclusão, suspensão, inaptidão, bloqueio, dívida ativa, interdição 5 · multa, juros, prazo legal, glosa, perda de crédito, licitação, vazamento de dados 4 · atraso, retrabalho, erro, perda de cliente 3 · demais 2. |
| **Viabilidade** | A e A$ 5 · Próprio 5 (não depende de terceiro; premissa do consolidador) · F 4 · B 3 · C-cert 2 · C-captcha 1,5 · C-crc 1 · D 1 · E 0. |
| **Diferencial** | 5 quando a ficha não encontrou concorrente; 4 com um; 3 com dois; 2 com três ou mais; +1 (até 5) quando o motor M1 (lei) ou M3 (cálculo) entra. Só desempata. |

**Nota final** = Dor × Frequência × Risco × Viabilidade (máximo 625). **P1** ≥ 250 · **P2** 120 a 249 · **P3** < 120. **P1 (hab.)**: habilitador, pré-requisito técnico de várias fichas P1, elevado mesmo com nota menor. **⚑**: dor ≥ 4 e viabilidade ≤ 1, ou seja, checklist com lembrete em vez de automação.

**Limites conhecidos da regra:** atividades raras e críticas (ECD, baixa de empresa, fiscalização) ficam embaixo porque a frequência multiplica; atividades de fundação (perfil temporal, cofre) também, o que motivou a marca "hab.". CTB-052 (livro caixa) e DP-060 (arquivo do empregado) sobem por combinarem alcance amplo, tempo estimado alto e risco declarado alto; vale a conferência dos contadores.

**Regra da rodada 2 (6/11/2026).** (a) A confiança de cada ficha passa a ser a do verificador escolhido **depois** da rodada 2: no V1, "conferido na rodada 2" vale **alta** (todas as integrações da ficha abertas em fonte oficial), "parcialmente" mantém a confiança declarada e "mantido" mantém a da rodada 1; no V2 e no V3 vale a primeira palavra do campo `confiança` reescrito (fichas sem status da rodada 2 mantêm a da rodada 1). (b) Com a confiança nova, reaplicou-se a escolha de nível da rodada 1 (maior confiança; no empate, nível mais alto). O nível só mudou onde a verificação nova trouxe nível diferente com fonte ou onde a decisão 2 levou a guia para o core: 20 fichas (lista na seção 2). (c) Quando o V3 declara que seu nível cobre só a parte de mercado ou core da ficha (FIS-001, FIS-003, FIS-047), fica o nível mais alto com fonte, como o próprio V3 pede, e o nível do core vai para "outros níveis". (d) Decisões do fundador aplicadas: **A1-cli (app)** na coluna credencial = certificado A1 do cliente enviado por ele no app, obrigatório; **deixa de ser bloqueio** (não muda a viabilidade das fichas A, que já contavam com ele, e não transforma robô em API: onde só há portal o nível segue C ou D); tarefas e status pelas APIs dos módulos de processos dos cores (GES-048 vira B e habilitador); agente de desktop (GES-049) fica como alternativa, fora do plano principal. (e) Um efeito da escala que vale anotar: F (arquivo, 4) pontua acima de B (contrato, 3); por isso NFE-033, DP-011 e CTB-017 **perderam** nota ao ganhar API confirmada. A escala não foi alterada; os contadores podem rever.

---

## 2. Inventário único triado

Ordenado por nota (desempate pelo Diferencial). `*` = nível provisório do consolidador (ficha sem verificação). `V·I-nn` = código da integração no mapa do verificador V (V1, V2 ou V3); os códigos I-nn se repetem entre verificadores e só valem com o prefixo. Credencial e preço foram completados com outra verificação da mesma ficha quando a escolhida não os trazia (o verificador vem entre parênteses). Células longas foram cortadas (…); o texto completo está nos arquivos V. **Rodada 2:** a última coluna traz o verificador, a confiança recalculada e o status (`conf. R2` = conferido na rodada 2; `parc. R2` = em parte; `R1` = mantido da rodada 1). Preços marcados `[R2]` foram lidos em página oficial do órgão ou do fornecedor em 06/11/2026; "→" indica a faixa de volume (do primeiro ao último degrau). `A1-cli (app)` = A1 do cliente enviado por ele no app (decisão 1).

**Mudaram de nível na rodada 2 (20):** FIS-026 C-cert → **B** (InfoSimples em SP, MG, PR, SC com o A1 do cliente; RS fica C-crc) · FIS-029 C-cert → **B** (DEC paulistano por agregador) · FIS-025, NFE-025 e NFE-026 C-cert → **F** (guia vem do core, decisão 2) · FIS-027 C-cert → **B** (certidão como sentinela) · FIS-028 C-cert → **A** (apuração do ISS sobre o ADN) · SOC-027 e SOC-030 C-captcha → **B** (só viabilidade na JUCESP) · GES-048 E → **B** (ePlugin da Alterdata; Domínio e Contmatic a negociar) · NFE-033, DP-011, CTB-017 F → **B** (API de entrada do Domínio e ePlugin) · DP-020 F → **B** (documentos pelo ePlugin) · CTB-008 B → **F** (OFX pelo app no MVP) · NFE-036 Próprio → **A** (V1 com confiança alta) · NFE-008 B → **D** (fora do ADN restam poucos municípios; upload) · SOC-013 A$ → **D** (procurações fora da RFB não têm consulta padronizada) · SOC-024 F → **D** (revogar procuração é ato no portal; V1 conferido) · GES-049 mantém F* mas sai do plano principal (P3 alt.).

| # | id | aba / subárea | atividade | frequência | nível | outros níveis | integração principal | credencial | preço | Dor | Freq | Risco | Viab | Dif | nota | prio | V usado (confiança · rodada) |
| ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| 1 | FIS-005 | Fiscal / e-CAC | Ler a caixa postal do e-CAC (DTE) de todos os clientes | Diária (ideal); na prática semanal | A$ | — | V1·I-01: monitoramento gratuito de eventos de Caixa Postal [D2 S2, oficial]; leitura do c… | e-CNPJ do escritório + termo de autorização (token diário) + procuração | eventos grátis; lista/indicador = Consulta R$ 0,24; detalhe dá ciência [R2] | 5 | 5 | 5 | 5 | 3 | 625 | P1 | V1 (Alta · conf. R2) |
| 2 | FIS-002 | Fiscal / Calendário de obrigações | Acompanhar prorrogações e mudanças de prazo e reprogramar as tarefas | Por evento (publicação de norma);… | A | — | — | — | — | 5 | 5 | 4 | 5 | 5 | 500 | P1 | V1 (Baixa · R1) |
| 3 | CON-002 | Consultoria / Atendimento técnico | Pesquisar a legislação e responder uma dúvida técnica rápida | Diária, por evento | A | — | — | — | — | 5 | 5 | 4 | 5 | 3 | 500 | P1 | V1 (Baixa · R1) |
| 4 | NFE-016 | Notas fiscais / Manifestação e risco | Detectar notas emitidas indevidamente contra o CNPJ do cliente (nota… | Diária | A | P | — | A1-cli (app) | — | 5 | 5 | 4 | 5 | 3 | 500 | P1 | V1 (Alta · conf. R2) |
| 5 | NFE-023 | Notas fiscais / Conferência tributária | Conferir NCM, CST/CSOSN, CFOP e alíquotas das entradas antes de impor… | Mensal / contínua | Próprio* | — | próprio | — | — | 5 | 5 | 4 | 5 | 3 | 500 | P1 | sem V |
| 6 | DP-038 | Trabalhista e DP / eSocial | Monitorar pendências e divergências do eSocial de toda a carteira | Semanal; mensal (antes do dia 15) | A | A$ | — | — | — | 5 | 4 | 4 | 5 | 5 | 400 | P1 | V1 (Alta · conf. R2) |
| 7 | FIS-044 | Fiscal / Atendimento (transversal: D7) | Responder dúvidas fiscais do cliente no WhatsApp | Diária | Próprio | B | V3·I-05, V3·I-07 (V3) | número oficial (V3) | WhatsApp: serviço 1.000 grátis/número/mês, depois R$ 0,035; utilidade R$ 0,035 [R2] | 4 | 5 | 4 | 5 | 5 | 400 | P1 | V1 (Alta · conf. R2) |
| 8 | FIS-045 | Fiscal / Reforma (transversal: D3, D6) | Conferir o destaque de CBS/IBS nas notas dos clientes (2026, ano de t… | Mensal em 2026; contínua até 2033 | A | — | — | — | — | 4 | 5 | 4 | 5 | 5 | 400 | P1 | V1 (Alta · conf. R2) |
| 9 | SOC-003 | Clientes / Vigilância cadastral | Vigiar o cadastro do CNPJ na RFB e nos órgãos | Semanal ou mensal (varredura da c… | A | A$, B, C-captcha, D | V1·I-04, V1·I-02; IE/IM ficam com V2 | Nenhuma / contrato SERPRO | eventos PJ grátis; Consulta CNPJ R$ 0,6591; Sintegra agreg. R$ 0,20→0,05 + adic. [R2] | 4 | 4 | 5 | 5 | 5 | 400 | P1 | V1 (Média · parc. R2) |
| 10 | GES-025 | Atendimento / Respostas | Responder perguntas de status com dados do sistema ("minha guia saiu?… | Contínua; picos perto dos vencime… | Próprio | B | V3·I-05 (V3) | identificação do contato (GES-023) (V3) | WhatsApp: serviço 1.000 grátis/número/mês, depois R$ 0,035; utilidade R$ 0,035 [R2] | 4 | 5 | 4 | 5 | 3 | 400 | P1 | V1 (Alta · conf. R2) |
| 11 | GES-040 | Atendimento / Portal do cliente | Receber solicitações tipadas e uploads do cliente pelo portal | Por evento (diária) | Próprio | B (gravar no core) | concorrentes Onvio Portal (rescisão, aviso prévio, férias, geral) [D4:C2], Alterdata eCon… | token ePlugin | — (V3) | 4 | 5 | 4 | 5 | 3 | 400 | P1 | V3 (Alta · conf. R2) |
| 12 | SOC-012 | Clientes / Procurações | Validar autorizações recebidas e controlar escopo e vencimento | Diário (novas a validar) + mensal… | A$ | D (aceite em 30 dias) | Integra-Procurações (V1·I-01) + Autorizações de Acesso (V1·I-13) | e-CNPJ do escritório; aceite no Portal de Serviços | Consulta R$ 0,24 (faixa 1) [R2] | 4 | 5 | 4 | 5 | 3 | 400 | P1 | V1 (Alta · conf. R2) |
| 13 | FIS-003 | Fiscal / Controle de entregas | Comprovar a entrega: anexar recibo de transmissão e dar baixa na tare… | A cada transmissão (dezenas a cen… | A | A$, B | recibo oficial (Integra, eSocial, Reinf) + status da tarefa no core (ePlugin) | token ePlugin; TR a negociar | — (V3) | 4 | 5 | 4 | 5 | 2 | 400 | P1 | V3 (Alta · parc. R2) |
| 14 | GES-039 | Atendimento / Portal do cliente | Publicar guias, relatórios e documentos no portal com confirmação de… | Contínua; picos mensais | Próprio | B (espelhar documentos do core), C-crc (evitar) | concorrentes Onvio Portal do Cliente [D4:C2], Acessórias Protocolo Digital (assinatura, d… | token ePlugin (Alterdata); API Onvio a pedir | — (V3) | 4 | 5 | 4 | 5 | 2 | 400 | P1 | V3 (Alta · conf. R2) |
| 15 | SOC-009 | Clientes / Certificados | Alertar o vencimento e conduzir a renovação de certificados | Diário (varredura) com avisos a 6… | A | B, D, P | WhatsApp utilidade (V3·I-05) para avisar o cliente; Acessórias tem "cashback com parceiro… | nenhuma para o alerta; contrato com AC para revenda [N… | WhatsApp: serviço 1.000 grátis/número/mês, depois R$ 0,035; utilidade R$ 0,035 [R2] | 4 | 5 | 4 | 5 | 2 | 400 | P1 | V1 (Alta · R1) |
| 16 | CTB-052 | Contábil / Escrituração simplificada | Manter livro caixa e registrar livros quando não houver ECD | Mensal (caixa); anual (autenticaç… | Próprio | D | — | — | — | 5 | 3 | 5 | 5 | 5 | 375 | P1 | V1 (Baixa · R1) |
| 17 | FIS-032 | Fiscal / Guias | Confirmar o pagamento das guias e cobrar o cliente | Mensal (D-2 do vencimento e D+3) | A$ | B, D | V3·I-10 (transações da conta do cliente para casar com o código de barras/valor); V3·I-05… | consent-cli (V3) | PAGTOWEB: Consulta R$ 0,24, comprovante R$ 0,32 [R2]; Pluggy ≥ R$ 2.500/mês; Belvo US$ 1.000/mês [R2] | 5 | 3 | 5 | 5 | 5 | 375 | P1 | V1 (Alta · conf. R2) |
| 18 | NFE-030 | Notas fiscais / Reforma tributária | Conferir os grupos de IBS/CBS (CST, cClassTrib, alíquotas-teste) nas… | Mensal (2026) e por evento (mudan… | A | — | — | — | — | 5 | 3 | 5 | 5 | 5 | 375 | P1 | V1 (Alta · conf. R2) |
| 19 | FIS-026 | Fiscal / Estadual / DTE | Ler os domicílios tributários eletrônicos estaduais | Semanal/diária | B | C-crc (RS), D | InfoSimples sefaz/{uf}/dec/caixa-postal em SP, MG, PR, SC (V2·I-23); RS sem agregador | A1-cli (app); RS: procuração eletrônica ao contabilista | R$ 0,20→0,05/consulta, sem adicional; franquia R$ 100/mês [R2] | 5 | 5 | 5 | 3 | 4 | 375 | P1 | V2 (Alta · conf. R2) |
| 20 | DP-060 | Trabalhista e DP / Arquivo | Manter o arquivo digital do empregado e controlar a guarda dos docume… | Contínua | Próprio | — | armazenamento; concorrentes Onvio (só documentos do core), Alterdata Pack Protocolo [D4:C… | — (V3) | [NÃO VERIFICADO] | 5 | 5 | 3 | 5 | 3 | 375 | P1 | V3 (Média · parc. R2) |
| 21 | CON-013 | Consultoria / Inteligência tributária | Acompanhar teses e decisões judiciais e medir o impacto na carteira | Semanal + por evento | Próprio* | — | próprio | — | — | 4 | 4 | 4 | 5 | 5 | 320 | P1 | V1 sem nível |
| 22 | CON-004 | Consultoria / Gestão do conhecimento | Manter a base de conhecimento interna (pareceres, respostas e entendi… | Contínua (a cada parecer/resposta) | Próprio* | — | próprio | — | — | 4 | 5 | 3 | 5 | 5 | 300 | P1 | sem V |
| 23 | CTB-033 | Contábil / Distribuição de lucros | Calcular o lucro que pode ser distribuído isento | Mensal ou trimestral; antes de ca… | Próprio* | — | próprio | — | — | 5 | 3 | 4 | 5 | 5 | 300 | P1 | sem V |
| 24 | CTB-034 | Contábil / Distribuição de lucros | Controlar pagamentos mensais de lucros por sócio e a retenção de 10% | Mensal | Próprio | B | V3·I-10 (V3) | consent-cli (V3) | ver CTB-010 (V3) | 5 | 3 | 4 | 5 | 5 | 300 | P1 | V1 (Alta · conf. R2) |
| 25 | DP-016 | Trabalhista e DP / eSocial | Fechar os eventos periódicos do eSocial e tratar rejeições | Mensal (dia 15 do mês seguinte, s… | A | — | — | — | gratuito [R2] | 5 | 3 | 4 | 5 | 5 | 300 | P1 | V1 (Alta · conf. R2) |
| 26 | DP-042 | Trabalhista e DP / Acessos (transvers… | Controlar procurações e acessos ao eSocial, FGTS Digital e DET | Por evento (novo cliente, vencime… | A$ | D | — | — | Integra (oficial): Consulta R$ 0,24→0,06 · Emissão R$ 0,32→0,08 · Declaração R$ 0,40→0,12 [R2] | 5 | 3 | 4 | 5 | 5 | 300 | P1 | V1 (Alta · conf. R2) |
| 27 | DP-058 | Trabalhista e DP / Atendimento (trans… | Responder dúvidas trabalhistas do cliente e do empregado | Diária | B | P | V3·I-05, V3·I-07 | — (V3) | WhatsApp: serviço 1.000 grátis/número/mês, depois R$ 0,035; utilidade R$ 0,035 [R2] | 5 | 5 | 4 | 3 | 5 | 300 | P1 | V3 (Baixa · parc. R2) |
| 28 | FIS-011 | Fiscal / Simples Nacional | Monitorar sublimite e limite do Simples | Mensal | Próprio | — | — | — | — | 4 | 3 | 5 | 5 | 5 | 300 | P1 | V1 (Alta · conf. R2) |
| 29 | FIS-024 | Fiscal / Estadual | Controlar as obrigações estaduais de cada UF | Mensal + anual; por evento (mudan… | F | P | nenhuma API; fontes normativas. | — (V2) | — (V2) | 5 | 3 | 5 | 4 | 5 | 300 | P1 | V2 (Média · parc. R2) |
| 30 | NFE-021 | Notas fiscais / Completude | Conferir a completude das entradas e das notas só com resumo | Mensal | A | P | — | A1-cli (app) | — | 5 | 3 | 4 | 5 | 5 | 300 | P1 | V2 (Alta · conf. R2) |
| 31 | NFE-024 | Notas fiscais / Conferência tributária | Identificar produtos monofásicos de PIS/COFINS nas saídas do Simples… | Mensal + projeto pontual (recuper… | Próprio* | — | próprio | — | — | 5 | 3 | 4 | 5 | 5 | 300 | P1 | sem V |
| 32 | FIS-004 | Fiscal / Conferência | Conferir antes de transmitir (pré-validação cruzada) | Mensal, antes de cada transmissão | Próprio | — | — | — | — | 5 | 3 | 4 | 5 | 4 | 300 | P1 | V1 (Alta · conf. R2) |
| 33 | CTB-026 | Contábil / Fechamento | Acompanhar o status de fechamento de toda a carteira | Semanal | Próprio* | — | próprio | — | — | 5 | 4 | 3 | 5 | 3 | 300 | P1 | sem V |
| 34 | FIS-001 | Fiscal / Calendário de obrigações | Gerar o calendário mensal de obrigações de cada cliente | Mensal (último dia útil do mês an… | Próprio | B (tarefas dos módulos de processos dos cores) | regra versionada + ePlugin historico-tarefas (Alterdata); TR/Contmatic a negociar | token ePlugin; contratos a negociar | — (V2) | 5 | 3 | 4 | 5 | 3 | 300 | P1 | V2 (Média · parc. R2) |
| 35 | FIS-029 | Fiscal / Municipal / DTE | Ler os domicílios eletrônicos municipais | Semanal | B | C-cert (Curitiba), D | InfoSimples pref/sp/sao-paulo/caixa-postal (DEC paulistano, V2·I-23) | A1-cli (app) | R$ 0,20→0,05/consulta; franquia R$ 100/mês [R2] | 5 | 4 | 5 | 3 | 3 | 300 | P1 | V2 (Média · parc. R2) |
| 36 | FIS-006 | Fiscal / e-CAC | Emitir e comparar o relatório de situação fiscal federal | Mensal (após os vencimentos) e an… | A$ | — | — | Procuração com o serviço de situação fiscal | SITFIS: 2 × Emissão ≈ R$ 0,64/relatório (faixa 1) [R2] | 4 | 3 | 5 | 5 | 2 | 300 | P1 | V1 (Alta · conf. R2) |
| 37 | FIS-010 | Fiscal / Simples Nacional / Guias (tr… | Emitir o DAS e enviar ao cliente | Mensal (vencimento dia 20) [S11] | A$ | B | V3·I-05: modelo de utilidade com documento; Alterdata revende DAS do Integra Contador a R… | número oficial verificado; opt-in do cliente (V3) | DAS: Emissão R$ 0,32→0,08 + utilidade R$ 0,035 [R2] | 4 | 3 | 5 | 5 | 2 | 300 | P1 | V1 (Alta · conf. R2) |
| 38 | FIS-031 | Fiscal / Guias (transversal: D4, D5,… | Operar a central de guias: receber, identificar, enviar e protocolar | Mensal concentrado (dias 5–20) +… | A$ | B, C-cert, D, F, P | V3·I-01/I-02 (pasta de saída do core); V3·I-05; concorrentes Acessórias e-Contínuo e Prot… | acesso à pasta de rede/nuvem do core (V3) | Integra (oficial): Consulta R$ 0,24→0,06 · Emissão R$ 0,32→0,08 · Declaração R$ 0,40→0,12 [R2] | 5 | 3 | 4 | 5 | 2 | 300 | P1 | V1 (Alta · conf. R2) |
| 39 | FIS-047 | Fiscal / Gestão (transversal: D7) | Acompanhar o fechamento fiscal do mês por equipe e cliente | Diária na 2ª quinzena | Próprio | B (status lido dos cores) | status das tarefas pelo ePlugin (Alterdata); TR/Contmatic a negociar | token ePlugin | — (V3) | 4 | 5 | 3 | 5 | 2 | 300 | P1 | V1 (Alta · conf. R2) |
| 40 | GES-028 | Atendimento / Respostas técnicas | Escalar pergunta técnica do cliente ao especialista com rascunho fund… | Diária | Próprio* | — | próprio | — | — | 5 | 5 | 2 | 5 | 5 | 250 | P1 | sem V |
| 41 | CTB-050 | Contábil / Guarda | Guardar documentos pelo prazo e devolver no fim do contrato | Contínua; por evento (saída do cl… | Próprio* | — | próprio | — | — | 5 | 5 | 2 | 5 | 4 | 250 | P1 | sem V |
| 42 | NFE-007 | Notas fiscais / Captura de serviços | Capturar NFS-e prestadas e tomadas pelo Ambiente de Dados Nacional (A… | Diária ou semanal | A | B | V1·I-17 (GET /DFe/{NSU}, GET /NFSe/{chave}/Eventos) [D3 S4] | A1-cli (app) (mesmo CNPJ raiz) | gratuito; 5.543 municípios no ADN [R2] | 5 | 5 | 2 | 5 | 4 | 250 | P1 | V1 (Alta · conf. R2) |
| 43 | CON-016 | Consultoria / Reforma — simulação | Simular a carga de CBS, IBS e IS por cliente, ano a ano, de 2026 a 20… | Por projeto + anual + a cada alíq… | A | P | — | — | Calculadora RFB grátis, versão offline (Docker/JAR) [R2] | 5 | 5 | 2 | 5 | 3 | 250 | P1 | V1 (Alta · conf. R2) |
| 44 | NFE-003 | Notas fiscais / Configuração | Monitorar a saúde da captura: certificado vencido, falha de consulta,… | Diária | A | P | — | A1-cli (app) | — | 5 | 5 | 2 | 5 | 2 | 250 | P1 | V1 (Alta · conf. R2) |
| 45 | NFE-004 | Notas fiscais / Captura de entradas | Capturar as NF-e de entrada (emitidas contra o CNPJ do cliente) | Diária (contínua) | A | B | NFeDistribuicaoDFe; RecepcaoEvento. | A1-cli (app) | gratuito; janela de 90 dias, NSU sem retroativo [R2] | 5 | 5 | 2 | 5 | 2 | 250 | P1 | V2 (Média · conf. R2) |
| 46 | NFE-036 | Notas fiscais / Guarda | Guardar os XMLs pelo prazo legal e entregar pacotes (cliente, fiscali… | Contínua; por evento (intimação,… | A | Próprio | concorrentes SIEG (cofre), Qive (armazenar e consultar) [V3·I-15] | — (V3) | armazenamento em nuvem [NÃO VERIFICADO] | 5 | 5 | 2 | 5 | 2 | 250 | P1 | V1 (Alta · conf. R2) |
| 47 | CON-012 | Consultoria / Planejamento tributário… | Planejar pró-labore, distribuição de lucros e a retenção da Lei 15.27… | Anual (planejamento) + mensal (co… | Próprio* | — | próprio | — | — | 4 | 3 | 4 | 5 | 5 | 240 | P2 | sem V |
| 48 | CTB-014 | Contábil / Extratos | Controlar empréstimos, financiamentos e aplicações | Mensal (parcelas); anual (posição) | A | B, D | V3·I-10 (V3) | consent-cli (V3) | ver CTB-010 (V3) | 4 | 3 | 4 | 5 | 5 | 240 | P2 | V1 (Alta · conf. R2) |
| 49 | CTB-021 | Contábil / Conciliação | Vigiar caixa negativo, conta de sócio e despesas pessoais | Mensal | Próprio* | — | próprio | — | — | 4 | 3 | 4 | 5 | 5 | 240 | P2 | sem V |
| 50 | DP-015 | Trabalhista e DP / Pró-labore (transv… | Calcular e processar o pró-labore e as retiradas dos sócios | Mensal; anual (revisão) | Próprio* | — | próprio | — | — | 4 | 3 | 4 | 5 | 5 | 240 | P2 | sem V |
| 51 | DP-017 | Trabalhista e DP / DCTFWeb (transvers… | Conferir a DCTFWeb do DP e emitir o DARF | Mensal (prazo de entrega no últim… | A$ | — | — | — | transmitir = Declaração R$ 0,40; DARF = Emissão R$ 0,32 [R2] | 4 | 3 | 4 | 5 | 5 | 240 | P2 | V1 (Alta · conf. R2) |
| 52 | DP-021 | Trabalhista e DP / Guias (transversal… | Conferir o pagamento das guias e cobrar o que ficou em aberto | Mensal (D+1 do vencimento) | A$ | B, D | V3·I-10 (V3) | consent-cli (V3) | PAGTOWEB (federal) R$ 0,24 [R2]; Pluggy ≥ R$ 2.500/mês; Belvo US$ 1.000/mês [R2] | 4 | 3 | 4 | 5 | 5 | 240 | P2 | V1 (Alta · conf. R2) |
| 53 | DP-049 | Trabalhista e DP / SST | Controlar ASOs periódicos e a validade de PGR e PCMSO | Mensal | Próprio* | — | próprio | — | — | 4 | 3 | 4 | 5 | 5 | 240 | P2 | sem V |
| 54 | FIS-020 | Fiscal / EFD-Reinf | Fechar e transmitir a EFD-Reinf | Mensal, até o dia 15 (regra do di… | A | — | — | — | gratuito [R2] | 4 | 3 | 4 | 5 | 5 | 240 | P2 | V1 (Alta · conf. R2) |
| 55 | FIS-046 | Fiscal / Pré-requisitos (transversal:… | Garantir certificado e acesso válidos antes das transmissões | Mensal (D-10 dos prazos) | Próprio | — | — | — | — | 4 | 3 | 4 | 5 | 5 | 240 | P2 | V1 (Alta · conf. R2) |
| 56 | GES-007 | Gestão / Fiscal do escritório | Emitir a NFS-e dos honorários do próprio escritório | Mensal; por evento (extra, acordo) | A | B, P | Asaas emite NFS-e [NÃO VERIFICADO]; Focus NFe, PlugNotas, NFE.io, eNotas (V3·I-15) (V3) | e-CNPJ do escritório | Emissor Nacional grátis [R2]; Asaas NF R$ 0,49 | 4 | 3 | 4 | 5 | 5 | 240 | P2 | V1 (Alta · conf. R2) |
| 57 | GES-035 | Atendimento / Horário | Atender fora do horário e em feriados | Diária | B | P | V3·I-05, V3·I-07 (horário de atendimento e mensagem automática) | — (V3) | WhatsApp: serviço 1.000 grátis/número/mês, depois R$ 0,035; utilidade R$ 0,035 [R2] | 4 | 5 | 4 | 3 | 5 | 240 | P2 | V3 (Média · parc. R2) |
| 58 | NFE-022 | Notas fiscais / Conferência | Conciliar o faturamento das notas com a receita declarada (PGDAS-D, E… | Mensal (antes do PGDAS-D, dia 20) | A$ | P | — | — | Integra (oficial): Consulta R$ 0,24→0,06 · Emissão R$ 0,32→0,08 · Declaração R$ 0,40→0,12 [R2] | 4 | 3 | 4 | 5 | 5 | 240 | P2 | V1 (Alta · conf. R2) |
| 59 | NFE-027 | Notas fiscais / Conferência tributária | Conferir ISS (município de incidência) e retenções federais nas NFS-e | Mensal | Próprio | — | — | — | — | 4 | 3 | 4 | 5 | 5 | 240 | P2 | V1 (Alta · conf. R2) |
| 60 | FIS-025 | Fiscal / Estadual / Guias | Emitir guias estaduais (ICMS próprio, ST, DIFAL, antecipação) e enviar | Mensal + por nota (antecipação/ST… | F | C-cert (exceção) | guia gerada no core (F ou API do core, decisão 2); API oficial de guia [NÃO ENCONTRADO] | acesso ao core | gratuito (portal); concorrente Jettax gera guias [D2:C… | 4 | 3 | 5 | 4 | 5 | 240 | P2 | V2 (Média · parc. R2) |
| 61 | NFE-026 | Notas fiscais / Conferência tributária | Calcular DIFAL e antecipação parcial nas entradas interestaduais e ge… | Mensal (ou por entrada, conforme… | F | Próprio (cálculo), P | cálculo próprio; guia gerada no core (decisão 2) | acesso ao core | — | 5 | 3 | 4 | 4 | 5 | 240 | P2 | V2 (Média · R1) |
| 62 | CTB-019 | Contábil / Conciliação | Conferir a integração fiscal-contábil | Mensal | F | — | V3·I-01 a V3·I-03 (relatórios); Conta Azul cita integração fiscal-contábil [D5:C4] | — (V3) | — (V3) | 5 | 3 | 4 | 4 | 4 | 240 | P2 | V3 (Baixa · parc. R2) |
| 63 | FIS-019 | Fiscal / DCTFWeb | Fechar e transmitir a DCTFWeb (com MIT) e emitir o DARF numerado | Mensal; entrega até o último dia… | A$ | — | — | — | transmitir = Declaração R$ 0,40; DARF = Emissão R$ 0,32 [R2] | 4 | 3 | 4 | 5 | 4 | 240 | P2 | V1 (Alta · conf. R2) |
| 64 | FIS-009 | Fiscal / Simples Nacional | Transmitir o PGDAS-D mensal | Mensal, até o dia 20 do mês segui… | A$ | — | — | Procuração | Declaração R$ 0,40→0,12; revenda Alterdata R$ 0,80 [R2] | 4 | 3 | 4 | 5 | 3 | 240 | P2 | V1 (Alta · conf. R2) |
| 65 | GES-023 | Atendimento / Caixa de entrada | Receber e triar mensagens de WhatsApp num número oficial único, ident… | Contínua (dezenas a centenas por… | B | — | Cloud API (V3·I-05) direta ou BSP (V3·I-06); caixa de entrada Chatwoot como base (V3·I-07… | Meta Business verificado + número + pagamento no Billing Hub | receber grátis; WhatsApp: serviço 1.000 grátis/número/mês, depois R$ 0,035; utilidade R$ 0,035 [R2] | 4 | 5 | 4 | 3 | 2 | 240 | P1 (hab.) | V3 (Alta · parc. R2) |
| 66 | CTB-005 | Contábil / Coleta de documentos | Conferir se a competência está completa antes de fechar | Mensal | Próprio* | — | próprio | — | — | 5 | 3 | 3 | 5 | 5 | 225 | P2 | sem V |
| 67 | CTB-025 | Contábil / Fechamento | Revisar o balancete antes de liberar | Mensal | Próprio* | — | próprio | — | — | 5 | 3 | 3 | 5 | 5 | 225 | P2 | sem V |
| 68 | DP-039 | Trabalhista e DP / eSocial | Baixar e guardar os XMLs e recibos do eSocial e conciliar com o core | Mensal (ideal); por evento (novo… | A | — | — | e-CNPJ + procuração com perfil do grupo de eventos | gratuito; máx. 10 acessos/dia por empregador [R2] | 5 | 3 | 3 | 5 | 5 | 225 | P2 | V1 (Alta · conf. R2) |
| 69 | CON-005 | Consultoria / Gestão do conhecimento | Revisar pareceres e orientações antigas quando a norma muda | Por evento (publicação de norma o… | Próprio* | — | próprio | — | — | 4 | 5 | 2 | 5 | 5 | 200 | P2 | sem V |
| 70 | CON-015 | Consultoria / Reforma — diagnóstico | Triar a carteira: quais clientes ganham e quais perdem com a reforma | Uma vez + revisões semestrais (al… | F* | — | próprio | — | — | 5 | 5 | 2 | 4 | 5 | 200 | P2 | sem V |
| 71 | CON-023 | Consultoria / Reforma — split payment | Projetar o efeito do split payment no caixa do cliente e orientar a a… | Por projeto; revisar a cada ato n… | Próprio | — | — | — | — | 4 | 5 | 2 | 5 | 5 | 200 | P2 | V1 (Baixa · parc. R2) |
| 72 | DP-007 | Trabalhista e DP / Admissão | Controlar o vencimento dos contratos de experiência | Diária (varredura); por evento (v… | Próprio* | — | próprio | — | — | 2 | 5 | 4 | 5 | 5 | 200 | P2 | sem V |
| 73 | DP-027 | Trabalhista e DP / Rescisão | Controlar o prazo de 10 dias de pagamento e entrega dos documentos | Por evento | Próprio* | — | próprio | — | — | 5 | 2 | 4 | 5 | 5 | 200 | P2 | sem V |
| 74 | DP-040 | Trabalhista e DP / DET | Ler o Domicílio Eletrônico Trabalhista (DET) de todos os clientes | Diária ou semanal (ciência tácita… | C-cert | D | — | e-CNPJ do escritório + perfil de procurador no DET (o A1-cli não resolve: falta API) | — | 5 | 5 | 4 | 2 | 5 | 200 | P2 | V1 (Média · parc. R2) |
| 75 | DP-043 | Trabalhista e DP / Atualização | Acompanhar notas técnicas do eSocial e mudanças na legislação trabalh… | Semanal | A | — | — | — | — | 5 | 4 | 2 | 5 | 5 | 200 | P2 | V1 (Média · R1) |
| 76 | DP-046 | Trabalhista e DP / Afastamentos | Receber atestados, somar afastamentos e encaminhar ao INSS | Por evento | A | D | — | — | — | 5 | 2 | 4 | 5 | 5 | 200 | P2 | V1 (Baixa · parc. R2) |
| 77 | DP-059 | Trabalhista e DP / Consultoria | Simular custo de contratação, rescisão e mudança salarial | Por evento (semanal na carteira) | Próprio* | — | próprio | — | — | 5 | 4 | 2 | 5 | 5 | 200 | P2 | sem V |
| 78 | FIS-008 | Fiscal / Simples Nacional | Monitorar e tratar o Termo de Exclusão do Simples Nacional (DTE-SN) | Anual (lote do 2º semestre) + por… | A$ | D | — | — | indicador DTE e caixa postal: Consulta R$ 0,24 [R2] | 4 | 2 | 5 | 5 | 5 | 200 | P2 | V1 (Alta · conf. R2) |
| 79 | FIS-037 | Fiscal / Certidões | Diagnosticar e resolver o que impede a certidão | Por evento (urgente) | A$ | C-cert, D, P | agregador devolve só o PDF/status da certidão (V3·I-12); o diagnóstico vem de V1 | V1 | Infosimples R$ 0,20→0,09/consulta, franquia R$ 100/mês [R2] | 5 | 2 | 4 | 5 | 5 | 200 | P2 | V3 (Média · parc. R2) |
| 80 | FIS-038 | Fiscal / Malhas e intimações | Tratar intimações e notificações fiscais (federal, estadual, municipa… | Por evento | A$ | B, C-cert, C-crc, D | V3·I-05 (utilidade), V3·I-13 (assinatura de procuração/defesa, quando cabível) (V3) | opt-in (V3) | Integra (oficial): Consulta R$ 0,24→0,06 · Emissão R$ 0,32→0,08 · Declaração R$ 0,40→0,12 [R2] | 4 | 2 | 5 | 5 | 5 | 200 | P2 | V1 (Média · parc. R2) |
| 81 | GES-027 | Atendimento / Caixa de entrada | Atender a caixa de e-mail compartilhada e vincular ao cliente | Contínua | A | — | Gmail API / Microsoft Graph / IMAP (V3·I-09); canal de e-mail do Chatwoot (V3·I-07) | OAuth do escritório | sem custo de API [NÃO VERIFICADO] | 4 | 5 | 2 | 5 | 5 | 200 | P2 | V3 (Média · parc. R2) |
| 82 | GES-033 | Atendimento / Canais | Registrar ligações telefônicas e reuniões com clientes | Diária | Próprio* | — | próprio | — | — | 4 | 5 | 2 | 5 | 5 | 200 | P2 | sem V |
| 83 | GES-053 | Timesheet / Trabalhista | Tratar atividade fora da jornada, teletrabalho e desconexão | Na implantação; contínua | Próprio* | — | próprio | — | — | 2 | 5 | 4 | 5 | 5 | 200 | P2 | sem V |
| 84 | NFE-010 | Notas fiscais / Eventos de transporte | Controlar MDF-e dos clientes transportadores e emitentes de carga pró… | Diária/semanal (por evento de rej… | A | E | — | — | — | 4 | 5 | 2 | 5 | 5 | 200 | P2 | V2 (Média · R1) |
| 85 | NFE-019 | Notas fiscais / Eventos | Orientar o cliente em cancelamento fora do prazo e carta de correção… | Por evento (várias vezes por sema… | Próprio* | — | próprio | — | — | 2 | 5 | 4 | 5 | 5 | 200 | P2 | sem V |
| 86 | NFE-040 | Notas fiscais / Manutenção | Acompanhar notas técnicas e mudanças de leiaute e comunicar os client… | Semanal / por publicação | A | — | — | — | — | 5 | 4 | 2 | 5 | 5 | 200 | P2 | V1 (Média · R1) |
| 87 | SOC-007 | Clientes / Comunicações oficiais | Cadastrar e vigiar o Domicílio Judicial Eletrônico | Por evento (abertura) + leitura d… | C-cert | D | — | — | — | 4 | 5 | 5 | 2 | 5 | 200 | P2 | V1 (Baixa · R1) |
| 88 | SOC-010 | Clientes / Certificados | Registrar quem usou cada certificado | Contínuo | Próprio | — | — | — | — | 4 | 5 | 2 | 5 | 5 | 200 | P2 | V1 (Alta · conf. R2) |
| 89 | SOC-035 | Legalização / Licenças | Mapear as licenças exigidas por cliente | Por evento (abertura, mudança de… | Próprio | — | nenhuma API; bases normativas municipais. | nenhuma. | — (V2) | 4 | 2 | 5 | 5 | 5 | 200 | P2 | V2 (Média · R1) |
| 90 | SOC-046 | Societário / Calendário | Manter o calendário societário e de legalização do cliente | Contínuo | Próprio | — | — | — | — | 4 | 5 | 2 | 5 | 5 | 200 | P2 | V1 (Baixa · R1) |
| 91 | NFE-018 | Notas fiscais / Eventos | Monitorar cancelamentos, CC-e e outros eventos posteriores à importaç… | Diária | A | — | — | A1-cli (app) | — | 4 | 5 | 2 | 5 | 4 | 200 | P2 | V2 (Média · R1) |
| 92 | CON-037 | Consultoria / Gestão | Controlar a carteira de projetos consultivos (orçado × realizado) | Contínua; revisão semanal | Próprio* | — | próprio | — | — | 4 | 5 | 2 | 5 | 3 | 200 | P2 | sem V |
| 93 | DP-026 | Trabalhista e DP / Rescisão | Receber o pedido de desligamento e orientar a modalidade | Por evento | Próprio* | — | próprio | — | — | 5 | 2 | 4 | 5 | 3 | 200 | P2 | sem V |
| 94 | NFE-009 | Notas fiscais / Captura de saídas | Capturar as NFC-e do varejo | Mensal (ou diária) | A | B, E | — | A1-cli (app) (SAE-NFC-e exige o do contribuinte) | gratuito (SP) [R2] | 4 | 5 | 2 | 5 | 3 | 200 | P2 | V2 (Alta · conf. R2) |
| 95 | NFE-006 | Notas fiscais / Captura de entradas | Capturar CT-e e CT-e OS em que o cliente é tomador ou outro ator | Diária | A | P | — | A1-cli (app) | — | 4 | 5 | 2 | 5 | 2 | 200 | P2 | V2 (Média · R1) |
| 96 | DP-010 | Trabalhista e DP / Fechamento da folh… | Receber e conferir o espelho de ponto e os arquivos do relógio | Mensal | F | B | Alterdata ponto eletrônico [D4:C12]; importação de ponto nos cores [NÃO ENCONTRADO] | arquivo enviado pelo cliente ou API do fornecedor de p… | [NÃO VERIFICADO] | 4 | 3 | 4 | 4 | 5 | 192 | P2 | V3 (Baixa · parc. R2) |
| 97 | FIS-030 | Fiscal / Cadastro fiscal (transversal… | Vigiar a situação cadastral (CNPJ, IE, inscrição municipal) e omissõe… | Mensal | A | A$, B | V3·I-12 (V3) | token-esc (V3) | Infosimples R$ 0,20→0,09/consulta, franquia R$ 100/mês [R2] | 4 | 3 | 3 | 5 | 5 | 180 | P2 | V1 (Média · parc. R2) |
| 98 | GES-024 | Atendimento / Filas e SLA | Distribuir conversas por setor e fila, transferir e acompanhar SLA | Contínua | B | P | V3·I-07 (times, atribuição, automações); Digisac (filas por setor) [D4:C9] | — (V3) | Chatwoot auto-hospedado: infraestrutura; SLA pode esta… | 4 | 5 | 3 | 3 | 5 | 180 | P2 | V3 (Baixa · parc. R2) |
| 99 | NFE-012 | Notas fiscais / Captura | Receber documentos soltos pelo atendimento (WhatsApp, e-mail) e casá-… | Diária | B | P | V3·I-05 (mídia recebida por webhook), V3·I-09 (e-mail) | — (V3) | WhatsApp: serviço 1.000 grátis/número/mês, depois R$ 0,035; utilidade R$ 0,035 [R2] | 4 | 5 | 3 | 3 | 5 | 180 | P2 | V3 (Média · parc. R2) |
| 100 | GES-001 | Gestão / Faturamento de honorários | Gerar as cobranças mensais recorrentes de honorários | Mensal (dia fixo, geralmente iníc… | B | — | Asaas (assinaturas recorrentes), Banco Inter, Efí (V3·I-14); Pix Automático (BCB, desde 1… | conta PJ do escritório + token (mTLS em Inter/Efí) | Asaas R$ 1,59/Pix ou boleto (R$ 0,79 promocional; conferido em 7/11/2026); Efí boleto R$ 3,45, Pix Automático R$ 3,50 [R2] | 5 | 3 | 4 | 3 | 4 | 180 | P2 | V3 (Alta · parc. R2) |
| 101 | CTB-006 | Contábil / Coleta de documentos | Pedir ao cliente a explicação de movimentos sem documento | Mensal | B | P | V3·I-05 (modelo de utilidade com link para a lista; respostas na janela) | opt-in | WhatsApp: serviço 1.000 grátis/número/mês, depois R$ 0,035; utilidade R$ 0,035 [R2] | 5 | 3 | 4 | 3 | 3 | 180 | P2 | V3 (Média · parc. R2) |
| 102 | GES-026 | Atendimento / Documentos | Capturar documentos recebidos nas conversas e arquivá-los no cliente… | Contínua | B | P | V3·I-05 (mídia por webhook) | — (V3) | WhatsApp: serviço 1.000 grátis/número/mês, depois R$ 0,035; utilidade R$ 0,035 [R2] | 4 | 5 | 3 | 3 | 3 | 180 | P2 | V3 (Média · parc. R2) |
| 103 | NFE-037 | Notas fiscais / Atendimento | Atender pedidos do cliente sobre notas (2ª via, "chegou a nota?", rel… | Diária | B | P | V3·I-05, V3·I-07 | — (V3) | WhatsApp: serviço 1.000 grátis/número/mês, depois R$ 0,035; utilidade R$ 0,035 [R2] | 4 | 5 | 3 | 3 | 3 | 180 | P2 | V3 (Média · parc. R2) |
| 104 | DP-020 | Trabalhista e DP / Guias (transversal… | Enviar guias e resumo da folha ao cliente | Mensal | B | F | ePlugin GET /api/v1/integracao/documentos (Alterdata) + WhatsApp (V3·I-05) | token ePlugin; opt-in | R$ 0,035 por modelo de utilidade [R2] | 5 | 3 | 4 | 3 | 2 | 180 | P2 | V3 (Alta · parc. R2) |
| 105 | DP-019 | Trabalhista e DP / Holerites | Distribuir os holerites aos empregados e registrar a ciência | Mensal; também em férias, 13º e r… | F | B | concorrente no core: Domínio Portal do Empregado (só documentos da folha do Domínio; não… | opt-in de cada empregado | R$ 0,035 por empregado/mês (utilidade) [R2] | 5 | 3 | 3 | 4 | 2 | 180 | P2 | V3 (Alta · parc. R2) |
| 106 | CON-038 | Consultoria / Gestão do conhecimento | Produzir o boletim interno de novidades normativas para a equipe | Semanal | Próprio* | — | próprio | — | — | 4 | 4 | 2 | 5 | 5 | 160 | P2 | sem V |
| 107 | CTB-041 | Contábil / ECD | Acompanhar a ECD de cada cliente até o recibo | Anual (até o último dia útil de j… | F | — | — | — | — | 5 | 2 | 4 | 4 | 5 | 160 | P2 | V1 (Baixa · R1) |
| 108 | CTB-042 | Contábil / ECF | Acompanhar a ECF e conferir com a ECD | Anual (último dia útil de julho) | F | — | — | — | — | 5 | 2 | 4 | 4 | 5 | 160 | P2 | V1 (Baixa · R1) |
| 109 | DP-014 | Trabalhista e DP / Parâmetros | Atualizar tabelas e parâmetros legais e conferir a aplicação | Anual (janeiro); por evento (lei… | A | — | — | — | — | 4 | 2 | 4 | 5 | 5 | 160 | P2 | V1 (Baixa · R1) |
| 110 | DP-033 | Trabalhista e DP / Convenções | Enquadrar o sindicato e a convenção coletiva de cada cliente | Por evento (novo cliente, nova fi… | Próprio* | — | próprio | — | — | 4 | 2 | 4 | 5 | 5 | 160 | P2 | sem V |
| 111 | DP-035 | Trabalhista e DP / Convenções | Aplicar reajuste, piso e retroativos da nova CCT | Anual (por categoria); por evento | F* | — | próprio | — | — | 5 | 2 | 4 | 4 | 5 | 160 | P2 | sem V |
| 112 | DP-048 | Trabalhista e DP / Afastamentos · SST | Emitir a CAT no prazo | Por evento | A | — | — | — | — | 4 | 2 | 4 | 5 | 5 | 160 | P2 | V1 (Alta · conf. R2) |
| 113 | DP-053 | Trabalhista e DP / 13º salário | Planejar e comunicar o 13º salário | Anual | Próprio* | — | próprio | — | — | 4 | 2 | 4 | 5 | 5 | 160 | P2 | sem V |
| 114 | FIS-013 | Fiscal / Simples Nacional | Entregar a DEFIS | Anual, até 31 de março [S11] | A$ | — | — | — | Declaração R$ 0,40→0,12 [R2] | 4 | 2 | 4 | 5 | 5 | 160 | P2 | V1 (Alta · conf. R2) |
| 115 | FIS-040 | Fiscal / Malhas e intimações | Conferir notificações de multa por atraso (MAED) e pedir revisão | Por evento | A$ | D | — | — | Integra (oficial): Consulta R$ 0,24→0,06 · Emissão R$ 0,32→0,08 · Declaração R$ 0,40→0,12 [R2] | 4 | 2 | 4 | 5 | 5 | 160 | P2 | V1 (Baixa · R1) |
| 116 | GES-062 | Atendimento / Governança da IA | Liberar categorias de resposta automática e auditar a IA por amostrag… | Semanal (amostragem); por evento… | Próprio* | — | próprio | — | — | 4 | 4 | 2 | 5 | 5 | 160 | P2 | sem V |
| 117 | SOC-022 | Clientes / Onboarding | Fazer o diagnóstico de entrada | Por evento | A$ | B, C-captcha | — | — | Pacote de chamadas por cliente novo (estimar ~10–20 ch… | 4 | 2 | 4 | 5 | 5 | 160 | P2 | V1 (Média · parc. R2) |
| 118 | CON-018 | Consultoria / Reforma — créditos | Analisar fornecedores e clientes do cliente quanto a crédito (cadeia) | Por projeto + semestral | A | B | V3·I-12; Qive Portal de Fornecedores (regime, risco de crédito IBS/CBS) [D6:C5] (V3) | token-esc (V3) | Infosimples R$ 0,20→0,09/consulta, franquia R$ 100/mês [R2] | 4 | 2 | 4 | 5 | 4 | 160 | P2 | V1 (Média · parc. R2) |
| 119 | CON-033 | Consultoria / Recuperação de créditos | Triar a carteira em busca de oportunidades de recuperação de créditos | Anual + na entrada de cliente novo | Próprio | — | — | — | — | 4 | 2 | 4 | 5 | 4 | 160 | P2 | V1 (Média · R1) |
| 120 | CTB-040 | Contábil / Encerramento anual | Planejar e acompanhar o encerramento do exercício | Anual (novembro a julho) | Próprio* | — | próprio | — | — | 4 | 2 | 4 | 5 | 4 | 160 | P2 | sem V |
| 121 | CON-031 | Consultoria / Reforma — prontidão | Montar e acompanhar o plano de adequação do cliente à reforma | Por projeto, revisão trimestral | Próprio* | — | próprio | — | — | 4 | 2 | 4 | 5 | 3 | 160 | P2 | sem V |
| 122 | GES-016 | Gestão / Produtividade | Medir a produtividade por setor e por pessoa | Semanal; mensal | Próprio* | — | próprio | — | — | 4 | 4 | 2 | 5 | 3 | 160 | P2 | sem V |
| 123 | CTB-023 | Contábil / Reforma tributária | Contabilizar CBS e IBS (2026) e preparar o split payment | Uma vez (definição); mensal (lanç… | Próprio | — | — | — | — | 5 | 3 | 2 | 5 | 5 | 150 | P2 | V1 (Alta · conf. R2) |
| 124 | CTB-036 | Contábil / Distribuição de lucros | Controlar o estoque de lucros até 2025 aprovados para pagamento futuro | Mensal até 2028 | Próprio* | — | próprio | — | — | 5 | 3 | 2 | 5 | 5 | 150 | P2 | sem V |
| 125 | DP-003 | Trabalhista e DP / Admissão · SST | Agendar e acompanhar o ASO admissional | Por evento | Próprio* | — | próprio | — | — | 3 | 2 | 5 | 5 | 5 | 150 | P2 | sem V |
| 126 | DP-034 | Trabalhista e DP / Convenções | Monitorar a data-base e o registro de novo instrumento coletivo | Mensal (varredura); anual (data-b… | A | D | — | — | — | 5 | 3 | 2 | 5 | 5 | 150 | P2 | V1 (Baixa · R1) |
| 127 | FIS-016 | Fiscal / MEI | Emitir e enviar o DAS-MEI em lote | Mensal (vencimento dia 20 [NÃO VE… | A$ | B | V3·I-05 (envio em lote de utilidade) (V3) | opt-in de cada MEI (V3) | Emissão R$ 0,32 por DAS-MEI + R$ 0,035 por mensagem [R2] | 2 | 3 | 5 | 5 | 5 | 150 | P2 | V1 (Alta · conf. R2) |
| 128 | FIS-017 | Fiscal / MEI | Entregar a DASN-SIMEI e controlar o limite do MEI | Anual, até 31 de maio (próxima: 3… | A$ | P | — | — | Declaração R$ 0,40→0,12 [R2] | 2 | 3 | 5 | 5 | 5 | 150 | P2 | V1 (Baixa · parc. R2) |
| 129 | FIS-034 | Fiscal / Parcelamentos | Controlar parcelamentos ativos e emitir as parcelas | Mensal | A$ | C-cert, D | — | — | parcelamentos SN/MEI: Consulta R$ 0,24, parcela R$ 0,32 [R2]; PGFN sem API | 2 | 3 | 5 | 5 | 5 | 150 | P2 | V1 (Média · parc. R2) |
| 130 | FIS-041 | Fiscal / Créditos (transversal: D6) | Identificar e recuperar PIS/Cofins monofásico pago a maior no Simples | Por projeto (uma vez por cliente)… | A$ | D | — | — | Integra (oficial): Consulta R$ 0,24→0,06 · Emissão R$ 0,32→0,08 · Declaração R$ 0,40→0,12 [R2] | 5 | 3 | 2 | 5 | 5 | 150 | P2 | V1 (Baixa · R1) |
| 131 | GES-003 | Gestão / Contas a receber | Conciliar recebimentos de honorários e dar baixa | Diária ou semanal | B | F | V3·I-14, V3·I-11 | token | Asaas R$ 1,59/Pix ou boleto (R$ 0,79 promocional; conferido em 7/11/2026); Efí boleto R$ 3,45, Pix Automático R$ 3,50 [R2] | 5 | 5 | 2 | 3 | 5 | 150 | P2 | V3 (Média · parc. R2) |
| 132 | GES-013 | Gestão / Rentabilidade | Calcular a rentabilidade por cliente | Mensal; anual (antes do reajuste) | Próprio* | — | próprio | — | — | 5 | 3 | 2 | 5 | 5 | 150 | P2 | sem V |
| 133 | GES-020 | Gestão / Conhecimento | Montar e manter a base de conhecimento interna (procedimentos e parti… | Contínua; por evento (desligament… | Próprio* | — | próprio | — | — | 2 | 5 | 3 | 5 | 5 | 150 | P2 | sem V |
| 134 | GES-034 | Atendimento / Supervisão | Alertar conversas sem resposta e resumir o dia do atendimento | Diária (manhã e fim do dia) | Próprio* | — | próprio | — | — | 2 | 5 | 3 | 5 | 5 | 150 | P2 | sem V |
| 135 | GES-044 | Gestão / Relacionamento | Enviar informativo periódico e conteúdo aos clientes | Mensal | Próprio* | — | próprio | — | — | 5 | 3 | 2 | 5 | 5 | 150 | P2 | sem V |
| 136 | GES-061 | Gestão / Compliance do escritório | Cuidar das obrigações do próprio escritório como empresa ("cliente ze… | Mensal; anual | Próprio | — | — | — | — | 2 | 3 | 5 | 5 | 5 | 150 | P2 | V1 (Média · R1) |
| 137 | NFE-031 | Notas fiscais / Reforma tributária | Acompanhar a migração do cliente ao Emissor Nacional da NFS-e e os ca… | Por evento (data de obrigatorieda… | Próprio | — | — | — | — | 5 | 3 | 2 | 5 | 5 | 150 | P2 | V1 (Alta · conf. R2) |
| 138 | SOC-032 | Societário / MEI | Atender o ciclo de vida do MEI | Por evento | A$ | — | V1·I-01 | Procuração do MEI para o escritório | Por chamada (revenda R$ 0,75/DAS em 2025 [D2 S5]) | 3 | 2 | 5 | 5 | 5 | 150 | P2 | V1 (Alta · conf. R2) |
| 139 | FIS-007 | Fiscal / e-CAC (transversal: D1) | Controlar procurações eletrônicas no e-CAC e em outros órgãos | Mensal (verificação) + por evento… | A$ | D | — | — | Integra (oficial): Consulta R$ 0,24→0,06 · Emissão R$ 0,32→0,08 · Declaração R$ 0,40→0,12 [R2] | 5 | 3 | 2 | 5 | 4 | 150 | P2 | V1 (Média · parc. R2) |
| 140 | CTB-015 | Contábil / Classificação | Classificar os lançamentos do extrato | Mensal | Próprio | — | concorrentes ROIT (98% segundo a empresa) [D5:C6], Conta Azul/Mister Contador [D5:C4], Ni… | — (V3) | custo de modelo [NÃO VERIFICADO] | 5 | 3 | 2 | 5 | 3 | 150 | P2 | V3 (Média · parc. R2) |
| 141 | CTB-016 | Contábil / Classificação | Manter as regras de classificação de cada cliente | Por evento (correção); revisão tr… | Próprio | — | regras do core (Alterdata Prosoft, parâmetros de conciliação) [D5:C11] — exportação [NÃO… | — (V3) | — (V3) | 5 | 2 | 3 | 5 | 3 | 150 | P2 | V3 (Média · parc. R2) |
| 142 | GES-004 | Gestão / Cobrança | Executar a régua de cobrança de honorários | Diária (D-3, D0, D+3, D+10, D+30… | B | P | régua nativa do Asaas (e-mail/SMS/WhatsApp) [NÃO VERIFICADO] ou régua própria via V3·I-05 | opt-in | régua própria R$ 0,035/msg vs. Asaas R$ 0,55 [R2] | 5 | 5 | 2 | 3 | 3 | 150 | P2 | V3 (Alta · parc. R2) |
| 143 | NFE-033 | Notas fiscais / Envio ao core | Organizar e enviar os XMLs ao core (lote, pasta, API) | Diária a mensal | B | F (Alterdata, Contmatic) | API de entrada do Domínio p/ ERP homologado (NF-e, NFC-e, NFS-e, CF-e, CT-e) (V3·I-01) | homologação como parceiro TR + chave por empresa no Onvio Gestão | programa de parceiros TR [PREÇO NÃO PÚBLICO] | 5 | 5 | 2 | 3 | 2 | 150 | P2 | V3 (Alta · conf. R2) |
| 144 | CTB-004 | Contábil / Coleta de documentos | Receber, identificar e arquivar os documentos que chegam soltos | Diária | B | P | V3·I-05, V3·I-09; concorrentes Acessórias e-Contínuo, Gestta Express, Omie ValidaPDF [V3·… | — (V3) | WhatsApp: serviço 1.000 grátis/número/mês, depois R$ 0,035; utilidade R$ 0,035 [R2] | 5 | 5 | 2 | 3 | 2 | 150 | P2 | V3 (Média · parc. R2) |
| 145 | CON-030 | Consultoria / Reforma — comunicação | Comunicar a carteira sobre a reforma e registrar a ciência dos client… | Por evento (norma, janela) + mens… | B | — | V3·I-05 (envio em massa); V3·I-09 (e-mail) | opt-in para marketing se o comunicado for informativo | marketing R$ 0,3217/mensagem [R2] | 4 | 3 | 4 | 3 | 5 | 144 | P2 | V3 (Alta · parc. R2) |
| 146 | CTB-028 | Contábil / Relatórios gerenciais | Gerar e enviar o relatório mensal ao cliente | Mensal (quando contratado); anual… | F | B, P | V3·I-05 (link), Conta Azul DRE [D5:C4] como referência | opt-in | WhatsApp: serviço 1.000 grátis/número/mês, depois R$ 0,035; utilidade R$ 0,035 [R2] | 4 | 3 | 3 | 4 | 4 | 144 | P2 | V3 (Média · parc. R2) |
| 147 | CTB-008 | Contábil / Extratos | Obter o extrato de cada conta (OFX, PDF ou planilha) | Mensal | F | B (Open Finance depois) | OFX enviado pelo cliente no app (MVP); Open Finance (V3·I-10) depois | nenhuma (F) ou consent-cli (B) | Pluggy ≥ R$ 2.500/mês; Belvo US$ 1.000/mês [R2] | 4 | 3 | 3 | 4 | 4 | 144 | P2 | V3 (Alta · parc. R2) |
| 148 | NFE-038 | Notas fiscais / Atendimento | Cobrar do cliente os documentos fiscais que faltam | Mensal (dias 1 a 10) + por pendên… | B | P | V3·I-05 (utilidade); concorrentes Questor Tareffa (3 lembretes) [D5:C1], Acessórias, Gest… | opt-in | régua de 3 lembretes × clientes × meses [NÃO VERIFICAD… | 4 | 3 | 4 | 3 | 2 | 144 | P2 | V3 (Média · parc. R2) |
| 149 | CTB-029 | Contábil / Relatórios gerenciais | Explicar o resultado ao cliente e responder perguntas | Por evento; reunião mensal ou tri… | B | P | V3·I-05, V3·I-07 | — (V3) | WhatsApp: serviço 1.000 grátis/número/mês, depois R$ 0,035; utilidade R$ 0,035 [R2] | 5 | 3 | 3 | 3 | 5 | 135 | P2 | V3 (Média · parc. R2) |
| 150 | CTB-002 | Contábil / Coleta de documentos | Pedir os documentos da competência ao cliente | Mensal (dia 1 a 5, conforme o cal… | B | P | V3·I-05 (utilidade), V3·I-10 (substitui o pedido de extrato quando há consentimento) | opt-in | WhatsApp: serviço 1.000 grátis/número/mês, depois R$ 0,035; utilidade R$ 0,035 [R2] | 5 | 3 | 3 | 3 | 4 | 135 | P2 | V3 (Média · parc. R2) |
| 151 | CTB-003 | Contábil / Coleta de documentos | Cobrar os documentos pendentes até completar | Mensal, em régua (ex.: D+3, D+7,… | B | P | V3·I-05; Questor Tareffa (3 lembretes) [D5:C1] | opt-in | WhatsApp: serviço 1.000 grátis/número/mês, depois R$ 0,035; utilidade R$ 0,035 [R2] | 5 | 3 | 3 | 3 | 3 | 135 | P2 | V3 (Média · parc. R2) |
| 152 | DP-009 | Trabalhista e DP / Fechamento da folha | Pedir e cobrar as variáveis da folha dentro do prazo | Mensal (corte interno, ex.: dia 2… | B | P | V3·I-05; concorrentes Onvio Portal, Alterdata eContador, Acessórias, Gestta [V3·I-17] | opt-in | R$ 0,035/lembrete (300 clientes × 3 = R$ 31,50/mês) [R2] | 5 | 3 | 3 | 3 | 2 | 135 | P2 | V3 (Alta · parc. R2) |
| 153 | NFE-034 | Notas fiscais / Envio ao core | Manter o de-para de CFOP, acumuladores e produtos e tratar erros de i… | Por evento (fornecedor/produto no… | F | P | Domínio: guias de CFOP e acumuladores, exceções por fornecedor/produto; erro "relação de… | acesso aos relatórios do core | — (V3) | 4 | 4 | 2 | 4 | 5 | 128 | P2 | V3 (Média · parc. R2) |
| 154 | CON-010 | Consultoria / Planejamento tributário | Monitorar durante o ano os gatilhos de revisão do regime | Mensal (após fechamento) | Próprio* | — | próprio | — | — | 4 | 3 | 2 | 5 | 5 | 120 | P2 | sem V |
| 155 | CON-011 | Consultoria / Planejamento tributário | Calcular o efeito da LC 224/2025 no Lucro Presumido e acompanhar o li… | Trimestral + por evento judicial | Próprio* | — | próprio | — | — | 3 | 2 | 4 | 5 | 5 | 120 | P2 | sem V |
| 156 | CON-025 | Consultoria / Reforma — créditos de t… | Planejar o aproveitamento dos saldos de PIS/Cofins antes da extinção | Urgente até 31/12/2026; depois me… | Próprio* | — | próprio | — | — | 4 | 3 | 2 | 5 | 5 | 120 | P2 | sem V |
| 157 | CTB-009 | Contábil / Extratos | Converter extrato em PDF ou imagem em dados | Mensal, por conta sem OFX | Próprio | — | nenhuma necessária; OCR comercial opcional [NÃO VERIFICADO] | — (V3) | custo de modelo por página [NÃO VERIFICADO] | 4 | 3 | 2 | 5 | 5 | 120 | P2 | V3 (Média · R1) |
| 158 | CTB-018 | Contábil / Conciliação | Conciliar contas patrimoniais | Mensal (ideal); na prática trimes… | F* | — | próprio | — | — | 5 | 3 | 2 | 4 | 5 | 120 | P2 | sem V |
| 159 | CTB-022 | Contábil / Conciliação | Contabilizar parcelamentos tributários e sua atualização | Por evento (adesão); mensal (parc… | A$ | A | — | — | extratos PAEX/SIPADE e SN/MEI: Consulta R$ 0,24 [R2] | 2 | 3 | 4 | 5 | 5 | 120 | P2 | V1 (Alta · conf. R2) |
| 160 | CTB-027 | Contábil / Fechamento | Tratar documento que chega depois do fechamento | Por evento | Próprio* | — | próprio | — | — | 4 | 2 | 3 | 5 | 5 | 120 | P2 | sem V |
| 161 | CTB-030 | Contábil / Relatórios gerenciais | Calcular indicadores e emitir alertas ao cliente | Mensal | A | P | — | — | — | 4 | 3 | 2 | 5 | 5 | 120 | P2 | V1 (Alta · conf. R2) |
| 162 | CTB-037 | Contábil / Distribuição de lucros | Preparar a aprovação de contas e a ata de distribuição | Anual (até 30/04 para exercício e… | B | — | V3·I-13 | token do provedor | API desde R$ 69/mês (Clicksign Start; ZapSign Equipe R$ 69,90; D4Sign Prof. R$ 79,90) [R2] | 4 | 5 | 2 | 3 | 5 | 120 | P2 | V3 (Baixa · parc. R2) |
| 163 | CTB-038 | Contábil / Distribuição de lucros | Calcular e simular Juros sobre Capital Próprio | Anual ou trimestral | Próprio* | — | próprio | — | — | 3 | 2 | 4 | 5 | 5 | 120 | P2 | sem V |
| 164 | CTB-046 | Contábil / Inventário | Coletar e conferir o inventário de estoque de 31/12 | Anual (31/12, informado na EFD de… | Próprio* | — | próprio | — | — | 3 | 2 | 4 | 5 | 5 | 120 | P2 | sem V |
| 165 | CTB-047 | Contábil / Imobilizado | Controlar o imobilizado fora do core | Mensal (depreciação); por evento… | Próprio* | — | próprio | — | — | 4 | 3 | 2 | 5 | 5 | 120 | P2 | sem V |
| 166 | CTB-051 | Contábil / Conformidade | Atender auditoria, due diligence e fiscalização | Por evento | Próprio* | — | próprio | — | — | 3 | 2 | 4 | 5 | 5 | 120 | P2 | sem V |
| 167 | DP-004 | Trabalhista e DP / Admissão · eSocial | Conferir CPF e dados cadastrais antes de transmitir o S-2200 | Por evento | A$ | C-cert, D | — | — | Integra (oficial): Consulta R$ 0,24→0,06 · Emissão R$ 0,32→0,08 · Declaração R$ 0,40→0,12 [R2] | 3 | 2 | 4 | 5 | 5 | 120 | P2 | V1 (Baixa · parc. R2) |
| 168 | DP-006 | Trabalhista e DP / Admissão · eSocial | Transmitir a admissão no prazo e conferir o recibo | Por evento | A | — | — | e-CNPJ do escritório + procuração eSocial | — | 3 | 2 | 4 | 5 | 5 | 120 | P2 | V1 (Alta · conf. R2) |
| 169 | DP-008 | Trabalhista e DP / Admissão · Benefíc… | Incluir o novo empregado nos benefícios | Por evento | Próprio* | — | próprio | — | — | 3 | 2 | 4 | 5 | 5 | 120 | P2 | sem V |
| 170 | DP-023 | Trabalhista e DP / Férias | Controlar períodos aquisitivos e concessivos e alertar o risco de dob… | Mensal (varredura); por evento (v… | Próprio* | — | próprio | — | — | 4 | 3 | 2 | 5 | 5 | 120 | P2 | sem V |
| 171 | DP-028 | Trabalhista e DP / Rescisão · SST | Providenciar o exame demissional ou registrar a dispensa | Por evento | Próprio* | — | próprio | — | — | 3 | 2 | 4 | 5 | 5 | 120 | P2 | sem V |
| 172 | DP-029 | Trabalhista e DP / Rescisão · eSocial… | Conferir o S-2299 e a guia rescisória do FGTS | Por evento | A | D | — | — | — | 3 | 2 | 4 | 5 | 5 | 120 | P2 | V1 (Alta · conf. R2) |
| 173 | DP-044 | Trabalhista e DP / Reclamatórias | Informar e recolher valores de processo trabalhista | Por evento | A | A$, D | — | — | — | 3 | 2 | 4 | 5 | 5 | 120 | P2 | V1 (Alta · conf. R2) |
| 174 | DP-045 | Trabalhista e DP / Ponto | Verificar a conformidade do controle de ponto do cliente | Por evento (novo cliente, troca d… | Próprio* | — | próprio | — | — | 3 | 2 | 4 | 5 | 5 | 120 | P2 | sem V |
| 175 | DP-052 | Trabalhista e DP / Benefícios | Movimentar plano de saúde e seguro de vida | Mensal; por evento | Próprio* | — | próprio | — | — | 4 | 3 | 2 | 5 | 5 | 120 | P2 | sem V |
| 176 | DP-055 | Trabalhista e DP / Igualdade salarial | Preparar o Relatório de Transparência Salarial | Semestral (fev–abr e ago) [T7] | Próprio* | — | próprio | — | — | 3 | 2 | 4 | 5 | 5 | 120 | P2 | sem V |
| 177 | DP-056 | Trabalhista e DP / Cotas | Monitorar as cotas de aprendizes e de pessoas com deficiência | Mensal (variação do quadro) | Próprio* | — | próprio | — | — | 2 | 3 | 4 | 5 | 5 | 120 | P2 | sem V |
| 178 | DP-057 | Trabalhista e DP / Anuais | Corrigir dados de vínculos para o abono salarial e as bases que subst… | Anual (prazo citado de 20/06 para… | A | — | — | — | — | 4 | 2 | 3 | 5 | 5 | 120 | P2 | V1 (Baixa · R1) |
| 179 | FIS-039 | Fiscal / Malhas e intimações | Responder a malha PJ e campanhas de autorregularização | Por evento (campanhas) | A$ | D | — | — | Integra (oficial): Consulta R$ 0,24→0,06 · Emissão R$ 0,32→0,08 · Declaração R$ 0,40→0,12 [R2] | 3 | 2 | 4 | 5 | 5 | 120 | P2 | V1 (Baixa · R1) |
| 180 | GES-008 | Gestão / Fiscal do escritório | Conferir retenções na fonte sobre os honorários e o valor líquido rec… | Mensal; anual (informes de retenç… | Próprio | — | — | — | — | 4 | 3 | 2 | 5 | 5 | 120 | P2 | V1 (Alta · conf. R2) |
| 181 | GES-011 | Gestão / Indicadores | Acompanhar os indicadores financeiros do escritório | Mensal; sob demanda | Próprio* | — | próprio | — | — | 4 | 3 | 2 | 5 | 5 | 120 | P2 | sem V |
| 182 | GES-015 | Gestão / Rentabilidade | Detectar mudança de volume que pede revisão de honorário | Mensal (automático) | Próprio* | — | próprio | — | — | 4 | 3 | 2 | 5 | 5 | 120 | P2 | sem V |
| 183 | GES-017 | Gestão / Equipe | Distribuir a carteira e balancear a carga entre analistas | Por evento (cliente novo, admissã… | Próprio* | — | próprio | — | — | 3 | 2 | 4 | 5 | 5 | 120 | P2 | sem V |
| 184 | GES-018 | Gestão / Equipe | Cobrir ausências e férias da equipe | Por evento; planejamento anual | Próprio* | — | próprio | — | — | 3 | 2 | 4 | 5 | 5 | 120 | P2 | sem V |
| 185 | GES-019 | Gestão / Qualidade | Registrar erros, retrabalho e multas assumidas pelo escritório | Por evento | Próprio* | — | próprio | — | — | 3 | 2 | 4 | 5 | 5 | 120 | P2 | sem V |
| 186 | GES-021 | Gestão / Segurança | Dar e revogar acessos da equipe (admissão e desligamento de funcionár… | Por evento | Próprio* | — | próprio | — | — | 3 | 2 | 4 | 5 | 5 | 120 | P2 | sem V |
| 187 | GES-030 | Atendimento / Envio em massa | Enviar comunicados em massa segmentados | Semanal a mensal; por evento (nor… | B | — | V3·I-05, V3·I-09 | opt-in por finalidade | marketing R$ 0,3217/mensagem (300 clientes ≈ R$ 96,51) [R2] | 5 | 4 | 2 | 3 | 5 | 120 | P2 | V3 (Alta · parc. R2) |
| 188 | GES-031 | Atendimento / Canal | Gerir consentimento (opt-in/opt-out) e saúde do número oficial | Contínua; por evento | B | P | indicadores de qualidade e limite de mensagens do número pela API/painel da Meta [NÃO VER… | Meta Business | — (V3) | 4 | 5 | 2 | 3 | 5 | 120 | P2 | V3 (Baixa · parc. R2) |
| 189 | GES-041 | Atendimento / Portal do cliente | Gerir usuários e permissões do cliente no portal | Por evento | Próprio* | — | próprio | — | — | 3 | 2 | 4 | 5 | 5 | 120 | P2 | sem V |
| 190 | GES-043 | Gestão / Retenção | Detectar risco de saída do cliente | Mensal (automático) | Próprio* | — | próprio | — | — | 4 | 3 | 2 | 5 | 5 | 120 | P2 | sem V |
| 191 | GES-052 | Timesheet / Trabalhista | Alinhar o timesheet ao controle de ponto oficial | Na implantação; mensal (conferênc… | Próprio* | — | próprio | — | — | 2 | 3 | 4 | 5 | 5 | 120 | P2 | sem V |
| 192 | GES-055 | Timesheet / Custos | Definir e atualizar o custo-hora de cada função | Anual; por evento (reajuste salar… | Próprio* | — | próprio | — | — | 3 | 2 | 4 | 5 | 5 | 120 | P2 | sem V |
| 193 | NFE-028 | Notas fiscais / Risco | Verificar a regularidade cadastral dos emitentes (idoneidade) na data… | Por fornecedor novo / mensal | A | A$, B, C-captcha | V3·I-12; Qive Portal de Fornecedores [D6:C5] (V3) | token-esc (V3) | I-02 por consulta: custo multiplica pelo nº de fornece… | 2 | 3 | 4 | 5 | 5 | 120 | P2 | V1 (Média · parc. R2) |
| 194 | NFE-032 | Notas fiscais / Conferência tributária | Auditar o cadastro de produtos e a parametrização fiscal do emissor d… | Trimestral + onboarding + mudança… | Próprio* | — | próprio | — | — | 3 | 2 | 4 | 5 | 5 | 120 | P2 | sem V |
| 195 | NFE-035 | Notas fiscais / Envio ao core | Conferir o que entrou no core contra os XMLs (quantidade e valores) | Mensal (antes de gerar as obrigaç… | F | — | V3·I-01 a V3·I-03 (relatórios em CSV/TXT [NÃO VERIFICADO]); SPED EFD gerado pelo core com… | — (V3) | — (V3) | 5 | 3 | 2 | 4 | 5 | 120 | P2 | V3 (Baixa · R1) |
| 196 | SOC-004 | Clientes / Pessoas vinculadas | Cadastrar sócios, administradores e representantes | Por evento (entrada de sócio, alt… | A | B, D | V1·I-04; V1·I-02; CPF dos sócios por V1·I-03 (A$, opcional) | Nenhuma / SERPRO | Ver mapa | 3 | 2 | 4 | 5 | 5 | 120 | P2 | V1 (Média · parc. R2) |
| 197 | SOC-017 | Clientes / Contratos | Controlar o escopo contratado e os serviços extras | Mensal | Próprio* | — | próprio | — | — | 4 | 3 | 2 | 5 | 5 | 120 | P2 | sem V |
| 198 | SOC-019 | Clientes / Compliance do escritório | Cumprir a prevenção à lavagem de dinheiro (PLD) | Por evento (onboarding, operação… | B | D | V3·I-12 (BigDataCorp, Serasa, Neoway, Assertiva) [NÃO VERIFICADO]; listas públicas (Porta… | token-esc | Infosimples R$ 0,20→0,09/consulta, franquia R$ 100/mês [R2] | 4 | 2 | 5 | 3 | 5 | 120 | P2 | V3 (Baixa · parc. R2) |
| 199 | SOC-043 | Societário / Livros | Manter o livro societário (quotas, deliberações, lucros por sócio) | Mensal ou por evento | Próprio* | — | próprio | — | — | 4 | 3 | 2 | 5 | 5 | 120 | P2 | sem V |
| 200 | SOC-030 | Societário / Processos | Acompanhar processos e responder exigências | Diária enquanto houver processo a… | B | C-captcha, D | viabilidade JUCESP por agregador (só SP) (V2·I-19); demais Juntas sem API | protocolo; gov.br. | R$ 0,20 + adicional R$ 0,08 [R2] | 2 | 5 | 4 | 3 | 5 | 120 | P2 | V2 (Média · conf. R2) |
| 201 | DP-054 | Trabalhista e DP / Anuais | Gerar e distribuir o informe de rendimentos dos empregados | Anual (fevereiro) | Próprio* | — | próprio | — | — | 3 | 2 | 4 | 5 | 4 | 120 | P2 | V1 sem nível |
| 202 | FIS-033 | Fiscal / Comunicação (transversal: D7) | Enviar ao cliente o resumo mensal fiscal | Mensal | Próprio | B | V3·I-05 (modelo de utilidade com link para o portal) (V3) | opt-in (V3) | WhatsApp: serviço 1.000 grátis/número/mês, depois R$ 0,035; utilidade R$ 0,035 [R2] | 4 | 3 | 2 | 5 | 4 | 120 | P2 | V1 (Alta · conf. R2) |
| 203 | GES-036 | Atendimento / Registro | Registrar autorizações e combinados dados pelo cliente no chat | Por evento (diária) | B | P | V3·I-05 (mensagens com ID e horário), V3·I-13 | — (V3) | WhatsApp: serviço 1.000 grátis/número/mês, depois R$ 0,035; utilidade R$ 0,035 [R2] | 4 | 5 | 2 | 3 | 4 | 120 | P2 | V3 (Baixa · parc. R2) |
| 204 | CON-001 | Consultoria / Atendimento técnico | Receber, triar e registrar as consultas técnicas dos clientes | Diária, por evento (mensagem do c… | B | P | V3·I-05, V3·I-07, V3·I-09 | — (V3) | WhatsApp: serviço 1.000 grátis/número/mês, depois R$ 0,035; utilidade R$ 0,035 [R2] | 4 | 5 | 2 | 3 | 3 | 120 | P2 | V3 (Média · parc. R2) |
| 205 | CTB-024 | Contábil / Fechamento | Executar o checklist de fechamento de cada cliente | Mensal | Próprio* | — | próprio | — | — | 4 | 3 | 2 | 5 | 3 | 120 | P2 | sem V |
| 206 | SOC-034 | Societário / Documentos | Guardar documentos societários e atender pedidos de documento | Por evento (várias vezes por sema… | B | P | armazenamento (S3/Drive/OneDrive, Plano 3.3); V3·I-05 para enviar documento ao cliente; c… | — (V3) | WhatsApp: serviço 1.000 grátis/número/mês, depois R$ 0,035; utilidade R$ 0,035 [R2] | 4 | 5 | 2 | 3 | 3 | 120 | P2 | V3 (Média · parc. R2) |
| 207 | FIS-028 | Fiscal / Municipal | Apurar e emitir guias de ISS e entregar declarações municipais | Mensal / trimestral | A | F (guias pelo core), C-cert | apuração sobre NFS-e do ADN (V1·I-17); guias/declarações pelo core | A1-cli (app) | Infosimples R$ 0,20→0,09/consulta, franquia R$ 100/mês [R2] | 2 | 3 | 4 | 5 | 3 | 120 | P2 | V2 (Média · parc. R2) |
| 208 | FIS-036 | Fiscal / Certidões | Emitir, monitorar a validade e entregar certidões negativas | Por evento + periódica para clien… | B | A$, C-captcha | V2·I-18; certidões estaduais (V2·I-07 a V2·I-11) e municipais. | nenhuma (públicas) + contrato com agregador. | Infosimples R$ 0,20→0,09/consulta, franquia R$ 100/mês [R2]; adicional CND R$ 0,04–0,08 | 5 | 2 | 4 | 3 | 2 | 120 | P2 | V2 (Alta · conf. R2) |
| 209 | NFE-005 | Notas fiscais / Captura de saídas | Obter as notas de saída emitidas pelo cliente | Mensal (início do mês) + por even… | A | B, D | V3·I-16 (Conta Azul, Omie, Bling, Nibo); Conta Azul captura NF-e/NFS-e/NFC-e/CT-e da cart… | e-CNPJ do escritório (autXML); A1-cli (app) (SAE-NFC-e SP) | gratuito [R2] | 4 | 3 | 2 | 5 | 2 | 120 | P2 | V2 (Alta · conf. R2) |
| 210 | DP-012 | Trabalhista e DP / Fechamento da folha | Enviar a prévia da folha ao cliente e registrar a aprovação | Mensal | B | P | V3·I-05 (modelo de utilidade com botões de resposta rápida) | opt-in; lista de quem pode aprovar | WhatsApp: serviço 1.000 grátis/número/mês, depois R$ 0,035; utilidade R$ 0,035 [R2] | 4 | 3 | 3 | 3 | 5 | 108 | P3 | V3 (Média · parc. R2) |
| 211 | DP-011 | Trabalhista e DP / Fechamento da folha | Lançar ou importar as variáveis no core | Mensal | B | F (Contmatic) | ePlugin POST /api/v1/movimentos (Alterdata); API de Rubricas do Domínio (V3·I-01, I-02) | token ePlugin; homologação TR | [PREÇO NÃO PÚBLICO] (pacote/parceria) | 4 | 3 | 3 | 3 | 4 | 108 | P3 | V3 (Alta · conf. R2) |
| 212 | CTB-035 | Contábil / Distribuição de lucros | Projetar o IRPFM dos sócios | Trimestral; dezembro | Próprio | — | — | — | — | 5 | 2 | 2 | 5 | 5 | 100 | P3 | V1 (Média · R1) |
| 213 | GES-050 | Timesheet / Captura | Captar reuniões e ligações do calendário | Contínua | A | — | Google Calendar API, Microsoft Graph (V3·I-09); telefonia VoIP com webhook [NÃO VERIFICAD… | OAuth do escritório | sem custo de API [NÃO VERIFICADO] | 2 | 5 | 2 | 5 | 5 | 100 | P3 | V3 (Média · R1) |
| 214 | GES-051 | Timesheet / Revisão | Revisar, completar e confirmar o timesheet do dia | Diária ou semanal | Próprio* | — | próprio | — | — | 2 | 5 | 2 | 5 | 5 | 100 | P3 | sem V |
| 215 | GES-056 | Timesheet / IA | Medir o tempo que a IA economiza e o tempo das ações da IA | Contínua; mensal (relatório) | Próprio* | — | próprio | — | — | 2 | 5 | 2 | 5 | 5 | 100 | P3 | sem V |
| 216 | NFE-015 | Notas fiscais / Manifestação | Fazer a manifestação conclusiva (confirmação, desconhecimento, operaç… | Por nota; prazo de 90 dias da aut… | A | B | V3·I-05 com modelo de utilidade com botões ("reconheço" / "não reconheço") | A1-cli (app) · A1 do cliente para o evento; opt-in | WhatsApp: serviço 1.000 grátis/número/mês, depois R$ 0,035; utilidade R$ 0,035 [R2] | 2 | 2 | 5 | 5 | 5 | 100 | P3 | V3 (Média · parc. R2) |
| 217 | GES-047 | Timesheet / Captura | Captar tempo a partir dos eventos da própria plataforma | Contínua | Próprio* | — | próprio | — | — | 2 | 5 | 2 | 5 | 3 | 100 | P1 (hab.) | sem V |
| 218 | NFE-014 | Notas fiscais / Manifestação | Registrar a Ciência da Operação para liberar o XML completo | Diária (por nota) | A | — | — | A1-cli (app) · A1 do cliente + autorização registrada no contrato. | gratuito [NÃO VERIFICADO]. | 2 | 5 | 2 | 5 | 2 | 100 | P3 | V2 (Média · R1) |
| 219 | CTB-013 | Contábil / Adquirentes | Conciliar recebíveis de maquininha e marketplace | Mensal | F | B | Concil, Auditto (conciliação de cartões) [D5:C17]; APIs das adquirentes [NÃO ENCONTRADO]… | acesso do cliente ao portal da adquirente | [NÃO VERIFICADO] | 4 | 3 | 2 | 4 | 5 | 96 | P3 | V3 (Baixa · R1) |
| 220 | CTB-020 | Contábil / Conciliação | Conferir a integração folha-contábil | Mensal | F | — | relatórios da folha e balancete do core | — (V3) | — (V3) | 4 | 3 | 2 | 4 | 5 | 96 | P3 | V3 (Baixa · parc. R2) |
| 221 | CTB-031 | Contábil / Relatórios gerenciais | Preparar demonstrações para banco, licitação e investidores | Por evento | F* | — | próprio | — | — | 3 | 2 | 4 | 4 | 5 | 96 | P3 | sem V |
| 222 | DP-005 | Trabalhista e DP / Admissão | Preparar e colher assinatura do contrato e dos termos de admissão | Por evento | B | — | V3·I-13 (Clicksign/D4Sign/ZapSign), Anaclara (WhatsApp) [D4:C10] | token do provedor; e-mail ou telefone do empregado | API desde R$ 69/mês (Clicksign Start; ZapSign Equipe R$ 69,90; D4Sign Prof. R$ 79,90) [R2] | 4 | 2 | 4 | 3 | 5 | 96 | P3 | V3 (Baixa · parc. R2) |
| 223 | DP-018 | Trabalhista e DP / FGTS Digital | Emitir e conferir a guia do FGTS Digital (GFD) | Mensal (dia 20 do mês seguinte; d… | C-cert | D | FGTS Digital sem API pública (V1·I-08); analista emite, plataforma lê o PDF | e-CNPJ do escritório + procuração SPE | — | 4 | 3 | 4 | 2 | 5 | 96 | P3 | V1 (Alta · conf. R2) |
| 224 | DP-022 | Trabalhista e DP / Pagamento | Gerar o arquivo ou a lista de pagamento dos salários | Mensal; por evento | F | B | V3·I-11; Open Finance de iniciação de pagamento existe, mas pagamento em lote por iniciad… | credenciais bancárias do cliente (o escritório não dev… | — (V3) | 2 | 3 | 4 | 4 | 5 | 96 | P3 | V3 (Média · R1) |
| 225 | DP-030 | Trabalhista e DP / Rescisão | Montar os documentos rescisórios, colher assinaturas e homologar quan… | Por evento | B | D | V3·I-13 | token do provedor | API desde R$ 69/mês (Clicksign Start; ZapSign Equipe R$ 69,90; D4Sign Prof. R$ 79,90) [R2] | 4 | 2 | 4 | 3 | 5 | 96 | P3 | V3 (Baixa · parc. R2) |
| 226 | FIS-023 | Fiscal / Controle de entregas (transv… | Controlar a entrega dos SPED gerados pelo core (EFD ICMS/IPI, EFD-Con… | Mensal (prazos por UF; EFD-Contri… | F | — | — | — | — | 2 | 3 | 4 | 4 | 5 | 96 | P3 | V1 (Média · R1) |
| 227 | NFE-025 | Notas fiscais / Conferência tributária | Conferir substituição tributária do ICMS nas entradas e saídas | Mensal | F | Próprio (cálculo), P | cálculo próprio; guia gerada no core (decisão 2) | acesso ao core | — | 4 | 3 | 2 | 4 | 5 | 96 | P3 | V2 (Média · R1) |
| 228 | DP-001 | Trabalhista e DP / Admissão | Receber a solicitação de admissão do cliente e validar os dados mínim… | Por evento (cada contratação) | B | Próprio, P | app/WhatsApp + ePlugin POST /api/v1/candidatos (Alterdata) | token ePlugin | WhatsApp: serviço 1.000 grátis/número/mês, depois R$ 0,035; utilidade R$ 0,035 [R2] | 4 | 2 | 4 | 3 | 4 | 96 | P3 | V3 (Alta · parc. R2) |
| 229 | NFE-029 | Notas fiscais / Conferência | Tratar notas canceladas e denegadas antes do fechamento | Mensal | F* | — | próprio | — | — | 4 | 3 | 2 | 4 | 3 | 96 | P3 | sem V |
| 230 | FIS-021 | Fiscal / Guias federais | Emitir DARF avulso e recalcular tributo pago em atraso | Por evento (frequente: cliente qu… | A$ | — | — | — | Sicalc: Emissão R$ 0,32; CONSOLIDAR54 simula acréscimos [R2] | 3 | 2 | 3 | 5 | 5 | 90 | P3 | V1 (Alta · conf. R2) |
| 231 | FIS-027 | Fiscal / Estadual | Consultar conta-corrente e pendências estaduais | Mensal (ideal) | B | C-cert, C-crc | certidão por agregador como sentinela (V2·I-18); SIDEB SP C-cert | A1-cli (app) ou procurador | Infosimples R$ 0,20→0,09/consulta, franquia R$ 100/mês [R2] | 2 | 3 | 5 | 3 | 3 | 90 | P3 | V2 (Média · parc. R2) |
| 232 | CON-008 | Consultoria / Planejamento tributário | Fazer o planejamento tributário anual (Simples × Presumido × Real) | Anual (para Simples, até a janela… | Próprio | — | — | — | — | 4 | 2 | 2 | 5 | 5 | 80 | P3 | V1 (Alta · conf. R2) |
| 233 | CON-028 | Consultoria / Reforma — parâmetros | Manter as tabelas de alíquotas e regras da reforma usadas nas simulaç… | Por evento (anual) | A | — | — | — | — | 4 | 2 | 2 | 5 | 5 | 80 | P3 | V1 (Baixa · parc. R2) |
| 234 | DP-037 | Trabalhista e DP / Convenções · Jorna… | Verificar a autorização para trabalho em domingos e feriados | Por evento (cada feriado); anual… | Próprio* | — | próprio | — | — | 2 | 2 | 4 | 5 | 5 | 80 | P3 | sem V |
| 235 | DP-050 | Trabalhista e DP / SST | Cobrar a atualização do PGR com os riscos psicossociais | Pontual (campanha); anual (revisã… | Próprio* | — | próprio | — | — | 2 | 2 | 4 | 5 | 5 | 80 | P3 | sem V |
| 236 | GES-014 | Gestão / Rentabilidade | Revisar honorários e conduzir a campanha de reajuste | Anual (data-base); por evento (cl… | A* | — | próprio | — | — | 4 | 2 | 2 | 5 | 5 | 80 | P3 | sem V |
| 237 | GES-049 | Timesheet / Captura | Captar tempo pelo agente de desktop (janela ativa e ociosidade) | Contínua durante o expediente | F* | fora do plano principal (decisão 3); só p/ core sem API | próprio | — | — | 2 | 5 | 2 | 4 | 5 | 80 | P3 (alt.) | sem V |
| 238 | NFE-017 | Notas fiscais / Eventos de transporte | Registrar prestação de serviço em desacordo no CT-e | Por evento | A | P | — | — | — | 2 | 2 | 4 | 5 | 5 | 80 | P3 | V2 (Média · R1) |
| 239 | CTB-001 | Contábil / Coleta de documentos | Montar e manter o checklist de documentos esperados de cada cliente | Na entrada do cliente; por evento… | Próprio* | — | próprio | — | — | 4 | 2 | 2 | 5 | 3 | 80 | P3 | sem V |
| 240 | NFE-001 | Notas fiscais / Configuração | Configurar a captura de documentos fiscais de cada cliente | Por evento (cliente novo, filial… | A | P | comprar alternativa: NFE.io (API documentada) [D3:C8], SIEG, Qive, Jettax, e-Auditoria [V… | A1-cli (app) + autXML do escritório | fonte oficial grátis; SIEG Control ≥ R$ 223/mês [R2] | 4 | 2 | 2 | 5 | 3 | 80 | P1 (hab.) | V3 (Média · parc. R2) |
| 241 | SOC-001 | Clientes / Cadastro | Cadastrar cliente a partir do CNPJ | Por evento (cliente novo; abertur… | A | A$, B | V1·I-04 dados abertos (base inicial); V1·I-02 Consulta CNPJ para dado do dia; V1·I-22 IBG… | Nenhuma (I-04, I-22); contrato SERPRO (I-02) | Consulta CNPJ: Básica R$ 0,6591 · QSA R$ 0,8683 (faixa 1) [R2]; dados abertos: endereço novo não achado | 4 | 2 | 2 | 5 | 3 | 80 | P1 (hab.) | V1 (Média · parc. R2) |
| 242 | CTB-011 | Contábil / Extratos | Descobrir contas e cartões que o cliente não informou | Mensal | B | D | V3·I-10; Registrato do BCB (relacionamentos do CNPJ) — acesso do próprio titular, sem API… | consent-cli; gov.br do representante para o Registrato | Pluggy ≥ R$ 2.500/mês; Belvo US$ 1.000/mês [R2] | 4 | 3 | 2 | 3 | 5 | 72 | P3 | V3 (Baixa · parc. R2) |
| 243 | DP-051 | Trabalhista e DP / Benefícios | Calcular e solicitar a recarga mensal de VT e VR/VA | Mensal | B | F | Flash (benefícios) [D4:C8]; demais operadoras [NÃO ENCONTRADO] | acesso do cliente à operadora | [NÃO VERIFICADO] | 4 | 3 | 2 | 3 | 5 | 72 | P3 | V3 (Baixa · R1) |
| 244 | GES-002 | Gestão / Faturamento de honorários | Faturar serviços extras e avulsos | Por evento; fechamento mensal | B | — | V3·I-14 (cobrança avulsa), NFS-e (GES-007) | token | Asaas R$ 1,59/Pix ou boleto (R$ 0,79 promocional; conferido em 7/11/2026); Efí boleto R$ 3,45, Pix Automático R$ 3,50 [R2] | 4 | 3 | 2 | 3 | 5 | 72 | P3 | V3 (Média · parc. R2) |
| 245 | GES-005 | Gestão / Cobrança | Negociar e acompanhar acordos de honorários em atraso | Por evento (inadimplência > X dia… | B | — | V3·I-13, V3·I-14 | tokens | API desde R$ 69/mês (Clicksign Start; ZapSign Equipe R$ 69,90; D4Sign Prof. R$ 79,90) [R2] | 3 | 2 | 4 | 3 | 5 | 72 | P3 | V3 (Média · parc. R2) |
| 246 | CTB-007 | Contábil / Coleta de documentos | Buscar dados do sistema financeiro ou ERP do cliente | Mensal | B | — | V3·I-16 (Conta Azul, Omie, Bling, Nibo); Conta Azul integra por API com o Domínio [D5:C4] | chave de API emitida pelo cliente | [NÃO VERIFICADO] | 4 | 3 | 2 | 3 | 4 | 72 | P3 | V3 (Baixa · parc. R2) |
| 247 | CTB-012 | Contábil / Cartões | Obter e lançar faturas de cartão de crédito corporativo | Mensal | B | F | V3·I-10; Questor traz fatura de cartão pelo Open Finance [D5:C2] | consent-cli | ver CTB-010 | 4 | 3 | 2 | 3 | 4 | 72 | P3 | V3 (Média · parc. R2) |
| 248 | DP-024 | Trabalhista e DP / Férias | Programar as férias, emitir aviso e recibo e controlar o pagamento an… | Por evento | B | P | V3·I-13; concorrentes Alterdata eContador/ePessoal (agendamento com validação) [D4:C3][D4… | token do provedor | API desde R$ 69/mês (Clicksign Start; ZapSign Equipe R$ 69,90; D4Sign Prof. R$ 79,90) [R2] | 3 | 2 | 4 | 3 | 4 | 72 | P3 | V3 (Média · parc. R2) |
| 249 | CTB-017 | Contábil / Integração com o core | Exportar os lançamentos no leiaute de importação do core | Mensal | B | F (Contmatic) | ePlugin POST /api/v1/integracao/integracaoAlterdata (lançamentos); Domínio: pagamentos/recebimentos | token ePlugin; homologação TR | [PREÇO NÃO PÚBLICO] | 4 | 3 | 2 | 3 | 3 | 72 | P3 | V3 (Alta · conf. R2) |
| 250 | SOC-021 | Clientes / Onboarding | Conduzir o onboarding do cliente | Por evento (contrato assinado ou… | B | P | V3·I-05 (opt-in e grupo de contatos), V3·I-13 (contrato), V3·I-10 (convite Open Finance),… | A1-cli (app), chave Onvio, token ePlugin, consentimentos | soma dos itens; Open Finance fora do MVP | 4 | 2 | 3 | 3 | 3 | 72 | P3 | V3 (Média · parc. R2) |
| 251 | CON-014 | Consultoria / Planejamento tributário | Analisar reorganização societária com finalidade tributária | Rara, por evento | Próprio* | — | próprio | — | — | 3 | 1 | 4 | 5 | 5 | 60 | P3 | sem V |
| 252 | CON-021 | Consultoria / Reforma — regimes espec… | Enquadrar o cliente em regime específico e mapear as regras próprias | Uma vez por cliente + por evento… | Próprio* | — | próprio | — | — | 3 | 2 | 2 | 5 | 5 | 60 | P3 | sem V |
| 253 | CON-022 | Consultoria / Reforma — IS | Avaliar o Imposto Seletivo para os clientes afetados | Por evento (fixação das alíquotas… | Próprio* | — | próprio | — | — | 3 | 2 | 2 | 5 | 5 | 60 | P3 | sem V |
| 254 | CTB-039 | Contábil / Encerramento anual | Obter a carta de responsabilidade da administração | Anual | B | — | V3·I-13; Omie emite a carta no ERP [D5:C12] | token do provedor | API desde R$ 69/mês (Clicksign Start; ZapSign Equipe R$ 69,90; D4Sign Prof. R$ 79,90) [R2] | 5 | 2 | 2 | 3 | 5 | 60 | P3 | V3 (Média · parc. R2) |
| 255 | CTB-045 | Contábil / Encerramento anual | Elaborar notas explicativas e demonstrações complementares | Anual | Próprio* | — | próprio | — | — | 3 | 2 | 2 | 5 | 5 | 60 | P3 | sem V |
| 256 | CTB-048 | Contábil / Imobilizado | Fazer o inventário físico do imobilizado e o teste de recuperabilidade | Anual ou por evento | Próprio* | — | próprio | — | — | 3 | 2 | 2 | 5 | 5 | 60 | P3 | sem V |
| 257 | DP-025 | Trabalhista e DP / Férias | Organizar férias coletivas | Anual (geralmente nov–dez); por e… | Próprio* | — | próprio | — | — | 3 | 2 | 2 | 5 | 5 | 60 | P3 | sem V |
| 258 | DP-036 | Trabalhista e DP / Convenções | Gerir contribuições sindicais e o direito de oposição | Anual (geralmente após a data-bas… | Próprio* | — | próprio | — | — | 3 | 2 | 2 | 5 | 5 | 60 | P3 | sem V |
| 259 | DP-047 | Trabalhista e DP / Afastamentos | Tratar licença-maternidade e licença-paternidade (incluindo a mudança… | Por evento; marco em 01/01/2027 | Próprio* | — | próprio | — | — | 3 | 2 | 2 | 5 | 5 | 60 | P3 | sem V |
| 260 | DP-061 | Trabalhista e DP / Reclamatórias | Atender pedidos de documentos para reclamatória trabalhista | Por evento | Próprio* | — | próprio | — | — | 3 | 2 | 2 | 5 | 5 | 60 | P3 | sem V |
| 261 | FIS-012 | Fiscal / Simples Nacional (transversa… | Calcular o fator R e orientar o pró-labore | Mensal (antes do fechamento da fo… | Próprio | — | — | — | — | 2 | 3 | 2 | 5 | 5 | 60 | P3 | V1 (Alta · conf. R2) |
| 262 | FIS-022 | Fiscal / Declarações federais | Entregar a DIRBI mensal | Mensal, dia 20 do 2º mês seguinte… | D | — | — | — | — | 5 | 3 | 4 | 1 | 5 | 60 | P3 ⚑ | V1 (Baixa · parc. R2) |
| 263 | FIS-035 | Fiscal / Parcelamentos (transversal:… | Acompanhar editais de transação e programas de regularização e aderir | Por evento (vários por ano) | A | D | — | — | — | 3 | 2 | 2 | 5 | 5 | 60 | P3 | V1 (Baixa · R1) |
| 264 | GES-010 | Gestão / Custos do escritório | Repassar ou ratear custos variáveis por cliente (APIs, certificados,… | Mensal | Próprio | — | custos a medir: Integra Contador (V1; revenda Alterdata R$ 0,75/DAS em 2025 [D2:S5]; Alte… | — (V3) | tabelas oficiais Integra e Consulta CNPJ/CPF [R2] | 2 | 3 | 2 | 5 | 5 | 60 | P3 | V3 (Média · parc. R2) |
| 265 | GES-012 | Gestão / Comercial | Controlar indicações e comissões de parceiros | Por evento (cliente fechado); men… | Próprio* | — | próprio | — | — | 2 | 3 | 2 | 5 | 5 | 60 | P3 | sem V |
| 266 | GES-022 | Gestão / Equipe | Treinar a equipe e comprovar capacitação | Por evento (admissão, norma nova) | Próprio* | — | próprio | — | — | 2 | 2 | 3 | 5 | 5 | 60 | P3 | sem V |
| 267 | GES-032 | Atendimento / Canais | Atender mensagens e leads do Instagram e de outras redes | Diária | B | — | V3·I-08; canal do Chatwoot (V3·I-07) | conta profissional + app revisado pela Meta [NÃO VERIF… | [NÃO VERIFICADO] | 2 | 5 | 2 | 3 | 5 | 60 | P3 | V3 (Baixa · parc. R2) |
| 268 | GES-045 | Gestão / Relacionamento | Montar a reunião periódica com o cliente (pauta e relatório de entreg… | Trimestral ou anual; antes do rea… | Próprio* | — | próprio | — | — | 3 | 2 | 2 | 5 | 5 | 60 | P3 | sem V |
| 269 | GES-046 | Gestão / Offboarding | Encerrar o relacionamento: cobrança final, distrato e transição para… | Por evento | Próprio* | — | próprio | — | — | 3 | 2 | 2 | 5 | 5 | 60 | P3 | sem V |
| 270 | NFE-011 | Notas fiscais / Captura | Capturar notas de produtor rural (NFP-e / NF-e de produtor) | Mensal; picos na safra | A | D | — | — | — | 2 | 3 | 2 | 5 | 5 | 60 | P3 | V2 (Média · R1) |
| 271 | NFE-020 | Notas fiscais / Completude | Conferir a completude das saídas (sequência numérica, séries, inutili… | Mensal (antes do fechamento) | A | P | — | A1-cli (app) | — | 2 | 3 | 2 | 5 | 5 | 60 | P3 | V2 (Alta · conf. R2) |
| 272 | NFE-039 | Notas fiscais / Emissão | Emitir notas fiscais pelo cliente (por demanda) | Por evento | A | B | Focus NFe, PlugNotas, NFE.io, eNotas (V3·I-15); NFS-e nacional por API (V1) (V3) | A1-cli (app) | Emissor Nacional grátis; Focus ≥ R$ 94,90/mês, NFE.io ≥ R$ 190/mês [R2] | 3 | 2 | 2 | 5 | 5 | 60 | P3 | V1 (Baixa · parc. R2) |
| 273 | SOC-023 | Clientes / Onboarding | Receber o acervo e a responsabilidade do contador anterior | Por evento | A | A$, D, F | exportação/importação entre cores (V3·I-01, V3·I-02, V3·I-03): formatos de exportação de… | nenhuma de API; arquivos entregues pelo contador anter… | — (V3) | 3 | 2 | 2 | 5 | 5 | 60 | P3 | V1 (Alta · conf. R2) |
| 274 | GES-058 | Gestão / Compliance do escritório | Renovar os certificados digitais do escritório e dos contadores | Anual (A1) ou trienal (A3); alert… | A | D | — | — | — | 3 | 2 | 2 | 5 | 2 | 60 | P3 | V1 (Alta · conf. R2) |
| 275 | SOC-002 | Clientes / Perfil temporal | Manter o perfil temporal do cliente | Por evento (toda alteração contra… | A | A$ | V1·I-04; V1·I-01 (consulta de regime/opção do Simples [CP]) | Nenhuma / I-01 | I-01 por chamada, ver mapa | 3 | 2 | 2 | 5 | 2 | 60 | P1 (hab.) | V1 (Média · parc. R2) |
| 276 | SOC-008 | Clientes / Certificados | Guardar e inventariar certificados digitais (cofre) | Por evento (onboarding, renovação) | Próprio | — | concorrentes: Acessórias AC Certifica [D1:F27], SIEG HüB com A1 por cliente [D1:F35], Omi… | A1-cli (app) obrigatório + e-CNPJ do escritório | KMS/HSM [NÃO VERIFICADO]; revenda de A1 possível (SIEG R$ 49–69) [R2] | 3 | 2 | 2 | 5 | 2 | 60 | P1 (hab.) | V3 (Média · parc. R2) |
| 277 | GES-048 | Timesheet / Captura | Importar tempo e atividades dos sistemas core | Contínua ou diária | B | F; agente de desktop só se o core recusar API | Alterdata ePlugin GET /api/v1/integracao/historico-tarefas (V3·I-02); Domínio Processos e Contmatic: API a negociar (V3·I-01, I-03) | token ePlugin (eContador Master); contrato TR/Contmatic | eContador Master [PREÇO NÃO PÚBLICO]; TR e Contmatic a negociar | 2 | 5 | 2 | 3 | 2 | 60 | P1 (hab.) | V3 (Alta · conf. R2) |
| 278 | NFE-002 | Notas fiscais / Configuração | Pedir ao cliente que inclua o escritório no campo autXML do emissor | Por evento (onboarding, troca de… | B | D | V3·I-05; ERPs/emissores do cliente (V3·I-16) — configuração do autXML em Omie, Bling, Con… | — (V3) | WhatsApp: serviço 1.000 grátis/número/mês, depois R$ 0,035; utilidade R$ 0,035 [R2] | 2 | 3 | 3 | 3 | 5 | 54 | P3 | V3 (Baixa · parc. R2) |
| 279 | CON-003 | Consultoria / Pareceres | Elaborar parecer técnico formal | Por evento; mais frequente em out… | B | P | V3·I-13 (assinatura qualificada do contador, se exigida pelo cliente) | e-CPF do contador para assinatura qualificada | API desde R$ 69/mês (Clicksign Start; ZapSign Equipe R$ 69,90; D4Sign Prof. R$ 79,90) [R2] | 4 | 2 | 2 | 3 | 5 | 48 | P3 | V3 (Baixa · parc. R2) |
| 280 | CON-007 | Consultoria / Comercial | Orçar, contratar e faturar o serviço consultivo extra | Por evento; picos em out–jan e na… | B | P | V3·I-13, V3·I-14 | tokens dos provedores | API desde R$ 69/mês (Clicksign Start; ZapSign Equipe R$ 69,90; D4Sign Prof. R$ 79,90) [R2] | 4 | 2 | 2 | 3 | 5 | 48 | P3 | V3 (Média · parc. R2) |
| 281 | CON-026 | Consultoria / Reforma — créditos de t… | Planejar o saldo credor de ICMS na transição | Anual (acompanhar) + projeto de m… | F | D, P | — | — | — | 3 | 2 | 2 | 4 | 5 | 48 | P3 | V2 (Média · R1) |
| 282 | CON-032 | Consultoria / Reforma — apuração | Conferir a apuração assistida da CBS e o crédito disponível do cliente | Mensal a partir de 2027 | C-cert | D | — | — | — | 4 | 3 | 2 | 2 | 5 | 48 | P3 | V1 (Baixa · R1) |
| 283 | CON-036 | Consultoria / Recuperação de créditos… | Precificar, faturar e controlar o honorário de êxito da recuperação | Por compensação/restituição | B | P | V3·I-14 | token do provedor | Asaas R$ 1,59/Pix ou boleto (R$ 0,79 promocional; conferido em 7/11/2026); Efí boleto R$ 3,45, Pix Automático R$ 3,50 [R2] | 2 | 2 | 4 | 3 | 5 | 48 | P3 | V3 (Média · parc. R2) |
| 284 | CTB-043 | Contábil / ECD | Retificar ou substituir ECD e ECF | Por evento | F | D | — | — | — | 3 | 2 | 2 | 4 | 5 | 48 | P3 | V1 (Baixa · R1) |
| 285 | DP-002 | Trabalhista e DP / Admissão | Coletar e conferir os documentos do empregado | Por evento (cada admissão) | B | P | V3·I-05; Flash faz coleta admissional pela API do WhatsApp [D4:C8] | opt-in do empregado (contato de terceiro, não do clien… | mensagem iniciada pelo escritório ao empregado = model… | 4 | 2 | 2 | 3 | 5 | 48 | P3 | V3 (Média · parc. R2) |
| 286 | FIS-042 | Fiscal / Créditos | Elaborar e acompanhar PER/DCOMP | Por evento + acompanhamento mensal | D | A$ | — | — | — | 4 | 3 | 4 | 1 | 5 | 48 | P3 ⚑ | V1 (Baixa · parc. R2) |
| 287 | SOC-016 | Clientes / Contratos | Formalizar o contrato de prestação de serviços | Por evento | B | — | Clicksign, D4Sign ou ZapSign (V3·I-13), com webhook de assinatura concluída | token-esc + contrato com o provedor; signatário com e-… | API desde R$ 69/mês (Clicksign Start; ZapSign Equipe R$ 69,90; D4Sign Prof. R$ 79,90) [R2] | 4 | 2 | 2 | 3 | 5 | 48 | P3 | V3 (Alta · conf. R2) |
| 288 | SOC-018 | Clientes / Contratos | Reajustar honorários e fazer aditivos | Anual (data-base de cada contrato… | B | P | V3·I-13 (aditivo), V3·I-14 (atualizar assinatura recorrente no provedor), V3·I-05 (comuni… | tokens dos provedores | WhatsApp: serviço 1.000 grátis/número/mês, depois R$ 0,035; utilidade R$ 0,035 [R2] | 4 | 2 | 2 | 3 | 5 | 48 | P3 | V3 (Média · parc. R2) |
| 289 | CON-029 | Consultoria / Reforma — pequenos | Orientar MEI e nanoempreendedores sobre a reforma | Por evento (pergunta, onboarding) | Próprio* | — | próprio | — | — | 2 | 2 | 2 | 5 | 5 | 40 | P3 | sem V |
| 290 | DP-032 | Trabalhista e DP / Rescisão | Comunicar o desligamento a terceiros (consignado, benefícios, plano d… | Por evento | Próprio* | — | próprio | — | — | 2 | 2 | 2 | 5 | 5 | 40 | P3 | sem V |
| 291 | GES-059 | Gestão / Compliance do escritório | Responder a incidentes de segurança e a pedidos de titulares (LGPD) | Por evento | Próprio* | — | próprio | — | — | 2 | 2 | 2 | 5 | 5 | 40 | P3 | sem V |
| 292 | GES-042 | Gestão / Comercial (CRM) | Captar, qualificar e acompanhar leads até a proposta | Por evento | Próprio* | — | próprio | — | — | 2 | 2 | 2 | 5 | 4 | 40 | P3 | sem V |
| 293 | DP-013 | Trabalhista e DP / Fechamento da folh… | Conferir os descontos do Crédito do Trabalhador (consignado) | Mensal; por evento (novo contrato… | D | — | — | — | — | 4 | 3 | 3 | 1 | 5 | 36 | P3 ⚑ | V1 (Alta · conf. R2) |
| 294 | GES-009 | Gestão / Faturamento de honorários | Cobrar o 13º honorário e as cobranças sazonais (IRPF, balanço, RAIS/D… | Anual (novembro/dezembro; março–m… | B | — | V3·I-14 | token | Asaas R$ 1,59/Pix ou boleto (R$ 0,79 promocional; conferido em 7/11/2026); Efí boleto R$ 3,45, Pix Automático R$ 3,50 [R2] | 2 | 2 | 3 | 3 | 5 | 36 | P3 | V3 (Média · parc. R2) |
| 295 | GES-038 | Atendimento / Qualidade | Medir satisfação (NPS/CSAT) e tratar detratores | Por atendimento; semestral | B | — | CSAT nativo do Chatwoot (V3·I-07) [NÃO VERIFICADO]; modelo de utilidade/marketing para NP… | — (V3) | categoria do modelo de pesquisa [NÃO VERIFICADO] | 3 | 2 | 2 | 3 | 5 | 36 | P3 | V3 (Baixa · parc. R2) |
| 296 | SOC-015 | Clientes / Comercial | Elaborar proposta comercial e precificar | Por evento (lead) | B | P | V3·I-13 para o aceite; concorrente Makrosystem (modelos de proposta) [D1:F38] | token do provedor de assinatura | API desde R$ 69/mês (Clicksign Start; ZapSign Equipe R$ 69,90; D4Sign Prof. R$ 79,90) [R2] | 3 | 2 | 2 | 3 | 5 | 36 | P3 | V3 (Média · parc. R2) |
| 297 | SOC-026 | Societário / Abertura | Preparar e registrar o ato constitutivo | Por evento | B | D, P | portais das Juntas (V2·I-20). | certificado ou gov.br dos sócios [NÃO VERIFICADO por J… | taxas da Junta [NÃO VERIFICADO]. | 3 | 2 | 2 | 3 | 5 | 36 | P3 | V2 (Média · R1) |
| 298 | SOC-041 | Societário / Atas | Realizar a reunião anual de aprovação de contas | Anual (jan–abr) | B | D | V3·I-13 | token do provedor; exigência de assinatura qualificada… | API desde R$ 69/mês (Clicksign Start; ZapSign Equipe R$ 69,90; D4Sign Prof. R$ 79,90) [R2] | 3 | 2 | 2 | 3 | 5 | 36 | P3 | V3 (Baixa · parc. R2) |
| 299 | SOC-020 | Clientes / Contratos | Formalizar o tratamento de dados e a carta de responsabilidade | Por evento (contrato) + anual (fe… | B | — | V3·I-13 | token do provedor | API desde R$ 69/mês (Clicksign Start; ZapSign Equipe R$ 69,90; D4Sign Prof. R$ 79,90) [R2] | 3 | 2 | 2 | 3 | 4 | 36 | P3 | V3 (Baixa · parc. R2) |
| 300 | SOC-027 | Societário / Abertura | Obter CNPJ e inscrições | Por evento | B | C-captcha, C-crc, D | InfoSimples junta-comercial/sp/redesim/acp (só viabilidade, só SP) (V2·I-19) | número do protocolo; gov.br. | R$ 0,20 + adicional R$ 0,08 [R2] | 3 | 2 | 2 | 3 | 4 | 36 | P3 | V2 (Média · conf. R2) |
| 301 | CTB-010 | Contábil / Extratos | Conectar e manter o Open Finance do cliente | Na entrada; renovação conforme va… | B | — | Pluggy, Belvo, Celcoin, Klavi, TecnoSpeed (V3·I-10); Questor tem nativo [D5:C2] | consent-cli do representante da PJ | Pluggy ≥ R$ 2.500/mês; Belvo US$ 1.000/mês [R2] | 3 | 2 | 2 | 3 | 2 | 36 | P3 | V3 (Alta · parc. R2) |
| 302 | DP-041 | Trabalhista e DP / Fiscalização | Atender notificação ou fiscalização do trabalho | Por evento | D | — | — | — | — | 4 | 2 | 4 | 1 | 5 | 32 | P3 ⚑ | V1 (Média · R1) |
| 303 | SOC-024 | Clientes / Offboarding | Conduzir o offboarding do cliente | Por evento | D | F, B | V3·I-13 (distrato), exportação do acervo do core (V3·I-01 a V3·I-03) e dos XMLs (NFE-036) | token do provedor de assinatura | API desde R$ 69/mês (Clicksign Start; ZapSign Equipe R$ 69,90; D4Sign Prof. R$ 79,90) [R2] | 4 | 2 | 4 | 1 | 3 | 32 | P3 ⚑ | V1 (Alta · conf. R2) |
| 304 | SOC-011 | Clientes / Procurações | Pedir e acompanhar a autorização de acesso na RFB | Por evento (onboarding, venciment… | D | A$ | V1·I-13, V1·I-01 | Cliente: gov.br prata/ouro ou certificado; escritório:… | Consulta R$ 0,24 (faixa 1) [R2]; validar em até 30 dias | 4 | 2 | 4 | 1 | 3 | 32 | P1 (hab.) ⚑ | V1 (Alta · conf. R2) |
| 305 | CON-019 | Consultoria / Reforma — preço | Revisar a formação de preço do cliente para o novo modelo (tributo "p… | Por projeto; antes de 2027 e em c… | Próprio* | — | próprio | — | — | 3 | 1 | 2 | 5 | 5 | 30 | P3 | sem V |
| 306 | CON-020 | Consultoria / Reforma — cadastro | Revisar o cadastro de produtos e serviços do cliente (NCM, NBS, CST I… | Projeto inicial + por evento (pro… | A | — | — | — | — | 3 | 1 | 2 | 5 | 5 | 30 | P3 | V1 (Baixa · R1) |
| 307 | CON-024 | Consultoria / Reforma — contratos | Revisar contratos e cláusulas de preço do cliente para a reforma | Por projeto; antes de cada degrau… | Próprio* | — | próprio | — | — | 3 | 1 | 2 | 5 | 5 | 30 | P3 | sem V |
| 308 | CTB-032 | Contábil / Declarações do profissional | Emitir DECORE para os sócios | Por evento | C-crc* | — | próprio | — | — | 3 | 2 | 5 | 1 | 5 | 30 | P3 | sem V |
| 309 | SOC-006 | Clientes / Cadastro RFB | Declarar e atualizar o beneficiário final (e-BEF) | Por evento (abertura, alteração d… | D | — | V1·I-25 (sem API conhecida); serviço no Integra Contador [NÃO ENCONTRADO] | Certificado/gov.br do representante ou procurador | — (V1) | 3 | 2 | 5 | 1 | 5 | 30 | P3 | V1 (Baixa · parc. R2) |
| 310 | SOC-036 | Legalização / Licenças | Obter e renovar o alvará de funcionamento | Por evento + anual ou conforme va… | D | — | integradores REDESIM onde o município é conveniado [D1:F51]; sem API. | — (V2) | taxa municipal [NÃO VERIFICADO]. | 3 | 2 | 5 | 1 | 5 | 30 | P3 | V2 (Média · R1) |
| 311 | SOC-037 | Legalização / Licenças | Obter e renovar o AVCB/CLCB dos Bombeiros | Por evento + vencimento | D | B (validade AVCB/CLCB em SP) | V2·I-21 (sem API). | login do responsável no sistema estadual [NÃO VERIFICA… | consulta SP R$ 0,20→0,05 [R2]; taxa estadual [NÃO VERIFICADO] | 3 | 2 | 5 | 1 | 5 | 30 | P3 | V2 (Média · conf. R2) |
| 312 | SOC-038 | Legalização / Licenças | Obter e renovar a licença sanitária | Por evento + vencimento | D | — | V2·I-22. | — | — | 3 | 2 | 5 | 1 | 5 | 30 | P3 | V2 (Média · R1) |
| 313 | SOC-044 | Societário / Capital estrangeiro | Cumprir as obrigações de capital estrangeiro (SCE-IED) | Por evento + anual/quinquenal | D | — | — | — | — | 3 | 2 | 5 | 1 | 5 | 30 | P3 | V1 (Baixa · R1) |
| 314 | CON-035 | Consultoria / Recuperação de créditos | Controlar créditos judiciais: habilitação e limite mensal de compensa… | Mensal durante a compensação | D | P | — | — | — | 2 | 3 | 4 | 1 | 5 | 24 | P3 | V1 (Baixa · R1) |
| 315 | DP-062 | Trabalhista e DP / Doméstico e MEI | Atender empregador doméstico e MEI com empregado | Mensal; por evento | C-crc | C-cert, D | — | — | — | 2 | 3 | 4 | 1 | 5 | 24 | P3 | V1 (Baixa · R1) |
| 316 | FIS-018 | Fiscal / MEI (transversal: D1) | Conduzir opção, desenquadramento e baixa do SIMEI | Anual (janeiro) + por evento | D | P | — | — | — | 3 | 2 | 4 | 1 | 5 | 24 | P3 | V1 (Baixa · R1) |
| 317 | GES-006 | Gestão / Cobrança | Decidir suspensão, protesto ou rescisão por inadimplência, dentro do… | Por evento (atraso > 60–90 dias,… | D* | — | próprio | — | — | 3 | 2 | 4 | 1 | 5 | 24 | P3 | sem V |
| 318 | GES-029 | Atendimento / Modelos | Manter modelos de mensagem aprovados e respostas rápidas | Por evento; revisão trimestral | B | — | gestão de modelos pela API da Meta (criar, consultar status de aprovação e categoria) [NÃ… | Meta Business | utilidade R$ 0,035; marketing R$ 0,3217 [R2] | 2 | 2 | 2 | 3 | 5 | 24 | P3 | V3 (Média · parc. R2) |
| 319 | NFE-013 | Notas fiscais / Captura | Capturar documentos de outros modelos (energia NF3e, telecom NFCom, i… | Mensal | D | — | — | — | — | 2 | 3 | 4 | 1 | 5 | 24 | P3 | V2 (Média · R1) |
| 320 | SOC-040 | Legalização / Licenças | Controlar registros em conselhos e órgãos setoriais | Por evento + anual | D | — | — | — | — | 3 | 2 | 4 | 1 | 5 | 24 | P3 | V1 (Baixa · R1) |
| 321 | NFE-008 | Notas fiscais / Captura de serviços | Capturar NFS-e de municípios fora do ADN, de emissores próprios e de… | Mensal | D | B (nota a nota por agregador) | upload + extração de PDF para os poucos municípios fora do ADN (V2) | login da prefeitura ou certificado (V2) | [PREÇO NÃO PÚBLICO] | 2 | 3 | 4 | 1 | 4 | 24 | P3 | V2 (Média · conf. R2) |
| 322 | CON-017 | Consultoria / Reforma — Simples | Recomendar a opção semestral do Simples pelo regime regular de IBS/CB… | Semestral (janelas) + cancelament… | D | — | — | — | — | 4 | 2 | 3 | 1 | 3 | 24 | P3 ⚑ | V1 (Alta · conf. R2) |
| 323 | SOC-014 | Clientes / Acessos | Orientar a conta gov.br dos sócios | Por evento | D | — | — | — | — | 3 | 2 | 3 | 1 | 5 | 18 | P3 | V1 (Média · R1) |
| 324 | FIS-015 | Fiscal / Simples Nacional · Reforma (… | Decidir e registrar a opção semestral pelo regime regular de IBS/CBS… | Semestral (setembro/outubro e mar… | D | — | — | — | — | 4 | 2 | 2 | 1 | 5 | 16 | P3 ⚑ | V1 (Alta · conf. R2) |
| 325 | GES-060 | Gestão / Compliance do escritório | Manter o seguro de responsabilidade civil profissional | Anual; por evento (ocorrência, GE… | D* | — | próprio | — | — | 2 | 2 | 4 | 1 | 5 | 16 | P3 | sem V |
| 326 | SOC-029 | Societário / Alteração | Fazer alterações contratuais e cadastrais | Por evento | D | P | V2·I-19, V2·I-20. | idem SOC-026. | taxas [NÃO VERIFICADO]. | 4 | 2 | 2 | 1 | 5 | 16 | P3 ⚑ | V2 (Média · R1) |
| 327 | SOC-031 | Societário / Baixa | Encerrar a empresa (baixa) | Por evento | D | A$, C-cert | V2·I-07 a V2·I-11, V2·I-19. | A1-cli (app) · certificado do cliente. | — (V2) | 4 | 2 | 2 | 1 | 5 | 16 | P3 ⚑ | V2 (Média · parc. R2) |
| 328 | SOC-039 | Legalização / Licenças | Obter e renovar a licença ambiental | Por evento + vencimento | D | — | — | — | — | 2 | 2 | 4 | 1 | 5 | 16 | P3 | V2 (Média · R1) |
| 329 | SOC-013 | Clientes / Procurações | Controlar procurações em outros órgãos | Por evento + vencimento | D | A$ (RFB, I-13) | nenhuma. (V2) | varia por órgão. (V2) | Integra (oficial): Consulta R$ 0,24→0,06 · Emissão R$ 0,32→0,08 · Declaração R$ 0,40→0,12 [R2] | 3 | 2 | 2 | 1 | 5 | 12 | P3 | V2 (Alta · conf. R2) |
| 330 | CON-009 | Consultoria / Planejamento tributário | Executar e comprovar a opção de regime | Anual (janeiro/primeiro DARF; jan… | D | — | — | — | — | 3 | 2 | 2 | 1 | 5 | 12 | P3 | V1 (Média · parc. R2) |
| 331 | CON-027 | Consultoria / Reforma — transição 202… | Planejar a transição ICMS/ISS → IBS e a perda gradual de benefícios f… | Anual (a partir de 2027) | D | P | — | — | — | 3 | 2 | 2 | 1 | 5 | 12 | P3 | V2 (Média · R1) |
| 332 | CON-034 | Consultoria / Recuperação de créditos | Executar o projeto de recuperação: memória de cálculo, dossiê, retifi… | Por projeto | D | — | — | — | — | 3 | 1 | 4 | 1 | 5 | 12 | P3 | V1 (Baixa · parc. R2) |
| 333 | CTB-044 | Contábil / Encerramento anual | Publicar demonstrações de S/A e arquivar quando exigido | Anual | D | — | — | — | — | 3 | 2 | 2 | 1 | 5 | 12 | P3 | V2 (Média · R1) |
| 334 | CTB-049 | Contábil / Conformidade do profission… | Enviar a Declaração de Não Ocorrência ao COAF e avaliar operações sus… | Anual (1º a 31 de janeiro); por e… | D | — | — | — | — | 3 | 2 | 2 | 1 | 5 | 12 | P3 | V1 (Baixa · R1) |
| 335 | DP-031 | Trabalhista e DP / Rescisão | Fazer o requerimento do seguro-desemprego | Por evento (dispensa sem justa ca… | D | — | — | — | — | 2 | 2 | 3 | 1 | 5 | 12 | P3 | V1 (Baixa · R1) |
| 336 | FIS-014 | Fiscal / Simples Nacional (transversa… | Conduzir a opção, o cancelamento e as pendências de entrada no Simples | Anual (2º semestre) + por evento… | D | — | — | — | — | 3 | 2 | 2 | 1 | 5 | 12 | P3 | V1 (Média · parc. R2) |
| 337 | FIS-043 | Fiscal / Créditos (transversal: D6) | Levantar ressarcimento de ICMS-ST e créditos estaduais | Por projeto | D | P | — | — | — | 3 | 1 | 4 | 1 | 5 | 12 | P3 | V2 (Média · R1) |
| 338 | GES-037 | Atendimento / Canal | Migrar o atendimento dos celulares pessoais e de grupos para o canal… | Uma vez (implantação); por evento… | D | B | V3·I-05; suporte a grupos na API [NÃO VERIFICADO] | — (V3) | Groups API: só OBA, até 8 participantes [R2] | 3 | 2 | 2 | 1 | 5 | 12 | P3 | V3 (Alta · conf. R2) |
| 339 | GES-057 | Gestão / Compliance do escritório | Manter o registro do escritório e dos profissionais no CRC em dia | Anual (anuidade); por evento (alt… | D* | — | próprio | — | — | 3 | 2 | 2 | 1 | 5 | 12 | P3 | sem V |
| 340 | SOC-005 | Clientes / Inscrições | Controlar inscrições estaduais, municipais e o contador responsável | Por evento (onboarding, offboardi… | C-crc | A$ (PNRCONTADOR, V1), A, C-captcha, D | REDESIM/CADESP (SP); portais das demais Sefaz [NÃO ENCONTRADO procedimento]. | login gov.br/REDESIM do contador (SP); demais UFs [NÃO… | PNRCONTADOR: Consulta R$ 0,24 [R2]; portais grátis | 3 | 2 | 2 | 1 | 5 | 12 | P3 | V2 (Alta · conf. R2) |
| 341 | SOC-025 | Societário / Abertura | Fazer a consulta de viabilidade e a pré-análise da atividade | Por evento | D | B (viabilidade SP), P | VRE [D1:F49]; integrador JUCEMG [D1:F50]; PR, SC, RS [NÃO VERIFICADO]. | gov.br do solicitante [NÃO VERIFICADO]. | gratuito (viabilidade) [NÃO VERIFICADO]. | 3 | 2 | 2 | 1 | 5 | 12 | P3 | V2 (Média · conf. R2) |
| 342 | SOC-028 | Societário / Abertura | Fazer a opção pelo Simples Nacional e o enquadramento na abertura | Por evento | D | — | — | — | — | 3 | 2 | 2 | 1 | 5 | 12 | P3 | V1 (Média · parc. R2) |
| 343 | SOC-042 | Societário / Livros | Autenticar livros digitais na Junta | Anual ou por evento | D | F, P | sistema de autenticação de livros de cada Junta [NÃO ENCONTRADO API]. | certificado do contador e/ou do administrador [NÃO VER… | taxa por livro [NÃO VERIFICADO]. | 3 | 2 | 2 | 1 | 5 | 12 | P3 | V2 (Média · R1) |
| 344 | GES-054 | Timesheet / LGPD | Documentar a base legal, a transparência e o relatório de impacto do… | Na implantação; revisão anual; po… | D* | — | próprio | — | — | 2 | 2 | 2 | 1 | 5 | 8 | P3 | sem V |
| 345 | SOC-045 | Societário / Atas | Publicar atos de sociedades anônimas | Anual + por evento | D* | — | próprio | — | — | 2 | 2 | 2 | 1 | 5 | 8 | P3 | sem V |
| 346 | CON-006 | Consultoria / Pareceres | Formular e acompanhar consulta formal ao Fisco | Rara, por evento | D | A$, P | — | — | — | 3 | 1 | 2 | 1 | 5 | 6 | P3 | V1 (Baixa · parc. R2) |
| 347 | SOC-033 | Societário / Alteração | Abrir filial ou transferir sede entre UFs | Por evento (raro, crítico) | D | — | duas Juntas, duas Sefaz. | — (V2) | — (V2) | 3 | 1 | 2 | 1 | 5 | 6 | P3 | V2 (Média · R1) |

Duas fichas (CON-013 e DP-054) passaram pelo V1 sem receber nível de automação e também ficaram com nível provisório.

---

## 3. Atividades transversais (fundidas numa ferramenta só)

As fichas abaixo descrevem a mesma ação em abas diferentes. Cada grupo vira **uma ferramenta** (ou uma família pequena) na camada de ferramentas, com o parâmetro que muda entre abas (setor, tipo de documento, órgão). O nome canônico é o que aparece no catálogo da seção 4.

| # | Ação única | Fichas fundidas | Ferramenta canônica | Observação de desenho |
| --- | --- | --- | --- | --- |
| T1 | Enviar guia, holerite ou documento ao cliente e registrar a entrega | FIS-010, FIS-016, FIS-025, FIS-031, FIS-033, DP-019, DP-020, NFE-026, GES-039 | `enviar_guia(cliente, guia, canal)` + `publicar_documento(...)` | Um só protocolo de entrega (data, canal, leitura). Canal: WhatsApp oficial, e-mail ou portal |
| T2 | Confirmar o pagamento das guias e cobrar o que ficou aberto | FIS-032, DP-021 | `verificar_pagamento_guia(cliente, competencia)` | Federal pelo Integra Contador (A$); demais por comprovante ou Open Finance |
| T3 | Pedir e cobrar documentos do cliente (régua única) | CTB-002, CTB-003, CTB-006, NFE-002, NFE-038, DP-002, DP-009, FIS-038, SOC-021 | `pedir_documento(cliente, tipo, prazo)` com régua | V3 §4.5 já recomenda uma régua só para documentos, extratos e variáveis |
| T4 | Receber documento solto (WhatsApp, e-mail, portal), identificar cliente e arquivar | NFE-012, CTB-004, GES-026, GES-040, DP-060 | `classificar_documento(arquivo)` + `arquivar_documento(...)` | Liga a mensagem à tarefa e à competência |
| T5 | Ler caixas postais e domicílios eletrônicos sem dar ciência indevida | FIS-005, FIS-008, FIS-026, FIS-029, DP-040, SOC-007, FIS-038 | `consultar_caixa_postal(cliente, orgao)` | Mesma regra para todos: listar sem abrir; abrir só com aprovação. **R2:** ler o detalhe da caixa postal federal dá ciência (V1 I-01); nos DTEs estaduais a ciência ocorre na consulta do teor (V2 I-23). Federal pelo Integra (A$); SP, MG, PR, SC e DEC paulistano por agregador (B) com o A1 do cliente; RS C-crc; DET D |
| T6 | Controlar procurações e autorizações de acesso | SOC-011, SOC-012, SOC-013, SOC-014, FIS-007, DP-042 | `consultar_procuracoes(cliente)` | Uma matriz por órgão (RFB, eSocial, FGTS/SPE, DET, Sefaz, prefeitura) com escopo e validade |
| T7 | Cofre e validade de certificados digitais | SOC-008, SOC-009, SOC-010, FIS-046, NFE-003, GES-058 | `listar_certificados_vencendo(dias)` + registro de uso + `receber_certificado(cliente, arquivo)` no app | **Decisão 1:** o A1 do cliente é documento obrigatório enviado por ele no app, no primeiro dia (NSU sem retroativo); exigido pelo ADN, pela distribuição de DF-e, pelo SAE-NFC-e e pelos DTEs por agregador |
| T8 | Vigiar situação cadastral (CNPJ, IE, IM) de clientes e emitentes | SOC-003, FIS-030, NFE-028, CON-018 | `consultar_situacao_cadastral(cliente)` | Dados abertos + Consulta CNPJ; IE pelo webservice de cadastro da Sefaz |
| T9 | Calendário de obrigações e prazos | FIS-001, FIS-002, FIS-024, SOC-046, DP-037, CTB-040, GES-057, GES-061 | `gerar_calendario(cliente, competencia)` | Derivado da base legal temporal; o escritório entra como "cliente zero" |
| T10 | Comprovar entrega e guardar recibo | FIS-003, FIS-023, DP-006, DP-039, CTB-041, CTB-042, SOC-006 | `anexar_recibo(tarefa, arquivo)` | Recibo oficial pelo Integra/eSocial quando há; senão, importado do core (F) |
| T11 | Responder perguntas do cliente (status, fiscal, trabalhista, contábil) | FIS-044, DP-058, CTB-029, CON-001, CON-002, CON-029, GES-025, GES-028, NFE-037 | chat único com roteador: `responder_status`, `consultar_legislacao`, `rascunhar_resposta_tecnica` | É o ponto de encontro dos motores: status é M2 (dado do cliente), pergunta legal é M1, conta é M3, ação é M4; muitas perguntas usam dois ou mais |
| T12 | Vigia da lei e de notas técnicas, com clientes afetados | FIS-002, DP-014, DP-043, NFE-040, CON-005, CON-013, CON-028, CON-038 | `detectar_normas_novas()` + `clientes_afetados(norma)` | Alimenta calendário, tabelas do M3 e revisão de pareceres |
| T13 | Colher assinatura eletrônica | SOC-016, SOC-020, SOC-026, SOC-041, DP-005, DP-030, CTB-037, CTB-039, CON-003, CON-007, GES-005 | `enviar_para_assinatura(documento, signatarios)` | Abstração sobre um fornecedor B (V3 I-13); atos de Junta podem exigir ICP |
| T14 | Exportar para o core e tratar erro de importação | NFE-033, NFE-034, CTB-017, DP-011, DP-035, SOC-001 | `exportar_para_core(cliente, competencia, core)` | **R2:** B no Domínio (API de entrada para ERP homologado: XML, pagamentos/recebimentos, Rubricas) e na Alterdata (ePlugin: movimentos, lançamentos, admissão); F na Contmatic até haver acesso |
| T15 | Simular regime, pró-labore, fator R e distribuição | FIS-012, FIS-014, DP-015, SOC-028, CON-008, CON-012, CTB-033, CTB-034, CTB-035 | `simular_regimes(...)`, `simular_prolabore_fator_r(...)`, `simular_prolabore_lucros(...)` | Mesmo motor M3 com regra versionada (Lei 15.270, LC 224) |
| T16 | Encontrar e recuperar créditos (monofásico, ST, PIS/Cofins) | FIS-041, FIS-043, NFE-024, CON-025, CON-033, CON-034 | `varrer_oportunidades_credito(carteira)` | Prazo duro: créditos de PIS/Cofins registrados até 31/12/2026 (D6 achado 5) |
| T17 | Conferir IBS/CBS nas notas e no cadastro | FIS-045, NFE-030, NFE-031, CON-020, CON-031 | `validar_ibs_cbs(chave)` | Sem trava de rejeição em 2026, o escritório é quem audita (D3 achado 5) |
| T18 | Comunicação em massa segmentada | GES-030, GES-044, CON-030, DP-025, DP-047, DP-050, DP-053 | `segmentar_clientes(criterio)` + `enviar_mensagem` em lote | Custo de modelo do WhatsApp por mensagem; novidade legal tende a ser "marketing" (D7 achado 1) |
| T19 | Entrada e saída do cliente | SOC-021, SOC-022, SOC-023, SOC-024, GES-046, GES-006, CTB-050, NFE-036 | `iniciar_onboarding(...)`, `iniciar_offboarding(...)` | Offboarding revoga procurações, desvincula contabilista (C-crc em SP) e entrega acervo |
| T20 | Faturar extras e honorário de êxito | SOC-017, GES-002, GES-009, CON-007, CON-036 | `listar_extras(cliente, periodo)` | Tempo do timesheet vira item cobrável |
| T21 | Reajustar honorários | SOC-018, GES-014, GES-015 | `calcular_reajuste(...)` + `rascunhar_carta_reajuste(...)` | Índice pelo SGS do BCB (A) |
| T22 | PLD e COAF | SOC-019, CTB-049 | `avaliar_risco_pld(cliente)` | Envio da declaração é C-crc/D (login do contador no sistema do CFC) |
| T23 | Lucros por sócio, retenção de 10% e estoque até 2025 | CTB-033, CTB-034, CTB-035, CTB-036, CON-012, SOC-043, DP-015 | `controlar_retiradas_socio(...)`, `limite_lucro_distribuivel(...)` | Rotina mensal nova (D5 achado 3) |
| T24 | DCTFWeb e DARF (fiscal e DP) | FIS-019, DP-017 | `emitir_darf_dctfweb(cliente, competencia)` | Integra Contador (A$) |
| T25 | Painel de fechamento por setor | FIS-047, CTB-026, DP-016 | `painel_fechamento(setor, competencia)` | Lê eventos da própria plataforma e o status das tarefas dos módulos de processos dos cores (`importar_atividades_core`, decisão 2) |

**Leitura:** as 25 famílias cobrem 145 fichas. Construídas uma vez, liberam a maior parte do P1 de várias abas ao mesmo tempo; por isso T1, T3, T5, T6, T7, T9 e T11 devem nascer na fase 0b/1 do Plano, antes dos módulos específicos.

---

## 4. Catálogo de ferramentas agênticas

As fichas citam **601 nomes de função**. Depois de fundir sinônimos óbvios (coluna "aliases fundidos"), sobram **563 ferramentas**; 35 delas aparecem em mais de uma aba. Por permissão: **ler 248 · rascunhar 163 · executar 152**.

Como as colunas foram preenchidas (regra explícita, para revisão no desenho da camada de ferramentas):

- **Motor:** M1 (lei) quando a função explica, cita ou busca norma, regra ou cláusula; M3 (cálculo) quando calcula, simula, projeta ou soma; M4 (ação) quando a permissão é executar; M2 (dados do escritório) nos demais casos. Várias funções combinam motores (ex.: `clientes_afetados` = M1 + M2).
- **Permissão:** pelo verbo. **ler** = consulta sem efeito colateral; **rascunhar** = produz rascunho, cálculo ou proposta que alguém aprova; **executar** = muda estado interno ou externo (envia, transmite, registra, emite). Toda execução passa por cartão de aprovação no chat; nível C-crc nunca executa sem o dono do login.
- **Integração:** inferida do objeto da função e da verificação das fichas onde aparece; "Próprio" = só dados da plataforma.
- Assinaturas são as propostas pelas fichas D, sem padronização de nomes de parâmetro; padronizar na fase 0b.
- **Rodada 2:** quatro linhas mudaram de integração (`consultar_caixa_postal`, `exportar_para_core`, `importar_atividades_core`, `intervalos_desktop`). Ferramentas novas que as decisões do fundador pedem, ainda fora da contagem acima: `receber_certificado(cliente, arquivo)` (app; valida titular, CNPJ raiz e validade e guarda no cofre; executar), `registrar_aceite_uso_certificado(cliente, fornecedor)` (app; executar), `verificar_autxml(cliente)` (confere se as notas de saída trazem o CNPJ do escritório; ler), `listar_tarefas_core(core, periodo)` (ePlugin e APIs negociadas; ler) e `validar_autorizacao_acesso(cliente)` (lembrete do aceite em 30 dias + conferência pelo Integra-Procurações; rascunhar).


| ferramenta (assinatura) | aliases fundidos | motor | permissão | integração | abas | fichas |
| --- | --- | --- | --- | --- | --- | --- |
| `abrir_admissao(cliente, dados)` | — | M4 | executar | Próprio | DP | DP-001 |
| `abrir_competencia(cliente, mes)` | — | M4 | executar | Próprio | Contábil | CTB-002 |
| `abrir_desligamento(empregado, data, tipo)` | — | M4 | executar | Próprio | DP | DP-026 |
| `abrir_fluxo_desenquadramento_mei(cliente, motivo)` | — | M4 | executar | Próprio | Fiscal | FIS-018 |
| `abrir_fluxo_exclusao(cliente)` | — | M4 | executar | Próprio | Fiscal | FIS-008 |
| `abrir_fluxo_intimacao(cliente, mensagem)` | — | M4 | executar | Próprio | Fiscal | FIS-038 |
| `abrir_processo_societario('alteracao', cliente_id, campos)` | — | M4 | executar | Próprio | Clientes/Societário | SOC-025, SOC-029, SOC-031, SOC-033 |
| `abrir_projeto(cliente, tipo, horas_orcadas)` | — | M4 | executar | Próprio | Consultoria | CON-014, CON-037 |
| `abrir_solicitacao(cliente, tipo, dados)` | — | M4 | executar | Próprio | Gestão/Atend. | GES-040 |
| `abrir_tarefa(...)` | `abrir_tarefa_regularizacao`, `abrir_tarefas_retificacao`, `criar_tarefas_lote` | M4 | executar | Próprio | Clientes/Societário, Consultoria, DP, Fiscal | CON-005, CON-034, DP-006, DP-008, DP-031, FIS-001, FIS-005, FIS-006, SOC-003, SOC-005, SOC-006, SOC-011, SOC-019, SOC-045 |
| `acompanhar_processo(numero)` | — | M2 | ler | Próprio | Consultoria | CON-006 |
| `agenda_sst(cliente)` | — | M2 | ler | Google/Microsoft Calendar (A) | DP | DP-049 |
| `agendar_lembrete(cliente, data)` | — | M4 | executar | Google/Microsoft Calendar (A) | Notas | NFE-038 |
| `alertar_limite_simples(cliente)` | — | M4 | executar | Próprio | Fiscal | FIS-011 |
| `alertar_vencimento_procuracao(cliente)` | — | M4 | executar | Próprio | Fiscal | FIS-007 |
| `alertas_balancete(cliente, mes)` | — | M2 | ler | Próprio | Contábil | CTB-021 |
| `alertas_operacoes_atipicas(carteira, periodo)` | — | M2 | ler | Próprio | Contábil | CTB-049 |
| `amostra_respostas_ia(periodo, n)` | — | M2 | rascunhar | Próprio | Gestão/Atend. | GES-062 |
| `analisar_razao(cliente, conta, periodo)` | — | M2 | ler | Próprio | Contábil | CTB-018 |
| `anexar_recibo(tarefa, arquivo)` | — | M4 | executar | Próprio | Clientes/Societário, Fiscal | FIS-003, SOC-006 |
| `aplicar_criterio_campanha(campanha, clientes)` | — | M2 | rascunhar | Próprio | Fiscal | FIS-039 |
| `aprovar_classificacoes(lote_id)` | — | M4 | executar | Próprio | Contábil | CTB-015 |
| `aprovar_tabela(versao)` | — | M4 | executar | Próprio | Consultoria | CON-028 |
| `apurar_iss(cliente, competencia)` | — | M3 | ler | Prefeituras (C-cert/B) | Fiscal | FIS-028 |
| `apurar_jornada(cliente, competencia)` | — | M3 | ler | Próprio | DP | DP-010 |
| `arquivar_documento(cliente, mes, tipo, arquivo)` | `anexar_documento`, `arquivar_anexo` | M4 | executar | Próprio | Consultoria, Contábil, Gestão/Atend., Notas | CON-003, CTB-004, GES-026, NFE-012 |
| `associar_guia(cliente, tarefa)` | — | M4 | executar | Próprio | Fiscal | FIS-031 |
| `atender_lista_pedidos(cliente, arquivo)` | — | M2 | ler | Próprio | Contábil | CTB-051 |
| `atividades_que_mais_consomem_tempo(periodo)` | — | M2 | ler | Próprio | Gestão/Atend. | GES-016 |
| `atribuir_responsavel(consulta)` | — | M4 | executar | Próprio | Consultoria | CON-001 |
| `atualizar_checklist(cliente, item, acao)` | — | M4 | executar | Próprio | Contábil | CTB-001 |
| `auditar_cadastro(cliente)` | — | M2 | ler | Próprio | Notas | NFE-032 |
| `auditar_notas(cliente, competencia, regras)` | — | M2 | ler | DF-e Sefaz/AN (A) | Notas | NFE-023 |
| `auditar_retencoes_nfse(cliente, competencia)` | — | M2 | ler | NFS-e Nacional/ADN (A) + integrador (B) | Notas | NFE-027 |
| `avaliar_gatilhos_regime(cliente, competencia)` | — | M2 | ler | Próprio | Consultoria | CON-010 |
| `avaliar_risco_pld(cliente_id)` | — | M2 | ler | Próprio | Clientes/Societário | SOC-019 |
| `avancar_lead(lead, etapa)` | — | M4 | executar | Próprio | Gestão/Atend. | GES-042 |
| `avisar_feriado(carteira, data)` | — | M2 | ler | Próprio | DP | DP-037 |
| `baixar_cobranca(cobranca_id, pagamento_id)` | — | M4 | executar | Asaas/banco (B) | Gestão/Atend. | GES-003 |
| `baixar_eventos_esocial(cliente, periodo)` | — | M4 | executar | eSocial / EFD-Reinf (A) | DP | DP-039 |
| `baixar_nfce(chave)` | — | M4 | executar | DF-e Sefaz/AN (A) | Notas | NFE-009 |
| `baixar_tarefa_por_evidencia(tarefa)` | — | M4 | executar | Próprio | Fiscal | FIS-003 |
| `buscar_cct_nova(sindicato)` | — | M2 | ler | Próprio | DP | DP-034 |
| `buscar_clausula_cct(cliente, tema)` | — | M1 | ler | Próprio | DP | DP-058 |
| `buscar_cte(cliente, periodo, papel)` | — | M2 | ler | DF-e Sefaz/AN (A) | Notas | NFE-006 |
| `buscar_documento(cliente_id, tipo, vigente=True)` | `buscar_documentos` | M2 | ler | Próprio | Clientes/Societário, Notas | NFE-013, SOC-034 |
| `buscar_documento_cliente(cliente, tipo, competencia)` | — | M2 | ler | Próprio | Gestão/Atend. | GES-025 |
| `buscar_entendimento(tema)` | — | M1 | ler | Base legal (M1) / fontes normativas (A) | Consultoria | CON-004 |
| `buscar_nfse(cliente, periodo, papel)` | — | M2 | ler | NFS-e Nacional/ADN (A) + integrador (B) | Notas | NFE-007 |
| `buscar_notas(cliente, periodo, tipo, emitente)` | — | M2 | ler | DF-e Sefaz/AN (A) | Notas | NFE-004 |
| `buscar_procedimento(texto)` | — | M2 | ler | Próprio | Gestão/Atend. | GES-020 |
| `buscar_solucoes_consulta(tema)` | — | M1 | ler | Base legal (M1) / fontes normativas (A) | Consultoria | CON-006 |
| `cadastrar_contrato_financeiro(cliente, arquivo)` | — | M2 | ler | Próprio | Contábil | CTB-014 |
| `cadastro_observado(cliente, periodo)` | — | M2 | ler | Próprio | Notas | NFE-032 |
| `calcular_acerto_final(cliente, data_saida)` | — | M3 | rascunhar | Próprio | Gestão/Atend. | GES-046 |
| `calcular_acrescimo_lc224(cliente, trimestre)` | — | M3 | rascunhar | Próprio | Consultoria | CON-011 |
| `calcular_beneficiarios_finais(cliente_id, data)` | — | M3 | rascunhar | Próprio | Clientes/Societário | SOC-006 |
| `calcular_beneficios_mes(cliente, competencia)` | — | M3 | rascunhar | Próprio | DP | DP-051 |
| `calcular_cotas(cliente)` | — | M3 | rascunhar | Próprio | DP | DP-056 |
| `calcular_credito(cliente, tese, periodo)` | — | M3 | rascunhar | Próprio | Consultoria | CON-034 |
| `calcular_difal_antecipacao(cliente, xml)` | — | M3 | rascunhar | Portais Sefaz (C-cert/C-crc) | Fiscal, Notas | FIS-025, NFE-026 |
| `calcular_exito(cliente, projeto)` | — | M3 | rascunhar | Próprio | Consultoria | CON-036 |
| `calcular_exposicao_reforma(cliente)` | — | M3 | rascunhar | Calculadora de Tributos RFB (A, indício) + M3 | Consultoria | CON-015 |
| `calcular_fator_r(cliente, competencia)` | — | M3 | rascunhar | Próprio | Fiscal | FIS-012 |
| `calcular_impacto_contrato(contrato, anos)` | — | M3 | rascunhar | Próprio | Consultoria | CON-024 |
| `calcular_licenca(empregado, tipo, data_evento)` | — | M3 | rascunhar | Próprio | DP | DP-047 |
| `calcular_prazo_ciencia(data_registro, tipo_dte)` | — | M3 | rascunhar | Próprio | Fiscal | FIS-005 |
| `calcular_rbt12(cliente, data)` | — | M3 | rascunhar | Próprio | Fiscal | FIS-011 |
| `calcular_reajuste(cliente, indice)` | — | M3 | rascunhar | BCB SGS (A) | Clientes/Societário, Gestão/Atend. | GES-014, SOC-018 |
| `calcular_reajuste_cct(cliente, instrumento)` | — | M3 | rascunhar | BCB SGS (A) | DP | DP-035 |
| `calcular_retencoes_honorario(cliente, valor)` | — | M3 | rascunhar | Próprio | Gestão/Atend. | GES-008 |
| `calendario_legalizacao(cliente_id/carteira, periodo)` | — | M2 | ler | Próprio | Clientes/Societário | SOC-046 |
| `campanha_13(carteira, ano)` | — | M4 | executar | Próprio | DP | DP-053 |
| `campanha_ferias_coletivas(carteira, ano)` | — | M4 | executar | Próprio | DP | DP-025 |
| `campanha_regulatoria(norma, filtro_clientes)` | — | M4 | executar | Próprio | DP | DP-050 |
| `cancelar_nfse(nfse_id, motivo)` | — | M4 | executar | NFS-e Nacional/ADN (A) + integrador (B) | Gestão/Atend. | GES-007 |
| `checar_estabilidade(empregado)` | — | M2 | ler | Próprio | DP | DP-026 |
| `checar_impeditivos_opcao(cliente)` | — | M1 | ler | Próprio | Fiscal | FIS-014 |
| `checar_pre_requisitos_transmissao(competencia)` | — | M2 | ler | Próprio | Fiscal | FIS-046 |
| `checklist_conformidade_ponto(cliente)` | — | M2 | rascunhar | Próprio | DP | DP-045 |
| `checklist_desligamento(empregado)` | — | M2 | rascunhar | Próprio | DP | DP-032 |
| `checklist_fechamento(cliente, mes)` | — | M2 | rascunhar | Próprio | Contábil | CTB-024 |
| `checklist_processo_trabalhista(cliente, processo)` | — | M2 | rascunhar | Próprio | DP | DP-044 |
| `checklist_publicacao(cliente, exercicio)` | — | M2 | rascunhar | Próprio | Contábil | CTB-044 |
| `checklist_retificacao_sped(cliente, escrituracao)` | — | M2 | rascunhar | Próprio | Contábil | CTB-043 |
| `classificar_documento(arquivo)` | — | M2 | rascunhar | Próprio | Contábil, DP, Gestão/Atend. | CTB-004, DP-060, GES-026 |
| `classificar_escopo(cliente, tema)` | — | M2 | rascunhar | Próprio | Consultoria | CON-001 |
| `classificar_intervalo(intervalo, cliente, atividade)` | — | M2 | rascunhar | Próprio | Gestão/Atend. | GES-051 |
| `classificar_itens_reforma(cliente, itens)` | — | M1 | rascunhar | Próprio | Consultoria | CON-020 |
| `classificar_risco_atividade(cnaes, municipio)` | — | M2 | rascunhar | Próprio | Clientes/Societário | SOC-025 |
| `clientes_acima_da_faixa(competencia)` | — | M2 | ler | Próprio | Gestão/Atend. | GES-015 |
| `clientes_afetados(norma)` | `listar_clientes_afetados` | M1 | ler | Próprio | Consultoria, DP, Notas | CON-005, CON-013, DP-043, NFE-031, NFE-040 |
| `clientes_em_risco()` | — | M2 | ler | Próprio | Gestão/Atend. | GES-043 |
| `clientes_obrigados_transparencia(ano)` | — | M2 | ler | Próprio | DP | DP-055 |
| `clientes_por_cct(instrumento)` | — | M2 | ler | Próprio | DP | DP-034 |
| `cobrar_fornecedor_sst(cliente, item)` | — | M4 | executar | WhatsApp Cloud API (B) / e-mail | DP | DP-049 |
| `cobrar_variaveis(cliente)` | — | M4 | executar | WhatsApp Cloud API (B) / e-mail | DP | DP-009 |
| `comissoes_devidas(periodo)` | — | M2 | ler | Próprio | Gestão/Atend. | GES-012 |
| `comparar_cct(anterior, nova)` | — | M1 | ler | Próprio | DP | DP-034 |
| `comparar_com_mes_anterior(cliente, obrigacao)` | — | M2 | ler | Próprio | Fiscal | FIS-004 |
| `comparar_holerite(empregado, competencia)` | — | M2 | ler | Próprio | DP | DP-014 |
| `comparar_situacao_fiscal(cliente, mes_a, mes_b)` | — | M2 | ler | Integra Contador (A$) | Fiscal | FIS-006 |
| `conciliar_adquirente(cliente, mes, adquirente)` | — | M2 | rascunhar | Open Finance (B) / OFX (F) | Contábil | CTB-013 |
| `conciliar_apuracao_cbs(cliente, competencia)` | — | M2 | rascunhar | Próprio | Consultoria | CON-032 |
| `conciliar_esocial_core(cliente, periodo)` | — | M2 | rascunhar | eSocial / EFD-Reinf (A) | DP | DP-039 |
| `conciliar_faturamento(cliente, competencia)` | — | M2 | rascunhar | Próprio | Notas | NFE-022 |
| `conciliar_recebimentos(periodo)` | — | M2 | rascunhar | Asaas/banco (B) | Gestão/Atend. | GES-003 |
| `conciliar_split(cliente, mes)` | — | M2 | rascunhar | Próprio | Contábil | CTB-023 |
| `conferir_calculo_rfb(item)` | — | M3 | ler | Calculadora de Tributos RFB (A, indício) + M3 | Consultoria | CON-016 |
| `conferir_checklist(admissao_id)` | — | M2 | ler | Próprio | DP | DP-002 |
| `conferir_consignado_folha(cliente, competencia)` | — | M2 | ler | Próprio | DP | DP-013 |
| `conferir_core_x_xml(cliente, competencia, arquivo_core)` | — | M2 | ler | DF-e Sefaz/AN (A) | Notas | NFE-035 |
| `conferir_darf_opcao(cliente)` | — | M2 | ler | Integra Contador (A$) | Consultoria | CON-009 |
| `conferir_dctfweb_folha(cliente, competencia)` | — | M2 | ler | Integra Contador (A$) | DP | DP-017 |
| `conferir_ecd_ecf(cliente, exercicio)` | — | M2 | ler | Próprio | Contábil | CTB-042 |
| `conferir_fatura_beneficio(cliente, arquivo)` | — | M2 | ler | Próprio | DP | DP-052 |
| `conferir_folha_contabil(cliente, mes)` | — | M2 | ler | Próprio | Contábil | CTB-020 |
| `conferir_gfd_folha(cliente, competencia)` | — | M2 | ler | FGTS Digital (D/C-cert) | DP | DP-018 |
| `conferir_impostos(cliente, mes)` | — | M2 | ler | Próprio | Contábil | CTB-019 |
| `conferir_inventario(cliente, arquivo)` | — | M2 | ler | Próprio | Contábil | CTB-046 |
| `conferir_multa_atraso(cliente, notificacao)` | — | M2 | ler | Próprio | Fiscal | FIS-040 |
| `conferir_pgdas(cliente, competencia)` | — | M2 | ler | Integra Contador (A$) | Fiscal | FIS-004 |
| `conferir_retencoes(cliente, competencia)` | — | M2 | ler | Próprio | Fiscal | FIS-020 |
| `conferir_st(cliente, competencia)` | — | M2 | ler | Próprio | Notas | NFE-025 |
| `conferir_vinculos_ano(cliente, ano)` | — | M2 | ler | Próprio | DP | DP-057 |
| `configurar_captura(cliente)` | — | M4 | executar | DF-e Sefaz/AN (A) | Notas | NFE-001, NFE-031 |
| `configurar_categorias_automaticas(regras)` | — | M4 | executar | Próprio | Gestão/Atend. | GES-062 |
| `configurar_horario_atendimento(regras)` | — | M4 | executar | Próprio | Gestão/Atend. | GES-035 |
| `configurar_politica_jornada(regras)` | — | M4 | executar | Próprio | Gestão/Atend. | GES-053 |
| `confirmar_dia(pessoa, dia)` | — | M4 | executar | Próprio | Gestão/Atend. | GES-051 |
| `consultar_andamento(protocolo, orgao)` | — | M2 | ler | Próprio | Clientes/Societário | SOC-027, SOC-030 |
| `consultar_caixa_postal(cliente)` | — | M2 | ler | Integra Contador (A$); agregador para DTE estadual (B) | Fiscal | FIS-005 |
| `consultar_cnpj(cnpj)` | — | M2 | ler | Dados abertos CNPJ (A) / SERPRO Consulta CNPJ (A$) | Clientes/Societário | SOC-001 |
| `consultar_cpf(cpf)` | — | M2 | ler | SERPRO Consulta CPF (A$) | DP | DP-004 |
| `consultar_dctfweb(cliente, competencia)` | — | M2 | ler | Integra Contador (A$) | Fiscal | FIS-019 |
| `consultar_declaracao_pgdas(cliente, competencia)` | — | M2 | ler | Integra Contador (A$) | Fiscal | FIS-009 |
| `consultar_dte_estadual(cliente, uf)` | — | M2 | ler | Portais Sefaz (C-cert/C-crc) | Fiscal | FIS-026 |
| `consultar_dte_municipal(cliente, municipio)` | — | M2 | ler | Prefeituras (C-cert/B) | Fiscal | FIS-029 |
| `consultar_legislacao(pergunta, data, perfil)` | — | M1 | ler | Base legal (M1) / fontes normativas (A) | Consultoria | CON-002, CON-029 |
| `consultar_pendencias_estaduais(cliente, uf)` | — | M2 | ler | Portais Sefaz (C-cert/C-crc) | Fiscal | FIS-027 |
| `consultar_procuracoes(cliente)` | `consultar_autorizacoes`, `matriz_procuracoes`, `status_procuracoes` | M2 | ler | Integra Contador (A$) | Clientes/Societário, DP, Fiscal | DP-042, FIS-007, SOC-011, SOC-013 |
| `consultar_recibo_oficial(cliente, obrigacao, competencia)` | — | M2 | ler | Integra Contador (A$) | Fiscal | FIS-003 |
| `consultar_reinf(cliente, competencia)` | — | M2 | ler | eSocial / EFD-Reinf (A) | Fiscal | FIS-020 |
| `consultar_situacao_cadastral(cliente)` | `comparar_perfil_rfb`, `varrer_cadastros` | M2 | ler | Dados abertos CNPJ (A) / SERPRO Consulta CNPJ (A$) | Clientes/Societário, Fiscal | FIS-030, SOC-003 |
| `consultar_situacao_emitente(cnpj, ie, data)` | — | M2 | ler | DF-e Sefaz/AN (A) | Notas | NFE-028 |
| `consultar_status_perdcomp(numero)` | — | M2 | ler | Próprio | Fiscal | FIS-042 |
| `controlar_prazo_arquivamento(processo_id)` | — | M2 | ler | Próprio | Clientes/Societário | SOC-026 |
| `controlar_retiradas_socio(cliente, mes)` | — | M2 | ler | Próprio | Consultoria | CON-012 |
| `conversas_sem_resposta(horas)` | — | M2 | ler | WhatsApp Cloud API (B) / e-mail | Gestão/Atend. | GES-034 |
| `convidar_open_finance(cliente, banco)` | — | M4 | executar | Open Finance (B) / OFX (F) | Contábil | CTB-010 |
| `criar_cliente(dados)` | — | M4 | executar | Próprio | Clientes/Societário | SOC-001 |
| `criar_lead(contato, origem)` | — | M4 | executar | Próprio | Gestão/Atend. | GES-042 |
| `criar_modelo_mensagem(texto, categoria)` | — | M4 | executar | WhatsApp Cloud API (B) / e-mail | Gestão/Atend. | GES-029 |
| `cronograma_compensacao_judicial(cliente, credito)` | — | M3 | rascunhar | Próprio | Consultoria | CON-035 |
| `cronograma_encerramento(carteira, exercicio)` | — | M2 | rascunhar | Próprio | Contábil | CTB-040 |
| `cronograma_uso_saldo(cliente)` | — | M2 | rascunhar | Próprio | Consultoria | CON-025 |
| `cruzar_pagamentos_notas(cliente, periodo)` | — | M2 | ler | DF-e Sefaz/AN (A) | Notas | NFE-021 |
| `cruzar_reinf_dctfweb(cliente, competencia)` | — | M2 | ler | Integra Contador (A$) | Fiscal | FIS-004 |
| `custo_efetivo_fornecedor(cliente, fornecedor)` | — | M3 | ler | Próprio | Consultoria | CON-018 |
| `custo_variavel_por_cliente(periodo)` | — | M3 | ler | Próprio | Gestão/Atend. | GES-010 |
| `definir_custo_hora(cargo, valor, vigencia)` | — | M2 | ler | Próprio | Gestão/Atend. | GES-055 |
| `depreciacao(cliente, mes)` | — | M3 | rascunhar | Próprio | Contábil | CTB-047 |
| `detectar_alteracao_prazo(norma)` | — | M2 | ler | Próprio | Fiscal | FIS-002 |
| `detectar_contas_nao_cadastradas(cliente, mes)` | — | M2 | ler | Próprio | Contábil | CTB-011 |
| `detectar_normas_novas(periodo)` | — | M1 | ler | Base legal (M1) / fontes normativas (A) | Consultoria | CON-005 |
| `detectar_notas_suspeitas(cliente, periodo)` | — | M2 | ler | DF-e Sefaz/AN (A) | Notas | NFE-016 |
| `detectar_nova_nt(fonte)` | — | M1 | ler | Base legal (M1) / fontes normativas (A) | Notas | NFE-040 |
| `detectar_termo_exclusao(cliente)` | — | M2 | ler | Integra Contador (A$) | Fiscal | FIS-008 |
| `detratores(periodo)` | — | M2 | ler | Próprio | Gestão/Atend. | GES-038 |
| `diagnosticar_captura(cliente)` | — | M2 | ler | DF-e Sefaz/AN (A) | Notas | NFE-001 |
| `diagnosticar_divergencia(cliente, competencia)` | — | M2 | ler | Próprio | DP | DP-038 |
| `diagnosticar_impedimento_cnd(cliente)` | — | M2 | ler | Agregador de certidões (B) / C-captcha | Fiscal | FIS-037 |
| `diagnostico_entrada(cliente_id)` | — | M2 | ler | Próprio | Clientes/Societário | SOC-022, SOC-031 |
| `divergencias_ponto_timesheet(periodo)` | — | M2 | ler | Próprio | Gestão/Atend. | GES-052 |
| `documentos_nao_lidos(vencendo_em)` | — | M2 | ler | Próprio | Gestão/Atend. | GES-039 |
| `dossie_empregado(empregado)` | — | M2 | rascunhar | Próprio | DP | DP-060 |
| `dossie_inadimplencia(cliente)` | — | M2 | rascunhar | Próprio | Gestão/Atend. | GES-006 |
| `economia_ia(periodo)` | — | M3 | ler | Próprio | Gestão/Atend. | GES-056 |
| `efeitos_alteracao(cliente_id, mudanca)` | — | M2 | ler | Próprio | Clientes/Societário | SOC-029 |
| `emitir_ccmei(cliente_id)` | — | M4 | executar | Integra Contador (A$) | Clientes/Societário | SOC-032 |
| `emitir_certidao(cliente, tipo)` | — | M4 | executar | Agregador de certidões (B) / C-captcha | Fiscal | FIS-036 |
| `emitir_darf(cliente, codigo_receita, periodo, valor)` | — | M4 | executar | Integra Contador (A$) | Fiscal | FIS-021 |
| `emitir_darf_dctfweb(cliente, competencia)` | — | M4 | executar | Integra Contador (A$) | DP, Fiscal | DP-017, FIS-019 |
| `emitir_guia_estadual(cliente, uf, tipo, valor)` | — | M4 | executar | Portais Sefaz (C-cert/C-crc) | Fiscal, Notas | FIS-025, NFE-026 |
| `emitir_guia_iss(cliente, municipio)` | — | M4 | executar | Prefeituras (C-cert/B) | Fiscal | FIS-028 |
| `emitir_nfse(rascunho)` | — | M4 | executar | NFS-e Nacional/ADN (A) + integrador (B) | Notas | NFE-039 |
| `emitir_nfse_honorario(cobranca_id)` | — | M4 | executar | NFS-e Nacional/ADN (A) + integrador (B) | Gestão/Atend. | GES-007 |
| `emitir_parcela(cliente, parcelamento, mes)` | — | M4 | executar | Integra Contador (A$) | Fiscal | FIS-034 |
| `emitir_situacao_fiscal(cliente)` | — | M4 | executar | Integra Contador (A$) | Fiscal | FIS-006 |
| `encaminhar_aso(empregado, tipo, clinica)` | — | M4 | executar | Próprio | DP | DP-003 |
| `enviar_carta_responsabilidade(cliente, exercicio)` | — | M4 | executar | WhatsApp Cloud API (B) / e-mail | Contábil | CTB-039 |
| `enviar_cobranca(cobranca_id, canal)` | `cobrar_pagamento`, `emitir_cobranca`, `lancar_cobranca` | M4 | executar | Asaas/banco (B) | Consultoria, DP, Gestão/Atend. | CON-007, CON-036, DP-021, GES-001 |
| `enviar_decisao_cliente(cliente, opcoes)` | — | M4 | executar | WhatsApp Cloud API (B) / e-mail | DP | DP-007 |
| `enviar_documento(cliente, documento, canal)` | — | M4 | executar | WhatsApp Cloud API (B) / e-mail | Clientes/Societário, Gestão/Atend., Notas | GES-025, NFE-037, SOC-034 |
| `enviar_formulario_variaveis(cliente, competencia)` | — | M4 | executar | WhatsApp Cloud API (B) / e-mail | DP | DP-009 |
| `enviar_guia(cliente, guia, canal)` | `enviar_pacote_guias` | M4 | executar | WhatsApp Cloud API (B) / e-mail | DP, Fiscal, Notas | DP-020, FIS-010, FIS-016, FIS-031, NFE-026 |
| `enviar_guia_procuracao(cliente, sistema)` | — | M4 | executar | WhatsApp Cloud API (B) / e-mail | DP | DP-042 |
| `enviar_holerites(cliente, competencia, canal)` | — | M4 | executar | WhatsApp Cloud API (B) / e-mail | DP | DP-019 |
| `enviar_informes(cliente, ano)` | — | M4 | executar | WhatsApp Cloud API (B) / e-mail | DP | DP-054 |
| `enviar_instrucao_procuracao(cliente)` | — | M4 | executar | WhatsApp Cloud API (B) / e-mail | Fiscal | FIS-007 |
| `enviar_kit_certidoes(cliente, destinatario)` | — | M4 | executar | Agregador de certidões (B) / C-captcha | Fiscal | FIS-036 |
| `enviar_lembrete_vencimento(cliente)` | — | M4 | executar | WhatsApp Cloud API (B) / e-mail | Fiscal | FIS-032 |
| `enviar_mensagem(cliente, texto)` | `alertar_cliente`, `enviar_aviso_lote`, `enviar_comunicado`, `enviar_lembrete`, `enviar_lote`, `notificar_cliente` | M4 | executar | WhatsApp Cloud API (B) / e-mail | Clientes/Societário, Consultoria, Gestão/Atend., Notas | CON-002, CON-029, CON-030, GES-030, NFE-002, NFE-010, NFE-016, NFE-031, SOC-007, SOC-009, SOC-027 |
| `enviar_para_assinatura(documentos, signatarios)` | — | M4 | executar | Assinatura eletrônica (B) | Clientes/Societário, Consultoria, DP, Gestão/Atend. | CON-003, CON-007, DP-005, DP-030, GES-005, SOC-016, SOC-020, SOC-026 |
| `enviar_pesquisa(cliente, tipo)` | — | M4 | executar | WhatsApp Cloud API (B) / e-mail | Gestão/Atend. | GES-038 |
| `enviar_relatorio(cliente, relatorio_id)` | — | M4 | executar | WhatsApp Cloud API (B) / e-mail | Contábil | CTB-028 |
| `estimar_honorario(perfil)` | — | M3 | rascunhar | Próprio | Clientes/Societário | SOC-015 |
| `estimar_horas(tipo_servico)` | — | M3 | rascunhar | Próprio | Consultoria | CON-007 |
| `estimar_multa_trabalhista(infracao, empregados)` | — | M3 | rascunhar | Próprio | DP | DP-041 |
| `estimar_restituicao(cliente)` | — | M3 | rascunhar | Próprio | Fiscal | FIS-041 |
| `eventos_pos_importacao(cliente, periodo)` | — | M2 | ler | Leiaute do core (F) | Notas | NFE-018 |
| `excecoes_jornada(periodo)` | — | M2 | ler | Próprio | Gestão/Atend. | GES-053 |
| `executar_regua_cobranca(data)` | — | M4 | executar | Asaas/banco (B) | Gestão/Atend. | GES-004 |
| `exige_homologacao(cliente, empregado)` | — | M1 | ler | Próprio | DP | DP-030 |
| `explicar_cclasstrib(codigo, data)` | — | M1 | ler | Próprio | Notas | NFE-030 |
| `explicar_classificacao(item)` | — | M1 | ler | Próprio | Consultoria | CON-020 |
| `explicar_divergencia(item)` | — | M1 | ler | Próprio | Notas | NFE-023 |
| `explicar_obrigacao(cliente, obrigacao)` | — | M1 | ler | Próprio | Fiscal | FIS-001 |
| `explicar_regra(uf, tema)` | — | M1 | ler | Próprio | Notas | NFE-019 |
| `explicar_rejeicao(codigo, evento)` | — | M1 | ler | Próprio | DP | DP-016 |
| `explicar_resultado(cliente, periodo)` | — | M1 | rascunhar | Próprio | Contábil | CTB-029 |
| `exportar_cadastro_core(cliente_id, sistema)` | `exportar_cadastro` | M4 | executar | Leiaute do core (F) | Clientes/Societário, Consultoria | CON-020, SOC-001 |
| `exportar_dados_titular(pessoa)` | — | M4 | executar | Próprio | Gestão/Atend. | GES-054, GES-059 |
| `exportar_pacote_xml(cliente, periodo, tipos)` | — | M4 | executar | DF-e Sefaz/AN (A) | Notas | NFE-036 |
| `exportar_para_core(cliente, competencia, core)` | — | M4 | executar | API de entrada Domínio / ePlugin Alterdata (B); leiaute (F) na Contmatic | Contábil, Notas | CTB-017, NFE-033 |
| `exportar_reajuste_core(...)` | — | M4 | executar | Leiaute do core (F) | DP | DP-035 |
| `exportar_variaveis_core(cliente, competencia, core)` | — | M4 | executar | Leiaute do core (F) | DP | DP-011 |
| `extrair_chave_imagem(arquivo)` | — | M2 | rascunhar | DF-e Sefaz/AN (A) | Notas | NFE-011, NFE-012 |
| `extrair_clausulas_tributarias(contrato)` | — | M1 | rascunhar | Próprio | Consultoria | CON-024 |
| `extrair_dados_decisao(arquivo)` | — | M2 | rascunhar | Próprio | DP | DP-044 |
| `extrair_dados_documento(arquivo)` | — | M2 | rascunhar | Próprio | DP | DP-002 |
| `extrair_extrato_pdf(arquivo)` | — | M2 | rascunhar | Open Finance (B) / OFX (F) | Contábil | CTB-009 |
| `extrair_nota_pdf(arquivo)` | — | M2 | rascunhar | DF-e Sefaz/AN (A) | Notas | NFE-008 |
| `extrair_variaveis(mensagem_ou_arquivo)` | — | M2 | rascunhar | Próprio | DP | DP-009 |
| `extrato_socio(cpf, ano)` | — | M2 | ler | Open Finance (B) / OFX (F) | Clientes/Societário | SOC-043 |
| `fila_de_automacao()` | — | M2 | ler | Próprio | Gestão/Atend. | GES-056 |
| `folha_domestico(cliente, competencia)` | — | M2 | ler | Próprio | DP | DP-062 |
| `formalizar_acordo(...)` | — | M4 | executar | Asaas/banco (B) | Gestão/Atend. | GES-005 |
| `gerar_boletim_normativo(periodo)` | — | M1 | rascunhar | Próprio | Consultoria | CON-038 |
| `gerar_calendario(cliente, competencia)` | — | M2 | rascunhar | Próprio | Fiscal | FIS-001 |
| `gerar_checklist_documentos(cliente)` | — | M2 | rascunhar | Próprio | Contábil | CTB-001 |
| `gerar_checklist_reforma(cliente)` | — | M2 | rascunhar | Próprio | Consultoria | CON-031 |
| `gerar_cobrancas_anuais(tipo, ano)` | — | M4 | executar | Asaas/banco (B) | Gestão/Atend. | GES-009 |
| `gerar_cobrancas_mes(competencia)` | — | M4 | executar | Asaas/banco (B) | Gestão/Atend. | GES-001 |
| `gerar_contrato(proposta_id)` | — | M2 | rascunhar | Próprio | Clientes/Societário | SOC-016 |
| `gerar_danfe(chave)` | — | M2 | rascunhar | DF-e Sefaz/AN (A) | Notas | NFE-037 |
| `gerar_das(cliente, competencia)` | — | M4 | executar | Integra Contador (A$) | Fiscal | FIS-010 |
| `gerar_das_mei(cliente, competencia)` | — | M4 | executar | Integra Contador (A$) | Fiscal | FIS-016 |
| `gerar_documento(modelo, cliente_id)` | — | M2 | rascunhar | Próprio | Clientes/Societário | SOC-020 |
| `gerar_documentos_admissao(admissao_id)` | — | M2 | rascunhar | Próprio | DP | DP-005 |
| `gerar_instrucao_autxml(cliente, erp)` | — | M2 | rascunhar | DF-e Sefaz/AN (A) | Notas | NFE-002 |
| `gerar_instrucao_erp(cliente, problema)` | — | M2 | rascunhar | Próprio | Notas | NFE-030 |
| `gerar_lista_pagamento(cliente, competencia)` | — | M2 | rascunhar | Próprio | DP | DP-022 |
| `gerar_livro_caixa(cliente, periodo)` | — | M2 | rascunhar | Próprio | Contábil | CTB-052 |
| `gerar_minuta_ata(cliente_id, tipo)` | — | M2 | rascunhar | Próprio | Clientes/Societário | SOC-041 |
| `gerar_minuta_ato(tipo, dados)` | — | M2 | rascunhar | Próprio | Clientes/Societário | SOC-026 |
| `gerar_ofx(linhas)` | — | M2 | rascunhar | Open Finance (B) / OFX (F) | Contábil | CTB-009 |
| `gerar_pacote_entrega(cliente_id)` | — | M2 | rascunhar | Próprio | Clientes/Societário | SOC-024 |
| `gerar_previa_comparada(cliente, competencia)` | — | M2 | rascunhar | Próprio | DP | DP-012 |
| `gerar_proposta(cliente, escopo)` | — | M2 | rascunhar | Próprio | Clientes/Societário, Consultoria | CON-007, SOC-015 |
| `gerar_relatorio_gerencial(cliente, mes)` | — | M2 | rascunhar | Próprio | Contábil | CTB-028 |
| `gerar_relatorio_simulacao(cliente)` | — | M2 | rascunhar | Próprio | Consultoria | CON-016 |
| `gerar_resumo_mensal(cliente, mes)` | — | M2 | rascunhar | Próprio | Fiscal | FIS-033 |
| `gerar_termo_opcao(cliente)` | `gerar_termo_opcao_regime` | M2 | rascunhar | Próprio | Consultoria | CON-009, CON-017 |
| `gerar_trilha(setor)` | — | M2 | rascunhar | Próprio | Gestão/Atend. | GES-022 |
| `gerir_usuario_portal(cliente, pessoa, perfil)` | — | M4 | executar | Próprio | Gestão/Atend. | GES-041 |
| `guardar_prova(cliente, consulta)` | — | M4 | executar | Próprio | Notas | NFE-028 |
| `historico_perfil(cliente_id, campo)` | — | M2 | ler | Próprio | Clientes/Societário | SOC-002 |
| `historico_uso_certificado(certificado_id, periodo)` | — | M2 | ler | Próprio | Clientes/Societário | SOC-010 |
| `identificar_contato(telefone)` | — | M2 | ler | Próprio | Gestão/Atend. | GES-023 |
| `identificar_obrigados_dirbi(competencia)` | — | M2 | ler | Próprio | Fiscal | FIS-022 |
| `impactos_reabertura(cliente, mes)` | — | M2 | ler | Próprio | Contábil | CTB-027 |
| `importar_aej(cliente, arquivo)` | — | M4 | executar | Próprio | DP | DP-010 |
| `importar_agenda(pessoa, periodo)` | — | M4 | executar | Google/Microsoft Calendar (A) | Gestão/Atend. | GES-050 |
| `importar_atividades_core(core, periodo)` | — | M4 | executar | ePlugin `historico-tarefas` (B, Alterdata); Domínio Processos e Contmatic a negociar | Gestão/Atend. | GES-048 |
| `importar_erp_cliente(cliente, mes, origem)` | — | M4 | executar | Próprio | Contábil | CTB-007 |
| `importar_fatura_cartao(cliente, cartao, mes)` | — | M4 | executar | Open Finance (B) / OFX (F) | Contábil | CTB-012 |
| `importar_historico_whatsapp(arquivo, cliente)` | — | M4 | executar | WhatsApp Cloud API (B) / e-mail | Gestão/Atend. | GES-037 |
| `importar_xmls(cliente, arquivo)` | — | M4 | executar | DF-e Sefaz/AN (A) | Notas | NFE-005 |
| `incluir_item_fatura(cliente, servico, valor)` | — | M4 | executar | Próprio | Gestão/Atend. | GES-002 |
| `indexar_documento_escritorio(doc, tags)` | — | M4 | executar | Próprio | Consultoria | CON-004 |
| `indicadores(cliente, periodo)` | — | M2 | ler | Próprio | Contábil | CTB-030 |
| `indicadores_financeiros(periodo)` | — | M2 | ler | Próprio | Gestão/Atend. | GES-011 |
| `indices_edital(cliente, edital)` | — | M3 | ler | BCB SGS (A) | Contábil | CTB-031 |
| `iniciar_offboarding(cliente_id, data)` | — | M4 | executar | Próprio | Clientes/Societário, Gestão/Atend. | GES-006, GES-046, SOC-024 |
| `iniciar_onboarding(cliente_id)` | — | M4 | executar | Próprio | Clientes/Societário | SOC-021 |
| `iniciar_roteiro(cliente_id, roteiro='govbr_prata')` | — | M4 | executar | Próprio | Clientes/Societário | SOC-014 |
| `intervalos_desktop(pessoa, dia)` | — | M2 | ler | Próprio (alternativa, fora do plano principal: decisão 3) | Gestão/Atend. | GES-049 |
| `inventario_acessos(pessoa)` | — | M2 | ler | Próprio | Gestão/Atend. | GES-021 |
| `inventario_fisico_bens(cliente)` | — | M2 | ler | Próprio | Contábil | CTB-048 |
| `ler_caixa_det(cliente)` | — | M2 | ler | DET (C-cert/D) | DP | DP-040 |
| `ler_caixa_email(caixa)` | — | M2 | ler | Gmail/Graph (A) | Gestão/Atend. | GES-027 |
| `ler_guia(arquivo)` | — | M2 | ler | Próprio | Fiscal | FIS-031 |
| `levantar_creditos_pis_cofins(cliente, periodo)` | — | M2 | ler | Próprio | Consultoria | CON-025 |
| `limite_lucro_distribuivel(cliente, periodo)` | — | M3 | rascunhar | Próprio | Contábil | CTB-033 |
| `linha_do_tempo_nota(chave)` | — | M2 | ler | DF-e Sefaz/AN (A) | Notas | NFE-018 |
| `listar_alertas_regime(carteira)` | — | M2 | ler | Próprio | Consultoria | CON-010 |
| `listar_autorizacoes_pendentes()` | — | M2 | ler | Integra Contador (A$) | Clientes/Societário | SOC-012 |
| `listar_autorizacoes_vencendo(dias)` | — | M2 | ler | Integra Contador (A$) | Clientes/Societário | SOC-012 |
| `listar_beneficios_obrigatorios(cliente)` | — | M2 | ler | Próprio | DP | DP-008 |
| `listar_canceladas_denegadas(cliente, competencia)` | — | M2 | ler | DF-e Sefaz/AN (A) | Notas | NFE-029 |
| `listar_candidatos_opcao_sn(ano)` | — | M2 | ler | Próprio | Fiscal | FIS-014 |
| `listar_certidoes_vencendo(dias)` | — | M2 | ler | Agregador de certidões (B) / C-captcha | Fiscal | FIS-036 |
| `listar_certificados(filtro)` | — | M2 | ler | Próprio | Clientes/Societário | SOC-008 |
| `listar_certificados_vencendo(dias)` | `alertar_certificado`, `certificados_vencendo` | M2 | ler | Próprio | Clientes/Societário, Gestão/Atend., Notas | GES-058, NFE-003, SOC-009 |
| `listar_chaves_nfce(cliente, periodo)` | — | M2 | ler | DF-e Sefaz/AN (A) | Notas | NFE-009 |
| `listar_clientes_b2b_simples()` | — | M2 | ler | Próprio | Fiscal | FIS-015 |
| `listar_consignados(cliente, competencia)` | — | M2 | ler | Próprio | DP | DP-013 |
| `listar_dctfweb_em_andamento()` | — | M2 | ler | Integra Contador (A$) | Fiscal | FIS-019 |
| `listar_divergencias(cliente)` | — | M2 | ler | Próprio | Fiscal | FIS-004 |
| `listar_documentos_afetados(norma)` | — | M2 | ler | Próprio | Consultoria | CON-005 |
| `listar_elegiveis_edital(edital)` | — | M2 | ler | Próprio | Fiscal | FIS-035 |
| `listar_experiencias_vencendo(dias)` | — | M2 | ler | Próprio | DP | DP-007 |
| `listar_extras(cliente_id, periodo)` | — | M2 | ler | Próprio | Clientes/Societário, Gestão/Atend. | GES-002, SOC-017 |
| `listar_ferias_vencendo(cliente, dias)` | — | M2 | ler | Leiaute do core (F) / eSocial (A) | DP | DP-023 |
| `listar_fontes_aplicaveis(cliente, data)` | — | M1 | ler | Próprio | Notas | NFE-001 |
| `listar_guias_cliente(cliente, mes)` | — | M2 | ler | Próprio | Fiscal | FIS-031 |
| `listar_inconsistencias_ponto(cliente)` | — | M2 | ler | Próprio | DP | DP-010 |
| `listar_inscricoes(cliente_id)` | — | M2 | ler | Próprio | Clientes/Societário | SOC-005 |
| `listar_licencas_vencendo(dias)` | — | M2 | ler | Próprio | Clientes/Societário | SOC-036, SOC-037 |
| `listar_livros_pendentes(cliente_id)` | — | M2 | ler | Próprio | Clientes/Societário | SOC-042 |
| `listar_mdfe_abertos(cliente)` | — | M2 | ler | DF-e Sefaz/AN (A) | Notas | NFE-010 |
| `listar_mensagens_novas(desde)` | — | M2 | ler | Próprio | Fiscal | FIS-005 |
| `listar_obrigacoes_aplicaveis(cliente, data)` | — | M1 | ler | Próprio | Fiscal | FIS-001 |
| `listar_obrigacoes_estaduais(uf, perfil, data)` | — | M2 | ler | Portais Sefaz (C-cert/C-crc) | Fiscal | FIS-024 |
| `listar_obrigados_ata_anual(ano)` | — | M2 | ler | Próprio | Clientes/Societário | SOC-041 |
| `listar_ocorrencias(periodo)` | — | M2 | ler | Próprio | Gestão/Atend. | GES-019 |
| `listar_pagamentos_nao_identificados()` | — | M2 | ler | Próprio | Gestão/Atend. | GES-003 |
| `listar_parcelamentos(cliente)` | — | M2 | ler | Integra Contador (A$) | Fiscal | FIS-034 |
| `listar_pendencias_pessoa(cpf)` | — | M2 | ler | Próprio | Clientes/Societário | SOC-004 |
| `listar_pendentes_manifestacao(cliente, dias_restantes)` | — | M2 | ler | DF-e Sefaz/AN (A) | Notas | NFE-015 |
| `listar_regras(cliente)` | — | M2 | ler | Próprio | Contábil | CTB-016 |
| `listar_retencoes_a_compensar(periodo)` | — | M2 | ler | Próprio | Gestão/Atend. | GES-008 |
| `listar_saidas(cliente, competencia)` | — | M2 | ler | DF-e Sefaz/AN (A) | Notas | NFE-005 |
| `listar_sem_suporte(cliente, mes)` | — | M2 | ler | Próprio | Contábil | CTB-006 |
| `listar_sinais_alerta(periodo)` | — | M2 | ler | Próprio | Clientes/Societário | SOC-019 |
| `listar_tarefas_afetadas(obrigacao, uf, competencia)` | — | M2 | ler | Próprio | Fiscal | FIS-002 |
| `listar_vinculos_ativos(cliente_id)` | — | M2 | ler | Próprio | Clientes/Societário | SOC-024 |
| `localizar_nota(chave)` | — | M2 | ler | DF-e Sefaz/AN (A) | Notas | NFE-012, NFE-037 |
| `lucros_pagos_mes(cliente, mes)` | — | M2 | ler | Próprio | Contábil | CTB-034 |
| `mapear_categorias(cliente)` | — | M2 | rascunhar | Próprio | Contábil | CTB-007 |
| `mapear_licencas(cliente_id, estabelecimento_id)` | — | M2 | rascunhar | Próprio | Clientes/Societário | SOC-035 |
| `mapear_regime_fornecedores(cliente, periodo)` | — | M2 | rascunhar | Próprio | Consultoria | CON-018 |
| `marcar_etapa(cliente, mes, etapa)` | — | M4 | executar | Próprio | Contábil | CTB-024 |
| `marcar_resposta_incorreta(id, correcao)` | — | M4 | executar | Próprio | Gestão/Atend. | GES-062 |
| `monitorar_decisoes(temas)` | — | M1 | ler | Base legal (M1) / fontes normativas (A) | Consultoria | CON-013 |
| `montar_dossie(cliente, projeto)` | — | M2 | rascunhar | Próprio | Consultoria | CON-034 |
| `montar_dossie_fiscalizacao(cliente, itens)` | — | M2 | rascunhar | Próprio | DP | DP-041 |
| `montar_dossie_homologacao(cliente)` | — | M2 | rascunhar | Próprio | Consultoria | CON-026 |
| `municipio_integrado_adn(ibge)` | — | M2 | ler | Próprio | Notas | NFE-007 |
| `notas_sem_xml(cliente)` | — | M2 | ler | DF-e Sefaz/AN (A) | Notas | NFE-021 |
| `novidades_trabalhistas(desde)` | — | M1 | ler | Próprio | DP | DP-043 |
| `obrigacoes_capital_estrangeiro(cliente_id)` | — | M2 | ler | Próprio | Clientes/Societário | SOC-044 |
| `obrigacoes_do_escritorio()` | — | M2 | ler | Próprio | Gestão/Atend. | GES-057 |
| `obrigados_ecd(carteira, exercicio)` | — | M2 | ler | Próprio | Contábil | CTB-041 |
| `obter_apuracao_assistida(cliente, competencia)` | — | M2 | ler | Próprio | Consultoria | CON-032 |
| `obter_extrato(cliente, conta, periodo)` | — | M2 | ler | Open Finance (B) / OFX (F) | Contábil | CTB-008 |
| `obter_perfil(cliente_id, data)` | `perfil_cliente_na_data` | M2 | ler | Próprio | Clientes/Societário, Consultoria | CON-002, SOC-002 |
| `obter_xml(chave)` | — | M2 | ler | DF-e Sefaz/AN (A) | Notas | NFE-004, NFE-011 |
| `orientar_correcao_nota(chave, erro)` | — | M2 | ler | DF-e Sefaz/AN (A) | Notas | NFE-019 |
| `pacote_demonstracoes(cliente, exercicio, finalidade)` | — | M2 | rascunhar | Próprio | Contábil | CTB-031 |
| `pacote_entrega_documentos(cliente, periodo)` | — | M2 | rascunhar | Próprio | Contábil | CTB-050 |
| `pacote_reclamatoria(empregado, itens)` | — | M2 | rascunhar | Próprio | DP | DP-061 |
| `painel_fechamento(competencia, filtro)` | — | M2 | ler | Próprio | Fiscal | FIS-047 |
| `papel_trabalho_conciliacao(cliente, conta)` | — | M2 | rascunhar | Próprio | Contábil | CTB-018 |
| `pausar_regua(cliente, motivo, ate)` | — | M4 | executar | Asaas/banco (B) | Gestão/Atend. | GES-004 |
| `pedir_aprovacao_cliente(cliente, ato)` | — | M4 | executar | WhatsApp Cloud API (B) / e-mail | Gestão/Atend. | GES-036 |
| `pedir_autorizacao(cliente_id, servicos)` | — | M4 | executar | WhatsApp Cloud API (B) / e-mail | Clientes/Societário | SOC-011 |
| `pedir_certificado(cliente_id)` | — | M4 | executar | WhatsApp Cloud API (B) / e-mail | Clientes/Societário | SOC-008 |
| `pedir_documento(destinatario, tipo)` | `cobrar_pendencias`, `enviar_link_coleta`, `pedir_dados_faltantes`, `pedir_pendencias`, `solicitar_documentos` | M4 | executar | WhatsApp Cloud API (B) / e-mail | Clientes/Societário, Contábil, DP, Fiscal, Gestão/Atend., Notas | CTB-002, CTB-003, DP-001, DP-002, FIS-038, GES-040, NFE-005, NFE-020, NFE-038, SOC-004, SOC-021 |
| `pedir_procuracao(cliente_id, orgao, poderes)` | — | M4 | executar | WhatsApp Cloud API (B) / e-mail | Clientes/Societário | SOC-013 |
| `pendencias_competencia(cliente, mes)` | — | M2 | ler | Próprio | Contábil | CTB-003 |
| `pendencias_documentais(cliente, competencia)` | — | M2 | ler | Próprio | Notas | NFE-038 |
| `pendencias_esocial(carteira)` | — | M2 | ler | eSocial / EFD-Reinf (A) | DP | DP-038 |
| `percentual_vendas_b2b(cliente, periodo)` | — | M3 | ler | Próprio | Consultoria | CON-015 |
| `perguntar_ao_cliente(cliente, itens)` | — | M4 | executar | WhatsApp Cloud API (B) / e-mail | Contábil | CTB-006 |
| `perguntar_recebimento(cliente, chaves)` | — | M4 | executar | WhatsApp Cloud API (B) / e-mail | Notas | NFE-015 |
| `planejar_cobertura(pessoa, inicio, fim)` | — | M2 | rascunhar | Próprio | Gestão/Atend. | GES-018 |
| `pode_trabalhar_feriado(cliente, data)` | — | M1 | ler | Próprio | DP | DP-037 |
| `politica_contabil_reforma(cliente)` | — | M1 | rascunhar | Próprio | Contábil | CTB-023 |
| `politica_retencao(cliente)` | — | M2 | rascunhar | Próprio | Gestão/Atend., Notas | GES-054, NFE-036 |
| `posicao_emprestimos(cliente, data)` | — | M2 | ler | Próprio | Contábil | CTB-014 |
| `posicao_parcelamentos(cliente, data)` | — | M2 | ler | Integra Contador (A$) | Contábil | CTB-022 |
| `prazo_opcao_simples(cliente_id)` | — | M3 | ler | Próprio | Clientes/Societário | SOC-028 |
| `prazo_rescisao(desligamento_id)` | — | M3 | ler | Próprio | DP | DP-027 |
| `preparar_decore(socio, periodo)` | — | M2 | rascunhar | Leiaute do core (F) | Contábil | CTB-032 |
| `preparar_defis(cliente, ano)` | — | M2 | rascunhar | Integra Contador (A$) | Fiscal | FIS-013 |
| `prevalidar_importacao(cliente, lote, core)` | — | M2 | ler | Leiaute do core (F) | Notas | NFE-034 |
| `prever_custo_13(cliente)` | — | M3 | rascunhar | Próprio | DP | DP-053 |
| `produtividade(setor, pessoa, periodo)` | — | M2 | ler | Próprio | Gestão/Atend. | GES-016 |
| `programar_ferias(empregado, inicio, dias, abono)` | — | M4 | executar | Próprio | DP | DP-024 |
| `projetar_caixa_split(cliente, meses)` | — | M3 | rascunhar | Próprio | Consultoria | CON-023 |
| `projetar_irpfm(cpf, ano)` | — | M3 | rascunhar | Próprio | Contábil | CTB-035 |
| `projetar_receita_ano(cliente)` | — | M3 | rascunhar | Próprio | Fiscal | FIS-011 |
| `prontidao_carteira()` | — | M2 | ler | Próprio | Consultoria | CON-031 |
| `propor_atualizacao_tabela(ato)` | `propor_atualizacao_tabela_uf` | M2 | rascunhar | Próprio | Consultoria, Fiscal | CON-028, FIS-024 |
| `propor_cadastro_bem(cliente, nota)` | — | M2 | rascunhar | Próprio | Contábil | CTB-047 |
| `propor_regra(cliente, exemplos)` | — | M2 | rascunhar | Próprio | Contábil | CTB-016 |
| `propor_versao_perfil(cliente_id, documento_id)` | — | M2 | rascunhar | Próprio | Clientes/Societário | SOC-002 |
| `publicar_documento(cliente, documento, notificar)` | — | M4 | executar | Próprio | Gestão/Atend. | GES-039 |
| `qualificar_lead(conversa)` | — | M2 | rascunhar | Próprio | Gestão/Atend. | GES-032 |
| `ranking_rentabilidade(periodo)` | — | M2 | ler | Próprio | Gestão/Atend. | GES-013 |
| `ranquear_carteira_por_economia(ano)` | — | M3 | rascunhar | Próprio | Consultoria | CON-008 |
| `ranquear_carteira_reforma()` | — | M3 | rascunhar | Próprio | Consultoria | CON-015 |
| `ranquear_oportunidades_carteira()` | — | M3 | rascunhar | Próprio | Consultoria | CON-033 |
| `ranquear_optantes_por_fora(semestre)` | — | M3 | rascunhar | Próprio | Consultoria | CON-017 |
| `rascunhar_ata_aprovacao(cliente, exercicio)` | — | M2 | rascunhar | Próprio | Contábil | CTB-037 |
| `rascunhar_boletim(competencia, segmento)` | — | M2 | rascunhar | Próprio | Gestão/Atend. | GES-044 |
| `rascunhar_carta_reajuste(cliente)` | — | M2 | rascunhar | BCB SGS (A) | Clientes/Societário, Gestão/Atend. | GES-014, SOC-018 |
| `rascunhar_cobranca_extra(...)` | — | M2 | rascunhar | Asaas/banco (B) | Clientes/Societário | SOC-017 |
| `rascunhar_comunicado(norma, segmento)` | — | M2 | rascunhar | WhatsApp Cloud API (B) / e-mail | Consultoria | CON-030 |
| `rascunhar_consulta_formal(dados)` | — | M1 | rascunhar | Próprio | Consultoria | CON-006 |
| `rascunhar_nfse(cliente, dados)` | — | M2 | rascunhar | NFS-e Nacional/ADN (A) + integrador (B) | Notas | NFE-039 |
| `rascunhar_notas_explicativas(cliente, exercicio)` | — | M2 | rascunhar | Próprio | Contábil | CTB-045 |
| `rascunhar_notificacao_extrajudicial(cliente)` | — | M2 | rascunhar | Próprio | Gestão/Atend. | GES-006 |
| `rascunhar_parecer(...)` | — | M1 | rascunhar | Próprio | Consultoria | CON-003, CON-008 |
| `rascunhar_pedido_reequilibrio(...)` | — | M2 | rascunhar | Próprio | Consultoria | CON-024 |
| `rascunhar_resposta_intimacao(fluxo)` | — | M1 | rascunhar | Próprio | Fiscal | FIS-038 |
| `rascunhar_resposta_tecnica(conversa)` | — | M1 | rascunhar | Próprio | Gestão/Atend. | GES-028 |
| `reabrir_competencia(cliente, mes, motivo)` | — | M4 | executar | Próprio | Contábil | CTB-027 |
| `recalcular_amostra_folha(cliente, competencia)` | — | M3 | rascunhar | Próprio | DP | DP-014 |
| `recalcular_tributo_atrasado(guia, data_pagamento)` | — | M3 | rascunhar | BCB SGS (A) | Fiscal | FIS-021 |
| `registrar_acidente(cliente, relato)` | — | M4 | executar | Próprio | DP | DP-048 |
| `registrar_aso(empregado, arquivo)` | — | M4 | executar | Próprio | DP | DP-003 |
| `registrar_atestado(empregado, arquivo)` | — | M4 | executar | Próprio | DP | DP-046 |
| `registrar_autorizacao(cliente, ato, mensagem_id)` | — | M4 | executar | Próprio | Gestão/Atend. | GES-036 |
| `registrar_beneficio_fiscal(cliente, beneficio)` | — | M4 | executar | Próprio | Consultoria | CON-027 |
| `registrar_certificado_a3(cliente_id, titular, local)` | — | M4 | executar | Próprio | Clientes/Societário | SOC-008 |
| `registrar_ciencia(cliente, comunicado)` | — | M4 | executar | Próprio | Consultoria, Notas | CON-030, NFE-014 |
| `registrar_comprovante(desligamento_id, arquivo)` | — | M4 | executar | Próprio | DP | DP-027 |
| `registrar_consentimento(contato, canal, finalidade)` | — | M4 | executar | WhatsApp Cloud API (B) / e-mail | Gestão/Atend. | GES-031 |
| `registrar_consulta(cliente, canal, texto, tema)` | — | M4 | executar | Próprio | Consultoria | CON-001 |
| `registrar_corte_responsabilidade(cliente_id, data)` | — | M4 | executar | Próprio | Clientes/Societário | SOC-023 |
| `registrar_deliberacao(cliente_id, tipo, dados)` | — | M4 | executar | Próprio | Clientes/Societário | SOC-043 |
| `registrar_desacordo_cte(chave, motivo)` | — | M4 | executar | DF-e Sefaz/AN (A) | Notas | NFE-017 |
| `registrar_evento(...)` | — | M4 | executar | Próprio | Gestão/Atend. | GES-047 |
| `registrar_guia_fgts(..., tipo="rescisoria")` | — | M4 | executar | FGTS Digital (D/C-cert) | DP | DP-018, DP-029 |
| `registrar_incidente(tipo, dados_afetados)` | — | M4 | executar | Próprio | Gestão/Atend. | GES-059 |
| `registrar_interacao(cliente, tipo, resumo, duracao)` | — | M4 | executar | Próprio | Gestão/Atend. | GES-033 |
| `registrar_licenca(cliente_id, tipo, validade, documento_id)` | — | M4 | executar | Próprio | Clientes/Societário | SOC-036, SOC-037, SOC-038, SOC-039, SOC-040 |
| `registrar_manifestacao(chave, "desconhecimento")` | — | M4 | executar | DF-e Sefaz/AN (A) | Notas | NFE-015, NFE-016 |
| `registrar_nota_manual(cliente, dados)` | — | M4 | executar | DF-e Sefaz/AN (A) | Notas | NFE-008 |
| `registrar_ocorrencia(cliente, tipo, custo, causa)` | — | M4 | executar | Próprio | Gestão/Atend. | GES-019 |
| `registrar_opcao(cliente, regime, evidencia)` | — | M4 | executar | Próprio | Consultoria | CON-009 |
| `registrar_oposicao(empregado, arquivo)` | — | M4 | executar | Próprio | DP | DP-036 |
| `registrar_perdcomp(cliente, numero)` | — | M4 | executar | Próprio | Fiscal | FIS-042 |
| `registrar_promessa_pagamento(cliente, data)` | — | M4 | executar | Asaas/banco (B) | Gestão/Atend. | GES-004 |
| `registrar_recibo_sped(cliente, tipo, arquivo)` | — | M4 | executar | Próprio | Fiscal | FIS-023 |
| `registrar_treinamento(pessoa, tema)` | — | M4 | executar | Próprio | Gestão/Atend. | GES-022 |
| `regra_contribuicao_cct(cliente)` | — | M1 | rascunhar | Próprio | DP | DP-036 |
| `regras_regime_especifico(regime, data)` | — | M1 | rascunhar | Próprio | Consultoria | CON-021 |
| `relatorio_entregas(cliente, periodo)` | — | M2 | ler | Próprio | Gestão/Atend. | GES-045 |
| `relatorio_notas(cliente, filtro)` | — | M2 | ler | DF-e Sefaz/AN (A) | Notas | NFE-037 |
| `rentabilidade_cliente(cliente, periodo)` | — | M3 | ler | Próprio | Gestão/Atend. | GES-013 |
| `rentabilidade_projeto(projeto)` | — | M3 | ler | Próprio | Consultoria | CON-037 |
| `reprocessar_captura(cliente, fonte)` | — | M4 | executar | DF-e Sefaz/AN (A) | Notas | NFE-003 |
| `reprogramar_tarefas(lista, novo_prazo)` | — | M4 | executar | Próprio | Fiscal | FIS-002 |
| `responder_cliente(conversa)` | `rascunhar_resposta_cliente` | M2 | rascunhar | WhatsApp Cloud API (B) / e-mail | Consultoria, Fiscal | CON-002, FIS-044 |
| `responder_duvida_dp(cliente, pergunta)` | — | M2 | rascunhar | WhatsApp Cloud API (B) / e-mail | DP | DP-058 |
| `responder_email(conversa, texto)` | — | M2 | rascunhar | Gmail/Graph (A) | Gestão/Atend. | GES-027 |
| `responder_status(conversa)` | — | M4 | executar | WhatsApp Cloud API (B) / e-mail | Gestão/Atend. | GES-025 |
| `resumir_mensagem(id)` | — | M2 | rascunhar | WhatsApp Cloud API (B) / e-mail | Fiscal | FIS-005 |
| `resumir_notificacao(arquivo)` | — | M2 | rascunhar | Próprio | DP | DP-040 |
| `resumir_nt(nt)` | — | M1 | rascunhar | Base legal (M1) / fontes normativas (A) | Notas | NFE-040 |
| `resumo_atendimento(dia)` | — | M2 | ler | Próprio | Gestão/Atend. | GES-034 |
| `resumo_cliente_para_substituto(cliente, setor)` | — | M2 | ler | Próprio | Gestão/Atend. | GES-018 |
| `revisar_balancete(cliente, mes)` | — | M2 | ler | Próprio | Contábil | CTB-025 |
| `revogar_acessos(pessoa)` | — | M4 | executar | Próprio | Gestão/Atend. | GES-021 |
| `risco_rescisao(cliente)` | — | M2 | ler | Próprio | Fiscal | FIS-034 |
| `risco_saida(cliente)` | — | M2 | ler | Próprio | Gestão/Atend. | GES-043 |
| `rotear_conversa(conversa)` | — | M4 | executar | WhatsApp Cloud API (B) / e-mail | Gestão/Atend. | GES-024 |
| `saldo_credor_icms(cliente, uf)` | — | M3 | ler | Próprio | Consultoria | CON-026 |
| `saldo_lucros_transicao(cliente)` | — | M3 | ler | Próprio | Contábil | CTB-036 |
| `saude_numero()` | — | M2 | ler | WhatsApp Cloud API (B) / e-mail | Gestão/Atend. | GES-031 |
| `segmentar_clientes(regra)` | — | M2 | ler | Próprio | Consultoria, Gestão/Atend. | CON-030, GES-030 |
| `segregar_monofasico(cliente, competencia)` | — | M2 | rascunhar | Próprio | Notas | NFE-024 |
| `separar_holerites(arquivo)` | — | M2 | rascunhar | Próprio | DP | DP-019 |
| `simular_acordo(cliente, parcelas, desconto)` | — | M3 | rascunhar | Asaas/banco (B) | Gestão/Atend. | GES-005 |
| `simular_custo_empregado(cliente, cenario)` | — | M3 | rascunhar | Próprio | DP | DP-059 |
| `simular_estrutura_societaria(cenarios)` | — | M3 | rascunhar | Próprio | Consultoria | CON-014 |
| `simular_ibs_cbs_dentro_fora_das(cliente)` | — | M3 | rascunhar | Integra Contador (A$) | Fiscal | FIS-015 |
| `simular_is(cliente, cenarios)` | — | M3 | rascunhar | Calculadora de Tributos RFB (A, indício) + M3 | Consultoria | CON-022 |
| `simular_jcp(cliente, periodo)` | — | M3 | rascunhar | BCB SGS (A) | Contábil | CTB-038 |
| `simular_parcelamento(cliente, debitos)` | — | M3 | rascunhar | Integra Contador (A$) | Fiscal | FIS-008 |
| `simular_preco_reforma(cliente, itens, ano)` | — | M3 | rascunhar | Próprio | Consultoria | CON-019 |
| `simular_prolabore_fator_r(cliente, competencia)` | `simular_pro_labore_fator_r` | M3 | rascunhar | Próprio | DP, Fiscal | DP-015, FIS-012 |
| `simular_prolabore_lucros(cliente, ano)` | — | M3 | rascunhar | Próprio | Consultoria | CON-012 |
| `simular_reajuste_carteira(indice, data_base)` | — | M3 | rascunhar | BCB SGS (A) | Gestão/Atend. | GES-014 |
| `simular_recuperacao(cliente, periodo)` | — | M3 | rascunhar | Próprio | Notas | NFE-024 |
| `simular_reforma(cliente, anos, cenario)` | — | M3 | rascunhar | Calculadora de Tributos RFB (A, indício) + M3 | Consultoria | CON-016, CON-027 |
| `simular_regimes(cliente, ano, cenario)` | — | M3 | rascunhar | Próprio | Clientes/Societário, Consultoria, Fiscal | CON-008, FIS-014, SOC-028 |
| `simular_rescisao(empregado, data, tipo)` | — | M3 | rascunhar | Próprio | DP | DP-026 |
| `simular_retencao_dividendos(cliente, socio, valor)` | — | M3 | rascunhar | Próprio | Contábil | CTB-034 |
| `simular_simples_por_fora(cliente, semestre)` | — | M3 | rascunhar | Próprio | Consultoria | CON-017 |
| `simular_transacao(cliente, edital)` | — | M3 | rascunhar | Próprio | Fiscal | FIS-035 |
| `situacao_judicial(norma)` | — | M2 | ler | Próprio | Consultoria | CON-011 |
| `sla_status(fila)` | — | M2 | ler | Próprio | Gestão/Atend. | GES-024 |
| `solicitar_acervo(cliente_id, contador_anterior)` | — | M4 | executar | WhatsApp Cloud API (B) / e-mail | Clientes/Societário | SOC-023 |
| `solicitar_aprovacao(rascunho, aprovador)` | — | M4 | executar | WhatsApp Cloud API (B) / e-mail | DP, Gestão/Atend. | DP-012, GES-028 |
| `solicitar_inventario(cliente, data)` | — | M4 | executar | WhatsApp Cloud API (B) / e-mail | Contábil | CTB-046 |
| `somar_afastamentos(empregado)` | — | M3 | ler | Próprio | DP | DP-046 |
| `somar_faturamento_mei(cliente, ano)` | — | M3 | ler | Próprio | Fiscal | FIS-017 |
| `status_captura(cliente)` | — | M2 | ler | DF-e Sefaz/AN (A) | Notas | NFE-003, NFE-004 |
| `status_consentimentos(cliente)` | — | M2 | ler | WhatsApp Cloud API (B) / e-mail | Contábil | CTB-010 |
| `status_ecd(cliente, exercicio)` | — | M2 | ler | Próprio | Contábil | CTB-041 |
| `status_ecf(cliente, exercicio)` | — | M2 | ler | Próprio | Contábil | CTB-042 |
| `status_envio(guia)` | — | M2 | ler | Próprio | Fiscal | FIS-031 |
| `status_envio_core(cliente)` | — | M2 | ler | Leiaute do core (F) | Notas | NFE-033 |
| `status_fechamento(carteira, mes)` | — | M2 | ler | Próprio | Contábil | CTB-026 |
| `status_fechamento_esocial(cliente, competencia)` | — | M2 | ler | eSocial / EFD-Reinf (A) | DP | DP-016 |
| `status_modelo(id)` | — | M2 | ler | Próprio | Gestão/Atend. | GES-029 |
| `status_onboarding(cliente_id)` | — | M2 | ler | Próprio | Clientes/Societário | SOC-021 |
| `sugerir_aviso_sinistro(ocorrencia)` | — | M2 | rascunhar | Próprio | Gestão/Atend. | GES-060 |
| `sugerir_classificacao(cliente, mes)` | — | M2 | rascunhar | Próprio | Contábil | CTB-015 |
| `sugerir_cnaes(descricao)` | — | M2 | rascunhar | Próprio | Clientes/Societário | SOC-025 |
| `sugerir_depara_cfop(cliente, cfop_saida, ncm, fornecedor)` | — | M2 | rascunhar | Leiaute do core (F) | Notas | NFE-034 |
| `sugerir_distribuicao_carteira(setor)` | — | M2 | rascunhar | Próprio | Gestão/Atend. | GES-017 |
| `sugerir_enquadramento_sindical(cliente)` | — | M1 | rascunhar | Próprio | DP | DP-033 |
| `sugerir_ncm(descricao)` | — | M2 | rascunhar | Próprio | Notas | NFE-032 |
| `sugerir_nota_cliente(cliente)` | — | M2 | rascunhar | Próprio | Gestão/Atend. | GES-020 |
| `sugerir_obrigacoes(cliente_id)` | — | M2 | rascunhar | Próprio | Clientes/Societário | SOC-001 |
| `sugerir_programacao_ferias(cliente)` | — | M2 | rascunhar | Próprio | DP | DP-023 |
| `sugerir_redistribuicao()` | — | M2 | rascunhar | Próprio | Fiscal | FIS-047 |
| `sugerir_regime_especifico(cliente)` | — | M1 | rascunhar | Próprio | Consultoria | CON-021 |
| `sugerir_resposta_exigencia(texto)` | — | M1 | rascunhar | Próprio | Clientes/Societário | SOC-030 |
| `tabela_aliquotas_referencia(ano)` | — | M1 | rascunhar | Próprio | Consultoria | CON-016 |
| `timesheet(pessoa, dia)` | — | M2 | ler | Próprio | Gestão/Atend. | GES-047 |
| `transferir_conversa(conversa, setor, pessoa)` | — | M4 | executar | WhatsApp Cloud API (B) / e-mail | Gestão/Atend. | GES-024 |
| `transferir_responsavel(cliente, setor, de, para)` | — | M4 | executar | Próprio | Gestão/Atend. | GES-017 |
| `transmitir_dasn_simei(cliente, ano)` | — | M4 | executar | Integra Contador (A$) | Fiscal | FIS-017 |
| `transmitir_dctfweb(cliente, competencia)` | — | M4 | executar | Integra Contador (A$) | Fiscal | FIS-019 |
| `transmitir_defis(cliente, ano)` | — | M4 | executar | Integra Contador (A$) | Fiscal | FIS-013 |
| `transmitir_lote(clientes)` | — | M4 | executar | Próprio | Fiscal | FIS-009 |
| `transmitir_pgdas(cliente, competencia, dados)` | — | M4 | executar | Integra Contador (A$) | Fiscal | FIS-009 |
| `trilha_auditoria(filtro)` | — | M2 | ler | Próprio | Gestão/Atend. | GES-059 |
| `validar_admissao(admissao_id)` | — | M2 | ler | Próprio | DP | DP-001 |
| `validar_arquivo_ponto(arquivo, tipo)` | — | M2 | ler | Próprio | DP | DP-045 |
| `validar_autorizacao(id)` | — | M2 | ler | Próprio | Clientes/Societário | SOC-012 |
| `validar_cadastro_empregado(empregado)` | — | M2 | ler | Próprio | DP | DP-004 |
| `validar_certificado(arquivo_id)` | — | M2 | ler | Próprio | Clientes/Societário | SOC-009 |
| `validar_extrato(arquivo)` | — | M2 | ler | Open Finance (B) / OFX (F) | Contábil | CTB-008 |
| `validar_ferias(programacao_id)` | — | M2 | ler | Próprio | DP | DP-024 |
| `validar_ibs_cbs(cliente, competencia)` | — | M2 | ler | Calculadora de Tributos RFB (A, indício) + M3 | Notas | NFE-030 |
| `validar_nfse_publica(municipio, numero, codigo)` | — | M2 | ler | NFS-e Nacional/ADN (A) + integrador (B) | Notas | NFE-008 |
| `varrer_icms_st(cliente, periodo, uf)` | — | M2 | ler | Portais Sefaz (C-cert/C-crc) | Fiscal | FIS-043 |
| `varrer_monofasico(cliente, periodo)` | — | M2 | ler | Próprio | Fiscal | FIS-041 |
| `varrer_oportunidades_credito(cliente, periodo)` | — | M2 | ler | Próprio | Consultoria | CON-033 |
| `verificar_autxml(cliente, periodo)` | — | M2 | ler | DF-e Sefaz/AN (A) | Notas | NFE-002 |
| `verificar_citacoes(documento)` | — | M1 | ler | Próprio | Consultoria | CON-003 |
| `verificar_completude(cliente, mes)` | — | M2 | ler | Próprio | Contábil | CTB-005 |
| `verificar_destaque_ibs_cbs(cliente, mes)` | — | M2 | ler | Calculadora de Tributos RFB (A, indício) + M3 | Fiscal | FIS-045 |
| `verificar_dispensa_demissional(empregado, data_termino)` | — | M2 | ler | Próprio | DP | DP-028 |
| `verificar_domicilio_judicial(cliente_id)` | — | M2 | ler | Próprio | Clientes/Societário | SOC-007 |
| `verificar_item_checklist(cliente, item)` | — | M2 | ler | Próprio | Consultoria | CON-031 |
| `verificar_limite_mei(cliente_id)` | — | M2 | ler | Próprio | Clientes/Societário | SOC-032 |
| `verificar_pagamento_guia(cliente, guia_id)` | `conciliar_guias_pagamentos`, `conferir_pendencias_vs_pagamentos`, `consultar_pagamentos` | M2 | ler | Próprio | DP, Fiscal | DP-021, FIS-008, FIS-032 |
| `verificar_recibo_esocial(cliente, evento, empregado)` | — | M2 | ler | eSocial / EFD-Reinf (A) | DP | DP-006, DP-029 |
| `verificar_sequencia(cliente, competencia)` | — | M2 | ler | DF-e Sefaz/AN (A) | Notas | NFE-020 |
| `verificar_vinculo_contador(cliente_id, orgao)` | — | M2 | ler | Próprio | Clientes/Societário | SOC-005 |
| `vincular_cct(cliente, instrumento)` | — | M4 | executar | Próprio | DP | DP-033 |
| `vincular_conversa(conversa, cliente)` | — | M4 | executar | WhatsApp Cloud API (B) / e-mail | Gestão/Atend. | GES-023 |
| `vincular_cte_nfe(chave_cte)` | — | M4 | executar | DF-e Sefaz/AN (A) | Notas | NFE-006 |
| `vincular_pessoa(cpf, cliente_id, papel, participacao)` | — | M4 | executar | Próprio | Clientes/Societário | SOC-004 |

---

## 5. Mapa de integrações com preços

Uma linha por API ou serviço. "Ref." aponta o código no mapa do verificador (V1, V2 ou V3, seção 1 de cada um). **Rodada 2:** preços marcados `[R2]` foram lidos em página oficial em 06/11/2026; o restante segue como na rodada 1. "→" = do primeiro ao último degrau da tabela por volume. A coluna "R2" diz se a linha foi conferida (conf.), conferida em parte (parc.) ou mantida (R1).

### 5.1 Governo

| Integração | Ref. | Nível | Credencial | Preço (fonte) | Custo estimado por cliente/mês | Confiança | R2 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Integra Contador** (SERPRO/RFB): 119 linhas no catálogo de 15/10/2026 (Simples, MEI, DCTFWeb/MIT, Sicalc, caixa postal, pagamentos, SITFIS, parcelamentos SN/MEI, procurações, PNRCONTADOR, e-Processo) | V1·I-01 | A$ | Contrato na Loja SERPRO com e-CNPJ do contratante; procuração/autorização de cada cliente; software house: **termo de autorização XML assinado pelo escritório** (A1 ou A3) → token válido até a meia-noite do dia seguinte | **Pós-pago, sem adesão** [R2]: Consulta R$ 0,24 → 0,06 · Emissão R$ 0,32 → 0,08 · Declaração R$ 0,40 → 0,12 (todo o volume paga a faixa atingida; período inferido mensal). Eventos de atualização (Monitorar) fora da cobrança, gratuitos pela notícia SERPRO 2024. Revenda Alterdata R$ 0,80/declaração | **Simples ~R$ 1,92 a R$ 2,56 · MEI ~R$ 0,56 · Presumido/Real com folha ~R$ 2,64** (faixa 1; premissa em 5.3) | Alta (preço, catálogo, termo) | conf. |
| Consulta CNPJ (SERPRO) | V1·I-02 | A$ | Contrato SERPRO | Faixa 1 (até 999/mês): Básica R$ 0,6591 · QSA R$ 0,8683 · Empresa R$ 1,1717; 16 faixas até R$ 0,025 [R2] | Opcional; ~R$ 0,66 por consulta avulsa | Alta (preço) | conf. |
| Consulta CPF (SERPRO) | V1·I-03 | A$ | Contrato SERPRO | R$ 0,6591 (até 999/mês) → R$ 0,017 [R2] | Por admissão (DP-004) | Alta (preço) | parc. |
| Dados abertos do CNPJ (RFB) | V1·I-04 | A (arquivo) | Nenhuma | Gratuito; **endereço antigo dá 404, novo `[NÃO ENCONTRADO]`**; CNPJ alfanumérico desde jul/2026 | R$ 0 | Baixa | parc. |
| eSocial (envio, consulta, download) | V1·I-05 | A | Envio: qualquer ICP; download: empregador ou procurador com perfil do grupo de eventos | Gratuito; **download limitado a 10 acessos/dia por empregador** [R2] | R$ 0 | Alta | conf. |
| EFD-Reinf | V1·I-06 | A | Certificado do contribuinte ou de procurador na procuração RFB | Gratuito; só assíncrono; API REST de recibo [R2] | R$ 0 | Alta | conf. |
| DCTFWeb e MIT | V1·I-07 | A$ (Integra) | A do Integra | Transmitir = Declaração; guia = Emissão [R2] | Incluído no Integra | Alta | conf. |
| FGTS Digital | V1·I-08 | C-cert / D | gov.br ou certificado; procuração no SPE | **Sem API pública** na documentação oficial [R2]; aviso cita API para "sistemas parceiros" | R$ 0 em API; tempo do analista | Alta (ausência) | conf. |
| DET | V1·I-09 | C-cert / D | e-CNPJ + perfil de procurador | API `[NÃO ENCONTRADO]` | R$ 0 | Média | parc. |
| Sistema Mediador (CCT) | V1·I-10 | D | Nenhuma | Gratuito | R$ 0 | Baixa | R1 |
| gov.br (login pessoal) | V1·I-12 | C-crc | Conta prata/ouro | — | — | Média | R1 |
| **Autorizações de Acesso RFB** | V1·I-13 | D (concessão e **aceite do escritório em até 30 dias**) / A$ (consulta) | Cliente: gov.br/certificado; escritório: aceite no Portal de Serviços | Consulta = R$ 0,24 (faixa 1) [R2] | Incluído no Integra | Alta | conf. |
| PGFN (Regularize, transação) | V1·I-15 | D | gov.br ou certificado | API `[NÃO ENCONTRADO]` | R$ 0 | Baixa | R1 |
| Certidões federais (CND, CRF, CNDT) | V1·I-16 | C-captcha / B | Nenhuma | Agregador (5.2); SITFIS explica a positiva (Emissão ×2) | Ver agregador | Média | R1 |
| **NFS-e Nacional (ADN, Sefin)** | V1·I-17 | A | **A1-cli (app)**, mesmo CNPJ raiz; procuração não prevista (pedido da FENACON não implementado) | Gratuito [R2] | R$ 0; **5.543 municípios ativos no Ambiente Nacional**, incluindo as cinco capitais | Alta | conf. |
| Portal do Simples / DTE-SN | V1·I-18 | A$ parcial / D | Certificado ou procuração | Indicador de adesão ao DTE no Integra (Consulta) | Incluído no Integra | Média | parc. |
| **Calculadora de Tributos RFB** | V1·I-19 | A | Nenhuma | Gratuita; **versão offline Docker/JAR** com APIs do Regime Regular, Split Payment Simplificado e Simples [R2]; termos de uso `[NÃO ENCONTRADO]` | R$ 0 (roda no servidor) | Alta (existência) / baixa (termos) | conf. |
| Apuração assistida da CBS | V1·I-20 | C-cert / D | Certificado | — | — | Baixa | R1 |
| BCB SGS | V1·I-21 | A | Nenhuma | Gratuito; série 11 testada [R2] | R$ 0 | Alta | conf. |
| IBGE | V1·I-22 | A | Nenhuma | Gratuito; host recusado na sessão (reserva: anexo de municípios da NFS-e) | R$ 0 | Média | R1 |
| SCE-IED (BCB) | V1·I-23 | D | Certificado | — | — | Baixa | R1 |
| SPED (ECD, ECF) | V1·I-24 | F / D | Certificado | — | R$ 0 (recibo do core) | Baixa | R1 |
| Só portal: PER/DCOMP, DIRBI, e-BEF, Domicílio Judicial (e-Processo saiu: está no Integra) | V1·I-25 | D | Certificado + procuração | Fora do catálogo do Integra [R2] | — | Alta (ausência) | parc. |
| Fontes normativas | V1·I-26 | A | Nenhuma | Gratuito | R$ 0 | Baixa | R1 |
| **NF-e: Distribuição de DF-e** | V2·I-01 | A | **A1-cli (app)** para entradas; e-CNPJ do escritório para o que tiver o escritório no `autXML` | Gratuito [R2]; **não devolve notas ao emitente**; janela 90 dias; NSU só a partir do 1º acesso; 20 consultas/h por chave | R$ 0 | Alta | conf. |
| NF-e: manifestação | V2·I-02 | A / A com aprovação | A1-cli (app) | Gratuito | R$ 0 | Média | parc. |
| CT-e | V2·I-03 | A | A1-cli (app) | Gratuito `[CP]` | R$ 0 | Média | R1 |
| MDF-e | V2·I-04 | A (emitente) / E (terceiros) | A1-cli (app) | Gratuito `[CP]` | R$ 0 | Baixa | parc. |
| NFC-e: SAE-NFC-e (SP) | V2·I-05 | A em SP; B nota a nota nas demais | **e-CNPJ do próprio contribuinte** (A1-cli) | Gratuito; limite por IP/minuto não publicado [R2] | R$ 0 | Alta (SP) | conf. |
| Consulta cadastral ICMS (Sintegra/CCC) | V2·I-06 | A (webservice) / B | Nenhuma (Sintegra); A1-cli ou login (CCC) | Agregador: base R$ 0,20 → 0,05 + adicional R$ 0,00–0,10 [R2] | ~R$ 0,24 por consulta | Média | parc. |
| DTEs estaduais (DEC-SP, DT-e MG, DT-e PR, DTEC SC) | V2·I-07 a I-10, I-23 | **B** por agregador | **A1-cli (app)** enviado ao agregador (PKCS#12) ou procuração eletrônica por UF | InfoSimples, sem adicional: R$ 0,20 → 0,05 [R2]; ciência tácita em 10 dias em todas | ~R$ 0,80/mês (4 leituras) | Alta | conf. |
| DTE do RS | V2·I-11 | **C-crc** | Procuração eletrônica do CNPJ ao contabilista (o vínculo no CGCTE não basta) | Sem agregador | Tempo do analista | Alta | conf. |
| Certidões estaduais e municipais | V2·I-18 | B | Nenhuma na maioria | InfoSimples base + adicional R$ 0,04–0,08; SP com **Certidão Única** (90 dias) [R2] | ~R$ 1,30 por cliente com 5 certidões | Alta | conf. |
| Prefeituras das capitais: NFS-e, ISS, DEC | V2·I-12 a I-16 | NFS-e **A** (ADN); DEC SP **B**; demais DEC D/C-cert; guias F | A1-cli (app) | Gratuito; teste de completude obrigatório | R$ 0 | Alta (adesão) / média (completude) | conf. |
| Integradores de NFS-e | V2·I-17 | B (só emissão e exceções) | A1-cli no integrador | **Focus**: Solo R$ 94,90, Start R$ 119,90, Growth R$ 572/mês (CNPJs ilimitados, 4.000 docs, R$ 0,125 adicional; recebidos contam); **NFE.io**: R$ 190 a R$ 375/mês + adesão; PlugNotas, eNotas `[PREÇO NÃO PÚBLICO]` [R2] | Growth ÷ 300 clientes ≈ R$ 1,91 | Alta (preço) | parc. |
| REDESIM e integradores estaduais | V2·I-19 | B (viabilidade JUCESP) / C-captcha / D | Protocolo + login ou certificado | Agregador R$ 0,20 + R$ 0,08 [R2]; API oficial `[NÃO ENCONTRADO]` | Por evento | Média | parc. |
| Juntas Comerciais | V2·I-20 | D (atos); B na JUCESP (fichas, documentos) | e-CPF/certificado | Agregador só na JUCESP [R2] | Por evento | Média | parc. |
| Bombeiros | V2·I-21 | D; B para validade em SP | — | InfoSimples sem adicional [R2] | Por evento | Média | parc. |
| Vigilância sanitária | V2·I-22 | D | — | — | — | Baixa | R1 |

### 5.2 Mercado e cores

| Integração | Ref. | Nível | Credencial | Preço (fonte) | Custo estimado por cliente/mês | Confiança | R2 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Domínio (TR): API de entrada para ERP homologado** (NF-e, NFC-e, NFS-e, CF-e, CT-e, pagamentos/recebimentos, Rubricas da folha) | V3·I-01 | **B** | Cadastro como parceiro ("Quero ser parceiro") + **chave por empresa** gerada pelo escritório no Onvio Gestão; Agente de Comunicação ativo | Chave e usuários Onvio sem custo; programa de parceiros `[PREÇO NÃO PÚBLICO]` | Não calculável | Alta (existência e mecânica) | conf. |
| **Domínio Processos / Portal do Cliente: saída** (tarefas, responsável, tempo; documentos) | V3·I-01 | **B a negociar** | Contrato com a TR; especificação em api.onvio.com.br cobre só status de integração | Domínio Processos: mensalidade só na contratação `[PREÇO NÃO PÚBLICO]` | Não calculável | Alta (ausência de API pública) | conf. |
| **Alterdata ePlugin** (tarefas, documentos, CNDs, empresas, funcionários; grava admissão, férias, rescisão, movimentos, atendimentos, lançamentos; recálculo de DAS) | V3·I-02 | **B** | **Token Bearer do escritório**, gerado no eContador; exige pacote **eContador Master** | Sem tarifa por chamada publicada; eContador Master `[PREÇO NÃO PÚBLICO]` | Não calculável | Alta | conf. |
| Contmatic (Phoenix, G5, Contador Online, Gestão do Escritório) | V3·I-03 | **B a negociar** / F | `[NÃO ENCONTRADO]` (Acessórias e Jettax integram por canal não público) | `[PREÇO NÃO PÚBLICO]` | — | Alta (ausência) | conf. |
| Questor (referência) | V3·I-04 | F | — | `[PREÇO NÃO PÚBLICO]` | — | Baixa | R1 |
| **WhatsApp Cloud API (Meta)** | V3·I-05 | B | Meta Business verificado, número dedicado, **forma de pagamento no Billing Hub**, conta em BRL (obrigatória até 30/06/2027) | **Brasil, desde 01/10/2026** [R2]: marketing **R$ 0,3217**; utilidade **R$ 0,035** (inclusive dentro da janela); autenticação R$ 0,035; **serviço R$ 0,035 após 1.000 grátis por número/mês**; receber é grátis; faixas de volume só acima de 250 mil/mês | Escritório de 300 clientes ≈ **R$ 91/mês** (≈ R$ 0,30 por cliente) | Alta | conf. |
| Provedores (BSP) e multiatendimento | V3·I-06 | B | Contrato | `[NÃO VERIFICADO]` (tarifa Meta é a mesma; BSP soma margem) | — | Baixa | R1 |
| Chatwoot | V3·I-07 | Base/referência | Instância própria | MIT, exceto o diretório `enterprise/` [R2] | Infra rateada | Média | parc. |
| Instagram/Messenger | V3·I-08 | B | App revisado | `[NÃO VERIFICADO]` | R$ 0 | Baixa | R1 |
| Gmail, Calendar, Graph, IMAP | V3·I-09 | A | OAuth | `[NÃO VERIFICADO]` | R$ 0 | Baixa | R1 |
| **Open Finance** | V3·I-10 | B (depois do MVP) | Consentimento do cliente + contrato | **Pluggy Dados a partir de R$ 2.500/mês** (Pagamentos R$ 500), excedente por requisição; **Belvo Launch US$ 1.000/mês** [R2]; Celcoin, Klavi, TecnoSpeed `[PREÇO NÃO PÚBLICO]` | R$ 2.500 ÷ clientes conectados (100 → R$ 25) | Alta (piso) | parc. |
| Arquivos bancários (OFX, CNAB, EDI) | V3·I-11 | F | Nenhuma (o cliente envia pelo app) | Sem custo | R$ 0 | Média | R1 |
| **Agregadores de consultas e certidões** (InfoSimples; eCND da Alterdata pela API; Portal do Cliente Domínio) | V3·I-12 | B | Token + contrato | **InfoSimples** pré-pago, **franquia R$ 100/mês**, base R$ 0,20 (1–500) → R$ 0,05 (>100 mil), adicionais por consulta [R2] | 300 clientes × 4 certidões ≈ R$ 212/mês (≈ R$ 0,71 por cliente) | Alta (preço) | parc. |
| **Assinatura eletrônica** | V3·I-13 | B | Token + contrato | Piso com API [R2]: **ZapSign Equipe R$ 69,90/mês** (20 docs); **Clicksign Start R$ 69**; **D4Sign Profissional R$ 79,90**; gov.br sem API para terceiros | Por evento | Alta (preço) | conf. |
| **Cobrança** (conta do escritório) | V3·I-14 | B | Conta PJ + token | **Asaas R$ 1,59 por Pix/boleto recebido** (R$ 0,79 promocional; conferido na página oficial em 7/11/2026, o R$ 2,15 anterior estava desatualizado), WhatsApp R$ 0,55, NF R$ 0,49; **Efí boleto R$ 3,45, Pix API 1,19%, Pix Automático R$ 3,50**; Inter `[NÃO ENCONTRADO]` [R2] | Custo do escritório: 300 honorários ≈ R$ 645/mês no Asaas | Alta (Asaas, Efí) | parc. |
| Fornecedores de DF-e e cofres (SIEG, Qive, Jettax, Fiscal.io) | V3·I-15 | B (comparação) | A1-cli no fornecedor | **SIEG Control a partir de R$ 223/mês**, Flow R$ 470, Essential R$ 800; A1 por R$ 49–69 [R2]; Qive `[PREÇO NÃO PÚBLICO]` (o R$ 153 da rodada 1 não se confirmou) | — (construir sobre a fonte A) | Alta (SIEG) | parc. |
| ERPs dos clientes (Conta Azul, Omie → Domínio; Bling, Nibo) | V3·I-16 | B por conector | Chave do cliente | `[NÃO VERIFICADO]` | R$ 0 | Média | parc. |
| Concorrentes de gestão (Acessórias com API e MCP, HubStrom, e-Kontroll) | V3·I-17 | referência | — | Só a SIEG publica preço [R2] | — | Alta (funcionalidades) | parc. |

### 5.3 Premissas dos custos por cliente

- **Integra Contador**, tabela oficial, faixa 1 (sem desconto por volume; no modelo "plataforma contratante única" o volume somado cai em faixas menores). **Simples** = PGDAS-D (Declaração R$ 0,40) + DAS (Emissão R$ 0,32) + lista da caixa postal 4×/mês (4 × R$ 0,24) + consulta de pagamento (R$ 0,24) = **R$ 1,92**; com SITFIS mensal (+ R$ 0,64) = **R$ 2,56** (estimativa do V1). **MEI** = DAS-MEI (R$ 0,32) + pagamento (R$ 0,24) = **R$ 0,56**. **Presumido/Real com folha** = consulta DCTFWeb (R$ 0,24) + DARF (R$ 0,32) + SITFIS (R$ 0,64) + caixa postal 4× (R$ 0,96) + 2 consultas de pagamento (R$ 0,48) = **R$ 2,64**. Eventos de atualização (grátis) substituem consultas de rotina. Anuais (DEFIS, DASN-SIMEI) e parcelamentos ficam fora. Quem paga a bilhetagem continua aberto (SERPRO, seção 9).
- **WhatsApp**, 300 clientes e 1 número: 600 modelos de utilidade + 2.000 respostas além das 1.000 grátis = R$ 91/mês. Comunicado de novidade tende a ser marketing (R$ 0,3217; 300 clientes ≈ R$ 96,51 por disparo).
- **Open Finance** só faz sentido com volume: piso de R$ 2.500/mês dividido pelos clientes conectados. MVP com OFX enviado pelo cliente no app.
- APIs de governo nível A continuam sem custo de uso. O A1 de cada cliente (ADN, DF-e, SAE-NFC-e, DTE por agregador) **passa a ser obrigação do cliente no app** (decisão 1); o custo que resta é de segurança do cofre (KMS/HSM `[NÃO VERIFICADO]`) e de contrato (aceite do cliente para uso do A1 por fornecedores como a InfoSimples, que recebe o PKCS#12 a cada chamada).

---

## 6. Robôs e credenciais (C-cert, C-crc, C-captcha)

Reúne V1 §3, V2 §3 e V3 §3 da rodada 2. Regra comum (protocolo §2.3): toda execução em nível C, e toda leitura que **dê ciência**, fica atrás de cartão de aprovação, registra a credencial usada (SOC-010) e quem autorizou; **C-crc nunca roda sem o dono do login**; nenhum robô sobre portal entra sem leitura dos termos de uso e plano de manutenção. **Decisão 3:** sem agente de desktop no plano principal; o que sobra em C fica em **D** (tarefa, checklist, lembrete, anexo pelo app) até haver motivo e parecer jurídico para um robô no servidor.

**Efeito da decisão 1 (A1 do cliente obrigatório no app):** a credencial do cliente deixa de ser bloqueio em todas as linhas em que o obstáculo era "certificado do cliente". Isso destravou por API ou agregador o ADN, a distribuição de DF-e, o SAE-NFC-e de SP e os DTEs de SP, MG, PR e SC. Não destrava o que não tem API (DET, FGTS Digital, PGFN, conta-corrente estadual) nem o que exige o certificado ou o login **do escritório ou do contador** (procuração no DET, DTE do RS, REDESIM). Ao enviar o A1, o cliente precisa aceitar no app o uso por fornecedores (agregador) e a regra de ciência.

| Robô ou acesso | Fichas | Nível (R2) | Credencial | Risco jurídico | Risco operacional | Caminho recomendado | R2 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| e-CAC por robô para serviço que o Integra cobre | FIS-005, FIS-006 e outras federais | **não fazer** | e-CNPJ + procuração | A própria documentação do Integra diz que a API existe para substituir scraping | Bloqueio, quebra | Integra Contador (A$) | conf. |
| Caixa postal federal: **ler o detalhe dá ciência** | FIS-005, FIS-008, FIS-038 | A$ com aprovação | e-CNPJ do escritório + termo | Art. 23, § 2º, III, do Decreto 70.235/1972 | — | Monitorar por eventos (grátis) e lista/indicador (Consulta); abrir só com aprovação | conf. |
| PER/DCOMP, DIRBI, e-BEF | FIS-042, FIS-022, SOC-006 | D | Certificado + procuração | Fora do catálogo do Integra | — | Checklist + rascunho pela IA (⚑ em FIS-022 e FIS-042) | conf. (ausência) |
| FGTS Digital: emitir GFD | DP-018, DP-029, DP-044, DP-013 | D (C-cert só com parecer) | e-CNPJ do escritório + procuração SPE | Sem API pública | Instabilidade | Analista emite; plataforma lê o PDF e entrega pelo app; perguntar ao MTE pela API de parceiros | conf. |
| DET (leitura) | DP-040, DP-041 | C-cert (só listar) / D | e-CNPJ + perfil de procurador (o A1 do cliente não resolve) | Abrir dá ciência; tácita em 15 dias | Sem API | Nunca abrir sem aprovação | parc. |
| Validar Autorizações de Acesso recebidas | SOC-011, SOC-012 | D | gov.br prata/ouro ou certificado do escritório | Prazo de 30 dias, senão cancela | — | Lembrete + conferência pelo Integra-Procurações | conf. |
| PGFN / Regularize | FIS-034, FIS-035 | D | gov.br ou certificado | — | Sem API | Checklist; editais públicos | R1 |
| Apuração assistida da CBS | CON-032 | D | Certificado | Piloto | Sem API | Reavaliar em 2027 | R1 |
| Qualificação cadastral em lote | DP-004 | D | eSocial | — | — | Consulta CPF SERPRO (R$ 0,6591 → 0,017) se o volume justificar | parc. |
| **DTEs estaduais SP, MG, PR, SC** | FIS-026, FIS-038 | **B** (era C-cert) | **A1-cli (app)** enviado ao agregador | Ciência no dia da consulta do teor, tácita em 10 dias; o agregador tem `ignora_nao_lidas`, mas não diz se listar dá ciência | Agregador independente dos órgãos | InfoSimples, só lista; abrir com aprovação; perguntar ao fornecedor sobre ciência e LGPD | conf. |
| DTE do RS | FIS-026 | **C-crc** | Procuração eletrônica do CNPJ ao contabilista (vínculo no CGCTE não basta) | Leitura num portal vale no outro | Sem agregador | Só com aprovação do contador procurador; pedir API à Receita/RS | conf. |
| DTEC SC por senha do SAT | FIS-026 | C-crc (alternativa) | Senha do SAT com termo de responsabilidade | — | — | Preferir agregador com A1 | conf. |
| Conta-corrente estadual | FIS-027, FIS-037, SOC-031 | B (certidão sentinela); C-cert no SIDEB SP | A1-cli ou poderes no CADESP | — | Robô por UF | Certidão por agregador como alerta; robô só onde houver volume | parc. |
| Guias estaduais e de ISS | FIS-025, FIS-028, NFE-025, NFE-026 | **F / API do core** (era C-cert) | Acesso ao core | — | No RS depende da EFD | Guia vem do core (decisão 2) | parc. |
| DEC municipais | FIS-029 | **B** (DEC paulistano); C-cert/D (Curitiba e demais) | A1-cli (app) | Ciência tácita em 10 dias (SP, Curitiba) | Um portal por município | Agregador em SP; lembrete nos demais | parc. |
| Captura de NFS-e fora do ADN | NFE-008 | **D** (upload) | — | — | Só Cantagalo (PR) e Cristal do Sul (RS) não ativos nas cinco UFs | Upload + extração do PDF | conf. |
| Vínculo do contabilista (REDESIM "Meus Clientes") | SOC-005, SOC-024 | C-crc | Login gov.br do contador | Ato pessoal | — | Checklist; consulta federal pelo PNRCONTADOR (A$) | parc. |
| REDESIM e Juntas: andamento | SOC-027, SOC-030 | **B** na viabilidade da JUCESP (era C-captcha); C-captcha/C-crc/D no resto | Protocolo + login ou certificado | — | Sem API oficial | Agregador em SP; lembrete diário nas demais | parc. |
| gov.br pessoal | SOC-014, DP-062 | C-crc | Login com 2FA | Termos pessoais | 2FA | Nunca automático | R1 |
| Certidões com CAPTCHA | FIS-036 | B (fallback C-captcha) | Nenhuma | Risco dos termos fica com o agregador só se o contrato disser | Quebra | InfoSimples; humano como reserva | conf. |
| Sintegra/CCC | SOC-003, FIS-030, NFE-028 | B | Nenhuma / A1-cli (CCC) | — | — | Agregador com preço (era C-captcha) | parc. |
| Declaração de Não Ocorrência (CFC) | SOC-019, CTB-049 | C-crc / D | Login do contador | Ato pessoal | — | Lembrete + checklist | R1 |
| Assinatura qualificada (Junta, cartório) | SOC-041, CTB-037 | C-cert / D | ICP do signatário | — | — | gov.br ou ICP com upload | R1 |
| **Tarefas e tempo dos cores** | GES-048, FIS-001, FIS-003, FIS-047 | **B** Alterdata (ePlugin); **B a negociar** Domínio Processos e Contmatic (era E / agente de desktop) | Token do escritório; contrato com TR e Contmatic | Uso do token em nome do escritório (contrato) | Histórico da Alterdata sem início nem horas | API negociada com cada fornecedor (decisão 2); agente de desktop só se algum recusar (decisão 3) | conf. |
| Ler documentos do Portal do Cliente Onvio com usuário e senha | GES-039, GES-040 | C-crc | Usuário Onvio de acesso total + MFA (como a Omie.G-Click faz) | Credencial de usuário em sistema de terceiro | — | Evitar; pedir API à TR | conf. |
| Operar a tela do core (RPA) | NFE-033, CTB-017, DP-011, NFE-035 | C-crc | Login do analista | Licença do core | Quebra com versão | Desnecessário para Domínio (API de entrada) e Alterdata (ePlugin); só Contmatic, com aprovação | parc. |
| Ler o banco local do core | GES-048, CTB-019, NFE-035 | C-crc / risco contratual | Acesso ao banco | Licença | Quebra com versão | Evitar | R1 |
| Portais de adquirentes, benefícios e ponto | CTB-013, DP-010, DP-051 | C-cert / C-crc / F | Login do cliente | Termos | Um portal por fornecedor | Arquivo (EDI, AFD) pelo app | R1 |
| Internet banking do cliente | CTB-008, CTB-012, FIS-032 | **E (não fazer)** | Senha do cliente | Termos do banco, fraude | — | OFX pelo app (F) ou Open Finance (B) | R1 |
| WhatsApp não oficial; grupos com mais de 8 pessoas | GES-023, GES-037 | **E (vedado)** | — | Termos da Meta | Banimento | Cloud API; Groups API só com OBA e até 8 participantes | conf. |

**Fichas com nível C como nível principal na triagem (rodada 2):** 4 C-cert (SOC-007, DP-018, DP-040, CON-032), 3 C-crc (SOC-005, DP-062, CTB-032*), 0 C-captcha (eram 11, 3 e 2). As demais acima têm C como alternativa ou parte da ficha.

---

## 7. Correções ao Plano da Plataforma (seções 3 e 4)

O que o Plano diz, o que a pesquisa encontrou e a fonte. Na rodada 1 as fontes foram lidas pelo trecho do buscador (confiança média). **Rodada 2:** as linhas 1, 2, 4, 6 a 11, 15 a 24, 33 e 45 foram reescritas com fonte oficial aberta em 06/11/2026 (marca [R2] ou o código R2-xx do verificador); as decisões do fundador entram na seção 7.3.

### 7.1 Seção 3 (APIs e fontes)

| # | Plano diz | Pesquisa encontrou | Fonte |
| --- | --- | --- | --- |
| 1 | 3.1 Integra Contador: "procuração eletrônica de cada cliente no e-CAC"; preço "[A CONFIRMAR]" | **Rodada 2 (oficial):** catálogo de 15/10/2026 com 119 linhas; **tabela da Loja SERPRO**: Consulta R$ 0,24 → 0,06, Emissão R$ 0,32 → 0,08, Declaração R$ 0,40 → 0,12, pós-pago, sem adesão; eventos de atualização gratuitos (lote de 1.000 contribuintes, 1.000 requisições/dia). Software house usa **termo de autorização XML assinado pelo escritório** (A1 ou A3) e recebe token diário; a procuração virou **Autorizações de Acesso**, que só vale depois do aceite do escritório em **até 30 dias**. Os indícios de R$ 0,75 a R$ 0,96 ficam superados | V1·I-01, I-13 [R2-02 a R2-12, R2-22, R2-23] |
| 2 | 3.1 Distribuição de DF-e: "usa o certificado do cliente"; 4.3 notas de saída "via autXML" ou distribuição | **Confirmado na NT 2014.002 v1.40 (rodada 2):** autenticação pelo certificado do próprio ator (CNPJ base); **notas emitidas não são distribuídas ao emitente** (rejeição 641); `autXML` com o CNPJ do escritório entrega a nota integral ao escritório; janela de 90 dias; **NSU só a partir do primeiro acesso, sem retroativo**, e 60 dias sem consulta interrompem; 20 consultas/h por chave. Consequência: o app pede o A1 no primeiro dia e liga o coletor no mesmo dia; pedir ao cliente o CNPJ do escritório no `autXML` | V2·I-01 [R2-NT]; C-01, C-11 |
| 3 | 3.1 Manifestação do destinatário, sem prazo | Prazo da manifestação conclusiva caiu de **180 para 90 dias** (Ajuste SINIEF 14/26, NT 2020.001 v1.60); eventos conclusivos exigem aprovação humana | D3 achado 1 [S3]; V2·I-02 |
| 4 | 3.1 NFS-e Nacional como nível A; "[A CONFIRMAR a cobertura]" | **Rodada 2:** API do ADN conferida (URLs de produção, `GET /DFe/{NSU}`), **A1 do contribuinte** (mesmo CNPJ raiz); planilha oficial de 28/09/2026: **5.543 municípios ativos no Ambiente Nacional, incluindo as cinco capitais**; nas cinco UFs só Cantagalo (PR) e Cristal do Sul (RS) não ativos. Captura vira **A** padrão; integrador fica para emissão e exceções. Falta o teste de completude por capital | V1·I-17; V2·I-12 a I-16 [R2-ADN]; C-02 |
| 5 | 3.1 Dados abertos do CNPJ como base de cadastro | Servem, mas não trazem Lucro Presumido/Real e mascaram parte do CPF dos sócios `[CP]`; o regime continua dado informado e versionado pelo escritório | V1 SOC-001, SOC-002, SOC-004 |
| 6 | 3.1 Calculadora da reforma: "conferir se há API pública [A CONFIRMAR]" | **Rodada 2:** aplicação oficial em `piloto-cbs.tributos.gov.br` (versão 1.6.2, base V0066 de 28/10/2026) e **versão offline em Docker/JAR** com APIs do Regime Regular, Split Payment Simplificado e Simples Nacional: rodar no servidor da plataforma como motor de conferência do M3; termos de uso `[NÃO ENCONTRADO]`. Apuração assistida da CBS segue sem API | V1·I-19 [R2-27]; I-20 |
| 7 | 3.2 Certidões: agregador; "situação fiscal federal vem do Integra" | Confirmado com preço: InfoSimples (franquia R$ 100/mês; R$ 0,20 → 0,05 + adicional R$ 0,04–0,08). SITFIS no catálogo (2 chamadas de Emissão). **SP mudou: Certidão Única (Sefaz + PGE) desde 14/10/2026, validade 90 dias**; o kit segue por órgão. DCTFWeb em andamento bloqueia a CND | V2·I-18, C-10 [R2-SP-CND]; V1·I-01; V3·I-12 |
| 8 | 3.2 Sefaz: "quase sempre portal com certificado" (C) | Sem API oficial de DTE, conta-corrente ou guia nas cinco UFs, **mas há agregador com API para os DTEs de SP, MG, PR e SC** usando o A1 do cliente (passa a B). **RS corrigido:** o vínculo no CGCTE não basta; o cliente outorga procuração eletrônica ao contabilista (C-crc). Ciência tácita em 10 dias nas cinco UFs. Guias vêm do core (decisão 2) | V2·I-07 a I-11, I-23; C-04, C-12 |
| 9 | 3.2 Juntas e REDESIM: "automação só para consultar andamento" | API oficial segue não encontrada. **Novo:** em SP o status da consulta de viabilidade REDESIM/JUCESP e fichas/documentos da JUCESP saem por agregador (B); demais Juntas: D ou C-captcha | V2·I-19, I-20; C-06 |
| 10 | 3.2 FGTS Digital: "[A CONFIRMAR]" API | **Confirmado em fonte oficial: não há API pública** (página de documentação técnica traz só manual v1.70, leiaute de remunerações rescisórias e manual do SPE). Aviso de jul/2026 cita API para "sistemas parceiros": perguntar ao MTE. Acesso do escritório pelo SPE | V1·I-08 [R2-19 a R2-21] |
| 11 | 3.2 DET: "[A CONFIRMAR]" integração; "lembrete de leitura" | API segue não encontrada; ciência no dia da consulta do teor ou após 15 dias (fonte secundária). Robô só lista, abrir com aprovação; o A1 do cliente não resolve (o acesso é por perfil de procurador do escritório) | V1·I-09 |
| 12 | 3.2 Mediador: "coletor existente" | Sem API; consulta pública por página. O coletor precisa ser conferido no repositório | V1·I-10; D4 lacuna 4 |
| 13 | (ausente) | Fontes federais novas sem API: **DTE federal compulsório para PJ desde 2026**, **e-BEF** (beneficiário final, IN RFB 2.290/2025), **Domicílio Judicial Eletrônico** (CNJ), PGFN/Regularize, DIRBI, PER/DCOMP | D1 achados 2, 3; D2 achado 6; V1·I-15, I-25 |
| 14 | 3.1/3.3 NFC-e não citada | **SAE-NFC-e da Sefaz-SP** dá listagem e download de NFC-e por webservice (nível A em SP); sem equivalente nas outras UFs | D3 achado 4 [S14]; V2·I-05 |
| 15 | 3.3 WhatsApp: "conferir tabela [A CONFIRMAR]"; política de IA "desde janeiro de 2026" | **Tabela oficial em BRL (desde 01/10/2026):** marketing R$ 0,3217; utilidade, autenticação e serviço R$ 0,035; **serviço volta a ser cobrado após 1.000 grátis por número/mês** e utilidade dentro da janela também passa a ser cobrada; forma de pagamento obrigatória; conta em BRL até 30/06/2027. Groups API só para OBA, até 8 participantes. **CADE suspendeu os novos termos de IA** (Inquérito 08700.012397/2025-63, multa diária de R$ 250 mil mantida em 23/04/2026); IA do escritório para os próprios clientes é cobrada como serviço. Texto dos termos não aberto | V3·I-05 [R2] |
| 16 | 3.3 Open Finance "via agregadores"; "OFX é o caminho imediato" | Confirmado o OFX no MVP (pelo app do cliente). Pisos oficiais: **Pluggy Dados a partir de R$ 2.500/mês**, Belvo Launch US$ 1.000/mês; consentimento que vence vira tarefa; o core já concilia OFX | V3·I-10 [R2]; D5 achados 10, 11 |
| 17 | 3.3 Cobrança: Asaas, Inter, Efí | Preços oficiais: **Asaas R$ 1,59 por Pix/boleto recebido (R$ 0,79 promocional, conferido em 7/11/2026)**, NF R$ 0,49, notificação WhatsApp R$ 0,55 (a régua própria custa R$ 0,035); **Efí boleto R$ 3,45, Pix Automático R$ 3,50**; Inter sem tabela oficial encontrada | V3·I-14 [R2] |
| 18 | 3.3 Assinatura: Clicksign, D4Sign, ZapSign | Confirmado como B, com piso de API: ZapSign Equipe R$ 69,90/mês, Clicksign Start R$ 69, D4Sign Profissional R$ 79,90 (20 docs/mês). Assinador gov.br sem API para terceiros; atos de Junta podem exigir ICP | V3·I-13 [R2] |
| 19 | 3.3 Chatwoot como base | Licença conferida: MIT, exceto o diretório `enterprise/`; listar o que fica lá (SLA, auditoria, CSAT, IA) antes de adotar | V3·I-07 [R2] |
| 20 | 3.3 Captura comercial (implícita) | Captura de NF-e, CT-e e NFS-e (ADN) é oficial e grátis: **construir**. Comparação: SIEG a partir de R$ 223/mês; Focus Growth R$ 572/mês. Integrador só para emissão e para os dois municípios fora do ADN nas cinco UFs | V3·I-15; V2·I-17 [R2] |
| 21 | 3.4 Domínio: "Domínio Processos / Onvio Processos e o Onvio Messenger"; API "[A CONFIRMAR]" | **Rodada 2:** o Domínio tem **API de entrada para ERP homologado** (NF-e, NFC-e, NFS-e, CF-e, CT-e, pagamentos/recebimentos e Rubricas da folha), com cadastro de parceiro e **chave por empresa** gerada no Onvio Gestão (menu API); fila de 60 dias. **Domínio Processos** é módulo pago, conclui tarefas a partir das rotinas e mede tempo de produção, mas **não tem API de saída pública** (api.onvio.com.br só cobre status de integração). Messenger e Portal do Cliente existem. A relação de marca Gestta ↔ Domínio Processos não foi confirmada (site do Gestta 403). A TR é concorrente direta | V3·I-01 [R2] |
| 22 | 3.4 e 5.1: API do core como fonte de timesheet | **Revisto (decisão 2):** tarefas e status vêm dos módulos de processos dos cores por API negociada. **Alterdata:** `GET /api/v1/integracao/historico-tarefas` (nome, responsável, status, prazo de entrega, prazo legal, conclusão, empresa, departamento; **sem início nem horas**). **Domínio Processos:** B a negociar. **Contmatic:** nada público. O tempo vem de prazos e conclusões dos cores + eventos da própria plataforma (GES-047) + revisão diária (GES-051); **agente de desktop só como alternativa** para core sem API (decisão 3) | V3·I-01 a I-03, §3 [R2] |
| 23 | 3.4 Alterdata: "abertura de API incerta" | **API pública confirmada (ePlugin):** token Bearer do escritório, exige pacote **eContador Master** (preço não público); lê tarefas, documentos, CNDs, empresas, usuários, funcionários; grava admissão, férias, rescisão, movimentos da folha, atendimentos e lançamentos contábeis; recalcula DAS vencido (1 por empresa/dia). Sem upload de documento. Contato técnico api_econtador@alterdata.com.br | V3·I-02 [R2] |
| 24 | 3.4 Contmatic: integração por arquivos | **Confirmado: nenhuma API ou leiaute público.** Integra com Acessórias, Jettax, Busca Legal e Contbank por canal não documentado; módulo Gestão do Escritório (tarefas, produtividade) nos planos Avançado e Elite. Negociar o mesmo acesso; F enquanto isso | V3·I-03 [R2] |

### 7.2 Seção 4 (inventário por aba)

| # | Aba (seção do Plano) | Plano diz | Pesquisa corrigiu ou acrescentou | Fonte |
| --- | --- | --- | --- | --- |
| 25 | 4.1 Clientes | Procurações eletrônicas (P1) | Fluxo novo de validação pelo escritório (SOC-011/012); acrescentar **e-BEF** (30 dias e atualização anual), **Domicílio Judicial Eletrônico**, **PLD** (Res. CFC 1.721/2024, declaração anual até 31/01) e vínculo do contabilista nas inscrições (Sefaz-SP notificou 15,4 mil contribuintes sem contabilista) | D1 achados 1–5 [F47][F48] |
| 26 | 4.1 Clientes | Abertura com regras de enquadramento fixas (implícito) | Opção pelo Simples na abertura mudou (Res. CGSN 183/2025 e 190/2026): o fluxo lê a regra vigente na base temporal | D1 achado 4 |
| 27 | 4.2 Obrigações | Calendário derivado da base legal (P1) | Mantido e reforçado: as regras mudaram muito em 2025–2026. **Opção pelo Simples saiu de janeiro** (set–out/2026 para 2027; janeiro só SIMEI); **opção semestral IBS/CBS** (Res. CGSN 186/2026); **DCTFWeb no último dia útil** do mês seguinte (IN 2.248/2025); **multa do PGDAS-D e da DEFIS desde 01/01/2026**; ECD em junho e ECF em julho | D2 achados 1–5; D5 achados 1, 2 |
| 28 | 4.3 Notas | Notas de saída "via autXML" ou distribuição | Ver correção 2: distribuição não traz saídas | V2 C-01 |
| 29 | 4.3 Notas | Notas com IBS/CBS como P2 | **IBS/CBS sem trava de rejeição** (NF-e: "implementação futura"; NFS-e: sem rejeição até 31/12/2026) e dispensa de recolhimento em 2026 condicionada às obrigações acessórias (art. 348 da LC 214): a conferência vira obrigação do escritório. Triagem pôs FIS-045 e NFE-030 em **P1** | D3 achado 5 [S8][S9]; seção 2 |
| 30 | 4.3 Notas | Sem política de guarda | Guarda de XML: **132 meses** pelo Ajuste SINIEF 2/2025, com fontes dizendo que o contribuinte segue em 5 anos (conflito aberto) | D3 achado 6 [S13] |
| 31 | 4.3 Notas | (ausente) | **NF-e obrigatória para todos os produtores rurais em PR, RS e SC** desde 05/01/2026 | D3 achado 7 [S23] |
| 32 | 4.4 Fiscal | Malhas e intimações P2; caixa postal P1 | Caixa postal confirmada como a maior nota de toda a triagem (FIS-005). **DTE federal compulsório** e ciência tácita de 15 dias (DTE geral) × 45 dias (DTE-SN), conflito aberto. **Termo de Exclusão do Simples: regularização em 90 dias** (era 30; LC 216/2025) | D2 achados 4, 6 |
| 33 | 4.4 Fiscal | Pendências estaduais P3 "robôs por UF (C), só onde há volume" | A leitura dos **DTEs estaduais** é **P1 (FIS-026, nota 375 na rodada 2)** e passou a **B** por agregador em SP, MG, PR e SC com o A1 do cliente; RS fica C-crc. DEC paulistano também B (FIS-029, P1). Conta-corrente: certidão como sentinela (B) | Seção 2; V2·I-23 |
| 34 | 4.4 Fiscal | Recuperação de créditos P2 | Prazo duro: créditos de PIS/Cofins têm de estar **registrados na EFD-Contribuições até 31/12/2026** para uso após a extinção; saldo credor de ICMS com regra na LC 227/2026 | D6 achado 5 [S11][S12] |
| 35 | 4.5 DP | eSocial e FGTS Digital P2 "[A CONFIRMAR]" | FGTS sem API (correção 10). Rotinas novas: **conferência do Crédito do Trabalhador** (Lei 15.179/2025), **NR-1 psicossocial** (vigente desde 26/05/2026), **Relatório de Transparência Salarial** (dois ciclos), **IRRF com redutor** (Lei 15.270/2025), **licença-paternidade em 2027** (Lei 15.371/2026), **multas do eSocial reestruturadas** (Portaria MTE 1.131/2025), **DIRF extinta** (informe de rendimentos continua), feriados no comércio dependentes de CCT (conflito de portarias). DP-038 (pendências do eSocial) saiu P1 | D4 achados 1–10, 13 |
| 36 | 4.6 Contábil | Distribuição de lucros e pró-labore **P3**, "cálculo do limite, simulações" | Virou **controle mensal**: retenção de **10% sobre lucros acima de R$ 50 mil/mês por sócio e fonte** (Lei 15.270/2025, desde 01/01/2026, na EFD-Reinf), **IRPFM** acima de R$ 600 mil/ano, **estoque de lucros até 2025** com pagamento até 2028, **LC 224/2025** no Presumido e no JCP; tese do Simples controversa (registrar por cliente). Triagem pôs CTB-033 e CTB-034 em **P1** | D5 achados 3–6 [T3][T4][T15] |
| 37 | 4.6 Contábil | ECD/ECF P3, só status | Prazos corrigidos (ECD último dia útil de junho; ECF de julho); multa da ECF com fontes divergentes; **carta de responsabilidade** anual (Res. CFC 987/2003); **aprovação de contas da LTDA até 30/04**; **contabilização de CBS/IBS em 2026** sem consenso (rotina nova) | D5 achados 1, 2, 7–9 |
| 38 | 4.6 Contábil | Extratos via Open Finance (P2) | Ver correção 16; o core já concilia OFX | D5 achado 11 |
| 39 | 4.7 Consultoria | Simples "por fora" **P2** | Rotina **semestral com prazo e cancelamento** (janela até 30/10/2026; próxima citada para 1–31/03/2027, fonte única). D6 sugere P1. Na triagem mecânica ficou P3 com ⚑ (viabilidade D): **checklist com lembrete agora**, simulação (CON-016, P1) como apoio | D6 achado 1 [S2–S4]; seção 2 |
| 40 | 4.7 Consultoria | Simulação da reforma P2 | Subiu a **P1** (CON-016). A CBS de 2027 já tem alíquota de referência calculada pelo TCU (**11,3468%**, 28/10/2026), sujeita a resolução do Senado; IS sem alíquotas; **LC 227/2026** em vigor; simulações precisam de tabela versionada com estado "provisório" | D6 achados 2, 7, 8 [S1][S15][S17] |
| 41 | 4.7 Consultoria | Planejamento anual Simples × Presumido × Real | Incluir **LC 224/2025** e **Lei 15.270/2025**, que o Plano não cita | D6 achado 4 [S7][S8] |
| 42 | 4.7 Consultoria | Split payment P3 | Confirmado P3 na parte operacional (facultativo e só B2B em 2027), mas a análise de caixa e de fornecedores (crédito condicionado à extinção do débito) já é consultoria vendável | D6 achado 6 [S6][S10] |
| 43 | 4.8 Gestão | NFS-e dos honorários P2 via NFS-e Nacional ou integrador | Se o escritório é do Simples, já está no **Emissor Nacional** em 2026; tratar **retenções na fonte** sobre os honorários (IRRF, CSRF) `[NÃO VERIFICADO]` | D7 achados 4, 8 |
| 44 | 4.8 Gestão | Cobrança de honorários P1 com régua | Acrescentar **limite ético codificado**: não condicionar entrega de documento a pagamento (NBC PG 01 `[NÃO VERIFICADO]`; distrato pela Res. CFC 1.590/2020) | D7 achado 5 |
| 45 | 4.8 e 5 Timesheet | Rentabilidade por cliente P2 | Diferencial confirmado na rodada 2 como **consolidar tarefas e tempo de vários cores**: os concorrentes ficam presos a um core (e-Kontroll mede tempo sobre o Domínio; Domínio Processos só no Domínio). O timesheet nasce **subordinado ao ponto oficial**; agente de desktop deixa de ser caminho principal (decisão 3) | D7 achados 6, 9; V3·I-17 [R2] |
| 46 | 8.1 Triagem | Viabilidade "A (5), B (3), C (1)" | A escala aplicada aqui é a do protocolo (A/A$ 5, F 4, B 3, C 1 a 2, D 1, E 0) mais "Próprio" 5; o Plano deve passar a usar a mesma escala | Protocolo §2.3; seção 2 |

### 7.3 Correções novas da rodada 2 (decisões do fundador e fontes abertas em 6/11/2026)

| # | Seção do Plano | O que muda | Fonte |
| --- | --- | --- | --- |
| 47 | 4.1 Clientes e 4.8 Atendimento (app/portal do cliente) | O app do cliente passa a ser peça central: espelha os dados do cliente, recebe os documentos dele (A1, OFX, notas fora do ADN, atestados, variáveis) e entrega os do escritório com protocolo. **A1 obrigatório no onboarding**, com aceite para uso por fornecedores e regra de ciência; autXML com o CNPJ do escritório como complemento; checklist de procurações estaduais por UF (DEC SP, SIARE MG, Receita/PR, DTEC SC, DTE RS) e guia de Autorizações de Acesso da RFB | Decisão 1; V2 §5 itens do app; V1 I-13 |
| 48 | 3.1 / 6 (cofre) | Cofre guarda o A1 de cada cliente e o e-CNPJ do escritório; registrar cada uso (SOC-010). Hipótese a levar ao SERPRO: o próprio cliente assinar o termo do Integra com o A1 do cofre (modelo D), o que tiraria a procuração do caminho crítico | V1·I-01 modelo D `[INFERÊNCIA]` |
| 49 | 3.4 (cores) | Integração com cores vira **frente comercial**: parceria ou pagamento com cada fornecedor (TR, Alterdata, Contmatic), com lista única de pedidos (seção 9). Entrada: API de entrada do Domínio e ePlugin. Saída de tarefas: ePlugin já; Domínio e Contmatic a negociar | Decisão 2; V3 §4.1 |
| 50 | 5 (timesheet) | GES-048 (importar tarefas dos cores) sobe a **P1 habilitador**; GES-049 (agente de desktop) sai do plano principal | Decisão 3; seção 2 |
| 51 | 3.1 / 4.4 (caixas postais) | Regra única de ciência: ler o detalhe da caixa postal federal **dá ciência**; nos DTEs estaduais a ciência ocorre na consulta do teor (tácita em 10 dias). A ferramenta lista, alerta e só abre com aprovação | V1·I-01 [R2-08]; V2·I-23 |
| 52 | 8.2 (custos) | Custos com preço oficial: Integra ~R$ 1,92 a R$ 2,64 por cliente/mês na faixa 1; WhatsApp ~R$ 0,30 por cliente/mês; certidões ~R$ 0,71; DTE por agregador ~R$ 0,80; Open Finance só com volume (piso R$ 2.500/mês) | Seção 5 |

---

## 8. Lacunas e perguntas abertas

### 8.1 Lacunas de método

1. **Rodada 2 abriu fontes oficiais** para quase todas as integrações decisivas, mas 60 fichas verificadas seguem com o texto da rodada 1 (marca "R1") e 102 fichas não têm verificação (nível `*`). Hosts que não responderam na sessão: `servicodados.ibge.gov.br`, `adn.nfse.gov.br` (TLS; URLs conferidas na página oficial), `det.sit.trabalho.gov.br`, `www.nfe.fazenda.gov.br` (laço de redirecionamento; NT lida em cópia integral), `smartsampa.prefeitura.sp.gov.br`, `www.gestta.com.br`, `api.onvio.com.br`, `www.whatsapp.com/legal`.
2. **Todos os tempos são `[ESTIMATIVA]`.** A nota de Dor continua proxy; só o levantamento com os contadores ou o timesheet dá a dor real.
3. **Escala de viabilidade:** F (4) pontua acima de B (3), então confirmar uma API por contrato baixa a nota (NFE-033, DP-011, CTB-017). Os contadores podem propor rever a escala; a regra não foi mudada nesta rodada para manter a comparação.
4. **Nível por ficha × nível por parte:** fichas com parte federal, estadual e de core (FIS-001, FIS-003, FIS-047, FIS-026) têm um nível só na triagem; o desenho da ferramenta deve olhar "outros níveis".

### 8.2 Lacunas que mudam decisão

| Lacuna | Decide | Quem responde | Situação na rodada 2 |
| --- | --- | --- | --- |
| Tabela de preços do Integra | Custo por cliente | SERPRO | **Fechada** (tabela oficial); aberto: faixa mensal? Monitorar/Apoiar grátis? |
| Modelo de contrato para plataforma que atende vários escritórios; termo assinado pelo próprio cliente com o A1 do cofre | Arquitetura multiescritório; se a procuração sai do caminho crítico | SERPRO | **Aberta** (parte técnica fechada: termo, token, cache 304) |
| Catálogo do Integra | Quantas fichas federais ficam em A$ | SERPRO | **Fechada**: SITFIS, DEFIS, DASN-SIMEI, PAGTOWEB, Sicalc, parcelamentos SN/MEI, PNRCONTADOR e e-Processo estão; e-BEF, PER/DCOMP, DIRBI, opção IBS/CBS e PGFN não |
| Ler a caixa postal registra ciência? | Desenho de FIS-005, FIS-026, FIS-029, DP-040 | SERPRO, Sefaz, agregador | **Fechada no federal** (o detalhe dá ciência) e nas regras estaduais (consulta do teor); **aberta** para a listagem pelo agregador |
| Adesão das capitais ao ADN | Captura municipal grátis | CGNFS-e | **Fechada** (todas ativas); **aberta** a completude e a defasagem por capital (teste com A1 real) |
| Procuração permite ao escritório consultar DF-e e ADN com o próprio e-CNPJ? | Guardar ou não o A1 de cada cliente | RFB, Sefaz, CGNFS-e | **Resolvida por decisão**: não permite hoje (NT v1.40; manual do ADN); o cliente envia o A1 no app |
| API de saída do Domínio Processos e do Portal do Cliente | Tarefas e documentos do maior core | Thomson Reuters | **Aberta** (entrada confirmada; saída não pública) |
| Preço do eContador Master e evolução do ePlugin (início, horas, upload, webhooks) | Custo e qualidade do timesheet nos clientes Alterdata | Alterdata | **Aberta** |
| Acesso técnico da Contmatic | Terceiro core | Contmatic | **Aberta** (nada público) |
| Tabela do WhatsApp e política de IA | Custo do atendimento | Meta | **Fechada** para preço; **aberta** para o texto dos termos e o desfecho do inquérito do CADE |
| Preço real de Open Finance | Open Finance no P2 ou só OFX | Pluggy, Belvo | **Fechada** para o piso (R$ 2.500/mês; US$ 1.000/mês); aberto o volume incluso |
| Fornecedor B com API de DTE | Comprar ou construir robôs estaduais | InfoSimples, Dootax, Jettax, Makro | **Fechada** para SP, MG, PR, SC (InfoSimples); RS sem; ciência ao listar e LGPD do PKCS#12 abertas |
| Calculadora da RFB | M3 da reforma | RFB | **Fechada** para endereço e versão offline; **aberta** a licença |
| Endereço novo dos dados abertos do CNPJ | Base do cadastro sem custo | RFB | **Nova**, aberta |
| API do FGTS Digital para "sistemas parceiros" | DP-018, DP-029, DP-044 saírem de D | MTE | **Nova**, aberta |

### 8.3 Itens `[NÃO VERIFICADO]` de norma e prazo (conferir na base legal antes de virar regra)

- Datas da opção pelo Simples 2027 (30/09 × 15/10) e da desistência IBS/CBS; janela de março/2027 (fonte única) (D2, D6).
- Ciência tácita: 15 dias (DTE geral) × 45 dias (DTE-SN) seguem abertos; **DTEs estaduais conferidos na rodada 2: 10 dias em SP, MG, PR, SC e RS**; municipais além de Curitiba e São Paulo abertos (D2, V2).
- Multa mínima do PGDAS-D (R$ 50 × R$ 200); prazo da DCTFWeb (há fonte citando dia 15) (D2).
- Autorizações de Acesso: nome, aceite e prazo de 30 dias **conferidos na rodada 2**; norma, limite de 20 por CPF e validade de 5 anos seguem abertos (D1, V1).
- e-BEF: dispensas para ME/EPP e IN RFB 2.333/2026 (D1).
- Guarda de XML 5 × 11 anos (Ajuste SINIEF 2/2025) (D3).
- Datas do Simples no Emissor Nacional (Res. CGSN 189 × 191/2026) (D3, D7).
- Lei 15.270/2025: alcance no Simples e base da retenção (total × excedente); referendo das ADIs 7.912/7.914 (D5, D6).
- LC 224/2025: liminares, ADIs 7.920/7.936 e IRRF de 17,5% sobre JCP (D5, D6).
- Multa da ECF por regime (D5); contabilização de CBS/IBS em 2026 (Decreto 12.955/2026, Res. CGIBS 6/2026) (D5).
- Feriados no comércio: Portaria MTE 3.665/2023 × 1.316/2026 (D4); seguro-desemprego pelo Empregador Web em 2026 (D4).
- Split payment: obrigatoriedade B2B em 2027 × 2028 (D6); Imposto Seletivo sem alíquotas (D6).
- Retenções sobre honorários (IRRF 1,5%, CSRF 4,65%), NBC PG 01 e retenção de documentos, LGPD do monitoramento (D7).
- Validade de certificados A3 (2, 3 ou 5 anos) (D1).

### 8.4 Perguntas a fornecedores

A lista completa, com canal e o que pedir, está na **seção 9 (Agenda de contatos)**. Respondidas nesta rodada pela documentação pública: preços do WhatsApp, InfoSimples, Pluggy, Belvo, Asaas, Efí, ZapSign, D4Sign, Clicksign, SIEG, Focus NFe e NFE.io; existência da API ePlugin (Alterdata) e da API de entrada do Domínio; ausência de API pública na Contmatic. Seguem abertas as perguntas que só o fornecedor responde: contratos, preços sob consulta, APIs não públicas, comportamento de ciência e tratamento do A1.

### 8.5 Perguntas a órgãos

1. **SERPRO** (técnico e comercial): ver seção 9.
2. **RFB:** norma, limite por outorgado e validade das Autorizações de Acesso; endereço novo dos dados abertos do CNPJ; licença da Calculadora offline para uso em servidor de terceiro.
3. **MTE:** API do FGTS Digital para "sistemas parceiros" e como se habilitar (acordo de cooperação técnica?); API do DET.
4. **CGNFS-e:** significado de "AderenteEmissorNacional" e "AderenteMAN" nas capitais; completude e defasagem das notas dos sistemas próprios das capitais no ADN; limite de requisições; prazo para o acesso por procuração pedido pela FENACON.
5. **Sefaz SP, MG, PR, SC, RS:** API ou credenciamento para DTE; listar sem abrir dá ciência?; limite do SAE-NFC-e (SP); equivalente ao SAE nas outras UFs; Receita/RS: serviço para software ler o DTE com procuração (única UF sem agregador).
6. **Prefeituras:** Cantagalo (PR) e Cristal do Sul (RS), "Conveniado – Não Ativo" no ADN: previsão de ativação; BH, Florianópolis e Porto Alegre: domicílio eletrônico e regra de ciência.
7. **REDESIM e Juntas:** API de consulta de processo por convênio.
8. **Bombeiros MG, PR, SC, RS:** consulta pública de validade por CNPJ ou endereço.
9. **CFC:** orientação sobre uso de IA em pareceres e trabalhos técnicos (D6 lacuna 15).

### 8.6 Perguntas aos contadores do escritório-piloto

1. **Validar a triagem:** conferir Dor e Risco das 54 fichas P1 e das 10 marcadas ⚑, e informar tempo real por ocorrência das 20 primeiras (começar por FIS-005, FIS-031/032, DP-009, CTB-002/003, GES-023).
2. Qual core cada setor usa, em qual pacote (Domínio One/Pro/Max e se contrata Domínio Processos e Portal do Cliente; Alterdata com ou sem **eContador Master**; Contmatic em qual plano e se usa a Gestão do Escritório) e quem parametriza as tarefas (V3 20–21).
3. Há algum cliente do escritório em Contmatic? (Decide se a Contmatic entra na primeira leva de negociação.)
4. Quantas chamadas por mês por cliente ao e-CAC (DAS, caixa postal, situação fiscal, pagamentos): com a tabela oficial, um cliente do Simples custa ~R$ 1,92 a R$ 2,56/mês (V1 §4.4).
5. Os clientes aceitariam enviar o próprio A1 pelo app? Quantos têm A1 válido hoje? O e-CNPJ do escritório é A1 ou A3 (com termo de vigência longa, A3 basta para o Integra `[INFERÊNCIA]`)? Quem pode aprovar execuções em nível C e aberturas que dão ciência?
6. Quem no escritório vai **validar as Autorizações de Acesso** em até 30 dias?
7. O escritório é filiado ao Sescon do seu estado? (Possível convênio com o SERPRO, como o do Sescon-PA.)
8. UFs e municípios que concentram os clientes; quantas CCTs distintas; quais clientes têm DP feito pelo escritório (D4, Plano 8.3).
9. Volume mensal de mensagens de WhatsApp respondidas (para saber o que passa das 1.000 grátis) e quantos grupos têm mais de 8 pessoas (V3 22).
10. Bancos, cooperativas e ERPs da carteira (os ERPs homologados no Domínio já entregam direto) (V3 23).
11. Provedores de cobrança e de assinatura em uso; inadimplência; 13º honorário; como emitem a NFS-e própria e em que regime está o escritório (V3 24; D7).
12. Quantas certidões por mês e de quais órgãos (V3 25).
13. Controle de ponto da equipe, teletrabalho e atendimento fora do horário (D7). O agente de desktop só volta à mesa se algum core recusar a API.
14. Que tese o escritório adota para a retenção da Lei 15.270 no Simples e para a LC 224 (o sistema registra a tese por cliente; não decide sozinho) (D5 achado 5).

---

## 9. Agenda de contatos

Uma linha por fornecedor ou órgão, juntando V1 §4–5, V2 §4–5 e V3 §4–5 com as decisões do fundador. "Canal" é o que os verificadores encontraram em 06/11/2026 (`[NÃO VERIFICADO]` quando não acharam canal oficial). Ordem = prioridade sugerida. Para os cores, a decisão 2 vale: **falar tecnicamente com um responsável de cada sistema** e oferecer parceria ou pagamento.

| # | Com quem | O que perguntar | O que pedir (parceria, API, preço) | Canal encontrado | Dono · prioridade | Destrava |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | **Alterdata** (ePlugin / eContador) | Preço do eContador Master; rate limit e retenção do histórico de tarefas; se uma plataforma pode usar o token em nome de vários escritórios; previsão de data de início e horas por tarefa, upload de documentos, envio de XML e webhooks | **Parceria técnica** com acesso de teste; condição comercial para parceiro (ou preço do pacote por escritório); evolução do ePlugin nos quatro pontos acima | **api_econtador@alterdata.com.br** (suporte técnico citado na documentação); documentação https://eplugin.pack.alterdata.com.br | Fundador · **Alta, esta semana**; piloto com o token de um escritório que já tenha eContador Master | GES-048, FIS-001, FIS-003, FIS-047, DP-001, DP-011, DP-020, CTB-017, GES-039, GES-040 |
| 2 | **Thomson Reuters / Domínio** | Prazo, custo e contrato da homologação na API de entrada (NF-e, NFS-e, CT-e, pagamentos/recebimentos, Rubricas); se existe ou pode existir **API de leitura do Domínio Processos** (tarefas, responsável, status, prazos, conclusão, "tempo de produção"); API do Portal do Cliente (publicar e ler documentos e solicitações sem login de usuário); leiaute de lançamentos contábeis; o que cobre api.onvio.com.br; relação Gestta ↔ Domínio Processos | **Homologação como parceiro** (API de entrada) e, na mesma conversa, **acesso de leitura ao Processos e ao Portal** por parceria ou pagamento por escritório | Formulário "Quero ser parceiro" em https://www.dominiosistemas.com.br/solucoes/integracao-com-erp/#sejaParceiro ; comercial por unidade (solução 7456 da Central de Soluções); https://www.dominiosistemas.com.br/contato ; relação comercial do contador que já é cliente Domínio | Fundador (técnico) + contador cliente · **Alta** | NFE-033, DP-011, CTB-017, GES-048, FIS-047, GES-039, GES-040 |
| 3 | **SERPRO – Integra Contador** | Faixas são mensais e separadas por tipo? Monitorar e Apoiar são cobrados? Indicador de novas mensagens é Consulta ou Monitorar? Plataforma pode ser **contratante única** com termo por escritório (cláusulas, repasse, LGPD)? Vigência máxima do termo? **O cliente pode assinar o termo com o próprio A1** (modelo D)? O Integra já valida o aceite das Autorizações de Acesso (código de erro "Em Análise")? Cotas, SLA, ambiente de demonstração; previsão de e-BEF, PER/DCOMP, DIRBI, opção IBS/CBS e PGFN | Contrato (modelo A como alvo, B como reserva); **desconto por volume ou contrato de parceiro para software house**; posição por escrito sobre os modelos A e D | Loja https://loja.serpro.gov.br/integracontador ; Central de Ajuda https://centraldeajuda.serpro.gov.br/duvidas/pt/ ; atendimento online https://serpro-atendimento.dialoga.serpro.gov.br/livechat ; técnico: "Como pedir ajuda" da documentação e Área do Cliente https://cliente.serpro.gov.br | Fundador (comercial), engenharia (PoC) · **Alta** | Todas as A$ federais (FIS-005, FIS-006, FIS-009, FIS-010, FIS-032, SOC-012…); custo por cliente (GES-010) |
| 4 | **Meta (WhatsApp) e provedor (BSP)** | Texto vigente dos termos da WhatsApp Business Solution sobre IA; confirmação de que IA do escritório para os próprios clientes é uso permitido e cobrada como serviço; requisitos da Official Business Account (Groups API); limites por qualidade e coexistência app + API. Aos BSPs: mensalidade e margem sobre a tarifa em BRL, ajuda na verificação da empresa | Conta de mensagens **em BRL** desde o início (migração obrigatória até 30/06/2027) com forma de pagamento; OBA se for usar grupos; cotação de 2 BSPs só se a verificação ou o suporte travarem | Billing Hub e suporte da conta Meta Business (sem contato comercial público encontrado); BSPs citados (360dialog, Twilio, Gupshup, Blip, Zenvia): canal `[NÃO VERIFICADO]` | Fundador · **Alta** (antes do piloto de atendimento) | GES-023 a GES-038, FIS-010, FIS-044, DP-058, NFE-037 |
| 5 | **InfoSimples** (agregador) | Listar mensagens do DEC com `ignora_nao_lidas=false` abre a mensagem e registra ciência em cada UF? Retenção, logs e criptografia do PKCS#12 e senha (DPA/LGPD)? Paginação completa da caixa? Previsão de DTE-RS? Lista de certidões federais, estaduais e municipais cobertas e adicionais; pós-pago e SLA quando o portal muda | Conta de teste (R$ 100 de crédito) com o A1 de um cliente piloto em SP, MG, PR e SC; DPA assinado; cotação para o volume da carteira | suporte@infosimples.com.br (dias úteis, 9h–18h); https://infosimples.com/consultas/precos/ | Fundador · **Alta** | FIS-026, FIS-029, FIS-027, FIS-036, SOC-003, SOC-027, SOC-030 |
| 6 | **CGNFS-e (Receita Federal)** e teste interno do ADN | Completude e defasagem das notas dos sistemas próprios das capitais no ADN; "AderenteEmissorNacional" e "AderenteMAN"; limite de requisições; prazo do acesso por procuração (pedido FENACON) | Resposta formal; fazer em paralelo a PoC em produção restrita e o teste de 1 mês por capital com o A1 de um cliente | Canais de Atendimento: https://www.gov.br/nfse/pt-br/canais-de-atendimento ; APIs: https://www.gov.br/nfse/pt-br/biblioteca/documentacao-tecnica/apis-prod-restrita-e-producao | Engenharia · **Alta** | NFE-007, NFE-003, FIS-028, NFE-008 |
| 7 | **Prefeituras sem ADN** nas cinco UFs: **Cantagalo (PR)** e **Cristal do Sul (RS)** ("Conveniado – Não Ativo" na planilha de 28/09/2026); demais capitais para completude | Previsão de ativação no ADN; enquanto isso, como o escritório obtém as NFS-e (portal, arquivo) | Ativação ou acesso a arquivo; só contatar se houver cliente nesses municípios (senão: upload no app) | Pelo CGNFS-e (linha 6) ou atendimento da prefeitura `[NÃO VERIFICADO]` | Escritório-piloto · Baixa | NFE-008 |
| 8 | **Contmatic** | Que acesso técnico Acessórias e Jettax usam; se há API da Gestão do Escritório (tarefas, produtividade) e do Contador Online; leiautes de importação (lançamentos, folha, XML) | **Mesmo acesso dado aos parceiros**, por parceria ou pagamento; leiautes enquanto isso; agente de desktop só se recusarem (decisão 3) | https://www.contmatic.com.br/contato ("Fale com comercial", seg–sex 8h30–17h30) | Fundador + contador cliente Contmatic · Média (depende de cliente-piloto em Contmatic) | GES-048, FIS-047, NFE-033, DP-011, CTB-017 |
| 9 | **Agregadores e cofres de DF-e e DTE** (Dootax, Jettax, Makro, SIEG, Qive) | DTE por API (não só painel), UFs cobertas, onde fica o certificado, preço por CNPJ; captura por CNPJ para comparar com construir | Cotação (só a SIEG publica preço: a partir de R$ 223/mês) | Formulários comerciais dos sites; Dootax, Jettax, Makro: canal `[NÃO ENCONTRADO]` | Fundador · Média | Concorrência para a linha 5; build × buy da aba Notas |
| 10 | **Integradores de NFS-e** (Focus NFe, NFE.io, PlugNotas) | Preço para escritório com centenas de CNPJs; emissão × captura; se a captura usa o ADN; tabela da PlugNotas | Cotação para emissão (NFE-039, GES-007) | Formulários "Solicite um contato"/"Fale conosco" nas páginas de preço | Fundador · Média | NFE-039, GES-007 |
| 11 | **Open Finance** (Pluggy, Belvo) | Volume incluso no piso; preço por conta PJ; cooperativas; Belvo em BRL | Cotação formal quando houver volume (MVP com OFX) | https://www.pluggy.ai/precos ("Fale com a gente"); https://belvo.com/plans-and-pricing/ ("Contact Sales") | Fundador · Baixa no MVP | CTB-008, CTB-010, FIS-032, DP-021 |
| 12 | **Assinatura e cobrança** (ZapSign, D4Sign, Clicksign; Asaas, Efí, Inter) | Excedente por documento, ICP-Brasil, dossiê; Pix Automático por API no Asaas; tabela oficial do Inter | Teste da API no plano mais barato com API | Páginas de planos e tarifas (V3 I-13, I-14); Inter `[NÃO ENCONTRADO]` | Fundador + financeiro · Média | SOC-016, GES-001 a GES-009 |
| 13 | **MTE** (FGTS Digital, DET) | API para "sistemas parceiros" do FGTS Digital e como se habilitar; API do DET | Habilitação (acordo de cooperação técnica?) | Página "Manual e Documentação Técnica" do FGTS Digital; Acordos de Cooperação Técnica do MTE: https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/acordos-de-cooperacao-tecnica ; Fala.BR `[NÃO VERIFICADO]` | Fundador · Média | DP-018, DP-029, DP-044, DP-040 |
| 14 | **Receita Federal** | Norma, limite e validade das Autorizações de Acesso; endereço novo dos dados abertos do CNPJ; licença da Calculadora offline | Respostas formais | Guia de Autorizações de Acesso (página oficial); Fale Conosco `[NÃO VERIFICADO]` | Produto · Média | SOC-011, SOC-012, SOC-001, CON-016 |
| 15 | **Sefaz** (SP, SC, RS; MG e PR sem canal encontrado) | API para DTE; listar sem abrir dá ciência; limite do SAE-NFC-e; Receita/RS: leitura do DTE por software com procuração | Credenciamento de desenvolvedor, se existir | SP: 0800-0170110 / 11-2930-3750, SIFALE (SIDEB); SC: 0800-048-1515, Ouvidoria 0800-6448500; RS: https://atendimento.receita.rs.gov.br | Fundador · Baixa (RS média) | FIS-026 (RS), NFE-009 |
| 16 | **Sescon do estado do escritório** e **FENACON** | Convênio com o SERPRO (como o do Sescon-PA); andamento do pedido de procuração na NFS-e | Adesão ao convênio, se houver | `[NÃO VERIFICADO]` | Escritório-piloto · Baixa | Custo do Integra; NFE-007 |
| 17 | **Concorrentes** (Acessórias, HubStrom, e-Kontroll, Qive) | Proposta por faixa de clientes; ver ao vivo o app do cliente e a API/MCP da Acessórias | Demonstração | Formulários "Solicite uma demonstração"; e-Kontroll pelo WhatsApp comercial do site | Contadores · Média (benchmark antes de fechar o app do cliente) | Escopo do app do cliente |

**Ordem das próximas quatro semanas:** (1) e-mail técnico à Alterdata e piloto com token real; (2) formulário de parceiro da TR + conversa comercial pelo contador cliente Domínio; (3) SERPRO comercial (modelo A/D) e PoC do Integra (termo → token → lista da caixa postal → DAS → SITFIS); (4) conta do WhatsApp em BRL; (5) conta de teste na InfoSimples e teste de DTE sem abrir mensagens; (6) teste de completude do ADN por capital e do `distNSU` com A1 de cliente e `autXML` do escritório; (7) Contmatic, se houver cliente-piloto; (8) pedidos formais a MTE, RFB e CGNFS-e.

---

*Para atualizar este arquivo (protocolo §6): rodar só os D e V do escopo novo, recalcular a nota das fichas tocadas pela mesma regra do "Método de triagem", marcar as linhas novas com a data e manter as decisões anteriores visíveis.*

---

## 10. Rodada 3 (6/11/2026): ciclo de vida do cliente e divisão do nível D

Classificação de todas as atividades pela etapa do ciclo do cliente (Entrada, Manutenção, Desligamento), usada pelos contadores do grupo além do setor; divisão do antigo D em D-assistido (viabilidade 3) e D-humano (viabilidade 1); e 73 fichas novas focadas em entrada, transição entre contabilidades e desligamento (62 de setor, no fim de cada arquivo D, e 11 transversais CIC em [L1-ciclo-de-vida.md](L1-ciclo-de-vida.md), que também traz as jornadas de ponta a ponta e o catálogo de 27 modelos). A base completa, com etapa por atividade, está em [atividades.json](atividades.json), e o visualizador em [mapa-de-atividades.html](mapa-de-atividades.html).

As fichas novas têm nível e notas **provisórios** (dados pelos agentes de setor, sem passar pela verificação V).

### 10.1 Setor × etapa

| Setor | Entrada | Manutenção | Desligamento | Total |
| --- | ---: | ---: | ---: | ---: |
| Clientes e Societário | 36 | 36 | 15 | 56 |
| Fiscal e Obrigações | 20 | 48 | 8 | 58 |
| Notas fiscais | 8 | 40 | 4 | 46 |
| Trabalhista e DP | 9 | 62 | 14 | 71 |
| Contábil | 18 | 53 | 8 | 63 |
| Consultoria e Reforma | 11 | 38 | 4 | 44 |
| Gestão e Atendimento | 16 | 60 | 8 | 71 |
| Ciclo de vida (transversal) | 6 | 7 | 7 | 11 |
| **Total** | **124** | **344** | **68** | **420** |

Uma atividade pode estar em mais de uma etapa.

### 10.2 Divisão do antigo nível D

| id | atividade | novo nível | nota antes | nota depois | prioridade antes | prioridade depois |
| --- | --- | --- | ---: | ---: | --- | --- |
| FIS-022 | Entregar a DIRBI mensal | D-assistido | 60 | 180 | P3 ⚑ | P2 |
| FIS-042 | Elaborar e acompanhar PER/DCOMP | D-assistido | 48 | 144 | P3 ⚑ | P2 |
| DP-013 | Conferir os descontos do Crédito do Trabalhador (consignado) | D-assistido | 36 | 108 | P3 ⚑ | P3 |
| SOC-024 | Conduzir o offboarding do cliente | D-assistido | 32 | 96 | P3 ⚑ | P3 |
| SOC-011 | Pedir e acompanhar a autorização de acesso na RFB | D-assistido | 32 | 96 | P1 (hab.) ⚑ | P1 (hab.) |
| SOC-006 | Declarar e atualizar o beneficiário final (e-BEF) | D-assistido | 30 | 90 | P3 | P3 |
| SOC-036 | Obter e renovar o alvará de funcionamento | D-assistido | 30 | 90 | P3 | P3 |
| SOC-044 | Cumprir as obrigações de capital estrangeiro (SCE-IED) | D-assistido | 30 | 90 | P3 | P3 |
| CON-035 | Controlar créditos judiciais: habilitação e limite mensal de compensa… | D-assistido | 24 | 72 | P3 | P3 |
| FIS-018 | Conduzir opção, desenquadramento e baixa do SIMEI | D-assistido | 24 | 72 | P3 | P3 |
| NFE-013 | Capturar documentos de outros modelos (energia NF3e, telecom NFCom, i… | D-assistido | 24 | 72 | P3 | P3 |
| SOC-040 | Controlar registros em conselhos e órgãos setoriais | D-assistido | 24 | 72 | P3 | P3 |
| NFE-008 | Capturar NFS-e de municípios fora do ADN, de emissores próprios e de… | D-assistido | 24 | 72 | P3 | P3 |
| CON-017 | Recomendar a opção semestral do Simples pelo regime regular de IBS/CB… | D-assistido | 24 | 72 | P3 ⚑ | P3 |
| SOC-014 | Orientar a conta gov.br dos sócios | D-assistido | 18 | 54 | P3 | P3 |
| FIS-015 | Decidir e registrar a opção semestral pelo regime regular de IBS/CBS… | D-assistido | 16 | 48 | P3 ⚑ | P3 |
| SOC-029 | Fazer alterações contratuais e cadastrais | D-assistido | 16 | 48 | P3 ⚑ | P3 |
| SOC-031 | Encerrar a empresa (baixa) | D-assistido | 16 | 48 | P3 ⚑ | P3 |
| SOC-013 | Controlar procurações em outros órgãos | D-assistido | 12 | 36 | P3 | P3 |
| CON-009 | Executar e comprovar a opção de regime | D-assistido | 12 | 36 | P3 | P3 |
| CON-027 | Planejar a transição ICMS/ISS → IBS e a perda gradual de benefícios f… | D-assistido | 12 | 36 | P3 | P3 |
| CON-034 | Executar o projeto de recuperação: memória de cálculo, dossiê, retifi… | D-assistido | 12 | 36 | P3 | P3 |
| CTB-044 | Publicar demonstrações de S/A e arquivar quando exigido | D-assistido | 12 | 36 | P3 | P3 |
| CTB-049 | Enviar a Declaração de Não Ocorrência ao COAF e avaliar operações sus… | D-assistido | 12 | 36 | P3 | P3 |
| DP-031 | Fazer o requerimento do seguro-desemprego | D-assistido | 12 | 36 | P3 | P3 |
| FIS-014 | Conduzir a opção, o cancelamento e as pendências de entrada no Simples | D-assistido | 12 | 36 | P3 | P3 |
| FIS-043 | Levantar ressarcimento de ICMS-ST e créditos estaduais | D-assistido | 12 | 36 | P3 | P3 |
| GES-037 | Migrar o atendimento dos celulares pessoais e de grupos para o canal… | D-assistido | 12 | 36 | P3 | P3 |
| GES-057 | Manter o registro do escritório e dos profissionais no CRC em dia | D-assistido | 12 | 36 | P3 | P3 |
| SOC-025 | Fazer a consulta de viabilidade e a pré-análise da atividade | D-assistido | 12 | 36 | P3 | P3 |
| SOC-028 | Fazer a opção pelo Simples Nacional e o enquadramento na abertura | D-assistido | 12 | 36 | P3 | P3 |
| SOC-042 | Autenticar livros digitais na Junta | D-assistido | 12 | 36 | P3 | P3 |
| DP-041 | Atender notificação ou fiscalização do trabalho | D-humano | 32 | 32 | P3 ⚑ | P3 ⚑ |
| SOC-037 | Obter e renovar o AVCB/CLCB dos Bombeiros | D-humano | 30 | 30 | P3 | P3 |
| SOC-038 | Obter e renovar a licença sanitária | D-humano | 30 | 30 | P3 | P3 |
| GES-006 | Decidir suspensão, protesto ou rescisão por inadimplência, dentro do… | D-humano | 24 | 24 | P3 | P3 |
| GES-054 | Documentar a base legal, a transparência e o relatório de impacto do… | D-assistido | 8 | 24 | P3 | P3 |
| SOC-045 | Publicar atos de sociedades anônimas | D-assistido | 8 | 24 | P3 | P3 |
| CON-006 | Formular e acompanhar consulta formal ao Fisco | D-assistido | 6 | 18 | P3 | P3 |
| SOC-033 | Abrir filial ou transferir sede entre UFs | D-assistido | 6 | 18 | P3 | P3 |
| GES-060 | Manter o seguro de responsabilidade civil profissional | D-humano | 16 | 16 | P3 | P3 |
| SOC-039 | Obter e renovar a licença ambiental | D-humano | 16 | 16 | P3 | P3 |

### 10.3 Fichas novas do ciclo de vida

| id | setor | atividade | etapas | nível (prov.) | nota | prioridade |
| --- | --- | --- | --- | --- | ---: | --- |
| FIS-105 | Fiscal e Obrigações | Inventariar parcelamentos, transações, processos e intimações em prazo herdados | Entrada | A | 200 | P2 |
| FIS-101 | Fiscal e Obrigações | Levantar o perfil fiscal de entrada e os regimes especiais do cliente | Entrada | Próprio | 160 | P2 |
| FIS-103 | Fiscal e Obrigações | Conferir o histórico fiscal herdado: declarado × apurado × pago | Entrada | A | 160 | P2 |
| FIS-108 | Fiscal e Obrigações | Montar e entregar o dossiê fiscal ao novo contador e cumprir as competências do contrato | Desligamento | Próprio | 160 | P2 |
| NFE-101 | Notas fiscais | Salvar a janela de 90 dias e receber o acervo histórico de documentos fiscais do cliente que chega | Entrada | A | 160 | P2 |
| NFE-102 | Notas fiscais | Auditar as notas herdadas na entrada (diagnóstico documental e oportunidades) | Entrada | Próprio | 160 | P2 |
| DP-102 | Trabalhista e DP | Fazer o diagnóstico trabalhista inicial do cliente | Entrada | A | 160 | P2 |
| CTB-103 | Contábil | Conferir e implantar os saldos de abertura herdados | Entrada | Próprio | 160 | P2 |
| CTB-105 | Contábil | Dividir a ECD, a ECF e as demonstrações do ano da troca de contador | Entrada, Desligamento | Próprio | 160 | P2 |
| CTB-106 | Contábil | Diagnosticar a escrituração herdada e propor a regularização | Entrada | Próprio | 160 | P2 |
| CTB-107 | Contábil | Reconstituir escrituração atrasada ou inexistente herdada | Entrada | Próprio | 160 | P2 |
| CTB-110 | Contábil | Encerrar a contabilidade na baixa: balanço de liquidação, ECD e ECF de extinção | Desligamento | Próprio | 160 | P2 |
| CON-101 | Consultoria e Reforma | Fazer o diagnóstico tributário de entrada do cliente novo | Entrada | Próprio | 160 | P2 |
| GES-104 | Gestão e Atendimento | Ativar o cliente novo no app e nos canais (convite, A1, opt-in e contatos por assunto) | Entrada | Próprio | 160 | P2 |
| CIC-001 | Ciclo de vida (transversal) | Manter o estado do ciclo de vida do cliente e orquestrar as jornadas entre setores | Entrada, Manutenção, Desligamento | Próprio | 160 | P2 |
| CIC-002 | Ciclo de vida (transversal) | Fazer um pedido único de acervo ao contador anterior e controlar o recebimento | Entrada | Próprio | 160 | P2 |
| CIC-003 | Ciclo de vida (transversal) | Montar o dossiê único de saída e colher o termo de entrega com manifesto | Desligamento | Próprio | 160 | P2 |
| CIC-010 | Ciclo de vida (transversal) | Conduzir as reentradas parciais quando o cliente muda de porte, regime ou atividade | Manutenção | Próprio | 160 | P2 |
| SOC-101 | Clientes e Societário | Manter a biblioteca de modelos e minutas do escritório | Entrada, Manutenção, Desligamento | Próprio | 135 | P2 |
| FIS-104 | Fiscal e Obrigações | Inventariar e assumir créditos, saldos credores e pedidos em andamento herdados | Entrada | F | 128 | P2 |
| SOC-102 | Clientes e Societário | Fazer o diagnóstico societário e de legalização na entrada | Entrada | D-assistido | 120 | P2 |
| SOC-104 | Clientes e Societário | Combinar a transição com o contador anterior | Entrada | Próprio | 120 | P2 |
| SOC-105 | Clientes e Societário | Planejar a estrutura da empresa antes da abertura | Entrada | Próprio | 120 | P2 |
| SOC-107 | Clientes e Societário | Fechar as responsabilidades de saída com o contador sucessor | Desligamento | Próprio | 120 | P2 |
| FIS-102 | Fiscal e Obrigações | Definir a competência de corte e dividir as obrigações do mês de transição com o contador anterior | Entrada, Desligamento | Próprio | 120 | P2 |
| FIS-106 | Fiscal e Obrigações | Regularizar obrigações omitidas herdadas | Entrada, Manutenção | D-assistido | 120 | P2 |
| FIS-107 | Fiscal e Obrigações | Habilitar o cliente nos ambientes fiscais eletrônicos | Entrada | D-assistido | 120 | P2 |
| FIS-109 | Fiscal e Obrigações | Encerrar acessos, automações e consumos fiscais do ex-cliente | Desligamento | Próprio | 120 | P2 |
| NFE-104 | Notas fiscais | Fechar a competência de corte das notas e passar as pendências documentais ao novo contador | Desligamento | Próprio | 120 | P2 |
| DP-101 | Trabalhista e DP | Definir o escopo do DP e a matriz de responsabilidades com o cliente na entrada | Entrada | Próprio | 120 | P2 |
| DP-105 | Trabalhista e DP | Preparar o empregador novo antes da primeira admissão | Entrada | Próprio | 120 | P2 |
| DP-109 | Trabalhista e DP | Definir guarda, devolução e descarte dos dados de empregados após o fim da relação | Desligamento | Próprio | 120 | P2 |
| CTB-104 | Contábil | Fazer o de-para do plano de contas herdado e o registro I157 | Entrada, Manutenção | Próprio | 120 | P2 |
| CTB-109 | Contábil | Entregar o pacote contábil de transferência ao sucessor | Desligamento | Próprio | 120 | P2 |
| CON-103 | Consultoria e Reforma | Planejar o regime e o enquadramento da empresa nova antes da inscrição no CNPJ | Entrada | Próprio | 120 | P2 |
| CON-104 | Consultoria e Reforma | Entregar o acervo consultivo e os prazos em curso quando o cliente sai | Desligamento | Próprio | 120 | P2 |
| GES-108 | Gestão e Atendimento | Desativar o cliente que sai na plataforma e nos canais | Desligamento | Próprio | 120 | P2 |
| CIC-007 | Ciclo de vida (transversal) | Atender o ex-cliente e o sucessor depois da saída (responsabilidade residual) | Desligamento | Próprio | 120 | P2 |
| FIS-110 | Fiscal e Obrigações | Cumprir as obrigações fiscais de encerramento na baixa da empresa | Desligamento | D-assistido | 96 | P3 |
| FIS-111 | Fiscal e Obrigações | Tratar o estoque final, o ICMS e o saldo credor na baixa da inscrição estadual | Desligamento | D-assistido | 96 | P3 |
| DP-104 | Trabalhista e DP | Assumir o eSocial e a folha a partir de uma competência de corte | Entrada | F | 96 | P3 |
| DP-108 | Trabalhista e DP | Encerrar o DP na baixa da empresa | Desligamento | F | 96 | P3 |
| CON-102 | Consultoria e Reforma | Inventariar a herança consultiva deixada pelo contador anterior | Entrada | D-assistido | 96 | P3 |
| CIC-004 | Ciclo de vida (transversal) | Conduzir a entrada e o ciclo do cliente pessoa física (IRPF, carnê-leão, produtor rural) | Entrada, Manutenção, Desligamento | D-assistido | 96 | P3 |
| SOC-106 | Clientes e Societário | Tratar o pedido de rescisão (ou rescindir pelo escritório) | Desligamento | Próprio | 90 | P3 |
| NFE-103 | Notas fiscais | Montar a parametrização de entrada do cliente no core (de-para, acumuladores, produtos e fornecedores) | Entrada | Próprio | 90 | P3 |
| DP-103 | Trabalhista e DP | Receber e conferir o acervo do DP vindo do contador anterior | Entrada | Próprio | 90 | P3 |
| DP-106 | Trabalhista e DP | Entregar o acervo do DP ao novo contador e fechar a última competência | Desligamento | Próprio | 90 | P3 |
| CTB-101 | Contábil | Estimar o volume e a complexidade contábil para a proposta | Entrada | Próprio | 90 | P3 |
| CTB-108 | Contábil | Implantar a contabilidade da empresa nova | Entrada | Próprio | 90 | P3 |
| GES-102 | Gestão e Atendimento | Estimar o esforço e o honorário do cliente novo a partir do tempo medido de clientes parecidos | Entrada | Próprio | 90 | P3 |
| GES-105 | Gestão e Atendimento | Enviar o kit de boas-vindas e conduzir a reunião de início | Entrada | Próprio | 90 | P3 |
| GES-106 | Gestão e Atendimento | Acompanhar a implantação nos primeiros 90 dias (marcos, saúde e custo da entrada) | Entrada | Próprio | 90 | P3 |
| CIC-009 | Ciclo de vida (transversal) | Cadastrar e atender o grupo econômico como uma conta só | Entrada, Manutenção | Próprio | 90 | P3 |
| CIC-011 | Ciclo de vida (transversal) | Medir o ciclo de vida da carteira (funil, implantação, permanência e saída) | Entrada, Manutenção, Desligamento | Próprio | 90 | P3 |
| SOC-108 | Clientes e Societário | Aplicar retenção e descarte dos dados do ex-cliente (LGPD) | Desligamento | Próprio | 80 | P3 |
| SOC-110 | Clientes e Societário | Avaliar baixa ou inatividade e acompanhar a empresa inativa | Manutenção, Desligamento | Próprio | 80 | P3 |
| NFE-105 | Notas fiscais | Desligar a captura, o autXML e a guarda de XMLs do ex-cliente | Desligamento | Próprio | 80 | P3 |
| SOC-103 | Clientes e Societário | Trocar vínculos e acessos herdados do contador anterior | Entrada | D-assistido | 72 | P3 |
| SOC-109 | Clientes e Societário | Encerrar os registros acessórios depois da baixa | Desligamento | D-assistido | 72 | P3 |
| NFE-106 | Notas fiscais | Fechar o acervo de documentos fiscais na baixa da empresa ou do estabelecimento | Desligamento | D-assistido | 72 | P3 |
| DP-107 | Trabalhista e DP | Revogar procurações e acessos trabalhistas na saída do cliente | Desligamento | D-assistido | 72 | P3 |
| CON-106 | Consultoria e Reforma | Planejar a tributação do encerramento da empresa (baixa) | Desligamento | Próprio | 60 | P3 |
| GES-101 | Gestão e Atendimento | Decidir a aceitação do cliente novo (motivo da troca, risco e histórico) | Entrada | Próprio | 60 | P3 |
| GES-107 | Gestão e Atendimento | Fazer a entrevista de saída, registrar o motivo e tentar a retenção | Desligamento | Próprio | 60 | P3 |
| GES-103 | Gestão e Atendimento | Cobrar a implantação, a regularização herdada e a primeira mensalidade proporcional | Entrada | B | 54 | P3 |
| GES-109 | Gestão e Atendimento | Precificar e cobrar o encerramento da empresa até a última obrigação | Desligamento | B | 54 | P3 |
| CTB-102 | Contábil | Recuperar a ECD, a ECF e os livros já transmitidos do cliente | Entrada | C-cert | 48 | P3 |
| CTB-111 | Contábil | Encerrar consentimentos do Open Finance e integrações de dados do ex-cliente | Desligamento | B | 48 | P3 |
| CON-105 | Consultoria e Reforma | Encerrar projetos consultivos em aberto e apurar o honorário de êxito na saída | Desligamento | Próprio | 45 | P3 |
| CIC-005 | Ciclo de vida (transversal) | Receber uma carteira de clientes em bloco (compra de carteira ou fusão de escritórios) | Entrada | Próprio | 45 | P3 |
| CIC-006 | Ciclo de vida (transversal) | Tratar o falecimento do titular ou de um sócio do cliente | Manutenção, Desligamento | D-humano | 12 | P3 |
| CIC-008 | Ciclo de vida (transversal) | Atender a falência ou a recuperação judicial do cliente | Manutenção, Desligamento | D-humano | 12 | P3 |

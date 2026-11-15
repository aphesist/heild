# L2 · Trilha de implantação da plataforma agêntica

6 de novembro de 2026 · agente L2 (trilha de implantação) · insumos: inventário `viz/indice.txt` (466 fichas) mais as fichas novas desta rodada em [B6](B6-cores-e-ferramentas.md) (GES-601 a GES-609, FIN-601 a FIN-604), [B7](B7-pessoa-fisica.md) (PF), [B8](B8-terceiro-setor.md) (TS), [B9](B9-nichos.md) (NIC) e [B10](B10-bpo-escritorios.md) (BPO), num total de **589 atividades**, e a classificação desta rodada (fase, autonomia, pré-requisitos). Não houve pesquisa na web.

## Como ler este arquivo

- **Fase** é a ordem sugerida de implantação: 0 Fundação · 1 Captura e obrigações · 2 Atendimento e documentos · 3 Financeiro e gestão do escritório · 4 Consultoria e IA avançada · 5 Nichos e expansão. **Regra:** nenhuma atividade fica numa fase anterior à de um pré-requisito (`depende_de`). Isso diz quando uma atividade *pode começar*. Fases vizinhas podem rodar ao mesmo tempo quando há equipe.
- **Autonomia:** **S** = Agente faz sozinho · **P** = Agente prepara, pessoa conclui · **O** = Agente organiza e lembra.
- **horas_100** = horas por mês que a atividade consome num escritório típico de 100 clientes. As fichas B6 a B10 trazem o valor; para as 467 fichas antigas sem esse campo, o valor é uma **estimativa deste arquivo**. Ela parte das notas de frequência e de dor das fichas, com a tabela frequência 5 → 12 h, 4 → 6 h, 3 → 3 h, 2 → 1,2 h e 1 → 0,5 h, multiplicada por dor/3. A tabela foi calibrada para que as atividades dos sete setores somem cerca de 2.200 h/mês, que é a capacidade aproximada de uma equipe de 13 a 14 pessoas. Todos os valores são `[ESTIMATIVA]` e servem para **ordenar**, não para orçar.
- **Horas liberáveis** = horas × fator da autonomia (S 0,8 · P 0,5 · O 0,2) `[ESTIMATIVA]`. É o critério de prioridade dentro de cada fase.
- **Escala para 50 e 500 clientes:** o que é feito por cliente escala de forma linear (×0,5 e ×5). O que é do próprio escritório (GES, FIN, BPO) cresce com a raiz quadrada do número de clientes (×0,71 e ×2,24).
- **Trilhas opcionais:** BPO (23 fichas, só para quem opera ou contrata BPO), NIC (30 fichas, só para quem tem clientes do nicho) e TS (27 fichas, terceiro setor). Elas aparecem separadas nos totais.

## Sumário

1. [Correções de fase desta revisão](#1-correções-de-fase-desta-revisão)
2. [Visão geral das fases](#2-visão-geral-das-fases)
3. [Fases 0 a 5: objetivo, habilitadoras e o que destrava](#3-fases-0-a-5-objetivo-habilitadoras-e-o-que-destrava)
4. [Caminho crítico](#4-caminho-crítico)
5. [Ordem sugerida: escritório de 50 clientes](#5-ordem-sugerida-escritório-de-50-clientes)
6. [Ordem sugerida: escritório de 500 clientes](#6-ordem-sugerida-escritório-de-500-clientes)
7. [Desligamento das ferramentas atuais com operação em paralelo](#7-desligamento-das-ferramentas-atuais-com-operação-em-paralelo)
8. [Pontos para a conversa com os contadores](#8-pontos-para-a-conversa-com-os-contadores)

---

## 1. Correções de fase desta revisão

**Ciclos:** nenhum. O grafo de pré-requisitos (589 nós, todas as referências existem no inventário ou nas fichas novas) é acíclico.

**Inconsistências de fase:** dez atividades estavam numa fase anterior à de um pré-requisito. Em cada caso foi escolhida a correção mais coerente com a definição das fases: subir a atividade dependente, ou trazer para antes o pré-requisito quando ele é, por natureza, de uma fase anterior. Depois das 11 mudanças abaixo, a propagação não mudou mais nada e o grafo ficou sem violações.

| Atividade | Fase antes → depois | Pré-requisito em conflito | Motivo |
| --- | --- | --- | --- |
| **FIS-007** Verificar procuração vigente e renovar | 1 → **0** | (era pré-requisito de BPO-006, fase 0) | "Procurações e autorizações" é Fundação por definição. Os pré-requisitos de FIS-007 (SOC-011 e SOC-012) já estão na fase 0 |
| **BPO-005** Responsável técnico por empresa atendida no BPO | 0 → **1** | GES-057 (registro no CRC, fase 1) | O registro da organização contábil no CRC vem antes. O responsável técnico por entrega é rotina, não fundação |
| **BPO-009** Receber pedidos do contratante por formulário | 1 → **2** | DP-001 (pedido de admissão, fase 2, que depende do portal GES-040) | O formulário do BPO reaproveita os pedidos padronizados do portal |
| **BPO-010** Fila única BPO × contratante | 1 → **2** | BPO-009 | Propagação da linha anterior |
| **BPO-012** Painel e relatório mensal ao contratante | 2 → **3** | GES-019 (registro de erros, fase 3) | O relatório traz os erros, e o registro de qualidade é da gestão do escritório |
| **BPO-017** Receber a carteira do contratante em bloco | 1 → **5** | CIC-005 (receber carteira em bloco, fase 5) | É o mesmo movimento de expansão (compra ou fusão de carteira), aplicado ao BPO |
| **BPO-019** Encerrar a relação com o contratante | 1 → **2** | CIC-003 (dossiê de saída, fase 2) | O encerramento usa o dossiê e o termo de entrega |
| **BPO-020** Prova de segurança ao contratante | 1 → **2** | GES-059 (incidentes LGPD, fase 2, que depende do histórico de conversas GES-203) | O aviso de incidente exige o registro de incidentes |
| **GES-048** Trazer do core o que foi feito, por quem e quando | 3 → **2** | (era pré-requisito de GES-602, migração do Gestta, fase 2) | B6 exige a leitura de atividades do core (ou a conclusão por evidência) para desligar o Gestta. A ficha é de captura, nível B (parceria a negociar), e por isso fica na fase 2, não na 1 |
| **PF-027** Atender o empregador doméstico PF | 2 → **5** | DP-062 (folha do doméstico e do MEI, fase 5) | A folha e o DAE ficam em DP-062. Sem ela, PF-027 seria só a procuração |
| **SOC-105** Planejar a estrutura antes da abertura | 4 → **2** | (era pré-requisito de SOC-025 a SOC-028, abertura, fase 2) | Em L1 (jornada a, passo a1), é o primeiro passo da abertura, antes da viabilidade. As simulações avançadas continuam em CON (fase 4) |

**Inconsistências de pré-requisito (sem mudança de fase):**

- **FIN-601, FIN-602 e FIN-603** (migração de Conta Azul, Omie/Nibo e Conexa) não listavam a cobrança pela API do banco. Pela regra "cobrança só depois da API do banco" (B6 · 4.2), devem depender também de **GES-001** (emissão de boleto/Pix), **GES-003** (baixa) e **FIN-604** (troca do provedor de recebimento). Todas já estão na fase 3, então a fase não muda.
- **GES-604** (desligar o SIEG) só lista NFE-033, que é o envio ao core para Domínio, Alterdata e Contmatic. Para escritórios em Questor, SCI, Fortes ou Prosoft, deve depender também de **GES-609** (fase 1). A fase não muda.

**Observação de calendário (sem mudança):** **FIS-045** (destaque de CBS/IBS nas notas) está na fase 4, mas os seus pré-requisitos (NFE-004, NFE-007, SOC-002) estão nas fases 0 e 1, e a rejeição pela Sefaz já vale desde 03/08/2026 (ficha FIS-045). Em novembro de 2026, vale **antecipar** essa atividade para logo depois da captura, sem esperar o resto da fase 4.

**Trilha BPO:** a definição das fases põe "BPO" na fase 5, mas a classificação põe BPO-001 a BPO-006 na fase 0. As duas coisas são compatíveis: as fichas BPO descrevem o escritório que **opera** como BPO, para quem inquilinos separados, acessos e contrato são fundação. Para o escritório comum, a trilha BPO inteira é opcional e entra como expansão (fase 5), junto com FIN-201 (BPO financeiro do cliente).

---

## 2. Visão geral das fases

Totais sem as trilhas opcionais (BPO, NIC, TS). Horas por mês `[ESTIMATIVA]`.

| Fase | Atividades | S / P / O (todas) | horas/mês com 50 clientes (liberáveis) | com 100 | com 500 |
| --- | --- | --- | --- | --- | --- |
| **0 Fundação** | 32 (+5 BPO) | 14 / 15 / 8 | 61 (42) | 111 (76) | 481 (332) |
| **1 Captura e obrigações** | 163 (+2 BPO) | 78 / 74 / 13 | 427 (298) | 850 (594) | 4.228 (2.959) |
| **2 Atendimento e documentos** | 146 (+9 BPO) | 42 / 95 / 18 | 402 (255) | 690 (437) | 2.693 (1.694) |
| **3 Financeiro e gestão** | 60 (+5 BPO) | 22 / 31 / 12 | 152 (99) | 217 (141) | 510 (330) |
| **4 Consultoria e IA avançada** | 93 | 8 / 79 / 6 | 190 (103) | 363 (196) | 1.703 (921) |
| **5 Nichos e expansão** | 15 (+2 BPO, 30 NIC, 27 TS) | 15 / 51 / 8 | 29 (14) | 47 (23) | 165 (79) |

Trilhas opcionais, com 100 clientes: BPO cerca de 207 h/mês (coordenação entre escritórios), NIC cerca de 312 h/mês (escritório especializado no nicho) e TS cerca de 44 h/mês (com cerca de 10 entidades).

**Leitura:** as fases 1 e 2 concentram cerca de 70% das horas e a maior parte do que o agente faz sozinho. A fase 0 quase não libera horas, mas sem ela nada roda: SOC-001 (cadastro) é pré-requisito, direto ou indireto, de 576 das 588 outras atividades. A fase 4 consome muitas horas, mas quase tudo nela é "Agente prepara, pessoa conclui": o ganho vem de qualidade e de receita nova, não de horas devolvidas.

---

## 3. Fases 0 a 5: objetivo, habilitadoras e o que destrava

Em cada fase, as **habilitadoras** são as atividades com mais dependentes (diretos e indiretos). O número entre parênteses é a quantidade de atividades que dependem dela.

### Fase 0 · Fundação

- **Objetivo:** cada cliente existe uma vez, com perfil vigente, pessoas ligadas, certificado guardado com trilha, acessos legais ao governo e contrato assinado. Cada funcionário vê só o que deve, e toda ação fica registrada.
- **Habilitadoras:** SOC-001 cadastro pelo CNPJ (576) · SOC-008 cofre de certificados (254) · SOC-004 ficha das pessoas ligadas (234) · SOC-002 perfil com vigência (228) · SOC-014 gov.br prata/ouro do sócio (220) · SOC-011 autorização de acesso na RFB (202) · GES-021 permissões da equipe (133) · SOC-101 biblioteca de modelos (95) · SOC-015 perfil do prospect e honorário (87) · SOC-016 contrato assinado (81) · CTB-001 o que deve chegar por mês (76) · GES-041 quem vê o quê no cliente (76) · SOC-012 painel de autorizações (66) · FIN-001 contrato como assinatura estruturada (60) · DP-042 procurações eletrônicas do DP (44) · GES-204 app do cliente (42) · GES-047 registro de eventos (36).
- **Também nesta fase:** FIS-007 (procuração vigente, corrigida para cá), SOC-009 e SOC-010 (vencimento e uso dos certificados), SOC-013 (procurações fora da RFB), CTB-010 (consentimento Open Finance), GES-017 (carteira por analista), GES-054 e SOC-020 (LGPD), GES-056 (registro do que a IA fez), GES-058 (e-CNPJ do escritório), DP-101 (escopo do DP), CIC-001 (estado do ciclo de vida), PF-001 e PF-002 (perfil e acesso da PF) e GES-608 (plano mestre de migração).
- **O que destrava a fase 1 (critério de saída):**
  1. 100% dos clientes ativos cadastrados (SOC-001/002/004), com CNPJs, IEs e IMs conferidos.
  2. Certificado A1 no cofre, ou A3 registrado, para cada cliente que tem certificado (SOC-008), com alerta de vencimento ligado (SOC-009).
  3. Autorização de acesso na RFB **confirmada no portal** (SOC-012) para pelo menos a primeira coorte de clientes, e procuração vigente conferida (FIS-007).
  4. Perfis de acesso da equipe criados (GES-021) e registro de eventos ligado (GES-047).
  5. Contratos e honorários dos clientes ativos estruturados (SOC-016, FIN-001), mesmo que a cobrança ainda saia pelo sistema antigo.
  6. Plano mestre de migração aberto (GES-608), com o inventário das ferramentas atuais e as datas de contrato.

### Fase 1 · Captura e obrigações

- **Objetivo:** tudo o que o governo e o cliente produzem chega sozinho, todos os dias: XMLs, caixas postais, eventos do eSocial e extratos. Cada obrigação do mês já nasce como tarefa, com prazo, e é encerrada com recibo.
- **Habilitadoras:** FIS-024 declarações estaduais por UF (133) · SOC-005 IE, IM e regimes especiais (130) · FIS-001 calendário mensal de obrigações e guias (129) · NFE-001 cadastro de captura por cliente (129) · NFE-004 NF-e destinadas por NSU (73) · CTB-008 extratos bancários (70) · NFE-005 NF-e/NFC-e emitidas (62) · NFE-007 NFS-e do ADN (48) · GES-206 processos modelados (45) · CTB-005, CTB-016 e CTB-024 (fechamento contábil, cerca de 32 cada).
- **Maiores ganhos de horas (com 100 clientes):** leitura das caixas postais (FIS-005 e-CAC, FIS-026 estaduais, FIS-029 municipais, DP-040 DET, SOC-007 Domicílio Judicial), captura (NFE-004, NFE-007, NFE-005, NFE-006, NFE-009, NFE-501, NFE-502), acompanhamento da captura (NFE-003), envio ao core (NFE-033), guarda (NFE-036), triagem de documentos que chegam por WhatsApp e e-mail (CTB-004), prorrogações (FIS-002) e recibos (FIS-003). Cada uma fica entre 16 e 20 h/mês, quase todas com autonomia S.
- **O que destrava a fase 2:**
  1. Captura diária rodando em 100% dos clientes com autorização, com NSU avançando (NFE-003) e contagem conferida contra a ferramenta atual (base para GES-604 e GES-605).
  2. XMLs entrando no core pela plataforma (NFE-033 ou GES-609) em pelo menos um fechamento.
  3. Calendário do mês gerado pela plataforma (FIS-001), com recibos anexados (FIS-003) em 100% das entregas: é a condição para desligar Acessórias e Nibo Obrigações.
  4. Caixas postais lidas diariamente (FIS-005, FIS-026, DP-040) e processos modelados (GES-206).

### Fase 2 · Atendimento e documentos

- **Objetivo:** o cliente fala com o escritório por um número oficial, recebe tudo num portal e app com a marca do escritório, pede serviços por formulário, e o agente responde o que é status ou FAQ. Documentos e pendências passam a ter dono e prazo.
- **Habilitadoras:** GES-023 multiatendimento (61) · GES-040 pedidos padronizados no portal (29) · GES-039 portal com tudo o que o escritório produz (22) · DP-001 pedido de admissão (19) · GES-104 ativação do cliente no app (17) · GES-026 e GES-031 (13 cada) · PF-004 coleta de documentos do IRPF (12).
- **Também nesta fase:** a abertura de empresas (SOC-105, corrigida para cá, e SOC-025 a SOC-028), o resto do DP mensal (DP-019 a DP-021, entrega e cobrança das guias da folha), as respostas técnicas com base citada (CON-001, CON-002), a leitura de atividades do core (GES-048, corrigida para cá) e **todas as migrações de ferramentas de atendimento, tarefas, portal e captura** (GES-601 a GES-607).
- **O que destrava a fase 3:**
  1. 100% das conversas com clientes pelo número oficial (GES-023, GES-037), com consentimento registrado (GES-031) e histórico preservado (GES-203).
  2. Guias e holerites entregues pelo portal com confirmação de leitura (GES-039, DP-020).
  3. Ferramentas da onda 1 e 2 desligadas, ou em paralelo com critério medido (seção 7).

### Fase 3 · Financeiro e gestão do escritório

- **Objetivo:** o escritório fatura, cobra, dá baixa e concilia o próprio caixa na plataforma, e mede tempo, custo e rentabilidade por cliente.
- **Habilitadoras:** GES-001 emissão de boleto/Pix/débito (37) · GES-003 baixa (21) · GES-042 funil de prospects (14) · GES-055 custo-hora (11) · FIN-003 contas a pagar do escritório (8) · GES-013 rentabilidade por cliente (7) · FIN-004 conciliação do caixa (7).
- **Maiores ganhos:** GES-003 e GES-004 (baixa e régua de cobrança, 20 h cada), FIN-004, FIN-005 (fluxo de caixa), GES-016, GES-049 e GES-050 (produtividade e tempo), GES-403 (previsão de carga).
- **Pré-condição forte:** **API de cobrança de banco** (Asaas, Efí ou banco com API, V3 · I-14) antes de GES-001. Sem ela, a cobrança continua no sistema antigo (seção 7).
- **O que destrava a fase 4:** um ciclo completo de cobrança emitido e baixado pela plataforma (GES-001, GES-003), migração do financeiro concluída e saldos conferidos (FIN-014), custo-hora definido (GES-055) para precificar a consultoria.

### Fase 4 · Consultoria e IA avançada

- **Objetivo:** transformar a base de dados capturada em pareceres, simulações, recuperação de créditos e preparação para a reforma, sempre com revisão humana.
- **Habilitadoras:** CON-028 tabela de alíquotas da reforma (21) · CON-015 classificação da carteira por exposição à reforma (16) · CON-008 (9) · CON-016 projeção de carga na transição (6) · DP-201 convenções coletivas resumidas por IA (5) · CTB-045 (5).
- **Maiores ganhos:** CON-015, FIS-045, CON-004 (base de pareceres), CON-016, DP-058 e GES-028 (respostas técnicas), CON-005 (normas novas que afetam pareceres) e GES-201 (auditoria de atendimentos).
- **O que destrava a fase 5:** base de pareceres viva (CON-004), classificação da carteira pela reforma (CON-015) e custo de cada consultoria medido. Com isso, os pacotes por nicho podem ser vendidos com preço.

### Fase 5 · Nichos e expansão

- **Objetivo:** ativar pacotes por nicho (construção, saúde, e-commerce, agro, terceiro setor), BPO e crescimento de carteira (compra de carteira, prospecção).
- **Habilitadoras:** NIC-001 detecção de nicho pelo CNAE (14) · TS-001 perfil do terceiro setor (26) · TS-006 escrituração ITG 2002 (14).
- **Maiores ganhos:** NIC-018 conciliação de marketplaces (30 h), NIC-004 dossiê de obra, NIC-016 DIFAL, NIC-017, NIC-015 repasses de hospitais.
- **Entrada:** só faz sentido quando a carteira tem o nicho. NIC-001 marca os clientes e mostra o tamanho do pacote antes do investimento.

---

## 4. Caminho crítico

Cadeias medidas no grafo de pré-requisitos (fase entre parênteses). As fases 0 e 1 aparecem em todas.

| Destino | Cadeia |
| --- | --- |
| **Captura de XML (NF-e)** | SOC-001 cadastro (0) → SOC-008 cofre de certificados (0) → SOC-005 IE/IM (1) → NFE-001 cadastro de captura (1) → **NFE-004** NF-e destinadas (1) |
| … pelo lado da autorização | SOC-001 (0) → SOC-004 pessoas ligadas (0) → SOC-014 gov.br prata/ouro (0) → **SOC-011 autorização de acesso** (0) → SOC-012 confirmação (0) → NFE-004 / NFE-007 / FIS-005 (1) |
| **Desligar o SIEG** | … → NFE-004 (1) → NFE-033 envio ao core (1) → NFE-036 guarda (1) → **GES-604** (2, desligamento por último) |
| **Calendário e Acessórias** | SOC-001 (0) → SOC-002 perfil (0) → FIS-024 declarações por UF (1) → FIS-001 calendário (1) → FIS-003 recibos (1) → **GES-601** (2) |
| **Folha (cadeia mais longa, 11 elos)** | SOC-001 → SOC-002 → FIS-024 → FIS-001 → DP-009 variáveis → DP-010 ponto → DP-011 digitação → DP-016 S-1200/S-1299 → DP-017 DCTFWeb → DP-020 pacote de guias (2) → DP-021 cobrança do pagamento (2) |
| **Contábil** | SOC-001 (0) → CTB-001 o que deve chegar (0) → CTB-008 extratos (1) → CTB-016 de-para (1) → CTB-015 classificação (1) → **CTB-017** envio ao core (1) |
| **Portal / Onvio** | SOC-001 (0) → GES-041 quem vê o quê (0) → GES-039 portal (2) → **GES-603** (2) |
| **Cobrança própria** | SOC-001 (0) → SOC-015 perfil e honorário (0) → SOC-016 contrato (0) → FIN-001 assinatura (0) → GES-001 emissão (3) → GES-003 baixa (3) → **FIN-604** troca do provedor (3) → FIN-601/602/603 (3) |

**O gargalo de calendário é humano.** Os elos SOC-014 (o sócio sobe a conta gov.br para prata/ouro) e SOC-011 (o sócio outorga a autorização) dependem de uma ação do cliente e têm autonomia "organiza e lembra". O agente só lembra e acompanha. Em escritórios grandes, essa campanha leva semanas `[ESTIMATIVA]`, por isso deve começar **no primeiro dia da fase 0**, em paralelo com o cadastro, e por coortes. Os outros elos do caminho até a captura são técnicos e o agente os faz sozinho. A guarda do certificado (SOC-008) também depende do cliente: sem A1 no cofre, a captura por certificado não roda, e o caminho alternativo é a autorização (B5).

---

## 5. Ordem sugerida: escritório de 50 clientes

Perfil `[ESTIMATIVA]`: 4 a 6 pessoas, um responsável por setor, muitas vezes sem financeiro dedicado. As atividades da fase 1 somam cerca de 427 h/mês nesse porte, das quais cerca de 300 são liberáveis. O custo fixo de implantar pesa mais que o volume. Por isso a regra é **pacote mínimo por fase, sem as trilhas opcionais**.

| Onda | Quando `[ESTIMATIVA]` | O que implantar (em ordem) | O que fica para depois |
| --- | --- | --- | --- |
| **0** | semanas 1 a 3 | SOC-001 → SOC-002 → SOC-004 → SOC-008 (+SOC-009, SOC-010) → **campanha SOC-014 → SOC-011 → SOC-012** no dia 1 → FIS-007 → SOC-015/SOC-101/SOC-016 → FIN-001 → GES-021 e GES-041 (perfis simples) → GES-047 → CIC-001 → CTB-001 → DP-042 → GES-608 | GES-017 (a carteira por analista é óbvia nesse porte), BPO-001 a BPO-006, GES-054 em versão curta |
| **1a** | meses 1 e 2 | Pela ordem de horas liberáveis: FIS-005 (e-CAC) · NFE-001 → NFE-004, NFE-007, NFE-005, NFE-014 → NFE-003 → NFE-036 → NFE-033 · CTB-004 (triagem do WhatsApp) · FIS-026 e FIS-029 (caixas postais estaduais e municipais) · DP-040 (DET) · SOC-007 · FIS-024 → FIS-001 → FIS-003 → FIS-002 · SOC-046 | NFE-501 a NFE-504 só para os clientes sem certificado ou fora do ADN |
| **1b** | mês 2 e 3 (2 fechamentos) | DP-009 → DP-010 → DP-011 → DP-016 → DP-017 · DP-038 · CTB-008 → CTB-016 → CTB-015 → CTB-017 · CTB-005 · CTB-024 · NFE-023 e NFE-016 (conferência) · GES-206 | CTB-040 (encerramento anual) na época do balanço |
| **2** | mês 3 e 4 | GES-023 → GES-031 → GES-026 → GES-024 → GES-036 → GES-037 · GES-204 → GES-104 → GES-039 → GES-040 → GES-025 · DP-020 → DP-021 · CTB-201 · migrações GES-606, GES-601 ou GES-607, GES-603, GES-605 | GES-035 (resposta fora do expediente) quando o volume justificar. GES-048 só se o Gestta estiver em uso |
| **3** | mês 4 e 5 (1 a 2 ciclos de cobrança) | **API do banco** → FIN-014 → GES-001 → GES-003 → GES-004 → GES-007 → FIN-604 → FIN-601/602/603 → FIN-004 → FIN-016 | GES-049/GES-050 (tempo por janela) e GES-013 (rentabilidade fina): com 50 clientes, um custo-hora simples (GES-055) basta |
| **4** | a partir do mês 5, seletivo | **FIS-045 antecipado** · CON-028 → CON-015 → CON-016 · CON-004 · CON-002/GES-028 com base citada | O resto da fase 4 entra conforme a venda de consultoria |
| **corte final** | depois do ciclo de cobrança | **GES-604: desligar o SIEG** após 2 fechamentos seguidos em paridade | — |
| **5** | só se houver nicho | NIC-001 → pacote do nicho. PF-004 a PF-011 na temporada do IRPF (a fase 2 já habilita) | BPO, TS |

**Por que essa ordem:** com 50 clientes, as cinco caixas postais e as 25 atividades de captura de notas com autonomia S devolvem, juntas, quase metade (cerca de 47%) das horas liberáveis da fase 1. Elas são S (o agente faz sozinho) e não exigem mudar o jeito de trabalhar da equipe. O multiatendimento (GES-023) depende só do cadastro e pode começar no mês 2 se o WhatsApp for a dor principal. A fase continua sendo 2 porque o critério de saída (portal e app com confirmação de leitura) depende de GES-039.

---

## 6. Ordem sugerida: escritório de 500 clientes

Perfil `[ESTIMATIVA]`: 35 a 50 pessoas, coordenadores por setor, financeiro próprio. As atividades da fase 1 somam cerca de 4.200 h/mês, das quais cerca de 2.960 são liberáveis. Aqui o volume domina. Duas regras mudam a ordem: **implantar por coortes de clientes** (50 a 100 por vez, por regime ou por analista) e **pôr governança antes de automação** (permissões, carteira e processos).

| Onda | Quando `[ESTIMATIVA]` | O que implantar (em ordem) | Diferença em relação ao de 50 |
| --- | --- | --- | --- |
| **0** | semanas 1 a 6 | **Campanha SOC-014 → SOC-011 → SOC-012 no dia 1, por coorte** · SOC-001/002/004 em lote (importação do core ou da Acessórias, GES-601) · SOC-008 + SOC-009 + SOC-010 · FIS-007 · GES-021 + **GES-017** (carteira por analista) + GES-041 · GES-047 + GES-056 · GES-054 + SOC-020 · GES-058 · SOC-015/016/101 + FIN-001 · CTB-001 · DP-042 · DP-101 · GES-608 · GES-204 | GES-017, GES-054 e GES-056 entram já na fase 0: com dezenas de pessoas, quem vê o quê e quem responde por quem é risco de LGPD e de erro |
| **1a** | meses 1 e 2, coorte 1 | Maiores ganhos com 500 clientes (50 a 100 h/mês cada): NFE-004, NFE-007, NFE-005, NFE-006, NFE-009 → NFE-003 → **NFE-033 ou GES-609** → NFE-036 → NFE-018 · FIS-005, FIS-026, FIS-029, DP-040, SOC-007 · CTB-004 · FIS-024 → FIS-001 → FIS-003 → FIS-002 · **GES-206** (processos modelados antes de escalar) | GES-206 e o envio ao core sobem de prioridade: com 500 clientes, digitar XML no core ocupa pessoas inteiras |
| **1b** | meses 2 a 4, coortes 2 a N | Mesmas atividades para as demais coortes + NFE-501/NFE-502 (sem certificado) · NFE-023 e NFE-016 (conferência item a item, 100 h/mês cada) · DP-038, DP-043, DP-009 → DP-016 → DP-017 · CTB-008 → CTB-016 → CTB-015 → CTB-017 → CTB-005 → CTB-024 → CTB-026 | Conferência tributária (P) entra na fase 1: no volume, o erro de fornecedor vira multa recorrente |
| **2** | meses 3 a 6 | GES-023 → **GES-024** (roteamento por setor) → GES-031 → GES-026 → GES-036 → GES-062 (o que a IA responde sozinha) → GES-025 → GES-035 → GES-034 · GES-204 → GES-104 → GES-039 → GES-040 → GES-405 · DP-060 · CTB-201 · **GES-048** (o que foi feito no core) · CON-001 → CON-002 · migrações GES-606, GES-601/607, GES-602, GES-603, GES-605 | Roteamento, revisão da IA (GES-062) e leitura do core vêm antes do FAQ: sem eles, o multiatendimento vira gargalo |
| **3** | meses 5 a 8 | GES-016 → GES-049 → GES-050 → GES-055 → GES-013 → GES-403 → GES-404 (produtividade e custo) · **API do banco** → FIN-014 → GES-001 → GES-003 → GES-004 → GES-007 → FIN-604 → FIN-601/602/603 · FIN-003 → FIN-004 → FIN-005 → FIN-006 · GES-019 | Medição de tempo e rentabilidade vem **antes** da troca de cobrança: num escritório grande, ela é a base do reajuste e da precificação (GES-102) |
| **4** | a partir do mês 6 | **FIS-045 antecipado** · CON-028 → CON-015 → CON-016 → CON-023 · CON-004 → CON-005 · GES-028, DP-058 · GES-201 (auditoria de atendimentos) · NFE-040 · DP-201 | GES-201 entra cedo: com milhares de conversas por mês, só a amostragem por IA cobre a qualidade |
| **corte final** | após o ciclo de cobrança | **GES-604: desligar o SIEG**, coorte por coorte, quando cada uma tiver 2 fechamentos em paridade | — |
| **5** | por segmento da carteira | NIC-001 (mede o tamanho de cada nicho) → pacotes NIC · TS · BPO (se o escritório contratar ou operar BPO) · CIC-005/BPO-017 (carteira em bloco) | No porte grande, NIC-001 costuma mostrar dezenas de clientes por nicho, e o pacote se paga logo |

---

## 7. Desligamento das ferramentas atuais com operação em paralelo

**Princípios (de B6 · 4.1):** nada é desligado sem paralelo com critério de saída medido. Histórico é copiado com data, hora e autor originais. A ordem segue o risco: primeiro sai o que falha barato (mensagens e tarefas), depois o financeiro (falha = receita perdida) e **por último a captura de XML** (falha = escrituração incompleta e multa). O plano por escritório é a ficha **GES-608**, na fase 0.

| Ordem | Ferramenta | Fase mínima da plataforma | Pré-requisitos (fichas) | Paralelo mínimo | Critério para desligar | Ficha |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | **HubStrom** (atendimento, app) | 2 | GES-023, GES-037, GES-204, GES-104 | 2 semanas | 100% das conversas pelo número oficial. Clientes ativos no app novo | GES-606 |
| 2 | **Acessórias** ou **Nibo Obrigações** | 2 | FIS-001, GES-206, GES-039, GES-041 | 1 fechamento | Todas as entregas do mês com protocolo na plataforma. Histórico de protocolos importado e conferido por amostragem | GES-601, GES-607 |
| 3 | **Gestta / Domínio Processos** | 2 | GES-206, **GES-048** (ou conclusão por evidência), FIS-001 | 1 fechamento | Tarefas do mês geradas e concluídas na plataforma. Relatórios Excel arquivados | GES-602 |
| 4 | **Onvio Portal do Cliente** (o Domínio core continua) | 2 | GES-039, GES-041, GES-104, GES-204 | 1 fechamento | Guias e holerites do mês entregues pela plataforma com confirmação de leitura | GES-603 |
| 5 | **Qive** (se usada) | 2 | NFE-004, NFE-036, SOC-008, SOC-012 | 1 fechamento | Contagem de XMLs da plataforma ≥ Qive por CNPJ. Certificados dos clientes migrados para o cofre | GES-605 |
| 6 | **Conexa / Omie / Nibo** (financeiro do escritório) | 3 | FIN-001, FIN-014 + **API do banco**, GES-001, GES-003, FIN-604 | 1 ciclo de cobrança completo | Todos os títulos novos emitidos pela plataforma. Carteira antiga liquidada ou cancelada. Saldos batem | FIN-602, FIN-603 |
| 7 | **Conta Azul** (boleto e Pix) | 3 | Idem + autorizações de Pix Automático refeitas (FIN-604) | 1 a 2 ciclos | Último título do Conta Azul liquidado ou baixado. Nenhuma recorrência ativa lá | FIN-601, FIN-604 |
| 8 | **SIEG**, por último | 2 para iniciar a paridade; corte só depois da ordem 7 | NFE-003, NFE-004, NFE-005, NFE-006, NFE-007, NFE-009, NFE-036, NFE-033 (ou GES-609), SOC-008 | **2 fechamentos seguidos** | Para cada CNPJ e tipo, contagem da plataforma ≥ `/ContarXmls` nos dois meses. NSU avançando todo dia. Core recebendo da plataforma. Cofre baixado inteiro por `/BaixarXmls` e eventos por `/BaixarEventos` | GES-604 |

**Regras de sequência:**

- **Cobrança só depois da API do banco.** Nenhuma ferramenta financeira (ordens 6 e 7) é desligada antes que GES-001 emita e GES-003 dê baixa pela API de cobrança (Asaas, Efí ou banco com API). Títulos já emitidos não migram: terminam no sistema antigo, e só as cobranças novas nascem no provedor novo. No Conexa, a recorrência antiga é encerrada **na mesma data** em que começa a nova (FIN-603).
- **SIEG por último.** A paridade com o SIEG pode começar na fase 1, assim que a captura própria roda. O **corte** é o último passo de toda a migração, depois do ciclo de cobrança, porque é o único cuja falha não aparece na hora: um XML que falta só aparece no fechamento ou na fiscalização. Antes de cancelar, o cofre inteiro é baixado para a guarda (NFE-036).
- **O core não é desligado.** Domínio, Alterdata, Contmatic, Questor, SCI, Fortes e Prosoft continuam. A plataforma lê e escreve no core (NFE-033, CTB-017, GES-609, GES-048). O que sai são as ferramentas em volta dele.
- **Coortes (500 clientes):** cada ferramenta pode sair por coorte, mas o contrato com o fornecedor só é cancelado quando a última coorte cumprir o critério. Antes de marcar a data, conferir aviso prévio e fidelidade de cada contrato (os termos não foram lidos, B6 · 4.1 `[NÃO VERIFICADO]`).

Calendário indicativo `[ESTIMATIVA]`: com 50 clientes, as ondas 1 a 5 terminam por volta do mês 4, o financeiro no mês 5 e o SIEG no mês 6. Com 500 clientes, as ondas 1 a 5 terminam entre os meses 5 e 6, o financeiro entre 7 e 8, e o SIEG entre 8 e 9.

---

## 8. Pontos para a conversa com os contadores

1. **Antecipar FIS-045** (destaque de CBS/IBS, fase 4) para logo depois da captura? A rejeição já vale, e os pré-requisitos estão nas fases 0 e 1.
2. **SOC-105 na fase 2** (planejamento da abertura junto com a abertura) e **GES-048 na fase 2** (leitura do core antes de desligar o Gestta): confirmar.
3. **Doméstico (DP-062 e PF-027) na fase 5:** muitos escritórios atendem doméstico como rotina. Se for o caso, as duas sobem juntas para a fase 2, porque DP-062 depende só de SOC-001 e DP-009.
4. **horas_100 das fichas antigas** são estimativas deste arquivo. Uma medição de uma semana em dois escritórios (um de cerca de 50 e outro de cerca de 500 clientes) mudaria a ordem dentro das fases, não a ordem das fases.
5. **Campanha de autorização (SOC-014/SOC-011)**: qual a taxa real de adesão dos sócios e em quanto tempo? É o elo que define o calendário inteiro.

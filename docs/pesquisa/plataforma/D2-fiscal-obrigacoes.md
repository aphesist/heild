# D2 · Descoberta: Fiscal e Obrigações

5 de novembro de 2026 · Etapa 1 do [Protocolo de Descoberta](00-protocolo-de-descoberta.md) · agente D2

Escopo: tudo o que o escritório faz **em volta** do core (Domínio, Alterdata, Contmatic) na área fiscal: calendário de obrigações federais, estaduais (SP, MG, PR, SC, RS) e municipais, e-CAC e caixa postal, Simples Nacional, MEI, DCTFWeb/MIT, EFD-Reinf, guias, parcelamentos, certidões, malhas e intimações, DTE estaduais e municipais, recuperação de créditos e conferência antes da transmissão. Apuração e geração de arquivos SPED ficam fora (regra 3.7).

## Como ler este arquivo

- **47 fichas** (FIS-001 a FIS-047), agrupadas por subárea. Campos da seção 2.1 do protocolo.
- **Fontes:** citadas por código (`[S7]`, `[C3]`) e listadas com link na seção "Fontes" ao final. Todas consultadas em **05/11/2026**.
- **Limitação de método importante:** nesta sessão a leitura direta de páginas (WebFetch) foi bloqueada pela rede (hosts fora da lista permitida). As fontes foram lidas pelos **resumos e trechos do buscador** (WebSearch). Por isso: (a) prazos e normas citados aqui têm confiança **média**; (b) a Etapa 2 deve abrir as normas originais (IN RFB, Resoluções CGSN, RICMS de cada UF) antes de qualquer prazo virar regra no calendário; (c) onde o buscador trouxe fontes conflitantes, as duas versões estão registradas.
- **`tempo_estimado`:** nenhuma fonte pública trouxe medições de tempo por atividade. Todos os tempos são `[ESTIMATIVA]` do agente e devem ser substituídos pelo levantamento com os contadores (Apêndice do Plano).
- **Motores de IA:** M1 legal, M2 escritório, M3 cálculo, M4 ação. Níveis: **ler**, **rascunhar**, **executar** (executar sempre com cartão de aprovação; nunca automático quando o caminho for C-crc).
- **Nomes de ferramentas agênticas** são propostas de interface da plataforma, não serviços existentes.
- `transversal: Dx` indica atividade que se repete em outra aba e deve virar uma ferramenta só na Etapa 3.

## Achados que mudam as hipóteses do Plano (seções 3 e 4)

1. **Opção pelo Simples Nacional saiu de janeiro.** Para 2027 a opção foi feita em set–out/2026 (prorrogada; datas divergem entre 30/09 e 15/10), com regularização de pendências até 30/10/2026 e cancelamento em janela de nov–dez/2026; janeiro fica só para o SIMEI (até 29/01/2027) [S14]. O calendário do Plano precisa refletir isso.
2. **Opção semestral pelo regime regular de IBS/CBS para optantes do Simples** (Res. CGSN 186/2026; janela para o 1º semestre de 2027 até 30/10/2026; próxima em março/2027) [S15]. Cria uma rotina nova, recorrente e consultiva por cliente (FIS-015).
3. **Multa por atraso do PGDAS-D e da DEFIS passou a ser aplicada desde 01/01/2026** (LC 214/2025 e Res. CGSN 183/2025 citadas pelas fontes) [S11]. Antes não havia multa efetiva; isso aumenta o risco de FIS-009 e FIS-013.
4. **Prazo de regularização do Termo de Exclusão do Simples subiu de 30 para 90 dias** (LC 216/2025), contestação continua em 30 dias [S13].
5. **DCTF convencional substituída pela DCTFWeb com MIT** desde jan/2025 [S9]; prazo de entrega da DCTFWeb passou ao último dia útil do mês seguinte (IN RFB 2.248/2025) [S8]. **DCTFWeb "em andamento" bloqueia a CND** [S10].
6. **DTE federal compulsório para PJ desde 2026** (atribuição automática) [S25]; ciência tácita em 15 dias no DTE geral e 45 dias no DTE-SN, segundo as fontes (conflito a verificar).
7. **SP dispensou a GIA do RPA a partir de jan/2026 e a GIA-ST a partir de jul/2025**; retificações de períodos anteriores continuam exigidas [S18][S19]. SC está em fases de dispensa da DIME [S20].
8. **Robôs no e-CAC são combatidos pela RFB** (funcionalidade anti-robô) [S7]; o caminho federal recomendado é o Integra Contador, que já tem 44+ serviços, incluindo monitoramento gratuito de eventos de Caixa Postal, DCTFWeb e Pagamento Web [S2], DCTFWeb/MIT ampliados em 2025 [S3] e parcelamentos (Integra Parcelamento, PARCSN) [S4].

---

## A. Calendário, controle de entregas e conferência

### FIS-001 · Gerar o calendário mensal de obrigações de cada cliente

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Fiscal / Calendário de obrigações |
| atividade | Gerar, no início de cada mês, a lista de obrigações e guias de cada cliente com prazo legal e prazo interno |
| descrição | Hoje: o core ou um gestor de tarefas (Gestta, Acessórias, Onvio Processos) tem uma matriz "regime × obrigação" parametrizada à mão; o gestor revisa por cliente e ajusta exceções (filial em outra UF, ST, ISS retido, folha). Erros de parametrização aparecem só quando a obrigação atrasa |
| gatilho_frequência | Mensal (último dia útil do mês anterior) + por evento (mudança de regime, CNAE, UF, início de folha) |
| porte_alcance | Todos os clientes |
| quem_faz | Coordenador fiscal / gestor de processos |
| onde_é_feita_hoje | Gestor de tarefas (Gestta, Acessórias, Onvio Processos), planilha, core |
| entradas / saídas | Perfil do cliente (regime, UF, município, CNAE, folha, ST, benefícios) + tabela de prazos versionada → lista de tarefas com responsável e datas |
| base_legal | Uma por obrigação (ver FIS-009 a FIS-030). Ex.: DCTFWeb IN RFB 2.237/2024 alt. IN 2.248/2025 [S8]; EFD-Reinf dia 15 [S12]; PGDAS-D dia 20 [S11] |
| risco_se_falhar | Obrigação esquecida = multa por atraso (ex.: PGDAS-D 2% a.m. limitada a 20% desde 2026 [S11]), CND bloqueada, perda do cliente |
| tempo_estimado | `[ESTIMATIVA]` 2–4 h/mês do coordenador para revisar 100 clientes; 30 min por cliente novo para parametrizar |
| concorrentes | Gestta vem "parametrizado com todas as obrigações e tarefas comuns" e exige o regime de cada cliente [C2]; Acessórias organiza processos e prazos com alertas [C1]; Nibo Obrigações Plus identifica obrigações a partir de documentos carregados [C11] |
| hipótese_automação | Calendário **derivado da base legal temporal** e do perfil temporal do cliente (Plano 4.2): regra "se perfil X na data D então obrigação Y com prazo Z", com feriados e prorrogações; diferencial sobre a matriz manual dos concorrentes |
| papel_da_ia | M2 (perfil na data) + M1 (regra e prazo vigentes) → **rascunhar** o calendário; M4 **executar** a criação das tarefas após aprovação do coordenador. Prazo nunca gerado só pelo modelo: vem de tabela versionada |
| ferramentas_agênticas | `gerar_calendario(cliente, competencia)`, `listar_obrigacoes_aplicaveis(cliente, data)`, `explicar_obrigacao(cliente, obrigacao)` (cita a norma), `criar_tarefas_lote(lista)` |
| eventos_timesheet | `fiscal.calendario.gerado` (cliente, competência, nº de obrigações, gerado por IA/pessoa, aprovado por) |
| fontes_descoberta | [S8] [S11] [S12] [C1] [C2] [C11] |

### FIS-002 · Acompanhar prorrogações e mudanças de prazo e reprogramar as tarefas

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Fiscal / Calendário de obrigações |
| atividade | Detectar prorrogações, feriados locais e mudanças de prazo e atualizar as tarefas já criadas |
| descrição | O analista lê notícias (Jornal Contábil, Contábeis, sites das Sefaz) e grupos de WhatsApp; ajusta o prazo das tarefas manualmente. Ex. real: RS antecipou GIA e EFD de fev/2026 para dia 18 por causa do carnaval [S21]; DCTFWeb mudou de dia 15 para 25 e depois para o último dia útil [S8]; opção pelo Simples para 2027 foi prorrogada [S14] |
| gatilho_frequência | Por evento (publicação de norma); verificação diária |
| porte_alcance | Clientes afetados pela norma (UF, regime) |
| quem_faz | Coordenador fiscal |
| onde_é_feita_hoje | Notícias, e-mail, WhatsApp, gestor de tarefas |
| entradas / saídas | Norma/ato de prorrogação → prazos reprogramados + aviso à equipe |
| base_legal | Atos de prorrogação (IN, Portaria, Resolução CGSN, IN RE-RS etc.) |
| risco_se_falhar | Entrega fora do prazo (se prazo antecipado) ou trabalho desnecessariamente apressado |
| tempo_estimado | `[ESTIMATIVA]` 1–2 h/semana de leitura de notícias por coordenador |
| concorrentes | Gestta diz que as associações de tarefas são personalizáveis quando a legislação muda [C2] (manual). Nenhum concorrente encontrado com reprogramação automática a partir da norma `[NÃO ENCONTRADO]` (buscado: "prorrogação automática prazos obrigações software contábil") |
| hipótese_automação | "Vigia da lei" (Plano 4.2) aplicado a prazos: coletor de normas detecta ato de prorrogação, propõe a nova data e lista as tarefas afetadas |
| papel_da_ia | M1 **ler** a norma e extrair prazo novo; M2 achar clientes/tarefas afetados; M4 **rascunhar** a reprogramação (aprovação do coordenador) |
| ferramentas_agênticas | `detectar_alteracao_prazo(norma)`, `listar_tarefas_afetadas(obrigacao, uf, competencia)`, `reprogramar_tarefas(lista, novo_prazo)` |
| eventos_timesheet | `fiscal.prazo.reprogramado` (obrigação, nº de tarefas, norma, aprovado por) |
| fontes_descoberta | [S8] [S14] [S21] [C2] |

### FIS-003 · Comprovar a entrega: anexar recibo de transmissão e dar baixa na tarefa

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Fiscal / Controle de entregas |
| atividade | Anexar o recibo de cada declaração transmitida e marcar a obrigação como entregue |
| descrição | Após transmitir no PVA, no portal ou pelo core, o analista salva o recibo em PDF numa pasta e dá baixa manual no gestor de tarefas. Muitas vezes a baixa é feita sem o recibo, e o recibo some quando é pedido em fiscalização |
| gatilho_frequência | A cada transmissão (dezenas a centenas por mês) |
| porte_alcance | Todos os clientes |
| quem_faz | Analista fiscal |
| onde_é_feita_hoje | PVA/portais, pasta de rede, gestor de tarefas |
| entradas / saídas | Recibo (PDF/XML) → tarefa concluída, recibo arquivado por cliente/competência |
| base_legal | — (controle interno; prova de cumprimento) |
| risco_se_falhar | Baixa indevida esconde omissão (multa, CND bloqueada); sem recibo não há prova em defesa |
| tempo_estimado | `[ESTIMATIVA]` 2–3 min por obrigação |
| concorrentes | Alterdata eTarefas faz baixa automática a partir de envios do Updocs/desktop [C9]; Domínio tem rotinas automáticas de DARF da DCTFWeb [C10]; Acessórias guarda protocolo digital dos envios [C1] |
| hipótese_automação | Baixa automática por evidência: recibo lido por API (Integra Contador para DCTFWeb/PGDAS-D [S1][S3]; EFD-Reinf/eSocial), por arquivo exportado do core ou por upload com leitura do PDF; tarefa só fecha com recibo anexado |
| papel_da_ia | M4 **executar** (baixa por evidência, sem aprovação quando a evidência é oficial); IA lê PDF do recibo (extração) |
| ferramentas_agênticas | `anexar_recibo(tarefa, arquivo)`, `consultar_recibo_oficial(cliente, obrigacao, competencia)`, `baixar_tarefa_por_evidencia(tarefa)` |
| eventos_timesheet | `fiscal.entrega.comprovada` (cliente, obrigação, competência, origem do recibo, pessoa/IA) |
| fontes_descoberta | [S1] [S3] [C1] [C9] [C10] |

### FIS-004 · Conferir antes de transmitir (pré-validação cruzada)

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Fiscal / Conferência |
| atividade | Conferir a apuração e a declaração antes da transmissão, cruzando fontes independentes |
| descrição | O analista confere à mão: receita do PGDAS-D × notas de saída; segregação de monofásico/ST/ISS retido; DCTFWeb × EFD-Reinf × eSocial (toda retificação de Reinf/eSocial gera nova DCTFWeb em andamento [S31-b]); EFD × XMLs; valor da guia × mês anterior. Muitas vezes só há tempo de conferir os clientes maiores |
| gatilho_frequência | Mensal, antes de cada transmissão |
| porte_alcance | Todos; crítico para Simples com produtos monofásicos/ST e Lucro Presumido/Real |
| quem_faz | Analista fiscal sênior / revisor |
| onde_é_feita_hoje | Relatórios do core, Excel, PVA, portal do Simples |
| entradas / saídas | Rascunho da apuração/declaração + XMLs + declaração anterior → lista de divergências e "ok para transmitir" |
| base_legal | Cada obrigação; multa por incorreção na EFD-Reinf/DCTFWeb citada como R$ 20 por grupo de 10 informações [S12] `[confirmar na Etapa 2]` |
| risco_se_falhar | Tributo a maior (prejuízo do cliente) ou a menor (malha, multa de ofício); retificações em cascata |
| tempo_estimado | `[ESTIMATIVA]` 10–40 min por cliente/mês |
| concorrentes | e-Auditoria e eSimples Auditoria vendem auditoria de PGDAS-D/SPED [C5]; Omie G-Click ValidaPDF valida dados de anexos [C11]. PVAs oficiais validam leiaute, não coerência |
| hipótese_automação | Conjunto de regras determinísticas de coerência (variação anômala, receita × XML, segregação por NCM monofásico, Reinf × DCTFWeb) que gera um relatório de divergências por cliente antes do prazo interno |
| papel_da_ia | M3 (regras e somas) + M2 (dados do cliente) + M1 (regra de segregação vigente) → **ler/rascunhar** um parecer de conferência; nunca transmite |
| ferramentas_agênticas | `conferir_pgdas(cliente, competencia)`, `cruzar_reinf_dctfweb(cliente, competencia)`, `comparar_com_mes_anterior(cliente, obrigacao)`, `listar_divergencias(cliente)` |
| eventos_timesheet | `fiscal.conferencia.executada` (cliente, obrigação, nº divergências, pessoa/IA, revisor) |
| fontes_descoberta | [S12] [S31] [C5] [C11] |

---

## B. e-CAC, caixa postal e situação fiscal federal

### FIS-005 · Ler a caixa postal do e-CAC (DTE) de todos os clientes

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Fiscal / e-CAC |
| atividade | Ler diariamente a caixa postal do e-CAC de cada cliente, classificar e encaminhar o que exige ação |
| descrição | Analista entra no e-CAC com o e-CNPJ do escritório, troca de perfil para cada cliente (procuração) e abre as mensagens; o aviso por e-mail/SMS (até 3 e-mails e 3 celulares) nem sempre traz o conteúdo [S25]. Com centenas de CNPJs, a leitura vira amostragem |
| gatilho_frequência | Diária (ideal); na prática semanal |
| porte_alcance | Todas as PJ (DTE compulsório desde 2026 [S25]) |
| quem_faz | Analista fiscal / assistente |
| onde_é_feita_hoje | Portal e-CAC; robôs de terceiros |
| entradas / saídas | Mensagens da RFB → resumo, classificação (informativa, intimação, termo de exclusão, cobrança), prazo, responsável, tarefa |
| base_legal | Decreto 70.235/1972, art. 23 (ciência no 15º dia após o registro na caixa postal, segundo as fontes) [S25]; DTE-SN: 45 dias (LC 123/2006) [S25] `[confirmar]` |
| risco_se_falhar | Ciência tácita corre sem leitura: perda do prazo de defesa, exclusão do Simples, débito inscrito em dívida ativa |
| tempo_estimado | `[ESTIMATIVA]` 1–3 min por cliente/dia sem automação |
| concorrentes | Jettax (Módulo Prevenção) monitora pendências e intimações do e-CAC [C3]; e-Auditoria lê caixa postal via Integra Contador [C5]; HubCount Alertas+ [C4]; Dootax Caixa Postal Fiscal [C6]; Alterdata eRadar e-CAC [C9] |
| hipótese_automação | Monitor de eventos da Caixa Postal (serviço gratuito do Integra Contador [S2]) + leitura das mensagens novas por API; IA resume e classifica; tarefa com prazo calculado a partir da data de registro |
| papel_da_ia | M4 **executar** leitura (só ler); IA **rascunha** resumo e classificação; M1 explica a base legal; M3 calcula a data de ciência tácita e o prazo de resposta |
| ferramentas_agênticas | `consultar_caixa_postal(cliente)`, `listar_mensagens_novas(desde)`, `resumir_mensagem(id)`, `calcular_prazo_ciencia(data_registro, tipo_dte)`, `abrir_tarefa(...)` |
| eventos_timesheet | `fiscal.caixa_postal.lida` (cliente, nº mensagens, IA/pessoa); `fiscal.caixa_postal.triagem` (mensagem, classificação, responsável) |
| fontes_descoberta | [S2] [S25] [C3] [C4] [C5] [C6] [C9] |

### FIS-006 · Emitir e comparar o relatório de situação fiscal federal

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Fiscal / e-CAC |
| atividade | Emitir o relatório de situação fiscal (pendências RFB/PGFN) de cada cliente e comparar com o anterior |
| descrição | Analista emite o relatório no e-CAC ("Certidões e Situação Fiscal") cliente a cliente, lê o PDF e procura pendências novas (omissão de declaração, débito, divergência GFIP/DCTFWeb, parcelamento em atraso) |
| gatilho_frequência | Mensal (após os vencimentos) e antes de pedir CND |
| porte_alcance | Todos os clientes PJ |
| quem_faz | Analista fiscal |
| onde_é_feita_hoje | Portal e-CAC |
| entradas / saídas | Relatório PDF → lista de pendências novas/resolvidas, tarefas |
| base_legal | Portaria Conjunta RFB/PGFN 1.751/2014 (certidões) [S26] |
| risco_se_falhar | Pendência descoberta só quando o cliente precisa da CND (licitação, financiamento); exclusão do Simples |
| tempo_estimado | `[ESTIMATIVA]` 5–10 min por cliente/mês |
| concorrentes | Jettax (situação fiscal federal, dívida ativa) [C3]; e-Auditoria (pendências via API) [C5]; HubCount [C4]; MonitorCNPJ [C13] |
| hipótese_automação | Consulta mensal por API (serviço de situação fiscal do Integra Contador, citado como SITFIS em pacote não oficial `[NÃO VERIFICADO]` em fonte oficial [S3-b]); diff estruturado com o mês anterior |
| papel_da_ia | M4 **executar** consulta; IA lê o relatório e **rascunha** o diff e o plano de regularização; M2 liga pendência a responsável |
| ferramentas_agênticas | `emitir_situacao_fiscal(cliente)`, `comparar_situacao_fiscal(cliente, mes_a, mes_b)`, `abrir_tarefa_regularizacao(cliente, pendencia)` |
| eventos_timesheet | `fiscal.situacao_fiscal.emitida`, `fiscal.pendencia.detectada` (cliente, tipo, valor) |
| fontes_descoberta | [S26] [C3] [C4] [C5] [C13] |

### FIS-007 · Controlar procurações eletrônicas no e-CAC e em outros órgãos

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Fiscal / e-CAC (transversal: D1) |
| atividade | Verificar se cada cliente tem procuração vigente para o escritório, com os serviços necessários, e renovar antes do vencimento |
| descrição | Procuração e-CAC é cadastrada pelo cliente (ou com o certificado dele); o escritório descobre que venceu quando tenta acessar. Integra Contador também depende de procuração para cada cliente [S5] |
| gatilho_frequência | Mensal (verificação) + por evento (cliente novo, troca de certificado) |
| porte_alcance | Todos |
| quem_faz | Assistente fiscal / societário |
| onde_é_feita_hoje | e-CAC, planilha |
| entradas / saídas | Lista de procurações → alerta de vencimento, pedido ao cliente |
| base_legal | Normas da procuração eletrônica RFB `[NÃO VERIFICADO]` (não buscado o ato vigente) |
| risco_se_falhar | Escritório perde acesso: caixa postal não lida, guias não emitidas, automação para |
| tempo_estimado | `[ESTIMATIVA]` 5 min por cliente/mês; 20–40 min para renovar com o cliente |
| concorrentes | Alterdata orienta contratação e procuração do Integra Contador [S5]; Integra Procurações existe desde o lançamento [S1] |
| hipótese_automação | Consulta periódica via Integra Procurações; alerta 30 dias antes; mensagem ao cliente com passo a passo |
| papel_da_ia | M4 **executar** consulta; **rascunhar** a mensagem ao cliente (aprovação) |
| ferramentas_agênticas | `consultar_procuracoes(cliente)`, `alertar_vencimento_procuracao(cliente)`, `enviar_instrucao_procuracao(cliente)` |
| eventos_timesheet | `cadastro.procuracao.verificada`, `cadastro.procuracao.renovacao_solicitada` |
| fontes_descoberta | [S1] [S5] |

### FIS-008 · Monitorar e tratar o Termo de Exclusão do Simples Nacional (DTE-SN)

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Fiscal / Simples Nacional |
| atividade | Identificar termos de exclusão por débito (federal, estadual ou municipal), regularizar ou contestar no prazo |
| descrição | RFB emite os termos em lote (ex.: out/2024 para exclusão em 01/01/2025) no DTE-SN/e-CAC; o relatório de pendências anexo é uma "fotografia" e pode listar débitos já pagos [S13]. Estados também notificam (ex. Sefaz-CE) |
| gatilho_frequência | Anual (lote do 2º semestre) + por evento |
| porte_alcance | Optantes do Simples e MEI com débitos |
| quem_faz | Analista fiscal + sócio (decisão de parcelar) |
| onde_é_feita_hoje | DTE-SN, e-CAC, PGFN Regularize, Sefaz/prefeitura |
| entradas / saídas | Termo + relatório de pendências → regularização (pagamento/parcelamento) ou defesa; comunicação ao cliente |
| base_legal | LC 123/2006; LC 216/2025 ampliou a regularização para 90 dias da ciência; contestação 30 dias (Decreto 70.235/1972) [S13] |
| risco_se_falhar | Exclusão do Simples a partir de 1º de janeiro: aumento de carga, reestruturação, perda do cliente |
| tempo_estimado | `[ESTIMATIVA]` 1–3 h por cliente notificado |
| concorrentes | Monitores de e-CAC/DTE detectam a mensagem [C3][C5]; tratamento é manual em todos `[NÃO ENCONTRADO]` fluxo dedicado |
| hipótese_automação | Detecção pela caixa postal (FIS-005) → fluxo com prazos (90/30 dias), conferência das pendências contra pagamentos (FIS-032), simulação de parcelamento, cartão para o sócio decidir |
| papel_da_ia | M1 (regra e prazos), M2 (débitos e pagamentos do cliente), M3 (parcelamento/valores), M4 **rascunhar** mensagem e pedido de parcelamento |
| ferramentas_agênticas | `detectar_termo_exclusao(cliente)`, `conferir_pendencias_vs_pagamentos(cliente)`, `simular_parcelamento(cliente, debitos)`, `abrir_fluxo_exclusao(cliente)` |
| eventos_timesheet | `fiscal.exclusao_sn.tratamento` (cliente, etapa, duração, decisor) |
| fontes_descoberta | [S13] [S25] [C3] [C5] |

---

## C. Simples Nacional

### FIS-009 · Transmitir o PGDAS-D mensal

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Fiscal / Simples Nacional |
| atividade | Transmitir a declaração mensal do Simples (PGDAS-D) de cada optante, com a receita segregada |
| descrição | O core apura; o analista confere a receita e a segregação (monofásico, ST, ISS retido, exportação, anexo pelo fator R) e transmite no portal do Simples ou importa o arquivo. Clientes sem movimento também declaram |
| gatilho_frequência | Mensal, até o dia 20 do mês seguinte [S11] |
| porte_alcance | Todos os optantes do Simples (exceto MEI) |
| quem_faz | Analista fiscal |
| onde_é_feita_hoje | Core + Portal do Simples Nacional; Integra SN via core/terceiros [S1][S5] |
| entradas / saídas | Receita do mês, segregação, folha (fator R) → declaração transmitida, recibo, extrato |
| base_legal | LC 123/2006; Res. CGSN 140/2018 `[NÃO VERIFICADO: artigo]`; multa por atraso efetiva desde 01/01/2026: 2% a.m. sobre o tributo declarado, limite 20%, mínimo R$ 50 ou R$ 200 conforme a fonte (conflito) — LC 214/2025, Res. CGSN 183/2025 [S11] |
| risco_se_falhar | Multa (MAED) desde 2026; tributo errado; malha (ex.: autorregularização de monofásico em 2023 [S30]) |
| tempo_estimado | `[ESTIMATIVA]` 5–15 min por cliente/mês (transmissão + conferência rápida) |
| concorrentes | Jettax apura e gera guias e envia ao Acessórias [C1]; e-Auditoria audita PGDAS-D [C5]; Alterdata e outros cores transmitem pelo Integra Contador [S5] |
| hipótese_automação | Transmissão via Integra SN (entrega e consulta do PGDAS-D e geração do DAS [S1]) a partir do valor aprovado na conferência (FIS-004); lote com aprovação única |
| papel_da_ia | M3 (valores), M4 **executar com aprovação** (transmissão em lote); IA explica variações |
| ferramentas_agênticas | `transmitir_pgdas(cliente, competencia, dados)`, `consultar_declaracao_pgdas(cliente, competencia)`, `transmitir_lote(clientes)` |
| eventos_timesheet | `fiscal.pgdas.transmitido` (cliente, competência, pessoa/IA, aprovado por) |
| fontes_descoberta | [S1] [S5] [S11] [S30] [C1] [C5] |

### FIS-010 · Emitir o DAS e enviar ao cliente

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Fiscal / Simples Nacional / Guias (transversal: FIS-031) |
| atividade | Gerar o DAS de cada optante e entregá-lo ao cliente com o valor e o vencimento |
| descrição | Analista gera o PDF no portal ou no core, renomeia, envia por e-mail/WhatsApp ou sobe no portal do cliente; responde "chegou a guia?" |
| gatilho_frequência | Mensal (vencimento dia 20) [S11] |
| porte_alcance | Optantes do Simples |
| quem_faz | Analista fiscal / atendimento |
| onde_é_feita_hoje | Portal do Simples, core, e-mail, WhatsApp |
| entradas / saídas | Declaração transmitida → PDF do DAS + mensagem ao cliente com protocolo de leitura |
| base_legal | LC 123/2006 (vencimento) |
| risco_se_falhar | Cliente não paga → multa e juros, débito que leva à exclusão (FIS-008) |
| tempo_estimado | `[ESTIMATIVA]` 2–4 min por guia (gerar, renomear, enviar) |
| concorrentes | Acessórias e-Contínuo envia guias com protocolo de leitura [C1]; Gestta envia guias pela tarefa [C2]; preço de revenda citado: R$ 0,75 por DAS via Integra Contador (Alterdata, 2025) [S5] |
| hipótese_automação | Geração do DAS por API logo após a transmissão e envio automático pela central de guias (FIS-031) |
| papel_da_ia | M4 **executar** (envio padrão aprovado uma vez por cliente); IA **rascunha** mensagem quando o valor variou muito |
| ferramentas_agênticas | `gerar_das(cliente, competencia)`, `enviar_guia(cliente, guia, canal)` |
| eventos_timesheet | `fiscal.guia.gerada`, `atendimento.guia.enviada` (cliente, tipo, canal, lida em) |
| fontes_descoberta | [S5] [S11] [C1] [C2] |

### FIS-011 · Monitorar sublimite e limite do Simples

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Fiscal / Simples Nacional |
| atividade | Acompanhar a receita acumulada de cada optante contra o sublimite estadual/municipal (R$ 3,6 mi) e o limite (R$ 4,8 mi), avisar e preparar a mudança |
| descrição | Analista olha o RBT12 no extrato do PGDAS-D quando lembra; ao estourar o sublimite, ICMS e ISS saem do DAS e o cliente passa a ter obrigações estaduais/municipais completas |
| gatilho_frequência | Mensal |
| porte_alcance | Optantes com RBT12 acima de ~R$ 2,5 mi `[ESTIMATIVA de corte]` |
| quem_faz | Analista fiscal + sócio |
| onde_é_feita_hoje | Core, planilha |
| entradas / saídas | Receita mensal → projeção, alerta, plano de transição |
| base_legal | LC 123/2006, art. 13-A (sublimite) e art. 3º (limite) [S17] `[ler no Planalto na Etapa 2]` |
| risco_se_falhar | ICMS/ISS recolhidos errado; obrigações estaduais omitidas; exclusão sem planejamento |
| tempo_estimado | `[ESTIMATIVA]` 2 min por cliente/mês; 3–6 h na transição |
| concorrentes | `[NÃO ENCONTRADO]` alerta dedicado nos concorrentes pesquisados (buscado: "monitor sublimite simples software contador") |
| hipótese_automação | Cálculo determinístico do RBT12 e da receita do ano com projeção; alerta em 80% e 95%; checklist de transição que cria as obrigações novas (FIS-001) |
| papel_da_ia | M2 + M3 (projeção) + M1 (efeitos) → **ler/rascunhar** aviso ao cliente |
| ferramentas_agênticas | `calcular_rbt12(cliente, data)`, `projetar_receita_ano(cliente)`, `alertar_limite_simples(cliente)` |
| eventos_timesheet | `fiscal.limite_sn.alerta` (cliente, % do limite) |
| fontes_descoberta | [S17] |

### FIS-012 · Calcular o fator R e orientar o pró-labore

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Fiscal / Simples Nacional (transversal: D4, D6) |
| atividade | Calcular mensalmente a razão folha/receita (12 meses) dos clientes com atividades sujeitas ao fator R e avisar quando a razão ficar abaixo de 28% |
| descrição | O core calcula o anexo na apuração; o ajuste do pró-labore para manter o Anexo III é feito de forma reativa, quando o analista percebe a mudança |
| gatilho_frequência | Mensal (antes do fechamento da folha) |
| porte_alcance | Optantes com atividades do art. 18, §5º-J/§5º-M da LC 123 (serviços intelectuais) [S17] |
| quem_faz | Analista fiscal + DP |
| onde_é_feita_hoje | Core, planilha |
| entradas / saídas | Folha e receita 12 meses → razão, simulação de pró-labore, aviso |
| base_legal | LC 123/2006, art. 18, §5º-J e §5º-M (corte 28%) [S17] |
| risco_se_falhar | Tributação no Anexo V (alíquota maior) por falta de ajuste simples |
| tempo_estimado | `[ESTIMATIVA]` 5 min por cliente/mês |
| concorrentes | Calculadoras avulsas (e-Auditoria) [S17]; sem alerta proativo encontrado `[NÃO ENCONTRADO]` |
| hipótese_automação | Cálculo mensal + simulação "quanto de pró-labore mantém o Anexo III" antes do fechamento da folha; exemplo do Plano 1.5 |
| papel_da_ia | M2 → M1 → M3, resposta **ler** com números de origem; **rascunhar** recomendação ao cliente |
| ferramentas_agênticas | `calcular_fator_r(cliente, competencia)`, `simular_pro_labore_fator_r(cliente)` |
| eventos_timesheet | `fiscal.fator_r.calculado`, `consultoria.fator_r.recomendacao` |
| fontes_descoberta | [S17] |

### FIS-013 · Entregar a DEFIS

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Fiscal / Simples Nacional |
| atividade | Coletar dados anuais (lucros distribuídos, participação dos sócios, estoques, caixa) e transmitir a DEFIS |
| descrição | Analista pede ao cliente/contábil os dados e transmite no portal; muitos deixam para março |
| gatilho_frequência | Anual, até 31 de março [S11] |
| porte_alcance | Optantes do Simples (exceto MEI) |
| quem_faz | Analista fiscal + contábil |
| onde_é_feita_hoje | Portal do Simples, Integra Contador (DEFIS está na lista do Plano 3.1 `[NÃO VERIFICADO]` na fonte oficial) |
| entradas / saídas | Dados contábeis e societários → DEFIS transmitida e recibo |
| base_legal | LC 123/2006; multa por atraso 2% a.m. efetiva desde 2026 (antes, "sem multa") [S11] |
| risco_se_falhar | Multa nova; impedimento de gerar o DAS de períodos seguintes `[NÃO VERIFICADO]` |
| tempo_estimado | `[ESTIMATIVA]` 20–40 min por cliente/ano |
| concorrentes | `[NÃO ENCONTRADO]` funcionalidade dedicada nos gestores pesquisados |
| hipótese_automação | Pré-preenchimento a partir do core/contábil (D5) e do cadastro de sócios (D1); tarefa em fevereiro; transmissão via API se o serviço existir |
| papel_da_ia | M2 coleta; M4 **rascunhar** e **executar com aprovação** |
| ferramentas_agênticas | `preparar_defis(cliente, ano)`, `transmitir_defis(cliente, ano)` |
| eventos_timesheet | `fiscal.defis.transmitida` |
| fontes_descoberta | [S11] |

### FIS-014 · Conduzir a opção, o cancelamento e as pendências de entrada no Simples

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Fiscal / Simples Nacional (transversal: D1, D6) |
| atividade | Decidir com o cliente a opção pelo Simples para o ano seguinte, regularizar pendências que impedem a opção, acompanhar deferimento e eventual cancelamento |
| descrição | Até 2026 era rotina de janeiro. Para 2027 a opção foi antecipada para set–out/2026 (prorrogada), com regularização de pendências até 30/10/2026 e cancelamento possível em nov–dez/2026 [S14]. Empresas novas seguem a regra de início de atividade `[NÃO VERIFICADO]` |
| gatilho_frequência | Anual (2º semestre) + por evento (abertura de empresa) |
| porte_alcance | Não optantes elegíveis; empresas em abertura |
| quem_faz | Sócio/consultor + analista fiscal |
| onde_é_feita_hoje | Portal do Simples, e-CAC, Sefaz/prefeitura |
| entradas / saídas | Simulação de regimes, pendências → pedido de opção, acompanhamento, resultado |
| base_legal | Resoluções CGSN (prorrogação citada pela COAD) [S14]; roteiro oficial da RFB para 2027 [S14] |
| risco_se_falhar | Cliente fica um ano fora do regime pretendido |
| tempo_estimado | `[ESTIMATIVA]` 1–2 h por cliente (simulação + pedido + acompanhamento) |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Campanha anual: M2 lista candidatos, M3 simula regimes, checklist de pendências (FIS-006), lembretes das janelas, acompanhamento do resultado |
| papel_da_ia | M1 (regras e janelas), M2, M3 → **rascunhar** recomendação; ação de opção fica com o humano (credencial do cliente/escritório) |
| ferramentas_agênticas | `listar_candidatos_opcao_sn(ano)`, `simular_regimes(cliente)`, `checar_impeditivos_opcao(cliente)` |
| eventos_timesheet | `consultoria.opcao_sn.simulacao`, `fiscal.opcao_sn.pedido` |
| fontes_descoberta | [S14] |

### FIS-015 · Decidir e registrar a opção semestral pelo regime regular de IBS/CBS (optantes do Simples)

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Fiscal / Simples Nacional · Reforma (transversal: D6) |
| atividade | Avaliar, para cada optante, se IBS/CBS devem ser recolhidos dentro do DAS ou pelo regime regular, registrar a opção no portal e acompanhar a desistência |
| descrição | Rotina criada pela Res. CGSN 186/2026: janela para o 1º semestre de 2027 terminou em 30/10/2026 (prorrogada pela Res. CGSN 194/2026, segundo uma fonte); desistência em nov–dez/2026 (datas divergem); nova janela em março/2027 para o 2º semestre. MEI fora [S15]. Afeta o crédito do cliente do cliente (LC 214/2025, art. 47, §9º) [S15] |
| gatilho_frequência | Semestral (setembro/outubro e março) |
| porte_alcance | Optantes do Simples que vendem para contribuintes do regime regular (B2B) |
| quem_faz | Sócio/consultor |
| onde_é_feita_hoje | Portal do Simples, planilha de simulação |
| entradas / saídas | Perfil de clientes compradores, margens → recomendação, opção registrada |
| base_legal | LC 214/2025; Res. CGSN 186/2026 e 194/2026 [S15] `[ler texto oficial]` |
| risco_se_falhar | Perda de competitividade do cliente (comprador sem crédito integral) ou carga maior desnecessária |
| tempo_estimado | `[ESTIMATIVA]` 1–3 h por cliente B2B por semestre |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Campanha semestral com simulação determinística (M3) e lista priorizada de clientes B2B (M2 a partir dos XMLs de saída, D3) |
| papel_da_ia | M1 + M2 + M3 → **rascunhar** parecer por cliente; aprovação do sócio |
| ferramentas_agênticas | `simular_ibs_cbs_dentro_fora_das(cliente)`, `listar_clientes_b2b_simples()` |
| eventos_timesheet | `consultoria.ibs_cbs_sn.simulacao` |
| fontes_descoberta | [S15] |

---

## D. MEI

### FIS-016 · Emitir e enviar o DAS-MEI em lote

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Fiscal / MEI |
| atividade | Gerar o DAS-MEI mensal (ou anual) de cada MEI atendido e enviar |
| descrição | Assistente gera no PGMEI, envia por WhatsApp; MEI esquece de pagar e acumula débitos que viram termo de exclusão (FIS-008) |
| gatilho_frequência | Mensal (vencimento dia 20 `[NÃO VERIFICADO]` nas fontes desta sessão) |
| porte_alcance | MEI |
| quem_faz | Assistente / atendimento |
| onde_é_feita_hoje | PGMEI, WhatsApp |
| entradas / saídas | CNPJ → DAS-MEI PDF/código de barras/Pix, mensagem |
| base_legal | LC 123/2006 (SIMEI) |
| risco_se_falhar | Débito, exclusão do SIMEI, perda de benefícios previdenciários |
| tempo_estimado | `[ESTIMATIVA]` 2 min por MEI/mês |
| concorrentes | Integra Contador emite DAS-MEI e CCMEI por API [S2] |
| hipótese_automação | Geração em lote por API + envio automático + lembrete no vencimento |
| papel_da_ia | M4 **executar** (envio padrão) |
| ferramentas_agênticas | `gerar_das_mei(cliente, competencia)`, `enviar_guia(...)` |
| eventos_timesheet | `fiscal.das_mei.gerado`, `atendimento.guia.enviada` |
| fontes_descoberta | [S2] |

### FIS-017 · Entregar a DASN-SIMEI e controlar o limite do MEI

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Fiscal / MEI |
| atividade | Transmitir a declaração anual do MEI e acompanhar o faturamento contra o limite anual |
| descrição | Assistente pede o faturamento do ano ao MEI (que raramente controla) e transmite; desenquadramento por excesso é descoberto tarde |
| gatilho_frequência | Anual, até 31 de maio (próxima: 31/05/2027, ano-base 2026) [S16] + mensal (limite) |
| porte_alcance | MEI (obrigatória mesmo sem faturamento) [S16] |
| quem_faz | Assistente |
| onde_é_feita_hoje | Portal do Empreendedor/Simples |
| entradas / saídas | Faturamento anual, se teve empregado → declaração e recibo |
| base_legal | LC 123/2006; multa 2% a.m. limitada a 20%, mínimo R$ 50; redução de 50% se paga em 30 dias; limite anual de R$ 81 mil [S16] |
| risco_se_falhar | Multa; CNPJ inapto por omissão [S16]; desenquadramento retroativo com tributação pelo Simples |
| tempo_estimado | `[ESTIMATIVA]` 10 min por MEI/ano |
| concorrentes | `[NÃO ENCONTRADO]` funcionalidade dedicada |
| hipótese_automação | Faturamento somado das NFS-e/NF-e emitidas (D3) e de lançamentos; alerta em 80% do limite; declaração por API `[NÃO VERIFICADO: serviço DASN-SIMEI no Integra Contador]` |
| papel_da_ia | M2 + M3 → **rascunhar**; M4 **executar com aprovação** |
| ferramentas_agênticas | `somar_faturamento_mei(cliente, ano)`, `transmitir_dasn_simei(cliente, ano)` |
| eventos_timesheet | `fiscal.dasn_simei.transmitida`, `fiscal.limite_mei.alerta` |
| fontes_descoberta | [S16] |

### FIS-018 · Conduzir opção, desenquadramento e baixa do SIMEI

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Fiscal / MEI (transversal: D1) |
| atividade | Registrar opção pelo SIMEI (janeiro), comunicar desenquadramento (excesso, empregado, atividade) e acompanhar transição para ME |
| descrição | Pedidos pontuais, feitos no portal; a opção pelo SIMEI em janeiro de 2027 vai até 29/01/2027 e gera também pedido de opção pelo Simples [S14] |
| gatilho_frequência | Anual (janeiro) + por evento |
| porte_alcance | MEI e candidatos |
| quem_faz | Assistente + analista |
| onde_é_feita_hoje | Portal do Simples |
| entradas / saídas | Situação do MEI → pedido registrado, novo calendário (FIS-001) |
| base_legal | LC 123/2006; Resoluções CGSN [S14] |
| risco_se_falhar | Tributação retroativa, multa |
| tempo_estimado | `[ESTIMATIVA]` 30–60 min por evento |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Checklist + lembrete; gatilho automático por FIS-017 (limite) |
| papel_da_ia | M1 explica regras; **rascunhar** comunicação |
| ferramentas_agênticas | `abrir_fluxo_desenquadramento_mei(cliente, motivo)` |
| eventos_timesheet | `fiscal.simei.evento` |
| fontes_descoberta | [S14] |

---

## E. Tributos federais do regime normal

### FIS-019 · Fechar e transmitir a DCTFWeb (com MIT) e emitir o DARF numerado

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Fiscal / DCTFWeb |
| atividade | Conferir a DCTFWeb gerada a partir de eSocial/EFD-Reinf e do MIT, transmitir e emitir o DARF numerado |
| descrição | Após o fechamento do eSocial e da Reinf, a DCTFWeb fica "em andamento"; o analista inclui IRPJ/CSLL/PIS/Cofins no MIT (Lucro Presumido/Real), transmite e emite o DARF único. Pagar por DARF avulso do Sicalc não dá baixa nos débitos da DCTFWeb [S9-b] |
| gatilho_frequência | Mensal; entrega até o último dia útil do mês seguinte (IN RFB 2.248/2025) [S8]; vencimento dos tributos não muda [S8] |
| porte_alcance | Empresas com folha ou retenções (inclusive Simples com folha) e Lucro Presumido/Real (MIT) |
| quem_faz | Analista fiscal + DP |
| onde_é_feita_hoje | e-CAC (DCTFWeb), core, Integra Contador [S3] |
| entradas / saídas | eSocial, Reinf, apuração do core → declaração transmitida, recibo, DARF |
| base_legal | IN RFB 2.237/2024 alt. 2.248/2025 [S8]; MIT instituído por IN publicada em 2024, substituindo a DCTF a partir de jan/2025 [S9] |
| risco_se_falhar | Multa por atraso; DCTFWeb "em andamento" ou retificadora não transmitida impede a CND [S10]; DARF errado não baixa débito |
| tempo_estimado | `[ESTIMATIVA]` 10–20 min por cliente/mês |
| concorrentes | Integra Contador ampliou DCTFWeb/MIT em 2025 (5 serviços novos, pendências automáticas) [S3]; Domínio gera DARF da DCTFWeb por rotinas automáticas [C10]; HubCount monitora DCTFWeb [C4] |
| hipótese_automação | Monitor de eventos DCTFWeb (gratuito [S2]) → alerta "em andamento sem transmissão"; transmissão e emissão de DARF por API com aprovação |
| papel_da_ia | M2 + M3 (conferência), M4 **executar com aprovação** |
| ferramentas_agênticas | `consultar_dctfweb(cliente, competencia)`, `transmitir_dctfweb(cliente, competencia)`, `emitir_darf_dctfweb(cliente, competencia)`, `listar_dctfweb_em_andamento()` |
| eventos_timesheet | `fiscal.dctfweb.transmitida`, `fiscal.guia.gerada` |
| fontes_descoberta | [S2] [S3] [S8] [S9] [S10] [C4] [C10] |

### FIS-020 · Fechar e transmitir a EFD-Reinf

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Fiscal / EFD-Reinf |
| atividade | Conferir retenções (R-2000 serviços tomados com INSS, R-4000 IRRF/PIS/Cofins/CSLL retidos) e transmitir/fechar a Reinf |
| descrição | Analista recebe notas de serviços tomados, confere retenções destacadas, gera eventos no core ou no portal e fecha; retificação da Reinf reabre a DCTFWeb [S31-b] |
| gatilho_frequência | Mensal, até o dia 15 (regra do dia útil diverge entre fontes: anterior ou posterior) [S12] |
| porte_alcance | Empresas com retenções na fonte ou receitas específicas; inclui substituto da DIRF (extinta a partir de 2025, segundo as fontes) [S12] |
| quem_faz | Analista fiscal |
| onde_é_feita_hoje | Core, portal/webservice Reinf |
| entradas / saídas | NFS-e tomadas, pagamentos → eventos, recibo de fechamento |
| base_legal | IN RFB 2.043/2021 `[NÃO VERIFICADO]`; multas: fontes divergem entre 2% a.m. limitada a 20% (IN 1.701/2017) e R$ 500/mês; R$ 20 por grupo de 10 informações [S12] |
| risco_se_falhar | Multa; DCTFWeb errada; informe de rendimentos errado para o prestador |
| tempo_estimado | `[ESTIMATIVA]` 10–30 min por cliente/mês |
| concorrentes | Jettax apura retenções federais de notas de serviço [C3] |
| hipótese_automação | Conferência automática das retenções a partir das NFS-e capturadas (D3) e alerta de nota sem retenção esperada |
| papel_da_ia | M1 (regra de retenção por serviço) + M3 → **rascunhar** eventos; transmissão com aprovação |
| ferramentas_agênticas | `conferir_retencoes(cliente, competencia)`, `consultar_reinf(cliente, competencia)` |
| eventos_timesheet | `fiscal.reinf.fechada` |
| fontes_descoberta | [S12] [S31] [C3] |

### FIS-021 · Emitir DARF avulso e recalcular tributo pago em atraso

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Fiscal / Guias federais |
| atividade | Emitir DARF fora da DCTFWeb (ex.: IRPJ/CSLL trimestral quando aplicável, ganho de capital, carnê-leão do sócio, tributo em atraso com multa e juros Selic) |
| descrição | Analista usa o Sicalc web; para atraso, recalcula multa de mora e juros; reenvia ao cliente |
| gatilho_frequência | Por evento (frequente: cliente que perdeu o vencimento) |
| porte_alcance | Todos |
| quem_faz | Analista fiscal |
| onde_é_feita_hoje | Sicalc web, Integra Contador (Sicalc) [Plano 3.1, `NÃO VERIFICADO` nesta sessão] |
| entradas / saídas | Código de receita, período, valor → DARF |
| base_legal | Lei 9.430/1996, art. 61 (multa de mora e juros) `[NÃO VERIFICADO nesta sessão]` |
| risco_se_falhar | Código de receita errado = pagamento sem baixa, retrabalho de REDARF |
| tempo_estimado | `[ESTIMATIVA]` 3–5 min por DARF |
| concorrentes | Cores emitem DARF; `[NÃO ENCONTRADO]` diferencial em gestores |
| hipótese_automação | Recalculo determinístico (Selic do SGS/BCB) e emissão por API; pedido pelo chat ("refaz a guia vencida do cliente X") |
| papel_da_ia | M3 (multa/juros), M4 **executar** (emitir) e **rascunhar** envio |
| ferramentas_agênticas | `emitir_darf(cliente, codigo_receita, periodo, valor)`, `recalcular_tributo_atrasado(guia, data_pagamento)` |
| eventos_timesheet | `fiscal.guia.reemitida` (motivo: atraso) |
| fontes_descoberta | — (base conhecida do Plano 3.1; verificação na Etapa 2) |

### FIS-022 · Entregar a DIRBI mensal

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Fiscal / Declarações federais |
| atividade | Identificar clientes que usufruem benefícios listados e entregar a DIRBI |
| descrição | Analista verifica se o cliente usa algum dos benefícios do anexo (ampliado para 173 itens em 2026, segundo as fontes) e preenche no e-CAC |
| gatilho_frequência | Mensal, dia 20 do 2º mês seguinte (ex.: fev/2026 → 20/04/2026) [S28] |
| porte_alcance | PJ fora do Simples com benefícios federais listados; Simples e MEI dispensados [S28] |
| quem_faz | Analista fiscal |
| onde_é_feita_hoje | e-CAC |
| entradas / saídas | Valores de benefícios usufruídos → declaração, recibo |
| base_legal | IN RFB 2.198/2024 e alterações; multa por atraso sobre a receita bruta limitada a 30% do benefício; 3% (mín. R$ 500) por inexatidão [S28] |
| risco_se_falhar | Multa alta proporcional à receita |
| tempo_estimado | `[ESTIMATIVA]` 15–30 min por cliente/mês |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | M2 identifica clientes com CST/benefício nos XMLs e na EFD-Contribuições (do core); calendário só para eles |
| papel_da_ia | M1 (lista de benefícios vigente) + M2 → **ler/rascunhar** |
| ferramentas_agênticas | `identificar_obrigados_dirbi(competencia)` |
| eventos_timesheet | `fiscal.dirbi.transmitida` |
| fontes_descoberta | [S28] |

### FIS-023 · Controlar a entrega dos SPED gerados pelo core (EFD ICMS/IPI, EFD-Contribuições)

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Fiscal / Controle de entregas (transversal: D5 para ECD/ECF) |
| atividade | Garantir que o arquivo gerado no core foi validado no PVA, assinado, transmitido e que o recibo voltou |
| descrição | Geração é do core (fora do escopo); o escritório controla em planilha "gerou / validou / transmitiu / recibo". No RS a guia do ICMS só é gerada com EFD validada e assinada [S21] |
| gatilho_frequência | Mensal (prazos por UF; EFD-Contribuições dia 15 do 2º mês, segundo [S12] `[confirmar]`) |
| porte_alcance | Lucro Presumido/Real; contribuintes de ICMS/IPI |
| quem_faz | Analista fiscal |
| onde_é_feita_hoje | Core, PVA, ReceitaNet, planilha |
| entradas / saídas | Arquivo e recibo → status da obrigação |
| base_legal | Ajuste SINIEF 2/2009 e legislação de cada UF `[NÃO VERIFICADO]` |
| risco_se_falhar | Omissão (multa estadual e federal), guia estadual não gerada (RS) |
| tempo_estimado | `[ESTIMATIVA]` 3–5 min por arquivo |
| concorrentes | Gestores de tarefas fazem o controle manual [C1][C2] |
| hipótese_automação | Leitura do recibo (arquivo .REC/PDF) por pasta monitorada ou upload; baixa por evidência (FIS-003) |
| papel_da_ia | M4 **executar** baixa; ler recibo |
| ferramentas_agênticas | `registrar_recibo_sped(cliente, tipo, arquivo)` |
| eventos_timesheet | `fiscal.sped.recibo` |
| fontes_descoberta | [S12] [S21] [C1] [C2] |

---

## F. Estadual (SP, MG, PR, SC, RS)

### FIS-024 · Controlar as obrigações estaduais de cada UF

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Fiscal / Estadual |
| atividade | Manter, por UF, quais declarações estaduais cada cliente entrega (EFD ICMS/IPI, GIA, GIA-ST, DIME, DeSTDA, declarações anuais) e seus prazos |
| descrição | Cada UF tem regras e dispensas próprias em mudança: SP dispensou a GIA do RPA a partir de jan/2026 e a GIA-ST de outras UFs a partir de jul/2025, mas exige retificações de períodos anteriores [S18][S19]; SC está em fases de dispensa da DIME com adesão [S20]; DeSTDA para Simples com ST/DIFAL (dia 28 em SP desde 2016; SC citou dia 20 de agosto como último dia em uma notícia) [S20]; RS mantém GIA alinhada à EFD (fev/2026 dia 18) [S21]. MG e PR: `[NÃO ENCONTRADO]` calendário vigente nesta sessão (buscado: "DAPI extinta", "EFD prazo Paraná") |
| gatilho_frequência | Mensal + anual; por evento (mudança de norma) |
| porte_alcance | Contribuintes de ICMS; Simples com ST/DIFAL (DeSTDA); clientes com filial em outra UF |
| quem_faz | Analista fiscal estadual |
| onde_é_feita_hoje | Core, portais das Sefaz, planilha |
| entradas / saídas | Perfil por estabelecimento → obrigações e prazos estaduais |
| base_legal | RICMS de cada UF; Decreto SP 69.338/2025, Portarias SRE 2/2025 e 6/2025 [S18][S19]; IN RE-RS (ex. 36/2024, 25/2026) [S21] |
| risco_se_falhar | Multas estaduais; IE suspensa; bloqueio de emissão de NF-e `[NÃO VERIFICADO]` |
| tempo_estimado | `[ESTIMATIVA]` 1 h/mês por UF para manter a matriz atualizada |
| concorrentes | Gestores de tarefa com matriz manual [C1][C2] |
| hipótese_automação | Tabela de obrigações estaduais versionada (mesmo modelo temporal da base legal), alimentada pelo coletor de normas por UF; dispensas com data de início e "obrigação residual" para retificações |
| papel_da_ia | M1 (norma estadual vigente) → **rascunhar** atualização da tabela; revisão humana obrigatória |
| ferramentas_agênticas | `listar_obrigacoes_estaduais(uf, perfil, data)`, `propor_atualizacao_tabela_uf(norma)` |
| eventos_timesheet | `fiscal.tabela_uf.atualizada` |
| fontes_descoberta | [S18] [S19] [S20] [S21] |

### FIS-025 · Emitir guias estaduais (ICMS próprio, ST, DIFAL, antecipação) e enviar

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Fiscal / Estadual / Guias |
| atividade | Gerar a guia estadual correta (SP GARE-ICMS, MG DAE, PR GR-PR, SC DARE-SC, RS guia gerada a partir da EFD) e enviar ao cliente |
| descrição | Analista gera no portal de cada Sefaz; para Simples com compras interestaduais calcula DIFAL/antecipação por nota. Nomes de guias `[NÃO VERIFICADO]` nesta sessão (conhecimento prévio); RS exige EFD validada e assinada para gerar a guia [S21] |
| gatilho_frequência | Mensal + por nota (antecipação/ST na entrada) |
| porte_alcance | Contribuintes de ICMS; Simples com compras de fora da UF |
| quem_faz | Analista fiscal |
| onde_é_feita_hoje | Portais das Sefaz, core |
| entradas / saídas | Apuração/XMLs → guia, envio |
| base_legal | RICMS de cada UF; DIFAL do Simples em SC no dia 10 (fonte de 2016) [S20] |
| risco_se_falhar | Mercadoria retida em barreira, multa, débito estadual que leva à exclusão do Simples |
| tempo_estimado | `[ESTIMATIVA]` 5–10 min por guia; antecipação por nota pode somar horas por cliente |
| concorrentes | Jettax gera guias [C1]; `[NÃO ENCONTRADO]` emissão multi-UF por API |
| hipótese_automação | Cálculo de DIFAL/antecipação a partir dos XMLs de entrada (D3) e geração por robô com certificado (C-cert) onde não houver webservice; envio pela central de guias |
| papel_da_ia | M1 + M3 (cálculo por nota), M4 **executar com aprovação** |
| ferramentas_agênticas | `calcular_difal_antecipacao(cliente, xml)`, `emitir_guia_estadual(cliente, uf, tipo, valor)` |
| eventos_timesheet | `fiscal.guia_estadual.gerada` |
| fontes_descoberta | [S20] [S21] [C1] |

### FIS-026 · Ler os domicílios tributários eletrônicos estaduais

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Fiscal / Estadual / DTE |
| atividade | Ler as caixas postais estaduais (SP DEC, MG DT-e, PR DT-e, SC DTEC, RS DTE) de cada estabelecimento e tratar comunicações |
| descrição | Cada portal tem acesso e regra de ciência próprios. RS permite acesso à caixa do DTE sem certificado e o contabilista vinculado pode dar ciência [S22]; MG orienta uso frequente do DT-e [S23]; prazos de ciência tácita estaduais `[NÃO ENCONTRADO]` (buscado nas regras de SP, MG, PR) |
| gatilho_frequência | Semanal/diária |
| porte_alcance | Contribuintes de ICMS (inclusive Simples com IE) |
| quem_faz | Analista fiscal |
| onde_é_feita_hoje | Portais estaduais |
| entradas / saídas | Mensagens → resumo, prazo, tarefa |
| base_legal | Decreto MG 47.531/2018 (DT-e) [S23]; legislação de cada UF `[NÃO VERIFICADO]` |
| risco_se_falhar | Auto de infração à revelia, exclusão do Simples por débito estadual, IE suspensa |
| tempo_estimado | `[ESTIMATIVA]` 2–5 min por estabelecimento/semana |
| concorrentes | Jettax lê DEC estadual e municipal [C3]; Dootax Caixa Postal Fiscal centraliza DTEs [C6]; Makro DTE [C12] |
| hipótese_automação | Robô por UF com certificado (C-cert), priorizando as UFs com mais clientes; mesma triagem da FIS-005 |
| papel_da_ia | M4 **executar** leitura; **rascunhar** resumo/classificação; M3 prazo |
| ferramentas_agênticas | `consultar_dte_estadual(cliente, uf)` |
| eventos_timesheet | `fiscal.dte_estadual.lido` |
| fontes_descoberta | [S22] [S23] [C3] [C6] [C12] |

### FIS-027 · Consultar conta-corrente e pendências estaduais

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Fiscal / Estadual |
| atividade | Consultar débitos, omissões de declaração e situação da IE de cada cliente nas Sefaz |
| descrição | Feito só quando o cliente precisa de certidão ou recebe notificação |
| gatilho_frequência | Mensal (ideal) |
| porte_alcance | Contribuintes de ICMS |
| quem_faz | Analista fiscal |
| onde_é_feita_hoje | Portais estaduais |
| entradas / saídas | Consulta → pendências, tarefas |
| base_legal | RICMS de cada UF |
| risco_se_falhar | Débito inscrito em dívida ativa estadual, protesto, exclusão do Simples |
| tempo_estimado | `[ESTIMATIVA]` 5 min por cliente/UF/mês |
| concorrentes | Jettax (autorizações estaduais) [C3]; HubCount [C4] |
| hipótese_automação | Robô C-cert ou agregador (B) por UF; diff mensal |
| papel_da_ia | M4 **executar** leitura; resumo |
| ferramentas_agênticas | `consultar_pendencias_estaduais(cliente, uf)` |
| eventos_timesheet | `fiscal.pendencia_estadual.consulta` |
| fontes_descoberta | [C3] [C4] |

---

## G. Municipal

### FIS-028 · Apurar e emitir guias de ISS e entregar declarações municipais

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Fiscal / Municipal |
| atividade | Emitir guia do ISS próprio (fora do Simples ou acima do sublimite), do ISS retido como tomador, do ISS fixo de sociedades uniprofissionais, e entregar declarações de serviços tomados |
| descrição | Cada prefeitura tem portal e regra. São Paulo: ISS até o dia 10 (DAMSP); NFTS até o dia 10 quando há retenção (dia 30 quando não há, segundo fonte truncada); D-SUP trimestral dia 10 [S29]. BH, Curitiba, Florianópolis, Porto Alegre: `[NÃO ENCONTRADO]` nesta sessão |
| gatilho_frequência | Mensal / trimestral |
| porte_alcance | Prestadores de serviço; tomadores com retenção; sociedades uniprofissionais |
| quem_faz | Analista fiscal |
| onde_é_feita_hoje | Portais municipais, core |
| entradas / saídas | NFS-e prestadas/tomadas → guia, declaração |
| base_legal | LC 116/2003; legislação municipal (SP: IN SF/SUREM citadas) [S29] |
| risco_se_falhar | Multa municipal; tomador responde pelo ISS não retido |
| tempo_estimado | `[ESTIMATIVA]` 5–15 min por cliente/mês |
| concorrentes | Jettax apura retenções de notas de serviço [C3]; Qive/Arquivei capturam NFS-e de 150+ prefeituras (captura, não guia) [C14-b] |
| hipótese_automação | NFS-e Nacional (ADN) para municípios aderentes (D3) + regras de retenção por município; emissão de guia por robô C-cert onde não há API |
| papel_da_ia | M1 (regra municipal) + M3; M4 **rascunhar** guia |
| ferramentas_agênticas | `apurar_iss(cliente, competencia)`, `emitir_guia_iss(cliente, municipio)` |
| eventos_timesheet | `fiscal.iss.guia` |
| fontes_descoberta | [S29] [C3] |

### FIS-029 · Ler os domicílios eletrônicos municipais

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Fiscal / Municipal / DTE |
| atividade | Ler as caixas postais municipais (ex.: DEC da capital paulista, DEC de Curitiba) |
| descrição | Curitiba registra ciência tácita 10 dias após o envio, abra ou não a mensagem (LC municipal 40/2001) [S24]; São Paulo capital publicou manual do DEC em 19/06/2026 [S24] |
| gatilho_frequência | Semanal |
| porte_alcance | Prestadores de serviço nos municípios com DEC |
| quem_faz | Analista fiscal |
| onde_é_feita_hoje | Portais municipais |
| entradas / saídas | Mensagens → tarefa com prazo |
| base_legal | Legislação municipal [S24] |
| risco_se_falhar | Auto de infração de ISS à revelia |
| tempo_estimado | `[ESTIMATIVA]` 2 min por cliente/semana |
| concorrentes | Jettax (DEC municipal) [C3]; Dootax [C6] |
| hipótese_automação | Robô C-cert nos municípios com mais clientes; senão lembrete semanal (D) |
| papel_da_ia | Igual à FIS-026 |
| ferramentas_agênticas | `consultar_dte_municipal(cliente, municipio)` |
| eventos_timesheet | `fiscal.dte_municipal.lido` |
| fontes_descoberta | [S24] [C3] [C6] |

### FIS-030 · Vigiar a situação cadastral (CNPJ, IE, inscrição municipal) e omissões que levam à inaptidão

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Fiscal / Cadastro fiscal (transversal: D1) |
| atividade | Detectar CNPJ inapto/suspenso, IE suspensa ou cancelada e inscrição municipal irregular por omissão de declarações |
| descrição | Descoberto quando a nota é rejeitada ou o banco recusa operação. DASN-SIMEI não entregue leva à inaptidão [S16] |
| gatilho_frequência | Mensal |
| porte_alcance | Todos |
| quem_faz | Analista fiscal / societário |
| onde_é_feita_hoje | Consultas públicas, portais |
| entradas / saídas | CNPJ → situação, alerta |
| base_legal | IN RFB 2.119/2022 (CNPJ) `[NÃO VERIFICADO]` |
| risco_se_falhar | Notas rejeitadas, operação parada, perda de cliente |
| tempo_estimado | `[ESTIMATIVA]` 1 min por cliente/mês |
| concorrentes | MonitorCNPJ [C13] |
| hipótese_automação | Consulta CNPJ (dados abertos/API) + consultas de IE (Sintegra/CCC) por agregador; alerta |
| papel_da_ia | M4 **executar** leitura |
| ferramentas_agênticas | `consultar_situacao_cadastral(cliente)` |
| eventos_timesheet | `fiscal.cadastro.alerta` |
| fontes_descoberta | [S16] [C13] |

---

## H. Guias e pagamentos (o "último quilômetro")

### FIS-031 · Operar a central de guias: receber, identificar, enviar e protocolar

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Fiscal / Guias (transversal: D4, D5, D7) |
| atividade | Receber todas as guias geradas (core, portais, APIs), identificar cliente/tributo/competência/valor/vencimento, enviar ao cliente pelo canal preferido e guardar o protocolo de leitura |
| descrição | Guias saem em PDF de vários sistemas; o analista renomeia, separa por cliente e envia uma a uma por e-mail ou WhatsApp; cliente pergunta "qual eu pago?"; sem prova de envio quando o cliente diz que não recebeu. É a atividade pequena mais repetida da aba |
| gatilho_frequência | Mensal concentrado (dias 5–20) + por evento |
| porte_alcance | Todos |
| quem_faz | Analista fiscal, DP, atendimento |
| onde_é_feita_hoje | Pastas, e-mail, WhatsApp, gestores (Acessórias, Gestta, Onvio) |
| entradas / saídas | PDFs/linhas digitáveis → mensagens enviadas com protocolo (enviado, entregue, lido), agenda de vencimentos do cliente |
| base_legal | — |
| risco_se_falhar | Guia não paga, multa ao cliente, conflito ("vocês não mandaram") |
| tempo_estimado | `[ESTIMATIVA]` 2–3 min por guia; escritório com 150 clientes pode passar de 600 guias/mês |
| concorrentes | Acessórias e-Contínuo: lê dados dos documentos, envia guias por e-mail, organiza pastas, protocolo de entrega e leitura [C1]; Gestta: upload na tarefa/Gestta Express [C2]; Omie G-Click: leitura automática de documentos [C11]; Questor: guias automatizadas [C14]; Komunic (Acessórias) para WhatsApp [C1] |
| hipótese_automação | Leitor de guias (PDF → campos via código de barras + extração), associação automática ao cliente e à tarefa, envio em lote por WhatsApp/e-mail/portal com protocolo, painel "enviadas × lidas × pagas" |
| papel_da_ia | Extração e classificação (IA **ler**); M4 **executar** envio (regra aprovada por cliente); M2 responde "qual guia eu pago este mês?" no chat/WhatsApp |
| ferramentas_agênticas | `ler_guia(arquivo)`, `associar_guia(cliente, tarefa)`, `enviar_guia(cliente, guia, canal)`, `listar_guias_cliente(cliente, mes)`, `status_envio(guia)` |
| eventos_timesheet | `atendimento.guia.enviada` (cliente, setor, tipo, canal), `fiscal.guia.identificada` (IA/pessoa) |
| fontes_descoberta | [C1] [C2] [C11] [C14] |

### FIS-032 · Confirmar o pagamento das guias e cobrar o cliente

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Fiscal / Guias |
| atividade | Verificar se cada guia foi paga, lembrar antes do vencimento e cobrar depois |
| descrição | Analista pede comprovante pelo WhatsApp ou consulta pagamentos no e-CAC/portais; muitas vezes só descobre o não pagamento no relatório de situação fiscal do mês seguinte |
| gatilho_frequência | Mensal (D-2 do vencimento e D+3) |
| porte_alcance | Todos |
| quem_faz | Atendimento / analista |
| onde_é_feita_hoje | WhatsApp, e-CAC (consulta de pagamentos) |
| entradas / saídas | Guias enviadas + pagamentos → status pago/não pago, lembrete, tarefa de reemissão |
| base_legal | — |
| risco_se_falhar | Débito acumulado → exclusão do Simples, CND negada |
| tempo_estimado | `[ESTIMATIVA]` 1–2 min por guia |
| concorrentes | Monitor "Pagamento Web" do Integra Contador (eventos gratuitos) [S2]; `[NÃO ENCONTRADO]` conciliação guia × pagamento em gestores |
| hipótese_automação | Consulta de pagamentos federais por API; estaduais/municipais por robô ou extrato bancário (Open Finance, D5); lembrete automático e reemissão (FIS-021) |
| papel_da_ia | M2 + M4 **executar** lembretes (modelos aprovados); **rascunhar** cobrança personalizada |
| ferramentas_agênticas | `consultar_pagamentos(cliente, periodo)`, `conciliar_guias_pagamentos(cliente, mes)`, `enviar_lembrete_vencimento(cliente)` |
| eventos_timesheet | `atendimento.cobranca_guia` (cliente, nº guias) |
| fontes_descoberta | [S2] |

### FIS-033 · Enviar ao cliente o resumo mensal fiscal

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Fiscal / Comunicação (transversal: D7) |
| atividade | Mandar ao cliente um resumo do mês: obrigações entregues, guias e vencimentos, pendências, alertas (limite, fator R, certidões) |
| descrição | Poucos escritórios fazem, por falta de tempo; quando fazem, é texto manual |
| gatilho_frequência | Mensal |
| porte_alcance | Todos (diferencial de valor percebido) |
| quem_faz | Atendimento / sócio |
| onde_é_feita_hoje | E-mail, WhatsApp |
| entradas / saídas | Dados do mês → relatório/mensagem |
| base_legal | — |
| risco_se_falhar | Cliente não percebe o serviço (risco de perda) |
| tempo_estimado | `[ESTIMATIVA]` 10–15 min por cliente/mês manual |
| concorrentes | HubCount: BI e dashboard consultivo [C4] |
| hipótese_automação | Relatório gerado dos eventos da plataforma, revisão em lote |
| papel_da_ia | M2 → **rascunhar**; aprovação em lote |
| ferramentas_agênticas | `gerar_resumo_mensal(cliente, mes)` |
| eventos_timesheet | `atendimento.resumo_mensal.enviado` |
| fontes_descoberta | [C4] |

---

## I. Parcelamentos e transações

### FIS-034 · Controlar parcelamentos ativos e emitir as parcelas

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Fiscal / Parcelamentos |
| atividade | Manter a lista de parcelamentos de cada cliente (Simples/PARCSN, MEI, RFB ordinário, PGFN, estaduais, municipais), emitir e enviar a parcela mensal e vigiar o risco de rescisão |
| descrição | Cada modalidade em um portal (e-CAC, Regularize, Sefaz); a parcela muda todo mês (Selic); analista emite uma a uma; rescisão é descoberta tarde |
| gatilho_frequência | Mensal |
| porte_alcance | Clientes com débitos parcelados |
| quem_faz | Analista fiscal |
| onde_é_feita_hoje | e-CAC, Regularize, portais estaduais/municipais |
| entradas / saídas | Parcelamentos → guias mensais, alerta de atraso |
| base_legal | Lei 10.522/2002 (parcelamento federal) `[NÃO VERIFICADO]`; regras de rescisão por parcelas em atraso: `[NÃO ENCONTRADO]` nas fontes desta sessão |
| risco_se_falhar | Rescisão, perda de descontos, retorno à dívida ativa, exclusão do Simples |
| tempo_estimado | `[ESTIMATIVA]` 3–5 min por parcela |
| concorrentes | Integra Parcelamento (nov/2024): consulta parcelamentos e emite guias, inclui PARCSN [S4] |
| hipótese_automação | API para Simples/MEI e demais modalidades cobertas pelo Integra Parcelamento; robô/manual para PGFN e estados; contagem de parcelas em atraso com alerta |
| papel_da_ia | M4 **executar** emissão; M3 saldo/projeção; M1 regra de rescisão |
| ferramentas_agênticas | `listar_parcelamentos(cliente)`, `emitir_parcela(cliente, parcelamento, mes)`, `risco_rescisao(cliente)` |
| eventos_timesheet | `fiscal.parcela.emitida` |
| fontes_descoberta | [S4] |

### FIS-035 · Acompanhar editais de transação e programas de regularização e aderir

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Fiscal / Parcelamentos (transversal: D6) |
| atividade | Saber quando abre um edital da PGFN ou programa estadual, identificar clientes elegíveis, simular e aderir dentro da janela |
| descrição | Ex.: Edital PGDAU 6/2026 (adesão até 30/09/2026, débitos até R$ 45 mi); Edital 12/2026 (FGTS e contribuições, 15/10/2026 a 29/01/2027); Edital 9/2026 (MEI) prorrogado até 29/01/2027 [S27] |
| gatilho_frequência | Por evento (vários por ano) |
| porte_alcance | Clientes com débitos inscritos |
| quem_faz | Sócio / consultor + analista |
| onde_é_feita_hoje | Regularize (adesão eletrônica), notícias |
| entradas / saídas | Edital + débitos do cliente → simulação, adesão |
| base_legal | Lei 13.988/2020 (transação) `[NÃO VERIFICADO]`; editais PGDAU [S27] |
| risco_se_falhar | Cliente perde desconto relevante (fontes citam até 70% sobre acréscimos) [S27] |
| tempo_estimado | `[ESTIMATIVA]` 1–3 h por cliente elegível |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Vigia da lei detecta edital → M2 cruza com dívida ativa dos clientes → M3 simula → campanha de oferta (gera receita ao escritório) |
| papel_da_ia | M1 + M2 + M3 → **rascunhar** proposta ao cliente |
| ferramentas_agênticas | `listar_elegiveis_edital(edital)`, `simular_transacao(cliente, edital)` |
| eventos_timesheet | `consultoria.transacao.simulacao` |
| fontes_descoberta | [S27] |

---

## J. Certidões

### FIS-036 · Emitir, monitorar a validade e entregar certidões negativas

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Fiscal / Certidões |
| atividade | Emitir certidões (federal RFB/PGFN, estadual, municipal, CRF-FGTS, CNDT), guardar, alertar vencimento e enviar a quem pediu |
| descrição | Pedido urgente do cliente (licitação, banco); analista entra em vários portais, alguns com CAPTCHA; validades diferentes: federal 180 dias (Portaria Conjunta 1.751/2014, art. 10), CNDT 180 dias (CLT art. 642-A, §1º), CRF 30 dias; estaduais/municipais de 30 a 180 dias [S26] |
| gatilho_frequência | Por evento + periódica para clientes que licitam |
| porte_alcance | Todos; crítico para quem participa de licitação ou toma crédito |
| quem_faz | Assistente fiscal |
| onde_é_feita_hoje | Portais (e-CAC, Sefaz, prefeituras, Caixa, TST) |
| entradas / saídas | CNPJ → PDFs válidos, painel de validade |
| base_legal | [S26] |
| risco_se_falhar | Cliente perde licitação/financiamento |
| tempo_estimado | `[ESTIMATIVA]` 3–5 min por certidão; 20–30 min por kit completo |
| concorrentes | HubCount HubCND (diz buscar 70+ CNDs, envio em lote) [C4]; Jettax CND automática [C3]; Dootax [C6]; Makro CND [C12]; e-Auditoria [C5] |
| hipótese_automação | Agregador (B) para as certidões com CAPTCHA, situação fiscal federal por API; renovação automática antes de vencer para clientes marcados; envio pelo canal do cliente |
| papel_da_ia | M4 **executar** emissão e envio; M2 responde "a CND do cliente X está válida?" |
| ferramentas_agênticas | `emitir_certidao(cliente, tipo)`, `listar_certidoes_vencendo(dias)`, `enviar_kit_certidoes(cliente, destinatario)` |
| eventos_timesheet | `fiscal.certidao.emitida` (tipo, resultado: negativa/positiva com efeito/positiva) |
| fontes_descoberta | [S26] [C3] [C4] [C5] [C6] [C12] |

### FIS-037 · Diagnosticar e resolver o que impede a certidão

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Fiscal / Certidões |
| atividade | Quando a certidão sai positiva, descobrir a causa (débito, omissão, DCTFWeb em andamento, divergência, parcela atrasada) e resolver |
| descrição | Analista lê o relatório de situação fiscal, cruza com declarações e pagamentos; DCTFWeb "em andamento" ou retificadora não transmitida impede a CND [S10] |
| gatilho_frequência | Por evento (urgente) |
| porte_alcance | Todos |
| quem_faz | Analista fiscal sênior |
| onde_é_feita_hoje | e-CAC, Regularize, portais |
| entradas / saídas | Certidão positiva + relatório → plano de regularização, tarefas, prazo |
| base_legal | [S10] [S26] |
| risco_se_falhar | Prazo do cliente perdido |
| tempo_estimado | `[ESTIMATIVA]` 30 min a vários dias |
| concorrentes | `[NÃO ENCONTRADO]` diagnóstico automático |
| hipótese_automação | Regras de diagnóstico sobre o relatório de situação fiscal + estado das declarações na plataforma; plano de ação proposto |
| papel_da_ia | M2 + M1 → **rascunhar** diagnóstico e plano; M4 abre tarefas |
| ferramentas_agênticas | `diagnosticar_impedimento_cnd(cliente)` |
| eventos_timesheet | `fiscal.cnd.diagnostico` |
| fontes_descoberta | [S10] [S26] |

---

## K. Malhas, intimações e multas

### FIS-038 · Tratar intimações e notificações fiscais (federal, estadual, municipal)

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Fiscal / Malhas e intimações |
| atividade | Registrar a intimação, calcular o prazo, reunir documentos, redigir e protocolar a resposta |
| descrição | Chega pela caixa postal (FIS-005, 026, 029) ou correio; analista pede documentos ao cliente, redige resposta, protocola no e-CAC (processo digital) ou portal |
| gatilho_frequência | Por evento |
| porte_alcance | Todos |
| quem_faz | Analista sênior / sócio |
| onde_é_feita_hoje | e-CAC (e-Processo), portais, e-mail |
| entradas / saídas | Intimação → dossiê, resposta protocolada, comprovante |
| base_legal | Decreto 70.235/1972 (processo administrativo fiscal) [S25] |
| risco_se_falhar | Auto de infração, multa de ofício, revelia |
| tempo_estimado | `[ESTIMATIVA]` 2–10 h por intimação |
| concorrentes | Monitores detectam [C3][C5][C6]; resposta é manual em todos `[NÃO ENCONTRADO]` |
| hipótese_automação | Fluxo de intimação: prazo, checklist de documentos pedido ao cliente pelo WhatsApp, rascunho da resposta com base legal citada |
| papel_da_ia | M1 (fundamentação) + M2 (documentos, histórico) → **rascunhar** resposta; protocolo humano |
| ferramentas_agênticas | `abrir_fluxo_intimacao(cliente, mensagem)`, `solicitar_documentos(cliente, lista)`, `rascunhar_resposta_intimacao(fluxo)` |
| eventos_timesheet | `fiscal.intimacao.etapa` (cliente, etapa, duração) |
| fontes_descoberta | [S25] [C3] [C5] [C6] |

### FIS-039 · Responder a malha PJ e campanhas de autorregularização

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Fiscal / Malhas e intimações |
| atividade | Analisar o demonstrativo de inconsistências da malha PJ (ex.: IRRF da DCTF × informes) e as campanhas de autorregularização, corrigir e retificar |
| descrição | Ex.: operação de autorregularização do Simples sobre PIS/Cofins monofásico (fev/2023) [S30]; malha PJ com demonstrativo de inconsistências [S31] |
| gatilho_frequência | Por evento (campanhas) |
| porte_alcance | Conforme campanha |
| quem_faz | Analista sênior |
| onde_é_feita_hoje | e-CAC |
| entradas / saídas | Comunicação + demonstrativo → retificações, pagamento complementar |
| base_legal | [S30] [S31] |
| risco_se_falhar | Multa de ofício (75% `[NÃO VERIFICADO]`) se não autorregularizar |
| tempo_estimado | `[ESTIMATIVA]` 1–4 h por cliente |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Detecção pela caixa postal; M2 roda a mesma conferência da campanha em todos os clientes (não só nos notificados) |
| papel_da_ia | M1 + M2 + M3 → **ler/rascunhar** |
| ferramentas_agênticas | `aplicar_criterio_campanha(campanha, clientes)` |
| eventos_timesheet | `fiscal.malha.tratamento` |
| fontes_descoberta | [S30] [S31] |

### FIS-040 · Conferir notificações de multa por atraso (MAED) e pedir revisão

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Fiscal / Malhas e intimações |
| atividade | Conferir cada multa por atraso lançada (PGDAS-D, DEFIS, DCTFWeb, Reinf, DASN-SIMEI), aproveitar redução por pagamento rápido e contestar lançamentos indevidos |
| descrição | Com a multa do PGDAS-D/DEFIS efetiva desde 2026 [S11], o volume de notificações cresce; a redução de 50% em 30 dias aparece em fontes para a DASN-SIMEI [S16] |
| gatilho_frequência | Por evento |
| porte_alcance | Todos |
| quem_faz | Analista fiscal |
| onde_é_feita_hoje | e-CAC |
| entradas / saídas | Notificação → conferência com o recibo da entrega (FIS-003), DARF ou impugnação |
| base_legal | [S11] [S16] |
| risco_se_falhar | Pagar multa indevida ou perder a redução |
| tempo_estimado | `[ESTIMATIVA]` 15–30 min por notificação |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Conferência automática data de entrega × prazo × multa calculada (M3); decisão de quem paga (cliente ou escritório) registrada |
| papel_da_ia | M3 + M1 → **rascunhar** |
| ferramentas_agênticas | `conferir_multa_atraso(cliente, notificacao)` |
| eventos_timesheet | `fiscal.multa.conferida` |
| fontes_descoberta | [S11] [S16] |

---

## L. Recuperação de créditos

### FIS-041 · Identificar e recuperar PIS/Cofins monofásico pago a maior no Simples

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Fiscal / Créditos (transversal: D6) |
| atividade | Encontrar receitas de produtos monofásicos não segregadas no PGDAS-D dos últimos 5 anos, retificar e pedir restituição |
| descrição | Analista cruza NCMs das notas de saída com a lista de monofásicos, retifica PGDAS-D período a período e pede restituição; fontes indicam retificação obrigatória antes do pedido [S30] |
| gatilho_frequência | Por projeto (uma vez por cliente) + prevenção mensal (FIS-004) |
| porte_alcance | Simples no comércio (autopeças, farmácia, cosméticos, bebidas) |
| quem_faz | Analista sênior / consultor |
| onde_é_feita_hoje | Planilhas, Portal do Simples |
| entradas / saídas | XMLs de saída 60 meses → valor recuperável, retificações, pedido |
| base_legal | Prazo de 5 anos e IN RFB 2.055/2021 citados por fontes secundárias [S30] `[confirmar]` |
| risco_se_falhar | Cliente perde dinheiro; ou retificação errada gera malha |
| tempo_estimado | `[ESTIMATIVA]` 4–20 h por cliente |
| concorrentes | Consultorias de recuperação (Tributo Devido etc.) [S30]; e-Auditoria/eSimples (auditoria) [C5] |
| hipótese_automação | Varredura dos XMLs (D3) com tabela de NCM monofásico versionada; relatório de potencial por cliente (receita para o escritório) |
| papel_da_ia | M1 + M3 → **ler/rascunhar** relatório; retificação com aprovação |
| ferramentas_agênticas | `varrer_monofasico(cliente, periodo)`, `estimar_restituicao(cliente)` |
| eventos_timesheet | `consultoria.credito.levantamento` |
| fontes_descoberta | [S30] [C5] |

### FIS-042 · Elaborar e acompanhar PER/DCOMP

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Fiscal / Créditos |
| atividade | Transmitir pedidos de restituição, ressarcimento e compensação e acompanhar despacho, intimações e prazo prescricional |
| descrição | Feito no PER/DCOMP Web; acompanhamento é esquecido; compensação não homologada gera multa |
| gatilho_frequência | Por evento + acompanhamento mensal |
| porte_alcance | Clientes com crédito federal |
| quem_faz | Analista sênior |
| onde_é_feita_hoje | e-CAC (PER/DCOMP Web) |
| entradas / saídas | Crédito → pedido, número, status |
| base_legal | IN RFB 2.055/2021 [S30] `[confirmar]` |
| risco_se_falhar | Crédito prescrito; multa por compensação não homologada |
| tempo_estimado | `[ESTIMATIVA]` 30–90 min por pedido |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Registro dos pedidos, consulta periódica de status (via caixa postal ou robô), contagem de prescrição |
| papel_da_ia | M2 + M3 (prazos) → **ler** |
| ferramentas_agênticas | `registrar_perdcomp(cliente, numero)`, `consultar_status_perdcomp(numero)` |
| eventos_timesheet | `fiscal.perdcomp.etapa` |
| fontes_descoberta | [S30] |

### FIS-043 · Levantar ressarcimento de ICMS-ST e créditos estaduais

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Fiscal / Créditos (transversal: D6) |
| atividade | Identificar ICMS-ST pago a maior (base presumida maior que a real, saídas interestaduais) e pedir ressarcimento conforme cada UF |
| descrição | Projeto pontual, com regras de cada Estado e arquivos específicos |
| gatilho_frequência | Por projeto |
| porte_alcance | Comércio com ST |
| quem_faz | Consultor |
| onde_é_feita_hoje | Planilhas, portais estaduais |
| entradas / saídas | XMLs, EFD → valor, pedido |
| base_legal | RICMS de cada UF; Tema 201 STF `[NÃO VERIFICADO]` |
| risco_se_falhar | Crédito perdido |
| tempo_estimado | `[ESTIMATIVA]` 10–40 h por cliente |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Varredura de XMLs com cálculo por item; checklist por UF (nível D na entrega) |
| papel_da_ia | M1 + M3 → **ler/rascunhar** |
| ferramentas_agênticas | `varrer_icms_st(cliente, periodo, uf)` |
| eventos_timesheet | `consultoria.credito.levantamento` |
| fontes_descoberta | — `[NÃO VERIFICADO]` |

---

## M. Atendimento, reforma e controle

### FIS-044 · Responder dúvidas fiscais do cliente no WhatsApp

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Fiscal / Atendimento (transversal: D7) |
| atividade | Responder perguntas recorrentes: "quanto vou pagar?", "posso emitir nota para outro estado?", "qual CFOP?", "minha guia venceu, e agora?", "preciso da CND" |
| descrição | Analista para o que está fazendo para responder; mesmas perguntas repetidas |
| gatilho_frequência | Diária |
| porte_alcance | Todos |
| quem_faz | Analista fiscal / atendimento |
| onde_é_feita_hoje | WhatsApp, telefone |
| entradas / saídas | Pergunta → resposta, às vezes ação (reemitir guia) |
| base_legal | — |
| risco_se_falhar | Resposta errada gera autuação; demora gera insatisfação |
| tempo_estimado | `[ESTIMATIVA]` 5–10 min por pergunta; dezenas por dia |
| concorrentes | Komunic (Acessórias) para WhatsApp [C1]; Acessórias lista ferramentas de IA [C1] |
| hipótese_automação | Chat único com roteador de intenção (Plano 1.5): M2 para dados do cliente, M1 para regra, M3 para valores, M4 para ações (reemitir guia, enviar CND) |
| papel_da_ia | M1–M4; resposta ao cliente final só **rascunhar** até o escritório liberar categorias para envio direto |
| ferramentas_agênticas | `responder_cliente(conversa)`, todas as ferramentas acima |
| eventos_timesheet | `atendimento.duvida_fiscal` (cliente, tema, duração, IA/pessoa) |
| fontes_descoberta | [C1] |

### FIS-045 · Conferir o destaque de CBS/IBS nas notas dos clientes (2026, ano de teste)

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Fiscal / Reforma (transversal: D3, D6) |
| atividade | Verificar se os clientes estão emitindo NF-e/NFC-e com o destaque de CBS/IBS exigido em 2026 e orientar os que não estão |
| descrição | Dispensa de recolhimento de IBS/CBS em 2026 é condicionada ao cumprimento das obrigações acessórias (LC 214/2025, art. 348, §1º); rejeição automática suspensa temporariamente; RFB diz que não há multa antes de 90 dias da publicação do regulamento [S32]. Para o Simples, a regra de destaque `[NÃO VERIFICADO]` |
| gatilho_frequência | Mensal em 2026; contínua até 2033 |
| porte_alcance | Lucro Presumido/Real (certo); Simples `[a confirmar]` |
| quem_faz | Analista fiscal |
| onde_é_feita_hoje | Amostragem manual de XMLs |
| entradas / saídas | XMLs de saída → lista de clientes sem destaque, orientação |
| base_legal | LC 214/2025, art. 348 [S32] |
| risco_se_falhar | Perda da dispensa (recolhimento da alíquota-teste), multa futura |
| tempo_estimado | `[ESTIMATIVA]` 5 min por cliente/mês |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Regra sobre os XMLs capturados (D3): grupo IBS/CBS presente e coerente |
| papel_da_ia | M1 + M2 → **ler/rascunhar** orientação |
| ferramentas_agênticas | `verificar_destaque_ibs_cbs(cliente, mes)` |
| eventos_timesheet | `fiscal.reforma.conferencia` |
| fontes_descoberta | [S32] |

### FIS-046 · Garantir certificado e acesso válidos antes das transmissões

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Fiscal / Pré-requisitos (transversal: D1) |
| atividade | Verificar, antes da semana de prazos, se certificados A1/e-CNPJ, procurações e acessos (gov.br, portais estaduais) de cada cliente estão válidos |
| descrição | Certificado vencido é descoberto no dia da transmissão |
| gatilho_frequência | Mensal (D-10 dos prazos) |
| porte_alcance | Todos |
| quem_faz | Assistente |
| onde_é_feita_hoje | Planilha, cofre de certificados |
| entradas / saídas | Cofre → lista de bloqueios, pedidos ao cliente |
| base_legal | — |
| risco_se_falhar | Atraso em massa, multa |
| tempo_estimado | `[ESTIMATIVA]` 1 min por cliente |
| concorrentes | Cofres de certificado em gestores `[NÃO VERIFICADO]` |
| hipótese_automação | Checagem automática no cofre (D1) cruzada com o calendário (FIS-001) |
| papel_da_ia | M4 **executar** checagem |
| ferramentas_agênticas | `checar_pre_requisitos_transmissao(competencia)` |
| eventos_timesheet | `cadastro.acesso.alerta` |
| fontes_descoberta | — |

### FIS-047 · Acompanhar o fechamento fiscal do mês por equipe e cliente

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Fiscal / Gestão (transversal: D7) |
| atividade | Ver, em um painel, o que está entregue, atrasado e em risco por cliente, analista e obrigação, e redistribuir trabalho |
| descrição | Coordenador abre o gestor de tarefas e cobra a equipe; multas estimadas não aparecem |
| gatilho_frequência | Diária na 2ª quinzena |
| porte_alcance | — |
| quem_faz | Coordenador / sócio |
| onde_é_feita_hoje | Gestor de tarefas, planilha |
| entradas / saídas | Status das tarefas → painel, redistribuição |
| base_legal | — |
| risco_se_falhar | Atrasos acumulados |
| tempo_estimado | `[ESTIMATIVA]` 30 min/dia do coordenador |
| concorrentes | Gestta monitora andamento e desempenho [C2]; Acessórias [C1]; HubStrom MonitorHub com alertas [C7] |
| hipótese_automação | Painel derivado dos eventos (Plano 1.6 regra 3) com multa estimada (M3) e sugestão de redistribuição |
| papel_da_ia | M2 → **ler**; M4 **rascunhar** redistribuição |
| ferramentas_agênticas | `painel_fechamento(competencia, filtro)`, `sugerir_redistribuicao()` |
| eventos_timesheet | consome todos os eventos `fiscal.*` |
| fontes_descoberta | [C1] [C2] [C7] |

---

## Indicação preliminar de dor (para a Etapa 3)

Sem medição, a ordem abaixo é julgamento do agente (frequência × volume × risco), para a consolidação conferir com os contadores:

1. **FIS-031 central de guias** + **FIS-032 confirmação de pagamento**: centenas de ações pequenas por mês, concentradas em 15 dias.
2. **FIS-005 caixa postal do e-CAC** + **FIS-026/029 DTEs estaduais e municipais**: diária, centenas de CNPJs, ciência tácita corre sem leitura.
3. **FIS-004 conferência antes da transmissão**: onde nascem os erros que viram malha, retificação e multa (agora também no PGDAS-D).
4. **FIS-001/002/024 calendário vivo**: as regras mudaram muito em 2025–2026 (DCTFWeb/MIT, GIA-SP, DIME-SC, opção do Simples antecipada, opção IBS/CBS).
5. **FIS-036/037 certidões e impedimentos**: pedido urgente, vários portais com CAPTCHA, causa da positiva difícil de achar.

---

## Funcionalidades de concorrentes nesta aba

Fontes lidas pelo buscador em 05/11/2026; quase todas são páginas do próprio fornecedor (marketing), sem verificação independente.

| Concorrente | O que oferece na aba Fiscal (segundo a fonte) | Fonte |
| --- | --- | --- |
| **Acessórias** | Gestão de entregas e comunicação escritório–cliente; processos e prazos com responsável e alertas; robô **e-Contínuo** lê dados de documentos, envia guias por e-mail, organiza pastas na nuvem, protocolo digital de entrega e leitura; integração com Jettax (apuração e guias) e Contmatic; **Komunic** para WhatsApp | [C1] |
| **Gestta (Thomson Reuters)** | Gestão de tarefas pré-parametrizada por regime; acompanhamento de andamento e desempenho; guias geradas fora do Domínio sobem na tarefa ou pelo Gestta Express; associações personalizáveis quando a lei muda | [C2] |
| **Domínio / Onvio** | Rotinas automáticas, inclusive DARF da DCTFWeb; Onvio Portal do Cliente para documentos. Detalhes do Onvio Processos no Brasil `[NÃO ENCONTRADO]` | [C10] |
| **Jettax** | Módulo Prevenção: monitora diariamente pendências do e-CAC, dívida ativa, FGTS, DEC estadual e municipal, CND automática; apura retenções federais de NFS-e; gera guias | [C3] |
| **HubCount** | HubCND (afirma 70+ certidões automáticas, envio em lote); Alertas+ (pendências do e-CAC); monitoramento de DCTFWeb, FGTS Digital e mensagens do governo; BI/dashboard consultivo | [C4] |
| **e-Auditoria** | Robôs/API (Integra Contador) para pendências, CND, caixa postal, DCTFWeb; auditoria de PGDAS-D e SPED; calculadora de fator R | [C5] |
| **Dootax** | Caixa Postal Fiscal (gestão centralizada de DTEs), consulta automática de CND | [C6] |
| **HubStrom** | Ecossistema com monitoramento fiscal, captura de notas, atendimento, tarefas; **MonitorHub** acompanha obrigações com alertas. Lista de robôs `[NÃO ENCONTRADO]` | [C7] |
| **e-Kontroll** | e-Robô conectado ao banco do Domínio, indicadores para o contador (fonte de 2021) | [C8] |
| **Alterdata** | eRadar e-CAC; eTarefas com baixa automática por envio; painel de bilhetagem do Integra Contador; revenda de serviços do Integra (DAS a R$ 0,75 em 2025) | [C9] [S5] |
| **Omie G-Click / Nibo** | Leitura automática de documentos e ValidaPDF; Nibo Obrigações Plus identifica obrigações e clientes a partir de documentos | [C11] |
| **Makro** | Makro CND, conteúdo sobre DTE | [C12] |
| **MonitorCNPJ** | Monitoramento cadastral de CNPJs para escritórios | [C13] |
| **Questor** | Guias automatizadas (folha/eSocial) | [C14] |
| **Qive (Arquivei)** | Captura de NF-e, CT-e e NFS-e de 150+ prefeituras (aba D3); conteúdo sobre DIRBI e MIT. Monitoramento de CND/DCTFWeb `[NÃO ENCONTRADO]` | [C14-b] [S28] |
| **SIEG** | Citado como "cofre de documentos" fiscais; módulo de situação fiscal/certidões `[NÃO ENCONTRADO]` | [C5] |
| **Veri** | `[NÃO ENCONTRADO]` (buscado: "Veri contabilidade robô e-CAC") | — |

**Leitura do mercado:** monitoramento (e-CAC, DTE, CND) e envio de guias com protocolo já são oferecidos por vários. Não foram encontrados: calendário derivado da norma vigente, reprogramação automática por prorrogação, diagnóstico de impedimento de CND, conferência cruzada pré-transmissão integrada ao fluxo, campanhas por norma nova (editais, opção IBS/CBS, sublimite) e um chat que combine regra legal + dado do cliente + cálculo + ação. Esses são os candidatos a diferencial.

---

## Lacunas

1. **Leitura direta bloqueada.** Nenhuma página foi aberta por inteiro (WebFetch bloqueado; `netcpa.com.br` e `e-auditoria.com.br` não resolvem nesta rede). Tudo veio de trechos do buscador. A Etapa 2 precisa abrir as normas e as páginas oficiais.
2. **Integra Contador:** catálogo oficial atual e tabela de preços da Loja SERPRO `[NÃO ENCONTRADO]`; só preço de revenda (Alterdata, R$ 0,75/DAS em 2025) e relato de fórum (R$ 0,75–0,96) [S5][S6]. Confirmar se existem serviços de situação fiscal (SITFIS), DEFIS, DASN-SIMEI, Sicalc, PER/DCOMP e parcelamentos PGFN.
3. **Prazos a confirmar no texto oficial:** DCTFWeb (último dia útil, IN 2.248/2025, há fonte citando dia 15); EFD-Reinf (dia útil anterior ou posterior ao dia 15); DAS-MEI (dia 20); EFD-Contribuições; multa mínima do PGDAS-D (R$ 50 ou R$ 200); datas da opção do Simples 2027 (30/09 ou 15/10) e da desistência IBS/CBS (30/11 ou 20/12).
4. **Ciência tácita:** 15 dias (DTE geral) × 45 dias (DTE-SN) e prazos dos DTEs estaduais (SP, MG, PR, SC, RS) e municipais além de Curitiba `[NÃO ENCONTRADO]`.
5. **Estados:** calendários vigentes de MG e PR `[NÃO ENCONTRADO]`; situação da DIME em SC por fase; nomes oficiais das guias estaduais `[NÃO VERIFICADO]`; DeSTDA (dia 20 ou 28 por UF).
6. **Municípios:** só São Paulo capital foi coberta (ISS, NFTS, D-SUP, DEC). Faltam as capitais e os municípios com mais clientes nas cinco UFs.
7. **Parcelamentos:** regra de rescisão por parcelas em atraso e cobertura do Integra Parcelamento além do PARCSN.
8. **Reforma:** obrigação de destaque de CBS/IBS para optantes do Simples em 2026 `[NÃO VERIFICADO]`.
9. **Tempos:** nenhum dado público de tempo por atividade; todos os tempos são estimativa e devem vir do levantamento com os contadores.
10. **Concorrentes:** Onvio Processos (Brasil), SIEG, Veri e Qive sem página de funcionalidade fiscal encontrada; preços dos concorrentes não buscados (Etapa 2, V3).
11. **Robôs no e-CAC:** a RFB tem funcionalidade anti-robô [S7]. Qualquer atividade federal fora do Integra Contador deve ser tratada como C-crc/C-captcha ou D, e é preciso verificar termos de uso.

---

## Fontes

Todas consultadas em 05/11/2026, por WebSearch (trecho do buscador). "Data da fonte" quando o trecho a mostrava.

**Normas, órgãos e imprensa**

- [S1] Jornal Contábil, "Integra Contador oferece 27 serviços…" (2022): https://jornalcontabil.com.br/noticia/integra-contador-oferece-27-servicos-e-ficara-apta-a-partir-de-outubro/
- [S2] SERPRO, "Integra Contador: emissão automatizada CCMEI" (2024; 44 serviços, monitoramento gratuito de Caixa Postal, DCTFWeb e Pagamento Web): https://www.serpro.gov.br/menu/noticias/noticias-2024/integra-contador-emissao-automatizada-ccmei
- [S3] SERPRO, "Integra Contador: novas funcionalidades" (abr/2025, DCTFWeb e MIT): https://serpro.gov.br/menu/noticias/noticias-2025/integra-contador-novas-funcionalidades
- [S3-b] Pacote não oficial que lista SITFIS e Eventos de Atualização (não é fonte oficial): https://github.com/MarlonSantosDev/serpro_integra_contador_api
- [S4] SERPRO, "Integra Parcelamento" (nov/2024): https://www.serpro.gov.br/menu/noticias/noticias-2024/integra-parcelamento
- [S5] Alterdata, "Simples Nacional – API Serpro – Integra Contador" (preço de revenda 2025): https://ajuda.alterdata.com.br/fiscalbase/simples-nacional-api-serpro-integra-contador-206051349.html
- [S6] Fórum Contábeis, "Módulo Integra Contador tarifas" (set/2025): https://www.contabeis.com.br/forum/tributos-federais/410290/modulo-integra-contador-tarifas/
- [S7] CFC, reunião RFB/CFC/Fenacon sobre e-CAC e funcionalidade anti-robô (2021): https://cfc.org.br/noticias/em-reuniao-com-a-rfb-cfc-e-fenacon-buscam-solucoes-para-funcionamento-melhor-do-e-cac/
- [S8] Jornal Contábil, prazo da DCTFWeb (IN RFB 2.248/2025): https://www.jornalcontabil.com.br/noticia/prazo-de-envio-da-dctfweb-termina-nesta-segunda-dia-30/
- [S9] LegisWeb, "Publicada IN que institui o MIT na DCTFWeb e substitui a DCTF": https://www.legisweb.com.br/noticia/?id=29779
- [S9-b] Qive, "MIT: Módulo de Inclusão de Tributos na DCTFWeb" (DARF numerado × Sicalc): https://qive.com.br/blog/modulo-de-inclusao-tributaria
- [S10] CFC, "DCTFWeb – Novidades no sistema de CND": https://cfc.org.br/?p=53531 ; Jornal Contábil: https://www.jornalcontabil.com.br/noticia/dctfweb-em-andamento-nova-rotina-para-a-emissao-do-cnd/
- [S11] Fenacon, RFB orienta entrega do PGDAS-D e DEFIS antes das novas multas: https://fenacon.org.br/noticias/receita-federal-orienta-contribuintes-sobre-a-entrega-do-pgdas-d-e-da-defis-antes-das-novas-regras-de-multa/ ; AmdJus 2026: https://amdjus.com.br/2026-novas-normas-de-penalidades-para-pgdas-d-e-defis-serao-implantadas/
- [S12] Jornal Contábil, EFD-Contribuições e Reinf vencem dia 15: https://jornalcontabil.com.br/noticia/efd-contribuicoes-e-reinf-vencem-nesta-terca-15-e-atraso-gera-multa/ ; multa Reinf: https://jornalcontabil.com.br/noticia/fique-atento-a-multa-pela-declaracao-incorreta-ou-fora-do-prazo-da-efd-reinf/ ; DIRF 2025: https://conteudo.fiscal.io/extincao-da-dirf-e-prorrogada-para-2025/
- [S13] Econet, Termo de Exclusão: https://blog.econeteditora.com.br/exclusao-simples-nacional-termo-regularizacao-debitos ; LegisWeb, novo prazo (90 dias): https://www.legisweb.com.br/noticia/?id=31184
- [S14] COAD, "CGSN prorroga prazos para opção pelo Simples Nacional em 2027": https://www.coad.com.br/home/noticias-detalhe/139985/cgsn-prorroga-prazos-para-opcao-pelo-simples-nacional-em-2027 ; RFB, roteiro da opção para 2027: https://www8.receita.fazenda.gov.br/SimplesNacional/Arquivos/manual/Roteiro%20da%20op%C3%A7%C3%A3o%20pelo%20Simles%20Nacional%20para%20o%20ano%20de%202027.pdf
- [S15] BMA, opção pelo regime regular de IBS/CBS: https://www.bmalaw.com.br/en/content/tax/brazils-consumption-tax-reform/simples-nacional-taxpayers-have-until-september-30-2026-to-opt-for-the-regular-ibs-and-cbs-system ; NFE.io, novo prazo: https://nfe.io/blog/reforma-tributaria/novo-prazo-simples-nacional-ibs-cbs/
- [S16] Gazeta SP, DASN-SIMEI 2026: https://www.gazetasp.com.br/economia/meis-tem-ate-31-de-maio-para-evitar-multa-e-cnpj-irregular-veja-como/ ; Contábeis: https://www.contabeis.com.br/artigos/5477/dasn-simei-faca-sua-declaracao-de-mei-e-evite-multas/
- [S17] Jornal Contábil, fator R: https://jornalcontabil.com.br/noticia/calculando-o-fator-r-do-simples-nacional/ ; Buscador NCM, anexos e sublimite: https://buscadorncm.com.br/simples-nacional ; LC 123/2006 (a ler na Etapa 2): https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp123.htm
- [S18] Sefaz-SP, dispensadas da GIA: https://portal.fazenda.sp.gov.br/servicos/gia/Paginas/DispensadasGIA.aspx ; COAD: https://www.coad.com.br/home/noticias-detalhe/129988/sao-paulo-elimina-gia-a-partir-de-2026-e-avanca-na-modernizacao-tributaria
- [S19] Guia Tributário, GIA-ST SP dispensa a partir de jul/2025: https://guiatributario.net/2025/02/05/gia-st-icms-dispensa-a-partir-de-julho-2025-sao-paulo/
- [S20] SEF-SC, DeSTDA: https://www.sef.sc.gov.br/noticias/urgente-20-de-agosto-e-o-ultimo-dia-para-simples-nacional-enviar-destda ; COAD, dispensa da DIME: https://www.coad.com.br/home/noticias-detalhe/138371/nova-fase-de-dispensa-da-dime-tem-prazo-de-adesao-ate-30-de-setembro-em-santa-catarina ; DeSTDA SP dia 28: https://jornalcontabil.com.br/noticia/sp-publicado-norma-que-altera-para-o-dia-28-o-prazo-de-entrega-da-destda/amp/
- [S21] Receita Estadual RS, prazo GIA e EFD fev/2026: https://atendimento.receita.rs.gov.br/27-01-2026-prazo-de-entrega-gia-e-efd ; guia exige EFD validada: https://estado.rs.gov.br/geracao-da-guia-do-icms-exigira-efd-validada-e-assinada ; IN RE 25/2026: https://www.legisweb.com.br/legislacao/?id=493344
- [S22] Receita Estadual RS, DTE: https://atendimento.receita.rs.gov.br/o-acesso-a-caixa-postal-eletronica-do-dte-pode-ser-realizado-sem-certificado-digital ; https://atendimento.receita.rs.gov.br/o-contabilista-vinculado-ao-cadastro-pode-inserir-as-informacoes-de-contato-no-dte-ou-dar-ciencia-em-intimacoes-e-notificacoes
- [S23] COAD, MG e DT-e: https://www.coad.com.br/home/noticias-detalhe/134056/minas-gerais-orienta-contribuintes-a-utilizar-com-frequencia-o-domicilio-tributario-eletronico ; Decreto MG 47.531/2018: https://www.fazenda.mg.gov.br/empresas/legislacao_tributaria/decretos/2018/d47531_2018.html
- [S24] Curitiba, manual DEC: https://mid.curitiba.pr.gov.br/2024/00438168.pdf ; São Paulo capital, manual DEC (19/06/2026): https://smartsampa.prefeitura.sp.gov.br/documents/d/fazenda/manual_dec19062026-pdf
- [S25] COAD, DTE obrigatório para PJ a partir de 2026: https://www.coad.com.br/home/noticias-detalhe/135615/dte-passa-a-ser-obrigatorio-para-pessoas-juridicas-a-partir-de-2026 ; Jettax (alertas e-mail/SMS): https://www.jettax.com.br/blog/como-monitorar-pendencias-do-e-cac-automaticamente/ ; Agência Sebrae (DTE-SN 45 dias): https://agenciasebrae.com.br/?p=38207
- [S26] Razonet, CND federal 2026: https://razonet.com.br/contabilidade-digital/cnd-federal-o-que-e-como-emitir-e-qual-a-validade-da-certidao-negativa ; Contabilidade Zen, tabela de vencimento de certidões 2026: https://www.contabilidadezen.com.br/blog/tabela-vencimento-certidoes-negativas-2026/
- [S27] Mayer Brown, Edital PGFN 6/2026 (jun/2026): https://www.mayerbrown.com/pt/insights/publications/2026/06/notice-no-6-2026-pgfn-publishes-notice-on-tax-settlement-for-the-regularization-of-outstanding-debts ; APET, novos editais: https://apet.org.br/noticia/pgfn-abre-novos-editais-de-transacao-para-regularizacao-de-debitos-inscritos-em-divida-ativa/
- [S28] Qive, DIRBI 2026: https://qive.com.br/blog/dirb ; Cescon Barrieu: https://cesconbarrieu.com.br/rfb-amplia-beneficios-sujeitos-a-declaracao-dirbi/
- [S29] Prefeitura de São Paulo, ISS: https://prefeitura.sp.gov.br/web/fazenda/servicos/iss/ ; Agenda fiscal SP 2026: https://www.normasbrasil.com.br/norma/agenda-fiscal-2026-sao-paulo_489230.html
- [S30] Okai, autorregularização monofásico (fev/2023): https://okai.com.br/noticia/2023-02-17/operacao-autorregularizacao-do-simples-nacional-com-foco-em-pis-e-cofins-com-indicacao-de-existencia-de-tributacao-monofasica ; Jornal Contábil, restituição monofásico: https://jornalcontabil.com.br/noticia/recuperacao-tributaria-restituicao-do-pis-e-cofins-monofasicos/amp/
- [S31] Jornal Contábil, autorregularização da malha PJ: https://www.jornalcontabil.com.br/noticia/como-fazer-a-auto-regularizacao-da-malha-fiscal-das-pessoas-juridicas/
- [S31-b] TCE-PI, apresentação EFD-Reinf/DCTFWeb (retificação gera nova DCTFWeb em andamento): https://www.tcepi.tc.br/wp-content/uploads/2023/09/EFD-REINF-DCTFWeb.pdf
- [S32] Sefaz-ES, nota IBS/CBS 2026: https://sefaz.es.gov.br/Media/Sefaz/Links/Nota%20IBS%20CBS%20Sefaz.pdf ; COAD, sem multas antes de 90 dias do regulamento: https://www.coad.com.br/home/noticias-detalhe/136824/reforma-tributaria-receita-federal-esclarece-que-nao-ha-aplicacao-de-multas-antes-de-90-dias-apos-a-publicacao-do-regulamento

**Concorrentes**

- [C1] Acessórias: https://acessorias.com/site/ ; e-Contínuo: https://acessorias.com/site/e-continuo-automacao-inteligente-para-escritorios-contabeis/ ; Komunic: https://acessorias.com/site/funcionalidade/komunic/ ; IA: https://acessorias.com/site/ferramentas-ia-contabilidade/
- [C2] Thomson Reuters, "Conheça o Gestta" (PDF): https://images.engage.es-pt.thomsonreuters.com/Web/LALEYSAEIMPRESORA/%7Be40173fd-00db-4d29-a84a-2c10c7c668bf%7D_OUT-_513_-_WP__-_TR_-_Conhe%c3%a7a_o_GESTTA_(NOVO).pdf ; Perguntas e respostas: https://images.engage.es-pt.thomsonreuters.com/Web/LALEYSAEIMPRESORA/%7Bfa3be1a4-eadc-479b-a994-f9e425ce049d%7D_TAX_PROF_BR_PDF_PERGUNTAS_E_RESPOSTAS_Base.pdf
- [C3] Jettax, monitorar pendências do e-CAC: https://www.jettax.com.br/blog/como-monitorar-pendencias-do-e-cac-automaticamente-e-evitar-surpresas-fiscais/ ; CND automática: https://www.jettax.com.br/blog/cnd-automatica-como-escritorios-estao-eliminando-o-trabalho-manual/ ; obrigações acessórias: https://www.jettax.com.br/blog/obrigacoes-acessorias-e-jettax/
- [C4] HubCount, HubCND: https://hubcount.com.br/artigo/hubcnd-a-queridinha-dos-escritorios-e-empresas ; HubAlertas: https://hubcount.com.br/artigo/hubalertas-como-fazer-o-monitoramento-de-pendencias-fiscais-de-maneira-automatica ; automação: https://hubcount.com.br/artigos/automacao-contabil
- [C5] e-Auditoria, integração com o e-CAC: https://www.e-auditoria.com.br/solucoes/para-integrar/integracao-com-o-e-cac/ ; guia da API: https://www.e-auditoria.com.br/blog/api-do-e-cac-via-integra-contador-guia-completo/ ; robôs: https://www.e-auditoria.com.br/blog/como-nossos-robos-capturam-arquivos-fiscais-de-forma-automatica/
- [C6] Dootax, Caixa Postal Fiscal: https://dootax.com.br/solucoes/caixa-postal-fiscal/ ; CND: https://dootax.com.br/consultar-cnd-automaticamente/amp/
- [C7] AmdJus sobre HubStrom: https://amdjus.com.br/hubstrom-revoluciona-a-contabilidade-com-seu-ecossistema-inteligente-integrado/
- [C8] Fenacon, e-Kontroll (2021): https://fenacon.org.br/noticias/fenacon-talks-ferramenta-e-kontroll-e-as-solucoes-inteligentes-para-escritorios-contabeis/
- [C9] Alterdata, eRadar e-CAC: https://ajuda.alterdata.com.br/alterdatapackup/eradar-ecac-321947526.html ; eTarefas baixa automática: https://ajuda.alterdata.com.br/packupbase/tema-etarefas/etarefas-baixa-automatica-envios-que-geram-a-baixa-automatica-da-tarefa-pelo-updocs-ou-sistemas-desktop ; bilhetagem: https://ajuda.alterdata.com.br/packfinbase/painel-bilhetagem-integra-contador
- [C10] Domínio, DARF da DCTFWeb por rotinas automáticas: https://suporte.dominioatendimento.com/central/faces/solucao.html?codigo=11123
- [C11] Omie G-Click: https://www.omie.com.br/gclick/index.md ; ValidaPDF: https://ajuda.omie.com.br/pt-BR/articles/15205190-omie-g-click-validapdf-anexo-com-validacao-de-dados-antigo-pdf-layout-validapdf-anexo-com-validacao-de-dados-antigo-pdf-layout
- [C12] Makro, CND: https://makrosystem.com.br/blog/funcionamento-do-makro-cnd/ ; DTE: https://makrosystem.com.br/blog/dte/
- [C13] MonitorCNPJ: https://monitorcnpj.com.br/solucoes/escritorios-de-contabilidade/
- [C14] Questor, guias automatizadas: https://docs.questor.com.br/pt-br/Produtos/GestãoContábilCloud/FolhadePagamento/eSocial/Guias-automatizadas-Cloud
- [C14-b] Contábeis, sobre o Arquivei (captura em 150+ prefeituras): https://www.contabeis.com.br/noticias/53422/pontos-que-impedem-o-crescimento-do-seu-escritorio-contabil/

---

## Fichas do ciclo de vida (rodada 3, 6/11/2026)

Rodada feita com a classificação dos contadores do grupo: **Entrada → Manutenção → Desligamento**. As 47 fichas acima ficam como estão (a etapa de cada uma está no retorno do agente para o visualizador). Aqui entram só as lacunas **fiscais** de Entrada e Desligamento que o arquivo não cobria. O lado geral da chegada e da saída (onboarding, diagnóstico de entrada, acervo do contador anterior, offboarding, baixa societária) já está no D1 (SOC-021 a SOC-024, SOC-031); as fichas abaixo são a parte fiscal que esses fluxos chamam. Fontes da rodada: códigos `[R3-n]`, lista no fim da seção, todas consultadas em **06/11/2026**. Onde a fonte foi lida só pelo trecho do buscador, isso está dito na lista. Tempos seguem `[ESTIMATIVA]`.

**Achado que mexe com o desenho:** a Res. CFC 1.590/2020, art. 10, põe no contador que sai as obrigações acessórias **das competências do contrato**, mesmo que vençam depois, salvo cláusula em contrário; o art. 9 manda o distrato fixar forma e prazo de devolução dos arquivos das obrigações entregues ao Fisco, e o art. 8 manda o contador que sai comunicar ao novo os fatos que este deve conhecer [R3-1]. A NBC PG 01 repete o dever de informar o substituto [R3-2]. Ou seja: a "competência de corte" é um dado obrigatório do cliente, tanto na Entrada quanto no Desligamento, e o calendário (FIS-001) precisa respeitá-la.

### FIS-101 · Levantar o perfil fiscal de entrada e os regimes especiais do cliente

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Fiscal / Entrada do cliente (transversal: D1 SOC-002, D6) |
| atividade | Na chegada do cliente (empresa nova ou vinda de outro escritório), montar o perfil fiscal completo: regime e histórico de regimes, inscrições por UF e município, ST, ISS próprio e retido, benefícios fiscais, regimes especiais e termos de acordo vigentes, obrigações por UF, e só então gerar o primeiro calendário |
| descrição | Hoje é um questionário informal no onboarding e a parametrização "regime × obrigação" do gestor de tarefas (FIS-001 estima 30 min por cliente novo). Regimes especiais estaduais, termos de acordo e benefícios com obrigações próprias (ex.: DIRBI, FIS-022) costumam ser descobertos quando a obrigação atrasa ou quando o fisco cobra |
| gatilho_frequência | Por evento (cliente novo; abertura de empresa) |
| porte_alcance | Todos os clientes que entram |
| quem_faz | Coordenador fiscal / analista sênior |
| onde_é_feita_hoje | Planilha de onboarding, e-mail com o cliente e com o contador anterior, gestor de tarefas |
| entradas / saídas | Cartão CNPJ, inscrições, últimos SPED e declarações (do acervo, SOC-023), atos de regime especial → perfil fiscal temporal aprovado + calendário inicial (FIS-001) |
| base_legal | Uma por obrigação e por regime (ver FIS-009 a FIS-030); regimes especiais conforme RICMS de cada UF `[NÃO VERIFICADO]` (não buscado nesta rodada) |
| risco_se_falhar | Obrigação não parametrizada desde o primeiro mês = multa por atraso; benefício usado sem cumprir a obrigação acessória que o condiciona |
| tempo_estimado | `[ESTIMATIVA]` 1–3 h por cliente que entra |
| concorrentes | Gestta exige o regime de cada cliente para parametrizar [C2]; Nibo Obrigações Plus identifica obrigações a partir de documentos [C11]. Nenhum encontrado que leia regimes especiais e benefícios `[NÃO ENCONTRADO]` |
| hipótese_automação | Questionário dirigido no app do cliente + leitura dos SPED e XMLs recebidos (CST, CFOP, ajustes de apuração, códigos de benefício) para sugerir o perfil; gestor confirma; calendário gerado a partir do perfil aprovado |
| papel_da_ia | M2 (dados recebidos) + M1 (que obrigação cada traço do perfil gera) → **rascunhar** o perfil; aprovação humana; M4 **executar** a criação do calendário |
| ferramentas_agênticas | `sugerir_perfil_fiscal(cliente, arquivos)`, `listar_regimes_especiais(cliente)`, `confirmar_perfil_fiscal(cliente)` |
| eventos_timesheet | `fiscal.entrada.perfil` (cliente, origem: nova/transição, aprovado por) |
| fontes_descoberta | [C2] [C11] |
| etapa | Entrada |
| nível_automação (provisório) | Próprio (leitura dos arquivos do cliente) + A (dados cadastrais e situação no Simples pelas consultas federais) |

### FIS-102 · Definir a competência de corte e dividir as obrigações do mês de transição com o contador anterior

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Fiscal / Entrada do cliente · transição (transversal: D1 SOC-023, D4, D5) |
| atividade | Fixar, por escrito, a última competência de responsabilidade do contador anterior e a primeira do escritório, e listar obrigação por obrigação quem transmite o quê nos meses em que as duas responsabilidades se cruzam |
| descrição | Pela Res. CFC 1.590/2020, art. 10, as obrigações acessórias das competências do contrato antigo cabem ao contador que sai, mesmo vencendo depois, salvo cláusula em contrário [R3-1]. Na prática a combinação é por e-mail ou telefone, e o mês de transição é onde a obrigação "cai entre as cadeiras" (DCTFWeb, EFD-Reinf, PGDAS-D, SPED do mês do corte). Guias de mercado tratam a falta de clareza sobre "quem entrega o quê" como a principal fonte de multa na troca [R3-8] |
| gatilho_frequência | Por evento (cliente vindo de outro escritório) |
| porte_alcance | Clientes em transição |
| quem_faz | Coordenador fiscal + sócio |
| onde_é_feita_hoje | E-mail, telefone, termo de transferência de responsabilidade técnica em modelo livre |
| entradas / saídas | Data do distrato do cliente com o anterior, calendário do cliente → termo de corte por obrigação, tarefas só a partir da competência certa, pendências do anterior acompanhadas |
| base_legal | Res. CFC 1.590/2020, arts. 8º, 9º e 10 [R3-1]; NBC PG 01 (dever de informar o substituto) [R3-2] |
| risco_se_falhar | Obrigação omitida no mês de transição (multa por atraso), ou entregue em duplicidade (retificação); disputa sobre quem responde pela multa |
| tempo_estimado | `[ESTIMATIVA]` 30–60 min por cliente, mais o acompanhamento do que ficou com o anterior |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | O calendário (FIS-001) ganha o campo "competência de corte"; para cada obrigação do mês de transição a plataforma gera a linha "anterior / escritório", manda ao contador anterior para confirmação e acompanha o recibo do que ficou com ele (via consulta de declarações transmitidas, FIS-103) |
| papel_da_ia | M1 (regra do art. 10 e prazos) + M2 (calendário) → **rascunhar** o termo de corte e a mensagem ao anterior; M4 **executar** o acompanhamento com aprovação |
| ferramentas_agênticas | `definir_competencia_corte(cliente, data)`, `gerar_termo_corte(cliente)`, `acompanhar_obrigacoes_anterior(cliente)` |
| eventos_timesheet | `fiscal.transicao.corte` (cliente, competência, obrigações com o anterior) |
| fontes_descoberta | [R3-1] [R3-2] [R3-8] |
| etapa | Entrada (o mesmo corte é usado no Desligamento, FIS-108) |
| nível_automação (provisório) | Próprio |

### FIS-103 · Conferir o histórico fiscal herdado: declarado × apurado × pago

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Fiscal / Entrada do cliente · transição (transversal: D1 SOC-022, D5) |
| atividade | Conferir, no período ainda não decaído, se as declarações transmitidas pelo contador anterior batem com as apurações e com os pagamentos, e se há omissões, retificações pendentes, DCTFWeb "em andamento" ou divergências entre declarações (ex.: PGDAS-D × DEFIS, EFD-Contribuições × DCTFWeb) |
| descrição | O diagnóstico de entrada do D1 (SOC-022) tira a fotografia de pendências que o fisco já aponta. Esta ficha vai além: procura o erro que o fisco ainda não apontou e que vai virar malha ou intimação depois que o escritório assumir. Guias de troca recomendam revisar pelo menos os últimos 24 meses de declarações e pedir ao anterior relatório de débitos e parcelamentos [R3-9]; divergência entre declarações é citada como gatilho de malha na troca [R3-8] |
| gatilho_frequência | Por evento (cliente vindo de outro escritório) |
| porte_alcance | Clientes em transição (prioridade: Lucro Presumido e Real, e Simples com faturamento alto) |
| quem_faz | Analista sênior |
| onde_é_feita_hoje | e-CAC, PGDAS-D, planilhas de conferência montadas à mão |
| entradas / saídas | Recibos e arquivos recebidos (SOC-023), consultas de declarações e pagamentos → relatório de herança assinado pelo cliente (o que é do período anterior), lista de retificações sugeridas |
| base_legal | Res. CFC 1.590/2020, art. 10 (responsabilidade do anterior pelas competências do contrato) [R3-1]; prazo decadencial do CTN `[NÃO VERIFICADO]` nesta rodada |
| risco_se_falhar | Escritório herda malha, multa e retrabalho sem prova de que o erro é anterior; cliente atribui ao escritório novo |
| tempo_estimado | `[ESTIMATIVA]` 2–8 h por cliente, conforme regime e período |
| concorrentes | Hubstrom e monitores de e-CAC trazem a situação fiscal [C3][C4]; conferência de consistência entre declarações herdadas `[NÃO ENCONTRADO]` |
| hipótese_automação | Reuso das regras de conferência cruzada da FIS-004, aplicadas em lote ao histórico: cruza declarações (consultas federais), pagamentos e arquivos do core; relatório com diferenças e valor estimado de risco |
| papel_da_ia | M2 + M3 → **ler** e **rascunhar** o relatório de herança; M1 explica a consequência de cada divergência |
| ferramentas_agênticas | `conferir_historico_herdado(cliente, periodo)`, `gerar_relatorio_heranca(cliente)` |
| eventos_timesheet | `fiscal.transicao.conferencia` (cliente, período, nº de divergências) |
| fontes_descoberta | [R3-1] [R3-8] [R3-9] [C3] [C4] |
| etapa | Entrada |
| nível_automação (provisório) | A (declarações e pagamentos federais pelas consultas do Integra Contador, a confirmar por serviço) + F (arquivos do core) |

### FIS-104 · Inventariar e assumir créditos, saldos credores e pedidos em andamento herdados

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Fiscal / Entrada do cliente · transição (transversal: D5, D6) |
| atividade | Levantar e trazer para o controle do escritório o saldo credor de ICMS, créditos de PIS/Cofins, saldo negativo de IRPJ/CSLL, pedidos de restituição, ressarcimento e compensação (PER/DCOMP) e ressarcimentos estaduais já pedidos pelo contador anterior, com prazo de cada um |
| descrição | Saldo credor e pedidos em andamento ficam na cabeça ou na planilha do contador anterior. Sem o histórico, o novo escritório perde o saldo, deixa o pedido prescrever ou transmite PER/DCOMP repetindo crédito já usado (caso real de intimação por crédito já informado em PER/DCOMP anterior [R3-16]). Para usar ou homologar saldo credor, erros comuns são notas não escrituradas e divergência entre SPED e livros [R3-15] |
| gatilho_frequência | Por evento (cliente vindo de outro escritório) |
| porte_alcance | Clientes com crédito acumulado (comércio com ST, exportadores, Lucro Real) |
| quem_faz | Analista sênior / consultor |
| onde_é_feita_hoje | Planilha, e-CAC (PER/DCOMP Web), portais estaduais |
| entradas / saídas | Última EFD ICMS/IPI e EFD-Contribuições, recibos de PER/DCOMP, processos estaduais → registro dos saldos de abertura e pedidos em FIS-042 e FIS-043, com prazos |
| base_legal | IN RFB 2.055/2021 (PER/DCOMP) [S30] `[confirmar]`; RICMS de cada UF para saldo credor `[NÃO VERIFICADO]` |
| risco_se_falhar | Perda de crédito; multa por compensação não homologada; glosa |
| tempo_estimado | `[ESTIMATIVA]` 1–4 h por cliente com crédito |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Leitura do saldo credor final e dos registros de crédito nas EFD recebidas; lista de PER/DCOMP pedida ao anterior e conferida; cada item vira registro com contagem de prazo em FIS-042 |
| papel_da_ia | M2 + M3 → **ler** e **rascunhar** o inventário; M1 aponta prazos; aprovação do sênior |
| ferramentas_agênticas | `ler_saldos_credores(cliente, arquivos)`, `importar_perdcomp_herdados(cliente, lista)` |
| eventos_timesheet | `fiscal.transicao.creditos` (cliente, nº de itens, valor) |
| fontes_descoberta | [R3-15] [R3-16] [S30] |
| etapa | Entrada |
| nível_automação (provisório) | F (EFD e arquivos do core recebidos do anterior) |

### FIS-105 · Inventariar parcelamentos, transações, processos e intimações em prazo herdados

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Fiscal / Entrada do cliente · transição (transversal: D1 SOC-022) |
| atividade | Listar todos os parcelamentos e transações ativos (federais, PGFN, estaduais, municipais), as defesas e recursos administrativos em curso e as intimações com prazo correndo, e trazê-los para o controle mensal (FIS-034, FIS-038) antes da primeira parcela ou do primeiro prazo |
| descrição | Na troca, a primeira parcela sob o novo escritório é a que mais atrasa: ninguém emitiu, o débito automático não existe, a guia estava com o anterior. Atraso em parcelas, conforme a UF, rompe o acordo (ex.: duas ou três parcelas, consecutivas ou não) [R3-15]. Guias de troca recomendam pedir ao anterior relatório de débitos e parcelamentos em curso [R3-9] |
| gatilho_frequência | Por evento (cliente vindo de outro escritório) |
| porte_alcance | Clientes com dívida parcelada ou processo em curso |
| quem_faz | Analista fiscal + sócio (decisões de defesa) |
| onde_é_feita_hoje | e-CAC, Regularize (PGFN), portais estaduais e municipais, planilha |
| entradas / saídas | Relatórios do anterior, consultas de parcelamento, caixa postal → cadastro de cada parcelamento e prazo, primeira guia emitida, responsáveis |
| base_legal | Regras de rescisão por parcelamento e UF `[NÃO VERIFICADO]` (lacuna 7 deste arquivo segue aberta) |
| risco_se_falhar | Rescisão do parcelamento, retorno do débito à cobrança, inscrição em dívida ativa, perda de prazo de defesa |
| tempo_estimado | `[ESTIMATIVA]` 1–2 h por cliente com passivo |
| concorrentes | Monitores trazem dívida ativa e pendências [C3][C5]; inventário de entrada com prazos `[NÃO ENCONTRADO]` |
| hipótese_automação | Consulta dos parcelamentos federais por API (Integra Parcelamento, PARCSN [S4]); leitura da caixa postal herdada (FIS-005) para achar intimações em prazo; o resto pedido ao cliente e ao anterior pelo app com checklist |
| papel_da_ia | M2 + M1 (prazos) → **ler** e **rascunhar** o inventário; M4 **executar** a criação das tarefas e da primeira guia com aprovação |
| ferramentas_agênticas | `inventariar_parcelamentos(cliente)`, `listar_prazos_em_curso(cliente)`, `importar_passivo_herdado(cliente)` |
| eventos_timesheet | `fiscal.transicao.passivo` (cliente, nº de parcelamentos, nº de prazos) |
| fontes_descoberta | [R3-9] [R3-15] [S4] [C3] [C5] |
| etapa | Entrada |
| nível_automação (provisório) | A (parcelamentos federais do Simples pelo Integra Parcelamento) + C-cert (estaduais e municipais) |

### FIS-106 · Regularizar obrigações omitidas herdadas

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Fiscal / Entrada do cliente · regularização (transversal: D1 SOC-022) |
| atividade | Montar e executar o plano de entrega das declarações em atraso encontradas na entrada (PGDAS-D, DEFIS, DASN-SIMEI, DCTFWeb, EFD-Reinf, SPED, declarações estaduais e municipais), com cálculo das multas por atraso e ordem de prioridade |
| descrição | Cliente que chega "bagunçado" traz meses ou anos de omissão. Hoje o plano é planilha e a entrega é manual, portal por portal. A multa por atraso na entrega de declaração não é afastada pela denúncia espontânea, segundo a jurisprudência do STJ e a Súmula CARF 49 citadas pelas fontes [R3-10]; por isso a ordem de entrega muda o custo. Omissão leva a CNPJ inapto (ex.: DASN-SIMEI [S16]) e, no Simples, a DEFIS em atraso trava as apurações seguintes |
| gatilho_frequência | Por evento (diagnóstico de entrada com omissões) |
| porte_alcance | Clientes que chegam com omissões (frequente em MEI e Simples) |
| quem_faz | Analista fiscal |
| onde_é_feita_hoje | Portais de cada obrigação, planilha |
| entradas / saídas | Lista de omissões (SOC-022, FIS-103) → plano com valores de multa aprovado pelo cliente, declarações entregues, recibos, MAED pagas |
| base_legal | Multas por obrigação (ver FIS-009, FIS-013, FIS-017, FIS-040); CTN art. 138 e entendimento do STJ sobre obrigação acessória autônoma [R3-10] (lido pelo trecho do buscador) |
| risco_se_falhar | CNPJ inapto, CND bloqueada, multa crescente, exclusão do Simples |
| tempo_estimado | `[ESTIMATIVA]` 15–40 min por declaração atrasada; 2–20 h por cliente |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Plano gerado das omissões, com multa calculada (M3) e ordem sugerida; transmissão pela API onde existe (PGDAS-D e DCTFWeb pelo Integra Contador) e roteiro guiado nos demais portais; proposta de honorário extra (SOC-017) |
| papel_da_ia | M1 + M3 → **rascunhar** o plano; M4 **executar com aprovação** o que tem API; o resto a pessoa transmite com o roteiro |
| ferramentas_agênticas | `plano_regularizacao_omissoes(cliente)`, `calcular_multas_atraso(cliente, lista)`, `registrar_entrega_atrasada(cliente, obrigacao, recibo)` |
| eventos_timesheet | `fiscal.regularizacao.entrega` (cliente, obrigação, competência, multa) |
| fontes_descoberta | [R3-10] [S16] |
| etapa | Entrada (também Manutenção, quando a omissão surge com o cliente já ativo) |
| nível_automação (provisório) | D-assistido (portais sem API) + A (PGDAS-D e DCTFWeb via Integra Contador) |

### FIS-107 · Habilitar o cliente nos ambientes fiscais eletrônicos

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Fiscal / Entrada do cliente · abertura e transição (transversal: D1, D3) |
| atividade | Na abertura de empresa nova ou na chegada de um cliente, deixar pronto tudo que o fiscal precisa para operar: credenciamento como emissor de NF-e/NFC-e na Sefaz (e CSC da NFC-e), emissor de NFS-e, domicílios eletrônicos estaduais e municipais com o contato do escritório, autorização do escritório no Integra Contador, cadastro do contabilista nos portais estaduais |
| descrição | O credenciamento é por inscrição estadual (filial em outra UF exige novo); em vários Estados é automático com IE ativa, em outros é pedido no portal; IE irregular impede o credenciamento [R3-13]. NFC-e exige CSC antes da primeira nota [R3-13]. O Integra Contador só libera consultas depois da autorização do cliente ao escritório conferida pelo e-CAC [R3-12]. Hoje é checklist de memória, e a falha aparece na primeira nota rejeitada ou na primeira guia que não sai |
| gatilho_frequência | Por evento (abertura, cliente novo, nova filial ou UF) |
| porte_alcance | Todos os clientes que entram; mais trabalho em contribuintes de ICMS |
| quem_faz | Assistente fiscal / legalização |
| onde_é_feita_hoje | Portais da Sefaz e da prefeitura, e-CAC, planilha |
| entradas / saídas | CNPJ, IE, IM, perfil (FIS-101) → lista de ambientes habilitados com evidência; pendências do cliente no app |
| base_legal | Legislação de cada UF e município `[NÃO VERIFICADO]` nesta rodada; DTE federal compulsório [S25] |
| risco_se_falhar | Cliente sem conseguir emitir nota (operação parada); intimação no DTE sem leitura; automações federais sem acesso |
| tempo_estimado | `[ESTIMATIVA]` 1–2 h por cliente; mais por UF adicional |
| concorrentes | `[NÃO ENCONTRADO]` checklist dedicado |
| hipótese_automação | Checklist gerado do perfil (que ambientes cada UF e município exige), roteiro passo a passo para o cliente ou para a pessoa no portal, verificação depois (consulta de credenciamento e de procurações) |
| papel_da_ia | M1 (exigências por UF e município) + M2 → **rascunhar** o roteiro; M4 **executar** as verificações e lembretes |
| ferramentas_agênticas | `checklist_ambientes_fiscais(cliente)`, `verificar_habilitacoes(cliente)` |
| eventos_timesheet | `fiscal.entrada.habilitacao` (cliente, ambiente, status) |
| fontes_descoberta | [R3-12] [R3-13] [S25] |
| etapa | Entrada |
| nível_automação (provisório) | D-assistido (atos nos portais) + A (verificação de procurações e autorizações federais) |

### FIS-108 · Montar e entregar o dossiê fiscal ao novo contador e cumprir as competências do contrato

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Fiscal / Desligamento · saída para outro contador (transversal: D1 SOC-024, D3 NFE-036, D5) |
| atividade | Quando o cliente sai: fechar as obrigações das competências do contrato (mesmo que vençam depois), montar o pacote fiscal (recibos, declarações e arquivos entregues, guias e comprovantes, parcelamentos ativos, saldos credores e PER/DCOMP em curso, intimações e prazos abertos, regimes especiais) e entregar com protocolo, com a carta de fatos relevantes ao novo responsável |
| descrição | A Res. CFC 1.590/2020 exige distrato, prazo e forma de devolução dos arquivos das obrigações entregues ao Fisco, comunicação ao novo responsável dos fatos que deve conhecer e cumprimento, pelo que sai, das obrigações das competências do contrato [R3-1]. Hoje o pacote é montado à mão em dias, e os "fatos relevantes" (prazo de intimação, parcela do mês, crédito pedido) se perdem |
| gatilho_frequência | Por evento (aviso de saída do cliente) |
| porte_alcance | Clientes que saem para outro escritório |
| quem_faz | Coordenador fiscal + sócio |
| onde_é_feita_hoje | Pastas, e-mail, mídia, protocolo em papel ou ferramenta de protocolo |
| entradas / saídas | Calendário com a competência de corte (FIS-102), registros de FIS-003, FIS-034, FIS-042, FIS-038 → dossiê com índice, carta de fatos relevantes, protocolo de entrega assinado, lista de obrigações ainda a cumprir pelo escritório |
| base_legal | Res. CFC 1.590/2020, arts. 6º a 10 [R3-1]; NBC PG 01 [R3-2] |
| risco_se_falhar | Infração ética e disciplinar (art. 11 da Res. 1.590 remete às penalidades do DL 9.295/1946) [R3-1]; multa por obrigação de competência do contrato não entregue; disputa com o cliente e o novo escritório |
| tempo_estimado | `[ESTIMATIVA]` 2–6 h por cliente |
| concorrentes | Acessórias Protocolo Digital (entrega com assinatura) [C1]; dossiê fiscal montado dos registros `[NÃO ENCONTRADO]` |
| hipótese_automação | Dossiê gerado dos registros que a plataforma já guarda (recibos, guias, parcelamentos, créditos, prazos), carta de fatos relevantes rascunhada pelos itens abertos, entrega pelo app do cliente com protocolo; tarefas das últimas competências mantidas até o recibo |
| papel_da_ia | M2 (registros) + M1 (o que a norma exige) → **rascunhar** dossiê e carta; M4 **executar** a entrega com aprovação |
| ferramentas_agênticas | `gerar_dossie_fiscal_saida(cliente, data_corte)`, `rascunhar_carta_fatos_relevantes(cliente)`, `listar_obrigacoes_pos_saida(cliente)` |
| eventos_timesheet | `fiscal.saida.dossie` (cliente, itens, entregue em, protocolo) |
| fontes_descoberta | [R3-1] [R3-2] [C1] |
| etapa | Desligamento |
| nível_automação (provisório) | Próprio |

### FIS-109 · Encerrar acessos, automações e consumos fiscais do ex-cliente

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Fiscal / Desligamento (transversal: D1 SOC-024, D7) |
| atividade | Depois da última competência sob responsabilidade do escritório: encerrar o calendário e os monitores (caixa postal, DTE, CND, situação fiscal), tirar o cliente das chamadas pagas do Integra Contador e de outros fornecedores, remover o contato do escritório nos domicílios eletrônicos e confirmar a revogação das procurações e autorizações fiscais |
| descrição | A revogação geral de procurações e certificados está no offboarding do D1 (SOC-024). A parte fiscal que sobra é operacional: robôs e consultas continuam rodando e gerando custo por consulta, alertas de ex-cliente poluem a fila, e o escritório pode até transmitir por engano. A procuração eletrônica da RFB só é cancelada pelo e-CAC, segundo a norma citada pelas fontes [R3-11]; a autorização no Integra Contador é conferida pelo e-CAC [R3-12] e o consumo é cobrado por chamada [S5] |
| gatilho_frequência | Por evento (saída ou baixa, após a última competência) |
| porte_alcance | Clientes que saem ou encerram |
| quem_faz | Coordenador fiscal / TI |
| onde_é_feita_hoje | Não é feito de forma sistemática `[ESTIMATIVA]` |
| entradas / saídas | Data de corte (FIS-102) → monitores e tarefas desligados, consumo zerado, evidência das revogações |
| base_legal | IN RFB 1.751/2017 (procuração eletrônica) [R3-11] (trecho do buscador); LGPD para a guarda dos dados (D1 SOC-020) |
| risco_se_falhar | Custo contínuo, acesso indevido a dados de ex-cliente (LGPD), ato praticado sem contrato |
| tempo_estimado | `[ESTIMATIVA]` 20–40 min por cliente |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Status "em saída" e "inativo" no perfil temporal; ao passar a "inativo", a plataforma desliga sozinha tudo o que é dela e gera a lista do que depende de ato externo |
| papel_da_ia | M2 lista vínculos; M4 **executar** o que é interno; **rascunhar** pedidos ao cliente |
| ferramentas_agênticas | `desligar_automacoes_fiscais(cliente, data)`, `listar_vinculos_fiscais(cliente)` |
| eventos_timesheet | `fiscal.saida.desligamento` (cliente, itens desligados) |
| fontes_descoberta | [R3-11] [R3-12] [S5] |
| etapa | Desligamento |
| nível_automação (provisório) | Próprio (internos) + D-assistido (revogações em portais) |

### FIS-110 · Cumprir as obrigações fiscais de encerramento na baixa da empresa

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Fiscal / Desligamento · baixa (transversal: D1 SOC-031, D4, D5) |
| atividade | Na extinção, entregar as declarações de situação especial e as últimas competências: DEFIS e DASN-SIMEI de extinção, PGDAS-D e DAS até o mês da baixa, DCTFWeb e EFD-Reinf finais (com o evento de encerramento), últimas EFD e declarações estaduais e municipais |
| descrição | O D1 (SOC-031) coordena a baixa e deixa as obrigações de encerramento para D2/D5. Prazos próprios e fáceis de perder: DEFIS de situação especial vence no último dia de junho se o evento for no 1º quadrimestre, senão no último dia do mês seguinte (Res. CGSN 140/2018, art. 72, §2º) [R3-4]; DASN-SIMEI de extinção segue a mesma regra, e o MEI deve os valores mensais até o mês da baixa, mesmo baixando no dia 1º [R3-3]. Na EFD-Reinf a baixa é feita pelo R-1000 com data de encerramento e indicativo de extinção, depois da baixa do CNPJ [R3-7] (fonte de fornecedor de software) |
| gatilho_frequência | Por evento (baixa) |
| porte_alcance | Empresas em encerramento |
| quem_faz | Analista fiscal |
| onde_é_feita_hoje | Portais de cada obrigação, checklist de memória |
| entradas / saídas | Data do evento de extinção, perfil (FIS-101) → calendário de encerramento, declarações entregues, recibos, relatório final ao cliente |
| base_legal | Res. CGSN 140/2018, art. 72, §2º [R3-4]; Manual DASN-SIMEI (RFB) [R3-3]; demais por obrigação `[NÃO VERIFICADO]` |
| risco_se_falhar | Multa por atraso, pendência que impede ou desfaz a regularidade dos sócios, débito transferido aos responsáveis |
| tempo_estimado | `[ESTIMATIVA]` 2–5 h por empresa |
| concorrentes | Acessórias (processo de baixa) [C1]; calendário fiscal de encerramento derivado da norma `[NÃO ENCONTRADO]` |
| hipótese_automação | Ao registrar a data de extinção, o calendário (FIS-001) gera as obrigações de situação especial com prazo calculado pela regra do quadrimestre e encerra as recorrentes depois da última competência |
| papel_da_ia | M1 (prazos de situação especial) + M2 → **rascunhar** o calendário de encerramento; M4 **executar com aprovação** o que tem API |
| ferramentas_agênticas | `gerar_calendario_encerramento(cliente, data_extincao)`, `checar_obrigacoes_encerramento(cliente)` |
| eventos_timesheet | `fiscal.baixa.obrigacao` (cliente, obrigação, prazo, entregue) |
| fontes_descoberta | [R3-3] [R3-4] [R3-7] [C1] |
| etapa | Desligamento |
| nível_automação (provisório) | D-assistido (DEFIS, DASN-SIMEI, Reinf e estaduais nos portais) + A (PGDAS-D, DAS e DCTFWeb pelo Integra Contador) |

### FIS-111 · Tratar o estoque final, o ICMS e o saldo credor na baixa da inscrição estadual

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Fiscal / Desligamento · baixa (transversal: D1 SOC-031, D3, D5) |
| atividade | Antes de pedir a baixa da IE (encerramento da empresa ou de um estabelecimento): levantar o estoque final, decidir entre transferir a outro estabelecimento do mesmo titular ou emitir a nota de baixa de estoque, calcular o ICMS, tratar o saldo credor e só então pedir a baixa |
| descrição | A Sefaz-SP orienta que o estoque existente no encerramento seja baixado por nota fiscal na data do encerramento, com CFOP 5.928 ("baixa de estoque decorrente do encerramento da atividade"), quando não transferido antes a outro estabelecimento do mesmo titular [R3-5][R3-6]; depois da baixa da IE a emissão fica impedida e o aproveitamento de saldo credor é vedado [R3-6]. Em MG, estoque final sem regularização na baixa já gerou autuação com multa de revalidação e isolada (acórdãos de 2000 citados pelo buscador, não lidos) |
| gatilho_frequência | Por evento (baixa de empresa ou de filial contribuinte de ICMS) |
| porte_alcance | Comércio e indústria contribuintes de ICMS |
| quem_faz | Analista fiscal sênior |
| onde_é_feita_hoje | Core (inventário), emissor de NF-e, planilha |
| entradas / saídas | Inventário final, saldo credor (EFD) → decisão registrada, NF de baixa ou de transferência, ICMS apurado, pedido de baixa liberado |
| base_legal | RICMS/SP (arts. 3º, I, e 182, V, citados na RC 22783/2020) [R3-5]; RC 17950/2018 [R3-6]; demais UFs `[NÃO VERIFICADO]` |
| risco_se_falhar | Autuação por ICMS sobre estoque, perda do saldo credor, baixa travada |
| tempo_estimado | `[ESTIMATIVA]` 1–4 h por estabelecimento |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Checklist por UF disparado pela abertura da baixa; M3 calcula o ICMS do estoque e compara com transferir; a nota é emitida pelo cliente ou pelo escritório (NFE-039) e a pessoa protocola a baixa |
| papel_da_ia | M1 (regra da UF) + M3 (cálculo) → **rascunhar** a decisão e a nota; aprovação do sênior |
| ferramentas_agênticas | `calcular_icms_estoque_final(cliente, inventario, uf)`, `checklist_baixa_ie(cliente, uf)` |
| eventos_timesheet | `fiscal.baixa.estoque` (cliente, UF, valor, decisão) |
| fontes_descoberta | [R3-5] [R3-6] |
| etapa | Desligamento |
| nível_automação (provisório) | D-assistido (pedido de baixa no portal estadual) + Próprio (cálculo) |

### Fontes da rodada 3 (consultadas em 06/11/2026)

- [R3-1] CFC, Resolução CFC nº 1.590, de 19/03/2020 (vigência 01/07/2020), arts. 6º a 11 — texto lido: https://www1.cfc.org.br/sisweb/SRE/docs/RES_1590.pdf
- [R3-2] CFC, NBC PG 01 – Código de Ética Profissional do Contador, de 07/02/2019 — texto lido (dever de informar o substituto; transferência do contrato só com anuência escrita do cliente): https://www1.cfc.org.br/sisweb/SRE/docs/NBCPG01.pdf
- [R3-3] Receita Federal, Manual da DASN-SIMEI (item 2.2, prazo da situação especial de extinção; item 4.3, valores devidos até o mês da baixa) — texto lido: https://www8.receita.fazenda.gov.br/SimplesNacional/Arquivos/manual/Manual_DASN-SIMEI.pdf
- [R3-4] Econet Editora, "DEFIS – Prazo e regras de entrega" (publicado 30/03/2024, atualizado 27/10/2026; cita Res. CGSN 140/2018, art. 72, §2º) — texto lido: https://blog.econeteditora.com.br/defis-prazo-e-regras-de-entrega/
- [R3-5] Sefaz-SP, Resposta à Consulta 22783/2020, de 27/01/2021 — texto lido: https://legislacao.fazenda.sp.gov.br/Paginas/RC22783_2020.aspx
- [R3-6] Sefaz-SP, Resposta à Consulta 17950/2018, de 09/08/2018 — texto lido (ementa): https://legislacao.fazenda.sp.gov.br/Paginas/RC17950_2018.aspx
- [R3-7] Senior (suporte), "EFD-Reinf – Como realizar a baixa de CNPJ" (31/07/2025) — texto lido; fonte de fornecedor, conferir no manual da EFD-Reinf: https://suporte.senior.com.br/hc/pt-br/articles/39847471897364-ERP-UAU-EFD-Reinf-Como-realizar-a-baixa-de-CNPJ
- [R3-8] Meu Contador Online, "Troca de contador na prática: o que fazer com as obrigações acessórias" (15/12/2025) — texto lido; fonte comercial: https://www.meucontadoronline.com.br/blog/troca-de-contador-obrigacoes-acessorias
- [R3-9] Agilize, "Documentos para trocar de contador: checklist completo" (atualizado 28/06/2024) — texto lido; fonte comercial: https://agilize.com.br/artigos/?p=2369
- [R3-10] IBET, "Multa por atraso na entrega da declaração – obrigação acessória autônoma – denúncia espontânea – não configuração" (data não exibida) — trecho do buscador: https://www.ibet.com.br/multa-por-atraso-na-entrega-da-declaracao-obrigacao-acessoria-autonoma-multa-moratoria-denuncia-espontanea-nao-configuracao/
- [R3-11] LegisWeb, IN RFB nº 1.751, de 16/10/2017 (procuração eletrônica cancelada exclusivamente pelo e-CAC) — trecho do buscador; conferir se segue vigente: https://www.legisweb.com.br/legislacao/?id=351021
- [R3-12] SERPRO, "Como prestar serviços de contabilidade" (2022; Termo de Autorização e procuração) e "Novidades Integra Contador" (2024; sem taxa de cancelamento) — trechos do buscador: https://serpro.gov.br/menu/noticias/noticias-2022/como-prestar-servicos-contabilidade ; https://serpro.gov.br/menu/noticias/noticias-2024/novidades-integra-contador
- [R3-13] Contabilizei, "Como credenciar CNPJ para emitir nota fiscal eletrônica?" e Sefaz-PE, credenciamento de contribuintes (NF-e) — trechos do buscador: https://www.contabilizei.com.br/contabilizei-responde/como-credenciar-cnpj-para-emitir-nota-fiscal-eletronica/ ; https://www.sefaz.pe.gov.br/Servicos/nota-fiscal-eletronica/Paginas/credenciamento-de-contribuintes.aspx
- [R3-15] Omie, "Saldo credor de ICMS: veja como usar ou transferir" e Serasa, "ICMS parcelado" (rompimento por parcelas em atraso, conforme a UF) — trechos do buscador: https://www.omie.com.br/blog/saldo-credor-de-icms-veja-como-usar-ou-transferir/ ; https://www.serasa.com.br/blog/icms-parcelado/
- [R3-16] Fórum Contábeis, "PER/DCOMP com situação contribuinte intimado" (crédito já informado em PER/DCOMP anterior) — trecho do buscador: https://www.contabeis.com.br/forum/tributos-federais/369687/per-dcomp-com-situacao-contribuinte-intimado/

**Lacunas desta rodada:** prazo decadencial e regra de guarda dos arquivos fiscais após a saída (ver conflito de 5 × 11 anos no D3, NFE-036); regras de rescisão de parcelamento por UF; obrigações de encerramento estaduais e municipais nas cinco UFs; regra da opção pelo Simples na abertura em 2026–2027 (a Res. CGSN 194/2026 é citada como não aplicável a empresas inscritas entre 16/10 e 31/12/2026, por uma fonte de fornecedor lida só pelo buscador `[NÃO VERIFICADO]`); existência de serviço do Integra Contador para DEFIS e DASN-SIMEI (lacuna 2 deste arquivo).

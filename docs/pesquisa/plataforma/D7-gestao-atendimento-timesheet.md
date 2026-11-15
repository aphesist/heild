# D7 · Descoberta: Gestão do escritório, Atendimento e Timesheet

5 de novembro de 2026 · Etapa 1 do [Protocolo de Descoberta](00-protocolo-de-descoberta.md) · agente D7

**Escopo:** o que o escritório faz para **se administrar e se comunicar**, fora do core (Domínio, Alterdata, Contmatic): cobrança de honorários e régua de cobrança, NFS-e do próprio escritório, retenções sobre honorários, reajuste e revisão de honorários, rentabilidade por cliente, produtividade por setor e carga da equipe, multiatendimento (WhatsApp, e-mail, Instagram, telefone), filas e SLA, modelos e envio em massa, portal do cliente, CRM comercial e retenção, captura automática de tempo (eventos da plataforma, APIs dos cores, agente de desktop, calendário) e os cuidados de LGPD e trabalhistas, além do compliance do próprio escritório (CRC, certificados, segurança da informação) e a governança da IA que atende clientes.

## Como ler este arquivo

- **62 fichas** (`GES-001` a `GES-062`), agrupadas em 8 subáreas, com os campos da seção 2.1 do protocolo.
- **Limitação de método (importante).** Nesta sessão **não houve pesquisa web própria**: o orçamento de buscas do turno, compartilhado entre os agentes D1–D7, já estava esgotado quando o D7 começou (WebSearch recusou todas as consultas), e a leitura direta de páginas foi bloqueada pela rede (curl com código 000 e WebFetch sem resolução de DNS para `developers.facebook.com`, `acessorias.com`, `hubstrom.com`, `gov.br`, `asaas.com`, `chatwoot.com`). Consequências:
  - fontes marcadas `[Rn]` foram **reaproveitadas dos arquivos D1–D5**, que as leram pelos resumos do buscador em 05/11/2026; o D7 não as reabriu;
  - **todo o resto** (preços e regras da Meta, normas trabalhistas e de LGPD, funcionalidades de concorrentes não citadas em D1–D5, APIs de cobrança) vem do conhecimento do agente e está marcado `[NÃO VERIFICADO]`. Nenhum preço foi escrito como fato;
  - a lista "o que foi buscado" de cada `[NÃO ENCONTRADO]` ficou registrada na seção Lacunas, como roteiro para a Etapa 2 (V1 e V3) ou para uma nova rodada do D7 com rede liberada.
- **`tempo_estimado`:** todos são `[ESTIMATIVA]` do agente; substituir pelo levantamento com os contadores (Apêndice do Plano).
- **`papel_da_ia`:** M1 (legal), M2 (escritório), M3 (cálculo), M4 (ação); níveis **ler**, **rascunhar**, **executar** (executar sempre com cartão de aprovação no chat, salvo categorias que o escritório liberar expressamente para resposta automática).
- **`eventos_timesheet`:** padrão `ges.<objeto>.<verbo>`; todo evento leva setor (`FIN` financeiro, `ATD` atendimento, `GES` gestão, `COM` comercial, `TS` timesheet), cliente quando houver, usuário ou IA, início, fim e quem aprovou. Várias fichas desta aba **consomem** eventos das outras abas em vez de gerar.
- `transversal: Dx` indica atividade que se repete em outra aba e deve virar uma ferramenta só (Etapa 3).
- Níveis de automação (tabela 2.3) aparecem só como **hipótese** entre parênteses; quem decide é a Etapa 2.

## Achados e hipóteses que a Etapa 2 precisa confirmar primeiro

Como não houve leitura de fonte nesta sessão, estes pontos são **hipóteses fortes do agente**, listadas aqui porque mudam o desenho do produto se forem confirmadas:

1. **Cobrança da Meta por mensagem, não por conversa.** Pelo conhecimento do agente, desde 1º/07/2025 a WhatsApp Business Platform cobra por **mensagem de modelo entregue** (marketing, utilidade, autenticação), com mensagens de serviço gratuitas na janela de 24 h aberta pelo cliente e modelos de utilidade gratuitos dentro dessa janela `[NÃO VERIFICADO]`. Impacto: a régua de cobrança e os avisos de guia (utilidade) custam por envio fora da janela; envio em massa de novidade legal tende a ser classificado como marketing (mais caro). A tabela do Brasil precisa ser lida na fonte (V3).
2. **Política de IA da Meta (vigência citada: 15/01/2026).** O Plano já registra a restrição a "assistentes de IA de uso geral" `[NÃO VERIFICADO]`. O desenho desta aba assume IA **restrita aos serviços do escritório** (guias, prazos, documentos, status), com escalonamento para humano; pergunta legal aberta do cliente vira rascunho para o contador (GES-028), não resposta livre do bot.
3. **Pix Automático** (lançado pelo Banco Central em 2025, segundo o agente) muda a cobrança recorrente de honorários: autorização única do cliente e débito periódico, alternativa ao boleto `[NÃO VERIFICADO]` (GES-001).
4. **Escritório optante do Simples e NFS-e:** os arquivos D3 registram que prestadores do Simples passaram ao **Emissor Nacional da NFS-e** em 2026, com datas divergentes (01/09/2026 pela Res. CGSN 189/2026; 01/11/2026 pela Res. CGSN 191/2026) [R11]. Isso alcança o **próprio escritório** quando ele é optante: a emissão das notas de honorários muda de fonte (GES-007).
5. **Código de Ética e inadimplência:** pelo conhecimento do agente, a NBC PG 01 veda reter abusivamente documentos do cliente; o escritório não pode usar a entrega de documentos como garantia de pagamento `[NÃO VERIFICADO]`. A régua de cobrança precisa de um limite ético codificado (GES-006), e o distrato segue a Res. CFC 1.590/2020 [R1].
6. **Timesheet automático = registro de jornada.** Pelo conhecimento do agente: a CLT (art. 74, §2º) exige controle de ponto acima de 20 empregados; a Portaria MTP 671/2021 regula os registradores (REP-C, REP-A, REP-P); a Súmula 338 do TST põe no empregador o ônus de provar a jornada quando ele deixa de apresentar os registros `[NÃO VERIFICADO]`. Um log de atividade fora do horário vira prova de hora extra. O timesheet precisa nascer **subordinado ao ponto oficial** (GES-052, GES-053).
7. **LGPD do monitoramento:** base legal provável é o legítimo interesse (art. 7º, IX) com teste de balanceamento e relatório de impacto (art. 38); incidentes com comunicação à ANPD (Res. CD/ANPD 15/2024, prazo citado de 3 dias úteis) `[NÃO VERIFICADO]` (GES-054, GES-061).
8. **O escritório também é contribuinte com retenções:** pelo conhecimento do agente, honorários de contabilidade pagos por PJ sofrem IRRF de 1,5% (serviço profissional) e CSRF de 4,65%, com dispensas para o prestador do Simples `[NÃO VERIFICADO]`. O valor recebido ≠ valor faturado, e a conciliação dos honorários precisa tratar isso (GES-008).
9. **Concorrentes já cobrem atendimento e tarefas, não rentabilidade com tempo automático.** Pelo que D1–D5 registraram, Acessórias (Komunic, protocolo digital, e-Contínuo), Gestta (Messenger, Express, integração com o Domínio), Onvio (Portal do Cliente) e HubStrom (TaskHub, MonitorHub, app) cobrem caixa de entrada, envio de guias e tarefas [R5][R6][R7][R8][R9]. Nenhum dos arquivos encontrou **timesheet automático por janela ativa ligado ao cliente** nem **rentabilidade por cliente a partir de tempo medido** (`[NÃO ENCONTRADO]` em D1–D5; D7 não pôde buscar). É o espaço mais provável de diferencial.

---

## A. Financeiro do escritório: honorários e cobrança

### GES-001 · Gerar as cobranças mensais recorrentes de honorários

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Gestão / Faturamento de honorários |
| atividade | Gerar boleto, Pix (cobrança ou Pix Automático) ou débito para cada cliente no ciclo mensal, com valor do contrato vigente |
| descrição | O financeiro gera as cobranças no banco ou num sistema de cobrança, confere valores contra a planilha de contratos (reajustes e descontos esquecidos são comuns) e envia por e-mail/WhatsApp, um a um ou em lote |
| gatilho_frequência | Mensal (dia fixo, geralmente início do mês); por evento (cliente novo, aditivo) |
| porte_alcance | Todos os clientes com contrato |
| quem_faz | Financeiro / administrativo; sócio em escritório pequeno |
| onde_é_feita_hoje | Internet banking, Asaas/Inter/Efí (hipóteses do Plano), ERP do escritório, planilha |
| entradas / saídas | Contratos (valor, vencimento, desconto, reajuste) → cobranças emitidas, links, registro de envio |
| base_legal | Contrato de prestação de serviços (Res. CFC 1.590/2020) [R1] |
| risco_se_falhar | Receita não cobrada ou cobrada errado; atrito com cliente |
| tempo_estimado | 2–5 min por cliente/mês manual; 1–2 h/mês para carteira de 100 `[ESTIMATIVA]` |
| concorrentes | Alterdata (contratos de honorários com reajuste programado) [R4]; Nibo e ERPs genéricos com cobrança recorrente `[NÃO VERIFICADO]` |
| hipótese_automação | Contrato estruturado (D1) gera a cobrança recorrente no provedor de pagamento; envio automático pelo canal preferido do cliente; Pix Automático como opção (B) |
| papel_da_ia | M2 ler (contratos, aditivos); M3 (valor com reajuste/desconto pro rata); M4 executar em lote com aprovação mensal |
| ferramentas_agênticas | `gerar_cobrancas_mes(competencia)`, `emitir_cobranca(cliente, valor, vencimento, meio)`, `enviar_cobranca(cobranca_id, canal)` |
| eventos_timesheet | `ges.cobranca.gerar`, `ges.cobranca.enviar` (setor FIN) |
| fontes_descoberta | [R1], [R4]; Plano, seção 3.3 (hipótese) |

### GES-002 · Faturar serviços extras e avulsos

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Gestão / Faturamento de honorários |
| atividade | Cobrar serviços fora do escopo: alteração contratual, certidão avulsa, IRPF de sócio, notas ou funcionários acima da faixa, consultoria |
| descrição | O extra é feito pelo setor e ninguém avisa o financeiro; quando avisa, é por mensagem solta. Transversal com SOC-017 (D1), que identifica o extra; aqui ele vira cobrança |
| gatilho_frequência | Por evento; fechamento mensal |
| porte_alcance | Todos |
| quem_faz | Financeiro, a partir de aviso do setor |
| onde_é_feita_hoje | WhatsApp interno, planilha, memória |
| entradas / saídas | Tarefas marcadas como extra, tabela de preços → cobrança avulsa ou item na fatura do mês |
| base_legal | Contrato (serviços detalhados) [R1] |
| risco_se_falhar | Perda de receita silenciosa |
| tempo_estimado | 5–10 min por extra; o maior custo é o extra não cobrado `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` em D1 (busca de D1 sobre controle de escopo) |
| hipótese_automação | Tipos de tarefa com flag "faturável"; ao concluir, item entra num "carrinho" do cliente para aprovação do sócio antes da fatura (transversal: D1) |
| papel_da_ia | M2 ler (eventos de tarefa × escopo); M3 (preço); M4 rascunhar cobrança |
| ferramentas_agênticas | `listar_extras(cliente, periodo)`, `incluir_item_fatura(cliente, servico, valor)` |
| eventos_timesheet | Consome eventos de todas as abas; gera `ges.extra.faturar` |
| fontes_descoberta | [R1], [R2] (D1 SOC-017) |

### GES-003 · Conciliar recebimentos de honorários e dar baixa

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Gestão / Contas a receber |
| atividade | Conferir o que foi pago (boleto, Pix, TED, depósito), dar baixa e identificar pagamentos sem cobrança correspondente |
| descrição | Cliente paga por Pix sem identificação, paga duas competências juntas ou o valor líquido de retenções; o financeiro procura no extrato e baixa à mão |
| gatilho_frequência | Diária ou semanal |
| porte_alcance | Todos |
| quem_faz | Financeiro |
| onde_é_feita_hoje | Extrato bancário, planilha, sistema de cobrança |
| entradas / saídas | Extrato/webhook do provedor, cobranças abertas → baixas, pendências de identificação |
| base_legal | — |
| risco_se_falhar | Cobrar quem já pagou (atrito grave); inadimplência invisível |
| tempo_estimado | 1–3 h/semana em carteira de 150 clientes `[ESTIMATIVA]` |
| concorrentes | Provedores de cobrança com baixa automática por webhook `[NÃO VERIFICADO]` |
| hipótese_automação | Baixa automática por webhook do provedor (B); conciliação por valor/pagador para Pix avulso e TED; tratamento de valor líquido de retenção (GES-008) |
| papel_da_ia | M2 ler; M3 (casar valores, incluindo líquido); M4 executar baixa sugerida com aprovação quando ambígua |
| ferramentas_agênticas | `conciliar_recebimentos(periodo)`, `baixar_cobranca(cobranca_id, pagamento_id)`, `listar_pagamentos_nao_identificados()` |
| eventos_timesheet | `ges.recebimento.conciliar` (FIN) |
| fontes_descoberta | Conhecimento do agente `[NÃO VERIFICADO]` |

### GES-004 · Executar a régua de cobrança de honorários

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Gestão / Cobrança |
| atividade | Lembrar antes do vencimento, avisar no vencimento e cobrar depois, com tom crescente, pelo canal do cliente |
| descrição | Quem cobra é muitas vezes o mesmo analista que atende o cliente no dia a dia, o que constrange; a cobrança é irregular e esquecida em meses cheios |
| gatilho_frequência | Diária (D-3, D0, D+3, D+10, D+30 por exemplo) |
| porte_alcance | Todos |
| quem_faz | Financeiro; sócio nos casos sensíveis |
| onde_é_feita_hoje | WhatsApp pessoal ou do escritório, e-mail, telefone |
| entradas / saídas | Cobranças em aberto, perfil do cliente (histórico, valor, porte) → mensagens enviadas, respostas, promessas de pagamento |
| base_legal | Pelo conhecimento do agente, CDC art. 42 (cobrança sem constrangimento) aplica-se só se o cliente for consumidor (raro em B2B) `[NÃO VERIFICADO]`; política de modelos da Meta |
| risco_se_falhar | Inadimplência crescente; ou perda do cliente por cobrança agressiva/indevida |
| tempo_estimado | 2–5 min por contato; 3–6 h/mês em carteira média `[ESTIMATIVA]` |
| concorrentes | Asaas com régua de notificações (hipótese do Plano) `[NÃO VERIFICADO]`; Acessórias Komunic (WhatsApp) — uso para cobrança `[NÃO ENCONTRADO]` [R5] |
| hipótese_automação | Régua configurável por segmento, enviada pelo número oficial com modelos de utilidade; pausa automática se houver pagamento, acordo ou reclamação aberta; escalonamento ao sócio (B: provedor de cobrança + WhatsApp Cloud API) |
| papel_da_ia | M2 ler (histórico, conversas recentes: não cobrar no dia em que o cliente reclamou de erro); M4 executar régua padrão; rascunhar mensagem fora do padrão |
| ferramentas_agênticas | `executar_regua_cobranca(data)`, `pausar_regua(cliente, motivo, ate)`, `registrar_promessa_pagamento(cliente, data)` |
| eventos_timesheet | `ges.cobranca.lembrar` (IA ou FIN) |
| fontes_descoberta | [R5]; Plano, seções 3.3 e 6 (hipótese) |

### GES-005 · Negociar e acompanhar acordos de honorários em atraso

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Gestão / Cobrança |
| atividade | Propor parcelamento ou desconto, formalizar o acordo e vigiar o cumprimento das parcelas |
| descrição | Acordo fechado por WhatsApp, sem registro; parcelas novas misturadas com as mensalidades; ninguém percebe a quebra do acordo |
| gatilho_frequência | Por evento (inadimplência > X dias) |
| porte_alcance | Inadimplentes |
| quem_faz | Sócio / financeiro |
| onde_é_feita_hoje | WhatsApp, planilha |
| entradas / saídas | Débito em aberto, política de desconto → termo de acordo, cobranças parceladas, alerta de quebra |
| base_legal | Pelo conhecimento do agente, juros de mora pelo Código Civil (art. 406, redação da Lei 14.905/2024) quando o contrato for omisso `[NÃO VERIFICADO]` |
| risco_se_falhar | Perda do crédito; acordo sem prova |
| tempo_estimado | 20–40 min por acordo `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` (não buscado; ver Lacunas) |
| hipótese_automação | Simulador de acordo dentro da política do escritório; termo para assinatura eletrônica; parcelas geradas no provedor; régua específica do acordo (B) |
| papel_da_ia | M3 (juros, multa, parcelas); M1 ler (regra de juros se contrato omisso); M4 rascunhar proposta e termo |
| ferramentas_agênticas | `simular_acordo(cliente, parcelas, desconto)`, `formalizar_acordo(...)`, `enviar_para_assinatura(documento, signatarios)` (transversal: D1) |
| eventos_timesheet | `ges.acordo.negociar`, `ges.acordo.formalizar` |
| fontes_descoberta | Conhecimento do agente `[NÃO VERIFICADO]` |

### GES-006 · Decidir suspensão, protesto ou rescisão por inadimplência, dentro do limite ético

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Gestão / Cobrança |
| atividade | Avaliar o cliente inadimplente crônico, decidir entre protesto, negativação, ação ou distrato, e conduzir sem reter documentos |
| descrição | Rara mas crítica. Decisão do sócio, geralmente tardia; há o risco de "segurar" guias ou documentos como pressão, o que pelo conhecimento do agente fere a NBC PG 01 `[NÃO VERIFICADO]`; o distrato tem procedimentos próprios [R1][R3] |
| gatilho_frequência | Por evento (atraso > 60–90 dias, por exemplo) |
| porte_alcance | Inadimplentes crônicos |
| quem_faz | Sócio; jurídico |
| onde_é_feita_hoje | Conversa entre sócios, cartório de protesto, advogado |
| entradas / saídas | Histórico de débito e de contatos, contrato → decisão registrada, notificação, distrato ou protesto |
| base_legal | Res. CFC 1.590/2020 (rescisão e devolução de documentos) [R1]; NBC PG 01 `[NÃO VERIFICADO]`; Lei 9.492/1997 (protesto) e Lei 5.474/1968 (duplicata de serviço) `[NÃO VERIFICADO]` |
| risco_se_falhar | Processo ético no CRC; perda do crédito; responsabilidade por obrigação não entregue no período de aviso |
| tempo_estimado | 1–3 h por caso `[ESTIMATIVA]` |
| concorrentes | Makrosystem (distrato) [R10]; demais `[NÃO ENCONTRADO]` |
| hipótese_automação | Painel de inadimplência crônica com histórico completo; trava que impede a IA e a régua de condicionar entrega de documento a pagamento; roteiro de distrato ligado ao offboarding (D1) (D para a decisão; B para protesto por provedor, se existir) |
| papel_da_ia | M1 ler (ética, distrato); M2 ler (histórico); M4 rascunhar notificação; nunca executar protesto sem sócio |
| ferramentas_agênticas | `dossie_inadimplencia(cliente)`, `rascunhar_notificacao_extrajudicial(cliente)`, `iniciar_offboarding(cliente, motivo)` (transversal: D1) |
| eventos_timesheet | `ges.inadimplencia.decidir` (sócio) |
| fontes_descoberta | [R1], [R3], [R10] |

### GES-007 · Emitir a NFS-e dos honorários do próprio escritório

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Gestão / Fiscal do escritório |
| atividade | Emitir a nota de serviço de cada honorário (mensal e extras), na prefeitura ou no Emissor Nacional, e enviá-la ao cliente |
| descrição | Muitos escritórios emitem dezenas ou centenas de notas por mês à mão no portal municipal, copiando valor e tomador; outros emitem uma vez e esquecem os extras. Escritório optante do Simples migrou ou migrará ao Emissor Nacional em 2026 (datas divergentes entre Res. CGSN 189 e 191/2026) [R11] |
| gatilho_frequência | Mensal; por evento (extra, acordo) |
| porte_alcance | O escritório; vale em todos os municípios |
| quem_faz | Financeiro |
| onde_é_feita_hoje | Portal da prefeitura, Emissor Nacional, provedor de cobrança com NFS-e |
| entradas / saídas | Cobrança emitida/paga, dados do tomador → NFS-e, XML/PDF anexado à cobrança |
| base_legal | LC 214/2025, art. 62 (padrão nacional) [R11]; Res. CGSN 189/2026 e 191/2026 [R11]; legislação do município |
| risco_se_falhar | Multa municipal; cliente sem documento para dedução; divergência ISS |
| tempo_estimado | 2–4 min por nota manual `[ESTIMATIVA]` |
| concorrentes | Integradores de NFS-e citados no Plano (Focus NFe, PlugNotas, NFE.io, eNotas) `[NÃO VERIFICADO]`; provedores de cobrança com emissão `[NÃO VERIFICADO]` |
| hipótese_automação | Emissão automática na geração ou no pagamento (regra do escritório), pela API do Sistema Nacional NFS-e com o certificado do escritório (A) ou por integrador (B); envio junto com o boleto |
| papel_da_ia | M2 ler; M1 ler (regras de retenção e campos IBS/CBS); M4 executar em lote com aprovação |
| ferramentas_agênticas | `emitir_nfse_honorario(cobranca_id)`, `cancelar_nfse(nfse_id, motivo)` |
| eventos_timesheet | `ges.nfse.emitir` (FIN) |
| fontes_descoberta | [R11] (D3 NFE-007, NFE-031) |

### GES-008 · Conferir retenções na fonte sobre os honorários e o valor líquido recebido

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Gestão / Fiscal do escritório |
| atividade | Saber quais clientes retêm IRRF, CSRF e ISS sobre os honorários, destacar na nota e conferir o líquido e os comprovantes (informe de rendimentos) |
| descrição | O cliente PJ retém e paga o líquido; o escritório baixa como "pagou a menor" ou não aproveita a retenção na própria apuração |
| gatilho_frequência | Mensal; anual (informes de retenção em fevereiro) |
| porte_alcance | Clientes PJ do Lucro Presumido/Real tomadores; municípios com retenção de ISS |
| quem_faz | Financeiro; contábil do próprio escritório |
| onde_é_feita_hoje | Planilha, nota, extrato |
| entradas / saídas | Regime do tomador, município, regime do escritório → alíquotas na nota, valor líquido esperado, controle de retenções a compensar |
| base_legal | Pelo conhecimento do agente: IRRF 1,5% (RIR/2018, serviço profissional), CSRF 4,65% (Lei 10.833/2003, art. 30), com dispensas ao prestador do Simples `[NÃO VERIFICADO]`; LC 116/2003 e lei municipal (ISS) |
| risco_se_falhar | Imposto pago em duplicidade pelo escritório; cobrança indevida ao cliente |
| tempo_estimado | 1–2 h/mês `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` (não buscado) |
| hipótese_automação | Regra de retenção por tomador calculada na emissão (M3) e conciliação pelo líquido (GES-003); coleta dos informes anuais pelo portal ou e-mail |
| papel_da_ia | M1 ler (regras); M3 (alíquotas); M2 ler (regime do tomador, que é cliente: dado já existe) |
| ferramentas_agênticas | `calcular_retencoes_honorario(cliente, valor)`, `listar_retencoes_a_compensar(periodo)` |
| eventos_timesheet | `ges.retencao.conferir` |
| fontes_descoberta | Conhecimento do agente `[NÃO VERIFICADO]` |

### GES-009 · Cobrar o 13º honorário e as cobranças sazonais (IRPF, balanço, RAIS/DIRF de legado)

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Gestão / Faturamento de honorários |
| atividade | Emitir as cobranças anuais previstas em contrato: honorário extra de dezembro, declarações de IRPF de sócios, encerramento anual |
| descrição | Prática comum de mercado (13º honorário) pelo conhecimento do agente `[NÃO VERIFICADO]`; frequentemente esquecida ou cobrada sem previsão contratual, gerando atrito. A campanha de IRPF concentra centenas de cobranças avulsas em março–maio |
| gatilho_frequência | Anual (novembro/dezembro; março–maio para IRPF) |
| porte_alcance | Clientes com cláusula; sócios e PF atendidos |
| quem_faz | Financeiro / sócio |
| onde_é_feita_hoje | Planilha, cobrança avulsa |
| entradas / saídas | Cláusulas contratuais, lista de declarações feitas → cobranças, comunicação prévia |
| base_legal | Contrato [R1] |
| risco_se_falhar | Receita perdida; reclamação por cobrança não prevista |
| tempo_estimado | 2–5 min por cobrança; dias de trabalho na campanha IRPF `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` (não buscado) |
| hipótese_automação | Cobranças anuais derivadas do contrato estruturado; aviso prévio automático; IRPF faturado por evento de entrega da declaração |
| papel_da_ia | M2 ler (contrato, entregas); M4 executar lote com aprovação |
| ferramentas_agênticas | `gerar_cobrancas_anuais(tipo, ano)` |
| eventos_timesheet | `ges.cobranca.gerar` (tipo anual) |
| fontes_descoberta | [R1]; conhecimento do agente |

### GES-010 · Repassar ou ratear custos variáveis por cliente (APIs, certificados, taxas)

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Gestão / Custos do escritório |
| atividade | Medir quanto cada cliente consome de serviços pagos (consultas do Integra Contador, mensagens de WhatsApp, certidões por agregador, taxas de Junta) e decidir se repassa |
| descrição | Custo novo trazido pela automação: bilhetagem por chamada. Alterdata já tem painel de bilhetagem do Integra Contador e revende serviços (DAS citado a R$ 0,75 em 2025) [R12]. Taxas de órgãos pagas pelo escritório costumam não ser reembolsadas |
| gatilho_frequência | Mensal |
| porte_alcance | O escritório |
| quem_faz | Financeiro / sócio |
| onde_é_feita_hoje | Não é feito, ou planilha |
| entradas / saídas | Logs de consumo por cliente, faturas de fornecedores → custo por cliente, itens de reembolso |
| base_legal | Contrato (cláusula de reembolso de despesas) [R1] |
| risco_se_falhar | Margem corroída sem ninguém ver |
| tempo_estimado | — (hoje não é feito) |
| concorrentes | Alterdata, painel de bilhetagem [R12] |
| hipótese_automação | Toda chamada paga feita pela plataforma grava cliente e custo; entra na rentabilidade (GES-013) e, se o contrato prevê, na fatura |
| papel_da_ia | M2 ler; M3 (rateio) |
| ferramentas_agênticas | `custo_variavel_por_cliente(periodo)` |
| eventos_timesheet | Consome eventos de integração; gera `ges.custo.ratear` |
| fontes_descoberta | [R12] |

### GES-011 · Acompanhar os indicadores financeiros do escritório

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Gestão / Indicadores |
| atividade | Ver receita recorrente, inadimplência, entradas e saídas de clientes (churn), ticket médio, fluxo de caixa e projeção |
| descrição | O sócio monta isso em planilha quando lembra; o escritório que faz a contabilidade de todos raramente faz a própria gestão |
| gatilho_frequência | Mensal; sob demanda |
| porte_alcance | O escritório |
| quem_faz | Sócio |
| onde_é_feita_hoje | Planilha, ERP financeiro |
| entradas / saídas | Cobranças, recebimentos, contratos, custos → painel e relatório mensal |
| base_legal | — |
| risco_se_falhar | Decisões no escuro (contratar, reajustar, recusar cliente) |
| tempo_estimado | 2–4 h/mês `[ESTIMATIVA]` |
| concorrentes | ERPs financeiros genéricos `[NÃO VERIFICADO]` |
| hipótese_automação | Painel nativo alimentado pelas fichas GES-001 a 010; pergunta no chat ("quanto entrou de clientes novos este ano?") |
| papel_da_ia | M2 ler (consultas tipadas); M3 (indicadores) |
| ferramentas_agênticas | `indicadores_financeiros(periodo)` |
| eventos_timesheet | `ges.indicadores.consultar` |
| fontes_descoberta | Conhecimento do agente |

### GES-012 · Controlar indicações e comissões de parceiros

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Gestão / Comercial |
| atividade | Registrar quem indicou cada cliente e pagar comissão ou desconto ao indicador conforme a política |
| descrição | Pequena, esquecida; comissão paga atrasada ou nunca; parceiros (advogados, bancos, corretores) deixam de indicar |
| gatilho_frequência | Por evento (cliente fechado); mensal (pagamento) |
| porte_alcance | Clientes indicados |
| quem_faz | Sócio / financeiro |
| onde_é_feita_hoje | Memória, planilha |
| entradas / saídas | Origem do lead, contrato, recebimentos → comissão devida |
| base_legal | — |
| risco_se_falhar | Perda de canal de aquisição |
| tempo_estimado | 10 min por indicação `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` (não buscado) |
| hipótese_automação | Campo de origem obrigatório no lead (GES-042); comissão calculada sobre o recebido |
| papel_da_ia | M2 ler; M3 |
| ferramentas_agênticas | `comissoes_devidas(periodo)` |
| eventos_timesheet | `ges.comissao.calcular` |
| fontes_descoberta | Conhecimento do agente |

---

## B. Rentabilidade, produtividade e equipe

### GES-013 · Calcular a rentabilidade por cliente

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Gestão / Rentabilidade |
| atividade | Comparar o honorário de cada cliente com o custo de atendê-lo (horas × custo-hora + custos variáveis) |
| descrição | Quase nunca é feito com dado: o sócio "sente" quais clientes dão trabalho. Quando feito, usa apontamento manual de horas, incompleto |
| gatilho_frequência | Mensal; anual (antes do reajuste) |
| porte_alcance | Todos os clientes |
| quem_faz | Sócio |
| onde_é_feita_hoje | Planilha ou não é feito |
| entradas / saídas | Timesheet (GES-047 a 051), custo-hora (GES-055), honorários, custos variáveis (GES-010) → margem por cliente, ranking, clientes deficitários |
| base_legal | — |
| risco_se_falhar | Clientes que dão prejuízo por anos; reajuste linear injusto |
| tempo_estimado | 4–8 h por análise manual `[ESTIMATIVA]` |
| concorrentes | Gestta: "acompanhamento de andamento e desempenho" [R6]; rentabilidade por tempo medido `[NÃO ENCONTRADO]` em D1–D5 |
| hipótese_automação | Painel de margem por cliente, com intervalo de confiança conforme a cobertura do timesheet (quanto do tempo foi identificado) |
| papel_da_ia | M2 ler; M3 (margem); M4 rascunhar plano de ação (reajustar, reduzir escopo, automatizar) |
| ferramentas_agênticas | `rentabilidade_cliente(cliente, periodo)`, `ranking_rentabilidade(periodo)` |
| eventos_timesheet | Consome todos os eventos; gera `ges.rentabilidade.consultar` |
| fontes_descoberta | [R6]; Plano, seção 5.2 (hipótese) |

### GES-014 · Revisar honorários e conduzir a campanha de reajuste

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Gestão / Rentabilidade |
| atividade | Calcular o reajuste (índice ou custo real), segmentar clientes (índice cheio, reajuste acima, renegociação de escopo) e comunicar em massa com antecedência |
| descrição | Transversal com SOC-018 (D1), que trata o aditivo de cada contrato; aqui é a **campanha anual** e a decisão por dado. A comunicação antecipada e justificada pesa na aceitação [R13]; Alterdata programa o reajuste anual dos contratos [R4] |
| gatilho_frequência | Anual (data-base); por evento (cliente cresceu em notas/funcionários) |
| porte_alcance | Todos |
| quem_faz | Sócio / financeiro |
| onde_é_feita_hoje | Planilha, e-mail, WhatsApp |
| entradas / saídas | Índice (IPCA/IGP-M/INPC no SGS do BCB, hipótese do Plano), margem por cliente, volume atual × contratado → valores propostos, cartas, respostas, aditivos |
| base_legal | Cláusula contratual [R1] |
| risco_se_falhar | Margem corroída; cancelamentos em massa por comunicação ruim |
| tempo_estimado | 15–30 min por cliente [R2] (estimativa de D1) |
| concorrentes | Alterdata [R4] |
| hipótese_automação | Simulação por cliente (índice × custo real × volume); carta personalizada com o que foi entregue no ano; envio em massa e acompanhamento de aceite (A para índices do SGS, B para assinatura) |
| papel_da_ia | M3 (índice e simulação); M2 ler (margem, entregas); M4 rascunhar cartas e executar envio aprovado |
| ferramentas_agênticas | `simular_reajuste_carteira(indice, data_base)`, `calcular_reajuste(cliente, indice)` (transversal D1), `rascunhar_carta_reajuste(cliente)` |
| eventos_timesheet | `ges.reajuste.simular`, `ges.reajuste.comunicar` |
| fontes_descoberta | [R2], [R4], [R13] |

### GES-015 · Detectar mudança de volume que pede revisão de honorário

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Gestão / Rentabilidade |
| atividade | Perceber quando o cliente passou da faixa contratada (notas, funcionários, filiais, mudança de regime) |
| descrição | O cliente cresce e o honorário fica; só é percebido no reajuste anual, se for |
| gatilho_frequência | Mensal (automático) |
| porte_alcance | Todos com honorário por faixa |
| quem_faz | Sócio / financeiro |
| onde_é_feita_hoje | Não é feito sistematicamente |
| entradas / saídas | Contagem de notas (D3), funcionários (D4), regime (D1) × faixa contratual → alerta e proposta de aditivo |
| base_legal | Contrato [R1] |
| risco_se_falhar | Trabalho crescente sem receita |
| tempo_estimado | — |
| concorrentes | `[NÃO ENCONTRADO]` (não buscado) |
| hipótese_automação | Regra de faixa no contrato estruturado comparada mensalmente com os volumes reais das outras abas |
| papel_da_ia | M2 ler; M3; M4 rascunhar aditivo |
| ferramentas_agênticas | `clientes_acima_da_faixa(competencia)` |
| eventos_timesheet | `ges.faixa.alertar` |
| fontes_descoberta | Conhecimento do agente |

### GES-016 · Medir a produtividade por setor e por pessoa

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Gestão / Produtividade |
| atividade | Ver volume de tarefas entregues, atrasos, retrabalho e tempo médio por tipo de tarefa, por setor e pessoa |
| descrição | Gestores de tarefas mostram entregas no prazo; o "porquê" (tempo gasto, retrabalho) fica invisível |
| gatilho_frequência | Semanal; mensal |
| porte_alcance | O escritório |
| quem_faz | Coordenadores, sócio |
| onde_é_feita_hoje | Gestor de tarefas (Gestta, Acessórias, Onvio Processos, TaskHub), planilha |
| entradas / saídas | Eventos de tarefa e timesheet → indicadores por setor/pessoa/atividade |
| base_legal | LGPD (dado de desempenho do empregado; transparência) `[NÃO VERIFICADO]` |
| risco_se_falhar | Sobrecarga não percebida, rotatividade, gargalos |
| tempo_estimado | 2–4 h/mês `[ESTIMATIVA]` |
| concorrentes | Gestta (desempenho) [R6]; Acessórias (processos com responsável e alertas) [R5]; HubStrom TaskHub [R8] |
| hipótese_automação | Painel nativo; cada pessoa vê os próprios dados primeiro (Plano 5.3) |
| papel_da_ia | M2 ler; M3; M4 rascunhar resumo semanal |
| ferramentas_agênticas | `produtividade(setor, pessoa, periodo)`, `atividades_que_mais_consomem_tempo(periodo)` |
| eventos_timesheet | Consome todos |
| fontes_descoberta | [R5], [R6], [R8] |

### GES-017 · Distribuir a carteira e balancear a carga entre analistas

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Gestão / Equipe |
| atividade | Definir quem cuida de qual cliente em cada setor e redistribuir quando alguém está sobrecarregado ou entra/sai |
| descrição | Distribuição por número de clientes, não por esforço; o cliente "pesado" fica com quem não reclama |
| gatilho_frequência | Por evento (cliente novo, admissão, desligamento); revisão trimestral |
| porte_alcance | O escritório |
| quem_faz | Coordenador / sócio |
| onde_é_feita_hoje | Planilha, gestor de tarefas |
| entradas / saídas | Esforço medido por cliente (timesheet), capacidade da pessoa → carteira por analista |
| base_legal | — |
| risco_se_falhar | Atrasos e multas concentrados; burnout |
| tempo_estimado | 1–3 h por redistribuição `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` (não buscado) |
| hipótese_automação | Sugestão de distribuição por horas medidas e complexidade; transferência de responsável em lote nas tarefas futuras |
| papel_da_ia | M2 ler; M3 (balanceamento); M4 executar transferência com aprovação |
| ferramentas_agênticas | `sugerir_distribuicao_carteira(setor)`, `transferir_responsavel(cliente, setor, de, para)` |
| eventos_timesheet | `ges.carteira.redistribuir` |
| fontes_descoberta | Conhecimento do agente |

### GES-018 · Cobrir ausências e férias da equipe

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Gestão / Equipe |
| atividade | Planejar férias da equipe fora dos picos e passar as tarefas do ausente para um substituto com contexto |
| descrição | Férias marcadas sem olhar o calendário fiscal; substituto não sabe as particularidades do cliente |
| gatilho_frequência | Por evento; planejamento anual |
| porte_alcance | O escritório |
| quem_faz | Coordenador |
| onde_é_feita_hoje | Planilha, conversa |
| entradas / saídas | Calendário de obrigações, férias → tarefas reatribuídas, resumo do cliente para o substituto |
| base_legal | CLT (férias) — tratado em D4 para clientes; aqui é a equipe do escritório |
| risco_se_falhar | Prazo perdido no período de ausência |
| tempo_estimado | 1–2 h por ausência `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` (não buscado) |
| hipótese_automação | Mapa de carga por semana; reatribuição automática; "passagem de bastão" gerada pela IA a partir do histórico do cliente |
| papel_da_ia | M2 ler; M4 rascunhar resumo e executar reatribuição com aprovação |
| ferramentas_agênticas | `planejar_cobertura(pessoa, inicio, fim)`, `resumo_cliente_para_substituto(cliente, setor)` |
| eventos_timesheet | `ges.cobertura.planejar` |
| fontes_descoberta | Conhecimento do agente |

### GES-019 · Registrar erros, retrabalho e multas assumidas pelo escritório

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Gestão / Qualidade |
| atividade | Registrar cada erro (guia errada, obrigação atrasada, multa paga por culpa do escritório), causa e custo, e acompanhar a correção |
| descrição | Rara por cliente, crítica em conjunto; hoje o escritório paga a multa e o aprendizado se perde |
| gatilho_frequência | Por evento |
| porte_alcance | O escritório |
| quem_faz | Coordenador / sócio |
| onde_é_feita_hoje | Não é registrado, ou conversa |
| entradas / saídas | Ocorrência, cliente, responsável, valor → registro de não conformidade, ação corretiva, custo na rentabilidade |
| base_legal | Responsabilidade civil do contador (Código Civil, arts. 1.177–1.178) `[NÃO VERIFICADO]` |
| risco_se_falhar | Erro repetido; perda de cliente; ação de indenização |
| tempo_estimado | 15–30 min por ocorrência `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` (não buscado) |
| hipótese_automação | Registro de ocorrência a partir do evento (guia reemitida, multa no DARF); classificação de causa; vínculo com seguro (GES-060) |
| papel_da_ia | M2 ler (detecta reemissões e multas); M4 rascunhar registro |
| ferramentas_agênticas | `registrar_ocorrencia(cliente, tipo, custo, causa)`, `listar_ocorrencias(periodo)` |
| eventos_timesheet | `ges.ocorrencia.registrar`; tempo de retrabalho marcado como tal |
| fontes_descoberta | Conhecimento do agente |

### GES-020 · Montar e manter a base de conhecimento interna (procedimentos e particularidades por cliente)

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Gestão / Conhecimento |
| atividade | Documentar procedimentos do escritório e particularidades de cada cliente ("cliente X manda extrato só dia 10", "regra de rateio do cliente Y") |
| descrição | Conhecimento na cabeça de quem atende; sai o funcionário, sai o conhecimento |
| gatilho_frequência | Contínua; por evento (desligamento, cliente novo) |
| porte_alcance | O escritório |
| quem_faz | Todos; coordenador revisa |
| onde_é_feita_hoje | Word, pastas, grupos de WhatsApp |
| entradas / saídas | Conversas, tarefas, anotações → notas por cliente e por procedimento, indexadas para o M2 |
| base_legal | — |
| risco_se_falhar | Dependência de pessoas; erros na substituição |
| tempo_estimado | Contínuo `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` (não buscado) |
| hipótese_automação | IA sugere nota a partir de conversas recorrentes ("isso já foi perguntado 3 vezes"); notas entram na recuperação do M2 com permissão |
| papel_da_ia | M2 ler e indexar; M4 rascunhar nota para aprovação |
| ferramentas_agênticas | `sugerir_nota_cliente(cliente)`, `buscar_procedimento(texto)` |
| eventos_timesheet | `ges.conhecimento.registrar` |
| fontes_descoberta | Plano, seção 1.5 (M2 com texto do escritório) |

### GES-021 · Dar e revogar acessos da equipe (admissão e desligamento de funcionário do escritório)

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Gestão / Segurança |
| atividade | Liberar ao funcionário só os clientes e sistemas do seu setor e, no desligamento, revogar tudo no mesmo dia (plataforma, core, portais, e-mail, certificados, WhatsApp) |
| descrição | Rara e crítica. Ex-funcionário com senha de portal, certificado A1 instalado na máquina pessoal e conversas de clientes no WhatsApp pessoal |
| gatilho_frequência | Por evento |
| porte_alcance | O escritório |
| quem_faz | Sócio / TI |
| onde_é_feita_hoje | Manual, sem checklist |
| entradas / saídas | Perfil de cargo → permissões; no desligamento, checklist de revogação e transferência de conversas |
| base_legal | LGPD, art. 46 (segurança) `[NÃO VERIFICADO]` |
| risco_se_falhar | Vazamento de dados, uso indevido de certificado, perda do histórico de atendimento |
| tempo_estimado | 1–2 h por desligamento `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` (não buscado) |
| hipótese_automação | Perfis por papel; cofre de credenciais da plataforma (ninguém vê a senha); checklist automático de desligamento; conversas sempre no número oficial (GES-038) |
| papel_da_ia | M2 ler (inventário de acessos); M4 rascunhar checklist; executar revogações internas com aprovação |
| ferramentas_agênticas | `inventario_acessos(pessoa)`, `revogar_acessos(pessoa)` |
| eventos_timesheet | `ges.acesso.conceder`, `ges.acesso.revogar` |
| fontes_descoberta | Conhecimento do agente; D1 (certificados circulando por WhatsApp) [R14] |

### GES-022 · Treinar a equipe e comprovar capacitação

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Gestão / Equipe |
| atividade | Integrar funcionário novo (trilha por setor) e registrar treinamentos em mudanças de lei (reforma, NFS-e, eSocial) |
| descrição | Treinamento informal; ninguém sabe quem já sabe o novo leiaute |
| gatilho_frequência | Por evento (admissão, norma nova) |
| porte_alcance | O escritório |
| quem_faz | Coordenador |
| onde_é_feita_hoje | Conversa, vídeos soltos |
| entradas / saídas | Procedimentos (GES-020), normas novas (D2/D6) → trilha, registro de conclusão |
| base_legal | Educação Profissional Continuada do CFC (NBC PG 12) vale para grupos específicos `[NÃO VERIFICADO]` |
| risco_se_falhar | Erro por desconhecimento de regra nova |
| tempo_estimado | — |
| concorrentes | `[NÃO ENCONTRADO]` (não buscado) |
| hipótese_automação | Trilha gerada da base de conhecimento; quiz curto pela IA; alerta "esta norma afeta seu setor" |
| papel_da_ia | M1 ler (resumo da norma); M4 rascunhar trilha |
| ferramentas_agênticas | `gerar_trilha(setor)`, `registrar_treinamento(pessoa, tema)` |
| eventos_timesheet | `ges.treinamento.realizar` (tempo interno, sem cliente) |
| fontes_descoberta | Conhecimento do agente |

---

## C. Multiatendimento: canais e caixa de entrada

### GES-023 · Receber e triar mensagens de WhatsApp num número oficial único, identificando o cliente

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Atendimento / Caixa de entrada |
| atividade | Receber todas as mensagens num número do escritório, reconhecer quem é o contato (sócio, financeiro, funcionário do cliente) e a qual empresa se refere |
| descrição | Hoje cada analista atende no próprio celular ou num WhatsApp Web compartilhado; o mesmo contato fala por várias empresas |
| gatilho_frequência | Contínua (dezenas a centenas por dia) |
| porte_alcance | Todos os clientes |
| quem_faz | Atendimento / todos os analistas |
| onde_é_feita_hoje | WhatsApp pessoal, WhatsApp Business app, ferramentas de multiatendimento |
| entradas / saídas | Mensagem, telefone → contato vinculado a pessoa e empresa(s), conversa aberta |
| base_legal | Termos da WhatsApp Business Platform `[NÃO VERIFICADO]`; LGPD |
| risco_se_falhar | Mensagem perdida; resposta à empresa errada (vazamento) |
| tempo_estimado | 30 s–2 min por triagem `[ESTIMATIVA]` |
| concorrentes | Acessórias Komunic [R5]; Gestta Messenger [R7]; HubStrom (atendimento) [R8]; multiatendimento genérico (Digisac, Octadesk, Huggy, Blip, Zenvia) `[NÃO VERIFICADO]` |
| hipótese_automação | Cloud API da Meta (direta ou por provedor) (B); contato ligado ao cadastro de pessoas do D1; quando a pessoa tem várias empresas, a IA pergunta ou infere pelo assunto |
| papel_da_ia | M2 ler (cadastro, histórico); classificação de empresa e assunto |
| ferramentas_agênticas | `identificar_contato(telefone)`, `vincular_conversa(conversa, cliente)` |
| eventos_timesheet | `ges.conversa.abrir` (ATD, cliente) |
| fontes_descoberta | [R5], [R7], [R8]; Plano, seção 6 |

### GES-024 · Distribuir conversas por setor e fila, transferir e acompanhar SLA

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Atendimento / Filas e SLA |
| atividade | Encaminhar cada conversa ao setor certo (fiscal, DP, contábil, financeiro, societário), ao responsável do cliente, e medir tempo de primeira resposta e de solução |
| descrição | Recepcionista repassa por print; conversa "some" entre setores; sem medida de tempo |
| gatilho_frequência | Contínua |
| porte_alcance | Todos |
| quem_faz | Atendimento; coordenadores |
| onde_é_feita_hoje | Ferramenta de multiatendimento, WhatsApp interno |
| entradas / saídas | Conversa classificada → fila, responsável, SLA, alertas de estouro |
| base_legal | — |
| risco_se_falhar | Cliente sem resposta; reclamação; churn |
| tempo_estimado | 1 min por roteamento `[ESTIMATIVA]` |
| concorrentes | Ferramentas de multiatendimento (filas e transferência) `[NÃO VERIFICADO]`; Chatwoot (referência do Plano) `[NÃO VERIFICADO]` |
| hipótese_automação | Classificador de assunto → setor; responsável vem da carteira (GES-017); SLA por tipo de cliente e horário comercial |
| papel_da_ia | M2 ler; classificação; M4 executar roteamento (nível baixo de risco) |
| ferramentas_agênticas | `rotear_conversa(conversa)`, `transferir_conversa(conversa, setor, pessoa)`, `sla_status(fila)` |
| eventos_timesheet | `ges.conversa.transferir`, `ges.conversa.atender` (duração ativa) |
| fontes_descoberta | Plano, seções 4.9 e 6 |

### GES-025 · Responder perguntas de status com dados do sistema ("minha guia saiu?", "quanto pago?")

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Atendimento / Respostas |
| atividade | Responder as perguntas mais frequentes do cliente sobre guias, prazos, holerites, certidões e andamento de processos |
| descrição | Maior volume do atendimento; o analista para o que está fazendo, procura a guia na pasta e reenvia |
| gatilho_frequência | Contínua; picos perto dos vencimentos (dia 7, 15, 20) |
| porte_alcance | Todos |
| quem_faz | Analistas de cada setor |
| onde_é_feita_hoje | Pasta de rede, core, WhatsApp |
| entradas / saídas | Pergunta → guia/documento/status enviado |
| base_legal | — |
| risco_se_falhar | Multa do cliente por guia não recebida; horas perdidas |
| tempo_estimado | 2–5 min por pergunta `[ESTIMATIVA]` |
| concorrentes | Acessórias e-Contínuo (envio de guias por e-mail, protocolo de leitura) [R5]; Gestta Express [R6]; IA de atendimento da Acessórias [R5] (escopo `[NÃO VERIFICADO]`) |
| hipótese_automação | Resposta automática nas categorias liberadas (status e reenvio de documento já emitido), com o documento anexado e registro de entrega |
| papel_da_ia | M2 ler; M4 executar (categoria liberada) ou rascunhar (demais) |
| ferramentas_agênticas | `buscar_documento_cliente(cliente, tipo, competencia)`, `responder_status(conversa)`, `enviar_documento(cliente, documento, canal)` (transversal: D2, D4, D5) |
| eventos_timesheet | `ges.resposta.automatica` (IA) ou `ges.resposta.enviar` (pessoa) |
| fontes_descoberta | [R5], [R6]; Plano, seção 6 |

### GES-026 · Capturar documentos recebidos nas conversas e arquivá-los no cliente e na tarefa certos

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Atendimento / Documentos |
| atividade | Salvar foto, PDF, XML ou planilha que o cliente manda pelo WhatsApp ou e-mail na pasta e na competência certas, e dar baixa no que estava pendente |
| descrição | Analista baixa do WhatsApp, renomeia e move para a pasta de rede; muitas vezes esquece |
| gatilho_frequência | Contínua |
| porte_alcance | Todos |
| quem_faz | Analistas |
| onde_é_feita_hoje | WhatsApp, e-mail, pasta de rede |
| entradas / saídas | Anexo → documento classificado (tipo, competência), checklist de coleta atualizado (D5) |
| base_legal | LGPD (armazenamento de dados de terceiros, ex.: documentos de empregados do cliente) |
| risco_se_falhar | Documento perdido; fechamento atrasado |
| tempo_estimado | 1–3 min por documento `[ESTIMATIVA]` |
| concorrentes | Acessórias GED e e-Contínuo [R5][R15]; Gestta Express reconhece anexos [R7] |
| hipótese_automação | Classificação automática do anexo; baixa no checklist do D5; confirmação ao cliente ("recebido o extrato de outubro") |
| papel_da_ia | M2 ler; classificação de documento; M4 executar arquivamento |
| ferramentas_agênticas | `arquivar_anexo(conversa, anexo)`, `classificar_documento(arquivo)` (transversal: D3, D4, D5) |
| eventos_timesheet | `ges.documento.capturar` |
| fontes_descoberta | [R5], [R7], [R15] |

### GES-027 · Atender a caixa de e-mail compartilhada e vincular ao cliente

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Atendimento / Caixa de entrada |
| atividade | Ler e responder e-mails de clientes, órgãos e fornecedores em caixas compartilhadas (contato@, fiscal@, dp@) com o histórico ligado ao cliente |
| descrição | Várias caixas, sem dono; e-mail de cliente respondido duas vezes ou nunca |
| gatilho_frequência | Contínua |
| porte_alcance | Todos |
| quem_faz | Atendimento, setores |
| onde_é_feita_hoje | Gmail, Outlook |
| entradas / saídas | E-mail → conversa no mesmo painel do WhatsApp, anexos capturados |
| base_legal | — |
| risco_se_falhar | Notificação ou documento ignorado |
| tempo_estimado | 2–5 min por e-mail `[ESTIMATIVA]` |
| concorrentes | Ferramentas de multiatendimento com e-mail `[NÃO VERIFICADO]` |
| hipótese_automação | Gmail API, Microsoft Graph ou IMAP (hipótese do Plano); mesma caixa de entrada do WhatsApp (B/A conforme provedor) |
| papel_da_ia | M2 ler; M4 rascunhar resposta |
| ferramentas_agênticas | `ler_caixa_email(caixa)`, `responder_email(conversa, texto)` |
| eventos_timesheet | `ges.email.atender` |
| fontes_descoberta | Plano, seção 3.3 |

### GES-028 · Escalar pergunta técnica do cliente ao especialista com rascunho fundamentado

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Atendimento / Respostas técnicas |
| atividade | Transformar a dúvida técnica do cliente ("posso distribuir lucro?", "preciso emitir nota com IBS?") em rascunho com base legal e dados do cliente, para o contador aprovar |
| descrição | O analista não sabe, pergunta ao sócio, o sócio responde dias depois; respostas inconsistentes entre analistas |
| gatilho_frequência | Diária |
| porte_alcance | Todos |
| quem_faz | Analista → especialista/sócio |
| onde_é_feita_hoje | WhatsApp, conversa interna |
| entradas / saídas | Pergunta, perfil do cliente → rascunho com citação, aprovação, resposta enviada e registrada |
| base_legal | Responsabilidade técnica do contador; política de IA da Meta (Achado 2) `[NÃO VERIFICADO]` |
| risco_se_falhar | Orientação errada com consequência fiscal |
| tempo_estimado | 15–60 min por pergunta `[ESTIMATIVA]` |
| concorrentes | Acessórias (ferramentas de IA) [R5] — escopo `[NÃO VERIFICADO]` |
| hipótese_automação | Combinação M2 → M1 → M3 do Plano; cartão de aprovação; resposta aprovada vira caso do benchmark |
| papel_da_ia | M1 + M2 + M3 ler; M4 rascunhar; nunca executar sem o contador |
| ferramentas_agênticas | `rascunhar_resposta_tecnica(conversa)`, `solicitar_aprovacao(rascunho, aprovador)` |
| eventos_timesheet | `ges.consulta.rascunhar` (IA), `ges.consulta.aprovar` (especialista, setor do assunto) |
| fontes_descoberta | [R5]; Plano, seção 1.5 |

### GES-029 · Manter modelos de mensagem aprovados e respostas rápidas

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Atendimento / Modelos |
| atividade | Criar e manter respostas rápidas internas e submeter à Meta os modelos (templates) usados fora da janela de 24 h, com categoria correta |
| descrição | Cada analista escreve do seu jeito; modelos da Meta reprovados ou reclassificados como marketing (mais caros) `[NÃO VERIFICADO]` |
| gatilho_frequência | Por evento; revisão trimestral |
| porte_alcance | O escritório |
| quem_faz | Coordenador de atendimento |
| onde_é_feita_hoje | Gerenciador da Meta, ferramenta de multiatendimento |
| entradas / saídas | Textos padrão → modelos aprovados, variáveis, categoria |
| base_legal | Política de modelos da WhatsApp Business Platform `[NÃO VERIFICADO]` |
| risco_se_falhar | Régua e avisos sem poder ser enviados; custo maior |
| tempo_estimado | 15 min por modelo `[ESTIMATIVA]` |
| concorrentes | Provedores de WhatsApp com gestão de templates `[NÃO VERIFICADO]` |
| hipótese_automação | Biblioteca de modelos versionada; submissão e status pela API de templates (B) |
| papel_da_ia | M4 rascunhar modelo na categoria correta |
| ferramentas_agênticas | `criar_modelo_mensagem(texto, categoria)`, `status_modelo(id)` |
| eventos_timesheet | `ges.modelo.manter` |
| fontes_descoberta | Conhecimento do agente `[NÃO VERIFICADO]` |

### GES-030 · Enviar comunicados em massa segmentados

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Atendimento / Envio em massa |
| atividade | Avisar grupos de clientes sobre prazo, mudança de lei, feriado, documento pendente, campanha de IRPF |
| descrição | Lista de transmissão do WhatsApp Business app ou disparo não oficial (risco de banimento, Plano seção 6); sem segmentação nem medida de leitura |
| gatilho_frequência | Semanal a mensal; por evento (norma nova) |
| porte_alcance | Segmentos (Simples, com folha, MEI, por município) |
| quem_faz | Atendimento / sócio |
| onde_é_feita_hoje | WhatsApp, e-mail marketing |
| entradas / saídas | Segmento do cadastro, texto → envios, entregas, leituras, respostas |
| base_legal | LGPD (opt-in e finalidade); política comercial da Meta `[NÃO VERIFICADO]` |
| risco_se_falhar | Número bloqueado/rebaixado; cliente desinformado |
| tempo_estimado | 30–60 min por campanha `[ESTIMATIVA]` |
| concorrentes | Acessórias Komunic [R5] (envio em massa `[NÃO VERIFICADO]`); ferramentas de multiatendimento `[NÃO VERIFICADO]` |
| hipótese_automação | Segmento por consulta ao cadastro (M2), com o exemplo do Plano: M1 (o que a norma muda) → M2 (quem é afetado) → M4 (mensagem por cliente, aprovação em lote) |
| papel_da_ia | M1 ler; M2 ler; M4 rascunhar e executar com aprovação |
| ferramentas_agênticas | `segmentar_clientes(filtro)`, `enviar_comunicado(segmento, modelo, variaveis)` |
| eventos_timesheet | `ges.comunicado.enviar` |
| fontes_descoberta | [R5]; Plano, seções 1.5 e 6 |

### GES-031 · Gerir consentimento (opt-in/opt-out) e saúde do número oficial

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Atendimento / Canal |
| atividade | Registrar quem aceitou receber mensagens por cada canal, respeitar pedidos de parar e acompanhar a qualidade e o limite de envio do número |
| descrição | Ninguém controla; bloqueios de clientes derrubam a qualidade do número `[NÃO VERIFICADO]` |
| gatilho_frequência | Contínua; por evento |
| porte_alcance | Todos |
| quem_faz | Coordenador de atendimento |
| onde_é_feita_hoje | Não é feito |
| entradas / saídas | Respostas "parar", bloqueios, avaliação do número → status por contato, alertas |
| base_legal | LGPD art. 7º/8º; política de opt-in da Meta `[NÃO VERIFICADO]` |
| risco_se_falhar | Número rebaixado ou bloqueado: escritório perde o canal com todos os clientes |
| tempo_estimado | — |
| concorrentes | `[NÃO ENCONTRADO]` (não buscado) |
| hipótese_automação | Registro de opt-in no onboarding (D1); opt-out automático; painel de qualidade via API (B) |
| papel_da_ia | M2 ler; classificação de pedidos de saída |
| ferramentas_agênticas | `registrar_consentimento(contato, canal, finalidade)`, `saude_numero()` |
| eventos_timesheet | `ges.consentimento.registrar` |
| fontes_descoberta | Conhecimento do agente `[NÃO VERIFICADO]` |

### GES-032 · Atender mensagens e leads do Instagram e de outras redes

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Atendimento / Canais |
| atividade | Responder DMs e comentários no Instagram (e Facebook), separar lead de cliente e levar para o funil |
| descrição | Sócio ou estagiário responde no celular; leads se perdem |
| gatilho_frequência | Diária |
| porte_alcance | Prospects; alguns clientes |
| quem_faz | Comercial / marketing |
| onde_é_feita_hoje | App do Instagram |
| entradas / saídas | DM → conversa na caixa única, lead criado (GES-042) |
| base_legal | Termos da plataforma de mensagens da Meta (janela de resposta) `[NÃO VERIFICADO]` |
| risco_se_falhar | Perda de vendas |
| tempo_estimado | 2–5 min por DM `[ESTIMATIVA]` |
| concorrentes | Ferramentas de multiatendimento com Instagram `[NÃO VERIFICADO]` |
| hipótese_automação | API de mensagens do Instagram na mesma caixa (B); qualificação inicial pela IA |
| papel_da_ia | M2 ler; M4 rascunhar resposta e qualificar |
| ferramentas_agênticas | `qualificar_lead(conversa)` |
| eventos_timesheet | `ges.lead.atender` (COM) |
| fontes_descoberta | Conhecimento do agente `[NÃO VERIFICADO]` |

### GES-033 · Registrar ligações telefônicas e reuniões com clientes

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Atendimento / Canais |
| atividade | Registrar quem ligou, sobre o quê, o que foi combinado; idem para reuniões presenciais e por vídeo |
| descrição | Ligação não deixa rastro; o combinado se perde |
| gatilho_frequência | Diária |
| porte_alcance | Todos |
| quem_faz | Todos |
| onde_é_feita_hoje | Telefone fixo/celular, Google Meet/Teams, papel |
| entradas / saídas | Chamada/reunião → registro no histórico do cliente, tarefas geradas, tempo no timesheet |
| base_legal | LGPD (gravação exige informação ao titular) `[NÃO VERIFICADO]` |
| risco_se_falhar | Divergência sobre o combinado; tempo não medido |
| tempo_estimado | 2–5 min de registro por ligação `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` (não buscado) |
| hipótese_automação | Telefonia VoIP com webhook; calendário (GES-050); resumo por IA quando houver transcrição autorizada |
| papel_da_ia | M2 ler; M4 rascunhar resumo e tarefas |
| ferramentas_agênticas | `registrar_interacao(cliente, tipo, resumo, duracao)` |
| eventos_timesheet | `ges.ligacao.atender`, `ges.reuniao.realizar` |
| fontes_descoberta | Plano, seção 5.1 |

### GES-034 · Alertar conversas sem resposta e resumir o dia do atendimento

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Atendimento / Supervisão |
| atividade | Avisar o coordenador de clientes sem resposta há mais de X horas e resumir pendências do dia |
| descrição | Hoje só se descobre quando o cliente reclama ao sócio |
| gatilho_frequência | Diária (manhã e fim do dia) |
| porte_alcance | O escritório |
| quem_faz | Coordenador / sócio |
| onde_é_feita_hoje | Não é feito |
| entradas / saídas | Conversas abertas, SLA → resumo, lista priorizada |
| base_legal | — |
| risco_se_falhar | Insatisfação silenciosa; churn |
| tempo_estimado | — |
| concorrentes | `[NÃO ENCONTRADO]` (não buscado) |
| hipótese_automação | Resumo diário do Plano ("estes 8 clientes estão sem resposta há mais de 24 h") |
| papel_da_ia | M2 ler; M4 rascunhar resumo |
| ferramentas_agênticas | `conversas_sem_resposta(horas)`, `resumo_atendimento(dia)` |
| eventos_timesheet | `ges.supervisao.resumir` |
| fontes_descoberta | Plano, seção 6 |

### GES-035 · Atender fora do horário e em feriados

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Atendimento / Horário |
| atividade | Responder automaticamente fora do expediente, resolver o que for de status e registrar o resto para o primeiro horário |
| descrição | Funcionário responde à noite no celular pessoal (ver risco trabalhista, GES-053) ou o cliente fica sem retorno |
| gatilho_frequência | Diária |
| porte_alcance | Todos |
| quem_faz | Ninguém (ou o funcionário, fora do horário) |
| onde_é_feita_hoje | WhatsApp pessoal |
| entradas / saídas | Mensagem fora do horário → resposta automática, tarefa para o dia seguinte |
| base_legal | CLT (sobreaviso, horas extras) `[NÃO VERIFICADO]` |
| risco_se_falhar | Passivo trabalhista; cliente irritado |
| tempo_estimado | — |
| concorrentes | Ferramentas de multiatendimento `[NÃO VERIFICADO]` |
| hipótese_automação | IA atende categorias liberadas 24 h; demais esperam; bloqueio de notificação para quem está fora do expediente |
| papel_da_ia | M2 ler; M4 executar (liberadas) |
| ferramentas_agênticas | `configurar_horario_atendimento(regras)` |
| eventos_timesheet | `ges.resposta.automatica` |
| fontes_descoberta | Conhecimento do agente |

### GES-036 · Registrar autorizações e combinados dados pelo cliente no chat

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Atendimento / Registro |
| atividade | Guardar como prova o "pode transmitir", "pode parcelar", "aceito o reajuste" dado por mensagem, ligado ao ato |
| descrição | A autorização fica perdida no celular do analista; em disputa, não há prova |
| gatilho_frequência | Por evento (diária) |
| porte_alcance | Todos |
| quem_faz | Analistas |
| onde_é_feita_hoje | WhatsApp, prints |
| entradas / saídas | Mensagem do cliente → registro de autorização (quem, quando, o quê) ligado à tarefa |
| base_legal | Código Civil (prova de manifestação de vontade) `[NÃO VERIFICADO]` |
| risco_se_falhar | Responsabilização do escritório por ato "não autorizado" |
| tempo_estimado | 1 min por registro `[ESTIMATIVA]` |
| concorrentes | Acessórias Protocolo Digital (protocolo de entrega e leitura) [R16] |
| hipótese_automação | IA detecta a autorização na conversa e propõe o vínculo com a tarefa; botões de aprovação no próprio WhatsApp (mensagem interativa) |
| papel_da_ia | M2 ler; M4 rascunhar registro |
| ferramentas_agênticas | `registrar_autorizacao(cliente, ato, mensagem_id)`, `pedir_aprovacao_cliente(cliente, ato)` |
| eventos_timesheet | `ges.autorizacao.registrar` |
| fontes_descoberta | [R16] |

### GES-037 · Migrar o atendimento dos celulares pessoais e de grupos para o canal oficial

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Atendimento / Canal |
| atividade | Comunicar aos clientes o número oficial, encerrar grupos e números pessoais e preservar o histórico |
| descrição | Projeto único na implantação, mas crítico: muitos escritórios atendem por grupos de WhatsApp com cada cliente. Suporte a grupos na API oficial `[NÃO VERIFICADO]` |
| gatilho_frequência | Uma vez (implantação); por evento (cliente resistente) |
| porte_alcance | Todos |
| quem_faz | Sócio / atendimento |
| onde_é_feita_hoje | — |
| entradas / saídas | Lista de contatos e grupos → comunicado, nova conversa oficial, exportação de histórico relevante |
| base_legal | LGPD |
| risco_se_falhar | Adoção baixa; histórico perdido com funcionário que sai |
| tempo_estimado | Semanas de transição `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` (não buscado) |
| hipótese_automação | Campanha de migração com modelo aprovado; importação de exportações de conversa (.txt) para o histórico do cliente (F) |
| papel_da_ia | M4 rascunhar campanha; M2 indexar histórico importado |
| ferramentas_agênticas | `importar_historico_whatsapp(arquivo, cliente)` |
| eventos_timesheet | `ges.migracao.canal` |
| fontes_descoberta | Plano, seção 6 (risco de bibliotecas não oficiais) |

### GES-038 · Medir satisfação (NPS/CSAT) e tratar detratores

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Atendimento / Qualidade |
| atividade | Pedir avaliação após atendimento e pesquisa periódica de NPS; abrir plano de ação para quem dá nota baixa |
| descrição | Raramente feito; quando feito, por formulário solto sem retorno |
| gatilho_frequência | Por atendimento; semestral |
| porte_alcance | Todos |
| quem_faz | Sócio / atendimento |
| onde_é_feita_hoje | Formulários, não feito |
| entradas / saídas | Conversa encerrada → nota, comentário, alerta de detrator |
| base_legal | — |
| risco_se_falhar | Churn sem aviso |
| tempo_estimado | — |
| concorrentes | `[NÃO ENCONTRADO]` (não buscado) |
| hipótese_automação | Pesquisa por mensagem interativa; nota entra no "risco de saída" (GES-043) |
| papel_da_ia | M2 ler; análise de sentimento dos comentários |
| ferramentas_agênticas | `enviar_pesquisa(cliente, tipo)`, `detratores(periodo)` |
| eventos_timesheet | `ges.pesquisa.enviar` |
| fontes_descoberta | Conhecimento do agente |

---

## D. Portal do cliente

### GES-039 · Publicar guias, relatórios e documentos no portal com confirmação de leitura

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Atendimento / Portal do cliente |
| atividade | Disponibilizar ao cliente, num só lugar, tudo o que o escritório produz (guias, holerites, balancetes, certidões, contratos) e saber se ele abriu |
| descrição | Hoje parte vai pelo WhatsApp, parte pelo e-mail, parte pelo portal do core; o cliente não acha e pede de novo |
| gatilho_frequência | Contínua; picos mensais |
| porte_alcance | Todos |
| quem_faz | Analistas (upload); automático em parte |
| onde_é_feita_hoje | Onvio Portal do Cliente [R17], portais de concorrentes, e-mail |
| entradas / saídas | Documentos gerados (D2–D5) → publicação, notificação, protocolo de leitura, alerta de guia não aberta perto do vencimento |
| base_legal | — |
| risco_se_falhar | Guia não paga e multa atribuída ao escritório |
| tempo_estimado | 1–2 min por documento manual `[ESTIMATIVA]` |
| concorrentes | Acessórias Protocolo Digital e e-Contínuo [R16][R5]; Onvio Portal do Cliente [R17]; HubStrom app [R9]; Alterdata eContador [R18] |
| hipótese_automação | Portal e WhatsApp como duas vistas do mesmo repositório; alerta "guia não aberta a 2 dias do vencimento" com reenvio automático |
| papel_da_ia | M2 ler; M4 executar publicação e lembrete |
| ferramentas_agênticas | `publicar_documento(cliente, documento, notificar)`, `documentos_nao_lidos(vencendo_em)` (transversal: D2, D4, D5) |
| eventos_timesheet | `ges.portal.publicar` |
| fontes_descoberta | [R5], [R9], [R16], [R17], [R18] |

### GES-040 · Receber solicitações tipadas e uploads do cliente pelo portal

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Atendimento / Portal do cliente |
| atividade | Permitir que o cliente abra pedidos padronizados (admissão, rescisão, férias, nota, certidão, alteração) e envie documentos, gerando tarefa no setor |
| descrição | Pedido chega solto pelo WhatsApp, incompleto; o analista pergunta tudo de novo |
| gatilho_frequência | Por evento (diária) |
| porte_alcance | Todos |
| quem_faz | Cliente; analista recebe |
| onde_é_feita_hoje | Onvio Portal do Cliente (solicitações tipadas de rescisão, aviso prévio, geral) [R17]; WhatsApp |
| entradas / saídas | Formulário + anexos → tarefa com checklist completo |
| base_legal | — |
| risco_se_falhar | Prazos trabalhistas perdidos por pedido incompleto (ver D4) |
| tempo_estimado | 5–15 min economizados por pedido `[ESTIMATIVA]` |
| concorrentes | Onvio [R17]; Alterdata eContador (pré-admissão, pré-demissão) [R18] |
| hipótese_automação | Os mesmos formulários também conduzidos pela IA no WhatsApp (o cliente fala, a IA preenche e pede o que falta) |
| papel_da_ia | M2 ler; M4 rascunhar o pedido a partir da conversa |
| ferramentas_agênticas | `abrir_solicitacao(cliente, tipo, dados)`, `pedir_dados_faltantes(solicitacao)` (transversal: D1, D4) |
| eventos_timesheet | `ges.solicitacao.abrir` |
| fontes_descoberta | [R17], [R18] |

### GES-041 · Gerir usuários e permissões do cliente no portal

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Atendimento / Portal do cliente |
| atividade | Cadastrar quem, em cada empresa cliente, vê o quê (sócio vê tudo; financeiro vê guias; RH vê holerites) e remover acessos de quem saiu da empresa |
| descrição | Login compartilhado; ex-funcionário do cliente continua recebendo holerites de todos |
| gatilho_frequência | Por evento |
| porte_alcance | Todos |
| quem_faz | Atendimento |
| onde_é_feita_hoje | Portal do core |
| entradas / saídas | Pessoas do cliente (D1) → perfis de acesso |
| base_legal | LGPD (dados de empregados do cliente) `[NÃO VERIFICADO]` |
| risco_se_falhar | Vazamento de salário e dado pessoal |
| tempo_estimado | 5 min por usuário `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` (não buscado) |
| hipótese_automação | Perfis padrão por papel; revisão anual automática "estas pessoas ainda trabalham com vocês?" |
| papel_da_ia | M2 ler; M4 rascunhar revisão |
| ferramentas_agênticas | `gerir_usuario_portal(cliente, pessoa, perfil)` |
| eventos_timesheet | `ges.portal.usuario` |
| fontes_descoberta | Conhecimento do agente |

---

## E. Comercial, relacionamento e retenção

### GES-042 · Captar, qualificar e acompanhar leads até a proposta

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Gestão / Comercial (CRM) |
| atividade | Registrar contatos de prospects (site, Instagram, indicação, WhatsApp), qualificar (regime, porte, dor) e acompanhar até a proposta (SOC-015, D1) |
| descrição | Leads em conversas soltas; sem follow-up |
| gatilho_frequência | Por evento |
| porte_alcance | Prospects |
| quem_faz | Sócio / comercial |
| onde_é_feita_hoje | WhatsApp, planilha, CRM genérico |
| entradas / saídas | Contato → lead com origem, etapa, próximo passo; proposta (D1) |
| base_legal | LGPD (dados de prospect) |
| risco_se_falhar | Perda de vendas |
| tempo_estimado | 10–20 min por lead `[ESTIMATIVA]` |
| concorrentes | Makrosystem (proposta/orçamento) [R10]; CRMs genéricos `[NÃO VERIFICADO]` |
| hipótese_automação | Funil simples nativo; IA puxa o CNPJ e pré-preenche a qualificação; lembrete de follow-up |
| papel_da_ia | M2 ler; M4 rascunhar follow-up |
| ferramentas_agênticas | `criar_lead(contato, origem)`, `avancar_lead(lead, etapa)` (transversal: D1 SOC-015) |
| eventos_timesheet | `ges.lead.qualificar` (COM) |
| fontes_descoberta | [R10] |

### GES-043 · Detectar risco de saída do cliente

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Gestão / Retenção |
| atividade | Juntar sinais (atrasos de pagamento, reclamações, NPS baixo, queda de interação, erro recente do escritório) e agir antes do pedido de distrato |
| descrição | O escritório só sabe quando chega o pedido de documentos do novo contador |
| gatilho_frequência | Mensal (automático) |
| porte_alcance | Todos |
| quem_faz | Sócio |
| onde_é_feita_hoje | Não é feito |
| entradas / saídas | Eventos de cobrança, atendimento, ocorrências → índice de risco, ação sugerida |
| base_legal | — |
| risco_se_falhar | Churn evitável |
| tempo_estimado | — |
| concorrentes | Gestta trata sucesso do cliente em conteúdo [R19]; produto `[NÃO ENCONTRADO]` |
| hipótese_automação | Índice de saúde por cliente no painel; alerta ao sócio |
| papel_da_ia | M2 ler; M3 (índice); M4 rascunhar contato |
| ferramentas_agênticas | `risco_saida(cliente)`, `clientes_em_risco()` |
| eventos_timesheet | `ges.retencao.alertar` |
| fontes_descoberta | [R19] |

### GES-044 · Enviar informativo periódico e conteúdo aos clientes

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Gestão / Relacionamento |
| atividade | Produzir e enviar boletim mensal (prazos do mês, novidades legais relevantes para o perfil do cliente) |
| descrição | Escritórios compram conteúdo pronto ou não fazem; conteúdo genérico, sem ligação com o perfil |
| gatilho_frequência | Mensal |
| porte_alcance | Todos |
| quem_faz | Sócio / marketing |
| onde_é_feita_hoje | E-mail marketing, Instagram |
| entradas / saídas | Normas do mês (M1), perfis → boletim por segmento |
| base_legal | LGPD (finalidade e opt-out) |
| risco_se_falhar | Baixa percepção de valor |
| tempo_estimado | 2–4 h/mês `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` (não buscado) |
| hipótese_automação | Boletim montado pela IA com citações, aprovado pelo sócio, enviado por segmento (GES-030) |
| papel_da_ia | M1 ler; M2 ler; M4 rascunhar |
| ferramentas_agênticas | `rascunhar_boletim(competencia, segmento)` |
| eventos_timesheet | `ges.boletim.produzir` |
| fontes_descoberta | Conhecimento do agente |

### GES-045 · Montar a reunião periódica com o cliente (pauta e relatório de entregas)

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Gestão / Relacionamento |
| atividade | Preparar pauta da reunião trimestral/anual com o cliente: entregas, pendências, alertas, oportunidades (planejamento, reforma) |
| descrição | Preparação manual de horas juntando dados de vários setores |
| gatilho_frequência | Trimestral ou anual; antes do reajuste |
| porte_alcance | Clientes de maior honorário |
| quem_faz | Sócio |
| onde_é_feita_hoje | Planilha, PowerPoint |
| entradas / saídas | Dados de todas as abas → pauta e relatório |
| base_legal | — |
| risco_se_falhar | Cliente não percebe o valor entregue |
| tempo_estimado | 1–3 h por reunião `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` (não buscado) |
| hipótese_automação | Relatório "o que fizemos por você" gerado dos eventos do ano (também serve à carta de reajuste, GES-014) |
| papel_da_ia | M2 ler; M4 rascunhar |
| ferramentas_agênticas | `relatorio_entregas(cliente, periodo)` |
| eventos_timesheet | `ges.reuniao.preparar` |
| fontes_descoberta | Conhecimento do agente; [R13] |

### GES-046 · Encerrar o relacionamento: cobrança final, distrato e transição para o novo contador

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Gestão / Offboarding |
| atividade | Calcular saldo devedor e honorários do aviso, encerrar cobranças recorrentes, comunicar a transição e registrar a entrega de documentos |
| descrição | Transversal com o offboarding do D1; aqui o lado financeiro e comunicacional. Procedimentos do distrato registrados em [R3]; devolução de documentos na Res. CFC 1.590/2020 [R1] |
| gatilho_frequência | Por evento |
| porte_alcance | Clientes que saem |
| quem_faz | Sócio / financeiro |
| onde_é_feita_hoje | Manual |
| entradas / saídas | Contrato, débitos → acerto final, cancelamento de recorrência, termo de entrega |
| base_legal | Res. CFC 1.590/2020 [R1] |
| risco_se_falhar | Cobrança indevida após saída; disputa ética |
| tempo_estimado | 1–3 h `[ESTIMATIVA]` |
| concorrentes | Makrosystem (distrato) [R10] |
| hipótese_automação | Gatilho único de offboarding que cancela recorrência, calcula acerto e gera termo |
| papel_da_ia | M3 (acerto); M4 rascunhar e executar com aprovação |
| ferramentas_agênticas | `calcular_acerto_final(cliente, data_saida)`, `iniciar_offboarding(cliente, motivo)` (transversal: D1) |
| eventos_timesheet | `ges.offboarding.financeiro` |
| fontes_descoberta | [R1], [R3], [R10] |

---

## F. Timesheet automático

### GES-047 · Captar tempo a partir dos eventos da própria plataforma

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Timesheet / Captura |
| atividade | Transformar cada ação feita na plataforma (tarefa aberta e fechada, conversa atendida, documento conferido, ação da IA aprovada) em registro de tempo com setor, atividade e cliente |
| descrição | Hoje: apontamento manual, incompleto, preenchido na sexta de memória, ou inexistente |
| gatilho_frequência | Contínua |
| porte_alcance | Toda a equipe |
| quem_faz | Automático |
| onde_é_feita_hoje | Planilha de horas, quando existe |
| entradas / saídas | Eventos padronizados de todas as abas → intervalos de tempo atribuídos |
| base_legal | Ver GES-052/053/054 |
| risco_se_falhar | Rentabilidade errada |
| tempo_estimado | Apontamento manual custa 10–20 min/dia por pessoa `[ESTIMATIVA]` |
| concorrentes | Gestores de tarefa registram conclusão, não duração (Gestta, Acessórias) [R5][R6] `[NÃO VERIFICADO quanto a duração]` |
| hipótese_automação | Regra do Plano 1.6: toda ação gera evento; o tempo entre eventos do mesmo cliente é atribuído com regras de ociosidade |
| papel_da_ia | M2 (agregação); sem decisão sensível |
| ferramentas_agênticas | `registrar_evento(...)` (interno, padrão de todas as abas), `timesheet(pessoa, dia)` |
| eventos_timesheet | É a própria fonte |
| fontes_descoberta | Plano, seções 1.6 e 5.1 |

### GES-048 · Importar tempo e atividades dos sistemas core

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Timesheet / Captura |
| atividade | Trazer do Domínio/Onvio, Alterdata e Contmatic o que foi feito, por quem, para qual empresa e quando |
| descrição | O trabalho mais pesado acontece dentro do core, invisível à plataforma. Gestta tem integração em que atividades concluídas no Domínio concluem a tarefa no Gestta [R7]; Alterdata dá baixa automática de tarefa por envio [R12] |
| gatilho_frequência | Contínua ou diária |
| porte_alcance | Escritórios com cada core |
| quem_faz | Automático |
| onde_é_feita_hoje | Não é feito |
| entradas / saídas | Logs/eventos do core → intervalos por empresa e módulo |
| base_legal | Termos de uso de cada core `[NÃO VERIFICADO]` |
| risco_se_falhar | Lacuna grande no timesheet |
| tempo_estimado | — |
| concorrentes | Gestta × Domínio [R7]; Alterdata eTarefas [R12] |
| hipótese_automação | API do core, se expuser usuário, empresa e horário (Plano: `[A CONFIRMAR]`); senão, logs locais ou relatório exportado (F); senão, agente de desktop (GES-049) |
| papel_da_ia | Nenhum além de mapeamento empresa do core → cliente |
| ferramentas_agênticas | `importar_atividades_core(core, periodo)` |
| eventos_timesheet | `ges.core.atividade` (setor pelo módulo) |
| fontes_descoberta | [R7], [R12]; Plano, seção 5.1 |

### GES-049 · Captar tempo pelo agente de desktop (janela ativa e ociosidade)

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Timesheet / Captura |
| atividade | Registrar programa, título da janela ativa e tempo ocioso no computador do funcionário, e inferir cliente e setor pelo título (ex.: empresa aberta no core) |
| descrição | Hipótese do Plano: o título da janela do core costuma mostrar a empresa `[A CONFIRMAR em cada core]`. Referências técnicas: APIs de sistema operacional para janela em primeiro plano e último input; projetos abertos de rastreamento de tempo como ActivityWatch `[NÃO VERIFICADO]` |
| gatilho_frequência | Contínua durante o expediente |
| porte_alcance | Equipe que usa computador do escritório |
| quem_faz | Automático |
| onde_é_feita_hoje | Não é feito (ou softwares de monitoramento genéricos) |
| entradas / saídas | Janela/título/ociosidade → intervalos classificados (cliente, setor) ou "não identificado" |
| base_legal | LGPD (GES-054); CLT (GES-053) |
| risco_se_falhar | Viabilidade do bloco de rentabilidade; risco jurídico se coletar demais |
| tempo_estimado | — |
| concorrentes | Ferramentas genéricas de tempo (Toggl, Clockify, RescueTime, Hubstaff) `[NÃO VERIFICADO]`; específico para contabilidade `[NÃO ENCONTRADO]` em D1–D5 |
| hipótese_automação | Agente leve que **só** capta programa, título e ociosidade (nada de tela, teclas ou conteúdo, Plano 5.3); filtro de títulos pessoais; envio só no horário de trabalho; teste nos três cores logo no levantamento |
| papel_da_ia | M2 (classificação título → cliente); sem decisão sensível |
| ferramentas_agênticas | `intervalos_desktop(pessoa, dia)` (só a própria pessoa e gestores autorizados) |
| eventos_timesheet | `ges.desktop.intervalo` |
| fontes_descoberta | Plano, seções 5.1 e 5.3 |

### GES-050 · Captar reuniões e ligações do calendário

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Timesheet / Captura |
| atividade | Atribuir a cada cliente o tempo de reuniões e ligações registradas na agenda e na telefonia |
| descrição | Reuniões consomem tempo de sócios e não entram em lugar nenhum |
| gatilho_frequência | Contínua |
| porte_alcance | Sócios, consultoria |
| quem_faz | Automático |
| onde_é_feita_hoje | Google Agenda, Outlook |
| entradas / saídas | Eventos de agenda com participantes → intervalos por cliente (pelo e-mail/telefone do participante) |
| base_legal | LGPD |
| risco_se_falhar | Subestimar o custo dos clientes que mais demandam reunião |
| tempo_estimado | — |
| concorrentes | `[NÃO ENCONTRADO]` (não buscado) |
| hipótese_automação | Google Calendar API, Microsoft Graph (A/B conforme provedor) `[NÃO VERIFICADO]` |
| papel_da_ia | M2 (ligar participantes a clientes) |
| ferramentas_agênticas | `importar_agenda(pessoa, periodo)` |
| eventos_timesheet | `ges.reuniao.realizar` |
| fontes_descoberta | Plano, seção 5.1 |

### GES-051 · Revisar, completar e confirmar o timesheet do dia

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Timesheet / Revisão |
| atividade | Mostrar à pessoa o próprio dia já montado, com os trechos "não identificados" para ela atribuir ou descartar, e sugestões da IA |
| descrição | Hoje não existe; no apontamento manual, tudo é digitado |
| gatilho_frequência | Diária ou semanal |
| porte_alcance | Toda a equipe |
| quem_faz | Cada funcionário |
| onde_é_feita_hoje | — |
| entradas / saídas | Intervalos de GES-047 a 050 → timesheet confirmado |
| base_legal | LGPD (direito de correção, art. 18) `[NÃO VERIFICADO]` |
| risco_se_falhar | Dados ruins; desconfiança da equipe |
| tempo_estimado | 2–5 min/dia `[ESTIMATIVA]` |
| concorrentes | Ferramentas genéricas com sugestão de apontamento `[NÃO VERIFICADO]` |
| hipótese_automação | Tela "meu dia" com um clique por trecho; a IA propõe o cliente pelo contexto (conversa aberta, arquivo baixado) |
| papel_da_ia | M2 ler; M4 rascunhar classificação |
| ferramentas_agênticas | `classificar_intervalo(intervalo, cliente, atividade)`, `confirmar_dia(pessoa, dia)` |
| eventos_timesheet | `ges.timesheet.confirmar` |
| fontes_descoberta | Plano, seção 5.3 ("mostrar a cada pessoa os próprios dados primeiro") |

### GES-052 · Alinhar o timesheet ao controle de ponto oficial

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Timesheet / Trabalhista |
| atividade | Garantir que a medição de esforço não contradiga o ponto: nada fora da jornada sem regra, divergências tratadas, finalidade documentada |
| descrição | Rara de pensar, crítica em reclamação trabalhista. Pelo conhecimento do agente: CLT art. 74 §2º (ponto acima de 20 empregados), Portaria MTP 671/2021 (REP-C, REP-A, REP-P), Súmula 338 do TST (ônus da prova da jornada) `[NÃO VERIFICADO]` |
| gatilho_frequência | Na implantação; mensal (conferência) |
| porte_alcance | O escritório como empregador |
| quem_faz | Sócio; DP do próprio escritório; advogado |
| onde_é_feita_hoje | Ponto em REP ou app; timesheet inexistente |
| entradas / saídas | Marcações de ponto, intervalos do timesheet → relatório de divergências, política |
| base_legal | CLT art. 74; Portaria MTP 671/2021; Súmula 338 TST `[NÃO VERIFICADO]` |
| risco_se_falhar | Prova de hora extra contra o escritório; passivo trabalhista |
| tempo_estimado | — |
| concorrentes | Alterdata tem ponto eletrônico próprio [R20] (integração com timesheet `[NÃO ENCONTRADO]`) |
| hipótese_automação | Agente de desktop e captura só dentro da jornada registrada; alerta ao gestor quando há atividade fora (para tratar, não para cobrar); integração de leitura com o ponto |
| papel_da_ia | M1 ler (regras); M2 ler |
| ferramentas_agênticas | `divergencias_ponto_timesheet(periodo)` |
| eventos_timesheet | `ges.timesheet.divergencia` |
| fontes_descoberta | [R20]; Plano, seção 5.3 |

### GES-053 · Tratar atividade fora da jornada, teletrabalho e desconexão

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Timesheet / Trabalhista |
| atividade | Definir política para mensagens e trabalho fora do horário (inclusive WhatsApp) e para teletrabalho, e fazer o sistema cumpri-la |
| descrição | Funcionário responde cliente à noite; isso, registrado pela plataforma, é jornada. Pelo conhecimento do agente, a CLT regula teletrabalho (arts. 75-A a 75-F) e o enquadramento do art. 62, III `[NÃO VERIFICADO]` |
| gatilho_frequência | Na implantação; contínua |
| porte_alcance | O escritório |
| quem_faz | Sócio; advogado |
| onde_é_feita_hoje | Não é tratado |
| entradas / saídas | Política → regras de notificação, de horário de atendimento (GES-035) e de captura |
| base_legal | CLT `[NÃO VERIFICADO]` |
| risco_se_falhar | Passivo de horas extras e sobreaviso |
| tempo_estimado | — |
| concorrentes | `[NÃO ENCONTRADO]` (não buscado) |
| hipótese_automação | Notificações silenciadas fora do expediente; IA cobre o horário (GES-035); relatório mensal de exceções |
| papel_da_ia | M1 ler; M2 ler |
| ferramentas_agênticas | `configurar_politica_jornada(regras)`, `excecoes_jornada(periodo)` |
| eventos_timesheet | `ges.jornada.excecao` |
| fontes_descoberta | Plano, seção 5.3 |

### GES-054 · Documentar a base legal, a transparência e o relatório de impacto do monitoramento (LGPD)

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Timesheet / LGPD |
| atividade | Definir finalidade, base legal, dados coletados, retenção e quem acessa; informar a equipe (política, aviso, termo) e manter relatório de impacto |
| descrição | Pré-condição do GES-049. Pelo conhecimento do agente: legítimo interesse (LGPD art. 7º, IX, e art. 10) com teste de balanceamento; relatório de impacto (art. 38); encarregado (art. 41; Res. CD/ANPD 18/2024); regime simplificado para agentes de pequeno porte (Res. CD/ANPD 2/2022) `[NÃO VERIFICADO]` |
| gatilho_frequência | Na implantação; revisão anual; por mudança de coleta |
| porte_alcance | O escritório |
| quem_faz | Sócio; advogado do grupo; encarregado |
| onde_é_feita_hoje | Não é feito |
| entradas / saídas | Desenho da coleta → política, aviso, registro de operações de tratamento, relatório de impacto |
| base_legal | Lei 13.709/2018 (LGPD) `[NÃO VERIFICADO quanto aos artigos]` |
| risco_se_falhar | Sanção da ANPD; nulidade da prova; conflito com a equipe |
| tempo_estimado | Projeto único; horas de advogado `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` (não buscado) |
| hipótese_automação | Modelos de política e aviso entregues com o produto; tela de transparência ("o que a plataforma sabe sobre você"); retenção automática (D) |
| papel_da_ia | M1 ler (LGPD); M4 rascunhar documentos para o advogado |
| ferramentas_agênticas | `exportar_dados_titular(pessoa)`, `politica_retencao(tipo_dado)` |
| eventos_timesheet | `ges.lgpd.documentar` |
| fontes_descoberta | Plano, seção 5.3 |

### GES-055 · Definir e atualizar o custo-hora de cada função

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Timesheet / Custos |
| atividade | Calcular custo-hora por pessoa ou cargo (salário, encargos, benefícios, rateio de estrutura) para converter tempo em custo |
| descrição | Sem custo-hora, horas não viram margem; dado salarial é sensível dentro do escritório |
| gatilho_frequência | Anual; por evento (reajuste salarial, admissão) |
| porte_alcance | O escritório |
| quem_faz | Sócio |
| onde_é_feita_hoje | Planilha, quando existe |
| entradas / saídas | Folha do escritório, custos fixos → custo-hora por cargo (com acesso restrito) |
| base_legal | LGPD (dado salarial) |
| risco_se_falhar | Rentabilidade distorcida; vazamento de salários |
| tempo_estimado | 2–4 h/ano `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` (não buscado) |
| hipótese_automação | Custo por **cargo** (não por pessoa) como padrão, para reduzir sensibilidade; importação da folha do próprio escritório |
| papel_da_ia | M3 (cálculo) |
| ferramentas_agênticas | `definir_custo_hora(cargo, valor, vigencia)` |
| eventos_timesheet | `ges.custo_hora.definir` |
| fontes_descoberta | Plano, seção 5.2 |

### GES-056 · Medir o tempo que a IA economiza e o tempo das ações da IA

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Timesheet / IA |
| atividade | Registrar o que a IA fez sozinha ou com aprovação, quanto tempo humano a aprovação levou e quanto tempo a atividade levava antes |
| descrição | Novo: sem isso, o escritório não sabe se a automação valeu, nem a fila seguinte de automação (Plano 5.2) |
| gatilho_frequência | Contínua; mensal (relatório) |
| porte_alcance | O escritório |
| quem_faz | Automático |
| onde_é_feita_hoje | — |
| entradas / saídas | Eventos com ator = IA, linha de base por atividade → horas economizadas por atividade e cliente |
| base_legal | — |
| risco_se_falhar | Investir na automação errada |
| tempo_estimado | — |
| concorrentes | `[NÃO ENCONTRADO]` (não buscado) |
| hipótese_automação | Campo "ator" e "aprovador" em todo evento (Plano 1.6); comparação com médias anteriores |
| papel_da_ia | M2 ler; M3 |
| ferramentas_agênticas | `economia_ia(periodo)`, `fila_de_automacao()` |
| eventos_timesheet | Consome todos |
| fontes_descoberta | Plano, seções 1.6 e 5.2 |

---

## G. Compliance e estrutura do próprio escritório

### GES-057 · Manter o registro do escritório e dos profissionais no CRC em dia

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Gestão / Compliance do escritório |
| atividade | Pagar anuidades, manter o registro cadastral da organização contábil e do responsável técnico, atualizar alterações (sócios, endereço) no CRC |
| descrição | Rara e crítica: registro irregular impede a atividade e a assinatura de peças. Regras e prazos do registro da organização contábil `[NÃO VERIFICADO]` |
| gatilho_frequência | Anual (anuidade); por evento (alteração societária do escritório) |
| porte_alcance | O escritório e seus contadores |
| quem_faz | Sócio / administrativo |
| onde_é_feita_hoje | Portal do CRC do estado |
| entradas / saídas | Dados do escritório → anuidades pagas, certidão de regularidade |
| base_legal | Decreto-Lei 9.295/1946 e resoluções do CFC sobre registro `[NÃO VERIFICADO]` |
| risco_se_falhar | Exercício irregular; impedimento de DECORE e assinaturas (D5) |
| tempo_estimado | 1–2 h/ano `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` (não buscado) |
| hipótese_automação | Calendário próprio do escritório como "cliente zero"; lembretes e guarda da certidão (D) |
| papel_da_ia | M2 ler; M4 rascunhar lembrete |
| ferramentas_agênticas | `obrigacoes_do_escritorio()` |
| eventos_timesheet | `ges.crc.regularizar` (tempo interno) |
| fontes_descoberta | Conhecimento do agente `[NÃO VERIFICADO]` |

### GES-058 · Renovar os certificados digitais do escritório e dos contadores

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Gestão / Compliance do escritório |
| atividade | Controlar validade do e-CNPJ do escritório e dos e-CPF dos contadores, que sustentam procurações, Integra Contador e transmissões de toda a carteira |
| descrição | Certificado do escritório vencido para tudo de uma vez. Os certificados dos **clientes** estão em D1; aqui, os do escritório |
| gatilho_frequência | Anual (A1) ou trienal (A3); alerta 30/15/7 dias |
| porte_alcance | O escritório |
| quem_faz | Sócio / TI |
| onde_é_feita_hoje | Memória, lembrete |
| entradas / saídas | Certificados → alertas, renovação, troca nos robôs e integrações |
| base_legal | — |
| risco_se_falhar | Paralisação de transmissões e consultas da carteira inteira |
| tempo_estimado | 1–2 h por renovação `[ESTIMATIVA]` |
| concorrentes | Acessórias AC Certifica [R21]; Omie/G.Click (controle de certificados e procurações) [R22] |
| hipótese_automação | Inventário de certificados com dependências ("estas 40 integrações usam este certificado"); alerta escalonado |
| papel_da_ia | M2 ler |
| ferramentas_agênticas | `certificados_vencendo(dias)` (transversal: D1) |
| eventos_timesheet | `ges.certificado.renovar` |
| fontes_descoberta | [R21], [R22] |

### GES-059 · Responder a incidentes de segurança e a pedidos de titulares (LGPD)

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Gestão / Compliance do escritório |
| atividade | Detectar e registrar incidentes (vazamento, envio à empresa errada, celular perdido com conversas), avaliar risco, comunicar ANPD e titulares quando exigido; atender pedidos de titulares (acesso, correção, eliminação) |
| descrição | Rara e crítica. O escritório guarda dados de sócios, empregados dos clientes e salários. Pelo conhecimento do agente, a Res. CD/ANPD 15/2024 trata da comunicação de incidentes (prazo citado de 3 dias úteis) `[NÃO VERIFICADO]` |
| gatilho_frequência | Por evento |
| porte_alcance | O escritório |
| quem_faz | Encarregado / sócio / advogado |
| onde_é_feita_hoje | Não há processo |
| entradas / saídas | Ocorrência → registro do incidente, avaliação, comunicação, medidas |
| base_legal | LGPD arts. 18 e 48; Res. CD/ANPD 15/2024 `[NÃO VERIFICADO]` |
| risco_se_falhar | Sanções da ANPD; dano reputacional |
| tempo_estimado | Horas a dias por incidente `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` (não buscado) |
| hipótese_automação | Registro de incidentes com roteiro; trilha de auditoria da plataforma para reconstruir o que aconteceu (Plano 1.6); exportação de dados do titular |
| papel_da_ia | M1 ler (prazos e conteúdo); M2 ler (auditoria); M4 rascunhar comunicação; nunca enviar sem humano |
| ferramentas_agênticas | `registrar_incidente(tipo, dados_afetados)`, `trilha_auditoria(filtro)`, `exportar_dados_titular(pessoa)` |
| eventos_timesheet | `ges.incidente.tratar` |
| fontes_descoberta | Conhecimento do agente `[NÃO VERIFICADO]` |

### GES-060 · Manter o seguro de responsabilidade civil profissional

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Gestão / Compliance do escritório |
| atividade | Contratar e renovar o seguro, informar sinistros (multas e erros) dentro do prazo da apólice |
| descrição | Rara; sinistro avisado tarde perde cobertura `[NÃO VERIFICADO]` |
| gatilho_frequência | Anual; por evento (ocorrência, GES-019) |
| porte_alcance | Escritórios que contratam |
| quem_faz | Sócio |
| onde_é_feita_hoje | Corretor, e-mail |
| entradas / saídas | Apólice, ocorrências → aviso de sinistro, renovação |
| base_legal | Contrato de seguro |
| risco_se_falhar | Indenização sem cobertura |
| tempo_estimado | — |
| concorrentes | `[NÃO ENCONTRADO]` (não buscado) |
| hipótese_automação | Ocorrência com custo acima de X sugere aviso ao seguro; lembrete de renovação (D) |
| papel_da_ia | M2 ler; M4 rascunhar aviso |
| ferramentas_agênticas | `sugerir_aviso_sinistro(ocorrencia)` |
| eventos_timesheet | `ges.seguro.avisar` |
| fontes_descoberta | Conhecimento do agente `[NÃO VERIFICADO]` |

### GES-061 · Cuidar das obrigações do próprio escritório como empresa ("cliente zero")

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Gestão / Compliance do escritório |
| atividade | Tratar o escritório como um cliente da carteira: DAS ou tributos próprios, folha da equipe, NFS-e, certidões, e, se optante do Simples, deveres específicos de escritórios contábeis |
| descrição | "Casa de ferreiro": a contabilidade do escritório fica por último. Pelo conhecimento do agente, a LC 123/2006 (art. 18, §§ 22-A a 22-C) prevê ISS fixo possível e deveres como atender gratuitamente o MEI na inscrição e na primeira declaração, sob pena de exclusão `[NÃO VERIFICADO]` |
| gatilho_frequência | Mensal; anual |
| porte_alcance | O escritório |
| quem_faz | Sócio / equipe interna |
| onde_é_feita_hoje | No próprio core, sem prioridade |
| entradas / saídas | — (as mesmas das abas D2–D5, aplicadas ao escritório) |
| base_legal | LC 123/2006 `[NÃO VERIFICADO]` |
| risco_se_falhar | Multas próprias; exclusão do Simples |
| tempo_estimado | — |
| concorrentes | `[NÃO ENCONTRADO]` (não buscado) |
| hipótese_automação | Cadastrar o escritório como cliente com flag "interno"; obrigações próprias no mesmo calendário vivo |
| papel_da_ia | Igual às outras abas |
| ferramentas_agênticas | As mesmas das outras abas, com `cliente = escritorio` |
| eventos_timesheet | Setor de cada aba, cliente "interno" (fora da rentabilidade) |
| fontes_descoberta | Conhecimento do agente `[NÃO VERIFICADO]` |

---

## H. Governança da IA no atendimento

### GES-062 · Liberar categorias de resposta automática e auditar a IA por amostragem

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Atendimento / Governança da IA |
| atividade | Decidir quais tipos de mensagem a IA pode responder sozinha, revisar por amostragem o que ela respondeu, corrigir e transformar erros em casos de teste |
| descrição | Novo e crítico: resposta errada enviada a cliente em nome do escritório; política da Meta restringe IA de uso geral (Achado 2) `[NÃO VERIFICADO]` |
| gatilho_frequência | Semanal (amostragem); por evento (erro reportado) |
| porte_alcance | O escritório |
| quem_faz | Coordenador de atendimento; sócio |
| onde_é_feita_hoje | — |
| entradas / saídas | Log de respostas da IA → amostra revisada, correções, casos para o benchmark (Plano 1.5, Camada 4) |
| base_legal | Responsabilidade do escritório pela orientação; termos da Meta `[NÃO VERIFICADO]` |
| risco_se_falhar | Orientação errada; banimento do número; perda de confiança |
| tempo_estimado | 30–60 min/semana `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` (não buscado) |
| hipótese_automação | Matriz de categorias (status, reenvio, agendamento = automático; técnica, financeira, reclamação = rascunho); fila de revisão; regressão no benchmark antes de liberar categoria nova |
| papel_da_ia | Todos os motores sob auditoria; o roteador da etapa 0 também é medido |
| ferramentas_agênticas | `configurar_categorias_automaticas(regras)`, `amostra_respostas_ia(periodo, n)`, `marcar_resposta_incorreta(id, correcao)` |
| eventos_timesheet | `ges.ia.auditar` |
| fontes_descoberta | Plano, seções 1.5 e 6 |

---

## Funcionalidades de concorrentes nesta aba

Base: o que os arquivos D1–D5 registraram com fonte (lido por eles via resumo do buscador em 05/11/2026). O D7 não conseguiu buscar nem abrir páginas de concorrentes; o que vem do conhecimento do agente está marcado.

| Concorrente | O que oferece nesta aba | Fonte |
| --- | --- | --- |
| **Acessórias** | Gestão de processos com responsável e alertas; **Komunic** (WhatsApp); **Protocolo Digital** (entrega e leitura); **GED**; robô **e-Contínuo** (lê documentos, envia guias por e-mail, organiza pastas); **AC Certifica** (certificados); ferramentas de IA. Régua de cobrança de honorários, timesheet e rentabilidade: `[NÃO ENCONTRADO]` | [R5], [R15], [R16], [R21] |
| **Gestta (Thomson Reuters)** | Tarefas pré-parametrizadas por regime; acompanhamento de andamento e **desempenho**; **Gestta Express** (anexos); **Gestta Messenger** (WhatsApp); integração com o Domínio (atividade concluída no Domínio conclui a tarefa); conteúdo sobre onboarding e sucesso do cliente. Medição de duração: `[NÃO VERIFICADO]` | [R6], [R7], [R19] |
| **Domínio / Onvio** | Portal do Cliente com solicitações tipadas (rescisão, aviso prévio, geral); Portal do Empregado. Onvio Processos e Onvio Messenger no Brasil: `[NÃO ENCONTRADO]` em D2 | [R17] |
| **HubStrom** | Ecossistema com atendimento, tarefas (**TaskHub**), monitoramento de obrigações (**MonitorHub**) e aplicativo para o cliente. Detalhe de atendimento e cobrança: `[NÃO ENCONTRADO]` | [R8], [R9] |
| **Alterdata** | Reajuste programado de contratos de honorários; eTarefas com baixa automática por envio; **painel de bilhetagem** do Integra Contador e revenda de serviços; eContador (portal/app do cliente com pré-admissão e pré-demissão); Pack Protocolo; ponto eletrônico próprio | [R4], [R12], [R18], [R20] |
| **Makrosystem** | Gestão do contador: proposta/orçamento, contrato e distrato | [R10] |
| **Questor (Tareffa)** | Processo modelo de cobrança de arquivos com checklist por cliente | [R23] |
| **Omie / G.Click** | Controle de certificados e procurações | [R22] |
| **SIEG, Qive, Veri, e-Kontroll** | Foco em documentos fiscais e monitoramento; nada desta aba registrado em D1–D5 `[NÃO ENCONTRADO]` | — |
| **Multiatendimento genérico** (Digisac, Octadesk, Huggy, Blip, Zenvia; Chatwoot de código aberto) | Caixa única, filas, transferência, bots, modelos, envio em massa | `[NÃO VERIFICADO]` (conhecimento do agente; Chatwoot citado no Plano) |
| **Cobrança** (Asaas, Banco Inter, Efí; Nibo para escritórios) | Boleto, Pix, recorrência, régua de notificação, emissão de NFS-e, conciliação por webhook | `[NÃO VERIFICADO]` (hipóteses do Plano e do agente) |
| **Tempo** (Toggl, Clockify, RescueTime, Hubstaff, ActivityWatch) | Apontamento e captura por janela ativa, genéricos, sem ligação com cliente contábil | `[NÃO VERIFICADO]` |

**Leitura:** atendimento, envio de guias e tarefas já são oferecidos por vários concorrentes. Nas fontes disponíveis **não apareceu** quem junte quatro coisas: tempo medido automaticamente, rentabilidade por cliente, IA que responde com os dados do cliente e cobrança de honorários no mesmo lugar. Como o D7 não pôde buscar, isso é um indício a confirmar, não um fato.

---

## Lacunas

### Para a Etapa 2 (V3 principalmente; V1 nos itens legais)

1. **WhatsApp Business Platform:** modelo de cobrança vigente (por mensagem desde 07/2025?), tabela do Brasil por categoria, gratuidade de utilidade na janela de 24 h, limites de envio e qualidade do número, suporte a grupos, texto e data da política sobre IA de uso geral (citada como 15/01/2026). Fonte esperada: `developers.facebook.com/docs/whatsapp/pricing` e termos da plataforma (bloqueado nesta sessão).
2. **Instagram:** API de mensagens, janela de resposta e exigências de revisão de app.
3. **Cobrança de honorários:** preços e recursos de Asaas, Banco Inter, Efí (boleto, Pix, **Pix Automático**, régua, NFS-e, webhooks); regulamento do Pix Automático no BCB; protesto de boleto por API.
4. **NFS-e do escritório:** API do Sistema Nacional NFS-e para **emissão** (o D3 tratou a distribuição pelo ADN); data correta da obrigatoriedade do Emissor Nacional para o Simples (Res. CGSN 189 × 191/2026) [R11]; campos de IBS/CBS na nota de honorários em 2026–2027.
5. **Retenções sobre honorários contábeis:** IRRF 1,5%, CSRF 4,65%, dispensas do Simples, ISS retido (confirmar na fonte).
6. **Cores:** se Domínio/Onvio, Alterdata e Contmatic expõem por API ou log quem fez o quê, em qual empresa e quando; formato do título da janela de cada core (teste prático com os contadores).
7. **Trabalhista do timesheet:** CLT art. 74 e 75-A a 75-F, Portaria MTP 671/2021, Súmula 338 do TST, jurisprudência sobre logs de sistema e mensagens de WhatsApp como prova de jornada.
8. **LGPD do monitoramento:** guias da ANPD sobre legítimo interesse e sobre relação de trabalho; Res. CD/ANPD 2/2022, 15/2024 e 18/2024 (texto vigente).
9. **Ética e inadimplência:** NBC PG 01 (retenção de documentos), Res. CFC 1.590/2020 (rescisão, devolução de documentos) [R1]; juros legais pós-Lei 14.905/2024.
10. **Escritório no Simples:** LC 123/2006, art. 18, §§ 22-A a 22-C (ISS fixo, atendimento gratuito ao MEI).
11. **CRC:** regras atuais de registro da organização contábil, anuidade e responsável técnico.

### Buscas que o D7 não pôde fazer (roteiro para nova rodada com rede liberada)

- "Hubstrom ChatHub/atendimento WhatsApp funcionalidades"; "Acessórias Komunic envio em massa régua"; "Gestta Messenger preço"; "Onvio Messenger Brasil"; "Nibo escritório contábil cobrança honorários portal"; "SIEG Qive gestão escritório" — para fechar a tabela de concorrentes.
- "inadimplência honorários contábeis pesquisa percentual"; "pesquisa tempo atendimento WhatsApp escritório contábil" — para dar número às dores (nenhum tempo desta aba tem fonte).
- "13º honorário contábil prática CRC"; "reajuste honorários contábeis índice mais usado 2026".
- "timesheet automático escritório contábil"; "rentabilidade por cliente contabilidade software".
- "LGPD monitoramento de empregados ANPD guia"; "log de sistema prova hora extra TST".

### Dados que só os contadores do escritório-piloto dão

- Volume diário de mensagens por canal e por setor; quantos números e grupos de WhatsApp existem hoje.
- Percentual de inadimplência e prática atual de cobrança (quem cobra, quando, com que tom); se há 13º honorário.
- Como emitem a NFS-e própria hoje e em qual município/regime está o escritório.
- Se há controle de ponto, quantos empregados, teletrabalho, e se alguém responde clientes fora do horário.
- Disposição da equipe e dos sócios para o agente de desktop, e o título de janela dos três cores (teste de 10 minutos).

---

## Fontes

Todas reaproveitadas dos arquivos D1–D5 (consultadas por aqueles agentes em 05/11/2026, por resumo do buscador; não reabertas pelo D7). Plano = [Plano da Plataforma do Escritório](../../planos/Plano_Plataforma_do_Escritorio.md), usado só como hipótese.

- [R1] Res. CFC 1.590/2020: https://www.normaslegais.com.br/legislacao/resolucao-cfc-1590-2020.htm ; https://www.legisweb.com.br/legislacao/?id=449491 (via D1 F5)
- [R2] D1, fichas SOC-015 a SOC-018 (escopo, extras, reajuste): [D1-clientes-societario.md](D1-clientes-societario.md)
- [R3] Contábeis, distrato de serviços contábeis: https://www.contabeis.com.br/noticias/40610/quais-procedimentos-deve-o-contabilista-observar-no-distrato-de-servicos-contabeis/ (via D1 F6)
- [R4] Alterdata, reajuste de contratos de honorários: https://ajuda.alterdata.com.br/prosofterp/e1678-company-servicos-reajuste-de-contratos-de-honorarios-149128019.html (via D1 F37)
- [R5] Acessórias: https://acessorias.com/site/ ; e-Contínuo: https://acessorias.com/site/e-continuo-automacao-inteligente-para-escritorios-contabeis/ ; Komunic: https://acessorias.com/site/funcionalidade/komunic/ ; IA: https://acessorias.com/site/ferramentas-ia-contabilidade/ ; Gestão de Processos: https://acessorias.com/site/funcionalidade/gestao-de-processos/ (via D2 C1 e D1 F28)
- [R6] Thomson Reuters, "Conheça o Gestta" (PDF): https://images.engage.es-pt.thomsonreuters.com/Web/LALEYSAEIMPRESORA/%7Be40173fd-00db-4d29-a84a-2c10c7c668bf%7D_OUT-_513_-_WP__-_TR_-_Conhe%c3%a7a_o_GESTTA_(NOVO).pdf ; Perguntas e respostas: https://images.engage.es-pt.thomsonreuters.com/Web/LALEYSAEIMPRESORA/%7Bfa3be1a4-eadc-479b-a994-f9e425ce049d%7D_TAX_PROF_BR_PDF_PERGUNTAS_E_RESPOSTAS_Base.pdf (via D2 C2)
- [R7] Gestta, integração com Domínio (inclui Gestta Messenger e Express): https://www.gestta.com.br/integracao-gestta-e-solucoes-dominio/ (via D1 F31)
- [R8] AmdJus sobre HubStrom: https://amdjus.com.br/hubstrom-revoluciona-a-contabilidade-com-seu-ecossistema-inteligente-integrado/ ; TaskHub: https://hubstrom.com/solucoes/taskhub (via D2 C7 e D1 F34)
- [R9] HubStrom, MonitorHub: https://hubstrom.com/monitorhub ; aplicativo: https://hubstrom.com/aplicativo (via D1 F33)
- [R10] Makrosystem, gestão do contador: https://makrosystem.com.br/categoria/gestao-do-contador/ (via D1 F38)
- [R11] NFS-e padrão nacional e Emissor Nacional para o Simples (Res. CGSN 189 e 191/2026): https://jornalcontabil.com.br/noticia/nfs-e-padrao-nacional-passa-a-ser-uma-obrigacao-em-2026/ ; https://www.barbieriadvogados.com/?p=3813 ; https://www.gov.br/nfse/pt-br/biblioteca/documentacao-tecnica/rtc/nt-007-se-cgnfse-v1-0.pdf ; https://www.systax.com.br/?p=42430 (via D3 S5 e S6)
- [R12] Alterdata, eTarefas baixa automática: https://ajuda.alterdata.com.br/packupbase/tema-etarefas/etarefas-baixa-automatica-envios-que-geram-a-baixa-automatica-da-tarefa-pelo-updocs-ou-sistemas-desktop ; painel de bilhetagem: https://ajuda.alterdata.com.br/packfinbase/painel-bilhetagem-integra-contador ; revenda do Integra Contador: https://ajuda.alterdata.com.br/fiscalbase/simples-nacional-api-serpro-integra-contador-206051349.html (via D2 C9 e S5)
- [R13] Contadores.cnt, comunicação do reajuste (06/08/2026): https://contadores.cnt.br/projetos/54/noticias/tecnicas/2026/08/06/como-comunicar-o-reajuste-contabil-e-fortalecer-a-parceria-com-o-cliente.html (via D1 F58)
- [R14] D1, ficha sobre certificados A1 circulando por e-mail/WhatsApp (Nota Orientativa eSocial 14/2019): https://www.tributa.net/wp-content/uploads/2019/01/nota-orientativa-014-2019-certificado-digital.pdf (via D1 F55)
- [R15] Acessórias, GED: https://acessorias.com/site/funcionalidades/gestao-eletronica-de-documentos/ (via D1 F30)
- [R16] Acessórias, Protocolo Digital: https://acessorias.com/site/funcionalidade/protocolo-digital/ (via D1 F29)
- [R17] Domínio/Onvio Portal do Cliente, solicitações: https://suporte.dominioatendimento.com/central/faces/solucao.html?codigo=10324 ; https://suporte.dominioatendimento.com/central/faces/solucao.html?codigo=10322 ; https://suporte.dominioatendimento.com/central/faces/solucao.html?codigo=10394 (via D4 C2)
- [R18] Alterdata eContador (pré-admissão, férias no app, pré-demissão): https://ajuda.alterdata.com.br/x/lSaED ; https://ajuda.alterdata.com.br/econtador/agendar-ferias-econtador-app ; https://ajuda.alterdata.com.br/packupbase/tema-econtador/econtador-recurso-de-pre-demissao-no-econtador (via D4 C3)
- [R19] Gestta, onboarding de clientes contábeis: https://www.gestta.com.br/onboarding-de-clientes-contabeis/ (via D1 F32)
- [R20] Alterdata, ponto eletrônico: https://www.alterdata.com.br/contabil/ponto-eletronico (via D4 C12)
- [R21] Acessórias, AC Certifica: https://acessorias.com/site/funcionalidade/ac-certifica/ (via D1 F27)
- [R22] Omie, G.Click (certificados e procurações, 04/07/2024): https://ajuda.omie.com.br/pt-BR/articles/15212786-omie-g-click-vocepode-controle-de-certificados-e-procuracoes-com-a-omie-g-click-04-07-2024 (via D1 F36)
- [R23] Tareffa (Questor), processo modelo de cobrança de arquivos: https://docs.questor.com.br/pt-br/Produtos/Tareffa/gestao-processos/proc-modelo-cobranca (via D5 C1)

---

## Fichas do ciclo de vida (rodada 3, 6/11/2026)

Rodada feita para a classificação por etapa do ciclo de vida do cliente (**Entrada**, **Manutenção**, **Desligamento**) usada pelos contadores do grupo. O núcleo jurídico e operacional da entrada e da saída já está no D1 (SOC-021 onboarding, SOC-022 diagnóstico, SOC-023 acervo, SOC-024 offboarding, SOC-101 modelos e minutas, SOC-103/104 transição com o contador anterior, SOC-106/107 rescisão e sucessor, SOC-108 LGPD do ex-cliente, SOC-031/109 baixa) e, nesta aba, em GES-042 (leads) e GES-046 (acerto financeiro da saída). As fichas abaixo cobrem só o lado de **gestão, atendimento e timesheet** que faltava. As fichas existentes não foram alteradas. Campos extras: `etapa` e `nível_automação (provisório)` (escala do consolidado). Fontes novas `[R24]` a `[R29]` na subseção "Referências da rodada 3", consultadas em 6/11/2026. Tempos são `[ESTIMATIVA]`.

### GES-101 · Decidir a aceitação do cliente novo (motivo da troca, risco e histórico)

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Gestão / Comercial (Entrada) |
| etapa | Entrada |
| atividade | Antes de assinar, registrar por que o cliente está saindo do contador anterior, se há honorários em aberto ou desistência do colega por motivo ético, sinais de risco (PLD, reputação, histórico de inadimplência) e decidir aceitar, aceitar com condições ou recusar |
| descrição | A NBC PG 01 manda o contador abster-se de aceitar encargo em substituição a colega que dele desistiu para preservar a dignidade da profissão, enquanto permanecerem as mesmas condições (item 18(b)), evitar desentendimentos com o substituído (18(d)) e inteirar-se das circunstâncias antes de opinar (3(j)) [R24]. Hoje é conversa informal do sócio, sem registro `[NÃO VERIFICADO]`. A checagem de PLD fica no SOC-019 e o combinado com o colega no SOC-104. |
| gatilho_frequência | Por evento (proposta aceita, antes do contrato) |
| porte_alcance | Todo cliente novo vindo de outra contabilidade; abertura de empresa nova com escopo reduzido |
| quem_faz | Sócio |
| onde_é_feita_hoje | Reunião e memória do sócio |
| entradas / saídas | Respostas do questionário de entrada, consulta de situação (SOC-022), PLD (SOC-019) → decisão registrada com motivo e condições (ex.: regularização prévia, pagamento antecipado) |
| base_legal | NBC PG 01, itens 3(j), 18(b) e 18(d) [R24] |
| risco_se_falhar | Processo ético; cliente inadimplente crônico herdado; perda de tempo com cliente que não fecha |
| tempo_estimado | 20–40 min por cliente `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` (não buscado em concorrentes nesta rodada) |
| hipótese_automação | Questionário de aceitação no fluxo da proposta; a IA junta diagnóstico, PLD e respostas num parecer curto com a regra ética; decisão do sócio com um clique, registrada (Próprio) |
| nível_automação (provisório) | Próprio |
| papel_da_ia | M1 ler (NBC PG 01); M2 ler (diagnóstico e PLD); M4 rascunhar parecer; decisão sempre do sócio |
| ferramentas_agênticas | `parecer_aceitacao(prospect_id)`, `registrar_decisao_aceitacao(prospect_id, decisao, condicoes)` (transversal: D1) |
| eventos_timesheet | `ges.aceitacao.avaliar`, `ges.aceitacao.decidir` (setor COM) |
| fontes_descoberta | [R24] |

### GES-102 · Estimar o esforço e o honorário do cliente novo a partir do tempo medido de clientes parecidos

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Gestão / Rentabilidade (Entrada) |
| etapa | Entrada |
| atividade | Antes da proposta, prever horas mensais por setor e o esforço de implantação do prospect com base no tempo real de clientes de mesmo regime, porte, volume de notas e número de empregados, e mostrar a margem esperada do preço proposto |
| descrição | A NBC PG 01 manda fixar o valor dos serviços por escrito considerando, entre outros, complexidade, custos e "o tempo que será consumido" (item 6(a) e (b)), e listar na proposta cada serviço com valor, periodicidade e reajuste (item 8) [R24]. Imprensa e fornecedores recomendam estimar o tempo de atendimento de cada cliente para precificar; o CFC remete à tabela do sindicato estadual como piso [R25]. Hoje a estimativa é intuição ou tabela, sem o tempo medido; o SOC-015 cuida da proposta em si. |
| gatilho_frequência | Por evento (cada proposta) |
| porte_alcance | Todos os prospects |
| quem_faz | Sócio / comercial |
| onde_é_feita_hoje | Planilha de precificação, tabela do Sescon `[NÃO VERIFICADO]` |
| entradas / saídas | Perfil do prospect, tempo por cliente (GES-047/048), custo-hora (GES-055) → horas previstas, honorário sugerido, margem, preço de implantação |
| base_legal | NBC PG 01, itens 6 e 8 [R24] |
| risco_se_falhar | Cliente que nasce dando prejuízo; reajuste difícil depois |
| tempo_estimado | 30–60 min por proposta `[ESTIMATIVA]` |
| concorrentes | Makrosystem (proposta/orçamento) [R10]; precificação a partir de tempo medido `[NÃO ENCONTRADO]` |
| hipótese_automação | Comparáveis da própria carteira com tempo medido alimentam o simulador da proposta; sem base própria suficiente, usa a tabela do escritório (Próprio) |
| nível_automação (provisório) | Próprio |
| papel_da_ia | M2 ler (carteira, timesheet); M3 (horas previstas, preço e margem); M4 rascunhar a proposta |
| ferramentas_agênticas | `estimar_esforco(perfil_prospect)`, `simular_honorario(perfil_prospect, margem_alvo)` (transversal: D1 SOC-015) |
| eventos_timesheet | `ges.proposta.estimar` (setor COM) |
| fontes_descoberta | [R10], [R24], [R25] |

### GES-103 · Cobrar a implantação, a regularização herdada e a primeira mensalidade proporcional

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Gestão / Faturamento de honorários (Entrada) |
| etapa | Entrada |
| atividade | Emitir a cobrança da taxa de implantação ou de abertura de empresa, do serviço de regularização do que veio pendente (declarações omissas, parcelamentos, cadastro) e da primeira mensalidade pro rata, e só então ligar a recorrência |
| descrição | Contratos costumam ter mensalidade base e cobrar à parte serviços extraordinários como regularizações e implantação, o que reduz conflito por deixar claro o que está incluso [R26]. A NBC PG 01 exige que a proposta liste cada serviço cobrado individualmente com seu valor (item 8) [R24]. Na prática o primeiro mês e a regularização ficam esquecidos ou viram desconto informal `[NÃO VERIFICADO]`. GES-001 cuida da recorrência e GES-002 dos extras em geral; aqui é o pacote da chegada. |
| gatilho_frequência | Por evento (contrato assinado; fim do diagnóstico SOC-022) |
| porte_alcance | Clientes novos; aberturas de empresa |
| quem_faz | Financeiro |
| onde_é_feita_hoje | Banco ou sistema de cobrança, manual |
| entradas / saídas | Contrato, proposta, pendências do diagnóstico → cobranças avulsas, parcelamento da implantação, recorrência criada com data de início |
| base_legal | NBC PG 01, item 8 [R24]; Res. CFC 1.590/2020 (contrato) [R1] |
| risco_se_falhar | Receita de implantação perdida; regularização feita de graça; atrito por cobrança não combinada |
| tempo_estimado | 15–30 min por cliente `[ESTIMATIVA]` |
| concorrentes | Alterdata (contratos de honorários) [R4]; Makrosystem (proposta e contrato) [R10] |
| hipótese_automação | A proposta aceita gera as cobranças de entrada e agenda a recorrência no provedor de pagamento; pendências do diagnóstico viram orçamento de regularização para o cliente aprovar no app (B) |
| nível_automação (provisório) | B |
| papel_da_ia | M3 (pro rata, parcelas); M2 ler (proposta, diagnóstico); M4 executar com aprovação |
| ferramentas_agênticas | `gerar_cobrancas_entrada(cliente)`, `orcar_regularizacao(cliente, pendencias)`, `agendar_recorrencia(cliente, inicio)` |
| eventos_timesheet | `ges.cobranca.entrada` (setor FIN) |
| fontes_descoberta | [R1], [R4], [R10], [R24], [R26] |

### GES-104 · Ativar o cliente novo no app e nos canais (convite, A1, opt-in e contatos por assunto)

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Gestão / Atendimento e app do cliente (Entrada) |
| etapa | Entrada |
| atividade | Convidar os responsáveis do cliente para o app, coletar o certificado A1 (documento obrigatório), registrar quem fala pelo cliente em cada assunto (sócio, financeiro, RH), o opt-in no WhatsApp oficial e os canais e horários preferidos, e ligar a captura de documentos |
| descrição | Guia de onboarding contábil põe no início alinhar onde o cliente envia documentos, quem responde a cada dúvida e como acompanhar solicitações, e lista certificado A1/A3 e autorização no e-CAC no checklist [R27]. Pela premissa da plataforma, o A1 do cliente entra pelo app, não por e-mail ou WhatsApp (ver [R14]). GES-041 trata usuários e permissões no dia a dia e GES-031 o consentimento em geral; aqui é a primeira ativação, que hoje acontece aos poucos e por grupo de WhatsApp `[NÃO VERIFICADO]`. |
| gatilho_frequência | Por evento (contrato assinado) |
| porte_alcance | Todos os clientes novos |
| quem_faz | Atendimento / analista responsável |
| onde_é_feita_hoje | WhatsApp, e-mail, planilha de contatos |
| entradas / saídas | Contrato, sócios e contatos (SOC-004) → usuários ativos no app com perfil, A1 no cofre (SOC-008), opt-in registrado, mapa de contatos por assunto |
| base_legal | Opt-in da WhatsApp Business Platform `[NÃO VERIFICADO]`; LGPD (dados de contato e certificado; cliente controlador, escritório operador, via D1 [F65]) |
| risco_se_falhar | Certificado circulando por canal inseguro; guia enviada à pessoa errada; cliente sem acesso no primeiro vencimento |
| tempo_estimado | 30–60 min por cliente, espalhados em dias `[ESTIMATIVA]` |
| concorrentes | Alterdata eContador [R18]; HubStrom aplicativo [R9]; Onvio Portal do Cliente [R17] |
| hipótese_automação | Convite automático ao fim do contrato com lista do que falta (A1, contatos, opt-in); lembretes até completar; o checklist SOC-021 marca o item sozinho (Próprio) |
| nível_automação (provisório) | Próprio |
| papel_da_ia | M2 ler (o que falta); M4 executar convites e lembretes (baixo risco, categoria liberável) |
| ferramentas_agênticas | `ativar_cliente_app(cliente)`, `registrar_contato_assunto(cliente, pessoa, assuntos)`, `pendencias_ativacao(cliente)` (transversal: D1 SOC-021, SOC-008) |
| eventos_timesheet | `ges.ativacao.convidar`, `ges.ativacao.concluir` (setor ATD) |
| fontes_descoberta | [R9], [R14], [R17], [R18], [R27] |

### GES-105 · Enviar o kit de boas-vindas e conduzir a reunião de início

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Gestão / Relacionamento (Entrada) |
| etapa | Entrada |
| atividade | Enviar ao cliente a apresentação da equipe e dos responsáveis, o calendário do que ele deve mandar e quando (documentos, folha, notas), o que é tarefa dele e o que é do escritório, prazos de resposta, e fazer a reunião de início com pauta e ata |
| descrição | Guia de onboarding contábil recomenda reunião de boas-vindas, envio da agenda fiscal e prazos, apresentação da equipe e materiais de orientação [R27]; material de serviços profissionais sugere mandar o pacote alguns dias antes da reunião e deixar nela claro quem é responsável pelo quê [R28] (resumo do buscador). A NBC PG 01 exige que a parte do serviço executada pelo próprio cliente esteja explícita na proposta e no contrato (item 10) [R24]; o kit traduz isso em calendário. |
| gatilho_frequência | Por evento (contrato assinado) |
| porte_alcance | Todos os clientes novos |
| quem_faz | Sócio ou gerente de conta; analistas de cada setor |
| onde_é_feita_hoje | E-mail e reunião sem pauta padrão `[NÃO VERIFICADO]` |
| entradas / saídas | Perfil do cliente, escopo contratado, equipe (GES-017) → kit personalizado, convite, pauta, ata com combinados (GES-036) |
| base_legal | NBC PG 01, item 10 [R24] |
| risco_se_falhar | Cliente não sabe o que mandar e quando; primeiros meses com atraso e retrabalho |
| tempo_estimado | 1–2 h por cliente (kit + reunião) `[ESTIMATIVA]` |
| concorrentes | Gestta (conteúdo de onboarding) [R19]; Jettax (checklist) [R27] |
| hipótese_automação | Kit gerado do perfil e do escopo (calendário de envio por regime e folha); pauta e ata rascunhadas; combinados da ata viram registros e tarefas (Próprio) |
| nível_automação (provisório) | Próprio |
| papel_da_ia | M2 ler (perfil, escopo); M4 rascunhar kit, pauta e ata; a reunião é humana |
| ferramentas_agênticas | `gerar_kit_boas_vindas(cliente)`, `rascunhar_pauta_inicio(cliente)`, `registrar_ata(cliente, texto)` |
| eventos_timesheet | `ges.boasvindas.enviar`, `ges.reuniao.inicio` (setor COM) |
| fontes_descoberta | [R19], [R24], [R27], [R28] |

### GES-106 · Acompanhar a implantação nos primeiros 90 dias (marcos, saúde e custo da entrada)

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Gestão / Relacionamento e rentabilidade (Entrada) |
| etapa | Entrada |
| atividade | Acompanhar os marcos da implantação (acessos, primeiro fechamento de cada setor, regularização herdada), fazer a reunião de acompanhamento e medir quanto tempo e custo a entrada consumiu contra o previsto na proposta |
| descrição | Guias recomendam reunião de acompanhamento algumas semanas depois para validar se o cliente entendeu o fluxo e se as integrações funcionam [R27] e roteiros de 90 dias (diagnóstico, regularização, estabilização) (D1 [F56]). Nenhuma fonte achada mede o custo real da implantação por cliente `[NÃO ENCONTRADO]`; com o timesheet da plataforma isso sai de graça e calibra o GES-102. |
| gatilho_frequência | Por evento (90 dias após o contrato), com marcos semanais |
| porte_alcance | Clientes novos |
| quem_faz | Gerente de conta / sócio |
| onde_é_feita_hoje | Não é feito de forma sistemática `[NÃO VERIFICADO]` |
| entradas / saídas | Checklist SOC-021, tarefas dos cores (GES-048), tempo apontado (GES-047) → painel de implantação, alerta de atraso, relatório de custo de entrada vs. previsto |
| base_legal | — |
| risco_se_falhar | Cliente insatisfeito no primeiro trimestre (maior risco de saída); prejuízo escondido na implantação |
| tempo_estimado | 30 min por cliente por mês no período `[ESTIMATIVA]` |
| concorrentes | Gestta (onboarding como sucesso do cliente) [R19]; custo de entrada por tempo medido `[NÃO ENCONTRADO]` |
| hipótese_automação | Projeto de implantação com centro de custo próprio no timesheet; painel de marcos; convite automático para a reunião de 30/90 dias (Próprio) |
| nível_automação (provisório) | Próprio |
| papel_da_ia | M2 ler (marcos, tempo); M3 (custo vs. previsto); M4 rascunhar relatório e convite |
| ferramentas_agênticas | `painel_implantacao(cliente)`, `custo_entrada(cliente)` |
| eventos_timesheet | `ges.implantacao.acompanhar` (setor GES); consome eventos de todas as abas marcados como implantação |
| fontes_descoberta | [R19], [R27]; D1 [F56] |

### GES-107 · Fazer a entrevista de saída, registrar o motivo e tentar a retenção

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Gestão / Relacionamento e retenção (Desligamento) |
| etapa | Desligamento |
| atividade | Quando o cliente pede rescisão, conversar (ou enviar pesquisa curta), registrar motivo estruturado (preço, atendimento, erro/multa, mudança de porte ou regime, baixa, inadimplência), avaliar contraproposta e alimentar o painel de saídas |
| descrição | Material sobre retenção recomenda aplicar a pesquisa de saída logo após a decisão, separar saída voluntária de involuntária (baixa, inadimplência) e combinar múltipla escolha com campo aberto, porque o cliente raramente sai por um só motivo [R29] (resumo do buscador; fontes de SaaS). Texto do blog da Certisign cita atendimento ruim, atraso de obrigações com multa e falta de conhecimento do setor do cliente como motivos típicos em contabilidade [R29] (resumo do buscador). GES-043 detecta risco antes; SOC-106 trata o pedido formal; aqui fica o aprendizado. |
| gatilho_frequência | Por evento (pedido de rescisão) |
| porte_alcance | Clientes que saem |
| quem_faz | Sócio / gerente de conta |
| onde_é_feita_hoje | Conversa informal, sem registro `[NÃO VERIFICADO]` |
| entradas / saídas | Pedido de rescisão, histórico (GES-019, GES-038, GES-013) → motivo registrado, decisão de contraproposta, indicador de churn por motivo |
| base_legal | — |
| risco_se_falhar | Perda de receita evitável; mesmo erro repetido em outros clientes |
| tempo_estimado | 20–40 min por saída `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` em software contábil |
| hipótese_automação | Pedido de rescisão abre a entrevista com dossiê (rentabilidade, erros, NPS); formulário de motivo no app; painel de saídas por motivo (Próprio) |
| nível_automação (provisório) | Próprio |
| papel_da_ia | M2 ler (histórico); M4 rascunhar pesquisa e dossiê; a conversa é humana |
| ferramentas_agênticas | `dossie_saida(cliente)`, `registrar_motivo_saida(cliente, motivos, texto)` |
| eventos_timesheet | `ges.saida.entrevistar` (setor COM) |
| fontes_descoberta | [R29] |

### GES-108 · Desativar o cliente que sai na plataforma e nos canais

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Gestão / Atendimento e app do cliente (Desligamento) |
| etapa | Desligamento |
| atividade | Na data de corte: passar o app/portal a somente leitura pelo prazo combinado e depois encerrar, tirar o cliente das listas de envio em massa, da régua e das respostas automáticas, encerrar as tarefas recorrentes nos cores e na plataforma, retirar da carteira do analista e arquivar as conversas conforme a regra de retenção |
| descrição | A Res. CFC 1.590/2020 regula a devolução de documentos e arquivos no distrato [R1] e a NBC PG 01 veda reter documentos para forçar pagamento (item 4(l), lido pelo D1 em [F61]). A LGPD manda eliminar os dados ao fim do tratamento, salvo hipóteses de conservação (art. 16, via D1 [F65]). SOC-024 cuida de procurações, certificados e vínculos públicos e GES-046 do acerto financeiro; sobra o desligamento dentro da própria plataforma, que hoje ninguém faz e gera comunicado, cobrança ou guia enviados a ex-cliente `[NÃO VERIFICADO]`. |
| gatilho_frequência | Por evento (data de corte do distrato ou da baixa) |
| porte_alcance | Clientes que saem |
| quem_faz | Atendimento / administrativo |
| onde_é_feita_hoje | Manual e incompleto `[NÃO VERIFICADO]` |
| entradas / saídas | Distrato e data de corte (SOC-106) → acessos em leitura com prazo, listas e régua limpas, tarefas encerradas, carteira rebalanceada (GES-017), registro de arquivamento |
| base_legal | Res. CFC 1.590/2020 [R1]; LGPD art. 16 (via D1 [F65]) |
| risco_se_falhar | Envio de dados a ex-cliente ou a quem não tem mais vínculo (vazamento); cobrança ou tarefa fantasma; documento retido sem querer |
| tempo_estimado | 20–40 min por cliente `[ESTIMATIVA]` |
| concorrentes | Makrosystem (distrato) [R10]; desligamento automático nos canais `[NÃO ENCONTRADO]` |
| hipótese_automação | O mesmo gatilho de offboarding (SOC-024, GES-046) dispara a desativação em cascata; tarefas recorrentes encerradas pelas APIs de processos dos cores; prazo de leitura configurável (Próprio; B para os cores) |
| nível_automação (provisório) | Próprio |
| papel_da_ia | M2 ler (onde o cliente está ligado); M4 executar em lote com aprovação |
| ferramentas_agênticas | `desativar_cliente(cliente, data_corte, prazo_leitura)`, `encerrar_tarefas_recorrentes(cliente)` (transversal: D1 SOC-024, SOC-108) |
| eventos_timesheet | `ges.offboarding.desativar` (setor ATD) |
| fontes_descoberta | [R1], [R10]; D1 [F61], [F65] |

### GES-109 · Precificar e cobrar o encerramento da empresa até a última obrigação

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Gestão / Faturamento de honorários (Desligamento) |
| etapa | Desligamento |
| atividade | Quando o cliente decide baixar a empresa, orçar o serviço de baixa, definir quantos meses de honorário seguem até as obrigações de extinção e as acessórias de competência ainda devidas, cobrar e só então encerrar a recorrência |
| descrição | A Res. CFC 1.590/2020 põe no contratado as acessórias de competência ocorrida na vigência do contrato, mesmo com vencimento posterior, salvo cláusula em contrário (art. 10, lido pelo D1 em [F62]); na baixa isso inclui declarações de extinção entregues meses depois `[NÃO VERIFICADO]` quanto à lista. A NBC PG 01 pede que cada serviço cobrado tenha valor na proposta (item 8) [R24]. Sem esse orçamento, o escritório entrega as declarações finais de graça ou deixa o cliente sem cobertura. SOC-031 cuida do processo de baixa; GES-046 da saída para outro contador. |
| gatilho_frequência | Por evento (decisão de baixa, SOC-110) |
| porte_alcance | Clientes que encerram |
| quem_faz | Sócio / financeiro |
| onde_é_feita_hoje | Negociação caso a caso `[NÃO VERIFICADO]` |
| entradas / saídas | Perfil do cliente, obrigações remanescentes (D2, D4, D5) → orçamento de baixa, cronograma de cobranças finais, data de fim da recorrência |
| base_legal | Res. CFC 1.590/2020, art. 10 (via D1 [F62]); NBC PG 01, item 8 [R24] |
| risco_se_falhar | Trabalho final não pago; obrigação de extinção não entregue (multa ao cliente, disputa ética) |
| tempo_estimado | 30–60 min por caso `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | A decisão de baixa lista as obrigações remanescentes pelo perfil temporal e gera orçamento e cronograma de cobranças no provedor (B) |
| nível_automação (provisório) | B |
| papel_da_ia | M1 ler (obrigações de extinção); M3 (meses e valores); M4 rascunhar orçamento e executar cobranças com aprovação |
| ferramentas_agênticas | `orcar_baixa(cliente)`, `cronograma_cobranca_final(cliente, data_baixa)` (transversal: D1 SOC-031) |
| eventos_timesheet | `ges.baixa.orcar` (setor FIN) |
| fontes_descoberta | [R24]; D1 [F62] |

### Classificação das 62 fichas por etapa (rodada 3)

- **Só Manutenção:** GES-002 a 005, 007 a 011, 013 a 016, 018, 019, 021 a 030, 033 a 035, 036, 038, 039, 044, 045, 047 a 062.
- **Entrada e Manutenção:** GES-001 (cobrança nasce com o contrato), 012 (indicações trazem cliente), 017 (distribuição do cliente novo), 020 (particularidades registradas na chegada), 032 (leads por redes), 037 (migração de grupos; também quando o cliente chega com grupo próprio), 040 (uploads do onboarding).
- **Entrada:** GES-042.
- **Manutenção e Desligamento:** GES-006 (inadimplência que leva ao distrato), 043 (risco de saída).
- **Entrada, Manutenção e Desligamento:** GES-031 (opt-in na entrada, opt-out na saída), 041 (usuários do cliente criados e removidos).
- **Desligamento:** GES-046.
- **Divisão do nível D:** GES-006 D-humano (decisão do sócio e negociação); GES-037 D-assistido (a IA monta campanha e importa históricos; a pessoa fecha os grupos no celular); GES-054 D-assistido (a IA rascunha política, aviso e relatório de impacto a partir do inventário de coleta; o escritório aprova e assina); GES-057 D-assistido (portal do CRC sem API; a IA prepara e lembra, a pessoa paga e atualiza); GES-060 D-humano (renovação negociada com corretor e seguradora; a IA só lembra e rascunha o aviso de sinistro).

### Referências da rodada 3

Consultadas em 6/11/2026. "Aberta" = página baixada e lida; demais, só resumo do buscador.

| Código | Fonte |
| --- | --- |
| R24 | NBC PG 01 (Código de Ética Profissional do Contador), itens 3(j), 3(l), 6, 8, 10, 18(b) e 18(d) (aberta): https://www.normaslegais.com.br/legislacao/nbc-1-2019.htm |
| R25 | CFC, perguntas frequentes, "Como estabelecer os honorários profissionais?" (não cabe ao Conselho; consultar a tabela do Sescon ou sindicato estadual) (aberta): https://cfc.org.br/vice-presidencia/fiscalizacao-etica-e-disciplina/perguntas-frequentes/como-estabelecer-os-honorarios-profissionais/ |
| R26 | CIDESP, tabela de honorários contábeis 2026 (mensalidade base e cobrança à parte de regularizações e implantação) (aberta): https://cidesp.com.br/v2/tabela-de-honorarios-contabeis-2026 |
| R27 | Jettax (comercial), onboarding de clientes contábeis: alinhamento de canais, checklist com A1 e e-CAC, reunião de boas-vindas e de acompanhamento (aberta): https://www.jettax.com.br/blog/onboarding-de-clientes-contabeis/ |
| R28 | Rework, boas práticas de reunião de kickoff (resumo do buscador): https://resources.rework.com/pt/libraries/post-sale-management/kickoff-meeting-best-practices |
| R29 | Pesquisa de saída e motivos de churn (resumo do buscador; fontes de SaaS e um blog de certificação digital): https://payproglobal.com/pt_br/respostas/o-que-e-pesquisa-de-saida-de-cliente-saas/ ; https://operandoumsaas.substack.com/p/os-7-principais-motivos-de-churn ; https://blog-homolog.certisign.com.br/?p=18889 |

**Lacunas da rodada 3:** tabela de honorários 2026 do Sescon com valores de implantação, abertura e baixa não encontrada (só a da ASSCON foi citada pelo buscador: https://sitecontabil.com.br/noticias_empresariais/ler/asscon-publica-tabela-de-honorarios-contabeis-2026, não aberta); lista oficial das declarações de extinção na baixa não lida (fica com D2/V1); regras de opt-in da Meta continuam `[NÃO VERIFICADO]`; nenhum concorrente encontrado com entrevista de saída, custo de implantação medido ou desativação em cascata nos canais.

# D6 · Descoberta: Consultoria e Reforma Tributária

5 de novembro de 2026 · Etapa 1 do [Protocolo de Descoberta](00-protocolo-de-descoberta.md) · agente D6

Escopo: tudo o que o escritório faz **em volta** do core (Domínio, Alterdata, Contmatic) na área consultiva: atendimento técnico e pareceres, planejamento tributário (Simples × Presumido × Real), diagnóstico e simulação da reforma do consumo (CBS, IBS e IS, transição 2026–2033), opção semestral do Simples pelo regime regular de IBS/CBS, split payment, créditos e saldos credores, revisão de cadastro de produtos (NCM, CST, cClassTrib), regimes específicos, contratos e preços, recuperação de créditos e a gestão da própria carteira consultiva. Apuração e geração de SPED ficam fora (regra 3.7).

## Como ler este arquivo

- **38 fichas** (CON-001 a CON-038), em cinco grupos: A. Atendimento técnico e pareceres; B. Planejamento tributário; C. Reforma tributária; D. Recuperação de créditos; E. Gestão da área consultiva. Campos da seção 2.1 do protocolo.
- **Fontes:** citadas por código (`[S7]`, `[I2]`, `[C3]`) e listadas com link na seção "Fontes" ao final. Todas consultadas em **05/11/2026**.
- **Limitação de método:** nesta sessão a leitura direta de páginas (WebFetch e curl) foi bloqueada pela rede (ex.: `www.coad.com.br`, `planalto.gov.br`, `gov.br/receitafederal`, `contabeis.com.br` não resolvem neste ambiente). As fontes foram lidas pelos **resumos e trechos do buscador**. Por isso: (a) normas e prazos aqui têm confiança **média**; (b) a Etapa 2 deve abrir o texto oficial da LC 214/2025 consolidada (com a LC 227/2026), das Resoluções CGSN 186 e 194/2026, da LC 224/2025 e da Lei 15.270/2025 antes de qualquer regra virar tabela do M3; (c) onde as fontes divergem, as duas versões estão registradas.
- **`tempo_estimado`:** nenhuma fonte pública trouxe medição de tempo por atividade consultiva. Todos os tempos são `[ESTIMATIVA]` do agente e devem ser trocados pelo levantamento com os contadores (Apêndice do Plano).
- **Motores de IA:** M1 legal, M2 escritório, M3 cálculo, M4 ação. Níveis: **ler**, **rascunhar**, **executar** (executar sempre com cartão de aprovação). Nesta aba, quase tudo para em **rascunhar**: a responsabilidade técnica pela recomendação é do contador, e o número sempre vem do M3 (o modelo explica, não calcula).
- **Nomes de ferramentas agênticas** são propostas de interface da plataforma, não serviços existentes.
- `transversal: Dx / FIS-nnn` indica atividade que se repete em outra aba e deve virar uma ferramenta só na Etapa 3.

## Achados que mudam as hipóteses do Plano (seções 3 e 4.7)

1. **A decisão do "Simples por fora" já tem calendário próprio e é semestral.** A Res. CGSN 186/2026 criou a opção pelo regime regular de IBS/CBS para jan–jun/2027; a Res. CGSN 194/2026 (DOU 28/09/2026) prorrogou a janela para 30/10/2026, com cancelamento até o fim de novembro/2026 [S2][S3]. Uma fonte cita nova janela de **1 a 31/03/2027** para o 2º semestre [S4] (fonte única, `[NÃO VERIFICADO]` na norma). O Plano trata isso como P2; na prática é rotina **recorrente, com prazo e cancelamento**, e a próxima janela está a quatro meses. Sugere subir para P1.
2. **CBS de 2027 já tem número.** O TCU calculou a alíquota de referência da CBS para 2027 em 11,3468% (arredondada a 11,3%) em 28/10/2026; o Senado fixa por resolução até 15/12/2026 e, sem resolução, vale o número do TCU [S17]. Há controvérsia sobre anterioridade nonagesimal [S17]. As simulações do M3 precisam de tabela versionada com esse valor e com o estado "provisório".
3. **A Receita tem uma Calculadora de Tributos oficial, gratuita, de código aberto, instalável offline e com API REST** (CBS, IBS e IS, com memória de cálculo e base legal) [S5]. Isso muda a hipótese "construir o cálculo do zero": o M3 pode usá-la como referência ou motor de conferência. Endereço da API e repositório: `[NÃO ENCONTRADO]` (buscado: "Calculadora de Tributos Receita Federal API REST documentação", "github receitafederal calculadora").
4. **Planejamento anual de 2026 já não é só reforma do consumo.** Duas leis de 2025 mexem na comparação de regimes: **LC 224/2025** (acréscimo de 10% nos percentuais de presunção do Presumido sobre a receita acima de R$ 5 milhões, com ADI 7.920 e liminares) [S7] e **Lei 15.270/2025** (retenção de 10% sobre lucros e dividendos acima de R$ 50 mil/mês por sócio e IRPF mínimo para renda acima de R$ 600 mil/ano, com ADIs) [S8]. O Plano não cita nenhuma das duas.
5. **Saldos credores têm datas-limite próximas.** Créditos de PIS/Cofins precisam estar **registrados na EFD-Contribuições até 31/12/2026** para uso após a extinção; crédito presumido sobre estoque com data-limite citada de 30/06/2027 [S12]. Saldo credor de ICMS: pedido de homologação em até 5 anos contados de 01/01/2033, regras na LC 227/2026 [S11]. É uma frente consultiva com prazo duro em **menos de dois meses**, ausente do Plano.
6. **Split payment: começo facultativo e só B2B em 2027**, ferramenta da Receita ainda incompleta em janeiro/2027; obrigatoriedade B2B citada para 2028 por uma fonte [S6]. Confirma P3 do Plano para a parte operacional, mas a **análise de fluxo de caixa** e a **análise de fornecedores** (crédito condicionado à extinção do débito, art. 47 da LC 214) já são consultoria vendável em 2026–2027 [S10].
7. **Imposto Seletivo começa em 2027 sem alíquotas fixadas**: a lista de produtos está na LC 214, as alíquotas dependem de lei ordinária ou MP, cujo envio foi adiado segundo parte das fontes [S15]. A simulação de IS precisa aceitar "alíquota a definir" e cenários.
8. **Segunda lei complementar da reforma em vigor:** LC 227/2026 (PLP 108/2024), sancionada em 13/01/2026, cria o Comitê Gestor do IBS, o processo administrativo do IBS, ajusta a LC 214 e regula saldos de ICMS [S1]. A base legal temporal do M1 precisa das duas leis consolidadas.
9. **Demanda medida:** sondagem Omie citada pelo Contábeis: 68% dos contadores já foram procurados por clientes sobre a reforma e 56% ainda não têm plano de ação [I1]. Reforça a tese comercial do Plano.

---

## A. Atendimento técnico e pareceres

### CON-001 · Receber, triar e registrar as consultas técnicas dos clientes

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Consultoria / Atendimento técnico |
| atividade | Receber perguntas técnicas (WhatsApp, e-mail, telefone, reunião), separar do atendimento operacional, classificar por tema e urgência e registrar |
| descrição | Hoje a pergunta chega misturada com pedidos de guia e documento, geralmente no WhatsApp do analista ou do sócio. Não há registro: a resposta se perde, a mesma dúvida é respondida várias vezes e o tempo consultivo não é medido nem cobrado. Com a reforma, o volume subiu (68% dos contadores procurados por clientes [I1]) |
| gatilho_frequência | Diária, por evento (mensagem do cliente); picos após notícias da reforma |
| porte_alcance | Todos os clientes; mais intenso em Presumido/Real, B2B e setores com regime específico |
| quem_faz | Atendimento (triagem), analista fiscal sênior ou sócio (resposta) |
| onde_é_feita_hoje | WhatsApp, e-mail, telefone; às vezes planilha ou gestor de tarefas |
| entradas / saídas | Mensagem do cliente → consulta registrada (tema, cliente, prazo, responsável, se é escopo do contrato ou extra) |
| base_legal | Não há obrigação legal; contrato de prestação de serviços (Res. CFC 1.590/2020 citada pela fonte) define escopo [I3] |
| risco_se_falhar | Resposta esquecida, orientação contraditória entre analistas, trabalho consultivo dado de graça, perda do cliente |
| tempo_estimado | `[ESTIMATIVA]` 3–5 min por consulta para triar e registrar; 10–40 consultas técnicas/semana em escritório de 100 clientes |
| concorrentes | Gestores de tarefas e multiatendimento (Acessórias, Gestta, Onvio) organizam solicitações, mas nenhum encontrado com classificação "consulta técnica × operacional" `[NÃO ENCONTRADO]` (buscado: "Acessórias Gestta Hubstrom consultoria CRM reforma tributária") |
| hipótese_automação | O multiatendimento detecta a intenção "dúvida técnica", cria a consulta com cliente e tema, marca "dentro do escopo / extra" a partir do contrato e encaminha ao responsável |
| papel_da_ia | Roteador da etapa 0 + M2 (cliente, contrato) → **executar** o registro (baixo risco); M1 **rascunhar** resposta preliminar (ver CON-002) |
| ferramentas_agênticas | `registrar_consulta(cliente, canal, texto, tema)`, `classificar_escopo(cliente, tema)`, `atribuir_responsavel(consulta)` |
| eventos_timesheet | `consultoria.consulta.recebida` (cliente, canal, tema, escopo) ; `consultoria.consulta.triada` (duração) |
| fontes_descoberta | [I1] [I3] |

transversal: D7 (multiatendimento).

### CON-002 · Pesquisar a legislação e responder uma dúvida técnica rápida

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Consultoria / Atendimento técnico |
| atividade | Pesquisar norma, solução de consulta e jurisprudência e responder ao cliente com base citada |
| descrição | O analista consulta Google, portais (Econet, IOB, LegisWeb), grupos de WhatsApp de contadores e o colega mais experiente; responde por mensagem sem citar a norma. Na reforma, a norma muda rápido (LC 214, LC 227, resoluções CGSN, atos do CGIBS) e as fontes de blog divergem entre si, como se viu nesta própria pesquisa |
| gatilho_frequência | Diária, por evento |
| porte_alcance | Todos |
| quem_faz | Analista sênior, coordenador, sócio |
| onde_é_feita_hoje | Navegador, assinatura de portal de consultoria, WhatsApp |
| entradas / saídas | Pergunta + perfil do cliente na data → resposta curta com norma, artigo e vigência; registro reaproveitável |
| base_legal | Depende do tema |
| risco_se_falhar | Orientação errada gera autuação ou perda de crédito para o cliente e responsabilidade civil do contador |
| tempo_estimado | `[ESTIMATIVA]` 15–60 min por dúvida "simples"; reforma tende ao limite superior |
| concorrentes | Econet tem área especial da reforma e se apresenta como consultoria tributária [C10]; IOB oferece consultoria e ferramenta de análise [C11]. Nenhum gestor de escritório (Acessórias, Gestta, Onvio, SIEG) encontrado com assistente legal com citação `[NÃO ENCONTRADO]` |
| hipótese_automação | O assistente legal (M1) já planejado, agora com o perfil temporal do cliente lido do banco: resposta com dispositivo vigente citado, abstenção quando não há base, rascunho da mensagem ao cliente |
| papel_da_ia | M2 (perfil do cliente na data) → M1 (cascata legal) → **rascunhar** a resposta; envio pelo M4 só após aprovação do analista |
| ferramentas_agênticas | `consultar_legislacao(pergunta, data, perfil)`, `perfil_cliente_na_data(cliente, data)`, `rascunhar_resposta_cliente(consulta)`, `enviar_mensagem(cliente, texto)` |
| eventos_timesheet | `consultoria.resposta.rascunhada` (IA) ; `consultoria.resposta.revisada` (pessoa, duração) ; `consultoria.resposta.enviada` |
| fontes_descoberta | [C10] [C11] [S1] |

### CON-003 · Elaborar parecer técnico formal

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Consultoria / Pareceres |
| atividade | Redigir parecer escrito (consulta, fatos, legislação, análise, conclusão, ressalvas), revisar e assinar |
| descrição | Feito em Word a partir de modelo próprio; pesquisa manual; revisão pelo sócio; enviado em PDF. Usado para decisões de regime, enquadramento de produto, crédito, regime específico, distribuição de lucros. Muitos escritórios não cobram à parte [I3] |
| gatilho_frequência | Por evento; mais frequente em out–jan (planejamento) e nas janelas de opção da reforma |
| porte_alcance | Presumido/Real, Simples com decisão de opção, clientes com operação atípica |
| quem_faz | Coordenador técnico, sócio |
| onde_é_feita_hoje | Word, e-mail, pasta de rede |
| entradas / saídas | Consulta + documentos do cliente + dados do core → parecer em PDF assinado, versionado |
| base_legal | Depende do tema; contrato de serviços para o escopo [I3] |
| risco_se_falhar | Parecer com norma revogada ou fora de vigência; responsabilidade do profissional |
| tempo_estimado | `[ESTIMATIVA]` 3–12 h por parecer |
| concorrentes | Nenhum gestor de escritório com gerador de parecer encontrado `[NÃO ENCONTRADO]` (buscado: "parecer técnico contábil software escritório reforma tributária") |
| hipótese_automação | Rascunho de parecer em modelo do escritório, com cada afirmação ligada ao dispositivo vigente e aos registros do banco usados; versionamento; assinatura eletrônica; anexação ao cliente |
| papel_da_ia | M2 (fatos e dados) + M1 (norma) + M3 (números) → **rascunhar**; assinatura sempre humana |
| ferramentas_agênticas | `rascunhar_parecer(consulta, modelo)`, `verificar_citacoes(documento)`, `enviar_para_assinatura(documento, signatario)`, `anexar_documento(cliente, documento)` |
| eventos_timesheet | `consultoria.parecer.rascunhado` (IA) ; `consultoria.parecer.revisado` (pessoa, duração) ; `consultoria.parecer.assinado` |
| fontes_descoberta | [I3] |

### CON-004 · Manter a base de conhecimento interna (pareceres, respostas e entendimentos do escritório)

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Consultoria / Gestão do conhecimento |
| atividade | Guardar, indexar e reaproveitar pareceres, respostas e "entendimentos da casa", com a vigência da norma em que se apoiam |
| descrição | Hoje fica em pastas, e-mails e na cabeça do sócio. Quando o analista sai, o conhecimento sai junto |
| gatilho_frequência | Contínua (a cada parecer/resposta) |
| porte_alcance | Escritório |
| quem_faz | Coordenador técnico |
| onde_é_feita_hoje | Pasta de rede, Drive, e-mail |
| entradas / saídas | Pareceres e respostas → base pesquisável, com tags (tema, norma, cliente, data) e status "vigente / revisar" |
| base_legal | — |
| risco_se_falhar | Orientações contraditórias; retrabalho |
| tempo_estimado | `[ESTIMATIVA]` 30 min/semana de curadoria |
| concorrentes | `[NÃO ENCONTRADO]` em gestores de escritório |
| hipótese_automação | Todo parecer e resposta aprovada entra no índice do M2 (texto do escritório) com ligação às normas citadas; o vigia da lei marca para revisão quando a norma muda (CON-005) |
| papel_da_ia | M2 **executar** a indexação; M1 ligar às normas |
| ferramentas_agênticas | `indexar_documento_escritorio(doc, tags)`, `buscar_entendimento(tema)` |
| eventos_timesheet | `consultoria.conhecimento.indexado` |
| fontes_descoberta | — (prática interna; validar com os contadores) |

### CON-005 · Revisar pareceres e orientações antigas quando a norma muda

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Consultoria / Gestão do conhecimento |
| atividade | Detectar normas novas que afetam pareceres, simulações e recomendações já entregues e avisar quem e quais clientes precisam de revisão |
| descrição | Ninguém faz de forma sistemática. Exemplos em 2026: prorrogação das janelas do Simples (Res. CGSN 194/2026) [S3]; alíquota CBS 2027 do TCU [S17]; liminares sobre LC 224 [S7]; LC 227 alterando a LC 214 [S1]. Cada uma invalida simulações e conselhos anteriores |
| gatilho_frequência | Por evento (publicação de norma ou decisão); verificação diária |
| porte_alcance | Clientes com parecer ou simulação afetados |
| quem_faz | Coordenador técnico |
| onde_é_feita_hoje | Notícias, grupos de WhatsApp, memória |
| entradas / saídas | Norma nova → lista de pareceres/simulações/clientes afetados + tarefa de revisão + rascunho de comunicado |
| base_legal | — |
| risco_se_falhar | Cliente decide com orientação superada |
| tempo_estimado | `[ESTIMATIVA]` 1–3 h/semana em período de reforma |
| concorrentes | `[NÃO ENCONTRADO]` (buscado: "monitoramento alteração legislação impacto clientes escritório contábil") |
| hipótese_automação | Vigia da lei: o M1 compara a norma nova com os dispositivos citados nos documentos do escritório; o M2 lista clientes; o M4 abre tarefas e rascunha avisos |
| papel_da_ia | M1 **ler** → M2 → M4 **rascunhar** tarefas e mensagens (aprovação em lote) |
| ferramentas_agênticas | `detectar_normas_novas(periodo)`, `listar_documentos_afetados(norma)`, `listar_clientes_afetados(norma)`, `criar_tarefas_lote(lista)` |
| eventos_timesheet | `consultoria.revisao.aberta` (norma, nº documentos, nº clientes) |
| fontes_descoberta | [S1] [S3] [S7] [S17] |

transversal: FIS-002 (prorrogação de prazos), CON-028, CON-038.

### CON-006 · Formular e acompanhar consulta formal ao Fisco

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Consultoria / Pareceres |
| atividade | Redigir consulta formal à RFB (ou à Sefaz/CGIBS) sobre interpretação da norma, protocolar e acompanhar a solução |
| descrição | Rara, usada quando a dúvida é relevante e não há solução de consulta publicada. Protocolo no e-CAC (e-processo) pelo contribuinte ou procurador. Com a reforma, deve crescer o uso, inclusive perante o CGIBS (processo administrativo do IBS regulado pela LC 227 [S1]) |
| gatilho_frequência | Rara, por evento |
| porte_alcance | Presumido/Real com operação de dúvida relevante |
| quem_faz | Sócio, coordenador técnico (às vezes com advogado) |
| onde_é_feita_hoje | Word + e-CAC (e-processo) |
| entradas / saídas | Fatos + dúvida → petição de consulta protocolada + acompanhamento até a solução |
| base_legal | Processo de consulta federal: IN RFB sobre consulta `[NÃO VERIFICADO]` (número da IN vigente não confirmado nesta sessão); IBS: LC 227/2026 [S1] |
| risco_se_falhar | Perda do efeito de proteção da consulta se mal formulada; decisão sem segurança |
| tempo_estimado | `[ESTIMATIVA]` 4–10 h para redigir |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Pesquisa prévia de soluções de consulta publicadas (M1), rascunho da petição, tarefa de protocolo e monitoramento do processo |
| papel_da_ia | M1 **ler** soluções existentes, **rascunhar** petição; protocolo manual ou robô (Etapa 2) |
| ferramentas_agênticas | `buscar_solucoes_consulta(tema)`, `rascunhar_consulta_formal(dados)`, `acompanhar_processo(numero)` |
| eventos_timesheet | `consultoria.consulta_formal.redigida` ; `.protocolada` ; `.respondida` |
| fontes_descoberta | [S1] |

### CON-007 · Orçar, contratar e faturar o serviço consultivo extra

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Consultoria / Comercial |
| atividade | Transformar uma demanda consultiva em proposta, aditivo contratual e cobrança separada da mensalidade |
| descrição | A tendência é separar escopo ordinário (rotina) e extraordinário (consultoria, transição da reforma) por aditivo, e incluir cláusula de reequilíbrio de honorários por exigência regulatória nova [I3]. Muitos escritórios ainda cobram planejamento dentro da mensalidade, sem critério de preço [I3]. A ASSCON publicou tabela 2026 com itens de reforma e serviços consultivos (Res. 03/2026, via notícia) [I3] |
| gatilho_frequência | Por evento; picos em out–jan e nas janelas de opção |
| porte_alcance | Todos |
| quem_faz | Sócio, comercial |
| onde_é_feita_hoje | Word, e-mail, planilha, sistema de cobrança |
| entradas / saídas | Demanda + horas estimadas + tabela de referência → proposta, aceite, aditivo assinado, cobrança |
| base_legal | Res. CFC 1.590/2020 (contrato de serviços contábeis, citada pela fonte) [I3] `[NÃO VERIFICADO]` no texto original |
| risco_se_falhar | Trabalho não cobrado; conflito com cliente sobre escopo |
| tempo_estimado | `[ESTIMATIVA]` 30–90 min por proposta |
| concorrentes | Guia de precificação da e-Auditoria para planejamento na reforma (conteúdo, não ferramenta) [I3]; módulos de proposta/contrato de gestores de escritório não confirmados nesta busca `[NÃO ENCONTRADO]` |
| hipótese_automação | Da consulta registrada (CON-001) marcada "extra", gerar proposta com horas estimadas pelo histórico do timesheet, enviar para aceite e assinatura, lançar a cobrança |
| papel_da_ia | M2 (histórico de horas, contrato) + M3 (preço) → **rascunhar** proposta; M4 **executar** envio após aprovação do sócio |
| ferramentas_agênticas | `estimar_horas(tipo_servico)`, `gerar_proposta(cliente, escopo)`, `enviar_para_assinatura(...)`, `lancar_cobranca(cliente, valor)` |
| eventos_timesheet | `comercial.proposta.gerada` ; `comercial.proposta.aceita` |
| fontes_descoberta | [I3] |

transversal: D7 (cobrança de honorários).

---

## B. Planejamento tributário

### CON-008 · Fazer o planejamento tributário anual (Simples × Presumido × Real)

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Consultoria / Planejamento tributário |
| atividade | Comparar a carga do próximo ano nos regimes possíveis, com os dados reais do cliente, e recomendar o regime |
| descrição | Em out–jan, o analista exporta faturamento, folha, compras e margem do core para planilha, projeta o ano e compara. Em 2026/2027 a comparação ganhou variáveis: LC 224/2025 (presunção +10% acima de R$ 5 mi) [S7], Lei 15.270/2025 (dividendos) [S8], CBS em 2027 com PIS/Cofins extintos [S20] e opção do Simples por fora [S2]. Para o Simples, a opção de 2027 já foi antecipada para set–out/2026 [S3], o que deslocou o calendário do planejamento |
| gatilho_frequência | Anual (para Simples, até a janela de opção; para Presumido/Real, até o 1º DARF do ano) + por evento (mudança relevante de faturamento ou margem) |
| porte_alcance | Todos os não MEI; prioridade para quem está perto de limites e para Presumido acima de R$ 5 mi |
| quem_faz | Analista sênior, coordenador, sócio |
| onde_é_feita_hoje | Planilha + core; simuladores de terceiros |
| entradas / saídas | Receita, folha, compras com crédito, margem, CNAE, sócios (12 meses + projeção) → comparativo por regime, recomendação, parecer (CON-003) |
| base_legal | LC 123/2006; Lei 9.430/1996 e Lei 9.718/1998 (opção pelo Presumido) [S19]; LC 224/2025 e IN RFB 2.305/2025 citada [S7]; LC 214/2025 [S20]; Lei 15.270/2025 [S8] |
| risco_se_falhar | Regime errado é irretratável no ano (Presumido) [S19] ou até a próxima janela (Simples); custo pode ser de vários pontos percentuais da receita |
| tempo_estimado | `[ESTIMATIVA]` 2–6 h por cliente/ano |
| concorrentes | LegisWeb tem Simulador de Planejamento Tributário com carga atual e pós-reforma [C7]; e-Auditoria projeta LR/LP até 2033 a partir de SPED [C1]; Contabilizei tem calculadora comparativa de regimes [C6] |
| hipótese_automação | Comparativo gerado pelo M3 com dados do core (M2), regras vigentes por data (M1), cenário com e sem reforma, sensibilidade (margem, folha, B2B/B2C); lote para toda a carteira com ranking de "clientes onde trocar compensa" |
| papel_da_ia | M2 → M1 → M3 → **rascunhar** recomendação e parecer; o modelo não faz conta |
| ferramentas_agênticas | `simular_regimes(cliente, ano, cenario)`, `ranquear_carteira_por_economia(ano)`, `rascunhar_parecer(...)` |
| eventos_timesheet | `consultoria.planejamento.simulado` (cliente, ano, IA) ; `.revisado` (pessoa, duração) ; `.apresentado` |
| fontes_descoberta | [S2] [S3] [S7] [S8] [S19] [S20] [C1] [C6] [C7] |

### CON-009 · Executar e comprovar a opção de regime

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Consultoria / Planejamento tributário |
| atividade | Formalizar a escolha feita no planejamento: pedido de exclusão ou opção no Portal do Simples, DARF da 1ª quota do Presumido com o código certo, opção pelo Real; guardar evidência e aceite do cliente |
| descrição | A opção pelo Presumido se manifesta com o pagamento da 1ª quota do IRPJ do 1º período de apuração e é irretratável no ano; não se retifica DARF para trocar o regime (IN SRF 672/2006 citada) [S19]. Saída do Simples pedida até o último dia útil de janeiro, segundo fonte secundária [S19] `[NÃO VERIFICADO]` na norma. Para 2027 a opção pelo Simples foi em set–out/2026 [S3] |
| gatilho_frequência | Anual (janeiro/primeiro DARF; janelas do Simples) + início de atividade |
| porte_alcance | Clientes que mudam ou confirmam regime |
| quem_faz | Analista fiscal, com aprovação do sócio |
| onde_é_feita_hoje | Portal do Simples, Sicalc/core, e-mail com o cliente |
| entradas / saídas | Decisão aprovada → protocolo/DARF + termo de ciência do cliente arquivado |
| base_legal | Lei 9.430/1996 art. 26 §1º; Lei 9.718/1998 art. 13 [S19]; LC 123/2006 e Res. CGSN [S3] |
| risco_se_falhar | Regime errado o ano inteiro; responsabilidade do escritório sem aceite documentado |
| tempo_estimado | `[ESTIMATIVA]` 20–40 min por cliente |
| concorrentes | `[NÃO ENCONTRADO]` controle específico de "aceite da opção" |
| hipótese_automação | Checklist por regime com prazo, termo de aceite enviado para assinatura, conferência do código de receita do DARF antes de pagar |
| papel_da_ia | M4 **rascunhar** termo e checklist; M3 conferir código e valor; execução da opção no portal: Etapa 2 decide (provável C-cert ou manual) |
| ferramentas_agênticas | `gerar_termo_opcao_regime(cliente, regime, ano)`, `conferir_darf_opcao(cliente)`, `registrar_opcao(cliente, regime, evidencia)` |
| eventos_timesheet | `consultoria.opcao_regime.formalizada` (cliente, regime, ano, aprovado por) |
| fontes_descoberta | [S3] [S19] |

transversal: FIS-014 (opção pelo Simples).

### CON-010 · Monitorar durante o ano os gatilhos de revisão do regime

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Consultoria / Planejamento tributário |
| atividade | Vigiar, mês a mês, sinais de que o regime escolhido deixou de ser o melhor ou vai ser forçado a mudar |
| descrição | Sinais: receita acumulada perto do limite de R$ 5 mi da LC 224 (verificação trimestral) [S7]; margem real muito abaixo da presunção (Real passa a valer); fator R mudando; perda de clientes B2B por falta de crédito no Simples [S10]; retiradas dos sócios perto de R$ 50 mil/mês [S8]. Hoje só aparece no planejamento anual, tarde demais |
| gatilho_frequência | Mensal (após fechamento) |
| porte_alcance | Todos os não MEI |
| quem_faz | Analista fiscal / contábil |
| onde_é_feita_hoje | Não é feito de forma sistemática |
| entradas / saídas | Dados mensais do core → alertas por cliente com o motivo e a ação sugerida |
| base_legal | LC 224/2025 [S7]; Lei 15.270/2025 [S8]; LC 123/2006 |
| risco_se_falhar | Carga maior que a necessária no ano seguinte; surpresa com acréscimo da LC 224 no 4º trimestre |
| tempo_estimado | `[ESTIMATIVA]` 5 min/cliente/mês se feito à mão |
| concorrentes | `[NÃO ENCONTRADO]` alerta de "revisão de regime" em gestores de escritório |
| hipótese_automação | Regras de alerta sobre os números do M2, calculadas pelo M3, com explicação pelo M1 |
| papel_da_ia | M2 + M3 **ler**; M1 explicar; M4 **rascunhar** tarefa ao responsável |
| ferramentas_agênticas | `avaliar_gatilhos_regime(cliente, competencia)`, `listar_alertas_regime(carteira)` |
| eventos_timesheet | `consultoria.alerta_regime.gerado` (cliente, gatilho) |
| fontes_descoberta | [S7] [S8] [S10] |

transversal: FIS-011 (sublimite do Simples), FIS-012 (fator R).

### CON-011 · Calcular o efeito da LC 224/2025 no Lucro Presumido e acompanhar o litígio

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Consultoria / Planejamento tributário |
| atividade | Medir por cliente o acréscimo de 10% nos percentuais de presunção sobre a receita acima do limite e orientar (pagar, depositar, discutir) conforme o andamento judicial |
| descrição | Acréscimo de 10% sobre o percentual de presunção só na parcela da receita bruta anual acima de R$ 5 mi (ex.: 32% → 35,2% sobre o excedente); receitas financeiras e ganhos de capital fora; verificação trimestral e ajuste no último trimestre (IN RFB 2.305/2025 citada) [S7]. Fonte cita limites diferentes por tributo (R$ 5 mi IRPJ e R$ 3,75 mi CSLL) `[NÃO VERIFICADO]`. Há ADI 7.920 e notícia de liminar suspendendo o acréscimo; status atual não confirmado [S7]. Divergência sobre anterioridade nonagesimal [S7] |
| gatilho_frequência | Trimestral + por evento judicial |
| porte_alcance | Presumido com receita próxima ou acima de R$ 5 mi/ano |
| quem_faz | Analista fiscal sênior, sócio (decisão sobre discutir) |
| onde_é_feita_hoje | Planilha |
| entradas / saídas | Receita acumulada por atividade → acréscimo estimado por trimestre + recomendação |
| base_legal | LC 224/2025; IN RFB 2.305/2025 [S7] |
| risco_se_falhar | Recolhimento a menor (autuação) ou a maior (caixa) |
| tempo_estimado | `[ESTIMATIVA]` 30 min/cliente/trimestre |
| concorrentes | Contmatic e Taxcel publicam conteúdo sobre o cálculo [S7]; ferramenta de escritório específica `[NÃO ENCONTRADO]` |
| hipótese_automação | Função de cálculo versionada no M3; monitoramento das ADIs no vigia (CON-013) |
| papel_da_ia | M3 cálculo; M1 regra e situação judicial; **rascunhar** orientação |
| ferramentas_agênticas | `calcular_acrescimo_lc224(cliente, trimestre)`, `situacao_judicial(norma)` |
| eventos_timesheet | `consultoria.lc224.calculado` |
| fontes_descoberta | [S7] |

### CON-012 · Planejar pró-labore, distribuição de lucros e a retenção da Lei 15.270/2025

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Consultoria / Planejamento tributário (sócios) |
| atividade | Definir com os sócios o calendário e o valor de retiradas (pró-labore × lucros) considerando a retenção de 10% acima de R$ 50 mil/mês por sócio e o IRPF mínimo anual |
| descrição | Desde 01/01/2026, lucros e dividendos pagos por uma empresa a uma mesma pessoa física acima de R$ 50 mil no mês têm retenção de 10%; fontes divergem se incide sobre o total ou só sobre o excedente (mais fontes indicam o total) [S8]. Divergência sobre alcance no Simples [S8]. Regra de transição para lucros apurados até 31/12/2025 com distribuição aprovada até essa data [S8]. IRPF mínimo para renda acima de R$ 600 mil/ano [S8]. ADIs 7.912, 7.914, 7.917 e 7.954 [S8] |
| gatilho_frequência | Anual (planejamento) + mensal (controle das retiradas) + evento (aprovação de distribuição) |
| porte_alcance | Clientes com sócios de retirada alta; Presumido/Real de serviços com margem alta |
| quem_faz | Sócio do escritório, analista contábil e DP |
| onde_é_feita_hoje | Planilha, conversa com o cliente |
| entradas / saídas | Lucro contábil disponível, retiradas por sócio, outras rendas (se informadas) → calendário de retiradas, DARF de retenção, ata/aprovação |
| base_legal | Lei 15.270/2025 [S8] |
| risco_se_falhar | Retenção não feita (responsabilidade da fonte pagadora), IRPF mínimo surpresa ao sócio |
| tempo_estimado | `[ESTIMATIVA]` 1–2 h por cliente/ano + 10 min/mês |
| concorrentes | `[NÃO ENCONTRADO]` em gestores de escritório |
| hipótese_automação | Controle mensal de retiradas por sócio com alerta antes de ultrapassar R$ 50 mil; simulação anual pró-labore × lucros (INSS, IRPF, retenção) |
| papel_da_ia | M2 (retiradas, lucro) + M1 + M3 → **rascunhar** plano; alerta automático (**ler**) |
| ferramentas_agênticas | `controlar_retiradas_socio(cliente, mes)`, `simular_prolabore_lucros(cliente, ano)` |
| eventos_timesheet | `consultoria.retiradas.simulado` ; `consultoria.retiradas.alerta` |
| fontes_descoberta | [S8] |

transversal: D5 (distribuição de lucros), D4 (pró-labore).

### CON-013 · Acompanhar teses e decisões judiciais e medir o impacto na carteira

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Consultoria / Inteligência tributária |
| atividade | Acompanhar ADIs, temas de repercussão geral e recursos repetitivos que afetam clientes e listar quem é atingido |
| descrição | Exemplos em 2026: ADI 7.920 (LC 224) [S7]; ADIs da Lei 15.270 [S8]; STF validou o limite de compensação da Lei 14.873/2024 (ADIs 7.587 e 7.609, set/2026) [S18]; constitucionalidade do art. 47 da LC 214 debatida [S10]. Hoje depende de leitura de notícias |
| gatilho_frequência | Semanal + por evento |
| porte_alcance | Clientes do perfil afetado |
| quem_faz | Sócio, coordenador técnico |
| onde_é_feita_hoje | Notícias, newsletters de escritórios de advocacia |
| entradas / saídas | Decisão → resumo, clientes afetados, ação (aproveitar, provisionar, avisar) |
| base_legal | — |
| risco_se_falhar | Perda de prazo de ação/recuperação; cliente fica sabendo por terceiros |
| tempo_estimado | `[ESTIMATIVA]` 1–2 h/semana |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Vigia judicial ligado ao M1 (status de norma "suspensa/questionada") e ao M2 (clientes afetados) |
| papel_da_ia | M1 **ler**; M2; M4 **rascunhar** avisos |
| ferramentas_agênticas | `monitorar_decisoes(temas)`, `listar_clientes_afetados(decisao)` |
| eventos_timesheet | `consultoria.decisao.analisada` |
| fontes_descoberta | [S7] [S8] [S10] [S18] |

### CON-014 · Analisar reorganização societária com finalidade tributária

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Consultoria / Planejamento tributário |
| atividade | Avaliar holding, cisão, separação de atividades ou mudança de sócio pessoa física para jurídica, com os efeitos no IR, nos dividendos (Lei 15.270) e na reforma |
| descrição | Rara mas crítica; normalmente com advogado. Ganhou procura com a Lei 15.270 e com o fim do Simples atrativo para quem vende a empresas [S8][S10] |
| gatilho_frequência | Rara, por evento |
| porte_alcance | Clientes maiores, grupos familiares |
| quem_faz | Sócio, advogado parceiro |
| onde_é_feita_hoje | Planilha, Word |
| entradas / saídas | Estrutura atual e objetivo → cenários com carga e riscos (inclusive de planejamento abusivo) → parecer |
| base_legal | Diversas `[NÃO VERIFICADO]`; Lei 15.270/2025 [S8] |
| risco_se_falhar | Autuação por planejamento sem propósito negocial; custo de reversão |
| tempo_estimado | `[ESTIMATIVA]` 10–40 h por projeto |
| concorrentes | `[NÃO ENCONTRADO]` em gestores de escritório |
| hipótese_automação | Organizar o projeto (tarefas, documentos); M3 para os cenários numéricos; M1 para riscos citados |
| papel_da_ia | **rascunhar** cenários; decisão humana |
| ferramentas_agênticas | `simular_estrutura_societaria(cenarios)`, `abrir_projeto(cliente, tipo)` |
| eventos_timesheet | `consultoria.projeto.reorganizacao` (horas por etapa) |
| fontes_descoberta | [S8] [S10] |

transversal: D1 (alteração societária).

---

## C. Reforma tributária

### CON-015 · Triar a carteira: quais clientes ganham e quais perdem com a reforma

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Consultoria / Reforma — diagnóstico |
| atividade | Classificar todos os clientes por exposição à reforma (setor, regime, B2B/B2C, regime específico, IS, saldos credores, benefícios fiscais) para priorizar o trabalho consultivo |
| descrição | Hoje feito "de cabeça" ou nem feito: 56% dos contadores sem plano de ação [I1]. Escritório não sabe por onde começar nem a quem oferecer o serviço |
| gatilho_frequência | Uma vez + revisões semestrais (alinhadas às janelas do Simples) e a cada norma relevante |
| porte_alcance | Toda a carteira |
| quem_faz | Sócio, coordenador |
| onde_é_feita_hoje | Planilha ou não é feita |
| entradas / saídas | Perfil temporal (CNAE, regime, UF), mix de clientes do cliente (CNPJ x CPF nas NF-e de saída), NCMs, saldos credores → matriz de prioridade e lista de ações por cliente |
| base_legal | LC 214/2025, LC 227/2026 [S1] |
| risco_se_falhar | Clientes críticos atendidos tarde; perda de receita consultiva |
| tempo_estimado | `[ESTIMATIVA]` 15–30 min por cliente se manual |
| concorrentes | `[NÃO ENCONTRADO]` triagem de carteira; simuladores são cliente a cliente [C1][C2] |
| hipótese_automação | Score de exposição calculado em lote a partir dos dados do M2 (XMLs, perfil), com explicação de cada fator |
| papel_da_ia | M2 + M3 **ler**; M1 explicar; M4 **rascunhar** plano de abordagem |
| ferramentas_agênticas | `calcular_exposicao_reforma(cliente)`, `ranquear_carteira_reforma()`, `percentual_vendas_b2b(cliente, periodo)` |
| eventos_timesheet | `consultoria.reforma.triagem` (nº clientes) |
| fontes_descoberta | [I1] [S1] [C1] [C2] |

### CON-016 · Simular a carga de CBS, IBS e IS por cliente, ano a ano, de 2026 a 2033

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Consultoria / Reforma — simulação |
| atividade | Projetar a carga do cliente em cada ano da transição comparando com os tributos atuais, com os dados reais de 12 meses |
| descrição | Transição: 2026 teste (CBS 0,9% e IBS 0,1%, dispensa de recolhimento para quem cumpre obrigações acessórias) [S9]; 2027 CBS cheia e fim de PIS/Cofins, IS começa, IPI zerado salvo ZFM [S20]; 2027–2028 IBS 0,1% [S20]; 2029–2032 ICMS/ISS caem a 90/80/70/60% e IBS sobe [S20]; 2033 sistema pleno [S20]. CBS 2027 de referência 11,3% (TCU, pendente Senado) [S17]. Escritórios já usam simuladores sobre SPED (e-Auditoria, Lucro Real/Presumido) [C1] e XML (Simples) [C2] |
| gatilho_frequência | Por projeto + anual + a cada alíquota de referência nova |
| porte_alcance | Todos; prioridade dos triados em CON-015 |
| quem_faz | Analista sênior, coordenador |
| onde_é_feita_hoje | Planilha, simuladores de terceiros |
| entradas / saídas | XMLs de entrada/saída, EFD, folha, NCM/cClassTrib, alíquotas de referência e reduções → tabela ano a ano, gráfico, premissas e relatório ao cliente |
| base_legal | EC 132/2023; LC 214/2025 (arts. 343 e ss. para transição; art. 349 e ss. para alíquotas de referência) [S9][S23]; LC 227/2026 [S1] |
| risco_se_falhar | Decisão empresarial (preço, regime, investimento) baseada em número errado |
| tempo_estimado | `[ESTIMATIVA]` 2–8 h por cliente |
| concorrentes | e-Auditoria (SPED, LR/LP até 2033) [C1] e (XML, Simples) [C2]; Alterdata simulador IBS/CBS para Simples no Fiscal [C4]; LegisWeb [C7]; CLM Controller (inclui "Simples híbrido") [C8]; Contabilizei [C6]; Senior (ERP) [C9]; CNA calculadora para o agro [C14]; Domínio/Thomson Reuters: `[NÃO ENCONTRADO]` simulador de IBS/CBS [C12] |
| hipótese_automação | Motor de simulação no M3, com tabela versionada de alíquotas por ano e estado (provisória/definitiva), conferência item a item pela Calculadora de Tributos da RFB [S5]; relatório ao cliente gerado e explicado |
| papel_da_ia | M2 (dados) → M1 (regra vigente por ano) → M3 (cálculo) → **rascunhar** relatório |
| ferramentas_agênticas | `simular_reforma(cliente, anos, cenario)`, `tabela_aliquotas_referencia(ano)`, `conferir_calculo_rfb(item)`, `gerar_relatorio_simulacao(cliente)` |
| eventos_timesheet | `consultoria.reforma.simulacao` (cliente, IA/pessoa, duração) ; `.relatorio_enviado` |
| fontes_descoberta | [S1] [S5] [S9] [S17] [S20] [S23] [C1] [C2] [C4] [C6] [C7] [C8] [C9] [C12] [C14] |

### CON-017 · Recomendar a opção semestral do Simples pelo regime regular de IBS/CBS ("Simples por fora")

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Consultoria / Reforma — Simples |
| atividade | Para cada optante do Simples, decidir se compensa recolher IBS/CBS pelo regime regular (gerando crédito integral ao comprador) ou dentro do DAS, e registrar a decisão e o aceite |
| descrição | Res. CGSN 186/2026 criou a opção para jan–jun/2027; Res. CGSN 194/2026 levou o prazo a 30/10/2026; cancelamento até o fim de novembro/2026 [S2][S3]. Próxima janela citada: 1–31/03/2027 para o 2º semestre [S4] `[NÃO VERIFICADO]` na norma. Sem a opção, o optante não apropria créditos de IBS/CBS e o crédito do comprador fica limitado ao recolhido no Simples (art. 47 §9º e arts. 155–156 citados; fontes divergem no detalhe) [S10]. A decisão depende de quanto o cliente vende a contribuintes que tomam crédito |
| gatilho_frequência | Semestral (janelas) + cancelamento até fim de novembro |
| porte_alcance | Optantes do Simples, sobretudo B2B e com compras relevantes com crédito |
| quem_faz | Analista sênior, sócio |
| onde_é_feita_hoje | Planilha, simulador de terceiros, conversa |
| entradas / saídas | Vendas por tipo de destinatário, compras com crédito, margem → comparação "por dentro × por fora", recomendação, termo de aceite |
| base_legal | LC 123/2006 alterada pela LC 214/2025; Res. CGSN 186/2026 e 194/2026 [S2][S3] |
| risco_se_falhar | Perda de clientes B2B ou carga maior; opção perdida até a próxima janela |
| tempo_estimado | `[ESTIMATIVA]` 1–3 h por cliente |
| concorrentes | CLM Controller simula "Simples híbrido" [C8]; Alterdata simulador IBS/CBS no Simples [C4]; e-Auditoria simulador Simples [C2]; Econet simulador Simples na reforma [C10] |
| hipótese_automação | Simulação em lote para todos os optantes antes de cada janela, com ranking e rascunho de recomendação; prazo e cancelamento no calendário; termo de aceite assinado |
| papel_da_ia | M2 → M1 → M3 → **rascunhar**; execução da opção: ver FIS-015 (Etapa 2) |
| ferramentas_agênticas | `simular_simples_por_fora(cliente, semestre)`, `ranquear_optantes_por_fora(semestre)`, `gerar_termo_opcao(cliente)` |
| eventos_timesheet | `consultoria.simples_por_fora.simulado` ; `.decidido` (cliente, opção, aprovado por) |
| fontes_descoberta | [S2] [S3] [S4] [S10] [C2] [C4] [C8] [C10] |

transversal: FIS-015 (execução da opção).

### CON-018 · Analisar fornecedores e clientes do cliente quanto a crédito (cadeia)

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Consultoria / Reforma — créditos |
| atividade | Mapear o regime de cada fornecedor relevante e o crédito de IBS/CBS que gera, e recomendar troca, renegociação de preço ou cláusula contratual |
| descrição | Crédito condicionado à extinção do débito pelo fornecedor (art. 47 da LC 214), com dispensa enquanto split payment e recolhimento pelo adquirente não estiverem implantados (art. 48 citado) [S10]. Fornecedor do Simples sem opção pelo regular gera crédito limitado [S10]. Análise feita hoje, quando feita, em planilha de XMLs |
| gatilho_frequência | Por projeto + semestral |
| porte_alcance | Clientes do regime regular (Presumido/Real) e Simples por fora |
| quem_faz | Analista sênior |
| onde_é_feita_hoje | Planilha, consulta CNPJ manual |
| entradas / saídas | XMLs de entrada (fornecedor, valores), regime do fornecedor na data → ranking de fornecedores por crédito perdido, custo efetivo, recomendação |
| base_legal | LC 214/2025 arts. 47, 48, 155–156 (citados) [S10] |
| risco_se_falhar | Custo maior por crédito perdido; glosa de crédito |
| tempo_estimado | `[ESTIMATIVA]` 2–4 h por cliente |
| concorrentes | Qive: Portal de Fornecedores sinaliza regime, quantifica risco de crédito IBS/CBS e cria trilha no ERP [C5]; e-Auditoria cruza XMLs de entrada com perfil do fornecedor e calcula crédito por NCM/CFOP [C2] |
| hipótese_automação | A plataforma já tem os XMLs (D3) e consulta de CNPJ: cálculo de custo efetivo por fornecedor e relatório com recomendação |
| papel_da_ia | M2 → M3 → **rascunhar** recomendação |
| ferramentas_agênticas | `mapear_regime_fornecedores(cliente, periodo)`, `custo_efetivo_fornecedor(cliente, fornecedor)` |
| eventos_timesheet | `consultoria.fornecedores.analisado` |
| fontes_descoberta | [S10] [C2] [C5] |

transversal: D3 (XML de entrada), D1 (consulta CNPJ).

### CON-019 · Revisar a formação de preço do cliente para o novo modelo (tributo "por fora")

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Consultoria / Reforma — preço |
| atividade | Recalcular preço e margem com IBS/CBS fora do preço, crédito nas compras e redução gradual de ICMS/ISS |
| descrição | Com IBS/CBS não compondo a receita e sendo recuperáveis, a lógica de markup muda (APET sobre contabilização) [I4]. Concorrente oferece "ferramenta de precificação para a reforma" [C3]. Hoje, quando feito, em planilha do cliente |
| gatilho_frequência | Por projeto; antes de 2027 e em cada degrau 2029–2033 |
| porte_alcance | Comércio, indústria, serviços B2B |
| quem_faz | Analista sênior, consultor |
| onde_é_feita_hoje | Planilha |
| entradas / saídas | Custo, margem desejada, tributos por ano → tabela de preço por ano e por produto/serviço |
| base_legal | LC 214/2025 |
| risco_se_falhar | Perda de margem ou de competitividade |
| tempo_estimado | `[ESTIMATIVA]` 3–10 h por cliente |
| concorrentes | e-Auditoria (precificação na reforma) [C3] |
| hipótese_automação | Calculadora de preço do M3 por produto, usando a simulação (CON-016) |
| papel_da_ia | M3; **rascunhar** relatório |
| ferramentas_agênticas | `simular_preco_reforma(cliente, itens, ano)` |
| eventos_timesheet | `consultoria.preco.simulado` |
| fontes_descoberta | [I4] [C3] |

### CON-020 · Revisar o cadastro de produtos e serviços do cliente (NCM, NBS, CST IBS/CBS, cClassTrib, anexos)

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Consultoria / Reforma — cadastro |
| atividade | Conferir NCM e classificar cada item com CST de IBS/CBS (3 dígitos) e cClassTrib (6 dígitos), identificando reduções (60%, 30%), alíquota zero (cesta básica, Anexo I) e regimes |
| descrição | O mesmo NCM pode ter cClassTrib diferente conforme operação e destinatário (ex.: sal em Anexo I, Anexo IX e diferimento) [S14]. Anexo I com 26 itens e 264 NCMs, lista taxativa, alterada pela LC 227 segundo uma fonte [S14]. Feito item a item em planilha exportada do ERP do cliente, muitas vezes com milhares de itens |
| gatilho_frequência | Projeto inicial + por evento (produto novo, tabela cClassTrib nova, norma) |
| porte_alcance | Comércio e indústria; serviços (NBS) |
| quem_faz | Analista fiscal |
| onde_é_feita_hoje | Planilha, buscadores de NCM, ERP do cliente |
| entradas / saídas | Lista de itens (código, descrição, NCM, GTIN) → NCM conferido, CST, cClassTrib, base legal, divergências |
| base_legal | LC 214/2025 Anexos; tabela de classificação tributária do Portal NF-e `[NÃO VERIFICADO]` (não aberta nesta sessão) [S14] |
| risco_se_falhar | Destaque errado na nota, crédito indevido, perda de redução |
| tempo_estimado | `[ESTIMATIVA]` 1–2 min por item; 10–40 h por cliente com catálogo grande |
| concorrentes | e-Auditoria: consulta em lote por NCM/GTIN e monitoramento de alterações [C3]; buscadores NCM×cClassTrib (TaxRadar, Buscador NCM) [C15] |
| hipótese_automação | Classificação em lote: M1 propõe cClassTrib com o dispositivo do anexo; analista revisa só os casos ambíguos; exportação no leiaute do ERP/core |
| papel_da_ia | M1 **rascunhar** classificação com citação; M2 histórico do cliente; aprovação humana por item ou lote |
| ferramentas_agênticas | `classificar_itens_reforma(cliente, itens)`, `explicar_classificacao(item)`, `exportar_cadastro(cliente, leiaute)` |
| eventos_timesheet | `consultoria.cadastro.classificado` (nº itens, IA/pessoa) ; `.revisado` |
| fontes_descoberta | [S14] [C3] [C15] |

transversal: NFE-023, NFE-030 (conferência nas notas), FIS-045.

### CON-021 · Enquadrar o cliente em regime específico e mapear as regras próprias

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Consultoria / Reforma — regimes específicos |
| atividade | Identificar se o cliente está em regime específico (bares e restaurantes, hotelaria, imóveis, saúde, financeiro, cooperativas etc.) e mapear alíquota, vedações de crédito e obrigações (DeRE) |
| descrição | Bares/restaurantes: arts. 273–276, redução citada de 40%, bebidas alcoólicas fora, vedação de crédito ao adquirente (art. 276) [S21]. Hotelaria: arts. 277–283 [S21]. Imóveis: redutor social de R$ 100 mil por unidade residencial e R$ 30 mil por lote; locação residencial por PF fora do campo [S21]; percentuais divergem entre fontes (40% × 50%) [S21]. Fonte de curso cita 11 regimes específicos, três com DeRE obrigatória [S21] `[NÃO VERIFICADO]` |
| gatilho_frequência | Uma vez por cliente + por evento (nova atividade, norma) |
| porte_alcance | Clientes dos setores listados |
| quem_faz | Analista sênior, sócio |
| onde_é_feita_hoje | Pesquisa manual |
| entradas / saídas | CNAE, atividades reais, receitas → enquadramento, regras e obrigações, alertas no perfil |
| base_legal | LC 214/2025 arts. 273–291 e capítulo de imóveis (citados) [S21] |
| risco_se_falhar | Alíquota errada; crédito vedado tomado; obrigação acessória omitida |
| tempo_estimado | `[ESTIMATIVA]` 1–3 h por cliente |
| concorrentes | `[NÃO ENCONTRADO]` em ferramentas de escritório |
| hipótese_automação | Regra no perfil temporal: CNAE e atividade → regime específico sugerido, com citação; obrigações próprias entram no calendário (D2) |
| papel_da_ia | M2 + M1 **rascunhar** enquadramento; aprovação do coordenador |
| ferramentas_agênticas | `sugerir_regime_especifico(cliente)`, `regras_regime_especifico(regime, data)` |
| eventos_timesheet | `consultoria.regime_especifico.enquadrado` |
| fontes_descoberta | [S21] |

### CON-022 · Avaliar o Imposto Seletivo para os clientes afetados

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Consultoria / Reforma — IS |
| atividade | Identificar clientes que produzem, importam ou extraem bens do IS e simular cenários de alíquota |
| descrição | IS cobrado a partir de 2027, uma única vez na cadeia; lista na LC 214 (fumígenos, alcoólicas, açucaradas, veículos, embarcações, aeronaves, bens minerais); alíquotas por lei ordinária, ainda não fixadas; teto de 2% das açucaradas retirado; propostas de 250% para cigarros, 46–62% alcoólicas, 32% açucaradas são **propostas**; envio da MP adiado segundo fontes [S15] |
| gatilho_frequência | Por evento (fixação das alíquotas) + anual |
| porte_alcance | Indústria e importação desses bens; mineração |
| quem_faz | Sócio, analista sênior |
| onde_é_feita_hoje | Planilha |
| entradas / saídas | Volume e preço dos produtos → cenários de IS e efeito em preço |
| base_legal | LC 214/2025 (IS); lei ordinária/MP de alíquotas `[NÃO ENCONTRADO]` publicada até 05/11/2026 [S15] |
| risco_se_falhar | Preço defasado em 2027 |
| tempo_estimado | `[ESTIMATIVA]` 2–4 h por cliente |
| concorrentes | Calculadora RFB calcula IS [S5] |
| hipótese_automação | Cenários no M3 com "alíquota a definir"; alerta automático quando a lei sair |
| papel_da_ia | M1 + M3; **rascunhar** |
| ferramentas_agênticas | `simular_is(cliente, cenarios)` |
| eventos_timesheet | `consultoria.is.simulado` |
| fontes_descoberta | [S5] [S15] |

### CON-023 · Projetar o efeito do split payment no caixa do cliente e orientar a adesão

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Consultoria / Reforma — split payment |
| atividade | Estimar quanto do recebimento passará a ser retido na liquidação, o efeito no capital de giro e orientar se e quando aderir |
| descrição | Split payment começa em 2027, facultativo e por etapas, foco B2B; ferramenta não completa em janeiro/2027; testes em 2026; obrigatoriedade B2B citada para 2028 por uma fonte; atos normativos ainda por publicar [S6] |
| gatilho_frequência | Por projeto; revisar a cada ato normativo |
| porte_alcance | Regime regular, B2B; recebimentos por meios eletrônicos |
| quem_faz | Consultor, sócio |
| onde_é_feita_hoje | Não é feito |
| entradas / saídas | Recebimentos por meio de pagamento, prazos, créditos → curva de caixa com e sem split, necessidade de capital de giro |
| base_legal | LC 214/2025 (split payment); atos da RFB/CGIBS `[NÃO ENCONTRADO]` (buscado: "split payment ato normativo Receita 2026") [S6] |
| risco_se_falhar | Falta de caixa do cliente |
| tempo_estimado | `[ESTIMATIVA]` 2–6 h por cliente |
| concorrentes | Omie publica conteúdo de cronograma e caixa [S6]; ferramenta de escritório `[NÃO ENCONTRADO]` |
| hipótese_automação | Projeção de caixa do M3 com base em extratos (D5) e vendas (D3) |
| papel_da_ia | M2 + M3; **rascunhar** |
| ferramentas_agênticas | `projetar_caixa_split(cliente, meses)` |
| eventos_timesheet | `consultoria.split.projetado` |
| fontes_descoberta | [S6] |

### CON-024 · Revisar contratos e cláusulas de preço do cliente para a reforma

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Consultoria / Reforma — contratos |
| atividade | Levantar contratos de longo prazo do cliente (fornecimento, locação, serviços, contratos públicos), identificar cláusulas de tributo e reajuste e apoiar pedidos de reequilíbrio |
| descrição | Arts. 373–376 da LC 214: reequilíbrio para contratos administrativos (art. 374), revisão de ofício (art. 375), pedido do contratado com planilha de impacto e decisão em 90 dias, com reequilíbrio provisório (art. 376) [S13]. Art. 373 §2º exclui contratos privados, que seguem a legislação própria [S13]. Imprensa indica revisão de contratos como urgência de 2026 [S13] |
| gatilho_frequência | Por projeto; antes de cada degrau da transição |
| porte_alcance | Fornecedores do poder público, concessionárias, clientes com contratos longos |
| quem_faz | Consultor, advogado parceiro |
| onde_é_feita_hoje | Leitura manual de contratos |
| entradas / saídas | Contratos (PDF) → inventário de cláusulas tributárias, impacto estimado, minuta de pedido/aditivo |
| base_legal | LC 214/2025 arts. 373–376 [S13]; Lei 14.133/2021 art. 124 citada [S13] |
| risco_se_falhar | Contrato desequilibrado por anos |
| tempo_estimado | `[ESTIMATIVA]` 30–60 min por contrato |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Leitura dos contratos pela IA para extrair cláusulas e datas; M3 para a planilha de impacto exigida pelo art. 376 |
| papel_da_ia | M2 (documentos) **ler**; M1; M3; **rascunhar** pedido |
| ferramentas_agênticas | `extrair_clausulas_tributarias(contrato)`, `calcular_impacto_contrato(contrato, anos)`, `rascunhar_pedido_reequilibrio(...)` |
| eventos_timesheet | `consultoria.contratos.revisados` (nº contratos) |
| fontes_descoberta | [S13] |

### CON-025 · Planejar o aproveitamento dos saldos de PIS/Cofins antes da extinção

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Consultoria / Reforma — créditos de transição |
| atividade | Garantir que todos os créditos de PIS/Cofins estejam registrados até 31/12/2026 e planejar o uso do saldo (CBS, compensação, ressarcimento) e do crédito presumido de estoque |
| descrição | Arts. 378–383 da LC 214: crédito precisa estar registrado na EFD-Contribuições até 31/12/2026; saldo usado contra CBS, compensação com outros tributos federais ou ressarcimento; saldo antigo consumido antes do novo; crédito presumido de estoque com data-limite citada de 30/06/2027 e uso em 12 parcelas contra a CBS [S12]. Controvérsia sobre o termo inicial do prazo de 5 anos [S12] |
| gatilho_frequência | **Urgente até 31/12/2026**; depois mensal até esgotar |
| porte_alcance | Lucro Real (não cumulativo) e quem tem créditos extemporâneos |
| quem_faz | Analista fiscal sênior |
| onde_é_feita_hoje | EFD-Contribuições + planilha |
| entradas / saídas | EFD-Contribuições, créditos extemporâneos, estoque → lista do que falta registrar, cronograma de uso |
| base_legal | LC 214/2025 arts. 378–383 [S12] |
| risco_se_falhar | **Perda definitiva** do crédito não registrado |
| tempo_estimado | `[ESTIMATIVA]` 2–8 h por cliente |
| concorrentes | e-Auditoria levanta créditos de PIS/Cofins [C3] (não encontrado módulo específico de transição) |
| hipótese_automação | Varredura das EFD do cliente por créditos não tomados; checklist com prazo; alerta na carteira |
| papel_da_ia | M2 + M3 **ler**; M1; M4 **rascunhar** tarefas e aviso |
| ferramentas_agênticas | `levantar_creditos_pis_cofins(cliente, periodo)`, `cronograma_uso_saldo(cliente)` |
| eventos_timesheet | `consultoria.saldo_pis_cofins.levantado` |
| fontes_descoberta | [S12] [C3] |

### CON-026 · Planejar o saldo credor de ICMS na transição

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Consultoria / Reforma — créditos de transição |
| atividade | Levantar o saldo credor de ICMS, avaliar monetização antes de 2033 (transferência, ressarcimento estadual) e preparar a homologação para compensar com IBS |
| descrição | Pedido de homologação em até 5 anos contados de 01/01/2033; Estado se pronuncia em até 24 meses; uso a partir de 01/02/2033; atualização por IPCA desde dez/2032; ressarcimento pelo CGIBS como alternativa (LC 227/2026, arts. 32 e ss. e 133–139 citados) [S11]. Fontes de 2025 citam 240 parcelas na redação anterior [S11] |
| gatilho_frequência | Anual (acompanhar) + projeto de monetização |
| porte_alcance | Exportadores, indústrias, atacadistas com crédito acumulado |
| quem_faz | Sócio, consultor |
| onde_é_feita_hoje | Planilha, EFD ICMS/IPI |
| entradas / saídas | EFD ICMS/IPI, conta-corrente estadual → saldo por UF, plano de monetização, dossiê para homologação |
| base_legal | LC 227/2026 (citada) [S11] |
| risco_se_falhar | Crédito parado por anos ou perdido por documentação insuficiente |
| tempo_estimado | `[ESTIMATIVA]` 4–20 h por cliente |
| concorrentes | `[NÃO ENCONTRADO]` em ferramentas de escritório |
| hipótese_automação | Painel do saldo por cliente/UF, com dossiê documental sendo montado ao longo dos anos |
| papel_da_ia | M2 + M3 **ler**; M1; **rascunhar** plano |
| ferramentas_agênticas | `saldo_credor_icms(cliente, uf)`, `montar_dossie_homologacao(cliente)` |
| eventos_timesheet | `consultoria.saldo_icms.acompanhado` |
| fontes_descoberta | [S11] |

transversal: FIS-043 (ressarcimento ICMS-ST).

### CON-027 · Planejar a transição ICMS/ISS → IBS e a perda gradual de benefícios fiscais

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Consultoria / Reforma — transição 2029–2032 |
| atividade | Medir por cliente o efeito da queda gradual de ICMS/ISS e da redução proporcional dos benefícios fiscais estaduais e municipais |
| descrição | 2029–2032: ICMS e ISS a 90/80/70/60% da alíquota, IBS crescendo; benefícios (isenções, reduções de base, créditos presumidos) reduzidos na mesma proporção [S20]. Clientes com incentivo estadual perdem vantagem competitiva |
| gatilho_frequência | Anual (a partir de 2027) |
| porte_alcance | Clientes com benefício fiscal de ICMS/ISS |
| quem_faz | Sócio, consultor |
| onde_é_feita_hoje | Não é feito ainda |
| entradas / saídas | Benefícios usados (termos de acordo, apuração) → impacto por ano |
| base_legal | EC 132/2023; LC 214/2025 [S20] |
| risco_se_falhar | Decisão de investimento/localização errada |
| tempo_estimado | `[ESTIMATIVA]` 2–6 h por cliente |
| concorrentes | Simuladores de carga até 2033 [C1] |
| hipótese_automação | Parte da simulação CON-016, com cadastro dos benefícios do cliente no perfil temporal |
| papel_da_ia | M2 + M3; **rascunhar** |
| ferramentas_agênticas | `simular_reforma(...)` (cenário benefícios), `registrar_beneficio_fiscal(cliente, beneficio)` |
| eventos_timesheet | `consultoria.transicao_beneficios.simulado` |
| fontes_descoberta | [S20] [C1] |

### CON-028 · Manter as tabelas de alíquotas e regras da reforma usadas nas simulações

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Consultoria / Reforma — parâmetros |
| atividade | Atualizar alíquotas de referência, reduções, redutores e cronograma usados pelo escritório, com data e estado (proposta, calculada pelo TCU, fixada pelo Senado) |
| descrição | Senado fixa as alíquotas de referência por resolução, com cálculo do Executivo/CGIBS validado pelo TCU; CBS de 2027 a 2033 e IBS de 2029 a 2033 (art. 349 citado) [S23]; CBS 2027: TCU 11,3% e redutor de 44,2% para compras governamentais, Senado até 15/12/2026 [S17]. Hoje cada analista usa números diferentes tirados de notícia |
| gatilho_frequência | Por evento (anual) |
| porte_alcance | Escritório (afeta todas as simulações) |
| quem_faz | Coordenador técnico |
| onde_é_feita_hoje | Planilhas espalhadas |
| entradas / saídas | Atos do TCU/Senado/CGIBS → tabela versionada; simulações antigas marcadas para recálculo |
| base_legal | LC 214/2025 art. 349 e ss. [S23] |
| risco_se_falhar | Simulações inconsistentes entre clientes |
| tempo_estimado | `[ESTIMATIVA]` 1 h por atualização |
| concorrentes | Calculadora RFB se atualiza sozinha [S5] |
| hipótese_automação | Tabela central do M3 alimentada pelo vigia da lei, com aprovação; disparo de CON-005 |
| papel_da_ia | M1 **ler** atos; M4 **rascunhar** atualização (aprovação obrigatória: tabela de cálculo fora da área editável da IA) |
| ferramentas_agênticas | `propor_atualizacao_tabela(ato)`, `aprovar_tabela(versao)` |
| eventos_timesheet | `consultoria.tabela.atualizada` |
| fontes_descoberta | [S5] [S17] [S23] |

### CON-029 · Orientar MEI e nanoempreendedores sobre a reforma

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Consultoria / Reforma — pequenos |
| atividade | Explicar a clientes MEI e pessoas físicas que vendem pouco o enquadramento como nanoempreendedor (até R$ 40,5 mil/ano), o que muda e quando migrar |
| descrição | Nanoempreendedor: pessoa física com receita até R$ 40.500/ano (metade do limite do MEI), não contribuinte de IBS/CBS; IR continua; exigência de CNPJ e nota ainda em definição [S22] |
| gatilho_frequência | Por evento (pergunta, onboarding) |
| porte_alcance | MEI, autônomos, prospects |
| quem_faz | Atendimento, analista |
| onde_é_feita_hoje | WhatsApp |
| entradas / saídas | Faturamento e atividade → orientação padronizada |
| base_legal | LC 214/2025 (art. 26 citado por PL) [S22] |
| risco_se_falhar | Orientação errada em volume |
| tempo_estimado | `[ESTIMATIVA]` 10–20 min por atendimento |
| concorrentes | Sebrae publica orientação [S22] |
| hipótese_automação | Resposta padrão do M1 com perfil do M2; alto volume, baixo risco |
| papel_da_ia | M1 + M2 **rascunhar**; envio com aprovação ou modelo pré-aprovado |
| ferramentas_agênticas | `consultar_legislacao(...)`, `enviar_mensagem(...)` |
| eventos_timesheet | `consultoria.orientacao_mei.enviada` |
| fontes_descoberta | [S22] |

### CON-030 · Comunicar a carteira sobre a reforma e registrar a ciência dos clientes

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Consultoria / Reforma — comunicação |
| atividade | Enviar comunicados segmentados (por regime, setor, UF) sobre prazos e mudanças, colher ciência e agendar reuniões com quem precisa decidir |
| descrição | Hoje: lista de transmissão de WhatsApp ou e-mail igual para todos, sem registro de quem leu. Ex.: janela do Simples por fora e cancelamento até fim de novembro/2026 [S3]; registro de créditos de PIS/Cofins até 31/12/2026 [S12]; ano de teste e destaque nas notas [S9] |
| gatilho_frequência | Por evento (norma, janela) + mensal |
| porte_alcance | Segmentos afetados |
| quem_faz | Atendimento, sócio |
| onde_é_feita_hoje | WhatsApp, e-mail, webinar |
| entradas / saídas | Norma + segmento → mensagens personalizadas, ciência registrada, reuniões agendadas |
| base_legal | — |
| risco_se_falhar | Cliente perde prazo e responsabiliza o escritório; não há prova de que foi avisado |
| tempo_estimado | `[ESTIMATIVA]` 2–4 h por campanha |
| concorrentes | Multiatendimento dos gestores (envio em massa) — sem segmentação por regra legal `[NÃO ENCONTRADO]` |
| hipótese_automação | Exemplo do Plano 1.5: M1 (o que muda) → M2 (quem é afetado) → M4 (mensagem por cliente, aprovação em lote) + registro de leitura |
| papel_da_ia | M1 + M2 + M4 **rascunhar** e **executar** após aprovação em lote |
| ferramentas_agênticas | `segmentar_clientes(regra)`, `rascunhar_comunicado(norma, segmento)`, `enviar_lote(mensagens)`, `registrar_ciencia(cliente, comunicado)` |
| eventos_timesheet | `consultoria.comunicado.enviado` (nº clientes) ; `.ciencia` |
| fontes_descoberta | [S3] [S9] [S12] |

transversal: D7 (atendimento).

### CON-031 · Montar e acompanhar o plano de adequação do cliente à reforma

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Consultoria / Reforma — prontidão |
| atividade | Para cada cliente, abrir checklist de adequação (ERP e emissor atualizados, cadastro revisado, contratos, fornecedores, preço, opção do Simples, contabilização) e acompanhar até concluir |
| descrição | Checklists de prontidão circulam em blogs e escritórios; o acompanhamento é manual por cliente. 2026 é ano de teste sem penalidade segundo nota da RFB, mas com fiscalização de indícios [S9]; contabilização de IBS/CBS como tributo recuperável (APET) [I4] |
| gatilho_frequência | Por projeto, revisão trimestral |
| porte_alcance | Todos os do regime regular; Simples por fora |
| quem_faz | Coordenador, analista |
| onde_é_feita_hoje | Planilha, gestor de tarefas |
| entradas / saídas | Perfil → checklist com responsáveis (cliente, escritório, fornecedor de ERP) e prazos; % de prontidão por cliente |
| base_legal | LC 214/2025 [S9] |
| risco_se_falhar | Notas rejeitadas, autuações a partir de 2027 |
| tempo_estimado | `[ESTIMATIVA]` 1 h para montar + 15 min/mês por cliente |
| concorrentes | Gestores de tarefas (Acessórias, Gestta) permitem checklists genéricos [NÃO VERIFICADO] modelo de reforma |
| hipótese_automação | Checklist gerado a partir do perfil e da triagem (CON-015); itens que a plataforma consegue verificar sozinha (ex.: grupos IBS/CBS presentes nos XMLs, NFE-030) são marcados automaticamente |
| papel_da_ia | M2 **ler**; M4 **executar** a criação de tarefas após aprovação |
| ferramentas_agênticas | `gerar_checklist_reforma(cliente)`, `verificar_item_checklist(cliente, item)`, `prontidao_carteira()` |
| eventos_timesheet | `consultoria.prontidao.atualizada` |
| fontes_descoberta | [S9] [I4] |

### CON-032 · Conferir a apuração assistida da CBS e o crédito disponível do cliente

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Consultoria / Reforma — apuração |
| atividade | Comparar a apuração pré-preenchida da Receita (débitos, créditos, pagamentos) com a apuração do escritório e explicar ao cliente diferenças e créditos travados |
| descrição | Piloto da CBS (Portaria RFB 549/2025) com 50 empresas, julho/2025 a dez/2026; ambiente beta de produção desde 12/01/2026 sem efeito fiscal; API de consulta da apuração liberada em dez/2025 para o piloto [S16]. Obrigatoriedade gradual citada por blog sem norma [S16] `[NÃO VERIFICADO]` |
| gatilho_frequência | Mensal a partir de 2027 |
| porte_alcance | Regime regular de CBS/IBS |
| quem_faz | Analista fiscal |
| onde_é_feita_hoje | Portal da RFB (piloto) |
| entradas / saídas | Apuração assistida + XMLs + apuração do core → divergências e explicação |
| base_legal | LC 214/2025; Portaria RFB 549/2025 [S16] |
| risco_se_falhar | Pagar a mais ou a menos; crédito não reconhecido |
| tempo_estimado | `[ESTIMATIVA]` 30–60 min/cliente/mês |
| concorrentes | Tecnospeed publica sobre a API (fornecedor de integração) [S16] |
| hipótese_automação | Conciliação automática via API da apuração (Etapa 2: confirmar acesso e credencial) |
| papel_da_ia | M2 + M3 **ler**; M1 explicar divergências |
| ferramentas_agênticas | `obter_apuracao_assistida(cliente, competencia)`, `conciliar_apuracao_cbs(cliente, competencia)` |
| eventos_timesheet | `fiscal.cbs.apuracao_conciliada` |
| fontes_descoberta | [S16] |

transversal: D2 (fiscal), FIS-045.

---

## D. Recuperação de créditos

### CON-033 · Triar a carteira em busca de oportunidades de recuperação de créditos

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Consultoria / Recuperação de créditos |
| atividade | Identificar clientes com indício de tributo pago a maior (monofásico no Simples, ICMS-ST, exclusão do ICMS da base de PIS/Cofins, verbas de INSS, DIFAL) |
| descrição | Hoje: por demanda, ou com ferramenta de auditoria terceirizada rodando SPED/XML. Recomendação de revisar os últimos 5 anos [I5]. Com a extinção de PIS/Cofins em 2027, créditos do passado ainda podem ser recuperados, mas a janela de registro muda (CON-025) [S12] |
| gatilho_frequência | Anual + na entrada de cliente novo |
| porte_alcance | Simples com revenda de monofásicos; comércio com ST; Presumido/Real |
| quem_faz | Analista fiscal sênior |
| onde_é_feita_hoje | Ferramenta de terceiros, planilha |
| entradas / saídas | XMLs e PGDAS/EFD de 60 meses → lista de oportunidades com valor estimado |
| base_legal | CTN (prazo quinquenal) `[NÃO VERIFICADO]` artigo; normas específicas de cada tese |
| risco_se_falhar | Perda por prescrição; cliente recupera com concorrente |
| tempo_estimado | `[ESTIMATIVA]` 1–2 h por cliente se manual |
| concorrentes | e-Auditoria: detecção de oportunidades (DIFAL, ICMS-ST, PIS/Cofins, exclusão do ICMS, monofásico; R$ 5,2 bi autodeclarados) [C3]; é-Simples Auditoria, focada no Simples [C16]; SIEG: `[NÃO ENCONTRADO]` (buscado: "SIEG recuperação créditos monofásico") |
| hipótese_automação | A plataforma já tem XMLs e declarações (D2, D3): varredura em lote com valor estimado e prazo prescricional por competência |
| papel_da_ia | M2 + M3 **ler**; M1 base legal; **rascunhar** proposta ao cliente |
| ferramentas_agênticas | `varrer_oportunidades_credito(cliente, periodo)`, `ranquear_oportunidades_carteira()` |
| eventos_timesheet | `consultoria.recuperacao.triagem` |
| fontes_descoberta | [I5] [S12] [C3] [C16] |

transversal: FIS-041 (monofásico), FIS-042 (PER/DCOMP), FIS-043 (ICMS-ST).

### CON-034 · Executar o projeto de recuperação: memória de cálculo, dossiê, retificações e pedido

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Consultoria / Recuperação de créditos |
| atividade | Calcular o crédito competência a competência, montar o dossiê de prova, retificar declarações (PGDAS-D, EFD, DCTFWeb) e transmitir PER/DCOMP ou pedido estadual; controlar prazo prescricional |
| descrição | Trabalho longo e com risco de glosa; dossiê costuma ficar em pastas soltas |
| gatilho_frequência | Por projeto |
| porte_alcance | Clientes com oportunidade aprovada |
| quem_faz | Analista fiscal sênior, sócio |
| onde_é_feita_hoje | Planilha, core, e-CAC, portais estaduais |
| entradas / saídas | Oportunidade → memória de cálculo, retificações, pedido, número de protocolo, controle de compensações |
| base_legal | Lei 9.430/1996 art. 74 (compensação) `[NÃO VERIFICADO]` texto vigente; normas da tese |
| risco_se_falhar | Glosa com multa isolada; prescrição |
| tempo_estimado | `[ESTIMATIVA]` 4–30 h por projeto |
| concorrentes | e-Auditoria (levantamento) [C3]; execução fica com o escritório `[NÃO ENCONTRADO]` ferramenta de ponta a ponta |
| hipótese_automação | Projeto com etapas, memória de cálculo do M3, dossiê ligado a cada competência, tarefas de retificação (D2) |
| papel_da_ia | M3 cálculo; M2 dossiê; M4 **rascunhar** retificações e pedidos; transmissão: Etapa 2 |
| ferramentas_agênticas | `calcular_credito(cliente, tese, periodo)`, `montar_dossie(cliente, projeto)`, `abrir_tarefas_retificacao(...)` |
| eventos_timesheet | `consultoria.recuperacao.etapa` (etapa, horas) |
| fontes_descoberta | [C3] |

### CON-035 · Controlar créditos judiciais: habilitação e limite mensal de compensação

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Consultoria / Recuperação de créditos |
| atividade | Acompanhar a habilitação do crédito reconhecido em juízo e o cronograma de compensação respeitando o limite mensal |
| descrição | Lei 14.873/2024 (art. 74-A da Lei 9.430/1996): créditos judiciais de R$ 10 mi ou mais têm limite mensal, mínimo de 1/60 do crédito; prazos de 24 a 60 meses por faixa (Portaria Normativa MF 14/2024, via fonte secundária); STF validou em set/2026 [S18]. Primeira declaração de compensação em até 5 anos (citação de acórdão) [S18] `[NÃO VERIFICADO]` |
| gatilho_frequência | Mensal durante a compensação |
| porte_alcance | Clientes com ação transitada em julgado |
| quem_faz | Analista fiscal, com advogado do cliente |
| onde_é_feita_hoje | Planilha |
| entradas / saídas | Decisão, valor habilitado → cronograma mensal, saldo, alerta de limite |
| base_legal | Lei 14.873/2024 [S18] |
| risco_se_falhar | Compensação não homologada; perda de prazo |
| tempo_estimado | `[ESTIMATIVA]` 15 min/cliente/mês |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Controle de saldo com limite calculado pelo M3 e lembrete mensal |
| papel_da_ia | M3; M4 **rascunhar** lembretes |
| ferramentas_agênticas | `cronograma_compensacao_judicial(cliente, credito)` |
| eventos_timesheet | `consultoria.credito_judicial.compensado` |
| fontes_descoberta | [S18] |

### CON-036 · Precificar, faturar e controlar o honorário de êxito da recuperação

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Consultoria / Recuperação de créditos (comercial) |
| atividade | Calcular o honorário de êxito sobre o crédito efetivamente aproveitado, emitir cobrança a cada compensação e provisionar o risco de glosa |
| descrição | Modelo comum no mercado (percentual sobre o recuperado) `[NÃO VERIFICADO]` (nenhuma fonte com percentuais foi encontrada); controle em planilha |
| gatilho_frequência | Por compensação/restituição |
| porte_alcance | Projetos de recuperação |
| quem_faz | Sócio, financeiro |
| onde_é_feita_hoje | Planilha, sistema de cobrança |
| entradas / saídas | Compensações realizadas → honorário devido, cobrança |
| base_legal | Contrato |
| risco_se_falhar | Receita não cobrada; conflito se houver glosa |
| tempo_estimado | `[ESTIMATIVA]` 10 min por evento |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Gatilho de cobrança quando a compensação é registrada (CON-034/035) |
| papel_da_ia | M2 + M3; M4 **rascunhar** cobrança |
| ferramentas_agênticas | `calcular_exito(cliente, projeto)`, `lancar_cobranca(...)` |
| eventos_timesheet | `comercial.exito.cobrado` |
| fontes_descoberta | — |

transversal: D7 (cobrança).

---

## E. Gestão da área consultiva

### CON-037 · Controlar a carteira de projetos consultivos (orçado × realizado)

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Consultoria / Gestão |
| atividade | Acompanhar projetos consultivos (planejamento, simulação, revisão de cadastro, recuperação) por status, prazo, horas orçadas × gastas e receita |
| descrição | Sem timesheet, o escritório não sabe se a consultoria dá lucro; consultoria "dentro da mensalidade" esconde o custo [I3] |
| gatilho_frequência | Contínua; revisão semanal |
| porte_alcance | Escritório |
| quem_faz | Sócio, coordenador |
| onde_é_feita_hoje | Planilha, gestor de tarefas |
| entradas / saídas | Projetos + eventos de timesheet → painel de rentabilidade por projeto, cliente e tipo de serviço |
| base_legal | — |
| risco_se_falhar | Consultoria deficitária; preço errado |
| tempo_estimado | `[ESTIMATIVA]` 1 h/semana |
| concorrentes | Gestores de tarefas com controle de tempo (Gestta, Acessórias) `[NÃO VERIFICADO]` para projetos consultivos |
| hipótese_automação | Projetos alimentados pelos eventos `consultoria.*` desta aba; alerta quando horas passam do orçado |
| papel_da_ia | M2 **ler**; M4 alertas |
| ferramentas_agênticas | `abrir_projeto(cliente, tipo, horas_orcadas)`, `rentabilidade_projeto(projeto)` |
| eventos_timesheet | consolida todos os `consultoria.*` |
| fontes_descoberta | [I3] |

transversal: D7 (rentabilidade, timesheet).

### CON-038 · Produzir o boletim interno de novidades normativas para a equipe

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Consultoria / Gestão do conhecimento |
| atividade | Resumir semanalmente normas, decisões e prazos novos relevantes para a carteira, com "o que muda para nós" |
| descrição | Hoje cada um lê o que encontra; sem alinhamento. Em 2026 houve LC 227, Res. CGSN 186 e 194, LC 224 regulamentada, Lei 15.270, alíquota CBS do TCU, decisão do STF sobre Lei 14.873 [S1][S3][S7][S8][S17][S18] |
| gatilho_frequência | Semanal |
| porte_alcance | Equipe |
| quem_faz | Coordenador técnico |
| onde_é_feita_hoje | E-mail, WhatsApp |
| entradas / saídas | Normas da semana → boletim com links e clientes afetados |
| base_legal | — |
| risco_se_falhar | Equipe desatualizada |
| tempo_estimado | `[ESTIMATIVA]` 1–2 h/semana |
| concorrentes | Portais de conteúdo (Econet, IOB, Contábeis) — genéricos, não ligados à carteira [C10][C11] |
| hipótese_automação | Gerado pelo vigia da lei + M2, revisado pelo coordenador |
| papel_da_ia | M1 + M2 **rascunhar** |
| ferramentas_agênticas | `gerar_boletim_normativo(periodo)` |
| eventos_timesheet | `consultoria.boletim.publicado` |
| fontes_descoberta | [S1] [S3] [S7] [S8] [S17] [S18] [C10] [C11] |

---

## Funcionalidades de concorrentes nesta aba

| Concorrente | O que oferece nesta aba (segundo a fonte) | Fonte |
| --- | --- | --- |
| e-Auditoria | Simulador da reforma até 2033 a partir de EFD-Contribuições e EFD ICMS/IPI (Lucro Real/Presumido); versão para Simples cruzando XMLs de entrada com perfil do fornecedor e crédito por NCM/CFOP; detecção de oportunidades de recuperação (DIFAL, ICMS-ST, PIS/Cofins, exclusão do ICMS, monofásico); consulta em lote por NCM/GTIN e monitoramento de NCM/CEST; precificação na reforma; auditoria de SPED/XML. Preço: `[PREÇO NÃO PÚBLICO]` | [C1] [C2] [C3] |
| é-Simples Auditoria | Recuperação de créditos para optantes do Simples | [C16] |
| Alterdata (core) | Simulador de IBS/CBS para o Simples dentro do módulo Fiscal (Central do Simples), sobre valor contábil das notas | [C4] |
| Qive | Portal de Fornecedores: sinaliza regime, quantifica risco de crédito IBS/CBS, trilha integrada ao ERP; conteúdo sobre a Calculadora da RFB | [C5] |
| Contabilizei | Calculadora da reforma comparando o regime atual com outros | [C6] |
| LegisWeb | Simulador de Planejamento Tributário com carga atual e pós-reforma (IBS, CBS, IS) | [C7] |
| CLM Controller | Simulador de cenários incluindo o "Simples híbrido" | [C8] |
| Senior (ERP) | Simulador e calculadora da reforma no ERP | [C9] |
| Econet | Área especial da reforma, consultoria tributária, simulador do Simples na reforma | [C10] |
| IOB | IOB Gestão Tributária: análise de operações e projeções da reforma; consultoria e cursos | [C11] |
| Questor (core) | Cálculo de IBS/CBS no financeiro para escritórios não optantes do Simples | [C13] |
| CNA | Calculadora da reforma para o agro | [C14] |
| TaxRadar, Buscador NCM | Consulta NCM × cClassTrib × anexo da LC 214 | [C15] |
| Receita Federal (referência, não concorrente) | Calculadora de Tributos oficial: CBS, IBS e IS, memória de cálculo e base legal, web, offline e API REST, código aberto | [S5] |
| Domínio / Onvio (Thomson Reuters) | Simulador de IBS/CBS ou módulo consultivo: `[NÃO ENCONTRADO]`; só material institucional | [C12] |
| SIEG | Funcionalidade de reforma ou recuperação: `[NÃO ENCONTRADO]` (buscado: "SIEG reforma tributária IBS CBS funcionalidade") | — |
| Acessórias, Gestta, HubStrom | Funcionalidade consultiva ou de reforma: `[NÃO ENCONTRADO]` (buscado: "Acessórias Gestta Hubstrom funcionalidades proposta comercial consultoria"); HubStrom aparece só com XMLHub | [C17] |

**Leitura:** o mercado tem **simuladores isolados** (por arquivo, por cliente) e **conteúdo**; ninguém encontrado junta, no mesmo lugar, (1) triagem da carteira inteira, (2) simulação com dados que o escritório já captura, (3) parecer com citação conferida, (4) comunicação segmentada com ciência e (5) controle de horas e cobrança da consultoria. Essa é a lacuna que a plataforma pode ocupar.

---

## Lacunas

1. **Textos oficiais não abertos nesta sessão** (rede bloqueada): LC 214/2025 consolidada, LC 227/2026, Res. CGSN 186 e 194/2026, LC 224/2025 e IN RFB 2.305/2025, Lei 15.270/2025, Portaria RFB 549/2025. Todas as datas e artigos citados vêm de fontes secundárias (confiança média).
2. **Janela de março/2027** para o 2º semestre do Simples por fora: fonte única [S4].
3. **Calculadora de Tributos da RFB:** endereço da API, termos de uso, limites e repositório `[NÃO ENCONTRADO]`. Etapa 2 (V1) deve confirmar; é a peça que decide "construir × integrar" no M3.
4. **API da apuração assistida da CBS:** existência fora do piloto, credencial e cronograma `[NÃO VERIFICADO]` [S16].
5. **Split payment:** atos normativos operacionais `[NÃO ENCONTRADO]`; data de obrigatoriedade diverge (2027 × 2028) [S6].
6. **Imposto Seletivo:** alíquotas não fixadas; veículo legal (MP ou lei) e data incertos [S15].
7. **Crédito de fornecedor do Simples sem opção:** fontes divergem entre vedação e crédito limitado ao recolhido [S10].
8. **LC 224/2025:** status da liminar/ADI 7.920 e limites por tributo (R$ 5 mi × R$ 3,75 mi) não confirmados [S7].
9. **Lei 15.270/2025:** base da retenção (total × excedente) e alcance no Simples divergem [S8].
10. **Prazo de 5 anos dos saldos de PIS/Cofins:** termo inicial controverso [S12].
11. **Regimes específicos:** lista completa, percentuais e quais têm DeRE obrigatória `[NÃO VERIFICADO]` [S21].
12. **Tempos por atividade:** nenhum dado público; todos `[ESTIMATIVA]`. Precisam vir do levantamento com os contadores.
13. **Concorrentes:** Domínio/Onvio, SIEG, Acessórias, Gestta sem evidência de recurso consultivo; preços de e-Auditoria, IOB, Econet `[PREÇO NÃO PÚBLICO]`. V3 deve confirmar com demonstração ou página de preços.
14. **Consulta formal ao Fisco:** IN vigente do processo de consulta federal e rito no CGIBS não confirmados.
15. **Responsabilidade profissional da IA em pareceres:** não foi pesquisado se o CFC tem orientação sobre uso de IA em trabalhos técnicos; pergunta para a Etapa 3 e para os contadores.

---

## Fontes

Todas consultadas em 05/11/2026, lidas por trechos do buscador (ver limitação no início).

**Normas e órgãos (via fontes secundárias)**

- [S1] LC 227/2026: [Contadores.cnt.br, 14/01/2026](https://contadores.cnt.br/projetos/46/noticias/tecnicas/2026/01/14/reforma-tributaria-lei-complementar-no-227-e-sancionada-e-define-regras-para-o-comite-gestor-do-ibs-o-processo-fiscal-e-a-cobranca-do-itcmd.html); [Sefin-RO, resumo](https://reformatributaria.sefin.ro.gov.br/2026/01/29/veja-a-lei-complementar-no-227-26-sumarizada-que-institui-o-comite-gestor-do-ibs-e-atualiza-a-lc-214-25/); [Senior, 14/01/2026](https://documentacao.senior.com.br/exigenciaslegais/noticias/federal/2026/2026-01-14-sancionada-segunda-etapa-da-regulamentacao-da-reforma-tributaria-e-criacao-do-comite-gestor-do-ibs)
- [S2] Res. CGSN 186/2026: [Normas Legais](https://www.normaslegais.com.br/legislacao/resolucao-cgsn-186-2026.htm); [CRCSP](https://online.crcsp.org.br/portal/noticias/noticia.asp?c=11355); [Senior, 20/04/2026](https://documentacao.senior.com.br/exigenciaslegais/noticias/federal/2026/2026-04-20-simples-nacional-opcoes-para-o-simples-nacional-e-regime-regular-ibs-e-cbs-ano-calendario-2027)
- [S3] Res. CGSN 194/2026 (prorrogação): [Simtax](https://simtax.com.br/?p=70787); [LegisWeb](https://www.legisweb.com.br/noticia/?id=34449); [Omie](https://www.omie.com.br/blog/prorrogacao-prazos-simples-nacional-2027-ibs-cbs/)
- [S4] Janela 1–31/03/2027: [Inventti](https://inventti.com.br/?p=24941)
- [S5] Calculadora de Tributos RFB: [Machado Meyer](https://www.machadomeyer.com.br/pt/inteligencia-juridica/publicacoes-ij/tributario-ij/rfb-libera-ferramenta-de-calculo-da-reforma-tributaria-para-toda-a-sociedade); [ReformaTributaria.com](https://www.reformatributaria.com/tecnologia/receita-federal-libera-ferramenta-oficial-de-calculo-da-reforma-tributaria-sobre-o-consumo/); [Qive, blog](https://qive.com.br/blog/calculadora-de-tributos-da-receita-federal)
- [S6] Split payment: [Contábeis, confirma 2027](https://www.contabeis.com.br/noticias/71509/receita-federal-confirma-split-payment-a-partir-de-2027/); [Contábeis, testes 2026](https://www.contabeis.com.br/noticias/78421/split-payment-tera-testes-em-2026-mas-implantacao-sera-gradual/); [PR Advogados, 01/06/2026](https://pradvogados.com.br/2026/06/01/split-payment-deve-entrar-em-operacao-em-janeiro-de-2027-ainda-incompleto/); [CRCSP](https://online.crcsp.org.br/portal/noticias/noticia.asp?c=10026); [Omie, cronograma](https://www.omie.com.br/blog/cronograma-split-payment-fluxo-de-caixa/index.md)
- [S7] LC 224/2025: [Contábeis](https://www.contabeis.com.br/noticias/75261/lucro-presumido-tera-aumento-de-10-na-base-do-irpj-e-csll-em-2026/); [Migalhas](https://www.migalhas.com.br/depeso/447666/pedagio-do-lucro-presumido-analise-da-lc-224-25-e-desafio-da-vigencia); [Barbieri, liminar](https://www.barbieriadvogados.com/?p=5171); [Contmatic](https://simplifique.contmatic.com.br/blogs/lucro-presumido); [Taxcel](https://taxcel.com.br/lucro-presumido)
- [S8] Lei 15.270/2025: [Jornal Contábil](https://jornalcontabil.com.br/noticia/lei-15-270-define-regras-para-taxacao-de-lucros-e-dividendos-a-partir-de-2026/); [Nota Gateway](https://notagateway.com.br/blog/receita-detalha-como-ficara-a-tributacao-de-lucros-e-dividendos-com-a-nova-regra-de-altas-rendas/); [Tributário nos Bastidores, 20/10/2026](https://tributarionosbastidores.com.br/2026/10/20/)
- [S9] 2026 ano de teste: [Tax Group](https://www.taxgroup.com.br/intelligence/aliquota-ibs-cbs/); [AmdJus, nota da RFB](https://amdjus.com.br/?p=23229); [BMA](https://www.bmalaw.com.br/conteudo/direito-tributario/bma-review/bma-review-89/bma-review-89-estreia-do-ibs-e-cbs-papel-estrategico-das-obrigacoes-acessorias/pdf); [Trivium](https://triviumcontabil.com.br/ibs-e-cbs-quando-comeca/)
- [S10] Crédito condicionado, art. 47: [ReformaTributaria.com, art. 47](https://www.reformatributaria.com/opiniao/split-payment-e-o-art-47-por-que-a-lc-214-de-2025-muda-o-seu-credito-de-ibs-e-cbs/); [ReformaTributaria.com, Simples e crédito](https://www.reformatributaria.com/opiniao/simples-nacional-vai-gerar-credito-de-ibs-e-cbs-e-quando-estara-obrigado/); [Conjur, 18/05/2026](https://www.conjur.com.br/2026-mai-18/direito-ao-credito-de-ibs-e-cbs-no-contexto-da-reforma-tributaria/); [Taxcel, regime do fornecedor](https://taxcel.com.br/regime-fornecedor-reforma-tributaria)
- [S11] Saldo credor de ICMS: [PwC Tax Intelligence ed. 06/2026](https://www.pwc.com.br/pt/thinking-about-taxes/tax-intelligence/2026/tax-intelligence-raciocinios-ed-06_Gestao-de-saldos-credores.pdf); [Machado Meyer](https://www.machadomeyer.com.br/pt/inteligencia-juridica/publicacoes-ij/tributario-ij/monetizacao-dos-saldos-credores-de-icms-desafios-na-transicao-para-o-ibs); [Systax](https://www.systax.com.br/?p=43242)
- [S12] Saldos de PIS/Cofins: [Migalhas](https://www.migalhas.com.br/depeso/467379/pis-e-cofins-nao-registrados-ate-31-12-nao-poderao-ser-utilizados); [APET](https://apet.org.br/?p=136642); [Jurídico Certo](https://juridicocerto.com/p/thiago-reis2/artigos/saldo-de-pis-e-cofins-vale-na-cbs-creditos-e-estoque-em-2027-8216)
- [S13] Reequilíbrio de contratos: [LegJur, art. 376](https://www.legjur.com/legislacao/art/lec_00002142025-376); [NetCPA](https://netcpa.com.br/colunas/o-reequilibrio-economico-financeiro-de-contratos-a-luz-do-ibs-e-da-cbs/26512); [ReformaTributaria.com, contratos 2026](https://www.reformatributaria.com/opiniao/com-a-reforma-tributaria-revisar-contratos-vira-urgencia-em-2026/); [Conjur](https://www.conjur.com.br/?p=916033)
- [S14] cClassTrib e anexos: [Buscador NCM, cesta básica](https://buscadorncm.com.br/reforma/cesta-basica); [TaxRadar](https://taxradar.app/blog/reforma-tributaria/o-que-muda-com-ibs-cbs)
- [S15] Imposto Seletivo: [CRCSP](https://online.crcsp.org.br/portal/noticias/noticia.asp?c=11012); [NetCPA](https://netcpa.com.br/colunas/imposto-seletivo-governo-deve-definir-aliquotas-de-2027-por-medida-provisoria-em-setembro/28328); [Contábeis](https://www.contabeis.com.br/noticias/77268/imposto-seletivo-deve-comecar-em-2027-veja-os-alvos/)
- [S16] Apuração assistida da CBS: [FIEMG, IE 18/2026](https://www.fiemg.com.br/wp-content/uploads/2026/02/IE_18_RFB-teste-CBS-contribuintes.pdf); [Tecnospeed](https://blog.tecnospeed.com.br/apuracao-assistida-na-reforma-tributaria/); [Machado Meyer](https://www.machadomeyer.com.br/pt/inteligencia-juridica/publicacoes-ij/tributario-ij/receita-federal-libera-manuais-sobre-a-apuracao-assistida); [AmdJus](https://amdjus.com.br/?p=3510)
- [S17] Alíquota CBS 2027: [Mercado & Consumo, 28/10/2026](https://mercadoeconsumo.com.br/28/10/2026/economia/tcu-informa-aliquota-da-cbs-em-113-para-2027-e-redutor-de-442-nas-compras-publicas/); [Brasil 61, 29/10/2026](https://brasil61.com/n/reforma-tributaria-aliquota-da-cbs-deve-ser-definida-pelo-senado-ate-15-de-dezembro-bras2617397); [Mattos Filho](https://www.mattosfilho.com.br/?p=123356); [NetCPA, anterioridade](https://netcpa.com.br/colunas/aliquota-da-cbs-para-2027-e-anterioridade-nonagesimal-uma-controversia-constitucional-em-formacao/28546)
- [S18] Lei 14.873/2024: [Agência Senado, 04/06/2024](https://www12.senado.leg.br/noticias/materias/2024/06/04/entra-em-vigor-lei-sobre-limites-para-compensacao-tributaria); [PR Advogados, 28/09/2026](https://pradvogados.com.br/2026/09/28/stf-valida-limitacao-para-compensar-creditos-tributarios-acima-de-r-10-milhoes/); [TAGD](https://tagdlaw.com.br/supremo-valida-teto-de-compensacao-de-creditos-tributarios-judiciais/)
- [S19] Opção pelo Lucro Presumido: [RFB, Perguntas e Respostas PJ 2021, cap. XV](https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/declaracoes-e-demonstrativos/ecf/perguntas-e-respostas-pessoa-juridica-2021-arquivos/capitulo-xv-irpj-pagamento-2021.pdf); [Lei 9.430/1996, Câmara](https://www2.camara.leg.br/legin/fed/lei/1996/lei-9430-27-dezembro-1996-367738-normaatualizada-pl.pdf); [Jettax](https://www.jettax.com.br/blog/tributacao-lucro-presumido/); [Jornal Contábil](https://jornalcontabil.com.br/noticia/lucro-presumido-como-funciona-e-quando-vale-a-pena/)
- [S20] Cronograma da transição: [Simtax, ICMS→IBS](https://simtax.com.br/transicao-do-icms-para-o-ibs-como-funcionara-a-troca-de-carga-entre-2029-e-2032/); [Tecnospeed](https://blog.tecnospeed.com.br/fim-do-icms-e-do-iss-entenda-a-transicao/); [Taxcel, tabela](https://taxcel.com.br/cronograma-reforma-tributaria-2026-2033-tabela); [Buscador NCM, cronograma](https://buscadorncm.com.br/reforma/cronograma)
- [S21] Regimes específicos: [Econet, bares e restaurantes](https://blog.econeteditora.com.br/regime-especifico-bares-restaurantes-reforma-tributaria/); [Sienge, imóveis](https://sienge.com.br/blog/regime-especifico-das-operacoes-com-bens-imoveis/); [Planning](https://planning.com.br/regimes-especificos-reforma-tributaria/); [Escola Superior ESN, DeRE](https://escolasuperioresn.com.br/?p=10615); [TaxUp, bares/hotelaria](https://taxup.com.br/solucoes/reforma-tributaria/bares-restaurantes-hotelaria/)
- [S22] Nanoempreendedor: [Agência Sebrae](https://agenciasebrae.com.br/economia-e-politica/conheca-a-diferenca-entre-nanoempreendedor-e-microempreendedor-individual/); [NetCPA](https://netcpa.com.br/colunas/o-que-muda-para-o-mei-com-a-reforma-tributaria/23435); [IBET, PL 4.398/2025](https://www.ibet.com.br/pl-4-398-2025-ibs-cbs-nao-incidencia-nanoempreendedores-previsao-do-artigo-26-iv-e-§-10-da-lc-214-2025/)
- [S23] Alíquotas de referência: [LegJur, art. 349](https://www.legjur.com/legislacao/art/lec_00002142025-349); [Simtax](https://simtax.com.br/aliquotas-referencia-ibs-cbs-senado-tcu/)

**Imprensa e entidades**

- [I1] Sondagem Omie: [Contábeis, 56% sem plano](https://www.contabeis.com.br/noticias/78144/reforma-tributaria-ja-impacta-escritorios-mas-56-dos-contadores-ainda-nao-tem-plano/); [Contábeis, escritórios projetam até 2033 (informe publicitário)](https://www.contabeis.com.br/noticias/77895/reforma-tributaria-escritorios-ja-projetam-a-carga-dos-clientes-ate-2033/)
- [I2] (não usado)
- [I3] Honorários e escopo consultivo: [Site Contábil, revisão de contratos](https://sitecontabil.com.br/noticias_empresariais/ler/reforma-tributaria-exige-revisao-de-contratos-entre-empresas-e-escritorios-de-contabilidade); [Site Contábil, tabela ASSCON 2026](https://sitecontabil.com.br/noticias_empresariais/ler/asscon-publica-tabela-de-honorarios-contabeis-2026); [e-Auditoria, como cobrar planejamento](https://www.e-auditoria.com.br/blog/como-cobrar-planejamento-tributario-na-reforma/); [ReformaTributaria.com, monetizar serviços](https://www.reformatributaria.com/iva/contadores-buscam-novas-formas-de-monetizar-e-precificar-servicos-com-a-reforma-tributaria/)
- [I4] Contabilização de IBS/CBS: [APET, 13ª reunião 2025](https://apet.org.br/?p=129360)
- [I5] Revisão de créditos de 5 anos: [Trivium](https://triviumcontabil.com.br/ibs-e-cbs-2026-como-funciona/)

**Concorrentes e fornecedores**

- [C1] [e-Auditoria, simulador LR/LP](https://www.e-auditoria.com.br/blog/simulador-de-carga-tributaria-para-lucro-real-e-lucro-presumido/)
- [C2] [e-Auditoria, simulador para o Simples](https://www.e-auditoria.com.br/ofertas/lm-simulador-da-reforma-tributaria-para-o-simples-nacional/); [e-Auditoria, LM simulador](https://www.e-auditoria.com.br/ofertas/lm-simulador-da-reforma-tributaria/)
- [C3] [e-Auditoria, detecção de oportunidades](https://www.e-auditoria.com.br/solucoes/para-auditar-arquivos/deteccao-de-oportunidades/); [e-Auditoria, recuperação](https://www.e-auditoria.com.br/ofertas/lm-recuperacao-de-credito-tributario/); [e-Auditoria, planos](https://www.e-auditoria.com.br/planos/)
- [C4] [Alterdata, simulador IBS/CBS no Simples](https://ajuda.alterdata.com.br/x/YAo4FQ)
- [C5] [Qive, reforma tributária](https://qive.com.br/categorias/reforma-tributaria)
- [C6] [Contabilizei, calculadora](https://www.reformatributaria.com/reforma-tributaria-brasil/contabilizei-lanca-calculadora-da-reforma-tributaria/)
- [C7] [LegisWeb, Simulador de Planejamento Tributário](https://www.legisweb.com.br/produtos/sistemas/simulador_planejamento_tributario/)
- [C8] [CLM Controller, simulador](https://clmcontroller.com.br/es/simulador-de-la-reforma-fiscal-ibs-cbs/)
- [C9] [Senior, simulador da reforma](https://documentacao.senior.com.br/seniorxplatform/manual-do-usuario/erp/inteligencia-tributaria/simulador-reforma.htm)
- [C10] [Econet, área especial da reforma](https://blog.econeteditora.com.br/adapte-se-a-reforma-tributaria-com-mais-facilidade-conheca-nossa-area-especial)
- [C11] IOB Gestão Tributária e consultoria: citada pelo buscador em [Notícias IOB](https://noticias.iob.com.br/reforma-tributaria-transicao/) e [Jornal Contábil, programa IOB](https://www.jornalcontabil.com.br/noticia/lancado-programa-de-formacao-em-reforma-tributaria-com-a-qualidade-e-confiabilidade-da-marca-iob/) `[NÃO VERIFICADO]` página do produto
- [C12] [Thomson Reuters, papel na reforma](https://www.thomsonreuters.com.br/pt/tax-accounting/onesource-mastersaf/blog/papel-thomson-reuters-reforma-tributaria.html) (nenhum simulador Domínio encontrado)
- [C13] [Questor, reforma no financeiro](https://docs.questor.com.br/pt-br/Produtos/GestãoContábil/Financeiro/reformatributariafinanceiro)
- [C14] [CNA, calculadora](https://cnabrasil.org.br/noticias/cna-lanca-calculadora-da-reforma-tributaria)
- [C15] [TaxRadar](https://taxradar.app/blog/reforma-tributaria/o-que-muda-com-ibs-cbs); [Buscador NCM](https://buscadorncm.com.br/reforma/cesta-basica)
- [C16] [é-Simples Auditoria](https://blog.esimplesauditoria.com.br/e-auditoria/)
- [C17] [AmdJus, HubStrom](https://amdjus.com.br/hubstrom-revoluciona-a-contabilidade-com-seu-ecossistema-inteligente-integrado/)

---

## Fichas do ciclo de vida (rodada 3, 6/11/2026)

Rodada feita com a classificação dos contadores do grupo por etapa do cliente (Entrada, Manutenção, Desligamento). As 38 fichas anteriores são quase todas de Manutenção; as lacunas estavam na chegada do cliente (diagnóstico, herança consultiva do contador anterior, empresa nova) e na saída (entrega do acervo consultivo, projetos e êxito em aberto, planejamento da baixa). Proposta, contrato, distrato genérico, procurações e baixa societária ficam com D7 e D1; aqui só o lado consultivo. Fontes desta rodada em `[R3-n]`, listadas ao fim da seção, consultadas em **06/11/2026** (as marcadas "texto lido" foram abertas com curl; as demais, por trecho do buscador). `nível_automação (provisório)` segue a escala do consolidado e precisa de verificação na Etapa 2. Tempos: `[ESTIMATIVA]`.

### CON-101 · Fazer o diagnóstico tributário de entrada do cliente novo

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Consultoria / Entrada de cliente |
| atividade | Nos primeiros 30–60 dias, revisar o regime atual, o enquadramento (CNAE, anexo, fator R, regime específico), a carga e os riscos dos últimos anos, e entregar ao cliente um relatório de "como recebemos a empresa", com oportunidades (recuperação, troca de regime, reforma) e ressalvas |
| descrição | Hoje cada escritório faz (ou não) uma conferência informal. A prática recomendada no mercado é revisar o período não decaído (5 anos, CTN) cruzando contábil × fiscal, declarado × pago e inventário × movimentação [R3-9]. O relatório tem dupla função: mostra valor logo de saída e registra o estado em que a empresa chegou, separando a responsabilidade técnica do escritório anterior (Res. CFC 1.590/2020 art. 10: obrigações de competência do período anterior cabem ao rescindente [R3-2]). Junta numa entrega só o que hoje está espalhado em CON-008 (regime), CON-015 (triagem da reforma), CON-020 (cadastro) e CON-033 (recuperação), aplicados a um cliente que ainda não está no perfil temporal |
| gatilho_frequência | Por evento: cada cliente novo vindo de outra contabilidade |
| porte_alcance | Todos os não MEI; maior valor em Presumido/Real e Simples perto de limites |
| quem_faz | Analista sênior ou coordenador; sócio assina o relatório |
| onde_é_feita_hoje | Planilha, PVA dos SPEDs recebidos, e-CAC, Word |
| entradas / saídas | SPEDs, PGDAS-D, DCTFWeb, balancetes e contrato social recebidos (ver transversal) + situação fiscal → relatório de diagnóstico com riscos, oportunidades, recomendação de regime e lista de ressalvas assinada pelo cliente |
| base_legal | Res. CFC 1.590/2020 arts. 8 a 10 [R3-2]; NBC PG 01 item 5 (l) [R3-1]; prazo de 5 anos do CTN (via fonte secundária [R3-9]) |
| risco_se_falhar | Passivo herdado atribuído ao novo escritório; regime errado mantido; perda de crédito por prescrição; perda do cliente por não mostrar valor |
| tempo_estimado | `[ESTIMATIVA]` 3–10 h por cliente |
| concorrentes | e-Auditoria (auditoria de SPED e detecção de oportunidades, [C3]) cobre parte; modelo de contrato de diagnóstico tributário da Normas Legais [R3-9]; nenhum encontrado que gere o relatório de entrada com ressalvas `[NÃO ENCONTRADO]` |
| hipótese_automação | Ao marcar "cliente vindo de outra contabilidade", o agente pede pelo app os arquivos que faltam, roda as conferências cruzadas e as simulações (M3), e monta o rascunho do relatório e do termo de ressalvas |
| papel_da_ia | M2 (arquivos recebidos) → M1 → M3 → **rascunhar** relatório e termo; envio após aprovação do sócio |
| ferramentas_agênticas | `abrir_diagnostico_entrada(cliente)`, `conferir_cruzamentos(cliente, periodo)`, `simular_regimes(cliente, ano, cenario)`, `rascunhar_relatorio_entrada(cliente)`, `gerar_termo_ressalvas(cliente)` |
| eventos_timesheet | `consultoria.diagnostico_entrada.aberto` ; `.relatorio_rascunhado` (IA) ; `.revisado` (pessoa, duração) ; `.entregue` |
| fontes_descoberta | [R3-1] [R3-2] [R3-9] [C3] |
| etapa | Entrada |
| nível_automação (provisório) | Próprio (análise sobre arquivos recebidos pelo app; SPEDs em F) |

transversal: D5 (saldos de abertura e livros recebidos), D2 (obrigações em atraso e parcelamentos herdados), CON-008, CON-015, CON-033.

### CON-102 · Inventariar a herança consultiva deixada pelo contador anterior

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Consultoria / Entrada de cliente (transição) |
| atividade | Levantar com o contador anterior e com o cliente tudo o que está em curso na parte consultiva: consultas formais protocoladas, PER/DCOMP pendentes de análise, créditos judiciais habilitados e cronograma de compensação, teses com ação em andamento, opções vigentes (regime do ano, opção pelo regime regular de IBS/CBS no semestre, regime de caixa), pareceres e planejamentos que o cliente segue, honorários de êxito do escritório anterior sobre esses créditos |
| descrição | O contador substituído deve informar ao substituto os fatos que este precisa conhecer (NBC PG 01, item 5 (l) [R3-1]; Res. CFC 1.590/2020 art. 8 [R3-2]), mas não há roteiro padronizado: o questionário fica a cargo de quem recebe. Com a reforma, a lista ganhou itens com prazo duro: opção semestral pelo regime regular (Res. CGSN 186/2026 e 194/2026 [R3-3][R3-4]), saldos de PIS/Cofins a registrar até 31/12/2026 (CON-025), compensações judiciais com limite mensal (CON-035). Item esquecido vira prazo perdido sem dono |
| gatilho_frequência | Por evento: cada cliente vindo de outra contabilidade, no primeiro mês |
| porte_alcance | Clientes vindos de outro escritório; crítico em Presumido/Real com créditos e processos |
| quem_faz | Coordenador técnico ou sócio; atendimento cobra o retorno |
| onde_é_feita_hoje | E-mail e telefone com o escritório anterior; e-CAC (processos, PER/DCOMP); pastas recebidas |
| entradas / saídas | Questionário enviado ao anterior + respostas + consulta no e-CAC → inventário de pendências consultivas, cada uma com prazo, responsável e tarefa no calendário |
| base_legal | NBC PG 01 item 5 (l) [R3-1]; Res. CFC 1.590/2020 arts. 8 e 9 [R3-2]; Res. CGSN 186/2026 e 194/2026 [R3-3][R3-4]; Lei 14.873/2024 [S18] |
| risco_se_falhar | Perda de crédito por prescrição ou por perder a janela; compensação acima do limite mensal (glosa); cancelamento ou opção semestral não acompanhados; conflito com o anterior sobre êxito |
| tempo_estimado | `[ESTIMATIVA]` 1–4 h por cliente, mais espera pelas respostas |
| concorrentes | Gestores de tarefas (Acessórias, Gestta) têm checklists de onboarding genéricos, sem itens consultivos `[NÃO VERIFICADO]` |
| hipótese_automação | Questionário padrão por regime gerado pelo agente e enviado ao anterior (e-mail com rastreio) e ao cliente (app); respostas viram itens do perfil temporal e tarefas com prazo; o que depende do e-CAC vira roteiro para a pessoa consultar e anexar |
| papel_da_ia | M2 + M1 (quais prazos valem para este cliente) → M4 **rascunhar** questionário e tarefas; **executar** lembretes de cobrança da resposta |
| ferramentas_agênticas | `gerar_questionario_transicao(cliente, area="consultoria")`, `registrar_heranca(cliente, item, prazo)`, `criar_tarefas_lote(lista)`, `cobrar_resposta_anterior(cliente)` |
| eventos_timesheet | `consultoria.transicao.questionario_enviado` ; `.item_registrado` (tipo, prazo) ; `.inventario_concluido` |
| fontes_descoberta | [R3-1] [R3-2] [R3-3] [R3-4] [S18] |
| etapa | Entrada |
| nível_automação (provisório) | D-assistido (consulta de processos e PER/DCOMP no e-CAC sem API verificada para isto; o resto é Próprio) |

transversal: D7 (transição com o contador anterior), D2 (parcelamentos e obrigações herdadas), CON-025, CON-035, CON-036.

### CON-103 · Planejar o regime e o enquadramento da empresa nova antes da inscrição no CNPJ

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Consultoria / Entrada de cliente (abertura) |
| atividade | Antes da abertura, simular regime (Simples, Presumido, Real), natureza jurídica e CNAE (anexo, fator R, vedações, regime específico da reforma) e decidir se o Simples recolhe IBS/CBS por dentro ou pelo regime regular, porque as opções são feitas no ato ou logo após a inscrição |
| descrição | Para empresa em início de atividade inscrita entre 1º/10 e 31/12/2026, a opção pelo Simples e pelo regime regular de IBS/CBS é feita no momento da inscrição no CNPJ, com efeitos para 2027 (Simples) e jan–jun/2027 (IBS/CBS) (Res. CGSN 186/2026 art. 3, texto lido [R3-3]); a Res. CGSN 194/2026 mudou as datas de corte para 16/10 (Simples) e 31/10 (IBS/CBS) [R3-4]. Fora desse recorte, a regra antiga era de 30 dias do último deferimento de inscrição, dentro de um limite contado da abertura do CNPJ (180 ou 60 dias, conforme o ano) [R3-5]; a Res. CGSN 190/2026 redefiniu "início de atividade" [R3-5] `[NÃO VERIFICADO]` no texto. Erro aqui só se corrige na janela seguinte |
| gatilho_frequência | Por evento: cada abertura de empresa |
| porte_alcance | Empresas novas (inclusive sócios de clientes); MEI que vai desenquadrar |
| quem_faz | Analista sênior ou sócio, junto com o societário |
| onde_é_feita_hoje | Planilha e conversa com o cliente; decisão às vezes tomada pelo próprio societário sem simulação |
| entradas / saídas | Atividade pretendida, faturamento e folha projetados, mix B2B/B2C, sócios → comparativo de regimes, CNAE recomendado, decisão sobre o regime regular de IBS/CBS, termo de aceite |
| base_legal | LC 123/2006; Res. CGSN 140/2018 art. 6 (via fonte secundária [R3-5]); Res. CGSN 186/2026 art. 3 [R3-3]; Res. CGSN 194/2026 [R3-4]; LC 214/2025 art. 41 §§3º e 4º (citado na Res. 186 [R3-3]) |
| risco_se_falhar | Regime ou CNAE errado o ano todo; perda do prazo de opção na abertura; vedação ao Simples descoberta depois |
| tempo_estimado | `[ESTIMATIVA]` 1–3 h por abertura |
| concorrentes | Calculadoras de regime (Contabilizei [C6], LegisWeb [C7]) para o público geral; sem ligação com o processo de abertura `[NÃO ENCONTRADO]` |
| hipótese_automação | Quando o societário abre o processo de abertura, o agente coleta pelo app as projeções, roda as simulações (M3) com as regras vigentes na data (M1) e devolve recomendação e o prazo de opção ao processo de abertura |
| papel_da_ia | M1 → M3 → **rascunhar** recomendação e termo; a opção é marcada pelo societário na inscrição |
| ferramentas_agênticas | `simular_regimes_abertura(dados_projetados)`, `verificar_vedacoes_simples(cnae, socios)`, `prazo_opcao_inicio_atividade(data_inscricao)`, `gerar_termo_opcao_regime(cliente, regime, ano)` |
| eventos_timesheet | `consultoria.abertura.simulada` ; `.recomendacao_aprovada` (regime, IBS/CBS regular sim/não) |
| fontes_descoberta | [R3-3] [R3-4] [R3-5] [C6] [C7] |
| etapa | Entrada |
| nível_automação (provisório) | Próprio (simulação); a opção em si segue o nível da abertura no D1 |

transversal: D1 (abertura de empresa), CON-008, CON-009, CON-017.

### CON-104 · Entregar o acervo consultivo e os prazos em curso quando o cliente sai

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Consultoria / Desligamento |
| atividade | Na saída para outro contador, montar o pacote consultivo: pareceres e planejamentos vigentes, memórias de cálculo e dossiês de recuperação, status das consultas formais, cronograma de compensações judiciais, opções de regime em vigor e próximas janelas, saldos credores e prazos (PIS/Cofins, ICMS), e comunicar ao novo responsável técnico os fatos que ele precisa conhecer |
| descrição | O distrato é obrigatório e deve trazer a responsabilidade do cliente de receber seus documentos; o rescindente comunica ao novo responsável técnico os fatos relevantes; forma e prazo de devolução dos livros e arquivos ficam na cláusula rescisória (Res. CFC 1.590/2020 arts. 6 a 9, texto lido [R3-2]); dever ético igual na NBC PG 01 item 5 (l) [R3-1]. Na prática a entrega cobre livros e arquivos fiscais e esquece o consultivo (o que estava planejado, o que vence), que é onde o cliente mais perde na troca. Também fecha a guarda: o escritório mantém cópia do que fundamentou suas recomendações, para defesa futura `[NÃO VERIFICADO]` (prazo de guarda não pesquisado) |
| gatilho_frequência | Por evento: cada saída de cliente |
| porte_alcance | Clientes que saem com consultoria ativa ou histórico de pareceres e créditos |
| quem_faz | Coordenador técnico; sócio aprova a comunicação ao novo contador |
| onde_é_feita_hoje | Pastas na rede, e-mail; muitas vezes não é feito |
| entradas / saídas | Base de conhecimento do cliente (CON-004), projetos (CON-037), créditos (CON-034, CON-035) → pacote consultivo indexado + carta ao novo responsável técnico + recibo do cliente |
| base_legal | Res. CFC 1.590/2020 arts. 6 a 9 [R3-2]; NBC PG 01 item 5 (l) e (d) do item 18 (evitar desentendimentos com o substituto) [R3-1] |
| risco_se_falhar | Prazo perdido pelo novo contador atribuído ao escritório que saiu; processo ético; pedido de documento depois do fim do contrato sem registro do que foi entregue |
| tempo_estimado | `[ESTIMATIVA]` 1–3 h por cliente com consultoria ativa |
| concorrentes | `[NÃO ENCONTRADO]` pacote consultivo de saída; gestores de documentos entregam arquivos, não o estado dos prazos |
| hipótese_automação | Ao abrir o desligamento, o agente lista tudo o que existe do cliente na base consultiva e nos projetos, gera o índice, a carta ao novo responsável técnico com prazos em curso e publica no app para o cliente baixar com confirmação |
| papel_da_ia | M2 → M1 (prazos vigentes) → M4 **rascunhar** carta e índice; **executar** a publicação no app após aprovação |
| ferramentas_agênticas | `montar_acervo_saida(cliente)`, `listar_prazos_em_curso(cliente)`, `rascunhar_carta_novo_responsavel(cliente)`, `publicar_no_app(cliente, pacote)` |
| eventos_timesheet | `consultoria.desligamento.acervo_montado` ; `.carta_enviada` ; `.recibo_cliente` |
| fontes_descoberta | [R3-1] [R3-2] [R3-11] |
| etapa | Desligamento |
| nível_automação (provisório) | Próprio (pacote e entrega pelo app) |

transversal: D7 (distrato e entrega de arquivos), CON-004, CON-037.

### CON-105 · Encerrar projetos consultivos em aberto e apurar o honorário de êxito na saída

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Consultoria / Desligamento |
| atividade | Quando o cliente sai (ou a empresa encerra) com projeto consultivo ou de recuperação em andamento, medir o trabalho feito, decidir o que é concluído, transferido ou cancelado, e apurar o êxito devido sobre créditos já pedidos ou ainda a compensar |
| descrição | O êxito costuma ser cobrado conforme o crédito é efetivamente compensado, o que pode durar anos (CON-035); se o cliente sai antes, o contrato precisa dizer como fica. Não há regra própria para contadores: a jurisprudência encontrada é de honorários advocatícios, que admite arbitramento pelo trabalho feito quando o cliente rompe o contrato de êxito sem justa causa [R3-10] (analogia `[NÃO VERIFICADO]` para serviços contábeis). A cláusula rescisória e o distrato são o lugar de fixar isso (Res. CFC 1.590/2020 art. 2º, l e art. 6 [R3-2]) |
| gatilho_frequência | Por evento, raro: saída de cliente com projeto ou êxito em aberto |
| porte_alcance | Clientes com projeto de recuperação ou consultoria por projeto |
| quem_faz | Sócio; financeiro |
| onde_é_feita_hoje | Planilha de projetos e de êxito, negociação por e-mail |
| entradas / saídas | Projetos (CON-037), créditos e cronograma (CON-034, CON-035), contrato → posição de encerramento por projeto, valor de êxito devido ou a receber, aditivo ou cláusula no distrato |
| base_legal | Contrato e distrato (Res. CFC 1.590/2020 [R3-2]); jurisprudência de honorários advocatícios de êxito [R3-10] |
| risco_se_falhar | Trabalho não pago; litígio com o cliente; crédito compensado depois da saída sem cobrança |
| tempo_estimado | `[ESTIMATIVA]` 1–2 h por projeto |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | O desligamento puxa os projetos e créditos em aberto, o M3 calcula horas realizadas × orçadas e o êxito proporcional, e o agente rascunha a cláusula para o distrato |
| papel_da_ia | M2 + M3 → **rascunhar** posição e cláusula; decisão e negociação do sócio |
| ferramentas_agênticas | `posicao_projetos_cliente(cliente)`, `calcular_exito_residual(cliente, data)`, `rascunhar_clausula_distrato(cliente)` |
| eventos_timesheet | `consultoria.desligamento.projetos_encerrados` ; `comercial.exito_residual.apurado` |
| fontes_descoberta | [R3-2] [R3-10] |
| etapa | Desligamento |
| nível_automação (provisório) | Próprio (cobrança pelo nível B de D7) |

transversal: CON-036, CON-037, D7 (fim da cobrança).

### CON-106 · Planejar a tributação do encerramento da empresa (baixa)

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Consultoria / Desligamento (baixa) |
| atividade | Antes da baixa, planejar o custo tributário de encerrar: devolução de bens aos sócios a valor contábil ou de mercado, distribuição dos lucros acumulados (separando os de até 2025), aproveitamento ou pedido de restituição de saldos credores e saldo negativo de IRPJ/CSLL, e passivos que ficam com os sócios |
| descrição | A devolução de bens do ativo aos sócios pode ser feita pelo valor contábil ou de mercado (Lei 9.249/1995 art. 22); pelo valor contábil não há ganho de capital na PJ, e o CARF já validou a operação (Ac. 9101-004.709), com controvérsia quando há ajuste a valor justo [R3-6]. Lucros de 2026 em diante pagos a pessoa física acima de R$ 50 mil/mês sofrem retenção de 10%; os acumulados até 2025 têm regra de transição com exigências formais (Lei 15.270/2025 [R3-8], ver CON-012). Saldo negativo de IRPJ/CSLL se pede por PER/DCOMP com prazo de 5 anos e o formulário prevê sucessão e extinção [R3-7]; quem recebe o crédito após a baixa `[NÃO VERIFICADO]`. Saldos de PIS/Cofins e ICMS da transição (CON-025, CON-026) também se perdem se a empresa encerrar sem planejar |
| gatilho_frequência | Por evento, raro: decisão de encerrar |
| porte_alcance | Empresas em encerramento, sobretudo Presumido/Real com imóveis, lucros acumulados ou créditos |
| quem_faz | Sócio ou coordenador, junto com o societário |
| onde_é_feita_hoje | Planilha; muitas vezes não é feito e a baixa segue só o roteiro societário |
| entradas / saídas | Balanço de encerramento, bens e valores contábeis, lucros acumulados por ano, saldos credores → cenários de encerramento com custo por sócio, ordem dos atos (distribuir, devolver capital, pedir restituição, baixar), parecer |
| base_legal | Lei 9.249/1995 art. 22 [R3-6]; Lei 15.270/2025 [R3-8]; IN RFB de restituição e compensação (PER/DCOMP) [R3-7]; responsabilidade dos sócios por débitos na baixa `[NÃO VERIFICADO]` |
| risco_se_falhar | Ganho de capital ou IRRF evitáveis; crédito perdido com a baixa; débitos cobrados dos sócios depois |
| tempo_estimado | `[ESTIMATIVA]` 2–8 h por encerramento |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Quando o processo de baixa é aberto no D1, o agente traz do core o balanço e os saldos, o M3 compara cenários, o M1 cita a base de cada passo e o agente rascunha o parecer e a ordem dos atos para o roteiro da baixa |
| papel_da_ia | M2 → M1 → M3 → **rascunhar** cenários e parecer |
| ferramentas_agênticas | `simular_encerramento(cliente, cenarios)`, `listar_saldos_credores(cliente)`, `rascunhar_parecer(...)`, `ordenar_atos_baixa(cliente)` |
| eventos_timesheet | `consultoria.encerramento.simulado` ; `.parecer_aprovado` |
| fontes_descoberta | [R3-6] [R3-7] [R3-8] |
| etapa | Desligamento |
| nível_automação (provisório) | Próprio (dados do core por B ou F) |

transversal: D1 (baixa da empresa), D5 (balanço de encerramento), CON-012, CON-014, CON-025, CON-026.

### Fontes da rodada 3

Consultadas em 06/11/2026.

- [R3-1] NBC PG 01 (Código de Ética Profissional do Contador, 2019), item 5 (l) e item 18 (d): [Normas Legais](https://www.normaslegais.com.br/legislacao/nbc-1-2019.htm) (texto lido); [CFC, notícia da atualização](https://cfc.org.br/noticias/codigo-de-etica-profissional-do-contador-e-atualizado/)
- [R3-2] Res. CFC 1.590/2020 (contrato e distrato), arts. 2º a 10: [Normas Legais](https://www.normaslegais.com.br/legislacao/resolucao-cfc-1590-2020.htm) (texto lido)
- [R3-3] Res. CGSN 186/2026, art. 3 (início de atividade, opção no ato da inscrição): [Normas Legais](https://www.normaslegais.com.br/legislacao/resolucao-cgsn-186-2026.htm) (texto lido, redação original)
- [R3-4] Res. CGSN 194/2026 (novas datas de corte para início de atividade): [LegisWeb](https://www.legisweb.com.br/noticia/?id=34449) (texto lido)
- [R3-5] Prazo de opção pelo Simples em início de atividade (Res. CGSN 140/2018 art. 6 e alterações): [NetCPA](https://netcpa.com.br/noticias/simples-nacional-novo-prazo-de-opcao-para-empresas-em-inicio-de-atividade-ja-foi-implantado/5556); Res. CGSN 190/2026: [Normas Legais](https://www.normaslegais.com.br/legislacao/Resolucao-cgsn-190-2026.htm) (trechos do buscador)
- [R3-6] Lei 9.249/1995 art. 22: [LegJur](https://www.legjur.com/legislacao/art/lei_00092491995-22); CARF Ac. 9101-004.709: [IBET](https://www.ibet.com.br/irpj-reducao-de-capital-entrega-de-bens-e-direitos-do-ativo-aos-acionistas-valor-contabil) (trechos do buscador)
- [R3-7] PER/DCOMP Web, saldo negativo de IRPJ/CSLL: [RFB, orientação](https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/restituicao-ressarcimento-reembolso-e-compensacao/per_dcomp-web_-saldo-negativo-de-irpj-ou-csll.pdf) (trecho do buscador)
- [R3-8] Lei 15.270/2025, lucros até 2025: [Felsberg Advogados](https://www.felsberg.com.br/lei-15270-tributacao-lucros-dividendos-2026/) (trecho do buscador)
- [R3-9] Revisão e diagnóstico de entrada: [e-Auditoria, revisão fiscal](https://www.e-auditoria.com.br/blog/revisao-fiscal/); [Normas Legais, modelo de contrato de diagnóstico tributário](https://www.normaslegais.com.br/guia/clientes/modelo-servicos-diagnosticos-tributario.htm); [Jornal Contábil, revisão tributária](https://jornalcontabil.com.br/noticia/revisao-tributaria-saiba-como-funciona-para-pequenas-empresas/amp/) (trechos do buscador)
- [R3-10] Êxito em rescisão (advocacia, por analogia): [Migalhas](https://www.migalhas.com.br/quentes/336705/advogado-destituido-unilateralmente-consegue-garantir-honorarios); [Conjur](https://www.conjur.com.br/2018-jun-20/desistir-acoes-obriga-empresa-pagar-honorarios-exito/) (trechos do buscador)
- [R3-11] Distrato e troca de contador na prática: [Jornal Contábil](https://jornalcontabil.com.br/noticia/distrato-de-prestacao-de-servicos-contabeis-como-fazer/); [Contábeis](https://www.contabeis.com.br/noticias/40610/quais-procedimentos-deve-o-contabilista-observar-no-distrato-de-servicos-contabeis/) (trechos do buscador)

# D4 · Descoberta: Trabalhista e Departamento Pessoal

5 de novembro de 2026 · Etapa 1 do [Protocolo de Descoberta](00-protocolo-de-descoberta.md) · agente D4

**Escopo:** tudo o que o escritório faz **em volta** do core (Domínio, Alterdata, Contmatic) no DP: admissão e coleta de documentos, variáveis da folha, envio de holerites e guias, férias, rescisões, convenções coletivas e data-base, eSocial (pendências e eventos), FGTS Digital, DCTFWeb do DP, Domicílio Eletrônico Trabalhista (DET), ponto eletrônico (Portaria 671/2021), afastamentos e atestados, SST (ASO, PGR/PCMSO), benefícios e pró-labore. O cálculo da folha, das férias e da rescisão e a geração dos eventos eSocial ficam no core (regra 3.7); entram aqui preparar, coletar, conferir, transmitir, comprovar, comunicar, cobrar e controlar.

## Como ler este arquivo

- **62 fichas** (`DP-001` a `DP-062`), agrupadas por subárea, com os campos da seção 2.1 do protocolo.
- **Fontes:** citadas por código (`[T7]` para normas, imprensa e órgãos; `[C3]` para concorrentes) e listadas com link na seção "Fontes" ao final. Todas consultadas em **05/11/2026**.
- **Limitação de método:** nesta sessão a leitura direta de páginas foi bloqueada pela rede (`www.gov.br` e a imprensa contábil recusados pelo proxy; WebFetch e curl falharam). As fontes foram lidas pelos **resumos e trechos do buscador** (WebSearch). Por isso prazos e normas citados têm confiança **média**, e a Etapa 2 (V1) precisa abrir o MOS do eSocial, os manuais do FGTS Digital e do DET, a Portaria MTP 671/2021 compilada e a Portaria MTE 1.131/2025 antes de qualquer prazo virar regra no calendário. Onde as fontes divergiram, as duas versões estão registradas.
- **`tempo_estimado`:** nenhuma fonte pública trouxe medição de tempo por atividade. Todos os tempos são `[ESTIMATIVA]` do agente e devem ser substituídos pelo levantamento com os contadores (Apêndice do Plano).
- **`papel_da_ia`:** motores M1 (legal), M2 (escritório), M3 (cálculo), M4 (ação); níveis **ler**, **rascunhar**, **executar** (executar sempre com cartão de aprovação no chat; nunca automático quando o caminho exigir login pessoal do contador).
- **`eventos_timesheet`:** padrão `dp.<objeto>.<verbo>`; todo evento leva setor `DP`, cliente, empregado (quando houver), usuário ou IA, início, fim e quem aprovou.
- **Ferramentas agênticas** são propostas de nome e assinatura da plataforma, não serviços existentes. O catálogo final sai da Etapa 3.
- `transversal: Dx` indica atividade que se repete em outra aba e deve virar uma ferramenta só.
- Códigos de nível de automação (tabela 2.3) aparecem só como **hipótese** entre parênteses; quem decide é a Etapa 2.

## Achados que mudam as hipóteses do Plano (seções 3 e 4.5)

1. **O FGTS Digital passou a cobrar também o consignado do trabalhador.** Desde a competência fevereiro/2026, parcelas do Crédito do Trabalhador retidas e não repassadas são pagas pela GFD (Portaria MTE 506/2026, segundo as fontes), com vencimento no dia 20 junto com o FGTS [T1][T5]. Rotina nova e mensal que não estava no Plano (DP-013, DP-018).
2. **Crédito do Trabalhador (Lei 15.179/2025)** criou uma conferência mensal: os contratos chegam pelo eSocial/CTPS Digital, o empregador confirma e desconta (rubrica citada como 9219 no S-1200) e precisa tratar o desligamento [T5]. Erro no repasse recai sobre o empregador.
3. **NR-1 com riscos psicossociais vigente desde 26/05/2026** (Portaria MTE 1.419/2024, prorrogada pela 765/2025; fontes divergem entre 25 e 26/05) [T6]. Clientes com PGR desatualizado ficam expostos; o escritório não elabora o PGR, mas é quem cobra o fornecedor de SST (DP-050).
4. **Relatório de Transparência Salarial** (empresas com 100+ empregados) segue em dois ciclos por ano: envio de dados em fevereiro, publicação até março/abril (prorrogada para 06/04/2026) e atualização em agosto (04 a 31/08/2026) [T7]. Rotina semestral não prevista no Plano (DP-055).
5. **IRRF com redutor desde jan/2026** (Lei 15.270/2025: isenção efetiva até R$ 5.000, redução decrescente até R$ 7.350) [T13]. A tabela não mudou, o redutor é calculado depois; conferir holerites e simulações exige M3 com a regra versionada (DP-014).
6. **Licença-paternidade muda em 01/01/2027** (Lei 15.371/2026): 10 dias em 2027, 15 em 2028 e 20 em 2029 (última etapa condicionada, a conferir), com salário-paternidade pago pelo INSS [T19]. Exige orientar clientes ainda em 2026 (DP-047).
7. **Feriados no comércio:** fontes de julho/2026 dizem que a Portaria MTE 1.316/2026 revogou a 3.665/2023 e passou a exigir convenção coletiva para abrir em feriados (salvo atividades do Anexo IV); outra fonte diz que a 3.665 entrou em vigor em 27/05/2026 [T16]. Conflito a resolver na Etapa 2, mas em qualquer leitura a CCT passa a controlar o funcionamento do cliente (DP-037).
8. **Multas do eSocial reestruturadas** (Portaria MTE 1.131/2025, que altera a Portaria MTP 667/2021): base de R$ 443,97 + R$ 104,31 por trabalhador, teto de R$ 44.396,84 por infração, dobra em reincidência; sem a redução de 40% para fatos a partir de 03/07/2025 [T12]. Aumenta o risco das fichas de prazo do eSocial.
9. **FGTS de processo trabalhista pela GFD é obrigatório desde 01/05/2026** (exceto doméstico) [T1]. Rotina rara mas crítica (DP-044).
10. **eSocial em mudança contínua:** NT S-1.3 nº 07/2026 (publicada em 20/10/2026) com implantação escalonada até jan/2027 (troca de CPF não vinculado, validações de cota, CBO, S-2500) [T21]. A plataforma precisa de monitor de notas técnicas (DP-043).
11. **FGTS Digital: nenhuma API pública para terceiros encontrada.** O acesso de escritório é por procuração no Sistema de Procuração Eletrônica (SPE), com certificado digital obrigatório e aceite do procurador [T25]. O Plano marcava "[A CONFIRMAR]"; continua `[NÃO ENCONTRADO]` (busca: "FGTS Digital API", "FGTS Digital webservice", "FGTS Digital integração sistemas").
12. **eSocial tem webservice de download de eventos** (desde o MDE v1.7), com limites de solicitações por dia e janela de datas que variam entre fontes antigas; o acesso por procuração exige perfil para o grupo de eventos [T18]. Base para a conferência core × governo (DP-039).
13. **DIRF extinta para fatos a partir de 2025**; o informe de rendimentos ao empregado continua, com prazo no fim de fevereiro [T14] (DP-054).
14. **A dor mais citada no DP é o que chega atrasado do cliente:** admissão comunicada fora do prazo, atestado depois do fechamento, variáveis, desligamento sem data e reajuste combinado de boca [T23]. Confirma a prioridade P1 do Plano para coleta com prazo e lembrete.

---

## A. Admissão

### DP-001 · Receber a solicitação de admissão do cliente e validar os dados mínimos

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / Admissão |
| atividade | Receber o pedido de admissão (cargo, salário, jornada, data de início, local, experiência) e validar se está completo antes de abrir o processo |
| descrição | Hoje chega por WhatsApp, e-mail ou portal do core (Onvio Portal do Cliente, Alterdata eContador pré-admissão). O analista confere item a item, pede o que falta e, muitas vezes, descobre a admissão na véspera ou depois do início |
| gatilho_frequência | Por evento (cada contratação) |
| porte_alcance | Todos os clientes com empregados (inclui doméstico e MEI com empregado) |
| quem_faz | Analista de DP; atendimento |
| onde_é_feita_hoje | WhatsApp, e-mail, portal do core |
| entradas / saídas | Pedido do cliente → ficha de admissão validada, tarefa com prazo (véspera do início) |
| base_legal | Prazo do S-2200: até o dia anterior ao início da prestação de serviços [T3] |
| risco_se_falhar | Admissão sem registro no eSocial; multa por infração eSocial (Portaria 1.131/2025) [T12]; empregado trabalhando sem registro |
| tempo_estimado | 15–30 min por admissão `[ESTIMATIVA]` |
| concorrentes | Alterdata eContador: pré-admissão via web cria tarefa automática no eTarefas [C3]; Onvio Portal do Cliente tem solicitações tipadas [C2] |
| hipótese_automação | Formulário de admissão (portal e WhatsApp) com campos obrigatórios por tipo de contrato, checagem de piso da CCT (DP-035), alerta quando a data de início é amanhã ou já passou |
| papel_da_ia | M2 ler (perfil do cliente, CCT); M1 ler (regras de contrato); M4 rascunhar (pedido do que falta) |
| ferramentas_agênticas | `abrir_admissao(cliente, dados)`, `validar_admissao(admissao_id)`, `pedir_pendencias(cliente, lista, canal)` |
| eventos_timesheet | `dp.admissao.recebida`, `dp.admissao.validada` |
| fontes_descoberta | [T3], [T12], [T23], [C2], [C3] |

### DP-002 · Coletar e conferir os documentos do empregado

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / Admissão |
| atividade | Pedir, receber e conferir os documentos pessoais do novo empregado (RG/CPF, comprovante de endereço, dependentes, conta bancária, escolaridade, foto) |
| descrição | O analista manda lista por WhatsApp, recebe fotos soltas, renomeia e arquiva; cobra o que falta várias vezes |
| gatilho_frequência | Por evento (cada admissão) |
| porte_alcance | Todos com empregados |
| quem_faz | Analista de DP |
| onde_é_feita_hoje | WhatsApp, e-mail, pasta de rede |
| entradas / saídas | Fotos e PDFs → dossiê digital do empregado, checklist completo |
| base_legal | LGPD (tratamento de dados do empregado) `[NÃO VERIFICADO]` quanto a regras específicas |
| risco_se_falhar | Cadastro errado no eSocial (rejeição, retificação), dependente de IR não informado |
| tempo_estimado | 30–60 min por admissão, espalhados em vários dias `[ESTIMATIVA]` |
| concorrentes | Flash: coleta de documentos admissionais por WhatsApp Business API [C8]; Unico People, Convenia, Gupy Admissão vendem admissão digital ao RH da empresa `[NÃO VERIFICADO]` |
| hipótese_automação | Link de coleta enviado ao próprio empregado (WhatsApp), leitura dos documentos por OCR, checklist automático, cobrança automática até completar |
| papel_da_ia | M4 executar (enviar link, cobrar); M2 ler/rascunhar (extração e conferência de dados do documento) |
| ferramentas_agênticas | `enviar_link_coleta(empregado, checklist)`, `extrair_dados_documento(arquivo)`, `conferir_checklist(admissao_id)` |
| eventos_timesheet | `dp.admissao.documento_recebido`, `dp.admissao.cobranca_enviada` |
| fontes_descoberta | [C8], [T23] |

### DP-003 · Agendar e acompanhar o ASO admissional

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / Admissão · SST |
| atividade | Encaminhar o empregado à clínica de medicina do trabalho e receber o ASO antes do início |
| descrição | O cliente ou o escritório marca na clínica conveniada; o ASO volta em PDF por e-mail ou papel; nem sempre chega antes do primeiro dia |
| gatilho_frequência | Por evento |
| porte_alcance | Todos com empregados (regras de dispensa de PCMSO para ME/EPP de grau de risco 1 e 2 divergem entre fontes [T26]) |
| quem_faz | Analista de DP; cliente |
| onde_é_feita_hoje | Telefone, e-mail, portal da clínica |
| entradas / saídas | Dados do cargo e riscos → guia de encaminhamento, ASO, S-2220 (gerado no core ou pelo fornecedor de SST) |
| base_legal | NR-7 (PCMSO) [T26]; S-2220 até o dia 15 do mês seguinte ao ASO [T11] |
| risco_se_falhar | Multa SST por empregado [T11][T12]; empregado inapto contratado |
| tempo_estimado | 10–20 min por admissão `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` em gestores de escritório; clínicas e softwares de SST (SOC, etc.) fazem do lado delas `[NÃO VERIFICADO]` |
| hipótese_automação | Encaminhamento gerado com dados do cargo, envio à clínica do cliente, prazo e captura do ASO devolvido (anexo lido por OCR: apto/inapto, data) |
| papel_da_ia | M4 executar (encaminhar, cobrar); M2 ler (ASO) |
| ferramentas_agênticas | `encaminhar_aso(empregado, tipo, clinica)`, `registrar_aso(empregado, arquivo)` |
| eventos_timesheet | `dp.aso.encaminhado`, `dp.aso.recebido` |
| fontes_descoberta | [T11], [T12], [T26] |

### DP-004 · Conferir CPF e dados cadastrais antes de transmitir o S-2200

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / Admissão · eSocial |
| atividade | Conferir CPF, nome, data de nascimento e vínculos anteriores antes do envio da admissão |
| descrição | O analista consulta a qualificação cadastral ou descobre a divergência só na rejeição do evento |
| gatilho_frequência | Por evento |
| porte_alcance | Todos com empregados |
| quem_faz | Analista de DP |
| onde_é_feita_hoje | Core (validação), portal eSocial |
| entradas / saídas | Dados do empregado → ok/divergência |
| base_legal | Regras de validação do eSocial (MOS, NT S-1.3 07/2026 cria tratamento de CPF não vinculado) [T21] |
| risco_se_falhar | Rejeição do S-2200 e perda do prazo da véspera |
| tempo_estimado | 5–15 min `[ESTIMATIVA]` |
| concorrentes | Validação feita no próprio core `[NÃO VERIFICADO]` |
| hipótese_automação | Conferência automática no momento da coleta (DP-002); hipótese de consulta de CPF por fornecedor (Etapa 2, V1/V3) |
| papel_da_ia | M2 ler; M4 executar (consulta) |
| ferramentas_agênticas | `consultar_cpf(cpf)`, `validar_cadastro_empregado(empregado)` |
| eventos_timesheet | `dp.cadastro.conferido` |
| fontes_descoberta | [T21] |

### DP-005 · Preparar e colher assinatura do contrato e dos termos de admissão

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / Admissão |
| atividade | Gerar contrato de trabalho (e de experiência), opção ou renúncia de vale-transporte, acordo de compensação/banco de horas, termo de LGPD, ficha de registro, e colher as assinaturas |
| descrição | O core gera parte dos modelos; o resto é Word. O escritório imprime ou manda PDF ao cliente, que colhe assinatura e devolve (quando devolve) |
| gatilho_frequência | Por evento |
| porte_alcance | Todos com empregados |
| quem_faz | Analista de DP; cliente |
| onde_é_feita_hoje | Core, Word, papel, e-mail |
| entradas / saídas | Dados da admissão + cláusulas da CCT → documentos assinados no dossiê |
| base_legal | CLT (contrato, experiência até 90 dias, art. 445) `[NÃO VERIFICADO]`; vale-transporte (Lei 7.418/1985) `[NÃO VERIFICADO]` |
| risco_se_falhar | Contrato de experiência sem assinatura vira indeterminado; acordo de compensação inexistente gera passivo de horas extras |
| tempo_estimado | 20–40 min `[ESTIMATIVA]` |
| concorrentes | Anaclara: assinatura eletrônica pelo WhatsApp para contadores [C10]; plataformas de assinatura genéricas |
| hipótese_automação | Modelos parametrizados por CCT e tipo de contrato, envio para assinatura eletrônica ao empregado e ao cliente, arquivo automático |
| papel_da_ia | M2 rascunhar (preencher modelos); M1 ler (cláusulas obrigatórias da CCT); M4 executar (enviar para assinatura) |
| ferramentas_agênticas | `gerar_documentos_admissao(admissao_id)`, `enviar_para_assinatura(documentos, signatarios)` |
| eventos_timesheet | `dp.admissao.documentos_gerados`, `dp.admissao.assinatura_concluida` |
| fontes_descoberta | [C10] |

### DP-006 · Transmitir a admissão no prazo e conferir o recibo

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / Admissão · eSocial |
| atividade | Garantir que o S-2200 (ou S-2190, admissão preliminar) foi transmitido até a véspera e guardar o recibo |
| descrição | Cadastro e envio no core; o controle de "foi mesmo enviado?" é visual. Admissões retroativas exigem tratamento e geram exposição |
| gatilho_frequência | Por evento |
| porte_alcance | Todos com empregados |
| quem_faz | Analista de DP |
| onde_é_feita_hoje | Core (envio), painel do eSocial |
| entradas / saídas | Admissão no core → recibo do eSocial vinculado ao dossiê |
| base_legal | Prazo do S-2200: véspera do início; exceções com S-2190 [T3] |
| risco_se_falhar | Multa por falta de registro (Portaria 1.131/2025) [T12] |
| tempo_estimado | 5–10 min de controle `[ESTIMATIVA]` |
| concorrentes | Controle de transmissão no próprio core |
| hipótese_automação | Conferência core × eSocial por download de eventos (DP-039) e alerta de admissão sem recibo até 18h da véspera (F + A, hipótese) |
| papel_da_ia | M2 ler; M4 executar (alerta e tarefa) |
| ferramentas_agênticas | `verificar_recibo_esocial(cliente, evento, empregado)`, `abrir_tarefa(...)` |
| eventos_timesheet | `dp.esocial.admissao_conferida` |
| fontes_descoberta | [T3], [T12], [T18] |

### DP-007 · Controlar o vencimento dos contratos de experiência

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / Admissão |
| atividade | Avisar o cliente antes do fim do primeiro período e do fim da experiência para decidir prorrogar, efetivar ou desligar |
| descrição | Relatório do core ou planilha; o aviso ao cliente depende da memória do analista. Desligamento depois do prazo muda a modalidade da rescisão |
| gatilho_frequência | Diária (varredura); por evento (vencimento) |
| porte_alcance | Clientes que usam contrato de experiência |
| quem_faz | Analista de DP |
| onde_é_feita_hoje | Core (relatório), planilha |
| entradas / saídas | Datas de admissão e prorrogação → aviso com decisão do cliente registrada |
| base_legal | CLT art. 445 (até 90 dias) e art. 451 (uma prorrogação) `[NÃO VERIFICADO]` |
| risco_se_falhar | Contrato vira indeterminado; rescisão mais cara (aviso prévio, multa do FGTS) |
| tempo_estimado | 5 min por contrato `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` como lembrete ao cliente nos gestores; relatório nos cores `[NÃO VERIFICADO]` |
| hipótese_automação | Alerta D-10 ao cliente por WhatsApp com botões "prorrogar / efetivar / desligar"; resposta abre a tarefa certa |
| papel_da_ia | M2 ler; M4 executar (mensagem com resposta estruturada) |
| ferramentas_agênticas | `listar_experiencias_vencendo(dias)`, `enviar_decisao_cliente(cliente, opcoes)` |
| eventos_timesheet | `dp.experiencia.alerta_enviado`, `dp.experiencia.decisao_registrada` |
| fontes_descoberta | — (prática de mercado; base legal a verificar) |

### DP-008 · Incluir o novo empregado nos benefícios

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / Admissão · Benefícios |
| atividade | Cadastrar o empregado em vale-transporte, vale-refeição/alimentação, plano de saúde e odontológico, seguro de vida exigido pela CCT |
| descrição | Cada operadora tem portal próprio; o escritório faz para alguns clientes, o cliente para outros; quase nunca há registro único |
| gatilho_frequência | Por evento |
| porte_alcance | Clientes com benefícios (CCT frequentemente exige seguro de vida e VR) `[NÃO VERIFICADO]` |
| quem_faz | Analista de DP; cliente |
| onde_é_feita_hoje | Portais das operadoras, planilha |
| entradas / saídas | Dados do empregado → inclusão confirmada, data de início do desconto |
| base_legal | PAT (Decreto 10.854/2021, alterado pelo Decreto 12.712/2025) [T20]; cláusulas da CCT |
| risco_se_falhar | Descumprimento de CCT (multa normativa), desconto errado em folha |
| tempo_estimado | 10–30 min por operadora `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` em gestores de escritório |
| hipótese_automação | Checklist de benefícios por cliente (vindo da CCT e do contrato do cliente), tarefa por operadora, registro do comprovante |
| papel_da_ia | M1 ler (benefícios obrigatórios da CCT); M4 rascunhar (tarefas) |
| ferramentas_agênticas | `listar_beneficios_obrigatorios(cliente)`, `abrir_tarefa(...)` |
| eventos_timesheet | `dp.beneficio.inclusao` |
| fontes_descoberta | [T20] |

---

## B. Folha mensal

### DP-009 · Pedir e cobrar as variáveis da folha dentro do prazo

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / Fechamento da folha |
| atividade | Pedir ao cliente horas extras, faltas, atrasos, comissões, adiantamentos, descontos e afastamentos do mês e cobrar até a data de corte |
| descrição | Mensagem coletiva no WhatsApp ou e-mail; o cliente responde em foto de caderno, áudio, planilha. Cobrança repetida, e o atraso empurra o fechamento |
| gatilho_frequência | Mensal (corte interno, ex.: dia 25–30) |
| porte_alcance | Todos com empregados |
| quem_faz | Analista de DP; atendimento |
| onde_é_feita_hoje | WhatsApp, e-mail, planilha |
| entradas / saídas | Lista de empregados ativos → variáveis por empregado e rubrica |
| base_legal | Pagamento do salário até o 5º dia útil (CLT art. 459) `[NÃO VERIFICADO]` |
| risco_se_falhar | Folha errada, atraso no pagamento, retrabalho com folha complementar, perda de cliente [T23] |
| tempo_estimado | 20–60 min por cliente por mês, somando as cobranças `[ESTIMATIVA]` |
| concorrentes | Onvio Portal do Cliente e Alterdata eContador recebem solicitações tipadas [C2][C3]; gestores de tarefas (Gestta, Acessórias) lembram o prazo [C5] |
| hipótese_automação | Formulário mensal pré-preenchido com os empregados ativos (lido do core), aberto por WhatsApp; cobrança escalonada automática; leitura de foto/áudio para rascunho de variáveis |
| papel_da_ia | M4 executar (envio e cobrança); M2 rascunhar (transformar foto, áudio e planilha em variáveis por rubrica, para conferência humana) |
| ferramentas_agênticas | `enviar_formulario_variaveis(cliente, competencia)`, `cobrar_variaveis(cliente)`, `extrair_variaveis(mensagem_ou_arquivo)` |
| eventos_timesheet | `dp.variaveis.solicitadas`, `dp.variaveis.cobradas`, `dp.variaveis.recebidas` |
| fontes_descoberta | [T23], [C2], [C3], [C5] |

### DP-010 · Receber e conferir o espelho de ponto e os arquivos do relógio

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / Fechamento da folha · Ponto |
| atividade | Receber o espelho de ponto ou o AEJ/AFD do sistema de ponto do cliente e apurar horas extras, faltas e adicional noturno |
| descrição | O cliente manda PDF do espelho ou exporta do sistema; o analista confere à mão inconsistências (marcação ímpar, intervalo menor que o legal) |
| gatilho_frequência | Mensal |
| porte_alcance | Clientes com controle de ponto (obrigatório acima de 20 empregados por estabelecimento, CLT art. 74) `[NÃO VERIFICADO]` |
| quem_faz | Analista de DP |
| onde_é_feita_hoje | E-mail, sistema de ponto do cliente, core (importação) |
| entradas / saídas | Espelho/AEJ → horas por rubrica, lista de inconsistências para o cliente |
| base_legal | Portaria MTP 671/2021: REP-A, REP-C, REP-P; AFD obrigatório; AEJ substituiu o ACJEF [T4] |
| risco_se_falhar | Horas pagas erradas; passivo trabalhista |
| tempo_estimado | 15–60 min por cliente `[ESTIMATIVA]` |
| concorrentes | Alterdata ponto eletrônico integrado [C12]; Pontotel e outros REP-P exportam para folhas `[NÃO VERIFICADO]` |
| hipótese_automação | Importação do AEJ no leiaute da Portaria 671 (F), regras de apuração da CCT, relatório de inconsistências ao cliente antes do fechamento |
| papel_da_ia | M3 executar (apuração determinística); M1 ler (regras de jornada e CCT); M2 rascunhar (mensagem de inconsistências) |
| ferramentas_agênticas | `importar_aej(cliente, arquivo)`, `apurar_jornada(cliente, competencia)`, `listar_inconsistencias_ponto(cliente)` |
| eventos_timesheet | `dp.ponto.importado`, `dp.ponto.conferido` |
| fontes_descoberta | [T4], [C12] |

### DP-011 · Lançar ou importar as variáveis no core

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / Fechamento da folha |
| atividade | Digitar ou importar as variáveis de cada empregado no sistema de folha |
| descrição | Digitação manual, rubrica por rubrica; alguns cores aceitam importação por planilha em leiaute próprio |
| gatilho_frequência | Mensal |
| porte_alcance | Todos com empregados |
| quem_faz | Analista de DP |
| onde_é_feita_hoje | Core |
| entradas / saídas | Variáveis conferidas → lançamentos no core |
| base_legal | — |
| risco_se_falhar | Erro de digitação na folha |
| tempo_estimado | 2–5 min por empregado `[ESTIMATIVA]` |
| concorrentes | Alterdata: Assistente Virtual (AVA) importa férias agendadas pelo eContador [C3] |
| hipótese_automação | Exportar as variáveis no leiaute de importação de cada core (F); o leiaute de cada core é pergunta para a Etapa 2 (V3) |
| papel_da_ia | M4 executar (gerar arquivo); M2 ler |
| ferramentas_agênticas | `exportar_variaveis_core(cliente, competencia, core)` |
| eventos_timesheet | `dp.variaveis.exportadas` |
| fontes_descoberta | [C3] |

### DP-012 · Enviar a prévia da folha ao cliente e registrar a aprovação

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / Fechamento da folha |
| atividade | Mandar o resumo/prévia da folha para o cliente aprovar antes de fechar e gerar guias |
| descrição | PDF por e-mail ou WhatsApp; "ok" do cliente fica perdido na conversa; correções chegam depois do fechamento |
| gatilho_frequência | Mensal |
| porte_alcance | Todos com empregados (muitos escritórios só fazem para clientes maiores) |
| quem_faz | Analista de DP |
| onde_é_feita_hoje | Core (relatório), WhatsApp, e-mail |
| entradas / saídas | Prévia → aprovação registrada com data e autor |
| base_legal | — |
| risco_se_falhar | Folha complementar, retificação de eventos, desgaste com o cliente |
| tempo_estimado | 10–20 min por cliente `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` como fluxo de aprovação formal nos gestores pesquisados |
| hipótese_automação | Prévia com comparação automática ao mês anterior (variação por empregado), botão de aprovar, prazo; aprovação vira registro auditável |
| papel_da_ia | M3 ler (variações); M2 rascunhar (resumo em linguagem simples das diferenças); M4 executar (envio) |
| ferramentas_agênticas | `gerar_previa_comparada(cliente, competencia)`, `solicitar_aprovacao(cliente, documento)` |
| eventos_timesheet | `dp.folha.previa_enviada`, `dp.folha.aprovada` |
| fontes_descoberta | — |

### DP-013 · Conferir os descontos do Crédito do Trabalhador (consignado)

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / Fechamento da folha · Consignado |
| atividade | Consultar os contratos de consignado ativos dos empregados, confirmar o desconto na folha e conferir o repasse |
| descrição | Os contratos aparecem no eSocial/portal do empregador; o analista confere se o valor bate com o core e se cabe na margem; em desligamento, precisa tratar o saldo |
| gatilho_frequência | Mensal; por evento (novo contrato, desligamento) |
| porte_alcance | Todos com empregados CLT |
| quem_faz | Analista de DP |
| onde_é_feita_hoje | Portal eSocial / Crédito do Trabalhador, core |
| entradas / saídas | Contratos ativos → desconto em folha (rubrica citada como 9219 no S-1200), repasse pela GFD |
| base_legal | Lei 15.179/2025; Portaria MTE 435/2025 (compilada em 26/06/2026); parcelas vencidas pela GFD desde a competência fev/2026 (Portaria MTE 506/2026) [T1][T5] |
| risco_se_falhar | Erro no repasse recai sobre o empregador; encargos moratórios sobre parcela retida e não recolhida [T1][T5] |
| tempo_estimado | 5–15 min por cliente `[ESTIMATIVA]` |
| concorrentes | Questor: módulo e-Consignado com mensagem no holerite [C6] |
| hipótese_automação | Lista mensal de contratos por cliente, conferência com o core, alerta de margem e de desligamento com consignado ativo |
| papel_da_ia | M2 ler; M3 executar (margem); M4 rascunhar (aviso ao cliente) |
| ferramentas_agênticas | `listar_consignados(cliente, competencia)`, `conferir_consignado_folha(cliente, competencia)` |
| eventos_timesheet | `dp.consignado.conferido` |
| fontes_descoberta | [T1], [T5], [C6] |

### DP-014 · Atualizar tabelas e parâmetros legais e conferir a aplicação

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / Parâmetros |
| atividade | Conferir se o core aplicou as tabelas vigentes (INSS, IRRF e redutor, salário-família, salário mínimo, pisos da CCT) e se os holerites refletem a regra nova |
| descrição | O fornecedor do core atualiza; o escritório confere por amostragem quando alguém reclama. A mudança do IRRF em 2026 gerou dúvidas e cálculos divergentes entre fontes [T13] |
| gatilho_frequência | Anual (janeiro); por evento (lei nova, CCT nova) |
| porte_alcance | Todos com empregados ou pró-labore |
| quem_faz | Coordenador de DP |
| onde_é_feita_hoje | Core, sites de notícias |
| entradas / saídas | Norma nova → checklist de parâmetros conferidos, amostra de holerites recalculada |
| base_legal | Lei 15.270/2025 (redutor do IRRF: isenção até R$ 5.000, transição até R$ 7.350) [T13]; salário mínimo 2026 `[NÃO ENCONTRADO]` (buscado em "salário mínimo 2026 valor") |
| risco_se_falhar | Retenção errada em massa, retificação de eventos e DCTFWeb |
| tempo_estimado | 2–4 h por mudança, para a carteira `[ESTIMATIVA]` |
| concorrentes | Fornecedores de core publicam notas (Alterdata, Senior) [T13] |
| hipótese_automação | M3 com tabelas versionadas recalcula uma amostra de cada cliente e aponta divergências com o holerite do core |
| papel_da_ia | M1 ler (norma); M3 executar (recálculo); M2 ler (holerites) |
| ferramentas_agênticas | `recalcular_amostra_folha(cliente, competencia)`, `comparar_holerite(empregado, competencia)` |
| eventos_timesheet | `dp.parametros.conferidos` |
| fontes_descoberta | [T13] |

### DP-015 · Calcular e processar o pró-labore e as retiradas dos sócios

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / Pró-labore (transversal: D2, D5) |
| atividade | Definir com o cliente o valor do pró-labore, lançar, gerar recibo e INSS/IRRF, e separar de distribuição de lucros |
| descrição | Valor combinado uma vez e esquecido; ajustes por fator R ou por reajuste do salário mínimo acontecem tarde |
| gatilho_frequência | Mensal; anual (revisão) |
| porte_alcance | Sociedades com sócios administradores; Simples com fator R |
| quem_faz | Analista de DP; analista fiscal |
| onde_é_feita_hoje | Core |
| entradas / saídas | Decisão do sócio → pró-labore no eSocial (S-1200 de contribuinte individual), DCTFWeb |
| base_legal | Fator R e Anexo III/V (LC 123/2006) — ver D2 FIS do fator R; alíquota do contribuinte individual `[NÃO VERIFICADO]` |
| risco_se_falhar | Mudança de anexo do Simples (custo tributário); autuação previdenciária |
| tempo_estimado | 5–10 min por cliente por mês `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` simulação integrada de pró-labore × fator R em gestores (D2 registra o mesmo) |
| hipótese_automação | Simulação mensal "pró-labore mínimo que mantém o Anexo III" antes do fechamento (já descrita no Plano 1.5) e recibo automático |
| papel_da_ia | M2 ler (folha e receita); M1 ler (regra vigente); M3 executar (simulação); M4 rascunhar (proposta ao sócio) |
| ferramentas_agênticas | `simular_prolabore_fator_r(cliente, competencia)` |
| eventos_timesheet | `dp.prolabore.processado` |
| fontes_descoberta | D2 (fator R) |

### DP-016 · Fechar os eventos periódicos do eSocial e tratar rejeições

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / eSocial |
| atividade | Transmitir S-1200, S-1210 e o fechamento S-1299, ler retornos e corrigir rejeições a tempo |
| descrição | Envio pelo core; retornos de erro lidos um a um; rejeição não tratada vira atraso [T23] |
| gatilho_frequência | Mensal (dia 15 do mês seguinte, segundo a Nota Orientativa 2019.18; conferir no MOS vigente) [T3] |
| porte_alcance | Todos com folha ou pró-labore |
| quem_faz | Analista de DP |
| onde_é_feita_hoje | Core, portal eSocial |
| entradas / saídas | Folha fechada → eventos aceitos, totalizadores, base para DCTFWeb e FGTS Digital |
| base_legal | MOS do eSocial; prazos da NO 2019.18 [T3] |
| risco_se_falhar | Multa eSocial [T12]; DCTFWeb e GFD incorretas; CND bloqueada (D2) |
| tempo_estimado | 10–30 min por cliente; mais em rejeições `[ESTIMATIVA]` |
| concorrentes | Cores fazem o envio; `[NÃO ENCONTRADO]` painel consolidado de rejeições por carteira em gestores |
| hipótese_automação | Painel de status do fechamento de todos os clientes (lido do core ou do download de eventos), explicação das rejeições em linguagem simples e tarefa automática |
| papel_da_ia | M2 ler; M1 ler (regra de validação); M2 rascunhar (o que corrigir) |
| ferramentas_agênticas | `status_fechamento_esocial(cliente, competencia)`, `explicar_rejeicao(codigo, evento)` |
| eventos_timesheet | `dp.esocial.fechamento_enviado`, `dp.esocial.rejeicao_tratada` |
| fontes_descoberta | [T3], [T12], [T23] |

### DP-017 · Conferir a DCTFWeb do DP e emitir o DARF

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / DCTFWeb (transversal: D2) |
| atividade | Conferir a DCTFWeb gerada pelos totalizadores do eSocial (e EFD-Reinf), transmitir e emitir o DARF previdenciário e de IRRF do trabalho |
| descrição | Feita no e-CAC/DCTFWeb; divergência entre folha e declaração é comum; DCTFWeb em andamento bloqueia a CND (D2) |
| gatilho_frequência | Mensal (prazo de entrega no último dia útil do mês seguinte, IN RFB 2.248/2025, citada em D2 [S8]); vencimento do DARF `[NÃO VERIFICADO]` |
| porte_alcance | Todos com folha ou pró-labore |
| quem_faz | Analista de DP ou fiscal |
| onde_é_feita_hoje | e-CAC (DCTFWeb) |
| entradas / saídas | Totalizadores → declaração transmitida, DARF numerado |
| base_legal | DARF numerado emitido pela DCTFWeb também para IRRF do trabalho desde o PA 05/2023 [T27] |
| risco_se_falhar | Multa por atraso, CND bloqueada, débito em cobrança |
| tempo_estimado | 10–20 min por cliente `[ESTIMATIVA]` |
| concorrentes | Integra Contador (SERPRO) tem serviços de DCTFWeb (D2 [S2][S3]); Questor guias automatizadas (D2 [C14]) |
| hipótese_automação | Usar o mesmo caminho do D2 (Integra Contador, A$): transmitir, emitir DARF e conferir a soma contra a folha |
| papel_da_ia | M2 ler; M3 executar (conferência de valores); M4 executar com aprovação (transmissão) |
| ferramentas_agênticas | `conferir_dctfweb_folha(cliente, competencia)`, `emitir_darf_dctfweb(cliente, competencia)` |
| eventos_timesheet | `dp.dctfweb.conferida`, `dp.dctfweb.transmitida` |
| fontes_descoberta | [T27], D2 [S2][S3][S8] |

### DP-018 · Emitir e conferir a guia do FGTS Digital (GFD)

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / FGTS Digital |
| atividade | Emitir a GFD mensal (FGTS e, quando houver, consignado), conferir com a folha e enviar ao cliente |
| descrição | Acesso ao portal FGTS Digital por procuração e certificado, cliente por cliente; guia paga por Pix |
| gatilho_frequência | Mensal (dia 20 do mês seguinte; dia não útil antecipa) [T1] |
| porte_alcance | Todos os empregadores, exceto doméstico, MEI e segurado especial, que seguem no DAE do eSocial [T1] |
| quem_faz | Analista de DP |
| onde_é_feita_hoje | Portal FGTS Digital |
| entradas / saídas | Remunerações do eSocial → GFD (Pix), comprovante |
| base_legal | FGTS Digital; Portaria MTE 506/2026 (consignado) [T1]; emissão antecipada não muda o vencimento [T1] |
| risco_se_falhar | Encargos e multa (Portaria 1.131/2025 cita 30% sobre o débito de FGTS no Anexo I, segundo fonte secundária) [T12]; empregado sem depósito |
| tempo_estimado | 5–10 min por cliente `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` emissão automática de GFD por terceiros (sem API pública localizada) |
| hipótese_automação | Hipótese C-cert (robô no portal com e-CNPJ do escritório + procuração SPE) ou D (tarefa + upload da guia); envio automático ao cliente. Etapa 2 (V1) decide |
| papel_da_ia | M4 executar (envio); M2 ler (guia extraída do PDF); M3 executar (conferência com folha) |
| ferramentas_agênticas | `registrar_guia_fgts(cliente, competencia, arquivo)`, `conferir_gfd_folha(cliente, competencia)` |
| eventos_timesheet | `dp.fgts.guia_emitida`, `dp.fgts.guia_conferida` |
| fontes_descoberta | [T1], [T12], [T25] |

### DP-019 · Distribuir os holerites aos empregados e registrar a ciência

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / Holerites |
| atividade | Enviar o recibo de pagamento a cada empregado (ou ao cliente para distribuir) e guardar a prova de entrega/assinatura |
| descrição | PDF único por e-mail ao cliente, que imprime e colhe assinatura; ou portal do empregado do core |
| gatilho_frequência | Mensal; também em férias, 13º e rescisão |
| porte_alcance | Todos com empregados |
| quem_faz | Analista de DP; cliente |
| onde_é_feita_hoje | E-mail, papel, Onvio Portal do Empregado [C1] |
| entradas / saídas | Holerites do core → entrega individual com comprovação |
| base_legal | Recibo de pagamento (CLT art. 464) `[NÃO VERIFICADO]` |
| risco_se_falhar | Falta de prova de pagamento em reclamatória |
| tempo_estimado | 15–30 min por cliente `[ESTIMATIVA]` |
| concorrentes | Onvio Portal do Empregado publica só documentos gerados pela folha do Domínio [C1]; Questor Q-Colabore envia documentos de RH [C6]; apps de RH (Convenia, Sólides) `[NÃO VERIFICADO]` |
| hipótese_automação | Separar o PDF do core por empregado, enviar por WhatsApp/portal com aceite eletrônico, registro de leitura; funciona com qualquer core (diferencial frente ao portal do Domínio) |
| papel_da_ia | M4 executar; M2 ler (separação e identificação por CPF) |
| ferramentas_agênticas | `separar_holerites(arquivo)`, `enviar_holerites(cliente, competencia, canal)` |
| eventos_timesheet | `dp.holerite.enviado`, `dp.holerite.ciencia` |
| fontes_descoberta | [C1], [C6] |

### DP-020 · Enviar guias e resumo da folha ao cliente

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / Guias (transversal: D2, D5, D7) |
| atividade | Mandar ao cliente, num só pacote, GFD, DARF da DCTFWeb, guia sindical, resumo da folha e líquido a pagar, com vencimentos |
| descrição | E-mails ou mensagens separadas por guia; cliente pergunta "qual é essa?" |
| gatilho_frequência | Mensal |
| porte_alcance | Todos com empregados |
| quem_faz | Analista de DP; atendimento |
| onde_é_feita_hoje | E-mail, WhatsApp, portal do core |
| entradas / saídas | Guias + resumo → pacote entregue com protocolo de leitura |
| base_legal | — |
| risco_se_falhar | Guia não paga, multa e encargos; cliente culpa o escritório |
| tempo_estimado | 10–15 min por cliente `[ESTIMATIVA]` |
| concorrentes | Gestta e Acessórias: envio de guias com protocolo [C5] `[NÃO VERIFICADO]` em detalhe; Questor guias automatizadas (D2 [C14]) |
| hipótese_automação | Ferramenta única de "enviar guia" (transversal), com mensagem explicativa por guia, lembrete na véspera e confirmação de pagamento |
| papel_da_ia | M4 executar; M2 rascunhar (resumo em linguagem do cliente) |
| ferramentas_agênticas | `enviar_pacote_guias(cliente, competencia, setor="DP")` |
| eventos_timesheet | `dp.guias.enviadas` |
| fontes_descoberta | [C5] |

### DP-021 · Conferir o pagamento das guias e cobrar o que ficou em aberto

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / Guias (transversal: D2) |
| atividade | Confirmar que a GFD e o DARF foram pagos e cobrar o cliente quando não |
| descrição | Quase nunca é feito de forma sistemática; o problema aparece na CND ou na fiscalização |
| gatilho_frequência | Mensal (D+1 do vencimento) |
| porte_alcance | Todos com folha |
| quem_faz | Analista de DP |
| onde_é_feita_hoje | Portal FGTS Digital, e-CAC, comprovante do cliente |
| entradas / saídas | Guias emitidas → situação paga/aberta, cobrança |
| base_legal | — |
| risco_se_falhar | Encargos moratórios, CRF irregular, multa |
| tempo_estimado | 5 min por cliente `[ESTIMATIVA]` |
| concorrentes | D2 registra "Pagamento Web" do Integra Contador para DARF; para FGTS `[NÃO ENCONTRADO]` |
| hipótese_automação | DARF: consulta de pagamento (D2). FGTS: hipótese de leitura do extrato da GFD no portal (C-cert) ou comprovante enviado pelo cliente (D) |
| papel_da_ia | M2 ler; M4 executar (cobrança) |
| ferramentas_agênticas | `verificar_pagamento_guia(cliente, guia_id)`, `cobrar_pagamento(cliente, guia_id)` |
| eventos_timesheet | `dp.guias.pagamento_conferido` |
| fontes_descoberta | D2 [S2] |

### DP-022 · Gerar o arquivo ou a lista de pagamento dos salários

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / Pagamento |
| atividade | Gerar arquivo bancário (CNAB) ou lista de líquidos/chaves Pix para o cliente pagar salários, férias e rescisões |
| descrição | Core gera CNAB para alguns bancos; para o resto, planilha enviada ao cliente |
| gatilho_frequência | Mensal; por evento |
| porte_alcance | Clientes que pagam por banco |
| quem_faz | Analista de DP |
| onde_é_feita_hoje | Core, planilha, internet banking do cliente |
| entradas / saídas | Líquidos → arquivo/lista; comprovante de pagamento de volta |
| base_legal | Pagamento até o 5º dia útil `[NÃO VERIFICADO]` |
| risco_se_falhar | Atraso de salário, multa normativa da CCT |
| tempo_estimado | 10–20 min `[ESTIMATIVA]` |
| concorrentes | Cores geram CNAB `[NÃO VERIFICADO]` |
| hipótese_automação | Lista de pagamento enviada ao cliente com prazo; hipótese de iniciação de pagamento por Open Finance (Etapa 2, V3) |
| papel_da_ia | M4 rascunhar; M2 ler |
| ferramentas_agênticas | `gerar_lista_pagamento(cliente, competencia)` |
| eventos_timesheet | `dp.pagamento.lista_gerada` |
| fontes_descoberta | — |

---
## C. Férias

### DP-023 · Controlar períodos aquisitivos e concessivos e alertar o risco de dobra

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / Férias |
| atividade | Acompanhar, por empregado, o fim do período concessivo e avisar o cliente com antecedência para programar as férias |
| descrição | Relatório de férias vencidas do core, olhado quando dá; o cliente só lembra quando o empregado pede |
| gatilho_frequência | Mensal (varredura); por evento (vencimento próximo) |
| porte_alcance | Todos com empregados |
| quem_faz | Analista de DP |
| onde_é_feita_hoje | Core (relatório), planilha |
| entradas / saídas | Datas de admissão e férias gozadas → lista de vencimentos e alerta ao cliente |
| base_legal | CLT art. 134 (concessão nos 12 meses seguintes) e art. 137 (dobra quando concedidas fora do prazo); a Súmula 450 do TST (dobra por atraso no pagamento) foi declarada inconstitucional na ADPF 501 (2022) [T9] |
| risco_se_falhar | Pagamento em dobro das férias [T9] |
| tempo_estimado | 5 min por cliente por mês `[ESTIMATIVA]` |
| concorrentes | Alterdata eContador: cliente consulta férias vencidas e a vencer [C3]; ePessoal 3.17.0: previsão e agendamento com validação [C4] |
| hipótese_automação | Alertas D-90/D-60/D-30 ao cliente com sugestão de datas; painel de risco de dobra por carteira |
| papel_da_ia | M2 ler; M1 ler (regras); M4 executar (alerta) |
| ferramentas_agênticas | `listar_ferias_vencendo(cliente, dias)`, `sugerir_programacao_ferias(cliente)` |
| eventos_timesheet | `dp.ferias.alerta_enviado` |
| fontes_descoberta | [T9], [C3], [C4] |

### DP-024 · Programar as férias, emitir aviso e recibo e controlar o pagamento antecipado

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / Férias |
| atividade | Receber as datas do cliente, conferir fracionamento e abono, emitir aviso (30 dias antes) e recibo, e garantir o pagamento até 2 dias antes do início |
| descrição | Pedido chega em cima da hora pelo WhatsApp; aviso emitido com data retroativa; recibo assinado em papel |
| gatilho_frequência | Por evento |
| porte_alcance | Todos com empregados |
| quem_faz | Analista de DP |
| onde_é_feita_hoje | WhatsApp, core, papel |
| entradas / saídas | Datas → aviso, recibo, S-2230 (afastamento por férias, se aplicável) `[NÃO VERIFICADO]`, pagamento |
| base_legal | CLT art. 135 (aviso por escrito 30 dias antes) e art. 145 (pagamento até 2 dias antes); fracionamento flexibilizado pela Lei 13.467/2017 [T9] |
| risco_se_falhar | Dobra (concessão fora do prazo); autuação por atraso no pagamento (a dobra por atraso foi afastada pela ADPF 501) [T9] |
| tempo_estimado | 15–25 min por férias `[ESTIMATIVA]` |
| concorrentes | Alterdata eContador: agendamento de férias pelo app e importação automática no DP pela AVA [C3]; Onvio Portal do Cliente: solicitação de férias [C2] |
| hipótese_automação | Formulário de férias (com validação das regras de fracionamento e da CCT), aviso e recibo para assinatura eletrônica, lembrete de pagamento ao cliente |
| papel_da_ia | M1 ler (regras); M3 executar (datas e prazo de pagamento); M4 executar (envio para assinatura) |
| ferramentas_agênticas | `programar_ferias(empregado, inicio, dias, abono)`, `validar_ferias(programacao_id)` |
| eventos_timesheet | `dp.ferias.programada`, `dp.ferias.aviso_assinado` |
| fontes_descoberta | [T9], [C2], [C3] |

### DP-025 · Organizar férias coletivas

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / Férias |
| atividade | Planejar férias coletivas (fim de ano), comunicar órgão do trabalho e sindicato e tratar empregados com período incompleto |
| descrição | Pedido do cliente em novembro/dezembro; comunicação feita às pressas |
| gatilho_frequência | Anual (geralmente nov–dez); por evento |
| porte_alcance | Indústria, comércio e serviços que param no fim do ano |
| quem_faz | Analista de DP |
| onde_é_feita_hoje | Core, e-mail |
| entradas / saídas | Período → comunicações, avisos, cálculo proporcional |
| base_legal | CLT art. 139 (comunicação com 15 dias de antecedência ao órgão do MTE e ao sindicato; ME/EPP com regras próprias) `[NÃO VERIFICADO]` |
| risco_se_falhar | Férias coletivas irregulares (não valem como férias) |
| tempo_estimado | 1–3 h por cliente `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Campanha em outubro perguntando aos clientes se terão coletivas; checklist com prazos calculados |
| papel_da_ia | M1 ler; M3 executar (prazos); M4 executar (campanha e rascunhos de comunicação) |
| ferramentas_agênticas | `campanha_ferias_coletivas(carteira, ano)` |
| eventos_timesheet | `dp.ferias_coletivas.planejadas` |
| fontes_descoberta | — |

---

## D. Rescisão

### DP-026 · Receber o pedido de desligamento e orientar a modalidade

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / Rescisão |
| atividade | Receber o aviso do cliente, confirmar data, tipo (sem justa causa, pedido, acordo, justa causa, término de experiência) e aviso prévio (trabalhado/indenizado/proporcional), e checar estabilidades |
| descrição | Cliente avisa no WhatsApp "mandei embora hoje"; analista descobre depois a gestante, o acidentado ou o cipeiro |
| gatilho_frequência | Por evento |
| porte_alcance | Todos com empregados |
| quem_faz | Analista de DP; sócio em casos sensíveis |
| onde_é_feita_hoje | WhatsApp, telefone |
| entradas / saídas | Aviso do cliente → modalidade definida, alerta de estabilidade, simulação de custo, prazo de pagamento |
| base_legal | Aviso prévio proporcional (Lei 12.506/2011) `[NÃO VERIFICADO]`; estabilidades (gestante, acidentário, CIPA) `[NÃO VERIFICADO]` |
| risco_se_falhar | Reintegração, indenização por estabilidade, rescisão com custo errado |
| tempo_estimado | 20–40 min `[ESTIMATIVA]` |
| concorrentes | Onvio Portal do Cliente: solicitação de rescisão e de aviso prévio [C2]; Alterdata eContador: pré-demissão [C3]; Questor Q-Net: simulação de rescisão pelo cliente [C6] |
| hipótese_automação | Formulário de desligamento com perguntas guiadas, checagem automática de estabilidades no histórico do empregado (afastamentos, CAT, CIPA, gestação informada), simulação de custo |
| papel_da_ia | M2 ler (histórico); M1 ler (regras); M3 executar (simulação); M4 rascunhar (orientação ao cliente) |
| ferramentas_agênticas | `abrir_desligamento(empregado, data, tipo)`, `checar_estabilidade(empregado)`, `simular_rescisao(empregado, data, tipo)` |
| eventos_timesheet | `dp.rescisao.recebida`, `dp.rescisao.simulada` |
| fontes_descoberta | [C2], [C3], [C6] |

### DP-027 · Controlar o prazo de 10 dias de pagamento e entrega dos documentos

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / Rescisão |
| atividade | Contar o prazo a partir do término do contrato e garantir cálculo, pagamento das verbas e entrega dos documentos dentro dele |
| descrição | Prazo controlado de cabeça; cliente paga atrasado ou esquece de mandar o comprovante |
| gatilho_frequência | Por evento |
| porte_alcance | Todos com empregados |
| quem_faz | Analista de DP |
| onde_é_feita_hoje | Core, WhatsApp |
| entradas / saídas | Data de término → prazo final, comprovante de pagamento, documentos entregues |
| base_legal | CLT art. 477 (10 dias a partir do término do contrato para pagar e entregar os documentos, redação da Lei 13.467/2017); multa do § 8º; jurisprudência diverge sobre guias e homologação fora do prazo [T8] |
| risco_se_falhar | Multa do art. 477 § 8º (um salário do empregado, segundo a CLT `[NÃO VERIFICADO]`) e multa administrativa [T8] |
| tempo_estimado | 5–10 min de controle `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` controle específico de prazo de rescisão em gestores (só tarefa genérica) |
| hipótese_automação | Contagem automática, lembretes ao cliente (D-5, D-2), registro do comprovante de pagamento |
| papel_da_ia | M3 executar (prazo); M4 executar (lembretes) |
| ferramentas_agênticas | `prazo_rescisao(desligamento_id)`, `registrar_comprovante(desligamento_id, arquivo)` |
| eventos_timesheet | `dp.rescisao.prazo_controlado`, `dp.rescisao.paga` |
| fontes_descoberta | [T8] |

### DP-028 · Providenciar o exame demissional ou registrar a dispensa

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / Rescisão · SST |
| atividade | Verificar a data do último ASO e decidir se o demissional é necessário; encaminhar e receber o ASO |
| descrição | Analista consulta a pasta do empregado ou pergunta à clínica |
| gatilho_frequência | Por evento |
| porte_alcance | Todos com empregados |
| quem_faz | Analista de DP |
| onde_é_feita_hoje | Pasta, e-mail, clínica |
| entradas / saídas | Último ASO e grau de risco → encaminhamento ou registro de dispensa |
| base_legal | NR-7 item 7.5.11: demissional em até 10 dias do término; dispensável se o último exame tiver menos de 135 dias (grau de risco 1 e 2) ou 90 dias (3 e 4) [T26] |
| risco_se_falhar | Autuação SST; prova contra o empregador em reclamatória por doença ocupacional |
| tempo_estimado | 5–15 min `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Regra automática com a data do último ASO (DP-049) e o grau de risco do cliente |
| papel_da_ia | M3 executar; M1 ler |
| ferramentas_agênticas | `verificar_dispensa_demissional(empregado, data_termino)` |
| eventos_timesheet | `dp.aso.demissional` |
| fontes_descoberta | [T26] |

### DP-029 · Conferir o S-2299 e a guia rescisória do FGTS

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / Rescisão · eSocial · FGTS Digital |
| atividade | Garantir o envio do desligamento no eSocial e a emissão/pagamento da GFD rescisória |
| descrição | Envio pelo core; GFD rescisória emitida no portal; comprovante enviado ao empregado |
| gatilho_frequência | Por evento |
| porte_alcance | Todos com empregados |
| quem_faz | Analista de DP |
| onde_é_feita_hoje | Core, portal FGTS Digital |
| entradas / saídas | Rescisão calculada → S-2299 aceito, GFD rescisória paga |
| base_legal | S-2299 até o 10º dia após o desligamento (NO 2019.18) [T3]; FGTS rescisório em até 10 dias corridos após o término [T1] |
| risco_se_falhar | Multa eSocial [T12]; empregado sem saque e sem seguro-desemprego |
| tempo_estimado | 10–15 min `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` fora do core |
| hipótese_automação | Mesmo caminho de DP-006 e DP-018 (conferência de recibo + guia), com prazo da rescisão |
| papel_da_ia | M2 ler; M4 executar (alerta, envio da guia) |
| ferramentas_agênticas | `verificar_recibo_esocial(...)`, `registrar_guia_fgts(..., tipo="rescisoria")` |
| eventos_timesheet | `dp.rescisao.esocial_conferido`, `dp.rescisao.fgts_pago` |
| fontes_descoberta | [T1], [T3], [T12] |

### DP-030 · Montar os documentos rescisórios, colher assinaturas e homologar quando a CCT exige

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / Rescisão |
| atividade | Gerar TRCT e termos, colher assinaturas do empregado e do cliente e, se a convenção exigir, agendar assistência sindical |
| descrição | Papel, agendamento no sindicato por telefone; a CCT varia na exigência e no prazo [T8] |
| gatilho_frequência | Por evento |
| porte_alcance | Todos; homologação só onde a CCT prevê |
| quem_faz | Analista de DP |
| onde_é_feita_hoje | Core, papel, sindicato |
| entradas / saídas | Rescisão → documentos assinados, comprovante de homologação |
| base_legal | Homologação obrigatória revogada pela Lei 13.467/2017 (§ 1º do art. 477), salvo previsão em CCT [T8] |
| risco_se_falhar | Multa normativa da CCT; questionamento da quitação |
| tempo_estimado | 20–60 min `[ESTIMATIVA]` |
| concorrentes | Assinatura eletrônica genérica; `[NÃO ENCONTRADO]` agendamento sindical integrado |
| hipótese_automação | Regra da CCT do cliente diz se há homologação e prazo; documentos para assinatura eletrônica; tarefa de agendamento |
| papel_da_ia | M1 ler (cláusula da CCT); M4 executar (assinatura) |
| ferramentas_agênticas | `exige_homologacao(cliente, empregado)`, `enviar_para_assinatura(...)` |
| eventos_timesheet | `dp.rescisao.documentos_assinados`, `dp.rescisao.homologada` |
| fontes_descoberta | [T8] |

### DP-031 · Fazer o requerimento do seguro-desemprego

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / Rescisão |
| atividade | Registrar o requerimento/comunicação de dispensa e entregar ao empregado o comprovante |
| descrição | Hoje pelo Empregador Web com certificado; fontes dizem que o eSocial deve virar a fonte principal e o Empregador Web seria descontinuado, sem confirmação oficial [T22] |
| gatilho_frequência | Por evento (dispensa sem justa causa) |
| porte_alcance | Clientes com dispensa sem justa causa |
| quem_faz | Analista de DP |
| onde_é_feita_hoje | Empregador Web `[NÃO VERIFICADO]` quanto ao status em nov/2026 |
| entradas / saídas | Dados da dispensa → requerimento, comprovante |
| base_legal | Resolução Codefat (obrigatoriedade do Empregador Web desde 2015) [T22] — situação atual `[NÃO VERIFICADO]` |
| risco_se_falhar | Empregado sem benefício; reclamação |
| tempo_estimado | 10 min `[ESTIMATIVA]` |
| concorrentes | Cores geram arquivo do requerimento `[NÃO VERIFICADO]` |
| hipótese_automação | Depende da Etapa 2: se for automático pelo eSocial, vira só conferência; se não, C-cert ou D |
| papel_da_ia | M1 ler (regra vigente); M4 rascunhar (tarefa) |
| ferramentas_agênticas | `abrir_tarefa(...)` |
| eventos_timesheet | `dp.rescisao.seguro_desemprego` |
| fontes_descoberta | [T22] |

### DP-032 · Comunicar o desligamento a terceiros (consignado, benefícios, plano de saúde)

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / Rescisão |
| atividade | Avisar instituição do consignado, operadoras de VT/VR, plano de saúde (inclusive opção de manutenção do plano) e cancelar acessos |
| descrição | Esquecido com frequência; plano continua cobrando, cartão de VR continua carregado |
| gatilho_frequência | Por evento |
| porte_alcance | Clientes com benefícios e consignado |
| quem_faz | Analista de DP; cliente |
| onde_é_feita_hoje | Portais das operadoras, e-mail |
| entradas / saídas | Desligamento → exclusões confirmadas |
| base_legal | Crédito do Trabalhador: empregador informa o desligamento para ajuste do desconto [T5]; manutenção do plano (Lei 9.656/1998, arts. 30 e 31) `[NÃO VERIFICADO]` |
| risco_se_falhar | Custo indevido ao cliente; responsabilidade pelo saldo do consignado |
| tempo_estimado | 10–20 min `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Checklist de desligamento gerado a partir dos benefícios e consignados ativos do empregado |
| papel_da_ia | M2 ler; M4 rascunhar |
| ferramentas_agênticas | `checklist_desligamento(empregado)` |
| eventos_timesheet | `dp.rescisao.terceiros_comunicados` |
| fontes_descoberta | [T5] |

---

## E. Convenções coletivas e sindicatos

### DP-033 · Enquadrar o sindicato e a convenção coletiva de cada cliente

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / Convenções |
| atividade | Definir, para cada cliente e estabelecimento, o sindicato laboral e patronal e o instrumento coletivo aplicável (pela atividade preponderante e base territorial) |
| descrição | Feito na entrada do cliente, às vezes errado ou nunca revisto; categorias diferenciadas esquecidas |
| gatilho_frequência | Por evento (novo cliente, nova filial, mudança de CNAE); anual (revisão) |
| porte_alcance | Todos com empregados |
| quem_faz | Coordenador de DP |
| onde_é_feita_hoje | Sistema Mediador (consulta pública), sites de sindicatos, planilha |
| entradas / saídas | CNAE, município, atividades → sindicato e CCT vinculados ao cliente |
| base_legal | Registro dos instrumentos coletivos no Sistema Mediador (IN SRT 16/2013; Portaria MTE 282/2007) [T10] |
| risco_se_falhar | Piso, reajuste e benefícios errados; passivo trabalhista; multa normativa |
| tempo_estimado | 30–90 min por cliente na entrada `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` em gestores de escritório |
| hipótese_automação | Sugestão de enquadramento a partir do CNAE e do município cruzada com a base de instrumentos coletados do Mediador (coletor já planejado), com confirmação humana |
| papel_da_ia | M1 ler (base de CCT); M2 ler (perfil do cliente); M2 rascunhar (sugestão) |
| ferramentas_agênticas | `sugerir_enquadramento_sindical(cliente)`, `vincular_cct(cliente, instrumento)` |
| eventos_timesheet | `dp.cct.enquadrada` |
| fontes_descoberta | [T10] |

### DP-034 · Monitorar a data-base e o registro de novo instrumento coletivo

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / Convenções |
| atividade | Saber quando a CCT de cada cliente vence, acompanhar a negociação e detectar quando o novo instrumento foi registrado |
| descrição | Analista entra no Mediador ou no site do sindicato de tempos em tempos; descobre a nova CCT meses depois e faz retroativo |
| gatilho_frequência | Mensal (varredura); anual (data-base de cada categoria) |
| porte_alcance | Todos com empregados |
| quem_faz | Analista de DP |
| onde_é_feita_hoje | Sistema Mediador, sindicatos, boletins (FIEPR, FINDES publicam boletins de negociações) [T10] |
| entradas / saídas | Lista de CCTs da carteira → alerta de instrumento novo, resumo das cláusulas que mudaram |
| base_legal | Instrumentos registrados ficam disponíveis para consulta pública no MTE [T10] |
| risco_se_falhar | Reajuste não aplicado; diferenças retroativas acumuladas |
| tempo_estimado | 2–6 h por mês para a carteira `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` monitor de CCT em gestores; download em massa do Mediador `[NÃO ENCONTRADO]` (buscado: "Mediador download", "Mediador consulta convenções") |
| hipótese_automação | Coletor periódico do Mediador (C-captcha ou C, a verificar), comparação com a versão anterior (diff de cláusulas), alerta por cliente afetado |
| papel_da_ia | M1 ler e rascunhar (resumo das mudanças com citação da cláusula); M2 ler (clientes afetados); M4 executar (avisos) |
| ferramentas_agênticas | `buscar_cct_nova(sindicato)`, `comparar_cct(anterior, nova)`, `clientes_por_cct(instrumento)` |
| eventos_timesheet | `dp.cct.monitorada`, `dp.cct.nova_detectada` |
| fontes_descoberta | [T10] |

### DP-035 · Aplicar reajuste, piso e retroativos da nova CCT

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / Convenções |
| atividade | Atualizar pisos e salários, calcular diferenças retroativas desde a data-base e orientar o cliente sobre o custo |
| descrição | Ajuste manual no core; retroativo calculado em planilha; cliente avisado depois |
| gatilho_frequência | Anual (por categoria); por evento |
| porte_alcance | Todos com empregados |
| quem_faz | Analista de DP |
| onde_é_feita_hoje | Core, planilha |
| entradas / saídas | Cláusulas econômicas → novos salários, diferenças por empregado, comunicação ao cliente |
| base_legal | Instrumento coletivo registrado [T10] |
| risco_se_falhar | Diferenças salariais, multa normativa |
| tempo_estimado | 30 min–2 h por cliente `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | M3 calcula a tabela de reajuste e retroativo por empregado e gera a importação no core (F) e o aviso ao cliente com o custo |
| papel_da_ia | M1 ler (cláusula); M3 executar (cálculo); M4 rascunhar (comunicação) |
| ferramentas_agênticas | `calcular_reajuste_cct(cliente, instrumento)`, `exportar_reajuste_core(...)` |
| eventos_timesheet | `dp.cct.reajuste_aplicado` |
| fontes_descoberta | [T10] |

### DP-036 · Gerir contribuições sindicais e o direito de oposição

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / Convenções |
| atividade | Saber se a CCT cobra contribuição assistencial/negocial, controlar as cartas de oposição dos empregados e descontar e recolher só de quem não se opôs |
| descrição | O sindicato manda boleto; as cartas de oposição chegam ao cliente em papel; o escritório descobre na folha |
| gatilho_frequência | Anual (geralmente após a data-base); por evento |
| porte_alcance | Clientes com CCT que prevê contribuição |
| quem_faz | Analista de DP |
| onde_é_feita_hoje | Papel, e-mail, site do sindicato |
| entradas / saídas | Cláusula + cartas → desconto por empregado, guia ao sindicato |
| base_legal | STF Tema 935 (ARE 1018459): contribuição assistencial constitucional desde que garantido o direito de oposição, sem cobrança retroativa; forma e prazo da oposição definidos pelo instrumento, com IRDR no TST ainda pendente em jul/2026 [T15] |
| risco_se_falhar | Desconto indevido (devolução, ação); ou falta de recolhimento (cobrança do sindicato) |
| tempo_estimado | 15–30 min por cliente por ano `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Leitura da cláusula, prazo de oposição no calendário do cliente, registro das cartas (foto) e lista de desconto |
| papel_da_ia | M1 ler; M2 ler (cartas); M4 rascunhar (aviso ao cliente e aos empregados) |
| ferramentas_agênticas | `regra_contribuicao_cct(cliente)`, `registrar_oposicao(empregado, arquivo)` |
| eventos_timesheet | `dp.sindicato.contribuicao_processada` |
| fontes_descoberta | [T15] |

### DP-037 · Verificar a autorização para trabalho em domingos e feriados

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / Convenções · Jornada |
| atividade | Confirmar, para clientes do comércio, se a CCT autoriza o trabalho em feriados e quais condições impõe, e avisar antes de cada feriado |
| descrição | Hoje o cliente abre e pergunta depois; a regra mudou várias vezes entre 2023 e 2026 |
| gatilho_frequência | Por evento (cada feriado); anual (nova CCT) |
| porte_alcance | Comércio varejista e atividades afins |
| quem_faz | Analista de DP |
| onde_é_feita_hoje | — (consulta ad hoc) |
| entradas / saídas | CCT + calendário de feriados (federal, estadual, municipal) → orientação ao cliente |
| base_legal | Portaria MTE 1.316/2026 (jul/2026) teria revogado a 3.665/2023 e exige CCT para trabalho em feriados no comércio, salvo Anexo IV; outra fonte diz que a 3.665 entrou em vigor em 27/05/2026 — **conflito** [T16] |
| risco_se_falhar | Autuação; passivo de feriado em dobro |
| tempo_estimado | 10 min por cliente por feriado `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Calendário de feriados por município do cliente + regra da CCT; aviso automático 15 dias antes |
| papel_da_ia | M1 ler (portaria e CCT); M2 ler (clientes do comércio); M4 executar (aviso) |
| ferramentas_agênticas | `pode_trabalhar_feriado(cliente, data)`, `avisar_feriado(carteira, data)` |
| eventos_timesheet | `dp.jornada.feriado_orientado` |
| fontes_descoberta | [T16] |

---

## F. eSocial, FGTS Digital, DET e fiscalização

### DP-038 · Monitorar pendências e divergências do eSocial de toda a carteira

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / eSocial |
| atividade | Ver, por cliente, eventos pendentes, rejeitados, não fechados e divergências entre totalizadores e o que o core calculou |
| descrição | Cliente a cliente no core ou no portal; não existe visão de carteira |
| gatilho_frequência | Semanal; mensal (antes do dia 15) |
| porte_alcance | Todos com empregados |
| quem_faz | Coordenador de DP |
| onde_é_feita_hoje | Core, portal eSocial |
| entradas / saídas | Eventos e recibos → painel de pendências por cliente |
| base_legal | MOS do eSocial [T3]; multas da Portaria 1.131/2025 [T12] |
| risco_se_falhar | Multa; DCTFWeb e FGTS errados; benefícios do trabalhador bloqueados (abono e seguro dependem do eSocial) [T22] |
| tempo_estimado | 2–4 h por semana para a carteira `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` painel de carteira em gestores; cores mostram por empresa |
| hipótese_automação | Painel de carteira alimentado pelo download de eventos (DP-039) e pelo core (F), com tarefas automáticas |
| papel_da_ia | M2 ler; M2 rascunhar (diagnóstico); M4 executar (tarefas) |
| ferramentas_agênticas | `pendencias_esocial(carteira)`, `diagnosticar_divergencia(cliente, competencia)` |
| eventos_timesheet | `dp.esocial.monitorado` |
| fontes_descoberta | [T3], [T12], [T22] |

### DP-039 · Baixar e guardar os XMLs e recibos do eSocial e conciliar com o core

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / eSocial |
| atividade | Baixar os eventos transmitidos e seus recibos, guardar como prova e comparar com a base do core |
| descrição | Raramente feito; necessário em troca de core, troca de escritório, fiscalização e reclamatória |
| gatilho_frequência | Mensal (ideal); por evento (novo cliente vindo de outro escritório) |
| porte_alcance | Todos com empregados |
| quem_faz | Analista de DP |
| onde_é_feita_hoje | Portal eSocial (eSocial Download) |
| entradas / saídas | Período → XMLs e recibos arquivados, relatório de diferenças |
| base_legal | Webservice de solicitação de download de eventos (MDE v1.7); acesso por procuração exige perfil para o grupo de eventos; limites de solicitação por dia variam entre fontes [T18] |
| risco_se_falhar | Perda de prova; retrabalho na migração |
| tempo_estimado | 30–60 min por cliente na migração `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Rotina noturna de download por webservice (A, a verificar) com e-CNPJ do escritório + procuração, arquivo por cliente e comparação |
| papel_da_ia | M4 executar (rotina); M2 ler |
| ferramentas_agênticas | `baixar_eventos_esocial(cliente, periodo)`, `conciliar_esocial_core(cliente, periodo)` |
| eventos_timesheet | `dp.esocial.download` |
| fontes_descoberta | [T18] |

### DP-040 · Ler o Domicílio Eletrônico Trabalhista (DET) de todos os clientes

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / DET |
| atividade | Entrar no DET de cada cliente, ler notificações e intimações da Inspeção do Trabalho e abrir o tratamento |
| descrição | Acesso por cliente com certificado; muitos escritórios não fazem com regularidade |
| gatilho_frequência | Diária ou semanal (ciência tácita em 15 dias) [T2] |
| porte_alcance | Todos os empregadores (obrigatório para todos os portes desde 01/08/2024) [T2] |
| quem_faz | Analista de DP |
| onde_é_feita_hoje | Portal DET |
| entradas / saídas | Caixa do DET → notificações lidas, tarefas com prazo |
| base_legal | CLT art. 628-A (Lei 14.261/2021); ciência na abertura ou tácita após 15 dias corridos (contagem em fim de semana diverge entre fontes) [T2] |
| risco_se_falhar | Autuação e multa sem que o cliente saiba; prazo de defesa perdido [T2] |
| tempo_estimado | 2–5 min por cliente por leitura `[ESTIMATIVA]` |
| concorrentes | Quark RH: detecção de notificações não lidas no DET [T2 · quarkrh] `[NÃO VERIFICADO]` em detalhe; D2 trata o DTE fiscal |
| hipótese_automação | Robô de leitura com e-CNPJ do escritório + procuração (C-cert, a verificar; API `[NÃO ENCONTRADO]`), resumo da notificação e prazo calculado |
| papel_da_ia | M2 ler; M1 ler (norma citada na notificação); M4 executar (tarefa e aviso ao cliente) |
| ferramentas_agênticas | `ler_caixa_det(cliente)`, `resumir_notificacao(arquivo)` |
| eventos_timesheet | `dp.det.lido`, `dp.det.notificacao_tratada` |
| fontes_descoberta | [T2] |

### DP-041 · Atender notificação ou fiscalização do trabalho

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / Fiscalização |
| atividade | Reunir documentos pedidos (registros, ponto, recibos, ASOs, FGTS), responder no prazo e acompanhar auto de infração e defesa |
| descrição | Rara mas crítica; documentos espalhados entre cliente, core e pasta |
| gatilho_frequência | Por evento |
| porte_alcance | Todos com empregados |
| quem_faz | Coordenador de DP; sócio; advogado |
| onde_é_feita_hoje | DET, e-mail, papel |
| entradas / saídas | Notificação → dossiê enviado, defesa, controle de prazo |
| base_legal | CLT art. 628-A e 630 [T2]; valores de multa (Portaria 1.131/2025) [T12] |
| risco_se_falhar | Multas por empregado e por infração [T12] |
| tempo_estimado | 2–10 h por fiscalização `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Montagem automática do dossiê a partir do arquivo digital (DP-060), lista do que falta, prazos |
| papel_da_ia | M1 ler; M2 ler e rascunhar (dossiê e minuta de resposta); M3 executar (estimativa da multa) |
| ferramentas_agênticas | `montar_dossie_fiscalizacao(cliente, itens)`, `estimar_multa_trabalhista(infracao, empregados)` |
| eventos_timesheet | `dp.fiscalizacao.atendida` |
| fontes_descoberta | [T2], [T12] |

### DP-042 · Controlar procurações e acessos ao eSocial, FGTS Digital e DET

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / Acessos (transversal: D1) |
| atividade | Pedir ao cliente a procuração eletrônica de cada sistema, aceitar como procurador, controlar validade e grupos de poderes |
| descrição | Cada sistema tem seu fluxo: autorizações de acesso da RFB (D1), SPE do FGTS Digital (validade até 5 anos, aceite pelo procurador, certificado obrigatório) e perfis do DET |
| gatilho_frequência | Por evento (novo cliente, vencimento); mensal (varredura) |
| porte_alcance | Todos com empregados |
| quem_faz | Analista de DP; atendimento |
| onde_é_feita_hoje | Portais gov.br, planilha |
| entradas / saídas | Cliente → procurações válidas por sistema e por grupo de eventos |
| base_legal | SPE do FGTS Digital [T25]; grupos de eventos na procuração do eSocial [T18]; mudança de 05/12/2025 nas autorizações da RFB (D1 [F8][F9]) |
| risco_se_falhar | Escritório sem acesso no dia do vencimento |
| tempo_estimado | 15–30 min por cliente na entrada `[ESTIMATIVA]` |
| concorrentes | D1 registra lembretes de certificado em concorrentes; `[NÃO ENCONTRADO]` controle de procuração por sistema trabalhista |
| hipótese_automação | Matriz cliente × sistema × validade, com passo a passo enviado ao cliente e teste periódico de acesso |
| papel_da_ia | M2 ler; M4 executar (guia ao cliente, alerta) |
| ferramentas_agênticas | `status_procuracoes(cliente)`, `enviar_guia_procuracao(cliente, sistema)` |
| eventos_timesheet | `dp.acesso.procuracao_controlada` |
| fontes_descoberta | [T18], [T25], D1 |

### DP-043 · Acompanhar notas técnicas do eSocial e mudanças na legislação trabalhista

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / Atualização |
| atividade | Saber o que mudou (leiaute, validação, norma, portaria), quais clientes são afetados e o que muda na rotina |
| descrição | Leitura de boletins e grupos; repasse informal à equipe |
| gatilho_frequência | Semanal |
| porte_alcance | Todos |
| quem_faz | Coordenador de DP |
| onde_é_feita_hoje | Sites, grupos de WhatsApp |
| entradas / saídas | Norma/NT → resumo, clientes afetados, tarefas |
| base_legal | Ex.: NT S-1.3 07/2026 (implantação escalonada até jan/2027) [T21]; Lei 15.371/2026 [T19]; Portaria 1.316/2026 [T16] |
| risco_se_falhar | Rejeições em massa; regra nova não aplicada |
| tempo_estimado | 2–4 h por semana `[ESTIMATIVA]` |
| concorrentes | Fornecedores de core publicam notas (Senior Portal de Exigências Legais, Alterdata) [T13] |
| hipótese_automação | Coletor de normas e notas técnicas na base legal temporal (M1) + cruzamento com o perfil dos clientes (exemplo "clientes afetados pela norma de ontem" do Plano 1.5) |
| papel_da_ia | M1 ler e rascunhar; M2 ler; M4 rascunhar (avisos em lote) |
| ferramentas_agênticas | `novidades_trabalhistas(desde)`, `clientes_afetados(norma)` |
| eventos_timesheet | `dp.atualizacao.lida` |
| fontes_descoberta | [T13], [T16], [T19], [T21] |

### DP-044 · Informar e recolher valores de processo trabalhista

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / Reclamatórias |
| atividade | Receber a sentença ou o acordo, informar os eventos de processo trabalhista no eSocial e recolher FGTS e encargos pela GFD |
| descrição | Rara; feita com o advogado do cliente, muitas vezes fora do prazo |
| gatilho_frequência | Por evento |
| porte_alcance | Clientes com reclamatória |
| quem_faz | Coordenador de DP |
| onde_é_feita_hoje | Core ou web eSocial, FGTS Digital |
| entradas / saídas | Decisão judicial → eventos de processo (S-2500 e correlatos), GFD, DARF |
| base_legal | GFD obrigatória para FGTS de processo trabalhista desde 01/05/2026, exceto doméstico [T1]; ajustes no S-2500 pela NT 07/2026 [T21] |
| risco_se_falhar | Execução, multa, irregularidade no FGTS |
| tempo_estimado | 2–6 h por processo `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Checklist guiado com prazos e coleta dos dados da decisão (leitura do PDF) |
| papel_da_ia | M1 ler; M2 rascunhar (extração da decisão); M3 executar (valores) |
| ferramentas_agênticas | `extrair_dados_decisao(arquivo)`, `checklist_processo_trabalhista(cliente, processo)` |
| eventos_timesheet | `dp.processo.informado` |
| fontes_descoberta | [T1], [T21] |

---
## G. Ponto eletrônico

### DP-045 · Verificar a conformidade do controle de ponto do cliente

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / Ponto |
| atividade | Conferir se o cliente usa sistema de ponto aceito (REP-A, REP-C, REP-P), se tem os documentos exigidos e se consegue gerar AFD e AEJ |
| descrição | Quase nunca verificado; aparece na fiscalização ou na reclamatória |
| gatilho_frequência | Por evento (novo cliente, troca de sistema); anual |
| porte_alcance | Clientes obrigados ao controle de jornada |
| quem_faz | Coordenador de DP |
| onde_é_feita_hoje | — |
| entradas / saídas | Dados do sistema de ponto → checklist de conformidade |
| base_legal | Portaria MTP 671/2021 (alterada pela 4.198/2022 e, segundo fonte, pela 1.316/2026): REP-P exige certificado de registro no INPI (art. 91); REP-C exige atestado técnico e termo de responsabilidade; AFD obrigatório em todos [T4][T16] |
| risco_se_falhar | Ponto desconsiderado como prova; autuação |
| tempo_estimado | 30 min por cliente `[ESTIMATIVA]` |
| concorrentes | Fornecedores de ponto (Pontotel, Alterdata) vendem conformidade [C12] |
| hipótese_automação | Questionário guiado + validação automática de um AFD/AEJ de amostra (estrutura do leiaute) |
| papel_da_ia | M1 ler; M3 executar (validação de arquivo); M2 rascunhar (parecer ao cliente) |
| ferramentas_agênticas | `validar_arquivo_ponto(arquivo, tipo)`, `checklist_conformidade_ponto(cliente)` |
| eventos_timesheet | `dp.ponto.conformidade_verificada` |
| fontes_descoberta | [T4], [T16], [C12] |

---

## H. Afastamentos, atestados e licenças

### DP-046 · Receber atestados, somar afastamentos e encaminhar ao INSS

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / Afastamentos |
| atividade | Receber o atestado, registrar, somar com afastamentos pelo mesmo motivo em 60 dias, informar o S-2230 e orientar o pedido do benefício quando passar de 15 dias |
| descrição | Atestado chega em foto pelo WhatsApp, às vezes depois do fechamento [T23]; a soma dos 60 dias é feita de cabeça |
| gatilho_frequência | Por evento |
| porte_alcance | Todos com empregados |
| quem_faz | Analista de DP |
| onde_é_feita_hoje | WhatsApp, core |
| entradas / saídas | Atestado → afastamento registrado, S-2230, orientação ao empregado (Meu INSS, Atestmed) |
| base_legal | Empresa paga os 15 primeiros dias, INSS a partir do 16º; soma de afastamentos pelo mesmo motivo em 60 dias; Atestmed para afastamentos de até 90 dias; prazo do S-2230 diverge entre fontes (dia 15 do mês seguinte × regra antiga) [T17] |
| risco_se_falhar | Pagamento indevido de dias que caberiam ao INSS; empregado sem benefício; multa eSocial |
| tempo_estimado | 10–20 min por atestado `[ESTIMATIVA]` |
| concorrentes | Domínio: lançamento do S-2230 no core [C14]; `[NÃO ENCONTRADO]` controle de soma em gestores |
| hipótese_automação | Recebimento do atestado no WhatsApp com OCR (datas, CID quando informado), soma automática na janela de 60 dias, alerta de 16º dia e mensagem pronta ao empregado |
| papel_da_ia | M2 ler (atestado e histórico); M3 executar (soma); M1 ler (regra); M4 executar (avisos) |
| ferramentas_agênticas | `registrar_atestado(empregado, arquivo)`, `somar_afastamentos(empregado)` |
| eventos_timesheet | `dp.afastamento.registrado` |
| fontes_descoberta | [T17], [T23], [C14] |

### DP-047 · Tratar licença-maternidade e licença-paternidade (incluindo a mudança de 2027)

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / Afastamentos |
| atividade | Registrar a licença, verificar Empresa Cidadã, calcular retorno e estabilidade e, a partir de 2027, aplicar a nova licença-paternidade com salário-paternidade |
| descrição | Feita no core; a orientação ao cliente sobre a lei nova ainda não existe |
| gatilho_frequência | Por evento; marco em 01/01/2027 |
| porte_alcance | Todos com empregados |
| quem_faz | Analista de DP |
| onde_é_feita_hoje | Core |
| entradas / saídas | Certidão/atestado → afastamento, datas de retorno e estabilidade |
| base_legal | Lei 15.371/2026 (DOU 01/04/2026, vigência 01/01/2027): 10 dias em 2027, 15 em 2028, 20 em 2029 (última etapa com condição a verificar); salário-paternidade pago pelo INSS; estabilidade provisória [T19]. Reflexo no eSocial `[NÃO ENCONTRADO]` |
| risco_se_falhar | Licença concedida a menor; estabilidade ignorada |
| tempo_estimado | 15 min por evento `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Aviso em lote aos clientes em dez/2026 sobre a lei nova; cálculo automático de datas e estabilidade |
| papel_da_ia | M1 ler (regra vigente na data do nascimento); M3 executar (datas); M4 rascunhar (aviso em lote) |
| ferramentas_agênticas | `calcular_licenca(empregado, tipo, data_evento)` |
| eventos_timesheet | `dp.licenca.registrada` |
| fontes_descoberta | [T19] |

### DP-048 · Emitir a CAT no prazo

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / Afastamentos · SST |
| atividade | Saber do acidente de trabalho a tempo e transmitir a CAT (S-2210) |
| descrição | O cliente avisa tarde ou não avisa; acidente de trajeto e doença ocupacional confundem |
| gatilho_frequência | Por evento |
| porte_alcance | Todos com empregados |
| quem_faz | Analista de DP ou fornecedor de SST |
| onde_é_feita_hoje | Core, software de SST, WhatsApp |
| entradas / saídas | Relato do acidente → S-2210, estabilidade acidentária anotada |
| base_legal | S-2210 até o primeiro dia útil seguinte ao acidente; imediato em óbito; vale mesmo sem afastamento [T11] |
| risco_se_falhar | Multa (valores divergem entre fontes) [T11]; estabilidade não controlada |
| tempo_estimado | 20–40 min `[ESTIMATIVA]` |
| concorrentes | Softwares de SST `[NÃO VERIFICADO]` |
| hipótese_automação | Canal de "aconteceu um acidente" no WhatsApp com perguntas guiadas e alerta urgente ao DP |
| papel_da_ia | M4 executar (coleta guiada e alerta); M1 ler |
| ferramentas_agênticas | `registrar_acidente(cliente, relato)` |
| eventos_timesheet | `dp.cat.registrada` |
| fontes_descoberta | [T11] |

---

## I. Saúde e segurança do trabalho (SST)

### DP-049 · Controlar ASOs periódicos e a validade de PGR e PCMSO

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / SST |
| atividade | Saber quando vence o periódico de cada empregado e quando PGR e PCMSO do cliente precisam de revisão, e cobrar a clínica/fornecedor |
| descrição | Fica com o fornecedor de SST; o escritório responde pelos eventos S-2220 e S-2240 que dependem desses dados |
| gatilho_frequência | Mensal |
| porte_alcance | Todos com empregados (dispensa de PCMSO para ME/EPP de grau de risco 1 e 2 sem riscos, a verificar) [T26] |
| quem_faz | Analista de DP |
| onde_é_feita_hoje | Fornecedor de SST, e-mail |
| entradas / saídas | Datas de ASO e programas → alertas, S-2220/S-2240 em dia |
| base_legal | NR-7, NR-1 [T6][T26]; S-2220 até o dia 15 do mês seguinte ao ASO [T11] |
| risco_se_falhar | Multa SST por empregado [T11][T12] |
| tempo_estimado | 10–20 min por cliente por mês `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` em gestores de escritório |
| hipótese_automação | Agenda de SST por cliente com alertas aos fornecedores; leitura dos ASOs recebidos |
| papel_da_ia | M2 ler; M4 executar (alertas) |
| ferramentas_agênticas | `agenda_sst(cliente)`, `cobrar_fornecedor_sst(cliente, item)` |
| eventos_timesheet | `dp.sst.controlado` |
| fontes_descoberta | [T6], [T11], [T12], [T26] |

### DP-050 · Cobrar a atualização do PGR com os riscos psicossociais

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / SST |
| atividade | Avisar cada cliente da exigência, pedir ao fornecedor de SST o PGR atualizado e arquivar a evidência |
| descrição | Muitos clientes pequenos não sabem que a regra vale desde maio/2026 |
| gatilho_frequência | Pontual (campanha); anual (revisão) |
| porte_alcance | Clientes obrigados ao PGR |
| quem_faz | Coordenador de DP; atendimento |
| onde_é_feita_hoje | — |
| entradas / saídas | Lista de clientes → aviso, PGR atualizado arquivado |
| base_legal | Portaria MTE 1.419/2024 (item 1.5 da NR-1), prorrogada pela 765/2025; vigência 25 ou 26/05/2026, fiscalização punitiva desde então [T6] |
| risco_se_falhar | Autuação; ações por adoecimento mental ocupacional [T6] |
| tempo_estimado | 10 min por cliente `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Campanha em lote (exemplo M1 → M2 → M4 do Plano 1.5) e checklist de evidência |
| papel_da_ia | M1 ler; M2 ler; M4 rascunhar (mensagens em lote para aprovação) |
| ferramentas_agênticas | `campanha_regulatoria(norma, filtro_clientes)` |
| eventos_timesheet | `dp.sst.campanha_psicossocial` |
| fontes_descoberta | [T6] |

---

## J. Benefícios

### DP-051 · Calcular e solicitar a recarga mensal de VT e VR/VA

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / Benefícios |
| atividade | Calcular a quantidade de vale-transporte e o valor de VR/VA pelos dias úteis e faltas, pedir a recarga à operadora e lançar o desconto |
| descrição | Planilha por cliente; pedido no portal da operadora; boleto para o cliente |
| gatilho_frequência | Mensal |
| porte_alcance | Clientes com benefícios |
| quem_faz | Analista de DP; cliente |
| onde_é_feita_hoje | Planilha, portais das operadoras |
| entradas / saídas | Escala, faltas, valores da CCT → pedido de recarga, boleto, desconto em folha |
| base_legal | VT (desconto até 6% do salário, Lei 7.418/1985) `[NÃO VERIFICADO]`; PAT (Decreto 12.712/2025: teto de MDR de 3,6% e repasse ao estabelecimento em 15 dias; portabilidade fora do decreto) [T20] |
| risco_se_falhar | Benefício a menor (CCT), desconto indevido |
| tempo_estimado | 15–30 min por cliente `[ESTIMATIVA]` |
| concorrentes | Operadoras (Flash e outras) têm plataformas para o RH [C8] |
| hipótese_automação | Cálculo pelo calendário e faltas já recebidas (DP-009), arquivo de pedido no leiaute da operadora quando houver (F/B, a verificar) |
| papel_da_ia | M3 executar; M4 rascunhar (pedido) |
| ferramentas_agênticas | `calcular_beneficios_mes(cliente, competencia)` |
| eventos_timesheet | `dp.beneficio.recarga` |
| fontes_descoberta | [T20], [C8] |

### DP-052 · Movimentar plano de saúde e seguro de vida

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / Benefícios |
| atividade | Incluir e excluir titulares e dependentes, conferir a fatura com a folha e lançar coparticipação |
| descrição | Portal da operadora ou corretor; divergência entre fatura e folha descoberta meses depois |
| gatilho_frequência | Mensal; por evento |
| porte_alcance | Clientes com plano |
| quem_faz | Analista de DP; cliente; corretor |
| onde_é_feita_hoje | Portal da operadora, e-mail |
| entradas / saídas | Movimentações e fatura → conferência, descontos |
| base_legal | — |
| risco_se_falhar | Cliente pagando por desligado; desconto errado |
| tempo_estimado | 15–30 min por cliente `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Conferência automática fatura (PDF) × ativos da folha |
| papel_da_ia | M2 ler; M3 executar (conferência) |
| ferramentas_agênticas | `conferir_fatura_beneficio(cliente, arquivo)` |
| eventos_timesheet | `dp.beneficio.fatura_conferida` |
| fontes_descoberta | — |

---

## K. Rotinas anuais e periódicas

### DP-053 · Planejar e comunicar o 13º salário

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / 13º salário |
| atividade | Avisar clientes do custo e dos prazos, calcular as parcelas, enviar guias e holerites, e conferir encargos |
| descrição | Concentrado em novembro e dezembro junto com férias coletivas e fechamento do ano |
| gatilho_frequência | Anual |
| porte_alcance | Todos com empregados |
| quem_faz | Analista de DP |
| onde_é_feita_hoje | Core, WhatsApp |
| entradas / saídas | Folha → previsão de custo, parcelas, guias |
| base_legal | 1ª parcela até 30/11; 2ª até 20/12 — em 2026 o dia 20 cai num domingo e as fontes apontam 18/12; FGTS e DCTFWeb do 13º com datas divergentes entre fontes [T24] |
| risco_se_falhar | Multa por atraso; cliente sem caixa |
| tempo_estimado | 20–40 min por cliente `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Campanha em outubro com previsão de custo por cliente (M3) e lembretes; pacote de guias (DP-020) |
| papel_da_ia | M3 executar; M1 ler (prazos); M4 executar (campanha) |
| ferramentas_agênticas | `prever_custo_13(cliente)`, `campanha_13(carteira, ano)` |
| eventos_timesheet | `dp.13.processado` |
| fontes_descoberta | [T24] |

### DP-054 · Gerar e distribuir o informe de rendimentos dos empregados

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / Anuais |
| atividade | Gerar o comprovante de rendimentos de cada empregado e sócio e entregar até o prazo |
| descrição | Core gera; distribuição por e-mail ao cliente |
| gatilho_frequência | Anual (fevereiro) |
| porte_alcance | Todos com folha ou pró-labore |
| quem_faz | Analista de DP |
| onde_é_feita_hoje | Core, e-mail |
| entradas / saídas | Folha do ano → informes entregues |
| base_legal | DIRF extinta para fatos a partir de 01/01/2025 (IN RFB 2.181/2024); informe continua obrigatório, prazo citado como 27/02 em 2026; multa citada de R$ 41,43 por documento (fonte secundária) [T14] |
| risco_se_falhar | Multa; empregado sem informe para a declaração |
| tempo_estimado | 10 min por cliente `[ESTIMATIVA]` |
| concorrentes | Onvio Portal do Empregado (informe de rendimentos) [C1] |
| hipótese_automação | Mesma distribuição dos holerites (DP-019) |
| papel_da_ia | M4 executar |
| ferramentas_agênticas | `enviar_informes(cliente, ano)` |
| eventos_timesheet | `dp.informe.enviado` |
| fontes_descoberta | [T14], [C1] |

### DP-055 · Preparar o Relatório de Transparência Salarial

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / Igualdade salarial |
| atividade | Para clientes com 100+ empregados, enviar os dados complementares no Emprega Brasil, baixar o relatório e garantir a publicação |
| descrição | Rotina semestral nova para muitos escritórios; prazos prorrogados em quase todo ciclo |
| gatilho_frequência | Semestral (fev–abr e ago) [T7] |
| porte_alcance | Empresas com 100+ empregados em 31/12 do ano anterior [T7] |
| quem_faz | Coordenador de DP |
| onde_é_feita_hoje | Portal Emprega Brasil |
| entradas / saídas | Dados do eSocial + informações complementares → relatório publicado |
| base_legal | Lei 14.611/2023 `[NÃO VERIFICADO]` no texto; ciclos de 2026: dados até 28/02, publicação prorrogada até 06/04, atualização de 04 a 31/08 [T7] |
| risco_se_falhar | Multa administrativa `[NÃO VERIFICADO]` (valor não encontrado) |
| tempo_estimado | 1–3 h por cliente por ciclo `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Identificar clientes obrigados pelo número de empregados; prazos no calendário; rascunho das respostas complementares |
| papel_da_ia | M2 ler; M1 ler; M4 rascunhar |
| ferramentas_agênticas | `clientes_obrigados_transparencia(ano)` |
| eventos_timesheet | `dp.transparencia.enviada` |
| fontes_descoberta | [T7] |

### DP-056 · Monitorar as cotas de aprendizes e de pessoas com deficiência

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / Cotas |
| atividade | Calcular, por cliente, a cota exigida e avisar quando o quadro passa do limite |
| descrição | Lembrado só na fiscalização |
| gatilho_frequência | Mensal (variação do quadro) |
| porte_alcance | Aprendiz: estabelecimentos com funções que demandam formação; PcD: 100+ empregados `[NÃO VERIFICADO]` |
| quem_faz | Coordenador de DP |
| onde_é_feita_hoje | — |
| entradas / saídas | Quadro por CBO → cota, déficit, alerta |
| base_legal | CLT art. 429; Lei 8.213/1991 art. 93 `[NÃO VERIFICADO]`; validação de cota no S-2200/S-2205 mudou na NT 07/2026 [T21] |
| risco_se_falhar | Autuação, ação do MPT |
| tempo_estimado | 5 min por cliente `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Cálculo determinístico da cota com a regra vigente e alerta |
| papel_da_ia | M1 ler; M3 executar; M4 executar (alerta) |
| ferramentas_agênticas | `calcular_cotas(cliente)` |
| eventos_timesheet | `dp.cotas.calculadas` |
| fontes_descoberta | [T21] |

### DP-057 · Corrigir dados de vínculos para o abono salarial e as bases que substituíram RAIS e CAGED

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / Anuais |
| atividade | Conferir e retificar no eSocial os vínculos do ano-base que alimentam abono salarial, RAIS e CAGED, dentro do prazo |
| descrição | Empregado reclama que não recebeu o abono; o escritório descobre a falha anos depois |
| gatilho_frequência | Anual (prazo citado de 20/06 para o ano-base 2024, em 2026) [T22]; por evento |
| porte_alcance | Todos com empregados |
| quem_faz | Analista de DP |
| onde_é_feita_hoje | Core, eSocial |
| entradas / saídas | Vínculos do ano → retificações enviadas |
| base_legal | Dados do eSocial alimentam CAGED e RAIS; falta de envio afeta seguro-desemprego e abono [T22] |
| risco_se_falhar | Trabalhador sem abono; reclamação |
| tempo_estimado | 10–30 min por cliente `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Conferência anual a partir do download de eventos (DP-039) |
| papel_da_ia | M2 ler; M4 rascunhar (tarefas) |
| ferramentas_agênticas | `conferir_vinculos_ano(cliente, ano)` |
| eventos_timesheet | `dp.vinculos.conferidos` |
| fontes_descoberta | [T22] |

---

## L. Atendimento do DP, consultoria e arquivo

### DP-058 · Responder dúvidas trabalhistas do cliente e do empregado

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / Atendimento (transversal: D7) |
| atividade | Responder perguntas como "posso dar folga no lugar da hora extra?", "quanto ele recebe se pedir demissão?", "tenho que pagar o feriado?" |
| descrição | WhatsApp o dia inteiro; a resposta depende de CLT, CCT e dados do empregado; muitas vezes dada de memória |
| gatilho_frequência | Diária |
| porte_alcance | Todos com empregados |
| quem_faz | Analista de DP; coordenador |
| onde_é_feita_hoje | WhatsApp, telefone |
| entradas / saídas | Pergunta → resposta com base legal e, se for número, cálculo |
| base_legal | CLT, CCT do cliente, normas do MTE |
| risco_se_falhar | Orientação errada vira passivo do cliente e responsabilidade do escritório |
| tempo_estimado | 5–15 min por pergunta; volume alto `[ESTIMATIVA]` |
| concorrentes | Digisac organiza filas por setor (DP) [C9]; `[NÃO ENCONTRADO]` resposta com CCT do cliente |
| hipótese_automação | O chat único da plataforma: roteador decide M1 (lei e CCT), M2 (dados do empregado), M3 (cálculo), com rascunho para o analista aprovar antes de enviar |
| papel_da_ia | M1 + M2 + M3 ler/rascunhar; M4 executar (envio após aprovação) |
| ferramentas_agênticas | `responder_duvida_dp(cliente, pergunta)`, `buscar_clausula_cct(cliente, tema)` |
| eventos_timesheet | `dp.atendimento.respondido` |
| fontes_descoberta | [C9] |

### DP-059 · Simular custo de contratação, rescisão e mudança salarial

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / Consultoria |
| atividade | Calcular para o cliente o custo total de contratar, demitir, dar aumento ou mudar a jornada |
| descrição | Planilha própria do analista ou simulação no core |
| gatilho_frequência | Por evento (semanal na carteira) |
| porte_alcance | Todos |
| quem_faz | Analista de DP; sócio |
| onde_é_feita_hoje | Planilha, core |
| entradas / saídas | Cenário → custo mensal e anual com encargos (regime tributário do cliente) |
| base_legal | Encargos conforme regime (Simples anexo, desoneração) `[NÃO VERIFICADO]` |
| risco_se_falhar | Decisão do cliente com número errado |
| tempo_estimado | 15–30 min `[ESTIMATIVA]` |
| concorrentes | Questor Q-Net: simulação de férias e rescisão pelo cliente [C6] |
| hipótese_automação | Simulador M3 acessível no chat e no portal do cliente |
| papel_da_ia | M3 executar; M2 ler; M1 ler |
| ferramentas_agênticas | `simular_custo_empregado(cliente, cenario)` |
| eventos_timesheet | `dp.consultoria.simulacao` |
| fontes_descoberta | [C6] |

### DP-060 · Manter o arquivo digital do empregado e controlar a guarda dos documentos

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / Arquivo |
| atividade | Organizar, por empregado, contrato, ASOs, recibos, avisos, atestados, ponto e comprovantes, com prazo de guarda |
| descrição | Pastas de rede e papel no cliente; documento some quando mais precisa |
| gatilho_frequência | Contínua |
| porte_alcance | Todos com empregados |
| quem_faz | Analista de DP |
| onde_é_feita_hoje | Rede, papel, e-mail |
| entradas / saídas | Documentos de todas as fichas → dossiê pesquisável |
| base_legal | Prazos de guarda trabalhistas e previdenciários `[NÃO VERIFICADO]`; LGPD `[NÃO VERIFICADO]` |
| risco_se_falhar | Perda de prova em reclamatória e fiscalização |
| tempo_estimado | Diluído; 1–2 h por semana `[ESTIMATIVA]` |
| concorrentes | Alterdata Pack Protocolo (fluxo de documentos com o cliente) [T23·Alterdata]; Onvio (documentos) [C1] |
| hipótese_automação | Todo documento que passa por WhatsApp/portal é classificado e arquivado no dossiê do empregado automaticamente |
| papel_da_ia | M2 ler (classificação); M4 executar (arquivo) |
| ferramentas_agênticas | `classificar_documento(arquivo)`, `dossie_empregado(empregado)` |
| eventos_timesheet | `dp.arquivo.documento_arquivado` |
| fontes_descoberta | [C1] |

### DP-061 · Atender pedidos de documentos para reclamatória trabalhista

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / Reclamatórias |
| atividade | Levantar, para o advogado do cliente, fichas, recibos, ponto, guias e cálculos de um ex-empregado |
| descrição | Pedido urgente; levantamento manual em vários sistemas e anos |
| gatilho_frequência | Por evento |
| porte_alcance | Clientes com reclamatória |
| quem_faz | Analista de DP |
| onde_é_feita_hoje | Core, arquivo, eSocial |
| entradas / saídas | Pedido do advogado → pacote de documentos |
| base_legal | — |
| risco_se_falhar | Condenação por falta de prova |
| tempo_estimado | 1–4 h por processo `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Pacote gerado do dossiê (DP-060) e do download do eSocial (DP-039) |
| papel_da_ia | M2 ler; M4 executar (pacote) |
| ferramentas_agênticas | `pacote_reclamatoria(empregado, itens)` |
| eventos_timesheet | `dp.processo.documentos_enviados` |
| fontes_descoberta | — |

### DP-062 · Atender empregador doméstico e MEI com empregado

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / Doméstico e MEI |
| atividade | Fazer a folha simplificada, emitir o DAE do eSocial e cuidar de férias, 13º e rescisão do doméstico ou do empregado do MEI |
| descrição | Carteira de baixo honorário e muito contato pelo WhatsApp; tudo pelo eSocial web |
| gatilho_frequência | Mensal; por evento |
| porte_alcance | Empregadores domésticos e MEI com empregado |
| quem_faz | Analista de DP júnior |
| onde_é_feita_hoje | eSocial web (módulo doméstico/simplificado) |
| entradas / saídas | Variáveis → DAE, recibo |
| base_legal | Doméstico, MEI e segurado especial seguem no DAE do eSocial, fora da GFD [T1]; DET obrigatório para MEI e doméstico desde 01/08/2024 [T2] |
| risco_se_falhar | Encargos e multa; perda de cliente pequeno |
| tempo_estimado | 10–20 min por cliente por mês `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Fluxo enxuto todo pelo WhatsApp (variáveis, guia, recibo); hipótese de automação no eSocial web (C-cert/C-crc, a verificar) |
| papel_da_ia | M4 executar; M3 executar |
| ferramentas_agênticas | `folha_domestico(cliente, competencia)` |
| eventos_timesheet | `dp.domestico.processado` |
| fontes_descoberta | [T1], [T2] |

---

## Indicação preliminar de dor (para a Etapa 3)

Sem nota formal (é da Etapa 3); ordem pelo peso de frequência × volume × risco percebido nas fontes e na prática de mercado:

1. **DP-009 · Coleta e cobrança das variáveis da folha** — mensal, em todos os clientes, é a dor mais citada [T23].
2. **DP-046 · Atestados e afastamentos** (chegam fora de hora, soma dos 60 dias, 16º dia) [T17][T23].
3. **DP-019 / DP-020 · Distribuição de holerites e guias** — repetitivo, mensal, em todos; portais existentes são presos ao core [C1].
4. **DP-034 / DP-035 · Monitorar CCT e aplicar reajuste** — sem concorrente na visão de carteira; retroativo caro.
5. **DP-026 / DP-027 · Desligamento: modalidade, estabilidade e prazo de 10 dias** — evento comum com multa certa se atrasar [T8].
6. **DP-038 / DP-040 · Pendências do eSocial e leitura do DET da carteira** — risco alto com multas reestruturadas [T2][T12].
7. **DP-058 · Dúvidas trabalhistas pelo WhatsApp** — alto volume, onde o chat com M1+M2+M3 mais se diferencia.

---

## Funcionalidades de concorrentes nesta aba

| Concorrente | O que faz no DP (achado) | Fonte |
| --- | --- | --- |
| **Domínio / Onvio (Thomson Reuters)** | Portal do Empregado: publica holerites e documentos gerados pela folha do Domínio (não aceita documentos externos; não se habilita depois do desligamento). Portal do Cliente: solicitações tipadas de rescisão, aviso prévio, férias, empregado e "solicitação geral" | [C1], [C2] |
| **Gestta (Thomson Reuters)** | Gestor de processos do escritório que controla entrega de guias e folha por departamento; integração com o portal do cliente. Detalhe de DP `[NÃO ENCONTRADO]` | [C5] |
| **Alterdata (eContador, ePessoal, Pack)** | eContador: pré-admissão via web que cria tarefa no eTarefas; pré-demissão; consulta de férias vencidas e agendamento pelo app com importação automática no DP pela assistente virtual (AVA). ePessoal 3.17.0: previsão e agendamento de férias com validação de conflitos. Pack Protocolo: controle de documentos com o cliente. Ponto eletrônico próprio | [C3], [C4], [C12] |
| **Questor (Zen, Q-Net, Q-Colabore, e-Consignado)** | Q-Net: escritório virtual com relatórios e simulações de férias e rescisão para o cliente; Q-Colabore: documentos de RH com envio automático; e-Consignado: tratamento do Crédito do Trabalhador com mensagem no holerite; guias automatizadas | [C6], D2 [C14] |
| **HubStrom** | Plataforma do escritório (MonitorHub de obrigações). Módulos de DP `[NÃO ENCONTRADO]` | [C11] |
| **Acessórias** | Busca por funcionalidades de DP (envio de guias, holerites, protocolo) sem resultado: `[NÃO ENCONTRADO]` (buscado: "Acessórias departamento pessoal", "Acessórias envio automático guias holerites") | — |
| **SIEG, Qive** | Foco em documentos fiscais; nenhuma funcionalidade de DP encontrada `[NÃO ENCONTRADO]` | — |
| **Flash** | Coleta de documentos admissionais pelo WhatsApp Business API; plataforma de benefícios (VR/VA) | [C8] |
| **Digisac** | Multiatendimento com filas por setor (DP) | [C9] |
| **Anaclara** | Assinatura eletrônica pelo WhatsApp voltada a contadores | [C10] |
| **Unico People, Convenia, Sólides, Gupy, Pontotel** | Admissão digital, portal do colaborador, holerite online e ponto vendidos ao RH da empresa, não ao escritório | `[NÃO VERIFICADO]` (citados nos resultados sem página de produto lida) |

**Leitura:** os cores já oferecem portal de solicitações e de documentos, mas **presos ao próprio core** e **sem IA**. Nenhum concorrente encontrado faz: visão de carteira das pendências de eSocial/DET, monitoramento de CCT com impacto por cliente, conferência independente de holerite/IRRF, controle de afastamentos com a regra dos 60 dias, ou resposta a dúvidas com a CCT do cliente.

---

## Lacunas

1. **Leitura de fontes oficiais bloqueada** (`www.gov.br` recusado pelo proxy). Todos os prazos vieram de trechos de busca. A Etapa 2 (V1) precisa abrir: MOS do eSocial vigente (prazos de S-1200/S-1299, S-2230, S-2240), manual do FGTS Digital, Portaria MTE 506/2026, Portaria MTE 1.131/2025 (tabela completa), Portaria MTP 671/2021 compilada e a Portaria MTE 1.316/2026.
2. **FGTS Digital:** nenhuma API para terceiros encontrada; status de leitura de guias e pagamentos por sistema `[NÃO ENCONTRADO]`.
3. **DET:** API ou webservice para leitura da caixa `[NÃO ENCONTRADO]`; contagem da ciência tácita em fins de semana diverge.
4. **Sistema Mediador:** forma de coleta em massa (download, consulta por CNPJ/sindicato, CAPTCHA) `[NÃO ENCONTRADO]`; o Plano diz "coletor já planejado", a conferir no repositório e com V1.
5. **Seguro-desemprego:** se o Empregador Web ainda é exigido em nov/2026 ou se a comunicação passou ao eSocial `[NÃO VERIFICADO]`.
6. **Feriados no comércio:** conflito entre fontes sobre a Portaria 3.665/2023 × 1.316/2026.
7. **Leiautes de importação dos cores** (variáveis, reajuste, férias) para Domínio, Alterdata e Contmatic: perguntas para V3.
8. **Contmatic:** nenhuma funcionalidade de portal do empregado ou de solicitações do cliente encontrada nesta rodada `[NÃO ENCONTRADO]`.
9. **Salário mínimo 2026, alíquotas do contribuinte individual, prazo do DARF da DCTFWeb e prazos do 13º para FGTS/DCTFWeb:** `[NÃO ENCONTRADO]` ou divergentes.
10. **Bases legais clássicas marcadas `[NÃO VERIFICADO]`** (CLT arts. 74, 139, 429, 445, 451, 459, 464; Lei 12.506/2011; Lei 7.418/1985; Lei 8.213 art. 93; Lei 14.611/2023): conferir na base legal temporal (M1) antes de virar regra.
11. **Tempos por atividade:** todos `[ESTIMATIVA]`; levantar com os contadores (Apêndice do Plano), começando por DP-009, DP-019, DP-046 e DP-058.
12. **Perguntas para os contadores:** quais clientes têm o DP feito pelo escritório × pelo próprio cliente; quem faz benefícios e SST; quantos clientes usam ponto eletrônico e qual; quantas CCTs distintas na carteira.

---

## Fontes

Todas consultadas em 05/11/2026, via buscador (ver limitação no início).

**Normas, órgãos e imprensa**

- [T1] FGTS Digital, prazos, consignado e processo trabalhista: Jornal Contábil, "FGTS Digital centraliza quitação de consignados a partir de fevereiro": https://jornalcontabil.com.br/noticia/fgts-digital-centraliza-quitacao-de-consignados-a-partir-de-fevereiro/ ; Fenacon, "FGTS Digital inicia o recebimento de valores de empréstimos consignados vencidos": https://fenacon.org.br/noticias/fgts-digital-inicia-o-recebimento-de-valores-de-emprestimos-consignados-vencidos/ ; Trabalhista.blog, "Antecipar a emissão da guia não altera o vencimento" (25/09/2026): https://trabalhista.blog/2026/09/25/fgts-digital-antecipar-a-emissao-da-guia-de-recolhimento-nao-altera-o-vencimento/ ; COAD, FGTS Digital em processo trabalhista: https://www.coad.com.br/home/noticias-detalhe/137309/sit-dispoe-sobre-utilizacao-do-fgts-digital-no-recolhimento-de-valores-de-fgts-de-processo-trabalhista ; MTE, Nota orientativa de contingência 05/2026: https://www.gov.br/trabalho-e-emprego/pt-br/servicos/empregador/fgtsdigital/manual-e-documentacao-tecnica/sei_8572427_nota-orientativa-para-situacao-de-contingencia-05-2026.pdf
- [T2] DET: Gupy, "Domicílio Eletrônico Trabalhista: guia completo 2026": https://gupy.io/blog/domicilio-eletronico-trabalhista ; Contábeis, "DET: o que é e quem precisa se cadastrar": https://www.contabeis.com.br/noticias/65493/det-o-que-e-e-quem-precisa-se-cadastrar/ ; Portal SPED Brasil, prorrogação para MEI e doméstico: https://portalspedbrasil.com.br/?p=19125 ; Quark RH, notificações não lidas no DET: https://quarkrh.com.br/blog/deteccao-notificacoes-nao-lidas-no-det/
- [T3] Prazos de eventos do eSocial (NO 2019.18): Convergência Digital: https://convergenciadigital.com.br/mercado/governo-altera-prazos-de-entrega-de-dados-da-folha-de-pagamento-no-esocial/ ; Portal ContNews: https://www.portalcontnews.com.br/alteracao-dos-prazos-de-envio-de-eventos-ao-esocial/ ; LegisWeb: https://www.legisweb.com.br/noticia/?id=22199
- [T4] Portaria MTP 671/2021 (ponto): Guia Trabalhista, perguntas e respostas: https://www.guiatrabalhista.com.br/tematicas/portaria-671-2021-perguntas-e-respostas.htm ; texto compilado (08/07/2025): https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/legislacao/portarias-1/portarias-vigentes-3/PDFPortarian671de8denovembrode2021compilada08.07.2025.pdf ; COAD, perguntas oficiais sobre REP: https://www.coad.com.br/home/noticias-detalhe/111346/controle-de-ponto-eletronico-rep-atualizadas-as-perguntas-e-respostas-oficiais-do-mtp
- [T5] Crédito do Trabalhador: Contábeis, "MTE orienta como lançar consignado CLT no eSocial": https://www.contabeis.com.br/noticias/70289/mte-orienta-como-lancar-consignado-clt-no-esocial-e-mais/ ; Barbieri Advogados, manual do contador: https://www.barbieriadvogados.com/consignado-digital-no-esocial-manual-do-contador-para-o-credito-do-trabalhador-2025/ ; Portaria MTE 435/2025 compilada em 26/06/2026: https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/legislacao/portarias-1/portarias-vigentes-3/word-portaria-mte-no-435-de-20-de-marco-de-2025-compilada-em-26-06-2026.pdf
- [T6] NR-1 e riscos psicossociais: Mattos Filho: https://www.mattosfilho.com.br/unico/riscos-psicossociais-nr1/ ; Contábeis, "Empresas têm até 26 de maio para se adequar à nova NR-1": https://www.contabeis.com.br/noticias/76079/empresas-tem-ate-26-de-maio-para-se-adequar-a-nova-nr-1/ ; Guia Trabalhista, prorrogação: https://www.guiatrabalhista.com.br/noticias/prorrogado-prazo-vigencia-avaliacao-riscos-psicossociais-pgr.htm
- [T7] Transparência salarial: Agência Gov (ago/2026): https://agenciagov.ebc.com.br/noticias/202608/empresas-com-100-ou-mais-empregados-devem-atualizar-informacoes-para-o-6o-relatorio-de-transparencia-salarial ; Brasil 61, prazo de 06/04: https://brasil61.com/n/igualdade-salarial-empresas-tem-ate-6-de-abril-para-divulgar-relatorio-obrigatorio-bras2616136 ; Fenacon, relatório disponível: https://fenacon.org.br/noticias/relatorio-de-transparencia-salarial-ja-esta-disponivel-para-download-no-emprega-brasil/
- [T8] Rescisão e art. 477: COAD (TRT-MG, obrigações de fazer): https://www.coad.com.br/home/noticias-detalhe/9535/trt-mg-prazo-e-multa-do-artigo-477-da-clt-se-aplicam-as-obrigacoes-de-fazer ; COAD (atraso na homologação pelo sindicato): https://www.coad.com.br/home/noticias-detalhe/27854/atraso-na-homologacao-pelo-sindicato-nao-gera-multa
- [T9] Férias e ADPF 501: Machado Meyer, "STF derruba Súmula 450 do TST": https://www.machadomeyer.com.br/pt/inteligencia-juridica/publicacoes-ij/inteligencia-juridica-trabalhista/stf-derruba-sumula-450-do-tst ; TRT-3, acórdão ADPF 501: https://portal.trt3.jus.br/internet/jurisprudencia/repercussao-geral-e-controle-concentrado-adi-adc-e-adpf-stf/downloads/Acordao_ADPF_TEMA_501.pdf
- [T10] Sistema Mediador: manual oficial: https://www.gov.br/trabalho-e-emprego/pt-br/pdfs/manual-do-sistema-mediador-srt-digital.pdf ; IN SRT 16/2013: https://www.normaslegais.com.br/legislacao/instrucao-normativa-srt-16-2013.htm ; boletim de negociações (FIEPR): https://fiepr.org.br/para-empresas/conselhos/uploadAddress/4.-BOLETIM-NEGOCIACOES-COLETIVAS-SETEMBRO-2024[111554].pdf
- [T11] Eventos de SST no eSocial: Jornal Contábil, "eSocial: novos prazos e eventos de SST": https://jornalcontabil.com.br/noticia/esocial-novos-prazos-e-eventos-de-sst/ ; Contadores.cnt.br, multas e SST (jul/2025): https://contadores.cnt.br/projetos/43/noticias/tecnicas/2025/07/21/multas-no-esocial-veja-novos-valores-e-as-mudancas-na-rotina-do-sst.html
- [T12] Portaria MTE 1.131/2025 (multas): CRC-SP: https://online.crcsp.org.br/portal/noticias/noticia.asp?c=9389 ; AmdJus: https://amdjus.com.br/?p=786 ; Diário Fiscal: https://diariofiscal.com.br/multa_trabalhista.html ; texto no gov.br: https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/credito-do-trabalhador/legislacao-do-governo-federal/portaria-mte-no-1-131-de-3-de-julho-de-2025-multas.pdf/@@download/file
- [T13] IRRF 2026 (Lei 15.270/2025): Senior, Portal de Exigências Legais: https://documentacao.senior.com.br/exigenciaslegais/noticias/trabalhista-previdenciaria/2025/2025-11-27-trabalhista-lei-15-270-2025-reforma-do-imposto-de-renda-2026 ; Alterdata, novo cálculo do IRRF: https://ajuda.alterdata.com.br/dpbase/como-funciona-o-novo-calculo-do-irrf-em-2026-e-como-ficara-no-sistema-308710172.html
- [T14] Fim da DIRF e informe de rendimentos: CRC-MS: https://crcms.org.br/receita-federal-confirma-extincao-da-dirf-em-2025-e-estende-prazo-para-adaptacao ; Portal SPED Brasil, informe de rendimentos: https://portalspedbrasil.com.br/?p=20759
- [T15] Contribuição assistencial (Tema 935): FINDES, informe jul/2026: https://findes.com.br/wp-content/uploads/2026/07/Informe-Estrategico-–-Direito-de-oposicao-a-contribuicao-assistencial-continua-sem-definicao-uniforme-pelo-TST.pdf ; Machado Meyer: https://www.machadomeyer.com.br/pt/inteligencia-juridica/publicacoes-ij/inteligencia-juridica-trabalhista/trilogia-das-contribuicoes-assistenciais-o-novo-ato-do-stf
- [T16] Feriados no comércio: Cescon Barrieu, Portaria MTE 1.316/2026: https://cesconbarrieu.com.br/feriados-no-comercio/ ; Pontotel: https://www.pontotel.com.br/portaria-1316-2026/ ; COAD, portaria entra em vigor: https://www.coad.com.br/home/noticias-detalhe/137874/portaria-que-trata-do-trabalho-aos-domingos-e-feriados-entra-em-vigor ; FINDES, prorrogação de 90 dias: https://findes.com.br/wp-content/uploads/2026/02/Informe-Estrategico-–-Governo-Federal-prorroga-por-90-dias-as-regras-para-trabalho-em-feriados-no-comercio.pdf
- [T17] Atestados e afastamentos: Metadados (dez/2025): https://www.metadados.com.br/blog/atestado-medico ; Jornal Contábil, afastamentos no eSocial: https://jornalcontabil.com.br/noticia/o-que-muda-nos-afastamentos-temporarios-no-esocial/
- [T18] eSocial Download e webservice: Jornal Contábil: https://jornalcontabil.com.br/noticia/esocial-download-ferramenta-para-facilitar-a-vida-do-empregador/ ; Manual do desenvolvedor v1.7: https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais/manualorientacaodesenvolvedoresocialv1-7.pdf
- [T19] Licença-paternidade (Lei 15.371/2026): IBDFAM: https://ibdfam.org.br/noticias/13759 ; Congresso em Foco: https://www.congressoemfoco.com.br/noticia/117746/lula-sanciona-lei-que-aumenta-a-licenca-paternidade-para-20-dias
- [T20] PAT (Decreto 12.712/2025): Flash: https://flashapp.com.br/blog/novo-decreto-pat ; MTE, perguntas frequentes do PAT: https://www.gov.br/trabalho-e-emprego/pt-br/servicos/empregador/programa-de-alimentacao-do-trabalhador-pat/perguntas-frequentes-new.pdf
- [T21] Notas técnicas do eSocial S-1.3: Fenacon (NT 07/2026): https://fenacon.org.br/?p=55864 ; Contábeis: https://www.contabeis.com.br/noticias/75197/esocial-tera-ajustes-nos-leiautes-versao-s-1-3-em-fevereiro/ ; Tecnospeed (NT 06/2026): https://blog.tecnospeed.com.br/esocial-nota-tecnica-s-1-3-06-2026-ajustes-nos-layouts-e-campo-infopatprec/
- [T22] Seguro-desemprego, RAIS/CAGED e abono: Contábeis, "Empregador Web pode ser descontinuado": https://www.contabeis.com.br/noticias/53289/seguro-desemprego-empregador-web-pode-ser-descontinuado/ ; COAD, eSocial alimenta CAGED e RAIS: https://www.coad.com.br/home/noticias-detalhe/98773/substituicao-de-obrigacoes-dados-do-esocial-passaram-a-alimentar-o-caged-e-a-rais-para-obrigados ; Trabalhista.blog, boletim 16/06/2026: https://trabalhista.blog/tag/esocial/
- [T23] Rotina e dores do DP no escritório: Ledware (11/08/2026): https://www.ledware.com.br/2026/08/11/departamento-pessoal-como-organizar-rotina/ ; Contábeis, otimizar o DP no escritório: https://www.contabeis.com.br/artigos/78474/otimize-a-rotina-do-departamento-pessoal-no-escritorio-contabil/ ; Site Contábil, rotinas de DP e automação: https://sitecontabil.com.br/noticias_empresariais/ler/rotinas-de-dp-que-o-contador-nao-pode-errar-e-onde-a-automacao-entra ; Alterdata, Pack Protocolo: https://ajuda.alterdata.com.br/x/8jiyBg
- [T24] 13º salário 2026: O Povo: https://www.opovo.com.br/trends/13o-salario-de-2026-tem-duas-datas-chave-primeira-parcela-ate-30-de-novembro-e-segunda-ate-18-de-dezembro/ ; Gazeta SP: https://www.gazetasp.com.br/economia/13o-salario-de-2026-tem-primeira-parcela-ate-30-de-novembro-e-segunda-deve-ser-antecipada-para-18-de-dezembro/
- [T25] Procuração no FGTS Digital: Site Contábil, perfis e procuradores: https://sitecontabil.com.br/noticias_empresariais/ler/fgts-digital--saiba-quais-os-perfis-de-acesso--como-registrar-procuradores-e-escritorios-de-contabilidade ; Contábeis, sistema de procuração: https://www.contabeis.com.br/noticias/60985/fgts-digital-libera-sistema-de-procuracao-eletronica/ ; Alterdata, perguntas e respostas: https://ajuda.alterdata.com.br/dpbase/fgts-digital-perguntas-e-respostas-130891913.html
- [T26] NR-7 e exames: Normas Legais, NR-7: https://www.normaslegais.com.br/legislacao/trabalhista/nr/nr7.htm ; Metadados, exame demissional (set/2025): https://www.metadados.com.br/blog/exame-demissional ; CRC-CE, curso de SST: https://www.crc-ce.org.br/crcnovo/files/CURSOSSTCRCCE.pdf
- [T27] DCTFWeb e DARF: Receita Federal, instruções de emissão de DARF: https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/declaracoes-e-demonstrativos/DCTFWeb/notas-orientativas/arquivos/instrucoes-emissao-darf-dctfweb-vencimento-prorrogado.pdf ; CRC-CE, DCTFWeb: https://www.crc-ce.org.br/crcnovo/files/DCTFWebCRC.pdf ; prazo de entrega (IN RFB 2.248/2025) conforme D2 [S8]

**Concorrentes**

- [C1] Domínio, "Perguntas e respostas: Portal do Empregado": https://suporte.dominioatendimento.com/central/faces/solucao.html?codigo=7587
- [C2] Domínio/Onvio Portal do Cliente, solicitações de rescisão, aviso prévio e geral: https://suporte.dominioatendimento.com/central/faces/solucao.html?codigo=10324 ; https://suporte.dominioatendimento.com/central/faces/solucao.html?codigo=10322 ; https://suporte.dominioatendimento.com/central/faces/solucao.html?codigo=10394
- [C3] Alterdata eContador: pré-admissão: https://ajuda.alterdata.com.br/x/lSaED ; agendar férias no app: https://ajuda.alterdata.com.br/econtador/agendar-ferias-econtador-app ; pré-demissão: https://ajuda.alterdata.com.br/packupbase/tema-econtador/econtador-recurso-de-pre-demissao-no-econtador
- [C4] Alterdata ePessoal 3.17.0: https://ajuda.alterdata.com.br/endv/3-17-0-colaborador-359401654.html
- [C5] Thomson Reuters, "Conheça o Gestta": https://images.engage.es-pt.thomsonreuters.com/Web/LALEYSAEIMPRESORA/%7Be40173fd-00db-4d29-a84a-2c10c7c668bf%7D_OUT-_513_-_WP__-_TR_-_Conhe%c3%a7a_o_GESTTA_(NOVO)
- [C6] Questor: Zen (considerações gerais): https://docs.questor.com.br/pt-br/Produtos/Questor_Zen/consideracoes-gerais ; e-Consignado: https://docs.questor.com.br/pt-br/Produtos/GestãoContábil/FolhadePagamento/e-Consignado-Credito-do-Trabalhador/faq_econsignado
- [C8] Flash, coleta de documentos de admissão pelo WhatsApp: https://flashapp.com.br/novidades-de-produto/coleta-documentos-whatsapp-admissao
- [C9] Digisac, contabilidade: https://digisac.com.br/solucoes/segmentos/contabilidade
- [C10] Contábeis, Anaclara (assinatura no WhatsApp): https://www.contabeis.com.br/noticias/71097/assinatura-eletronica-no-whatsapp-anaclara-revoluciona-a-rotina-de-contadores/
- [C11] AmdJus, HubStrom: https://amdjus.com.br/hubstrom-revoluciona-a-contabilidade-com-seu-ecossistema-inteligente-integrado/
- [C12] Alterdata, ponto eletrônico: https://www.alterdata.com.br/contabil/ponto-eletronico
- [C14] Domínio, lançamento de afastamento S-2230: https://suporte.dominioatendimento.com/central/faces/solucao.html?codigo=88

---

## Fichas do ciclo de vida (rodada 3, 6/11/2026)

Rodada feita a pedido do grupo de contadores, que classifica as atividades também pela etapa do ciclo de vida do cliente: **Entrada** (proposta, contrato, cadastro, acessos, diagnóstico, abertura de empresa nova e transição vinda de outra contabilidade), **Manutenção** (rotina contínua) e **Desligamento** (saída para outro contador ou baixa da empresa). As fichas DP-001 a DP-062 não foram alteradas; a classificação delas por etapa está no retorno estruturado da rodada 3 e vai para o visualizador. As fichas abaixo cobrem o que faltava: quase todo o arquivo descreve a Manutenção, e a Entrada e o Desligamento só apareciam de passagem (DP-033, DP-042, DP-045).

- Campos extras: `etapa` e `nível_automação (provisório)` (códigos da tabela 2.3, com a divisão do antigo D em **D-assistido** e **D-humano**). O nível é hipótese; quem decide é a verificação.
- Fontes desta rodada: códigos `[R1]` a `[R10]`, listados ao fim da seção, consultadas em **06/11/2026**. Nesta rodada a leitura direta de páginas funcionou para R1, R2, R3, R4, R5, R6 e R7 (texto extraído do HTML/PDF); R8, R9 e R10 foram lidas só pelo trecho do buscador.
- `tempo_estimado`: todos `[ESTIMATIVA]` do agente.

### DP-101 · Definir o escopo do DP e a matriz de responsabilidades com o cliente na entrada

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / Entrada do cliente (transversal: GES, proposta e contrato) |
| atividade | Levantar o perfil trabalhista do cliente (número de empregados, categorias, CCTs, ponto, benefícios, SST, consignado, pró-labore) e fixar por escrito o que o escritório faz e o que fica com o cliente ou com terceiros |
| descrição | Hoje o escopo do DP costuma ficar implícito ("fazemos a folha"); quem faz ponto, benefícios, SST, homologação e envio de holerites só aparece no primeiro problema. A Resolução CFC 1.590/2020 exige proposta com detalhamento dos serviços e contrato escrito que especifique o que será executado e o que cabe ao contratante [R2]. O perfil coletado alimenta a precificação (por empregado) e o calendário do cliente |
| gatilho_frequência | Por evento (cada cliente novo; revisão quando o escopo muda) |
| porte_alcance | Todos os clientes com empregados |
| quem_faz | Sócio ou comercial; coordenador de DP |
| onde_é_feita_hoje | Reunião, planilha de proposta, e-mail |
| entradas / saídas | Questionário do cliente → perfil trabalhista, matriz de responsabilidades (escritório × cliente × terceiro) anexada ao contrato, estimativa de horas |
| base_legal | Resolução CFC 1.590/2020, arts. 1, 2 (b, c) e 4 [R2] |
| risco_se_falhar | Retrabalho e conflito sobre quem responde por multa; perda de cliente; preço abaixo do custo |
| tempo_estimado | 1–2 h por cliente `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` questionário de escopo de DP em concorrentes |
| hipótese_automação | Questionário no app do cliente; a resposta gera a matriz, a cláusula do contrato e o perfil que liga ou desliga fichas (ex.: sem ponto eletrônico → DP-010 fica com o cliente) |
| papel_da_ia | M2 ler (perfil); M3 executar (horas e preço por empregado); M4 rascunhar (cláusula de escopo e matriz) |
| ferramentas_agênticas | `perfil_trabalhista(cliente)`, `gerar_matriz_responsabilidades(cliente)` |
| eventos_timesheet | `dp.entrada.escopo_definido` |
| fontes_descoberta | [R2] |
| etapa | Entrada |
| nível_automação (provisório) | Próprio |

### DP-102 · Fazer o diagnóstico trabalhista inicial do cliente

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / Entrada do cliente |
| atividade | Levantar, antes de assumir, a situação trabalhista do cliente: pendências e advertências no eSocial, FGTS em aberto, certidões (CRF e CNDT), férias vencidas, empregados sem registro, CCT aplicada, PGR e PCMSO, ponto, consignados e processos |
| descrição | É a "auditoria de entrada" do DP: um raio-x que classifica cada falha por gravidade, probabilidade de passivo e impacto financeiro [R9]. Sem ele, o escritório herda passivo sem registro de que ele já existia. O NBC PG 01 manda comunicar ao cliente, em documento reservado, circunstância adversa que gere risco [R1] |
| gatilho_frequência | Por evento (cliente novo, vindo de outra contabilidade ou com DP interno) |
| porte_alcance | Todos os clientes com empregados que chegam ao escritório |
| quem_faz | Coordenador de DP |
| onde_é_feita_hoje | Portais (eSocial, FGTS Digital, certidões), planilhas e documentos do cliente |
| entradas / saídas | Acessos e documentos → relatório de diagnóstico com pendências, riscos e plano de regularização, ciência do cliente |
| base_legal | NBC PG 01, item 4 (d) e (i) [R1]; multas do eSocial (Portaria MTE 1.131/2025) [T12] |
| risco_se_falhar | Escritório responsabilizado por passivo anterior; multa e juros sobre FGTS e eventos atrasados; perda de cliente |
| tempo_estimado | 2–6 h por cliente `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` diagnóstico de entrada em concorrentes; consultorias oferecem auditoria trabalhista como serviço avulso [R9] |
| hipótese_automação | Roteiro automático por cliente: baixa os eventos do eSocial pelo webservice (DP-039), lê as certidões, compara com a CCT e o arquivo do cliente e monta o relatório; o analista revisa e envia |
| papel_da_ia | M1 ler (regras e CCT); M2 ler (dados herdados); M3 executar (estimativa de passivo e multa); M4 rascunhar (relatório e carta ao cliente) |
| ferramentas_agênticas | `diagnostico_trabalhista(cliente)`, `estimar_passivo_trabalhista(cliente)` |
| eventos_timesheet | `dp.entrada.diagnostico_feito` |
| fontes_descoberta | [R1], [R9], [T12], [T18] |
| etapa | Entrada |
| nível_automação (provisório) | A (download do eSocial por webservice [T18]); CRF e CNDT por consulta em portal, provavelmente C-captcha `[NÃO VERIFICADO]` |

### DP-103 · Receber e conferir o acervo do DP vindo do contador anterior

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / Entrada do cliente · Transição |
| atividade | Pedir ao contador anterior, por lista, tudo o que o DP precisa para continuar e registrar item a item o que chegou, o que falta e o que veio com dúvida |
| descrição | Lista típica para o DP: cadastro e contratos dos empregados ativos com histórico de cargos e salários; folhas, recibos e pró-labore; férias (períodos aquisitivos, recibos, programação e saldos); afastamentos, benefícios, pensões e médias de variáveis; rescisões recentes; eventos e recibos do eSocial, DCTFWeb e guias do FGTS; CCTs e documentos de SST [R4]. Acrescentam-se banco de horas, consignados ativos, estabilidades e processos trabalhistas `[ESTIMATIVA do agente]`. A boa prática é controlar cada item por documento, período, responsável, situação e data combinada [R4]. O contador anterior deve informar ao substituto os fatos relevantes e não pode reter documentos abusivamente [R1][R2] |
| gatilho_frequência | Por evento (cliente vindo de outra contabilidade) |
| porte_alcance | Clientes com empregados que trocam de contabilidade |
| quem_faz | Analista de DP; atendimento |
| onde_é_feita_hoje | E-mail, pen drive, pastas compartilhadas, planilha de conferência |
| entradas / saídas | Pedido ao contador anterior → acervo recebido, termo de recebimento com pendências, cobrança do que falta |
| base_legal | NBC PG 01, item 4 (l) (informar ao substituto) e item 5 (l) (vedado reter livros, papéis e arquivos) [R1]; Resolução CFC 1.590/2020, arts. 7 a 9 (devolução de documentos e comunicação ao novo responsável técnico) [R2] |
| risco_se_falhar | Férias, médias e saldos calculados errado na primeira rescisão; perda de prova em reclamatória; retrabalho |
| tempo_estimado | 3–8 h por cliente, espalhadas por semanas `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` controle de acervo de transição em concorrentes; checklists de troca de contador publicados por escritórios [R4][R10] |
| hipótese_automação | Checklist de transição gerado pelo perfil do cliente (DP-101), enviado ao contador anterior com link de envio; cada arquivo recebido é classificado e baixa o item; lembretes e escalonamento ao cliente quando trava |
| papel_da_ia | M2 ler (classificar o que chegou); M4 executar (pedido e lembretes ao contador anterior, com aprovação); M4 rascunhar (termo de recebimento) |
| ferramentas_agênticas | `checklist_transicao(cliente, setor='DP')`, `registrar_item_acervo(cliente, item, status)` |
| eventos_timesheet | `dp.transicao.acervo_pedido`, `dp.transicao.acervo_conferido` |
| fontes_descoberta | [R1], [R2], [R4], [R10] |
| etapa | Entrada |
| nível_automação (provisório) | Próprio |

### DP-104 · Assumir o eSocial e a folha a partir de uma competência de corte

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / Entrada do cliente · Transição |
| atividade | Combinar com o contador anterior a competência de corte, trocar o informante no eSocial, carregar o histórico no core e rodar o primeiro fechamento assistido |
| descrição | O histórico enviado ao eSocial não se perde; o novo sistema reenvia as tabelas iniciais (S-1000 a S-1020), com fim de validade nas do sistema anterior e nova data de início, baixa os XMLs já processados no portal e os importa no core para não redigitar vínculos; os cadastros importados costumam vir com pendências (PIS, tipo de contrato, sindicato); o primeiro fechamento deve conferir folha, guias e os retornos S-5001/S-5002 [R3]. Sem data de corte, os dois sistemas enviam e o eSocial acusa duplicidade [R3]. Pela Resolução CFC 1.590/2020, as obrigações acessórias de competência ocorrida durante o contrato antigo ficam com o contador anterior, mesmo que vençam depois, salvo cláusula em contrário [R2]. Entram também saldos de férias, banco de horas, médias e consignados (DP-103) |
| gatilho_frequência | Por evento (cliente vindo de outra contabilidade ou de DP interno) |
| porte_alcance | Clientes com empregados que trocam de contabilidade |
| quem_faz | Analista de DP; suporte do core |
| onde_é_feita_hoje | Portal do eSocial (download), core (importação), planilhas de saldos |
| entradas / saídas | Acervo e XMLs → empresa ativa no core, tabelas reenviadas, empregados conferidos, primeiro mês fechado sem divergência |
| base_legal | Resolução CFC 1.590/2020, art. 10 [R2]; multas do eSocial (Portaria MTE 1.131/2025) [T12]; procedimento de troca de informante conforme fornecedor de software [R3], a conferir no MOS do eSocial `[NÃO VERIFICADO]` em fonte oficial |
| risco_se_falhar | Eventos rejeitados ou duplicados; competência sem envio entre os dois escritórios; multa; FGTS e DCTFWeb divergentes |
| tempo_estimado | 4–12 h por cliente na primeira competência `[ESTIMATIVA]` |
| concorrentes | Makro: roteiro de troca de sistema com reenvio de tabelas e importação de XML [R3]; demais cores importam XML do eSocial `[NÃO VERIFICADO]` |
| hipótese_automação | Plano de corte gerado pela plataforma (quem envia o quê em cada competência, por escrito, com aceite das duas partes); download dos XMLs pelo webservice; conferência automática do que o core importou contra o eSocial (DP-039); checklist do primeiro fechamento |
| papel_da_ia | M1 ler (regra de responsabilidade por competência); M2 ler (comparar core × eSocial); M4 rascunhar (plano de corte e e-mail ao contador anterior) |
| ferramentas_agênticas | `plano_corte_competencia(cliente)`, `baixar_eventos_esocial(cliente, periodo)`, `conferir_carga_core(cliente)` |
| eventos_timesheet | `dp.transicao.corte_definido`, `dp.transicao.primeiro_fechamento` |
| fontes_descoberta | [R2], [R3], [T12], [T18] |
| etapa | Entrada |
| nível_automação (provisório) | F (importação dos XMLs e saldos no core); A no download do eSocial [T18] |

### DP-105 · Preparar o empregador novo antes da primeira admissão

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / Entrada do cliente · Abertura de empresa |
| atividade | Para empresa recém-aberta (ou cliente que contrata o primeiro empregado), deixar tudo pronto antes da primeira admissão: S-1000 e tabelas iniciais, procurações (eSocial, FGTS Digital, DET), enquadramento sindical, fornecedor de SST com PGR e PCMSO, rubricas e parâmetros no core |
| descrição | O S-1000 é o primeiro evento e nenhum outro pode ser enviado antes; o S-1005 precede S-2200 e S-1200, e o S-1010 precede a remuneração [R8]. Guias de 2026 dizem que o cadastro do empregador é obrigatório desde a abertura do CNPJ, mesmo sem empregados [R8] (afirmação de blog, `[NÃO VERIFICADO]` no MOS). Hoje a preparação costuma acontecer na véspera da admissão, junto com DP-001 |
| gatilho_frequência | Por evento (abertura de empresa; primeiro empregado) |
| porte_alcance | Empresas novas e clientes sem empregados que passam a contratar |
| quem_faz | Analista de DP; societário (abertura) |
| onde_é_feita_hoje | Core, portais gov.br, e-mail com o cliente |
| entradas / saídas | Dados da empresa aberta e da primeira vaga → empregador cadastrado, procurações aceitas, CCT definida, SST contratada, checklist concluído |
| base_legal | Ordem dos eventos iniciais do eSocial [R8]; procurações (DP-042) [T18][T25]; NR-1 e NR-7 (PGR e PCMSO) [T26] `[NÃO VERIFICADO]` quanto à exigência antes da primeira admissão |
| risco_se_falhar | Primeira admissão fora do prazo (S-2200 até a véspera) [T3]; multa; ASO admissional sem PCMSO |
| tempo_estimado | 2–4 h por cliente `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` checklist de primeiro empregado em concorrentes; guias de escritórios digitais [R8] |
| hipótese_automação | Checklist disparado pelo fim da abertura (societário) ou pela primeira solicitação de admissão; liga DP-033, DP-042 e DP-049; alerta se a admissão chegar com o checklist aberto |
| papel_da_ia | M1 ler (ordem dos eventos, CCT); M2 ler (status); M4 executar (pedidos ao cliente e ao fornecedor de SST, com aprovação) |
| ferramentas_agênticas | `checklist_empregador_novo(cliente)` |
| eventos_timesheet | `dp.entrada.empregador_preparado` |
| fontes_descoberta | [R8], [T3], [T18], [T25], [T26] |
| etapa | Entrada |
| nível_automação (provisório) | Próprio (orquestração); o envio das tabelas sai do core (B ou F) |

### DP-106 · Entregar o acervo do DP ao novo contador e fechar a última competência

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / Desligamento do cliente · Saída para outro contador |
| atividade | Quando o cliente sai, montar e entregar o acervo do DP (relatórios, XMLs, saldos de férias e banco de horas, pendências), combinar por escrito a última competência a cargo do escritório e informar ao sucessor os fatos relevantes |
| descrição | É o espelho de DP-103 e DP-104 do lado de quem sai. O distrato é obrigatório e deve fixar a forma e o prazo de devolução de documentos e arquivos; o contador que sai responde pelas obrigações acessórias das competências do seu contrato, mesmo que vençam depois, e deve comunicar ao novo responsável técnico os fatos de que ele deva saber [R2]; reter documentos abusivamente é vedado [R1]. No DP, os fatos relevantes incluem fiscalização em curso, processos trabalhistas, afastados e estáveis, consignados e férias a vencer `[ESTIMATIVA do agente]` |
| gatilho_frequência | Por evento (distrato) |
| porte_alcance | Clientes com empregados que saem do escritório |
| quem_faz | Coordenador de DP; atendimento |
| onde_é_feita_hoje | E-mail, pen drive, relatórios do core |
| entradas / saídas | Distrato → pacote de entrega, carta de transição com fatos relevantes, protocolo de entrega assinado |
| base_legal | Resolução CFC 1.590/2020, arts. 6 a 10 [R2]; NBC PG 01, itens 4 (l) e 5 (l) [R1] |
| risco_se_falhar | Processo ético no CRC; obrigação de competência antiga sem dono; reclamação do cliente |
| tempo_estimado | 2–6 h por cliente `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Pacote de saída gerado pela plataforma a partir do arquivo digital (DP-060), dos XMLs (DP-039) e dos saldos do core; carta de transição rascunhada; protocolo de entrega com aceite no app |
| papel_da_ia | M1 ler (responsabilidade por competência); M2 ler (o que está em aberto); M4 rascunhar (carta e protocolo) |
| ferramentas_agênticas | `pacote_saida(cliente, setor='DP')`, `carta_transicao(cliente)` |
| eventos_timesheet | `dp.saida.acervo_entregue` |
| fontes_descoberta | [R1], [R2] |
| etapa | Desligamento |
| nível_automação (provisório) | Próprio |

### DP-107 · Revogar procurações e acessos trabalhistas na saída do cliente

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / Desligamento do cliente (transversal: D1 e GES) |
| atividade | Encerrar os poderes e acessos do escritório: procuração do FGTS Digital (SPE), procuração ou autorização do eSocial, perfis no DET, acessos a ponto, benefícios e portal do empregado, certificado A1 do cliente guardado no cofre |
| descrição | DP-042 cobre a obtenção e a validade; nada cobre o fim. No SPE, a procuração é revogada pela tela de procurações cedidas ("Revogar"); "Aditar" não retira serviços nem reduz prazo; a revogação extingue a cadeia de substabelecimentos [R6]. A boa prática é revisar as autorizações antigas de forma coordenada, sem interromper entregas ainda a cargo do escritório que sai [R4]. O escritório continua com poderes até o cliente revogar; o ato é do outorgante, e a renúncia pelo procurador `[NÃO VERIFICADO]` |
| gatilho_frequência | Por evento (distrato ou baixa) |
| porte_alcance | Todos os clientes com empregados que saem |
| quem_faz | Atendimento; analista de DP |
| onde_é_feita_hoje | Portais gov.br, planilha de acessos |
| entradas / saídas | Distrato → lista de acessos a encerrar, guia ao cliente, confirmação de revogação, A1 excluído do cofre com registro |
| base_legal | Manual do SPE do FGTS Digital v1.1 [R6]; autorizações da RFB (D1); LGPD (dados de empregados) `[NÃO VERIFICADO]` |
| risco_se_falhar | Escritório segue com acesso e responsabilidade aparente sobre cliente que saiu; vazamento de dados; uso indevido do A1 |
| tempo_estimado | 30–60 min por cliente `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | A matriz de DP-042 vira lista de encerramento; a plataforma manda ao cliente o passo a passo por sistema, confirma a revogação testando o acesso e apaga o A1 e as credenciais com registro |
| papel_da_ia | M2 ler (matriz de acessos); M4 executar (guia ao cliente e teste de acesso, com aprovação) |
| ferramentas_agênticas | `lista_encerramento_acessos(cliente)`, `confirmar_revogacao(cliente, sistema)` |
| eventos_timesheet | `dp.saida.acessos_revogados` |
| fontes_descoberta | [R4], [R6], D1 |
| etapa | Desligamento |
| nível_automação (provisório) | D-assistido (o ato final é do cliente no portal; o agente prepara, conduz e confere) |

### DP-108 · Encerrar o DP na baixa da empresa

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / Desligamento do cliente · Baixa (transversal: GES e FIS, baixa) |
| atividade | Antes e depois da baixa: rescindir todos os vínculos (DP-026 a DP-032), enviar a última folha e o fechamento, recolher FGTS e DCTFWeb finais, encerrar o empregador no eSocial e comunicar terceiros (sindicato, benefícios, plano de saúde, SST) |
| descrição | O fechamento S-1299 encerra os periódicos da competência; o envio do S-1000/S-1005 de encerramento "encerra de forma definitiva as informações da empresa no eSocial" e preenche a data de fim de atividades [R5]. Não há procedimento oficial lido nesta rodada sobre a ordem entre o último S-1299 e o encerramento, nem sobre o que acontece no FGTS Digital e no DET depois da baixa `[NÃO VERIFICADO]`. O informe de rendimentos do ano da baixa ainda é devido (DP-054) |
| gatilho_frequência | Por evento (baixa) |
| porte_alcance | Clientes com empregados que encerram as atividades |
| quem_faz | Coordenador de DP; societário |
| onde_é_feita_hoje | Core, eSocial, FGTS Digital, DCTFWeb |
| entradas / saídas | Decisão de baixa → rescisões feitas, guias finais pagas, empregador encerrado no eSocial, comprovantes arquivados para a guarda (DP-109) |
| base_legal | Eventos S-1299 e S-1000/S-1005 de encerramento conforme fornecedor de software [R5], a conferir no MOS `[NÃO VERIFICADO]`; prazo de rescisão (CLT art. 477) [T8] |
| risco_se_falhar | Baixa travada por pendência trabalhista; multa por evento não enviado; empregado sem verbas ou sem seguro-desemprego |
| tempo_estimado | 2–8 h por empresa, além das rescisões `[ESTIMATIVA]` |
| concorrentes | Alterdata: rotina para encerrar atividades da empresa no eSocial [R5] |
| hipótese_automação | Checklist de baixa do DP integrado ao processo de baixa societária: lista de vínculos a rescindir, calendário das guias finais, conferência de que o eSocial e o FGTS Digital não têm pendência antes do encerramento |
| papel_da_ia | M1 ler (ordem dos eventos); M3 executar (custo das rescisões, DP-059); M4 rascunhar (comunicados a terceiros e aos empregados) |
| ferramentas_agênticas | `checklist_baixa_dp(cliente)` |
| eventos_timesheet | `dp.baixa.encerrado` |
| fontes_descoberta | [R5], [T8] |
| etapa | Desligamento |
| nível_automação (provisório) | F (rescisões e eventos gerados no core); Próprio na orquestração |

### DP-109 · Definir guarda, devolução e descarte dos dados de empregados após o fim da relação

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Trabalhista e DP / Desligamento do cliente · Arquivo e LGPD |
| atividade | Ao fim do contrato com o cliente (saída ou baixa), decidir o que se devolve, o que o escritório guarda e por quanto tempo, e quando os dados pessoais dos empregados são eliminados |
| descrição | O escritório guarda contratos, folhas, ASOs e documentos de saúde dos empregados do cliente. Uma tabela de agosto de 2026 indica: folha, recibos e ponto por 5 anos, até 2 anos após o fim do contrato de trabalho (CF art. 7º, XXIX); FGTS por até 5 anos após o fim de cada contrato (cita a Lei 8.036/1990, art. 23-A, §3º, e o STF ARE 709.212); prontuário ocupacional e PPP por 20 anos; registros anteriores ao eSocial sem prazo numérico; e, vencido o prazo, a LGPD manda eliminar, salvo exceções [R7]. A devolução de documentos ao cliente deve estar no distrato [R2] |
| gatilho_frequência | Por evento (distrato ou baixa); anual (varredura de prazos vencidos) |
| porte_alcance | Todos os ex-clientes com empregados |
| quem_faz | Coordenador de DP; responsável por LGPD do escritório |
| onde_é_feita_hoje | Rede, papel, backup sem política |
| entradas / saídas | Arquivo do cliente → termo de devolução, inventário do que fica guardado com prazo, registro de eliminação |
| base_legal | Resolução CFC 1.590/2020, art. 9 [R2]; prazos de guarda e LGPD conforme [R7], com os artigos a conferir no Planalto `[NÃO VERIFICADO]` |
| risco_se_falhar | Vazamento de dado sensível (saúde) de quem nem é mais cliente; guarda sem base legal; falta de documento numa reclamatória |
| tempo_estimado | 1–2 h por cliente na saída `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Cada documento do dossiê (DP-060) já nasce com tipo e prazo de guarda; na saída, a plataforma gera o termo de devolução e agenda a eliminação por documento, com registro |
| papel_da_ia | M1 ler (prazos versionados); M2 ler (inventário); M4 executar (agendar eliminação, com aprovação) |
| ferramentas_agênticas | `politica_guarda(cliente)`, `agendar_eliminacao(documentos, data)` |
| eventos_timesheet | `dp.saida.guarda_definida`, `dp.arquivo.dado_eliminado` |
| fontes_descoberta | [R2], [R7] |
| etapa | Desligamento |
| nível_automação (provisório) | Próprio |

### Fontes da rodada 3

Todas consultadas em 06/11/2026.

- [R1] CFC, NBC PG 01 (Código de Ética Profissional do Contador, 07/02/2019), item 4 (d), (i), (l); item 5 (l); item 6 (b) — texto lido no PDF do Sindcont-SP: https://www.sindcontsp.org.br/wp-content/uploads/2021/04/NBCPG01.pdf
- [R2] Resolução CFC 1.590/2020 (contrato e distrato de serviços contábeis), arts. 1 a 10 — texto lido em Normas Legais: https://www.normaslegais.com.br/legislacao/resolucao-cfc-1590-2020.htm
- [R3] Makro Sistemas, "eSocial para troca de sistema contábil" (cita nota orientativa de outubro/2026): https://makrosystem.com.br/blog/e-social-para-troca-de-sistema-contabil/
- [R4] Meu Contador Online, "Mudança de contabilidade: documentação necessária para transferência" (seção Departamento pessoal e folha; acessos e autorizações): https://www.meucontadoronline.com.br/blog/mudanca-de-contabilidade-o-que-e-qual-a-documentacao-necessaria-para-transferencia/
- [R5] Alterdata, ajuda "Demais eventos" (S-1299; S-1000/S-1005 encerrar atividades da empresa): https://ajuda.alterdata.com.br/wdp/demais-eventos-95073265.html
- [R6] Pontotel, "Procuração FGTS Digital" (18/06/2024), revogação no SPE: https://www.pontotel.com.br/procuracao-fgts-digital/ ; manual oficial do SPE v1.1 (01/03/2024), não aberto nesta rodada: https://www.gov.br/trabalho-e-emprego/pt-br/servicos/empregador/fgtsdigital/manual-e-documentacao-tecnica/manual-do-orientacao-do-spe-v1-1-01-03-2024.pdf
- [R7] Confidata, "Quanto tempo guardar documentos? Tabela de prazos e a LGPD" (12/08/2026): https://confidata.com.br/blog/prazo-guarda-documentos-empresa-tabela-lgpd
- [R8] Primeira contratação e eventos iniciais (trechos do buscador): Contabilidade Zen, "eSocial na primeira contratação 2026": https://www.contabilidadezen.com.br/blog/esocial-primeira-contratacao-2026/ ; Grupo Módulos, leiaute S-1000: https://grupomodulos.com.br/wp-content/uploads/2023/06/s-1000.pdf
- [R9] CLM Controller, "Auditoria trabalhista" (trecho do buscador): https://clmcontroller.com.br/recursos-humanos/auditoria-trabalhista/
- [R10] Agilize, "Documentos para trocar de contabilidade: checklist completo" (trecho do buscador): https://agilize.com.br/artigos/documentos-necessarios-trocar-contabilidade

**Lacunas da rodada 3:** MOS do eSocial não aberto (troca de informante, ordem entre o último S-1299 e o S-1000 de encerramento, cadastro do empregador sem empregados); manual do SPE não aberto (renúncia pelo procurador); situação do FGTS Digital e do DET depois da baixa `[NÃO ENCONTRADO]`; forma de consulta de CRF e CNDT (captcha ou não) `[NÃO VERIFICADO]`; artigo da Lei 8.036/1990 citado em [R7] a conferir no Planalto.

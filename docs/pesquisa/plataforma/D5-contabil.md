# D5 · Descoberta: Contábil

5 de novembro de 2026 · Etapa 1 do [Protocolo de Descoberta](00-protocolo-de-descoberta.md) · agente D5

**Escopo:** tudo o que o escritório faz **em volta** do core (Domínio, Alterdata, Contmatic) na contabilidade: coleta mensal de documentos do cliente, extratos bancários (OFX, PDF, Open Finance), cartões e adquirentes, conciliação e classificação contábil assistida, conferência das integrações fiscal e folha, checklist e painel de fechamento, relatórios gerenciais e indicadores ao cliente, distribuição de lucros (agora com a Lei 15.270/2025), encerramento anual, acompanhamento de ECD e ECF, publicação e aprovação de contas, inventário de estoque e imobilizado quando feitos fora do core, e obrigações do próprio profissional ligadas à contabilidade (carta de responsabilidade, COAF, DECORE). A escrituração, o balancete, a apuração do IRPJ/CSLL e a geração dos arquivos SPED ficam no core (regra 3.7); entram aqui preparar, coletar, conferir, transmitir, comprovar, comunicar, cobrar e controlar.

## Como ler este arquivo

- **52 fichas** (`CTB-001` a `CTB-052`), agrupadas por subárea, com os campos da seção 2.1 do protocolo.
- **Fontes:** citadas por código (`[T7]` para normas, imprensa e órgãos; `[C3]` para concorrentes e fornecedores) e listadas com link na seção "Fontes". Todas consultadas em **05/11/2026**.
- **Limitação de método:** nesta sessão a leitura direta de páginas foi bloqueada pela rede (curl recusado pelo proxy para `contabeis.com.br` e `nibo.com.br`; WebFetch sem resolução de DNS para `planalto.gov.br`). As fontes foram lidas pelos **resumos e trechos do buscador** (WebSearch). Prazos e normas aqui têm confiança **média**; a Etapa 2 (V1) precisa abrir no original a IN RFB 2.003/2021 (com a IN 2.142/2023), a IN RFB 2.004/2021, a Lei 15.270/2025, a LC 224/2025, a LC 123/2006 (art. 14) e as Resoluções CFC citadas antes de qualquer prazo virar regra no calendário. Onde as fontes divergiram, as versões estão registradas.
- **`tempo_estimado`:** nenhuma fonte pública trouxe medição de tempo por atividade contábil (busca: "pesquisa escritórios contábeis horas retrabalho documentos", sem dado quantitativo [T16]). Todos os tempos são `[ESTIMATIVA]` do agente e devem ser substituídos pelo levantamento com os contadores (Apêndice do Plano).
- **`papel_da_ia`:** motores M1 (legal), M2 (escritório), M3 (cálculo), M4 (ação); níveis **ler**, **rascunhar**, **executar** (executar sempre com cartão de aprovação no chat; nunca automático quando exigir o login ou a assinatura pessoal do contador).
- **`eventos_timesheet`:** padrão `ctb.<objeto>.<verbo>`; todo evento leva setor `CTB`, cliente, competência, usuário ou IA, início, fim e quem aprovou.
- **Ferramentas agênticas** são propostas de nome e assinatura da plataforma, não serviços existentes. O catálogo final sai da Etapa 3.
- `transversal: Dx` indica atividade que se repete em outra aba e deve virar uma ferramenta só.
- Códigos de nível de automação (tabela 2.3) aparecem só como **hipótese** entre parênteses; quem decide é a Etapa 2.

## Achados que mudam as hipóteses do Plano (seções 3 e 4.6)

1. **O prazo da ECD não é mais maio.** A IN RFB 2.142/2023 alterou o art. 5º da IN RFB 2.003/2021: a ECD vai até o **último dia útil de junho** do ano seguinte (para o ano-calendário 2025, 30/06/2026) [T1]. Multa citada: 0,02% por dia de atraso, limitada a 1% da receita bruta (art. 12 da Lei 8.218/1991, segundo as fontes) [T1]. O Plano não tinha prazo; o calendário precisa nascer com a regra certa (CTB-041).
2. **ECF:** último dia útil de julho (31/07/2026 para o ano-calendário 2025) [T2]. As fontes **divergem** sobre a multa (0,25% ao mês sobre o lucro líquido, limitada a 10%, para o Lucro Real, pelo art. 8º-A do DL 1.598/1977; 0,02% ao dia sobre a receita bruta, limitada a 1%, para presumido e arbitrado) [T2]. A Etapa 2 resolve.
3. **Distribuição de lucros virou rotina mensal com retenção.** Desde 01/01/2026 (Lei 15.270/2025), pagamentos de lucros acima de **R$ 50 mil no mês, por beneficiário e por fonte pagadora**, sofrem IRRF de 10% sobre o total (não só o excedente), informado na EFD-Reinf (R-4010, segundo as fontes) [T3]. Há ainda o **IRPFM** anual para rendas acima de R$ 600 mil [T3]. O Plano tratava distribuição como P3 e "simulação"; passa a ser controle mensal com risco de retenção a menor (CTB-034, CTB-035).
4. **Estoque de lucros até 2025 exige controle até 2028.** A isenção dependia de deliberação até 31/12/2025, prorrogada por liminar no STF (ADIs 7.912 e 7.914) até 31/01/2026, com pagamento nos termos do ato até 2028 [T4]. O desfecho do referendo da liminar `[NÃO VERIFICADO]`. Cada cliente que aprovou ata precisa de um cronograma vigiado (CTB-036).
5. **Simples e dividendos: ponto controverso.** Fontes divergem se a retenção da Lei 15.270 alcança optantes do Simples (isenção do art. 14 da LC 123) [T3]. O sistema precisa registrar a tese adotada por cliente, não decidir sozinho.
6. **LC 224/2025 mexe no lucro presumido e no lucro distribuível.** Acréscimo de 10% nos percentuais de presunção sobre a parcela da receita acima de R$ 5 milhões por ano (R$ 1,25 milhão por trimestre, IN RFB 2.306/2026 segundo a fonte) e JCP com IRRF de 17,5% (fonte única) [T15]. Há liminares no TRF-3 suspendendo o acréscimo e a ADI 7936 no STF [T15]. Afeta o cálculo do "lucro presumido distribuível sem escrituração" (CTB-033) e o JCP (CTB-038).
7. **Contabilização de CBS/IBS em 2026 sem consenso.** IOB registra que o CFC apresentou argumentos dos dois lados sobre contabilizar CBS/IBS já em 2026; material de curso afirma obrigatoriedade a partir do Decreto 12.955/2026 e da Resolução CGIBS 6/2026; CRC-SP publicou e-book de contabilização em 14/08/2026 [T10]. Rotina nova não prevista no Plano (CTB-023).
8. **Carta de responsabilidade da administração é exigência anual do CFC** (Res. CFC 987/2003, alterada pela 1.457/2013), e a assinatura das demonstrações fica vinculada à entrega; recusa deve ser comunicada ao CRC [T6]. Pequena, anual, esquecida e com risco ético (CTB-039).
9. **Aprovação de contas da LTDA até 30/04** (art. 1.078 do Código Civil; dispensa de reunião com decisão escrita de todos os sócios, art. 1.072 §3º) [T7]. Liga o encerramento contábil ao societário e à distribuição de lucros (CTB-037; transversal D1).
10. **Open Finance tem limites que o Plano não citava:** histórico de transações de até 12 meses no endpoint principal (Celcoin) e consentimento por prazo indeterminado ou de 6 a 12 meses (FAQ da Caixa); renovação simplificada começou só para PF [T12]. O consentimento vencido vira tarefa recorrente (CTB-010). Preços de agregadores não são públicos (Pluggy "sob consulta"; relato informal de ~R$ 2,5 mil/mês) [C8].
11. **O core já importa OFX e concilia** (Domínio: Utilitários > Importação > Extrato Bancário, até 12 meses, histórico pela tag MEMO ou NAME [C3]; Alterdata e Questor também [C11][C2]; Questor já tem Open Finance nativo [C2]). O diferencial da plataforma não é importar o extrato, e sim **coletar, completar, classificar com contexto, explicar e cobrar o que falta** antes do core.
12. **A Conta Azul se declara o único ERP integrado por API ao Domínio** e comprou a Mister Contador (lançamentos para ~3.000 escritórios) em julho/2026 [C4]. Concorrência direta na classificação assistida; também é uma fonte de dados do cliente a integrar (CTB-007).
13. **DECORE** é emitida só pelo contador, com upload dos documentos de lastro e validade de 90 dias (Res. CFC 1.364/2011, alterada pelas 1.403/2012 e 1.492/2015) [T11]; depende do que a contabilidade tem (pró-labore escriturado, lucros) (CTB-032).
14. **COAF:** Declaração de Não Ocorrência de 1º a 31 de janeiro, pelo sistema do CFC ou app CRC Digital; fontes divergem entre Res. CFC 1.530/2017 e 1.721/2024 como norma vigente [T5] (CTB-049).

---

## A. Coleta mensal de documentos

### CTB-001 · Montar e manter o checklist de documentos esperados de cada cliente

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Contábil / Coleta de documentos |
| atividade | Definir, por cliente, o que deve chegar todo mês: contas bancárias e de pagamento, cartões, adquirentes, aplicações, empréstimos, folha, notas, recibos, contratos, relatório do ERP |
| descrição | Hoje está na cabeça do analista ou numa planilha; muda quando o cliente abre conta, troca maquininha ou toma empréstimo, e ninguém atualiza |
| gatilho_frequência | Na entrada do cliente; por evento (conta nova, contrato novo); revisão anual |
| porte_alcance | Todos com escrituração completa; Simples com livro caixa em versão reduzida |
| quem_faz | Analista contábil; coordenador na implantação |
| onde_é_feita_hoje | Planilha, memória, às vezes tarefa no Domínio Processos ou similar |
| entradas / saídas | Perfil do cliente, contas do plano de contas → lista versionada de "documentos esperados por competência" |
| base_legal | ITG 2000 (escrituração com documentação hábil) `[NÃO VERIFICADO]` quanto ao texto vigente |
| risco_se_falhar | Conta bancária fora da contabilidade, saldo que não fecha, omissão de receita |
| tempo_estimado | 30–60 min por cliente na implantação; 5 min por mudança `[ESTIMATIVA]` |
| concorrentes | Tareffa (Questor): processo modelo de "Cobra Arquivos" com checklist por cliente [C1]; boas práticas recomendam checklists distintos por regime [T19] |
| hipótese_automação | Checklist gerado a partir do perfil temporal do cliente (D1) e do plano de contas (saldos bancários existentes no balancete), com sugestão de item novo quando aparece conta nova no extrato ou na nota |
| papel_da_ia | M2 ler (perfil, balancete); M4 rascunhar (checklist proposto para o analista aprovar) |
| ferramentas_agênticas | `gerar_checklist_documentos(cliente)`, `atualizar_checklist(cliente, item, acao)` |
| eventos_timesheet | `ctb.checklist.criado`, `ctb.checklist.alterado` |
| fontes_descoberta | [C1], [T19] |

### CTB-002 · Pedir os documentos da competência ao cliente

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Contábil / Coleta de documentos |
| atividade | Abrir a competência e enviar ao cliente a lista do que precisa mandar, com prazo |
| descrição | Mensagem manual por WhatsApp ou e-mail no início do mês, muitas vezes copiada e colada; alguns escritórios usam lembrete automático do sistema de tarefas |
| gatilho_frequência | Mensal (dia 1 a 5, conforme o calendário do escritório) |
| porte_alcance | Todos |
| quem_faz | Analista contábil; atendimento |
| onde_é_feita_hoje | WhatsApp, e-mail, portal do core |
| entradas / saídas | Checklist (CTB-001) → solicitação enviada, prazo registrado |
| base_legal | Contrato de prestação de serviços (prazo de entrega de documentos) `[NÃO VERIFICADO]` |
| risco_se_falhar | Fechamento atrasa; obrigações dependentes (ECD, DEFIS, balancete para banco) atrasam |
| tempo_estimado | 3–5 min por cliente por mês `[ESTIMATIVA]` |
| concorrentes | Tareffa envia solicitação de checklist ao cliente [C1]; blogs de atendimento descrevem mensagens automáticas mensais pedindo notas, extratos e comprovantes [C16] |
| hipótese_automação | Disparo automático no dia configurado, no canal preferido do cliente, só com os itens que não chegam sozinhos (Open Finance, XML capturado e ERP integrado saem da lista) |
| papel_da_ia | M2 ler (o que já chegou por integração); M4 executar (envio em lote com aprovação de modelo) |
| ferramentas_agênticas | `abrir_competencia(cliente, mes)`, `solicitar_documentos(cliente, mes, canal)` |
| eventos_timesheet | `ctb.coleta.solicitada` |
| fontes_descoberta | [C1], [C16] |

### CTB-003 · Cobrar os documentos pendentes até completar

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Contábil / Coleta de documentos |
| atividade | Lembrar o cliente do que falta, várias vezes, até a competência ficar completa |
| descrição | O analista consulta a planilha, manda "faltou o extrato do Itaú", espera, manda de novo; a cobrança some quando o analista sai de férias |
| gatilho_frequência | Mensal, em régua (ex.: D+3, D+7, D+10 após o pedido) |
| porte_alcance | Todos |
| quem_faz | Analista contábil; atendimento |
| onde_é_feita_hoje | WhatsApp, e-mail, telefone |
| entradas / saídas | Pendências da competência → mensagens, histórico de cobrança, escalonamento ao sócio do cliente |
| base_legal | — |
| risco_se_falhar | Fechamento parado; retrabalho quando o documento chega depois (CTB-027) |
| tempo_estimado | 10–30 min por cliente por mês, em várias interações `[ESTIMATIVA]` |
| concorrentes | Tareffa: 3 lembretes automáticos e reenvio manual [C1]; HubStrom anuncia atendimento e tarefas integrados [C10] |
| hipótese_automação | Régua configurável por cliente, mensagem que lista só o que falta, escalonamento para outro contato, relatório de "clientes que mais atrasam" (insumo de rentabilidade, D7) |
| papel_da_ia | M2 ler; M4 executar (régua) e rascunhar (mensagem personalizada para casos difíceis) |
| ferramentas_agênticas | `pendencias_competencia(cliente, mes)`, `cobrar_pendencias(cliente, mes, canal)` |
| eventos_timesheet | `ctb.coleta.cobrada` |
| fontes_descoberta | [C1], [C10], [T16] · transversal: D2, D4 (régua de cobrança única) |

### CTB-004 · Receber, identificar e arquivar os documentos que chegam soltos

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Contábil / Coleta de documentos |
| atividade | Pegar fotos, PDFs e planilhas enviados por WhatsApp e e-mail, descobrir de qual cliente e competência são, renomear e arquivar |
| descrição | Arquivos chegam no WhatsApp pessoal do analista, em e-mails com 20 anexos ou como foto de comprovante; o analista baixa, renomeia e move para a pasta da rede |
| gatilho_frequência | Diária |
| porte_alcance | Todos |
| quem_faz | Analista contábil; auxiliar |
| onde_é_feita_hoje | WhatsApp, e-mail, pasta de rede, portal do core |
| entradas / saídas | Arquivo bruto → documento classificado (cliente, competência, tipo), item do checklist baixado |
| base_legal | LGPD (dados de terceiros nos comprovantes) `[NÃO VERIFICADO]` quanto a regra específica |
| risco_se_falhar | Documento perdido, lançamento sem suporte |
| tempo_estimado | 1–3 min por arquivo `[ESTIMATIVA]` |
| concorrentes | Gestta envia documentos ao cliente e controla tarefas, integrado ao Onvio [C5]; Contmatic publica conteúdo sobre envio de documentação sem digitação [C15] |
| hipótese_automação | Caixa de entrada única (WhatsApp e e-mail da plataforma) com leitura do arquivo, identificação do tipo (extrato, fatura, recibo, contrato, boleto) e do cliente pelo remetente e pelo CNPJ no documento; confirma o item do checklist |
| papel_da_ia | M2 rascunhar (classificar o documento); M4 executar (arquivar e baixar pendência, com revisão de baixa confiança) |
| ferramentas_agênticas | `classificar_documento(arquivo, remetente)`, `arquivar_documento(cliente, mes, tipo, arquivo)` |
| eventos_timesheet | `ctb.documento.recebido`, `ctb.documento.classificado` |
| fontes_descoberta | [C5], [C15] · transversal: D3, D4, D7 |

### CTB-005 · Conferir se a competência está completa antes de fechar

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Contábil / Coleta de documentos |
| atividade | Verificar se chegaram todos os extratos (meses inteiros, sem buracos de datas), notas e folha, e se os saldos iniciais batem com o fechamento anterior |
| descrição | O analista só descobre o extrato incompleto ou o mês faltando na hora de conciliar; fontes descrevem o contador que "acredita ter todos os documentos" e descobre a lacuna no fechamento [T16] |
| gatilho_frequência | Mensal |
| porte_alcance | Todos com escrituração completa |
| quem_faz | Analista contábil |
| onde_é_feita_hoje | Core e planilha |
| entradas / saídas | Documentos recebidos, saldo anterior → status "completa" ou lista de lacunas |
| base_legal | — |
| risco_se_falhar | Fechamento errado, retrabalho, saldo bancário contábil diferente do real |
| tempo_estimado | 10–20 min por cliente por mês `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` produto que confira cobertura de datas do extrato e saldo inicial antes do core (busca: "conferência completude extrato contabilidade", "lacunas extrato fechamento") |
| hipótese_automação | Regra determinística: período coberto por conta, saldo inicial = saldo final anterior, quantidade de notas emitidas x faturamento do extrato, folha recebida; semáforo por cliente |
| papel_da_ia | M3 executar (checagens); M2 ler; M4 rascunhar (pedido do que falta) |
| ferramentas_agênticas | `verificar_completude(cliente, mes)` |
| eventos_timesheet | `ctb.competencia.conferida` |
| fontes_descoberta | [T16] |

### CTB-006 · Pedir ao cliente a explicação de movimentos sem documento

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Contábil / Coleta de documentos |
| atividade | Listar Pix, TEDs e débitos que não têm nota nem contrato e perguntar ao cliente o que são |
| descrição | Planilha de "itens a identificar" mandada por e-mail ou mensagens avulsas; respostas vagas; o que não é respondido vai para conta transitória ou "a classificar" |
| gatilho_frequência | Mensal |
| porte_alcance | Todos com escrituração completa |
| quem_faz | Analista contábil |
| onde_é_feita_hoje | Planilha, WhatsApp, e-mail |
| entradas / saídas | Lançamentos sem suporte → respostas do cliente, classificação ou documento |
| base_legal | Entradas sem origem comprovada podem ser tratadas como omissão de receita (presunção do art. 42 da Lei 9.430/1996) `[NÃO VERIFICADO]` |
| risco_se_falhar | Saldo em conta transitória no balanço, autuação por depósito sem origem |
| tempo_estimado | 15–45 min por cliente por mês `[ESTIMATIVA]` |
| concorrentes | Conta Azul e Nibo trazem conciliação feita pelo próprio cliente no ERP, que reduz a pergunta [C4][C7]; `[NÃO ENCONTRADO]` fluxo de pergunta-resposta por lançamento via WhatsApp |
| hipótese_automação | Lista interativa enviada ao cliente (WhatsApp ou portal): cada item com botão de categoria e espaço para anexo; a resposta volta como regra de classificação (CTB-016) |
| papel_da_ia | M2 ler (histórico do cliente para sugerir a provável resposta); M4 executar (envio) e rascunhar (pergunta em linguagem simples) |
| ferramentas_agênticas | `listar_sem_suporte(cliente, mes)`, `perguntar_ao_cliente(cliente, itens)` |
| eventos_timesheet | `ctb.lancamento.esclarecimento_pedido`, `ctb.lancamento.esclarecido` |
| fontes_descoberta | [C4], [C7] |

### CTB-007 · Buscar dados do sistema financeiro ou ERP do cliente

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Contábil / Coleta de documentos |
| atividade | Exportar ou receber contas pagas e recebidas, categorias e baixas do ERP do cliente (Conta Azul, Omie, Nibo, Bling e outros) e levar ao core |
| descrição | O cliente manda relatório em Excel, ou o escritório acessa o ERP com login do cliente; quando há integração (Conta Azul x Domínio), a exportação é automática [C4] |
| gatilho_frequência | Mensal |
| porte_alcance | Clientes que usam ERP ou gestor financeiro |
| quem_faz | Analista contábil |
| onde_é_feita_hoje | ERP do cliente, planilha, arquivo de importação |
| entradas / saídas | Relatórios do ERP → lançamentos no leiaute do core |
| base_legal | — |
| risco_se_falhar | Lançamento em dobro (ERP e extrato) ou ausente |
| tempo_estimado | 15–60 min por cliente por mês `[ESTIMATIVA]` |
| concorrentes | Conta Azul Mais: exporta plano de contas, categorias, baixas e lançamentos; automático para Domínio, por arquivo para mais de 25 sistemas [C4] |
| hipótese_automação | Conectores com os ERPs mais comuns da carteira e de-para de categorias para contas; deduplicação com o extrato |
| papel_da_ia | M2 ler; M3 executar (de-para e deduplicação); M4 executar (importar, com aprovação) |
| ferramentas_agênticas | `importar_erp_cliente(cliente, mes, origem)`, `mapear_categorias(cliente)` |
| eventos_timesheet | `ctb.erp.importado` |
| fontes_descoberta | [C4] |

## B. Extratos, cartões e adquirentes

### CTB-008 · Obter o extrato de cada conta (OFX, PDF ou planilha)

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Contábil / Extratos |
| atividade | Conseguir o extrato do mês de cada conta bancária e de pagamento do cliente, no formato que o core importa |
| descrição | O cliente manda PDF ou print; o analista pede OFX e ensina o cliente a exportar; alguns escritórios recebem a senha do internet banking (prática de risco) |
| gatilho_frequência | Mensal |
| porte_alcance | Todos com escrituração completa e Simples com livro caixa |
| quem_faz | Analista contábil; cliente |
| onde_é_feita_hoje | Internet banking, WhatsApp, e-mail |
| entradas / saídas | Pedido → arquivo OFX, OFC, CNAB ou PDF por conta e período |
| base_legal | — |
| risco_se_falhar | Conciliação impossível; atraso do fechamento |
| tempo_estimado | 5–15 min por conta por mês, contando a cobrança `[ESTIMATIVA]` |
| concorrentes | Domínio importa OFX, OFC e Febraban [C3]; Tecnospeed compara OFX e Open Finance [C14]; artigo "Pare de pedir extratos bancários dos seus clientes" defende a captura direta [T18] |
| hipótese_automação | Open Finance onde houver consentimento (CTB-010); senão, link para o cliente subir o OFX com tutorial por banco; validação automática do período e do saldo |
| papel_da_ia | M4 executar (pedido e validação); M2 ler |
| ferramentas_agênticas | `obter_extrato(cliente, conta, periodo)`, `validar_extrato(arquivo)` |
| eventos_timesheet | `ctb.extrato.recebido` |
| fontes_descoberta | [C3], [C14], [T18] |

### CTB-009 · Converter extrato em PDF ou imagem em dados

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Contábil / Extratos |
| atividade | Transformar extrato em PDF (ou foto) em linhas estruturadas para importar no core |
| descrição | Digitação manual, conversores avulsos ou planilha; erro de sinal e de data é comum |
| gatilho_frequência | Mensal, por conta sem OFX |
| porte_alcance | Clientes de bancos ou cooperativas sem OFX acessível, contas antigas, aplicações |
| quem_faz | Auxiliar contábil |
| onde_é_feita_hoje | Planilha, conversores web |
| entradas / saídas | PDF → OFX ou leiaute do core, com conferência de saldo |
| base_legal | — |
| risco_se_falhar | Lançamento errado, saldo final divergente |
| tempo_estimado | 10–40 min por extrato `[ESTIMATIVA]` |
| concorrentes | Ferramentas de extração de extrato para escritórios aparecem em conteúdo de mercado (imagetotable.ai) [C17] |
| hipótese_automação | Extração com conferência determinística (saldo inicial + movimentos = saldo final); só aceita se fechar |
| papel_da_ia | M2 rascunhar (extração); M3 executar (prova de saldo) |
| ferramentas_agênticas | `extrair_extrato_pdf(arquivo)`, `gerar_ofx(linhas)` |
| eventos_timesheet | `ctb.extrato.convertido` |
| fontes_descoberta | [C17] |

### CTB-010 · Conectar e manter o Open Finance do cliente

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Contábil / Extratos |
| atividade | Pedir ao cliente o consentimento de compartilhamento das contas PJ, acompanhar a validade e renovar |
| descrição | Pouco usado em escritórios; onde existe (Questor, ERPs), o escritório se credencia e o cliente autoriza no banco [C2] |
| gatilho_frequência | Na entrada; renovação conforme validade do consentimento (6 a 12 meses ou indeterminado, segundo a Caixa) [T12] |
| porte_alcance | Clientes com conta em instituição participante do Open Finance |
| quem_faz | Analista contábil; cliente (autoriza) |
| onde_é_feita_hoje | App do banco do cliente + sistema do escritório |
| entradas / saídas | Convite → consentimento ativo; transações diárias; alerta de expiração |
| base_legal | Regulação do Open Finance pelo BCB `[NÃO VERIFICADO]` (norma específica não lida); histórico de até 12 meses no endpoint de transações (Celcoin) [T12] |
| risco_se_falhar | Extrato para de chegar sem ninguém perceber |
| tempo_estimado | 15–30 min por cliente na conexão `[ESTIMATIVA]` |
| concorrentes | Questor Open Finance nativo na conciliação [C2]; Pluggy e Belvo como agregadores, com Conta Azul, Nibo e Contabilizei citados como clientes PJ da Belvo [C8][C9] |
| hipótese_automação | Convite por WhatsApp com passo a passo; painel de consentimentos por cliente e banco; renovação lembrada 30 dias antes |
| papel_da_ia | M2 ler; M4 executar (convite, lembrete) |
| ferramentas_agênticas | `convidar_open_finance(cliente, banco)`, `status_consentimentos(cliente)` |
| eventos_timesheet | `ctb.openfinance.conectado`, `ctb.openfinance.renovado` |
| fontes_descoberta | [T12], [C2], [C8], [C9] |

### CTB-011 · Descobrir contas e cartões que o cliente não informou

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Contábil / Extratos |
| atividade | Detectar contas bancárias, contas de pagamento (inclusive digitais e de marketplace) e cartões novos que aparecem em transferências, notas ou contratos |
| descrição | Descoberta acidental: TED para uma conta própria desconhecida, tarifa de banco novo, fatura de cartão sem conta cadastrada |
| gatilho_frequência | Mensal |
| porte_alcance | Todos |
| quem_faz | Analista contábil |
| onde_é_feita_hoje | Core, extrato |
| entradas / saídas | Extratos, notas → lista de contas suspeitas, pedido ao cliente, nova conta no plano |
| base_legal | e-Financeira informa à RFB movimentações por instituição `[NÃO VERIFICADO]` quanto aos limites atuais |
| risco_se_falhar | Receita fora da contabilidade e do faturamento declarado; cruzamento da RFB |
| tempo_estimado | 5–10 min por cliente por mês `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` (busca: "detectar conta bancária não informada contabilidade") |
| hipótese_automação | Regras sobre transferências entre titularidade igual, tarifas e nomes de instituições; lista de suspeitas para o analista |
| papel_da_ia | M2 ler; M3 executar (regras); M4 rascunhar (pergunta ao cliente) |
| ferramentas_agênticas | `detectar_contas_nao_cadastradas(cliente, mes)` |
| eventos_timesheet | `ctb.conta.detectada` |
| fontes_descoberta | — |

### CTB-012 · Obter e lançar faturas de cartão de crédito corporativo

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Contábil / Cartões |
| atividade | Receber a fatura, separar despesas da empresa e dos sócios, buscar comprovantes e lançar por despesa |
| descrição | Fatura em PDF, pagamento total no extrato; muitas vezes contabilizada em uma linha só por falta de detalhe |
| gatilho_frequência | Mensal |
| porte_alcance | Clientes com cartão corporativo |
| quem_faz | Analista contábil |
| onde_é_feita_hoje | PDF, planilha, core |
| entradas / saídas | Fatura → lançamentos por natureza, pendências de comprovante |
| base_legal | — |
| risco_se_falhar | Despesa indedutível ou pessoal dentro do resultado |
| tempo_estimado | 15–40 min por fatura `[ESTIMATIVA]` |
| concorrentes | Questor Open Finance importa detalhamento de fatura de cartão e cria lançamentos com contrapartida no fornecedor [C2] |
| hipótese_automação | Captura da fatura (Open Finance ou PDF), classificação por estabelecimento com regras do cliente, pergunta ao cliente só nos itens duvidosos |
| papel_da_ia | M2 rascunhar; M4 executar (perguntas) |
| ferramentas_agênticas | `importar_fatura_cartao(cliente, cartao, mes)` |
| eventos_timesheet | `ctb.cartao.lancado` |
| fontes_descoberta | [C2] |

### CTB-013 · Conciliar recebíveis de maquininha e marketplace

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Contábil / Adquirentes |
| atividade | Bater vendas no cartão x repasses da adquirente (líquidos de taxas, parcelados, antecipados) x crédito no banco |
| descrição | Três conciliações (vendas x adquirente, adquirente x agenda, agenda x banco) [T17]; em escritório costuma virar lançamento pelo líquido, sem taxas nem recebíveis em aberto |
| gatilho_frequência | Mensal |
| porte_alcance | Varejo, serviços com cartão, e-commerce e marketplace |
| quem_faz | Analista contábil |
| onde_é_feita_hoje | Portal da adquirente, planilha |
| entradas / saídas | Relatórios da Cielo, Rede, Stone, Getnet, marketplaces → lançamentos de receita bruta, taxas, antecipação e saldo a receber |
| base_legal | — |
| risco_se_falhar | Receita contabilizada pelo líquido (taxa escondida), divergência com faturamento declarado |
| tempo_estimado | 30–120 min por cliente por mês `[ESTIMATIVA]` |
| concorrentes | Concil e Auditto (conciliadores de cartão, vendidos ao varejista) [C17]; Cielo descreve conciliação em três etapas [T17] |
| hipótese_automação | Importar arquivos das adquirentes (ou de um conciliador do cliente) e gerar lançamentos em bruto; checar contra faturamento das notas (D3) |
| papel_da_ia | M3 executar (conciliação); M2 ler |
| ferramentas_agênticas | `conciliar_adquirente(cliente, mes, adquirente)` |
| eventos_timesheet | `ctb.adquirente.conciliado` |
| fontes_descoberta | [T17], [C17] |

### CTB-014 · Controlar empréstimos, financiamentos e aplicações

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Contábil / Extratos |
| atividade | Obter contrato e extrato do empréstimo ou da aplicação, separar principal, juros, IOF e IR, e conferir o saldo devedor ou aplicado |
| descrição | O extrato bancário só mostra a parcela; o analista pede contrato e posição ao cliente uma vez por ano, na hora do balanço |
| gatilho_frequência | Mensal (parcelas); anual (posição) |
| porte_alcance | Clientes com crédito bancário ou aplicações |
| quem_faz | Analista contábil |
| onde_é_feita_hoje | Planilha de amortização, internet banking |
| entradas / saídas | Contratos, posição → planilha de controle, lançamentos de juros, saldo curto e longo prazo |
| base_legal | Classificação circulante x não circulante (CPC/NBC TG) `[NÃO VERIFICADO]` |
| risco_se_falhar | Passivo errado no balanço apresentado ao banco; juros não apropriados |
| tempo_estimado | 20–60 min por contrato no ano `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` controle de contratos de empréstimo em plataforma de escritório |
| hipótese_automação | Cadastro do contrato com tabela de amortização calculada; conferência mensal da parcela no extrato; posição anual pedida automaticamente em dezembro |
| papel_da_ia | M2 rascunhar (extrair dados do contrato); M3 executar (tabela) |
| ferramentas_agênticas | `cadastrar_contrato_financeiro(cliente, arquivo)`, `posicao_emprestimos(cliente, data)` |
| eventos_timesheet | `ctb.financiamento.controlado` |
| fontes_descoberta | — |

## C. Classificação e conciliação

### CTB-015 · Classificar os lançamentos do extrato

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Contábil / Classificação |
| atividade | Atribuir a conta contábil (e o histórico) a cada linha do extrato que não foi conciliada com nota ou folha |
| descrição | Feito no core linha a linha ou com regras simples por texto do histórico; consome a maior parte do tempo do analista contábil em empresa de serviço |
| gatilho_frequência | Mensal |
| porte_alcance | Todos com escrituração completa |
| quem_faz | Analista ou auxiliar contábil |
| onde_é_feita_hoje | Core (Domínio, Alterdata, Questor), planilha |
| entradas / saídas | Linhas do extrato, histórico do cliente, documentos → lançamentos classificados com grau de confiança |
| base_legal | ITG 2000 (histórico e documentação) `[NÃO VERIFICADO]` |
| risco_se_falhar | Resultado distorcido, despesa indedutível, distribuição de lucros sobre lucro errado |
| tempo_estimado | 0,5–2 min por linha; 1–6 h por cliente por mês `[ESTIMATIVA]` |
| concorrentes | ROIT: IA faz 98% das classificações, segundo a empresa (sem auditoria independente) [C6]; Conta Azul + Mister Contador [C4]; Nibo com regras e conciliação em lote, segundo comparativo da Conta Azul [C7] |
| hipótese_automação | Sugestão de conta pelo histórico do próprio cliente e da carteira, pelo documento ligado (nota, boleto, contrato) e pelas respostas do cliente; o analista aprova em lote os de alta confiança |
| papel_da_ia | M2 rascunhar (sugestão com evidência: "igual a 12 lançamentos anteriores"); M1 ler (natureza dedutível, quando perguntado); M4 executar (gravar após aprovação) |
| ferramentas_agênticas | `sugerir_classificacao(cliente, mes)`, `aprovar_classificacoes(lote_id)` |
| eventos_timesheet | `ctb.classificacao.sugerida`, `ctb.classificacao.aprovada` |
| fontes_descoberta | [C4], [C6], [C7] |

### CTB-016 · Manter as regras de classificação de cada cliente

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Contábil / Classificação |
| atividade | Criar e corrigir o de-para (texto do histórico, CNPJ do favorecido, faixa de valor → conta) e revisar regras que ficaram erradas |
| descrição | Regras de importação do core configuradas por quem implantou o cliente; ninguém revisa; erros se repetem todo mês |
| gatilho_frequência | Por evento (correção); revisão trimestral |
| porte_alcance | Todos com escrituração completa |
| quem_faz | Analista contábil; coordenador |
| onde_é_feita_hoje | Core |
| entradas / saídas | Correções do analista e respostas do cliente → regra nova ou alterada, com autor e data |
| base_legal | — |
| risco_se_falhar | Erro sistemático em todos os meses |
| tempo_estimado | 10–30 min por cliente por mês `[ESTIMATIVA]` |
| concorrentes | Questor: parâmetros de conciliação e geração automática de lançamentos [C2]; Alterdata Prosoft: parâmetros de conciliação contábil [C11] |
| hipótese_automação | Cada correção vira proposta de regra; painel de regras por cliente com taxa de acerto; regras exportáveis para o core quando ele aceitar |
| papel_da_ia | M2 rascunhar (regra a partir das correções); M4 executar (salvar com aprovação) |
| ferramentas_agênticas | `propor_regra(cliente, exemplos)`, `listar_regras(cliente)` |
| eventos_timesheet | `ctb.regra.criada` |
| fontes_descoberta | [C2], [C11] |

### CTB-017 · Exportar os lançamentos no leiaute de importação do core

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Contábil / Integração com o core |
| atividade | Gerar o arquivo de lançamentos (ou de extrato) no leiaute aceito pelo Domínio, Alterdata ou Contmatic e importar |
| descrição | Planilhas com macros, conversores próprios, ou digitação |
| gatilho_frequência | Mensal |
| porte_alcance | Todos com escrituração completa |
| quem_faz | Analista contábil |
| onde_é_feita_hoje | Planilha, core |
| entradas / saídas | Lançamentos aprovados → arquivo de importação; relatório de rejeições |
| base_legal | — |
| risco_se_falhar | Lançamento duplicado ou ausente |
| tempo_estimado | 5–15 min por cliente por mês `[ESTIMATIVA]` |
| concorrentes | Conta Azul exporta para mais de 25 sistemas contábeis [C4]; Domínio importa OFX com histórico pela tag MEMO/NAME [C3] |
| hipótese_automação | Exportador por core (nível F), com controle de "já exportado" por lançamento e leitura do relatório de importação |
| papel_da_ia | M4 executar (gerar arquivo); M2 ler (rejeições) |
| ferramentas_agênticas | `exportar_para_core(cliente, mes, core)` |
| eventos_timesheet | `ctb.core.exportado` |
| fontes_descoberta | [C3], [C4] · transversal: D3 (XML para o core), D4 |

### CTB-018 · Conciliar contas patrimoniais

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Contábil / Conciliação |
| atividade | Conferir saldos de clientes, fornecedores, adiantamentos, impostos a recolher, salários a pagar, empréstimos de sócios, contas transitórias, contra relatórios e documentos |
| descrição | Feita em planilha no fechamento trimestral ou anual; contas "estouradas" ou com saldo invertido passam meses sem análise |
| gatilho_frequência | Mensal (ideal); na prática trimestral ou anual |
| porte_alcance | Lucro Real e Presumido com escrituração; Simples com balanço |
| quem_faz | Analista contábil sênior |
| onde_é_feita_hoje | Core (razão), planilha |
| entradas / saídas | Razão, relatórios do cliente → planilha de conciliação por conta, ajustes propostos |
| base_legal | NBC TG / ITG 1000 para pequenas empresas `[NÃO VERIFICADO]` |
| risco_se_falhar | Balanço com saldos sem substância; problemas em auditoria, crédito e venda da empresa |
| tempo_estimado | 1–4 h por cliente no trimestre `[ESTIMATIVA]` |
| concorrentes | Questor tem tela de conferência de conciliação [C2]; `[NÃO ENCONTRADO]` produto de escritório que concilie contas patrimoniais fora do core |
| hipótese_automação | Lê o balancete e o razão exportados do core; aponta contas com saldo invertido, sem movimento, que crescem sem baixa; monta papel de trabalho da conciliação |
| papel_da_ia | M2 ler (razão); M3 executar (testes); M4 rascunhar (ajustes) |
| ferramentas_agênticas | `analisar_razao(cliente, conta, periodo)`, `papel_trabalho_conciliacao(cliente, conta)` |
| eventos_timesheet | `ctb.conciliacao.patrimonial` |
| fontes_descoberta | [C2] |

### CTB-019 · Conferir a integração fiscal-contábil

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Contábil / Conciliação |
| atividade | Bater impostos apurados no fiscal x provisionados na contabilidade x pagos no extrato (DAS, DARF, GNRE, ISS) |
| descrição | Divergências aparecem como saldo em "impostos a recolher" que não zera; investigação manual |
| gatilho_frequência | Mensal |
| porte_alcance | Todos |
| quem_faz | Analista contábil, com o fiscal |
| onde_é_feita_hoje | Core (módulos fiscal e contábil), planilha |
| entradas / saídas | Apurações, guias, extrato → divergências por tributo e competência |
| base_legal | — |
| risco_se_falhar | Imposto não pago percebido tarde (multa e juros); passivo errado |
| tempo_estimado | 15–30 min por cliente por mês `[ESTIMATIVA]` |
| concorrentes | Conta Azul importa lançamentos de escrita fiscal do Domínio [C4]; `[NÃO ENCONTRADO]` conferência tripla automatizada |
| hipótese_automação | Cruzamento guia emitida (D2) x pagamento no extrato x saldo contábil por tributo; alerta de guia sem pagamento |
| papel_da_ia | M2 ler; M3 executar |
| ferramentas_agênticas | `conferir_impostos(cliente, mes)` |
| eventos_timesheet | `ctb.integracao_fiscal.conferida` |
| fontes_descoberta | [C4] · transversal: D2 (conferir pagamento de guia) |

### CTB-020 · Conferir a integração folha-contábil

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Contábil / Conciliação |
| atividade | Conferir salários, encargos, provisões de férias e 13º, pró-labore e rescisões contabilizados x folha x pagamentos |
| descrição | Integração automática do core às vezes falha (rubrica sem conta); diferenças acumulam em salários a pagar |
| gatilho_frequência | Mensal |
| porte_alcance | Clientes com folha ou pró-labore |
| quem_faz | Analista contábil, com o DP |
| onde_é_feita_hoje | Core |
| entradas / saídas | Resumo da folha, guias, extrato → divergências |
| base_legal | — |
| risco_se_falhar | Encargos não provisionados; pró-labore sem escrituração (afeta DECORE, CTB-032) |
| tempo_estimado | 10–20 min por cliente por mês `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` fora do core |
| hipótese_automação | Mesmo motor de CTB-019 com a folha como fonte |
| papel_da_ia | M2 ler; M3 executar |
| ferramentas_agênticas | `conferir_folha_contabil(cliente, mes)` |
| eventos_timesheet | `ctb.integracao_folha.conferida` |
| fontes_descoberta | — · transversal: D4 |

### CTB-021 · Vigiar caixa negativo, conta de sócio e despesas pessoais

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Contábil / Conciliação |
| atividade | Detectar saldo credor de caixa, "conta corrente de sócio" crescente e despesas pessoais pagas pela empresa, e orientar o cliente |
| descrição | Descoberto no balanço; corrigido com lançamentos de última hora |
| gatilho_frequência | Mensal |
| porte_alcance | Todos, sobretudo pequenas empresas com mistura de contas [T17] |
| quem_faz | Analista contábil; sócio do escritório na orientação |
| onde_é_feita_hoje | Core |
| entradas / saídas | Balancete, razão → alertas, mensagem ao cliente |
| base_legal | Saldo credor de caixa como indício de omissão de receita (RIR/2018) `[NÃO VERIFICADO]` quanto ao artigo |
| risco_se_falhar | Autuação; distribuição disfarçada de lucros |
| tempo_estimado | 5–10 min por cliente por mês `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Regras sobre o balancete mensal com alerta e rascunho de orientação |
| papel_da_ia | M3 executar; M1 ler (risco legal); M4 rascunhar (mensagem) |
| ferramentas_agênticas | `alertas_balancete(cliente, mes)` |
| eventos_timesheet | `ctb.alerta.gerado` |
| fontes_descoberta | [T17] |

### CTB-022 · Contabilizar parcelamentos tributários e sua atualização

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Contábil / Conciliação |
| atividade | Registrar a adesão, as parcelas pagas, a atualização pela Selic e o saldo curto e longo prazo de cada parcelamento |
| descrição | O fiscal acompanha o parcelamento no portal; a contabilidade recebe a informação tarde ou nunca |
| gatilho_frequência | Por evento (adesão); mensal (parcela) |
| porte_alcance | Clientes com parcelamento federal, estadual ou municipal |
| quem_faz | Analista contábil |
| onde_é_feita_hoje | Portais (e-CAC, PGFN), planilha |
| entradas / saídas | Recibo de adesão, extrato do parcelamento → lançamentos e saldo |
| base_legal | Atualização pela Selic (legislação de cada parcelamento) `[NÃO VERIFICADO]` |
| risco_se_falhar | Passivo tributário errado no balanço |
| tempo_estimado | 10 min por parcelamento por mês `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Ler o parcelamento do módulo fiscal (D2), calcular a atualização com Selic do BCB e gerar lançamentos |
| papel_da_ia | M2 ler; M3 executar |
| ferramentas_agênticas | `posicao_parcelamentos(cliente, data)` |
| eventos_timesheet | `ctb.parcelamento.contabilizado` |
| fontes_descoberta | — · transversal: D2 |

### CTB-023 · Contabilizar CBS e IBS (2026) e preparar o split payment

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Contábil / Reforma tributária |
| atividade | Definir, por cliente, se e como contabilizar CBS/IBS do ano de testes, criar contas no plano e, para o split payment, contas de controle e conciliação do valor retido |
| descrição | Decisão caso a caso, sem consenso: IOB diz que o CFC apresentou argumentos dos dois lados; material de curso aponta obrigatoriedade pelo Decreto 12.955/2026 e Resolução CGIBS 6/2026; split payment previsto para 2027, com debate sobre sua extinção em out/2026 [T10] |
| gatilho_frequência | Uma vez (definição); mensal (lançamento e conciliação) |
| porte_alcance | Contribuintes do regime regular de CBS/IBS; Simples conforme opção |
| quem_faz | Coordenador contábil; sócio |
| onde_é_feita_hoje | Core, planilha |
| entradas / saídas | Notas com destaque de CBS/IBS, orientação técnica → política contábil do cliente, contas, lançamentos |
| base_legal | LC 214/2025, Decreto 12.955/2026, Resolução CGIBS 6/2026 (segundo [T10]) `[NÃO VERIFICADO]` no texto oficial; e-book CRC-SP de 14/08/2026 [T10] |
| risco_se_falhar | Escrituração inconsistente na transição; conciliação bancária quebrada quando o split chegar |
| tempo_estimado | 1–3 h por cliente na definição `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` funcionalidade dedicada em plataforma de escritório |
| hipótese_automação | Registro da política adotada por cliente, monitor de normas (M1) e, quando houver split, conciliação do recebido líquido x tributo retido |
| papel_da_ia | M1 ler e rascunhar; M2 ler; M3 executar (conciliação) |
| ferramentas_agênticas | `politica_contabil_reforma(cliente)`, `conciliar_split(cliente, mes)` |
| eventos_timesheet | `ctb.reforma.politica_definida` |
| fontes_descoberta | [T10] · transversal: D6 |

## D. Fechamento mensal

### CTB-024 · Executar o checklist de fechamento de cada cliente

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Contábil / Fechamento |
| atividade | Seguir as etapas do fechamento (coleta completa, importações, conciliações, integrações, provisões, revisão, envio ao cliente) e marcar cada uma |
| descrição | Checklist em planilha ou no sistema de tarefas; diferente por regime (Simples, Presumido, Real) [T19] |
| gatilho_frequência | Mensal |
| porte_alcance | Todos |
| quem_faz | Analista contábil |
| onde_é_feita_hoje | Planilha, Domínio Processos/Onvio Processos, Gestta, Tareffa |
| entradas / saídas | Modelo por regime → checklist da competência com responsável, data e evidência |
| base_legal | — |
| risco_se_falhar | Etapa esquecida (provisão, depreciação), fechamento inconsistente |
| tempo_estimado | 5 min por cliente para marcar; o resto está nas outras fichas `[ESTIMATIVA]` |
| concorrentes | Gestta controla qualquer processo do escritório [C5]; Tareffa com processos modelo [C1]; artigos de fornecedores propõem checklist por etapa [T19] |
| hipótese_automação | Checklist por regime em que as etapas se marcam sozinhas quando o evento correspondente acontece (extrato completo, exportação feita, conciliação sem divergência) |
| papel_da_ia | M2 ler; M4 executar (marcar etapas automáticas) |
| ferramentas_agênticas | `checklist_fechamento(cliente, mes)`, `marcar_etapa(cliente, mes, etapa)` |
| eventos_timesheet | `ctb.fechamento.etapa_concluida` |
| fontes_descoberta | [C1], [C5], [T19] |

### CTB-025 · Revisar o balancete antes de liberar

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Contábil / Fechamento |
| atividade | Comparar com meses anteriores, achar variações fora do padrão, saldos invertidos, contas "a classificar" e lançamentos atípicos |
| descrição | Revisão do sênior ou do sócio, por amostragem, quando há tempo |
| gatilho_frequência | Mensal |
| porte_alcance | Todos com escrituração completa |
| quem_faz | Contador sênior; sócio |
| onde_é_feita_hoje | Core, planilha |
| entradas / saídas | Balancete exportado → lista de pontos de atenção, aprovação |
| base_legal | — |
| risco_se_falhar | Erro chega ao cliente, ao banco ou à ECD |
| tempo_estimado | 15–40 min por cliente por mês `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` revisão analítica automatizada para escritório |
| hipótese_automação | Revisão analítica automática (variação, sinal, contas proibidas para o regime) com lista priorizada e explicação |
| papel_da_ia | M3 executar (testes); M2 rascunhar (explicação); M1 ler (quando a dúvida for de norma) |
| ferramentas_agênticas | `revisar_balancete(cliente, mes)` |
| eventos_timesheet | `ctb.balancete.revisado` |
| fontes_descoberta | — |

### CTB-026 · Acompanhar o status de fechamento de toda a carteira

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Contábil / Fechamento |
| atividade | Saber quais clientes estão fechados, parados (e por quê) e atrasados, por analista |
| descrição | Reunião semanal com planilha; o coordenador pergunta um a um |
| gatilho_frequência | Semanal |
| porte_alcance | Todos |
| quem_faz | Coordenador contábil; sócio |
| onde_é_feita_hoje | Planilha, sistema de tarefas |
| entradas / saídas | Checklists → painel por cliente, analista e motivo de bloqueio (cliente ou interno) |
| base_legal | — |
| risco_se_falhar | Atraso acumulado que estoura no balanço ou na ECD |
| tempo_estimado | 1–2 h por semana do coordenador `[ESTIMATIVA]` |
| concorrentes | Nibo Obrigações Plus: dashboards de pendências e produtividade por departamento e colaborador [C7]; HubStrom MonitorHub para obrigações [C10] |
| hipótese_automação | Painel ao vivo do fechamento; pergunta no chat "quais clientes estão parados por falta de documento?" |
| papel_da_ia | M2 ler |
| ferramentas_agênticas | `status_fechamento(carteira, mes)` |
| eventos_timesheet | — (leitura) |
| fontes_descoberta | [C7], [C10] · transversal: D7 |

### CTB-027 · Tratar documento que chega depois do fechamento

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Contábil / Fechamento |
| atividade | Reabrir a competência, lançar, avaliar o impacto em relatórios e obrigações já entregues (balancete ao banco, ECD, DEFIS) e decidir se retifica |
| descrição | Lançamento extemporâneo ou retificação; muitas vezes sem registro de por que mudou |
| gatilho_frequência | Por evento |
| porte_alcance | Todos |
| quem_faz | Analista contábil; coordenador |
| onde_é_feita_hoje | Core |
| entradas / saídas | Documento tardio → lançamento, lista de entregas afetadas, decisão registrada |
| base_legal | Regras de retificação de cada obrigação `[NÃO VERIFICADO]` |
| risco_se_falhar | Divergência entre obrigações; retrabalho não cobrado |
| tempo_estimado | 30 min–3 h por ocorrência `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Ao reabrir, a plataforma lista o que já foi entregue com base naquela competência e abre tarefas de retificação; o tempo vira item cobrável |
| papel_da_ia | M2 ler; M4 rascunhar (tarefas e aviso ao cliente) |
| ferramentas_agênticas | `reabrir_competencia(cliente, mes, motivo)`, `impactos_reabertura(cliente, mes)` |
| eventos_timesheet | `ctb.competencia.reaberta` (marcado como retrabalho) |
| fontes_descoberta | — |

## E. Relatórios gerenciais e atendimento ao cliente

### CTB-028 · Gerar e enviar o relatório mensal ao cliente

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Contábil / Relatórios gerenciais |
| atividade | Montar balancete, DRE gerencial, comparativo e gráficos e enviar ao cliente |
| descrição | Muitos escritórios só mandam o balancete do core em PDF; os que entregam DRE gerencial montam em Excel ou Power BI |
| gatilho_frequência | Mensal (quando contratado); anual (todos) |
| porte_alcance | Clientes com escrituração completa e contrato que inclua relatórios |
| quem_faz | Analista contábil sênior; sócio |
| onde_é_feita_hoje | Core, Excel, Power BI |
| entradas / saídas | Balancete exportado → relatório em PDF ou painel, mensagem de envio |
| base_legal | — |
| risco_se_falhar | Cliente não vê valor no serviço (perda de cliente) |
| tempo_estimado | 30–90 min por cliente por mês `[ESTIMATIVA]` |
| concorrentes | Conta Azul oferece DRE no ERP [C4]; Questor tem BI de custo e produtividade (do escritório) [C2]; `[NÃO ENCONTRADO]` página do Kolossus ou de "Contábil BI" como produto para escritórios |
| hipótese_automação | Relatório gerado do balancete com o de-para gerencial do cliente, enviado no portal e no WhatsApp com resumo em linguagem simples |
| papel_da_ia | M3 executar (números); M2 rascunhar (texto explicativo citando as contas); M4 executar (envio com aprovação) |
| ferramentas_agênticas | `gerar_relatorio_gerencial(cliente, mes)`, `enviar_relatorio(cliente, relatorio_id)` |
| eventos_timesheet | `ctb.relatorio.gerado`, `ctb.relatorio.enviado` |
| fontes_descoberta | [C2], [C4] |

### CTB-029 · Explicar o resultado ao cliente e responder perguntas

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Contábil / Relatórios gerenciais |
| atividade | Responder "por que deu prejuízo?", "quanto posso retirar?", "por que meu lucro não está no caixa?" |
| descrição | Ligações e mensagens ao sócio do escritório; respostas dependem de abrir o core |
| gatilho_frequência | Por evento; reunião mensal ou trimestral para clientes maiores |
| porte_alcance | Todos |
| quem_faz | Sócio; contador sênior |
| onde_é_feita_hoje | WhatsApp, telefone, reunião |
| entradas / saídas | Pergunta → resposta com números e origem |
| base_legal | — |
| risco_se_falhar | Insatisfação; decisão errada do cliente |
| tempo_estimado | 10–30 min por pergunta `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` assistente de explicação contábil ao cliente final em plataforma de escritório |
| hipótese_automação | Chat do operador responde com dados do balancete (M2) e cálculo (M3); a resposta ao cliente sai como rascunho para o contador aprovar |
| papel_da_ia | M2 ler; M3 executar; M1 ler (limites de retirada); M4 rascunhar |
| ferramentas_agênticas | `explicar_resultado(cliente, periodo)` |
| eventos_timesheet | `ctb.cliente.atendido` |
| fontes_descoberta | — · transversal: D7 (atendimento) |

### CTB-030 · Calcular indicadores e emitir alertas ao cliente

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Contábil / Relatórios gerenciais |
| atividade | Calcular margens, liquidez, endividamento, prazo médio, ponto de equilíbrio e alertar quando piorarem |
| descrição | Raramente feito de forma sistemática |
| gatilho_frequência | Mensal |
| porte_alcance | Clientes com escrituração completa |
| quem_faz | Contador sênior |
| onde_é_feita_hoje | Excel |
| entradas / saídas | Balancete → indicadores, série histórica, alerta |
| base_legal | — |
| risco_se_falhar | Perda de oportunidade de consultoria |
| tempo_estimado | 15–30 min por cliente por mês `[ESTIMATIVA]` |
| concorrentes | Artigo acadêmico (RAGC 2024) trata de BI para relatórios gerenciais [T20] |
| hipótese_automação | Indicadores determinísticos sobre o balancete com limites configuráveis; alerta vira oportunidade de serviço (D6) |
| papel_da_ia | M3 executar; M2 rascunhar |
| ferramentas_agênticas | `indicadores(cliente, periodo)` |
| eventos_timesheet | `ctb.indicadores.calculados` |
| fontes_descoberta | [T20] |

### CTB-031 · Preparar demonstrações para banco, licitação e investidores

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Contábil / Relatórios gerenciais |
| atividade | Emitir balanço e DRE assinados, balancete atualizado, memória de cálculo dos índices e certidão de regularidade do contador |
| descrição | Pedido urgente do cliente ("o banco precisa até amanhã"); para licitação, os editais pedem balanço do último exercício ou dos dois últimos e índices de liquidez com corte definido no edital [T13] |
| gatilho_frequência | Por evento |
| porte_alcance | Clientes que tomam crédito ou participam de licitações |
| quem_faz | Contador responsável |
| onde_é_feita_hoje | Core, Excel, assinatura com certificado |
| entradas / saídas | Pedido e edital → pacote de demonstrações, índices, certidão do CRC |
| base_legal | Lei 14.133/2021, art. 69 (balanço e demonstrações; patrimônio líquido mínimo de até 10% como alternativa, §4º, segundo as fontes) [T13] |
| risco_se_falhar | Cliente inabilitado na licitação; crédito negado |
| tempo_estimado | 30 min–2 h por pedido `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Pacote gerado a partir das demonstrações do core, com cálculo dos índices pedidos no edital (lidos do PDF) e checagem do corte antes de enviar |
| papel_da_ia | M2 rascunhar (ler o edital); M3 executar (índices); M1 ler (art. 69); M4 executar (montar pacote, assinatura pelo contador) |
| ferramentas_agênticas | `pacote_demonstracoes(cliente, exercicio, finalidade)`, `indices_edital(cliente, edital)` |
| eventos_timesheet | `ctb.demonstracoes.emitidas` |
| fontes_descoberta | [T13] |

### CTB-032 · Emitir DECORE para os sócios

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Contábil / Declarações do profissional |
| atividade | Emitir a Declaração Comprobatória de Percepção de Rendimentos com o upload dos documentos de lastro |
| descrição | Pedido do sócio para financiamento ou aluguel; o contador junta escrituração do pró-labore ou lucros e emite no sistema do CFC |
| gatilho_frequência | Por evento |
| porte_alcance | Sócios e profissionais autônomos clientes |
| quem_faz | Contador (emissão pessoal) |
| onde_é_feita_hoje | Portal de Sistemas CFC/CRCs |
| entradas / saídas | Pedido, documentos (Anexo II) → DECORE com validade de 90 dias |
| base_legal | Res. CFC 1.364/2011, alterada pelas 1.403/2012 e 1.492/2015; menção a 1.592/2020 `[NÃO VERIFICADO]` [T11] |
| risco_se_falhar | Penalidade ética ao contador por emitir sem lastro (ementa do CFC) [T11] |
| tempo_estimado | 20–40 min por DECORE `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Checklist do lastro por tipo de rendimento, conferência com a contabilidade, rascunho de valores; emissão continua pessoal (nível C-crc ou D) |
| papel_da_ia | M1 ler (Anexo II); M2 ler (rendimentos escriturados); M4 rascunhar |
| ferramentas_agênticas | `preparar_decore(socio, periodo)` |
| eventos_timesheet | `ctb.decore.emitida` |
| fontes_descoberta | [T11] · transversal: D1, D7 |

## F. Distribuição de lucros

### CTB-033 · Calcular o lucro que pode ser distribuído isento

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Contábil / Distribuição de lucros |
| atividade | Calcular, por cliente e período, o limite distribuível: presunção menos tributos (sem escrituração) ou lucro contábil apurado (com escrituração) |
| descrição | Planilha do escritório; para o Simples, materiais do CFC/CRC dizem que distribuição acima da presunção exige escrituração contábil (art. 14 da LC 123) e há divergência sobre a entrega da ECD [T9] |
| gatilho_frequência | Mensal ou trimestral; antes de cada distribuição |
| porte_alcance | Simples, Presumido e Real com sócios que retiram lucros |
| quem_faz | Contador sênior; sócio |
| onde_é_feita_hoje | Planilha |
| entradas / saídas | Receita, regime, tributos, lucro contábil → limite por período e saldo disponível |
| base_legal | LC 123/2006, art. 14 [T9]; LC 224/2025 (acréscimo de presunção, em litígio) [T15]; Lei 15.270/2025 [T3] |
| risco_se_falhar | Distribuição acima do limite tributada como rendimento; autuação |
| tempo_estimado | 15–30 min por cliente por cálculo `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` calculadora de lucro distribuível integrada em plataforma de escritório |
| hipótese_automação | Função de cálculo versionada por regra (com a tese adotada para LC 224 e Simples registrada no cliente), alimentada pelo balancete e pela apuração |
| papel_da_ia | M1 ler (regra vigente); M2 ler (dados); M3 executar |
| ferramentas_agênticas | `limite_lucro_distribuivel(cliente, periodo)` |
| eventos_timesheet | `ctb.lucros.limite_calculado` |
| fontes_descoberta | [T3], [T9], [T15] |

### CTB-034 · Controlar pagamentos mensais de lucros por sócio e a retenção de 10%

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Contábil / Distribuição de lucros |
| atividade | Somar no mês os lucros pagos a cada pessoa física, aplicar a retenção de 10% sobre o total quando passar de R$ 50 mil, emitir DARF e informar na EFD-Reinf |
| descrição | Rotina nova de 2026; o cliente paga lucros por Pix sem avisar, e o escritório descobre no extrato |
| gatilho_frequência | Mensal |
| porte_alcance | Clientes que distribuem mais de R$ 50 mil por mês a algum sócio PF (Simples em discussão) |
| quem_faz | Analista contábil e fiscal |
| onde_é_feita_hoje | Planilha, extrato, EFD-Reinf |
| entradas / saídas | Pagamentos aos sócios → controle por CPF e mês, IRRF, R-4010 |
| base_legal | Lei 15.270/2025 (retenção de 10% acima de R$ 50 mil por mês e por fonte; R-4010 segundo as fontes) [T3] |
| risco_se_falhar | Responsabilidade da PJ pela retenção não feita, multa de ofício `[NÃO VERIFICADO]` quanto ao percentual |
| tempo_estimado | 10–20 min por cliente por mês `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Detecção de pagamentos a sócios no extrato (CPF do favorecido), soma por mês, alerta antes de passar do limite, rascunho de DARF e evento |
| papel_da_ia | M2 ler; M3 executar; M1 ler; M4 rascunhar (aviso ao cliente antes do pagamento) |
| ferramentas_agênticas | `lucros_pagos_mes(cliente, mes)`, `simular_retencao_dividendos(cliente, socio, valor)` |
| eventos_timesheet | `ctb.lucros.retencao_controlada` |
| fontes_descoberta | [T3] · transversal: D2 (EFD-Reinf) |

### CTB-035 · Projetar o IRPFM dos sócios

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Contábil / Distribuição de lucros |
| atividade | Estimar a renda anual do sócio (de todas as empresas do escritório) e a tributação mínima, e orientar o calendário de distribuições |
| descrição | Novo em 2026; feito por poucos, sob demanda |
| gatilho_frequência | Trimestral; dezembro |
| porte_alcance | Sócios com renda anual acima de R$ 600 mil |
| quem_faz | Sócio do escritório; consultoria |
| onde_é_feita_hoje | Planilha |
| entradas / saídas | Lucros, pró-labore, outras rendas → projeção do IRPFM, recomendação |
| base_legal | Lei 15.270/2025 (IRPFM: 0% a 10% entre R$ 600 mil e R$ 1,2 milhão, 10% acima) [T3] |
| risco_se_falhar | Imposto inesperado na declaração do sócio; perda do cliente |
| tempo_estimado | 30–60 min por sócio por projeção `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Projeção consolidada por CPF entre clientes do escritório, com cenários |
| papel_da_ia | M1 ler; M2 ler; M3 executar; M4 rascunhar (parecer curto) |
| ferramentas_agênticas | `projetar_irpfm(cpf, ano)` |
| eventos_timesheet | `ctb.irpfm.projetado` |
| fontes_descoberta | [T3] · transversal: D6 |

### CTB-036 · Controlar o estoque de lucros até 2025 aprovados para pagamento futuro

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Contábil / Distribuição de lucros |
| atividade | Manter, por cliente, o saldo de lucros de até 2025 aprovados em ata, o cronograma de pagamento até 2028 e a conferência de que cada pagamento segue o ato |
| descrição | Atas feitas às pressas em dezembro de 2025 e janeiro de 2026; pagamentos posteriores sem conferência |
| gatilho_frequência | Mensal até 2028 |
| porte_alcance | Clientes que aprovaram distribuição de lucros acumulados |
| quem_faz | Contador sênior |
| onde_é_feita_hoje | Planilha, ata arquivada |
| entradas / saídas | Ata, balanço de 2025 → saldo, cronograma, alerta de pagamento fora do ato |
| base_legal | Lei 15.270/2025 (transição); liminar nas ADIs 7.912 e 7.914 prorrogando a deliberação até 31/01/2026 [T4]; referendo `[NÃO VERIFICADO]` |
| risco_se_falhar | Perda da isenção sobre o estoque |
| tempo_estimado | 5 min por cliente por mês `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Cadastro da ata (leitura do PDF), saldo vivo, conferência dos pagamentos a sócio no extrato |
| papel_da_ia | M2 rascunhar (ler ata); M3 executar; M1 ler |
| ferramentas_agênticas | `saldo_lucros_transicao(cliente)` |
| eventos_timesheet | `ctb.lucros.transicao_conferida` |
| fontes_descoberta | [T4] |

### CTB-037 · Preparar a aprovação de contas e a ata de distribuição

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Contábil / Distribuição de lucros |
| atividade | Entregar as demonstrações aos sócios e preparar a ata ou documento de aprovação de contas e de destinação do resultado |
| descrição | Muitas LTDAs não fazem; quando fazem, o escritório usa modelo genérico |
| gatilho_frequência | Anual (até 30/04 para exercício em 31/12); por evento (distribuição intermediária) |
| porte_alcance | LTDA e S/A |
| quem_faz | Contador; societário |
| onde_é_feita_hoje | Word, assinatura eletrônica |
| entradas / saídas | Demonstrações → ata assinada, arquivamento quando exigido |
| base_legal | Código Civil, art. 1.078 (quatro meses); art. 1.072 §3º (decisão escrita de todos dispensa reunião) [T7] |
| risco_se_falhar | Distribuição sem deliberação; responsabilidade dos administradores não exonerada [T7] |
| tempo_estimado | 30–60 min por cliente `[ESTIMATIVA]` |
| concorrentes | Modelos de ata publicados por consultorias [T4] |
| hipótese_automação | Rascunho da ata com números do balanço e da destinação, envio para assinatura eletrônica, prazo no calendário |
| papel_da_ia | M1 ler; M2 ler; M4 rascunhar e executar (envio para assinatura) |
| ferramentas_agênticas | `rascunhar_ata_aprovacao(cliente, exercicio)` |
| eventos_timesheet | `ctb.ata.preparada` |
| fontes_descoberta | [T4], [T7] · transversal: D1 |

### CTB-038 · Calcular e simular Juros sobre Capital Próprio

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Contábil / Distribuição de lucros |
| atividade | Calcular o limite de JCP dedutível, simular a vantagem com a nova alíquota de IRRF e contabilizar |
| descrição | Planilha anual para clientes do Lucro Real |
| gatilho_frequência | Anual ou trimestral |
| porte_alcance | Lucro Real |
| quem_faz | Contador sênior |
| onde_é_feita_hoje | Planilha |
| entradas / saídas | Patrimônio líquido, TJLP, lucro → valor de JCP, IRRF, lançamentos |
| base_legal | Lei 9.249/1995, art. 9º; IRRF de 17,5% pela LC 224/2025 (fonte única) [T15] |
| risco_se_falhar | Glosa da dedução; vantagem perdida |
| tempo_estimado | 1–2 h por cliente por ano `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Função M3 com TJLP e regra versionadas |
| papel_da_ia | M1 ler; M3 executar |
| ferramentas_agênticas | `simular_jcp(cliente, periodo)` |
| eventos_timesheet | `ctb.jcp.simulado` |
| fontes_descoberta | [T15] · transversal: D6 |

## G. Encerramento anual, ECD e ECF

### CTB-039 · Obter a carta de responsabilidade da administração

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Contábil / Encerramento anual |
| atividade | Enviar o modelo, colher a assinatura do administrador e arquivar antes de assinar as demonstrações |
| descrição | Muitos escritórios esquecem ou fazem depois da entrega |
| gatilho_frequência | Anual |
| porte_alcance | Todos com demonstrações assinadas pelo contador |
| quem_faz | Contador responsável; atendimento |
| onde_é_feita_hoje | Word, e-mail, assinatura eletrônica |
| entradas / saídas | Modelo → carta assinada; registro de recusa comunicada ao CRC |
| base_legal | Res. CFC 987/2003, alterada pela 1.457/2013; modelos sugeridos pela 1.493/2015 [T6]; menção a 1.590/2020 e ITG 1000 `[NÃO VERIFICADO]` |
| risco_se_falhar | Processo ético; contador sem proteção em caso de informação falsa |
| tempo_estimado | 10–20 min por cliente `[ESTIMATIVA]` |
| concorrentes | Omie tem configuração e emissão de carta de responsabilidade [C12] |
| hipótese_automação | Carta gerada com dados do cliente, enviada para assinatura eletrônica em janeiro, bloqueio do passo "assinar ECD" até chegar |
| papel_da_ia | M4 executar (envio, cobrança); M1 ler |
| ferramentas_agênticas | `enviar_carta_responsabilidade(cliente, exercicio)` |
| eventos_timesheet | `ctb.carta_responsabilidade.obtida` |
| fontes_descoberta | [T6], [C12] |

### CTB-040 · Planejar e acompanhar o encerramento do exercício

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Contábil / Encerramento anual |
| atividade | Montar o cronograma de encerramento por cliente: inventário, depreciação, provisões, conciliações, apuração do resultado, demonstrações, ECD, ECF |
| descrição | Início do ano é pico; prioridade decidida por intuição |
| gatilho_frequência | Anual (novembro a julho) |
| porte_alcance | Todos com escrituração completa |
| quem_faz | Coordenador contábil |
| onde_é_feita_hoje | Planilha, sistema de tarefas |
| entradas / saídas | Carteira → cronograma, responsáveis, marcos |
| base_legal | Prazos de ECD (junho) e ECF (julho) [T1][T2]; aprovação de contas (abril) [T7] |
| risco_se_falhar | Gargalo em junho e julho, multas por atraso |
| tempo_estimado | 4–8 h do coordenador por ano `[ESTIMATIVA]` |
| concorrentes | Sistemas de tarefas (Gestta, Tareffa) [C1][C5] |
| hipótese_automação | Cronograma gerado de trás para frente a partir dos prazos legais e da capacidade da equipe (timesheet do ano anterior) |
| papel_da_ia | M2 ler; M3 executar (capacidade); M4 rascunhar |
| ferramentas_agênticas | `cronograma_encerramento(carteira, exercicio)` |
| eventos_timesheet | `ctb.encerramento.planejado` |
| fontes_descoberta | [T1], [T2], [T7] |

### CTB-041 · Acompanhar a ECD de cada cliente até o recibo

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Contábil / ECD |
| atividade | Definir obrigatoriedade, gerar no core, validar no PVA, colher assinaturas (contador e representante legal), transmitir, guardar o recibo |
| descrição | Assinatura do representante exige o certificado do cliente, que nem sempre está disponível; correria no fim de junho |
| gatilho_frequência | Anual (até o último dia útil de junho); eventos especiais (cisão, fusão, incorporação, extinção) com prazo próprio `[NÃO VERIFICADO]` após a IN 2.142/2023 |
| porte_alcance | Lucro Real; Presumido que distribui acima da presunção; Simples conforme interpretação (divergência em [T9]) |
| quem_faz | Analista contábil; contador responsável |
| onde_é_feita_hoje | Core, PVA do SPED, certificado digital |
| entradas / saídas | Escrituração → arquivo validado, assinado, recibo |
| base_legal | IN RFB 2.003/2021, art. 5º, com redação da IN 2.142/2023 (junho) [T1]; multa de 0,02% ao dia, limitada a 1% da receita bruta (Lei 8.218/1991, art. 12, segundo as fontes) [T1] |
| risco_se_falhar | Multa; impossibilidade de comprovar lucro distribuído; balanço sem registro |
| tempo_estimado | 1–3 h por cliente, fora a escrituração `[ESTIMATIVA]` |
| concorrentes | e-Auditoria tem robôs que buscam os SPEDs transmitidos [C13] |
| hipótese_automação | Matriz de obrigatoriedade por cliente, status por etapa, cobrança do certificado do representante, leitura do recibo; transmissão fica no PVA |
| papel_da_ia | M1 ler (obrigatoriedade); M2 ler; M4 executar (cobranças, lembretes) |
| ferramentas_agênticas | `status_ecd(cliente, exercicio)`, `obrigados_ecd(carteira, exercicio)` |
| eventos_timesheet | `ctb.ecd.validada`, `ctb.ecd.assinada`, `ctb.ecd.transmitida` |
| fontes_descoberta | [T1], [T9], [C13] |

### CTB-042 · Acompanhar a ECF e conferir com a ECD

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Contábil / ECF |
| atividade | Recuperar a ECD na ECF, conferir saldos, e-Lalur/e-Lacs, transmitir e guardar recibo |
| descrição | Feita no core ou no PVA; conferência entre ECD e ECF manual |
| gatilho_frequência | Anual (último dia útil de julho) |
| porte_alcance | PJ tributadas pelo Lucro Real, Presumido, Arbitrado, imunes e isentas; dispensa para Simples `[NÃO VERIFICADO]` quanto às exceções |
| quem_faz | Contador sênior |
| onde_é_feita_hoje | Core, PVA da ECF |
| entradas / saídas | ECD, apuração → ECF transmitida, recibo |
| base_legal | IN RFB 2.004/2021 `[NÃO VERIFICADO]` no texto; multa com divergência entre fontes [T2] |
| risco_se_falhar | Multa; divergências cruzadas pela RFB |
| tempo_estimado | 2–6 h por cliente `[ESTIMATIVA]` |
| concorrentes | e-Auditoria com captura de SPEDs [C13] |
| hipótese_automação | Status e conferência automática de saldos ECD x ECF a partir dos arquivos |
| papel_da_ia | M3 executar (conferência); M2 ler; M1 ler |
| ferramentas_agênticas | `status_ecf(cliente, exercicio)`, `conferir_ecd_ecf(cliente, exercicio)` |
| eventos_timesheet | `ctb.ecf.transmitida` |
| fontes_descoberta | [T2], [C13] · transversal: D2 |

### CTB-043 · Retificar ou substituir ECD e ECF

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Contábil / ECD |
| atividade | Decidir entre substituição e retificação, preparar termo de verificação quando exigido, retransmitir e avisar obrigações afetadas |
| descrição | Rara e trabalhosa; disparada por erro descoberto em auditoria, fiscalização ou documento tardio |
| gatilho_frequência | Por evento |
| porte_alcance | Obrigados à ECD/ECF |
| quem_faz | Contador responsável |
| onde_é_feita_hoje | Core, PVA |
| entradas / saídas | Erro → nova escrituração, recibo, histórico |
| base_legal | Regras de substituição da IN RFB 2.003/2021 `[NÃO VERIFICADO]` |
| risco_se_falhar | Inconsistência permanente entre escriturações |
| tempo_estimado | 2–8 h por ocorrência `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Checklist guiado e registro do motivo; tempo marcado como retrabalho |
| papel_da_ia | M1 ler; M4 rascunhar |
| ferramentas_agênticas | `checklist_retificacao_sped(cliente, escrituracao)` |
| eventos_timesheet | `ctb.sped.retificado` |
| fontes_descoberta | — |

### CTB-044 · Publicar demonstrações de S/A e arquivar quando exigido

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Contábil / Encerramento anual |
| atividade | Publicar as demonstrações da companhia fechada (Central de Balanços do SPED até R$ 78 milhões de receita, ou jornal), disponibilizar no site da empresa e arquivar na Junta |
| descrição | Pouco frequente na carteira típica; prazo esquecido |
| gatilho_frequência | Anual |
| porte_alcance | S/A |
| quem_faz | Contador; societário |
| onde_é_feita_hoje | Central de Balanços, jornal, Junta |
| entradas / saídas | Demonstrações aprovadas → publicação, comprovante |
| base_legal | Lei 6.404/1976, arts. 289 e 294 com a Lei 13.818/2019; portaria da Central de Balanços com número a confirmar [T14] |
| risco_se_falhar | Irregularidade societária |
| tempo_estimado | 1–2 h por cliente `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Checklist com prazo derivado da assembleia e anexos |
| papel_da_ia | M1 ler; M4 rascunhar |
| ferramentas_agênticas | `checklist_publicacao(cliente, exercicio)` |
| eventos_timesheet | `ctb.publicacao.feita` |
| fontes_descoberta | [T14] · transversal: D1 |

### CTB-045 · Elaborar notas explicativas e demonstrações complementares

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Contábil / Encerramento anual |
| atividade | Redigir notas explicativas e, quando o core não gera bem, DFC e DMPL |
| descrição | Texto copiado do ano anterior em Word; números ajustados à mão |
| gatilho_frequência | Anual |
| porte_alcance | Clientes com demonstrações completas (crédito, licitação, S/A) |
| quem_faz | Contador sênior |
| onde_é_feita_hoje | Word, Excel |
| entradas / saídas | Balanço, políticas → notas explicativas |
| base_legal | NBC TG 1000 / ITG 1000 `[NÃO VERIFICADO]` |
| risco_se_falhar | Demonstração incompleta |
| tempo_estimado | 1–4 h por cliente `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Rascunho das notas com números ligados ao balancete e texto do ano anterior marcado para revisão |
| papel_da_ia | M1 ler (norma); M2 rascunhar; M3 executar (tabelas) |
| ferramentas_agênticas | `rascunhar_notas_explicativas(cliente, exercicio)` |
| eventos_timesheet | `ctb.notas.rascunhadas` |
| fontes_descoberta | — |

## H. Inventário e imobilizado

### CTB-046 · Coletar e conferir o inventário de estoque de 31/12

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Contábil / Inventário |
| atividade | Pedir a posição de estoque ao cliente, conferir com a contabilidade (custo, saldo), gerar o Livro de Inventário e o Bloco H da EFD ICMS/IPI |
| descrição | Cliente manda planilha em fevereiro ou não manda; o escritório "repete o do ano anterior" |
| gatilho_frequência | Anual (31/12, informado na EFD de fevereiro, entregue em março; prazo final por UF, ex.: SP até 20/03) [T8] |
| porte_alcance | Comércio e indústria; contribuintes do ICMS |
| quem_faz | Analista contábil e fiscal |
| onde_é_feita_hoje | Planilha, ERP do cliente, core |
| entradas / saídas | Posição de estoque → Livro de Inventário, Bloco H, ajuste de CMV |
| base_legal | Guia prático da EFD: Bloco H até a escrituração do segundo período após o balanço [T8]; em SP, multa de 1% do estoque não escriturado (segundo a fonte) [T8] |
| risco_se_falhar | Multa estadual; CMV errado; cruzamento estoque x compras |
| tempo_estimado | 1–4 h por cliente `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` coleta de inventário em plataforma de escritório |
| hipótese_automação | Pedido em dezembro com modelo, importação da planilha ou do ERP, conferência com saldo contábil e com XMLs de entrada (D3) |
| papel_da_ia | M2 rascunhar (ler planilha); M3 executar (conferência); M4 executar (pedido) |
| ferramentas_agênticas | `solicitar_inventario(cliente, data)`, `conferir_inventario(cliente, arquivo)` |
| eventos_timesheet | `ctb.inventario.conferido` |
| fontes_descoberta | [T8] · transversal: D2 |

### CTB-047 · Controlar o imobilizado fora do core

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Contábil / Imobilizado |
| atividade | Cadastrar bens a partir das notas de aquisição, calcular depreciação, registrar baixas e vendas |
| descrição | Planilha paralela quando o módulo patrimonial do core não é contratado; aquisições lançadas como despesa |
| gatilho_frequência | Mensal (depreciação); por evento (compra, venda) |
| porte_alcance | Clientes com ativo relevante |
| quem_faz | Analista contábil |
| onde_é_feita_hoje | Planilha, módulo patrimonial do core |
| entradas / saídas | Notas de entrada (CFOP de ativo) → ficha do bem, depreciação, baixa |
| base_legal | NBC TG 27 / seção 17 da NBC TG 1000 `[NÃO VERIFICADO]`; taxas fiscais da RFB `[NÃO VERIFICADO]` |
| risco_se_falhar | Ativo e resultado distorcidos; crédito de ICMS (CIAP) perdido |
| tempo_estimado | 15–30 min por cliente por mês `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Detectar notas de ativo nos XMLs (D3), propor cadastro do bem e lançamento; depreciação calculada pela função M3 |
| papel_da_ia | M2 rascunhar; M3 executar |
| ferramentas_agênticas | `propor_cadastro_bem(cliente, nota)`, `depreciacao(cliente, mes)` |
| eventos_timesheet | `ctb.imobilizado.atualizado` |
| fontes_descoberta | — · transversal: D3 |

### CTB-048 · Fazer o inventário físico do imobilizado e o teste de recuperabilidade

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Contábil / Imobilizado |
| atividade | Conferir se os bens do controle existem, baixar os que sumiram e avaliar indícios de perda de valor |
| descrição | Raro em pequenas empresas; exigido em auditoria, venda da empresa ou crédito |
| gatilho_frequência | Anual ou por evento |
| porte_alcance | Clientes com ativo relevante ou auditoria |
| quem_faz | Contador; cliente |
| onde_é_feita_hoje | Planilha, visita |
| entradas / saídas | Lista de bens → bens confirmados, baixas, nota de impairment |
| base_legal | NBC TG 01 `[NÃO VERIFICADO]` |
| risco_se_falhar | Ativo inexistente no balanço |
| tempo_estimado | 2–8 h por cliente `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Lista enviada ao cliente para confirmar com foto pelo celular; baixa proposta |
| papel_da_ia | M4 executar (coleta); M1 ler |
| ferramentas_agênticas | `inventario_fisico_bens(cliente)` |
| eventos_timesheet | `ctb.imobilizado.inventariado` |
| fontes_descoberta | — |

## I. Conformidade e guarda

### CTB-049 · Enviar a Declaração de Não Ocorrência ao COAF e avaliar operações suspeitas

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Contábil / Conformidade do profissional |
| atividade | Avaliar, durante o ano, operações dos clientes que exigem comunicação e, sem ocorrências, enviar a declaração anual pelo CPF do contador e pelo CNPJ do escritório |
| descrição | Lembrada em janeiro por notícia do CRC; a avaliação durante o ano quase não existe |
| gatilho_frequência | Anual (1º a 31 de janeiro); por evento (comunicação) |
| porte_alcance | Escritório e profissionais |
| quem_faz | Sócio; contador responsável |
| onde_é_feita_hoje | Sistema do CFC, app CRC Digital |
| entradas / saídas | Avaliação → declaração ou comunicação, comprovante |
| base_legal | Lei 9.613/1998; Res. CFC 1.530/2017 ou 1.721/2024 (fontes divergem sobre a vigente) [T5] |
| risco_se_falhar | Sanções administrativas e disciplinares [T5] |
| tempo_estimado | 15–30 min por ano para a declaração `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Prazo no calendário do escritório; alertas de operações atípicas a partir dos extratos (valores em espécie, fracionamento) para avaliação humana; nunca comunicação automática |
| papel_da_ia | M1 ler (critérios); M3 executar (alertas); envio pessoal (C-crc ou D) |
| ferramentas_agênticas | `alertas_operacoes_atipicas(carteira, periodo)` |
| eventos_timesheet | `ctb.coaf.declarado` |
| fontes_descoberta | [T5] · transversal: D7 |

### CTB-050 · Guardar documentos pelo prazo e devolver no fim do contrato

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Contábil / Guarda |
| atividade | Manter a documentação e as escriturações pelo prazo exigido e entregar ao cliente (ou ao novo contador) no offboarding |
| descrição | Pastas de rede sem padrão; papel em caixas; termo de entrega feito na hora |
| gatilho_frequência | Contínua; por evento (saída do cliente) |
| porte_alcance | Todos |
| quem_faz | Coordenador; atendimento |
| onde_é_feita_hoje | Pasta de rede, arquivo físico |
| entradas / saídas | Documentos → acervo indexado, termo de entrega |
| base_legal | Prazos de guarda (decadência tributária, legislação comercial) `[NÃO VERIFICADO]`; deveres do contador na transferência (NBC PG 01) `[NÃO VERIFICADO]` |
| risco_se_falhar | Impossibilidade de defesa em fiscalização; conflito com cliente |
| tempo_estimado | 2–6 h por offboarding `[ESTIMATIVA]` |
| concorrentes | Gestta envia link de download para o cliente [C5] |
| hipótese_automação | Acervo por cliente e competência com prazo de retenção; pacote de entrega gerado com índice e termo |
| papel_da_ia | M2 ler; M4 executar (pacote, com aprovação) |
| ferramentas_agênticas | `pacote_entrega_documentos(cliente, periodo)` |
| eventos_timesheet | `ctb.acervo.entregue` |
| fontes_descoberta | [C5] · transversal: D1 (offboarding) |

### CTB-051 · Atender auditoria, due diligence e fiscalização

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Contábil / Conformidade |
| atividade | Separar razões, conciliações, contratos e comprovantes pedidos por auditor, comprador ou fiscal, e responder questionamentos |
| descrição | Lista de pedidos em Excel; o escritório garimpa pastas por dias |
| gatilho_frequência | Por evento |
| porte_alcance | Clientes auditados, em venda ou fiscalizados |
| quem_faz | Contador sênior; sócio |
| onde_é_feita_hoje | Core, pastas, e-mail |
| entradas / saídas | Lista de pedidos → pacote de evidências, respostas |
| base_legal | — |
| risco_se_falhar | Ressalva na auditoria; autuação; desconto no preço da empresa |
| tempo_estimado | 4–40 h por ocorrência `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Leitura da lista de pedidos, busca no acervo e no razão, pacote por item com status |
| papel_da_ia | M2 ler e rascunhar; M4 executar (montagem) |
| ferramentas_agênticas | `atender_lista_pedidos(cliente, arquivo)` |
| eventos_timesheet | `ctb.auditoria.atendida` |
| fontes_descoberta | — · transversal: D2 (intimações) |

### CTB-052 · Manter livro caixa e registrar livros quando não houver ECD

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Contábil / Escrituração simplificada |
| atividade | Escriturar o livro caixa (Simples e Presumido sem escrituração completa) e, quando não há ECD, autenticar o Diário |
| descrição | Livro caixa gerado de planilha; autenticação esquecida; relato de fórum diz que, sem ECD, distribuição isenta acima do limite exigiria autenticação do Diário [T9] |
| gatilho_frequência | Mensal (caixa); anual (autenticação) |
| porte_alcance | Simples e Presumido sem escrituração completa |
| quem_faz | Analista contábil |
| onde_é_feita_hoje | Core, planilha, Junta |
| entradas / saídas | Extratos → livro caixa; Diário autenticado |
| base_legal | LC 123/2006, arts. 26 e 27 (livro caixa ou escrituração contábil) [T9] `[NÃO VERIFICADO]` no texto oficial |
| risco_se_falhar | Distribuição de lucros sem comprovação; exclusão do Simples `[NÃO VERIFICADO]` |
| tempo_estimado | 30–60 min por cliente por mês `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Livro caixa gerado direto do extrato classificado (CTB-015), com termo de abertura e encerramento |
| papel_da_ia | M2 ler; M3 executar |
| ferramentas_agênticas | `gerar_livro_caixa(cliente, periodo)` |
| eventos_timesheet | `ctb.livro_caixa.gerado` |
| fontes_descoberta | [T9] |

---

## As cinco atividades de maior dor (hipótese para a triagem)

Critério do agente, a confirmar com os contadores: horas somadas na carteira, frequência mensal e o fato de bloquearem tudo o que vem depois.

1. **Cobrar e receber os documentos do mês** (CTB-002 a CTB-005): é a causa mais citada de atraso no fechamento [T16]; a régua do Tareffa mostra que o mercado já trata como funcionalidade [C1].
2. **Classificar o extrato** (CTB-015, CTB-016): o maior bloco de horas do analista em cliente de serviço; é onde ROIT e Conta Azul/Mister Contador apostam [C4][C6].
3. **Esclarecer movimentos sem documento** (CTB-006): muitas idas e vindas por WhatsApp; deixa saldo em conta transitória.
4. **Controlar lucros pagos aos sócios com a Lei 15.270** (CTB-033 a CTB-036): rotina nova de 2026, mensal, com risco de retenção a menor e sem solução no mercado encontrada.
5. **Levar a ECD e a ECF até o recibo, com carta de responsabilidade e assinaturas** (CTB-039, CTB-041, CTB-042): rara mas crítica, com multa e pico de trabalho em junho e julho.

## Funcionalidades de concorrentes nesta aba

| Concorrente | O que oferece na aba Contábil | Fonte |
| --- | --- | --- |
| Tareffa (Questor) | "Cobra Arquivos": checklist de arquivos por cliente, 3 lembretes automáticos, reenvio manual | [C1] |
| Questor Gestão Contábil | Open Finance nativo (credenciamento do escritório, contas, poupança, fatura de cartão), conciliação com parâmetros, lançamentos em lote, tela de conferência | [C2] |
| Domínio (Thomson Reuters) | Importação de OFX, OFC e Febraban (até 12 meses), conciliação bancária no core | [C3] |
| Conta Azul / Conta Azul Mais | Integração por API com o Domínio (declarada a única), exportação para mais de 25 sistemas, captura de NF-e/NFS-e/NFC-e/CT-e da carteira, DRE, conciliação; comprou a Mister Contador em jul/2026 | [C4] |
| Gestta (Thomson Reuters) | Tarefas e processos do escritório, envio de documentos ao cliente com link, integração ao portal Onvio | [C5] |
| ROIT | Classificação contábil por IA (98% segundo a empresa), robô de contas a pagar com conciliação | [C6] |
| Nibo | Conciliação com regras e em lote (segundo comparativo da Conta Azul); Nibo Obrigações Plus com dashboards de pendências e produtividade | [C7] |
| Pluggy, Belvo, Celcoin, Klavi | Agregação Open Finance por API; preço sob consulta | [C8], [C9], [T12] |
| HubStrom | Ecossistema com monitoramento fiscal, captura de notas, atendimento, tarefas e armazenamento; XMLHub integrado a softwares contábeis | [C10] |
| Alterdata (Prosoft, MovBanc) | Importação de extrato e conciliação automática no core | [C11] |
| Omie | Emissão de carta de responsabilidade da administração (no ERP) | [C12] |
| e-Auditoria | Robôs que capturam SPEDs e DF-e da Receita | [C13] |
| Concil, Auditto | Conciliação de cartões com adquirentes (para o varejista) | [C17] |
| Acessórias, SIEG, Qive, Veri, e-Kontroll, Onvio (portal), Contabilizei | `[NÃO ENCONTRADO]`: as buscas ("Acessórias funcionalidades envio de documentos", "SIEG Hub extratos conciliação", "Veri contabilidade automação", "e-Kontroll fechamento", "Onvio portal extrato") não trouxeram página oficial sobre funcionalidades contábeis. A Etapa 2 (V3) deve abrir os sites | — |

**Leitura:** o mercado cobre bem (a) importação e conciliação dentro do core, (b) régua de cobrança de arquivos e (c) agregação Open Finance. Não foi encontrada oferta para: conferência de completude da competência, perguntas ao cliente por lançamento via WhatsApp, conferências cruzadas fiscal x contábil x pagamento, controle de lucros e dividendos da Lei 15.270, pacote para licitação e banco, carta de responsabilidade integrada à ECD e acompanhamento do estoque de lucros da transição.

## Lacunas

1. **Leitura direta bloqueada:** nenhuma norma foi lida no original (Planalto e gov.br inacessíveis nesta sessão). Abrir na Etapa 2: IN RFB 2.003/2021 (com IN 2.142/2023), IN RFB 2.004/2021, Lei 15.270/2025, LC 224/2025, IN RFB 2.306/2026, LC 123/2006 arts. 14, 26 e 27, Res. CFC 987/2003 (e 1.457/2013, 1.590/2020), Res. CFC 1.364/2011 (Anexo II vigente), Res. CFC 1.530/2017 x 1.721/2024, Lei 14.133/2021 art. 69, portaria da Central de Balanços.
2. **Multa da ECF:** fontes divergem sobre base e percentual por regime [T2].
3. **Lei 15.270 e Simples Nacional:** se a retenção alcança dividendos do Simples segue controverso [T3]; desfecho do referendo da liminar nas ADIs 7.912/7.914 `[NÃO VERIFICADO]` [T4].
4. **LC 224/2025:** situação das liminares do TRF-3 e da ADI 7936; confirmação do IRRF de 17,5% sobre JCP (fonte única) [T15].
5. **Contabilização de CBS/IBS em 2026:** sem posição única do CFC; confirmar Decreto 12.955/2026 e Resolução CGIBS 6/2026 e o futuro do split payment [T10].
6. **Open Finance PJ:** regras atuais do BCB sobre janela de histórico e prazo de consentimento para PJ; cobertura de bancos e cooperativas da carteira; preços de Pluggy, Belvo, Celcoin e Klavi `[PREÇO NÃO PÚBLICO]` [T12][C8][C9].
7. **APIs das adquirentes** (Cielo, Rede, Stone, Getnet) para extrato de recebíveis: `[NÃO ENCONTRADO]` nesta etapa (busca: "conciliação adquirente API contabilidade").
8. **Leiautes de importação** de lançamentos do Domínio, Alterdata e Contmatic: só a importação de OFX do Domínio foi confirmada [C3]; os leiautes de lançamento ficam para V3.
9. **Concorrentes sem página encontrada:** Acessórias, SIEG, Qive, Veri, e-Kontroll, Onvio (portal), Contabilizei, Kolossus.
10. **Tempo por atividade:** nenhuma medição pública; todos os tempos são estimativa e dependem do levantamento com os contadores.
11. **ECD do Simples que distribui acima da presunção:** obrigatoriedade de entrega x só manter escrituração diverge entre fontes [T9].
12. **Prazo de ECD em eventos especiais** (cisão, fusão, incorporação, extinção) após a IN 2.142/2023 `[NÃO VERIFICADO]`.

## Fontes

Todas consultadas em 05/11/2026, por resumo e trecho do buscador (ver "Limitação de método").

**Normas, órgãos e imprensa**

- [T1] ECD, prazo e multa: [AMDJUS, "Prazo para envio da ECD 2026 termina hoje"](https://amdjus.com.br/prazo-para-envio-da-ecd-2026-termina-hoje-multas-podem-chegar-a-r-5-000/); [COAD, "RFB atualiza as normas de apresentação da ECD"](https://www.coad.com.br/home/noticias-detalhe/50851/rfb-atualiza-as-normas-de-apresentacao-da-ecd); [NetCPA, multa por atraso da ECD](https://netcpa.com.br/colunas/ecd-qual-a-multa-por-atraso-na-entrega/1962); [CRC-MS, multa da ECD](https://crcms.org.br/?p=17296)
- [T2] ECF: [Econet, "ECF 2026: quem deve entregar, prazo, dispensas e multas"](https://blog.econeteditora.com.br/ecf-2026-quem-deve-entregar-prazo-dispensas-e-multas/); [Contadores.cnt.br, reta final da ECF 2026 (24/07/2026)](https://contadores.cnt.br/projetos/46/noticias/tecnicas/2026/07/24/reta-final-da-ecf-2026-empresas-e-contadores-tem-ate-dia-31-para-envio.html)
- [T3] Lei 15.270/2025: [Jornal Contábil](https://jornalcontabil.com.br/noticia/lei-15-270-define-regras-para-taxacao-de-lucros-e-dividendos-a-partir-de-2026/); [IOB](https://noticias.iob.com.br/tributacao-dividendos-imposto-de-renda/); [Contábeis, Lei 15.270 e Simples](https://www.contabeis.com.br/artigos/77587/lei-15-270-afeta-dividendos-no-simples-nacional/); [CRC-MG, apresentação de 16/12/2025](https://crcmg.org.br/wp-content/uploads/2025/12/Cafe-com-o-Contabilista-Lei-n.-15.270-e-a-tributacao-de-dividendos-e-de-altas-rendas-16dez2025.pdf)
- [T4] Transição dos lucros até 2025 e STF: [ABC da Comunicação, STF prorroga prazo](https://www.abcdacomunicacao.com.br/stf-atende-pedido-da-cnc-e-prorroga-prazo-para-empresas-garantirem-isencao-sobre-lucros-de-2025/); [Ozai, perguntas e respostas sobre a Lei 15.270](https://www.ozai.com.br/?p=24693); [Migalhas, voto (PDF)](https://arq.migalhas.com.br/arquivos/2026/2/E53B174D95AE32_votoNM.pdf)
- [T5] COAF: [CFC, prazo de 31 de janeiro](https://cfc.org.br/noticias/coaf-31-de-janeiro-encerra-se-o-prazo-para-envio-da-declaracao-de-nao-ocorrencia-ao-cfc/); [Contábeis, declaração já pode ser enviada](https://www.contabeis.com.br/noticias/74485/declaracao-ao-coaf-ja-pode-ser-enviada/)
- [T6] Carta de responsabilidade: [Res. CFC 1.457/2013 (LegisWeb)](https://www.legisweb.com.br/legislacao/?id=262863); [Res. CFC 987/2003 (LegisWeb)](https://www.legisweb.com.br/legislacao/?id=99248); [Jettax](https://www.jettax.com.br/blog/carta-de-responsabilidade-da-administracao-entenda-o-que-e-e-qual-a-sua-importancia/)
- [T7] Aprovação de contas: [Migalhas, prazo para aprovação de contas](https://www.migalhas.com.br/depeso/385144/aproxima-se-o-prazo-para-a-aprovacao-de-contas-pelas-sociedades); [NetCPA, aprovação de contas nas limitadas](https://netcpa.com.br/colunas/consideracoes-sobre-a-aprovacao-de-contas-nas-sociedades-limitadas/8734)
- [T8] Bloco H e inventário: [Jornal Contábil, inventário de dezembro na EFD de fevereiro](https://jornalcontabil.com.br/noticia/efd-icmsipi-fique-sabendo-inventario-de-dezembro-deve-ser-informado-no-arquivo-de-fevereiro/); [Portal Tributário, prazo de escrituração do inventário](https://www.portaltributario.com.br/tributario/escrituracao-do-inventario-prazo-efd.htm); [IOB, Bloco H](https://noticias.iob.com.br/tudo-que-precisa-saber-sobre-o-bloco-h-do-sped-fiscal-e-o-prazo-de-entrega/)
- [T9] Simples, escrituração e lucros: [Contábeis, regras da escrituração no Simples](https://www.contabeis.com.br/noticias/40078/as-regras-da-escrituracao-contabil-para-as-empresas-do-simples-nacional/); [CRC-CE, Simples Nacional (PDF)](https://www.crc-ce.org.br/crcnovo/files/SimplesNacional.pdf); [Fórum Contábeis, ECD Simples e distribuição](https://www.contabeis.com.br/forum/tributos-federais/313569/ecd-simples-nacional-distribuicao-de-lucros/)
- [T10] Contabilização da reforma: [IOB (set/2026)](https://noticias.iob.com.br/?p=90275); [Escola Superior ESN, contabilização prática](https://escolasuperioresn.com.br/?p=7185); [Escola Superior ESN, ECD 2026 e split payment](https://escolasuperioresn.com.br/?p=11219)
- [T11] DECORE: [Res. CFC 1.364/2011 (LegisWeb)](https://www.legisweb.com.br/legislacao/?id=114437); [NetCPA, Decore volta ao sistema do CFC](https://netcpa.com.br/colunas/decore-volta-a-ser-emitida-em-sistema-do-cfc/6622); [CFC, ementa de multa (PDF)](https://cfc.org.br/wp-content/uploads/2024/02/EMENTA-MULTA-POR-FIRMAR-DECLARACAO-COMPROBATORIA-DE-PERCEPCAO-DE-RENDIMENTOS-SEM-COMPROVACAO-5.pdf)
- [T12] Open Finance: [Celcoin, consumo de dados](https://developers.celcoin.com.br/docs/consumo-de-dados-open-finance); [Caixa, perguntas frequentes](https://www.caixa.gov.br/open-finance/perguntas-frequentes/Paginas/default.aspx); [Finsiders, Open Finance entre empresas](https://finsidersbrasil.com.br/reportagem-exclusiva-fintechs/open-finance-cresce-entre-empresas-mas-desafios-nao-sao-poucos/)
- [T13] Licitação, art. 69: [Prefeitura de Curitiba, análise (PDF)](https://mid.curitiba.pr.gov.br/2025/00462464.pdf); [Effecti, índices contábeis em licitação](https://www.effecti.com.br/indices-contabeis-licitacao)
- [T14] Publicação de S/A: [Demarest](https://www.demarest.com.br/a-regulamentacao-das-publicacoes-eletronicas-para-as-sociedades-anonimas/); [Dizer o Direito, Lei 13.818/2019](https://www.dizerodireito.com.br/2019/04/lei-138182019-altera-forma-de.html)
- [T15] LC 224/2025: [Reforma Tributária, sanção da LC 224](https://www.reformatributaria.com/governo/lula-sanciona-lei-complementar-224-de-2025-que-eleva-em-10-custos-dos-tributos-do-lucro-presumido/); [Machado Meyer, justiça suspende aumento](https://www.machadomeyer.com.br/pt/inteligencia-juridica/publicacoes-ij/tributario-ij/lucro-presumido-justica-suspende-aumento); [Jurídico Certo, cálculo acima de R$ 5 milhões](https://juridicocerto.com/p/thiago-reis2/artigos/faturamento-acima-de-r-5-milhoes-quanto-a-lc-224-2025-aumenta-a-base-do-lucro-presumido-8089)
- [T16] Dor da coleta de documentos: [Keevo, desafios das operações](https://keevo.com.br/blog-ec/desafios-operacoes-escritorios-contabeis); [Jettax, atrasos no fechamento](https://www.jettax.com.br/blog/baixar-xml-em-2026-como-reduzir-atrasos-no-fechamento-contabil/); [Ozai, checklist mensal de documentos](https://www.ozai.com.br/documentos-contabeis-que-devem-ser-enviados-para-a-contabilidade/)
- [T17] Conciliação de cartões: [Cielo, conciliação financeira de cartões](https://blog.cielo.com.br/financas/conciliacao-financeira-de-cartoes/); [Baguete, Concil](https://www.baguete.com.br/noticias/concil-investe-r-1-mi-em-app)
- [T18] [Contábeis, "Pare de pedir extratos bancários dos seus clientes"](https://www.contabeis.com.br/noticias/52972/pare-de-pedir-extratos-bancarios-dos-seus-clientes/)
- [T19] Checklists de fechamento: [Jettax, fechamento contábil](https://www.jettax.com.br/blog/fechamento-contabil/); [Jornal Contábil, como elaborar um fechamento contábil](https://jornalcontabil.com.br/noticia/como-elaborar-um-fechamento-contabil-evitar-erros-e-garantir-a-conformidade-fiscal/)
- [T20] [RAGC, BI e relatórios gerenciais (2024)](https://revistas.fucamp.edu.br/index.php/ragc/article/view/3597/2233)

**Concorrentes e fornecedores**

- [C1] [Tareffa, processo modelo para cobrança de arquivos](https://docs.questor.com.br/pt-br/Produtos/Tareffa/gestao-processos/proc-modelo-cobranca)
- [C2] [Questor, Open Finance](https://docs.questor.com.br/pt-br/Produtos/GestãoContábilCloud/Contabilidade/ConciliaçãoBancária/open-finance); [Questor, configurações da conciliação](https://docs.questor.com.br/Produtos/GestãoContábilCloud/Contabilidade/ConciliaçãoBancária/configuraçoes-conciliacao-bancaria); [Questor, jornada de custos](https://docs.questor.com.br/pt-br/Produtos/GestãoContábilCloud/GerenciadordeEmpresas/custo-e-produtividade/jornada-de-custos)
- [C3] [Domínio, importar extrato OFX/OFC/Febraban](https://suporte.dominioatendimento.com/central/faces/solucao.html?codigo=238); [Domínio, conciliação bancária](https://suporte.dominioatendimento.com/central/faces/solucao.html?codigo=209)
- [C4] [Conta Azul e Domínio](https://contaazul.com/contadores/dominio/); [Conta Azul, funcionalidades para contadores](https://contaazul.com/contadores/funcionalidades/); [Reforma Tributária, Conta Azul adquire Mister Contador](https://www.reformatributaria.com/negocios/conta-azul-adquire-a-mister-contador-e-passa-a-integrar-automacao-contabil-no-proprio-ecossistema/)
- [C5] [Thomson Reuters, perguntas e respostas Gestta (PDF)](https://images.engage.es-pt.thomsonreuters.com/Web/LALEYSAEIMPRESORA/%7Bfa3be1a4-eadc-479b-a994-f9e425ce049d%7D_TAX_PROF_BR_PDF_PERGUNTAS_E_RESPOSTAS_Base.pdf)
- [C6] [Finsiders, robôs da ROIT](https://finsidersbrasil.com.br/noticias-sobre-fintechs/robos-da-roit-registram-lancamentos-contabeis-sem-intervencao-humana); [Âmbito Jurídico, IA na ROIT](https://ambitojuridico.com.br/inteligencia-artificial-e-caminho-sem-volta-no-mercado-de-contabilidade/)
- [C7] [Conta Azul, comparativo de conciliação (cita Nibo)](https://contaazul.com/conciliacao-bancaria/); [Contabilidade Zen, conciliação automática 2026](https://www.contabilidadezen.com.br/blog/conciliacao-bancaria-automatica-2026/); [Omie, sistemas para escritório (cita Nibo Obrigações Plus)](https://www.omie.com.br/blog/relatorio-contabil-no-escritorio-de-contabilidade/index.md)
- [C8] [Toolmage, Pluggy](https://www.toolmage.com/pt/tool/pluggy/); [TabNews, relato de preços de agregadores](https://www.tabnews.com.br/GuilhermeVieira/estou-desenvolvendo-um-app-de-financas-pessoais-e-nao-consigo-pagar-o-open-finance-pluggy-r2-5k-mes-belvo-r6k-mes-tecnospeed-r1-5k-de-entrada-r540); [Let's Money, Open Finance nos ERPs](https://www.letsmoney.com.br/noticias/open-finance-deixou-de-ser-buzzword-virou-o-novo-motor-dos-erps/)
- [C9] [Belvo, API de transações Open Finance Brasil](https://developers.belvo.com/apis/belvoopenapispec/transactions/transactionopenfinancebrazil); [Startups, Belvo no Brasil](https://startups.com.br/fintech/belvo-preve-conectar-5-milhoes-de-contas-via-open-finance-no-brasil/)
- [C10] [AMDJUS, HubStrom](https://amdjus.com.br/hubstrom-revoluciona-a-contabilidade-com-seu-ecossistema-inteligente-integrado/); [AMDJUS, XMLHub](https://amdjus.com.br/hubstrom-revoluciona-a-integracao-do-xmlhub-com-os-principais-softwares-de-contabilidade-do-mercado/)
- [C11] [Alterdata, importar extrato bancário](https://ajuda.alterdata.com.br/movbanc/conciliar-movimentos-bancarios/conciliacao-automatica/opcoes-da-conciliacao-automatica/importar-extrato-bancario); [Alterdata Prosoft, parâmetros da conciliação contábil](https://ajuda.alterdata.com.br/prosoftcontabil/c62-parametros-iniciais-para-a-conciliacao-contabil-versao-4-148472701.html)
- [C12] [Omie, carta de responsabilidade da administração](https://ajuda.omie.com.br/pt-BR/articles/6088582-como-configurar-e-emitir-a-carta-de-responsabilidade-da-administracao)
- [C13] [e-Auditoria, captura automática dos SPEDs](https://www.e-auditoria.com.br/solucoes/para-integrar/captura-automatica-dos-speds/)
- [C14] [Tecnospeed, OFX ou Open Finance](https://blog.tecnospeed.com.br/arquivo-ofx-ou-open-finance-o-futuro-da-integracao-de-extrato-bancario/)
- [C15] [Contmatic, organizar a documentação para o contador](https://simplifique.contmatic.com.br/blogs/como-organizar-documentacao-para-o-contador-sem-digitar-nada)
- [C16] [Digisac, automação no atendimento contábil](https://digisac.com.br/blog/automacao-atendimento-contabil-exemplos-praticos)
- [C17] [Baguete, Concil](https://www.baguete.com.br/noticias/concil-investe-r-1-mi-em-app); [Auditto, conciliação de cartão](https://auditto.com.br/como-a-conciliacao-de-cartao-pode-melhorar-seu-negocio); [imagetotable.ai, extração de extratos para escritórios](https://imagetotable.ai/pt/blog/what-is-bank-statement-extraction-accounting)

---

## Fichas do ciclo de vida (rodada 3, 6/11/2026)

Rodada feita para a classificação por etapa do ciclo de vida do cliente (**Entrada**, **Manutenção**, **Desligamento**) usada pelos contadores do grupo. As 52 fichas acima são quase todas de Manutenção; a Entrada aparecia só como gatilho (checklist, Open Finance, ERP) e o Desligamento só na guarda e entrega do acervo (CTB-050). As fichas abaixo cobrem o que faltava **na parte contábil**, sem repetir o que outras abas já cobriram na mesma rodada: biblioteca de modelos, proposta e contrato (D1 SOC-101), acordo de corte com o contador anterior e carta de fatos ao sucessor (D1 SOC-104, SOC-107), descarte LGPD (D1 SOC-108), conferência fiscal declarado × apurado × pago, créditos e parcelamentos herdados (D2 FIS-103 a FIS-105), obrigações fiscais da baixa e estoque final na baixa da IE (D2 FIS-110, FIS-111). As fichas existentes não foram alteradas. Campos extras: `etapa` e `nível_automação (provisório)` (escala do consolidado: A, A$, B, C-cert/C-crc/C-captcha, D-assistido, D-humano, E, F, Próprio). Fontes novas `[L1]` a `[L12]` em "Fontes da rodada 3", consultadas em 6/11/2026. Tempos são `[ESTIMATIVA]` até o levantamento com os contadores.

**Achado lateral (não altera fichas):** a Res. CFC 1.590/2020, art. 14, revogou as Res. CFC 987/2003 e 1.457/2013 [L1], citadas como base da carta de responsabilidade no achado 8 e em CTB-039. A exigência continua, agora no art. 3º da 1.590 (carta anual "de que trata a ITG 1000", com avaliação de riscos e salvaguardas em caso de recusa) e no art. 2º, "j" (cláusula obrigatória no contrato) [L1]. Vale corrigir a base legal de CTB-039 na próxima revisão.

### CTB-101 · Estimar o volume e a complexidade contábil para a proposta

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Contábil / Entrada (proposta) |
| etapa | Entrada |
| atividade | Antes da proposta, levantar o tamanho do trabalho contábil do prospect: contas bancárias, cartões e adquirentes, volume mensal de lançamentos, regime e tipo de escrituração (completa ou livro caixa), se há ERP do cliente, estoque, imobilizado, distribuição de lucros, auditoria; e definir o que o cliente faz e o que o escritório faz |
| descrição | A Res. CFC 1.590/2020 exige proposta com detalhamento dos serviços, periodicidade, valor de cada serviço e "a parte dos serviços que deverá ser executada pelo contratante"; sem isso, o profissional fica obrigado a fazer "todo e qualquer serviço compatível com a sua habilitação" (art. 4º e parágrafo único) [L1]. Pesquisa do Sescon-SP citada por blog de fornecedor diz que os escritórios precificam por número de lançamentos, faturamento e complexidade [L11]; a Alterdata calcula um "honorário ideal" só para quem já é cliente, a partir dos próprios sistemas [L11]. Para o prospect, o levantamento é feito de cabeça ou por planilha `[NÃO VERIFICADO]` |
| gatilho_frequência | Por evento (cada prospect); revisão no primeiro trimestre do cliente |
| porte_alcance | Todos os prospects |
| quem_faz | Sócio; comercial; coordenador contábil |
| onde_é_feita_hoje | Reunião, planilha, e-mail |
| entradas / saídas | Extratos de amostra, último balancete ou ECD (se o prospect enviar), questionário → escopo contábil, faixa de lançamentos, lista do que fica a cargo do cliente, insumo para a proposta (SOC-101) |
| base_legal | Res. CFC 1.590/2020, arts. 2º "b" e "c" e 4º [L1] |
| risco_se_falhar | Proposta abaixo do custo; serviço não previsto que o escritório fica obrigado a prestar (art. 4º, parágrafo único) [L1]; perda de cliente na revisão de preço |
| tempo_estimado | 1–3 h por prospect `[ESTIMATIVA]` |
| concorrentes | Alterdata, controle gerencial (só para clientes já nos sistemas) [L11] |
| hipótese_automação | Questionário no app do prospect com upload de 2 ou 3 extratos ou do último balancete; o agente conta lançamentos por mês, contas e adquirentes, e devolve um quadro de escopo com faixa de volume e o que fica com o cliente; o mesmo quadro é comparado com o volume real depois de 90 dias (dado do timesheet) |
| papel_da_ia | M2 ler (amostras); M3 executar (contagem e faixa); M4 rascunhar (quadro de escopo para a proposta) |
| ferramentas_agênticas | `estimar_escopo_contabil(prospect_id, arquivos)`, `comparar_escopo_real(cliente_id, dias=90)` |
| eventos_timesheet | `ctb.escopo.estimado`, `ctb.escopo.revisado` |
| nível_automação (provisório) | Próprio |
| fontes_descoberta | [L1], [L11] · transversal: D1 (SOC-101), D7 (GES-042) |

### CTB-102 · Recuperar a ECD, a ECF e os livros já transmitidos do cliente

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Contábil / Entrada (transição) |
| etapa | Entrada |
| atividade | Baixar da Receita os arquivos de ECD e ECF já transmitidos pelo contador anterior (últimos exercícios), com recibos, e conferir se batem com o que o anterior entregou (hash do recibo, período, situação, plano de contas) |
| descrição | O arquivo exato transmitido é o que a ECF e a ECD seguintes recuperam; quando o anterior manda só um TXT ou PDF, o novo contador baixa pelo ReceitaNet BX com o certificado da empresa (Domínio descreve o passo a passo) [L6]. Fórum relata erro de "ECD recuperada inválida" e recomenda conferir o hash do recibo [L6] (fonte informal). Com o A1 do cliente no app (premissa), a baixa não depende mais do anterior |
| gatilho_frequência | Por evento (cliente vindo de outra contabilidade) |
| porte_alcance | Clientes com escrituração completa que trocam de escritório |
| quem_faz | Analista contábil; coordenador |
| onde_é_feita_hoje | ReceitaNet BX (programa da RFB), e-mail com o contador anterior |
| entradas / saídas | CNPJ, A1 do cliente → ECD e ECF dos últimos exercícios, recibos, relatório de divergências com o material do anterior |
| base_legal | IN RFB 2.003/2021, art. 6º (recibo da ECD prova a autenticação dos livros) [L2] |
| risco_se_falhar | Saldos de abertura sem lastro; ECF do ano rejeitada por ECD recuperada errada; livro sem autenticação descoberto só na fiscalização |
| tempo_estimado | 30–90 min por cliente `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` (cores só importam o arquivo baixado) |
| hipótese_automação | Robô com o A1 do cliente rodando a consulta de arquivos SPED por exercício; o agente lê os blocos 0000, I030, I155 e J930 e monta a ficha do histórico (períodos, situação especial, plano de contas, signatários) e a lista do que falta |
| papel_da_ia | M4 executar (baixa); M2 ler (parsing do SPED); M4 rascunhar (pedido ao anterior do que faltar) |
| ferramentas_agênticas | `baixar_sped_historico(cliente_id, tipo, exercicios)`, `ler_ecd(arquivo)`, `conferir_recibo_hash(arquivo, recibo)` |
| eventos_timesheet | `ctb.sped_historico.recuperado` |
| nível_automação (provisório) | C-cert (ReceitaNet BX é programa de desktop com certificado; API para baixar escrituração `[NÃO ENCONTRADO]`); alternativa D-assistido (a pessoa baixa, o agente lê e confere) |
| fontes_descoberta | [L2], [L6] · transversal: D1 (SOC-023), V1 (I-24) |

### CTB-103 · Conferir e implantar os saldos de abertura herdados

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Contábil / Entrada (transição) |
| etapa | Entrada |
| atividade | Receber o balancete ou balanço de corte do contador anterior, conferir os saldos com documentos externos (extratos bancários, de aplicações, empréstimos e consórcios, posição de parcelamentos, contratos) e com a última ECD, lançar os saldos iniciais no core na data certa e abrir pendências para o que não fecha |
| descrição | Prática relatada: pedir extratos antigos, inclusive empréstimos, investimentos e consórcios, e conferir com o balancete final entregue pelo anterior [L7] (fórum); os saldos não devem ser lançados como se tivessem sido elaborados pelo novo responsável, e a conta transitória de abertura tem de zerar [L7]. Na ECD, o novo responsável recupera os saldos do plano anterior e segue do período em que assumiu [L4]. Hoje é conferência manual, conta a conta |
| gatilho_frequência | Por evento (cliente novo vindo de outra contabilidade) |
| porte_alcance | Clientes com escrituração completa que trocam de escritório |
| quem_faz | Analista contábil sênior |
| onde_é_feita_hoje | Excel, core |
| entradas / saídas | Balancete de corte (SOC-023), ECD recuperada (CTB-102), extratos e posições → saldos iniciais no core, conta transitória zerada, lista de diferenças assinada pelo cliente |
| base_legal | Res. CFC 1.590/2020, art. 9º, parágrafo único (demonstrações do período cabem ao rescindente) [L1]; ITG 2000 (R1) `[NÃO VERIFICADO]` no texto oficial |
| risco_se_falhar | Erro herdado incorporado como próprio; saldo bancário que nunca concilia; lucro distribuível calculado sobre patrimônio errado (CTB-033) |
| tempo_estimado | 2–8 h por cliente `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | O agente cruza o I155 final da ECD recuperada, o balancete de corte e os extratos do mês de corte (Open Finance ou OFX do app); marca o que fecha, o que difere e o que não tem lastro; gera o lote de saldos iniciais no leiaute do core e a carta de diferenças para o cliente e o anterior |
| papel_da_ia | M2 ler; M3 executar (conciliação de saldos); M4 rascunhar (lote e carta) |
| ferramentas_agênticas | `conferir_saldos_abertura(cliente_id, data_corte)`, `exportar_para_core(cliente, competencia, core)` |
| eventos_timesheet | `ctb.saldos_abertura.conferidos`, `ctb.saldos_abertura.implantados` |
| nível_automação (provisório) | Próprio (conferência); carga no core B (Domínio, Alterdata) ou F (Contmatic), como CTB-017 |
| fontes_descoberta | [L1], [L4], [L7] · transversal: D1 (SOC-023), D2 (FIS-105) |

### CTB-104 · Fazer o de-para do plano de contas herdado e o registro I157

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Contábil / Entrada (transição) |
| etapa | Entrada, Manutenção |
| atividade | Relacionar cada conta analítica do plano do contador anterior com o plano padrão do escritório, manter a tabela de-para e garantir o registro I157 da ECD (transferência de saldos do plano anterior) no primeiro exercício e sempre que o plano mudar |
| descrição | Fornecedor de core informa que o I157 é obrigatório quando o plano muda de um período para o outro ou quando há troca de escritório no mesmo período, e que o PVA acusa erro quando a conta recuperada da escrituração anterior não existe no primeiro mês da atual; a conferência é "saldos I157 × I155" [L5]. Contas com saldo zero e saldos finais idênticos não são relacionadas automaticamente pelo core [L5] |
| gatilho_frequência | Por evento (entrada do cliente; mudança de plano); anual (ECD) |
| porte_alcance | Clientes com escrituração completa |
| quem_faz | Analista contábil |
| onde_é_feita_hoje | Core (tela do I157), planilha de de-para |
| entradas / saídas | Plano antigo (ECD recuperada, CTB-102), plano padrão do escritório → tabela de-para versionada, I157 sem erro no PVA |
| base_legal | Leiaute da ECD, registro I157 (manual da RFB) `[NÃO VERIFICADO]` no manual oficial; descrição pelo fornecedor [L5] |
| risco_se_falhar | ECD barrada no validador perto do prazo; comparabilidade entre exercícios perdida; ECF com erro no J050 |
| tempo_estimado | 1–4 h por cliente na entrada `[ESTIMATIVA]` |
| concorrentes | Alterdata (relacionamento automático parcial a partir da ECD anterior) [L5]; Omie (orientação de de-para) [L5] |
| hipótese_automação | O agente sugere o de-para por nome, natureza, grau e saldo, inclusive contas zeradas e saldos repetidos que o core não resolve; o analista aprova; a tabela vira insumo das regras de classificação (CTB-016) e do I157 |
| papel_da_ia | M2 ler; M3 executar (casamento de contas); M4 rascunhar (de-para para aprovação) |
| ferramentas_agênticas | `sugerir_depara_plano(cliente_id, plano_origem, plano_destino)`, `validar_i157(cliente_id, exercicio)` |
| eventos_timesheet | `ctb.depara.aprovado` |
| nível_automação (provisório) | Próprio (sugestão e validação); F (o I157 é gerado no core) |
| fontes_descoberta | [L5] |

### CTB-105 · Dividir a ECD, a ECF e as demonstrações do ano da troca de contador

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Contábil / Entrada e Desligamento (transição) |
| etapa | Entrada, Desligamento |
| atividade | Quando a troca ocorre no meio do exercício, combinar e controlar quem elabora as demonstrações até a data de corte, quem transmite cada arquivo da ECD do ano (o do anterior, com encerramento na data de corte, e o do sucessor, começando no dia seguinte), quem assina a ECF e quem colhe a carta de responsabilidade do período |
| descrição | Pela Res. CFC 1.590/2020, as demonstrações do período da responsabilidade técnica cabem ao rescindente, salvo disposição em contrário no distrato (art. 9º, parágrafo único), e as acessórias de competência ocorrida na vigência do contrato também (art. 10) [L1]. Fonte de mercado descreve a ECD dividida em dois arquivos, com datas encadeadas e I157 no segundo [L4]. SOC-104 trata o acordo de corte em geral; aqui ficam os artefatos contábeis |
| gatilho_frequência | Por evento (troca no meio do ano), na entrada e na saída |
| porte_alcance | Clientes com escrituração completa que trocam de escritório no meio do exercício |
| quem_faz | Coordenador contábil; sócio |
| onde_é_feita_hoje | E-mail e telefone entre escritórios |
| entradas / saídas | Data de corte (SOC-104) → matriz de responsabilidades do exercício (demonstrações, ECD parte 1 e 2, ECF, carta), prazos no calendário, comprovantes |
| base_legal | Res. CFC 1.590/2020, arts. 3º, 9º e 10 [L1]; IN RFB 2.003/2021, art. 5º [L2]; se a ECF anual pode ter dois responsáveis técnicos `[NÃO VERIFICADO]` |
| risco_se_falhar | ECD do ano entregue por ninguém ou em duplicidade; multa por atraso; responsabilidade por período alheio |
| tempo_estimado | 1–3 h por cliente, espalhadas no ano `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Ao registrar a data de corte, o agente gera a matriz do exercício com os dois arquivos da ECD, a ECF e as demonstrações, põe os prazos no calendário do cliente e do escritório e cobra a parte do outro escritório por e-mail com modelo |
| papel_da_ia | M1 ler (Res. 1.590, IN 2.003); M2 ler; M4 rascunhar e executar lembretes |
| ferramentas_agênticas | `matriz_responsabilidade_exercicio(cliente_id, data_corte)`, `gerar_calendario(cliente, competencia)` |
| eventos_timesheet | `ctb.transicao.matriz_criada` |
| nível_automação (provisório) | Próprio (a transmissão segue F, pelo core) |
| fontes_descoberta | [L1], [L2], [L4] · transversal: D1 (SOC-104, SOC-107), D2 (FIS-102) |

### CTB-106 · Diagnosticar a escrituração herdada e propor a regularização

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Contábil / Entrada (diagnóstico) |
| etapa | Entrada |
| atividade | Avaliar a qualidade da contabilidade recebida: contas transitórias com saldo, caixa estourado, conta de sócio sem explicação, imobilizado sem controle ou sem depreciação, lucros distribuídos acima do lucro escriturado, provisões ausentes, ECD ou ECF faltantes; quantificar os erros de exercícios anteriores e propor ao cliente o tratamento (ajuste retrospectivo, lançamentos extemporâneos, retificação) como serviço extra |
| descrição | A ITG 2000 (R1), itens 31 a 36, admite retificação por estorno, transferência ou complementação, com histórico que indique motivo, data e lançamento de origem; erros de períodos anteriores seguem a NBC TG 23 (ou a seção 10 da NBC TG 1000 para PME), com ajuste retrospectivo e nota explicativa [L8] (fonte secundária). Fornecedor de core lembra que lançamento extemporâneo não vai a conta de resultado [L8]. A NBC PG 01 manda comunicar ao cliente, em documento reservado, circunstância adversa (citado em D1 SOC-102) |
| gatilho_frequência | Por evento (primeiros 30 a 60 dias do cliente vindo de outra contabilidade) |
| porte_alcance | Clientes que trocam de escritório |
| quem_faz | Contador sênior; sócio |
| onde_é_feita_hoje | Análise do balancete no core e no Excel; quando há |
| entradas / saídas | Balancete de corte, ECD recuperada (CTB-102), saldos conferidos (CTB-103) → relatório de diagnóstico com valor estimado de cada ajuste, proposta de regularização, ciência do cliente |
| base_legal | ITG 2000 (R1), itens 31–36; NBC TG 23; NBC TG 1000, seção 10 [L8] (não lidos no original) |
| risco_se_falhar | O escritório herda e assina demonstrações com erro alheio; distribuição de lucros sem lastro (CTB-033); trabalho de regularização feito de graça |
| tempo_estimado | 3–12 h por cliente `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Bateria de testes sobre o balancete e a ECD herdados (mesmos alertas de CTB-021 e CTB-025, mais lucro distribuído × lucro escriturado e ECD/ECF faltantes); o agente monta o relatório e a proposta de serviço extra; o contador decide o tratamento |
| papel_da_ia | M2 ler; M3 executar (testes); M1 ler (norma de retificação); M4 rascunhar (relatório e proposta) |
| ferramentas_agênticas | `diagnostico_contabil_entrada(cliente_id)`, `alertas_balancete(cliente, mes)` |
| eventos_timesheet | `ctb.diagnostico.entregue` |
| nível_automação (provisório) | Próprio |
| fontes_descoberta | [L8] · transversal: D1 (SOC-102), D2 (FIS-103) |

### CTB-107 · Reconstituir escrituração atrasada ou inexistente herdada

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Contábil / Entrada (regularização) |
| etapa | Entrada |
| atividade | Quando o cliente chega sem escrituração completa (só livro caixa ou nada) ou com meses e anos sem lançamento, reconstituir a contabilidade dos períodos necessários a partir de extratos, notas e folha, gerar e transmitir ECD e ECF atrasadas ou substitutas e regularizar a base da distribuição de lucros |
| descrição | Projeto pesado, comum em cliente do Simples que passou a distribuir lucros acima da presunção ou que precisa de balanço para crédito. Retificar um ano pode exigir retificar os seguintes; a ECF pode ser retificada em até 5 anos [L8] (fontes secundárias); o limite para substituir a ECD (CTG 2001 citada em fórum) diverge do prazo decadencial `[NÃO VERIFICADO]` |
| gatilho_frequência | Por evento (cliente novo com escrituração atrasada; pedido de banco ou licitação) |
| porte_alcance | Simples e Presumido sem escrituração completa; clientes de escritórios que não escrituravam |
| quem_faz | Analista contábil; contador revisor |
| onde_é_feita_hoje | Core, digitação de extratos antigos, planilhas |
| entradas / saídas | Extratos históricos, XMLs, folha → lançamentos dos períodos, ECD e ECF transmitidas, livro caixa substituído |
| base_legal | LC 123/2006, arts. 26 e 27 (livro caixa ou escrituração) [T9]; IN RFB 2.003/2021 [L2]; IN RFB 2.004/2021 [L3]; CTG 2001 `[NÃO VERIFICADO]` |
| risco_se_falhar | Lucros distribuídos tributáveis por falta de escrituração; multa por ECD/ECF em atraso; balanço recusado por banco ou licitação |
| tempo_estimado | 4–40 h por exercício reconstituído `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` (ROIT e Conta Azul classificam o mês corrente; carga histórica não encontrada) |
| hipótese_automação | O mesmo motor de CTB-009 e CTB-015 rodando em lote sobre extratos e XMLs antigos (Open Finance só cobre cerca de 12 meses, ver achado 10; antes disso, PDF e OFX do cliente); o agente propõe os lançamentos por competência, o contador revisa, e o lote vai ao core |
| papel_da_ia | M2 ler; M3 executar (classificação em lote); M4 rascunhar (lote para o core) |
| ferramentas_agênticas | `reconstituir_periodo(cliente_id, inicio, fim)`, `exportar_para_core(cliente, competencia, core)` |
| eventos_timesheet | `ctb.reconstituicao.periodo_concluido` |
| nível_automação (provisório) | Próprio (classificação); B ou F (carga no core) |
| fontes_descoberta | [L2], [L3], [L8], [T9] |

### CTB-108 · Implantar a contabilidade da empresa nova

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Contábil / Entrada (abertura) |
| etapa | Entrada |
| atividade | Para a empresa recém-aberta: escolher o plano de contas do porte e da atividade, definir escrituração completa ou livro caixa, registrar a constituição (capital subscrito, a integralizar e integralizado, conforme o contrato social), definir a data de início da escrituração, cadastrar no core e preparar o primeiro checklist de documentos e a primeira ECD (termo de abertura) |
| descrição | Na Junta basta provar a subscrição do capital, não a integralização [L12]; o lançamento segue a data de subscrição e de integralização [L12] (fórum). O termo de abertura do livro vai no registro I030 da ECD [L12], e o recibo da ECD prova a autenticação para empresas mercantis (IN RFB 2.003/2021, art. 6º) [L2]. Fórum registra dúvida sobre ECD de empresa que só tem o lançamento do capital [L12]. A abertura legal é de D1 (SOC-105); aqui fica a parte contábil |
| gatilho_frequência | Por evento (cada empresa aberta pelo escritório) |
| porte_alcance | Empresas novas |
| quem_faz | Analista contábil; coordenador |
| onde_é_feita_hoje | Core; contrato social em PDF |
| entradas / saídas | Contrato social, regime escolhido, conta bancária → plano de contas, lançamento de constituição, cadastro no core, checklist inicial (CTB-001), marco da primeira ECD no calendário |
| base_legal | IN RFB 2.003/2021, art. 6º [L2]; leiaute da ECD, registro I030 [L12] |
| risco_se_falhar | Capital lançado errado (afeta lucro distribuível e JCP); escrituração começando tarde; empresa nova sem ECD quando passa a distribuir lucros |
| tempo_estimado | 1–2 h por empresa `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | O agente lê o contrato social (capital, sócios, forma e prazo de integralização), sugere o plano de contas pelo CNAE e porte, gera o lançamento de constituição e o cronograma de integralização a vigiar, e abre o checklist e o calendário do primeiro exercício |
| papel_da_ia | M2 ler (contrato social); M1 ler (escrituração exigida pelo regime); M4 rascunhar (lançamentos e cadastro) |
| ferramentas_agênticas | `implantar_contabilidade_nova(cliente_id)`, `gerar_checklist_documentos(cliente)` |
| eventos_timesheet | `ctb.implantacao.concluida` |
| nível_automação (provisório) | Próprio; cadastro e lançamentos no core B ou F |
| fontes_descoberta | [L2], [L12] · transversal: D1 (SOC-105) |

### CTB-109 · Entregar o pacote contábil de transferência ao sucessor

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Contábil / Desligamento (saída para outro contador) |
| etapa | Desligamento |
| atividade | Quando o escritório sai: fechar a contabilidade até a data de corte, elaborar as demonstrações do período, entregar ao sucessor balancete e razão de corte, plano de contas, arquivo de lançamentos, ECD e ECF transmitidas com recibos e os controles mantidos fora do core (imobilizado, estoque de lucros até 2025, lucros pagos e IRRF por sócio, parcelamentos, contratos de empréstimo) |
| descrição | A Res. CFC 1.590/2020 põe a cargo do rescindente as demonstrações do seu período (art. 9º, parágrafo único), manda fixar no distrato a forma e o prazo de devolução de livros, documentos e arquivos eletrônicos (art. 9º) e comunicar ao sucessor os fatos de que deva saber (art. 8º) [L1]. CTB-050 entrega o acervo de documentos e SOC-107 cuida da carta e das acessórias; faltava o pacote contábil, em especial os controles que só existem na plataforma (CTB-034, CTB-036, CTB-047), sem os quais o sucessor perde o histórico de lucros e depreciação |
| gatilho_frequência | Por evento (cada saída de cliente) |
| porte_alcance | Clientes com escrituração completa que saem para outro escritório |
| quem_faz | Coordenador contábil |
| onde_é_feita_hoje | Core, pasta de rede, e-mail |
| entradas / saídas | Data de corte, distrato → demonstrações do período, pacote com índice (balancete, razão, plano, lançamentos, SPED e recibos, controles extracontábeis em planilha), termo de entrega |
| base_legal | Res. CFC 1.590/2020, arts. 7º a 10 [L1] |
| risco_se_falhar | Infração ética por reter ou atrasar a entrega; sucessor sem base de lucros e depreciação; conflito com o cliente |
| tempo_estimado | 2–6 h por cliente `[ESTIMATIVA]` |
| concorrentes | Gestta (link de download do acervo de documentos) [C5]; pacote contábil com controles `[NÃO ENCONTRADO]` |
| hipótese_automação | Ao registrar o distrato, o agente lista o que precisa estar fechado até a data de corte, cobra as pendências internas e gera o pacote padronizado (exportação do core mais os controles da plataforma em planilha), com termo de entrega para assinatura |
| papel_da_ia | M2 ler; M4 executar (pacote, com aprovação do coordenador) |
| ferramentas_agênticas | `pacote_transferencia_contabil(cliente_id, data_corte)`, `pacote_entrega_documentos(cliente, periodo)`, `enviar_para_assinatura(documento, signatarios)` |
| eventos_timesheet | `ctb.transferencia.pacote_entregue` |
| nível_automação (provisório) | Próprio; exportação do core F |
| fontes_descoberta | [L1], [C5] · transversal: D1 (SOC-024, SOC-107) |

### CTB-110 · Encerrar a contabilidade na baixa: balanço de liquidação, ECD e ECF de extinção

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Contábil / Desligamento (baixa) |
| etapa | Desligamento |
| atividade | Na dissolução e liquidação: levantar o balanço de abertura da liquidação e os balanços do estado da liquidação, registrar realização de ativos, pagamento do passivo e partilha do acervo aos sócios, preparar o relatório e as contas finais do liquidante, e transmitir a ECD e a ECF de situação especial (extinção) no prazo do evento |
| descrição | O Código Civil manda o liquidante arrecadar bens, livros e documentos, apresentar balanço do estado da liquidação a cada seis meses e, ao fim, o relatório e as contas finais; a sociedade se extingue com a averbação da ata que aprova as contas (arts. 1.103, 1.108 e 1.109) [L9]. A RFB considera extinta a PJ no encerramento da liquidação, com a destinação total do acervo [L9]. ECD de extinção: evento de janeiro a maio, até o último dia útil de junho; de junho a dezembro, até o último dia útil do mês seguinte ao evento (IN RFB 2.003/2021, art. 5º, §3º, redação da IN 2.142/2023) [L2]. ECF de extinção: evento de janeiro a abril, até o último dia útil de julho; de maio a dezembro, até o último dia útil do 3º mês seguinte (IN RFB 2.004/2021, art. 3º, §2º) [L3]. Isso responde em parte à lacuna 12 |
| gatilho_frequência | Por evento (baixa de empresa com escrituração completa) |
| porte_alcance | Clientes com escrituração completa que encerram |
| quem_faz | Contador; societário (D1) |
| onde_é_feita_hoje | Core; Junta; prazos de memória |
| entradas / saídas | Distrato ou ata de dissolução, data do evento → balanços de liquidação, lançamentos de partilha, contas finais, ECD e ECF de extinção com recibos, livros arquivados |
| base_legal | Código Civil, arts. 1.103, 1.108 e 1.109 [L9]; IN RFB 2.003/2021, art. 5º, §3º [L2]; IN RFB 2.004/2021, art. 3º, §2º [L3] |
| risco_se_falhar | Multa por ECD ou ECF atrasada; baixa travada por pendência; partilha sem lastro (tributação do sócio) |
| tempo_estimado | 4–10 h por empresa `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | O agente calcula os prazos de ECD e ECF a partir da data do evento (regra versionada), monta o roteiro de lançamentos de liquidação e partilha, rascunha o relatório e as contas finais do liquidante e vigia a averbação para fechar o calendário do cliente |
| papel_da_ia | M1 ler (prazos e regras); M3 executar (prazos, partilha); M4 rascunhar (contas finais) |
| ferramentas_agênticas | `prazos_situacao_especial(cliente_id, data_evento, tipo)`, `roteiro_liquidacao_contabil(cliente_id)` |
| eventos_timesheet | `ctb.baixa.ecd_ecf_transmitidas` |
| nível_automação (provisório) | Próprio (prazos e roteiro); F (ECD e ECF geradas e transmitidas pelo core) |
| fontes_descoberta | [L2], [L3], [L9] · transversal: D1 (SOC-031), D2 (FIS-110) |

### CTB-111 · Encerrar consentimentos do Open Finance e integrações de dados do ex-cliente

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Contábil / Desligamento |
| etapa | Desligamento |
| atividade | Na saída do cliente (ou na baixa), revogar os consentimentos do Open Finance, desligar as chaves de API do ERP do cliente e de adquirentes, parar a coleta automática de extratos e arquivar as regras de classificação do cliente |
| descrição | A Res. Conjunta 1/2020 garante a revogação do consentimento a qualquer tempo [L10]; uso de dados fora da finalidade ou após o prazo é apontado como violação da regulação e da LGPD [L10] (artigo de opinião). A Res. Conjunta 21/2026 alterou o fluxo de consentimento [L10] (conteúdo não lido). FIS-109 e SOC-108 cobrem monitores fiscais e descarte; os conectores contábeis (CTB-007, CTB-010, CTB-012, CTB-013) ficavam ligados |
| gatilho_frequência | Por evento (saída ou baixa) |
| porte_alcance | Clientes com Open Finance ou ERP conectado |
| quem_faz | Coordenador; TI |
| onde_é_feita_hoje | Não é feito ou é feito caso a caso `[NÃO VERIFICADO]` |
| entradas / saídas | Lista de conexões ativas do cliente → consentimentos revogados, chaves desativadas, registro de encerramento |
| base_legal | Res. Conjunta BCB/CMN 1/2020 (revogação) [L10]; Lei 13.709/2018, art. 16 (via D1 SOC-108) |
| risco_se_falhar | Coleta de dados de quem não é mais cliente (LGPD); custo de agregador por conexão ociosa |
| tempo_estimado | 15–30 min por cliente `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | O evento "cliente desligado" dispara a revogação no agregador e a desativação dos conectores, com relatório para o cliente |
| papel_da_ia | M4 executar (com aprovação) |
| ferramentas_agênticas | `encerrar_conexoes_cliente(cliente_id)` |
| eventos_timesheet | `ctb.conexoes.encerradas` |
| nível_automação (provisório) | B (revogação pela API do agregador; endpoint `[NÃO VERIFICADO]`) |
| fontes_descoberta | [L10] · transversal: D1 (SOC-108), D2 (FIS-109) |

### Classificação das 52 fichas por etapa (rodada 3)

| Etapa | Fichas |
| --- | --- |
| Entrada e Manutenção | CTB-001, CTB-007, CTB-010, CTB-011, CTB-014, CTB-016, CTB-022, CTB-036, CTB-043, CTB-047 |
| Manutenção e Desligamento | CTB-041, CTB-042, CTB-046, CTB-050 |
| Só Manutenção | CTB-002 a CTB-006, CTB-008, CTB-009, CTB-012, CTB-013, CTB-015, CTB-017 a CTB-021, CTB-023 a CTB-035, CTB-037 a CTB-040, CTB-044, CTB-045, CTB-048, CTB-049, CTB-051, CTB-052 |

Nível D dividido: **CTB-044** D-assistido (o agente calcula o prazo, prepara as demonstrações e o texto; a pessoa publica na Central de Balanços ou no jornal e arquiva na Junta) · **CTB-049** D-assistido (o agente gera os alertas e o rascunho da avaliação; o contador decide e envia a declaração no sistema do CFC com o próprio login; a avaliação de suspeita fica com o humano).

### Fontes da rodada 3 (consultadas em 06/11/2026)

- [L1] CFC, Resolução CFC nº 1.590/2020 (arts. 2º a 4º, 6º a 10 e 14) — texto lido: https://www1.cfc.org.br/sisweb/SRE/docs/RES_1590.pdf
- [L2] IN RFB nº 2.003/2021, texto compilado (art. 5º, §3º, redação da IN RFB 2.142/2023; art. 6º) — texto lido em Normas Legais: https://www.normaslegais.com.br/legislacao/instrucao-normativa-rfb-2003-2021.htm ; IN RFB 2.142/2023: https://www.normaslegais.com.br/legislacao/instrucao-normativa-rfb-2142-2023.htm (conferir no Sijut2/DOU)
- [L3] IN RFB nº 2.004/2021 (art. 3º, §2º) — texto lido em Normas Legais: https://www.normaslegais.com.br/legislacao/instrucao-normativa-rfb-2004-2021.htm (conferir alterações posteriores no Sijut2)
- [L4] Contabilizei, "ECD troca de contador: como declarar?" (data não exibida) — texto lido; fonte comercial: https://www.contabilizei.com.br/contabilizei-responde/ecd-troca-de-contador/
- [L5] Alterdata, "C102 - SPED ECD - Registro I157" — texto lido: https://ajuda.alterdata.com.br/prosoftcontabil/c102-sped-ecd-registro-i157-148472626.html ; Omie, "SPED ECD: entendendo o registro I157" — trecho do buscador: https://ajuda.omie.com.br/pt-BR/articles/14742470-sped-ecd-entendendo-o-registro-i157-e-o-relacionamento-entre-planos-de-contas
- [L6] Domínio (Thomson Reuters), "Como baixar SPED ECF da RFB para recuperação? (Receita BX)" — texto lido: https://suporte.dominioatendimento.com/central/faces/solucao.html?codigo=13087 ; Fórum Contábeis, "Como recuperar a ECD enviada" — trecho do buscador: https://www.contabeis.com.br/forum/contabilidade/257927/como-recuperar-a-ecd-enviada/
- [L7] Jornal Contábil, "O que são saldos iniciais na contabilidade?" — trecho do buscador: https://jornalcontabil.com.br/noticia/o-que-sao-saldos-iniciais-na-contabilidade/ ; Fórum Contábeis, "Troca de contador saldos" — trecho do buscador: https://www.contabeis.com.br/forum/contabilidade/35620/troca-de-contador-saldos/
- [L8] Contábeis, "Errar é humano, mas como contabilizar a correção do erro?" (ITG 2000 itens 31–36, NBC TG 23, NBC TG 1000 seção 10) — trecho do buscador: https://www.contabeis.com.br/artigos/6669/errar-e-humano-mas-como-contabilizar-a-correcao-do-erro/ ; Alterdata, "SPED ECD - lançamentos extemporâneos" — trecho do buscador: https://ajuda.alterdata.com.br/bdcc/sped-ecd-tudo-o-que-voce-precisa-saber-sobre-lancamentos-extemporaneos-95068789.html ; CRC-MS, "Como retificar a ECF entregue?" — trecho do buscador: https://crcms.org.br/?p=20529
- [L9] Código Civil, arts. 1.103, 1.108 e 1.109 (LegJur) — trecho do buscador: https://www.legjur.com/legislacao/nivel/lei_00104062002/-capitulo-ix-da-liquidacao-da-sociedade ; RFB, Perguntas e Respostas DIPJ 2014, cap. IV (extinção no encerramento da liquidação) — trecho do buscador: https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/declaracoes-e-demonstrativos/dipj/respostas-2014/capitulo-iv-responsabilidade-na-sucessao-2014.pdf
- [L10] Migalhas, "O consentimento no open banking e na LGPD" (revogação na Res. Conjunta 1/2020) — trecho do buscador: https://www.migalhas.com.br/depeso/340101/o-consentimento-no-open-banking-e-na-lgpd ; Mattos Filho, renovação de consentimento (Res. Conjunta 7/2023) — trecho do buscador: https://www.mattosfilho.com.br/unico/bcb-renovacao-open-finance/ ; Atlas Público, Resolução Conjunta nº 21, de 22/10/2026 — trecho do buscador: https://atlaspublico.com.br/regulacao/dou/resolucao-conjunta-n-21-de-22-de-outubro-de-2026-875294 ; Cria.AI (uso após o prazo e LGPD, opinião) — trecho do buscador: https://criaai.app.br/blog/open-finance-quais-contratos-precisam-acompanhar-a-nova-arquitetura-de-dados/
- [L11] Omie, "Honorários contábeis: como calcular, precificar e reajustar" (cita pesquisa Sescon-SP) — trecho do buscador: https://www.omie.com.br/blog/honorarios-contabeis-como-calcular-precificar-e-reajustar/ ; Alterdata, "Controle gerencial" — trecho do buscador: https://ajuda.alterdata.com.br/financeiro/relatorios-e-consultas-pack-financeiro/consultas-pack-financeiro/controle-gerencial ; Fórum Contábeis, "Como quantificar número de lançamentos contábeis em contrato" — trecho do buscador: https://www.contabeis.com.br/forum/contabilidade/229519/como-quantificar-numero-de-lancamentos-contabeis-em-contrato/
- [L12] VRi Consulting, "Registro I030 da ECD - termo de abertura do livro" — trecho do buscador: https://vriconsulting.com.br/guias/guiasIndex.php?idGuia=667 ; Mercado Pago, "Capital social integralizado" (subscrição basta na Junta) — trecho do buscador: https://www.mercadopago.com.br/blog/o-que-significa-integralizar-capital-social ; Fórum Contábeis, "Lançamento capital social integralizado" — trecho do buscador: https://www.contabeis.com.br/forum/topicos/65916/lancamento-capital-social-integralizado ; Portal SPED Brasil, "Empresa só com capital social entrega ECD/ECF?" — trecho do buscador: https://portalspedbrasil.com.br/?p=15498

**Lacunas da rodada 3:** Sijut2 e Planalto não foram abertos (IN 2.003, IN 2.004 e Código Civil lidos em compilação de terceiro ou por trecho); se a ECF do ano da troca pode ter dois responsáveis técnicos não foi encontrado; existência de API para baixar ECD/ECF transmitidas (CTB-102) não encontrada; limite de substituição da ECD (CTG 2001) × prazo decadencial segue em aberto; prazo para a receptora apagar dados após revogação no Open Finance não encontrado; ITG 2000 e NBC TG 23 não lidas no original.

# B1 · Financeiro do próprio escritório (módulo FIN)

- **Data:** 06/11/2026
- **Escopo:** todo o financeiro do escritório de contabilidade como módulo da plataforma: contratos e honorários recorrentes, faturamento (fixos, avulsos, 13º, reembolsos), NFS-e própria e retenções, boleto, Pix e Pix Automático, régua de cobrança e inadimplência, conciliação, contas a pagar, fluxo de caixa, DRE, centros de custo, rentabilidade, reajuste, comissões, previsão de receita, suspensão por inadimplência e integração com o desligamento.
- **Método:** conferido o inventário de 420 atividades. Boa parte do tema já existe em GES (D7): GES-001 a GES-015, GES-046, GES-055, GES-103 e GES-109. Só foram criadas fichas para o que faltava (FIN-001 a FIN-014). Fontes lidas com curl em 06/11/2026; quando a informação veio só do resumo do buscador, a fonte está marcada assim.

## 1. O que já está no inventário (não duplicar)

| Tema pedido | Ficha existente |
| --- | --- |
| Cobrança mensal por boleto, Pix e Pix Automático | GES-001 |
| Serviços avulsos fora do escopo | GES-002, SOC-017 |
| Baixa de recebimentos | GES-003 |
| Régua de cobrança | GES-004 |
| Acordos de atraso | GES-005 |
| Decisão de suspensão, protesto, negativação e distrato | GES-006 |
| NFS-e do escritório | GES-007 |
| Retenções de IRRF, CSRF e ISS sobre os honorários | GES-008 |
| 13º honorário e cobranças anuais | GES-009 |
| Repasse de custos de APIs e consultas | GES-010 |
| Indicadores (MRR, churn, inadimplência, painel de caixa) | GES-011 |
| Comissão de parceiros e indicadores | GES-012 |
| Rentabilidade por cliente e custo-hora | GES-013, GES-055 |
| Reajuste anual | GES-014, SOC-018 |
| Cliente acima da faixa contratada | GES-015 |
| Acerto financeiro no desligamento | GES-046, GES-109 |
| Primeira cobrança do cliente novo | GES-103 |
| Tributos, folha e certidões do próprio escritório | GES-061 |

## 2. Achados

1. **O financeiro do escritório já tem dono no mercado, e os líderes já falam com IA.** O Conexa Contabilidade cobre contratos (com minuta e assinatura eletrônica), serviços avulsos, reajuste por regra, régua de cobrança com WhatsApp, NFS-e antes ou depois da liquidação, contas a pagar, DRE, fluxo de caixa, rateio por centro de custo, MRR, churn, CAC e LTV, e é o único que anuncia gestão do 13º honorário. Os planos são Start, Growth e Scale, para escritórios com mais de 80 clientes ativos [F2]. O preço não é público (o B2B Stack mostra "sob consulta") [F31]. O Conexa já oferece um **servidor MCP** com OAuth para consultar e **executar** ações (cadastros, edições, cobranças) a partir da IA do usuário [F3]. Nibo ("MCP Nibo Contador") [F10] e Acessórias ("Acessórias MCP") [F22] também anunciam MCP. "Conversar com o financeiro" deixou de ser diferencial. O diferencial está em ligar o financeiro à operação: horas do timesheet, tarefas, app, desligamento e suspensão.
2. **HubStrom e Acessórias não têm financeiro.** O menu da HubStrom lista MonitorHub, ConnectHub, XMLHub, TaskHub, DriveHub e AppHub, sem módulo de honorários [F21]. O menu da Acessórias também não tem financeiro, e a página de integrações cita Contmatic, Contabit, Consisa, Digisac, Jettax e Komunic, nenhum ERP de cobrança [F22]. Quem usa essas ferramentas soma um segundo sistema para o financeiro: Conexa, Omie, Nibo, Asaas, o módulo Honorários do Domínio ou planilha.
3. **Os cores já têm faturamento de honorários.** O Domínio Honorários roda rotinas automáticas de faturamento, boletos (inclusive pelo Domínio Conta PJ), NFS-e, relatórios em PDF e "Custos do Escritório" para quem usa o Onvio Custos [F16]. O Onvio Custos calcula custo por cliente a partir do Honorários e mostra clientes superavitários e deficitários (resumo do buscador) [F18]. O Controle Gerencial da Alterdata estima o honorário "ideal" com dados do Contábil, do Fiscal e do DP (resumo do buscador) [F19]. O Makro tem cadastro de honorários, cobranças adicionais vindas de outros departamentos e DRE gerencial (resumo do buscador) [F20]. A plataforma precisa importar desses módulos (FIN-014) ou conviver com eles.
4. **NFS-e: mudança de 01/11/2026.** Para competências a partir de 01/11/2026, ME e EPP do Simples emitem NFS-e **exclusivamente pelo Emissor Nacional (Web ou API)**, mesmo em município com emissor próprio. O Emissor Nacional barra emissões retroativas para municípios com emissor próprio, e essas continuam no sistema municipal [F23]. Muitos escritórios contábeis são do Simples, então GES-007 e FIN-011 têm agora uma API oficial única (produção restrita e produção) [F25]. Na orientação de 29/10/2026, os campos de IBS/CBS foram abertos no ADN e a falta deles não gera rejeição técnica [F24].
5. **Pix Automático já é infraestrutura.** O Asaas documenta Pix Automático com autorização prévia do pagador e criação manual ou automática das cobranças [F12]. Pela imprensa: lançamento em 16/06/2025 (Res. BCB 402), gratuito para o pagador, cancelável pelo pagador, recebedor com CNPJ ativo há pelo menos 6 meses (Res. BCB 482) e regras de reenvio (IN BCB 614) [F26] (confiança média, sem texto oficial lido; o site do BCB não renderiza por curl).
6. **Preços públicos lidos em 06/11/2026:**

| Produto | O que faz para o escritório | Preço público |
| --- | --- | --- |
| Conexa Contabilidade [F2][F31] | Contratos, 13º, reajuste, régua, NFS-e, contas a pagar, DRE, centro de custo, MCP | Não público (Start, Growth, Scale) |
| Conta Azul (ERP) [F4] | ERP financeiro genérico usado pelo próprio escritório | Quatro faixas por faturamento: "a partir de" R$ 179,90 a R$ 929,90/mês, conforme plano e vigência |
| Conta Azul Mais [F5] | Plataforma do contador sobre o ERP dos **clientes**; não fatura honorários | Gratuita; licenças Pro a partir de R$ 199,90/mês e Pro BPO R$ 129,90/mês (nível Bronze, mínimo 3) |
| Omie [F6][F7][F8] | Contratos, NFS-e em qualquer município, despesas reembolsáveis, Omie Bank (DDA, aprovação, negativação, régua) | ERP Padrão a partir de R$ 339/mês |
| Nibo Gestão Financeira [F9] | Light: NFS-e, boletos, conciliação; Plus: centros de custo e rateio; Premium: orçamento, reembolsáveis, lote, CNAB Itaú/Inter, API | R$ 166, R$ 250 e R$ 383/mês (referência no anual) |
| Granatum [F13] | Contas, conciliação, metas, orçamento, fluxo, DRE, NFS-e, boleto e Pix ilimitados | R$ 396/mês, preço único |
| Asaas [F11] | Conta, cobrança, régua, NFS-e, negativação | Conta grátis; Pix e boleto R$ 1,59 (R$ 0,79 por 3 meses); NFS-e R$ 0,49; WhatsApp R$ 0,55; negativação R$ 9,90 |
| iugu [F15] | Recorrência com pró-rata, itens avulsos e retentativas | Mensalidade "consulte"; terceiros citam Pix 0,99% e boleto R$ 2,19 + R$ 0,40 (baixa confiança) |
| Bling [F14] | ERP de varejo; boletos no plano Diamante | Cobalto R$ 60, Titânio R$ 120, Diamante R$ 650/mês (mensal) |
| Domínio Honorários / Onvio Custos [F16][F18] | Faturamento, boletos, NFS-e, custo por cliente | Não público |
| Kobana [F27] | API de boleto, Pix, DDA, pagamentos em lote e extratos | Não público |
| Vindi / Superlógica [F29] | Recorrência e régua | Só em comparadores (baixa confiança) |

7. **O que ninguém faz (fichas com dif alto):** DRE por setor alimentada pelo timesheet automático dos cores (FIN-006); suspensão por inadimplência ligada à operação contábil, com trava ética e reativação automática (FIN-009); divisão do resultado entre sócios por carteira e produção (FIN-012); migração assistida do financeiro (FIN-014).
8. **Lacunas:** preço do Conexa, do Domínio Honorários, do Kobana e da Pluggy; leiaute dos eventos de cancelamento e substituição da NFS-e Nacional; tratamento do reembolso de despesas na base do ISS por município; textos oficiais do Pix Automático; Lei 10.101/2000 (PLR), não lida.

## 3. Fontes (consultadas em 06/11/2026)

- [F1] Conexa, página inicial: https://conexa.app/
- [F2] Conexa Contabilidade: https://conexa.app/conexa-contabilidade/
- [F3] MCP Conexa: https://conexa.app/mcp-conexa/
- [F4] Conta Azul, planos: https://contaazul.com/planos/
- [F5] Conta Azul para contadores: https://contaazul.com/contadores/ ; https://ajuda.contaazul.com/hc/pt-br/articles/21399468083725-O-que-%C3%A9-a-Conta-Azul-Mais (resumo do buscador)
- [F6] Omie, preços: https://www.omie.com.br/precos/
- [F7] Omie Bank: https://www.omie.com.br/omie-bank-lp/
- [F8] Omie para escritórios contábeis (atualizado em 02/09/2022): https://www.omie.com.br/blog/software-de-contabilidade-omie-para-escritorios-contabeis/index.md
- [F9] Nibo, planos e preços: https://www.nibo.com.br/empresa/planos-e-precos
- [F10] Nibo para contadores: https://www.nibo.com.br/contador
- [F11] Asaas, preços e taxas: https://www.asaas.com/precos-e-taxas
- [F12] Asaas, documentação do Pix Automático: https://docs.asaas.com/docs/pix-automatico
- [F13] Granatum, preço: https://www.granatum.com.br/financeiro/precos-planos
- [F14] Bling, planos: https://www.bling.com.br/planos-e-precos
- [F15] iugu, página inicial: https://www.iugu.com/ ; tarifas segundo terceiros (16/10/2026): https://quasa.io/pt/media/asaas-ou-iugu-tarifa-publicada-vence-ate-o-volume-pedir-proposta (resumo do buscador)
- [F16] Domínio, Rotinas Automáticas Honorários: https://suporte.dominioatendimento.com/central/faces/solucao.html?codigo=4739
- [F17] Domínio Conta Digital, boleto: https://suporte.dominioatendimento.com/central/faces/solucao.html?codigo=9007 (resumo do buscador)
- [F18] Onvio Custos (lâmina): https://images.engage.es-pt.thomsonreuters.com/Web/LALEYSAEIMPRESORA/%7B53ebfa26-a0a8-4187-839d-eb9b8ebf495f%7D_DOMINIO_LAMINA_CUSTOS.pdf (resumo do buscador)
- [F19] Alterdata, Controle Gerencial: https://ajuda.alterdata.com.br/financeiro/relatorios-e-consultas-pack-financeiro/consultas-pack-financeiro/controle-gerencial (resumo do buscador)
- [F20] Makro Financeiro: https://makrosystem.com.br/controle-as-financas-do-seu-escritorio-contabil-com-o-makro-financeiro ; módulo Resultados: https://makrosystem.com.br/blog/modulo-resultados/ (resumo do buscador)
- [F21] HubStrom: https://hubstrom.com.br/
- [F22] Acessórias: https://www.acessorias.com/site/ ; integrações: https://acessorias.com/site/integracoes/
- [F23] CGNFS-e, obrigatoriedade do Emissor Nacional para o Simples (29/10/2026): https://www.gov.br/nfse/pt-br/noticias/nfs-e-informa-diretrizes-sobre-a-obrigatoriedade-da-emissao-da-nfs-e-nacional-para-optantes-do-simples-nacional
- [F24] CGNFS-e, leiaute e IBS/CBS (29/10/2026): https://www.gov.br/nfse/pt-br/noticias/nfs-e-nacional-confira-oas-rientacoes-sobre-leiaute-em-producao-regras-de-preenchimento-de-ibs-cbs-e-status-da-nota-tecnica-009
- [F25] NFS-e Nacional, documentação técnica e APIs: https://www.gov.br/nfse/pt-br/biblioteca/documentacao-tecnica
- [F26] Pix Automático na imprensa: https://finsidersbrasil.com.br/pagamentos/banco-central-adia-pix-automatico-para-junho-de-2025 ; https://convergenciadigital.com.br/governo/bc-estipula-regras-para-erros-no-pix-automatico/ ; https://paraibabusiness.com.br/banco-central-publica-regras-de-seguranca-para-uso-do-pix-automatico-saiba-quais/ (resumo do buscador)
- [F27] Kobana, API: https://docs.banking.kobana.com.br/en/api/overview/ (resumo do buscador)
- [F28] Pluggy: https://docs.pluggy.ai/docs/open-finance-regulated ; preço segundo agregador: https://www.toolmage.com/pt/tool/pluggy/ (resumo do buscador)
- [F29] Vindi e Superlógica: https://www.b2bstack.com.br/compare/superlogica-assinaturas-vs-vindi (resumo do buscador)
- [F31] Conexa no B2B Stack: https://www.b2bstack.com.br/product/conexa (resumo do buscador)

## 4. Fichas novas

### FIN-001 · Manter cada contrato de honorários como assinatura estruturada (itens, faixa contratada, v…

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Financeiro do escritório / Contratos e honorários recorrentes |
| etapa | Entrada, Manutenção, Desligamento |
| atividade | Manter cada contrato de honorários como assinatura estruturada (itens, faixa contratada, vencimento, meio de pagamento, índice e data-base, 13º, centro de custo) e mantê-la igual ao contrato assinado e aos aditivos |
| descrição | Hoje o contrato assinado (SOC-016) vive em PDF e os valores numa planilha ou no banco; aditivos, descontos temporários e itens com vigência própria se perdem e a cobrança sai errada. A plataforma extrai os itens do contrato assinado, cria a assinatura que alimenta GES-001, GES-009 e GES-014, e avisa quando contrato e cobrança divergem. |
| gatilho_frequência | Por evento (contrato novo, aditivo, reajuste, encerramento) e conferência mensal antes do faturamento |
| quem_faz | Financeiro / administrativo; sócio em escritório pequeno |
| base_legal | Res. CFC 1.590/2020, art. 2º (honorários por serviço, prazo de pagamento, reajuste, aditamento), via L1 [C1]; NBC PG 01, item 8 (cada serviço com valor, periodicidade e reajuste), via D7 [R24] |
| concorrentes | Conexa Contabilidade: contrato personalizado ou plano, serviços avulsos, reajuste por regra e gestão do 13º honorário [F2]; Omie: contratos com vigência por item, faturamento em lote e rateio por departamento [F8]; Domínio Honorários: faturamento por rotina automática [F16]; Makro Financeiro: cadastro de honorários e cobranças adicionais calculadas a partir de outros departamentos [F20]; iugu e Asaas: assinaturas com pró-rata e itens avulsos [F15][F12] |
| papel_da_ia | M2 ler contrato e aditivos assinados e extrair itens; M3 calcular proporcional e vigências; M4 rascunhar o cadastro e o aditivo, com execução após aprovação do financeiro |
| ferramentas_agênticas | `criar_assinatura_honorario(cliente, itens, vencimento, meio, indice, data_base)`, `aditar_assinatura(assinatura_id, alteracoes, vigencia)`, `conferir_contrato_x_cobranca(competencia)` |
| eventos_timesheet | `fin.fin-001` (setor FIN, atividade, cliente quando houver, duração) |
| nível_automação | Próprio |
| integrações | Própria (módulo de contratos da plataforma); ligação com assinatura eletrônica do SOC-016 |
| credencial_exigida | Nenhuma |
| preço | Sem custo de terceiros |
| confiança | alta |
| notas (dor/freq/risco/dif) | 3 / 3 / 4 / 2 |
| fontes | https://conexa.app/conexa-contabilidade/ (06/11/2026) ; https://www.omie.com.br/blog/software-de-contabilidade-omie-para-escritorios-contabeis/index.md (atualizado 02/09/2022; lido 06/11/2026) ; https://suporte.dominioatendimento.com/central/faces/solucao.html?codigo=4739 (06/11/2026) |

### FIN-002 · Registrar as despesas que o escritório adianta em nome do cliente (taxas de Junta, cartóri…

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Financeiro do escritório / Faturamento / reembolsos |
| etapa | Entrada, Manutenção, Desligamento |
| atividade | Registrar as despesas que o escritório adianta em nome do cliente (taxas de Junta, cartório, certidões pagas, Correios, guia paga para evitar multa) com o comprovante e cobrá-las como reembolso na fatura seguinte |
| descrição | O escritório paga a taxa da Junta ou o cartório e esquece de cobrar, ou cobra sem comprovante e gera atrito. A plataforma liga o pagamento ao cliente e ao processo (SOC, FIS), anexa o comprovante, inclui o valor como reembolso, separado do honorário, na próxima cobrança com recibo, e mede o que ficou sem reembolso. GES-010 trata do custo de APIs e consultas pagas; aqui entram os adiantamentos em dinheiro. |
| gatilho_frequência | Por evento; várias vezes por mês em escritórios com societário |
| quem_faz | Societário e financeiro |
| base_legal | Contrato de prestação de serviços (cláusula de despesas e reembolsos). Se o reembolso entra ou não na NFS-e e na base do ISS depende do município e do contrato `[NÃO VERIFICADO]` |
| concorrentes | Omie: despesas reembolsáveis não faturadas entram automaticamente no próximo faturamento do contrato, com recibos [F8]; Nibo Premium: "pagamento reembolsável" [F9]; demais `[NÃO ENCONTRADO]` |
| papel_da_ia | M2 ler o comprovante (OCR) e achar cliente e processo; M3 somar o que está pendente de reembolso; M4 incluir na próxima cobrança após conferência |
| ferramentas_agênticas | `registrar_despesa_reembolsavel(cliente, processo, valor, comprovante)`, `listar_reembolsos_pendentes(cliente)`, `incluir_reembolsos_na_fatura(competencia)` |
| eventos_timesheet | `fin.fin-002` (setor FIN, atividade, cliente quando houver, duração) |
| nível_automação | Próprio |
| integrações | Própria + provedor de cobrança (B) para incluir o item na fatura |
| credencial_exigida | Nenhuma |
| preço | Sem custo de terceiros além da cobrança |
| confiança | média |
| notas (dor/freq/risco/dif) | 3 / 3 / 3 / 3 |
| fontes | https://www.omie.com.br/blog/software-de-contabilidade-omie-para-escritorios-contabeis/index.md (06/11/2026) ; https://www.nibo.com.br/empresa/planos-e-precos (06/11/2026) |

### FIN-003 · Capturar as contas do escritório (boletos por DDA e e-mail, faturas de software, aluguel, …

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Financeiro do escritório / Contas a pagar |
| etapa | Manutenção |
| atividade | Capturar as contas do escritório (boletos por DDA e e-mail, faturas de software, aluguel, certificados, tributos próprios), classificar, aprovar por alçada, pagar e guardar o comprovante |
| descrição | Hoje o sócio recebe boletos por e-mail, paga no internet banking e lança na planilha; boleto falso, pagamento em duplicidade e juros por atraso são comuns. A plataforma lê o DDA e a caixa de e-mail, propõe categoria e centro de custo, pede aprovação de quem tem alçada e agenda o pagamento pela API do banco ou do agregador. |
| gatilho_frequência | Semanal (lotes de pagamento) e diária para captura |
| quem_faz | Financeiro; aprovação do sócio |
| base_legal | Não há obrigação legal específica; tributos próprios do escritório têm prazo legal (ver GES-061) |
| concorrentes | Omie Bank: DDA integrado, pagamentos em lote com controle de aprovação [F7]; Nibo Premium: CNAB de pagamento para Itaú e Inter [F9]; Conexa: despesas e contas a pagar [F2]; Granatum: contas a pagar e a receber [F13]; Kobana: API com DDA, pagamento em lote e aprovação centralizada [F27] |
| papel_da_ia | M2 ler boleto/fatura e achar fornecedor, categoria e centro de custo; M4 agendar pagamento só depois da aprovação humana; nunca paga sozinho |
| ferramentas_agênticas | `listar_boletos_dda()`, `capturar_conta_email(mensagem)`, `propor_pagamento(conta, categoria, centro_custo)`, `agendar_pagamento(conta_id, data, aprovador)` |
| eventos_timesheet | `fin.fin-003` (setor FIN, atividade, cliente quando houver, duração) |
| nível_automação | B |
| integrações | API do banco do escritório ou agregador bancário (Kobana [F27]; Omie Bank no ecossistema Omie [F7]); CNAB como alternativa (F) |
| credencial_exigida | Contrato comercial com banco ou agregador; token de API com permissão de pagamento |
| preço | Kobana `[PREÇO NÃO PÚBLICO]`; Asaas: pague contas grátis, Pix a PJ grátis até 30/mês e depois R$ 2,00, TED R$ 5,00 [F11] (06/11/2026) |
| confiança | média |
| notas (dor/freq/risco/dif) | 3 / 4 / 3 / 2 |
| fontes | https://www.omie.com.br/omie-bank-lp/ (06/11/2026) ; https://www.nibo.com.br/empresa/planos-e-precos (06/11/2026) ; https://docs.banking.kobana.com.br/en/api/overview/ (resumo do buscador, 06/11/2026) ; https://www.asaas.com/precos-e-taxas (06/11/2026) |

### FIN-004 · Conciliar todas as contas do escritório (bancos, conta de cobrança, cartão) com recebiment…

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Financeiro do escritório / Conciliação bancária |
| etapa | Manutenção |
| atividade | Conciliar todas as contas do escritório (bancos, conta de cobrança, cartão) com recebimentos, pagamentos, tarifas e transferências, e categorizar no plano de contas gerencial |
| descrição | GES-003 dá baixa nos honorários; sobra o resto do extrato: tarifas, saídas, transferências entre contas, rendimentos e lançamentos sem documento. Hoje é feito por OFX ou digitação, quando é feito. A plataforma puxa o extrato por API ou Open Finance, casa com contas a pagar e a receber e aplica regras aprendidas. |
| gatilho_frequência | Diária |
| quem_faz | Financeiro |
| base_legal | Não há; base para a escrituração do próprio escritório (GES-061) |
| concorrentes | Nibo Light: conciliação bancária inteligente e importação automática de extratos [F9]; Conexa: conciliação automática dos recebimentos [F1][F2]; Omie Bank: transações conciliadas automaticamente [F7]; Granatum: conciliação bancária [F13] |
| papel_da_ia | M2 sugerir correspondência e categoria pelo histórico; M4 aplicar regras aprovadas sozinho e mandar o resto para revisão |
| ferramentas_agênticas | `importar_extrato(conta, periodo)`, `conciliar_extrato(conta, periodo)`, `criar_regra_categorizacao(padrao, categoria, centro_custo)` |
| eventos_timesheet | `fin.fin-004` (setor FIN, atividade, cliente quando houver, duração) |
| nível_automação | B |
| integrações | Agregador de Open Finance (Pluggy, conectores regulados com contas e transações [F28]) ou API do banco/provedor de cobrança; OFX como alternativa (F) |
| credencial_exigida | Consentimento Open Finance do titular da conta (escritório) ou token do banco |
| preço | Pluggy: teste de 14 dias e plano a partir de R$ 2.500/mês segundo agregador de ferramentas, não confirmado no site oficial `[NÃO VERIFICADO]` [F28] |
| confiança | média |
| notas (dor/freq/risco/dif) | 3 / 5 / 3 / 2 |
| fontes | https://www.nibo.com.br/empresa/planos-e-precos (06/11/2026) ; https://conexa.app/ (06/11/2026) ; https://docs.pluggy.ai/docs/open-finance-regulated (resumo do buscador, 06/11/2026) ; https://www.toolmage.com/pt/tool/pluggy/ (resumo do buscador, 06/11/2026) |

### FIN-005 · Montar o fluxo de caixa realizado e projetado do escritório e a previsão de receita de 12 …

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Financeiro do escritório / Fluxo de caixa e previsão de receita |
| etapa | Manutenção |
| atividade | Montar o fluxo de caixa realizado e projetado do escritório e a previsão de receita de 12 meses (contratos vigentes, reajustes agendados, 13º honorário, sazonais de IRPF e balanço, saídas avisadas, entradas do funil, inadimplência esperada, folha e custos fixos) |
| descrição | O sócio projeta o caixa de cabeça ou numa planilha que não conversa com contratos, desligamentos e funil. A plataforma calcula a projeção a partir das assinaturas (FIN-001), dos avisos de distrato (GES-046), das propostas (GES-042) e do histórico de atraso, e responde no chat perguntas como "aguento contratar mais um analista em março?". GES-011 é o painel de indicadores; esta ficha é o motor que faz a projeção. |
| gatilho_frequência | Semanal (atualização) e mensal (fechamento) |
| quem_faz | Sócio / gestor financeiro |
| base_legal | Não há |
| concorrentes | Conexa: DRE e fluxo de caixa, painel com MRR, churn, CAC e LTV e mais de 30 relatórios [F2]; Granatum: fluxo de caixa, metas e planejamento [F13]; Nibo, Conta Azul e Omie: fluxo de caixa genérico [F9][F4][F6]. A projeção que junta funil, distratos e reajustes da carteira contábil `[NÃO ENCONTRADO]` |
| papel_da_ia | M2 juntar contratos, funil, distratos e contas a pagar; M3 projetar com cenários; M4 rascunhar o relatório para o sócio |
| ferramentas_agênticas | `projetar_caixa(meses, cenario)`, `prever_receita(meses)`, `simular_decisao(descricao, impacto_mensal)` |
| eventos_timesheet | `fin.fin-005` (setor FIN, atividade, cliente quando houver, duração) |
| nível_automação | Próprio |
| integrações | Própria |
| credencial_exigida | Nenhuma |
| preço | Sem custo de terceiros |
| confiança | alta |
| notas (dor/freq/risco/dif) | 4 / 4 / 4 / 3 |
| fontes | https://conexa.app/conexa-contabilidade/ (06/11/2026) ; https://www.granatum.com.br/financeiro/precos-planos (06/11/2026) |

### FIN-006 · Fechar a DRE gerencial mensal do escritório por centro de custo (fiscal, DP, contábil, soc…

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Financeiro do escritório / DRE e centros de custo |
| etapa | Manutenção |
| atividade | Fechar a DRE gerencial mensal do escritório por centro de custo (fiscal, DP, contábil, societário, consultoria, atendimento) e por sócio ou carteira, com receita alocada pelos itens do contrato e custo pelo timesheet, pela folha e pelo rateio da estrutura |
| descrição | Os ERPs genéricos rateiam por percentual fixo digitado; quase ninguém sabe se o DP dá lucro. A plataforma aloca receita pelos itens do contrato (FIN-001) e custo pelas horas medidas (GES-047, GES-055), e fecha a DRE por setor e por carteira, base da rentabilidade por cliente (GES-013). |
| gatilho_frequência | Mensal |
| quem_faz | Sócio / controller |
| base_legal | Não há |
| concorrentes | Conexa: DRE gerencial e rateio por centro de custos [F2]; Nibo Plus: centros de custo, rateio de despesas e receitas e regime de competência [F9]; Onvio Custos (Domínio): custo por cliente a partir do módulo Honorários e clientes superavitários ou deficitários [F18]; Makro: DRE gerencial no módulo Resultados [F20]; Omie: rateio dentro dos departamentos [F8]. Nenhum usa as horas capturadas automaticamente dos cores |
| papel_da_ia | M2 juntar receitas, folha e horas; M3 ratear e fechar a DRE; M4 rascunhar a análise ("o setor fiscal caiu 4 p.p. por causa de...") |
| ferramentas_agênticas | `fechar_dre(competencia, visao)`, `ratear_custos(competencia, criterio)`, `explicar_variacao(competencia, centro_custo)` |
| eventos_timesheet | `fin.fin-006` (setor FIN, atividade, cliente quando houver, duração) |
| nível_automação | Próprio |
| integrações | Própria; horas vêm do timesheet (GES-047/GES-048) |
| credencial_exigida | Nenhuma |
| preço | Sem custo de terceiros |
| confiança | alta |
| notas (dor/freq/risco/dif) | 3 / 3 / 2 / 5 |
| fontes | https://conexa.app/conexa-contabilidade/ (06/11/2026) ; https://www.nibo.com.br/empresa/planos-e-precos (06/11/2026) ; https://images.engage.es-pt.thomsonreuters.com/Web/LALEYSAEIMPRESORA/%7B53ebfa26-a0a8-4187-839d-eb9b8ebf495f%7D_DOMINIO_LAMINA_CUSTOS.pdf (resumo do buscador, 06/11/2026) |

### FIN-007 · Elaborar o orçamento anual do escritório (receita por carteira, contratações, reajuste sal…

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Financeiro do escritório / Orçamento |
| etapa | Manutenção |
| atividade | Elaborar o orçamento anual do escritório (receita por carteira, contratações, reajuste salarial da equipe, softwares e APIs, investimentos) e acompanhar orçado × realizado todo mês |
| descrição | Raramente feito; quando é, fica numa planilha que ninguém atualiza. A plataforma parte do realizado e da projeção (FIN-005), aplica as premissas do sócio e compara todo mês, com alerta de desvio por centro de custo. |
| gatilho_frequência | Anual (elaboração) e mensal (acompanhamento) |
| quem_faz | Sócios |
| base_legal | Não há |
| concorrentes | Granatum: planejamento orçamentário e metas, na mensalidade única [F13]; Nibo Premium: planejamento orçamentário [F9] |
| papel_da_ia | M3 montar o orçamento a partir de premissas; M2 comparar com o realizado; M4 avisar desvios |
| ferramentas_agênticas | `criar_orcamento(ano, premissas)`, `comparar_orcado_realizado(competencia)` |
| eventos_timesheet | `fin.fin-007` (setor FIN, atividade, cliente quando houver, duração) |
| nível_automação | Próprio |
| integrações | Própria |
| credencial_exigida | Nenhuma |
| preço | Sem custo de terceiros |
| confiança | alta |
| notas (dor/freq/risco/dif) | 2 / 3 / 2 / 2 |
| fontes | https://www.granatum.com.br/financeiro/precos-planos (06/11/2026) ; https://www.nibo.com.br/empresa/planos-e-precos (06/11/2026) |

### FIN-008 · Calcular comissões de vendedores internos e bônus ou PLR da equipe por metas (receita nova…

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Financeiro do escritório / Comissões e remuneração variável |
| etapa | Manutenção |
| atividade | Calcular comissões de vendedores internos e bônus ou PLR da equipe por metas (receita nova recebida, retenção, qualidade, produtividade medida) e mandar os valores para a folha do escritório |
| descrição | GES-012 cobre indicadores externos (parceiros). Aqui ficam o vendedor ou SDR do próprio escritório e a remuneração variável da equipe, hoje calculados à mão no fim do semestre e contestados. A plataforma calcula sobre o recebido, com as regras do acordo, e mostra a cada pessoa a memória de cálculo. |
| gatilho_frequência | Mensal (comissão) e semestral ou anual (PLR) |
| quem_faz | Sócio e DP do escritório |
| base_legal | PLR exige acordo com comissão de empregados ou convenção (Lei 10.101/2000) `[NÃO VERIFICADO]`; comissão integra a remuneração (CLT) `[NÃO VERIFICADO]` |
| concorrentes | `[NÃO ENCONTRADO]` nos ERPs consultados (Conexa, Nibo, Granatum, Conta Azul, Omie) para comissão de vendedor de escritório contábil e PLR por metas de produtividade |
| papel_da_ia | M3 calcular pela regra aprovada; M2 juntar receita recebida e indicadores; M4 rascunhar o demonstrativo e o lançamento para a folha |
| ferramentas_agênticas | `calcular_comissoes(competencia)`, `calcular_plr(periodo, regra)`, `exportar_variaveis_folha(competencia)` |
| eventos_timesheet | `fin.fin-008` (setor FIN, atividade, cliente quando houver, duração) |
| nível_automação | Próprio |
| integrações | Própria; exportação para a folha do core (F) |
| credencial_exigida | Nenhuma |
| preço | Sem custo de terceiros |
| confiança | baixa |
| notas (dor/freq/risco/dif) | 2 / 3 / 3 / 3 |
| fontes | Busca sem resultado específico nas páginas dos fornecedores lidas em 06/11/2026 |

### FIN-009 · Executar a suspensão escalonada por inadimplência (aviso formal com prazo, pausa de extras…

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Financeiro do escritório / Inadimplência / suspensão |
| etapa | Manutenção, Desligamento |
| atividade | Executar a suspensão escalonada por inadimplência (aviso formal com prazo, pausa de extras e pedidos novos no app, nada de reter documento ou obrigação em curso) e reativar sozinho quando o pagamento compensa |
| descrição | GES-006 é a decisão do sócio. Esta ficha executa o que ele decidiu: a pausa é parcial e registrada, a régua da IA não condiciona entrega a pagamento, e o serviço volta assim que o pagamento é confirmado. Sem isso, a suspensão fica informal, um analista continua trabalhando e outro para, e o cliente reclama com razão. |
| gatilho_frequência | Por evento (atraso acima do limite da política) |
| quem_faz | Financeiro, com aprovação do sócio |
| base_legal | NBC PG 01, item 4(l): veda reter documentos para forçar pagamento (lido pelo D1 em [F61], via D7); Res. CFC 1.590/2020 (rescisão e aviso prévio), via D7 [R1] |
| concorrentes | Régua de cobrança personalizável com WhatsApp: Conexa [F2]; régua e negativação Serasa a R$ 9,90 por cobrança no Asaas [F11]; negativação no Omie Bank [F7]. Nenhum liga a suspensão à operação contábil (tarefas, app, obrigações) `[NÃO ENCONTRADO]` |
| papel_da_ia | M1 ler a política e a NBC PG 01; M2 listar o que pausa e o que segue; M4 rascunhar a notificação e aplicar a pausa e a reativação depois da aprovação do sócio |
| ferramentas_agênticas | `propor_suspensao(cliente)`, `aplicar_suspensao(cliente, escopo, aprovador)`, `reativar_cliente(cliente)` |
| eventos_timesheet | `fin.fin-009` (setor FIN, atividade, cliente quando houver, duração) |
| nível_automação | D-assistido |
| integrações | Própria + webhook de pagamento do provedor (B) para reativar |
| credencial_exigida | Nenhuma |
| preço | Asaas negativação R$ 9,90 por cobrança; consulta Serasa R$ 16,99 [F11] (06/11/2026) |
| confiança | média |
| notas (dor/freq/risco/dif) | 4 / 2 / 5 / 4 |
| fontes | https://conexa.app/conexa-contabilidade/ (06/11/2026) ; https://www.asaas.com/precos-e-taxas (06/11/2026) ; D7-gestao-atendimento-timesheet.md (NBC PG 01 item 4(l), Res. CFC 1.590/2020) |

### FIN-010 · Dar ao cliente, no app e no WhatsApp, o autoatendimento financeiro: 2ª via atualizada, his…

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Financeiro do escritório / App do cliente / autoatendimento financeiro |
| etapa | Entrada, Manutenção, Desligamento |
| atividade | Dar ao cliente, no app e no WhatsApp, o autoatendimento financeiro: 2ª via atualizada, histórico de faturas e NFS-e, informe anual de pagamentos e retenções, autorizar ou cancelar o Pix Automático, trocar a forma de pagamento e contestar uma cobrança |
| descrição | Pedidos de 2ª via e de "quanto devo?" ocupam o atendimento todo mês. A plataforma responde com dados do provedor de cobrança, gera a 2ª via com juros e multa e mostra a situação do Pix Automático, e só leva a pessoa para a contestação. |
| gatilho_frequência | Diária (volume de pedidos da carteira) |
| quem_faz | Atendimento / financeiro |
| base_legal | Pix Automático: autorização única do pagador, que pode cancelar a qualquer momento (Res. BCB 402 e normas seguintes, segundo imprensa) [F26] |
| concorrentes | Asaas: página pública de 2ª via e fatura personalizável [F11]; Nibo: Portal do Cliente [F10]; Conexa: app white label só no segmento coworking [F1]; Conta Azul Mais é a plataforma do contador sobre o ERP do cliente, não autoatendimento dos honorários [F5] |
| papel_da_ia | M2 consultar faturas e pagamentos; M4 gerar 2ª via e reenviar NFS-e sozinho; contestação vai para pessoa |
| ferramentas_agênticas | `segunda_via(cliente, cobranca_id)`, `historico_financeiro(cliente)`, `status_pix_automatico(cliente)`, `gerar_informe_pagamentos(cliente, ano)` |
| eventos_timesheet | `fin.fin-010` (setor FIN, atividade, cliente quando houver, duração) |
| nível_automação | B |
| integrações | API do provedor de cobrança (Asaas, iugu, Conexa ou banco) [F12][F1] |
| credencial_exigida | Token de API do provedor |
| preço | Asaas notificação por WhatsApp R$ 0,55; e-mail e SMS R$ 0,99 por pacote [F11] (06/11/2026) |
| confiança | média |
| notas (dor/freq/risco/dif) | 3 / 4 / 2 / 3 |
| fontes | https://www.asaas.com/precos-e-taxas (06/11/2026) ; https://docs.asaas.com/docs/pix-automatico (06/11/2026) ; https://www.nibo.com.br/contador (06/11/2026) |

### FIN-011 · Cancelar, substituir ou corrigir NFS-e e cobranças do escritório emitidas com erro (valor,…

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Financeiro do escritório / NFS-e do escritório / correções |
| etapa | Manutenção |
| atividade | Cancelar, substituir ou corrigir NFS-e e cobranças do escritório emitidas com erro (valor, tomador, retenção, competência, IBS/CBS) e refletir no contas a receber |
| descrição | Erro de retenção ou de tomador obriga a cancelar ou substituir a nota e a cobrança, e muita vez a nota cancelada fica no contas a receber. Desde 01/11/2026 o escritório do Simples emite só pelo Emissor Nacional, que barra emissões retroativas para municípios com emissor próprio, e as correções precisam seguir esse fluxo. |
| gatilho_frequência | Eventual (alguns casos por mês) |
| quem_faz | Financeiro |
| base_legal | CGNFS-e: ME/EPP do Simples emitem NFS-e exclusivamente pelo Emissor Nacional (Web ou API) para competências a partir de 01/11/2026; o Emissor Nacional barra retroativas para municípios com emissor próprio [F23]; campos de IBS/CBS opcionais e sem rejeição técnica no ADN, conforme orientação de 29/10/2026 [F24] |
| concorrentes | Conexa: emissão automática antes ou depois da liquidação, integrada a centenas de municípios [F2]; Asaas: NFS-e a R$ 0,49 por nota [F11]; Nibo: emissão e automação de NFS-e [F9]; Omie: máquina de NFS-e para qualquer município [F8]. Tratamento conjunto de nota e cobrança errada `[NÃO VERIFICADO]` |
| papel_da_ia | M1 ler a regra de cancelamento ou substituição; M2 achar a nota e a cobrança afetadas; M4 executar o evento e a nova cobrança após aprovação |
| ferramentas_agênticas | `cancelar_nfse(nfse_id, motivo)`, `substituir_nfse(nfse_id, dados)`, `ajustar_cobranca(cobranca_id, novo_valor)` |
| eventos_timesheet | `fin.fin-011` (setor FIN, atividade, cliente quando houver, duração) |
| nível_automação | A |
| integrações | API da NFS-e Nacional (produção restrita e produção) [F25]; eventos de cancelamento e substituição `[NÃO VERIFICADO]` (não lidos no leiaute) |
| credencial_exigida | e-CNPJ do escritório (certificado A1) |
| preço | API oficial sem tarifa `[NÃO VERIFICADO]`; via Asaas R$ 0,49 por nota [F11] |
| confiança | média |
| notas (dor/freq/risco/dif) | 3 / 2 / 3 / 2 |
| fontes | https://www.gov.br/nfse/pt-br/noticias/nfs-e-informa-diretrizes-sobre-a-obrigatoriedade-da-emissao-da-nfs-e-nacional-para-optantes-do-simples-nacional (publicado 29/10/2026; lido 06/11/2026) ; https://www.gov.br/nfse/pt-br/noticias/nfs-e-nacional-confira-oas-rientacoes-sobre-leiaute-em-producao-regras-de-preenchimento-de-ibs-cbs-e-status-da-nota-tecnica-009 (29/10/2026) ; https://www.gov.br/nfse/pt-br/biblioteca/documentacao-tecnica (06/11/2026) |

### FIN-012 · Apurar o resultado do escritório e distribuí-lo entre os sócios (pró-labore, antecipação d…

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Financeiro do escritório / Resultado dos sócios do escritório |
| etapa | Manutenção |
| atividade | Apurar o resultado do escritório e distribuí-lo entre os sócios (pró-labore, antecipação de lucros, regra por carteira ou produção, reservas), com memória para o contrato social, a escrituração e o IRPF dos sócios |
| descrição | Em escritórios com vários sócios, a divisão por carteira ou produção é feita à mão e gera conflito. A plataforma usa a DRE por carteira (FIN-006) e as horas medidas e aplica a regra do acordo de sócios. Também avisa o limite mensal de lucros por sócio a partir do qual há retenção (regra tratada na CON-012 para os clientes). |
| gatilho_frequência | Mensal (antecipações) e anual (apuração final) |
| quem_faz | Sócios |
| base_legal | Contrato social / acordo de sócios; retenção de 10% sobre lucros acima de R$ 50 mil/mês por sócio, conforme CON-012 do inventário `[NÃO VERIFICADO nesta ficha]` |
| concorrentes | `[NÃO ENCONTRADO]` nos ERPs consultados |
| papel_da_ia | M2 juntar DRE por carteira e horas; M3 calcular a divisão e a retenção; M4 rascunhar o demonstrativo; decisão dos sócios |
| ferramentas_agênticas | `apurar_resultado_socios(periodo, regra)`, `simular_distribuicao(valor, socios)` |
| eventos_timesheet | `fin.fin-012` (setor FIN, atividade, cliente quando houver, duração) |
| nível_automação | Próprio |
| integrações | Própria |
| credencial_exigida | Nenhuma |
| preço | Sem custo de terceiros |
| confiança | baixa |
| notas (dor/freq/risco/dif) | 3 / 3 / 4 / 4 |
| fontes | Inventário: CON-012 (regra de retenção); busca sem resultado nos fornecedores lidos em 06/11/2026 |

### FIN-013 · Comparar e auditar provedores de recebimento e conta (tarifa por boleto, Pix, Pix Automáti…

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Financeiro do escritório / Provedores de recebimento |
| etapa | Manutenção |
| atividade | Comparar e auditar provedores de recebimento e conta (tarifa por boleto, Pix, Pix Automático, cartão e notificação, prazo de crédito, convênio próprio ou gateway) e trocar de provedor sem perder as autorizações de Pix Automático |
| descrição | O escritório paga tarifas que não confere e fica preso ao banco porque migrar as cobranças é trabalhoso. A plataforma soma o custo real por ciclo a partir das cobranças, compara com as tabelas públicas e conduz a troca com novo convite de autorização ao cliente. |
| gatilho_frequência | Eventual (revisão anual ou troca de banco) |
| quem_faz | Sócio / financeiro |
| base_legal | Pix Automático: gratuito para o pagador; o recebedor pode pagar tarifa negociada livremente (imprensa); empresas recebedoras com CNPJ ativo há pelo menos 6 meses (Res. BCB 482, segundo imprensa) [F26] |
| concorrentes | Conexa: usar o convênio do escritório ou os parceiros do Conexa com taxas por plano ou volume [F2]; Asaas: Pix e boleto R$ 1,59 (R$ 0,79 nos 3 primeiros meses), cartão R$ 0,49 + 2,99% à vista [F11]; iugu: Pix 0,99%, boleto R$ 2,19 + R$ 0,40 de processamento no plano Essencial, segundo análise de terceiros de 16/10/2026 [F15]; Vindi: tarifas citadas por comparador [F29] |
| papel_da_ia | M2 somar tarifas cobradas; M3 simular cenários; M4 rascunhar o plano de migração e as mensagens de nova autorização |
| ferramentas_agênticas | `custo_real_recebimento(periodo)`, `simular_provedor(provedor, volume)`, `planejar_migracao_cobranca(provedor_destino)` |
| eventos_timesheet | `fin.fin-013` (setor FIN, atividade, cliente quando houver, duração) |
| nível_automação | D-assistido |
| integrações | Tabelas públicas + extrato (FIN-004); migração por API dos provedores |
| credencial_exigida | Tokens dos provedores atual e novo |
| preço | Ver concorrentes (tabelas de 06/11/2026) |
| confiança | média |
| notas (dor/freq/risco/dif) | 2 / 2 / 3 / 3 |
| fontes | https://www.asaas.com/precos-e-taxas (06/11/2026) ; https://conexa.app/conexa-contabilidade/ (06/11/2026) ; https://quasa.io/pt/media/asaas-ou-iugu-tarifa-publicada-vence-ate-o-volume-pedir-proposta (resumo do buscador, 06/11/2026) ; https://convergenciadigital.com.br/governo/bc-estipula-regras-para-erros-no-pix-automatico/ (resumo do buscador, 06/11/2026) |

### FIN-014 · Trazer para a plataforma o financeiro que o escritório usa hoje (contratos, clientes, cobr…

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Financeiro do escritório / Implantação do financeiro |
| etapa | Manutenção |
| atividade | Trazer para a plataforma o financeiro que o escritório usa hoje (contratos, clientes, cobranças em aberto, histórico, autorizações de débito e Pix Automático) de Conexa, Omie, Conta Azul, Nibo, Domínio Honorários ou planilha, e conferir os saldos |
| descrição | É a maior barreira de troca: ninguém migra o financeiro no meio do ano por medo de perder cobranças. A plataforma importa por API ou arquivo, mostra as divergências de saldo e de contrato e roda em paralelo por um ciclo antes de desligar o sistema antigo. |
| gatilho_frequência | Rara (uma vez por escritório; de novo se trocar de provedor) |
| quem_faz | Sócio / financeiro com o time de implantação |
| base_legal | Não há |
| concorrentes | Asaas: importação de dados grátis [F11]; Conexa: API e webhooks [F1]; Nibo Premium: API pública [F9] |
| papel_da_ia | M2 mapear campos e achar divergências; M4 rascunhar a importação e o relatório de paridade; execução após conferência |
| ferramentas_agênticas | `importar_financeiro(origem, arquivo_ou_token)`, `relatorio_paridade(origem, competencia)` |
| eventos_timesheet | `fin.fin-014` (setor FIN, atividade, cliente quando houver, duração) |
| nível_automação | F |
| integrações | API dos sistemas de origem quando existe (Conexa [F1], Nibo [F9]); planilha ou CSV como alternativa (F) |
| credencial_exigida | Token de API do sistema de origem ou exportação feita pelo escritório |
| preço | Sem custo de terceiros conhecido |
| confiança | média |
| notas (dor/freq/risco/dif) | 4 / 1 / 4 / 4 |
| fontes | https://www.asaas.com/precos-e-taxas (06/11/2026) ; https://conexa.app/ (06/11/2026) ; https://www.nibo.com.br/empresa/planos-e-precos (06/11/2026) |


# Pesquisa 04: custos jurídicos, tributários e de aquisição de dados

4 de novembro de 2026

Esta pesquisa levanta o que custa, fora da engenharia, tirar do papel o assistente de IA para contadores e a base legal descrita no [Plano de Ingestão da Base Legal](../planos/Plano_de_Ingestao_da_Base_Legal.md): abrir e manter a empresa, a camada jurídica, a tributação do próprio SaaS e dos serviços que ele compra no exterior, os especialistas da Fase 0 e da auditoria amostral, as fontes de dados, segurança, cobrança e marketing.

**Como ler os números**

- Valores em reais. **(est.)** marca estimativa de mercado, sem preço público confirmado em fonte oficial. Valores sem a marca vêm da fonte citada na linha ou na seção 12.
- Câmbio de referência, o mesmo da [pesquisa 03](03-agentes-dev.md): **US$ 1 = R$ 5,4935** (PTAX de 3/11/2026).
- **Linha do tempo assumida.** O plano não fixa datas, então esta pesquisa usa **M0 = mês de abertura do CNPJ** (sugestão: dezembro de 2026, ver seção 3.5) e a seguinte sequência:

| Mês | Etapa (seção 6 do plano) |
| --- | --- |
| M0 | Abertura da empresa, marca, e-CNPJ, contador |
| M1–M3 | Fase 0: fichas-base, casos-modelo, piloto de 300 documentos, congelamento v1.0 |
| M3–M5 | Fase 1: infraestrutura e esqueleto agêntico (INLABS) |
| M5–M8 | Fase 2: federal, com a primeira auditoria amostral |
| M8 | Pentest, termos finais, seguro, encarregado (DPO) |
| M9 | Beta pago com escritórios contábeis; início da cobrança e da NFS-e |
| M9–M12+ | Fase 3: SP → MG → PR → SC → RS, com auditoria por estado |

- **Fora desta pesquisa:** salários e pró-labore, infraestrutura e tokens (pesquisa 03) e tributos sobre a receita (seção 3 traz as alíquotas, mas não entram no total porque dependem do faturamento). O **acréscimo tributário sobre o que se paga no exterior** entra no total (seção 3.6).

---

## 1. Resumo

- **Total do ano 0 (M0–M11), com contingência: de R$ 166 mil a R$ 993 mil. Cenário base recomendado: cerca de R$ 381 mil.** Sem a CONESCAP (opcional) e sem o acréscimo tributário de importação, o total fica entre R$ 146 mil e 808 mil (base de R$ 350 mil). Em regime, a partir de M9, os recorrentes ficam entre R$ 8 mil e 51 mil/mês (base de R$ 22 mil). Os itens mais pesados são os especialistas da Fase 0 e da auditoria mensal (cerca de um terço do total), a camada jurídica de lançamento e o pentest.
- **Regime de partida: Simples Nacional com fator R ≥ 28%, que leva ao Anexo III (6% na primeira faixa).** Sem folha, a empresa cai no Anexo V (15,5%). A [SC Cosit 222/2019](https://tributodevido.com.br/portal/tributacao-no-simples-nacional-para-licenciamento-e-assinatura-de-software/) confirma que licença e assinatura de software seguem o fator R. No Lucro Presumido, a carga sobre a receita fica entre 13,33% e 16,33%, e a [LC 224/2025](https://www.contabeis.com.br/noticias/75261/lucro-presumido-tera-aumento-de-10-na-base-do-irpj-e-csll-em-2026/) aumenta a presunção na parcela da receita acima de R$ 5 milhões.
- **Cada US$ 1 pago no exterior custa de 32% a 52% a mais em tributos, quando se recolhe tudo de forma regular.** No caso típico (fornecedor dos EUA que não aceita retenção, SaaS tratado como serviço técnico, ISS de SP e câmbio bancário), o acréscimo é de **+45%**. Pagar com cartão e não recolher nada sai por cerca de +7,6%, mas deixa um passivo: os tributos devidos, multa de 75% e Selic. A maior alavanca é **contratar IA e nuvem faturadas por uma entidade brasileira** (AWS, Google Cloud e Microsoft faturam no Brasil em reais), o que elimina a importação de serviço.
- **Reforma tributária.** Em 2027, a CBS substitui o PIS/Cofins. O TCU propôs alíquota de referência de **11,3%** em 28/10/2026, ainda pendente de resolução do Senado até 15/12/2026. Quem abrir o CNPJ entre outubro e dezembro de 2026 escolhe na própria inscrição se recolhe IBS e CBS dentro ou fora do DAS. Essa escolha muda o crédito do cliente e o custo da importação.
- **Dados: quase tudo de que o plano precisa é gratuito** (INLABS, LexML, Querido Diário, portais oficiais, NBCs do CFC). O que é pago (Jusbrasil, Escavador, Digesto, Codilo, LegisWeb, Leis Municipais, editoras) serve a outros fins ou não pode ser reaproveitado na base, por licença ou por direito autoral da compilação. **Orçamento sugerido: de R$ 0 a 2.500/mês**, só para conferência manual.
- **Três maiores riscos (seção 11):** (1) passivo tributário sobre serviços importados; (2) responsabilidade civil e profissional por resposta errada da IA, incluindo o risco de a ferramenta ser vista como exercício ilegal da contabilidade ou da advocacia; (3) acesso às fontes: bloqueio de robôs (o próprio Planalto bloqueou a coleta automatizada desta pesquisa) e licenças de agregadores municipais.

---

## 2. Constituição e operação da empresa

| Item | Valor | Mês | Fonte / observação |
| --- | --- | --- | --- |
| Junta Comercial (JUCESP), LTDA/SLU ME/EPP | R$ 218,99 (R$ 0 pelo Balcão Único de SP, com contrato padrão e gov.br prata/ouro) | M0 | [Meu Contador Online, taxas JUCESP 2026](https://www.meucontadoronline.com.br/blog/quanto-custa-abrir-empresa-em-sao-paulo/) |
| Inscrição municipal (CCM) e estadual | R$ 0 | M0 | Mesma fonte. Um SaaS não precisa de IE |
| Licenciamento/TFE municipal (SP, atividade de baixo risco) | R$ 0 a 700/ano **(est.)** | M0 | Depende da atividade e da metragem |
| Honorários de abertura | R$ 0 a 1.500 **(est.)** | M0 | Contabilidades online costumam isentar a abertura em contrato de 12 meses. Contrato social sob medida, com vesting e cláusulas de saída, fica na linha jurídica |
| Contador mensal (Simples, serviços, 1 a 5 pessoas na folha, importação de serviços) | R$ 400 a 1.800/mês **(est.)** | M0+ | A importação de serviço acrescenta DARFs (IRRF 0422, CIDE 8741, PIS-imp. 5434, Cofins-imp. 5442; confirmar os códigos com o contador), EFD-Reinf/DCTFWeb e contrato de câmbio. Peça cotação que já inclua isso |
| e-CNPJ A1 (arquivo, 1 ano) | R$ 150 a 280/ano **(est.)** | M0, renova a cada 12 meses | Necessário para e-CAC, NFS-e, procurações e o Integra Contador |
| e-CNPJ A3 (token, 1 a 3 anos), opcional | R$ 250 a 450 **(est.)** | M0 | Útil para guardar a chave fora de servidor. O A1 serve para automação |
| INPI, marca nas classes 9 (software) e 42 (SaaS) | **R$ 440 por classe** para ME/EPP com especificação pré-aprovada (R$ 880 sem desconto); R$ 860 por classe com especificação livre. **Concessão e 1º decênio: R$ 0** | M0 | [Tabela de retribuições do INPI, marcas](https://www.gov.br/inpi/pt-br/servicos/custos-e-pagamento/NovaTabeladeRetribuiesINPI_MARCAS_Final_20_dez_25.pdf) (Portaria MDIC 110/2025). 2 classes: R$ 880 a 1.720 |
| Agente de propriedade industrial (busca de anterioridade e depósito), opcional | R$ 500 a 2.000 por classe **(est.)** | M0 | Vale para nomes genéricos do setor ("Contábil", "Fiscal"), em que o risco de colidência é alto |
| Domínio .com.br (Registro.br) | R$ 40/ano | M0 | Registro.br. Um .com ou .ai comprado no exterior também é importação de serviço |
| Conta PJ digital | R$ 0 **(est.)** | M0 | — |

**Total de constituição (M0):** de R$ 1.300 a 9.900. Contador: de R$ 4.800 a 21.600 no ano.

---

## 3. Tributação do SaaS

### 3.1 Simples Nacional: Anexo III ou V e fator R

Licença de uso e assinatura de software com acesso pela internet (LC 116, subitens 1.03 e 1.05) se submetem ao fator R: Anexo III se a folha dos últimos 12 meses for pelo menos 28% da receita bruta do mesmo período; Anexo V se for menor (LC 123, art. 18, §§ 5º-D, 5º-I, 5º-J e 5º-M; Res. CGSN 140/2018, art. 25; [SC Cosit 222/2019](https://tributodevido.com.br/portal/tributacao-no-simples-nacional-para-licenciamento-e-assinatura-de-software/)).

| Faixa (RBT12) | Anexo III, nominal / parcela a deduzir | Anexo V, nominal / parcela a deduzir |
| --- | --- | --- |
| Até R$ 180 mil | 6,00% / 0 | 15,50% / 0 |
| 180 mil a 360 mil | 11,20% / 9.360 | 18,00% / 4.500 |
| 360 mil a 720 mil | 13,50% / 17.640 | 19,50% / 9.900 |
| 720 mil a 1,8 mi | 16,00% / 35.640 | 20,50% / 17.100 |
| 1,8 mi a 3,6 mi | 21,00% / 125.640 | 23,00% / 62.100 |
| 3,6 mi a 4,8 mi | 33,00% / 648.000 | 30,50% / 540.000 |

- O CPP (INSS patronal) está dentro do DAS nos dois anexos. Na prática, o fator R pede pró-labore e salários de pelo menos 28% da receita. Exemplo: com receita de R$ 30 mil/mês, a folha precisa ser de R$ 8,4 mil/mês. Folha abaixo disso custa 9,5 pontos percentuais a mais na primeira faixa.
- **Dividendos:** a Lei 15.270/2025 retém 10% de IR na fonte sobre lucros acima de R$ 50 mil por mês pagos à mesma pessoa física, desde 2026, inclusive em empresas do Simples, e cria o imposto mínimo para altas rendas ([Contábeis](https://www.contabeis.com.br/noticias/74441/dividendos-no-simples-nacional-e-a-nova-lei-15-270/)). Na fase inicial, isso só pesa se houver distribuição relevante.

### 3.2 Lucro Presumido

- Presunção de 32% para serviços. IRPJ 4,8%, mais adicional de 10% sobre a base que passar de R$ 20 mil/mês. CSLL 2,88%. PIS 0,65% e Cofins 3% (cumulativos). ISS de 2 a 5%. **Total: de 13,33% a 16,33% da receita**, mais o adicional.
- A **LC 224/2025** acrescenta 10% aos percentuais de presunção na parcela da receita anual acima de R$ 5 milhões. Vale desde jan/2026 para o IRPJ e, pela noventena, desde o 2º trimestre de 2026 para a CSLL ([Contábeis](https://www.contabeis.com.br/noticias/75261/lucro-presumido-tera-aumento-de-10-na-base-do-irpj-e-csll-em-2026/); [Migalhas](https://www.migalhas.com.br/depeso/447666/pedagio-do-lucro-presumido-analise-da-lc-224-25-e-desafio-da-vigencia)).
- A folha paga INSS patronal de cerca de 20% mais RAT e terceiros. A desoneração (CPRB de 4,5% para TI) está em reoneração gradual pela Lei 14.973/2024: em 2026, 60% de CPRB mais 10% sobre a folha; em 2028, folha cheia.
- **Quando vale:** com folha baixa (fator R < 28%) e receita acima de cerca de R$ 1,5 a 2 milhões por ano, ou quando clientes grandes no regime regular quiserem crédito integral de IBS e CBS a partir de 2027. Na partida, o Simples com Anexo III é quase sempre mais barato.

### 3.3 ISS

- Subitens 1.03 (processamento e hospedagem; código nacional NFS-e 010301/010302) e 1.05 (licenciamento ou cessão de uso; 010501). NBS 1.1506.21.00 para SaaS ([Taxup](https://taxup.com.br/iss-software-saas-municipio-codigo-retencao/)). Desde as ADIs 1945 e 5659 do STF (2021), software é ISS, não ICMS.
- Alíquota de 2% (piso, LC 116, art. 8º-A) a 5%. **São Paulo: 2,9%** para o item 1, exceto o 1.09 (Lei 13.701/2003, art. 16, III). O ISS é devido no município do estabelecimento prestador (art. 3º).
- No Simples, o ISS já está no DAS (cerca de 33,5% do valor da primeira faixa do Anexo III, ou 2,01% da receita).
- **NFS-e:** o padrão nacional (Emissor Nacional, gratuito) é obrigatório desde jan/2026 por causa da reforma. A emissão pode ser feita pelo gateway ou por API (seção 9).

### 3.4 Reforma tributária: CBS, IBS e split payment

| Ano | O que muda para o SaaS |
| --- | --- |
| 2026 | CBS 0,9% e IBS 0,1% só destacados na nota, em teste. O recolhimento é dispensado para quem cumpre as obrigações acessórias. O Simples não participa |
| 2027 | **CBS com alíquota cheia**, com fim do PIS/Cofins. Referência proposta pelo TCU: **11,3%**, pendente de resolução do Senado até 15/12/2026 ([LegisWeb, 28/10/2026](https://www.legisweb.com.br/noticia/?id=34652)). IBS de 0,1%. **Split payment** começa opcional, restrito a B2B, Pix, boleto e TED; fica fora o cartão e a ME que recolhe tudo pelo DAS ([TAGD Law, 25/08/2026](https://tagdlaw.com.br/split-payment-de-2027-nao-vai-atingir-microempresas-do-simples-nem-vendas-a-pessoa-fisica/)) |
| 2029–2032 | ISS cai para 90%, 80%, 70% e 60% do nível atual; o IBS sobe na mesma medida |
| 2033 | Só IBS e CBS. Serviços de software não têm redução de alíquota: o padrão IBS+CBS é estimado em cerca de 26,5 a 28% **(est.)** |

- **Decisão que vence na abertura:** empresas inscritas no CNPJ entre 1º/10 e 31/12/2026 fazem a opção pelo Simples, e a escolha de recolher IBS e CBS dentro ou fora do DAS no 1º semestre de 2027, **na própria inscrição**. A próxima janela está prevista para mar/2027, com efeito no 2º semestre ([Econet](https://blog.econeteditora.com.br/simples-nacional-2027-prazo-de-opcao-muda-para-setembro-de-2026-e-exige-decisao-sobre-ibs-e-cbs.md)).
  - **Dentro do DAS:** mais simples e mais barato no início. O cliente no regime regular só aproveita o crédito correspondente ao que está no DAS, e a CBS-importação não gera crédito.
  - **Fora do DAS (regime regular de IBS/CBS):** o crédito do cliente é integral, e a CBS-importação sobre IA e nuvem estrangeiras passa a gerar crédito (seção 3.6). Exige ERP fiscal e mais trabalho contábil.
  - **Recomendação:** começar dentro do DAS, porque os primeiros clientes (escritórios contábeis) também estão majoritariamente no Simples. Reavaliar em mar/2027 com o gasto no exterior já conhecido.
- **Lucro Presumido a partir de 2027:** a CBS (cerca de 11,3%, com crédito) substitui o PIS/Cofins cumulativo (3,65%, sem crédito). Para um SaaS com pouco insumo, a carga sobre a receita sobe.

### 3.5 Quando abrir o CNPJ

Abrindo em dez/2026, a empresa já entra com o regime de 2027 definido e não precisa mudar de regime depois. Abrir em jan/2027 também é possível, mas a opção pelo Simples de início de atividade tem prazos próprios (30 dias da última inscrição, limitado a 180 dias da abertura). Confirme com o contador.

### 3.6 Importação de serviços: API, assinaturas e nuvem em dólar

**Enquadramento.** A Receita trata o pagamento por SaaS (acesso remoto, sem entrega de software) como **serviço técnico**: IRRF de 15% e CIDE de 10% ([SC Cosit 191/2017](https://www.internationaltaxreview.com/article/2a68yqfl0psda2ex49se8/levy-of-irrf-and-cide-on-the-remuneration-of-software-as-a-service-saas), ainda não revista). Já a licença de uso sem transferência de código-fonte é isenta de CIDE (Lei 10.168/2000, art. 2º, § 1º-A). Desde a SC Cosit 107/2023, a Receita também trata a licença como serviço para PIS e Cofins-importação, que são 9,25% (1,65% + 7,6%), devidos inclusive por empresas do Simples e sem crédito fora do Lucro Real. A [SC Cosit 177/2024](https://assets.ey.com/content/dam/ey-sites/ey-com/pt_br/topics/tax-alert/ey-brasil-receita-federal-07-11-2024.pdf) afastou PIS/Cofins só para royalties de distribuição bem documentados. O ISS-importação é devido pelo tomador (LC 116, art. 1º, § 1º, e art. 6º, § 2º, I), de 2 a 5%; em SP, 2,9%. A Receita vem fiscalizando esse tipo de pagamento ([NetCPA](https://netcpa.com.br/colunas/receita-federal-aperta-o-cerco-sobre-impostos-de-servicos-importados/22820)).

**IOF.** Compras com cartão internacional pagam **3,5%** (Decreto 12.499/2025, que alterou o art. 15-B do Decreto 6.306; [HLB](https://www.hlb.com.br/wp-content/uploads/2025/05/Mudancas-no-IOF-em-2025.pdf)). Para câmbio de pagamento de importação de serviços, o entendimento predominante é **0,38%**: a alíquota de 3,5% do inciso XXIV vale para "transferência de recursos ao exterior", e pagar por um serviço não seria transferência. **Confirme com o banco de câmbio**, porque as fontes secundárias divergem; a tabela usa 0,38% como caso base e 3,5% como máximo.

**Premissas da conta.** O fornecedor não aceita retenção (caso de OpenAI, Anthropic, GitHub, Vercel e outros), então o IRRF é suportado pela empresa com **gross-up**: base bruta = US$ 1 / 0,85 = US$ 1,1765. CIDE, PIS/Cofins e ISS incidem sobre essa base bruta (Lei 10.865/2004, art. 7º, II, na redação da Lei 12.865/2013). Spread de câmbio bancário de 1% **(est.)**. Cartão: IOF de 3,5% e spread de cerca de 4% **(est.)**.

| Componente, por US$ 1 líquido ao fornecedor | SaaS como serviço técnico (com CIDE) | Licença sem transferência de tecnologia (sem CIDE) |
| --- | --- | --- |
| IRRF 15% com gross-up | +17,65% | +17,65% |
| CIDE 10% sobre a base bruta | +11,76% | — |
| PIS/Cofins-importação 9,25% sobre a base bruta | +10,88% | +10,88% |
| ISS-importação (SP 2,9%) sobre a base bruta | +3,41% | +3,41% |
| IOF-câmbio 0,38% | +0,38% | +0,38% |
| Spread de câmbio **(est.)** | +1,00% | +1,00% |
| **Acréscimo efetivo, caso base (Simples ou Presumido)** | **+45,1%** | **+33,3%** |
| Faixa (ISS de 2 a 5%, IOF de 0,38 a 3,5%, spread de 0,5 a 2%) | +43,5% a +51,7% | +31,8% a +39,9% |
| Pago com cartão corporativo, recolhendo os tributos | +51,2% | +39,5% |
| Lucro Real não cumulativo (crédito de PIS/Cofins) | ≈ +34,2% | ≈ +22,4% |
| **2027**, Simples com IBS/CBS no DAS (CBS-importação de 11,3% sem crédito no lugar de PIS/Cofins) | ≈ +47,5% | ≈ +35,7% |
| **2027**, regime regular de IBS/CBS (CBS-importação gera crédito) | ≈ +34,2% | ≈ +22,4% |
| Fornecedor aceita retenção (sem gross-up; raro) | ≈ +23,5% | ≈ +13,5% |
| Cartão sem recolher nada (**irregular**) | ≈ +7,6%, mais passivo: tributo + multa de 75% (20% se a empresa se autorregularizar antes da fiscalização) + Selic | — |

**Em reais:** cada US$ 1 custa de **R$ 7,96** (+45%) a **R$ 8,33** (+52%), contra R$ 5,49 de PTAX.

**Aplicação à pesquisa 03.** Stack de US$ 349 a 845/mês mais API de US$ 300 a 1.500/mês dá US$ 649 a 2.345/mês, ou R$ 3.565 a 12.882 a PTAX. O acréscimo tributário é de **R$ 1.600 a 5.800/mês**, ou R$ 19 mil a 70 mil no ano 0.

**Como reduzir:**
1. Usar o modelo pelo **AWS Bedrock, Google Vertex AI ou Azure**, faturados por entidades brasileiras em reais e com NFS-e. Isso elimina IRRF, CIDE, IOF e o tributo de importação: a carga fica embutida no preço doméstico e, a partir de 2027, gera crédito se a empresa estiver no regime regular. **Verifique no contrato** qual entidade fatura e se há diferença de preço.
2. Concentrar fornecedores estrangeiros e fazer o câmbio mensal por banco, não por cartão.
3. Pedir ao tributarista um parecer sobre SaaS versus licença para cada contrato, porque a CIDE (11,8 pontos) depende disso.
4. Reavaliar em mar/2027 a opção pelo regime regular de IBS/CBS, quando o gasto no exterior já for conhecido.

---

## 4. Jurídico e seguros

| Item | Faixa | Mês | Observação |
| --- | --- | --- | --- |
| Contrato social sob medida e acordo de sócios (vesting, *drag/tag*, PI dos fundadores) | R$ 3.000 a 15.000 **(est.)** | M0 | Atribuir a PI do código e da base à empresa desde o início |
| Termos de uso e política de privacidade | R$ 3.000 a 12.000 **(est.)** | Rascunho em M3, versão final em M8 | Incluir política de uso aceitável e de dados de clientes dos clientes |
| Adequação à LGPD (inventário/ROPA, RIPD para o uso de IA, DPA com subprocessadores, plano de incidentes, transferência internacional) | R$ 8.000 a 35.000 **(est.)** | M6–M8 | Transferência internacional (API nos EUA): cláusulas-padrão da Res. CD/ANPD 19/2024 |
| Encarregado (DPO) terceirizado | R$ 1.500 a 4.000/mês ([Confidata](https://confidata.com.br/blog/dpo-interno-vs-externo-dpo-as-a-service)); R$ 0 se um fundador assumir | M8+ | A Res. CD/ANPD 2/2022 dispensa agentes de pequeno porte, mas não quem faz tratamento de alto risco, e uso de tecnologia emergente (IA) é um dos critérios. Se os contadores enviarem dados dos clientes deles, trate como obrigatório. Nomeação por escrito (Res. CD/ANPD 18/2024) |
| Contrato B2B (MSA, SLA, DPA, limite de responsabilidade, propriedade das saídas) | R$ 5.000 a 15.000 **(est.)** | M7–M8 | Em B2B o CDC em geral não se aplica, o que permite limitar a responsabilidade ao valor pago em 12 meses, salvo dolo |
| Revisão de responsabilidade pelas respostas da IA | R$ 5.000 a 20.000 **(est.)** | M6–M8 | Cobre: (a) a ferramenta apoia o profissional e não substitui o contador (DL 9.295/1946) nem o advogado (Lei 8.906/1994, art. 1º, II); (b) citação obrigatória da fonte e da data de vigência; (c) registro de versão da base por resposta, que o plano já prevê; (d) acompanhar o PL 2.338/2023 de IA |
| Parecer tributário de estruturação (regime, fator R, importação de serviços, IBS/CBS) | R$ 3.000 a 15.000 **(est.)** | M0–M1 | Pode ser o mesmo advogado tributarista da Fase 0 |
| Assessoria jurídica recorrente (por demanda ou mensalidade) | R$ 1.000 a 6.000/mês **(est.)** | M3+ | Inclui pedidos LAI, licenças de fontes e contratos com clientes |
| Seguro de responsabilidade civil profissional / E&O de tecnologia (limite de R$ 1 a 2 milhões) | R$ 3.000 a 15.000/ano **(est.)** | M8, antes do beta pago | Seguradoras ativas no Brasil: Akad (líder em E&O), Chubb, AIG, Allianz, Tokio Marine ([Legismap](https://legismap.com.br/conteudos/artigos-e-noticias/akad-cresce-31-e-amplia-lideranca-em-e-o)). Peça cobertura expressa para erro de software e IA |
| Seguro cyber (limite de R$ 1 milhão) | R$ 3.000 a 15.000/ano **(est.)** | M8 | Produtos para PME: Akad Cyber, Chubb Small Business ([Chubb](https://www.chubb.com/br-pt/partnership/product/small-business.html)). Muitas apólices exigem MFA, backup e pentest |

**Honorários de advogado:** as seccionais da OAB publicam tabelas mínimas (por exemplo, a [OAB-GO 2026](https://www.oabgo.org.br/wp-content/uploads/2026/06/18084-Tabela-de-Honorarios-Minimos-2026.pdf)), mas o mercado de direito digital e tributário em SP cobra acima delas. As faixas acima são cotações típicas de boutiques e escritórios médios **(est.)**.

---

## 5. Especialistas: Fase 0 e auditoria mensal

O plano (seções 3.4, 4.4 e 6) pede três perfis: contador tributarista sênior, advogado tributarista e especialista em informação legislativa (bibliotecário jurídico, com experiência em LexML).

| Perfil | Hora **(est.)** | Fase 0 (M1–M3): fichas v0, 3 artefatos, piloto de 300 documentos, congelamento | Mensal (M5+): auditoria de ~400 dispositivos (1 a 2 dias) e decisões |
| --- | --- | --- | --- |
| Contador tributarista sênior | R$ 200 a 450/h | 60 a 120 h → R$ 12.000 a 54.000 | 8 a 16 h → R$ 1.600 a 7.200 |
| Advogado tributarista | R$ 350 a 900/h | 40 a 80 h → R$ 14.000 a 72.000 | 2 a 6 h → R$ 700 a 5.400 |
| Especialista em informação legislativa | R$ 120 a 250/h | 30 a 60 h → R$ 3.600 a 15.000 | 0 a 2 h → R$ 0 a 500 |
| **Total** | — | **R$ 30.000 a 141.000** | **R$ 2.500 a 13.000/mês** |

- **Pacote fechado** **(est.)**: um contador consultor por R$ 3.000 a 8.000/mês, com até 20 horas e prioridade na fila humana, costuma sair mais barato que hora avulsa a partir da Fase 2.
- **Portões estaduais da Fase 3:** cada estado acrescenta uma auditoria com foco em RICMS e substituição tributária (16 a 32 h de contador, ou **R$ 3.200 a 14.400 por estado**). Com SP e MG cabendo no ano 0, isso já está na faixa alta do mensal.
- **Onde achar:** CRC (cadastro de peritos e especialistas), grupos de estudo de ICMS do Sescon, núcleo de pesquisa do IBET e da APET, e a rede de bibliotecários jurídicos da Rede Virtual de Bibliotecas do Congresso (RVBI) e do LexML.
- **Contrato:** cessão de direitos sobre as fichas e os casos-modelo, confidencialidade, e declaração de que o especialista audita a base e não assina as respostas do produto.

---

## 6. Dados: fontes pagas, restritas e gratuitas

### 6.1 Gratuitas (o núcleo do plano)

| Fonte | Custo | Licença / observação |
| --- | --- | --- |
| INLABS / DOU (XML e PDF) | R$ 0, com cadastro | Livre desde 2020 (seção 5.1 do plano) |
| LexML (URN e metadados) | R$ 0 | Índice, sem texto. A adesão como provedor de dados é por acordo com o Senado, sem custo |
| Planalto, Senado (normas.leg.br, legis.senado.leg.br) e Câmara (legin) | R$ 0 | **O Planalto bloqueou a coleta automatizada feita nesta pesquisa** ("Esta requisição foi bloqueada"). Use o Senado e a Câmara como espelho e peça acesso formal à Casa Civil (seção 6.4) |
| Querido Diário (Open Knowledge Brasil) | R$ 0 | API pública e código aberto; cobertura parcial dos municípios |
| Diários de associações municipais | R$ 0 | DOM/SC (CIGA) com [dados abertos](https://dados.ciga.sc.gov.br/en/dataset/domsc-publicacoes-de-02-2026/resource/fbf26777-1e98-4808-bdaa-b795ace02825); Diário dos Municípios Mineiros (AMM) |
| **NBCs do CFC, CPCs e ITGs** | **R$ 0** | Publicadas de graça em cfc.org.br e cpc.org.br. São atos normativos do CFC, mas o texto das traduções do IFRS tem direitos do IFRS Foundation cedidos ao CFC e ao Ibracon. **Pode citar e usar para RAG interno, mas confirme com o CFC antes de redistribuir o texto integral** |
| Receita (INs, Soluções de Consulta), CARF, CONFAZ, STF/STJ | R$ 0 | Sem API: coleta automatizada; respeite o robots.txt e o ritmo de requisições |
| CEPIM (CGU) | R$ 0, API do Portal da Transparência com token gratuito | **Atenção:** o CEPIM é o Cadastro de Entidades Privadas sem Fins Lucrativos Impedidas, não uma base de legislação municipal. Só interessa se o produto for verificar sanções de clientes |

### 6.2 Pagas ou com acesso restrito

| Fonte | Para que serve | Preço | Licença | Recomendação |
| --- | --- | --- | --- | --- |
| SERPRO Integra Contador | API para declarações, guias e consultas do Simples, do MEI e da Receita **dos clientes** (com procuração eletrônica e e-CNPJ) | Por chamada, em faixas de consumo (consulta, emissão, declaração), na Loja Serpro. Não confirmado; ordem de R$ 0,04 a 0,40 por chamada **(est.)** ([Contábeis](https://www.contabeis.com.br/noticias/53105/integra-contador-ja-esta-disponivel-veja-como-contratar/)) | Contrato com o SERPRO | Não serve à base legal. Só entra no roadmap de automação de obrigações (fora do ano 0) |
| Jusbrasil (Soluções/API) | Processos, jurisprudência, diários | Contrato corporativo sob consulta **(est.: R$ 2.000 a 20.000/mês)** | Proíbe redistribuição; a compilação e os comentários são protegidos | Dispensável: STF, STJ e CARF têm fontes oficiais |
| Escavador API | Processos e diários, por crédito | Créditos pré-pagos, preço na página de preços (não acessível nesta pesquisa) **(est.: R$ 0,10 a 3,00 por requisição)** | Termos de uso próprios | Dispensável para a base legal |
| Digesto | Monitoramento processual e de diários | Sob consulta | Contrato B2B | Dispensável |
| Codilo | Consulta processual por API | Por consulta, sob consulta **(est.)** | Contrato | Dispensável |
| Leis Municipais (Empresa Leis Ltda) | Plataforma de legislação contratada **pelas prefeituras e câmaras** para publicar a legislação consolidada (Porto Alegre e Caçapava do Sul aparecem como clientes) | O município paga, em contratos de R$ 3 a 15 mil por ano **(est.)**; para reúso comercial, licença sob consulta | Consolidação e compilação têm proteção de base de dados (Lei 9.610/1998, art. 7º, XIII). Não colete sem licença | **Peça pela LAI o texto ao próprio município**, ou negocie licença se a cobertura for decisiva na Fase 3 |
| LegisWeb | Legislação federal, estadual e municipal consolidada; boletins | Assinatura **(est.: R$ 100 a 400/mês)** | Uso individual. Ingerir na base exige licença comercial | Útil como **conferência manual**, não como fonte |
| Editoras (Econet, IOB, Thomson Reuters Checkpoint, Cenofisco) | RICMS e substituição tributária comentados e consolidados | **(est.: R$ 150 a 2.000/mês)** | Conteúdo protegido | 1 assinatura para os auditores conferirem a Fase 3 |
| ABNT (NBR ISO/IEC 27001, 27701, 42001) | Normas pagas relevantes para segurança e governança de IA | **(est.: R$ 200 a 600 por norma)** | Uso interno | Só se for buscar a ISO (seção 7) |

**Orçamento de dados recomendado:** R$ 0 até M5. De M5 em diante, R$ 300 a 2.500/mês (1 editora mais o LegisWeb para conferência). Nenhuma API jurídica no ano 0.

### 6.3 Certidões e cópias

- Cópias digitais pela LAI são gratuitas. Cópias físicas custam só o material (art. 12): R$ 0,10 a 0,50 por página **(est.)**, mais o envio. Diário anterior a 1990 sem versão digital pode exigir digitalização paga ou visita ao acervo.
- Certidões de inteiro teor de leis em câmaras municipais: R$ 0 a 50 por certidão **(est.)**. Raramente necessárias, porque o diário oficial é a fonte primária.
- **Faixa do ano 0:** R$ 0 a 2.000.

### 6.4 A via LAI e os convênios

- **Lei 12.527/2011, art. 8º, § 3º, II e III:** os sites oficiais devem permitir gravação em formatos abertos e **"possibilitar o acesso automatizado por sistemas externos em formatos abertos, estruturados e legíveis por máquina"**. É a base para pedir exportação em lote ou API a Sefaz, Casa Civil e prefeituras, e para reclamar de bloqueio de robôs sem alternativa.
- **Prazos (art. 11):** resposta imediata ou em até **20 dias, prorrogáveis por mais 10** com justificativa. Recurso em 10 dias (art. 15), à autoridade superior e depois à CGU ou ao órgão equivalente no estado ou município.
- **Custo (art. 12):** a busca e o fornecimento são **gratuitos**. Cobra-se só a reprodução (materiais e serviço), com isenção para quem declara hipossuficiência.
- **Municípios com até 10 mil habitantes** estão dispensados de publicar na internet (art. 8º, § 4º), mas continuam obrigados a responder pedidos.
- **Canais:** Fala.BR (federal e muitos estados e municípios aderentes) e os e-SICs estaduais e municipais.
- **Convênios e acordos de cooperação técnica** (custo monetário zero; o custo é tempo jurídico): Senado/LexML (adesão como provedor), Imprensa Nacional (INLABS já é aberto), associações de municípios (AMM-MG, CIGA-SC, CNM) e Sefaz estaduais (acesso a XML de legislação consolidada).
- **Custo interno estimado:** 2 a 6 horas por pedido, incluindo recurso. Na Fase 3, conte 20 a 60 pedidos no ano, cobertos pela assessoria jurídica recorrente.
- **CAPTCHA:** fora do escopo. O caminho é API ou serviço oficial → outra fonte oficial → LAI → convênio → coleta manual pontual (seção 4.4 do plano).

---

## 7. Segurança e conformidade

| Item | Faixa | Quando vale | Mês |
| --- | --- | --- | --- |
| Pentest de aplicação web e API, caixa cinza, multi-tenant, com reteste | R$ 15.000 a 60.000 por rodada **(est.)**. O preço depende de endpoints, perfis de acesso e isolamento entre tenants ([Startup Defense](https://www.startupdefense.io/pt-br/blog/quanto-custa-um-pentest)) | **Obrigatório antes do beta pago**. Seguradoras e clientes maiores pedem o relatório. Depois, uma vez por ano e a cada mudança grande | M8, depois anual |
| Varredura contínua (DAST/SCA) | R$ 0 a 1.500/mês **(est.)** | Ferramentas abertas (OWASP ZAP, Trivy) cobrem o início | M5+ |
| ISO/IEC 27001 (consultoria, auditoria das fases 1 e 2 e manutenção) | Implantação de R$ 60.000 a 200.000, certificação de R$ 25.000 a 60.000, manutenção de R$ 15.000 a 30.000/ano **(est.)** | Só quando houver clientes enterprise (grandes escritórios, redes, Big Four) ou exigência de licitação. **Ano 2 ou depois** | Fora do ano 0 |
| SOC 2 Tipo I / Tipo II | US$ 15 a 40 mil de auditoria, mais US$ 10 a 25 mil/ano de plataforma (Vanta, Drata), sujeitos aos +45% da seção 3.6 → **R$ 120 mil a 520 mil** **(est.)** | Só se vender para os EUA. No mercado contábil brasileiro, quase ninguém pede | Fora do ano 0 |
| ISO/IEC 42001 (gestão de IA) | Parecida com a 27001 **(est.)** | Diferencial a avaliar no ano 2 ou 3 | Fora do ano 0 |

O que entra no ano 0 é uma política de segurança escrita, MFA, backup testado, registro de acessos e um questionário de segurança padrão pronto (CAIQ lite) para responder a clientes. Custo interno.

---

## 8. Comercial

### 8.1 Gateways e assinaturas

| Gateway | Cartão | Pix | Boleto | Recorrência | Fonte |
| --- | --- | --- | --- | --- | --- |
| Stripe (BR) | 3,99% + R$ 0,39 | 1,19% (contas elegíveis) | R$ 3,45 por boleto pago | Stripe Billing: +0,7% do volume **(est.)** | [ParityDeals 2026](https://www.paritydeals.com/blog/best-payment-gateways-brazil-2026/) |
| Asaas | cerca de 2,99% + R$ 0,49 **(est.)** | a partir de R$ 0,49 a 1,99 | cerca de R$ 1,99 **(est.)** | Incluída; emite NFS-e | [PaymentProviders](https://paymentproviders.io/providers/asaas.md); confirme em asaas.com |
| Pagar.me (Stone) | cerca de 3,2 a 5% **(est.)**, negociado | cerca de 1 a 1,2% **(est.)** | cerca de R$ 3,5 **(est.)** | Incluída | Sob consulta comercial |
| Iugu | cerca de 2,5 a 3,5% **(est.)** + tarifa fixa | taxa fixa **(est.)** | taxa fixa **(est.)** | Forte em recorrência B2B; emite NFS-e | Sob consulta |

- **Recomendação:** Asaas ou Iugu para assinatura B2B por boleto ou Pix com NFS-e automática. Para R$ 300/mês por escritório, o custo fica entre R$ 0,49 e 3,50 por cobrança (0,2 a 1,2%), contra 4 a 5% no cartão.
- **Split payment em 2027:** começa por Pix e boleto em B2B. Quem escolher o regime regular verá o IBS e a CBS retidos na liquidação, o que afeta o caixa. Confirme que o gateway suporta.
- **Custo variável:** de 1 a 5% da receita, fora do total.

### 8.2 NFS-e

O Emissor Nacional é gratuito. Por API, a emissão pode vir incluída no gateway (Asaas, Iugu) ou sair de R$ 0 a 300/mês em serviços como eNotas, PlugNotas e Focus NFe **(est.)**. Começa em M9.

### 8.3 Marketing para contadores

| Ação | Faixa | Mês |
| --- | --- | --- |
| Site, identidade, material e vídeo de lançamento | R$ 10.000 a 40.000 **(est.)** | M7–M9 |
| Convenções regionais dos CRCs e eventos dos Sescons (estande ou cota pequena) | R$ 5.000 a 30.000 por evento **(est.)**, mais viagem | M9+ (1 a 2 no ano 0) |
| **22ª CONESCAP** (Fenacon), 17 a 19/11/2027, João Pessoa, mais de 3.000 participantes ([Fenacon](https://fenacon.org.br/noticias/joao-pessoa-sediara-em-2027-a-22a-edicao-da-conescap-o-maior-evento-nacional-do-setor-empresarial-de-servicos/)) | Estande de R$ 20.000 a 90.000 **(est.)** com viagem; cotas em conescap.com.br | M11 (se M0 = dez/2026). **Opcional** |
| ENECON e outros encontros nacionais | Sob consulta **(est.: R$ 10.000 a 60.000)**. Data e organizador de 2027 não foram confirmados | Verificar |
| Conteúdo, webinars com CRC/Sescon, mídia paga, LinkedIn | R$ 2.000 a 15.000/mês **(est.)** | M9+ |

**Restrições de publicidade:**
1. Não anunciar "substitui o contador", "consultoria contábil" ou "parecer jurídico", por causa das atribuições privativas (DL 9.295/1946 e Lei 8.906/1994, art. 1º). A empresa não precisa de registro no CRC enquanto não prestar serviço contábil.
2. As regras de publicidade dos profissionais (NBC PG 01, do CFC; Provimento 205/2021, da OAB) valem para o contador ou advogado que aparecer como garoto-propaganda ou parceiro. Cuidado com depoimento que prometa resultado.
3. CONAR e CDC, art. 37, contra publicidade enganosa: nada de anunciar "100% correto" ou "sempre atualizado". Divulgue a taxa de erro medida, que a auditoria do plano permite calcular.
4. LGPD no marketing direto: base legal (legítimo interesse com opt-out, ou consentimento), lista própria, e nada de listas compradas de CRC.
5. Uso de nome e marca do CFC, de CRC ou da Receita só com autorização ("parceiro oficial", logos).

---

## 9. Contingência

- **Geral:** 15% (cenário enxuto) a 20% (completo) dos custos do ano 0. Cobre honorários acima do previsto, auditoria extra por estado e um segundo pentest.
- **Específica, a manter em caixa e não gastar:**
  - Autorregularização de importação de serviços, se algum pagamento tiver saído sem os tributos: os tributos mais 20% de multa de mora e Selic.
  - Franquia do seguro em sinistro de E&O ou cyber, entre R$ 10 mil e 50 mil **(est.)**.
  - Defesa em reclamação de cliente por resposta errada, entre R$ 10 mil e 40 mil **(est.)**.
- A contingência específica não entra no total, porque é reserva e não despesa prevista.

---

## 10. Tabela de custos

### 10.1 Custos únicos do ano 0

| # | Item | Mín (R$) | Máx (R$) | Base (R$) | Mês |
| --- | --- | ---: | ---: | ---: | --- |
| 1 | Abertura (Junta, honorários, TFE) | 200 | 2.500 | 1.000 | M0 |
| 2 | e-CNPJ A1 (1º ano) e A3 opcional | 150 | 700 | 300 | M0 |
| 3 | INPI, classes 9 e 42, com agente opcional | 880 | 5.720 | 2.500 | M0 |
| 4 | Contrato social, acordo de sócios e parecer tributário de estruturação | 6.000 | 30.000 | 12.000 | M0–M1 |
| 5 | Especialistas da Fase 0 | 30.000 | 141.000 | 70.000 | M1–M3 |
| 6 | Termos de uso e política de privacidade | 3.000 | 12.000 | 6.000 | M3–M8 |
| 7 | Adequação à LGPD | 8.000 | 35.000 | 15.000 | M6–M8 |
| 8 | Contrato B2B (MSA, SLA, DPA) | 5.000 | 15.000 | 8.000 | M7–M8 |
| 9 | Revisão de responsabilidade pela IA | 5.000 | 20.000 | 10.000 | M6–M8 |
| 10 | Pentest pré-lançamento com reteste | 15.000 | 60.000 | 30.000 | M8 |
| 11 | Marketing de lançamento (site, material, 1 a 2 eventos regionais) | 10.000 | 60.000 | 25.000 | M7–M11 |
| 12 | CONESCAP 2027 (opcional) | 0 | 90.000 | 0 | M11 |
| 13 | Certidões, cópias e LAI | 0 | 2.000 | 500 | M3+ |
| 14 | Normas ABNT (opcional) | 0 | 2.500 | 1.000 | M6 |
| | **Subtotal de únicos** | **83.230** | **476.420** | **181.300** | |

### 10.2 Custos recorrentes

| # | Item | Mín/mês | Máx/mês | Base/mês | Início | Meses no ano 0 | Ano 0, mín–máx (base) |
| --- | --- | ---: | ---: | ---: | --- | ---: | --- |
| 15 | Contador | 400 | 1.800 | 900 | M0 | 12 | 4.800–21.600 (10.800) |
| 16 | Assessoria jurídica recorrente | 1.000 | 6.000 | 2.500 | M3 | 9 | 9.000–54.000 (22.500) |
| 17 | Auditoria amostral e portões estaduais | 2.500 | 13.000 | 6.000 | M5 | 7 | 17.500–91.000 (42.000) |
| 18 | Encarregado (DPO) | 0 | 4.000 | 2.000 | M8 | 4 | 0–16.000 (8.000) |
| 19 | Seguros E&O e cyber (prêmio anual) | 500 | 2.500 | 1.000 | M8 | anual | 6.000–30.000 (12.000) |
| 20 | Dados para conferência (editora, LegisWeb) | 0 | 2.500 | 800 | M1 (na prática, M5) | 11 | 0–27.500 (8.800) |
| 21 | Acréscimo tributário sobre gastos no exterior (seção 3.6) | 1.600 | 5.800 | 2.500 | M1 | 11 | 17.600–63.800 (27.500) |
| 22 | NFS-e por API | 0 | 300 | 150 | M9 | 3 | 0–900 (450) |
| 23 | Marketing recorrente | 2.000 | 15.000 | 6.000 | M9 | 3 | 6.000–45.000 (18.000) |
| 24 | Domínios e renovações | 3 | 100 | 25 | M0 | anual | 40–1.200 (300) |
| | **Recorrentes em regime (a partir de M9)** | **8.003** | **51.000** | **21.875** | | | |
| | **Subtotal de recorrentes no ano 0** | | | | | | **60.940–351.000 (150.350)** |
| — | Gateway | 1 a 5% da receita | | | M9 | variável | fora do total |
| — | Tributos sobre a receita (Simples Anexo III, 6% na 1ª faixa) | % da receita | | | M9 | variável | fora do total |

### 10.3 Total do ano 0 (M0–M11)

| | Mín (R$) | Máx (R$) | Base (R$) |
| --- | ---: | ---: | ---: |
| Únicos | 83.230 | 476.420 | 181.300 |
| Recorrentes | 60.940 | 351.000 | 150.350 |
| **Subtotal** | **144.170** | **827.420** | **331.650** |
| Contingência (15% no mín e na base, 20% no máx) | 21.626 | 165.484 | 49.748 |
| **Total do ano 0** | **≈ 165.800** | **≈ 992.900** | **≈ 381.400** |
| Total sem CONESCAP e sem o acréscimo de importação | ≈ 145.600 | ≈ 808.300 | ≈ 349.800 |

**Recorrente no ano 1 em diante, em regime:** de R$ 8 mil a 51 mil/mês (base de R$ 22 mil), mais de R$ 15 mil a 60 mil/ano de pentest e as renovações. A ISO 27001, se vier, soma de R$ 100 mil a 290 mil no ano 2.

Para orçamento, use **R$ 381 mil (base) com tudo incluído**.

---

## 11. Os três maiores riscos

1. **Passivo tributário da importação de serviços.** O custo é de 32 a 52% sobre cada dólar (seção 3.6). Pagar no cartão sem recolher é a prática comum, e a Receita cruza e-Financeira, câmbio e cartão. Uma descoberta na diligência de um investidor ou numa fiscalização vira tributo, multa de 75% e Selic. **Mitigação:** regularizar desde o primeiro pagamento, comprar IA e nuvem de entidades brasileiras e obter parecer sobre SaaS versus licença em M1.
2. **Responsabilidade por resposta errada da IA e enquadramento profissional.** O contador usa a resposta, erra a apuração, e o cliente dele sofre autuação. Some-se a isso o risco de o produto ser visto como prestação de serviço contábil ou consultoria jurídica. **Mitigação:** contrato B2B com limite de responsabilidade, posição de "apoio ao profissional", citação da fonte e da vigência em toda resposta, registro de versão da base, taxa de erro auditada e divulgada, e seguro E&O antes do beta pago.
3. **Acesso às fontes e licença.** Há bloqueio de robôs (o Planalto bloqueou a coleta desta pesquisa), CAPTCHA em Sefaz e prefeituras, e agregadores municipais (Leis Municipais, LegisWeb, editoras) cuja compilação é protegida. Isso pode travar a Fase 3 ou contaminar a base com conteúdo sem licença. **Mitigação:** espelhos oficiais (Senado, Câmara, diários), pedidos LAI com base no art. 8º, § 3º, III desde M3 (os prazos de 20+10 dias e os recursos levam meses), convênios com associações de municípios, e regra de proveniência que recusa qualquer documento fora da lista de fontes oficiais.

Riscos menores: o fator R falhar se a folha for baixa (+9,5 pontos no DAS); uma escolha errada de IBS/CBS na abertura, sem como corrigir até jul/2027; e a alíquota da CBS de 2027 ainda pendente no Senado.

---

## 12. Pendências de confirmação

- Alíquota do IOF-câmbio para pagamento de importação de serviços (0,38% ou 3,5%): confirmar com o banco e com o texto consolidado do Decreto 6.306, art. 15-B.
- Tabela do Integra Contador na Loja Serpro (não acessível nesta pesquisa).
- Preços do Escavador, Jusbrasil, Digesto, Codilo, LegisWeb e Leis Municipais: todos sob consulta ou não acessíveis.
- Cotas de patrocínio da CONESCAP 2027 e data e organizador do ENECON.
- Taxas atuais de Asaas, Pagar.me e Iugu nas páginas oficiais.
- Se a conta de API do modelo escolhido na pesquisa 03 pode ser faturada por uma entidade brasileira (Bedrock, Vertex ou Azure no Brasil).
- Resolução do Senado com a alíquota de referência da CBS de 2027 (prazo: 15/12/2026).

---

## 13. Fontes

- Plano de ingestão: [../docs/Plano_de_Ingestao_da_Base_Legal.md](../planos/Plano_de_Ingestao_da_Base_Legal.md)
- JUCESP 2026: https://www.meucontadoronline.com.br/blog/quanto-custa-abrir-empresa-em-sao-paulo/
- INPI, tabela de marcas: https://www.gov.br/inpi/pt-br/servicos/custos-e-pagamento/NovaTabeladeRetribuiesINPI_MARCAS_Final_20_dez_25.pdf
- SC Cosit 222/2019 (Simples, software): https://tributodevido.com.br/portal/tributacao-no-simples-nacional-para-licenciamento-e-assinatura-de-software/
- LC 224/2025: https://www.contabeis.com.br/noticias/75261/lucro-presumido-tera-aumento-de-10-na-base-do-irpj-e-csll-em-2026/ e https://www.migalhas.com.br/depeso/447666/pedagio-do-lucro-presumido-analise-da-lc-224-25-e-desafio-da-vigencia
- Lei 15.270/2025: https://www.contabeis.com.br/noticias/74441/dividendos-no-simples-nacional-e-a-nova-lei-15-270/
- ISS de software e SaaS: https://taxup.com.br/iss-software-saas-municipio-codigo-retencao/
- CBS 2027 (TCU): https://www.legisweb.com.br/noticia/?id=34652
- Split payment 2027: https://tagdlaw.com.br/split-payment-de-2027-nao-vai-atingir-microempresas-do-simples-nem-vendas-a-pessoa-fisica/
- Opção pelo Simples e IBS/CBS: https://blog.econeteditora.com.br/simples-nacional-2027-prazo-de-opcao-muda-para-setembro-de-2026-e-exige-decisao-sobre-ibs-e-cbs.md
- SC Cosit 191/2017 (SaaS): https://www.internationaltaxreview.com/article/2a68yqfl0psda2ex49se8/levy-of-irrf-and-cide-on-the-remuneration-of-software-as-a-service-saas e https://tributodevido.com.br/portal/tributacao-software-as-a-service/
- SC Cosit 177/2024: https://assets.ey.com/content/dam/ey-sites/ey-com/pt_br/topics/tax-alert/ey-brasil-receita-federal-07-11-2024.pdf
- Fiscalização de serviços importados: https://netcpa.com.br/colunas/receita-federal-aperta-o-cerco-sobre-impostos-de-servicos-importados/22820
- IOF (Decretos 12.466, 12.467 e 12.499/2025): https://www.hlb.com.br/wp-content/uploads/2025/05/Mudancas-no-IOF-em-2025.pdf, https://www.normaslegais.com.br/legislacao/decreto-12499-2025.htm e https://blog.econeteditora.com.br/novas-regras-iof-decretos-2025.md
- DPO terceirizado: https://confidata.com.br/blog/dpo-interno-vs-externo-dpo-as-a-service
- Pentest: https://www.startupdefense.io/pt-br/blog/quanto-custa-um-pentest
- Seguros: https://legismap.com.br/conteudos/artigos-e-noticias/akad-cresce-31-e-amplia-lideranca-em-e-o, https://www.chubb.com/br-pt/partnership/product/small-business.html e https://canaltech.com.br/seguranca/novo-seguro-cobre-riscos-ciberneticos-para-pequenas-e-medias-empresas-no-brasil-228527/
- Integra Contador: https://www.contabeis.com.br/noticias/53105/integra-contador-ja-esta-disponivel-veja-como-contratar/
- Gateways: https://www.paritydeals.com/blog/best-payment-gateways-brazil-2026/ e https://paymentproviders.io/providers/asaas.md
- CONESCAP 2027: https://fenacon.org.br/noticias/joao-pessoa-sediara-em-2027-a-22a-edicao-da-conescap-o-maior-evento-nacional-do-setor-empresarial-de-servicos/
- DOM/SC, dados abertos: https://dados.ciga.sc.gov.br/en/dataset/domsc-publicacoes-de-02-2026/resource/fbf26777-1e98-4808-bdaa-b795ace02825
- OAB-GO, tabela 2026: https://www.oabgo.org.br/wp-content/uploads/2026/06/18084-Tabela-de-Honorarios-Minimos-2026.pdf
- Lei 12.527/2011 (LAI), Lei 9.610/1998, LC 116/2003, LC 123/2006, Lei 10.865/2004, Lei 10.168/2000, LC 214/2025: texto oficial no Planalto e no Senado (legis.senado.leg.br)

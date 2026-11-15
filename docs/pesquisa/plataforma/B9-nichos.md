# B9 — Pacotes por nicho: atividades que decidem a compra de um escritório especializado

- **Data:** 06/11/2026 (páginas consultadas nesta data, salvo indicação)
- **Pedido:** levantar as atividades específicas de quatro nichos (construção civil, saúde, e-commerce e marketplace, agro), cada uma com o gatilho de CNAE ou condição que ativa o pacote, e preencher os campos novos: autonomia, core, substitui, horas_100, depende_de e fase.
- **Inventário conferido:** `indice.txt` (466 fichas). Fichas que já existiam e **não** foram duplicadas: FIS-020 (EFD-Reinf, retenções em geral), NFE-027 (conferência de retenções nas NFS-e), FIS-028 (guia do ISS fixo), FIS-025 e FIS-024 (guias e declarações estaduais), NFE-011 (captura das notas de produtor), CON-021 (regimes específicos da reforma, inclusive saúde e cooperativas, em visão geral), CON-023 (split payment em geral), CON-033/CON-034 (recuperação de créditos, inclusive DIFAL), CTB-011 (detectar contas de marketplace), SOC-033 (DIFAL e ISS na abertura de filial) e CIC-004 (jornada do cliente pessoa física com produtor rural). O LCDPR e a apuração da atividade rural no IRPF estão em `B7-pessoa-fisica.md` (PF-024 e PF-025), que ainda não estão no `indice.txt`; por isso não foram repetidos nem usados em `depende_de`.
- **Fichas novas:** NIC-001 a NIC-030 (setor "Nichos (por CNAE)").
- **Buscas usadas:** 22 de 24.
- **Premissa de horas_100:** escritório **especializado no nicho** com 100 clientes, dos quais só uma parte tem a condição do gatilho (ex.: 15 a 25 construtoras com obra ativa; 10 a 20 clínicas equiparadas; 30 a 50 vendedores de marketplace; 5 a 10 adquirentes de produção rural). São estimativas de ordem de grandeza, sem medição.

---

## 1. Resposta curta

1. **Cada nicho tem duas ou três rotinas que o escritório generalista não faz, e é por elas que o escritório de nicho escolhe software.** Construção: CNO, Sero e retenção de 11% por obra. Saúde: equiparação hospitalar e segregação de receita. E-commerce: DIFAL, conciliação de marketplace e intermediador na nota. Agro: opção do Funrural, DITR, nota do produtor e, agora, a opção das cooperativas pelo regime específico do IBS/CBS.
2. **Quase tudo é nível Próprio, D-assistido ou C-cert.** Os portais desses nichos (CNO, Sero, Minhas Declarações do ITR, opção das cooperativas) não têm API pública encontrada; a plataforma ganha na preparação, na simulação e na conferência, e a transmissão fica com a pessoa. As exceções com API são EFD-Reinf e eSocial (Funrural, CPRB e retenções) e a captura de NF-e/NFS-e.
3. **O pacote se ativa sozinho pelo CNAE e pelos documentos (NIC-001).** O perfil temporal (SOC-002) e as notas capturadas já dizem quem é construtora (divisões 41-43, item 7.02 da LC 116), clínica (86xx), vendedor de marketplace (indIntermed=1 na NF-e) ou produtor (seção A, CAEPF, notas de produtor). Isso é o que deixa o pacote "comprável" como adicional.
4. **Mudanças de 2026 que criaram rotina nova nesses nichos:**
   - **Funrural:** desde a competência 04/2026 o eSocial aplica 1,32% (contribuição) e 0,11% (GILRAT) sobre a comercialização do produtor rural PF, por força da LC 224/2025 [R17]; o segurado especial ficou fora da majoração após a versão 3 do Perguntas e Respostas da RFB [R18].
   - **DITR 2026:** feita prioritariamente no serviço Minhas Declarações do ITR com gov.br prata ou ouro; IN RFB 2.330/2026; prazo de 10/08 a 30/09/2026 [R20].
   - **Remessa Conforme:** II de 0% até US$ 50 para pessoa física em site certificado, em DIR registrada a partir de 12/05/2026 (era 20% de 01/08/2024 a 11/05/2026) [R13].
   - **Cooperativas:** opção pelo regime específico do IBS/CBS, com efeitos a partir de 01/01/2027, em duas etapas (opção e lista de associados); prazo de 31/10/2026, com ampliação para 30/11/2026 em discussão em 29/10/2026 [R22].
   - **Marketplaces:** pelos regulamentos do IBS/CBS (Resolução CGIBS 6/2026 e Decreto 12.955/2026), a plataforma responde solidariamente quando o vendedor nacional não emite nota ou emite em valor menor [R14].
   - **Reoneração da folha:** em 2026, 60% da alíquota da CPRB e 10% sobre a folha, segundo fontes secundárias [R5]; a opção segue as regras da FAQ da EFD-Reinf [R4].
5. **Lacunas de fonte:** o portal Normas da RFB e o site do Planalto não abriram nesta sessão (o primeiro só renderiza com JavaScript; o segundo devolveu conexão vazia). Por isso, as fichas que dependem do texto integral da IN 1.700/2017 (equiparação hospitalar), da IN 2.110/2022 e da IN 2.289/2025 (retenção de 11%), da LC 116/2003 e da LC 214/2025 ficaram com confiança **média** ou **baixa**.

---

## 2. Regras conferidas

| Regra | O que diz | Fonte | Confiança |
| --- | --- | --- | --- |
| Quem usa o Sero | Proprietário, dono da obra, incorporador (PF incorporador precisa de CNPJ), construtora e construção em nome coletivo; a obra precisa estar no CNO; alvarás e habite-se do SisobraPref (desde 11/02/2021) são vinculados à inscrição | [R1] Manual do Sero v3.0, 08/2024 | alta |
| Prazo do CNO | Inscrição em até 30 dias do início da obra (IN RFB 2.061/2021) | [R2] resumo da norma em busca | média |
| Opção CPRB × folha | CPRB: pagamento da primeira competência com receita, irretratável no ano (IN 2.053/2021, art. 2º, §6º); folha: S-1000 e R-1000 em janeiro | [R4] FAQ EFD-Reinf 2.7.16, 13/04/2026 | alta |
| Reoneração 2026 | 60% da alíquota da CPRB + 10% sobre a folha; 2027: 40% + 15%; 2028: folha integral | [R5] Lefosse, Barbieri, Demarest | média |
| Anexo IV do Simples | CPP fora do DAS, recolhida como nas demais empresas (LC 123, art. 13, VI; IN 971/2009, arts. 193 a 199) | [R6] RFB | alta |
| RET Incorporação | 4% para incorporação com patrimônio de afetação; 1% para interesse social (MCMV Faixa Urbano 1); CNPJ próprio por incorporação | [R8], [R9] FAQ RFB, 08/01/2025 | alta |
| Retenção de 11% | IN 2.110/2022, arts. 108 a 114; IN 2.289/2025 acrescentou hipóteses de não retenção; 3,5% quando a contratada é optante pela CPRB na transição | [R10], [R5] | média |
| Equiparação hospitalar | 8% (IRPJ) e 12% (CSLL) para serviços hospitalares e de auxílio diagnóstico e terapia (Atribuição 4 da RDC 50/2002); exige sociedade empresária, normas da Anvisa com alvará e veda ambiente de terceiros (IN 1.700/2017, arts. 33 e 34) | [R11] trechos de Soluções de Consulta | média |
| Remessa Conforme | RTS até US$ 3.000; II de 60% como regra; 0% até US$ 50 em site PRC para PF desde 12/05/2026; ICMS de 17% a 20% | [R13] RFB, 12/06/2026 | alta |
| Plataformas digitais | Responsáveis solidárias ou substitutas pelo IBS/CBS; solidárias com vendedor nacional que não emite nota ou subfatura; isenção de responsabilidade se informarem corretamente para o split | [R14] PwC, 14/07/2026 | média |
| Intermediador na NF-e | Grupo YB e indIntermed (NT 2020.006), validação desde 04/04/2022 | [R15] secundárias | média |
| Funrural 2026 | PF: 1,2% → 1,32% e GILRAT 0,1% → 0,11% a partir de 04/2026; segurado especial mantido | [R17], [R18] | alta |
| NF-e do produtor | Prazo geral de 05/01/2026 para substituir a nota modelo 4 (Ajuste SINIEF 27/2024) | [R21] secundárias | média |
| DITR 2026 | IN 2.330/2026; 10/08 a 30/09/2026; até 4 quotas de no mínimo R$ 50; multa de 1% ao mês, mínimo R$ 50 | [R20] RFB, 09/07/2026 | alta |
| Cooperativas | Opção pelo regime específico (LC 214, art. 271) com lista de associados; efeitos em 01/01/2027; janelas anuais em setembro e outubro | [R22] RFB, 29/10/2026 | alta |

---

## 3. Fichas

### Transversal (nichos)

#### NIC-001 · Detectar o nicho de cada cliente pelo CNAE e pelos documentos e ativar o pacote correspondente
- **Subárea:** Transversal (nichos) · **Etapas:** Entrada, Manutenção · **Frequência:** na entrada e a cada mudança de CNAE ou de padrão de notas
- **Gatilho (CNAE ou condição):** Qualquer cliente: divisões 41/42/43 (construção), 86xx (saúde), venda não presencial ou NF-e com intermediador (e-commerce), seção A 01-03, CAEPF ou natureza jurídica 214-3 cooperativa (agro)
- **Descrição:** Lê CNAEs do perfil temporal, notas emitidas e recebidas (indIntermed, CFOP de produtor, item 7.02 da LC 116, tomadores de serviço hospitalar) e propõe o pacote de nicho. Ao ativar, cria as obrigações, checklists e lembretes do nicho no calendário do cliente e marca o que exige procuração ou credencial nova.
- **Base legal:** Não se aplica (regra de produto)
- **Quem faz hoje:** sócio ou responsável técnico · **Concorrentes:** Acessórias e Gestta configuram obrigações por regime e departamento, sem pacotes por nicho `[NÃO VERIFICADO]`
- **Nível:** Próprio · **Confiança:** média · **Credencial:** Nenhuma · **Integração:** Perfil temporal e captura de documentos da própria plataforma · **Preço:** Interno
- **Papel da IA:** M2 classifica o cliente a partir do perfil e dos documentos; M4 cria tarefas e lembretes; a pessoa confirma a ativação.
- **Notas:** dor 3, freq 2, risco 4, dif 2 · **Autonomia:** Agente faz sozinho · **Core:** Não depende · **Substitui:** Planilha · **horas_100:** 3 · **Depende de:** SOC-002, FIS-001, NFE-004, NFE-005 · **Fase:** 5
- **Ferramentas:** `sugerir_nicho(cliente)`, `ativar_pacote(cliente, nicho)`
- **Fontes:** Inventário indice.txt (06/11/2026)


### Construção civil

#### NIC-002 · Inscrever cada obra no CNO e manter situação, responsáveis e vínculo com alvará
- **Subárea:** Construção civil · **Etapas:** Entrada, Manutenção · **Frequência:** por obra (início, alteração, encerramento)
- **Gatilho (CNAE ou condição):** Divisões 41, 42 e 43; também qualquer PJ ou PF dona de obra com mão de obra remunerada (inclusive reforma com acréscimo de área)
- **Descrição:** Inscrever a obra no Cadastro Nacional de Obras em até 30 dias do início, informando responsável (proprietário, dono da obra, incorporador, construtora ou construção em nome coletivo), área, destinação e categoria. Atualizar situação (ativa, paralisada, suspensa), corresponsáveis e vincular o alvará recebido do SisobraPref para depois usar o habite-se na aferição.
- **Base legal:** IN RFB 2.061/2021 (CNO); IN RFB 2.021/2021
- **Quem faz hoje:** analista fiscal/DP de construção · **Concorrentes:** Sem concorrente específico encontrado; feito no e-CAC manualmente
- **Nível:** C-cert · **Confiança:** média · **Credencial:** e-CNPJ do escritório + autorização de acesso, ou certificado do responsável · **Integração:** CNO no e-CAC (sem API pública encontrada) · **Preço:** Sem custo de serviço público
- **Papel da IA:** M2 detecta obra nova por contrato, alvará, notas de material com endereço de obra ou CNAE; M4 preenche o cadastro no e-CAC; a pessoa confere e transmite.
- **Notas:** dor 3, freq 2, risco 4, dif 3 · **Autonomia:** Agente prepara, pessoa conclui · **Core:** Lê do core · **Substitui:** Planilha · **horas_100:** 12 · **Depende de:** NIC-001, SOC-008, SOC-011, FIS-007 · **Fase:** 5
- **Ferramentas:** `inscrever_cno(obra)`, `atualizar_situacao_cno(cno, situacao)`, `vincular_alvara(cno, alvara)`
- **Fontes:** [R1] Manual do Sero v3.0, 08/2024 (lido 06/11/2026); [R2] RFB, notícia sobre a IN 2.061/2021 e resumo da norma (busca 06/11/2026)

#### NIC-003 · Aferir a obra no Sero, transmitir a DCTFWeb Aferição de Obras e obter a certidão para averbar o habite-se
- **Subárea:** Construção civil · **Etapas:** Manutenção, Desligamento · **Frequência:** por obra, no encerramento
- **Gatilho (CNAE ou condição):** Toda obra inscrita no CNO com responsável PF ou PJ (incorporadoras 4110-7, construtoras 4120-4, donos de obra)
- **Descrição:** No encerramento (ou na venda de unidades), apurar a remuneração da mão de obra total pelo Sero (VAU/CUB, fator social, percentual de mão de obra, decadência), abater a mão de obra já declarada por CNO e as notas de serviço com retenção, e transmitir a DCTFWeb Aferição. Pagar o DARF ou parcelar e emitir a certidão de regularidade da obra.
- **Base legal:** IN RFB 2.021/2021 (Sero e DCTFWeb Aferição de Obras)
- **Quem faz hoje:** analista de DP/fiscal sênior · **Concorrentes:** Consultorias de regularização de obra e despachantes; nenhum software de escritório com simulação encontrado
- **Nível:** C-cert · **Confiança:** alta · **Credencial:** gov.br/e-CAC do responsável ou e-CNPJ + autorização · **Integração:** Sero e DCTFWeb Aferição no e-CAC · **Preço:** Sem custo de serviço público
- **Papel da IA:** M3 simula a aferição antes do Sero com os dados da obra para mostrar o valor a pagar e o que reduz; M4 preenche; a pessoa transmite.
- **Notas:** dor 4, freq 1, risco 5, dif 4 · **Autonomia:** Agente prepara, pessoa conclui · **Core:** Lê do core · **Substitui:** Planilha · **horas_100:** 10 · **Depende de:** NIC-002, NIC-004, FIS-019 · **Fase:** 5
- **Ferramentas:** `simular_afericao(cno)`, `preencher_sero(cno)`, `emitir_certidao_obra(cno)`
- **Fontes:** [R1] Manual do Sero v3.0, 08/2024 (lido 06/11/2026)

#### NIC-004 · Montar o dossiê de mão de obra e materiais por obra (folha por CNO, notas com retenção, notas de material e serviços)
- **Subárea:** Construção civil · **Etapas:** Manutenção · **Frequência:** mensal
- **Gatilho (CNAE ou condição):** Divisões 41, 42 e 43 com obra ativa no CNO
- **Descrição:** Ao longo da obra, juntar por CNO a folha informada no eSocial com o CNO da lotação, as notas de subempreiteiros com retenção, as de concreto usinado, pré-moldados e material, que reduzem a aferição. Aponta mês a mês o que falta e o risco de a obra ser aferida pela tabela por falta de prova.
- **Base legal:** IN RFB 2.021/2021 (documentação mantida pelo prazo decadencial, conforme manual)
- **Quem faz hoje:** analista fiscal e DP · **Concorrentes:** ERPs de construção (Sienge, UAU) controlam custo por obra do lado do cliente `[NÃO VERIFICADO]`
- **Nível:** Próprio · **Confiança:** média · **Credencial:** Nenhuma além da captura já ativa · **Integração:** Captura de NF-e/NFS-e e eSocial da plataforma · **Preço:** Interno
- **Papel da IA:** M2 classifica cada nota e lançamento por obra; M3 compara o realizado com a remuneração mínima esperada pelo Sero.
- **Notas:** dor 4, freq 3, risco 4, dif 3 · **Autonomia:** Agente faz sozinho · **Core:** Lê do core · **Substitui:** Planilha, E-mail · **horas_100:** 20 · **Depende de:** NIC-002, NFE-004, NFE-007, DP-016 · **Fase:** 5
- **Ferramentas:** `dossie_obra(cno)`, `pendencias_obra(cno, competencia)`
- **Fontes:** [R1] Manual do Sero v3.0, 08/2024, itens sobre documentação e remuneração da mão de obra (lido 06/11/2026)

#### NIC-005 · Controlar retenções de 11% (ou 3,5% de optante pela CPRB) sofridas por obra e compensar ou pedir restituição do saldo
- **Subárea:** Construção civil · **Etapas:** Manutenção · **Frequência:** mensal
- **Gatilho (CNAE ou condição):** Divisões 42 e 43 (e 4120-4) prestando serviço por empreitada parcial, subempreitada ou cessão de mão de obra
- **Descrição:** Para a construtora prestadora em empreitada parcial ou subempreitada, conferir o destaque da retenção em cada nota, cruzar com o R-2020 e com o R-2010 do tomador, compensar na DCTFWeb e acumular o saldo não compensado por CNO. Quando a retenção supera a contribuição devida, preparar o pedido de restituição ou compensação.
- **Base legal:** IN RFB 2.110/2022, arts. 108 a 114 (com as hipóteses de não retenção acrescentadas pela IN RFB 2.289/2025)
- **Quem faz hoje:** analista fiscal · **Concorrentes:** Qive e SIEG capturam notas; não encontrado controle de saldo de retenção por obra
- **Nível:** D-assistido · **Confiança:** média · **Credencial:** e-CNPJ do escritório + autorização · **Integração:** EFD-Reinf (A), DCTFWeb e PER/DCOMP via e-CAC · **Preço:** Integra Contador quando usado para DCTFWeb
- **Papel da IA:** M3 calcula retenção esperada × destacada × compensada e o saldo por obra; M4 rascunha o PER/DCOMP; a pessoa transmite.
- **Notas:** dor 4, freq 3, risco 4, dif 3 · **Autonomia:** Agente prepara, pessoa conclui · **Core:** Lê do core · **Substitui:** Planilha · **horas_100:** 15 · **Depende de:** FIS-020, FIS-019, NFE-027, NIC-002 · **Fase:** 5
- **Ferramentas:** `saldo_retencao(cliente, cno)`, `rascunhar_perdcomp(cliente, periodo)`
- **Fontes:** [R10] Resumos da IN 2.110/2022 e IN 2.289/2025 (APET, Hondatar, Jornal Contábil; busca 06/11/2026); [R5] Ato RFB de 05/11/2026 citado em busca: retenção de 3,5% quando a contratada é optante pela CPRB na transição 2025-2027 `[NÃO VERIFICADO]`

#### NIC-006 · Decidir todo ano entre CPRB e folha para a construtora e configurar a opção no eSocial e na EFD-Reinf
- **Subárea:** Construção civil · **Etapas:** Manutenção · **Frequência:** anual (dezembro/janeiro)
- **Gatilho (CNAE ou condição):** Construção desonerada: 4120-4, 4211-1, 4212-0, 4213-8, 4221-9, 4222-7, 4223-5, 4291-0, 4292-8, 4299-5, 4311-8 a 4399-1 (lista do art. 7º da Lei 12.546/2011 `[NÃO VERIFICADO]`)
- **Descrição:** Simular, antes de janeiro, CPRB × contribuição sobre a folha na reoneração gradual (2026: 60% da alíquota da CPRB mais 10% sobre a folha; 2027: 40% mais 15%), com o compromisso de manter a média de empregados. A opção pela CPRB se faz pelo pagamento da primeira competência e é irretratável no ano; a opção pela folha vai no S-1000 e no R-1000 em janeiro.
- **Base legal:** Lei 12.546/2011, art. 9º-A (incluído pela Lei 14.973/2024); IN RFB 2.053/2021, art. 2º, §6º; IN RFB 2.242/2024
- **Quem faz hoje:** sócio/consultor e DP · **Concorrentes:** Planilhas de consultoria; core calcula o realizado, não simula
- **Nível:** Próprio · **Confiança:** média · **Credencial:** Nenhuma para simular; procuração eSocial para enviar · **Integração:** eSocial S-1000 e EFD-Reinf R-1000 (A) · **Preço:** Sem custo
- **Papel da IA:** M3 simula os dois regimes com a folha e a receita projetadas; M1 aplica o percentual do ano; a pessoa decide com o cliente.
- **Notas:** dor 3, freq 2, risco 4, dif 3 · **Autonomia:** Agente prepara, pessoa conclui · **Core:** Lê do core · **Substitui:** Planilha · **horas_100:** 6 · **Depende de:** DP-016, FIS-020, NIC-001 · **Fase:** 5
- **Ferramentas:** `simular_cprb_folha(cliente, ano)`, `registrar_opcao_cprb(cliente, ano, opcao)`
- **Fontes:** [R4] RFB, Perguntas frequentes EFD-Reinf 2.7.16 (publicado 02/04/2026, atualizado 13/04/2026; lido 06/11/2026); [R5] Lefosse, Barbieri Advogados e Demarest sobre a Lei 14.973/2024 (busca 06/11/2026)

#### NIC-007 · Calcular a CPP fora do DAS da optante do Simples no Anexo IV, inclusive com atividades mistas
- **Subárea:** Construção civil · **Etapas:** Manutenção · **Frequência:** mensal
- **Gatilho (CNAE ou condição):** Optante do Simples com serviço do art. 18, §5º-C da LC 123/2006 (construção de imóveis e obras de engenharia, divisões 41-43 exceto incorporação)
- **Descrição:** Para construtoras do Simples (Anexo IV), a CPP não está no DAS e é recolhida como nas demais empresas. Quando há atividades de outros anexos, separar empregados exclusivos, mistos e receita do mês para calcular a parcela da CPP devida fora do Simples e conferir com a DCTFWeb.
- **Base legal:** LC 123/2006, art. 13, VI, e art. 18, §5º-C; IN RFB 971/2009, arts. 193 a 199; SC Cosit 169/2024
- **Quem faz hoje:** analista DP/fiscal · **Concorrentes:** Domínio e outros cores calculam; não há conferência independente encontrada
- **Nível:** Próprio · **Confiança:** alta · **Credencial:** Nenhuma · **Integração:** Dados da folha e do PGDAS-D já na plataforma · **Preço:** Interno
- **Papel da IA:** M3 calcula a proporção por receita e alocação dos empregados; M2 confere se o core aplicou a regra.
- **Notas:** dor 3, freq 3, risco 4, dif 3 · **Autonomia:** Agente faz sozinho · **Core:** Lê do core · **Substitui:** Planilha · **horas_100:** 8 · **Depende de:** FIS-009, DP-016, FIS-019 · **Fase:** 5
- **Ferramentas:** `cpp_anexo_iv(cliente, competencia)`
- **Fontes:** [R6] RFB, Contribuição Previdenciária - Anexo IV do Simples Nacional (atualizado 16/03/2017; lido 06/11/2026); [R7] SC Cosit 169/2024 (trechos via busca 06/11/2026)

#### NIC-008 · Operar o RET de cada incorporação: afetação, CNPJ próprio, receita e custo segregados e DARF unificado de 4%
- **Subárea:** Construção civil · **Etapas:** Entrada, Manutenção, Desligamento · **Frequência:** mensal por incorporação
- **Gatilho (CNAE ou condição):** 4110-7 (incorporação de empreendimentos imobiliários) com patrimônio de afetação registrado; Minha Casa, Minha Vida (RET Construções)
- **Descrição:** Para cada incorporação com patrimônio de afetação, manter o CNPJ da incorporação, segregar receitas recebidas e custos, apurar o pagamento unificado de IRPJ, CSLL, PIS e Cofins (4%, ou 1% em habitação de interesse social) e emitir o DARF mensal. Controlar o fim do regime quando cessam os direitos e obrigações com adquirentes e acompanhar a transição para o regime imobiliário do IBS/CBS.
- **Base legal:** Lei 10.931/2004, arts. 1º a 11-A; Lei 4.591/1964, arts. 31-A a 31-E; IN RFB 2.179/2024
- **Quem faz hoje:** contador sênior · **Concorrentes:** ERPs imobiliários (Sienge, UAU, Mega) do lado do cliente `[NÃO VERIFICADO]`
- **Nível:** Próprio · **Confiança:** alta · **Credencial:** e-CNPJ do escritório + autorização (DARF) · **Integração:** Integra Contador para DARF (A$) ou Sicalc · **Preço:** Integra Contador por consulta `[PREÇO NÃO PÚBLICO]` neste levantamento
- **Papel da IA:** M3 apura o RET por empreendimento com a carteira de recebíveis; M2 alerta afetação ausente ou CNPJ não vinculado; a pessoa confere.
- **Notas:** dor 4, freq 3, risco 5, dif 4 · **Autonomia:** Agente prepara, pessoa conclui · **Core:** Lê e escreve no core · **Substitui:** Planilha · **horas_100:** 12 · **Depende de:** SOC-002, FIS-021, CTB-017, CON-021 · **Fase:** 5
- **Ferramentas:** `apurar_ret(incorporacao, competencia)`, `checar_afetacao(incorporacao)`
- **Fontes:** [R8] RFB, Perguntas frequentes: Qual a alíquota do RET Imobiliário? (08/01/2025; lido 06/11/2026); [R9] RFB, Qual a diferença entre RET Incorporações e RET Construções? (08/01/2025; lido 06/11/2026)

#### NIC-009 · Apurar o ISS de obra no município da obra, com dedução de materiais e retenção pelo tomador
- **Subárea:** Construção civil · **Etapas:** Manutenção · **Frequência:** mensal por obra
- **Gatilho (CNAE ou condição):** Serviços dos itens 7.02 e 7.05 da lista da LC 116/2003; divisões 41-43
- **Descrição:** Para cada obra, identificar o município onde o ISS é devido (local da obra), aplicar a dedução de materiais e subempreitadas aceita pela lei municipal, conferir a retenção feita pelo tomador e o cadastro da construtora no município da obra. Juntar as notas e guias por obra para a baixa municipal no habite-se.
- **Base legal:** LC 116/2003, art. 3º, III, e art. 7º, §2º, I (dedução de materiais) `[NÃO VERIFICADO: texto do Planalto inacessível nesta sessão]`
- **Quem faz hoje:** analista fiscal · **Concorrentes:** Nenhum específico encontrado
- **Nível:** C-captcha · **Confiança:** baixa · **Credencial:** Login municipal ou certificado · **Integração:** Portais municipais; ADN da NFS-e nacional onde houver · **Preço:** Variável
- **Papel da IA:** M1 consulta a regra de dedução do município; M3 calcula a base; M2 confere as NFS-e emitidas; a pessoa emite a guia onde não há API.
- **Notas:** dor 3, freq 3, risco 3, dif 4 · **Autonomia:** Agente prepara, pessoa conclui · **Core:** Lê do core · **Substitui:** Planilha · **horas_100:** 10 · **Depende de:** FIS-028, NFE-007, NIC-002 · **Fase:** 5
- **Ferramentas:** `iss_obra(cno, competencia)`
- **Fontes:** Sem fonte lida nesta sessão; regra conhecida da LC 116/2003 a confirmar

#### NIC-010 · Reconhecer receita e custo por obra pelo percentual de conclusão e controlar contratos de empreitada
- **Subárea:** Construção civil · **Etapas:** Manutenção · **Frequência:** mensal
- **Gatilho (CNAE ou condição):** 4110-7, 4120-4 e divisão 42 com contratos de longo prazo
- **Descrição:** Manter por contrato o orçamento, a medição e o custo incorrido, calcular o percentual de conclusão e a receita a reconhecer, e gerar os lançamentos para o core. Explicar ao cliente a diferença entre lucro contábil, caixa e tributação (receita recebida no presumido e no RET).
- **Base legal:** NBC TG 47 (CPC 47) e ITG/OCPC de incorporação `[NÃO VERIFICADO]`
- **Quem faz hoje:** contador · **Concorrentes:** ERPs de construção do cliente
- **Nível:** Próprio · **Confiança:** média · **Credencial:** Nenhuma · **Integração:** Arquivo de lançamentos do core · **Preço:** Interno
- **Papel da IA:** M3 calcula o percentual de conclusão; M4 gera o arquivo de lançamentos; a pessoa revisa.
- **Notas:** dor 3, freq 3, risco 3, dif 4 · **Autonomia:** Agente prepara, pessoa conclui · **Core:** Lê e escreve no core · **Substitui:** Planilha · **horas_100:** 12 · **Depende de:** NIC-004, CTB-017, CTB-024 · **Fase:** 5
- **Ferramentas:** `poc_obra(contrato, competencia)`, `gerar_lancamentos_poc(cliente, competencia)`
- **Fontes:** Sem fonte lida nesta sessão


### Saúde

#### NIC-011 · Verificar e documentar a equiparação hospitalar antes de aplicar 8% (IRPJ) e 12% (CSLL) no Lucro Presumido
- **Subárea:** Saúde · **Etapas:** Entrada, Manutenção · **Frequência:** na entrada e anual
- **Gatilho (CNAE ou condição):** 8610-1 (hospitalar), 8630-5/01 e /02 (ambulatorial com cirurgia ou exames complementares), 8640-2 (diagnóstico e terapia), no Lucro Presumido
- **Descrição:** Conferir se a clínica é sociedade empresária de fato e de direito, se presta serviço hospitalar ou de auxílio diagnóstico e terapia (Atribuição 4 da RDC Anvisa 50/2002), em ambiente próprio conforme a RDC e com alvará sanitário, sem usar ambiente de terceiros. Montar um dossiê anual com contrato, alvará, CNES, licenças e lista de procedimentos, para o caso de fiscalização.
- **Base legal:** Lei 9.249/1995, art. 15, §1º, III, a, e art. 20; IN RFB 1.700/2017, art. 33, §§1º, 3º e 4º, e art. 34; RDC Anvisa 50/2002
- **Quem faz hoje:** sócio ou consultor tributário · **Concorrentes:** Escritórios de nicho médico fazem manualmente; bancas de advocacia vendem a tese
- **Nível:** D-assistido · **Confiança:** média · **Credencial:** Nenhuma · **Integração:** App do cliente para documentos · **Preço:** Interno
- **Papel da IA:** M1 aplica o checklist da norma e das soluções de consulta; M2 coleta documentos pelo app; a pessoa emite o parecer de enquadramento.
- **Notas:** dor 4, freq 2, risco 5, dif 4 · **Autonomia:** Agente prepara, pessoa conclui · **Core:** Não depende · **Substitui:** Planilha, E-mail · **horas_100:** 8 · **Depende de:** NIC-001, SOC-002, SOC-034 · **Fase:** 5
- **Ferramentas:** `checar_equiparacao(cliente)`, `dossie_equiparacao(cliente, ano)`
- **Fontes:** [R11] Trechos de Soluções de Consulta Cosit sobre o art. 33 da IN 1.700/2017 no portal Normas da RFB (busca 06/11/2026; texto integral não lido porque o portal só abre com JavaScript)

#### NIC-012 · Segregar todo mês a receita hospitalar (8%/12%) da receita de consultas e outros serviços (32%)
- **Subárea:** Saúde · **Etapas:** Manutenção · **Frequência:** mensal, apuração trimestral
- **Gatilho (CNAE ou condição):** Clínicas com equiparação hospitalar ativa (NIC-011)
- **Descrição:** Classificar cada NFS-e da clínica entre procedimento hospitalar ou de diagnóstico e consulta simples ou serviço de terceiros, e apurar IRPJ e CSLL trimestrais com as bases corretas. Corrige a classificação do core quando a nota descreve consulta e foi tratada como procedimento.
- **Base legal:** IN RFB 1.700/2017, art. 33
- **Quem faz hoje:** analista fiscal · **Concorrentes:** Nenhum específico encontrado
- **Nível:** Próprio · **Confiança:** média · **Credencial:** Nenhuma · **Integração:** NFS-e capturadas · **Preço:** Interno
- **Papel da IA:** M2 classifica a descrição e o código de serviço de cada nota; M3 apura as bases; a pessoa revisa os casos duvidosos.
- **Notas:** dor 3, freq 3, risco 4, dif 3 · **Autonomia:** Agente faz sozinho · **Core:** Lê e escreve no core · **Substitui:** Planilha · **horas_100:** 10 · **Depende de:** NIC-011, NFE-007 · **Fase:** 5
- **Ferramentas:** `segregar_receita_saude(cliente, competencia)`
- **Fontes:** [R11] Trechos de Soluções de Consulta Cosit (busca 06/11/2026)

#### NIC-013 · Controlar alvará sanitário, CNES, registro da PJ no conselho e responsável técnico da clínica
- **Subárea:** Saúde · **Etapas:** Entrada, Manutenção · **Frequência:** anual por documento
- **Gatilho (CNAE ou condição):** 8610-1, 8630-5, 8640-2, 8650-0
- **Descrição:** Registrar validade do alvará da vigilância sanitária, inscrição no CNES, registro da PJ no CRM/CRO e o responsável técnico, e avisar antes do vencimento. Esses documentos sustentam a equiparação hospitalar e o credenciamento em convênios.
- **Base legal:** RDC Anvisa 50/2002; normas municipais de vigilância sanitária `[NÃO VERIFICADO]`
- **Quem faz hoje:** societário/legalização · **Concorrentes:** Acessórias controla vencimento de documentos genéricos `[NÃO VERIFICADO]`
- **Nível:** D-assistido · **Confiança:** baixa · **Credencial:** Nenhuma · **Integração:** Documentos enviados pelo cliente · **Preço:** Interno
- **Papel da IA:** M2 lê validade dos documentos enviados; M4 lembra o cliente e o responsável.
- **Notas:** dor 2, freq 2, risco 4, dif 2 · **Autonomia:** Agente organiza e lembra · **Core:** Não depende · **Substitui:** Planilha, WhatsApp · **horas_100:** 3 · **Depende de:** SOC-034, NIC-011 · **Fase:** 5
- **Ferramentas:** `registrar_licenca(cliente, tipo, validade)`
- **Fontes:** Sem fonte lida nesta sessão

#### NIC-014 · Manter o enquadramento de sociedade uniprofissional e o ISS fixo por profissional habilitado
- **Subárea:** Saúde · **Etapas:** Entrada, Manutenção · **Frequência:** por evento (alteração de sócios) e anual
- **Gatilho (CNAE ou condição):** Sociedades de médicos, dentistas, psicólogos, contadores, advogados e similares (8630-5/03, 8630-5/04, 8650-0) com ISS fixo no município
- **Descrição:** Verificar que todos os sócios são habilitados na mesma profissão, prestam o serviço pessoalmente e que a sociedade não tem caráter empresarial; atualizar o número de profissionais a cada entrada ou saída de sócio ou empregado habilitado. Acompanhar a regra da reforma, que mantém o regime fixo até a extinção do ISS em 2033.
- **Base legal:** Decreto-Lei 406/1968, art. 9º, §§1º e 3º; LC 214/2025 (sociedades profissionais) `[NÃO VERIFICADO]`
- **Quem faz hoje:** analista fiscal/societário · **Concorrentes:** Nenhum específico encontrado
- **Nível:** D-assistido · **Confiança:** baixa · **Credencial:** Login municipal · **Integração:** Portais municipais · **Preço:** Variável
- **Papel da IA:** M1 checa os requisitos com o contrato social e a lei municipal; M2 avisa quando uma alteração societária ameaça o enquadramento.
- **Notas:** dor 3, freq 2, risco 4, dif 3 · **Autonomia:** Agente prepara, pessoa conclui · **Core:** Não depende · **Substitui:** Planilha · **horas_100:** 4 · **Depende de:** FIS-028, SOC-002 · **Fase:** 5
- **Ferramentas:** `checar_sup(cliente)`
- **Fontes:** [R12] Reformatributaria.com e apresentação CRC-MG (07/2025) sobre o ISS fixo e a LC 214/2025; Hondatar sobre o STJ (REsp 2.162.486/2.162.487) (busca 06/11/2026)

#### NIC-015 · Conciliar os repasses de hospitais e operadoras com as notas emitidas, glosas e retenções
- **Subárea:** Saúde · **Etapas:** Manutenção · **Frequência:** mensal
- **Gatilho (CNAE ou condição):** 8630-5/03 (atividade médica ambulatorial restrita a consultas), médicos PJ que recebem de hospitais e operadoras
- **Descrição:** Para médicos PJ e clínicas, cruzar os demonstrativos de pagamento de hospitais e convênios (produção, glosas, retenções de IRRF, CSRF e ISS) com as NFS-e emitidas e os créditos bancários. Aponta produção sem nota, nota sem pagamento e retenção não compensada.
- **Base legal:** Retenções da Lei 10.833/2003 e do RIR/2018 `[NÃO VERIFICADO]`
- **Quem faz hoje:** analista contábil · **Concorrentes:** Softwares de faturamento médico do lado do cliente `[NÃO VERIFICADO]`
- **Nível:** F · **Confiança:** baixa · **Credencial:** Nenhuma · **Integração:** Demonstrativos enviados pelo cliente · **Preço:** Interno
- **Papel da IA:** M2 lê demonstrativos em PDF ou planilha; M3 concilia com notas e extrato; a pessoa trata as divergências com o cliente.
- **Notas:** dor 4, freq 3, risco 3, dif 3 · **Autonomia:** Agente faz sozinho · **Core:** Lê do core · **Substitui:** Planilha · **horas_100:** 15 · **Depende de:** NFE-007, CTB-008, NFE-027 · **Fase:** 5
- **Ferramentas:** `conciliar_repasses(cliente, competencia)`
- **Fontes:** Sem fonte lida nesta sessão


### E-commerce e marketplace

#### NIC-016 · Calcular e recolher o DIFAL nas vendas a consumidor final não contribuinte de outra UF
- **Subárea:** E-commerce e marketplace · **Etapas:** Manutenção · **Frequência:** por venda ou mensal
- **Gatilho (CNAE ou condição):** Comércio varejista (47xx) do Lucro Presumido ou Real com vendas interestaduais a não contribuinte (CFOP 6.107/6.108)
- **Descrição:** Para cada venda interestadual a não contribuinte, calcular o DIFAL da UF de destino (EC 87/2015, LC 190/2022), gerar a GNRE por nota ou por período e controlar onde vale a pena ter inscrição estadual de substituto. Dispensar o optante do Simples conforme o Convênio ICMS 236/2021 e a posição das Sefaz.
- **Base legal:** CF, art. 155, §2º, VII (EC 87/2015); LC 190/2022; Convênio ICMS 236/2021
- **Quem faz hoje:** analista fiscal · **Concorrentes:** Emissores e hubs de e-commerce (Bling, Tiny) calculam na emissão `[NÃO VERIFICADO]`
- **Nível:** A · **Confiança:** média · **Credencial:** Certificado do cliente para GNRE em lote · **Integração:** Portal/web service GNRE `[NÃO VERIFICADO]` · **Preço:** Sem custo público
- **Papel da IA:** M3 calcula o DIFAL por UF; M4 gera a GNRE; M2 sugere inscrição em UF de alto volume; a pessoa aprova.
- **Notas:** dor 4, freq 4, risco 4, dif 3 · **Autonomia:** Agente faz sozinho · **Core:** Lê do core · **Substitui:** Planilha · **horas_100:** 20 · **Depende de:** NFE-005, FIS-025, FIS-024 · **Fase:** 5
- **Ferramentas:** `difal_por_uf(cliente, competencia)`, `gerar_gnre(nota)`
- **Fontes:** [R16] Econet, explicação do DIFAL não contribuinte e Simples; Sefaz-SP RC 28.072/2023 citada (busca 06/11/2026)

#### NIC-017 · Conferir o intermediador nas NF-e e cruzar com as vendas informadas pelos marketplaces
- **Subárea:** E-commerce e marketplace · **Etapas:** Manutenção · **Frequência:** mensal
- **Gatilho (CNAE ou condição):** Vendedor com NF-e indIntermed=1 ou conta em marketplace (Mercado Livre, Shopee, Amazon, Magalu etc.)
- **Descrição:** Verificar se cada NF-e de venda por plataforma traz indIntermed e o CNPJ do intermediador (grupo YB) e se o total de notas bate com o relatório de vendas de cada marketplace. Na reforma, nota ausente ou em valor menor torna a plataforma solidária e pode levar ao bloqueio do vendedor.
- **Base legal:** Ajustes SINIEF 21/2020 e 22/2020; NT 2020.006 (v1.31); LC 214/2025, art. 22
- **Quem faz hoje:** analista fiscal · **Concorrentes:** Hubs de integração (Bling, Tiny, Olist) do lado do vendedor `[NÃO VERIFICADO]`
- **Nível:** Próprio · **Confiança:** média · **Credencial:** Nenhuma · **Integração:** XML capturado + relatório do marketplace · **Preço:** Interno
- **Papel da IA:** M2 lê XMLs e relatórios de venda; M3 concilia por pedido; M4 avisa o cliente das vendas sem nota.
- **Notas:** dor 4, freq 3, risco 5, dif 3 · **Autonomia:** Agente faz sozinho · **Core:** Não depende · **Substitui:** Planilha · **horas_100:** 18 · **Depende de:** NFE-005, NIC-018 · **Fase:** 5
- **Ferramentas:** `conferir_intermediador(cliente, competencia)`
- **Fontes:** [R15] NT 2020.006 v1.30/1.31 (resumos de Tecnospeed, Oobj, Inventti; busca 06/11/2026); [R14] PwC, Tax Intelligence ed. 07 'Marketplaces e Reforma Tributária', 14/07/2026 (lido 06/11/2026)

#### NIC-018 · Conciliar os repasses dos marketplaces com vendas, comissões, frete, antecipações, estornos e o extrato
- **Subárea:** E-commerce e marketplace · **Etapas:** Manutenção · **Frequência:** mensal (diária no BPO)
- **Gatilho (CNAE ou condição):** Vendedores com conta em marketplace; 4713-0, 4751-2, 4781-4 e demais 47xx com venda não presencial
- **Descrição:** Importar o extrato de cada conta de marketplace (vendas, tarifas, frete, antecipação, chargeback, retenções) e casar com as notas e com o crédito bancário. Gera os lançamentos de receita bruta, despesas de comissão e frete e o saldo a receber por plataforma.
- **Base legal:** Não se aplica
- **Quem faz hoje:** analista contábil ou BPO financeiro · **Concorrentes:** Conciliadores de marketplace e ERPs (Conta Azul, Omie) `[NÃO VERIFICADO]`
- **Nível:** B · **Confiança:** baixa · **Credencial:** Autorização OAuth do vendedor na plataforma `[NÃO VERIFICADO]` · **Integração:** APIs de vendedor dos marketplaces ou relatório exportado (F) · **Preço:** `[PREÇO NÃO PÚBLICO]`
- **Papel da IA:** M2 normaliza os extratos de cada plataforma; M3 concilia; M4 gera os lançamentos para o core.
- **Notas:** dor 5, freq 4, risco 3, dif 4 · **Autonomia:** Agente faz sozinho · **Core:** Escreve no core · **Substitui:** Planilha, Conta Azul, Omie · **horas_100:** 30 · **Depende de:** CTB-011, CTB-008, CTB-017 · **Fase:** 5
- **Ferramentas:** `importar_extrato_marketplace(conta, periodo)`, `conciliar_marketplace(cliente, competencia)`
- **Fontes:** Sem fonte lida nesta sessão: APIs dos marketplaces não verificadas

#### NIC-019 · Tratar devoluções e cancelamentos de venda online nas notas, no ICMS/DIFAL e no PGDAS-D
- **Subárea:** E-commerce e marketplace · **Etapas:** Manutenção · **Frequência:** mensal
- **Gatilho (CNAE ou condição):** Mesmo de NIC-018
- **Descrição:** Identificar devoluções (direito de arrependimento, troca) e cancelamentos, conferir a NF-e de entrada ou devolução, estornar ICMS, DIFAL e PIS/Cofins e ajustar a receita do Simples. Pede ao cliente a nota que falta quando só há estorno no marketplace.
- **Base legal:** Legislação estadual de devolução e Código de Defesa do Consumidor, art. 49 `[NÃO VERIFICADO]`
- **Quem faz hoje:** analista fiscal · **Concorrentes:** Nenhum específico encontrado
- **Nível:** Próprio · **Confiança:** média · **Credencial:** Nenhuma · **Integração:** XML + extrato do marketplace · **Preço:** Interno
- **Papel da IA:** M2 casa estornos do marketplace com notas de devolução; M3 calcula o ajuste; M4 cobra a nota faltante.
- **Notas:** dor 3, freq 3, risco 3, dif 3 · **Autonomia:** Agente faz sozinho · **Core:** Lê do core · **Substitui:** Planilha · **horas_100:** 10 · **Depende de:** NIC-018, NFE-005, FIS-009 · **Fase:** 5
- **Ferramentas:** `devolucoes(cliente, competencia)`
- **Fontes:** Sem fonte lida nesta sessão

#### NIC-020 · Preparar o vendedor para a responsabilidade das plataformas e o split payment do IBS/CBS a partir de 2027
- **Subárea:** E-commerce e marketplace · **Etapas:** Manutenção · **Frequência:** projeto em 2026-2027 e revisão anual
- **Gatilho (CNAE ou condição):** Vendedores em marketplace e as próprias plataformas clientes (7490-1/04, 6319-4/00)
- **Descrição:** Mapear em quais plataformas o cliente vende, quem emite o documento fiscal, se o marketplace origina o pagamento (split) e quais informações ele passará ao fisco. Ajustar cadastro de produtos, emissão no valor integral e o fluxo de caixa líquido do split.
- **Base legal:** LC 214/2025, arts. 22 e 23; Resolução CGIBS 6/2026; Decreto 12.955/2026
- **Quem faz hoje:** consultor tributário · **Concorrentes:** Consultorias tributárias
- **Nível:** Próprio · **Confiança:** média · **Credencial:** Nenhuma · **Integração:** Não se aplica · **Preço:** Interno
- **Papel da IA:** M1 aplica LC 214/2025 e os regulamentos; M3 simula o caixa com split; a pessoa orienta o cliente.
- **Notas:** dor 3, freq 2, risco 4, dif 4 · **Autonomia:** Agente prepara, pessoa conclui · **Core:** Não depende · **Substitui:** Nenhuma · **horas_100:** 6 · **Depende de:** CON-023, CON-021, NIC-017 · **Fase:** 5
- **Ferramentas:** `mapa_plataformas(cliente)`, `simular_split(cliente)`
- **Fontes:** [R14] PwC, Tax Intelligence ed. 07, 14/07/2026 (lido 06/11/2026); [R23] ConJur, 29/12/2025, responsabilidade das plataformas (busca 06/11/2026)

#### NIC-021 · Classificar e custear as importações do e-commerce (remessa simplificada, Remessa Conforme ou importação regular)
- **Subárea:** E-commerce e marketplace · **Etapas:** Manutenção · **Frequência:** por importação
- **Gatilho (CNAE ou condição):** Comércio varejista ou atacadista que importa mercadoria para revenda; CFOP 3.102 ou DIR/DSI em nome da PJ
- **Descrição:** Para cada compra externa, identificar o regime (RTS até US$ 3.000, com II de 60%; RTS em site do Remessa Conforme para pessoa física com 0% até US$ 50 desde 12/05/2026; ou importação regular), apurar II, ICMS e custo de entrada e exigir a documentação para o estoque. Avisa quando o volume pede habilitação no Radar e importação formal.
- **Base legal:** Regime de Tributação Simplificada; IN RFB 1.737/2017; Programa Remessa Conforme
- **Quem faz hoje:** analista fiscal · **Concorrentes:** Despachantes e tradings
- **Nível:** Próprio · **Confiança:** alta · **Credencial:** Nenhuma · **Integração:** Documentos de importação enviados pelo cliente · **Preço:** Interno
- **Papel da IA:** M1 aplica a regra vigente; M3 calcula custo de entrada; a pessoa confirma a classificação.
- **Notas:** dor 3, freq 3, risco 4, dif 3 · **Autonomia:** Agente prepara, pessoa conclui · **Core:** Lê e escreve no core · **Substitui:** Planilha · **horas_100:** 8 · **Depende de:** NFE-005, CTB-017 · **Fase:** 5
- **Ferramentas:** `custo_importacao(declaracao)`
- **Fontes:** [R13] RFB, Remessas postal e expressa: Tributação (atualizado 12/06/2026; lido 06/11/2026)

#### NIC-022 · Cruzar a receita declarada com as vendas por cartão, Pix e intermediadores informadas ao fisco estadual
- **Subárea:** E-commerce e marketplace · **Etapas:** Manutenção · **Frequência:** mensal
- **Gatilho (CNAE ou condição):** Varejo (47xx) com recebimento por cartão, Pix ou marketplace
- **Descrição:** Somar por mês os recebimentos por adquirentes, Pix e marketplaces e comparar com a receita das notas e do PGDAS-D ou da EFD, antes que a Sefaz faça o mesmo cruzamento. Aponta diferença e a provável causa (venda sem nota, nota de outra competência, devolução).
- **Base legal:** Convênio ICMS 134/2016 (DIMP) `[NÃO VERIFICADO]`
- **Quem faz hoje:** analista fiscal · **Concorrentes:** Conciliadores de cartão (Equals, Concil) `[NÃO VERIFICADO]`
- **Nível:** F · **Confiança:** baixa · **Credencial:** Nenhuma · **Integração:** Relatórios de adquirentes e extratos (F/B) · **Preço:** Interno
- **Papel da IA:** M3 cruza as fontes; M2 explica a diferença; M4 avisa o cliente.
- **Notas:** dor 3, freq 3, risco 5, dif 3 · **Autonomia:** Agente faz sozinho · **Core:** Lê do core · **Substitui:** Planilha · **horas_100:** 10 · **Depende de:** NIC-018, FIS-009, CTB-008 · **Fase:** 5
- **Ferramentas:** `cruzar_receita_meios_pagamento(cliente, competencia)`
- **Fontes:** Sem fonte lida nesta sessão


### Agro

#### NIC-023 · Escolher todo ano o Funrural sobre a comercialização ou sobre a folha e aplicar as alíquotas vigentes
- **Subárea:** Agro · **Etapas:** Manutenção · **Frequência:** anual (opção em janeiro)
- **Gatilho (CNAE ou condição):** Seção A (01, 02, 03) PJ; produtor rural PF com CAEPF e empregados
- **Descrição:** Simular, antes de janeiro, a contribuição sobre a receita da comercialização × sobre a folha para produtor PF empregador e PJ, e registrar a opção. Desde a competência 04/2026 o eSocial aplica 1,32% e 0,11% (GILRAT) ao produtor PF empregador, enquanto o segurado especial ficou fora da majoração da LC 224/2025.
- **Base legal:** Lei 8.212/1991, art. 25 e §13; Lei 8.870/1994, art. 25; Lei 13.606/2018 (opção); LC 224/2025
- **Quem faz hoje:** consultor e DP rural · **Concorrentes:** Planilhas e consultorias de agronegócio
- **Nível:** Próprio · **Confiança:** alta · **Credencial:** Procuração eSocial · **Integração:** eSocial (A) · **Preço:** Sem custo
- **Papel da IA:** M3 simula os dois regimes com a safra e a folha projetadas; M1 aplica as alíquotas vigentes; a pessoa decide com o produtor.
- **Notas:** dor 3, freq 2, risco 4, dif 3 · **Autonomia:** Agente prepara, pessoa conclui · **Core:** Lê do core · **Substitui:** Planilha · **horas_100:** 6 · **Depende de:** DP-016, CIC-004, NIC-001 · **Fase:** 5
- **Ferramentas:** `simular_funrural(cliente, ano)`, `registrar_opcao_funrural(cliente, ano)`
- **Fontes:** [R17] eSocial, notícia de 01/04/2026 (atualizada 13/05/2026) sobre LC 224/2025 (lida 06/11/2026); [R18] MDA, 30/03/2026 (atualizada 26/10/2026), segurado especial fora da majoração (lida 06/11/2026); [R19] Compre Rural e Canal Rural sobre prazo de opção até 31 de janeiro (busca 06/11/2026)

#### NIC-024 · Apurar e informar o Funrural retido nas aquisições de produção rural (adquirente, cooperativa, agroindústria)
- **Subárea:** Agro · **Etapas:** Manutenção · **Frequência:** mensal
- **Gatilho (CNAE ou condição):** Adquirentes de produção rural: 1011-2, 1051-1, 4621-4, 4622-2, 4623-1, cooperativas agropecuárias (natureza 214-3)
- **Descrição:** Para cliente que compra de produtor PF ou segurado especial, calcular a contribuição sub-rogada e a do Senar sobre cada nota de entrada, separar quem optou pela folha (sem retenção) e informar na EFD-Reinf. Conferir a nota do produtor e a alíquota após a LC 224/2025.
- **Base legal:** Lei 8.212/1991, art. 30, III e IV; EFD-Reinf R-2055 (aquisição de produção rural) `[NÃO VERIFICADO]`
- **Quem faz hoje:** analista fiscal · **Concorrentes:** Cores calculam na escrituração
- **Nível:** A · **Confiança:** média · **Credencial:** Procuração/certificado para EFD-Reinf · **Integração:** EFD-Reinf (A) · **Preço:** Sem custo
- **Papel da IA:** M2 classifica as notas de entrada de produtor; M3 calcula; M4 gera o evento; a pessoa fecha a Reinf.
- **Notas:** dor 3, freq 3, risco 4, dif 3 · **Autonomia:** Agente faz sozinho · **Core:** Lê do core · **Substitui:** Planilha · **horas_100:** 10 · **Depende de:** NFE-011, FIS-020, NIC-023 · **Fase:** 5
- **Ferramentas:** `funrural_aquisicoes(cliente, competencia)`
- **Fontes:** [R17] eSocial, 01/04/2026 (lida 06/11/2026); [R19] TOTVS, orientação sobre valor limite do Funrural (busca 06/11/2026)

#### NIC-025 · Colocar o produtor rural para emitir NF-e e conferir as notas emitidas
- **Subárea:** Agro · **Etapas:** Entrada, Manutenção · **Frequência:** na implantação e mensal
- **Gatilho (CNAE ou condição):** Produtor rural PF ou PJ com inscrição estadual (seção A)
- **Descrição:** Com o fim da nota de produtor modelo 4 (prazo geral de 05/01/2026 pelo Ajuste SINIEF 27/2024), orientar o produtor a emitir NF-e pelo aplicativo da Sefaz ou por emissor, com inscrição estadual e certificado, e conferir CFOP, Funrural e destaque de ICMS nas notas emitidas.
- **Base legal:** Ajuste SINIEF 10/2022, alterado pelo Ajuste SINIEF 27/2024
- **Quem faz hoje:** analista fiscal ou atendimento · **Concorrentes:** Aplicativos das Sefaz (NFF) e emissores comerciais
- **Nível:** D-assistido · **Confiança:** média · **Credencial:** e-CPF ou certificado do produtor · **Integração:** Distribuição de NF-e (A) para conferir · **Preço:** Sem custo público
- **Papel da IA:** M2 confere cada nota emitida; M4 guia o produtor no app e lembra de emitir; a pessoa ajuda nos casos de erro.
- **Notas:** dor 3, freq 3, risco 3, dif 2 · **Autonomia:** Agente prepara, pessoa conclui · **Core:** Não depende · **Substitui:** WhatsApp · **horas_100:** 8 · **Depende de:** NFE-011, SOC-008, CIC-004 · **Fase:** 5
- **Ferramentas:** `conferir_nfe_produtor(cliente, competencia)`
- **Fontes:** [R21] Faesp/Senar, Informe Técnico 24/24 (12/12/2024); Contábeis e Notícias Agrícolas sobre o Ajuste SINIEF 27/2024 (busca 06/11/2026)

#### NIC-026 · Preparar e entregar a DITR de cada imóvel rural, com CAR, VTN e quotas
- **Subárea:** Agro · **Etapas:** Manutenção · **Frequência:** anual (agosto-setembro)
- **Gatilho (CNAE ou condição):** Proprietário, titular do domínio útil ou possuidor de imóvel rural (PF ou PJ), não imune ou isento
- **Descrição:** Juntar por imóvel o NIRF, o recibo do CAR, áreas (tributável, de preservação, utilizada), o valor da terra nua e os dados do ano, preencher no Minhas Declarações do ITR (gov.br prata ou ouro) e controlar as até quatro quotas. Em 2026 o prazo foi de 10/08 a 30/09, com multa de 1% ao mês e mínimo de R$ 50 pelo atraso.
- **Base legal:** Lei 9.393/1996; IN RFB 2.330/2026
- **Quem faz hoje:** analista de IRPF/rural · **Concorrentes:** Programa ITR e serviço web da RFB; sem software de escritório específico encontrado
- **Nível:** D-assistido · **Confiança:** alta · **Credencial:** gov.br prata ou ouro do contribuinte (obrigatória para PJ e PF acima de 100 ha) · **Integração:** Minhas Declarações do ITR (sem API) · **Preço:** Sem custo
- **Papel da IA:** M2 recupera a declaração anterior e os dados do CAR; M3 calcula o imposto; M4 lembra quotas; a pessoa transmite com o acesso do contribuinte.
- **Notas:** dor 3, freq 2, risco 4, dif 3 · **Autonomia:** Agente prepara, pessoa conclui · **Core:** Não depende · **Substitui:** Planilha · **horas_100:** 10 · **Depende de:** CIC-004, SOC-014, FIS-001 · **Fase:** 5
- **Ferramentas:** `preparar_ditr(imovel, ano)`, `quotas_itr(imovel)`
- **Fontes:** [R20] RFB, 'DITR 2026: prazo de entrega começa em 10 de agosto', 09/07/2026 (lido 06/11/2026)

#### NIC-027 · Montar o dossiê do produtor para crédito rural e acompanhar as parcelas
- **Subárea:** Agro · **Etapas:** Manutenção · **Frequência:** por safra (1 a 2 vezes por ano)
- **Gatilho (CNAE ou condição):** Produtor rural PF ou PJ tomador de crédito rural (custeio, investimento, comercialização)
- **Descrição:** Juntar IRPF ou balanço, LCDPR, CAR, CCIR, ITR, certidões, notas de venda e projeto exigidos pelo banco ou cooperativa de crédito, e controlar vencimentos, Proagro e renegociações. O escritório costuma ser cobrado por esse pacote em cada safra.
- **Base legal:** Manual de Crédito Rural do Banco Central `[NÃO VERIFICADO]`
- **Quem faz hoje:** atendimento e contador · **Concorrentes:** Consultorias de crédito rural
- **Nível:** F · **Confiança:** baixa · **Credencial:** Nenhuma · **Integração:** Documentos do cofre da plataforma · **Preço:** Interno
- **Papel da IA:** M2 monta o pacote com os documentos já guardados e lista o que falta; M4 lembra vencimentos.
- **Notas:** dor 3, freq 2, risco 3, dif 2 · **Autonomia:** Agente prepara, pessoa conclui · **Core:** Lê do core · **Substitui:** E-mail, WhatsApp · **horas_100:** 8 · **Depende de:** SOC-034, NIC-026, CIC-004 · **Fase:** 5
- **Ferramentas:** `dossie_credito_rural(cliente, safra)`
- **Fontes:** Sem fonte lida nesta sessão

#### NIC-028 · Fazer a opção da cooperativa pelo regime específico do IBS/CBS e manter a lista de associados
- **Subárea:** Agro · **Etapas:** Manutenção · **Frequência:** anual (setembro-outubro) e a cada admissão
- **Gatilho (CNAE ou condição):** Natureza jurídica 214-3 (cooperativa), especialmente agropecuárias (4623-1, 4632-0, 1051-1 etc.)
- **Descrição:** Simular o efeito do regime específico (alíquota zero nas operações previstas entre cooperativa e associados), registrar a opção no Portal de Serviços e enviar a lista de associados com datas de admissão, nas janelas de setembro e outubro de cada ano. Para 2026 o prazo era 31/10, com ampliação para 30/11 em discussão pela RFB e CGIBS em 29/10/2026.
- **Base legal:** LC 214/2025, art. 271; Decreto 12.955/2026; Resolução CGIBS 6/2026
- **Quem faz hoje:** contador e consultor · **Concorrentes:** Consultorias tributárias
- **Nível:** D-assistido · **Confiança:** alta · **Credencial:** Acesso ao Portal de Serviços da RFB · **Integração:** Portal de Serviços RFB (envio de arquivo) · **Preço:** Sem custo
- **Papel da IA:** M3 simula com e sem o regime; M2 mantém a lista de associados; a pessoa registra a opção.
- **Notas:** dor 3, freq 2, risco 4, dif 4 · **Autonomia:** Agente prepara, pessoa conclui · **Core:** Lê do core · **Substitui:** Planilha · **horas_100:** 4 · **Depende de:** CON-021, SOC-004, NIC-001 · **Fase:** 5
- **Ferramentas:** `simular_regime_cooperativa(cliente)`, `exportar_lista_associados(cliente)`
- **Fontes:** [R22] RFB, notícia de 29/10/2026 sobre ampliação do prazo (lida 06/11/2026); Roteiro da Opção, manual_cooperativas.pdf (busca 06/11/2026)

#### NIC-029 · Simular a estrutura do produtor (PF, PJ ou holding rural) com IRPF da atividade rural, Funrural e sucessão
- **Subárea:** Agro · **Etapas:** Entrada, Manutenção · **Frequência:** eventual (na entrada e em grandes mudanças)
- **Gatilho (CNAE ou condição):** Produtor rural PF com receita relevante ou sucessão familiar em vista
- **Descrição:** Comparar a carga do produtor como PF (resultado real ou 20% da receita), PJ no presumido ou no real e holding patrimonial, incluindo Funrural, ITR, ITCMD e o IRPFM. Entrega relatório com números e riscos para decisão.
- **Base legal:** Lei 8.023/1990 (atividade rural no IR); Lei 15.270/2025 (IRPFM) `[NÃO VERIFICADO]`
- **Quem faz hoje:** sócio/consultor · **Concorrentes:** Consultorias de planejamento patrimonial
- **Nível:** Próprio · **Confiança:** média · **Credencial:** Nenhuma · **Integração:** Não se aplica · **Preço:** Interno
- **Papel da IA:** M3 simula cenários; M1 cita as regras; a pessoa assina o parecer.
- **Notas:** dor 3, freq 1, risco 4, dif 4 · **Autonomia:** Agente prepara, pessoa conclui · **Core:** Lê do core · **Substitui:** Planilha · **horas_100:** 6 · **Depende de:** CIC-004, NIC-023, NIC-026 · **Fase:** 5
- **Ferramentas:** `simular_estrutura_rural(cliente)`
- **Fontes:** Ver B7-pessoa-fisica.md (PF-025, PF-026) para as regras de IRPF rural e IRPFM

#### NIC-030 · Controlar estoque de produção, rebanho e custo da safra para a contabilidade do produtor PJ
- **Subárea:** Agro · **Etapas:** Manutenção · **Frequência:** mensal ou por safra
- **Gatilho (CNAE ou condição):** Seção A (01, 02, 03) PJ no Lucro Real ou Presumido com escrituração completa
- **Descrição:** Receber do cliente (ou do ERP rural) a posição de rebanho, estoques de grãos e insumos e o custo por safra e talhão, avaliar ativos biológicos e produtos agrícolas e gerar os lançamentos de fechamento. Sem isso o balanço do produtor PJ fica sem estoque nem resultado por safra.
- **Base legal:** NBC TG 29 (CPC 29) `[NÃO VERIFICADO]`
- **Quem faz hoje:** contador · **Concorrentes:** ERPs rurais do lado do cliente (Aegro, Siagri) `[NÃO VERIFICADO]`
- **Nível:** F · **Confiança:** baixa · **Credencial:** Nenhuma · **Integração:** Arquivo do ERP rural (F) · **Preço:** Interno
- **Papel da IA:** M2 lê planilhas e relatórios do ERP rural; M3 avalia; M4 gera lançamentos.
- **Notas:** dor 3, freq 3, risco 3, dif 4 · **Autonomia:** Agente prepara, pessoa conclui · **Core:** Escreve no core · **Substitui:** Planilha · **horas_100:** 10 · **Depende de:** CTB-017, CTB-024 · **Fase:** 5
- **Ferramentas:** `fechamento_safra(cliente, safra)`
- **Fontes:** Sem fonte lida nesta sessão

---

## 4. Como os pacotes se vendem (leitura para o produto)

| Pacote | Fichas | Gatilho principal | horas_100 somadas | O que convence o escritório de nicho |
| --- | --- | --- | --- | --- |
| Construção civil | NIC-002 a NIC-010 | Divisões 41, 42, 43 | 105 | Simulação da aferição antes do Sero (NIC-003) e dossiê por obra (NIC-004), que hoje não existem em nenhum software de escritório encontrado |
| Saúde | NIC-011 a NIC-015 | 8610-1, 8630-5, 8640-2, 8650-0 | 40 | Dossiê de equiparação hospitalar defensável (NIC-011) e conciliação de repasses de convênios (NIC-015) |
| E-commerce e marketplace | NIC-016 a NIC-022 | 47xx com venda não presencial; NF-e com intermediador | 102 | Conciliação de marketplace (NIC-018, a maior dor) e cruzamento nota × venda antes do fisco e da plataforma (NIC-017, NIC-022) |
| Agro | NIC-023 a NIC-030 | Seção A, CAEPF, natureza 214-3 | 62 | Funrural e DITR com as regras de 2026 (NIC-023, NIC-026) e a opção das cooperativas (NIC-028) |

Todas as fichas ficam na **fase 5** (nichos e expansão) e dependem de fichas das fases 0 a 4 (perfil temporal, cofre, autorizações, captura, EFD-Reinf, DCTFWeb, regimes específicos e split payment).

---

## 5. Referências

| Ref. | Fonte | Data da página / consulta |
| --- | --- | --- |
| R1 | RFB, Serviço Eletrônico para Aferição de Obras, Manual do Contribuinte v3.0 — https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/manuais/manual-do-sero/manual-do-sero.pdf | 08/2024; lido 06/11/2026 |
| R2 | RFB, "Receita Federal publica nova Instrução Normativa sobre o Cadastro Nacional de Obras" — https://www.gov.br/receitafederal/pt-br/assuntos/noticias/2021/dezembro/receita-federal-publica-nova-instrucao-normativa-sobre-o-cadastro-nacional-de-obras ; IN RFB 2.061/2021 — https://normas.receita.fazenda.gov.br/sijut2consulta/link.action?visao=anotado&idAto=122299 (resumo via busca; portal não abriu sem JavaScript) | 12/2021; busca 06/11/2026 |
| R3 | IN RFB 2.021/2021 — https://normas.receita.fazenda.gov.br/sijut2consulta/link.action?idAto=116968 (não lido) | busca 06/11/2026 |
| R4 | RFB, Perguntas frequentes EFD-Reinf 2.7.16 — https://www.gov.br/receitafederal/pt-br/acesso-a-informacao/perguntas-frequentes/sped/efd-reinf/efdr/2-eventos-da-efd-reinf/2-7-16-caso-uma-empresa | 02/04/2026, atualizado 13/04/2026; lido 06/11/2026 |
| R5 | Lefosse — https://lefosse.com/?p=23979 ; Barbieri Advogados — https://www.barbieriadvogados.com/a-reoneracao-progressiva-da-folha-de-pagamento-analise-juridica-e-projecao-de-impactos-da-lei-no-14-973-2024/ ; Demarest — https://demarest.com.br/wp-content/uploads/2024/09/DEMAREST_SP-12477384-v2-Demarest_Client_Alert_Lei_14973_2024.pdf ; ato RFB de 05/11/2026 sobre retenção de 3,5% citado em busca (não lido) | busca 06/11/2026 |
| R6 | RFB, Contribuição Previdenciária - Anexo IV do Simples Nacional — https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/cobrancas-e-intimacoes/contribuicao-previdenciaria-anexo-iv-do-simples-nacional | atualizado 16/03/2017; lido 06/11/2026 |
| R7 | SC Cosit 169/2024 — https://normas.receita.fazenda.gov.br/sijut2consulta/link.action?idAto=138863 (trechos via busca) | busca 06/11/2026 |
| R8 | RFB, Qual a alíquota do RET Imobiliário? — https://www.gov.br/receitafederal/pt-br/acesso-a-informacao/perguntas-frequentes/beneficios-fiscais/beneficios-fiscais/incorporacao-imobiliaria/qual-a-aliquota-do-ret | 08/01/2025; lido 06/11/2026 |
| R9 | RFB, Qual a diferença entre RET Incorporações e RET Construções? — https://www.gov.br/receitafederal/pt-br/acesso-a-informacao/perguntas-frequentes/beneficios-fiscais/beneficios-fiscais/incorporacao-imobiliaria/qual-a-diferenca-entre-ret | 08/01/2025; lido 06/11/2026 |
| R10 | IN RFB 2.289/2025 (cópia APET) — https://rota.apet.org.br/wp-content/uploads/2025/11/Instrucao-Normativa-RFB-n°-2289-2025.pdf (download falhou); Hondatar — https://www.hondatar.com.br/?p=9690 ; Jornal Contábil — https://jornalcontabil.com.br/noticia/retencao-previdenciaria-e-obrigacoes-acessorias-esocial-efd-reinf-e-gfip/ | busca 06/11/2026 |
| R11 | IN RFB 1.700/2017 — https://normas.receita.fazenda.gov.br/sijut2consulta/link.action?idAto=81268&visao=anotado ; Solução de Consulta Cosit (anexo) — https://normas.receita.fazenda.gov.br/sijut2consulta/anexoOutros.action?idArquivoBinario=75122 (trechos via busca) | busca 06/11/2026 |
| R12 | Reformatributaria.com, ISS fixo e reforma — https://www.reformatributaria.com/brasil/o-iss-fixo-como-criterio-proprio-de-tributacao-natureza-juridica-evolucao-constitucional-e-perspectivas-frente-a-reforma-tributaria/ ; CRC-MG — https://crcmg.org.br/wp-content/uploads/2025/07/ApresentacaoReformaTributariaDanielCardosoProfissionaisContabeis.pdf ; Hondatar (STJ) — https://www.hondatar.com.br/?p=9574 | busca 06/11/2026 |
| R13 | RFB, Remessas postal e expressa: Tributação — https://www.gov.br/receitafederal/pt-br/assuntos/aduana-e-comercio-exterior/manuais/remessas-postal-e-expressa/topicos/tributacao | atualizado 12/06/2026; lido 06/11/2026 |
| R14 | PwC, Tax Intelligence ed. 07, "Marketplaces e Reforma Tributária sobre o consumo" — https://www.pwc.com.br/pt/thinking-about-taxes/tax-intelligence/2026/tax-intelligence-raciocinios-ed-07_marketplaces.pdf | 14/07/2026; lido 06/11/2026 |
| R15 | Tecnospeed, NT 2020.006 — https://blog.tecnospeed.com.br/nota-tecnica-2020-006-da-nfe-e-nfce/ ; Inventti (NT v1.31) — https://inventti.com.br/wp-content/uploads/2022/09/NT2020.006-v1.31.pdf | busca 06/11/2026 |
| R16 | Econet, DIFAL não contribuinte e Simples — https://blog.econeteditora.com.br/econet-explica-a-cobranca-do-difal-nao-contribuinte-lc-190-2022-e-o-simples-nacional | busca 06/11/2026 |
| R17 | eSocial, "eSocial atualiza cálculo de contribuições previdenciárias conforme LC 224/2025" — https://www.gov.br/esocial/pt-br/noticias/esocial-atualiza-calculo-de-contribuicoes-previdenciarias-conforme-lei-complementar-no-224-2025 | 01/04/2026, atualizado 13/05/2026; lido 06/11/2026 |
| R18 | MDA, "Agricultor familiar não sofrerá impactos..." — https://www.gov.br/mda/pt-br/noticias/2026/03/agricultor-familiar-nao-sofrera-impactos-referentes-ao-recolhimento-de-previdencia-rural | 30/03/2026, atualizado 26/10/2026; lido 06/11/2026 |
| R19 | Compre Rural, prazo da opção até 31/01 — https://comprerural.com/funrural-produtores-tem-ate-31-de-janeiro-para-definir-forma-de-recolhimento-em-2026/ ; TOTVS, orientação Funrural — https://tdn.totvs.com.br/download/attachments/185755058/ | busca 06/11/2026 |
| R20 | RFB, "DITR 2026: prazo de entrega começa em 10 de agosto" — https://www.gov.br/receitafederal/pt-br/assuntos/noticias/2026/julho/ditr-2026-prazo-de-entrega-comeca-em-10-de-agosto | 09/07/2026; lido 06/11/2026 |
| R21 | Faesp/Senar, Informe Técnico 24/24 — https://faespsenar.com.br/painel-de-dados/wp-content/uploads/2024/12/Informe-Tecnico-no-24-24-APP-NFF-para-emissao-da-NF-e-pelo-produtor-rural-versao-atualizada-12-12-24-Ajuste-Sinief-27-24.pdf ; Contábeis — https://www.contabeis.com.br/noticias/68955/nf-e-sera-obrigatoria-para-produtores-rurais-ja-em-fevereiro | 12/2024; busca 06/11/2026 |
| R22 | RFB, "Receita Federal e CGIBS discutem ampliação do prazo de opção pelo regime específico da CBS e do IBS para as cooperativas até 30 de novembro" — https://www.gov.br/receitafederal/pt-br/assuntos/noticias/2026/outubro/receita-federal-e-cgibs-discutem-ampliacao-do-prazo-de-opcao-pelo-regime-especifico-da-cbs-e-do-ibs-para-as-cooperativas-ate-30-de-novembro ; Roteiro da Opção — https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/manuais/reforma-tributaria-do-consumo/manual_cooperativas.pdf | 29/10/2026; lido 06/11/2026 |
| R23 | ConJur, responsabilidade tributária das plataformas digitais — https://www.conjur.com.br/2025-dez-29/responsabilidade-tributaria-das-plataformas-digitais-na-reforma/ | 29/12/2025; busca 06/11/2026 |

**Não encontrado nesta sessão:** API pública do CNO, do Sero e do Minhas Declarações do ITR `[NÃO ENCONTRADO]`; texto do Manual de Crédito Rural (a página do BCB não devolveu conteúdo legível); APIs de vendedor dos marketplaces e seus termos (não pesquisadas por falta de cota de buscas).

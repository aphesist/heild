# B7 — Pessoa física: atividades recorrentes do escritório com clientes PF

- **Data:** 06/11/2026 (páginas consultadas nesta data, salvo indicação)
- **Pedido:** um dos contadores do grupo apontou como recorrentes, para clientes pessoa física: IRPF (coleta, pré-preenchida, malha, retificação, restituição, quotas), carnê-leão (aluguel, exterior, profissionais liberais, Receita Saúde), saída definitiva, dupla residência e tratados, ganho de capital (imóveis, bens, renda variável, day trade, cripto e DeCripto), rendimentos no exterior (Lei 14.754/2023), espólio, doações e ITCMD, LCDPR, IRPFM (Lei 15.270/2025) e empregado doméstico.
- **Inventário conferido:** `indice.txt` (466 fichas). Fichas já existentes que tocam PF e **não** foram duplicadas: SOC-004 (pessoas vinculadas), SOC-011 e SOC-014 (autorização e gov.br), FIS-021 (DARF fora da DCTFWeb, inclusive carnê-leão e ganho de capital), CTB-034 e CTB-035 (retenção de 10% e estimativa do IRPFM do sócio), CON-012 e CON-014 (planejamento de retiradas e holding), GES-002, GES-009 e SOC-017 (cobrança do IRPF como extra), GES-030 (aviso em massa da campanha), CIC-004 (jornada PF, resumo), CIC-006 (falecimento) e DP-062 (folha do doméstico). As fichas abaixo detalham a jornada PF que CIC-004 só resume.
- **Fichas novas:** PF-001 a PF-027 (setor "Pessoa física").
- **Buscas usadas:** 21 de 24.

---

## 1. Resposta curta

1. **Quase nada do IRPF tem API para o escritório.** O Integra Contador não apareceu com serviço de declaração de IRPF, pré-preenchida ou Carnê-Leão Web `[NÃO ENCONTRADO]` (buscado: "Integra Contador serviços pessoa física IRPF declaração consulta DARF carnê-leão serpro catálogo") [R23]. O caminho oficial para o contador é a procuração eletrônica no e-CAC ou a autorização do Meu Imposto de Renda, que dura no máximo seis meses [R10]. Por isso a maior parte das fichas fica em **D-assistido** (o agente monta tudo, a pessoa transmite no programa da Receita) ou **C-cert** (robô no e-CAC com o certificado do escritório e procuração).
2. **O ganho está na coleta e na conferência, não na transmissão.** Coleta de informes pelo app, conciliação com a pré-preenchida, revisão de consistência antes da malha e cálculo (GCAP, renda variável, exterior, IRPFM) são feitos pela plataforma (nível Próprio).
3. **Há uma fonte paga de dados de investimentos:** as APIs da Área do Investidor da B3 (posição, movimentação, eventos), contratadas por licença e liberadas com autorização do investidor [R9]. Serve à renda variável (PF-016) e à coleta (PF-004). Preço `[PREÇO NÃO PÚBLICO]` (a B3 cita nova tarifação desde 02/01/2025, sem valores lidos).
4. **Três mudanças de 2025–2026 criam rotina nova:**
   - **IRPFM:** tributação anual de quem recebe mais de R$ 600 mil no ano, a partir do ano-calendário 2026 (primeira apuração na declaração de 2027); o IRRF de 10% sobre dividendos acima de R$ 50 mil/mês por empresa é deduzido no ajuste ou restituído a quem fica abaixo de R$ 600 mil [R3].
   - **DeCripto:** a PF que opera por exchange estrangeira, plataforma descentralizada ou sem intermediário declara mensalmente quando as operações do mês passam de R$ 35 mil, a partir de 01/07/2026, até o último dia útil do mês seguinte [R5].
   - **Receita Saúde:** recibo eletrônico obrigatório para dentistas, fisioterapeutas, fonoaudiólogos, médicos, psicólogos e terapeutas ocupacionais pessoa física; alimenta o Carnê-Leão Web; emissão retroativa até o último dia de fevereiro do ano seguinte [R6].
5. **ITCMD está em transição:** a LC 227/2026 torna obrigatória a progressividade (até 8%) e trata de doações e heranças com elemento no exterior, mas a cobrança depende de lei de cada estado, em geral a partir de 2027 [R14]. A ficha fica em fase 4.

---

## 2. Regras conferidas

| Regra | O que diz | Fonte | Confiança |
| --- | --- | --- | --- |
| Prazo IRPF 2026 | Entrega sem multa até 29/05/2026 | [R1] gov.br (lido) | alta |
| IN RFB 2.312/2026 | Obrigados: tributáveis acima de R$ 35.584,00; isentos/exclusivos acima de R$ 200 mil; bens acima de R$ 800 mil; rendimentos de aplicações e lucros no exterior; quatro lotes de restituição (29/05, 30/06, 31/07, 28/08/2026), com prioridade para quem usa a pré-preenchida e o Pix | [R2] (resumo de escritório; texto da IN não aberto: o link do Sijut devolveu página vazia) | média |
| Multa por atraso | Mínimo de R$ 165,74, até 20% do imposto | [R10][R2] | média |
| Autorização do Meu Imposto de Renda | Validade definida pelo contribuinte, até 6 meses, revogável; os dois lados com gov.br prata ou ouro | [R10] | média |
| Lei 15.270/2025 | Isenção ampliada a partir de jan/2026; IRRF de 10% sobre dividendos acima de R$ 50 mil/mês da mesma PJ à mesma PF; regime anual de altas rendas (acima de R$ 600 mil) a partir do ano-calendário 2026; IRRF deduzido no ajuste ou restituído abaixo de R$ 600 mil | [R3] Perguntas e Respostas RFB, v. 19/12/2025 (lido) | alta |
| IRPFM: alíquota | Progressiva de 0% a 10% entre R$ 600 mil e R$ 1,2 milhão; 10% acima; redutor que limita a carga conjunta PJ + PF | [R21] | média |
| Lei 14.754/2023 | Aplicações financeiras no exterior declaradas em separado na DAA, 15%; lucros de controladas no exterior tributados em 31/12; trusts | [R4] texto da lei (Câmara, lido) | alta |
| IN RFB 2.291/2025 (DeCripto) | PF obrigada nas operações por prestadora no exterior, plataforma descentralizada ou sem intermediário (art. 5º, II); mensal acima de R$ 35 mil (art. 9º); prazo até o último dia útil do mês seguinte (art. 12); multas (art. 13); efeitos para PF desde 01/07/2026 (art. 19); revoga a IN 1.888/2019 | [R5] texto integral lido em reprodução (normaslegais) | média (texto da norma, mas não em sítio oficial) |
| IN RFB 2.240/2024 (Receita Saúde) | Emissão obrigatória no momento do serviço; seis profissões; retroativa até o último dia de fevereiro seguinte (ADE Cofis 11/2025); ajustes no Carnê-Leão | [R6] manual oficial v. 2.1 (lido) | alta |
| eSocial doméstico: procuração | O empregador cadastra procuração no e-CAC para que a contabilidade acesse com certificado próprio; sete perfis; nunca repassar senha gov.br | [R7] manual oficial de 13/08/2026 (lido) | alta |
| DAE doméstico | Vence no dia 7 | [R8] (notícia gov.br vista na busca, não aberta) | média |
| GCAP e DARF | Ganho de capital pago até o último dia útil do mês seguinte; código 4600 citado para imóveis | [R15] | média |
| Renda variável | Swing trade 15% (isenção para vendas de ações até R$ 20 mil/mês); day trade 20% sem isenção; DARF 6015; MP 1.303/2025 rejeitada | [R16] | média |
| Saída definitiva | Comunicação de saída pelo e-CAC até o último dia útil de fevereiro do ano seguinte; declaração de saída no prazo da DIRPF | [R11] | média |
| Espólio | Inicial, intermediárias e final; final só no modelo completo; inventariante responde | [R12] | média |
| LCDPR | Obrigatório para PF com receita bruta rural acima de R$ 4,8 milhões; prazo igual ao da DIRPF | [R13] (norma citada varia: IN 1.848/2018 ou IN 2.072/2022 `[NÃO VERIFICADO]`) | média |
| Residência fiscal | Residente quem fica mais de 183 dias em 12 meses (IN SRF 208/2002); tratados têm regras de desempate | [R18] (fontes divergem entre 183 e 184 dias) | média |
| CBE (BCB) | Ativos no exterior iguais ou acima de US$ 1 milhão em 31/12; janela 15/02 a 05/04/2026; multa até R$ 250 mil | [R19] | média |
| ITCMD (LC 227/2026) | Progressividade obrigatória até 8%; agregação de doações sucessivas; elemento estrangeiro; cobrança depende de lei estadual | [R14] | média |
| Malha 2026 | 498 mil declarações retidas; cartas de autorregularização com prazo até 20/10/2026 | [R17] | média |

---

## 3. Fichas

Legenda dos novos campos: **autonomia** (faz sozinho / prepara, pessoa conclui / organiza e lembra), **core**, **substitui**, **horas_100** (horas por mês num escritório de 100 clientes, supondo cerca de 60 declarações de IRPF por ano entre sócios e clientes PF, 8 clientes com carnê-leão e 5 investidores ativos; todas `[ESTIMATIVA]`), **depende_de**, **fase**.

### PF-001 · Cadastro e perfil fiscal anual do cliente PF
- **Subárea:** Cadastro PF · **Etapas:** Entrada, Manutenção · **Frequência:** na entrada e revisão anual antes da campanha
- **Descrição:** Manter, para cada PF (cliente avulso ou sócio de cliente PJ), dependentes, cônjuge e regime de bens, fontes de renda, bens relevantes e marcadores: carnê-leão, atividade rural, investidor, cripto, exterior, empregador doméstico, candidato ao IRPFM. Hoje fica em planilha ou na cabeça de quem fez a declaração do ano anterior.
- **Nível:** Próprio · **Confiança:** média · **Papel da IA:** M2 lê a última declaração e o histórico de atendimento e sugere marcadores; a pessoa confirma.
- **Notas:** dor 3, freq 2, risco 3, dif 3 · **Autonomia:** Agente faz sozinho · **Core:** Lê do core (sócios e dividendos das PJ do escritório) · **Substitui:** Planilha · **horas_100:** 2,5 · **Depende de:** SOC-004 · **Fase:** 0
- **Ferramentas:** `perfil_pf(cpf)`, `marcar_pf(cpf, marcador)`

### PF-002 · Obter e manter o acesso do escritório aos dados da PF na Receita
- **Subárea:** Acessos PF · **Etapas:** Entrada, Manutenção, Desligamento · **Frequência:** na entrada; renovação semestral (autorização) ou conforme validade da procuração
- **Descrição:** Conduzir a PF a outorgar procuração eletrônica no e-CAC ou a autorização do Meu Imposto de Renda (até 6 meses) e, para o empregador doméstico, a procuração do eSocial; controlar validade e revogar na saída. Exige gov.br prata ou ouro dos dois lados.
- **Nível:** D-assistido (ato do cliente no gov.br) · **Confiança:** média [R10][R7]
- **Papel da IA:** M4 envia o roteiro passo a passo pelo app, confere se a autorização ficou ativa e lembra antes do vencimento.
- **Notas:** dor 4, freq 2, risco 4, dif 3 · **Autonomia:** Agente organiza e lembra · **Core:** Não depende · **Substitui:** WhatsApp, Planilha · **horas_100:** 1,5 · **Depende de:** PF-001, SOC-014 · **Fase:** 0

### PF-003 · Abrir a campanha anual de IRPF e triar a carteira
- **Subárea:** IRPF · Campanha · **Etapas:** Manutenção · **Frequência:** anual (jan–mar)
- **Descrição:** Listar quem é obrigado ou quer declarar (regras da IN do ano: rendimentos, bens acima de R$ 800 mil, exterior etc.), quem é sócio com IRPF no contrato, quem é avulso; fixar prazos internos, honorário e responsável; avisar as mudanças do ano.
- **Nível:** Próprio · **Confiança:** média [R2] · **Papel da IA:** M1 aplica os critérios de obrigatoriedade ao perfil; M2 distribui a carga por pessoa.
- **Notas:** dor 3, freq 2, risco 3, dif 2 · **Autonomia:** Agente faz sozinho · **Core:** Não depende · **Substitui:** Planilha, E-mail · **horas_100:** 1 · **Depende de:** PF-001 · **Fase:** 1

### PF-004 · Coletar os documentos do IRPF pelo app com checklist adaptativo
- **Subárea:** IRPF · Coleta · **Etapas:** Manutenção · **Frequência:** anual (fev–mai), com cobrança semanal
- **Descrição:** Pedir informes de bancos, corretoras, fontes pagadoras, saúde, educação, aluguéis, compra e venda de bens, a partir do que constou na declaração anterior; validar na hora (ano errado, CPF errado, informe incompleto) e cobrar o que falta. Hoje é feito por WhatsApp e e-mail, com muito retrabalho.
- **Nível:** Próprio (com B para dados da B3 quando contratado) · **Confiança:** média [R9][R20]
- **Papel da IA:** M2 monta o checklist; leitura de PDF/foto dos informes; cobrança automática.
- **Concorrentes:** e-Auditoria descreve canal único de envio e importação em lote [R20]; Jettax e Makrosystem publicam guias de organização [R20].
- **Notas:** dor 5, freq 4, risco 3, dif 4 · **Autonomia:** Agente faz sozinho · **Core:** Não depende · **Substitui:** WhatsApp, E-mail, Planilha · **horas_100:** 7,5 · **Depende de:** PF-001, PF-003, GES-104 · **Fase:** 2

### PF-005 · Baixar a pré-preenchida e as declarações anteriores e conciliar com os documentos
- **Subárea:** IRPF · Pré-preenchida · **Etapas:** Entrada, Manutenção · **Frequência:** anual e na entrada do cliente
- **Descrição:** Obter, com a procuração, a pré-preenchida, a última declaração e o recibo; comparar com os informes recebidos e apontar o que diverge ou falta (rendimento sem informe, despesa médica sem Receita Saúde, bem sem movimento).
- **Nível:** C-cert (robô no e-CAC com o certificado do escritório e procuração; sem API encontrada) · **Confiança:** baixa [R23]
- **Papel da IA:** M3 concilia; M2 gera a lista de pendências ao cliente.
- **Notas:** dor 4, freq 2, risco 4, dif 4 · **Autonomia:** Agente faz sozinho · **Core:** Não depende · **Substitui:** Nenhuma · **horas_100:** 2,5 · **Depende de:** PF-002 · **Fase:** 1

### PF-006 · Montar a declaração ficha a ficha para lançamento no programa da Receita
- **Subárea:** IRPF · Elaboração · **Etapas:** Manutenção · **Frequência:** anual
- **Descrição:** Transformar documentos conciliados em um roteiro pronto por ficha (rendimentos, pagamentos, bens, dívidas, dependentes), com memória de cálculo; a pessoa lança ou importa no programa da Receita. O formato do arquivo .DEC não é público `[NÃO VERIFICADO]`, então a plataforma não escreve a declaração diretamente.
- **Nível:** D-assistido · **Confiança:** média
- **Papel da IA:** M3 calcula e classifica; M1 aplica as regras do ano.
- **Notas:** dor 5, freq 2, risco 4, dif 4 · **Autonomia:** Agente prepara, pessoa conclui · **Core:** Não depende · **Substitui:** Planilha · **horas_100:** 10 · **Depende de:** PF-004, PF-005 · **Fase:** 2

### PF-007 · Revisar a declaração antes de transmitir (otimização e risco de malha)
- **Subárea:** IRPF · Revisão · **Etapas:** Manutenção · **Frequência:** anual
- **Descrição:** Comparar simplificada × completa, conjunta × separada, inclusão de dependentes; checar evolução patrimonial, CPF de dependentes e alimentandos, despesas médicas × Receita Saúde, rendimentos × informes e pré-preenchida, para evitar a malha.
- **Nível:** Próprio · **Confiança:** média [R6][R17]
- **Papel da IA:** M3 simula; M1 lista os cruzamentos conhecidos; a pessoa decide.
- **Concorrentes:** e-Auditoria (auditoria em lote do .DEC), ConferIR (importa declarações e confere) [R20].
- **Notas:** dor 4, freq 2, risco 5, dif 4 · **Autonomia:** Agente prepara, pessoa conclui · **Core:** Não depende · **Substitui:** Planilha · **horas_100:** 3,75 · **Depende de:** PF-006 · **Fase:** 2

### PF-008 · Transmitir, entregar recibo e DARF e acompanhar as quotas
- **Subárea:** IRPF · Entrega · **Etapas:** Manutenção · **Frequência:** anual; quotas mensais até 8 meses
- **Descrição:** Colher o "pode transmitir", transmitir no programa, guardar recibo e declaração, enviar ao cliente o resumo com imposto a pagar ou restituição, DARF da quota única ou das quotas (ou débito automático) e lembrar cada vencimento.
- **Nível:** D-assistido · **Confiança:** alta para o prazo [R1]; média para o resto
- **Papel da IA:** M4 envia e lembra; registra a autorização do cliente como prova.
- **Notas:** dor 3, freq 3, risco 4, dif 3 · **Autonomia:** Agente prepara, pessoa conclui · **Core:** Não depende · **Substitui:** WhatsApp, E-mail, Planilha · **horas_100:** 3,3 · **Depende de:** PF-007, GES-036 · **Fase:** 2

### PF-009 · Acompanhar o processamento: pendências, malha e restituição
- **Subárea:** IRPF · Pós-entrega · **Etapas:** Manutenção · **Frequência:** semanal entre junho e dezembro; lotes mensais
- **Descrição:** Ver, para cada CPF, se a declaração foi processada, se há pendência de malha e em que lote saiu a restituição; avisar o cliente só quando há ação.
- **Nível:** C-cert · **Confiança:** média [R17][R2]
- **Papel da IA:** M4 lê o extrato da declaração no e-CAC e classifica.
- **Notas:** dor 3, freq 4, risco 4, dif 4 · **Autonomia:** Agente faz sozinho · **Core:** Não depende · **Substitui:** Planilha · **horas_100:** 1,5 · **Depende de:** PF-002 · **Fase:** 1

### PF-010 · Tratar a declaração retida em malha
- **Subárea:** IRPF · Malha · **Etapas:** Manutenção · **Frequência:** eventual (pico após as cartas de autorregularização, ex.: outubro de 2026)
- **Descrição:** Ler o motivo, decidir entre retificar (erro do contribuinte) ou juntar documentos e aguardar intimação; montar dossiê, retificadora e DARF com multa e juros se houver imposto.
- **Nível:** D-assistido · **Confiança:** média [R17]
- **Papel da IA:** M1 interpreta a pendência; M3 recalcula; M2 pede documentos.
- **Notas:** dor 4, freq 2, risco 5, dif 4 · **Autonomia:** Agente prepara, pessoa conclui · **Core:** Não depende · **Substitui:** WhatsApp, E-mail · **horas_100:** 1,25 · **Depende de:** PF-009, PF-006 · **Fase:** 2

### PF-011 · Retificar a declaração
- **Subárea:** IRPF · Retificação · **Etapas:** Manutenção · **Frequência:** eventual (informe atrasado, erro detectado)
- **Descrição:** Refazer a ficha afetada, comparar original × retificadora, recalcular quotas e restituição e informar o cliente.
- **Nível:** D-assistido · **Confiança:** média
- **Notas:** dor 3, freq 2, risco 4, dif 3 · **Autonomia:** Agente prepara, pessoa conclui · **Core:** Não depende · **Substitui:** Planilha · **horas_100:** 0,75 · **Depende de:** PF-006, PF-009 · **Fase:** 2

### PF-012 · Revisar as declarações dos últimos cinco anos em busca de restituição
- **Subárea:** IRPF · Revisão retroativa · **Etapas:** Entrada, Manutenção · **Frequência:** na entrada do cliente e por evento (laudo de moléstia grave, aposentadoria)
- **Descrição:** Procurar deduções esquecidas, isenção por moléstia grave, dependentes não incluídos e IRRF não compensado nas declarações ainda retificáveis; propor retificação como serviço extra.
- **Nível:** C-cert (download das declarações) + Próprio (análise) · **Confiança:** baixa
- **Notas:** dor 2, freq 1, risco 2, dif 4 · **Autonomia:** Agente prepara, pessoa conclui · **Core:** Não depende · **Substitui:** Nenhuma · **horas_100:** 1,7 · **Depende de:** PF-005, PF-011 · **Fase:** 4

### PF-013 · Apurar o carnê-leão mensal e o livro-caixa
- **Subárea:** Carnê-leão · **Etapas:** Entrada, Manutenção · **Frequência:** mensal (DARF até o último dia útil do mês seguinte)
- **Descrição:** Receber aluguéis, pensões, rendimentos do exterior e honorários de profissionais liberais recebidos de PF; lançar despesas de livro-caixa; calcular com a tabela do mês (isenção ampliada desde jan/2026 [R3]); gerar o DARF no Carnê-Leão Web e enviar ao cliente.
- **Nível:** C-cert (Carnê-Leão Web pelo e-CAC, com procuração; sem API encontrada) · **Confiança:** média [R6][R23]
- **Papel da IA:** M3 calcula; M2 cobra extratos e recibos; M4 envia o DARF.
- **Notas:** dor 4, freq 3, risco 4, dif 4 · **Autonomia:** Agente prepara, pessoa conclui · **Core:** Não depende · **Substitui:** Planilha, WhatsApp · **horas_100:** 8 · **Depende de:** PF-001, PF-002, FIS-021 · **Fase:** 1

### PF-014 · Acompanhar o Receita Saúde dos profissionais de saúde
- **Subárea:** Carnê-leão · Receita Saúde · **Etapas:** Entrada, Manutenção · **Frequência:** mensal; prazo retroativo até o último dia de fevereiro
- **Descrição:** Para médicos, dentistas, psicólogos, fisioterapeutas, fonoaudiólogos e terapeutas ocupacionais PF: conferir se cada pagamento recebido tem recibo emitido, apontar recibos faltantes antes do prazo retroativo e ajustar o carnê-leão.
- **Nível:** D-assistido (emissão pelo profissional no app/gov.br) · **Confiança:** alta [R6]
- **Base legal:** IN RFB 2.240/2024, art. 3º; ADE Cofis 11/2025
- **Notas:** dor 3, freq 3, risco 4, dif 4 · **Autonomia:** Agente organiza e lembra · **Core:** Não depende · **Substitui:** Planilha · **horas_100:** 1,5 · **Depende de:** PF-013 · **Fase:** 1

### PF-015 · Apurar ganho de capital na venda de bens e imóveis (GCAP)
- **Subárea:** Ganho de capital · **Etapas:** Manutenção · **Frequência:** por evento; DARF até o último dia útil do mês seguinte
- **Descrição:** Coletar escritura, custo de aquisição e benfeitorias; aplicar isenções e reduções (imóvel único, reinvestimento); preencher o GCAP do ano da operação, gerar DARF e guardar o arquivo para importação na DIRPF.
- **Nível:** D-assistido (GCAP é programa local da Receita) · **Confiança:** média [R15]
- **Notas:** dor 4, freq 2, risco 5, dif 3 · **Autonomia:** Agente prepara, pessoa conclui · **Core:** Não depende · **Substitui:** Planilha · **horas_100:** 1,5 · **Depende de:** PF-001, FIS-021 · **Fase:** 2

### PF-016 · Apurar renda variável mensal (swing trade, day trade, FII)
- **Subárea:** Ganho de capital · Renda variável · **Etapas:** Manutenção · **Frequência:** mensal
- **Descrição:** Obter movimentação e notas de corretagem, calcular preço médio, prejuízos acumulados por modalidade, isenção de R$ 20 mil em vendas de ações (só swing trade), IRRF retido e DARF 6015.
- **Nível:** B (APIs da Área do Investidor da B3, por licença e com autorização do investidor) · **Confiança:** média [R9][R16]
- **Preço:** `[PREÇO NÃO PÚBLICO]` (OC 177/2024 da B3 cita nova tarifação a partir de 02/01/2025, valores não lidos)
- **Concorrentes:** mycapital (parceria com a B3), Investidor10 (relatórios para o contador) [R9][R20]
- **Notas:** dor 4, freq 3, risco 4, dif 3 · **Autonomia:** Agente faz sozinho (cálculo) · **Core:** Não depende · **Substitui:** Planilha · **horas_100:** 5 · **Depende de:** PF-001, PF-004 · **Fase:** 2

### PF-017 · Apurar criptoativos e entregar a DeCripto da PF
- **Subárea:** Ganho de capital · Criptoativos · **Etapas:** Manutenção · **Frequência:** mensal
- **Descrição:** Calcular ganho (isenção para vendas mensais até R$ 35 mil [R15]); quando o cliente usa exchange estrangeira, carteira própria ou plataforma descentralizada e passa de R$ 35 mil no mês, preparar a DeCripto no Coleta Nacional (e-CAC) até o último dia útil do mês seguinte; informar bens na DIRPF.
- **Nível:** D-assistido · **Confiança:** média [R5][R22]
- **Base legal:** IN RFB 2.291/2025, arts. 5º, 9º, 12, 13 e 19
- **Notas:** dor 3, freq 3, risco 4, dif 4 · **Autonomia:** Agente prepara, pessoa conclui · **Core:** Não depende · **Substitui:** Planilha · **horas_100:** 2 · **Depende de:** PF-001, PF-002 · **Fase:** 2

### PF-018 · Apurar rendimentos no exterior pela Lei 14.754/2023
- **Subárea:** Exterior · **Etapas:** Manutenção · **Frequência:** anual, com acompanhamento das remessas e resgates
- **Descrição:** Separar aplicações financeiras (15% no ajuste, com variação cambial e compensação de perdas), lucros de controladas (offshores) em 31/12 e trusts; converter moedas, deduzir imposto pago no exterior e preencher a ficha própria da DAA.
- **Nível:** D-assistido · **Confiança:** alta para a regra [R4]; média para o processo
- **Notas:** dor 4, freq 2, risco 5, dif 4 · **Autonomia:** Agente prepara, pessoa conclui · **Core:** Não depende · **Substitui:** Planilha · **horas_100:** 2 · **Depende de:** PF-001, PF-004 · **Fase:** 4

### PF-019 · Entregar a declaração de Capitais Brasileiros no Exterior (CBE)
- **Subárea:** Exterior · **Etapas:** Manutenção · **Frequência:** anual (fev–abr)
- **Descrição:** Identificar quem tinha US$ 1 milhão ou mais no exterior em 31/12 e preparar a declaração no sistema do Banco Central.
- **Nível:** D-assistido · **Confiança:** média [R19]
- **Notas:** dor 2, freq 2, risco 4, dif 3 · **Autonomia:** Agente prepara, pessoa conclui · **Core:** Não depende · **Substitui:** Planilha · **horas_100:** 0,25 · **Depende de:** PF-018 · **Fase:** 4

### PF-020 · Analisar residência fiscal, dupla residência e tratados
- **Subárea:** Exterior · Residência · **Etapas:** Entrada, Manutenção · **Frequência:** por evento (mudança, expatriado, estrangeiro que chega)
- **Descrição:** Contar dias de permanência (IN SRF 208/2002), aplicar o desempate do tratado do país, decidir onde cada renda é tributada, pedir certificado de residência fiscal e calcular o crédito do imposto pago no exterior.
- **Nível:** Próprio · **Confiança:** média [R18]
- **Notas:** dor 3, freq 1, risco 5, dif 4 · **Autonomia:** Agente prepara, pessoa conclui · **Core:** Não depende · **Substitui:** Nenhuma · **horas_100:** 1 · **Depende de:** PF-001 · **Fase:** 4

### PF-021 · Conduzir a saída definitiva do país
- **Subárea:** Exterior · Saída definitiva · **Etapas:** Desligamento · **Frequência:** por evento
- **Descrição:** Entregar a comunicação de saída (e-CAC, até o último dia útil de fevereiro do ano seguinte) e a declaração de saída definitiva (prazo da DIRPF); avisar fontes pagadoras e bancos da condição de não residente; nomear procurador no Brasil; recolher imposto devido.
- **Nível:** D-assistido · **Confiança:** média [R11]
- **Notas:** dor 3, freq 1, risco 5, dif 3 · **Autonomia:** Agente prepara, pessoa conclui · **Core:** Não depende · **Substitui:** Nenhuma · **horas_100:** 0,75 · **Depende de:** PF-020, PF-002 · **Fase:** 4

### PF-022 · Fazer as declarações de espólio (inicial, intermediárias e final)
- **Subárea:** Espólio e sucessão · **Etapas:** Manutenção, Desligamento · **Frequência:** por evento, anual até a partilha
- **Descrição:** Com o inventariante, entregar as declarações do espólio no prazo da DIRPF, controlar bens e rendimentos até a partilha e, na final (só modelo completo), calcular ganho de capital se a transferência for por valor de mercado. O evento de falecimento é aberto por CIC-006.
- **Nível:** D-assistido · **Confiança:** média [R12]
- **Notas:** dor 3, freq 1, risco 4, dif 3 · **Autonomia:** Agente prepara, pessoa conclui · **Core:** Não depende · **Substitui:** Nenhuma · **horas_100:** 1,3 · **Depende de:** PF-006 · **Fase:** 2

### PF-023 · Calcular e declarar o ITCMD de doações e heranças
- **Subárea:** Espólio e sucessão · ITCMD · **Etapas:** Manutenção · **Frequência:** por evento
- **Descrição:** Calcular o ITCMD pela lei do estado (alíquotas progressivas, agregação de doações sucessivas pela LC 227/2026), preencher a declaração no portal da Sefaz, gerar a guia e lançar a doação no IRPF do doador e do donatário.
- **Nível:** D-assistido (portais estaduais) · **Confiança:** média [R14]
- **Notas:** dor 3, freq 1, risco 4, dif 4 · **Autonomia:** Agente prepara, pessoa conclui · **Core:** Não depende · **Substitui:** Planilha · **horas_100:** 1 · **Depende de:** PF-001 · **Fase:** 4

### PF-024 · Escriturar e entregar o LCDPR do produtor rural PF
- **Subárea:** Produtor rural PF · **Etapas:** Manutenção · **Frequência:** lançamentos mensais; entrega anual no prazo da DIRPF
- **Descrição:** Lançar receitas e despesas da atividade rural a partir de extratos e notas de produtor, por imóvel e participação; gerar o arquivo do LCDPR e transmitir; obrigatório acima de R$ 4,8 milhões de receita bruta, facultativo abaixo.
- **Nível:** D-assistido (arquivo gerado na plataforma; transmissão pela pessoa) · **Confiança:** média [R13]
- **Gatilho de nicho:** CPF com marcador de atividade rural; receita bruta rural acima de R$ 4,8 milhões no ano
- **Notas:** dor 4, freq 3, risco 4, dif 3 · **Autonomia:** Agente prepara, pessoa conclui · **Core:** Não depende · **Substitui:** Planilha · **horas_100:** 8 · **Depende de:** PF-001 · **Fase:** 5

### PF-025 · Apurar a atividade rural no IRPF
- **Subárea:** Produtor rural PF · **Etapas:** Manutenção · **Frequência:** anual
- **Descrição:** Calcular resultado real × presumido (20% da receita), compensar prejuízos de anos anteriores, controlar rebanho e bens da atividade, preencher o demonstrativo da atividade rural.
- **Nível:** Próprio · **Confiança:** baixa `[NÃO VERIFICADO]` (regras não lidas nesta pesquisa)
- **Gatilho de nicho:** CPF com marcador de atividade rural
- **Notas:** dor 3, freq 2, risco 4, dif 3 · **Autonomia:** Agente prepara, pessoa conclui · **Core:** Não depende · **Substitui:** Planilha · **horas_100:** 1,5 · **Depende de:** PF-006 · **Fase:** 5

### PF-026 · Projetar e apurar o IRPFM e recuperar o IRRF de dividendos
- **Subárea:** IRPFM · **Etapas:** Manutenção · **Frequência:** mensal (projeção) e anual (primeira apuração na declaração de 2027)
- **Descrição:** Somar todas as rendas do ano (inclusive dividendos de empresas fora do escritório e rendas isentas), projetar o IRPFM, abater o IRRF de 10% retido e aplicar o redutor; para quem fica abaixo de R$ 600 mil, pedir a restituição do IRRF retido no ajuste. Estende CTB-035 a todos os clientes PF.
- **Nível:** Próprio · **Confiança:** alta para as regras de aplicação [R3]; média para alíquota e redutor [R21]
- **Base legal:** Lei 15.270/2025; arts. 16-A e 16-B da Lei 9.250/1995. ADIs 7.912, 7.914, 7.917 e 7.954 no STF [R21]
- **Notas:** dor 4, freq 3, risco 5, dif 5 · **Autonomia:** Agente prepara, pessoa conclui · **Core:** Lê do core · **Substitui:** Planilha · **horas_100:** 2,7 · **Depende de:** PF-006, CTB-035 · **Fase:** 4

### PF-027 · Atender o empregador doméstico PF (entrada, rotina anual e saída)
- **Subárea:** Empregador doméstico · **Etapas:** Entrada, Manutenção, Desligamento · **Frequência:** na entrada; mensal (DAE até o dia 7, via DP-062); anual (informe de rendimentos)
- **Descrição:** Fazer a PF cadastrar a procuração do eSocial no e-CAC (perfis do manual), conferir o cadastro do empregador e do trabalhador, entregar ao cliente o informe de rendimentos do doméstico e o resumo anual; na saída do cliente, revogar a procuração. A folha e o DAE ficam em DP-062.
- **Nível:** D-assistido · **Confiança:** alta para a procuração [R7]; média para o vencimento [R8]
- **Notas:** dor 3, freq 3, risco 4, dif 2 · **Autonomia:** Agente organiza e lembra · **Core:** Não depende · **Substitui:** WhatsApp, Planilha · **horas_100:** 0,8 · **Depende de:** PF-002, DP-062 · **Fase:** 2

---

## 4. Lacunas e perguntas

- **Integra Contador para PF:** confirmar no catálogo do SERPRO se existe algum serviço de IRPF, pré-preenchida ou Carnê-Leão `[NÃO ENCONTRADO]`. Se existir, PF-005, PF-009 e PF-013 sobem para A$.
- **IN RFB 2.312/2026:** abrir o texto oficial (o link do Sijut devolveu página vazia) para confirmar obrigatoriedade, multa e lotes.
- **Formato do .DEC e importação no programa da Receita:** a confirmar; define se PF-006 pode subir de D-assistido.
- **Preço das APIs da B3** (OC 177/2024) e requisitos de licença para um escritório contábil.
- **LCDPR:** confirmar a norma vigente e o leiaute.
- **Robôs no e-CAC (C-cert):** avaliar termos de uso e a responsabilidade pelo uso da procuração, como pede o protocolo.
- **Pergunta aos contadores:** quantas declarações de IRPF o escritório típico faz por ano, por cliente PJ, e quanto tempo leva cada uma (calibrar horas_100).

---

## 5. Fontes (consultadas em 06/11/2026)

- [R1] Receita Federal, Meu Imposto de Renda: https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda (oficial, lido)
- [R2] Hondatar, resumo da IN RFB 2.312/2026 e do ADE RFB 2/2026: https://www.hondatar.com.br/en/irpf-2026-regras-prazos-de-entrega-e-cronograma-de-restituicao-da-declaracao-de-ajuste-anual-instrucao-normativa-rfb-no-2-312-2026-e-ato-declaratorio-executivo-rfb-no-2-2026/ (lido)
- [R3] Receita Federal, Perguntas e Respostas, Tributação de Altas Rendas, v. 19/12/2025: https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/perguntas-e-respostas/dirf/manual_padrao_rfb_per_tributacao_cotin_v-19-12-2025.pdf (oficial, lido)
- [R4] Lei 14.754/2023, texto atualizado da Câmara: https://www2.camara.leg.br/legin/fed/lei/2023/lei-14754-12-dezembro-2023-795058-normaatualizada-pl.pdf (oficial, lido)
- [R5] IN RFB 2.291/2025 (DeCripto), texto integral: https://www.normaslegais.com.br/legislacao/instrucao-normativa-rfb-2291-2025.htm (lido); manual de leiaute: https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/manuais/manual-orientacao-leiaute-criptoativos/manual-de-orientacao-do-leiaute-da-decripto-v1.pdf (visto na busca)
- [R6] Receita Federal, Receita Saúde, manual v. 2.1 (out/2025): https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/auditoria-fiscal/conformidade/perguntas-e-respostas-receita-saude (oficial, lido)
- [R7] Manual do eSocial do Empregador Doméstico, versão 13/08/2026: https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais/manual-do-esocial-empregador-domestico-versao-13-08-2026.pdf (oficial, lido, item 1.4)
- [R8] eSocial, notícia sobre o vencimento do DAE no dia 7: https://www.gov.br/esocial/pt-br/noticias/empregadores-tem-ate-a-proxima-sexta-feira-7-7-para-fazer-o-pagamento-do-dae-de-junho-do-esocial (visto na busca)
- [R9] B3, Integrações da Área do Investidor (APIs): https://b3.com.br/pt_br/produtos-e-servicos/central-depositaria/canal-com-investidores/integracoes-da-area-do-investidor-apis/ (lido); OC 177/2024, nova tarifação: https://b3.com.br/data/files/D8/E6/92/49/4BAB39107A1B8539AC094EA8/OC%20177-2024%20PRE%20Nova%20tarifacao%20-%20APIs%20Area%20do%20Investidor%20da%20B3%20(PT).pdf (visto na busca)
- [R10] Contábeis, autorização de acesso no IRPF 2026: https://www.contabeis.com.br/noticias/75698/irpf-2026-como-autorizar-acesso-a-sua-declaracao-sem-fornecer-senha-gov-br/ e https://www.contabeis.com.br/noticias/69335/ir-2025-como-funciona-a-autorizacao-de-acesso/ (vistos na busca)
- [R11] Garrastazu, prazos da saída definitiva: https://garrastazu.adv.br/prazos-e-penalidades-na-saida-definitiva-do-pais (visto na busca)
- [R12] Econet, espólio IRPF 2026: https://blog.econeteditora.com.br/espolio-irpf-2026/ (visto na busca)
- [R13] Aegro, LCDPR 2026: https://aegro.com.br/tags/livro-caixa-digital-do-produtor-rural/ ; Contábeis, limite do LCDPR: https://www.contabeis.com.br/noticias/40635/produtor-rural-obrigatoriedade-do-livro-caixa-tem-novo-limite-de-receita-bruta/ (vistos na busca)
- [R14] SMA, LC 227/2026 e ITCMD: https://smabr.com/como-as-mudancas-no-itcmd-afetam-o-planejamento-patrimonial-de-pessoas-fisicas/ ; Demarest: https://www.demarest.com.br/wp-content/uploads/2026/01/Client-Alert-Lei-Complementar-no-2272026.pdf (vistos na busca)
- [R15] Contabilidade Zen, GCAP 2026: https://www.contabilidadezen.com.br/blog/gcap-ganho-capital-como-calcular-2026/ ; Rolmyjun, cripto e GCAP: https://rolmyjuncontabilidade.com.br/investimentos/criptoativos-ganho-de-capital-gcap-declarar-2026/ (vistos na busca)
- [R16] Renova Invest, day trade 2026: https://renovainvest.com.br/?p=14158 ; Awake Trader, MP 1.303 rejeitada: https://www.awaketrader.com/pt/educacao/mp-1303-rejeitada-isencao-20-mil-2026 (vistos na busca)
- [R17] Meutudo, 498 mil na malha (08/10/2026): https://meutudo.com.br/blog/noticias/2026/10/08/receita-identifica-498-mil-contribuintes-na-malha-fina-e-envia-cartas-de-aviso-em-outubro/ (visto na busca)
- [R18] IN SRF 208/2002: https://www.normaslegais.com.br/legislacao/instrucao-normativa-srf-208-2002.htm (baixado; extração do texto falhou) ; Conjur sobre residência fiscal: https://www.conjur.com.br/?p=854672 (visto na busca)
- [R19] SMA, CBE 2026: https://smabr.com/declaracao-de-capitais-brasileiros-no-exterior-2026-cbe/ ; Cepeda: https://cepeda.law/declaracao-de-capitais-brasileiros-no-exterior-2026-2025-obrigacao-e-prazo/ (vistos na busca)
- [R20] Concorrentes e ferramentas: e-Auditoria https://www.e-auditoria.com.br/blog/ferramenta-de-gestao-e-auditoria-de-irpf-em-lote/ ; ConferIR https://jornalcontabil.com.br/noticia/conheca-conferir-novo-patrocinador-do-jornal-contabil/ ; Investidor10 https://investidor10.com.br/conteudo/como-declarar-seus-investimentos-no-imposto-de-renda-com-o-investidor10-120487/ ; Econet Lion https://pordentrodeminas.com.br/noticias-corporativas/2025/05/316507-econet-lanca-ia-para-apoiar-profissionais-na-reta-final-do-imposto-de-renda ; Jettax https://www.jettax.com.br/blog/irpf-2026-para-contadores-o-que-organizar-antes-do-inicio-do-prazo/ (vistos na busca)
- [R21] Mayer Brown, Lei 15.270/2025: https://www.mayerbrown.com/pt/insights/publications/2025/12/enactment-of-law-no-15270-2025-which-establishes-dividend-taxation-expands-the-exemption-threshold-and-introduces-a-minimum-tax-on-high-incomes ; Conjur (ADIs): https://www.conjur.com.br/?p=916476 (vistos na busca)
- [R22] Mattos Filho, DeCripto: https://www.mattosfilho.com.br/unico/decripto-receita-federal-ocde/ (visto na busca)
- [R23] Busca sem resultado de serviço PF no Integra Contador; notícia SERPRO de novas funcionalidades: https://serpro.gov.br/menu/noticias/noticias-2025/integra-contador-novas-funcionalidades (vista na busca)

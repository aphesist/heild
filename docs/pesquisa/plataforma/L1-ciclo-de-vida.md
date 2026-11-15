# L1 · Ciclo de vida do cliente: jornadas de ponta a ponta

6 de novembro de 2026 · agente L1 (jornadas transversais) · insumos: fichas D1 a D7 (inclusive as da rodada 3, `xxx-101` em diante), consolidado [90-consolidado.md](90-consolidado.md) e [Plano da Plataforma](../../planos/Plano_Plataforma_do_Escritorio.md)

## Como ler este arquivo

- **Para que serve.** Os contadores do grupo classificam as atividades por setor **e** por etapa do ciclo de vida do cliente: **Entrada** (tudo feito para e na chegada do cliente), **Manutenção** (rotina contínua) e **Desligamento** (saída para outra contabilidade ou baixa da empresa). Este arquivo junta as fichas dos sete setores em **jornadas ordenadas**, para servir de roteiro na comparação com o levantamento dos contadores.
- **Cada passo** cita as fichas (de qualquer setor), o **dono** (setor que responde pelo passo), o **gatilho**, o **prazo** e **o que o agente faz**. Prazo legal só aparece quando a ficha citada ou uma fonte deste arquivo o traz; o resto é marco interno sugerido, marcado `[ESTIMATIVA]`.
- **Setores (dono):** SOC (Clientes e Societário), FIS (Fiscal e Obrigações), NFE (Notas Fiscais), DP (Trabalhista), CTB (Contábil), CON (Consultoria e Reforma), GES (Gestão e Atendimento), CIC (Ciclo de vida, transversal: fichas novas deste arquivo, seção 4).
- **Níveis de automação:** A, A$, B, C-cert / C-crc / C-captcha, **D-assistido** (o agente faz tudo menos o ato final num portal sem API), **D-humano** (presença ou juízo humano; o agente organiza, lembra e registra), E, F, Próprio. Nas tabelas, o nível é o da ficha citada (provisório quando a ficha é da rodada 3).
- **Motores do chat:** M1 (legal), M2 (escritório), M3 (cálculo), M4 (ação). Premissas: app do cliente com o **A1 do cliente obrigatório**, tarefas pelas APIs dos módulos de processos dos cores.
- **Fontes deste arquivo:** códigos `[Cn]` na seção 6, com link e data de consulta. Fontes das fichas citadas estão nos arquivos D. Sem fonte: `[NÃO VERIFICADO]`.

## Sumário

1. [Visão geral: o cliente como máquina de estados](#1-visão-geral-o-cliente-como-máquina-de-estados)
2. [Jornadas](#2-jornadas)
   - a) Entrada de empresa nova (abertura)
   - b) Entrada de empresa vinda de outra contabilidade (transição)
   - c) Entrada de MEI e de pessoa física
   - d) Manutenção: ciclo mensal e ciclo anual
   - e) Desligamento para outra contabilidade
   - f) Desligamento por encerramento da empresa (baixa)
   - g) Desvios: falecimento, falência ou recuperação judicial, carteira comprada, mudança de porte
3. [Catálogo de modelos e documentos do ciclo de vida](#3-catálogo-de-modelos-e-documentos-do-ciclo-de-vida)
4. [Lacunas transversais: fichas CIC](#4-lacunas-transversais-fichas-cic)
5. [Contagem por etapa e pontos para a conversa com os contadores](#5-contagem-por-etapa-e-pontos-para-a-conversa-com-os-contadores)
6. [Fontes](#6-fontes)

---

## 1. Visão geral: o cliente como máquina de estados

Nenhum setor modelou o **estado** do cliente; cada um tem o seu gatilho ("contrato assinado", "data de corte", "decisão de baixa"). A proposta deste arquivo (ficha **CIC-001**) é um estado único por cliente que dispara os projetos de todos os setores:

```
 prospect ──► proposta ──► aceito ──► em implantação ──► ativo ──► em saída ──────► encerrado ──► arquivado (retenção) ──► eliminado
                 │           │        (abertura,        │  ▲       (distrato,         (sem         (só leitura,           (LGPD,
              recusado    recusado    transição,        │  │        art. 10 da        tarefas)     prazos legais)         SOC-108)
              (GES-101)               MEI, PF)          ▼  │        Res. CFC 1.590)
                                                     inativo ┘  ──► em baixa ──► encerrado
                                                     (SOC-110)      (SOC-031)
          desvios a partir de "ativo": reentrada parcial (CIC-010), falecimento (CIC-006), falência/RJ (CIC-008)
```

| Transição | Gatilho | O que dispara (projetos gerados nos setores) |
| --- | --- | --- |
| prospect → proposta | Lead qualificado (GES-042) | CTB-101 e GES-102 (estimativa), SOC-015 (proposta) |
| proposta → aceito | Aceite formal da proposta (Res. CFC 1.590/2020, art. 5º [C1]) | GES-101 (aceitação), SOC-019 (PLD), SOC-016 (contrato) |
| aceito → em implantação | Contrato assinado | Jornada a, b ou c conforme o tipo de entrada (CIC-001 escolhe o molde) |
| em implantação → ativo | Marcos de GES-106 cumpridos (primeiro fechamento de cada setor) | Rotina mensal e anual (jornada d) |
| ativo → em saída | Pedido de rescisão do cliente ou do escritório (SOC-106) | Jornada e |
| ativo → inativo / em baixa | Decisão do cliente (SOC-110) | Calendário de inatividade, ou jornada f |
| em saída / em baixa → encerrado | Lista de obrigações remanescentes zerada (SOC-107) e termo de entrega assinado (CIC-003) | GES-108 (desativação), CTB-111, NFE-105, FIS-109, DP-107 |
| encerrado → arquivado → eliminado | Data de corte + prazos de guarda | SOC-108, DP-109, CIC-007 (pós-saída) |

---

## 2. Jornadas

Legenda das colunas: **Fichas** (a primeira é a principal) · **Dono** · **Gatilho** · **Prazo** · **Agente** (o que a plataforma faz) · **Nível**.

### Etapa comum de pré-entrada (vale para a, b e c)

| # | Passo | Fichas | Dono | Gatilho | Prazo | Agente | Nível |
| --- | --- | --- | --- | --- | --- | --- | --- |
| P1 | Captar e qualificar o lead | GES-042, GES-032 | GES | Contato do interessado | SLA interno de resposta `[ESTIMATIVA]` | Cria o prospect, pergunta o tipo de entrada (empresa nova, troca de contador, MEI, PF), CNPJ ou CPF | Próprio |
| P2 | Estimar volume e esforço | CTB-101, GES-102, CON-101 (prévia) | CTB / GES | Prospect com CNPJ | Antes da proposta | Consulta o CNPJ (SOC-001), estima notas, folha e lançamentos; compara com clientes parecidos pelo tempo medido no timesheet | Próprio |
| P3 | Decidir a aceitação | GES-101, SOC-019 | GES (sócio) | Proposta prestes a sair | Antes do contrato | Junta motivo da troca, PLD (cadastro mínimo da Res. CFC 1.721/2024, art. 3º [C3]), situação fiscal prévia; parecer curto; sócio decide | Próprio |
| P4 | Montar e enviar a proposta | SOC-015, SOC-101 | SOC | Aceitação positiva | — | Gera a proposta com serviços, periodicidade, valor de cada serviço, pagamento, duração, reajuste e parte que cabe ao cliente (Res. CFC 1.590/2020, art. 4º [C1]; NBC PG 01, itens 6 a 10 [C2]) | Próprio |
| P5 | Formalizar o contrato e os termos | SOC-016, SOC-020, SOC-101, CIC-001 | SOC | Aceite formal da proposta | Antes de iniciar o serviço (art. 5º [C1]) | Gera o contrato com as 13 cláusulas mínimas do art. 2º da Res. CFC 1.590/2020 (alíneas a a m) [C1], o termo de tratamento de dados (operador) e a ciência da Lei 9.613/1998; coleta assinatura eletrônica; muda o estado para "aceito" | Próprio (assinatura eletrônica por B) |
| P6 | Ativar o cliente no app e nos canais | GES-104, GES-105, SOC-008 | GES | Contrato assinado | Dia 1 `[ESTIMATIVA]` | Convite ao app, coleta do A1 (obrigatório) no cofre, contatos por assunto, opt-in no WhatsApp; kit de boas-vindas e reunião de início | Próprio |
| P7 | Faturar a implantação | GES-103, GES-001 | GES | Contrato assinado | Conforme contrato | Cobra implantação, regularização herdada (se houver) e primeira mensalidade proporcional; liga a recorrência | B (cobrança) |

### a) Entrada de empresa nova (abertura)

Gatilho da jornada: contrato assinado com escopo "abertura". Duração típica: da reunião de estrutura ao primeiro fechamento mensal. A ordem segue o próprio fluxo da REDESIM descrito nas fichas SOC-025 a SOC-028.

| # | Passo | Fichas | Dono | Gatilho | Prazo | Agente | Nível |
| --- | --- | --- | --- | --- | --- | --- | --- |
| a1 | Planejar a estrutura (natureza jurídica, sócios, capital, CNAEs, endereço) | SOC-105 | SOC | Contrato assinado | Antes da viabilidade | Questionário no app; simula cenários pelo faturamento previsto (M3) e gera parecer e minuta (SOC-101) | Próprio |
| a2 | Planejar regime e enquadramento antes do CNPJ (inclusive IBS/CBS) | CON-103, FIS-015 (se Simples) | CON | Estrutura definida | Antes da inscrição no CNPJ (a opção do Simples passou para o momento da inscrição, segundo SOC-028 `[NÃO VERIFICADO]` quanto à Res. CGSN 190/2026) | Simula Simples × Presumido × Real e "Simples por fora" com a regra vigente (M1, M3); registra a decisão assinada pelo cliente | Próprio |
| a3 | Consulta de viabilidade e pré-análise da atividade | SOC-025, SOC-035 | SOC | Parecer aprovado | Antes do registro | Sugere CNAEs, classifica o risco da atividade no município, mapeia as licenças exigidas | D-assistido (portal da Junta/integrador) |
| a4 | Redigir e registrar o ato constitutivo | SOC-026, SOC-004, SOC-006 | SOC | Viabilidade deferida | Prazo do órgão de registro | Minuta do contrato social pelo modelo; coleta assinaturas; cadastra sócios e beneficiário final | D-assistido |
| a5 | Obter CNPJ e inscrições; optar pelo Simples | SOC-027, SOC-028, FIS-014 | SOC / FIS | Registro deferido | Prazo de opção da empresa em início de atividade (ver SOC-028) | Preenche o DBE/coleta pelo roteiro; acompanha deferimentos; dispara a opção do Simples no prazo e anexa o recibo | D-assistido |
| a6 | Procurações e acessos | SOC-011, SOC-013, SOC-014, FIS-007, DP-042 | SOC | CNPJ ativo | Antes da primeira obrigação | Gera o roteiro de autorização do escritório (e-CAC/Integra Contador) e procurações estaduais e municipais; valida o que foi recebido | A (validação federal) + D-assistido |
| a7 | Habilitar os ambientes fiscais eletrônicos | FIS-107, NFE-001, NFE-002 | FIS / NFE | Inscrições obtidas | Antes da primeira venda | Credenciamento como emissor de NF-e/NFC-e/NFS-e, domicílios eletrônicos, captura de documentos com o A1, autXML do escritório | D-assistido + A |
| a8 | Licenças e alvarás | SOC-036 a SOC-040, SOC-046 | SOC | Licenças mapeadas em a3 | Antes de operar (por órgão) | Roteiro por órgão, coleta de documentos, calendário de renovação | D-assistido / D-humano (vistoria) |
| a9 | Implantar a contabilidade | CTB-108, CTB-001, CTB-010 | CTB | CNPJ ativo | Antes do primeiro fechamento | Plano de contas do porte, lançamento da constituição, checklist de documentos esperados, conexão do Open Finance | Próprio + F/B (core) |
| a10 | Preparar o empregador (se houver folha) | DP-105, DP-101, DP-033 | DP | Primeiro empregado previsto | Antes da primeira admissão | S-1000 e tabelas iniciais pelo core, enquadramento sindical, SST, matriz de responsabilidades do DP | Próprio + B/F |
| a11 | Montar o perfil e o calendário de obrigações | SOC-002, FIS-001, FIS-101 | FIS | Regime e atividade definidos | Antes do primeiro mês | Gera o perfil temporal e o calendário mensal de obrigações; cria as tarefas nos cores | Próprio + B |
| a12 | Acompanhar a implantação até o primeiro fechamento | GES-106, CIC-001 | GES | Contrato assinado | 30 e 90 dias `[ESTIMATIVA, roteiro de 90 dias em D1 F56]` | Painel de marcos por setor; reunião de 30/90 dias; custo real da entrada contra o previsto; muda o estado para "ativo" | Próprio |

### b) Entrada de empresa vinda de outra contabilidade (transição)

Gatilho: contrato assinado com cliente que já tem contador. Ponto crítico: a **competência de corte**. Pela Res. CFC 1.590/2020, o contador que sai cumpre as acessórias de competência ocorrida na vigência do contrato dele, mesmo com vencimento posterior, salvo cláusula em contrário (art. 10), elabora as demonstrações do seu período (art. 9º, parágrafo único) e comunica ao novo responsável os fatos que ele deve conhecer (art. 8º) [C1]. A NBC PG 01 repete o dever de informar o substituto (item 3(l)) e manda evitar desentendimentos (item 18(d)) [C2].

| # | Passo | Fichas | Dono | Gatilho | Prazo | Agente | Nível |
| --- | --- | --- | --- | --- | --- | --- | --- |
| b1 | Salvar a janela de 90 dias dos documentos fiscais | NFE-101 | NFE | Dia 1 (A1 recebido) | **Imediato**: a distribuição de NF-e só alcança 90 dias (NT 2014.002, via NFE-101) | Dispara a captura retroativa de NF-e, CT-e e NFS-e do ADN com o A1 do cliente | A |
| b2 | Combinar a transição e a competência de corte | SOC-104, FIS-102, DP-104 (corte do eSocial), CTB-105 | SOC (coordena) | Contrato assinado | Respeitar o aviso prévio do contrato antigo (cláusula obrigatória, art. 2º, "l" [C1]) | Calcula a competência de corte; lista obrigação por obrigação quem transmite o quê no mês de transição; gera carta de notificação e termo de corte | Próprio |
| b3 | Pedir ao contador anterior, **num pedido só**, o acervo de todos os setores | CIC-002, SOC-023, NFE-101, DP-103, CTB-102, CON-102 | SOC (coordena) | Termo de corte assinado | Prazo do distrato do anterior (art. 9º [C1]) | Gera a carta única com o checklist consolidado (livros, ECD/ECF, balancetes, XMLs, arquivos do eSocial, parcelamentos, processos, pareceres); controla o que chegou item a item e cobra o restante | Próprio |
| b4 | Trocar vínculos e acessos herdados | SOC-103, SOC-011, SOC-012, SOC-013, FIS-007, DP-042, SOC-005 | SOC | Corte combinado | Até a primeira obrigação do escritório | Lista procurações e autorizações do anterior para o cliente revogar; gera as novas; troca o contabilista responsável nos cadastros estaduais e municipais | A (consulta federal) + D-assistido |
| b5 | Diagnóstico de entrada (societário, fiscal, trabalhista, contábil, tributário) | SOC-022, SOC-102, FIS-101, FIS-103, DP-102, CTB-106, CON-101, NFE-102 | cada setor; SOC consolida | Acessos válidos | Primeiras semanas `[ESTIMATIVA]` | Relatório de situação fiscal (FIS-006), declarado × apurado × pago, omissões, alvarás vencidos, passivo trabalhista, qualidade da escrituração, oportunidades de crédito; um parecer único para o cliente | A + Próprio |
| b6 | Inventariar heranças em andamento | FIS-104, FIS-105, CON-102, CTB-022 | FIS | Diagnóstico | Antes do vencimento do próximo ato (parcela, prazo de intimação) | Lista créditos, saldos credores, PER/DCOMP, parcelamentos, processos e intimações em prazo; cria as tarefas com o prazo de cada um | A (consultas federais) + D-assistido |
| b7 | Receber e implantar saldos e históricos | CTB-103, CTB-104, DP-103, DP-104, NFE-103 | CTB / DP / NFE | Acervo recebido | Antes do primeiro fechamento | Confere saldos de abertura contra a última ECD; de-para do plano de contas (I157); carrega históricos do DP no core; parametriza acumuladores e produtos | Próprio + F |
| b8 | Habilitar os ambientes fiscais eletrônicos | FIS-107, NFE-001, NFE-002 | FIS / NFE | Acessos trocados | Antes da primeira competência do escritório | Domicílios eletrônicos, captura contínua, autXML | D-assistido + A |
| b9 | Regularizar o que veio errado | FIS-106, CTB-107, SOC-102, FIS-037 | cada setor | Diagnóstico aprovado | Conforme orçamento de regularização (GES-103) | Plano de regularização com custo; retificações e entregas omitidas; certidões | Variado (A a D) |
| b10 | Perfil, calendário e primeiro fechamento assistido | SOC-002, FIS-001, DP-104, CTB-024 | FIS / DP / CTB | Corte e saldos implantados | Primeira competência do escritório | Calendário de obrigações a partir da competência de corte; primeiro fechamento com checagem dobrada | Próprio + B |
| b11 | Acompanhar a implantação 90 dias e encerrar a transição | GES-106, CIC-001 | GES | Contrato assinado | 90 dias `[ESTIMATIVA]` | Painel de marcos; fecha a transição quando o acervo está completo e as obrigações do mês de corte foram entregues por quem devia | Próprio |

### c) Entrada de MEI e de pessoa física

**MEI.** Jornada curta, volume alto, honorário baixo. Ponto de atenção: o MEI que cresce vira ME e entra na jornada a (passo a5 em diante) pela ficha CIC-010.

| # | Passo | Fichas | Dono | Gatilho | Prazo | Agente | Nível |
| --- | --- | --- | --- | --- | --- | --- | --- |
| c1 | Proposta e contrato simplificados | SOC-015, SOC-016, SOC-101 | SOC | Lead MEI | — | Modelo de contrato de MEI com as cláusulas mínimas do art. 2º [C1] (a resolução não prevê exceção para o MEI) | Próprio |
| c2 | Formalizar ou assumir o MEI | SOC-032, FIS-018 | SOC / FIS | Contrato assinado | — | Formalização no gov.br pelo roteiro (D-assistido); se já existe, consulta a situação no SIMEI e débitos de DAS | D-assistido + A |
| c3 | Acessos e captura | SOC-011, NFE-007, GES-104 | SOC / NFE | CNPJ do MEI | Dia 1 | Autorização do escritório, captura de NFS-e pelo ADN, app com A1 (ou e-CNPJ do MEI, se o cliente tiver) | A |
| c4 | Calendário do MEI | FIS-016, FIS-017, DP-062 (se tiver empregado) | FIS | Ativo | DAS mensal; DASN-SIMEI anual até 31 de maio (FIS-017) | DAS em lote, controle do limite pelas notas, DASN | A |

**Pessoa física.** Nenhum setor tem a jornada da PF (cliente de IRPF, autônomo com carnê-leão, produtor rural, sócio que também é cliente). As fichas que tocam PF são acessórias (SOC-004 cadastra o sócio, SOC-017 e GES-009 cobram o IRPF de sócio como extra, FIS-021 emite DARF de carnê-leão, CTB-035 projeta o IRPFM). A jornada abaixo usa a ficha nova **CIC-004**.

| # | Passo | Fichas | Dono | Gatilho | Prazo | Agente | Nível |
| --- | --- | --- | --- | --- | --- | --- | --- |
| c5 | Proposta e contrato da PF | SOC-015, SOC-016, CIC-004 | SOC | Lead PF ou sócio de cliente PJ | Antes da campanha de IRPF | Contrato da PF (serviço eventual ou permanente, art. 2º, "b" [C1]); cadastro PLD da PF (Res. CFC 1.721/2024, art. 3º [C3]) | Próprio |
| c6 | Acesso da PF na Receita | CIC-004, SOC-014 | SOC | Contrato | Antes do início da declaração | Roteiro para a PF outorgar procuração eletrônica no e-CAC (gov.br prata ou ouro) ou a autorização de acesso do Meu Imposto de Renda, que tem validade limitada [C13] | D-assistido (ato do cliente no gov.br) |
| c7 | Diagnóstico de entrada da PF | CIC-004 | FIS (ou área de IRPF, se o escritório tiver) | Acesso válido | — | Baixa as declarações anteriores e a pré-preenchida, pendências e malha; identifica carnê-leão, ganho de capital, atividade rural (LCDPR acima de R$ 4,8 milhões de receita bruta, IN RFB 1.848/2018, segundo [C14]) | D-assistido |
| c8 | Ciclo anual e mensal da PF | CIC-004, FIS-021 | FIS | Ativo | IRPF 2026: 23/03 a 29/05/2026 (IN RFB 2.312/2026, segundo [C8]); carnê-leão mensal | Coleta de informes pelo app, montagem da declaração, cálculo de carnê-leão (M3); transmissão no programa da Receita pelo humano | D-assistido |

### d) Manutenção: ciclo mensal e ciclo anual (por marcos)

A manutenção concentra a maior parte das fichas (ver seção 5). Aqui ela vai **resumida por marcos**; cada marco aponta as fichas que o compõem. Prazos conforme as fichas citadas.

**Ciclo mensal**

| Marco | Quando | Fichas principais | Dono | Agente |
| --- | --- | --- | --- | --- |
| M0 · Vigilância contínua | Diário | SOC-003, SOC-009, FIS-005, FIS-008, FIS-026, FIS-029, FIS-030, DP-040, NFE-003, NFE-004 a NFE-016, GES-023 a GES-026 | todos | Lê caixas postais e domicílios eletrônicos, vigia cadastro e certificados, captura documentos, triagem do atendimento; avisa só o que exige ação |
| M1 · Abertura da competência | Dia 1 a 5 | FIS-001, CTB-002, DP-009, NFE-038 | FIS / CTB / DP | Gera o calendário do mês por cliente; pede documentos e variáveis da folha pelo app |
| M2 · Documentos completos | Dia 1 a 10 | CTB-003 a CTB-009, CTB-015, NFE-020 a NFE-035, DP-010, DP-011 | CTB / NFE / DP | Cobra o que falta, classifica extratos, confere notas e importa no core |
| M3 · Folha fechada | Antes do pagamento de salários | DP-012 a DP-022, DP-051 | DP | Prévia ao cliente, eventos periódicos do eSocial, holerites |
| M4 · Apuração e guias | Até o dia 20 (FGTS Digital e PGDAS-D, conforme DP-018 e FIS-009) | FIS-004, FIS-009, FIS-010, FIS-019, FIS-020, FIS-025, FIS-028, FIS-031, DP-017, DP-018 | FIS / DP | Pré-validação cruzada, transmissão, guias ao cliente com confirmação de leitura |
| M5 · Entregas do fim do mês | Até o último dia útil do mês seguinte (DCTFWeb, conforme FIS-019) | FIS-019, FIS-020, FIS-022, FIS-023, FIS-024 | FIS | Fechamento das declarações; recibo anexado à tarefa (FIS-003) |
| M6 · Pagamentos conferidos | Após vencimentos | FIS-032, DP-021, GES-003, GES-004 | FIS / GES | Confirma pagamento das guias do cliente e dos honorários; régua de cobrança |
| M7 · Fechamento contábil e relatório | Mês seguinte `[ESTIMATIVA]` | CTB-018 a CTB-028, CTB-030, FIS-033, DP-020 | CTB | Conciliações, balancete revisado, relatório mensal e alertas ao cliente |
| M8 · Gestão do cliente | Mensal | GES-013, GES-015, GES-043, SOC-017, GES-047 a GES-051 | GES | Rentabilidade, escopo extra, risco de saída, timesheet |

**Ciclo anual**

| Marco | Quando (segundo as fichas) | Fichas principais | Dono |
| --- | --- | --- | --- |
| A1 · Janeiro: comunicação de não ocorrência de PLD | Até 31 de janeiro (Res. CFC 1.721/2024, art. 7º [C3]) | CTB-049, SOC-019 | CTB / GES |
| A2 · Opção e planejamento de regime | Janeiro (opção) e revisão anual | CON-008, CON-009, FIS-014, FIS-015 (semestral, set/out e março) | CON / FIS |
| A3 · Informes e obrigações anuais da folha | Fevereiro | DP-054, DP-057 | DP |
| A4 · DEFIS | Até 31 de março (FIS-013) | FIS-013 | FIS |
| A5 · Aprovação de contas e carta de responsabilidade | Jan–abr (SOC-041); carta anual (Res. CFC 1.590/2020, art. 3º [C1]; ITG 1000 [C4]) | SOC-041, CTB-037, CTB-039, CTB-040 | CTB / SOC |
| A6 · IRPF dos sócios e clientes PF | 23/03 a 29/05/2026 [C8] | CIC-004, GES-009, CTB-035 | FIS |
| A7 · DASN-SIMEI | Até 31 de maio (FIS-017) | FIS-017 | FIS |
| A8 · ECD | Até o último dia útil de junho (CTB-041) | CTB-041, SOC-042 | CTB |
| A9 · ECF | Até o último dia útil de julho (CTB-042) | CTB-042 | CTB |
| A10 · Reajuste de honorários e aditivos | Data-base do contrato | GES-014, SOC-018 | GES / SOC |
| A11 · Data-base sindical e CCT | Por sindicato | DP-034, DP-035 | DP |
| A12 · 13º salário e férias coletivas | Nov–dez | DP-053, DP-025, GES-009 | DP / GES |
| A13 · Inventário de 31/12 e encerramento do exercício | Dezembro–janeiro | CTB-046, CTB-048, CTB-040 | CTB |
| A14 · Renovações (certificados, alvarás, licenças, beneficiário final) | Pelos vencimentos | SOC-009, SOC-036 a SOC-040, SOC-006 | SOC |
| A15 · Revisão do cliente (reunião periódica, NPS) | Anual ou semestral | GES-045, GES-038 | GES |

Eventos que interrompem a manutenção e abrem uma "reentrada parcial" (CIC-010): mudança de regime, MEI que vira ME, primeiro empregado, filial nova (SOC-033), alteração contratual (SOC-029), reorganização societária (CON-014).

### e) Desligamento para outra contabilidade

Gatilho: pedido de rescisão (cliente) ou renúncia do escritório. A Res. CFC 1.590/2020 torna o **distrato obrigatório** (art. 6º); sem distrato, o profissional notifica o cliente do fim da relação (art. 6º, parágrafo único); o distrato deve prever que o cliente recebe seus documentos (art. 7º) e a forma e o prazo de devolução de livros, documentos e arquivos eletrônicos (art. 9º) [C1]. A NBC PG 01 veda reter abusivamente livros, papéis ou arquivos eletrônicos, inclusive para forçar o pagamento (item 4(l)), e manda renunciar por escrito, respeitando os prazos do contrato, quando falta confiança (item 3(k)) [C2].

| # | Passo | Fichas | Dono | Gatilho | Prazo | Agente | Nível |
| --- | --- | --- | --- | --- | --- | --- | --- |
| e1 | Registrar o pedido, fazer a entrevista de saída e tentar a retenção | GES-107, GES-043, SOC-106 | GES | Pedido de rescisão | Dentro do aviso prévio contratual | Registra o motivo; dados de rentabilidade e histórico para o sócio decidir se tenta reter | Próprio |
| e2 | Fixar a data efetiva e a competência de corte | SOC-106, FIS-102, NFE-104, CTB-105 | SOC | Rescisão confirmada | Aviso prévio do contrato (art. 2º, "l" [C1]) | Calcula a data efetiva e a última competência do escritório | Próprio |
| e3 | Listar e cumprir as obrigações remanescentes | SOC-107, FIS-108, DP-106, CTB-105, CTB-109 | cada setor; SOC consolida | Corte fixado | Até o vencimento de cada obrigação da vigência (art. 10 [C1]) | Gera a lista do calendário do perfil até o corte; bloqueia "encerrado" até a lista zerar | Próprio + B |
| e4 | Acertar o financeiro | GES-046, GES-006 | GES | Corte fixado | Último faturamento | Calcula saldo, honorários do aviso, encerra a recorrência; separa cobrança da entrega de documentos (vedação do item 4(l) [C2]) | B |
| e5 | Montar o dossiê único de saída e o termo de entrega | CIC-003, SOC-024, FIS-108, NFE-036, NFE-104, DP-106, CTB-050, CTB-109, CON-104, SOC-034 | SOC (coordena) | Corte fixado | Prazo do distrato (art. 9º [C1]) | Junta os pacotes dos setores num índice único com manifesto (lista e resumo criptográfico dos arquivos); termo de entrega assinado | Próprio |
| e6 | Assinar o distrato | SOC-106, SOC-101 | SOC | Dossiê pronto | Antes da data efetiva | Minuta do distrato com cessação das responsabilidades, devolução de documentos e prazo (arts. 6º, 7º e 9º [C1]) | Próprio |
| e7 | Comunicar o sucessor | SOC-107, CON-104, FIS-108 | SOC | Novo contador identificado | Antes da data efetiva | Carta com os fatos que o sucessor deve conhecer (art. 8º [C1]; item 3(l) [C2]): parcelamentos, processos, intimações em prazo, projetos consultivos | Próprio |
| e8 | Encerrar projetos consultivos e êxito | CON-105, CON-036 | CON | Rescisão | Até a data efetiva | Apura honorário de êxito devido; transfere prazos em curso | Próprio |
| e9 | Revogar procurações, autorizações e vínculos | SOC-024, SOC-013, FIS-007, DP-107, SOC-005 | SOC / DP | Data efetiva | Na data efetiva | Checklist de desvinculação gerado das matrizes (procurações, contabilista responsável nos cadastros, autorizações) | A (consulta) + D-assistido |
| e10 | Desligar captura, integrações e consumos | NFE-105, CTB-111, FIS-109, GES-010 | NFE / CTB / FIS | Data efetiva | Na data efetiva | Para consultas com o A1, Open Finance, robôs, ferramentas cobradas por CNPJ | Próprio |
| e11 | Desativar o cliente na plataforma | GES-108, SOC-008 | GES | Data efetiva | Na data efetiva; leitura pelo prazo combinado | App em somente leitura, tarefas recorrentes encerradas nos cores, descarte do A1 no cofre | Próprio + B |
| e12 | Reter, devolver e eliminar dados | SOC-108, DP-109, CTB-050 | SOC | Fim da leitura | Prazos legais (CTN art. 195, parágrafo único [C10]; Res. CFC 1.721/2024, art. 10: 5 anos para o cadastro PLD [C3]) | Tabela de temporalidade; fila de eliminação com aprovação (LGPD art. 16, via D1 F65) | Próprio |
| e13 | Atender o ex-cliente e o sucessor depois da saída | CIC-007 | SOC | Pedido posterior | Enquanto durar a responsabilidade do período | Responde com o acervo arquivado, registra o atendimento, cobra quando for extra | Próprio |

### f) Desligamento por encerramento da empresa (baixa)

Gatilho: decisão do cliente de encerrar (SOC-110 compara baixa com inatividade). O escritório costuma ser o último a sair: o contrato só termina depois da última obrigação de extinção.

| # | Passo | Fichas | Dono | Gatilho | Prazo | Agente | Nível |
| --- | --- | --- | --- | --- | --- | --- | --- |
| f1 | Decidir entre baixa e inatividade | SOC-110 | SOC | Cliente parou ou vai parar | — | Parecer com custos, débitos, intenção de retomar | Próprio |
| f2 | Planejar a tributação do encerramento | CON-106 | CON | Decisão de baixa | Antes do distrato social | Simula devolução de bens a valor contábil ou de mercado, lucros acumulados, saldos credores | Próprio |
| f3 | Orçar e cobrar o serviço de baixa | GES-109 | GES | Decisão de baixa | Antes de iniciar | Orçamento com meses de honorário até a última obrigação (art. 10 [C1]) | B |
| f4 | Encerrar o DP | DP-108, DP-026 a DP-032 | DP | Data de encerramento das atividades | Prazos de rescisão (CLT art. 477, via DP-027) | Rescisões, última folha, eventos de encerramento do eSocial pelo core | F + Próprio |
| f5 | Estoque final e ICMS | FIS-111 | FIS | Antes da baixa da IE | Antes do pedido de baixa | Calcula estoque, nota de baixa de estoque ou transferência, saldo credor | Próprio + D-assistido |
| f6 | Liquidação contábil | CTB-110, CTB-046 | CTB | Dissolução deliberada | Prazo do evento especial (CTB-110) | Balanço de liquidação, partilha, contas finais do liquidante; ECD e ECF de extinção pelo core | Próprio + F |
| f7 | Obrigações fiscais de extinção | FIS-110, FIS-018 (MEI) | FIS | Data da extinção | Por obrigação (FIS-110) | DEFIS/DASN-SIMEI de extinção, últimas DCTFWeb e EFD-Reinf, estaduais e municipais | A + D-assistido |
| f8 | Baixa societária e cadastral | SOC-031, SOC-032 (MEI) | SOC | Obrigações em dia ou plano definido | — | Distrato social, baixa de CNPJ, IE e IM pela REDESIM, roteiro guiado | D-assistido |
| f9 | Acervo documental da baixa | NFE-106, CTB-050, SOC-034 | NFE / CTB | Baixa deferida | Guarda até a prescrição (CTN art. 195, parágrafo único; vale mesmo com a empresa encerrada, segundo decisão citada em [C10]) | Pacote final ao ex-sócio com termo de entrega (CIC-003) | Próprio |
| f10 | Registros acessórios depois da baixa | SOC-109, DP-108 | SOC | CNPJ baixado | — | Conselhos, alvarás, domicílios, certificados | D-assistido |
| f11 | Desativar e reter | GES-108, SOC-108, FIS-109, NFE-105, CTB-111 | GES / SOC | Última obrigação entregue | — | Igual a e10 a e12 | Próprio |

### g) Desvios do ciclo (fichas CIC)

| Desvio | Ficha | Onde entra | Observação |
| --- | --- | --- | --- |
| Falecimento do titular ou de sócio | CIC-006 | Interrompe d; pode levar a f | MEI: baixa de ofício pela RFB a partir da informação dos cartórios, retroagindo à data do óbito (Res. CGSIM 48/2018, art. 36, na redação da Res. CGSIM 52, segundo e-book do Sebrae de 2022 [C7]; vigência em 2026 `[NÃO VERIFICADO]`) |
| Falência ou recuperação judicial do cliente | CIC-008 | Interrompe d; pode levar a f sem distrato comum | Representantes do falido entregam ao administrador judicial os livros obrigatórios e as senhas dos sistemas contábeis, financeiros e bancários (Lei 11.101/2005, art. 104, II e V, redação da Lei 14.112/2020, segundo [C5]) |
| Carteira recebida em bloco (compra ou fusão de escritórios) | CIC-005 | Variante de b para muitos clientes | NBC PG 01 permite transferir o contrato a outro profissional só com anuência do cliente, por escrito (item 5(b)) [C2] |
| Mudança de porte, regime ou atividade | CIC-010 | Reentrada parcial dentro de d | MEI → ME, Simples → Presumido, primeiro empregado, filial |
| Grupo econômico (várias empresas do mesmo dono) | CIC-009 | Entrada e manutenção | Contrato-mãe, cadastro de grupo, holding |

---

## 3. Catálogo de modelos e documentos do ciclo de vida

Todos ficam na biblioteca de modelos (SOC-101), com versão, data e a norma de origem; o M4 rascunha a partir do modelo e dos dados do cliente; quem assina é sempre humano. Coluna "Base" só traz norma com fonte; o resto está marcado.

| # | Documento | Etapa | Quando | Fichas | Base normativa | Conteúdo mínimo / observação |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Questionário de entrada e de aceitação | E | Antes da proposta | GES-101, CTB-101, GES-102 | NBC PG 01, itens 3(j) e 18(b) (via D7 R24); 18(b) lido em [C2] | Motivo da troca, honorários em aberto com o anterior, volume, folha, UFs |
| 2 | Ficha cadastral PLD (conheça seu cliente) | E, M | Antes do contrato; atualização periódica | SOC-019 | Res. CFC 1.721/2024, art. 3º (cadastro mínimo, inclusive PEP) e art. 10 (guarda por 5 anos) [C3] | PF: nome, CPF, documento; PJ: CNPJ e sócios, administradores e procuradores com CPF e condição de PEP |
| 3 | Proposta de prestação de serviços | E | Após qualificação | SOC-015 | Res. CFC 1.590/2020, art. 4º [C1]; NBC PG 01, itens 6 a 8 e 10 [C2] | Detalhamento, periodicidade, valor de cada serviço, pagamento, duração, reajuste, parte executada pelo cliente; registro do CRC do signatário (NBC PG 01, 3(r) [C2]) |
| 4 | Contrato de prestação de serviços contábeis | E | Após aceite formal | SOC-016 | Res. CFC 1.590/2020, arts. 1º, 2º e 5º [C1]; NBC PG 01, item 9 [C2] | Alíneas a a m do art. 2º: partes, serviços, o que o contratante executa, duração, honorários por serviço, prazo de pagamento, reajuste, responsabilidades, aditamento, carta de responsabilidade, ciência da Lei 9.613/1998, cláusula rescisória com aviso prévio, foro [C1]. Modelos antigos do CFC (anexos da Res. 1.457/2013, revogada) eram sugestões [C1-b]; não se achou anexo na 1.590 `[NÃO VERIFICADO]` |
| 5 | Matriz de responsabilidades / anexo de escopo | E, M | Com o contrato e a cada aditivo | DP-101, SOC-017 | Art. 2º, "c" [C1]; NBC PG 01, item 10 [C2] | Quem faz o quê (escritório × cliente) por setor; prazos de envio de documentos |
| 6 | Termo aditivo | M | Mudança de escopo ou preço | SOC-018, GES-014, CIC-010 | Art. 2º, "i" [C1] | Novo escopo, valor e vigência |
| 7 | Termo de tratamento de dados (escritório operador) | E | Com o contrato | SOC-020 | LGPD art. 39 e cliente controlador / escritório operador (via D1 F65); guia da ANPD lista o prazo de eliminação entre os itens a combinar [C12] | Finalidade, instruções, segurança, suboperadores (cores, APIs), devolução e eliminação no fim |
| 8 | Termo de custódia do certificado A1 e de acessos | E | Coleta do A1 no app | SOC-008, GES-104 | `[NÃO VERIFICADO]` (sem norma específica achada) | Finalidade de uso, registro de uso (SOC-010), descarte na saída |
| 9 | Roteiro e confirmação de procurações e autorizações | E | Implantação | SOC-011, SOC-013, FIS-007, DP-042, CIC-004 | Procuração eletrônica no e-CAC e autorização do Meu Imposto de Renda [C13] | Lista por órgão, escopo e vencimento |
| 10 | Carta de responsabilidade da administração | M (anual) | Encerramento do exercício | CTB-039 | Res. CFC 1.590/2020, art. 3º e art. 2º, "j" [C1]; ITG 1000, itens 12 a 15 e modelo no Anexo 1 [C4] | Recusa: o profissional avalia riscos e adota salvaguardas (art. 3º, parágrafo único [C1]) |
| 11 | Notificação ao contador anterior e termo de corte | E | Início da transição | SOC-104, FIS-102 | Res. CFC 1.590/2020, arts. 8º a 10 [C1]; NBC PG 01, 3(l) e 18(d) [C2] | Última competência do anterior, primeira do escritório, obrigação por obrigação |
| 12 | Carta única de solicitação de acervo e termo de recebimento | E | Transição | CIC-002, SOC-023 | Arts. 7º e 9º [C1] | Checklist consolidado de todos os setores; recibo item a item com pendências |
| 13 | Checklists de entrada por molde (abertura, transição, MEI, PF, grupo) | E | Contrato assinado | CIC-001, SOC-021 | — | Gerados do perfil; base dos painéis de GES-106 |
| 14 | Parecer de diagnóstico de entrada e orçamento de regularização | E | Após diagnóstico | SOC-022, CON-101, GES-103 | NBC PG 01, 3(i) (comunicar circunstância adversa ao cliente em documento reservado) [C2] | Pendências herdadas, risco, custo e prazo da regularização |
| 15 | Kit de boas-vindas | E | Dia 1 | GES-105 | — | Canais, responsáveis, calendário do cliente, como usar o app |
| 16 | Termo de anuência para transferência de contrato | E | Carteira recebida em bloco | CIC-005 | NBC PG 01, item 5(b) [C2] | Anuência escrita do cliente; novo contrato logo depois |
| 17 | Notificação de rescisão ou de renúncia | D | Início da saída | SOC-106 | NBC PG 01, 3(k) [C2]; Res. CFC 1.590/2020, art. 6º, parágrafo único [C1] | Data efetiva respeitando o aviso prévio |
| 18 | Distrato de prestação de serviços | D | Antes da data efetiva | SOC-106, GES-046 | Res. CFC 1.590/2020, arts. 6º, 7º, 9º e 10 [C1] | Cessação das responsabilidades, recepção dos documentos pelo cliente, forma e prazo de devolução, quem faz as demonstrações e as acessórias do período |
| 19 | Relação de obrigações remanescentes | D | Após o corte | SOC-107, FIS-108 | Art. 10 [C1] | Lista com responsável e prazo; base do "encerrado" |
| 20 | Carta ao sucessor (fatos relevantes) | D | Antes da data efetiva | SOC-107, CON-104 | Art. 8º [C1]; NBC PG 01, 3(l) [C2] | Parcelamentos, processos, intimações, prazos em curso |
| 21 | Termo de entrega de documentos e arquivos (com manifesto) | D | Entrega do acervo | CIC-003, SOC-024 | Arts. 7º e 9º [C1]; vedação de retenção, NBC PG 01, 4(l) [C2] | Índice por setor, lista de arquivos com resumo criptográfico, assinatura de recebimento |
| 22 | Checklist de desvinculação | D | Data efetiva | SOC-024, DP-107, FIS-109, NFE-105 | Exclusão do contabilista no CADESP pela REDESIM (via D1 F47) | Procurações, autorizações, contabilista responsável, autXML, Open Finance |
| 23 | Registro de eliminação de dados | D | Fim da guarda | SOC-108, DP-109 | LGPD art. 16 (via D1 F65); CTN art. 195, parágrafo único [C10] | O que se guarda, até quando, o que foi eliminado e por quem |
| 24 | Orçamento e contrato do serviço de baixa | D | Decisão de baixa | GES-109 | Art. 10 [C1] | Meses de honorário até a última obrigação |
| 25 | Parecer baixa × inatividade | M, D | Cliente parou | SOC-110 | `[NÃO VERIFICADO]` (regras de declaração de inatividade) | Custos e riscos de cada caminho |
| 26 | Roteiro de falecimento (MEI, EI, sócio) | M, D | Óbito informado | CIC-006 | [C7], [C9] | Documentos do inventariante, baixa de ofício do MEI, declaração final de espólio |
| 27 | Ofício de entrega ao administrador judicial | D | Falência decretada | CIC-008 | Lei 11.101/2005, art. 104, II e V [C5] | Livros, instrumentos de escrituração, senhas, termo de entrega |

**Assinatura dos documentos.** A Lei 14.063/2020 classifica as assinaturas eletrônicas (simples, avançada, qualificada), mas seu art. 2º a afasta das relações entre particulares; para contratos privados vale o acordo das partes sobre o meio de assinatura (MP 2.200-2/2001, art. 10, §2º), segundo fontes secundárias [C11]. Proposta prática para os contadores decidirem: contrato, distrato e termo de entrega com assinatura avançada (gov.br ou plataforma) ou qualificada (ICP-Brasil); o resto com aceite no app registrado na trilha. `[NÃO VERIFICADO quanto a exigência do CRC sobre o meio de assinatura]`

---

## 4. Lacunas transversais: fichas CIC

Lacunas encontradas ao montar as jornadas: atividades que **nenhum setor** cobriu ou que cada setor cobriu só na sua parte, sem quem junte. Busca feita nos arquivos D por termos como pessoa física, IRPF, falência, recuperação judicial, carteira, falecimento, espólio, grupo econômico, estado do cliente (0 ou poucas ocorrências, só acessórias). Mesmo formato das fichas da rodada 3, com as notas da regra do consolidado (dor, freq, risco, dif).

### CIC-001 · Manter o estado do ciclo de vida do cliente e orquestrar as jornadas entre setores

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Ciclo de vida (transversal) / Orquestração |
| etapa | Entrada, Manutenção, Desligamento |
| atividade | Manter um estado único por cliente (prospect, proposta, aceito, em implantação, ativo, inativo, em saída, em baixa, encerrado, arquivado, eliminado), escolher o molde de jornada (abertura, transição, MEI, PF, grupo, carteira em bloco) e, a cada transição, gerar os projetos e tarefas de todos os setores com dono e prazo; impedir transições com pendência (ex.: "encerrado" com obrigação remanescente) |
| descrição | Cada setor criou seu gatilho próprio (SOC-021 "contrato assinado", SOC-024 "projeto inverso", GES-108 "data de corte", GES-109 "decisão de baixa") e várias fichas pedem "um gatilho único" (GES-046, GES-108), mas nenhuma ficha é dona do estado. Roteiros de 90 dias com checklist único são recomendados (D1 F56). Também cobre o cliente que volta (reaproveitar cadastro arquivado dentro do prazo de guarda, refazer PLD e contrato). |
| gatilho_frequência | Por evento (cada transição) + diária (checagem de pendências que travam o estado) |
| porte_alcance | Toda a carteira |
| quem_faz | Sócio / gestor da carteira; hoje ninguém de forma explícita |
| onde_é_feita_hoje | Planilhas e memória; cada setor descobre a entrada ou a saída por mensagem `[NÃO VERIFICADO]` |
| entradas / saídas | Contrato, distrato, decisão de baixa, perfil do cliente → estado, moldes de jornada, projetos nos cores (APIs de processos), painel por cliente |
| base_legal | Res. CFC 1.590/2020, arts. 5º, 6º e 10 (marcos que mudam o estado) [C1] |
| risco_se_falhar | Setor que não sabe da entrada perde prazo (90 dias de NF-e, opção do Simples); setor que não sabe da saída continua cobrando ou transmitindo; obrigação do mês de corte sem dono (multa) |
| tempo_estimado | 30–60 min por transição em coordenação manual `[ESTIMATIVA]` |
| concorrentes | Gestta trata onboarding como prática de sucesso do cliente (D1 F32); módulo de estado de ciclo de vida integrado aos cores `[NÃO ENCONTRADO]` |
| hipótese_automação | Máquina de estados na plataforma; moldes de jornada versionados com tarefas condicionais ao perfil; criação de tarefas nos cores pelas APIs de processos; bloqueios de transição |
| papel_da_ia | M2 ler (perfil e pendências), M4 executar (gerar projetos, com cartão de aprovação), M1 ler (marcos legais da transição) |
| ferramentas_agênticas | `mudar_estado_cliente(cliente_id, novo_estado, motivo)`, `gerar_jornada(cliente_id, molde)`, `listar_bloqueios_transicao(cliente_id)` |
| eventos_timesheet | `cic.estado.mudar`, `cic.jornada.gerar` |
| nível_automação (provisório) | Próprio (tarefas nos cores por B) |
| notas | dor 4 · freq 2 · risco 4 · dif 4 |
| fontes_descoberta | [C1]; D1 F32, F56 |

### CIC-002 · Fazer um pedido único de acervo ao contador anterior e controlar o recebimento

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Ciclo de vida (transversal) / Transição de entrada |
| etapa | Entrada |
| atividade | Juntar num só pedido o que todos os setores precisam do contador anterior (livros e ECD/ECF, balancetes e razão, saldos, XMLs, arquivos e recibos de obrigações, arquivos do eSocial e fichas de empregados, parcelamentos, processos, intimações, pareceres, senhas que forem do cliente), enviar com prazo, receber item a item, registrar o que faltou e cobrar |
| descrição | Seis fichas pedem coisas ao anterior separadamente (SOC-023, NFE-101, DP-103, CTB-102, CTB-103, CON-102, além de FIS-104/105). Seis pedidos ao mesmo colega geram atrito, que a NBC PG 01 manda evitar (item 18(d)) [C2]. A Res. CFC 1.590/2020 põe no distrato do anterior a forma e o prazo de devolução dos livros, documentos e arquivos, inclusive eletrônicos (art. 9º), e o dever de comunicar ao novo responsável os fatos relevantes (art. 8º) [C1]. |
| gatilho_frequência | Por evento (cliente vindo de outra contabilidade) |
| porte_alcance | Todo cliente em transição |
| quem_faz | Legalização / onboarding, com cada setor conferindo o seu item |
| onde_é_feita_hoje | E-mail e WhatsApp, por setor `[NÃO VERIFICADO]` |
| entradas / saídas | Perfil do cliente, termo de corte (SOC-104) → carta única, checklist com dono por item, termo de recebimento, pendências com tarefa |
| base_legal | Res. CFC 1.590/2020, arts. 7º a 9º [C1]; NBC PG 01, itens 3(l) e 18(d) [C2] |
| risco_se_falhar | Acervo incompleto descoberto meses depois (ECD sem saldo de abertura, eSocial sem histórico); perda da janela de documentos; conflito com o colega |
| tempo_estimado | 1–3 h por cliente somando os setores `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Checklist montado do perfil (regime, folha, UFs, escrituração); link de envio para o anterior subir os arquivos direto na plataforma; reconhecimento do tipo de arquivo e conferência automática (ECD lida, XMLs contados contra a distribuição) |
| papel_da_ia | M2 ler (perfil), M4 rascunhar (carta) e executar (cobranças, com aprovação), M3 conferir (contagens) |
| ferramentas_agênticas | `montar_pedido_acervo(cliente_id)`, `registrar_recebimento(pedido_id, item, arquivo)`, `listar_pendencias_acervo(cliente_id)` |
| eventos_timesheet | `cic.acervo.pedir`, `cic.acervo.receber` |
| nível_automação (provisório) | Próprio |
| notas | dor 4 · freq 2 · risco 4 · dif 5 |
| fontes_descoberta | [C1], [C2] |

### CIC-003 · Montar o dossiê único de saída e colher o termo de entrega com manifesto

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Ciclo de vida (transversal) / Desligamento |
| etapa | Desligamento |
| atividade | Consolidar os pacotes de saída de todos os setores (SOC-024, FIS-108, NFE-036/104/106, DP-106, CTB-050/109, CON-104) num índice único, gerar o manifesto (lista de arquivos com resumo criptográfico), entregar pelo canal combinado e colher a assinatura do termo de entrega do cliente ou do sucessor |
| descrição | Cada setor gera seu pacote, mas a prova de entrega é única e é o que protege o escritório: o distrato deve prever a recepção dos documentos pelo cliente e a forma e o prazo da devolução (arts. 7º e 9º da Res. CFC 1.590/2020) [C1], e a NBC PG 01 veda reter abusivamente arquivos, inclusive eletrônicos (item 4(l)) [C2]. Sem manifesto, não há como provar o que foi entregue. |
| gatilho_frequência | Por evento (saída ou baixa) |
| porte_alcance | Todo cliente que sai |
| quem_faz | Legalização / sócio |
| onde_é_feita_hoje | Pendrive, link de nuvem ou e-mail, sem índice `[NÃO VERIFICADO]` |
| entradas / saídas | Pacotes dos setores → dossiê com índice, manifesto, termo de entrega assinado, registro na trilha |
| base_legal | Res. CFC 1.590/2020, arts. 7º e 9º [C1]; NBC PG 01, item 4(l) [C2] |
| risco_se_falhar | Processo ético por retenção; disputa sobre o que foi entregue; responsabilidade sobre documento perdido |
| tempo_estimado | 2–6 h por cliente `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Pacote gerado do acervo da plataforma e dos cores; manifesto e termo automáticos; link de download com registro de acesso; assinatura eletrônica |
| papel_da_ia | M2 ler (acervo), M4 executar (gerar dossiê e termo, com aprovação) |
| ferramentas_agênticas | `montar_dossie_saida(cliente_id, data_corte)`, `gerar_manifesto(dossie_id)`, `registrar_entrega(dossie_id, recebedor)` |
| eventos_timesheet | `cic.saida.dossie`, `cic.saida.entregar` |
| nível_automação (provisório) | Próprio (assinatura por B) |
| notas | dor 4 · freq 2 · risco 4 · dif 5 |
| fontes_descoberta | [C1], [C2] |

### CIC-004 · Conduzir a entrada e o ciclo do cliente pessoa física (IRPF, carnê-leão, produtor rural)

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Ciclo de vida (transversal) / Pessoa física |
| etapa | Entrada, Manutenção, Desligamento |
| atividade | Entrada: contrato da PF, cadastro PLD, acesso na Receita (procuração eletrônica ou autorização do Meu Imposto de Renda), diagnóstico (declarações anteriores, pré-preenchida, malha, pendências). Manutenção: coleta anual de informes pelo app, declaração do IRPF, carnê-leão mensal, ganho de capital, livro caixa do produtor rural. Desligamento: entrega de declarações, recibos e memórias de cálculo e revogação dos acessos |
| descrição | Nenhum setor tem a jornada da PF; ela aparece só como extra (SOC-017, GES-009) ou de passagem (FIS-021, CTB-035). O IRPF 2026 foi entregue de 23/03 a 29/05/2026 (IN RFB 2.312/2026, segundo notícia do CRC-SP) [C8]. A PF outorga procuração eletrônica no e-CAC com conta gov.br prata ou ouro, e o Meu Imposto de Renda tem autorização de acesso própria, com validade limitada (6 meses na fonte de 2023) [C13]. Produtor rural com receita bruta acima de R$ 4,8 milhões entrega o LCDPR (IN RFB 1.848/2018, segundo fontes secundárias) [C14]. |
| gatilho_frequência | Anual (campanha de IRPF) + mensal (carnê-leão) + por evento (entrada, venda de bem) |
| porte_alcance | Sócios dos clientes PJ e clientes PF avulsos |
| quem_faz | Fiscal ou equipe sazonal de IRPF |
| onde_é_feita_hoje | Programa da Receita, planilhas, WhatsApp para pedir informes `[NÃO VERIFICADO]` |
| entradas / saídas | Informes de rendimentos, pré-preenchida, notas de corretagem, recibos médicos → declaração, DARF, recibo, relatório ao cliente |
| base_legal | IN RFB 2.312/2026 (prazo do IRPF 2026, via [C8]); IN RFB 1.848/2018 (LCDPR, via [C14]); Res. CFC 1.721/2024, art. 3º (cadastro PF) [C3] |
| risco_se_falhar | Multa por atraso, malha fina, CPF pendente de regularização [C8] |
| tempo_estimado | 1–4 h por declaração `[ESTIMATIVA]` |
| concorrentes | Há programas de IRPF para escritórios no mercado `[NÃO VERIFICADO: nomes e recursos]` |
| hipótese_automação | Lista de informes por cliente gerada da declaração anterior; coleta pelo app; leitura dos informes; montagem dos dados (M3); transmissão no programa da Receita feita pela pessoa (sem API de transmissão encontrada `[NÃO VERIFICADO]`) |
| papel_da_ia | M1 ler (regras do ano), M3 calcular (carnê-leão, ganho de capital, comparação simplificada × completa), M4 rascunhar (relatório) |
| ferramentas_agênticas | `abrir_campanha_irpf(ano)`, `pedir_informes_pf(cpf)`, `calcular_carne_leao(cpf, competencia)` |
| eventos_timesheet | `cic.pf.entrada`, `cic.pf.irpf`, `cic.pf.carneleao` |
| nível_automação (provisório) | D-assistido |
| notas | dor 4 · freq 2 · risco 4 · dif 3 |
| fontes_descoberta | [C3], [C8], [C13], [C14] |

### CIC-005 · Receber uma carteira de clientes em bloco (compra de carteira ou fusão de escritórios)

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Ciclo de vida (transversal) / Entrada em lote |
| etapa | Entrada |
| atividade | Quando o escritório compra uma carteira ou se funde com outro: colher a anuência escrita de cada cliente, fazer novo contrato, rodar a transição (jornada b) em lote com corte comum, migrar cadastros e acervos de uma vez e trocar procurações e acessos de todos |
| descrição | A NBC PG 01 permite ao contador transferir o contrato a outro profissional só com a anuência do cliente, sempre por escrito (item 5(b)) [C2]. Busca sobre cessão de carteira não achou orientação específica do CFC ou dos CRCs [C2-b]. Nenhuma ficha trata a entrada em lote. |
| gatilho_frequência | Raro (por projeto) |
| porte_alcance | Grupos de escritórios em crescimento |
| quem_faz | Sócios |
| onde_é_feita_hoje | Projeto manual `[NÃO VERIFICADO]` |
| entradas / saídas | Lista de clientes cedidos, contratos antigos → anuências, novos contratos, jornadas b em lote, painel da migração |
| base_legal | NBC PG 01, item 5(b) [C2]; Res. CFC 1.590/2020 (novo contrato, art. 1º) [C1]; LGPD (transferência de dados entre operadores) `[NÃO VERIFICADO]` |
| risco_se_falhar | Cliente sem anuência (infração ética); perda de clientes na migração; obrigações do mês de corte sem dono |
| tempo_estimado | Semanas de projeto `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Importação em lote dos cadastros; envio e controle de anuências e contratos com assinatura eletrônica; CIC-001 gera as jornadas b em lote |
| papel_da_ia | M4 executar em lote (com aprovação), M2 ler (painel) |
| ferramentas_agênticas | `importar_carteira(arquivo)`, `enviar_anuencias(lote_id)` |
| eventos_timesheet | `cic.carteira.migrar` |
| nível_automação (provisório) | Próprio |
| notas | dor 3 · freq 1 · risco 3 · dif 5 |
| fontes_descoberta | [C2] |

### CIC-006 · Tratar o falecimento do titular ou de um sócio do cliente

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Ciclo de vida (transversal) / Eventos de exceção |
| etapa | Manutenção, Desligamento |
| atividade | Ao saber do óbito: registrar o inventariante ou herdeiro como novo interlocutor, suspender acessos e procurações do falecido, decidir com a família entre continuar (alteração contratual, sucessão) ou baixar; no MEI, acompanhar a baixa de ofício; no sócio PF cliente, preparar as declarações de espólio |
| descrição | Para o MEI, a baixa por óbito é de ofício pela RFB, em D+1 da informação do cartório, retroagindo à data do óbito; quando não ocorre de ofício, herdeiro ou inventariante pede a baixa à RFB com certidão de óbito e prova da condição; recomenda-se pagar DAS em aberto e entregar a DASN-SIMEI de extinção (Res. CGSIM 48/2018, art. 36, na redação da Res. CGSIM 52, segundo e-book Sebrae atualizado em 16/05/2022) [C7]. A declaração final de espólio é do inventariante; em 2025 o prazo foi unificado com o do IRPF (IN RFB 2.263/2025, segundo [C9]). EI, LTDA e sociedade dependem do contrato social e do inventário `[NÃO VERIFICADO]`. |
| gatilho_frequência | Raro |
| porte_alcance | MEI, EI, sociedades com sócio único ou pequeno quadro, clientes PF |
| quem_faz | Sócio / legalização |
| onde_é_feita_hoje | Caso a caso `[NÃO VERIFICADO]` |
| entradas / saídas | Certidão de óbito, documentos do inventariante → roteiro, cadastro do novo interlocutor, decisão continuar ou baixar |
| base_legal | Res. CGSIM 48/2018, art. 36 (via [C7]; vigência em 2026 `[NÃO VERIFICADO]`); IN RFB 2.263/2025 (via [C9]) |
| risco_se_falhar | Obrigações paradas e multas; uso indevido de certificado ou procuração do falecido; atendimento a quem não tem poder de representação |
| tempo_estimado | 2–8 h ao longo de meses `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Roteiro por tipo de cliente; bloqueio imediato dos acessos do falecido no cofre; vigilância do CNPJ para confirmar a baixa de ofício (SOC-003) |
| papel_da_ia | M1 ler (roteiro), M4 rascunhar (comunicações), M2 registrar |
| ferramentas_agênticas | `registrar_obito(pessoa_id, data)`, `gerar_roteiro_sucessao(cliente_id)` |
| eventos_timesheet | `cic.obito.tratar` |
| nível_automação (provisório) | D-humano |
| notas | dor 3 · freq 1 · risco 4 · dif 5 |
| fontes_descoberta | [C7], [C9] |

### CIC-007 · Atender o ex-cliente e o sucessor depois da saída (responsabilidade residual)

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Ciclo de vida (transversal) / Pós-desligamento |
| etapa | Desligamento |
| atividade | Depois do encerramento: atender pedidos de documentos, esclarecimentos do sucessor, intimações e fiscalizações sobre o período em que o escritório foi responsável, retificações de competências da vigência; registrar cada atendimento e cobrar quando for fora do distrato |
| descrição | O rescindente responde pelas acessórias de competência da vigência, mesmo com vencimento posterior (art. 10 da Res. CFC 1.590/2020) [C1], e livros e comprovantes são guardados até a prescrição dos créditos (CTN art. 195, parágrafo único) [C10]. Ou seja, a relação não termina na data efetiva. SOC-108 cuida da guarda e do descarte; ninguém cuida do atendimento depois da saída. |
| gatilho_frequência | Por evento (pedido posterior), durante anos |
| porte_alcance | Todos os ex-clientes |
| quem_faz | Setor do assunto / sócio |
| onde_é_feita_hoje | WhatsApp e e-mail, sem registro `[NÃO VERIFICADO]` |
| entradas / saídas | Pedido do ex-cliente, do sucessor ou do Fisco → resposta com o acervo arquivado, registro, cobrança se extra |
| base_legal | Res. CFC 1.590/2020, arts. 8º e 10 [C1]; CTN art. 195, parágrafo único [C10]; NBC PG 01, 3(c) (sigilo) [C2] |
| risco_se_falhar | Multa ou autuação sobre o período do escritório sem defesa; documento entregue a quem não tem direito (sigilo, LGPD) |
| tempo_estimado | 15 min a horas por pedido `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Estado "arquivado" com acervo em somente leitura e período de responsabilidade registrado; verificação de quem pede; resposta rascunhada a partir do acervo |
| papel_da_ia | M2 ler (acervo e período), M1 ler (responsabilidade), M4 rascunhar |
| ferramentas_agênticas | `consultar_periodo_responsabilidade(cliente_id)`, `atender_pedido_ex_cliente(cliente_id, pedido)` |
| eventos_timesheet | `cic.posaida.atender` |
| nível_automação (provisório) | Próprio |
| notas | dor 3 · freq 2 · risco 4 · dif 5 |
| fontes_descoberta | [C1], [C2], [C10] |

### CIC-008 · Atender a falência ou a recuperação judicial do cliente

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Ciclo de vida (transversal) / Eventos de exceção |
| etapa | Manutenção, Desligamento |
| atividade | Na recuperação judicial: preparar as demonstrações contábeis exigidas no pedido e os relatórios periódicos que o administrador judicial pedir. Na falência: preparar com os representantes do falido a entrega ao administrador judicial dos livros obrigatórios, instrumentos de escrituração e senhas de sistemas contábeis, financeiros e bancários; registrar a entrega e decidir o fim do contrato |
| descrição | Pela Lei 11.101/2005, art. 104, na redação da Lei 14.112/2020, os representantes legais do falido entregam ao administrador judicial os livros obrigatórios e demais instrumentos de escrituração, encerrados por termo (inciso II), e bens, papéis, documentos e senhas de acesso a sistemas contábeis, financeiros e bancários (inciso V), sob pena de crime de desobediência (parágrafo único), segundo [C5]. O pedido de recuperação judicial exige demonstrações contábeis de três exercícios e as levantadas para o pedido (art. 51, II), segundo artigo acadêmico [C6]. O papel do contador do devedor não aparece nas fontes lidas `[NÃO VERIFICADO]`. |
| gatilho_frequência | Raro |
| porte_alcance | Clientes com escrituração completa em crise |
| quem_faz | Sócio / contábil |
| onde_é_feita_hoje | Caso a caso |
| entradas / saídas | Decisão judicial, pedidos do administrador → demonstrações, pacote de livros e senhas com termo, registro |
| base_legal | Lei 11.101/2005, art. 104, II e V (via [C5]); art. 51, II (via [C6]) |
| risco_se_falhar | Crime de desobediência para os representantes; responsabilidade do escritório por documento não entregue; honorários perdidos |
| tempo_estimado | Dias de trabalho `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Roteiro com prazos do processo; pacote gerado do acervo (CIC-003); alerta de honorários como crédito a habilitar `[NÃO VERIFICADO]` |
| papel_da_ia | M1 ler, M4 rascunhar, M2 registrar |
| ferramentas_agênticas | `abrir_roteiro_falencia_rj(cliente_id, tipo)` |
| eventos_timesheet | `cic.falencia.atender` |
| nível_automação (provisório) | D-humano |
| notas | dor 3 · freq 1 · risco 4 · dif 5 |
| fontes_descoberta | [C5], [C6] |

### CIC-009 · Cadastrar e atender o grupo econômico como uma conta só

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Ciclo de vida (transversal) / Cadastro |
| etapa | Entrada, Manutenção |
| atividade | Quando um mesmo dono traz várias empresas (operacionais, holding, filiais, empresas dos sócios) e a PF dos sócios: cadastrar o grupo, fazer contrato-mãe com anexos por CNPJ ou contratos ligados, entrar todas com o mesmo corte, consolidar relatórios, honorários e atendimento, e tratar a saída de uma empresa sem desligar o grupo |
| descrição | A busca nos arquivos D por "grupo econômico" não achou ocorrência; SOC-001 cadastra por CNPJ e GES-013 calcula rentabilidade por cliente, mas a negociação, a reunião e a decisão de sair costumam ser do grupo. Sem norma específica achada. |
| gatilho_frequência | Por evento (entrada do grupo, nova empresa) + mensal (relatórios consolidados) |
| porte_alcance | Clientes com mais de um CNPJ |
| quem_faz | Sócio / gestor da conta |
| onde_é_feita_hoje | Cadastros separados no core `[NÃO VERIFICADO]` |
| entradas / saídas | CNPJs e CPFs do grupo → conta de grupo, contrato-mãe, painel e relatório consolidados |
| base_legal | `[NÃO VERIFICADO]` |
| risco_se_falhar | Honorário mal precificado; uma empresa do grupo esquecida na transição; perda do grupo todo |
| tempo_estimado | 1–2 h por grupo na entrada `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Entidade "grupo" na plataforma; detecção de sócios em comum pelo QSA (SOC-004); jornadas geradas para todas as empresas |
| papel_da_ia | M2 ler, M4 rascunhar |
| ferramentas_agênticas | `criar_grupo(cnpjs, cpfs)`, `detectar_grupo_por_qsa(cliente_id)` |
| eventos_timesheet | `cic.grupo.cadastrar` |
| nível_automação (provisório) | Próprio |
| notas | dor 3 · freq 2 · risco 3 · dif 4 |
| fontes_descoberta | — |

### CIC-010 · Conduzir as reentradas parciais quando o cliente muda de porte, regime ou atividade

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Ciclo de vida (transversal) / Manutenção |
| etapa | Manutenção |
| atividade | Tratar como "mini-entrada" os eventos que mudam o pacote do cliente: MEI que vira ME, troca de regime, primeiro empregado, filial ou UF nova, atividade nova sujeita a ICMS ou a licença; gerar as tarefas de implantação nos setores afetados e o aditivo de honorários |
| descrição | As partes existem em fichas isoladas (FIS-018 desenquadramento, DP-105 primeiro empregado, SOC-033 filial, CON-009 opção de regime, GES-015 volume que pede revisão, SOC-018 aditivo), mas ninguém dispara o conjunto. O aditivo está previsto no contrato (art. 2º, "i" da Res. CFC 1.590/2020) [C1]. |
| gatilho_frequência | Por evento |
| porte_alcance | Toda a carteira |
| quem_faz | Setor que percebe o evento + gestor da carteira |
| onde_é_feita_hoje | Descoberto quando a primeira obrigação nova falha `[NÃO VERIFICADO]` |
| entradas / saídas | Evento detectado (limite do MEI, contratação, inscrição nova) → jornada parcial, aditivo |
| base_legal | Res. CFC 1.590/2020, art. 2º, "i" [C1]; regras próprias de cada ficha citada |
| risco_se_falhar | Obrigação nova não cumprida (multa); serviço a mais sem cobrança |
| tempo_estimado | 1–3 h por evento `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | CIC-001 com moldes de "reentrada"; detecção pelos vigias existentes (FIS-011, FIS-017, SOC-003, DP-001) |
| papel_da_ia | M2 detectar, M4 gerar tarefas e aditivo (com aprovação), M3 recalcular honorário |
| ferramentas_agênticas | `abrir_reentrada(cliente_id, evento)` |
| eventos_timesheet | `cic.reentrada.abrir` |
| nível_automação (provisório) | Próprio |
| notas | dor 4 · freq 2 · risco 4 · dif 4 |
| fontes_descoberta | [C1] |

### CIC-011 · Medir o ciclo de vida da carteira (funil, implantação, permanência e saída)

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Ciclo de vida (transversal) / Indicadores |
| etapa | Entrada, Manutenção, Desligamento |
| atividade | Painel com o funil de entrada (lead, proposta, aceite, recusa e motivo), tempo e custo de implantação por molde, clientes em cada estado, saídas por motivo e tempo de desligamento, clientes que voltaram; insumo para o comparativo com o levantamento dos contadores |
| descrição | Partes estão em GES-011 (indicadores financeiros), GES-043 (risco de saída), GES-106 (custo da entrada) e GES-107 (motivo de saída), mas sem uma visão do ciclo. Sem fonte de mercado buscada nesta rodada. |
| gatilho_frequência | Mensal |
| porte_alcance | Escritório |
| quem_faz | Sócios |
| onde_é_feita_hoje | Não é feito ou é feito em planilha `[NÃO VERIFICADO]` |
| entradas / saídas | Estados (CIC-001), timesheet, motivos → painel e relatório mensal |
| base_legal | — |
| risco_se_falhar | Perda de clientes sem diagnóstico; implantação cara sem repasse |
| tempo_estimado | 1–2 h por mês se manual `[ESTIMATIVA]` |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Calculado dos estados e do timesheet, sem digitação |
| papel_da_ia | M2 ler e resumir |
| ferramentas_agênticas | `painel_ciclo_vida(periodo)` |
| eventos_timesheet | — |
| nível_automação (provisório) | Próprio |
| notas | dor 2 · freq 3 · risco 3 · dif 4 |
| fontes_descoberta | — |

---

## 5. Contagem por etapa e pontos para a conversa com os contadores

**Contagem** (fichas originais e da rodada 3 dos setores, pela classificação entregue pelos agentes de setor, mais as 11 CIC). Uma ficha com mais de uma etapa conta em cada uma.

| Setor | Fichas | Com Entrada | Com Manutenção | Com Desligamento |
| --- | --- | --- | --- | --- |
| SOC | 56 | 36 | 36 | 15 |
| FIS | 58 | 20 | 48 | 8 |
| NFE | 46 | 8 | 40 | 4 |
| DP | 71 | 9 | 62 | 14 |
| CTB | 63 | 18 | 53 | 8 |
| CON | 44 | 11 | 38 | 4 |
| GES | 71 | 16 | 60 | 8 |
| CIC | 11 | 6 | 7 | 7 |
| **Total** | **420** | **124** | **344** | **68** |

(Contagem calculada por script a partir da lista de classificação recebida e das etapas nos títulos das fichas novas; conferir com o visualizador.)

**Pontos que valem a conversa:**

1. **Onde o setor termina e a jornada começa.** As maiores falhas prováveis não estão dentro dos setores, e sim nas emendas: o pedido ao contador anterior (CIC-002), a prova de entrega na saída (CIC-003) e o estado do cliente (CIC-001). Perguntar aos contadores quem hoje é dono dessas emendas.
2. **Competência de corte.** Aparece em seis fichas (SOC-104, FIS-102, NFE-104, DP-104, CTB-105, SOC-107). Confirmar se os contratos do grupo usam a regra padrão do art. 10 da Res. CFC 1.590/2020 ou cláusula em contrário [C1].
3. **Pessoa física.** Confirmar se o grupo atende PF como cliente (não só o sócio) e se a campanha de IRPF entra na plataforma (CIC-004).
4. **Desvios raros.** Falecimento, falência e carteira em bloco são raros, mas caros quando acontecem; decidir se viram roteiro (checklist) ou se ficam fora do escopo.
5. **Prazos internos.** Os prazos marcados `[ESTIMATIVA]` (30/90 dias, SLA de proposta, fechamento contábil) são sugestões a substituir pelos combinados do grupo.

---

## 6. Fontes

Consultadas em 6/11/2026. Páginas lidas pelo agente estão marcadas "(aberta)"; as demais foram lidas pelo resumo do buscador.

| Código | Fonte |
| --- | --- |
| C1 | Resolução CFC 1.590/2020 (contrato e distrato de prestação de serviços contábeis), texto integral, arts. 1º a 14 (aberta): https://www.normaslegais.com.br/legislacao/resolucao-cfc-1590-2020.htm |
| C1-b | Resolução CFC 1.457/2013 (revogada pela 1.590/2020), anexos de modelos como sugestão, via resultado de busca: https://www.legisweb.com.br/legislacao/?id=262863 ; Editorial CRC-MS: https://crcms.org.br/editorial-a-obrigatoriedade-da-adocao-do-contrato-de-prestacao-de-servicos-profissionais-de-contabilidade/ |
| C2 | NBC PG 01, Código de Ética Profissional do Contador, itens 3, 4, 5, 6 a 10, 15 a 18 (aberta): https://www.normaslegais.com.br/legislacao/nbc-1-2019.htm |
| C2-b | Busca sobre cessão ou compra de carteira contábil, sem norma específica encontrada (resultados de fórum e de outras profissões): https://www.contabeis.com.br/forum/legalizacao-de-empresas/303367/modelo-de-contrato-de-prestacao-de-servico/ ; https://jornalcontabil.com.br/noticia/cuidados-especiais-para-nao-infringir-a-etica-na-contabilidade-e-criar-problemas-com-o-crc/ |
| C3 | Resolução CFC 1.721/2024 (PLD/FTP), arts. 1º a 16, inclusive art. 3º (cadastro), art. 7º (não ocorrência ao CFC até 31/01) e art. 10 (guarda por 5 anos) (aberta): https://www.normasbrasil.com.br/norma/resolucao-1721-2024_458581.html ; cópia no Coaf: https://www.gov.br/coaf/pt-br/assuntos/informacoes-as-pessoas-obrigadas/orgaos-reguladores-e-fiscalizadores/resolucao-cfc-no-1-721-de-18-de-abril-de-2024-1.pdf/@@display-file/file |
| C4 | ITG 1000, itens 12 a 15 e Anexo 1 (modelo de carta de responsabilidade), via resultado de busca: https://cfc.org.br/wp-content/uploads/2023/01/ITG-1000.pdf ; https://www.ozai.com.br/carta-de-responsabilidade-da-administracao/ |
| C5 | Lei 11.101/2005, art. 104 (redação da Lei 14.112/2020, vigência 23/01/2021), via resultado de busca: https://www.legjur.com/legislacao/art/lei_00111012005-104 ; https://modeloinicial.com.br/lei/L-11101-2005/array-0x55e12e356c90/art-104 (o site do Planalto não abriu deste ambiente) |
| C6 | Lei 11.101/2005, art. 51, II, comentado em artigo acadêmico (fonte secundária): https://vlex.com.br/vid/contabeis-profissionais-casos-concretos-432047646 |
| C7 | Sebrae Rio / Prefeitura de Cabo Frio, e-book "Baixa do MEI falecido", atualizado em 16/05/2022, transcreve a Res. CGSIM 52 que alterou o art. 36 da Res. CGSIM 48/2018 (aberta): https://fazenda.cabofrio.rj.gov.br/wp-content/uploads/2023/06/Ebook-Baixa-do-MEI-falecido.pdf |
| C8 | CRC-SP, prazo do IRPF 2026 (23/03 a 29/05/2026; IN RFB 2.312/2026), via resultado de busca: https://online.crcsp.org.br/portal/noticias/noticia.asp?c=11015 ; https://www.contabeis.com.br/noticias/75606/irpf-2026-prazo-de-entrega-sera-de-23-de-marco-a-29-de-maio/ |
| C9 | Fenacon, prorrogação da declaração final de espólio e de saída definitiva (IN RFB 2.263/2025), via resultado de busca: https://fenacon.org.br/noticias/receita-federal-prorroga-prazo-para-entrega-da-declaracao-final-de-espolio-e-da-declaracao-de-saida-definitiva-do-pais/ |
| C10 | CTN, art. 195, parágrafo único (guarda até a prescrição), via resultado de busca: https://www.admdireito.com.br/legislacao/art/lei_00051721966-195 ; guarda após encerramento (TJ-RS): https://www.conjur.com.br/wp-content/uploads/2023/09/22a-camara-civel-tj-rs-aceita-apelacao.pdf ; ADI RFB 4/2019 (guarda eletrônica): https://online.crcsp.org.br/portal/noticias/noticia.asp?c=2940 |
| C11 | Lei 14.063/2020 (escopo, art. 2º) e MP 2.200-2/2001, art. 10, §2º, segundo fontes secundárias: https://www.dizerodireito.com.br/2020/09/lei-140632020-dispoe-sobre-as.html ; https://www.migalhas.com.br/depeso/465369/entre-validade-e-seguranca-assinaturas-nos-contratos-empresariais |
| C12 | ANPD, Guia Orientativo para Definições dos Agentes de Tratamento e do Encarregado, via notícias: https://netcpa.com.br/noticias/lgpd-anpd-publica-guia-orientativo-sobre-agentes-de-tratamento-e-encarregado/9609 ; https://irib.org.br/noticias/detalhes/guia-orientativo-e-publicado-pela-anpd |
| C13 | Procuração eletrônica no e-CAC e autorização do Meu Imposto de Renda: https://www.portalcontnews.com.br/procuracao-digital-para-acesso-ao-e-cac-ja-pode-ser-outorgada-diretamente-pelo-e-cac/ ; https://www.sindcontsp.org.br/wp-content/uploads/2023/03/PIR2023-apresentacao-sindcont-15032023-1.pdf ; https://www.e-auditoria.com.br/blog/e-cac-o-que-e/ |
| C14 | LCDPR (IN RFB 1.848/2018; receita bruta acima de R$ 4,8 milhões), fontes secundárias: https://www.senior.com.br/blog/livro-caixa-digital-produtor-rural ; https://cnabrasil.org.br/publicacoes/livro-caixa-digital-do-produtor-rural-lcdpr-fique-atento-as-informacoes-enviadas-e-evite-problemas-com-a-receita-federal |

Fontes dos arquivos D citadas por código do arquivo de origem: D1 F32 (Gestta), F47 (CADESP), F56 (Jettax, onboarding), F65 (LGPD, Confidata); D7 R24 (NBC PG 01).

*Atualização: ao incluir ficha nova num setor, classificar a etapa e, se ela mudar uma emenda entre setores, revisar a jornada correspondente aqui.*

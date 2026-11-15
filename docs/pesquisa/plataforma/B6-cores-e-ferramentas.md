# B6 · Sistemas core e migração das ferramentas que a plataforma substitui

- **Data:** 06/11/2026. Todas as páginas citadas foram abertas nesta data, salvo indicação. Cópias em `scratchpad/web-CORE/`.
- **Pergunta:** (1) além de Domínio, Alterdata e Contmatic (já em V3 · I-01 a I-03), como se integra com **Questor, SCI, Fortes e Prosoft** (e outros cores relevantes)? (2) Como tirar os dados de **Acessórias, Gestta/Domínio Processos, Onvio, SIEG, Qive, HubStrom, Conta Azul, Omie, Conexa e Nibo**, e em que ordem desligar cada um com operação em paralelo?
- **Inventário conferido** (`viz/indice.txt`, 466 linhas). Já existem e **não foram duplicados:** FIN-014 (implantação do financeiro, visão geral), GES-048 (trazer atividades do core), NFE-033 e CTB-017 (envio ao core para Domínio, Alterdata e Contmatic), SOC-023 e SOC-024 (acervo na entrada e na saída de cliente), GES-037 (troca de número de WhatsApp). As fichas novas tratam da **migração de cada ferramenta** (GES-601 a GES-609, FIN-601 a FIN-604) e da extensão do envio ao core para os cores que faltavam (GES-609).
- **Marcas:** [O] = fonte oficial do fornecedor lida agora; [S] = trecho de busca ou fonte secundária, não lida por inteiro; `[NÃO ENCONTRADO]` = buscado e não achado; **(análise)** = conclusão do agente, não afirmação de fonte.
- **Convenção de `horas_100` nas fichas de migração:** a migração acontece uma vez. Para não inflar a soma de horas recorrentes, o valor é o **total estimado da migração para 100 clientes, dividido por 12** (horas por mês amortizadas em um ano). O total aparece na descrição de cada plano.

---

## 1. Resposta curta

1. **Questor é o único dos quatro com API pública documentada para receber dados.** O **Questor SYN** recebe por `POST` um cabeçalho e um arquivo de dados em JSON string, em homologação (`synhomologacao.questor.com.br`) e produção (`syn.questor.com.br`), com limite de 2 requisições por segundo. O escritório puxa os dados no Gestão Contábil (lançamentos, plano de contas, entradas, saídas, pagamentos, recebimentos, inventário, Bloco K) [O]. Saída de tarefas (Tareffa): `[NÃO ENCONTRADO]`.
2. **A SCI tem programa de parceiro integrador e Portal do Desenvolvedor** (`portal-api-sci-web.sci.com.br`). O cadastro pede "Certificado APIs SCI WEB", "Token de Parceiro" e usuário do ÚNICO e pergunta se o parceiro integra NF-e, CT-e, NFS-e, lançamentos contábeis, "layout total SCI", pagamentos e recebimentos ou Web Service [O]. O portal carrega por JavaScript e o conteúdo dos endpoints **não foi lido** nesta rodada.
3. **Fortes (Total Contador) não publica API.** Integrações conhecidas: Omie (credenciais APP_KEY/APP_SECRET da Omie digitadas dentro do Fortes, envio de SPED/lançamentos e contas a pagar) [O-Omie] e Kloud/Klaus (API anunciada em 2023) [S]. O caminho é pedir parceria. Contato comercial: 0800 724 1110 [O].
4. **Prosoft pertence ao grupo Alterdata desde 2021** (combinação de ativos com a Wolters Kluwer, concluída em 01/06/2021) [S, release WK]. A documentação de ajuda fica em `ajuda.alterdata.com.br`. Integração por arquivo (`.IMP` do Company, TXT de contas a receber, planilha "Padrão Prosoft" de plano de contas, XLS do eEscriture no portal eContador) [O]. Faz sentido negociar junto com o ePlugin da Alterdata (V3 · I-02).
5. **Das ferramentas a substituir, só Conta Azul, Conexa, Nibo (Empresa e Obrigações), SIEG e Omie publicam API de leitura completa.** A Acessórias tem API por token (a mesma que alimenta o MCP), sem documentação pública. Para o Gestta, a TR declara que "a integração é exclusiva da parceria" e que os relatórios exportam para Excel [O-TR]. Para a HubStrom não se achou API nem exportação documentada.
6. **Ordem recomendada de desligamento** (detalhes na seção 4): primeiro as ferramentas de comunicação e tarefas que a plataforma já cobre (HubStrom, Acessórias/Nibo Obrigações, Gestta), em seguida o portal (Onvio Portal do Cliente) e a captura alternativa (Qive). O financeiro (Conexa, Omie, Nibo, Conta Azul) só sai depois de **um ciclo completo de cobrança** pela API do banco. O **SIEG sai por último**, como sugeriu o contador: só quando a captura própria tiver rodado estável por 2 fechamentos seguidos, com contagem de XMLs igual à do cofre SIEG (`/ContarXmls`).
7. **Trocar o boleto e o Pix do Conta Azul (ou de outro ERP) exige uma API de cobrança bancária** (Asaas ou Efí, V3 · I-14). Títulos já emitidos não migram: eles terminam no sistema antigo, e só as cobranças novas nascem no provedor novo. Autorizações de Pix Automático e de débito ficam presas ao recebedor original e precisam de **nova autorização do cliente** (análise; ficha FIN-604).

---

## 2. Sistemas core além de Domínio, Alterdata e Contmatic

Domínio (I-01), Alterdata (I-02) e Contmatic (I-03) estão em `V3-mercado-core.md`. Abaixo vêm os demais.

### 2.1 Questor (Questor Gestão Contábil, Questor Web/Cloud, Tareffa)

| Campo | Conteúdo |
| --- | --- |
| Módulos | Gestão Contábil com módulos Contabilidade, Fiscal e Inventário (rotinas `Arquivos \ Questor \ Syn \ Importar Dados Contábeis / Fiscais / de Inventário`) [O1]; conciliação bancária com **Open Finance** nativo [O3]; ERP Questor Gestão Empresarial e Questor Pequenas Empresas, que integram por Web Service com o Questor Tributário [S1]; Tareffa (tarefas) citado nas fichas da rodada 1 (D5:C1), não conferido agora |
| API pública | **Sim, de entrada: Questor SYN.** "O ERP deve realizar o envio (POST) contendo obrigatoriamente um CABEÇALHO e um arquivo de DADOS"; o arquivo vai na tag `dado` "no formato JSON String" [O2]. URLs: homologação `https://synhomologacao.questor.com.br`, produção `https://syn.questor.com.br` [O4]. "Limite é de até 2 requisições por segundo"; leiaute versão 2.00 com Cabeçalho, Arquivo de Dados (Layout TXT), Controle de Tributos e XML [O5]. Os dados ficam na API e o escritório os puxa no Gestão Contábil, escolhendo empresa, filial, período e grupo (lançamentos contábeis, plano de contas do ERP, entradas, saídas, pagamentos, recebimentos, lançamentos de inventário, Bloco K). A tela mostra total de registros, sucessos e erros com o motivo; os lançamentos entram com origem "QS" [O1] |
| Tarefas, empresas, folha | Leitura de tarefas (Tareffa), cadastro de empresas e folha por API: `[NÃO ENCONTRADO]` (buscado: "Questor Tareffa API integração tarefas documentação") |
| Leiautes de importação por arquivo | "Banco de Dados Importação – Contabilidade" no Questor Web, com arquivo de leiaute (`Questor_Layout_Modelo_Cloud`) + arquivo de lançamentos (`LctoCtb_AAAAMM`), Leiaute Cloud e Modelo C [O-Omie1] |
| Como contatar | Documentação pública em docs.questor.com.br; contato comercial não lido nesta rodada |
| Veredito | **B confirmado para entrada** (notas, pagamentos, recebimentos, lançamentos) pelo SYN, no mesmo papel da API de entrada do Domínio. Tarefas e folha: negociar. Ficha GES-609 |

### 2.2 SCI Sistemas Contábeis (ÚNICO, Novo Visual, Linha Visual, SCI WEB, SCIZERO)

| Campo | Conteúdo |
| --- | --- |
| Módulos | Folha de Pagamento/eSocial, Escrita Fiscal, Contabilidade, Financeiro, Gestão de Serviços, nas linhas **ÚNICO** ("solução premium para grandes empresas contábeis"), **Novo Visual**, **Linha Visual**, **SCI WEB** (tarefas repetitivas, apontamento de inconsistências) e **SCIZERO** (para quem está começando) [O6] |
| API pública ou de parceiros | **Programa de parceiro integrador** na página "quero integrar meu sistema com a SCI". O formulário pergunta se o parceiro integra cadastro de fornecedores e clientes, NF de entrada e saída, NFS-e de entrada e saída, NF-e, CT-e, SPED Fiscal, CAT-52, Sintegra, "layout total SCI", "layout de SCI pagamentos/recebimentos (parcelamentos)", lançamentos contábeis e Web Service. A seção "Dados para Integrações" pede "Certificado BI Parceiros", "Usuário ÚNICO", "Certificado APIs SCI WEB" e "Token de Parceiro", e aponta o **Portal do Desenvolvedor SCI** [O7]. O portal (`https://portal-api-sci-web.sci.com.br/`) responde, mas monta a documentação por JavaScript e o conteúdo **não foi lido** [O8] |
| Tarefas, empresas, folha | `[NÃO ENCONTRADO]` nesta rodada (depende da leitura do portal) |
| Leiautes | "Layout total SCI" e "layout SCI pagamentos/recebimentos" citados no formulário [O7]; especificação não lida. A SIEG lista a SCI entre os sistemas contábeis que recebem XML automaticamente [O9] |
| Como contatar | Rua Hermann Hering, 799, Blumenau/SC; (47) 3231-0707; comercial 3003-0707 [O10]. Cadastro de parceiro no formulário [O7] |
| Veredito | **B provável**: cadastrar a plataforma como parceira integradora e ler o portal. Ficha GES-609 |

### 2.3 Fortes Tecnologia (Total Contador)

| Campo | Conteúdo |
| --- | --- |
| Módulos | Total Contador = Fortes Contábil, Fortes Fiscal, Fortes Pessoal, **Fortes Gestão** ("agenda de obrigações e a alocação de colaboradores"), **Fortes Conecta** (troca de informações e arquivos com os clientes), Fortes Patrimônio, **Fortes Doc** (documentos), Fortes Financeiro, Fortes Ponto, Fortes Colabore, Fortespay; nuvem ou servidor local; planos FULL, PLUS e SMART sem preço público [O11] |
| API pública ou de parceiros | **Não publicada** `[NÃO ENCONTRADO]` (buscado: "Fortes Tecnologia API integração", "Total Contador API parceiros"). Integrações existentes: (a) **Omie**: no Fortes Fiscal ou Contábil, em `Utilitários > Configuração > Integração Omie`, marca-se "Integrado com Omie" e informa-se APP_KEY e APP_SECRET da Omie; há envio do contas a pagar do Fortes Fiscal para a Omie (artigo de 19/06/2026) [O-Omie2]. A busca indica envio de SPED ICMS, Bloco H e K e só lançamentos de partidas simples [S2]. (b) **Kloud (Klaus)**: em 10/2023 foi anunciada uma "API de integração entre o sistema Kloud (Klaus) e Total Contador (Fortes)" para levar os XMLs ao fiscal sem importação por pasta [S3]. (c) Folha Fortes → OneFlow Contábil [S2] |
| Tarefas, empresas, folha | `[NÃO ENCONTRADO]` |
| Leiautes | Plano de contas exportável para a Omie [S2]; leiaute de importação de lançamentos não publicado `[NÃO ENCONTRADO]` |
| Como contatar | Central de vendas 0800 724 1110; WhatsApp no mesmo número; "Fale Conosco" no site [O12] |
| Veredito | **Negociar (B a negociar)**: pedir o mesmo canal dado à Omie e ao Kloud. Enquanto isso, F (arquivo SPED/TXT). Ficha GES-609 |

### 2.4 Prosoft (grupo Alterdata)

| Campo | Conteúdo |
| --- | --- |
| Situação societária | Em 22/02/2021 a Wolters Kluwer acertou combinar ativos da Prosoft no Brasil com a Alterdata em troca de participação minoritária; a operação foi concluída em 01/06/2021 [S4]. A ajuda da Prosoft fica hoje em `ajuda.alterdata.com.br` [O13] |
| Módulos | Prosoft Contabilidade (SPED ECF em lote, Ativo Fixo, Módulo Social com lançamentos de folha, sócios e provisões em lote), integração com o **Integra Contador** do Serpro (DAS), eEscriture no portal **eContador**, Analisador Fiscal, Prosoft ERP/Company [O13] |
| API pública ou de parceiros | Própria da Prosoft: `[NÃO ENCONTRADO]`. Como os clientes Prosoft usam o portal eContador, o **ePlugin da Alterdata** (V3 · I-02) é o candidato natural; pedir confirmação à Alterdata (**api_econtador@alterdata.com.br**, contato técnico do ePlugin) (análise) |
| Leiautes | Importação Excel de plano de contas com modelo "Padrão Prosoft" (exige o Classificador Contábil); eEscriture lê extrato em PDF e exporta XLS que a Prosoft Contabilidade importa [O13]; o Company gera arquivos `.IMP` de lançamentos e terceiros [S5]; importação de contas a receber por TXT em "layout padrão definido pela Wolters" [S5] |
| Como contatar | Pelos canais da Alterdata (V3 · I-02) |
| Veredito | **F hoje, B a negociar no pacote Alterdata.** Ficha GES-609 |

### 2.5 Outros cores encontrados

| Sistema | Evidência | Fonte |
| --- | --- | --- |
| Mastermaq, Tron | Junto com SCI, Omie e Fortes, formaram a joint venture que lançou o OneFlow (notícia de 12/09/2019) | [S6] |
| Contabit, Consisa | Integração com a Acessórias: cadastro de empresas e documentos gerados (Consisa); robô e-Contínuo lê guias do Contabit | [O14] |
| Sittax, S.S. Parisi, Mister Contador, Impostograma, E-Auditoria | Marcados como "Sistema Contábil" na página de integrações da SIEG | [O9] |
| Nasajon, Makrosystem | Não pesquisados nesta rodada (cota de buscas) | — |

**Leitura (análise):** a plataforma precisa de um **conector de core com um contrato único** (empresas, XML fiscais, pagamentos e recebimentos, lançamentos, rubricas, tarefas) e adaptadores: Domínio (API de entrada TR), Alterdata/Prosoft (ePlugin), Questor (SYN), SCI (portal de parceiros), e arquivo (F) para Contmatic e Fortes até haver acordo.

---

## 3. O que exportar de cada ferramenta e como

| Ferramenta | O que exportar | Como | Fonte |
| --- | --- | --- | --- |
| **Acessórias** | Empresas, contatos, setores, entregas (com **protocolo digital**: data, hora, IP e assinatura do cliente), processos, solicitações, documentos (GED / Acessórias Docs), prazos | **API do escritório por token**, a mesma usada pelo MCP ("Quem já utiliza integrações continua com o mesmo token e a mesma estrutura"; a IA "consulta empresas, contatos, setores, entregas, processos e solicitações"). Documentação de endpoints não é pública `[NÃO ENCONTRADO]`: pedir à Acessórias pela área do cliente ou pelo telefone (31) 3526-2555 | [O15][O16][O14] |
| **Gestta / Domínio Processos** | Tarefas abertas e concluídas, tempo apontado, documentos anexados às tarefas (arquivados pelo Gestta), modelos de processo, solicitações recorrentes de documentos | Gestta é produto da Thomson Reuters. "Os relatórios do Gestta podem ser exportados para Excel"; "O Gestta tem documentação pública para integrações? — A integração é exclusiva da parceria" (perguntas 45 e 58). Domínio Processos: API de saída `[NÃO ENCONTRADO]` (V3 · I-01). Documentos: baixar pela tarefa (sem exportação em massa documentada) | [O17] |
| **Onvio (Portal do Cliente)** | Documentos publicados (guias, holerites, relatórios), confirmação de visualização de guias, usuários dos clientes | Sem API de leitura documentada. Parceiro conhecido (Omie.G-Click) lê os arquivos publicados com **usuário e senha de um usuário Onvio com acesso total, com MFA** (V3 · I-01). O Domínio (core) continua; o que sai é o portal e o app do cliente | V3 · I-01 |
| **SIEG** | XMLs (NF-e, NFC-e, CT-e, CF-e, NFS-e) e eventos do cofre; relatório de XMLs; lista de certificados cadastrados; tags | **API oficial (Swagger em `api.sieg.com`)**: `POST /BaixarXmls` (lote com `XmlType`, `Take`, `Skip`, datas de emissão e de upload, CNPJ emitente, destinatário, remetente e tomador, `Downloadevent`), `POST /BaixarXml` (uma chave), `POST /ContarXmls` (contagem por tipo), `POST /BaixarEventos`, `POST /api/relatorio/xml` (Excel por CNPJ/mês), `GET /api/Certificado/ListarCertificados`. A API se descreve como "Integre o seu sistema com o Cofre SIEG e realize o download em lote dos XMLs armazenados" | [O18] |
| **Qive** | XMLs recebidos e emitidos (NF-e, CT-e, NFS-e) | API da Qive/Arquivei: `GET /v1/nfe/received` em `api.arquivei.com.br`, com filtros por chave e CNPJ e sandbox [S7]. O portal `developers.qive.com.br` existe, mas carrega por JavaScript e não foi lido [O19]. Os certificados ficam cadastrados pelo próprio cliente (B5) | [S7][O19] |
| **HubStrom** | Conversas (ConnectHub), tarefas (TaskHub), arquivos (DriveHub), XMLs (XMLHub), app white label (AppHub) | API ou exportação: `[NÃO ENCONTRADO]` (buscado: "HubStrom API XMLHub TaskHub exportar dados"). Caminho: pedir exportação ao fornecedor; XMLs são recapturados pela plataforma (fonte oficial, não precisam do HubStrom) | V3 · I-17 |
| **Conta Azul** | Clientes, contratos recorrentes, contas a receber e parcelas, baixas, categorias, centros de custo, contas financeiras e saldos, NF emitidas | **API v2 (OAuth 2.0, REST/JSON, paginação `page`/`size`)**: `GET /v1/financeiro/eventos-financeiros/contas-a-receber/buscar`, `GET /v1/financeiro/eventos-financeiros/{id_evento}/parcelas`, `GET /v1/financeiro/eventos-financeiros/alteracoes`, `GET /v1/financeiro/eventos-financeiros/saldo-inicial`, `GET /v1/conta-financeira/{id}/saldo-atual`, `GET /v1/categorias`, `GET /v1/centro-de-custo`, além das áreas Contratos e Pessoas. **Sem webhooks** (exige polling) e sem sandbox (conta de desenvolvedor de 30 dias). Suporte só pelo Portal do Desenvolvedor | [O20][O21][O22] |
| **Omie** | Clientes, contas a receber, boletos, recebimentos | API pública (portal do desenvolvedor). `ObterBoleto` em `/api/v1/financas/contareceberboleto/` a partir do `codigo_lancamento_omie` vindo de `ListarContasReceber` [S8]. **Desde o comunicado de 14/09/2026, o acesso por API custa R$ 49,90 por aplicativo por mês**, exceto apps comprados na Omie.Store; "sistemas próprios, sistemas de terceiros não homologados ou que fazem qualquer integração direta" precisam do Plano de APIs | [O23][S8] |
| **Conexa** | Clientes (customer/person), planos, **contratos** (inclusive pedido de assinatura), vendas recorrentes, **cobranças** (com Pix e baixa), contas a pagar (bill), formas de recebimento | **API v2** em `https://SUBDOMINIO.conexa.app/index.php/api/v2`: `GET /customers`, `GET /contracts`, `GET /recurringSales`, `GET /charges`, `GET /charge/:id/pix`, `PATCH /charge/:id/settle`, `GET /bills`, `GET /receivingMethods`. Limite de **60 requisições por minuto** (HTTP 429) | [O24] |
| **Nibo** (Gestão Financeira) | Clientes, agendamentos de recebimento (contas a receber), recebimentos, cobranças, NFS-e, arquivos anexos, conciliação | **API Empresa** (`https://api.nibo.com.br/empresas/v1`) para clientes do **plano Premium**; token em `Empresa > Mais opções > Configurações > API`, no cabeçalho `ApiToken`; OData (`$filter`, `$orderBy`, `$skip`, `$top`), **até 500 registros por consulta** | [O25][O26] |
| **Nibo Obrigações** (concorrente de Acessórias/Gestta) | Clientes, responsáveis, **protocolos (histórico, documentos, e-mails, baixar documento)**, tarefas, processos, obrigações vinculadas, documentos recebidos, comunicados | **API pública "disponível somente para usuários beta"**, autenticação por API-Key, REST/JSON, OData, até 100 por página | [O27][O25] |

---

## 4. Plano de migração e ordem de desligamento

### 4.1 Princípios (análise)

1. **Nada é desligado sem um período de operação em paralelo com critério de saída medido.** A plataforma faz o trabalho, o sistema antigo segue ativo, e um relatório de paridade compara os dois.
2. **Histórico é copiado, não reconstruído.** Protocolos de entrega, contratos e títulos pagos são provas e precisam chegar à plataforma com data, hora e autor originais, além do arquivo de origem (exportação bruta guardada).
3. **A ordem segue o risco.** Primeiro sai o que a plataforma já faz melhor e cuja falha é barata (mensagens, tarefas). O financeiro (falha = receita perdida) sai depois de um ciclo inteiro de cobrança. A captura de XML (falha = escrituração incompleta e multa) sai por último.
4. **Contrato com o fornecedor antigo:** ver aviso prévio e fidelidade antes de marcar a data. Os termos de uso de cada ferramenta não foram lidos `[NÃO VERIFICADO]`.

### 4.2 Ordem recomendada

| Onda | Ferramenta | Pré-requisito na plataforma (fichas) | Paralelo mínimo | Critério para desligar | Ficha |
| --- | --- | --- | --- | --- | --- |
| 1 | **HubStrom** (atendimento, app) | Multiatendimento (GES-023), app (GES-204, GES-104), troca de número (GES-037) | 2 semanas | 100% das conversas pelo número oficial na plataforma; clientes ativos no app novo | GES-606 |
| 1 | **Acessórias** ou **Nibo Obrigações** | Calendário (FIS-001), processos (GES-206), portal (GES-039, GES-041) | 1 fechamento mensal | Todas as entregas do mês com protocolo na plataforma; histórico de protocolos importado e conferido por amostragem | GES-601, GES-607 |
| 2 | **Gestta / Domínio Processos** | Processos (GES-206) e leitura de atividades do core (GES-048) | 1 fechamento | Tarefas do mês geradas e concluídas na plataforma; relatórios Excel arquivados | GES-602 |
| 2 | **Onvio Portal do Cliente** | Portal e app (GES-039, GES-204) | 1 fechamento | Guias e holerites do mês entregues pela plataforma com confirmação de leitura; o Domínio (core) continua | GES-603 |
| 2 | **Qive** (quando usado pelo escritório) | Captura própria (NFE-004, NFE-005, NFE-007) | 1 fechamento | Contagem de XMLs da plataforma ≥ Qive por CNPJ | GES-605 |
| 3 | **Conexa / Omie / Nibo** (financeiro do escritório) | Contratos (FIN-001), faturamento (GES-001), baixa (GES-003), API de cobrança (FIN-604) | 1 ciclo de cobrança completo | Todos os títulos novos emitidos pela plataforma; carteira antiga liquidada ou cancelada; saldos batem (FIN-014) | FIN-602, FIN-603 |
| 3 | **Conta Azul** (boleto e Pix) | Idem + **API de cobrança de banco** (Asaas/Efí, V3 · I-14) | 1 a 2 ciclos | Último título do Conta Azul liquidado ou baixado; autorizações de Pix Automático refeitas | FIN-601, FIN-604 |
| 4 | **SIEG** (por último) | Captura própria estável (NFE-003, NFE-004, NFE-005, NFE-006, NFE-007, NFE-009), guarda (NFE-036), envio ao core (NFE-033/GES-609) | **2 fechamentos seguidos** | Para cada CNPJ e tipo, a contagem da plataforma é ≥ `/ContarXmls` do SIEG nos dois meses; NSU avançando todos os dias; core recebendo da plataforma; cópia completa do cofre baixada por `/BaixarXmls` | GES-604 |

O plano mestre, que mantém esta tabela por escritório e guarda as evidências de cada critério, é a ficha **GES-608**.

### 4.3 Planos por ferramenta

**Acessórias (GES-601).** Total estimado: cerca de 40 h para 100 clientes. (1) Pedir à Acessórias a documentação da API e gerar o token. (2) Importar empresas, contatos e setores e casar pelo CNPJ com o cadastro (SOC-001). (3) Importar entregas e protocolos com data, hora, IP e assinatura como **histórico somente leitura**, guardando o JSON bruto. (4) Converter processos e prazos em modelos de processo (GES-206) e calendário (FIS-001). (5) Baixar o GED. (6) Rodar um fechamento em paralelo. (7) Avisar os clientes da troca de app e da Área VIP. (8) Encerrar.

**Gestta / Domínio Processos (GES-602).** Total: cerca de 30 h. Exportar para Excel os relatórios de atividades criadas e concluídas e o tempo apontado; baixar os anexos das tarefas em aberto; recriar modelos e responsabilidades na plataforma. A conclusão automática por rotina do Domínio deixa de existir quando o Gestta sai. Por isso é preciso ter a leitura de atividades do core (GES-048, B a negociar com a TR) ou aceitar a conclusão por evidência na plataforma (guia ou recibo recebido).

**Onvio Portal do Cliente (GES-603).** Total: cerca de 25 h (o grosso é reativar os clientes no app novo). Baixar o acervo publicado, por exportação manual ou por usuário dedicado com MFA, como faz a Omie.G-Click. Importar com cliente, competência e tipo. Convidar os usuários dos clientes para o app novo (GES-104). Manter o Onvio ativo enquanto o Domínio for o core, desligando só a publicação no portal.

**SIEG (GES-604), por último.** Total: cerca de 35 h, incluindo 2 meses de monitoramento. (1) Listar os certificados no SIEG (`ListarCertificados`) e conferir se estão no cofre da plataforma (SOC-008). (2) Ligar a captura própria em paralelo. (3) Todo dia, comparar `ContarXmls` por CNPJ e tipo com a contagem própria. (4) Investigar cada divergência: UF sem caminho, NFS-e municipal, certificado vencido. (5) Antes de cancelar, baixar todo o cofre por `BaixarXmls` paginado (`Take`/`Skip`) e os eventos (`BaixarEventos`) para a guarda (NFE-036). (6) Mudar o envio ao core do SIEG para a plataforma. (7) Desligar.

**Qive (GES-605).** Total: cerca de 10 h. Baixar os XMLs pela API (`/v1/nfe/received` e emitidos). Avisar os clientes que cadastraram o próprio certificado na Qive para cadastrá-lo no cofre da plataforma ou autorizar a procuração.

**HubStrom (GES-606).** Total: cerca de 30 h, com exportação manual. Pedir ao fornecedor a exportação de conversas, tarefas e arquivos. Recapturar os XMLs pelas fontes oficiais. Migrar o número de WhatsApp para a conta da plataforma (GES-037). Trocar o app white label.

**Nibo Obrigações (GES-607).** Total: cerca de 25 h. Pedir acesso ao beta da API pública; importar clientes, responsáveis, obrigações vinculadas, tarefas e **protocolos com histórico e documentos** (`Listar histórico do protocolo`, `Baixar documento do protocolo`).

**Conta Azul (FIN-601).** Total: cerca de 20 h. Ler pela API v2 clientes, contratos, contas a receber, parcelas e saldos; importar os títulos em aberto como "a receber no sistema antigo". Não reemitir esses títulos: eles são liquidados no Conta Azul e a baixa é trazida por polling (`/alteracoes`). Só as cobranças novas nascem no provedor novo (FIN-604).

**Omie e Nibo (FIN-602).** Total: cerca de 20 h. Omie: contratar o Plano de APIs (R$ 49,90/mês por aplicativo) só durante a migração, ou exportar planilha; baixar os PDFs dos boletos abertos (`ObterBoleto`). Nibo: token Premium e paginação de até 500 registros por consulta.

**Conexa (FIN-603).** Total: cerca de 15 h. Ler customers, contracts, recurringSales e charges respeitando 60 requisições por minuto. Encerrar as vendas recorrentes no Conexa (`PATCH /recurringSale/:id/end`) **na mesma data** em que a recorrência começa na plataforma, para não cobrar em dobro.

**Troca do provedor de recebimento (FIN-604).** Total: cerca de 40 h. Abrir a conta de cobrança (Asaas, Efí ou banco com API) e emitir a primeira competência pela plataforma. Pedir nova autorização de Pix Automático ou débito a cada cliente. Comunicar a mudança de beneficiário do boleto, porque o cliente vê outro nome e pode desconfiar de golpe. Manter as duas contas abertas até o último título antigo liquidar.

---

## 5. Fontes

- [O1] Questor Docs, "Integração com o Gestão Contábil" (Syn): https://docs.questor.com.br/Produtos/Integracoes/SYN/documentacao-contador/integracao-gestao-contabil (06/11/2026)
- [O2] Questor Docs, "Introdução Documentação – SYN": https://docs.questor.com.br/pt-br/Produtos/Integracoes/SYN/Documentação/int-doc-syn (06/11/2026)
- [O3] Questor Docs, Open Finance na conciliação: https://docs.questor.com.br/pt-br/Produtos/GestãoContábilCloud/Contabilidade/ConciliaçãoBancária/open-finance (via V3 · I-04, rodada 1)
- [O4] Questor Docs, "Links para Comunicação": https://docs.questor.com.br/pt-br/Produtos/Integracoes/SYN/Documentação/url's (06/11/2026)
- [O5] Questor Docs, "Dados Versão 2": https://docs.questor.com.br/pt-br/Produtos/Integracoes/SYN/Documentação/DadosVersao2 (06/11/2026)
- [O6] SCI, página inicial: https://www.sci.com.br/ (06/11/2026)
- [O7] SCI, "Cadastro de parceiro integrador": https://www.sci.com.br/sistemas-de-gestao/ (06/11/2026)
- [O8] Portal do Desenvolvedor SCI: https://portal-api-sci-web.sci.com.br/ (06/11/2026; conteúdo dinâmico não lido)
- [O9] SIEG, Integrações: https://www.sieg.com/integracoes (06/11/2026)
- [O10] SCI, Contatos: https://www.sci.com.br/fale-com-a-sci-sistemas-contabeis/ (06/11/2026)
- [O11] Fortes, Sistema Total Contador: https://www.fortestecnologia.com.br/gestao-contabil/sistema-total-contador/ (06/11/2026)
- [O12] Fortes, página inicial: https://www.fortestecnologia.com.br/ (06/11/2026)
- [O13] Alterdata/Prosoft, "Melhorias Prosoft Contabilidade": https://ajuda.alterdata.com.br/nps/melhorias-prosoft-contabilidade-248261731.html (06/11/2026)
- [O14] Acessórias, Integrações: https://acessorias.com/site/integracoes/ (06/11/2026)
- [O15] Acessórias, Acessórias MCP: https://acessorias.com/site/funcionalidade/acessorias-mcp/ (06/11/2026)
- [O16] Acessórias, Protocolo Digital: https://acessorias.com/site/funcionalidade/protocolo-digital/ (06/11/2026)
- [O17] Thomson Reuters, "Lançamento Gestta Processo integrado com o Contábil – Base – Perguntas e Respostas" (PDF, sem data): https://images.engage.es-pt.thomsonreuters.com/Web/LALEYSAEIMPRESORA/%7Bfa3be1a4-eadc-479b-a994-f9e425ce049d%7D_TAX_PROF_BR_PDF_PERGUNTAS_E_RESPOSTAS_Base.pdf (06/11/2026)
- [O18] SIEG, Swagger "Registro de Integrações": https://api.sieg.com/swagger/docs/ver (06/11/2026)
- [O19] Qive, Portal do desenvolvedor: https://developers.qive.com.br/ (06/11/2026; conteúdo dinâmico não lido)
- [O20] Conta Azul, Introdução às APIs: https://developers.contaazul.com/aboutapis (06/11/2026)
- [O21] Conta Azul, especificação Financeiro (OpenAPI): https://developers.contaazul.com/_bundle/docs/financial-apis-openapi.json (06/11/2026)
- [O22] Conta Azul, Suporte aos Desenvolvedores: https://developers.contaazul.com/playbook.md (06/11/2026)
- [O23] Omie, "Comunicado: Novas Regras de Uso de APIs" (14/09/2026): https://ajuda.omie.com.br/pt-BR/articles/15959035-comunicado-novas-regras-de-uso-de-apis (06/11/2026)
- [O24] Conexa, "API v2 Conexa" (Postman): https://documenter.getpostman.com/view/25182821/2s93RZMpcB (06/11/2026)
- [O25] Nibo, API Reference: https://nibo.readme.io/reference/como-utilizar-a-api-1 e índice https://nibo.readme.io/llms.txt (06/11/2026)
- [O26] Nibo, "Como utilizar a API" (Empresa, atualizada em 30/07/2026): https://nibo.readme.io/reference/como-utilizar-a-api.md (06/11/2026)
- [O27] Nibo Obrigações, "Introdução" da API pública (atualizada em 30/07/2026): https://nibo.readme.io/reference/como-utilizar-a-api-1.md (06/11/2026)
- [O-Omie1] Omie, "Importando os Lançamentos Contábeis no Sistema Questor: Leiaute Cloud e Modelo C – Cloud": https://ajuda.omie.com.br/pt-BR/articles/10715158 (06/11/2026)
- [O-Omie2] Omie, "Configurando a Integração Automática do Fortes Contábil e Fiscal com a Omie" (19/06/2026): https://ajuda.omie.com.br/pt-BR/articles/9015830 (06/11/2026)
- [S1] Questor Docs, integração Pequenas Empresas/Tributário (trecho de busca): https://docs.questor.com.br/pt-br/Produtos/ERP_-_Questor_P_E/integracaopetributario
- [S2] Trechos de busca dos artigos Omie 9015830, 9015943 e 3596078 (Fortes, plano de contas, OneFlow)
- [S3] Fenacon, "Fortes e a Klaus Tecnologia fazem uma API de Integração" (27/10/2023): https://fenacon.org.br/noticias/fortes-e-a-klaus-tecnologia-fazem-uma-api-de-integracao/ (lida em 06/11/2026; notícia, não documentação)
- [S4] Wolters Kluwer, "Wolters Kluwer completes Prosoft transaction with Alterdata" (01/06/2021): https://www.wolterskluwer.com/en/news/wolters-kluwer-completes-prosoft-transaction-with-alterdata (página bloqueada por verificação; conteúdo pelo trecho de busca e pela cópia em streetinsider.com)
- [S5] Ajuda Alterdata/Prosoft ERP E1090 e E669 (trechos de busca): https://ajuda.alterdata.com.br/prosofterp/e1090-procedimento-para-realizar-a-integracao-com-a-contabilidade-149127814.html
- [S6] Portal ContNews, "SCI e Omie: parceiras..." (12/09/2019): https://www.portalcontnews.com.br/?p=193545 (lida em 06/11/2026)
- [S7] Arquivei/Qive developers (trecho de busca): https://developers.arquivei.com.br/docs ; Celigo, "Available Qive APIs": https://docs.celigo.com/hc/en-us/articles/37435753044763-Available-Qive-APIs
- [S8] Omie, "Obtendo o boleto via API" (trecho de busca): https://ajuda.omie.com.br/pt-BR/articles/7969835-obtendo-o-boleto-via-api

---

## 6. Fichas novas (resumo; o objeto completo foi devolvido ao orquestrador)

| id | Atividade | Nível | Autonomia | Core | Fase |
| --- | --- | --- | --- | --- | --- |
| GES-601 | Migrar da Acessórias: empresas, entregas com protocolo, processos e documentos | B | Agente prepara, pessoa conclui | Lê do core | 2 |
| GES-602 | Migrar do Gestta/Domínio Processos: tarefas, tempo e anexos | F | Agente prepara, pessoa conclui | Lê do core | 2 |
| GES-603 | Migrar o Portal do Cliente do Onvio para o portal e app da plataforma | D-assistido | Agente prepara, pessoa conclui | Lê do core | 2 |
| GES-604 | Desligar o SIEG por último: paridade de captura e cópia do cofre | B | Agente prepara, pessoa conclui | Escreve no core | 2 |
| GES-605 | Migrar da Qive: XMLs e certificados cadastrados pelos clientes | B | Agente prepara, pessoa conclui | Não depende | 2 |
| GES-606 | Migrar da HubStrom: conversas, tarefas, arquivos, número e app | D-assistido | Agente prepara, pessoa conclui | Não depende | 2 |
| GES-607 | Migrar do Nibo Obrigações: protocolos, tarefas e obrigações | B | Agente prepara, pessoa conclui | Não depende | 2 |
| GES-608 | Conduzir o plano mestre de migração com operação em paralelo | Próprio | Agente organiza e lembra | Lê do core | 0 |
| GES-609 | Conectar Questor, SCI, Fortes e Prosoft (envio de XML/lançamentos e leitura) | B | Agente faz sozinho | Lê e escreve no core | 1 |
| FIN-601 | Migrar o financeiro do Conta Azul (contratos, títulos, parcelas, saldos) | B | Agente prepara, pessoa conclui | Não depende | 3 |
| FIN-602 | Migrar o financeiro da Omie e do Nibo (títulos, boletos, recebimentos) | B | Agente prepara, pessoa conclui | Não depende | 3 |
| FIN-603 | Migrar contratos, recorrências e cobranças do Conexa | B | Agente prepara, pessoa conclui | Não depende | 3 |
| FIN-604 | Trocar o provedor de recebimento (boleto, Pix, Pix Automático) sem perder títulos | B | Agente prepara, pessoa conclui | Não depende | 3 |

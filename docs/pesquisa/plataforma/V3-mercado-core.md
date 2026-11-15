# V3 · Verificação: Mercado e sistemas core

**Rodada 2 (6/11/2026)** · Etapa 2 do [Protocolo de Descoberta](00-protocolo-de-descoberta.md) · agente V3 · substitui a rodada 1 (5/11/2026), feita sem rede

**Domínio:** sistemas core (Domínio/Onvio da Thomson Reuters, Alterdata, Contmatic e, por aparecer em várias fichas, Questor), WhatsApp Business Platform e provedores, Chatwoot, Instagram, e-mail e calendário, bancos e Open Finance (Pluggy, Belvo, Celcoin, Klavi), arquivos bancários (OFX, CNAB, EDI de adquirentes), agregadores de consultas e certidões, assinatura eletrônica (Clicksign, D4Sign, ZapSign), cobrança (Asaas, Banco Inter, Efí, Pix Automático), fornecedores comerciais de DF-e (captura e emissão), ERPs dos clientes e concorrentes de gestão (Acessórias, Gestta/Domínio Processos, HubStrom, SIEG, Qive, Veri, e-Kontroll, Jettax, HubCount, e-Auditoria, Nibo, Omie/G.Click, Makrosystem, Questor/Tareffa, Conta Azul Mais, ROIT, Dootax, Digisac).

**Fichas tratadas:** as mesmas 112 fichas da rodada 1 (D1: 15, D2: 13, D3: 15, D4: 16, D5: 22, D6: 6, D7: 25), na seção 2. Quando uma ficha passa por mais de um V, este arquivo trata **só a parte de mercado ou core** dela; o consolidador junta.

---

## 0. Método da rodada 2 (ler antes de usar este arquivo)

### 0.1 O que mudou em relação à rodada 1

A rodada 1 não abriu nenhuma fonte (busca esgotada, hosts bloqueados). Nesta rodada a rede estava liberada: as páginas foram baixadas com `curl` em 06/11/2026 e lidas em texto; 15 buscas na web foram usadas para achar URLs que faltavam. Conteúdo baixado foi tratado como dado.

Fontes oficiais abertas nesta rodada (todas em 06/11/2026):

| Fonte | O que confirmou |
| --- | --- |
| Alterdata ePlugin, documentação da API (gerada em 16/09/2026): https://eplugin.pack.alterdata.com.br | Lista completa de endpoints, autenticação Bearer, como obter o token, pré-requisito "eContador Master", e-mail de suporte |
| Alterdata, Centro de Aprendizagem: https://ajuda.alterdata.com.br/esbdc/tema-eplugin/econtador-eplugin · https://ajuda.alterdata.com.br/esbdc/tema-econtador-sollo/econtador-sollo-tudo-que-voce-precisa-saber-sobre-o-econtador-store · https://ajuda.alterdata.com.br/packupbase/tema-econtador/econtador-tudo-que-o-seu-cliente-precisa-saber-sobre-o-econtador | Geração do token no eContador; compra de pacote pela eContador Store, sem preço público; menu do eContador do cliente |
| Domínio, Central de Soluções: solução 8536 (chave API para ERP homologado), 8434 (Conta Azul), 6326 (habilitar empresa no Portal do Cliente), 7456 (contratar Domínio Processos), 12041 e 12304 (Domínio Processos), lista do módulo 28 | Como a chave de API é gerada no Onvio Gestão; Domínio Processos é módulo pago com mensalidade, integra ao Portal do Cliente |
| Domínio, site comercial: https://www.dominiosistemas.com.br/solucoes/integracao-com-erp/ · https://www.dominiosistemas.com.br/solucoes/dominio-processos · https://www.dominiosistemas.com.br/solucoes/evolucao-em-nuvem/portal-do-cliente | Escopo da API de entrada (NF-e, NFC-e, NFS-e, CF-e, CT-e, pagamentos/recebimentos, rubricas da folha); formulário "Quero ser parceiro"; funcionalidades do Processos e do Portal |
| Contmatic: https://www.contmatic.com.br/ · https://www.contmatic.com.br/sistema-contabil-contabil-phoenix · https://www.contmatic.com.br/contato · blog de 02/04/2026 https://simplifique.contmatic.com.br/blogs/como-integrar-contmatic-com-outros-sistemas-e-erps | Nenhuma API pública; integrações nomeadas; módulo "Gestão do Escritório" |
| Meta, preços do WhatsApp (atualizado em 30/09/2026): https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing e planilhas de tarifas em BRL e USD vigentes em 01/10/2026 (links na página) | Tarifas do Brasil por categoria, faixas de volume, cobrança de mensagens de serviço desde 01/10/2026, faturamento em BRL |
| Meta, Groups API: https://developers.facebook.com/documentation/business-messaging/whatsapp/groups | Grupos pela API: só conta oficial (OBA), até 8 participantes |
| CADE: notícias de 12/01/2026 e 23/04/2026 (links em I-05) | Inquérito 08700.012397/2025-63, medida preventiva e multa diária contra a Meta |
| Preços: Asaas, Efí, Clicksign, D4Sign, ZapSign, Infosimples, Pluggy, Belvo, SIEG, Qive | Valores na seção 1 |
| Concorrentes: Acessórias (Área VIP/App, Docs, Protocolo Digital, MCP, blog de 29/10/2026), HubStrom, e-Kontroll | Funcionalidades na seção 1 (I-17) |
| Parceiros que integram ao Domínio: Omie (ajuda oficial), Jettax (blog oficial), Fiscal.io (blog oficial) | Como a chave do Onvio é usada por terceiros; prazo de 60 dias da fila "Importação API" |

Não abertos nesta rodada (motivo entre parênteses): termos da WhatsApp Business Solution (a página de `whatsapp.com/legal` só carrega com JavaScript; não foi contornada), site do Gestta (`gestta.com.br` respondeu 403), `api.onvio.com.br` (404 na raiz), portal de desenvolvedores da Thomson Reuters (página vazia sem JavaScript), doc da Celigo sobre o Domínio (403), tarifas do Banco Inter (URL antiga deu 404; a busca só trouxe fontes secundárias), páginas de preço de Belvo Brasil, Acessórias, HubStrom, Gestta, Jettax, HubCount, e-Auditoria (sem preço público ou não localizadas).

### 0.2 Marcas usadas

| Marca | Origem | Confiança máxima |
| --- | --- | --- |
| **[R2]** | Fonte oficial aberta nesta rodada, em 06/11/2026, com link no item | alta |
| **[R2-sec]** | Fonte secundária aberta nesta rodada (imprensa, parceiro do fornecedor, blog de terceiro) | média |
| `[Dx:Cn]`, `[Dx:Sn]`, `[Dx:Tn]`, `[D7:Rn]`, `[D1:Fn]` | Fonte de uma ficha de descoberta, lida só pelo trecho do buscador em 05/11/2026 e **não reaberta** | média ou baixa |
| `[NÃO VERIFICADO — conhecimento prévio]` | Conhecimento do agente (corte jun/2026), não conferido | baixa |
| `[NÃO ENCONTRADO]` | Procurado nesta rodada (ou na anterior) e não achado; o texto diz o que falta | — |
| `[PREÇO NÃO PÚBLICO]` | A página oficial foi aberta e diz "sob consulta", "fale com vendas" ou não traz valor | — |

Cada item da seção 1 e cada ficha da seção 2 traz o campo **status**: "conferido na rodada 2" (todas as afirmações decisivas foram reabertas), "conferido em parte na rodada 2" (o que foi reaberto está marcado [R2]) ou "mantido da rodada 1 (não conferido)".

### 0.3 Premissas do fundador aplicadas (decisões tomadas após a rodada 1)

1. **Certificado A1 do cliente:** a plataforma terá um app/portal do cliente que espelha os dados dele, recebe os documentos dele e entrega os do escritório. O A1 passa a ser **documento obrigatório enviado pelo próprio cliente no app**, guardado em cofre. Para NF-e, o autXML com o CNPJ do escritório é complemento. Já apurado por outro agente em 06/11/2026: a NT 2014.002 v1.40 (jul/2026) mantém a autenticação pelo certificado do próprio ator e as APIs do ADN da NFS-e exigem o certificado do contribuinte; a FENACON pediu acesso por procuração, ainda não implementado. Efeito neste arquivo: SOC-008, SOC-021 e NFE-001 passam a tratar o envio do A1 como etapa do onboarding no app.
2. **Sistemas core:** os dados de tarefas virão dos **módulos de processos dos cores, por API negociada** com cada fornecedor (parceria ou pagamento). Efeito: GES-048, FIS-001, FIS-003 e FIS-047 mudam de "E/agente de desktop" para "B por contrato" onde a API existe (Alterdata) e "B a negociar" onde não é pública (Domínio, Contmatic).
3. **Agente de desktop** sai do plano principal; fica como alternativa só para core sem API.

### 0.4 Consequência para a Etapa 3

Mudaram de nível nesta rodada: **Alterdata** passa de F para **B confirmado** (API ePlugin pública, com token, exige pacote eContador Master); **Domínio** passa de "API por indício" para **B confirmado na entrada** (documentos fiscais, pagamentos/recebimentos e rubricas, via parceria de ERP homologado) e **B a negociar na saída** (tarefas do Domínio Processos: nenhuma API pública); **Contmatic** fica em F/a negociar (nenhuma API pública). Os **preços do WhatsApp para o Brasil estão confirmados em BRL**, e houve mudança relevante: desde 01/10/2026 as respostas de serviço (fora das 1.000 grátis por número/mês) e os modelos de utilidade dentro da janela voltaram a ser cobrados (R$ 0,035 cada).

---

## 1. Mapa das integrações do domínio

Legenda de credencial: **contrato** = contrato comercial com o fornecedor; **token-esc** = chave de API emitida para o escritório; **consent-cli** = consentimento do cliente (Open Finance); **mTLS** = certificado de cliente emitido pelo banco para a API; **login-core** = usuário e senha de um analista no core; **A1-cli** = certificado do cliente; **e-CNPJ-esc** = certificado do escritório.

### I-01 · Domínio / Onvio (Thomson Reuters)

**Status:** conferido em parte na rodada 2 (entrada por API e módulos conferidos; API de saída de tarefas não encontrada).

| Campo | Conteúdo |
| --- | --- |
| O que oferece | (a) **API de entrada para "ERPs homologados"** [R2]: "Todo o processo de importação de documentos fiscais (XML e TXT) dos ERPs para o Domínio é totalmente online e automático. Por meio de APIs de integração"; escopo publicado: **NF-e, NFC-e, NFS-e, CF-e, CT-e, pagamento/recebimento de parcelas** e **API de Rubricas** ("lançamento de rubricas no módulo Folha, integrando os lançamentos de rubricas dos sistemas de RH ao Domínio") — https://www.dominiosistemas.com.br/solucoes/integracao-com-erp/ (06/11/2026). Parceiro que queira integrar se cadastra no formulário "Quero ser parceiro" da mesma página "para receber as especificações técnicas da API" (Central de Soluções, solução 8536: https://suporte.dominioatendimento.com/central/faces/solucao.html?codigo=8536, 06/11/2026) [R2]. Os documentos chegam ao Domínio na rotina **Utilitários > Importação > Importação Padrão > Importação API**, podem ser importados por rotina automática e ficam disponíveis **por até 60 dias**; tipos aceitos no caso da Jettax: NF-e, NFC-e, NFS-e nacional, CF-e, CT-e, CT-e OS (https://www.jettax.com.br/blog/como-habilitar-a-integracao-com-o-erp-dominio/, 06/11/2026) [R2-sec]. Parceiros que usam: Conta Azul (envia NF e recebe contas a pagar, solução 8434 [R2]), Omie (https://ajuda.omie.com.br/pt-BR/articles/12051153-configurando-a-integracao-com-a-dominio-via-api [R2-sec]), Fiscal.io, que se declara "parceira homologada da Thomson Reuters" (https://conteudo.fiscal.io/integracao-dominio-thomson-reuters/ [R2-sec]). (b) **Chave por empresa**: gerada pelo escritório em **Onvio Gestão > API > Nova habilitação**, escolhendo funcionalidades e empresas; exige a empresa vinculada ao Onvio e o "Agente de Comunicação" do Domínio verde e iniciado no usuário GERENTE (soluções 8536 e 8434) [R2]. (c) **Domínio Processos** (gestor de tarefas, módulo adicional com mensalidade, contratado em "Contratações de Serviços" do suporte Onvio — solução 7456 [R2]): "ao concluir uma rotina pelo Sistema Domínio, a tarefa correspondente no Processos é finalizada automaticamente"; papéis usuário/gerente/administrador (solução 12041 [R2]); cobrança automática de documentos, baixa automática, "relatórios de produtividade individual e por departamento" e controle do "tempo de produção de cada tarefa" (https://www.dominiosistemas.com.br/solucoes/dominio-processos [R2]); integração que envia ao Portal do Cliente os documentos anexados à tarefa (função Express) ao concluí-la, com tela "Status Integração > Ver Erros" (solução 12304 [R2]). A função Express e a integração com o Domínio coincidem com o que as fichas chamavam de **Gestta Processos** [D1:F31]; a relação de marca Gestta ↔ Domínio Processos não foi confirmada (site do Gestta respondeu 403) `[NÃO ENCONTRADO]`. **API de saída do Processos (tarefas, responsável, horas) para terceiros: `[NÃO ENCONTRADO]`** — a página de integração com ERP e as soluções abertas tratam só de entrada de documentos e rubricas; a premissa 2 registra que a especificação em `api.onvio.com.br` cobre apenas status de integração (a raiz respondeu 404 nesta rodada). Indício de saída de dados: o e-Kontroll anuncia integração "Onvio API" e um "e-Robô" que "conecta os dados do Domínio ao e-Kontroll" (https://e-kontroll.com.br/, 06/11/2026) [R2-sec], sem dizer quais dados. (d) **Portal do Cliente** (Evolução em Nuvem): app com Página Inicial, Documentos e Solicitações; confirmação eletrônica de visualização de guias; certidões; armazenamento de NF-e/NFC-e/CT-e; cadastro de empregados pelo cliente; disponível nos pacotes One, Pro e Max (https://www.dominiosistemas.com.br/solucoes/evolucao-em-nuvem/portal-do-cliente e solução 6326) [R2]. (e) Importação por arquivo (XML, OFX) e Portal do Empregado: mantido da rodada 1 [D3:S20][D5:C3][D4:C1]. (f) Integração da Omie.G-Click com o Onvio usa **usuário e senha de um usuário Onvio com acesso total, com MFA** (não chave de API) para buscar arquivos publicados no Portal (https://ajuda.omie.com.br/pt-BR/articles/15211801-omie-g-click-configurando-a-integracao-com-o-onvio-gestao) [R2-sec]: mostra que, para ler documentos do Portal, há parceiro operando com credencial de usuário. |
| Credencial | Entrada de documentos: **chave por empresa** gerada pelo escritório no Onvio Gestão [R2] + **cadastro do fornecedor como parceiro** para obter a especificação [R2]. Saída de tarefas: `[NÃO ENCONTRADO]`; depende de contrato com a TR |
| Preço | Chave e usuários Onvio: "No Onvio não há custos adicionais para o cadastro de usuários" (ajuda Omie) [R2-sec]. Programa de parceiros e eventual custo para o parceiro: `[PREÇO NÃO PÚBLICO]`. Domínio Processos: mensalidade exibida só na contratação [R2], valor `[PREÇO NÃO PÚBLICO]` |
| Limites e riscos | A TR vende Processos, Portal, Messenger e Certificados Digitais: concorre com a plataforma. A API de entrada pressupõe Agente de Comunicação ativo no servidor do escritório (se ficar "vermelho", nada entra) [R2]. Fila de 60 dias [R2-sec]. Erro de importação mais comum: "não foi encontrada relação de acumulador para o CFOP/CST" [D3:S20] (rodada 1) |
| Link | Links acima, todos abertos em 06/11/2026 |
| Veredito | **B confirmado para entrada** (XML fiscais, pagamentos/recebimentos, rubricas da folha): cadastrar a plataforma como parceira no formulário da TR. **B a negociar para saída** (tarefas, responsável, prazos, tempo do Domínio Processos): pedir à TR, na mesma conversa, acesso de leitura ao Processos. Enquanto não houver, F (arquivo/pasta) para o que não entrar pela API |

### I-02 · Alterdata (Pack, eContador, eTarefas) e API ePlugin

**Status:** conferido na rodada 2.

| Campo | Conteúdo |
| --- | --- |
| O que oferece | **ePlugin**: "plataforma que permite aos clientes da Alterdata, integrar diversos recursos de sistemas de terceiros ao eContador através de funcionalidades disponibilizadas por um conjunto de APIs RestFul/JSON" (https://eplugin.pack.alterdata.com.br, documentação gerada em 16/09/2026, aberta em 06/11/2026) [R2]. Hosts: `dp.pack.alterdata.com.br`, `atendimentos.`, `cnd.`, `documentos.`, `identificacao.` (padrão JSON:API) e `ms-tarefas.pack.alterdata.com.br` [R2]. Endpoints documentados (todos com `Authorization: Bearer TOKEN`) [R2]: **Tarefas** `GET /api/v1/integracao/historico-tarefas?dataInicial=&dataFinal=` (campos nome, prazoEntrega, prazoLegal, responsavel, status, dataConclusao, empresa, departamento; status: A fazer, Concluído, Atrasada, Risco de multas, Enviado; **sem data de início nem horas**; não segue JSON:API). **Atendimentos** `POST /api/v1/integracao/atendimentos` (abre atendimento no eContador; obrigatórios descrição, departamento, providenciar até, parecer). **Documentos** `GET /api/v1/integracao/documentos` e `/{id}` (filtros empresaId, pago, criação, vencimento, expiração, pagamento; atributos título, categoria, valor, vencimento, status, arquivos) e `GET /api/v1/integracao/categoria-documento`. **Certidões (eCND)** `GET /api/v1/integracao/certidoes`, `/{id}`, `GET /api/v1/integracao/tipoCertidao`, `/{id}` (arquivo em base64, abrangência, emissão, vencimento, status). **Empresas** `GET /api/v1/empresas`, `/{id}`, `GET /api/v1/integracao/empresas/{id}`, `GET /api/v1/integracao/usuarios/{id}/relationships/empresas`. **Usuários** `GET /api/v1/integracao/usuarios`, `/{id}`. **Funcionários** `GET /api/v1/funcionarios` (filtro empresa, status ativo) e `GET /api/v1/historico-funcoes`. **Folha** `POST /api/v1/movimentos` (valores de eventos por funcionário, período e quantidade). **Admissão** `POST /api/v1/candidatos` (entra na Pré-Admissão e integra ao DP). **Férias** `POST /api/v1/agendamentos-ferias`. **Rescisão** `POST /api/v1/notificacoes-rescisao`. **Recálculo de DAS** `GET` e `POST /api/v1/integracao/recalculo-das` (recalcula DAS vencido pelo e-CAC e devolve o PDF; limite de 1 recálculo por empresa por dia, HTTP 409 acima). **Integração contábil** `POST /api/v1/integracao/integracaoAlterdata` (arquivo TXT `Lançamentos_contabeis_DD_MM_AAAA_a_DD_MM_AAAA.txt` no leiaute do Contábil Windows: código do lançamento automático, conta débito, conta crédito, data, valor, histórico padrão, descrição, documento; aceita CNPJ alfanumérico). **Vertical** `GET /api/v1/integracao/user-connections/verificar-vertical`. A documentação já trata o **CNPJ alfanumérico** (campos duplos) [R2]. Recursos do eContador para o cliente (Atendimentos, Documentos gerais, Avisos, CND, Funcionários, Folha Net, Pré-admissão, Agendamento de férias, Pré-demissão, Extratos): https://ajuda.alterdata.com.br/packupbase/tema-econtador/econtador-tudo-que-o-seu-cliente-precisa-saber-sobre-o-econtador [R2]. Mantido da rodada 1 (não conferido): importação de XML por pasta [D3:S21], conciliação [D5:C11], eTarefas com baixa por UpDocs [D7:R12], revenda do Integra Contador (DAS a R$ 0,75 em 2025) [D2:S5] |
| Credencial | **token-esc**: "é necessário ser um cliente do pacote eContador Master, em seguida será necessário gerar o seu Token através da plataforma eContador" (Configurações > ePlugin ou "Integração Alterdata" > Gerar) [R2]. O token é do **escritório** cliente da Alterdata; a plataforma o usaria em nome dele |
| Preço | Uso da API: nenhuma tarifa por chamada publicada `[NÃO ENCONTRADO]`. Pré-requisito: pacote **eContador Master**, comprado pela eContador Store dentro do sistema, sem preço público (https://ajuda.alterdata.com.br/esbdc/tema-econtador-sollo/econtador-sollo-tudo-que-voce-precisa-saber-sobre-o-econtador-store) → `[PREÇO NÃO PÚBLICO]` |
| Limites e riscos | Histórico de tarefas sem início e sem horas: dá prazo, responsável e conclusão, não tempo gasto. Não há endpoint de upload de documento para o eContador (só leitura de documentos) `[NÃO ENCONTRADO]` na documentação. A Alterdata vende portal, tarefas e WhatsApp: concorre com a plataforma. Contato técnico: **api_econtador@alterdata.com.br** [R2] |
| Link | https://eplugin.pack.alterdata.com.br · https://ajuda.alterdata.com.br/esbdc/tema-eplugin/econtador-eplugin (06/11/2026) |
| Veredito | **B confirmado** (token do escritório + pacote eContador Master). Ler tarefas, documentos, CNDs, empresas e funcionários; escrever admissão, férias, rescisão, movimentos da folha, atendimentos e lançamentos contábeis. Pedir à Alterdata: tempo por tarefa, data de início, upload de documentos e condição comercial para parceiro |

### I-03 · Contmatic (Contábil Phoenix, G5, Simplifique)

**Status:** conferido na rodada 2 (resultado: nenhuma API pública).

| Campo | Conteúdo |
| --- | --- |
| O que oferece | Integração **dentro do ecossistema próprio**: Simplifique (gestão e emissão do cliente) → Contábil Phoenix ou G5; "Busca XML" da Sefaz; o blog oficial de 02/04/2026 afirma que a "Contmatic integra com ERPs, PDVs e e-commerce via API e XML", mas o corpo do texto descreve só a integração Simplifique ↔ Phoenix (https://simplifique.contmatic.com.br/blogs/como-integrar-contmatic-com-outros-sistemas-e-erps) [R2]. Site oficial: "Integrações inteligentes com plataformas como Busca Legal, Acessórias, Jettax e Contbank" (https://www.contmatic.com.br/) [R2]. Planos do Phoenix: Individual (até 5 clientes), Essencial (20), Avançado (50), Elite (ilimitado); **"Gestão do Escritório — Plataforma para controle financeiro, produtividade e fluxo de tarefas do escritório"** só no Avançado e no Elite; **"Contador Online — Sistema de integração entre escritório e cliente"** em todos (https://www.contmatic.com.br/sistema-contabil-contabil-phoenix) [R2]. Documentação de API para terceiros, portal de desenvolvedores ou leiaute de importação publicado: `[NÃO ENCONTRADO]` (buscado no site, no blog e na web) |
| Credencial | `[NÃO ENCONTRADO]` |
| Preço | Planos do Phoenix sem valor na página ("Conversar agora") → `[PREÇO NÃO PÚBLICO]` |
| Limites e riscos | Como Acessórias e Jettax já integram, existe algum canal técnico para parceiros, não documentado publicamente |
| Contato | Comercial e suporte pela página https://www.contmatic.com.br/contato (segunda a sexta, 8h30 às 17h30) [R2]; razão social no rodapé: AURUM SOFTMATIC LTDA |
| Veredito | **Negociar (B a negociar)**: pedir à Contmatic o mesmo acesso dado a Acessórias e Jettax (tarefas do módulo Gestão do Escritório, documentos do Contador Online, leiautes). Enquanto isso, F por arquivo; agente de desktop só se a Contmatic recusar (premissa 3) |

### I-04 · Questor (core concorrente, citado em várias fichas)

**Status:** mantido da rodada 1 (não conferido).

| Campo | Conteúdo |
| --- | --- |
| O que oferece | Open Finance **nativo** na conciliação, lançamentos em lote [D5:C2]; Tareffa com processo modelo de cobrança de arquivos [D5:C1]; e-Consignado [D4:C6]; guias da folha [D2:C14]; IBS/CBS no financeiro [D6:C13] |
| Credencial / Preço | `[PREÇO NÃO PÚBLICO]` (rodada 1) |
| Link | https://docs.questor.com.br/pt-br/Produtos/GestãoContábilCloud/Contabilidade/ConciliaçãoBancária/open-finance (via D5) |
| Veredito | Referência de concorrência; integrar só se houver cliente-piloto usando Questor |

### I-05 · WhatsApp Business Platform (Cloud API da Meta)

**Status:** conferido na rodada 2 (preços, regras de cobrança, grupos e CADE); texto dos termos de uso não aberto.

| Campo | Conteúdo |
| --- | --- |
| O que oferece | API oficial; mensagens livres (não modelo) só na **janela de atendimento de 24 h**, que abre e reinicia a cada mensagem do usuário; fora dela, só **modelos** (marketing, utilidade, autenticação); opt-in obrigatório [R2]. Desde 01/07/2026 existe a categoria **Meta Business Agent** (respostas geradas pela plataforma de IA da própria Meta, cobradas a US$ 2,00 por 1 milhão de tokens); respostas geradas por IA de terceiros ou por pessoas são **serviço** [R2]. **Grupos pela API**: "open to all businesses with an Official Business Account (OBA)"; máximo de **8 participantes** por grupo, entrada só por link de convite, até 10.000 grupos por número (https://developers.facebook.com/documentation/business-messaging/whatsapp/groups, 06/11/2026) [R2] |
| Modelo de cobrança | Por mensagem entregue, por categoria e país do destinatário, desde 01/07/2025; mensagens do usuário para a empresa não são cobradas [R2]. **Mudança em 01/10/2026**: a Meta voltou a cobrar (a) **mensagens de serviço** (gratuitas desde 01/11/2024), com **1.000 mensagens de serviço grátis por número por mês**, sem acúmulo; e (b) **modelos de utilidade enviados dentro da janela aberta pelo cliente** (gratuitos desde 01/07/2025). Sem forma de pagamento cadastrada, a Meta para de entregar mensagens de serviço depois das 1.000 grátis [R2]. Continua grátis tudo o que for enviado na janela de entrada gratuita de 7 dias aberta por anúncio "clique para WhatsApp" [R2]. Fonte: https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing ("Updated: Sep 30, 2026"; aberto em 06/11/2026) |
| **Preço Brasil (vigente desde 01/10/2026)** | Tabela oficial em **BRL** [R2]: **marketing R$ 0,3217**; **utilidade R$ 0,035**; **autenticação R$ 0,035**; **serviço R$ 0,035** (depois das 1.000 grátis); Meta Business Agent US$ 2,00/1M tokens. Em USD: marketing US$ 0,0625; utilidade, autenticação e serviço US$ 0,0068. **Faixas de volume** (só utilidade e autenticação, em BRL): utilidade R$ 0,035 até 250 mil/mês; R$ 0,0333 de 250.001 a 2 milhões (−5%); R$ 0,0315 até 17 milhões (−10%); autenticação R$ 0,035 até 500 mil/mês, R$ 0,0333 até 3 milhões. Fonte: planilhas "BRL list rates" e "BRL volume tiers" vinculadas na página de preços. **Faturamento em BRL**: desde 01/07/2026 (liberado a todos os elegíveis em 16/07/2026) para provedores e empresas diretamente integradas cujo país de faturamento é o Brasil, faturado pela Facebook Brasil; contas elegíveis devem migrar para BRL até 30/06/2027, quando a Meta deixa de entregar mensagens de contas não-BRL [R2] |
| Política de IA | Termos da WhatsApp Business Solution anunciados em out/2025 para barrar provedores de IA de uso geral: **texto vigente não aberto** (página carrega só com JavaScript) `[NÃO ENCONTRADO]`. **CADE** [R2]: em 12/01/2026 a Superintendência-Geral abriu o **Inquérito Administrativo 08700.012397/2025-63** contra empresas do grupo Meta e aplicou **medida preventiva suspendendo a aplicação dos Novos Termos** no Brasil (https://www.gov.br/cade/pt-br/assuntos/noticias/cade-abre-inquerito-contra-meta-e-aplica-medida-preventiva-suspendendo-novos-termos-do-whatsapp-sobre-ia); o Tribunal manteve a medida por unanimidade em 04/03/2026 (https://www.gov.br/cade/pt-br/assuntos/noticias/tribunal-do-cade-mantem-medida-preventiva-sobre-novos-termos-de-uso-do-whatsapp, título lido no resultado da busca; data confirmada pela imprensa [R2-sec] https://tecnoblog.net/noticias/tribunal-do-cade-mantem-decisao-que-permite-ias-concorrentes-no-whatsapp/); em 23/04/2026 o Tribunal **manteve a multa diária de R$ 250 mil** por descumprimento, porque a Meta passou a cobrar dos chatbots de IA como "marketing", e exigiu o retorno ao arranjo anterior "sem qualquer cobrança adicional" (https://www.gov.br/cade/pt-br/assuntos/noticias/cade-mantem-multa-diaria-contra-meta-e-whatsapp-por-descumprimento-de-medida-preventiva). Julgamento de mérito do inquérito: `[NÃO ENCONTRADO]` até 06/11/2026. A imprensa cita decisão da Justiça Federal do DF que teria suspendido a medida em algum momento [R2-sec, tecnoblog "WhatsApp: Justiça libera restrições" — só o título foi visto]; situação judicial atual `[NÃO ENCONTRADO]`. **Efeito prático para a plataforma**: o caso trata de chatbots de IA de uso geral (Luzia, Zapia); um escritório usando IA para atender os próprios clientes sobre os próprios serviços é uso empresarial comum; suas respostas são cobradas como **serviço** (R$ 0,035 após as 1.000 grátis), não como Meta Business Agent |
| Credencial | Conta Meta Business do escritório verificada, número dedicado, forma de pagamento no Billing Hub (obrigatória desde 01/10/2026 para serviço acima da franquia) [R2]; demais detalhes `[NÃO VERIFICADO — conhecimento prévio]` |
| Limites e riscos | Limites de envio por qualidade, reclassificação de modelos, coexistência app + API: mantido da rodada 1 (não conferido). Bibliotecas não oficiais: **nível E**. Grupos com mais de 8 pessoas não migram para a API [R2] |
| Custo de referência | Escritório com 300 clientes, 1 número: 2 modelos de utilidade/cliente/mês fora da janela = 600 × R$ 0,035 = R$ 21; 3.000 respostas de serviço/mês = (3.000 − 1.000) × R$ 0,035 = R$ 70; total ≈ **R$ 91/mês** em tarifa Meta (cálculo do agente sobre a tabela [R2]; volume é hipótese) |
| Veredito | **Integrar (B)**, Cloud API direta ou por BSP, com conta em BRL. Desenhar o atendimento para caber nas 1.000 mensagens de serviço grátis por número e usar modelos de utilidade só no que precisa sair fora da janela |

### I-06 · Provedores de WhatsApp (BSP) e multiatendimento comercial

**Status:** mantido da rodada 1 (não conferido), exceto a linha Acessórias Komunic (conferida em parte).

| Fornecedor | O que oferece | Preço | Fonte |
| --- | --- | --- | --- |
| 360dialog, Twilio, Gupshup (citados no Plano) | Acesso à Cloud API com painel, suporte e cobrança agregada | `[NÃO VERIFICADO]` | Plano, seção 3.3 |
| Blip, Zenvia, Take, Octadesk, Huggy | Multiatendimento brasileiro com WhatsApp oficial | `[NÃO VERIFICADO]` | D7 |
| Digisac | Multiatendimento com filas por setor | `[PREÇO NÃO PÚBLICO]` | [D4:C9] |
| Acessórias **Komunic / Komunic Gestão** | Um número oficial compartilhado entre atendentes, histórico por cliente, IA que analisa conversas encerradas, avalia a qualidade e manda casos para revisão humana; indicadores por colaborador e departamento | `[PREÇO NÃO PÚBLICO]` | [R2] https://acessorias.com/site/ia-whatsapp-contabilidade/ (blog oficial de 29/10/2026) |
| **Gestta / Domínio Messenger** | WhatsApp integrado ao Domínio | `[PREÇO NÃO PÚBLICO]` | [D7:R7]; módulo "Domínio Messenger" listado no site [R2] |
| Flash, Anaclara | Coleta de documentos e assinatura por WhatsApp | — | [D4:C8][D4:C10] |

Veredito: usar BSP só se a verificação de empresa na Meta ou o suporte forem gargalo; a tarifa Meta é a mesma (I-05) e o BSP soma margem `[NÃO VERIFICADO]`.

### I-07 · Chatwoot (caixa de entrada multicanal de código aberto)

**Status:** conferido em parte na rodada 2 (licença).

| Campo | Conteúdo |
| --- | --- |
| O que oferece | Caixa de entrada multicanal com API e webhooks, auto-hospedável `[NÃO VERIFICADO — conhecimento prévio]` |
| Licença | "All content that resides under the "enterprise/" directory of this repository [...] is licensed under the license defined in "enterprise/LICENSE"" e o restante sob **MIT Expat** (https://raw.githubusercontent.com/chatwoot/chatwoot/develop/LICENSE, "Copyright (c) 2017-2026", aberto em 06/11/2026) [R2]. Quais recursos (SLA, auditoria, CSAT, IA "Captain") ficam em `enterprise/`: `[NÃO ENCONTRADO]` nesta rodada |
| Preço | Auto-hospedado: infraestrutura; nuvem e enterprise `[NÃO VERIFICADO]` |
| Veredito | **Referência ou base**; antes de adotar, listar o conteúdo de `enterprise/` no repositório |

### I-08 · Instagram e Messenger (API de mensagens da Meta)

**Status:** mantido da rodada 1 (não conferido).

| Campo | Conteúdo |
| --- | --- |
| O que oferece | DMs de conta profissional por API, janela de 24 h, app revisado pela Meta `[NÃO VERIFICADO — conhecimento prévio]` |
| Preço | Sem cobrança por mensagem conhecida `[NÃO VERIFICADO]` |
| Veredito | **B, prioridade baixa** (GES-032) |

### I-09 · E-mail e calendário

**Status:** mantido da rodada 1 (não conferido).

| Campo | Conteúdo |
| --- | --- |
| O que oferece | Gmail API, Google Calendar API, Microsoft Graph, IMAP `[NÃO VERIFICADO — conhecimento prévio]` |
| Credencial | OAuth do escritório |
| Preço | Sem custo de API dentro das cotas `[NÃO VERIFICADO]` |
| Veredito | **Integrar (A)** para GES-027 e GES-050 |

### I-10 · Open Finance: agregadores

**Status:** conferido em parte na rodada 2 (Pluggy e Belvo; Celcoin, Klavi e TecnoSpeed mantidos).

| Fornecedor | O que oferece | Preço | Fonte |
| --- | --- | --- | --- |
| **Pluggy** | API de dados (contas, transações, identidade, empréstimos, investimentos) e de pagamentos; 15 dias de teste com contas reais | **Dados: a partir de R$ 2.500/mês**; **Pagamentos: a partir de R$ 500/mês**; "Cada produto tem um mínimo mensal [...] com volume incluso. Acima disso, o excedente é cobrado por requisição"; cada leitura (saldo, transação, investimento) conta como requisição | [R2] https://www.pluggy.ai/precos (06/11/2026) |
| **Belvo** | Open Finance, widget de conexão, Pix | Plano **Launch: US$ 1.000/mês**; Growth sob consulta; sandbox grátis, produção exige plano pago | [R2] https://belvo.com/plans-and-pricing/ (página global; preço específico do Brasil `[NÃO ENCONTRADO]`) |
| **Celcoin** | Histórico de até 12 meses no endpoint principal | `[PREÇO NÃO PÚBLICO]` (rodada 1) | [D5:T12] |
| **Klavi**, **TecnoSpeed** | Agregação Open Finance | rodada 1: TecnoSpeed ~R$ 1,5 mil de entrada (fórum) `[NÃO VERIFICADO]` | [D5:C8][D5:C14] |

| Campo comum | Conteúdo |
| --- | --- |
| Credencial | **consent-cli** do representante da PJ; contrato com o agregador |
| Limites e riscos | O piso mensal (R$ 2.500 na Pluggy; ~US$ 1.000 na Belvo) é alto para um escritório só: precisa ser rateado pela carteira (GES-010) ou vendido como adicional; consentimento e cobertura de cooperativas: mantido da rodada 1 |
| Alternativa | OFX/CNAB enviado pelo cliente pelo app (F) |
| Veredito | **Comprar (B)** depois que houver volume; **MVP com OFX pelo app do cliente** |

### I-11 · Arquivos bancários e APIs diretas de banco

**Status:** mantido da rodada 1 (não conferido).

| Campo | Conteúdo |
| --- | --- |
| O que oferece | OFX/OFC, CNAB 240/400, EDI de adquirentes; APIs PJ de bancos para a conta do próprio titular com mTLS `[NÃO VERIFICADO — conhecimento prévio]` |
| Veredito | **F** para extrato e CNAB; API direta só para a conta do escritório (I-14) |

### I-12 · Agregadores de consultas e certidões

**Status:** conferido em parte na rodada 2 (Infosimples e eCND da Alterdata).

| Fornecedor | O que oferece | Preço | Fonte |
| --- | --- | --- | --- |
| **Infosimples** | APIs de consultas a portais públicos | Pré-pago, sem adesão, **franquia mínima de R$ 100/mês** por conta; preço base em cascata por volume mensal: **R$ 0,20** (1 a 500), **R$ 0,16** (501 a 2.000), **R$ 0,14** (até 5.000), **R$ 0,13** (até 10.000), **R$ 0,11** (até 30.000), **R$ 0,10** (até 50.000), **R$ 0,09** (acima); algumas consultas têm adicional por chamada (exemplo da página: R$ 0,04); consultas "nada consta" são cobradas; R$ 100 de crédito para teste | [R2] https://infosimples.com/consultas/precos/ (06/11/2026) |
| **Alterdata eCND** | CNDs controladas pelo eCND do escritório, lidas por API (arquivo, abrangência, emissão, vencimento, status) | incluso no eContador Master `[PREÇO NÃO PÚBLICO]` | [R2] ePlugin (I-02) |
| **Domínio Portal do Cliente** | "Busque, emita, armazene, registre e controle as certidões negativas dos seus clientes" | `[PREÇO NÃO PÚBLICO]` | [R2] (I-01) |
| HubCount, Jettax, Makro CND, Dootax, e-Auditoria | CND automática | `[PREÇO NÃO PÚBLICO]` (rodada 1) | [D2:C3–C6][D2:C12] |
| BigDataCorp, Neoway, Serasa, Assertiva | Dados cadastrais, PEP | `[NÃO VERIFICADO]` | conhecimento prévio |

Custo de referência: 300 clientes × 4 certidões/mês = 1.200 consultas ≈ 500 × 0,20 + 700 × 0,16 = **R$ 212/mês** na Infosimples (cálculo do agente sobre a tabela [R2]; volume é hipótese; consultas com adicional não incluídas). Veredito: **Comprar (B)** para certidões com CAPTCHA; federal pelo Integra Contador (V1).

### I-13 · Assinatura eletrônica

**Status:** conferido na rodada 2 (preços de tabela; ICP e dossiê não conferidos).

| Fornecedor | Planos com API | Preço (mensal, faixa de 20 documentos/mês salvo indicação) | Fonte |
| --- | --- | --- | --- |
| **ZapSign** | API, WhatsApp e MCP no plano **Equipe** | Equipe: **R$ 69,90/mês** (20 docs), R$ 119,90 (80), R$ 259,90 (200); anual à vista equivale a R$ 49,90, R$ 99,90 e R$ 239,90/mês. Profissional (sem API) a partir de R$ 39,90. Gratuito: 3 docs/mês. Certificado e-CPF/e-CNPJ vendido à parte: R$ 160 a R$ 260 | [R2] https://zapsign.com.br/planos-pre%C3%A7os (06/11/2026) |
| **D4Sign** | **API Premium** só no plano Profissional | Básico R$ 39,90; Avançado R$ 59,90 (WhatsApp); **Profissional R$ 79,90/mês** (API Premium, IA); Personalizado sob consulta | [R2] https://d4sign.com.br/planos-e-precos (06/11/2026) |
| **Clicksign** | "Integre nossa API ao seu sistema" desde o Start | Start **R$ 69/mês** (20 docs; 5 usuários; sem WhatsApp); Plus R$ 99 (WhatsApp, biometria); Automação R$ 135; Enterprise com "API White Label" para 300+ docs/mês. Em 06/11/2026 havia cupom de Black Friday (20%) | [R2] https://www.clicksign.com/preco |
| Assinador gov.br | Gratuito para o cidadão; API para terceiros `[NÃO ENCONTRADO]` | — | conhecimento prévio |

Base legal (MP 2.200-2/2001, Lei 14.063/2020): não reaberta nesta rodada (V2 cobre). Veredito: **Comprar (B)**; ZapSign Equipe e D4Sign Profissional são os pisos com API; manter a abstração `enviar_para_assinatura`.

### I-14 · Cobrança de honorários (conta do escritório)

**Status:** conferido em parte na rodada 2 (Asaas e Efí; Inter não).

| Fornecedor | O que oferece | Preço | Fonte |
| --- | --- | --- | --- |
| **Asaas** | Cobranças Pix, boleto, cartão, assinaturas, carnês, régua de notificações, NF, negativação; sem mensalidade nem adesão | **Pix ou boleto: R$ 2,15 por cobrança recebida** (R$ 1,08 promocional nos 3 primeiros meses); cartão à vista R$ 0,49 + 2,99%; **notificação por WhatsApp R$ 0,55 cada**; e-mail + SMS R$ 0,99 por cobrança (pacote); carta R$ 2,91; **NF eletrônica R$ 0,49**; **negativação Serasa R$ 9,90**; antecipação de boleto a partir de 5,79% a.m. | [R2] https://www.asaas.com/precos-e-taxas (06/11/2026; o valor padrão aparece riscado ao lado do promocional) |
| **Efí** | Boletos, Bolix, carnês, API Pix, Pix Automático, Pix por biometria, Pix recorrente | **Boleto/Bolix pago R$ 3,45**; emissão, baixa e não pagos grátis; integração por API grátis; **Pix pela API 1,19%** por recebimento; **Pix Automático R$ 3,50 por Pix liquidado** | [R2] https://sejaefi.com.br/tarifas (06/11/2026) |
| **Banco Inter (PJ)** | API de boleto com Pix, Pix cobrança | `[NÃO ENCONTRADO]` em fonte oficial (a URL de tarifas deu 404; fontes secundárias citam 30 boletos grátis/mês e R$ 0,99 após, sem confirmação) | busca de 06/11/2026 |
| Pix Automático (BCB) | Autorização única para débitos recorrentes | tarifa por PSP; Efí cobra R$ 3,50 [R2] | — |

Custo de referência: 300 honorários/mês por Pix/boleto = 300 × R$ 2,15 = **R$ 645/mês** no Asaas, ou 300 × R$ 3,45 = R$ 1.035 em boleto Efí (cálculo do agente). Veredito: **Integrar (B)** com Asaas (já no Plano), camada de abstração para Efí; usar a régua de WhatsApp da própria plataforma (R$ 0,035 por modelo de utilidade) em vez da notificação do Asaas (R$ 0,55).

### I-15 · Fornecedores comerciais de DF-e (captura e emissão)

**Status:** conferido em parte na rodada 2 (Jettax e Fiscal.io → Domínio; SIEG e Qive preços; demais mantidos).

| Fornecedor | O que oferece | Preço | Fonte |
| --- | --- | --- | --- |
| **Jettax** | Envia ao Domínio pela API: NF-e, NFC-e, NFS-e nacional, CF-e, CT-e, CT-e OS; vincula as chaves de integração de todas as empresas a partir do usuário e senha do escritório no Domínio | `[PREÇO NÃO PÚBLICO]` | [R2-sec] https://www.jettax.com.br/blog/como-habilitar-a-integracao-com-o-erp-dominio/ |
| **Fiscal.io Monitor** | Parceira homologada da TR; chave do Onvio por CNPJ ou filial | `[PREÇO NÃO PÚBLICO]` | [R2-sec] https://conteudo.fiscal.io/integracao-dominio-thomson-reuters/ |
| **SIEG** | Cofre de XML e automação fiscal para contadores | **Control a partir de R$ 223/mês; Flow a partir de R$ 470; Essential a partir de R$ 800**; certificados A1 via QualityCert por R$ 69, R$ 59 ou R$ 49 cada conforme o plano | [R2] https://www.sieg.com/precos/ (06/11/2026) |
| **Qive** | Consulta, armazenamento e download de NF-e, NFS-e e CT-e; planos para escritórios "de acordo com o portfólio" | `[PREÇO NÃO PÚBLICO]` ("Fale com um especialista"); o R$ 153/mês da rodada 1 era de comparador e **não foi confirmado** | [R2] https://qive.com.br/planos |
| NFE.io, Focus NFe, PlugNotas, eNotas, e-Auditoria, Kolossus | ver rodada 1 | `[NÃO VERIFICADO]` | [D3:C5–C8] |

Veredito: captura federal/estadual é commodity e oficial (V2): **construir**; para entregar ao Domínio, usar a **mesma API de entrada** que Jettax e Fiscal.io usam (I-01), como parceiro homologado.

### I-16 · ERPs e sistemas financeiros dos clientes

**Status:** conferido em parte na rodada 2 (integrações Conta Azul e Omie com o Domínio).

| Fornecedor | O que oferece | Fonte |
| --- | --- | --- |
| Conta Azul | NF emitidas vão para a "Importação via API" do Domínio; contas a pagar do Domínio vão para o Conta Azul; chave gerada no Onvio Gestão | [R2] solução 8434 |
| Omie | Envia documentos fiscais e recebimentos ao Domínio pela API, com painel de histórico; monitora o status da API do Domínio a cada hora | [R2-sec] ajuda Omie 12051153 |
| Bling, Nibo | APIs públicas `[NÃO VERIFICADO — conhecimento prévio]` | — |

Veredito: **B por conector** para os ERPs mais comuns na carteira; o Domínio já recebe direto de ERPs homologados, então o conector da plataforma vale mais para clientes de Alterdata e Contmatic.

### I-17 · Concorrentes de gestão: funcionalidades e preços públicos

**Status:** conferido em parte na rodada 2 (Acessórias, HubStrom, SIEG, Qive, e-Kontroll, Domínio Processos e Portal; Gestta inacessível).

| Concorrente | Funcionalidades (rodada 2 marcada [R2]) | Preço público | Fonte |
| --- | --- | --- | --- |
| **Acessórias** | **API do escritório com token** e **Acessórias MCP** (ChatGPT, Claude, Gemini consultam "empresas, contatos, setores, entregas, processos e solicitações") [R2]; **App personalizado (white label) + Área VIP** por cliente com documentos, prazos, alertas, protocolos, chamados e NPS [R2]; **Acessórias Docs** (solicitação e cobrança automática de documentos, status e histórico por cliente) [R2]; **Protocolo Digital** (assinatura ao receber, data, hora, IP) [R2]; Komunic com IA (I-06) [R2]; integra com Contmatic e e-Kontroll [R2] | `[PREÇO NÃO PÚBLICO]` (página de planos não existe; só "Solicite uma demonstração") | https://acessorias.com/site/ e páginas de funcionalidade (06/11/2026) |
| **Domínio Processos / Gestta** | ver I-01 [R2]; site do Gestta não abriu (403) | mensalidade só na contratação `[PREÇO NÃO PÚBLICO]` | I-01 |
| **HubStrom** | MonitorHub, ConnectHub (WhatsApp + app, IA para a equipe responder), XMLHub (NF-e/NFC-e de 23 estados, NFS-e pelo Portal Nacional, CT-e), TaskHub, DriveHub, **AppHub (app white label)**; promoção "30% off na mensalidade + app grátis por 1 ano" [R2] | `[PREÇO NÃO PÚBLICO]` | https://hubstrom.com/ (06/11/2026) |
| **e-Kontroll** | Lê dados do Domínio (e-Robô), integração **Onvio API** e Acessórias (e-Gestor); **e-Monitor** ("produtividade e o uso do tempo da equipe"); e-Ligações (VoIP); e-Custos (rentabilidade e honorários); **e-API** para terceiros (cadastro, dados operacionais e volumetria), addon pago [R2] | `[PREÇO NÃO PÚBLICO]` | https://e-kontroll.com.br/ (06/11/2026) |
| **SIEG** | ver I-15 | **a partir de R$ 223/mês** [R2] | https://www.sieg.com/precos/ |
| **Qive** | ver I-15 | `[PREÇO NÃO PÚBLICO]` [R2] | https://qive.com.br/planos |
| **Alterdata eContador** | ver I-02 [R2] | `[PREÇO NÃO PÚBLICO]` | I-02 |
| **Contmatic Contador Online / Gestão do Escritório** | ver I-03 [R2] | `[PREÇO NÃO PÚBLICO]` | I-03 |
| Veri | `[NÃO ENCONTRADO]` (não buscado de novo) | — | — |
| Jettax, HubCount, e-Auditoria, Nibo/Omie G.Click, Makrosystem, Questor/Tareffa, ROIT, Dootax, Digisac | mantido da rodada 1 (não conferido) | `[PREÇO NÃO PÚBLICO]` / `[NÃO ENCONTRADO]` | fichas D |

**Leitura do mercado (rodada 2):** o app/portal do cliente com a marca do escritório, documentos, prazos, protocolo de entrega e WhatsApp integrado **já é vendido** por Acessórias, HubStrom, Domínio (Portal do Cliente), Alterdata (eContador) e Contmatic (Contador Online). A Acessórias já expõe sua base por API e por **MCP** a assistentes de IA, e o e-Kontroll já mede o tempo da equipe e a rentabilidade sobre dados do Domínio. O diferencial que segue sem concorrente encontrado é a combinação de (1) IA que responde ao cliente com os dados dele e cita a norma, (2) **consolidação de tarefas e tempo de vários cores** num só lugar (os concorrentes ficam presos a um core ou ao próprio gestor), (3) cobrança de honorários e (4) visão de carteira. Só a SIEG publica preço (a partir de R$ 223/mês); o resto vende por proposta.

---

## 2. Verificação por ficha

Formato: campos da seção 2.2 do protocolo, mais `status` (conferido na rodada 2 / conferido em parte / mantido da rodada 1) e, nas fichas não reescritas, `nota_rodada2` com o que mudou nas integrações reabertas. Fichas reescritas por completo nesta rodada (mudança de nível, preço confirmado ou premissa do fundador): SOC-008, SOC-016, SOC-021, FIS-001, FIS-003, FIS-010, FIS-036, FIS-047, NFE-001, NFE-033, NFE-035, DP-001, DP-009, DP-011, DP-019, DP-020, CTB-008, CTB-010, CTB-017, GES-001, GES-004, GES-023, GES-029, GES-030, GES-037, GES-039, GES-040, GES-048, CON-030. Nas demais, os campos são os da rodada 1 e a confiança não sobe; quando a `nota_rodada2` contradiz um campo antigo (por exemplo, gratuidade de respostas no WhatsApp), vale a nota.

Quando a ficha depende também de V1 (federal) ou V2 (estadual/municipal), o nível dado aqui é **só o da parte de mercado/core**; o consolidador fica com o nível mais alto com fonte.

### 2.1 D1 · Clientes, Societário e Legalização

#### SOC-001 · Cadastrar cliente a partir do CNPJ
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-12); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: A$ (Consulta CNPJ SERPRO, V1) ou B (agregador cadastral)
- `integrações`: agregadores de dados cadastrais (I-12: BigDataCorp, Neoway, Serasa, Assertiva) como alternativa ao SERPRO; Infosimples para comprovante de inscrição `[NÃO VERIFICADO]`
- `credencial_exigida`: token-esc + contrato
- `preço`: `[NÃO VERIFICADO]` (por consulta, sob contrato)
- `limites_e_riscos`: dado de agregador pode estar defasado em relação à RFB; LGPD na consulta de sócios (base legal: execução de contrato/obrigação legal)
- `alternativa`: dados abertos do CNPJ da RFB (V1) + digitação assistida
- `veredito`: integrar com a fonte oficial (V1); agregador só se faltar dado (sócios PEP, telefones)
- `confiança`: baixa
- `fontes_verificação`: I-12; Plano 3.3
- `nota_rodada2`: Certidões [R2]: Infosimples R$ 0,20 a R$ 0,09 por consulta, franquia mínima R$ 100/mês; CNDs do eCND da Alterdata por API (I-12)

#### SOC-003 · Vigiar o cadastro do CNPJ na RFB e nos órgãos
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-12, I-17); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: B para IE/inscrição municipal por agregador; parte federal é V1
- `integrações`: I-12 (Infosimples e similares para Sintegra/cadastros estaduais `[NÃO VERIFICADO]`); concorrentes HubStrom MonitorHub, MonitorCNPJ [D2:C13]
- `credencial_exigida`: token-esc
- `preço`: `[NÃO VERIFICADO]`
- `limites_e_riscos`: custo recorrente por CNPJ × frequência; definir frequência por risco (diária só para cliente com pendência)
- `alternativa`: consulta semanal pelo webservice de cadastro da Sefaz (V2)
- `veredito`: integrar (B) só para o que V1/V2 não cobrem
- `confiança`: baixa
- `fontes_verificação`: I-12, I-17; [D2:C13]
- `nota_rodada2`: Certidões [R2]: Infosimples R$ 0,20 a R$ 0,09 por consulta, franquia mínima R$ 100/mês; CNDs do eCND da Alterdata por API (I-12) · Concorrentes [R2]: Acessórias com API por token, MCP, app white label e Área VIP; HubStrom com AppHub; e-Kontroll com e-Monitor (tempo da equipe); SIEG a partir de R$ 223/mês (I-17)

#### SOC-004 · Cadastrar sócios, administradores e representantes
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-05, I-12); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: B (PEP e listas restritivas para PLD) + D (documentos pessoais)
- `integrações`: I-12 (BigDataCorp, Serasa, Assertiva) `[NÃO VERIFICADO]`; WhatsApp para coleta de documentos (I-05)
- `credencial_exigida`: token-esc; consentimento/base legal LGPD
- `preço`: `[NÃO VERIFICADO]`
- `limites_e_riscos`: tratamento de dado pessoal sensível; guardar só o necessário
- `alternativa`: formulário no portal + upload
- `veredito`: integrar (B) junto com SOC-019
- `confiança`: baixa
- `fontes_verificação`: I-05, I-12
- `nota_rodada2`: WhatsApp [R2, tabela de 01/10/2026]: marketing R$ 0,3217; utilidade, autenticação e serviço R$ 0,035; 1.000 mensagens de serviço grátis por número/mês; **desde 01/10/2026 respostas acima da franquia e modelos de utilidade dentro da janela são cobrados** (o que esta ficha diz sobre gratuidade na janela fica corrigido por esta nota); Groups API até 8 participantes (I-05) · Certidões [R2]: Infosimples R$ 0,20 a R$ 0,09 por consulta, franquia mínima R$ 100/mês; CNDs do eCND da Alterdata por API (I-12)

#### SOC-008 · Guardar e inventariar certificados digitais (cofre)
- `status`: conferido em parte na rodada 2 (premissa 1 aplicada; concorrentes reabertos em parte)
- `nível_automação`: construir (cofre próprio) + **envio obrigatório do A1 pelo cliente no app** (premissa 1)
- `integrações`: concorrentes que já fazem gestão de certificados: Domínio Certificados Digitais (módulo novo, "toda a gestão de certificados com uma experiência centralizada") [R2] https://www.dominiosistemas.com.br/solucoes/integracao-com-erp/ (menu, 06/11/2026); SIEG vende A1 via QualityCert por R$ 49 a R$ 69 conforme o plano [R2] https://www.sieg.com/precos/; ZapSign vende e-CPF/e-CNPJ de R$ 160 a R$ 260 [R2]; Acessórias AC Certifica [D1:F27] e Omie G.Click [D1:F36] (rodada 1)
- `credencial_exigida`: A1 do cliente (.pfx + senha), **enviado pelo próprio cliente no app** e guardado em cofre; e-CNPJ do escritório para o que a procuração cobre (V1)
- `preço`: KMS/HSM na nuvem `[NÃO VERIFICADO]`; revenda de A1 é receita possível (SIEG a R$ 49–69 [R2])
- `limites_e_riscos`: custódia de A1 de terceiros segue o maior risco jurídico e de segurança; com o envio pelo cliente, o termo de custódia e o aceite viram etapa do onboarding no app; validade e troca do A1 geram tarefa automática (SOC-009). Já apurado por outro agente (06/11/2026): NF-e (NT 2014.002 v1.40) e ADN da NFS-e exigem o certificado do próprio contribuinte; procuração para o ADN pedida pela FENACON, não implementada
- `alternativa`: só e-CNPJ do escritório + procuração (cobertura menor)
- `veredito`: construir, com revisão jurídica e de segurança antes do MVP; A1 obrigatório no onboarding do app
- `confiança`: média (premissa e concorrentes) / alta (preços de A1 citados [R2])
- `fontes_verificação`: I-01, I-13, I-15, I-17

#### SOC-009 · Alertar o vencimento e conduzir a renovação de certificados
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-05, I-17); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: construir (alerta) + B opcional (parceria com AC para renovação)
- `integrações`: WhatsApp utilidade (I-05) para avisar o cliente; Acessórias tem "cashback com parceiro" de AC [D1 tabela]
- `credencial_exigida`: nenhuma para o alerta; contrato com AC para revenda `[NÃO VERIFICADO]`
- `preço`: mensagem de utilidade fora da janela (I-05) `[NÃO VERIFICADO]`
- `limites_e_riscos`: validade do A3 diverge entre fontes (D1 lacuna 11)
- `alternativa`: e-mail
- `veredito`: construir; parceria com AC é receita extra, não requisito
- `confiança`: média
- `fontes_verificação`: I-05, I-17
- `nota_rodada2`: WhatsApp [R2, tabela de 01/10/2026]: marketing R$ 0,3217; utilidade, autenticação e serviço R$ 0,035; 1.000 mensagens de serviço grátis por número/mês; **desde 01/10/2026 respostas acima da franquia e modelos de utilidade dentro da janela são cobrados** (o que esta ficha diz sobre gratuidade na janela fica corrigido por esta nota); Groups API até 8 participantes (I-05) · Concorrentes [R2]: Acessórias com API por token, MCP, app white label e Área VIP; HubStrom com AppHub; e-Kontroll com e-Monitor (tempo da equipe); SIEG a partir de R$ 223/mês (I-17)

#### SOC-015 · Elaborar proposta comercial e precificar
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-13, I-17); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: construir (modelo + cálculo) + B (assinatura do aceite)
- `integrações`: I-13 para o aceite; concorrente Makrosystem (modelos de proposta) [D1:F38]
- `credencial_exigida`: token do provedor de assinatura
- `preço`: por envelope `[NÃO VERIFICADO]`
- `limites_e_riscos`: tabela de honorários de referência (sindicato/ASSCON) é dado externo a manter
- `alternativa`: PDF + aceite por WhatsApp registrado (GES-036)
- `veredito`: construir
- `confiança`: média
- `fontes_verificação`: I-13, I-17
- `nota_rodada2`: Assinatura [R2]: com API a partir de R$ 69/mês (Clicksign Start), R$ 69,90 (ZapSign Equipe) e R$ 79,90 (D4Sign Profissional), faixa de 20 docs/mês (I-13) · Concorrentes [R2]: Acessórias com API por token, MCP, app white label e Área VIP; HubStrom com AppHub; e-Kontroll com e-Monitor (tempo da equipe); SIEG a partir de R$ 223/mês (I-17)

#### SOC-016 · Formalizar o contrato de prestação de serviços
- `status`: conferido na rodada 2 (preços e disponibilidade de API); base legal mantida da rodada 1
- `nível_automação`: B
- `integrações`: ZapSign (API no plano Equipe), D4Sign (API Premium no Profissional), Clicksign (API desde o Start) (I-13) [R2]
- `credencial_exigida`: token-esc + contrato com o provedor; signatário com e-mail/telefone
- `preço`: piso com API: **ZapSign Equipe R$ 69,90/mês (20 docs)**, **Clicksign Start R$ 69/mês (20 docs)**, **D4Sign Profissional R$ 79,90/mês** [R2, 06/11/2026]
- `limites_e_riscos`: escolha do nível de assinatura; dossiê de evidências (não conferido nesta rodada)
- `alternativa`: Assinador gov.br pelo próprio cliente, com upload no app (D)
- `veredito`: comprar/integrar (B) com camada `enviar_para_assinatura`
- `confiança`: alta (preço e existência de API) / média (base legal, não reaberta)
- `fontes_verificação`: I-13

#### SOC-018 · Reajustar honorários e fazer aditivos
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-02, I-05, I-13, I-14); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: construir (cálculo e campanha) + B (aditivo assinado, cobrança reajustada)
- `integrações`: I-13 (aditivo), I-14 (atualizar assinatura recorrente no provedor), I-05 (comunicado utilidade); Alterdata já tem reajuste programado [D1:F37]
- `credencial_exigida`: tokens dos provedores
- `preço`: `[NÃO VERIFICADO]`
- `limites_e_riscos`: índice (IPCA/IGP-M/INPC) vem de API do BCB/IBGE (V1)
- `alternativa`: carta de reajuste por e-mail com ciência
- `veredito`: construir + integrar
- `confiança`: média
- `fontes_verificação`: I-13, I-14, I-02
- `nota_rodada2`: Alterdata [R2]: API ePlugin com token do escritório (exige eContador Master): tarefas, documentos, CNDs, empresas, funcionários, movimentos da folha, admissão, férias, rescisão, atendimentos, recálculo de DAS, lançamentos contábeis em TXT (I-02) · WhatsApp [R2, tabela de 01/10/2026]: marketing R$ 0,3217; utilidade, autenticação e serviço R$ 0,035; 1.000 mensagens de serviço grátis por número/mês; **desde 01/10/2026 respostas acima da franquia e modelos de utilidade dentro da janela são cobrados** (o que esta ficha diz sobre gratuidade na janela fica corrigido por esta nota); Groups API até 8 participantes (I-05) · Assinatura [R2]: com API a partir de R$ 69/mês (Clicksign Start), R$ 69,90 (ZapSign Equipe) e R$ 79,90 (D4Sign Profissional), faixa de 20 docs/mês (I-13) · Cobrança [R2]: Asaas R$ 2,15 por Pix/boleto recebido, WhatsApp R$ 0,55/notificação, NF R$ 0,49, negativação R$ 9,90; Efí boleto R$ 3,45, Pix API 1,19%, Pix Automático R$ 3,50; Inter `[NÃO ENCONTRADO]` (I-14)

#### SOC-019 · Cumprir a prevenção à lavagem de dinheiro (PLD)
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-12); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: B (consulta PEP/listas) + D (declaração anual pelo sistema do CFC)
- `integrações`: I-12 (BigDataCorp, Serasa, Neoway, Assertiva) `[NÃO VERIFICADO]`; listas públicas (Portal da Transparência/CEIS-CNEP, sanções ONU/CSNU) `[NÃO VERIFICADO — conhecimento prévio]`
- `credencial_exigida`: token-esc
- `preço`: `[NÃO VERIFICADO]`
- `limites_e_riscos`: o sistema do CFC/COAF não tem API conhecida `[NÃO ENCONTRADO]`; envio da declaração é manual
- `alternativa`: checklist de identificação + consulta manual a listas
- `veredito`: integrar (B) a consulta; envio da declaração D com lembrete (CTB-049)
- `confiança`: baixa
- `fontes_verificação`: I-12; D1 achado 5
- `nota_rodada2`: Certidões [R2]: Infosimples R$ 0,20 a R$ 0,09 por consulta, franquia mínima R$ 100/mês; CNDs do eCND da Alterdata por API (I-12)

#### SOC-020 · Formalizar o tratamento de dados e a carta de responsabilidade
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-13); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: B (assinatura)
- `integrações`: I-13
- `credencial_exigida`: token do provedor
- `preço`: por envelope `[NÃO VERIFICADO]`
- `limites_e_riscos`: base normativa da carta não conferida (D1 lacuna 9)
- `alternativa`: aceite eletrônico no portal
- `veredito`: integrar (mesmo fluxo de SOC-016)
- `confiança`: baixa
- `fontes_verificação`: I-13
- `nota_rodada2`: Assinatura [R2]: com API a partir de R$ 69/mês (Clicksign Start), R$ 69,90 (ZapSign Equipe) e R$ 79,90 (D4Sign Profissional), faixa de 20 docs/mês (I-13)

#### SOC-021 · Conduzir o onboarding do cliente
- `status`: conferido em parte na rodada 2
- `nível_automação`: construir (fluxo no app do cliente) + B (WhatsApp, assinatura, captura, core)
- `integrações`: app do cliente (premissa 1): envio do **A1 obrigatório**, contrato (I-13 [R2]), opt-in de WhatsApp (I-05 [R2]), extrato OFX (I-10/I-11); cadastro da empresa no core e geração da **chave de API do Onvio** para a empresa (I-01 [R2]) ou vínculo no eContador (I-02 [R2]); início da captura de XML no dia do onboarding [D3 achado 2]; concorrentes com app de marca própria: Acessórias, HubStrom [R2]
- `credencial_exigida`: A1 do cliente, chave Onvio por empresa (Domínio), token ePlugin do escritório (Alterdata), autorização RFB (V1)
- `preço`: soma dos itens; Open Finance com piso de R$ 2.500/mês na Pluggy [R2] fica fora do MVP
- `limites_e_riscos`: cada pendência vira tarefa com prazo e cobrança no app
- `alternativa`: checklist manual
- `veredito`: construir (orquestração) e integrar (componentes)
- `confiança`: média
- `fontes_verificação`: I-01, I-02, I-05, I-10, I-13, I-17

#### SOC-023 · Receber o acervo e a responsabilidade do contador anterior
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-01, I-02, I-03); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: F (importar backups/arquivos do core anterior) + D
- `integrações`: exportação/importação entre cores (I-01, I-02, I-03): formatos de exportação de plano de contas, saldos e cadastros `[NÃO ENCONTRADO]`; SPED (ECD/EFD) como formato neutro de migração `[NÃO VERIFICADO — conhecimento prévio]`
- `credencial_exigida`: nenhuma de API; arquivos entregues pelo contador anterior
- `preço`: —
- `limites_e_riscos`: o contador anterior pode entregar só PDFs; ECD/EFD cobrem só o que foi transmitido
- `alternativa`: checklist de documentos (Res. CFC 1.590/2020, D1)
- `veredito`: só checklist + importação de SPED para conferência de saldos
- `confiança`: baixa
- `fontes_verificação`: I-01 a I-03
- `nota_rodada2`: Domínio [R2]: API de entrada para ERPs homologados (NF-e, NFC-e, NFS-e, CF-e, CT-e, pagamentos/recebimentos, rubricas da folha), chave por empresa no Onvio Gestão > API, especificação entregue a parceiro cadastrado; Domínio Processos e Portal do Cliente sem API de saída pública `[NÃO ENCONTRADO]` (I-01) · Alterdata [R2]: API ePlugin com token do escritório (exige eContador Master): tarefas, documentos, CNDs, empresas, funcionários, movimentos da folha, admissão, férias, rescisão, atendimentos, recálculo de DAS, lançamentos contábeis em TXT (I-02) · Contmatic [R2]: nenhuma API pública; integra com Busca Legal, Acessórias, Jettax e Contbank; módulo Gestão do Escritório nos planos Avançado/Elite (I-03)

#### SOC-024 · Conduzir o offboarding do cliente
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-01, I-02, I-03, I-13); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: F (pacote de exportação) + B (distrato assinado)
- `integrações`: I-13 (distrato), exportação do acervo do core (I-01 a I-03) e dos XMLs (NFE-036)
- `credencial_exigida`: token do provedor de assinatura
- `preço`: `[NÃO VERIFICADO]`
- `limites_e_riscos`: revogar acessos, procurações e consentimentos (Open Finance, autorizações RFB) no mesmo fluxo
- `alternativa`: checklist
- `veredito`: construir
- `confiança`: média
- `fontes_verificação`: I-13
- `nota_rodada2`: Domínio [R2]: API de entrada para ERPs homologados (NF-e, NFC-e, NFS-e, CF-e, CT-e, pagamentos/recebimentos, rubricas da folha), chave por empresa no Onvio Gestão > API, especificação entregue a parceiro cadastrado; Domínio Processos e Portal do Cliente sem API de saída pública `[NÃO ENCONTRADO]` (I-01) · Alterdata [R2]: API ePlugin com token do escritório (exige eContador Master): tarefas, documentos, CNDs, empresas, funcionários, movimentos da folha, admissão, férias, rescisão, atendimentos, recálculo de DAS, lançamentos contábeis em TXT (I-02) · Contmatic [R2]: nenhuma API pública; integra com Busca Legal, Acessórias, Jettax e Contbank; módulo Gestão do Escritório nos planos Avançado/Elite (I-03) · Assinatura [R2]: com API a partir de R$ 69/mês (Clicksign Start), R$ 69,90 (ZapSign Equipe) e R$ 79,90 (D4Sign Profissional), faixa de 20 docs/mês (I-13)

#### SOC-034 · Guardar documentos societários e atender pedidos de documento
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-05, I-17); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: construir (GED próprio) + B (envio por WhatsApp)
- `integrações`: armazenamento (S3/Drive/OneDrive, Plano 3.3); I-05 para enviar documento ao cliente; concorrentes Acessórias GED [D1:F30], HubStrom DriveHub [D1:F33]
- `credencial_exigida`: —
- `preço`: armazenamento `[NÃO VERIFICADO]`; mensagem de serviço gratuita quando o cliente pede (janela aberta) `[NÃO VERIFICADO]`
- `limites_e_riscos`: tamanho máximo de documento no WhatsApp `[NÃO VERIFICADO]`
- `alternativa`: link do portal
- `veredito`: construir
- `confiança`: média
- `fontes_verificação`: I-05, I-17
- `nota_rodada2`: WhatsApp [R2, tabela de 01/10/2026]: marketing R$ 0,3217; utilidade, autenticação e serviço R$ 0,035; 1.000 mensagens de serviço grátis por número/mês; **desde 01/10/2026 respostas acima da franquia e modelos de utilidade dentro da janela são cobrados** (o que esta ficha diz sobre gratuidade na janela fica corrigido por esta nota); Groups API até 8 participantes (I-05) · Concorrentes [R2]: Acessórias com API por token, MCP, app white label e Área VIP; HubStrom com AppHub; e-Kontroll com e-Monitor (tempo da equipe); SIEG a partir de R$ 223/mês (I-17)

#### SOC-041 · Realizar a reunião anual de aprovação de contas
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-13); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: B (assinatura da ata ou decisão escrita de todos os sócios) + D (registro na Junta, V2)
- `integrações`: I-13
- `credencial_exigida`: token do provedor; exigência de assinatura qualificada na Junta (V2)
- `preço`: `[NÃO VERIFICADO]`
- `limites_e_riscos`: Junta pode não aceitar assinatura simples de provedor privado; conferir por UF (V2)
- `alternativa`: assinatura gov.br pelos sócios
- `veredito`: integrar (B) para a decisão interna; registro fica com V2
- `confiança`: baixa
- `fontes_verificação`: I-13; [D5:T7]
- `nota_rodada2`: Assinatura [R2]: com API a partir de R$ 69/mês (Clicksign Start), R$ 69,90 (ZapSign Equipe) e R$ 79,90 (D4Sign Profissional), faixa de 20 docs/mês (I-13)

### 2.2 D2 · Fiscal e Obrigações

#### FIS-001 · Gerar o calendário mensal de obrigações de cada cliente
- `status`: conferido em parte na rodada 2 (premissa 2 aplicada)
- `nível_automação`: construir (regra versionada) + **B para importar as tarefas já parametrizadas nos cores** (premissa 2)
- `integrações`: Alterdata ePlugin `GET /api/v1/integracao/historico-tarefas` (nome, prazo legal, prazo de entrega, responsável, status, empresa, departamento) [R2]; Domínio Processos (tarefas e calendário de obrigações) sem API de saída pública `[NÃO ENCONTRADO]` [R2]; Contmatic Gestão do Escritório sem API pública `[NÃO ENCONTRADO]` [R2]; Acessórias expõe "entregas" e "processos" por API própria [R2]
- `credencial_exigida`: token ePlugin (Alterdata); contrato a negociar (TR, Contmatic)
- `preço`: ePlugin exige eContador Master `[PREÇO NÃO PÚBLICO]`
- `limites_e_riscos`: o calendário próprio derivado da norma (M1) segue como referência para conferir o que o core gerou
- `alternativa`: construir sem core
- `veredito`: construir + importar do core onde houver API (Alterdata já; Domínio e Contmatic após negociação)
- `confiança`: alta (Alterdata) / média (demais)
- `fontes_verificação`: I-01, I-02, I-03, I-17

#### FIS-003 · Comprovar a entrega: anexar recibo de transmissão e dar baixa na tarefa
- `status`: conferido em parte na rodada 2
- `nível_automação`: A/A$ (recibo pelo governo, V1) + B (status da tarefa no core) ou F
- `integrações`: Alterdata ePlugin devolve `status` (A fazer, Concluído, Atrasada, Risco de multas, Enviado) e `dataConclusao` por tarefa [R2]; Domínio Processos baixa a tarefa quando a rotina é concluída no Domínio e envia os anexos ao Portal do Cliente [R2], sem API de saída pública `[NÃO ENCONTRADO]`
- `credencial_exigida`: token ePlugin; TR a negociar
- `preço`: —
- `limites_e_riscos`: casar recibo ↔ cliente ↔ obrigação
- `alternativa`: upload manual com leitura automática do recibo
- `veredito`: integrar (B na Alterdata, F/negociar no Domínio) + V1
- `confiança`: alta (Alterdata) / média (Domínio)
- `fontes_verificação`: I-01, I-02

#### FIS-010 · Emitir o DAS e enviar ao cliente
- `status`: conferido em parte na rodada 2 (preço Meta e ePlugin; revenda do Integra Contador mantida da rodada 1)
- `nível_automação`: A$ (emissão, V1) + B (envio por WhatsApp e pelo app)
- `integrações`: I-05 modelo de utilidade com documento; Alterdata ePlugin recalcula DAS vencido pelo e-CAC e devolve o PDF (1 por empresa por dia) [R2]; revenda do Integra Contador a R$ 0,75 por DAS (2025) [D2:S5]
- `credencial_exigida`: número oficial verificado; opt-in
- `preço`: **R$ 0,035 por modelo de utilidade** fora da janela; desde 01/10/2026 também dentro da janela [R2]; grátis se enviado em resposta dentro das 1.000 mensagens de serviço do mês (mensagem livre com o PDF, não modelo) [R2]
- `limites_e_riscos`: modelo reclassificado como marketing custaria R$ 0,3217 [R2]; texto transacional
- `alternativa`: publicar no app com confirmação de leitura (GES-039)
- `veredito`: integrar
- `confiança`: alta (preço Meta)
- `fontes_verificação`: I-02, I-05

#### FIS-016 · Emitir e enviar o DAS-MEI em lote
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-05); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: A$ (V1) + B (WhatsApp)
- `integrações`: I-05 (envio em lote de utilidade)
- `credencial_exigida`: opt-in de cada MEI
- `preço`: custo por mensagem × nº de MEIs `[NÃO VERIFICADO]`; para carteira grande de MEI o custo da mensagem pode superar a margem
- `limites_e_riscos`: limite diário de envios por qualidade do número (I-05)
- `alternativa`: link fixo do PGMEI + lembrete por e-mail; Pix Copia e Cola no DAS
- `veredito`: integrar, com teto de custo por cliente
- `confiança`: baixa
- `fontes_verificação`: I-05
- `nota_rodada2`: WhatsApp [R2, tabela de 01/10/2026]: marketing R$ 0,3217; utilidade, autenticação e serviço R$ 0,035; 1.000 mensagens de serviço grátis por número/mês; **desde 01/10/2026 respostas acima da franquia e modelos de utilidade dentro da janela são cobrados** (o que esta ficha diz sobre gratuidade na janela fica corrigido por esta nota); Groups API até 8 participantes (I-05)

#### FIS-030 · Vigiar a situação cadastral (CNPJ, IE, inscrição municipal) e omissões
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-12); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: B para IE/municipal por agregador; federal V1
- `integrações`: I-12
- `credencial_exigida`: token-esc
- `preço`: `[NÃO VERIFICADO]`
- `limites_e_riscos`: ver SOC-003 (mesma ferramenta)
- `alternativa`: V2 (cadastro Sefaz)
- `veredito`: unificar com SOC-003
- `confiança`: baixa
- `fontes_verificação`: I-12
- `nota_rodada2`: Certidões [R2]: Infosimples R$ 0,20 a R$ 0,09 por consulta, franquia mínima R$ 100/mês; CNDs do eCND da Alterdata por API (I-12)

#### FIS-031 · Operar a central de guias: receber, identificar, enviar e protocolar
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-01, I-02, I-05, I-17); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: F (ler a pasta de guias geradas pelo core) + B (envio WhatsApp/e-mail) + construir (leitura do PDF, protocolo)
- `integrações`: I-01/I-02 (pasta de saída do core); I-05; concorrentes Acessórias e-Contínuo e Protocolo Digital [D2:C1][D1:F29], Gestta Express [D2:C2], Omie ValidaPDF [D2:C11]
- `credencial_exigida`: acesso à pasta de rede/nuvem do core
- `preço`: mensagens de utilidade `[NÃO VERIFICADO]`; concorrentes `[NÃO ENCONTRADO]`
- `limites_e_riscos`: identificação do cliente pelo PDF (CNPJ, código de barras, competência); guia com valor errado enviada é risco de imagem
- `alternativa`: upload manual com leitura automática
- `veredito`: construir + integrar — é o "último quilômetro" que todos os concorrentes atacam; competir em IA e protocolo
- `confiança`: média
- `fontes_verificação`: I-01, I-02, I-05, I-17
- `nota_rodada2`: Domínio [R2]: API de entrada para ERPs homologados (NF-e, NFC-e, NFS-e, CF-e, CT-e, pagamentos/recebimentos, rubricas da folha), chave por empresa no Onvio Gestão > API, especificação entregue a parceiro cadastrado; Domínio Processos e Portal do Cliente sem API de saída pública `[NÃO ENCONTRADO]` (I-01) · Alterdata [R2]: API ePlugin com token do escritório (exige eContador Master): tarefas, documentos, CNDs, empresas, funcionários, movimentos da folha, admissão, férias, rescisão, atendimentos, recálculo de DAS, lançamentos contábeis em TXT (I-02) · WhatsApp [R2, tabela de 01/10/2026]: marketing R$ 0,3217; utilidade, autenticação e serviço R$ 0,035; 1.000 mensagens de serviço grátis por número/mês; **desde 01/10/2026 respostas acima da franquia e modelos de utilidade dentro da janela são cobrados** (o que esta ficha diz sobre gratuidade na janela fica corrigido por esta nota); Groups API até 8 participantes (I-05) · Concorrentes [R2]: Acessórias com API por token, MCP, app white label e Área VIP; HubStrom com AppHub; e-Kontroll com e-Monitor (tempo da equipe); SIEG a partir de R$ 223/mês (I-17)

#### FIS-032 · Confirmar o pagamento das guias e cobrar o cliente
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-05, I-10); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: A$ (consulta de pagamentos federais, V1) + B (Open Finance do cliente) + D
- `integrações`: I-10 (transações da conta do cliente para casar com o código de barras/valor); I-05 (cobrança utilidade)
- `credencial_exigida`: consent-cli
- `preço`: Open Finance com mínimo mensal (I-10) `[NÃO VERIFICADO]`
- `limites_e_riscos`: Open Finance mostra a saída do dinheiro, não a quitação no órgão; histórico de 12 meses [D5:T12]; guia estadual/municipal sem consulta oficial de pagamento (V2)
- `alternativa`: pedir comprovante pelo WhatsApp e ler o PDF
- `veredito`: integrar V1 para federal; Open Finance como reforço quando já contratado para o Contábil
- `confiança`: baixa
- `fontes_verificação`: I-10, I-05
- `correção`: a ficha cita "Open Finance" como meio de confirmar pagamento; isso confirma o débito na conta, não a baixa no órgão. Para tributos federais, a fonte de quitação é V1
- `nota_rodada2`: WhatsApp [R2, tabela de 01/10/2026]: marketing R$ 0,3217; utilidade, autenticação e serviço R$ 0,035; 1.000 mensagens de serviço grátis por número/mês; **desde 01/10/2026 respostas acima da franquia e modelos de utilidade dentro da janela são cobrados** (o que esta ficha diz sobre gratuidade na janela fica corrigido por esta nota); Groups API até 8 participantes (I-05) · Open Finance [R2]: Pluggy a partir de R$ 2.500/mês (Dados), Belvo Launch US$ 1.000/mês (I-10)

#### FIS-033 · Enviar ao cliente o resumo mensal fiscal
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-05); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: construir + B
- `integrações`: I-05 (modelo de utilidade com link para o portal)
- `credencial_exigida`: opt-in
- `preço`: `[NÃO VERIFICADO]`
- `limites_e_riscos`: resumo com conteúdo informativo pode ser classificado como marketing; manter transacional
- `alternativa`: e-mail
- `veredito`: construir
- `confiança`: baixa
- `fontes_verificação`: I-05
- `nota_rodada2`: WhatsApp [R2, tabela de 01/10/2026]: marketing R$ 0,3217; utilidade, autenticação e serviço R$ 0,035; 1.000 mensagens de serviço grátis por número/mês; **desde 01/10/2026 respostas acima da franquia e modelos de utilidade dentro da janela são cobrados** (o que esta ficha diz sobre gratuidade na janela fica corrigido por esta nota); Groups API até 8 participantes (I-05)

#### FIS-036 · Emitir, monitorar a validade e entregar certidões negativas
- `status`: conferido em parte na rodada 2 (Infosimples e Alterdata eCND)
- `nível_automação`: B (agregador) + A$ (federal, V1) + B (ler CNDs que o core já controla)
- `integrações`: Infosimples (I-12) [R2]; Alterdata ePlugin `GET /api/v1/integracao/certidoes` (CNDs do eCND, com arquivo em base64, abrangência, emissão, vencimento, status) [R2]; Domínio Portal do Cliente controla CNDs dos clientes [R2]; HubCount, Jettax, Dootax, Makro CND, e-Auditoria (rodada 1)
- `credencial_exigida`: token-esc
- `preço`: **Infosimples: R$ 0,20 por consulta nas primeiras 500 do mês, caindo até R$ 0,09; franquia mínima R$ 100/mês** [R2]; ~R$ 212/mês para 1.200 consultas (cálculo sobre a tabela)
- `limites_e_riscos`: portais instáveis; consultas "nada consta" são cobradas [R2]
- `alternativa`: ler as CNDs que o core do escritório já emite (Alterdata), sem custo de consulta adicional
- `veredito`: comprar (B) + ler do core onde houver
- `confiança`: alta (preço Infosimples, endpoint Alterdata)
- `fontes_verificação`: I-02, I-12, I-17

#### FIS-037 · Diagnosticar e resolver o que impede a certidão
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-12, I-17); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: A$ (relatório de situação fiscal, V1) + construir (IA lê e explica) + D
- `integrações`: agregador devolve só o PDF/status da certidão (I-12); o diagnóstico vem de V1
- `credencial_exigida`: V1
- `preço`: —
- `limites_e_riscos`: nenhum concorrente encontrado faz o diagnóstico com IA (D2 leitura de mercado)
- `alternativa`: checklist por tipo de pendência
- `veredito`: construir (diferencial)
- `confiança`: média
- `fontes_verificação`: I-12, I-17
- `nota_rodada2`: Certidões [R2]: Infosimples R$ 0,20 a R$ 0,09 por consulta, franquia mínima R$ 100/mês; CNDs do eCND da Alterdata por API (I-12) · Concorrentes [R2]: Acessórias com API por token, MCP, app white label e Área VIP; HubStrom com AppHub; e-Kontroll com e-Monitor (tempo da equipe); SIEG a partir de R$ 223/mês (I-17)

#### FIS-038 · Tratar intimações e notificações fiscais
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-05, I-13); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: V1/V2 para leitura; B para avisar o cliente e colher documentos
- `integrações`: I-05 (utilidade), I-13 (assinatura de procuração/defesa, quando cabível)
- `credencial_exigida`: opt-in
- `preço`: `[NÃO VERIFICADO]`
- `limites_e_riscos`: conteúdo sigiloso por WhatsApp: enviar resumo e link autenticado, não o documento inteiro
- `alternativa`: e-mail/portal
- `veredito`: integrar
- `confiança`: baixa
- `fontes_verificação`: I-05, I-13
- `nota_rodada2`: WhatsApp [R2, tabela de 01/10/2026]: marketing R$ 0,3217; utilidade, autenticação e serviço R$ 0,035; 1.000 mensagens de serviço grátis por número/mês; **desde 01/10/2026 respostas acima da franquia e modelos de utilidade dentro da janela são cobrados** (o que esta ficha diz sobre gratuidade na janela fica corrigido por esta nota); Groups API até 8 participantes (I-05) · Assinatura [R2]: com API a partir de R$ 69/mês (Clicksign Start), R$ 69,90 (ZapSign Equipe) e R$ 79,90 (D4Sign Profissional), faixa de 20 docs/mês (I-13)

#### FIS-044 · Responder dúvidas fiscais do cliente no WhatsApp
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-05, I-07); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: B (canal) + construir (IA M1/M2 com escalonamento)
- `integrações`: I-05, I-07
- `credencial_exigida`: número oficial
- `preço`: respostas dentro da janela de 24 h aberta pelo cliente sem custo de mensagem `[NÃO VERIFICADO — conhecimento prévio]`
- `limites_e_riscos`: política de IA da Meta (I-05): pergunta legal aberta vira rascunho para o contador aprovar (GES-028), não resposta livre; registrar autoria
- `alternativa`: atendimento humano com rascunho da IA
- `veredito`: construir sobre B
- `confiança`: baixa (política de IA não reaberta)
- `fontes_verificação`: I-05, I-07
- `nota_rodada2`: WhatsApp [R2, tabela de 01/10/2026]: marketing R$ 0,3217; utilidade, autenticação e serviço R$ 0,035; 1.000 mensagens de serviço grátis por número/mês; **desde 01/10/2026 respostas acima da franquia e modelos de utilidade dentro da janela são cobrados** (o que esta ficha diz sobre gratuidade na janela fica corrigido por esta nota); Groups API até 8 participantes (I-05) · Chatwoot [R2]: MIT fora do diretório `enterprise/` (I-07)

#### FIS-047 · Acompanhar o fechamento fiscal do mês por equipe e cliente
- `status`: conferido em parte na rodada 2
- `nível_automação`: construir + **B** (status lido dos módulos de processos dos cores, premissa 2)
- `integrações`: Alterdata histórico de tarefas por período, com responsável e departamento [R2]; Domínio Processos tem dashboard e relatórios de produtividade por departamento, sem API pública `[NÃO ENCONTRADO]` [R2]; Contmatic Gestão do Escritório `[NÃO ENCONTRADO]` API [R2]
- `credencial_exigida`: token ePlugin; TR e Contmatic a negociar
- `preço`: —
- `limites_e_riscos`: sem API do Domínio, status depende de evento da plataforma; agente de desktop só como último recurso (premissa 3)
- `alternativa`: baixa manual
- `veredito`: construir sobre B
- `confiança`: alta (Alterdata) / média
- `fontes_verificação`: I-01, I-02, I-03

### 2.3 D3 · Notas fiscais e documentos fiscais

#### NFE-001 · Configurar a captura de documentos fiscais de cada cliente
- `status`: conferido em parte na rodada 2
- `nível_automação`: construir sobre A (V2)
- `integrações`: SIEG (a partir de R$ 223/mês) [R2]; Qive (sob consulta) [R2]; HubStrom XMLHub (NF-e/NFC-e de 23 estados, NFS-e Portal Nacional, CT-e) [R2]; NFE.io, Jettax, e-Auditoria (rodada 1)
- `credencial_exigida`: **A1 do cliente enviado no app** (premissa 1) + autXML do escritório como complemento para NF-e
- `preço`: SIEG Control a partir de R$ 223/mês [R2]; Qive `[PREÇO NÃO PÚBLICO]` (o R$ 153 da rodada 1 não se confirmou)
- `limites_e_riscos`: custódia do A1 (SOC-008); captura começa no onboarding
- `alternativa`: comprar de terceiro enquanto o coletor próprio não fica pronto
- `veredito`: construir com plano B comprado
- `confiança`: média
- `fontes_verificação`: I-15
- `correção`: retirado o preço da Qive (R$ 153/mês, de comparador); a página oficial não publica preço

#### NFE-002 · Pedir ao cliente que inclua o escritório no campo autXML do emissor
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-05, I-16); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: B (mensagem guiada) + D
- `integrações`: I-05; ERPs/emissores do cliente (I-16) — configuração do autXML em Omie, Bling, Conta Azul por API: `[NÃO ENCONTRADO]`
- `credencial_exigida`: —
- `preço`: `[NÃO VERIFICADO]`
- `limites_e_riscos`: depende de o cliente fazer; tutorial por emissor
- `alternativa`: captura pelo certificado do cliente
- `veredito`: só checklist + lembrete com tutorial
- `confiança`: baixa
- `fontes_verificação`: I-05, I-16
- `nota_rodada2`: WhatsApp [R2, tabela de 01/10/2026]: marketing R$ 0,3217; utilidade, autenticação e serviço R$ 0,035; 1.000 mensagens de serviço grátis por número/mês; **desde 01/10/2026 respostas acima da franquia e modelos de utilidade dentro da janela são cobrados** (o que esta ficha diz sobre gratuidade na janela fica corrigido por esta nota); Groups API até 8 participantes (I-05) · ERPs [R2]: Conta Azul e Omie integram ao Domínio pela API com chave do Onvio Gestão (I-16)

#### NFE-004 · Capturar as NF-e de entrada
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-15); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: A (V2) — mercado como plano B
- `integrações`: NFE.io distribuição por NSU [D3:C8]; Fiscal.io [D3:C4]
- `credencial_exigida`: A1 do cliente
- `preço`: `[PREÇO NÃO PÚBLICO]`
- `limites_e_riscos`: comprar significa entregar o A1 a mais um terceiro
- `alternativa`: comprar se o coletor próprio atrasar
- `veredito`: construir
- `confiança`: média
- `fontes_verificação`: I-15
- `nota_rodada2`: DF-e [R2]: Jettax e Fiscal.io entregam ao Domínio pela API (fila de 60 dias); SIEG a partir de R$ 223/mês; Qive sem preço público (I-15)

#### NFE-005 · Obter as notas de saída emitidas pelo cliente
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-16); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: A (autXML/V2) + B (API do ERP/emissor do cliente)
- `integrações`: I-16 (Conta Azul, Omie, Bling, Nibo); Conta Azul captura NF-e/NFS-e/NFC-e/CT-e da carteira [D5:C4]
- `credencial_exigida`: chave de API do ERP emitida pelo cliente
- `preço`: `[NÃO VERIFICADO]`
- `limites_e_riscos`: um conector por ERP; só vale para os mais comuns na carteira
- `alternativa`: autXML; SAE-NFC-e em SP (V2)
- `veredito`: integrar (B) os 2–3 ERPs mais frequentes
- `confiança`: baixa
- `fontes_verificação`: I-16
- `nota_rodada2`: ERPs [R2]: Conta Azul e Omie integram ao Domínio pela API com chave do Onvio Gestão (I-16)

#### NFE-008 · Capturar NFS-e de municípios fora do ADN, de emissores próprios e de PDFs
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-15); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: B (integradores, V2) + construir (OCR de PDF)
- `integrações`: Jettax (2.200+ municípios, sem certificado segundo o site) [D3:C6], Kolossus (700+) [D3:C7], Qive (150+ prefeituras) [D2:C14-b], Sovos OCR [D3:C9]
- `credencial_exigida`: login da prefeitura ou certificado (V2)
- `preço`: `[PREÇO NÃO PÚBLICO]`
- `limites_e_riscos`: números de cobertura são dos próprios fornecedores
- `alternativa`: OCR do PDF recebido pelo WhatsApp (NFE-012)
- `veredito`: comprar (B) para os municípios da carteira; ver V2
- `confiança`: baixa
- `fontes_verificação`: I-15; V2
- `nota_rodada2`: DF-e [R2]: Jettax e Fiscal.io entregam ao Domínio pela API (fila de 60 dias); SIEG a partir de R$ 223/mês; Qive sem preço público (I-15)

#### NFE-012 · Receber documentos soltos pelo atendimento e casá-los com os XMLs
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-05); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: B (WhatsApp/e-mail) + construir (classificação e casamento)
- `integrações`: I-05 (mídia recebida por webhook), I-09 (e-mail)
- `credencial_exigida`: —
- `preço`: recebimento sem custo por mensagem `[NÃO VERIFICADO]`
- `limites_e_riscos`: mídia da Cloud API fica disponível por prazo limitado para download `[NÃO VERIFICADO — conhecimento prévio]`: baixar e arquivar imediatamente
- `alternativa`: upload no portal
- `veredito`: construir (diferencial: documento vai sozinho para cliente e tarefa)
- `confiança`: média
- `fontes_verificação`: I-05, I-09
- `nota_rodada2`: WhatsApp [R2, tabela de 01/10/2026]: marketing R$ 0,3217; utilidade, autenticação e serviço R$ 0,035; 1.000 mensagens de serviço grátis por número/mês; **desde 01/10/2026 respostas acima da franquia e modelos de utilidade dentro da janela são cobrados** (o que esta ficha diz sobre gratuidade na janela fica corrigido por esta nota); Groups API até 8 participantes (I-05)

#### NFE-015 · Fazer a manifestação conclusiva no prazo
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-05); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: A (evento na Sefaz, V2) + B (pergunta ao cliente pelo WhatsApp)
- `integrações`: I-05 com modelo de utilidade com botões ("reconheço" / "não reconheço")
- `credencial_exigida`: A1 do cliente para o evento; opt-in
- `preço`: 1 mensagem por lote de notas `[NÃO VERIFICADO]`
- `limites_e_riscos`: nenhum concorrente encontrado pergunta ao cliente pelo WhatsApp [D3 concorrentes] — diferencial; prazo de 90 dias [D3 achado 1]
- `alternativa`: lista no portal
- `veredito`: construir + integrar
- `confiança`: média
- `fontes_verificação`: I-05; [D3:S3]
- `nota_rodada2`: WhatsApp [R2, tabela de 01/10/2026]: marketing R$ 0,3217; utilidade, autenticação e serviço R$ 0,035; 1.000 mensagens de serviço grátis por número/mês; **desde 01/10/2026 respostas acima da franquia e modelos de utilidade dentro da janela são cobrados** (o que esta ficha diz sobre gratuidade na janela fica corrigido por esta nota); Groups API até 8 participantes (I-05)

#### NFE-028 · Verificar a regularidade cadastral dos emitentes na data da operação
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-12); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: A (cadastro Sefaz, V2) + B (agregador para histórico/situação)
- `integrações`: I-12; Qive Portal de Fornecedores [D6:C5]
- `credencial_exigida`: token-esc
- `preço`: custo por CNPJ consultado `[NÃO VERIFICADO]`; fazer cache por fornecedor
- `limites_e_riscos`: situação "na data da operação" exige histórico, que agregadores nem sempre têm `[NÃO VERIFICADO]`
- `alternativa`: consulta só de novos fornecedores
- `veredito`: integrar V2; agregador opcional
- `confiança`: baixa
- `fontes_verificação`: I-12
- `nota_rodada2`: Certidões [R2]: Infosimples R$ 0,20 a R$ 0,09 por consulta, franquia mínima R$ 100/mês; CNDs do eCND da Alterdata por API (I-12)

#### NFE-033 · Organizar e enviar os XMLs ao core (lote, pasta, API)
- `status`: conferido na rodada 2 (Domínio e Alterdata); Contmatic sem API
- `nível_automação`: **B (Domínio, via parceria de ERP homologado)**; F (Alterdata e Contmatic)
- `integrações`: Domínio recebe NF-e, NFC-e, NFS-e, CF-e e CT-e "por meio de APIs de integração" de ERPs homologados; parceiro se cadastra no formulário da TR para receber a especificação; chave por empresa no Onvio Gestão; documentos ficam até 60 dias na "Importação API" e podem ser importados por rotina automática [R2][R2-sec]; usado por Jettax, Fiscal.io, Omie, Conta Azul [R2][R2-sec]. Alterdata: a API ePlugin **não** tem endpoint de envio de XML `[NÃO ENCONTRADO]`; segue a rotina por pasta [D3:S21] (rodada 1). Contmatic: `[NÃO ENCONTRADO]`
- `credencial_exigida`: Domínio: homologação como parceiro + chave por empresa gerada pelo escritório [R2]; demais: pasta compartilhada
- `preço`: custo do programa de parceiros da TR `[PREÇO NÃO PÚBLICO]`
- `limites_e_riscos`: Agente de Comunicação do Domínio precisa estar ativo [R2]; prazo de 60 dias na fila [R2-sec]
- `alternativa`: download em ZIP para o analista importar
- `veredito`: **cadastrar a plataforma como parceira no formulário da TR** (B); F para Alterdata e Contmatic
- `confiança`: alta (Domínio, existência e mecânica) / média (prazo de 60 dias, fonte de parceiro)
- `fontes_verificação`: I-01, I-02, I-03, I-15, I-16
- `correção`: a rodada 1 tratava a API Onvio como indício; agora está confirmada na página oficial da TR, com o caminho de homologação

#### NFE-034 · Manter o de-para de CFOP, acumuladores e produtos e tratar erros de importação
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-01); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: F (exportar/importar tabelas de acumuladores) + construir (pré-validação)
- `integrações`: Domínio: guias de CFOP e acumuladores, exceções por fornecedor/produto; erro "relação de acumulador para o CFOP/CST" [D3:S20]; Alterdata: equivalente `[NÃO VERIFICADO]`
- `credencial_exigida`: acesso aos relatórios do core
- `preço`: —
- `limites_e_riscos`: tabela de acumuladores é por empresa e muda; leitura do relatório de erros exportado (F)
- `alternativa`: pré-validação só pelo CFOP/CST do XML
- `veredito`: construir (diferencial: pré-validação antes da importação)
- `confiança`: média
- `fontes_verificação`: I-01; [D3:S20]
- `nota_rodada2`: Domínio [R2]: API de entrada para ERPs homologados (NF-e, NFC-e, NFS-e, CF-e, CT-e, pagamentos/recebimentos, rubricas da folha), chave por empresa no Onvio Gestão > API, especificação entregue a parceiro cadastrado; Domínio Processos e Portal do Cliente sem API de saída pública `[NÃO ENCONTRADO]` (I-01)

#### NFE-035 · Conferir o que entrou no core contra os XMLs
- `status`: mantido da rodada 1 (não conferido), com nota da rodada 2
- `nível_automação`: F (relatório exportado do core)
- `integrações`: I-01 a I-03; a API de entrada do Domínio tem tela de status/histórico no lado do parceiro (Omie mostra "status de cada envio") [R2-sec], mas retorno de escrituração para o parceiro `[NÃO ENCONTRADO]`
- `credencial_exigida`: —
- `preço`: —
- `limites_e_riscos`: sem API de leitura do core, depende do analista exportar o relatório ou do SPED
- `alternativa`: comparar com a EFD transmitida (V1)
- `veredito`: construir sobre F
- `confiança`: baixa
- `fontes_verificação`: I-01 a I-03

#### NFE-036 · Guardar os XMLs pelo prazo legal e entregar pacotes
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-15); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: construir (armazenamento próprio)
- `integrações`: concorrentes SIEG (cofre), Qive (armazenar e consultar) [I-15]
- `credencial_exigida`: —
- `preço`: armazenamento em nuvem `[NÃO VERIFICADO]`
- `limites_e_riscos`: prazo 5 × 11 anos em conflito (V2/D3 achado 6)
- `alternativa`: —
- `veredito`: construir
- `confiança`: média
- `fontes_verificação`: I-15
- `nota_rodada2`: DF-e [R2]: Jettax e Fiscal.io entregam ao Domínio pela API (fila de 60 dias); SIEG a partir de R$ 223/mês; Qive sem preço público (I-15)

#### NFE-037 · Atender pedidos do cliente sobre notas
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-05, I-07); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: B (WhatsApp) + construir (IA consulta o repositório)
- `integrações`: I-05, I-07
- `credencial_exigida`: —
- `preço`: dentro da janela, sem custo `[NÃO VERIFICADO]`
- `limites_e_riscos`: confirmar identidade do solicitante antes de enviar documento fiscal
- `alternativa`: portal com busca
- `veredito`: construir
- `confiança`: média
- `fontes_verificação`: I-05
- `nota_rodada2`: WhatsApp [R2, tabela de 01/10/2026]: marketing R$ 0,3217; utilidade, autenticação e serviço R$ 0,035; 1.000 mensagens de serviço grátis por número/mês; **desde 01/10/2026 respostas acima da franquia e modelos de utilidade dentro da janela são cobrados** (o que esta ficha diz sobre gratuidade na janela fica corrigido por esta nota); Groups API até 8 participantes (I-05) · Chatwoot [R2]: MIT fora do diretório `enterprise/` (I-07)

#### NFE-038 · Cobrar do cliente os documentos fiscais que faltam
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-05, I-17); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: B + construir (régua)
- `integrações`: I-05 (utilidade); concorrentes Questor Tareffa (3 lembretes) [D5:C1], Acessórias, Gestta
- `credencial_exigida`: opt-in
- `preço`: régua de 3 lembretes × clientes × meses `[NÃO VERIFICADO]`
- `limites_e_riscos`: cobrança repetida derruba a qualidade do número (I-05); limitar frequência
- `alternativa`: e-mail
- `veredito`: construir
- `confiança`: média
- `fontes_verificação`: I-05, I-17
- `nota_rodada2`: WhatsApp [R2, tabela de 01/10/2026]: marketing R$ 0,3217; utilidade, autenticação e serviço R$ 0,035; 1.000 mensagens de serviço grátis por número/mês; **desde 01/10/2026 respostas acima da franquia e modelos de utilidade dentro da janela são cobrados** (o que esta ficha diz sobre gratuidade na janela fica corrigido por esta nota); Groups API até 8 participantes (I-05) · Concorrentes [R2]: Acessórias com API por token, MCP, app white label e Área VIP; HubStrom com AppHub; e-Kontroll com e-Monitor (tempo da equipe); SIEG a partir de R$ 223/mês (I-17)

#### NFE-039 · Emitir notas fiscais pelo cliente (por demanda)
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-15); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: B
- `integrações`: Focus NFe, PlugNotas, NFE.io, eNotas (I-15); NFS-e nacional por API (V1)
- `credencial_exigida`: A1 do cliente; contrato com o integrador
- `preço`: `[NÃO VERIFICADO]` (por nota ou plano)
- `limites_e_riscos`: responsabilidade pela emissão errada; o Plano já diz "não construir emissor"
- `alternativa`: emissor gratuito da Sefaz/Emissor Nacional operado pelo analista (D)
- `veredito`: comprar (B), só se a demanda existir
- `confiança`: baixa
- `fontes_verificação`: I-15
- `nota_rodada2`: DF-e [R2]: Jettax e Fiscal.io entregam ao Domínio pela API (fila de 60 dias); SIEG a partir de R$ 223/mês; Qive sem preço público (I-15)

### 2.4 D4 · Trabalhista e DP

#### DP-001 · Receber a solicitação de admissão do cliente e validar os dados mínimos
- `status`: conferido em parte na rodada 2
- `nível_automação`: construir (app/WhatsApp com validação) + **B para gravar no core** (Alterdata)
- `integrações`: Alterdata ePlugin `POST /api/v1/candidatos` grava na Pré-Admissão do eContador e "integra automaticamente ao módulo de Departamento Pessoal" [R2]; Domínio Portal do Cliente aceita cadastro de empregados pelo cliente [R2] (API para terceiros `[NÃO ENCONTRADO]`); I-05
- `credencial_exigida`: token ePlugin (Alterdata)
- `preço`: mensagens WhatsApp R$ 0,035 (serviço acima da franquia) [R2]
- `limites_e_riscos`: os portais dos cores já fazem isso para quem usa o core; ganho em receber por WhatsApp/app e validar com IA antes de gravar
- `alternativa`: formulário no app
- `veredito`: construir + integrar (B) com a Alterdata
- `confiança`: alta (endpoint Alterdata)
- `fontes_verificação`: I-01, I-02, I-05

#### DP-002 · Coletar e conferir os documentos do empregado
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-05); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: B (WhatsApp) + construir (OCR e conferência)
- `integrações`: I-05; Flash faz coleta admissional pela API do WhatsApp [D4:C8]
- `credencial_exigida`: opt-in do empregado (contato de terceiro, não do cliente)
- `preço`: mensagem iniciada pelo escritório ao empregado = modelo de utilidade `[NÃO VERIFICADO]`
- `limites_e_riscos`: dado pessoal de terceiro (LGPD); contato direto com o empregado precisa de autorização do cliente
- `alternativa`: link de upload enviado pelo cliente ao empregado
- `veredito`: construir + integrar
- `confiança`: média
- `fontes_verificação`: I-05; [D4:C8]
- `nota_rodada2`: WhatsApp [R2, tabela de 01/10/2026]: marketing R$ 0,3217; utilidade, autenticação e serviço R$ 0,035; 1.000 mensagens de serviço grátis por número/mês; **desde 01/10/2026 respostas acima da franquia e modelos de utilidade dentro da janela são cobrados** (o que esta ficha diz sobre gratuidade na janela fica corrigido por esta nota); Groups API até 8 participantes (I-05)

#### DP-005 · Preparar e colher assinatura do contrato e dos termos de admissão
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-13); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: B
- `integrações`: I-13 (Clicksign/D4Sign/ZapSign), Anaclara (WhatsApp) [D4:C10]
- `credencial_exigida`: token do provedor; e-mail ou telefone do empregado
- `preço`: por envelope `[NÃO VERIFICADO]`
- `limites_e_riscos`: validade da assinatura eletrônica simples para contrato de trabalho `[NÃO VERIFICADO]`; CCT pode exigir forma específica
- `alternativa`: assinatura física com upload
- `veredito`: integrar
- `confiança`: baixa
- `fontes_verificação`: I-13
- `nota_rodada2`: Assinatura [R2]: com API a partir de R$ 69/mês (Clicksign Start), R$ 69,90 (ZapSign Equipe) e R$ 79,90 (D4Sign Profissional), faixa de 20 docs/mês (I-13)

#### DP-009 · Pedir e cobrar as variáveis da folha dentro do prazo
- `status`: conferido em parte na rodada 2
- `nível_automação`: B + construir (régua com prazo no app e no WhatsApp)
- `integrações`: I-05 [R2]; concorrentes Acessórias Docs (solicitação e cobrança automática de documentos) [R2], Domínio Processos (cobrança automática de documentos por e-mail) [R2], Alterdata eContador, Onvio Portal
- `credencial_exigida`: opt-in
- `preço`: R$ 0,035 por modelo de utilidade [R2]; ex.: 300 clientes × 3 lembretes = R$ 31,50/mês
- `limites_e_riscos`: maior dor do DP é o que chega atrasado [D4 achado 14]
- `alternativa`: e-mail/app
- `veredito`: construir
- `confiança`: alta (preço) / média
- `fontes_verificação`: I-05, I-17

#### DP-010 · Receber e conferir o espelho de ponto e os arquivos do relógio
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-02); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: F (AFD/AEJ do REP, arquivo padronizado pela Portaria MTP 671/2021 `[NÃO VERIFICADO]`) + B (APIs de fornecedores de ponto, ex. Pontotel, Alterdata ponto) `[NÃO VERIFICADO]`
- `integrações`: Alterdata ponto eletrônico [D4:C12]; importação de ponto nos cores `[NÃO ENCONTRADO]`
- `credencial_exigida`: arquivo enviado pelo cliente ou API do fornecedor de ponto
- `preço`: `[NÃO VERIFICADO]`
- `limites_e_riscos`: muitos fornecedores de ponto, um conector cada
- `alternativa`: upload do AFD/PDF
- `veredito`: F (arquivo padrão) primeiro
- `confiança`: baixa
- `fontes_verificação`: I-02
- `nota_rodada2`: Alterdata [R2]: API ePlugin com token do escritório (exige eContador Master): tarefas, documentos, CNDs, empresas, funcionários, movimentos da folha, admissão, férias, rescisão, atendimentos, recálculo de DAS, lançamentos contábeis em TXT (I-02)

#### DP-011 · Lançar ou importar as variáveis no core
- `status`: conferido na rodada 2 (Domínio e Alterdata); Contmatic sem API
- `nível_automação`: **B** (Alterdata, Domínio) / F (Contmatic)
- `integrações`: Alterdata `POST /api/v1/movimentos` (empresa, funcionário, tipo de movimento, evento, quantidade, período), `POST /api/v1/agendamentos-ferias`, `POST /api/v1/notificacoes-rescisao` [R2]; Domínio **API de Rubricas** ("lançamento de rubricas no módulo Folha") para parceiros homologados [R2]; Contmatic `[NÃO ENCONTRADO]`
- `credencial_exigida`: token ePlugin; homologação TR + chave Onvio por empresa
- `preço`: `[PREÇO NÃO PÚBLICO]` (pacote/parceria)
- `limites_e_riscos`: de-para de rubricas/eventos por empresa continua obrigatório
- `alternativa`: planilha padronizada para o analista digitar (Contmatic)
- `veredito`: integrar (B) nos dois cores com API
- `confiança`: alta
- `fontes_verificação`: I-01, I-02, I-03
- `correção`: rodada 1 dava F com leiaute desconhecido; os dois cores maiores têm API de entrada de variáveis

#### DP-012 · Enviar a prévia da folha ao cliente e registrar a aprovação
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-05); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: B (WhatsApp com botão de aprovação) + construir
- `integrações`: I-05 (modelo de utilidade com botões de resposta rápida)
- `credencial_exigida`: opt-in; lista de quem pode aprovar
- `preço`: `[NÃO VERIFICADO]`
- `limites_e_riscos`: aprovação por WhatsApp como prova: guardar mensagem, número e horário (GES-036)
- `alternativa`: aprovação no portal
- `veredito`: construir
- `confiança`: média
- `fontes_verificação`: I-05
- `nota_rodada2`: WhatsApp [R2, tabela de 01/10/2026]: marketing R$ 0,3217; utilidade, autenticação e serviço R$ 0,035; 1.000 mensagens de serviço grátis por número/mês; **desde 01/10/2026 respostas acima da franquia e modelos de utilidade dentro da janela são cobrados** (o que esta ficha diz sobre gratuidade na janela fica corrigido por esta nota); Groups API até 8 participantes (I-05)

#### DP-019 · Distribuir os holerites aos empregados e registrar a ciência
- `status`: conferido em parte na rodada 2 (preço Meta)
- `nível_automação`: F (PDF do core) + B (WhatsApp/e-mail)
- `integrações`: Domínio Portal do Empregado [D4:C1] (rodada 1); I-05 [R2]
- `credencial_exigida`: opt-in de cada empregado
- `preço`: **R$ 0,035 por empregado por mês** (modelo de utilidade) [R2]: 1.000 empregados = R$ 35/mês
- `limites_e_riscos`: competir só onde o portal do core falha (outros cores, desligados, ciência)
- `alternativa`: portal do empregado com login
- `veredito`: integrar, com custo repassável
- `confiança`: alta (preço) / média
- `fontes_verificação`: I-01, I-05

#### DP-020 · Enviar guias e resumo da folha ao cliente
- `status`: conferido em parte na rodada 2 (preço Meta, documentos Alterdata)
- `nível_automação`: B (ler documentos do core) + B (envio)
- `integrações`: Alterdata `GET /api/v1/integracao/documentos` (guias e relatórios publicados no eContador, com vencimento e status de pagamento) [R2]; Domínio Processos envia anexos da tarefa ao Portal do Cliente [R2]; I-05 [R2]
- `credencial_exigida`: token ePlugin; opt-in
- `preço`: R$ 0,035 por modelo de utilidade [R2]
- `limites_e_riscos`: ver FIS-031
- `alternativa`: e-mail
- `veredito`: unificar com a central de guias
- `confiança`: alta (Alterdata, preço)
- `fontes_verificação`: I-01, I-02, I-05

#### DP-021 · Conferir o pagamento das guias e cobrar o que ficou em aberto
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-10); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: V1 (FGTS Digital sem API conhecida [D4 achado 11]) + B (Open Finance) + D
- `integrações`: I-10
- `credencial_exigida`: consent-cli
- `preço`: `[NÃO VERIFICADO]`
- `limites_e_riscos`: ver FIS-032
- `alternativa`: comprovante pelo WhatsApp
- `veredito`: unificar com FIS-032
- `confiança`: baixa
- `fontes_verificação`: I-10
- `nota_rodada2`: Open Finance [R2]: Pluggy a partir de R$ 2.500/mês (Dados), Belvo Launch US$ 1.000/mês (I-10)

#### DP-022 · Gerar o arquivo ou a lista de pagamento dos salários
- `status`: mantido da rodada 1 (não conferido)
- `nível_automação`: F (CNAB 240 de pagamento, gerado pelo core) + B (Pix em lote pela API do banco do cliente)
- `integrações`: I-11; Open Finance de **iniciação de pagamento** existe, mas pagamento em lote por iniciador `[NÃO VERIFICADO]`
- `credencial_exigida`: credenciais bancárias do cliente (o escritório não deve operar pagamento do cliente)
- `preço`: —
- `limites_e_riscos`: risco de fraude e responsabilidade: o escritório gera o arquivo, quem paga é o cliente
- `alternativa`: lista em PDF/planilha
- `veredito`: F (gerar arquivo); não executar pagamento
- `confiança`: média
- `fontes_verificação`: I-11
- `correção`: a ficha cita "Open Finance" e Pix; manter a plataforma fora da execução do pagamento (só gerar o arquivo) reduz risco jurídico

#### DP-024 · Programar as férias, emitir aviso e recibo e controlar o pagamento antecipado
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-02, I-13); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: construir + B (assinatura do aviso)
- `integrações`: I-13; concorrentes Alterdata eContador/ePessoal (agendamento com validação) [D4:C3][D4:C4], Onvio Portal (solicitação de férias) [D4:C2]
- `credencial_exigida`: token do provedor
- `preço`: `[NÃO VERIFICADO]`
- `limites_e_riscos`: prazo legal do aviso; integração com o core por F
- `alternativa`: aviso impresso
- `veredito`: construir + integrar
- `confiança`: média
- `fontes_verificação`: I-02, I-13
- `nota_rodada2`: Alterdata [R2]: API ePlugin com token do escritório (exige eContador Master): tarefas, documentos, CNDs, empresas, funcionários, movimentos da folha, admissão, férias, rescisão, atendimentos, recálculo de DAS, lançamentos contábeis em TXT (I-02) · Assinatura [R2]: com API a partir de R$ 69/mês (Clicksign Start), R$ 69,90 (ZapSign Equipe) e R$ 79,90 (D4Sign Profissional), faixa de 20 docs/mês (I-13)

#### DP-030 · Montar os documentos rescisórios, colher assinaturas e homologar quando a CCT exige
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-13); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: B (assinatura) + D (homologação sindical)
- `integrações`: I-13
- `credencial_exigida`: token do provedor
- `preço`: `[NÃO VERIFICADO]`
- `limites_e_riscos`: sindicato pode exigir presença ou assinatura própria
- `alternativa`: assinatura física
- `veredito`: integrar
- `confiança`: baixa
- `fontes_verificação`: I-13
- `nota_rodada2`: Assinatura [R2]: com API a partir de R$ 69/mês (Clicksign Start), R$ 69,90 (ZapSign Equipe) e R$ 79,90 (D4Sign Profissional), faixa de 20 docs/mês (I-13)

#### DP-051 · Calcular e solicitar a recarga mensal de VT e VR/VA
- `status`: mantido da rodada 1 (não conferido)
- `nível_automação`: B (APIs de operadoras de benefícios) `[NÃO VERIFICADO]` + F (arquivo de pedido)
- `integrações`: Flash (benefícios) [D4:C8]; demais operadoras `[NÃO ENCONTRADO]`
- `credencial_exigida`: acesso do cliente à operadora
- `preço`: `[NÃO VERIFICADO]`
- `limites_e_riscos`: o pedido e o pagamento são do cliente
- `alternativa`: planilha de pedido no leiaute da operadora
- `veredito`: só checklist + arquivo
- `confiança`: baixa
- `fontes_verificação`: [D4:C8]

#### DP-058 · Responder dúvidas trabalhistas do cliente e do empregado
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-05, I-07); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: B + construir (IA com a CCT do cliente)
- `integrações`: I-05, I-07
- `credencial_exigida`: —
- `preço`: dentro da janela `[NÃO VERIFICADO]`
- `limites_e_riscos`: política de IA (I-05); responder ao empregado em nome do empregador exige regra clara
- `alternativa`: humano com rascunho
- `veredito`: construir
- `confiança`: baixa
- `fontes_verificação`: I-05
- `nota_rodada2`: WhatsApp [R2, tabela de 01/10/2026]: marketing R$ 0,3217; utilidade, autenticação e serviço R$ 0,035; 1.000 mensagens de serviço grátis por número/mês; **desde 01/10/2026 respostas acima da franquia e modelos de utilidade dentro da janela são cobrados** (o que esta ficha diz sobre gratuidade na janela fica corrigido por esta nota); Groups API até 8 participantes (I-05) · Chatwoot [R2]: MIT fora do diretório `enterprise/` (I-07)

#### DP-060 · Manter o arquivo digital do empregado e controlar a guarda dos documentos
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-01, I-02); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: construir
- `integrações`: armazenamento; concorrentes Onvio (só documentos do core), Alterdata Pack Protocolo [D4:C3]
- `credencial_exigida`: —
- `preço`: `[NÃO VERIFICADO]`
- `limites_e_riscos`: prazos de guarda trabalhista (V1)
- `alternativa`: pasta no Drive
- `veredito`: construir
- `confiança`: média
- `fontes_verificação`: I-01, I-02
- `nota_rodada2`: Domínio [R2]: API de entrada para ERPs homologados (NF-e, NFC-e, NFS-e, CF-e, CT-e, pagamentos/recebimentos, rubricas da folha), chave por empresa no Onvio Gestão > API, especificação entregue a parceiro cadastrado; Domínio Processos e Portal do Cliente sem API de saída pública `[NÃO ENCONTRADO]` (I-01) · Alterdata [R2]: API ePlugin com token do escritório (exige eContador Master): tarefas, documentos, CNDs, empresas, funcionários, movimentos da folha, admissão, férias, rescisão, atendimentos, recálculo de DAS, lançamentos contábeis em TXT (I-02)

### 2.5 D5 · Contábil

#### CTB-002 · Pedir os documentos da competência ao cliente
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-05, I-10); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: B + construir
- `integrações`: I-05 (utilidade), I-10 (substitui o pedido de extrato quando há consentimento)
- `credencial_exigida`: opt-in
- `preço`: `[NÃO VERIFICADO]`
- `limites_e_riscos`: ver NFE-038 (qualidade do número)
- `alternativa`: e-mail
- `veredito`: construir
- `confiança`: média
- `fontes_verificação`: I-05, I-10
- `nota_rodada2`: WhatsApp [R2, tabela de 01/10/2026]: marketing R$ 0,3217; utilidade, autenticação e serviço R$ 0,035; 1.000 mensagens de serviço grátis por número/mês; **desde 01/10/2026 respostas acima da franquia e modelos de utilidade dentro da janela são cobrados** (o que esta ficha diz sobre gratuidade na janela fica corrigido por esta nota); Groups API até 8 participantes (I-05) · Open Finance [R2]: Pluggy a partir de R$ 2.500/mês (Dados), Belvo Launch US$ 1.000/mês (I-10)

#### CTB-003 · Cobrar os documentos pendentes até completar
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-05); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: B + construir (régua)
- `integrações`: I-05; Questor Tareffa (3 lembretes) [D5:C1]
- `credencial_exigida`: opt-in
- `preço`: `[NÃO VERIFICADO]`
- `limites_e_riscos`: unificar com NFE-038 e DP-009 numa só régua por cliente, para não mandar três cobranças no mesmo dia
- `alternativa`: e-mail
- `veredito`: construir (ferramenta transversal)
- `confiança`: média
- `fontes_verificação`: I-05, I-04
- `nota_rodada2`: WhatsApp [R2, tabela de 01/10/2026]: marketing R$ 0,3217; utilidade, autenticação e serviço R$ 0,035; 1.000 mensagens de serviço grátis por número/mês; **desde 01/10/2026 respostas acima da franquia e modelos de utilidade dentro da janela são cobrados** (o que esta ficha diz sobre gratuidade na janela fica corrigido por esta nota); Groups API até 8 participantes (I-05)

#### CTB-004 · Receber, identificar e arquivar os documentos que chegam soltos
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-05, I-17); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: B + construir (IA classifica)
- `integrações`: I-05, I-09; concorrentes Acessórias e-Contínuo, Gestta Express, Omie ValidaPDF [I-17]
- `credencial_exigida`: —
- `preço`: recebimento sem custo `[NÃO VERIFICADO]`
- `limites_e_riscos`: ver NFE-012
- `alternativa`: upload no portal
- `veredito`: construir
- `confiança`: média
- `fontes_verificação`: I-05, I-17
- `nota_rodada2`: WhatsApp [R2, tabela de 01/10/2026]: marketing R$ 0,3217; utilidade, autenticação e serviço R$ 0,035; 1.000 mensagens de serviço grátis por número/mês; **desde 01/10/2026 respostas acima da franquia e modelos de utilidade dentro da janela são cobrados** (o que esta ficha diz sobre gratuidade na janela fica corrigido por esta nota); Groups API até 8 participantes (I-05) · Concorrentes [R2]: Acessórias com API por token, MCP, app white label e Área VIP; HubStrom com AppHub; e-Kontroll com e-Monitor (tempo da equipe); SIEG a partir de R$ 223/mês (I-17)

#### CTB-006 · Pedir ao cliente a explicação de movimentos sem documento
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-05); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: B (WhatsApp com lista de lançamentos) + construir
- `integrações`: I-05 (modelo de utilidade com link para a lista; respostas na janela)
- `credencial_exigida`: opt-in
- `preço`: `[NÃO VERIFICADO]`
- `limites_e_riscos`: nenhuma oferta encontrada que pergunte por lançamento via WhatsApp [D5 leitura] — diferencial
- `alternativa`: planilha por e-mail
- `veredito`: construir
- `confiança`: média
- `fontes_verificação`: I-05
- `nota_rodada2`: WhatsApp [R2, tabela de 01/10/2026]: marketing R$ 0,3217; utilidade, autenticação e serviço R$ 0,035; 1.000 mensagens de serviço grátis por número/mês; **desde 01/10/2026 respostas acima da franquia e modelos de utilidade dentro da janela são cobrados** (o que esta ficha diz sobre gratuidade na janela fica corrigido por esta nota); Groups API até 8 participantes (I-05)

#### CTB-007 · Buscar dados do sistema financeiro ou ERP do cliente
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-16); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: B
- `integrações`: I-16 (Conta Azul, Omie, Bling, Nibo); Conta Azul integra por API com o Domínio [D5:C4]
- `credencial_exigida`: chave de API emitida pelo cliente
- `preço`: `[NÃO VERIFICADO]`
- `limites_e_riscos`: a Conta Azul (com a Mister Contador) é concorrente direta na classificação assistida [D5 achado 12]
- `alternativa`: exportação em planilha pelo cliente
- `veredito`: integrar os ERPs mais frequentes da carteira
- `confiança`: baixa
- `fontes_verificação`: I-16
- `nota_rodada2`: ERPs [R2]: Conta Azul e Omie integram ao Domínio pela API com chave do Onvio Gestão (I-16)

#### CTB-008 · Obter o extrato de cada conta (OFX, PDF ou planilha)
- `status`: conferido em parte na rodada 2 (preços Pluggy e Belvo)
- `nível_automação`: F (OFX enviado pelo cliente no app) no MVP; B (Open Finance) depois
- `integrações`: I-10 [R2], I-11; Domínio importa OFX [D5:C3]
- `credencial_exigida`: nenhuma (F) ou consent-cli (B)
- `preço`: **Pluggy a partir de R$ 2.500/mês (Dados)**; **Belvo Launch US$ 1.000/mês** [R2]
- `limites_e_riscos`: piso mensal alto para um escritório
- `alternativa`: OFX pelo app
- `veredito`: F no MVP; B quando houver volume para ratear
- `confiança`: alta (preço) / média
- `fontes_verificação`: I-10, I-11

#### CTB-009 · Converter extrato em PDF ou imagem em dados
- `status`: mantido da rodada 1 (não conferido)
- `nível_automação`: construir (OCR/LLM)
- `integrações`: nenhuma necessária; OCR comercial opcional `[NÃO VERIFICADO]`
- `credencial_exigida`: —
- `preço`: custo de modelo por página `[NÃO VERIFICADO]`
- `limites_e_riscos`: conferir saldo inicial + movimentos = saldo final antes de aceitar
- `alternativa`: digitação
- `veredito`: construir
- `confiança`: média
- `fontes_verificação`: —

#### CTB-010 · Conectar e manter o Open Finance do cliente
- `status`: conferido em parte na rodada 2
- `nível_automação`: B
- `integrações`: Pluggy, Belvo (I-10) [R2]; Celcoin, Klavi, TecnoSpeed (rodada 1); Questor nativo [D5:C2]
- `credencial_exigida`: consent-cli do representante da PJ
- `preço`: **Pluggy: mínimo R$ 2.500/mês com volume incluso, excedente por requisição** [R2]; **Belvo: US$ 1.000/mês** (Launch) [R2]; TecnoSpeed ~R$ 1,5 mil (fórum, rodada 1, não confirmado)
- `limites_e_riscos`: consentimento e cooperativas: mantido da rodada 1
- `alternativa`: OFX
- `veredito`: comprar após cotação; adicional por conta conectada (GES-010)
- `confiança`: alta (preço Pluggy e Belvo) / média (limites)
- `fontes_verificação`: I-10

#### CTB-011 · Descobrir contas e cartões que o cliente não informou
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-10); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: B (Open Finance lista contas do consentimento) + D
- `integrações`: I-10; Registrato do BCB (relacionamentos do CNPJ) — acesso do próprio titular, sem API para terceiros `[NÃO VERIFICADO — conhecimento prévio]`
- `credencial_exigida`: consent-cli; gov.br do representante para o Registrato
- `preço`: —
- `limites_e_riscos`: Open Finance só mostra o banco consentido, não as outras instituições
- `alternativa`: pedir ao cliente o relatório do Registrato (D)
- `veredito`: só checklist + pedido do Registrato
- `confiança`: baixa
- `fontes_verificação`: I-10
- `nota_rodada2`: Open Finance [R2]: Pluggy a partir de R$ 2.500/mês (Dados), Belvo Launch US$ 1.000/mês (I-10)

#### CTB-012 · Obter e lançar faturas de cartão de crédito corporativo
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-10); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: B (Open Finance inclui fatura de cartão) + F (PDF)
- `integrações`: I-10; Questor traz fatura de cartão pelo Open Finance [D5:C2]
- `credencial_exigida`: consent-cli
- `preço`: ver CTB-010
- `limites_e_riscos`: cartão de emissor fora do Open Finance
- `alternativa`: PDF + extração (CTB-009)
- `veredito`: integrar junto com CTB-010
- `confiança`: média
- `fontes_verificação`: I-10; [D5:C2]
- `nota_rodada2`: Open Finance [R2]: Pluggy a partir de R$ 2.500/mês (Dados), Belvo Launch US$ 1.000/mês (I-10)

#### CTB-013 · Conciliar recebíveis de maquininha e marketplace
- `status`: mantido da rodada 1 (não conferido)
- `nível_automação`: F (EDI das adquirentes) + B (conciliadores) `[NÃO VERIFICADO]`
- `integrações`: Concil, Auditto (conciliação de cartões) [D5:C17]; APIs das adquirentes `[NÃO ENCONTRADO]` [D5 lacuna 7]
- `credencial_exigida`: acesso do cliente ao portal da adquirente
- `preço`: `[NÃO VERIFICADO]`
- `limites_e_riscos`: Open Finance não cobre agenda de recebíveis `[NÃO VERIFICADO — conhecimento prévio]`
- `alternativa`: relatório exportado da adquirente
- `veredito`: F; comprar conciliador só para varejo com volume
- `confiança`: baixa
- `fontes_verificação`: I-11; [D5:C17]

#### CTB-014 · Controlar empréstimos, financiamentos e aplicações
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-10); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: B parcial (Open Finance tem fases de crédito e investimentos) `[NÃO VERIFICADO]` + D
- `integrações`: I-10
- `credencial_exigida`: consent-cli
- `preço`: ver CTB-010
- `limites_e_riscos`: cobertura de produtos de crédito/investimento por agregador `[NÃO VERIFICADO]`
- `alternativa`: contrato e extrato do banco
- `veredito`: D com B onde houver
- `confiança`: baixa
- `fontes_verificação`: I-10
- `nota_rodada2`: Open Finance [R2]: Pluggy a partir de R$ 2.500/mês (Dados), Belvo Launch US$ 1.000/mês (I-10)

#### CTB-015 · Classificar os lançamentos do extrato
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-17); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: construir (IA + regras); core já concilia
- `integrações`: concorrentes ROIT (98% segundo a empresa) [D5:C6], Conta Azul/Mister Contador [D5:C4], Nibo [D5:C7], Domínio/Alterdata (conciliação no core) [D5:C3][D5:C11]
- `credencial_exigida`: —
- `preço`: custo de modelo `[NÃO VERIFICADO]`
- `limites_e_riscos`: concorrência forte; diferencial é perguntar ao cliente (CTB-006) e explicar
- `alternativa`: regras simples por histórico
- `veredito`: construir
- `confiança`: média
- `fontes_verificação`: I-17
- `nota_rodada2`: Concorrentes [R2]: Acessórias com API por token, MCP, app white label e Área VIP; HubStrom com AppHub; e-Kontroll com e-Monitor (tempo da equipe); SIEG a partir de R$ 223/mês (I-17)

#### CTB-016 · Manter as regras de classificação de cada cliente
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-02); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: construir
- `integrações`: regras do core (Alterdata Prosoft, parâmetros de conciliação) [D5:C11] — exportação `[NÃO ENCONTRADO]`
- `credencial_exigida`: —
- `preço`: —
- `limites_e_riscos`: regras duplicadas plataforma × core divergem
- `alternativa`: —
- `veredito`: construir
- `confiança`: média
- `fontes_verificação`: I-02
- `nota_rodada2`: Alterdata [R2]: API ePlugin com token do escritório (exige eContador Master): tarefas, documentos, CNDs, empresas, funcionários, movimentos da folha, admissão, férias, rescisão, atendimentos, recálculo de DAS, lançamentos contábeis em TXT (I-02)

#### CTB-017 · Exportar os lançamentos no leiaute de importação do core
- `status`: conferido na rodada 2 (Alterdata; Domínio em parte); Contmatic sem leiaute público
- `nível_automação`: **B** (Alterdata) / B parcial (Domínio: pagamentos e recebimentos de notas) / F (Contmatic)
- `integrações`: Alterdata `POST /api/v1/integracao/integracaoAlterdata` com arquivo TXT no **leiaute do Contábil Windows** (código do lançamento automático; conta débito; conta crédito; data; valor; código do histórico padrão; descrição; documento), nome `Lançamentos_contabeis_DD_MM_AAAA_a_DD_MM_AAAA.txt` [R2]; Domínio recebe por API "pagamento/recebimento de parcelas de notas de entrada, saída e serviços" [R2] — leiaute de lançamento contábil genérico por API `[NÃO ENCONTRADO]`; Contmatic `[NÃO ENCONTRADO]`
- `credencial_exigida`: token ePlugin; homologação TR
- `preço`: `[PREÇO NÃO PÚBLICO]`
- `limites_e_riscos`: plano de contas e históricos por empresa; controle de "já exportado"
- `alternativa`: OFX "enriquecido" para a conciliação do Domínio
- `veredito`: integrar (B) na Alterdata; pedir à TR o leiaute de lançamentos contábeis; F na Contmatic
- `confiança`: alta (Alterdata) / média
- `fontes_verificação`: I-01, I-02, I-03, I-16
- `correção`: o leiaute da Alterdata está publicado na documentação do ePlugin

#### CTB-019 · Conferir a integração fiscal-contábil
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-01, I-02, I-03); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: F (balancete e livros exportados) + SPED
- `integrações`: I-01 a I-03 (relatórios); Conta Azul cita integração fiscal-contábil [D5:C4]
- `credencial_exigida`: —
- `preço`: —
- `limites_e_riscos`: depende de exportação manual sem API
- `alternativa`: ECD/EFD gerados
- `veredito`: construir sobre F
- `confiança`: baixa
- `fontes_verificação`: I-01
- `nota_rodada2`: Domínio [R2]: API de entrada para ERPs homologados (NF-e, NFC-e, NFS-e, CF-e, CT-e, pagamentos/recebimentos, rubricas da folha), chave por empresa no Onvio Gestão > API, especificação entregue a parceiro cadastrado; Domínio Processos e Portal do Cliente sem API de saída pública `[NÃO ENCONTRADO]` (I-01) · Alterdata [R2]: API ePlugin com token do escritório (exige eContador Master): tarefas, documentos, CNDs, empresas, funcionários, movimentos da folha, admissão, férias, rescisão, atendimentos, recálculo de DAS, lançamentos contábeis em TXT (I-02) · Contmatic [R2]: nenhuma API pública; integra com Busca Legal, Acessórias, Jettax e Contbank; módulo Gestão do Escritório nos planos Avançado/Elite (I-03)

#### CTB-020 · Conferir a integração folha-contábil
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-01); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: F + V1 (eSocial/DCTFWeb)
- `integrações`: relatórios da folha e balancete do core
- `credencial_exigida`: —
- `preço`: —
- `limites_e_riscos`: idem CTB-019
- `alternativa`: —
- `veredito`: construir sobre F
- `confiança`: baixa
- `fontes_verificação`: I-01
- `nota_rodada2`: Domínio [R2]: API de entrada para ERPs homologados (NF-e, NFC-e, NFS-e, CF-e, CT-e, pagamentos/recebimentos, rubricas da folha), chave por empresa no Onvio Gestão > API, especificação entregue a parceiro cadastrado; Domínio Processos e Portal do Cliente sem API de saída pública `[NÃO ENCONTRADO]` (I-01)

#### CTB-028 · Gerar e enviar o relatório mensal ao cliente
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-05); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: F (balancete do core) + construir + B (envio)
- `integrações`: I-05 (link), Conta Azul DRE [D5:C4] como referência
- `credencial_exigida`: opt-in
- `preço`: `[NÃO VERIFICADO]`
- `limites_e_riscos`: relatório com comentário de IA precisa de revisão humana no início
- `alternativa`: PDF por e-mail
- `veredito`: construir
- `confiança`: média
- `fontes_verificação`: I-05
- `nota_rodada2`: WhatsApp [R2, tabela de 01/10/2026]: marketing R$ 0,3217; utilidade, autenticação e serviço R$ 0,035; 1.000 mensagens de serviço grátis por número/mês; **desde 01/10/2026 respostas acima da franquia e modelos de utilidade dentro da janela são cobrados** (o que esta ficha diz sobre gratuidade na janela fica corrigido por esta nota); Groups API até 8 participantes (I-05)

#### CTB-029 · Explicar o resultado ao cliente e responder perguntas
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-05, I-07); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: B + construir (IA M2/M3)
- `integrações`: I-05, I-07
- `credencial_exigida`: —
- `preço`: dentro da janela `[NÃO VERIFICADO]`
- `limites_e_riscos`: política de IA (I-05) não afeta: é atendimento sobre o serviço do escritório
- `alternativa`: reunião
- `veredito`: construir
- `confiança`: média
- `fontes_verificação`: I-05
- `nota_rodada2`: WhatsApp [R2, tabela de 01/10/2026]: marketing R$ 0,3217; utilidade, autenticação e serviço R$ 0,035; 1.000 mensagens de serviço grátis por número/mês; **desde 01/10/2026 respostas acima da franquia e modelos de utilidade dentro da janela são cobrados** (o que esta ficha diz sobre gratuidade na janela fica corrigido por esta nota); Groups API até 8 participantes (I-05) · Chatwoot [R2]: MIT fora do diretório `enterprise/` (I-07)

#### CTB-034 · Controlar pagamentos mensais de lucros por sócio e a retenção de 10%
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-10); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: B (Open Finance para detectar Pix/TED a sócios) + construir (controle da Lei 15.270)
- `integrações`: I-10
- `credencial_exigida`: consent-cli
- `preço`: ver CTB-010
- `limites_e_riscos`: classificar transferência a sócio como lucro × pró-labore × empréstimo exige confirmação do cliente
- `alternativa`: informe mensal do cliente
- `veredito`: construir + integrar
- `confiança`: baixa
- `fontes_verificação`: I-10; [D5:T3]
- `nota_rodada2`: Open Finance [R2]: Pluggy a partir de R$ 2.500/mês (Dados), Belvo Launch US$ 1.000/mês (I-10)

#### CTB-037 · Preparar a aprovação de contas e a ata de distribuição
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-13); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: B (assinatura) — ver SOC-041
- `integrações`: I-13
- `credencial_exigida`: token do provedor
- `preço`: `[NÃO VERIFICADO]`
- `limites_e_riscos`: registro na Junta (V2)
- `alternativa`: gov.br
- `veredito`: unificar com SOC-041
- `confiança`: baixa
- `fontes_verificação`: I-13
- `nota_rodada2`: Assinatura [R2]: com API a partir de R$ 69/mês (Clicksign Start), R$ 69,90 (ZapSign Equipe) e R$ 79,90 (D4Sign Profissional), faixa de 20 docs/mês (I-13)

#### CTB-039 · Obter a carta de responsabilidade da administração
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-13); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: B
- `integrações`: I-13; Omie emite a carta no ERP [D5:C12]
- `credencial_exigida`: token do provedor
- `preço`: `[NÃO VERIFICADO]`
- `limites_e_riscos`: anual e esquecida; amarrar à ECD (CTB-041)
- `alternativa`: aceite no portal
- `veredito`: integrar
- `confiança`: média
- `fontes_verificação`: I-13
- `nota_rodada2`: Assinatura [R2]: com API a partir de R$ 69/mês (Clicksign Start), R$ 69,90 (ZapSign Equipe) e R$ 79,90 (D4Sign Profissional), faixa de 20 docs/mês (I-13)

### 2.6 D6 · Consultoria e Reforma Tributária

#### CON-001 · Receber, triar e registrar as consultas técnicas dos clientes
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-05, I-07); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: B (canal) + construir (triagem por IA)
- `integrações`: I-05, I-07, I-09
- `credencial_exigida`: —
- `preço`: dentro da janela `[NÃO VERIFICADO]`
- `limites_e_riscos`: consulta técnica vira tarefa faturável (CON-007); política de IA (I-05)
- `alternativa`: formulário no portal
- `veredito`: construir
- `confiança`: média
- `fontes_verificação`: I-05, I-07
- `nota_rodada2`: WhatsApp [R2, tabela de 01/10/2026]: marketing R$ 0,3217; utilidade, autenticação e serviço R$ 0,035; 1.000 mensagens de serviço grátis por número/mês; **desde 01/10/2026 respostas acima da franquia e modelos de utilidade dentro da janela são cobrados** (o que esta ficha diz sobre gratuidade na janela fica corrigido por esta nota); Groups API até 8 participantes (I-05) · Chatwoot [R2]: MIT fora do diretório `enterprise/` (I-07)

#### CON-003 · Elaborar parecer técnico formal
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-13); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: construir (M1) + B (assinatura)
- `integrações`: I-13 (assinatura qualificada do contador, se exigida pelo cliente)
- `credencial_exigida`: e-CPF do contador para assinatura qualificada
- `preço`: `[NÃO VERIFICADO]`
- `limites_e_riscos`: responsabilidade profissional do uso de IA (D6 lacuna 15)
- `alternativa`: PDF assinado no Assinador gov.br
- `veredito`: construir + integrar
- `confiança`: baixa
- `fontes_verificação`: I-13
- `nota_rodada2`: Assinatura [R2]: com API a partir de R$ 69/mês (Clicksign Start), R$ 69,90 (ZapSign Equipe) e R$ 79,90 (D4Sign Profissional), faixa de 20 docs/mês (I-13)

#### CON-007 · Orçar, contratar e faturar o serviço consultivo extra
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-13, I-14); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: construir + B (assinatura, cobrança avulsa, NFS-e)
- `integrações`: I-13, I-14
- `credencial_exigida`: tokens dos provedores
- `preço`: `[NÃO VERIFICADO]`
- `limites_e_riscos`: ver GES-002
- `alternativa`: —
- `veredito`: unificar com GES-002
- `confiança`: média
- `fontes_verificação`: I-13, I-14
- `nota_rodada2`: Assinatura [R2]: com API a partir de R$ 69/mês (Clicksign Start), R$ 69,90 (ZapSign Equipe) e R$ 79,90 (D4Sign Profissional), faixa de 20 docs/mês (I-13) · Cobrança [R2]: Asaas R$ 2,15 por Pix/boleto recebido, WhatsApp R$ 0,55/notificação, NF R$ 0,49, negativação R$ 9,90; Efí boleto R$ 3,45, Pix API 1,19%, Pix Automático R$ 3,50; Inter `[NÃO ENCONTRADO]` (I-14)

#### CON-018 · Analisar fornecedores e clientes do cliente quanto a crédito (cadeia)
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-12, I-15); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: A (XMLs já capturados) + B (regime e situação do fornecedor por agregador)
- `integrações`: I-12; Qive Portal de Fornecedores (regime, risco de crédito IBS/CBS) [D6:C5]
- `credencial_exigida`: token-esc
- `preço`: custo por CNPJ `[NÃO VERIFICADO]`; cache por fornecedor
- `limites_e_riscos`: regime do Simples por CNPJ vem de fonte federal (V1)
- `alternativa`: só fornecedores relevantes (Pareto)
- `veredito`: construir sobre dados próprios; agregador opcional
- `confiança`: baixa
- `fontes_verificação`: I-12, I-15
- `nota_rodada2`: Certidões [R2]: Infosimples R$ 0,20 a R$ 0,09 por consulta, franquia mínima R$ 100/mês; CNDs do eCND da Alterdata por API (I-12) · DF-e [R2]: Jettax e Fiscal.io entregam ao Domínio pela API (fila de 60 dias); SIEG a partir de R$ 223/mês; Qive sem preço público (I-15)

#### CON-030 · Comunicar a carteira sobre a reforma e registrar a ciência dos clientes
- `status`: conferido em parte na rodada 2 (preço)
- `nível_automação`: B
- `integrações`: I-05, I-09
- `credencial_exigida`: opt-in para marketing
- `preço`: comunicado informativo tende a ser marketing: **R$ 0,3217 por mensagem** [R2]
- `limites_e_riscos`: envio em massa derruba qualidade do número
- `alternativa`: aviso no app com confirmação de leitura; WhatsApp só para quem não leu
- `veredito`: integrar, com app/e-mail como canal principal
- `confiança`: alta (preço) / baixa (classificação)
- `fontes_verificação`: I-05, I-09

#### CON-036 · Precificar, faturar e controlar o honorário de êxito da recuperação
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-14); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: construir + B (cobrança)
- `integrações`: I-14
- `credencial_exigida`: token do provedor
- `preço`: `[NÃO VERIFICADO]`
- `limites_e_riscos`: cobrança atrelada à compensação efetiva (V1)
- `alternativa`: —
- `veredito`: construir
- `confiança`: média
- `fontes_verificação`: I-14
- `nota_rodada2`: Cobrança [R2]: Asaas R$ 2,15 por Pix/boleto recebido, WhatsApp R$ 0,55/notificação, NF R$ 0,49, negativação R$ 9,90; Efí boleto R$ 3,45, Pix API 1,19%, Pix Automático R$ 3,50; Inter `[NÃO ENCONTRADO]` (I-14)

### 2.7 D7 · Gestão do escritório, Atendimento e Timesheet

#### GES-001 · Gerar as cobranças mensais recorrentes de honorários
- `status`: conferido em parte na rodada 2 (Asaas e Efí; Inter não)
- `nível_automação`: B
- `integrações`: Asaas (assinaturas, carnês) [R2]; Efí (boletos, Pix, **Pix Automático**) [R2]; Banco Inter `[NÃO ENCONTRADO]` tarifa oficial
- `credencial_exigida`: conta PJ do escritório + token (mTLS em Efí/Inter `[NÃO VERIFICADO]`)
- `preço`: **Asaas R$ 2,15 por Pix ou boleto recebido** (R$ 1,08 nos 3 primeiros meses); **Efí boleto pago R$ 3,45, Pix via API 1,19%, Pix Automático R$ 3,50 por Pix liquidado** [R2]
- `limites_e_riscos`: Pix Automático disponível por API na Efí [R2]; no Asaas `[NÃO ENCONTRADO]` na página de preços
- `alternativa`: boleto avulso
- `veredito`: integrar (Asaas primeiro; Efí se Pix Automático for requisito)
- `confiança`: alta (preços Asaas e Efí)
- `fontes_verificação`: I-14

#### GES-002 · Faturar serviços extras e avulsos
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-14); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: B
- `integrações`: I-14 (cobrança avulsa), NFS-e (GES-007)
- `credencial_exigida`: token
- `preço`: `[NÃO VERIFICADO]`
- `limites_e_riscos`: precisa do escopo contratado estruturado (SOC-017)
- `alternativa`: —
- `veredito`: integrar
- `confiança`: média
- `fontes_verificação`: I-14
- `nota_rodada2`: Cobrança [R2]: Asaas R$ 2,15 por Pix/boleto recebido, WhatsApp R$ 0,55/notificação, NF R$ 0,49, negativação R$ 9,90; Efí boleto R$ 3,45, Pix API 1,19%, Pix Automático R$ 3,50; Inter `[NÃO ENCONTRADO]` (I-14)

#### GES-003 · Conciliar recebimentos de honorários e dar baixa
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-14); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: B (webhook de pagamento do provedor) + F (CNAB retorno, extrato)
- `integrações`: I-14, I-11
- `credencial_exigida`: token
- `preço`: —
- `limites_e_riscos`: valor recebido ≠ faturado por retenções (GES-008)
- `alternativa`: extrato OFX
- `veredito`: integrar
- `confiança`: média
- `fontes_verificação`: I-14
- `nota_rodada2`: Cobrança [R2]: Asaas R$ 2,15 por Pix/boleto recebido, WhatsApp R$ 0,55/notificação, NF R$ 0,49, negativação R$ 9,90; Efí boleto R$ 3,45, Pix API 1,19%, Pix Automático R$ 3,50; Inter `[NÃO ENCONTRADO]` (I-14)

#### GES-004 · Executar a régua de cobrança de honorários
- `status`: conferido em parte na rodada 2 (preços)
- `nível_automação`: B + construir (limite ético)
- `integrações`: régua do Asaas (WhatsApp R$ 0,55/notificação; e-mail+SMS R$ 0,99 por cobrança) [R2] ou régua própria pela Cloud API (R$ 0,035 por modelo de utilidade) [R2]
- `credencial_exigida`: opt-in
- `preço`: régua própria é ~15× mais barata por mensagem de WhatsApp que a do Asaas (R$ 0,035 × R$ 0,55) [R2]
- `limites_e_riscos`: lembrete transacional é utilidade; tom agressivo derruba a qualidade do número do atendimento
- `alternativa`: régua só por e-mail
- `veredito`: construir a régua no canal oficial do escritório
- `confiança`: alta (preços)
- `fontes_verificação`: I-05, I-14

#### GES-005 · Negociar e acompanhar acordos de honorários em atraso
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-13, I-14); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: B (assinatura do acordo, parcelamento no provedor)
- `integrações`: I-13, I-14
- `credencial_exigida`: tokens
- `preço`: `[NÃO VERIFICADO]`
- `limites_e_riscos`: —
- `alternativa`: termo por e-mail
- `veredito`: integrar
- `confiança`: média
- `fontes_verificação`: I-13, I-14
- `nota_rodada2`: Assinatura [R2]: com API a partir de R$ 69/mês (Clicksign Start), R$ 69,90 (ZapSign Equipe) e R$ 79,90 (D4Sign Profissional), faixa de 20 docs/mês (I-13) · Cobrança [R2]: Asaas R$ 2,15 por Pix/boleto recebido, WhatsApp R$ 0,55/notificação, NF R$ 0,49, negativação R$ 9,90; Efí boleto R$ 3,45, Pix API 1,19%, Pix Automático R$ 3,50; Inter `[NÃO ENCONTRADO]` (I-14)

#### GES-007 · Emitir a NFS-e dos honorários do próprio escritório
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-14, I-15); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: A (Emissor Nacional por API, V1) ou B (emissão pelo provedor de cobrança ou integrador)
- `integrações`: Asaas emite NFS-e `[NÃO VERIFICADO]`; Focus NFe, PlugNotas, NFE.io, eNotas (I-15)
- `credencial_exigida`: e-CNPJ do escritório
- `preço`: `[NÃO VERIFICADO]`
- `limites_e_riscos`: data de migração do Simples ao Emissor Nacional diverge (D3 achado 8); município do escritório decide o caminho
- `alternativa`: emissão manual no portal
- `veredito`: integrar (B pelo provedor de cobrança, se cobrir o município) — mais simples que construir
- `confiança`: baixa
- `fontes_verificação`: I-14, I-15; V1
- `nota_rodada2`: Cobrança [R2]: Asaas R$ 2,15 por Pix/boleto recebido, WhatsApp R$ 0,55/notificação, NF R$ 0,49, negativação R$ 9,90; Efí boleto R$ 3,45, Pix API 1,19%, Pix Automático R$ 3,50; Inter `[NÃO ENCONTRADO]` (I-14) · DF-e [R2]: Jettax e Fiscal.io entregam ao Domínio pela API (fila de 60 dias); SIEG a partir de R$ 223/mês; Qive sem preço público (I-15)

#### GES-009 · Cobrar o 13º honorário e as cobranças sazonais
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-14); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: B (mesma integração de GES-001)
- `integrações`: I-14
- `credencial_exigida`: token
- `preço`: `[NÃO VERIFICADO]`
- `limites_e_riscos`: depende de cláusula contratual
- `alternativa`: —
- `veredito`: integrar
- `confiança`: média
- `fontes_verificação`: I-14
- `nota_rodada2`: Cobrança [R2]: Asaas R$ 2,15 por Pix/boleto recebido, WhatsApp R$ 0,55/notificação, NF R$ 0,49, negativação R$ 9,90; Efí boleto R$ 3,45, Pix API 1,19%, Pix Automático R$ 3,50; Inter `[NÃO ENCONTRADO]` (I-14)

#### GES-010 · Repassar ou ratear custos variáveis por cliente (APIs, certificados, taxas)
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-02, I-05, I-10, I-12, I-13); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: construir (bilhetagem própria)
- `integrações`: custos a medir: Integra Contador (V1; revenda Alterdata R$ 0,75/DAS em 2025 [D2:S5]; Alterdata tem painel de bilhetagem [D7:R12]), mensagens Meta (I-05), Open Finance (I-10), agregador de certidões (I-12), assinatura (I-13)
- `credencial_exigida`: —
- `preço`: —
- `limites_e_riscos`: sem preço verificado de nenhuma dessas fontes, o modelo de repasse fica em aberto
- `alternativa`: franquia por plano
- `veredito`: construir (essencial para a margem)
- `confiança`: média
- `fontes_verificação`: I-02, I-05, I-10, I-12, I-13
- `nota_rodada2`: Alterdata [R2]: API ePlugin com token do escritório (exige eContador Master): tarefas, documentos, CNDs, empresas, funcionários, movimentos da folha, admissão, férias, rescisão, atendimentos, recálculo de DAS, lançamentos contábeis em TXT (I-02) · WhatsApp [R2, tabela de 01/10/2026]: marketing R$ 0,3217; utilidade, autenticação e serviço R$ 0,035; 1.000 mensagens de serviço grátis por número/mês; **desde 01/10/2026 respostas acima da franquia e modelos de utilidade dentro da janela são cobrados** (o que esta ficha diz sobre gratuidade na janela fica corrigido por esta nota); Groups API até 8 participantes (I-05) · Open Finance [R2]: Pluggy a partir de R$ 2.500/mês (Dados), Belvo Launch US$ 1.000/mês (I-10) · Certidões [R2]: Infosimples R$ 0,20 a R$ 0,09 por consulta, franquia mínima R$ 100/mês; CNDs do eCND da Alterdata por API (I-12) · Assinatura [R2]: com API a partir de R$ 69/mês (Clicksign Start), R$ 69,90 (ZapSign Equipe) e R$ 79,90 (D4Sign Profissional), faixa de 20 docs/mês (I-13)

#### GES-023 · Receber e triar mensagens de WhatsApp num número oficial único, identificando o cliente
- `status`: conferido em parte na rodada 2 (preço e regras Meta; BSP e Chatwoot mantidos)
- `nível_automação`: B
- `integrações`: Cloud API (I-05) [R2] direta ou BSP (I-06); Chatwoot (I-07, licença conferida [R2]); concorrentes Acessórias Komunic (número oficial compartilhado, IA de qualidade) [R2], HubStrom ConnectHub [R2], Domínio Messenger, Digisac
- `credencial_exigida`: Meta Business verificado + número dedicado + forma de pagamento no Billing Hub [R2]
- `preço`: receber é grátis; **respostas (serviço): 1.000 grátis por número/mês, depois R$ 0,035 cada** (desde 01/10/2026) [R2]; BSP soma margem `[NÃO VERIFICADO]`
- `limites_e_riscos`: coexistência app + API não conferida
- `alternativa`: —
- `veredito`: integrar (núcleo do atendimento)
- `confiança`: alta (preço) / média (arquitetura)
- `fontes_verificação`: I-05, I-06, I-07
- `correção`: a rodada 1 dizia que respostas na janela não tinham custo; isso mudou em 01/10/2026

#### GES-024 · Distribuir conversas por setor e fila, transferir e acompanhar SLA
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-07); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: B (Chatwoot ou próprio)
- `integrações`: I-07 (times, atribuição, automações); Digisac (filas por setor) [D4:C9]
- `credencial_exigida`: —
- `preço`: Chatwoot auto-hospedado: infraestrutura; SLA pode estar em módulo enterprise `[NÃO VERIFICADO]`
- `limites_e_riscos`: ver licença do Chatwoot (I-07)
- `alternativa`: construir filas no próprio backend
- `veredito`: integrar/reusar
- `confiança`: baixa
- `fontes_verificação`: I-07
- `nota_rodada2`: Chatwoot [R2]: MIT fora do diretório `enterprise/` (I-07)

#### GES-025 · Responder perguntas de status com dados do sistema
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-05); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: construir sobre B
- `integrações`: I-05
- `credencial_exigida`: identificação do contato (GES-023)
- `preço`: dentro da janela sem custo `[NÃO VERIFICADO]`
- `limites_e_riscos`: caso de uso explicitamente permitido pela política de IA (atendimento do próprio serviço) `[NÃO VERIFICADO]`
- `alternativa`: humano
- `veredito`: construir (diferencial central)
- `confiança`: média
- `fontes_verificação`: I-05
- `nota_rodada2`: WhatsApp [R2, tabela de 01/10/2026]: marketing R$ 0,3217; utilidade, autenticação e serviço R$ 0,035; 1.000 mensagens de serviço grátis por número/mês; **desde 01/10/2026 respostas acima da franquia e modelos de utilidade dentro da janela são cobrados** (o que esta ficha diz sobre gratuidade na janela fica corrigido por esta nota); Groups API até 8 participantes (I-05)

#### GES-026 · Capturar documentos recebidos nas conversas e arquivá-los
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-05); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: B + construir
- `integrações`: I-05 (mídia por webhook)
- `credencial_exigida`: —
- `preço`: —
- `limites_e_riscos`: ver NFE-012 (prazo de download da mídia)
- `alternativa`: —
- `veredito`: construir (unificar com NFE-012 e CTB-004)
- `confiança`: média
- `fontes_verificação`: I-05
- `nota_rodada2`: WhatsApp [R2, tabela de 01/10/2026]: marketing R$ 0,3217; utilidade, autenticação e serviço R$ 0,035; 1.000 mensagens de serviço grátis por número/mês; **desde 01/10/2026 respostas acima da franquia e modelos de utilidade dentro da janela são cobrados** (o que esta ficha diz sobre gratuidade na janela fica corrigido por esta nota); Groups API até 8 participantes (I-05)

#### GES-027 · Atender a caixa de e-mail compartilhada e vincular ao cliente
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-07); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: A
- `integrações`: Gmail API / Microsoft Graph / IMAP (I-09); canal de e-mail do Chatwoot (I-07)
- `credencial_exigida`: OAuth do escritório
- `preço`: sem custo de API `[NÃO VERIFICADO]`
- `limites_e_riscos`: verificação de app do Google para escopos sensíveis `[NÃO VERIFICADO]`
- `alternativa`: IMAP
- `veredito`: integrar
- `confiança`: média
- `fontes_verificação`: I-09
- `nota_rodada2`: Chatwoot [R2]: MIT fora do diretório `enterprise/` (I-07)

#### GES-029 · Manter modelos de mensagem aprovados e respostas rápidas
- `status`: conferido em parte na rodada 2 (preço por categoria)
- `nível_automação`: B
- `integrações`: gestão de modelos pela API da Meta `[NÃO VERIFICADO — conhecimento prévio]`; Chatwoot (I-07)
- `credencial_exigida`: Meta Business
- `preço`: utilidade R$ 0,035; marketing R$ 0,3217 (9,2× mais caro) [R2]
- `limites_e_riscos`: reclassificação de categoria `[NÃO VERIFICADO]` pesa 9× no custo; métricas de modelo não existem para modelos usados em grupos [R2]
- `alternativa`: —
- `veredito`: integrar, com alerta de categoria
- `confiança`: média
- `fontes_verificação`: I-05, I-07

#### GES-030 · Enviar comunicados em massa segmentados
- `status`: conferido em parte na rodada 2 (preço)
- `nível_automação`: B
- `integrações`: I-05, I-09
- `credencial_exigida`: opt-in por finalidade
- `preço`: **marketing R$ 0,3217 por mensagem** [R2]: comunicado a 300 clientes ≈ R$ 96,51
- `limites_e_riscos`: ver CON-030; limites diários por número (não conferido)
- `alternativa`: e-mail ou aviso no app (sem custo por mensagem)
- `veredito`: integrar com teto de custo e segmentação
- `confiança`: alta (preço)
- `fontes_verificação`: I-05

#### GES-031 · Gerir consentimento (opt-in/opt-out) e saúde do número oficial
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-05); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: B + construir
- `integrações`: indicadores de qualidade e limite de mensagens do número pela API/painel da Meta `[NÃO VERIFICADO — conhecimento prévio]`
- `credencial_exigida`: Meta Business
- `preço`: —
- `limites_e_riscos`: número com qualidade baixa tem limite reduzido e pode ser restrito: risco de perder o canal de todos os clientes
- `alternativa`: número de contingência verificado
- `veredito`: construir (obrigatório, não opcional)
- `confiança`: baixa
- `fontes_verificação`: I-05
- `correção`: a ficha diz "não é feito" e fonte "conhecimento do agente"; acrescentado o número de contingência e a ligação com o limite de envios
- `nota_rodada2`: WhatsApp [R2, tabela de 01/10/2026]: marketing R$ 0,3217; utilidade, autenticação e serviço R$ 0,035; 1.000 mensagens de serviço grátis por número/mês; **desde 01/10/2026 respostas acima da franquia e modelos de utilidade dentro da janela são cobrados** (o que esta ficha diz sobre gratuidade na janela fica corrigido por esta nota); Groups API até 8 participantes (I-05)

#### GES-032 · Atender mensagens e leads do Instagram e de outras redes
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-07); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: B
- `integrações`: I-08; canal do Chatwoot (I-07)
- `credencial_exigida`: conta profissional + app revisado pela Meta `[NÃO VERIFICADO]`
- `preço`: `[NÃO VERIFICADO]`
- `limites_e_riscos`: janela de 24 h
- `alternativa`: atender no app do Instagram
- `veredito`: integrar depois do WhatsApp
- `confiança`: baixa
- `fontes_verificação`: I-08
- `nota_rodada2`: Chatwoot [R2]: MIT fora do diretório `enterprise/` (I-07)

#### GES-035 · Atender fora do horário e em feriados
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-05, I-07); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: construir sobre B
- `integrações`: I-05, I-07 (horário de atendimento e mensagem automática)
- `credencial_exigida`: —
- `preço`: —
- `limites_e_riscos`: IA fora do horário só nas categorias liberadas (GES-062); jornada da equipe (GES-053)
- `alternativa`: mensagem de ausência
- `veredito`: construir
- `confiança`: média
- `fontes_verificação`: I-05, I-07
- `nota_rodada2`: WhatsApp [R2, tabela de 01/10/2026]: marketing R$ 0,3217; utilidade, autenticação e serviço R$ 0,035; 1.000 mensagens de serviço grátis por número/mês; **desde 01/10/2026 respostas acima da franquia e modelos de utilidade dentro da janela são cobrados** (o que esta ficha diz sobre gratuidade na janela fica corrigido por esta nota); Groups API até 8 participantes (I-05) · Chatwoot [R2]: MIT fora do diretório `enterprise/` (I-07)

#### GES-036 · Registrar autorizações e combinados dados pelo cliente no chat
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-05, I-13); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: construir (trilha) + B (assinatura quando o valor exigir)
- `integrações`: I-05 (mensagens com ID e horário), I-13
- `credencial_exigida`: —
- `preço`: —
- `limites_e_riscos`: força probatória da mensagem de WhatsApp vs. assinatura eletrônica `[NÃO VERIFICADO]`
- `alternativa`: confirmação por e-mail
- `veredito`: construir
- `confiança`: baixa
- `fontes_verificação`: I-05, I-13
- `nota_rodada2`: WhatsApp [R2, tabela de 01/10/2026]: marketing R$ 0,3217; utilidade, autenticação e serviço R$ 0,035; 1.000 mensagens de serviço grátis por número/mês; **desde 01/10/2026 respostas acima da franquia e modelos de utilidade dentro da janela são cobrados** (o que esta ficha diz sobre gratuidade na janela fica corrigido por esta nota); Groups API até 8 participantes (I-05) · Assinatura [R2]: com API a partir de R$ 69/mês (Clicksign Start), R$ 69,90 (ZapSign Equipe) e R$ 79,90 (D4Sign Profissional), faixa de 20 docs/mês (I-13)

#### GES-037 · Migrar o atendimento dos celulares pessoais e de grupos para o canal oficial
- `status`: conferido na rodada 2 (grupos)
- `nível_automação`: D (mudança de processo) + B
- `integrações`: **Groups API**: só para conta oficial (OBA), **até 8 participantes**, entrada por link de convite, 1 empresa da Cloud API por grupo [R2] https://developers.facebook.com/documentation/business-messaging/whatsapp/groups
- `credencial_exigida`: Official Business Account (selo) [R2]
- `preço`: tarifas normais por categoria (I-05)
- `limites_e_riscos`: grupos de clientes com mais de 8 pessoas não migram; obter OBA não é garantido `[NÃO VERIFICADO]`
- `alternativa`: conversa 1:1 no número oficial + avisos no app
- `veredito`: checklist + campanha; grupos pela API só para clientes com poucos interlocutores
- `confiança`: alta (limites da API)
- `fontes_verificação`: I-05

#### GES-038 · Medir satisfação (NPS/CSAT) e tratar detratores
- `status`: conferido em parte na rodada 2 (integrações reabertas: I-05, I-07); o restante da ficha é mantido da rodada 1 (não conferido)
- `nível_automação`: B
- `integrações`: CSAT nativo do Chatwoot (I-07) `[NÃO VERIFICADO]`; modelo de utilidade/marketing para NPS (I-05)
- `credencial_exigida`: —
- `preço`: categoria do modelo de pesquisa `[NÃO VERIFICADO]`
- `limites_e_riscos`: pesquisa pode cair em marketing
- `alternativa`: pesquisa dentro da janela, ao fim do atendimento (sem custo)
- `veredito`: construir
- `confiança`: baixa
- `fontes_verificação`: I-05, I-07
- `nota_rodada2`: WhatsApp [R2, tabela de 01/10/2026]: marketing R$ 0,3217; utilidade, autenticação e serviço R$ 0,035; 1.000 mensagens de serviço grátis por número/mês; **desde 01/10/2026 respostas acima da franquia e modelos de utilidade dentro da janela são cobrados** (o que esta ficha diz sobre gratuidade na janela fica corrigido por esta nota); Groups API até 8 participantes (I-05) · Chatwoot [R2]: MIT fora do diretório `enterprise/` (I-07)

#### GES-039 · Publicar guias, relatórios e documentos no portal com confirmação de leitura
- `status`: conferido na rodada 2 (concorrentes)
- `nível_automação`: construir (app do cliente, premissa 1)
- `integrações`: concorrentes: Domínio Portal do Cliente ("confirmação eletrônica de que seu cliente visualizou guias") [R2]; Acessórias Protocolo Digital (assinatura, data, hora, IP) e Área VIP/App white label [R2]; HubStrom AppHub [R2]; Alterdata eContador (documentos a pagar, recebidos, enviados, com status por cor) [R2]. Fonte dos documentos: Alterdata `GET /api/v1/integracao/documentos` [R2]; Domínio Processos → Portal do Cliente (sem API de leitura para terceiros `[NÃO ENCONTRADO]`)
- `credencial_exigida`: token ePlugin para espelhar documentos da Alterdata
- `preço`: —
- `limites_e_riscos`: mercado já tem app com marca própria (Acessórias, HubStrom); diferencial é espelhar **vários cores** e ter o chat com IA no mesmo app
- `alternativa`: —
- `veredito`: construir
- `confiança`: alta (concorrentes)
- `fontes_verificação`: I-01, I-02, I-17

#### GES-040 · Receber solicitações tipadas e uploads do cliente pelo portal
- `status`: conferido na rodada 2 (concorrentes e APIs)
- `nível_automação`: construir (app) + B (gravar no core)
- `integrações`: Alterdata: pré-admissão, férias, rescisão e atendimentos por API [R2]; Domínio Portal do Cliente: solicitações de serviço e cadastro de empregados pelo cliente [R2] (API para terceiros `[NÃO ENCONTRADO]`); Acessórias: chamados pelo app, NPS [R2]
- `credencial_exigida`: token ePlugin
- `preço`: —
- `limites_e_riscos`: no Domínio, a solicitação recebida no app da plataforma fica fora do Portal do Cliente até haver API
- `alternativa`: WhatsApp
- `veredito`: construir
- `confiança`: alta
- `fontes_verificação`: I-01, I-02, I-17

#### GES-048 · Importar tempo e atividades dos sistemas core
- `status`: conferido na rodada 2 (premissas 2 e 3 aplicadas)
- `nível_automação`: **B** (Alterdata, já); **B a negociar** (Domínio, Contmatic); agente de desktop só como alternativa (premissa 3)
- `integrações`: Alterdata `GET /api/v1/integracao/historico-tarefas?dataInicial=&dataFinal=`: nome, prazoEntrega, prazoLegal, **responsavel**, status, **dataConclusao**, empresa, departamento — **sem início e sem horas** [R2]. Domínio Processos mede "tempo de produção de cada tarefa" e tem relatórios de produtividade individual e por departamento [R2], mas sem API de saída pública `[NÃO ENCONTRADO]`. Contmatic Gestão do Escritório ("produtividade e fluxo de tarefas") sem API pública `[NÃO ENCONTRADO]` [R2]. Concorrente que já faz: e-Kontroll e-Monitor ("produtividade e uso do tempo da equipe") sobre dados do Domínio via e-Robô e Onvio API [R2-sec]
- `credencial_exigida`: token ePlugin (Alterdata); contrato com a TR e com a Contmatic
- `preço`: `[PREÇO NÃO PÚBLICO]`
- `limites_e_riscos`: na Alterdata, o tempo só pode ser estimado (prazo × conclusão); pedir campo de horas ou início. Ler o banco local do core segue arriscado (licença)
- `alternativa`: eventos da própria plataforma (GES-047) + apontamento assistido; agente de desktop só para core sem API
- `veredito`: integrar (B) Alterdata já; negociar TR (pedir leitura do Domínio Processos com tempo por tarefa) e Contmatic
- `confiança`: alta (Alterdata, Domínio Processos sem API pública) / média (e-Kontroll)
- `fontes_verificação`: I-01, I-02, I-03, I-17
- `correção`: rodada 1 colocava o agente de desktop como caminho principal; a premissa 2 e a API da Alterdata mudam o caminho para B

#### GES-050 · Captar reuniões e ligações do calendário
- `status`: mantido da rodada 1 (não conferido)
- `nível_automação`: A
- `integrações`: Google Calendar API, Microsoft Graph (I-09); telefonia VoIP com webhook `[NÃO VERIFICADO]`
- `credencial_exigida`: OAuth do escritório
- `preço`: sem custo de API `[NÃO VERIFICADO]`
- `limites_e_riscos`: casar participante externo ↔ cliente pelo e-mail
- `alternativa`: apontamento manual
- `veredito`: integrar
- `confiança`: média
- `fontes_verificação`: I-09

---

## 3. O que não existe ou exige robô com credencial (C-cert, C-crc, C-captcha) ou é vedado

**Status da seção:** conferida em parte na rodada 2 (linhas marcadas).

No domínio de mercado e core, o "robô com credencial" aparece quando o portal fechado é o **core** ou o **sistema de um fornecedor** e a credencial é do analista ou do cliente.

| Situação | Fichas | Nível | Por quê | Caminho recomendado | Rodada |
| --- | --- | --- | --- | --- | --- |
| Tarefas e tempo do **Domínio Processos** | GES-048, FIS-047, FIS-001 | **B a negociar** (era E) | Não há API de saída pública [R2]; o e-Kontroll lê dados do Domínio por "e-Robô" e "Onvio API" [R2-sec] | Pedir à TR acesso de leitura ao Processos; agente de desktop só se a TR recusar (premissa 3) | conferido na rodada 2 |
| Tarefas e tempo da **Alterdata** | GES-048, FIS-047 | **B** (era E) | API ePlugin pública com histórico de tarefas [R2] | Integrar | conferido na rodada 2 |
| Tarefas da **Contmatic** (Gestão do Escritório) | GES-048, FIS-047 | **B a negociar / C-crc** | Nenhuma API pública [R2] | Negociar; agente de desktop como alternativa | conferido na rodada 2 |
| Ler documentos do **Portal do Cliente (Onvio)** com usuário e senha | GES-039, GES-040 | **C-crc** | A Omie.G-Click faz isso com usuário Onvio de acesso total + MFA [R2-sec]; não é API | Evitar; pedir API à TR | conferido na rodada 2 |
| Operar a tela do core com o login do analista (RPA) | NFE-033, CTB-017, DP-011, NFE-035 | **C-crc** | Agora desnecessário para Domínio (API de entrada) e Alterdata (ePlugin) [R2] | Só para Contmatic, e só com aprovação | conferido em parte |
| Ler o banco de dados local do core | GES-048, CTB-019, NFE-035 | **C-crc** / risco contratual | Licença; quebra com versão | Evitar | mantido da rodada 1 |
| Raspar internet banking do cliente | CTB-008, CTB-012, FIS-032 | **E** | Termos do banco, fraude | Open Finance ou OFX | mantido da rodada 1 |
| Raspar portais de adquirentes | CTB-013 | **C-cert/C-crc** | API para terceiros `[NÃO ENCONTRADO]` | EDI (F) ou conciliador (B) | mantido da rodada 1 |
| Certidões com CAPTCHA fora do agregador | FIS-036, SOC-003, NFE-028 | **C-captcha** | Infosimples cobre consultas por API com adicional para as de maior custo de automação [R2]; lista de cobertura não conferida | Humano no circuito | conferido em parte |
| WhatsApp por biblioteca não oficial; grupos grandes | GES-023, GES-037 | **E** | Viola termos; Groups API oficial limita a 8 participantes e exige OBA [R2] | Cloud API (B) | conferido na rodada 2 |
| Assinatura qualificada exigida por Junta ou cartório | SOC-041, CTB-037 | **C-cert** / D | Certificado ICP do signatário (V2) | gov.br ou ICP com upload | mantido da rodada 1 |
| Declaração de Não Ocorrência (COAF/CFC) | SOC-019, CTB-049 | **C-crc** / D | API `[NÃO ENCONTRADO]` | Lembrete + checklist | mantido da rodada 1 |
| Registrato do BCB | CTB-011 | **D** | Só o titular | Pedir ao cliente | mantido da rodada 1 |
| Portais de benefícios e ponto | DP-010, DP-051 | **C-crc** / F | Um portal por fornecedor | Arquivo padrão | mantido da rodada 1 |

Regra do protocolo: **nenhuma ficha C-crc vira execução automática sem aprovação do dono do login**, e nenhuma automação de interface sobre o core entra sem leitura da licença.

---

## 4. Lacunas e perguntas a fazer

### 4.1 Perguntas aos fornecedores (atualizadas na rodada 2)

**Thomson Reuters (Domínio / Onvio / Domínio Processos)**
1. Homologação da plataforma como parceira da API de entrada (formulário "Quero ser parceiro"): prazo, custo, contrato, especificação técnica de NF-e, NFS-e, CT-e, pagamentos/recebimentos e **Rubricas**.
2. Existe ou pode existir **API de leitura do Domínio Processos** (tarefas, responsável, status, prazos, data de conclusão e o "tempo de produção de cada tarefa" que o produto já mede)? Em que condição (parceria, preço por escritório)?
3. API para publicar e ler documentos e solicitações do **Portal do Cliente** (para espelhar no app da plataforma sem usar login de usuário).
4. Leiaute de importação de **lançamentos contábeis** (fora pagamentos/recebimentos) por API ou arquivo.
5. O que a especificação em `api.onvio.com.br` cobre (premissa 2 diz: só status de integração) e se há retorno de escrituração para o parceiro.
6. Relação Gestta ↔ Domínio Processos (mesmo produto? o site do Gestta respondeu 403 nesta rodada).

**Alterdata**
7. Preço do pacote **eContador Master** e se há condição para parceiro que use o ePlugin em nome de vários escritórios.
8. Pedido de evolução do ePlugin: data de início e **horas** por tarefa; endpoint de **upload** de documentos para o eContador; envio de XML; webhooks em vez de consulta por período.
9. Limites de taxa (rate limit) e prazo de retenção do histórico de tarefas `[NÃO ENCONTRADO]` na documentação.

**Contmatic**
10. Que acesso técnico Acessórias e Jettax usam; se existe API do módulo **Gestão do Escritório** (tarefas, produtividade) e do **Contador Online**; leiautes de importação.

**Meta / provedores de WhatsApp**
11. Texto vigente dos termos da WhatsApp Business Solution sobre IA (a página exige JavaScript); confirmação de que IA do escritório para os próprios clientes é uso permitido e cobrada como serviço.
12. Requisitos para Official Business Account (necessária para a Groups API).
13. BSPs (360dialog, Twilio, Gupshup, Blip, Zenvia): mensalidade e margem sobre a tarifa em BRL.

**Chatwoot**
14. Conteúdo do diretório `enterprise/` (SLA, auditoria, CSAT, Captain) e preço da licença enterprise auto-hospedada.

**Open Finance**
15. Pluggy: o volume incluso nos R$ 2.500/mês; preço por conta PJ conectada; Belvo: preço em BRL para o Brasil; Celcoin, Klavi, TecnoSpeed: tabela.

**Agregadores de certidões**
16. Infosimples: lista de certidões cobertas para federal + SP, MG, PR, SC, RS e capitais; quais têm preço adicional.

**Assinatura**
17. Excedente por documento acima da franquia (ZapSign, D4Sign, Clicksign); assinatura com ICP-Brasil e dossiê de evidências.

**Cobrança**
18. Banco Inter: tabela oficial de boleto/Pix por API para PJ; Asaas: Pix Automático por API.

**Concorrentes**
19. Acessórias, HubStrom, Qive, Gestta/Domínio Processos, e-Kontroll, Jettax, HubCount, e-Auditoria: proposta por faixa de clientes (só a SIEG publica preço).

### 4.2 Perguntas aos contadores do escritório-piloto

20. Qual core cada setor usa e em qual pacote (Domínio One/Pro/Max; Alterdata com ou sem eContador Master; Contmatic em qual plano)?
21. O escritório já contrata Domínio Processos, Portal do Cliente, Gestão do Escritório (Contmatic) ou eTarefas? Quem faz a parametrização das tarefas?
22. Quantas mensagens de WhatsApp a equipe responde por mês (para estimar o que passa das 1.000 grátis) e quantos grupos têm mais de 8 pessoas.
23. Bancos e cooperativas da carteira; ERPs dos clientes (os homologados no Domínio já entregam direto).
24. Provedor de cobrança e de assinatura em uso.
25. Quantas certidões por mês e de quais órgãos.
26. Os clientes aceitariam enviar o próprio A1 pelo app (premissa 1)? Quantos têm A1 válido hoje?

### 4.3 Roteiro de buscas para a próxima rodada

- Termos da WhatsApp Business Solution (versão em texto, por exemplo pelo PDF ou por um BSP que os reproduza).
- Andamento do Inquérito Administrativo 08700.012397/2025-63 no SEI do CADE e decisão judicial do TRF1/JFDF.
- "Domínio Processos API" e "Gestta Thomson Reuters Domínio Processos" (relação de marca).
- Tabela de tarifas PJ do Banco Inter (site atual).
- Conteúdo de `enterprise/` no repositório do Chatwoot.
- Páginas de preço de Belvo Brasil, Celcoin, Klavi, TecnoSpeed.

### 4.4 Hosts usados nesta rodada (todos responderam, salvo indicação)

`eplugin.pack.alterdata.com.br`, `ajuda.alterdata.com.br`, `suporte.dominioatendimento.com`, `www.dominiosistemas.com.br`, `www.contmatic.com.br`, `simplifique.contmatic.com.br`, `developers.facebook.com`, `scontent-*.fbcdn.net` (planilhas de tarifas), `www.gov.br`, `tecnoblog.net`, `raw.githubusercontent.com`, `www.asaas.com`, `sejaefi.com.br`, `www.clicksign.com`, `d4sign.com.br`, `zapsign.com.br`, `infosimples.com`, `www.pluggy.ai`, `belvo.com`, `www.sieg.com`, `qive.com.br`, `acessorias.com`, `hubstrom.com`, `e-kontroll.com.br`, `ajuda.omie.com.br`, `www.jettax.com.br`, `conteudo.fiscal.io`. Sem resposta útil: `www.gestta.com.br` (403), `api.gestta.com.br` (503), `api.onvio.com.br` (404), `docs.celigo.com` (403), `www.whatsapp.com/legal` (só JavaScript), `inter.co/empresas/tarifas/` (404), `developers.thomsonreuters.com` (página vazia).

### 4.5 Resumo para a Etapa 3

| Nível | Fichas (parte de mercado/core) |
| --- | --- |
| **B por API do core** (novo na rodada 2) | Alterdata: GES-048, FIS-001, FIS-003, FIS-047, FIS-036 (CND), FIS-010 (recálculo DAS), DP-001, DP-011, DP-020, CTB-017, GES-039, GES-040. Domínio (entrada, via parceria): NFE-033, DP-011 (rubricas), CTB-017 (pagamentos/recebimentos) |
| **B a negociar** (core sem API pública) | Domínio Processos (GES-048, FIS-001, FIS-003, FIS-047), Portal do Cliente (GES-039, GES-040), Contmatic (todas as fichas de core) |
| **F** (arquivo com o core) | Contmatic em NFE-033, NFE-034, CTB-017, DP-011, DP-010; Alterdata em NFE-033 (XML por pasta); NFE-035, CTB-019, CTB-020, DP-022, SOC-023, SOC-024 |
| **B** (fornecedor com API) | WhatsApp e atendimento (GES-023 a GES-038, FIS-010, FIS-016, FIS-033, FIS-044, NFE-012, NFE-015, NFE-037, NFE-038, CTB-002 a CTB-006, CTB-028, CTB-029, DP-001, DP-002, DP-009, DP-012, DP-019, DP-020, DP-058, CON-001, CON-030); Open Finance (CTB-008, CTB-010, CTB-012, CTB-014, CTB-034, FIS-032, DP-021); certidões (FIS-036, FIS-030, SOC-001, SOC-003, SOC-004, SOC-019, NFE-028, CON-018); assinatura (SOC-016, SOC-018, SOC-020, SOC-041, DP-005, DP-024, DP-030, CTB-037, CTB-039, CON-003, GES-005); cobrança (GES-001 a GES-009, CON-007, CON-036); ERPs (CTB-007, NFE-005); emissão (NFE-039, GES-007) |
| **A** (API gratuita de mercado) | GES-027, GES-050 |
| **Construir** | SOC-008 (com A1 enviado pelo cliente no app), SOC-009, SOC-015, SOC-034, FIS-037, NFE-001, NFE-004, NFE-036, CTB-009, CTB-015, CTB-016, DP-060, GES-010 |
| **D** | NFE-002, CTB-011, DP-051, GES-037 (grupos grandes) |
| **E** | nenhuma ficha do domínio fica em E por falta de API do core depois da premissa 2 (GES-048 saiu de E) |

Custos de referência confirmados nesta rodada (escritório hipotético com 300 clientes, 1 número de WhatsApp): WhatsApp ≈ R$ 91/mês; certidões ≈ R$ 212/mês (1.200 consultas Infosimples); cobrança de honorários ≈ R$ 645/mês (Asaas, 300 Pix/boletos); assinatura a partir de R$ 69,90/mês (ZapSign Equipe, 20 docs); Open Finance a partir de R$ 2.500/mês (Pluggy). Os volumes são hipóteses do agente; os preços unitários são [R2].

---

## 5. Contatos e próximos passos com fornecedores/órgãos

| # | Fornecedor / órgão | Canal oficial encontrado (06/11/2026) | O que pedir | Quem no escritório | Prioridade |
| --- | --- | --- | --- | --- | --- |
| 1 | **Thomson Reuters — Domínio** (parceria de API) | Formulário "Seja nosso parceiro / Quero ser parceiro" em https://www.dominiosistemas.com.br/solucoes/integracao-com-erp/#sejaParceiro [R2]; comercial por unidade de negócio, conforme a solução 7456 (https://suporte.dominioatendimento.com/central/faces/solucao.html?codigo=7456) [R2]; página geral https://www.dominiosistemas.com.br/contato | Homologação para a API de entrada (perguntas 1, 4, 5); **API de leitura do Domínio Processos e do Portal do Cliente** (2, 3); condição comercial (parceria ou pagamento) | Fundador (técnico) + contador que já é cliente Domínio (relação comercial) | **Alta** — maior base de cores; destrava NFE-033, DP-011, GES-048 |
| 2 | **Alterdata — ePlugin** | **api_econtador@alterdata.com.br** (suporte técnico do ePlugin, citado na documentação) [R2]; documentação https://eplugin.pack.alterdata.com.br | Preço do eContador Master (7); evolução do ePlugin: horas e início por tarefa, upload de documentos, XML, webhooks, rate limit (8, 9); condição para parceiro | Fundador | **Alta** — API já existe; dá para começar o piloto técnico com o token de um escritório cliente |
| 3 | **Contmatic** | https://www.contmatic.com.br/contato ("Fale com comercial"; atendimento seg–sex 8h30–17h30) [R2] | Mesmo acesso dado a Acessórias e Jettax (10); API da Gestão do Escritório e do Contador Online | Fundador + contador cliente Contmatic, se houver | Média — depende de haver cliente-piloto em Contmatic |
| 4 | **Meta (WhatsApp)** | Billing Hub e suporte da conta Meta Business (sem contato comercial público para pequenas empresas) `[NÃO ENCONTRADO]` | Abrir conta de mensagens **em BRL** desde o início (migração obrigatória até 30/06/2027 [R2]); forma de pagamento cadastrada; pedir OBA se for usar grupos (12) | Fundador | Alta (antes do piloto de atendimento) |
| 5 | **CADE** | Acompanhar o Inquérito 08700.012397/2025-63 pelo SEI/notícias do CADE (https://www.gov.br/cade/pt-br/assuntos/noticias) [R2] | Só monitorar; não afeta o uso da plataforma (IA do próprio escritório) | Fundador | Baixa |
| 6 | **Pluggy / Belvo** | https://www.pluggy.ai/precos ("Fale com a gente"); https://belvo.com/plans-and-pricing/ ("Contact Sales") [R2] | Cotação formal (15) quando houver volume | Fundador | Baixa no MVP |
| 7 | **Infosimples** | https://infosimples.com/consultas/precos/ (conta com R$ 100 de crédito para teste) [R2] | Lista de cobertura e preços adicionais (16); abrir conta de teste | Fundador | Média |
| 8 | **ZapSign / D4Sign / Clicksign** | Páginas de planos (I-13) [R2] | Excedente, ICP-Brasil, dossiê (17); teste da API no plano mais barato com API | Fundador | Média |
| 9 | **Asaas / Efí / Inter** | https://www.asaas.com/precos-e-taxas · https://sejaefi.com.br/tarifas [R2]; Inter `[NÃO ENCONTRADO]` | Pix Automático por API no Asaas; tabela do Inter (18) | Fundador + financeiro do escritório | Média |
| 10 | **Concorrentes** (Acessórias, HubStrom, e-Kontroll, Qive, SIEG) | Formulários "Solicite uma demonstração"; e-Kontroll pelo WhatsApp comercial indicado no site [R2] | Proposta por faixa de clientes (19); ver ao vivo o app do cliente e a API/MCP da Acessórias | Contadores (como clientes potenciais) | Média — benchmark antes de fechar o escopo do app |

**Ordem sugerida:** (1) Alterdata: e-mail técnico esta semana e teste com o token de um escritório que já tenha eContador Master; (2) TR: formulário de parceiro + conversa comercial pelo contador cliente Domínio, levando a lista de perguntas 1 a 6; (3) Meta: abrir a conta em BRL; (4) demonstrações de Acessórias e HubStrom para calibrar o app do cliente; (5) Contmatic, se houver cliente-piloto.

---

## Rodada 3 (6/11/2026): fichas do ciclo de vida

**Escopo:** as 73 fichas novas do ciclo de vida (D1 a D7, fichas `-1xx`, e CIC-001 a CIC-011 de [L1](L1-ciclo-de-vida.md)). Aqui entram só as **30 fichas que dependem deste domínio**: API ou arquivo dos cores (Alterdata, Domínio, Contmatic), importação e exportação de saldos e históricos entre cores, assinatura eletrônica, cobrança, WhatsApp, Open Finance, guarda e LGPD do lado do fornecedor. As outras 43 dependem só de portais públicos (V1, V2) ou são internas, sem nada de mercado para conferir.

**Método:** 11 buscas na web (cota compartilhada de 18); páginas baixadas com `curl` em 06/11/2026 e lidas como texto; conteúdo baixado tratado como dado. **[R3]** = fonte oficial aberta nesta rodada; **[R3-sec]** = fonte secundária aberta nesta rodada (ajuda de parceiro do fornecedor); [R2] = conferido na rodada 2 deste arquivo (seção 1), no mesmo dia.

**Não abertos nesta rodada:** texto da LGPD no Planalto (`planalto.gov.br` não respondeu pelo proxy: conexão fechada sem resposta, erro 52 do curl); termos da WhatsApp Business Solution (só com JavaScript, como na rodada 2); preço do eContador Master e de Domínio Processos (continuam sem página pública).

### R3.0 Fontes novas desta rodada

| Fonte (aberta em 06/11/2026) | O que confirmou |
| --- | --- |
| Domínio, solução 7584: https://suporte.dominioatendimento.com/central/faces/solucao.html?codigo=7584 [R3] | Lançamentos de **outro escritório que usa Domínio** são exportados em *Utilitários > Exportação > Lançamentos* (TXT) e importados em *Utilitários > Importação > Importador*, com o conjunto padrão "Lançamentos Contábeis em Lote (Leiaute Domínio Sistemas)". O código da empresa precisa ser igual ao do arquivo e o plano de contas precisa ter os mesmos códigos |
| Domínio, solução 11874: https://suporte.dominioatendimento.com/central/faces/solucao.html?codigo=11874 [R3] | Importação do plano da **ECD anterior** (TXT com registros 0000, I050, I150, I155) em *Relatórios > Informativos > SPED Contábil > Outros Dados > Alteração plano de contas*. O sistema faz o **de-para automático**, deixa contas "Pendente" para vínculo manual, aceita várias contas antigas numa só e gera o **I157**. A solução diz: "geralmente por mudança de plano de contas, sistema contábil ou contador" |
| Domínio, solução 9817: https://suporte.dominioatendimento.com/central/faces/solucao.html?codigo=9817 [R3] | O Conta Azul envia **lançamentos contábeis** para um painel de importação do Domínio, e o usuário importa manualmente. Logo existe um canal de lançamentos contábeis para esse parceiro, que não aparece no escopo público da API de entrada (I-01) |
| Domínio, soluções 7873 e 10852: https://suporte.dominioatendimento.com/central/faces/solucao.html?codigo=7873 · https://suporte.dominioatendimento.com/central/faces/solucao.html?codigo=10852 [R3] | O Domínio Folha **importa do próprio Portal do eSocial**, com o certificado digital da empresa configurado no sistema (A1 no Gerenciador de Certificados ou token A3 no Domínio Web), em rotina que pode ser agendada. Importa filiais, serviços (só os que têm S-1005), cargos, sindicatos, jornadas, colaboradores e alterações cadastrais, contratuais e salariais. **Não importa** rescisões, afastamentos, folhas de pagamento, ocorrência SEFIP, **períodos aquisitivos** (risco de férias em dobro) nem o FPAS do S-1020. Pré-requisitos: empresa cadastrada com regime definido; colaboradores ainda não cadastrados (se já houver, usar "Conversão de Dados"); parâmetro "Empresa já enviada anteriormente = Sim" com a competência de início |
| Alterdata, Implantar Saldos: https://ajuda.alterdata.com.br/wcont/criar-lancamentos-contabil/implantar-saldos-contabil · https://ajuda.alterdata.com.br/x/pwpEF [R3] | Implantação de saldos iniciais por **preenchimento manual** ou **importação do arquivo ECD**. Pelo arquivo, a empresa é identificada pelo CNPJ, a data de implantação é a data final da ECD, o vínculo entre o plano antigo e o atual é automático e o **I157 é configurado automaticamente**. Contas de resultado só entram se a ECD não terminar em 31/12; não implanta saldos consolidados |
| Alterdata, importação TXT: https://ajuda.alterdata.com.br/bdcc/como-importar-lancamentos-para-o-sistema-contabil-em-txt-150435497.html [R3] | Lançamentos por TXT em *Lançamentos > Importação Financeira*, com o leiaute "Importação Personalizada - Texto" ou um leiaute próprio |
| Alterdata, eSocial no WDP: https://ajuda.alterdata.com.br/dpbase/esocial-como-importar-eventos-xml-de-outros-sistemas-112343272.html [R3] | Opção "Importar eventos gerados em outro sistema"; a Central eSocial importa XML de outro sistema, inclusive "Remunerações - Outros Sistemas" |
| Alterdata, Serviços de Conversão de Dados: https://ajuda.alterdata.com.br/cdd/servicos-prestados-conversao-de-dados-216227482.html [R3] | Serviço da própria Alterdata: conversão de outros sistemas, **conversão eSocial** (a partir do XML do Portal), **conversão SPED Contábil** (movimentos da ECD de qualquer sistema de origem) e **unificação de duas bases Alterdata**. Sem preço na página → `[PREÇO NÃO PÚBLICO]` |
| Alterdata ePlugin: https://eplugin.pack.alterdata.com.br [R3] | Reaberta: os endpoints são os mesmos da rodada 2 (I-02). Para o ciclo de vida importa que **não há endpoint de escrita de tarefas** (só `GET /integracao/historico-tarefas`), nem de cadastro de empresa (empresas só `GET`), nem de tabelas do eSocial, nem de leitura de saldos ou balancete. Para escrita existem `POST /movimentos`, `/candidatos`, `/agendamentos-ferias`, `/notificacoes-rescisao`, `/integracao/atendimentos` e `/integracao/integracaoAlterdata` (TXT de lançamentos) |
| Omie (parceiro), importação no Contmatic: https://ajuda.omie.com.br/pt-BR/articles/9010782-importando-os-lancamentos-contabeis-no-sistema-contmatic [R3-sec] | No Contmatic, *Auxiliar > Importações > Layout Contmatic* importa **lançamentos contábeis em TXT ou XLS**, por lote, número e data. O leiaute oficial da Contmatic não foi achado `[NÃO ENCONTRADO]` |
| Pluggy, gestão de consentimento: https://docs.pluggy.ai/en/docs/integration-checklist/consent-management.md · índice https://docs.pluggy.ai/llms.txt [R3] | `DELETE /items/{itemId}` devolve `204`; depois disso, `GET /items/{itemId}` e os produtos do item devolvem `404`. A Pluggy diz que a opção de revogar precisa estar sempre disponível ao usuário "to be in compliance with Open Banking regulations". Também há `GET /consents` e `GET /consents/{id}` |
| Asaas, preços: https://www.asaas.com/precos-e-taxas [R3] | Pix e boleto a **R$ 2,15 por transação recebida** (R$ 1,08 nos 3 primeiros meses); notificação por WhatsApp R$ 0,55; e-mail e SMS R$ 0,99 por pacote; NF R$ 0,49; negativação Serasa R$ 9,90; consulta Serasa R$ 16,99; carnês e assinaturas por boleto. Confere com a rodada 2 |
| Asaas, API: https://docs.asaas.com/reference/llms.txt · https://docs.asaas.com/reference/pix-automático.md (atualizado em 03/09/2026) [R3] | A API tem grupos Cobranças, Parcelamentos, **Assinaturas**, Link de pagamentos, Notas fiscais, Negativações, Webhooks e **Pix Automático** (criar e cancelar autorizações, instruções de pagamento, retentativas). Isso responde em parte à pergunta 18 da seção 4: o **Pix Automático por API existe no Asaas**. A tarifa própria do Pix Automático não aparece na página de preços `[NÃO ENCONTRADO]` |
| ZapSign, planos: https://zapsign.com.br/planos-pre%C3%A7os [R3] | Plano **Equipe** com **API, WhatsApp e MCP**: R$ 69,90/mês (20 documentos), R$ 119,90 (80); anual equivalente a R$ 49,90 e R$ 99,90/mês. Confere com a rodada 2 |
| Meta, opt-in: https://developers.facebook.com/documentation/business-messaging/whatsapp/getting-opt-in [R3] | Exige opt-in que diga claramente que a pessoa aceita receber mensagens e **de qual empresa**, cumprindo a lei aplicável. O método fica a critério da empresa (site, SMS, telefone, papel). A Meta recomenda opt-in por categoria de mensagem e um opt-out claro e respeitado |

Buscas sem resultado oficial (registradas para não repetir): API do Domínio Processos ou "Onvio Processos" para terceiros `[NÃO ENCONTRADO]`; API ou portal de desenvolvedores da Contmatic `[NÃO ENCONTRADO]`; leiaute oficial de saldos iniciais no Domínio (fora a importação de lançamentos e a do I157) `[NÃO ENCONTRADO]`; importação de ECD para saldos no Contmatic `[NÃO ENCONTRADO]`; serviço de conversão de dados da Thomson Reuters para quem migra para o Domínio `[NÃO ENCONTRADO]` (só um relato de fórum de 2016).

### R3.1 Conclusão transversal: troca de dados entre cores na transição

1. **Nenhum dos três cores aceita saldos, plano de contas ou cadastros por API pública.** A API de entrada do Domínio cobre documentos fiscais, pagamentos/recebimentos e rubricas [R2]. O ePlugin da Alterdata aceita lançamentos contábeis em TXT (`POST /integracao/integracaoAlterdata`) [R3], mas não tem rota de implantação de saldos nem de cadastro de empresa. A Contmatic não tem API pública [R2]. Por isso, nas fichas que diziam "carga no core B (Domínio, Alterdata)", o certo é **F**, com B parcial só para lançamentos na Alterdata.
2. **A ECD anterior é o melhor arquivo de troca.** O Domínio importa dela o plano antigo e gera o I157 com de-para automático (sol. 11874) [R3]. A Alterdata implanta os saldos direto da ECD e configura o I157 (Implantar Saldos) [R3]. A plataforma deve obter a ECD do anterior (CIC-002, CTB-102) e propor o de-para antes. A carga quem faz é o core.
3. **Lançamentos históricos** entram por arquivo nos três cores: TXT "Lançamentos Contábeis em Lote" no Domínio (sol. 7584) [R3], "Importação Personalizada - Texto" na Alterdata [R3] e "Layout Contmatic" TXT/XLS [R3-sec]. A plataforma pode **gerar** esses arquivos (nível F).
4. **Folha:** o Domínio busca no Portal do eSocial, com o certificado da empresa, os cadastros e as alterações. A Alterdata importa XML de outro sistema e vende a conversão eSocial. Nos dois casos ficam de fora **períodos aquisitivos, afastamentos, folhas e rescisões** (Domínio, sol. 7873) [R3]. A plataforma deve gerar a lista desses saldos para conferência manual (DP-104).
5. **Tarefas nos cores:** não há API de escrita de tarefas em nenhum core (ePlugin só lê o histórico [R3]; Domínio Processos e Contmatic sem API pública [R3, buscas]). Portanto "criar ou encerrar tarefas nos cores" (CIC-001, GES-108) é **D-assistido**: a plataforma lista o que fazer e o analista executa no core. A leitura de tarefas é **B só na Alterdata**.

### R3.2 Verificação por ficha

Formato: nível proposto na ficha → nível verificado (só a parte deste domínio), integração, credencial, preço, confiança, fontes.

#### Clientes e Societário (D1)

**SOC-101 · Biblioteca de modelos e minutas** — Próprio → **Próprio (confirmado)**; assinatura **B**.
- Integração: ZapSign (API e MCP no plano Equipe) [R3]; alternativas D4Sign Profissional (API Premium, R$ 79,90) e Clicksign Start (R$ 69) [R2].
- Credencial: token de API da conta do escritório no fornecedor (contrato).
- Preço: ZapSign Equipe R$ 69,90/mês por 20 documentos; R$ 119,90 por 80 (06/11/2026) [R3].
- Confiança: alta. Fontes: https://zapsign.com.br/planos-pre%C3%A7os; I-13.

**SOC-107 · Fechar as responsabilidades de saída com o sucessor** — Próprio → **Próprio (confirmado)**. A integração "tarefas do core por API de processos (B)" foi **corrigida**:
- Integração: **B só na Alterdata**, só para leitura (`GET /api/v1/integracao/historico-tarefas`: nome, prazos, responsável, status, conclusão) [R3]. **Domínio Processos e Contmatic: sem API pública** `[NÃO ENCONTRADO]` (busca R3) → B a negociar; enquanto isso, checklist próprio da plataforma (Próprio) e conferência manual no core.
- Credencial: token do escritório gerado no eContador (pacote eContador Master) [R2/R3].
- Preço: eContador Master `[PREÇO NÃO PÚBLICO]`; Domínio Processos `[PREÇO NÃO PÚBLICO]`.
- Confiança: alta (Alterdata), média (ausência no Domínio e no Contmatic). Fontes: https://eplugin.pack.alterdata.com.br; I-01; I-03.

**SOC-108 · Retenção e descarte de dados do ex-cliente (LGPD)** — Próprio → **Próprio (confirmado)**; integração "nenhuma externa" confirmada.
- A parte de mercado é desligar os dados guardados em fornecedores: revogar o item na Pluggy (`DELETE /items/{id}`, ver CTB-111) [R3], apagar o A1 e os documentos do cofre próprio e remover os contatos da base de WhatsApp (opt-out) [R3].
- Base legal: o texto da LGPD (arts. 16 e 39) **não foi reaberto** (Planalto inacessível nesta rodada) → V1 deve confirmar.
- Credencial: nenhuma. Preço: sem custo externo.
- Confiança: média. Fontes: https://docs.pluggy.ai/en/docs/integration-checklist/consent-management.md.

**SOC-110 · Avaliar baixa ou inatividade** — Próprio → **Próprio (confirmado)**. A integração "dados de movimento do core (B)" foi **corrigida para F**: nenhum core expõe movimento, saldo ou balancete para leitura por API (o ePlugin não tem rota de leitura contábil ou fiscal; a API do Domínio é só de entrada) [R3/R2]. O movimento vem de relatório ou arquivo exportado do core (balancete, ECD, EFD) ou da captura própria de notas (D3).
- Credencial: nenhuma (arquivo enviado pelo analista). Preço: sem custo externo.
- Confiança: alta. Fontes: https://eplugin.pack.alterdata.com.br; https://www.dominiosistemas.com.br/solucoes/integracao-com-erp/ (R2).

#### Fiscal (D2)

**FIS-103 · Conferir o histórico fiscal herdado** — o nível A (Integra Contador) cabe ao V1. Parte F **confirmada**: os arquivos do core do anterior chegam como SPED (EFD, ECD) e TXT de lançamentos; não há API entre cores [R3].
- Credencial: nenhuma para os arquivos. Confiança: alta para a parte F.

**FIS-104 · Inventariar créditos e saldos credores herdados** — F → **F (confirmado)**. Nenhum core oferece por API a leitura de saldo credor, crédito de PIS/Cofins ou PER/DCOMP; a fonte é o arquivo do anterior (EFD ICMS/IPI, EFD-Contribuições, ECF). A Alterdata vende conversão do SPED Contábil, mas não de créditos fiscais [R3].
- Credencial: nenhuma. Preço: sem custo externo. Confiança: média (é uma ausência).

#### Notas fiscais (D3)

**NFE-103 · Parametrização de entrada do cliente no core** — Próprio + F → **Próprio + F (confirmado)**. A ressalva "B se a API do core aceitar cadastros" foi **resolvida: não aceita**. A API de entrada do Domínio cobre documentos, pagamentos e rubricas, não acumuladores, produtos ou de-para de CFOP [R2]. O ePlugin não tem rota de cadastro fiscal [R3]. A carga é feita no core pelo analista, com a proposta gerada pela plataforma (D-assistido na carga). No Domínio, os parâmetros podem ser copiados de outra empresa (rodada 1; o título da solução 9257, "importar plano de contas de outra empresa", foi visto na busca, mas a página não foi aberta).
- Credencial: login do analista no core. Confiança: alta.

#### Trabalhista e DP (D4)

**DP-104 · Assumir o eSocial e a folha a partir da competência de corte** — F → **F (confirmado, com detalhe novo)**.
- Integração: **Domínio** importa direto do Portal do eSocial, com o certificado da empresa no sistema, em rotina agendável (sol. 10852) [R3]. **Alterdata** importa XML de outro sistema no WDP e vende o serviço "Conversão eSocial" [R3]. **Contmatic** `[NÃO ENCONTRADO]`.
- Não migram (Domínio, sol. 7873) [R3]: rescisões, afastamentos, folhas anteriores, ocorrência SEFIP, **períodos aquisitivos** e FPAS do S-1020. A plataforma deve gerar essa lista de pendências para o primeiro fechamento assistido.
- Credencial: A1 (ou A3) da empresa cliente instalado no core; isso combina com a premissa 1 (A1 enviado pelo cliente no app).
- Preço: rotina inclusa no core; conversão Alterdata `[PREÇO NÃO PÚBLICO]`.
- Confiança: alta (Domínio, Alterdata). Fontes: soluções 7873 e 10852; https://ajuda.alterdata.com.br/dpbase/esocial-como-importar-eventos-xml-de-outros-sistemas-112343272.html; https://ajuda.alterdata.com.br/cdd/servicos-prestados-conversao-de-dados-216227482.html.

**DP-105 · Preparar o empregador novo antes da primeira admissão** — Próprio → **Próprio (confirmado)**. A integração "tabelas enviadas pelo core (B ou F)" foi **corrigida**: nenhum core recebe por API as tabelas S-1000 a S-1020 (o ePlugin não tem essa rota; a API de rubricas do Domínio lança valores na folha, não cadastra tabelas) [R3/R2]. O core gera e transmite as tabelas; a plataforma faz a orquestração e o checklist (D-assistido no ato). Na Alterdata, depois das tabelas, a admissão pode entrar por `POST /api/v1/candidatos` (Pré-Admissão) [R3] → B.
- Credencial: token ePlugin (Alterdata). Confiança: alta.

**DP-108 · Encerrar o DP na baixa** — F → **F + B parcial (corrigido)**. Na Alterdata, a notificação de cada rescisão pode ser enviada por `POST /api/v1/notificacoes-rescisao` [R3] (B). O cálculo, o S-1299 e o encerramento do empregador continuam no core (F/D-assistido). No Domínio e no Contmatic não há API para isso.
- Credencial: token ePlugin. Preço: eContador Master `[PREÇO NÃO PÚBLICO]`. Confiança: alta.

**DP-109 · Guarda, devolução e descarte dos dados de empregados** — Próprio → **Próprio (confirmado)**; sem integração externa. Prazos legais: V1. Confiança: alta para a parte de mercado (nada a integrar).

#### Contábil (D5)

**CTB-103 · Conferir e implantar os saldos de abertura herdados** — Próprio → **Próprio (confirmado)**. A integração "carga no core B (Domínio, Alterdata) ou F (Contmatic)" foi **corrigida para F nos três**:
- Domínio: lançamento de abertura por TXT "Lançamentos Contábeis em Lote" (sol. 7584) [R3]; leiaute próprio de saldos iniciais `[NÃO ENCONTRADO]`.
- Alterdata: "Implantação de Saldos" importando a **ECD** do anterior, com I157 automático, ou digitação manual [R3]. B parcial possível por `POST /integracao/integracaoAlterdata` (TXT de lançamentos) [R3], mas a documentação não trata implantação de saldos.
- Contmatic: "Layout Contmatic" TXT/XLS [R3-sec].
- Credencial: login do analista no core (F); token ePlugin para o B parcial.
- Preço: sem custo externo.
- Confiança: alta (Domínio, Alterdata), média (Contmatic). Fontes: soluções 7584 e 11874; https://ajuda.alterdata.com.br/wcont/criar-lancamentos-contabil/implantar-saldos-contabil.

**CTB-104 · De-para do plano de contas e registro I157** — Próprio + F → **Próprio + F (confirmado com fonte oficial)**. O Domínio importa a ECD anterior e faz de-para automático, com pendências para vínculo manual e várias contas numa só (sol. 11874) [R3]. A Alterdata configura o I157 automaticamente ao implantar saldos pela ECD [R3]. Contmatic `[NÃO ENCONTRADO]`. O agente propõe o de-para e o analista o confirma no core.
- Credencial: login do analista no core. Confiança: alta.

**CTB-105 · Dividir ECD, ECF e demonstrações no ano da troca** — Próprio + F → **confirmado**. A geração e a transmissão são do core; nenhuma API. Confiança: alta.

**CTB-107 · Reconstituir escrituração atrasada herdada** — Próprio → **Próprio (confirmado)**. A integração "carga no core B ou F" foi **corrigida para F** (lançamentos em lote por TXT nos três cores [R3/R3-sec]), com **B parcial na Alterdata** (`POST /integracao/integracaoAlterdata`, TXT no leiaute do Contábil Windows) [R3]. A Alterdata também vende "Conversão SPED Contábil", que traz movimentos de uma ECD de qualquer sistema [R3] `[PREÇO NÃO PÚBLICO]`.
- Credencial: login no core; token ePlugin. Confiança: alta.

**CTB-108 · Implantar a contabilidade da empresa nova** — Próprio → **Próprio (confirmado)**. A integração "core B ou F" foi **corrigida para F/D-assistido**: nenhum core cria empresa ou plano de contas por API (ePlugin `GET /empresas`, sem `POST`) [R3]. O plano pode ser importado de outra empresa no Domínio (título da sol. 9257 visto na busca, página não aberta).
- Credencial: login no core. Confiança: alta (ausência no ePlugin), média (Domínio).

**CTB-109 · Entregar o pacote contábil ao sucessor** — Próprio + F → **confirmado**. No Domínio, a exportação de lançamentos é em *Utilitários > Exportação > Lançamentos* (TXT), e o sucessor que usa Domínio importa direto (sol. 7584) [R3]. Para sucessor em outro core, o arquivo universal é a **ECD**, que Alterdata e Domínio leem [R3].
- Credencial: nenhuma. Confiança: alta.

**CTB-110 · Encerrar a contabilidade na baixa** — F → **F (confirmado)**. ECD e ECF de extinção são geradas no core. Confiança: alta.

**CTB-111 · Encerrar consentimentos do Open Finance e integrações** — B → **B (confirmado; o endpoint que faltava foi verificado)**.
- Integração: Pluggy `DELETE /items/{itemId}` → `204`, e depois `404` para o item e os produtos [R3]; consulta por `GET /consents`. Belvo: endpoint equivalente não aberto `[NÃO VERIFICADO]`. Chave do Onvio por empresa (Domínio): revogação no Onvio Gestão `[NÃO VERIFICADO]`.
- Credencial: credenciais de API da plataforma no agregador (contrato); consentimento do cliente.
- Preço: incluso no plano Pluggy (dados a partir de R$ 2.500/mês [R2]); a exclusão não é cobrada à parte, até onde a documentação mostra.
- Confiança: alta (Pluggy). Fontes: https://docs.pluggy.ai/en/docs/integration-checklist/consent-management.md; https://docs.pluggy.ai/llms.txt.

#### Consultoria (D6)

**CON-105 · Encerrar projetos consultivos e apurar o êxito na saída** — Próprio → **confirmado**. A cobrança é feita por cobrança avulsa ou parcelamento na API do Asaas [R3] (B; ver GES-103). Confiança: alta.

**CON-106 · Planejar a tributação do encerramento** — Próprio → **Próprio (confirmado)**. A integração "dados do core por B ou F" foi **corrigida para F**: não há leitura de saldos por API em nenhum core (ver SOC-110). A fonte é o balancete ou a ECD exportados. Confiança: alta.

#### Gestão e atendimento (D7)

**GES-103 · Cobrar implantação, regularização e primeira mensalidade proporcional** — B → **B (confirmado)**.
- Integração: Asaas, API de Cobranças, Parcelamentos e Assinaturas, com webhooks [R3]; Efí como alternativa [R2]; Banco Inter `[NÃO ENCONTRADO]` (como na rodada 2).
- Credencial: chave de API da conta Asaas do escritório (contrato).
- Preço: Pix ou boleto **R$ 2,15 por cobrança recebida** (R$ 1,08 nos 3 primeiros meses); NF R$ 0,49; WhatsApp do Asaas R$ 0,55 (06/11/2026) [R3]. Efí: boleto R$ 3,45; Pix pela API 1,19% [R2].
- Confiança: alta. Fontes: https://www.asaas.com/precos-e-taxas; https://docs.asaas.com/reference/llms.txt.

**GES-104 · Ativar o cliente novo no app e nos canais** — Próprio + B (WhatsApp) → **confirmado**.
- Opt-in: a Meta exige que fique claro o aceite e o nome da empresa, com método livre (o app serve) [R3]. Registrar o opt-in por categoria (guias, cobranças, avisos) e oferecer opt-out.
- Credencial: conta Meta Business verificada e forma de pagamento [R2].
- Preço: utilidade e serviço R$ 0,035; 1.000 mensagens de serviço grátis por número por mês [R2].
- Confiança: alta. Fonte: https://developers.facebook.com/documentation/business-messaging/whatsapp/getting-opt-in.

**GES-106 · Acompanhar a implantação nos primeiros 90 dias** — Próprio → **confirmado**. As "APIs de processos dos cores (B)" se reduzem à **leitura na Alterdata**, sem data de início nem horas [R3]; Domínio e Contmatic a negociar. O custo da implantação sai do timesheet próprio, não do core. Confiança: alta.

**GES-108 · Desativar o cliente que sai** — Próprio → **Próprio (confirmado)**. A parte "tarefas recorrentes encerradas nos cores" foi **corrigida para D-assistido**: nenhum core permite encerrar tarefas por API (o ePlugin não tem escrita de tarefas [R3]; nos outros, não há API). Remover contatos e opt-in no WhatsApp e cancelar a assinatura no Asaas (API Assinaturas [R3]) são B.
- Credencial: chave Asaas. Confiança: alta.

**GES-109 · Precificar e cobrar o encerramento da empresa** — B → **B (confirmado)**. Mesma integração e mesmo preço de GES-103; parcelamento por API [R3]. Confiança: alta.

#### Ciclo de vida (L1)

**CIC-001 · Estado do ciclo de vida e orquestração** — Próprio → **Próprio (confirmado)**. "Tarefas nos cores pelas APIs de processos (B)" foi **corrigido**: B só para **ler** tarefas na Alterdata. Criar tarefas nos cores é D-assistido em todos (não há API de escrita) [R3]. A orquestração deve morar na plataforma, não no core. Confiança: alta.

**CIC-003 · Dossiê único de saída com manifesto e termo assinado** — Próprio + B → **confirmado**. ZapSign Equipe com API, R$ 69,90/mês por 20 documentos [R3]. O manifesto com hash é próprio. Confiança: alta.

**CIC-005 · Receber uma carteira em bloco** — Próprio + B → **confirmado**, com informação nova: quando as duas carteiras usam Alterdata, existe o serviço de **"Unificação" de duas bases Alterdata** e o de conversão de outros sistemas [R3] `[PREÇO NÃO PÚBLICO]`. No Domínio, lançamentos passam de um escritório a outro por TXT (sol. 7584) [R3]. As anuências em lote seguem pela assinatura eletrônica (B). Confiança: alta.

**CIC-007 · Atender o ex-cliente depois da saída** — Próprio → **confirmado**. Acervo em somente leitura na guarda própria; nada a integrar. Confiança: alta.

### R3.3 Efeito para o consolidador

- Correções de integração (o nível final da ficha não muda): SOC-107, SOC-110, NFE-103, DP-105, CTB-103, CTB-107, CTB-108, CON-106, GES-106, GES-108 e CIC-001 deixam de contar com "B do core" para saldos, cadastros ou escrita de tarefas. Passam a F/D-assistido, com B parcial só na Alterdata.
- Muda de nível só **DP-108**: de F para **F + B parcial** (notificação de rescisão no ePlugin).
- Resolvido: endpoint de revogação do Open Finance (CTB-111, Pluggy); Pix Automático por API no Asaas (pergunta 18).
- Perguntas novas para os fornecedores (completam a seção 4.1): (a) TR: há leiaute ou API para **saldos iniciais** e **cadastro de empresa e plano**? O canal de lançamentos contábeis usado pelo Conta Azul (sol. 9817) é aberto a parceiros? (b) Alterdata: o `integracaoAlterdata` aceita lançamento de abertura numa data de implantação? Há previsão de escrita de tarefas? Qual o preço da conversão eSocial e SPED? (c) Contmatic: leiaute oficial de importação de lançamentos e de saldos.

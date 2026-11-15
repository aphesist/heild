# Ordem de implementação das APIs do Contábil

**Versão 0.2 · 15/11/2026 · desenho.** Em que ordem construir a API interna ([`API_INTERNA.md`](API_INTERNA.md)) e ligar as APIs externas ([`CATALOGO_CONTABIL.md`](CATALOGO_CONTABIL.md)), em sincronia com as fases do backend ([`../backend/ARQUITETURA.md`](../backend/ARQUITETURA.md), seção 7).

O stack é o que o dono aceitou em 15/11/2026 (`docs/backend/PERGUNTAS.md`, P1 a P10): TypeScript no Node 24 com Fastify, AWS sa-east-1 com Fargate, Supabase em São Paulo, só a API grava, KMS por escritório, A3 por certificado em nuvem.

**O que mudou na versão 0.2 (respostas do dono, [`PERGUNTAS.md`](PERGUNTAS.md)):**

- **Q6:** o piloto (2 escritórios, 5 clientes cada) liga **tudo o que der para ligar, pago**, para os escritórios testarem o sistema inteiro.
- **Q5:** o WhatsApp do dia a dia vai pela integração não oficial ([`WHATSAPP.md`](WHATSAPP.md)).
- **Q9:** a parceria com a Thomson Reuters fica para depois do piloto.
- **Q10:** o MCP abre para assistentes de IA e para o Microsoft 365 e o Google Workspace.
- **Extensão de navegador** ([`EXTENSAO.md`](EXTENSAO.md)): entra no piloto.

## Resumo

1. **O piloto completo pede ~82 semanas-pessoa (sp).** São ~9,5 meses com 2 pessoas ou ~6,5 meses com 3, contra ~37 sp (4,5 meses) do piloto mínimo do backend. A diferença: F5 (CRM e WhatsApp), Timesheet e Financeiro (F6, sem o BPO), os conectores que estavam depois do piloto, a extensão e o MCP aberto.
2. **Alternativa sem mudar a decisão:** começar o uso com os escritórios em ~5,5 meses (onda 1, ~46 sp) e ligar o resto durante o piloto, em ondas de 2 a 3 semanas. O piloto termina com tudo ligado do mesmo jeito; só começa antes.
3. **Custo mensal do piloto, provável:**

   | Faixa | Valor por mês |
   | --- | ---: |
   | Só APIs | **R$ 3,0 mil** (R$ 2,5 mil é o piso da Pluggy; sem ela, ~R$ 500) |
   | APIs + infraestrutura AWS e Supabase | **R$ 4,9 mil** |
   | APIs + infraestrutura + modelos de IA | **R$ 5,7 mil** (até R$ 6,4 mil no cenário alto) |

4. **Total de 3 meses de piloto em uso:** ~R$ 18 mil (até ~R$ 20 mil), com ~R$ 750 de custos únicos. A infraestrutura de homologação durante a construção não está nessa conta.
5. **Pedir já:**
   - e-CNPJ da Heild;
   - contrato SERPRO (o Enzo fala com o comercial sobre o modelo A);
   - procurações dos 10 clientes;
   - conta InfoSimples e DPA;
   - Pluggy;
   - verificação do app Google (escopos restritos do Drive);
   - conta de desenvolvedor na Chrome Web Store e no Edge;
   - planos de assinatura e certificados em nuvem para os 2 escritórios;
   - número de teste da Meta.

---

## 1. O que pedir já (contratos, credenciais e prazos)

Do prazo mais longo, ou que trava outro passo, para o mais rápido.

| # | O que pedir | Quem pede | Prazo de aprovação (fonte) | Teste grátis antes | Precisa estar pronto em |
| --- | --- | --- | --- | --- | --- |
| 1 | **e-CNPJ A1 da Heild** | Dono | Emissão em AC, em geral no mesmo dia [a confirmar com a AC] | — | Antes do item 2 |
| 2 | **Contrato SERPRO: Integra Contador e Consulta CNPJ** | Dono, com o e-CNPJ | Online; **chaves em até 10 minutos** (API Center do SERPRO, conferido 15/11/2026). **Pendência do Enzo:** confirmar com o comercial do SERPRO o modelo A (a Heild contrata, cada escritório assina o termo) [prazo a confirmar] | Demonstração com dados simulados | F4 (desenvolve com a demonstração desde a F3) |
| 3 | **Procurações dos 10 clientes** (Autorização de Acesso no e-CAC) | Cada cliente outorga; o escritório aceita | O escritório tem **30 dias para aceitar**; sem aceite, cancela (08, V1 I-13) | — | Início do piloto |
| 4 | **Verificação do app Google** para os escopos restritos do Drive (`drive`, `drive.metadata.readonly`) | Time | **[prazo e custo da avaliação de segurança a confirmar]**; costuma levar semanas | Usuários de teste sem verificação [limite a confirmar] | Onda de nuvens |
| 5 | **Conta InfoSimples e DPA** | Dono | Cadastro online imediato; DPA [prazo a confirmar] | **R$ 100 de crédito por 30 dias** | Onda de certidões e DTE; sem DPA, o DTE fica desligado |
| 6 | **Pluggy** (Open Finance) | Dono | Contrato comercial [prazo a confirmar]; pedir preço de piloto abaixo do piso | 15 dias em produção, sandbox | Onda de bancos |
| 7 | **Produção restrita do ADN** e PoC da procuração com e-CNPJ do escritório | Time + um escritório | [a confirmar] | Produção restrita | F4 |
| 8 | **Conta de desenvolvedor da Chrome Web Store e do Edge** | Dono | Taxa única de US$ 5 no Chrome [valor a confirmar]; revisão a cada versão [prazo a confirmar] | Pacote não listado para os 2 escritórios | Onda da extensão |
| 9 | **Publisher verification da Microsoft** (Graph e conector do Copilot) e registro no Entra ID | Time | [a confirmar] | Tenant de desenvolvedor | Ondas de nuvens e do MCP |
| 10 | **Número de teste da Meta** (Cloud API) | Time | Imediato no painel da Meta; produção pede verificação de até 14 dias úteis (Meta, conferido 15/11/2026) | O próprio número de teste | Onda do WhatsApp |
| 11 | **Assinatura eletrônica** (ZapSign Equipe ou Clicksign Start) para os 2 escritórios | Heild paga no piloto | Imediato | [teste a confirmar por provedor] | Onda de assinatura |
| 12 | **Certificado em nuvem** (Bird ID) de um signatário por escritório | Escritório; a Heild paga no piloto | Emissão em AC | — | Onda de assinatura (ECD e ECF) |
| 13 | **Cobrança**: Inter (sandbox, API Pix gratuita) ou Asaas do escritório | Escritório | Imediato (Asaas); convênio com o banco [prazo do banco] | Sandbox | Onda do Financeiro |
| 14 | **Saída do sandbox do SES** | Time | Pedido no console da AWS [prazo a confirmar] | Sandbox | F2 |
| 15 | **Conta no fornecedor de modelos** com DPA, sem treino com os dados e retenção mínima (decisão Q7: dado completo, sem máscara) | Dono + frente de IA | Imediato | [a confirmar] | F3 |
| 16 | **Web services de RS e SC** para contabilistas | Escritório, se tiver cliente nessas UFs | [a confirmar] | — | Só se houver cliente |
| 17 | **Alterdata** (eContador Master) | Escritório que usa Alterdata | Contrato do escritório | — | Onda de cores |
| — | ~~Parceria Thomson Reuters (Domínio)~~ | — | **Depois do piloto (Q9)**; no piloto, arquivo de troca | — | — |

O que **não precisa de contrato**: DF-e, eSocial, EFD-Reinf, NFS-e Nacional (ADN e Sefin), dados abertos do CNPJ, BrasilAPI, BCB, Calculadora da RFB e a integração não oficial do WhatsApp (WAHA, Apache-2.0).

---

## 2. A ordem, fase por fase

As fases e as semanas-pessoa (sp) do backend vêm da ARQUITETURA, 7 (2 pessoas, ±30%). O que é novo nesta versão está marcado com ★.

| Fase | Entrega de API | sp |
| --- | --- | ---: |
| **F0 · Fundação** | Executor e envelope (`POST /v1/ferramentas/{nome}`), erro acionável com os 44 códigos comuns, idempotência, sessão, contratos gerados (OpenAPI e esquemas MCP), limites por ator | 5 |
| **F1 · Núcleo** | Ferramentas de entidade do núcleo, cursor e visão compacta, `validar_apenas`, sincronização e SSE, leituras do app do cliente; carga dos dados abertos do CNPJ | 8 |
| **F2 · Arquivos** | URL pré-assinada, `documento.registrar`, worker Python (OCR, PDF, extrato), escritas do app; SES | 5 |
| **F3 · Procedimentos** | Contexto e resolução, motor, runner de operários (fornecedor de modelos), MCP por setor, dois procedimentos de referência, `calculo.*` e BCB | 9 |
| **F4 · Cofre e captura** | Cofre, framework de conector com teto de custo e cache, DF-e, ADN, Consulta CNPJ | 7 |
| ★ Integra Contador, base | Termo e token, eventos gratuitos, caixa postal (listar; abrir com cartão), SITFIS, PGDAS-D e DAS, procurações | 3 |
| ★ Integra Contador, completo | DCTFWeb e MIT, Sicalc (DARF e recálculo), PAGTOWEB, parcelamentos, DEFIS, PGMEI | 2 |
| ★ InfoSimples | Certidões federais, estaduais e municipais; DTE (listar; abrir com cartão); Sintegra; JUCESP | 1,5 |
| ★ eSocial e EFD-Reinf | Envio, consulta e download (10/dia, nada do dia 1 ao 7) | 3 |
| **F5 · CRM e comunicação** | Webhooks, conversas, mensagens, e-mail de entrada e saída, `email.triar` pelo integrante | 6 |
| ★ WhatsApp não oficial | Serviço `wa-gateway` (WAHA), adaptador, QR e saúde, ritmo e opt-out ([`WHATSAPP.md`](WHATSAPP.md)) | 2 |
| ★ WhatsApp oficial de teste | Adaptador `whatsapp_cloud` com o número de teste | 0,5 |
| **F6 · Timesheet e Financeiro, sem o BPO** | Sessões de trabalho a partir de eventos, cobrança (banco do escritório, Asaas, Efí), NFS-e do escritório | 7 [estimativa: os 10 sp da F6 menos o BPO] |
| ★ Extensão (v1 e captura de downloads) | [`EXTENSAO.md`](EXTENSAO.md) | 4,5 |
| ★ Cores | Alterdata ePlugin (se um escritório usar) e arquivo de troca do Domínio, Questor e Contmatic | 2 |
| ★ Nuvens do escritório | Drive, Graph, S3 compatível, WebDAV, SFTP | 3,5 |
| ★ Assinatura e certificado em nuvem | Um provedor pela interface comum; Bird ID por DOC-ICP-17.01 | 2,5 |
| ★ Calculadora RFB | Versão offline em contêiner | 1 |
| ★ Open Finance (Pluggy) | Consentimento pelo app, transações por cursor | 1,5 |
| ★ MCP aberto (Q10) | OAuth 2.1 e MCP remoto para Claude, ChatGPT e Copilot Studio, só leitura e propostas | 3,5 |
| **F7 · Endurecimento** | Teste sintético diário de todos os conectores, painel de saúde, teste de segredo, carga, restauração, runbook | 4 (era 3; mais conectores para monitorar) |
| **Total do piloto completo** | | **~82 sp** |
| Condicional | Web services RS e SC, se houver cliente | +1,5 |
| Durante o piloto, se um escritório usar | Agente do Microsoft 365 Copilot e complemento do Google Workspace (Q10) | +3,5 |
| Experimento no fim do piloto | Copiloto da extensão em 2 portais | +3 |

**Prazo:** com 2 pessoas, ~41 semanas, ou ~9,5 meses. Com 3 pessoas, ~6,5 meses (há perda de coordenação; as fases F0 a F3 não se dividem bem por três).

### 2.1 Alternativa: começar antes, em ondas

A decisão do dono é o piloto com tudo. Esta alternativa mantém essa decisão e só antecipa o início do uso:

| Onda | O que entra | sp acumuladas | Mês (2 pessoas) |
| --- | --- | ---: | ---: |
| 1 · Começa o uso | F0 a F4, Integra base, F5 com WhatsApp não oficial, F7 parcial | ~46 | ~5,5 |
| 2 | Integra completo, InfoSimples, eSocial e Reinf | ~52,5 | ~6,5 |
| 3 | F6 (Timesheet e Financeiro), extensão | ~64 | ~7,5 |
| 4 | Cores, nuvens, assinatura, Calculadora, Open Finance, MCP aberto, número oficial de teste, resto da F7 | ~82 | ~9,5 |

O ganho: os escritórios começam a usar 4 meses antes, e o que der errado nos conectores da onda 1 aparece cedo. O custo: o piloto dura mais em calendário.

---

## 3. Custo do piloto (2 escritórios, 5 clientes cada, 20 usuários)

### 3.1 Premissas

| Premissa | Valor | Fonte |
| --- | --- | --- |
| Usuários | 20 contas (10 por escritório) | HOSPEDAGEM, 3 |
| Uso de API por cliente | Integra: 6 consultas, 1 emissão, 1 declaração por mês, **em dobro** no piloto (testes); CNPJ 0,1; InfoSimples 6,2 consultas | 08, 10.2; estudo de precificação 3.11 |
| Preços | Conferidos na fonte em 15/11/2026 ([`CATALOGO_CONTABIL.md`](CATALOGO_CONTABIL.md)) | — |
| Câmbio | R$ 7,97 por US$ (com IOF e tributos de importação; com só o IOF, R$ 5,69) | Estudo, 1.2 |
| IA | **R$ 26 por usuário por mês** no desenho recomendado e **R$ 60** no plano atual, como cenário alto | Avaliação dos integrantes (`docs/integrantes/AVALIACAO.md`, branch `wf-integrantes-pesquisa`), 4.2 |
| Consultor | 80 perguntas por usuário por mês a R$ 0,217 | Estudo, 3.3 (pode ter sobreposição com o mix da avaliação; fica separado por cautela) |
| Duração | 3 meses de uso | Premissa |

### 3.2 Linha por linha (R$ por mês)

| Linha | Quem paga no piloto | R$/mês | Observação |
| --- | --- | ---: | --- |
| Integra Contador | Heild | 45 | Faixa 1, uso em dobro, +5% de 403 |
| SERPRO Consulta CNPJ | Heild | 2 | +R$ 7 uma vez no cadastro |
| InfoSimples | Heild | 100 | Franquia mínima (uso real ~R$ 15); o 1º mês sai do crédito de teste |
| WhatsApp não oficial (WAHA) | Heild | 0 | Só infraestrutura (abaixo) |
| WhatsApp oficial, número de teste | Heild | 0 | |
| Transcrição de áudio | Heild | 5 | 10 clientes × 5 min, com folga |
| SES | Heild | 1 | |
| Assinatura eletrônica (ZapSign Equipe, mensal) | Heild | 140 | 2 × R$ 69,90 |
| Certificado em nuvem (Bird ID) | Heild | 70 | 2 × R$ 34,90 |
| Cobrança (Asaas, tarifa promocional) | Heild | 16 | ~20 cobranças de teste × R$ 0,79; com o Inter, R$ 0 |
| Integrador de NFS-e (Focus Solo) | Heild | 95 | Só se houver município fora do padrão; 30 dias grátis |
| **Open Finance (Pluggy)** | Heild | **2.500** | Piso com até 500 conexões; 15 dias grátis; pedir preço de piloto |
| e-CNPJ da Heild, rateado | Heild | 25 | [preço a confirmar com a AC] |
| DF-e, ADN, eSocial, Reinf, BCB, Calculadora, dados abertos, Drive, Graph | — | 0 | |
| **Só APIs** | | **~3.000** | Sem a Pluggy: ~R$ 500 |
| Infraestrutura AWS e Supabase do piloto | Heild | 1.570 | US$ 197 (HOSPEDAGEM, 4) |
| `wa-gateway` (WAHA) e Calculadora offline | Heild | 296 | +US$ 24,80 (0,5 vCPU) + US$ 12,40 (0,25 vCPU) no Fargate ARM |
| **APIs + infraestrutura** | | **~4.870** | Com o câmbio de R$ 5,69: ~R$ 4,3 mil |
| Integrantes (20 × R$ 26) | Heild | 520 | Cenário alto: 20 × R$ 60 = 1.200 |
| Consultor (20 × 80 × R$ 0,217) | Heild | 347 | |
| Consultor da empresa no app (10 clientes × 10 perguntas × R$ 0,12) | Heild | 12 | Estudo, 3.10 |
| Ajuda do sistema (20 × R$ 0,16) | Heild | 3 | Estudo, 3.3 |
| **APIs + infraestrutura + IA** | | **~5.750** | Cenário alto: **~6.430** |

### 3.3 Custos únicos e total

| Item | R$ |
| --- | ---: |
| Consulta CNPJ do cadastro inicial | 7 |
| Conta da Chrome Web Store (US$ 5) | 40 |
| Município novo no Focus, se precisar | 199 |
| Tokens do piloto pré-registrado da avaliação dos integrantes ("centenas de reais", AVALIAÇÃO 11.6) | ~500 [estimativa] |
| Avaliação de segurança do Google para escopos restritos | [a confirmar] |
| **Únicos** | **~750 + Google** |
| **Total de 3 meses de uso** | **~R$ 18 mil** (alto ~R$ 20 mil) |

### 3.4 Leitura

1. **A Pluggy é 83% do custo de API do piloto.** O piso de R$ 2.500 cobre até 500 conexões, e o piloto usa ~10. Vale pedir à Pluggy um preço de piloto, ou ligar o Open Finance só no último mês, com os 15 dias grátis no começo dele.
2. **A infraestrutura pesa mais que as APIs** quando se tira a Pluggy: R$ 1,9 mil contra R$ 0,5 mil.
3. **A IA é barata no piloto** (R$ 0,9 mil a R$ 1,6 mil por mês) porque há só 20 usuários; ela cresce por usuário, não por escritório.
4. **O que não está na conta:** o tempo das pessoas, o ambiente de homologação durante os meses de construção (~US$ 60 a 100 por mês [estimativa]) e o parecer jurídico sobre o WhatsApp não oficial.

---

## 4. Custo das APIs com 10, 100 e 1.000 escritórios

Sem mudança de método desde a versão 0.1. O escritório médio tem 100 clientes, o uso é o provável, o SERPRO está no modelo A com 5% de 403 e a InfoSimples, em cascata. **O WhatsApp sai da conta:** pela decisão Q5, o uso do dia a dia é não oficial (custo zero por mensagem; só infraestrutura) e a API oficial é contratada e paga pelo escritório.

| Linha (R$/mês) | 10 escritórios (1.000 clientes) | 100 (10.000) | 1.000 (100.000) |
| --- | ---: | ---: | ---: |
| Integra Contador | 1.648 | 8.190 | 58.800 |
| SERPRO Consulta CNPJ | 66 | 565 | 3.557 |
| InfoSimples | 1.164 | 8.850 | 54.610 |
| SES | 16 | 159 | 1.594 |
| Transcrição | 100 | 1.000 | 10.000 |
| **Total pago pela plataforma** | **~3,0 mil** | **~18,8 mil** | **~129 mil** |
| Por cliente | R$ 3,00 | R$ 1,88 | R$ 1,29 |
| `wa-gateway` (infraestrutura) | ~US$ 25 a 50 | ~US$ 50 a 200 | ~US$ 500 a 2.000 [estimativa, medir no piloto] |
| Open Finance (módulo à parte) | Piso de R$ 2.500 da plataforma, rateado | idem até 500 conexões; acima, por requisição [preço não publicado] | idem |

Nessas escalas, a Pluggy, a assinatura, a cobrança e o certificado em nuvem voltam a ser **conta do escritório**, como no estudo de precificação. No piloto, a Heild paga tudo para os escritórios testarem.

O modelo A do SERPRO continua sendo a maior alavanca: com 1.000 escritórios, a diferença para cada escritório contratar sozinho é de ~R$ 150 mil por mês. A confirmação com o comercial do SERPRO é **pendência do Enzo** (Q2).

---

## 5. Critérios para passar de uma etapa à seguinte

| Etapa | Pronto quando |
| --- | --- |
| Qualquer conector | Teste sintético diário verde por 7 dias; erros externos mapeados para os códigos da API interna; teto de custo configurado; nenhum segredo em log, evento ou resposta |
| DF-e e ADN | Completude conferida em um mês real de um cliente de cada escritório contra o portal |
| Integra | Nenhuma chamada paga sem procuração vigente em 7 dias de log; caixa postal nunca aberta sem cartão (teste automatizado) |
| WhatsApp não oficial | Sessão estável por 14 dias nos 2 números do piloto; ritmo e opt-out aplicados (teste); aviso de risco assinado pelos 2 escritórios |
| Extensão | Critérios do [`EXTENSAO.md`](EXTENSAO.md), 4 |
| MCP aberto | Nenhuma ferramenta `executar` alcançável por token externo (teste); revogação imediata testada |
| Operação de processo | Casos de gabarito passando; resposta compacta abaixo do teto |
| App do cliente | Teste de vazamento: uma pessoa do cliente A nunca lê dado do cliente B nem do escritório |

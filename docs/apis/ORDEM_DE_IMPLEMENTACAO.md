# Ordem de implementação das APIs do Contábil

**Versão 0.1 · 15/11/2026 · desenho.** Em que ordem construir a API interna ([`API_INTERNA.md`](API_INTERNA.md)) e ligar as APIs externas ([`CATALOGO_CONTABIL.md`](CATALOGO_CONTABIL.md)), em sincronia com as fases do backend ([`../backend/ARQUITETURA.md`](../backend/ARQUITETURA.md), seção 7). Começa pelo piloto: **2 escritórios com 5 clientes cada**. O stack é o que o dono aceitou em 15/11/2026 (`docs/backend/PERGUNTAS.md`, P1 a P10): TypeScript no Node 24 com Fastify, AWS sa-east-1 com Fargate, Supabase em São Paulo, só a API grava, KMS por escritório e A3 por certificado em nuvem.

## Resumo

1. **Pedir já, antes de escrever código:** e-CNPJ da Heild (pré-requisito do SERPRO), contrato SERPRO (Integra Contador e Consulta CNPJ, chaves em até 10 minutos), verificação Meta Business (até 14 dias úteis), conta InfoSimples e DPA, cadastro de parceira na Thomson Reuters (Domínio), acesso à produção restrita do ADN e pedido das procurações dos 10 clientes do piloto (o escritório tem até 30 dias para aceitar).
2. **O piloto liga cinco APIs externas:** distribuição de DF-e, ADN (NFS-e), Consulta CNPJ (dados abertos e SERPRO), Integra Contador (caixa postal, situação fiscal, PGDAS-D e DAS) e SES. Todas, menos o Integra, já estão nas fases F2 a F4 do backend; o Integra acrescenta ~3 semanas-pessoa (sp).
3. **Com o Integra, o piloto vai de ~37 para ~40 sp (≈ 5 meses com 2 pessoas).** Sem ele, fica nos 4,5 meses do backend, mas o Fiscal do piloto não vê a caixa postal nem gera DAS. A recomendação é incluir (pergunta Q1).
4. **Tudo do piloto pode ser testado de graça antes de ir à produção:** demonstração do SERPRO, produção restrita do ADN, do eSocial e do Reinf, crédito de R$ 100 da InfoSimples, número de teste da Meta, sandbox do Inter e da Pluggy.
5. **Custo mensal de API pago pela plataforma, provável:** ~R$ 25 no piloto (R$ 125 se as certidões da InfoSimples entrarem) · ~R$ 3,0 mil com 10 escritórios · ~R$ 18,8 mil com 100 · ~R$ 129 mil com 1.000 escritórios (escritório médio de 100 clientes). Por cliente: R$ 3,00, R$ 1,88 e R$ 1,29, porque as faixas do SERPRO e da InfoSimples caem com o volume somado (modelo A).
6. **O WhatsApp é repassado ao escritório:** ~R$ 55 por escritório médio por mês (R$ 0,5 mil, 5,5 mil e 55 mil nas três escalas). Não entra no piloto (fase F5, decisão P9 do backend).
7. **Depois do piloto, em ordem:** InfoSimples (certidões e DTE), eSocial e EFD-Reinf, WhatsApp e e-mail (F5), cores (Domínio entrada, Alterdata), nuvens do escritório, assinatura, Calculadora RFB, cobrança (F6) e, por último, Open Finance como módulo à parte (fase 3 do produto).

---

## 1. O que pedir já (contratos, credenciais e prazos)

Ordem de pedido: do que tem o prazo mais longo ou trava outro passo para o mais rápido.

| # | O que pedir | Quem pede | Prazo de aprovação (fonte) | Teste grátis antes | Precisa estar pronto em |
| --- | --- | --- | --- | --- | --- |
| 1 | **e-CNPJ A1 da Heild** (empresa da plataforma) | Dono | Emissão em AC, em geral no mesmo dia [a confirmar com a AC] | — | Antes do item 2 |
| 2 | **Contrato SERPRO: Integra Contador** (modelo A: plataforma contratante, termo por escritório) | Dono, com o e-CNPJ | Online na loja; **chaves em até 10 minutos** (API Center do SERPRO, conferido 15/11/2026). A aceitação formal do modelo A (um contratante para vários escritórios) **[prazo a confirmar com o comercial do SERPRO]** | **Ambiente de demonstração com dados simulados** | F4 (pode desenvolver com a demonstração desde a F3) |
| 3 | **Contrato SERPRO: Consulta CNPJ** (e CPF, se o Societário precisar) | Dono | Igual, até 10 minutos | Demonstração com CNPJs fictícios; CPF [a confirmar] | F4 |
| 4 | **Procurações dos 10 clientes do piloto** (Autorização de Acesso ao escritório no e-CAC) | Cada cliente outorga; o escritório aceita | O escritório tem **30 dias para aceitar**; sem aceite, cancela (08, V1 I-13) | — | Início do piloto (pedir junto com o convite ao app) |
| 5 | **Verificação do Meta Business** da Heild como provedora e dos números dos escritórios | Dono; cada escritório | **Até 14 dias úteis**; modelo de mensagem até 24 h (Meta, conferido 15/11/2026). Revisão do app para o Embedded Signup **[prazo a confirmar]** | Número de teste da Meta | F5 (pós-piloto), mas pedir agora pelo prazo |
| 6 | **Parceria Thomson Reuters (Domínio)**: "Quero ser parceiro", para a API de entrada | Dono | **[prazo a confirmar]**; é de um concorrente e não tem compromisso de prazo | Homologação depois do cadastro | Pós-piloto (cores) |
| 7 | **Conta InfoSimples e DPA** | Dono | Cadastro online imediato; DPA **[prazo a confirmar]** | **R$ 100 de crédito por 30 dias** | Pós-piloto; sem DPA, DTE fica desligado |
| 8 | **Produção restrita do ADN** e PoC da procuração com e-CNPJ do escritório | Time + um escritório do piloto | Acesso com certificado; **[prazo a confirmar]** | Produção restrita | F4 |
| 9 | **Saída do sandbox do SES** em sa-east-1 | Time | Pedido no console da AWS **[prazo a confirmar; costuma ser de horas a um dia]** | Sandbox (só envia a endereços verificados) | F2 (convites) |
| 10 | **Conta no fornecedor de modelos** com termos de retenção e geografia | Dono + frente de IA | Imediato; processamento no Brasil **[a confirmar]** | Créditos iniciais [a confirmar] | F3 (runner de operários) |
| 11 | **Verificação do app Google** para escopos restritos do Drive (`drive`, `drive.metadata.readonly`) | Time | **[prazo e custo da avaliação de segurança a confirmar]**; em geral semanas | Até 100 usuários de teste sem verificação [a confirmar] | Pós-piloto (nuvens do escritório) |
| 12 | **Publisher verification da Microsoft** (Graph) | Time | **[a confirmar]** | Tenant de desenvolvedor | Pós-piloto |
| 13 | **Web services de RS e SC para contabilistas**: cadastro do contabilista e autorização de cada cliente | Escritório do piloto, se tiver cliente nessas UFs | **[a confirmar]** | — | Só se o piloto tiver cliente no RS ou em SC |
| 14 | **Certificado em nuvem (Bird ID ou VIDaaS)** para o que exige A3 | Escritório ou pessoa | Emissão do certificado; API pelo DOC-ICP-17.01 | — | Pós-piloto (ECD, ECF e o que pedir A3) |
| 15 | **Pluggy** | Dono | Contrato comercial | 15 dias em produção, sandbox | Fase 3 do produto |

O que **não precisa de contrato**: distribuição de DF-e, eSocial, EFD-Reinf, NFS-e Nacional (ADN e Sefin), dados abertos do CNPJ, BrasilAPI, BCB, Calculadora da RFB. Precisam só do certificado certo (A1 do cliente ou e-CNPJ do escritório com procuração).

O que é **conta do escritório**, não da Heild: Alterdata (eContador Master), chave por empresa no Onvio, assinatura eletrônica, banco ou gateway de cobrança, número de WhatsApp, Google Workspace ou Microsoft 365, certificado em nuvem.

---

## 2. A ordem, fase por fase

As fases e as semanas-pessoa (sp) são as do backend (ARQUITETURA, 7), para 2 pessoas, ±30%. Aqui fica o que cada fase entrega **de API**.

### Antes da F0 (semana 0)

- Itens 1 a 5 e 8 da seção 1.
- Definir o pacote de domínio das ferramentas (`pacotes/dominio`): o esqueleto Zod das ~68 ferramentas novas da API interna, os códigos de erro comuns e o teto de tokens por resposta compacta.

### F0 · Fundação do servidor (5 sp): o envelope

| Entrega de API | Detalhe |
| --- | --- |
| Executor e envelope | `POST /v1/ferramentas/{nome}`; resultados e HTTP da API interna, 2.3; erro acionável (2.4) com os 42 códigos comuns |
| Idempotência | Tabela `idempotencia`, `Idempotency-Key` obrigatória em `executar`, 409 em hash diferente |
| Sessão | `GET /v1/sessao`, JWT do Supabase, perfil materializado |
| Contratos gerados | OpenAPI 3.1 e esquemas MCP a partir do Zod; snapshot no CI que quebra sem aumento de `versao` |
| Limites | Taxa por ator (API interna, 1); a de dinheiro chega com os conectores |

Nenhuma API externa.

### F1 · Núcleo pela API (8 sp): as ferramentas de entidade

| Entrega de API | Detalhe |
| --- | --- |
| Ferramentas de entidade do núcleo | Cliente, pessoa, tarefa (todas as transições), obrigação, cartão, notificação, comunicação interna (as que já existem no wireframe), com `x.atualizar` restrito aos campos editáveis |
| Paginação e visão | Cursor em toda lista; `visao: compacta \| tela`; teto medido no CI |
| `validar_apenas` | Em toda `rascunhar` e `executar` |
| Sincronização e SSE | `GET /v1/sincronizar`, `GET /v1/eventos/fluxo` |
| App do cliente (leitura) | `pendencia.listar`, `documento.listar`, `tarefa.listar` (as dele), `cliente.perfil_em` |

Externa: **dados abertos do CNPJ** (carga mensal num job; sem contrato).

### F2 · Documentos e arquivos (5 sp)

| Entrega de API | Detalhe |
| --- | --- |
| Arquivos | `documento.preparar_envio` (URL pré-assinada), `documento.registrar`, `documento.obter_link`, `documento.registrar_leitura` (worker Python) |
| App do cliente (escrita) | `pendencia.enviar`, `pendencia.nao_tenho`, `pendencia.ja_fiz`, `documento.assinar_ciencia` |
| Extratos | `extrato.ler_arquivo` (OFX e CSV; PDF no worker Python) |

Externas: **S3 e KMS** (já na infraestrutura), **SES** (convites e código do app), OCR próprio no worker Python.

### F3 · Filas, procedimentos e encaixe dos integrantes (9 sp)

| Entrega de API | Detalhe |
| --- | --- |
| Contexto e resolução | `cliente.resolver`, `pessoa.resolver`, `contexto.carregar`, `execucao.obter`, `procedimento.listar`, `validador.executar` |
| Operações de processo de referência | `notas.conferir_entrada` (NFE-023) e `extrato.classificar_linhas` (CTB-004), com casos de gabarito |
| MCP | `/mcp/setor/{codigo}` com os recortes do Contábil e `excecao`; tokens de serviço |
| Cálculo | As funções `calculo.*` de fase 1 que os procedimentos de referência usam (M3), mais `calculo.multa_juros` |
| Interno | Token de integrante, fila e pulso, `aprovacao.decidir` de ponta a ponta |

Externas: **fornecedor de modelos** pelo serviço `operarios` (item 10 da seção 1); **BCB SGS** (grátis, 0,5 sp, dentro da F3).

### F4 · Cofre e primeiros conectores (7 sp + 3 sp do Integra)

| Entrega de API | Detalhe |
| --- | --- |
| Cofre | `POST /cofre/v1/credenciais` (A1 pelo app e e-CNPJ do escritório), `credencial.vincular`, `.rotacionar`, `.revogar`, `.usar` |
| Framework de conector | Conexão, execução, cursor, retentativa, fila morta, teto de custo mensal por conexão (80% avisa, 100% só manual), cache de consulta paga |
| **Distribuição de DF-e** | `dfe.distribuir`, `dfe.consultar_chave`, `dfe.manifestar`; respeita o 656 (1 h) e as 20 consultas/hora; liga no dia em que chega o A1 |
| **ADN** | `adn.distribuir`; PoC com procuração e e-CNPJ do escritório; A1 do cliente como reserva |
| **Consulta CNPJ** | Dados abertos primeiro; SERPRO só para CNPJ que o arquivo mensal ainda não tem |
| Operações de Notas | `notas.capturar_agora`, `notas.manifestar` (cartão), `perfil_captura.obter`, `captura.saude` |
| **Integra Contador (+3 sp, recomendado no piloto)** | Termo e token diário; `integra.eventos` (grátis, diário); `caixa_postal.verificar` (lista só quando o evento acusa) e `caixa_postal.abrir` (cartão, dá ciência); `situacao_fiscal.gerar`; `pgdas.preparar`, `pgdas.transmitir` (cartão); `guia.gerar`; `procuracao.conferir`. **Nunca chamar sem procuração vigente** (o 403 é cobrado): o conector confere a procuração antes |

### F7 · Endurecimento para o piloto (3 sp)

- Teste sintético diário de cada conector em modo leitura.
- Painel de saúde dos conectores e alertas (três falhas seguidas).
- Teste de que nenhum segredo aparece em resposta, evento, log ou contexto de modelo.
- Medição do tamanho das respostas compactas com dados reais anonimizados.

**Piloto pronto: ~40 sp (≈ 5 meses com 2 pessoas), com o Integra.**

### Depois do piloto

| Ordem | Etapa | Fase do backend | Esforço de API (sp) | Por que nesta ordem |
| --- | --- | --- | ---: | --- |
| 1 | **InfoSimples**: certidões, DTE estaduais (listar; abrir com cartão), Sintegra | logo após F7 | 1,5 | Fecha o Fiscal do mês (certidão e caixa estadual); depende do DPA |
| 2 | **eSocial e EFD-Reinf**: envio, consulta, download com 10/dia e bloqueio dos dias 1 a 7 | idem | 3 | Abre o DP e o Reinf; grátis |
| 3 | **WhatsApp e e-mail** (CRM, régua, `guia.enviar_ao_contato`) | F5 (6 sp do backend) | incluso | A verificação da Meta já terá saído |
| 4 | **Cores**: Domínio entrada, Alterdata ePlugin, arquivo de troca | F5 ou F6 | 3,5 | Depende da parceria TR e do pacote do escritório |
| 5 | **Nuvens do escritório**: Drive, Graph, S3 compatível, WebDAV, SFTP | F6 | 3,5 | Depende da verificação do app Google |
| 6 | **Assinatura** (um provedor pela interface comum) e **certificado em nuvem** | F6 | 2,5 | Relatórios e contratos; ECD e ECF |
| 7 | **Calculadora RFB offline** em contêiner | F6 | 1 | Consultoria e reforma |
| 8 | **Web services RS e SC; SAE-NFC-e SP** | quando houver cliente | 1,5 | Só com cliente nessas UFs |
| 9 | **Cobrança** (banco do escritório, Asaas, Efí) e **NFS-e do escritório** | F6 (10 sp do backend) | incluso | Financeiro e app do cliente |
| 10 | **Open Finance (Pluggy)** | fase 3 do produto | 1,5 | Piso de R$ 2.500; módulo à parte |

---

## 3. Custo mensal estimado das APIs do Contábil

### 3.1 Premissas

| Premissa | Valor | Fonte |
| --- | --- | --- |
| Escala | Piloto: 2 escritórios × 5 clientes = 10 clientes. Depois, escritório médio de 100 clientes: 1.000, 10.000 e 100.000 clientes | Pedido do dono; HOSPEDAGEM 3 |
| Uso por cliente por mês (provável) | Integra: 6 consultas, 1 emissão, 1 declaração; Consulta CNPJ: 0,1 Básica; InfoSimples: 6,2 consultas com R$ 0,02 médios de adicional; 20 e-mails; 5 min de áudio | 08, 10.2 e estudo de precificação 3.3 e 3.11 (decomposição em chamadas é aproximação do estudo) |
| Integra e CNPJ | **Modelo A** (volume somado de todos os escritórios); o volume do mês inteiro paga a faixa atingida; **+5%** para respostas 403 cobradas | SERPRO, conferido 15/11/2026; o 5% é premissa |
| InfoSimples | Cascata mensal de R$ 0,22 a 0,06; franquia mínima de R$ 100 | InfoSimples, conferido 15/11/2026 |
| WhatsApp | 6 de utilidade, 0,5 de marketing e 25 de serviço por cliente; 1 número por escritório no piloto, 2 no médio; 1.000 de serviço grátis por número; **repassado ao escritório** | Estudo 3.3 e 1.1; Meta, conferido 15/11/2026 |
| Câmbio | R$ 7,97 por US$ | Estudo 1.2 |
| Fora da conta | Tokens de modelo (frente de IA e planos de IA, estudo 6.8); infraestrutura AWS e Supabase (HOSPEDAGEM 4); contas do escritório (assinatura, cores, cobrança, certificado em nuvem) | — |

### 3.2 A tabela (R$ por mês)

| Linha | Piloto (10 clientes) | 10 escritórios (1.000) | 100 escritórios (10.000) | 1.000 escritórios (100.000) |
| --- | ---: | ---: | ---: | ---: |
| Integra Contador (com 5% de 403) | 23 | 1.648 | 8.190 | 58.800 |
| — faixa atingida (consulta / emissão / declaração) | R$ 0,24 / 0,32 / 0,40 | 0,16 / 0,29 / 0,32 | 0,06 / 0,26 / 0,16 | 0,06 / 0,08 / 0,12 |
| SERPRO Consulta CNPJ | 1 (+ R$ 7 uma vez no cadastro inicial) | 66 | 565 | 3.557 |
| InfoSimples (com adicionais) | 100 (franquia mínima) | 1.164 | 8.850 | 54.610 |
| SES | 0 | 16 | 159 | 1.594 |
| Transcrição de áudio (com o CRM) | 1 | 100 | 1.000 | 10.000 |
| DF-e, ADN, eSocial, Reinf, dados abertos, BCB, Calculadora RFB | 0 | 0 | 0 | 0 |
| **Total pago pela plataforma** | **~R$ 125** (~R$ 25 sem a InfoSimples) | **~R$ 3,0 mil** | **~R$ 18,8 mil** | **~R$ 129 mil** |
| Por cliente | — (domina a franquia da InfoSimples) | R$ 3,00 | R$ 1,88 | R$ 1,29 |
| WhatsApp (repassado ao escritório) | ~R$ 4 (se ligado) | ~R$ 546 | ~R$ 5,5 mil | ~R$ 54,6 mil antes do desconto de volume |
| Open Finance (módulo à parte, fase 3) | — | R$ 2.500 de piso da plataforma, rateado | idem até 500 conexões; excedente por requisição [preço não publicado] | idem |

No piloto, a InfoSimples só entra se as certidões forem ligadas antes do fim (ela está "logo depois" na ordem); sem ela, o piloto custa ~R$ 25 por mês de API.

### 3.3 Leitura

1. **O modelo A do SERPRO vale muito com volume.** Com 1.000 escritórios, a consulta cai de R$ 0,24 para R$ 0,06; o custo do Integra por cliente vai de R$ 2,27 (faixa 1) para R$ 0,59. No modelo B (cada escritório contrata), um escritório médio fica sempre nas faixas 1 e 2: ~R$ 2,08 por cliente. A diferença com 1.000 escritórios é de ~R$ 150 mil por mês. Por isso a aceitação do modelo A pelo SERPRO é a pergunta comercial mais importante (Q2).
2. **Pelo preço de faixa do SERPRO, crescer pode baratear a conta inteira do mês:** passar de 7.000 para 7.001 consultas faz todas as 7.001 custarem R$ 0,14 em vez de R$ 0,16. Vale agrupar as consultas no contrato da plataforma.
3. **O 403 cobrado é o risco silencioso:** uma consulta a cliente sem procuração vigente custa como uma consulta boa. O conector confere a procuração (pelos eventos grátis de D-1) antes de chamar.
4. **Os números ficam abaixo do estudo de precificação** (R$ 3,62 por cliente no médio), porque o estudo usa a faixa 1 em tudo. O teto de 130% por cliente (R$ 2,93 de Integra e CNPJ e R$ 1,78 de InfoSimples, estudo 3.11) dá folga para o uso real ficar até ~50% acima do provável sem excedente.
5. **A franquia da InfoSimples domina o piloto:** R$ 100 por mês para ~60 consultas. Se o piloto precisar de certidões, vale usar o crédito de teste nos primeiros 30 dias.
6. **Referências de fora desta conta:** infraestrutura ~US$ 197 por mês no piloto e ~US$ 463, 1.211 e 8,3 a 10,1 mil nas três escalas (HOSPEDAGEM 4); tokens de modelo, R$ 2,1 mil por mês de demanda bruta num escritório médio provável (estudo 3.4), controlados pelos planos de IA.

---

## 4. Critérios para passar de uma etapa à seguinte

| Etapa | Pronto quando |
| --- | --- |
| Qualquer conector | Teste sintético diário verde por 7 dias; erros externos mapeados para os códigos da API interna; teto de custo configurado; nenhum segredo em log, evento ou resposta |
| DF-e e ADN | Completude conferida em um mês real de um cliente de cada escritório contra o portal (paridade com o SIEG, se houver) |
| Integra | Nenhuma chamada paga sem procuração vigente em 7 dias de log; caixa postal nunca aberta sem cartão (teste automatizado) |
| Operação de processo | Casos de gabarito passando; taxa de `validar_apenas` com erro medida; resposta compacta abaixo do teto |
| App do cliente | Teste de vazamento: uma pessoa do cliente A nunca lê dado do cliente B nem do escritório |

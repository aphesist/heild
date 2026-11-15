# Armazenamento: os arquivos ficam no escritório

**Versão 0.1 · 15/11/2026 · desenho.** Branch `wf-backend-apis`. Responde à rodada do dono sobre armazenamento.

- **Os fatos do piloto:** um escritório usa Google Drive com **Google Workspace** (confirmado pelo Enzo) e o outro usa **servidor local próprio**.
- **A decisão:** cortar o custo de nuvem de arquivos da Heild. Os arquivos ficam no armazenamento de cada escritório, e a Heild guarda só o índice, os metadados, o texto extraído de que os integrantes precisam e as miniaturas.
- **Os conectores:** os padrões do mercado precisam estar presentes, não só o Drive.
- **O servidor local:** tem de funcionar no piloto.

Pesquisa de 15/11/2026 nas páginas oficiais de cada fornecedor; o que não foi confirmado está marcado. Base: Fundações 7 (índice e backends de armazenamento), 08, 7.8, `STACK.md` 6 e as ações S09-A55 a S09-A63 do mapa de telas.

## Resumo

1. **A Heild deixa de guardar os originais.** No S3 da Heild ficam o índice, os metadados, o texto extraído, as miniaturas e duas cópias de vida curta:
   - a **cópia de processamento**, para OCR e leitura, apagada em 72 h;
   - o **cache de entrega**, para o cliente baixar pelo app, apagado em 7 dias.

   O original é buscado no armazenamento do escritório sob demanda.
2. **No piloto, o custo quase não muda.** O armazenamento de documentos nunca entrou na conta de infraestrutura do piloto: HOSPEDAGEM, seção 4, o deixa de fora, e com 10 clientes seriam ~80 GB, menos de US$ 2 por mês. **A economia aparece em escala:** ~R$ 156 por mês por escritório médio contra a premissa do estudo de precificação (8 GB por cliente a R$ 0,20/GB), ou ~R$ 15,6 mil por mês com 100 escritórios.
3. **Oito conectores mais o agente local:**
   - Google Drive (Meu Drive e drives compartilhados);
   - OneDrive e SharePoint;
   - Dropbox;
   - Box;
   - S3 compatível, WebDAV e SFTP;
   - NAS Synology e QNAP pelo agente local.

   **iCloud Drive não tem API pública para terceiros**; só entra pelo agente local, lendo a pasta sincronizada num computador do escritório.
4. **No piloto entram o Google Drive (pelo administrador do Workspace, sem a avaliação de segurança CASA) e o agente local.** Os demais conectores ficam prontos e testados com contas de teste, sem escritório real.
5. **Servidor local: recomendo o agente local da Heild.**
   - Um serviço pequeno para Windows e Linux, que lê as pastas pelo sistema de arquivos ou por SMB.
   - Mantém só conexão de **saída** para a API, sem porta aberta nem VPN.
   - Credencial por dispositivo, revogação na tela, atualização automática assinada e logs.
   - Esforço: ~5,5 semanas-pessoa (sp). Entra na entrega E4, para ser instalado cedo no escritório do piloto.
6. **Google:**
   - **No piloto:** o administrador do Workspace do escritório marca o app da Heild como confiável em Controles de API, o que libera o escopo restrito só para aquele domínio, sem verificação.
   - **Antes da venda em escala:** a verificação de escopo restrito (~6 semanas, sem garantia) e a avaliação CASA anual, feita por laboratório autorizado, com preço negociado e não publicado.
   - **Conta pessoal:** só como reserva, em modo de teste (até 100 usuários, autorização que expira em 7 dias).
7. **Escrita:** o que o cliente envia pelo app e o que a Heild gera (guias, relatórios) é gravado numa pasta designada do escritório ("Heild/Recebidos" e as pastas visíveis), pelo conector ou pelo agente. A leitura cobre a árvore toda; a escrita só essas pastas.

---

## 1. O que a Heild guarda e o que fica no escritório

| Dado | Onde fica | Por quanto tempo | Por quê |
| --- | --- | --- | --- |
| Original do arquivo | **No armazenamento do escritório** (Drive, OneDrive, servidor local...) | O que o escritório decidir | Decisão do dono: sem custo de nuvem de arquivos na Heild |
| Índice (caminho, nome, tipo, tamanho, datas, `id_externo`, SHA-256, cliente, competência, setor, visibilidade no app) | Postgres da Heild (tabela `documento`, Fundações 7.2) | Enquanto o arquivo existir; `bytes_ausentes_desde` se sumir | É o que as telas, a busca e os integrantes usam |
| Texto extraído (OCR, PDF, XML, planilha) | S3 da Heild (texto grande) e `trecho_indexado` no Postgres (busca e vetor) | Enquanto o arquivo existir | Os integrantes leem o texto, não o arquivo; evita buscar o original a cada pergunta |
| Miniatura (primeira página, 320 px) | S3 da Heild | Enquanto o arquivo existir | Lista e prévia sem buscar o original |
| **Cópia de processamento** | S3 da Heild, prefixo `tmp/processamento/`, SSE-KMS do escritório | **72 h** (regra de ciclo de vida) | OCR e leitura precisam dos bytes uma vez |
| **Cache de entrega** | S3 da Heild, prefixo `tmp/entrega/` | **7 dias** desde o último acesso | O cliente abre a guia no app várias vezes no mesmo dia; sem isso, cada abertura buscaria no servidor do escritório |
| XML fiscal capturado (DF-e, ADN) | **Gravado no armazenamento do escritório** pelo conector, na pasta do cliente; a Heild guarda índice e campos | — | Mesma regra; o XML é pequeno, e a guarda legal é do escritório |
| Escritório sem armazenamento próprio | O backend `plataforma` (S3 da Heild) continua existindo como **opção paga por GB** (estudo, 3.4) | — | Para quem não tem onde guardar |

**Abrir um arquivo** (tela ou app):

1. `documento.obter_link` confere `autorizar`.
2. Se o arquivo está no cache de entrega, devolve uma URL pré-assinada de 5 min.
3. Se não está, o worker busca o original no conector (ou pede ao agente local), grava no cache e devolve a URL. Costuma levar de 1 a 5 s na nuvem e depende do link do escritório no servidor local.
4. Se a origem está fora do ar (servidor desligado, credencial revogada), a resposta é o erro `ORIGEM_INDISPONIVEL`, com a frase "O servidor do escritório está desligado; tente mais tarde". A miniatura e o texto continuam disponíveis.

**Integrantes:** leem o texto extraído e os metadados pelo índice (`documento.listar`, `escritorio.buscar`), sem buscar o original. Só um passo que precisa do arquivo (assinar, anexar a um envio) dispara a busca.

---

## 2. Os conectores

| Conector | API e autenticação | Escopo para ler a árvore | Aprovação exigida (fonte, 15/11/2026) | Mudanças | Limites | Custo da API | No piloto |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Google Drive** (Meu Drive e drives compartilhados) | Drive API v3; OAuth 2.0, app "External"; ou conta de serviço com delegação em todo o domínio | `drive.readonly` (**restrito**). Escrita só nas pastas da Heild com `drive.file`, que **não é sensível** e cobre só os arquivos que o app cria | **Workspace:** o administrador marca o app como **confiável** em Controles de API ("App has access to all Google Workspace services (OAuth scopes), including restricted services"), só para o domínio dele. Ou delegação em todo o domínio, autorizada pelo super admin; se ela dispensa a verificação para app de terceiro está [a confirmar]. **Escala:** verificação de escopo restrito (~6 semanas, sem garantia) e **CASA anual** por laboratório autorizado da App Defense Alliance; a Google não cobra, e o laboratório cobra preço não publicado [a confirmar]. **Conta pessoal:** modo de teste, até 100 usuários, autorização e refresh token expiram em 7 dias | `changes.list` com cursor; `changes.watch` (canal de até 1 semana, renovado) | 1 milhão de unidades/min por projeto; 325 mil/min por usuário; listagem = 100 unidades, download = 200 | Grátis até 400 milhões de unidades/dia por projeto; cobrança acima "later in 2026" [preço a confirmar] | **Sim**, Workspace pelo administrador |
| **OneDrive e SharePoint** | Microsoft Graph v1.0; OAuth 2.0, app multitenant no Entra ID (delegado ou aplicativo) | `Files.Read.All` e `Sites.Read.All`; escrita com `Files.ReadWrite` na pasta da Heild [escopo mínimo a confirmar] | **Publisher verification** (conta no Partner Center, gratuita, sai em minutos com os pré-requisitos) e **consentimento do administrador** do tenant do escritório (na prática exigido para app de outro tenant) | Delta com `deltaLink`; webhooks de até ~30 dias (no OneDrive for Business, só na raiz) | 1.250 RU/min por app por tenant (até 1.000 licenças); 3.000 requisições a cada 5 min por usuário | Sem cobrança para arquivos | Pronto e testado com tenant de desenvolvedor |
| **Dropbox** | API v2; OAuth 2.0 com PKCE e refresh; app "Full Dropbox" | `files.metadata.read` e `files.content.read` (time: `team_data.member`) | **Production approval**: em desenvolvimento aceita até 500 usuários, mas ao chegar a 50 tem 2 semanas para obter a produção, senão novas conexões congelam; prazo da revisão não publicado | Webhook (HMAC) + `list_folder/continue` com cursor; longpoll | Não publicados (429 com Retry-After) | Não publicado [a confirmar] | Pronto e testado com conta de desenvolvedor |
| **Box** | API 2.0; OAuth 2.0 (usuário) ou JWT e Client Credentials (conta de serviço) | `root_readonly`; `manage_webhook` para notificações | JWT e Client Credentials **sempre** precisam da autorização do administrador do Box; publicação em Box Integrations só para OAuth 2.0 (prazo não publicado) | Webhooks v2 (não na pasta raiz); Events API com long polling | ~1.000 chamadas/min por usuário; consome a cota mensal do plano do cliente | Sem custo para a Heild | Pronto e testado com conta de desenvolvedor |
| **S3 compatível** (MinIO, Wasabi, NAS com S3) | API S3; chave de acesso só de leitura no bucket | Política de leitura; escrita só no prefixo da Heild | Nenhuma | Varredura com `ListObjectsV2` a cada 15 min; MinIO tem notificação de bucket | Do provedor | Do provedor | Pronto |
| **WebDAV** | RFC 4918; usuário de serviço | Permissão de leitura do usuário | Nenhuma | Varredura a cada 15 min (sem notificação padrão) | Do servidor | — | Pronto |
| **SFTP** | SSH; chave preferida | Permissão do usuário | Nenhuma | Varredura a cada 15 min | Do servidor | — | Pronto |
| **NAS Synology e QNAP** | SMB, WebDAV, SFTP; File Station API (Synology documentada; QNAP [a confirmar]) | Permissão de pasta do usuário de serviço | Nenhuma; **expor o NAS à internet é desaconselhado** (a QNAP manda desligar o redirecionamento de portas no aviso QSA-22-24) | Pelo agente local | Do aparelho | — | **Pelo agente local** (seção 3) |
| **iCloud Drive** | **Não há API pública para terceiros**: o CloudKit só acessa os contêineres do próprio app (conclusão pela documentação da Apple, sem frase explícita) | — | — | — | — | — | Só pelo agente local num Mac ou Windows com a pasta sincronizada; fora do piloto |
| **Agente local da Heild** | Serviço no servidor ou computador do escritório; conexão de saída para a API | Pastas escolhidas pelo Administrador | Nenhuma de terceiro; certificado de assinatura de código da Heild | Observação do sistema de arquivos como dica + varredura incremental | Link do escritório | Certificado OV de US$ 150 a 300 por ano (tabela da Microsoft) | **Sim**, no escritório com servidor local |

Regras comuns, já das Fundações 7.4 e 7.8 e do 08, 7.8:

- arquivo novo vira Documento `origem = nuvem_escritorio` (ou `servidor_local`); arquivo alterado vira versão; movido segue o `id_externo`;
- removido marca `bytes_ausentes_desde`; conflito nunca sobrescreve;
- a visibilidade ao cliente depende da pasta;
- credencial no cofre (`oauth` ou `chave_nuvem`; o agente tem credencial de dispositivo).

### 2.1 Google no piloto: o passo a passo do administrador do Workspace

**O que a Heild precisa ter pronto antes:**

1. **Projeto no Google Cloud** da Heild (organização da Heild), com a Drive API ativada e a tela de consentimento OAuth "External" preenchida: nome, logo, domínio verificado da Heild, política de privacidade e termos publicados.
2. **Client ID OAuth** de aplicativo web, com o endereço de retorno da API (`https://api.<dominio>/v1/oauth/google/retorno`).
3. **Escopos declarados:** `drive.readonly` (ler a árvore e o conteúdo), `drive.file` (gravar só o que a Heild cria) e `openid` com `email` (identificar quem autorizou).
4. **Página de conexão** em Configurações › Armazenamento, que mostra o client ID com botão de copiar, e um texto de uma página para o administrador do escritório.
5. **Teste no domínio de teste da Heild** (um Workspace próprio), com o app marcado como confiável, antes de pedir ao escritório.

**O que o administrador do Workspace do escritório faz (5 a 10 minutos):**

1. Entra no Admin console do Google como super administrador.
2. Vai em **Segurança › Acesso e controle de dados › Controles de API › Gerenciar acesso de apps de terceiros**.
3. Clica em **Configurar novo app**, busca pelo **client ID** que a Heild mostrou e seleciona o app "Heild".
4. Escolhe a quem vale: o domínio inteiro ou a unidade organizacional das pessoas do escritório.
5. Marca **Confiável** ("Trusted: can access all Google services") e salva.
6. Volta à Heild, em Configurações › Armazenamento, e clica em **Conectar Google Drive** com a conta que tem acesso às pastas do escritório (de preferência o drive compartilhado do escritório). Autoriza os escopos e escolhe as pastas raiz.

**Reserva, se não houver Workspace:** conta pessoal em modo de teste (até 100 usuários de teste; a autorização expira em 7 dias e precisa ser renovada), só até a verificação completa. A verificação de escopo restrito e a CASA saem do caminho crítico do piloto e vão para antes da venda em escala.

---

## 3. O agente local da Heild (servidor do escritório)

### 3.1 O que é

Um serviço pequeno instalado no servidor do escritório (ou num computador sempre ligado na mesma rede):

- lê as pastas escolhidas pelo Administrador, pelo sistema de arquivos local ou por caminho de rede (`\\servidor\pasta`, compartilhamento SMB montado);
- manda à Heild o índice e o arquivo só quando ele precisa ser processado;
- busca um arquivo sob demanda;
- grava só na pasta "Heild/Recebidos" e nas pastas de entrega.

**Nunca apaga nem altera** os arquivos do escritório.

```
servidor do escritório                                          AWS sa-east-1
┌──────────────────────────────┐   HTTPS/WebSocket de SAÍDA    ┌────────────────────────┐
│ agente-heild (serviço)        │ ───────────────────────────► │ api: /v1/agentes/canal  │
│  · varre e observa as pastas  │   índice · pedidos · saúde    │ worker: processa, cache │
│  · conta de serviço só leitura│ ◄─────────────────────────── │ S3: tmp/ (72 h, 7 dias) │
│  · envia arquivo por URL      │   "mande o arquivo X"          └────────────────────────┘
│    pré-assinada do S3         │
└──────────────────────────────┘   nenhuma porta aberta no escritório
```

### 3.2 Desenho

| Peça | Decisão |
| --- | --- |
| Linguagem | **Go**: binário único, sem runtime, com serviço do Windows nativo (`golang.org/x/sys/windows/svc`, ativo em 11/2026) e systemd no Linux; usa pouca memória num servidor que já faz outras coisas. É a única peça em Go da Heild e fica isolada: só fala com a API pelo protocolo documentado. **Alternativa** se o dono preferir uma linguagem só: Node em executável único, com serviço do Windows por `node-windows` (ainda em beta) |
| Sistemas | Windows Server 2016+ e Windows 10/11 (serviço); Linux x64 e ARM64 (systemd). Também roda em NAS que aceita contêiner (Synology Container Manager, QNAP Container Station) [a confirmar por modelo] |
| Leitura | Caminhos locais ou de rede. Observação do sistema de arquivos (`ReadDirectoryChangesW` no Windows, inotify no Linux) **só como dica**, porque não é confiável em compartilhamento de rede (documentação do Node e do inotify). **Varredura incremental** a cada 15 min (data, tamanho; SHA-256 só quando mudou) como fonte da verdade |
| Conta | Conta de serviço do Windows ou usuário Linux **só com leitura** nas pastas escolhidas e escrita só em "Heild/Recebidos" |
| Envio | Índice em lotes (até 500 itens). Arquivo só dos tipos que a Heild processa (PDF, XML, OFX, imagens, planilhas e documentos de escritório), até 50 MB por padrão, por URL pré-assinada do S3 (`tmp/processamento/`). O resto entra só no índice |
| Busca sob demanda | A API pede pelo canal ("mande o arquivo X"); o agente confere que o caminho está dentro das raízes permitidas, envia por URL pré-assinada e responde. Prazo de 30 s; depois disso, `ORIGEM_INDISPONIVEL` |
| Conexão | **Só de saída**, HTTPS 443, WebSocket com o canal `/v1/agentes/canal` (com espera longa como alternativa, para proxy que não deixa WebSocket). Usa o proxy do Windows quando houver. Sem porta aberta, VPN ou IP fixo |
| Credencial | **Por dispositivo.** O Administrador gera em Configurações › Armazenamento um código de instalação de uso único, válido por 1 h. Na instalação, o agente cria um par de chaves local (no repositório protegido do Windows, ou arquivo com permissão 600 no Linux) e registra a chave pública. Depois, autentica com JWT de 15 min assinado pela própria chave. A chave privada nunca sai da máquina |
| Revogação | Na tela, pelo Administrador: a chave é invalidada na hora, e o canal cai. Desinstalar não apaga o índice; o escritório decide se mantém |
| Atualização | Automática, a partir de um canal estável e de um canal piloto. O pacote é **assinado** (Authenticode no Windows, com certificado OV da Heild; assinatura própria verificada pelo agente nos dois sistemas). Implantação em etapas e volta automática se a nova versão não conectar em 5 min |
| Logs | Locais, rotativos (7 dias), **sem conteúdo de arquivo** nem nome de cliente em claro além do caminho; resumo de saúde enviado à Heild (última varredura, itens, erros, versão) e mostrado em Configurações › Armazenamento e no painel global |
| Instalador | MSI assinado para Windows; pacote `.deb`/`.rpm` e script para Linux; o código de instalação é a única pergunta |

Do lado da Heild:

- conector `agente_local`;
- canal WebSocket na `api`;
- tabela `dispositivo_agente`;
- ferramentas `agente.gerar_codigo`, `agente.revogar`, `agente.saude` e `armazenamento.raizes_definir`;
- o mesmo pipeline de documentos dos outros conectores.

### 3.3 Comparação com as alternativas

| Opção | Como | Prós | Contras |
| --- | --- | --- | --- |
| **Agente local da Heild** (recomendado) | Serviço no servidor, conexão de saída | Sem porta aberta nem mudança de rede; os arquivos continuam no escritório; funciona com SMB, NAS e iCloud sincronizado; busca sob demanda; controle e revogação pela Heild | Software instalado no cliente: suporte, atualização e assinatura de código; o servidor precisa estar ligado para buscar originais |
| VPN do escritório até a AWS | Túnel site a site e leitura por SMB pela VPN | Sem software novo da Heild no servidor | Exige configurar o roteador e alguém de TI; abre a rede do escritório para a nuvem da Heild (risco maior para os dois lados); SMB por VPN é lento; difícil para um escritório pequeno |
| Sincronizar o servidor para uma nuvem (Drive para desktop, OneDrive) e usar o conector de nuvem | Cliente de sincronização no servidor | Zero código novo; usa os conectores da seção 2 | O escritório precisa de plano de nuvem com espaço para tudo (o que ele evitou ao ter servidor); duplicação; conflitos; quem não quer nuvem não aceita |
| Extensão de navegador | — | Já existe no plano | Não lê compartilhamento de rede, só funciona com o navegador aberto e com a pessoa agindo; não serve para índice contínuo |

**Recomendação: o agente local.** É o único caminho que mantém a decisão do dono (arquivos no escritório, sem nuvem) sem pedir mudança de rede. **A sincronização para uma nuvem fica como plano B do piloto**, se o agente atrasar e o escritório aceitar uma pasta sincronizada temporária.

### 3.4 Esforço e encaixe

| Peça | sp (±30%) |
| --- | ---: |
| Agente (varredura, observação, envio, busca sob demanda, canal, credencial, logs) | 2,5 |
| Instaladores, serviço do Windows e systemd, atualização assinada | 1,5 |
| Lado da Heild (conector, canal WebSocket, dispositivos, telas, saúde) | 1,5 |
| **Total** | **~5,5** |

**Encaixe: entrega E4** (Cofre e captura), porque o servidor local é a fonte de arquivos de um dos dois escritórios e precisa ser instalado e observado por semanas antes do início do piloto. Dependência externa: **certificado de assinatura de código OV** da Heild (US$ 150 a 300 por ano pela tabela da Microsoft; preço no Brasil [a confirmar]). O Azure Artifact Signing não atende empresa brasileira (só EUA, Canadá, União Europeia e Reino Unido). Sem assinatura, o Windows mostra o aviso do SmartScreen, e o TI do escritório pode bloquear.

**O que testar no piloto:**

- índice completo das pastas do escritório em menos de 24 h na primeira varredura;
- mudança refletida em até 15 min;
- busca sob demanda abaixo de 10 s na rede do escritório;
- nenhuma escrita fora de "Heild/Recebidos" (teste automatizado e auditoria do log);
- revogação que derruba o canal em menos de 1 min;
- atualização automática sem perda de conexão.

---

## 4. Custo

| Linha | Piloto (10 clientes) | Em escala (escritório médio de 100 clientes) |
| --- | --- | --- |
| Originais no S3 da Heild (antes) | ~80 GB, < US$ 2/mês, **nunca entrou na conta do piloto** (HOSPEDAGEM, 4, deixa os documentos de fora) | 800 GB × R$ 0,20 = **R$ 160/mês** (estudo, 3.4) |
| Índice, texto, miniaturas e cópias temporárias (agora) | ~3 GB, < US$ 1/mês | ~20 GB ≈ **R$ 4/mês** [estimativa: texto e miniatura ≈ 2% a 3% dos originais] |
| APIs dos conectores de armazenamento | R$ 0 (Drive dentro da cota gratuita) | R$ 0 até o teto gratuito do Google; Box consome a cota do plano do cliente |
| Certificado de assinatura de código (agente) | US$ 150 a 300 por ano ≈ **R$ 100 a 200/mês** rateado | O mesmo, para todos |
| Agente local | Roda na máquina do escritório | Idem |

**Economia em escala:** ~R$ 156 por escritório médio por mês, ou ~R$ 15,6 mil com 100 escritórios e ~R$ 156 mil com 1.000, contra a premissa do estudo de precificação, que já tratava o armazenamento como opcional (5 GB por cliente por padrão). Efeitos da conta: o módulo "Armazenamento de documentos" do configurador passa a ser só para quem não tem armazenamento próprio, e a infraestrutura deixa de crescer com o volume de arquivos.

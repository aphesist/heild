# Extensão de navegador da Heild

**Versão 0.1 · 15/11/2026 · desenho.** Branch `wf-backend-apis`. O que a extensão faz na v1 (já planejada), que outros usos valem a pena, como ela é construída e onde entra no plano. Base: subplano 05, seção 3 (pulsos do Timesheet e identificação do cliente nos portais), 08, seção 7.9 (a extensão como conector de família `robo` com uma capacidade só), Desenho do Sistema, seção 4.4, e as ferramentas `extensao.*` do wireframe (`app/src/nucleo/permissoes/ferramentas.ts`; serviço simulado `extensao` em `app/src/servicos/timesheet.ts`, API-26).

## Resumo

1. **A v1 é a do subplano 05:** manter a sessão de trabalho viva nos portais da lista, confirmar o cliente pelo CNPJ que o portal mostra e gerar candidatos de tempo quando não há tarefa aberta. Ela não registra tempo sozinha, não envia conteúdo de página e não roda fora da lista.
2. **Três candidatos com valor real:**
   - **captura de guias e recibos baixados** para o Arquivos do cliente: recomendo entrar já, com confirmação a cada arquivo;
   - **copiloto nos portais sem API**, com a pessoa no comando: entra como experimento em dois portais;
   - **WhatsApp Web dentro do navegador da pessoa**: é a alternativa à sessão no servidor, comparada em [`WHATSAPP.md`](WHATSAPP.md), e não é a recomendação principal.
3. **Arquitetura:**
   - Manifest V3, Chrome e Edge com o mesmo pacote; Firefox depois.
   - Login pela própria plataforma, com token de dispositivo revogável.
   - Permissões só nos domínios da lista, que o Administrador amplia.
   - A extensão fala só com a API da Heild, pelas ferramentas de sempre.
4. **Distribuição pela Chrome Web Store e pela loja de complementos do Edge.** O escritório também pode forçar a instalação pela política do navegador (Google Admin, Intune ou GPO).
5. **Privacidade:**
   - Vale o subplano 05 (3.5, 3.6 e 10): termo de ciência no vínculo e pausa a um clique.
   - Cada candidato novo que lê mais do que o identificador do cliente pede uma ciência própria, desligada por padrão.
6. **Esforço:** v1 ~3 sp; captura de downloads +1,5 sp; copiloto nos dois primeiros portais +3 sp; WhatsApp Web na extensão +4 sp, se for escolhido. Com o piloto completo (resposta Q6 do dono), **v1 e captura de downloads entram no piloto (4,5 sp)**; o copiloto entra como experimento no fim do piloto.

---

## 1. O que a v1 já faz (subplano 05, seção 3)

| Função | Como | Fonte |
| --- | --- | --- |
| Manter a sessão viva | `atividade.pulso` no máximo 1 por minuto, só com a aba ativa num domínio da lista, janela com foco e entrada do usuário nos últimos 60 s (booleano) | 05, 3.4 |
| Confirmar o cliente | Ordem: tarefa aberta (`timesheet.contexto_atual`) → CNPJ ou IE na URL → título da aba → elemento da página que identifica o cliente (leitura local; só o identificador sai) → cliente selecionado no painel | 05, 3.3 |
| Candidatos de tempo | Pulsos com CNPJ sem tarefa aberta viram "trecho de portal" para confirmar | 05, 3.4 |
| Pausa | Pelo ícone: 30 min, até o fim do dia, até religar; vira evento `extensao.pausar`, visível só no Meu tempo | 05, 3.6 |
| Lista de domínios | Dado versionado pela plataforma: e-CAC, Simples, eSocial e FGTS Digital, Sefaz das cinco UFs e DTEs, NFS-e nacional e municipais, Onvio | 05, 3.2 |
| O que nunca captura | Conteúdo além do identificador, campos de formulário, senhas, certificado, URL completa, histórico, abas inativas, sites fora da lista, teclas, mouse, telas | 05, 3.5 |

Ferramentas que ela chama (já no catálogo do wireframe): `extensao.vincular`, `extensao.pulso`, `extensao.pausar`, `extensao.portal.pedir`; e, no servidor, `timesheet.contexto_atual` e `identidade.resolver` estendida a CNPJ.

---

## 2. Candidatos além da v1

### 2.1 Captura de guias, recibos e XML baixados para o Arquivos

**O que faz:** quando a pessoa baixa um arquivo num domínio da lista (DAS, DARF, recibo de transmissão, XML, certidão, relatório do Onvio), a extensão mostra um aviso pequeno: "Guardar em Padaria Pão Quente › 2026 › 10 › guias?". O cliente vem da mesma inferência da v1. Com um clique, o arquivo sobe para o Arquivos (`documento.preparar_envio`, depois `documento.registrar`) e vira artefato do timesheet (05, 5.1).

| Prós | Riscos |
| --- | --- |
| Fecha o maior buraco dos portais sem API: a guia emitida no portal chega ao cliente pelo app sem a pessoa salvar e subir à mão | Ler o arquivo baixado: a extensão não lê o disco. Ela busca de novo a URL do download com a sessão do portal (exige permissão de host no domínio). Downloads gerados por POST ou por `blob:` não se repetem; nesses, o aviso vira "arraste o arquivo aqui" |
| O artefato prova que a tarefa foi feita (conclusão por evidência, 03, 7.6) | Privacidade: só em domínios da lista e sempre com confirmação; nunca automático |
| Classificação pelo nome e pelo portal de origem sem modelo; o leitor de documentos confirma tipo, competência e valor no servidor | Arquivo errado no cliente errado: o aviso mostra o cliente e o CNPJ lido no PDF antes de guardar; com divergência, não sugere destino |

**Recomendação:** entrar no piloto. Esforço +1,5 sp.

### 2.2 Copiloto nos portais sem API, com a pessoa no comando

**O que faz:** nos portais que ficaram como "assistido" no catálogo (e-CAC fora do Integra, prefeituras, FGTS Digital, Domínio web), um painel lateral (`side_panel`) mostra:

- o passo a passo da tarefa;
- os dados que a pessoa vai precisar, com botão de copiar (valor da guia, competência, código de receita);
- o que conferir antes de enviar.

Como segunda etapa, pode **preencher um campo quando a pessoa clica**, com prévia do que será escrito. Nunca envia o formulário, nunca abre mensagem que dá ciência e nunca resolve CAPTCHA.

| Prós | Riscos |
| --- | --- |
| Dá ganho no trabalho que não tem API sem robô no servidor: segue a regra C8 e a P5 do 08 (nenhum robô autônomo na v1) | Muda o que o 05 promete: **ler e preencher campo de formulário** está hoje em "nunca captura" (05, 3.5). Exige termo de ciência novo e chave desligada por padrão |
| A credencial fica com a pessoa: login, certificado e segundo fator são dela, na máquina dela | Portal muda a página e o seletor quebra. Seletores ficam como dado versionado, com teste sintético diário em leitura (08, 8.4); quebrou, o painel volta a ser só passo a passo |
| Os dados vêm da plataforma (cálculo do M3, perfil do cliente), não da memória da pessoa | Termos de uso de cada portal: preencher com extensão é diferente de robô, mas precisa do mesmo parecer do 08, 8.1 antes de cada portal |
| Gera evidência para o timesheet e para a auditoria (o que foi copiado ou preenchido, quando) | Erro de preenchimento com consequência fiscal: só campos com prévia, a pessoa revisa e envia |

**Recomendação:** experimento no fim do piloto, em dois portais escolhidos pela dor medida no timesheet: provavelmente o e-CAC (PER/DCOMP) e o portal de uma prefeitura de um escritório do piloto. Esforço +3 sp; +0,5 a 1 sp por portal novo.

### 2.3 WhatsApp Web dentro do navegador da pessoa

**O que faz:** um content script em `web.whatsapp.com` lê as conversas abertas e as espelha no CRM da Heild. Quando a pessoa aprova uma resposta preparada pelo integrante, a extensão a envia pela própria sessão do WhatsApp Web.

| Prós | Riscos |
| --- | --- |
| A sessão do WhatsApp fica na máquina da pessoa: a Heild não guarda credencial de sessão (menos exposição se a Heild for invadida) | Só funciona com o navegador aberto e o WhatsApp Web carregado: respostas fora do horário, réguas e avisos automáticos não saem |
| Parece com o uso humano normal (mesmo navegador, mesmo IP), o que tende a reduzir sinais de automação | **Multiatendente fraco:** um número fica num navegador só; dois atendentes no mesmo número não funcionam ao mesmo tempo |
| Sem servidor de sessões para operar | A página do WhatsApp Web muda com frequência; scripts que injetam código nela quebram, e a Meta pode detectar a injeção |
| | A Chrome Web Store pode remover extensões que automatizam serviços de terceiros contra os termos deles [política a confirmar]; a remoção desliga todos os escritórios de uma vez |

**Recomendação:** não como caminho principal. A comparação com a sessão no servidor está em [`WHATSAPP.md`](WHATSAPP.md). Fica como opção para o escritório que não aceita a sessão do número no servidor da Heild. Esforço +4 sp, se for escolhida.

---

## 3. Arquitetura

### 3.1 Plataforma e pacote

| Item | Decisão |
| --- | --- |
| Formato | **Manifest V3**: *service worker* em vez de página de fundo; nenhum código remoto (o MV3 proíbe; a lista de domínios e os seletores chegam como **dados**, nunca como script) |
| Navegadores | **Chrome e Edge com o mesmo pacote** (ambos Chromium, mesmas APIs). Firefox depois (MV3 com diferenças no *service worker* e nas permissões); Safari só se houver demanda |
| Código | TypeScript, do mesmo monorepo; importa do `pacotes/dominio` os tipos e esquemas Zod das ferramentas `extensao.*`, para a extensão e o servidor validarem igual |
| Tamanho | Sem framework de interface pesado; o painel lateral usa os tokens do design system (CSS) e os componentes simples do kit |

### 3.2 Autenticação com a plataforma

1. A pessoa clica em "Vincular" no ícone. A extensão abre a página `app.<dominio>/extensao/vincular` na plataforma (logada, com MFA quando o papel exige).
2. A página mostra a lista de domínios, o que é lido e o que é enviado, e pede a ciência (05, 3.6).
3. Com a ciência, a página manda à extensão, por `externally_connectable` (só o domínio da Heild e os domínios de marca branca do escritório), um **código de uso único** de 60 s.
4. A extensão troca o código por um **token de dispositivo** (`POST /v1/ferramentas/extensao.vincular`): JWT de 15 min mais *refresh* de 30 dias, ligado a `usuario_id`, `escritorio_id`, `dispositivo_id` e ao escopo `extensao` (só as ferramentas `extensao.*`, `timesheet.contexto_atual`, `documento.preparar_envio` e `documento.registrar` para a captura).
5. O *refresh* fica em `chrome.storage.local`, cifrado com uma chave em `chrome.storage.session`; o JWT, só na memória do *service worker*.
6. Revogação: a pessoa (Minha conta › Dispositivos) ou o Administrador revoga o dispositivo; o próximo uso devolve 401 e a extensão fica inerte. Logout da plataforma também revoga.

### 3.3 Permissões mínimas

| Permissão | Por quê | Quando |
| --- | --- | --- |
| `host_permissions` só nos domínios da lista | Ler URL, título e o elemento que identifica o cliente | Instalação |
| `optional_host_permissions` para domínios novos | O Administrador pede um portal novo; a pessoa aceita o pedido de permissão do navegador | Sob demanda |
| `storage` | Token, lista de domínios, buffer de pulsos de até 24 h | Instalação |
| `alarms` | Pulso de 1 min e renovação do token | Instalação |
| `downloads` | Captura de downloads (2.1) | Só se o escritório ligar a captura (permissão opcional) |
| `sidePanel` | Copiloto (2.2) | Só no experimento |
| Host da API da Heild | Falar com a plataforma | Instalação |
| **Não pede** | `tabs` amplo, `history`, `cookies`, `webRequest`, `<all_urls>`, `clipboardRead`, `nativeMessaging` | — |

### 3.4 Comunicação com a API

- Pelas mesmas ferramentas de todo mundo: `POST /v1/ferramentas/extensao.pulso` etc., com `Idempotency-Key` em cada pulso (`dispositivo_id` + minuto), o que deixa reenviar o buffer depois de uma queda de rede sem duplicar.
- Origem do evento: `extensao`, com `dispositivo_id`.
- Conteúdo de página nunca vai à API: o identificador (CNPJ normalizado ou inscrição) e o nome do portal da lista bastam.
- Limite de taxa: 2 chamadas por minuto por dispositivo no pulso; captura de download sob o limite normal da pessoa.
- A lista de domínios e os seletores chegam por `GET /v1/ferramentas/extensao.configuracao` (nova), com `versao` e `hash`; a extensão guarda a última boa e só troca se o esquema validar.

### 3.5 Atualização

- A loja atualiza sozinha (o Chrome confere a cada poucas horas). As lojas permitem publicação em etapas, para uma porcentagem dos usuários.
- **Mudança de permissão** desliga a extensão até a pessoa aceitar: por isso tudo o que é novo entra como permissão opcional.
- Seletores e domínios mudam sem nova versão (são dados). Só mudança de código passa pela revisão da loja.
- A extensão manda `versao_extensao` em cada chamada; a API recusa versões abaixo da mínima com `VERSAO_DESATUALIZADA` e a mensagem "atualize a extensão".

### 3.6 Distribuição

| Caminho | Como | Para quem |
| --- | --- | --- |
| **Chrome Web Store** | Conta de desenvolvedor da Heild (taxa única de US$ 5 [valor a confirmar]); listagem pública ou não listada; revisão a cada versão [prazo a confirmar] | Padrão |
| **Edge Add-ons** | Conta no Partner Center, sem taxa [a confirmar]; revisão própria | Escritórios com Edge |
| **Instalação gerenciada pelo escritório** | Política `ExtensionInstallForcelist` (Chrome, pelo Google Admin ou GPO; Edge, pelo Intune ou GPO), apontando para o id da loja | Escritório com TI própria: instala em todas as máquinas e impede a remoção. A ciência individual continua obrigatória no vínculo |
| Pacote fora da loja | Não | O Chrome bloqueia extensões fora da loja em Windows e macOS para usuários comuns |

### 3.7 Privacidade e consentimento

- Vale tudo do subplano 05: 3.5 (o que nunca captura), 3.6 (instalação e ciência) e 10 (termo, transparência, retenção; buffer local de 24 h, apagado ao enviar).
- Cada candidato que lê mais do que o identificador do cliente tem **chave própria, desligada por padrão**, ligada pelo Administrador, com **ciência individual nova** de cada pessoa:
  - captura de downloads;
  - copiloto, que lê e preenche campos;
  - WhatsApp Web, que lê conversas.
- A tela Meu tempo › Extensão mostra o que está ligado e o que foi enviado hoje.
- Pausa é direito: pausar desliga também a captura e o copiloto.
- Política de privacidade da extensão publicada na loja (exigência das duas lojas), com o mesmo texto do termo.

---

## 4. Fase, esforço e o que testar no piloto

| Peça | Esforço (sp, ±30%) | Fase | No piloto? |
| --- | ---: | --- | --- |
| v1 (vínculo, lista versionada, pulso, detecção por URL, título e elemento, pausa, publicação nas duas lojas) | 3 | F6 (Timesheet) no plano original; **antecipada para o piloto** pela resposta Q6 | Sim |
| Captura de downloads | 1,5 | Junto com a v1 | Sim |
| Copiloto (painel lateral, passo a passo, copiar; depois preencher com prévia) em 2 portais | 3 | Fim do piloto, como experimento | Experimento, com 2 a 4 pessoas |
| WhatsApp Web na extensão | 4 | Só se o escritório recusar a sessão no servidor | Não, salvo escolha do dono |

**O que testar no piloto:**

| Teste | Mede | Critério para seguir |
| --- | --- | --- |
| Cobertura do timesheet com e sem extensão | Horas automáticas ÷ horas trabalhadas | Meta do 05, 11: ≥ 70% no Domínio sem API com extensão |
| Acerto do cliente detectado | CNPJ detectado × cliente confirmado na confirmação assistida | ≥ 98%; cada erro analisado por portal |
| Quebra por mudança de portal | Falhas de detecção por portal por semana | Seletor corrigido por dado em até 1 dia útil |
| Captura de downloads | Arquivos guardados ÷ downloads em domínios da lista; arquivos no cliente errado | Nenhum arquivo no cliente errado |
| Aceitação | Pessoas com a extensão ativa, pausas por dia, desinstalações | Pausa não é falha; desinstalação pede conversa |
| Copiloto | Tempo da tarefa no portal com e sem o painel; erros de preenchimento | Ganho ≥ 20% sem nenhum erro de preenchimento enviado |

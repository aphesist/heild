# WhatsApp na Heild: integração não oficial e API oficial

**Versão 0.1 · 15/11/2026 · desenho.** Branch `wf-backend-apis`. Responde à decisão do dono na Q5:

- o uso do dia a dia (atendimento, suporte, recados, conversas normais) vai por integração **não oficial** com o WhatsApp Web, sem custo por mensagem;
- mensagens em massa também podem ir por ela, com o risco de banimento explicado ao escritório na venda;
- a **API oficial da Meta** só entra quando o escritório quiser envios em massa grandes, contratada e paga por ele.

Este documento compara as opções, recomenda uma e lista os riscos com franqueza. **Decisão do dono (15/11/2026): aprovado como desenhado, com o WAHA.** O escritório só precisa concordar e assumir a responsabilidade pelo banimento por mau uso, pela cláusula de aceite da seção 4.1. Pesquisa de 15/11/2026 em fontes oficiais e nos repositórios; o que não foi confirmado está marcado.

## Resumo

1. **Toda opção não oficial está fora dos Termos do WhatsApp.** A seção "Uso aceitável" proíbe mensagens automáticas, uso não pessoal sem autorização e acesso "por meios automatizados" não permitidos. O risco é contratual (suspensão ou banimento do número), não penal. A Política Business acrescenta que a Meta pode restringir quem usa serviço que viola os termos.
2. **Recomendação: WAHA, auto-hospedado na AWS da Heild, com a engine GOWS** (baseada na whatsmeow) e a NOWEB (Baileys) como reserva. Motivos:
   - licença Apache-2.0, e tudo é grátis desde que a versão Plus acabou;
   - API HTTP pronta com webhooks e várias sessões;
   - troca de engine quando o WhatsApp quebra uma delas;
   - sessão guardada no PostgreSQL da própria Heild;
   - nenhuma telemetria declarada.
3. **A Evolution API não é recomendada.** A licença pede aviso de uso dentro do sistema e mantém a logo; desde a 2.4.0, exige ativação num servidor de terceiros, com telemetria de e-mail, telefone, IP e contagem de mensagens. A manutenção foi irregular em 2026.
4. **Baileys ou whatsmeow direto** daria mais controle, mas obriga a Heild a construir e manter a camada que o WAHA já tem. O **whatsapp-web.js** pede um Chromium por sessão e quebra a cada versão do WhatsApp Web.
5. **Rodar dentro do navegador da pessoa (extensão)** deixa a sessão na máquina dela, mas não funciona com o navegador fechado, não serve a vários atendentes no mesmo número, depende da Chrome Web Store, cuja política proíbe enviar sem confirmação, e tem um histórico ruim no Brasil (131 extensões clonadas de spam em 2025). Fica como opção, não como padrão ([`EXTENSAO.md`](EXTENSAO.md), 2.3).
6. **Atendimento receptivo de escritório é o perfil de menor risco:** o cliente conhece o número e puxa a conversa, e o volume é baixo. O risco sobe muito com envio em massa e listas frias.
7. **Número em coexistência com a API oficial não pode usar a integração não oficial:** há relato de restrição imediata. Escritório que contratar a API oficial usa outro número para ela, ou passa o número inteiro para a oficial.
8. **Custo:** zero por mensagem. Infraestrutura de ~US$ 25 por mês no piloto (uma tarefa Fargate pequena) e ~US$ 50 a 200 por mês por centena de escritórios [estimativa, a medir]. Esforço: +2 sp sobre a F5 do backend.

---

## 1. As opções

| Critério | **WAHA** (GOWS ou NOWEB) | **Evolution API** | **Baileys** direto | **whatsmeow** direto | **whatsapp-web.js** | **Extensão no navegador da pessoa** |
| --- | --- | --- | --- | --- | --- | --- |
| O que é | API HTTP com webhooks e painel sobre quatro engines (WEBJS, WPP, NOWEB, GOWS) | API HTTP multi-instância sobre Baileys; também fala com a Cloud API | Biblioteca TypeScript, WebSocket no protocolo multi-dispositivo | Biblioteca Go, WebSocket | Biblioteca JS que controla um Chromium com o WhatsApp Web | Content script em `web.whatsapp.com` |
| Licença | Apache-2.0; "There's no separate 'Plus' image anymore… Everything is free" | Apache-2.0 **com condições**: manter a logo e o copyright no console; **aviso de uso visível no sistema**; o descumprimento pode exigir licença comercial; ativação obrigatória desde a 2.4.0 | MIT | MPL-2.0 (copyleft só nos arquivos da biblioteca) | Apache-2.0 | Nossa |
| Atividade (15/11/2026) | Tag 2026.10.1; commit em 28/10/2026; 7,8 mil estrelas; 3,3 mi de pulls no Docker | 2.4.0 no develop; 10,1 mil estrelas; mudou de organização; issue "projeto abandonado?" em 04/2026 | Commit em 14/11/2026; npm ainda em 7.0.0-rc14 (07/2026); 4,2 mi de downloads/mês | Commit em 13/11/2026; só 76 issues abertas | 1.34.8 (12/11/2026); 464 mil downloads/mês | — |
| Estabilidade | Média: quebras recentes em GOWS (desconexões) e NOWEB (`device_removed`); a troca de engine contorna parte delas | Média-baixa: herda o Baileys; QR que não aparece | Média: problemas de pareamento e *passkey* em 11/2026 | Média-alta | Média-baixa: quebra a cada versão do WhatsApp Web | Baixa: a página muda com frequência |
| Risco de banimento | Igual em todas: depende do uso. A WAHA documenta os sinais de restrição (463 e 475) | Igual; relato "todo número que conecto é banido" (04/2026) | Igual | Igual | Igual (o navegador "parece mais humano", sem garantia) | Igual ou um pouco menor no uso humano; maior se automatizar |
| Onde fica a sessão | PostgreSQL próprio (ou arquivo); mídia em S3 | Banco da instância, com *heartbeat* para o servidor de licenças | Onde o integrador gravar (banco recomendado); as chaves mudam a cada mensagem | Banco SQL | Perfil inteiro do Chromium (difícil de cifrar) | Máquina da pessoa |
| Multiatendente | Várias sessões pela API; os atendentes ficam no CRM da Heild | Multi-instância; Chatwoot nativo | Construir | Construir | Construir | Fraco: um número num navegador |
| Mídia e áudio | Imagem, documento, vídeo e nota de voz; baixa a mídia recebida | Sim | Sim | Sim | Sim (vídeo exige Chrome) | Depende do que a página permite |
| Recursos | GOWS e NOWEB sem navegador (leves) | Leve, mais PostgreSQL e Redis | Leve | Leve | Pesado: centenas de MB por sessão [a confirmar] | Da máquina da pessoa |
| Linguagem | Contêiner pronto; a Heild fala HTTP | Contêiner | TypeScript (o nosso stack) | Go (fora do stack) | JavaScript | TypeScript |

### Recomendação

**WAHA auto-hospedado, engine GOWS, NOWEB como reserva**, atrás da interface de provedor do CRM (subplano 04, 3.4: receber, enviar, status, baixar mídia, modelos, saúde). Assim, trocar de engine, de biblioteca ou ir para a Cloud API é trocar o adaptador, não o CRM.

Motivos, em ordem:

1. Nenhuma condição de licença nem telemetria para terceiros.
2. Quando o WhatsApp quebra uma engine, há outra no mesmo contêiner.
3. Sessão no nosso banco, cifrada, sob o nosso controle.
4. Menos código próprio para manter do que Baileys ou whatsmeow direto.

Se o WAHA parar de ser mantido, o caminho é o Baileys direto (TypeScript, o nosso stack) atrás da mesma interface.

---

## 2. Desenho da integração

```
celular do escritório ── (aparelho conectado) ── WAHA (Fargate, sa-east-1) ── webhook ──► api /v1/webhooks/whatsapp_web
   QR lido uma vez                               sessão por número             │
                                                 Postgres próprio (cifrado)     ▼
                                                 mídia → S3 da Heild        CRM: conversa, mensagem, documento
                                                                            integrante prepara · pessoa envia
```

| Peça | Desenho |
| --- | --- |
| Conector | `whatsapp_web` (família `mercado`), irmão do `whatsapp_cloud`. Mesma interface (`canal.*`), com `provedor` na conexão |
| Onde roda | Serviço próprio `wa-gateway` (contêiner do WAHA) no ECS, em sub-rede sem entrada pública: só a `api` e o `worker` falam com ele; a chave da API do WAHA fica no Secrets Manager |
| Sessão | Uma por número (um número por setor ou por escritório). Guardada num PostgreSQL **separado do banco da aplicação** (schema e papel próprios, disco cifrado), isolada por escritório. O QR é lido na tela Configurações › CRM › Números pelo Administrador, com o celular do escritório |
| Entrada | Webhook do WAHA → `POST /v1/webhooks/whatsapp_web`, com segredo compartilhado, dedupe pelo id da mensagem, bruto gravado antes de processar (C5). Mídia baixada na hora para o S3 e registrada por `documento.registrar`; áudio transcrito |
| Saída | `conversa.responder` e `mensagem.enviar_modelo` passam pelo executor (cartão para o integrante, como hoje). O worker aplica o ritmo da seção 3 antes de entregar ao WAHA |
| Multiatendente | O número tem uma sessão; os atendentes são pessoas do CRM da Heild (assumir, transferir, nota interna). Ninguém lê o QR no próprio celular |
| Saúde | `canal.saude` lê o estado da sessão (conectada, pedindo QR, restrita). Sinais 463 e 475 pausam os contatos novos daquele número por 24 h e avisam o Administrador. Sessão caída por mais de 15 min acorda o integrante de Gestão |
| Envio em massa | Comunicados e réguas para muitos destinatários só com opt-in registrado, ritmo da seção 3 e cartão do Gestor mostrando o risco. Acima do teto por número (proposta: 200 destinatários novos por dia), a tela sugere a API oficial |
| Desligar | "Desconectar número" na tela apaga a sessão no banco e pede ao WAHA o logout; o escritório também pode desvincular pelo celular (Configurações › Aparelhos conectados) |

### API oficial (Cloud API)

- Continua no catálogo para o escritório que quiser **envio em massa grande**. A conta, o número e o custo são dele (preços na seção 4 do [`CATALOGO_CONTABIL.md`](CATALOGO_CONTABIL.md)).
- Usa **outro número**, ou o número inteiro migrado para a oficial. Não usar a integração não oficial num número que está na Cloud API ou em coexistência: há relato de restrição imediata ao vincular um cliente não oficial a uma conta Business verificada (Baileys, issue 2805).
- No piloto, um **número de teste oficial** (gratuito na Meta) serve para validar o adaptador `whatsapp_cloud` e os modelos de mensagem, sem tráfego real.

---

## 3. Boas práticas para reduzir banimento

Aplicadas pelo sistema, não deixadas à pessoa. As que vêm da documentação do WAHA ("How to Avoid Blocking") estão marcadas com (W); da Política Business da Meta, com (M).

| Prática | Como o sistema aplica |
| --- | --- |
| Responder mais do que iniciar (W) | O padrão é atendimento receptivo. Para o cliente puxar a conversa, o app e o e-mail levam o link `wa.me/<número>` |
| Opt-in e opt-out (M) | Só envia para quem é contato do cliente cadastrado ou já falou com o número. "SAIR" ou "PARAR" marca opt-out na identidade, e o sistema nunca mais inicia conversa com ela |
| Ritmo humano (W) | Marca como lida, "digitando" por tempo proporcional ao texto, intervalo aleatório de 30 a 60 s entre mensagens em lote, blocos com pausa, nada de horário fixo nem operação 24/7 (envios fora do horário comercial ficam para a manhã) |
| Variação (W) | Modelo de comunicado com o nome da pessoa e variações de redação; nunca o mesmo texto idêntico para centenas de contatos |
| Perfil completo (W) | Foto, nome e descrição do escritório preenchidos antes de ligar |
| Aquecimento de número novo | Primeiras 2 semanas só receptivo, com aumento gradual dos envios iniciados [prática da comunidade; números a confirmar] |
| Sinais de restrição (W) | 463 e 475: pausar contatos novos, nunca reiniciar nem parear de novo a sessão |
| Links | Só HTTPS, de domínio do escritório ou da Heild; nada de encurtador |
| Denúncias | Ser marcado como spam 5 a 10 vezes leva ao banimento (W); por isso o envio em massa pede opt-in e cartão do Gestor |
| Escalada para pessoa (M) | Automação só dentro de conversa iniciada pelo cliente, sempre com caminho claro para falar com uma pessoa (o integrante prepara, uma pessoa envia) |

---

## 4. Riscos, com franqueza

| Risco | O que pode acontecer | Mitigação possível | O que não dá para evitar |
| --- | --- | --- | --- |
| **Termos da Meta** | Uso fora dos Termos do WhatsApp e da Política Business; a Meta pode suspender ou banir o número a qualquer momento, sem aviso nem recurso garantido | Perfil receptivo, ritmo, opt-in | O uso continua fora dos termos |
| **Número banido** | O escritório perde o número com que os clientes falam; o histórico no celular pode ficar inacessível; os clientes passam a ver o número como inválido | Histórico guardado na Heild (CRM); aviso no app e no e-mail com o canal alternativo; número reserva cadastrado | Recuperar o número depende da Meta |
| **Exposição da Heild** | A Heild opera a infraestrutura que viola os termos de um terceiro (aceito pelo dono em 15/11/2026); a Meta já processou desenvolvedores de apps não oficiais (caso HeyMods, 2022, por roubo de contas e spam; não achamos ação contra Baileys, WAHA ou Evolution); risco de reputação se um escritório usar para spam | Contrato com o escritório, limites de envio, opt-in obrigatório, registro de quem enviou o quê | O risco jurídico residual é da Heild como fornecedora; precisa de parecer |
| **Vazamento da sessão** | Quem tem os dados da sessão lê e envia como o escritório, sem QR novo, até o aparelho ser desvinculado | Banco separado e cifrado, rede fechada, chave no Secrets Manager, rotação ao primeiro sinal, botão "desconectar" | — |
| **Quebra por mudança do WhatsApp** | O atendimento para por horas ou dias | Duas engines; monitor de saúde; app e e-mail como canal de contingência | Dias sem WhatsApp são possíveis |
| **LGPD** | Mensagens de clientes guardadas e processadas pela Heild e pelo fornecedor de modelos | Já previsto no CRM: DPA, retenção, registro | — |
| **Política de IA da Meta** | Respostas automáticas por IA no WhatsApp estão em discussão (política da Meta e inquérito do CADE, 08, 7.1) | Integrante prepara, pessoa envia | — |

**Revisão jurídica recomendada** do texto da cláusula abaixo e da exposição da Heild como fornecedora. Não trava o piloto (decisão do dono de 15/11/2026).

### 4.1 Cláusula de aceite

A mesma cláusula vale em dois lugares:

1. **No contrato** com o escritório, como cláusula própria.
2. **Dentro do sistema, ao ligar o WhatsApp:** antes de mostrar o QR, a tela Configurações › CRM › Números exibe o texto inteiro, com a caixa "Li e aceito, em nome do escritório", habilitada só para o Administrador. Sem o aceite, o QR não aparece.

Registro do aceite:

- A ferramenta `whatsapp_web.aceitar_risco` (nível `executar`, só Administrador, irreversível no sentido de que não se desfaz; um novo aceite substitui) grava o evento `whatsapp_web.risco_aceito` na cadeia de eventos, com `usuario_id`, `escritorio_id`, versão e hash do texto, data e hora do servidor, IP e agente do navegador.
- **Mudou o texto, muda a versão:** o número segue funcionando por 30 dias, com aviso no sino do Administrador, até o novo aceite. Sem novo aceite, a sessão é pausada (não apagada).
- A tela de Números mostra quem aceitou, quando e qual versão. O aceite aparece na exportação do escritório (LGPD) e na auditoria.
- Aceite por integrante não existe: a ferramenta não entra em recorte de agente.

**Texto da cláusula** (versão 1, revisão jurídica recomendada):

> **WhatsApp por integração não oficial.** O Contratante declara ciência de que a integração com o WhatsApp oferecida pela Heild no plano padrão usa conexão não oficial com o WhatsApp Web, que não é autorizada pela Meta e está em desacordo com os Termos de Serviço do WhatsApp. Em consequência, (i) a Meta pode, a qualquer momento e sem aviso, restringir, suspender ou banir o número conectado, inclusive de forma definitiva; (ii) a Heild não garante a disponibilidade da integração, que pode parar quando o WhatsApp mudar; (iii) o risco de banimento aumenta com o envio de mensagens em massa, para contatos que não pediram para receber mensagens ou com conteúdo repetido; (iv) o Contratante é responsável por obter e registrar o consentimento dos destinatários e por respeitar os pedidos de descadastro. (v) o Contratante assume a responsabilidade pelo banimento ou restrição do número decorrente de mau uso, em especial envio em massa, envio sem consentimento ou descumprimento das boas práticas de envio que o sistema aplica e informa. A Heild mantém o histórico das conversas na plataforma, mas não responde pela perda do número nem pelo conteúdo armazenado no aparelho. Para envios em massa ou para quem não aceitar esses riscos, a Heild oferece a integração com a API oficial do WhatsApp Business, contratada e paga pelo Contratante diretamente à Meta. O aceite desta cláusula no sistema, pelo Administrador do Contratante, fica registrado com data, hora e versão do texto.

---

## 5. Esforço e custo

| Item | Valor |
| --- | --- |
| Esforço | **+2 sp** sobre a F5 do backend: serviço `wa-gateway`, adaptador `whatsapp_web`, QR e saúde na tela de Números, ritmo e opt-out no worker, testes de quebra. O adaptador `whatsapp_cloud` (número de teste oficial) custa +0,5 sp |
| Custo por mensagem | R$ 0 |
| Infraestrutura no piloto | 1 tarefa Fargate ARM de 0,5 vCPU e 1 GB ≈ US$ 24,80 por mês (preço da tabela de HOSPEDAGEM, 4); o banco das sessões cabe numa instância pequena separada ou num schema isolado [decidir na implementação] |
| Infraestrutura em escala | ~US$ 50 a 200 por mês por centena de escritórios (GOWS e NOWEB não usam navegador) [estimativa; medir RAM por sessão no piloto] |

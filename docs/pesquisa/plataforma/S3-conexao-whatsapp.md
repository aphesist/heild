# S3 · Conexão do CRM com o WhatsApp

Pesquisa de 7/11/2026 para o [Desenho do Sistema](../../planos/Desenho_do_Sistema.md), seção 3. Páginas da Meta sobre coexistência e verificação renderizam por JavaScript e não puderam ser lidas; esses pontos vêm de imprensa e de provedores e estão marcados.

## 1. Opções de conexão

**a) Cloud API direto na Meta.** Grátis além das conversas; webhooks, templates, limites por portfólio. Exige Business Manager, CNPJ, site e número exclusivo (não pode estar num app pessoal ou Business), salvo coexistência. Número fixo pode ser usado.

**b) Via provedor (BSP).** Cobram hospedagem do número mais repasse da Meta: [360dialog](https://www.360dialog.com/pricing) €99 por número por mês, plano para ISVs €250 por mês + €49 por canal sem markup; [Gupshup](https://www.gupshup.io/pricing) pré-pago sem mensalidade, markup [a confirmar]; [Zenvia](https://www.zenvia.com/precos/) software R$ 0–600 por mês + pacotes de canal + R$ 649 de ativação; [Z-API](https://www.z-api.io/) R$ 99,99 por canal por mês (R$ 89,99 acima de 10 canais), historicamente por QR Code com opção Cloud API [a confirmar]; Twilio e Positus não acessíveis [a confirmar].

**c) Não oficial (WhatsApp Web / multi-device).** [Baileys](https://github.com/WhiskeySockets/Baileys), [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js), [Evolution API](https://github.com/EvolutionAPI/evolution-api) (Baileys ou Cloud API na mesma instância, só muda a configuração), WAHA, Venom. Ativos em 2026, mas os próprios READMEs dizem que o WhatsApp não permite bots nem clientes não oficiais e que o bloqueio não é garantido de não acontecer. Riscos: viola os termos (contratual), banimento sem aviso, quebra a cada mudança do protocolo, sem opt-in auditável para LGPD ([Clint, jun/2026](https://clint.digital/blog/riscos-whatsapp-nao-oficial-2026)). Limite nativo de 4 aparelhos vinculados por número [a confirmar]; cada instância consome um. Estatísticas de "68% banidos" circulam sem fonte primária.

**d) Coexistência.** Mesmo número no app WhatsApp Business e na Cloud API, via Embedded Signup de um parceiro; app atualizado, sincroniza até 6 meses de histórico; o app precisa abrir a cada 14 dias; grupos, listas de transmissão e visualização única não sincronizam; vazão reduzida; sem custo além das tarifas da Meta ([Chakra, mai/2026](https://articles.chakrahq.com/article/whatsapp-coexistence-faq-answers-details/), [seven.io](https://help.seven.io/en/whatsapp/whatsapp-coexistence)). Brasil aparece como suportado em Digisac e [Kommo](https://www.kommo.com/br/recursos/apps-de-mensagens/cloud-api-coexistence/) [lista oficial a confirmar].

**O que os CRMs brasileiros usam.** [Digisac](https://digisac.com.br/canais/whatsapp-api) (Gupshup/360dialog + coexistência); [ChatGuru](https://www.chatguru.com.br/) (parceira oficial, transcreve e resume áudio); Tallos/RD Atendimento (oficial, R$ 989 por mês, "para não ter número bloqueado"); Kommo (Cloud API + coexistência; QR só em sandbox). Gestta, Acessórias, Hubstrom e Multi360: páginas bloqueadas [a confirmar].

## 2. Regras da Meta que afetam o desenho

- **Janela de 24 h** após mensagem do cliente: texto livre (serviço, grátis). Fora dela só **template aprovado** (utilidade, marketing, autenticação), com opt-in registrado.
- **Limites de envio** (por portfólio, 24 h móveis, destinatários únicos fora da janela): 250 → 2.000 (verificação da empresa ou 2.000 entregas de template de alta qualidade em 30 dias) → 10 mil → 100 mil → ilimitado, por escalonamento automático ([Meta](https://developers.facebook.com/docs/whatsapp/messaging-limits)).
- **IA.** Em out/2025 a Meta proibiu "assistentes de IA de uso geral" (vigência 15/1/2026); bots de atendimento ao cliente nunca foram atingidos ([TechCrunch](https://techcrunch.com/2026/01/15/after-italy-whatsapp-excludes-brazil-from-rival-chatbot-ban)). CADE: medida preventiva em jan/2026, suspensa pela Justiça, mantida pelo plenário em 4/3/2026 ([CNN](https://www.cnnbrasil.com.br/economia/negocios/cade-mantem-medida-preventiva-que-obriga-meta-a-permitir-chatbots-de-ia-no-whatsapp/)); Meta liberou provedores de IA no Brasil cobrando US$ 0,0625 por mensagem fora de template desde 11/3 ([TechCrunch](https://techcrunch.com/2026/03/06/after-europe-whatsapp-will-let-rival-ai-companies-offer-chatbots-in-brazil/)); multa diária suspensa pela Justiça Federal em abr/2026, com conciliação; mérito segue aberto ([Tecnoblog](https://tecnoblog.net/noticias/justica-impede-cade-de-multar-meta-por-limitar-ias-no-whatsapp/)). Para um CRM contábil, em que a IA auxilia o atendimento do próprio escritório, a tarifa de "provedor de IA" não deve se aplicar [a confirmar na política].

## 3. Áudio e mídia

Webhook de mensagem traz o id do áudio; a API devolve uma URL válida por 5 minutos; download com o token. Voz chega em `audio/ogg` codec OPUS mono, até 16 MB; ids de webhook expiram em 7 dias, mídia enviada fica 30 dias ([Meta](https://developers.facebook.com/docs/whatsapp/cloud-api/reference/media)). Transcrição (USD por minuto, português suportado): OpenAI gpt-4o-mini-transcribe ~0,003, whisper-1 ~0,006 [a confirmar]; [Deepgram Nova-3](https://deepgram.com/pricing) 0,0077; [AssemblyAI](https://www.assemblyai.com/pricing) 0,0025 a 0,0035; [Google STT](https://cloud.google.com/speech-to-text/pricing) 0,016 (60 min grátis por mês) ou 0,003 em lote; whisper local custa só a máquina. Um minuto custa centavos: vale transcrever tudo.

## 4. Recomendação

1. MVP: **Cloud API direto na Meta**, com **Embedded Signup e coexistência**, para o escritório manter o app no celular e o CRM no mesmo número.
2. Setores, transferência e status são lógica do CRM; a API só roteia um número. Não há limite de atendentes.
3. Abstrair o canal (interface de provedor) desde o início, como a Evolution API faz, para trocar Cloud API, BSP e não oficial sem reescrever.
4. Escala: virar Tech Provider da Meta ou usar 360dialog Partner (sem markup) para onboarding em lote.
5. Modo "econômico" não oficial (Baileys/Evolution): só como opt-in experimental, com aviso explícito de banimento, histórico salvo no CRM e botão de migração para coexistência.
6. Nunca usar o não oficial para disparos fora da janela; esses vão por template.
7. Transcrever todo áudio (AssemblyAI ou gpt-4o-mini-transcribe, ~R$ 0,015 a 0,02 por minuto) e guardar o texto na conversa.
8. Acompanhar o inquérito do CADE e a tarifa de provedor de IA antes de posicionar "IA responde o cliente" como recurso vendido.

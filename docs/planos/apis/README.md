# Plano de APIs da Heild: pacote Contábil (desenho)

**15/11/2026 · branch `wf-backend-apis`, sobre o `wf-backend-stack`.** Quais APIs externas o Contábil usa, qual é a API da própria plataforma para o frontend e os agentes, e em que ordem construir. BPO e Jurídico ficam para outra rodada; os integrantes (orquestração, prompts, modelos) são da frente de IA. Nada aqui está implementado.

> **Nos planos desde 15/11/2026** (ver [`../ATUALIZACOES.md`](../ATUALIZACOES.md)): cópia do branch `wf-backend-apis`, `docs/apis/`, no commit f9451f8 (15/11/2026 03:39). O Enzo respondeu Q1 a Q10 e tomou decisões no mesmo dia, registradas em [`PERGUNTAS.md`](PERGUNTAS.md). Os documentos de backend que esse branch carrega são mais antigos que os de [`../backend/`](../backend/), que seguem a versão do `wf-backend-stack` com as decisões P1 a P10.

| Documento | O que responde |
| --- | --- |
| [`CATALOGO_CONTABIL.md`](CATALOGO_CONTABIL.md) | Todas as APIs externas do Contábil, por grupo: uso, classe, quem paga, preço com fonte e data, limites, credencial, risco, alternativa e o que o wireframe simula. **Começa por um resumo de 15 linhas** |
| [`API_INTERNA.md`](API_INTERNA.md) | A API da plataforma por setor: operações de processo, contexto e entidade; audiências (app, equipe, agentes, serviço); erro acionável, idempotência, paginação, limites, versionamento; o mapa de `app/src/servicos` para ferramentas de conector |
| [`ORDEM_DE_IMPLEMENTACAO.md`](ORDEM_DE_IMPLEMENTACAO.md) | O que pedir já (contratos, credenciais, prazos), o que cada fase do backend entrega de API, e o custo mensal no piloto e com 10, 100 e 1.000 escritórios |
| [`WHATSAPP.md`](WHATSAPP.md) | A integração não oficial com o WhatsApp Web (opções comparadas, recomendação, boas práticas contra banimento, riscos e o aviso para o contrato) e onde a API oficial ainda entra |
| [`ARMAZENAMENTO.md`](ARMAZENAMENTO.md) | Os arquivos no armazenamento do escritório: o que a Heild guarda, os conectores (Drive, OneDrive e SharePoint, Dropbox, Box, S3, WebDAV, SFTP, NAS, iCloud), o passo a passo do Google Workspace e o agente local para servidor próprio |
| [`EXTENSAO.md`](EXTENSAO.md) | A extensão de navegador: escopo da v1, candidatos, arquitetura MV3, permissões, distribuição, privacidade, fase e testes do piloto |
| [`PERGUNTAS.md`](PERGUNTAS.md) | Dez decisões para o dono, com a recomendação e a resposta de 15/11/2026, e as pendências que ficam com ele |

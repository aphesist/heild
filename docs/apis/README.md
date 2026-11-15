# Plano de APIs da Heild: pacote Contábil (desenho)

**15/11/2026 · branch `wf-backend-apis`, sobre o `wf-backend-stack`.** Quais APIs externas o Contábil usa, qual é a API da própria plataforma para o frontend e os agentes, e em que ordem construir. BPO e Jurídico ficam para outra rodada; os integrantes (orquestração, prompts, modelos) são da frente de IA. Nada aqui está implementado.

| Documento | O que responde |
| --- | --- |
| [`CATALOGO_CONTABIL.md`](CATALOGO_CONTABIL.md) | Todas as APIs externas do Contábil, por grupo: uso, classe, quem paga, preço com fonte e data, limites, credencial, risco, alternativa e o que o wireframe simula. **Começa por um resumo de 15 linhas** |
| [`API_INTERNA.md`](API_INTERNA.md) | A API da plataforma por setor: operações de processo, contexto e entidade; audiências (app, equipe, agentes, serviço); erro acionável, idempotência, paginação, limites, versionamento; o mapa de `app/src/servicos` para ferramentas de conector |
| [`ORDEM_DE_IMPLEMENTACAO.md`](ORDEM_DE_IMPLEMENTACAO.md) | O que pedir já (contratos, credenciais, prazos), o que cada fase do backend entrega de API, e o custo mensal no piloto e com 10, 100 e 1.000 escritórios |
| [`PERGUNTAS.md`](PERGUNTAS.md) | Dez decisões para o dono, cada uma com a recomendação |

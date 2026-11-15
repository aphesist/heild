# Backend real da Heild (desenho)

**15/11/2026 · branch `wf-backend-stack`.** Desenho do backend que nasce em cima do wireframe (`app/`). Nada aqui está em produção.

| Documento | O que responde |
| --- | --- |
| [`STACK.md`](STACK.md) | Linguagem e framework, com a medição; banco (o que usar do Supabase), filas, cache, documentos, busca, eventos com cadeia de hash, cofre, observabilidade. **Começa por um resumo de 15 linhas** |
| [`HOSPEDAGEM.md`](HOSPEDAGEM.md) | Onde rodam a API e os workers: provedores comparados, latência até o Supabase de São Paulo, custo do piloto e com 10, 100 e 1.000 escritórios, LGPD, caminho de crescimento |
| [`AGENTICO.md`](AGENTICO.md) | Toda operação como ferramenta tipada, organizada por setores; servidor MCP; contratos gerados de uma fonte só; eventos que acordam integrantes; idempotência, limites, trilha; onde o orquestrador se liga |
| [`ARQUITETURA.md`](ARQUITETURA.md) | Diagrama dos serviços, o caminho de um pedido da tela e de um agente, a implantação, o que muda no frontend e o plano de migração em fases, com esforço |
| [`PERGUNTAS.md`](PERGUNTAS.md) | Dez decisões para o dono, cada uma com a recomendação |
| [`poc/`](poc/README.md) | A medição: o mesmo endpoint sob RLS em Node, Bun, Go e Rust |

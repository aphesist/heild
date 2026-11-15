# Servidor da Heild (API)

A API do backend real: Node 24, Fastify, Postgres com RLS. Roda local; a hospedagem fica para depois.

```bash
npm install                          # na raiz do repositório (monorepo)
npm run preparar -w @heild/servidor  # Postgres local na porta 54329, migrações e semente
npm run dev                          # API em http://127.0.0.1:8787
npm test                             # testes contra o Postgres local (banco heild_teste)
```

O que existe, como funciona, como testar e o encaixe com as próximas sessões: [`docs/backend/IMPLEMENTACAO.md`](../docs/backend/IMPLEMENTACAO.md), seção B1.

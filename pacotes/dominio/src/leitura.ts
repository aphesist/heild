/**
 * A regra de quem lê o quê (classes de tabela e `podeLerLinha`, B5) mora no núcleo do app,
 * sem dependência nova, porque roda no navegador (o `useConsulta` no modo local) e no
 * servidor (`sincronizar`, SSE, leitura tipada). Ver app/src/nucleo/permissoes/leitura.ts.
 */
export * from '@/nucleo/permissoes/leitura'

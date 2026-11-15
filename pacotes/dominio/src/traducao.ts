/**
 * O tradutor da chamada da tela para a ferramenta tipada (B5) mora no núcleo do app, sem
 * Zod, porque roda no navegador (adaptador `api`) e no servidor (a sugestão do erro
 * USE_FERRAMENTA_TIPADA). Ver app/src/nucleo/banco/traducao.ts.
 */
export * from '@/nucleo/banco/traducao'

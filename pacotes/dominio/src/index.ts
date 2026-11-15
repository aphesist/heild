/**
 * @heild/dominio: o que roda igual no navegador e no servidor (STACK 2.4; R8: uma regra só).
 *
 * Duas partes:
 *  1. O núcleo do wireframe, re-exportado daqui (entidades, `autorizar`, catálogo de
 *     ferramentas, perfil, regras dos repositórios). Ele continua morando em
 *     app/src/nucleo enquanto as sessões do wireframe ainda mexem nesses arquivos: mover
 *     agora daria conflito em todo merge do `wireframe` para o `backend`. O servidor
 *     importa só deste pacote, nunca de `@/` direto; quando o wireframe congelar, os
 *     arquivos mudam de pasta e só este índice muda (docs/backend/IMPLEMENTACAO.md, B1).
 *  2. O que é novo do backend: contratos (comando, envelope, erros acionáveis), as
 *     ferramentas tipadas com Zod estrito e a canonização com a cadeia de hash.
 */

// 1. Núcleo do wireframe (fonte única de autorização, catálogo, entidades e regras)
export * from '@/nucleo/modelo/entidades'
export { autorizar, autorizarPerfil, ErroPermissao, ErroRegra, type Alvo, type Decisao } from '@/nucleo/permissoes/autorizar'
export { ferramentas as catalogo, ferramenta as ferramentaDoCatalogo, type Ferramenta } from '@/nucleo/permissoes/ferramentas'
export { permissoesDoPerfil, type Permissoes } from '@/nucleo/permissoes/telas'
export { nomeDoAtor, idDoAtor, type Ator, type Contexto, type Perfil } from '@/nucleo/permissoes/perfil'
export { contaParaTela, perfilDeConta } from '@/nucleo/mapeadores'
export { Banco, comBanco, type Transacao } from '@/nucleo/banco'
export { adaptadorMemoria, fotografiaVazia } from '@/nucleo/banco/navegador'
export { repos, comoAtor, definirGeradorId, definirModoAprovacao, ErroAprovacao, novoIdPadrao, registrarEvento, Repositorio, type Repos, type RegrasEntidade } from '@/nucleo/repositorios'
export { escritoriosDeExemplo, escritorioDeExemplo } from '@/nucleo/semente'

// 2. Novo do backend
export * from './canonico'
export * from './cadeia'
export * from './contrato'
export * from './erros'
export * from './ferramentas'
export * from './jobs'

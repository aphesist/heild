import { contextoSistema, type Contexto } from '../permissoes/perfil'

/**
 * Quem está agindo agora. A sessão (src/ambiente/sessao.tsx) define a pessoa
 * da tela; o motor da demonstração passa o integrante na própria chamada
 * (`{ ctx: { ator: { tipo: 'integrante', ... } } }`). Sem sessão, é o sistema.
 */
let atual: Contexto = contextoSistema

export const contextoAtual = () => atual
export function definirContexto(ctx: Contexto | null) {
  atual = ctx ?? contextoSistema
}

/** Roda `fazer` como outro ator (o integrante que trabalha, o app do cliente) e volta. */
export function comoAtor<R>(ctx: Contexto, fazer: () => R): R {
  const antes = atual
  atual = ctx
  try {
    return fazer()
  } finally {
    atual = antes
  }
}

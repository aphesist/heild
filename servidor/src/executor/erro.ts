import { CODIGOS, statusDoCodigo, type CodigoErro, type RespostaErro } from '@heild/dominio'

/** Erro com código estável, que vira o envelope acionável (AGENTICO 8). */
export class ErroApi extends Error {
  readonly codigo: CodigoErro
  readonly status: number
  readonly campo: string | null
  readonly acaoSugerida: RespostaErro['acao_sugerida']
  readonly detalhes?: Record<string, unknown>
  /** Ferramenta em que a negação aconteceu (vai para o evento `negado`). */
  readonly ferramenta?: string

  constructor(codigo: CodigoErro, o: { mensagem?: string; campo?: string | null; acao_sugerida?: RespostaErro['acao_sugerida']; detalhes?: Record<string, unknown>; ferramenta?: string } = {}) {
    super(o.mensagem ?? CODIGOS[codigo])
    this.codigo = codigo
    this.status = statusDoCodigo(codigo)
    this.campo = o.campo ?? null
    this.acaoSugerida = o.acao_sugerida ?? null
    this.detalhes = o.detalhes
    this.ferramenta = o.ferramenta
  }

  get negado() {
    return this.status === 403
  }

  corpo(eventoId?: string): RespostaErro {
    return {
      resultado: this.negado ? 'negado' : 'erro',
      codigo: this.codigo,
      campo: this.campo,
      mensagem: this.message,
      acao_sugerida: this.acaoSugerida,
      tentar_de_novo_em: null,
      ...(this.detalhes ? { detalhes: this.detalhes } : {}),
      ...(eventoId ? { evento_id: eventoId } : {}),
    }
  }
}

/** Zod → primeiro erro por campo, no formato acionável. */
export function erroDeEntrada(issues: { path: PropertyKey[]; message: string }[], prefixo = ''): ErroApi {
  const i = issues[0]
  const campo = [prefixo, ...(i?.path ?? []).map(String)].filter(Boolean).join('.') || null
  return new ErroApi('ENTRADA_INVALIDA', {
    campo,
    mensagem: i ? `${campo ? `${campo}: ` : ''}${i.message}` : 'Entrada inválida.',
    detalhes: { erros: issues.slice(0, 10).map((x) => ({ campo: [prefixo, ...x.path.map(String)].filter(Boolean).join('.'), mensagem: x.message })) },
  })
}

import type { Tx } from './banco.ts'
import type { Ator, Modulo, Perfil } from './dominio.ts'

/** Origem da chamada, como no evento (5.1), mais `mcp` para o servidor MCP. */
export type Origem = 'tela' | 'chat' | 'job' | 'evento' | 'mcp'

/** Quem age, em qual escritório e por qual porta. É o `ctx` de toda ferramenta e de toda execução. */
export interface ContextoExec {
  escritorio_id: string
  ator: Ator
  origem: Origem
}

export const prioridadePorOrigem: Record<Origem, number> = {
  // AGENTICO 4.6: pedido de pessoa no chat, depois evento, depois job em segundo plano.
  chat: 30,
  tela: 30,
  mcp: 30,
  evento: 20,
  job: 10,
}

export const idDoAtor = (a: Ator) => (a.tipo === 'pessoa' ? a.perfil.usuario_id : a.tipo === 'integrante' ? a.id : null)
export const nomeDoAtor = (a: Ator) =>
  a.tipo === 'pessoa' ? a.perfil.nome : a.tipo === 'integrante' ? (a.nome ?? a.id) : a.tipo === 'pessoa_cliente' ? a.nome : (a.nome ?? 'Sistema')
export const tipoDoAtor = (a: Ator): 'pessoa' | 'integrante' | 'sistema' => (a.tipo === 'pessoa' ? 'pessoa' : a.tipo === 'integrante' ? 'integrante' : 'sistema')

/**
 * Perfil materializado de uma pessoa (Fundações 3.2), lido do banco sob RLS.
 * Interface mínima da B2: a B1 é dona do perfil com cache e invalidação por `conta.*`;
 * quando entregar, este carregador passa a chamar o dela.
 */
export async function carregarPerfil(tx: Tx, usuario_id: string): Promise<Perfil | null> {
  const [u] = await tx`select id, nome, papel, situacao from usuario where id = ${usuario_id} and arquivado_em is null`
  if (!u || u.situacao !== 'ativo') return null
  const [esc] = await tx`select carteira_ligada from escritorio where id = escritorio_atual()`
  const vinculos = await tx`
    select s.codigo as setor, v.modo from vinculo_setor v join setor s on s.escritorio_id = v.escritorio_id and s.id = v.setor_id
    where v.usuario_id = ${usuario_id} and v.arquivado_em is null and v.vigente_de <= current_date and (v.vigente_ate is null or v.vigente_ate >= current_date)`
  const excecoes = await tx`
    select tela_ou_ferramenta as tela, efeito, nivel_max, motivo from excecao_tela
    where usuario_id = ${usuario_id} and arquivado_em is null and vigente_de <= current_date and (vigente_ate is null or vigente_ate >= current_date)`
  const carteira = await tx`select cliente_id from carteira_cliente where usuario_id = ${usuario_id} and arquivado_em is null`
  const assin = await tx`
    select modulos from assinatura where dono_tipo = 'escritorio' and arquivado_em is null and vigente_de <= current_date
    and (vigente_ate is null or vigente_ate >= current_date)`
  const modulos = [...new Set(assin.flatMap((a) => a.modulos as Modulo[]))]
  return {
    usuario_id: u.id,
    nome: u.nome,
    papel: u.papel,
    vinculos: vinculos.map((v) => ({ setor: v.setor, modo: v.modo })),
    excecoes: excecoes.map((x) => ({ tela: x.tela, efeito: x.efeito, nivel_max: x.nivel_max ?? undefined, motivo: x.motivo ?? undefined })),
    carteira: carteira.map((c) => c.cliente_id),
    carteira_ligada: Boolean(esc?.carteira_ligada),
    modulos,
  }
}

export async function contextoDePessoa(tx: Tx, escritorio_id: string, usuario_id: string, origem: Origem): Promise<ContextoExec> {
  const perfil = await carregarPerfil(tx, usuario_id)
  if (!perfil) throw new ErroPermissao('conta', 'Conta inativa ou inexistente.')
  return { escritorio_id, origem, ator: { tipo: 'pessoa', perfil } }
}

/**
 * Integrante agindo em nome de alguém (R4): o dono é recarregado a cada execução. O integrante
 * compartilhado do setor sem pessoa por trás (evento, job) age sem dono: tudo o que for
 * irreversível vira cartão para uma pessoa.
 */
export async function contextoDeIntegrante(tx: Tx, escritorio_id: string, integrante_id: string, origem: Origem, dono_id?: string | null): Promise<ContextoExec> {
  const [i] = await tx`select id, nome_exibido, setor, situacao from integrante where id = ${integrante_id}`
  if (!i || i.situacao !== 'ativo') throw new ErroPermissao('integrante', 'Integrante pausado ou inexistente.')
  const dono = dono_id ? await carregarPerfil(tx, dono_id) : undefined
  if (dono_id && !dono) throw new ErroPermissao('integrante', 'A pessoa por trás do integrante não está ativa.')
  return { escritorio_id, origem, ator: { tipo: 'integrante', id: i.id, nome: i.nome_exibido ?? i.setor, dono: dono ?? undefined } }
}

export async function integranteDoSetor(tx: Tx, setor: string): Promise<string | null> {
  const [i] = await tx`select id from integrante where setor = ${setor} and tipo = 'padrao_setor' and situacao = 'ativo' order by criado_em limit 1`
  return i?.id ?? null
}

/** Erros tipados e acionáveis (AGENTICO 5): o mesmo código chega à tela, ao integrante e ao MCP. */
export class ErroHeild extends Error {
  readonly codigo: string
  readonly campo: string | null
  readonly acao_sugerida: unknown
  constructor(codigo: string, mensagem: string, campo: string | null = null, acao_sugerida: unknown = null) {
    super(mensagem)
    this.codigo = codigo
    this.campo = campo
    this.acao_sugerida = acao_sugerida
  }
}
export class ErroPermissao extends ErroHeild {
  constructor(ferramenta: string, motivo: string) {
    super('NEGADO', motivo, null, null)
    this.ferramenta = ferramenta
  }
  readonly ferramenta: string
}
/** Falha de regra: não se repete (retentativa não muda o resultado). */
export class ErroRegra extends ErroHeild {}
export class ErroEntrada extends ErroHeild {
  readonly erros: { campo: string; mensagem: string }[]
  constructor(erros: { campo: string; mensagem: string }[]) {
    super('ENTRADA_INVALIDA', erros.map((e) => `${e.campo}: ${e.mensagem}`).join('; '), erros[0]?.campo ?? null)
    this.erros = erros
  }
}
/** Falha passageira (conector fora, outra execução com o efeito em voo): o pg-boss tenta de novo. */
export class ErroPassageiro extends Error {}

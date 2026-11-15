import { comEscritorio, type ContextoExec, type Motor, type Sql } from '@heild/processos'
import { pacoteDoProcedimento } from './integrantes.ts'
import { resposta, type RespostaPadrao } from './resposta.ts'

/**
 * A resposta do integrante para uma execução, no formato padrão (decisão 4). É montada pelo
 * sistema a partir do estado da execução no banco (nunca de um transcript) e do formato fixo do
 * processo (`apresentar`). Nenhum modelo escreve aqui: o Assistente encaminha este objeto como veio.
 */
export async function responderExecucao(sql: Sql, motor: Motor, ctx: ContextoExec, execucao_id: string, pedido_id: string | null = null): Promise<RespostaPadrao> {
  // `obter` autoriza a leitura pela mesma `autorizar` (setor e carteira do procedimento).
  const ex = await motor.obter(ctx, execucao_id)
  const procedimento_id = ex.procedimento.split('@')[0]!
  const achado = pacoteDoProcedimento(procedimento_id)
  const de = achado
    ? { tipo: 'integrante' as const, id: achado.integrante.id, setor: achado.integrante.setor, nome: achado.integrante.nome }
    : { tipo: 'integrante' as const, id: 'i-desconhecido', setor: String(ex.setor ?? ''), nome: 'Integrante' }
  const extra = await comEscritorio(sql, ctx.escritorio_id, async (tx) => {
    const chamadas = await tx`select classe, centavos from chamada_modelo where execucao_id = ${execucao_id}`
    const [op] = await tx`select saida from passo_execucao where execucao_id = ${execucao_id} and tipo = 'operario' and estado = 'concluido' and (saida ? 'confianca' or saida ? 'pulado') and nome <> 'revisar' order by ordem desc, tentativa desc limit 1`
    const [cartao] = ex.cartao_id ? await tx`select id, tipo, resumo_humano, expira_em, extras from cartao_aprovacao where id = ${ex.cartao_id}` : []
    return { chamadas, op: op?.saida as { confianca?: number; origem?: string; pulado?: boolean } | undefined, cartao }
  })
  const custo = { centavos: Math.round(extra.chamadas.reduce((a, c) => a + Number(c.centavos), 0) * 1_000_000) / 1_000_000, chamadas: extra.chamadas.length }
  // Escalada é ir ao escritor; o revisor de risco é um passo do procedimento, não escalada.
  const escalou = extra.chamadas.some((c) => c.classe === 'escritor')
  const confianca = extra.op && !extra.op.pulado && extra.op.origem !== 'pessoa' && typeof extra.op.confianca === 'number' ? extra.op.confianca : null
  const origem = { procedimento: ex.procedimento, execucao_id, pedido_id, posicao_na_fila: ex.posicao_na_fila ?? null }
  const nome = achado?.pacote.procedimento.nome ?? procedimento_id
  const base = { de, origem, custo, confianca, escalou }
  const erro = (ex.erro ?? null) as { codigo?: string; mensagem?: string } | null

  switch (ex.estado) {
    case 'concluida': {
      const a = achado ? achado.pacote.apresentar(ex.saida as Record<string, unknown>) : { titulo: `${nome} concluído`, texto: `${nome} concluído.` }
      return resposta({ ...base, tipo: 'concluido', titulo: a.titulo, texto: a.texto, dados: a.dados ?? {} })
    }
    case 'aguardando_cartao':
    case 'parcial': {
      const c = extra.cartao
      const acao = c ? { cartao_id: c.id as string, tipo: c.tipo as string, resumo_humano: String(c.resumo_humano ?? ''), expira_em: c.expira_em ? new Date(c.expira_em).toISOString() : null } : null
      const cartoes = ((c?.extras as { cartoes?: unknown[] } | null)?.cartoes ?? []) as RespostaPadrao['cartoes']
      if (c?.tipo === 'nao_consegui') return resposta({ ...base, tipo: 'nao_consegui', titulo: `${nome}: falta uma decisão`, resumo: acao?.resumo_humano, acao, cartoes })
      const titulo = c?.tipo === 'escolha_responsavel' ? 'Para quem quer rotear esta atividade?' : c?.tipo === 'orcamento' ? `${nome}: parou por orçamento` : `${nome}: pronto para aprovar`
      return resposta({ ...base, tipo: 'aguardando_aprovacao', titulo, resumo: acao?.resumo_humano, acao, cartoes })
    }
    case 'pendente':
      return resposta({ ...base, tipo: 'na_fila', titulo: `${nome}: na fila` })
    case 'falhou':
      return resposta({ ...base, tipo: 'falhou', titulo: `${nome} parou`, motivo: erro?.mensagem, dados: { codigo: erro?.codigo ?? null } })
    case 'cancelada':
      return resposta({ ...base, tipo: 'cancelado', titulo: `${nome} encerrado`, motivo: erro?.mensagem, dados: { codigo: erro?.codigo ?? null } })
    default:
      return resposta({ ...base, tipo: 'em_execucao', titulo: `${nome}: em andamento` })
  }
}

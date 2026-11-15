import { ErroAprovacao, ferramentaTipada, nomeDoAtor, type ComandoValidado, type Registro } from '@heild/dominio'
import { carregarPerfil, contextoDoIntegrante, type Sessao } from '../auth/sessao.ts'
import { invalidarEscritorio, TABELAS_DO_PERFIL } from '../auth/cache-perfil.ts'
import { noEscritorio, paraJson, type Sql, type Tx } from '../banco/pg.ts'
import { BancoServidor } from './banco-servidor.ts'
import { erroDeEntrada, ErroApi } from './erro.ts'
import { aplicar, hashDoComando, pedirAprovacao, resumirRetorno, rodar, traduzir, type Aplicado, type Pedido, type Resultado } from './executor.ts'

/**
 * `aprovacao.decidir` para os cartões do executor (encaixe 4 da B1; decisão do Enzo de 15/11/2026).
 *
 * O cartão nasce quando um integrante pede algo que exige aprovação: ele guarda o comando exato,
 * o hash dele, a entrada da ferramenta tipada e as versões das linhas que o pedido leu. Decidir:
 *
 *  - só uma pessoa, e só quem está em `pode_aprovar`;
 *  - recusar grava a decisão e o evento, sem executar nada;
 *  - aprovar confere o hash e executa EXATAMENTE o comando guardado, com o integrante como ator
 *    (nunca passa do que o dono pode, R4), uma vez só: a linha do cartão fica travada na
 *    transação, e o segundo clique recebe a mesma resposta guardada, sem executar de novo;
 *  - `argumentos_editados` (adendo das Fundações 6.4): a pessoa altera campos da entrada antes de
 *    aprovar; a entrada nova passa pelo esquema da ferramenta, o cartão guarda o que mudou, fica
 *    `editado_e_aprovado`, e o evento da decisão registra a diferença;
 *  - se alguma linha lida mudou desde o cartão, não executa: cancela este cartão, pede de novo como
 *    o integrante (o que gera um cartão novo, com o estado de agora) e responde 409 com o novo.
 *
 * Os eventos do que foi executado e o da decisão levam `aprovacao_id` (AGENTICO 11, correlação).
 */

export interface DecisaoExecutor {
  cartao_id: string
  decisao: 'aprovado' | 'recusado' | 'editado_e_aprovado'
  comentario?: string
  argumentos_editados?: Record<string, unknown>
}

interface ArgumentosDoCartao {
  rotulo: string
  comando: ComandoValidado
  confiavel?: boolean
  entrada?: Record<string, unknown>
  texto?: string
  versoes?: Record<string, Record<string, number>>
}

/** O cartão é do executor (e não de execução da B2 nem de memória do setor)? */
export function cartaoDoExecutor(c: { execucao_id?: unknown; tipo?: unknown; argumentos_hash?: unknown; argumentos?: unknown }): boolean {
  const a = c.argumentos as Partial<ArgumentosDoCartao> | null
  return !c.execucao_id && c.tipo !== 'memoria' && typeof c.argumentos_hash === 'string' && !!a?.comando && typeof a.rotulo === 'string'
}

export async function decidirCartaoDoExecutor(sql: Sql, s: Sessao, d: DecisaoExecutor, chave: string | null): Promise<Resultado> {
  const esc = s.claims.escritorio_id
  try {
    if (!chave) throw new ErroApi('FALTA_CHAVE_IDEMPOTENCIA', { campo: 'Idempotency-Key' })
    const r = await noEscritorio(sql, { sub: s.claims.sub, escritorio_id: esc }, (tx) => decidir(tx, s, d))
    const linhas = (r.corpo as { linhas?: Record<string, unknown> } | null)?.linhas
    if (linhas && Object.keys(linhas).some((t) => TABELAS_DO_PERFIL.has(t))) invalidarEscritorio(esc)
    return r
  } catch (e) {
    const erro = traduzir(e)
    if (erro.status === 500) console.error('[heild] erro interno ao decidir cartão:', e)
    return { status: erro.status, corpo: erro.corpo() }
  }
}

async function decidir(tx: Tx, s: Sessao, d: DecisaoExecutor): Promise<Resultado> {
  const ator = s.ctx.ator
  if (ator.tipo !== 'pessoa') throw new ErroApi('SO_PESSOA_DECIDE')
  const eu = ator.perfil.usuario_id
  const [bruto] = await tx`select * from cartao_aprovacao where id = ${d.cartao_id} for update`
  if (!bruto) throw new ErroApi('NAO_ENCONTRADO', { campo: 'cartao_id', mensagem: `Não encontrei o cartão ${d.cartao_id}.` })
  const c = paraJson(bruto) as unknown as Registro & Record<string, unknown>
  const editados = d.argumentos_editados && Object.keys(d.argumentos_editados).length ? d.argumentos_editados : null
  const aprovar = d.decisao !== 'recusado'

  if (c.status !== 'pendente') {
    // Duplo clique (ou a mesma decisão repetida depois de uma queda de rede): a mesma resposta, sem executar de novo.
    const mesmaDecisao = aprovar ? c.status === 'aprovado' || c.status === 'editado_e_aprovado' : c.status === 'recusado'
    if (c.decidido_por === eu && mesmaDecisao && c.resposta) return { status: 200, corpo: c.resposta, repetida: true }
    throw new ErroApi('JA_DECIDIDO', { mensagem: `Este cartão já está ${String(c.status).replaceAll('_', ' ')}.` })
  }
  if (!(c.pode_aprovar as string[]).includes(eu)) throw new ErroApi('NEGADO', { mensagem: 'Este cartão não é para você decidir: só quem está em "pode aprovar".' })
  if (c.expira_em && new Date(String(c.expira_em)) < new Date()) {
    await tx`update cartao_aprovacao set status = 'expirado' where id = ${c.id}`
    return erroComCommit(new ErroApi('REGRA_DE_NEGOCIO', { mensagem: 'Este cartão expirou: o integrante precisa pedir de novo.' }))
  }

  const a = c.argumentos as unknown as ArgumentosDoCartao
  if (hashDoComando(a.rotulo, a.comando) !== c.argumentos_hash) throw new ErroApi('REGRA_DE_NEGOCIO', { mensagem: 'O comando guardado no cartão não confere com o hash: não executo.' })

  // Quem pediu: o integrante, com o dono de agora (as permissões são conferidas de novo ao executar).
  const dono = c.usuario_dono_id ? await carregarPerfil(tx, String(c.usuario_dono_id)) : null
  const ctxIntegrante = c.pedido_por_tipo === 'integrante' && c.pedido_por_id && dono ? await contextoDoIntegrante(tx, String(c.pedido_por_id), dono) : null
  if (!ctxIntegrante || !dono) throw new ErroApi('REGRA_DE_NEGOCIO', { mensagem: 'O integrante que pediu (ou o dono dele) não está mais ativo: o cartão não executa.' })
  const pedidoDoIntegrante = (comando: ComandoValidado, aprovadas: string[]): Pedido => ({
    sessao: { claims: s.claims, perfil: dono, ctx: ctxIntegrante },
    comando,
    chave: null,
    validarApenas: false,
    rotulo: a.rotulo,
    confiavel: a.confiavel ?? false,
    entradaOriginal: a.entrada ?? comando,
    texto: a.texto,
    aprovadas,
    aprovacaoId: aprovadas.length ? String(c.id) : undefined,
  })

  // O estado mudou desde o cartão? Então o que a pessoa aprovaria não é mais o que o integrante viu.
  const mudou = await linhasQueMudaram(tx, a.versoes ?? {})
  if (aprovar && mudou.length) {
    await tx`update cartao_aprovacao set status = 'cancelado', comentario = ${`Cancelado ao aprovar: ${mudou.join(', ')} mudou desde o pedido.`} where id = ${c.id}`
    const novo = await pedirDeNovo(tx, pedidoDoIntegrante(a.comando, []))
    if (novo.status !== 202) return novo
    const cartaoNovo = (novo.corpo as { cartao_id: string }).cartao_id
    return erroComCommit(
      new ErroApi('VERSAO_DESATUALIZADA', {
        campo: 'cartao_id',
        mensagem: `O registro mudou desde o pedido (${mudou.join(', ')}). Este cartão foi cancelado e o integrante pediu de novo com o estado de agora: decida o cartão novo.`,
        acao_sugerida: { ferramenta: 'aprovacao.decidir', entrada: { cartao_id: cartaoNovo, decisao: 'aprovado' } },
        detalhes: { cartao_novo: cartaoNovo, linhas_que_mudaram: mudou },
      }),
    )
  }

  // Edição antes de aprovar. Pedido de ferramenta tipada: a entrada nova passa pelo esquema dela.
  // Pedido de operação: só os campos que já existem no objeto principal do comando (o que o cartão
  // mostra), e a operação limpa e valida os argumentos ao rodar, como em qualquer pedido.
  let comando = a.comando
  let diferenca: Record<string, { de: unknown; para: unknown }> | null = null
  if (editados) {
    const f = a.entrada ? ferramentaTipada(a.rotulo) : undefined
    const original = f ? a.entrada! : a.comando.tipo === 'operacao' && objetoSimples(a.comando.argumentos[0]) ? (a.comando.argumentos[0] as Record<string, unknown>) : null
    if (!original || (f && f.tipo === 'leitura')) throw new ErroApi('ENTRADA_INVALIDA', { campo: 'argumentos_editados', mensagem: 'Este cartão não aceita edição: o pedido não tem campos editáveis.' })
    const desconhecido = !f && Object.keys(editados).find((k) => !(k in original))
    if (desconhecido) throw new ErroApi('ENTRADA_INVALIDA', { campo: `argumentos_editados.${desconhecido}`, mensagem: `O pedido não tem o campo ${desconhecido}: só se editam os campos que o integrante mandou.` })
    diferenca = {}
    for (const [k, v] of Object.entries(editados)) if (JSON.stringify(original[k]) !== JSON.stringify(v)) diferenca[k] = { de: original[k] ?? null, para: v }
    if (!Object.keys(diferenca).length) diferenca = null
    if (f) {
      const nova = f.entrada.safeParse({ ...original, ...editados })
      if (!nova.success) throw erroDeEntrada(nova.error.issues, 'argumentos_editados')
      const ch = f.chamada(nova.data as never, { texto: a.texto })
      comando = { tipo: 'operacao', operacao: ch.operacao, argumentos: ch.argumentos, ids: a.comando.tipo === 'operacao' ? a.comando.ids : [] }
    } else if (a.comando.tipo === 'operacao') {
      comando = { ...a.comando, argumentos: [{ ...original, ...editados }, ...a.comando.argumentos.slice(1)] }
    }
  }
  const statusFinal = !aprovar ? 'recusado' : diferenca ? 'editado_e_aprovado' : 'aprovado'

  // 1. Aprovar: executa o comando guardado como o integrante, com a ferramenta do cartão liberada.
  let executado: { aplicado: Aplicado; retorno: unknown } | null = null
  if (aprovar) {
    const p = pedidoDoIntegrante(comando, [String(c.ferramenta)])
    const bs = new BancoServidor(s.claims.escritorio_id)
    let retorno: unknown
    try {
      retorno = await rodar(tx, bs, p)
    } catch (e) {
      // Outra ferramenta do mesmo comando pede aprovação própria: não é o que este cartão liberou.
      if (e instanceof ErroAprovacao) throw new ErroApi('EXIGE_APROVACAO', { mensagem: `O comando também usa ${e.ferramenta}, que pede outra aprovação.` })
      throw e
    }
    executado = { aplicado: await aplicar(tx, bs, p), retorno }
  }

  // 2. A decisão, como a pessoa: a mesma operação de sempre (autor, data, evento na cadeia).
  const pDecisao: Pedido = {
    sessao: s,
    comando: { tipo: 'operacao', operacao: 'cartoes.decidir', argumentos: [c.id, statusFinal, d.comentario ? { comentario: d.comentario } : {}], ids: [] },
    chave: null,
    validarApenas: false,
    rotulo: 'aprovacao.decidir',
    confiavel: true,
    entradaOriginal: d,
    aprovacaoId: String(c.id),
  }
  const bsDecisao = new BancoServidor(s.claims.escritorio_id)
  await rodar(tx, bsDecisao, pDecisao)
  for (const e of bsDecisao.escritas) {
    if (e.tabela !== 'evento' || !e.linha) continue
    Object.assign(e.linha, {
      // O mesmo nome do evento de decisão do motor: é o que o gatilho 18 da B3 escuta.
      nome: 'aprovacao.decidir',
      resultado: aprovar ? 'aprovado' : 'recusado',
      ...(diferenca ? { texto: `${nomeDoAtor(ator)} aprovou com alterações (${Object.keys(diferenca).join(', ')}): ${String(c.resumo_humano)}`, argumentos_resumo: { diferenca } } : {}),
    })
  }
  const decisao = await aplicar(tx, bsDecisao, pDecisao)

  const juntas = juntar(executado?.aplicado, decisao)
  const corpo = {
    resultado: 'ok' as const,
    dados: { cartao_id: c.id, status: statusFinal, executado: executado ? resumirRetorno(executado.retorno) : null, ...(diferenca ? { diferenca } : {}) },
    ...juntas,
    evento_id: juntas.eventos.at(-1) ?? null,
    cartoes: [],
  }
  await tx`update cartao_aprovacao set argumentos_editados = ${diferenca ? tx.json(editados as never) : null}, resposta = ${tx.json(corpo as never)} where id = ${c.id}`
  return { status: 200, corpo }
}

const objetoSimples = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v)

/** Linhas lidas pelo pedido que mudaram (ou sumiram) desde o cartão: "tabela id". */
async function linhasQueMudaram(tx: Tx, versoes: Record<string, Record<string, number>>): Promise<string[]> {
  const mudou: string[] = []
  for (const [tabela, ids] of Object.entries(versoes)) {
    const lista = Object.keys(ids)
    if (!lista.length) continue
    const agora = await tx`select id, versao_linha from ${tx(tabela)} where id = any(${lista})`
    const atual = new Map(agora.map((l) => [String(l.id), Number(l.versao_linha)]))
    for (const id of lista) if (atual.get(id) !== ids[id]) mudou.push(`${tabela} ${id}`)
  }
  return mudou
}

/** Pede de novo como o integrante (sem nada liberado): o normal é virar um cartão novo (202). */
async function pedirDeNovo(tx: Tx, p: Pedido): Promise<Resultado> {
  const bs = new BancoServidor(p.sessao.claims.escritorio_id)
  try {
    await rodar(tx, bs, p)
  } catch (e) {
    if (e instanceof ErroAprovacao) return pedirAprovacao(tx, p, e, bs)
    return erroComCommit(traduzir(e))
  }
  // Não pediu aprovação desta vez (a regra mudou): não executa sem a pessoa ver de novo.
  return erroComCommit(new ErroApi('REGRA_DE_NEGOCIO', { mensagem: 'O registro mudou e o pedido não precisa mais de aprovação: peça de novo ao integrante.' }))
}

/** Erro que não desfaz a transação (o cartão cancelado e o novo ficam gravados). */
function erroComCommit(e: ErroApi): Resultado {
  return { status: e.status, corpo: e.corpo() }
}

function juntar(...partes: (Aplicado | undefined)[]): Aplicado {
  const r: Aplicado = { linhas: {}, removidas: {}, eventos: [], versao: null }
  for (const p of partes) {
    if (!p) continue
    for (const [t, ls] of Object.entries(p.linhas)) r.linhas[t] = [...(r.linhas[t] ?? []).filter((x) => !ls.some((y) => y.id === x.id)), ...ls]
    for (const [t, ids] of Object.entries(p.removidas)) r.removidas[t] = [...(r.removidas[t] ?? []), ...ids]
    r.eventos.push(...p.eventos)
    if (p.versao !== null) r.versao = Math.max(r.versao ?? 0, p.versao)
  }
  return r
}

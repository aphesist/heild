import {
  canonizar,
  codigoDaNegacao,
  codigoDaRegra,
  comBanco,
  comColetorDeJobs,
  comoAtor,
  definirGeradorId,
  definirModoAprovacao,
  ErroAprovacao,
  ErroPermissao,
  ErroRegra,
  nomeDoAtor,
  novoIdPadrao,
  registrarEvento,
  repos,
  sha256Hex,
  type ComandoValidado,
  type NomeTabela,
  type Registro,
  type RespostaOk,
  type RespostaValidado,
} from '@heild/dominio'
import type { Sessao } from '../auth/sessao.ts'
import { noEscritorio, paraJson, type Sql, type Tx } from '../banco/pg.ts'
import { BancoServidor, PrecisaCarregar } from './banco-servidor.ts'
import { gravarEventos } from './cadeia.ts'
import { colunasDe, prepararLinha } from './colunas.ts'
import { ErroApi } from './erro.ts'
import { despacharEventos, enfileirarNaTransacao } from './jobs.ts'
import { aplicarLinhas } from './linhas.ts'
import { limparArgumentos, operacoes } from './operacoes.ts'

/**
 * O executor (AGENTICO 11): a única porta de escrita. A tela (adaptador `api`), as
 * ferramentas tipadas e, depois, o MCP e o motor de procedimentos (B2) passam por aqui.
 *
 *   1. entrada já validada pelo Zod (rota);
 *   2. idempotência: (escritório, chave) com o hash dos argumentos, na mesma transação;
 *   3. autorizar: dentro do repositório, com a MESMA função do frontend;
 *   4. aprovação: decisão com `aprovacao: true` vira cartão e 202;
 *   5. `validar_apenas`: para aqui, sem efeito e sem evento;
 *   6. transação: efeito + evento com cadeia de hash + resposta de idempotência + commit;
 *   7. negado e erro de regra viram evento numa transação própria.
 */

export interface Pedido {
  sessao: Sessao
  comando: ComandoValidado
  chave: string | null
  validarApenas: boolean
  /** Nome que vai na idempotência e nos eventos de falha: a ferramenta tipada ou a operação. */
  rotulo: string
  /** Argumentos montados pelo próprio servidor (ferramenta tipada): não passam pela limpeza. */
  confiavel: boolean
  /** O que entra no hash da idempotência (a entrada original da ferramenta ou o comando). */
  entradaOriginal: unknown
}

export interface Resultado {
  status: number
  corpo: unknown
  repetida?: boolean
}

const MAX_TENTATIVAS = 60
const SO_INSERCAO = new Set(['evento', 'registro_entrega'])

export async function executar(sql: Sql, p: Pedido): Promise<Resultado> {
  const esc = p.sessao.claims.escritorio_id
  const claims = { sub: p.sessao.claims.sub, escritorio_id: esc }
  try {
    if (!p.validarApenas && !p.chave) throw new ErroApi('FALTA_CHAVE_IDEMPOTENCIA', { campo: 'Idempotency-Key' })
    const hashArgumentos = sha256Hex(canonizar({ rotulo: p.rotulo, entrada: p.entradaOriginal }))
    return await noEscritorio(sql, claims, async (tx) => {
      if (p.chave && !p.validarApenas) {
        const novo = await tx`insert into idempotencia (escritorio_id, chave, ferramenta, hash_argumentos, usuario_id)
          values (${esc}, ${p.chave}, ${p.rotulo}, ${hashArgumentos}, ${p.sessao.claims.sub}) on conflict do nothing returning chave`
        if (!novo.length) {
          // Já existe: a outra transação terminou (o insert esperou por ela). Mesmo pedido devolve a mesma resposta.
          const [antes] = await tx`select ferramenta, hash_argumentos, status_http, resposta from idempotencia where escritorio_id = ${esc} and chave = ${p.chave}`
          if (antes.hash_argumentos !== hashArgumentos) throw new ErroApi('CHAVE_REUSADA', { campo: 'Idempotency-Key', detalhes: { ferramenta_original: antes.ferramenta } })
          return { status: Number(antes.status_http), corpo: antes.resposta, repetida: true }
        }
      }
      const bs = new BancoServidor(esc)
      let retorno: unknown
      try {
        retorno = await rodar(tx, bs, p)
      } catch (e) {
        if (e instanceof ErroAprovacao && !p.validarApenas) return pedirAprovacao(tx, p, e)
        throw e
      }
      if (p.validarApenas) {
        const corpo: RespostaValidado = { resultado: 'validado', erros: [], previa: contarPorTabela(bs) }
        return { status: 200, corpo }
      }
      const aplicado = await aplicar(tx, bs, p)
      const corpo: RespostaOk = {
        resultado: 'ok',
        dados: resumirRetorno(retorno),
        linhas: aplicado.linhas,
        removidas: aplicado.removidas,
        eventos: aplicado.eventos,
        evento_id: aplicado.eventos.at(-1) ?? null,
        versao: aplicado.versao,
        cartoes: [],
      }
      if (p.chave) await tx`update idempotencia set status_http = 200, resposta = ${tx.json(corpo as never)} where escritorio_id = ${esc} and chave = ${p.chave}`
      return { status: 200, corpo }
    })
  } catch (e) {
    const erro = traduzir(e)
    if (p.validarApenas && erro.status !== 500 && erro.status !== 401) {
      const corpo: RespostaValidado = { resultado: 'validado', erros: [{ codigo: erro.codigo, campo: erro.campo, mensagem: erro.message }], previa: {} }
      return { status: 200, corpo }
    }
    let eventoId: string | undefined
    // Log estruturado da recusa (código, operação, campo; sem dado pessoal), para diagnóstico.
    if (erro.status >= 400 && erro.status !== 401) console.warn(JSON.stringify({ nivel: 'recusa', status: erro.status, codigo: erro.codigo, rotulo: p.rotulo, ferramenta: erro.ferramenta ?? null, campo: erro.campo, tabelas: p.comando.tipo === 'linhas' ? [...new Set([...p.comando.gravar.map((g) => g.tabela), ...p.comando.remover.map((r) => r.tabela)])] : undefined, ator: p.sessao.ctx.ator.tipo }))
    if (erro.status === 403 || erro.status === 422) eventoId = await registrarFalha(sql, p, erro).catch((x) => (console.error('[heild] evento de falha não gravou:', x), undefined))
    if (erro.status === 500) console.error('[heild] erro interno:', e)
    return { status: erro.status, corpo: erro.corpo(eventoId) }
  }
}

/** Roda a operação no banco do pedido; carrega o que ela pedir e roda de novo (sem efeito até o fim). */
async function rodar(tx: Tx, bs: BancoServidor, p: Pedido): Promise<unknown> {
  for (let i = 0; i < MAX_TENTATIVAS; i++) {
    bs.recomecar()
    try {
      return comColetorDeJobs((j) => bs.jobs.push(j), () => executarSincrono(bs, p))
    } catch (e) {
      if (!(e instanceof PrecisaCarregar)) throw e
      await carregar(tx, bs, e)
    }
  }
  throw new ErroApi('ERRO_INTERNO', { mensagem: 'A operação pediu dados demais para carregar.' })
}

/**
 * A parte síncrona: os repositórios do app rodam aqui como rodam no navegador. Tudo o
 * que é global (banco, ator, gerador de id, modo de aprovação) é posto e tirado dentro
 * deste bloco síncrono: pedidos concorrentes não se misturam (um processo, um laço).
 */
function executarSincrono(bs: BancoServidor, p: Pedido): unknown {
  // Os ids que a tela gerou, na ordem, por prefixo: a linha gravada fica com o id da otimista.
  // Id que já existe não sobrescreve nada: o `criar` do repositório recusa (ID_EM_USO).
  const filas = new Map<string, string[]>()
  if (p.comando.tipo === 'operacao') {
    for (const { p: prefixo, id } of p.comando.ids) {
      if (!id.startsWith(prefixo)) continue
      filas.set(prefixo, [...(filas.get(prefixo) ?? []), id])
    }
  }
  definirGeradorId((prefixo) => {
    return filas.get(prefixo)?.shift() ?? novoIdPadrao(prefixo)
  })
  definirModoAprovacao(true)
  try {
    return comBanco(bs, () =>
      comoAtor(p.sessao.ctx, () => {
        const c = p.comando
        if (c.tipo === 'linhas') return aplicarLinhas(bs, p.sessao.ctx, c)
        const op = operacoes.get(c.operacao)
        if (!op) throw new ErroApi('OPERACAO_DESCONHECIDA', { campo: 'comando.operacao', mensagem: `Não existe a operação ${c.operacao}.` })
        const args = p.confiavel ? c.argumentos : limparArgumentos(op, c.argumentos)
        const fn = (op.repositorio as unknown as Record<string, (...a: unknown[]) => unknown>)[op.metodo]
        return fn.apply(op.repositorio, args)
      }),
    )
  } finally {
    definirGeradorId(null)
    definirModoAprovacao(false)
  }
}

async function carregar(tx: Tx, bs: BancoServidor, e: PrecisaCarregar) {
  const colunas = await colunasDe(tx)
  if (!colunas.has(e.tabela)) throw new ErroApi('TABELA_SEM_REGRA', { campo: e.tabela, mensagem: `A tabela ${e.tabela} não existe no banco.` })
  if (e.id !== undefined) {
    // A linha que a operação vai mexer fica travada até o fim da transação. Tabela só de
    // inserção (sem política de update) não aceita FOR UPDATE sob RLS: lá a leitura é simples.
    const [linha] = SO_INSERCAO.has(e.tabela)
      ? await tx`select * from ${tx(e.tabela)} where id = ${e.id}`
      : await tx`select * from ${tx(e.tabela)} where id = ${e.id} for update`
    bs.carregarLinha(e.tabela, e.id, linha ? (paraJson(linha) as unknown as Registro) : undefined)
  } else {
    const linhas = await tx`select * from ${tx(e.tabela)} order by ordem nulls last, criado_em, id`
    bs.carregarTabela(e.tabela, linhas.map((l) => paraJson(l) as unknown as Registro))
  }
}

interface Aplicado {
  linhas: Record<string, Record<string, unknown>[]>
  removidas: Record<string, string[]>
  eventos: string[]
  versao: number | null
}

/** Grava o que a operação fez, na ordem: linhas (inserir, atualizar com a versão lida, excluir) e depois os eventos na cadeia. */
async function aplicar(tx: Tx, bs: BancoServidor, p: Pedido): Promise<Aplicado> {
  const esc = p.sessao.claims.escritorio_id
  const colunas = await colunasDe(tx)
  // A última escrita de cada (tabela, id) vale; a ordem é a da primeira.
  const finais = new Map<string, { tabela: NomeTabela; id: string; linha: Registro | null }>()
  for (const e of bs.escritas) {
    const k = `${e.tabela}\u0000${e.id}`
    if (finais.has(k)) finais.delete(k)
    finais.set(k, e)
  }
  const r: Aplicado = { linhas: {}, removidas: {}, eventos: [], versao: null }
  const anotar = (t: string, l: Record<string, unknown>) => {
    ;(r.linhas[t] ??= []).push(l)
    const v = Number(l.versao_linha)
    if (Number.isFinite(v)) r.versao = Math.max(r.versao ?? 0, v)
  }
  const eventos: Registro[] = []
  for (const { tabela, id, linha } of finais.values()) {
    const antes = bs.antes(tabela, id)
    if (tabela === 'evento') {
      if (antes) throw new ErroApi('IMUTAVEL', { campo: `evento.${id}`, mensagem: 'O registro de eventos é imutável: correção é um evento novo (5.2).' })
      if (linha) eventos.push(linha)
      continue
    }
    const cols = colunas.get(tabela)
    if (!cols) throw new ErroApi('TABELA_SEM_REGRA', { campo: tabela })
    if (!linha) {
      if (!antes) continue
      const apagadas = await tx`delete from ${tx(tabela)} where escritorio_id = ${esc} and id = ${id} and versao_linha = ${(antes as unknown as { versao_linha: number }).versao_linha} returning id`
      if (!apagadas.length) throw new ErroApi('VERSAO_DESATUALIZADA', { campo: `${tabela}.${id}`, detalhes: { tabela, id } })
      await tx`insert into remocao (escritorio_id, tabela, id) values (${esc}, ${tabela}, ${id})`
      ;(r.removidas[tabela] ??= []).push(id)
      continue
    }
    const pronta = prepararLinha(tx, tabela, linha, cols, esc)
    if (!antes) {
      const [nova] = await tx`insert into ${tx(tabela)} ${tx(pronta.valores, pronta.colunas)} returning *`
      anotar(tabela, paraJson(nova))
    } else {
      const mudou = pronta.colunas.filter((c) => c !== 'id' && c !== 'escritorio_id' && c !== 'criado_em' && canonizar((antes as unknown as Record<string, unknown>)[c] ?? null) !== canonizar((linha as unknown as Record<string, unknown>)[c] ?? null))
      if (!mudou.length) continue
      const [nova] = await tx`update ${tx(tabela)} set ${tx(pronta.valores, mudou)} where escritorio_id = ${esc} and id = ${id} and versao_linha = ${(antes as unknown as { versao_linha: number }).versao_linha} returning *`
      if (!nova) throw new ErroApi('VERSAO_DESATUALIZADA', { campo: `${tabela}.${id}`, detalhes: { tabela, id } })
      anotar(tabela, paraJson(nova))
    }
  }
  // Jobs pedidos pelo efeito: na mesma transação (encaixe da B2; ver jobs.ts).
  await enfileirarNaTransacao(tx, bs.jobs)
  if (eventos.length) {
    const gravados = await gravarEventos(tx, esc, eventos, { sessao_auth_id: p.sessao.claims.sid, idempotencia_chave: p.chave })
    for (const g of gravados) {
      anotar('evento', g)
      r.eventos.push(String(g.id))
    }
    // Os gatilhos da B2 veem também os eventos das telas, na mesma transação.
    await despacharEventos(tx, esc, gravados)
  }
  return r
}

/** Integrante pediu algo irreversível (ou que pede aprovação): vira cartão para o dono decidir (Fundações 3.3, 6.4). */
async function pedirAprovacao(tx: Tx, p: Pedido, e: ErroAprovacao): Promise<Resultado> {
  const esc = p.sessao.claims.escritorio_id
  const ator = p.sessao.ctx.ator
  const dono = ator.tipo === 'integrante' ? (ator.dono?.usuario_id ?? null) : null
  const bs = new BancoServidor(esc)
  const expira = new Date(Date.now() + 48 * 3600_000).toISOString()
  const resumo = `${nomeDoAtor(ator)} quer usar ${e.ferramenta}: ${p.rotulo}`
  let cartao: Registro | undefined
  for (let i = 0; i < MAX_TENTATIVAS && !cartao; i++) {
    bs.recomecar()
    try {
      cartao = comBanco(bs, () =>
        repos.cartoes.criar(
          { ferramenta: e.ferramenta, argumentos: { rotulo: p.rotulo, comando: p.comando, alvo: e.alvo }, resumo_humano: resumo, pedido_por_tipo: 'integrante', pedido_por_id: ator.tipo === 'integrante' ? ator.id : null, usuario_dono_id: dono, pode_aprovar: dono ? [dono] : [], status: 'pendente', expira_em: expira },
          { ctx: p.sessao.ctx, semAutorizar: true, texto: `${nomeDoAtor(ator)} pediu aprovação para ${e.ferramenta}` },
        ),
      )
    } catch (x) {
      if (!(x instanceof PrecisaCarregar)) throw x
      await carregar(tx, bs, x)
    }
  }
  if (!cartao) throw new ErroApi('ERRO_INTERNO')
  // O evento do cartão registra que a ferramenta ficou aguardando aprovação.
  for (const esc2 of bs.escritas) if (esc2.tabela === 'evento' && esc2.linha) Object.assign(esc2.linha, { resultado: 'aguardando_aprovacao', ferramenta: e.ferramenta })
  const aplicado = await aplicar(tx, bs, p)
  const corpo = { resultado: 'aguardando_aprovacao', cartao_id: cartao.id, resumo_humano: resumo, expira_em: expira, linhas: aplicado.linhas, eventos: aplicado.eventos, evento_id: aplicado.eventos.at(-1) ?? null }
  if (p.chave) await tx`update idempotencia set status_http = 202, resposta = ${tx.json(corpo as never)} where escritorio_id = ${esc} and chave = ${p.chave}`
  return { status: 202, corpo }
}

/** Negado e erro de regra também são eventos (AGENTICO 11, "toda chamada vira evento"), numa transação própria. */
async function registrarFalha(sql: Sql, p: Pedido, erro: ErroApi): Promise<string | undefined> {
  const esc = p.sessao.claims.escritorio_id
  return noEscritorio(sql, { sub: p.sessao.claims.sub, escritorio_id: esc }, async (tx) => {
    const bs = new BancoServidor(esc)
    const resultado = erro.negado ? 'negado' : 'erro'
    comBanco(bs, () =>
      bs.transacao((t) =>
        registrarEvento(t, p.sessao.ctx, {
          nome: `${erro.ferramenta ?? p.rotulo}.${resultado}`,
          ferramenta: erro.ferramenta ?? p.rotulo,
          resultado,
          texto: `${nomeDoAtor(p.sessao.ctx.ator)} tentou ${p.rotulo}: ${erro.message}`,
          argumentos_resumo: { codigo: erro.codigo, ...(erro.campo ? { campo: erro.campo } : {}) },
          visivel_na_linha_do_tempo: false,
        }),
      ),
    )
    const eventos = bs.escritas.filter((x) => x.tabela === 'evento' && x.linha).map((x) => x.linha!) as Registro[]
    const [g] = await gravarEventos(tx, esc, eventos, { sessao_auth_id: p.sessao.claims.sid, idempotencia_chave: null })
    return g ? String(g.id) : undefined
  })
}

function contarPorTabela(bs: BancoServidor): Record<string, number> {
  const r: Record<string, number> = {}
  for (const e of bs.escritas) r[e.tabela] = (r[e.tabela] ?? 0) + 1
  return r
}

function resumirRetorno(v: unknown): unknown {
  if (v === undefined || v === null) return null
  if (typeof v === 'object' && !Array.isArray(v) && 'id' in (v as object)) return { id: (v as { id: unknown }).id }
  const texto = JSON.stringify(v)
  return texto && texto.length <= 2000 ? v : null
}

/** Tudo vira ErroApi com código estável. */
export function traduzir(e: unknown): ErroApi {
  if (e instanceof ErroApi) return e
  if (e instanceof ErroPermissao) return new ErroApi(codigoDaNegacao(e.message), { mensagem: e.message, ferramenta: e.ferramenta })
  if (e instanceof ErroRegra) return new ErroApi(codigoDaRegra(e.message, e.codigo), { mensagem: e.message })
  const pg = e as { code?: string; message?: string; constraint_name?: string; column_name?: string; table_name?: string }
  if (pg && typeof pg.code === 'string') {
    const onde = pg.table_name ? `${pg.table_name}${pg.column_name ? `.${pg.column_name}` : pg.constraint_name ? `.${pg.constraint_name}` : ''}` : (pg.constraint_name ?? null)
    if (pg.code === '23505') return new ErroApi(pg.constraint_name?.endsWith('_pkey') ? 'ID_EM_USO' : 'RESTRICAO_DO_BANCO', { campo: onde, mensagem: `Já existe um registro com esse valor (${pg.constraint_name}).` })
    if (pg.code === '23502') return new ErroApi('CAMPO_OBRIGATORIO', { campo: onde, mensagem: `Falta o campo ${pg.column_name}.` })
    if (pg.code === '23514' || pg.code === '23503') return new ErroApi('RESTRICAO_DO_BANCO', { campo: onde, mensagem: `O banco recusou o valor (${pg.constraint_name}).` })
    if (pg.code === '22P02' || pg.code === '22007' || pg.code === '22008' || pg.code === '22023' || pg.code === '42804') return new ErroApi('ENTRADA_INVALIDA', { campo: onde, mensagem: `Valor em formato errado: ${pg.message}` })
    if (pg.code === '42501') {
      const m = pg.message ?? ''
      if (m.includes('row-level security')) return new ErroApi('FORA_DO_ESCRITORIO', { mensagem: 'O registro não é do escritório da sessão.' })
      if (m.includes('DELETE')) return new ErroApi('EXCLUSAO_PROIBIDA', { mensagem: m })
      return new ErroApi(m.includes('decidido') ? 'JA_DECIDIDO' : 'IMUTAVEL', { mensagem: m })
    }
  }
  return new ErroApi('ERRO_INTERNO')
}

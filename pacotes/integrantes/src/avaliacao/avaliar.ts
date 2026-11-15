import { randomUUID } from 'node:crypto'
import { comEscritorio, type ContextoExec, type Motor, type Sql, type Tx } from '@heild/processos'
import type { ExecucaoParaDecisao } from '../contrato.ts'
import { pacoteDoProcedimento } from '../integrantes.ts'

/**
 * Avaliação automatizada (decisão 8): roda casos com resposta conhecida em MODO SOMBRA (sem efeito,
 * sem cartão, sem conector) e mede acerto, erro crítico, custo e latência por setor e por papel.
 * Nada depende de alguém conferir à mão: a pessoa só vê o relatório.
 */

export interface CasoGabarito {
  id: string
  setor: string
  procedimento: string
  /** O documento do caso (o mesmo formato que o worker de documentos grava). */
  /** Os metadados podem depender do cliente do ambiente (ex.: a ECD leva o CNPJ dele). */
  documento: { tipo: string; metadados: Record<string, unknown> | ((a: { cnpj: string }) => Record<string, unknown>) }
  /**
   * Casos cuja entrada não é um documento (ex.: a conversa do CRM): grava o que precisa e devolve a
   * entrada do procedimento. Sem isto, o caso grava o documento e a entrada é cliente e documento.
   */
  preparar?: (tx: Tx, a: { escritorio_id: string; cliente_id: string }) => Promise<Record<string, unknown>>
  /** Entrada extra além de cliente e documento (ex.: exercício da ECD). */
  entrada_extra?: Record<string, unknown>
  /**
   * A decisão certa, no formato do `decisao` do pacote; `cartao` quando o certo é NÃO decidir.
   * Começando por `contem:`, basta a decisão conter os itens (ex.: as contas que a ECD deve apontar).
   */
  esperado: string
  /** O que a pessoa fez nesse caso (histórico), para a margem de −3 pontos; opcional. */
  pessoa?: string
}

export type Resultado = 'acerto' | 'erro_critico' | 'cartao_desnecessario' | 'falha'

export interface LinhaAvaliacao {
  caso: string
  setor: string
  procedimento: string
  rodada: number
  esperado: string
  obtido: string
  resultado: Resultado
  pessoa: string | null
  resultado_pessoa: Resultado | null
  execucao_id: string
  estado: string
  centavos: number
  latencia_ms: number
  chamadas: { classe: string; modelo: string; centavos: number; latencia_ms: number; contrato: string }[]
}

const FALHA = /^(falhou|cancelada|parcial|pendente|executando|aguardando_operario|aguardando_externo):/

/**
 * Classifica uma decisão contra o esperado (critério do dono: o erro custa mais que tudo).
 * Decidir errado, inclusive decidir quando o certo era parar no cartão, é erro crítico; ir ao
 * cartão num caso decidível é perda de produtividade; execução que não chegou ao fim é falha.
 */
export function classificar(esperado: string, obtido: string): Resultado {
  if (FALHA.test(obtido)) return 'falha'
  if (esperado.startsWith('contem:')) {
    if (obtido === 'cartao') return 'cartao_desnecessario'
    const tem = new Set(obtido.split(','))
    return esperado.slice(7).split(',').every((i) => tem.has(i)) ? 'acerto' : 'erro_critico'
  }
  if (obtido === esperado) return 'acerto'
  if (obtido === 'cartao') return 'cartao_desnecessario'
  return 'erro_critico'
}

const TERMINAL = new Set(['concluida', 'falhou', 'cancelada', 'parcial', 'aguardando_cartao'])

export interface AmbienteAvaliacao {
  sql: Sql
  motor: Motor
  escritorio_id: string
  cliente_id: string
  /** CNPJ do cliente (documentos que conferem o CNPJ, como a ECD). */
  cnpj: string
  /** Quem "pede" na avaliação (uma pessoa com todos os setores). */
  ctx: ContextoExec
}

async function lerExecucao(sql: Sql, esc: string, id: string): Promise<ExecucaoParaDecisao & { criado_em: Date; concluida_em: Date | null }> {
  return comEscritorio(sql, esc, async (tx) => {
    const [ex] = await tx`select estado, saida, erro, criado_em, concluida_em from execucao where id = ${id}`
    const passos = await tx`select distinct on (nome) nome, saida from passo_execucao where execucao_id = ${id} and estado = 'concluido' order by nome, tentativa desc`
    return { estado: ex!.estado, saida: ex!.saida, erro: ex!.erro, passos: Object.fromEntries(passos.map((p) => [p.nome, p.saida])), criado_em: ex!.criado_em, concluida_em: ex!.concluida_em }
  })
}

/** Grava o documento do caso no escritório de avaliação. */
async function gravarDocumento(sql: Sql, a: AmbienteAvaliacao, c: CasoGabarito) {
  const id = `d-av-${randomUUID().slice(0, 12)}`
  await comEscritorio(sql, a.escritorio_id, (tx) =>
    tx`insert into documento (escritorio_id, id, cliente_id, tipo, nome_arquivo, mime, hash_sha256, origem, backend_id, metadados)
       values (${a.escritorio_id}, ${id}, ${a.cliente_id}, ${c.documento.tipo}, ${id + '.pdf'}, 'application/pdf', ${randomUUID().replaceAll('-', '').padEnd(64, '0')}, 'upload', 'plataforma',
       ${tx.json((typeof c.documento.metadados === 'function' ? c.documento.metadados({ cnpj: a.cnpj }) : c.documento.metadados) as never)})`,
  )
  return id
}

/**
 * Roda um caso em sombra e devolve a linha. A execução sombra nunca cria cartão, nunca chama
 * conector e desfaz o efeito; a decisão sai do `decisao` do pacote do procedimento.
 */
export async function avaliarCaso(a: AmbienteAvaliacao, c: CasoGabarito, rodada = 1, esperarMs = 180_000): Promise<LinhaAvaliacao> {
  const achado = pacoteDoProcedimento(c.procedimento)
  if (!achado) throw new Error(`Procedimento sem integrante: ${c.procedimento}`)
  const entrada = c.preparar
    ? await comEscritorio(a.sql, a.escritorio_id, (tx) => c.preparar!(tx, { escritorio_id: a.escritorio_id, cliente_id: a.cliente_id }))
    : { cliente_id: a.cliente_id, documento_id: await gravarDocumento(a.sql, a, c), ...c.entrada_extra }
  const inicio = Date.now()
  const { execucao_id } = await a.motor.iniciar(a.ctx, c.procedimento, entrada, { sombra: true, chave_idempotencia: `sombra:${c.id}:${rodada}:${randomUUID().slice(0, 8)}` })
  let ex = await lerExecucao(a.sql, a.escritorio_id, execucao_id)
  while (!TERMINAL.has(ex.estado)) {
    if (Date.now() - inicio > esperarMs) break
    await new Promise((r) => setTimeout(r, 150))
    ex = await lerExecucao(a.sql, a.escritorio_id, execucao_id)
  }
  const latencia_ms = (ex.concluida_em ? new Date(ex.concluida_em).getTime() : Date.now()) - new Date(ex.criado_em).getTime()
  const obtido = achado.pacote.decisao(ex)
  const chamadas = await comEscritorio(a.sql, a.escritorio_id, (tx) => tx`select classe, modelo, centavos, latencia_ms, contrato from chamada_modelo where execucao_id = ${execucao_id} order by criado_em`)
  const resultado = classificar(c.esperado, obtido)
  return {
    caso: c.id,
    setor: c.setor,
    procedimento: c.procedimento,
    rodada,
    esperado: c.esperado,
    obtido,
    resultado,
    pessoa: c.pessoa ?? null,
    resultado_pessoa: c.pessoa !== undefined ? classificar(c.esperado, c.pessoa) : null,
    execucao_id,
    estado: ex.estado,
    centavos: chamadas.reduce((s, x) => s + Number(x.centavos), 0),
    latencia_ms: Math.max(0, latencia_ms),
    chamadas: chamadas.map((x) => ({ classe: x.classe, modelo: x.modelo, centavos: Number(x.centavos), latencia_ms: x.latencia_ms, contrato: x.contrato })),
  }
}

/** Roda os casos com concorrência limitada (nunca dispara tudo de uma vez: o limite do setor manda). */
export async function avaliar(a: AmbienteAvaliacao, casos: CasoGabarito[], o: { repeticoes?: number; concorrencia?: number; aoTerminar?: (l: LinhaAvaliacao) => void | Promise<void> } = {}) {
  const fila: [CasoGabarito, number][] = []
  for (let r = 1; r <= (o.repeticoes ?? 1); r++) for (const c of casos) fila.push([c, r])
  const linhas: LinhaAvaliacao[] = []
  const trabalhadores = Array.from({ length: Math.max(1, o.concorrencia ?? 4) }, async () => {
    for (;;) {
      const prox = fila.shift()
      if (!prox) return
      const l = await avaliarCaso(a, prox[0], prox[1])
      linhas.push(l)
      await o.aoTerminar?.(l)
    }
  })
  await Promise.all(trabalhadores)
  return linhas.sort((x, y) => x.setor.localeCompare(y.setor) || x.caso.localeCompare(y.caso) || x.rodada - y.rodada)
}

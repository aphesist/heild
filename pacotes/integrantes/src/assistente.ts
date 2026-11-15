import { createHash } from 'node:crypto'
import type { PgBoss } from 'pg-boss'
import {
  autorizarFerramenta,
  comEscritorio,
  contextoDePessoa,
  enfileirar,
  ErroEntrada,
  ErroPermissao,
  ErroRegra,
  type ContextoExec,
  type FornecedorModelo,
  type Motor,
  type PortaEventos,
  type Sql,
} from '@heild/processos'
import { Anexos, type Integrante } from './contrato.ts'
import { integrantesContabil, pacoteDoProcedimento } from './integrantes.ts'
import { responderExecucao } from './responder.ts'
import { resposta, type RespostaPadrao } from './resposta.ts'
import { opcoesDeRota, rotearEmCascata, rotearPorRegras, type ConfigRoteamento, type DecisaoRota, type OpcaoRota, type Tentativa } from './roteador.ts'

/**
 * O Assistente (orquestrador principal): a porta do chat. Ele não planeja nem executa:
 *   1. registra o pedido (com o texto só sob RLS; na cadeia vão o hash e o tamanho);
 *   2. roteia em cascata (regras → modelo barato → modelo caro) e registra a decisão na cadeia;
 *   3. inicia o procedimento do integrante do setor, como a pessoa (a mesma `autorizar`);
 *   4. devolve a resposta padrão do integrante SEM reescrever (decisão 4).
 * Quando o roteamento precisa de modelo, a chamada vai para a fila (`assistente.rotear`): o pedido
 * HTTP nunca espera um modelo (PADROES.md, operação longa vai para a fila).
 */

export const FILA_ROTEAR = 'assistente.rotear'

const ASSISTENTE = { tipo: 'assistente' as const, id: 'i-assistente', setor: 'assistente', nome: 'Assistente' }

export interface PedidoAssistente {
  texto: string
  anexos?: Anexos
  chave_idempotencia?: string
}

export interface RespostaAssistente {
  pedido_id: string
  estado: string
  encaminhado_para: { integrante_id: string; setor: string; nome: string } | null
  roteamento: { camada: string; procedimento: string | null; confianca: number | null } | null
  /** A resposta do integrante, exatamente como ele a deu (ou a do Assistente, sem integrante). */
  resposta: RespostaPadrao
}

export interface DependenciasAssistente {
  sql: Sql
  boss: PgBoss
  motor: Motor
  eventos: PortaEventos
  fornecedor: FornecedorModelo
  roteamento: ConfigRoteamento
  integrantes?: Integrante[]
  /** Quanto `pedir` espera a execução andar antes de responder (AGENTICO 4.2: até ~5 s). */
  aguardar_ms?: number
}

const hash = (t: string) => createHash('sha256').update(t).digest('hex')
const TRANSITORIOS = new Set(['em_execucao', 'na_fila'])

export class Assistente {
  private readonly integrantes: Integrante[]
  constructor(private readonly d: DependenciasAssistente) {
    this.integrantes = d.integrantes ?? integrantesContabil
  }

  /** `assistente.pedir`: só uma pessoa da equipe conversa com o Assistente. */
  async pedir(ctx: ContextoExec, p: PedidoAssistente): Promise<RespostaAssistente> {
    if (ctx.ator.tipo !== 'pessoa') throw new ErroPermissao('assistente.pedir', 'Só uma pessoa da equipe conversa com o Assistente.')
    const texto = p.texto.trim()
    if (!texto || texto.length > 4000) throw new ErroEntrada([{ campo: 'texto', mensagem: 'O pedido precisa ter de 1 a 4000 caracteres.' }])
    const anexos = Anexos.safeParse(p.anexos ?? {})
    if (!anexos.success) throw new ErroEntrada(anexos.error.issues.map((i) => ({ campo: `anexos.${i.path.join('.')}`, mensagem: i.message })))
    const solicitante = ctx.ator.perfil.usuario_id
    const texto_hash = hash(texto)
    const chave = p.chave_idempotencia ?? `auto:${crypto.randomUUID()}`
    const pedido_id = await comEscritorio(this.d.sql, ctx.escritorio_id, async (tx) => {
      const [ja] = await tx`select id, texto_hash from pedido_assistente where chave_idempotencia = ${chave}`
      if (ja) {
        if (ja.texto_hash !== texto_hash) throw new ErroRegra('IDEMPOTENCIA_CONFLITO', 'A mesma chave de idempotência já foi usada com outro pedido.')
        return ja.id as string
      }
      const a = { ...anexos.data }
      if (a.documento_id) {
        // O documento anexado diz o cliente; um cliente diferente no anexo é erro (cliente errado é o pior erro).
        const [doc] = await tx`select cliente_id from documento where id = ${a.documento_id}`
        if (!doc) throw new ErroRegra('DOCUMENTO_INEXISTENTE', 'Documento anexado não encontrado.', 'anexos.documento_id')
        if (a.cliente_id && doc.cliente_id && a.cliente_id !== doc.cliente_id) throw new ErroRegra('DOCUMENTO_DE_OUTRO_CLIENTE', 'O documento anexado é de outro cliente.', 'anexos.cliente_id')
        a.cliente_id ??= doc.cliente_id ?? undefined
      }
      const [novo] = await tx`
        insert into pedido_assistente (escritorio_id, solicitante_id, texto, texto_hash, anexos, chave_idempotencia, estado)
        values (${ctx.escritorio_id}, ${solicitante}, ${texto}, ${texto_hash}, ${tx.json(a as never)}, ${chave}, 'roteando') returning id`
      await this.d.eventos.gravar(tx, ctx, {
        nome: 'assistente.pedir', ferramenta: 'assistente.pedir', nivel: 'executar', resultado: 'ok', texto: 'Pediu ao Assistente',
        cliente_id: a.cliente_id ?? null, resultado_ref: novo!.id, argumentos_resumo: { pedido_id: novo!.id, texto_hash, tamanho: texto.length, anexos: Object.keys(a) },
      })
      // A fila é a rede de segurança: se o processo cair antes de rotear, o worker roteia.
      await enfileirar(this.d.boss, tx, FILA_ROTEAR, { escritorio_id: ctx.escritorio_id, pedido_id: novo!.id }, { singleton: novo!.id, prioridade: 30, depois: 2 })
      return novo!.id as string
    })
    // Regras já decidem aqui, sem modelo e sem fila. Com modelo, quem decide é o worker.
    await this.rotear({ escritorio_id: ctx.escritorio_id, pedido_id }, { soRegras: true })
    return this.aguardar(ctx, pedido_id)
  }

  private async aguardar(ctx: ContextoExec, pedido_id: string) {
    const fim = Date.now() + (this.d.aguardar_ms ?? 0)
    for (;;) {
      const r = await this.obter(ctx, pedido_id)
      if (!TRANSITORIOS.has(r.resposta.tipo) || Date.now() >= fim) return r
      await new Promise((ok) => setTimeout(ok, 100))
    }
  }

  /**
   * Roteia um pedido (handler da fila e chamada direta). Idempotente: só age sobre pedido em
   * `roteando`, e a execução é aberta com a chave do pedido (nunca duas).
   */
  async rotear(job: { escritorio_id: string; pedido_id: string }, o: { soRegras?: boolean } = {}) {
    const lido = await comEscritorio(this.d.sql, job.escritorio_id, async (tx) => {
      const [p] = await tx`select * from pedido_assistente where id = ${job.pedido_id}`
      if (!p || p.estado !== 'roteando') return null
      const anexos = p.anexos as Anexos
      const [doc] = anexos.documento_id ? await tx`select tipo from documento where id = ${anexos.documento_id}` : []
      return { p, anexos, tipoDocumento: (doc?.tipo as string | undefined) ?? null }
    })
    if (!lido) return
    const ctx = await this.contextoDoSolicitante(job.escritorio_id, lido.p.solicitante_id)
    if (!ctx) return this.encerrar(job, 'falhou', { erro: { codigo: 'CONTA_INATIVA', mensagem: 'A pessoa que pediu não está mais ativa.' } })
    // Opções: só procedimentos que a pessoa pode iniciar (a mesma `autorizar` da tela).
    const opcoes = opcoesDeRota(this.integrantes, lido.tipoDocumento).filter((op) => this.d.motor.porOperacao(op.pacote.procedimento.operacao) && podeIniciar(ctx, op))
    let r: { decisao: DecisaoRota | null; tentativas: Tentativa[]; candidatos: string[] } | null
    if (o.soRegras) {
      const x = rotearPorRegras(lido.p.texto, lido.tipoDocumento, opcoes)
      r = x.decisao ? { decisao: x.decisao, tentativas: [regraTentativa(x.decisao, x.candidatos)], candidatos: x.candidatos } : null
    } else {
      r = await rotearEmCascata({ sql: this.d.sql, fornecedor: this.d.fornecedor, cfg: this.d.roteamento }, job.escritorio_id, { texto: lido.p.texto, tipoDocumento: lido.tipoDocumento }, opcoes)
    }
    if (!r) return // só regras e sem destino: o worker continua pela fila
    const centavos = r.tentativas.reduce((a, t) => a + t.centavos, 0)
    if (!r.decisao) return this.encerrar(job, 'pergunta', { tentativas: r.tentativas, centavos, motivo: 'Não ficou claro qual setor deve cuidar disso.', candidatos: r.candidatos }, ctx)
    if (r.decisao.procedimento_id === 'nenhum') return this.encerrar(job, 'sem_procedimento', { tentativas: r.tentativas, centavos, decisao: r.decisao }, ctx)
    const op = opcoes.find((x) => x.procedimento_id === r.decisao!.procedimento_id)!
    const entrada = op.pacote.entrada(lido.anexos)
    if (!entrada.ok) return this.encerrar(job, 'pergunta', { tentativas: r.tentativas, centavos, decisao: r.decisao, motivo: `falta anexar ${entrada.falta.join(', ')}.`, falta: entrada.falta }, ctx, op)
    try {
      const ini = await this.d.motor.iniciar({ ...ctx, origem: 'chat' }, op.procedimento_id, entrada.entrada, { chave_idempotencia: `assistente:${job.pedido_id}` })
      await this.encerrar(job, 'encaminhado', { tentativas: r.tentativas, centavos, decisao: r.decisao, execucao_id: ini.execucao_id }, ctx, op)
    } catch (e) {
      if (e instanceof ErroPermissao) return this.encerrar(job, 'negado', { tentativas: r.tentativas, centavos, decisao: r.decisao, erro: { codigo: e.codigo, mensagem: e.message } }, ctx, op)
      if (e instanceof ErroRegra || e instanceof ErroEntrada) return this.encerrar(job, 'falhou', { tentativas: r.tentativas, centavos, decisao: r.decisao, erro: { codigo: e.codigo, mensagem: e.message } }, ctx, op)
      throw e
    }
  }

  /** Grava a decisão no pedido e na cadeia de eventos (uma linha por decisão de roteamento). */
  private async encerrar(
    job: { escritorio_id: string; pedido_id: string },
    estado: 'encaminhado' | 'pergunta' | 'sem_procedimento' | 'negado' | 'falhou',
    x: { tentativas?: Tentativa[]; centavos?: number; decisao?: DecisaoRota; execucao_id?: string; erro?: { codigo: string; mensagem: string }; motivo?: string; candidatos?: string[]; falta?: string[] },
    ctx?: ContextoExec,
    op?: OpcaoRota,
  ) {
    await comEscritorio(this.d.sql, job.escritorio_id, async (tx) => {
      const [p] = await tx`
        update pedido_assistente set estado = ${estado}, camada = ${x.decisao?.camada ?? null}, setor = ${op?.setor ?? null},
          procedimento_id = ${x.decisao && x.decisao.procedimento_id !== 'nenhum' ? x.decisao.procedimento_id : null}, confianca = ${x.decisao?.confianca ?? null},
          motivo = ${x.motivo ?? x.decisao?.motivo ?? null}, tentativas = ${tx.json((x.tentativas ?? []) as never)}, centavos = ${x.centavos ?? 0},
          execucao_id = ${x.execucao_id ?? null},
          erro = ${x.erro || x.candidatos || x.falta ? tx.json({ ...(x.erro ?? {}), ...(x.candidatos ? { candidatos: x.candidatos } : {}), ...(x.falta ? { falta: x.falta } : {}) } as never) : null}
        where id = ${job.pedido_id} and estado = 'roteando' returning anexos->>'cliente_id' as cliente_id`
      if (!p) return
      const ator = ctx ?? { escritorio_id: job.escritorio_id, origem: 'chat' as const, ator: { tipo: 'sistema' as const, nome: 'Assistente' } }
      await this.d.eventos.gravar(tx, ator, {
        nome: 'assistente.rotear', ferramenta: 'assistente.pedir', nivel: 'executar', resultado: estado === 'negado' ? 'negado' : estado === 'falhou' ? 'erro' : 'ok',
        texto: estado === 'encaminhado' ? `Assistente encaminhou ao ${op?.integrante_id ?? 'integrante'} (${x.decisao?.camada})` : `Assistente: ${estado}`,
        cliente_id: (p.cliente_id as string | null) ?? null, setor: op?.setor ?? null, execucao_id: x.execucao_id ?? null, resultado_ref: job.pedido_id,
        argumentos_resumo: {
          pedido_id: job.pedido_id, estado, camada: x.decisao?.camada ?? null, procedimento: x.decisao?.procedimento_id ?? null, confianca: x.decisao?.confianca ?? null,
          camadas: (x.tentativas ?? []).map((t) => ({ camada: t.camada, modelo: t.modelo, procedimento: t.procedimento, confianca: t.confianca, aceita: t.aceita })),
        },
        custo: { centavos: x.centavos ?? 0, chamadas: (x.tentativas ?? []).filter((t) => t.modelo).length },
      })
    })
  }

  private async contextoDoSolicitante(escritorio_id: string, usuario_id: string): Promise<ContextoExec | null> {
    return comEscritorio(this.d.sql, escritorio_id, (tx) => contextoDePessoa(tx, escritorio_id, usuario_id, 'chat')).catch(() => null)
  }

  /** `assistente.obter`: a conversa é privada (sigilo): só quem pediu lê o próprio pedido. */
  async obter(ctx: ContextoExec, pedido_id: string): Promise<RespostaAssistente> {
    const [p] = await comEscritorio(this.d.sql, ctx.escritorio_id, (tx) => tx`select * from pedido_assistente where id = ${pedido_id}`)
    if (!p) throw new ErroRegra('PEDIDO_INEXISTENTE', 'Pedido não encontrado.')
    if (ctx.ator.tipo !== 'pessoa' || ctx.ator.perfil.usuario_id !== p.solicitante_id) throw new ErroPermissao('assistente.obter', 'Este pedido é de outra pessoa.')
    const roteamento = p.camada ? { camada: p.camada as string, procedimento: (p.procedimento_id as string | null) ?? null, confianca: p.confianca === null ? null : Number(p.confianca) } : null
    const integrante = p.setor ? this.integrantes.find((i) => i.setor === p.setor) : undefined
    const encaminhado_para = integrante ? { integrante_id: integrante.id, setor: integrante.setor, nome: integrante.nome } : null
    const origem = { procedimento: (p.procedimento_id as string | null) ?? null, execucao_id: (p.execucao_id as string | null) ?? null, pedido_id, posicao_na_fila: null }
    const custo = { centavos: Number(p.centavos), chamadas: ((p.tentativas ?? []) as Tentativa[]).filter((t) => t.modelo).length }
    const erro = (p.erro ?? {}) as { codigo?: string; mensagem?: string; candidatos?: string[]; falta?: string[] }
    const base = { pedido_id, estado: p.estado as string, encaminhado_para, roteamento }
    if (p.execucao_id) {
      // Encaminha SEM reescrever: o objeto é o que o integrante respondeu.
      return { ...base, resposta: await responderExecucao(this.d.sql, this.d.motor, ctx, p.execucao_id, pedido_id) }
    }
    const de = ASSISTENTE
    switch (p.estado) {
      case 'roteando':
        return { ...base, resposta: resposta({ de, origem, custo, tipo: 'em_execucao', titulo: 'Escolhendo o setor do seu pedido' }) }
      case 'pergunta': {
        const opcoes = (erro.candidatos ?? []).slice(0, 6).map((id) => ({ id, rotulo: pacoteDoProcedimento(id)?.pacote.descricao_roteamento.slice(0, 120) ?? id }))
        const opcoesFinais = opcoes.length ? opcoes : this.integrantes.map((i) => ({ id: i.setor, rotulo: `${i.nome}: ${i.descricao}`.slice(0, 120) }))
        return { ...base, resposta: resposta({ de, origem, custo, tipo: 'pergunta', titulo: erro.falta ? 'Falta um anexo' : 'Para qual setor é o pedido?', motivo: String(p.motivo ?? ''), opcoes: erro.falta ? [] : opcoesFinais, dados: erro.falta ? { falta: erro.falta.join(',') } : {} }) }
      }
      case 'sem_procedimento':
        return { ...base, resposta: resposta({ de, origem, custo, tipo: 'sem_procedimento', titulo: 'Sem procedimento para este pedido' }) }
      case 'negado':
        return { ...base, resposta: resposta({ de, origem, custo, tipo: 'negado', titulo: 'Sem permissão', motivo: erro.mensagem }) }
      default:
        return { ...base, resposta: resposta({ de, origem, custo, tipo: 'falhou', titulo: 'Não consegui encaminhar', motivo: erro.mensagem, dados: { codigo: erro.codigo ?? null } }) }
    }
  }

  async iniciarWorker(intervalo = 0.5) {
    await this.d.boss.work<{ escritorio_id: string; pedido_id: string }>(FILA_ROTEAR, { pollingIntervalSeconds: intervalo, localConcurrency: 4 }, async (jobs) => {
      for (const j of jobs) await this.rotear(j.data)
    })
  }
}

function regraTentativa(d: DecisaoRota, candidatos: string[]): Tentativa {
  return { camada: 'regra', modelo: null, procedimento: d.procedimento_id, confianca: 1, ambiguo: false, aceita: true, motivo: d.motivo, centavos: 0, tokens_entrada: 0, tokens_saida: 0, latencia_ms: 0, candidatos }
}

/** A pessoa só recebe como opção o que ela pode iniciar (a mesma `autorizar` da tela). */
const podeIniciar = (ctx: ContextoExec, op: OpcaoRota) => autorizarFerramenta(ctx, op.pacote.procedimento.ferramenta, { setor_id: op.setor }).permitido

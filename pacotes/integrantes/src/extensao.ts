import { z } from 'zod'
import { comEscritorio, contextoDeIntegrante, definirFerramenta, ErroHeild, integranteDoSetor, type BaseExtensao, type DefinicaoFerramenta, type ExtensaoProcessos } from '@heild/processos'
import { Assistente, FILA_ROTEAR } from './assistente.ts'
import { Anexos, type Integrante } from './contrato.ts'
import { aprenderComCartao } from './execucao.ts'
import { observadorDeDecisoes } from './decisoes.ts'
import { FORMATOS_RESPOSTA } from './resposta.ts'
import { CATEGORIAS_DE_ENVIO, CategoriaEnvio, configurarEnvio, ModoEnvio, modosDeEnvio } from './envio.ts'
import { integrantesContabil } from './integrantes.ts'
import { metasB3 } from './metas.ts'
import { ROTEADOR_BARATO_NO_HAIKU } from './modelos.ts'
import { configRoteamentoPadrao, type ConfigRoteamento } from './roteador.ts'
import { FILA_RETOMAR_TRIAGEM } from './setores/triagem-conversa.ts'

/**
 * A B3 como extensão do `criarProcessos` da B2: as ferramentas do Assistente e dos integrantes
 * entram no MESMO registro (mesma rota `/v1/ferramentas/{nome}`, mesmo MCP, mesma `autorizar`), e
 * a fila `assistente.rotear` roda no worker. Nada de porta nova.
 */
export interface OpcoesExtensao {
  integrantes?: Integrante[]
  roteamento?: Partial<ConfigRoteamento>
  aguardar_ms?: number
}

export interface ExtensaoIntegrantes extends ExtensaoProcessos {
  /** Disponível depois do `criarProcessos` (as ferramentas são montadas com o motor). */
  assistente: Assistente | null
}

export function extensaoIntegrantes(o: OpcoesExtensao = {}): ExtensaoIntegrantes {
  const integrantes = o.integrantes ?? integrantesContabil
  const ext: ExtensaoIntegrantes = {
    nome: 'integrantes',
    assistente: null,
    metas: metasB3,
    ferramentas: (b: BaseExtensao): DefinicaoFerramenta[] => {
      // Com os modelos reais, a cascata é Haiku → Sonnet; na demonstração, os modelos de demonstração.
      const padrao = b.modelos.precos['claude-haiku-5-5']
        ? { ...configRoteamentoPadrao(b.modelos.precos), ...(ROTEADOR_BARATO_NO_HAIKU.liberado ? {} : { barato: 'claude-sonnet-5-5' }) }
        : { ...configRoteamentoPadrao(b.modelos.precos), barato: b.modelos.porClasse.operario, caro: b.modelos.porClasse.escritor }
      const assistente = new Assistente({ sql: b.sql, boss: b.boss, motor: b.motor, eventos: b.eventos, fornecedor: b.fornecedor, roteamento: { ...padrao, ...o.roteamento }, integrantes, aguardar_ms: o.aguardar_ms })
      ext.assistente = assistente
      const meta = (nome: string) => metasB3.find((m) => m.nome === nome)!
      return [
        definirFerramenta({
          nome: 'assistente.pedir',
          versao: 1,
          descricao_modelo: 'Pede ao Assistente: ele roteia ao integrante do setor e devolve a resposta padrão dele, sem reescrever.',
          entrada: z.object({ texto: z.string().min(1).max(4000), anexos: Anexos.optional(), chave_idempotencia: z.string().min(8).max(200).optional() }).strict(),
          meta: meta('assistente.pedir'),
          exposta_mcp: false,
          recorte: 'geral',
          executar: async (e, ctx) => ({ resultado: 'ok', dados: await assistente.pedir(ctx, e) }),
        }),
        definirFerramenta({
          nome: 'assistente.obter',
          versao: 1,
          descricao_modelo: 'Estado e resposta padrão de um pedido feito ao Assistente (só de quem pediu).',
          entrada: z.object({ pedido_id: z.string().min(1).max(80), formato: z.enum(FORMATOS_RESPOSTA).optional() }).strict(),
          meta: meta('assistente.obter'),
          exposta_mcp: false,
          recorte: 'geral',
          executar: async (e, ctx) => ({ resultado: 'ok', dados: await assistente.obterNoFormato(ctx, e.pedido_id, e.formato) }),
        }),
        definirFerramenta({
          nome: 'assistente.prever_suposicoes',
          versao: 1,
          descricao_modelo: 'Prévia do que o integrante vai supor para um pedido (procedimento, setor, cliente, competência, valor) e do que falta anexar, sem executar. Regras primeiro; modelo barato só se precisar.',
          entrada: z.object({ texto: z.string().min(1).max(4000), anexos: Anexos.optional(), usar_modelo: z.boolean().optional() }).strict(),
          meta: meta('assistente.prever_suposicoes'),
          exposta_mcp: false,
          recorte: 'geral',
          executar: async (e, ctx) => ({ resultado: 'ok', dados: await assistente.preverSuposicoes(ctx, e) }),
        }),
        definirFerramenta({
          nome: 'assistente.preencher_lacuna',
          versao: 1,
          descricao_modelo: 'Preenche as lacunas de um rascunho que parou num "não consegui" e retoma a execução do ponto em que parou.',
          entrada: z
            .object({
              pedido_id: z.string().min(1).max(80).optional(),
              execucao_id: z.string().min(1).max(80).optional(),
              valores: z.record(z.string().max(60), z.union([z.string().max(300), z.number(), z.boolean(), z.null()])).refine((v) => Object.keys(v).length > 0 && Object.keys(v).length <= 10, 'De 1 a 10 lacunas.'),
            })
            .strict()
            .refine((x) => Boolean(x.pedido_id) !== Boolean(x.execucao_id), 'Informe o pedido ou a execução (um dos dois).'),
          meta: meta('assistente.preencher_lacuna'),
          exposta_mcp: false,
          recorte: 'geral',
          executar: async (e, ctx) => ({ resultado: 'ok', dados: await assistente.preencherLacuna(ctx, e) }),
        }),
        definirFerramenta({
          nome: 'integrante.listar',
          versao: 1,
          descricao_modelo: 'Os integrantes dos setores: o que cada um faz, procedimentos, limites e papéis de modelo.',
          entrada: z.object({ setor: z.string().max(40).optional() }).strict(),
          meta: meta('integrante.listar'),
          exposta_mcp: true,
          recorte: 'geral',
          executar: async (e) => ({
            resultado: 'ok',
            dados: integrantes
              .filter((i) => !e.setor || i.setor === e.setor)
              .map((i) => ({ id: i.id, setor: i.setor, nome: i.nome, descricao: i.descricao, procedimentos: i.procedimentos.map((p) => `${p.procedimento.id}@${p.procedimento.versao}`), limites: i.limites, limiar_confianca: i.limiar_confianca, papeis: i.papeis })),
          }),
        }),
        definirFerramenta({
          nome: 'integrante.aprender',
          versao: 1,
          descricao_modelo: 'Propõe guardar na memória do setor a correção que uma pessoa fez num cartão "não consegui" (vira cartão para quem gere).',
          entrada: z.object({ execucao_id: z.string().min(1).max(80) }).strict(),
          meta: meta('integrante.aprender'),
          exposta_mcp: true,
          recorte: 'geral',
          executar: async (e, ctx) => {
            const c = await aprenderComCartao(b.sql, b.eventos, ctx, e.execucao_id)
            return { resultado: 'aguardando_aprovacao', cartao_id: c.id, resumo_humano: c.resumo, expira_em: null }
          },
        }),
        definirFerramenta({
          nome: 'envio_cliente.listar',
          versao: 1,
          descricao_modelo: 'Como cada categoria de mensagem padronizada vai ao cliente: cartão (padrão), envio automático ou desligado.',
          entrada: z.object({}).strict(),
          meta: meta('envio_cliente.listar'),
          exposta_mcp: true,
          recorte: 'geral',
          executar: async (_e, ctx) => {
            const modos = await comEscritorio(b.sql, ctx.escritorio_id, (tx) => modosDeEnvio(tx))
            return { resultado: 'ok', dados: (Object.keys(CATEGORIAS_DE_ENVIO) as CategoriaEnvio[]).map((c) => ({ categoria: c, ...CATEGORIAS_DE_ENVIO[c], modo: modos[c] })) }
          },
        }),
        definirFerramenta({
          nome: 'envio_cliente.configurar',
          versao: 1,
          descricao_modelo: 'Muda o modo de uma categoria de mensagem padronizada ao cliente (só o Administrador). O que não é padronizado continua sempre com cartão.',
          entrada: z.object({ categoria: CategoriaEnvio, modo: ModoEnvio }).strict(),
          meta: meta('envio_cliente.configurar'),
          exposta_mcp: false,
          recorte: 'geral',
          executar: async (e, ctx) => {
            const texto = `Envio ao cliente: categoria ${CATEGORIAS_DE_ENVIO[e.categoria].nome} em ${e.modo === 'cartao' ? 'aprovação no cartão' : e.modo === 'automatico' ? 'envio automático' : 'desligado'}`
            const modos = await comEscritorio(b.sql, ctx.escritorio_id, async (tx) => {
              const m = await configurarEnvio(tx, e.categoria, e.modo)
              await b.eventos.gravar(tx, ctx, { nome: 'envio_cliente.configurar', ferramenta: 'envio_cliente.configurar', nivel: 'executar', resultado: 'ok', texto, argumentos_resumo: { categoria: e.categoria, modo: e.modo } })
              return m
            })
            return { resultado: 'ok', dados: { categoria: e.categoria, modo: modos[e.categoria] } }
          },
        }),
      ]
    },
    // Gatilho 18: acordar o integrante quando uma pessoa recusa ou altera o pedido dele no cartão.
    observadores: (b) => [observadorDeDecisoes(b)],
    criarFilas: async (b) => {
      const opcoes = { expireInSeconds: 300, retryLimit: 3, retryDelay: 5, retryBackoff: true, notify: true }
      for (const fila of [FILA_ROTEAR, FILA_RETOMAR_TRIAGEM]) {
        if (await b.boss.getQueue(fila)) await b.boss.updateQueue(fila, opcoes)
        else await b.boss.createQueue(fila, opcoes)
      }
    },
    iniciarWorkers: async (b, intervalo) => {
      await ext.assistente!.iniciarWorker(intervalo)
      // A triagem que esperou o expediente abrir (job atrasado gravado pelo passo `fora_do_horario`).
      await b.boss.work<{ escritorio_id: string; conversa_id: string }>(FILA_RETOMAR_TRIAGEM, { pollingIntervalSeconds: intervalo ?? 2 }, async (jobs) => {
        for (const j of jobs) await retomarTriagem(b, j.data)
      })
    },
  }
  return ext
}

/**
 * Retoma a triagem na primeira hora do expediente, como o integrante de Atendimento (sem pessoa por
 * trás). Se alguém já assumiu a conversa nesse meio-tempo, ou o cliente não escreveu nada novo, não
 * há o que triar: o job termina sem erro.
 */
export async function retomarTriagem(b: BaseExtensao, j: { escritorio_id: string; conversa_id: string }) {
  const ctx = await comEscritorio(b.sql, j.escritorio_id, async (tx) => {
    const [c] = await tx`select setor_id, responsavel_id, etiquetas from conversa where id = ${j.conversa_id}`
    if (!c || c.responsavel_id || (c.etiquetas as string[]).includes('triada')) return null
    const integrante = await integranteDoSetor(tx, 'gestao_atendimento')
    return integrante ? contextoDeIntegrante(tx, j.escritorio_id, integrante, 'job') : null
  })
  if (!ctx) return
  try {
    await b.motor.iniciar(ctx, 'GES-TRIAR-REPASSAR', { conversa_id: j.conversa_id }, { chave_idempotencia: `retomar:${j.conversa_id}:${new Date().toISOString().slice(0, 13)}` })
  } catch (e) {
    if (!(e instanceof ErroHeild)) throw e
  }
}

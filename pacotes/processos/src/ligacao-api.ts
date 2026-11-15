import { randomUUID } from 'node:crypto'
import type { PgBoss } from 'pg-boss'
import { bancoAtual, contextoAtual, ErroPermissao as ErroPermissaoDominio, pedirJob, registrarEvento, type FerramentaEscrita } from '@heild/dominio'
import type { Sql } from './banco.ts'
import { comEscritorio } from './banco.ts'
import { contextoDeIntegrante, contextoDePessoa, prioridadePorOrigem, type ContextoExec, type Origem } from './contexto.ts'
import { autorizarFerramenta, type Ator } from './dominio.ts'
import type { Envelope } from './ferramentas.ts'
import { FILAS } from './fila.ts'
import type { Motor } from './motor/motor.ts'
import type { Procedimento } from './motor/definicao.ts'

/**
 * A ligação da B2 com o executor da B1 (docs/backend/IMPLEMENTACAO.md, B2 › O encaixe com a B1).
 *
 * Caminho de um pedido de processo pela API:
 *   POST /v1/ferramentas/contabil.ecd.conferir_e_transmitir (Idempotency-Key)
 *   → executor da B1: valida, `autorizar` (a mesma da tela), roda a operação abaixo no banco do pedido
 *   → a operação pede o job `procedimento.iniciar` (pedirJob) e grava o evento do pedido
 *   → na MESMA transação: idempotência, evento na cadeia e job no pg-boss (enfileirarNaTransacao)
 *   → 202 { resultado: 'em_execucao', execucao_id }
 *   → worker: `procedimento.iniciar` abre a execução com esse id, e o motor segue (passos, cartão...).
 */

/** Nome da operação de servidor que o catálogo tipado aponta para cada procedimento. */
export const operacaoDoProcedimento = (id: string) => `procedimentos.${id}.iniciar`

interface AtorSerializado {
  tipo: 'pessoa' | 'integrante' | 'sistema'
  id: string | null
  dono_id: string | null
}

interface PedidoIniciar {
  escritorio_id: string
  execucao_id: string
  procedimento_id: string
  entrada: unknown
  ator: AtorSerializado
  origem: Origem
}

const serializar = (a: Ator): AtorSerializado =>
  a.tipo === 'pessoa'
    ? { tipo: 'pessoa', id: a.perfil.usuario_id, dono_id: null }
    : a.tipo === 'integrante'
      ? { tipo: 'integrante', id: a.id, dono_id: a.dono?.usuario_id ?? null }
      : { tipo: 'sistema', id: null, dono_id: null }

const origemDe = (o: string): Origem => (o === 'chat' || o === 'tela' || o === 'job' || o === 'evento' ? o : 'mcp')

/**
 * As operações de processo para o catálogo tipado da B1 e as operações de servidor que elas
 * chamam. A operação roda DENTRO do executor (síncrona, no banco do pedido): autoriza, pede o job
 * e grava o evento. Nada de chamada externa nem espera: o trabalho longo é do worker (PADROES.md).
 */
export function ligacaoDosProcedimentos(procedimentos: Procedimento[]) {
  const atuais = new Map<string, Procedimento>()
  for (const p of procedimentos) if (!atuais.has(p.id) || atuais.get(p.id)!.versao < p.versao) atuais.set(p.id, p)
  const ferramentas: FerramentaEscrita[] = []
  // `regras.ferramentas` vazio: a ferramenta desta operação é a operação de processo, não uma do catálogo do wireframe.
  const operacoes: { nome: string; repositorio: { regras: { ferramentas: Record<string, string> }; iniciar: (entrada: unknown) => unknown }; metodo: string }[] = []
  for (const p of atuais.values()) {
    ferramentas.push({
      tipo: 'escrita',
      nome: p.operacao,
      versao: p.versao,
      descricao_modelo: p.descricao_modelo,
      entrada: p.entrada,
      erros: [],
      exposta_mcp: true,
      chamada: (e) => ({ operacao: operacaoDoProcedimento(p.id), argumentos: [e] }),
    })
    operacoes.push({
      nome: operacaoDoProcedimento(p.id),
      metodo: 'iniciar',
      repositorio: {
        regras: { ferramentas: {} },
        iniciar: (bruta: unknown) => {
          const ctx = contextoAtual()
          const entrada = p.entrada.parse(bruta)
          const cliente_id = p.cliente(entrada)
          const dec = autorizarFerramenta(ctx, p.ferramenta, { setor_id: p.setor, cliente_id })
          if (!dec.permitido) throw new ErroPermissaoDominio(p.operacao, dec.motivo)
          const banco = bancoAtual()
          const execucao_id = `ex${randomUUID().replaceAll('-', '')}`
          const origem = origemDe(ctx.origem)
          const pedido: PedidoIniciar = { escritorio_id: banco.escritorioId ?? '', execucao_id, procedimento_id: p.id, entrada, ator: serializar(ctx.ator), origem }
          pedirJob({ fila: FILAS.iniciar, dados: pedido as unknown as Record<string, unknown>, singleton: execucao_id, prioridade: prioridadePorOrigem[origem] })
          banco.transacao((tx) =>
            registrarEvento(tx, ctx, {
              nome: p.operacao, ferramenta: p.operacao, nivel: p.nivel_maximo, texto: `Pediu ${p.nome}`, cliente_id, resultado_ref: execucao_id,
              argumentos_resumo: { procedimento: `${p.id}@${p.versao}`, execucao_id },
            }),
          )
          return { execucao_id, estado: 'pendente' }
        },
      },
    })
  }
  return { ferramentas, operacoes }
}

/** Worker: o job do pedido da API abre a execução com o id que a API já devolveu. */
export async function iniciarPedidosDaApi(boss: PgBoss, sql: Sql, motor: Motor, intervalo = 0.5) {
  await boss.work<PedidoIniciar>(FILAS.iniciar, { pollingIntervalSeconds: intervalo, localConcurrency: 2 }, async (jobs) => {
    for (const { data: j } of jobs) {
      const ctx: ContextoExec = await comEscritorio(sql, j.escritorio_id, (tx) =>
        j.ator.tipo === 'pessoa' && j.ator.id
          ? contextoDePessoa(tx, j.escritorio_id, j.ator.id, j.origem)
          : j.ator.tipo === 'integrante' && j.ator.id
            ? contextoDeIntegrante(tx, j.escritorio_id, j.ator.id, j.origem, j.ator.dono_id)
            : Promise.resolve({ escritorio_id: j.escritorio_id, origem: j.origem, ator: { tipo: 'sistema' as const, nome: 'API' } }),
      )
      // A chave deriva do id: a retentativa do job devolve a mesma execução.
      await motor.iniciar(ctx, j.procedimento_id, j.entrada, { chave_idempotencia: `api:${j.execucao_id}`, execucao_id: j.execucao_id })
    }
  })
}

/** O envelope da B2 em HTTP, com os mesmos status do AGENTICO 8. */
export function envelopeParaHttp(env: Envelope): { status: number; corpo: Envelope } {
  if (env.resultado === 'ok') return { status: 200, corpo: env }
  if (env.resultado === 'em_execucao' || env.resultado === 'aguardando_aprovacao') return { status: 202, corpo: env }
  if (env.resultado === 'negado') return { status: 403, corpo: env }
  if (env.codigo === 'ENTRADA_INVALIDA') return { status: 400, corpo: env }
  if (env.codigo === 'EXECUCAO_INEXISTENTE' || env.codigo === 'CARTAO_INEXISTENTE' || env.codigo === 'FERRAMENTA_DESCONHECIDA') return { status: 404, corpo: env }
  return { status: 422, corpo: env }
}

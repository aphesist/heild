import { PgBoss } from 'pg-boss'
import type { Tx } from './banco.ts'
import { bossNaTransacao } from './banco.ts'

/** Filas da B2 (uma por tipo, STACK 4). */
export const FILAS = {
  /** Um job por passo de procedimento, chave (execução, passo, tentativa). */
  passo: 'procedimento.passo',
  /** Passos de modelo: runner dos operários (o único serviço com a chave do fornecedor). */
  operario: 'operario.executar',
  /** Admissão: tira execuções `pendente` da fila respeitando prioridade e limites. */
  admitir: 'execucao.admitir',
  /** Despachante: um job por evento gravado, na mesma transação do evento. */
  despachar: 'evento.despachar',
  /** Cartão que venceu sem decisão. */
  expirarCartao: 'cartao.expirar',
  /** Fila morta dos passos e operários: marca a execução como falha e acorda o integrante. */
  falha: 'procedimento.falha',
} as const

export interface OpcoesFila {
  /** Segundos que um passo pode ficar ativo antes de o pg-boss considerá-lo perdido e repetir. */
  expiraPassoSegundos?: number
  tentativas?: number
  esperaInicialSegundos?: number
}

export async function criarBoss(url: string, opcoes: { supervisaoSegundos?: number } = {}) {
  const boss = new PgBoss({
    connectionString: url,
    schema: 'pgboss',
    max: 5,
    ...(opcoes.supervisaoSegundos ? { superviseIntervalSeconds: opcoes.supervisaoSegundos, monitorIntervalSeconds: opcoes.supervisaoSegundos } : {}),
  } as ConstructorParameters<typeof PgBoss>[0])
  boss.on('error', (e: unknown) => {
    if (process.env.HEILD_LOG_FILA) console.error('[pg-boss]', e)
  })
  await boss.start()
  return boss
}

export async function criarFilas(boss: PgBoss, o: OpcoesFila = {}) {
  const expira = o.expiraPassoSegundos ?? 15 * 60
  const retry = { retryLimit: o.tentativas ?? 4, retryDelay: o.esperaInicialSegundos ?? 5, retryBackoff: true }
  const filas: [string, Record<string, unknown>][] = [
    [FILAS.falha, { expireInSeconds: 60 }],
    [FILAS.passo, { expireInSeconds: expira, deadLetter: FILAS.falha, ...retry }],
    [FILAS.operario, { expireInSeconds: expira, deadLetter: FILAS.falha, ...retry }],
    [FILAS.admitir, { expireInSeconds: 60, retryLimit: 10, retryDelay: 1 }],
    [FILAS.despachar, { expireInSeconds: 120, ...retry }],
    [FILAS.expirarCartao, { expireInSeconds: 60, retryLimit: 5 }],
  ]
  for (const [nome, opcoes] of filas) {
    // A configuração é do código: fila já existente recebe as opções atuais.
    if (await boss.getQueue(nome)) await boss.updateQueue(nome, opcoes)
    else await boss.createQueue(nome, opcoes)
  }
}

/** Enfileira na transação `tx` (efeito + evento + job, juntos ou nada). */
export async function enfileirar(boss: PgBoss, tx: Tx, fila: string, dados: object, opcoes: { prioridade?: number; depois?: Date | number; singleton?: string } = {}) {
  return boss.send(fila, dados, {
    db: bossNaTransacao(tx),
    ...(opcoes.prioridade !== undefined ? { priority: opcoes.prioridade } : {}),
    ...(opcoes.depois !== undefined ? { startAfter: opcoes.depois instanceof Date ? opcoes.depois : opcoes.depois } : {}),
    ...(opcoes.singleton ? { singletonKey: opcoes.singleton } : {}),
  })
}

import { PgBoss } from 'pg-boss'
import type { Tx } from './banco.ts'
import { bossNaTransacao } from './banco.ts'

/** Filas da B2 (uma por tipo, STACK 4). */
export const FILAS = {
  /** Um job por passo de procedimento, chave (execução, passo, tentativa). */
  passo: 'procedimento.passo',
  /** Pedido de processo vindo da API (executor da B1): abre a execução no worker. */
  iniciar: 'procedimento.iniciar',
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

/**
 * `produtor`: só enfileira (o processo da API). Não cria nem migra o esquema, não supervisiona
 * e não agenda: isso é do worker, dono do esquema `pgboss`.
 */
export async function criarBoss(url: string, opcoes: { supervisaoSegundos?: number; produtor?: boolean } = {}) {
  const boss = new PgBoss({
    connectionString: url,
    schema: 'pgboss',
    max: 5,
    ...(opcoes.produtor ? { supervise: false, migrate: false, createSchema: false, schedule: false } : {}),
    ...(opcoes.supervisaoSegundos ? { superviseIntervalSeconds: opcoes.supervisaoSegundos, monitorIntervalSeconds: opcoes.supervisaoSegundos } : {}),
  } as ConstructorParameters<typeof PgBoss>[0])
  boss.on('error', (e: unknown) => {
    if (process.env.HEILD_LOG_FILA) console.error('[pg-boss]', e)
  })
  await boss.start()
  return boss
}

/**
 * Quem pode enfileirar sem ser dono do esquema: o papel de escrita (`api_executor`, a transação do
 * efeito) e o login da API (o pool do próprio pg-boss). Só DML nas tabelas da fila; nada de DDL.
 * Roda no worker, que é o dono do esquema.
 */
export async function concederFila(sql: import('./banco.ts').Sql, papeis: string[]) {
  for (const papel of papeis) {
    const [existe] = await sql`select 1 from pg_roles where rolname = ${papel}`
    if (!existe) continue
    const p = sql(papel)
    await sql`grant usage on schema pgboss to ${p}`
    await sql`grant select, insert, update, delete on all tables in schema pgboss to ${p}`
    await sql`grant usage, select on all sequences in schema pgboss to ${p}`
    await sql`grant execute on all functions in schema pgboss to ${p}`
  }
}

export async function criarFilas(boss: PgBoss, o: OpcoesFila = {}) {
  const expira = o.expiraPassoSegundos ?? 15 * 60
  // `notify`: o job criado acorda os workers por LISTEN/NOTIFY (entregue no commit da transação do efeito).
  const retry = { retryLimit: o.tentativas ?? 4, retryDelay: o.esperaInicialSegundos ?? 5, retryBackoff: true, notify: true }
  const filas: [string, Record<string, unknown>][] = [
    [FILAS.falha, { expireInSeconds: 60 }],
    [FILAS.passo, { expireInSeconds: expira, deadLetter: FILAS.falha, ...retry }],
    [FILAS.operario, { expireInSeconds: expira, deadLetter: FILAS.falha, ...retry }],
    [FILAS.admitir, { expireInSeconds: 60, retryLimit: 10, retryDelay: 1, notify: true }],
    [FILAS.iniciar, { expireInSeconds: 120, ...retry }],
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

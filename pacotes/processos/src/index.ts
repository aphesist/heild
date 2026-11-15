import './validadores/contabil.ts'
import type { Sql } from './banco.ts'
import { conectar } from './banco.ts'
import { Despachante } from './despachante.ts'
import { PortaEventos } from './eventos.ts'
import { FILAS, concederFila, criarBoss, criarFilas, type OpcoesFila } from './fila.ts'
import { RegistroFerramentas, ferramentasDoMotor, operacaoDeProcesso } from './ferramentas.ts'
import { Motor, type Conector, type LimitesPadrao } from './motor/motor.ts'
import type { Procedimento } from './motor/definicao.ts'
import { configDemonstracao, type ConfigModelos, type FornecedorModelo } from './operarios/fornecedor.ts'
import { ctbCompetenciaDoc } from './procedimentos/contabil/competencia-documento.ts'
import { ctbEcd } from './procedimentos/contabil/ecd.ts'
import { iniciarPedidosDaApi } from './ligacao-api.ts'

export * from './banco.ts'
export * from './contexto.ts'
export * from './dominio.ts'
export * from './eventos.ts'
export * from './fila.ts'
export * from './ferramentas.ts'
export * from './mcp.ts'
export * from './motor/definicao.ts'
export * from './motor/motor.ts'
export * from './operarios/contrato.ts'
export * from './operarios/fornecedor.ts'
export * from './validadores/registro.ts'
export { Despachante } from './despachante.ts'
export * from './ligacao-api.ts'
export { ctbEcd, ctbCompetenciaDoc }

/** Os procedimentos de referência do Contábil (AGENTICO 4; ARQUITETURA 7, F3). */
export const procedimentosDeReferencia: Procedimento[] = [ctbEcd as unknown as Procedimento, ctbCompetenciaDoc as unknown as Procedimento]

export interface OpcoesProcessos {
  url?: string
  sql?: Sql
  fornecedor: FornecedorModelo
  modelos?: ConfigModelos
  conectores?: Record<string, Conector>
  limites?: Partial<LimitesPadrao>
  filas?: OpcoesFila
  procedimentos?: Procedimento[]
  /** Quanto a operação de processo espera para responder direto (AGENTICO 4.2: ~5 s). */
  aguardar_ms?: number
  supervisaoSegundos?: number
  /**
   * `worker` (padrão): dono do esquema da fila; cria e configura as filas, publica as versões e
   * concede a fila aos papéis da API. `api`: só enfileira e consulta (o processo HTTP da B1).
   */
  modo?: 'worker' | 'api'
  /** Papéis que podem enfileirar na transação do efeito (modo worker). */
  papeisProdutores?: string[]
}

/**
 * Monta a B2 inteira sobre um Postgres: pg-boss, motor, despachante, registro de ferramentas.
 * `iniciarWorkers` liga os consumidores das filas (serviços `worker` e `operarios`, que no
 * desenvolvimento rodam no mesmo processo).
 */
export async function criarProcessos(o: OpcoesProcessos) {
  const url = o.url ?? process.env.DATABASE_URL ?? 'postgres://postgres@127.0.0.1:54329/heild_b2'
  const sql = o.sql ?? conectar(url)
  const modo = o.modo ?? 'worker'
  const boss = await criarBoss(url, { supervisaoSegundos: o.supervisaoSegundos, produtor: modo === 'api' })
  if (modo === 'worker') {
    await criarFilas(boss, o.filas)
    await concederFila(sql, o.papeisProdutores ?? ['api_executor', 'app_api'])
  }
  const eventos = new PortaEventos(boss)
  let registro: RegistroFerramentas
  const motor = new Motor({
    sql,
    boss,
    eventos,
    fornecedor: o.fornecedor,
    modelos: o.modelos ?? configDemonstracao,
    conectores: o.conectores,
    limites: o.limites,
    resolverFerramenta: (nome) => registro.meta(nome),
  })
  registro = new RegistroFerramentas(sql, eventos)
  for (const p of o.procedimentos ?? procedimentosDeReferencia) {
    motor.registrar(p)
    registro.registrar(operacaoDeProcesso(motor, sql, p, { aguardar_ms: o.aguardar_ms }))
  }
  for (const f of ferramentasDoMotor(motor, sql, eventos)) registro.registrar(f)
  if (modo === 'worker') await motor.publicarVersoes()
  const despachante = new Despachante(sql, boss, motor)
  return {
    sql,
    boss,
    eventos,
    motor,
    registro,
    despachante,
    async iniciarWorkers(w: { concorrenciaPassos?: number; concorrenciaOperarios?: number; intervalo?: number } = {}) {
      if (modo === 'api') throw new Error('O processo da API só enfileira; os workers rodam no modo worker.')
      await motor.iniciarWorkers(w)
      await despachante.iniciarWorker(w.intervalo)
      await iniciarPedidosDaApi(boss, sql, motor, w.intervalo)
    },
    async parar(opcoes: { graceful?: boolean; fecharSql?: boolean } = {}) {
      await boss.stop({ graceful: opcoes.graceful ?? true, timeout: 5_000 })
      if (opcoes.fecharSql !== false && !o.sql) await sql.end({ timeout: 5 })
    },
  }
}

export type Processos = Awaited<ReturnType<typeof criarProcessos>>
export { FILAS }

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
import { ctbCompetenciaDoc, ctbCompetenciaDocV2 } from './procedimentos/contabil/competencia-documento.ts'
import { ctbEcd, ctbEcdV2 } from './procedimentos/contabil/ecd.ts'
export * from './procedimentos/revisor.ts'
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
export { Despachante, type EventoDespachado, type ObservadorEvento } from './despachante.ts'
export * from './ligacao-api.ts'
export { proporMemoria, decidirMemoria } from './memoria.ts'
export * from './operarios/orcamento.ts'
export { FornecedorAnthropic, configAnthropic, fornecedorDoAmbiente } from './operarios/anthropic.ts'
export { ctbEcd, ctbEcdV2, ctbCompetenciaDoc, ctbCompetenciaDocV2 }

/** Os procedimentos de referência do Contábil (AGENTICO 4; ARQUITETURA 7, F3). */
export const procedimentosDeReferencia: Procedimento[] = [ctbEcd, ctbCompetenciaDoc].map((p) => p as unknown as Procedimento)
/** As versões novas da B3b (revisor de risco na ECD, instrução nova da competência), usadas pelos integrantes. */
export const procedimentosDeReferenciaV2: Procedimento[] = [ctbEcdV2, ctbCompetenciaDocV2].map((p) => p as unknown as Procedimento)

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
  /**
   * Extensões (B3, integrantes): ferramentas a mais no mesmo registro (servidas pela mesma rota e
   * pelo MCP) e consumidores de filas próprias. Recebem o motor já montado.
   */
  extensoes?: ExtensaoProcessos[]
}

export interface BaseExtensao {
  sql: Sql
  boss: import('pg-boss').PgBoss
  eventos: PortaEventos
  motor: Motor
  registro: RegistroFerramentas
  fornecedor: FornecedorModelo
  modelos: ConfigModelos
  modo: 'worker' | 'api'
}

export interface ExtensaoProcessos {
  nome: string
  /** Metadados de autorização de ferramentas novas que os passos citam (fora do catálogo do wireframe). */
  metas?: import('./dominio.ts').Ferramenta[]
  ferramentas?: (b: BaseExtensao) => import('./ferramentas.ts').DefinicaoFerramenta[]
  /** Reações a eventos que não são procedimentos de setor (rodam no despachante, depois dos gatilhos). */
  observadores?: (b: BaseExtensao) => import('./despachante.ts').ObservadorEvento[]
  /** Só no modo worker: cria as filas próprias (dono do esquema). */
  criarFilas?: (b: BaseExtensao) => Promise<void>
  iniciarWorkers?: (b: BaseExtensao, intervalo?: number) => Promise<void>
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
  const metasExtras = new Map((o.extensoes ?? []).flatMap((x) => (x.metas ?? []).map((m) => [m.nome, m] as const)))
  const motor = new Motor({
    sql,
    boss,
    eventos,
    fornecedor: o.fornecedor,
    modelos: o.modelos ?? configDemonstracao,
    conectores: o.conectores,
    limites: o.limites,
    resolverFerramenta: (nome) => registro.definicao(nome)?.meta ?? metasExtras.get(nome) ?? registro.meta(nome),
  })
  registro = new RegistroFerramentas(sql, eventos)
  // Todas as versões ficam no motor (execuções em andamento terminam na sua); a operação de
  // processo é uma só por procedimento e inicia sempre a versão mais nova.
  for (const p of o.procedimentos ?? procedimentosDeReferencia) motor.registrar(p)
  const atuais = new Map<string, Procedimento>()
  for (const p of motor.procedimentos.values()) if ((atuais.get(p.id)?.versao ?? -1) < p.versao) atuais.set(p.id, p)
  for (const p of atuais.values()) registro.registrar(operacaoDeProcesso(motor, sql, p, { aguardar_ms: o.aguardar_ms }))
  for (const f of ferramentasDoMotor(motor, sql, eventos)) registro.registrar(f)
  const base: BaseExtensao = { sql, boss, eventos, motor, registro, fornecedor: o.fornecedor, modelos: o.modelos ?? configDemonstracao, modo }
  for (const x of o.extensoes ?? []) for (const f of x.ferramentas?.(base) ?? []) registro.registrar(f)
  if (modo === 'worker') {
    await motor.publicarVersoes()
    for (const x of o.extensoes ?? []) await x.criarFilas?.(base)
    if (o.extensoes?.some((x) => x.criarFilas)) await concederFila(sql, o.papeisProdutores ?? ['api_executor', 'app_api'])
  }
  const despachante = new Despachante(sql, boss, motor, (o.extensoes ?? []).flatMap((x) => x.observadores?.(base) ?? []))
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
      for (const x of o.extensoes ?? []) await x.iniciarWorkers?.(base, w.intervalo)
    },
    async parar(opcoes: { graceful?: boolean; fecharSql?: boolean } = {}) {
      await boss.stop({ graceful: opcoes.graceful ?? true, timeout: 5_000 })
      if (opcoes.fecharSql !== false && !o.sql) await sql.end({ timeout: 5 })
    },
  }
}

export type Processos = Awaited<ReturnType<typeof criarProcessos>>
export { FILAS }

import { afterAll, describe, expect, it } from 'vitest'
import { comEscritorio, FornecedorDemonstracao } from '../src/index.ts'
import { contar, documentoSimples, esperar, fornecedorPadrao, montar, pessoa, semear, sqlAdmin } from './ambiente.ts'

/**
 * Queda de verdade: o worker A morre no meio da chamada ao modelo (o job fica ativo, sem
 * resposta). O worker B sobe, o pg-boss considera o job perdido e o entrega de novo. A execução
 * continua do último passo gravado: nada antes é repetido, a reserva de orçamento é reaproveitada
 * (sem débito em dobro) e há uma chamada_modelo só.
 */
const admin = sqlAdmin()
afterAll(async () => {
  await admin.end()
})

describe('retomada depois de queda do worker', () => {
  it('continua do último passo gravado, sem duplicar passo, chamada nem débito', async () => {
    const travado = new FornecedorDemonstracao().responder('ctb.competencia.escolher', () => new Promise(() => {})) // nunca responde
    const filas = { expiraPassoSegundos: 3, esperaInicialSegundos: 1 }
    const a = await montar({ fornecedor: travado, filas, supervisaoSegundos: 1 })
    const s = await semear(admin)
    await admin`insert into procedimento_config (escritorio_id, procedimento_id, executa_sozinho) values (${s.esc}, 'CTB-COMPETENCIA-DOC', true)`
    const doc = await documentoSimples(admin, s, { tipo: 'recibo', metadados: { texto_extraido: 'Aluguel referente a 09/2026.' } })
    const ana = await pessoa(admin, s.esc, 'u-ana')
    const { execucao_id } = await a.motor.iniciar(ana, 'CTB-COMPETENCIA-DOC', { documento_id: doc, cliente_id: 'c-1' })
    await esperar(async () => travado.chamadas.length, (n) => n === 1)
    const [reservaA] = await admin`select centavos from reserva_orcamento where execucao_id = ${execucao_id}`
    expect(reservaA!.centavos).toBeGreaterThan(0)

    await a.parar({ graceful: false }) // "kill -9" do worker A

    const b = await montar({ fornecedor: fornecedorPadrao(), filas, supervisaoSegundos: 1 })
    try {
      const ex = await esperar(() => comEscritorio(admin, s.esc, async (tx) => (await tx`select * from execucao where id = ${execucao_id}`)[0]!), (e) => e.estado === 'concluida', 40_000)
      const [d] = await admin`select competencia from documento where escritorio_id = ${s.esc} and id = ${doc}`
      expect(d!.competencia).toBe(ex.saida.competencia)
      const chamadas = await admin`select * from chamada_modelo where execucao_id = ${execucao_id}`
      expect(chamadas).toHaveLength(1)
      expect(await contar(admin, 'reserva_orcamento', { execucao_id })).toBe(0)
      const [bolsa] = await admin`select gasto_centavos from bolsa_setor where escritorio_id = ${s.esc}`
      expect(bolsa!.gasto_centavos).toBe(chamadas[0]!.centavos)
      expect(ex.gasto_centavos).toBe(chamadas[0]!.centavos)
      // Cada passo concluído uma vez; o primeiro (ler o documento) não rodou de novo.
      const passos = await admin`select ordem, count(*)::int as n from passo_execucao where execucao_id = ${execucao_id} and estado = 'concluido' group by ordem order by ordem`
      expect(passos.every((p) => p.n === 1)).toBe(true)
      expect(passos.map((p) => p.ordem)).toEqual([0, 1, 2, 3, 4, 5])
    } finally {
      await b.parar()
    }
  })
})

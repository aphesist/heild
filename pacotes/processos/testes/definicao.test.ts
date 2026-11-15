import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { z } from 'zod'
import { ctbEcd, definirProcedimento, rodarValidadores, type Passo } from '../src/index.ts'
import { esperar, montar, pessoa, semear, sqlAdmin } from './ambiente.ts'

const base = {
  id: 'CTB-TESTE',
  versao: 1,
  nome: 'Teste',
  setor: 'contabil',
  nivel_maximo: 'rascunhar' as const,
  operacao: 'contabil.teste',
  descricao_modelo: 'Teste.',
  entrada: z.object({ cliente_id: z.string() }).strict(),
  saida: z.object({}).strict(),
  orcamento: { centavos: 1, tokens: 1 },
  cliente: (e: { cliente_id: string }) => e.cliente_id,
}
const concluir: Passo = { tipo: 'concluir', nome: 'fim', saida: () => ({}) }
const esquema = z.object({ cliente_id: z.string() }).strict()

describe('regras de definição (o que o CI recusa)', () => {
  it('ato irreversível sem cartão humano não compila', () => {
    expect(() =>
      definirProcedimento({ ...base, passos: [{ tipo: 'externo', nome: 'transmitir', ferramenta: 'contabil.ecd_ecf.transmitir', conector: 'sped', metodo: 'x', aprovacao: 'nada', chave: () => 'k' }, concluir] }),
    ).toThrow(/aprovação anterior/)
    expect(() =>
      definirProcedimento({
        ...base,
        passos: [
          { tipo: 'aprovacao', nome: 'ap', ferramenta: 'contabil.ecd_ecf.transmitir', exigida: 'por_regra', esquema, argumentos: (s) => s.entrada, resumo: () => 'x' },
          { tipo: 'externo', nome: 'transmitir', ferramenta: 'contabil.ecd_ecf.transmitir', conector: 'sped', metodo: 'x', aprovacao: 'ap', chave: () => 'k' },
          concluir,
        ],
      }),
    ).toThrow(/exige aprovação sempre/)
    // Aprovação de uma ferramenta não libera outra.
    expect(() =>
      definirProcedimento({
        ...base,
        passos: [
          { tipo: 'aprovacao', nome: 'ap', ferramenta: 'documento.classificar', exigida: 'sempre', esquema, argumentos: (s) => s.entrada, resumo: () => 'x' },
          { tipo: 'externo', nome: 'transmitir', ferramenta: 'contabil.ecd_ecf.transmitir', conector: 'sped', metodo: 'x', aprovacao: 'ap', chave: () => 'k' },
          concluir,
        ],
      }),
    ).toThrow(/outra ferramenta/)
  })

  it('entrada aberta, validador desconhecido e escalada sem operário não compilam', () => {
    expect(() => definirProcedimento({ ...base, entrada: z.object({ cliente_id: z.string() }) as never, passos: [concluir] })).toThrow(/strict/)
    expect(() => definirProcedimento({ ...base, passos: [{ tipo: 'validar', nome: 'v', validadores: ['nao_existe'], dados: () => ({}), ao_falhar: 'falhar' }, concluir] })).toThrow(/não registrado/)
    expect(() => definirProcedimento({ ...base, passos: [{ tipo: 'validar', nome: 'v', validadores: ['partidas_fecham'], dados: () => ({}), ao_falhar: 'escalar' }, concluir] })).toThrow(/escalar exige/)
  })

  it('validadores rodam fora do procedimento com o mesmo código (validador.executar)', async () => {
    const r = await rodarValidadores(['texto_sem_numero', 'confianca_minima:0.9'], { textos: ['Subiu 30%'], origem: 'modelo', confianca: 0.5 }, null)
    expect(r.map((x) => [x.validador, x.ok, x.codigo])).toEqual([
      ['texto_sem_numero', false, 'NUMERO_ESCRITO_PELO_MODELO'],
      ['confianca_minima:0.9', false, 'CONFIANCA_BAIXA'],
    ])
  })
})

describe('versões publicadas e memória do setor', () => {
  let h: Awaited<ReturnType<typeof montar>>
  const admin = sqlAdmin()
  beforeAll(async () => {
    h = await montar()
  })
  afterAll(async () => {
    await h.parar()
    await admin.end()
  })

  it('procedimento que muda sem subir a versão não publica', async () => {
    const [v] = await admin`select hash from procedimento_versao where id = 'CTB-ECD-TRANSMITIR' and versao = 1`
    expect(v!.hash).toBe(ctbEcd.hash)
    const mudado = definirProcedimento({ ...ctbEcd, passos: ctbEcd.passos.filter((p) => p.nome !== 'separar_atipicas' && p.nome !== 'apontar_atencao' && p.nome !== 'conferir_apontamentos') } as never)
    const outro = await montar({ procedimentos: [mudado as never], workers: false }).catch((e: Error) => e)
    expect(outro).toBeInstanceOf(Error)
    expect((outro as Error).message).toMatch(/mudou sem subir a versão/)
  })

  it('memória do setor muda só por proposta aprovada por quem gere; a execução lê só', async () => {
    const s = await semear(admin)
    const ana = await pessoa(admin, s.esc, 'u-ana')
    const r = await h.registro.chamar(ana, 'memoria.propor', { setor: 'contabil', chave: 'limiar_variacao', valor: 40, motivo: 'O cliente tem sazonalidade forte.' })
    expect(r.resultado).toBe('aguardando_aprovacao')
    const cartao_id = (r as { cartao_id: string }).cartao_id
    // Quem só executa no setor não decide.
    expect((await h.registro.chamar(ana, 'aprovacao.decidir', { cartao_id, decisao: 'aprovar' })).resultado).toBe('negado')
    expect(await admin`select * from memoria_setor where escritorio_id = ${s.esc}`).toHaveLength(0)
    const gestora = await pessoa(admin, s.esc, 'u-gestora')
    expect((await h.registro.chamar(gestora, 'aprovacao.decidir', { cartao_id, decisao: 'aprovar' })).resultado).toBe('ok')
    const [m] = await esperar(() => admin`select * from memoria_setor where escritorio_id = ${s.esc}`, (l) => l.length === 1)
    expect(m!.valor).toBe(40)
    expect(m!.origem_cartao_id).toBe(cartao_id)
  })
})

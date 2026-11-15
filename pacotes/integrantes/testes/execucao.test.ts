import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { comEscritorio, contextoDeIntegrante, decidirMemoria, type Sql } from '@heild/processos'
import { aprenderComCartao, iniciarPeloIntegrante, integranteDp, integranteFiscal } from '../src/index.ts'
import { documento, esperar, lerExecucao, montar, pessoa, RESPOSTAS_SIMULADAS, semear, sqlAdmin } from './ambiente.ts'

/** Execução dos integrantes: limite por setor, prioridade, isolamento, bolsa, roteamento opcional e memória. */

let admin: Sql
let h: Awaited<ReturnType<typeof montar>>

beforeAll(async () => {
  admin = sqlAdmin()
  h = await montar()
})
afterAll(async () => {
  await h.parar()
  await admin.end()
})

/** Segura o operário de um contrato até `soltar()`: as execuções ficam "rodando". */
function segurar(contrato: string) {
  let soltar!: () => void
  const portao = new Promise<void>((r) => (soltar = r))
  h.fornecedor.responder(contrato, async (e: unknown) => {
    await portao
    return RESPOSTAS_SIMULADAS[contrato]!(e)
  })
  return () => {
    soltar()
    h.fornecedor.responder(contrato, RESPOSTAS_SIMULADAS[contrato]!)
  }
}

const estados = (esc: string) => admin`select estado, count(*)::int as n from execucao where escritorio_id = ${esc} group by estado`

describe('fila do integrante compartilhado', () => {
  it('limite de 10 execuções simultâneas por setor (do contrato do integrante); o excedente espera com posição', async () => {
    const s = await semear(admin, { executa_sozinho: ['DP-EVENTO-FOLHA'], bolsa_centavos: 10_000 })
    expect(await admin`select maximo from limite_execucao where escritorio_id = ${s.esc} and escopo = 'setor' and chave = 'dp'`).toEqual([{ maximo: 10 }])
    const soltar = segurar('dp.evento.classificar')
    try {
      const ids: string[] = []
      for (let i = 0; i < 12; i++) {
        const doc = await documento(admin, s, 'mensagem', { texto_extraido: `O Pedro fez ${i + 1} horas extras em 10/2026.` })
        ids.push((await h.motor.iniciar(await pessoa(admin, s.esc, i % 2 ? 'u-ana' : 'u-dp'), 'DP-EVENTO-FOLHA', { cliente_id: 'c-1', documento_id: doc })).execucao_id)
      }
      await esperar(() => estados(s.esc), (r) => r.find((x) => x.estado === 'aguardando_operario')?.n === 10 && r.find((x) => x.estado === 'pendente')?.n === 2)
      const esperando = (await admin`select id from execucao where escritorio_id = ${s.esc} and estado = 'pendente' order by criado_em`).map((x) => x.id as string)
      const ob = await h.motor.obter(await pessoa(admin, s.esc, 'u-gestora'), esperando[0]!)
      expect(ob.posicao_na_fila).toBe(1)
      expect(ids).toHaveLength(12)
      soltar()
      // Isolamento: cada execução terminou com a sua própria quantidade (nada misturado).
      await esperar(() => estados(s.esc), (r) => r.length === 1 && r[0]!.estado === 'concluida')
      const saidas = await admin`select saida from execucao where escritorio_id = ${s.esc}`
      expect(new Set(saidas.map((x) => x.saida.decisao.quantidade)).size).toBe(12)
    } finally {
      soltar()
    }
  })

  it('prioridade: pedido no chat passa na frente de evento, que passa na frente de job', async () => {
    const s = await semear(admin, { executa_sozinho: ['DP-EVENTO-FOLHA'], bolsa_centavos: 10_000 })
    await admin`update limite_execucao set maximo = 1 where escritorio_id = ${s.esc} and escopo = 'setor' and chave = 'dp'`
    const soltar = segurar('dp.evento.classificar')
    try {
      const novo = async (origem: 'chat' | 'evento' | 'job', n: number) => {
        const doc = await documento(admin, s, 'mensagem', { texto_extraido: `O Pedro fez ${n} horas extras em 10/2026.` })
        return (await h.motor.iniciar(await pessoa(admin, s.esc, 'u-dp', origem), 'DP-EVENTO-FOLHA', { cliente_id: 'c-1', documento_id: doc })).execucao_id
      }
      const primeiro = await novo('job', 1)
      await esperar(() => lerExecucao(admin, s.esc, primeiro), (e) => e.estado === 'aguardando_operario')
      const job = await novo('job', 2)
      const evento = await novo('evento', 3)
      const chat = await novo('chat', 4)
      soltar()
      await esperar(() => estados(s.esc), (r) => r.length === 1 && r[0]!.estado === 'concluida')
      const ordem = (await admin`select id from execucao where escritorio_id = ${s.esc} and id <> ${primeiro} order by admitida_em`).map((x) => x.id)
      expect(ordem).toEqual([chat, evento, job])
    } finally {
      soltar()
    }
  })

  it('vinte pessoas ao mesmo tempo: vinte execuções isoladas, cada uma com o seu documento e o seu resultado', async () => {
    const s = await semear(admin, { executa_sozinho: ['FIS-CAIXA-POSTAL-TRIAR'], bolsa_centavos: 10_000 })
    const dias = Array.from({ length: 20 }, (_, i) => String(i + 1).padStart(2, '0'))
    const ids = await Promise.all(
      dias.map(async (d, i) => {
        const doc = await documento(admin, s, 'mensagem_ecac', { texto_extraido: `Termo de Intimação. Apresentar até ${d}/12/2026.` })
        const r = await h.motor.iniciar(await pessoa(admin, s.esc, i % 2 ? 'u-ana' : 'u-fiscal'), 'FIS-CAIXA-POSTAL-TRIAR', { cliente_id: 'c-1', documento_id: doc })
        return { id: r.execucao_id, doc, prazo: `2026-12-${d}` }
      }),
    )
    await esperar(() => estados(s.esc), (r) => r.length === 1 && r[0]!.estado === 'concluida', 60_000)
    for (const x of ids) {
      const ex = await lerExecucao(admin, s.esc, x.id)
      expect(ex.saida).toEqual({ documento_id: x.doc, decisao: { categoria: 'intimacao', prazo: x.prazo }, origem: 'modelo' })
    }
    // A entrada do operário de uma execução não carrega nada de outra.
    const entradas = h.fornecedor.chamadas.filter((c) => c.contrato === 'fis.caixa_postal.classificar').slice(-20)
    for (const c of entradas) expect((c.entrada as { dados: { prazos: string[] } }).dados.prazos).toHaveLength(1)
  })
})

describe('integrante: pacote, bolsa e roteamento opcional', () => {
  it('o integrante só inicia procedimento do próprio pacote (não improvisa fluxo)', async () => {
    const s = await semear(admin)
    const ctx = await comEscritorio(admin, s.esc, (tx) => contextoDeIntegrante(tx, s.esc, 'i-dp', 'evento'))
    await expect(iniciarPeloIntegrante(h.motor, ctx, integranteDp, 'FIS-GUIA-CONFERIR', {})).rejects.toThrow(/não tem o procedimento/)
  })

  it('"Para quem quer rotear esta atividade?": no evento do Fiscal, a pessoa escolhida vira responsável e recebe o cartão; o custo sai da bolsa do setor', async () => {
    const s = await semear(admin)
    const doc = await documento(admin, s, 'guia', { texto_extraido: 'DAS do Simples Nacional. Período de apuração: 10/2026.', valor_centavos: 500, apuracao: { DAS: { '2026-10': 500 } } })
    const ctx = await comEscritorio(admin, s.esc, (tx) => contextoDeIntegrante(tx, s.esc, 'i-fiscal', 'evento'))
    const { execucao_id } = await iniciarPeloIntegrante(h.motor, ctx, integranteFiscal, 'FIS-GUIA-CONFERIR', { cliente_id: 'c-1', documento_id: doc })
    const ex = await lerExecucao(admin, s.esc, execucao_id)
    expect(ex.estado).toBe('aguardando_cartao')
    const [c] = await admin`select id, tipo, opcoes, resumo_humano from cartao_aprovacao where id = ${ex.cartao_id}`
    expect(c).toMatchObject({ tipo: 'escolha_responsavel' })
    expect(c!.resumo_humano).toContain('Para quem quer rotear esta atividade?')
    expect(c!.opcoes.map((o: { usuario_id: string }) => o.usuario_id)).toContain('u-fiscal')
    await h.motor.decidirCartao(await pessoa(admin, s.esc, 'u-fiscal'), { cartao_id: c!.id, decisao: 'escolher', escolha: 'u-fiscal' })
    const depois = await esperar(() => lerExecucao(admin, s.esc, execucao_id), (e) => e.estado === 'aguardando_cartao' && e.cartao_id !== c!.id)
    expect(depois).toMatchObject({ responsavel_id: 'u-fiscal', pagador_tipo: 'bolsa_setor' })
    const [aprov] = await admin`select pode_aprovar from cartao_aprovacao where id = ${depois.cartao_id}`
    expect(aprov!.pode_aprovar).toEqual(['u-fiscal'])
    const [b] = await admin`select gasto_centavos from bolsa_setor where escritorio_id = ${s.esc} and setor = 'fiscal'`
    const [cm] = await admin`select centavos from chamada_modelo where execucao_id = ${execucao_id}`
    expect(b!.gasto_centavos).toBeCloseTo(cm!.centavos, 6)
    expect(Number.isInteger(cm!.centavos)).toBe(false)
  })
})

describe('memória do setor só muda por proposta aprovada', () => {
  it('a correção da pessoa no cartão "não consegui" vira proposta; o integrante não decide; quem gere aprova', async () => {
    const s = await semear(admin)
    const doc = await documento(admin, s, 'mensagem', { texto_extraido: 'Na folha de 10/2026: o Pedro fez 5 horas extras e a Ana faltou 1 dia.' })
    const ana = await pessoa(admin, s.esc, 'u-dp')
    const { execucao_id } = await h.motor.iniciar(ana, 'DP-EVENTO-FOLHA', { cliente_id: 'c-1', documento_id: doc })
    const ex = await esperar(() => lerExecucao(admin, s.esc, execucao_id), (e) => e.estado === 'aguardando_cartao')
    const [nc] = await admin`select tipo from cartao_aprovacao where id = ${ex.cartao_id}`
    expect(nc!.tipo).toBe('nao_consegui')
    await expect(aprenderComCartao(admin, h.eventos, ana, execucao_id)).rejects.toThrow(/Não há correção/)
    await h.motor.decidirCartao(ana, { cartao_id: ex.cartao_id, decisao: 'editar', argumentos_editados: { tipo_evento: 'hora_extra', competencia: '2026-10', quantidade: '5', confianca: 1, motivo: 'A falta vai em outro pedido.' } })
    await esperar(() => lerExecucao(admin, s.esc, execucao_id), (e) => e.estado !== 'executando' && e.cartao_id !== ex.cartao_id)

    const proposta = await aprenderComCartao(admin, h.eventos, ana, execucao_id)
    const [c] = await admin`select tipo, pode_aprovar, argumentos from cartao_aprovacao where id = ${proposta.id}`
    expect(c!.tipo).toBe('memoria')
    expect(c!.pode_aprovar).not.toContain('u-dp')
    expect(await admin`select 1 from memoria_setor where escritorio_id = ${s.esc}`).toHaveLength(0)
    // O integrante não decide; a própria colaboradora também não.
    const integrante = await comEscritorio(admin, s.esc, (tx) => contextoDeIntegrante(tx, s.esc, 'i-dp', 'chat'))
    await expect(decidirMemoria(admin, h.eventos, integrante, { cartao_id: proposta.id, decisao: 'aprovar' })).rejects.toThrow()
    await expect(decidirMemoria(admin, h.eventos, ana, { cartao_id: proposta.id, decisao: 'aprovar' })).rejects.toThrow()
    await decidirMemoria(admin, h.eventos, await pessoa(admin, s.esc, 'u-gestora'), { cartao_id: proposta.id, decisao: 'aprovar' })
    const [m] = await admin`select chave, valor, origem_cartao_id from memoria_setor where escritorio_id = ${s.esc}`
    expect(m!.chave).toMatch(/^correcao:DP-EVENTO-FOLHA:/)
    expect(m!.origem_cartao_id).toBe(proposta.id)
    expect(c!.argumentos.valor.decisao.quantidade).toBe('5')
  })
})

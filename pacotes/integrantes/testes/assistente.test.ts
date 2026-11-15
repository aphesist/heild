import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { hashDe, type Sql } from '@heild/processos'
import { responderExecucao, RespostaPadrao, type RespostaAssistente } from '../src/index.ts'
import { documento, esperar, montar, pessoa, RESPOSTAS_SIMULADAS, semear, sqlAdmin } from './ambiente.ts'

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

const obterAte = async (esc: string, usuario: string, pedido_id: string, ok: (r: RespostaAssistente) => boolean) =>
  esperar(async () => h.assistente.obter(await pessoa(admin, esc, usuario), pedido_id), ok)

describe('ponta a ponta: chat → roteamento → integrante → procedimento → cartão → aprovação → resposta padrão → Assistente', () => {
  it('por regra: o Assistente encaminha ao Fiscal e devolve a resposta do integrante sem reescrever', async () => {
    const s = await semear(admin)
    const doc = await documento(admin, s, 'guia', { texto_extraido: 'DAS do Simples Nacional. Período de apuração: 10/2026.', valor_centavos: 123456, apuracao: { DAS: { '2026-10': 123456 } } })
    const ana = await pessoa(admin, s.esc, 'u-ana')
    const r0 = await h.assistente.pedir(ana, { texto: 'Confere essa guia antes de mandar ao cliente.', anexos: { documento_id: doc } })
    expect(r0).toMatchObject({ estado: 'encaminhado', encaminhado_para: { integrante_id: 'i-fiscal', setor: 'fiscal' }, roteamento: { camada: 'regra', procedimento: 'FIS-GUIA-CONFERIR', confianca: 1 } })

    // O integrante chega ao cartão; a resposta padrão traz a ação para a pessoa.
    const r1 = await obterAte(s.esc, 'u-ana', r0.pedido_id, (r) => r.resposta.tipo === 'aguardando_aprovacao')
    expect(RespostaPadrao.parse(r1.resposta)).toEqual(r1.resposta)
    expect(r1.resposta).toMatchObject({ de: { tipo: 'integrante', id: 'i-fiscal' }, acao: { tipo: 'aprovacao' }, confianca: 0.95, escalou: false })
    expect(r1.resposta.cartoes[0]).toMatchObject({ tipo: 'tabela', titulo: 'Guia conferida' })
    expect(r1.resposta.custo.chamadas).toBe(1)

    // Encaminhar sem reescrever: o objeto do Assistente é idêntico ao do integrante.
    const doIntegrante = await responderExecucao(admin, h.motor, ana, r1.resposta.origem.execucao_id!, r0.pedido_id)
    expect(hashDe(r1.resposta)).toBe(hashDe(doIntegrante))

    // A pessoa aprova; a resposta final continua sendo a do integrante, no formato do processo.
    await h.motor.decidirCartao(ana, { cartao_id: r1.resposta.acao!.cartao_id, decisao: 'aprovar' })
    const r2 = await obterAte(s.esc, 'u-ana', r0.pedido_id, (r) => r.resposta.tipo === 'concluido')
    expect(r2.resposta).toMatchObject({ titulo: 'Guia de DAS de 2026-10 enviada', dados: { tributo: 'DAS', competencia: '2026-10' }, origem: { pedido_id: r0.pedido_id } })
    expect(r2.resposta.texto).toBe('Conferi a guia de DAS da competência 2026-10 com a apuração e enviei ao cliente.')

    // Cada decisão de roteamento está na cadeia, sem o texto do pedido (só hash e tamanho).
    const evs = await admin`select nome, argumentos_resumo from evento where escritorio_id = ${s.esc} and nome in ('assistente.pedir', 'assistente.rotear') order by seq`
    expect(evs.map((e) => e.nome)).toEqual(['assistente.pedir', 'assistente.rotear'])
    expect(evs[1]!.argumentos_resumo).toMatchObject({ camada: 'regra', procedimento: 'FIS-GUIA-CONFERIR', estado: 'encaminhado' })
    expect(JSON.stringify(evs)).not.toContain('Confere essa guia')
  })

  it('com modelo: as regras não decidem, o barato decide pela fila, e o custo sai em frações de centavo da bolsa do roteamento', async () => {
    const s = await semear(admin, { executa_sozinho: ['DP-EVENTO-FOLHA'] })
    const doc = await documento(admin, s, 'mensagem', { texto_extraido: 'O Pedro fez 10 horas extras em 10/2026.' })
    const r0 = await h.assistente.pedir(await pessoa(admin, s.esc, 'u-ana'), { texto: 'Ele trabalhou além do horário no sábado; isso entra no pagamento do mês.', anexos: { documento_id: doc } })
    expect(r0.estado).toBe('roteando')
    expect(r0.resposta).toMatchObject({ de: { tipo: 'assistente' }, tipo: 'em_execucao' })
    const r1 = await obterAte(s.esc, 'u-ana', r0.pedido_id, (r) => r.resposta.tipo === 'concluido')
    expect(r1).toMatchObject({ roteamento: { camada: 'modelo_barato', procedimento: 'DP-EVENTO-FOLHA' }, encaminhado_para: { setor: 'dp' } })
    expect(r1.resposta.dados).toMatchObject({ tipo_evento: 'hora_extra', competencia: '2026-10', quantidade: '10' })
    const [p] = await admin`select centavos, tentativas from pedido_assistente where id = ${r0.pedido_id}`
    expect(p!.tentativas.map((t: { camada: string }) => t.camada)).toEqual(['regra', 'modelo_barato'])
    const [b] = await admin`select gasto_centavos from bolsa_setor where escritorio_id = ${s.esc} and setor = 'assistente'`
    expect(b!.gasto_centavos).toBeCloseTo(Number(p!.centavos), 6)
    expect(Number(p!.centavos)).toBeGreaterThan(0)
  })

  it('barato em dúvida sobe ao caro; os dois em dúvida viram pergunta com opções (nunca um chute)', async () => {
    const s = await semear(admin)
    const doc = await documento(admin, s, 'mensagem', { texto_extraido: 'Oi.' })
    const r0 = await h.assistente.pedir(await pessoa(admin, s.esc, 'u-ana'), { texto: 'Resolve isso aqui pra mim.', anexos: { documento_id: doc } })
    const r1 = await obterAte(s.esc, 'u-ana', r0.pedido_id, (r) => r.estado !== 'roteando')
    expect(r1).toMatchObject({ estado: 'pergunta', encaminhado_para: null, resposta: { tipo: 'pergunta', de: { tipo: 'assistente' } } })
    expect(r1.resposta.opcoes.length).toBeGreaterThan(0)
    const [p] = await admin`select tentativas, execucao_id from pedido_assistente where id = ${r0.pedido_id}`
    expect(p!.tentativas.map((t: { camada: string }) => t.camada)).toEqual(['regra', 'modelo_barato', 'modelo_caro'])
    expect(p!.execucao_id).toBeNull()
  })

  it('o caro decide quando o barato hesita', async () => {
    const s = await semear(admin)
    const chamadas: string[] = []
    h.fornecedor.responder('assistente.rotear', (_e, ped) => {
      chamadas.push(ped.modelo)
      return ped.classe === 'operario'
        ? { procedimento: 'SOC-ALTERACAO-TRIAR', confianca: 0.6, ambiguo: true, motivo: 'Pode ser societário ou atendimento.' }
        : { procedimento: 'SOC-ALTERACAO-TRIAR', confianca: 0.93, ambiguo: false, motivo: 'Mudança de sede exige alteração.' }
    })
    try {
      const doc = await documento(admin, s, 'mensagem', { texto_extraido: 'Mudança de sede.' })
      const r0 = await h.assistente.pedir(await pessoa(admin, s.esc, 'u-ana'), { texto: 'A empresa vai para outra cidade.', anexos: { documento_id: doc } })
      const r1 = await obterAte(s.esc, 'u-ana', r0.pedido_id, (r) => r.estado !== 'roteando')
      expect(r1).toMatchObject({ estado: 'encaminhado', roteamento: { camada: 'modelo_caro', procedimento: 'SOC-ALTERACAO-TRIAR' } })
      expect(chamadas).toEqual(['demo-operario', 'demo-escritor'])
    } finally {
      h.fornecedor.responder('assistente.rotear', RESPOSTAS_SIMULADAS['assistente.rotear']!)
    }
  })

  it('escolha fora das opções nunca é aceita, mesmo com confiança alta', async () => {
    const s = await semear(admin)
    h.fornecedor.responder('assistente.rotear', () => ({ procedimento: 'FIS-GUIA-CONFERIR', confianca: 0.99, ambiguo: false, motivo: 'Inventou destino que a mensagem não aceita.' }))
    try {
      const doc = await documento(admin, s, 'mensagem', { texto_extraido: 'Oi.' })
      const r0 = await h.assistente.pedir(await pessoa(admin, s.esc, 'u-ana'), { texto: 'Veja isto.', anexos: { documento_id: doc } })
      const r1 = await obterAte(s.esc, 'u-ana', r0.pedido_id, (r) => r.estado !== 'roteando')
      expect(r1.estado).toBe('pergunta')
      const [p] = await admin`select tentativas from pedido_assistente where id = ${r0.pedido_id}`
      expect(p!.tentativas.filter((t: { aceita: boolean }) => t.aceita)).toHaveLength(0)
    } finally {
      h.fornecedor.responder('assistente.rotear', RESPOSTAS_SIMULADAS['assistente.rotear']!)
    }
  })

  it('sem saldo na bolsa do roteamento, nenhum modelo é chamado: vira pergunta', async () => {
    const s = await semear(admin, { bolsa_assistente: 0 })
    const antes = h.fornecedor.chamadas.length
    const doc = await documento(admin, s, 'mensagem', { texto_extraido: 'Oi.' })
    const r0 = await h.assistente.pedir(await pessoa(admin, s.esc, 'u-ana'), { texto: 'Resolve isso aqui pra mim.', anexos: { documento_id: doc } })
    const r1 = await obterAte(s.esc, 'u-ana', r0.pedido_id, (r) => r.estado !== 'roteando')
    expect(r1.estado).toBe('pergunta')
    expect(h.fornecedor.chamadas.slice(antes).filter((c) => c.contrato === 'assistente.rotear')).toHaveLength(0)
  })

  it('falta anexo: pergunta qual; pedido sem permissão: negado; o pedido é privado de quem pediu', async () => {
    const s = await semear(admin)
    const ana = await pessoa(admin, s.esc, 'u-ana')
    const semDoc = await h.assistente.pedir(ana, { texto: 'Classifique a competência deste recibo.' })
    expect(semDoc).toMatchObject({ estado: 'pergunta', resposta: { tipo: 'pergunta', titulo: 'Falta um anexo', dados: { falta: 'cliente_id,documento_id' } } })

    const doc = await documento(admin, s, 'guia', { texto_extraido: 'DAS 10/2026' })
    const dora = await pessoa(admin, s.esc, 'u-dp')
    // A Dora (só DP) não tem a guia como opção: as regras não acham destino que ela possa pedir.
    const r = await h.assistente.pedir(dora, { texto: 'Confere essa guia.', anexos: { documento_id: doc } })
    const fim = await obterAte(s.esc, 'u-dp', r.pedido_id, (x) => x.estado !== 'roteando')
    expect(fim.encaminhado_para).toBeNull()
    expect(await admin`select 1 from execucao where escritorio_id = ${s.esc}`).toHaveLength(0)

    await expect(h.assistente.obter(dora, semDoc.pedido_id)).rejects.toThrow(/outra pessoa/)
    await expect(h.assistente.pedir({ ...ana, ator: { tipo: 'integrante', id: 'i-fiscal' } } as never, { texto: 'x' })).rejects.toThrow(/Só uma pessoa/)
  })

  it('a mesma chave devolve o mesmo pedido; com outro texto, conflito', async () => {
    const s = await semear(admin)
    const ana = await pessoa(admin, s.esc, 'u-ana')
    const doc = await documento(admin, s, 'guia', { texto_extraido: 'DAS do Simples Nacional. Período de apuração: 10/2026.', valor_centavos: 1, apuracao: { DAS: { '2026-10': 1 } } })
    const a = await h.assistente.pedir(ana, { texto: 'Confere a guia.', anexos: { documento_id: doc }, chave_idempotencia: 'chave-teste-0001' })
    const b = await h.assistente.pedir(ana, { texto: 'Confere a guia.', anexos: { documento_id: doc }, chave_idempotencia: 'chave-teste-0001' })
    expect(b.pedido_id).toBe(a.pedido_id)
    expect(await admin`select 1 from execucao where escritorio_id = ${s.esc}`).toHaveLength(1)
    await expect(h.assistente.pedir(ana, { texto: 'Outro texto.', chave_idempotencia: 'chave-teste-0001' })).rejects.toThrow(/IDEMPOTENCIA|outro pedido/)
  })

  it('pelo registro de ferramentas (a mesma porta da API): assistente.pedir e assistente.obter', async () => {
    const s = await semear(admin)
    const ana = await pessoa(admin, s.esc, 'u-ana')
    const doc = await documento(admin, s, 'mensagem_ecac', { texto_extraido: 'Termo de Intimação. Prazo até 30/11/2026.' })
    const env = await h.registro.chamar(ana, 'assistente.pedir', { texto: 'Chegou na caixa postal do e-CAC.', anexos: { documento_id: doc } })
    expect(env.resultado).toBe('ok')
    const pedido_id = (env as { dados: RespostaAssistente }).dados.pedido_id
    const env2 = await h.registro.chamar(ana, 'assistente.obter', { pedido_id })
    expect((env2 as { dados: RespostaAssistente }).dados.encaminhado_para?.setor).toBe('fiscal')
    expect(await h.registro.chamar(ana, 'assistente.pedir', { texto: 'x', campo_novo: 1 })).toMatchObject({ resultado: 'erro', codigo: 'ENTRADA_INVALIDA' })
  })
})

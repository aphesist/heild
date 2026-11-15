import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { comEscritorio, type Sql } from '@heild/processos'
import { documento, esperar, lerExecucao, montar, pessoa, RESPOSTAS_SIMULADAS, semear, sqlAdmin } from './ambiente.ts'

/** Os procedimentos novos dos setores, de ponta a ponta no motor, com o operário simulado. */

let admin: Sql
let h: Awaited<ReturnType<typeof montar>>
const terminal = (e: { estado: string }) => ['concluida', 'aguardando_cartao', 'falhou', 'cancelada', 'parcial'].includes(e.estado)

beforeAll(async () => {
  admin = sqlAdmin()
  h = await montar()
})
afterAll(async () => {
  await h.parar()
  await admin.end()
})

async function rodar(esc: string, usuario: string, proc: string, documento_id: string) {
  const { execucao_id } = await h.motor.iniciar(await pessoa(admin, esc, usuario), proc, { cliente_id: 'c-1', documento_id })
  return esperar(() => lerExecucao(admin, esc, execucao_id), terminal)
}

describe('Fiscal', () => {
  it('FIS-GUIA-CONFERIR: o operário identifica, o código confere o valor, o envio pede cartão SEMPRE e sai com os argumentos aprovados', async () => {
    const s = await semear(admin, { executa_sozinho: ['FIS-GUIA-CONFERIR'] })
    const doc = await documento(admin, s, 'guia', { texto_extraido: 'DAS do Simples Nacional. Período de apuração: 10/2026.', valor_centavos: 123456, apuracao: { DAS: { '2026-10': 123456 } } })
    const ex = await rodar(s.esc, 'u-fiscal', 'FIS-GUIA-CONFERIR', doc)
    // Mesmo com "executa sozinho", enviar ao cliente é irreversível: cartão.
    expect(ex.estado).toBe('aguardando_cartao')
    const [c] = await admin`select * from cartao_aprovacao where id = ${ex.cartao_id}`
    expect(c!.ferramenta).toBe('fiscal.guia.enviar')
    expect(c!.argumentos).toMatchObject({ documento_id: doc, tributo: 'DAS', competencia: '2026-10' })
    expect(c!.resumo_humano).toContain('R$')
    // O próprio integrante não decide; quem pediu decide.
    await h.motor.decidirCartao(await pessoa(admin, s.esc, 'u-fiscal'), { cartao_id: c!.id, decisao: 'aprovar' })
    const fim = await esperar(() => lerExecucao(admin, s.esc, ex.id), (e) => e.estado === 'concluida')
    expect(fim.saida).toEqual({ documento_id: doc, decisao: { tributo: 'DAS', competencia: '2026-10' }, origem: 'modelo' })
    const [d] = await admin`select metadados from documento where id = ${doc}`
    expect(d!.metadados.guia_conferida).toMatchObject({ tributo: 'DAS', competencia: '2026-10', origem: 'modelo' })
    const [ev] = await admin`select aprovacao_id from evento where execucao_id = ${ex.id} and ferramenta = 'fiscal.guia.enviar' and resultado = 'ok'`
    expect(ev!.aprovacao_id).toBe(c!.id)
  })

  it('revisor de risco (Opus) antes do envio: devolve com motivo → cartão "não consegui"; a pessoa libera com motivo e o cartão de envio segue', async () => {
    const s = await semear(admin)
    const modelos: string[] = []
    h.fornecedor.responder('revisor.ato_irreversivel', (_e, p) => {
      modelos.push(`${p.classe}:${p.modelo}`)
      return { decisao: 'devolve', motivo: 'A guia cita duas competências; confirme a de apuração.' }
    })
    try {
      const doc = await documento(admin, s, 'guia', { texto_extraido: 'DAS do Simples Nacional. Período de apuração: 10/2026.', valor_centavos: 123456, apuracao: { DAS: { '2026-10': 123456 } } })
      const ex = await rodar(s.esc, 'u-fiscal', 'FIS-GUIA-CONFERIR', doc)
      expect(modelos).toEqual(['revisor:demo-revisor'])
      const [c] = await admin`select id, tipo, resumo_humano from cartao_aprovacao where id = ${ex.cartao_id}`
      expect(c).toMatchObject({ tipo: 'nao_consegui' })
      expect(c!.resumo_humano).toContain('O revisor devolveu: A guia cita duas competências')
      await h.motor.decidirCartao(await pessoa(admin, s.esc, 'u-fiscal'), { cartao_id: c!.id, decisao: 'editar', argumentos_editados: { decisao: 'aprova', motivo: 'Conferi: a apuração é 10/2026.' } })
      const depois = await esperar(() => lerExecucao(admin, s.esc, ex.id), (e) => e.estado === 'aguardando_cartao' && e.cartao_id !== c!.id)
      const [envio] = await admin`select ferramenta, resumo_humano from cartao_aprovacao where id = ${depois.cartao_id}`
      expect(envio!.ferramenta).toBe('fiscal.guia.enviar')
      expect(envio!.resumo_humano).toContain('uma pessoa liberou')
      // O revisor não foi chamado de novo depois da decisão da pessoa.
      expect(modelos).toHaveLength(1)
    } finally {
      h.fornecedor.responder('revisor.ato_irreversivel', RESPOSTAS_SIMULADAS['revisor.ato_irreversivel']!)
    }
  })

  it('FIS-GUIA-CONFERIR: com o código de receita, a regra decide sem modelo', async () => {
    const s = await semear(admin)
    const antes = h.fornecedor.chamadas.length
    const doc = await documento(admin, s, 'guia', { texto_extraido: 'DARF', codigo_receita: '2089', competencia: '2026-09', valor_centavos: 870000, apuracao: { IRPJ: { '2026-09': 870000 } } })
    const ex = await rodar(s.esc, 'u-fiscal', 'FIS-GUIA-CONFERIR', doc)
    expect(ex.estado).toBe('aguardando_cartao')
    expect(h.fornecedor.chamadas.slice(antes).filter((c) => c.contrato === 'fis.guia.identificar' && (c.entrada as { dados: { trecho?: { conteudo: string } } }).dados.trecho?.conteudo === 'DARF')).toHaveLength(0)
    // Nenhum operário: a única chamada é a do revisor de risco, antes do envio ao cliente.
    expect(await admin`select classe from chamada_modelo where execucao_id = ${ex.id}`).toEqual([{ classe: 'revisor' }])
  })

  it('FIS-GUIA-CONFERIR: valor que não bate com a apuração nunca chega ao envio (cartão "não consegui", sem escalar)', async () => {
    const s = await semear(admin)
    const doc = await documento(admin, s, 'guia', { texto_extraido: 'DAS do Simples Nacional. Período de apuração: 10/2026.', valor_centavos: 100000, apuracao: { DAS: { '2026-10': 123456 } } })
    const ex = await rodar(s.esc, 'u-fiscal', 'FIS-GUIA-CONFERIR', doc)
    const [c] = await admin`select tipo, resumo_humano from cartao_aprovacao where id = ${ex.cartao_id}`
    expect(c).toMatchObject({ tipo: 'nao_consegui' })
    expect(c!.resumo_humano).toContain('apuração')
    // Regra dura não escala ao escritor: uma chamada só.
    expect(await admin`select classe from chamada_modelo where execucao_id = ${ex.id}`).toEqual([{ classe: 'operario' }])
  })

  it('FIS-CAIXA-POSTAL-TRIAR: classifica e registra o prazo tirado do texto (por regra do escritório, sem cartão)', async () => {
    const s = await semear(admin, { executa_sozinho: ['FIS-CAIXA-POSTAL-TRIAR'] })
    const doc = await documento(admin, s, 'mensagem_ecac', { texto_extraido: 'Termo de Intimação Fiscal. Apresentar os livros até 30/11/2026.' })
    const ex = await rodar(s.esc, 'u-fiscal', 'FIS-CAIXA-POSTAL-TRIAR', doc)
    expect(ex.estado).toBe('concluida')
    expect(ex.saida.decisao).toEqual({ categoria: 'intimacao', prazo: '2026-11-30' })
  })

  it('pessoa sem o setor não inicia (a mesma autorizar), e a tentativa fica na trilha', async () => {
    const s = await semear(admin)
    const doc = await documento(admin, s, 'guia', { texto_extraido: 'DAS 10/2026' })
    await expect(h.motor.iniciar(await pessoa(admin, s.esc, 'u-dp'), 'FIS-GUIA-CONFERIR', { cliente_id: 'c-1', documento_id: doc })).rejects.toThrow()
    expect(await admin`select 1 from evento where escritorio_id = ${s.esc} and resultado = 'negado'`).toHaveLength(1)
  })
})

describe('DP, Societário e Atendimento', () => {
  it('DP-EVENTO-FOLHA: tipo, competência e quantidade escolhidos entre as opções do texto', async () => {
    const s = await semear(admin, { executa_sozinho: ['DP-EVENTO-FOLHA'] })
    const doc = await documento(admin, s, 'mensagem', { texto_extraido: 'O Pedro fez 10 horas extras em 10/2026.' })
    const ex = await rodar(s.esc, 'u-dp', 'DP-EVENTO-FOLHA', doc)
    expect(ex.estado).toBe('concluida')
    expect(ex.saida.decisao).toEqual({ tipo_evento: 'hora_extra', competencia: '2026-10', quantidade: '10' })
  })

  it('DP-EVENTO-FOLHA: quantidade inventada pelo modelo é barrada, escala uma vez e termina no cartão', async () => {
    const s = await semear(admin)
    h.fornecedor.responder('dp.evento.classificar', () => ({ tipo_evento: 'hora_extra', competencia: '2026-10', quantidade: '12', confianca: 0.97, motivo: 'Inventou.' }))
    try {
      const doc = await documento(admin, s, 'mensagem', { texto_extraido: 'O Pedro fez 10 horas extras em 10/2026.' })
      const ex = await rodar(s.esc, 'u-dp', 'DP-EVENTO-FOLHA', doc)
      const [c] = await admin`select tipo from cartao_aprovacao where id = ${ex.cartao_id}`
      expect(c!.tipo).toBe('nao_consegui')
      expect((await admin`select classe from chamada_modelo where execucao_id = ${ex.id} order by criado_em`).map((x) => x.classe)).toEqual(['operario', 'escritor'])
    } finally {
      h.fornecedor.responder('dp.evento.classificar', RESPOSTAS_SIMULADAS['dp.evento.classificar']!)
    }
  })

  it('SOC-ALTERACAO-TRIAR: classifica e o código decide a Junta; sem "executa sozinho", pede cartão', async () => {
    const s = await semear(admin)
    const doc = await documento(admin, s, 'mensagem', { texto_extraido: 'Queremos mudar o endereço da sede.' })
    const ex = await rodar(s.esc, 'u-ana', 'SOC-ALTERACAO-TRIAR', doc)
    expect(ex.estado).toBe('aguardando_cartao')
    const [c] = await admin`select resumo_humano, ferramenta from cartao_aprovacao where id = ${ex.cartao_id}`
    expect(c).toMatchObject({ ferramenta: 'legalizacao.abrir_processo' })
    expect(c!.resumo_humano).toContain('Junta')
  })

  it('GES-FAQ-RESPONDER: a resposta que vai ao cliente é o texto aprovado da base, com cartão sempre', async () => {
    const s = await semear(admin, { executa_sozinho: ['GES-FAQ-RESPONDER'] })
    const doc = await documento(admin, s, 'mensagem', { texto_extraido: 'Pode me mandar a segunda via do boleto?' })
    const ex = await rodar(s.esc, 'u-ana', 'GES-FAQ-RESPONDER', doc)
    expect(ex.estado).toBe('aguardando_cartao')
    const [c] = await admin`select argumentos, ferramenta, extras from cartao_aprovacao where id = ${ex.cartao_id}`
    expect(c!.ferramenta).toBe('conversa.responder')
    expect(c!.argumentos.faq_id).toBe('segunda_via_boleto')
    expect(c!.argumentos.extras.resposta).toContain('Financeiro › Boletos')
  })

  it('GES-FAQ-RESPONDER: a base vem da memória do setor quando há uma aprovada', async () => {
    const s = await semear(admin)
    const faq = [{ id: 'pix', pergunta: 'Aceitam Pix?', palavras: ['pix'], resposta: 'Sim, a chave Pix está no boleto.' }]
    await comEscritorio(admin, s.esc, (tx) => tx`insert into memoria_setor (escritorio_id, setor, chave, valor, versao) values (${s.esc}, 'gestao_atendimento', 'faq', ${tx.json(faq as never)}, 1)`)
    const doc = await documento(admin, s, 'mensagem', { texto_extraido: 'Vocês aceitam Pix?' })
    const ex = await rodar(s.esc, 'u-ana', 'GES-FAQ-RESPONDER', doc)
    const [c] = await admin`select argumentos from cartao_aprovacao where id = ${ex.cartao_id}`
    expect(c!.argumentos).toMatchObject({ faq_id: 'pix', extras: { resposta: 'Sim, a chave Pix está no boleto.' } })
  })
})

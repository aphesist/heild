import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { comEscritorio, type Sql } from '@heild/processos'
import { documento, esperar, lerExecucao, montar, pessoa, semear, sqlAdmin, type Semente } from './ambiente.ts'

/**
 * Envio ao cliente configurável por categoria (subplano 02, adendo de 15/11/2026): cartão (padrão),
 * envio automático ou desligado, escolhido pelo Administrador; FIS-GUIA e GES-FAQ leem o modo.
 */

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

/** Mensagem do cliente numa conversa, com o documento que o FAQ lê ligado a ela. */
async function perguntaNaConversa(s: Semente, texto: string) {
  const { conversa_id, mensagem_id } = await comEscritorio(admin, s.esc, async (tx) => {
    const [c] = await tx`insert into conversa (escritorio_id, cliente_id, setor_id, status, canal_resposta_atual, ultima_mensagem_em) values (${s.esc}, 'c-1', 'gestao_atendimento', 'nova', 'whatsapp', now()) returning id`
    const [m] = await tx`insert into mensagem (escritorio_id, conversa_id, direcao, canal, autor_tipo, corpo) values (${s.esc}, ${c!.id}, 'entrada', 'whatsapp', 'pessoa', ${texto}) returning id`
    return { conversa_id: c!.id as string, mensagem_id: m!.id as string }
  })
  const doc = await documento(admin, s, 'mensagem', { texto_extraido: texto })
  await admin`update documento set mensagem_id = ${mensagem_id} where id = ${doc}`
  return { conversa_id, doc }
}

const configurar = async (s: Semente, usuario: string, categoria: string, modo: string) => h.registro.chamar(await pessoa(admin, s.esc, usuario), 'envio_cliente.configurar', { categoria, modo })

describe('configuração do envio por categoria', () => {
  it('toda categoria começa em cartão; só o Administrador muda, e a mudança vai à cadeia', async () => {
    const s = await semear(admin)
    const lista = await h.registro.chamar(await pessoa(admin, s.esc, 'u-ana'), 'envio_cliente.listar', {})
    expect(lista).toMatchObject({ resultado: 'ok' })
    const dados = (lista as { dados: { categoria: string; modo: string }[] }).dados
    expect(dados.map((d) => d.modo)).toEqual(dados.map(() => 'cartao'))
    expect(dados.map((d) => d.categoria)).toEqual(expect.arrayContaining(['guia_emitida', 'resposta_factual', 'tarefa_concluida']))

    expect(await configurar(s, 'u-ana', 'resposta_factual', 'automatico')).toMatchObject({ resultado: 'negado' })
    expect(await configurar(s, 'u-admin', 'resposta_factual', 'automatico')).toMatchObject({ resultado: 'ok', dados: { categoria: 'resposta_factual', modo: 'automatico' } })
    expect(await configurar(s, 'u-admin', 'categoria_inventada', 'automatico')).toMatchObject({ resultado: 'erro', codigo: 'ENTRADA_INVALIDA' })
    const [esc] = await admin`select configuracao from escritorio where id = ${s.esc}`
    expect(esc!.configuracao.envio_ao_cliente).toEqual({ resposta_factual: 'automatico' })
    const [ev] = await admin`select texto from evento where escritorio_id = ${s.esc} and ferramenta = 'envio_cliente.configurar' and resultado = 'ok'`
    expect(ev!.texto).toContain('em envio automático')
  })
})

describe('GES-FAQ-RESPONDER v3 e FIS-GUIA-CONFERIR v3 leem o modo da categoria', () => {
  it('padrão (cartão): aprovar executa o envio na conversa do cliente, com o prefixo de quem fala', async () => {
    const s = await semear(admin)
    const { conversa_id, doc } = await perguntaNaConversa(s, 'Pode me mandar a segunda via do boleto?')
    const ex = await rodar(s.esc, 'u-ana', 'GES-FAQ-RESPONDER', doc)
    expect(ex.estado).toBe('aguardando_cartao')
    expect(await admin`select 1 from mensagem where conversa_id = ${conversa_id} and direcao = 'saida'`).toHaveLength(0)
    await h.motor.decidirCartao(await pessoa(admin, s.esc, 'u-ana'), { cartao_id: ex.cartao_id!, decisao: 'aprovar' })
    await esperar(() => lerExecucao(admin, s.esc, ex.id), (e) => e.estado === 'concluida')
    const [m] = await admin`select autor_tipo, corpo, extras from mensagem where conversa_id = ${conversa_id} and direcao = 'saida'`
    expect(m).toMatchObject({ autor_tipo: 'integrante', extras: { tipo: 'mensagem_padronizada', categoria: 'resposta_factual', modo: 'cartao' } })
    expect(m!.corpo.startsWith('*Atendimento (IA)*\n')).toBe(true)
    expect(m!.corpo).toContain('Financeiro › Boletos')
    const [d] = await admin`select metadados from documento where id = ${doc}`
    expect(d!.metadados.resposta_faq.envio).toEqual({ categoria: 'resposta_factual', modo: 'cartao', enviada: true })
  })

  it('envio automático: sem cartão, a mensagem padronizada vai à conversa e o evento diz o modo', async () => {
    const s = await semear(admin)
    await configurar(s, 'u-admin', 'resposta_factual', 'automatico')
    const { conversa_id, doc } = await perguntaNaConversa(s, 'Pode me mandar a segunda via do boleto?')
    const ex = await rodar(s.esc, 'u-ana', 'GES-FAQ-RESPONDER', doc)
    expect(ex.estado).toBe('concluida')
    expect(await admin`select 1 from cartao_aprovacao where execucao_id = ${ex.id} and tipo = 'aprovacao'`).toHaveLength(0)
    const [m] = await admin`select corpo, extras from mensagem where conversa_id = ${conversa_id} and direcao = 'saida'`
    expect(m!.extras).toMatchObject({ modo: 'automatico' })
    const [ev] = await admin`select texto from evento where execucao_id = ${ex.id} and ferramenta = 'conversa.responder' and resultado = 'ok'`
    expect(ev!.texto).toContain('mensagem na conversa do cliente (automatico)')
    // O revisor de risco continua antes do envio.
    expect(await admin`select 1 from chamada_modelo where execucao_id = ${ex.id} and classe = 'revisor'`).toHaveLength(1)
  })

  it('desligado: a decisão fica registrada, nada vai ao cliente e o aviso fica com a pessoa', async () => {
    const s = await semear(admin)
    await configurar(s, 'u-admin', 'resposta_factual', 'desligado')
    const { conversa_id, doc } = await perguntaNaConversa(s, 'Pode me mandar a segunda via do boleto?')
    const ex = await rodar(s.esc, 'u-ana', 'GES-FAQ-RESPONDER', doc)
    expect(ex.estado).toBe('concluida')
    expect(await admin`select 1 from mensagem where conversa_id = ${conversa_id} and direcao = 'saida'`).toHaveLength(0)
    const [d] = await admin`select metadados from documento where id = ${doc}`
    expect(d!.metadados.resposta_faq).toMatchObject({ faq_id: 'segunda_via_boleto', envio: { modo: 'desligado', enviada: false } })
  })

  it('a guia em envio automático sai sem cartão; a categoria de outra mensagem não muda o cartão da guia', async () => {
    const s = await semear(admin)
    await configurar(s, 'u-admin', 'resposta_factual', 'automatico')
    const guia = { texto_extraido: 'DAS do Simples Nacional. Período de apuração: 10/2026.', valor_centavos: 123456, apuracao: { DAS: { '2026-10': 123456 } } }
    const ex1 = await rodar(s.esc, 'u-fiscal', 'FIS-GUIA-CONFERIR', await documento(admin, s, 'guia', guia))
    expect(ex1.estado).toBe('aguardando_cartao')
    await configurar(s, 'u-admin', 'guia_emitida', 'automatico')
    const doc = await documento(admin, s, 'guia', guia)
    const ex2 = await rodar(s.esc, 'u-fiscal', 'FIS-GUIA-CONFERIR', doc)
    expect(ex2.estado).toBe('concluida')
    const [d] = await admin`select metadados from documento where id = ${doc}`
    // Guia sem conversa ligada: registra o modo; o envio fica com o CRM.
    expect(d!.metadados.guia_conferida).toMatchObject({ tributo: 'DAS', envio: { categoria: 'guia_emitida', modo: 'automatico', enviada: false } })
  })
})

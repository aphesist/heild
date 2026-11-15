import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { api, banco, entrar, ferramenta, operacao } from './ajuda.ts'

/**
 * Decisão (a) do Enzo, 15/11/2026: aprovar um cartão do executor EXECUTA a ação guardada
 * (encaixe 4 da B1). Exatamente o comando guardado, conferido pelo hash, uma vez só, com evento
 * na cadeia; se o estado mudou desde o cartão, recusa com erro acionável e um cartão novo.
 * Com `argumentos_editados` (Fundações 6.4, adendo de 15/11), a pessoa altera antes de aprovar.
 *
 * Semente (esc-andrade): o integrante i-atendimento age em nome da Fernanda (u1, Administradora);
 * mandar mensagem ao cliente (conversa.responder) é irreversível: pede cartão.
 */

const app = api()
let adm: string, joao: string

beforeAll(async () => {
  adm = await entrar(app, { escritorio_id: 'esc-andrade' })
  joao = await entrar(app, { escritorio_id: 'esc-andrade', usuario_id: 'u2' })
})
afterAll(() => app.close())

const conversa = async () => {
  const [cv] = await banco()`select id from conversa where escritorio_id = 'esc-andrade' order by id limit 1`
  return String(cv.id)
}
const mensagensCom = async (corpo: string) => {
  const [r] = await banco()`select count(*)::int as n from mensagem where escritorio_id = 'esc-andrade' and corpo = ${corpo}`
  return r.n as number
}
/** O integrante pede para mandar a mensagem: volta o cartão (202). */
async function pedir(corpo: string) {
  const r = await operacao(app, adm, { tipo: 'operacao', operacao: 'mensagens.criar', argumentos: [{ conversa_id: await conversa(), direcao: 'saida', canal: 'whatsapp', autor_tipo: 'integrante', corpo, origem_externa: false }] }, { integrante: 'i-atendimento' })
  expect(r.status).toBe(202)
  return String(r.corpo.cartao_id)
}
const cartao = async (id: string) => (await banco()`select * from cartao_aprovacao where escritorio_id = 'esc-andrade' and id = ${id}`)[0]
const decidir = (token: string, entrada: Record<string, unknown>) => ferramenta(app, token, 'aprovacao.decidir', entrada)

describe('aprovar executa o comando guardado', () => {
  it('o cartão guarda o comando e o hash', async () => {
    const id = await pedir('Guia do DAS em anexo (guardado).')
    const c = await cartao(id)
    expect(c.argumentos_hash).toMatch(/^[0-9a-f]{64}$/)
    expect(c.argumentos).toMatchObject({ rotulo: 'mensagens.criar', comando: { tipo: 'operacao', operacao: 'mensagens.criar' } })
  })

  it('aprovar manda a mensagem como o integrante, uma vez só; o segundo clique recebe a mesma resposta', async () => {
    const texto = 'Segue a guia do DAS de outubro.'
    const id = await pedir(texto)
    expect(await mensagensCom(texto)).toBe(0)
    const r = await decidir(adm, { cartao_id: id, decisao: 'aprovado' })
    expect(r.status).toBe(200)
    expect(r.corpo).toMatchObject({ resultado: 'ok', dados: { cartao_id: id, status: 'aprovado' } })
    expect(await mensagensCom(texto)).toBe(1)
    const c = await cartao(id)
    expect(c).toMatchObject({ status: 'aprovado', decidido_por: 'u1' })
    expect(c.resposta).toBeTruthy()
    // Os eventos (da mensagem e da decisão) levam o cartão; o da mensagem tem o integrante como ator.
    const eventos = await banco()`select ator_tipo, ator_id, resultado, ferramenta from evento where escritorio_id = 'esc-andrade' and aprovacao_id = ${id} order by seq`
    expect(eventos.some((e) => e.ator_tipo === 'integrante' && e.ator_id === 'i-atendimento')).toBe(true)
    expect(eventos.some((e) => e.ator_tipo === 'pessoa' && e.ator_id === 'u1' && e.resultado === 'aprovado' && e.ferramenta === 'aprovacao.decidir')).toBe(true)
    // Duplo clique (outra chave de idempotência): a mesma resposta, sem mandar de novo.
    const de_novo = await decidir(adm, { cartao_id: id, decisao: 'aprovado' })
    expect(de_novo.status).toBe(200)
    expect(de_novo.corpo.evento_id).toBe(r.corpo.evento_id)
    expect(await mensagensCom(texto)).toBe(1)
    // Decisão contrária depois de aprovado: o cartão decidido não muda.
    const contra = await decidir(adm, { cartao_id: id, decisao: 'recusado' })
    expect(contra.status).toBe(422)
    expect(contra.corpo.codigo).toBe('JA_DECIDIDO')
  })

  it('recusar não executa nada', async () => {
    const texto = 'Mensagem que vai ser recusada.'
    const id = await pedir(texto)
    const r = await decidir(adm, { cartao_id: id, decisao: 'recusado', comentario: 'Ainda não é hora.' })
    expect(r.status).toBe(200)
    expect(await mensagensCom(texto)).toBe(0)
    expect(await cartao(id)).toMatchObject({ status: 'recusado', decidido_por: 'u1', comentario: 'Ainda não é hora.' })
  })

  it('só quem está em "pode aprovar" decide (o Gestor de outro setor não)', async () => {
    const id = await pedir('Mensagem do cartão da Fernanda.')
    const r = await decidir(joao, { cartao_id: id, decisao: 'aprovado' })
    expect(r.status).toBe(403)
    expect(r.corpo.codigo).toBe('NEGADO')
    expect((await cartao(id)).status).toBe('pendente')
  })
})

describe('editar antes de aprovar (argumentos_editados)', () => {
  it('a mensagem sai com o texto corrigido; o cartão guarda o que mudou e o evento, a diferença', async () => {
    const original = 'Segue a gia do DAS.'
    const corrigido = 'Segue a guia do DAS de outubro, com vencimento dia 20.'
    const id = await pedir(original)
    const r = await decidir(adm, { cartao_id: id, decisao: 'aprovado', argumentos_editados: { corpo: corrigido } })
    expect(r.status).toBe(200)
    expect(r.corpo.dados).toMatchObject({ status: 'editado_e_aprovado', diferenca: { corpo: { de: original, para: corrigido } } })
    expect(await mensagensCom(corrigido)).toBe(1)
    expect(await mensagensCom(original)).toBe(0)
    const c = await cartao(id)
    expect(c).toMatchObject({ status: 'editado_e_aprovado', argumentos_editados: { corpo: corrigido } })
    const [ev] = await banco()`select nome, argumentos_resumo, texto from evento where escritorio_id = 'esc-andrade' and aprovacao_id = ${id} and ferramenta = 'aprovacao.decidir'`
    expect(ev.nome).toBe('aprovacao.decidir')
    expect(ev.argumentos_resumo).toMatchObject({ diferenca: { corpo: { de: original, para: corrigido } } })
    expect(ev.texto).toMatch(/aprovou com alterações \(corpo\)/)
  })

  it('campo que o integrante não mandou não entra', async () => {
    const id = await pedir('Mensagem com campo extra.')
    const r = await decidir(adm, { cartao_id: id, decisao: 'aprovado', argumentos_editados: { anexo_secreto: 'x' } })
    expect(r.status).toBe(400)
    expect(r.corpo).toMatchObject({ codigo: 'ENTRADA_INVALIDA', campo: 'argumentos_editados.anexo_secreto' })
    expect((await cartao(id)).status).toBe('pendente')
  })
})

describe('o que o cartão não deixa passar', () => {
  it('o estado mudou desde o pedido: não executa, cancela e devolve o cartão novo (409)', async () => {
    const [cb] = await banco()`select id from cobranca where escritorio_id = 'esc-andrade' and situacao not in ('paga', 'cancelada', 'substituida') order by id limit 1`
    const pedido = await operacao(app, adm, { tipo: 'operacao', operacao: 'cobrancas.cancelar', argumentos: [cb.id, 'O cliente pediu para cancelar.'] }, { integrante: 'i-atendimento' })
    expect(pedido.status).toBe(202)
    const id = String(pedido.corpo.cartao_id)
    // O cartão guarda a versão da cobrança que o integrante viu.
    expect((await cartao(id)).argumentos.versoes.cobranca[cb.id]).toBeGreaterThan(0)
    await banco()`update cobranca set atualizado_em = now() where escritorio_id = 'esc-andrade' and id = ${cb.id}`
    const r = await decidir(adm, { cartao_id: id, decisao: 'aprovado' })
    expect(r.status).toBe(409)
    expect(r.corpo.codigo).toBe('VERSAO_DESATUALIZADA')
    const novo = String(r.corpo.detalhes.cartao_novo)
    expect(novo).not.toBe(id)
    expect(r.corpo.acao_sugerida).toMatchObject({ ferramenta: 'aprovacao.decidir', entrada: { cartao_id: novo } })
    const situacao = async () => (await banco()`select situacao from cobranca where escritorio_id = 'esc-andrade' and id = ${cb.id}`)[0].situacao
    expect(await situacao()).not.toBe('cancelada')
    expect((await cartao(id)).status).toBe('cancelado')
    expect((await cartao(novo)).status).toBe('pendente')
    // O cartão novo, com o estado de agora, aprova normalmente.
    expect((await decidir(adm, { cartao_id: novo, decisao: 'aprovado' })).status).toBe(200)
    expect(await situacao()).toBe('cancelada')
  })

  it('comando adulterado depois do cartão (hash não confere): não executa', async () => {
    const id = await pedir('Mensagem original do cartão.')
    await banco()`update cartao_aprovacao set argumentos = jsonb_set(argumentos, '{comando,argumentos,0,corpo}', '"Mensagem trocada por fora."') where escritorio_id = 'esc-andrade' and id = ${id}`
    const r = await decidir(adm, { cartao_id: id, decisao: 'aprovado' })
    expect(r.status).toBe(422)
    expect(r.corpo.mensagem).toMatch(/hash/)
    expect(await mensagensCom('Mensagem trocada por fora.')).toBe(0)
  })
})

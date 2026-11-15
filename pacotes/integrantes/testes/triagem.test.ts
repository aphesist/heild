import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { comEscritorio, type Sql } from '@heild/processos'
import { esperar, lerExecucao, montar, pessoa, semear, sqlAdmin } from './ambiente.ts'

/** GES-TRIAR-REPASSAR: o número único de WhatsApp, triado pelo Atendimento e repassado ao setor certo. */

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

async function conversa(esc: string, mensagens: string[], o: { cliente?: string | null; pessoa?: string } = {}) {
  return comEscritorio(admin, esc, async (tx) => {
    const [c] = await tx`insert into conversa (escritorio_id, cliente_id, pessoa_id, setor_id, status, canal_resposta_atual, ultima_mensagem_em)
                         values (${esc}, ${o.cliente === undefined ? 'c-1' : o.cliente}, ${o.pessoa ?? null}, 'gestao_atendimento', 'nova', 'whatsapp', now()) returning id`
    for (const corpo of mensagens) await tx`insert into mensagem (escritorio_id, conversa_id, direcao, canal, autor_tipo, corpo) values (${esc}, ${c!.id}, 'entrada', 'whatsapp', 'pessoa', ${corpo})`
    return c!.id as string
  })
}

async function triar(esc: string, entrada: Record<string, unknown>) {
  const { execucao_id } = await h.motor.iniciar(await pessoa(admin, esc, 'u-ana'), 'GES-TRIAR-REPASSAR', entrada)
  return esperar(() => lerExecucao(admin, esc, execucao_id), terminal)
}

describe('triar e repassar', () => {
  it('a escolha do menu é respeitada (mesmo com o texto puxando para outro setor), sem modelo; o integrante de destino recebe o resumo', async () => {
    const s = await semear(admin, { executa_sozinho: ['GES-TRIAR-REPASSAR'] })
    const id = await conversa(s.esc, ['Preciso de ajuda com a folha de pagamento.'])
    const ex = await triar(s.esc, { conversa_id: id, menu_escolhido: 'fiscal' })
    expect(ex.saida).toMatchObject({ conversa_id: id, setor: 'fiscal', origem: 'menu', integrante_id: 'i-fiscal', cliente_id: 'c-1' })
    expect(await admin`select 1 from chamada_modelo where execucao_id = ${ex.id}`).toHaveLength(0)
    const [c] = await admin`select setor_id, resumo, etiquetas from conversa where id = ${id}`
    expect(c).toMatchObject({ setor_id: 'fiscal' })
    expect(c!.etiquetas).toContain('triada')
    expect(c!.resumo).toContain('Cliente Padaria Exemplo Ltda. Setor fiscal (escolheu no menu)')
    const [item] = await admin`select integrante_id, tipo, resumo from item_fila where escritorio_id = ${s.esc} and tipo = 'conversa_repassada'`
    expect(item).toMatchObject({ integrante_id: 'i-fiscal', tipo: 'conversa_repassada' })
    expect(item!.resumo.conversa_id).toBe(id)
    // O repasse fica na cadeia de eventos.
    const [ev] = await admin`select texto from evento where execucao_id = ${ex.id} and ferramenta = 'conversa.transferir' and resultado = 'ok'`
    expect(ev!.texto).toContain('repassada ao setor fiscal (menu)')
  })

  it('palavra-chave de um setor só decide por regra; sem palavra-chave, o modelo decide', async () => {
    const s = await semear(admin, { executa_sozinho: ['GES-TRIAR-REPASSAR'] })
    const porRegra = await triar(s.esc, { conversa_id: await conversa(s.esc, ['Preciso do holerite de outubro do Pedro.']) })
    expect(porRegra.saida).toMatchObject({ setor: 'dp', origem: 'regra' })
    const porModelo = await triar(s.esc, { conversa_id: await conversa(s.esc, ['Vamos levar a empresa para outra cidade. O que muda no registro?']) })
    expect(porModelo.saida).toMatchObject({ setor: 'societario', origem: 'modelo' })
  })

  it('assunto misto vai ao cartão; a pessoa escolhe o setor e a conversa é repassada', async () => {
    const s = await semear(admin, { executa_sozinho: ['GES-TRIAR-REPASSAR'] })
    const id = await conversa(s.esc, ['Preciso da guia do DAS e também quero saber como fica a folha com as férias do Pedro.'])
    const ex = await triar(s.esc, { conversa_id: id })
    const [c] = await admin`select id, tipo, resumo_humano from cartao_aprovacao where id = ${ex.cartao_id}`
    expect(c).toMatchObject({ tipo: 'nao_consegui' })
    expect(c!.resumo_humano).toContain('assuntos de setores diferentes')
    await h.motor.decidirCartao(await pessoa(admin, s.esc, 'u-ana'), { cartao_id: c!.id, decisao: 'editar', argumentos_editados: { setor: 'dp', misto: false, confianca: 1, motivo: 'Primeiro a folha.' } })
    const fim = await esperar(() => lerExecucao(admin, s.esc, ex.id), (e) => e.estado === 'concluida')
    expect(fim.saida).toMatchObject({ setor: 'dp', origem: 'pessoa' })
  })

  it('remetente desconhecido: repassa com o aviso; pelo histórico da mesma pessoa, reconhece o cliente', async () => {
    const s = await semear(admin, { executa_sozinho: ['GES-TRIAR-REPASSAR'] })
    const desconhecido = await conversa(s.esc, ['Bom dia, quero saber o valor dos impostos da minha empresa.'], { cliente: null })
    const ex = await triar(s.esc, { conversa_id: desconhecido })
    expect(ex.saida).toMatchObject({ setor: 'fiscal', cliente_id: null })
    const [c] = await admin`select resumo from conversa where id = ${desconhecido}`
    expect(c!.resumo).toContain('Remetente não identificado')

    await conversa(s.esc, ['Conversa antiga.'], { cliente: 'c-1', pessoa: 'p-maria' })
    const nova = await conversa(s.esc, ['Preciso do holerite do mês.'], { cliente: null, pessoa: 'p-maria' })
    const ex2 = await triar(s.esc, { conversa_id: nova })
    expect(ex2.saida).toMatchObject({ setor: 'dp', cliente_id: 'c-1' })
    const [c2] = await admin`select cliente_id from conversa where id = ${nova}`
    expect(c2!.cliente_id).toBe('c-1')
  })

  it('pelo Assistente: "triar e repassar esta conversa" com a conversa anexada vai ao Atendimento', async () => {
    const s = await semear(admin, { executa_sozinho: ['GES-TRIAR-REPASSAR'] })
    const id = await conversa(s.esc, ['Quando sai a guia do DAS deste mês?'])
    const r = await h.assistente.pedir(await pessoa(admin, s.esc, 'u-ana'), { texto: 'Pode triar e repassar esta conversa?', anexos: { conversa_id: id } })
    expect(r).toMatchObject({ estado: 'encaminhado', encaminhado_para: { integrante_id: 'i-atendimento' }, roteamento: { camada: 'regra', procedimento: 'GES-TRIAR-REPASSAR' } })
    const fim = await esperar(async () => h.assistente.obter(await pessoa(admin, s.esc, 'u-ana'), r.pedido_id), (x) => x.resposta.tipo === 'concluido')
    expect(fim.resposta).toMatchObject({ titulo: 'Conversa repassada ao setor fiscal', dados: { setor: 'fiscal', origem: 'regra' } })
  })
})

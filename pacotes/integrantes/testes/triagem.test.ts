import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { comEscritorio, type Sql } from '@heild/processos'
import { esperar, lerExecucao, montar, pessoa, semear, sqlAdmin } from './ambiente.ts'
import { comQuemFala, prefixoDeQuemFala } from '../src/identificacao.ts'

/**
 * GES-TRIAR-REPASSAR: a triagem do número compartilhado (04, adendo A; 02, "Triagem do número
 * compartilhado"). Com integrantes, o integrante decide (sem menu); o menu é opção ("menu e integrante").
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

interface OpcoesConversa {
  cliente?: string | null
  pessoa?: string
  responsavel?: string
  setor?: string
  status?: string
  etiquetas?: string[]
}

async function conversa(esc: string, mensagens: string[], o: OpcoesConversa = {}) {
  return comEscritorio(admin, esc, async (tx) => {
    const [c] = await tx`insert into conversa (escritorio_id, cliente_id, pessoa_id, setor_id, responsavel_id, status, canal_resposta_atual, ultima_mensagem_em, etiquetas)
                         values (${esc}, ${o.cliente === undefined ? 'c-1' : o.cliente}, ${o.pessoa ?? null}, ${o.setor ?? 'gestao_atendimento'}, ${o.responsavel ?? null},
                         ${o.status ?? 'nova'}, 'whatsapp', now(), ${o.etiquetas ?? []}) returning id`
    for (const corpo of mensagens) await mensagem(esc, c!.id, corpo)
    return c!.id as string
  })
}

async function mensagem(esc: string, conversa_id: string, corpo: string) {
  // Um instante depois da anterior: a ordem das mensagens importa para a resposta à pergunta.
  await new Promise((r) => setTimeout(r, 5))
  await comEscritorio(admin, esc, (tx) => tx`insert into mensagem (escritorio_id, conversa_id, direcao, canal, autor_tipo, corpo, criado_em) values (${esc}, ${conversa_id}, 'entrada', 'whatsapp', 'pessoa', ${corpo}, clock_timestamp())`)
}

async function triar(esc: string, entrada: Record<string, unknown>) {
  const { execucao_id } = await h.motor.iniciar(await pessoa(admin, esc, 'u-ana'), 'GES-TRIAR-REPASSAR', entrada)
  return esperar(() => lerExecucao(admin, esc, execucao_id), terminal)
}

const aprovar = async (esc: string, cartao_id: string) => h.motor.decidirCartao(await pessoa(admin, esc, 'u-ana'), { cartao_id, decisao: 'aprovar' })

describe('quem fala com o cliente', () => {
  it('pessoa com setor, integrante marcado como IA, sistema com o escritório; o prefixo não se repete na sequência', () => {
    expect(prefixoDeQuemFala({ tipo: 'pessoa', setor: 'dp', nome: 'Ana' })).toBe('*DP · Ana*')
    expect(prefixoDeQuemFala({ tipo: 'integrante', nome: 'Integrante de Atendimento' })).toBe('*Integrante de Atendimento (IA)*')
    expect(prefixoDeQuemFala({ tipo: 'sistema', escritorio: 'Escritório Teste' })).toBe('*Escritório Teste*')
    // Nome com marcação não quebra o negrito.
    expect(prefixoDeQuemFala({ tipo: 'integrante', nome: 'Fis*cal' })).toBe('*Fis cal (IA)*')
    const ia = { tipo: 'integrante', nome: 'Atendimento' } as const
    expect(comQuemFala(ia, 'Oi.')).toBe('*Atendimento (IA)*\nOi.')
    expect(comQuemFala(ia, 'Oi de novo.', ia)).toBe('Oi de novo.')
    expect(comQuemFala({ tipo: 'pessoa', setor: 'dp', nome: 'Ana' }, 'Assumi.', ia)).toBe('*DP · Ana*\nAssumi.')
  })
})

describe('triagem pelo integrante (padrão com integrantes, sem menu)', () => {
  it('palavra-chave decide por regra; sem ela, o integrante decide; o destino recebe o resumo e a nota interna', async () => {
    const s = await semear(admin, { executa_sozinho: ['GES-TRIAR-REPASSAR'] })
    const porRegra = await triar(s.esc, { conversa_id: await conversa(s.esc, ['Preciso do holerite de outubro do Pedro.'], { cliente: null }) })
    expect(porRegra.saida).toMatchObject({ acao: 'rotear', setor: 'dp', origem: 'regra', motivo_regra: 'palavra_chave', incerta: false })
    expect(await admin`select 1 from chamada_modelo where execucao_id = ${porRegra.id}`).toHaveLength(0)

    const id = await conversa(s.esc, ['Vamos levar a empresa para outra cidade. O que muda no registro?'])
    const porModelo = await triar(s.esc, { conversa_id: id })
    expect(porModelo.saida).toMatchObject({ acao: 'rotear', setor: 'societario', origem: 'integrante', integrante_id: 'i-societario', cliente_id: 'c-1', sugestao: null })
    const [c] = await admin`select setor_id, resumo, etiquetas, extras from conversa where id = ${id}`
    expect(c).toMatchObject({ setor_id: 'societario' })
    expect(c!.etiquetas).toContain('triada')
    expect(c!.extras).toMatchObject({ origem_roteamento: 'integrante', escolha_cliente: null })
    expect(c!.resumo).toContain('Cliente Padaria Exemplo Ltda. Setor Societário (assunto reconhecido pelo integrante)')
    const [nota] = await admin`select direcao, autor_tipo, corpo from mensagem where conversa_id = ${id} and direcao = 'nota_interna'`
    expect(nota).toMatchObject({ autor_tipo: 'integrante', corpo: c!.resumo })
    const [item] = await admin`select integrante_id, resumo from item_fila where escritorio_id = ${s.esc} and tipo = 'conversa_repassada' and resumo->>'conversa_id' = ${id}`
    expect(item!.integrante_id).toBe('i-societario')
    // O roteamento fica na cadeia de eventos, com a ferramenta do número compartilhado.
    const [ev] = await admin`select texto from evento where execucao_id = ${porModelo.id} and ferramenta = 'conversa.rotear' and resultado = 'ok'`
    expect(ev!.texto).toContain('roteada ao setor societario (integrante)')
  })

  it('entre 0,6 e 0,8 roteia e marca a triagem como incerta', async () => {
    const s = await semear(admin, { executa_sozinho: ['GES-TRIAR-REPASSAR'] })
    const id = await conversa(s.esc, ['Talvez seja sobre o lucro do trimestre, não sei.'], { cliente: null })
    const ex = await triar(s.esc, { conversa_id: id })
    expect(ex.saida).toMatchObject({ acao: 'rotear', setor: 'contabil', origem: 'integrante', incerta: true })
    const [c] = await admin`select etiquetas, resumo from conversa where id = ${id}`
    expect(c!.etiquetas).toEqual(expect.arrayContaining(['triada', 'triagem_incerta']))
    expect(c!.resumo).toContain('triagem incerta: confira')
  })

  it('cliente identificado pula a triagem por contexto: conversa aberta, resposta a envio em 7 dias, um só setor na carteira', async () => {
    const s = await semear(admin, { executa_sozinho: ['GES-TRIAR-REPASSAR'] })
    // Conversa aberta no DP: vale mesmo com palavra-chave de outro setor.
    const aberta = await conversa(s.esc, ['Conversa em andamento.'], { setor: 'dp', status: 'em_atendimento', etiquetas: ['triada'] })
    const ex1 = await triar(s.esc, { conversa_id: await conversa(s.esc, ['E a guia do DAS, já saiu?']) })
    expect(ex1.saida).toMatchObject({ setor: 'dp', origem: 'regra', motivo_regra: 'conversa_aberta' })
    expect(await admin`select 1 from chamada_modelo where execucao_id = ${ex1.id}`).toHaveLength(0)
    const resolverTudo = () => admin`update conversa set status = 'resolvida', ultima_mensagem_em = now() - interval '3 days' where cliente_id = 'c-1' and escritorio_id = ${s.esc}`
    expect(aberta).toBeTruthy()
    await resolverTudo()

    // Resposta a algo que o Fiscal mandou há 2 dias.
    const fiscal = await conversa(s.esc, [], { setor: 'fiscal', status: 'resolvida' })
    await resolverTudo()
    await admin`insert into mensagem (escritorio_id, conversa_id, direcao, canal, autor_tipo, autor_id, corpo, criado_em) values (${s.esc}, ${fiscal}, 'saida', 'whatsapp', 'usuario', 'u-ana', 'Segue a guia.', now() - interval '2 days')`
    const ex2 = await triar(s.esc, { conversa_id: await conversa(s.esc, ['Recebi, obrigado.']) })
    expect(ex2.saida).toMatchObject({ setor: 'fiscal', motivo_regra: 'resposta_a_envio' })
    await resolverTudo()
    await admin`update mensagem set criado_em = now() - interval '10 days' where conversa_id = ${fiscal}`

    // Um só setor ativo na carteira.
    await admin`insert into carteira_cliente (escritorio_id, usuario_id, cliente_id, setor_id) values (${s.esc}, 'u-ana', 'c-1', 'dp')`
    const ex3 = await triar(s.esc, { conversa_id: await conversa(s.esc, ['Bom dia, preciso de uma ajuda.']) })
    expect(ex3.saida).toMatchObject({ setor: 'dp', motivo_regra: 'setor_unico', responsavel_id: 'u-ana' })
  })

  it('sem confiança e sem responsável, pergunta ao cliente (cartão, porque responder é irreversível), com o prefixo da IA; a resposta "2" roteia', async () => {
    const s = await semear(admin, { executa_sozinho: ['GES-TRIAR-REPASSAR'] })
    const id = await conversa(s.esc, ['Oi, tudo bem? Preciso de uma ajuda.'], { cliente: null })
    const ex = await triar(s.esc, { conversa_id: id })
    expect(ex.estado).toBe('aguardando_cartao')
    const [cartao] = await admin`select ferramenta, argumentos, resumo_humano from cartao_aprovacao where id = ${ex.cartao_id}`
    expect(cartao).toMatchObject({ ferramenta: 'conversa.responder' })
    expect(cartao!.resumo_humano).toContain('pergunta 1 de 2')
    await aprovar(s.esc, ex.cartao_id!)
    const fim = await esperar(() => lerExecucao(admin, s.esc, ex.id), (e) => e.estado === 'concluida')
    expect(fim.saida).toMatchObject({ acao: 'perguntar', setor: null, pergunta: { numero: 1 } })
    const [p] = await admin`select autor_tipo, autor_id, corpo, extras from mensagem where conversa_id = ${id} and direcao = 'saida'`
    expect(p).toMatchObject({ autor_tipo: 'integrante', autor_id: 'i-atendimento' })
    expect(p!.corpo.startsWith('*Atendimento (IA)*\n')).toBe(true)
    expect(p!.corpo).toContain('Responda com o número.')
    expect(p!.extras.tipo).toBe('pergunta_triagem')
    const [c] = await admin`select status, etiquetas from conversa where id = ${id}`
    expect(c).toMatchObject({ status: 'aguardando_cliente' })
    expect(c!.etiquetas).toContain('triagem_perguntou')

    // O cliente responde com o número da opção: regra, sem modelo.
    const opcoes = p!.extras.opcoes as { setor: string }[]
    await mensagem(s.esc, id, '2')
    const ex2 = await triar(s.esc, { conversa_id: id })
    expect(ex2.saida).toMatchObject({ acao: 'rotear', setor: opcoes[1]!.setor, origem: 'regra', motivo_regra: 'resposta_a_pergunta' })
    expect(await admin`select 1 from chamada_modelo where execucao_id = ${ex2.id}`).toHaveLength(0)
  })

  it('depois de duas perguntas sem acordo, vai ao setor de entrada com a etiqueta triagem_sem_acordo', async () => {
    const s = await semear(admin, { executa_sozinho: ['GES-TRIAR-REPASSAR'] })
    const id = await conversa(s.esc, ['Oi.'], { cliente: null })
    for (let i = 0; i < 2; i++) {
      const ex = await triar(s.esc, { conversa_id: id })
      await aprovar(s.esc, ex.cartao_id!)
      await esperar(() => lerExecucao(admin, s.esc, ex.id), (e) => e.estado === 'concluida')
      await mensagem(s.esc, id, 'Não sei.')
    }
    const [{ n }] = await admin`select count(*)::int as n from mensagem where conversa_id = ${id} and direcao = 'saida'`
    expect(n).toBe(2)
    const [segunda] = await admin`select corpo from mensagem where conversa_id = ${id} and direcao = 'saida' order by criado_em desc limit 1`
    // O integrante falou por último: o prefixo não se repete.
    expect(segunda!.corpo.startsWith('Ainda não consegui entender o assunto.')).toBe(true)
    const fim = await triar(s.esc, { conversa_id: id })
    expect(fim.saida).toMatchObject({ acao: 'entrada_padrao', setor: 'gestao_atendimento' })
    const [c] = await admin`select etiquetas, resumo from conversa where id = ${id}`
    expect(c!.etiquetas).toEqual(expect.arrayContaining(['triada', 'triagem_sem_acordo']))
    expect(c!.resumo).toContain('sem acordo depois de 2 perguntas ao cliente')
  })

  it('com responsável, a dúvida vai à pessoa por cartão "não consegui"; a pessoa escolhe o setor', async () => {
    const s = await semear(admin, { executa_sozinho: ['GES-TRIAR-REPASSAR'] })
    const id = await conversa(s.esc, ['Preciso da guia do DAS e também quero saber como fica a folha com as férias do Pedro.'], { responsavel: 'u-ana' })
    const ex = await triar(s.esc, { conversa_id: id })
    const [c] = await admin`select id, tipo, resumo_humano from cartao_aprovacao where id = ${ex.cartao_id}`
    expect(c).toMatchObject({ tipo: 'nao_consegui' })
    expect(c!.resumo_humano).toContain('assuntos de setores diferentes')
    await h.motor.decidirCartao(await pessoa(admin, s.esc, 'u-ana'), { cartao_id: c!.id, decisao: 'editar', argumentos_editados: { setor: 'dp', alternativa: null, misto: false, confianca: 1, motivo: 'Primeiro a folha.' } })
    const fim = await esperar(() => lerExecucao(admin, s.esc, ex.id), (e) => e.estado === 'concluida')
    expect(fim.saida).toMatchObject({ acao: 'rotear', setor: 'dp', origem: 'pessoa' })
    // Nenhuma pergunta foi ao cliente.
    expect(await admin`select 1 from mensagem where conversa_id = ${id} and direcao = 'saida'`).toHaveLength(0)
  })

  it('remetente desconhecido: repassa com o aviso; pelo histórico da mesma pessoa, reconhece o cliente', async () => {
    const s = await semear(admin, { executa_sozinho: ['GES-TRIAR-REPASSAR'] })
    const desconhecido = await conversa(s.esc, ['Bom dia, quero saber o valor dos impostos da minha empresa.'], { cliente: null })
    const ex = await triar(s.esc, { conversa_id: desconhecido })
    expect(ex.saida).toMatchObject({ setor: 'fiscal', cliente_id: null })
    const [c] = await admin`select resumo from conversa where id = ${desconhecido}`
    expect(c!.resumo).toContain('Remetente não identificado')

    const antiga = await conversa(s.esc, ['Conversa antiga.'], { cliente: 'c-1', pessoa: 'p-maria', status: 'resolvida' })
    await admin`update conversa set ultima_mensagem_em = now() - interval '30 days' where id = ${antiga}`
    const nova = await conversa(s.esc, ['Preciso do holerite do mês.'], { cliente: null, pessoa: 'p-maria' })
    const ex2 = await triar(s.esc, { conversa_id: nova })
    expect(ex2.saida).toMatchObject({ setor: 'dp', cliente_id: 'c-1' })
    const [c2] = await admin`select cliente_id from conversa where id = ${nova}`
    expect(c2!.cliente_id).toBe('c-1')
  })
})

describe('opção "menu e integrante"', () => {
  it('vale a escolha do cliente; com confiança ≥ 0,8, o integrante deixa o cartão "Parece ser do…" e grava a divergência', async () => {
    const s = await semear(admin, { executa_sozinho: ['GES-TRIAR-REPASSAR'] })
    const id = await conversa(s.esc, ['É sobre a guia do DAS.'], { cliente: null })
    const ex = await triar(s.esc, { conversa_id: id, triagem: 'menu_e_integrante', menu_escolhido: 'contabil' })
    // Já roteou para o setor do menu; o cartão de sugestão espera quem atende.
    expect(ex.estado).toBe('aguardando_cartao')
    const [conv] = await admin`select setor_id, extras from conversa where id = ${id}`
    expect(conv).toMatchObject({ setor_id: 'contabil' })
    expect(conv!.extras).toMatchObject({ origem_roteamento: 'menu', escolha_cliente: 'contabil', sugestao_integrante: { setor: 'fiscal' } })
    const [div] = await admin`select texto from evento where execucao_id = ${ex.id} and ferramenta = 'conversa.triagem_divergir' and resultado = 'ok'`
    expect(div!.texto).toContain('vale a escolha do cliente')
    const [cartao] = await admin`select ferramenta, argumentos, resumo_humano from cartao_aprovacao where id = ${ex.cartao_id}`
    expect(cartao).toMatchObject({ ferramenta: 'conversa.transferir', argumentos: { setor: 'fiscal', manter_numero: true } })
    expect(cartao!.resumo_humano).toMatch(/^Parece ser do Fiscal.*Transferir\?$/)
    // Nenhuma mensagem vai ao cliente.
    expect(await admin`select 1 from mensagem where conversa_id = ${id} and direcao = 'saida'`).toHaveLength(0)

    await aprovar(s.esc, ex.cartao_id!)
    const fim = await esperar(() => lerExecucao(admin, s.esc, ex.id), (e) => e.estado === 'concluida')
    expect(fim.saida).toMatchObject({ setor_roteado: 'contabil', setor: 'fiscal', origem: 'menu', transferido: true, integrante_id: 'i-fiscal' })
  })

  it('palavras-chave que confirmam o menu dispensam o modelo; escolha de menu fora dessa opção é recusada', async () => {
    const s = await semear(admin, { executa_sozinho: ['GES-TRIAR-REPASSAR'] })
    const ex = await triar(s.esc, { conversa_id: await conversa(s.esc, ['Quero falar sobre a folha deste mês.'], { cliente: null }), triagem: 'menu_e_integrante', menu_escolhido: 'dp' })
    expect(ex.saida).toMatchObject({ setor: 'dp', origem: 'menu', sugestao: null, transferido: false })
    expect(await admin`select 1 from chamada_modelo where execucao_id = ${ex.id}`).toHaveLength(0)
    const errado = await triar(s.esc, { conversa_id: await conversa(s.esc, ['Oi'], { cliente: null }), menu_escolhido: 'dp' })
    expect(errado).toMatchObject({ estado: 'falhou', erro: { codigo: 'MENU_SEM_MENU' } })
  })
})

describe('pelo Assistente', () => {
  it('"triar e repassar esta conversa" com a conversa anexada vai ao Atendimento', async () => {
    const s = await semear(admin, { executa_sozinho: ['GES-TRIAR-REPASSAR'] })
    const id = await conversa(s.esc, ['Quando sai a guia do DAS deste mês?'])
    const r = await h.assistente.pedir(await pessoa(admin, s.esc, 'u-ana'), { texto: 'Pode triar e repassar esta conversa?', anexos: { conversa_id: id } })
    expect(r).toMatchObject({ estado: 'encaminhado', encaminhado_para: { integrante_id: 'i-atendimento' }, roteamento: { camada: 'regra', procedimento: 'GES-TRIAR-REPASSAR' } })
    const fim = await esperar(async () => h.assistente.obter(await pessoa(admin, s.esc, 'u-ana'), r.pedido_id), (x) => x.resposta.tipo === 'concluido')
    expect(fim.resposta).toMatchObject({ titulo: 'Conversa repassada ao setor fiscal', dados: { setor: 'fiscal', origem: 'regra' } })
  })
})

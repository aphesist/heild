import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { comEscritorio, type Sql } from '@heild/processos'
import { esperar, lerExecucao, montar, pessoa, semear, sqlAdmin } from './ambiente.ts'
import { comQuemFala, prefixoDeQuemFala } from '../src/identificacao.ts'
import { dentroDoHorario, HORARIO_PADRAO, horarioDe, proximaAbertura, saudacao, textoDoHorario } from '../src/horario.ts'
import { classificarConversa } from '../src/avaliacao/conversas.ts'
import { gabaritoConversas } from '../src/avaliacao/gabarito-conversas.ts'
import { FILA_RETOMAR_TRIAGEM, problemasDeEscopo, problemasDeEstilo } from '../src/setores/triagem-conversa.ts'

/**
 * GES-TRIAR-REPASSAR v3: a triagem do número compartilhado como conversa (decisão do Enzo de
 * 15/11/2026). Sem menu nem pergunta fechada; fora do horário, só a resposta automática.
 */

let admin: Sql
let h: Awaited<ReturnType<typeof montar>>
const terminal = (e: { estado: string }) => ['concluida', 'aguardando_cartao', 'falhou', 'cancelada', 'parcial'].includes(e.estado)
const SP = 'America/Sao_Paulo'
/** Segunda-feira, 16/11/2026, 14h em São Paulo: dentro do horário padrão. */
const EXPEDIENTE = '2026-11-16T14:00:00-03:00'
/** Sábado, 21/11/2026, 10h: fora do horário padrão. */
const SABADO = '2026-11-21T10:00:00-03:00'

beforeAll(async () => {
  admin = sqlAdmin()
  h = await montar()
})
afterAll(async () => {
  await h.parar()
  await admin.end()
})

async function conversa(esc: string, mensagens: string[], o: { cliente?: string | null; setor?: string; status?: string; etiquetas?: string[] } = {}) {
  const id = await comEscritorio(admin, esc, async (tx) => {
    const [c] = await tx`insert into conversa (escritorio_id, cliente_id, setor_id, status, canal_resposta_atual, ultima_mensagem_em, etiquetas)
                         values (${esc}, ${o.cliente === undefined ? 'c-1' : o.cliente}, ${o.setor ?? 'gestao_atendimento'}, ${o.status ?? 'nova'}, 'whatsapp', now(), ${o.etiquetas ?? []}) returning id`
    return c!.id as string
  })
  for (const m of mensagens) await cliente(esc, id, m)
  return id
}

async function cliente(esc: string, conversa_id: string, corpo: string) {
  await new Promise((r) => setTimeout(r, 5))
  await comEscritorio(admin, esc, (tx) => tx`insert into mensagem (escritorio_id, conversa_id, direcao, canal, autor_tipo, corpo, criado_em) values (${esc}, ${conversa_id}, 'entrada', 'whatsapp', 'pessoa', ${corpo}, clock_timestamp())`)
}

async function triar(esc: string, conversa_id: string, agora = EXPEDIENTE) {
  const { execucao_id } = await h.motor.iniciar(await pessoa(admin, esc, 'u-ana'), 'GES-TRIAR-REPASSAR', { conversa_id, agora })
  return esperar(() => lerExecucao(admin, esc, execucao_id), terminal)
}

const falas = (id: string) => admin`select autor_tipo, autor_id, corpo, extras from mensagem where conversa_id = ${id} and direcao = 'saida' order by criado_em`

describe('tom e escopo da triagem (por regra)', () => {
  it('mensagem natural passa; menu, lista, jargão de robô, formatação e duas perguntas não', () => {
    expect(problemasDeEstilo('Boa tarde! Tudo bem? Me conta o que você precisa.')).toEqual([])
    expect(problemasDeEstilo('Entendi! Vou passar para o pessoal do DP, que cuida disso.')).toEqual([])
    expect(problemasDeEstilo('Escolha uma opção: 1. Fiscal 2. DP')).toContain('menu')
    expect(problemasDeEstilo('É sobre:\n1. Fiscal\n2. DP')).toContain('lista_ou_menu')
    expect(problemasDeEstilo('Olá! Sou um assistente virtual. Como posso ajudá-lo hoje?')).toContain('jargao_de_robo')
    expect(problemasDeEstilo('Prezado cliente, recebemos sua solicitação.')).toContain('jargao_de_robo')
    expect(problemasDeEstilo('É *urgente*?')).toContain('formatacao')
    expect(problemasDeEstilo('É da folha? Ou do imposto?')).toContain('mais_de_uma_pergunta')
  })

  it('a triagem não dá valor, prazo, promessa, resposta técnica nem pede documento sensível', () => {
    expect(problemasDeEscopo('Vou passar para o pessoal do fiscal, que cuida disso.')).toEqual([])
    expect(problemasDeEscopo('O DAS deve dar uns R$ 150,00.')).toContain('valor')
    expect(problemasDeEscopo('Fica uns 6% do faturamento.')).toContain('valor')
    expect(problemasDeEscopo('Vence até o dia 20, fique tranquilo.')).toContain('prazo')
    expect(problemasDeEscopo('Em 2 dias eles te respondem.')).toContain('prazo')
    expect(problemasDeEscopo('Pode deixar que eu resolvo!')).toContain('promessa')
    expect(problemasDeEscopo('Me passa sua senha do gov.br?')).toContain('documento_sensivel')
    expect(problemasDeEscopo('Me manda uma foto do documento?')).toContain('documento_sensivel')
    expect(problemasDeEscopo('A conta de luz é dedutível, sim.')).toContain('resposta_tecnica')
  })

  it('quem fala: pessoa com setor, integrante com (IA), sistema com o escritório; sem repetir na sequência', () => {
    expect(prefixoDeQuemFala({ tipo: 'pessoa', setor: 'dp', nome: 'Ana' })).toBe('*DP · Ana*')
    expect(prefixoDeQuemFala({ tipo: 'integrante', nome: 'Atendimento' })).toBe('*Atendimento (IA)*')
    expect(prefixoDeQuemFala({ tipo: 'sistema', escritorio: 'Escritório Teste' })).toBe('*Escritório Teste*')
    const ia = { tipo: 'integrante', nome: 'Atendimento' } as const
    expect(comQuemFala(ia, 'Oi de novo.', ia)).toBe('Oi de novo.')
    expect(comQuemFala({ tipo: 'pessoa', setor: 'dp', nome: 'Ana' }, 'Assumi.', ia)).toBe('*DP · Ana*\nAssumi.')
  })
})

describe('horário de atendimento', () => {
  it('padrão de segunda a sexta, das 8h às 18h, no fuso do escritório; próxima abertura e saudação', () => {
    expect(textoDoHorario(HORARIO_PADRAO)).toBe('de segunda a sexta, das 8h às 18h')
    expect(textoDoHorario({ dias: [1, 3, 5], inicio: '09:30', fim: '17:00' })).toBe('segunda, quarta e sexta, das 9h30 às 17h')
    expect(dentroDoHorario(new Date(EXPEDIENTE), HORARIO_PADRAO, SP)).toBe(true)
    expect(dentroDoHorario(new Date(SABADO), HORARIO_PADRAO, SP)).toBe(false)
    expect(dentroDoHorario(new Date('2026-11-16T18:00:00-03:00'), HORARIO_PADRAO, SP)).toBe(false)
    expect(dentroDoHorario(new Date('2026-11-16T07:59:00-03:00'), HORARIO_PADRAO, SP)).toBe(false)
    // Sexta à noite → segunda às 8h; segunda de madrugada → segunda às 8h.
    expect(proximaAbertura(new Date('2026-11-20T19:00:00-03:00'), HORARIO_PADRAO, SP).toISOString()).toBe('2026-11-23T11:00:00.000Z')
    expect(proximaAbertura(new Date('2026-11-16T05:00:00-03:00'), HORARIO_PADRAO, SP).toISOString()).toBe('2026-11-16T11:00:00.000Z')
    expect(saudacao(new Date(EXPEDIENTE), SP)).toBe('Boa tarde')
    expect(saudacao(new Date('2026-11-16T09:00:00-03:00'), SP)).toBe('Bom dia')
    // Desligado por padrão: sem configuração, ou sem `ligado: true`, não há horário (atende a qualquer hora).
    expect(horarioDe(null)).toBeNull()
    expect(horarioDe({})).toBeNull()
    expect(horarioDe({ horario_atendimento: { dias: [1, 2, 3, 4, 5], inicio: '08:00', fim: '18:00' } })).toBeNull()
    expect(horarioDe({ horario_atendimento: { ligado: false, dias: [1], inicio: '08:00', fim: '12:00' } })).toBeNull()
    // Ligado: sem dias e horas, o padrão sugerido; com, o dado; inválido vira o padrão, sem derrubar a triagem.
    expect(horarioDe({ horario_atendimento: { ligado: true } })).toEqual(HORARIO_PADRAO)
    expect(horarioDe({ horario_atendimento: { ligado: true, dias: [1, 2, 3, 4, 5, 6], inicio: '08:00', fim: '12:00' } })).toEqual({ dias: [1, 2, 3, 4, 5, 6], inicio: '08:00', fim: '12:00' })
    expect(horarioDe({ horario_atendimento: { ligado: true, dias: [1], inicio: '18:00', fim: '08:00' } })).toEqual(HORARIO_PADRAO)
  })
})

describe('gabarito de conversas', () => {
  it('cobre os grupos pedidos, com ids distintos; setor errado é crítico, cartão e pessoa não', () => {
    expect(new Set(gabaritoConversas.map((c) => c.id)).size).toBe(gabaritoConversas.length)
    expect(new Set(gabaritoConversas.map((c) => c.grupo))).toEqual(new Set(['vago', 'claro', 'misto', 'muda_assunto', 'irritado', 'delicado', 'pede_pessoa', 'sem_certeza', 'fora_do_horario', 'contexto', 'escopo']))
    expect(gabaritoConversas.filter((c) => c.roteiro.length > 1).length).toBeGreaterThanOrEqual(10)
    const dp = gabaritoConversas.find((c) => c.id === 'vago-rescisao')!
    expect(classificarConversa(dp, 'dp')).toEqual({ acerto: true, erro_critico: false })
    expect(classificarConversa(dp, 'fiscal')).toEqual({ acerto: false, erro_critico: true })
    expect(classificarConversa(dp, 'cartao')).toEqual({ acerto: false, erro_critico: false })
    const irritado = gabaritoConversas.find((c) => c.id === 'irritado-demora')!
    expect(classificarConversa(irritado, 'gestao_atendimento')).toEqual({ acerto: false, erro_critico: true })
  })
})

describe('triagem como conversa (v3)', () => {
  it('assunto vago: o integrante cumprimenta e pergunta (sem cartão, com "(IA)"); com a resposta, repassa ao DP e avisa', async () => {
    const s = await semear(admin, { executa_sozinho: ['GES-TRIAR-REPASSAR'] })
    const id = await conversa(s.esc, ['Boa tarde, gente.'])
    const ex1 = await triar(s.esc, id)
    expect(ex1.saida).toMatchObject({ acao: 'perguntar', setor: null, origem: 'integrante', perguntas: 1 })
    expect(await admin`select 1 from cartao_aprovacao where execucao_id = ${ex1.id}`).toHaveLength(0)
    const [p1] = await falas(id)
    expect(p1).toMatchObject({ autor_tipo: 'integrante', autor_id: 'i-atendimento' })
    expect(p1!.corpo).toBe('*Atendimento (IA)*\nBoa tarde! Tudo bem? Me conta o que você precisa.')
    expect(p1!.extras.tipo).toBe('triagem_conversa')
    // A última fala é do escritório: nova triagem sem mensagem do cliente não faz nada.
    expect(await triar(s.esc, id)).toMatchObject({ estado: 'falhou', erro: { codigo: 'SEM_MENSAGEM_NOVA' } })

    await cliente(s.esc, id, 'Preciso desligar dois rapazes da equipe, vou precisar do acerto dos dois.')
    const ex2 = await triar(s.esc, id)
    expect(ex2.saida).toMatchObject({ acao: 'repassar', setor: 'dp', origem: 'integrante', perguntas: 1, integrante_id: 'i-dp' })
    const [, p2] = await falas(id)
    // O integrante falou por último: sem repetir o prefixo.
    expect(p2!.corpo).toBe('Entendi! Vou passar para o pessoal do DP, que cuida disso.')
    expect(p2!.extras.tipo).toBe('aviso_repasse')
    const [c] = await admin`select setor_id, etiquetas, resumo, extras from conversa where id = ${id}`
    expect(c).toMatchObject({ setor_id: 'dp' })
    expect(c!.etiquetas).toContain('triada')
    expect(c!.resumo).toContain('Setor DP (assunto entendido pelo integrante em 1 pergunta(s))')
    expect(c!.extras).toMatchObject({ origem_roteamento: 'integrante', triagem: { perguntas: 1 } })
    const [nota] = await admin`select corpo from mensagem where conversa_id = ${id} and direcao = 'nota_interna'`
    expect(nota!.corpo).toBe(c!.resumo)
    const [ev] = await admin`select texto from evento where execucao_id = ${ex2.id} and ferramenta = 'conversa.triagem_responder' and resultado = 'ok'`
    expect(ev!.texto).toContain('cliente avisado do repasse ao setor dp')
  })

  it('palavra-chave repassa sem modelo, com o aviso fixo e a saudação; conversa ligada a um setor pula em silêncio', async () => {
    const s = await semear(admin, { executa_sozinho: ['GES-TRIAR-REPASSAR'] })
    const id = await conversa(s.esc, ['Preciso do holerite de outubro do Pedro.'], { cliente: null })
    const ex = await triar(s.esc, id)
    expect(ex.saida).toMatchObject({ acao: 'repassar', setor: 'dp', origem: 'regra', motivo_regra: 'palavra_chave', perguntas: 0 })
    expect(await admin`select 1 from chamada_modelo where execucao_id = ${ex.id}`).toHaveLength(0)
    const [f] = await falas(id)
    expect(f!.corpo).toBe('*Atendimento (IA)*\nBoa tarde! Vou passar sua mensagem para o pessoal do DP, que cuida disso. Daqui a pouco eles te respondem por aqui.')

    await conversa(s.esc, ['Conversa em andamento.'], { setor: 'fiscal', status: 'em_atendimento', etiquetas: ['triada'] })
    const nova = await conversa(s.esc, ['Oi, alguma novidade?'])
    const ex2 = await triar(s.esc, nova)
    expect(ex2.saida).toMatchObject({ acao: 'repassar', setor: 'fiscal', motivo_regra: 'conversa_aberta' })
    expect(await falas(nova)).toHaveLength(0)
  })

  it('horário desligado (padrão): a mensagem do sábado é triada na hora, sem resposta de fora do horário', async () => {
    const s = await semear(admin, { executa_sozinho: ['GES-TRIAR-REPASSAR'] })
    const id = await conversa(s.esc, ['Preciso do holerite de outubro do Pedro.'])
    const ex = await triar(s.esc, id, SABADO)
    expect(ex.saida).toMatchObject({ acao: 'repassar', setor: 'dp', retomar_em: null })
    const [f] = await falas(id)
    expect(f!.extras.tipo).toBe('aviso_repasse')
    expect(await admin`select 1 from pgboss.job where name = ${FILA_RETOMAR_TRIAGEM} and data->>'conversa_id' = ${id}`).toHaveLength(0)
  })

  it('horário ligado: fora dele, resposta automática fixa, sem IA e uma vez só; a triagem fica na fila para a primeira hora', async () => {
    const s = await semear(admin, { executa_sozinho: ['GES-TRIAR-REPASSAR'] })
    // Ligado sem dias e horas: o padrão sugerido, de segunda a sexta, das 8h às 18h.
    await admin`update escritorio set configuracao = ${admin.json({ horario_atendimento: { ligado: true } })} where id = ${s.esc}`
    const id = await conversa(s.esc, ['Oi, preciso de uma ajuda com a empresa.'])
    const ex = await triar(s.esc, id, SABADO)
    expect(ex.saida).toMatchObject({ acao: 'fora_do_horario', setor: null, retomar_em: '2026-11-23T11:00:00.000Z' })
    expect(await admin`select 1 from chamada_modelo where execucao_id = ${ex.id}`).toHaveLength(0)
    const [f] = await falas(id)
    expect(f).toMatchObject({ autor_tipo: 'sistema' })
    expect(f!.corpo).toBe('*Escritório Teste*\nOlá! Recebemos sua mensagem. Nosso horário de atendimento é de segunda a sexta, das 8h às 18h. Assim que abrirmos, alguém responde por aqui.')
    const [c] = await admin`select setor_id, etiquetas from conversa where id = ${id}`
    expect(c).toMatchObject({ setor_id: 'gestao_atendimento' })
    expect(c!.etiquetas).toContain('fora_do_horario')
    const jobs = await admin`select start_after, data from pgboss.job where name = ${FILA_RETOMAR_TRIAGEM} and data->>'conversa_id' = ${id}`
    expect(jobs).toHaveLength(1)
    expect(new Date(jobs[0]!.start_after).toISOString()).toBe('2026-11-23T11:00:00.000Z')

    // Outra mensagem no fim de semana: nada de segunda resposta automática.
    await cliente(s.esc, id, 'É sobre o imposto da empresa.')
    await triar(s.esc, id, SABADO)
    expect(await falas(id)).toHaveLength(1)
    // Na primeira hora do expediente, a triagem roda sobre o que ficou sem resposta.
    const seg = await triar(s.esc, id, '2026-11-23T08:00:00-03:00')
    expect(seg.saida).toMatchObject({ acao: 'repassar', setor: 'fiscal' })
    const [, aviso] = await falas(id)
    expect(aviso!.corpo.startsWith('*Atendimento (IA)*\n')).toBe(true)
  })

  it('cliente irritado vai a uma pessoa do Atendimento, com resposta de empatia e etiqueta urgente', async () => {
    const s = await semear(admin, { executa_sozinho: ['GES-TRIAR-REPASSAR'] })
    const id = await conversa(s.esc, ['Já é a terceira vez que eu mando mensagem e ninguém responde. Que absurdo!'])
    const ex = await triar(s.esc, id)
    expect(ex.saida).toMatchObject({ acao: 'pessoa', setor: 'gestao_atendimento', motivo_pessoa: 'irritado', integrante_id: null })
    const [c] = await admin`select etiquetas, resumo from conversa where id = ${id}`
    expect(c!.etiquetas).toEqual(expect.arrayContaining(['triada', 'precisa_pessoa', 'urgente']))
    expect(c!.resumo).toContain('precisa de uma pessoa: cliente irritado')
    const [f] = await falas(id)
    expect(f!.corpo).toContain('Vou chamar alguém da equipe')
  })

  it(`depois de 3 perguntas sem certeza, cartão para uma pessoa escolher o setor; o cliente recebe o aviso fixo`, async () => {
    const s = await semear(admin, { executa_sozinho: ['GES-TRIAR-REPASSAR'] })
    const id = await conversa(s.esc, ['Oi.'])
    for (const resposta of ['É coisa da empresa.', 'Depois eu explico melhor.', 'É complicado.']) {
      expect((await triar(s.esc, id)).saida).toMatchObject({ acao: 'perguntar' })
      await cliente(s.esc, id, resposta)
    }
    expect(await falas(id)).toHaveLength(3)
    const ex = await triar(s.esc, id)
    const [cartao] = await admin`select id, tipo, resumo_humano from cartao_aprovacao where id = ${ex.cartao_id}`
    expect(cartao).toMatchObject({ tipo: 'nao_consegui' })
    expect(cartao!.resumo_humano).toContain('Depois de 3 perguntas')
    await h.motor.decidirCartao(await pessoa(admin, s.esc, 'u-ana'), { cartao_id: cartao!.id, decisao: 'editar', argumentos_editados: { acao: 'repassar', setor: 'fiscal', confianca: 1, motivo_pessoa: null, mensagem: 'Fiscal.' } })
    const fim = await esperar(() => lerExecucao(admin, s.esc, ex.id), (e) => e.estado === 'concluida')
    expect(fim.saida).toMatchObject({ acao: 'repassar', setor: 'fiscal', origem: 'pessoa' })
    const ultima = (await falas(id)).at(-1)!
    expect(ultima.corpo).toBe('Vou passar sua mensagem para o pessoal do fiscal, que cuida disso. Daqui a pouco eles te respondem por aqui.')
  })

  it('mensagem fora do tom (menu) não sai: escala uma vez e, sem conserto, vai ao cartão', async () => {
    const s = await semear(admin, { executa_sozinho: ['GES-TRIAR-REPASSAR'] })
    const id = await conversa(s.esc, ['Isso aqui é um teste de estilo.'])
    const ex = await triar(s.esc, id)
    const [cartao] = await admin`select tipo, resumo_humano from cartao_aprovacao where id = ${ex.cartao_id}`
    expect(cartao).toMatchObject({ tipo: 'nao_consegui' })
    expect(cartao!.resumo_humano).toContain('fora do tom de WhatsApp: menu')
    expect(await falas(id)).toHaveLength(0)
    const classes = await admin`select classe from chamada_modelo where execucao_id = ${ex.id} order by criado_em`
    expect(classes.map((c) => c.classe)).toEqual(['operario', 'escritor'])
  })

  it('pelo Assistente: "triar e repassar esta conversa" com a conversa anexada vai ao Atendimento', async () => {
    const s = await semear(admin, { executa_sozinho: ['GES-TRIAR-REPASSAR'] })
    // Sem relógio na entrada e com o horário desligado (padrão): atende a qualquer hora em que o teste rode.
    const id = await conversa(s.esc, ['Quando sai a guia do DAS deste mês?'])
    const r = await h.assistente.pedir(await pessoa(admin, s.esc, 'u-ana'), { texto: 'Pode triar e repassar esta conversa?', anexos: { conversa_id: id } })
    expect(r).toMatchObject({ estado: 'encaminhado', encaminhado_para: { integrante_id: 'i-atendimento' }, roteamento: { camada: 'regra', procedimento: 'GES-TRIAR-REPASSAR' } })
    const fim = await esperar(async () => h.assistente.obter(await pessoa(admin, s.esc, 'u-ana'), r.pedido_id), (x) => x.resposta.tipo === 'concluido')
    expect(fim.resposta).toMatchObject({ titulo: 'Conversa repassada ao setor fiscal', dados: { setor: 'fiscal', origem: 'regra' } })
  })
})

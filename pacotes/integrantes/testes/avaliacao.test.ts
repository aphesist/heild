import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { comEscritorio, type ConfigModelos, type Sql } from '@heild/processos'
import {
  avaliar,
  avaliarCaso,
  emMarkdown,
  fecharComparacoes,
  iniciarSombra,
  registrarDecisaoDaPessoa,
  resumir,
  resumoSombra,
  rodarPortaoHaiku,
  type AmbienteAvaliacao,
} from '../src/index.ts'
import { gabaritoCompleto, gabaritoDp, gabaritoFiscal, gabaritoPorSetor } from '../src/avaliacao/gabarito.ts'
import { documento, montar, pessoa, RESPOSTAS_SIMULADAS, semear, sqlAdmin } from './ambiente.ts'

/** Avaliação automatizada (decisão 8): gabarito por setor em sombra, comparação com a pessoa e portão do Haiku. */

let admin: Sql
let h: Awaited<ReturnType<typeof montar>>
const modelos: ConfigModelos = {
  porClasse: { operario: 'demo-operario', escritor: 'demo-escritor', revisor: 'demo-revisor' },
  precos: {
    'demo-operario': { entrada: 1_080, saida: 5_400, cache: 54 },
    'demo-escritor': { entrada: 1_080, saida: 5_400, cache: 54 },
    'demo-revisor': { entrada: 2_160, saida: 10_800, cache: 108 },
    'claude-sonnet-5-5': { entrada: 1_080, saida: 5_400, cache: 54 },
    'claude-haiku-5-5': { entrada: 54, saida: 270, cache: 5.4 },
  },
}

async function ambiente(): Promise<AmbienteAvaliacao> {
  const s = await semear(admin, { bolsa_centavos: 100_000 })
  return { sql: admin, motor: h.motor, escritorio_id: s.esc, cliente_id: s.cliente, cnpj: s.cnpj, ctx: await pessoa(admin, s.esc, 'u-ana') }
}

beforeAll(async () => {
  admin = sqlAdmin()
  h = await montar({ modelos })
})
afterAll(async () => {
  await h.parar()
  await admin.end()
})

describe('gabarito por setor em modo sombra', () => {
  it('roda todos os setores sem nenhum efeito: nenhum cartão, nenhum documento alterado, nenhum envio', async () => {
    const a = await ambiente()
    const envios = h.sped.envios
    const linhas = await avaliar(a, gabaritoCompleto, { concorrencia: 6 })
    expect(linhas).toHaveLength(gabaritoCompleto.length)
    const r = resumir(linhas)
    expect(r.porSetor.map((x) => x.setor)).toEqual(['contabil', 'dp', 'fiscal', 'gestao_atendimento', 'societario'])
    // O operário simulado acerta o gabarito: o que se prova aqui é o caminho, não a qualidade.
    for (const s of r.porSetor) {
      expect(s.erro_critico, s.setor).toBe(0)
      expect(s.falha, s.setor).toBe(0)
      expect(s.margem_pontos, s.setor).not.toBeNull()
    }
    expect(r.total.acerto_pct).toBeGreaterThanOrEqual(90)
    expect(r.porPapel.find((p) => p.papel === 'operario')!.chamadas).toBeGreaterThan(20)
    // A sombra paga com a bolsa do piloto, nunca com a do setor.
    const bolsas = await admin`select setor, gasto_centavos from bolsa_setor where escritorio_id = ${a.escritorio_id}`
    expect(bolsas.find((b) => b.setor === 'piloto')!.gasto_centavos).toBeGreaterThan(0)
    for (const b of bolsas.filter((x) => x.setor !== 'piloto')) expect(b.gasto_centavos, b.setor).toBe(0)
    // Sombra: nada saiu.
    expect(await admin`select 1 from cartao_aprovacao where escritorio_id = ${a.escritorio_id}`).toHaveLength(0)
    expect(await admin`select 1 from item_fila where escritorio_id = ${a.escritorio_id}`).toHaveLength(0)
    expect(await admin`select 1 from entrega_obrigacao where escritorio_id = ${a.escritorio_id}`).toHaveLength(0)
    expect(h.sped.envios).toBe(envios)
    const tratados = await admin`select id from documento where escritorio_id = ${a.escritorio_id} and (competencia is not null or metadados ?| ${['guia_conferida', 'triagem_ecac', 'evento_folha', 'alteracao_contratual', 'resposta_faq']})`
    expect(tratados).toHaveLength(0)
    // O efeito desfeito também não deixou evento de efeito na cadeia.
    expect(await admin`select 1 from evento where escritorio_id = ${a.escritorio_id} and ferramenta in ('fiscal.guia.enviar', 'conversa.responder', 'documento.classificar', 'contabil.ecd_ecf.transmitir') and resultado = 'ok'`).toHaveLength(0)
    const md = emMarkdown(r)
    expect(md).toContain('| fiscal |')
    expect(md).toContain('| operario |')
  })

  it('um operário que erra vira erro crítico no relatório (o gabarito pega)', async () => {
    const a = await ambiente()
    h.fornecedor.responder('soc.alteracao.classificar', () => ({ tipo_alteracao: 'capital_social', confianca: 0.99, motivo: 'Sempre capital.' }))
    try {
      const linhas = await avaliar(a, gabaritoPorSetor.societario!, { concorrencia: 3 })
      const r = resumir(linhas)
      expect(r.porSetor[0]!.erro_critico).toBe(4)
      expect(r.porSetor[0]!.dentro_da_margem).toBe(false)
    } finally {
      h.fornecedor.responder('soc.alteracao.classificar', RESPOSTAS_SIMULADAS['soc.alteracao.classificar']!)
    }
  })
})

describe('bolsa do piloto', () => {
  it('sem saldo no piloto, a sombra para sem cartão e sem tocar a bolsa do setor', async () => {
    const s = await semear(admin, { bolsa_piloto: 0 })
    const a: AmbienteAvaliacao = { sql: admin, motor: h.motor, escritorio_id: s.esc, cliente_id: s.cliente, cnpj: s.cnpj, ctx: await pessoa(admin, s.esc, 'u-ana') }
    const l = await avaliarCaso(a, gabaritoDp[0]!)
    expect(l).toMatchObject({ estado: 'cancelada', resultado: 'falha', obtido: 'cancelada:BOLSA_SEM_SALDO' })
    expect(await admin`select 1 from cartao_aprovacao where escritorio_id = ${s.esc}`).toHaveLength(0)
    const [dp] = await admin`select gasto_centavos from bolsa_setor where escritorio_id = ${s.esc} and setor = 'dp'`
    expect(dp!.gasto_centavos).toBe(0)
  })
})

describe('sombra no dia a dia: comparação com o que a pessoa fez', () => {
  it('registra acerto, erro crítico e cartão contra a decisão real da pessoa', async () => {
    const s = await semear(admin, { bolsa_centavos: 10_000 })
    const ctx = await pessoa(admin, s.esc, 'u-dp', 'job')
    const casos = [
      { texto: 'O Pedro fez 10 horas extras em 10/2026.', pessoa: 'hora_extra:2026-10:10' },
      { texto: 'A Maria faltou 2 dias em 09/2026.', pessoa: 'falta:2026-09:1' },
      { texto: 'Na folha de 10/2026: o Pedro fez 5 horas extras e a Ana faltou 1 dia.', pessoa: 'hora_extra:2026-10:5' },
    ]
    for (const [i, c] of casos.entries()) {
      const doc = await documento(admin, s, 'mensagem', { texto_extraido: c.texto })
      await iniciarSombra(admin, h.motor, ctx, 'DP-EVENTO-FOLHA', { cliente_id: 'c-1', documento_id: doc }, `ref-${i}`)
    }
    // A pessoa decide no trabalho real; o sistema fecha a comparação sozinho quando a sombra termina.
    for (const [i, c] of casos.entries()) await registrarDecisaoDaPessoa(admin, s.esc, 'DP-EVENTO-FOLHA', `ref-${i}`, c.pessoa)
    const fim = Date.now() + 30_000
    while ((await comEscritorio(admin, s.esc, (tx) => tx`select 1 from comparacao_sombra where resultado is null`)).length && Date.now() < fim) {
      await fecharComparacoes(admin, s.esc)
      await new Promise((r) => setTimeout(r, 200))
    }
    const [r] = await resumoSombra(admin, s.esc, { setor: 'dp' })
    expect(r).toMatchObject({ setor: 'dp', comparacoes: 3, acertos: 1, erros_criticos: 1, cartoes: 1 })
    expect(await admin`select 1 from cartao_aprovacao where escritorio_id = ${s.esc}`).toHaveLength(0)
  })
})

describe('portão do Haiku', () => {
  it('não libera o Haiku num passo em que ele erra onde o Sonnet acerta; o contrato continua no Sonnet', async () => {
    const a = await ambiente()
    h.fornecedor.responder('dp.evento.classificar', (e: { competencias: string[]; quantidades: string[]; trecho: unknown }, p) =>
      p.modelo === 'claude-haiku-5-5' ? { tipo_evento: 'outro', competencia: e.competencias[0], quantidade: null, confianca: 0.97, motivo: 'Errou.' } : RESPOSTAS_SIMULADAS['dp.evento.classificar']!(e),
    )
    try {
      const { decisao, sonnet, haiku } = await rodarPortaoHaiku(a, modelos, 'dp.evento.classificar', gabaritoDp, { concorrencia: 3 })
      expect(decisao).toMatchObject({ liberado: false, configuracao: null })
      expect(decisao.erro_critico_haiku).toBeGreaterThan(0)
      expect(sonnet.flatMap((l) => l.chamadas).every((c) => c.modelo !== 'claude-haiku-5-5')).toBe(true)
      expect(haiku.flatMap((l) => l.chamadas.filter((c) => c.classe === 'operario')).every((c) => c.modelo === 'claude-haiku-5-5')).toBe(true)
      // A configuração volta ao que era.
      expect(modelos.porContrato?.['dp.evento.classificar']).toBeUndefined()
    } finally {
      h.fornecedor.responder('dp.evento.classificar', RESPOSTAS_SIMULADAS['dp.evento.classificar']!)
    }
  })

  it('libera quando o Haiku iguala o Sonnet caso a caso', async () => {
    const a = await ambiente()
    const guias = gabaritoFiscal.filter((c) => c.procedimento === 'FIS-CAIXA-POSTAL-TRIAR')
    const { decisao } = await rodarPortaoHaiku(a, modelos, 'fis.caixa_postal.classificar', guias, { concorrencia: 3 })
    expect(decisao).toMatchObject({ liberado: true, configuracao: { 'fis.caixa_postal.classificar': { operario: 'claude-haiku-5-5' } } })
  })

  it('um caso isolado devolve a linha com custo em frações de centavo e latência', async () => {
    const a = await ambiente()
    const l = await avaliarCaso(a, gabaritoFiscal[0]!)
    expect(l).toMatchObject({ caso: 'guia-das', resultado: 'acerto', estado: 'concluida' })
    expect(l.centavos).toBeGreaterThan(0)
    expect(Number.isInteger(l.centavos)).toBe(false)
  })
})

import { describe, expect, it } from 'vitest'
import { arredondarCentavos, centavosDe, configAnthropic, ctbCompetenciaDoc, type Procedimento } from '@heild/processos'
import {
  classificar,
  competenciasDoTexto,
  decidirPortaoHaiku,
  definirIntegrante,
  integranteFiscal,
  integrantesContabil,
  margem,
  numerosDoTexto,
  opcoesDeRota,
  resolverDosIntegrantes,
  resposta,
  RespostaPadrao,
  rotearPorRegras,
  type LinhaAvaliacao,
} from '../src/index.ts'
import { gabaritoRoteamento } from '../src/avaliacao/gabarito.ts'

const base = integranteFiscal

describe('contrato padrão de integrante', () => {
  it('os cinco setores do Contábil têm integrante, cada um com pelo menos um procedimento', () => {
    expect(integrantesContabil.map((i) => i.setor).sort()).toEqual(['contabil', 'dp', 'fiscal', 'gestao_atendimento', 'societario'])
    for (const i of integrantesContabil) {
      expect(i.procedimentos.length).toBeGreaterThan(0)
      expect(i.limites.simultaneas).toBe(10)
      expect(i.limiar_confianca).toBe(0.9)
      // Pacote em ordem fixa (cache) e só do setor, transversal ou do registro afetado.
      expect(i.pacote.map((f) => f.nome)).toEqual([...i.pacote.map((f) => f.nome)].sort())
      for (const f of i.pacote) expect([i.setor, 'geral', 'alvo']).toContain(f.setor)
    }
  })

  it('recusa ferramenta de outro setor no pacote', () => {
    expect(() => definirIntegrante({ ...base, ferramentas: [...base.ferramentas, 'contabil.ecd_ecf.transmitir'] }, resolverDosIntegrantes)).toThrow(/é do setor contabil/)
  })

  it('recusa procedimento que usa ferramenta fora do pacote', () => {
    expect(() => definirIntegrante({ ...base, ferramentas: base.ferramentas.filter((f) => f !== 'fiscal.guia.enviar') }, resolverDosIntegrantes)).toThrow(/fora do pacote/)
  })

  it('recusa procedimento de outro setor e limiar de confiança mais frouxo que o do integrante', () => {
    expect(() => definirIntegrante({ ...base, procedimentos: [{ ...base.procedimentos[0]!, procedimento: ctbCompetenciaDoc as unknown as Procedimento }] }, resolverDosIntegrantes)).toThrow(/setor contabil/)
    expect(() => definirIntegrante({ ...base, limiar_confianca: 0.95 }, resolverDosIntegrantes)).toThrow(/abaixo do limiar/)
  })

  it('recusa escalada ao escritor sem o papel e limite fora da faixa', () => {
    expect(() => definirIntegrante({ ...base, papeis: { operario: true, escritor: false, revisor: false } }, resolverDosIntegrantes)).toThrow(/escritor sem o papel/)
    expect(() => definirIntegrante({ ...base, limites: { simultaneas: 0, segundo_plano_por_pessoa: 3 } }, resolverDosIntegrantes)).toThrow(/simultaneas/)
  })
})

describe('resposta padrão', () => {
  const de = { tipo: 'integrante' as const, id: 'i-fiscal', setor: 'fiscal', nome: 'Fiscal' }
  const origem = { procedimento: 'FIS-GUIA-CONFERIR@1', execucao_id: 'ex1', pedido_id: null, posicao_na_fila: null }

  it('valida o formato e escreve o texto pelo sistema, no tom fixo do tipo', () => {
    const r = resposta({ de, origem, tipo: 'aguardando_aprovacao', titulo: 'Pronto para aprovar', resumo: 'Enviar a guia de DAS.' })
    expect(RespostaPadrao.parse(r)).toEqual(r)
    expect(r.texto).toBe('Preparei e falta a sua aprovação: Enviar a guia de DAS.')
    expect(r.formato).toBe('heild.resposta@1')
  })

  it('recusa campo a mais (formato estrito) e corta texto longo', () => {
    expect(() => RespostaPadrao.parse({ ...resposta({ de, origem, tipo: 'concluido', titulo: 'x' }), extra: 1 })).toThrow()
    expect(resposta({ de, origem, tipo: 'concluido', titulo: 'x', texto: 'a'.repeat(900) }).texto.length).toBe(600)
  })
})

describe('roteamento por regras (camada 1)', () => {
  it('o tipo do documento decide quando aponta um procedimento só', () => {
    const r = rotearPorRegras('qualquer coisa', 'guia', opcoesDeRota(integrantesContabil, 'guia'))
    expect(r.decisao).toMatchObject({ camada: 'regra', procedimento_id: 'FIS-GUIA-CONFERIR', confianca: 1 })
  })

  it('casos do gabarito que as regras devem decidir, e os que devem subir ao modelo', () => {
    const porRegra = ['rota-competencia', 'rota-ecd', 'rota-guia', 'rota-ecac', 'rota-horas', 'rota-socio', 'rota-segunda-via']
    for (const c of gabaritoRoteamento) {
      const r = rotearPorRegras(c.texto, c.documento.tipo, opcoesDeRota(integrantesContabil, c.documento.tipo))
      if (porRegra.includes(c.id)) expect(r.decisao?.procedimento_id, c.id).toBe(c.esperado)
      else expect(r.decisao, c.id).toBeNull()
    }
  })

  it('o documento anexado corta as opções (mensagem não vai para a ECD nem para a guia)', () => {
    const ids = opcoesDeRota(integrantesContabil, 'mensagem').map((o) => o.procedimento_id)
    expect(ids).not.toContain('CTB-ECD-TRANSMITIR')
    expect(ids).not.toContain('FIS-GUIA-CONFERIR')
    expect(ids).toContain('DP-EVENTO-FOLHA')
  })
})

describe('débito em frações de centavo', () => {
  it('não arredonda cada chamada para o centavo de cima', () => {
    const preco = configAnthropic(5.4).precos['claude-sonnet-5-5']!
    // Uma chamada típica do teste real: ~630 tokens de entrada e ~80 de saída.
    const c = centavosDe(preco, { tokens_entrada: 630, tokens_saida: 80, tokens_cache: 0 })
    expect(c).toBeGreaterThan(0)
    // ≈ 1,11 centavo: antes o débito era 2 centavos (o centavo de cima).
    expect(Number.isInteger(c)).toBe(false)
    expect(c).toBeLessThan(Math.ceil(c))
    expect(c).toBeCloseTo((630 * 2 + 80 * 10) * 5.4 * 100 / 1_000_000, 6)
    expect(arredondarCentavos(0.1 + 0.2)).toBe(0.3)
  })
})

describe('extração por código', () => {
  it('competências e números do texto, sem futuro e sem as partes das datas', () => {
    expect(competenciasDoTexto('Referência 08/2026. Pago em 05/09/2026. Próxima 12/2099.')).toEqual(['2026-09', '2026-08'])
    expect(numerosDoTexto('O Pedro fez 10 horas extras em 10/2026, pago em 05/11/2026.')).toEqual(['10'])
    expect(numerosDoTexto('Adiantamento de 1.500,50 e 2,5 horas')).toContain('2.5')
  })
})

describe('avaliação: classificação, margem e portão do Haiku', () => {
  it('classifica erro crítico, cartão desnecessário e falha', () => {
    expect(classificar('DAS:2026-10', 'DAS:2026-10')).toBe('acerto')
    expect(classificar('DAS:2026-10', 'DAS:2026-09')).toBe('erro_critico')
    expect(classificar('cartao', 'DAS:2026-10')).toBe('erro_critico')
    expect(classificar('DAS:2026-10', 'cartao')).toBe('cartao_desnecessario')
    expect(classificar('DAS:2026-10', 'falhou:TECNICO')).toBe('falha')
    expect(classificar('contem:1.1.05', '1.1.02,1.1.05')).toBe('acerto')
    expect(classificar('contem:1.1.05', '1.1.02')).toBe('erro_critico')
  })

  it('margem de −3 pontos contra a pessoa, na taxa de erro', () => {
    expect(margem(5, 2)).toEqual({ pontos: -3, dentro: true })
    expect(margem(5.1, 2).dentro).toBe(false)
    expect(margem(0, 4).dentro).toBe(true)
  })

  it('o Haiku só é liberado se igualar o Sonnet caso a caso, sem erro crítico', () => {
    const l = (caso: string, resultado: LinhaAvaliacao['resultado']) => ({ caso, rodada: 1, resultado }) as LinhaAvaliacao
    const sonnet = [l('a', 'acerto'), l('b', 'acerto'), l('c', 'cartao_desnecessario')]
    expect(decidirPortaoHaiku('x', sonnet, [l('a', 'acerto'), l('b', 'acerto'), l('c', 'acerto')]).liberado).toBe(true)
    expect(decidirPortaoHaiku('x', sonnet, [l('a', 'acerto'), l('b', 'acerto'), l('c', 'cartao_desnecessario')]).configuracao).toEqual({ x: { operario: 'claude-haiku-5-5' } })
    const pior = decidirPortaoHaiku('x', sonnet, [l('a', 'acerto'), l('b', 'cartao_desnecessario'), l('c', 'acerto')])
    expect(pior).toMatchObject({ liberado: false, casos_piores: ['b'], configuracao: null })
    expect(decidirPortaoHaiku('x', sonnet, [l('a', 'acerto'), l('b', 'acerto'), l('c', 'erro_critico')]).liberado).toBe(false)
    expect(decidirPortaoHaiku('x', sonnet, [l('a', 'acerto')]).liberado).toBe(false)
  })
})

describe('gabarito ampliado (portão do Haiku)', () => {
  it('30 casos distintos por contrato de operário e 30 ou mais de roteamento, com casos em que o certo é não decidir', async () => {
    const { ampliadoPorContrato, roteamentoAmpliado } = await import('../src/avaliacao/gabarito-ampliado.ts')
    expect(Object.keys(ampliadoPorContrato).sort()).toEqual(['ctb.competencia.escolher', 'ctb.ecd.apontar_atencao', 'dp.evento.classificar', 'fis.caixa_postal.classificar', 'fis.guia.identificar', 'ges.faq.escolher', 'ges.triagem.classificar', 'soc.alteracao.classificar'])
    for (const [contrato, casos] of Object.entries(ampliadoPorContrato)) {
      expect(new Set(casos.map((c) => c.id)).size, contrato).toBeGreaterThanOrEqual(30)
      // ECD: o certo é sempre apontar a conta plantada. Caixa postal: toda mensagem tem categoria; os
      // casos difíceis ali são os de várias datas (o prazo é uma delas), não os de não decidir.
      if (contrato === 'fis.caixa_postal.classificar') expect(casos.filter((c) => c.id.includes('duas-datas') || c.id.includes('efeitos')).length).toBeGreaterThanOrEqual(4)
      // Triagem: não decidir é perguntar ao cliente (sem responsável) ou ir à pessoa (com responsável).
      else if (contrato === 'ges.triagem.classificar') expect(casos.filter((c) => ['cartao', 'pergunta', 'sem_acordo'].includes(c.esperado)).length).toBeGreaterThanOrEqual(10)
      else if (contrato !== 'ctb.ecd.apontar_atencao') expect(casos.filter((c) => c.esperado === 'cartao').length, contrato).toBeGreaterThanOrEqual(3)
    }
    expect(new Set(roteamentoAmpliado.map((c) => c.id)).size).toBeGreaterThanOrEqual(30)
    expect(roteamentoAmpliado.filter((c) => c.esperado === 'pergunta').length).toBeGreaterThanOrEqual(3)
  })

  it('as ECDs do gabarito fecham por regra (partidas e saldos), para o caso chegar ao operário', async () => {
    const { ampliadoEcd } = await import('../src/avaliacao/gabarito-ampliado.ts')
    for (const c of ampliadoEcd) {
      const { ecd } = (c.documento.metadados as (a: { cnpj: string }) => { ecd: { contas: { natureza: string; saldo_inicial_centavos: number; debitos_centavos: number; creditos_centavos: number; saldo_final_centavos: number }[]; total_debitos_centavos: number; total_creditos_centavos: number } })({ cnpj: '12345678000190' })
      expect(ecd.total_debitos_centavos, c.id).toBe(ecd.total_creditos_centavos)
      for (const x of ecd.contas) {
        const mov = x.natureza === 'D' ? x.debitos_centavos - x.creditos_centavos : x.creditos_centavos - x.debitos_centavos
        expect(x.saldo_inicial_centavos + mov, c.id).toBe(x.saldo_final_centavos)
      }
    }
  })
})

describe('DP v2: quantidade obrigatória', () => {
  it('hora extra, falta e adiantamento sem quantidade são barrados (escalável); férias não precisam', async () => {
    const { rodarValidadores } = await import('@heild/processos')
    const r = (escolha: Record<string, unknown>) => rodarValidadores(['quantidade_quando_exigida'], { escolha }, null)
    expect((await r({ tipo_evento: 'hora_extra', quantidade: null }))[0]).toMatchObject({ ok: false, codigo: 'SEM_QUANTIDADE', escalavel: true })
    expect((await r({ tipo_evento: 'falta', quantidade: '' }))[0]!.ok).toBe(false)
    expect((await r({ tipo_evento: 'hora_extra', quantidade: '10' }))[0]!.ok).toBe(true)
    expect((await r({ tipo_evento: 'ferias', quantidade: null }))[0]!.ok).toBe(true)
  })
})

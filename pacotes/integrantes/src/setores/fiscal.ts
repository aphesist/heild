import { z } from 'zod'
import { definirContrato } from '@heild/processos'
import { competenciasDoTexto, datasDoTexto, procedimentoDeEscolha, type Escolha, type Lido, type OpcoesEscolha } from '../escolha.ts'
import { resolverCom } from '../metas.ts'

/**
 * Fiscal. Dois procedimentos de referência do setor:
 *  - FIS-GUIA-CONFERIR: antes de mandar a guia ao cliente, o código confere o valor com a apuração;
 *    o operário só identifica tributo e competência quando a guia não traz o código de receita.
 *    Enviar ao cliente é irreversível: cartão sempre.
 *  - FIS-CAIXA-POSTAL-TRIAR: a mensagem da caixa postal do e-CAC é classificada (intimação, malha,
 *    exclusão do Simples, cobrança, informativo) e o prazo vem só das datas do texto.
 */

const reais = (c: number) => (c / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const Competencia = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/)

export const TRIBUTOS = ['DAS', 'IRPJ', 'CSLL', 'PIS', 'COFINS', 'INSS', 'FGTS', 'ISS', 'ICMS'] as const
const PALAVRAS: Record<(typeof TRIBUTOS)[number], RegExp> = {
  DAS: /\bDAS\b|simples nacional/i,
  IRPJ: /\bIRPJ\b|\b2089\b|imposto de renda pessoa jur/i,
  CSLL: /\bCSLL\b|\b2372\b|contribui[çc][ãa]o social sobre o lucro/i,
  PIS: /\bPIS\b|\b8109\b/i,
  COFINS: /\bCOFINS\b|\b2172\b/i,
  INSS: /\bGPS\b|\bINSS\b|previd[êe]nci/i,
  FGTS: /\bFGTS\b/i,
  ISS: /\bISS\b|\bISSQN\b/i,
  ICMS: /\bICMS\b/i,
}
/** Código de receita do DARF → tributo (a regra decide sem modelo). */
const CODIGO_RECEITA: Record<string, (typeof TRIBUTOS)[number]> = { '2089': 'IRPJ', '2372': 'CSLL', '8109': 'PIS', '2172': 'COFINS' }

export const contratoGuia = definirContrato({
  id: 'fis.guia.identificar',
  versao: 1,
  classe: 'operario',
  // Provisória: o prompt é da frente de IA (pacotes/contratos-ia).
  instrucao:
    'Você lê o texto de uma guia de tributo brasileira e identifica o tributo e a competência (mês de apuração). ' +
    'Escolha só entre as opções dadas. Competência é o mês a que o tributo se refere, não o vencimento. ' +
    'Se não der para saber, use confiança baixa.',
  recebe: z.object({ trecho: z.string().max(2000), tributos: z.array(z.string()).min(1).max(9), competencias: z.array(Competencia).max(6) }).strict(),
  devolve: z.object({ tributo: z.enum(TRIBUTOS), competencia: Competencia, confianca: z.number().min(0).max(1), motivo: z.string().min(3).max(140) }).strict(),
  max_tokens_saida: 120,
  campos_externos: ['trecho'],
})

const opcoesGuia = {
  id: 'FIS-GUIA-CONFERIR',
  versao: 1,
  nome: 'Conferir e enviar a guia ao cliente',
  setor: 'fiscal',
  operacao: 'fiscal.guia.conferir_e_enviar',
  descricao_modelo: 'Confere a guia (tributo, competência e valor contra a apuração) e, com cartão aprovado, envia ao cliente.',
  tipos_documento: ['guia'],
  contrato: contratoGuia,
  campos: ['tributo', 'competencia'],
  chave_metadados: 'guia_conferida',
  ler: (d): Lido => {
    const m = d.metadados as { codigo_receita?: string; competencia?: string; tributo?: string; valor_centavos?: number; apuracao?: Record<string, Record<string, number>> }
    const achados = TRIBUTOS.filter((t) => PALAVRAS[t].test(d.texto))
    const tributos = achados.length ? [...achados] : [...TRIBUTOS]
    const competencias = competenciasDoTexto(d.texto)
    const porCodigo = m.codigo_receita ? CODIGO_RECEITA[m.codigo_receita] : undefined
    const regra =
      porCodigo && m.competencia && Competencia.safeParse(m.competencia).success
        ? { escolha: { tributo: porCodigo, competencia: m.competencia }, motivo: `código de receita ${m.codigo_receita}` }
        : null
    return {
      tipo: d.tipo,
      candidatas: { tributo: tributos, competencia: competencias },
      regra,
      trecho: d.texto,
      contexto: { valor_centavos: typeof m.valor_centavos === 'number' ? m.valor_centavos : null, apuracao: m.apuracao ?? {} },
    }
  },
  recebe: (l) => ({ trecho: l.trecho, tributos: l.candidatas.tributo as string[], competencias: l.candidatas.competencia as string[] }),
  validadores: ['escolha_nas_candidatas', 'confianca_minima:0.9', 'competencia_passada_ou_atual', 'valor_confere_apuracao'],
  aprovacao: {
    ferramenta: 'fiscal.guia.enviar',
    exigida: 'sempre',
    resumo: (e, l) => `Enviar ao cliente a guia de ${e.tributo} da competência ${e.competencia}, de ${reais(Number(l.contexto.valor_centavos ?? 0))} (confere com a apuração).`,
    cartoes: (e, l) => [{ tipo: 'tabela', titulo: 'Guia conferida', colunas: ['Tributo', 'Competência', 'Valor'], linhas: [[String(e.tributo), String(e.competencia), reais(Number(l.contexto.valor_centavos ?? 0))]] }],
  },
  orcamento: { centavos: 8, tokens: 8_000 },
  resolver: resolverCom(),
} satisfies OpcoesEscolha

export const fisGuiaConferir = procedimentoDeEscolha(opcoesGuia)

/** v2 (B3b): revisor de risco (Opus) antes do cartão, porque o ato é irreversível. */
const opcoesGuiaV2 = {
  ...opcoesGuia,
  versao: 2,
  orcamento: { centavos: 30, tokens: 12_000 },
  revisor: { evidencias: (e: Escolha, l: Lido) => [
      { rotulo: 'Valor da guia', valor: reais(Number(l.contexto.valor_centavos ?? 0)) },
      { rotulo: 'Apuração do tributo na competência', valor: reais(Number((l.contexto.apuracao as Record<string, Record<string, number>>)[String(e.tributo)]?.[String(e.competencia)] ?? 0)) },
      { rotulo: 'Opções de tributo no texto', valor: (l.candidatas.tributo as string[]).join(', ') },
      { rotulo: 'Competências no texto', valor: (l.candidatas.competencia as string[]).join(', ') || 'nenhuma' },
    ] },
} satisfies OpcoesEscolha
export const fisGuiaConferirV2 = procedimentoDeEscolha(opcoesGuiaV2)

/**
 * v3: o envio da guia ao cliente segue o modo da categoria `guia_emitida` escolhido pelo escritório
 * (cartão por padrão, envio automático ou desligado), com a mensagem padronizada escrita pelo sistema.
 */
export const fisGuiaConferirV3 = procedimentoDeEscolha({
  ...opcoesGuiaV2,
  versao: 3,
  aprovacao: {
    ...opcoesGuia.aprovacao,
    exigida: 'por_categoria',
    categoria: 'guia_emitida',
    mensagem_ao_cliente: (e, l) => `Sua guia de ${e.tributo} da competência ${String(e.competencia).split('-').reverse().join('/')} está pronta: ${reais(Number(l.contexto.valor_centavos ?? 0))}.`,
  },
})

export const CATEGORIAS_CAIXA_POSTAL = ['intimacao', 'malha', 'exclusao_simples', 'cobranca', 'informativo'] as const

export const contratoCaixaPostal = definirContrato({
  id: 'fis.caixa_postal.classificar',
  versao: 1,
  classe: 'operario',
  instrucao:
    'Você lê uma mensagem da caixa postal da Receita Federal (e-CAC) e a classifica numa das categorias dadas. ' +
    'Se a mensagem dá prazo para o contribuinte agir, escolha a data entre as opções; se não dá, use null. ' +
    'Se não der para saber a categoria, use confiança baixa.',
  recebe: z.object({ trecho: z.string().max(2000), categorias: z.array(z.string()).length(5), prazos: z.array(z.string()).max(6) }).strict(),
  devolve: z
    .object({ categoria: z.enum(CATEGORIAS_CAIXA_POSTAL), prazo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(), confianca: z.number().min(0).max(1), motivo: z.string().min(3).max(140) })
    .strict(),
  max_tokens_saida: 120,
  campos_externos: ['trecho'],
})

export const fisCaixaPostal = procedimentoDeEscolha({
  id: 'FIS-CAIXA-POSTAL-TRIAR',
  versao: 1,
  nome: 'Triar mensagem da caixa postal do e-CAC',
  setor: 'fiscal',
  operacao: 'fiscal.caixa_postal.triar',
  descricao_modelo: 'Classifica a mensagem do e-CAC e registra o prazo que ela dá.',
  tipos_documento: ['mensagem_ecac'],
  contrato: contratoCaixaPostal,
  campos: ['categoria', 'prazo'],
  chave_metadados: 'triagem_ecac',
  ler: (d) => ({
    tipo: d.tipo,
    candidatas: { categoria: [...CATEGORIAS_CAIXA_POSTAL], prazo: [...datasDoTexto(d.texto), null] },
    regra: null,
    trecho: d.texto,
    contexto: {},
  }),
  recebe: (l) => ({ trecho: l.trecho, categorias: l.candidatas.categoria as string[], prazos: (l.candidatas.prazo as (string | null)[]).filter((x): x is string => x !== null) }),
  validadores: ['escolha_nas_candidatas', 'confianca_minima:0.9'],
  aprovacao: {
    ferramenta: 'documento.atualizar',
    exigida: 'por_regra',
    resumo: (e) => `Registrar a mensagem como ${String(e.categoria).replace('_', ' ')}${e.prazo ? `, com prazo em ${e.prazo}` : ', sem prazo'}.`,
  },
  orcamento: { centavos: 8, tokens: 8_000 },
  resolver: resolverCom(),
})

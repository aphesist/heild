import { z } from 'zod'
import { ErroRegra } from '../../contexto.ts'
import { definirProcedimento } from '../../motor/definicao.ts'
import { definirContrato } from '../../operarios/contrato.ts'

/**
 * CTB-COMPETENCIA-DOC · Classificar a competência (o mês) de um documento que chegou (Contábil).
 *
 * Por que este é de referência: é o trabalho disparado por evento que mais se repete. O despachante
 * inicia direto a execução quando um documento é registrado; a regra resolve a maior parte (campo de
 * competência, data de emissão de nota); só o que sobra vai a um operário barato, que ESCOLHE entre
 * as competências que o código achou no documento. Validadores conferem; dúvida vira cartão
 * "não consegui". O integrante só é acordado se houver algo para a pessoa ver.
 */

const Competencia = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/)
const TIPOS_COM_EMISSAO = ['nfe', 'nfse', 'cte', 'nfce']

export const contratoEscolherCompetencia = definirContrato({
  id: 'ctb.competencia.escolher',
  versao: 1,
  classe: 'operario',
  instrucao:
    'Você lê um trecho de documento contábil e escolhe a competência (mês de referência) entre as candidatas. ' +
    'Responda só com uma das candidatas, a confiança de 0 a 1 e um motivo curto. Se não der para saber, use confiança baixa.',
  recebe: z.object({ tipo_documento: z.string(), trecho: z.string().max(2000), candidatas: z.array(Competencia).min(1).max(6) }).strict(),
  devolve: z.object({ competencia: Competencia, confianca: z.number().min(0).max(1), motivo: z.string().min(3).max(140) }).strict(),
  max_tokens_saida: 120,
  campos_externos: ['trecho'],
})

const mesDe = (iso: string) => iso.slice(0, 7)

/** Competências que aparecem no texto (dd/mm/aaaa e mm/aaaa) mais o mês de chegada e o anterior. */
export function candidatasDe(texto: string, chegada: Date): string[] {
  const achadas = new Set<string>()
  for (const m of texto.matchAll(/\b(\d{2})\/(\d{2})\/(\d{4})\b/g)) achadas.add(`${m[3]}-${m[2]}`)
  for (const m of texto.matchAll(/\b(\d{2})\/(\d{4})\b/g)) achadas.add(`${m[2]}-${m[1]}`)
  const c = new Date(chegada)
  achadas.add(c.toISOString().slice(0, 7))
  c.setUTCDate(1)
  c.setUTCMonth(c.getUTCMonth() - 1)
  achadas.add(c.toISOString().slice(0, 7))
  return [...achadas].filter((x) => Competencia.safeParse(x).success).sort().reverse().slice(0, 6)
}

/**
 * v2 (B3b): a instrução diz a ordem de precedência das datas. O teste real mostrou o caso "seguro"
 * (só o vencimento no texto) indo ao cartão sem necessidade. Os candidatos, os validadores e o
 * limiar não mudam: a instrução só orienta a escolha entre as mesmas opções.
 */
export const contratoEscolherCompetenciaV2 = definirContrato({
  ...contratoEscolherCompetencia,
  versao: 2,
  instrucao:
    'Você lê um trecho de documento contábil e escolhe a competência (mês de referência) entre as candidatas. ' +
    'Use esta ordem: (1) mês de referência, competência ou período escrito no documento; ' +
    '(2) período de apuração, de leitura ou de prestação do serviço; ' +
    '(3) mês em que a despesa ou o fato aconteceu; ' +
    '(4) se o documento só traz o vencimento de uma parcela ou conta, o mês do vencimento. ' +
    'Nunca use a data de pagamento, de emissão do recibo ou de chegada quando houver uma data dos itens anteriores. ' +
    'Se houver duas referências sem indicação de qual vale, ou nenhuma data, use confiança baixa. ' +
    'Responda só com uma das candidatas, a confiança de 0 a 1 e um motivo curto.',
})

const definirCompetencia = (versao: number, contrato: typeof contratoEscolherCompetencia) => definirProcedimento({
  id: 'CTB-COMPETENCIA-DOC',
  versao,
  nome: 'Classificar a competência de um documento',
  setor: 'contabil',
  nivel_maximo: 'executar',
  operacao: 'contabil.documento.classificar_competencia',
  descricao_modelo: 'Define o mês de competência de um documento recebido, por regra ou escolha conferida.',
  entrada: z.object({ documento_id: z.string().min(1), cliente_id: z.string().min(1) }).strict(),
  saida: z.object({ documento_id: z.string(), competencia: Competencia, origem: z.enum(['regra', 'modelo', 'pessoa']) }).strict(),
  orcamento: { centavos: 5, tokens: 6_000 },
  cliente: (e) => e.cliente_id,
  gatilho: {
    evento: 'documento.criar',
    entrada: (ev) => {
      const documento_id = ev.argumentos_resumo?.documento_id ?? ev.resultado_ref
      return documento_id && ev.cliente_id ? { documento_id, cliente_id: ev.cliente_id } : null
    },
    // Checagem sem modelo: só documento de cliente, ainda sem competência.
    condicao: async (tx, e) => {
      const [d] = await tx`select competencia, cliente_id from documento where id = ${e.documento_id}`
      return Boolean(d && d.cliente_id && !d.competencia)
    },
  },
  passos: [
    {
      tipo: 'deterministico',
      nome: 'ler_documento',
      executar: async (s, { tx }) => {
        const [d] = await tx`select id, cliente_id, tipo, competencia, criado_em, metadados from documento where id = ${s.entrada.documento_id}`
        if (!d) throw new ErroRegra('DOCUMENTO_INEXISTENTE', 'Documento não encontrado.', 'documento_id')
        if (d.cliente_id !== s.entrada.cliente_id) throw new ErroRegra('DOCUMENTO_DE_OUTRO_CLIENTE', 'O documento é de outro cliente.', 'cliente_id')
        if (d.competencia) throw new ErroRegra('JA_CLASSIFICADO', `O documento já está na competência ${d.competencia}.`)
        const m = (d.metadados ?? {}) as { data_competencia?: string; data_emissao?: string; periodo_referencia?: string; texto_extraido?: string }
        let regra: { competencia: string; motivo: string } | null = null
        if (m.data_competencia && Competencia.safeParse(mesDe(m.data_competencia)).success) regra = { competencia: mesDe(m.data_competencia), motivo: 'campo de competência do documento' }
        else if (TIPOS_COM_EMISSAO.includes(d.tipo) && m.data_emissao) regra = { competencia: mesDe(m.data_emissao), motivo: 'nota fiscal: mês da emissão' }
        else if (m.periodo_referencia && Competencia.safeParse(m.periodo_referencia).success) regra = { competencia: m.periodo_referencia, motivo: 'período de referência informado' }
        const texto = String(m.texto_extraido ?? '').slice(0, 2000)
        return { tipo: d.tipo, regra, trecho: texto, candidatas: candidatasDe(texto, new Date(d.criado_em)) }
      },
    },
    {
      tipo: 'operario',
      nome: 'escolher_competencia',
      contrato,
      pular_se: (s) => s.saidas.ler_documento.regra !== null,
      recebe: (s) => ({ tipo_documento: s.saidas.ler_documento.tipo, trecho: s.saidas.ler_documento.trecho, candidatas: s.saidas.ler_documento.candidatas }),
    },
    {
      tipo: 'validar',
      nome: 'conferir',
      validadores: ['competencia_nas_candidatas', 'confianca_minima:0.9', 'competencia_nao_futura', 'competencia_aberta'],
      dados: (s) => {
        const e = escolhida(s.saidas)
        return { competencia: e.competencia, origem: e.origem, confianca: e.confianca, candidatas: s.saidas.ler_documento.candidatas, cliente_id: s.entrada.cliente_id }
      },
      sobre: 'escolher_competencia',
      ao_falhar: 'escalar',
    },
    {
      tipo: 'aprovacao',
      nome: 'confirmar',
      ferramenta: 'documento.classificar',
      // Faz sozinho se a lista do escritório liberar; senão, cartão.
      exigida: 'por_regra',
      esquema: z.object({ documento_id: z.string(), competencia: Competencia }).strict(),
      revalidar: ['competencia_nao_futura'],
      argumentos: (s) => ({ documento_id: s.entrada.documento_id, competencia: escolhida(s.saidas).competencia }),
      resumo: (s) => `Classificar o documento na competência ${escolhida(s.saidas).competencia} (${escolhida(s.saidas).motivo}).`,
    },
    {
      tipo: 'efeito',
      nome: 'classificar',
      ferramenta: 'documento.classificar',
      aprovacao: 'confirmar',
      executar: async (s, { tx }) => {
        const competencia = (s.saidas.confirmar.argumentos as { competencia: string }).competencia
        const origem = escolhida(s.saidas).origem
        const linhas = await tx`
          update documento set competencia = ${competencia},
            metadados = coalesce(metadados, '{}'::jsonb) || ${tx.json({ competencia_origem: origem, competencia_execucao: s.execucao.id } as never)}
          where id = ${s.entrada.documento_id} and competencia is null returning id`
        if (!linhas.length) throw new ErroRegra('JA_CLASSIFICADO', 'O documento foi classificado por outra via enquanto esta execução rodava.')
        return { dados: { competencia, origem }, texto_evento: `Documento classificado na competência ${competencia} (${origem})` }
      },
    },
    {
      tipo: 'concluir',
      nome: 'concluir',
      saida: (s) => ({ documento_id: s.entrada.documento_id, competencia: s.saidas.classificar.competencia, origem: s.saidas.classificar.origem }),
      // Por regra e sem cartão: nada a dizer. Com modelo, pessoa ou cartão: o integrante conta.
      acordar: (s) =>
        s.saidas.classificar.origem === 'regra' && s.saidas.confirmar.dispensada
          ? null
          : { titulo: `Documento classificado em ${s.saidas.classificar.competencia}`, dados: { documento_id: s.entrada.documento_id, origem: s.saidas.classificar.origem } },
    },
  ],
})

/** v1 continua carregada: execuções em andamento terminam na versão em que começaram. */
export const ctbCompetenciaDoc = definirCompetencia(1, contratoEscolherCompetencia)
export const ctbCompetenciaDocV2 = definirCompetencia(2, contratoEscolherCompetenciaV2)

function escolhida(saidas: Readonly<Record<string, any>>): { competencia: string; origem: 'regra' | 'modelo' | 'pessoa'; confianca: number | null; motivo: string } {
  const op = saidas.escolher_competencia
  if (op && !op.pulado) return { competencia: op.competencia, origem: op.origem === 'pessoa' ? 'pessoa' : 'modelo', confianca: op.confianca ?? null, motivo: op.motivo }
  const r = saidas.ler_documento.regra
  return { competencia: r.competencia, origem: 'regra', confianca: null, motivo: r.motivo }
}

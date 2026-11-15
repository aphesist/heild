import { z } from 'zod'
import { definirValidador, type ResultadoValidador } from './registro.ts'

/** Validadores do Contábil usados pelos procedimentos de referência. Custo zero de modelo. */

const ok: ResultadoValidador = { ok: true }
const soDigitos = (s: string) => s.replace(/\D/g, '')
const reais = (c: number) => (c / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export const Conta = z.object({
  codigo: z.string(),
  nome: z.string(),
  natureza: z.enum(['D', 'C']),
  saldo_inicial_centavos: z.number().int(),
  debitos_centavos: z.number().int().nonnegative(),
  creditos_centavos: z.number().int().nonnegative(),
  saldo_final_centavos: z.number().int(),
})

definirValidador({
  nome: 'cnpj_confere_cliente',
  versao: 1,
  descricao: 'O CNPJ do arquivo é o do cliente da execução (cliente errado é o erro mais grave).',
  dados: z.object({ carregar: z.object({ cnpj_arquivo: z.string(), cnpj_cliente: z.string() }) }),
  conferir: ({ carregar }) =>
    soDigitos(carregar.cnpj_arquivo) === soDigitos(carregar.cnpj_cliente) && soDigitos(carregar.cnpj_cliente).length === 14
      ? ok
      : { ok: false, codigo: 'CNPJ_DIVERGENTE', campo: 'cnpj', mensagem: `O arquivo é do CNPJ ${carregar.cnpj_arquivo}, mas o cliente é ${carregar.cnpj_cliente}.` },
})

definirValidador({
  nome: 'exercicio_confere',
  versao: 1,
  descricao: 'O exercício do arquivo é o pedido.',
  dados: z.object({ entrada: z.object({ exercicio: z.string() }), carregar: z.object({ exercicio_arquivo: z.string() }) }),
  conferir: ({ entrada, carregar }) =>
    entrada.exercicio === carregar.exercicio_arquivo ? ok : { ok: false, codigo: 'EXERCICIO_DIVERGENTE', campo: 'exercicio', mensagem: `O arquivo é do exercício ${carregar.exercicio_arquivo}, não de ${entrada.exercicio}.` },
})

definirValidador({
  nome: 'partidas_fecham',
  versao: 1,
  descricao: 'Débitos e créditos fecham no total e batem com a soma das contas.',
  dados: z.object({ carregar: z.object({ contas: z.array(Conta), total_debitos_centavos: z.number().int(), total_creditos_centavos: z.number().int() }) }),
  conferir: ({ carregar: c }) => {
    const d = c.contas.reduce((a, x) => a + x.debitos_centavos, 0)
    const k = c.contas.reduce((a, x) => a + x.creditos_centavos, 0)
    if (c.total_debitos_centavos !== c.total_creditos_centavos)
      return { ok: false, codigo: 'PARTIDAS_NAO_FECHAM', mensagem: `Débitos (${reais(c.total_debitos_centavos)}) e créditos (${reais(c.total_creditos_centavos)}) não fecham.` }
    if (d !== c.total_debitos_centavos || k !== c.total_creditos_centavos)
      return { ok: false, codigo: 'TOTAIS_DIVERGENTES', mensagem: `A soma das contas (D ${reais(d)}, C ${reais(k)}) não bate com os totais do arquivo.` }
    return ok
  },
})

definirValidador({
  nome: 'saldos_fecham_por_conta',
  versao: 1,
  descricao: 'Saldo final = inicial + movimento, conforme a natureza de cada conta.',
  dados: z.object({ carregar: z.object({ contas: z.array(Conta) }) }),
  conferir: ({ carregar }) => {
    const erradas = carregar.contas.filter((x) => {
      const mov = x.natureza === 'D' ? x.debitos_centavos - x.creditos_centavos : x.creditos_centavos - x.debitos_centavos
      return x.saldo_inicial_centavos + mov !== x.saldo_final_centavos
    })
    return erradas.length
      ? { ok: false, codigo: 'SALDO_NAO_FECHA', campo: erradas[0]!.codigo, mensagem: `Saldo final não fecha em ${erradas.length} conta(s): ${erradas.slice(0, 5).map((x) => x.codigo).join(', ')}.` }
      : ok
  },
})

definirValidador({
  nome: 'competencias_fechadas',
  versao: 1,
  descricao: 'As doze competências do exercício estão fechadas na contabilidade do cliente.',
  dados: z.object({ entrada: z.object({ cliente_id: z.string(), exercicio: z.string().regex(/^\d{4}$/) }) }),
  conferir: async ({ entrada }, { tx }) => {
    if (!tx) return { ok: false, codigo: 'SEM_BANCO', mensagem: 'Validador precisa do banco.' }
    const linhas = await tx`select competencia from competencia_contabil where cliente_id = ${entrada.cliente_id} and competencia like ${entrada.exercicio + '-%'} and situacao = 'fechada'`
    const fechadas = new Set(linhas.map((l) => l.competencia as string))
    const abertas = Array.from({ length: 12 }, (_, i) => `${entrada.exercicio}-${String(i + 1).padStart(2, '0')}`).filter((c) => !fechadas.has(c))
    return abertas.length ? { ok: false, codigo: 'COMPETENCIA_ABERTA', mensagem: `Há competência aberta no exercício: ${abertas.join(', ')}.` } : ok
  },
})

definirValidador({
  nome: 'ainda_nao_entregue',
  versao: 1,
  descricao: 'Não há entrega registrada desta obrigação para o mesmo cliente e período.',
  dados: z.object({ entrada: z.object({ cliente_id: z.string(), exercicio: z.string() }) }),
  conferir: async ({ entrada }, { tx, parametro }) => {
    if (!tx) return { ok: false, codigo: 'SEM_BANCO', mensagem: 'Validador precisa do banco.' }
    const [e] = await tx`select recibo from entrega_obrigacao where cliente_id = ${entrada.cliente_id} and obrigacao = ${parametro ?? 'ECD'} and periodo = ${entrada.exercicio}`
    return e ? { ok: false, codigo: 'JA_ENTREGUE', mensagem: `Já entregue (recibo ${e.recibo}).` } : ok
  },
})

definirValidador({
  nome: 'apontamentos_nas_candidatas',
  versao: 1,
  descricao: 'O operário só aponta contas que o código separou como atípicas.',
  dados: z.object({ apontamentos: z.array(z.object({ conta_codigo: z.string() })), candidatas: z.array(z.string()) }),
  conferir: ({ apontamentos, candidatas }) => {
    const fora = apontamentos.filter((a) => !candidatas.includes(a.conta_codigo))
    return fora.length ? { ok: false, codigo: 'CONTA_FORA_DAS_CANDIDATAS', escalavel: true, mensagem: `Apontou conta que não estava entre as candidatas: ${fora.map((f) => f.conta_codigo).join(', ')}.` } : ok
  },
})

definirValidador({
  nome: 'texto_sem_numero',
  versao: 1,
  descricao: 'Texto escrito por modelo não traz número: número só vem de ferramenta (07, 7).',
  dados: z.object({ textos: z.array(z.string()) }),
  conferir: ({ textos }) => {
    const com = textos.filter((t) => /\d/.test(t))
    return com.length ? { ok: false, codigo: 'NUMERO_ESCRITO_PELO_MODELO', escalavel: true, mensagem: 'O texto do operário trouxe número; números só podem vir do sistema.' } : ok
  },
})

const Competencia = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/)

definirValidador({
  nome: 'competencia_nas_candidatas',
  versao: 1,
  descricao: 'Competência escolhida pelo modelo está entre as que o código extraiu do documento.',
  dados: z.object({ competencia: Competencia, origem: z.enum(['regra', 'modelo', 'pessoa']), candidatas: z.array(Competencia) }),
  conferir: ({ competencia, origem, candidatas }) =>
    origem !== 'modelo' || candidatas.includes(competencia)
      ? ok
      : { ok: false, codigo: 'COMPETENCIA_INVENTADA', escalavel: true, mensagem: `A competência ${competencia} não aparece no documento.` },
})

definirValidador({
  nome: 'confianca_minima',
  versao: 1,
  descricao: 'Confiança do operário acima do limiar do procedimento (parâmetro), salvo regra ou pessoa.',
  dados: z.object({ origem: z.enum(['regra', 'modelo', 'pessoa']), confianca: z.number().min(0).max(1).nullable() }),
  conferir: ({ origem, confianca }, { parametro }) => {
    const limiar = Number(parametro ?? '0.9')
    return origem !== 'modelo' || (confianca ?? 0) >= limiar ? ok : { ok: false, codigo: 'CONFIANCA_BAIXA', escalavel: true, mensagem: `Confiança ${confianca} abaixo de ${limiar}.` }
  },
})

definirValidador({
  nome: 'competencia_nao_futura',
  versao: 1,
  descricao: 'A competência não está no futuro (fuso de São Paulo).',
  dados: z.object({ competencia: Competencia }),
  conferir: ({ competencia }) => {
    const agora = new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' }).slice(0, 7)
    return competencia <= agora ? ok : { ok: false, codigo: 'COMPETENCIA_FUTURA', mensagem: `A competência ${competencia} ainda não chegou.` }
  },
})

definirValidador({
  nome: 'competencia_aberta',
  versao: 1,
  descricao: 'A competência do cliente não está fechada na contabilidade.',
  dados: z.object({ cliente_id: z.string(), competencia: Competencia }),
  conferir: async ({ cliente_id, competencia }, { tx }) => {
    if (!tx) return { ok: false, codigo: 'SEM_BANCO', mensagem: 'Validador precisa do banco.' }
    const [c] = await tx`select situacao from competencia_contabil where cliente_id = ${cliente_id} and competencia = ${competencia}`
    return c?.situacao === 'fechada' ? { ok: false, codigo: 'COMPETENCIA_FECHADA', mensagem: `A competência ${competencia} do cliente está fechada; uma pessoa precisa decidir.` } : ok
  },
})

definirValidador({
  nome: 'arquivo_aprovado_confere',
  versao: 1,
  descricao: 'O cartão aprova exatamente o arquivo conferido (mesmo documento e mesmo hash).',
  dados: z.object({ argumentos: z.object({ documento_id: z.string(), hash_arquivo: z.string() }), carregar: z.object({ documento_id: z.string(), hash: z.string() }) }),
  conferir: ({ argumentos, carregar }) =>
    argumentos.documento_id === carregar.documento_id && argumentos.hash_arquivo === carregar.hash
      ? ok
      : { ok: false, codigo: 'ARQUIVO_DIFERENTE_DO_CONFERIDO', mensagem: 'O arquivo do cartão não é o que foi conferido; comece uma nova conferência.' },
})

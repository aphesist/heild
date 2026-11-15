import { z } from 'zod'
import { definirValidador, type ResultadoValidador } from '@heild/processos'

/** Validadores da B3 (custo zero de modelo), no mesmo registro da B2: rodam no passo, no portão e nos testes. */

const ok: ResultadoValidador = { ok: true }
const Valor = z.union([z.string(), z.number(), z.null()])
const reais = (c: number) => (c / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

definirValidador({
  nome: 'escolha_nas_candidatas',
  versao: 1,
  descricao: 'Cada campo escolhido pelo modelo está entre as opções que o código extraiu do documento.',
  dados: z.object({
    origem: z.enum(['regra', 'modelo', 'pessoa']),
    escolha: z.record(z.string(), Valor),
    candidatas: z.record(z.string(), z.array(Valor)),
  }),
  conferir: ({ origem, escolha, candidatas }) => {
    if (origem !== 'modelo') return ok
    const fora = Object.entries(candidatas).filter(([campo, lista]) => !lista.includes(escolha[campo] ?? null))
    return fora.length
      ? { ok: false, codigo: 'ESCOLHA_FORA_DAS_CANDIDATAS', escalavel: true, campo: fora[0]![0], mensagem: `Escolheu fora das opções do documento em: ${fora.map(([c]) => c).join(', ')}.` }
      : ok
  },
})

definirValidador({
  nome: 'valor_confere_apuracao',
  versao: 1,
  descricao: 'O valor da guia é o da apuração do tributo e da competência (número só do sistema).',
  dados: z.object({
    escolha: z.object({ tributo: z.string(), competencia: z.string() }).loose(),
    contexto: z.object({ valor_centavos: z.number().int().nullable(), apuracao: z.record(z.string(), z.record(z.string(), z.number().int())) }).loose(),
  }),
  conferir: ({ escolha, contexto }) => {
    const apurado = contexto.apuracao[escolha.tributo]?.[escolha.competencia]
    if (apurado === undefined) return { ok: false, codigo: 'SEM_APURACAO', mensagem: `Não há apuração de ${escolha.tributo} em ${escolha.competencia} para conferir a guia.` }
    if (contexto.valor_centavos === null) return { ok: false, codigo: 'GUIA_SEM_VALOR', mensagem: 'A leitura da guia não trouxe o valor.' }
    return apurado === contexto.valor_centavos
      ? ok
      : { ok: false, codigo: 'VALOR_DIVERGENTE', mensagem: `A guia tem ${reais(contexto.valor_centavos)}, mas a apuração de ${escolha.tributo} em ${escolha.competencia} deu ${reais(apurado)}.` }
  },
})

definirValidador({
  nome: 'faq_respondivel',
  versao: 1,
  descricao: 'Há uma resposta aprovada na base do setor para a pergunta escolhida.',
  dados: z.object({ escolha: z.object({ faq_id: z.string() }).loose(), contexto: z.object({ base: z.array(z.object({ id: z.string() }).loose()) }).loose() }),
  conferir: ({ escolha, contexto }) =>
    escolha.faq_id !== 'nenhuma' && contexto.base.some((f) => f.id === escolha.faq_id)
      ? ok
      : { ok: false, codigo: 'SEM_RESPOSTA_APROVADA', mensagem: 'Não há resposta aprovada na base para esta mensagem; uma pessoa responde.' },
})

definirValidador({
  nome: 'competencia_passada_ou_atual',
  versao: 1,
  descricao: 'A competência escolhida não está no futuro (fuso de São Paulo).',
  dados: z.object({ escolha: z.object({ competencia: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/) }).loose() }),
  conferir: ({ escolha }) => {
    const agora = new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' }).slice(0, 7)
    return escolha.competencia <= agora ? ok : { ok: false, codigo: 'COMPETENCIA_FUTURA', mensagem: `A competência ${escolha.competencia} ainda não chegou.` }
  },
})

definirValidador({
  nome: 'quantidade_quando_exigida',
  versao: 1,
  descricao: 'Hora extra, falta e adiantamento só se lançam com a quantidade (horas, dias ou valor) tirada do texto.',
  dados: z.object({ escolha: z.object({ tipo_evento: z.string(), quantidade: z.union([z.string(), z.number(), z.null()]).optional() }).loose() }),
  conferir: ({ escolha }) =>
    ['hora_extra', 'falta', 'adiantamento'].includes(escolha.tipo_evento) && (escolha.quantidade === null || escolha.quantidade === undefined || escolha.quantidade === '')
      ? { ok: false, codigo: 'SEM_QUANTIDADE', escalavel: true, campo: 'quantidade', mensagem: `Para lançar ${escolha.tipo_evento.replace('_', ' ')} é preciso a quantidade, e ela não foi informada.` }
      : ok,
})

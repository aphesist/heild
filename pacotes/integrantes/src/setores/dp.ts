import { z } from 'zod'
import { definirContrato } from '@heild/processos'
import { competenciasDoTexto, numerosDoTexto, procedimentoDeEscolha } from '../escolha.ts'
import { resolverCom } from '../metas.ts'

/**
 * DP. DP-EVENTO-FOLHA: o pedido do cliente ("o Pedro fez 10 horas extras em outubro") vira um
 * evento de folha tipado. O operário escolhe o tipo, a competência e a quantidade, cada um entre
 * as opções que o código tirou do texto (a quantidade é sempre um número que está no texto).
 * Lançar na folha passa pela lista do escritório (por regra) ou pelo cartão.
 */

const Competencia = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/)
export const TIPOS_EVENTO_FOLHA = ['hora_extra', 'falta', 'adiantamento', 'ferias', 'admissao', 'rescisao', 'outro'] as const

export const contratoEventoFolha = definirContrato({
  id: 'dp.evento.classificar',
  versao: 1,
  classe: 'operario',
  instrucao:
    'Você lê um pedido de um cliente ao departamento pessoal e o transforma num evento de folha. ' +
    'Escolha o tipo, a competência e a quantidade (horas, dias ou valor) só entre as opções dadas; use null na quantidade quando o tipo não pede uma. ' +
    'Se o pedido trouxer mais de um evento, ou se não der para saber, use confiança baixa.',
  recebe: z.object({ trecho: z.string().max(2000), tipos: z.array(z.string()).max(7), competencias: z.array(Competencia).max(6), quantidades: z.array(z.string()).max(8) }).strict(),
  devolve: z
    .object({
      tipo_evento: z.enum(TIPOS_EVENTO_FOLHA),
      competencia: Competencia,
      quantidade: z.string().max(12).nullable(),
      confianca: z.number().min(0).max(1),
      motivo: z.string().min(3).max(140),
    })
    .strict(),
  max_tokens_saida: 140,
  campos_externos: ['trecho'],
})

export const dpEventoFolha = procedimentoDeEscolha({
  id: 'DP-EVENTO-FOLHA',
  versao: 1,
  nome: 'Registrar evento de folha pedido pelo cliente',
  setor: 'dp',
  operacao: 'dp.evento.classificar_e_lancar',
  descricao_modelo: 'Transforma o pedido do cliente num evento de folha conferido e lança na competência.',
  tipos_documento: ['mensagem', 'email', 'solicitacao'],
  contrato: contratoEventoFolha,
  campos: ['tipo_evento', 'competencia', 'quantidade'],
  chave_metadados: 'evento_folha',
  ler: (d) => ({
    tipo: d.tipo,
    candidatas: { tipo_evento: [...TIPOS_EVENTO_FOLHA], competencia: competenciasDoTexto(d.texto), quantidade: [...numerosDoTexto(d.texto), null] },
    regra: null,
    trecho: d.texto,
    contexto: {},
  }),
  recebe: (l) => ({
    trecho: l.trecho,
    tipos: l.candidatas.tipo_evento as string[],
    competencias: l.candidatas.competencia as string[],
    quantidades: (l.candidatas.quantidade as (string | null)[]).filter((x): x is string => x !== null),
  }),
  validadores: ['escolha_nas_candidatas', 'confianca_minima:0.9', 'competencia_passada_ou_atual'],
  aprovacao: {
    ferramenta: 'dp.evento.lancar',
    exigida: 'por_regra',
    resumo: (e) => `Lançar ${String(e.tipo_evento).replace('_', ' ')}${e.quantidade ? ` (${e.quantidade})` : ''} na folha de ${e.competencia}.`,
  },
  orcamento: { centavos: 8, tokens: 8_000 },
  resolver: resolverCom(),
})

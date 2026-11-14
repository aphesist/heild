import { ficticio, simular } from './simular'
import type { Resultado } from './tipos'

/*
 * S07 · Cobrança direta pelo banco do escritório (API-20), índices do Banco
 * Central (API-16) e importação do financeiro antigo (API-30). No produto:
 * a API Pix padronizada e a API de boleto do banco conveniado (ou Asaas/Efí
 * para quem não tem convênio), a série SGS e os arquivos das ferramentas
 * antigas. Aqui: tudo de faz de conta, marcado como demonstração.
 */

export interface EmissaoCobranca {
  id_externo: string
  linha_digitavel: string
  pix_copia_cola: string
  provedor: string
}

export interface ServicoCobranca {
  /** Emite boleto com Pix (ou agenda o Pix Automático) na conta do escritório. */
  emitir(c: { pagador: string; documento: string; valor: number; vencimento: string; meio: string; provedor: string }): Promise<Resultado<EmissaoCobranca>>
  /** 2ª via com os juros e a multa já calculados pelo motor Cálculo. */
  segundaVia(c: { id_externo: string; valor: number; vencimento: string }): Promise<Resultado<EmissaoCobranca>>
  /** Convite de Pix Automático: o cliente autoriza no app do banco dele. */
  convidarPixAutomatico(c: { pagador: string; valor: number; dia: number }): Promise<Resultado<{ autorizacao: string; link: string }>>
  /** Testa o convênio na troca de provedor (sem perder as autorizações de Pix Automático). */
  testarConvenio(provedor: string): Promise<Resultado<{ ok: boolean; tarifa_boleto: string; autorizacoes_mantidas: number }>>
}

export interface ServicoIndices {
  /** Acumulado de 12 meses de um índice (série SGS do Banco Central). */
  acumulado(indice: string, ate: string): Promise<Resultado<{ percentual: number; serie: string }>>
}

export interface ServicoImportacaoFinanceiro {
  /** Lê o arquivo exportado da ferramenta antiga e devolve o que achou. */
  ler(origem: string): Promise<Resultado<{ contratos: { cliente: string; valor: number; dia: number }[]; cobrancasAbertas: number; recebimentos12m: number }>>
}

const serieSgs: Record<string, [number, string]> = { IPCA: [4.6, 'SGS 433'], INPC: [4.3, 'SGS 188'], 'IGP-M': [3.1, 'SGS 189'], 'salário mínimo': [7.5, 'decreto federal'] }

export const cobrancaDemonstracao: ServicoCobranca = {
  emitir: (c) => {
    if (c.valor <= 0) throw new Error('Cobrança sem valor.')
    return simular(`Cobrança · ${c.provedor}`, () => ({ id_externo: ficticio.id('cob'), linha_digitavel: `07790.00116 ${String(Math.floor(Math.random() * 1e5)).padStart(5, '0')}.678901 23456.789012 1 ${String(Math.round(c.valor * 100)).padStart(14, '0')}`, pix_copia_cola: `00020126580014br.gov.bcb.pix0136${ficticio.txid()}5204000053039865406${c.valor.toFixed(2)}5802BR6304ABCD`, provedor: c.provedor }), { latencia: [500, 1100] })
  },
  segundaVia: (c) => simular('Cobrança (2ª via)', () => ({ id_externo: c.id_externo, linha_digitavel: `07790.00116 ${String(Math.floor(Math.random() * 1e5)).padStart(5, '0')}.678901 23456.789012 2 ${String(Math.round(c.valor * 100)).padStart(14, '0')}`, pix_copia_cola: `00020126580014br.gov.bcb.pix0136${ficticio.txid()}5204000053039865406${c.valor.toFixed(2)}5802BR6304ABCD`, provedor: 'banco do escritório' })),
  convidarPixAutomatico: () => simular('Pix Automático', () => ({ autorizacao: ficticio.id('rec'), link: 'https://pix.exemplo/autorizar' })),
  testarConvenio: (provedor) => simular(`Convênio · ${provedor}`, () => ({ ok: true, tarifa_boleto: provedor.includes('Asaas') || provedor.includes('Efí') ? 'R$ 1,99' : 'R$ 1,90', autorizacoes_mantidas: 41 }), { latencia: [1200, 2200] }),
}

export const indicesDemonstracao: ServicoIndices = {
  acumulado: (indice) => simular('Banco Central (SGS)', () => ({ percentual: serieSgs[indice]?.[0] ?? 0, serie: serieSgs[indice]?.[1] ?? '—' }), { latencia: [400, 900] }),
}

export const importacaoFinanceiroDemonstracao: ServicoImportacaoFinanceiro = {
  ler: (origem) => simular(`Importação · ${origem}`, () => ({ contratos: [], cobrancasAbertas: 0, recebimentos12m: 0 }), { latencia: [1500, 2600] }),
}

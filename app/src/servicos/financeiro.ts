import { brl, ficticio, simular } from './simular'
import type { Resultado } from './tipos'

/**
 * NFS-e (padrão nacional, subplano 09), bancos (boleto, saldo, extrato),
 * Pix (cobrança com QR) e Open Finance (consentimento e leitura de contas
 * do cliente, BPO). No produto: o emissor nacional e o banco ou agregador
 * contratado. Aqui: números e chaves de faz de conta.
 */

export interface ServicoNfse {
  emitir(dps: { prestador_cnpj: string; tomador: string; servico: string; codigo: string; valor: number; aliquota_iss: number }): Promise<Resultado<{ numero: number; chave: string; iss: string; pdf: string }>>
  cancelar(chave: string, motivo: string): Promise<Resultado<{ protocolo: string }>>
}

export interface Lancamento {
  data: string
  descricao: string
  valor: number
}

export interface ServicoBancos {
  saldo(conta: string): Promise<Resultado<{ disponivel: string; em: string }>>
  extrato(conta: string, periodo: { de: string; ate: string }): Promise<Resultado<Lancamento[]>>
  emitirBoleto(b: { pagador: string; valor: number; vencimento: string }): Promise<Resultado<{ nosso_numero: string; linha_digitavel: string }>>
  /** Pagamento sai do banco só depois da aprovação humana registrada (BPO, 10 B3). */
  pagar(p: { favorecido: string; valor: number; aprovado_por: string[] }): Promise<Resultado<{ comprovante: string }>>
}

export interface ServicoPix {
  cobrar(c: { valor: number; descricao: string; vencimento?: string }): Promise<Resultado<{ txid: string; copia_e_cola: string }>>
  situacao(txid: string): Promise<Resultado<'ativa' | 'concluida' | 'expirada'>>
}

export interface ServicoOpenFinance {
  /** Pede o consentimento do cliente no banco dele (abre a jornada do banco). */
  conectar(instituicao: string, cpfCnpj: string): Promise<Resultado<{ consentimento: string; expira_em: string; contas: { banco: string; agencia: string; conta: string }[] }>>
  transacoes(consentimento: string): Promise<Resultado<Lancamento[]>>
}

const daqui = (dias: number) => new Date(Date.now() + dias * 864e5).toLocaleDateString('pt-BR')

const lancamentos = (): Lancamento[] => [
  { data: daqui(-6), descricao: 'PIX RECEBIDO · CLIENTE BALCAO', valor: 1240.0 },
  { data: daqui(-5), descricao: 'BOLETO · DISTRIBUIDORA SUL', valor: -2418.9 },
  { data: daqui(-4), descricao: 'TARIFA PACOTE SERVIÇOS', valor: -89.9 },
  { data: daqui(-3), descricao: 'CARTAO CREDITO · ANTECIPACAO', valor: 5320.45 },
  { data: daqui(-1), descricao: 'DAS SIMPLES NACIONAL', valor: -1390.0 },
]

export const nfseDemonstracao: ServicoNfse = {
  emitir: (d) => {
    if (d.valor <= 0) throw new Error('O valor do serviço precisa ser maior que zero.')
    return simular('NFS-e (emissor nacional)', () => ({ numero: 1400 + Math.floor(Math.random() * 100), chave: ficticio.chave44(), iss: brl((d.valor * d.aliquota_iss) / 100), pdf: 'nfse.pdf' }), { latencia: [1200, 2400] })
  },
  cancelar: () => simular('NFS-e (emissor nacional)', () => ({ protocolo: ficticio.protocolo() })),
}

export const bancosDemonstracao: ServicoBancos = {
  saldo: () => simular('Banco (API)', () => ({ disponivel: brl(48210.77), em: new Date().toLocaleString('pt-BR') })),
  extrato: () => simular('Banco (API)', lancamentos),
  emitirBoleto: () => simular('Banco (API)', () => ({ nosso_numero: ficticio.protocolo().slice(-10), linha_digitavel: '34191.79001 01043.510047 91020.150008 8 10010000150000' })),
  pagar: (p) => {
    if (!p.aprovado_por.length) throw new Error('Pagamento sem aprovação registrada: o banco não executa (10, B3).')
    return simular('Banco (API)', () => ({ comprovante: ficticio.protocolo() }), { latencia: [1400, 2600] })
  },
}

export const pixDemonstracao: ServicoPix = {
  cobrar: (c) => simular('Pix (cobrança)', () => ({ txid: ficticio.txid(), copia_e_cola: `00020126580014br.gov.bcb.pix0136${ficticio.txid()}5204000053039865406${c.valor.toFixed(2)}5802BR6009SAO PAULO62070503***6304ABCD` })),
  situacao: () => simular('Pix (cobrança)', () => 'ativa' as const, { latencia: [200, 400] }),
}

export const openFinanceDemonstracao: ServicoOpenFinance = {
  conectar: (instituicao) => simular('Open Finance', () => ({ consentimento: ficticio.id('consent'), expira_em: daqui(365), contas: [{ banco: instituicao, agencia: '0001', conta: '123456-7' }] }), { latencia: [1500, 2800] }),
  transacoes: () => simular('Open Finance', lancamentos),
}

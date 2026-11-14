import { brl, ficticio, simular } from './simular'
import type { Resultado } from './tipos'

/**
 * Governo (subplano 08): Integra Contador/e-CAC (Receita Federal, via
 * SERPRO, pago por consulta e exige procuração), consultas estaduais (SEFAZ)
 * e municipais (prefeituras), certidões e o DJEN (Diário de Justiça
 * Eletrônico Nacional, pacote Jurídico). Aqui: respostas com a forma das
 * reais, sem chamar órgão nenhum.
 */

export interface SituacaoFiscal {
  orgao: string
  situacao: 'regular' | 'pendencia' | 'irregular'
  pendencias: { descricao: string; valor?: string; competencia?: string }[]
  consultado_em: string
}

export interface ServicoIntegraContador {
  situacaoFiscal(cnpj: string): Promise<Resultado<SituacaoFiscal>>
  /** Transmite a declaração (PGDAS-D, DCTFWeb...). Exige aprovação humana e certificado/procuração. */
  transmitir(d: { cnpj: string; declaracao: 'PGDAS-D' | 'DCTFWeb' | 'EFD-Reinf' | 'DEFIS'; competencia: string; valor?: number }): Promise<Resultado<{ recibo: string; protocolo: string }>>
  emitirGuia(g: { cnpj: string; tributo: 'DAS' | 'DARF'; competencia: string; valor: number }): Promise<Resultado<{ codigo_barras: string; vencimento: string; valor: string }>>
  caixaPostal(cnpj: string): Promise<Resultado<{ assunto: string; data: string; lida: boolean }[]>>
}

export interface ServicoConsultasLocais {
  estadual(uf: string, cnpj: string): Promise<Resultado<SituacaoFiscal>>
  municipal(municipio: string, cnpj: string): Promise<Resultado<SituacaoFiscal>>
}

export interface Certidao {
  tipo: 'federal' | 'fgts' | 'trabalhista' | 'estadual' | 'municipal'
  situacao: 'negativa' | 'positiva_com_efeito_de_negativa' | 'positiva'
  numero: string
  valida_ate: string
}

export interface ServicoCertidoes {
  emitir(tipo: Certidao['tipo'], cnpj: string): Promise<Resultado<Certidao>>
}

export interface Intimacao {
  processo: string
  tribunal: string
  publicada_em: string
  teor: string
  prazo_dias: number
}

export interface ServicoDjen {
  intimacoes(filtro: { oab?: string; cnpj?: string; desde?: string }): Promise<Resultado<Intimacao[]>>
}

const hoje = () => new Date().toLocaleDateString('pt-BR')
const daqui = (dias: number) => new Date(Date.now() + dias * 864e5).toLocaleDateString('pt-BR')
const final = (cnpj: string) => Number(cnpj.replace(/\D/g, '').slice(-3, -2) || 0)

export const integraContadorDemonstracao: ServicoIntegraContador = {
  situacaoFiscal: (cnpj) =>
    simular('Integra Contador (e-CAC)', () =>
      final(cnpj) % 3 === 0
        ? { orgao: 'Receita Federal / PGFN', situacao: 'pendencia', pendencias: [{ descricao: 'DCTFWeb não entregue', competencia: '09/2026' }], consultado_em: hoje() }
        : { orgao: 'Receita Federal / PGFN', situacao: 'regular', pendencias: [], consultado_em: hoje() },
    ),
  transmitir: (d) => simular('Integra Contador (e-CAC)', () => ({ recibo: `${d.declaracao}-${d.competencia.replace('/', '')}-${ficticio.protocolo().slice(-8)}`, protocolo: ficticio.protocolo() }), { latencia: [1500, 3000] }),
  emitirGuia: (g) => simular('Integra Contador (e-CAC)', () => ({ codigo_barras: ficticio.chave44().slice(0, 48), vencimento: daqui(5), valor: brl(g.valor) })),
  caixaPostal: () =>
    simular('Integra Contador (e-CAC)', () => [
      { assunto: 'Termo de intimação: divergência na DCTFWeb', data: daqui(-3), lida: false },
      { assunto: 'Comunicado: novo prazo da EFD-Reinf', data: daqui(-12), lida: true },
    ]),
}

export const consultasLocaisDemonstracao: ServicoConsultasLocais = {
  estadual: (uf) => simular(`SEFAZ ${uf}`, () => ({ orgao: `SEFAZ ${uf}`, situacao: 'pendencia', pendencias: [{ descricao: 'Débito de ICMS', valor: brl(1840.32), competencia: '08/2026' }], consultado_em: hoje() })),
  municipal: (municipio) => simular(`Prefeitura de ${municipio}`, () => ({ orgao: `Prefeitura de ${municipio}`, situacao: 'regular', pendencias: [], consultado_em: hoje() })),
}

export const certidoesDemonstracao: ServicoCertidoes = {
  emitir: (tipo) => simular('Emissão de certidões', () => ({ tipo, situacao: tipo === 'estadual' ? 'positiva_com_efeito_de_negativa' : 'negativa', numero: ficticio.protocolo().slice(-12), valida_ate: daqui(tipo === 'fgts' ? 30 : 180) }), { latencia: [1200, 2600] }),
}

export const djenDemonstracao: ServicoDjen = {
  intimacoes: () =>
    simular('DJEN (Diário de Justiça Eletrônico Nacional)', () => [
      { processo: '1012345-67.2026.8.26.0100', tribunal: 'TJSP', publicada_em: daqui(-1), teor: 'Intime-se a parte autora para se manifestar sobre a contestação no prazo legal.', prazo_dias: 15 },
      { processo: '0001234-56.2026.5.02.0011', tribunal: 'TRT-2', publicada_em: daqui(-2), teor: 'Designada audiência de conciliação para 10/12/2026, às 14h.', prazo_dias: 0 },
    ]),
}

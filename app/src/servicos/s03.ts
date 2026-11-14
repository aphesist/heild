// S03: serviços externos do Fiscal e do Contábil que ainda não tinham interface (demonstração).
import { brl, ficticio, simular } from './simular'
import type { Resultado } from './tipos'

/** EFD-Reinf (API-09): envio do evento de fechamento e consulta do protocolo. */
export interface ServicoReinf {
  fechar(r: { documento: string; competencia: string }): Promise<Resultado<{ protocolo: string; recibo: string }>>
  consultar(protocolo: string): Promise<Resultado<{ situacao: 'processado' | 'em processamento' | 'com erro'; eventos: number }>>
}

/** Sicalc (API-06): DARF avulso e recálculo de guia vencida com juros e multa. */
export interface ServicoSicalc {
  recalcular(g: { tributo: string; valor: number; vencimentoOriginal: string; novoVencimento: string }): Promise<Resultado<{ principal: number; multa: number; juros: number; total: number; codigo_barras: string; memoria: string[] }>>
}

/** Calculadora de Tributos da RFB (API-15): carga da reforma num ano. */
export interface ServicoCalculadoraReforma {
  simular(c: { receitaAnual: number; ano: number; regime: string }): Promise<Resultado<{ cbs: number; ibs: number; is: number; total: number }>>
}

/** Core contábil (API-18): lote de lançamentos da competência. */
export interface ServicoCoreContabil {
  enviarLote(l: { cliente: string; competencia: string; lancamentos: number; sistema: string }): Promise<Resultado<{ lote: string; aceitos: number; rejeitados: { linha: number; motivo: string }[] }>>
}

/** Leitor de extratos (D-11): OFX, CSV, planilha ou PDF; deduplica PDF × CSV; reconhece o sócio. */
export interface ServicoLeitorExtratos {
  ler(a: { nome: string; socios: { nome: string; cpf: string }[] }): Promise<Resultado<{ formato: 'OFX' | 'CSV' | 'planilha' | 'PDF'; linhas: number; duplicadas: number; periodo: string; socios: { nome: string; como: 'CPF inteiro' | 'CPF mascarado' | 'nome' }[]; buracos: string[] }>>
}

/** Conferência da assinatura dentro do PDF (D-16): quem assinou, certificado e se o arquivo mudou depois. */
export interface ServicoConferenciaAssinatura {
  conferir(d: { documento: string; esperado: string }): Promise<Resultado<{ valida: boolean; signatario: string; certificado: string; integro: boolean; motivo?: string }>>
}

export const reinfDemonstracao: ServicoReinf = {
  fechar: (r) => simular('EFD-Reinf', () => ({ protocolo: ficticio.protocolo(), recibo: `${r.competencia.replace('/', '')}-${ficticio.protocolo().slice(-6)}` }), { latencia: [900, 1700] }),
  consultar: () => simular('EFD-Reinf', () => ({ situacao: 'processado' as const, eventos: 3 })),
}

export const sicalcDemonstracao: ServicoSicalc = {
  recalcular: (g) =>
    simular('Sicalc (Integra Contador)', () => {
      const dias = Math.max(1, Math.round((Date.parse(g.novoVencimento) - Date.parse(g.vencimentoOriginal)) / 86_400_000))
      const multa = Math.round(g.valor * Math.min(0.2, 0.0033 * dias) * 100) / 100
      const juros = Math.round(g.valor * (0.01 + 0.0105 * Math.floor(dias / 30)) * 100) / 100
      return {
        principal: g.valor,
        multa,
        juros,
        total: Math.round((g.valor + multa + juros) * 100) / 100,
        codigo_barras: ficticio.chave44().slice(0, 48),
        memoria: [`Multa de mora: 0,33% ao dia por ${dias} dias, limitada a 20% = ${brl(multa)}`, `Juros: Selic acumulada + 1% no mês do pagamento = ${brl(juros)}`, `Novo vencimento: ${g.novoVencimento.split('-').reverse().join('/')}`],
      }
    }),
}

export const calculadoraReformaDemonstracao: ServicoCalculadoraReforma = {
  simular: (c) =>
    simular('Calculadora de Tributos RFB', () => {
      const cbs = c.ano <= 2026 ? 0.009 : 0.088
      const ibs = c.ano < 2029 ? 0.001 : c.ano >= 2033 ? 0.177 : 0.177 * ((c.ano - 2028) / 10)
      return { cbs: Math.round(c.receitaAnual * cbs), ibs: Math.round(c.receitaAnual * ibs), is: 0, total: Math.round(c.receitaAnual * (cbs + ibs)) }
    }),
}

export const coreContabilDemonstracao: ServicoCoreContabil = {
  enviarLote: (l) =>
    simular(`Core contábil (${l.sistema})`, () => {
      const rej = l.lancamentos > 200 ? [{ linha: 118, motivo: 'conta 1.1.2.05 inexistente no plano do cliente' }] : []
      return { lote: `L${ficticio.protocolo().slice(-7)}`, aceitos: l.lancamentos - rej.length, rejeitados: rej }
    }, { latencia: [1200, 2200] }),
}

export const leitorExtratosDemonstracao: ServicoLeitorExtratos = {
  ler: (a) =>
    simular('Leitor de extratos', () => {
      const ext = a.nome.split('.').pop()?.toLowerCase()
      const formato = ext === 'ofx' ? 'OFX' : ext === 'csv' ? 'CSV' : ext === 'xlsx' || ext === 'xls' ? 'planilha' : 'PDF'
      return {
        formato,
        linhas: 40 + (a.nome.length * 7) % 160,
        duplicadas: formato === 'PDF' ? 12 : 0,
        periodo: '01/10/2026 a 31/10/2026',
        socios: a.socios.map((s) => ({ nome: s.nome, como: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(s.cpf) ? ('CPF inteiro' as const) : s.cpf.includes('*') ? ('CPF mascarado' as const) : ('nome' as const) })),
        buracos: formato === 'PDF' && a.nome.length % 2 ? ['12/10 a 14/10'] : [],
      }
    }, { latencia: [1000, 2000] }),
}

export const conferenciaAssinaturaDemonstracao: ServicoConferenciaAssinatura = {
  conferir: (d) =>
    simular('Validador de assinatura (ICP-Brasil)', () => {
      // A demonstração recusa quando o nome do arquivo marca "sem-assinatura" (para mostrar a recusa).
      const valida = !/sem-assinatura|sem assinatura/i.test(d.documento)
      return valida
        ? { valida, signatario: d.esperado, certificado: 'e-CPF A3 · AC Certisign', integro: true }
        : { valida, signatario: '—', certificado: '—', integro: false, motivo: 'O PDF voltou sem assinatura digital do contador (só a imagem da rubrica).' }
    }),
}

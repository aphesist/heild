import { escolher, simular } from './simular'
import type { Resultado } from './tipos'

/**
 * Transcrição de áudio (CRM, comunicação interna) e OCR/leitura de
 * documentos (o que chega pelo app, por e-mail ou na pasta). No produto:
 * um serviço de fala para texto e um de leitura de documentos. Aqui: textos
 * e campos de exemplo, com a latência de um serviço real.
 */

export interface ServicoTranscricao {
  transcrever(audio: { nome: string; duracaoSeg: number }): Promise<Resultado<{ texto: string; confianca: number }>>
}

export interface CamposLidos {
  tipo: 'nfe' | 'nfse' | 'boleto' | 'extrato' | 'guia' | 'contrato' | 'outro'
  campos: Record<string, string>
  confianca: number
}

export interface ServicoOcr {
  ler(documento: { nome: string; mime?: string }): Promise<Resultado<CamposLidos>>
}

const falas = [
  'Oi, tudo bem? Contratei dois funcionários essa semana, um balconista e uma auxiliar de cozinha. Começam na segunda. O que vocês precisam de mim?',
  'Bom dia! O contador do banco pediu o balanço de setembro para renovar o capital de giro. Consegue me mandar até sexta?',
  'Passei no banco e a guia do DAS não estava no aplicativo. Vocês podem mandar de novo pelo WhatsApp?',
]

export const transcricaoDemonstracao: ServicoTranscricao = {
  transcrever: (a) => simular('Transcrição de áudio', () => ({ texto: escolher(a.nome, falas), confianca: 0.93 }), { latencia: [1200, 2400] }),
}

export const ocrDemonstracao: ServicoOcr = {
  ler: (d) =>
    simular(
      'Leitura de documentos (OCR)',
      (): CamposLidos => {
        const n = d.nome.toLowerCase()
        if (/boleto/.test(n)) return { tipo: 'boleto', campos: { beneficiario: 'Distribuidora Sul Ltda', valor: 'R$ 2.418,90', vencimento: '25/11/2026', linha_digitavel: '23793.38128 60000.000003 00000.000400 1 10010000241890' }, confianca: 0.97 }
        if (/extrato|ofx/.test(n)) return { tipo: 'extrato', campos: { banco: 'Banco do Brasil', agencia: '1234-5', conta: '98765-0', periodo: '01/10/2026 a 31/10/2026', lancamentos: '142' }, confianca: 0.95 }
        if (/nfs/.test(n)) return { tipo: 'nfse', campos: { numero: '1452', prestador: 'Clínica Sorriso Ltda', valor: 'R$ 3.200,00', codigo_servico: '04.12', iss: 'R$ 64,00' }, confianca: 0.94 }
        if (/nf|nota|xml/.test(n)) return { tipo: 'nfe', campos: { chave: '3526 1112 3456 7800 0190 5500 1000 0045 2110 0004 5210', emitente: 'Aço Forte Ind. Ltda', valor: 'R$ 18.740,00', cfop: '5101' }, confianca: 0.96 }
        if (/das|darf|guia/.test(n)) return { tipo: 'guia', campos: { tributo: 'DAS', competencia: '10/2026', valor: 'R$ 1.390,00', vencimento: '20/11/2026' }, confianca: 0.98 }
        if (/contrato|social|altera/.test(n)) return { tipo: 'contrato', campos: { partes: '2 sócios', capital: 'R$ 100.000,00', foro: 'São Paulo/SP' }, confianca: 0.88 }
        return { tipo: 'outro', campos: { paginas: '1' }, confianca: 0.6 }
      },
      { latencia: [900, 1700] },
    ),
}

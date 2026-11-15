import { esperar, ficticio, simular } from './simular'
import type { Resultado } from './tipos'

/**
 * Assinatura eletrônica (contratos, procurações, termo do certificado) e
 * armazenamento em nuvem (Drive, OneDrive, Dropbox ou o da Heild,
 * Fundações 7). No produto: o provedor de assinatura e o conector de nuvem
 * do escritório. Aqui: envelopes e arquivos de faz de conta.
 */

export type StatusEnvelope = 'enviado' | 'visualizado' | 'assinado_parcial' | 'concluido' | 'recusado'

export interface ServicoAssinatura {
  enviar(e: { documento: string; signatarios: { nome: string; email: string }[] }): Promise<Resultado<{ envelope: string; status: StatusEnvelope; link: string }>>
  /** Acompanha o envelope até concluir; devolve a função que para. */
  acompanhar(envelope: string, aoMudar: (s: StatusEnvelope) => void): () => void
}

export interface ArquivoNuvem {
  id: string
  nome: string
  pasta: string
  tamanho: string
  modificado_em: string
}

export interface ServicoArmazenamento {
  /** `provedor` (S09b): qualquer um (google_drive, onedrive_sharepoint, dropbox, box, servidor_local, s3_compativel, webdav, sftp, plataforma); sem ele, o padrão do escritório. */
  listar(pasta: string, provedor?: string): Promise<Resultado<ArquivoNuvem[]>>
  enviar(a: { nome: string; pasta: string; tamanhoBytes: number; provedor?: string }): Promise<Resultado<ArquivoNuvem>>
  /** Link temporário para ver ou baixar (registra "visto" no índice). */
  link(id: string): Promise<Resultado<{ url: string; expira_em: string }>>
}

export const assinaturaDemonstracao: ServicoAssinatura = {
  enviar: (e) => {
    if (!e.signatarios.length) throw new Error('Escolha pelo menos um signatário.')
    return simular('Assinatura eletrônica', () => ({ envelope: ficticio.id('env'), status: 'enviado' as const, link: '#assinatura-demonstracao' }))
  },
  acompanhar(_e, aoMudar) {
    let vivo = true
    void (async () => {
      for (const s of ['visualizado', 'assinado_parcial', 'concluido'] as const) {
        await esperar(2200)
        if (!vivo) return
        aoMudar(s)
      }
    })()
    return () => {
      vivo = false
    }
  },
}

const kb = (b: number) => (b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1).replace('.', ',')} MB` : `${Math.max(1, Math.round(b / 1024))} KB`)

export const armazenamentoDemonstracao: ServicoArmazenamento = {
  listar: (pasta, provedor) =>
    simular(provedor ? `Armazenamento (${provedor})` : 'Armazenamento em nuvem', () => [
      { id: ficticio.id('arq'), nome: 'Contrato social consolidado.pdf', pasta, tamanho: '412 KB', modificado_em: '12/11/2026' },
      { id: ficticio.id('arq'), nome: 'Balancete 10-2026.xlsx', pasta, tamanho: '96 KB', modificado_em: '14/11/2026' },
    ]),
  enviar: (a) => simular(a.provedor ? `Armazenamento (${a.provedor})` : 'Armazenamento em nuvem', () => ({ id: ficticio.id('arq'), nome: a.nome, pasta: a.pasta, tamanho: kb(a.tamanhoBytes), modificado_em: new Date().toLocaleDateString('pt-BR') }), { latencia: [800, 1600] }),
  link: () => simular('Armazenamento em nuvem', () => ({ url: '#arquivo-demonstracao', expira_em: new Date(Date.now() + 15 * 60e3).toLocaleTimeString('pt-BR') }), { latencia: [200, 500] }),
}

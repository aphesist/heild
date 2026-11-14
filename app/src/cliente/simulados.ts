import { servicos } from '@/servicos'
import { simular } from '@/servicos/simular'
import type { Resultado } from '@/servicos'

/**
 * Chamadas externas do app do cliente que não têm serviço próprio em
 * src/servicos (código de acesso, push, cofre, Pix Automático, calendário,
 * procurações). Todas passam pelo mesmo motor `simular`: esperam, devolvem o
 * resultado marcado como demonstração e falham quando o painel liga
 * "Serviços externos falhando". As que já têm serviço (WhatsApp, e-mail,
 * Pix, boleto, certidões, NFS-e, assinatura, armazenamento) usam `servicos`.
 */

/** Código de 6 dígitos no canal cadastrado (06, 2.2; API-27). */
export async function enviarCodigo(canal: 'whatsapp' | 'email', destino: string): Promise<Resultado<{ codigo: string; expiraEm: number }>> {
  const codigo = String(Math.floor(100000 + Math.random() * 900000))
  const r =
    canal === 'whatsapp'
      ? await servicos.whatsapp.enviar({ para: destino, modelo: 'codigo_de_acesso', variaveis: { codigo } })
      : await servicos.email.enviar({ para: [destino], assunto: 'Seu código de acesso', corpo: `Código: ${codigo}. Vale por 10 minutos.` })
  return { ...r, dados: { codigo, expiraEm: Date.now() + 10 * 60_000 } }
}

/** Registro do aparelho para push (PWA; 06, 3.11). */
export const registrarPush = () => simular('Push web (PWA)', () => ({ dispositivo: `disp_${Date.now().toString(36)}` }), { latencia: [400, 900] })

/** Validação do certificado no cofre (06, 6.2; API-29). A senha nunca fica no aparelho. */
export const validarCertificado = (arquivo: string, senha: string, cnpj: string) =>
  simular(
    'Cofre de credenciais',
    () => {
      if (senha.trim().toLowerCase() === 'errada') return { ok: false as const, erro: 'Senha incorreta. Confira com quem comprou o certificado.' }
      if (/outra/i.test(arquivo)) return { ok: false as const, erro: 'Este certificado é de outra empresa (CNPJ 98.765.432/0001-10). Envie o da sua empresa.' }
      if (/vence/i.test(arquivo)) return { ok: false as const, erro: 'Este certificado vence em 3 dias. Envie um com validade maior.' }
      return { ok: true as const, titular: cnpj, validade: '11/2027', cadeia: 'ICP-Brasil v10' }
    },
    { latencia: [900, 1700] },
  )

/** Autorização de Pix Automático no banco do cliente (09, 10.8; API-20). */
export const autorizarPixAutomatico = (limite: number) => simular('Pix Automático (banco do cliente)', () => ({ autorizacao: `pa_${Date.now().toString(36)}`, banco: 'Itaú', limite }), { latencia: [1200, 2200] })
export const cancelarPixAutomatico = () => simular('Pix Automático (banco do cliente)', () => ({ ok: true }), { latencia: [600, 1100] })

/** Horários livres do responsável (calendário conectado, API-23, ou janelas fixas do escritório). */
export const horariosLivres = (responsavel: string, janelas: string[]) => simular('Calendário (Google)', () => ({ responsavel, horarios: janelas.filter((h) => !/feriado/.test(h)) }), { latencia: [500, 1000] })

/** Integra Procurações: confere a autorização de acesso depois do "já fiz" (06, 6.4). */
export const consultarProcuracao = (orgao: string) => simular('Integra Contador (Procurações)', () => ({ orgao, ativa: true, validade: '11/2031' }), { latencia: [1200, 2400] })

/** Pacote do mês: zip com manifesto (lista e hashes) (06, 3.3). */
export const gerarPacoteMes = (arquivos: { nome: string; hash: string }[], competencia: string) =>
  simular('Armazenamento (pacote do mês)', () => ({ nome: `documentos-${competencia.replace('/', '-')}.zip`, manifesto: arquivos, tamanho: `${(arquivos.length * 0.4 + 0.2).toFixed(1).replace('.', ',')} MB` }), { latencia: [900, 1600] })

/** Exportação do que é do cliente (modo leitura após a saída do escritório, 06, 12.6). */
export const exportarTudo = (total: number) => simular('Armazenamento (exportação)', () => ({ nome: 'exportacao-completa.zip', arquivos: total, formato: 'ZIP com índice CSV e manifesto de hashes' }), { latencia: [1400, 2400] })

/** Avaliação, áudio e outros que só gravam: latência curta, sem falha. */
export const gravarAudio = (segundos: number) => simular('Transcrição (para o escritório)', () => ({ segundos, transcricao: 'Oi, é sobre a guia do FGTS: posso pagar amanhã sem multa?' }), { latencia: [500, 900] })

import { ocrDemonstracao, transcricaoDemonstracao, type ServicoOcr, type ServicoTranscricao } from './conteudo'
import { armazenamentoDemonstracao, assinaturaDemonstracao, type ServicoArmazenamento, type ServicoAssinatura } from './documentos'
import { bancosDemonstracao, nfseDemonstracao, openFinanceDemonstracao, pixDemonstracao, type ServicoBancos, type ServicoNfse, type ServicoOpenFinance, type ServicoPix } from './financeiro'
import { certidoesDemonstracao, consultasLocaisDemonstracao, djenDemonstracao, integraContadorDemonstracao, type ServicoCertidoes, type ServicoConsultasLocais, type ServicoDjen, type ServicoIntegraContador } from './governo'
import { iaDemonstracao, type ServicoIA } from './ia'
import { emailDemonstracao, whatsappDemonstracao, type ServicoEmail, type ServicoWhatsApp } from './mensageria'
import type { InfoServico } from './tipos'

export * from './tipos'
export { definirEscalaLatencia, definirInstabilidade } from './simular'
export type * from './conteudo'
export type * from './documentos'
export type * from './financeiro'
export type * from './governo'
export type * from './ia'
export type * from './mensageria'

/**
 * Os serviços externos do sistema. Hoje todos são de demonstração. Para ligar
 * um de verdade (quando houver contrato e backend), escreva a implementação
 * real com a mesma interface (de preferência chamando uma função do
 * backend/Supabase, nunca a API paga direto do navegador) e troque aqui, ou
 * em tempo de execução com `definirServicos({ whatsapp: whatsappReal })`. As
 * telas continuam iguais; o selo "demonstração" some sozinho.
 */
export interface Servicos {
  ia: ServicoIA
  transcricao: ServicoTranscricao
  ocr: ServicoOcr
  whatsapp: ServicoWhatsApp
  email: ServicoEmail
  integraContador: ServicoIntegraContador
  consultasLocais: ServicoConsultasLocais
  certidoes: ServicoCertidoes
  nfse: ServicoNfse
  bancos: ServicoBancos
  pix: ServicoPix
  openFinance: ServicoOpenFinance
  assinatura: ServicoAssinatura
  armazenamento: ServicoArmazenamento
  djen: ServicoDjen
}

export const servicos: Servicos = {
  ia: iaDemonstracao,
  transcricao: transcricaoDemonstracao,
  ocr: ocrDemonstracao,
  whatsapp: whatsappDemonstracao,
  email: emailDemonstracao,
  integraContador: integraContadorDemonstracao,
  consultasLocais: consultasLocaisDemonstracao,
  certidoes: certidoesDemonstracao,
  nfse: nfseDemonstracao,
  bancos: bancosDemonstracao,
  pix: pixDemonstracao,
  openFinance: openFinanceDemonstracao,
  assinatura: assinaturaDemonstracao,
  armazenamento: armazenamentoDemonstracao,
  djen: djenDemonstracao,
}

const reais = new Set<keyof Servicos>()

/** Troca implementações (serviço real, ou um dublê nos testes). */
export function definirServicos(parcial: Partial<Servicos>, opcoes: { real?: boolean } = {}) {
  Object.assign(servicos, parcial)
  for (const k of Object.keys(parcial) as (keyof Servicos)[]) if (opcoes.real) reais.add(k)
}

/** Catálogo para a tela de integrações e para a apresentação: o que cada serviço faria e o que falta para ligar. */
export const catalogoServicos: (InfoServico & { id: keyof Servicos })[] = [
  { id: 'ia', nome: 'Integrantes e Assistente (IA)', descricao: 'Responde, prepara e passa adiante com as ferramentas do sistema.', modo: 'demonstracao', requisito: 'Contrato com o provedor de modelo e o backend do executor' },
  { id: 'transcricao', nome: 'Transcrição de áudio', descricao: 'Áudio do WhatsApp e da conversa interna vira texto.', modo: 'demonstracao', requisito: 'Serviço de fala para texto (pago por minuto)' },
  { id: 'ocr', nome: 'Leitura de documentos (OCR)', descricao: 'Lê notas, boletos, extratos e guias que chegam.', modo: 'demonstracao', requisito: 'Serviço de leitura de documentos (pago por página)' },
  { id: 'whatsapp', nome: 'WhatsApp', descricao: 'Um número por setor, modelos aprovados e entrega.', modo: 'demonstracao', requisito: 'Cloud API da Meta ou provedor, número verificado' },
  { id: 'email', nome: 'E-mail', descricao: 'Avisos, régua de cobrança e comunicados.', modo: 'demonstracao', requisito: 'Serviço de envio transacional e domínio verificado' },
  { id: 'integraContador', nome: 'Integra Contador / e-CAC', descricao: 'Situação fiscal, transmissões, guias e caixa postal da Receita.', modo: 'demonstracao', requisito: 'Contrato SERPRO, certificado do escritório e procurações' },
  { id: 'consultasLocais', nome: 'Consultas estaduais e municipais', descricao: 'SEFAZ e prefeituras: débitos e situação cadastral.', modo: 'demonstracao', requisito: 'Integração por UF e município (alguns exigem captcha ou certificado)' },
  { id: 'certidoes', nome: 'Certidões', descricao: 'Federal, FGTS, trabalhista, estadual e municipal.', modo: 'demonstracao', requisito: 'Integrações por órgão' },
  { id: 'nfse', nome: 'NFS-e', descricao: 'Emissão e cancelamento pelo padrão nacional.', modo: 'demonstracao', requisito: 'Credenciamento no emissor nacional e certificado do cliente' },
  { id: 'bancos', nome: 'Bancos', descricao: 'Saldo, extrato, boletos e pagamentos aprovados.', modo: 'demonstracao', requisito: 'API do banco ou agregador, com contrato' },
  { id: 'pix', nome: 'Pix', descricao: 'Cobrança com QR e baixa automática.', modo: 'demonstracao', requisito: 'Conta com API Pix' },
  { id: 'openFinance', nome: 'Open Finance', descricao: 'Contas do cliente com o consentimento dele.', modo: 'demonstracao', requisito: 'Participante ou agregador autorizado' },
  { id: 'assinatura', nome: 'Assinatura eletrônica', descricao: 'Contratos, procurações e termos com validade.', modo: 'demonstracao', requisito: 'Provedor de assinatura (pago por envelope)' },
  { id: 'armazenamento', nome: 'Armazenamento em nuvem', descricao: 'Drive, OneDrive, Dropbox ou o da Heild.', modo: 'demonstracao', requisito: 'Conector OAuth da nuvem do escritório' },
  { id: 'djen', nome: 'DJEN (Jurídico)', descricao: 'Intimações do Diário de Justiça Eletrônico Nacional.', modo: 'demonstracao', requisito: 'Consulta à API pública e cadastro das OABs' },
].map((s) => ({ ...s, modo: reais.has(s.id as keyof Servicos) ? 'real' : 'demonstracao' })) as (InfoServico & { id: keyof Servicos })[]

/** Os serviços (para componentes; o mesmo objeto de `servicos`). */
export const useServicos = () => servicos

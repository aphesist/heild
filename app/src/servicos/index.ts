import { ocrDemonstracao, transcricaoDemonstracao, type ServicoOcr, type ServicoTranscricao } from './conteudo'
import { armazenamentoDemonstracao, assinaturaDemonstracao, type ServicoArmazenamento, type ServicoAssinatura } from './documentos'
import { bancosDemonstracao, nfseDemonstracao, openFinanceDemonstracao, pixDemonstracao, type ServicoBancos, type ServicoNfse, type ServicoOpenFinance, type ServicoPix } from './financeiro'
import { certidoesDemonstracao, consultasLocaisDemonstracao, djenDemonstracao, integraContadorDemonstracao, type ServicoCertidoes, type ServicoConsultasLocais, type ServicoDjen, type ServicoIntegraContador } from './governo'
import { iaDemonstracao, type ServicoIA } from './ia'
import { emailDemonstracao, whatsappDemonstracao, type ServicoEmail, type ServicoWhatsApp } from './mensageria'
import { erpDemonstracao, type ServicoErp } from './erp'
import type { InfoServico } from './tipos'

export * from './tipos'
export { definirEscalaLatencia, definirInstabilidade } from './simular'
export type * from './conteudo'
export type * from './documentos'
export type * from './financeiro'
export type * from './governo'
export type * from './ia'
export type * from './mensageria'
export type * from './erp'

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
  /** S08: ERPs financeiros dos clientes do BPO (API-25). */
  erp: ServicoErp
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
  erp: erpDemonstracao,
}

const reais = new Set<keyof Servicos>()

/** Troca implementações (serviço real, ou um dublê nos testes). */
export function definirServicos(parcial: Partial<Servicos>, opcoes: { real?: boolean } = {}) {
  Object.assign(servicos, parcial)
  for (const k of Object.keys(parcial) as (keyof Servicos)[]) if (opcoes.real) reais.add(k)
}

/** Catálogo para a tela de integrações e para a apresentação: o que cada serviço faria e o que falta para ligar. */
/** `api`: código do catálogo de APIs do MAPA_DE_TELAS.md (seção 1.7). */
export const catalogoServicos: (InfoServico & { id: keyof Servicos; api: string })[] = [
  { id: 'ia', api: 'API-01', nome: 'Integrantes e Assistente (IA)', descricao: 'Responde, prepara e passa adiante com as ferramentas do sistema.', modo: 'demonstracao', requisito: 'Contrato com o provedor de modelo e o backend do executor' },
  { id: 'transcricao', api: 'API-02', nome: 'Transcrição de áudio', descricao: 'Áudio do WhatsApp e da conversa interna vira texto.', modo: 'demonstracao', requisito: 'Serviço de fala para texto (pago por minuto)' },
  { id: 'ocr', api: 'API-01', nome: 'Leitura de documentos (OCR)', descricao: 'Lê notas, boletos, extratos e guias que chegam.', modo: 'demonstracao', requisito: 'Serviço de leitura de documentos (pago por página)' },
  { id: 'whatsapp', api: 'API-03, API-04', nome: 'WhatsApp', descricao: 'Um número por setor, modelos aprovados e entrega.', modo: 'demonstracao', requisito: 'Cloud API da Meta ou provedor, número verificado' },
  { id: 'email', api: 'API-05', nome: 'E-mail', descricao: 'Avisos, régua de cobrança e comunicados.', modo: 'demonstracao', requisito: 'Serviço de envio transacional e domínio verificado' },
  { id: 'integraContador', api: 'API-06, API-07', nome: 'Integra Contador / e-CAC', descricao: 'Situação fiscal, transmissões, guias e caixa postal da Receita.', modo: 'demonstracao', requisito: 'Contrato SERPRO, certificado do escritório e procurações' },
  { id: 'consultasLocais', api: 'API-07, API-14', nome: 'Consultas estaduais e municipais', descricao: 'SEFAZ e prefeituras: débitos e situação cadastral.', modo: 'demonstracao', requisito: 'Integração por UF e município (alguns exigem captcha ou certificado)' },
  { id: 'certidoes', api: 'API-13', nome: 'Certidões', descricao: 'Federal, FGTS, trabalhista, estadual e municipal.', modo: 'demonstracao', requisito: 'Integrações por órgão' },
  { id: 'nfse', api: 'API-11, API-21', nome: 'NFS-e', descricao: 'Emissão e cancelamento pelo padrão nacional.', modo: 'demonstracao', requisito: 'Credenciamento no emissor nacional e certificado do cliente' },
  { id: 'bancos', api: 'API-19, API-20', nome: 'Bancos', descricao: 'Saldo, extrato, boletos e pagamentos aprovados.', modo: 'demonstracao', requisito: 'API do banco ou agregador, com contrato' },
  { id: 'pix', api: 'API-20', nome: 'Pix', descricao: 'Cobrança com QR e baixa automática.', modo: 'demonstracao', requisito: 'Conta com API Pix' },
  { id: 'openFinance', api: 'API-19', nome: 'Open Finance', descricao: 'Contas do cliente com o consentimento dele.', modo: 'demonstracao', requisito: 'Participante ou agregador autorizado' },
  { id: 'assinatura', api: 'API-22', nome: 'Assinatura eletrônica', descricao: 'Contratos, procurações e termos com validade.', modo: 'demonstracao', requisito: 'Provedor de assinatura (pago por envelope)' },
  { id: 'armazenamento', api: 'API-24', nome: 'Armazenamento em nuvem', descricao: 'Drive, OneDrive, Dropbox ou o da Heild.', modo: 'demonstracao', requisito: 'Conector OAuth da nuvem do escritório' },
  { id: 'erp', api: 'API-25', nome: 'ERPs dos clientes (BPO)', descricao: 'Espelho do ERP que o cliente já usa: contas, lançamentos e baixas.', modo: 'demonstracao', requisito: 'Conta Azul, Omie e Bling por API com a credencial do cliente; Nibo e Granatum por arquivo' },
  { id: 'djen', api: 'JU (Jurídico)', nome: 'DJEN (Jurídico)', descricao: 'Intimações do Diário de Justiça Eletrônico Nacional.', modo: 'demonstracao', requisito: 'Consulta à API pública e cadastro das OABs' },
].map((s) => ({ ...s, modo: reais.has(s.id as keyof Servicos) ? 'real' : 'demonstracao' })) as (InfoServico & { id: keyof Servicos; api: string })[]

/** Os serviços (para componentes; o mesmo objeto de `servicos`). */
export const useServicos = () => servicos

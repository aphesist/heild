/**
 * Contrato comum dos serviços externos (pagos ou ainda impossíveis): IA,
 * governo, bancos, mensageria, assinatura, armazenamento...
 *
 * Toda chamada devolve um `Resultado`: os dados e de onde vieram. Os
 * serviços de demonstração marcam `demonstracao: true`, e a tela mostra o
 * `<SeloDemonstracao>`. O serviço real implementa a mesma interface e devolve
 * `demonstracao: false`: a troca é trocar a implementação em
 * `src/servicos/index.ts`, não a tela.
 */
export interface Resultado<T> {
  dados: T
  /** Veio de uma simulação (nenhuma API real foi chamada). */
  demonstracao: boolean
  /** Nome do serviço para o selo e para o evento ("Integra Contador", "WhatsApp Cloud API"). */
  fonte: string
  latencia_ms: number
  gerado_em: string
}

export class ErroServico extends Error {
  readonly fonte: string
  readonly codigo: string
  constructor(fonte: string, codigo: string, mensagem: string) {
    super(mensagem)
    this.fonte = fonte
    this.codigo = codigo
  }
}

/** Situação de um serviço para a tela de integrações (ligado de verdade ou em demonstração). */
export interface InfoServico {
  id: string
  nome: string
  /** O que faria no produto. */
  descricao: string
  modo: 'demonstracao' | 'real'
  /** Quem cobra ou o que falta para ligar (contrato, certificado, credenciamento). */
  requisito: string
}

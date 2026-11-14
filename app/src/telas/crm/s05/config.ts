import { usePersistente } from '@/ambiente/loja'

/**
 * S05: configurações do atendimento que o protótipo não tinha (C2-07 nome de
 * quem atende, D-31 clientes-piloto, D-33 categorias liberadas, satisfação,
 * bloqueados, retenção, caixas de e-mail dos setores). Estado de tela do
 * escritório (`usePersistente`), a migrar para Configuração local no backend.
 */

export interface CfgAtendimento {
  /** C2-07: como o nome de quem atende entra na mensagem. */
  assinatura: { modo: 'prefixo' | 'rodape' | 'desligado'; exibicao: 'primeiro_nome' | 'nome_completo' | 'nome_e_setor' }
  /** 04, 8.2: pesquisa de satisfação ao resolver. */
  satisfacao: boolean
  /** D-31: clientes-piloto, onde o integrante responde sozinho as categorias liberadas. */
  pilotos: string[]
  /** D-33: começa sem categoria liberada; o Administrador libera uma por uma. */
  categorias: Record<string, boolean>
  /** 04, 10.3. */
  retencaoMeses: number
  guardarLeads: boolean
  aviso: string
}

export const categoriasAtendimento: { id: string; rotulo: string; exemplo: string }[] = [
  { id: 'segunda_via', rotulo: 'Segunda via de guia e boleto', exemplo: '"Manda de novo o DAS?"' },
  { id: 'status_tarefa', rotulo: 'Andamento de um pedido', exemplo: '"Já saiu a alteração contratual?"' },
  { id: 'recebimento', rotulo: 'Confirmar que o documento chegou', exemplo: '"Vocês receberam o extrato?"' },
  { id: 'prazo', rotulo: 'Datas de vencimento', exemplo: '"Quando vence o FGTS?"' },
  { id: 'agendamento', rotulo: 'Marcar reunião', exemplo: '"Posso falar com a Fernanda quinta?"' },
]

export const cfgInicial: CfgAtendimento = {
  assinatura: { modo: 'prefixo', exibicao: 'primeiro_nome' },
  satisfacao: true,
  pilotos: ['c1', 'c3'],
  categorias: Object.fromEntries(categoriasAtendimento.map((c) => [c.id, false])),
  retencaoMeses: 12,
  guardarLeads: true,
  aviso: 'Usamos seus dados para prestar os serviços contábeis contratados e para falar com você sobre eles. Você pode pedir a qualquer momento uma cópia ou a correção dos seus dados.',
}

export function useCfgAtendimento() {
  return usePersistente<CfgAtendimento>('s05:crm:atendimento', cfgInicial)
}

/** Aplica o nome de quem atende na mensagem (C2-07). */
export function assinar(texto: string, nome: string, setor: string, cfg: CfgAtendimento['assinatura']): string {
  if (cfg.modo === 'desligado') return texto
  const exibido = cfg.exibicao === 'primeiro_nome' ? nome.split(' ')[0] : cfg.exibicao === 'nome_completo' ? nome : `${nome.split(' ')[0]} · ${setor}`
  return cfg.modo === 'prefixo' ? `*${exibido}:*\n${texto}` : `${texto}\n\n— ${exibido}`
}

export interface NumeroBloqueado {
  numero: string
  motivo: string
  por: string
  em: string
  mensagens: number
}
export const bloqueadosIniciais: NumeroBloqueado[] = [{ numero: '+55 11 90000-1122', motivo: 'Golpe: pedia Pix em nome do escritório', por: 'João Pereira', em: '02/11', mensagens: 3 }]
export function useBloqueados() {
  return usePersistente<NumeroBloqueado[]>('s05:crm:bloqueados', bloqueadosIniciais)
}

export interface CaixaEmail {
  setor: string
  endereco: string
  provedor: 'Gmail' | 'Microsoft 365' | 'IMAP'
  conectada: boolean
  le: { entrada: boolean; enviados: boolean; anexos: boolean }
  ultimaLeitura?: string
}
export const caixasIniciais: CaixaEmail[] = [
  { setor: 'gestao_atendimento', endereco: 'contato@contabilandrade.com.br', provedor: 'Microsoft 365', conectada: true, le: { entrada: true, enviados: true, anexos: true }, ultimaLeitura: 'há 4 min' },
  { setor: 'fiscal', endereco: 'fiscal@contabilandrade.com.br', provedor: 'Microsoft 365', conectada: true, le: { entrada: true, enviados: true, anexos: true }, ultimaLeitura: 'há 4 min' },
  { setor: 'dp', endereco: 'dp@contabilandrade.com.br', provedor: 'Gmail', conectada: false, le: { entrada: true, enviados: true, anexos: true } },
  { setor: 'contabil', endereco: 'contabil@contabilandrade.com.br', provedor: 'Microsoft 365', conectada: false, le: { entrada: true, enviados: true, anexos: true } },
]
export function useCaixasEmail() {
  return usePersistente<CaixaEmail[]>('s05:crm:caixas', caixasIniciais)
}

/** Provedor de cada número (04, 3.5): Cloud API, provedor parceiro ou o experimental. */
export function useProvedores() {
  return usePersistente<Record<string, { provedor: 'cloud_api' | '360dialog' | 'gupshup' | 'zapi' | 'experimental'; desde: string }>>('s05:crm:provedores', {})
}

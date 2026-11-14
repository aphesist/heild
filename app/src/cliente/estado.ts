import { useLoja, usePersistente } from '@/ambiente/loja'
import { convitesIniciais, HOJE, type ConviteApp } from './dados'

/**
 * Estado do app do cliente (S10). Tudo persiste no banco do escritório pela
 * tabela `registro_tela` (usePersistente), nos dois modos de dados (local e
 * Supabase), sem migração nova. O que o escritório precisa ver e agir (tarefa,
 * conversa, documento, aviso, evento) continua indo pela loja, nas entidades.
 * Chaves sempre com o prefixo `s10:`.
 */

/* ---------- Acesso da pessoa (06, 2.2) ---------- */

export interface AcessoPessoa {
  termo?: { versao: string; em: string }
  senha?: boolean
  biometria?: 'ativa' | 'recusada' | null
  instalado?: 'android' | 'ios' | 'computador' | null
  push?: 'permitido' | 'negado' | null
  /** O pedido de push só aparece depois de um toque da pessoa (06, 3.11). */
  pushPerguntado?: boolean
  instalarDispensado?: boolean
  ultimoAcesso?: string
  segundoFator?: boolean
}

/** Quem já usava o app antes da demonstração aceitou o termo v3 em setembro. */
export const acessoInicial = (): AcessoPessoa => ({ termo: { versao: 'v3 · 01/09/2026', em: '02/09/2026 10:14' }, biometria: null, instalado: null, push: null })

export function useAcesso(pessoa: string) {
  return usePersistente<AcessoPessoa>(`s10:acesso:${pessoa}`, acessoInicial)
}

export interface SessaoApp {
  id: string
  aparelho: string
  local: string
  ultimo: string
  atual?: boolean
  chave?: boolean
}

export const sessoesIniciais = (): SessaoApp[] => [
  { id: 'atual', aparelho: 'Este aparelho · navegador do celular', local: 'São Paulo, SP', ultimo: 'agora', atual: true },
  { id: 's-android', aparelho: 'Android · app instalado', local: 'São Paulo, SP', ultimo: 'ontem 18:40' },
  { id: 's-pc', aparelho: 'Computador · Edge', local: 'Campinas, SP', ultimo: '06/11 09:12' },
]

export function useSessoes(pessoa: string) {
  return usePersistente<SessaoApp[]>(`s10:sessoes:${pessoa}`, sessoesIniciais)
}

export const historicoEntradas = [
  { quando: `${HOJE.slice(0, 5)} 08:02`, aparelho: 'Este aparelho', local: 'São Paulo, SP', forma: 'código por WhatsApp' },
  { quando: '17/11 18:40', aparelho: 'Android · app', local: 'São Paulo, SP', forma: 'biometria' },
  { quando: '06/11 09:12', aparelho: 'Computador · Edge', local: 'Campinas, SP', forma: 'código por e-mail' },
]

/* ---------- Preferências de aviso (06, 10) ---------- */

export type CategoriaAviso = 'documento' | 'pendencia' | 'prazo' | 'conversa' | 'tarefa' | 'sistema'
export type CanalAviso = 'push' | 'whatsapp' | 'email'

export const rotuloCategoria: Record<CategoriaAviso, string> = {
  documento: 'Documentos novos',
  pendencia: 'Pendências',
  prazo: 'Vencimentos',
  conversa: 'Respostas na conversa',
  tarefa: 'Pedidos',
  sistema: 'Avisos do escritório e acesso',
}

export interface Preferencias {
  canais: Record<CategoriaAviso, CanalAviso[]>
  silencio: { ligado: boolean; de: string; ate: string }
  resumoDiario: { ligado: boolean; hora: string }
  resumoSemanal: boolean
  competenciasSilenciadas: string[]
}

export const preferenciasIniciais = (): Preferencias => ({
  canais: { documento: ['push'], pendencia: ['push', 'whatsapp'], prazo: ['push', 'whatsapp'], conversa: ['push'], tarefa: ['push'], sistema: ['push', 'email'] },
  silencio: { ligado: true, de: '22:00', ate: '07:00' },
  resumoDiario: { ligado: true, hora: '18:00' },
  resumoSemanal: false,
  competenciasSilenciadas: [],
})

export function usePreferencias(pessoa: string) {
  return usePersistente<Preferencias>(`s10:pref:${pessoa}`, preferenciasIniciais)
}

/* ---------- Central de avisos do app (06, 10) ---------- */

export type Prioridade = 'urgente' | 'alta' | 'normal' | 'baixa'

export interface AvisoApp {
  id: string
  categoria: CategoriaAviso
  prioridade: Prioridade
  titulo: string
  corpo?: string
  quando: string
  /** Agrupamento (cliente + competência + tipo): "8 holerites de outubro". */
  quantidade?: number
  competencia?: string
  /** Área do papel que vê (vazio: todos da empresa). */
  area?: string
  /** Pessoas (vazio: todos com a área). */
  para?: string[]
  destino?: { tela: string; item?: string }
}

export const avisosBase = (clienteId: string): AvisoApp[] => [
  { id: `av-${clienteId}-holerites`, categoria: 'documento', prioridade: 'alta', titulo: '8 holerites de outubro', corpo: 'Folha 10/2026 pronta para baixar', quando: '01/11 10:02', quantidade: 8, competencia: '10/2026', area: 'folha', destino: { tela: 'documentos' } },
  { id: `av-${clienteId}-guias`, categoria: 'documento', prioridade: 'alta', titulo: 'Guias de outubro: 3 guias', corpo: 'Vencem em 20/11', quando: '12/11 09:30', quantidade: 3, competencia: '10/2026', area: 'guias', destino: { tela: 'documentos' } },
  { id: `av-${clienteId}-prazo`, categoria: 'prazo', prioridade: 'alta', titulo: 'Guia vence em 2 dias', corpo: 'DAS 10/2026 vence em 20/11', quando: `${HOJE.slice(0, 5)} 08:00`, competencia: '10/2026', area: 'guias', destino: { tela: 'inicio' } },
  { id: `av-${clienteId}-pend`, categoria: 'pendencia', prioridade: 'alta', titulo: 'O escritório precisa de documentos', corpo: 'Veja em Pendências o que falta de outubro', quando: '15/11 09:00', competencia: '10/2026', destino: { tela: 'pendencias' } },
  { id: `av-${clienteId}-feriado`, categoria: 'sistema', prioridade: 'normal', titulo: 'Comunicado: feriado de 20/11', corpo: 'Sem expediente no escritório', quando: '14/11 11:20', destino: { tela: 'inicio' } },
  { id: `av-${clienteId}-acesso`, categoria: 'sistema', prioridade: 'alta', titulo: 'Acesso novo à sua conta', corpo: 'Computador · Edge · Campinas, SP', quando: '06/11 09:12', destino: { tela: 'empresa', item: 'acessos' } },
]

export function useAvisosApp(clienteId: string) {
  return usePersistente<AvisoApp[]>(`s10:avisos:${clienteId}`, () => avisosBase(clienteId))
}

export function useLidos(pessoa: string) {
  return usePersistente<string[]>(`s10:lidos:${pessoa}`, [])
}

/* ---------- Convites (06, 2.1) ---------- */

export function useConvites() {
  return usePersistente<ConviteApp[]>('s10:convites', convitesIniciais)
}

/* ---------- Pendências: recibos e estado de cada item (06, 4.1) ---------- */

export interface Recibo {
  protocolo: string
  quando: string
  hash: string
  arquivos: string[]
  quem: string
  item: string
  tarefaId?: string
}

export function useRecibos(clienteId: string) {
  return usePersistente<Recibo[]>(`s10:recibos:${clienteId}`, [])
}

export interface EstadoPendencia {
  situacao?: 'em_conferencia' | 'devolvida' | 'recebida' | 'nao_tenho' | 'ja_fiz'
  motivo?: string
  recibo?: string
  em: string
  /** Formulário preenchido (informação). */
  respostas?: Record<string, string>
  /** "Visto no app" não para a régua (06, 4.1, regra 7), mas aparece na próxima etapa. */
  visto?: string
}

export function useEstadoPendencias(clienteId: string) {
  return usePersistente<Record<string, EstadoPendencia>>(`s10:pend:${clienteId}`, {})
}

/* ---------- Documentos: links para terceiros (06, 5.4) e farol (D-17) ---------- */

export interface LinkCompartilhado {
  id: string
  docIds: string[]
  nomes: string[]
  para: string
  validadeDias: number
  expiraEm: string
  senha: boolean
  criadoEm: string
  acessos: { quando: string; ip: string }[]
  revogado?: string
}

export function useLinks(clienteId: string) {
  return usePersistente<LinkCompartilhado[]>(`s10:links:${clienteId}`, [])
}

export interface Reenvio {
  docId: string
  canal: 'whatsapp' | 'email'
  situacao: 'preparado' | 'enviado' | 'recusado'
  em: string
  cartao: string
}

export function useReenvios() {
  return usePersistente<Record<string, Reenvio>>('s10:reenvios', {})
}

/* ---------- Assinaturas (06, 5.5; C2-06; D-16) ---------- */

export interface DocAssinar {
  id: string
  clienteId: string
  titulo: string
  nivel: 'ciencia' | 'avancada' | 'qualificada'
  origem: string
  setor: string
  texto: string
  enviadoEm: string
  prazo?: string
  situacao: 'aguardando' | 'assinado' | 'recusado' | 'em_conferencia'
  assinadoEm?: string
  assinadoPor?: string
  hash?: string
  ip?: string
  envelope?: string
  etapa?: string
  motivoRecusa?: string
  /** Lembretes da régua já mandados (D+1, D+3...). */
  lembretes?: string[]
  codigo?: string
}

const assinaturasBase = (clienteId: string): DocAssinar[] =>
  clienteId === 'c2'
    ? [
        {
          id: 'as-c2-termo-he',
          clienteId,
          titulo: 'Termo de ciência: horas extras pagas fora da folha',
          nivel: 'avancada',
          origem: 'DP · termo de ciência (C2-06)',
          setor: 'dp',
          texto: 'Declaro que fui orientado pelo escritório de que pagar horas extras por fora da folha gera risco trabalhista e previdenciário, e que a decisão de manter esse pagamento é da empresa.',
          enviadoEm: '16/11/2026',
          prazo: '23/11/2026',
          situacao: 'aguardando',
          lembretes: ['17/11 (D+1)'],
          codigo: 'C2-06',
        },
      ]
    : clienteId === 'c1'
      ? [
          {
            id: 'as-c1-balancete',
            clienteId,
            titulo: 'Ciência do balancete e DRE de setembro/2026',
            nivel: 'ciencia',
            origem: 'Contábil · assinado pelo contador (D-16)',
            setor: 'contabil',
            texto: 'Li o balancete e a DRE de setembro/2026, assinados pelo contador responsável (CRC 1SP 234.567/O-8, assinatura conferida no PDF), e estou ciente dos números apresentados.',
            enviadoEm: '10/11/2026',
            situacao: 'aguardando',
            codigo: 'D-16',
          },
        ]
      : []

export function useAssinaturas(clienteId: string) {
  return usePersistente<DocAssinar[]>(`s10:assin:${clienteId}`, () => assinaturasBase(clienteId))
}

/* ---------- Pedidos (06, 4.3) ---------- */

export interface ExtraPedido {
  tipo: string
  campos: Record<string, string>
  abertoEm: string
  previsao: string
  avulso?: { valor: number; autorizado?: { por: string; em: string }; recusado?: { por: string; em: string } }
  motivoCancelamento?: string
  /** Resultado entregue (concluído com o resultado). */
  resultado?: string
  /** C2-02: simulado entregue e a resposta do cliente. */
  simulado?: { entregueEm: string; resposta?: 'seguir' | 'nao_seguir'; respondidoEm?: string; lembretes?: string[] }
  /** C2-14: declaração assinada pelo contador e conferida. */
  declaracao?: { receita12m: number; fontes: string; assinadaEm?: string; docId?: string }
  /** Itens que o escritório pediu (aguardando você). */
  aguardando?: string[]
}

export function usePedidosExtra(clienteId: string) {
  return usePersistente<Record<string, ExtraPedido>>(`s10:pedidos:${clienteId}`, {})
}

/* ---------- Conversa (06, 7) ---------- */

export interface EstadoConversa {
  avaliacoes: Record<string, { nota: 'otimo' | 'ok' | 'ruim'; em: string }>
  implicitos: Record<string, 'aberto' | 'dispensado'>
  audios: Record<string, { segundos: number }>
}

export function useEstadoConversa(clienteId: string) {
  return usePersistente<EstadoConversa>(`s10:conversa:${clienteId}`, { avaliacoes: {}, implicitos: {}, audios: {} })
}

/* ---------- Agenda (06, 3.7) ---------- */

export interface Reuniao {
  id: string
  tarefaId: string
  setor: string
  responsavel: string
  quando: string
  tipo: string
  duracao: string
  canal: string
  pauta: string[]
  situacao: 'marcada' | 'cancelada' | 'remarcada'
  historico: string[]
}

export function useReunioes(clienteId: string) {
  return usePersistente<Reuniao[]>(`s10:reunioes:${clienteId}`, [])
}

/* ---------- Financeiro com o escritório (09, 10.8) ---------- */

export interface EstadoFinanceiro {
  pixAutomatico?: { situacao: 'ativo' | 'cancelado'; desde: string; limite: number; banco: string }
  informadas: string[]
  contestadas: Record<string, { motivo: string; em: string; tarefaId?: string }>
  segundasVias: Record<string, { valor: number; vencimento: string; em: string }>
}

export function useFinanceiroApp(clienteId: string) {
  return usePersistente<EstadoFinanceiro>(`s10:fin:${clienteId}`, { informadas: [], contestadas: {}, segundasVias: {} })
}

/** Guias marcadas como pagas pelo cliente (`confirmado_pelo_cliente`): pausam a régua, não substituem a conciliação. */
export function useGuiasInformadas(clienteId: string) {
  return usePersistente<Record<string, string>>(`s10:guias:${clienteId}`, {})
}

/* ---------- Empresa (06, 3.9; 2.5; 6.2) ---------- */

export interface CertificadoApp {
  termoVersao: number
  servicos: { captura: boolean; consultas: boolean; fornecedores: boolean; transmissao: boolean }
  versoes: { versao: number; em: string; servicos: string }[]
  revogado?: string
  enviadoNovo?: { em: string; validade: string }
}

export interface EstadoEmpresa {
  saidas: Record<string, { em: string; tarefaId?: string }>
  revisao?: { em: string; respostas: Record<string, 'sim' | 'saiu'> }
  alteracoes: { em: string; oque: string; tarefaId?: string }[]
  cert: CertificadoApp
  termos: { titulo: string; versao: string; em: string }[]
}

export const empresaInicial = (): EstadoEmpresa => ({
  saidas: {},
  alteracoes: [],
  cert: { termoVersao: 1, servicos: { captura: true, consultas: true, fornecedores: true, transmissao: false }, versoes: [{ versao: 1, em: '11/2025', servicos: 'captura de notas, consultas em portais, consultas por fornecedor' }] },
  termos: [
    { titulo: 'Termo de uso do app', versao: 'v3', em: '02/09/2026' },
    { titulo: 'Autorização de uso do certificado A1', versao: 'v1', em: '11/2025' },
    { titulo: 'Política de privacidade (LGPD)', versao: 'v2', em: '02/09/2026' },
  ],
})

export function useEmpresaApp(clienteId: string) {
  return usePersistente<EstadoEmpresa>(`s10:empresa:${clienteId}`, empresaInicial)
}

/* ---------- Consultor da empresa (06, 9) ---------- */

export interface MsgConsultor {
  id: string
  de: 'eu' | 'consultor'
  texto: string
  fonte?: string
  tarefa?: string
  demonstracao?: boolean
  cartao?: { titulo: string; linhas: [string, string][] }
}

export interface EstadoConsultor {
  usadas: number
  franquia: number
  msgs: MsgConsultor[]
}

export function useConsultorApp(clienteId: string) {
  return usePersistente<EstadoConsultor>(`s10:consultor:${clienteId}`, { usadas: 7, franquia: 40, msgs: [] })
}

/* ---------- Saída do escritório (06, 12.6): modo leitura ---------- */

export function useSaidaEscritorio() {
  return usePersistente<{ encerraEm: string; desde: string } | null>('s10:saida', null)
}

/* ---------- Cartões do escritório que vêm do app (payload para o efeito) ---------- */

export type PayloadCartao =
  | { tipo: 'reenvio'; clienteId: string; docId: string; docNome: string; canal: 'whatsapp' | 'email'; contato: string; conversa?: string }
  | { tipo: 'simulado'; clienteId: string; clienteNome: string; tarefaId: string; empregado: string; tipoRescisao: string; data: string; contato: string }
  | { tipo: 'declaracao'; clienteId: string; clienteNome: string; tarefaId: string; finalidade: string; periodo: string; receita: number; contato: string }
  | { tipo: 'termo'; clienteId: string; clienteNome: string; titulo: string; texto: string; contato: string }
  | { tipo: 'resposta'; clienteId: string; clienteNome: string; conversa: string; setor: string; texto: string; contato: string }

export const CHAVE_CARTOES = 's10:cartoes'

export function useCartoesS10() {
  return usePersistente<Record<string, PayloadCartao>>(CHAVE_CARTOES, {})
}

/** Grava direto na memória da loja (para quem não está num componente com o hook: o efeito do cartão, o motor). */
export function useGravarS10() {
  const loja = useLoja()
  // O redutor lê o valor atual no banco na hora (chamadas seguidas não se atropelam).
  return <T>(chave: string, inicial: T, atualizar: (atual: T) => T) => loja.lembrar(chave, inicial, atualizar)
}

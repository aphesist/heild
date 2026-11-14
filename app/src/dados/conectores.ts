import { useMemo } from 'react'
import type { Destino } from '@/ambiente/loja'
import { banco } from '@/nucleo/banco'
import { useTabela } from '@/nucleo/react'
import { repos } from '@/nucleo/repositorios'
import { ID_HORIZONTE } from '@/nucleo/semente'

/**
 * Contrato C9 (SESSOES.md, seção 3): estado e saúde de cada conector do
 * escritório. Dono: S09 (Configurações › Conectores e cofre). Quem usa: S02
 * (saúde da captura em Notas), S03 (caixa postal e conectores do Fiscal e do
 * Contábil), S08 (conexão de ERP do BPO).
 *
 * Leitura:
 *   estadoConector('integra_contador')       // fora do React (um objeto pronto)
 *   useEstadoConector('integra_contador')    // na tela (renderiza de novo quando muda)
 *   useConectores()                          // todos, para listas
 * Link para a tela: `irPara(destinoConectores)` ou `destinoConector(id)`.
 *
 * O estado fica no banco (tabela `registro_tela`, chave CHAVE_ESTADO), por
 * cima do padrão de cada escritório de exemplo; o painel Demonstração e a tela
 * de Conectores mudam o estado com `definirEstadoConector`. Nada sai do
 * navegador: os conectores são simulados (mapa, 1.6 e 1.7).
 */

/** Famílias da tela de Conectores (08, 2). */
export type FamiliaConector = 'federal' | 'estadual' | 'municipal' | 'core' | 'mercado' | 'erp' | 'nuvem' | 'mensageria'

export const rotuloFamilia: Record<FamiliaConector, string> = {
  federal: 'Governo federal',
  estadual: 'Governo estadual',
  municipal: 'Governo municipal',
  core: 'Sistemas contábeis',
  mercado: 'Mercado (bancos, cobrança, assinatura)',
  erp: 'ERPs de clientes',
  nuvem: 'Nuvens de arquivo',
  mensageria: 'WhatsApp e e-mail',
}

/**
 * Estados possíveis (mapa, 1.6: conector fora do ar, credencial vencida,
 * certificado vencido, limite de consulta, CAPTCHA pendente, timeout; 08, 10:
 * pausado pelo teto de custo).
 */
export type EstadoConexao =
  | 'ativo'
  | 'somente_leitura'
  | 'erro_credencial'
  | 'certificado_vencido'
  | 'fora_do_ar'
  | 'limite'
  | 'captcha'
  | 'timeout'
  | 'pausado_teto'
  | 'desconectado'

export type TomEstado = 'ok' | 'atencao' | 'erro' | 'neutro'

export const rotuloEstado: Record<EstadoConexao, string> = {
  ativo: 'Ativo',
  somente_leitura: 'Somente leitura',
  erro_credencial: 'Erro de credencial',
  certificado_vencido: 'Certificado vencido',
  fora_do_ar: 'Fora do ar',
  limite: 'Limite de consulta',
  captcha: 'CAPTCHA pendente',
  timeout: 'Sem resposta',
  pausado_teto: 'Pausado pelo teto',
  desconectado: 'Não conectado',
}

export const tomEstado: Record<EstadoConexao, TomEstado> = {
  ativo: 'ok',
  somente_leitura: 'neutro',
  erro_credencial: 'erro',
  certificado_vencido: 'erro',
  fora_do_ar: 'erro',
  limite: 'atencao',
  captcha: 'atencao',
  timeout: 'atencao',
  pausado_teto: 'atencao',
  desconectado: 'neutro',
}

/** O que a pessoa lê quando o conector não está ativo (frase pronta para a tela de quem usa). */
const fraseEstado: Record<EstadoConexao, string> = {
  ativo: 'Funcionando.',
  somente_leitura: 'Lê, mas não grava (origem antiga ou migração).',
  erro_credencial: 'A credencial foi recusada. O Administrador precisa conectar de novo.',
  certificado_vencido: 'O certificado digital venceu. Renove no cofre.',
  fora_do_ar: 'O serviço do outro lado está fora do ar. As rotinas tentam de novo sozinhas.',
  limite: 'Chegou ao limite de consultas do período. Volta no próximo ciclo.',
  captcha: 'O portal pediu CAPTCHA. Uma pessoa precisa resolver para a rotina seguir.',
  timeout: 'O serviço demorou demais para responder. Nova tentativa agendada.',
  pausado_teto: 'Pausado: o escritório chegou ao teto de custo do mês.',
  desconectado: 'Ainda não conectado.',
}

export type IdConector =
  | 'integra_contador'
  | 'ecac'
  | 'esocial'
  | 'reinf'
  | 'dfe'
  | 'nfse_nacional'
  | 'cnpj'
  | 'certidoes'
  | 'sefaz_sp'
  | 'dte_estadual'
  | 'prefeitura_sp'
  | 'prefeituras'
  | 'alterdata'
  | 'dominio'
  | 'questor'
  | 'open_finance'
  | 'cobranca'
  | 'assinatura'
  | 'conta_azul'
  | 'omie'
  | 'bling'
  | 'google_drive'
  | 'onedrive'
  | 's3'
  | 'drive_antigo'
  | 'whatsapp'
  | 'email'

/** Como conecta (08, 2.2): token, OAuth, certificado ou termo do Integra; robô quando o portal não tem API. */
export type ModoConexao = 'termo' | 'certificado' | 'oauth' | 'token' | 'robo' | 'arquivo' | 'chave'

export interface DefConector {
  id: IdConector
  nome: string
  familia: FamiliaConector
  /** Código do catálogo de APIs do mapa (1.7). */
  api: string
  modo: ModoConexao
  /** O que este conector faz no sistema (uma linha). */
  para: string
  /** Paga por consulta (entra no custo do mês e respeita o teto). */
  pago: boolean
}

export const catalogoConectores: DefConector[] = [
  { id: 'integra_contador', nome: 'Integra Contador (SERPRO)', familia: 'federal', api: 'API-06', modo: 'termo', para: 'PGDAS-D, DAS, DCTFWeb, caixa postal, SITFIS, parcelamentos e procurações', pago: true },
  { id: 'ecac', nome: 'e-CAC e portais sem API', familia: 'federal', api: 'API-07', modo: 'robo', para: 'PER/DCOMP, Regularize e o que o Integra não cobre', pago: false },
  { id: 'esocial', nome: 'eSocial', familia: 'federal', api: 'API-08', modo: 'certificado', para: 'Envio, consulta e download de eventos da folha', pago: false },
  { id: 'reinf', nome: 'EFD-Reinf', familia: 'federal', api: 'API-09', modo: 'certificado', para: 'Retenções e a trava do relatório contábil', pago: false },
  { id: 'dfe', nome: 'Distribuição de DF-e', familia: 'federal', api: 'API-10', modo: 'certificado', para: 'NF-e e CT-e recebidas e manifestação', pago: false },
  { id: 'nfse_nacional', nome: 'NFS-e Nacional', familia: 'federal', api: 'API-11', modo: 'certificado', para: 'Notas de serviço emitidas e recebidas, emissão por DPS', pago: false },
  { id: 'cnpj', nome: 'Consulta CNPJ e CPF', familia: 'federal', api: 'API-12', modo: 'token', para: 'Cadastro de clientes e leads', pago: true },
  { id: 'certidoes', nome: 'Certidões', familia: 'federal', api: 'API-13', modo: 'robo', para: 'Federais, estaduais, municipais, CNDT e CRF', pago: true },
  { id: 'sefaz_sp', nome: 'SEFAZ-SP', familia: 'estadual', api: 'API-14', modo: 'certificado', para: 'GIA, ICMS, Sintegra e notas estaduais', pago: false },
  { id: 'dte_estadual', nome: 'DTE estaduais (agregador)', familia: 'estadual', api: 'API-14', modo: 'token', para: 'Caixas postais estaduais, DEC, JUCESP, Bombeiros', pago: true },
  { id: 'prefeitura_sp', nome: 'Prefeitura de São Paulo', familia: 'municipal', api: 'API-07', modo: 'certificado', para: 'ISS, NFS-e municipal e livro fiscal', pago: false },
  { id: 'prefeituras', nome: 'Outras prefeituras (robô)', familia: 'municipal', api: 'API-07', modo: 'robo', para: 'Guias de ISS e notas das prefeituras sem API', pago: false },
  { id: 'alterdata', nome: 'Alterdata (ePlugin)', familia: 'core', api: 'API-18', modo: 'token', para: 'Lançamentos, folha e cadastro de clientes', pago: false },
  { id: 'dominio', nome: 'Domínio / Onvio', familia: 'core', api: 'API-18', modo: 'oauth', para: 'Lançamentos, folha e cadastro de clientes', pago: false },
  { id: 'questor', nome: 'Questor', familia: 'core', api: 'API-18', modo: 'arquivo', para: 'Importação por arquivo', pago: false },
  { id: 'open_finance', nome: 'Open Finance (agregador)', familia: 'mercado', api: 'API-19', modo: 'oauth', para: 'Extratos dos clientes e do escritório', pago: true },
  { id: 'cobranca', nome: 'Cobrança (boleto e Pix)', familia: 'mercado', api: 'API-20', modo: 'token', para: 'Honorários do escritório e cobrança do BPO', pago: true },
  { id: 'assinatura', nome: 'Assinatura eletrônica', familia: 'mercado', api: 'API-22', modo: 'token', para: 'Contratos, termos e demonstrações assinadas', pago: true },
  { id: 'conta_azul', nome: 'Conta Azul', familia: 'erp', api: 'API-25', modo: 'oauth', para: 'BPO: contas, lançamentos e conciliação', pago: false },
  { id: 'omie', nome: 'Omie', familia: 'erp', api: 'API-25', modo: 'token', para: 'BPO: contas, lançamentos e conciliação', pago: false },
  { id: 'bling', nome: 'Bling', familia: 'erp', api: 'API-25', modo: 'oauth', para: 'BPO: vendas, notas e contas', pago: false },
  { id: 'google_drive', nome: 'Google Drive', familia: 'nuvem', api: 'API-24', modo: 'oauth', para: 'Armazenamento padrão dos documentos', pago: false },
  { id: 'onedrive', nome: 'OneDrive / SharePoint', familia: 'nuvem', api: 'API-24', modo: 'oauth', para: 'Armazenamento de documentos', pago: false },
  { id: 's3', nome: 'S3 compatível', familia: 'nuvem', api: 'API-24', modo: 'chave', para: 'Arquivo morto e cópia de segurança', pago: true },
  { id: 'drive_antigo', nome: 'Drive antigo (servidor)', familia: 'nuvem', api: 'API-24', modo: 'oauth', para: 'Pastas de antes da Heild, só leitura até migrar', pago: false },
  { id: 'whatsapp', nome: 'WhatsApp Cloud API', familia: 'mensageria', api: 'API-03', modo: 'oauth', para: 'Conversas do CRM, régua e comunicados', pago: true },
  { id: 'email', nome: 'E-mail do escritório', familia: 'mensageria', api: 'API-05', modo: 'oauth', para: 'Lê tudo: entrada, enviados e anexos', pago: false },
]

/** Situação gravada de um conector (o que muda com o uso). */
export interface SituacaoConector {
  estado: EstadoConexao
  /** ISO da última execução bem-sucedida ou tentativa. */
  ultima_execucao: string | null
  /** Itens esperando na fila do conector. */
  fila: number
  /** Arquivos ou consultas com erro desde a última execução boa. */
  erros: number
  /** Frase própria (ex.: o motivo de uma simulação); sem ela vale a frase do estado. */
  mensagem?: string
}

/** O que `estadoConector(id)` devolve: tudo pronto para mostrar. */
export interface SaudeConector extends DefConector, SituacaoConector {
  rotulo: string
  tom: TomEstado
  /** Pode ser usado agora (ativo; somente leitura conta para leitura). */
  funcionando: boolean
  /** Precisa de alguém (erro de credencial, certificado, CAPTCHA). */
  precisaDePessoa: boolean
  frase: string
  destino: Destino
}

export const CHAVE_ESTADO = 's09:conectores:estado'

/** Link para Configurações › Conectores e cofre. */
export const destinoConectores: Destino = { modulo: 'config', aba: 'conectores' }
export const destinoConector = (_id: IdConector): Destino => ({ ...destinoConectores })

const horasAtras = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString()

/** Padrão de cada escritório de exemplo (o Andrade completo; o Horizonte em implantação). */
function padraoDoEscritorio(): Partial<Record<IdConector, SituacaoConector>> {
  const s = (estado: EstadoConexao, h: number | null, fila = 0, erros = 0): SituacaoConector => ({ estado, ultima_execucao: h === null ? null : horasAtras(h), fila, erros })
  if (banco.escritorioId === ID_HORIZONTE) {
    return { google_drive: s('ativo', 1), email: s('ativo', 0.2), cnpj: s('ativo', 30) }
  }
  return {
    integra_contador: s('ativo', 0.5, 3),
    ecac: s('captcha', 5, 2, 1),
    esocial: s('ativo', 2),
    reinf: s('ativo', 26),
    dfe: s('ativo', 1, 12),
    nfse_nacional: s('ativo', 1, 4),
    cnpj: s('ativo', 3),
    certidoes: s('ativo', 8),
    sefaz_sp: s('ativo', 6),
    dte_estadual: s('ativo', 4),
    prefeitura_sp: s('erro_credencial', 30, 6, 6),
    prefeituras: s('ativo', 12, 1),
    alterdata: s('ativo', 1),
    open_finance: s('ativo', 0.7, 2),
    cobranca: s('ativo', 0.3),
    assinatura: s('ativo', 20),
    conta_azul: s('ativo', 2),
    omie: s('limite', 3, 9),
    google_drive: s('ativo', 0.1),
    s3: s('ativo', 24),
    drive_antigo: s('somente_leitura', 48),
    whatsapp: s('ativo', 0.05),
    email: s('ativo', 0.1),
  }
}

const desconectado: SituacaoConector = { estado: 'desconectado', ultima_execucao: null, fila: 0, erros: 0 }

function gravado(): Partial<Record<IdConector, Partial<SituacaoConector>>> {
  return (banco.obter('registro_tela', CHAVE_ESTADO)?.valor as Partial<Record<IdConector, Partial<SituacaoConector>>> | undefined) ?? {}
}

function montar(def: DefConector, padrao: Partial<Record<IdConector, SituacaoConector>>, mudado: Partial<Record<IdConector, Partial<SituacaoConector>>>): SaudeConector {
  const sit: SituacaoConector = { ...desconectado, ...padrao[def.id], ...mudado[def.id] }
  return {
    ...def,
    ...sit,
    rotulo: rotuloEstado[sit.estado],
    tom: tomEstado[sit.estado],
    funcionando: sit.estado === 'ativo' || sit.estado === 'somente_leitura',
    precisaDePessoa: sit.estado === 'erro_credencial' || sit.estado === 'certificado_vencido' || sit.estado === 'captcha',
    frase: sit.mensagem ?? fraseEstado[sit.estado],
    destino: destinoConector(def.id),
  }
}

const desconhecido = (id: string): DefConector => ({ id: id as IdConector, nome: id, familia: 'federal', api: '', modo: 'token', para: '', pago: false })

/** Estado de um conector, fora do React. */
export function estadoConector(id: IdConector): SaudeConector {
  const def = catalogoConectores.find((c) => c.id === id) ?? desconhecido(id)
  return montar(def, padraoDoEscritorio(), gravado())
}

/** Todos os conectores, fora do React. */
export function listarConectores(): SaudeConector[] {
  const padrao = padraoDoEscritorio()
  const mudado = gravado()
  return catalogoConectores.map((d) => montar(d, padrao, mudado))
}

/** Estado de um conector na tela (renderiza de novo quando muda). */
export function useEstadoConector(id: IdConector): SaudeConector {
  const t = useTabela('registro_tela')
  return useMemo(() => estadoConector(id), [t, id])
}

/** Todos os conectores na tela. */
export function useConectores(): SaudeConector[] {
  const t = useTabela('registro_tela')
  return useMemo(() => listarConectores(), [t])
}

/** Muda a situação de um conector (tela de Conectores, painel Demonstração, rotinas simuladas). */
export function definirEstadoConector(id: IdConector, patch: Partial<SituacaoConector>) {
  const atual = gravado()
  repos.telas.lembrar(CHAVE_ESTADO, { ...atual, [id]: { ...atual[id], ...patch } })
}

/** Volta todos os conectores ao padrão do escritório de exemplo. */
export function restaurarConectores() {
  repos.telas.esquecer(CHAVE_ESTADO)
}

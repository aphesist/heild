import { banco } from '@/nucleo/banco'
import { ID_HORIZONTE } from '@/nucleo/semente'
import type { IdConector } from './conectores'
import { conectoresArmazenamento, pastasSemCasamento, type ConectorArmazenamento } from './configuracoes'

/**
 * Provedores de armazenamento (01, 7.1; API-24; S09b): onde ficam os
 * arquivos do escritório. Nas nuvens e no servidor local, os bytes ficam no
 * armazenamento do escritório; a Heild guarda só o índice (nome, pasta,
 * impressão digital, quem enviou) e o texto extraído para os integrantes.
 * O armazenamento da plataforma é opcional, para quem não tem nuvem.
 */

export type TipoArmazenamento = ConectorArmazenamento['tipo']

/** Como o escritório conecta: OAuth (janela do provedor), credencial (endereço e chave) ou agente instalado no servidor. */
export type ModoArmazenamento = 'nativo' | 'oauth' | 'credencial' | 'agente'

export interface Provedor {
  tipo: TipoArmazenamento
  nome: string
  modo: ModoArmazenamento
  /** Quem mostra a janela de autorização (OAuth). */
  empresa?: string
  descricao: string
  /** Conector do contrato C9 que representa este provedor. */
  conector?: IdConector
  /** Onde os bytes ficam. */
  bytes: 'escritorio' | 'heild'
}

export const provedores: Provedor[] = [
  { tipo: 'google_drive', nome: 'Google Drive', modo: 'oauth', empresa: 'Google', descricao: 'Meu Drive ou Drive compartilhado (Google Workspace)', conector: 'google_drive', bytes: 'escritorio' },
  { tipo: 'onedrive_sharepoint', nome: 'OneDrive / SharePoint', modo: 'oauth', empresa: 'Microsoft', descricao: 'OneDrive for Business ou biblioteca do SharePoint (Microsoft 365)', conector: 'onedrive', bytes: 'escritorio' },
  { tipo: 'dropbox', nome: 'Dropbox', modo: 'oauth', empresa: 'Dropbox', descricao: 'Dropbox Business ou pessoal, inclusive pastas de equipe', conector: 'dropbox', bytes: 'escritorio' },
  { tipo: 'box', nome: 'Box', modo: 'oauth', empresa: 'Box', descricao: 'Box Business ou Enterprise', conector: 'box', bytes: 'escritorio' },
  { tipo: 'servidor_local', nome: 'Servidor local (agente Heild)', modo: 'agente', descricao: 'Servidor de arquivos do escritório, Windows ou Linux, com o agente instalado', conector: 'servidor_local', bytes: 'escritorio' },
  { tipo: 's3_compativel', nome: 'S3 compatível', modo: 'credencial', descricao: 'Amazon S3, Wasabi, Backblaze B2, MinIO', conector: 's3', bytes: 'escritorio' },
  { tipo: 'webdav', nome: 'WebDAV', modo: 'credencial', descricao: 'Nextcloud, ownCloud, NAS com WebDAV', bytes: 'escritorio' },
  { tipo: 'sftp', nome: 'SFTP', modo: 'credencial', descricao: 'Servidor com SFTP exposto à internet', bytes: 'escritorio' },
  { tipo: 'plataforma', nome: 'Armazenamento da plataforma', modo: 'nativo', descricao: 'Para quem não tem nuvem: os arquivos ficam na Heild', bytes: 'heild' },
]

export const provedorDe = (tipo: TipoArmazenamento) => provedores.find((p) => p.tipo === tipo) ?? provedores[0]

/* ---------- Agente do servidor local ---------- */

export type SistemaAgente = 'windows' | 'linux'

export interface AgenteLocal {
  id: string
  /** Nome do servidor (o agente informa ao parear). */
  dispositivo: string
  so: SistemaAgente
  versao: string
  online: boolean
  /** ISO da última sincronização. */
  ultima_sincronizacao: string
  /** Pastas compartilhadas escolhidas (caminhos no servidor). */
  pastas: string[]
  pareado_em: string
  pareado_por: string
  arquivos: number
  revogado_em?: string | null
  revogado_por?: string | null
}

export const CHAVE_AGENTES = 's09:arm:agentes'
export const VERSAO_AGENTE = '1.4.2'

/** Pastas que o agente encontra no servidor (o escritório escolhe quais compartilhar). */
export const pastasDoServidor: Record<SistemaAgente, string[]> = {
  windows: ['D:\\Clientes', 'D:\\Escritorio\\Administrativo', '\\\\SERVIDOR\\Contabil', '\\\\SERVIDOR\\Fiscal', '\\\\SERVIDOR\\DP', 'D:\\Backup (não compartilhar)'],
  linux: ['/srv/arquivos/clientes', '/srv/arquivos/escritorio', '/srv/samba/contabil', '/srv/samba/fiscal', '/srv/samba/dp'],
}

/** O Horizonte (piloto em implantação) já tem o servidor local pareado; o Andrade, não. */
export function agentesIniciais(): AgenteLocal[] {
  if (banco.escritorioId !== ID_HORIZONTE) return []
  return [
    {
      id: 'ag1',
      dispositivo: 'SRV-HORIZONTE',
      so: 'windows',
      versao: VERSAO_AGENTE,
      online: true,
      ultima_sincronizacao: new Date(Date.now() - 4 * 60_000).toISOString(),
      pastas: ['D:\\Clientes', '\\\\SERVIDOR\\Fiscal'],
      pareado_em: '2026-11-10T14:20:00.000Z',
      pareado_por: 'Paulo Reis',
      arquivos: 18440,
    },
  ]
}

/** Código de pareamento: vale 15 minutos e uma vez só. */
export function novoCodigoPareamento() {
  const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bloco = () => Array.from({ length: 4 }, () => letras[Math.floor(Math.random() * letras.length)]).join('')
  return `${bloco()}-${bloco()}`
}

/** Passo a passo para o administrador do Google Workspace liberar a Heild (Controles de API). */
export const passosWorkspace = [
  'Entre no Admin Console do Google (admin.google.com) com uma conta de administrador.',
  'Vá em Segurança › Controle de acesso e de dados › Controles de API.',
  'Em “Acesso de apps de terceiros”, clique em Gerenciar acesso de apps de terceiros › Configurar novo app.',
  'Procure pelo ID do cliente OAuth da Heild (copie abaixo) e selecione o app.',
  'Escolha a unidade organizacional do escritório (ou a organização inteira) e marque “Confiável”.',
  'Salve. A liberação costuma valer em poucos minutos; depois, volte aqui e verifique.',
]

export const ID_CLIENTE_OAUTH_HEILD = '418302557719-heild.apps.googleusercontent.com'

/** Onde ficam os documentos de cada escritório de exemplo: o Andrade na plataforma e no Drive antigo; o Horizonte (piloto) no servidor local. */
export function conectoresDoEscritorio(): ConectorArmazenamento[] {
  if (banco.escritorioId === ID_HORIZONTE)
    return [{ id: 'a-srv', nome: 'Servidor local · SRV-HORIZONTE', tipo: 'servidor_local', raiz: 'D:\\Clientes ; \\\\SERVIDOR\\Fiscal', padrao: true, situacao: 'ativo', sincronizacao: 'agente: alterações em tempo real', arquivos: 18440, agente_id: 'ag1' }]
  return conectoresArmazenamento
}

export const pastasSemCasamentoDoEscritorio = () => (banco.escritorioId === ID_HORIZONTE ? [{ pasta: 'D:\\Clientes\\Antigos 2019', sugestao: 'ignorar' }] : pastasSemCasamento)

import { banco } from '@/nucleo/banco'
import { ID_HORIZONTE } from '@/nucleo/semente'
import type { SetorIntegrante } from '@/theme/tipos'
import type { IdConector } from './conectores'

/**
 * Dados da aba Configurações › Conectores e cofre (S09-T09; 08, 2, 3, 5 e 10;
 * D-38). O estado vivo fica em `usePersistente` com as chaves `s09:*`; aqui
 * estão os tipos (com os nomes do 08) e o ponto de partida de cada escritório
 * de exemplo.
 */

/* ---------- Cofre (08, 3) ---------- */

export type TipoCredencial = 'ecnpj_escritorio' | 'a1_cliente' | 'procuracao_rfb' | 'procuracao_estadual' | 'token_api' | 'oauth' | 'chave_nuvem' | 'senha_portal'

export const rotuloTipoCredencial: Record<TipoCredencial, string> = {
  ecnpj_escritorio: 'e-CNPJ do escritório (A1)',
  a1_cliente: 'Certificado A1 de cliente',
  procuracao_rfb: 'Procuração RFB (e-CAC)',
  procuracao_estadual: 'Procuração estadual',
  token_api: 'Token de API',
  oauth: 'Acesso autorizado (OAuth)',
  chave_nuvem: 'Chave de nuvem',
  senha_portal: 'Login de portal (robô)',
}

export type SituacaoCredencial = 'ativa' | 'vencendo' | 'vencida' | 'revogada'

export interface Credencial {
  id: string
  tipo: TipoCredencial
  titular: string
  cliente_id?: string
  /** dd/mm/aaaa; sem validade para OAuth e token sem prazo. */
  validade?: string
  servicos: IdConector[]
  /** Referência no cofre (o segredo nunca vem para a tela). */
  ref: string
  impressao: string
  ultimo_uso: string
  usos_mes: number
  compartilhada_com: string[]
  /** Termo de compartilhamento assinado (auditoria mensal cobra quando falta). */
  termo: boolean
  rotacionada_em?: string
  situacao: SituacaoCredencial
  revogada_em?: string
}

/** Uso da credencial (eventos `credencial.usar`, 08, 3.2). */
export interface UsoCredencial {
  quando: string
  por: string
  servico: string
  cliente?: string
  resultado: 'ok' | 'erro'
}

const hoje = new Date()
const data = (dias: number) => {
  const d = new Date(hoje.getTime() + dias * 86_400_000)
  return d.toLocaleDateString('pt-BR')
}

/** Dias até a validade (negativo = vencida). */
export function diasAte(validade?: string) {
  if (!validade) return null
  const [d, m, a] = validade.split('/').map(Number)
  return Math.round((new Date(a, m - 1, d).getTime() - hoje.getTime()) / 86_400_000)
}

export function situacaoPelaValidade(c: Credencial): SituacaoCredencial {
  if (c.situacao === 'revogada') return 'revogada'
  const d = diasAte(c.validade)
  if (d === null) return 'ativa'
  return d < 0 ? 'vencida' : d <= 30 ? 'vencendo' : 'ativa'
}

export function credenciaisIniciais(): Credencial[] {
  if (banco.escritorioId === ID_HORIZONTE)
    return [
      { id: 'cr1', tipo: 'oauth', titular: 'Horizonte Contabilidade', validade: undefined, servicos: ['google_drive', 'email'], ref: 'cofre_h1', impressao: '3F2A:91B0:CC12:7E44', ultimo_uso: 'hoje 08:10', usos_mes: 412, compartilhada_com: [], termo: true, situacao: 'ativa' },
      { id: 'cr2', tipo: 'token_api', titular: 'Consulta CNPJ', servicos: ['cnpj'], ref: 'cofre_h2', impressao: '88A1:0B3C:5D6E:7F80', ultimo_uso: 'ontem', usos_mes: 9, compartilhada_com: [], termo: true, situacao: 'ativa' },
    ]
  return [
    { id: 'cr1', tipo: 'ecnpj_escritorio', titular: 'Contábil Andrade & Lima Ltda', validade: data(212), servicos: ['integra_contador', 'esocial', 'reinf', 'dfe', 'nfse_nacional', 'sefaz_sp'], ref: 'cofre_7a1', impressao: 'A1F3:22C9:0B7E:91D4', ultimo_uso: 'hoje 08:02', usos_mes: 3184, compartilhada_com: [], termo: true, rotacionada_em: '14/03/2026', situacao: 'ativa' },
    { id: 'cr2', tipo: 'procuracao_rfb', titular: 'Metalúrgica Andrade Ltda', cliente_id: 'c1', validade: data(340), servicos: ['integra_contador', 'ecac'], ref: 'cofre_7a2', impressao: 'B201:7AC3:55D2:0E19', ultimo_uso: 'hoje 07:40', usos_mes: 214, compartilhada_com: [], termo: true, situacao: 'ativa' },
    { id: 'cr3', tipo: 'a1_cliente', titular: 'Transportes Rota Sul S.A.', cliente_id: 'c5', validade: data(18), servicos: ['sefaz_sp', 'dfe'], ref: 'cofre_7a3', impressao: 'C0D4:19E2:44A0:7B31', ultimo_uso: 'hoje 06:55', usos_mes: 980, compartilhada_com: ['BPO Financeiro'], termo: false, situacao: 'ativa' },
    { id: 'cr4', tipo: 'procuracao_rfb', titular: 'Padaria Pão Quente ME', cliente_id: 'c2', validade: data(95), servicos: ['integra_contador'], ref: 'cofre_7a4', impressao: 'D9E1:2F00:7C1B:A532', ultimo_uso: 'ontem 18:20', usos_mes: 61, compartilhada_com: [], termo: true, situacao: 'ativa' },
    { id: 'cr5', tipo: 'senha_portal', titular: 'Prefeitura de São Paulo', servicos: ['prefeitura_sp'], ref: 'cofre_7a5', impressao: 'E5A2:0019:BB3C:4D77', ultimo_uso: 'há 30 h (recusada)', usos_mes: 40, compartilhada_com: [], termo: true, rotacionada_em: '02/01/2026', situacao: 'ativa' },
    { id: 'cr6', tipo: 'token_api', titular: 'Agregador Open Finance', servicos: ['open_finance'], ref: 'cofre_7a6', impressao: 'F310:6B2D:9E8C:1A04', ultimo_uso: 'hoje 08:15', usos_mes: 1290, compartilhada_com: ['BPO Financeiro'], termo: true, rotacionada_em: '20/12/2025', situacao: 'ativa' },
    { id: 'cr7', tipo: 'oauth', titular: 'Google Workspace do escritório', servicos: ['google_drive', 'drive_antigo', 'email'], ref: 'cofre_7a7', impressao: '07B9:A3C1:2E5D:9F60', ultimo_uso: 'agora', usos_mes: 8420, compartilhada_com: [], termo: true, situacao: 'ativa' },
    { id: 'cr8', tipo: 'chave_nuvem', titular: 'Arquivo morto (S3)', servicos: ['s3'], ref: 'cofre_7a8', impressao: '1C4E:8D20:F7A3:6B19', ultimo_uso: 'há 1 dia', usos_mes: 30, compartilhada_com: [], termo: true, rotacionada_em: '01/06/2025', situacao: 'ativa' },
    { id: 'cr9', tipo: 'a1_cliente', titular: 'Café Central ME', cliente_id: 'c7', validade: data(-6), servicos: ['nfse_nacional'], ref: 'cofre_7a9', impressao: '2A9F:0C3B:71E4:D852', ultimo_uso: 'há 6 dias', usos_mes: 0, compartilhada_com: [], termo: true, situacao: 'ativa' },
    { id: 'cr10', tipo: 'token_api', titular: 'Omie (BPO da Loja Bela Vista)', cliente_id: 'c3', servicos: ['omie'], ref: 'cofre_7b0', impressao: '3B0E:5D61:A2F8:0C97', ultimo_uso: 'há 120 dias', usos_mes: 0, compartilhada_com: ['BPO Financeiro'], termo: true, situacao: 'ativa' },
  ]
}

export function usosDe(c: Credencial): UsoCredencial[] {
  const servico = c.servicos[0] ?? 'cofre'
  const quem = ['Fiscal (integrante)', 'DP (integrante)', 'Contábil (integrante)', 'Fernanda Lima', 'Notas (integrante)']
  return Array.from({ length: Math.min(8, Math.max(1, Math.round(c.usos_mes / 100))) }, (_, i) => ({
    quando: i === 0 ? c.ultimo_uso : `${String(13 - i).padStart(2, '0')}/11 ${String(7 + (i % 10)).padStart(2, '0')}:${String((i * 17) % 60).padStart(2, '0')}`,
    por: quem[i % quem.length],
    servico,
    cliente: c.cliente_id ? undefined : ['Metalúrgica Andrade Ltda', 'Padaria Pão Quente ME', 'Transportes Rota Sul S.A.'][i % 3],
    resultado: c.ultimo_uso.includes('recusada') && i === 0 ? 'erro' : 'ok',
  }))
}

/* ---------- Saúde das rotinas (D-38) ---------- */

export type SituacaoRotina = 'ok' | 'atrasada' | 'parada' | 'erro'

export interface Rotina {
  id: string
  nome: string
  setor: SetorIntegrante
  conector: IdConector
  frequencia: string
  ultima_execucao: string
  proxima: string
  fila: number
  erros: number
  situacao: SituacaoRotina
  arquivos_com_erro: string[]
}

export function rotinasIniciais(): Rotina[] {
  if (banco.escritorioId === ID_HORIZONTE)
    return [
      { id: 'r1', nome: 'Ler e-mails e anexos', setor: 'gestao_atendimento', conector: 'email', frequencia: 'a cada 5 min', ultima_execucao: 'há 3 min', proxima: 'em 2 min', fila: 0, erros: 0, situacao: 'ok', arquivos_com_erro: [] },
      { id: 'r2', nome: 'Espelhar o Drive', setor: 'geral', conector: 'google_drive', frequencia: 'contínuo', ultima_execucao: 'há 1 min', proxima: 'contínuo', fila: 0, erros: 0, situacao: 'ok', arquivos_com_erro: [] },
    ]
  return [
    { id: 'r1', nome: 'Caixas postais federais (DTE)', setor: 'fiscal', conector: 'integra_contador', frequencia: 'diária, 06:00', ultima_execucao: 'hoje 06:00', proxima: 'amanhã 06:00', fila: 3, erros: 0, situacao: 'ok', arquivos_com_erro: [] },
    { id: 'r2', nome: 'Baixar NF-e recebidas (DF-e)', setor: 'notas', conector: 'dfe', frequencia: 'a cada hora', ultima_execucao: 'há 40 min', proxima: 'em 20 min', fila: 12, erros: 0, situacao: 'ok', arquivos_com_erro: [] },
    { id: 'r3', nome: 'Guias de ISS na Prefeitura de SP', setor: 'fiscal', conector: 'prefeitura_sp', frequencia: 'diária, 07:00', ultima_execucao: 'há 30 h', proxima: 'parada', fila: 6, erros: 6, situacao: 'parada', arquivos_com_erro: ['ISS 10-2026 Metalúrgica Andrade', 'ISS 10-2026 Clínica Sorriso', 'Livro fiscal 10-2026 Rota Sul'] },
    { id: 'r4', nome: 'Certidões do mês (PER/DCOMP e e-CAC)', setor: 'fiscal', conector: 'ecac', frequencia: 'semanal', ultima_execucao: 'há 5 h', proxima: 'aguardando CAPTCHA', fila: 2, erros: 1, situacao: 'atrasada', arquivos_com_erro: ['Situação fiscal Café Central'] },
    { id: 'r5', nome: 'Extratos dos clientes (Open Finance)', setor: 'contabil', conector: 'open_finance', frequencia: 'diária, 05:30', ultima_execucao: 'hoje 05:30', proxima: 'amanhã 05:30', fila: 2, erros: 0, situacao: 'ok', arquivos_com_erro: [] },
    { id: 'r6', nome: 'Eventos do eSocial', setor: 'dp', conector: 'esocial', frequencia: 'a cada 2 h', ultima_execucao: 'há 2 h', proxima: 'agora', fila: 0, erros: 0, situacao: 'ok', arquivos_com_erro: [] },
    { id: 'r7', nome: 'Sincronizar Omie (BPO)', setor: 'bpo_financeiro', conector: 'omie', frequencia: 'a cada hora', ultima_execucao: 'há 3 h', proxima: 'limite volta 00:00', fila: 9, erros: 2, situacao: 'erro', arquivos_com_erro: ['Contas a pagar Loja Bela Vista', 'Conciliação Padaria Pão Quente'] },
    { id: 'r8', nome: 'Ler e-mails e anexos do escritório', setor: 'gestao_atendimento', conector: 'email', frequencia: 'a cada 5 min', ultima_execucao: 'há 2 min', proxima: 'em 3 min', fila: 0, erros: 0, situacao: 'ok', arquivos_com_erro: [] },
    { id: 'r9', nome: 'Lançamentos do Alterdata', setor: 'contabil', conector: 'alterdata', frequencia: 'diária, 22:00', ultima_execucao: 'ontem 22:00', proxima: 'hoje 22:00', fila: 0, erros: 0, situacao: 'ok', arquivos_com_erro: [] },
  ]
}

/* ---------- Custo do mês e teto (08, 10) ---------- */

export interface CustoConector {
  conector: IdConector
  consultas: number
  /** Em reais, no mês. */
  valor: number
}

export function custosIniciais(): CustoConector[] {
  if (banco.escritorioId === ID_HORIZONTE) return [{ conector: 'cnpj', consultas: 9, valor: 0.45 }]
  return [
    { conector: 'integra_contador', consultas: 2140, valor: 342.4 },
    { conector: 'certidoes', consultas: 186, valor: 74.4 },
    { conector: 'dte_estadual', consultas: 620, valor: 99.2 },
    { conector: 'cnpj', consultas: 88, valor: 4.4 },
    { conector: 'open_finance', consultas: 1290, valor: 129 },
    { conector: 'cobranca', consultas: 312, valor: 62.4 },
    { conector: 'assinatura', consultas: 14, valor: 42 },
    { conector: 's3', consultas: 30, valor: 18.9 },
    { conector: 'whatsapp', consultas: 2810, valor: 196.7 },
  ]
}

/** Custo por cliente (os que mais consomem). */
export function custoPorCliente(): { cliente: string; valor: number }[] {
  if (banco.escritorioId === ID_HORIZONTE) return []
  return [
    { cliente: 'Transportes Rota Sul S.A.', valor: 168.3 },
    { cliente: 'Metalúrgica Andrade Ltda', valor: 141.9 },
    { cliente: 'Padaria Pão Quente ME', valor: 77.2 },
    { cliente: 'Clínica Sorriso Ltda', valor: 64.8 },
    { cliente: 'Café Central ME', valor: 41.5 },
  ]
}

export const tetoInicial = () => (banco.escritorioId === ID_HORIZONTE ? 150 : 1200)

/* ---------- Cobertura por cliente (08, 5.1 e 5.5) ---------- */

export type Caminho = 'api' | 'robo' | 'assistido' | 'falta'

export const rotuloCaminho: Record<Caminho, string> = { api: 'API', robo: 'robô', assistido: 'assistido', falta: 'falta' }

export interface Cobertura {
  cliente_id: string
  uf: string
  municipio: string
  /** Documento → caminho de captura e o que falta. */
  itens: { doc: string; caminho: Caminho; falta?: string }[]
}

const linha = (uf: string, municipio: string, falta: Partial<Record<string, string>> = {}, robo: string[] = []): Omit<Cobertura, 'cliente_id'> => ({
  uf,
  municipio,
  itens: ['Caixa postal federal', 'Guias federais', 'NF-e recebidas', 'NFS-e', 'Caixa postal estadual', 'ISS e livro municipal'].map((doc) => ({
    doc,
    caminho: falta[doc] ? 'falta' : robo.includes(doc) ? 'robo' : doc === 'Caixa postal estadual' ? 'robo' : 'api',
    ...(falta[doc] ? { falta: falta[doc] } : {}),
  })),
})

export function coberturaDe(clienteId: string, regime: string): Cobertura {
  const tab: Record<string, Omit<Cobertura, 'cliente_id'>> = {
    c1: linha('SP', 'São Paulo', { 'ISS e livro municipal': 'login da prefeitura recusado' }),
    c2: linha('SP', 'Campinas', {}, ['ISS e livro municipal']),
    c3: linha('SP', 'Santo André', { 'NFS-e': 'certificado A1 do cliente' }, ['ISS e livro municipal']),
    c4: linha('SP', 'São Paulo', { 'Caixa postal federal': 'procuração RFB pendente', 'Guias federais': 'procuração RFB pendente' }),
    c5: linha('PR', 'Curitiba', {}, ['Caixa postal estadual', 'ISS e livro municipal']),
    c7: linha('SP', 'São Paulo', { 'NFS-e': 'certificado A1 vencido' }),
  }
  const base = tab[clienteId] ?? linha('SP', 'São Paulo', {}, ['ISS e livro municipal'])
  if (regime === 'Pessoa física') return { cliente_id: clienteId, uf: 'SP', municipio: 'São Paulo', itens: [{ doc: 'Caixa postal federal', caminho: 'api' }, { doc: 'Carnê-leão e IRPF', caminho: 'assistido' }] }
  return { cliente_id: clienteId, ...base }
}

/* ---------- Auditoria mensal (08, 3.3) ---------- */

export interface AchadoAuditoria {
  id: string
  tipo: 'sem_uso' | 'vencendo' | 'sem_termo' | 'sem_rotacao'
  credencial: string
  texto: string
}

export function auditoria(creds: Credencial[]): AchadoAuditoria[] {
  const r: AchadoAuditoria[] = []
  for (const c of creds) {
    if (c.situacao === 'revogada') continue
    const sit = situacaoPelaValidade(c)
    if (/há (9\d|1\d\d) dias/.test(c.ultimo_uso) || (c.usos_mes === 0 && !c.validade)) r.push({ id: `${c.id}-uso`, tipo: 'sem_uso', credencial: c.id, texto: `${c.titular}: sem uso há mais de 90 dias` })
    if (sit === 'vencendo' || sit === 'vencida') r.push({ id: `${c.id}-val`, tipo: 'vencendo', credencial: c.id, texto: `${c.titular}: ${sit === 'vencida' ? 'vencida' : `vence em ${diasAte(c.validade)} dias`}` })
    if (c.compartilhada_com.length && !c.termo) r.push({ id: `${c.id}-termo`, tipo: 'sem_termo', credencial: c.id, texto: `${c.titular}: compartilhada com ${c.compartilhada_com.join(', ')} sem termo assinado` })
    if ((c.tipo === 'token_api' || c.tipo === 'chave_nuvem' || c.tipo === 'senha_portal') && c.rotacionada_em && Number(c.rotacionada_em.slice(-4)) < hoje.getFullYear()) r.push({ id: `${c.id}-rot`, tipo: 'sem_rotacao', credencial: c.id, texto: `${c.titular}: segredo sem rotação desde ${c.rotacionada_em}` })
  }
  return r
}

import { colecao, type RegistroS02 } from '@/dados/s02/colecao'
import { societarioDe } from '@/dados/painel-abas'
import * as exemplo from '@/dados/exemplo'
import { fichas } from '@/ambiente/clientes'

/**
 * Dados do Societário que ainda não têm entidade no banco, no formato das
 * entidades do plano (01, 4; 08, 3): acesso a órgão e procuração, credencial
 * (certificado: nunca o arquivo nem a senha), processo de legalização, licença
 * e renovação (C2-20 a C2-22), comunicação oficial (Domicílio Judicial),
 * acesso ao app do cliente (Conta de cliente) e contrato. Semente a partir dos
 * dados de exemplo de cada cliente (`societarioDe`).
 */

const iso = (ddmmaaaa: string) => {
  const m = ddmmaaaa.match(/(\d{2})\/(\d{2})\/(\d{4})/)
  return m ? `${m[3]}-${m[2]}-${m[1]}` : ddmmaaaa
}
const clientesPainel = () => exemplo.clientes.filter((c) => !c.servicos || c.servicos.includes('contabil'))

/* ---------- Acessos e procurações (SOC-011 a 014, PF-002) ---------- */

export interface AcessoOrgao extends RegistroS02 {
  cliente_id: string
  orgao: string
  servico: string
  validade: string
  situacao: 'confirmada' | 'pedida' | 'vencida' | 'pendente'
  /** Procuração fora da RFB (prefeitura, SEFAZ, DET...). */
  fora_rfb?: boolean
  pedida_em?: string
  cobrancas?: number
}
export const acessosSemente = (): AcessoOrgao[] =>
  clientesPainel().flatMap((c) =>
    societarioDe(c.id).acessos.map((a, i) => ({
      id: `ac-${c.id}-${i}`,
      cliente_id: c.id,
      orgao: a.orgao,
      servico: a.servico,
      validade: a.validade,
      situacao: a.situacao === 'ok' ? 'confirmada' : a.validade.includes('pedid') || a.validade === 'pendente' ? 'pedida' : 'pendente',
      fora_rfb: a.orgao !== 'e-CAC',
      pedida_em: a.situacao === 'ok' ? undefined : '2026-11-12',
      cobrancas: a.situacao === 'ok' ? 0 : 2,
    })),
  )
export const colAcessos = colecao<AcessoOrgao>('acessos', acessosSemente)

/* ---------- Certificados (SOC-008 a 010, GES-058) ---------- */

export interface Credencial extends RegistroS02 {
  cliente_id: string
  tipo: 'e-CNPJ A1' | 'e-CNPJ A3' | 'e-CPF A3' | 'e-CPF A1'
  titular: string
  validade: string
  servicos: string[]
  situacao: 'valido' | 'pedido_ao_cliente' | 'vencido'
  /** Trilha de uso: quem usou, para quê e quando (nunca o arquivo). */
  trilha: { quando: string; quem: string; uso: string }[]
  /** A3: só registro, sem arquivo (fica com o cliente). */
  sem_arquivo?: boolean
}
export const credenciaisSemente = (): Credencial[] =>
  clientesPainel().flatMap((c) =>
    societarioDe(c.id).certificados.map((x, i) => ({
      id: `cr-${c.id}-${i}`,
      cliente_id: c.id,
      tipo: x.tipo as Credencial['tipo'],
      titular: x.titular,
      validade: iso(x.validade),
      servicos: x.usos.split(',').map((s) => s.trim()),
      situacao: 'valido',
      sem_arquivo: x.tipo.includes('A3'),
      trilha: [
        { quando: '2026-11-17T06:10:00', quem: 'Fiscal (integrante)', uso: 'consulta da situação fiscal no e-CAC' },
        { quando: '2026-11-14T03:12:00', quem: 'Notas (integrante)', uso: 'captura de NF-e por NSU' },
      ],
    })),
  )
export const colCredenciais = colecao<Credencial>('credenciais', credenciaisSemente)

/* ---------- Legalização e processos (SOC-025 a 043; C2-20 a C2-22) ---------- */

export interface Processo extends RegistroS02 {
  cliente_id: string
  orgao: string
  tipo: 'abertura' | 'alteração' | 'baixa' | 'licença' | 'fiscalização' | 'renovação' | 'regularização' | 'implantação'
  titulo: string
  uf: string
  etapa: string
  situacao: 'andamento' | 'exigencia' | 'concluido' | 'protocolado'
  prazo?: string
  checklist: { item: string; feito: boolean }[]
  andamentos: { quando: string; texto: string; por: string }[]
  tarefa_id?: string
}

/** Checklist por tipo e órgão (SOC-025 a 033; por UF onde muda). */
export function checklistPadrao(tipo: Processo['tipo'], uf: string): string[] {
  const junta = uf === 'SP' ? 'JUCESP' : uf === 'RS' ? 'JucisRS' : `Junta Comercial de ${uf}`
  switch (tipo) {
    case 'abertura':
      return ['Consulta de viabilidade na prefeitura', `DBE na Receita e protocolo na ${junta}`, 'Contrato social assinado pelos sócios', 'Inscrição estadual', 'Inscrição municipal e alvará', 'Bombeiros (AVCB/CLCB) se exigido']
    case 'alteração':
      return ['Minuta da alteração contratual', 'Assinatura dos sócios', `Protocolo na ${junta}`, 'Atualizar CNPJ (DBE)', 'Atualizar inscrições estadual e municipal']
    case 'baixa':
      return ['Conferir obrigações remanescentes', 'Distrato assinado', `Protocolo na ${junta}`, 'Baixa no CNPJ', 'Baixa das inscrições', 'Guardar o dossiê de saída']
    case 'licença':
    case 'renovação':
      return ['Separar documentos da licença anterior', 'Pagar a taxa (guia na central do Fiscal)', 'Protocolar no órgão', 'Acompanhar vistoria', 'Guardar a licença nova com validade']
    case 'fiscalização':
      return ['Ler o auto ou a notificação', 'Separar documentos pedidos', 'Responder no prazo', 'Registrar o resultado']
    default:
      return ['Levantar pendências herdadas', 'Pedir documentos ao cliente', 'Protocolar', 'Acompanhar até concluir']
  }
}

export const processosSemente = (): Processo[] => {
  const lista: Processo[] = clientesPainel().flatMap((c) =>
    societarioDe(c.id).processos.map((p, i) => {
      const tipo: Processo['tipo'] = /alteração/i.test(p.processo) ? 'alteração' : /alvará|licen/i.test(p.processo) ? 'licença' : /AVCB/i.test(p.processo) ? 'renovação' : /inapt|regulariz/i.test(p.processo) ? 'regularização' : 'implantação'
      const itens = checklistPadrao(tipo, 'SP')
      return {
        id: `pr-${c.id}-${i}`,
        cliente_id: c.id,
        orgao: p.orgao,
        tipo,
        titulo: p.processo,
        uf: 'SP',
        etapa: p.etapa,
        situacao: p.situacao === 'atencao' ? (/exig/.test(p.etapa) ? 'exigencia' : 'andamento') : p.situacao === 'ok' ? 'concluido' : 'protocolado',
        prazo: p.prazo,
        checklist: itens.map((item, k) => ({ item, feito: k < Math.ceil(itens.length / 2) })),
        andamentos: [{ quando: '2026-11-10T10:00:00', texto: p.etapa, por: 'Societário (integrante)' }],
        tarefa_id: c.id === 'c1' && i === 0 ? 't18' : undefined,
      }
    }),
  )
  return lista
}
export const colProcessos = colecao<Processo>('processos', processosSemente)

/** Licenças e renovações com validade (C2-20 conselhos, C2-22 taxa municipal; SOC-036 a 040). */
export interface Licenca extends RegistroS02 {
  cliente_id: string
  nome: string
  orgao: string
  validade: string
  tipo: 'alvará' | 'AVCB' | 'conselho' | 'sanitária' | 'taxa municipal'
}
export const licencasSemente = (): Licenca[] => [
  { id: 'li-c1-avcb', cliente_id: 'c1', nome: 'AVCB da matriz', orgao: 'Corpo de Bombeiros SP', validade: '2027-03-15', tipo: 'AVCB' },
  { id: 'li-c1-alvara', cliente_id: 'c1', nome: 'Alvará de funcionamento (matriz)', orgao: 'Prefeitura de São Paulo', validade: '2026-12-31', tipo: 'alvará' },
  { id: 'li-c4-cro', cliente_id: 'c4', nome: 'Inscrição da clínica no CRO-SP', orgao: 'CRO-SP', validade: '2026-12-31', tipo: 'conselho' },
  { id: 'li-c4-vigilancia', cliente_id: 'c4', nome: 'Licença da Vigilância Sanitária', orgao: 'Vigilância Sanitária municipal', validade: '2027-02-28', tipo: 'sanitária' },
  { id: 'li-c7-alvara', cliente_id: 'c7', nome: 'Alvará de funcionamento', orgao: 'Prefeitura de São Paulo', validade: '2026-12-10', tipo: 'alvará' },
  { id: 'li-c2-vigilancia', cliente_id: 'c2', nome: 'Licença da Vigilância Sanitária', orgao: 'Vigilância Sanitária municipal', validade: '2027-06-30', tipo: 'sanitária' },
]
export const colLicencas = colecao<Licenca>('licencas', licencasSemente)

/* ---------- Comunicações oficiais: Domicílio Judicial (SOC-007, 046) ---------- */

export interface ComunicacaoOficial extends RegistroS02 {
  cliente_id: string
  tipo: 'citação' | 'intimação' | 'comunicação'
  tribunal: string
  processo: string
  disponivel_em: string
  prazo_ciencia: string
  /** Abrir o teor conta como ciência: quem abriu e quando. */
  aberta_em?: string
  aberta_por?: string
}
export const comunicacoesSemente = (): ComunicacaoOficial[] => [
  { id: 'dj-c1-1', cliente_id: 'c1', tipo: 'intimação', tribunal: 'TRT da 2ª Região', processo: '1001234-55.2026.5.02.0381', disponivel_em: '2026-11-13', prazo_ciencia: '2026-11-23' },
  { id: 'dj-c5-1', cliente_id: 'c5', tipo: 'citação', tribunal: 'TJRS', processo: '5009876-12.2026.8.21.0001', disponivel_em: '2026-11-16', prazo_ciencia: '2026-11-26' },
]
export const colComunicacoes = colecao<ComunicacaoOficial>('comunicacoes', comunicacoesSemente)

/** Cadastro no Domicílio Judicial (SOC-007): última leitura por cliente. */
export const cadastroDomicilio: Record<string, { cadastrado: boolean; ultima_leitura: string }> = {
  c1: { cadastrado: true, ultima_leitura: 'hoje 06:00' },
  c2: { cadastrado: true, ultima_leitura: 'hoje 06:00' },
  c3: { cadastrado: true, ultima_leitura: 'hoje 06:00' },
  c4: { cadastrado: false, ultima_leitura: '—' },
  c5: { cadastrado: true, ultima_leitura: 'hoje 06:00' },
  c7: { cadastrado: true, ultima_leitura: 'hoje 06:00' },
}

/* ---------- App do cliente (GES-041, 104; 06, 2) ---------- */

export interface AcessoApp extends RegistroS02 {
  cliente_id: string
  pessoa: string
  /** Papel por serviço contratado (06, 2.4). */
  papeis: { contabil?: string; bpo_financeiro?: string }
  situacao: 'convite_pendente' | 'ativo' | 'revogado'
  instalado?: boolean
  ultimo_acesso?: string
  convidado_em?: string
  revogado_por?: string
}
export const appSemente = (): AcessoApp[] =>
  clientesPainel().flatMap((c) =>
    (fichas[c.id]?.contatos ?? []).map((x, i) => {
      const socio = x.papel.startsWith('sóci') || x.papel === 'titular'
      const bpo = c.servicos?.includes('bpo')
      return {
        id: `app-${c.id}-${i}`,
        cliente_id: c.id,
        pessoa: x.nome,
        papeis: { contabil: socio ? 'sócio (vê tudo)' : x.papel === 'RH' ? 'RH (holerites e folha)' : 'financeiro (guias)', ...(bpo ? { bpo_financeiro: socio ? 'aprovador de pagamentos' : 'envia documentos' } : {}) },
        situacao: x.app ? 'ativo' : 'convite_pendente',
        instalado: !!x.app,
        ultimo_acesso: x.app ? (i === 0 ? 'hoje 08:12' : 'há 3 dias') : undefined,
        convidado_em: x.app ? undefined : '2026-11-11',
      }
    }),
  )
export const colApp = colecao<AcessoApp>('app-acessos', appSemente)

/* ---------- Contrato e honorários (SOC-015, 016, 019, 020, 101) ---------- */

export interface ContratoCliente extends RegistroS02 {
  cliente_id: string
  proposta: 'rascunho' | 'enviada' | 'aceita' | '—'
  contrato: 'rascunho' | 'enviado para assinatura' | 'assinado' | 'sem contrato'
  lgpd: 'assinado' | 'pendente'
  pld: 'feito' | 'pendente'
  envelope?: string
}
export const contratosSemente = (): ContratoCliente[] =>
  clientesPainel().map((c) => {
    const d = societarioDe(c.id).contrato
    return { id: `ct-${c.id}`, cliente_id: c.id, proposta: d.proposta.startsWith('aceita') ? 'aceita' : '—', contrato: d.contrato === 'assinado' ? 'assinado' : 'sem contrato', lgpd: d.lgpd === 'assinado' ? 'assinado' : 'pendente', pld: c.id === 'c4' ? 'pendente' : 'feito' }
  })
export const colContratos = colecao<ContratoCliente>('contratos', contratosSemente)

/* ---------- Arquivos repetidos (D-05, como ideia) ---------- */

export interface Repetido extends RegistroS02 {
  cliente_id: string
  arquivos: [string, string]
  hash: string
  resolvido?: string
}
export const repetidosSemente = (): Repetido[] => [{ id: 'rp-c1', cliente_id: 'c1', arquivos: ['Contrato social consolidado.pdf', 'contrato social consolidado (1).pdf'], hash: '9f3c2a1' }]
export const colRepetidos = colecao<Repetido>('repetidos', repetidosSemente)

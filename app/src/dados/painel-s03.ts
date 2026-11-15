// S03: dados das abas Fiscal, Contábil e Consultoria por cliente (Painel B).
import type { Cliente } from './tipos'
import { comCenarioPor } from '@/nucleo/semente/cenario'

/**
 * Cada cliente tem os próprios números: os clientes do escritório de exemplo
 * têm um perfil escrito à mão (coerente com o resto da demonstração) e
 * qualquer outro cliente (o escritório Horizonte, um cliente novo) ganha um
 * perfil gerado de forma estável a partir do id, para nunca repetir os
 * números da Metalúrgica Andrade. Tudo é fictício.
 *
 * O que muda com o uso (mensagem aberta, guia paga, conferência aprovada,
 * regra adotada) não fica aqui: fica no estado da tela (`telas/painel/s03/estado.ts`).
 */

export const HOJE = '2026-11-18'
export const COMPETENCIA = '10/2026'

/* ---------- utilidades ---------- */

function hash(s: string) {
  let h = 2166136261
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0
  return h
}

/** Gerador estável: o mesmo cliente dá sempre os mesmos números. */
export function sorteio(seed: string) {
  let a = hash(seed)
  const r = () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  return {
    r,
    entre: (min: number, max: number) => Math.round(min + r() * (max - min)),
    um: <T>(xs: T[]) => xs[Math.floor(r() * xs.length)],
    chance: (p: number) => r() < p,
  }
}

export const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
export const brl0 = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
export const pct = (v: number, casas = 1) => `${(v * 100).toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })}%`
export const ddmm = (iso?: string) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}` : '—')
export const ddmmaaaa = (iso?: string) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}` : '—')
export function somarDias(iso: string, dias: number) {
  const d = new Date(`${iso}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + dias)
  return d.toISOString().slice(0, 10)
}
export function diasAte(iso: string, de = HOJE) {
  return Math.round((Date.parse(`${iso}T12:00:00Z`) - Date.parse(`${de}T12:00:00Z`)) / 86_400_000)
}
export const protocoloDe = (seed: string) => String(hash(seed)).padStart(10, '0').slice(0, 10)

/* ---------- perfil do cliente ---------- */

export type TipoFiscal = 'simples' | 'mei' | 'presumido' | 'real' | 'pf'
export type Atividade = 'comercio' | 'industria' | 'servico' | 'transporte' | 'saude'

export const tipoDoRegime = (regime: Cliente['regime']): TipoFiscal =>
  regime === 'Simples Nacional' ? 'simples' : regime === 'MEI' ? 'mei' : regime === 'Lucro Presumido' ? 'presumido' : regime === 'Lucro Real' ? 'real' : 'pf'

export interface Socio {
  nome: string
  /** CPF como aparece no extrato (inteiro, mascarado ou só o nome: D-11). */
  cpf: string
  proLabore: number
}

export interface PerfilS03 {
  id: string
  nome: string
  tipo: TipoFiscal
  atividade: Atividade
  uf: string
  municipio: string
  /** Receita média mensal dos últimos 12 meses. */
  receitaMensal: number
  folhaMensal: number
  empregados: number
  bancos: string[]
  socios: Socio[]
  analista: string
  /** CNAE de saúde: DMED no calendário (C2-16). */
  saude: boolean
  /** Chamado pelo IBGE para pesquisa anual (C2-15). */
  ibge: boolean
  implantacao: boolean
}

const curados: Record<string, Omit<PerfilS03, 'id' | 'nome'>> = {
  c1: { tipo: 'presumido', atividade: 'industria', uf: 'SP', municipio: 'São Paulo', receitaMensal: 1_284_000, folhaMensal: 214_000, empregados: 38, bancos: ['Itaú', 'Banco do Brasil', 'Inter'], socios: [{ nome: 'Marcos Andrade', cpf: '***.482.118-**', proLabore: 18_000 }, { nome: 'Helena Andrade', cpf: '271.903.448-07', proLabore: 12_000 }], analista: 'João Pereira', saude: false, ibge: true, implantacao: false },
  c2: { tipo: 'simples', atividade: 'comercio', uf: 'SP', municipio: 'São Paulo', receitaMensal: 93_300, folhaMensal: 26_400, empregados: 8, bancos: ['Bradesco', 'Sicoob'], socios: [{ nome: 'João Batista', cpf: '318.774.052-91', proLabore: 4_500 }], analista: 'João Pereira', saude: false, ibge: false, implantacao: false },
  c3: { tipo: 'simples', atividade: 'comercio', uf: 'SP', municipio: 'Campinas', receitaMensal: 206_700, folhaMensal: 31_200, empregados: 6, bancos: ['Santander', 'Nubank'], socios: [{ nome: 'Sérgio Prates', cpf: 'SERGIO PRATES', proLabore: 6_000 }], analista: 'Fernanda Lima', saude: false, ibge: true, implantacao: false },
  c4: { tipo: 'presumido', atividade: 'saude', uf: 'SP', municipio: 'São Paulo', receitaMensal: 142_500, folhaMensal: 38_900, empregados: 9, bancos: ['Itaú', 'Caixa'], socios: [{ nome: 'Lívia Mendes', cpf: '***.115.670-**', proLabore: 9_000 }, { nome: 'Rafael Mendes', cpf: '402.611.938-50', proLabore: 7_500 }], analista: 'Fernanda Lima', saude: true, ibge: false, implantacao: true },
  c5: { tipo: 'real', atividade: 'transporte', uf: 'RS', municipio: 'Porto Alegre', receitaMensal: 4_870_000, folhaMensal: 1_120_000, empregados: 212, bancos: ['Banco do Brasil', 'Itaú', 'Bradesco', 'Safra'], socios: [{ nome: 'Otávio Rocha', cpf: '***.300.217-**', proLabore: 42_000 }, { nome: 'Sandra Rocha', cpf: '190.554.307-12', proLabore: 35_000 }], analista: 'João Pereira', saude: false, ibge: true, implantacao: false },
  c6: { tipo: 'pf', atividade: 'servico', uf: 'SP', municipio: 'São Paulo', receitaMensal: 14_800, folhaMensal: 0, empregados: 0, bancos: ['Itaú'], socios: [{ nome: 'Carlos Menezes', cpf: '123.456.789-00', proLabore: 0 }], analista: 'Fernanda Lima', saude: false, ibge: false, implantacao: false },
  c7: { tipo: 'simples', atividade: 'servico', uf: 'SP', municipio: 'São Paulo', receitaMensal: 23_200, folhaMensal: 7_100, empregados: 2, bancos: ['Sicoob'], socios: [{ nome: 'João Batista', cpf: '318.774.052-91', proLabore: 2_000 }], analista: 'João Pereira', saude: false, ibge: false, implantacao: false },
  'c-s03-mei': { tipo: 'mei', atividade: 'servico', uf: 'SP', municipio: 'Osasco', receitaMensal: 5_950, folhaMensal: 1_518, empregados: 1, bancos: ['Nubank'], socios: [{ nome: 'Simone Araújo', cpf: '455.120.338-04', proLabore: 0 }], analista: 'Fernanda Lima', saude: false, ibge: false, implantacao: false },
}

const nomesSocios = ['Ricardo', 'Patrícia', 'Fábio', 'Luciana', 'Gustavo', 'Mariana', 'Eduardo', 'Camila', 'Rodrigo', 'Beatriz']
const sobrenomes = ['Ponte', 'Duarte', 'Lacerda', 'Moreira', 'Teixeira', 'Barros', 'Nogueira', 'Pacheco']
const bancosPossiveis = ['Itaú', 'Bradesco', 'Banco do Brasil', 'Santander', 'Caixa', 'Sicredi', 'Inter', 'Nubank', 'C6']

/** Perfil fiscal e contábil do cliente (escrito à mão para os de exemplo; estável para os demais). */
export function perfilS03(c: Pick<Cliente, 'id' | 'nome' | 'regime'>): PerfilS03 {
  const tipo = tipoDoRegime(c.regime)
  const base = curados[c.id]
  if (base && base.tipo === tipo) return { id: c.id, nome: c.nome, ...base }
  const s = sorteio(c.id + c.nome)
  const atividade: Atividade = tipo === 'pf' ? 'servico' : /farm|clín|odont|saúde|médic/i.test(c.nome) ? 'saude' : /oficina|mecân|transp/i.test(c.nome) ? 'servico' : s.um(['comercio', 'servico', 'industria'] as Atividade[])
  const receitaMensal =
    tipo === 'mei' ? s.entre(3_000, 6_500) : tipo === 'simples' ? s.entre(18_000, 260_000) : tipo === 'presumido' ? s.entre(120_000, 1_400_000) : tipo === 'real' ? s.entre(2_000_000, 9_000_000) : s.entre(8_000, 38_000)
  const empregados = tipo === 'pf' ? 0 : tipo === 'mei' ? s.entre(0, 1) : Math.max(1, Math.round(receitaMensal / s.entre(9_000, 22_000)))
  const nSocios = tipo === 'pf' || tipo === 'mei' ? 1 : s.entre(1, 3)
  const sobrenome = c.nome.split(' ').length <= 3 && tipo === 'pf' ? c.nome.split(' ').slice(-1)[0] : s.um(sobrenomes)
  const socios: Socio[] =
    tipo === 'pf'
      ? [{ nome: c.nome, cpf: '***.***.***-**', proLabore: 0 }]
      : Array.from({ length: nSocios }, (_, i) => ({ nome: `${nomesSocios[(hash(c.id) + i * 3) % nomesSocios.length]} ${sobrenome}`, cpf: i % 2 ? `***.${s.entre(100, 999)}.${s.entre(100, 999)}-**` : `${s.entre(100, 999)}.${s.entre(100, 999)}.${s.entre(100, 999)}-${s.entre(10, 99)}`, proLabore: tipo === 'mei' ? 0 : s.entre(2, 15) * 1000 }))
  const nb = tipo === 'pf' || tipo === 'mei' ? 1 : s.entre(1, 3)
  const bancos = Array.from(new Set(Array.from({ length: nb + 1 }, () => s.um(bancosPossiveis)))).slice(0, nb)
  return {
    id: c.id,
    nome: c.nome,
    tipo,
    atividade,
    uf: 'PR',
    municipio: 'Curitiba',
    receitaMensal,
    folhaMensal: Math.round(empregados * s.entre(2_400, 4_200)),
    empregados,
    bancos,
    socios,
    analista: s.um(['Paulo Reis', 'Júlia Matos']),
    saude: atividade === 'saude',
    ibge: s.chance(0.3),
    implantacao: /implanta/i.test((c as Cliente).situacao ?? ''),
  }
}

/* ---------- Simples Nacional (LC 123/2006, anexos) ---------- */

type Faixa = [limite: number, aliquota: number, deduzir: number]
const anexos: Record<'I' | 'II' | 'III' | 'V', Faixa[]> = {
  I: [[180_000, 0.04, 0], [360_000, 0.073, 5_940], [720_000, 0.095, 13_860], [1_800_000, 0.107, 22_500], [3_600_000, 0.143, 87_300], [4_800_000, 0.19, 378_000]],
  II: [[180_000, 0.045, 0], [360_000, 0.078, 5_940], [720_000, 0.1, 13_860], [1_800_000, 0.112, 22_500], [3_600_000, 0.147, 85_500], [4_800_000, 0.3, 720_000]],
  III: [[180_000, 0.06, 0], [360_000, 0.112, 9_360], [720_000, 0.135, 17_640], [1_800_000, 0.16, 35_640], [3_600_000, 0.21, 125_640], [4_800_000, 0.33, 648_000]],
  V: [[180_000, 0.155, 0], [360_000, 0.18, 4_500], [720_000, 0.195, 9_900], [1_800_000, 0.205, 17_100], [3_600_000, 0.23, 62_100], [4_800_000, 0.305, 540_000]],
}

/** Alíquota efetiva = (RBT12 × alíquota nominal − parcela a deduzir) ÷ RBT12. */
export function aliquotaEfetiva(anexo: keyof typeof anexos, rbt12: number) {
  const faixa = anexos[anexo].find((f) => rbt12 <= f[0]) ?? anexos[anexo][anexos[anexo].length - 1]
  const faixaN = anexos[anexo].indexOf(faixa) + 1
  return { efetiva: rbt12 > 0 ? (rbt12 * faixa[1] - faixa[2]) / rbt12 : 0, nominal: faixa[1], deduzir: faixa[2], faixa: faixaN }
}

/* ---------- Fiscal (03, 6.4) ---------- */

export interface MensagemCaixa {
  id: string
  orgao: string
  assunto: string
  /** Resumo e classificação feitos sem abrir (listar nunca dá ciência). */
  resumo: string
  classificacao: 'intimação' | 'cobrança' | 'comunicado' | 'informativo' | 'termo de exclusão'
  recebida: string
  /** Teor completo: só aparece depois de aberta (com a ciência). */
  teor: string
  /** Prazo para responder, contado da ciência. */
  prazoResposta?: number
}

export interface GuiaS03 {
  id: string
  tributo: string
  competencia: string
  valor: number
  vencimento: string
  enviada: boolean
  lida: boolean
  paga: boolean
  /** Guia eventual: só sai quando há imposto (D-23). */
  eventual?: boolean
  /** Taxa anual de licença (C2-22). */
  licenca?: boolean
  cobrancas?: number
}

export interface DeclaracaoS03 {
  id: string
  nome: 'PGDAS-D' | 'DCTFWeb' | 'EFD-Reinf' | 'DEFIS' | 'DASN-SIMEI' | 'GIA' | 'DIRBI'
  competencia: string
  valor?: number
  prazo: string
  /** Pré-requisitos além da conferência (FIS-004). */
  falta?: string
  /** Já transmitida no começo da demonstração. */
  recibo?: string
}

export interface FiscalS03 {
  caixas: MensagemCaixa[]
  situacao: { orgao: string; atual: string; anterior: string; mudou: boolean; termo?: string }[]
  certidoes: { nome: string; validade: string; dias: number; causa?: string }[]
  simples?: {
    rbt12: number
    folha12: number
    fatorR: number
    anexo: 'I' | 'II' | 'III' | 'V'
    segregacao: { rotulo: string; anexo: string; receita: number; origem: string }[]
    receitaMes: number
    aliquota: ReturnType<typeof aliquotaEfetiva>
    das: number
    parado?: string
  }
  mei?: { limite: number; faturadoAno: number; das: number; dasn: string; notasMes: number; empregado: boolean }
  declaracoes: DeclaracaoS03[]
  federais: { id: string; grupo: 'DCTFWeb' | 'Reinf' | 'Federais' | 'Estaduais' | 'Municipais'; item: string; apurado: number; declarado: number; origem: string }[]
  guias: GuiaS03[]
  parcelamentos: { id: string; modalidade: string; total: number; pagas: number; atrasadas: number; parcela: number; risco: string }[]
  intimacoes: { id: string; orgao: string; numero: string; assunto: string; prazo: string; documentos: string[]; multa?: number }[]
  cruzamentos: { id: string; rotulo: string; a: number; b: number }[]
  reforma: { cbs: number; ibs: number; base: number; nota: string }
  resumoMes: string
  trimestresReinf: { id: string; trimestre: string; enviado: string; protocolo: string; complementares: number }[]
  pf?: {
    irpf: { exercicio: string; entregue: string; resultado: string; quotas: string; malha: string }
    campanha: { etapa: number; coletados: number; pedidos: number; preenchida: boolean }
    carneLeao: { mes: string; rendimento: number; deducoes: number; imposto: number; pago: boolean }[]
    receitaSaude: boolean
    outros: { item: string; situacao: string; fase: number }[]
  }
  creditos: { id: string; tributo: string; valor: number; origem: string; fase: number }[]
}


function fiscalS03Base(p: PerfilS03): FiscalS03 {
  const s = sorteio(`fiscal:${p.id}`)
  const rec = p.receitaMensal
  const id = (x: string) => `${p.id}:${x}`
  const caixas: MensagemCaixa[] = []
  const orgaoEstadual = p.uf === 'SP' ? 'DTE SP' : p.uf === 'RS' ? 'DTE-RS' : `DTE ${p.uf}`
  // Mensagens que dependem do cliente.
  if (p.id === 'c1') {
    caixas.push(
      { id: id('cp1'), orgao: 'e-CAC', assunto: 'Pendência na DCTFWeb 09/2026', resumo: 'Diferença de R$ 1.214,30 entre a DCTFWeb e o eSocial na contribuição previdenciária de setembro.', classificacao: 'cobrança', recebida: '2026-11-09', teor: 'Constatamos divergência entre os valores declarados na DCTFWeb (PA 09/2026) e os totalizadores do eSocial. Regularize em até 30 dias para evitar o lançamento de ofício.', prazoResposta: 30 },
      { id: id('cp2'), orgao: 'DEC SP', assunto: 'Comunicado sobre DIFAL', resumo: 'Informativo geral sobre o DIFAL nas vendas a consumidor final; não pede ação.', classificacao: 'informativo', recebida: '2026-11-02', teor: 'A SEFAZ-SP lembra as regras do DIFAL nas operações interestaduais destinadas a consumidor final não contribuinte.' },
    )
  } else if (p.id === 'c3') {
    caixas.push({ id: id('cp1'), orgao: 'e-CAC', assunto: 'Cadastro inapto: falta a ECF de 2025', resumo: 'CNPJ marcado inapto por omissão da ECF do ano-calendário 2025; o Simples pode ser excluído se não regularizar.', classificacao: 'termo de exclusão', recebida: '2026-11-12', teor: 'O CNPJ foi declarado inapto por omissão de declaração. A regularização se dá com a entrega da declaração omissa e, se for o caso, do pedido de restabelecimento.', prazoResposta: 30 })
  } else if (p.id === 'c5') {
    caixas.push(
      { id: id('cp1'), orgao: 'DTE-RS', assunto: 'Intimação sobre o CT-e 0912', resumo: 'Pede o comprovante da operação do CT-e 0912 e o livro de entradas de setembro.', classificacao: 'intimação', recebida: '2026-11-08', teor: 'Fica o contribuinte intimado a apresentar, no prazo de 10 dias contados da ciência, o comprovante da prestação de serviço de transporte referente ao CT-e nº 0912 e o livro registro de entradas de 09/2026.', prazoResposta: 10 },
      { id: id('cp2'), orgao: 'e-CAC', assunto: 'Malha PJ: retenções de IRRF', resumo: 'Retenções informadas por tomadores não batem com a DCTFWeb de agosto (R$ 3.820,00).', classificacao: 'cobrança', recebida: '2026-11-14', teor: 'Os valores de IRRF informados pelas fontes pagadoras divergem dos declarados. Retifique a declaração ou apresente justificativa.', prazoResposta: 20 },
    )
  } else if (p.id === 'c4') {
    caixas.push({ id: id('cp1'), orgao: 'DEC São Paulo', assunto: 'NFS-e: alíquota de ISS revista para serviços odontológicos', resumo: 'Comunicado da prefeitura sobre a alíquota do item 4.12; o Fiscal confere se muda a guia de ISS.', classificacao: 'comunicado', recebida: '2026-11-11', teor: 'A partir de 01/12/2026, os serviços do subitem 4.12 passam a observar a alíquota prevista na legislação municipal atualizada.' })
  } else if (p.tipo !== 'pf') {
    const n = s.entre(0, 2)
    const modelos: Omit<MensagemCaixa, 'id' | 'recebida' | 'orgao'>[] = [
      { assunto: 'Aviso de débito de ICMS em aberto', resumo: `Débito de ICMS de ${brl(s.entre(800, 9_000))} sem pagamento identificado.`, classificacao: 'cobrança', teor: 'Consta débito declarado e não pago. Regularize para evitar inscrição em dívida ativa.', prazoResposta: 30 },
      { assunto: 'Comunicado: novo leiaute da EFD', resumo: 'Informativo sobre o leiaute; o Fiscal guardou na memória do setor.', classificacao: 'informativo', teor: 'Publicado o novo leiaute da escrituração, com vigência a partir de janeiro.' },
      { assunto: 'Divergência PGDAS-D × notas emitidas', resumo: `Receita declarada ${brl(s.entre(2_000, 18_000))} abaixo das notas de serviço do período.`, classificacao: 'intimação', teor: 'Identificamos divergência entre a receita declarada no PGDAS-D e as notas fiscais emitidas. Retifique ou justifique.', prazoResposta: 15 },
    ]
    for (let i = 0; i < n; i++) caixas.push({ id: id(`cp${i + 1}`), orgao: i === 0 ? 'e-CAC' : orgaoEstadual, recebida: somarDias(HOJE, -s.entre(2, 9)), ...modelos[(hash(p.id) + i) % modelos.length] })
  }

  const situacaoBase: FiscalS03['situacao'] =
    p.id === 'c1'
      ? [{ orgao: 'Receita Federal / PGFN', atual: 'regular', anterior: 'regular', mudou: false }, { orgao: 'SEFAZ SP', atual: '1 débito de ICMS', anterior: 'regular', mudou: true }, { orgao: 'Prefeitura de São Paulo', atual: 'regular', anterior: 'regular', mudou: false }]
      : p.id === 'c3'
        ? [{ orgao: 'Receita Federal / PGFN', atual: 'inapta (falta ECF 2025)', anterior: 'regular', mudou: true, termo: 'Risco de exclusão do Simples' }, { orgao: 'SEFAZ SP', atual: 'regular', anterior: 'regular', mudou: false }, { orgao: 'Prefeitura de Campinas', atual: 'regular', anterior: 'regular', mudou: false }]
        : p.id === 'c5'
          ? [{ orgao: 'Receita Federal / PGFN', atual: 'regular', anterior: 'regular', mudou: false }, { orgao: 'SEFAZ-RS', atual: 'intimação em aberto (CT-e 0912)', anterior: 'regular', mudou: true }, { orgao: 'Prefeitura de Porto Alegre', atual: 'regular', anterior: 'regular', mudou: false }]
          : p.tipo === 'pf'
            ? [{ orgao: 'Receita Federal / PGFN (CPF)', atual: 'regular', anterior: 'regular', mudou: false }]
            : [{ orgao: 'Receita Federal / PGFN', atual: 'regular', anterior: 'regular', mudou: false }, { orgao: `SEFAZ ${p.uf}`, atual: 'regular', anterior: 'regular', mudou: false }, { orgao: `Prefeitura de ${p.municipio}`, atual: s.chance(0.25) ? '1 débito de ISS' : 'regular', anterior: 'regular', mudou: false }]
  const situacao = situacaoBase.map((x) => (x.atual !== x.anterior ? { ...x, mudou: true } : x))

  const irregularEstadual = situacao.some((x) => /SEFAZ/.test(x.orgao) && x.atual !== 'regular')
  const irregularFederal = situacao.some((x) => /Receita/.test(x.orgao) && x.atual !== 'regular')
  const certidoes: FiscalS03['certidoes'] = [
    irregularFederal ? { nome: 'CND federal', validade: 'não emitida', dias: -1, causa: 'Omissão de declaração (ECF 2025) no relatório de situação fiscal' } : { nome: p.tipo === 'pf' ? 'CND federal (CPF)' : 'CND federal', validade: ddmmaaaa(somarDias(HOJE, s.entre(20, 170))), dias: 0 },
    ...(p.tipo === 'pf' ? [] : [p.empregados > 0 ? { nome: 'CRF (FGTS)', validade: ddmmaaaa(somarDias(HOJE, s.entre(5, 28))), dias: 0 } : null, irregularEstadual ? { nome: `CND estadual ${p.uf}`, validade: 'positiva', dias: -1, causa: p.id === 'c1' ? 'ICMS 09/2026 declarado e não pago (R$ 3.410,77)' : 'Intimação sem resposta no DTE' } : { nome: `CND estadual ${p.uf}`, validade: ddmmaaaa(somarDias(HOJE, s.entre(10, 120))), dias: 0 }, p.empregados > 0 ? { nome: 'CNDT', validade: ddmmaaaa(somarDias(HOJE, s.entre(40, 179))), dias: 0 } : null].filter(Boolean) as FiscalS03['certidoes']),
  ].map((c) => (c.dias === -1 ? c : { ...c, dias: diasAte(`${c.validade.slice(6, 10)}-${c.validade.slice(3, 5)}-${c.validade.slice(0, 2)}`) }))

  // Simples
  let simples: FiscalS03['simples']
  if (p.tipo === 'simples') {
    const rbt12 = Math.round(rec * 12 * (0.96 + s.r() * 0.08))
    const folha12 = p.folhaMensal * 13
    const fatorR = rbt12 ? folha12 / rbt12 : 0
    const anexo = p.atividade === 'comercio' ? 'I' : p.atividade === 'industria' ? 'II' : fatorR >= 0.28 ? 'III' : 'V'
    const receitaMes = Math.round(rec * (0.9 + s.r() * 0.2))
    const aliquota = aliquotaEfetiva(anexo, rbt12)
    const parteST = p.atividade === 'comercio' ? Math.round(receitaMes * 0.18) : 0
    simples = {
      rbt12,
      folha12,
      fatorR,
      anexo,
      receitaMes,
      aliquota,
      das: Math.round(receitaMes * aliquota.efetiva * 100) / 100,
      segregacao: [
        { rotulo: p.atividade === 'comercio' ? 'Revenda de mercadorias' : p.atividade === 'industria' ? 'Venda de produção própria' : 'Prestação de serviços', anexo: `Anexo ${anexo}`, receita: receitaMes - parteST, origem: `${s.entre(40, 380)} notas de saída (captura)` },
        ...(parteST ? [{ rotulo: 'Revenda com ICMS-ST', anexo: 'Anexo I (sem ICMS)', receita: parteST, origem: 'CFOP 5405 nas notas' }] : []),
      ],
      parado: p.id === 'c2' ? 'receita R$ 3.120 abaixo das notas, aguardando o cliente' : p.id === 'c3' ? 'aguardando 3 notas sem XML' : undefined,
    }
  }
  let mei: FiscalS03['mei']
  if (p.tipo === 'mei') {
    const faturadoAno = Math.round(rec * 10.4)
    mei = { limite: 81_000, faturadoAno, das: p.atividade === 'servico' ? 80.9 : 76.9, dasn: 'entregue em 28/05/2026', notasMes: s.entre(4, 14), empregado: p.empregados > 0 }
  }

  const declaracoes: DeclaracaoS03[] = []
  if (simples) declaracoes.push({ id: id('pgdas'), nome: 'PGDAS-D', competencia: COMPETENCIA, valor: simples.das, prazo: '2026-11-20', falta: simples.parado }, { id: id('defis'), nome: 'DEFIS', competencia: '2025', prazo: '2026-03-31', recibo: protocoloDe(`defis${p.id}`) })
  if (mei) declaracoes.push({ id: id('dasn'), nome: 'DASN-SIMEI', competencia: '2025', prazo: '2026-05-31', recibo: protocoloDe(`dasn${p.id}`) })
  if (p.tipo === 'presumido' || p.tipo === 'real') {
    declaracoes.push({ id: id('dctfweb'), nome: 'DCTFWeb', competencia: COMPETENCIA, valor: Math.round(p.folhaMensal * 0.268), prazo: '2026-11-14', falta: p.id === 'c1' ? undefined : undefined })
    declaracoes.push({ id: id('reinf'), nome: 'EFD-Reinf', competencia: COMPETENCIA, prazo: '2026-11-14' })
    if (p.uf === 'SP') declaracoes.push({ id: id('gia'), nome: 'GIA', competencia: COMPETENCIA, prazo: '2026-11-18' })
    if (p.tipo === 'real') declaracoes.push({ id: id('dirbi'), nome: 'DIRBI', competencia: COMPETENCIA, prazo: '2026-11-20', falta: 'benefício do PERSE a confirmar' })
  }
  if (p.id === 'c1') declaracoes.find((d) => d.nome === 'DCTFWeb')!.falta = 'resolver a divergência com o eSocial (caixa postal)'

  const federais: FiscalS03['federais'] = []
  if (p.tipo === 'presumido' || p.tipo === 'real') {
    const prev = Math.round(p.folhaMensal * 0.268)
    const dif = p.id === 'c1' ? 1_214.3 : s.chance(0.3) ? s.entre(40, 900) : 0
    federais.push(
      { id: id('f1'), grupo: 'DCTFWeb', item: 'Contribuição previdenciária (folha)', apurado: prev, declarado: prev - dif, origem: 'eSocial S-1299 × DCTFWeb' },
      { id: id('f2'), grupo: 'DCTFWeb', item: 'IRRF sobre salários', apurado: Math.round(p.folhaMensal * 0.071), declarado: Math.round(p.folhaMensal * 0.071), origem: 'eSocial S-5002' },
      { id: id('f3'), grupo: 'Reinf', item: 'R-2010 · retenção INSS de serviços tomados', apurado: Math.round(rec * 0.004), declarado: Math.round(rec * 0.004), origem: `${s.entre(3, 30)} NFS-e tomadas` },
      { id: id('f4'), grupo: 'Reinf', item: 'R-4020 · IR/CSRF retidos na fonte', apurado: Math.round(rec * 0.0115), declarado: Math.round(rec * 0.0115) - (p.id === 'c5' ? 3_820 : 0), origem: 'notas recebidas com retenção' },
      { id: id('f5'), grupo: 'Federais', item: p.tipo === 'real' ? 'PIS/COFINS não cumulativo' : 'PIS/COFINS cumulativo', apurado: Math.round(rec * (p.tipo === 'real' ? 0.0925 * 0.42 : 0.0365)), declarado: Math.round(rec * (p.tipo === 'real' ? 0.0925 * 0.42 : 0.0365)), origem: 'notas de entrada e saída' },
      { id: id('f6'), grupo: 'Estaduais', item: `ICMS ${p.uf}${p.uf === 'SP' ? ' (GIA)' : ''}`, apurado: p.atividade === 'saude' ? 0 : Math.round(rec * 0.031), declarado: p.atividade === 'saude' ? 0 : Math.round(rec * 0.031), origem: 'EFD ICMS/IPI' },
      { id: id('f7'), grupo: 'Municipais', item: `ISS ${p.municipio}`, apurado: p.atividade === 'industria' ? 0 : Math.round(rec * 0.02 * 0.6), declarado: p.atividade === 'industria' ? 0 : Math.round(rec * 0.02 * 0.6), origem: 'NFS-e emitidas' },
    )
  }

  const guias: GuiaS03[] = []
  const g = (x: string, tributo: string, competencia: string, valor: number, venc: string, e: boolean, l: boolean, pg: boolean, extra: Partial<GuiaS03> = {}) => guias.push({ id: id(x), tributo, competencia, valor, vencimento: venc, enviada: e, lida: l, paga: pg, ...extra })
  if (simples) {
    g('g1', 'DAS', COMPETENCIA, simples.das, '2026-11-20', false, false, false)
    g('g2', 'DAS', '09/2026', Math.round(simples.das * 0.94 * 100) / 100, '2026-10-20', true, true, true)
  }
  if (mei) {
    g('g1', 'DAS-MEI', COMPETENCIA, mei.das, '2026-11-20', true, s.chance(0.5), false)
    g('g2', 'DAS-MEI', '09/2026', mei.das, '2026-10-20', true, true, true)
  }
  if (p.tipo === 'presumido' || p.tipo === 'real') {
    const pis = federais.find((f) => f.grupo === 'Federais')!.apurado
    g('g1', p.tipo === 'real' ? 'PIS/COFINS (não cumulativo)' : 'PIS/COFINS', COMPETENCIA, pis, '2026-11-25', true, true, false)
    g('g2', p.tipo === 'real' ? 'IRPJ/CSLL estimativa' : 'IRPJ/CSLL 3º tri', p.tipo === 'real' ? COMPETENCIA : '09/2026', Math.round(rec * (p.tipo === 'real' ? 0.019 : 0.034 * 3)), p.tipo === 'real' ? '2026-11-28' : '2026-10-30', true, p.tipo === 'presumido', p.tipo === 'presumido')
    g('g3', 'DCTFWeb (DARF previdenciário)', COMPETENCIA, Math.round(p.folhaMensal * 0.268), '2026-11-20', p.id !== 'c1', false, false)
    const iss = federais.find((f) => f.grupo === 'Municipais')!.apurado
    if (iss > 0) g('g4', 'ISS próprio', COMPETENCIA, iss, '2026-11-10', true, true, p.id !== 'c4', { eventual: true })
    else g('g4', 'ISS próprio', COMPETENCIA, 0, '2026-11-10', false, false, false, { eventual: true })
    const icms = federais.find((f) => f.grupo === 'Estaduais')!.apurado
    if (icms > 0) g('g5', `ICMS ${p.uf}`, '09/2026', p.id === 'c1' ? 3_410.77 : icms, '2026-10-20', true, true, p.id !== 'c1', { cobrancas: p.id === 'c1' ? 2 : 0 })
  }
  if (p.empregados > 0 && p.tipo !== 'mei') g('gf', 'FGTS Digital (GFD)', COMPETENCIA, Math.round(p.folhaMensal * 0.08), '2026-11-20', true, s.chance(0.6), false)
  if (p.tipo === 'pf') {
    g('g1', 'Carnê-leão', COMPETENCIA, Math.round(p.receitaMensal * 0.127 * 100) / 100, '2026-11-30', true, false, false)
    g('g2', 'IRPF 2026 · 7ª quota', COMPETENCIA, 612.4, '2026-11-28', true, true, false)
  }
  if (p.tipo !== 'pf' && s.chance(p.id === 'c2' || p.id === 'c4' ? 1 : 0.4)) g('gl', `Taxa anual de licença (TFE ${p.municipio})`, '2026', s.entre(190, 1_100), '2026-11-28', false, false, false, { licenca: true })

  const parcelamentos: FiscalS03['parcelamentos'] =
    p.id === 'c1'
      ? [{ id: id('pc1'), modalidade: 'Parcelamento simplificado (PGFN)', total: 60, pagas: 22, atrasadas: 0, parcela: 2_840.12, risco: 'sem risco' }]
      : p.id === 'c3'
        ? [{ id: id('pc1'), modalidade: 'Parcelamento do Simples (RFB)', total: 60, pagas: 9, atrasadas: 2, parcela: 610.45, risco: 'exclusão com 3 parcelas atrasadas' }]
        : s.chance(0.3) && p.tipo !== 'pf'
          ? [{ id: id('pc1'), modalidade: 'Transação tributária (PGFN)', total: 84, pagas: s.entre(3, 40), atrasadas: s.chance(0.3) ? 1 : 0, parcela: s.entre(300, 4_000), risco: 'rescisão com 3 atrasadas' }]
          : []

  const intimacoes: FiscalS03['intimacoes'] =
    p.id === 'c5'
      ? [{ id: id('in1'), orgao: 'SEFAZ-RS', numero: 'TIF 2026/0912', assunto: 'Comprovação do CT-e 0912', prazo: '2026-11-28', documentos: ['Comprovante da prestação (canhoto)', 'Livro de entradas 09/2026'], multa: 12_400 }]
      : p.id === 'c1'
        ? [{ id: id('in1'), orgao: 'Receita Federal', numero: 'Intimação 1234/2026', assunto: 'Documentos que embasam créditos de PIS/COFINS', prazo: '2026-11-26', documentos: ['Notas de entrada de insumos 06/2026', 'Contratos de frete'] }]
        : p.tipo === 'pf'
          ? [{ id: id('in1'), orgao: 'Receita Federal', numero: 'Malha IRPF 2026', assunto: 'Despesas médicas a comprovar', prazo: '2026-12-10', documentos: ['Recibos de despesas médicas', 'Informe do plano de saúde'] }]
          : []

  const cruzamentos =
    p.tipo === 'pf'
      ? [{ id: id('x1'), rotulo: 'Carnê-leão × recibos', a: p.receitaMensal, b: p.receitaMensal }]
      : p.tipo === 'mei'
        ? [{ id: id('x1'), rotulo: 'Notas emitidas × faturamento declarado', a: rec, b: rec }, { id: id('x2'), rotulo: 'DAS-MEI pagos × extrato', a: 80.9 * 9, b: 80.9 * 9 }]
      : [
          { id: id('x1'), rotulo: 'Notas de saída × apuração', a: rec, b: p.id === 'c2' ? rec - 3_120 : rec },
          { id: id('x2'), rotulo: 'Folha × DCTFWeb', a: p.folhaMensal, b: p.id === 'c1' ? p.folhaMensal - 4_531 : p.folhaMensal },
          { id: id('x3'), rotulo: 'Guias pagas × extrato', a: Math.round(rec * 0.06), b: Math.round(rec * 0.06) - (p.id === 'c1' ? 3_410.77 : 0) },
          { id: id('x4'), rotulo: 'Notas de entrada × escrituração', a: Math.round(rec * 0.55), b: Math.round(rec * 0.55) },
        ]

  const trimestresReinf =
    p.tipo === 'presumido' || p.tipo === 'real'
      ? [
          { id: id('t1'), trimestre: '1º trimestre/2026', enviado: '2026-04-15', protocolo: protocoloDe(`r1${p.id}`), complementares: 0 },
          { id: id('t2'), trimestre: '2º trimestre/2026', enviado: '2026-07-15', protocolo: protocoloDe(`r2${p.id}`), complementares: p.id === 'c1' ? 1 : 0 },
          { id: id('t3'), trimestre: '3º trimestre/2026', enviado: '2026-10-15', protocolo: protocoloDe(`r3${p.id}`), complementares: 0 },
        ]
      : []

  const pf: FiscalS03['pf'] =
    p.tipo === 'pf'
      ? {
          irpf: { exercicio: '2026', entregue: '22/04/2026', resultado: `imposto a pagar ${brl(4_286.8)} em 8 quotas`, quotas: '6 de 8 pagas', malha: intimacoes.length ? 'em malha: despesas médicas' : 'processada' },
          campanha: { etapa: 1, coletados: s.entre(3, 6), pedidos: 11, preenchida: false },
          carneLeao: ['07/2026', '08/2026', '09/2026', '10/2026'].map((mes, i) => {
            const rendimento = Math.round(p.receitaMensal * (0.92 + i * 0.03))
            const deducoes = Math.round(rendimento * 0.08)
            return { mes, rendimento, deducoes, imposto: Math.round((rendimento - deducoes) * 0.275 - 896) , pago: i < 3 }
          }),
          receitaSaude: p.atividade === 'saude',
          outros: [
            { item: 'Ganho de capital (venda de imóvel em 03/2026)', situacao: 'GCAP preparado, DARF pago', fase: 1 },
            { item: 'Renda variável (ações)', situacao: 'sem operações tributáveis no mês', fase: 4 },
            { item: 'Criptoativos', situacao: 'saldo declarado; sem alienação', fase: 4 },
            { item: 'Espólio', situacao: 'não se aplica', fase: 5 },
          ],
        }
      : undefined

  const creditos: FiscalS03['creditos'] =
    p.tipo === 'pf' || p.tipo === 'mei'
      ? []
      : [
          ...(p.tipo === 'simples' && p.atividade === 'comercio' ? [{ id: id('cr1'), tributo: 'PIS/COFINS monofásico pago a maior', valor: Math.round(rec * 0.012 * 12), origem: 'produtos monofásicos tributados no PGDAS-D dos últimos 12 meses', fase: 4 }] : []),
          ...(p.tipo === 'real' ? [{ id: id('cr1'), tributo: 'Crédito de PIS/COFINS sobre insumos de frete', valor: Math.round(rec * 0.006 * 12), origem: 'conhecimentos de transporte sem crédito tomado', fase: 4 }] : []),
          ...(p.tipo === 'presumido' ? [{ id: id('cr1'), tributo: 'INSS retido a compensar (R-2010)', valor: Math.round(rec * 0.002 * 6), origem: 'retenções de 6 meses sem compensação', fase: 4 }] : []),
        ]

  const base = p.tipo === 'pf' ? 0 : rec
  return {
    caixas,
    situacao,
    certidoes,
    simples,
    mei,
    declaracoes,
    federais,
    guias,
    parcelamentos,
    intimacoes,
    cruzamentos,
    reforma: { cbs: 0.009, ibs: 0.001, base, nota: p.tipo === 'simples' || p.tipo === 'mei' ? 'No Simples, o destaque de CBS e IBS em 2026 é informativo; a opção pelo regime regular da CBS/IBS a partir de 2027 entra na Consultoria.' : 'Em 2026 a CBS (0,9%) e o IBS (0,1%) são destacados em caráter de teste e compensados com PIS/COFINS.' },
    resumoMes:
      p.tipo === 'pf'
        ? `Oi! Resumo de outubro: carnê-leão de ${brl(guias[0]?.valor ?? 0)} vence em 30/11 e a 7ª quota do IRPF em 28/11. Os recibos de outubro já estão aqui.`
        : `Oi! Resumo fiscal de outubro de ${p.nome}: receita de ${brl0(rec)}, ${guias.filter((x) => x.competencia === COMPETENCIA && x.valor > 0).length} guias geradas que somam ${brl(guias.filter((x) => x.competencia === COMPETENCIA).reduce((t, x) => t + x.valor, 0))}. ${certidoes.some((c) => c.dias < 0) ? 'Há uma certidão positiva: estamos cuidando.' : 'Certidões em dia.'}`,
    trimestresReinf,
    pf,
    creditos,
  }
}

/* ---------- Contábil (03, 6.6) ---------- */

export type EtapaFechamento = 'coleta' | 'extratos' | 'classificacao' | 'conciliacao' | 'core'
export const etapasFechamento: { id: EtapaFechamento; rotulo: string }[] = [
  { id: 'coleta', rotulo: 'Coleta' },
  { id: 'extratos', rotulo: 'Extratos' },
  { id: 'classificacao', rotulo: 'Classificação' },
  { id: 'conciliacao', rotulo: 'Conciliação' },
  { id: 'core', rotulo: 'Fechamento' },
]

export interface ContaEsperada {
  id: string
  banco: string
  conta: string
  origem: 'Open Finance' | 'OFX' | 'CSV' | 'PDF' | 'planilha'
  chegou: boolean
  /** Dias sem lançamento dentro do mês (buraco no extrato). */
  buracos: string[]
  quando: string
}

export interface LinhaExtrato {
  id: string
  data: string
  descricao: string
  valor: number
  favorecido: string
  sugestao: string
  confianca: number
  /** Saída a um sócio (entra na distribuição de lucros, D-12). */
  socio?: string
}

export interface DocTriagem {
  id: string
  nome: string
  canal: 'WhatsApp' | 'e-mail' | 'app' | 'nuvem'
  cliente: string
  competencia: string
  /** Regra do mês que decidiu a competência (D-02): nome, pasta ou conteúdo. */
  regra: 'nome do arquivo' | 'pasta' | 'conteúdo'
  confianca: number
  situacao: 'ok' | 'conferir' | 'mês futuro' | 'zip aberto'
  detalhe: string
}

export interface SaidaSocio {
  id: string
  socio: string
  mes: string
  data: string
  valor: number
  favorecido: string
  natureza: 'lucro' | 'pró-labore' | 'devolução' | 'reembolso' | 'suspeita'
}

export interface ContabilS03 {
  competencia: string
  etapaInicial: EtapaFechamento
  contas: ContaEsperada[]
  deveChegar: { id: string; item: string; chegou: boolean; quando: string }[]
  triagem: DocTriagem[]
  linhas: LinhaExtrato[]
  totalLinhas: number
  conciliacoes: { id: string; conta: string; diferenca: number }[]
  saidas: SaidaSocio[]
  dre: { faturamento: number; custos: number; despesas: number; outrasReceitas: number; lucro: number; balanceteDiferenca: number }
  imobilizado: { item: string; valor: number; depreciacao: string }[]
  relatorios: { id: string; nome: string; tipo: 'balancete' | 'dre' | 'comparativo' | 'demonstracoes' | 'carta' | 'ecd' | 'ecf' | 'decore' | 'declaracao' | 'auditoria'; periodo: string; assina: boolean; fase: number }[]
  pedidosDeclaracao: { id: string; pedidoPor: string; quando: string; finalidade: string; meses: number }[]
  livroCaixa?: { mes: string; receitas: number; despesas: number }[]
  fase: 'Completo' | 'Parcial' | 'A conferir' | 'Pendente' | 'Estrutura incompleta'
  atrasoDias: number
}

function contabilS03Base(p: PerfilS03): ContabilS03 {
  const s = sorteio(`contabil:${p.id}`)
  const id = (x: string) => `${p.id}:${x}`
  const rec = p.receitaMensal
  const contas: ContaEsperada[] = p.bancos.map((b, i) => {
    const faltando = p.id === 'c1' ? b === 'Inter' : p.id === 'c2' ? b === 'Sicoob' : p.id === 'c5' ? b === 'Safra' : !p.implantacao && i > 0 && s.chance(0.25)
    return {
      id: id(`ct${i}`),
      banco: b,
      conta: `${s.entre(1000, 9999)}-${s.entre(0, 9)}`,
      origem: i === 0 && !['Nubank', 'Inter', 'C6'].includes(b) ? 'Open Finance' : s.um(['OFX', 'PDF', 'CSV', 'planilha'] as ContaEsperada['origem'][]),
      chegou: !faltando,
      buracos: !faltando && p.id === 'c3' && i === 0 ? ['12/10 a 14/10'] : [],
      quando: faltando ? `cobrado ${p.id === 'c1' ? 2 : 1} ${p.id === 'c1' ? 'vezes' : 'vez'} · há ${p.id === 'c1' ? 6 : s.entre(2, 9)} dias` : `${i === 0 ? 'Open Finance' : 'app'} · ${ddmm(somarDias('2026-11-01', i + 1))}`,
    }
  })
  const deveChegar = [
    { id: id('d1'), item: p.tipo === 'pf' ? 'Recibos de aluguel e serviços' : 'Notas de entrada e saída', chegou: true, quando: p.tipo === 'pf' ? 'app · 03/11' : `captura · ${s.entre(30, 600)} XMLs` },
    ...(p.empregados > 0 && p.tipo !== 'pf' ? [{ id: id('d2'), item: 'Folha de outubro', chegou: true, quando: 'DP · 05/11' }] : []),
    ...(p.tipo !== 'pf' && p.tipo !== 'mei' ? [{ id: id('d3'), item: p.id === 'c1' ? 'Comprovantes de despesas da diretoria' : 'Comprovantes de despesas sem nota', chegou: p.id !== 'c1' && s.chance(0.6), quando: 'cobrado 1 vez · há 3 dias' }] : []),
    ...(p.atividade === 'comercio' || p.atividade === 'industria' ? [{ id: id('d4'), item: 'Relatório de vendas no cartão (adquirente)', chegou: s.chance(0.7), quando: 'e-mail · 04/11' }] : []),
  ]
  const triagem: DocTriagem[] = [
    { id: id('tr1'), nome: `extrato_${p.bancos[0]?.toLowerCase().replace(/ /g, '')}_out26.pdf`, canal: 'WhatsApp', cliente: p.nome, competencia: COMPETENCIA, regra: 'nome do arquivo', confianca: 0.97, situacao: 'ok', detalhe: '“out26” no nome' },
    { id: id('tr2'), nome: 'comprovantes.zip', canal: 'e-mail', cliente: p.nome, competencia: COMPETENCIA, regra: 'conteúdo', confianca: 0.88, situacao: 'zip aberto', detalhe: `${s.entre(4, 12)} arquivos dentro, um por despesa (D-04)` },
    { id: id('tr3'), nome: 'nota_servico.pdf', canal: 'app', cliente: p.nome, competencia: '07/2026', regra: 'conteúdo', confianca: 0.74, situacao: 'conferir', detalhe: 'data de emissão de mais de 3 meses: vai para “conferir”' },
    { id: id('tr4'), nome: 'boleto_aluguel_dez.pdf', canal: 'WhatsApp', cliente: p.nome, competencia: '12/2026', regra: 'conteúdo', confianca: 0.81, situacao: 'mês futuro', detalhe: 'vencimento em dezembro: não conta para outubro' },
    { id: id('tr5'), nome: `Docs/${p.nome.split(' ')[0]}/2026-10/folha.pdf`, canal: 'nuvem', cliente: p.nome, competencia: COMPETENCIA, regra: 'pasta', confianca: 0.93, situacao: 'ok', detalhe: 'pasta “2026-10”' },
  ].slice(0, p.tipo === 'pf' ? 3 : 5) as DocTriagem[]

  const socioPrincipal = p.socios[0]
  const linhas: LinhaExtrato[] = [
    { id: id('l1'), data: '04/10', descricao: `PIX RECEBIDO ${s.um(['JOSE R SILVA', 'MARIA C LOPES', 'ANDRE P FARIAS'])}`, valor: s.entre(800, 6_000), favorecido: 'Cliente a identificar', sugestao: 'Clientes · a identificar', confianca: 0.42 },
    { id: id('l2'), data: '11/10', descricao: 'TAR PACOTE SERVICOS', valor: -s.entre(40, 180), favorecido: p.bancos[0] ?? 'Banco', sugestao: 'Despesas bancárias', confianca: 0.96 },
    ...(p.tipo !== 'pf' && socioPrincipal ? [{ id: id('l3'), data: '15/10', descricao: `PIX ENVIADO ${socioPrincipal.nome.toUpperCase()}`, valor: -s.entre(5, 30) * 1000, favorecido: socioPrincipal.nome, sugestao: 'Conta corrente de sócio', confianca: 0.61, socio: socioPrincipal.nome }] : []),
    { id: id('l4'), data: '20/10', descricao: `PAG BOLETO ${s.um(['ACO BRASIL LTDA', 'DISTRIB ALFA', 'PAPELARIA CENTRO', 'ENERGIA SA'])}`, valor: -s.entre(300, 48_000), favorecido: 'Fornecedor', sugestao: 'Fornecedores', confianca: 0.93 },
    { id: id('l5'), data: '28/10', descricao: 'TAR PACOTE SERVICOS', valor: -s.entre(40, 180), favorecido: p.bancos[0] ?? 'Banco', sugestao: 'Despesas bancárias · duplicidade?', confianca: 0.55 },
    { id: id('l6'), data: '30/10', descricao: 'DEB AUTOMATICO SEGURO', valor: -s.entre(200, 2_000), favorecido: 'Seguradora', sugestao: 'Seguros', confianca: 0.89 },
  ]
  const totalLinhas = Math.max(linhas.length, Math.round(rec / (p.tipo === 'pf' ? 2_000 : 3_000)))
  const conciliacoes = p.tipo === 'pf' ? [] : [
    { id: id('c1'), conta: 'Impostos a recolher × fiscal × extrato', diferenca: p.id === 'c1' ? 0 : s.chance(0.2) ? s.entre(10, 900) : 0 },
    ...(p.empregados > 0 ? [{ id: id('c2'), conta: 'Folha × contábil', diferenca: 0 }] : []),
    { id: id('c3'), conta: 'Fornecedores × títulos pagos', diferenca: p.id === 'c1' ? 1_230 : s.chance(0.4) ? s.entre(50, 4_000) : 0 },
    ...(p.socios.length && p.tipo !== 'mei' ? [{ id: id('c4'), conta: 'Conta corrente de sócio', diferenca: p.id === 'c1' ? 15_000 : s.chance(0.3) ? s.entre(1, 20) * 1000 : 0 }] : []),
    ...(p.atividade === 'comercio' || p.atividade === 'industria' ? [{ id: id('c5'), conta: 'Adquirentes (cartão) × vendas', diferenca: p.id === 'c1' ? 87.4 : s.chance(0.5) ? s.entre(10, 300) : 0 }] : []),
  ]

  // Distribuição de lucros (D-11 a D-15): saídas por sócio, de julho a outubro.
  const saidas: SaidaSocio[] = []
  if (p.tipo !== 'pf' && p.tipo !== 'mei') {
    const meses = ['07/2026', '08/2026', '09/2026', '10/2026']
    p.socios.forEach((so, i) => {
      meses.forEach((mes, m) => {
        const grande = p.id === 'c1' && i === 0 ? 80_000 : p.id === 'c5' ? s.entre(55, 140) * 1000 : rec > 600_000 ? s.entre(20, 70) * 1000 : s.entre(2, 15) * 1000
        const dia = String(s.entre(5, 25)).padStart(2, '0')
        saidas.push({ id: id(`sd${i}${m}a`), socio: so.nome, mes, data: `${dia}/${mes.slice(0, 2)}`, valor: grande, favorecido: so.nome, natureza: m === 3 && i === 0 ? 'suspeita' : 'lucro' })
        if (so.proLabore) saidas.push({ id: id(`sd${i}${m}p`), socio: so.nome, mes, data: `05/${mes.slice(0, 2)}`, valor: Math.round(so.proLabore * 0.79), favorecido: so.nome, natureza: 'pró-labore' })
        if (m === 1 && i === 0) saidas.push({ id: id(`sd${i}${m}d`), socio: so.nome, mes, data: `28/${mes.slice(0, 2)}`, valor: -s.entre(2, 8) * 1000, favorecido: so.nome, natureza: 'devolução' })
        if (m === 3 && i === p.socios.length - 1) saidas.push({ id: id(`sd${i}${m}s`), socio: so.nome, mes, data: `22/${mes.slice(0, 2)}`, valor: s.entre(3, 12) * 1000, favorecido: `${so.nome.split(' ')[0].toUpperCase()} ${s.um(['ME', 'SERVICOS', 'EIRELI'])}`, natureza: 'suspeita' })
      })
    })
  }

  const custos = Math.round(rec * (p.atividade === 'servico' || p.atividade === 'saude' ? 0.3 : 0.58))
  const despesas = Math.round(rec * 0.22 + p.folhaMensal)
  const outrasReceitas = p.id === 'c3' ? Math.round(rec * 0.31) : Math.round(rec * 0.01)
  const faturamento = p.id === 'c7' ? 0 : rec
  const lucro = faturamento - custos - despesas + outrasReceitas
  const dre = { faturamento, custos: p.id === 'c7' ? 4_200 : custos, despesas: p.id === 'c7' ? 6_900 : despesas, outrasReceitas, lucro: p.id === 'c7' ? 18_400 : lucro, balanceteDiferenca: p.id === 'c2' ? 312.55 : 0 }

  const relatorios: ContabilS03['relatorios'] = [
    { id: id('r1'), nome: 'Balancete de outubro', tipo: 'balancete', periodo: COMPETENCIA, assina: false, fase: 1 },
    { id: id('r2'), nome: 'DRE de outubro', tipo: 'dre', periodo: COMPETENCIA, assina: true, fase: 1 },
    { id: id('r3'), nome: 'Comparativo mensal 2026', tipo: 'comparativo', periodo: '2026', assina: false, fase: 1 },
    ...(p.tipo === 'presumido' || p.tipo === 'real' ? [
      { id: id('r4'), nome: 'Demonstrações contábeis 2025', tipo: 'demonstracoes' as const, periodo: '2025', assina: true, fase: 1 },
      { id: id('r5'), nome: 'Carta de responsabilidade da administração', tipo: 'carta' as const, periodo: '2025', assina: true, fase: 1 },
      { id: id('r6'), nome: 'ECD 2025', tipo: 'ecd' as const, periodo: '2025', assina: true, fase: 1 },
      { id: id('r7'), nome: 'ECF 2025', tipo: 'ecf' as const, periodo: '2025', assina: true, fase: 1 },
    ] : []),
    ...(p.tipo !== 'mei' ? [{ id: id('r8'), nome: 'DECORE (comprovação de rendimentos)', tipo: 'decore' as const, periodo: COMPETENCIA, assina: true, fase: 1 }] : []),
    ...(p.tipo === 'real' ? [{ id: id('r9'), nome: 'Pacote para o auditor', tipo: 'auditoria' as const, periodo: '2026', assina: false, fase: 4 }] : []),
  ]
  const contato = p.socios[0]?.nome ?? 'cliente'
  const pedidosDeclaracao = p.id === 'c2' ? [{ id: id('pd1'), pedidoPor: contato, quando: '17/11', finalidade: 'financiamento de forno no banco', meses: 12 }] : p.id === 'c7' ? [{ id: id('pd1'), pedidoPor: contato, quando: '16/11', finalidade: 'aluguel do novo ponto', meses: 6 }] : p.id === 'c-s03-mei' ? [{ id: id('pd1'), pedidoPor: contato, quando: '15/11', finalidade: 'cadastro em fornecedor', meses: 12 }] : []

  const etapaInicial: EtapaFechamento = p.implantacao ? 'coleta' : p.id === 'c1' ? 'classificacao' : p.id === 'c2' ? 'coleta' : p.id === 'c3' ? 'conciliacao' : p.id === 'c5' ? 'core' : s.um(['coleta', 'extratos', 'classificacao', 'conciliacao'] as EtapaFechamento[])
  const fase: ContabilS03['fase'] = p.implantacao ? 'Estrutura incompleta' : contas.some((c) => !c.chegou) ? 'Pendente' : etapaInicial === 'conciliacao' ? 'A conferir' : etapaInicial === 'core' ? 'Completo' : 'Parcial'
  return {
    competencia: COMPETENCIA,
    etapaInicial,
    contas,
    deveChegar,
    triagem,
    linhas,
    totalLinhas,
    conciliacoes,
    saidas,
    dre,
    imobilizado: p.tipo === 'pf' || p.tipo === 'mei' ? [] : [{ item: p.atividade === 'industria' ? 'Prensa hidráulica' : p.atividade === 'transporte' ? 'Cavalo mecânico' : 'Computadores', valor: s.entre(8, 600) * 1000, depreciacao: p.atividade === 'transporte' ? '25% a.a.' : '10% a.a.' }],
    relatorios,
    pedidosDeclaracao,
    livroCaixa: p.tipo === 'pf' ? ['07/2026', '08/2026', '09/2026', '10/2026'].map((mes, i) => ({ mes, receitas: Math.round(p.receitaMensal * (0.95 + i * 0.02)), despesas: Math.round(p.receitaMensal * 0.08) })) : undefined,
    fase,
    atrasoDias: p.id === 'c1' ? 6 : p.id === 'c2' ? 8 : p.implantacao ? 0 : s.entre(0, 5),
  }
}

/* ---------- Consultoria (03, 6.7) ---------- */

export interface Trecho {
  id: string
  norma: string
  redacao: string
  vigente: string
}

export interface PerguntaS03 {
  id: string
  pergunta: string
  canal: 'WhatsApp' | 'app' | 'e-mail' | 'interno'
  quem: string
  setorOrigem: string
  status: 'nova' | 'rascunho pronto' | 'revisada' | 'enviada'
  escopo: 'dentro' | 'fora'
  quando: string
  risco?: boolean
}

export interface ConsultoriaS03 {
  perguntas: PerguntaS03[]
  pareceres: { id: string; titulo: string; data: string; base: string; versao: number; citacoes: number }[]
  vigilancia: { id: string; aviso: string; numeros: string; regra: string; nivel: 'ok' | 'atencao' }[]
  segundaOpiniao: { id: string; tarefa: string; resultado: 'confere' | 'divergência'; nota: string; citacao: string }[]
  cct?: { sindicato: string; vigencia: string; pontos: string[] }
  regimes: { regime: string; imposto: number; observacao: string; aplicavel: boolean }[]
  creditos: { id: string; oportunidade: string; valor: number; etapa: string }[]
}

/** Base legal citável usada nos rascunhos (texto resumido; a íntegra fica na base do Consultor). */
export const baseLegal: Record<string, Trecho> = {
  lc123_3: { id: 'lc123_3', norma: 'LC 123/2006, art. 3º, II', redacao: 'Empresa de pequeno porte: receita bruta superior a R$ 360.000,00 e igual ou inferior a R$ 4.800.000,00 no ano-calendário.', vigente: 'desde 01/01/2018' },
  lc123_18: { id: 'lc123_18', norma: 'LC 123/2006, art. 18, § 5º-J e § 5º-M', redacao: 'Atividades do Anexo V passam ao Anexo III quando a razão entre a folha de salários e a receita bruta for igual ou superior a 28%.', vigente: 'desde 01/01/2018' },
  lc214: { id: 'lc214', norma: 'LC 214/2025, arts. 343 a 346', redacao: 'Em 2026, CBS à alíquota de 0,9% e IBS à alíquota de 0,1%, em caráter de teste, compensáveis com PIS/COFINS.', vigente: 'desde 01/01/2026' },
  lei9249: { id: 'lei9249', norma: 'Lei 9.249/1995, art. 10', redacao: 'Os lucros ou dividendos calculados com base nos resultados apurados não ficam sujeitos à incidência do imposto de renda na fonte, salvo o disposto em lei posterior.', vigente: 'redação vigente até 31/12/2025' },
  lei15270: { id: 'lei15270', norma: 'Lei 15.270/2025', redacao: 'Retenção de 10% de IRRF sobre lucros e dividendos pagos a uma mesma pessoa física acima de R$ 50.000,00 no mês.', vigente: 'desde 01/01/2026' },
  lc116: { id: 'lc116', norma: 'LC 116/2003, art. 3º', redacao: 'O serviço considera-se prestado, e o imposto devido, no local do estabelecimento prestador, salvo as exceções dos incisos.', vigente: 'desde 01/08/2003' },
  lei10833: { id: 'lei10833', norma: 'Lei 10.833/2003, art. 3º, II', redacao: 'Do valor apurado, a pessoa jurídica pode descontar créditos sobre bens e serviços utilizados como insumo na prestação de serviços.', vigente: 'desde 01/02/2004' },
}

function consultoriaS03Base(p: PerfilS03): ConsultoriaS03 {
  const s = sorteio(`consultoria:${p.id}`)
  const id = (x: string) => `${p.id}:${x}`
  const contato = p.socios[0]?.nome ?? 'cliente'
  const perguntas: PerguntaS03[] = []
  if (p.tipo === 'simples') perguntas.push({ id: id('q1'), pergunta: p.atividade === 'servico' ? 'Se eu aumentar a folha, saio do Anexo V?' : 'Quanto falta para estourar o sublimite do Simples?', canal: 'WhatsApp', quem: contato, setorOrigem: 'Fiscal', status: 'rascunho pronto', escopo: 'dentro', quando: 'hoje 09:40' })
  if (p.tipo === 'presumido' || p.tipo === 'real') perguntas.push({ id: id('q1'), pergunta: p.id === 'c1' ? 'A filial de Guarulhos pode ter regime diferente da matriz?' : 'Vale a pena antecipar a distribuição de lucros antes da retenção de 10%?', canal: 'WhatsApp', quem: contato, setorOrigem: 'Contábil', status: 'rascunho pronto', escopo: 'dentro', quando: 'hoje 09:40', risco: true })
  if (p.tipo === 'pf') perguntas.push({ id: id('q1'), pergunta: 'Aluguel recebido de pessoa jurídica entra no carnê-leão?', canal: 'WhatsApp', quem: contato, setorOrigem: 'Fiscal', status: 'nova', escopo: 'dentro', quando: 'hoje 08:15' })
  if (p.tipo === 'mei') perguntas.push({ id: id('q1'), pergunta: 'Posso contratar mais um funcionário sendo MEI?', canal: 'app', quem: contato, setorOrigem: 'DP', status: 'nova', escopo: 'dentro', quando: 'ontem' })
  perguntas.push({ id: id('q2'), pergunta: p.tipo === 'pf' ? 'Compensa abrir uma empresa para os meus serviços?' : 'Qual será o impacto da reforma tributária no nosso preço de venda?', canal: 'app', quem: contato, setorOrigem: 'Atendimento', status: 'nova', escopo: 'fora', quando: 'ontem' })
  perguntas.push({ id: id('q3'), pergunta: p.atividade === 'saude' ? 'Serviço odontológico tem ISS no município do paciente?' : 'O ISS é devido onde o serviço foi prestado ou onde fica a empresa?', canal: 'e-mail', quem: contato, setorOrigem: 'Fiscal', status: 'enviada', escopo: 'dentro', quando: '28/10' })
  if (p.id === 'c1') perguntas.push({ id: id('q4'), pergunta: 'Existe crédito de PIS sobre o uniforme dos empregados da produção?', canal: 'interno', quem: 'Fernanda Lima', setorOrigem: 'Fiscal', status: 'nova', escopo: 'dentro', quando: 'hoje 10:05' })

  const pareceres = [
    { id: id('pa1'), titulo: p.tipo === 'simples' ? 'Fator R e o enquadramento em 2027' : p.tipo === 'pf' ? 'Carnê-leão sobre aluguéis' : 'Distribuição de lucros e a retenção de 10%', data: '06/11/2026', base: 'base de 06/11', versao: 2, citacoes: s.entre(3, 6) },
    { id: id('pa2'), titulo: 'Local de incidência do ISS', data: '29/10/2026', base: 'base de 28/10', versao: 1, citacoes: 3 },
  ]
  const rbt12 = p.receitaMensal * 12
  const vigilancia: ConsultoriaS03['vigilancia'] = [
    { id: id('v1'), aviso: 'LC 214/2025: CBS de 2027 confirmada', numeros: `carga estimada sobe ${pct(s.entre(4, 16) / 1000)} sobre ${brl0(p.receitaMensal)}/mês`, regra: 'LC 214/2025, arts. 343 a 346', nivel: 'atencao' },
    ...(p.tipo === 'simples' ? [{ id: id('v2'), aviso: rbt12 > 3_600_000 * 0.8 ? 'Perto do sublimite estadual' : 'Sublimite com folga', numeros: `RBT12 ${brl0(rbt12)} de ${brl0(3_600_000)}`, regra: 'LC 123/2006, art. 19', nivel: (rbt12 > 3_600_000 * 0.8 ? 'atencao' : 'ok') as 'ok' | 'atencao' }] : []),
    ...(p.tipo !== 'pf' && p.tipo !== 'mei' && p.socios.length ? [{ id: id('v3'), aviso: 'Retenção de 10% sobre lucros acima de R$ 50 mil/mês', numeros: p.id === 'c1' || p.id === 'c5' ? 'há sócio recebendo acima de R$ 50 mil no mês' : 'nenhum sócio acima do limite', regra: 'Lei 15.270/2025', nivel: (p.id === 'c1' || p.id === 'c5' ? 'atencao' : 'ok') as 'ok' | 'atencao' }] : []),
    ...(p.tipo === 'mei' ? [{ id: id('v4'), aviso: 'Limite anual do MEI', numeros: `${brl0(p.receitaMensal * 10.4)} de ${brl0(81_000)} no ano`, regra: 'LC 123/2006, art. 18-A, § 1º', nivel: 'atencao' as const }] : []),
  ]
  const segundaOpiniao = p.tipo === 'pf' || p.tipo === 'mei' ? [] : [
    { id: id('so1'), tarefa: p.tipo === 'simples' ? 'FIS-009 · PGDAS-D 10/2026' : 'FIS-019 · DCTFWeb 10/2026', resultado: (p.id === 'c1' ? 'divergência' : 'confere') as 'confere' | 'divergência', nota: p.id === 'c1' ? 'A contribuição declarada difere do eSocial em R$ 1.214,30; a DCTFWeb não deve sair antes do ajuste.' : 'Apuração confere com as notas e a folha.', citacao: p.id === 'c1' ? 'IN RFB 2.005/2021, art. 19' : '—' },
  ]
  const cct = p.empregados > 0 ? { sindicato: p.atividade === 'industria' ? 'Metalúrgicos de SP' : p.atividade === 'transporte' ? 'Rodoviários do RS' : p.atividade === 'saude' ? 'Empregados em estabelecimentos de saúde de SP' : 'Comerciários', vigencia: '2026/2027 (data-base novembro)', pontos: ['Reajuste de 5,2% retroativo a 01/11', 'Piso da categoria revisto', 'Vale-alimentação passa a ser obrigatório acima de 6 horas', 'Banco de horas só com acordo individual escrito'] } : undefined
  const folha12 = p.folhaMensal * 13
  const presumido = p.receitaMensal * 12 * (p.atividade === 'servico' || p.atividade === 'saude' ? 0.1633 : 0.0593) + folha12 * 0.268
  const real = p.receitaMensal * 12 * 0.09 + folha12 * 0.268
  const simplesAnual = rbt12 <= 4_800_000 ? rbt12 * aliquotaEfetiva(p.atividade === 'comercio' ? 'I' : p.atividade === 'industria' ? 'II' : folha12 / Math.max(rbt12, 1) >= 0.28 ? 'III' : 'V', rbt12).efetiva : 0
  const regimes = p.tipo === 'pf' ? [] : [
    { regime: 'Simples Nacional', imposto: Math.round(simplesAnual), observacao: rbt12 > 4_800_000 ? 'acima do limite: não cabe' : 'alíquota efetiva pela LC 123/2006', aplicavel: rbt12 <= 4_800_000 },
    { regime: 'Lucro Presumido', imposto: Math.round(presumido), observacao: 'IRPJ, CSLL, PIS/COFINS cumulativos e INSS patronal', aplicavel: rbt12 <= 78_000_000 },
    { regime: 'Lucro Real', imposto: Math.round(real), observacao: 'com créditos de PIS/COFINS e lucro estimado', aplicavel: true },
  ]
  const creditos = p.tipo === 'pf' || p.tipo === 'mei' ? [] : [
    { id: id('cr1'), oportunidade: p.tipo === 'simples' ? 'Monofásico tributado em duplicidade' : 'Insumos sem crédito de PIS/COFINS', valor: Math.round(p.receitaMensal * (p.tipo === 'simples' ? 0.012 : 0.006) * 60), etapa: 'oportunidade identificada' },
    { id: id('cr2'), oportunidade: 'INSS sobre verbas indenizatórias', valor: Math.round(folha12 * 0.02 * 5), etapa: 'levantamento' },
  ]
  return { perguntas, pareceres, vigilancia, segundaOpiniao, cct, regimes, creditos }
}

/** Reforma tributária por ano de transição (CON-016; Calculadora RFB simulada). */
function cenariosReformaBase(p: PerfilS03, margem = 0.3) {
  const anos = [2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033]
  const ibsFracao: Record<number, number> = { 2026: 0, 2027: 0, 2028: 0, 2029: 0.1, 2030: 0.2, 2031: 0.3, 2032: 0.4, 2033: 1 }
  const anual = p.receitaMensal * 12
  const atual = anual * (p.tipo === 'simples' ? 0.08 : p.tipo === 'real' ? 0.0925 + 0.18 * 0.6 : 0.0365 + 0.05)
  const creditoInsumos = 1 - margem
  return anos.map((ano) => {
    const cbs = ano === 2026 ? 0.009 : 0.088
    const ibs = ano === 2026 ? 0.001 : ano < 2029 ? 0.001 : 0.177 * ibsFracao[ano]
    const pisCofins = ano >= 2027 ? 0 : 1
    const icmsIss = ano < 2029 ? 1 : 1 - ibsFracao[ano]
    const novo = anual * (cbs + ibs) * (1 - creditoInsumos * 0.85)
    const antigo = atual * (pisCofins * 0.45 + icmsIss * 0.55)
    return { ano, cbs, ibs, carga: Math.round(novo + antigo), atual: Math.round(atual), calculadoraOficial: Math.round((novo + antigo) * (ano === 2027 ? 1.012 : 1)) }
  })
}

/** fiscalS03 com o cenário do UI Lab aplicado (fora do Lab, o mesmo de sempre). */
export function fiscalS03(p: PerfilS03): FiscalS03 {
  return comCenarioPor('fiscalS03' + ':' + JSON.stringify(p ?? null), () => fiscalS03Base(p))
}

/** contabilS03 com o cenário do UI Lab aplicado (fora do Lab, o mesmo de sempre). */
export function contabilS03(p: PerfilS03): ContabilS03 {
  return comCenarioPor('contabilS03' + ':' + JSON.stringify(p ?? null), () => contabilS03Base(p))
}

/** consultoriaS03 com o cenário do UI Lab aplicado (fora do Lab, o mesmo de sempre). */
export function consultoriaS03(p: PerfilS03): ConsultoriaS03 {
  return comCenarioPor('consultoriaS03' + ':' + JSON.stringify(p ?? null), () => consultoriaS03Base(p))
}

/** cenariosReforma com o cenário do UI Lab aplicado (fora do Lab, o mesmo de sempre). */
export function cenariosReforma(p: PerfilS03, margem = 0.3) {
  return comCenarioPor('cenariosReforma' + ':' + JSON.stringify(p ?? null) + ':' + JSON.stringify(margem ?? null), () => cenariosReformaBase(p, margem))
}

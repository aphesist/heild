import { createHash, randomUUID } from 'node:crypto'
import {
  comEscritorio,
  conectar,
  contextoDePessoa,
  criarProcessos,
  FornecedorDemonstracao,
  type ConfigModelos,
  type ContextoExec,
  type OpcoesProcessos,
  type Sql,
} from '@heild/processos'
import { ConectorSpedSimulado } from '../../processos/testes/ambiente.ts'
import { extensaoIntegrantes, instalarIntegrantes, procedimentosDosIntegrantes, type OpcoesExtensao } from '../src/index.ts'

export const URL_BANCO = process.env.DATABASE_URL ?? 'postgres://postgres@127.0.0.1:54329/heild_b3_teste'
export const sqlAdmin = (url = URL_BANCO) => conectar(url, 6)
export { ConectorSpedSimulado }

export const SETORES: [string, string][] = [
  ['contabil', 'Contábil'],
  ['fiscal', 'Fiscal'],
  ['dp', 'DP'],
  ['societario', 'Societário'],
  ['gestao_atendimento', 'Gestão e Atendimento'],
]

export interface Semente {
  esc: string
  cliente: string
  cnpj: string
}

/** Um escritório isolado por teste, com os cinco setores do Contábil, pessoas, integrantes e bolsas. */
export async function semear(sql: Sql, o: { bolsa_centavos?: number; bolsa_assistente?: number; bolsa_piloto?: number; executa_sozinho?: string[] } = {}): Promise<Semente> {
  const esc = `esc-${randomUUID().slice(0, 8)}`
  const cnpj = `${Math.floor(10_000_000 + Math.random() * 89_999_999)}000190`
  await sql`insert into escritorio (id, escritorio_id, razao_social, nome_fantasia, cnpj, carteira_ligada) values (${esc}, ${esc}, 'Escritório Teste Ltda', 'Escritório Teste', ${esc}, false)`
  await sql`insert into assinatura (escritorio_id, dono_tipo, dono_id, plano, modulos, vigente_de) values (${esc}, 'escritorio', ${esc}, 'pro', ${['painel', 'agentes', 'arquivos', 'crm']}, '2026-01-01')`
  for (const [id, nome] of SETORES) await sql`insert into setor (escritorio_id, id, codigo, nome_padrao, nome_exibido, tem_equipe) values (${esc}, ${id}, ${id}, ${nome}, ${nome}, true)`
  const todos = SETORES.map(([s]) => [s, 'execucao'] as [string, string])
  const pessoas: [string, string, string, [string, string][]][] = [
    ['u-admin', 'Administradora', 'administrador', []],
    ['u-gestora', 'Gestora', 'gestor', SETORES.map(([s]) => [s, 'gestao'] as [string, string])],
    ['u-ana', 'Ana', 'colaborador', todos],
    ['u-bruno', 'Bruno', 'colaborador', todos],
    ['u-fiscal', 'Fábio', 'colaborador', [['fiscal', 'execucao']]],
    ['u-dp', 'Dora', 'colaborador', [['dp', 'execucao']]],
  ]
  for (const [id, nome, papel, vinculos] of pessoas) {
    await sql`insert into usuario (escritorio_id, id, pessoa_id, nome, papel, email_login, situacao) values (${esc}, ${id}, ${'p-' + id}, ${nome}, ${papel}, ${id + '@teste.invalid'}, 'ativo')`
    for (const [setor, modo] of vinculos) await sql`insert into vinculo_setor (escritorio_id, usuario_id, setor_id, modo, vigente_de) values (${esc}, ${id}, ${setor}, ${modo}, '2026-01-01')`
  }
  await sql`insert into cliente (escritorio_id, id, tipo, codigo, documento, nome, estado_ciclo, estado_ciclo_desde, regime)
            values (${esc}, 'c-1', 'pj', '001', ${cnpj}, 'Padaria Exemplo Ltda', 'ativo', '2024-01-01', 'presumido')`
  for (let m = 1; m <= 12; m++)
    await sql`insert into competencia_contabil (escritorio_id, cliente_id, competencia, situacao) values (${esc}, 'c-1', ${`2025-${String(m).padStart(2, '0')}`}, 'fechada')`
  const saldo = o.bolsa_centavos ?? 1000
  await instalarIntegrantes(sql, esc, { bolsas: { ...Object.fromEntries(SETORES.map(([s]) => [s, saldo])), assistente: o.bolsa_assistente ?? saldo, piloto: o.bolsa_piloto ?? saldo } })
  for (const p of o.executa_sozinho ?? []) await sql`insert into procedimento_config (escritorio_id, procedimento_id, executa_sozinho) values (${esc}, ${p}, true)`
  return { esc, cliente: 'c-1', cnpj }
}

export async function documento(sql: Sql, s: Semente, tipo: string, metadados: Record<string, unknown>) {
  const id = `d-${randomUUID().slice(0, 8)}`
  await sql`insert into documento (escritorio_id, id, cliente_id, tipo, nome_arquivo, mime, hash_sha256, origem, backend_id, metadados)
            values (${s.esc}, ${id}, ${s.cliente}, ${tipo}, ${id + '.pdf'}, 'application/pdf', ${createHash('sha256').update(id).digest('hex')}, 'whatsapp', 'plataforma', ${sql.json(metadados as never)})`
  return id
}

export const pessoa = (sql: Sql, esc: string, usuario: string, origem: ContextoExec['origem'] = 'chat') => comEscritorio(sql, esc, (tx) => contextoDePessoa(tx, esc, usuario, origem))

export async function esperar<T>(ler: () => Promise<T>, ok: (v: T) => boolean, ms = 30_000): Promise<T> {
  const fim = Date.now() + ms
  let v = await ler()
  while (!ok(v)) {
    if (Date.now() > fim) throw new Error(`Tempo esgotado esperando condição. Último valor: ${JSON.stringify(v)}`)
    await new Promise((r) => setTimeout(r, 100))
    v = await ler()
  }
  return v
}

const normal = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
const conteudo = (x: unknown) => (typeof x === 'string' ? x : ((x as { conteudo?: string })?.conteudo ?? ''))

/**
 * Operário simulado: determinístico, respeita os contratos e acerta o gabarito por regras simples
 * (só serve para exercitar o caminho; quem mede acerto de verdade é o roteiro real).
 */
export const RESPOSTAS_SIMULADAS: Record<string, (e: any) => unknown> = {
  'ctb.competencia.escolher': (e: { candidatas: string[]; trecho: unknown }) => {
      const refs = [...conteudo(e.trecho).matchAll(/(?<![\d/])(\d{2})\/(\d{4})(?!\d)/g)]
      const comp = refs[0] ? `${refs[0][2]}-${refs[0][1]}` : e.candidatas[0]
      return { competencia: e.candidatas.includes(comp!) ? comp : e.candidatas[0], confianca: refs.length === 1 ? 0.95 : 0.4, motivo: 'Referência no texto.' }
  },
  'ctb.ecd.apontar_atencao': (e: { contas_atipicas: { conta_codigo: string }[] }) => ({
      apontamentos: e.contas_atipicas.slice(0, 10).map((c) => ({ conta_codigo: c.conta_codigo, motivo: 'Variação forte no ano; conferir.' })),
  }),
  'fis.guia.identificar': (e: { tributos: string[]; competencias: string[]; trecho: unknown }) => {
      const texto = conteudo(e.trecho)
      const comData = /apura[çc][ãa]o:? (\d{2})\/(\d{2})\/(\d{4})/i.exec(texto)
      const soMes = /apura[çc][ãa]o:? (\d{2})\/(\d{4})(?!\d)/i.exec(texto)
      const comp = comData ? `${comData[3]}-${comData[2]}` : soMes ? `${soMes[2]}-${soMes[1]}` : e.competencias[0]
      const tributo = e.tributos.length === 1 ? e.tributos[0] : e.tributos.find((t) => texto.includes(t)) ?? e.tributos[0]
      return { tributo, competencia: comp ?? '2026-10', confianca: e.tributos.length <= 2 ? 0.95 : 0.5, motivo: 'Tributo e período no texto.' }
  },
  'fis.caixa_postal.classificar': (e: { prazos: string[]; trecho: unknown }) => {
      const t = normal(conteudo(e.trecho))
      const categoria = t.includes('intima') ? 'intimacao' : t.includes('exclus') ? 'exclusao_simples' : t.includes('malha') ? 'malha' : t.includes('cobranca') ? 'cobranca' : 'informativo'
      return { categoria, prazo: categoria === 'informativo' ? null : (e.prazos.at(-1) ?? null), confianca: 0.95, motivo: 'Assunto da mensagem.' }
  },
  'dp.evento.classificar': (e: { competencias: string[]; quantidades: string[]; trecho: unknown }) => {
      const t = normal(conteudo(e.trecho))
      const eventos = [t.includes('hora') && 'hora_extra', t.includes('falt') && 'falta', t.includes('adiantamento') && 'adiantamento', t.includes('ferias') && 'ferias'].filter(Boolean) as string[]
      const tipo = eventos[0] ?? 'outro'
      return { tipo_evento: tipo, competencia: e.competencias[0] ?? '2026-10', quantidade: tipo === 'ferias' ? null : (e.quantidades[0] ?? null), confianca: eventos.length === 1 ? 0.95 : 0.3, motivo: 'Evento no pedido.' }
  },
  'soc.alteracao.classificar': (e: { trecho: unknown }) => {
      const t = normal(conteudo(e.trecho))
      const tipo = t.includes('endereco') ? 'endereco' : t.includes('entrar') || t.includes('entrada') ? 'entrada_socio' : t.includes('capital') ? 'capital_social' : t.includes('atividade') ? 'atividade' : 'outro'
      return { tipo_alteracao: tipo, confianca: 0.95, motivo: 'Pedido do cliente.' }
  },
  'ges.faq.escolher': (e: { opcoes: { id: string }[] }) => {
      const primeira = e.opcoes.find((o) => o.id !== 'nenhuma')
      return { faq_id: primeira?.id ?? 'nenhuma', confianca: 0.95, motivo: 'Mesma pergunta.' }
  },
  'revisor.ato_irreversivel': () => ({ decisao: 'aprova', motivo: 'Decisão coerente com as evidências.' }),
  'assistente.rotear': (e: { pedido: unknown; opcoes: { id: string; descricao: string }[] }) => {
      const t = normal(conteudo(e.pedido))
      const mapa: [RegExp, string][] = [[/horario|pagamento|sabado/, 'DP-EVENTO-FOLHA'], [/junta|rua|contrato/, 'SOC-ALTERACAO-TRIAR'], [/abertos|horas voces|texto padrao/, 'GES-FAQ-RESPONDER']]
      const achado = mapa.find(([r]) => r.test(t))?.[1]
      if (!achado || !e.opcoes.some((o) => o.id === achado)) return { procedimento: e.opcoes[0]!.id, confianca: 0.3, ambiguo: true, motivo: 'Pedido vago.' }
      return { procedimento: achado, confianca: 0.95, ambiguo: false, motivo: 'Assunto do pedido.' }
  },
}

export function fornecedorSimulado() {
  const f = new FornecedorDemonstracao()
  for (const [contrato, fn] of Object.entries(RESPOSTAS_SIMULADAS)) f.responder(contrato, fn)
  return f
}

export async function montar(o: Partial<OpcoesProcessos> & { workers?: boolean; extensao?: OpcoesExtensao; modelos?: ConfigModelos } = {}) {
  const sped = new ConectorSpedSimulado()
  const fornecedor = (o.fornecedor ?? fornecedorSimulado()) as FornecedorDemonstracao
  const ext = extensaoIntegrantes({ aguardar_ms: 0, ...o.extensao })
  const p = await criarProcessos({
    url: URL_BANCO,
    fornecedor,
    conectores: { sped },
    procedimentos: procedimentosDosIntegrantes,
    filas: { esperaInicialSegundos: 1 },
    extensoes: [ext],
    ...o,
  })
  if (o.workers !== false) await p.iniciarWorkers({ intervalo: 0.5, concorrenciaOperarios: 12, concorrenciaPassos: 8 })
  return { ...p, sped, fornecedor, assistente: ext.assistente! }
}

export async function lerExecucao(sql: Sql, esc: string, id: string) {
  return comEscritorio(sql, esc, async (tx) => (await tx`select * from execucao where id = ${id}`)[0] as Record<string, any> & { estado: string })
}

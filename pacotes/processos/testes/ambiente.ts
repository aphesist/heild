import { createHash, randomUUID } from 'node:crypto'
import {
  ErroRegra,
  FornecedorDemonstracao,
  comEscritorio,
  conectar,
  contextoDeIntegrante,
  contextoDePessoa,
  criarProcessos,
  type Conector,
  type ContextoExec,
  type OpcoesProcessos,
  type Sql,
} from '../src/index.ts'

export const URL_BANCO = process.env.DATABASE_URL ?? 'postgres://postgres@127.0.0.1:54329/heild_b2'

/** Conector SPED simulado (os conectores reais são de uma sessão futura). Guarda o que "chegou ao órgão". */
export class ConectorSpedSimulado implements Conector {
  readonly recebidos = new Map<string, { recibo: string; argumentos: Record<string, unknown> }>()
  envios = 0
  consultas = 0
  falharAntesDeEnviar = 0
  falharDepoisDeEnviar = 0
  recusar: string | null = null
  atraso_ms = 0

  async executar(_metodo: string, argumentos: Record<string, unknown>, o: { chave: string; escritorio_id: string }) {
    const chave = `${o.escritorio_id}|${o.chave}`
    if (this.atraso_ms) await new Promise((r) => setTimeout(r, this.atraso_ms))
    if (this.recusar) throw new ErroRegra('RECUSADO_PELO_ORGAO', this.recusar)
    if (this.falharAntesDeEnviar > 0) {
      this.falharAntesDeEnviar--
      throw new Error('Conexão recusada pelo órgão (simulado).')
    }
    if (this.recebidos.has(chave)) throw new Error(`DUPLICADO no órgão: ${chave}`)
    this.envios++
    const recibo = `REC-${createHash('sha1').update(chave).digest('hex').slice(0, 10).toUpperCase()}`
    this.recebidos.set(chave, { recibo, argumentos })
    if (this.falharDepoisDeEnviar > 0) {
      this.falharDepoisDeEnviar--
      throw new Error('Tempo esgotado esperando o recibo (simulado: o envio chegou).')
    }
    return { recibo }
  }

  async consultar(_metodo: string, chave: string, o: { escritorio_id: string }) {
    this.consultas++
    const r = this.recebidos.get(`${o.escritorio_id}|${chave}`)
    return r ? { recibo: r.recibo } : null
  }
}

const mes = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' }).slice(0, 7)

export interface Semente {
  esc: string
  cliente: string
  cnpj: string
}

/** Um escritório novo e isolado por teste: setores, pessoas, integrante, cliente, bolsa e competências. */
export async function semear(sql: Sql, o: { bolsa_centavos?: number; carteira_ligada?: boolean } = {}): Promise<Semente> {
  const esc = `esc-${randomUUID().slice(0, 8)}`
  const cnpj = `${Math.floor(10_000_000 + Math.random() * 89_999_999)}000190`
  await sql`insert into escritorio (id, escritorio_id, razao_social, nome_fantasia, cnpj, carteira_ligada) values (${esc}, ${esc}, 'Escritório Teste Ltda', 'Escritório Teste', ${esc}, ${o.carteira_ligada ?? false})`
  await sql`insert into assinatura (escritorio_id, dono_tipo, dono_id, plano, modulos, vigente_de) values (${esc}, 'escritorio', ${esc}, 'pro', ${['painel', 'agentes', 'arquivos']}, '2026-01-01')`
  for (const [id, nome] of [['contabil', 'Contábil'], ['fiscal', 'Fiscal']]) {
    await sql`insert into setor (escritorio_id, id, codigo, nome_padrao, nome_exibido, tem_equipe) values (${esc}, ${id}, ${id}, ${nome}, ${nome}, true)`
  }
  const pessoas: [string, string, string, [string, string][]][] = [
    ['u-admin', 'Administradora', 'administrador', []],
    ['u-gestora', 'Gestora Contábil', 'gestor', [['contabil', 'gestao']]],
    ['u-ana', 'Ana', 'colaborador', [['contabil', 'execucao']]],
    ['u-bruno', 'Bruno', 'colaborador', [['contabil', 'execucao']]],
    ['u-fiscal', 'Fábio Fiscal', 'colaborador', [['fiscal', 'execucao']]],
  ]
  for (const [id, nome, papel, vinculos] of pessoas) {
    await sql`insert into usuario (escritorio_id, id, pessoa_id, nome, papel, email_login, situacao) values (${esc}, ${id}, ${'p-' + id}, ${nome}, ${papel}, ${id + '@teste.invalid'}, 'ativo')`
    for (const [setor, modo] of vinculos)
      await sql`insert into vinculo_setor (escritorio_id, usuario_id, setor_id, modo, vigente_de) values (${esc}, ${id}, ${setor}, ${modo}, '2026-01-01')`
  }
  await sql`insert into integrante (escritorio_id, id, tipo, setor, nome_exibido, canal_aviso, situacao) values (${esc}, 'i-contabil', 'padrao_setor', 'contabil', 'Contábil', 'chat', 'ativo')`
  await sql`insert into cliente (escritorio_id, id, tipo, codigo, documento, nome, estado_ciclo, estado_ciclo_desde, regime)
            values (${esc}, 'c-1', 'pj', '001', ${cnpj}, 'Padaria Exemplo Ltda', 'ativo', '2024-01-01', 'presumido')`
  await sql`insert into bolsa_setor (escritorio_id, setor, mes, saldo_centavos) values (${esc}, 'contabil', ${mes()}, ${o.bolsa_centavos ?? 1000})`
  for (let m = 1; m <= 12; m++)
    await sql`insert into competencia_contabil (escritorio_id, cliente_id, competencia, situacao) values (${esc}, 'c-1', ${`2025-${String(m).padStart(2, '0')}`}, 'fechada')`
  return { esc, cliente: 'c-1', cnpj }
}

export interface ContaEcd {
  codigo: string
  nome: string
  natureza: 'D' | 'C'
  saldo_inicial_centavos: number
  debitos_centavos: number
  creditos_centavos: number
  saldo_final_centavos: number
}

/** Uma ECD lida (o worker de documento já extraiu os saldos). `quebrar` gera o erro pedido. */
export function ecd(cnpj: string, o: { quebrar?: 'partidas' | 'cnpj' | 'saldo'; sem_atipicas?: boolean; plantar_adiantamento?: boolean } = {}) {
  const contas: ContaEcd[] = [
    { codigo: '1.1.01', nome: 'Caixa', natureza: 'D', saldo_inicial_centavos: 1_000_000, debitos_centavos: 5_000_000, creditos_centavos: 4_000_000, saldo_final_centavos: 2_000_000 },
    { codigo: '1.1.02', nome: 'Bancos', natureza: 'D', saldo_inicial_centavos: 5_000_000, debitos_centavos: 3_000_000, creditos_centavos: 2_500_000, saldo_final_centavos: 5_500_000 },
    { codigo: '2.1.01', nome: 'Fornecedores', natureza: 'C', saldo_inicial_centavos: 2_000_000, debitos_centavos: 1_500_000, creditos_centavos: 2_000_000, saldo_final_centavos: 2_500_000 },
    { codigo: '3.1.01', nome: 'Receita de vendas', natureza: 'C', saldo_inicial_centavos: 0, debitos_centavos: 0, creditos_centavos: 5_000_000, saldo_final_centavos: 5_000_000 },
    { codigo: '4.1.01', nome: 'Custo das mercadorias', natureza: 'D', saldo_inicial_centavos: 4_000_000, debitos_centavos: 4_000_000, creditos_centavos: 0, saldo_final_centavos: 8_000_000 },
  ]
  if (o.sem_atipicas) for (const c of contas) Object.assign(c, { saldo_inicial_centavos: c.saldo_inicial_centavos + 100_000_000, saldo_final_centavos: c.saldo_final_centavos + 100_000_000 })
  if (o.plantar_adiantamento) {
    // Adiantamento a sócios que sobe 900% no ano, pago pelo banco: a anomalia que o gabarito exige apontar.
    contas.push({ codigo: '1.1.05', nome: 'Adiantamento a sócios', natureza: 'D', saldo_inicial_centavos: 100_000, debitos_centavos: 900_000, creditos_centavos: 0, saldo_final_centavos: 1_000_000 })
    Object.assign(contas[1]!, { creditos_centavos: contas[1]!.creditos_centavos + 900_000, saldo_final_centavos: contas[1]!.saldo_final_centavos - 900_000 })
  }
  if (o.quebrar === 'saldo') contas[0]!.saldo_final_centavos += 1
  const d = contas.reduce((a, c) => a + c.debitos_centavos, 0)
  const k = contas.reduce((a, c) => a + c.creditos_centavos, 0)
  return {
    cnpj: o.quebrar === 'cnpj' ? '99999999000199' : cnpj,
    exercicio: '2025',
    contas,
    total_debitos_centavos: d,
    total_creditos_centavos: o.quebrar === 'partidas' ? k + 100 : k,
  }
}

export async function documentoEcd(sql: Sql, s: Semente, o: Parameters<typeof ecd>[1] = {}) {
  const id = `d-${randomUUID().slice(0, 8)}`
  const dados = ecd(s.cnpj, o)
  await sql`insert into documento (escritorio_id, id, cliente_id, tipo, competencia, nome_arquivo, mime, hash_sha256, origem, backend_id, metadados)
            values (${s.esc}, ${id}, ${s.cliente}, 'ecd', '2025-12', 'ecd-2025.txt', 'text/plain', ${createHash('sha256').update(id + JSON.stringify(dados)).digest('hex')},
            'upload', 'plataforma', ${sql.json({ ecd: dados } as never)})`
  return id
}

export async function documentoSimples(sql: Sql, s: Semente, o: { tipo: string; metadados: Record<string, unknown> }) {
  const id = `d-${randomUUID().slice(0, 8)}`
  await sql`insert into documento (escritorio_id, id, cliente_id, tipo, nome_arquivo, mime, hash_sha256, origem, backend_id, metadados)
            values (${s.esc}, ${id}, ${s.cliente}, ${o.tipo}, ${id + '.pdf'}, 'application/pdf', ${createHash('sha256').update(id).digest('hex')}, 'whatsapp', 'plataforma', ${sql.json(o.metadados as never)})`
  return id
}

export const pessoa = (sql: Sql, esc: string, usuario: string, origem: ContextoExec['origem'] = 'chat') => comEscritorio(sql, esc, (tx) => contextoDePessoa(tx, esc, usuario, origem))
export const integrante = (sql: Sql, esc: string, dono: string | null = null, origem: ContextoExec['origem'] = 'chat') =>
  comEscritorio(sql, esc, (tx) => contextoDeIntegrante(tx, esc, 'i-contabil', origem, dono))

/** Espera uma condição (fila assíncrona); falha com o último valor visto. */
export async function esperar<T>(ler: () => Promise<T>, ok: (v: T) => boolean, ms = 20_000): Promise<T> {
  const fim = Date.now() + ms
  let v = await ler()
  while (!ok(v)) {
    if (Date.now() > fim) throw new Error(`Tempo esgotado esperando condição. Último valor: ${JSON.stringify(v)}`)
    await new Promise((r) => setTimeout(r, 100))
    v = await ler()
  }
  return v
}

export function fornecedorPadrao() {
  return new FornecedorDemonstracao()
    .responder('ctb.ecd.apontar_atencao', (e: { contas_atipicas: { conta_codigo: string }[] }) => ({
      apontamentos: e.contas_atipicas.slice(0, 2).map((c) => ({ conta_codigo: c.conta_codigo, motivo: 'Variação forte no ano; conferir lançamentos de fechamento.' })),
    }))
    .responder('ctb.competencia.escolher', (e: { candidatas: string[] }) => ({ competencia: e.candidatas[0], confianca: 0.95, motivo: 'Data de referência no corpo do recibo.' }))
}

export async function montar(o: Partial<OpcoesProcessos> & { sped?: ConectorSpedSimulado; workers?: boolean } = {}) {
  const sped = o.sped ?? new ConectorSpedSimulado()
  const fornecedor = o.fornecedor ?? fornecedorPadrao()
  const p = await criarProcessos({ url: URL_BANCO, fornecedor, conectores: { sped }, filas: { esperaInicialSegundos: 1, ...o.filas }, ...o })
  if (o.workers !== false) await p.iniciarWorkers({ intervalo: 0.5 })
  return { ...p, sped, fornecedor: fornecedor as FornecedorDemonstracao }
}

export const sqlAdmin = () => conectar(URL_BANCO, 4)

export async function contar(sql: Sql, tabela: string, onde: Record<string, unknown>) {
  const chaves = Object.keys(onde)
  const cond = chaves.map((k, i) => `${k} = $${i + 1}`).join(' and ')
  const [r] = await sql.unsafe(`select count(*)::int as n from ${tabela} where ${cond}`, Object.values(onde) as never[])
  return r!.n as number
}

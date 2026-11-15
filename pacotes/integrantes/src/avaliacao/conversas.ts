import { comEscritorio, type ContextoExec, type Motor, type Sql } from '@heild/processos'
import { problemasDeEscopo, problemasDeEstilo } from '../setores/triagem-conversa.ts'
import { EXPEDIENTE, type CasoConversa } from './gabarito-conversas.ts'

/**
 * Avaliação da triagem v3 por CONVERSA (várias execuções, uma por mensagem do cliente). Roda de
 * verdade num escritório de avaliação (não em sombra: a fala do integrante precisa ficar na conversa
 * para a próxima troca), pago pela bolsa do setor desse escritório.
 *
 * Mede, por conversa: o final (setor, pessoa, cartão, fora do horário), o acerto, as perguntas até
 * rotear, o custo, a latência e o tom (as falas conferidas de novo contra as regras de estilo e escopo,
 * além das escaladas que essas regras já provocaram).
 */

export interface AmbienteConversa {
  sql: Sql
  motor: Motor
  escritorio_id: string
  ctx: ContextoExec
}

export interface LinhaConversa {
  caso: string
  grupo: CasoConversa['grupo']
  rodada: number
  esperado: string
  obtido: string
  acerto: boolean
  /** Repassou a um setor errado, ou repassou quando devia chamar uma pessoa ou só responder fora do horário. */
  erro_critico: boolean
  falas_cliente: number
  perguntas: number
  falas_integrante: string[]
  falas_fora_do_tom: number
  falas_fora_do_escopo: number
  escaladas: number
  chamadas: number
  centavos: number
  latencia_ms: number
  execucoes: string[]
}

const SETORES = ['contabil', 'fiscal', 'dp', 'societario', 'gestao_atendimento']

export function classificarConversa(c: CasoConversa, obtido: string): { acerto: boolean; erro_critico: boolean } {
  const aceitos: string[] = [c.esperado, ...(c.aceitos ?? [])]
  const [tipo, setorDaPessoa] = obtido.split(':')
  const acerto = aceitos.includes(obtido) || (tipo === 'pessoa' && (aceitos.includes('pessoa') || (!!setorDaPessoa && aceitos.includes(setorDaPessoa))))
  // Erro crítico: agir errado com o cliente (repassar ao setor errado, ou repassar quando devia chamar
  // alguém ou não atender). Cartão, pessoa ou conversa sem fim não são críticos: ninguém agiu errado.
  const erro_critico = !acerto && (SETORES.includes(obtido) || (tipo === 'pessoa' && !!setorDaPessoa && SETORES.includes(c.esperado)))
  return { acerto, erro_critico }
}

async function preparar(a: AmbienteConversa, c: CasoConversa): Promise<string> {
  return comEscritorio(a.sql, a.escritorio_id, async (tx) => {
    const sufixo = Math.random().toString(36).slice(2, 10)
    let cliente: string | null = null
    if (!c.desconhecido) {
      const [cli] = await tx`insert into cliente (escritorio_id, tipo, codigo, documento, nome, estado_ciclo, estado_ciclo_desde, regime)
                             values (${a.escritorio_id}, 'pj', ${`cv-${sufixo}`}, ${`cv-${sufixo}`}, ${`Cliente ${c.id}`}, 'ativo', '2024-01-01', 'simples') returning id`
      cliente = cli!.id as string
    }
    if (c.aberta)
      await tx`insert into conversa (escritorio_id, cliente_id, setor_id, status, canal_resposta_atual, ultima_mensagem_em, etiquetas)
               values (${a.escritorio_id}, ${cliente}, ${c.aberta}, 'em_atendimento', 'whatsapp', now() - interval '1 hour', array['triada'])`
    const [cv] = await tx`insert into conversa (escritorio_id, cliente_id, setor_id, status, canal_resposta_atual, ultima_mensagem_em)
                          values (${a.escritorio_id}, ${cliente}, 'gestao_atendimento', 'nova', 'whatsapp', now()) returning id`
    return cv!.id as string
  })
}

const TERMINAL = ['concluida', 'aguardando_cartao', 'falhou', 'cancelada', 'parcial']

async function esperarExecucao(a: AmbienteConversa, id: string, ms = 180_000) {
  const fim = Date.now() + ms
  for (;;) {
    const [ex] = await comEscritorio(a.sql, a.escritorio_id, (tx) => tx`select * from execucao where id = ${id}`)
    if (ex && TERMINAL.includes(ex.estado)) return ex as Record<string, any>
    if (Date.now() > fim) throw new Error(`Execução ${id} não terminou a tempo (${ex?.estado}).`)
    await new Promise((r) => setTimeout(r, 150))
  }
}

/** Uma conversa inteira: o cliente fala pelo roteiro até o integrante decidir (ou o roteiro acabar). */
export async function avaliarConversa(a: AmbienteConversa, c: CasoConversa, rodada = 1): Promise<LinhaConversa> {
  const conversa_id = await preparar(a, c)
  const inicio = Date.now()
  const execucoes: string[] = []
  let obtido = 'sem_decisao'
  let falas = 0
  for (const fala of c.roteiro) {
    falas++
    await comEscritorio(a.sql, a.escritorio_id, (tx) => tx`insert into mensagem (escritorio_id, conversa_id, direcao, canal, autor_tipo, corpo, criado_em) values (${a.escritorio_id}, ${conversa_id}, 'entrada', 'whatsapp', 'pessoa', ${fala}, clock_timestamp())`)
    const { execucao_id } = await a.motor.iniciar(a.ctx, 'GES-TRIAR-REPASSAR', { conversa_id, agora: c.agora ?? EXPEDIENTE })
    execucoes.push(execucao_id)
    const ex = await esperarExecucao(a, execucao_id)
    if (ex.estado === 'concluida') {
      const acao = ex.saida?.acao as string
      if (acao === 'perguntar') continue
      // Pessoa no setor de entrada: `pessoa`; no setor do assunto: `pessoa:{setor}`.
      obtido = acao === 'repassar' ? String(ex.saida.setor) : acao === 'pessoa' && ex.saida.setor !== 'gestao_atendimento' ? `pessoa:${ex.saida.setor}` : acao
    } else obtido = ex.estado === 'aguardando_cartao' ? 'cartao' : `${ex.estado}:${ex.erro?.codigo ?? ''}`
    break
  }
  const latencia_ms = Date.now() - inicio
  const [falasIntegrante, chamadas] = await comEscritorio(a.sql, a.escritorio_id, async (tx) => [
    await tx`select corpo, extras from mensagem where conversa_id = ${conversa_id} and direcao = 'saida' and autor_tipo = 'integrante' order by criado_em`,
    await tx`select classe, centavos from chamada_modelo where execucao_id in ${tx(execucoes)}`,
  ])
  // Confere o tom de novo, sem o prefixo de quem fala (que é do sistema).
  const textos = falasIntegrante.map((m) => String(m.corpo).replace(/^\*[^*\n]+\*\n/, ''))
  const { acerto, erro_critico } = classificarConversa(c, obtido)
  return {
    caso: c.id,
    grupo: c.grupo,
    rodada,
    esperado: [c.esperado, ...(c.aceitos ?? [])].join('|'),
    obtido,
    acerto,
    erro_critico,
    falas_cliente: falas,
    perguntas: falasIntegrante.filter((m) => (m.extras as { tipo?: string })?.tipo === 'triagem_conversa').length,
    falas_integrante: textos,
    falas_fora_do_tom: textos.filter((t) => problemasDeEstilo(t).length).length,
    falas_fora_do_escopo: textos.filter((t) => problemasDeEscopo(t).length).length,
    escaladas: chamadas.filter((x) => x.classe === 'escritor').length,
    chamadas: chamadas.length,
    centavos: chamadas.reduce((t, x) => t + Number(x.centavos ?? 0), 0),
    latencia_ms,
    execucoes,
  }
}

export async function avaliarConversas(a: AmbienteConversa, casos: CasoConversa[], o: { repeticoes?: number; concorrencia?: number; aoTerminar?: (l: LinhaConversa) => void; parar?: () => boolean } = {}) {
  const fila = casos.flatMap((c) => Array.from({ length: o.repeticoes ?? 1 }, (_, i) => ({ c, rodada: i + 1 })))
  const linhas: LinhaConversa[] = []
  const trabalhador = async () => {
    for (let item = fila.shift(); item; item = fila.shift()) {
      if (o.parar?.()) return
      const l = await avaliarConversa(a, item.c, item.rodada)
      linhas.push(l)
      o.aoTerminar?.(l)
    }
  }
  await Promise.all(Array.from({ length: o.concorrencia ?? 4 }, trabalhador))
  return linhas
}

const pct = (n: number, d: number) => (d ? Math.round((n / d) * 1000) / 10 : 0)
const percentil = (xs: number[], p: number) => {
  const o = [...xs].sort((x, y) => x - y)
  return o.length ? o[Math.min(o.length - 1, Math.floor((p / 100) * o.length))]! : 0
}

export function resumirConversas(linhas: LinhaConversa[]) {
  const roteadas = linhas.filter((l) => SETORES.includes(l.obtido))
  const grupos = new Map<string, LinhaConversa[]>()
  for (const l of linhas) grupos.set(l.grupo, [...(grupos.get(l.grupo) ?? []), l])
  const porGrupo = [...grupos].map(([grupo, ls]) => ({
    grupo,
    conversas: ls.length,
    acerto_pct: pct(ls.filter((l) => l.acerto).length, ls.length),
    perguntas_media: Math.round((ls.reduce((t, l) => t + l.perguntas, 0) / ls.length) * 10) / 10,
    centavos_por_conversa: Math.round((ls.reduce((t, l) => t + l.centavos, 0) / ls.length) * 10_000) / 10_000,
  }))
  return {
    conversas: linhas.length,
    acerto_pct: pct(linhas.filter((l) => l.acerto).length, linhas.length),
    erro_critico: linhas.filter((l) => l.erro_critico).length,
    perguntas_ate_rotear_media: roteadas.length ? Math.round((roteadas.reduce((t, l) => t + l.perguntas, 0) / roteadas.length) * 10) / 10 : 0,
    perguntas_ate_rotear_max: roteadas.reduce((m, l) => Math.max(m, l.perguntas), 0),
    falas_integrante: linhas.reduce((t, l) => t + l.falas_integrante.length, 0),
    falas_fora_do_tom: linhas.reduce((t, l) => t + l.falas_fora_do_tom, 0),
    falas_fora_do_escopo: linhas.reduce((t, l) => t + l.falas_fora_do_escopo, 0),
    escaladas: linhas.reduce((t, l) => t + l.escaladas, 0),
    centavos_total: Math.round(linhas.reduce((t, l) => t + l.centavos, 0) * 10_000) / 10_000,
    centavos_por_conversa: linhas.length ? Math.round((linhas.reduce((t, l) => t + l.centavos, 0) / linhas.length) * 10_000) / 10_000 : 0,
    latencia_p50_ms: percentil(linhas.map((l) => l.latencia_ms), 50),
    latencia_p90_ms: percentil(linhas.map((l) => l.latencia_ms), 90),
    por_grupo: porGrupo,
  }
}

import type { Contexto } from '../permissoes/perfil'
import { nomesTabelas, type Fotografia, type Id, type NomeTabela, type Registro } from '../modelo/entidades'
import { classeDaTabela } from '../permissoes/leitura'
import { ErroAdaptador, type Adaptador } from './adaptador'
import type { Banco, MarcaEscrita } from './banco'
import { fotografiaVazia } from './navegador'
import { traduzirOperacao, type Traducao } from './traducao'

/**
 * Adaptador da API do backend real (branch `backend`; servidor/). Liga com
 * `VITE_HEILD_BANCO=api` e `VITE_HEILD_API_URL` (padrão http://127.0.0.1:8787).
 *
 * As telas não mudam: continuam chamando `repos.*` e lendo o banco de forma síncrona.
 * O que muda é embaixo:
 *
 * - Ler: o escritório vem de `GET /v1/sincronizar` (a RLS do servidor só entrega o da sessão).
 * - Escrever é COMANDO, não diferença de linhas: cada chamada de repositório feita pela
 *   tela (`repos.tarefas.mudarStatus(...)`) vira `{ operacao, argumentos, ids }` e vai para
 *   `POST /v1/operacoes`, onde o servidor roda o MESMO método do repositório, com a mesma
 *   `autorizar`, e grava o efeito e o evento na cadeia. A escrita que a tela faz direto
 *   numa transação (motor da demonstração, loja) vai como `linhas`, e o servidor passa
 *   cada linha pela regra da tabela.
 * - Otimista como antes: a tela já mostra a mudança; a resposta traz as linhas como
 *   ficaram gravadas e o banco reconcilia. Se o servidor recusar, o banco relê o
 *   escritório inteiro (a verdade é a do servidor) e o erro aparece no console.
 * - Os ids que a tela gerou vão junto: a linha gravada fica com o mesmo id da otimista.
 * - Fila em ordem, uma chamada por vez, com Idempotency-Key por comando: repetir depois
 *   de uma queda de rede é seguro. A fila fica no localStorage até o servidor confirmar.
 * - Sessão de demonstração: o token sai de `POST /v1/auth/demonstracao` com a pessoa que
 *   está na tela (o integrante age em nome dela; o app do cliente, com a pessoa do cliente).
 *
 * F1 (B5):
 * - Os repositórios do núcleo viram clientes das ferramentas tipadas: a chamada da tela
 *   passa pelo tradutor (`traducao.ts`) e vai para `POST /v1/ferramentas/{nome}`, com os ids
 *   gerados e a frase do evento no envelope (`heild_tela`). O que não é da F1 segue como
 *   operação. O servidor recusa o patch genérico da F1 por operação.
 * - Ler é por classe (ARQUITETURA 6.1): `GET /v1/sincronizar?classes=1,2` traz a configuração
 *   e o trabalho aberto, já filtrados pela regra de leitura; a classe 3 (evento, mensagem
 *   interna) nunca vem inteira: o cache dela é a página mais recente que a pessoa pode ver,
 *   mais o que as telas consultarem (`consultar`, usado pelo `useConsulta`).
 * - Avisos de mudança pelo SSE (`/v1/eventos/fluxo`, lido com fetch porque precisa do token):
 *   classe 1 e 2 pedem o delta (`sincronizar?desde=`); classe 3 avisa as consultas abertas.
 */

export interface ConfigApi {
  url: string
}

type AtorComando =
  | { tipo: 'pessoa'; usuario_id: string }
  | { tipo: 'integrante'; integrante_id: string; dono_usuario_id: string | null }
  | { tipo: 'pessoa_cliente'; cliente_id: string | null; nome: string }
  | { tipo: 'sistema' }

type Comando =
  | { tipo: 'ferramenta'; ferramenta: string; entrada: Record<string, unknown>; ids: { p: string; id: string }[]; texto?: string }
  | { tipo: 'operacao'; operacao: string; argumentos: unknown[]; ids: { p: string; id: string }[] }
  | { tipo: 'linhas'; gravar: { tabela: NomeTabela; linha: Registro }[]; remover: { tabela: NomeTabela; id: Id }[] }

interface ItemFila {
  escritorio: Id
  chave: string
  comando: Comando
  ator: AtorComando
}

const chaveFila = (escritorioId: Id) => `heild:fila-api:${escritorioId}`
const novaChave = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `k${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`)

function lerFila(escritorioId: Id): ItemFila[] {
  try {
    return JSON.parse(window.localStorage.getItem(chaveFila(escritorioId)) ?? '[]') as ItemFila[]
  } catch {
    return []
  }
}
function guardarFila(escritorioId: Id, fila: ItemFila[]) {
  try {
    if (fila.length) window.localStorage.setItem(chaveFila(escritorioId), JSON.stringify(fila))
    else window.localStorage.removeItem(chaveFila(escritorioId))
  } catch {
    /* sem armazenamento: a fila vale só nesta aba */
  }
}

/** Resposta de uma consulta paginada (ferramenta de lista). */
export interface PaginaConsulta {
  linhas: Registro[]
  totais: Record<string, number>
  cursor: string | null
  haMais: boolean
  total: number
}

const rotuloDe = (c: Comando) => (c.tipo === 'ferramenta' ? c.ferramenta : c.tipo === 'operacao' ? c.operacao : 'linhas')

/** O que o adaptador expõe além do Adaptador (para a captura instalada pelos repositórios e para o useConsulta). */
export interface AdaptadorApi extends Adaptador {
  nome: 'api'
  enfileirar(escritorio: Id, comando: Comando, ator: AtorComando): void
  /** Uma página de uma ferramenta de lista, como a pessoa da tela; as linhas entram no cache da classe 3. */
  consultar(ferramenta: string, entrada: Record<string, unknown>): Promise<PaginaConsulta>
  /** Avisa quando chega mudança de uma tabela da classe 3 (o useConsulta relê a primeira página). */
  aoMudarConsulta(ouvinte: (tabela: NomeTabela) => void): () => void
  /** Quem lê agora (a pessoa da tela), para o token das consultas e do SSE. */
  definirLeitor(quem: () => AtorComando): void
}

/** Ferramenta de lista de cada tabela da classe 3 (a que o useConsulta e o aquecimento usam). */
export const LISTA_DA_TABELA: Partial<Record<NomeTabela, string>> = { evento: 'evento.listar', mensagem_interna: 'mensagem_interna.listar' }
/** Quanto da classe 3 já vem ao abrir: a página mais recente, por tabela (o resto, por consulta). */
const AQUECER_PAGINAS = 5

export function adaptadorApi(config: ConfigApi): AdaptadorApi {
  const base = config.url.replace(/\/$/, '')
  const tokens = new Map<string, Promise<string>>()
  /** Última pessoa da equipe de cada escritório (age pelo "Sistema" do motor da demonstração). */
  const ultimaPessoa = new Map<Id, string>()
  let corrente: Promise<void> = Promise.resolve()
  const recusas: string[] = []
  const geracao = new Map<Id, number>()
  let banco: Banco | null = null
  /** Última versão sincronizada de cada escritório (para o delta). */
  const versoes = new Map<Id, number>()
  const ouvintesConsulta = new Set<(tabela: NomeTabela) => void>()
  let leitor: (() => AtorComando) | null = null
  let fluxo: { chave: string; parar: () => void } | null = null

  const chamar = async (metodo: 'GET' | 'POST', caminho: string, corpo?: unknown, cabecalhos: Record<string, string> = {}) => {
    const r = await fetch(`${base}${caminho}`, { method: metodo, headers: { ...(corpo !== undefined ? { 'content-type': 'application/json' } : {}), ...cabecalhos }, body: corpo !== undefined ? JSON.stringify(corpo) : undefined, keepalive: metodo === 'POST' && JSON.stringify(corpo ?? '').length < 60_000 })
    const texto = await r.text()
    let json: unknown = null
    try {
      json = texto ? JSON.parse(texto) : null
    } catch {
      json = { mensagem: texto }
    }
    return { status: r.status, json: json as Record<string, unknown> }
  }

  /** Token de demonstração para quem age (cacheado por pessoa). */
  const token = (escritorio: Id, ator: AtorComando): Promise<string> => {
    const pedido =
      ator.tipo === 'pessoa'
        ? { escritorio_id: escritorio, usuario_id: ator.usuario_id }
        : ator.tipo === 'integrante' && ator.dono_usuario_id
          ? { escritorio_id: escritorio, usuario_id: ator.dono_usuario_id }
          : ator.tipo === 'pessoa_cliente' && ator.cliente_id
            ? { escritorio_id: escritorio, cliente_id: ator.cliente_id }
            : ultimaPessoa.get(escritorio)
              ? { escritorio_id: escritorio, usuario_id: ultimaPessoa.get(escritorio)! }
              : { escritorio_id: escritorio, papel: 'administrador' }
    const k = JSON.stringify(pedido)
    let t = tokens.get(k)
    if (!t) {
      t = chamar('POST', '/v1/auth/demonstracao', pedido).then((r) => {
        if (r.status !== 200) {
          tokens.delete(k)
          throw Object.assign(new ErroAdaptador('api', `Não entrou na API (${r.status}): ${String(r.json?.mensagem ?? '')}`), { status: r.status })
        }
        return String(r.json.token)
      })
      tokens.set(k, t)
    }
    return t
  }

  // Integrante age sempre como integrante, em nome do dono; sem dono no contexto (motor da
  // demonstração), em nome da pessoa da sessão. O servidor faz a interseção (R4).
  const cabecalhosDe = async (escritorio: Id, ator: AtorComando) => ({
    authorization: `Bearer ${await token(escritorio, ator)}`,
    ...(ator.tipo === 'integrante' ? { 'x-heild-integrante': ator.integrante_id } : {}),
  })

  const paraFotografia = (tabelas: Partial<Record<NomeTabela, Registro[]>>): Fotografia => {
    const foto = fotografiaVazia()
    for (const t of nomesTabelas) if (tabelas[t]) (foto as Record<string, Registro[]>)[t] = tabelas[t] as Registro[]
    return foto
  }

  /** Manda a fila do escritório, em ordem. O que o servidor confirmou sai; o recusado sai e é anotado. */
  const enviarFila = async (escritorio: Id) => {
    const minha = geracao.get(escritorio) ?? 0
    for (;;) {
      const fila = lerFila(escritorio)
      const item = fila[0]
      if (!item || (geracao.get(escritorio) ?? 0) !== minha) return
      let r: { status: number; json: Record<string, unknown> }
      const c = item.comando
      try {
        const cabecalhos = { ...(await cabecalhosDe(escritorio, item.ator)), 'idempotency-key': item.chave }
        r =
          c.tipo === 'ferramenta'
            ? await chamar('POST', `/v1/ferramentas/${c.ferramenta}`, { ...c.entrada, heild_tela: { ids: c.ids, ...(c.texto !== undefined ? { texto: c.texto } : {}) } }, cabecalhos)
            : await chamar('POST', '/v1/operacoes', { comando: c }, cabecalhos)
      } catch (e) {
        // Login recusado (conta inativa, escritório errado) não é rede: o comando é recusado
        // e sai da fila, senão travaria todos os seguintes.
        const status = (e as { status?: number }).status
        if (status && status >= 400 && status < 500) {
          guardarFila(escritorio, lerFila(escritorio).filter((x) => x.chave !== item.chave))
          recusas.push(`${rotuloDe(item.comando)}: ${e instanceof Error ? e.message : String(e)}`)
          continue
        }
        // Rede: fica na fila (mesma chave) para a próxima tentativa.
        throw new ErroAdaptador('api', `Sem resposta da API: ${e instanceof Error ? e.message : String(e)}`)
      }
      if (r.status >= 500) throw new ErroAdaptador('api', `A API falhou (${r.status}): ${String(r.json?.mensagem ?? '')}`)
      guardarFila(escritorio, lerFila(escritorio).filter((x) => x.chave !== item.chave))
      if (r.status === 200 || r.status === 202) {
        const linhas = (r.json.linhas ?? {}) as Record<string, Registro[]>
        const removidas = (r.json.removidas ?? {}) as Record<string, string[]>
        if (banco && banco.escritorioId === escritorio && (geracao.get(escritorio) ?? 0) === minha)
          banco.aplicarDoServidor(
            Object.entries(linhas).flatMap(([tabela, ls]) => ls.map((linha) => ({ tabela: tabela as NomeTabela, linha }))),
            Object.entries(removidas).flatMap(([tabela, ids]) => ids.map((id) => ({ tabela: tabela as NomeTabela, id }))),
          )
      } else {
        recusas.push(`${rotuloDe(item.comando)}: ${String(r.json?.codigo ?? r.status)} · ${String(r.json?.mensagem ?? '')}`)
      }
    }
  }

  const emSerie = (f: () => Promise<void>): Promise<void> => {
    const p = corrente.then(f, f)
    corrente = p.catch(() => undefined)
    return p
  }

  const atorLeitor = (): AtorComando => leitor?.() ?? { tipo: 'sistema' }

  /** Uma página de ferramenta de lista, como quem está na tela. */
  const pagina = async (escritorio: Id, ferramenta: string, entrada: Record<string, unknown>): Promise<PaginaConsulta> => {
    const r = await chamar('POST', `/v1/ferramentas/${ferramenta}`, entrada, await cabecalhosDe(escritorio, atorLeitor()))
    if (r.status !== 200) throw Object.assign(new ErroAdaptador('api', `A consulta ${ferramenta} falhou (${r.status}): ${String(r.json?.mensagem ?? '')}`), { status: r.status, codigo: r.json?.codigo })
    const dados = (r.json.dados ?? {}) as { linhas?: Registro[]; totais?: Record<string, number> }
    const p = (r.json.pagina ?? {}) as { cursor?: string | null; ha_mais?: boolean; total?: number }
    return { linhas: dados.linhas ?? [], totais: dados.totais ?? {}, cursor: p.cursor ?? null, haMais: !!p.ha_mais, total: Number(p.total ?? 0) }
  }

  /** A classe 3 ao abrir: a página mais recente que a pessoa pode ver, por tabela (nunca a tabela inteira). */
  const aquecer = async (escritorio: Id): Promise<Partial<Record<NomeTabela, Registro[]>>> => {
    const r: Partial<Record<NomeTabela, Registro[]>> = {}
    for (const [tabela, ferramenta] of Object.entries(LISTA_DA_TABELA) as [NomeTabela, string][]) {
      const linhas: Registro[] = []
      let cursor: string | null = null
      for (let i = 0; i < AQUECER_PAGINAS; i++) {
        const entrada: Record<string, unknown> = { visao: 'tela', limite: 100, ...(tabela === 'evento' ? { so_linha_do_tempo: false } : {}), ...(cursor ? { cursor } : {}) }
        const p = await pagina(escritorio, ferramenta, entrada).catch((e) => {
          console.warn(`[heild] não aqueci ${tabela}:`, e instanceof Error ? e.message : e)
          return null
        })
        if (!p) break
        linhas.push(...p.linhas)
        if (!p.haMais) break
        cursor = p.cursor
      }
      // O app lê em ordem de criação (como no banco local).
      r[tabela] = linhas.sort((a, b) => a.criado_em.localeCompare(b.criado_em) || a.id.localeCompare(b.id))
    }
    return r
  }

  const sincronizar = async (escritorio: Id): Promise<Fotografia | null> => {
    const r = await chamar('GET', '/v1/sincronizar?classes=1,2', undefined, await cabecalhosDe(escritorio, atorLeitor()))
    if (r.status !== 200) throw new ErroAdaptador('api', `Não leu o escritório ${escritorio} (${r.status}): ${String(r.json?.mensagem ?? '')}`)
    const tabelas = (r.json.tabelas ?? {}) as Partial<Record<NomeTabela, Registro[]>>
    if (!tabelas.escritorio?.length) return null
    versoes.set(escritorio, Number(r.json.versao ?? 0))
    // Classe 3: o que já estava no cache fica (é histórico consultado), mais a página mais recente.
    const quentes = await aquecer(escritorio)
    for (const t of Object.keys(LISTA_DA_TABELA) as NomeTabela[]) {
      const antes = banco?.escritorioId === escritorio ? (banco.ler(t) as Registro[]) : []
      const porId = new Map(antes.map((l) => [l.id, l]))
      for (const l of quentes[t] ?? []) porId.set(l.id, l)
      tabelas[t] = [...porId.values()].sort((a, b) => a.criado_em.localeCompare(b.criado_em) || a.id.localeCompare(b.id))
    }
    garantirFluxo(escritorio)
    return paraFotografia(tabelas)
  }

  /** O delta das classes 1 e 2, depois de um aviso do SSE. */
  let deltaMarcado: ReturnType<typeof setTimeout> | null = null
  const pedirDelta = (escritorio: Id) => {
    if (deltaMarcado) return
    deltaMarcado = setTimeout(() => {
      deltaMarcado = null
      void (async () => {
        const desde = versoes.get(escritorio)
        if (desde === undefined || banco?.escritorioId !== escritorio) return
        const r = await chamar('GET', `/v1/sincronizar?classes=1,2&desde=${desde}`, undefined, await cabecalhosDe(escritorio, atorLeitor()))
        if (r.status !== 200 || banco?.escritorioId !== escritorio) return
        versoes.set(escritorio, Math.max(desde, Number(r.json.versao ?? desde)))
        const tabelas = (r.json.tabelas ?? {}) as Record<string, Registro[]>
        const removidas = (r.json.removidas ?? []) as { tabela: NomeTabela; id: Id }[]
        banco.aplicarDoServidor(
          Object.entries(tabelas).flatMap(([tabela, ls]) => ls.map((linha) => ({ tabela: tabela as NomeTabela, linha }))),
          removidas,
        )
      })().catch((e) => console.warn('[heild] delta não veio:', e instanceof Error ? e.message : e))
    }, 150)
  }

  /** O SSE do escritório, com o token de quem está na tela (troca de pessoa, troca de fluxo). */
  const garantirFluxo = (escritorio: Id) => {
    if (typeof fetch === 'undefined' || typeof TextDecoder === 'undefined') return
    const quem = atorLeitor()
    const chave = `${escritorio}|${JSON.stringify(quem.tipo === 'integrante' ? { tipo: 'pessoa', usuario_id: quem.dono_usuario_id } : quem)}`
    if (fluxo?.chave === chave) return
    fluxo?.parar()
    const ctl = new AbortController()
    let vivo = true
    fluxo = { chave, parar: () => ((vivo = false), ctl.abort()) }
    const ligar = async (espera: number): Promise<void> => {
      if (!vivo) return
      try {
        const cab = await cabecalhosDe(escritorio, quem.tipo === 'integrante' ? { tipo: 'pessoa', usuario_id: quem.dono_usuario_id ?? '' } : quem)
        const r = await fetch(`${base}/v1/eventos/fluxo`, { headers: cab, signal: ctl.signal })
        if (!r.ok || !r.body) throw new Error(`SSE ${r.status}`)
        const leitor = r.body.getReader()
        const texto = new TextDecoder()
        let resto = ''
        for (;;) {
          const { value, done } = await leitor.read()
          if (done) break
          resto += texto.decode(value, { stream: true })
          let i: number
          while ((i = resto.indexOf('\n\n')) >= 0) {
            const bloco = resto.slice(0, i)
            resto = resto.slice(i + 2)
            const evento = /^event: (.+)$/m.exec(bloco)?.[1]
            const dados = /^data: (.+)$/m.exec(bloco)?.[1]
            if (evento !== 'mudanca' || !dados || banco?.escritorioId !== escritorio) continue
            const m = JSON.parse(dados) as { tabela: NomeTabela; ids: Id[]; versao: number; removidas?: boolean }
            if (classeDaTabela(m.tabela) === 3) {
              if (m.removidas) banco.aplicarDoServidor([], m.ids.map((id) => ({ tabela: m.tabela, id })))
              for (const o of ouvintesConsulta) o(m.tabela)
            } else pedirDelta(escritorio)
          }
        }
        // O servidor fechou (conta mudou, reinício): liga de novo.
        if (vivo) setTimeout(() => void ligar(1000), 1000)
      } catch {
        if (vivo) setTimeout(() => void ligar(Math.min(espera * 2, 30_000)), espera)
      }
    }
    void ligar(1000)
  }

  const adaptador: AdaptadorApi = {
    nome: 'api',
    descricao: `API do backend (${base})`,

    async carregar(escritorioId) {
      await emSerie(() => enviarFila(escritorioId)).catch((e) => console.error('[heild] fila da API não saiu:', e))
      return sincronizar(escritorioId)
    },

    async persistir(escritorioId) {
      // As escritas já foram como comandos (enfileirar); aqui só esperamos a fila sair.
      await emSerie(() => enviarFila(escritorioId))
      if (recusas.length) {
        const lista = recusas.splice(0)
        // A verdade é a do servidor: relê o escritório e desfaz o otimista recusado.
        const foto = await sincronizar(escritorioId).catch(() => null)
        if (foto && banco?.escritorioId === escritorioId) banco.recarregarDe(foto)
        throw new ErroAdaptador('api', `A API recusou ${lista.length === 1 ? 'uma escrita' : `${lista.length} escritas`}: ${lista.join(' | ')}`)
      }
    },

    async substituir(escritorioId) {
      // Restaurar a demonstração: o servidor semeia com o mesmo código da semente e devolve o escritório.
      geracao.set(escritorioId, (geracao.get(escritorioId) ?? 0) + 1)
      guardarFila(escritorioId, [])
      const r = await chamar('POST', '/v1/demonstracao/restaurar', {}, await cabecalhosDe(escritorioId, { tipo: 'sistema' }))
      if (r.status !== 200) throw new ErroAdaptador('api', `Não restaurou o escritório ${escritorioId} (${r.status}): ${String(r.json?.mensagem ?? '')}`)
      versoes.set(escritorioId, Number(r.json.versao ?? 0))
      // O servidor devolve as classes 1 e 2 do escritório semeado; a classe 3 começa da página mais recente (o cache antigo não vale mais).
      const tabelas = { ...((r.json.tabelas ?? {}) as Partial<Record<NomeTabela, Registro[]>>), ...(await aquecer(escritorioId)) }
      return paraFotografia(tabelas)
    },

    async esquecer(escritorioId) {
      guardarFila(escritorioId, [])
    },

    enfileirar(escritorio, comando, ator) {
      if (ator.tipo === 'pessoa') ultimaPessoa.set(escritorio, ator.usuario_id)
      guardarFila(escritorio, [...lerFila(escritorio), { escritorio, chave: novaChave(), comando, ator }])
    },

    async consultar(ferramenta, entrada) {
      const escritorio = banco?.escritorioId
      if (!escritorio) throw new ErroAdaptador('api', 'Nenhum escritório aberto.')
      garantirFluxo(escritorio)
      const p = await pagina(escritorio, ferramenta, entrada)
      // As linhas consultadas (visão de tela) entram no cache da classe 3: as telas que leem a tabela as veem.
      const tabela = (Object.entries(LISTA_DA_TABELA).find(([, f]) => f === ferramenta)?.[0] ?? null) as NomeTabela | null
      if (tabela && entrada.visao === 'tela' && banco?.escritorioId === escritorio) banco.aplicarDoServidor(p.linhas.map((linha) => ({ tabela, linha })))
      return p
    },

    aoMudarConsulta(ouvinte) {
      ouvintesConsulta.add(ouvinte)
      return () => ouvintesConsulta.delete(ouvinte)
    },

    definirLeitor(quem) {
      leitor = quem
    },
  }

  /** O banco liga o adaptador a si (para reconciliar). */
  ;(adaptador as AdaptadorApi & { ligar(b: Banco): void }).ligar = (b: Banco) => {
    banco = b
  }
  return adaptador
}

/* ---------- Captura: cada chamada de repositório vira um comando ---------- */

/** Métodos que só leem (não viram comando). */
const SO_LEITURA = new Set(['constructor', 'listar', 'obter', 'pode', 'exigir', 'validar', 'autorizar', 'evento', 'exigirCliente', 'vigente', 'proposta', 'faixas', 'conferenciasNecessarias', 'motivoNaoConfere'])

interface DependenciasCaptura {
  repos: Record<string, unknown>
  /** Objetos de operação fora de `repos` (S08b): cada função vira um comando `nome.funcao`. */
  modulos?: Record<string, Record<string, unknown>>
  banco: Banco
  definirGeradorId: (g: ((prefixo: string) => string) | null) => void
  novoIdPadrao: (prefixo: string) => string
  contextoAtual: () => Contexto
}

function atorDe(ctx: Contexto): AtorComando {
  const a = ctx.ator
  if (a.tipo === 'pessoa') return { tipo: 'pessoa', usuario_id: a.perfil.usuario_id }
  if (a.tipo === 'integrante') return { tipo: 'integrante', integrante_id: a.id, dono_usuario_id: a.dono?.usuario_id ?? null }
  if (a.tipo === 'pessoa_cliente') return { tipo: 'pessoa_cliente', cliente_id: a.cliente_id ?? null, nome: a.nome }
  return { tipo: 'sistema' }
}

/**
 * Argumentos como JSON, sem o `ctx` (quem age vai à parte, e o servidor decide pelo token).
 * Campo `undefined` sai (como o JSON faz): no servidor, o valor gravado fica, que é o mesmo
 * resultado do modo local depois de recarregar. Trocar por `null` apagaria o campo.
 */
function serializar(args: unknown[]): unknown[] {
  return JSON.parse(JSON.stringify(args.map((a) => (a && typeof a === 'object' && !Array.isArray(a) && 'ctx' in a ? (({ ctx: _c, ...resto }) => (void _c, resto))(a as Record<string, unknown>) : a)))) as unknown[]
}

/**
 * Instala a captura nos repositórios (só no modo `api`): a chamada de fora (a da tela)
 * vira um comando; as chamadas de dentro (uma transição chamando `atualizar`) fazem parte
 * dela. Transação direta no banco, fora de repositório, vira comando `linhas`.
 */
export function instalarCapturaApi(d: DependenciasCaptura) {
  const adaptador = d.banco.adaptador as AdaptadorApi & { ligar?: (b: Banco) => void }
  if (adaptador.nome !== 'api') return
  adaptador.ligar?.(d.banco)
  adaptador.definirLeitor(() => atorDe(d.contextoAtual()))
  let profundidade = 0
  let capturando: { marcas: MarcaEscrita[] } | null = null

  d.banco.aoTransacao = (marcas) => {
    if (capturando) {
      capturando.marcas.push(...marcas)
      return
    }
    const esc = d.banco.escritorioId
    if (!esc) return
    adaptador.enfileirar(
      esc,
      {
        tipo: 'linhas',
        gravar: marcas.filter((m) => m.linha).map((m) => ({ tabela: m.tabela, linha: m.linha! })),
        remover: marcas.filter((m) => m.removido).map((m) => ({ tabela: m.tabela, id: m.removido! })),
      },
      atorDe(d.contextoAtual()),
    )
  }

  const embrulhar = (repo: Record<string, unknown>, caminho: string, proprios = false) => {
    const metodos = new Set<string>()
    if (proprios) for (const n of Object.keys(repo)) if (!SO_LEITURA.has(n) && typeof repo[n] === 'function') metodos.add(n)
    for (let p = Object.getPrototypeOf(repo); p && p !== Object.prototype; p = Object.getPrototypeOf(p)) for (const n of Object.getOwnPropertyNames(p)) if (!SO_LEITURA.has(n) && typeof repo[n] === 'function') metodos.add(n)
    for (const m of metodos) {
      const original = repo[m] as (...a: unknown[]) => unknown
      repo[m] = function (this: unknown, ...args: unknown[]) {
        if (profundidade > 0) return original.apply(repo, args)
        profundidade++
        const ids: { p: string; id: string }[] = []
        const atual = { marcas: [] as MarcaEscrita[] }
        // A tradução para a ferramenta tipada é feita ANTES de aplicar (o desfazer compara com a linha de agora).
        const operacao = `${caminho}.${m}`
        let traducoes: Traducao[] | null = null
        try {
          traducoes = traduzirOperacao(operacao, serializar(args), (t, id) => d.banco.obter(t, id) as Registro | undefined)
        } catch {
          traducoes = null
        }
        capturando = atual
        d.definirGeradorId((p) => {
          const id = d.novoIdPadrao(p)
          ids.push({ p, id })
          return id
        })
        const mandar = () => {
          const esc = d.banco.escritorioId
          if (!atual.marcas.length || !esc || d.banco.estado !== 'pronto') return
          const comCtx = args.find((a) => a && typeof a === 'object' && !Array.isArray(a) && 'ctx' in a && (a as { ctx?: Contexto }).ctx) as { ctx: Contexto } | undefined
          const ator = atorDe(comCtx?.ctx ?? d.contextoAtual())
          // F1: a chamada vira a ferramenta tipada (os ids gerados vão com a primeira); fora da F1, operação.
          if (traducoes) traducoes.forEach((t, i) => adaptador.enfileirar(esc, { tipo: 'ferramenta', ferramenta: t.ferramenta, entrada: t.entrada, ids: i === 0 ? ids : [], ...(t.texto !== undefined ? { texto: t.texto } : {}) }, ator))
          else adaptador.enfileirar(esc, { tipo: 'operacao', operacao, argumentos: serializar(args), ids }, ator)
        }
        try {
          const r = original.apply(repo, args)
          mandar()
          return r
        } catch (e) {
          // Gravou parte e falhou no meio: o servidor roda a mesma operação, recusa do mesmo jeito
          // e o banco relê o escritório (o otimista parcial não fica).
          mandar()
          throw e
        } finally {
          profundidade--
          capturando = null
          d.definirGeradorId(null)
        }
      }
    }
  }

  const andar = (obj: Record<string, unknown>, caminho: string[]) => {
    for (const [k, v] of Object.entries(obj)) {
      if (!v || typeof v !== 'object' || Array.isArray(v)) continue
      const r = v as Record<string, unknown>
      // Repositório: tem as regras da entidade e sabe listar (o resto é agrupamento, como `bpo`).
      if (r.regras && typeof r.regras === 'object' && typeof r.listar === 'function') embrulhar(r, [...caminho, k].join('.'))
      else andar(r, [...caminho, k])
    }
  }
  andar(d.repos, [])
  for (const [nome, m] of Object.entries(d.modulos ?? {})) {
    const r = m as Record<string, unknown>
    if (r.regras && typeof r.listar === 'function') embrulhar(r, nome)
    else embrulhar(r, nome, true)
  }
}

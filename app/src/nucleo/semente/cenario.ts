import fonteEntidades from '../modelo/entidades.ts?raw'
import type { Fotografia, NomeTabela } from '../modelo/entidades'

/**
 * Cenários do UI Lab: o mesmo escritório de exemplo (Andrade & Lima) com os
 * dados transformados, para ver os widgets REAIS em todos os estados, sem
 * cópia de componente (o pedido do dono: "Documentos da aba com 15? com 50?
 * com 0?"). Um cenário mexe em tudo o que a tela lê:
 *   - no banco: o Lab abre um escritório em memória (`esc-cenario:…`) semeado
 *     por esta transformação da fotografia do Andrade, inclusive as coleções
 *     guardadas em `registro_tela`;
 *   - nos dados fixos de src/dados: as fontes passam por `comCenario`, que
 *     devolve o dado como está fora do Lab.
 *
 * Eixos:
 *   itens      0, 1, 3, 15, 50 ou 200 em cada lista (por cliente e setor no banco)
 *   texto      curto, longo ou sem espaço (CNPJ, chave, e-mail sem quebra)
 *   valores    normais ou extremos (R$ 0,00, R$ 1.234.567.890,12, negativos, % acima de 100)
 *   datas      vencidas, hoje ou futuras
 *   opcionais  completos ou ausentes (os campos opcionais das entidades somem)
 * Os status e tipos do domínio sempre vêm misturados (todos os valores possíveis).
 */
export interface Cenario {
  itens?: number
  texto?: 'curto' | 'longo' | 'sem-espaco'
  valores?: 'normais' | 'extremos'
  datas?: 'vencidas' | 'hoje' | 'futuras'
  opcionais?: 'completos' | 'ausentes'
}

export const QUANTIDADES = [0, 1, 3, 15, 50, 200] as const
export const PREFIXO_CENARIO = 'esc-cenario:'
const HOJE = '2026-11-18'

/* ---------- Identidade do cenário (vai no endereço e no id do escritório) ---------- */

const abrev = { texto: { curto: 'tc', longo: 'tl', 'sem-espaco': 'ts' }, valores: { normais: 'vn', extremos: 've' }, datas: { vencidas: 'dv', hoje: 'dh', futuras: 'df' }, opcionais: { completos: 'oc', ausentes: 'oa' } } as const

/** Nome curto e estável: `i15.tl.ve.dv.oa` (só os eixos definidos). */
export function nomeCenario(c: Cenario): string {
  const partes: string[] = []
  if (c.itens !== undefined) partes.push(`i${c.itens}`)
  for (const k of ['texto', 'valores', 'datas', 'opcionais'] as const) {
    const v = c[k]
    if (v) partes.push((abrev[k] as Record<string, string>)[v])
  }
  return partes.join('.') || 'base'
}

export function lerCenario(nome: string): Cenario | null {
  if (!nome || nome === 'base') return null
  const c: Cenario = {}
  for (const p of nome.split('.')) {
    if (/^i\d+$/.test(p)) c.itens = Number(p.slice(1))
    for (const k of ['texto', 'valores', 'datas', 'opcionais'] as const) {
      const achado = Object.entries(abrev[k]).find(([, a]) => a === p)
      if (achado) (c as Record<string, string>)[k] = achado[0]
    }
  }
  return Object.keys(c).length ? c : null
}

/* ---------- Cenário ativo (o Lab define; fora dele, nenhum) ---------- */

let ativo: Cenario | null = null
let geracao = 0
const memo = new WeakMap<object, { geracao: number; valor: unknown }>()

export function definirCenarioAtivo(c: Cenario | null) {
  if (nomeCenario(c ?? {}) === nomeCenario(ativo ?? {})) return
  ativo = c
  geracao++
}
export const cenarioAtivo = () => ativo

/**
 * Ponto único das fontes de dados fixos (src/dados): fora do Lab devolve o dado
 * como está; com um cenário ativo, a versão transformada (a mesma referência
 * enquanto o cenário não muda, para não refazer efeitos a cada render).
 */
export function comCenario<T>(dados: T): T {
  if (!ativo || dados === null || typeof dados !== 'object') return dados
  const ja = memo.get(dados as object)
  if (ja && ja.geracao === geracao) return ja.valor as T
  const valor = transformar(dados, ativo, '')
  memo.set(dados as object, { geracao, valor })
  return valor
}

const porChave = new Map<string, { geracao: number; valor: unknown }>()

/** Como `comCenario`, para funções que montam o dado a cada chamada: guarda o resultado por chave enquanto o cenário não muda. */
export function comCenarioPor<T>(chave: string, gerar: () => T): T {
  if (!ativo) return gerar()
  const ja = porChave.get(chave)
  if (ja && ja.geracao === geracao) return ja.valor as T
  const valor = transformar(gerar(), ativo, '')
  porChave.set(chave, { geracao, valor })
  return valor
}

/**
 * Coleção de registros por cliente (as coleções da S02, as listas da Gestão): cada
 * cliente fica com `itens` registros, como as tabelas do banco do cenário. Sem
 * cliente, a lista inteira é um grupo só.
 */
export function comCenarioLista<T>(chave: string, gerar: () => T[]): T[] {
  if (!ativo) return gerar()
  const ja = porChave.get(chave)
  if (ja && ja.geracao === geracao) return ja.valor as T[]
  const grupos = new Map<string, T[]>()
  for (const x of gerar()) {
    const k = String((x as { cliente_id?: unknown } | null)?.cliente_id ?? '')
    grupos.set(k, [...(grupos.get(k) ?? []), x])
  }
  const valor = [...grupos.values()].flatMap((g) => transformar(g, ativo!, ''))
  porChave.set(chave, { geracao, valor })
  return valor
}

/* ---------- Domínio das entidades, lido do próprio entidades.ts ---------- */

/** Campos opcionais (`campo?:`) e domínios de status (`campo: 'a' | 'b'` ou um tipo assim) por interface. */
const dominio = (() => {
  const tipos = new Map<string, string[]>()
  for (const m of fonteEntidades.matchAll(/export type (\w+) =\s*((?:\s*\|?\s*'[^']*')+)/g)) tipos.set(m[1], [...m[2].matchAll(/'([^']*)'/g)].map((x) => x[1]))
  const interfaces = new Map<string, { opcionais: Set<string>; valores: Map<string, string[]> }>()
  for (const m of fonteEntidades.matchAll(/export interface (\w+)(?: extends \w+)? \{([\s\S]*?)\n\}/g)) {
    const opcionais = new Set<string>()
    const valores = new Map<string, string[]>()
    for (const l of m[2].matchAll(/^\s+(\w+)(\?)?:\s*([^\n]+)$/gm)) {
      if (l[2]) opcionais.add(l[1])
      const tipo = l[3].replace(/\s*\|\s*null$/, '').trim()
      const literais = [...tipo.matchAll(/'([^']*)'/g)].map((x) => x[1])
      if (literais.length > 1 && /^('[^']*'\s*\|?\s*)+$/.test(tipo)) valores.set(l[1], literais)
      else if (tipos.has(tipo)) valores.set(l[1], tipos.get(tipo)!)
    }
    interfaces.set(m[1], { opcionais, valores })
  }
  const tabelas = new Map<string, string>()
  const bloco = fonteEntidades.match(/export interface Tabelas \{([\s\S]*?)\n\}/)
  for (const l of bloco?.[1].matchAll(/^\s+(\w+):\s*(\w+)/gm) ?? []) tabelas.set(l[1], l[2])
  return (tabela: string) => interfaces.get(tabelas.get(tabela) ?? '') ?? { opcionais: new Set<string>(), valores: new Map<string, string[]>() }
})()

/* ---------- A transformação ---------- */

/** Chaves que identificam ou classificam: nunca mudam de texto nem de valor. */
const CHAVE_FIXA = /^(id|.*_id|ids|chave|codigo|atividade_id|escritorio_id|criado_em|atualizado_em|arquivado_em|ordem|tipo|setor|setor_id|papel|modo|cor|cor_olhos|icone|rota|aba|href|url|link|destino|origem|tom|variante|nivel|versao|ano|mes|dia|semana|hora|competencia|cnpj|cpf|email.*|telefone|whatsapp|uf|regime|status|situacao|estado|etapa|prioridade|fase|canal|formato|extensao|mime|hash.*|token|senha|segundo_fator|ferramenta|nome_tabela|tabela|campo|chave_.*)$/i
const PERCENTUAL = /(pct|percent|aliquota|taxa|margem|cobertura|uso|progresso|confianca|indice)/i
const CHAVE_ESTADO = /^(status|situacao|estado|etapa|prioridade)$/i
/** Campos do banco que se misturam (todos os valores do domínio); regime, tipo e papel definem o que a tela mostra e ficam. */
const MISTURA = CHAVE_ESTADO
const TEXTO_LONGO = ' com a folha, o faturamento declarado, as notas de entrada e saída e os extratos dos três bancos da competência'
const SEM_ESPACO = '_conferiraguiadodasdeoutubrocomafolhaeofaturamento12345678000190'

const ehData = (s: string) => /^\d{4}-\d{2}-\d{2}(T[\d:.]+Z?)?$/.test(s) || /^\d{2}\/\d{2}(\/\d{4})?$/.test(s)
// Sigla ou código em maiúsculas (PGDAS-D, GIA-SP, FIS-010) não é texto de gente: fica como está.
const ehTextoDeGente = (s: string) => s.length > 2 && /[a-zà-ú]{3}/i.test(s) && !ehData(s) && !/^[A-Z]{2,5}-\d{2,4}$/.test(s) && !/^[a-z0-9_:/.-]+$/.test(s) && /[a-zà-ú]/.test(s)

function novaData(s: string, c: Cenario, i: number): string {
  const desloc = c.datas === 'vencidas' ? -(15 + (i % 40)) : c.datas === 'futuras' ? 10 + (i % 60) : 0
  const d = new Date(`${HOJE}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + desloc)
  const iso = d.toISOString()
  if (/^\d{4}-\d{2}-\d{2}T/.test(s)) return iso
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return iso.slice(0, 10)
  const dd = iso.slice(8, 10)
  const mm = iso.slice(5, 7)
  return /^\d{2}\/\d{2}\/\d{4}$/.test(s) ? `${dd}/${mm}/${iso.slice(0, 4)}` : `${dd}/${mm}`
}

function novoTexto(s: string, c: Cenario, i: number): string {
  if (c.texto === 'longo') return s + TEXTO_LONGO
  if (c.texto === 'sem-espaco') return s.replace(/\s+/g, '') + SEM_ESPACO
  if (c.texto === 'curto') return s.split(/\s+/).slice(0, 2).join(' ') || s
  void i
  return s
}

function novoNumero(n: number, chave: string, i: number): number {
  if (PERCENTUAL.test(chave)) return [0, 100, 137.5, 1234.5][i % 4] * (Math.abs(n) <= 1 && n !== 0 ? 0.01 : 1)
  return [0, 1234567890.12, -98765.43, Math.round(n * 1371) / 10][i % 4]
}

/** Repete os itens até `n` (o clone ganha identificadores novos) ou corta. */
function redimensionar<T>(lista: T[], n: number): T[] {
  if (!lista.length || n <= lista.length) return lista.slice(0, n)
  const out = [...lista]
  for (let k = lista.length; k < n; k++) out.push(clonar(lista[k % lista.length], k))
  return out
}
function clonar<T>(item: T, k: number): T {
  if (typeof item === 'string') return item as T
  if (!item || typeof item !== 'object') return item
  const c: Record<string, unknown> = { ...(item as Record<string, unknown>) }
  for (const chave of ['id', 'codigo', 'chave']) if (typeof c[chave] === 'string') c[chave] = `${c[chave]}~${k}`
  return c as T
}

/** Listas que são configuração da aba (o que dá para fazer, os relatórios que existem), não dados: não mudam de tamanho. */
const CHAVE_CONFIGURACAO = /^(acoes|relatorios)$/

/** Uma lista de registros ou de rótulos (não uma série de números, nem a lista curta de siglas). */
const ehLista = (v: unknown[]) => v.length > 0 && (v.every((x) => x && typeof x === 'object' && !Array.isArray(x)) || (v.every((x) => typeof x === 'string') && v.some((x) => (x as string).length > 4)))

/**
 * `nivel` é a profundidade do valor: só as listas de primeiro nível (a coleção, ou uma propriedade dela)
 * mudam de tamanho; as de dentro de cada item ficam como estão (senão 200 × 200 × 200).
 */
function transformar<T>(v: T, c: Cenario, chave: string, i = 0, nivel = 0): T {
  if (Array.isArray(v)) {
    let lista: unknown[] = v
    if (c.itens !== undefined && nivel <= 1 && ehLista(v) && !CHAVE_CONFIGURACAO.test(chave)) lista = redimensionar(v, c.itens)
    // Status e tipos misturados: os valores que a própria lista já tem, em rodízio.
    const objetos = lista.filter((x): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x))
    const estados = new Map<string, unknown[]>()
    for (const o of objetos) for (const [k, val] of Object.entries(o)) if (CHAVE_ESTADO.test(k) && typeof val === 'string') estados.set(k, [...new Set([...(estados.get(k) ?? []), val])])
    return lista.map((x, idx) => {
      let item = x
      if (item && typeof item === 'object' && !Array.isArray(item) && estados.size) {
        item = { ...(item as Record<string, unknown>) }
        for (const [k, vals] of estados) if (vals.length > 1 && k in (item as object)) (item as Record<string, unknown>)[k] = vals[idx % vals.length]
      }
      return transformar(item, c, chave, idx, nivel + 2)
    }) as T
  }
  if (v && typeof v === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) out[k] = CHAVE_FIXA.test(k) && typeof val !== 'object' ? val : transformar(val, c, k, i, nivel + 1)
    return out as T
  }
  if (typeof v === 'string') {
    if (c.datas && ehData(v)) return novaData(v, c, i) as T
    if (c.texto && ehTextoDeGente(v)) return novoTexto(v, c, i) as T
    return v
  }
  if (typeof v === 'number' && c.valores === 'extremos' && Number.isFinite(v) && !CHAVE_FIXA.test(chave)) return novoNumero(v, chave, i) as T
  return v
}

/* ---------- O banco do cenário ---------- */

/** Tabelas que são a estrutura do escritório: não mudam de tamanho (as listas, sim). */
const ESTRUTURA = new Set<string>(['escritorio', 'assinatura', 'pessoa', 'identidade', 'usuario', 'vinculo_setor', 'excecao_tela', 'setor', 'carteira_cliente', 'integrante', 'registro_tela'])

/**
 * A fotografia do escritório de exemplo transformada pelo cenário. Cada lista
 * (tarefa, documento, conversa…) fica com `itens` linhas por cliente e setor; o
 * os dois primeiros clientes (os das versões "cliente" das abas) continuam existindo mesmo com 0.
 */
export function fotografiaDoCenario(base: Fotografia, c: Cenario, escritorioId: string): Fotografia {
  const foto = {} as Fotografia
  for (const [tabela, linhas] of Object.entries(base) as unknown as [NomeTabela, Record<string, unknown>[]][]) {
    const dom = dominio(tabela)
    let novas: Record<string, unknown>[] = linhas.map((l) => ({ ...l, escritorio_id: escritorioId, ...(tabela === 'escritorio' ? { id: escritorioId } : {}) }))
    if (c.itens !== undefined && !ESTRUTURA.has(tabela)) {
      // Os dois primeiros clientes ficam sempre: são os das versões "cliente" das abas (o Fiscal usa o do Simples, o segundo).
      if (tabela === 'cliente') novas = c.itens <= 2 ? novas.slice(0, 2) : redimensionar(novas, c.itens)
      else {
        // Os grupos que as telas mostram (os dois primeiros clientes, que são os das versões "cliente", e o
        // que é do escritório) ficam com `itens` linhas por setor; os outros clientes só encolhem (com 0) ou ficam
        // como estão. A carteira cresce pela tabela de clientes. Assim o banco do cenário cabe na memória.
        const principais = new Set(['', ...(base.cliente ?? []).slice(0, 2).map((x) => String(x.id))])
        const grupos = new Map<string, typeof novas>()
        for (const l of novas) {
          const g = `${l.cliente_id ?? ''}|${l.setor_id ?? ''}`
          grupos.set(g, [...(grupos.get(g) ?? []), l])
        }
        novas = [...grupos.entries()].flatMap(([g, linhas]) => (principais.has(g.split('|')[0]) || c.itens! < linhas.length ? redimensionar(linhas, c.itens!) : linhas))
      }
    }
    novas = novas.map((l, i) => {
      let r: Record<string, unknown> = { ...l }
      // Todos os valores do domínio, misturados.
      for (const [campo, valores] of dom.valores) if (MISTURA.test(campo) && campo in r && c.itens !== undefined && c.itens > 1 && !ESTRUTURA.has(tabela) && tabela !== 'cliente') r[campo] = valores[i % valores.length]
      if (c.opcionais === 'ausentes') for (const campo of dom.opcionais) if (campo !== 'extras' && campo !== 'arquivado_em' && campo !== 'ordem') delete r[campo]
      r = tabela === 'registro_tela' ? { ...r, valor: transformar(r.valor, c, 'valor') } : transformar(r, c, '', i, 2)
      return r
    })
    ;(foto as Record<string, unknown>)[tabela] = novas
  }
  return foto
}

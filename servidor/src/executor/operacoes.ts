import { operacoesS08b, repos, Repositorio, type NomeTabela } from '@heild/dominio'

/**
 * As operações de repositório que viram endpoints: cada método público de escrita de
 * cada repositório de app/src/nucleo/repositorios (`tarefas.mudarStatus`,
 * `bpo.lotes.aprovar`, `clientes.criar`...). O registro sai do próprio objeto `repos`:
 * repositório novo no wireframe vira operação aqui sem código novo.
 */

export interface Operacao {
  nome: string
  /** O repositório, ou o objeto de operações (S08b: `filaOperacao`, `documentosBpo`...). */
  repositorio: Repositorio<NomeTabela> | Record<string, unknown>
  metodo: string
}

/** Métodos que só leem, ajudam por dentro ou não fazem sentido vindos de fora. */
const FORA = new Set(['constructor', 'listar', 'obter', 'pode', 'exigir', 'validar', 'autorizar', 'evento', 'exigirCliente', 'vigente', 'proposta', 'faixas', 'conferenciasNecessarias', 'motivoNaoConfere'])

function metodosDe(r: Repositorio<NomeTabela>): string[] {
  const nomes = new Set<string>()
  for (let p = Object.getPrototypeOf(r); p && p !== Object.prototype; p = Object.getPrototypeOf(p)) {
    for (const n of Object.getOwnPropertyNames(p)) if (!FORA.has(n) && typeof (r as unknown as Record<string, unknown>)[n] === 'function') nomes.add(n)
  }
  return [...nomes].sort()
}

function montar() {
  const operacoes = new Map<string, Operacao>()
  const porTabela = new Map<NomeTabela, Repositorio<NomeTabela>>()
  const andar = (obj: Record<string, unknown>, caminho: string[]) => {
    for (const [k, v] of Object.entries(obj)) {
      if (v instanceof Repositorio) {
        const r = v as Repositorio<NomeTabela>
        if (!porTabela.has(r.tabela)) porTabela.set(r.tabela, r)
        for (const m of metodosDe(r)) {
          // Desfazer passa por cima da regra `antesDeAtualizar` (mensagem interna guarda versões,
          // evento é imutável): nessas tabelas, a API não aceita reverter vindo de fora.
          if ((m === 'reverter' || m === 'desfazerCriacao') && r.regras.antesDeAtualizar) continue
          const nome = [...caminho, k, m].join('.')
          operacoes.set(nome, { nome, repositorio: r, metodo: m })
        }
      } else if (v && typeof v === 'object' && !Array.isArray(v)) andar(v as Record<string, unknown>, [...caminho, k])
    }
  }
  andar(repos as unknown as Record<string, unknown>, [])
  // Operações que a S08b deixou fora de `repos`: o repositório de documentos e os objetos de operação.
  for (const [nome, m] of Object.entries(operacoesS08b as unknown as Record<string, Record<string, unknown>>)) {
    if (m instanceof Repositorio) andar({ [nome]: m }, [])
    else for (const [fn, v] of Object.entries(m)) if (typeof v === 'function' && !FORA.has(fn)) operacoes.set(`${nome}.${fn}`, { nome: `${nome}.${fn}`, repositorio: m, metodo: fn })
  }
  return { operacoes, porTabela }
}

const registro = montar()
export const operacoes = registro.operacoes
export const repositorioDaTabela = (t: string) => registro.porTabela.get(t as NomeTabela)
export const tabelasComRepositorio = () => [...registro.porTabela.keys()].sort()

/**
 * Tira dos argumentos vindos de fora o que só código de confiança pode passar:
 * `ctx` (quem age vem do token) e `semAutorizar` (só semente), em qualquer posição; e
 * `ferramenta` nas opções (os parâmetros com valor padrão, depois dos obrigatórios:
 * `fn.length`), porque trocar a ferramenta de uma operação genérica trocaria a regra de
 * permissão. As transições escolhem a delas por dentro. (`ferramenta` nos dados, como a
 * coluna do cartão de aprovação, fica.)
 */
export function limparArgumentos(op: Operacao, args: unknown[]): unknown[] {
  const obrigatorios = ((op.repositorio as unknown as Record<string, (...a: unknown[]) => unknown>)[op.metodo]).length
  return args.map((a, i) => {
    if (!a || typeof a !== 'object' || Array.isArray(a)) return a
    const { ctx: _c, semAutorizar: _s, ...resto } = a as Record<string, unknown>
    void _c
    void _s
    if (i >= obrigatorios) delete resto.ferramenta
    return resto
  })
}

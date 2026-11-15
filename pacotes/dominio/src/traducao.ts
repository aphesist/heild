import type { NomeTabela, Registro } from '@/nucleo/modelo/entidades'
import { ENTIDADES_F1, entidadePorRepo, type Entidade } from './ferramentas-entidade'
import { ferramentaTipada } from './ferramentas'

/**
 * O caminho de volta (B5; ARQUITETURA 6.2): a chamada que a tela fez num repositório do
 * núcleo vira a ferramenta tipada e a entrada. É assim que os repositórios do frontend
 * passam a ser clientes das ferramentas tipadas sem as 143 telas mudarem: elas seguem
 * chamando `repos.tarefas.atualizar(id, patch)`, e o adaptador `api` manda
 * `POST /v1/ferramentas/tarefa.atualizar { tarefa_id, campos }`.
 *
 * - Operação genérica de tabela da F1 (criar, atualizar, arquivar, desarquivar, excluir,
 *   reordenar, mover, reverter, desfazerCriacao): sempre vira ferramenta tipada. O servidor
 *   recusa essas operações por `/v1/operacoes` (USE_FERRAMENTA_TIPADA): o patch livre acabou.
 * - Desfazer é a operação inversa, autorizada como as outras: os campos editáveis voltam por
 *   `x.atualizar`; o status volta pela transição dele; o que não tem volta pela regra
 *   (tarefa concluída é final) é recusado pelo servidor, com o motivo.
 * - Método específico com ferramenta tipada (mudarStatus, cancelar, decidir...): vira ela.
 * - Método específico sem ferramenta tipada: devolve `null` e segue por `/v1/operacoes`
 *   (assinatura fixa, sem patch; a regra é a do repositório).
 */

export interface Traducao {
  ferramenta: string
  entrada: Record<string, unknown>
  /** Frase do evento que a tela escolheu (vai no envelope, não na entrada). */
  texto?: string
}

/** Métodos genéricos do `Repositorio`: nas tabelas da F1, só por ferramenta tipada. */
export const METODOS_GENERICOS = new Set(['criar', 'atualizar', 'arquivar', 'desarquivar', 'excluir', 'reordenar', 'mover', 'reverter', 'desfazerCriacao'])

/** Colunas que o servidor põe (nunca vêm de fora; API3). */
const DO_SERVIDOR = new Set(['id', 'escritorio_id', 'criado_em', 'atualizado_em', 'arquivado_em', 'versao_linha', 'ordem'])

const TRANSICAO: Record<string, string> = {
  em_andamento: 'tarefa.iniciar',
  aguardando_cliente: 'tarefa.aguardar_cliente',
  aguardando_terceiro: 'tarefa.aguardar_terceiro',
  em_revisao: 'tarefa.enviar_revisao',
  concluida: 'tarefa.concluir',
}

type Obter = (tabela: NomeTabela, id: string) => Registro | undefined
type Args = unknown[]

const objeto = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {})
const textoDe = (op: unknown): string | undefined => {
  const t = objeto(op).texto
  return typeof t === 'string' ? t.slice(0, 500) : undefined
}
const semServidor = (r: Record<string, unknown>) => Object.fromEntries(Object.entries(r).filter(([k, v]) => !DO_SERVIDOR.has(k) && v !== undefined))

/** Os campos editáveis de uma entidade (os da ferramenta `x.atualizar`). */
export function camposEditaveis(e: Entidade): Set<string> {
  const nome = e.manuais?.atualizar ?? `${e.nome}.atualizar`
  const f = ferramentaTipada(nome)
  const campos = f ? ((f.entrada.shape as Record<string, unknown>).campos as { shape?: Record<string, unknown>; _zod?: { def?: { in?: { shape?: Record<string, unknown> } } } } | undefined) : undefined
  // `campos` pode estar embrulhado num refine (ZodPipe/ZodEffects): procura o objeto por dentro.
  const forma = campos?.shape ?? campos?._zod?.def?.in?.shape ?? {}
  return new Set(Object.keys(forma))
}

const pick = (r: Record<string, unknown>, chaves: Set<string>) => Object.fromEntries(Object.entries(r).filter(([k]) => chaves.has(k)))

function transicaoDeTarefa(id: string, status: string, motivo?: string): Traducao | null {
  if (status === 'cancelada') return { ferramenta: 'tarefa.cancelar', entrada: { tarefa_id: id, motivo: motivo ?? '' } }
  const f = TRANSICAO[status]
  return f ? { ferramenta: f, entrada: { tarefa_id: id } } : null
}

function generico(e: Entidade, metodo: string, a: Args, obter?: Obter): Traducao[] | null {
  const idDe = (x: unknown) => ({ [e.id]: String(x) })
  switch (metodo) {
    case 'criar': {
      const nome = e.manuais?.criar ?? `${e.nome}.criar`
      if (!ferramentaTipada(nome)) return null
      return [{ ferramenta: nome, entrada: semServidor(objeto(a[0])), texto: textoDe(a[1]) }]
    }
    case 'atualizar': {
      const patch = semServidor(objeto(a[1]))
      const id = String(a[0])
      // Atualizar com o campo de estado é a transição (o patch não muda estado).
      if (e.tabela === 'tarefa' && 'status' in patch) {
        const t = transicaoDeTarefa(id, String(patch.status), typeof patch.cancelada_motivo === 'string' ? patch.cancelada_motivo : undefined)
        if (t) return [t]
      }
      if (e.tabela === 'cliente' && 'estado_ciclo' in patch && Object.keys(patch).every((k) => k === 'estado_ciclo' || k === 'estado_ciclo_desde'))
        return [{ ferramenta: 'cliente.mudar_estado', entrada: { cliente_id: id, estado_ciclo: patch.estado_ciclo } }]
      if (e.tabela === 'cliente' && typeof patch.fundido_em === 'string') return [{ ferramenta: 'cliente.fundir', entrada: { cliente_id: id, destino_id: patch.fundido_em } }]
      const nome = e.manuais?.atualizar ?? `${e.nome}.atualizar`
      if (!ferramentaTipada(nome)) return null
      return [{ ferramenta: nome, entrada: { [e.id]: id, campos: patch }, texto: textoDe(a[2]) }]
    }
    case 'arquivar': {
      const nome = e.manuais?.arquivar ?? `${e.nome}.arquivar`
      if (!ferramentaTipada(nome)) return null
      const motivo = objeto(a[1]).motivo
      return [{ ferramenta: nome, entrada: { ...idDe(a[0]), ...(typeof motivo === 'string' && motivo.trim() ? { motivo } : nome.startsWith('tarefa.') || nome.startsWith('cliente.') ? { motivo: 'arquivado pela tela' } : {}) } }]
    }
    case 'desarquivar':
    case 'excluir': {
      const nome = `${e.nome}.${metodo}`
      if (!ferramentaTipada(nome)) return null
      const motivo = objeto(a[1]).motivo
      return [{ ferramenta: nome, entrada: { ...idDe(a[0]), ...(metodo === 'excluir' && typeof motivo === 'string' ? { motivo } : {}) } }]
    }
    case 'reordenar':
      return ferramentaTipada(`${e.nome}.reordenar`) ? [{ ferramenta: `${e.nome}.reordenar`, entrada: { ids: (Array.isArray(a[0]) ? a[0] : []).map(String) } }] : null
    case 'mover': {
      // O quadro: mover de coluna é a transição (a posição na coluna é arrumação da tela).
      if (e.tabela === 'tarefa' && a[1] === 'status') {
        const t = transicaoDeTarefa(String(a[0]), String(a[2]))
        return t ? [t] : null
      }
      return null
    }
    case 'reverter': {
      const anterior = objeto(a[0])
      const id = String(anterior.id ?? '')
      const atual = obter?.(e.tabela, id) as Record<string, unknown> | undefined
      if (!id || !atual) return null
      const r: Traducao[] = []
      const editaveis = camposEditaveis(e)
      const mudados = Object.fromEntries(Object.entries(pick(anterior, editaveis)).filter(([k, v]) => JSON.stringify(v ?? null) !== JSON.stringify(atual[k] ?? null)))
      if (e.tabela === 'tarefa' && anterior.status !== atual.status) {
        const t = transicaoDeTarefa(id, String(anterior.status))
        // Sem transição de volta (para "a fazer", ou de concluída): a regra decide no servidor.
        r.push(t ?? { ferramenta: 'tarefa.atualizar', entrada: { tarefa_id: id, campos: { status: anterior.status } } })
      }
      if (Object.keys(mudados).length) r.push({ ferramenta: e.manuais?.atualizar ?? `${e.nome}.atualizar`, entrada: { [e.id]: id, campos: mudados }, texto: 'Desfez a última mudança' })
      return r
    }
    case 'desfazerCriacao': {
      // A criação desfeita é a operação inversa possível pela regra: excluir onde a regra deixa; senão, arquivar.
      if (ferramentaTipada(`${e.nome}.excluir`)) return [{ ferramenta: `${e.nome}.excluir`, entrada: { ...idDe(a[0]), motivo: 'criação desfeita' } }]
      const nome = e.manuais?.arquivar ?? `${e.nome}.arquivar`
      if (ferramentaTipada(nome)) return [{ ferramenta: nome, entrada: { ...idDe(a[0]), motivo: 'criação desfeita' } }]
      return null
    }
  }
  return null
}

/** Os métodos específicos da F1 que têm ferramenta tipada. */
const ESPECIFICOS: Record<string, (a: Args) => Traducao[] | null> = {
  'tarefas.mudarStatus': (a) => {
    const t = transicaoDeTarefa(String(a[0]), String(a[1]), typeof objeto(a[2]).motivo === 'string' ? String(objeto(a[2]).motivo) : undefined)
    return t ? [t] : null
  },
  'tarefas.cancelar': (a) => [{ ferramenta: 'tarefa.cancelar', entrada: { tarefa_id: String(a[0]), motivo: String(a[1] ?? '') } }],
  'tarefas.reatribuir': (a) => [{ ferramenta: 'tarefa.reatribuir', entrada: { tarefa_id: String(a[0]), responsavel_tipo: objeto(a[1]).tipo, responsavel_id: objeto(a[1]).id } }],
  'obrigacoes.cancelar': (a) => [{ ferramenta: 'obrigacao.cancelar', entrada: { obrigacao_id: String(a[0]), motivo: String(a[1] ?? '') } }],
  'mensagensInternas.enviar': (a) => {
    const op = objeto(a[2])
    return [{ ferramenta: 'mensagem_interna.enviar', entrada: { conversa_interna_id: String(a[0]), corpo: String(a[1] ?? ''), ...(op.respondeA ? { responde_a_id: op.respondeA } : {}), ...(op.extras ? { extras: op.extras } : {}) }, texto: textoDe(op) }]
  },
  // Criar a mensagem interna é escrever nela: o autor é quem está no token, nunca o da linha.
  'mensagensInternas.criar': (a) => {
    const d = objeto(a[0])
    return [{ ferramenta: 'mensagem_interna.enviar', entrada: { conversa_interna_id: d.conversa_interna_id, corpo: d.corpo, ...(d.responde_a_id ? { responde_a_id: d.responde_a_id } : {}), ...(d.extras ? { extras: d.extras } : {}) }, texto: textoDe(a[1]) }]
  },
  'mensagensInternas.editar': (a) => [{ ferramenta: 'mensagem_interna.editar', entrada: { mensagem_id: String(a[0]), corpo: String(a[1] ?? '') } }],
  'cartoes.decidir': (a) => {
    const op = objeto(a[2])
    if (op.criarSeFaltar) return null
    return [{ ferramenta: 'aprovacao.decidir', entrada: { cartao_id: String(a[0]), decisao: a[1], ...(typeof op.comentario === 'string' && op.comentario ? { comentario: op.comentario } : {}) } }]
  },
  'notificacoes.ler': (a) => [{ ferramenta: 'notificacao.ler', entrada: { notificacao_id: String(a[0]), usuario_id: String(a[1]) } }],
  'notificacoes.lerTodas': (a) => (Array.isArray(a[1]) && a[1].length ? [{ ferramenta: 'notificacao.ler_todas', entrada: { usuario_id: String(a[0]), notificacao_ids: a[1].map(String) } }] : []),
  'notificacoes.criar': (a) => [{ ferramenta: 'notificacao.criar', entrada: semServidor(objeto(a[0])) }],
  'telas.lembrar': (a) => [{ ferramenta: 'tela.lembrar', entrada: { chave: String(a[0]), valor: a[1] ?? null } }],
  'telas.esquecer': (a) => [{ ferramenta: 'tela.esquecer', entrada: { chave: String(a[0]) } }],
}

/**
 * A operação capturada vira uma ou mais chamadas de ferramenta tipada, na ordem; `null` se
 * não é da F1 (ou é método específico sem ferramenta) e segue por `/v1/operacoes`.
 * `obter` lê a linha atual no cache do navegador (para o desfazer saber o que mudou).
 */
export function traduzirOperacao(operacao: string, argumentos: unknown[], obter?: Obter): Traducao[] | null {
  const especifico = ESPECIFICOS[operacao]
  if (especifico) return especifico(argumentos)
  const ponto = operacao.lastIndexOf('.')
  const repo = operacao.slice(0, ponto)
  const metodo = operacao.slice(ponto + 1)
  const e = entidadePorRepo.get(repo)
  if (!e || !METODOS_GENERICOS.has(metodo)) return null
  return generico(e, metodo, argumentos, obter)
}

/** A operação é genérica de uma tabela da F1 (o servidor só aceita pela ferramenta tipada)? */
export function exigeFerramentaTipada(operacao: string): boolean {
  const ponto = operacao.lastIndexOf('.')
  return entidadePorRepo.has(operacao.slice(0, ponto)) && METODOS_GENERICOS.has(operacao.slice(ponto + 1))
}

export const tabelasDaF1ComFerramenta = (): NomeTabela[] => ENTIDADES_F1.map((e) => e.tabela)

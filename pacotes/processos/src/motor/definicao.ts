import { z } from 'zod'
import type { Tx } from '../banco.ts'
import { hashDe } from '../banco.ts'
import type { ContextoExec, Origem } from '../contexto.ts'
import type { Contrato } from '../operarios/contrato.ts'
import { exigeCartaoSempre, metadadosDoCatalogo, type Ferramenta, type Nivel } from '../dominio.ts'
import { validador } from '../validadores/registro.ts'

/** O que um passo enxerga: a entrada, as saídas compactas dos passos anteriores e a memória (só leitura). */
export interface Estado<E = any> {
  readonly entrada: E
  readonly execucao: InfoExecucao
  readonly saidas: Readonly<Record<string, any>>
  readonly memoria: Readonly<Record<string, unknown>>
}

export interface InfoExecucao {
  id: string
  escritorio_id: string
  procedimento_id: string
  versao: number
  setor: string
  cliente_id: string | null
  tarefa_id: string | null
  origem: Origem
  responsavel_id: string | null
}

/** Facilidades de um passo determinístico: a transação (RLS do escritório) e o contexto do ator. */
export interface Facilidades {
  tx: Tx
  ctx: ContextoExec
}

/** Cartão visual gerado pelo sistema (AGENTICO 8 e 13): o modelo nunca escreve tabela nem número. */
export type CartaoVisual =
  | { tipo: 'tabela'; titulo: string; colunas: string[]; linhas: (string | number)[][] }
  | { tipo: 'lista'; titulo: string; itens: string[] }
  | { tipo: 'aviso'; titulo: string; texto: string }

export interface ResumoParaIntegrante {
  titulo: string
  cartoes?: CartaoVisual[]
  dados?: Record<string, unknown>
}

export type Passo<E = any> =
  | { tipo: 'deterministico'; nome: string; executar: (s: Estado<E>, f: Facilidades) => unknown | Promise<unknown> }
  | {
      tipo: 'operario'
      nome: string
      contrato: Contrato
      /** Só isto vai ao modelo: contexto vazio, nada de histórico, memória ou transcript. */
      recebe: (s: Estado<E>) => unknown
      /** Pula o passo (sem modelo) quando o código já resolveu. */
      pular_se?: (s: Estado<E>) => boolean
    }
  | {
      tipo: 'validar'
      nome: string
      validadores: string[]
      /** Os dados que os validadores conferem (cada validador declara o esquema do que lê). */
      dados: (s: Estado<E>) => unknown
      /** Passo de operário cuja saída está sendo conferida (para escalar a ele). */
      sobre?: string
      /** `falhar`: erro de regra encerra (sem modelo). `escalar`: uma vez ao escritor, depois cartão "não consegui". */
      ao_falhar: 'falhar' | 'escalar'
    }
  | {
      tipo: 'aprovacao'
      nome: string
      ferramenta: string
      /** `sempre`: cartão em qualquer caso. `por_regra`: cartão salvo se a lista do escritório liberar e a ferramenta deixar. */
      exigida: 'sempre' | 'por_regra'
      argumentos: (s: Estado<E>) => Record<string, unknown>
      /** Esquema dos argumentos (também valida a edição feita pela pessoa no cartão). */
      esquema: z.ZodType
      resumo: (s: Estado<E>) => string
      cartoes?: (s: Estado<E>) => CartaoVisual[]
      /** Validadores que rodam de novo sobre argumentos editados no cartão. */
      revalidar?: string[]
      expira_horas?: number
    }
  | {
      tipo: 'externo'
      nome: string
      ferramenta: string
      conector: string
      metodo: string
      /** Passo de aprovação cujos argumentos aprovados são exatamente o que sai. */
      aprovacao: string
      /** Chave natural do efeito: a mesma chave nunca sai duas vezes, nem de outra execução. */
      chave: (s: Estado<E>) => string
      /** Esquema da resposta do órgão: fora dele é `ESQUEMA_EXTERNO` (OWASP API10; 08, 2.5). */
      resultado: z.ZodObject
      /** No modo sombra o órgão nunca é chamado: o que o passo devolve no lugar (marcado como sombra). */
      sombra?: (s: Estado<E>) => Record<string, unknown>
    }
  | {
      tipo: 'efeito'
      nome: string
      ferramenta: string
      /** Grava pelo `tx` do passo: efeito, evento, checkpoint e próximo job numa transação só. */
      executar: (s: Estado<E>, f: Facilidades) => Promise<{ dados: unknown; texto_evento: string }>
      /** Exigido quando a ferramenta pede aprovação: o passo de aprovação que a liberou. */
      aprovacao?: string
    }
  | {
      tipo: 'concluir'
      nome: string
      saida: (s: Estado<E>) => unknown
      /** Devolve o resumo para acordar o integrante, ou null se não há nada a dizer. */
      acordar?: (s: Estado<E>) => ResumoParaIntegrante | null
    }

export interface GatilhoDeEvento<E> {
  evento: string
  /** Monta a entrada do procedimento a partir do evento (ou null: não é para este procedimento). */
  entrada: (evento: { id: string; cliente_id: string | null; argumentos_resumo: any; resultado_ref: string | null }) => E | null
  /** Checagem sem modelo (AGENTICO 12, encaixe 4): há trabalho? */
  condicao?: (tx: Tx, entrada: E) => Promise<boolean>
}

export interface DefinicaoProcedimento<E extends z.ZodObject = z.ZodObject> {
  id: string
  versao: number
  nome: string
  setor: string
  nivel_maximo: Nivel
  /** Operação de processo que expõe o procedimento (AGENTICO 2). */
  operacao: string
  descricao_modelo: string
  entrada: E
  saida: z.ZodType
  orcamento: { centavos: number; tokens: number }
  /** Chaves da memória do setor que a execução lê (congeladas na admissão). */
  memoria?: string[]
  /** Cliente do pedido (trava, autorização por carteira, contexto). */
  cliente: (entrada: z.infer<E>) => string | null
  passos: Passo<z.infer<E>>[]
  gatilho?: GatilhoDeEvento<z.infer<E>>
}

export interface Procedimento<E extends z.ZodObject = z.ZodObject> extends DefinicaoProcedimento<E> {
  hash: string
  /** Metadados para autorizar a operação de processo pela mesma função `autorizar`. */
  ferramenta: Ferramenta
}

/** Metadados de autorização de uma ferramenta citada num passo (catálogo do wireframe ou da B2). */
export type ResolverFerramenta = (nome: string) => Ferramenta | undefined

/**
 * Define um procedimento e confere as regras que o CI cobraria (AGENTICO 3 e 4.5). Recusa na hora:
 *  - entrada não estrita;
 *  - nome de passo repetido, `sobre`/`aprovacao` apontando para passo inexistente ou posterior;
 *  - validador não registrado;
 *  - efeito ou externo com ferramenta irreversível (ou `exige_aprovacao: sempre`) sem um passo de
 *    aprovação `sempre` da MESMA ferramenta antes dele. Nenhum ato que a regra exija aprovação
 *    pode sair de um procedimento sem cartão humano.
 */
export function definirProcedimento<E extends z.ZodObject>(d: DefinicaoProcedimento<E>, resolver: ResolverFerramenta = metadadosDoCatalogo): Procedimento<E> {
  const erros: string[] = []
  if (!/^[A-Z]{2,4}-[A-Z0-9-]+$/.test(d.id)) erros.push(`id fora do padrão do catálogo: ${d.id}`)
  if (!isStrict(d.entrada)) erros.push('a entrada precisa ser z.object(...).strict()')
  const nomes = new Map<string, number>()
  d.passos.forEach((p, i) => {
    if (nomes.has(p.nome)) erros.push(`passo repetido: ${p.nome}`)
    nomes.set(p.nome, i)
  })
  const antes = (nome: string, i: number) => nomes.has(nome) && nomes.get(nome)! < i
  d.passos.forEach((p, i) => {
    if (p.tipo === 'validar') {
      for (const v of p.validadores) if (!validador(v)) erros.push(`${p.nome}: validador não registrado ${v}`)
      if (p.sobre && (!antes(p.sobre, i) || d.passos[nomes.get(p.sobre)!]!.tipo !== 'operario')) erros.push(`${p.nome}: 'sobre' precisa ser um operário anterior`)
      if (p.ao_falhar === 'escalar' && !p.sobre) erros.push(`${p.nome}: escalar exige 'sobre'`)
    }
    if (p.tipo === 'aprovacao') {
      if (!resolver(p.ferramenta)) erros.push(`${p.nome}: ferramenta desconhecida ${p.ferramenta}`)
      for (const v of p.revalidar ?? []) if (!validador(v)) erros.push(`${p.nome}: validador não registrado ${v}`)
      const f = resolver(p.ferramenta)
      if (f && exigeCartaoSempre(f) && p.exigida !== 'sempre') erros.push(`${p.nome}: ${p.ferramenta} exige aprovação sempre`)
    }
    if (p.tipo === 'externo' || p.tipo === 'efeito') {
      const f = resolver(p.ferramenta)
      if (!f) erros.push(`${p.nome}: ferramenta desconhecida ${p.ferramenta}`)
      const ref = p.aprovacao
      const precisa = p.tipo === 'externo' || (f && (exigeCartaoSempre(f) || f.exige_aprovacao === 'se_integrante'))
      if (precisa) {
        const ap = ref ? d.passos[nomes.get(ref) ?? -1] : undefined
        if (!ref || !antes(ref, i) || !ap || ap.tipo !== 'aprovacao') erros.push(`${p.nome}: precisa de um passo de aprovação anterior`)
        else if (ap.ferramenta !== p.ferramenta) erros.push(`${p.nome}: a aprovação ${ref} é de outra ferramenta (${ap.ferramenta})`)
        else if (f && exigeCartaoSempre(f) && ap.exigida !== 'sempre') erros.push(`${p.nome}: ${p.ferramenta} é irreversível; a aprovação tem de ser 'sempre'`)
      }
    }
  })
  if (d.passos.at(-1)?.tipo !== 'concluir') erros.push('o último passo precisa ser concluir')
  if (erros.length) throw new Error(`Procedimento ${d.id} v${d.versao} inválido:\n- ${erros.join('\n- ')}`)

  const forma = {
    id: d.id,
    versao: d.versao,
    entrada: z.toJSONSchema(d.entrada),
    saida: z.toJSONSchema(d.saida),
    passos: descreverPassos(d.passos),
  }
  return {
    ...d,
    hash: hashDe(forma),
    ferramenta: { nome: d.operacao, modulo: 'painel', nivel: d.nivel_maximo, setor: d.setor },
  }
}

export function descreverPassos(passos: Passo[]) {
  return passos.map((p) => ({
    nome: p.nome,
    tipo: p.tipo,
    ...(p.tipo === 'operario' ? { contrato: `${p.contrato.id}@${p.contrato.versao}` } : {}),
    ...(p.tipo === 'validar' ? { validadores: p.validadores, ao_falhar: p.ao_falhar } : {}),
    ...(p.tipo === 'aprovacao' ? { ferramenta: p.ferramenta, exigida: p.exigida } : {}),
    ...(p.tipo === 'externo' ? { ferramenta: p.ferramenta, conector: `${p.conector}.${p.metodo}` } : {}),
    ...(p.tipo === 'efeito' ? { ferramenta: p.ferramenta } : {}),
  }))
}

function isStrict(o: z.ZodObject) {
  const js = z.toJSONSchema(o, { io: 'input' }) as { additionalProperties?: unknown }
  return js.additionalProperties === false
}

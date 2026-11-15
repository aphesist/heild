import './validadores.ts'
import { z } from 'zod'
import { contratoRevisar, definirProcedimento, ErroRegra, linhaDaRevisao, type CartaoVisual, type Contrato, type Estado, type Passo, type Procedimento, type ResolverFerramenta } from '@heild/processos'
import { comQuemFala } from './identificacao.ts'

/**
 * Fábrica dos procedimentos "ler e escolher" dos setores (B3). O caminho é sempre o mesmo, em código:
 *   ler o documento do cliente → o código extrai as opções (e decide por regra quando dá) →
 *   operário escolhe ENTRE as opções (só quando a regra não resolve) → validadores (opções,
 *   confiança, regras do setor) → aprovação (cartão ou lista do escritório) → efeito → concluir.
 * O modelo nunca inventa valor: escolhe numa lista que o código montou, e o número vem do dado.
 */

export type ValorEscolha = string | number | null
export type Escolha = Record<string, ValorEscolha>

export interface Lido {
  tipo: string
  /** As opções de cada campo da escolha (o validador confere que o modelo ficou nelas). */
  candidatas: Record<string, ValorEscolha[]>
  /** Decisão por regra (sem modelo), quando o documento já diz. */
  regra: { escolha: Escolha; motivo: string } | null
  /** O que o operário recebe além das opções (o texto vai envelopado como dado externo). */
  trecho: string
  /** Dados do sistema que os validadores e o cartão usam (valores, base de respostas...). */
  contexto: Record<string, unknown>
}

export interface DocumentoLido {
  id: string
  tipo: string
  metadados: Record<string, unknown>
  texto: string
  criado_em: Date
}

export interface OpcoesEscolha {
  id: string
  versao: number
  nome: string
  setor: string
  operacao: string
  descricao_modelo: string
  tipos_documento: string[]
  contrato: Contrato
  /** Os campos da escolha, em ordem (a decisão comparável é a junção deles). */
  campos: string[]
  /** Onde o efeito grava a decisão no documento (metadados). */
  chave_metadados: string
  ler: (doc: DocumentoLido, memoria: Readonly<Record<string, unknown>>) => Lido
  /** O que vai ao operário: só as opções e o trecho (contexto vazio). */
  recebe: (lido: Lido) => Record<string, unknown>
  validadores: string[]
  aprovacao: {
    ferramenta: string
    /** `por_categoria`: mensagem padronizada ao cliente, no modo que o escritório escolheu (`envio.ts`). */
    exigida: 'sempre' | 'por_regra' | 'por_categoria'
    categoria?: string
    /**
     * A mensagem padronizada ao cliente, escrita pelo SISTEMA (modelo do tema). Com conversa ligada ao
     * documento, o efeito a grava na conversa (o CRM envia), com o prefixo de quem fala, salvo com a
     * categoria desligada.
     */
    mensagem_ao_cliente?: (escolha: Escolha, lido: Lido) => string
    resumo: (escolha: Escolha, lido: Lido) => string
    cartoes?: (escolha: Escolha, lido: Lido) => CartaoVisual[]
    /** Campos extras que vão nos argumentos aprovados (ex.: o texto aprovado da resposta). */
    extras?: (escolha: Escolha, lido: Lido) => Record<string, string>
  }
  /**
   * Revisor de risco (Opus) antes do cartão: só nos procedimentos com ato irreversível (enviar ao
   * cliente, transmitir). Recebe o compacto: o resumo, a decisão, as evidências e o trecho.
   */
  revisor?: { evidencias: (escolha: Escolha, lido: Lido) => { rotulo: string; valor: string }[] }
  memoria?: string[]
  orcamento: { centavos: number; tokens: number }
  resolver?: ResolverFerramenta
}

export interface SaidaEscolha {
  documento_id: string
  decisao: Escolha
  origem: 'regra' | 'modelo' | 'pessoa'
}

const ValorZ = z.union([z.string().max(300), z.number(), z.null()])

/** A decisão final (operário, pessoa no cartão "não consegui", ou regra), com a origem. */
export function escolhida(saidas: Readonly<Record<string, any>>, campos: string[]) {
  const op = saidas.escolher
  const pegar = (o: Record<string, unknown>) => Object.fromEntries(campos.map((c) => [c, (o[c] ?? null) as ValorEscolha]))
  if (op && !op.pulado) return { escolha: pegar(op), origem: (op.origem === 'pessoa' ? 'pessoa' : 'modelo') as 'pessoa' | 'modelo', confianca: (op.confianca ?? null) as number | null, motivo: String(op.motivo ?? '') }
  const r = saidas.ler_documento.regra as { escolha: Escolha; motivo: string }
  return { escolha: pegar(r.escolha), origem: 'regra' as const, confianca: null, motivo: r.motivo }
}

export function procedimentoDeEscolha(o: OpcoesEscolha): Procedimento {
  const campos = o.campos
  const Args = z.object({ documento_id: z.string(), ...Object.fromEntries(campos.map((c) => [c, ValorZ])), extras: z.record(z.string(), z.string().max(2000)).optional() }).strict()
  const lido = (s: Estado) => s.saidas.ler_documento as Lido
  const def = definirProcedimento(
    {
      id: o.id,
      versao: o.versao,
      nome: o.nome,
      setor: o.setor,
      nivel_maximo: 'executar',
      operacao: o.operacao,
      descricao_modelo: o.descricao_modelo,
      entrada: z.object({ documento_id: z.string().min(1).max(80), cliente_id: z.string().min(1).max(80) }).strict(),
      saida: z.object({ documento_id: z.string(), decisao: z.record(z.string(), ValorZ), origem: z.enum(['regra', 'modelo', 'pessoa']) }).strict(),
      orcamento: o.orcamento,
      memoria: o.memoria,
      cliente: (e) => e.cliente_id,
      passos: [
        {
          tipo: 'deterministico',
          nome: 'ler_documento',
          executar: async (s, { tx }) => {
            const [d] = await tx`select id, cliente_id, tipo, criado_em, metadados from documento where id = ${s.entrada.documento_id}`
            if (!d) throw new ErroRegra('DOCUMENTO_INEXISTENTE', 'Documento não encontrado.', 'documento_id')
            if (d.cliente_id !== s.entrada.cliente_id) throw new ErroRegra('DOCUMENTO_DE_OUTRO_CLIENTE', 'O documento é de outro cliente.', 'cliente_id')
            if (!o.tipos_documento.includes(d.tipo)) throw new ErroRegra('TIPO_DE_DOCUMENTO', `Este procedimento lê ${o.tipos_documento.join(', ')}, não ${d.tipo}.`, 'documento_id')
            const m = (d.metadados ?? {}) as Record<string, unknown>
            if (m[o.chave_metadados]) throw new ErroRegra('JA_FEITO', 'Este documento já foi tratado por este procedimento.')
            const texto = String(m.texto_extraido ?? '').slice(0, 2000)
            return o.ler({ id: d.id, tipo: d.tipo, metadados: m, texto, criado_em: new Date(d.criado_em) }, s.memoria)
          },
        },
        {
          tipo: 'operario',
          nome: 'escolher',
          contrato: o.contrato,
          pular_se: (s) => lido(s).regra !== null,
          recebe: (s) => o.recebe(lido(s)),
        },
        {
          tipo: 'validar',
          nome: 'conferir',
          validadores: o.validadores,
          dados: (s) => {
            const e = escolhida(s.saidas, campos)
            return { origem: e.origem, confianca: e.confianca, escolha: e.escolha, candidatas: lido(s).candidatas, contexto: lido(s).contexto, cliente_id: s.entrada.cliente_id }
          },
          sobre: 'escolher',
          ao_falhar: 'escalar',
        },
        ...(o.revisor
          ? ([
              {
                tipo: 'operario' as const,
                nome: 'revisar',
                contrato: contratoRevisar,
                // A decisão de uma pessoa (cartão "não consegui") não volta ao revisor.
                pular_se: (s: Estado) => escolhida(s.saidas, campos).origem === 'pessoa',
                recebe: (s: Estado) => {
                  const e = escolhida(s.saidas, campos)
                  return {
                    ato: o.aprovacao.ferramenta,
                    resumo: o.aprovacao.resumo(e.escolha, lido(s)),
                    decisao: e.escolha,
                    evidencias: [{ rotulo: 'Validadores do procedimento', valor: `todos passaram (${o.validadores.join(', ')})` }, ...o.revisor!.evidencias(e.escolha, lido(s))].slice(0, 30),
                    ...(lido(s).trecho ? { trecho: lido(s).trecho } : {}),
                  }
                },
              },
              {
                tipo: 'validar' as const,
                nome: 'conferir_revisao',
                validadores: ['revisao_aprovou'],
                dados: (s: Estado) => ({ revisao: s.saidas.revisar ?? null }),
                sobre: 'revisar',
                ao_falhar: 'escalar' as const,
              },
            ] satisfies Passo[])
          : []),
        {
          tipo: 'aprovacao',
          nome: 'aprovar',
          ferramenta: o.aprovacao.ferramenta,
          exigida: o.aprovacao.exigida,
          ...(o.aprovacao.categoria ? { categoria: o.aprovacao.categoria } : {}),
          esquema: Args,
          argumentos: (s) => {
            const e = escolhida(s.saidas, campos).escolha
            const extras = o.aprovacao.extras?.(e, lido(s))
            return { documento_id: s.entrada.documento_id, ...e, ...(extras ? { extras } : {}) }
          },
          resumo: (s) => o.aprovacao.resumo(escolhida(s.saidas, campos).escolha, lido(s)) + (o.revisor ? linhaDaRevisao(s.saidas.revisar) : ''),
          cartoes: o.aprovacao.cartoes ? (s) => o.aprovacao.cartoes!(escolhida(s.saidas, campos).escolha, lido(s)) : undefined,
        },
        {
          tipo: 'efeito',
          nome: 'registrar',
          ferramenta: o.aprovacao.ferramenta,
          aprovacao: 'aprovar',
          executar: async (s, { tx }) => {
            const args = (s.saidas.aprovar as { argumentos: Record<string, unknown> }).argumentos
            const decisao = Object.fromEntries(campos.map((c) => [c, (args[c] ?? null) as ValorEscolha]))
            const origem = escolhida(s.saidas, campos).origem
            // Envio por categoria: o modo que a aprovação aplicou (cartão quando a pessoa aprovou).
            const modo = (s.saidas.aprovar as { modo?: string }).modo ?? 'cartao'
            let enviada = false
            if (o.aprovacao.mensagem_ao_cliente && modo !== 'desligado') {
              const [cv] = await tx`select m.conversa_id from documento d join mensagem m on m.id = d.mensagem_id where d.id = ${s.entrada.documento_id}`
              if (cv) {
                const [integ] = await tx`select id, nome_exibido from integrante where setor = ${o.setor} and tipo = 'padrao_setor' and situacao = 'ativo' order by criado_em limit 1`
                const texto = comQuemFala({ tipo: 'integrante', nome: String(integ?.nome_exibido ?? o.setor) }, o.aprovacao.mensagem_ao_cliente(escolhida(s.saidas, campos).escolha, lido(s)))
                await tx`insert into mensagem (escritorio_id, conversa_id, direcao, canal, autor_tipo, autor_id, corpo, extras)
                         values (${s.execucao.escritorio_id}, ${cv.conversa_id}, 'saida', 'whatsapp', 'integrante', ${integ?.id ?? null}, ${texto},
                         ${tx.json({ tipo: 'mensagem_padronizada', categoria: o.aprovacao.categoria ?? null, modo, execucao_id: s.execucao.id } as never)})`
                enviada = true
              }
            }
            const envio = o.aprovacao.exigida === 'por_categoria' ? { envio: { categoria: o.aprovacao.categoria, modo, enviada } } : {}
            const registro = { ...decisao, ...(args.extras ? { extras: args.extras } : {}), origem, execucao_id: s.execucao.id, ...envio }
            const linhas = await tx`
              update documento set metadados = coalesce(metadados, '{}'::jsonb) || ${tx.json({ [o.chave_metadados]: registro } as never)}
              where id = ${s.entrada.documento_id} and not (coalesce(metadados, '{}'::jsonb) ? ${o.chave_metadados}) returning id`
            if (!linhas.length) throw new ErroRegra('JA_FEITO', 'O documento foi tratado por outra via enquanto esta execução rodava.')
            const comoEnviou = o.aprovacao.exigida !== 'por_categoria' ? '' : modo === 'desligado' ? '; envio desligado: o aviso fica com a pessoa' : enviada ? `; mensagem na conversa do cliente (${modo})` : `; envio ${modo}, sem conversa ligada`
            return { dados: { decisao, origem, ...envio }, texto_evento: `${o.nome}: ${campos.map((c) => `${c}=${decisao[c] ?? '-'}`).join(', ')} (${origem})${comoEnviou}` }
          },
        },
        {
          tipo: 'concluir',
          nome: 'concluir',
          saida: (s): SaidaEscolha => ({ documento_id: s.entrada.documento_id, decisao: s.saidas.registrar.decisao, origem: s.saidas.registrar.origem }),
          acordar: (s) => ({ titulo: `${o.nome}: concluído`, dados: { documento_id: s.entrada.documento_id, origem: s.saidas.registrar.origem } }),
        },
      ],
    },
    o.resolver,
  )
  return def as unknown as Procedimento
}

/** Decisão comparável de uma execução de escolha: os campos juntos, ou `cartao` quando não decidiu. */
export function decisaoDeEscolha(campos: string[]) {
  return (e: { estado: string; saida: Record<string, unknown> | null; erro: { codigo?: string } | null }) => {
    if (e.estado === 'concluida' && e.saida) {
      const d = e.saida.decisao as Escolha
      return campos.map((c) => String(d[c] ?? '-')).join(':')
    }
    if (e.estado === 'aguardando_cartao' || e.erro?.codigo === 'SOMBRA_NAO_DECIDIU') return 'cartao'
    return `${e.estado}:${e.erro?.codigo ?? ''}`
  }
}

// ── extração por código, comum aos setores ──

const Competencia = /^\d{4}-(0[1-9]|1[0-2])$/

/** Competências citadas no texto (mm/aaaa e dd/mm/aaaa), sem futuras, mais recentes primeiro. */
export function competenciasDoTexto(texto: string, max = 6): string[] {
  const achadas = new Set<string>()
  for (const m of texto.matchAll(/\b(\d{2})\/(\d{2})\/(\d{4})\b/g)) achadas.add(`${m[3]}-${m[2]}`)
  for (const m of texto.matchAll(/(?<![\d/])(\d{2})\/(\d{4})(?!\d)/g)) achadas.add(`${m[2]}-${m[1]}`)
  const agora = new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' }).slice(0, 7)
  return [...achadas].filter((c) => Competencia.test(c) && c <= agora).sort().reverse().slice(0, max)
}

/** Datas dd/mm/aaaa do texto, em ISO. */
export function datasDoTexto(texto: string, max = 6): string[] {
  const achadas = new Set<string>()
  for (const m of texto.matchAll(/\b(\d{2})\/(\d{2})\/(\d{4})\b/g)) {
    const iso = `${m[3]}-${m[2]}-${m[1]}`
    if (!Number.isNaN(Date.parse(iso))) achadas.add(iso)
  }
  return [...achadas].sort().slice(0, max)
}

/** Números citados no texto (inteiros e com vírgula decimal), como texto normalizado. */
export function numerosDoTexto(texto: string, max = 8): string[] {
  const achados = new Set<string>()
  // Ignora as partes de datas e de competências (dd/mm/aaaa, mm/aaaa).
  const semDatas = texto.replace(/\b\d{2}\/\d{2}\/\d{4}\b/g, ' ').replace(/(?<![\d/])\d{2}\/\d{4}(?!\d)/g, ' ')
  for (const m of semDatas.matchAll(/(?<![\w.,])(\d{1,6}(?:,\d{1,2})?)(?![\w])/g)) achados.add(m[1]!.replace(',', '.'))
  return [...achados].slice(0, max)
}

import { z } from 'zod'
import { definirContrato, definirProcedimento, definirValidador, ErroRegra, type Estado, type Procedimento } from '@heild/processos'
import { resolverCom } from '../metas.ts'

/**
 * Gestão e Atendimento · GES-TRIAR-REPASSAR (B3b, decisão do Enzo: o CRM também atende escritórios
 * com um número só de WhatsApp). O integrante do Atendimento recebe a conversa que entrou pelo número
 * único, reconhece quem escreve e o assunto e a repassa ao setor e ao integrante certos, com um resumo
 * escrito pelo SISTEMA (nunca pelo modelo). Na dúvida, pergunta a uma pessoa do Atendimento (cartão).
 *
 * A decisão segue a mesma cascata do Assistente:
 *   1. regras: a escolha que a pessoa fez no menu do chatbot (sempre respeitada) e as palavras-chave
 *      de cada setor (destino único);
 *   2. modelo barato (operário), só quando as regras não decidem;
 *   3. modelo caro (escritor), só quando o barato fica abaixo do limiar (a escalada do motor);
 *   4. assunto misto ou dúvida que continua: cartão "não consegui" para uma pessoa escolher o setor.
 * O chatbot de menu (sem IA) é do CRM e do conector: este procedimento só recebe a escolha.
 */

export const SETORES_DE_DESTINO = ['contabil', 'fiscal', 'dp', 'societario', 'gestao_atendimento'] as const
export type SetorDestino = (typeof SETORES_DE_DESTINO)[number]

const DESCRICAO: Record<SetorDestino, string> = {
  contabil: 'Contábil: lançamentos, extratos, balanço, competência dos documentos, ECD',
  fiscal: 'Fiscal: impostos, guias (DAS, DARF), notas fiscais, certidões, malha e intimações da Receita',
  dp: 'DP: folha de pagamento, funcionários, admissão, férias, rescisão, horas extras, pró-labore',
  societario: 'Societário: contrato social, sócios, endereço da empresa, capital, abertura e baixa',
  gestao_atendimento: 'Atendimento: honorários, boletos do escritório, horário, cadastro, dúvidas gerais',
}

/** Palavras-chave por setor (regras da camada 1). Destino só quando um setor só bate. */
export const PALAVRAS_DO_SETOR: Record<SetorDestino, RegExp[]> = {
  contabil: [/\bbalan[çc]o\b/i, /\bbalancete\b/i, /\bextratos?\b/i, /\blan[çc]amentos?\b/i, /\bECD\b/i, /\bDRE\b/i],
  fiscal: [/\bDAS\b/, /\bDARF\b/i, /\bimpostos?\b/i, /\bnotas? fisca(l|is)\b/i, /\bmalha\b/i, /\bintima[çc][ãa]o\b/i, /\bsimples nacional\b/i],
  dp: [/\bfolha\b/i, /\bf[ée]rias\b/i, /\badmiss[ãa]o\b/i, /\brescis[ãa]o\b/i, /\bhoras? extras?\b/i, /\bfuncion[áa]ri[oa]s?\b/i, /\bpr[óo]-?labore\b/i, /\bholerite\b/i],
  societario: [/\bcontrato social\b/i, /\bs[óo]ci[oa]s?\b/i, /\bcapital social\b/i, /\bjunta comercial\b/i, /\bCNAE\b/i, /\babertura de empresa\b/i],
  gestao_atendimento: [/\bhonor[áa]rios\b/i, /\bsegunda via\b/i, /\bhor[áa]rio de atendimento\b/i, /\bmensalidade do escrit[óo]rio\b/i],
}

export function setoresPorPalavras(texto: string): SetorDestino[] {
  return SETORES_DE_DESTINO.filter((s) => PALAVRAS_DO_SETOR[s].some((r) => r.test(texto)))
}

export const contratoTriagem = definirContrato({
  id: 'ges.triagem.classificar',
  versao: 1,
  classe: 'operario',
  // Provisória: o prompt é da frente de IA (pacotes/contratos-ia).
  instrucao:
    'Você lê as mensagens que um cliente mandou ao número de WhatsApp de um escritório de contabilidade e escolhe o setor que deve cuidar do assunto, entre as opções. ' +
    'Marque misto=true se a mensagem trouxer assuntos de setores diferentes. Se não der para saber o assunto, use confiança baixa. ' +
    'Não responda ao cliente: só escolha o setor.',
  recebe: z
    .object({
      trecho: z.string().max(2000),
      cliente_conhecido: z.boolean(),
      setores: z.array(z.object({ codigo: z.string(), descricao: z.string() }).strict()).length(5),
    })
    .strict(),
  devolve: z.object({ setor: z.enum(SETORES_DE_DESTINO), misto: z.boolean(), confianca: z.number().min(0).max(1), motivo: z.string().min(3).max(140) }).strict(),
  max_tokens_saida: 100,
  campos_externos: ['trecho'],
})

definirValidador({
  nome: 'assunto_unico',
  versao: 1,
  descricao: 'A conversa trata de um assunto só; com assuntos de setores diferentes, uma pessoa decide a quem repassar.',
  dados: z.object({ origem: z.enum(['regra', 'menu', 'modelo', 'pessoa']), misto: z.boolean().nullable() }),
  conferir: ({ origem, misto }) =>
    origem === 'modelo' && misto ? { ok: false, codigo: 'ASSUNTO_MISTO', mensagem: 'A conversa mistura assuntos de setores diferentes; escolha a quem repassar primeiro.' } : { ok: true },
})

definirValidador({
  nome: 'setor_de_destino',
  versao: 1,
  descricao: 'O setor escolhido é um dos setores de destino do escritório.',
  dados: z.object({ setor: z.string() }),
  conferir: ({ setor }) =>
    (SETORES_DE_DESTINO as readonly string[]).includes(setor) ? { ok: true } : { ok: false, codigo: 'SETOR_INVALIDO', escalavel: true, mensagem: `Setor fora das opções: ${setor}.` },
})

interface Lida {
  conversa_id: string
  cliente_id: string | null
  cliente_nome: string | null
  identificado_por: 'conversa' | 'historico' | null
  trecho: string
  menu: SetorDestino | null
  palavras: SetorDestino[]
  regra: { setor: SetorDestino; origem: 'menu' | 'regra'; motivo: string } | null
}

/** A decisão final (menu, regra, operário ou pessoa), com a origem. */
function decidida(s: Estado): { setor: SetorDestino; origem: 'menu' | 'regra' | 'modelo' | 'pessoa'; confianca: number | null; misto: boolean | null; motivo: string } {
  const op = s.saidas.escolher as { pulado?: boolean; setor?: SetorDestino; origem?: string; confianca?: number; misto?: boolean; motivo?: string } | undefined
  if (op && !op.pulado) return { setor: op.setor!, origem: op.origem === 'pessoa' ? 'pessoa' : 'modelo', confianca: op.confianca ?? null, misto: op.misto ?? null, motivo: op.motivo ?? '' }
  const r = (s.saidas.ler_conversa as Lida).regra!
  return { setor: r.setor, origem: r.origem, confianca: null, misto: null, motivo: r.motivo }
}

/** O resumo que vai ao setor: escrito pelo sistema, com o que foi reconhecido e o começo da mensagem. */
function resumo(l: Lida, setor: SetorDestino, origem: string) {
  const quem = l.cliente_nome ? `Cliente ${l.cliente_nome}` : 'Remetente não identificado (confirme quem é antes de responder)'
  const como = origem === 'menu' ? 'escolheu no menu' : origem === 'regra' ? 'assunto reconhecido por palavra-chave' : origem === 'pessoa' ? 'repassado por uma pessoa do Atendimento' : 'assunto reconhecido pelo integrante'
  const trecho = l.trecho.length > 280 ? `${l.trecho.slice(0, 279)}…` : l.trecho
  return `${quem}. Setor ${setor} (${como}). Mensagem: “${trecho}”`
}

export const gesTriarRepassar: Procedimento = definirProcedimento(
  {
    id: 'GES-TRIAR-REPASSAR',
    versao: 1,
    nome: 'Triar e repassar conversa do número único',
    setor: 'gestao_atendimento',
    nivel_maximo: 'executar',
    operacao: 'atendimento.conversa.triar_e_repassar',
    descricao_modelo: 'Reconhece quem escreve e o assunto da conversa do número único e a repassa ao setor e ao integrante certos, com resumo.',
    entrada: z.object({ conversa_id: z.string().min(1).max(80), menu_escolhido: z.enum(SETORES_DE_DESTINO).optional() }).strict(),
    saida: z
      .object({
        conversa_id: z.string(),
        setor: z.enum(SETORES_DE_DESTINO),
        integrante_id: z.string().nullable(),
        responsavel_id: z.string().nullable(),
        cliente_id: z.string().nullable(),
        origem: z.enum(['menu', 'regra', 'modelo', 'pessoa']),
      })
      .strict(),
    orcamento: { centavos: 10, tokens: 10_000 },
    // A conversa pode ser de remetente desconhecido: o cliente vem da conversa, não da entrada.
    cliente: () => null,
    passos: [
      {
        tipo: 'deterministico',
        nome: 'ler_conversa',
        executar: async (s, { tx }): Promise<Lida> => {
          const [c] = await tx`select id, cliente_id, pessoa_id, setor_id from conversa where id = ${s.entrada.conversa_id}`
          if (!c) throw new ErroRegra('CONVERSA_INEXISTENTE', 'Conversa não encontrada.', 'conversa_id')
          const msgs = await tx`select corpo from mensagem where conversa_id = ${c.id} and direcao = 'entrada' and corpo is not null order by criado_em desc limit 10`
          const trecho = msgs.map((m) => String(m.corpo)).reverse().join('\n').slice(-2000)
          if (!trecho.trim()) throw new ErroRegra('CONVERSA_SEM_MENSAGEM', 'A conversa não tem mensagem do cliente para triar.')
          // Quem escreve: a conversa já ligada ao cliente; senão, o histórico da mesma pessoa.
          let cliente_id = (c.cliente_id as string | null) ?? null
          let identificado_por: Lida['identificado_por'] = cliente_id ? 'conversa' : null
          if (!cliente_id && c.pessoa_id) {
            const anteriores = await tx`select distinct cliente_id from conversa where pessoa_id = ${c.pessoa_id} and cliente_id is not null and id <> ${c.id} limit 2`
            if (anteriores.length === 1) {
              cliente_id = anteriores[0]!.cliente_id as string
              identificado_por = 'historico'
            }
          }
          const [cli] = cliente_id ? await tx`select nome from cliente where id = ${cliente_id}` : []
          const menu = (s.entrada.menu_escolhido ?? null) as SetorDestino | null
          const palavras = setoresPorPalavras(trecho)
          const regra = menu
            ? { setor: menu, origem: 'menu' as const, motivo: 'escolha da pessoa no menu' }
            : palavras.length === 1
              ? { setor: palavras[0]!, origem: 'regra' as const, motivo: 'palavras-chave do setor' }
              : null
          return { conversa_id: c.id, cliente_id, cliente_nome: (cli?.nome as string | undefined) ?? null, identificado_por, trecho, menu, palavras, regra }
        },
      },
      {
        tipo: 'operario',
        nome: 'escolher',
        contrato: contratoTriagem,
        pular_se: (s) => (s.saidas.ler_conversa as Lida).regra !== null,
        recebe: (s) => {
          const l = s.saidas.ler_conversa as Lida
          return { trecho: l.trecho, cliente_conhecido: l.cliente_id !== null, setores: SETORES_DE_DESTINO.map((codigo) => ({ codigo, descricao: DESCRICAO[codigo] })) }
        },
      },
      {
        tipo: 'validar',
        nome: 'conferir',
        validadores: ['setor_de_destino', 'confianca_minima:0.9', 'assunto_unico'],
        dados: (s) => {
          const d = decidida(s)
          // O validador de confiança da B2 conhece regra, modelo e pessoa; o menu é uma regra.
          return { setor: d.setor, origem: d.origem === 'menu' ? 'regra' : d.origem, confianca: d.confianca, misto: d.misto }
        },
        sobre: 'escolher',
        ao_falhar: 'escalar',
      },
      {
        tipo: 'aprovacao',
        nome: 'aprovar',
        ferramenta: 'conversa.transferir',
        exigida: 'por_regra',
        esquema: z.object({ conversa_id: z.string(), setor: z.enum(SETORES_DE_DESTINO), resumo: z.string().max(600) }).strict(),
        argumentos: (s) => {
          const d = decidida(s)
          return { conversa_id: s.entrada.conversa_id, setor: d.setor, resumo: resumo(s.saidas.ler_conversa as Lida, d.setor, d.origem) }
        },
        resumo: (s) => {
          const d = decidida(s)
          return `Repassar a conversa ao setor ${d.setor}. ${resumo(s.saidas.ler_conversa as Lida, d.setor, d.origem)}`
        },
      },
      {
        tipo: 'efeito',
        nome: 'repassar',
        ferramenta: 'conversa.transferir',
        aprovacao: 'aprovar',
        executar: async (s, { tx }) => {
          const a = (s.saidas.aprovar as { argumentos: { conversa_id: string; setor: SetorDestino; resumo: string } }).argumentos
          const l = s.saidas.ler_conversa as Lida
          const origem = decidida(s).origem
          // Responsável: quem tem o cliente na carteira naquele setor; senão, o responsável padrão do setor.
          const [cart] = l.cliente_id ? await tx`select usuario_id from carteira_cliente where cliente_id = ${l.cliente_id} and setor_id = ${a.setor} and arquivado_em is null limit 1` : []
          const [set] = await tx`select responsavel_padrao_id from setor where codigo = ${a.setor}`
          const responsavel_id = (cart?.usuario_id as string | undefined) ?? (set?.responsavel_padrao_id as string | null | undefined) ?? null
          const [integ] = await tx`select id from integrante where setor = ${a.setor} and tipo = 'padrao_setor' and situacao = 'ativo' order by criado_em limit 1`
          const linhas = await tx`
            update conversa set setor_id = ${a.setor}, responsavel_id = ${responsavel_id}, resumo = ${a.resumo},
              cliente_id = coalesce(cliente_id, ${l.identificado_por === 'historico' ? l.cliente_id : null}),
              etiquetas = (select array_agg(distinct e) from unnest(etiquetas || array['triada']) e)
            where id = ${a.conversa_id} returning id`
          if (!linhas.length) throw new ErroRegra('CONVERSA_INEXISTENTE', 'A conversa sumiu enquanto era triada.')
          // O integrante do setor de destino é acordado com o resumo (ele não lê o transcript de outra execução).
          if (integ)
            await tx`insert into item_fila (escritorio_id, integrante_id, tipo, status, enfileirado_em, prioridade, resumo)
                     values (${s.execucao.escritorio_id}, ${integ.id}, 'conversa_repassada', 'pendente', now(), 30,
                     ${tx.json({ conversa_id: a.conversa_id, setor: a.setor, resumo: a.resumo, origem } as never)})`
          return {
            dados: { setor: a.setor, integrante_id: (integ?.id as string | undefined) ?? null, responsavel_id, cliente_id: l.cliente_id, origem },
            texto_evento: `Conversa repassada ao setor ${a.setor} (${origem})${l.cliente_id ? '' : ', remetente não identificado'}`,
          }
        },
      },
      {
        tipo: 'concluir',
        nome: 'concluir',
        saida: (s) => ({ conversa_id: s.entrada.conversa_id, ...s.saidas.repassar }),
        acordar: (s) => ({ titulo: `Conversa repassada ao setor ${s.saidas.repassar.setor}`, dados: { conversa_id: s.entrada.conversa_id, setor: s.saidas.repassar.setor } }),
      },
    ],
  },
  resolverCom(),
) as unknown as Procedimento

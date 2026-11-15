import { z } from 'zod'
import { definirContrato, definirProcedimento, definirValidador, ErroRegra, type Estado, type Procedimento, type Tx } from '@heild/processos'
import { resolverCom } from '../metas.ts'
import { comQuemFala, NOME_DO_SETOR } from '../identificacao.ts'

/**
 * GES-TRIAR-REPASSAR v2 (integrada no PR #36). Continua carregada só para as execuções que começaram
 * nela terminarem; a operação inicia a v3 (`triagem-conversa.ts`, conversa natural, decisão do Enzo
 * de 15/11/2026). Não mudar a estrutura: ela entra no hash publicado. As constantes e as palavras-chave
 * daqui são usadas também pela v1 e pela v3.
 *
 * Gestão e Atendimento · GES-TRIAR-REPASSAR: a triagem do número compartilhado de WhatsApp
 * (subplano 04, adendo A; subplano 02, "Triagem do número compartilhado"; respostas do Enzo de
 * 15/11/2026). O integrante de Atendimento reconhece quem escreve e o assunto e roteia a conversa ao
 * setor e ao integrante certos, com um resumo escrito pelo SISTEMA (nunca pelo modelo).
 *
 * Formas de triagem do número (04, A.1):
 *   - `integrante` (padrão com integrantes contratados): sem menu; o integrante decide;
 *   - `menu_e_integrante` (opção): o menu vem antes; a escolha do cliente prevalece, e o integrante só
 *     sugere a transferência por cartão a quem atende, com confiança ≥ 0,8 (04, A.5);
 *   - `menu` e `manual` não passam por aqui (o chatbot sem IA é do CRM, a reserva de quem não contrata).
 *
 * Cascata (decisão 4):
 *   1. regras, sem modelo: escolha do menu; resposta do cliente à pergunta da triagem; e, com o cliente
 *      identificado, o contexto (04, A.4): conversa aberta, resposta a envio do escritório nos últimos
 *      7 dias, um só setor ativo na carteira; por fim, palavras-chave de um setor só;
 *   2. modelo barato (operário): confiança ≥ 0,8 roteia; entre 0,6 e 0,8 roteia e marca
 *      `triagem_incerta`; abaixo de 0,6 (ou assunto misto) pergunta;
 *   3. a pergunta vai ao CLIENTE (fechada, com opções) se a conversa não tem responsável, no máximo
 *      duas vezes; depois disso, setor de entrada com `triagem_sem_acordo`. Com responsável, vai à
 *      PESSOA por cartão. O modelo caro só entra pela escalada do motor (setor fora das opções).
 * Toda mensagem ao cliente leva quem fala: *{integrante} (IA)* (04, A.6).
 */

export const SETORES_DE_DESTINO = ['contabil', 'fiscal', 'dp', 'societario', 'gestao_atendimento'] as const
export type SetorDestino = (typeof SETORES_DE_DESTINO)[number]

export const DESCRICAO: Record<SetorDestino, string> = {
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

/** Limiares do plano (02, "O que faz com a saída"). */
export const LIMIAR_ROTEIA = 0.8
export const LIMIAR_INCERTA = 0.6
/** No máximo duas perguntas ao cliente por conversa (02, "Quando pergunta"). */
export const MAX_PERGUNTAS_AO_CLIENTE = 2
/** Janela da regra "resposta a algo que o escritório mandou" (04, A.4). */
export const DIAS_RESPOSTA_A_ENVIO = 7

const DICA: Record<SetorDestino, string> = {
  contabil: 'balanço, lançamentos, extratos',
  fiscal: 'impostos, guias, notas fiscais',
  dp: 'folha, funcionários, férias',
  societario: 'contrato social, sócios, endereço da empresa',
  gestao_atendimento: 'honorários, cadastro, outros assuntos',
}

// v2: devolve também a alternativa (as opções da pergunta ao cliente).
export const contratoTriagem = definirContrato({
  id: 'ges.triagem.classificar',
  versao: 2,
  classe: 'operario',
  // Provisória: o prompt é da frente de IA (pacotes/contratos-ia).
  instrucao:
    'Você lê as mensagens que um cliente mandou ao número de WhatsApp de um escritório de contabilidade e escolhe o setor que deve cuidar do assunto, entre as opções. ' +
    'Se houver um segundo setor possível, informe-o em alternativa; senão, alternativa=null. ' +
    'Marque misto=true se a mensagem trouxer assuntos de setores diferentes (o setor é o do primeiro assunto e a alternativa, o do outro). ' +
    'Se não der para saber o assunto (saudação, pedido vago), use confiança abaixo de 0,6. ' +
    'Não responda ao cliente: só escolha o setor.',
  recebe: z
    .object({
      trecho: z.string().max(2000),
      cliente_conhecido: z.boolean(),
      setores: z.array(z.object({ codigo: z.string(), descricao: z.string() }).strict()).length(5),
    })
    .strict(),
  devolve: z
    .object({
      setor: z.enum(SETORES_DE_DESTINO),
      alternativa: z.enum(SETORES_DE_DESTINO).nullable(),
      misto: z.boolean(),
      confianca: z.number().min(0).max(1),
      motivo: z.string().min(3).max(140),
    })
    .strict(),
  max_tokens_saida: 120,
  campos_externos: ['trecho'],
})

definirValidador({
  nome: 'setor_de_destino',
  versao: 1,
  descricao: 'O setor escolhido é um dos setores de destino do escritório.',
  dados: z.object({ setor: z.string() }),
  conferir: ({ setor }) =>
    (SETORES_DE_DESTINO as readonly string[]).includes(setor) ? { ok: true } : { ok: false, codigo: 'SETOR_INVALIDO', escalavel: true, mensagem: `Setor fora das opções: ${setor}.` },
})

definirValidador({
  nome: 'triagem_decidivel',
  versao: 1,
  descricao: 'Sem confiança para rotear (abaixo de 0,6 ou assunto misto) e com a conversa já atribuída a alguém, quem decide é essa pessoa, por cartão (não o cliente).',
  dados: z.object({ origem: z.enum(['menu', 'regra', 'integrante', 'pessoa']), confianca: z.number().nullable(), misto: z.boolean().nullable(), tem_responsavel: z.boolean() }),
  conferir: ({ origem, confianca, misto, tem_responsavel }) =>
    origem === 'integrante' && tem_responsavel && (misto || (confianca ?? 0) < LIMIAR_INCERTA)
      ? { ok: false, codigo: 'TRIAGEM_COM_RESPONSAVEL', mensagem: misto ? 'A conversa mistura assuntos de setores diferentes; escolha a quem repassar primeiro.' : 'Não deu para saber o assunto; escolha a quem repassar.' }
      : { ok: true },
})

type Origem = 'menu' | 'regra' | 'integrante' | 'pessoa'
type MotivoRegra = 'menu' | 'resposta_a_pergunta' | 'conversa_aberta' | 'resposta_a_envio' | 'setor_unico' | 'palavra_chave'
interface Opcao { setor: SetorDestino; rotulo: string }

interface Lida {
  conversa_id: string
  triagem: 'integrante' | 'menu_e_integrante'
  setor_entrada: SetorDestino
  cliente_id: string | null
  cliente_nome: string | null
  identificado_por: 'conversa' | 'historico' | null
  tem_responsavel: boolean
  trecho: string
  menu: SetorDestino | null
  palavras: SetorDestino[]
  perguntas_feitas: number
  regra: { setor: SetorDestino; origem: 'menu' | 'regra'; motivo: MotivoRegra } | null
  precisa_modelo: boolean
  integrante: { id: string | null; nome: string; falou_por_ultimo: boolean }
}

interface Decisao {
  acao: 'rotear' | 'perguntar' | 'entrada_padrao'
  setor: SetorDestino | null
  origem: Origem
  motivo_regra: MotivoRegra | null
  confianca: number | null
  incerta: boolean
  opcoes: Opcao[] | null
  texto_pergunta: string | null
  sugestao: { setor: SetorDestino; confianca: number; motivo: string; cartao: boolean } | null
}

const MOTIVO_TEXTO: Record<MotivoRegra, string> = {
  menu: 'escolheu no menu',
  resposta_a_pergunta: 'respondeu à pergunta da triagem',
  conversa_aberta: 'tem conversa aberta com o setor',
  resposta_a_envio: `respondeu a algo que o setor mandou nos últimos ${DIAS_RESPOSTA_A_ENVIO} dias`,
  setor_unico: 'tem um só setor ativo na carteira',
  palavra_chave: 'assunto reconhecido por palavra-chave',
}

type SaidaOperario = { pulado?: boolean; setor?: SetorDestino; alternativa?: SetorDestino | null; origem?: string; confianca?: number; misto?: boolean; motivo?: string }

/** A decisão de setor (regra, menu, integrante ou pessoa), antes de aplicar os limiares. */
function decidida(s: Estado): { setor: SetorDestino; origem: Origem; motivo_regra: MotivoRegra | null; confianca: number | null; misto: boolean | null; alternativa: SetorDestino | null; motivo: string } {
  const l = s.saidas.ler_conversa as Lida
  if (l.regra) return { setor: l.regra.setor, origem: l.regra.origem, motivo_regra: l.regra.motivo, confianca: null, misto: null, alternativa: null, motivo: MOTIVO_TEXTO[l.regra.motivo] }
  const op = s.saidas.escolher as SaidaOperario
  return {
    setor: op.setor!,
    origem: op.origem === 'pessoa' ? 'pessoa' : 'integrante',
    motivo_regra: null,
    confianca: op.confianca ?? null,
    misto: op.misto ?? null,
    alternativa: op.alternativa ?? null,
    motivo: op.motivo ?? '',
  }
}

/** A pergunta fechada ao cliente (02, "Quando pergunta"): até dois setores prováveis e "outro assunto". */
function pergunta(l: Lida, d: ReturnType<typeof decidida>): { opcoes: Opcao[]; texto: string } {
  const provaveis = [...new Set([d.setor, d.alternativa].filter((x): x is SetorDestino => x !== null && x !== l.setor_entrada))].slice(0, 2)
  const base = provaveis.length ? provaveis : SETORES_DE_DESTINO.filter((x) => x !== l.setor_entrada)
  const opcoes: Opcao[] = [...base.map((setor) => ({ setor, rotulo: `${NOME_DO_SETOR[setor]} (${DICA[setor]})` })), { setor: l.setor_entrada, rotulo: 'Outro assunto' }]
  const abertura = l.perguntas_feitas === 0 ? 'Para passar sua mensagem ao setor certo: é sobre' : 'Ainda não consegui entender o assunto. É sobre'
  const texto = `${abertura}\n${opcoes.map((o, i) => `${i + 1}. ${o.rotulo}`).join('\n')}\nResponda com o número.`
  return { opcoes, texto: comQuemFala({ tipo: 'integrante', nome: l.integrante.nome }, texto, l.integrante.falou_por_ultimo ? { tipo: 'integrante', nome: l.integrante.nome } : null) }
}

/** O resumo que vai ao setor: escrito pelo sistema, com o que foi reconhecido e o começo da mensagem. */
function resumo(l: Lida, d: Decisao) {
  const quem = l.cliente_nome ? `Cliente ${l.cliente_nome}` : 'Remetente não identificado (confirme quem é antes de responder)'
  const como =
    d.acao === 'entrada_padrao'
      ? `sem acordo depois de ${l.perguntas_feitas} perguntas ao cliente`
      : d.motivo_regra
        ? MOTIVO_TEXTO[d.motivo_regra]
        : d.origem === 'pessoa'
          ? 'repassado por uma pessoa do Atendimento'
          : `assunto reconhecido pelo integrante${d.incerta ? ', triagem incerta: confira' : ''}`
  const trecho = l.trecho.length > 280 ? `${l.trecho.slice(0, 279)}…` : l.trecho
  return `${quem}. Setor ${NOME_DO_SETOR[d.setor!]} (${como}). Mensagem: “${trecho}”`
}

const naoPergunta = (s: Estado) => (s.saidas.decidir as Decisao).acao === 'perguntar'
const semSugestao = (s: Estado) => !(s.saidas.decidir as Decisao).sugestao
const semCartaoDeSugestao = (s: Estado) => !(s.saidas.decidir as Decisao).sugestao?.cartao

/** Responsável no setor: quem tem o cliente na carteira; senão, o responsável padrão do setor. */
async function responsavelNoSetor(tx: Tx, cliente_id: string | null, setor: SetorDestino) {
  const [cart] = cliente_id ? await tx`select usuario_id from carteira_cliente where cliente_id = ${cliente_id} and setor_id = ${setor} and arquivado_em is null limit 1` : []
  const [set] = await tx`select responsavel_padrao_id from setor where codigo = ${setor}`
  const [integ] = await tx`select id from integrante where setor = ${setor} and tipo = 'padrao_setor' and situacao = 'ativo' order by criado_em limit 1`
  return { responsavel_id: (cart?.usuario_id as string | undefined) ?? (set?.responsavel_padrao_id as string | null | undefined) ?? null, integrante_id: (integ?.id as string | undefined) ?? null }
}

const SAIDA = z
  .object({
    conversa_id: z.string(),
    acao: z.enum(['rotear', 'perguntar', 'entrada_padrao']),
    setor: z.enum(SETORES_DE_DESTINO).nullable(),
    setor_roteado: z.enum(SETORES_DE_DESTINO).nullable(),
    origem: z.enum(['menu', 'regra', 'integrante', 'pessoa']),
    motivo_regra: z.string().nullable(),
    incerta: z.boolean(),
    integrante_id: z.string().nullable(),
    responsavel_id: z.string().nullable(),
    cliente_id: z.string().nullable(),
    sugestao: z.object({ setor: z.enum(SETORES_DE_DESTINO), confianca: z.number(), cartao: z.boolean() }).nullable(),
    transferido: z.boolean(),
    pergunta: z.object({ numero: z.number(), opcoes: z.array(z.string()) }).nullable(),
  })
  .strict()

export const gesTriarRepassarV2: Procedimento = definirProcedimento(
  {
    id: 'GES-TRIAR-REPASSAR',
    // v2: o desenho do plano (integrante como padrão, limiares 0,8/0,6, pergunta ao cliente, contexto,
    // menu e integrante). A v1 (menu como regra principal, limiar 0,9) segue carregada em triagem-v1.ts.
    versao: 2,
    nome: 'Triar conversa do número compartilhado',
    setor: 'gestao_atendimento',
    nivel_maximo: 'executar',
    operacao: 'atendimento.conversa.triar_e_repassar',
    descricao_modelo: 'Reconhece quem escreve e o assunto da conversa do número compartilhado e a roteia ao setor e ao integrante certos, com resumo; na dúvida, pergunta.',
    entrada: z
      .object({
        conversa_id: z.string().min(1).max(80),
        triagem: z.enum(['integrante', 'menu_e_integrante']).optional(),
        menu_escolhido: z.enum(SETORES_DE_DESTINO).optional(),
        setor_entrada: z.enum(SETORES_DE_DESTINO).optional(),
      })
      .strict(),
    saida: SAIDA,
    orcamento: { centavos: 10, tokens: 10_000 },
    // A conversa pode ser de remetente desconhecido: o cliente vem da conversa, não da entrada.
    cliente: () => null,
    passos: [
      {
        tipo: 'deterministico',
        nome: 'ler_conversa',
        executar: async (s, { tx }): Promise<Lida> => {
          const triagem = s.entrada.triagem ?? 'integrante'
          const menu = (s.entrada.menu_escolhido ?? null) as SetorDestino | null
          if (menu && triagem !== 'menu_e_integrante') throw new ErroRegra('MENU_SEM_MENU', 'Escolha de menu só existe na triagem "menu e integrante".', 'menu_escolhido')
          const setor_entrada = (s.entrada.setor_entrada ?? 'gestao_atendimento') as SetorDestino
          const [c] = await tx`select id, cliente_id, pessoa_id, responsavel_id from conversa where id = ${s.entrada.conversa_id}`
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

          // Perguntas que a triagem já fez nesta conversa e a resposta do cliente à última.
          const perguntas = await tx`select criado_em, extras from mensagem where conversa_id = ${c.id} and direcao = 'saida' and extras->>'tipo' = 'pergunta_triagem' order by criado_em desc limit 5`
          let respondida: SetorDestino | null = null
          if (perguntas.length) {
            const opcoes = ((perguntas[0]!.extras as { opcoes?: Opcao[] }).opcoes ?? []).filter((o) => (SETORES_DE_DESTINO as readonly string[]).includes(o.setor))
            const [resp] = await tx`select corpo from mensagem where conversa_id = ${c.id} and direcao = 'entrada' and corpo is not null and criado_em > ${perguntas[0]!.criado_em} order by criado_em desc limit 1`
            const texto = String(resp?.corpo ?? '').trim()
            const n = /^(?:op[çc][ãa]o\s*)?([1-9])\b/i.exec(texto)
            if (n && opcoes[Number(n[1]) - 1]) respondida = opcoes[Number(n[1]) - 1]!.setor
            else {
              const porNome = opcoes.filter((o) => o.rotulo !== 'Outro assunto' && new RegExp(`\\b${NOME_DO_SETOR[o.setor]}\\b`, 'i').test(texto))
              if (porNome.length === 1) respondida = porNome[0]!.setor
            }
          }

          // Contexto do cliente identificado (04, A.4), nesta ordem.
          let contexto: { setor: SetorDestino; motivo: MotivoRegra } | null = null
          if (cliente_id) {
            // 1. Conversa aberta (não resolvida, ou resolvida com a última mensagem há menos de 24 h) já num setor;
            //    a que espera triagem no setor de entrada não conta.
            const abertas = await tx`
              select distinct setor_id from conversa
              where cliente_id = ${cliente_id} and id <> ${c.id} and arquivado_em is null
                and (status <> 'resolvida' or ultima_mensagem_em > now() - interval '24 hours')
                and (setor_id <> ${setor_entrada} or 'triada' = any(etiquetas))
              limit 2`
            if (abertas.length === 1) contexto = { setor: abertas[0]!.setor_id as SetorDestino, motivo: 'conversa_aberta' }
            // 2. Resposta a algo que o escritório mandou nos últimos 7 dias.
            if (!contexto) {
              const [envio] = await tx`
                select cv.setor_id from mensagem m join conversa cv on cv.id = m.conversa_id
                where cv.cliente_id = ${cliente_id} and cv.id <> ${c.id} and m.direcao = 'saida' and m.autor_tipo in ('usuario', 'integrante', 'sistema')
                  and m.criado_em > now() - make_interval(days => ${DIAS_RESPOSTA_A_ENVIO}) and coalesce(m.extras->>'tipo', '') <> 'pergunta_triagem'
                order by m.criado_em desc limit 1`
              if (envio) contexto = { setor: envio.setor_id as SetorDestino, motivo: 'resposta_a_envio' }
            }
            // 3. Um só setor ativo na carteira.
            if (!contexto) {
              const setores = await tx`select distinct setor_id from carteira_cliente where cliente_id = ${cliente_id} and arquivado_em is null and setor_id is not null limit 2`
              if (setores.length === 1) contexto = { setor: setores[0]!.setor_id as SetorDestino, motivo: 'setor_unico' }
            }
            if (contexto && !(SETORES_DE_DESTINO as readonly string[]).includes(contexto.setor)) contexto = null
          }

          const palavras = setoresPorPalavras(trecho)
          const regra: Lida['regra'] = menu
            ? { setor: menu, origem: 'menu', motivo: 'menu' }
            : respondida
              ? { setor: respondida, origem: 'regra', motivo: 'resposta_a_pergunta' }
              : contexto
                ? { setor: contexto.setor, origem: 'regra', motivo: contexto.motivo }
                : palavras.length === 1
                  ? { setor: palavras[0]!, origem: 'regra', motivo: 'palavra_chave' }
                  : null
          // Com o menu, o integrante ainda lê para sugerir, salvo quando as palavras-chave confirmam a escolha.
          const precisa_modelo = regra === null || (regra.origem === 'menu' && !(palavras.length === 1 && palavras[0] === menu))

          const [integ] = await tx`select id, nome_exibido as nome from integrante where setor = 'gestao_atendimento' and tipo = 'padrao_setor' and situacao = 'ativo' order by criado_em limit 1`
          const [ultima] = await tx`select autor_tipo, autor_id from mensagem where conversa_id = ${c.id} and direcao = 'saida' order by criado_em desc limit 1`
          return {
            conversa_id: c.id,
            triagem,
            setor_entrada,
            cliente_id,
            cliente_nome: (cli?.nome as string | undefined) ?? null,
            identificado_por,
            tem_responsavel: c.responsavel_id !== null,
            trecho,
            menu,
            palavras,
            perguntas_feitas: perguntas.length,
            regra,
            precisa_modelo,
            integrante: {
              id: (integ?.id as string | undefined) ?? null,
              nome: (integ?.nome as string | undefined) ?? 'Integrante de Atendimento',
              falou_por_ultimo: Boolean(integ && ultima?.autor_tipo === 'integrante' && ultima.autor_id === integ.id),
            },
          }
        },
      },
      {
        tipo: 'operario',
        nome: 'escolher',
        contrato: contratoTriagem,
        pular_se: (s) => !(s.saidas.ler_conversa as Lida).precisa_modelo,
        recebe: (s) => {
          const l = s.saidas.ler_conversa as Lida
          return { trecho: l.trecho, cliente_conhecido: l.cliente_id !== null, setores: SETORES_DE_DESTINO.map((codigo) => ({ codigo, descricao: DESCRICAO[codigo] })) }
        },
      },
      {
        tipo: 'validar',
        nome: 'conferir',
        validadores: ['setor_de_destino', 'triagem_decidivel'],
        dados: (s) => {
          const d = decidida(s)
          return { setor: d.setor, origem: d.origem, confianca: d.confianca, misto: d.misto, tem_responsavel: (s.saidas.ler_conversa as Lida).tem_responsavel }
        },
        sobre: 'escolher',
        ao_falhar: 'escalar',
      },
      {
        tipo: 'deterministico',
        nome: 'decidir',
        executar: (s): Decisao => {
          const l = s.saidas.ler_conversa as Lida
          const d = decidida(s)
          const op = s.saidas.escolher as SaidaOperario
          // Menu e integrante: vale a escolha do cliente; o integrante só sugere (04, A.5).
          const sugestao =
            d.origem === 'menu' && op && !op.pulado && op.setor && op.setor !== d.setor
              ? { setor: op.setor, confianca: op.confianca ?? 0, motivo: op.motivo ?? '', cartao: (op.confianca ?? 0) >= LIMIAR_ROTEIA && !op.misto }
              : null
          const base = { origem: d.origem, motivo_regra: d.motivo_regra, confianca: d.confianca, sugestao, opcoes: null, texto_pergunta: null }
          if (d.origem !== 'integrante') return { ...base, acao: 'rotear', setor: d.setor, incerta: false }
          const c = d.confianca ?? 0
          if (!d.misto && c >= LIMIAR_ROTEIA) return { ...base, acao: 'rotear', setor: d.setor, incerta: false }
          if (!d.misto && c >= LIMIAR_INCERTA) return { ...base, acao: 'rotear', setor: d.setor, incerta: true }
          if (l.perguntas_feitas < MAX_PERGUNTAS_AO_CLIENTE) {
            const p = pergunta(l, d)
            return { ...base, acao: 'perguntar', setor: null, incerta: false, opcoes: p.opcoes, texto_pergunta: p.texto }
          }
          return { ...base, acao: 'entrada_padrao', setor: l.setor_entrada, incerta: false }
        },
      },
      // Caminho A: perguntar ao cliente. `conversa.responder` é irreversível no catálogo: sai sempre com cartão,
      // até o catálogo liberar a categoria de mensagem por modelo do tema (GES-062).
      {
        tipo: 'aprovacao',
        nome: 'aprovar_pergunta',
        ferramenta: 'conversa.responder',
        // Texto montado pelo sistema (modelo fixo, sem conteúdo do modelo de IA): sem revisor de risco.
        exigida: 'sempre',
        pular_se: (s) => !naoPergunta(s),
        esquema: z.object({ conversa_id: z.string(), texto: z.string().min(1).max(1000) }).strict(),
        argumentos: (s) => ({ conversa_id: s.entrada.conversa_id, texto: (s.saidas.decidir as Decisao).texto_pergunta! }),
        resumo: (s) => `Perguntar ao cliente o assunto, para saber a qual setor repassar (pergunta ${(s.saidas.ler_conversa as Lida).perguntas_feitas + 1} de ${MAX_PERGUNTAS_AO_CLIENTE}).`,
        cartoes: (s) => [{ tipo: 'aviso', titulo: 'Mensagem que vai ao cliente', texto: (s.saidas.decidir as Decisao).texto_pergunta! }],
      },
      {
        tipo: 'efeito',
        nome: 'perguntar',
        ferramenta: 'conversa.responder',
        aprovacao: 'aprovar_pergunta',
        pular_se: (s) => !naoPergunta(s),
        executar: async (s, { tx }) => {
          const a = (s.saidas.aprovar_pergunta as { argumentos: { conversa_id: string; texto: string } }).argumentos
          const l = s.saidas.ler_conversa as Lida
          const d = s.saidas.decidir as Decisao
          // A mensagem fica na conversa para o conector enviar (status de entrega vazio = a enviar).
          await tx`insert into mensagem (escritorio_id, conversa_id, direcao, canal, autor_tipo, autor_id, corpo, extras)
                   values (${s.execucao.escritorio_id}, ${a.conversa_id}, 'saida', 'whatsapp', 'integrante', ${l.integrante.id}, ${a.texto},
                   ${tx.json({ tipo: 'pergunta_triagem', opcoes: d.opcoes, execucao_id: s.execucao.id } as never)})`
          await tx`update conversa set status = 'aguardando_cliente', ultima_mensagem_em = now(),
                     etiquetas = (select array_agg(distinct e) from unnest(etiquetas || array['triagem_perguntou']) e)
                   where id = ${a.conversa_id}`
          return { dados: { numero: l.perguntas_feitas + 1, opcoes: d.opcoes!.map((o) => o.setor) }, texto_evento: `Triagem perguntou ao cliente o assunto (${l.perguntas_feitas + 1} de ${MAX_PERGUNTAS_AO_CLIENTE})` }
        },
      },
      // Caminho B: rotear ao setor, com o resumo como nota interna.
      {
        tipo: 'aprovacao',
        nome: 'aprovar',
        ferramenta: 'conversa.rotear',
        exigida: 'por_regra',
        pular_se: naoPergunta,
        esquema: z.object({ conversa_id: z.string(), setor: z.enum(SETORES_DE_DESTINO), resumo: z.string().max(600) }).strict(),
        argumentos: (s) => {
          const d = s.saidas.decidir as Decisao
          return { conversa_id: s.entrada.conversa_id, setor: d.setor!, resumo: resumo(s.saidas.ler_conversa as Lida, d) }
        },
        resumo: (s) => {
          const d = s.saidas.decidir as Decisao
          return `Rotear a conversa ao setor ${NOME_DO_SETOR[d.setor!]}. ${resumo(s.saidas.ler_conversa as Lida, d)}`
        },
      },
      {
        tipo: 'efeito',
        nome: 'repassar',
        ferramenta: 'conversa.rotear',
        aprovacao: 'aprovar',
        pular_se: naoPergunta,
        executar: async (s, { tx }) => {
          const a = (s.saidas.aprovar as { argumentos: { conversa_id: string; setor: SetorDestino; resumo: string } }).argumentos
          const l = s.saidas.ler_conversa as Lida
          const d = s.saidas.decidir as Decisao
          const { responsavel_id, integrante_id } = await responsavelNoSetor(tx, l.cliente_id, a.setor)
          const etiquetas = ['triada', ...(d.incerta ? ['triagem_incerta'] : []), ...(d.acao === 'entrada_padrao' ? ['triagem_sem_acordo'] : [])]
          const roteamento = { origem_roteamento: d.origem, escolha_cliente: l.menu, triagem: { motivo_regra: d.motivo_regra, confianca: d.confianca, incerta: d.incerta, execucao_id: s.execucao.id } }
          const linhas = await tx`
            update conversa set setor_id = ${a.setor}, responsavel_id = ${responsavel_id}, resumo = ${a.resumo},
              cliente_id = coalesce(cliente_id, ${l.identificado_por === 'historico' ? l.cliente_id : null}),
              etiquetas = (select array_agg(distinct e) from unnest(etiquetas || ${etiquetas}::text[]) e),
              extras = coalesce(extras, '{}'::jsonb) || ${tx.json(roteamento as never)}
            where id = ${a.conversa_id} returning id`
          if (!linhas.length) throw new ErroRegra('CONVERSA_INEXISTENTE', 'A conversa sumiu enquanto era triada.')
          // O resumo vai como nota interna no topo da conversa de destino (02, "Saída no formato padrão").
          await tx`insert into mensagem (escritorio_id, conversa_id, direcao, canal, autor_tipo, autor_id, corpo, extras)
                   values (${s.execucao.escritorio_id}, ${a.conversa_id}, 'nota_interna', 'sistema', 'integrante', ${l.integrante.id}, ${a.resumo},
                   ${tx.json({ tipo: 'resumo_triagem', execucao_id: s.execucao.id } as never)})`
          // O integrante do setor de destino é acordado com o resumo (ele não lê o transcript de outra execução).
          if (integrante_id)
            await tx`insert into item_fila (escritorio_id, integrante_id, tipo, status, enfileirado_em, prioridade, resumo)
                     values (${s.execucao.escritorio_id}, ${integrante_id}, 'conversa_repassada', 'pendente', now(), 30,
                     ${tx.json({ conversa_id: a.conversa_id, setor: a.setor, resumo: a.resumo, origem: d.origem, incerta: d.incerta } as never)})`
          return {
            dados: { setor: a.setor, integrante_id, responsavel_id, cliente_id: l.cliente_id },
            texto_evento: `Conversa roteada ao setor ${a.setor} (${d.origem}${d.motivo_regra ? `: ${d.motivo_regra}` : ''}${d.incerta ? ', triagem incerta' : ''}${d.acao === 'entrada_padrao' ? ', sem acordo' : ''})${l.cliente_id ? '' : ', remetente não identificado'}`,
          }
        },
      },
      // Menu e integrante discordam: registra a sugestão e, com confiança alta, deixa o cartão a quem atende.
      {
        tipo: 'efeito',
        nome: 'divergir',
        ferramenta: 'conversa.triagem_divergir',
        pular_se: semSugestao,
        executar: async (s, { tx }) => {
          const d = s.saidas.decidir as Decisao
          const g = d.sugestao!
          await tx`update conversa set extras = coalesce(extras, '{}'::jsonb) || ${tx.json({ sugestao_integrante: { setor: g.setor, confianca: g.confianca } } as never)} where id = ${s.entrada.conversa_id}`
          return {
            dados: { setor: g.setor, confianca: g.confianca, cartao: g.cartao },
            texto_evento: `O cliente escolheu ${d.setor} no menu e o integrante sugere ${g.setor} (confiança ${g.confianca.toFixed(2)}); vale a escolha do cliente${g.cartao ? ', com cartão de transferência' : ''}`,
          }
        },
      },
      {
        tipo: 'aprovacao',
        nome: 'sugerir',
        ferramenta: 'conversa.transferir',
        exigida: 'sempre',
        pular_se: semCartaoDeSugestao,
        esquema: z.object({ conversa_id: z.string(), setor: z.enum(SETORES_DE_DESTINO), manter_numero: z.boolean() }).strict(),
        argumentos: (s) => ({ conversa_id: s.entrada.conversa_id, setor: (s.saidas.decidir as Decisao).sugestao!.setor, manter_numero: true }),
        resumo: (s) => {
          const g = (s.saidas.decidir as Decisao).sugestao!
          return `Parece ser do ${NOME_DO_SETOR[g.setor]}${g.motivo ? ` (${g.motivo})` : ''}. Transferir?`
        },
      },
      {
        tipo: 'efeito',
        nome: 'transferir',
        ferramenta: 'conversa.transferir',
        aprovacao: 'sugerir',
        pular_se: semCartaoDeSugestao,
        executar: async (s, { tx }) => {
          const a = (s.saidas.sugerir as { argumentos: { conversa_id: string; setor: SetorDestino } }).argumentos
          const l = s.saidas.ler_conversa as Lida
          const { responsavel_id, integrante_id } = await responsavelNoSetor(tx, l.cliente_id, a.setor)
          await tx`update conversa set setor_id = ${a.setor}, responsavel_id = ${responsavel_id},
                     extras = coalesce(extras, '{}'::jsonb) || ${tx.json({ origem_roteamento: 'pessoa' } as never)}
                   where id = ${a.conversa_id}`
          if (integrante_id)
            await tx`insert into item_fila (escritorio_id, integrante_id, tipo, status, enfileirado_em, prioridade, resumo)
                     values (${s.execucao.escritorio_id}, ${integrante_id}, 'conversa_repassada', 'pendente', now(), 30,
                     ${tx.json({ conversa_id: a.conversa_id, setor: a.setor, origem: 'pessoa' } as never)})`
          return { dados: { setor: a.setor, integrante_id, responsavel_id }, texto_evento: `Conversa transferida ao setor ${a.setor} pela sugestão da triagem, no mesmo número` }
        },
      },
      {
        tipo: 'concluir',
        nome: 'concluir',
        saida: (s): z.infer<typeof SAIDA> => {
          const d = s.saidas.decidir as Decisao
          const l = s.saidas.ler_conversa as Lida
          const r = s.saidas.repassar as { pulado?: boolean; setor?: SetorDestino; integrante_id?: string | null; responsavel_id?: string | null }
          const t = s.saidas.transferir as { pulado?: boolean; setor?: SetorDestino; integrante_id?: string | null; responsavel_id?: string | null }
          const p = s.saidas.perguntar as { pulado?: boolean; numero?: number; opcoes?: string[] }
          const final = t && !t.pulado ? t : r && !r.pulado ? r : null
          return {
            conversa_id: s.entrada.conversa_id,
            acao: d.acao,
            setor: final?.setor ?? null,
            setor_roteado: r && !r.pulado ? r.setor! : null,
            origem: d.origem,
            motivo_regra: d.motivo_regra,
            incerta: d.incerta,
            integrante_id: final?.integrante_id ?? null,
            responsavel_id: final?.responsavel_id ?? null,
            cliente_id: l.cliente_id,
            sugestao: d.sugestao ? { setor: d.sugestao.setor, confianca: d.sugestao.confianca, cartao: d.sugestao.cartao } : null,
            transferido: Boolean(t && !t.pulado),
            pergunta: p && !p.pulado ? { numero: p.numero!, opcoes: p.opcoes! } : null,
          }
        },
        acordar: (s) => {
          const d = s.saidas.decidir as Decisao
          const setor = (s.saidas.transferir as { setor?: string })?.setor ?? (s.saidas.repassar as { setor?: string })?.setor
          return d.acao === 'perguntar'
            ? { titulo: 'Triagem perguntou o assunto ao cliente', dados: { conversa_id: s.entrada.conversa_id } }
            : { titulo: `Conversa repassada ao setor ${setor}`, dados: { conversa_id: s.entrada.conversa_id, setor } }
        },
      },
    ],
  },
  resolverCom(),
) as unknown as Procedimento

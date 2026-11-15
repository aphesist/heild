import { createHash } from 'node:crypto'
import {
  comEscritorio,
  ErroPermissao,
  ErroRegra,
  proporMemoria,
  type ContextoExec,
  type Motor,
  type OpcoesInicio,
  type PortaEventos,
  type Sql,
} from '@heild/processos'
import type { Integrante } from './contrato.ts'
import { integrantesContabil, pacoteDoProcedimento } from './integrantes.ts'

/**
 * A execução dos integrantes sobre o motor da B2 (decisões 1, 2, 5 e 6):
 *  - configuração compartilhada por setor, execuções isoladas (uma `execucao` por pedido);
 *  - fila com prioridade (chat > evento > job) e limite de simultâneas por setor, gravados em
 *    `limite_execucao` a partir do contrato de cada integrante;
 *  - custo da bolsa do setor, com o cartão opcional "Para quem quer rotear esta atividade?";
 *  - memória do setor só muda por proposta aprovada por uma pessoa.
 */

const mesAtual = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' }).slice(0, 7)

/**
 * Instala os integrantes num escritório: a linha do integrante compartilhado por setor, o limite de
 * execuções simultâneas do setor e, se pedido, as bolsas do mês (setores e a do roteamento).
 */
export async function instalarIntegrantes(sql: Sql, escritorio_id: string, o: { integrantes?: Integrante[]; bolsas?: Record<string, number> } = {}) {
  const integrantes = o.integrantes ?? integrantesContabil
  await comEscritorio(sql, escritorio_id, async (tx) => {
    for (const i of integrantes) {
      await tx`insert into integrante (escritorio_id, id, tipo, setor, nome_exibido, canal_aviso, situacao)
               values (${escritorio_id}, ${i.id}, 'padrao_setor', ${i.setor}, ${i.nome}, 'chat', 'ativo')
               on conflict (escritorio_id, id) do update set setor = excluded.setor, nome_exibido = excluded.nome_exibido`
      await tx`insert into limite_execucao (escritorio_id, escopo, chave, maximo) values (${escritorio_id}, 'setor', ${i.setor}, ${i.limites.simultaneas})
               on conflict (escritorio_id, escopo, chave) do update set maximo = excluded.maximo`
    }
    const segundoPlano = Math.min(...integrantes.map((i) => i.limites.segundo_plano_por_pessoa))
    await tx`insert into limite_execucao (escritorio_id, escopo, chave, maximo) values (${escritorio_id}, 'pessoa_segundo_plano', '*', ${segundoPlano})
             on conflict (escritorio_id, escopo, chave) do update set maximo = excluded.maximo`
    for (const [setor, saldo] of Object.entries(o.bolsas ?? {}))
      await tx`insert into bolsa_setor (escritorio_id, setor, mes, saldo_centavos) values (${escritorio_id}, ${setor}, ${mesAtual()}, ${saldo})
               on conflict (escritorio_id, setor, mes) do update set saldo_centavos = excluded.saldo_centavos`
  })
}

/**
 * O integrante inicia trabalho (evento, job ou pedido de pessoa). Decisão 2: só procedimentos do
 * pacote dele, nunca um fluxo improvisado. Evento e job perguntam "Para quem quer rotear esta
 * atividade?" quando o integrante está configurado assim (decisão 5).
 */
export async function iniciarPeloIntegrante(motor: Motor, ctx: ContextoExec, integrante: Integrante, procedimento_id: string, entrada: unknown, o: OpcoesInicio = {}) {
  const pacote = integrante.procedimentos.find((p) => p.procedimento.id === procedimento_id)
  if (!pacote) throw new ErroRegra('FORA_DO_PACOTE', `O integrante ${integrante.nome} não tem o procedimento ${procedimento_id}.`)
  const fundo = ctx.origem === 'evento' || ctx.origem === 'job'
  return motor.iniciar(ctx, procedimento_id, entrada, {
    integrante_id: integrante.id,
    perguntar_responsavel: fundo && integrante.perguntar_responsavel && !o.responsavel_id,
    ...o,
  })
}

/**
 * Decisão 6: o que muda o comportamento de todos nasce como proposta. Quando uma pessoa resolveu um
 * cartão "não consegui", o integrante propõe guardar a correção na memória do setor; só quem gere o
 * setor (ou o Administrador) aprova, e só então ela vale para as próximas execuções.
 */
export async function aprenderComCartao(sql: Sql, eventos: PortaEventos, ctx: ContextoExec, execucao_id: string) {
  const achado = await comEscritorio(sql, ctx.escritorio_id, async (tx) => {
    const [ex] = await tx`select procedimento_id, setor, entrada from execucao where id = ${execucao_id}`
    if (!ex) return null
    const [c] = await tx`select id, argumentos, decidido_por from cartao_aprovacao where execucao_id = ${execucao_id} and tipo = 'nao_consegui' and status = 'editado_e_aprovado'
                         order by decidido_em desc limit 1`
    const [doc] = ex.entrada?.documento_id ? await tx`select metadados->>'texto_extraido' as texto from documento where id = ${ex.entrada.documento_id}` : []
    return { ex, c, texto: (doc?.texto as string | undefined) ?? '' }
  })
  if (!achado) throw new ErroRegra('EXECUCAO_INEXISTENTE', 'Execução não encontrada.')
  if (!achado.c) throw new ErroRegra('SEM_CORRECAO', 'Não há correção de pessoa nesta execução para aprender.')
  if (!pacoteDoProcedimento(achado.ex.procedimento_id)) throw new ErroRegra('PROCEDIMENTO_DESCONHECIDO', 'Procedimento sem integrante.')
  if (ctx.ator.tipo === 'pessoa_cliente') throw new ErroPermissao('integrante.aprender', 'Não disponível no app do cliente.')
  const assinatura = createHash('sha256').update(achado.texto).digest('hex').slice(0, 16)
  return proporMemoria(sql, eventos, ctx, {
    setor: achado.ex.setor,
    chave: `correcao:${achado.ex.procedimento_id}:${assinatura}`,
    valor: { decisao: achado.c.argumentos, decidido_por: achado.c.decidido_por, execucao_id },
    motivo: `Uma pessoa corrigiu ${achado.ex.procedimento_id} no cartão "não consegui"; guardar para os próximos casos iguais.`,
  })
}

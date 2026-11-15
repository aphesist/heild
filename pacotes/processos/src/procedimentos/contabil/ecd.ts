import { z } from 'zod'
import { ErroRegra } from '../../contexto.ts'
import { definirProcedimento } from '../../motor/definicao.ts'
import { definirContrato } from '../../operarios/contrato.ts'
import { Conta } from '../../validadores/contabil.ts'
import { contratoRevisar, linhaDaRevisao } from '../revisor.ts'

/**
 * CTB-ECD-TRANSMITIR · Conferir e transmitir a ECD do cliente (Contábil).
 *
 * Por que este é de referência: é o ato irreversível típico do setor. O caminho todo é código:
 * carregar o arquivo já lido, conferir por regra (CNPJ, exercício, partidas, saldos, competências
 * fechadas, entrega repetida), separar as contas com variação atípica e só então pedir a um
 * operário barato que aponte, entre ELAS, o que merece atenção (texto curto, sem número). O cartão
 * de aprovação é sempre humano (a ferramenta é irreversível) e a transmissão sai com os argumentos
 * exatos que a pessoa aprovou, uma vez só, pela chave (cliente, exercício).
 */

const reais = (c: number) => (c / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export const contratoApontarAtencao = definirContrato({
  id: 'ctb.ecd.apontar_atencao',
  versao: 1,
  classe: 'operario',
  // Provisória: o prompt é da frente de IA (pacotes/contratos-ia).
  instrucao:
    'Você confere a ECD de um cliente. Recebe só as contas com variação atípica que o sistema separou. ' +
    'Aponte no máximo 10 que uma pessoa deve olhar antes de transmitir, com um motivo curto. ' +
    'Use apenas códigos da lista. Não escreva números no motivo.',
  recebe: z
    .object({
      exercicio: z.string().regex(/^\d{4}$/),
      contas_atipicas: z.array(z.object({ conta_codigo: z.string(), nome: z.string(), variacao_percentual: z.number() }).strict()).min(1).max(30),
    })
    .strict(),
  devolve: z
    .object({
      apontamentos: z.array(z.object({ conta_codigo: z.string(), motivo: z.string().min(3).max(140) }).strict()).max(10),
    })
    .strict(),
  max_tokens_saida: 600,
})

const ArgumentosTransmissao = z
  .object({ cliente_id: z.string(), exercicio: z.string().regex(/^\d{4}$/), documento_id: z.string(), hash_arquivo: z.string().length(64) })
  .strict()

/**
 * v2 (B3b): antes do cartão, o revisor de risco (Opus) confere o compacto do que vai ser transmitido
 * (decisão 3; só nos atos irreversíveis). Se ele devolver, o caso vai ao cartão "não consegui" com
 * o motivo. A v1 continua carregada para as execuções em andamento.
 */
const passosRevisor = [
  {
    tipo: 'operario' as const,
    nome: 'revisar',
    contrato: contratoRevisar,
    recebe: (s: { entrada: { exercicio: string }; saidas: Record<string, any> }) => ({
      ato: 'contabil.ecd_ecf.transmitir',
      resumo: resumoTransmissao(s),
      decisao: { exercicio: s.entrada.exercicio, contas: s.saidas.carregar.contas.length as number, pontos_de_atencao: (s.saidas.apontar_atencao?.apontamentos ?? []).length as number },
      evidencias: [
        { rotulo: 'Conferências por regra', valor: 'CNPJ, exercício, partidas, saldos por conta, competências fechadas e entrega anterior: todas passaram' },
        ...(s.saidas.separar_atipicas.contas_atipicas as { conta_codigo: string; nome: string; variacao_percentual: number }[]).slice(0, 15).map((c) => ({ rotulo: `Atípica ${c.conta_codigo}`, valor: `${c.nome}, variação ${c.variacao_percentual}%` })),
        ...((s.saidas.apontar_atencao?.apontamentos ?? []) as { conta_codigo: string; motivo: string }[]).slice(0, 10).map((a) => ({ rotulo: `Apontada ${a.conta_codigo}`, valor: a.motivo })),
      ],
    }),
  },
  {
    tipo: 'validar' as const,
    nome: 'conferir_revisao',
    validadores: ['revisao_aprovou'],
    dados: (s: { saidas: Record<string, any> }) => ({ revisao: s.saidas.revisar ?? null }),
    sobre: 'revisar',
    ao_falhar: 'escalar' as const,
  },
]

function resumoTransmissao(s: { entrada: { exercicio: string }; saidas: Record<string, any> }) {
  const c = s.saidas.carregar
  const n = (s.saidas.apontar_atencao?.apontamentos ?? []).length
  return `Transmitir a ECD ${s.entrada.exercicio} de ${c.cliente_nome} (CNPJ ${c.cnpj_cliente}): ${c.contas.length} contas, débitos ${reais(c.total_debitos_centavos)} = créditos ${reais(c.total_creditos_centavos)}, arquivo ${String(c.hash).slice(0, 12)}. ${n ? `${n} ponto(s) de atenção.` : 'Sem pontos de atenção.'}`
}

const definirEcd = (versao: number, comRevisor: boolean) => definirProcedimento({
  id: 'CTB-ECD-TRANSMITIR',
  versao,
  nome: 'Conferir e transmitir a ECD',
  setor: 'contabil',
  nivel_maximo: 'rascunhar',
  operacao: 'contabil.ecd.conferir_e_transmitir',
  descricao_modelo: 'Confere a ECD do exercício e, com cartão aprovado por uma pessoa, transmite. Devolve o recibo.',
  entrada: z.object({ cliente_id: z.string().min(1), exercicio: z.string().regex(/^\d{4}$/), documento_id: z.string().min(1) }).strict(),
  saida: z.object({ recibo: z.string(), entrega_id: z.string().nullable(), ja_entregue_por: z.string().nullable() }).strict(),
  orcamento: { centavos: 40, tokens: 60_000 },
  cliente: (e) => e.cliente_id,
  passos: [
    {
      tipo: 'deterministico',
      nome: 'carregar',
      executar: async (s, { tx }) => {
        const [doc] = await tx`select id, cliente_id, tipo, hash_sha256, metadados from documento where id = ${s.entrada.documento_id}`
        if (!doc) throw new ErroRegra('DOCUMENTO_INEXISTENTE', 'O arquivo da ECD não foi encontrado.', 'documento_id')
        if (doc.cliente_id !== s.entrada.cliente_id) throw new ErroRegra('DOCUMENTO_DE_OUTRO_CLIENTE', 'O arquivo é de outro cliente.', 'documento_id')
        if (doc.tipo !== 'ecd') throw new ErroRegra('DOCUMENTO_NAO_E_ECD', `O documento é do tipo ${doc.tipo}, não ECD.`, 'documento_id')
        const ecd = z
          .object({ cnpj: z.string(), exercicio: z.string(), contas: z.array(Conta).min(1).max(5000), total_debitos_centavos: z.number().int(), total_creditos_centavos: z.number().int() })
          .safeParse(doc.metadados?.ecd)
        if (!ecd.success) throw new ErroRegra('ECD_ILEGIVEL', 'A leitura da ECD não está completa; reprocesse o arquivo.', 'documento_id')
        const [cli] = await tx`select documento, nome from cliente where id = ${s.entrada.cliente_id}`
        if (!cli) throw new ErroRegra('CLIENTE_INEXISTENTE', 'Cliente não encontrado.', 'cliente_id')
        return {
          documento_id: doc.id,
          hash: doc.hash_sha256,
          cnpj_arquivo: ecd.data.cnpj,
          cnpj_cliente: cli.documento,
          cliente_nome: cli.nome,
          exercicio_arquivo: ecd.data.exercicio,
          contas: ecd.data.contas,
          total_debitos_centavos: ecd.data.total_debitos_centavos,
          total_creditos_centavos: ecd.data.total_creditos_centavos,
        }
      },
    },
    {
      tipo: 'validar',
      nome: 'conferir',
      // Regra dura: se falhar, para aqui. Nenhum modelo é chamado com arquivo errado.
      validadores: ['cnpj_confere_cliente', 'exercicio_confere', 'partidas_fecham', 'saldos_fecham_por_conta', 'competencias_fechadas', 'ainda_nao_entregue:ECD'],
      dados: (s) => ({ entrada: s.entrada, carregar: s.saidas.carregar }),
      ao_falhar: 'falhar',
    },
    {
      tipo: 'deterministico',
      nome: 'separar_atipicas',
      executar: (s) => {
        const contas = s.saidas.carregar.contas as z.infer<typeof Conta>[]
        const atipicas = contas
          .map((c) => {
            const dif = Math.abs(c.saldo_final_centavos - c.saldo_inicial_centavos)
            // v2: conta que começa o exercício zerada (receita, custo, conta nova) mede contra o saldo
            // final (100%); a v1 dividia por 1 centavo e mostrava variações absurdas ao operário.
            const base = comRevisor && c.saldo_inicial_centavos === 0 ? Math.max(Math.abs(c.saldo_final_centavos), 1) : Math.max(Math.abs(c.saldo_inicial_centavos), 1)
            return { conta_codigo: c.codigo, nome: c.nome, dif, variacao_percentual: Math.round((dif / base) * 1000) / 10 }
          })
          .filter((c) => c.dif >= 100_000 && c.variacao_percentual >= 50)
          .sort((a, b) => b.dif - a.dif)
          .slice(0, 30)
        return { contas_atipicas: atipicas.map(({ conta_codigo, nome, variacao_percentual }) => ({ conta_codigo, nome, variacao_percentual })) }
      },
    },
    {
      tipo: 'operario',
      nome: 'apontar_atencao',
      contrato: contratoApontarAtencao,
      pular_se: (s) => s.saidas.separar_atipicas.contas_atipicas.length === 0,
      recebe: (s) => ({ exercicio: s.entrada.exercicio, contas_atipicas: s.saidas.separar_atipicas.contas_atipicas }),
    },
    {
      tipo: 'validar',
      nome: 'conferir_apontamentos',
      validadores: ['apontamentos_nas_candidatas', 'texto_sem_numero'],
      dados: (s) => {
        const a = (s.saidas.apontar_atencao?.apontamentos ?? []) as { conta_codigo: string; motivo: string }[]
        return { apontamentos: a, candidatas: s.saidas.separar_atipicas.contas_atipicas.map((c: { conta_codigo: string }) => c.conta_codigo), textos: a.map((x) => x.motivo) }
      },
      sobre: 'apontar_atencao',
      ao_falhar: 'escalar',
    },
    ...(comRevisor ? passosRevisor : []),
    {
      tipo: 'aprovacao',
      nome: 'aprovar_transmissao',
      ferramenta: 'contabil.ecd_ecf.transmitir',
      exigida: 'sempre',
      esquema: ArgumentosTransmissao,
      revalidar: ['arquivo_aprovado_confere'],
      argumentos: (s) => ({ cliente_id: s.entrada.cliente_id, exercicio: s.entrada.exercicio, documento_id: s.saidas.carregar.documento_id, hash_arquivo: s.saidas.carregar.hash }),
      // Texto do cartão montado pelo sistema, com números do arquivo (nunca do modelo).
      resumo: (s) => resumoTransmissao(s) + (comRevisor ? linhaDaRevisao(s.saidas.revisar) : ''),
      cartoes: (s) => [
        {
          tipo: 'tabela',
          titulo: 'Totais conferidos',
          colunas: ['Item', 'Valor'],
          linhas: [
            ['Contas', s.saidas.carregar.contas.length],
            ['Débitos', reais(s.saidas.carregar.total_debitos_centavos)],
            ['Créditos', reais(s.saidas.carregar.total_creditos_centavos)],
          ],
        },
        { tipo: 'lista', titulo: 'Pontos de atenção', itens: (s.saidas.apontar_atencao?.apontamentos ?? []).map((a: { conta_codigo: string; motivo: string }) => `${a.conta_codigo}: ${a.motivo}`) },
      ],
    },
    {
      tipo: 'externo',
      nome: 'transmitir',
      ferramenta: 'contabil.ecd_ecf.transmitir',
      conector: 'sped',
      metodo: 'transmitir_ecd',
      aprovacao: 'aprovar_transmissao',
      chave: (s) => `ECD:${s.entrada.cliente_id}:${s.entrada.exercicio}`,
      resultado: z.object({ recibo: z.string().regex(/^[A-Za-z0-9.-]{4,80}$/) }).strict(),
      sombra: () => ({ recibo: 'SOMBRA' }),
    },
    {
      tipo: 'efeito',
      nome: 'registrar_entrega',
      ferramenta: 'obrigacao.anexar_recibo',
      executar: async (s, { tx }) => {
        const t = s.saidas.transmitir as { recibo: string; ja_feito: boolean; por_execucao: string }
        const ap = s.saidas.aprovar_transmissao as { cartao_id: string; decidido_por: string; argumentos: { hash_arquivo: string } }
        if (t.ja_feito) return { dados: { entrega_id: null, ja_entregue_por: t.por_execucao }, texto_evento: `ECD ${s.entrada.exercicio} já tinha sido transmitida (recibo ${t.recibo})` }
        const [e] = await tx`
          insert into entrega_obrigacao (escritorio_id, cliente_id, obrigacao, periodo, recibo, hash_arquivo, execucao_id, cartao_id, aprovado_por)
          values (${s.execucao.escritorio_id}, ${s.entrada.cliente_id}, 'ECD', ${s.entrada.exercicio}, ${t.recibo}, ${ap.argumentos.hash_arquivo}, ${s.execucao.id}, ${ap.cartao_id}, ${ap.decidido_por})
          returning id`
        if (s.execucao.tarefa_id)
          await tx`update tarefa set status = 'concluida', status_desde = now(), concluida_em = now(), concluida_por_tipo = 'integrante', concluida_por_id = ${s.execucao.id}
                   where id = ${s.execucao.tarefa_id} and status not in ('concluida', 'cancelada')`
        return { dados: { entrega_id: e!.id, ja_entregue_por: null }, texto_evento: `Recibo da ECD ${s.entrada.exercicio} anexado (${t.recibo})` }
      },
    },
    {
      tipo: 'concluir',
      nome: 'concluir',
      saida: (s) => ({ recibo: s.saidas.transmitir.recibo, entrega_id: s.saidas.registrar_entrega.entrega_id, ja_entregue_por: s.saidas.registrar_entrega.ja_entregue_por }),
      acordar: (s) => ({
        titulo: s.saidas.registrar_entrega.ja_entregue_por ? 'ECD já estava transmitida' : 'ECD transmitida',
        cartoes: [{ tipo: 'aviso', titulo: 'Recibo', texto: s.saidas.transmitir.recibo }],
        dados: { recibo: s.saidas.transmitir.recibo },
      }),
    },
  ],
})

export const ctbEcd = definirEcd(1, false)
export const ctbEcdV2 = definirEcd(2, true)

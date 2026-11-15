import { comEscritorio, type ContextoExec, type Motor, type Sql } from '@heild/processos'
import { pacoteDoProcedimento } from '../integrantes.ts'
import { classificar } from './avaliar.ts'

/**
 * Modo sombra no dia a dia (decisão 8): enquanto a pessoa faz o trabalho, o integrante roda o mesmo
 * procedimento em paralelo, SEM efeito externo (o motor desfaz o efeito, não cria cartão e não chama
 * conector). Quando a pessoa decide, o sistema compara e guarda o resultado; a pessoa só vê o resumo.
 */

/** Inicia a sombra de um caso real. `referencia` liga a sombra ao trabalho da pessoa (ex.: o documento). */
export async function iniciarSombra(sql: Sql, motor: Motor, ctx: ContextoExec, procedimento_id: string, entrada: Record<string, unknown>, referencia: string) {
  const achado = pacoteDoProcedimento(procedimento_id)
  if (!achado) throw new Error(`Procedimento sem integrante: ${procedimento_id}`)
  const r = await motor.iniciar({ ...ctx, origem: 'job' }, procedimento_id, entrada, { sombra: true, chave_idempotencia: `sombra:${procedimento_id}:${referencia}`, segundo_plano: true })
  await comEscritorio(sql, ctx.escritorio_id, (tx) =>
    tx`insert into comparacao_sombra (escritorio_id, execucao_id, setor, procedimento_id, referencia)
       values (${ctx.escritorio_id}, ${r.execucao_id}, ${achado.integrante.setor}, ${procedimento_id}, ${referencia})
       on conflict (escritorio_id, procedimento_id, referencia) do nothing`,
  )
  return r
}

/** Registra o que a pessoa decidiu (no formato da decisão do procedimento) e fecha o que der. */
export async function registrarDecisaoDaPessoa(sql: Sql, escritorio_id: string, procedimento_id: string, referencia: string, decisao: string) {
  await comEscritorio(sql, escritorio_id, (tx) => tx`update comparacao_sombra set pessoa = ${decisao} where procedimento_id = ${procedimento_id} and referencia = ${referencia}`)
  return fecharComparacoes(sql, escritorio_id)
}

/**
 * Fecha as comparações cuja sombra terminou e cuja pessoa já decidiu. A referência é o que a pessoa
 * fez: o integrante decidir diferente é erro crítico; não decidir (cartão) não é erro.
 */
export async function fecharComparacoes(sql: Sql, escritorio_id: string, limite = 200) {
  return comEscritorio(sql, escritorio_id, async (tx) => {
    const abertas = await tx`
      select c.execucao_id, c.procedimento_id, c.pessoa, e.estado, e.saida, e.erro, e.gasto_centavos from comparacao_sombra c
      join execucao e on e.escritorio_id = c.escritorio_id and e.id = c.execucao_id
      where c.resultado is null and c.pessoa is not null and e.estado in ('concluida', 'falhou', 'cancelada', 'parcial')
      order by c.criado_em limit ${limite}`
    let fechadas = 0
    for (const a of abertas) {
      const achado = pacoteDoProcedimento(a.procedimento_id)
      if (!achado) continue
      const passos = await tx`select distinct on (nome) nome, saida from passo_execucao where execucao_id = ${a.execucao_id} and estado = 'concluido' order by nome, tentativa desc`
      const obtido = achado.pacote.decisao({ estado: a.estado, saida: a.saida, erro: a.erro, passos: Object.fromEntries(passos.map((p) => [p.nome, p.saida])) })
      const resultado = classificar(a.pessoa, obtido)
      await tx`update comparacao_sombra set obtido = ${obtido}, resultado = ${resultado === 'cartao_desnecessario' ? 'cartao' : resultado}, centavos = ${a.gasto_centavos}
               where execucao_id = ${a.execucao_id}`
      fechadas++
    }
    return fechadas
  })
}

/** O resumo que a pessoa vê, por setor (paginado pelo setor; sem lista crescendo sem teto). */
export async function resumoSombra(sql: Sql, escritorio_id: string, o: { setor?: string; desde?: Date } = {}) {
  return comEscritorio(sql, escritorio_id, (tx) => tx`
    select setor, count(*)::int as comparacoes,
      count(*) filter (where resultado = 'acerto')::int as acertos,
      count(*) filter (where resultado = 'erro_critico')::int as erros_criticos,
      count(*) filter (where resultado = 'cartao')::int as cartoes,
      count(*) filter (where resultado = 'falha')::int as falhas,
      coalesce(sum(centavos), 0)::float8 as centavos
    from comparacao_sombra
    where resultado is not null and (${o.setor ?? null}::text is null or setor = ${o.setor ?? null}) and criado_em >= ${o.desde ?? new Date(0)}
    group by setor order by setor`)
}

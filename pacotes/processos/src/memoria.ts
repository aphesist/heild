import type { Sql } from './banco.ts'
import { comEscritorio, hashDe } from './banco.ts'
import { ErroPermissao, ErroRegra, carregarPerfil, type ContextoExec } from './contexto.ts'
import { autorizarPerfil, type Ferramenta } from './dominio.ts'
import type { PortaEventos } from './eventos.ts'

/**
 * Memória do setor (decisão 6): dentro de uma execução ela é só leitura (o motor a congela no
 * início). Mudar o que vale para todos nasce como proposta: `memoria.propor` cria um cartão para
 * quem gere o setor ou para o Administrador; só a decisão humana grava.
 */
const decidirMeta = (setor: string): Ferramenta => ({ nome: 'memoria.decidir', modulo: 'agentes', nivel: 'executar', setor, gestao: true })

export async function proporMemoria(sql: Sql, eventos: PortaEventos, ctx: ContextoExec, e: { setor: string; chave: string; valor: unknown; motivo: string }) {
  return comEscritorio(sql, ctx.escritorio_id, async (tx) => {
    const candidatos = await tx`
      select distinct u.id from usuario u
      left join vinculo_setor v on v.escritorio_id = u.escritorio_id and v.usuario_id = u.id and v.modo = 'gestao' and v.arquivado_em is null
      left join setor s on s.escritorio_id = v.escritorio_id and s.id = v.setor_id
      where u.situacao = 'ativo' and (u.papel = 'administrador' or s.codigo = ${e.setor}) order by u.id`
    const pode: string[] = []
    for (const c of candidatos) {
      const p = await carregarPerfil(tx, c.id)
      if (p && autorizarPerfil(p, decidirMeta(e.setor), { setor_id: e.setor }).permitido) pode.push(c.id)
    }
    if (!pode.length) throw new ErroRegra('SEM_APROVADOR', 'Ninguém pode aprovar mudanças na memória deste setor.')
    const resumo = `Mudar a memória do setor ${e.setor}: "${e.chave}". Motivo: ${e.motivo}`
    const argumentos = { setor: e.setor, chave: e.chave, valor: e.valor }
    const [c] = await tx`
      insert into cartao_aprovacao (escritorio_id, ferramenta, argumentos, resumo_humano, pedido_por_tipo, pedido_por_id, pode_aprovar, status, argumentos_hash, tipo)
      values (${ctx.escritorio_id}, 'memoria.decidir', ${tx.json(argumentos as never)}, ${resumo}, ${ctx.ator.tipo === 'pessoa' ? 'usuario' : ctx.ator.tipo === 'integrante' ? 'integrante' : 'sistema'},
        ${ctx.ator.tipo === 'pessoa' ? ctx.ator.perfil.usuario_id : ctx.ator.tipo === 'integrante' ? ctx.ator.id : null}, ${pode}, 'pendente', ${hashDe(argumentos)}, 'memoria')
      returning id`
    await eventos.gravar(tx, ctx, { nome: 'memoria.propor', ferramenta: 'memoria.propor', nivel: 'rascunhar', resultado: 'aguardando_aprovacao', texto: resumo, setor: e.setor, aprovacao_id: c!.id, resultado_ref: c!.id })
    return { id: c!.id as string, resumo }
  })
}

export async function decidirMemoria(sql: Sql, eventos: PortaEventos, ctx: ContextoExec, d: { cartao_id: string; decisao: string; comentario?: string }) {
  if (ctx.ator.tipo !== 'pessoa') throw new ErroPermissao('aprovacao.decidir', 'Só uma pessoa decide um cartão de aprovação.')
  const pessoa = ctx.ator.perfil
  return comEscritorio(sql, ctx.escritorio_id, async (tx) => {
    const [c] = await tx`select * from cartao_aprovacao where id = ${d.cartao_id} for update`
    if (!c || c.tipo !== 'memoria') throw new ErroRegra('CARTAO_INEXISTENTE', 'Cartão não encontrado.')
    if (c.status !== 'pendente') throw new ErroRegra('CARTAO_DECIDIDO', `Este cartão já está ${c.status}.`)
    const a = c.argumentos as { setor: string; chave: string; valor: unknown }
    if (!(c.pode_aprovar as string[]).includes(pessoa.usuario_id) || !autorizarPerfil(pessoa, decidirMeta(a.setor), { setor_id: a.setor }).permitido)
      throw new ErroPermissao('aprovacao.decidir', 'Só quem gere o setor ou o Administrador muda a memória do setor.')
    const aprovado = d.decisao === 'aprovar'
    await tx`update cartao_aprovacao set status = ${aprovado ? 'aprovado' : 'recusado'}, decidido_por = ${pessoa.usuario_id}, decidido_em = now(), comentario = ${d.comentario ?? null} where id = ${c.id}`
    if (aprovado)
      await tx`insert into memoria_setor (escritorio_id, setor, chave, valor, versao, origem_cartao_id) values (${ctx.escritorio_id}, ${a.setor}, ${a.chave}, ${tx.json(a.valor as never)}, 1, ${c.id})
               on conflict (escritorio_id, setor, chave) do update set valor = excluded.valor, versao = memoria_setor.versao + 1, origem_cartao_id = excluded.origem_cartao_id, atualizado_em = now()`
    await eventos.gravar(tx, ctx, { nome: 'memoria.decidir', ferramenta: 'memoria.decidir', nivel: 'executar', resultado: aprovado ? 'aprovado' : 'recusado', texto: `${pessoa.nome} ${aprovado ? 'aprovou' : 'recusou'}: ${c.resumo_humano}`, setor: a.setor, aprovacao_id: c.id })
    return { estado: aprovado ? 'aprovado' : 'recusado' }
  })
}

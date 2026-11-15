import { classeDaTabela, JANELA_DIAS, nomesTabelas, podeLerLinha, projetarParaCliente, type Classe, type EscopoLeitura, type NomeTabela, type Registro } from '@heild/dominio'
import type { Sessao } from '../auth/sessao.ts'
import { paraJson, type Tx } from '../banco/pg.ts'
import { colunasDe } from './colunas.ts'

/**
 * `GET /v1/sincronizar?desde=&classes=` (ARQUITETURA 6.3): as linhas das classes pedidas
 * (padrão 1 e 2; a classe 3 nunca vem, é por consulta), filtradas linha a linha pela regra
 * de leitura do domínio (`podeLerLinha`: setor, carteira, exceção por tela, o que é da
 * pessoa e o que é do cliente). A classe 2 vem na janela do trabalho aberto.
 *
 * Com `desde`, só o que mudou depois da versão; a linha que mudou e saiu do escopo da
 * pessoa vem em `removidas`, para o navegador tirar do cache.
 */

export interface Fotografia {
  tabelas: Partial<Record<NomeTabela, Record<string, unknown>[]>>
  removidas: { tabela: string; id: string }[]
  versao: number
  classes: Classe[]
}

/** O escopo de leitura da sessão: o contexto e as conversas internas de que a pessoa participa. */
export async function escopoDaSessao(tx: Tx, sessao: Pick<Sessao, 'ctx'>): Promise<EscopoLeitura> {
  const a = sessao.ctx.ator
  const perfil = a.tipo === 'pessoa' ? a.perfil : a.tipo === 'integrante' ? a.dono : null
  if (!perfil) return { ctx: sessao.ctx }
  const [part, canais] = await Promise.all([
    tx`select conversa_interna_id from participacao where usuario_id = ${perfil.usuario_id} and saiu_em is null`,
    tx`select id from conversa_interna where tipo in ('canal_geral', 'canal_setor')`,
  ])
  return { ctx: sessao.ctx, participacoes: new Set(part.map((p) => String(p.conversa_interna_id))), canais: new Set(canais.map((c) => String(c.id))) }
}

export async function sincronizar(tx: Tx, sessao: Pick<Sessao, 'ctx'>, o: { desde?: number; classes?: Classe[] } = {}): Promise<Fotografia> {
  const classes = o.classes?.length ? o.classes : ([1, 2] as Classe[])
  const escopo = await escopoDaSessao(tx, sessao)
  const cliente = sessao.ctx.ator.tipo === 'pessoa_cliente'
  const colunas = await colunasDe(tx)
  const tabelas: Fotografia['tabelas'] = {}
  const removidas: Fotografia['removidas'] = []
  let versao = o.desde ?? 0
  for (const t of nomesTabelas as NomeTabela[]) {
    if (!colunas.has(t) || !classes.includes(classeDaTabela(t))) continue
    const dias = classeDaTabela(t) === 2 ? JANELA_DIAS[t] : undefined
    const limite = dias ? new Date(Date.now() - dias * 86_400_000).toISOString() : null
    // A janela vai no SQL (índice por escritório e versão; a tabela inteira nunca sobe).
    const janela =
      limite && t === 'tarefa'
        ? tx`and (status not in ('concluida', 'cancelada') or atualizado_em >= ${limite})`
        : limite && t === 'cartao_aprovacao'
          ? tx`and (status = 'pendente' or coalesce(decidido_em, atualizado_em) >= ${limite})`
          : tx``
    const linhas =
      o.desde != null
        ? await tx`select * from ${tx(t)} where versao_linha > ${o.desde} ${janela} order by ordem nulls last, criado_em, id`
        : await tx`select * from ${tx(t)} where true ${janela} order by ordem nulls last, criado_em, id`
    const visiveis: Record<string, unknown>[] = []
    for (const bruta of linhas) {
      const l = paraJson(bruta) as Registro & Record<string, unknown>
      versao = Math.max(versao, Number(l.versao_linha ?? 0))
      if (podeLerLinha(escopo, t, l)) visiveis.push(cliente ? projetarParaCliente(t, l) : l)
      else if (o.desde != null) removidas.push({ tabela: t, id: l.id })
    }
    tabelas[t] = visiveis
  }
  if (o.desde != null) {
    const apagadas = (await tx`select tabela, id, versao_linha from remocao where versao_linha > ${o.desde}`) as unknown as { tabela: string; id: string; versao_linha: number }[]
    for (const r of apagadas) {
      versao = Math.max(versao, Number(r.versao_linha))
      removidas.push({ tabela: r.tabela, id: r.id })
    }
  }
  return { tabelas, removidas, versao, classes }
}

import { autorizar, ErroPermissao, ErroRegra, nomeDoAtor, registrarEvento, type ComandoValidado, type Contexto, type NomeTabela, type Registro } from '@heild/dominio'
import { PrecisaCarregar, type BancoServidor } from './banco-servidor.ts'
import { ErroApi } from './erro.ts'
import { repositorioDaTabela } from './operacoes.ts'

type ComandoLinhas = Extract<ComandoValidado, { tipo: 'linhas' }>

/**
 * Escrita que a tela fez direto numa transação, fora de um repositório (o motor da
 * demonstração, a loja, algumas telas do BPO e do Financeiro). O servidor não grava
 * linha nenhuma sem regra: cada uma passa pelo repositório da tabela dela.
 *
 * - Linha nova: autorizada com a ferramenta `criar` da tabela; linha que existe: com a
 *   `atualizar`, depois da regra `antesDeAtualizar` (mensagem interna guarda versões,
 *   evento é imutável) e da `validar`.
 * - Remoção: só onde a regra deixa (`exclusao: 'definitiva'`), com a ferramenta `excluir`.
 * - Evento que a tela escreveu (atividade registrada, aviso do BPO): autorizado pela
 *   ferramenta dele e regravado com o ator da sessão (quem age vem do token, nunca da linha).
 * - Sem evento da tela, o servidor grava um (R2: todo efeito gera evento), fora da linha do tempo.
 */
export function aplicarLinhas(bs: BancoServidor, ctx: Contexto, c: ComandoLinhas): { gravadas: number; removidas: number } {
  const eventosDaTela = c.gravar.filter((g) => g.tabela === 'evento')
  const outras = c.gravar.filter((g) => g.tabela !== 'evento')
  const autorizarCom = (ferramenta: string, linha: Partial<Registro>, alvo: { setor_id?: string | null; cliente_id?: string | null }) => {
    const d = autorizar(ctx, ferramenta, alvo)
    if (!d.permitido) throw new ErroPermissao(ferramenta, d.motivo)
    void linha
  }
  bs.transacao((tx) => {
    c.gravar.forEach((g, i) => {
      if (typeof g.linha.id !== 'string' || !g.linha.id) throw new ErroApi('ENTRADA_INVALIDA', { campo: `comando.gravar.${i}.linha.id`, mensagem: 'Toda linha precisa do id.' })
    })
    for (const g of outras) {
      const repo = repositorioDaTabela(g.tabela)
      if (!repo) throw new ErroApi('TABELA_SEM_REGRA', { campo: g.tabela, mensagem: `A tabela ${g.tabela} não tem repositório: não se grava nela pela API.` })
      const r = repo.regras
      const id = g.linha.id as string
      const antes = tx.obter(g.tabela as NomeTabela, id) as Registro | undefined
      let linha = { ...(antes ?? {}), ...g.linha, id } as Registro
      const ferramenta = antes ? r.ferramentas.atualizar : r.ferramentas.criar
      autorizarCom(ferramenta, linha, r.alvo?.(linha as never) ?? {})
      if (antes && r.antesDeAtualizar) linha = r.antesDeAtualizar(antes as never, linha as never, ctx) as Registro
      const erro = r.validar?.(linha as never)
      if (erro) throw new ErroRegra(erro)
      tx.gravar(g.tabela as NomeTabela, linha as never)
      if (!eventosDaTela.length && !r.semEvento) {
        registrarEvento(tx, ctx, {
          nome: `${g.tabela}.${antes ? 'atualizar' : 'criar'}`,
          ferramenta,
          resultado_ref: id,
          texto: `${nomeDoAtor(ctx.ator)} ${antes ? 'atualizou' : 'criou'} ${r.artigo} ${safeRotulo(r.rotulo, linha)}`,
          visivel_na_linha_do_tempo: false,
          ...(r.alvo?.(linha as never) ?? {}),
        })
      }
    }
    for (const x of c.remover) {
      const repo = repositorioDaTabela(x.tabela)
      if (!repo) throw new ErroApi('TABELA_SEM_REGRA', { campo: x.tabela })
      const r = repo.regras
      if (x.tabela === 'evento' || r.exclusao === 'proibida') throw new ErroRegra(r.motivoExclusaoProibida ?? 'Isso não se apaga (Fundações R7). Arquive ou cancele com motivo.', 'EXCLUSAO_PROIBIDA')
      const antes = tx.obter(x.tabela as NomeTabela, x.id) as Registro | undefined
      if (!antes) continue
      const ferramenta = r.ferramentas.excluir ?? r.ferramentas.atualizar
      autorizarCom(ferramenta, antes, r.alvo?.(antes as never) ?? {})
      tx.remover(x.tabela as NomeTabela, x.id)
      if (!r.semEvento) registrarEvento(tx, ctx, { nome: `${x.tabela}.excluir`, ferramenta, resultado_ref: x.id, texto: `${nomeDoAtor(ctx.ator)} excluiu ${r.artigo} ${safeRotulo(r.rotulo, antes)}`, argumentos_resumo: { excluido: safeRotulo(r.rotulo, antes) }, ...(r.alvo?.(antes as never) ?? {}) })
    }
    for (const g of eventosDaTela) {
      const e = g.linha as Record<string, unknown>
      if (tx.obter('evento', e.id as string)) throw new ErroRegra('O registro de eventos é imutável: correção é um evento novo (5.2).', 'IMUTAVEL')
      const ferramenta = typeof e.ferramenta === 'string' ? e.ferramenta : 'evento.listar'
      const alvo = { setor_id: (e.setor_id as string | null) ?? null, cliente_id: (e.cliente_id as string | null) ?? null }
      autorizarCom(ferramenta, e as never, alvo)
      // Só o que descreve o fato vem da tela; quem, quando, nível e resultado são do servidor.
      registrarEvento(tx, ctx, {
        id: e.id as string,
        nome: String(e.nome ?? 'atividade.registrar').slice(0, 120),
        ferramenta,
        texto: String(e.texto ?? '').slice(0, 2000),
        resultado_ref: (e.resultado_ref as string | null) ?? null,
        argumentos_resumo: (e.argumentos_resumo as Record<string, unknown> | undefined) ?? undefined,
        visivel_na_linha_do_tempo: e.visivel_na_linha_do_tempo !== false,
        ...alvo,
      })
    }
  })
  return { gravadas: c.gravar.length, removidas: c.remover.length }
}

function safeRotulo(rotulo: (r: never) => string, linha: unknown): string {
  try {
    return rotulo(linha as never)
  } catch (e) {
    if (e instanceof PrecisaCarregar) throw e
    return String((linha as { id?: unknown }).id ?? '')
  }
}

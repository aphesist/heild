import { autorizar, canonizar, codigoDaNegacao, sha256Hex, type FerramentaLeitura, type Registro } from '@heild/dominio'
import type { Sessao } from '../auth/sessao.ts'
import { noEscritorio, paraJson, type Sql, type Tx } from '../banco/pg.ts'
import { colunasDe } from './colunas.ts'
import { ErroApi } from './erro.ts'
import type { Resultado } from './executor.ts'
import { traduzir } from './executor.ts'

/**
 * Leitura das ferramentas tipadas: lista com cursor (nunca offset), filtrada linha a
 * linha pela função `autorizar` no nível ler (setor e carteira; a RLS já separou o
 * escritório), com totais antes das linhas e visão compacta por padrão (AGENTICO 5;
 * API_INTERNA 2.6).
 */

const LOTE = 200

interface Cursor {
  o: string | number
  i: string
  f: string
}

const codificar = (c: Cursor) => Buffer.from(JSON.stringify(c)).toString('base64url')
function decodificar(s: string): Cursor {
  try {
    const c = JSON.parse(Buffer.from(s, 'base64url').toString('utf8')) as Cursor
    if (typeof c.i !== 'string' || typeof c.f !== 'string' || (typeof c.o !== 'string' && typeof c.o !== 'number')) throw new Error()
    return c
  } catch {
    throw new ErroApi('CURSOR_INVALIDO', { campo: 'cursor' })
  }
}

export async function ler(sql: Sql, sessao: Sessao, f: FerramentaLeitura, entrada: Record<string, unknown>): Promise<Resultado> {
  try {
    return await noEscritorio(sql, { sub: sessao.claims.sub, escritorio_id: sessao.claims.escritorio_id }, async (tx) => {
      const ctx = sessao.ctx
      const geral = autorizar(ctx, f.autorizar_com, {}, 'ler')
      if (!geral.permitido) throw new ErroApi(codigoDaNegacao(geral.motivo), { mensagem: geral.motivo, ferramenta: f.autorizar_com })
      const podeVer = (l: Registro & Record<string, unknown>) => autorizar(ctx, f.autorizar_com, f.alvo(l), 'ler').permitido
      const visao = entrada.visao === 'tela' ? 'tela' : 'compacta'
      const mostrar = (l: Registro & Record<string, unknown>) => (visao === 'tela' ? l : f.compacta(l))

      if (f.unica) {
        const id = f.unica(entrada as never)
        const [linha] = await tx`select * from ${tx(f.tabela)} where id = ${id}`
        if (!linha) throw new ErroApi('NAO_ENCONTRADO', { campo: 'id', mensagem: `Não encontrei ${id}.` })
        const l = paraJson(linha) as Registro & Record<string, unknown>
        const d = autorizar(ctx, f.autorizar_com, f.alvo(l), 'ler')
        if (!d.permitido) throw new ErroApi(codigoDaNegacao(d.motivo), { mensagem: d.motivo, ferramenta: f.autorizar_com })
        return { status: 200, corpo: { resultado: 'ok', dados: mostrar(l) } }
      }

      const cols = (await colunasDe(tx)).get(f.tabela)!
      const filtros = f.filtros(entrada as never)
      for (const x of filtros) if (!cols.has(x.coluna)) throw new ErroApi('ERRO_INTERNO', { mensagem: `Filtro em coluna inexistente: ${x.coluna}` })
      const ordem = f.ordem === 'seq' ? 'seq' : 'criado_em'
      const { cursor: cursorTexto, limite: limiteBruto, visao: _v, ...semPagina } = entrada
      void _v
      const assinatura = sha256Hex(canonizar({ f: f.nome, e: semPagina })).slice(0, 16)
      const limite = Math.min(Number(limiteBruto ?? (visao === 'tela' ? 50 : 20)), visao === 'tela' ? 100 : 20)
      let cursor = cursorTexto ? decodificar(String(cursorTexto)) : null
      if (cursor && cursor.f !== assinatura) throw new ErroApi('CURSOR_INVALIDO', { campo: 'cursor', mensagem: 'O cursor é de outra consulta (os filtros mudaram).' })

      const onde = (t: Tx) => {
        let c = t`${t(ordem)} is not null`
        for (const x of filtros) {
          if (x.op === '=') c = t`${c} and ${t(x.coluna)} = ${x.valor as string}`
          else if (x.op === 'in') c = t`${c} and ${t(x.coluna)} in ${t(x.valor as string[])}`
          else if (x.op === 'ilike') c = t`${c} and ${t(x.coluna)} ilike ${`%${String(x.valor)}%`}`
          else if (x.op === 'is_null') c = t`${c} and ${t(x.coluna)} is null`
          else if (x.op === 'not_null') c = t`${c} and ${t(x.coluna)} is not null`
          else if (x.op === '>=') c = t`${c} and ${t(x.coluna)} >= ${x.valor as string}`
          else if (x.op === '<=') c = t`${c} and ${t(x.coluna)} <= ${x.valor as string}`
        }
        return c
      }

      const linhas: (Registro & Record<string, unknown>)[] = []
      let haMais = false
      while (linhas.length <= limite) {
        const depois = cursor ? (ordem === 'seq' ? tx`and (seq, id) < (${Number(cursor.o)}, ${cursor.i})` : tx`and (criado_em, id) < (${String(cursor.o)}::timestamptz, ${cursor.i})`) : tx``
        const lote = await tx`select * from ${tx(f.tabela)} where ${onde(tx)} ${depois} order by ${tx(ordem)} desc, id desc limit ${LOTE}`
        for (const bruto of lote) {
          const l = paraJson(bruto) as Registro & Record<string, unknown>
          cursor = { o: l[ordem] as string | number, i: l.id, f: assinatura }
          if (!podeVer(l)) continue
          if (linhas.length === limite) {
            haMais = true
            break
          }
          linhas.push(l)
        }
        if (haMais || lote.length < LOTE) break
      }
      const ultima = linhas.at(-1)
      // Totais e total: sobre tudo o que a pessoa pode ver com estes filtros (antes das linhas).
      const todas = (await tx`select * from ${tx(f.tabela)} where ${onde(tx)}`).map((b) => paraJson(b) as Registro & Record<string, unknown>).filter(podeVer)
      return {
        status: 200,
        corpo: {
          resultado: 'ok',
          dados: { totais: f.totais?.(todas) ?? {}, linhas: linhas.map(mostrar) },
          pagina: { cursor: haMais && ultima ? codificar({ o: ultima[ordem] as string | number, i: ultima.id, f: assinatura }) : null, ha_mais: haMais, total: todas.length },
        },
      }
    })
  } catch (e) {
    const erro = traduzir(e)
    return { status: erro.status, corpo: erro.corpo() }
  }
}

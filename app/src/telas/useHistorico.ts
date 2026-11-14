import { useCallback, useMemo } from 'react'
import { usePersistente } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import type { Conversa, Mensagem } from '@/dados/tipos'
import { useEnvioSimulado } from './useConversa'

const AUTOR_GERAL = { setor: 'geral' as const }

const nova = (id: string = crypto.randomUUID()): Conversa => ({ id, titulo: 'Nova conversa', quando: 'agora', grupo: 'Hoje', mensagens: [] })

interface Contexto {
  conversas: Conversa[]
  atual: string
}

const vazia = (c: Conversa) => c.mensagens.length === 0

/** Resposta que ficou "pensando" quando a página recarregou: vira um aviso em vez de girar para sempre. */
const semPendenteVelha = (m: Mensagem): Mensagem => (m.pendente && Date.now() - (m.em ?? 0) > 15_000 ? { ...m, pendente: false, texto: 'Não terminei esta resposta: a página foi recarregada no meio. Pode perguntar de novo?' } : m)

/**
 * Conversas do Assistente por cliente (02, ad. 22; 02, 6.4):
 * - cada cliente e a Carteira têm a sua sessão; trocar de cliente troca de sessão
 *   sozinho, sem a pessoa escolher conversa numa lista;
 * - ao entrar num cliente abre a conversa mais recente dele (ou uma nova, se `comecarNova`);
 * - nova conversa, limpar a atual (os cartões ainda pendentes ficam) e abrir uma anterior pelo histórico.
 *
 * Guardado por pessoa no escritório (`s01:assistente:<usuário>`): o Início e a
 * gaveta do Chat leem a mesma conversa, e recarregar a página não perde nada.
 * Em produção, Sessão `chat` por usuário e cliente.
 */
export function useHistorico(chave: string, nomeUsuario: string, semente: Record<string, Conversa[]>, comecarNova: boolean) {
  const { usuario } = useSessao()
  const [porContexto, setPorContexto] = usePersistente<Record<string, Contexto>>(`s01:assistente:${usuario.id}`, {})

  // Estado inicial de um cliente ainda sem conversa guardada: determinístico (o Início e a gaveta concordam no id).
  const inicial = useCallback(
    (k: string): Contexto => {
      const conversas = semente[k] ?? []
      if (comecarNova || conversas.length === 0) {
        const c = nova(`${k}:inicial`)
        return { conversas: [c, ...conversas], atual: c.id }
      }
      return { conversas, atual: conversas[0].id }
    },
    [semente, comecarNova],
  )

  const ctx = porContexto[chave] ?? inicial(chave)
  const bruta = ctx.conversas.find((c) => c.id === ctx.atual) ?? ctx.conversas[0]
  const atual = useMemo(() => ({ ...bruta, mensagens: bruta.mensagens.map(semPendenteVelha) }), [bruta])

  /** Altera o contexto `k`, criando-o a partir da semente se ainda não existir. */
  const mudar = useCallback((k: string, f: (c: Contexto) => Contexto) => setPorContexto((todos) => ({ ...todos, [k]: f(todos[k] ?? inicial(k)) })), [inicial, setPorContexto])

  /** Ao sair de uma conversa nova e vazia, ela é descartada. */
  const descartaAoSair = (c: Contexto, saindo: string): Conversa[] => c.conversas.filter((x) => x.id !== saindo || !(vazia(x) && c.conversas.length > 1))

  const abrir = useCallback((id: string) => mudar(chave, (c) => (id === c.atual ? c : { conversas: descartaAoSair(c, c.atual), atual: id })), [chave, mudar])

  const criar = useCallback(
    () =>
      mudar(chave, (c) => {
        const cur = c.conversas.find((x) => x.id === c.atual)
        // Já está numa conversa nova e vazia: não cria outra.
        if (cur && vazia(cur)) return c
        const n = nova()
        return { conversas: [n, ...descartaAoSair(c, c.atual)], atual: n.id }
      }),
    [chave, mudar],
  )

  /** Limpa a conversa atual. `manter` decide o que não sai (os cartões ainda pendentes, 02, ad. 22). */
  const limpar = useCallback(
    (manter?: (m: Mensagem) => boolean) =>
      mudar(chave, (c) => ({
        ...c,
        conversas: c.conversas.map((x) => {
          if (x.id !== c.atual) return x
          const ficam = manter ? x.mensagens.filter(manter) : []
          return { ...x, mensagens: ficam, ...(ficam.length ? {} : { titulo: 'Nova conversa' }), quando: 'agora' }
        }),
      })),
    [chave, mudar],
  )

  // Atualiza sempre a conversa onde a mensagem foi enviada, mesmo que a pessoa
  // troque de cliente antes de a resposta chegar.
  const idAtual = atual.id
  const atualizar = useCallback(
    (f: (ms: Mensagem[]) => Mensagem[]) =>
      mudar(chave, (c) => {
        const existe = c.conversas.some((x) => x.id === idAtual)
        const conversas = existe ? c.conversas : [nova(idAtual), ...c.conversas]
        return {
          ...c,
          conversas: conversas.map((x) => {
            if (x.id !== idAtual) return x
            const mensagens = f(x.mensagens)
            const primeira = mensagens.find((m) => m.autor.tipo === 'usuario')?.texto
            const titulo = x.titulo === 'Nova conversa' && primeira ? (primeira.length > 48 ? `${primeira.slice(0, 46)}…` : primeira) : x.titulo
            return { ...x, mensagens, titulo, quando: 'agora', grupo: 'Hoje' as const }
          }),
        }
      }),
    [chave, idAtual, mudar],
  )

  const { enviar, pensando } = useEnvioSimulado(AUTOR_GERAL, nomeUsuario, atualizar)

  const historico = useMemo(() => ctx.conversas.filter((c) => !vazia(c) || c.id === ctx.atual), [ctx])

  return { atual, historico, enviar, pensando, abrir, criar, limpar, atualizar }
}

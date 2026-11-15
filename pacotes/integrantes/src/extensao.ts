import { z } from 'zod'
import { definirFerramenta, type BaseExtensao, type DefinicaoFerramenta, type ExtensaoProcessos } from '@heild/processos'
import { Assistente, FILA_ROTEAR } from './assistente.ts'
import { Anexos, type Integrante } from './contrato.ts'
import { aprenderComCartao } from './execucao.ts'
import { integrantesContabil } from './integrantes.ts'
import { metasB3 } from './metas.ts'
import { ROTEADOR_BARATO_NO_HAIKU } from './modelos.ts'
import { configRoteamentoPadrao, type ConfigRoteamento } from './roteador.ts'

/**
 * A B3 como extensão do `criarProcessos` da B2: as ferramentas do Assistente e dos integrantes
 * entram no MESMO registro (mesma rota `/v1/ferramentas/{nome}`, mesmo MCP, mesma `autorizar`), e
 * a fila `assistente.rotear` roda no worker. Nada de porta nova.
 */
export interface OpcoesExtensao {
  integrantes?: Integrante[]
  roteamento?: Partial<ConfigRoteamento>
  aguardar_ms?: number
}

export interface ExtensaoIntegrantes extends ExtensaoProcessos {
  /** Disponível depois do `criarProcessos` (as ferramentas são montadas com o motor). */
  assistente: Assistente | null
}

export function extensaoIntegrantes(o: OpcoesExtensao = {}): ExtensaoIntegrantes {
  const integrantes = o.integrantes ?? integrantesContabil
  const ext: ExtensaoIntegrantes = {
    nome: 'integrantes',
    assistente: null,
    metas: metasB3,
    ferramentas: (b: BaseExtensao): DefinicaoFerramenta[] => {
      // Com os modelos reais, a cascata é Haiku → Sonnet; na demonstração, os modelos de demonstração.
      const padrao = b.modelos.precos['claude-haiku-5-5']
        ? { ...configRoteamentoPadrao(b.modelos.precos), ...(ROTEADOR_BARATO_NO_HAIKU.liberado ? {} : { barato: 'claude-sonnet-5-5' }) }
        : { ...configRoteamentoPadrao(b.modelos.precos), barato: b.modelos.porClasse.operario, caro: b.modelos.porClasse.escritor }
      const assistente = new Assistente({ sql: b.sql, boss: b.boss, motor: b.motor, eventos: b.eventos, fornecedor: b.fornecedor, roteamento: { ...padrao, ...o.roteamento }, integrantes, aguardar_ms: o.aguardar_ms })
      ext.assistente = assistente
      const meta = (nome: string) => metasB3.find((m) => m.nome === nome)!
      return [
        definirFerramenta({
          nome: 'assistente.pedir',
          versao: 1,
          descricao_modelo: 'Pede ao Assistente: ele roteia ao integrante do setor e devolve a resposta padrão dele, sem reescrever.',
          entrada: z.object({ texto: z.string().min(1).max(4000), anexos: Anexos.optional(), chave_idempotencia: z.string().min(8).max(200).optional() }).strict(),
          meta: meta('assistente.pedir'),
          exposta_mcp: false,
          recorte: 'geral',
          executar: async (e, ctx) => ({ resultado: 'ok', dados: await assistente.pedir(ctx, e) }),
        }),
        definirFerramenta({
          nome: 'assistente.obter',
          versao: 1,
          descricao_modelo: 'Estado e resposta padrão de um pedido feito ao Assistente (só de quem pediu).',
          entrada: z.object({ pedido_id: z.string().min(1).max(80) }).strict(),
          meta: meta('assistente.obter'),
          exposta_mcp: false,
          recorte: 'geral',
          executar: async (e, ctx) => ({ resultado: 'ok', dados: await assistente.obter(ctx, e.pedido_id) }),
        }),
        definirFerramenta({
          nome: 'integrante.listar',
          versao: 1,
          descricao_modelo: 'Os integrantes dos setores: o que cada um faz, procedimentos, limites e papéis de modelo.',
          entrada: z.object({ setor: z.string().max(40).optional() }).strict(),
          meta: meta('integrante.listar'),
          exposta_mcp: true,
          recorte: 'geral',
          executar: async (e) => ({
            resultado: 'ok',
            dados: integrantes
              .filter((i) => !e.setor || i.setor === e.setor)
              .map((i) => ({ id: i.id, setor: i.setor, nome: i.nome, descricao: i.descricao, procedimentos: i.procedimentos.map((p) => `${p.procedimento.id}@${p.procedimento.versao}`), limites: i.limites, limiar_confianca: i.limiar_confianca, papeis: i.papeis })),
          }),
        }),
        definirFerramenta({
          nome: 'integrante.aprender',
          versao: 1,
          descricao_modelo: 'Propõe guardar na memória do setor a correção que uma pessoa fez num cartão "não consegui" (vira cartão para quem gere).',
          entrada: z.object({ execucao_id: z.string().min(1).max(80) }).strict(),
          meta: meta('integrante.aprender'),
          exposta_mcp: true,
          recorte: 'geral',
          executar: async (e, ctx) => {
            const c = await aprenderComCartao(b.sql, b.eventos, ctx, e.execucao_id)
            return { resultado: 'aguardando_aprovacao', cartao_id: c.id, resumo_humano: c.resumo, expira_em: null }
          },
        }),
      ]
    },
    criarFilas: async (b) => {
      const opcoes = { expireInSeconds: 300, retryLimit: 3, retryDelay: 5, retryBackoff: true, notify: true }
      if (await b.boss.getQueue(FILA_ROTEAR)) await b.boss.updateQueue(FILA_ROTEAR, opcoes)
      else await b.boss.createQueue(FILA_ROTEAR, opcoes)
    },
    iniciarWorkers: async (_b, intervalo) => {
      await ext.assistente!.iniciarWorker(intervalo)
    },
  }
  return ext
}

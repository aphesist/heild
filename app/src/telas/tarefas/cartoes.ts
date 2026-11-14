import { useConversaDe } from '@/ambiente/fluxos'
import { useLoja } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import type { CartaoAprovacao, Id } from '@/nucleo/modelo/entidades'
import { ErroRegra } from '@/nucleo/permissoes/autorizar'
import { comoAtor, repos } from '@/nucleo/repositorios'
import { contextoSistema } from '@/nucleo/permissoes/perfil'
import type { SetorIntegrante } from '@/theme/tipos'

/**
 * Cartões de aprovação da S04 (01, 6.4; 03, 7.5). O cartão é um registro só
 * (`cartao_aprovacao`, id `s04-...`): decidido na ficha da tarefa, no chat,
 * na Visão geral ou no sino, vale em todos. Cada tela registra o que o
 * cartão faz ao ser aprovado (`registrarEfeitoS04`); recusar devolve a uma
 * pessoa e o comentário vira aprendizado do integrante (02, 7.2).
 */

export interface DadosCartaoS04 {
  /** Chave do efeito (ex.: `dp.kit_rescisao`). */
  acao: string
  resumo: string
  argumentos: Record<string, string>
  setor: SetorIntegrante
  /** Integrante que pediu (nome exibido). */
  integrante: string
  ferramenta?: string
  tarefaId?: Id
  clienteId?: Id | null
  clienteNome?: string
  /** Expira em (texto curto) e data ISO. */
  expira?: string
  /** Dados extras que o efeito usa. */
  dados?: Record<string, unknown>
}

export interface CtxEfeito {
  loja: ReturnType<typeof useLoja>
  usuario: { id: string; nome: string }
  conversaDe: ReturnType<typeof useConversaDe>
  editado: boolean
  comentario?: string
}

type Efeito = (c: CartaoAprovacao, ctx: CtxEfeito) => void
const efeitos = new Map<string, Efeito>()
export const registrarEfeitoS04 = (acao: string, f: Efeito) => void efeitos.set(acao, f)

/** Quem pode aprovar: Gestor do setor e o Administrador (pessoas ativas). */
export function quemPodeAprovar(setor: string): { ids: Id[]; nomes: string[] } {
  const usuarios = repos.usuarios.listar((u) => u.situacao === 'ativo')
  const vinculos = repos.vinculos.listar()
  const pode = usuarios.filter((u) => u.papel === 'administrador' || (u.papel === 'gestor' && vinculos.some((v) => v.usuario_id === u.id && v.setor_id === setor && v.modo === 'gestao')) || vinculos.some((v) => v.usuario_id === u.id && v.setor_id === setor && v.modo === 'execucao' && u.papel !== 'colaborador'))
  return { ids: pode.map((u) => u.id), nomes: pode.map((u) => u.nome) }
}

let seq = 0
/** O integrante deixa o cartão (não decide: só uma pessoa decide). */
export function criarCartaoS04(d: DadosCartaoS04): CartaoAprovacao {
  const id = `s04-${d.acao.replace(/\W+/g, '-')}-${Date.now().toString(36)}${seq++}`
  const pode = quemPodeAprovar(d.setor)
  const cartao = comoAtor({ ...contextoSistema, ator: { tipo: 'sistema', nome: `integrante ${d.integrante}` } }, () =>
    repos.cartoes.criar(
      {
        id,
        ferramenta: d.ferramenta ?? 'aprovacao.decidir',
        argumentos: d.argumentos,
        resumo_humano: d.resumo,
        pedido_por_tipo: 'integrante',
        pedido_por_id: d.integrante,
        pode_aprovar: pode.ids,
        status: 'pendente',
        expira_em: null,
        extras: { acao: d.acao, setor: d.setor, integrante: d.integrante, tarefa_id: d.tarefaId ?? null, cliente_id: d.clienteId ?? null, cliente_nome: d.clienteNome ?? null, expira: d.expira ?? 'expira em 2 dias', pode_nomes: pode.nomes, dados: d.dados ?? {} },
      },
      { texto: `integrante ${d.integrante} deixou um cartão: ${d.resumo}` },
    ),
  )
  if (d.tarefaId) {
    const t = repos.tarefas.obter(d.tarefaId)
    if (t) comoAtor(contextoSistema, () => repos.tarefas.atualizar(t.id, { extras: { ...t.extras, cartao_pendente: true } }, { ferramenta: 'tarefa.atualizar', texto: '' }))
  }
  return cartao
}

/** Aprendizados guardados das recusas e edições (memória do integrante, 02, 7.2). */
export const CHAVE_APRENDIZADOS = 's04:integrantes:aprendizados'
export interface Aprendizado {
  integrante: string
  setor: string
  acao: string
  texto: string
  quando: string
  por: string
}

/** Aplica o efeito depois da decisão (quem chama já decidiu o cartão). */
export function aplicarEfeitoS04(id: string, decisao: string, ctx: Omit<CtxEfeito, 'editado'> & { editado?: boolean }) {
  const c = repos.cartoes.obter(id)
  if (!c) return false
  const e = c.extras ?? {}
  const tarefaId = e.tarefa_id as string | null
  const aprovou = decisao !== 'recusar' && decisao !== 'recusado'
  if (tarefaId) {
    const t = repos.tarefas.obter(tarefaId)
    if (t) repos.tarefas.atualizar(t.id, { extras: { ...t.extras, cartao_pendente: false, ...(aprovou ? {} : { recusado: ctx.comentario ?? 'recusado' }) } }, { ferramenta: 'tarefa.atualizar', texto: '' })
  }
  if (!aprovou || ctx.editado || decisao === 'editar_e_aprovar') {
    const lista = (repos.telas.obter(CHAVE_APRENDIZADOS)?.valor as Aprendizado[] | undefined) ?? []
    const texto = !aprovou ? (ctx.comentario?.trim() ? ctx.comentario : 'Recusado sem comentário: perguntar antes da próxima vez.') : `Editado antes de aprovar${ctx.comentario ? `: ${ctx.comentario}` : ''}`
    repos.telas.lembrar(CHAVE_APRENDIZADOS, [...lista, { integrante: String(e.integrante ?? ''), setor: String(e.setor ?? ''), acao: String(e.acao ?? ''), texto, quando: new Date().toISOString(), por: ctx.usuario.nome }])
  }
  if (!aprovou) {
    ctx.loja.toast(`Recusado. O integrante ${String(e.integrante ?? '')} não executa e guardou o motivo para a próxima vez.`)
    return true
  }
  const f = efeitos.get(String(e.acao))
  if (f) f(c, { ...ctx, editado: !!ctx.editado || decisao === 'editar_e_aprovar' })
  else ctx.loja.toast('Aprovado. O integrante segue com o trabalho.')
  return true
}

/** Decidir um cartão S04 de qualquer tela (ficha, fila, gestão). */
export function useDecidirCartaoS04() {
  const loja = useLoja()
  const { usuario } = useSessao()
  const conversaDe = useConversaDe()
  return (id: string, decisao: 'aprovar' | 'editar_e_aprovar' | 'recusar', o: { comentario?: string; argumentos?: Record<string, string> } = {}) => {
    try {
      const atual = repos.cartoes.obter(id)
      if (o.argumentos && atual) repos.cartoes.atualizar(id, { extras: { ...atual.extras, argumentos_editados: o.argumentos } }, { texto: '' })
      repos.cartoes.decidir(id, decisao === 'recusar' ? 'recusado' : decisao === 'editar_e_aprovar' ? 'editado_e_aprovado' : 'aprovado', { comentario: o.comentario })
      aplicarEfeitoS04(id, decisao, { loja, usuario, conversaDe, comentario: o.comentario, editado: decisao === 'editar_e_aprovar' })
    } catch (e) {
      loja.toast(e instanceof ErroRegra || e instanceof Error ? e.message : 'Não deu para decidir.')
    }
  }
}

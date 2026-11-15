import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react'
import type { ConversaCrm, ItemConversa, StatusConversa } from '@/dados/crm'
import { visivelAoCliente, type Documento } from '@/dados/arquivos'
import { emissorDe, type NotaEmitida } from '@/dados/servicos-extras'
import * as exemplo from '@/dados/exemplo'
import type { Cartao, Cliente as ClienteTela, Mensagem, Tarefa } from '@/dados/tipos'
import type { UsuarioCfg } from '@/dados/configuracoes'
import { fichas, type FichaCliente } from './clientes'
import { type ContaBpo, lotesBpo } from '@/dados/bpo'
import { duracaoEscrita } from '@/lib/escrita'
import { fluxos as catalogoFluxos, nomeDoSetor, type FluxoSimulado, type PedidoAssistente } from '@/dados/simulacao'
import type { SetorIntegrante } from '@/theme/tipos'
import { banco } from '@/nucleo/banco'
import type { Escritorio, Id, Notificacao } from '@/nucleo/modelo/entidades'
import {
  avisoParaModelo,
  avisoParaTela,
  clienteParaTela,
  contaParaModelo,
  contaParaTela,
  conversaParaModelo,
  conversaParaTela,
  documentoParaModelo,
  documentoParaTela,
  horaCurta,
  idDaMensagem,
  itemParaMensagem,
  mensagemModeloParaTela,
  mensagemTelaParaModelo,
  notaParaModelo,
  notaParaTela,
  tarefaParaModelo,
  tarefaParaTela,
  trabalhoParaModelo,
  trabalhoParaTela,
  type Consulta,
} from '@/nucleo/mapeadores'
import { contextoSistema, ErroPermissao, ErroRegra, type Contexto } from '@/nucleo/permissoes'
import { agora, comoAtor, contextoAtual, linhaNova, registrarEvento, repos } from '@/nucleo/repositorios'
import { BancoOpcional, useBanco, useTabela } from '@/nucleo/react'

/**
 * Loja do escritório de demonstração: o que as ações mudam e que outros
 * módulos precisam enxergar (a mensagem enviada aparece na conversa do CRM,
 * o documento preparado aparece no chat do integrante, a tarefa concluída sai
 * da fila do Painel, o aviso chega no sino de quem deve receber).
 *
 * Desde a S00 a loja é uma fachada sobre o banco (src/nucleo): os dados ficam
 * nas entidades das Fundações e persistem no navegador (ou no Supabase). A
 * API para as telas não mudou. Tela nova deve ler e escrever pelos
 * repositórios (`repos.tarefas`, `useTabela('tarefa')`); ver
 * docs/wireframe/ARQUITETURA.md.
 */

export type IdModulo = 'inicio' | 'painel' | 'clientes' | 'crm' | 'timesheet' | 'financeiro' | 'arquivos' | 'bpo' | 'config' | 'interna'
/** Cenário da demonstração (10, 2): contabilidade com o BPO como módulo, ou escritório só de BPO. */
export type Cenario = 'contabil_bpo' | 'bpo_puro'

/** Para onde um link leva: módulo, aba e o item exato. Também é a rota (src/nucleo/rotas.ts). */
export interface Destino {
  modulo: IdModulo
  aba?: string
  conversa?: string
  integrante?: string
  /** Arquivos: pasta a abrir (cliente + caminho). */
  pasta?: { clienteId?: string; caminho: string[] }
  /** Seleciona o cliente no topo (ou `null` para a carteira). */
  cliente?: string | null
  fatura?: string
  /** Abre a ficha da tarefa por cima de onde estiver. */
  tarefa?: string
  /** Abre a ficha do cliente por cima de onde estiver. */
  ficha?: string
  /** S04 (C6): abre a trilha de implantação ou de saída do cliente (id do cliente) por cima do Painel. */
  trilha?: string
  /** S02 (C1): a aba Obrigações abre filtrada por este setor dono ("ver todas" do bloco Obrigações do setor). */
  filtroSetor?: SetorIntegrante
  /** S05: conversa interna aberta (tela cheia `#/interna` ou gaveta do Chat, aba Equipe). */
  conversaInterna?: string
  /** S07: contrato de honorários aberto (Financeiro › Contratos). */
  contrato?: string
}

/** Quem a notificação traz: um integrante (orb no estado dele) ou um contato do cliente (foto, canal). */
export type QuemToast =
  | { tipo: 'integrante'; setor: SetorIntegrante; estado?: 'trabalhando' | 'concluido' | 'precisa_de_voce' }
  | { tipo: 'contato'; nome: string; cliente?: string; canal: 'whatsapp' | 'email' | 'app' }

export interface Toast {
  id: string
  texto: string
  destino?: Destino
  rotuloDestino?: string
  /** Sem `quem`, é uma confirmação do sistema (ícone, sem pessoa). */
  quem?: QuemToast
  /** Hora em que chegou (a notificação mostra "agora" e depois a hora). */
  em?: number
  /** Botão de ação no toast (ex.: Desfazer). */
  acao?: { rotulo: string; executar: () => void }
  /** Erro (permissão negada, regra de negócio). */
  erro?: boolean
}

export interface AvisoSistema {
  id: string
  /** Ids de usuário; vazio = todos. */
  para: string[]
  titulo: string
  detalhe?: string
  quando: string
  setor?: SetorIntegrante
  tipo: 'cartao' | 'conversa' | 'prazo' | 'sistema' | 'cliente'
  lidoPor: string[]
  destino?: Destino
}

export interface Evento {
  id: string
  quando: string
  ator: string
  texto: string
}

interface Estado {
  toasts: Toast[]
  avisos: AvisoSistema[]
  eventos: Evento[]
  /** Decisões tomadas nos cartões de aprovação (sobrevivem à troca de tela e ao recarregar). */
  decisoes: Record<string, string>
  /** Módulo BPO ligado na assinatura (Configurações › Assinatura). */
  bpoModulo: boolean
  cenario: Cenario
  /** Timesheet › Configurar: custo-hora por pacote (extra opcional, desligado por padrão). */
  custoPorPacote: boolean
  /** Estado das telas que precisa sobreviver à troca de aba e ao recarregar (ver usePersistente). */
  memoria: Record<string, unknown>
  /** Trabalho simulado dos integrantes (ver src/dados/simulacao.ts). */
  trabalhos: Trabalho[]
  /** Quem está digitando em cada conversa do CRM (o cliente antes de responder). */
  digitando: Record<string, string>
  /** O que o time escreve no chat do Assistente enquanto faz um pedido (por id da conversa). */
  assistente: Record<string, Mensagem[]>
  /** Alçadas do BPO propostas pelo escritório, à espera do aceite do cliente no app (10, 3.7). */
  bpoAlcadaProposta: Record<string, PropostaAlcada>
  /** Alçadas aceitas pelo cliente (valem no lugar das do cadastro). */
  bpoAlcadas: Record<string, { faixa1: number; faixa2: number; janela: string; aceitoPor: string; alteradaPor: string }>
  /** Decisões nos lotes de pagamento do BPO (cartão de aprovação no app do cliente). */
  bpoLotes: Record<string, DecisaoLote>
  bpoContas: Record<string, Partial<ContaBpo>>
}

export interface PropostaAlcada {
  faixa1: number
  faixa2: number
  janela: string
  pessoas: Record<string, number>
  /** Quem propôs: não confere nem aprova pagamento nesta empresa. */
  por: string
  quando: string
}

/** Um fluxo simulado em andamento ou concluído, com o momento em que começou (o progresso sai do relógio). */
export interface Trabalho extends FluxoSimulado {
  uid: string
  inicioEm: number
  situacao: 'rodando' | 'concluido'
  tarefaId?: string
  /** Conversa do Assistente que pediu: o trabalho aparece lá, com retorno e passagens. */
  origem?: string
  /** Rotina do integrante (ninguém pediu): avisa no sino, sem toast. */
  silencioso?: boolean
  fimEm?: number
}

/** O que a pessoa está olhando agora: o aviso de algo que ela já vê nasce lido e sem toast. */
export interface Vista {
  modulo?: string
  aba?: string
  integrante?: string
  conversa?: string
  usuario?: string
}
export const duracaoTrabalho = (t: Trabalho) => t.etapas.length * t.seg * 1000

/** Aprovação humana registrada (10, B3): quem, quando e o que aprovou. Pagar nunca é automático. */
export interface DecisaoLote {
  situacao: 'aguardando' | 'parcial' | 'aprovado' | 'recusado' | 'liberado'
  aprovacoes: { nome: string; quando: string }[]
  removidos: string[]
  motivo?: string
}

type Acao =
  | { t: 'toast'; toast: Toast }
  | { t: 'fecharToast'; id: string }
  | { t: 'avisar'; aviso: AvisoSistema }
  | { t: 'ler'; id: string; usuario: string }
  | { t: 'lerTodos'; usuario: string }
  | { t: 'evento'; evento: Evento }
  | { t: 'crmItem'; conversa: string; item: ItemConversa }
  | { t: 'crmStatus'; conversa: string; status: StatusConversa }
  | { t: 'crmNova'; conversa: ConversaCrm }
  | { t: 'crmSalvar'; conversa: ConversaCrm }
  | { t: 'tarefa'; id: string; patch: Partial<Tarefa> }
  | { t: 'tarefaNova'; tarefa: Tarefa }
  | { t: 'timeMsg'; integrante: string; msg: Mensagem }
  | { t: 'decidir'; cartao: string; decisao: string }
  | { t: 'ficha'; ficha: FichaCliente }
  | { t: 'nota'; nota: NotaEmitida }
  | { t: 'cancelarNota'; clienteId: string; numero: number }
  | { t: 'documento'; documento: Documento }
  | { t: 'documentoPatch'; id: string; patch: Partial<Documento> }
  | { t: 'bpoModulo'; ligado: boolean }
  | { t: 'cenario'; cenario: Cenario }
  | { t: 'custoPorPacote'; ligado: boolean }
  | { t: 'memoria'; chave: string; inicial: unknown; valor: unknown }
  | { t: 'trabalho'; trabalho: Trabalho }
  | { t: 'crmItemPatch'; conversa: string; id: string; patch: Record<string, unknown> }
  | { t: 'digitando'; conversa: string; quem: string | null }
  | { t: 'trabalhoFim'; uid: string }
  | { t: 'timeMsgPatch'; integrante: string; id: string; patch: Partial<Mensagem> }
  | { t: 'assistMsg'; conversa: string; msg: Mensagem }
  | { t: 'assistMsgPatch'; conversa: string; id: string; patch: Partial<Mensagem> }
  | { t: 'alcadaProposta'; clienteId: string; proposta: PropostaAlcada | null }
  | { t: 'alcadaAceita'; clienteId: string; alcadas: { faixa1: number; faixa2: number; janela: string; aceitoPor: string; alteradaPor: string } }
  | { t: 'bpoLote'; id: string; decisao: DecisaoLote }
  | { t: 'bpoConta'; id: string; patch: Partial<ContaBpo> }

const hora = () => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
const novoId = (p: string) => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`
const ctxIntegrante = (id: string, setor: SetorIntegrante): Contexto => ({ ator: { tipo: 'integrante', id, nome: nomeDoSetor(setor) }, origem: 'job' })

/* ---------- O que só vive na tela (não persiste) ---------- */

interface Volatil {
  toasts: Toast[]
  digitando: Record<string, string>
}

function reduzirVolatil(s: Volatil, a: Acao): Volatil {
  switch (a.t) {
    case 'toast':
      return { ...s, toasts: [...s.toasts.slice(-2), a.toast] }
    case 'fecharToast':
      return { ...s, toasts: s.toasts.filter((x) => x.id !== a.id) }
    case 'digitando': {
      const d = { ...s.digitando }
      if (a.quem) d[a.conversa] = a.quem
      else delete d[a.conversa]
      return { ...s, digitando: d }
    }
    default:
      return s
  }
}

/* ---------- O que persiste: cada ação vira escrita no banco ---------- */

// Prefixo próprio (as telas usam chaves livres no usePersistente, inclusive "bpo.*").
const CHAVES_BPO = { alcadaProposta: 'loja:bpo.alcadaProposta', alcadas: 'loja:bpo.alcadas', lotes: 'loja:bpo.lotes', contas: 'loja:bpo.contas' } as const
const valorTela = <T,>(chave: string, padrao: T): T => (banco.obter('registro_tela', chave)?.valor as T | undefined) ?? padrao
const consulta = (): Consulta => ({ clientes: banco.ler('cliente'), usuarios: banco.ler('usuario'), integrantes: banco.ler('integrante') })
const menorOrdem = (t: 'tarefa' | 'conversa' | 'documento') => banco.ler(t).reduce((m, r) => Math.min(m, r.ordem ?? 0), 0) - 1
const maiorOrdem = (t: 'notificacao' | 'mensagem' | 'mensagem_integrante') => banco.ler(t).reduce((m, r) => Math.max(m, r.ordem ?? 0), 0) + 1
const statusDaDecisao = (d: string) => (d === 'recusar' ? 'recusado' : d === 'editar_e_aprovar' ? 'editado_e_aprovado' : 'aprovado')

function atualizarEscritorio(patch: (e: Escritorio) => Partial<Escritorio>) {
  const e = banco.ler('escritorio')[0]
  if (e) repos.escritorios.atualizar(e.id, patch(e))
}

function ajustarMensagemIntegrante(sessao: string, id: string, patch: Partial<Mensagem>) {
  const r = banco.obter('mensagem_integrante', id)
  if (!r || r.sessao_chave !== sessao) return
  const msg = { ...mensagemModeloParaTela(r), ...patch }
  banco.transacao((tx) => tx.gravar('mensagem_integrante', { ...r, corpo: msg.texto, extras: { ...r.extras, mensagem: msg }, atualizado_em: agora() }))
}

function gravarMensagemIntegrante(sessao: string, msg: Mensagem) {
  banco.transacao((tx) => tx.gravar('mensagem_integrante', linhaNova('mensagem_integrante', mensagemTelaParaModelo(sessao, msg, maiorOrdem('mensagem_integrante')))))
}

function aplicar(a: Acao): void {
  switch (a.t) {
    case 'avisar':
      repos.notificacoes.criar(avisoParaModelo(a.aviso, maiorOrdem('notificacao')), { ctx: contextoSistema })
      return
    case 'ler':
      return repos.notificacoes.ler(a.id, a.usuario)
    case 'lerTodos':
      return repos.notificacoes.lerTodas(
        a.usuario,
        banco
          .ler('notificacao')
          .filter((n) => n.destinatario_ids.length === 0 || n.destinatario_ids.includes(a.usuario))
          .map((n) => n.id),
      )
    case 'evento':
      banco.transacao((tx) => registrarEvento(tx, contextoAtual(), { nome: 'atividade.registrar', ferramenta: 'evento.listar', texto: a.evento.texto, ator_nome: a.evento.ator }))
      return
    case 'crmItem': {
      const conversa = banco.obter('conversa', a.conversa)
      const m = linhaNova('mensagem', itemParaMensagem(a.conversa, a.item, maiorOrdem('mensagem')))
      banco.transacao((tx) => {
        tx.gravar('mensagem', m)
        if (conversa) {
          const tela = (conversa.extras?.tela ?? {}) as Partial<ConversaCrm>
          const previa = a.item.tipo === 'mensagem' && a.item.texto ? `${a.item.autor ?? ''}${a.item.autor ? ': ' : ''}${a.item.texto}` : tela.previa
          tx.gravar('conversa', { ...conversa, ultima_mensagem_em: agora(), atualizado_em: agora(), extras: { ...conversa.extras, tela: { ...tela, previa } } })
        }
        if (a.item.tipo === 'mensagem' || a.item.tipo === 'nota')
          registrarEvento(tx, contextoAtual(), {
            nome: a.item.tipo === 'nota' ? 'conversa.nota_interna' : 'conversa.responder',
            ferramenta: a.item.tipo === 'nota' ? 'conversa.nota_interna' : 'conversa.responder',
            texto: `${a.item.tipo === 'nota' ? 'Nota interna' : 'Mensagem'} em ${String(conversa?.extras?.pessoa_nome ?? a.conversa)}`,
            setor_id: conversa?.setor_id,
            cliente_id: conversa?.cliente_id,
            resultado_ref: m.id,
            visivel_na_linha_do_tempo: false,
          })
      })
      return
    }
    case 'crmItemPatch': {
      const m = banco.obter('mensagem', idDaMensagem(a.conversa, { id: a.id }))
      if (!m || m.conversa_id !== a.conversa) return
      const item = { ...(m.extras?.item as object), ...a.patch } as ItemConversa
      const espelho = item.tipo === 'mensagem' ? { status_entrega: item.entrega ?? m.status_entrega, corpo: item.texto ?? m.corpo } : {}
      banco.transacao((tx) => tx.gravar('mensagem', { ...m, ...espelho, extras: { ...m.extras, item }, atualizado_em: agora() }))
      return
    }
    case 'crmStatus':
      if (banco.obter('conversa', a.conversa)) repos.conversas.atualizar(a.conversa, { status: a.status }, { ferramenta: a.status === 'resolvida' ? 'conversa.resolver' : 'conversa.atualizar' })
      return
    case 'crmNova':
    case 'crmSalvar': {
      const q = consulta()
      const existente = banco.obter('conversa', a.conversa.id)
      const pessoa = banco.ler('pessoa').find((p) => p.nome === a.conversa.pessoa.nome)
      const linha = { ...conversaParaModelo(a.conversa, q, pessoa?.id ?? existente?.pessoa_id ?? undefined), ordem: existente?.ordem ?? menorOrdem('conversa') }
      banco.transacao((tx) => {
        tx.gravar('conversa', existente ? { ...existente, ...linha, atualizado_em: agora() } : linhaNova('conversa', linha))
        a.conversa.itens.forEach((item, i) => {
          const nova = itemParaMensagem(a.conversa.id, item, i + 1)
          const antes = tx.obter('mensagem', nova.id)
          tx.gravar('mensagem', antes ? { ...antes, ...nova, atualizado_em: agora() } : linhaNova('mensagem', nova))
        })
        registrarEvento(tx, contextoAtual(), { nome: existente ? 'conversa.atualizar' : 'conversa.criar', ferramenta: existente ? 'conversa.atualizar' : 'conversa.criar', texto: `${existente ? 'Atualizou' : 'Abriu'} a conversa com ${a.conversa.pessoa.nome}`, setor_id: a.conversa.setor, cliente_id: a.conversa.clienteId ?? null, resultado_ref: a.conversa.id })
      })
      return
    }
    case 'tarefa': {
      const antes = banco.obter('tarefa', a.id)
      if (!antes) return
      const q = consulta()
      const tela = { ...tarefaParaTela(antes, q), ...a.patch }
      const depois = tarefaParaModelo(tela, q, antes)
      if (depois.status !== antes.status) repos.tarefas.mudarStatus(a.id, depois.status, { motivo: 'cancelada pela tela' })
      const { status: _s, status_desde: _d, ...resto } = depois
      void _s
      void _d
      const atual = banco.obter('tarefa', a.id)!
      const mudou = Object.entries(resto).some(([k, v]) => JSON.stringify((atual as unknown as Record<string, unknown>)[k]) !== JSON.stringify(v))
      if (mudou) repos.tarefas.atualizar(a.id, resto)
      return
    }
    case 'tarefaNova':
      repos.tarefas.criar({ ...tarefaParaModelo(a.tarefa, consulta()), ordem: menorOrdem('tarefa') })
      return
    case 'timeMsg':
      return gravarMensagemIntegrante(`time:${a.integrante}`, a.msg)
    case 'timeMsgPatch':
      return ajustarMensagemIntegrante(`time:${a.integrante}`, a.id, a.patch)
    case 'assistMsg':
      return gravarMensagemIntegrante(`assistente:${a.conversa}`, a.msg)
    case 'assistMsgPatch':
      return ajustarMensagemIntegrante(`assistente:${a.conversa}`, a.id, a.patch)
    case 'decidir':
      repos.cartoes.decidir(a.cartao, statusDaDecisao(a.decisao), { criarSeFaltar: { resumo_humano: `cartão ${a.cartao}`, extras: { decisao_texto: a.decisao } } })
      return
    case 'ficha': {
      const c = banco.obter('cliente', a.ficha.id)
      if (c) repos.clientes.atualizar(c.id, { extras: { ...c.extras, ficha: a.ficha } }, { texto: `Atualizou a ficha de ${c.nome}` })
      return
    }
    case 'nota': {
      const n = { ...a.nota, clienteId: a.nota.clienteId ?? '' }
      const linha = notaParaModelo(n)
      if (banco.obter('nota_emitida', linha.id)) repos.notas.atualizar(linha.id, linha)
      else repos.notas.criar(linha, { texto: `Emitiu a NFS-e ${n.numero}` })
      return
    }
    case 'cancelarNota': {
      const id = `nf-${a.clienteId}-${a.numero}`
      if (banco.obter('nota_emitida', id)) {
        const n = banco.obter('nota_emitida', id)!
        repos.notas.atualizar(id, { situacao: 'cancelada', extras: { ...n.extras, nota: { ...(n.extras?.nota as object), situacao: 'cancelada' } } }, { ferramenta: 'nfse.cancelar', texto: `Cancelou a NFS-e ${a.numero}` })
      } else {
        const base = emissorDe(a.clienteId).notas.find((n) => n.numero === a.numero)
        if (base) repos.notas.criar(notaParaModelo({ ...base, clienteId: a.clienteId, situacao: 'cancelada' }), { ferramenta: 'nfse.cancelar', texto: `Cancelou a NFS-e ${a.numero}` })
      }
      return
    }
    case 'documento':
      repos.documentos.criar({ ...documentoParaModelo(a.documento, visivelAoCliente(a.documento)), ordem: menorOrdem('documento') }, { texto: `Registrou ${a.documento.nome}` })
      return
    case 'documentoPatch': {
      const antes = banco.obter('documento', a.id)
      if (!antes) return
      const tela = { ...documentoParaTela(antes), ...a.patch }
      // Só o registro de entrega (visto, baixado): ferramenta própria, que o app do cliente pode usar (4.11).
      const soEntrega = Object.keys(a.patch).every((k) => k === 'entregas')
      repos.documentos.atualizar(a.id, { ...documentoParaModelo(tela, visivelAoCliente(tela)), ordem: antes.ordem }, soEntrega ? { ferramenta: 'documento.registrar_entrega', texto: `Entrega registrada: ${antes.nome_arquivo}` } : {})
      return
    }
    case 'bpoModulo': {
      const ass = banco.ler('assinatura')[0]
      if (ass) repos.assinaturas.atualizar(ass.id, { modulos: a.ligado ? [...new Set([...ass.modulos, 'bpo' as const])] : ass.modulos.filter((m) => m !== 'bpo') }, { texto: `${a.ligado ? 'Ligou' : 'Desligou'} o módulo BPO na assinatura` })
      return
    }
    case 'cenario':
      // Controle do painel da demonstração (não é ação de produto): grava como sistema.
      return comoAtor(contextoSistema, () => atualizarEscritorio((e) => ({ configuracao: { ...e.configuracao, cenario: a.cenario } })))
    case 'custoPorPacote':
      return atualizarEscritorio((e) => ({ configuracao: { ...e.configuracao, custo_por_pacote: a.ligado } }))
    case 'memoria': {
      const r = banco.obter('registro_tela', a.chave)
      const antes = r ? r.valor : a.inicial
      const depois = typeof a.valor === 'function' ? (a.valor as (x: unknown) => unknown)(antes) : a.valor
      repos.telas.lembrar(a.chave, depois)
      return
    }
    case 'trabalho':
      banco.transacao((tx) => tx.gravar('item_fila', linhaNova('item_fila', trabalhoParaModelo(a.trabalho))))
      return
    case 'trabalhoFim': {
      const r = banco.obter('item_fila', a.uid)
      if (r) banco.transacao((tx) => tx.gravar('item_fila', { ...r, status: 'concluido', concluido_em: agora(), atualizado_em: agora() }))
      return
    }
    case 'alcadaProposta': {
      const resto = { ...valorTela<Record<string, PropostaAlcada>>(CHAVES_BPO.alcadaProposta, {}) }
      if (a.proposta) resto[a.clienteId] = a.proposta
      else delete resto[a.clienteId]
      return repos.telas.lembrar(CHAVES_BPO.alcadaProposta, resto)
    }
    case 'alcadaAceita':
      return repos.telas.lembrar(CHAVES_BPO.alcadas, { ...valorTela(CHAVES_BPO.alcadas, {}), [a.clienteId]: a.alcadas })
    case 'bpoLote':
      return repos.telas.lembrar(CHAVES_BPO.lotes, { ...valorTela(CHAVES_BPO.lotes, {}), [a.id]: a.decisao })
    case 'bpoConta': {
      const contas = valorTela<Record<string, Partial<ContaBpo>>>(CHAVES_BPO.contas, {})
      return repos.telas.lembrar(CHAVES_BPO.contas, { ...contas, [a.id]: { ...contas[a.id], ...a.patch } })
    }
  }
}

interface Loja {
  estado: Estado
  /** Clientes do escritório (formato de tela). */
  clientes: ClienteTela[]
  /** Conversas do CRM com o que as ações acrescentaram. */
  conversas: ConversaCrm[]
  /** Tarefas com os estados mudados pelas ações. */
  tarefas: Tarefa[]
  /** Conversas de cada integrante no Time, com as mensagens novas. */
  conversasTime: Record<string, Mensagem[]>
  toast: (texto: string, destino?: Destino, rotuloDestino?: string, quem?: QuemToast) => void
  /** Toast com o botão Desfazer (o kit usa depois de editar, mover ou excluir). */
  toastDesfazer: (texto: string, desfazer: () => void) => void
  /** Toast de erro (permissão negada, regra de negócio). */
  toastErro: (texto: string) => void
  fecharToast: (id: string) => void
  avisar: (a: Omit<AvisoSistema, 'id' | 'quando' | 'lidoPor'>) => void
  ler: (id: string, usuario: string) => void
  lerTodos: (usuario: string) => void
  registrar: (ator: string, texto: string) => void
  mensagemCrm: (conversa: string, item: Omit<Extract<ItemConversa, { tipo: 'mensagem' }>, 'id' | 'hora'> | Omit<Extract<ItemConversa, { tipo: 'nota' }>, 'id' | 'hora'>) => void
  statusConversa: (conversa: string, status: StatusConversa) => void
  novaConversa: (c: ConversaCrm) => void
  salvarConversa: (c: ConversaCrm) => void
  atualizarTarefa: (id: string, patch: Partial<Tarefa>) => void
  criarTarefa: (t: Omit<Tarefa, 'id'>) => string
  mensagemTime: (integrante: string, msg: Omit<Mensagem, 'id' | 'hora'>) => void
  decidir: (cartao: string, decisao: string) => void
  fichaDe: (clienteId?: string) => FichaCliente | undefined
  salvarFicha: (f: FichaCliente) => void
  emitirNota: (n: NotaEmitida) => void
  cancelarNota: (clienteId: string, numero: number) => void
  /** Notas do cliente: as do cadastro mais as emitidas e canceladas pelo app. */
  notasDe: (clienteId: string) => NotaEmitida[]
  /** Todos os documentos (índice + novos, com os ajustes). */
  documentos: Documento[]
  adicionarDocumento: (d: Omit<Documento, 'id' | 'hash' | 'versao'> & Partial<Pick<Documento, 'versao'>>) => Documento
  ajustarDocumento: (id: string, patch: Partial<Documento>) => void
  /** Liga ou desliga o módulo BPO da assinatura. */
  ligarBpo: (ligado: boolean) => void
  definirCenario: (c: Cenario) => void
  ligarCustoPorPacote: (v: boolean) => void
  /** Grava um valor de tela (usePersistente). */
  lembrar: (chave: string, inicial: unknown, valor: unknown) => void
  /** Põe um integrante para "fazer" um fluxo simulado (etapas, aviso ao terminar, passagens). */
  iniciarTrabalho: (f: FluxoSimulado, opcoes?: { tarefaId?: string; origem?: string; final?: PedidoAssistente['final'] }) => void
  /** Informa o que a pessoa está olhando (avisos do que ela já vê não viram toast). */
  definirVista: (v: Vista) => void
  /** Trabalho em andamento de um integrante (ou de uma tarefa). */
  trabalhoDe: (filtro: { integrante?: string; tarefaId?: string }) => Trabalho | undefined
  /** Grava ou ajusta uma mensagem no chat do integrante (com id próprio, para a resposta "pensando" virar texto). */
  mensagemTimeComId: (integrante: string, msg: Mensagem) => void
  ajustarMensagemTime: (integrante: string, id: string, patch: Partial<Mensagem>) => void
  /** Mostra (ou tira) "fulano está digitando" numa conversa do CRM. */
  digitar: (conversa: string, quem: string | null) => void
  proporAlcada: (clienteId: string, p: Omit<PropostaAlcada, 'quando'> | null) => void
  aceitarAlcada: (clienteId: string, quem: string) => void
  /** Registra a aprovação (ou recusa) de um lote; o lote só fica aprovado com o número de aprovadores da alçada. */
  decidirLote: (id: string, acao: { tipo: 'aprovar'; nome: string; removidos?: string[] } | { tipo: 'recusar'; nome: string; motivo: string } | { tipo: 'liberar'; nome: string }) => void
  ajustarContaBpo: (id: string, patch: Partial<ContaBpo>) => void
  /** Volta o escritório aos dados de exemplo (o painel da demonstração confirma antes). */
  reiniciar: () => void
}

const Ctx = createContext<Loja | null>(null)

export { avisosIniciais } from '@/dados/avisos'

/** Mensagem "pensando" que ficou para trás num recarregar (o relógio dela se perdeu): sai da conversa. */
const PENSANDO_MAX_MS = 60_000

/** `semRotinas`: sem o trabalho de fundo do time (a demonstração do site mostra só o pedido da pessoa). */
export function LojaProvider({ children, semRotinas }: { children: ReactNode; semRotinas?: boolean }) {
  return (
    <BancoOpcional>
      <LojaInterna semRotinas={semRotinas}>{children}</LojaInterna>
    </BancoOpcional>
  )
}

function LojaInterna({ children, semRotinas }: { children: ReactNode; semRotinas?: boolean }) {
  const [volatil, despacharVolatil] = useReducer(reduzirVolatil, { toasts: [], digitando: {} })
  const { restaurar } = useBanco()

  const toast = useCallback((texto: string, destino?: Destino, rotuloDestino?: string, quem?: QuemToast, extra?: Pick<Toast, 'acao' | 'erro'>) => {
    const id = novoId('t')
    despacharVolatil({ t: 'toast', toast: { id, texto, destino, rotuloDestino, quem, em: Date.now(), ...extra } })
    // Quem traz pessoa (integrante, cliente) ou um desfazer fica um pouco mais: é para ler.
    setTimeout(() => despacharVolatil({ t: 'fecharToast', id }), quem || extra?.acao ? 8000 : 6000)
  }, [])

  /** Toda ação passa por aqui: o que é de tela fica no estado; o resto vira escrita no banco (com permissão e evento). */
  const despachar = useCallback(
    (a: Acao) => {
      if (a.t === 'toast' || a.t === 'fecharToast' || a.t === 'digitando') return despacharVolatil(a)
      try {
        aplicar(a)
      } catch (e) {
        if (e instanceof ErroPermissao || e instanceof ErroRegra) toast(e.message, undefined, undefined, undefined, { erro: true })
        else throw e
      }
    },
    [toast],
  )
  const despacharComo = (ctx: Contexto, a: Acao) => comoAtor(ctx, () => despachar(a))

  /* ---------- Leitura: as tabelas do banco em formato de tela ---------- */
  const tCliente = useTabela('cliente')
  const tTarefa = useTabela('tarefa')
  const tConversa = useTabela('conversa')
  const tMensagem = useTabela('mensagem')
  const tDocumento = useTabela('documento')
  const tNotificacao = useTabela('notificacao')
  const tEvento = useTabela('evento')
  const tCartao = useTabela('cartao_aprovacao')
  const tMsgIntegrante = useTabela('mensagem_integrante')
  const tFila = useTabela('item_fila')
  const tTela = useTabela('registro_tela')
  const tNota = useTabela('nota_emitida')
  const tEscritorio = useTabela('escritorio')
  const tAssinatura = useTabela('assinatura')

  const clientes = useMemo(() => tCliente.filter((c) => !c.arquivado_em).map(clienteParaTela), [tCliente])
  const tarefas = useMemo(() => {
    const q = { clientes: tCliente }
    return repos.tarefas.listar((t) => t.status !== 'cancelada').map((t) => tarefaParaTela(t, q))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tTarefa, tCliente])
  const conversas = useMemo(() => {
    const porConversa = new Map<Id, typeof tMensagem>()
    for (const m of tMensagem) porConversa.set(m.conversa_id, [...(porConversa.get(m.conversa_id) ?? []), m])
    return repos.conversas.listar().map((c) => conversaParaTela(c, (porConversa.get(c.id) ?? []).sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tConversa, tMensagem])
  const documentos = useMemo(() => repos.documentos.listar().map(documentoParaTela), [tDocumento]) // eslint-disable-line react-hooks/exhaustive-deps
  const mensagensDeSessao = useMemo(() => {
    const porSessao: Record<string, Mensagem[]> = {}
    const limite = Date.now() - PENSANDO_MAX_MS
    for (const r of [...tMsgIntegrante].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))) {
      const m = mensagemModeloParaTela(r)
      if (m.pendente && Date.parse(r.atualizado_em) < limite) continue
      ;(porSessao[r.sessao_chave] ??= []).push(m)
    }
    return porSessao
  }, [tMsgIntegrante])
  const conversasTime = useMemo(() => {
    const r: Record<string, Mensagem[]> = {}
    for (const [k, v] of Object.entries(mensagensDeSessao)) if (k.startsWith('time:')) r[k.slice(5)] = v
    return r
  }, [mensagensDeSessao])
  const trabalhos = useMemo(() => tFila.map(trabalhoParaTela).filter((t) => t && t.uid && !(semRotinas && t.uid.startsWith('rot-'))), [tFila, semRotinas])

  const estado = useMemo<Estado>(() => {
    const tela = Object.fromEntries(tTela.map((r) => [r.id, r.valor]))
    const escritorio = tEscritorio[0]
    const assistente: Record<string, Mensagem[]> = {}
    for (const [k, v] of Object.entries(mensagensDeSessao)) if (k.startsWith('assistente:')) assistente[k.slice(11)] = v
    return {
      toasts: volatil.toasts,
      digitando: volatil.digitando,
      avisos: [...tNotificacao].sort((a, b) => (b.ordem ?? 0) - (a.ordem ?? 0)).map((n: Notificacao) => avisoParaTela(n)),
      eventos: tEvento
        .filter((e) => e.nome === 'atividade.registrar')
        .sort((a, b) => b.criado_em.localeCompare(a.criado_em))
        .map((e) => ({ id: e.id, quando: horaCurta(e.criado_em), ator: e.ator_nome ?? '', texto: e.texto })),
      decisoes: Object.fromEntries(tCartao.filter((c) => c.decidido_em).map((c) => [c.id, String(c.extras?.decisao_texto ?? (c.status === 'recusado' ? 'recusar' : 'aprovar'))])),
      bpoModulo: tAssinatura[0]?.modulos.includes('bpo') ?? false,
      cenario: escritorio?.configuracao.cenario ?? 'contabil_bpo',
      custoPorPacote: !!escritorio?.configuracao.custo_por_pacote,
      memoria: Object.fromEntries(Object.entries(tela).filter(([k]) => !k.startsWith('loja:'))),
      trabalhos,
      assistente,
      bpoAlcadaProposta: (tela[CHAVES_BPO.alcadaProposta] as Estado['bpoAlcadaProposta']) ?? {},
      bpoAlcadas: (tela[CHAVES_BPO.alcadas] as Estado['bpoAlcadas']) ?? {},
      bpoLotes: (tela[CHAVES_BPO.lotes] as Estado['bpoLotes']) ?? {},
      bpoContas: (tela[CHAVES_BPO.contas] as Estado['bpoContas']) ?? {},
    }
  }, [volatil, tNotificacao, tEvento, tCartao, tAssinatura, tEscritorio, tTela, trabalhos, mensagensDeSessao])

  const conversasRef = useRef<ConversaCrm[]>([])
  conversasRef.current = conversas

  /* ---------- Motor do trabalho simulado ---------- */
  // Nada é instantâneo: o integrante pensa antes de falar, a passagem leva um tempo, a mensagem ao cliente
  // passa por enviada, entregue e lida, e o cliente aparece digitando antes de responder.
  const PENSA = 1500
  const depois = (ms: number, f: () => void) => window.setTimeout(f, ms)
  const tarefasRef = useRef<Tarefa[]>([])
  const vistaRef = useRef<Vista>({})
  const definirVista = useCallback((v: Vista) => {
    vistaRef.current = v
  }, [])
  /** Fechamento de cada pedido do Assistente (o que ele diz quando o último integrante devolve). */
  const finaisRef = useRef<Record<string, PedidoAssistente['final']>>({})
  const vendoIntegrante = (id: string) => vistaRef.current.modulo === 'inicio' && vistaRef.current.aba === 'time' && vistaRef.current.integrante === id
  const vendoAssistente = () => vistaRef.current.modulo === 'inicio' && vistaRef.current.aba === 'assistente'
  const vendoConversa = (c: string) => vistaRef.current.modulo === 'crm' && vistaRef.current.conversa === c
  /** Sino e toast. Quem já está vendo a coisa não recebe toast, e o aviso nasce lido para essa pessoa. */
  const notificar = (aviso: Omit<AvisoSistema, 'id' | 'quando' | 'lidoPor'>, olhando: boolean, toastTexto?: string, rotulo?: string, quem?: QuemToast) => {
    const u = vistaRef.current.usuario
    despachar({ t: 'avisar', aviso: { ...aviso, id: novoId('av'), quando: hora(), lidoPor: olhando && u ? [u] : [] } })
    if (!olhando && toastTexto) toast(toastTexto, aviso.destino, rotulo, quem)
  }
  const falar = useCallback((integrante: string, setor: SetorIntegrante, texto: string, cartoes?: Cartao[], ms = PENSA, aoTerminar?: () => void, extra?: Partial<Mensagem>) => {
    const id = novoId('mt')
    despachar({ t: 'timeMsg', integrante, msg: { id, autor: { tipo: 'integrante', setor }, hora: hora(), pendente: true } })
    depois(ms, () => {
      despachar({ t: 'timeMsgPatch', integrante, id, patch: { pendente: false, escrever: true, escreverDesde: Date.now(), hora: hora(), texto, cartoes, demonstracao: true, ...extra } })
      // Os efeitos (aviso, CRM, passagem) só vêm quando ele termina de escrever.
      if (aoTerminar) depois(duracaoEscrita(texto) + 250, aoTerminar)
    })
  }, [])
  /** Mensagem no chat do Assistente (de um integrante, ou do próprio Assistente). */
  const noAssistente = (conversa: string, msg: Omit<Mensagem, 'id' | 'hora' | 'em'>) => {
    const id = novoId('ma')
    despachar({ t: 'assistMsg', conversa, msg: { ...msg, id, hora: hora(), em: Date.now() } })
    return id
  }
  /** O Assistente pensa, escreve e só depois mostra os cartões; `aoTerminar` vem quando ele termina de escrever. */
  const assistenteFala = (conversa: string, texto: string, cartoes?: (em: number) => Cartao[], aoTerminar?: () => void) => {
    const id = noAssistente(conversa, { autor: { tipo: 'integrante', setor: 'geral' }, pendente: true })
    depois(PENSA, () => {
      const cartoesProntos = cartoes?.(Date.now() + duracaoEscrita(texto) + 200)
      despachar({ t: 'assistMsgPatch', conversa, id, patch: { pendente: false, escrever: true, escreverDesde: Date.now(), hora: hora(), texto, cartoes: cartoesProntos, demonstracao: true } })
      if (aoTerminar) depois(duracaoEscrita(texto) + 250, aoTerminar)
    })
  }
  const iniciarTrabalho = useCallback(
    (f: FluxoSimulado, opcoes?: { tarefaId?: string; origem?: string; final?: PedidoAssistente['final'] }) => comoAtor(ctxIntegrante(f.integrante, f.setor), () => {
      falar(f.integrante, f.setor, f.inicio, undefined, PENSA, undefined, f.suposicoes?.length ? { suposicoes: f.suposicoes } : undefined)
      if (opcoes?.tarefaId) despachar({ t: 'tarefa', id: opcoes.tarefaId, patch: { status: 'em_andamento' } })
      if (opcoes?.origem && opcoes.final) finaisRef.current[opcoes.origem] = opcoes.final
      const uid = novoId('tr')
      // O progresso começa depois que ele respondeu (o relógio do trabalho já nasce adiantado).
      despachar({ t: 'trabalho', trabalho: { ...f, uid, inicioEm: Date.now() + PENSA + duracaoEscrita(f.inicio) + 300, situacao: 'rodando', tarefaId: opcoes?.tarefaId, origem: opcoes?.origem } })
      // Pedido do Assistente: o cartão do trabalho aparece no chat dele, anda e fica concluído ali.
      if (opcoes?.origem) noAssistente(opcoes.origem, { autor: { tipo: 'integrante', setor: f.setor }, cartoes: [{ tipo: 'trabalho', id: `c${uid}`, uid }] })
      despachar({ t: 'evento', evento: { id: novoId('e'), quando: hora(), ator: f.integrante, texto: `Começou: ${f.titulo}${f.cliente ? ` · ${f.cliente}` : ''}` } })
    }),
    [falar],
  )
  /** Passagem animada: o cartão aparece no chat de quem passa e o outro começa depois de um instante. */
  const passarAdiante = (de: Trabalho, f: FluxoSimulado) => {
    despachar({
      t: 'timeMsg',
      integrante: de.integrante,
      msg: { id: novoId('mt'), autor: { tipo: 'integrante', setor: de.setor }, hora: hora(), cartoes: [{ tipo: 'encaminhamento', id: novoId('enc'), de: de.setor, para: f.setor, pedido: f.titulo, em: Date.now() }] },
    })
    depois(2000, () => iniciarTrabalho(f, { origem: de.origem }))
  }
  const passagemNoAssistente =
    (de: SetorIntegrante, f: FluxoSimulado) =>
    (em: number): Cartao[] => [{ tipo: 'encaminhamento', id: novoId('enc'), de, para: f.setor, pedido: f.titulo, em }]
  const enviarAoCliente = useCallback(
    (t: Trabalho, crm: NonNullable<Trabalho['fim']['crm']>) => {
      const id = novoId('m')
      const comoCliente = (autor: string, f: () => void) => comoAtor({ ator: { tipo: 'pessoa_cliente', nome: autor }, origem: 'api_externa' }, f)
      despacharComo(ctxIntegrante(t.integrante, t.setor), { t: 'crmItem', conversa: crm.conversa, item: { tipo: 'mensagem', id, hora: hora(), de: 'integrante', setor: t.setor, canal: 'whatsapp', texto: crm.texto, entrega: 'enviada' } as ItemConversa })
      depois(1400, () => despachar({ t: 'crmItemPatch', conversa: crm.conversa, id, patch: { entrega: 'entregue' } }))
      depois(4200, () => despachar({ t: 'crmItemPatch', conversa: crm.conversa, id, patch: { entrega: 'lida' } }))
      const r = crm.resposta
      if (!r) return
      const começa = 4200 + r.depoisDeSeg * 1000
      depois(começa, () => despachar({ t: 'digitando', conversa: crm.conversa, quem: r.autor }))
      depois(começa + r.digitarSeg * 1000, () => comoCliente(r.autor, () => {
        despachar({ t: 'digitando', conversa: crm.conversa, quem: null })
        despachar({ t: 'crmItem', conversa: crm.conversa, item: { tipo: 'mensagem', id: novoId('m'), hora: hora(), de: 'cliente', autor: r.autor, canal: 'whatsapp', texto: r.texto } as ItemConversa })
        despachar({ t: 'crmStatus', conversa: crm.conversa, status: 'em_atendimento' })
        const destino: Destino = { modulo: 'crm', aba: 'conversas', conversa: crm.conversa }
        const conversaCrm = conversasRef.current.find((x) => x.id === crm.conversa)
        notificar({ para: [], tipo: 'conversa', setor: t.setor, titulo: `${r.autor} respondeu`, detalhe: r.texto.slice(0, 80), destino }, vendoConversa(crm.conversa), r.texto, 'Responder', {
          tipo: 'contato',
          nome: r.autor,
          cliente: conversaCrm?.cliente ?? t.cliente,
          canal: 'whatsapp',
        })
        const prox = r.fluxo ? catalogoFluxos[r.fluxo] : undefined
        if (t.origem) {
          const conv = t.origem
          if (prox) assistenteFala(conv, `${r.autor} respondeu: “${r.texto}” Passei de volta ao ${nomeDoSetor(prox.setor)}.`, passagemNoAssistente(t.setor, prox), () => passarAdiante(t, prox))
          else {
            const c = conversasRef.current.find((x) => x.id === crm.conversa)
            assistenteFala(conv, `${r.autor} já respondeu: “${r.texto}”`, () => [
              { tipo: 'conversa_crm', id: novoId('cc'), conversa: crm.conversa, cliente: c?.cliente ?? t.cliente ?? '', pessoa: r.autor, canal: 'WhatsApp', status: 'aberta', ultima: r.texto },
            ])
          }
        } else if (prox) passarAdiante(t, prox)
      }))
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [toast],
  )
  const concluirTrabalho = useCallback(
    (t: Trabalho) => {
      const fim = t.fim
      despachar({ t: 'trabalhoFim', uid: t.uid })
      const cartoes: Cartao[] = [...(fim.cartoes ?? [])]
      let novaId: string | undefined
      if (fim.tarefaNova) {
        novaId = novoId('tk')
        cartoes.push({ tipo: 'tarefa', id: `c${novaId}`, tarefa: { ...fim.tarefaNova, id: novaId } })
      }
      // Ele escreve o resultado (pensando) antes de entregar; os efeitos vêm junto com a mensagem.
      falar(t.integrante, t.setor, fim.texto, cartoes.length ? cartoes : undefined, 1800, () => comoAtor(ctxIntegrante(t.integrante, t.setor), () => {
        if (novaId && fim.tarefaNova) despachar({ t: 'tarefaNova', tarefa: { ...fim.tarefaNova, id: novaId } })
        if (t.tarefaId && fim.tarefaStatus) despachar({ t: 'tarefa', id: t.tarefaId, patch: { status: fim.tarefaStatus, atrasada: fim.tarefaStatus === 'concluida' ? false : undefined } })
        if (fim.tarefaPorCodigo) {
          const alvo = tarefasRef.current.find((x) => x.codigo === fim.tarefaPorCodigo!.codigo && (!t.cliente || x.cliente === t.cliente))
          if (alvo) despachar({ t: 'tarefa', id: alvo.id, patch: { status: fim.tarefaPorCodigo.status, atrasada: false } })
        }
        const destino: Destino = { modulo: 'inicio', aba: 'time', integrante: t.integrante }
        // Quem está no chat do integrante (ou acompanhando o pedido no Assistente) já vê: sem toast.
        const olhando = vendoIntegrante(t.integrante) || (!!t.origem && vendoAssistente())
        const pedeVoce = cartoes.some((c) => c.tipo === 'aprovacao')
        if (fim.aviso)
          notificar({ para: [], tipo: 'sistema', setor: t.setor, titulo: fim.aviso, detalhe: t.cliente, destino }, olhando, t.silencioso ? undefined : fim.aviso, pedeVoce ? 'Decidir' : 'Ver no Time', {
            tipo: 'integrante',
            setor: t.setor,
            estado: pedeVoce ? 'precisa_de_voce' : 'concluido',
          })
        despachar({ t: 'evento', evento: { id: novoId('e'), quando: hora(), ator: t.integrante, texto: `Terminou: ${t.titulo}` } })
        if (fim.crm) depois(800, () => enviarAoCliente(t, fim.crm!))
        const proximos = (fim.depois ?? []).map((id) => catalogoFluxos[id]).filter(Boolean)
        if (!t.origem) {
          for (const f of proximos) depois(1200, () => passarAdiante(t, f))
          return
        }
        // Pedido do Assistente: o integrante devolve, o Assistente conta ao usuário e passa adiante ou fecha.
        const conv = t.origem
        depois(500, () => noAssistente(conv, { autor: { tipo: 'integrante', setor: t.setor }, cartoes: [{ tipo: 'retorno', id: novoId('rt'), de: t.setor, texto: fim.retorno ?? fim.texto }] }))
        if (proximos.length) {
          const f = proximos[0]
          const texto = fim.paraAssistente ?? `O ${nomeDoSetor(t.setor)} terminou: ${t.titulo.toLowerCase()}. Agora o ${nomeDoSetor(f.setor)} segue com ${f.titulo.toLowerCase()}.`
          depois(1300, () => assistenteFala(conv, texto, passagemNoAssistente(t.setor, f), () => passarAdiante(t, f)))
        } else if (fim.crm?.resposta?.fluxo) {
          depois(1300, () => assistenteFala(conv, `O ${nomeDoSetor(t.setor)} mandou a pergunta a ${fim.crm!.resposta!.autor} pelo WhatsApp. Quando a resposta chegar, o trabalho segue sozinho.`))
        } else {
          const final = finaisRef.current[conv]
          depois(1300, () => assistenteFala(conv, final?.texto ?? `Pronto: ${t.titulo}.`, () => final?.cartoes ?? fim.cartoes ?? []))
        }
      }))
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [toast, falar, enviarAoCliente],
  )
  const rodando = trabalhos.filter((t) => t.situacao === 'rodando')
  const chaveRodando = rodando.map((t) => t.uid).join(',')
  const rodandoRef = useRef(rodando)
  rodandoRef.current = rodando
  useEffect(() => {
    if (!chaveRodando) return
    const id = window.setInterval(() => {
      for (const t of rodandoRef.current) if (Date.now() - t.inicioEm >= duracaoTrabalho(t)) concluirTrabalho(t)
    }, 400)
    return () => window.clearInterval(id)
  }, [chaveRodando, concluirTrabalho])


  const valor = useMemo<Loja>(() => {
    const fichaDe = (id?: string) => (id ? ((tCliente.find((c) => c.id === id)?.extras?.ficha as FichaCliente | undefined) ?? (banco.escritorioId === 'esc-andrade' ? fichas[id] : undefined)) : undefined)
    return {
      estado,
      clientes,
      conversas,
      tarefas,
      conversasTime,
      toast,
      toastDesfazer: (texto, desfazer) =>
        toast(texto, undefined, undefined, undefined, {
          acao: {
            rotulo: 'Desfazer',
            executar: () => {
              try {
                desfazer()
              } catch (e) {
                toast(e instanceof Error ? e.message : String(e), undefined, undefined, undefined, { erro: true })
              }
            },
          },
        }),
      toastErro: (texto) => toast(texto, undefined, undefined, undefined, { erro: true }),
      fecharToast: (id) => despachar({ t: 'fecharToast', id }),
      avisar: (a) => despachar({ t: 'avisar', aviso: { ...a, id: novoId('av'), quando: hora(), lidoPor: [] } }),
      ler: (id, usuario) => despachar({ t: 'ler', id, usuario }),
      lerTodos: (usuario) => despachar({ t: 'lerTodos', usuario }),
      registrar: (ator, texto) => despachar({ t: 'evento', evento: { id: novoId('e'), quando: hora(), ator, texto } }),
      mensagemCrm: (conversa, item) => despachar({ t: 'crmItem', conversa, item: { ...item, id: novoId('m'), hora: hora() } as ItemConversa }),
      statusConversa: (conversa, status) => despachar({ t: 'crmStatus', conversa, status }),
      novaConversa: (c) => despachar({ t: 'crmNova', conversa: c }),
      salvarConversa: (c) => despachar({ t: 'crmSalvar', conversa: c }),
      atualizarTarefa: (id, patch) => despachar({ t: 'tarefa', id, patch }),
      criarTarefa: (t) => {
        const id = novoId('tk')
        despachar({ t: 'tarefaNova', tarefa: { ...t, id } })
        return id
      },
      mensagemTime: (integrante, msg) => despachar({ t: 'timeMsg', integrante, msg: { ...msg, id: novoId('mt'), hora: hora() } }),
      decidir: (cartao, decisao) => despachar({ t: 'decidir', cartao, decisao }),
      fichaDe,
      salvarFicha: (f) => despachar({ t: 'ficha', ficha: f }),
      emitirNota: (n) => despachar({ t: 'nota', nota: n }),
      cancelarNota: (clienteId, numero) => despachar({ t: 'cancelarNota', clienteId, numero }),
      notasDe: (clienteId) => {
        const daLoja = tNota.filter((n) => n.cliente_id === clienteId).map(notaParaTela)
        const base = emissorDe(clienteId).notas.filter((n) => !daLoja.some((x) => x.numero === n.numero))
        return [...daLoja, ...base].sort((a, b) => b.numero - a.numero)
      },
      documentos,
      adicionarDocumento: (d) => {
        const doc: Documento = { versao: 1, ...d, id: novoId('docn'), hash: Math.random().toString(16).slice(2, 14) }
        despachar({ t: 'documento', documento: doc })
        return doc
      },
      ajustarDocumento: (id, patch) => despachar({ t: 'documentoPatch', id, patch }),
      ligarBpo: (ligado) => despachar({ t: 'bpoModulo', ligado }),
      definirCenario: (cenario) => despachar({ t: 'cenario', cenario }),
      ligarCustoPorPacote: (ligado) => despachar({ t: 'custoPorPacote', ligado }),
      lembrar: (chave, inicial, valor) => despachar({ t: 'memoria', chave, inicial, valor }),
      iniciarTrabalho: (f, opcoes) => iniciarTrabalho(f, opcoes),
      definirVista,
      trabalhoDe: ({ integrante, tarefaId }) => estado.trabalhos.find((t) => t.situacao === 'rodando' && (integrante ? t.integrante === integrante : true) && (tarefaId ? t.tarefaId === tarefaId : true)),
      mensagemTimeComId: (integrante, msg) => despachar({ t: 'timeMsg', integrante, msg }),
      ajustarMensagemTime: (integrante, id, patch) => despachar({ t: 'timeMsgPatch', integrante, id, patch }),
      digitar: (conversa, quem) => despachar({ t: 'digitando', conversa, quem }),
      proporAlcada: (clienteId, p) => despachar({ t: 'alcadaProposta', clienteId, proposta: p && { ...p, quando: hora() } }),
      aceitarAlcada: (clienteId, quem) => {
        const p = estado.bpoAlcadaProposta[clienteId]
        if (!p) return
        const f = fichaDe(clienteId)
        if (f) despachar({ t: 'ficha', ficha: { ...f, contatos: f.contatos.map((c) => (p.pessoas[c.nome] !== undefined ? { ...c, alcadaPagamento: p.pessoas[c.nome] || undefined } : c)) } })
        despachar({ t: 'alcadaAceita', clienteId, alcadas: { faixa1: p.faixa1, faixa2: p.faixa2, janela: p.janela, aceitoPor: quem, alteradaPor: p.por } })
        despachar({ t: 'alcadaProposta', clienteId, proposta: null })
      },
      decidirLote: (id, acao) => {
        const lote = lotesBpo.find((l) => l.id === id)
        const atual: DecisaoLote = estado.bpoLotes[id] ?? { situacao: 'parcial', aprovacoes: [], removidos: [] }
        if (acao.tipo === 'recusar') return despachar({ t: 'bpoLote', id, decisao: { ...atual, situacao: 'recusado', motivo: acao.motivo, aprovacoes: [...atual.aprovacoes, { nome: acao.nome, quando: hora() }] } })
        if (acao.tipo === 'liberar') return despachar({ t: 'bpoLote', id, decisao: { ...atual, situacao: 'liberado' } })
        if (atual.aprovacoes.some((x) => x.nome === acao.nome)) return
        const aprovacoes = [...atual.aprovacoes, { nome: acao.nome, quando: hora() }]
        const removidos = acao.removidos ?? atual.removidos
        despachar({ t: 'bpoLote', id, decisao: { situacao: aprovacoes.length >= (lote?.aprovadoresNecessarios ?? 1) ? 'aprovado' : 'parcial', aprovacoes, removidos } })
      },
      ajustarContaBpo: (id, patch) => despachar({ t: 'bpoConta', id, patch }),
      reiniciar: () => void restaurar(),
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado, clientes, conversas, tarefas, conversasTime, documentos, tNota, tCliente, toast, despachar, restaurar])

  tarefasRef.current = valor.tarefas
  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>
}

/** Loja do escritório. Fora do provider (stories isoladas), devolve uma loja inerte com os dados de exemplo. */
export function useLoja(): Loja {
  const l = useContext(Ctx)
  if (l) return l
  const nada = () => {}
  return {
    estado: { toasts: [], avisos: [], eventos: [], decisoes: {}, bpoModulo: true, cenario: 'contabil_bpo', custoPorPacote: false, memoria: {}, trabalhos: [], digitando: {}, assistente: {}, bpoAlcadaProposta: {}, bpoAlcadas: {}, bpoLotes: {}, bpoContas: {} },
    clientes: exemplo.clientes,
    conversas: [],
    tarefas: exemplo.tarefas,
    conversasTime: exemplo.conversasPorIntegrante,
    toast: nada,
    toastDesfazer: nada,
    toastErro: nada,
    fecharToast: nada,
    avisar: nada,
    ler: nada,
    lerTodos: nada,
    registrar: nada,
    mensagemCrm: nada,
    statusConversa: nada,
    novaConversa: nada,
    salvarConversa: nada,
    atualizarTarefa: nada,
    criarTarefa: () => '',
    mensagemTime: nada,
    decidir: nada,
    fichaDe: (id) => (id ? fichas[id] : undefined),
    salvarFicha: nada,
    emitirNota: nada,
    cancelarNota: nada,
    notasDe: (id) => emissorDe(id).notas,
    documentos: [],
    adicionarDocumento: (d) => ({ versao: 1, ...d, id: 'x', hash: '' }) as Documento,
    ajustarDocumento: nada,
    ligarBpo: nada,
    definirCenario: nada,
    ligarCustoPorPacote: nada,
    lembrar: nada,
    iniciarTrabalho: nada,
    definirVista: nada,
    trabalhoDe: () => undefined,
    mensagemTimeComId: nada,
    ajustarMensagemTime: nada,
    digitar: nada,
    proporAlcada: nada,
    aceitarAlcada: nada,
    decidirLote: nada,
    ajustarContaBpo: nada,
    reiniciar: nada,
  }
}

/* ---------- Contas do escritório (Configurações › Usuários e a sessão) ---------- */

/** As contas do escritório no formato das telas (usuário + vínculos + exceções + carteira). */
export function useContas(): UsuarioCfg[] {
  const usuarios = useTabela('usuario')
  const vinculos = useTabela('vinculo_setor')
  const excecoes = useTabela('excecao_tela')
  const carteira = useTabela('carteira_cliente')
  return useMemo(() => usuarios.map((u) => contaParaTela(u, vinculos, excecoes, carteira)), [usuarios, vinculos, excecoes, carteira])
}

/**
 * Grava a lista de contas editada na tela: cria ou atualiza o usuário, troca
 * os vínculos e as exceções (cada exceção removida vira evento) e a carteira.
 */
export function salvarContas(lista: UsuarioCfg[]) {
  const ctx = contextoAtual()
  for (const u of lista) {
    const novo = contaParaModelo(u)
    const antes = banco.obter('usuario', u.id)
    const igual = antes && JSON.stringify(contaParaTela(antes, banco.ler('vinculo_setor'), banco.ler('excecao_tela'), banco.ler('carteira_cliente'))) === JSON.stringify(u)
    if (igual) continue
    if (!antes) {
      if (!banco.obter('pessoa', novo.pessoa.id)) repos.pessoas.criar(novo.pessoa, { ctx })
      repos.usuarios.criar(novo.usuario, { ctx, texto: `Criou a conta de ${u.nome}` })
    } else {
      const { preferencias: _p, ...semPreferencias } = novo.usuario
      void _p
      repos.usuarios.atualizar(u.id, { ...semPreferencias, pessoa_id: antes.pessoa_id }, { ctx, texto: `Atualizou a conta de ${u.nome}` })
    }
    const vinculosAntes = banco.ler('vinculo_setor').filter((v) => v.usuario_id === u.id)
    for (const v of vinculosAntes) if (!novo.vinculos.some((n) => n.setor_id === v.setor_id && n.modo === v.modo)) repos.vinculos.excluir(v.id, { ctx, texto: `Tirou ${v.setor_id} de ${u.nome}` })
    for (const v of novo.vinculos) if (!vinculosAntes.some((a) => a.setor_id === v.setor_id && a.modo === v.modo)) repos.vinculos.criar({ ...v, id: `${v.id}-${Date.now().toString(36)}` }, { ctx, texto: `Deu ${v.setor_id} (${v.modo}) a ${u.nome}` })
    const excecoesAntes = banco.ler('excecao_tela').filter((x) => x.usuario_id === u.id)
    for (const x of excecoesAntes) if (!novo.excecoes.some((n) => n.id === x.id)) repos.excecoes.excluir(x.id, { ctx, texto: `Removeu a exceção ${x.tela_ou_ferramenta} de ${u.nome}` })
    for (const x of novo.excecoes) {
      const a = banco.obter('excecao_tela', x.id)
      if (!a) repos.excecoes.criar(x, { ctx, texto: `${x.efeito === 'liberar' ? 'Liberou' : 'Bloqueou'} ${x.tela_ou_ferramenta} para ${u.nome}: ${x.motivo}` })
      else if (JSON.stringify({ ...a, ...x }) !== JSON.stringify(a)) repos.excecoes.atualizar(x.id, x, { ctx })
    }
    const carteiraAntes = banco.ler('carteira_cliente').filter((c) => c.usuario_id === u.id)
    for (const c of carteiraAntes) if (!u.carteira.includes(c.cliente_id)) repos.carteiras.excluir(c.id, { ctx })
    for (const c of novo.carteira) if (!carteiraAntes.some((a) => a.cliente_id === c.cliente_id)) repos.carteiras.criar(c, { ctx })
  }
}

/* ---------- Navegação entre módulos ---------- */

interface Navegacao {
  irPara: (d: Destino) => void
  /** Vitrine (o site): só o Início existe; cartões e cabeçalhos escondem o que levaria para fora. */
  vitrine?: boolean | 'leitura'
}

const NavCtx = createContext<Navegacao>({ irPara: () => {} })
export const NavegacaoProvider = NavCtx.Provider
export const useNavegacao = () => useContext(NavCtx)

/** Usa a loja de fora quando existe; senão cria uma (stories da Plataforma). */
export function LojaOpcional({ children }: { children: ReactNode }) {
  const l = useContext(Ctx)
  return l ? <>{children}</> : <LojaProvider>{children}</LojaProvider>
}

/**
 * useState que sobrevive à troca de aba e ao recarregar a página: o valor fica
 * no banco do escritório (tabela `registro_tela`), não no componente. Sair e
 * voltar da tela, ou abrir outra que leia a mesma chave, mostra o que foi
 * feito. "Restaurar demonstração" limpa.
 */
export function usePersistente<T>(chave: string, inicial: T | (() => T)): [T, (v: T | ((x: T) => T)) => void] {
  const l = useContext(Ctx)
  const [local, setLocal] = useState(inicial)
  const base = useRef<T | null>(null)
  if (base.current === null) base.current = typeof inicial === 'function' ? (inicial as () => T)() : inicial
  if (!l) return [local, setLocal]
  const valor = (chave in l.estado.memoria ? l.estado.memoria[chave] : base.current) as T
  return [valor, (v) => l.lembrar(chave, base.current, v)]
}

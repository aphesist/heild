import { registrarExecutor, type ContextoExecucao } from '@/ambiente/agente-s02'
import { integranteDoSetor } from '@/ambiente/fluxos'
import type { useLoja } from '@/ambiente/loja'
import { banco } from '@/nucleo/banco'
import { agoraCurto, estadoNotas, mudarNotas, type EstadoNotas } from '@/dados/s02/notas'

type Loja = ReturnType<typeof useLoja>

/** Nome do cliente pelo id (banco do escritório ativo). */
export const nomeCliente = (clienteId: string) => banco.ler('cliente').find((c) => c.id === clienteId)?.nome ?? clienteId

/** Acha (ou abre) a conversa do cliente no setor (Notas responde pela conversa do Fiscal quando não há a dela). */
export function conversaDoCliente(loja: Loja, clienteId: string, setor: 'notas' | 'fiscal' = 'notas'): string {
  const nome = nomeCliente(clienteId)
  const fixa = loja.fichaDe(clienteId)?.conversas[setor] ?? loja.fichaDe(clienteId)?.conversas.fiscal
  if (fixa) return fixa
  const existente = loja.conversas.find((x) => x.cliente === nome && (x.setor === setor || x.setor === 'fiscal'))
  if (existente) return existente.id
  const contato = loja.fichaDe(clienteId)?.contatos.find((c) => c.assuntos.includes('documentos_pendentes') || c.assuntos.includes('guias')) ?? loja.fichaDe(clienteId)?.contatos[0]
  const id = `cvn-${clienteId}-${setor}`
  loja.novaConversa({
    id,
    clienteId,
    cliente: nome,
    pessoa: { nome: contato?.nome ?? 'Contato', papel: contato?.papel ?? 'contato', contato: contato?.whatsapp ?? contato?.email ?? 'app' },
    setor,
    status: 'aguardando_cliente',
    canal: contato?.whatsapp ? 'whatsapp' : contato?.app ? 'app' : 'email',
    prazoMin: null,
    prazoTexto: 'aguardando cliente',
    etiquetas: [],
    previa: '',
    janelaAberta: false,
    itens: [{ tipo: 'dia', texto: 'Hoje' }],
  })
  return id
}

/** Primeiro nome do contato que recebe documentos. */
export const contatoDocs = (loja: Loja, clienteId: string) => loja.fichaDe(clienteId)?.contatos.find((c) => c.assuntos.includes('documentos_pendentes') || c.assuntos.includes('guias'))?.nome ?? loja.fichaDe(clienteId)?.contatos[0]?.nome ?? 'cliente'

/** Resultado de uma rodada de captura (aplicado quando o integrante termina). */
export function aplicarCaptura(clienteId: string, novos: number, origem: 'forçada' | 'rotina 03:00' | 'lote' | 'retroativa', por: string): EstadoNotas {
  return mudarNotas(
    clienteId,
    (e) => {
      const nsu = e.captura.nsu + novos
      const fluxos = e.fluxos.map((f, i) => {
        const parte = i === 0 ? Math.ceil(novos * 0.6) : i === 1 ? Math.floor(novos * 0.4) : 0
        return { ...f, qtd: f.qtd + parte, paridade: f.paridade + parte }
      })
      return { ...e, fluxos, captura: { situacao: e.captura.situacao === 'atencao' ? 'atencao' : 'ok', ultima: agoraCurto(), nsu, motivo: e.captura.situacao === 'atencao' ? e.captura.motivo : undefined }, rodadas: [{ quando: agoraCurto(), novos, nsu, origem, por }, ...e.rodadas].slice(0, 8) }
    },
    `Captura ${origem} (${nomeCliente(clienteId)}): ${novos} documentos novos, NSU ${(estadoNotas(clienteId).captura.nsu + novos).toLocaleString('pt-BR')} (NFE-004)`,
  )
}

/* ---------- Executores dos cartões do Notas (o que aprovar faz) ---------- */

const msgCliente = (ctx: ContextoExecucao, clienteId: string, texto: string) => {
  const cv = conversaDoCliente(ctx.loja, clienteId)
  ctx.loja.mensagemCrm(cv, { tipo: 'mensagem', de: 'integrante', autor: 'Notas', setor: 'notas', canal: 'whatsapp', texto, entrega: 'enviada' })
  return cv
}

registrarExecutor('notas.orientar_autxml', (a, ctx) => {
  const id = String(a.clienteId)
  const cv = msgCliente(ctx, id, String(a.texto))
  mudarNotas(id, (e) => ({ ...e, perfil: { ...e.perfil, autxml: 'orientado' } }), `${ctx.quem} aprovou a orientação de autXML ao cliente (NFE-002)`)
  ctx.loja.toast('Orientação de autXML enviada ao cliente.', { modulo: 'crm', aba: 'conversas', conversa: cv }, 'Ver a conversa')
})

registrarExecutor('notas.manifestar', (a, ctx) => {
  const id = String(a.clienteId)
  const evento = String(a.evento) as 'confirmada' | 'desconhecida' | 'nao_realizada'
  const rotulo = { confirmada: 'Confirmação da operação', desconhecida: 'Desconhecimento da operação', nao_realizada: 'Operação não realizada' }[evento]
  mudarNotas(id, (e) => ({ ...e, resumos: e.resumos.map((r) => (r.id === a.resumoId ? { ...r, situacao: evento, cartao: undefined } : r)) }), `${rotulo} registrada na SEFAZ para ${String(a.nota)} (NFE-015/016), aprovada por ${ctx.quem}`)
  ctx.loja.toast(`${rotulo} transmitida: ${String(a.nota)}. Protocolo guardado na nota.`)
})

registrarExecutor('notas.ajustar_cancelada', (a, ctx) => {
  const id = String(a.clienteId)
  mudarNotas(
    id,
    (e) => ({ ...e, eventos: e.eventos.map((x) => (x.id === a.eventoId ? { ...x, situacao: 'ajustado' } : x)), lotes: [...e.lotes, { id: `lt-aj-${Date.now()}`, lote: `${e.competencia} · ajuste de canceladas`, situacao: 'enviado ao core', erros: 0 }] }),
    `${String(a.nota)}: estorno da escrituração enviado ao core (NFE-018), aprovado por ${ctx.quem}`,
  )
  ctx.loja.toast(`Ajuste enviado ao core: ${String(a.nota)} sai da escrituração de ${estadoNotas(id).competencia}.`)
})

registrarExecutor('notas.contestar_cte', (a, ctx) => {
  const id = String(a.clienteId)
  mudarNotas(id, (e) => ({ ...e, eventos: e.eventos.map((x) => (x.id === a.eventoId ? { ...x, situacao: 'contestado' } : x)) }), `Evento de desacordo registrado para ${String(a.nota)} (NFE-019), aprovado por ${ctx.quem}`)
  ctx.loja.toast(`Desacordo do ${String(a.nota)} registrado na SEFAZ.`)
})

registrarExecutor('notas.encerrar_captura', (a, ctx) => {
  const id = String(a.clienteId)
  mudarNotas(id, (e) => ({ ...e, entrada: { ...e.entrada, encerramento: 'encerrada' }, captura: { ...e.captura, situacao: 'parada', motivo: 'captura encerrada (saída do cliente)' } }), `Captura de ${nomeCliente(id)} encerrada; pacote final de guarda gerado (NFE-106), aprovado por ${ctx.quem}`)
  ctx.loja.toast('Captura encerrada. O pacote final de guarda ficou na pasta do cliente.')
})

registrarExecutor('notas.emitir_rascunho', (a, ctx) => {
  // Aprovar o rascunho manda ao cliente pedir o "pode emitir" (GES-036); a emissão continua sendo da pessoa.
  const id = String(a.clienteId)
  const cv = msgCliente(ctx, id, `Preparamos a nota para ${String(a.tomador)} (${String(a.valor)}). Confere os dados e responde "pode emitir" para seguirmos.`)
  mudarNotas(id, (e) => ({ ...e, emissoes: e.emissoes.map((n) => (n.id === a.emissaoId ? { ...n, situacao: 'aguardando_cliente' } : n)) }), `Rascunho da nota para ${String(a.tomador)} enviado ao cliente para conferir (NFE-039), aprovado por ${ctx.quem}`)
  ctx.loja.toast('Rascunho enviado ao cliente. Quando ele disser "pode emitir", a emissão fica com você.', { modulo: 'crm', aba: 'conversas', conversa: cv }, 'Ver a conversa')
  // Demonstração: o cliente responde em instantes.
  setTimeout(() => {
    ctx.loja.mensagemCrm(cv, { tipo: 'mensagem', de: 'cliente', autor: contatoDocs(ctx.loja, id), canal: 'whatsapp', texto: 'Conferi, pode emitir.' })
    mudarNotas(id, (e) => ({ ...e, emissoes: e.emissoes.map((n) => (n.id === a.emissaoId ? { ...n, situacao: 'aprovada_cliente' } : n)) }), `Cliente respondeu "pode emitir" para a nota de ${String(a.tomador)} (prova guardada, GES-036)`)
    ctx.loja.mensagemTime(integranteDoSetor('notas'), { autor: { tipo: 'integrante', setor: 'notas' }, texto: `O cliente aprovou a nota para ${String(a.tomador)}. Guardei a mensagem como prova; a emissão está com você em Painel › Notas.` })
  }, 4000)
})

// S03: cartões de aprovação das abas Fiscal, Contábil e Consultoria e o que cada um faz ao ser decidido.
import { GraduationCapIcon } from '@phosphor-icons/react'
import { integranteDoSetor } from '@/ambiente/fluxos'
import { useLoja } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import { CartaoChat } from '@/components/compostos/cartoes-chat'
import { brl, COMPETENCIA, ddmm, HOJE, somarDias } from '@/dados/painel-s03'
import type { Cartao } from '@/dados/tipos'
import { servicos } from '@/servicos'
import type { SetorIntegrante } from '@/theme/tipos'
import {
  CHAVE_APRENDIZADO,
  chaveConsultoria,
  chaveContabil,
  chaveFiscal,
  consultoriaVazio,
  contabilVazio,
  fiscalVazio,
  gravarEstado,
  hojeCurto,
  type EstadoConsultoria,
  type EstadoContabil,
  type EstadoFiscal,
} from './estado'

/**
 * O integrante prepara; uma pessoa decide (01, 6.4). Cada cartão da S03 tem id
 * `s03-...` e guarda em `s03:cartao:<id>` o que fazer ao ser aprovado. O
 * cartão é um registro só: decidir no chat do integrante, no sino, na Visão
 * geral ou aqui na aba dá no mesmo (`efeitos.tsx` chama `useEfeitosS03`).
 */

export type AcaoS03 =
  | 'fiscal.caixa.abrir'
  | 'fiscal.transmitir'
  | 'fiscal.lote'
  | 'fiscal.guia.enviar'
  | 'fiscal.guia.cobrar'
  | 'fiscal.intimacao.responder'
  | 'fiscal.resumo.enviar'
  | 'contabil.core.enviar'
  | 'contabil.reabrir'
  | 'contabil.perguntar'
  | 'contabil.relatorio.enviar'
  | 'contabil.declaracao.enviar'
  | 'contabil.cobrar'
  | 'consultoria.parecer.enviar'
  | 'consultoria.estudo.enviar'

export interface PayloadS03 {
  acao: AcaoS03
  clienteId?: string
  cliente?: string
  setor: SetorIntegrante
  /** Chave da ação na tela (fica em `pendentes` até a decisão). */
  chave?: string
  dados: Record<string, unknown>
  cartao: Extract<Cartao, { tipo: 'aprovacao' }>
}

export const chaveCartao = (id: string) => `s03:cartao:${id}`

/** Nunca promovíveis (B3): transmitir, pagar, assinar, alterar regime. */
const naoPromoviveis: AcaoS03[] = ['fiscal.transmitir', 'fiscal.lote', 'fiscal.caixa.abrir', 'contabil.reabrir']

/** Posta um cartão de aprovação no chat do integrante do setor e avisa no sino. */
export function usePostarS03() {
  const loja = useLoja()
  const { usuario } = useSessao()
  return (p: {
    setor: SetorIntegrante
    acao: AcaoS03
    cliente?: { id: string; nome: string }
    chave?: string
    texto: string
    resumo: string
    argumentos?: { rotulo: string; valor: string }[]
    expira?: string
    lote?: number
    dados?: Record<string, unknown>
  }) => {
    const id = `s03-${p.acao.replace(/\./g, '-')}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`
    const cartao: PayloadS03['cartao'] = { tipo: 'aprovacao', id, resumo: p.resumo, argumentos: [...(p.argumentos ?? []), { rotulo: 'Pedido por', valor: usuario.nome }], expiraEm: p.expira ?? 'expira em 24 h', lote: p.lote }
    const payload: PayloadS03 = { acao: p.acao, clienteId: p.cliente?.id, cliente: p.cliente?.nome, setor: p.setor, chave: p.chave, dados: p.dados ?? {}, cartao }
    loja.lembrar(chaveCartao(id), null, payload)
    const integrante = integranteDoSetor(p.setor)
    loja.mensagemTime(integrante, { autor: { tipo: 'integrante', setor: p.setor }, texto: p.texto, cartoes: [cartao] })
    loja.avisar({ para: [], tipo: 'cartao', setor: p.setor, titulo: p.resumo, detalhe: p.cliente?.nome ?? 'carteira', destino: { modulo: 'inicio', aba: 'time', integrante } })
    loja.registrar(usuario.nome, `Pediu “${p.resumo}”; aguardando aprovação`)
    if (p.chave && p.cliente) {
      const k = p.setor === 'fiscal' ? chaveFiscal(p.cliente.id) : p.setor === 'contabil' ? chaveContabil(p.cliente.id) : chaveConsultoria(p.cliente.id)
      const vazio = p.setor === 'fiscal' ? fiscalVazio : p.setor === 'contabil' ? contabilVazio : consultoriaVazio
      gravarEstado<{ pendentes: Record<string, string> }>(loja, k, vazio as () => { pendentes: Record<string, string> }, (x) => ({ ...x, pendentes: { ...x.pendentes, [p.chave!]: id } }))
    }
    loja.toast('O integrante preparou e pediu aprovação. Dá para decidir aqui, no chat dele ou no sino.', { modulo: 'inicio', aba: 'time', integrante }, 'Abrir no Time', { tipo: 'integrante', setor: p.setor, estado: 'trabalhando' })
    return id
  }
}

/** Cartão pendente mostrado dentro do widget (o mesmo registro do chat). */
export function CartaoPendente({ id, className }: { id?: string; className?: string }) {
  const loja = useLoja()
  if (!id) return null
  const p = loja.estado.memoria[chaveCartao(id)] as PayloadS03 | undefined
  if (!p) return null
  return (
    <div className={className}>
      <CartaoChat cartao={p.cartao} />
    </div>
  )
}

/** Quantos cartões deste tipo já foram decididos (o integrante aprende; 02, 3.3). */
export function Aprendizado({ acao }: { acao: AcaoS03 }) {
  const loja = useLoja()
  const a = (loja.estado.memoria[CHAVE_APRENDIZADO] as Record<string, { aprovados: number; editados: number; recusados: number }> | undefined)?.[acao]
  const total = a ? a.aprovados + a.editados + a.recusados : 0
  if (naoPromoviveis.includes(acao))
    return (
      <p className="text-muted-foreground flex items-center gap-1 text-xs">
        <GraduationCapIcon className="size-3.5" /> Sempre com aprovação de uma pessoa (nunca promovível).
      </p>
    )
  const semEdicao = total ? Math.round((a!.aprovados / total) * 100) : 0
  return (
    <p className="text-muted-foreground flex items-center gap-1 text-xs">
      <GraduationCapIcon className="size-3.5" />
      {total < 30 ? `${total} de 30 decisões para o integrante poder pedir para fazer sozinho` : semEdicao >= 95 ? `${total} decisões, ${semEdicao}% sem edição: o integrante vai perguntar ao Administrador se pode fazer sozinho` : `${total} decisões, ${semEdicao}% sem edição (precisa de 95%)`}
    </p>
  )
}

/** Acha (ou abre) a conversa do cliente no setor, pelo id real do cliente. */
export function useConversaS03() {
  const loja = useLoja()
  return (cliente: { id?: string; nome: string }, setor: SetorIntegrante) => {
    const ficha = loja.fichaDe(cliente.id)
    const fixa = ficha?.conversas[setor]
    if (fixa && loja.conversas.some((c) => c.id === fixa)) return fixa
    const existente = loja.conversas.find((x) => x.cliente === cliente.nome && x.setor === setor)
    if (existente) return existente.id
    const assunto = setor === 'fiscal' ? 'guias' : setor === 'contabil' ? 'documentos_pendentes' : 'comunicados'
    const contato = ficha?.contatos.find((x) => x.assuntos.includes(assunto)) ?? ficha?.contatos[0]
    const id = `cvs03-${cliente.id ?? 'x'}-${setor}`
    loja.novaConversa({
      id,
      clienteId: cliente.id,
      cliente: cliente.nome,
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
}

/** O que cada cartão da S03 faz quando uma pessoa decide. Devolve `true` se o cartão era da S03. */
export function useEfeitosS03() {
  const loja = useLoja()
  const { usuario } = useSessao()
  const conversa = useConversaS03()

  return (id: string, decisao: string): boolean => {
    if (!id.startsWith('s03-')) return false
    const p = loja.estado.memoria[chaveCartao(id)] as PayloadS03 | undefined
    const aprovou = decisao !== 'recusar'
    const editado = decisao === 'editar_e_aprovar'
    const quem = usuario.nome
    // O integrante aprende com a decisão (02, 3.3).
    if (p)
      loja.lembrar(CHAVE_APRENDIZADO, {}, (x: Record<string, { aprovados: number; editados: number; recusados: number }>) => {
        const a = x?.[p.acao] ?? { aprovados: 0, editados: 0, recusados: 0 }
        return { ...x, [p.acao]: { aprovados: a.aprovados + (aprovou && !editado ? 1 : 0), editados: a.editados + (editado ? 1 : 0), recusados: a.recusados + (aprovou ? 0 : 1) } }
      })
    if (!p) {
      loja.registrar(quem, `${aprovou ? 'Aprovou' : 'Recusou'} o cartão ${id}`)
      return true
    }
    const cli = p.clienteId ? { id: p.clienteId, nome: p.cliente ?? '' } : undefined
    const fiscal = (f: (x: EstadoFiscal) => EstadoFiscal) => cli && gravarEstado(loja, chaveFiscal(cli.id), fiscalVazio, f)
    const contabil = (f: (x: EstadoContabil) => EstadoContabil) => cli && gravarEstado(loja, chaveContabil(cli.id), contabilVazio, f)
    const consult = (f: (x: EstadoConsultoria) => EstadoConsultoria) => cli && gravarEstado(loja, chaveConsultoria(cli.id), consultoriaVazio, f)
    const soltar = <T extends { pendentes: Record<string, string> }>(x: T): T => {
      if (!p.chave) return x
      const { [p.chave]: _fora, ...resto } = x.pendentes
      return { ...x, pendentes: resto }
    }
    const tirarPendente = () => (p.setor === 'fiscal' ? fiscal(soltar) : p.setor === 'contabil' ? contabil(soltar) : consult(soltar))
    tirarPendente()
    const sufixo = editado ? ' (com edição)' : ''
    if (!aprovou) {
      loja.registrar(quem, `Recusou: ${p.cartao.resumo}`)
      loja.toast('Recusado. Nada saiu; o integrante guarda a recusa e a tarefa volta para uma pessoa.')
      return true
    }
    const d = p.dados as Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
    const mandar = (texto: string, setor: SetorIntegrante, anexo?: string) => {
      if (!cli) return undefined
      const cv = conversa(cli, setor)
      loja.mensagemCrm(cv, { tipo: 'mensagem', de: 'integrante', autor: setor === 'consultor' ? 'Consultor' : setor === 'contabil' ? 'Contábil' : 'Fiscal', setor, canal: 'whatsapp', texto, entrega: 'enviada', anexos: anexo ? [{ nome: anexo, tipo: 'pdf' }] : undefined })
      return cv
    }
    const documento = (nome: string, pasta: string[], tipo: Parameters<typeof loja.adicionarDocumento>[0]['tipo'], visivel = true) =>
      cli && loja.adicionarDocumento({ nome, clienteId: cli.id, pasta, tipo, competencia: COMPETENCIA, origem: 'gerado_plataforma', conector: 'a1', tamanho: '180 KB', quando: 'hoje', por: `${quem} (aprovou)`, forcarVisivel: visivel, entregas: visivel ? [{ quem: 'app do cliente', acao: 'enviado', quando: hojeCurto() }] : undefined })

    switch (p.acao) {
      case 'fiscal.caixa.abrir': {
        fiscal((x) => ({ ...x, abertas: { ...x.abertas, [d.msgId]: HOJE } }))
        const prazo = d.prazoResposta ? ddmm(somarDias(HOJE, d.prazoResposta)) : ddmm(somarDias(HOJE, 10))
        const t = loja.criarTarefa({ codigo: d.classificacao === 'intimação' ? 'FIS-038' : 'FIS-005', titulo: `Tratar mensagem ${d.orgao}: ${d.assunto}`, cliente: p.cliente ?? '', setor: 'fiscal', prazo, status: 'a_fazer', responsavel: { tipo: 'integrante', nome: 'Fiscal' } })
        loja.registrar(quem, `Aprovou${sufixo} abrir a mensagem “${d.assunto}” (${d.orgao}) · ciência em ${ddmm(HOJE)} · ${p.cliente}`)
        loja.toast(`Mensagem aberta: ciência hoje. Prazo de resposta ${prazo}; a tarefa já está com o Fiscal.`, { modulo: 'painel', aba: 'fiscal', tarefa: t }, 'Abrir a tarefa')
        return true
      }
      case 'fiscal.transmitir': {
        const decl = d.nome as string
        const tx = decl === 'EFD-Reinf' ? servicos.reinf.fechar({ documento: d.documento ?? '', competencia: d.competencia }).then((r) => ({ ...r, dados: { recibo: r.dados.recibo, protocolo: r.dados.protocolo } })) : servicos.integraContador.transmitir({ cnpj: d.documento ?? '', declaracao: (['PGDAS-D', 'DCTFWeb', 'DEFIS'].includes(decl) ? decl : 'DCTFWeb') as 'PGDAS-D', competencia: d.competencia, valor: d.valor })
        loja.toast(`Transmitindo ${decl} ${d.competencia} de ${p.cliente}…`)
        tx.then((r) => {
          fiscal((x) => {
            const { [d.declId]: _f, ...falhas } = x.falhas
            return { ...x, falhas, transmitidas: { ...x.transmitidas, [d.declId]: { recibo: r.dados.recibo, protocolo: r.dados.protocolo, quando: hojeCurto(), por: quem } } }
          })
          documento(`Recibo ${decl} ${d.competencia.replace('/', '-')}.pdf`, ['Fiscal', 'Recibos'], 'recibo', false)
          const ob = loja.tarefas.find((t) => t.cliente === p.cliente && t.status !== 'concluida' && t.status !== 'cancelada' && (t.codigo === d.atividade || t.titulo.includes(decl)))
          if (ob) loja.atualizarTarefa(ob.id, { status: 'concluida', cartaoPendente: false })
          loja.registrar(quem, `Aprovou${sufixo} a transmissão do ${decl} ${d.competencia} · ${p.cliente} · recibo ${r.dados.recibo} (${r.fonte}, demonstração)`)
          loja.avisar({ para: [usuario.id], tipo: 'sistema', setor: 'fiscal', titulo: `${decl} transmitido`, detalhe: `${p.cliente} · recibo ${r.dados.recibo}`, destino: { modulo: 'painel', aba: 'fiscal', cliente: cli?.id } })
          loja.toast(`${decl} de ${p.cliente} transmitido. Recibo ${r.dados.recibo} guardado; a obrigação foi baixada.`, { modulo: 'painel', aba: 'fiscal', cliente: cli?.id }, 'Ver na aba Fiscal')
        }).catch((e: Error) => {
          fiscal((x) => ({ ...x, falhas: { ...x.falhas, [d.declId]: e.message } }))
          loja.toastErro(`${decl} de ${p.cliente} não foi transmitido: ${e.message}`)
        })
        return true
      }
      case 'fiscal.lote': {
        const itens = (d.itens as { id: string; nome: string; declId: string; valor: number }[]) ?? []
        const removidos = new Set<string>()
        itens.forEach((it, i) => {
          if (removidos.has(it.id)) return
          gravarEstado(loja, chaveFiscal(it.id), fiscalVazio, (x) => ({ ...x, transmitidas: { ...x.transmitidas, [it.declId]: { recibo: `10${String(2026 + i).slice(-2)}${String(1000 + i * 37)}`, protocolo: `${Date.now()}`.slice(-10), quando: hojeCurto(), por: quem } } }))
          const ob = loja.tarefas.find((t) => t.cliente === it.nome && t.codigo === 'FIS-009' && t.status !== 'concluida')
          if (ob) loja.atualizarTarefa(ob.id, { status: 'concluida', cartaoPendente: false })
        })
        loja.lembrar('s03:fiscal:carteira', {}, (x: Record<string, unknown>) => ({ ...(x ?? {}), loteTransmitido: hojeCurto() }))
        loja.registrar(quem, `Aprovou${sufixo} a transmissão do PGDAS-D 10/2026 em lote: ${itens.length} clientes (FIS-009)`)
        loja.avisar({ para: [usuario.id], tipo: 'sistema', setor: 'fiscal', titulo: `${itens.length} PGDAS-D transmitidos`, detalhe: 'os DAS saem pela régua de cada cliente; recibos na pasta de cada um', destino: { modulo: 'painel', aba: 'fiscal', cliente: null } })
        loja.toast(`${itens.length} PGDAS-D transmitidos. Os DAS saem pela régua de cada cliente.`)
        return true
      }
      case 'fiscal.guia.enviar': {
        const ids = d.guias as string[]
        fiscal((x) => ({ ...x, guias: { ...x.guias, ...Object.fromEntries(ids.map((g) => [g, { ...x.guias[g], enviada: true }])) } }))
        const nomes = (d.nomes as string[]) ?? []
        nomes.forEach((n) => documento(n, ['Entregáveis', 'Fiscal'], 'guia'))
        const cv = mandar(`Oi! Seguem ${nomes.length === 1 ? 'a guia' : `as ${nomes.length} guias`} de ${d.competencia}: ${d.lista}. Qualquer dúvida, é só chamar. Quando pagar, toque em “Recebi e paguei” no app.`, 'fiscal', nomes[0])
        loja.registrar(quem, `Aprovou${sufixo} o envio de ${nomes.length} guia(s) a ${p.cliente} (FIS-031)`)
        loja.toast(`Guias enviadas a ${p.cliente}. O registro de entrega mostra quando abrirem.`, cv ? { modulo: 'crm', aba: 'conversas', conversa: cv } : undefined, 'Ver a conversa')
        return true
      }
      case 'fiscal.guia.cobrar': {
        const g = d.guiaId as string
        let vezes = 1
        fiscal((x) => {
          vezes = (x.guias[g]?.cobrancas ?? (d.cobrancas as number) ?? 0) + 1
          return { ...x, guias: { ...x.guias, [g]: { ...x.guias[g], cobrancas: vezes } } }
        })
        const cv = mandar(`Oi! Lembrete da régua “Guia a pagar”: ${d.tributo} de ${brl(d.valor)} ${d.vencida ? 'venceu' : 'vence'} em ${ddmm(d.vencimento)}. Se já pagou, me manda o comprovante por aqui.`, 'fiscal')
        if (vezes >= 3) loja.avisar({ para: [], tipo: 'prazo', setor: 'fiscal', titulo: `3ª cobrança sem pagamento: ${d.tributo}`, detalhe: `${p.cliente}: a régua avisa o dono da carteira`, destino: { modulo: 'painel', aba: 'fiscal', cliente: cli?.id } })
        loja.registrar(quem, `Aprovou${sufixo} a cobrança da guia ${d.tributo} (${vezes}ª) · ${p.cliente} (FIS-032)`)
        loja.toast(`Cobrança enviada (${vezes}ª).${vezes >= 3 ? ' O dono da carteira foi avisado.' : ''}`, cv ? { modulo: 'crm', aba: 'conversas', conversa: cv } : undefined, 'Ver a conversa')
        return true
      }
      case 'fiscal.intimacao.responder': {
        fiscal((x) => ({ ...x, intimacoes: { ...x.intimacoes, [d.intimacaoId]: 'enviada' } }))
        documento(`Resposta ${d.numero}.pdf`, ['Fiscal', 'Fiscalização'], 'intimacao', false)
        loja.registrar(quem, `Aprovou${sufixo} a resposta à ${d.numero} (${d.orgao}) · ${p.cliente} (FIS-040)`)
        loja.toast(`Resposta à ${d.numero} protocolada (demonstração). O prazo para de contar.`)
        return true
      }
      case 'fiscal.resumo.enviar': {
        fiscal((x) => ({ ...x, resumo: 'enviado' }))
        const cv = mandar(String(d.texto), 'fiscal')
        loja.registrar(quem, `Aprovou${sufixo} o resumo fiscal de ${COMPETENCIA} · ${p.cliente} (FIS-033)`)
        loja.toast('Resumo do mês enviado ao cliente.', cv ? { modulo: 'crm', aba: 'conversas', conversa: cv } : undefined, 'Ver a conversa')
        return true
      }
      case 'contabil.core.enviar': {
        loja.toast(`Enviando o lote de ${p.cliente} ao core…`)
        servicos.coreContabil
          .enviarLote({ cliente: p.cliente ?? '', competencia: COMPETENCIA, lancamentos: d.lancamentos, sistema: d.sistema ?? 'Alterdata' })
          .then((r) => {
            contabil((x) => ({ ...x, etapa: 'core', core: { lote: r.dados.lote, aceitos: r.dados.aceitos, rejeitados: r.dados.rejeitados.length, quando: hojeCurto() }, reaberta: undefined }))
            loja.registrar(quem, `Aprovou${sufixo} o lote ${r.dados.lote} ao core · ${p.cliente}: ${r.dados.aceitos} aceitos, ${r.dados.rejeitados.length} rejeitados (CTB-047, demonstração)`)
            loja.toast(`Lote ${r.dados.lote} no core: ${r.dados.aceitos} aceitos${r.dados.rejeitados.length ? `, ${r.dados.rejeitados.length} rejeitado (${r.dados.rejeitados[0].motivo})` : ''}.`)
          })
          .catch((e: Error) => loja.toastErro(`O core não recebeu o lote: ${e.message}`))
        return true
      }
      case 'contabil.reabrir': {
        contabil((x) => ({ ...x, etapa: 'classificacao', core: undefined, reaberta: { motivo: d.motivo, por: quem, quando: hojeCurto() } }))
        loja.registrar(quem, `Aprovou${sufixo} reabrir ${COMPETENCIA} de ${p.cliente}: ${d.motivo} (CTB-025)`)
        loja.toast(`${COMPETENCIA} reaberta. O que foi ao core volta como ajuste no próximo lote.`)
        return true
      }
      case 'contabil.perguntar':
      case 'contabil.cobrar': {
        const cv = mandar(String(d.texto), 'contabil')
        if (p.acao === 'contabil.cobrar') contabil((x) => ({ ...x, cobrancas: { ...x.cobrancas, ...Object.fromEntries(((d.itens as string[]) ?? []).map((i) => [i, (x.cobrancas[i] ?? 0) + 1])) } }))
        loja.registrar(quem, `Aprovou${sufixo} ${p.acao === 'contabil.cobrar' ? 'a cobrança dos documentos' : 'a pergunta sobre lançamentos'} · ${p.cliente}`)
        loja.toast(p.acao === 'contabil.cobrar' ? 'Cobrança enviada pela régua “Documentos da competência”.' : 'Pergunta enviada. Quando o cliente responder, o Contábil classifica sozinho.', cv ? { modulo: 'crm', aba: 'conversas', conversa: cv } : undefined, 'Ver a conversa')
        return true
      }
      case 'contabil.relatorio.enviar':
      case 'contabil.declaracao.enviar': {
        const campo = p.acao === 'contabil.declaracao.enviar' ? 'declaracoes' : 'relatorios'
        contabil((x) => ({ ...x, [campo]: { ...x[campo], [d.relId]: { ...x[campo][d.relId], situacao: 'enviado', quando: hojeCurto() } } }))
        documento(`${d.nome}.pdf`, ['Entregáveis', 'Contábil'], p.acao === 'contabil.declaracao.enviar' ? 'outro' : 'balancete')
        const cv = mandar(`Oi! Segue ${d.nome}${d.assinado ? ', assinado pelo contador responsável' : ''}. Também está no app, em Documentos.`, 'contabil', `${d.nome}.pdf`)
        loja.registrar(quem, `Aprovou${sufixo} o envio de “${d.nome}” a ${p.cliente}${d.assinado ? ' (assinatura conferida)' : ''}`)
        loja.toast(`“${d.nome}” enviado; já aparece no app do cliente.`, cv ? { modulo: 'crm', aba: 'conversas', conversa: cv } : undefined, 'Ver a conversa')
        return true
      }
      case 'consultoria.parecer.enviar': {
        consult((x) => ({
          ...x,
          perguntas: { ...x.perguntas, [d.perguntaId]: { ...x.perguntas[d.perguntaId], status: 'enviada' } },
          pareceres: [{ id: `pn-${Date.now()}`, titulo: d.titulo, data: new Date().toLocaleDateString('pt-BR'), base: `base de ${ddmm(HOJE)}`, versao: 1, citacoes: d.citacoes ?? 0 }, ...x.pareceres],
        }))
        documento(`Parecer · ${d.titulo}.pdf`, ['Consultoria', 'Pareceres'], 'parecer')
        const cv = mandar(`Oi! Sobre a sua pergunta (“${d.titulo}”), o parecer revisado pelo contador está no app, em Documentos, com as normas citadas e a data da base legal.`, 'consultor')
        loja.registrar(quem, `Aprovou${sufixo} o envio do parecer “${d.titulo}” a ${p.cliente} (CON-002)`)
        loja.toast('Parecer enviado: virou documento no app do cliente.', cv ? { modulo: 'crm', aba: 'conversas', conversa: cv } : undefined, 'Ver a conversa')
        return true
      }
      case 'consultoria.estudo.enviar': {
        consult((x) => ({ ...x, estudos: { ...x.estudos, [d.estudo]: 'enviado' } }))
        documento(`${d.titulo}.pdf`, ['Consultoria'], 'relatorio')
        mandar(`Oi! Preparamos “${d.titulo}” com os números da empresa. Está no app; podemos marcar uma conversa para explicar.`, 'consultor')
        loja.registrar(quem, `Aprovou${sufixo} o envio de “${d.titulo}” a ${p.cliente}`)
        loja.toast(`“${d.titulo}” enviado ao cliente.`)
        return true
      }
    }
    return true
  }
}

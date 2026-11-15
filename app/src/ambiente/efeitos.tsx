import { useLoja } from './loja'
import { integranteDoSetor, useConversaDe } from './fluxos'
import { useSessao } from './sessao'
import { useEfeitosS03 } from '@/telas/painel/s03/cartoes'
import { decidirCartaoFin } from '@/telas/financeiro/cartoes'
import { efeitoCartaoS02 } from './agente-s02'
import { aplicarEfeitoS04, CHAVE_APRENDIZADOS, type Aprendizado } from '@/telas/tarefas/cartoes'
import { repos } from '@/nucleo/repositorios'
import { rotuloSetorCurto } from '@/nucleo/permissoes'
import type { SetorIntegrante } from '@/theme/tipos'
import { efeitoS09 } from './efeitos-s09'
import { efeitoCartaoS10 } from '@/cliente/motor' // S10
import { efeitoCartaoS08a } from '@/telas/bpo/integrantes-s08a' // S08a

/** Opções da decisão (central de aprovações, fase 6). */
export interface OpcoesDecisao {
  /** Comentário opcional de quem decidiu: fica no cartão e vira lição do integrante. */
  comentario?: string
  /** Setor do integrante que pediu, para o cartão que só existe no chat (o do banco já guarda). */
  setor?: string
}

/**
 * O que cada cartão de aprovação faz no escritório quando a pessoa decide.
 * Aprovar executa (a tarefa anda, o cliente recebe, o evento fica com o nome
 * de quem aprovou); recusar devolve o trabalho a uma pessoa; editar e aprovar
 * vale como aprovar, com a edição registrada. O comentário (opcional) fica no
 * cartão e entra nos aprendizados do integrante (`s04:integrantes:aprendizados`,
 * os mesmos da Governança da IA e da ficha da tarefa).
 */
export function useEfeitosCartao() {
  const loja = useLoja()
  const { usuario, permissoes } = useSessao()
  const conversaDe = useConversaDe()
  const efeitosS03 = useEfeitosS03() // S03: cartões `s03-...` do Painel B

  return (cartao: string, decisao: string, op: OpcoesDecisao = {}) => {
    const comentario = op.comentario?.trim() || undefined
    executar(cartao, decisao, comentario)
    if (comentario) guardarComentario(cartao, decisao, comentario, op.setor)
  }

  /** Grava o comentário no cartão decidido e o transforma em lição (o S04 já guarda o da recusa e o da edição). */
  function guardarComentario(cartao: string, decisao: string, comentario: string, setorDoChat?: string) {
    const c = repos.cartoes.obter(cartao)
    // A alçada pode ter barrado a decisão (Financeiro): sem decisão, não há o que comentar.
    if (!c?.decidido_em) return
    try {
      repos.cartoes.atualizar(cartao, { comentario }, { ferramenta: 'aprovacao.decidir', texto: `${usuario.nome} comentou a decisão “${c.resumo_humano || cartao}”: ${comentario}` })
    } catch {
      // O comentário é complemento: a decisão já valeu.
    }
    if (cartao.startsWith('s04-') && decisao !== 'aprovar') return
    const setor = String(c.extras?.setor ?? setorDoChat ?? 'geral')
    const texto = decisao === 'recusar' ? `Recusado: ${comentario}` : decisao === 'editar_e_aprovar' ? `Corrigido antes de aprovar: ${comentario}` : `Aprovado, com a observação: ${comentario}`
    const lista = (repos.telas.obter(CHAVE_APRENDIZADOS)?.valor as Aprendizado[] | undefined) ?? []
    const licao: Aprendizado = { integrante: String(c.extras?.integrante ?? rotuloSetorCurto[setor as SetorIntegrante] ?? setor), setor, acao: String(c.extras?.acao ?? (c.argumentos as { tipo?: string })?.tipo ?? c.ferramenta), texto, quando: new Date().toISOString(), por: usuario.nome }
    repos.telas.lembrar(CHAVE_APRENDIZADOS, [...lista, licao])
  }

  function executar(cartao: string, decisao: string, comentario?: string) {
    // S07: cartões do Financeiro (s07-* e o lote fik1) conferem a alçada e executam pelas entidades.
    if (decidirCartaoFin(cartao, decisao, { loja, usuario, permissoes })) return
    loja.decidir(cartao, decisao)
    if (efeitosS03(cartao, decisao)) return // S03
    // S02: cartões dos integrantes do Painel A executam a ação guardada no cartão e aprendem com a decisão.
    if (cartao.startsWith('s02-')) return efeitoCartaoS02(cartao, decisao, { loja, quem: usuario.nome, usuarioId: usuario.id, comentario })
    // S04: cartões da S04 (id s04-...) têm o efeito registrado pela tela que os criou.
    if (cartao.startsWith('s04-') && aplicarEfeitoS04(cartao, decisao, { loja, usuario, conversaDe, comentario })) return
    // S09: cartões do Raio-X, da implantação e do envio de documentos (chaves s09-*).
    if (efeitoS09(loja, usuario.nome, cartao, decisao)) return
    if (cartao.startsWith('s10-')) return efeitoCartaoS10(loja, cartao, decisao, usuario.nome, conversaDe) // S10: cartões do app do cliente
    if (efeitoCartaoS08a(loja, cartao, decisao, usuario.nome)) return // S08a: convite do app preparado na implantação do BPO
    const aprovou = decisao !== 'recusar'
    const quem = usuario.nome
    if (!aprovou && cartao.startsWith('s01-promo')) {
      loja.registrar(quem, 'Recusou a promoção do Fiscal: não pergunta de novo por 90 dias')
      loja.toast('Certo: o Fiscal continua pedindo aprovação e não pergunta de novo por 90 dias.')
      return
    }
    if (!aprovou) {
      loja.registrar(quem, `Recusou o cartão ${cartao}${comentario ? ` (motivo: ${comentario})` : ''}`)
      loja.toast('Recusado. O integrante não executa; a tarefa volta para uma pessoa decidir.')
      return
    }
    const editado = decisao === 'editar_e_aprovar' ? ' (com edição)' : ''
    switch (cartao) {
      case 'k3': {
        // Geral → Fiscal: PGDAS-D do Café Central
        loja.atualizarTarefa('t0', { status: 'concluida', cartaoPendente: false })
        const cv = conversaDe('Café Central ME', 'fiscal', 'João Batista')
        loja.mensagemCrm(cv, {
          tipo: 'mensagem',
          de: 'integrante',
          autor: 'Fiscal',
          setor: 'fiscal',
          canal: 'whatsapp',
          texto: 'Oi, João! O PGDAS-D de outubro do Café Central foi transmitido. O DAS de R$ 1.390,00 vence em 20/11; segue a guia.',
          entrega: 'enviada',
          anexos: [{ nome: 'DAS 10-2026 Café Central.pdf', tipo: 'pdf' }],
        })
        loja.registrar(quem, `Aprovou${editado} a transmissão do PGDAS-D 10/2026 do Café Central ME (FIS-009)`)
        loja.toast('PGDAS-D do Café Central transmitido. A guia foi para o João Batista.', { modulo: 'crm', aba: 'conversas', conversa: cv }, 'Ver a conversa')
        return
      }
      case 'fk1': {
        loja.registrar(quem, `Aprovou${editado} a transmissão do PGDAS-D 10/2026 de 14 clientes (FIS-009)`)
        loja.avisar({ para: [usuario.id], tipo: 'sistema', setor: 'fiscal', titulo: '14 PGDAS-D transmitidos', detalhe: 'as guias saem pela régua de cada cliente; recibos na pasta de cada um', destino: { modulo: 'painel', aba: 'fiscal' } })
        loja.toast('14 declarações transmitidas. As guias saem pela régua de cada cliente.', { modulo: 'painel', aba: 'fiscal' }, 'Ver na aba Fiscal')
        return
      }
      case 'dk1':
      case 'dk0': {
        loja.decidir('dk1', decisao)
        loja.decidir('dk0', decisao)
        loja.atualizarTarefa('t10', { status: 'em_andamento', cartaoPendente: false })
        const dp = integranteDoSetor('dp')
        loja.mensagemTime(dp, {
          autor: { tipo: 'integrante', setor: 'dp' },
          texto: 'Gerei os dois contratos de experiência 45+45 da Metalúrgica Andrade. Falta mandar para assinatura do Rafael Moura e da Juliana Prado.',
          cartoes: [{ tipo: 'documento', id: `doc-ct-${Date.now()}`, nome: 'Contratos de experiência · Metalúrgica Andrade.pdf', especie: 'documento', cliente: 'Metalúrgica Andrade Ltda', competencia: '11/2026' }],
        })
        loja.registrar(quem, `Aprovou${editado} contrato de experiência 45+45 (DP-004 · Metalúrgica Andrade Ltda)`)
        loja.toast('Contratos gerados. O DP deixou os PDFs no chat para enviar à assinatura.', { modulo: 'inicio', aba: 'time', integrante: dp }, 'Ver no Time')
        return
      }
      case 'sk2': {
        loja.atualizarTarefa('t18', { status: 'aguardando_cliente', diasAguardando: 0 })
        const cv = conversaDe('Metalúrgica Andrade Ltda', 'societario', 'Helena Andrade')
        loja.mensagemCrm(cv, {
          tipo: 'mensagem',
          de: 'integrante',
          autor: 'Societário',
          setor: 'societario',
          canal: 'whatsapp',
          texto: 'Oi, Helena! A JUCESP pediu a sua assinatura no instrumento da alteração contratual. Mandei o link de assinatura eletrônica para o seu e-mail; leva 2 minutos.',
          entrega: 'enviada',
        })
        loja.registrar(quem, `Aprovou${editado} o envio para assinatura de Helena Andrade (SOC-031 · Metalúrgica Andrade Ltda)`)
        loja.toast('Pedido de assinatura enviado à Helena Andrade.', { modulo: 'crm', aba: 'conversas', conversa: cv }, 'Ver a conversa')
        return
      }
      case 'fik1': {
        loja.registrar(quem, `Aprovou${editado} as cobranças de dezembro: 142 clientes, R$ 203.120 (FIN-005)`)
        loja.avisar({ para: [usuario.id], tipo: 'sistema', setor: 'financeiro_escritorio', titulo: 'Cobranças de dezembro aprovadas', detalhe: 'saem em 01/12 às 06:00, com NFS-e; a régua acompanha cada uma', destino: { modulo: 'financeiro', aba: 'cobranca' } })
        loja.toast('Cobranças de dezembro aprovadas: saem em 01/12 às 06:00.', { modulo: 'financeiro', aba: 'cobranca' }, 'Ver na Cobrança')
        return
      }
      // S01: promoção e fim da observação do integrante (02, 3.3 e 11.1).
      case cartao.startsWith('s01-promo') ? cartao : '': {
        loja.registrar(quem, `Aprovou${editado}: o Fiscal passa a pedir XML ao cliente sozinho (vale para sempre)`)
        loja.toast('Feito: o Fiscal passa a fazer isso sozinho e continua avisando o que fez.')
        return
      }
      case cartao.startsWith('s01-obs') ? cartao : '': {
        loja.registrar(quem, `Aprovou${editado} o fim da observação do integrante (${cartao.replace('s01-obs-', '')})`)
        loja.toast('Observação encerrada: ele faz sozinho o que é reversível; o resto continua com cartão.')
        return
      }
      default:
        loja.registrar(quem, `Aprovou${editado} o cartão ${cartao}`)
        loja.toast('Aprovado. O integrante segue com o trabalho.')
    }
  }
}

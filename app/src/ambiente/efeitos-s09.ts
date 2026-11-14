import { achadosDe, CHAVE_RAIOX, estadoRaioXInicial, type Decisao, type EstadoRaioX } from '@/dados/raiox'
import { CHAVE_IMPLANTACAO, estadoImplantacaoInicial, type EstadoImplantacao } from '@/dados/implantacao'
import { banco } from '@/nucleo/banco'
import { clienteParaModelo } from '@/nucleo/mapeadores'
import { repos } from '@/nucleo/repositorios'
import type { useLoja } from './loja'

/**
 * O que os cartões da S09 fazem quando a pessoa decide (chaves `s09-*`):
 * Raio-X em lote, importação de clientes, campanha de acessos e envio de
 * documento ao cliente. Chamado por `useEfeitosCartao` (efeitos.tsx).
 */

type Loja = ReturnType<typeof useLoja>

const ler = <T,>(chave: string, padrao: T): T => (banco.obter('registro_tela', chave)?.valor as T | undefined) ?? padrao

export function efeitoS09(loja: Loja, quem: string, cartao: string, decisao: string): boolean {
  if (!cartao.startsWith('s09-')) return false
  const aprovou = decisao !== 'recusar'
  if (cartao === 's09-raiox-lote') {
    if (!aprovou) {
      loja.toast('Raio-X: nada muda. Os achados continuam esperando a sua decisão na tela.')
      return true
    }
    const rx = ler<EstadoRaioX>(CHAVE_RAIOX, estadoRaioXInicial)
    const achados = achadosDe(loja.clientes)
    const decisoes: Record<string, Decisao> = { ...rx.decisoes }
    for (const a of achados) if (!decisoes[a.id]) decisoes[a.id] = a.tipo === 'ex_cliente' ? 'ex_cliente' : a.tipo === 'ignorar' ? 'ignorado' : 'aprovado'
    repos.telas.lembrar(CHAVE_RAIOX, { ...rx, decisoes, aplicado_em: new Date().toISOString() })
    loja.registrar(quem, `Aprovou em lote as ${achados.length} sugestões do Raio-X do Drive (D-10)`)
    loja.toast(`${achados.length} sugestões do Raio-X aplicadas. O mapeamento do Drive passou a valer.`, { modulo: 'arquivos', aba: 'pastas' }, 'Ver em Arquivos')
    return true
  }
  if (cartao.startsWith('s09-importar')) {
    const e = ler<EstadoImplantacao>(CHAVE_IMPLANTACAO, estadoImplantacaoInicial())
    if (!e.importacao) return true
    if (!aprovou) {
      repos.telas.lembrar(CHAVE_IMPLANTACAO, { ...e, importacao: { ...e.importacao, enviada_em: null } })
      loja.toast('Importação recusada: nada foi gravado. Ajuste a prévia e envie de novo.')
      return true
    }
    const novos = e.importacao.linhas.filter((l) => l.incluir && !l.existente)
    for (const l of novos) repos.clientes.criar({ ...clienteParaModelo({ id: `cli-${l.id}-${Date.now().toString(36)}`, codigo: l.codigo, nome: l.nome, documento: l.documento, regime: l.regime, situacao: 'implantacao' }) }, { texto: `Importou o cliente ${l.nome} (${e.importacao.fonte})` })
    repos.telas.lembrar(CHAVE_IMPLANTACAO, { ...e, importacao: { ...e.importacao, gravada_em: new Date().toISOString() }, feitos: [...new Set([...e.feitos, 'clientes'])] })
    loja.registrar(quem, `Aprovou a importação de ${novos.length} cliente(s) (${e.importacao.fonte})`)
    loja.toast(`${novos.length} cliente(s) importado(s), em implantação. A trilha de entrada de cada um começa no Painel.`, { modulo: 'painel', aba: 'societario' }, 'Ver no Painel')
    return true
  }
  if (cartao.startsWith('s09-campanha')) {
    const e = ler<EstadoImplantacao>(CHAVE_IMPLANTACAO, estadoImplantacaoInicial())
    if (!aprovou) {
      loja.toast('Campanha de acessos recusada: nada foi enviado aos clientes.')
      return true
    }
    repos.telas.lembrar(CHAVE_IMPLANTACAO, { ...e, campanha_em: new Date().toISOString(), feitos: [...new Set([...e.feitos, 'campanha'])] })
    loja.registrar(quem, 'Aprovou a campanha de acessos para a carteira (SOC-014, SOC-011)')
    loja.avisar({ para: [], tipo: 'sistema', setor: 'societario', titulo: 'Campanha de acessos enviada', detalhe: 'o Societário acompanha quem cadastrou a procuração e cobra quem falta', destino: { modulo: 'painel', aba: 'societario' } })
    loja.toast('Campanha enviada pelo app e pelo WhatsApp de cada cliente. O Societário acompanha as respostas.')
    return true
  }
  if (cartao.startsWith('s09-envio-')) {
    const id = cartao.slice('s09-envio-'.length)
    const d = loja.documentos.find((x) => x.id === id)
    if (!d) return true
    if (!aprovou) {
      loja.toast(`${d.nome}: envio recusado. Nada saiu.`)
      return true
    }
    loja.ajustarDocumento(d.id, { entregas: [...(d.entregas ?? []), { quem: 'cliente', acao: 'enviado', quando: new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) }] })
    loja.registrar(quem, `Aprovou o envio de ${d.nome} ao cliente`)
    loja.toast(`${d.nome} enviado ao cliente. O registro de entrega acompanha visto e baixado.`)
    return true
  }
  return false
}

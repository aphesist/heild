import { ChatsTeardropIcon, EnvelopeSimpleIcon, EyeSlashIcon, NewspaperIcon, PencilSimpleIcon, TrafficSignalIcon } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import type { ItemConversa } from '@/dados/crm'
import { repos } from '@/nucleo/repositorios'
import { useAcoesInternas } from './interna'
import { useLoja } from './loja'
import { useSessaoBruta } from './sessao'

const hora = () => new Date().toTimeString().slice(0, 5)

/**
 * S05 no painel Demonstração: o que de fora acontece com o CRM e com a
 * comunicação interna (o cliente apaga ou edita, o e-mail volta, o documento
 * fica sem abrir, um colega escreve, o resumo da manhã sai).
 */
export function LabS05({ onFeito }: { onFeito: () => void }) {
  const loja = useLoja()
  const sessao = useSessaoBruta()
  const acoes = useAcoesInternas()
  if (!sessao?.usuario) return null
  const eu = sessao.usuario
  const conversa = (id: string) => loja.conversas.find((c) => c.id === id) ?? loja.conversas.find((c) => !c.lead && !c.transferidaPara)
  const mudarUltimaDoCliente = (f: (i: Extract<ItemConversa, { tipo: 'mensagem' }>) => Extract<ItemConversa, { tipo: 'mensagem' }>, texto: string) => {
    const c = conversa('cv2')
    if (!c) return
    const idx = c.itens.map((i) => i.tipo === 'mensagem' && i.de === 'cliente').lastIndexOf(true)
    if (idx < 0) return
    loja.salvarConversa({ ...c, itens: c.itens.map((i, k) => (k === idx && i.tipo === 'mensagem' ? f(i) : i)) })
    loja.toast(texto, { modulo: 'crm', aba: 'conversas', conversa: c.id }, 'Ver')
  }
  const botoes: [ReactNode, string, () => void][] = [
    [
      <ChatsTeardropIcon key="a" />,
      'Um colega menciona você no Geral',
      () => {
        const autor = eu.id === 'u2' ? 'u1' : 'u2'
        const nome = autor === 'u1' ? 'Fernanda Lima' : 'João Pereira'
        repos.mensagensInternas.criar({ conversa_interna_id: 'ci-geral', autor_id: autor, corpo: `@${eu.nome}, consegue revisar a alteração contratual da Metalúrgica Andrade Ltda hoje?`, versoes: [], extras: { mencoes: [{ tipo: 'pessoa', id: eu.id, rotulo: eu.nome }], citacoes: [{ tipo: 'cliente', id: 'c1', rotulo: 'Metalúrgica Andrade Ltda', cliente_id: 'c1' }] } }, { texto: `${nome} escreveu no Geral` })
        loja.avisar({ para: [eu.id], titulo: `${nome} mencionou você em Geral`, detalhe: 'consegue revisar a alteração contratual da Metalúrgica Andrade Ltda hoje?', tipo: 'conversa', destino: { modulo: 'interna', aba: 'conversas', conversaInterna: 'ci-geral' } })
      },
    ],
    [
      <NewspaperIcon key="b" />,
      'Resumo da manhã no canal do Fiscal',
      () => {
        acoes.resumoDaManha('ci-fiscal', 'fiscal')
        loja.toast('O integrante do Fiscal está escrevendo o resumo da manhã.', { modulo: 'interna', aba: 'conversas', conversaInterna: 'ci-fiscal' }, 'Ver')
      },
    ],
    [<EyeSlashIcon key="c" />, 'Cliente apaga a última mensagem (CRM)', () => mudarUltimaDoCliente((i) => ({ ...i, apagada: true }), 'O cliente apagou a mensagem no WhatsApp; o texto original fica guardado.')],
    [<PencilSimpleIcon key="d" />, 'Cliente edita a última mensagem (CRM)', () => mudarUltimaDoCliente((i) => ({ ...i, editadaDe: i.texto, texto: `${i.texto ?? ''} (corrigindo: é a filial de Sorocaba)` }), 'O cliente editou a mensagem; as duas versões ficam.')],
    [
      <EnvelopeSimpleIcon key="e" />,
      'E-mail ao cliente voltou (CRM)',
      () => {
        const c = conversa('cv3')
        if (!c) return
        loja.salvarConversa({ ...c, itens: [...c.itens, { tipo: 'mensagem', id: `dv${Date.now()}`, de: 'atendente', autor: eu.nome, hora: hora(), canal: 'email', assunto: 'Guia do ICMS 10/2026', texto: 'Segue a guia do ICMS de outubro.', anexos: [{ nome: 'Guia ICMS 10-2026.pdf', tipo: 'pdf' }], entrega: 'falhou', devolvido: 'caixa do destinatário cheia (o servidor devolveu)' }] })
        loja.toast('O e-mail voltou: a entrega ficou como falha.', { modulo: 'crm', aba: 'conversas', conversa: c.id }, 'Ver')
      },
    ],
    [
      <TrafficSignalIcon key="f" />,
      'Documento enviado há 3 dias úteis sem abrir',
      () => {
        const c = conversa('cv2')
        if (!c) return
        loja.salvarConversa({ ...c, itens: [...c.itens, { tipo: 'dia', texto: 'há 3 dias úteis' }, { tipo: 'mensagem', id: `fv${Date.now()}`, de: 'atendente', autor: eu.nome, hora: '09:12', canal: 'whatsapp', texto: 'Segue o DAS de outubro, vence dia 20.', anexos: [{ nome: 'DAS 10-2026.pdf', tipo: 'pdf' }], entrega: 'entregue', farol: 'vermelho' }] })
        loja.toast('Farol vermelho: o documento passou 3 dias úteis sem ser aberto.', { modulo: 'crm', aba: 'conversas', conversa: c.id }, 'Ver')
      },
    ],
  ]
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-muted-foreground px-2 pt-1 text-xs">CRM e comunicação interna (S05)</span>
      {botoes.map(([icone, rotulo, fazer]) => (
        <button
          key={rotulo}
          type="button"
          onClick={() => {
            try {
              fazer()
            } catch (e) {
              loja.toastErro(e instanceof Error ? e.message : String(e))
            }
            onFeito()
          }}
          className="text-muted-foreground hover:bg-sunken/70 flex cursor-pointer items-center gap-2 rounded-[10px] px-2 py-1.5 text-left text-sm [&_svg]:size-4 [&_svg]:shrink-0"
        >
          {icone} {rotulo}
        </button>
      ))}
    </div>
  )
}


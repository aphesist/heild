import { PaperclipIcon } from '@phosphor-icons/react'
import { useLoja } from '@/ambiente/loja'
import { contextoSistema } from '@/nucleo/permissoes'
import { useTabela } from '@/nucleo/react'
import { comoAtor } from '@/nucleo/repositorios'
import { documentosBpo } from '@/nucleo/repositorios/s08b-operacao'
import type { ConteudoDocumento } from '@/nucleo/semente/s08b'

/**
 * S08b · Controles da operação do BPO no painel Demonstração (não fazem parte
 * do produto): um boleto chegando pelo WhatsApp da Padaria e uma nota do
 * Mercado com os dados bancários trocados (o golpe mais comum, 10, 3.13).
 * Os dois aparecem em BPO › Fila › Documentos chegando.
 */
export function SecaoDemonstracaoOperacaoBpo() {
  const loja = useLoja()
  const tPerfil = useTabela('bpo_perfil')
  const n = useTabela('bpo_documento').length
  if (!tPerfil.some((x) => x.cliente_id === 'c2')) return null
  const chegar = (cliente_id: string, nome: string, remetente: string, conteudo: ConteudoDocumento, mensagem: string) => {
    try {
      comoAtor(contextoSistema, () => documentosBpo.receber({ cliente_id, nome_arquivo: nome, tipo_documento: 'boleto', canal: 'whatsapp', remetente, extras: { conteudo, mensagem } }))
      loja.avisar({ para: [], tipo: 'cliente', setor: 'bpo_pagar', titulo: `Chegou ${nome} pelo WhatsApp`, detalhe: remetente, destino: { modulo: 'bpo', aba: 'fila', cliente: cliente_id } })
      loja.toast(`Chegou ${nome}: está em BPO › Fila › Documentos chegando`, { modulo: 'bpo', aba: 'fila', cliente: cliente_id }, 'Ver')
    } catch (e) {
      loja.toastErro(e instanceof Error ? e.message : String(e))
    }
  }
  const botao = 'text-muted-foreground hover:bg-sunken/70 flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm'
  return (
    <div className="flex flex-col gap-1">
      <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
        <PaperclipIcon className="size-3.5" /> Operação do BPO (S08b)
      </span>
      <button type="button" className={botao} onClick={() => chegar('c2', `boleto-laticinios-serra-${n + 1}.pdf`, 'João Batista', { fornecedor: 'Laticínios Serra', valor: 1_640, vencimento: '2026-11-27', categoria: 'Matéria-prima', confianca: 'alta' }, 'boleto do leite da semana')}>
        Chegar um boleto pelo WhatsApp (Padaria)
      </button>
      <button type="button" className={botao} onClick={() => chegar('c8', `boleto-frigorifico-${n + 1}.pdf`, 'Patrícia Almeida', { fornecedor: 'Frigorífico Boa Carne', valor: 12_800, vencimento: '2026-11-28', categoria: 'Mercadoria para revenda', banco: 'Banco Digital XP · ag. 0001 · c/c 99.120-3', confianca: 'alta' }, 'o frigorífico mudou de banco, paguem nessa conta nova')}>
        Chegar um boleto com os dados bancários trocados (Mercado)
      </button>
    </div>
  )
}

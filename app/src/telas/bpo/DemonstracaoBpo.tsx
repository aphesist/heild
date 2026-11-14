import { BriefcaseIcon } from '@phosphor-icons/react'
import { useLoja } from '@/ambiente/loja'
import { Interruptor } from '@/components/ui/formulario'
import { definirEstadoConector, useEstadoConector } from '@/dados/conectores'
import { banco } from '@/nucleo/banco'
import { contextoSistema } from '@/nucleo/permissoes'
import { useTabela } from '@/nucleo/react'
import { comoAtor, repos } from '@/nucleo/repositorios'
import { garantirSementeBpo } from '@/nucleo/semente/s08'

/**
 * S08 · Controles do BPO no painel Demonstração (não fazem parte do produto):
 * o cenário 3 ("BPO adicionado": o escritório sem BPO liga o pacote agora e
 * começa pela primeira empresa), o cartão que expira sem resposta (nunca
 * paga) e o ERP do cliente fora do ar (estado de erro das telas).
 */
export function SecaoDemonstracaoBpo() {
  const loja = useLoja()
  const tSetor = useTabela('setor')
  const tLote = useTabela('bpo_lote')
  const contaAzul = useEstadoConector('conta_azul')
  const setor = tSetor.find((s) => s.codigo === 'bpo_financeiro')
  const ligado = loja.estado.bpoModulo && !!setor?.ativo
  const aberto = tLote.find((l) => l.situacao === 'aguardando' || l.situacao === 'parcial')
  const comoSistema = (f: () => void) => {
    try {
      comoAtor(contextoSistema, f)
    } catch (e) {
      loja.toastErro(e instanceof Error ? e.message : String(e))
    }
  }
  return (
    <div className="flex flex-col gap-2">
      <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
        <BriefcaseIcon className="size-3.5" /> BPO (S08)
      </span>
      <Interruptor
        rotulo="Pacote BPO ligado neste escritório"
        detalhe={ligado ? 'Desligue e ligue de novo para mostrar o cenário “BPO adicionado”.' : 'Cenário 3: o escritório sem BPO compra o pacote agora; o item BPO aparece vazio, pronto para a primeira empresa.'}
        ligado={ligado}
        onMudar={(v) =>
          comoSistema(() => {
            loja.ligarBpo(v)
            if (setor && setor.ativo !== v) repos.setores.atualizar(setor.id, { ativo: v }, { texto: `${v ? 'Ativou' : 'Desativou'} o setor BPO Financeiro (demonstração)` })
            if (v) garantirSementeBpo()
            loja.toast(v ? 'Pacote BPO ligado: o item BPO aparece para quem tem o setor' : 'Pacote BPO desligado (os dados ficam guardados)')
          })
        }
      />
      <Interruptor
        rotulo="Conta Azul fora do ar"
        detalhe="As empresas no Conta Azul ficam com a sincronização atrasada; sincronizar mostra o erro e o “Tentar de novo”."
        ligado={contaAzul.estado === 'fora_do_ar'}
        onMudar={(v) => definirEstadoConector('conta_azul', { estado: v ? 'fora_do_ar' : 'ativo', mensagem: v ? 'Conta Azul fora do ar (simulação da demonstração).' : undefined })}
      />
      <button
        type="button"
        disabled={!aberto}
        onClick={() =>
          aberto &&
          comoSistema(() => {
            repos.bpo.lotes.expirar(aberto.id)
            loja.avisar({ para: [], tipo: 'prazo', setor: 'bpo_pagar', titulo: `Cartão expirou sem resposta: ${aberto.titulo}`, detalhe: 'Nada foi pago. Alerta ao Gestor do BPO e ao sócio.', destino: { modulo: 'bpo', aba: 'aprovacoes', cliente: aberto.cliente_id } })
            loja.toast(`O cartão “${aberto.titulo}” expirou: nada foi pago (B3)`)
          })
        }
        className="text-muted-foreground hover:bg-sunken/70 flex cursor-pointer items-center gap-2 rounded-[10px] px-2 py-1.5 text-left text-sm disabled:cursor-not-allowed disabled:opacity-50"
      >
        Fazer um cartão de pagamento expirar {aberto ? `(${String(banco.obter('cliente', aberto.cliente_id)?.nome ?? '')})` : '(nenhum aberto)'}
      </button>
    </div>
  )
}

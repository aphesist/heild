import { BankIcon, ChatCircleTextIcon, CheckCircleIcon, ClockCountdownIcon, HandTapIcon } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import { useLoja } from '@/ambiente/loja'
import { banco } from '@/nucleo/banco'
import { comoAtor, repos } from '@/nucleo/repositorios'
import { dataCurta, HOJE } from './dominio'

/*
 * S07 no painel Demonstração: o que acontece de fora com o Financeiro (o
 * cliente contesta ou toca em "pago" no app, o webhook do banco confirma, o
 * segundo sócio aprova) e uma fatura antiga para mostrar o aviso formal e a
 * pausa parcial. Tudo grava pelos repositórios, com o ator certo.
 */

const cliente = (nome: string) => ({ ator: { tipo: 'pessoa_cliente' as const, nome }, origem: 'api_externa' as const })
const sistema = { ator: { tipo: 'sistema' as const, nome: 'Banco do escritório (webhook)' }, origem: 'api_externa' as const }

export function LabS07({ onFeito }: { onFeito: () => void }) {
  const loja = useLoja()
  if (!banco.ler('politica_financeira').length) return null
  const aberta = (cli: string) => banco.ler('cobranca').find((c) => c.cliente_id === cli && c.situacao === 'emitida')
  const botoes: [ReactNode, string, () => void][] = [
    [
      <ChatCircleTextIcon key="a" />,
      'Cliente contesta a fatura no app (S07-A22)',
      () => {
        const c = aberta('c3') ?? banco.ler('cobranca').find((x) => x.situacao === 'emitida')
        if (!c) return loja.toast('Nenhuma fatura em aberto para contestar.')
        comoAtor(sistema, () => repos.cobrancas.anotar(c.id, 'Contestação pelo app: "a faixa de notas não foi combinada". A régua pausou sozinha e a contestação virou tarefa do Financeiro.', { regua_pausada_ate: '2026-11-28', regua_pausa_motivo: 'contestação pelo app' }, { ferramenta: 'cobranca.pausar_regua' }))
        loja.avisar({ para: [], tipo: 'cliente', setor: 'financeiro_escritorio', titulo: 'Cliente contestou a fatura no app', detalhe: 'a régua pausou; resolva a contestação', destino: { modulo: 'financeiro', aba: 'cobranca', fatura: c.id } })
      },
    ],
    [
      <HandTapIcon key="b" />,
      'Cliente toca em "pago" no app',
      () => {
        const c = aberta('c1') ?? aberta('c5')
        if (!c) return loja.toast('Nenhuma fatura em aberto.')
        comoAtor(cliente('Rita Campos'), () => repos.recebimentos.criar({ cobranca_id: c.id, valor: c.valor, pago_em: HOJE, meio: 'Pix', tarifa: 0, pagador: 'informado no app', origem: 'informado_pelo_cliente', situacao: 'informado', comprovante: 'comprovante-app.jpg' }, { ferramenta: 'recebimento.baixar', semAutorizar: true }))
        comoAtor(sistema, () => repos.cobrancas.anotar(c.id, `O cliente tocou em "pago" no app em ${dataCurta(HOJE)}: régua pausada por 3 dias úteis até o extrato confirmar (não baixa)`, { regua_pausada_ate: '2026-11-23', regua_pausa_motivo: 'pago informado no app' }))
        loja.avisar({ para: [], tipo: 'cliente', setor: 'financeiro_escritorio', titulo: 'Pagamento informado no app', detalhe: 'aguardando confirmação pelo extrato', destino: { modulo: 'financeiro', aba: 'cobranca', fatura: c.id } })
      },
    ],
    [
      <BankIcon key="c" />,
      'Webhook do banco confirma um pagamento',
      () => {
        const c = aberta('c5') ?? aberta('c2')
        if (!c) return loja.toast('Nenhuma fatura em aberto.')
        comoAtor(sistema, () => {
          repos.recebimentos.criar({ cobranca_id: c.id, valor: c.valor, pago_em: HOJE, meio: 'Pix', tarifa: 0, pagador: 'webhook do banco', origem: 'webhook', situacao: 'confirmado' }, { ferramenta: 'recebimento.baixar' })
          repos.cobrancas.anotar(c.id, 'Pago: baixa automática pelo webhook do banco; recibo enviado e régua encerrada', { situacao: 'paga', paga_em: HOJE, regua_pausada_ate: null, regua_pausa_motivo: null }, { ferramenta: 'recebimento.baixar' })
        })
        loja.toast('Webhook: pagamento confirmado e baixado sozinho.', { modulo: 'financeiro', aba: 'cobranca', fatura: c.id }, 'Ver')
      },
    ],
    [
      <ClockCountdownIcon key="d" />,
      'Uma fatura antiga, vencida há 46 dias (aviso formal e pausa)',
      () => {
        const linhas = [{ id: 'l1', tipo: 'item' as const, descricao: 'Honorário contábil (Contábil, DP)', valor: 1900, codigo: '17.19' }]
        comoAtor(sistema, () => repos.cobrancas.criar({ cliente_id: 'c2', numero: 'FAT-202609-0431', competencia: '2026-09', origem: 'lote', linhas, valor: 1900, vencimento: '2026-10-03', meio: 'boleto', situacao: 'emitida', regua_etapa: 'D+20', historico: [{ quando: '2026-09-01T06:10:00.000Z', texto: 'Cobrança gerada pelo lote (demonstração: fatura antiga em atraso)' }] }, { semAutorizar: true }))
        loja.toast('Fatura de set/26 da Padaria, vencida há 46 dias: o aviso formal e a pausa parcial ficam disponíveis.', { modulo: 'financeiro', aba: 'cobranca' }, 'Ver')
      },
    ],
    [
      <CheckCircleIcon key="e" />,
      'O segundo sócio (João Pereira) aprova o que espera dois aprovadores',
      () => {
        const contas = banco.ler('conta_pagar').filter((c) => c.extras?.primeiro_aprovador && c.situacao === 'aguardando_aprovacao')
        if (!contas.length) return loja.toast('Nada esperando o segundo sócio.')
        comoAtor(sistema, () => contas.forEach((c) => repos.contasPagar.atualizar(c.id, { situacao: 'agendada', alerta: null, extras: { ...c.extras, segundo_aprovador: 'João Pereira' } }, { ferramenta: 'conta_pagar.aprovar', texto: `João Pereira (segundo sócio) aprovou ${c.fornecedor}; agendada no banco` })))
        loja.toast(`${contas.length} conta(s) com as duas aprovações: agendadas no banco.`, { modulo: 'financeiro', aba: 'pagar' }, 'Ver')
      },
    ],
  ]
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-muted-foreground px-2 pt-1 text-xs">Financeiro do escritório (S07)</span>
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

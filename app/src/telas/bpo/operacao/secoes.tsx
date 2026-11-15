import { ArrowCounterClockwiseIcon, ArrowRightIcon, ArrowsClockwiseIcon, BankIcon, CheckIcon, CircleNotchIcon, PlusIcon, ProhibitIcon, WarningIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { useLoja } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import { BotaoAcoes, Carregando, EstadoErro, EstadoVazio, SeloDemonstracao, SePode, useAcao, useConfirmar, usePode } from '@/components/kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Campo, CampoTexto, GavetaFormulario } from '@/components/ui/formulario'
import { cn } from '@/lib/utils'
import type { BpoConta } from '@/nucleo/modelo/entidades'
import { useTabela } from '@/nucleo/react'
import { repos } from '@/nucleo/repositorios'
import { baixaDe, conciliacaoOperacao } from '@/nucleo/repositorios/s08b-operacao'
import { ErroServico, servicos } from '@/servicos'
import { PendentesConciliacao } from '../../financeiro/pecas'
import { BotaoErp, brl, Caixa, Numero, Regra, TituloBloco, useAbrirErp } from '../comum'
import { agoraBpo, contaAberta, dataCurta, dataHora, diasAte, quando, rotuloEtapa, type EmpresaVista } from '../dados'
import { useAcoesErp } from '../FichaEmpresa'
import { usePedirBpo } from '../integrantes'
import { noDiaDaDemo, proximoExtrato, useExtratoCompleto } from './dados'
import { usePedirOperacao, useTrabalhandoEm } from './integrantes'

/**
 * S08b · As seções das Rotinas com uma empresa escolhida: contas a pagar
 * (captura do ERP e conferência), contas a receber e cobrança, conciliação
 * bancária pelo Open Finance (simulado), lançamentos no ERP do cliente.
 * Tudo sobre o espelho do ERP (10, 3.0); nenhum pagamento sai daqui (B3).
 */

const categoriasBpo = ['Vendas no cartão', 'Mercadoria para revenda', 'Matéria-prima', 'Fornecedor eventual', 'Ocupação', 'Energia', 'Água', 'Software', 'Tarifas bancárias', 'Retirada dos sócios', 'Convênios e particulares', 'Projetos (honorários)', 'Vendas no balcão', 'Manutenção']

type Ir = (id: string | null, aba?: string) => void

/** Carregando, erro e selo de demonstração de uma chamada a serviço simulado. */
function EstadoServico({ estado, onTentar }: { estado: { carregando?: string; erro?: string; demo?: string }; onTentar: () => void }) {
  if (estado.carregando) return <Carregando rotulo={estado.carregando.replace(/…$/, '')} className="py-3" />
  if (estado.erro) return <EstadoErro titulo="Não deu para ler agora" descricao={estado.erro} onTentar={onTentar} className="py-4" />
  if (estado.demo) return <SeloDemonstracao fonte={estado.demo} />
  return null
}

/* ---------- Contas a pagar: captura do ERP e conferência ---------- */

const grupos: { rotulo: string; etapas: BpoConta['etapa'][] }[] = [
  { rotulo: 'para conferir', etapas: ['capturada'] },
  { rotulo: 'conferidas, para o lote', etapas: ['conferida', 'em_lote'] },
  { rotulo: 'com o cliente', etapas: ['aguardando_cliente'] },
  { rotulo: 'aprovadas e liberadas', etapas: ['aprovada', 'liberada'] },
  { rotulo: 'pagas (baixa no extrato)', etapas: ['paga'] },
]

export function SecaoPagar({ e, onEscolher }: { e: EmpresaVista; onEscolher: Ir }) {
  const erp = useAcoesErp(e)
  const executar = useAcao()
  const confirmar = useConfirmar()
  const { usuario } = useSessao()
  const [nova, setNova] = useState(false)
  const [grupo, setGrupo] = useState<number | null>(0)
  const contas = [...e.contas].sort((a, b) => a.vencimento.localeCompare(b.vencimento))
  const visiveis = grupo === null ? contas.filter((c) => c.etapa !== 'cancelada') : contas.filter((c) => grupos[grupo].etapas.includes(c.etapa))
  const cancelar = async (c: BpoConta) => {
    const motivo = await confirmar({ titulo: `Cancelar a conta ${c.contraparte}?`, descricao: 'Não se apaga: fica cancelada com o motivo, na trilha.', acao: 'Cancelar a conta', exigirMotivo: true, rotuloMotivo: 'Motivo', perigo: true })
    if (typeof motivo === 'string') executar(() => repos.bpo.contas.cancelar(c.id, motivo), { sucesso: `${c.contraparte} cancelada` })
  }
  return (
    <div className="flex flex-col gap-4">
      <Caixa>
        <TituloBloco
          descricao={e.erp.modo === 'E1' ? `O integrante lê as contas novas do ${e.erp.provedor} (DDA, e-mail, notas), checa duplicidade e fornecedor e deixa para conferir.` : e.erp.modo === 'E2' ? `O ${e.erp.provedor} trabalha por arquivo: importe o do dia; a conta lançada aqui fica em “lançar no ERP”.` : 'Livro próprio: as contas nascem na plataforma.'}
          acao={
            <span className="flex flex-wrap gap-1">
              {e.erp.modo !== 'E3' && e.erp.efetiva !== 'credencial_vencida' && (
                <SePode ferramenta="erp.sincronizar" alvo={{ cliente_id: e.clienteId }}>
                  <Button size="sm" variant="outline" className="rounded-full" disabled={!!erp.estado.carregando} onClick={() => void erp.sincronizar()}>
                    <ArrowsClockwiseIcon /> {e.erp.modo === 'E2' ? 'Importar o arquivo do dia' : `Capturar do ${e.erp.provedor}`}
                  </Button>
                </SePode>
              )}
              <SePode ferramenta="conta_pagar.capturar" alvo={{ cliente_id: e.clienteId }}>
                <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setNova(true)}>
                  <PlusIcon /> Conta
                </Button>
              </SePode>
            </span>
          }
        >
          Contas a pagar
        </TituloBloco>
        {e.erp.efetiva === 'credencial_vencida' && (
          <Regra icone={<WarningIcon weight="duotone" />}>
            A credencial do {e.erp.provedor} venceu: a captura parou até o cliente autorizar de novo.{' '}
            <button type="button" className="text-foreground cursor-pointer underline underline-offset-2" onClick={() => onEscolher(e.clienteId, 'carteira')}>
              Pedir nova autorização
            </button>
          </Regra>
        )}
        <EstadoServico estado={erp.estado} onTentar={() => void erp.sincronizar()} />
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Etapas das contas">
          {grupos.map((g, i) => {
            const n = contas.filter((c) => g.etapas.includes(c.etapa)).length
            return (
              <button key={g.rotulo} type="button" aria-pressed={grupo === i} onClick={() => setGrupo(grupo === i ? null : i)} className={cn('bg-sunken/60 flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 text-xs', grupo === i && 'bg-foreground text-background')}>
                <span className="tabular-nums">{n}</span> {g.rotulo}
              </button>
            )
          })}
        </div>
        {visiveis.length === 0 ? (
          <EstadoVazio compacto titulo={grupo === 0 ? 'Nada para conferir' : 'Nenhuma conta nesta etapa'} descricao={grupo === 0 ? 'Conta capturada aparece aqui até outra pessoa conferir.' : undefined} />
        ) : (
          <ul className="divide-border/70 flex flex-col divide-y" aria-label="Contas a pagar">
            {visiveis.map((c) => {
              const voceDigitou = c.digitado_por_nome === usuario.nome
              return (
                <li key={c.id} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 py-2.5 text-sm">
                  <span className="min-w-0 flex-1 basis-56">
                    <span className="block">{c.contraparte}</span>
                    <span className="text-muted-foreground block text-xs">
                      {c.categoria} · {c.origem} · digitou {voceDigitou ? 'você' : c.digitado_por_nome}
                      {c.conferencias.length > 0 && ` · conferiu ${c.conferencias.map((x) => x.nome).join(' e ')}`}
                    </span>
                    {c.alerta && (
                      <span className="text-warning-foreground flex items-center gap-1 text-xs">
                        <WarningIcon weight="fill" className="text-warning shrink-0" /> {c.alerta}
                      </span>
                    )}
                    {c.lancar_no_erp && <span className="text-muted-foreground block text-xs">em “lançar no {e.erp.provedor}”</span>}
                  </span>
                  <Badge variant={c.etapa === 'capturada' ? 'destaque' : c.etapa === 'paga' ? 'sucesso' : c.etapa === 'recusada' ? 'erro' : 'outline'}>{rotuloEtapa[c.etapa]}</Badge>
                  <span className={cn('w-14 text-right text-xs', contaAberta(c) && diasAte(c.vencimento) < 0 ? 'text-destructive' : 'text-muted-foreground')}>{quando(c.vencimento)}</span>
                  <span className="min-w-24 shrink-0 whitespace-nowrap text-right tabular-nums">{brl(c.valor)}</span>
                  {c.etapa === 'capturada' && (
                    <Button size="sm" variant="ghost" className="rounded-full" title={voceDigitou ? 'Você digitou: outra pessoa confere' : undefined} onClick={() => onEscolher(e.clienteId, 'aprovacoes')}>
                      {voceDigitou ? 'Outra pessoa confere' : 'Conferir'} <ArrowRightIcon />
                    </Button>
                  )}
                  {['capturada', 'conferida', 'em_lote', 'recusada'].includes(c.etapa) && (
                    <SePode ferramenta="conta_pagar.cancelar" alvo={{ cliente_id: e.clienteId }}>
                      <BotaoAcoes rotulo={`Ações de ${c.contraparte}`} acoes={[{ rotulo: 'Cancelar, com motivo', icone: <ProhibitIcon />, perigo: true, onSelecionar: () => void cancelar(c) }]} />
                    </SePode>
                  )}
                  <BotaoErp e={e} oque={c.contraparte} />
                </li>
              )
            })}
          </ul>
        )}
        <Regra>Quem digita não confere: a conferência é em Aprovações, por outra pessoa (acima de {brl(e.faixa1)}, analista e Gestor). Nenhum pagamento sai daqui: o lote vai ao cliente, que aprova no app.</Regra>
      </Caixa>
      {nova && <GavetaNovaConta e={e} onFechar={() => setNova(false)} />}
    </div>
  )
}

function GavetaNovaConta({ e, onFechar }: { e: EmpresaVista; onFechar: () => void }) {
  const executar = useAcao()
  const { usuario } = useSessao()
  const [r, setR] = useState({ fornecedor: '', valor: '', vencimento: '', categoria: 'Fornecedor eventual' })
  const [tentou, setTentou] = useState(false)
  const conhecido = e.fornecedores.some((f) => f.nome.toLowerCase() === r.fornecedor.trim().toLowerCase())
  const erro = !r.fornecedor.trim() ? 'Informe o fornecedor.' : !(Number(r.valor) > 0) ? 'O valor precisa ser maior que zero.' : !r.vencimento ? 'Informe o vencimento.' : undefined
  return (
    <GavetaFormulario
      aberta
      onFechar={onFechar}
      titulo="Lançar conta a pagar"
      descricao={`${e.nome} · você digita (${usuario.nome}); outra pessoa confere em Aprovações.`}
      acao="Lançar"
      onAcao={() => {
        setTentou(true)
        if (erro) return
        const ok = executar(() => {
          if (!conhecido) repos.bpo.fornecedores.criar({ cliente_id: e.clienteId, nome: r.fornecedor.trim(), risco: 'novo', banco: 'a confirmar por segundo canal' })
          return repos.bpo.contas.capturar({ cliente_id: e.clienteId, contraparte: r.fornecedor.trim(), categoria: r.categoria, valor: Number(r.valor), vencimento: r.vencimento, origem: 'lançada à mão', lancar_no_erp: e.erp.modo === 'E2', alerta: conhecido ? null : 'fornecedor novo: confirmar os dados bancários por segundo canal antes do lote' })
        }, { sucesso: 'Conta lançada: outra pessoa confere em Aprovações' })
        if (ok) onFechar()
      }}
    >
      <Campo rotulo="Fornecedor" erro={tentou && !r.fornecedor.trim() ? 'Informe o fornecedor.' : undefined} ajuda={r.fornecedor.trim() && !conhecido ? 'Fornecedor novo: os dados bancários só valem confirmados por segundo canal.' : undefined}>
        {(id) => <CampoTexto id={id} valor={r.fornecedor} onMudar={(v) => setR((x) => ({ ...x, fornecedor: v }))} />}
      </Campo>
      <div className="grid grid-cols-2 gap-2">
        <Campo rotulo="Valor (R$)" erro={tentou && !(Number(r.valor) > 0) ? 'Maior que zero.' : undefined}>{(id) => <CampoTexto id={id} tipo="number" valor={r.valor} onMudar={(v) => setR((x) => ({ ...x, valor: v }))} />}</Campo>
        <Campo rotulo="Vencimento" erro={tentou && !r.vencimento ? 'Obrigatório.' : undefined}>{(id) => <CampoTexto id={id} tipo="date" valor={r.vencimento} onMudar={(v) => setR((x) => ({ ...x, vencimento: v }))} />}</Campo>
      </div>
      <Campo rotulo="Categoria">{(id) => <CampoTexto id={id} valor={r.categoria} onMudar={(v) => setR((x) => ({ ...x, categoria: v }))} />}</Campo>
    </GavetaFormulario>
  )
}

/* ---------- Contas a receber e cobrança ---------- */

export function SecaoReceber({ e, onEscolher }: { e: EmpresaVista; onEscolher: Ir }) {
  const executar = useAcao()
  const pedir = usePedirBpo()
  const podeEditar = usePode('bpo.perfil.editar', { cliente_id: e.clienteId })
  if (!e.perfil.escopo.includes('receber'))
    return (
      <Caixa>
        <EstadoVazio
          titulo="Contas a receber fora do escopo"
          descricao={`O BPO de ${e.nome} cuida de ${e.perfil.escopo.map((x) => ({ pagar: 'contas a pagar', receber: 'contas a receber', conciliacao: 'conciliação', gerencial: 'gerencial' })[x]).join(', ')}. O cliente cobra os clientes dele pelo ERP ou pelo canal que já usa.`}
          acao={
            podeEditar && (
              <Button size="sm" variant="outline" className="rounded-full" onClick={() => onEscolher(e.clienteId, 'carteira')}>
                Editar o escopo na ficha
              </Button>
            )
          }
        />
      </Caixa>
    )
  const lista = [...e.receber].sort((a, b) => a.vencimento.localeCompare(b.vencimento))
  const atrasadas = lista.filter((c) => c.etapa === 'atrasada')
  const abertas = lista.filter((c) => c.etapa === 'aberta')
  const recebidas = lista.filter((c) => c.etapa === 'recebida')
  const credito = (c: BpoConta) => e.transacoes.find((t) => t.valor > 0 && Math.abs(t.valor - c.valor) < 0.01)
  return (
    <Caixa>
      <TituloBloco
        descricao="O integrante Contas a Receber acompanha os vencimentos e prepara o lembrete amigável; a cobrança firme é de uma pessoa (Atendimento)."
        acao={
          atrasadas.length > 0 && (
            <SePode ferramenta="conta_receber.cobrar" alvo={{ cliente_id: e.clienteId }}>
              <Button
                size="sm"
                variant="outline"
                className="rounded-full"
                onClick={() =>
                  pedir({
                    integrante: 'i-bpo-receber',
                    titulo: `Lembrete aos ${atrasadas.length} atrasados de ${e.nome}`,
                    cliente: e.nome,
                    inicio: `Vou preparar um lembrete amigável aos ${atrasadas.length} clientes em atraso de ${e.nome}. O Atendimento envia; cobrança firme é de uma pessoa.`,
                    etapas: ['Lendo os vencidos no ERP', 'Escrevendo o lembrete no tom da empresa', 'Passando ao Atendimento'],
                    fim: { texto: `Lembretes prontos e enviados pelo Atendimento (régua amigável). Ninguém recebeu cobrança firme.`, aviso: `Contas a Receber preparou lembretes de ${e.nome}` },
                    efeito: { tipo: 'cobrar', clienteId: e.clienteId },
                  })
                }
              >
                Pedir ao Contas a Receber: lembrete aos atrasados
              </Button>
            </SePode>
          )
        }
      >
        Contas a receber e cobrança
      </TituloBloco>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Numero valor={brl(abertas.reduce((s, c) => s + c.valor, 0))} rotulo="a receber" detalhe={`${abertas.length} título${abertas.length === 1 ? '' : 's'}`} />
        <Numero valor={brl(atrasadas.reduce((s, c) => s + c.valor, 0))} rotulo="em atraso" detalhe={`${atrasadas.length} título${atrasadas.length === 1 ? '' : 's'}`} />
        <Numero valor={brl(recebidas.reduce((s, c) => s + c.valor, 0))} rotulo="recebido no mês" detalhe="baixa no extrato" />
      </div>
      {lista.length === 0 ? (
        <EstadoVazio compacto titulo="Nenhum título a receber" descricao={`Os títulos vêm do ${e.erp.provedor} na sincronização.`} />
      ) : (
        <ul className="divide-border/70 flex flex-col divide-y" aria-label="Contas a receber">
          {lista.map((c) => {
            const t = c.etapa !== 'recebida' ? credito(c) : undefined
            return (
              <li key={c.id} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 py-2.5 text-sm">
                <span className="min-w-0 flex-1 basis-56">
                  <span className="block">{c.contraparte}</span>
                  <span className="text-muted-foreground block text-xs">
                    {c.categoria} · vence {dataCurta(c.vencimento)}
                    {c.etapa === 'atrasada' && ` · ${-diasAte(c.vencimento)} dias de atraso`}
                  </span>
                  {c.alerta && <span className="text-muted-foreground block text-xs">{c.alerta}</span>}
                  {t && <span className="text-success block text-xs">o extrato tem {t.descricao} ({brl(t.valor)}): pode ser este</span>}
                </span>
                <Badge variant={c.etapa === 'atrasada' ? 'erro' : c.etapa === 'recebida' ? 'sucesso' : 'outline'}>{rotuloEtapa[c.etapa]}</Badge>
                <span className="min-w-24 shrink-0 whitespace-nowrap text-right tabular-nums">{brl(c.valor)}</span>
                {c.etapa !== 'recebida' && (
                  <SePode ferramenta="conta_receber.baixar" alvo={{ cliente_id: e.clienteId }}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full"
                      onClick={() =>
                        executar(() => {
                          if (t) conciliacaoOperacao.conciliar(t.id, c.categoria)
                          return repos.bpo.contas.marcarPaga(c.id)
                        }, { sucesso: t ? `Baixa de ${c.contraparte} com o extrato (conciliado)` : `Baixa de ${c.contraparte} registrada` })
                      }
                    >
                      <CheckIcon /> {t ? 'Baixar com o extrato' : 'Dar baixa'}
                    </Button>
                  </SePode>
                )}
              </li>
            )
          })}
        </ul>
      )}
      <Regra>Emitir boleto e Pix pela subconta da empresa é de fase posterior (10, 3.10, B13); até lá, o cliente do cliente é cobrado pelo {e.erp.modo === 'E3' ? 'canal que a empresa já usa' : e.erp.provedor}. A baixa entra na conciliação.</Regra>
    </Caixa>
  )
}

/* ---------- Conciliação bancária (Open Finance simulado) ---------- */

export function SecaoConciliacao({ e }: { e: EmpresaVista }) {
  const executar = useAcao()
  const loja = useLoja()
  const abrir = useAbrirErp()
  const pedir = usePedirOperacao()
  const trabalhando = useTrabalhandoEm()
  const todas = useExtratoCompleto(e.clienteId)
  const tTrans = useTabela('bpo_transacao')
  const [estado, setEstado] = useState<{ carregando?: string; erro?: string; demo?: string }>({})
  const conciliadas = todas.filter((t) => t.situacao === 'conciliada').sort((a, b) => String(b.extras?.conciliada_em ?? b.atualizado_em).localeCompare(String(a.extras?.conciliada_em ?? a.atualizado_em))).slice(0, 8)
  const buscar = async () => {
    setEstado({ carregando: 'Lendo o extrato pelo Open Finance…' })
    try {
      const r = await servicos.openFinance.transacoes(`consent-${e.clienteId}`)
      const n = conciliacaoOperacao.importarExtrato(e.clienteId, proximoExtrato(e, tTrans), 'Open Finance (demonstração)')
      for (const b of e.bancos.filter((x) => x.via === 'open_finance' || x.via === 'api_banco')) repos.bpo.bancos.atualizar(b.id, { saldo_em: agoraBpo() }, { ferramenta: 'extrato.buscar', texto: `Saldo de ${b.nome} relido` })
      setEstado({ demo: r.fonte })
      loja.toast(n ? `${n} lançamento${n > 1 ? 's' : ''} novo${n > 1 ? 's' : ''} no extrato de ${e.nome}` : `Extrato de ${e.nome} em dia: nada novo desde a última leitura`)
    } catch (err) {
      setEstado({ erro: err instanceof ErroServico ? err.message : 'O banco não respondeu.' })
    }
  }
  const seguras = e.transacoes.filter((t) => t.confianca === 'alta')
  return (
    <div className="flex flex-col gap-4">
      <Caixa>
        <TituloBloco
          descricao="Saldos e extrato lidos com o consentimento do cliente (Open Finance ou API do banco). A plataforma nunca inicia pagamento."
          acao={
            e.bancos.some((b) => b.via === 'open_finance' || b.via === 'api_banco') && (
              <SePode ferramenta="extrato.buscar" alvo={{ cliente_id: e.clienteId }}>
                <Button size="sm" variant="outline" className="rounded-full" disabled={!!estado.carregando} onClick={() => void buscar()}>
                  <ArrowsClockwiseIcon /> Buscar o extrato agora
                </Button>
              </SePode>
            )
          }
        >
          Bancos
        </TituloBloco>
        <EstadoServico estado={estado} onTentar={() => void buscar()} />
        {e.bancos.length === 0 ? (
          <EstadoVazio compacto icone={BankIcon} titulo="Nenhum banco conectado" descricao="Conecte por Open Finance na Configuração do BPO (o cliente dá o consentimento no banco dele)." />
        ) : (
          <ul className="divide-border/70 flex flex-col divide-y">
            {e.bancos.map((b) => {
              const vence = b.consentimento_ate ? diasAte(b.consentimento_ate) : null
              return (
                <li key={b.id} className="flex flex-wrap items-center gap-3 py-2 text-sm">
                  <BankIcon className="text-muted-foreground size-5 shrink-0" weight="duotone" />
                  <span className="min-w-0 flex-1 basis-48">
                    <span className="block truncate">{b.nome}</span>
                    <span className="text-muted-foreground block text-xs">
                      {b.via === 'open_finance' ? 'Open Finance' : b.via === 'api_banco' ? 'API do banco' : b.via === 'ofx' ? 'arquivo OFX' : 'lançado à mão'} · lido {dataHora(b.saldo_em)}
                      {vence !== null && <span className={cn(vence <= 30 && 'text-warning-foreground')}> · consentimento até {dataCurta(b.consentimento_ate)}</span>}
                    </span>
                  </span>
                  <span className={cn('tabular-nums', b.saldo < 0 && 'text-destructive')}>{brl(b.saldo)}</span>
                </li>
              )
            })}
          </ul>
        )}
      </Caixa>
      <Caixa>
        <TituloBloco
          descricao={e.erp.modo === 'E1' ? `O extrato contra o espelho do ${e.erp.provedor}: conciliar manda a baixa ao ERP por comando, que relê.` : e.erp.modo === 'E2' ? `O ${e.erp.provedor} não recebe a baixa sozinho: o que você conciliar vai para “lançar no ERP”.` : 'Livro próprio: conciliar já dá a baixa.'}
          acao={
            seguras.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                className="rounded-full"
                disabled={trabalhando(`conciliar:${e.clienteId}`)}
                onClick={() =>
                  pedir({
                    integrante: 'i-bpo-conciliacao',
                    titulo: `Conciliar o extrato de ${e.nome}`,
                    cliente: e.nome,
                    inicio: 'Vou casar o extrato com o espelho do ERP pelas regras aprovadas; o que não casar fica para você conferir.',
                    etapas: ['Lendo o extrato do dia', 'Casando por regra aprovada (Pix por valor e CNPJ, crédito do provedor)', 'Separando o que precisa de conferência'],
                    fim: { texto: `Conciliei ${seguras.length} lançamento${seguras.length > 1 ? 's' : ''} por regra em ${e.nome}. O resto ficou para conferir.`, aviso: `Conciliação de ${e.nome} feita` },
                    efeito: { tipo: 'conciliar', clienteId: e.clienteId },
                  })
                }
              >
                {trabalhando(`conciliar:${e.clienteId}`) ? <CircleNotchIcon className="animate-spin" /> : null} Pedir à Conciliação
              </Button>
            )
          }
        >
          Conciliação do dia
        </TituloBloco>
        <PendentesConciliacao
          transacoes={e.transacoes.map((t) => ({ id: t.id, data: dataCurta(t.data), conta: t.conta, descricao: t.descricao, valor: t.valor, sugestao: t.sugestao, confianca: t.confianca }))}
          categorias={categoriasBpo}
          onConfirmar={(id, cat) => executar(() => conciliacaoOperacao.conciliar(id, cat), { sucesso: e.erp.modo === 'E2' ? `Conciliado; a baixa vai para “lançar no ${e.erp.provedor}”` : 'Conciliado' })}
          onAceitarSeguras={() =>
            executar(() => {
              for (const t of seguras) conciliacaoOperacao.conciliar(t.id, t.sugestao)
              return true
            }, { sucesso: e.erp.modo === 'E1' ? `Sugestões seguras aceitas; as baixas foram ao ${e.erp.provedor}` : 'Sugestões seguras aceitas' })
          }
          abrirExterno={{ rotulo: e.erp.modo === 'E3' ? 'Abrir no livro próprio' : `Abrir no ${e.erp.provedor}`, onAbrir: (t) => void abrir(e, t.descricao) }}
        />
        {conciliadas.length > 0 && (
          <>
            <span className="text-muted-foreground pt-2 text-xs">Conciliadas por último</span>
            <ul className="divide-border/70 flex flex-col divide-y" aria-label="Conciliadas">
              {conciliadas.map((t) => {
                const b = baixaDe(t)
                return (
                  <li key={t.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 text-sm">
                    <span className="min-w-0 flex-1 basis-48">
                      <span className="block truncate font-mono text-xs">{t.descricao}</span>
                      <span className="text-muted-foreground block text-xs">
                        {dataCurta(t.data)} · {t.categoria} · {t.conciliada_por}
                      </span>
                    </span>
                    <Badge variant={b === 'manual_pendente' ? 'destaque' : 'outline'}>{b === 'erp' ? `baixa no ${e.erp.provedor}` : b === 'manual_pendente' ? 'lançar no ERP' : b === 'manual_feita' ? 'lançada à mão' : 'conciliada'}</Badge>
                    <span className="min-w-24 shrink-0 whitespace-nowrap text-right tabular-nums">{brl(t.valor, true)}</span>
                    {b !== 'manual_feita' && (
                      <SePode ferramenta="conciliacao.confirmar" alvo={{ cliente_id: e.clienteId }}>
                        <Button size="icon-sm" variant="ghost" className="rounded-full" aria-label={`Desfazer a conciliação de ${t.descricao}`} title="Desfazer" onClick={() => executar(() => conciliacaoOperacao.desfazer(t.id), { sucesso: 'Conciliação desfeita: voltou para conferir' })}>
                          <ArrowCounterClockwiseIcon />
                        </Button>
                      </SePode>
                    )}
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </Caixa>
    </div>
  )
}

/* ---------- Lançamentos no ERP do cliente ---------- */

export function SecaoLancamentos({ e }: { e: EmpresaVista }) {
  const executar = useAcao()
  const erp = useAcoesErp(e)
  const eventos = useTabela('evento')
  const todas = useExtratoCompleto(e.clienteId)
  if (e.erp.modo === 'E3')
    return (
      <Caixa>
        <EstadoVazio titulo="Livro próprio: nada a levar a um ERP" descricao={`${e.nome} não usa ERP: lançamentos, contas e baixas nascem na plataforma (plano de contas gerencial).`} />
      </Caixa>
    )
  if (e.erp.modo === 'E1') {
    const comandos = eventos.filter((x) => x.cliente_id === e.clienteId && (x.ferramenta === 'erp.lancar' || x.ferramenta === 'erp.baixar' || x.ferramenta === 'erp.sincronizar')).sort((a, b) => b.criado_em.localeCompare(a.criado_em)).slice(0, 15)
    return (
      <Caixa>
        <TituloBloco descricao={`O ${e.erp.provedor} aceita escrita: cada lançamento e cada baixa é um comando tipado (erp.lancar, erp.baixar), relido no espelho. Conflito: vale o ERP.`}>Comandos ao {e.erp.provedor}</TituloBloco>
        {comandos.length === 0 ? (
          <EstadoVazio compacto titulo="Nenhum comando hoje" descricao="Concilie o extrato ou lance uma conta: o comando aparece aqui com quem mandou e quando." />
        ) : (
          <ol className="border-border/70 flex flex-col gap-2 border-l pl-3" aria-label="Comandos ao ERP">
            {comandos.map((c) => (
              <li key={c.id} className="text-sm">
                <span className="block">{c.texto}</span>
                <span className="text-muted-foreground text-xs">
                  {dataHora(noDiaDaDemo(c.criado_em))} · {c.ator_nome ?? c.ator_tipo} · {c.ferramenta}
                </span>
              </li>
            ))}
          </ol>
        )}
        <SeloDemonstracao fonte={`API do ${e.erp.provedor}`} />
      </Caixa>
    )
  }
  const baixas = todas.filter((t) => baixaDe(t) === 'manual_pendente').sort((a, b) => a.data.localeCompare(b.data))
  const contas = e.contas.filter((c) => c.lancar_no_erp && c.etapa !== 'cancelada')
  const feitas = todas.filter((t) => baixaDe(t) === 'manual_feita').sort((a, b) => String(b.extras?.baixa_em).localeCompare(String(a.extras?.baixa_em))).slice(0, 6)
  const total = baixas.length + contas.length
  return (
    <Caixa>
      <TituloBloco
        descricao={`O ${e.erp.provedor} não aceita escrita de terceiros (modo arquivo): uma pessoa lança no ERP do cliente e marca aqui. A baixa manual conta no SLA com a marca “manual”.`}
        acao={
          <SePode ferramenta="erp.sincronizar" alvo={{ cliente_id: e.clienteId }}>
            <Button size="sm" variant="outline" className="rounded-full" disabled={!!erp.estado.carregando} onClick={() => void erp.sincronizar()}>
              <ArrowsClockwiseIcon /> Importar o arquivo do dia
            </Button>
          </SePode>
        }
      >
        Lançar no {e.erp.provedor} {total > 0 && <span className="text-muted-foreground font-normal">· {total} para lançar</span>}
      </TituloBloco>
      <EstadoServico estado={erp.estado} onTentar={() => void erp.sincronizar()} />
      {total === 0 ? (
        <EstadoVazio compacto icone={CheckIcon} titulo={`Tudo lançado no ${e.erp.provedor}`} descricao="O espelho e o ERP batem até o último arquivo importado." />
      ) : (
        <ul className="divide-border/70 flex flex-col divide-y" aria-label={`Lançar no ${e.erp.provedor}`}>
          {contas.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center gap-3 py-2.5 text-sm">
              <span className="min-w-0 flex-1 basis-48">
                <span className="block">Conta a pagar: {c.contraparte}</span>
                <span className="text-muted-foreground block text-xs">
                  {c.categoria} · vence {dataCurta(c.vencimento)} · lançada na plataforma por {c.digitado_por_nome}
                </span>
              </span>
              <span className="min-w-24 shrink-0 whitespace-nowrap text-right tabular-nums">{brl(c.valor)}</span>
              <SePode ferramenta="erp.lancar" alvo={{ cliente_id: e.clienteId }}>
                <Button size="sm" variant="outline" className="rounded-full" onClick={() => executar(() => conciliacaoOperacao.marcarContaLancada(c.id), { sucesso: `${c.contraparte} lançada no ${e.erp.provedor}` })}>
                  <CheckIcon /> Lancei no {e.erp.provedor}
                </Button>
              </SePode>
            </li>
          ))}
          {baixas.map((t) => (
            <li key={t.id} className="flex flex-wrap items-center gap-3 py-2.5 text-sm">
              <span className="min-w-0 flex-1 basis-48">
                <span className="block font-mono text-xs">Baixa: {t.descricao}</span>
                <span className="text-muted-foreground block text-xs">
                  {dataCurta(t.data)} · {t.categoria} · conciliada por {t.conciliada_por}
                </span>
              </span>
              <span className="min-w-24 shrink-0 whitespace-nowrap text-right tabular-nums">{brl(t.valor, true)}</span>
              <SePode ferramenta="erp.baixar" alvo={{ cliente_id: e.clienteId }}>
                <Button size="sm" variant="outline" className="rounded-full" onClick={() => executar(() => conciliacaoOperacao.marcarBaixaLancada(t.id), { sucesso: `Baixa lançada no ${e.erp.provedor} (manual)` })}>
                  <CheckIcon /> Lancei no {e.erp.provedor}
                </Button>
              </SePode>
            </li>
          ))}
        </ul>
      )}
      {feitas.length > 0 && (
        <>
          <span className="text-muted-foreground pt-1 text-xs">Lançadas à mão por último</span>
          <ul className="flex flex-col gap-1 text-xs">
            {feitas.map((t) => (
              <li key={t.id} className="text-muted-foreground">
                {t.descricao} · manual · {String(t.extras?.baixa_por ?? '')}, {dataHora(String(t.extras?.baixa_em ?? ''))}
              </li>
            ))}
          </ul>
        </>
      )}
    </Caixa>
  )
}

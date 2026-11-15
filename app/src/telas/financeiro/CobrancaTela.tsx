import { ArrowClockwiseIcon, CalendarCheckIcon, CheckIcon, CopyIcon, FileArrowUpIcon, HandCoinsIcon, LinkIcon, MagnifyingGlassIcon, PauseIcon, ReceiptIcon, WarningIcon } from '@phosphor-icons/react'
import { useMemo, useState } from 'react'
import { useEfeitosCartao } from '@/ambiente/efeitos'
import { useLoja } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import { CartaoAprovacao } from '@/components/compostos/cartoes-chat'
import { BotaoAcoes, EstadoErro, EstadoVazio, SeloDemonstracao, useAcao, useConfirmar } from '@/components/kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Campo, CampoEscolha, CampoTexto, GavetaFormulario, Segmentado } from '@/components/ui/formulario'
import type { Cobranca, PassoRegua } from '@/nucleo/modelo/financeiro'
import { useItemNaRota } from '@/nucleo/rotas'
import { repos } from '@/nucleo/repositorios'
import { servicos as apis } from '@/servicos'
import { linhasDoMes } from './cartoes'
import { brl, CabecalhoFin, Caixa, CartoesDaAba, Nota, Numero, PaginaFin, Pergunta, SeloSituacao } from './comum'
import { EditarPassoRegua, ListaRegua } from './configuracao'
import { useFin, useIntegranteFin, usePodeFin, type Fin } from './dados'
import { atualizarValor, COMPETENCIA_ATUAL, dataCurta, diasDeAtraso, etapaDaRegua, HOJE, PROXIMA_COMPETENCIA, rotuloCompetencia, rotuloDia, rotuloMeio, somarDias } from './dominio'
import { DuasPilhas } from '@/components/kit/duas-pilhas'

const numero = (s: string) => Number(s.replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '')) || 0

/**
 * S07-T03 · Financeiro › Cobranças (09, 4.5 e 5; GES-001, 003 a 007, 009;
 * FIN-009 a 011): o lote do mês, as faturas (uma por mês, serviços em linhas,
 * uma NFS-e por serviço), devedores, recebimentos sem cobrança, a régua, as
 * notas do escritório e o provedor (banco do escritório, Pix Automático).
 */
export function CobrancaTela({ faturaInicial }: { faturaInicial?: string }) {
  const fin = useFin()
  const integrante = useIntegranteFin()
  const pode = usePodeFin('cobranca.segunda_via')
  const podeLote = usePodeFin('faturamento.preparar_lote')
  const podeVincular = usePodeFin('recebimento.vincular')
  const [aberta, setAberta] = useState<string | undefined>(faturaInicial)
  const [comp, setComp] = useState<string>(COMPETENCIA_ATUAL)
  const [filtro, setFiltro] = useState<'todas' | 'abertas' | 'vencidas' | 'pagas'>('todas')
  const [busca, setBusca] = useState('')
  useItemNaRota({ fatura: aberta })
  const competencias = useMemo(() => [...new Set(fin.cobrancas.map((c) => c.competencia))].sort().reverse(), [fin.cobrancas])
  const daComp = fin.cobrancas.filter((c) => comp === 'todas' || c.competencia === comp)
  const lista = daComp
    .filter((c) => (filtro === 'todas' ? true : filtro === 'abertas' ? ['a_vencer', 'vencida', 'em_acordo', 'aguardando_confirmacao'].includes(fin.situacao(c)) : filtro === 'vencidas' ? fin.situacao(c) === 'vencida' : fin.situacao(c) === 'paga'))
    .filter((c) => !busca || fin.nomeCliente(c.cliente_id).toLowerCase().includes(busca.toLowerCase()) || c.numero.toLowerCase().includes(busca.toLowerCase()))
  const vencidas = fin.cobrancas.filter((c) => fin.situacao(c) === 'vencida' || c.situacao === 'em_acordo')
  const soma = (xs: Cobranca[]) => xs.reduce((s, c) => s + c.valor, 0)
  const doMes = fin.cobrancas.filter((c) => c.competencia === COMPETENCIA_ATUAL && c.situacao !== 'cancelada' && c.situacao !== 'substituida')
  const lote = fin.lotes.find((l) => l.competencia === PROXIMA_COMPETENCIA)
  const fatura = fin.cobrancas.find((c) => c.id === aberta)
  const preparando = integrante.fazendo('lote')

  const prepararLote = () => {
    const clientes = fin.contratos.filter((c) => c.situacao === 'ativo')
    let total = 0
    let decimos = 0
    for (const c of clientes) {
      const { linhas } = linhasDoMes(c.cliente_id, PROXIMA_COMPETENCIA)
      total += linhas.reduce((s, l) => s + l.valor, 0)
      if (linhas.some((l) => l.tipo === 'decimo')) decimos++
    }
    const novo = repos.lotesFaturamento.criar({ competencia: PROXIMA_COMPETENCIA, situacao: 'preparado', quantidade: clientes.length, total, decimos, avulsos: fin.avulsos.filter((a) => a.situacao === 'a_faturar').length, excecoes: fin.semContrato.map((c) => ({ cliente_id: c.id, motivo: 'sem contrato estruturado' })), mudancas: [`${decimos} contrato(s) com 13º`], cartao_id: null })
    integrante.trabalhar({
      id: 'lote',
      titulo: `Preparar o lote de ${rotuloCompetencia(PROXIMA_COMPETENCIA)}`,
      inicio: `Preparando as cobranças de ${rotuloCompetencia(PROXIMA_COMPETENCIA)} com os contratos vigentes, os extras aceitos e os reembolsos conferidos.`,
      etapas: [`Lendo ${clientes.length} contratos vigentes`, 'Somando extras e reembolsos', 'Separando os serviços em linhas e as notas por serviço', 'Conferindo contra o mês anterior'],
      fim: `Lote pronto: ${clientes.length} cobranças, ${brl(total)}. Quem tem contabilidade e BPO recebe uma cobrança só, com os serviços em linhas e uma NFS-e por serviço.`,
      aviso: `Financeiro: lote de ${rotuloCompetencia(PROXIMA_COMPETENCIA)} pronto para aprovar`,
      cartao: {
        id: `lote-${novo.id}`,
        acao: { tipo: 'lote', lote_id: novo.id },
        resumo: `Gerar as cobranças de ${rotuloCompetencia(PROXIMA_COMPETENCIA)} com NFS-e`,
        argumentos: [
          { rotulo: 'Clientes', valor: String(clientes.length) },
          { rotulo: 'Total', valor: brl(total) },
          { rotulo: 'Exceções', valor: String(fin.semContrato.length) },
        ],
        texto: '',
        aba: 'cobranca',
        alcada: 'gestor',
        ferramenta: 'aprovacao.decidir_lote',
      },
    })
  }

  return (
    <PaginaFin fin={fin}>
      <CabecalhoFin
        titulo="Cobranças"
        exportar="faturas"
        status={vencidas.length ? `${vencidas.length} fatura(s) fora do prazo; a régua segue sozinha até D+3 e me pede você a partir do D+10` : 'Tudo em dia; a régua roda sozinha'}
        sub={`${rotuloCompetencia(COMPETENCIA_ATUAL)} · uma cobrança por cliente, serviços em linhas, uma NFS-e por serviço · ${fin.politica?.provedor.nome ?? ''}`}
      >
        {podeLote && !lote && (
          <Button size="sm" className="rounded-full" disabled={preparando} onClick={prepararLote}>
            <CalendarCheckIcon /> {preparando ? 'O Financeiro está preparando…' : `Preparar o lote de ${rotuloCompetencia(PROXIMA_COMPETENCIA)}`}
          </Button>
        )}
      </CabecalhoFin>

      <CartoesDaAba fin={fin} aba="cobranca" />

      <Caixa>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          <Numero valor={brl(soma(doMes))} rotulo={`emitido em ${rotuloCompetencia(COMPETENCIA_ATUAL)}`} detalhe={`${doMes.length} cobranças de exemplo`} />
          <Numero valor={brl(soma(doMes.filter((c) => c.situacao === 'paga')))} rotulo="recebido" detalhe={`${doMes.filter((c) => c.situacao === 'paga').length} pagas`} />
          <Numero valor={brl(soma(doMes.filter((c) => fin.situacao(c) === 'a_vencer' || fin.situacao(c) === 'aguardando_confirmacao')))} rotulo="a vencer" />
          <Numero valor={brl(soma(vencidas))} rotulo="vencido" detalhe={`${vencidas.length} fatura(s)`} />
          <Numero valor={`${fin.politica?.provedor.autorizacoes_pix ?? 0}`} rotulo="autorizações de Pix Automático" detalhe={fin.politica?.provedor.nome} />
        </div>
      </Caixa>

      {lote && <BlocoLote fin={fin} lote={lote} />}

      <Caixa>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="flex-1 text-sm font-medium">Faturas</h2>
          <span className="relative">
            <MagnifyingGlassIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <input aria-label="Buscar fatura ou cliente" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Cliente ou número" className="bg-sunken/60 h-8 w-44 rounded-full pr-3 pl-8 text-sm outline-none" />
          </span>
          <CampoEscolha rotulo="Competência" valor={comp} onMudar={setComp} opcoes={[...competencias.map((c) => ({ valor: c, rotulo: rotuloCompetencia(c) })), { valor: 'todas', rotulo: 'todas' }]} />
          <Segmentado
            rotulo="Situação"
            valor={filtro}
            onMudar={setFiltro}
            opcoes={[
              { valor: 'todas', rotulo: 'Todas' },
              { valor: 'abertas', rotulo: 'Em aberto' },
              { valor: 'vencidas', rotulo: 'Vencidas' },
              { valor: 'pagas', rotulo: 'Pagas' },
            ]}
          />
        </div>
        {!daComp.length ? (
          <EstadoVazio compacto icone={ReceiptIcon} titulo={`Nenhuma cobrança em ${rotuloCompetencia(comp)}`} descricao="Prepare o lote do mês: o integrante monta as cobranças a partir dos contratos e você aprova." />
        ) : (
          <ul className="divide-border/70 flex flex-col divide-y">
            {lista.map((c) => {
              const s = fin.situacao(c)
              const notas = fin.notas.filter((n) => n.cobranca_id === c.id && n.situacao !== 'substituida')
              const servicosLinha = c.linhas.filter((l) => l.tipo === 'item').length
              return (
                <li key={c.id}>
                  <button type="button" onClick={() => setAberta(c.id)} className="hover:bg-sunken/60 -mx-2 grid w-[calc(100%+1rem)] cursor-pointer grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 rounded-md px-2 py-2.5 text-left text-sm md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(8rem,max-content)_minmax(10rem,max-content)]">
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{fin.nomeCliente(c.cliente_id)}</span>
                      <span className="text-muted-foreground block text-xs">
                        {c.numero} · {rotuloCompetencia(c.competencia)} · {rotuloMeio[c.meio]}
                        {c.origem !== 'lote' && ` · ${c.origem}`}
                      </span>
                    </span>
                    <span className="text-muted-foreground col-span-2 row-start-2 text-xs md:col-span-1 md:col-start-2 md:row-start-1">
                      {servicosLinha} serviço(s), {notas.filter((n) => n.situacao === 'emitida').length} NFS-e
                      {notas.some((n) => n.situacao === 'rejeitada') && <span className="text-destructive-text"> · NFS-e rejeitada</span>}
                      {c.regua_pausada_ate && ` · régua pausada até ${dataCurta(c.regua_pausada_ate)}`}
                    </span>
                    <span className="text-right md:col-start-3">
                      <span className="block tabular-nums">{brl(c.valor, true)}</span>
                      <span className="text-muted-foreground block text-xs">vence {dataCurta(c.vencimento)}</span>
                    </span>
                    <span className="hidden justify-end md:flex">
                      <SeloSituacao s={s} />
                    </span>
                  </button>
                </li>
              )
            })}
            {!lista.length && <li className="text-muted-foreground py-3 text-sm">Nenhuma fatura com esse filtro.</li>}
          </ul>
        )}
      </Caixa>

      {/* Duas pilhas pelo topo (F-1): quem deve e a régua; o que entrou sem cobrança e as notas. */}
      <DuasPilhas
        esquerda={
          <>
            <Devedores fin={fin} pode={pode} onAbrir={setAberta} />
            <Regua fin={fin} />
          </>
        }
        direita={
          <>
            <RecebimentosSoltos fin={fin} pode={podeVincular} />
            <NotasEscritorio fin={fin} pode={pode} />
          </>
        }
      />
      <Provedor fin={fin} />

      {fatura && <DetalheFatura fin={fin} c={fatura} pode={pode} onFechar={() => setAberta(undefined)} />}
    </PaginaFin>
  )
}

/** S07-A13 · Lote do mês: o que mudou, 13º, exceções; aprovar emite cobranças e NFS-e. */
function BlocoLote({ fin, lote }: { fin: Fin; lote: Fin['lotes'][number] }) {
  const loja = useLoja()
  const efeitos = useEfeitosCartao()
  const decidido = lote.cartao_id ? loja.estado.decisoes[lote.cartao_id] : undefined
  const cartaoS07 = fin.pendentes.find((c) => (c.argumentos as { lote_id?: string }).lote_id === lote.id)
  return (
    <Caixa>
      <Pergunta descricao={`${lote.quantidade} cobranças · ${brl(lote.total)} · ${lote.decimos} com 13º · ${lote.avulsos} extras${lote.agregado ? ` · ${lote.agregado.clientes} clientes da carteira entram só nos totais` : ''}`}>Lote de {rotuloCompetencia(lote.competencia)}</Pergunta>
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-2 text-sm">
          <h3 className="text-muted-foreground text-xs">O que mudou desde o mês anterior</h3>
          <ul className="flex flex-col gap-1">
            {lote.mudancas.map((m) => (
              <li key={m}>· {m}</li>
            ))}
          </ul>
          {lote.excecoes.length > 0 && (
            <>
              <h3 className="text-muted-foreground mt-1 text-xs">Fora do lote (exceções)</h3>
              <ul className="flex flex-col gap-1">
                {lote.excecoes.map((e) => (
                  <li key={e.cliente_id} className="flex items-start gap-1.5">
                    <WarningIcon className="text-warning mt-0.5 size-3.5 shrink-0" weight="fill" /> {fin.nomeCliente(e.cliente_id)}: {e.motivo}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
        <div>
          {lote.situacao === 'preparado' && lote.cartao_id && !decidido && (
            <CartaoAprovacao cartao={{ tipo: 'aprovacao', id: lote.cartao_id, resumo: `Gerar as cobranças de ${rotuloCompetencia(lote.competencia)} com NFS-e`, argumentos: [{ rotulo: 'Clientes', valor: String(lote.quantidade) }, { rotulo: 'Total', valor: brl(lote.total) }, { rotulo: 'Saem em', valor: `01/${lote.competencia.slice(5)} às 06:00` }], expiraEm: 'expira em 5 dias' }} onDecidir={(d) => efeitos(lote.cartao_id!, d)} />
          )}
          {lote.situacao === 'preparado' && cartaoS07 && <Nota>O cartão do lote está no topo da aba e no chat do Financeiro.</Nota>}
          {lote.situacao === 'preparado' && !lote.cartao_id && !cartaoS07 && <Nota>O integrante está terminando de montar o lote…</Nota>}
          {lote.situacao !== 'preparado' && <Nota tom="ok">{lote.situacao === 'parcial' ? 'Emitido em parte: as exceções ficaram de fora até alguém resolver.' : 'Emitido: boletos, Pix e NFS-e saíram; a régua acompanha cada um.'}</Nota>}
          {decidido === 'recusar' && <Nota tom="alerta">Lote recusado: nada saiu. Peça ao integrante para preparar de novo depois de ajustar.</Nota>}
        </div>
      </div>
    </Caixa>
  )
}

/** S07-A14 a A19, A22, A23 · Fatura aberta: linhas, notas, parcelas, régua, histórico e as ações (as irreversíveis por cartão). */
function DetalheFatura({ fin, c, pode, onFechar }: { fin: Fin; c: Cobranca; pode: boolean; onFechar: () => void }) {
  const executar = useAcao()
  const confirmar = useConfirmar()
  const integrante = useIntegranteFin()
  const loja = useLoja()
  const { usuario } = useSessao()
  const [modal, setModal] = useState<'segunda' | 'pagamento' | 'substituir' | 'acordo' | null>(null)
  const s = fin.situacao(c)
  const notas = fin.notas.filter((n) => n.cobranca_id === c.id)
  const parcelas = fin.parcelas.filter((p) => p.cobranca_id === c.id).sort((a, b) => a.numero - b.numero)
  const atraso = diasDeAtraso(c)
  const regua = fin.politica ? etapaDaRegua(c, fin.politica) : undefined
  const aberto = ['a_vencer', 'vencida', 'aguardando_confirmacao', 'em_acordo'].includes(s)
  const formal = fin.politica?.regua.find((p) => p.tom === 'formal')?.dias ?? 30
  const pausa = fin.politica?.regua.find((p) => p.tom === 'pausa')?.dias ?? 45
  const cartao = (id: string, acao: Parameters<typeof integrante.pedirCartao>[0]['acao'], resumo: string, argumentos: { rotulo: string; valor: string }[], texto: string, alcada: 'gestor' | 'administrador', ferramenta: string) =>
    integrante.pedirCartao({ id: `${id}-${c.id}`, acao, resumo: `${resumo} · ${fin.nomeCliente(c.cliente_id)}`, argumentos, texto, aba: 'cobranca', alcada, ferramenta, destino: { modulo: 'financeiro', aba: 'cobranca', fatura: c.id }, cliente_id: c.cliente_id })
  const acoes = [
    { rotulo: '2ª via atualizada', motivo: !aberto ? 'fatura sem saldo em aberto' : undefined, onSelecionar: () => setModal('segunda') },
    { rotulo: 'Registrar pagamento fora do provedor', motivo: !aberto ? 'fatura sem saldo em aberto' : undefined, onSelecionar: () => setModal('pagamento') },
    { rotulo: 'Propor acordo', motivo: s !== 'vencida' ? 'só para fatura vencida' : undefined, onSelecionar: () => setModal('acordo') },
    {
      rotulo: c.regua_pausada_ate ? 'Retomar a régua' : 'Pausar a régua (contestação)',
      motivo: !aberto ? 'fatura sem saldo em aberto' : undefined,
      separar: true,
      onSelecionar: async () => {
        if (c.regua_pausada_ate) return executar(() => repos.cobrancas.anotar(c.id, `${usuario.nome} retomou a régua`, { regua_pausada_ate: null, regua_pausa_motivo: null }, { ferramenta: 'cobranca.pausar_regua' }), { sucesso: 'Régua retomada.' })
        const motivo = await confirmar({ titulo: 'Pausar a régua desta fatura?', descricao: 'O cliente contestou (no app ou na conversa). A régua para até alguém resolver; a contestação vira tarefa do Financeiro.', acao: 'Pausar', exigirMotivo: true, rotuloMotivo: 'O que o cliente contestou' })
        if (typeof motivo === 'string') executar(() => repos.cobrancas.anotar(c.id, `Régua pausada por contestação: ${motivo}`, { regua_pausada_ate: somarDias(HOJE, 10), regua_pausa_motivo: `contestação: ${motivo}` }, { ferramenta: 'cobranca.pausar_regua' }), { sucesso: 'Régua pausada por 10 dias; o cliente foi avisado.' })
      },
    },
    {
      rotulo: 'Mandar a cobrança firme (D+10)',
      motivo: atraso < 10 ? `a partir de D+10 (hoje ${rotuloDia(atraso)})` : c.regua_etapa === 'D+10' ? 'já enviada' : undefined,
      onSelecionar: () => cartao('firme', { tipo: 'regua_firme', cobranca_id: c.id }, 'Mandar a cobrança firme (D+10)', [{ rotulo: 'Atraso', valor: `${atraso} dias` }, { rotulo: 'Canal', valor: 'WhatsApp e e-mail' }, { rotulo: 'Para', valor: 'financeiro e sócio' }], 'A fatura chegou ao D+10. A mensagem firme vai ao financeiro e ao sócio do cliente, pelo número de Gestão e Atendimento; pré-visualize e aprove.', 'gestor', 'cobranca.pausar_regua'),
    },
    {
      rotulo: 'Aviso formal (D+30)',
      motivo: atraso < formal ? `a partir de D+${formal}` : c.aviso_formal_em ? 'já enviado' : undefined,
      onSelecionar: () => cartao('formal', { tipo: 'aviso_formal', cobranca_id: c.id }, 'Enviar o aviso formal', [{ rotulo: 'Atraso', valor: `${atraso} dias` }, { rotulo: 'Prazo', valor: '10 dias' }, { rotulo: 'Pausa em', valor: dataCurta(somarDias(c.vencimento, pausa)) }], 'Preparei o aviso formal com prazo de regularização e a data da pausa parcial. Documentos e obrigações nunca são retidos.', 'administrador', 'suspensao.aplicar'),
    },
    {
      rotulo: 'Pausa parcial (D+45)',
      motivo: atraso < pausa ? `a partir de D+${pausa}` : c.pausa_parcial_em ? 'já aplicada' : !c.aviso_formal_em ? 'precisa do aviso formal antes' : undefined,
      onSelecionar: () => cartao('pausa', { tipo: 'pausa_parcial', cobranca_id: c.id }, 'Aplicar a pausa parcial', [{ rotulo: 'Em espera', valor: 'pedidos novos e extras' }, { rotulo: 'Continua', valor: 'obrigações, guias, documentos' }, { rotulo: 'Reativa', valor: 'sozinha, com o pagamento' }], 'O aviso formal venceu sem pagamento. A pausa parcial põe em espera só os pedidos novos e os extras; a faixa no app explica.', 'administrador', 'suspensao.aplicar'),
    },
    { rotulo: 'Substituir (valor ou vencimento)', motivo: !aberto ? 'fatura sem saldo em aberto' : undefined, separar: true, onSelecionar: () => setModal('substituir') },
    {
      rotulo: 'Cancelar',
      perigo: true,
      motivo: !aberto ? 'fatura sem saldo em aberto' : undefined,
      onSelecionar: async () => {
        const motivo = await confirmar({ titulo: `Cancelar a ${c.numero}?`, descricao: 'Cancelar é sempre cartão (09, 8.2): o integrante prepara, uma pessoa aprova. As NFS-e são canceladas junto, e a cobrança sai do contas a receber.', acao: 'Preparar o cartão', perigo: true, exigirMotivo: true })
        if (typeof motivo === 'string') cartao('cancelar', { tipo: 'cancelar_cobranca', cobranca_id: c.id, motivo }, `Cancelar a ${c.numero}`, [{ rotulo: 'Valor', valor: brl(c.valor, true) }, { rotulo: 'Motivo', valor: motivo }, { rotulo: 'NFS-e', valor: `${notas.filter((n) => n.situacao === 'emitida').length} canceladas junto` }], `Você pediu para cancelar a ${c.numero}. Deixei pronto: a cobrança e as notas saem juntas, e os extras voltam para faturar.`, 'gestor', 'cobranca.cancelar')
      },
    },
  ]
  const subFatura = () => {
    return (
      <>
      {modal === 'segunda' && <SegundaVia fin={fin} c={c} onFechar={() => setModal(null)} />}
      {modal === 'pagamento' && (
        <PagamentoFora
          c={c}
          onFechar={() => setModal(null)}
          onSalvar={(valor, data, comprovante) => {
            const ok = executar(() => {
              repos.recebimentos.criar({ cobranca_id: c.id, valor, pago_em: data, meio: 'fora do provedor', tarifa: 0, pagador: fin.nomeCliente(c.cliente_id), origem: 'manual', situacao: 'confirmado', comprovante })
              for (const p of parcelas.filter((x) => x.situacao === 'aberta')) repos.parcelas.atualizar(p.id, { situacao: 'paga' })
              return repos.cobrancas.anotar(c.id, `Pagamento fora do provedor registrado por ${usuario.nome}: ${brl(valor, true)} em ${dataCurta(data)} (comprovante anexado)`, { situacao: valor + 0.01 >= c.valor ? 'paga' : 'paga_parcial', paga_em: data, regua_pausada_ate: null, regua_pausa_motivo: null }, { ferramenta: 'recebimento.baixar' })
            }, { sucesso: 'Baixa manual registrada; a régua parou e o recibo foi ao cliente.' })
            if (ok) setModal(null)
          }}
        />
      )}
      {modal === 'substituir' && (
        <Substituir
          c={c}
          onFechar={() => setModal(null)}
          onPreparar={(valor, venc, motivo) => {
            cartao('substituir', { tipo: 'substituir_cobranca', cobranca_id: c.id, motivo, valor, vencimento: venc }, `Substituir a ${c.numero}`, [{ rotulo: 'De', valor: `${brl(c.valor, true)} · ${dataCurta(c.vencimento)}` }, { rotulo: 'Para', valor: `${brl(valor, true)} · ${dataCurta(venc)}` }, { rotulo: 'Motivo', valor: motivo }], 'Preparei a substituição: a fatura atual e as notas saem como substituídas e a nova sai com boleto, Pix e NFS-e.', 'gestor', 'cobranca.substituir')
            setModal(null)
          }}
        />
      )}
      {modal === 'acordo' && fin.politica && (
        <Acordo
          c={c}
          max={{ parcelas: fin.politica.acordo_parcelas_max, desconto: fin.politica.acordo_desconto_max }}
          onFechar={() => setModal(null)}
          onPreparar={(parcelas, desconto, primeira, fora) => {
            cartao('acordo', { tipo: 'acordo', cobranca_id: c.id, parcelas, desconto, primeira }, `Acordo de ${parcelas}×${desconto ? ` com ${desconto}% de desconto` : ''}`, [{ rotulo: 'Total', valor: brl(c.valor * (1 - desconto / 100), true) }, { rotulo: 'Parcelas', valor: `${parcelas} a partir de ${dataCurta(primeira)}` }, { rotulo: 'Política', valor: fora ? 'fora (pede o Administrador)' : 'dentro' }], `Montei a proposta de acordo (FIN-009). ${fora ? 'Ela passa da política, então o cartão é do Administrador.' : 'Está dentro da política.'}`, fora ? 'administrador' : 'gestor', 'cobranca.propor_acordo')
            setModal(null)
            loja.toast('Proposta de acordo pronta para aprovar (topo da aba).')
          }}
        />
      )}
      </>
    )
  }
  // Uma gaveta por vez: o passo (2ª via, baixa, substituir, acordo) toma o lugar da fatura e volta para ela.
  if (modal) return subFatura()
  return (
    <GavetaFormulario aberta largura="lg" onFechar={onFechar} titulo={`${c.numero} · ${fin.nomeCliente(c.cliente_id)}`} descricao={`${rotuloCompetencia(c.competencia)} · vence ${dataCurta(c.vencimento)} · ${rotuloMeio[c.meio]}`} acao="Fechar" onAcao={onFechar}>
      <div className="flex flex-wrap items-center gap-2">
        <SeloSituacao s={s} />
        {atraso > 0 && aberto && <Badge variant="erro">{atraso} dias de atraso</Badge>}
        {c.regua_pausada_ate && <Badge variant="destaque">régua pausada até {dataCurta(c.regua_pausada_ate)}</Badge>}
        {c.pausa_parcial_em && <Badge variant="destaque">pausa parcial no app</Badge>}
        <span className="flex-1" />
        <span className="font-heading text-2xl font-light tabular-nums">{brl(c.valor, true)}</span>
        {pode && <BotaoAcoes rotulo="Ações da fatura" acoes={acoes} />}
      </div>
      {c.regua_pausa_motivo && <Nota tom="alerta">Régua pausada: {c.regua_pausa_motivo}. O pago informado não baixa: só o extrato ou o webhook confirmam.</Nota>}
      {s === 'aguardando_confirmacao' && pode && <ConfirmarInformado fin={fin} c={c} />}
      <section className="flex flex-col gap-1.5">
        <h3 className="text-sm font-medium">Linhas (uma cobrança, serviços em linhas)</h3>
        <ul className="divide-border/70 flex flex-col divide-y text-sm">
          {c.linhas.map((l) => (
            <li key={l.id} className="flex items-center gap-3 py-1.5">
              <span className="min-w-0 flex-1">
                {l.descricao}
                <span className="text-muted-foreground text-xs">{l.codigo ? ` · LC 116 ${l.codigo}` : ' · sem nota (recibo e comprovante)'}</span>
              </span>
              <span className="tabular-nums">{brl(l.valor, true)}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="flex flex-col gap-1.5">
        <h3 className="text-sm font-medium">NFS-e ({fin.politica?.nfse.nfse_por_servico ? 'uma por serviço' : 'vários itens na mesma nota'})</h3>
        <ul className="flex flex-col gap-1.5 text-sm">
          {notas.map((n) => (
            <li key={n.id} className="bg-sunken/50 flex flex-wrap items-center gap-2 rounded-md px-3 py-2">
              <span className="min-w-0 grow basis-40">
                <span className="block">
                  {n.numero} · {n.servico}
                </span>
                <span className="text-muted-foreground block text-xs">
                  código {n.codigo} · ISS {n.iss} · {brl(n.valor, true)}
                  {n.retencoes.length ? ` · retém ${n.retencoes.join(', ')}` : ''}
                  {n.motivo ? ` · ${n.motivo}` : ''}
                </span>
              </span>
              <Badge variant={n.situacao === 'emitida' ? 'sucesso' : n.situacao === 'rejeitada' ? 'erro' : 'secondary'}>{n.situacao}</Badge>
              {pode && n.situacao === 'rejeitada' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => integrante.pedirCartao({ id: `nota-${n.id}`, acao: { tipo: 'corrigir_nota', nota_id: n.id, motivo: 'código do serviço do tomador incluído', codigo: n.codigo }, resumo: `Corrigir e reemitir a NFS-e de ${n.servico} · ${fin.nomeCliente(n.cliente_id)}`, argumentos: [{ rotulo: 'Erro', valor: n.motivo ?? '' }, { rotulo: 'Correção', valor: 'incluir o código do serviço do tomador' }, { rotulo: 'Valor', valor: brl(n.valor, true) }], texto: 'Achei o erro da nota rejeitada: faltou o código do serviço do tomador no ISS retido. Corrigi a DPS; reemitir é cartão (FIN-011).', aba: 'cobranca', alcada: 'gestor', ferramenta: 'nfse.escritorio.emitir', cliente_id: n.cliente_id })}
                >
                  Corrigir
                </Button>
              )}
            </li>
          ))}
          {!notas.length && <li className="text-muted-foreground">Sem NFS-e (reembolso sai com recibo).</li>}
        </ul>
      </section>
      {parcelas.length > 1 && (
        <section className="flex flex-col gap-1.5">
          <h3 className="text-sm font-medium">Parcelas</h3>
          <ul className="flex flex-col gap-1 text-sm">
            {parcelas.map((p) => (
              <li key={p.id} className="flex items-center gap-2">
                <span className="w-20">{p.numero}ª · {dataCurta(p.vencimento)}</span>
                <span className="flex-1 tabular-nums">{brl(p.valor, true)}</span>
                <Badge variant={p.situacao === 'paga' ? 'sucesso' : 'outline'}>{p.situacao}</Badge>
              </li>
            ))}
          </ul>
        </section>
      )}
      {regua && aberto && (
        <Nota>
          Régua: {regua.feita ? `${rotuloDia(regua.feita.dias)} cumprido (${regua.feita.tom})` : 'nenhum passo ainda'}
          {regua.proxima && !c.regua_pausada_ate ? ` · próximo: ${rotuloDia(regua.proxima.dias)} em ${dataCurta(somarDias(c.vencimento, regua.proxima.dias))} (${regua.proxima.quem === 'sozinho' ? 'o integrante manda sozinho' : 'cartão'})` : ''}
        </Nota>
      )}
      <section className="flex flex-col gap-1.5">
        <h3 className="text-sm font-medium">Histórico</h3>
        <ol className="flex flex-col gap-1 text-sm">
          {[...c.historico].reverse().map((h, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-muted-foreground w-12 shrink-0 text-xs tabular-nums">{h.quando.length > 10 ? dataCurta(h.quando.slice(0, 10)) : h.quando}</span>
              <span className="min-w-0">{h.texto}</span>
            </li>
          ))}
        </ol>
      </section>
    </GavetaFormulario>
  )
}

function ConfirmarInformado({ fin, c }: { fin: Fin; c: Cobranca }) {
  const executar = useAcao()
  const { usuario } = useSessao()
  const rec = fin.recebimentos.find((r) => r.cobranca_id === c.id && r.situacao === 'informado')
  if (!rec) return null
  return (
    <Nota tom="alerta">
      O cliente informou o pagamento em {dataCurta(rec.pago_em)} ({rec.comprovante ? `comprovante ${rec.comprovante}` : 'sem comprovante'}). Não baixa sozinho: confirme pelo extrato ou marque como não localizado.
      <span className="mt-2 flex flex-wrap gap-2">
        <Button
          size="sm"
          className="rounded-full"
          onClick={() =>
            executar(() => {
              repos.recebimentos.atualizar(rec.id, { situacao: 'confirmado', origem: 'conciliacao' }, { texto: `Pagamento informado confirmado no extrato por ${usuario.nome}` })
              return repos.cobrancas.anotar(c.id, `Pagamento confirmado no extrato (${dataCurta(rec.pago_em)}); régua encerrada e recibo enviado`, { situacao: 'paga', paga_em: rec.pago_em, regua_pausada_ate: null, regua_pausa_motivo: null }, { ferramenta: 'recebimento.baixar' })
            }, { sucesso: 'Baixado: o extrato confirmou o pagamento.' })
          }
        >
          <CheckIcon /> Confirmar pelo extrato
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="rounded-full"
          onClick={() =>
            executar(() => {
              repos.recebimentos.atualizar(rec.id, { situacao: 'nao_localizado' }, { texto: 'Pagamento informado não localizado no extrato' })
              return repos.cobrancas.anotar(c.id, 'Pagamento não localizado: a régua retomou e o cliente recebeu "não localizamos seu pagamento"', { regua_pausada_ate: null, regua_pausa_motivo: null }, { ferramenta: 'recebimento.vincular' })
            }, { sucesso: 'Régua retomada; o cliente foi avisado.' })
          }
        >
          Não localizado
        </Button>
      </span>
    </Nota>
  )
}

/** S07-A15 · 2ª via com juros e multa pelo motor Cálculo; boleto e Pix novos pelo provedor (simulado). */
function SegundaVia({ fin, c, onFechar }: { fin: Fin; c: Cobranca; onFechar: () => void }) {
  const executar = useAcao()
  const [data, setData] = useState(HOJE > c.vencimento ? HOJE : c.vencimento)
  const [r, setR] = useState<{ s: 'nao' | 'indo' | 'ok' | 'erro'; linha?: string; pix?: string; fonte?: string; erro?: string }>({ s: 'nao' })
  const calc = atualizarValor(c.valor, c.vencimento, data, fin.politica ?? { juros_mes: 1, multa: 2 })
  const gerar = async () => {
    setR({ s: 'indo' })
    try {
      const x = await apis.cobranca.segundaVia({ id_externo: c.id, valor: calc.total, vencimento: data })
      setR({ s: 'ok', linha: x.dados.linha_digitavel, pix: x.dados.pix_copia_cola, fonte: x.fonte })
      executar(() => repos.cobrancas.anotar(c.id, `2ª via gerada para ${dataCurta(data)}: ${brl(calc.total, true)} (multa ${brl(calc.multa, true)} + juros ${brl(calc.juros, true)})`))
    } catch (e) {
      setR({ s: 'erro', erro: e instanceof Error ? e.message : String(e) })
    }
  }
  return (
    <GavetaFormulario aberta onFechar={onFechar} titulo={`2ª via · ${c.numero}`} descricao="Juros e multa pela política, calculados pelo motor Cálculo. O cliente também pede no app e no WhatsApp; o integrante responde sozinho (FIN-010)." acao={r.s === 'ok' ? 'Fechar' : 'Gerar 2ª via'} acaoDesabilitada={r.s === 'indo'} onAcao={() => (r.s === 'ok' ? onFechar() : gerar())}>
      <Campo rotulo="Pagar em">{(id) => <CampoEscolha id={id} valor={data} onMudar={(v) => { setData(v); setR({ s: 'nao' }) }} opcoes={[0, 1, 3, 5, 10].map((d) => somarDias(HOJE > c.vencimento ? HOJE : c.vencimento, d)).map((d) => ({ valor: d, rotulo: dataCurta(d) }))} />}</Campo>
      <ul className="bg-sunken/60 flex flex-col gap-1 rounded-lg p-3 text-sm">
        <li className="flex justify-between">
          <span>Valor original</span>
          <span className="tabular-nums">{brl(c.valor, true)}</span>
        </li>
        <li className="flex justify-between">
          <span>Multa ({fin.politica?.multa}%)</span>
          <span className="tabular-nums">{brl(calc.multa, true)}</span>
        </li>
        <li className="flex justify-between">
          <span>Juros ({calc.dias} dias)</span>
          <span className="tabular-nums">{brl(calc.juros, true)}</span>
        </li>
        <li className="flex justify-between font-medium">
          <span>Total</span>
          <span className="tabular-nums">{brl(calc.total, true)}</span>
        </li>
      </ul>
      {r.s === 'erro' && <EstadoErro titulo="O banco não gerou a 2ª via" descricao={r.erro} onTentar={gerar} />}
      {r.s === 'ok' && (
        <div className="flex flex-col gap-2 text-sm">
          <span className="font-mono text-xs break-all">{r.linha}</span>
          <span className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" className="rounded-full" onClick={() => navigator.clipboard?.writeText(r.pix ?? '')}>
              <CopyIcon /> Copiar Pix copia e cola
            </Button>
            <SeloDemonstracao fonte={r.fonte} />
          </span>
        </div>
      )}
    </GavetaFormulario>
  )
}

/** S07-A16 · Pagamento fora do provedor: baixa manual com comprovante. */
function PagamentoFora({ c, onFechar, onSalvar }: { c: Cobranca; onFechar: () => void; onSalvar: (valor: number, data: string, comprovante: string) => void }) {
  const [valor, setValor] = useState(String(c.valor).replace('.', ','))
  const [data, setData] = useState(HOJE)
  const [comprovante, setComprovante] = useState<string | null>(null)
  return (
    <GavetaFormulario aberta onFechar={onFechar} titulo="Registrar pagamento fora do provedor" descricao="Depósito, TED para outra conta ou dinheiro. Baixa manual exige o comprovante; a conciliação confere depois." acao="Dar baixa" acaoDesabilitada={numero(valor) <= 0 || !comprovante} onAcao={() => onSalvar(numero(valor), data, comprovante!)}>
      <Campo rotulo="Valor recebido (R$)">{(id) => <CampoTexto id={id} valor={valor} onMudar={setValor} />}</Campo>
      <Campo rotulo="Data">{(id) => <CampoEscolha id={id} valor={data} onMudar={setData} opcoes={[0, -1, -2, -3, -5].map((d) => somarDias(HOJE, d)).map((d) => ({ valor: d, rotulo: dataCurta(d) }))} />}</Campo>
      <Campo rotulo="Comprovante" erro={!comprovante ? 'Baixa manual precisa do comprovante.' : undefined}>
        {() => (
          <Button type="button" variant="outline" className="w-fit rounded-full" onClick={() => setComprovante('comprovante-pagamento.pdf')}>
            <FileArrowUpIcon /> {comprovante ? `${comprovante} anexado` : 'Anexar'}
          </Button>
        )}
      </Campo>
    </GavetaFormulario>
  )
}

function Substituir({ c, onFechar, onPreparar }: { c: Cobranca; onFechar: () => void; onPreparar: (valor: number, venc: string, motivo: string) => void }) {
  const [valor, setValor] = useState(String(c.valor).replace('.', ','))
  const [venc, setVenc] = useState(somarDias(HOJE, 5))
  const [motivo, setMotivo] = useState('')
  return (
    <GavetaFormulario aberta onFechar={onFechar} titulo={`Substituir a ${c.numero}`} descricao="Substituir é sempre cartão: a fatura atual e as notas saem como substituídas (com motivo) e a nova é emitida." acao="Preparar o cartão" acaoDesabilitada={!motivo.trim() || numero(valor) <= 0} onAcao={() => onPreparar(numero(valor), venc, motivo.trim())}>
      <Campo rotulo="Novo valor (R$)">{(id) => <CampoTexto id={id} valor={valor} onMudar={setValor} />}</Campo>
      <Campo rotulo="Novo vencimento">{(id) => <CampoEscolha id={id} valor={venc} onMudar={setVenc} opcoes={[3, 5, 7, 10, 15].map((d) => somarDias(HOJE, d)).map((d) => ({ valor: d, rotulo: dataCurta(d) }))} />}</Campo>
      <Campo rotulo="Motivo" erro={!motivo.trim() ? 'Substituir exige o motivo.' : undefined}>{(id) => <CampoTexto id={id} valor={motivo} onMudar={setMotivo} placeholder="Ex.: valor do extra estava errado" />}</Campo>
    </GavetaFormulario>
  )
}

/** S07-A19 · Propor acordo: parcelas e desconto; fora da política, a alçada sobe. */
function Acordo({ c, max, onFechar, onPreparar }: { c: Cobranca; max: { parcelas: number; desconto: number }; onFechar: () => void; onPreparar: (parcelas: number, desconto: number, primeira: string, fora: boolean) => void }) {
  const [parcelas, setParcelas] = useState(2)
  const [desconto, setDesconto] = useState(0)
  const [primeira, setPrimeira] = useState(somarDias(HOJE, 5))
  const fora = parcelas > max.parcelas || desconto > max.desconto
  const total = c.valor * (1 - desconto / 100)
  return (
    <GavetaFormulario aberta onFechar={onFechar} titulo={`Propor acordo · ${c.numero}`} descricao={`Política: até ${max.parcelas} parcelas e ${max.desconto}% de desconto. Fora disso, o cartão vai ao Administrador. Enquanto o acordo estiver em dia, a régua para.`} acao="Preparar o cartão" onAcao={() => onPreparar(parcelas, desconto, primeira, fora)}>
      <Campo rotulo={`${parcelas} parcela(s)`}>{(id) => <input id={id} type="range" min={1} max={12} value={parcelas} onChange={(e) => setParcelas(Number(e.target.value))} className="accent-foreground w-full" />}</Campo>
      <Campo rotulo={`Desconto: ${desconto}%`}>{(id) => <input id={id} type="range" min={0} max={30} value={desconto} onChange={(e) => setDesconto(Number(e.target.value))} className="accent-foreground w-full" />}</Campo>
      <Campo rotulo="Primeira parcela">{(id) => <CampoEscolha id={id} valor={primeira} onMudar={setPrimeira} opcoes={[3, 5, 10, 15].map((d) => somarDias(HOJE, d)).map((d) => ({ valor: d, rotulo: dataCurta(d) }))} />}</Campo>
      <Nota tom={fora ? 'alerta' : 'neutro'}>
        {parcelas}× {brl(total / parcelas, true)} = {brl(total, true)}
        {fora ? ' · fora da política: decide o Administrador' : ' · dentro da política'}
      </Nota>
    </GavetaFormulario>
  )
}

/** Devedores: idade, régua, pausa em N dias, proposta de acordo. */
function Devedores({ fin, pode, onAbrir }: { fin: Fin; pode: boolean; onAbrir: (id: string) => void }) {
  const pausa = fin.politica?.regua.find((p) => p.tom === 'pausa')?.dias ?? 45
  const lista = fin.cobrancas.filter((c) => fin.situacao(c) === 'vencida' || c.situacao === 'em_acordo').sort((a, b) => diasDeAtraso(b) - diasDeAtraso(a))
  return (
    <Caixa>
      <Pergunta descricao="Por idade, com a etapa da régua e quando a pausa parcial chegaria. Nunca se retém documento.">Quem está devendo?</Pergunta>
      {!lista.length ? (
        <EstadoVazio compacto icone={HandCoinsIcon} titulo="Ninguém devendo" descricao="As faturas vencidas aparecem aqui, com a régua de cada uma." />
      ) : (
        <ul className="divide-border/70 flex flex-col divide-y">
          {lista.map((c) => {
            const d = diasDeAtraso(c)
            return (
              <li key={c.id} className="flex flex-wrap items-center gap-2 py-2 text-sm">
                <span className="min-w-0 grow basis-40">
                  <span className="block truncate">{fin.nomeCliente(c.cliente_id)}</span>
                  <span className="text-muted-foreground block text-xs">
                    {rotuloCompetencia(c.competencia)} · {c.situacao === 'em_acordo' ? 'em acordo' : `${d} dias · régua em ${c.regua_etapa ?? rotuloDia(d)} · pausa parcial em ${Math.max(0, pausa - d)} dias`}
                  </span>
                </span>
                <span className="tabular-nums">{brl(c.valor, true)}</span>
                {pode && (
                  <Button size="sm" variant="ghost" className="rounded-full" onClick={() => onAbrir(c.id)}>
                    Abrir
                  </Button>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </Caixa>
  )
}

/** S07-A20 · Recebimentos sem cobrança: sugestão por CNPJ do pagador; vincular vira regra proposta. */
function RecebimentosSoltos({ fin, pode }: { fin: Fin; pode: boolean }) {
  const executar = useAcao()
  const { usuario } = useSessao()
  const [escolha, setEscolha] = useState<Record<string, string>>({})
  const soltos = fin.recebimentos.filter((r) => r.situacao === 'nao_localizado' && !r.cobranca_id)
  const abertas = fin.abertas
  const vincular = (rId: string, cbId: string) => {
    const r = fin.recebimentos.find((x) => x.id === rId)!
    const cb = fin.cobrancas.find((x) => x.id === cbId)!
    executar(() => {
      repos.recebimentos.atualizar(r.id, { cobranca_id: cb.id, situacao: 'confirmado' }, { texto: `${usuario.nome} vinculou ${r.pagador} (${brl(r.valor, true)}) à ${cb.numero}` })
      const parcela = fin.parcelas.find((p) => p.cobranca_id === cb.id && p.situacao === 'aberta' && Math.abs(p.valor - r.valor) < 0.01)
      if (parcela) repos.parcelas.atualizar(parcela.id, { situacao: 'paga' }, { texto: `Parcela ${parcela.numero} paga (vínculo manual)` })
      const restam = fin.parcelas.filter((p) => p.cobranca_id === cb.id && p.situacao === 'aberta' && p.id !== parcela?.id).length
      repos.cobrancas.anotar(cb.id, `Recebimento de ${r.pagador} vinculado (${brl(r.valor, true)})`, parcela && restam ? {} : { situacao: 'paga', paga_em: r.pago_em }, { ferramenta: 'recebimento.vincular' })
      if (r.pagador_documento && !r.pagador_documento.includes('*')) repos.regrasCategorizacao.criar({ padrao: `${r.meio} de ${r.pagador_documento}`, categoria: `Honorários mensais · ${fin.nomeCliente(cb.cliente_id)}`, situacao: 'proposta', vezes: 1, exemplo: `${dataCurta(r.pago_em)} · ${brl(r.valor, true)}` }, { texto: 'Vínculo virou regra proposta' })
    }, { sucesso: 'Vinculado. O CNPJ do pagador virou regra proposta na Conciliação.' })
  }
  return (
    <Caixa>
      <Pergunta descricao="Créditos que não casaram com cobrança nenhuma. O integrante sugere pelo CNPJ do pagador; vincular ensina uma regra.">Recebimentos sem cobrança</Pergunta>
      {!soltos.length ? (
        <EstadoVazio compacto icone={LinkIcon} titulo="Tudo vinculado" descricao="Crédito sem cobrança aparece aqui para você vincular." />
      ) : (
        <ul className="flex flex-col gap-3">
          {soltos.map((r) => {
            const sugerida = r.sugestao_cobranca_id
            const valorEscolhido = escolha[r.id] ?? sugerida ?? ''
            return (
              <li key={r.id} className="flex flex-col gap-2 text-sm">
                <span className="flex items-center gap-2">
                  <span className="min-w-0 flex-1">
                    <span className="block font-mono text-xs">{r.pagador}</span>
                    <span className="text-muted-foreground block text-xs">
                      {dataCurta(r.pago_em)} · {r.meio} · {r.pagador_documento ?? 'sem documento'}
                      {sugerida ? ` · sugestão: ${fin.cobrancas.find((c) => c.id === sugerida)?.numero} (${fin.nomeCliente(fin.cobrancas.find((c) => c.id === sugerida)?.cliente_id)})` : ' · nenhuma cobrança com esse valor ou documento'}
                    </span>
                  </span>
                  <span className="tabular-nums">{brl(r.valor, true)}</span>
                </span>
                {pode && (
                  <span className="flex flex-wrap gap-2">
                    <CampoEscolha rotulo={`Cobrança para ${r.pagador}`} valor={valorEscolhido} onMudar={(v) => setEscolha({ ...escolha, [r.id]: v })} opcoes={[{ valor: '', rotulo: 'escolha a cobrança' }, ...abertas.map((c) => ({ valor: c.id, rotulo: `${c.numero} · ${fin.nomeCliente(c.cliente_id)} · ${brl(c.valor, true)}` }))]} />
                    <Button size="sm" variant="outline" className="rounded-full" disabled={!valorEscolhido} onClick={() => vincular(r.id, valorEscolhido)}>
                      <LinkIcon /> Vincular
                    </Button>
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </Caixa>
  )
}

/** S07-A21 · Régua de honorários (dias e textos): editar é do Administrador. */
function Regua({ fin }: { fin: Fin }) {
  const executar = useAcao()
  const admin = useSessao().usuario.papel === 'administrador'
  const [ed, setEd] = useState<PassoRegua | 'novo' | null>(null)
  if (!fin.politica) return null
  const politica = fin.politica
  const salvar = (regua: PassoRegua[], texto: string) => executar(() => repos.politicasFinanceiras.atualizar(politica.id, { regua }, { texto }), { sucesso: 'Régua salva (versão nova da política).' })
  return (
    <Caixa>
      <Pergunta
        descricao="Do D-5 à pausa parcial (D+45). Os três primeiros passos rodam sozinhos; D+10 em diante pedem cartão. Nunca se retém documento."
        acao={
          admin && (
            <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setEd('novo')}>
              Novo passo
            </Button>
          )
        }
      >
        Régua de honorários
      </Pergunta>
      <ListaRegua politica={politica} editavel={admin} onEditar={(p) => setEd(p ?? 'novo')} />
      {ed && (
        <EditarPassoRegua
          p={ed === 'novo' ? undefined : ed}
          onFechar={() => setEd(null)}
          onSalvar={(p) => {
            if (salvar(politica.regua.some((x) => x.id === p.id) ? politica.regua.map((x) => (x.id === p.id ? p : x)) : [...politica.regua, p], `Régua: passo ${rotuloDia(p.dias)} ${politica.regua.some((x) => x.id === p.id) ? 'editado' : 'criado'}`)) setEd(null)
          }}
          onExcluir={ed === 'novo' ? undefined : () => salvar(politica.regua.filter((x) => x.id !== ed.id), `Régua: passo ${rotuloDia(ed.dias)} retirado`) && setEd(null)}
        />
      )}
    </Caixa>
  )
}

/** Notas do escritório: emitidas, rejeitadas, canceladas, substituídas (cancelar é sempre cartão). */
function NotasEscritorio({ fin, pode }: { fin: Fin; pode: boolean }) {
  const confirmar = useConfirmar()
  const integrante = useIntegranteFin()
  const [filtro, setFiltro] = useState<'todas' | 'emitida' | 'rejeitada' | 'cancelada' | 'substituida'>('todas')
  const lista = fin.notas.filter((n) => filtro === 'todas' || n.situacao === filtro).slice(0, 12)
  return (
    <Caixa>
      <Pergunta descricao={`Emissor Nacional, série ${fin.politica?.nfse.serie} · ${fin.politica?.nfse.nfse_por_servico ? 'uma NFS-e por serviço' : 'vários itens por nota'} (${fin.politica?.nfse.regra})`}>Notas do escritório</Pergunta>
      <Segmentado
        rotulo="Estado da nota"
        valor={filtro}
        onMudar={setFiltro}
        opcoes={[
          { valor: 'todas', rotulo: 'Todas' },
          { valor: 'emitida', rotulo: 'Emitidas' },
          { valor: 'rejeitada', rotulo: `Rejeitadas (${fin.notas.filter((n) => n.situacao === 'rejeitada').length})` },
          { valor: 'cancelada', rotulo: 'Canceladas' },
          { valor: 'substituida', rotulo: 'Substituídas' },
        ]}
      />
      <ul className="divide-border/70 flex flex-col divide-y">
        {lista.map((n) => (
          <li key={n.id} className="flex flex-wrap items-center gap-2 py-2 text-sm">
            <span className="min-w-0 grow basis-40">
              <span className="block truncate">
                {n.numero} · {fin.nomeCliente(n.cliente_id)}
              </span>
              <span className="text-muted-foreground block text-xs">
                {rotuloCompetencia(n.competencia)} · {n.servico} · {n.codigo}
                {n.motivo ? ` · ${n.motivo}` : ''}
              </span>
            </span>
            <span className="tabular-nums">{brl(n.valor, true)}</span>
            <Badge variant={n.situacao === 'emitida' ? 'sucesso' : n.situacao === 'rejeitada' ? 'erro' : 'secondary'}>{n.situacao}</Badge>
            {pode && n.situacao === 'emitida' && (
              <BotaoAcoes
                rotulo={`Ações da NFS-e ${n.numero}`}
                acoes={[
                  {
                    rotulo: 'Cancelar a nota',
                    perigo: true,
                    onSelecionar: async () => {
                      const motivo = await confirmar({ titulo: `Cancelar a NFS-e ${n.numero}?`, descricao: 'Sempre cartão (nunca promovido). A linha do serviço sai da cobrança na mesma hora.', acao: 'Preparar o cartão', perigo: true, exigirMotivo: true })
                      if (typeof motivo === 'string') integrante.pedirCartao({ id: `cancelar-nota-${n.id}`, acao: { tipo: 'cancelar_nota', nota_id: n.id, motivo }, resumo: `Cancelar a NFS-e ${n.numero} · ${fin.nomeCliente(n.cliente_id)}`, argumentos: [{ rotulo: 'Serviço', valor: n.servico }, { rotulo: 'Valor', valor: brl(n.valor, true) }, { rotulo: 'Motivo', valor: motivo }], texto: `Preparei o cancelamento da NFS-e ${n.numero}; a cobrança é ajustada junto.`, aba: 'cobranca', alcada: 'gestor', ferramenta: 'nfse.escritorio.cancelar', cliente_id: n.cliente_id })
                    },
                  },
                ]}
              />
            )}
          </li>
        ))}
        {!lista.length && <li className="text-muted-foreground py-2 text-sm">Nenhuma nota neste estado.</li>}
      </ul>
    </Caixa>
  )
}

/** Provedor: tarifa real e Pix Automático (convites pelo app). */
function Provedor({ fin }: { fin: Fin }) {
  const executar = useAcao()
  const pode = usePodeFin('cobranca.criar')
  const [estado, setEstado] = useState<{ s: 'nao' | 'indo' | 'ok' | 'erro'; n?: number; fonte?: string; erro?: string }>({ s: 'nao' })
  const p = fin.politica?.provedor
  if (!p) return null
  const semPixAuto = fin.contratos.filter((c) => c.meio_pagamento === 'boleto' && c.situacao === 'ativo')
  const convidar = async () => {
    setEstado({ s: 'indo' })
    try {
      let fonte = ''
      for (const c of semPixAuto) fonte = (await apis.cobranca.convidarPixAutomatico({ pagador: c.cliente, valor: c.total, dia: c.dia_vencimento })).fonte
      setEstado({ s: 'ok', n: semPixAuto.length, fonte })
      for (const c of semPixAuto) executar(() => repos.contratosHonorarios.atualizar(c.id, { extras: { ...c.extras, convite_pix_automatico: HOJE } }, { ferramenta: 'cobranca.criar', texto: `Convite de Pix Automático enviado a ${c.cliente} pelo app` }))
    } catch (e) {
      setEstado({ s: 'erro', erro: e instanceof Error ? e.message : String(e) })
    }
  }
  return (
    <Caixa>
      <Pergunta descricao={`${p.convenio} · conta ${p.conta}`}>
        Provedor: {p.nome}
      </Pergunta>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        <Numero valor={p.boleto} rotulo="por boleto pago" />
        <Numero valor={p.pix} rotulo="por Pix" />
        <Numero valor={p.pix_automatico} rotulo="por Pix Automático" />
        <Numero valor={p.credito} rotulo="crédito na conta" />
        <Numero valor={p.autorizacoes_pix} rotulo="autorizações de Pix Automático" />
      </div>
      {pode && semPixAuto.length > 0 && (
        <span className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" className="rounded-full" disabled={estado.s === 'indo'} onClick={convidar}>
            <ArrowClockwiseIcon /> {estado.s === 'indo' ? 'Enviando convites…' : `Convidar ${semPixAuto.length} clientes de boleto para o Pix Automático`}
          </Button>
          {estado.s === 'ok' && (
            <>
              <span className="text-sm">{estado.n} convites enviados pelo app; a autorização é do cliente, no banco dele.</span>
              <SeloDemonstracao fonte={estado.fonte} />
            </>
          )}
        </span>
      )}
      {estado.s === 'erro' && <EstadoErro titulo="O provedor não respondeu" descricao={estado.erro} onTentar={convidar} />}
      <p className="text-muted-foreground text-xs">
        <PauseIcon className="mr-1 inline size-3" />O cliente pode cancelar o Pix Automático quando quiser (FIN-010). Trocar de provedor fica em Configurar, sem perder as autorizações.
      </p>
    </Caixa>
  )
}

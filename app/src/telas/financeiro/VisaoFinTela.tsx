import { ArrowRightIcon, CalendarCheckIcon, FileTextIcon, ReceiptIcon, ScalesIcon, TrendUpIcon, WarningIcon } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import { useLoja, useNavegacao, type Destino } from '@/ambiente/loja'
import { EstadoVazio } from '@/components/kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { custoHora } from '@/dados/timesheet'
import { carteiraAgregada } from '@/nucleo/semente/s07'
import { BarrasReais, brl, CabecalhoFin, Caixa, CartoesDaAba, Numero, PaginaFin, Pergunta } from './comum'
import { margemDe } from './ContratosTela'
import { projecaoCaixa, useFin, useTitularEscritorio } from './dados'
import { COMPETENCIA_ATUAL, diasDeAtraso, rotuloCompetencia, servicos } from './dominio'
import { FluxoMensal, SeloTitular } from './pecas'

function Decisao({ icone, titulo, detalhe, destino, rotulo }: { icone: ReactNode; titulo: string; detalhe: string; destino: Destino; rotulo: string }) {
  const nav = useNavegacao()
  return (
    <li className="flex items-center gap-3 py-2.5 text-sm">
      <span className="bg-sunken text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-full">{icone}</span>
      <span className="min-w-0 flex-1">
        <span className="block">{titulo}</span>
        <span className="text-muted-foreground block text-xs">{detalhe}</span>
      </span>
      <Button size="sm" variant="outline" className="shrink-0 rounded-full" onClick={() => nav.irPara(destino)}>
        {rotulo} <ArrowRightIcon />
      </Button>
    </li>
  )
}

const MINIMO_CAIXA = 120_000

/**
 * S07-T01 · Financeiro › Visão geral (09, 10.2): abre pelo que precisa de
 * decisão (gestão por exceção): os cartões do integrante, o lote do mês,
 * reajustes, contas a aprovar, faturas vencidas, lançamentos a conciliar e
 * quem passou da faixa; depois os números, o caixa de 90 dias contra o
 * mínimo, a receita por setor, as vencidas por idade e os clientes que pedem
 * atenção. Cada item abre a aba e o cliente onde se resolve (S07-A02).
 */
export function VisaoFinTela() {
  const fin = useFin()
  const titular = useTitularEscritorio()
  const loja = useLoja()
  const nav = useNavegacao()
  if (fin.politica && !fin.contratos.length)
    return (
      <PaginaFin fin={fin}>
        <CabecalhoFin titulo="Visão geral" sub="Financeiro do escritório" status="Estou esperando os contratos para começar." />
        <Caixa>
          <EstadoVazio
            icone={FileTextIcon}
            titulo="Nenhum contrato estruturado"
            descricao="Importe em Contratos (Configurar › Trazer o financeiro atual) ou crie o primeiro. Daí em diante eu preparo o lote do mês, a régua e a conciliação."
            acao={
              <Button className="rounded-full" onClick={() => nav.irPara({ modulo: 'financeiro', aba: 'contratos' })}>
                Ir para Contratos
              </Button>
            }
          />
        </Caixa>
      </PaginaFin>
    )
  const completo = fin.clientes.some((c) => c.id === 'c1')
  const agregado = completo ? carteiraAgregada : { clientes: 0, receita: 0, semContrato: 0 }
  const mrr = fin.contratos.filter((c) => c.situacao === 'ativo').reduce((s, c) => s + c.total, 0) + agregado.receita
  const aAprovar = fin.contasPagar.filter((c) => c.situacao === 'aguardando_aprovacao')
  const vencidas = fin.cobrancas.filter((c) => fin.situacao(c) === 'vencida')
  const aConciliar = fin.lancamentos.filter((l) => l.situacao === 'sugerido' || l.situacao === 'nao_conciliado')
  const caixaHoje = fin.contasBancarias.filter((b) => b.saldo > 0).reduce((s, b) => s + b.saldo, 0)
  const lote = fin.lotes.find((l) => l.situacao === 'preparado')
  const loteSemDecisao = lote && (!lote.cartao_id || !loja.estado.decisoes[lote.cartao_id]) && !fin.pendentes.some((c) => (c.argumentos as { lote_id?: string }).lote_id === lote.id)
  const comunicados = fin.aditivos.filter((a) => a.tipo === 'reajuste' && a.situacao === 'comunicado')
  const estouradas = fin.contratos.filter((c) => c.faixa_estourada)
  const emitido = fin.cobrancas.filter((c) => c.competencia === COMPETENCIA_ATUAL && c.situacao !== 'cancelada' && c.situacao !== 'substituida').reduce((s, c) => s + c.valor, 0)
  const inadimplencia = emitido ? (vencidas.reduce((s, c) => s + c.valor, 0) / (emitido + agregado.receita)) * 100 : 0
  const encerrados = fin.contratos.filter((c) => c.situacao === 'encerrado').length + (completo ? 1 : 0)
  const churn = ((encerrados / Math.max(1, fin.contratos.length + agregado.clientes)) * 100).toFixed(1).replace('.', ',')
  const fechado = [...fin.fechamentos].filter((f) => f.situacao === 'fechado').sort((a, b) => b.competencia.localeCompare(a.competencia))[0]
  const idades = [
    { faixa: 'até 15 dias', valor: vencidas.filter((c) => diasDeAtraso(c) <= 15).reduce((s, c) => s + c.valor, 0) },
    { faixa: '16 a 30 dias', valor: vencidas.filter((c) => diasDeAtraso(c) > 15 && diasDeAtraso(c) <= 30).reduce((s, c) => s + c.valor, 0) },
    { faixa: 'mais de 30 dias', valor: vencidas.filter((c) => diasDeAtraso(c) > 30).reduce((s, c) => s + c.valor, 0) },
  ]
  const maxIdade = Math.max(1, ...idades.map((i) => i.valor))
  const proj = projecaoCaixa(fin)
  const i0 = proj.inicio
  const prox = { meses: proj.meses.slice(Math.max(0, i0 - 1), i0 + 3), entradas: proj.entradas.slice(Math.max(0, i0 - 1), i0 + 3), saidas: proj.saidas.slice(Math.max(0, i0 - 1), i0 + 3), inicio: i0 ? 1 : 0, marcos: proj.marcos.map((m) => ({ ...m, mes: m.mes - Math.max(0, i0 - 1) })).filter((m) => m.mes >= 0 && m.mes < 4) }
  let saldo = caixaHoje
  const saldos = proj.meses.slice(i0, i0 + 3).map((m, k) => {
    saldo += (proj.entradas[i0 + k] - proj.saidas[i0 + k]) * 1000
    return { m, v: saldo }
  })
  const porSetor = (() => {
    const m = new Map<string, number>()
    for (const c of fin.contratos) for (const i of c.itens) m.set(servicos[i.servico].rotulo, (m.get(servicos[i.servico].rotulo) ?? 0) + i.valor)
    return [...m.entries()].map(([nome, h]) => ({ nome, h })).sort((a, b) => b.h - a.h)
  })()
  const atencao = [
    ...fin.contratos.filter((c) => (margemDe(c.cliente) ?? 99) < 5).map((c) => ({ id: `d-${c.id}`, cliente: c.cliente, motivo: `deficitário: margem de ${margemDe(c.cliente)}% no Timesheet`, destino: { modulo: 'financeiro' as const, aba: 'contratos', contrato: c.id } })),
    ...estouradas.map((c) => ({ id: `f-${c.id}`, cliente: c.cliente, motivo: `fora da faixa: ${c.faixa_estourada}`, destino: { modulo: 'financeiro' as const, aba: 'contratos', contrato: c.id } })),
    ...fin.cobrancas.filter((c) => c.pausa_parcial_em).map((c) => ({ id: `p-${c.id}`, cliente: fin.nomeCliente(c.cliente_id), motivo: 'em pausa parcial (D+45)', destino: { modulo: 'financeiro' as const, aba: 'cobranca', fatura: c.id } })),
  ]

  return (
    <PaginaFin fin={fin}>
      <CabecalhoFin titulo="Visão geral" status="Separei o que precisa de você hoje; o resto está andando sozinho" sub={`${rotuloCompetencia(COMPETENCIA_ATUAL)} · números do escritório; cada item abre a aba onde se resolve`}>
        <SeloTitular titular={titular} />
      </CabecalhoFin>

      <Caixa>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          <Numero valor={brl(mrr)} rotulo="receita recorrente (MRR)" detalhe={`${fin.contratos.length + agregado.clientes} contratos`} />
          <Numero valor={`${churn}%`} rotulo="churn no mês" detalhe={`${encerrados} saída(s)`} />
          <Numero valor={`${inadimplencia.toFixed(1).replace('.', ',')}%`} rotulo="inadimplência" detalhe={`${vencidas.length} fatura(s) vencida(s)`} />
          <Numero valor={brl(caixaHoje)} rotulo="caixa hoje" detalhe={fin.contasBancarias.map((b) => b.banco).filter((v, i, a) => a.indexOf(v) === i).join(' e ')} />
          <Numero valor={brl(fechado?.custo_hora ?? custoHora.valor)} rotulo="custo-hora" detalhe={fechado ? `fechamento de ${rotuloCompetencia(fechado.competencia)}` : 'proposto'} />
        </div>
      </Caixa>

      <CartoesDaAba fin={fin} todas />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <Caixa>
          <Pergunta descricao="Gestão por exceção: só aparece o que pede uma decisão sua.">Precisa de você</Pergunta>
          <ul className="divide-border/70 flex flex-col divide-y">
            {lote && loteSemDecisao && <Decisao icone={<CalendarCheckIcon className="size-5" />} titulo={`Lote de ${rotuloCompetencia(lote.competencia)}: ${lote.quantidade} clientes, ${brl(lote.total)}`} detalhe={`${lote.decimos} com 13º · ${lote.excecoes.length} exceções · cartão do Financeiro`} destino={{ modulo: 'financeiro', aba: 'cobranca' }} rotulo="Decidir" />}
            {comunicados.length > 0 && <Decisao icone={<TrendUpIcon className="size-5" />} titulo={`${comunicados.length} reajuste(s) comunicado(s) para aplicar na data-base`} detalhe="as cartas saíram; aplicar é cartão do Administrador" destino={{ modulo: 'financeiro', aba: 'contratos' }} rotulo="Contratos" />}
            {aAprovar.length > 0 && <Decisao icone={<ReceiptIcon className="size-5" />} titulo={`${aAprovar.length} contas a pagar esperando aprovação`} detalhe={`${brl(aAprovar.reduce((s, c) => s + c.valor, 0), true)} · ${aAprovar.filter((c) => c.alerta).length} com alerta de duplicidade ou fornecedor novo`} destino={{ modulo: 'financeiro', aba: 'pagar' }} rotulo="Contas a pagar" />}
            {vencidas.map((c) => (
              <Decisao key={c.id} icone={<WarningIcon className="size-5" />} titulo={`${fin.nomeCliente(c.cliente_id)}: fatura de ${rotuloCompetencia(c.competencia)} vencida há ${diasDeAtraso(c)} dias`} detalhe={`${brl(c.valor, true)} · régua em ${c.regua_etapa ?? 'andamento'}`} destino={{ modulo: 'financeiro', aba: 'cobranca', fatura: c.id }} rotulo="Cobrança" />
            ))}
            {aConciliar.length > 0 && <Decisao icone={<ScalesIcon className="size-5" />} titulo={`${aConciliar.length} lançamentos para conciliar`} detalhe={`${aConciliar.filter((l) => l.situacao === 'nao_conciliado').length} divergências`} destino={{ modulo: 'financeiro', aba: 'conciliacao' }} rotulo="Conciliação" />}
            {estouradas.length > 0 && <Decisao icone={<TrendUpIcon className="size-5" />} titulo={`${estouradas.length} cliente(s) acima da faixa contratada`} detalhe={estouradas.map((c) => c.cliente).join(', ')} destino={{ modulo: 'financeiro', aba: 'contratos' }} rotulo="Contratos" />}
            {!lote && !comunicados.length && !aAprovar.length && !vencidas.length && !aConciliar.length && !estouradas.length && <li className="text-muted-foreground py-3 text-sm">Nada pede você agora.</li>}
          </ul>
        </Caixa>
        <div className="flex flex-col gap-4">
          <Caixa>
            <Pergunta descricao={`Saldo projetado contra o mínimo de ${brl(MINIMO_CAIXA)}.`}>Caixa dos próximos 90 dias</Pergunta>
            <FluxoMensal d={prox} altura="h-28" />
            <ul className="flex flex-col gap-1 text-sm">
              {saldos.map((s) => (
                <li key={s.m} className="grid grid-cols-[3rem_minmax(0,1fr)_minmax(7rem,max-content)] items-center gap-2">
                  <span className="text-muted-foreground">{s.m}</span>
                  <span className="bg-sunken relative h-2 overflow-hidden rounded-full">
                    <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${Math.min(100, (s.v / (MINIMO_CAIXA * 2.5)) * 100)}%`, background: 'color-mix(in oklab, var(--foreground) 55%, transparent)' }} />
                    <span className="bg-warning absolute inset-y-0 w-0.5" style={{ left: `${100 / 2.5}%` }} title="mínimo" />
                  </span>
                  <span className="flex items-center justify-end gap-1 whitespace-nowrap tabular-nums">
                    {brl(s.v)} {s.v < MINIMO_CAIXA && <Badge variant="erro">abaixo</Badge>}
                  </span>
                </li>
              ))}
            </ul>
          </Caixa>
          <Caixa className="flex-1">
            <Pergunta>Vencidas por idade</Pergunta>
            <ul className="flex flex-col gap-2">
              {idades.map((i) => (
                <li key={i.faixa} className="grid grid-cols-[minmax(0,7rem)_minmax(0,1fr)_minmax(6rem,max-content)] items-center gap-3 text-sm">
                  <span className="text-muted-foreground">{i.faixa}</span>
                  <span className="bg-sunken h-2.5 overflow-hidden rounded-full">
                    <span className="block h-full rounded-full" style={{ width: `${(i.valor / maxIdade) * 100}%`, background: 'color-mix(in oklab, var(--foreground) 60%, transparent)' }} />
                  </span>
                  <span className="text-right tabular-nums">{brl(i.valor)}</span>
                </li>
              ))}
            </ul>
          </Caixa>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Caixa>
          <Pergunta descricao="Pelos itens vigentes dos contratos; a mesma conta de Contratos.">Receita por setor</Pergunta>
          <BarrasReais dados={porSetor} />
        </Caixa>
        <Caixa>
          <Pergunta descricao="Deficitário no Timesheet, fora da faixa ou em pausa parcial.">Clientes que pedem atenção</Pergunta>
          {!atencao.length && <p className="text-muted-foreground text-sm">Ninguém pedindo atenção.</p>}
          <ul className="divide-border/70 flex flex-col divide-y">
            {atencao.map((a) => (
              <li key={a.id} className="flex items-center gap-2 py-2 text-sm">
                <span className="min-w-0 flex-1">
                  <span className="block">{a.cliente}</span>
                  <span className="text-muted-foreground block text-xs">{a.motivo}</span>
                </span>
                <Button size="sm" variant="ghost" className="rounded-full" onClick={() => nav.irPara(a.destino)}>
                  Abrir <ArrowRightIcon />
                </Button>
              </li>
            ))}
          </ul>
        </Caixa>
      </div>
    </PaginaFin>
  )
}

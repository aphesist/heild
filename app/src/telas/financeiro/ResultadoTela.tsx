import { CalculatorIcon, ChartBarIcon, LockSimpleIcon, LockSimpleOpenIcon, UsersThreeIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { usePersistente } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import { EstadoVazio, useAcao, useConfirmar } from '@/components/kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Campo, CampoEscolha, CampoTexto, GavetaFormulario, Interruptor, Segmentado } from '@/components/ui/formulario'
import { comissoes, custosVariaveis, dre, indicadores, orcamento, socios } from '@/dados/financeiro'
import { custoHora } from '@/dados/timesheet'
import { cn } from '@/lib/utils'
import { repos } from '@/nucleo/repositorios'
import { brl, CabecalhoFin, Caixa, CartoesDaAba, Nota, Numero, PaginaFin, Pergunta } from './comum'
import { projecaoCaixa, useFin, useIntegranteFin, usePodeFin, type Fin } from './dados'
import { COMPETENCIA_ATUAL, rotuloCompetencia } from './dominio'
import { AreaRolagem } from '@/components/ui/area-rolagem'

const sinal = (v: number) => (v < 0 ? `−${brl(-v)}` : brl(v))

/**
 * S07-T07 · Financeiro › Resultado (FIN-006, 007, 008, 012; GES-010, 011):
 * DRE gerencial por centro de custo com o custo do Timesheet (e o rateio do
 * Atendimento), orçado × realizado (fase 4, montado e desligado), antecipação
 * aos sócios, comissões e PLR, custos variáveis por cliente, fechamento do mês
 * (cartão; reabrir com motivo) e a proposta de custo-hora que vai ao Timesheet.
 * Administrador faz; Gestor do Financeiro só lê.
 */
export function ResultadoTela() {
  const fin = useFin()
  const { usuario } = useSessao()
  const admin = usuario.papel === 'administrador'
  const executar = useAcao()
  const integrante = useIntegranteFin()
  const podeFechar = usePodeFin('fechamento.fechar')
  const [ratear, setRatear] = useState(false)
  const [verOrcamento, setVerOrcamento] = useState(false)
  const [modal, setModal] = useState<'distribuir' | 'regras' | null>(null)
  const [decisoes, setDecisoes] = usePersistente<Record<string, 'absorver' | 'repassar'>>('s07:resultado:custos', Object.fromEntries(custosVariaveis.map((c) => [c.cliente, c.decisao])))
  const completo = fin.clientes.some((c) => c.id === 'c1')
  const fechamentos = [...fin.fechamentos].sort((a, b) => b.competencia.localeCompare(a.competencia))
  const ultimoFechado = fechamentos.find((f) => f.situacao === 'fechado')
  const atual = fechamentos.find((f) => f.competencia === COMPETENCIA_ATUAL)
  const custoProposto = Math.round(custoHora.gastos.reduce((s, g) => s + g.valor, 0) / custoHora.horasProdutivas)

  const base = dre.map((l) => ({ ...l, resultado: l.receita - l.pessoal - l.operacao - l.rateio }))
  const apoio = base.find((l) => l.centro === 'Atendimento')!
  const produtivos = base.filter((l) => l.centro !== 'Atendimento')
  const receitaProd = produtivos.reduce((s, l) => s + l.receita, 0)
  const linhas = ratear ? produtivos.map((l) => ({ ...l, resultado: l.resultado + apoio.resultado * (l.receita / receitaProd), rateio: l.rateio - apoio.resultado * (l.receita / receitaProd) })) : base
  const tot = linhas.reduce((s, l) => ({ receita: s.receita + l.receita, pessoal: s.pessoal + l.pessoal, operacao: s.operacao + l.operacao, rateio: s.rateio + l.rateio, resultado: s.resultado + l.resultado, horas: s.horas + l.horas }), { receita: 0, pessoal: 0, operacao: 0, rateio: 0, resultado: 0, horas: 0 })
  const resultadoMes = base.reduce((s, l) => s + l.resultado, 0)
  const pendencias = fin.lancamentos.filter((l) => l.situacao === 'sugerido' || l.situacao === 'nao_conciliado').length + fin.contasPagar.filter((c) => c.situacao === 'aguardando_aprovacao').length

  const fecharMes = () =>
    integrante.pedirCartao({
      id: `fechar-${COMPETENCIA_ATUAL}`,
      acao: { tipo: 'fechar_mes', competencia: COMPETENCIA_ATUAL, custo_hora: custoProposto },
      resumo: `Fechar o financeiro de ${rotuloCompetencia(COMPETENCIA_ATUAL)}`,
      argumentos: [
        { rotulo: 'Pendências', valor: pendencias ? `${pendencias} (ficam para o mês seguinte)` : 'nenhuma' },
        { rotulo: 'Custo-hora', valor: brl(custoProposto) },
        { rotulo: 'Depois', valor: 'sem lançamento retroativo' },
      ],
      texto: `Conferi ${rotuloCompetencia(COMPETENCIA_ATUAL)}: ${pendencias ? `${pendencias} pendência(s) de conciliação ou aprovação continuam abertas` : 'conciliação e contas em dia'}. Fechar é sempre seu (nunca promovido): depois disso, nada retroativo entra sem reabrir com motivo.`,
      aba: 'resultado',
      alcada: 'administrador',
      ferramenta: 'fechamento.fechar',
    })

  if (!completo)
    return (
      <PaginaFin fin={fin}>
        <CabecalhoFin titulo="Resultado" sub="DRE gerencial, orçamento, sócios e comissões" status="Monto a DRE depois do primeiro mês fechado." />
        <Caixa>
          <EstadoVazio icone={ChartBarIcon} titulo="Ainda não há dados suficientes" descricao="A DRE por centro de custo nasce do primeiro mês com contratos, conciliação e timesheet. Orçamento, remuneração e sócios ficam montados e desligados até haver dados (fase 4)." />
        </Caixa>
        <Fechamentos fin={fin} admin={admin} podeFechar={podeFechar} onFechar={fecharMes} />
      </PaginaFin>
    )

  return (
    <PaginaFin fin={fin}>
      <CabecalhoFin titulo="Resultado" exportar="contratos" status={`${ultimoFechado ? rotuloCompetencia(ultimoFechado.competencia) : 'Outubro'} fechado; preparei a DRE e a proposta de custo-hora`} sub={`${ultimoFechado ? rotuloCompetencia(ultimoFechado.competencia) : 'out/26'} fechado · receita pelos itens dos contratos; custo pela folha, pelo Timesheet e pelo rateio`}>
        {!admin && <Badge variant="outline">leitura · Gestor do Financeiro</Badge>}
      </CabecalhoFin>

      <CartoesDaAba fin={fin} aba="resultado" />

      <Caixa>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          <Numero valor={brl(indicadores.mrr)} rotulo="receita recorrente" detalhe={`+${indicadores.mrrVar.toLocaleString('pt-BR')}% no mês`} />
          <Numero valor={indicadores.clientes} rotulo="clientes" detalhe={`${indicadores.entradas} entraram · ${indicadores.saidas} saiu`} />
          <Numero valor={brl(indicadores.ticket)} rotulo="ticket médio" />
          <Numero valor={brl(ultimoFechado?.custo_hora ?? custoHora.valor)} rotulo="custo-hora vigente" detalhe={`proposta de ${rotuloCompetencia(COMPETENCIA_ATUAL)}: ${brl(custoProposto)}`} />
          <Numero valor={`${(Math.round((resultadoMes / tot.receita) * 1000) / 10).toLocaleString('pt-BR')}%`} rotulo="margem do mês" detalhe={sinal(resultadoMes)} />
        </div>
      </Caixa>

      <Caixa>
        <Pergunta acao={<Interruptor ligado={ratear} onMudar={setRatear} rotulo="Ratear o Atendimento nos setores" />} descricao="O custo de pessoal vem das horas do Timesheet × custo-hora; operação, das contas a pagar classificadas.">
          Que setor dá resultado?
        </Pergunta>
        <AreaRolagem eixo="x" className="-mx-1 px-1">
          <table className="w-full text-sm sm:min-w-[640px]">
            <thead>
              <tr className="text-muted-foreground text-left text-xs">
                <th className="py-2 font-normal">Centro de custo</th>
                <th className="py-2 text-right font-normal">Receita</th>
                <th className="py-2 text-right font-normal">Pessoal</th>
                <th className="hidden py-2 text-right font-normal sm:table-cell">Operação</th>
                <th className="hidden py-2 text-right font-normal sm:table-cell">Rateio</th>
                <th className="py-2 text-right font-normal">Resultado</th>
                <th className="py-2 text-right font-normal">Margem</th>
                <th className="hidden py-2 text-right font-normal sm:table-cell">Horas</th>
              </tr>
            </thead>
            <tbody className="divide-border/70 divide-y border-t">
              {linhas.map((l) => (
                <tr key={l.centro}>
                  <td className="py-2">{l.centro}</td>
                  <td className="py-2 text-right tabular-nums">{brl(l.receita)}</td>
                  <td className="py-2 text-right tabular-nums">{brl(l.pessoal)}</td>
                  <td className="hidden py-2 text-right tabular-nums sm:table-cell">{brl(l.operacao)}</td>
                  <td className="hidden py-2 text-right tabular-nums sm:table-cell">{brl(Math.round(l.rateio))}</td>
                  <td className={cn('py-2 text-right tabular-nums', l.resultado < 0 && 'text-destructive')}>{sinal(Math.round(l.resultado))}</td>
                  <td className="py-2 text-right tabular-nums">{Math.round((l.resultado / l.receita) * 100)}%</td>
                  <td className="hidden py-2 text-right tabular-nums sm:table-cell">{l.horas} h</td>
                </tr>
              ))}
              <tr className="font-medium">
                <td className="py-2">Total</td>
                <td className="py-2 text-right tabular-nums">{brl(tot.receita)}</td>
                <td className="py-2 text-right tabular-nums">{brl(tot.pessoal)}</td>
                <td className="hidden py-2 text-right tabular-nums sm:table-cell">{brl(tot.operacao)}</td>
                <td className="hidden py-2 text-right tabular-nums sm:table-cell">{brl(Math.round(tot.rateio))}</td>
                <td className="py-2 text-right tabular-nums">{sinal(Math.round(tot.resultado))}</td>
                <td className="py-2 text-right tabular-nums">{Math.round((tot.resultado / tot.receita) * 100)}%</td>
                <td className="hidden py-2 text-right tabular-nums sm:table-cell">{tot.horas} h</td>
              </tr>
            </tbody>
          </table>
        </AreaRolagem>
      </Caixa>

      <div className="grid gap-4 lg:grid-cols-2">
        <Fechamentos fin={fin} admin={admin} podeFechar={podeFechar} onFechar={fecharMes} atualAberto={atual?.situacao !== 'fechado'} />
        <Caixa>
          <Pergunta descricao={`Gastos do mês ÷ ${custoHora.horasProdutivas} horas produtivas; centros marcados "entra no custo-hora".`}>Custo-hora de {rotuloCompetencia(COMPETENCIA_ATUAL)}</Pergunta>
          <ul className="flex flex-col gap-1 text-sm">
            {custoHora.gastos.map((g) => (
              <li key={g.nome} className="flex justify-between">
                <span>{g.nome}</span>
                <span className="tabular-nums">{brl(g.valor)}</span>
              </li>
            ))}
            <li className="flex justify-between border-t pt-1 font-medium">
              <span>Custo-hora proposto</span>
              <span className="tabular-nums">{brl(custoProposto)}</span>
            </li>
          </ul>
          {admin && (
            <Button
              size="sm"
              variant="outline"
              className="w-fit rounded-full"
              disabled={integrante.fazendo('custo-hora')}
              onClick={() =>
                integrante.trabalhar({
                  id: 'custo-hora',
                  titulo: `Propor o custo-hora de ${rotuloCompetencia(COMPETENCIA_ATUAL)}`,
                  inicio: 'Vou somar os gastos do mês por centro e dividir pelas horas produtivas do Timesheet.',
                  etapas: ['Somando folha, pró-labore e estrutura', 'Lendo as horas produtivas do Timesheet', 'Comparando com o mês anterior'],
                  fim: `Custo-hora proposto: ${brl(custoProposto)} (${custoProposto > custoHora.valor ? 'acima' : 'abaixo'} dos ${brl(custoHora.valor)} de ${custoHora.mes}). Vai ao Timesheet quando o mês fechar; até lá, a Rentabilidade mostra como "proposto".`,
                  aviso: 'Financeiro propôs o custo-hora do mês',
                  aoTerminar: () => {
                    if (atual) executar(() => repos.fechamentos.atualizar(atual.id, { custo_hora: custoProposto }, { ferramenta: 'custo_hora.propor', texto: `Custo-hora de ${rotuloCompetencia(COMPETENCIA_ATUAL)} proposto: ${brl(custoProposto)}` }))
                  },
                })
              }
            >
              <CalculatorIcon /> {atual?.custo_hora ? 'Propor de novo' : 'Propor custo-hora'}
            </Button>
          )}
          {atual?.custo_hora && <Nota>Proposta registrada: {brl(atual.custo_hora)}. O Timesheet lê do fechamento de {rotuloCompetencia(COMPETENCIA_ATUAL)}.</Nota>}
        </Caixa>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Caixa>
          <Pergunta acao={<Badge variant="outline">fase 4 · desligado</Badge>} descricao="Montado e desligado na v1: ainda não há dados suficientes para ativar (09, 7.4).">
            Orçado × realizado
          </Pergunta>
          <Interruptor ligado={verOrcamento} onMudar={setVerOrcamento} rotulo="Mostrar como vai ficar" detalhe="Prévia com os números de outubro; não entra em nenhuma conta." />
          {verOrcamento && (
            <ul className="flex flex-col gap-2 text-sm">
              {orcamento.map((o) => {
                const pct = Math.round(((o.realizado - o.orcado) / o.orcado) * 1000) / 10
                return (
                  <li key={o.nome} className="grid grid-cols-[minmax(0,1fr)_7rem_7rem_4rem] items-center gap-2">
                    <span>{o.nome}</span>
                    <span className="text-muted-foreground text-right tabular-nums">{brl(o.orcado)}</span>
                    <span className="text-right tabular-nums">{brl(o.realizado)}</span>
                    <span className={cn('text-right text-xs tabular-nums', o.nome !== 'Receita' && pct > 0 && 'text-destructive')}>{pct > 0 ? '+' : ''}{pct.toLocaleString('pt-BR')}%</span>
                  </li>
                )
              })}
            </ul>
          )}
        </Caixa>
        <Caixa>
          <Pergunta descricao="Só o Administrador. Cada um com memória de cálculo; o pagamento sai em contas a pagar, com aprovação.">Sócios, comissões e PLR</Pergunta>
          <ul className="flex flex-col gap-1.5 text-sm">
            {socios.map((s) => (
              <li key={s.nome} className="flex justify-between gap-2">
                <span>
                  {s.nome} <span className="text-muted-foreground">· {s.participacao}%</span>
                </span>
                <span className="text-muted-foreground tabular-nums">pró-labore {brl(s.proLabore)}</span>
              </li>
            ))}
          </ul>
          <ul className="divide-border/70 flex flex-col divide-y text-sm">
            {comissoes.map((c) => (
              <li key={c.pessoa} className="flex flex-wrap justify-between gap-2 py-1.5">
                <span className="min-w-0">
                  <span className="block">{c.pessoa}</span>
                  <span className="text-muted-foreground block text-xs">
                    {c.regra} · {c.base}
                  </span>
                </span>
                <span className="tabular-nums">{brl(c.valor)}</span>
              </li>
            ))}
          </ul>
          {admin && (
            <span className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" className="rounded-full" onClick={() => setModal('distribuir')}>
                <UsersThreeIcon /> Antecipar lucros
              </Button>
              <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setModal('regras')}>
                Regras de comissão e PLR
              </Button>
            </span>
          )}
        </Caixa>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Caixa>
          <Pergunta descricao="Consultas pagas, mensagens e certidões por cliente (GES-010). Repassar vira extra na próxima fatura, pela cláusula do contrato.">Absorver ou repassar os custos variáveis?</Pergunta>
          <ul className="divide-border/70 flex flex-col divide-y text-sm">
            {custosVariaveis.map((c) => {
              const cli = fin.clientes.find((x) => x.nome === c.cliente)
              return (
                <li key={c.cliente} className="flex flex-wrap items-center gap-2 py-2">
                  <span className="min-w-0 grow basis-40">
                    <span className="block">{c.cliente}</span>
                    <span className="text-muted-foreground block text-xs">{c.itens}</span>
                  </span>
                  <span className="min-w-16 shrink-0 whitespace-nowrap text-right tabular-nums">{brl(c.valor)}</span>
                  {admin ? (
                    <Segmentado
                      rotulo={`Decisão para ${c.cliente}`}
                      valor={decisoes[c.cliente] ?? c.decisao}
                      onMudar={(v) => {
                        setDecisoes({ ...decisoes, [c.cliente]: v })
                        if (v === 'repassar' && cli) executar(() => repos.servicosAvulsos.criar({ cliente_id: cli.id, descricao: `Custos variáveis repassados (${rotuloCompetencia(COMPETENCIA_ATUAL)})`, valor: c.valor, origem: 'manual', situacao: 'a_faturar', aceite_ref: 'cláusula de repasse de custos de terceiros' }), { sucesso: `Repasse de ${brl(c.valor)} entra na próxima fatura de ${c.cliente}.` })
                      }}
                      opcoes={[
                        { valor: 'absorver', rotulo: 'Absorver' },
                        { valor: 'repassar', rotulo: 'Repassar' },
                      ]}
                    />
                  ) : (
                    <Badge variant="outline">{decisoes[c.cliente] ?? c.decisao}</Badge>
                  )}
                </li>
              )
            })}
          </ul>
        </Caixa>
        <Caixa>
          <Pergunta descricao="Salvos no Fluxo de caixa: a sobra projetada de cada um contra o “como está”.">Cenários de caixa</Pergunta>
          {!fin.cenarios.length ? (
            <p className="text-muted-foreground text-sm">Nenhum cenário salvo. Salve um em Fluxo de caixa › E se…?</p>
          ) : (
            <ul className="flex flex-col gap-1.5 text-sm">
              {[{ id: 'base', nome: 'Como está', ajuste_entradas: 0, ajuste_saidas: 0 }, ...fin.cenarios].map((c) => {
                const x = projecaoCaixa(fin, c.ajuste_entradas, c.ajuste_saidas)
                const s = x.entradas.reduce((t, v, i) => t + (i >= x.inicio ? v - x.saidas[i] : 0), 0)
                return (
                  <li key={c.id} className="flex justify-between gap-2">
                    <span>{c.nome}</span>
                    <span className={cn('tabular-nums', s < 0 && 'text-destructive')}>{sinal(s * 1000)}</span>
                  </li>
                )
              })}
            </ul>
          )}
        </Caixa>
      </div>

      {modal === 'distribuir' && <Distribuir resultado={resultadoMes} onFechar={() => setModal(null)} />}
      {modal === 'regras' && <RegrasComissao onFechar={() => setModal(null)} />}
    </PaginaFin>
  )
}

/** S07-A43 · Fechamentos: fechar (cartão do Administrador) e reabrir com motivo. */
function Fechamentos({ fin, admin, podeFechar, onFechar, atualAberto = true }: { fin: Fin; admin: boolean; podeFechar: boolean; onFechar: () => void; atualAberto?: boolean }) {
  const executar = useAcao()
  const confirmar = useConfirmar()
  const lista = [...fin.fechamentos].sort((a, b) => b.competencia.localeCompare(a.competencia))
  return (
    <Caixa>
      <Pergunta descricao="Fechado bloqueia lançamento retroativo (contas, ajustes, versões de contrato). Reabrir exige motivo e Administrador.">Fechamento do mês</Pergunta>
      <ul className="divide-border/70 flex flex-col divide-y text-sm">
        {lista.map((f) => (
          <li key={f.id} className="flex flex-wrap items-center gap-2 py-2">
            {f.situacao === 'fechado' ? <LockSimpleIcon className="size-4" /> : <LockSimpleOpenIcon className="text-muted-foreground size-4" />}
            <span className="min-w-0 grow basis-40">
              <span className="block">{rotuloCompetencia(f.competencia)}</span>
              <span className="text-muted-foreground block text-xs">
                {f.situacao === 'fechado' ? `fechado por ${f.fechado_por}${f.custo_hora ? ` · custo-hora ${brl(f.custo_hora)}` : ''}` : f.situacao === 'reaberto' ? `reaberto: ${f.motivo_reabertura}` : 'aberto'}
              </span>
            </span>
            <Badge variant={f.situacao === 'fechado' ? 'sucesso' : 'outline'}>{f.situacao}</Badge>
            {admin && f.situacao === 'fechado' && (
              <Button
                size="sm"
                variant="ghost"
                className="rounded-full"
                onClick={async () => {
                  const motivo = await confirmar({ titulo: `Reabrir ${rotuloCompetencia(f.competencia)}?`, descricao: 'Lançamentos retroativos voltam a entrar; o motivo fica no histórico.', acao: 'Reabrir', exigirMotivo: true })
                  if (typeof motivo === 'string') executar(() => repos.fechamentos.reabrir(f.competencia, motivo), { sucesso: `${rotuloCompetencia(f.competencia)} reaberto.` })
                }}
              >
                Reabrir
              </Button>
            )}
          </li>
        ))}
      </ul>
      {podeFechar && atualAberto && (
        <Button size="sm" variant="outline" className="w-fit rounded-full" onClick={onFechar}>
          <LockSimpleIcon /> Fechar {rotuloCompetencia(COMPETENCIA_ATUAL)}
        </Button>
      )}
    </Caixa>
  )
}

/** S07-A40 · Antecipar lucros aos sócios, com memória de cálculo. */
function Distribuir({ resultado, onFechar }: { resultado: number; onFechar: () => void }) {
  const executar = useAcao()
  const [reserva, setReserva] = useState(20)
  const [regra, setRegra] = useState<'participacao' | 'carteira'>('participacao')
  const distribuivel = Math.max(0, resultado * (1 - reserva / 100))
  const parte = (s: (typeof socios)[number]) => (regra === 'participacao' ? s.participacao / 100 : s.nome.startsWith('Fernanda') ? 0.55 : 0.45)
  return (
    <GavetaFormulario
      aberta
      onFechar={onFechar}
      titulo="Antecipar lucros aos sócios"
      descricao="Gera a memória de cálculo e uma conta a pagar por sócio, que segue a alçada como qualquer conta. Fase 4: montado na v1."
      acao="Gerar antecipação"
      onAcao={() => {
        for (const s of socios) executar(() => repos.contasPagar.criar({ titular_tipo: 'escritorio', fornecedor: `Antecipação de lucros · ${s.nome}`, categoria: 'Distribuição de lucros', valor: Math.round(distribuivel * parte(s)), vencimento: '2026-11-30', competencia: '2026-11', origem: 'manual', situacao: 'aguardando_aprovacao', centro_custo_id: 'cc-estrutura', extras: { memoria: `resultado ${brl(resultado)} − reserva ${reserva}% × ${Math.round(parte(s) * 100)}%` } }))
        executar(() => undefined, { sucesso: `Antecipação de ${brl(distribuivel)} gerada: as contas estão em Contas a pagar, para aprovar.` })
        onFechar()
      }}
    >
      <Campo rotulo={`Reserva: ${reserva}%`} ajuda="Fica no caixa para 13º, férias e imprevistos.">{(id) => <input id={id} type="range" min={0} max={50} step={5} value={reserva} onChange={(e) => setReserva(Number(e.target.value))} className="accent-foreground w-full" />}</Campo>
      <Campo rotulo="Regra">
        {() => (
          <Segmentado
            rotulo="Regra"
            valor={regra}
            onMudar={setRegra}
            opcoes={[
              { valor: 'participacao', rotulo: 'Participação no capital' },
              { valor: 'carteira', rotulo: 'Resultado da carteira' },
            ]}
          />
        )}
      </Campo>
      <ul className="bg-sunken/60 flex flex-col gap-1.5 rounded-[14px] p-3 text-sm">
        <li className="text-muted-foreground flex justify-between gap-3 text-xs">
          <span>Memória: resultado {brl(resultado)} − reserva {reserva}%</span>
          <span className="tabular-nums">{brl(distribuivel)}</span>
        </li>
        {socios.map((s) => (
          <li key={s.nome} className="flex justify-between gap-3">
            <span>
              {s.nome} ({Math.round(parte(s) * 100)}%)
            </span>
            <span className="tabular-nums">{brl(distribuivel * parte(s))}</span>
          </li>
        ))}
      </ul>
      <p className="text-muted-foreground text-xs">Regra por carteira só vale se estiver no contrato social; a apuração anual acerta a diferença.</p>
    </GavetaFormulario>
  )
}

/** S07-A41 · Regras de comissão e PLR (FIN-008, GES-012): calculadas sobre o recebido. */
function RegrasComissao({ onFechar }: { onFechar: () => void }) {
  const executar = useAcao()
  const [regras, setRegras] = usePersistente('s07:resultado:regras', { venda: '50% do 1º honorário recebido', indicacao: '5% ao mês por 12 meses', plr: true, meta: 'retenção ≥ 97% e captura do timesheet ≥ 90%' })
  const [d, setD] = useState(regras)
  return (
    <GavetaFormulario
      aberta
      onFechar={onFechar}
      titulo="Comissões e PLR"
      descricao="Calculadas sobre o que foi recebido, não sobre o que foi vendido. Fase 4: montado na v1."
      acao="Salvar"
      onAcao={() => {
        setRegras(d)
        executar(() => undefined, { sucesso: 'Regras de remuneração salvas; a apuração do mês usa daqui em diante.' })
        onFechar()
      }}
    >
      <Campo rotulo="Venda de cliente novo">{(id) => <CampoEscolha id={id} valor={d.venda} onMudar={(v) => setD({ ...d, venda: v })} opcoes={['50% do 1º honorário recebido', '100% do 1º honorário recebido', '10% por 6 meses'].map((x) => ({ valor: x, rotulo: x }))} />}</Campo>
      <Campo rotulo="Indicação de parceiro">{(id) => <CampoEscolha id={id} valor={d.indicacao} onMudar={(v) => setD({ ...d, indicacao: v })} opcoes={['5% ao mês por 12 meses', '1 honorário único', 'desconto ao cliente indicador'].map((x) => ({ valor: x, rotulo: x }))} />}</Campo>
      <Interruptor ligado={d.plr} onMudar={(v) => setD({ ...d, plr: v })} rotulo="PLR semestral" detalhe="Pago na folha do escritório, com as metas medidas pela plataforma." />
      {d.plr && <Campo rotulo="Metas">{(id) => <CampoTexto id={id} valor={d.meta} onMudar={(v) => setD({ ...d, meta: v })} />}</Campo>}
    </GavetaFormulario>
  )
}

import { ArrowSquareOutIcon, CurrencyCircleDollarIcon, ScalesIcon, SparkleIcon } from '@phosphor-icons/react'
import { useMemo, useState } from 'react'
import { useLoja, useNavegacao } from '@/ambiente/loja'
import { EstadoVazio } from '@/components/kit'
import { AreaRolagem } from '@/components/ui/area-rolagem'
import { Button } from '@/components/ui/button'
import { CampoEscolha, Interruptor } from '@/components/ui/formulario'
import { competenciaDe, HOJE_TS, mesesPt, rotuloCompetencia, somarMeses } from '@/dados/timesheet-tempo'
import { ProporReajuste } from './acoes'
import { Caixa, CabecalhoTs, Faixa, Numero, TimesheetVazio, usePacote } from './comum'
import { CustoHora } from './configuracao'
import { brl, pctTxt, rentabilidadeDe, serieMargem, useTimesheet } from './dados'
import { Barras, Divergente, Linha12, Pergunta } from './graficos'

/**
 * Timesheet › Rentabilidade (05, 8.4; Administrador e Gestor com Gestão ou
 * Financeiro): custo do cliente = horas × custo-hora do escritório +
 * variáveis (integrantes, serviços). Margem em barras divergentes, deficitários
 * (2 dos últimos 3 meses), evolução de 12 meses com marcos, reajuste pelo
 * integrante de Gestão e a ligação ao Financeiro. O valor do custo-hora só o
 * Administrador vê; o valor-hora de cobrança (Jurídico), o Gestor também.
 */
export function RentabilidadeTela({ papel, clienteId }: { papel: 'gestor' | 'admin'; clienteNome?: string; clienteId?: string | null }) {
  const ts = useTimesheet()
  const loja = useLoja()
  const nav = useNavegacao()
  const admin = papel === 'admin'
  const atual = competenciaDe(HOJE_TS)
  const [competencia, setCompetencia] = useState(somarMeses(atual, -1))
  const [soMedidas, setSoMedidas] = useState(false)
  const [grupo, setGrupo] = useState('todos')
  const [setor, setSetor] = useState('todos')
  const [sel, setSel] = useState<string | null>(clienteId ?? null)
  const [editandoCusto, setEditandoCusto] = useState(false)
  const [reajuste, setReajuste] = useState(false)
  const { pacote, chip } = usePacote()
  const custoHora = ts.custoAtual?.valor ?? 0
  const custoBpo = loja.estado.custoPorPacote ? (ts.custoAtual?.valor_bpo ?? custoHora) : custoHora
  const grupos = useMemo(() => [...new Set(ts.clientes.map((c) => (c.extras?.grupo as string | undefined) ?? '').filter(Boolean))], [ts.clientes])

  const linhas = useMemo(() => (custoHora ? rentabilidadeDe(ts, competencia, pacote, soMedidas, custoHora, custoBpo) : []), [ts, competencia, pacote, soMedidas, custoHora, custoBpo])
  const filtradas = linhas.filter((l) => (grupo === 'todos' || ts.clientes.find((c) => c.id === l.cliente_id)?.extras?.grupo === grupo) && (setor === 'todos' || l.porSetor.some((p) => p.nome === setor)))
  const comContrato = filtradas.filter((l) => l.margem != null)
  const honorarios = comContrato.reduce((s, l) => s + l.honorario!, 0)
  const custoTotal = comContrato.reduce((s, l) => s + l.custo, 0)
  const deficit = comContrato.filter((l) => l.deficitario)
  const escolhido = filtradas.find((l) => l.cliente_id === (sel ?? clienteId)) ?? [...comContrato].sort((a, b) => a.margem! - b.margem!)[0] ?? filtradas[0]
  const serie = escolhido ? serieMargem(ts, escolhido.cliente_id, pacote, custoHora) : []
  const pontos = serie.filter((p) => p.pct != null)
  const setoresVistos = [...new Set(linhas.flatMap((l) => l.porSetor.map((p) => p.nome)))]
  const meses = Array.from({ length: 12 }, (_, i) => somarMeses(atual, -i))

  if (ts.vazio) return <TimesheetVazio />

  return (
    <AreaRolagem className="h-full px-3 pb-10 sm:px-5">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 pt-1 ultra:max-w-[1600px]">
        <CabecalhoTs
          titulo="Rentabilidade"
          sub={`${rotuloCompetencia(competencia)}${competencia === atual ? ' (até hoje, honorário proporcional)' : ''} · horas medidas × custo-hora do escritório (todos os pacotes)${loja.estado.custoPorPacote ? '; BPO com o custo-hora do pacote' : ''}, contra o honorário do contrato vigente`}
          papel={papel}
        >
          {chip}
          <span className="w-40">
            <CampoEscolha rotulo="Competência" valor={competencia} onMudar={setCompetencia} opcoes={meses.map((m) => ({ valor: m, rotulo: m === atual ? `${mesesPt[Number(m.slice(5)) - 1]} (parcial)` : rotuloCompetencia(m) }))} />
          </span>
          {admin ? (
            <Button size="sm" variant="outline" className="rounded-full" onClick={() => setEditandoCusto(true)}>
              <CurrencyCircleDollarIcon /> Custo-hora: {custoHora ? brl(custoHora) : 'definir'}
            </Button>
          ) : (
            <span className="text-muted-foreground text-xs">Custo-hora definido pelo Administrador</span>
          )}
        </CabecalhoTs>

        {!custoHora ? (
          <EstadoVazio
            icone={CurrencyCircleDollarIcon}
            titulo="O custo-hora do escritório ainda não foi definido"
            descricao="Sem ele não há margem: o custo do cliente é horas × custo-hora + variáveis. O Administrador define pelos gastos do mês ou informa o valor."
            acao={
              admin ? (
                <Button className="rounded-full" onClick={() => setEditandoCusto(true)}>
                  Definir o custo-hora
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <Caixa>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <Numero valor={brl(honorarios)} rotulo="honorários da carteira" />
                <Numero valor={brl(custoTotal)} rotulo="custo medido" />
                <Numero valor={honorarios ? pctTxt(((honorarios - custoTotal) / honorarios) * 100) : '—'} rotulo="margem" />
                <Numero valor={deficit.length} rotulo={deficit.length === 1 ? 'cliente deficitário' : 'clientes deficitários'} detalhe="margem negativa em 2 dos últimos 3 meses" />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Interruptor ligado={soMedidas} onMudar={setSoMedidas} rotulo="Só horas medidas e confirmadas" detalhe="Tira as estimadas. A diferença mostra o quanto a captura ainda falha." />
                {grupos.length > 0 && (
                  <span className="w-44">
                    <CampoEscolha rotulo="Grupo" valor={grupo} onMudar={setGrupo} opcoes={[{ valor: 'todos', rotulo: 'Todos os grupos' }, ...grupos.map((g) => ({ valor: g, rotulo: g }))]} />
                  </span>
                )}
                {setoresVistos.length > 1 && (
                  <span className="w-44">
                    <CampoEscolha rotulo="Setor" valor={setor} onMudar={setSetor} opcoes={[{ valor: 'todos', rotulo: 'Todos os setores' }, ...setoresVistos.map((s) => ({ valor: s, rotulo: s }))]} />
                  </span>
                )}
              </div>
            </Caixa>

            {!filtradas.length ? (
              <EstadoVazio compacto titulo="Nenhum cliente com horas nesta competência" descricao={competencia < somarMeses(atual, -1) && !ts.fechamentos.some((f) => f.competencia === competencia) ? 'Este mês não foi fechado no Timesheet.' : 'Troque a competência, o pacote ou o filtro.'} />
            ) : (
              <>
                <Caixa>
                  <Pergunta acao={<span className="text-muted-foreground text-xs">clique num cliente para ver o detalhe</span>}>Quais clientes dão prejuízo?</Pergunta>
                  <Divergente
                    dados={[...comContrato].sort((a, b) => a.margem! - b.margem!).map((l) => ({ nome: l.nome, valor: Math.round(l.margem!), pct: Math.round(l.pct!), detalhe: `${String(l.horas).replace('.', ',')} h · hon. ${brl(l.honorario!)}${l.deficitario ? ' · deficitário' : ''}` }))}
                    selecionado={escolhido?.nome}
                    onSelecionar={(n) => setSel(filtradas.find((l) => l.nome === n)?.cliente_id ?? null)}
                  />
                  {filtradas.some((l) => l.margem == null) && (
                    <p className="text-muted-foreground text-xs" data-testid="ts-sem-contrato">
                      Sem contrato estruturado (honorário não informado, margem em branco):{' '}
                      {filtradas
                        .filter((l) => l.margem == null)
                        .map((l) => `${l.nome}, ${String(l.horas).replace('.', ',')} h`)
                        .join('; ')}
                      .
                    </p>
                  )}
                </Caixa>

                {escolhido && (
                  <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
                    <Caixa>
                      <Pergunta
                        acao={
                          <Button size="sm" className="rounded-full" onClick={() => setReajuste(true)}>
                            <SparkleIcon /> Propor reajuste
                          </Button>
                        }
                      >
                        {escolhido.nome}: a margem está piorando?
                      </Pergunta>
                      {pontos.length > 1 ? (
                        <Linha12
                          valores={pontos.map((p) => p.pct!)}
                          rotulos={pontos.map((p) => mesesPt[Number(p.competencia.slice(5)) - 1].slice(0, 3))}
                          marcos={pontos.flatMap((p, i) => p.marcos.map((m) => ({ mes: i, texto: m })))}
                        />
                      ) : (
                        <p className="text-muted-foreground py-8 text-center text-sm">{escolhido.honorario != null ? 'Sem histórico de margem: o cliente (ou o pacote) começou há pouco.' : 'Sem histórico de margem: honorário não informado.'}</p>
                      )}
                      <p className="text-muted-foreground text-xs">Margem % mês a mês. Pontos em destaque: marcos (reajuste, mudança de regime, faixa estourada, admissões).</p>
                      {pontos.length > 0 && (
                        <div className="grid grid-cols-3 gap-3 border-t pt-3">
                          <Numero valor={pctTxt(pontos.reduce((s, p) => s + p.pct!, 0) / pontos.length)} rotulo="margem média em 12 meses" />
                          <Numero valor={pctTxt(Math.min(...pontos.map((p) => p.pct!)))} rotulo={`pior mês (${mesesPt[Number(pontos.find((p) => p.pct === Math.min(...pontos.map((x) => x.pct!)))!.competencia.slice(5)) - 1].slice(0, 3)})`} />
                          <Numero valor={`${String(escolhido.horas).replace('.', ',')} h`} rotulo={`horas em ${mesesPt[Number(competencia.slice(5)) - 1]}`} />
                        </div>
                      )}
                    </Caixa>
                    <div className="flex flex-col gap-4">
                      <Caixa>
                        <Pergunta
                          acao={
                            <Button size="sm" variant="ghost" className="rounded-full" onClick={() => nav.irPara({ modulo: 'financeiro', aba: 'resultado' })}>
                              <ArrowSquareOutIcon /> DRE e contrato
                            </Button>
                          }
                        >
                          De onde vem o custo?
                        </Pergunta>
                        <dl className="grid grid-cols-2 gap-2 text-sm">
                          {[
                            ['Horas × custo-hora', admin ? `${String(escolhido.horas).replace('.', ',')} h × ${brl(custoHora)}` : `${String(escolhido.horas).replace('.', ',')} h`],
                            ['Variáveis (agentes, serviços)', brl(escolhido.variaveis)],
                            ['Custo do período', brl(escolhido.custo)],
                            ['Honorário', escolhido.honorario != null ? brl(escolhido.honorario) : 'não informado'],
                          ].map(([k, v]) => (
                            <div key={k} className="bg-sunken rounded-[12px] px-3 py-2">
                              <dt className="text-muted-foreground text-[11px]">{k}</dt>
                              <dd className="font-medium tabular-nums">{v}</dd>
                            </div>
                          ))}
                        </dl>
                        {escolhido.horasEstimadas > 0 && <p className="text-muted-foreground text-xs">Inclui {String(escolhido.horasEstimadas).replace('.', ',')} h estimadas {soMedidas ? '(tiradas pelo filtro)' : ''}.</p>}
                      </Caixa>
                      <Caixa>
                        <Pergunta>Em que setores foram as horas?</Pergunta>
                        <Barras dados={escolhido.porSetor.map((p) => ({ nome: p.nome, h: p.h }))} />
                        {escolhido.porAtividade.length > 0 && (
                          <>
                            <Pergunta>E em que atividades?</Pergunta>
                            <Barras dados={escolhido.porAtividade} />
                          </>
                        )}
                      </Caixa>
                    </div>
                  </div>
                )}
              </>
            )}

            <Faixa icone={<ScalesIcon weight="duotone" className="text-warning size-5 shrink-0" />}>
              <strong className="font-medium">Valor-hora de cobrança: {brl(ts.cfg.valor_hora_cobranca)}</strong> · distinto do custo-hora, é o preço da hora nas pré-faturas por hora (pacote Jurídico). O Gestor e o advogado veem; {ts.temJuridico ? 'filtre pelo chip Jurídico para ver as horas cobráveis.' : 'aparece no chip de pacote quando o Jurídico estiver contratado.'}
            </Faixa>
          </>
        )}
      </div>

      {editandoCusto && <CustoHora onFechar={() => setEditandoCusto(false)} />}
      {reajuste && escolhido && <ProporReajuste r={escolhido} custoHora={custoHora} onFechar={() => setReajuste(false)} />}
    </AreaRolagem>
  )
}

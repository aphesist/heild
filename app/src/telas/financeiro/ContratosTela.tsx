import { ArrowFatLinesUpIcon, CertificateIcon, ClipboardTextIcon, FileArrowUpIcon, FileTextIcon, MagnifyingGlassIcon, PenNibIcon, PlusIcon, ReceiptIcon, TrashIcon, WarningIcon, XIcon } from '@phosphor-icons/react'
import { useEffect, useMemo, useState } from 'react'
import { useLoja, useNavegacao } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import { BotaoAcoes, CaixaSelecao, EstadoVazio, SeloDemonstracao, useAcao, useConfirmar, useSelecao } from '@/components/kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Campo, CampoArea, CampoEscolha, CampoTexto, Fichas, GavetaFormulario, Interruptor, Passos, Segmentado } from '@/components/ui/formulario'
import { rentabilidade } from '@/dados/timesheet'
import { cn } from '@/lib/utils'
import type { ContratoHonorarios, ServicoContrato } from '@/nucleo/modelo/financeiro'
import { useTabela } from '@/nucleo/react'
import { useItemNaRota } from '@/nucleo/rotas'
import { repos } from '@/nucleo/repositorios'
import { carteiraAgregada } from '@/nucleo/semente/s07'
import { servicos as apis } from '@/servicos'
import { BarrasReais, brl, CabecalhoFin, Caixa, CartoesDaAba, ModaisConfig, Nota, Numero, PaginaFin, Pergunta } from './comum'
import { useFin, useIntegranteFin, usePodeFin, type ContratoTela, type Fin } from './dados'
import { COMPETENCIA_ATUAL, dataCurta, HOJE, indiceAcumulado, mesesExtenso, proximaCompetencia, PROXIMA_COMPETENCIA, rotuloCompetencia, rotuloMeio, servicos, somarDias } from './dominio'

const numero = (s: string) => Number(s.replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '')) || 0
const rotuloContrato: Record<ContratoHonorarios['situacao'], string> = { rascunho: 'rascunho', aguardando_assinatura: 'aguardando assinatura', ativo: 'vigente', suspenso: 'suspenso', encerrado: 'encerrado', cancelado: 'cancelado' }
/** Margem atual do cliente na Rentabilidade do Timesheet (S06): horas medidas × custo-hora contra o honorário. */
export const margemDe = (cliente: string) => rentabilidade.find((r) => r.cliente === cliente)?.serie.at(-1)

/**
 * S07-T02 · Financeiro › Contratos (FIN-001; GES-002, 008, 012, 014, 015):
 * contrato de honorários como assinatura estruturada e versionada; a receita
 * contratada; quem passou da faixa; extras, reembolsos, comandas (C2-25) e o
 * certificado digital como serviço (C2-23, fase 3); a campanha de reajuste.
 */
export function ContratosTela({ somenteLeitura = false, contratoInicial }: { somenteLeitura?: boolean; contratoInicial?: string } = {}) {
  const fin = useFin()
  const loja = useLoja()
  const integrante = useIntegranteFin()
  const podeEditar = usePodeFin('contrato.aditar') && !somenteLeitura
  const podeExtra = usePodeFin('avulso.registrar') && !somenteLeitura
  const podeReajuste = usePodeFin('reajuste.aplicar') && !somenteLeitura
  const [filtro, setFiltro] = useState<'todos' | 'atencao' | 'sem'>('todos')
  const [busca, setBusca] = useState('')
  const [aberto, setAberto] = useState<string | undefined>(contratoInicial)
  const [ed, setEd] = useState<{ contrato?: ContratoTela; clienteId?: string } | null>(null)
  const [modal, setModal] = useState<'extra' | 'reajuste' | null>(null)
  const [importar, setImportar] = useState(false)
  const admin = useSessao().usuario.papel === 'administrador'
  useItemNaRota({ contrato: aberto })
  const andrade = fin.contratos.length > 0 && fin.clientes.some((c) => c.id === 'c1')
  const agregado = andrade ? carteiraAgregada : { clientes: 0, receita: 0, semContrato: 0 }
  const receita = fin.contratos.filter((c) => c.situacao === 'ativo').reduce((s, c) => s + c.total, 0) + agregado.receita
  const porSetor = useMemo(() => {
    const m = new Map<string, number>()
    for (const c of fin.contratos) for (const i of c.itens) m.set(servicos[i.servico].rotulo, (m.get(servicos[i.servico].rotulo) ?? 0) + i.valor)
    return [...m.entries()].map(([nome, h]) => ({ nome, h })).sort((a, b) => b.h - a.h)
  }, [fin.contratos])
  const porRegime = useMemo(() => {
    const m = new Map<string, number>()
    for (const c of fin.contratos) m.set(c.regime, (m.get(c.regime) ?? 0) + c.total)
    return [...m.entries()].map(([nome, h]) => ({ nome, h })).sort((a, b) => b.h - a.h)
  }, [fin.contratos])
  const estouradas = fin.contratos.filter((c) => c.faixa_estourada)
  const comunicados = fin.aditivos.filter((a) => a.tipo === 'reajuste' && a.situacao === 'comunicado')
  const lista = fin.contratos
    .filter((c) => (filtro === 'todos' ? true : filtro === 'atencao' ? !!c.faixa_estourada || c.situacao !== 'ativo' : false))
    .filter((c) => !busca || c.cliente.toLowerCase().includes(busca.toLowerCase()))
  const contrato = fin.contratos.find((c) => c.id === aberto)

  if (fin.politica && !fin.contratos.length)
    return (
      <PaginaFin fin={fin}>
        <CabecalhoFin titulo="Contratos" sub="Nenhum contrato estruturado ainda" status="Assim que os contratos chegarem, eu preparo o faturamento do mês." />
        <Caixa>
          <EstadoVazio
            icone={FileTextIcon}
            titulo="Nenhum contrato estruturado"
            descricao="Traga os contratos da ferramenta atual (Conexa, Omie, Conta Azul, Nibo, Domínio Honorários ou planilha) ou crie um por cliente. O contrato vira a base do faturamento, da rentabilidade e do app do cliente."
            acao={
              podeEditar && (
                <span className="flex flex-wrap justify-center gap-2">
                  {admin && (
                    <Button className="rounded-full" onClick={() => setImportar(true)}>
                      <FileArrowUpIcon /> Trazer o financeiro atual
                    </Button>
                  )}
                  <Button variant={admin ? 'outline' : 'default'} className="rounded-full" onClick={() => setEd({})}>
                    <PlusIcon /> Novo contrato
                  </Button>
                </span>
              )
            }
          />
          <p className="text-muted-foreground text-center text-xs">Importar também fica em Configurar › Trazer o financeiro atual (Administrador).</p>
        </Caixa>
        {ed && <EditarContrato fin={fin} {...ed} onFechar={() => setEd(null)} />}
        <ModaisConfig aberto={importar ? 'importar' : null} onFechar={() => setImportar(false)} />
      </PaginaFin>
    )

  return (
    <PaginaFin fin={fin}>
      <CabecalhoFin
        titulo="Contratos"
        exportar="contratos"
        status={estouradas.length ? `${estouradas.length === 1 ? '1 cliente passou' : `${estouradas.length} clientes passaram`} da faixa; proponho aditivo ou cobrança do excedente, você escolhe` : 'Contratos em dia; o próximo reajuste eu preparo 60 dias antes'}
        sub={`Honorários de ${fin.contratos.length + agregado.clientes} clientes · cada mudança vira uma versão nova, a partir de uma competência`}
      >
        {somenteLeitura ? (
          <Badge variant="outline">somente leitura · liberado pelo Administrador</Badge>
        ) : (
          podeEditar && (
            <Button size="sm" className="rounded-full" onClick={() => setEd({})}>
              <PlusIcon /> Novo contrato
            </Button>
          )
        )}
      </CabecalhoFin>

      {!somenteLeitura && <CartoesDaAba fin={fin} aba="contratos" />}

      <Caixa>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Numero valor={brl(receita)} rotulo="receita contratada por mês" detalhe={agregado.clientes ? `${fin.contratos.length} contratos de exemplo + ${agregado.clientes} da carteira` : undefined} />
          <Numero valor={fin.contratos.length + agregado.clientes} rotulo="clientes com contrato estruturado" detalhe={`${fin.semContrato.length + agregado.semContrato} sem contrato: honorário não informado`} />
          <Numero valor={estouradas.length} rotulo="passaram da faixa contratada" detalhe="notas, funcionários ou lançamentos" />
          <Numero valor={fin.contratos.filter((c) => c.data_base === Number(proximaCompetencia(PROXIMA_COMPETENCIA).slice(5))).length + (agregado.clientes ? 23 : 0)} rotulo={`reajustes em ${mesesExtenso[Number(proximaCompetencia(PROXIMA_COMPETENCIA).slice(5)) - 1]}`} detalhe={`${comunicados.length} carta(s) já enviada(s)`} />
        </div>
      </Caixa>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <Caixa>
          <Pergunta descricao="Pelos itens vigentes dos contratos de exemplo; serviços avulsos ficam fora.">De onde vem a receita?</Pergunta>
          <h3 className="text-muted-foreground text-xs">Por setor</h3>
          <BarrasReais dados={porSetor} />
          <h3 className="text-muted-foreground mt-1 text-xs">Por regime do cliente</h3>
          <BarrasReais dados={porRegime} />
          {fin.semContrato.length > 0 && (
            <>
              <h3 className="text-muted-foreground mt-1 text-xs">Sem contrato estruturado</h3>
              <ul className="flex flex-wrap gap-1.5">
                {fin.semContrato.map((c) => (
                  <li key={c.id}>
                    <button type="button" disabled={!podeEditar} onClick={() => setEd({ clienteId: c.id })} className="bg-sunken/70 hover:bg-raised flex cursor-pointer items-center gap-1 rounded-full px-3 py-1 text-xs disabled:cursor-default">
                      {podeEditar && <PlusIcon className="size-3" />} {c.nome}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Caixa>
        <div className="flex flex-col gap-4">
          <Caixa>
            <Pergunta descricao="Medido todo mês contra a faixa do item (GES-015). Nunca muda sozinho.">Quem passou da faixa?</Pergunta>
            {!estouradas.length && <p className="text-muted-foreground text-sm">Ninguém acima da faixa este mês.</p>}
            <ul className="flex flex-col gap-3">
              {estouradas.map((c) => {
                const excedente = c.cliente.startsWith('Loja') ? 336 : 300
                return (
                  <li key={c.id} className="flex flex-col gap-1.5 text-sm">
                    <span className="flex items-start gap-2">
                      <WarningIcon className="text-warning mt-0.5 size-4 shrink-0" weight="fill" />
                      <span className="min-w-0">
                        <span className="block font-medium">{c.cliente}</span>
                        <span className="text-muted-foreground block text-xs">{c.faixa_estourada}</span>
                      </span>
                    </span>
                    {podeEditar && (
                      <span className="flex flex-wrap gap-1.5 pl-6">
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full"
                          onClick={() =>
                            integrante.pedirCartao({
                              id: `aditivo-${c.id}`,
                              acao: { tipo: 'aditivo_assinatura', contrato_id: c.id, resumo: `Aditivo de faixa: ${c.faixa_estourada}` },
                              resumo: `Mandar aditivo de faixa para assinatura · ${c.cliente}`,
                              argumentos: [
                                { rotulo: 'Contrato', valor: `${c.numero} v${c.versao}` },
                                { rotulo: 'Motivo', valor: c.faixa_estourada ?? '' },
                                { rotulo: 'Vale de', valor: rotuloCompetencia(PROXIMA_COMPETENCIA) },
                              ],
                              texto: `Preparei o aditivo de faixa da ${c.cliente}: a minuta vai para assinatura eletrônica do sócio quando você aprovar.`,
                              aba: 'contratos',
                              alcada: 'gestor',
                              ferramenta: 'contrato.enviar_aditivo',
                              cliente_id: c.cliente_id,
                            })
                          }
                        >
                          <PenNibIcon /> Propor aditivo
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="rounded-full"
                          onClick={() =>
                            integrante.pedirCartao({
                              id: `faixa-${c.id}`,
                              acao: { tipo: 'cobrar_extra_faixa', contrato_id: c.id, valor: excedente, descricao: `Excedente da faixa: ${c.faixa_estourada}` },
                              resumo: `Cobrar o excedente da faixa como extra · ${c.cliente}`,
                              argumentos: [
                                { rotulo: 'Valor', valor: brl(excedente, true) },
                                { rotulo: 'Base', valor: 'cláusula de excedente' },
                                { rotulo: 'Entra em', valor: `fatura de ${rotuloCompetencia(PROXIMA_COMPETENCIA)}` },
                              ],
                              texto: `Calculei o excedente da ${c.cliente} pela cláusula do contrato: ${brl(excedente, true)}. Aprovando, entra na próxima fatura como linha separada.`,
                              aba: 'contratos',
                              alcada: 'gestor',
                              ferramenta: 'avulso.registrar',
                              cliente_id: c.cliente_id,
                            })
                          }
                        >
                          Cobrar como extra
                        </Button>
                      </span>
                    )}
                  </li>
                )
              })}
            </ul>
          </Caixa>
          <Caixa className="flex-1">
            <Pergunta
              acao={
                podeReajuste && (
                  <Button size="sm" className="rounded-full" onClick={() => setModal('reajuste')}>
                    <ArrowFatLinesUpIcon /> Campanha
                  </Button>
                )
              }
              descricao="Sempre por cartão; nunca retroativo; carta com 30 dias de antecedência."
            >
              Reajuste de janeiro
            </Pergunta>
            {comunicados.length ? (
              <ul className="flex flex-col gap-1.5 text-sm">
                {comunicados.map((a) => (
                  <li key={a.id} className="flex items-center gap-2">
                    <Badge variant="outline">carta enviada</Badge>
                    <span className="min-w-0 flex-1 truncate">
                      {fin.contratos.find((c) => c.id === a.contrato_id)?.cliente} · {a.diff[0]?.antes} → {a.diff[0]?.depois}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">Nenhuma carta enviada ainda.</p>
            )}
            {comunicados.length > 0 && podeEditar && (
              <Button
                size="sm"
                variant="outline"
                className="w-fit rounded-full"
                onClick={() =>
                  integrante.pedirCartao({
                    id: `aplicar-reajuste-${comunicados.map((a) => a.id).join('-').slice(0, 40)}`,
                    acao: { tipo: 'aplicar_reajuste', competencia: comunicados[0].vigente_de, indice: comunicados[0].resumo.match(/pelo (\S+)/)?.[1] ?? 'índice', contratos: comunicados.map((a) => ({ id: a.contrato_id, percentual: Number(a.resumo.match(/\(([\d,]+)%\)/)?.[1]?.replace(',', '.') ?? 0) })) },
                    resumo: `Aplicar o reajuste de ${rotuloCompetencia(comunicados[0].vigente_de)} a ${comunicados.length} contrato(s)`,
                    argumentos: [
                      { rotulo: 'Contratos', valor: String(comunicados.length) },
                      { rotulo: 'A partir de', valor: rotuloCompetencia(comunicados[0].vigente_de) },
                      { rotulo: 'Retroativo', valor: 'nunca' },
                    ],
                    texto: 'As cartas saíram e ninguém contestou. Quando você aprovar, a versão nova de cada contrato vale a partir da data-base.',
                    aba: 'contratos',
                    alcada: 'administrador',
                    ferramenta: 'reajuste.aplicar',
                  })
                }
              >
                Aplicar na data-base
              </Button>
            )}
          </Caixa>
        </div>
      </div>

      <Caixa>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="flex-1 text-sm font-medium">Contratos</h2>
          <span className="relative">
            <MagnifyingGlassIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <input aria-label="Buscar cliente" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar cliente" className="bg-sunken/60 h-8 w-44 rounded-full pr-3 pl-8 text-sm outline-none" />
          </span>
          <Segmentado
            rotulo="Filtro"
            valor={filtro}
            onMudar={setFiltro}
            opcoes={[
              { valor: 'todos', rotulo: 'Todos' },
              { valor: 'atencao', rotulo: 'Pedem atenção' },
              { valor: 'sem', rotulo: `Sem contrato (${fin.semContrato.length})` },
            ]}
          />
        </div>
        {filtro === 'sem' ? (
          <ul className="divide-border/70 flex flex-col divide-y">
            {fin.semContrato.map((c) => (
              <li key={c.id} className="flex items-center gap-3 py-2.5 text-sm">
                <span className="min-w-0 flex-1">{c.nome}</span>
                <Badge variant="erro">sem contrato</Badge>
                {podeEditar && (
                  <Button size="sm" variant="outline" className="rounded-full" onClick={() => setEd({ clienteId: c.id })}>
                    Criar contrato
                  </Button>
                )}
              </li>
            ))}
            {!fin.semContrato.length && <li className="text-muted-foreground py-3 text-sm">Todos os clientes têm contrato estruturado.</li>}
          </ul>
        ) : (
          <ul className="divide-border/70 flex flex-col divide-y">
            {lista.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => setAberto(c.id)}
                  className="hover:bg-sunken/60 -mx-2 grid w-[calc(100%+1rem)] cursor-pointer grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 rounded-md px-2 py-2.5 text-left text-sm md:grid-cols-[minmax(0,1.3fr)_minmax(0,1.5fr)_minmax(10rem,max-content)_minmax(8rem,max-content)]"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{c.cliente}</span>
                    <span className="text-muted-foreground block text-xs">
                      {c.numero} · {c.regime} · v{c.versao} desde {rotuloCompetencia(c.vigente_de)}
                    </span>
                  </span>
                  <span className="text-muted-foreground col-span-2 row-start-2 truncate text-xs md:col-span-1 md:col-start-2 md:row-start-1">{c.itens.map((i) => i.descricao).join(' · ')}</span>
                  <span className="text-right md:col-start-3">
                    <span className="block tabular-nums">{brl(c.total)}</span>
                    <span className="text-muted-foreground block text-xs">
                      dia {c.dia_vencimento} · {rotuloMeio[c.meio_pagamento]}
                    </span>
                  </span>
                  <span className="hidden justify-end md:flex">
                    <Badge variant={c.faixa_estourada ? 'destaque' : c.situacao === 'ativo' ? 'sucesso' : 'outline'}>{c.faixa_estourada ? 'acima da faixa' : rotuloContrato[c.situacao]}</Badge>
                  </span>
                </button>
              </li>
            ))}
            {!lista.length && <li className="text-muted-foreground py-3 text-sm">Nenhum contrato com esse filtro.</li>}
            {agregado.clientes > 0 && filtro === 'todos' && !busca && <li className="text-muted-foreground py-2.5 text-xs">e mais {agregado.clientes} contratos vigentes da carteira (fora da demonstração)…</li>}
          </ul>
        )}
      </Caixa>

      <ExtrasAFaturar fin={fin} podeEditar={podeExtra} onRegistrar={() => setModal('extra')} />

      {contrato && <DetalheContrato fin={fin} c={contrato} podeEditar={podeEditar} onFechar={() => setAberto(undefined)} onEditar={() => {
            setAberto(undefined)
            setEd({ contrato })
          }} />}
      {ed && <EditarContrato fin={fin} {...ed} onFechar={() => setEd(null)} />}
      {modal === 'extra' && <NovoExtra fin={fin} onFechar={() => setModal(null)} />}
      {modal === 'reajuste' && <CampanhaReajuste fin={fin} onFechar={() => setModal(null)} onEnviado={() => loja.toast('Campanha preparada: o cartão está no topo da aba e no chat do Financeiro.')} />}
    </PaginaFin>
  )
}

/** S07-A04 · Detalhe do contrato: itens e vigências, aditivos, linha do tempo e "contrato × cobrança". */
function DetalheContrato({ fin, c, podeEditar, onFechar, onEditar }: { fin: Fin; c: ContratoTela; podeEditar: boolean; onFechar: () => void; onEditar: () => void }) {
  const nav = useNavegacao()
  const eventos = useTabela('evento')
  const [aba, setAba] = useState<'itens' | 'aditivos' | 'cobranca' | 'historico'>('itens')
  const historicoItens = fin.itensTodos.filter((i) => i.contrato_id === c.id).sort((a, b) => b.vigente_de.localeCompare(a.vigente_de))
  const aditivos = fin.aditivos.filter((a) => a.contrato_id === c.id).sort((a, b) => b.versao_para - a.versao_para)
  const cobrancas = fin.cobrancas.filter((x) => x.cliente_id === c.cliente_id).slice(0, 6)
  const linha = eventos.filter((e) => e.resultado_ref === c.id || (e.cliente_id === c.cliente_id && e.setor_id === 'financeiro_escritorio')).sort((a, b) => b.criado_em.localeCompare(a.criado_em)).slice(0, 30)
  const margem = margemDe(c.cliente)
  return (
    <GavetaFormulario
      aberta
      largura="lg"
      onFechar={onFechar}
      titulo={`${c.numero} · ${c.cliente}`}
      descricao={`Versão ${c.versao}, vigente desde ${rotuloCompetencia(c.vigente_de)} · ${rotuloContrato[c.situacao]}`}
      acao={podeEditar ? 'Editar (nova versão)' : 'Fechar'}
      onAcao={podeEditar ? onEditar : onFechar}
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Numero valor={brl(c.total)} rotulo="por mês" />
        <Numero valor={`dia ${c.dia_vencimento}`} rotulo={rotuloMeio[c.meio_pagamento]} />
        <Numero valor={c.indice} rotulo={c.data_base ? `data-base: ${mesesExtenso[c.data_base - 1]}` : 'sem reajuste'} />
        <Numero valor={margem === undefined ? '—' : `${margem}%`} rotulo="margem no Timesheet" detalhe={margem !== undefined && margem < 5 ? 'deficitário' : undefined} />
      </div>
      {c.faixa_estourada && (
        <Nota tom="alerta">
          <WarningIcon className="text-warning mr-1 inline size-4" weight="fill" /> {c.faixa_estourada}
        </Nota>
      )}
      <Segmentado
        rotulo="Parte do contrato"
        valor={aba}
        onMudar={setAba}
        opcoes={[
          { valor: 'itens', rotulo: 'Itens' },
          { valor: 'aditivos', rotulo: `Aditivos (${aditivos.length})` },
          { valor: 'cobranca', rotulo: 'Contrato × cobrança' },
          { valor: 'historico', rotulo: 'Linha do tempo' },
        ]}
      />
      {aba === 'itens' && (
        <ul className="divide-border/70 flex flex-col divide-y text-sm">
          {historicoItens.map((i) => (
            <li key={i.id} className={cn('grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 py-2', i.vigente_ate && 'opacity-50')}>
              <span className="min-w-0">
                <span className="block">
                  {i.descricao} <span className="text-muted-foreground">· {servicos[i.servico].rotulo}</span>
                </span>
                <span className="text-muted-foreground block text-xs">
                  {i.faixa ? `${i.faixa} · ` : ''}
                  {i.tipo_cobranca === 'fixo' ? 'fixo' : i.tipo_cobranca === 'por_faixa' ? 'por faixa' : 'por unidade'} · vale de {rotuloCompetencia(i.vigente_de)}
                  {i.vigente_ate ? ` até ${rotuloCompetencia(i.vigente_ate)} (fechado)` : ''}
                </span>
              </span>
              <span className="tabular-nums">{brl(i.valor)}</span>
            </li>
          ))}
          <li className="text-muted-foreground py-2 text-xs">
            13º: {c.politica_13o === 'dezembro' ? 'parcela única em dezembro' : c.politica_13o === 'nenhum' ? 'sem 13º' : c.politica_13o} · retenções: {c.retencoes.join(', ') || 'nenhuma'} · centro de custo: {fin.centros.find((x) => x.id === c.centro_custo_id)?.nome ?? '—'}
            {c.indicado_por ? ` · indicado por ${c.indicado_por}` : ''}
          </li>
        </ul>
      )}
      {aba === 'aditivos' && (
        <ul className="flex flex-col gap-2 text-sm">
          {aditivos.map((a) => (
            <li key={a.id} className="bg-sunken/50 rounded-lg px-3 py-2">
              <span className="flex flex-wrap items-center gap-2">
                <span className="font-medium">v{a.versao_para}</span>
                <span className="min-w-0 grow basis-40">{a.resumo}</span>
                <Badge variant={a.situacao === 'vigente' || a.situacao === 'aceito' ? 'sucesso' : 'destaque'}>{a.situacao.replace('_', ' ')}</Badge>
              </span>
              <span className="text-muted-foreground block text-xs">
                vale de {rotuloCompetencia(a.vigente_de)}
                {a.diff.length ? ` · ${a.diff.map((d) => `${d.campo}: ${d.antes} → ${d.depois}`).join('; ')}` : ''}
                {a.assinatura ? ` · ${a.assinatura.assinada_em ? 'assinado' : 'aguardando assinatura'} (${a.assinatura.provedor})` : ''}
              </span>
            </li>
          ))}
          {!aditivos.length && <li className="text-muted-foreground">Sem aditivos: esta é a primeira versão.</li>}
        </ul>
      )}
      {aba === 'cobranca' && (
        <ul className="divide-border/70 flex flex-col divide-y text-sm">
          {cobrancas.map((x) => {
            const base = x.linhas.filter((l) => l.tipo === 'item').reduce((s, l) => s + l.valor, 0)
            const confere = Math.abs(base - c.total) < 0.01
            return (
              <li key={x.id} className="flex flex-wrap items-center gap-2 py-2">
                <span className="w-16 shrink-0">{rotuloCompetencia(x.competencia)}</span>
                <span className="min-w-0 grow basis-40 text-xs">
                  contrato {brl(c.total)} · cobrado {brl(base)} em itens{x.valor !== base ? ` + ${brl(x.valor - base, true)} de extras` : ''}
                </span>
                <Badge variant={confere ? 'sucesso' : 'destaque'}>{confere ? 'confere' : 'diferente (versão anterior?)'}</Badge>
                <Button size="sm" variant="ghost" className="rounded-full" onClick={() => nav.irPara({ modulo: 'financeiro', aba: 'cobranca', fatura: x.id })}>
                  Abrir
                </Button>
              </li>
            )
          })}
          {!cobrancas.length && <li className="text-muted-foreground py-2">Nenhuma cobrança ainda.</li>}
        </ul>
      )}
      {aba === 'historico' && (
        <ol className="flex flex-col gap-1.5 text-sm">
          {linha.map((e) => (
            <li key={e.id} className="flex gap-2">
              <span className="text-muted-foreground w-20 shrink-0 text-xs tabular-nums">{new Date(e.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
              <span className="min-w-0">{e.texto}</span>
            </li>
          ))}
          {!linha.length && <li className="text-muted-foreground">As mudanças feitas daqui em diante aparecem aqui, com quem fez.</li>}
        </ol>
      )}
    </GavetaFormulario>
  )
}

interface ItemEd {
  key: string
  servico: ServicoContrato
  descricao: string
  valor: string
  faixa: string
}

/** S07-A05 · Novo contrato ou nova versão: mostra o diff antes de gravar; vale a partir de uma competência. */
function EditarContrato({ fin, contrato, clienteId, onFechar }: { fin: Fin; contrato?: ContratoTela; clienteId?: string; onFechar: () => void }) {
  const executar = useAcao()
  const [passo, setPasso] = useState<'editar' | 'diff'>('editar')
  const [cliente, setCliente] = useState(contrato?.cliente_id ?? clienteId ?? fin.semContrato[0]?.id ?? '')
  const [itens, setItens] = useState<ItemEd[]>(contrato?.itens.map((i) => ({ key: i.id, servico: i.servico, descricao: i.descricao, valor: String(i.valor), faixa: i.faixa ?? '' })) ?? [{ key: 'n1', servico: 'contabil', descricao: '', valor: '', faixa: '' }])
  const [dia, setDia] = useState(String(contrato?.dia_vencimento ?? 10))
  const [meio, setMeio] = useState<ContratoHonorarios['meio_pagamento']>(contrato?.meio_pagamento ?? 'boleto')
  const [indice, setIndice] = useState<ContratoHonorarios['indice']>(contrato?.indice ?? 'IPCA')
  const [dataBase, setDataBase] = useState(String(contrato?.data_base ?? 1))
  const [decimo, setDecimo] = useState(contrato ? contrato.politica_13o !== 'nenhum' : true)
  const [retencoes, setRetencoes] = useState<string[]>(contrato?.retencoes ?? [])
  const [centro, setCentro] = useState(contrato?.centro_custo_id ?? 'cc-contabil')
  const [indicado, setIndicado] = useState(contrato?.indicado_por ?? '')
  const [desde, setDesde] = useState(PROXIMA_COMPETENCIA)
  const total = itens.reduce((s, i) => s + numero(i.valor), 0)
  const erros = !cliente ? 'Escolha o cliente.' : !itens.length ? 'O contrato precisa de ao menos um item.' : itens.some((i) => !i.descricao.trim() || numero(i.valor) <= 0) ? 'Todo item precisa de descrição e valor.' : null
  const diff = useMemo(() => {
    if (!contrato) return []
    const d: { campo: string; antes: string; depois: string }[] = []
    const antes = new Map(contrato.itens.map((i) => [i.descricao, i]))
    for (const i of itens) {
      const a = antes.get(i.descricao)
      if (!a) d.push({ campo: `item ${i.descricao}`, antes: '—', depois: brl(numero(i.valor)) })
      else if (a.valor !== numero(i.valor) || (a.faixa ?? '') !== i.faixa) d.push({ campo: `item ${i.descricao}`, antes: `${brl(a.valor)}${a.faixa ? ` (${a.faixa})` : ''}`, depois: `${brl(numero(i.valor))}${i.faixa ? ` (${i.faixa})` : ''}` })
    }
    for (const a of contrato.itens) if (!itens.some((i) => i.descricao === a.descricao)) d.push({ campo: `item ${a.descricao}`, antes: brl(a.valor), depois: 'retirado' })
    if (contrato.dia_vencimento !== Number(dia)) d.push({ campo: 'vencimento', antes: `dia ${contrato.dia_vencimento}`, depois: `dia ${dia}` })
    if (contrato.meio_pagamento !== meio) d.push({ campo: 'meio', antes: rotuloMeio[contrato.meio_pagamento], depois: rotuloMeio[meio] })
    if (contrato.indice !== indice) d.push({ campo: 'índice', antes: contrato.indice, depois: indice })
    if ((contrato.politica_13o !== 'nenhum') !== decimo) d.push({ campo: '13º', antes: contrato.politica_13o, depois: decimo ? 'dezembro' : 'nenhum' })
    if (contrato.retencoes.join() !== retencoes.join()) d.push({ campo: 'retenções', antes: contrato.retencoes.join(', ') || 'nenhuma', depois: retencoes.join(', ') || 'nenhuma' })
    return d
  }, [contrato, itens, dia, meio, indice, decimo, retencoes])
  const muda = (key: string, p: Partial<ItemEd>) => setItens((xs) => xs.map((i) => (i.key === key ? { ...i, ...p } : i)))
  const gravar = () => {
    const dadosItens = itens.map((i) => ({ servico: i.servico, descricao: i.descricao.trim(), setor_id: servicos[i.servico].setor, valor: numero(i.valor), tipo_cobranca: (i.faixa ? 'por_faixa' : 'fixo') as 'por_faixa' | 'fixo', faixa: i.faixa || null }))
    const campos = { dia_vencimento: Number(dia), meio_pagamento: meio, indice, data_base: Number(dataBase), politica_13o: (decimo ? 'dezembro' : 'nenhum') as ContratoHonorarios['politica_13o'], retencoes, centro_custo_id: centro, indicado_por: indicado || null }
    if (contrato) {
      const ok = executar(() => repos.contratosHonorarios.aditar(contrato.id, { contrato: campos, itens: dadosItens, vigente_de: desde, tipo: diff.some((d) => d.campo.startsWith('item')) ? 'escopo' : 'vencimento', diff, resumo: diff.map((d) => d.campo).join(', ') || 'sem mudança de valor' }), { sucesso: `Versão ${contrato.versao + 1} gravada: vale a partir de ${rotuloCompetencia(desde)}. O faturamento já usa.` })
      if (ok) onFechar()
      return
    }
    const cli = fin.clientes.find((x) => x.id === cliente)!
    const novo = executar(() => repos.contratosHonorarios.criar({ cliente_id: cliente, numero: `CT-${cli.codigo}`, versao: 1, vigente_de: desde, situacao: 'ativo', ...campos }, { texto: `Contrato de ${cli.nome} criado (v1 a partir de ${rotuloCompetencia(desde)})` }))
    if (!novo) return
    for (const i of dadosItens) executar(() => repos.itensContrato.criar({ ...i, contrato_id: novo.id, vigente_de: desde }))
    executar(() => undefined, { sucesso: `Contrato de ${cli.nome} criado. Entra no lote de ${rotuloCompetencia(desde)}.` })
    onFechar()
  }
  return (
    <GavetaFormulario
      aberta
      largura="lg"
      onFechar={onFechar}
      titulo={contrato ? `Nova versão · ${contrato.cliente}` : 'Novo contrato'}
      descricao={contrato ? `Hoje: versão ${contrato.versao}. Gravar cria a versão ${contrato.versao + 1} a partir da competência escolhida; a anterior fica no histórico e as faturas já emitidas não mudam.` : 'O que o cliente paga, por quê e quando. Um contrato por cliente; serviços em linhas (contábil, BPO, emissão de NFS-e).'}
      acao={passo === 'editar' ? (contrato ? 'Ver o que muda' : 'Criar contrato') : `Gravar versão ${(contrato?.versao ?? 0) + 1}`}
      acaoDesabilitada={!!erros || (passo === 'diff' && !diff.length)}
      onAcao={() => (contrato && passo === 'editar' ? setPasso('diff') : gravar())}
      secundaria={
        passo === 'diff' ? (
          <Button type="button" variant="ghost" className="rounded-full" onClick={() => setPasso('editar')}>
            Voltar
          </Button>
        ) : undefined
      }
    >
      {passo === 'diff' ? (
        <>
          <h3 className="text-sm font-medium">O que muda na versão {(contrato?.versao ?? 0) + 1}</h3>
          {diff.length ? (
            <ul className="flex flex-col gap-1.5 text-sm">
              {diff.map((d) => (
                <li key={d.campo} className="bg-sunken/50 grid grid-cols-[minmax(0,1fr)_auto] gap-2 rounded-md px-3 py-2">
                  <span>{d.campo}</span>
                  <span className="tabular-nums">
                    <span className="text-muted-foreground line-through">{d.antes}</span> → <strong className="font-medium">{d.depois}</strong>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <Nota>Nada mudou: não há versão nova para gravar.</Nota>
          )}
          <p className="text-muted-foreground text-sm">Vale a partir de {rotuloCompetencia(desde)}. Mudança de valor pede aditivo assinado pelo cliente: prepare em "Propor aditivo" se ainda não estiver combinado.</p>
        </>
      ) : (
        <>
          {!contrato && (
            <Campo rotulo="Cliente" erro={!cliente ? 'Escolha o cliente.' : undefined}>
              {(id) => <CampoEscolha id={id} valor={cliente} onMudar={setCliente} opcoes={fin.semContrato.map((x) => ({ valor: x.id, rotulo: x.nome }))} />}
            </Campo>
          )}
          <section className="flex flex-col gap-2">
            <h3 className="text-sm font-medium">Serviços (linhas da fatura)</h3>
            {itens.map((i, k) => (
              <div key={i.key} className="bg-sunken/50 grid grid-cols-[1fr_auto] gap-2 rounded-lg p-3 sm:grid-cols-[minmax(0,1fr)_9rem_7rem_auto]">
                <CampoTexto valor={i.descricao} onMudar={(v) => muda(i.key, { descricao: v })} placeholder="Descrição (ex.: Folha)" aria-label={`Descrição do item ${k + 1}`} />
                <span className="sm:hidden" />
                <CampoEscolha rotulo={`Serviço do item ${k + 1}`} valor={i.servico} onMudar={(v) => muda(i.key, { servico: v })} opcoes={(Object.keys(servicos) as ServicoContrato[]).map((x) => ({ valor: x, rotulo: servicos[x].rotulo }))} />
                <CampoTexto valor={i.valor} onMudar={(v) => muda(i.key, { valor: v })} placeholder="R$" aria-label={`Valor do item ${k + 1}`} />
                <Button type="button" size="icon-sm" variant="ghost" className="self-center rounded-full" aria-label={`Tirar item ${k + 1}`} onClick={() => setItens((xs) => xs.filter((x) => x.key !== i.key))}>
                  <TrashIcon />
                </Button>
                <CampoTexto valor={i.faixa} onMudar={(v) => muda(i.key, { faixa: v })} placeholder="Faixa contratada (ex.: até 25 funcionários)" aria-label={`Faixa do item ${k + 1}`} className="col-span-2 sm:col-span-4" />
              </div>
            ))}
            <span className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => setItens((xs) => [...xs, { key: `n${Date.now()}`, servico: 'fiscal', descricao: '', valor: '', faixa: '' }])}>
                <PlusIcon /> Serviço
              </Button>
              <span className="ml-auto text-sm">
                Total: <strong className="font-medium tabular-nums">{brl(total)}</strong>/mês
              </span>
            </span>
            {erros && <p className="text-destructive text-xs">{erros}</p>}
          </section>
          <div className="grid grid-cols-2 gap-3">
            <Campo rotulo="Vencimento">{(id) => <CampoEscolha id={id} valor={dia} onMudar={setDia} opcoes={[5, 10, 15, 20, 25].map((x) => ({ valor: String(x), rotulo: `dia ${x}` }))} />}</Campo>
            <Campo rotulo="Forma">{(id) => <CampoEscolha id={id} valor={meio} onMudar={setMeio} opcoes={(Object.keys(rotuloMeio) as (keyof typeof rotuloMeio)[]).map((x) => ({ valor: x, rotulo: rotuloMeio[x] }))} />}</Campo>
            <Campo rotulo="Índice de reajuste">{(id) => <CampoEscolha id={id} valor={indice} onMudar={setIndice} opcoes={(Object.keys(indiceAcumulado) as ContratoHonorarios['indice'][]).map((x) => ({ valor: x, rotulo: x }))} />}</Campo>
            <Campo rotulo="Data-base">{(id) => <CampoEscolha id={id} valor={dataBase} onMudar={setDataBase} opcoes={mesesExtenso.map((m, i) => ({ valor: String(i + 1), rotulo: m }))} />}</Campo>
          </div>
          <Interruptor ligado={decimo} onMudar={setDecimo} rotulo="13º honorário em dezembro" detalhe="Proporcional aos meses se o cliente sair no meio do ano (FIN-016)." />
          <Campo rotulo="Retenções na nota" ajuda="O líquido cobrado já desconta; o informe anual sai sozinho.">{() => <Fichas rotulo="Retenções" valores={retencoes} onMudar={setRetencoes} opcoes={['IRRF 1,5%', 'CSRF 4,65%', 'ISS 2% (tomador)', 'INSS 11%'].map((x) => ({ valor: x, rotulo: x }))} />}</Campo>
          <div className="grid grid-cols-2 gap-3">
            <Campo rotulo="Centro de custo">{(id) => <CampoEscolha id={id} valor={centro} onMudar={setCentro} opcoes={fin.centros.filter((x) => x.ativo).map((x) => ({ valor: x.id, rotulo: x.nome }))} />}</Campo>
            <Campo rotulo="Indicado por" ajuda="Gera a comissão da regra de remuneração.">{(id) => <CampoTexto id={id} valor={indicado} onMudar={setIndicado} placeholder="ninguém" />}</Campo>
          </div>
          <Campo rotulo="Vale a partir da competência" ajuda="Nunca retroativo: as faturas já emitidas não mudam.">
            {(id) => <CampoEscolha id={id} valor={desde} onMudar={setDesde} opcoes={[COMPETENCIA_ATUAL, PROXIMA_COMPETENCIA, proximaCompetencia(PROXIMA_COMPETENCIA)].filter((x) => !fin.fechamentos.some((f) => f.competencia === x && f.situacao === 'fechado')).map((x) => ({ valor: x, rotulo: rotuloCompetencia(x) }))} />}
          </Campo>
        </>
      )}
    </GavetaFormulario>
  )
}

/**
 * Extras e reembolsos a faturar (S07-A08, A09): avulsos com e sem aceite,
 * despesas adiantadas com comprovante, comandas de serviço extra vindas das
 * tarefas (C2-25) e o certificado digital como serviço (C2-23, fase 3).
 * Selecionar itens do mesmo cliente combina numa cobrança avulsa.
 */
function ExtrasAFaturar({ fin, podeEditar, onRegistrar }: { fin: Fin; podeEditar: boolean; onRegistrar: () => void }) {
  const executar = useAcao()
  const confirmar = useConfirmar()
  const integrante = useIntegranteFin()
  const { usuario } = useSessao()
  const nav = useNavegacao()
  const abertos = fin.avulsos.filter((a) => a.situacao !== 'faturado' && a.situacao !== 'cancelado')
  const despesas = fin.despesas.filter((d) => d.situacao === 'conferida' || d.situacao === 'registrada')
  const comandasSemAvulso = fin.comandas.filter((t) => !fin.avulsos.some((a) => a.tarefa_id === t.id))
  const itens = [...abertos.map((a) => ({ id: a.id, cliente_id: a.cliente_id, tipo: 'avulso' as const })), ...despesas.map((d) => ({ id: d.id, cliente_id: d.cliente_id, tipo: 'despesa' as const }))]
  const selecao = useSelecao(itens.map((i) => i.id))
  const escolhidos = itens.filter((i) => selecao.selecionados.includes(i.id))
  const clientesEscolhidos = [...new Set(escolhidos.map((i) => i.cliente_id))]
  const rotuloOrigem: Record<string, string> = { tarefa: 'tarefa', comanda: 'comanda (C2-25)', pedido_app: 'pedido no app', conversa: 'conversa', manual: 'registrado à mão', faixa: 'acima da faixa', certificado: 'certificado digital (C2-23)' }
  const faturarComanda = (t: (typeof fin.comandas)[number]) => {
    const preco = fin.tabelaAvulsos.find((x) => x.atividade_id === t.atividade_id)
    // Marca da S04 na ficha da tarefa: `servico_extra: true` e, se a pessoa informou, `extra_valor` ("R$ 360,00").
    const informado = Number(String(t.extras?.extra_valor ?? '').replace(/[^\d,]/g, '').replace(',', '.')) || 0
    const valor = informado || preco?.valor_padrao || 300
    const av = executar(() => repos.servicosAvulsos.criar({ cliente_id: t.cliente_id ?? '', atividade_id: t.atividade_id, descricao: t.titulo, valor, origem: 'comanda', tarefa_id: t.id, situacao: 'proposto' }, { texto: `Comanda de serviço extra virou avulso a aceitar: ${t.titulo}` }))
    if (!av) return
    integrante.pedirCartao({
      id: `avulso-${av.id}`,
      acao: { tipo: 'propor_avulso', avulso_id: av.id },
      resumo: `Enviar proposta do avulso ao cliente · ${fin.nomeCliente(av.cliente_id)}`,
      argumentos: [
        { rotulo: 'Serviço', valor: av.descricao },
        { rotulo: 'Valor', valor: brl(av.valor, true) },
        { rotulo: 'Tabela', valor: preco ? `${preco.nome} · ${brl(preco.valor_padrao)}` : 'sem preço na tabela' },
      ],
      texto: `A tarefa "${t.titulo}" foi marcada como serviço extra. Montei a proposta pela tabela de avulsos; sem o aceite do cliente, não fatura.`,
      aba: 'contratos',
      alcada: 'gestor',
      ferramenta: 'avulso.decidir',
      cliente_id: av.cliente_id,
    })
  }
  return (
    <Caixa>
      <Pergunta
        descricao="Serviço avulso só fatura com aceite; reembolso, com comprovante. Marque itens do mesmo cliente para combiná-los numa cobrança avulsa."
        acao={
          podeEditar && (
            <Button size="sm" variant="outline" className="rounded-full" onClick={onRegistrar}>
              <PlusIcon /> Registrar extra ou despesa
            </Button>
          )
        }
      >
        O que entra na próxima fatura além do contrato?
      </Pergunta>
      {comandasSemAvulso.length > 0 && (
        <ul className="flex flex-col gap-2">
          {comandasSemAvulso.map((t) => (
            <li key={t.id} className="bg-sunken/50 flex flex-wrap items-center gap-2 rounded-lg px-3 py-2 text-sm">
              <ClipboardTextIcon className="text-muted-foreground size-4 shrink-0" />
              <span className="min-w-0 grow basis-40">
                <span className="block">
                  Comanda de serviço extra: {t.titulo} <span className="text-muted-foreground">· {fin.nomeCliente(t.cliente_id)}</span>
                </span>
                <span className="text-muted-foreground block text-xs">
                  marcada como extra na tarefa{t.extras?.extra_valor ? ` · valor informado ${String(t.extras.extra_valor)}` : ''}{t.extras?.responsavel_nome ? ` · ${String(t.extras.responsavel_nome)}` : ''} · C2-25
                </span>
              </span>
              <Button size="sm" variant="ghost" className="rounded-full" onClick={() => nav.irPara({ modulo: 'painel', aba: t.setor_id === 'dp' ? 'dp' : 'societario', tarefa: t.id })}>
                Ver tarefa
              </Button>
              {podeEditar && (
                <Button size="sm" variant="outline" className="rounded-full" onClick={() => faturarComanda(t)}>
                  <ReceiptIcon /> Faturar comanda
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
      {!itens.length && !comandasSemAvulso.length ? (
        <EstadoVazio compacto icone={ReceiptIcon} titulo="Nada além do contrato este mês" descricao="Extras, reembolsos e comandas aparecem aqui até entrarem numa fatura." />
      ) : (
        <ul className="divide-border/70 flex flex-col divide-y">
          {abertos.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5 text-sm">
              {podeEditar && a.situacao !== 'proposto' && !a.fase && <CaixaSelecao marcado={selecao.marcado(a.id)} onMudar={(intervalo) => selecao.alternar(a.id, intervalo)} rotulo={`Marcar ${a.descricao}`} />}
              {a.origem === 'certificado' ? <CertificateIcon className="text-muted-foreground size-4 shrink-0" /> : null}
              <span className="min-w-0 flex-1 basis-56">
                <span className="block">
                  {a.descricao} <span className="text-muted-foreground">· {fin.nomeCliente(a.cliente_id)}</span>
                </span>
                <span className="text-muted-foreground block text-xs">
                  {rotuloOrigem[a.origem]}
                  {a.aceite_ref ? ` · ${a.aceite_ref}` : a.extras?.proposta_enviada_em ? ' · proposta enviada, esperando o aceite' : ' · sem aceite'}
                </span>
              </span>
              {a.fase ? <Badge variant="outline">fase {a.fase} · depois</Badge> : <Badge variant={a.situacao === 'proposto' ? 'destaque' : 'outline'}>{a.situacao === 'proposto' ? 'sem aceite' : a.situacao === 'a_faturar' ? 'a faturar' : a.situacao}</Badge>}
              <span className="min-w-24 shrink-0 whitespace-nowrap text-right tabular-nums">{brl(a.valor, true)}</span>
              {podeEditar && (
                <BotaoAcoes
                  rotulo={`Ações de ${a.descricao}`}
                  acoes={[
                    {
                      rotulo: 'Propor ao cliente (aceite)',
                      motivo: a.situacao !== 'proposto' ? 'já aceito' : a.fase ? 'fase 3: o certificado como serviço entra depois' : undefined,
                      onSelecionar: () =>
                        integrante.pedirCartao({
                          id: `avulso-${a.id}`,
                          acao: { tipo: 'propor_avulso', avulso_id: a.id },
                          resumo: `Enviar proposta do avulso ao cliente · ${fin.nomeCliente(a.cliente_id)}`,
                          argumentos: [
                            { rotulo: 'Serviço', valor: a.descricao },
                            { rotulo: 'Valor', valor: brl(a.valor, true) },
                          ],
                          texto: `Preparei a proposta de "${a.descricao}" para o cliente aceitar no app. Sem aceite, não fatura.`,
                          aba: 'contratos',
                          alcada: 'gestor',
                          ferramenta: 'avulso.decidir',
                          cliente_id: a.cliente_id,
                        }),
                    },
                    {
                      rotulo: 'Cancelar',
                      perigo: true,
                      separar: true,
                      onSelecionar: async () => {
                        const motivo = await confirmar({ titulo: `Cancelar ${a.descricao}?`, descricao: 'Sai da próxima fatura; fica no histórico.', acao: 'Cancelar o avulso', perigo: true, exigirMotivo: true })
                        if (typeof motivo === 'string') executar(() => repos.servicosAvulsos.atualizar(a.id, { situacao: 'cancelado', motivo }, { texto: `${usuario.nome} cancelou o avulso ${a.descricao}: ${motivo}` }), { sucesso: 'Avulso cancelado.' })
                      },
                    },
                  ]}
                />
              )}
            </li>
          ))}
          {despesas.map((d) => (
            <li key={d.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5 text-sm">
              {podeEditar && <CaixaSelecao marcado={selecao.marcado(d.id)} onMudar={(intervalo) => selecao.alternar(d.id, intervalo)} rotulo={`Marcar ${d.descricao}`} />}
              <span className="min-w-0 flex-1 basis-56">
                <span className="block">
                  Reembolso: {d.descricao} <span className="text-muted-foreground">· {fin.nomeCliente(d.cliente_id)}</span>
                </span>
                <span className="text-muted-foreground block text-xs">
                  pago em {dataCurta(d.pago_em)} por {d.adiantado_por} · {d.comprovante ? `comprovante: ${d.comprovante}` : 'sem comprovante'}
                </span>
              </span>
              <Badge variant="outline">reembolso</Badge>
              <span className="min-w-24 shrink-0 whitespace-nowrap text-right tabular-nums">{brl(d.valor, true)}</span>
              {podeEditar && (
                <BotaoAcoes
                  rotulo={`Ações de ${d.descricao}`}
                  acoes={[
                    {
                      rotulo: 'Perdoar (não cobrar)',
                      onSelecionar: async () => {
                        const motivo = await confirmar({ titulo: `Perdoar o reembolso de ${brl(d.valor, true)}?`, descricao: 'Vira custo do escritório; exige motivo e alçada de Gestor.', acao: 'Perdoar', exigirMotivo: true })
                        if (typeof motivo === 'string') executar(() => repos.despesasAdiantadas.atualizar(d.id, { situacao: 'perdoada', motivo }, { ferramenta: 'despesa.perdoar', texto: `${usuario.nome} perdoou o reembolso ${d.descricao}: ${motivo}` }), { sucesso: 'Reembolso perdoado.' })
                      },
                    },
                  ]}
                />
              )}
            </li>
          ))}
        </ul>
      )}
      {selecao.quantos > 0 && (
        <div className="bg-foreground text-background sticky bottom-3 z-30 mx-auto flex w-fit max-w-full flex-wrap items-center gap-2 rounded-full p-1 pl-4 text-sm">
          <span className="font-medium">{selecao.quantos} item(ns)</span>
          <Button
            size="sm"
            variant="ghost"
            disabled={clientesEscolhidos.length !== 1}
            title={clientesEscolhidos.length !== 1 ? 'Combine itens de um cliente só' : undefined}
            className="hover:bg-background/15 hover:text-background rounded-full"
            onClick={() => {
              const cli = clientesEscolhidos[0]
              const total = escolhidos.reduce((s, i) => s + (i.tipo === 'avulso' ? (fin.avulsos.find((a) => a.id === i.id)?.valor ?? 0) : (fin.despesas.find((x) => x.id === i.id)?.valor ?? 0)), 0)
              const venc = somarDias(HOJE, 7)
              integrante.pedirCartao({
                id: `avulsa-${cli}-${escolhidos.map((i) => i.id).join('-').slice(0, 30)}`,
                acao: { tipo: 'emitir_avulsa', cliente_id: cli, avulsos: escolhidos.filter((i) => i.tipo === 'avulso').map((i) => i.id), despesas: escolhidos.filter((i) => i.tipo === 'despesa').map((i) => i.id), vencimento: venc },
                resumo: `Emitir cobrança avulsa · ${fin.nomeCliente(cli)}`,
                argumentos: [
                  { rotulo: 'Itens', valor: String(escolhidos.length) },
                  { rotulo: 'Total', valor: brl(total, true) },
                  { rotulo: 'Vence', valor: dataCurta(venc) },
                ],
                texto: `Juntei ${escolhidos.length} item(ns) de ${fin.nomeCliente(cli)} numa cobrança à parte (serviço com NFS-e; reembolso com recibo e comprovante).`,
                aba: 'cobranca',
                alcada: 'gestor',
                ferramenta: 'cobranca.criar',
                cliente_id: cli,
              })
              selecao.limpar()
            }}
          >
            Combinar em cobrança avulsa
          </Button>
          <button type="button" aria-label="Limpar seleção" onClick={selecao.limpar} className="hover:bg-background/15 flex size-8 cursor-pointer items-center justify-center rounded-full">
            <XIcon className="size-4" />
          </button>
        </div>
      )}
      <p className="text-muted-foreground text-xs">O que não for combinado entra sozinho no lote de {rotuloCompetencia(PROXIMA_COMPETENCIA)}, na mesma fatura do honorário (reembolso sai sem nota, com o comprovante).</p>
    </Caixa>
  )
}

/** S07-A08 · Registrar extra (serviço avulso) ou despesa adiantada; reembolso exige comprovante. */
function NovoExtra({ fin, onFechar }: { fin: Fin; onFechar: () => void }) {
  const executar = useAcao()
  const { usuario } = useSessao()
  const [tipo, setTipo] = useState<'despesa' | 'avulso'>('despesa')
  const [cliente, setCliente] = useState(fin.clientes[0]?.id ?? '')
  const [preco, setPreco] = useState('')
  const [descricao, setDescricao] = useState('')
  const [valor, setValor] = useState('')
  const [comprovante, setComprovante] = useState<string | null>(null)
  const [aceite, setAceite] = useState(false)
  const [lendo, setLendo] = useState(false)
  const v = numero(valor)
  const erroComprovante = tipo === 'despesa' && !comprovante
  const escolherPreco = (id: string) => {
    setPreco(id)
    const p = fin.tabelaAvulsos.find((x) => x.id === id)
    if (p) {
      setDescricao(p.nome)
      setValor(String(p.valor_padrao))
    }
  }
  const anexar = async () => {
    setLendo(true)
    try {
      const r = await apis.ocr.ler({ nome: 'comprovante.pdf' })
      setComprovante('comprovante.pdf')
      if (!descricao) setDescricao(String((r.dados as { campos?: Record<string, string> }).campos?.descricao ?? 'Taxa paga pelo escritório'))
    } catch {
      setComprovante('comprovante.pdf')
    } finally {
      setLendo(false)
    }
  }
  return (
    <GavetaFormulario
      aberta
      onFechar={onFechar}
      titulo="Registrar extra ou despesa"
      descricao="Entra na próxima fatura do cliente ou numa cobrança avulsa. Serviço avulso sai com NFS-e e só fatura com aceite; reembolso, com o comprovante."
      acao="Registrar"
      acaoDesabilitada={!descricao.trim() || !(v > 0) || erroComprovante || !cliente}
      onAcao={() => {
        const ok =
          tipo === 'despesa'
            ? executar(() => repos.despesasAdiantadas.criar({ cliente_id: cliente, tipo: 'Despesa adiantada', descricao: descricao.trim(), valor: v, pago_em: HOJE, adiantado_por: usuario.nome, comprovante, situacao: 'conferida' }), { sucesso: 'Despesa registrada: entra na próxima fatura como reembolso.' })
            : executar(() => repos.servicosAvulsos.criar({ cliente_id: cliente, atividade_id: fin.tabelaAvulsos.find((x) => x.id === preco)?.atividade_id ?? null, descricao: descricao.trim(), valor: v, origem: 'manual', situacao: aceite ? 'a_faturar' : 'proposto', aceite_ref: aceite ? `aceite registrado por ${usuario.nome}` : null }), { sucesso: aceite ? 'Avulso registrado com aceite: entra na próxima fatura.' : 'Avulso registrado sem aceite: proponha ao cliente antes de faturar.' })
        if (ok) onFechar()
      }}
    >
      <Campo rotulo="Tipo">
        {() => (
          <Segmentado
            rotulo="Tipo"
            valor={tipo}
            onMudar={setTipo}
            opcoes={[
              { valor: 'despesa', rotulo: 'Despesa adiantada' },
              { valor: 'avulso', rotulo: 'Serviço avulso' },
            ]}
          />
        )}
      </Campo>
      <Campo rotulo="Cliente">{(id) => <CampoEscolha id={id} valor={cliente} onMudar={setCliente} opcoes={fin.clientes.map((x) => ({ valor: x.id, rotulo: x.nome }))} />}</Campo>
      {tipo === 'avulso' && <Campo rotulo="Da tabela de avulsos">{(id) => <CampoEscolha id={id} valor={preco} onMudar={escolherPreco} opcoes={[{ valor: '', rotulo: 'outro (à mão)' }, ...fin.tabelaAvulsos.filter((x) => x.ativo).map((x) => ({ valor: x.id, rotulo: `${x.nome} · ${brl(x.valor_padrao)}` }))]} />}</Campo>}
      <Campo rotulo="Descrição">{(id) => <CampoTexto id={id} valor={descricao} onMudar={setDescricao} placeholder={tipo === 'despesa' ? 'Taxa da Junta, cartório, certidão…' : 'Alteração contratual, IRPF de sócio…'} />}</Campo>
      <Campo rotulo="Valor (R$)">{(id) => <CampoTexto id={id} valor={valor} onMudar={setValor} placeholder="0,00" />}</Campo>
      {tipo === 'despesa' && (
        <Campo rotulo="Comprovante" erro={erroComprovante ? 'Reembolso precisa do comprovante.' : undefined}>
          {() => (
            <span className="flex flex-wrap items-center gap-2">
              <Button type="button" variant="outline" className="w-fit rounded-full" disabled={lendo} onClick={anexar}>
                <FileArrowUpIcon /> {comprovante ? `${comprovante} anexado` : lendo ? 'Lendo…' : 'Anexar'}
              </Button>
              {comprovante && <SeloDemonstracao fonte="Leitura de documentos (OCR)" />}
            </span>
          )}
        </Campo>
      )}
      {tipo === 'avulso' && <Interruptor ligado={aceite} onMudar={setAceite} rotulo="O cliente já aceitou" detalhe="Por mensagem ou no app (fica guardado como prova). Sem aceite, o integrante manda a proposta antes de faturar." />}
    </GavetaFormulario>
  )
}

/** S07-A10 · Campanha de reajuste: índice (API-16), segmentar pela margem do Timesheet, carta e envio (cartão do Administrador). */
function CampanhaReajuste({ fin, onFechar, onEnviado }: { fin: Fin; onFechar: () => void; onEnviado: () => void }) {
  const integrante = useIntegranteFin()
  const competencia = proximaCompetencia(PROXIMA_COMPETENCIA)
  const mes = Number(competencia.slice(5))
  const passos = ['Índice', 'Segmentar', 'Carta', 'Enviar']
  const [passo, setPasso] = useState(0)
  const [indice, setIndice] = useState<ContratoHonorarios['indice']>('INPC')
  const [pct, setPct] = useState<{ v: number; fonte: string } | null>(null)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [acima, setAcima] = useState(true)
  const [carta, setCarta] = useState('Olá, {{contato}}. Em janeiro, conforme a cláusula de reajuste do contrato, o honorário passa de {{valor_atual}} para {{valor_novo}} ({{indice}} acumulado de {{percentual}}). Qualquer dúvida, é só responder esta mensagem.')
  const [canal, setCanal] = useState<'e-mail' | 'WhatsApp' | 'app do cliente'>('e-mail')
  const consultar = async (i: ContratoHonorarios['indice']) => {
    setCarregando(true)
    setErro(null)
    try {
      const r = await apis.indices.acumulado(i, '2026-10')
      setPct({ v: r.dados.percentual, fonte: `${r.fonte} · ${r.dados.serie}` })
    } catch (e) {
      setErro(e instanceof Error ? e.message : String(e))
    } finally {
      setCarregando(false)
    }
  }
  useEffect(() => {
    void consultar(indice)
  }, [indice])
  const jaComunicado = (id: string) => fin.aditivos.some((a) => a.contrato_id === id && a.tipo === 'reajuste' && a.situacao === 'comunicado' && a.vigente_de === competencia)
  const daData = fin.contratos.filter((c) => c.data_base === mes && c.situacao === 'ativo' && !jaComunicado(c.id))
  const alvo = daData.map((c) => {
    const m = margemDe(c.cliente)
    const deficit = acima && m !== undefined && m < 5
    const renegociar = !!c.faixa_estourada
    return { c, m, grupo: renegociar ? 'renegociar' : deficit ? 'acima' : 'cheio', percentual: renegociar ? 0 : deficit ? +((pct?.v ?? 0) + 3).toFixed(1) : (pct?.v ?? 0) }
  })
  const cartas = alvo.filter((x) => x.grupo !== 'renegociar')
  const ultimo = passo === passos.length - 1
  return (
    <GavetaFormulario
      aberta
      largura="lg"
      onFechar={onFechar}
      titulo={`Campanha de reajuste: ${mesesExtenso[mes - 1]}`}
      descricao={`${daData.length || alvo.length} contrato(s) de exemplo com data-base em ${mesesExtenso[mes - 1]} (+ 23 da carteira). O integrante Financeiro prepara; o envio e a aplicação são sempre cartão do Administrador.`}
      acao={ultimo ? `Preparar o cartão (${cartas.length} cartas)` : 'Continuar'}
      acaoDesabilitada={(passo === 0 && !pct) || (ultimo && !cartas.length)}
      onAcao={() => {
        if (!ultimo) return setPasso((p) => p + 1)
        integrante.pedirCartao({
          id: `reajuste-${competencia}`,
          acao: { tipo: 'reajuste', competencia, indice, percentual: pct?.v ?? 0, contratos: cartas.map((x) => ({ id: x.c.id, percentual: x.percentual })), canal },
          resumo: `Enviar as cartas de reajuste de ${rotuloCompetencia(competencia)}`,
          argumentos: [
            { rotulo: 'Índice', valor: `${indice} ${pct?.v.toLocaleString('pt-BR')}%` },
            { rotulo: 'Cartas', valor: `${cartas.length} de exemplo + 23 da carteira` },
            { rotulo: 'Acima do índice', valor: String(cartas.filter((x) => x.grupo === 'acima').length) },
            { rotulo: 'Canal', valor: canal },
          ],
          texto: `Montei a campanha de ${mesesExtenso[mes - 1]}: ${indice} de ${pct?.v.toLocaleString('pt-BR')}% e, para quem dá prejuízo no Timesheet, 3 pontos acima. Quem passou da faixa vai para conversa, não carta.`,
          aba: 'contratos',
          alcada: 'administrador',
          ferramenta: 'reajuste.aplicar',
        })
        onEnviado()
        onFechar()
      }}
      secundaria={
        passo > 0 ? (
          <Button type="button" variant="ghost" className="rounded-full" onClick={() => setPasso((p) => p - 1)}>
            Voltar
          </Button>
        ) : undefined
      }
    >
      <Passos passos={passos} atual={passo} />
      {passo === 0 && (
        <>
          <Campo rotulo="Índice" ajuda="Por padrão, o de cada contrato. Trocar aqui vale só para esta campanha.">
            {(id) => <CampoEscolha id={id} valor={indice} onMudar={setIndice} opcoes={(['INPC', 'IPCA', 'IGP-M', 'salário mínimo'] as const).map((x) => ({ valor: x, rotulo: x }))} />}
          </Campo>
          {carregando && <Nota>Consultando a série do Banco Central…</Nota>}
          {erro && (
            <Nota tom="alerta">
              {erro}{' '}
              <Button size="sm" variant="ghost" className="rounded-full" onClick={() => consultar(indice)}>
                Tentar de novo
              </Button>
            </Nota>
          )}
          {pct && !carregando && (
            <span className="flex flex-wrap items-center gap-2">
              <Nota>
                {indice} acumulado em 12 meses até outubro: <strong className="font-medium">{pct.v.toLocaleString('pt-BR')}%</strong>
              </Nota>
              <SeloDemonstracao fonte={pct.fonte} />
            </span>
          )}
        </>
      )}
      {passo === 1 && (
        <>
          <Interruptor ligado={acima} onMudar={setAcima} rotulo="Propor acima do índice para quem dá prejuízo" detalhe="Usa a Rentabilidade do Timesheet (S06): horas medidas × custo-hora contra o honorário." />
          <ul className="flex flex-col gap-2">
            {alvo.map((x) => (
              <li key={x.c.id} className="bg-sunken/50 flex flex-wrap items-center gap-3 rounded-lg px-3 py-2 text-sm">
                <span className="min-w-0 grow basis-40">
                  <span className="block font-medium">{x.c.cliente}</span>
                  <span className="text-muted-foreground block text-xs">margem {x.m === undefined ? 'sem medição' : `${x.m}%`} · hoje {brl(x.c.total)}</span>
                </span>
                <Badge variant={x.grupo === 'cheio' ? 'outline' : 'destaque'}>{x.grupo === 'cheio' ? 'índice cheio' : x.grupo === 'acima' ? 'acima do índice' : 'renegociar escopo'}</Badge>
                <span className="min-w-20 shrink-0 whitespace-nowrap text-right tabular-nums">{x.grupo === 'renegociar' ? 'conversa' : `${x.percentual.toLocaleString('pt-BR')}%`}</span>
              </li>
            ))}
          </ul>
        </>
      )}
      {passo === 2 && (
        <Campo rotulo="Carta" ajuda="Variáveis: {{contato}}, {{valor_atual}}, {{valor_novo}}, {{indice}}, {{percentual}}. Quem fica acima do índice recebe um parágrafo com o motivo.">
          {(id) => <CampoArea id={id} linhas={7} valor={carta} onMudar={setCarta} />}
        </Campo>
      )}
      {passo === 3 && (
        <>
          <Campo rotulo="Canal">
            {() => (
              <Segmentado
                rotulo="Canal"
                valor={canal}
                onMudar={setCanal}
                opcoes={[
                  { valor: 'e-mail', rotulo: 'E-mail' },
                  { valor: 'WhatsApp', rotulo: 'WhatsApp' },
                  { valor: 'app do cliente', rotulo: 'App do cliente' },
                ]}
              />
            )}
          </Campo>
          <Nota>
            <ReceiptIcon className="mr-1 inline size-4" /> {cartas.length} cartas com 30 dias de antecedência, ao contato com o assunto “honorários”, pelo CRM. Aprovando o cartão, cada contrato ganha o aditivo “comunicado”; os valores mudam só com o segundo cartão, na data-base.
          </Nota>
        </>
      )}
    </GavetaFormulario>
  )
}

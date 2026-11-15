import { ArrowSquareOutIcon, ArrowsLeftRightIcon, CheckIcon, DiceFiveIcon, EyeIcon, FileTextIcon, PaperPlaneTiltIcon, PlusIcon, ReceiptIcon, RobotIcon, ScalesIcon, SealCheckIcon, WarningIcon, XIcon } from '@phosphor-icons/react'
import { useMemo, useState } from 'react'
import { useLoja, useNavegacao, usePersistente } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import { BarraUso } from '@/components/compostos/blocos'
import { EdicaoEmLinha, EstadoVazio, SePode, useAcao, useConfirmar, usePode } from '@/components/kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Campo, CampoEscolha, CampoTexto, GavetaFormulario, Segmentado } from '@/components/ui/formulario'
import { P } from '@/dados/arquivos'
import { tributacaoServico } from '@/dados/financeiro'
import { custoHora as custoEscritorio, custoHoraPacoteBpo } from '@/dados/timesheet'
import { cn } from '@/lib/utils'
import { banco } from '@/nucleo/banco'
import type { BpoVolume } from '@/nucleo/modelo/entidades'
import { useTabela } from '@/nucleo/react'
import { agora, ehGestorBpo, eventoBpo, repos } from '@/nucleo/repositorios'
import { COMPETENCIA_BPO } from '@/nucleo/semente/s08'
import { ChartLineIcon } from '@phosphor-icons/react'
import { brl, CabecalhoBpo, Caixa, Numero, PaginaBpo, TituloBloco, type PropsBpo } from './comum'
import { agoraBpo, contaAberta, dataHora, diasAte, hojeBpo, quando, useBpo, useContratantes, type ContratanteVista, type EmpresaVista } from './dados'
import { CHAVE_REDISTRIBUICAO, usePedirS08d, useTrabalhandoS08d, type PropostaRedistribuicao } from './efeitos-s08d'
import { usePedirBpo } from './integrantes'
import { COMPETENCIA_FECHAR, RelatorioEmpresa, resumoPadraoEmpresa } from './RelatorioBpo'

const PRECO_EXCEDENTE = 2.5
export const glosaDe = (v?: BpoVolume, unidade = 'lançamentos') => (v?.contestacoes ?? []).filter((c) => c.situacao === 'aceita' && c.unidade === unidade).reduce((s, c) => s + c.quantidade, 0)
export const excedenteDe = (e: EmpresaVista) => Math.max(0, e.perfil.volume.lancamentos - glosaDe(e.volume) - e.perfil.volume.limite)

/* ---------- Regras de apoio (S08d; decisões em DECISOES.md, seção S08d) ---------- */

/** Crédito de SLA do contrato: 1% do honorário do BPO por ponto abaixo da meta, até 10%, só com desvio do BPO (desvio do cliente não gera crédito). */
export function creditoSla(honorario: number, mes: number, meta: number, desviosBpo: number) {
  if (mes >= meta || desviosBpo === 0) return 0
  return Math.round(honorario * Math.min(0.1, (meta - mes) / 100))
}

/** Prazo de contestação do extrato: três dias úteis depois do envio (no "hoje" do BPO, 18/11 → 23/11). */
export function prazoContestacao(de = hojeBpo) {
  const d = new Date(`${de}T12:00:00Z`)
  let uteis = 0
  while (uteis < 3) {
    d.setUTCDate(d.getUTCDate() + 1)
    if (d.getUTCDay() !== 0 && d.getUTCDay() !== 6) uteis++
  }
  return d.toISOString().slice(0, 10)
}

/** Custos variáveis do BPO por empresa no mês (10, 9.2, custo provável): pacote R$ 9, conector de ERP R$ 3, Open Finance R$ 1 por conta. */
export function custosVariaveis(e: EmpresaVista) {
  const conector = e.erp.modo === 'E3' || e.erp.efetiva === 'desconectada' ? 0 : 3
  const openFinance = e.bancos.filter((b) => b.via === 'open_finance').length
  return 9 + conector + openFinance
}

/** Margem por departamento de um contratante: honorário pelas empresas com o departamento, custo pela fila do departamento. */
export function margemPorDepto(c: ContratanteVista) {
  const deptos = c.escopo_mae
  const empresas = deptos.map((d) => c.clientes_finais.filter((f) => f.departamentos.includes(d)).length)
  const fila = deptos.map((d) => c.fila.filter((f) => f.departamento === d).length + 1)
  const somaE = empresas.reduce((s, x) => s + x, 0) || 1
  const somaF = fila.reduce((s, x) => s + x, 0)
  const custo = c.honorario_mes * (1 - c.margem / 100)
  return deptos.map((d, i) => {
    const hon = (c.honorario_mes * empresas[i]) / somaE
    // O custo segue metade pela carteira do departamento e metade pela fila dele (a fila do mês é pequena para pesar sozinha).
    const peso = 0.5 * (empresas[i] / somaE) + 0.5 * (fila[i] / somaF)
    const cst = custo * peso
    return { depto: d, honorario: Math.round(hon), horas: Math.round(c.horas_mes * peso), margem: hon > 0 ? Math.round(((hon - cst) / hon) * 100) : 0 }
  })
}

/** "1 lançamento", "3 admissões": a quantidade com a unidade do extrato no número certo. */
export function qtdUnidade(q: number, unidade: string) {
  if (q !== 1) return `${q.toLocaleString('pt-BR')} ${unidade}`
  return `1 ${unidade
    .split(' ')
    .map((w) => w.replace(/ões$/, 'ão').replace(/ns$/, 'm').replace(/s$/, ''))
    .join(' ')}`
}

export const rotuloDeptoG: Record<string, string> = { dp: 'DP', fiscal: 'Fiscal', contabil: 'Contábil', societario: 'Societário' }

/**
 * BPO › Entregas e SLA (S08-T06, A28 e A29): o relatório do mês por empresa
 * (rascunho do Gerencial, revisão e fechamento pelo Gestor, em Arquivos ›
 * Entregáveis › BPO financeiro e no app, com recibo), o fechamento à
 * contabilidade, o SLA com cada desvio explicado e revisado por pessoa (do BPO
 * ou do cliente, com o crédito do contrato) e a auditoria de qualidade com
 * amostra sorteada (BPO-013).
 */
export function EntregasBpoTela({ empresa }: PropsBpo) {
  const { empresas } = useBpo()
  const loja = useLoja()
  const executar = useAcao()
  const pedir = usePedirBpo()
  const { usuario } = useSessao()
  const lista = empresa ? [empresa] : empresas
  const podeFechar = usePode('bpo.relatorio_mensal')
  const gestor = ehGestorBpo()
  const [revisar, setRevisar] = useState<string | null>(null)
  const [sla, setSla] = useState<string | null>(null)
  const relatorioDe = (e: EmpresaVista) => e.entregas.find((x) => x.tipo === 'relatorio' && x.competencia === COMPETENCIA_FECHAR)
  const fechamentoDe = (e: EmpresaVista) => e.entregas.find((x) => x.tipo === 'fechamento' && x.competencia === COMPETENCIA_FECHAR)
  const docDe = (e: EmpresaVista) => loja.documentos.find((d) => d.clienteId === e.clienteId && d.nome === 'Relatório financeiro 10-2026.pdf')
  const analistas = [...new Set(lista.map((e) => e.perfil.analista_nome))]

  const enviarRelatorio = (e: EmpresaVista, resumo?: string) => {
    const rel = relatorioDe(e)
    if (!rel) return
    executar(() => {
      const doc = docDe(e) ?? loja.adicionarDocumento({ clienteId: e.clienteId, nome: 'Relatório financeiro 10-2026.pdf', pasta: P.bpo, tipo: 'relatorio', competencia: '10/2026', origem: 'gerado_plataforma', conector: 'a1', tamanho: '312 KB', quando: '18/11/2026', por: 'Gerencial (integrante)', dados: { caixa: brl(e.caixa), pagamentos: String(e.perfil.volume.pagamentos), resumo: resumo ?? resumoPadraoEmpresa(e) } })
      loja.ajustarDocumento(doc.id, { dados: { ...doc.dados, resumo: resumo ?? String(rel.extras?.resumo ?? resumoPadraoEmpresa(e)) }, entregas: [...(doc.entregas ?? []), { quem: e.ficha?.contatos[0]?.nome ?? 'cliente', acao: 'enviado', quando: '18/11 ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }] })
      return repos.bpo.entregas.atualizar(rel.id, { situacao: 'enviado', enviado_em: agoraBpo(), enviado_por: usuario.nome, documento_id: doc.id, extras: { ...rel.extras, resumo: resumo ?? rel.extras?.resumo ?? resumoPadraoEmpresa(e) } }, { texto: `${usuario.nome} fechou e enviou o relatório de outubro de ${e.nome}` })
    }, { sucesso: `Relatório de outubro no app de ${e.nome} e em Arquivos › Entregáveis › BPO financeiro` })
  }
  const salvarResumo = (e: EmpresaVista, resumo: string) => {
    const rel = relatorioDe(e)
    if (rel) executar(() => repos.bpo.entregas.atualizar(rel.id, { extras: { ...rel.extras, resumo, rascunho: true } }, { texto: `${usuario.nome} revisou o resumo do relatório de ${e.nome}` }), { sucesso: 'Rascunho guardado' })
  }
  const entregarFechamento = (e: EmpresaVista) => {
    const f = fechamentoDe(e)
    if (!f) return
    executar(() => {
      eventoBpo(banco, e.contabil ? `bpo.mes_fechado: lançamentos de outubro de ${e.nome} entregues ao setor Contábil, já classificados` : `Fechamento de outubro de ${e.nome} enviado ao contador da empresa`, e.clienteId, 'bpo.relatorio_mensal')
      return repos.bpo.entregas.atualizar(f.id, { situacao: 'enviado', enviado_em: agoraBpo(), enviado_por: usuario.nome }, { texto: `Fechamento de outubro de ${e.nome} entregue` })
    }, { sucesso: e.contabil ? 'Fechamento entregue ao Contábil (sem redigitar)' : 'Fechamento enviado ao contador da empresa' })
  }
  const pedirRascunho = (e: EmpresaVista) =>
    pedir({
      integrante: 'i-bpo-gerencial',
      titulo: `Rascunhar o relatório de outubro de ${e.nome}`,
      cliente: e.nome,
      inicio: 'Vou montar o relatório de outubro: caixa, pagamentos, DRE gerencial e o que ficou pendente.',
      etapas: ['Somando o caixa e os pagamentos do mês', 'Montando a DRE gerencial por centro', 'Escrevendo o resumo de riscos e pendências'],
      fim: { texto: `Rascunho do relatório de outubro de ${e.nome} pronto. Falta o Gestor revisar e fechar: eu não envio ao cliente.`, aviso: `Gerencial rascunhou o relatório de ${e.nome}` },
      efeito: { tipo: 'relatorio', clienteId: e.clienteId, competencia: COMPETENCIA_FECHAR },
    })
  const emRevisao = lista.find((e) => e.clienteId === revisar)
  const emSla = lista.find((e) => e.clienteId === sla)

  if (!lista.length)
    return (
      <PaginaBpo>
        <CabecalhoBpo integrante="i-bpo-gerencial" titulo="Entregas e SLA" sub="Relatório do mês, fechamento à contabilidade, SLA e qualidade" />
        <EstadoVazio icone={FileTextIcon} titulo="Nenhuma empresa no BPO ainda" descricao="Ponha a primeira empresa no BPO na Carteira: o relatório do mês e o SLA aparecem aqui quando ela estiver ativa." />
      </PaginaBpo>
    )

  return (
    <PaginaBpo>
      <CabecalhoBpo integrante="i-bpo-gerencial" titulo="Entregas e SLA" sub="Outubro a fechar e novembro em curso · o SLA é o combinado no contrato de cada empresa e pausa quando a bola está com o cliente" />
      <Caixa>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Numero valor={`${Math.round(lista.reduce((s, e) => s + e.perfil.sla.mes, 0) / lista.length)}%`} rotulo="SLA médio" detalhe={`${lista.filter((e) => e.perfil.sla.mes < e.perfil.sla.meta).length} abaixo da meta`} />
          <Numero valor={lista.reduce((s, e) => s + e.perfil.sla.desvios.length, 0)} rotulo="desvios no mês" detalhe={`${lista.reduce((s, e) => s + e.perfil.sla.desvios.filter((d) => d.de === 'bpo').length, 0)} do BPO · ${lista.reduce((s, e) => s + e.perfil.sla.desvios.filter((d) => d.de === 'cliente').length, 0)} do cliente`} />
          <Numero valor={lista.filter((e) => relatorioDe(e)?.situacao === 'enviado').length} rotulo="relatórios de outubro enviados" detalhe={`de ${lista.length} · até o dia 5`} />
          <Numero valor={lista.filter((e) => fechamentoDe(e)?.situacao === 'enviado').length} rotulo="fechamentos entregues" detalhe="Contábil ou contador da empresa" />
        </div>
      </Caixa>
      <div className="grid gap-4 md:grid-cols-2">
        {lista.map((e) => {
          const rel = relatorioDe(e)
          const fch = fechamentoDe(e)
          const rascunho = !!docDe(e) || !!rel?.extras?.rascunho
          const slaFechado = e.perfil.extras?.sla_fechado as { por: string; em: string; credito: number } | undefined
          const credito = creditoSla(e.perfil.honorario, e.perfil.sla.mes, e.perfil.sla.meta, e.perfil.sla.desvios.filter((d) => d.de === 'bpo').length)
          return (
            <Caixa key={e.clienteId}>
              <TituloBloco descricao={`SLA ${e.perfil.sla.mes}% (meta ${e.perfil.sla.meta}%) · ${e.perfil.analista_nome}`}>{e.nome}</TituloBloco>
              <div className="bg-sunken h-2 overflow-hidden rounded-full" role="meter" aria-label={`SLA no prazo de ${e.nome}`} aria-valuenow={e.perfil.sla.mes} aria-valuemin={0} aria-valuemax={100}>
                <div className={cn('h-full rounded-full', e.perfil.sla.mes < e.perfil.sla.meta ? 'bg-destructive' : 'bg-foreground/70')} style={{ width: `${e.perfil.sla.mes}%` }} />
              </div>
              <ul className="text-muted-foreground flex flex-col gap-1 text-xs">
                {e.perfil.sla.desvios.length === 0 && <li>sem desvios no mês</li>}
                {e.perfil.sla.desvios.map((d) => (
                  <li key={d.texto}>
                    desvio {d.de === 'bpo' ? 'do BPO' : 'do cliente'}: {d.texto}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {slaFechado ? (
                  <Badge variant="sucesso">
                    SLA de outubro fechado por {slaFechado.por}
                    {slaFechado.credito > 0 && ` · crédito de ${brl(slaFechado.credito)}`}
                  </Badge>
                ) : (
                  <>
                    <span className="text-muted-foreground flex-1">{credito > 0 ? `Crédito do contrato: ${brl(credito)} (SLA abaixo da meta por desvio do BPO)` : 'Sem crédito de SLA no mês'}</span>
                    <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setSla(e.clienteId)}>
                      {gestor ? 'Revisar e fechar o SLA' : 'Ver o SLA'}
                    </Button>
                  </>
                )}
              </div>
              <ul className="divide-border/70 flex flex-col divide-y text-sm">
                <li className="flex flex-wrap items-center gap-2 py-2">
                  <FileTextIcon className="text-muted-foreground size-4" />
                  <span className="min-w-0 grow basis-40">
                    Relatório de outubro (DRE, caixa, pagamentos, pendências)
                    {rel?.situacao === 'enviado' && <span className="text-muted-foreground block text-xs">enviado {dataHora(rel.enviado_em)} por {rel.enviado_por}</span>}
                    {rel?.situacao !== 'enviado' && rascunho && <span className="text-muted-foreground block text-xs">rascunho do Gerencial pronto para revisar</span>}
                    {rel?.situacao !== 'enviado' && !rascunho && <span className="text-muted-foreground block text-xs">o Gerencial ainda não rascunhou</span>}
                  </span>
                  {(rascunho || rel?.situacao === 'enviado') && (
                    <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setRevisar(e.clienteId)} aria-label={`${rel?.situacao === 'enviado' ? 'Ver' : 'Revisar'} o relatório de ${e.nome}`}>
                      <EyeIcon /> {rel?.situacao === 'enviado' ? 'Ver' : 'Revisar'}
                    </Button>
                  )}
                  {rel?.situacao === 'enviado' ? (
                    <Badge variant="sucesso">no app</Badge>
                  ) : rascunho ? (
                    <SePode ferramenta="bpo.relatorio_mensal" alvo={{ cliente_id: e.clienteId }}>
                      <Button size="sm" variant="outline" className="rounded-full" onClick={() => enviarRelatorio(e)}>
                        Fechar e enviar
                      </Button>
                    </SePode>
                  ) : (
                    <Button size="sm" variant="ghost" className="rounded-full" onClick={() => pedirRascunho(e)}>
                      <RobotIcon /> Pedir ao Gerencial
                    </Button>
                  )}
                </li>
                <li className="flex flex-wrap items-center gap-2 py-2">
                  <FileTextIcon className="text-muted-foreground size-4" />
                  <span className="min-w-0 grow basis-40">
                    {e.contabil ? 'Fechamento ao setor Contábil (bpo.mes_fechado)' : 'Fechamento ao contador da empresa (BPO-013)'}
                    <span className="text-muted-foreground block text-xs">{fch?.situacao === 'enviado' ? `entregue ${dataHora(fch.enviado_em)}` : rel?.situacao !== 'enviado' ? 'até dia 7 · feche o relatório antes' : e.transacoes.length ? `até dia 7 · ainda há ${e.transacoes.length} lançamento(s) do extrato para conciliar` : 'até dia 7 · conciliação sem pendência e relatório aprovado'}</span>
                  </span>
                  {fch?.situacao === 'enviado' ? (
                    <Badge variant="sucesso">entregue</Badge>
                  ) : (
                    podeFechar && (
                      <Button size="sm" variant="ghost" className="rounded-full" disabled={rel?.situacao !== 'enviado' || e.transacoes.length > 0} title={rel?.situacao !== 'enviado' ? 'Feche o relatório antes' : e.transacoes.length ? 'Ainda há extrato para conciliar' : undefined} onClick={() => entregarFechamento(e)}>
                        Entregar
                      </Button>
                    )
                  )}
                </li>
              </ul>
            </Caixa>
          )
        })}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Caixa>
          <TituloBloco descricao="Carteira, desvios do BPO e empresas no vermelho de cada analista no mês.">SLA por analista</TituloBloco>
          <ul className="divide-border/70 flex flex-col divide-y text-sm" aria-label="SLA por analista">
            {analistas.map((a) => {
              const deles = lista.filter((e) => e.perfil.analista_nome === a)
              const s = Math.round(deles.reduce((t, e) => t + e.perfil.sla.mes, 0) / deles.length)
              const meta = Math.round(deles.reduce((t, e) => t + e.perfil.sla.meta, 0) / deles.length)
              return (
                <li key={a} className="flex items-center gap-3 py-2">
                  <span className="min-w-0 flex-1">
                    {a}
                    <span className="text-muted-foreground block text-xs">
                      {deles.length} empresa{deles.length > 1 ? 's' : ''} · {deles.reduce((t, e) => t + e.perfil.sla.desvios.filter((d) => d.de === 'bpo').length, 0)} desvio(s) do BPO · {deles.filter((e) => e.audit.cor === 'vermelho').length} no vermelho
                    </span>
                  </span>
                  <span className={cn('tabular-nums', s < meta && 'text-destructive-text')}>
                    {s}%{s < meta && <span className="text-xs"> · abaixo</span>}
                  </span>
                </li>
              )
            })}
          </ul>
        </Caixa>
        <AuditoriaQualidade lista={lista} />
      </div>
      {emRevisao && <RelatorioEmpresa e={emRevisao} entrega={relatorioDe(emRevisao)} aberto onFechar={() => setRevisar(null)} podeFechar={podeFechar} onFecharEEnviar={(r) => enviarRelatorio(emRevisao, r)} onSalvarResumo={(r) => salvarResumo(emRevisao, r)} />}
      {emSla && <RevisarSla e={emSla} gestor={gestor} onFechar={() => setSla(null)} />}
    </PaginaBpo>
  )
}

/** Fechamento do SLA (BPO-011): o percentual, cada desvio explicado como do BPO ou do cliente (revisado por pessoa) e o crédito do contrato. */
function RevisarSla({ e, gestor, onFechar }: { e: EmpresaVista; gestor: boolean; onFechar: () => void }) {
  const executar = useAcao()
  const loja = useLoja()
  const { usuario } = useSessao()
  const [desvios, setDesvios] = useState(e.perfil.sla.desvios)
  const credito = creditoSla(e.perfil.honorario, e.perfil.sla.mes, e.perfil.sla.meta, desvios.filter((d) => d.de === 'bpo').length)
  return (
    <GavetaFormulario
      aberta
      onFechar={onFechar}
      titulo={`SLA de outubro · ${e.nome}`}
      descricao={`${e.perfil.sla.mes}% no prazo, meta de ${e.perfil.sla.meta}% no contrato. Cada desvio é do BPO ou do cliente; o relógio pausa com o cliente. Uma pessoa revisa antes de fechar.`}
      acao="Fechar o SLA do mês"
      acaoDesabilitada={!gestor}
      onAcao={() => {
        const ok = executar(
          () => repos.bpo.perfis.atualizar(e.perfil.id, { sla: { ...e.perfil.sla, desvios }, extras: { ...e.perfil.extras, sla_fechado: { por: usuario.nome, em: agoraBpo(), credito } } }, { texto: `${usuario.nome} fechou o SLA de outubro de ${e.nome}: ${e.perfil.sla.mes}%${credito ? `, crédito de ${brl(credito)} na próxima fatura` : ''}` }),
          { sucesso: credito ? `SLA fechado: crédito de ${brl(credito)} avisado ao Financeiro` : 'SLA fechado sem crédito' },
        )
        if (ok && credito) loja.avisar({ para: [], tipo: 'sistema', setor: 'financeiro_escritorio', titulo: `Crédito de SLA de ${brl(credito)} para ${e.nome}`, detalhe: 'Desconto na próxima fatura, pelo contrato do BPO', destino: { modulo: 'financeiro', aba: 'cobranca' } })
        if (ok) onFechar()
      }}
    >
      {desvios.length === 0 && <p className="text-muted-foreground text-sm">Sem desvios no mês.</p>}
      <ul className="flex flex-col gap-3" aria-label="Desvios do mês">
        {desvios.map((d, i) => (
          <li key={d.texto} className="flex flex-col gap-1.5 text-sm">
            <span>{d.texto}</span>
            {gestor ? (
              <Segmentado
                rotulo={`De quem é o desvio: ${d.texto}`}
                valor={d.de}
                onMudar={(v) => setDesvios((xs) => xs.map((x, j) => (j === i ? { ...x, de: v } : x)))}
                opcoes={[
                  { valor: 'bpo', rotulo: 'Do BPO' },
                  { valor: 'cliente', rotulo: 'Do cliente' },
                ]}
              />
            ) : (
              <Badge variant="outline" className="w-fit">
                {d.de === 'bpo' ? 'do BPO' : 'do cliente'}
              </Badge>
            )}
          </li>
        ))}
      </ul>
      <p className="bg-sunken/60 rounded-lg px-3 py-2 text-sm">
        {credito > 0 ? (
          <>
            Crédito do contrato: <strong className="font-medium">{brl(credito)}</strong> (1% do honorário do BPO por ponto abaixo da meta, até 10%). Vai como desconto na próxima fatura.
          </>
        ) : (
          'Sem crédito: o SLA está na meta ou os desvios são do cliente.'
        )}
      </p>
      {!gestor && <p className="text-muted-foreground text-xs">Quem fecha o SLA é o Gestor do BPO.</p>}
    </GavetaFormulario>
  )
}

interface Amostra {
  ids: string[]
  resultado: Record<string, { ok: boolean; motivo?: string }>
  por: string
  em: string
}

/** Auditoria de qualidade (BPO-013): amostra sorteada para uma pessoa revisar; divergência vira item na fila do analista. */
function AuditoriaQualidade({ lista }: { lista: EmpresaVista[] }) {
  const executar = useAcao()
  const confirmar = useConfirmar()
  const { usuario } = useSessao()
  const [amostra, setAmostra] = usePersistente<Amostra | null>('s08d:qualidade', null)
  const [historico, setHistorico] = usePersistente<{ em: string; por: string; total: number; divergencias: number }[]>('s08d:qualidade:historico', [])
  const todasContas = lista.flatMap((e) => e.contas.map((c) => ({ e, c })))
  const sortear = () => {
    const candidatas = todasContas.filter(({ c }) => ['aguardando_cliente', 'aprovada', 'liberada', 'paga', 'conferida'].includes(c.etapa))
    const ids = [...candidatas].sort(() => Math.random() - 0.5).slice(0, 3).map((x) => x.c.id)
    setAmostra({ ids, resultado: {}, por: usuario.nome, em: agoraBpo() })
    eventoBpo(banco, `Auditoria de qualidade (BPO-013): amostra de ${ids.length} contas sorteada por ${usuario.nome}`, lista.length === 1 ? lista[0].clienteId : null)
  }
  const marcar = (id: string, r: { ok: boolean; motivo?: string }) => {
    if (!amostra) return
    const resultado = { ...amostra.resultado, [id]: r }
    setAmostra({ ...amostra, resultado })
    if (Object.keys(resultado).length === amostra.ids.length) {
      const div = Object.values(resultado).filter((x) => !x.ok).length
      setHistorico([{ em: agoraBpo(), por: usuario.nome, total: amostra.ids.length, divergencias: div }, ...historico].slice(0, 5))
      eventoBpo(banco, `Auditoria de qualidade concluída por ${usuario.nome}: ${div} divergência(s) em ${amostra.ids.length} contas`, null)
    }
  }
  const divergencia = async (id: string) => {
    const x = todasContas.find((y) => y.c.id === id)
    if (!x) return
    const motivo = await confirmar({ titulo: `Divergência em ${x.c.contraparte}?`, descricao: `Vira um item na fila de ${x.e.perfil.analista_nome} para corrigir, com o motivo.`, acao: 'Registrar divergência', exigirMotivo: true })
    if (typeof motivo !== 'string') return
    const ok = executar(
      () =>
        repos.bpo.fila.criarPedido({ cliente_id: x.e.clienteId, tipo: 'pendencia', texto: `Corrigir ${x.c.contraparte} (auditoria de qualidade)`, codigo: 'BPO-013', canal: 'interno', prazo: new Date(Date.parse(`${hojeBpo}T12:00:00Z`) + 2 * 864e5).toISOString().slice(0, 10), bola: 'bpo', responsavel_nome: x.e.perfil.analista_nome, faltando: [], sla_meta_h: 24, detalhe: motivo, visibilidade: 'interna_bpo' }),
      { sucesso: `Divergência na fila de ${x.e.perfil.analista_nome}` },
    )
    if (ok) marcar(id, { ok: false, motivo })
  }
  const feitas = amostra ? Object.keys(amostra.resultado).length : 0
  return (
    <Caixa>
      <TituloBloco
        descricao="BPO-013: o integrante confere por regra; uma pessoa revisa uma amostra sorteada (documento, valor, conferência e aprovação)."
        acao={
          <Button size="sm" variant="outline" className="rounded-full" onClick={sortear} disabled={todasContas.length === 0}>
            <DiceFiveIcon /> {amostra ? 'Sortear de novo' : 'Sortear amostra'}
          </Button>
        }
      >
        Auditoria de qualidade
      </TituloBloco>
      {!amostra ? (
        <p className="text-muted-foreground text-sm">Sorteie três contas do mês para revisar.</p>
      ) : (
        <ul className="divide-border/70 flex flex-col divide-y text-sm" aria-label="Amostra da auditoria">
          {amostra.ids.map((id) => {
            const x = todasContas.find((y) => y.c.id === id)
            if (!x) return null
            const r = amostra.resultado[id]
            return (
              <li key={id} className="flex flex-wrap items-center gap-2 py-2">
                <span className="min-w-0 flex-1 basis-48">
                  {x.c.contraparte} · {brl(x.c.valor)}
                  <span className="text-muted-foreground block text-xs">
                    {x.e.nome} · digitou {x.c.digitado_por_nome} · conferiu {x.c.conferencias.map((k) => k.nome).join(' e ') || 'ninguém ainda'}
                  </span>
                  {r && !r.ok && <span className="text-destructive-text block text-xs">divergência: {r.motivo}</span>}
                </span>
                {r ? (
                  <Badge variant={r.ok ? 'sucesso' : 'erro'}>{r.ok ? 'sem divergência' : 'na fila'}</Badge>
                ) : (
                  <span className="flex gap-1">
                    <Button size="sm" variant="outline" className="rounded-full" onClick={() => marcar(id, { ok: true })} aria-label={`${x.c.contraparte} sem divergência`}>
                      <CheckIcon /> OK
                    </Button>
                    <Button size="sm" variant="ghost" className="rounded-full" onClick={() => void divergencia(id)} aria-label={`Divergência em ${x.c.contraparte}`}>
                      <WarningIcon /> Divergência
                    </Button>
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      )}
      {amostra && feitas === amostra.ids.length && <p className="text-xs">Amostra revisada por {usuario.nome}: {Object.values(amostra.resultado).filter((x) => !x.ok).length || 'nenhuma'} divergência(s).</p>}
      {historico.length > 0 && (
        <details className="text-muted-foreground text-xs">
          <summary className="cursor-pointer">Amostras anteriores</summary>
          <ul className="mt-1 flex flex-col gap-0.5">
            {historico.map((h, i) => (
              <li key={i}>
                {dataHora(h.em)} · {h.por} · {h.divergencias} de {h.total} com divergência
              </li>
            ))}
          </ul>
        </details>
      )}
    </Caixa>
  )
}

/* ---------- Volume e faturamento ---------- */

/**
 * O que conta na assinatura da plataforma (10, 9.1, valores de teste): o
 * pacote BPO cobra por empresa incluída; o modo BPO, por contratante, e os
 * clientes finais de todos somam na faixa de clientes; convidados não têm
 * preço por usuário. Só o Administrador vê (é a conta do escritório).
 */
export function BlocoAssinatura({ empresas, contratantes }: { empresas: EmpresaVista[]; contratantes: ContratanteVista[] }) {
  const { usuario } = useSessao()
  const nav = useNavegacao()
  if (usuario.papel !== 'administrador') return null
  const incluidas = empresas.filter((e) => ['paralelo', 'ativo', 'encerrando'].includes(e.perfil.situacao))
  const implantando = empresas.filter((e) => e.perfil.situacao === 'onboarding').length
  const ativos = contratantes.filter((c) => c.situacao !== 'saida')
  const finais = ativos.reduce((s, c) => s + c.clientes_finais.length, 0)
  const convidados = ativos.reduce((s, c) => s + c.convidados.filter((g) => g.situacao !== 'desativado').length, 0)
  return (
    <Caixa>
      <TituloBloco
        descricao="O que o escritório paga à plataforma pelo BPO, contado pela inclusão de empresas e contratantes (valores de teste do plano, editáveis na Assinatura)."
        acao={
          <Button size="sm" variant="ghost" className="rounded-full" onClick={() => nav.irPara({ modulo: 'config', aba: 'assinatura' })}>
            <ArrowSquareOutIcon /> Assinatura
          </Button>
        }
      >
        Na assinatura da plataforma
      </TituloBloco>
      <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2" aria-label="BPO na assinatura">
        {empresas.length > 0 && (
          <div className="flex flex-col">
            <dt className="text-muted-foreground text-xs">Pacote BPO Financeiro</dt>
            <dd>
              {incluidas.length} empresa{incluidas.length === 1 ? '' : 's'} incluída{incluidas.length === 1 ? '' : 's'} · {brl(390)} + {incluidas.length} × {brl(65)} = <span className="tabular-nums">{brl(390 + incluidas.length * 65)}</span>
            </dd>
            <dd className="text-muted-foreground text-xs">Conta a partir do paralelo{implantando ? `; ${implantando} em implantação ainda não conta` : ''}. Empresa com BPO e contabilidade conta uma vez na faixa de clientes.</dd>
          </div>
        )}
        {contratantes.length > 0 && (
          <div className="flex flex-col">
            <dt className="text-muted-foreground text-xs">Modo BPO entre escritórios</dt>
            <dd>
              {ativos.length} contratante{ativos.length === 1 ? '' : 's'} · {brl(490)} + {ativos.length} × {brl(120)} = <span className="tabular-nums">{brl(490 + ativos.length * 120)}</span>
            </dd>
            <dd className="text-muted-foreground text-xs">
              {finais} clientes finais somam na faixa de clientes; {convidados} convidado{convidados === 1 ? '' : 's'} sem preço por usuário (teto de abuso, não cobrança).
            </dd>
          </div>
        )}
      </dl>
    </Caixa>
  )
}

/** Gaveta de contestação do extrato de volume (unidade, quantidade e motivo). */
export function GavetaContestacao({ titulo, v, onFechar, aoRegistrar }: { titulo: string; v: BpoVolume; onFechar: () => void; aoRegistrar: (c: { unidade: string; quantidade: number; motivo: string }) => boolean | undefined }) {
  const [r, setR] = useState({ unidade: v.itens[0]?.unidade ?? 'lançamentos', quantidade: '10', motivo: '' })
  const max = v.itens.find((i) => i.unidade === r.unidade)?.quantidade ?? 0
  const q = Number(r.quantidade)
  const erroQ = !(q > 0) ? 'Informe quantos.' : q > max ? `O extrato tem ${max}.` : undefined
  return (
    <GavetaFormulario
      aberta
      onFechar={onFechar}
      titulo={titulo}
      descricao="Duplicados, ajustes e cancelados não contam. Aceita, a contestação vira glosa e sai da fatura."
      acao="Registrar contestação"
      acaoDesabilitada={!!erroQ || !r.motivo.trim()}
      onAcao={() => {
        if (aoRegistrar({ unidade: r.unidade, quantidade: q, motivo: r.motivo.trim() })) onFechar()
      }}
    >
      <Campo rotulo="Item do extrato">{(id) => <CampoEscolha id={id} valor={r.unidade} onMudar={(x) => setR((y) => ({ ...y, unidade: x }))} opcoes={v.itens.map((i) => ({ valor: i.unidade, rotulo: `${i.unidade} (${i.quantidade.toLocaleString('pt-BR')})` }))} />}</Campo>
      <Campo rotulo="Quantos contestar" erro={erroQ}>
        {(id) => <CampoTexto id={id} tipo="number" min={1} valor={r.quantidade} onMudar={(x) => setR((y) => ({ ...y, quantidade: x }))} />}
      </Campo>
      <Campo rotulo="Motivo">{(id) => <CampoTexto id={id} valor={r.motivo} onMudar={(x) => setR((y) => ({ ...y, motivo: x }))} placeholder="Ex.: dez lançamentos duplicados no ERP" />}</Campo>
    </GavetaFormulario>
  )
}

/**
 * BPO › Volume e faturamento (S08-T06, A30 e A31; 10, 7.2 e 7.3): a contagem
 * do mês contra a faixa, o extrato enviado ao cliente com prazo de
 * contestação, a contestação e a glosa, e o excedente que vira serviço avulso
 * na fatura única do Financeiro com o ok de uma pessoa (ou a proposta de
 * aditivo de faixa). Embaixo, o que o BPO conta na assinatura da plataforma.
 */
export function VolumeBpoTela({ empresa }: PropsBpo) {
  const { empresas } = useBpo()
  const contratantes = useContratantes()
  const loja = useLoja()
  const nav = useNavegacao()
  const executar = useAcao()
  const confirmar = useConfirmar()
  const { usuario, permissoes } = useSessao()
  const gestor = ehGestorBpo()
  const tAvulso = useTabela('servico_avulso')
  const lista = empresa ? [empresa] : empresas
  const [aberto, setAberto] = useState<string | null>(empresa?.clienteId ?? null)
  const [contestando, setContestando] = useState<EmpresaVista | null>(null)

  const registrarContestacao = (e: EmpresaVista, c: { unidade: string; quantidade: number; motivo: string }) =>
    executar(() => repos.bpo.volumes.atualizar(e.volume!.id, { situacao: 'contestado', contestacoes: [...e.volume!.contestacoes, { id: `ct${Date.now().toString(36)}`, ...c, por: usuario.nome, situacao: 'aberta' }] }, { texto: `Contestação no volume de ${e.nome}: ${c.quantidade} ${c.unidade} (${c.motivo})` }), { sucesso: 'Contestação registrada: a fatura espera a decisão' })
  const decidir = async (e: EmpresaVista, v: BpoVolume, id: string, situacao: 'aceita' | 'recusada') => {
    let motivo: string | undefined
    if (situacao === 'recusada') {
      const m = await confirmar({ titulo: 'Recusar a contestação?', descricao: 'O cliente vê o motivo; a quantidade continua contando.', acao: 'Recusar', exigirMotivo: true })
      if (typeof m !== 'string') return
      motivo = m
    }
    executar(() => {
      const contestacoes = v.contestacoes.map((c) => (c.id === id ? { ...c, situacao, ...(motivo ? { motivo: `${c.motivo} · recusada: ${motivo}` } : {}) } : c))
      return repos.bpo.volumes.atualizar(v.id, { contestacoes, situacao: contestacoes.some((c) => c.situacao === 'aberta') ? 'contestado' : 'aberto' }, { texto: `${usuario.nome} ${situacao === 'aceita' ? 'aceitou a contestação de ' + e.nome + ': vira glosa' : 'recusou a contestação de ' + e.nome + `: ${motivo}`}` })
    }, { sucesso: situacao === 'aceita' ? 'Glosa aplicada' : 'Contestação recusada' })
  }
  const enviarExtrato = (e: EmpresaVista) => {
    const v = e.volume
    if (!v) return
    const prazo = prazoContestacao()
    const ok = executar(() => repos.bpo.volumes.atualizar(v.id, { extras: { ...v.extras, extrato_enviado_em: agoraBpo(), extrato_enviado_por: usuario.nome, prazo_contestacao: prazo } }, { texto: `${usuario.nome} enviou ao app de ${e.nome} o extrato de volume de ${COMPETENCIA_BPO} (contestação até ${prazo.slice(8, 10)}/${prazo.slice(5, 7)})` }), { sucesso: `Extrato no app de ${e.nome}; contestação até ${prazo.slice(8, 10)}/${prazo.slice(5, 7)}` })
    if (ok) loja.avisar({ para: [], tipo: 'cliente', setor: 'bpo_financeiro', titulo: `Extrato de volume enviado a ${e.nome}`, detalhe: `prazo de contestação: ${quando(prazo)}`, destino: { modulo: 'bpo', aba: 'volume', cliente: e.clienteId } })
  }
  const faturar = async (e: EmpresaVista) => {
    const n = excedenteDe(e)
    const ok = await confirmar({ titulo: `Lançar ${n} lançamentos acima da faixa (${brl(n * PRECO_EXCEDENTE)}) como extra?`, descricao: `Vira serviço avulso aceito na próxima fatura única de ${e.nome}, numa linha própria; a NFS-e sai por serviço (${tributacaoServico.bpo.codigo}).`, acao: 'Lançar o extra' })
    if (ok !== true || !e.volume) return
    const antes = e.volume
    const r = executar(
      () => {
        const av = repos.servicosAvulsos.criar({ cliente_id: e.clienteId, descricao: `Excedente do BPO: ${n} lançamentos acima da faixa (${COMPETENCIA_BPO})`, valor: n * PRECO_EXCEDENTE, origem: 'faixa', situacao: 'a_faturar', aceite_ref: `ok de ${usuario.nome} no BPO › Volume (faixa: ${e.perfil.volume.faixa})` }, { texto: `Excedente do BPO de ${e.nome} entra na próxima fatura` })
        repos.bpo.volumes.atualizar(antes.id, { situacao: 'faturado', extra_valor: n * PRECO_EXCEDENTE, faturado_por: usuario.nome, extras: { ...antes.extras, avulso_id: av.id } }, { ferramenta: 'bpo.volume.faturar', texto: `${usuario.nome} lançou o excedente de ${e.nome} (${brl(n * PRECO_EXCEDENTE)}) na fatura única` })
        return av
      },
      {
        sucesso: `${n} lançamentos acima da faixa (${brl(n * PRECO_EXCEDENTE)}) vão na próxima fatura única`,
        desfazer: (av) => {
          repos.servicosAvulsos.atualizar(av.id, { situacao: 'cancelado', motivo: 'desfeito no BPO › Volume' })
          repos.bpo.volumes.reverter(antes)
        },
      },
    )
    if (r) eventoBpo(banco, `Excedente de ${e.nome} visível em Financeiro › Contratos › Avulsos`, e.clienteId)
  }
  const proporAditivo = (e: EmpresaVista) => {
    const v = e.volume
    if (!v) return
    const ok = executar(() => repos.bpo.volumes.atualizar(v.id, { extras: { ...v.extras, aditivo_proposto_em: agoraBpo(), aditivo_proposto_por: usuario.nome } }, { texto: `faixa.estourar: ${usuario.nome} propôs aditivo de faixa para ${e.nome} (${e.perfil.volume.lancamentos} lançamentos para ${e.perfil.volume.faixa})` }), { sucesso: 'Proposta de aditivo enviada ao Financeiro (Contratos)' })
    if (ok) loja.avisar({ para: [], tipo: 'sistema', setor: 'financeiro_escritorio', titulo: `Aditivo de faixa do BPO para ${e.nome}`, detalhe: `${e.perfil.volume.lancamentos} lançamentos no mês para a faixa ${e.perfil.volume.faixa}`, destino: { modulo: 'financeiro', aba: 'contratos' } })
  }

  return (
    <PaginaBpo>
      <CabecalhoBpo integrante="i-bpo-gerencial" titulo="Volume e faturamento" sub={`Novembro até hoje (${COMPETENCIA_BPO}) · conta só o entregue e não contestado; o cliente vê o extrato antes da fatura; o extra precisa do ok de uma pessoa`}>
        {permissoes.modulos.includes('financeiro') && (
          <Button size="sm" variant="outline" className="rounded-full" onClick={() => nav.irPara({ modulo: 'financeiro', aba: 'cobranca' })}>
            <ArrowSquareOutIcon /> Cobranças no Financeiro
          </Button>
        )}
        <span className="text-muted-foreground text-xs">{loja.estado.cenario === 'bpo_puro' ? 'O honorário do BPO sai na fatura do escritório, titular escritório.' : 'Fatura única: um pagamento só, com cada serviço numa linha e a nota fiscal por serviço.'}</span>
      </CabecalhoBpo>
      {lista.length === 0 ? (
        <EstadoVazio icone={ChartLineIcon} titulo="Nada para contar ainda" descricao="O volume do mês aparece quando houver empresa ativa no BPO." />
      ) : (
        <>
          <Caixa>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <Numero valor={lista.reduce((s, e) => s + e.perfil.volume.lancamentos, 0).toLocaleString('pt-BR')} rotulo="lançamentos" detalhe={`${lista.reduce((s, e) => s + glosaDe(e.volume), 0)} glosados`} />
              <Numero valor={lista.reduce((s, e) => s + e.perfil.volume.pagamentos, 0)} rotulo="pagamentos preparados" />
              <Numero valor={brl(lista.reduce((s, e) => s + e.perfil.honorario, 0))} rotulo="honorário BPO no mês" />
              <Numero valor={lista.filter((e) => excedenteDe(e) > 0).length} rotulo="acima da faixa" detalhe={`${lista.reduce((s, e) => s + (e.volume?.contestacoes.filter((c) => c.situacao === 'aberta').length ?? 0), 0)} contestação(ões) aberta(s)`} />
            </div>
          </Caixa>
          <Caixa className="gap-0 p-0 sm:p-0">
            <ul className="divide-border/70 flex flex-col divide-y" aria-label="Volume por empresa">
              {lista.map((e) => {
                const exc = excedenteDe(e)
                const v = e.volume
                const aberta = v?.contestacoes.some((c) => c.situacao === 'aberta')
                const enviadoEm = v?.extras?.extrato_enviado_em as string | undefined
                const prazo = v?.extras?.prazo_contestacao as string | undefined
                const avulso = v?.extras?.avulso_id ? tAvulso.find((a) => a.id === v.extras?.avulso_id) : undefined
                const aditivo = v?.extras?.aditivo_proposto_em as string | undefined
                return (
                  <li key={e.clienteId} className="flex flex-col gap-2 px-4 py-3 sm:px-5">
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                      <button type="button" className="min-w-0 flex-1 basis-56 cursor-pointer text-left" onClick={() => setAberto((x) => (x === e.clienteId ? null : e.clienteId))} aria-expanded={aberto === e.clienteId}>
                        <span className="block truncate text-sm font-medium">{e.nome}</span>
                        <span className="text-muted-foreground block text-xs">
                          {e.perfil.volume.faixa} · {e.perfil.volume.contas} conta{e.perfil.volume.contas > 1 ? 's' : ''} · {e.perfil.volume.conciliacoes} conciliações · {aberto === e.clienteId ? 'fechar extrato' : 'ver extrato'}
                        </span>
                        <span className="text-muted-foreground block text-xs">
                          {e.contabil && loja.estado.cenario !== 'bpo_puro' ? `Fatura única: contábil + BPO${exc > 0 ? ' + excedente' : ''} · NFS-e por serviço (${tributacaoServico.contabil.codigo} e ${tributacaoServico.bpo.codigo})` : `Fatura do BPO${exc > 0 ? ' com a linha do excedente' : ''} · NFS-e ${tributacaoServico.bpo.codigo}`}
                        </span>
                        {enviadoEm && <span className="text-muted-foreground block text-xs">extrato no app desde {dataHora(enviadoEm)} · contestação até {quando(prazo)}</span>}
                      </button>
                      <span className="w-full sm:w-56">
                        <BarraUso rotulo="Lançamentos" usado={e.perfil.volume.lancamentos - glosaDe(v)} total={e.perfil.volume.limite} />
                      </span>
                      <span className="min-w-24 shrink-0 whitespace-nowrap text-right text-sm tabular-nums">{brl(e.perfil.honorario)}</span>
                      <span className="flex w-full flex-wrap justify-end gap-1 sm:w-auto sm:min-w-44">
                        {v?.situacao === 'faturado' ? (
                          <Badge variant="sucesso">extra de {brl(v.extra_valor)} lançado{avulso ? (avulso.situacao === 'faturado' ? ' · faturado' : avulso.situacao === 'cancelado' ? ' · cancelado' : ' · na próxima fatura') : ''}</Badge>
                        ) : exc > 0 ? (
                          <SePode ferramenta="bpo.volume.faturar">
                            <Button size="sm" variant="outline" className="rounded-full" disabled={aberta} title={aberta ? 'Decida a contestação antes de faturar' : undefined} onClick={() => void faturar(e)}>
                              <PlusIcon /> Extra de {brl(exc * PRECO_EXCEDENTE)}
                            </Button>
                          </SePode>
                        ) : null}
                      </span>
                    </div>
                    {aberto === e.clienteId && v && (
                      <div className="bg-sunken/50 flex flex-col gap-2 rounded-lg p-3 text-sm">
                        <span className="text-muted-foreground text-xs">Extrato de volume de {COMPETENCIA_BPO} · o cliente vê antes da fatura</span>
                        <ul className="flex flex-col gap-1">
                          {v.itens.map((i) => (
                            <li key={i.unidade} className="flex gap-2">
                              <span className="flex-1">{i.unidade}</span>
                              <span className="tabular-nums">{i.quantidade.toLocaleString('pt-BR')}</span>
                              {glosaDe(v, i.unidade) > 0 && <span className="text-muted-foreground w-16 text-right text-xs tabular-nums">−{glosaDe(v, i.unidade)}</span>}
                            </li>
                          ))}
                          {glosaDe(v) > 0 && (
                            <li className="text-muted-foreground flex gap-2">
                              <span className="flex-1">glosa (contestações aceitas)</span>
                              <span className="tabular-nums">−{glosaDe(v)}</span>
                            </li>
                          )}
                        </ul>
                        {v.contestacoes.map((c) => (
                          <div key={c.id} className="flex flex-wrap items-center gap-2 text-xs">
                            <ScalesIcon className="size-4" />
                            <span className="min-w-0 grow basis-40">
                              {qtdUnidade(c.quantidade, c.unidade)}: {c.motivo} · {c.por}
                            </span>
                            {c.situacao === 'aberta' ? (
                              gestor ? (
                                <>
                                  <Button size="sm" variant="outline" className="rounded-full" onClick={() => void decidir(e, v, c.id, 'aceita')}>
                                    <CheckIcon /> Aceitar (glosa)
                                  </Button>
                                  <Button size="sm" variant="ghost" className="rounded-full" onClick={() => void decidir(e, v, c.id, 'recusada')}>
                                    <XIcon /> Recusar
                                  </Button>
                                </>
                              ) : (
                                <Badge variant="outline">aguardando o Gestor</Badge>
                              )
                            ) : (
                              <Badge variant={c.situacao === 'aceita' ? 'sucesso' : 'outline'}>{c.situacao === 'aceita' ? 'aceita: glosa' : 'recusada'}</Badge>
                            )}
                          </div>
                        ))}
                        {v.situacao !== 'faturado' && (
                          <div className="flex flex-wrap gap-1">
                            <SePode ferramenta="bpo.volume.contestar">
                              <Button size="sm" variant="ghost" className="w-fit rounded-full" onClick={() => setContestando(e)}>
                                <ScalesIcon /> Registrar contestação
                              </Button>
                            </SePode>
                            {!enviadoEm && gestor && (
                              <Button size="sm" variant="ghost" className="w-fit rounded-full" onClick={() => enviarExtrato(e)}>
                                <PaperPlaneTiltIcon /> Enviar o extrato ao cliente
                              </Button>
                            )}
                            {exc > 0 && !aditivo && gestor && (
                              <Button size="sm" variant="ghost" className="w-fit rounded-full" onClick={() => proporAditivo(e)}>
                                <ReceiptIcon /> Propor aditivo de faixa
                              </Button>
                            )}
                            {aditivo && <Badge variant="outline">aditivo proposto {dataHora(aditivo)}</Badge>}
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          </Caixa>
        </>
      )}
      {!empresa && <BlocoAssinatura empresas={empresas} contratantes={contratantes} />}
      {contestando?.volume && <GavetaContestacao titulo={`Contestar o volume de ${contestando.nome}`} v={contestando.volume} onFechar={() => setContestando(null)} aoRegistrar={(c) => !!registrarContestacao(contestando, c)} />}
    </PaginaBpo>
  )
}

/* ---------- Rentabilidade e capacidade ---------- */

export const capacidadePadrao: Record<string, number> = { 'Lucas Prado': 40, 'Marina Teixeira': 30 }
export const CHAVE_CAPACIDADE = 's08d:capacidade'

/** Carga das próximas quatro semanas por pessoa (BPO-016): fila pelo prazo, rotinas pela periodicidade e, no C2, os marcos do calendário fiscal e da folha. */
export function cargaPorSemana(empresas: EmpresaVista[], contratantes: ContratanteVista[], pessoas: string[]) {
  const inicio = Date.parse(`${hojeBpo}T12:00:00Z`)
  const semanaDe = (data: string) => Math.floor(Math.max(0, diasAte(data)) / 7)
  const dataDoDia = (dia: number) => {
    // Próxima ocorrência do dia do mês a partir de hoje.
    const d = new Date(inicio)
    if (d.getUTCDate() > dia) d.setUTCMonth(d.getUTCMonth() + 1)
    d.setUTCDate(dia)
    return d.toISOString().slice(0, 10)
  }
  const semanas = [0, 1, 2, 3].map((s) => ({ rotulo: s === 0 ? 'esta semana' : `+${s} sem.`, porPessoa: Object.fromEntries(pessoas.map((p) => [p, 0])) as Record<string, number>, marcos: [] as string[] }))
  const somar = (s: number, pessoa: string | null | undefined, h: number) => {
    if (s > 3) return
    const p = pessoa && pessoas.includes(pessoa) ? [pessoa] : pessoas
    for (const x of p) semanas[s].porPessoa[x] += h / p.length
  }
  for (const e of empresas) {
    for (const f of e.fila) somar(semanaDe(f.prazo), f.responsavel_nome, 1)
    for (const r of e.rotinas.filter((x) => x.ativa)) {
      if (r.cadencia === 'diária') for (let s = 0; s < 4; s++) somar(s, e.perfil.analista_nome, 5 * 0.1)
      if (r.cadencia === 'semanal') for (let s = 0; s < 4; s++) somar(s, e.perfil.analista_nome, 0.25)
      if (r.cadencia === 'mensal') {
        const dia = Number(/(\d{1,2})/.exec(r.quando)?.[1] ?? 5)
        somar(semanaDe(dataDoDia(Math.min(28, dia))), e.perfil.analista_nome, 1)
      }
    }
  }
  const marcos: { dia: number; texto: string; depto: string; h: number }[] = [
    { dia: 5, texto: 'folha', depto: 'dp', h: 0.3 },
    { dia: 15, texto: 'DCTFWeb e EFD-Reinf', depto: 'fiscal', h: 0.2 },
    { dia: 20, texto: 'Simples (PGDAS-D)', depto: 'fiscal', h: 0.2 },
  ]
  for (const c of contratantes) {
    for (const f of c.fila) somar(semanaDe(f.prazo), f.responsavel_nome, 1)
    for (const m of marcos.filter((x) => c.escopo_mae.includes(x.depto))) {
      const n = c.clientes_finais.filter((f) => f.departamentos.includes(m.depto)).length
      const s = semanaDe(dataDoDia(m.dia))
      if (n && s <= 3) {
        somar(s, null, n * m.h)
        if (!semanas[s].marcos.includes(m.texto)) semanas[s].marcos.push(m.texto)
      }
    }
  }
  return semanas.map((s) => ({ ...s, total: Math.round(Object.values(s.porPessoa).reduce((a, b) => a + b, 0)) }))
}

/** Horas poupadas pelos integrantes (GES-056), em série separada das horas humanas, pela duração padrão de cada atividade. */
export function useHorasPoupadas(empresas: EmpresaVista[]) {
  const tTrans = useTabela('bpo_transacao')
  const tConta = useTabela('bpo_conta')
  return useMemo(() => {
    const ids = new Set(empresas.map((e) => e.clienteId))
    const capturas = tConta.filter((c) => ids.has(c.cliente_id) && /integrante/i.test(c.digitado_por_nome)).length
    const conciliacoes = tTrans.filter((t) => ids.has(t.cliente_id) && /integrante/i.test(t.conciliada_por ?? '')).length + empresas.reduce((s, e) => s + Math.round(e.perfil.volume.conciliacoes * 0.6), 0)
    const relatorios = empresas.filter((e) => e.entregas.some((x) => x.tipo === 'relatorio' && x.extras?.rascunho)).length
    const linhas = [
      { rotulo: 'Captura de contas (FIN-003)', n: capturas, min: 6 },
      { rotulo: 'Conciliação do que casa por regra (FIN-004)', n: conciliacoes, min: 2 },
      { rotulo: 'Rascunho do relatório (FIN-006)', n: relatorios, min: 45 },
    ]
    return { linhas, horas: Math.round(linhas.reduce((s, l) => s + l.n * l.min, 0) / 6) / 10 }
  }, [tTrans, tConta, empresas])
}

/**
 * BPO › Rentabilidade e capacidade (S08-T06, A32; 10, 7.4): margem por
 * empresa (honorário − horas × custo-hora − custos variáveis), sobre o
 * faturado ou o recebido; por contratante e departamento; capacidade de cada
 * pessoa, carga das próximas semanas e a proposta de redistribuição do
 * Gerencial (o Gestor aplica); horas poupadas pelos integrantes em série
 * separada. Só Administrador (e Gestor com Gestão ou Financeiro).
 */
export function RentabilidadeBpoTela({ empresa }: PropsBpo) {
  const { empresas } = useBpo()
  const contratantes = useContratantes()
  const loja = useLoja()
  const nav = useNavegacao()
  const executar = useAcao()
  const pedir = usePedirS08d()
  const trabalhando = useTrabalhandoS08d('redistribuir')
  const podeReatribuir = usePode('fila.reatribuir')
  const gestor = ehGestorBpo()
  const tCob = useTabela('cobranca')
  const tFila = useTabela('bpo_item_fila')
  const tTela = useTabela('registro_tela')
  const proposta = useMemo(() => tTela.find((r) => r.id === CHAVE_REDISTRIBUICAO), [tTela])
  const [capGuardada, setCapacidade] = usePersistente<Record<string, number>>(CHAVE_CAPACIDADE, capacidadePadrao)
  const [base, setBase] = useState<'faturado' | 'recebido'>('faturado')
  const custoHora = loja.estado.custoPorPacote ? custoHoraPacoteBpo : custoEscritorio.valor
  const lista = empresa ? [empresa] : empresas
  const pessoas = [...new Set([...empresas.map((e) => e.perfil.analista_nome), ...Object.keys(capGuardada)])]
  const capacidade = Object.fromEntries(pessoas.map((p) => [p, capGuardada[p] ?? 30])) as Record<string, number>
  const recebidoDe = (e: EmpresaVista) => (tCob.some((c) => c.cliente_id === e.clienteId && c.competencia === '2026-11' && c.situacao === 'paga') ? e.perfil.honorario : 0)
  const linhas = lista.map((e) => {
    const custoHoras = e.perfil.horas_mes * custoHora
    const variaveis = custosVariaveis(e)
    const receita = base === 'faturado' ? e.perfil.honorario : recebidoDe(e)
    const margem = receita > 0 ? Math.round(((receita - custoHoras - variaveis) / receita) * 100) : null
    return { e, custoHoras, variaveis, receita, margem }
  })
  const semanas = cargaPorSemana(empresas, contratantes, pessoas)
  const maxSemana = Math.max(...semanas.map((s) => s.total), Object.values(capacidade).reduce((a, b) => a + b, 0) / 4.33, 1)
  const capSemanal = Object.values(capacidade).reduce((a, b) => a + b, 0) / 4.33
  const poupadas = useHorasPoupadas(lista)
  const prop = proposta?.valor as PropostaRedistribuicao | null | undefined
  const propItens = (prop?.itens ?? []).filter((i) => tFila.some((f) => f.id === i.id && f.situacao === 'aberto' && f.responsavel_nome === i.de))

  const pedirRedistribuicao = () =>
    pedir({
      integrante: 'i-bpo-gerencial',
      titulo: 'Sugerir a redistribuição da semana',
      inicio: 'Vou comparar a fila de cada pessoa com a capacidade dela e sugerir o que muda de mãos. Quem decide é o Gestor.',
      etapas: ['Somando a fila e as rotinas por pessoa', 'Comparando com a capacidade de cada um', 'Escolhendo o que pode mudar de mãos sem risco de prazo'],
      fim: { texto: 'Sugestão pronta em BPO › Rentabilidade e capacidade. Nada mudou: o Gestor aplica ou descarta.', aviso: 'Gerencial sugeriu uma redistribuição da fila' },
      efeito: { tipo: 'redistribuir', capacidade },
    })
  const aplicar = () => {
    executar(() => {
      for (const i of propItens) repos.bpo.fila.reatribuir(i.id, i.para)
      return repos.telas.lembrar(CHAVE_REDISTRIBUICAO, null)
    }, { sucesso: `${propItens.length} item(ns) reatribuído(s) conforme a sugestão` })
  }

  return (
    <PaginaBpo>
      <CabecalhoBpo integrante="i-bpo-gerencial" titulo="Rentabilidade e capacidade" sub={`Horas do Timesheet de novembro · ${loja.estado.custoPorPacote ? `custo-hora do pacote BPO, ${brl(custoHora)}` : `custo-hora do escritório, ${brl(custoHora)} (todos os pacotes)`} · custos variáveis de IA, conector e Open Finance`}>
        <Button size="sm" variant="outline" className="rounded-full" onClick={() => nav.irPara({ modulo: 'timesheet', aba: 'rentabilidade' })}>
          <ArrowSquareOutIcon /> Ver no Timesheet (filtro BPO)
        </Button>
        <Segmentado
          rotulo="Margem sobre"
          valor={base}
          onMudar={setBase}
          opcoes={[
            { valor: 'faturado', rotulo: 'Sobre o faturado' },
            { valor: 'recebido', rotulo: 'Sobre o recebido' },
          ]}
        />
      </CabecalhoBpo>
      {!loja.estado.custoPorPacote && (
        <p className="bg-sunken/60 text-muted-foreground rounded-lg px-4 py-2.5 text-sm">
          No custo-hora do escritório, que inclui a equipe contábil, o BPO aparece com margem menor. Para ver com o custo da equipe do BPO, ligue “Custo-hora por pacote (opcional)” em Timesheet › Configurar › Custo-hora.
        </p>
      )}
      {lista.length === 0 && <EstadoVazio icone={ChartLineIcon} titulo="Sem empresas no BPO" descricao="A margem aparece quando houver empresa ativa e horas no Timesheet." />}
      {lista.length > 0 && (
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <Caixa className="gap-0">
            <TituloBloco descricao={base === 'faturado' ? 'Honorário do BPO no mês menos as horas da equipe e os custos variáveis.' : 'O que já entrou no caixa do escritório (fatura de novembro paga) menos os mesmos custos.'}>Margem por empresa</TituloBloco>
            <div className="text-muted-foreground mt-2 hidden grid-cols-[minmax(0,1fr)_minmax(5rem,max-content)_minmax(4rem,max-content)_minmax(5rem,max-content)_minmax(4rem,max-content)_minmax(3.5rem,max-content)] gap-3 text-xs sm:grid">
              <span />
              <span className="text-right">{base === 'faturado' ? 'faturado' : 'recebido'}</span>
              <span className="text-right">horas</span>
              <span className="text-right">custo horas</span>
              <span className="text-right">variáveis</span>
              <span className="text-right">margem</span>
            </div>
            <ul className="divide-border/70 flex flex-col divide-y" aria-label="Margem por empresa">
              {linhas.map(({ e, custoHoras, variaveis, receita, margem }) => (
                <li key={e.clienteId} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-0.5 py-2.5 text-sm sm:grid-cols-[minmax(0,1fr)_minmax(5rem,max-content)_minmax(4rem,max-content)_minmax(5rem,max-content)_minmax(4rem,max-content)_minmax(3.5rem,max-content)]">
                  <span className="truncate">{e.nome}</span>
                  <span className="text-muted-foreground hidden text-right text-xs tabular-nums sm:block">{brl(receita)}</span>
                  <span className="text-muted-foreground hidden text-right text-xs tabular-nums sm:block">{e.perfil.horas_mes.toLocaleString('pt-BR')} h</span>
                  <span className="text-muted-foreground hidden text-right text-xs tabular-nums sm:block">{brl(custoHoras)}</span>
                  <span className="text-muted-foreground hidden text-right text-xs tabular-nums sm:block">{brl(variaveis)}</span>
                  <span className={cn('text-right tabular-nums', margem !== null && margem < 20 && 'text-destructive-text')}>{margem === null ? <span className="text-muted-foreground text-xs">a receber</span> : `${margem}%`}</span>
                  <span className="text-muted-foreground col-span-2 text-xs sm:hidden">
                    {brl(receita)} · {e.perfil.horas_mes} h ({brl(custoHoras)}) · variáveis {brl(variaveis)}
                  </span>
                </li>
              ))}
            </ul>
          </Caixa>
          <Caixa>
            <TituloBloco descricao="Horas de BPO no mês contra o que cada pessoa tem para o pacote. Clique no total para ajustar.">Capacidade</TituloBloco>
            <ul className="flex flex-col gap-3" aria-label="Capacidade por pessoa">
              {pessoas.map((p) => {
                const usado = empresas.filter((e) => e.perfil.analista_nome === p).reduce((s, e) => s + e.perfil.horas_mes, 0) + contratantes.reduce((s, c) => s + c.fila.filter((f) => f.responsavel_nome === p).length * 1.5, 0)
                return (
                  <li key={p} className="flex flex-col gap-1">
                    <BarraUso rotulo={p} usado={Math.round(usado * 10) / 10} total={capacidade[p]} unidade=" h" />
                    {gestor ? (
                      <span className="text-muted-foreground flex items-center gap-1 text-xs">
                        capacidade no mês, em horas:
                        <EdicaoEmLinha rotulo={`Capacidade de ${p} (horas no mês)`} valor={String(capacidade[p])} validar={(v) => (Number(v) > 0 && Number(v) <= 220 ? null : 'Entre 1 e 220 horas.')} onSalvar={(v) => setCapacidade({ ...capacidade, [p]: Number(v) })} className="w-16" />
                      </span>
                    ) : null}
                  </li>
                )
              })}
            </ul>
            <p className="text-muted-foreground text-xs">O integrante faz a captura e a conciliação; as horas são de conferência, exceções e cliente. Empresa com retrabalho (sincronização parada) consome mais: vale rever a faixa no aditivo.</p>
          </Caixa>
        </div>
      )}
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <Caixa>
          <TituloBloco descricao={`Fila pelo prazo, rotinas pela periodicidade e, no BPO entre escritórios, folha no início do mês, DCTFWeb e EFD-Reinf no meio, Simples no dia 20. Linha: capacidade da equipe por semana (${Math.round(capSemanal)} h).`}>Carga por semana</TituloBloco>
          <div className="relative flex h-36 items-end gap-3" role="img" aria-label={`Carga por semana: ${semanas.map((s) => `${s.rotulo} ${s.total} h`).join('; ')}; capacidade ${Math.round(capSemanal)} h`}>
            <span className="border-destructive/60 pointer-events-none absolute inset-x-0 border-t border-dashed" style={{ bottom: `${(capSemanal / maxSemana) * 100 * 0.78 + 18}px` }} aria-hidden />
            {semanas.map((s) => (
              <div key={s.rotulo} className="flex flex-1 flex-col items-center gap-1">
                <span className={cn('text-xs tabular-nums', s.total > capSemanal && 'text-destructive-text')}>{s.total} h</span>
                <span className="flex w-full max-w-10 flex-col-reverse overflow-hidden rounded-t-sm" style={{ height: `${(s.total / maxSemana) * 78}px` }}>
                  {pessoas.map((p, i) => (
                    <span key={p} title={`${p}: ${Math.round(s.porPessoa[p])} h`} className={i % 2 ? 'bg-foreground/35' : 'bg-foreground/65'} style={{ height: `${s.total ? (s.porPessoa[p] / s.total) * 100 : 0}%` }} />
                  ))}
                </span>
                <span className="text-muted-foreground text-xs">{s.rotulo}</span>
              </div>
            ))}
          </div>
          <ul className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
            {pessoas.map((p, i) => (
              <li key={p} className="flex items-center gap-1.5">
                <span className={cn('inline-block size-2.5 rounded-xs', i % 2 ? 'bg-foreground/35' : 'bg-foreground/65')} aria-hidden /> {p}
              </li>
            ))}
            {semanas.some((s) => s.marcos.length) && <li>marcos: {semanas.map((s) => (s.marcos.length ? `${s.rotulo}: ${s.marcos.join(', ')}` : null)).filter(Boolean).join(' · ')}</li>}
          </ul>
          <div className="border-border/70 flex flex-col gap-2 border-t pt-3">
            <div className="flex flex-wrap items-center gap-2">
              <ArrowsLeftRightIcon className="size-4" />
              <span className="min-w-0 grow basis-40 text-sm">Redistribuição da semana</span>
              <Button size="sm" variant="outline" className="rounded-full" disabled={trabalhando} onClick={pedirRedistribuicao}>
                <RobotIcon /> {trabalhando ? 'Gerencial trabalhando…' : 'Pedir sugestão ao Gerencial'}
              </Button>
            </div>
            {prop && (
              <div className="bg-sunken/60 flex flex-col gap-2 rounded-lg p-3 text-sm" aria-label="Sugestão de redistribuição">
                <span className="text-muted-foreground text-xs">
                  {prop.por} · {dataHora(prop.em)}
                </span>
                <span>{propItens.length ? prop.resumo : prop.itens.length ? 'A sugestão já foi aplicada ou a fila mudou.' : prop.resumo}</span>
                {propItens.length > 0 && (
                  <ul className="flex flex-col gap-1 text-xs">
                    {propItens.map((i) => (
                      <li key={i.id}>
                        {i.texto}: {i.de} → <strong className="font-medium">{i.para}</strong>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex gap-1.5">
                  {propItens.length > 0 && podeReatribuir && (
                    <Button size="sm" className="rounded-full" onClick={aplicar}>
                      <CheckIcon /> Aplicar a sugestão
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" className="rounded-full" onClick={() => repos.telas.lembrar(CHAVE_REDISTRIBUICAO, null)}>
                    Descartar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Caixa>
        <div className="flex flex-col gap-4">
          <Caixa>
            <TituloBloco descricao="GES-056: o que os integrantes fizeram, pela duração padrão de cada atividade. Série separada: não entra no custo nem na margem.">Horas poupadas pelos integrantes</TituloBloco>
            <span className="text-2xl font-light tabular-nums">{poupadas.horas.toLocaleString('pt-BR')} h</span>
            <ul className="text-muted-foreground flex flex-col gap-0.5 text-xs">
              {poupadas.linhas.map((l) => (
                <li key={l.rotulo} className="flex gap-2">
                  <span className="flex-1">{l.rotulo}</span>
                  <span className="tabular-nums">
                    {l.n} × {l.min} min
                  </span>
                </li>
              ))}
            </ul>
          </Caixa>
          {!empresa && (
            <Caixa className="gap-0">
              <TituloBloco descricao="BPO entre escritórios: margem por contratante e por departamento contratado.">Margem por contratante</TituloBloco>
              {contratantes.length === 0 ? (
                <p className="text-muted-foreground text-sm">Nenhum contratante.</p>
              ) : (
                <ul className="divide-border/70 mt-2 flex flex-col divide-y text-sm" aria-label="Margem por contratante">
                  {contratantes.map((c) => (
                    <li key={c.id} className="flex flex-col gap-1 py-2.5">
                      <span className="flex items-center gap-2">
                        <span className="min-w-0 flex-1 truncate">{c.nome}</span>
                        <span className="text-muted-foreground text-xs tabular-nums">{c.horas_mes} h</span>
                        <span className={cn('w-12 text-right tabular-nums', c.margem < 20 && 'text-destructive-text')}>{c.margem}%</span>
                      </span>
                      <span className="text-muted-foreground flex flex-wrap gap-x-3 text-xs">
                        {margemPorDepto(c).map((d) => (
                          <span key={d.depto} className={cn(d.margem < 20 && 'text-destructive-text')}>
                            {rotuloDeptoG[d.depto] ?? d.depto}: {d.margem}%
                          </span>
                        ))}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Caixa>
          )}
        </div>
      </div>
      <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
        <SealCheckIcon className="size-4" /> Margem e custo-hora nunca são liberáveis por exceção. O dinheiro das empresas BPO (titular empresa) nunca entra nesta conta.
      </p>
    </PaginaBpo>
  )
}

export { agora, contaAberta, hojeBpo }

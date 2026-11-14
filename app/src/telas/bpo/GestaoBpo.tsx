import { ArrowSquareOutIcon, CheckIcon, DiceFiveIcon, FileTextIcon, PlusIcon, ScalesIcon, XIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { useLoja, useNavegacao, usePersistente } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import { BarraUso } from '@/components/compostos/blocos'
import { SePode, useAcao, useConfirmar, usePode } from '@/components/kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { P } from '@/dados/arquivos'
import { tributacaoServico } from '@/dados/financeiro'
import { custoHora as custoEscritorio, custoHoraPacoteBpo } from '@/dados/timesheet'
import { cn } from '@/lib/utils'
import { banco } from '@/nucleo/banco'
import type { BpoVolume } from '@/nucleo/modelo/entidades'
import { agora, eventoBpo, repos } from '@/nucleo/repositorios'
import { COMPETENCIA_BPO } from '@/nucleo/semente/s08'
import { brl, CabecalhoBpo, Caixa, Numero, PaginaBpo, TituloBloco, type PropsBpo } from './comum'
import { agoraBpo, contaAberta, dataHora, diasAte, hojeBpo, useBpo, useContratantes, type EmpresaVista } from './dados'
import { usePedirBpo } from './integrantes'

const PRECO_EXCEDENTE = 2.5
export const glosaDe = (v?: BpoVolume, unidade = 'lançamentos') => (v?.contestacoes ?? []).filter((c) => c.situacao === 'aceita' && c.unidade === unidade).reduce((s, c) => s + c.quantidade, 0)
export const excedenteDe = (e: EmpresaVista) => Math.max(0, e.perfil.volume.lancamentos - glosaDe(e.volume) - e.perfil.volume.limite)

/**
 * BPO › Entregas e SLA (S08-T06, A28 e A29): o relatório do mês por empresa
 * (rascunho do Gerencial, fechamento pelo Gestor, em Arquivos › Entregáveis ›
 * BPO financeiro e no app), o fechamento à contabilidade, o SLA com os
 * desvios (do BPO ou do cliente), por analista, e a auditoria de qualidade.
 */
export function EntregasBpoTela({ empresa }: PropsBpo) {
  const { empresas } = useBpo()
  const loja = useLoja()
  const executar = useAcao()
  const pedir = usePedirBpo()
  const { usuario } = useSessao()
  const lista = empresa ? [empresa] : empresas
  const podeFechar = usePode('bpo.relatorio_mensal')
  const [amostra, setAmostra] = usePersistente<{ ids: string[]; conferidas: string[] } | null>('s08:qualidade', null)
  const relatorioDe = (e: EmpresaVista) => e.entregas.find((x) => x.tipo === 'relatorio' && x.competencia === '2026-10')
  const fechamentoDe = (e: EmpresaVista) => e.entregas.find((x) => x.tipo === 'fechamento' && x.competencia === '2026-10')
  const docDe = (e: EmpresaVista) => loja.documentos.find((d) => d.clienteId === e.clienteId && d.nome === 'Relatório financeiro 10-2026.pdf')
  const analistas = [...new Set(lista.map((e) => e.perfil.analista_nome))]

  const enviarRelatorio = (e: EmpresaVista) => {
    const rel = relatorioDe(e)
    if (!rel) return
    executar(() => {
      const doc = docDe(e) ?? loja.adicionarDocumento({ clienteId: e.clienteId, nome: 'Relatório financeiro 10-2026.pdf', pasta: P.bpo, tipo: 'relatorio', competencia: '10/2026', origem: 'gerado_plataforma', conector: 'a1', tamanho: '312 KB', quando: '18/11/2026', por: 'Gerencial (integrante)', dados: { caixa: brl(e.caixa), pagamentos: String(e.perfil.volume.pagamentos) } })
      loja.ajustarDocumento(doc.id, { entregas: [...(doc.entregas ?? []), { quem: e.ficha?.contatos[0]?.nome ?? 'cliente', acao: 'enviado', quando: '18/11 ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }] })
      return repos.bpo.entregas.atualizar(rel.id, { situacao: 'enviado', enviado_em: agoraBpo(), enviado_por: usuario.nome, documento_id: doc.id }, { texto: `${usuario.nome} fechou e enviou o relatório de outubro de ${e.nome}` })
    }, { sucesso: `Relatório de outubro no app de ${e.nome} e em Arquivos › Entregáveis › BPO financeiro` })
  }
  const entregarFechamento = (e: EmpresaVista) => {
    const f = fechamentoDe(e)
    if (!f) return
    executar(() => {
      eventoBpo(banco, e.contabil ? `bpo.mes_fechado: lançamentos de outubro de ${e.nome} entregues ao setor Contábil, já classificados` : `Fechamento de outubro de ${e.nome} enviado ao contador da empresa`, e.clienteId, 'bpo.relatorio_mensal')
      return repos.bpo.entregas.atualizar(f.id, { situacao: 'enviado', enviado_em: agoraBpo(), enviado_por: usuario.nome }, { texto: `Fechamento de outubro de ${e.nome} entregue` })
    }, { sucesso: e.contabil ? 'Fechamento entregue ao Contábil (sem redigitar)' : 'Fechamento enviado ao contador da empresa' })
  }
  const sortear = () => {
    const candidatas = lista.flatMap((e) => e.contas.filter((c) => ['aguardando_cliente', 'aprovada', 'liberada', 'paga', 'conferida'].includes(c.etapa)))
    const ids = [...candidatas].sort(() => Math.random() - 0.5).slice(0, 3).map((c) => c.id)
    setAmostra({ ids, conferidas: [] })
    eventoBpo(banco, `Auditoria de qualidade (BPO-013): amostra de ${ids.length} contas sorteada`, empresa?.clienteId ?? null)
  }
  const todasContas = lista.flatMap((e) => e.contas.map((c) => ({ e, c })))

  return (
    <PaginaBpo>
      <CabecalhoBpo integrante="i-bpo-gerencial" titulo="Entregas e SLA" sub="Outubro fechado e novembro em curso · SLA é o combinado no contrato de cada empresa" />
      <Caixa>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Numero valor={`${lista.length ? Math.round(lista.reduce((s, e) => s + e.perfil.sla.mes, 0) / lista.length) : 0}%`} rotulo="SLA médio" />
          <Numero valor={lista.reduce((s, e) => s + e.perfil.sla.desvios.length, 0)} rotulo="desvios no mês" detalhe={`${lista.reduce((s, e) => s + e.perfil.sla.desvios.filter((d) => d.de === 'bpo').length, 0)} do BPO · ${lista.reduce((s, e) => s + e.perfil.sla.desvios.filter((d) => d.de === 'cliente').length, 0)} do cliente`} />
          <Numero valor={lista.filter((e) => relatorioDe(e)?.situacao === 'enviado').length} rotulo="relatórios de outubro enviados" detalhe={`de ${lista.length}`} />
          <Numero valor={lista.filter((e) => fechamentoDe(e)?.situacao === 'enviado').length} rotulo="fechamentos entregues" detalhe="Contábil ou contador da empresa" />
        </div>
      </Caixa>
      <div className="grid gap-4 md:grid-cols-2">
        {lista.map((e) => {
          const rel = relatorioDe(e)
          const fch = fechamentoDe(e)
          const rascunho = !!docDe(e) || !!rel?.extras?.rascunho
          return (
            <Caixa key={e.clienteId}>
              <TituloBloco descricao={`SLA ${e.perfil.sla.mes}% (meta ${e.perfil.sla.meta}%) · ${e.perfil.responsavel_nome}`}>{e.nome}</TituloBloco>
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
              <ul className="divide-border/70 flex flex-col divide-y text-sm">
                <li className="flex flex-wrap items-center gap-2 py-2">
                  <FileTextIcon className="text-muted-foreground size-4" />
                  <span className="min-w-0 flex-1">
                    Relatório de outubro (DRE, caixa, pagamentos, pendências)
                    {rel?.situacao === 'enviado' && <span className="text-muted-foreground block text-xs">enviado {dataHora(rel.enviado_em)} por {rel.enviado_por}</span>}
                    {rel?.situacao !== 'enviado' && rascunho && <span className="text-muted-foreground block text-xs">rascunho do Gerencial pronto para revisar</span>}
                  </span>
                  {rel?.situacao === 'enviado' ? (
                    <Badge variant="sucesso">no app</Badge>
                  ) : rascunho ? (
                    <SePode ferramenta="bpo.relatorio_mensal" alvo={{ cliente_id: e.clienteId }}>
                      <Button size="sm" variant="outline" className="rounded-full" onClick={() => enviarRelatorio(e)}>
                        Fechar e enviar
                      </Button>
                    </SePode>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-full"
                      onClick={() =>
                        pedir({
                          integrante: 'i-bpo-gerencial',
                          titulo: `Rascunhar o relatório de outubro de ${e.nome}`,
                          cliente: e.nome,
                          inicio: 'Vou montar o relatório de outubro: caixa, pagamentos, DRE gerencial e o que ficou pendente.',
                          etapas: ['Somando o caixa e os pagamentos do mês', 'Montando a DRE gerencial por centro', 'Escrevendo o resumo de riscos e pendências'],
                          fim: { texto: `Rascunho do relatório de outubro de ${e.nome} pronto. Falta o Gestor revisar e fechar: eu não envio ao cliente.`, aviso: `Gerencial rascunhou o relatório de ${e.nome}` },
                          efeito: { tipo: 'relatorio', clienteId: e.clienteId, competencia: '2026-10' },
                        })
                      }
                    >
                      Pedir ao Gerencial
                    </Button>
                  )}
                </li>
                <li className="flex flex-wrap items-center gap-2 py-2">
                  <FileTextIcon className="text-muted-foreground size-4" />
                  <span className="min-w-0 flex-1">
                    {e.contabil ? 'Fechamento ao setor Contábil (bpo.mes_fechado)' : 'Fechamento ao contador da empresa (BPO-013)'}
                    <span className="text-muted-foreground block text-xs">{fch?.situacao === 'enviado' ? `entregue ${dataHora(fch.enviado_em)}` : 'até dia 7 · conciliação sem pendência e relatório aprovado'}</span>
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
          <TituloBloco descricao="Carteira e desvios de cada analista no mês.">SLA por analista</TituloBloco>
          <ul className="divide-border/70 flex flex-col divide-y text-sm">
            {analistas.map((a) => {
              const deles = lista.filter((e) => e.perfil.analista_nome === a)
              const sla = Math.round(deles.reduce((s, e) => s + e.perfil.sla.mes, 0) / deles.length)
              return (
                <li key={a} className="flex items-center gap-3 py-2">
                  <span className="min-w-0 flex-1">
                    {a}
                    <span className="text-muted-foreground block text-xs">
                      {deles.length} empresa{deles.length > 1 ? 's' : ''} · {deles.reduce((s, e) => s + e.perfil.sla.desvios.filter((d) => d.de === 'bpo').length, 0)} desvio(s) do BPO · {deles.filter((e) => e.audit.cor === 'vermelho').length} no vermelho
                    </span>
                  </span>
                  <span className={cn('tabular-nums', sla < 95 && 'text-destructive')}>{sla}%</span>
                </li>
              )
            })}
          </ul>
        </Caixa>
        <Caixa>
          <TituloBloco
            descricao="BPO-013: o integrante confere por regra e sorteia uma amostra para uma pessoa revisar."
            acao={
              <Button size="sm" variant="outline" className="rounded-full" onClick={sortear}>
                <DiceFiveIcon /> Sortear amostra
              </Button>
            }
          >
            Auditoria de qualidade
          </TituloBloco>
          {!amostra ? (
            <p className="text-muted-foreground text-sm">Sorteie três contas do mês para revisar documento, valor, conferência e aprovação.</p>
          ) : (
            <ul className="flex flex-col gap-1 text-sm">
              {amostra.ids.map((id) => {
                const x = todasContas.find((y) => y.c.id === id)
                if (!x) return null
                return (
                  <li key={id}>
                    <label className="flex cursor-pointer items-start gap-2.5">
                      <input type="checkbox" className="accent-foreground mt-0.5 size-4" checked={amostra.conferidas.includes(id)} onChange={(ev) => setAmostra({ ...amostra, conferidas: ev.target.checked ? [...amostra.conferidas, id] : amostra.conferidas.filter((z) => z !== id) })} />
                      <span>
                        {x.c.contraparte} · {brl(x.c.valor)}
                        <span className="text-muted-foreground block text-xs">
                          {x.e.nome} · digitou {x.c.digitado_por_nome} · conferiu {x.c.conferencias.map((k) => k.nome).join(' e ') || 'ninguém ainda'}
                        </span>
                      </span>
                    </label>
                  </li>
                )
              })}
              {amostra.conferidas.length === amostra.ids.length && <li className="text-success text-xs">Amostra revisada: sem divergência.</li>}
            </ul>
          )}
        </Caixa>
      </div>
    </PaginaBpo>
  )
}

/**
 * BPO › Volume e faturamento (S08-T06, A30 e A31; 10, 7.2 e 7.3): a contagem
 * do mês contra a faixa, o extrato com contestação e glosa e o excedente que
 * vira extra na fatura única do Financeiro com o ok de uma pessoa.
 */
export function VolumeBpoTela({ empresa }: PropsBpo) {
  const { empresas } = useBpo()
  const loja = useLoja()
  const nav = useNavegacao()
  const executar = useAcao()
  const confirmar = useConfirmar()
  const { usuario, permissoes } = useSessao()
  const lista = empresa ? [empresa] : empresas
  const [aberto, setAberto] = useState<string | null>(empresa?.clienteId ?? null)
  const contestar = async (e: EmpresaVista) => {
    if (!e.volume) return
    const motivo = await confirmar({ titulo: `Contestar o volume de ${e.nome}?`, descricao: 'Registra a contestação de 10 lançamentos (duplicados ou ajustes que não contam). Aceita, vira glosa e sai do excedente.', acao: 'Registrar contestação', exigirMotivo: true })
    if (typeof motivo !== 'string') return
    executar(() => repos.bpo.volumes.atualizar(e.volume!.id, { situacao: 'contestado', contestacoes: [...e.volume!.contestacoes, { id: `ct${Date.now().toString(36)}`, unidade: 'lançamentos', quantidade: 10, motivo, por: usuario.nome, situacao: 'aberta' }] }, { texto: `Contestação no volume de ${e.nome}: ${motivo}` }), { sucesso: 'Contestação registrada' })
  }
  const decidir = (v: BpoVolume, id: string, situacao: 'aceita' | 'recusada') =>
    executar(() => {
      const contestacoes = v.contestacoes.map((c) => (c.id === id ? { ...c, situacao } : c))
      return repos.bpo.volumes.atualizar(v.id, { contestacoes, situacao: contestacoes.some((c) => c.situacao === 'aberta') ? 'contestado' : 'aberto' }, { texto: `Contestação ${situacao === 'aceita' ? 'aceita: vira glosa' : 'recusada'}` })
    }, { sucesso: situacao === 'aceita' ? 'Glosa aplicada' : 'Contestação recusada' })
  const faturar = async (e: EmpresaVista) => {
    const n = excedenteDe(e)
    const ok = await confirmar({ titulo: `Lançar ${n} lançamentos acima da faixa (${brl(n * PRECO_EXCEDENTE)}) como extra?`, descricao: `Entra na fatura única de dezembro de ${e.nome}, numa linha própria; a NFS-e sai por serviço (${tributacaoServico.bpo.codigo}).`, acao: 'Lançar o extra' })
    if (ok !== true || !e.volume) return
    executar(() => repos.bpo.volumes.atualizar(e.volume!.id, { situacao: 'faturado', extra_valor: n * PRECO_EXCEDENTE, faturado_por: usuario.nome }, { ferramenta: 'bpo.volume.faturar', texto: `${usuario.nome} lançou o excedente de ${e.nome} (${brl(n * PRECO_EXCEDENTE)}) na fatura única` }))
    loja.toast(`${n} lançamentos acima da faixa (${brl(n * PRECO_EXCEDENTE)}) vão na fatura única de dezembro`, { modulo: 'financeiro', aba: 'cobranca' }, 'Ver em Cobranças')
  }
  return (
    <PaginaBpo>
      <CabecalhoBpo integrante="i-bpo-gerencial" titulo="Volume e faturamento" sub={`Novembro até hoje (${COMPETENCIA_BPO}) · conta só o entregue e não contestado; o extra precisa do ok de uma pessoa`}>
        {permissoes.modulos.includes('financeiro') && (
          <Button size="sm" variant="outline" className="rounded-full" onClick={() => nav.irPara({ modulo: 'financeiro', aba: 'cobranca' })}>
            <ArrowSquareOutIcon /> Cobranças no Financeiro
          </Button>
        )}
        <span className="text-muted-foreground text-xs">{loja.estado.cenario === 'bpo_puro' ? 'O honorário do BPO sai na fatura do escritório, titular escritório.' : 'Fatura única: um pagamento só, com cada serviço numa linha e a nota fiscal por serviço.'}</span>
      </CabecalhoBpo>
      <Caixa>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Numero valor={lista.reduce((s, e) => s + e.perfil.volume.lancamentos, 0).toLocaleString('pt-BR')} rotulo="lançamentos" />
          <Numero valor={lista.reduce((s, e) => s + e.perfil.volume.pagamentos, 0)} rotulo="pagamentos preparados" />
          <Numero valor={brl(lista.reduce((s, e) => s + e.perfil.honorario, 0))} rotulo="honorário BPO no mês" />
          <Numero valor={lista.filter((e) => excedenteDe(e) > 0).length} rotulo="acima da faixa" detalhe={`${lista.reduce((s, e) => s + (e.volume?.contestacoes.filter((c) => c.situacao === 'aberta').length ?? 0), 0)} contestação(ões) aberta(s)`} />
        </div>
      </Caixa>
      <Caixa className="gap-0 p-0 sm:p-0">
        <ul className="divide-border/70 flex flex-col divide-y">
          {lista.map((e) => {
            const exc = excedenteDe(e)
            const v = e.volume
            return (
              <li key={e.clienteId} className="flex flex-col gap-2 px-4 py-3 sm:px-5">
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                  <button type="button" className="min-w-0 flex-1 basis-56 cursor-pointer text-left" onClick={() => setAberto((x) => (x === e.clienteId ? null : e.clienteId))} aria-expanded={aberto === e.clienteId}>
                    <span className="block truncate text-sm font-medium">{e.nome}</span>
                    <span className="text-muted-foreground block text-xs">
                      {e.perfil.volume.faixa} · {e.perfil.volume.contas} conta{e.perfil.volume.contas > 1 ? 's' : ''} · {e.perfil.volume.conciliacoes} conciliações · ver extrato
                    </span>
                    <span className="text-muted-foreground block text-xs">
                      {e.contabil && loja.estado.cenario !== 'bpo_puro' ? `Fatura única: contábil + BPO${exc > 0 ? ' + excedente' : ''} · NFS-e por serviço (${tributacaoServico.contabil.codigo} e ${tributacaoServico.bpo.codigo})` : `Fatura do BPO${exc > 0 ? ' com a linha do excedente' : ''} · NFS-e ${tributacaoServico.bpo.codigo}`}
                    </span>
                  </button>
                  <span className="w-full sm:w-56">
                    <BarraUso rotulo="Lançamentos" usado={e.perfil.volume.lancamentos - glosaDe(v)} total={e.perfil.volume.limite} />
                  </span>
                  <span className="w-24 text-right text-sm tabular-nums">{brl(e.perfil.honorario)}</span>
                  <span className="flex w-44 justify-end gap-1">
                    {v?.situacao === 'faturado' ? (
                      <Badge variant="sucesso">extra de {brl(v.extra_valor)} lançado</Badge>
                    ) : exc > 0 ? (
                      <SePode ferramenta="bpo.volume.faturar">
                        <Button size="sm" variant="outline" className="rounded-full" disabled={v?.contestacoes.some((c) => c.situacao === 'aberta')} title={v?.contestacoes.some((c) => c.situacao === 'aberta') ? 'Decida a contestação antes de faturar' : undefined} onClick={() => void faturar(e)}>
                          <PlusIcon /> Extra de {brl(exc * PRECO_EXCEDENTE)}
                        </Button>
                      </SePode>
                    ) : null}
                  </span>
                </div>
                {aberto === e.clienteId && v && (
                  <div className="bg-sunken/50 flex flex-col gap-2 rounded-[14px] p-3 text-sm">
                    <span className="text-muted-foreground text-xs">Extrato de volume de {COMPETENCIA_BPO} (o cliente vê antes da fatura)</span>
                    <ul className="flex flex-col gap-1">
                      {v.itens.map((i) => (
                        <li key={i.unidade} className="flex gap-2">
                          <span className="flex-1">{i.unidade}</span>
                          <span className="tabular-nums">{i.quantidade.toLocaleString('pt-BR')}</span>
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
                        <span className="min-w-0 flex-1">
                          {c.quantidade} {c.unidade}: {c.motivo} · {c.por}
                        </span>
                        {c.situacao === 'aberta' ? (
                          <>
                            <Button size="sm" variant="outline" className="rounded-full" onClick={() => decidir(v, c.id, 'aceita')}>
                              <CheckIcon /> Aceitar (glosa)
                            </Button>
                            <Button size="sm" variant="ghost" className="rounded-full" onClick={() => decidir(v, c.id, 'recusada')}>
                              <XIcon /> Recusar
                            </Button>
                          </>
                        ) : (
                          <Badge variant="outline">{c.situacao}</Badge>
                        )}
                      </div>
                    ))}
                    {v.situacao !== 'faturado' && (
                      <SePode ferramenta="bpo.volume.contestar">
                        <Button size="sm" variant="ghost" className="w-fit rounded-full" onClick={() => void contestar(e)}>
                          <ScalesIcon /> Registrar contestação
                        </Button>
                      </SePode>
                    )}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </Caixa>
    </PaginaBpo>
  )
}

/**
 * BPO › Rentabilidade e capacidade (S08-T06, A32; 10, 7.4): margem por
 * empresa, por contratante e por departamento; carga da semana pela fila e
 * pelo calendário. Só Administrador (e Gestor com Gestão ou Financeiro).
 */
export function RentabilidadeBpoTela({ empresa }: PropsBpo) {
  const { empresas } = useBpo()
  const contratantes = useContratantes()
  const loja = useLoja()
  const nav = useNavegacao()
  const custoHora = loja.estado.custoPorPacote ? custoHoraPacoteBpo : custoEscritorio.valor
  const lista = empresa ? [empresa] : empresas
  const margem = (honorario: number, horas: number) => (honorario > 0 ? Math.round(((honorario - horas * custoHora) / honorario) * 100) : 0)
  const analistas = [...new Set(empresas.map((e) => e.perfil.analista_nome))]
  const capacidade: Record<string, number> = { 'Lucas Prado': 40, 'Marina Teixeira': 30 }
  // Carga das próximas quatro semanas: fila com prazo na semana (1,5 h por item) + rotinas diárias (0,25 h por empresa e dia).
  const semanas = [0, 1, 2, 3].map((s) => {
    const itens = empresas.flatMap((e) => e.fila).filter((f) => Math.floor(Math.max(0, diasAte(f.prazo)) / 7) === s).length
    const rotinas = empresas.reduce((n, e) => n + e.rotinas.filter((r) => r.ativa && r.cadencia === 'diária').length, 0) * 5 * 0.25
    return { rotulo: s === 0 ? 'esta semana' : `+${s} sem.`, horas: Math.round(itens * 1.5 + rotinas + (s === 3 ? 6 : 0)) }
  })
  const maxSemana = Math.max(...semanas.map((s) => s.horas), 1)
  return (
    <PaginaBpo>
      <CabecalhoBpo integrante="i-bpo-gerencial" titulo="Rentabilidade e capacidade" sub={`Horas do Timesheet de novembro · ${loja.estado.custoPorPacote ? `custo-hora do pacote BPO, ${brl(custoHora)}` : `custo-hora do escritório, ${brl(custoHora)} (todos os pacotes)`}`}>
        <Button size="sm" variant="outline" className="rounded-full" onClick={() => nav.irPara({ modulo: 'timesheet', aba: 'rentabilidade' })}>
          <ArrowSquareOutIcon /> Ver no Timesheet (filtro BPO)
        </Button>
      </CabecalhoBpo>
      {!loja.estado.custoPorPacote && (
        <p className="bg-sunken/60 text-muted-foreground rounded-[14px] px-4 py-2.5 text-sm">
          No custo-hora do escritório, que inclui a equipe contábil, o BPO aparece com margem menor. Para ver com o custo da equipe do BPO, ligue “Custo-hora por pacote (opcional)” em Timesheet › Configurar › Custo-hora.
        </p>
      )}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Caixa className="gap-0">
          <TituloBloco descricao="Honorário do BPO menos as horas da equipe.">Margem por empresa</TituloBloco>
          <ul className="divide-border/70 mt-2 flex flex-col divide-y" aria-label="Margem por empresa">
            {lista.map((e) => (
              <li key={e.clienteId} className="grid grid-cols-[minmax(0,1fr)_4.5rem_4.5rem_3.5rem] items-center gap-3 py-2.5 text-sm">
                <span className="truncate">{e.nome}</span>
                <span className="text-muted-foreground text-right text-xs tabular-nums">{e.perfil.horas_mes.toLocaleString('pt-BR')} h</span>
                <span className="text-muted-foreground text-right text-xs tabular-nums">{brl(e.perfil.honorario / Math.max(e.perfil.horas_mes, 1))}/h</span>
                <span className={cn('text-right tabular-nums', margem(e.perfil.honorario, e.perfil.horas_mes) < 20 && 'text-destructive')}>{margem(e.perfil.honorario, e.perfil.horas_mes)}%</span>
              </li>
            ))}
          </ul>
        </Caixa>
        <Caixa>
          <TituloBloco descricao="Horas de BPO no mês contra o que cada pessoa tem para o pacote.">Capacidade</TituloBloco>
          {analistas.map((p) => (
            <BarraUso key={p} rotulo={p} usado={empresas.filter((e) => e.perfil.analista_nome === p).reduce((s, e) => s + e.perfil.horas_mes, 0)} total={capacidade[p] ?? 30} unidade=" h" />
          ))}
          <p className="text-muted-foreground text-xs">O integrante faz a captura e a conciliação; as horas são de conferência, exceções e cliente. Empresa com retrabalho (sincronização parada) consome mais: vale rever a faixa no aditivo.</p>
        </Caixa>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Caixa>
          <TituloBloco descricao="Pela fila (prazo de cada item) e pelas rotinas; a última semana tem o fechamento do mês.">Carga por semana</TituloBloco>
          <div className="flex h-32 items-end gap-3" role="img" aria-label={`Carga por semana: ${semanas.map((s) => `${s.rotulo} ${s.horas} h`).join('; ')}`}>
            {semanas.map((s) => (
              <div key={s.rotulo} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-xs tabular-nums">{s.horas} h</span>
                <span className="bg-foreground/60 w-full max-w-10 rounded-t-[6px]" style={{ height: `${(s.horas / maxSemana) * 90}px` }} />
                <span className="text-muted-foreground text-[11px]">{s.rotulo}</span>
              </div>
            ))}
          </div>
        </Caixa>
        <Caixa className="gap-0">
          <TituloBloco descricao="BPO entre escritórios: margem por contratante e por departamento contratado.">Margem por contratante</TituloBloco>
          {contratantes.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nenhum contratante.</p>
          ) : (
            <ul className="divide-border/70 mt-2 flex flex-col divide-y text-sm">
              {contratantes.map((c) => (
                <li key={c.id} className="flex flex-col gap-1 py-2.5">
                  <span className="flex items-center gap-2">
                    <span className="min-w-0 flex-1 truncate">{c.nome}</span>
                    <span className="text-muted-foreground text-xs tabular-nums">{c.horas_mes} h</span>
                    <span className={cn('w-12 text-right tabular-nums', c.margem < 20 && 'text-destructive')}>{c.margem}%</span>
                  </span>
                  <span className="text-muted-foreground flex flex-wrap gap-x-3 text-xs">
                    {c.escopo_mae.map((d, i) => (
                      <span key={d}>
                        {({ dp: 'DP', fiscal: 'Fiscal', contabil: 'Contábil' } as Record<string, string>)[d] ?? d}: {Math.max(0, c.margem + (i === 0 ? 6 : -4 * i))}%
                      </span>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Caixa>
      </div>
    </PaginaBpo>
  )
}

export { agora, contaAberta, hojeBpo }

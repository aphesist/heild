import { ArrowRightIcon, CaretDownIcon, CheckCircleIcon, PlusIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { useSessao } from '@/ambiente/sessao'
import { EstadoVazio, SePode } from '@/components/kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { BriefcaseIcon } from '@phosphor-icons/react'
import { FluxoMensal, SaldosContas, SeloTitular } from '../financeiro/pecas'
import { BotaoErp, brl, CabecalhoBpo, Caixa, Numero, PaginaBpo, SeloAudit, SeloErp, TituloBloco, type PropsBpo } from './comum'
import { contaAberta, corAudit, dataHora, diasAte, hora, ordemCor, quando, rotuloCor, rotuloModoPagamento, rotuloSituacaoPerfil, useBpo, type CorAudit, type EmpresaVista } from './dados'
import { FichaEmpresa, NovaEmpresaBpo } from './FichaEmpresa'

interface Decisao {
  id: string
  cor: 'vermelho' | 'amarelo'
  texto: string
  detalhe: string
  empresa: string
  aba: string
  rotulo: string
}

/** O que precisa de decisão hoje, da mais urgente para a menos (gestão por exceção, 10, 5.2). */
export function decisoesDe(lista: EmpresaVista[], podeConfig: boolean): Decisao[] {
  const ds: Decisao[] = []
  for (const e of lista) {
    if (e.erp.efetiva === 'credencial_vencida' || e.erp.efetiva === 'atrasada')
      ds.push({ id: `erp-${e.clienteId}`, cor: 'vermelho', texto: e.erp.efetiva === 'atrasada' ? `${e.erp.provedor} sem sincronizar desde ${dataHora(e.erp.ultima_sincronizacao)}` : `Credencial do ${e.erp.provedor} vencida`, detalhe: e.nome, empresa: e.clienteId, aba: podeConfig ? 'configuracao' : 'fila', rotulo: 'Resolver' })
    for (const c of e.contas.filter((x) => contaAberta(x) && diasAte(x.vencimento) < 0)) ds.push({ id: `venc-${c.id}`, cor: 'vermelho', texto: `${c.contraparte} venceu sem aprovação`, detalhe: `${e.nome} · ${brl(c.valor)} · o sistema avisa, nunca paga`, empresa: e.clienteId, aba: 'aprovacoes', rotulo: 'Ver' })
    if (e.bancos.length && e.caixa < e.perfil.caixa_minimo) ds.push({ id: `cx-${e.clienteId}`, cor: 'vermelho', texto: `Caixa abaixo do mínimo (${brl(e.caixa)} de ${brl(e.perfil.caixa_minimo)})`, detalhe: e.nome, empresa: e.clienteId, aba: 'visao', rotulo: 'Abrir' })
    for (const l of e.lotes.filter((x) => x.situacao === 'recusado')) ds.push({ id: `rc-${l.id}`, cor: 'vermelho', texto: 'Lote recusado pelo cliente', detalhe: `${e.nome} · ${l.motivo ?? ''}`, empresa: e.clienteId, aba: 'aprovacoes', rotulo: 'Refazer' })
    for (const l of e.lotes.filter((x) => x.situacao === 'expirado')) ds.push({ id: `ex-${l.id}`, cor: 'vermelho', texto: 'Cartão expirou sem resposta (nada foi pago)', detalhe: `${e.nome} · ${l.titulo}`, empresa: e.clienteId, aba: 'aprovacoes', rotulo: 'Ver' })
    for (const l of e.lotesAbertos)
      ds.push({ id: `lt-${l.id}`, cor: 'amarelo', texto: `Lote de ${brl(l.total)} com o cliente${diasAte(l.expira_em) <= 0 ? ` · vence hoje ${hora(l.expira_em)}` : ''}`, detalhe: `${e.nome} · expira ${quando(l.expira_em.slice(0, 10))}${l.situacao === 'parcial' ? ` · ${l.aprovacoes.length} de ${l.aprovadores_necessarios} aprovações` : ''}`, empresa: e.clienteId, aba: 'aprovacoes', rotulo: 'Ver' })
    const aConferir = e.contas.filter((c) => c.etapa === 'capturada')
    if (aConferir.length) ds.push({ id: `cf-${e.clienteId}`, cor: 'amarelo', texto: `${aConferir.length} conta${aConferir.length > 1 ? 's' : ''} para conferir`, detalhe: `${e.nome} · quem digitou não confere`, empresa: e.clienteId, aba: 'aprovacoes', rotulo: 'Conferir' })
    const prontas = e.contas.filter((c) => c.etapa === 'em_lote' || c.etapa === 'conferida')
    if (prontas.length) ds.push({ id: `ml-${e.clienteId}`, cor: 'amarelo', texto: `${prontas.length} conta${prontas.length > 1 ? 's' : ''} conferida${prontas.length > 1 ? 's' : ''} esperando lote`, detalhe: `${e.nome} · ${brl(prontas.reduce((s, c) => s + c.valor, 0))}`, empresa: e.clienteId, aba: 'aprovacoes', rotulo: 'Montar' })
    if (e.proposta) ds.push({ id: `al-${e.clienteId}`, cor: 'amarelo', texto: 'Alçadas propostas esperando o aceite do sócio', detalhe: `${e.nome} · proposta por ${e.proposta.proposta_por_nome}`, empresa: e.clienteId, aba: podeConfig ? 'configuracao' : 'visao', rotulo: 'Ver' })
    const incompletos = e.fila.filter((f) => f.faltando.length)
    if (incompletos.length) ds.push({ id: `pi-${e.clienteId}`, cor: 'amarelo', texto: `${incompletos.length} pedido${incompletos.length > 1 ? 's' : ''} sem o que precisa (o SLA não começou)`, detalhe: `${e.nome} · falta ${incompletos[0].faltando.join(', ')}`, empresa: e.clienteId, aba: 'fila', rotulo: 'Ver' })
  }
  return ds.sort((a, b) => (a.cor === b.cor ? 0 : a.cor === 'vermelho' ? -1 : 1))
}

/** Exceções do dia (10, 5.3): fornecedor novo, consentimento a vencer, caixa abaixo do mínimo, sincronização atrasada. */
function excecoesDe(lista: EmpresaVista[]) {
  const tipos = ['fornecedor_novo', 'consentimento_vencendo', 'caixa_abaixo_minimo', 'sincronizacao_atrasada', 'credencial_vencida', 'conector_instavel', 'modo_arquivo_pendente']
  return lista.flatMap((e) => e.audit.motivos.filter((m) => tipos.includes(m.criterio)).map((m) => ({ e, m })))
}

export function ContagemCores({ lista }: { lista: EmpresaVista[] }) {
  const contagem: Record<CorAudit, number> = { verde: 0, amarelo: 0, vermelho: 0 }
  for (const e of lista) contagem[e.audit.cor]++
  return (
    <span className="flex items-center gap-3 text-xl sm:text-2xl">
      {(['verde', 'amarelo', 'vermelho'] as const).map((c) => (
        <span key={c} className="flex items-center gap-1" title={`${contagem[c]} ${rotuloCor[c]}`}>
          <span className="size-2.5 rounded-full" style={{ background: corAudit[c] }} aria-hidden />
          {contagem[c]}
          <span className="sr-only">{rotuloCor[c]}</span>
        </span>
      ))}
    </span>
  )
}

/**
 * BPO › Visão geral (S08-T01): abre pelo que precisa de decisão (vermelho antes
 * de amarelo, as seis primeiras), a auditoria por cor e as exceções do dia; a
 * empresa em dia fica recolhida. Com uma empresa escolhida, a auditoria, o
 * caixa e o fluxo dela.
 */
export function VisaoBpoTela({ empresa, onEscolher }: PropsBpo) {
  const { empresas } = useBpo()
  const { permissoes } = useSessao()
  const lista = empresa ? [empresa] : empresas
  const decisoes = decisoesDe(lista, !!permissoes.abas.bpo?.includes('configuracao'))
  const [todas, setTodas] = useState(false)
  const [verdes, setVerdes] = useState(false)
  const visiveis = todas || empresa ? decisoes : decisoes.slice(0, 6)
  const aguardando = lista.flatMap((e) => e.lotesAbertos)
  const sla = lista.length ? Math.round(lista.reduce((s, e) => s + e.perfil.sla.mes, 0) / lista.length) : 0
  const excecoes = excecoesDe(lista)
  const [ficha, setFicha] = useState<string | null>(null)
  const [nova, setNova] = useState(false)

  if (!empresas.length)
    return (
      <PaginaBpo>
        <CabecalhoBpo integrante="i-bpo-conciliacao" titulo="BPO Financeiro" sub="Nenhuma empresa no BPO ainda" />
        <EstadoVazio
          icone={BriefcaseIcon}
          titulo="Comece pela primeira empresa"
          descricao="O BPO trabalha no ERP que o cliente já usa. A implantação tem oito passos: contrato, termo, convite no app, bancos, ERP, fornecedores, um mês em paralelo e a ativação."
          acao={
            <SePode ferramenta="bpo.onboarding">
              <Button className="rounded-full" onClick={() => setNova(true)}>
                <PlusIcon /> Pôr uma empresa no BPO
              </Button>
            </SePode>
          }
        />
        <NovaEmpresaBpo aberta={nova} onFechar={() => setNova(false)} onCriada={(id) => setFicha(id)} />
        {ficha && <FichaEmpresa clienteId={ficha} onFechar={() => setFicha(null)} onIr={onEscolher} />}
      </PaginaBpo>
    )

  return (
    <PaginaBpo>
      <CabecalhoBpo
        integrante="i-bpo-conciliacao"
        titulo={empresa ? empresa.nome : 'BPO Financeiro'}
        sub={
          empresa
            ? `${empresa.contabil ? 'Cliente contábil e de BPO' : 'Só BPO'} · ${rotuloModoPagamento[empresa.perfil.modo_pagamento]} · responsável ${empresa.perfil.responsavel_nome} · ${rotuloSituacaoPerfil[empresa.perfil.situacao]}`
            : `${empresas.length} empresas na carteira · ${empresas.filter((e) => e.contabil).length} também na contabilidade · ${empresas.reduce((s, e) => s + e.contas.filter(contaAberta).length, 0)} contas abertas`
        }
        status={decisoes.length ? `${decisoes.length} ${decisoes.length > 1 ? 'coisas precisam' : 'coisa precisa'} de decisão; o resto segue nas rotinas` : 'Nada pendente; as rotinas seguem'}
      >
        {empresa && (
          <>
            <SeloTitular titular={{ tipo: 'empresa', clienteId: empresa.clienteId, nome: empresa.nome }} />
            <SeloErp e={empresa} />
            <BotaoErp e={empresa} oque="o painel da empresa" rotulo />
            <Button size="sm" variant="outline" className="rounded-full" onClick={() => setFicha(empresa.clienteId)}>
              Ficha BPO
            </Button>
          </>
        )}
      </CabecalhoBpo>

      <Caixa>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Numero valor={decisoes.length} rotulo="precisam de decisão" detalhe={`${decisoes.filter((d) => d.cor === 'vermelho').length} para hoje`} />
          <Numero valor={aguardando.length} rotulo="lotes com o cliente" detalhe={brl(aguardando.reduce((s, l) => s + l.total, 0))} />
          <Numero valor={`${sla}%`} rotulo="SLA do mês" detalhe="no prazo combinado" />
          <Numero valor={<ContagemCores lista={lista} />} rotulo="auditoria contínua" detalhe="em dia · atenção · agir hoje" />
        </div>
      </Caixa>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Caixa>
          <TituloBloco descricao="Só o que pede uma pessoa; captura, conciliação e lembretes o integrante faz sozinho.">Precisa de decisão</TituloBloco>
          {decisoes.length === 0 && (
            <p className="text-muted-foreground flex items-center gap-2 py-2 text-sm">
              <CheckCircleIcon className="text-success size-5" weight="fill" /> Nada pendente. As rotinas seguem.
            </p>
          )}
          <ul className="flex flex-col gap-2" aria-label="Precisa de decisão">
            {visiveis.map((d) => (
              <li key={d.id} className="bg-sunken/50 flex items-center gap-3 rounded-[14px] p-3 text-sm">
                <span className="size-2.5 shrink-0 rounded-full" style={{ background: corAudit[d.cor] }} aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block">
                    <span className="sr-only">{d.cor === 'vermelho' ? 'Agir hoje: ' : 'Atenção: '}</span>
                    {d.texto}
                  </span>
                  <span className="text-muted-foreground block truncate text-xs">{d.detalhe}</span>
                </span>
                <Button size="sm" variant="outline" className="shrink-0 rounded-full" onClick={() => onEscolher(d.empresa, d.aba)}>
                  {d.rotulo} <ArrowRightIcon />
                </Button>
              </li>
            ))}
          </ul>
          {visiveis.length < decisoes.length && (
            <Button size="sm" variant="ghost" className="w-fit rounded-full" onClick={() => setTodas(true)}>
              Mostrar todas ({decisoes.length})
            </Button>
          )}
        </Caixa>
        <div className="flex flex-col gap-4">
          {empresa ? (
            <Caixa>
              <TituloBloco descricao="Por que a empresa está nesta cor (critérios e pesos).">Auditoria contínua</TituloBloco>
              <div className="flex flex-wrap items-center gap-2">
                <SeloAudit e={empresa} onIr={(a) => onEscolher(empresa.clienteId, a)} />
                {empresa.perfil.situacao === 'paralelo' && <Badge variant="destaque">em paralelo até {quando(empresa.perfil.paralelo_ate)}</Badge>}
              </div>
              <ul className="flex flex-col gap-1.5 text-sm">
                {empresa.audit.motivos.length === 0 && <li className="text-muted-foreground">Nenhum critério pesou.</li>}
                {empresa.audit.motivos.map((m, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="bg-muted-foreground mt-2 size-1 shrink-0 rounded-full" />
                    <span className="flex-1">{m.texto}</span>
                    <span className="text-muted-foreground text-xs tabular-nums">peso {m.peso}</span>
                  </li>
                ))}
              </ul>
            </Caixa>
          ) : (
            <Caixa>
              <TituloBloco descricao="Quem pede atenção primeiro; a empresa em dia fica recolhida.">Carteira por exceção</TituloBloco>
              <ul className="divide-border/70 flex flex-col divide-y">
                {[...empresas]
                  .filter((e) => verdes || e.audit.cor !== 'verde')
                  .sort((a, b) => ordemCor.indexOf(a.audit.cor) - ordemCor.indexOf(b.audit.cor) || b.audit.pontos - a.audit.pontos)
                  .map((e) => (
                    <li key={e.clienteId} className="flex items-center gap-3 py-2 text-sm">
                      <SeloAudit e={e} compacto onIr={(a) => onEscolher(e.clienteId, a)} />
                      <button type="button" onClick={() => onEscolher(e.clienteId)} className="min-w-0 flex-1 cursor-pointer text-left">
                        <span className="block truncate">{e.nome}</span>
                        <span className="text-muted-foreground block truncate text-xs">{e.audit.motivos[0]?.texto ?? 'em dia'}</span>
                      </button>
                      <span className="text-muted-foreground hidden text-xs sm:inline">{e.erp.provedor}</span>
                    </li>
                  ))}
              </ul>
              {empresas.some((e) => e.audit.cor === 'verde') && (
                <Button size="sm" variant="ghost" className="w-fit rounded-full" onClick={() => setVerdes((v) => !v)}>
                  <CaretDownIcon className={cn('transition-transform', verdes && 'rotate-180')} />
                  {verdes ? 'Recolher as em dia' : `${empresas.filter((e) => e.audit.cor === 'verde').length} empresa${empresas.filter((e) => e.audit.cor === 'verde').length > 1 ? 's' : ''} em dia`}
                </Button>
              )}
            </Caixa>
          )}
          <Caixa>
            <TituloBloco descricao="O que mudou hoje e pede um olhar.">Exceções do dia</TituloBloco>
            {excecoes.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhuma exceção hoje.</p>
            ) : (
              <ul className="flex flex-col gap-1.5 text-sm">
                {excecoes.map(({ e, m }, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full" style={{ background: corAudit[e.audit.cor] }} aria-hidden />
                    <button type="button" className="min-w-0 flex-1 cursor-pointer text-left hover:underline" onClick={() => onEscolher(e.clienteId, m.aba)}>
                      {m.texto}
                      {!empresa && <span className="text-muted-foreground"> · {e.nome}</span>}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Caixa>
        </div>
      </div>

      {empresa && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <Caixa>
            <TituloBloco descricao="Em mil reais; dois meses de histórico e quatro projetados (Gerencial).">Fluxo de caixa</TituloBloco>
            <FluxoMensal d={{ meses: ['set', 'out', 'nov', 'dez', 'jan', 'fev'], entradas: empresa.perfil.fluxo.entradas, saidas: empresa.perfil.fluxo.saidas, inicio: 2, marcos: [{ mes: 3, texto: '13º e férias' }] }} />
          </Caixa>
          <Caixa>
            <TituloBloco descricao={`Saldos lidos do banco; mínimo combinado ${brl(empresa.perfil.caixa_minimo)}.`}>Caixa da empresa</TituloBloco>
            <SaldosContas bancos={empresa.bancos.map((b) => ({ id: b.id, nome: b.nome, saldo: b.saldo, atualizado: dataHora(b.saldo_em), via: b.via === 'open_finance' ? 'Open Finance' : b.via === 'api_banco' ? 'API do banco' : b.via === 'ofx' ? 'OFX' : 'lançado no ERP' }))} aPagar30={empresa.contas.filter(contaAberta).reduce((s, c) => s + c.valor, 0)} />
          </Caixa>
        </div>
      )}
      <NovaEmpresaBpo aberta={nova} onFechar={() => setNova(false)} onCriada={(id) => setFicha(id)} />
      {ficha && <FichaEmpresa clienteId={ficha} onFechar={() => setFicha(null)} onIr={onEscolher} />}
    </PaginaBpo>
  )
}

/**
 * BPO › Carteira (S08-T02): as empresas com ERP e sincronização, auditoria,
 * caixa contra o mínimo, lotes com o cliente, fila e SLA. A linha abre a
 * ficha BPO da empresa (perfil, onboarding, encerrar).
 */
export function CarteiraBpoTela({ empresa, onEscolher }: PropsBpo) {
  const { empresas, encerradas } = useBpo()
  const [ficha, setFicha] = useState<string | null>(null)
  const [nova, setNova] = useState(false)
  const [verEncerradas, setVerEncerradas] = useState(false)
  return (
    <PaginaBpo>
      <CabecalhoBpo integrante="i-bpo-conciliacao" titulo="Carteira" sub="Cada empresa com o ERP que já usa: a plataforma lê o espelho; a aprovação, a alçada e a trilha ficam aqui">
        <SePode ferramenta="bpo.onboarding">
          <Button size="sm" className="rounded-full" onClick={() => setNova(true)}>
            <PlusIcon /> Pôr empresa no BPO
          </Button>
        </SePode>
      </CabecalhoBpo>
      {empresas.length === 0 ? (
        <EstadoVazio icone={BriefcaseIcon} titulo="Nenhuma empresa no BPO" descricao="Ponha a primeira empresa: a implantação guia os oito passos." />
      ) : (
        <Caixa className="gap-0 p-0 sm:p-0">
          <ul className="divide-border/70 flex flex-col divide-y" aria-label="Empresas do BPO">
            {[...empresas]
              .sort((a, b) => ordemCor.indexOf(a.audit.cor) - ordemCor.indexOf(b.audit.cor))
              .map((e) => (
                <li key={e.clienteId} className={cn('flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-5', empresa?.clienteId === e.clienteId && 'bg-raised/50')}>
                  <button type="button" onClick={() => setFicha(e.clienteId)} className="min-w-0 flex-1 basis-64 cursor-pointer text-left" aria-label={`Ver a ficha BPO de ${e.nome}`}>
                    <span className="flex items-center gap-2">
                      <span className="size-2.5 shrink-0 rounded-full" style={{ background: corAudit[e.audit.cor] }} aria-hidden />
                      <span className="truncate text-sm font-medium">{e.nome}</span>
                      {e.contabil && (
                        <Badge variant="outline" className="hidden sm:inline-flex">
                          também contábil
                        </Badge>
                      )}
                      {e.perfil.situacao !== 'ativo' && <Badge variant="destaque">{rotuloSituacaoPerfil[e.perfil.situacao]}</Badge>}
                    </span>
                    <span className="text-muted-foreground mt-0.5 block truncate text-xs">
                      {rotuloCor[e.audit.cor]} · {e.perfil.responsavel_nome === e.perfil.analista_nome ? e.perfil.responsavel_nome : `${e.perfil.analista_nome} faz · ${e.perfil.responsavel_nome} confere`} · {e.audit.motivos[0]?.texto ?? 'tudo em dia'}
                    </span>
                  </button>
                  <SeloErp e={e} />
                  <span className="w-32 text-right text-sm tabular-nums">
                    <span className={e.caixa < e.perfil.caixa_minimo ? 'text-destructive' : undefined}>{brl(e.caixa)}</span>
                    <span className="text-muted-foreground block text-[11px]">mínimo {brl(e.perfil.caixa_minimo)}</span>
                  </span>
                  <span className="text-muted-foreground w-36 text-xs">
                    {e.lotesAbertos.length === 0 ? 'nenhum lote' : `${e.lotesAbertos.length} lote${e.lotesAbertos.length === 1 ? '' : 's'}`} com o cliente
                    <span className="block">
                      {e.fila.length} na fila · SLA {e.perfil.sla.mes}%
                    </span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" className="rounded-full" onClick={() => onEscolher(e.clienteId, 'visao')}>
                      Abrir
                    </Button>
                    <BotaoErp e={e} oque={`a empresa ${e.nome}`} />
                  </span>
                </li>
              ))}
          </ul>
        </Caixa>
      )}
      {encerradas.length > 0 && (
        <Caixa>
          <button type="button" className="text-muted-foreground flex cursor-pointer items-center gap-2 text-sm" onClick={() => setVerEncerradas((v) => !v)}>
            <CaretDownIcon className={cn('transition-transform', verEncerradas && 'rotate-180')} /> {encerradas.length} empresa{encerradas.length > 1 ? 's' : ''} com o BPO encerrado
          </button>
          {verEncerradas && (
            <ul className="text-muted-foreground flex flex-col gap-1 text-sm">
              {encerradas.map((e) => (
                <li key={e.clienteId}>
                  {e.nome} · encerrado: {e.perfil.encerramento?.motivo}
                </li>
              ))}
            </ul>
          )}
        </Caixa>
      )}
      <NovaEmpresaBpo aberta={nova} onFechar={() => setNova(false)} onCriada={(id) => setFicha(id)} />
      {ficha && <FichaEmpresa clienteId={ficha} onFechar={() => setFicha(null)} onIr={onEscolher} />}
    </PaginaBpo>
  )
}

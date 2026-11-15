import { ArrowRightIcon, ArrowsClockwiseIcon, BriefcaseIcon, CaretDownIcon, CheckCircleIcon, MagnifyingGlassIcon, PlusIcon, SparkleIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { useLoja, usePersistente } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import { BotaoAcoes, EstadoVazio, Quadro, SePode, useAcao, usePode, type AcaoMenu } from '@/components/kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CampoEscolha, Segmentado } from '@/components/ui/formulario'
import { custoHora as custoEscritorio, custoHoraPacoteBpo } from '@/dados/timesheet'
import { cn } from '@/lib/utils'
import type { BpoPerfil } from '@/nucleo/modelo/entidades'
import { FluxoMensal, SaldosContas, SeloTitular } from '../financeiro/pecas'
import { BotaoErp, brl, CabecalhoBpo, Caixa, Numero, PaginaBpo, SeloAudit, SeloErp, TituloBloco, type PropsBpo } from './comum'
import { agoraBpo, contaAberta, corAudit, dataHora, diasAte, hora, ordemCor, quando, rotuloCor, rotuloModoPagamento, rotuloSituacaoPerfil, useBpo, type CorAudit, type EmpresaVista } from './dados'
import { BarraCaixa, FichaEmpresa, NovaEmpresaBpo, useEquipeBpo } from './FichaEmpresa'
import { explicarAudit, usePedirS08a, useTrabalhandoS08a } from './integrantes-s08a'
import { gravarS08a } from './perfil-s08a'

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

/** Margem do BPO na carteira (10, 7.4): só para quem vê Rentabilidade (Administrador; Gestor com Gestão ou Financeiro). */
function useMargem(lista: EmpresaVista[]) {
  const loja = useLoja()
  const custo = loja.estado.custoPorPacote ? custoHoraPacoteBpo : custoEscritorio.valor
  const honorario = lista.reduce((s, e) => s + e.perfil.honorario, 0)
  const custoTotal = lista.reduce((s, e) => s + e.perfil.horas_mes * custo, 0)
  return honorario > 0 ? Math.round(((honorario - custoTotal) / honorario) * 100) : 0
}

/** Empresas em que a pessoa é analista ou responsável ("o que é dele", 10, 5.4). */
export const minhasEmpresas = (lista: EmpresaVista[], nome: string) => lista.filter((e) => e.perfil.analista_nome === nome || e.perfil.responsavel_nome === nome)

/** Itens da fila que estouram o SLA hoje ou amanhã, com a bola conosco. */
function filaEmRisco(lista: EmpresaVista[]) {
  return lista
    .flatMap((e) => e.fila.filter((f) => f.bola === 'bpo' && !f.faltando.length && diasAte(f.prazo) <= 1).map((f) => ({ e, f })))
    .sort((a, b) => a.f.prazo.localeCompare(b.f.prazo))
}

/** O que a Conciliação conta quando pedem o resumo do dia (o que ela faz sozinha e o que fica com as pessoas). */
function resumoDoDia(lista: EmpresaVista[], decisoes: Decisao[]) {
  const vermelhas = decisoes.filter((d) => d.cor === 'vermelho')
  const casam = lista.reduce((s, e) => s + e.transacoes.filter((t) => t.confianca === 'alta').length, 0)
  const conferir = lista.reduce((s, e) => s + e.contas.filter((c) => c.etapa === 'capturada').length, 0)
  const lotes = lista.reduce((s, e) => s + e.lotesAbertos.length, 0)
  const primeiro = vermelhas.length ? ` Para hoje: ${vermelhas.slice(0, 3).map((d) => `${d.texto} (${d.detalhe.split(' · ')[0]})`).join('; ')}.` : ' Nada vermelho hoje.'
  return `Bom dia! São ${decisoes.length} decisões na carteira, ${vermelhas.length} para hoje.${primeiro} Do meu lado: ${casam} lançamentos do extrato casam por regra e eu concilio quando pedirem; ${conferir} conta${conferir === 1 ? '' : 's'} espera${conferir === 1 ? '' : 'm'} a conferência de uma pessoa (eu não confiro) e ${lotes} lote${lotes === 1 ? '' : 's'} está${lotes === 1 ? '' : 'ão'} com o cliente. Nenhum pagamento sai sem o cliente aprovar.`
}

/**
 * BPO › Visão geral (S08-T01): abre pelo que precisa de decisão (vermelho antes
 * de amarelo, as seis primeiras), a auditoria por cor e as exceções do dia; a
 * empresa em dia fica recolhida. O Membro vê o que é dele (pode abrir a
 * carteira inteira); o Gestor vê a carteira e quem acumula vermelho por
 * analista; o Administrador vê também a margem. Com uma empresa escolhida, a
 * auditoria, o caixa e o fluxo dela.
 */
export function VisaoBpoTela({ empresa, onEscolher }: PropsBpo) {
  const { empresas } = useBpo()
  const { usuario, permissoes } = useSessao()
  const pedir = usePedirS08a()
  const membro = usuario.papel === 'colaborador'
  const [escopo, setEscopo] = usePersistente<'minhas' | 'todas'>(`s08a:visao:escopo:${usuario.id}`, membro ? 'minhas' : 'todas')
  const [, setFiltroCarteira] = usePersistente<FiltrosCarteira>('s08a:carteira:filtros', filtrosPadrao)
  const minhas = minhasEmpresas(empresas, usuario.nome)
  const base = escopo === 'minhas' && minhas.length ? minhas : empresas
  const lista = empresa ? [empresa] : base
  const podeConfig = !!permissoes.abas.bpo?.includes('configuracao')
  const veMargem = !!permissoes.abas.bpo?.includes('rentabilidade')
  const gestor = usuario.papel !== 'colaborador'
  const decisoes = decisoesDe(lista, podeConfig)
  const [todas, setTodas] = useState(false)
  const [verdes, setVerdes] = useState(false)
  const visiveis = todas || empresa ? decisoes : decisoes.slice(0, 6)
  const aguardando = lista.flatMap((e) => e.lotesAbertos)
  const sla = lista.length ? Math.round(lista.reduce((s, e) => s + e.perfil.sla.mes, 0) / lista.length) : 0
  const volume = lista.reduce((s, e) => s + e.perfil.volume.lancamentos, 0)
  const margem = useMargem(lista)
  const excecoes = excecoesDe(lista)
  const risco = filaEmRisco(lista)
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

  const resumo = () =>
    pedir({
      integrante: 'i-bpo-conciliacao',
      titulo: empresa ? `Resumo do dia de ${empresa.nome}` : 'Resumo do dia da carteira',
      cliente: empresa?.nome,
      inicio: 'Vou passar pela carteira e separar o que eu resolvo sozinha do que precisa de vocês.',
      etapas: ['Lendo a auditoria de cada empresa', 'Conferindo a fila, os lotes e o extrato', 'Separando o que é de uma pessoa'],
      fim: { texto: empresa ? explicarAudit(empresa) : resumoDoDia(lista, decisoes) },
    })

  // Quem acumula vermelho por analista (gestão por exceção, 10, 5.2).
  const porAnalista = Object.values(
    empresas.reduce<Record<string, { nome: string; cores: Record<CorAudit, number>; conferir: number }>>((acc, e) => {
      const n = e.perfil.analista_nome
      acc[n] ??= { nome: n, cores: { verde: 0, amarelo: 0, vermelho: 0 }, conferir: 0 }
      acc[n].cores[e.audit.cor]++
      acc[n].conferir += e.contas.filter((c) => c.etapa === 'capturada').length
      return acc
    }, {}),
  ).sort((a, b) => b.cores.vermelho - a.cores.vermelho || b.cores.amarelo - a.cores.amarelo)

  return (
    <PaginaBpo>
      <CabecalhoBpo
        integrante="i-bpo-conciliacao"
        titulo={empresa ? empresa.nome : 'BPO Financeiro'}
        sub={
          empresa
            ? `${empresa.contabil ? 'Cliente contábil e de BPO' : 'Só BPO'} · ${rotuloModoPagamento[empresa.perfil.modo_pagamento]} · responsável ${empresa.perfil.responsavel_nome} · ${rotuloSituacaoPerfil[empresa.perfil.situacao]}`
            : `${lista.length} empresa${lista.length === 1 ? '' : 's'}${escopo === 'minhas' && minhas.length ? ' suas' : ' na carteira'} · ${lista.filter((e) => e.contabil).length} também na contabilidade · ${lista.reduce((s, e) => s + e.contas.filter(contaAberta).length, 0)} contas abertas · ${volume.toLocaleString('pt-BR')} lançamentos no mês`
        }
        status={decisoes.length ? `${decisoes.length} ${decisoes.length > 1 ? 'coisas precisam' : 'coisa precisa'} de decisão; o resto segue nas rotinas` : 'Nada pendente; as rotinas seguem'}
      >
        {empresa ? (
          <>
            <SeloTitular titular={{ tipo: 'empresa', clienteId: empresa.clienteId, nome: empresa.nome }} />
            <SeloErp e={empresa} />
            <BotaoErp e={empresa} oque="o painel da empresa" rotulo />
            <Button size="sm" variant="outline" className="rounded-full" onClick={() => setFicha(empresa.clienteId)}>
              Ficha BPO
            </Button>
          </>
        ) : (
          minhas.length > 0 &&
          minhas.length < empresas.length && (
            <Segmentado
              rotulo="Empresas da Visão geral"
              valor={escopo}
              onMudar={setEscopo}
              opcoes={[
                { valor: 'minhas', rotulo: `Minhas (${minhas.length})` },
                { valor: 'todas', rotulo: `Toda a carteira (${empresas.length})` },
              ]}
            />
          )
        )}
        <Button size="sm" variant="ghost" className="rounded-full" onClick={resumo}>
          <SparkleIcon /> {empresa ? 'Pedir para explicar a cor' : 'Pedir o resumo do dia'}
        </Button>
      </CabecalhoBpo>

      <Caixa>
        <div className={cn('grid grid-cols-2 gap-4', veMargem && !empresa ? 'md:grid-cols-5' : 'md:grid-cols-4')}>
          <Numero valor={decisoes.length} rotulo="precisam de decisão" detalhe={`${decisoes.filter((d) => d.cor === 'vermelho').length} para hoje`} />
          <Numero valor={aguardando.length} rotulo="lotes com o cliente" detalhe={brl(aguardando.reduce((s, l) => s + l.total, 0))} />
          <Numero valor={`${sla}%`} rotulo="SLA do mês" detalhe={risco.length ? `${risco.length} na fila em risco` : 'no prazo combinado'} />
          <Numero valor={<ContagemCores lista={lista} />} rotulo="auditoria contínua" detalhe="em dia · atenção · agir hoje" />
          {veMargem && !empresa && <Numero valor={`${margem}%`} rotulo="margem do BPO" detalhe="honorário menos horas × custo-hora" />}
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
              <li key={d.id} className="bg-sunken/50 flex items-center gap-3 rounded-lg p-3 text-sm">
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
          {todas && !empresa && decisoes.length > 6 && (
            <Button size="sm" variant="ghost" className="w-fit rounded-full" onClick={() => setTodas(false)}>
              Mostrar só as seis primeiras
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
                {[...lista]
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
              {lista.some((e) => e.audit.cor === 'verde') && (
                <Button size="sm" variant="ghost" className="w-fit rounded-full" onClick={() => setVerdes((v) => !v)}>
                  <CaretDownIcon className={cn('transition-transform', verdes && 'rotate-180')} />
                  {verdes ? 'Recolher as em dia' : `${lista.filter((e) => e.audit.cor === 'verde').length} empresa${lista.filter((e) => e.audit.cor === 'verde').length > 1 ? 's' : ''} em dia`}
                </Button>
              )}
            </Caixa>
          )}
          <Caixa>
            <TituloBloco descricao="O que mudou hoje e pede um olhar.">Exceções do dia</TituloBloco>
            {excecoes.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhuma exceção hoje.</p>
            ) : (
              <ul className="flex flex-col gap-1.5 text-sm" aria-label="Exceções do dia">
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

      {!empresa && (
        <div className={cn('grid gap-4', gestor ? 'lg:grid-cols-3' : 'lg:grid-cols-2')}>
          <Caixa>
            <TituloBloco descricao="Bola conosco e prazo hoje ou amanhã (o SLA conta).">Fila em risco</TituloBloco>
            {risco.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nada perto de estourar.</p>
            ) : (
              <ul className="flex flex-col gap-1.5 text-sm" aria-label="Fila em risco">
                {risco.slice(0, 5).map(({ e, f }) => (
                  <li key={f.id} className="flex items-start gap-2">
                    <span className={cn('mt-1.5 size-1.5 shrink-0 rounded-full', diasAte(f.prazo) < 0 ? 'bg-destructive' : 'bg-warning')} aria-hidden />
                    <button type="button" className="min-w-0 flex-1 cursor-pointer text-left hover:underline" onClick={() => onEscolher(e.clienteId, 'fila')}>
                      {f.texto}
                      <span className="text-muted-foreground block text-xs">
                        {e.nome} · {diasAte(f.prazo) < 0 ? `venceu ${quando(f.prazo)}` : `prazo ${quando(f.prazo)}`} · {f.responsavel_nome ?? 'sem responsável'}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Caixa>
          <Caixa>
            <TituloBloco descricao="Saldo lido dos bancos contra o mínimo combinado.">Caixa das empresas</TituloBloco>
            <ul className="flex flex-col gap-2.5 text-sm" aria-label="Caixa das empresas">
              {[...lista]
                .filter((e) => e.bancos.length)
                .sort((a, b) => a.caixa / Math.max(a.perfil.caixa_minimo, 1) - b.caixa / Math.max(b.perfil.caixa_minimo, 1))
                .map((e) => (
                  <li key={e.clienteId}>
                    <button type="button" className="flex w-full cursor-pointer flex-col gap-1 text-left" onClick={() => onEscolher(e.clienteId, 'visao')}>
                      <span className="flex items-baseline gap-2">
                        <span className="min-w-0 flex-1 truncate">{e.nome}</span>
                        <span className={cn('text-xs tabular-nums', e.caixa < e.perfil.caixa_minimo ? 'text-destructive-text' : 'text-muted-foreground')}>
                          {brl(e.caixa)} <span className="text-muted-foreground">/ {brl(e.perfil.caixa_minimo)}</span>
                        </span>
                      </span>
                      <BarraCaixa caixa={e.caixa} minimo={e.perfil.caixa_minimo} compacta />
                    </button>
                  </li>
                ))}
            </ul>
          </Caixa>
          {gestor && (
            <Caixa>
              <TituloBloco descricao="Quem está acumulando vermelho; clique para ver a carteira da pessoa.">Por analista</TituloBloco>
              <ul className="divide-border/70 flex flex-col divide-y text-sm" aria-label="Carteira por analista">
                {porAnalista.map((a) => (
                  <li key={a.nome}>
                    <button
                      type="button"
                      className="hover:bg-raised/50 flex w-full cursor-pointer items-center gap-3 rounded-md px-1 py-2 text-left"
                      onClick={() => {
                        setFiltroCarteira({ ...filtrosPadrao, analista: a.nome })
                        onEscolher(null, 'carteira')
                      }}
                      aria-label={`Ver a carteira de ${a.nome}`}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate">{a.nome}</span>
                        <span className="text-muted-foreground block text-xs">{a.conferir ? `${a.conferir} conta${a.conferir > 1 ? 's' : ''} para outra pessoa conferir` : 'nada para conferir'}</span>
                      </span>
                      <span className="flex items-center gap-2 text-xs tabular-nums">
                        {(['vermelho', 'amarelo', 'verde'] as const).map((c) => (
                          <span key={c} className="flex items-center gap-1" title={`${a.cores[c]} ${rotuloCor[c]}`}>
                            <span className="size-2 rounded-full" style={{ background: corAudit[c] }} aria-hidden />
                            {a.cores[c]}
                            <span className="sr-only">{rotuloCor[c]}</span>
                          </span>
                        ))}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </Caixa>
          )}
        </div>
      )}

      {empresa && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <Caixa>
            <TituloBloco descricao="Em mil reais; dois meses de histórico e quatro projetados (Gerencial).">Fluxo de caixa</TituloBloco>
            <FluxoMensal d={{ meses: ['set', 'out', 'nov', 'dez', 'jan', 'fev'], entradas: empresa.perfil.fluxo.entradas, saidas: empresa.perfil.fluxo.saidas, inicio: 2, marcos: [{ mes: 3, texto: '13º e férias' }] }} />
          </Caixa>
          <Caixa>
            <TituloBloco descricao={`Saldos lidos do banco; mínimo combinado ${brl(empresa.perfil.caixa_minimo)}.`}>Caixa da empresa</TituloBloco>
            {empresa.bancos.length ? (
              <>
                <BarraCaixa caixa={empresa.caixa} minimo={empresa.perfil.caixa_minimo} />
                <SaldosContas bancos={empresa.bancos.map((b) => ({ id: b.id, nome: b.nome, saldo: b.saldo, atualizado: dataHora(b.saldo_em), via: b.via === 'open_finance' ? 'Open Finance' : b.via === 'api_banco' ? 'API do banco' : b.via === 'ofx' ? 'OFX' : 'lançado no ERP' }))} aPagar30={empresa.contas.filter(contaAberta).reduce((s, c) => s + c.valor, 0)} />
              </>
            ) : (
              <EstadoVazio compacto icone={BriefcaseIcon} titulo="Nenhum banco conectado" descricao="Conecte por Open Finance na ficha BPO (passo 4 da implantação)." acao={<Button size="sm" variant="outline" className="rounded-full" onClick={() => setFicha(empresa.clienteId)}>Abrir a ficha</Button>} />
            )}
          </Caixa>
        </div>
      )}
      <NovaEmpresaBpo aberta={nova} onFechar={() => setNova(false)} onCriada={(id) => setFicha(id)} />
      {ficha && <FichaEmpresa clienteId={ficha} onFechar={() => setFicha(null)} onIr={onEscolher} />}
    </PaginaBpo>
  )
}

/* ---------- Carteira ---------- */

export interface FiltrosCarteira {
  busca: string
  cor: 'todas' | CorAudit
  erp: 'todos' | 'problema' | 'arquivo' | 'livro'
  analista: string
  situacao: 'todas' | BpoPerfil['situacao']
  ordem: 'auditoria' | 'nome' | 'caixa' | 'sla'
  visao: 'lista' | 'analista'
}
export const filtrosPadrao: FiltrosCarteira = { busca: '', cor: 'todas', erp: 'todos', analista: 'todos', situacao: 'todas', ordem: 'auditoria', visao: 'lista' }

function filtrar(empresas: EmpresaVista[], f: FiltrosCarteira) {
  const q = f.busca.trim().toLowerCase()
  const problema = (e: EmpresaVista) => e.erp.efetiva === 'atrasada' || e.erp.efetiva === 'credencial_vencida' || e.erp.efetiva === 'desconectada' || !!e.erp.aviso
  return empresas
    .filter((e) => !q || e.nome.toLowerCase().includes(q) || e.codigo.includes(q) || e.erp.provedor.toLowerCase().includes(q))
    .filter((e) => f.cor === 'todas' || e.audit.cor === f.cor)
    .filter((e) => f.erp === 'todos' || (f.erp === 'problema' ? problema(e) : f.erp === 'arquivo' ? e.erp.modo === 'E2' : e.erp.modo === 'E3'))
    .filter((e) => f.analista === 'todos' || e.perfil.analista_nome === f.analista || e.perfil.responsavel_nome === f.analista)
    .filter((e) => f.situacao === 'todas' || e.perfil.situacao === f.situacao)
    .sort((a, b) =>
      f.ordem === 'nome'
        ? a.nome.localeCompare(b.nome)
        : f.ordem === 'caixa'
          ? a.caixa / Math.max(a.perfil.caixa_minimo, 1) - b.caixa / Math.max(b.perfil.caixa_minimo, 1)
          : f.ordem === 'sla'
            ? a.perfil.sla.mes - a.perfil.sla.meta - (b.perfil.sla.mes - b.perfil.sla.meta)
            : ordemCor.indexOf(a.audit.cor) - ordemCor.indexOf(b.audit.cor) || b.audit.pontos - a.audit.pontos,
    )
}

/**
 * BPO › Carteira (S08-T02): as empresas com ERP e sincronização, auditoria,
 * caixa contra o mínimo, lotes com o cliente, fila e SLA; busca, filtros e
 * ordem; a visão "Por analista" com arrastar para reatribuir (Gestor); a
 * Conciliação sincroniza a carteira. A linha abre a ficha BPO da empresa.
 */
export function CarteiraBpoTela({ empresa, onEscolher }: PropsBpo) {
  const { empresas, encerradas } = useBpo()
  const { usuario, permissoes } = useSessao()
  const executar = useAcao()
  const pedir = usePedirS08a()
  const equipe = useEquipeBpo()
  const podeReatribuir = usePode('bpo.perfil.editar')
  const podeSincronizar = usePode('erp.sincronizar')
  const sincronizando = useTrabalhandoS08a('sincronizar_carteira')
  const [f, setF] = usePersistente<FiltrosCarteira>('s08a:carteira:filtros', filtrosPadrao)
  const filtros = { ...filtrosPadrao, ...f }
  const mudar = (p: Partial<FiltrosCarteira>) => setF({ ...filtros, ...p })
  const [ficha, setFicha] = useState<{ id: string; secao?: string } | null>(null)
  const [nova, setNova] = useState(false)
  const [verEncerradas, setVerEncerradas] = useState(false)
  const lista = filtrar(empresas, filtros)
  const algumFiltro = filtros.busca || filtros.cor !== 'todas' || filtros.erp !== 'todos' || filtros.analista !== 'todos' || filtros.situacao !== 'todas'
  const contagem: Record<CorAudit, number> = { verde: 0, amarelo: 0, vermelho: 0 }
  for (const e of empresas) contagem[e.audit.cor]++
  const analistas = [...new Set([...equipe.map((u) => u.nome), ...empresas.map((e) => e.perfil.analista_nome)])]

  const sincronizarCarteira = () => {
    const prontas = empresas.filter((e) => e.erp.modo === 'E1' && e.erp.efetiva === 'ok' && (!e.erp.saude || e.erp.saude.funcionando))
    const fora = empresas.filter((e) => !prontas.includes(e) && e.erp.modo !== 'E3')
    pedir({
      integrante: 'i-bpo-conciliacao',
      titulo: 'Sincronizar os ERPs da carteira',
      inicio: `Vou ler os ERPs por API de ${prontas.length} empresa${prontas.length === 1 ? '' : 's'}. Só leitura do espelho: nada muda no ERP do cliente.`,
      etapas: prontas.slice(0, 4).map((e) => `Lendo o ${e.erp.provedor} de ${e.nome}`).concat('Recalculando a auditoria'),
      fim: {
        texto: `Sincronizei ${prontas.map((e) => e.nome).join(', ') || 'nenhuma empresa'}.${fora.length ? ` Ficaram de fora: ${fora.map((e) => `${e.nome} (${e.erp.efetiva === 'credencial_vencida' ? 'credencial vencida: precisa do cliente' : e.erp.modo === 'E2' ? 'modo arquivo: importar o arquivo' : e.erp.aviso ?? 'conector com problema'})`).join('; ')}.` : ''}`,
        aviso: `Carteira sincronizada: ${prontas.length} espelho${prontas.length === 1 ? '' : 's'}`,
      },
      efeito: { tipo: 'sincronizar_carteira', clienteIds: prontas.map((e) => e.clienteId) },
    })
  }

  const reatribuir = (clienteId: string, analista: string) => {
    const e = empresas.find((x) => x.clienteId === clienteId)
    if (!e || e.perfil.analista_nome === analista) return
    executar(
      () =>
        gravarS08a(e.perfil.id, (s) => ({ ...s, versoes: [...(s.versoes ?? []), { versao: (s.versoes?.length ?? 0) + 1, em: agoraBpo(), por: usuario.nome, resumo: `analista: ${analista}` }] }), { analista_nome: analista }, { texto: `Reatribuiu ${e.nome} de ${e.perfil.analista_nome} para ${analista}` }),
      { sucesso: `${e.nome} agora com ${analista}${analista === e.perfil.responsavel_nome ? ' (analista igual ao responsável: BPO de uma pessoa)' : ''}` },
    )
  }

  return (
    <PaginaBpo>
      <CabecalhoBpo integrante="i-bpo-conciliacao" titulo="Carteira" sub="Cada empresa com o ERP que já usa: a plataforma lê o espelho; a aprovação, a alçada e a trilha ficam aqui" status={sincronizando ? 'Sincronizando os ERPs da carteira…' : undefined}>
        <SePode ferramenta="bpo.onboarding">
          <Button size="sm" className="rounded-full" onClick={() => setNova(true)}>
            <PlusIcon /> Pôr empresa no BPO
          </Button>
        </SePode>
        {podeSincronizar && empresas.length > 0 && (
          <Button size="sm" variant="outline" className="rounded-full" disabled={sincronizando} onClick={sincronizarCarteira}>
            <ArrowsClockwiseIcon className={cn(sincronizando && 'animate-spin')} /> {sincronizando ? 'Sincronizando…' : 'Sincronizar a carteira'}
          </Button>
        )}
      </CabecalhoBpo>

      {empresas.length === 0 ? (
        <EstadoVazio icone={BriefcaseIcon} titulo="Nenhuma empresa no BPO" descricao="Ponha a primeira empresa: a implantação guia os oito passos." />
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <label className="bg-raised shadow-contorno flex h-9 w-full items-center gap-2 rounded-full px-3 sm:w-60">
                <MagnifyingGlassIcon className="text-muted-foreground size-4 shrink-0" />
                <input value={filtros.busca} onChange={(ev) => mudar({ busca: ev.target.value })} placeholder="Empresa, código ou ERP" aria-label="Buscar na carteira" className="w-full min-w-0 bg-transparent text-sm outline-none" />
              </label>
              <Segmentado
                rotulo="Filtrar pela auditoria"
                valor={filtros.cor}
                onMudar={(v) => mudar({ cor: v })}
                opcoes={[
                  { valor: 'todas', rotulo: `Todas (${empresas.length})` },
                  { valor: 'vermelho', rotulo: `Agir hoje (${contagem.vermelho})` },
                  { valor: 'amarelo', rotulo: `Atenção (${contagem.amarelo})` },
                  { valor: 'verde', rotulo: `Em dia (${contagem.verde})` },
                ]}
              />
              <span className="ml-auto">
                <Segmentado
                  rotulo="Visualização da carteira"
                  valor={filtros.visao}
                  onMudar={(v) => mudar({ visao: v })}
                  opcoes={[
                    { valor: 'lista', rotulo: 'Lista' },
                    { valor: 'analista', rotulo: 'Por analista' },
                  ]}
                />
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
              <span className="sm:w-48">
                <CampoEscolha rotulo="ERP e sincronização" valor={filtros.erp} onMudar={(v) => mudar({ erp: v })} opcoes={[{ valor: 'todos', rotulo: 'Todo ERP' }, { valor: 'problema', rotulo: 'ERP com problema' }, { valor: 'arquivo', rotulo: 'Modo arquivo' }, { valor: 'livro', rotulo: 'Livro próprio' }]} />
              </span>
              <span className="sm:w-48">
                <CampoEscolha rotulo="Analista ou responsável" valor={filtros.analista} onMudar={(v) => mudar({ analista: v })} opcoes={[{ valor: 'todos', rotulo: 'Toda a equipe' }, ...analistas.map((n) => ({ valor: n, rotulo: n }))]} />
              </span>
              <span className="sm:w-44">
                <CampoEscolha rotulo="Situação do serviço" valor={filtros.situacao} onMudar={(v) => mudar({ situacao: v })} opcoes={[{ valor: 'todas', rotulo: 'Toda situação' }, { valor: 'onboarding', rotulo: 'Em implantação' }, { valor: 'paralelo', rotulo: 'Em paralelo' }, { valor: 'ativo', rotulo: 'Ativas' }, { valor: 'encerrando', rotulo: 'Encerrando' }]} />
              </span>
              <span className="sm:w-48">
                <CampoEscolha rotulo="Ordenar a carteira" valor={filtros.ordem} onMudar={(v) => mudar({ ordem: v })} opcoes={[{ valor: 'auditoria', rotulo: 'Pela auditoria' }, { valor: 'caixa', rotulo: 'Caixa perto do mínimo' }, { valor: 'sla', rotulo: 'SLA abaixo da meta' }, { valor: 'nome', rotulo: 'Pelo nome' }]} />
              </span>
              <span className="text-muted-foreground col-span-2 flex items-center gap-2 text-xs">
                {lista.length} de {empresas.length}
                {algumFiltro && (
                  <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setF({ ...filtrosPadrao, visao: filtros.visao })}>
                    Limpar filtros
                  </Button>
                )}
              </span>
            </div>
          </div>

          {lista.length === 0 ? (
            <EstadoVazio compacto icone={MagnifyingGlassIcon} titulo="Nenhuma empresa com esses filtros" acao={<Button size="sm" variant="outline" className="rounded-full" onClick={() => setF({ ...filtrosPadrao, visao: filtros.visao })}>Limpar filtros</Button>} />
          ) : filtros.visao === 'analista' ? (
            <>
              <p className="text-muted-foreground text-sm">{podeReatribuir ? 'Arraste a empresa para outra pessoa para reatribuir a análise. O responsável que confere não muda.' : 'Só o Gestor do BPO reatribui.'}</p>
              <Quadro
                colunas={analistas.map((n) => ({ id: n, titulo: n }))}
                itens={lista}
                idDe={(e) => e.clienteId}
                colunaDe={(e) => e.perfil.analista_nome}
                rotuloDe={(e) => e.nome}
                desabilitado={!podeReatribuir}
                onMover={(id, coluna) => reatribuir(id, coluna)}
                render={(e) => (
                  <button type="button" className="flex w-full cursor-pointer flex-col gap-0.5 text-left" onClick={() => setFicha({ id: e.clienteId })}>
                    <span className="flex items-center gap-1.5 text-sm">
                      <span className="size-2 shrink-0 rounded-full" style={{ background: corAudit[e.audit.cor] }} aria-hidden />
                      <span className="truncate">{e.nome}</span>
                    </span>
                    <span className="text-muted-foreground line-clamp-2 text-xs">
                      {rotuloCor[e.audit.cor]} · {e.erp.provedor} · confere {e.perfil.responsavel_nome}
                    </span>
                  </button>
                )}
              />
            </>
          ) : (
            <Caixa className="gap-0 p-0 sm:p-0">
              <ul className="divide-border/70 flex flex-col divide-y" aria-label="Empresas do BPO">
                {lista.map((e) => {
                  const acoes: AcaoMenu[] = [
                    { rotulo: 'Ver a ficha BPO', onSelecionar: () => setFicha({ id: e.clienteId }) },
                    ...(e.perfil.situacao === 'onboarding' || e.perfil.situacao === 'paralelo' ? [{ rotulo: 'Continuar a implantação', onSelecionar: () => setFicha({ id: e.clienteId, secao: 'ciclo' }) }] : []),
                    { rotulo: 'Fornecedores', onSelecionar: () => setFicha({ id: e.clienteId, secao: 'fornecedores' }) },
                    { rotulo: 'Visão da empresa', onSelecionar: () => onEscolher(e.clienteId, 'visao'), separar: true },
                    { rotulo: 'Fila e pedidos', onSelecionar: () => onEscolher(e.clienteId, 'fila') },
                    { rotulo: 'Aprovações', onSelecionar: () => onEscolher(e.clienteId, 'aprovacoes') },
                    ...(permissoes.abas.bpo?.includes('configuracao') ? [{ rotulo: 'Configuração da empresa', onSelecionar: () => onEscolher(e.clienteId, 'configuracao') }] : []),
                  ]
                  return (
                    <li key={e.clienteId} className={cn('flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-5', empresa?.clienteId === e.clienteId && 'bg-raised/50')}>
                      <button type="button" onClick={() => setFicha({ id: e.clienteId })} className="min-w-0 flex-1 basis-64 cursor-pointer text-left" aria-label={`Ver a ficha BPO de ${e.nome}`}>
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
                      <span className="min-w-32 shrink-0 whitespace-nowrap text-right text-sm tabular-nums">
                        {e.bancos.length ? <span className={e.caixa < e.perfil.caixa_minimo ? 'text-destructive-text' : undefined}>{brl(e.caixa)}</span> : <span className="text-muted-foreground text-xs">sem banco</span>}
                        <span className="text-muted-foreground block text-xs">mínimo {brl(e.perfil.caixa_minimo)}</span>
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
                        <BotaoAcoes acoes={acoes} rotulo={`Mais ações de ${e.nome}`} />
                      </span>
                    </li>
                  )
                })}
              </ul>
            </Caixa>
          )}
        </>
      )}
      {encerradas.length > 0 && (
        <Caixa>
          <button type="button" className="text-muted-foreground flex cursor-pointer items-center gap-2 text-sm" onClick={() => setVerEncerradas((v) => !v)} aria-expanded={verEncerradas}>
            <CaretDownIcon className={cn('transition-transform', verEncerradas && 'rotate-180')} /> {encerradas.length} empresa{encerradas.length > 1 ? 's' : ''} com o BPO encerrado
          </button>
          {verEncerradas && (
            <ul className="text-muted-foreground flex flex-col gap-1 text-sm">
              {encerradas.map((e) => (
                <li key={e.clienteId} className="flex flex-wrap items-center gap-2">
                  <span className="flex-1">
                    {e.nome} · encerrado: {e.perfil.encerramento?.motivo}
                  </span>
                  <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setFicha({ id: e.clienteId, secao: 'historico' })}>
                    Histórico
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Caixa>
      )}
      <NovaEmpresaBpo aberta={nova} onFechar={() => setNova(false)} onCriada={(id) => setFicha({ id, secao: 'ciclo' })} />
      {ficha && <FichaEmpresa clienteId={ficha.id} secao={ficha.secao} onFechar={() => setFicha(null)} onIr={onEscolher} />}
    </PaginaBpo>
  )
}

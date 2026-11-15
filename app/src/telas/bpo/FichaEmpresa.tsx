import { ArrowsClockwiseIcon, BankIcon, CheckIcon, PencilSimpleIcon, PlugsConnectedIcon, SignOutIcon, SparkleIcon, WarningIcon } from '@phosphor-icons/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useContas, useLoja, useNavegacao } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import { useAcao, useConfirmar, usePode, Carregando, EstadoErro, SeloDemonstracao } from '@/components/kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Campo, CampoEscolha, CampoTexto, Fichas, GavetaFormulario } from '@/components/ui/formulario'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { destinoConectores } from '@/dados/conectores'
import { cn } from '@/lib/utils'
import { banco } from '@/nucleo/banco'
import type { BpoPerfil, Regime } from '@/nucleo/modelo/entidades'
import { useTabela } from '@/nucleo/react'
import { agora, eventoBpo, repos } from '@/nucleo/repositorios'
import { ErroServico, servicos } from '@/servicos'
import { BancosEmpresa, FornecedoresEmpresa } from './BancosFornecedores'
import { BotaoErp, brl, Propriedade, SeloAudit, SeloErp, TituloBloco } from './comum'
import { agoraBpo, contaAberta, dataCurta, dataHora, hojeBpo, quando, rotuloModoErp, rotuloModoPagamento, rotuloSituacaoPerfil, useEmpresaBpo, type EmpresaVista } from './dados'
import { ImplantacaoBpo, passosImplantacao, SaidaBpo } from './ImplantacaoBpo'
import { textoCaptura, usePedirBpo } from './integrantes'
import { explicarAudit, usePedirS08a } from './integrantes-s08a'
import { extrasS08a, gravarS08a, maisDias, slaPadrao } from './perfil-s08a'

/** Passos da implantação (10, 3.3); a lista mora em `ImplantacaoBpo.tsx` (S08a). */
export const passosOnboarding = passosImplantacao

const provedores = ['Conta Azul', 'Omie', 'Bling', 'Nibo', 'Granatum', 'sem ERP']
const modoDe: Record<string, 'E1' | 'E2' | 'E3'> = { 'Conta Azul': 'E1', Omie: 'E1', Bling: 'E1', Nibo: 'E2', Granatum: 'E2', 'sem ERP': 'E3' }
const conectorDe: Record<string, string | null> = { 'Conta Azul': 'conta_azul', Omie: 'omie', Bling: 'bling' }
const rotinasPadrao: Omit<import('@/nucleo/modelo/entidades').BpoRotina, 'id' | 'escritorio_id' | 'criado_em' | 'atualizado_em' | 'cliente_id'>[] = [
  { cadencia: 'diária', nome: 'Capturar contas (DDA, e-mail, WhatsApp) e checar duplicidade', quando: 'hoje', codigo: 'FIN-003', ativa: true },
  { cadencia: 'diária', nome: 'Montar a fila de pagamento e pedir a aprovação do cliente', quando: 'hoje até 11h', codigo: 'FIN-201', ativa: true },
  { cadencia: 'diária', nome: 'Baixar e conciliar o extrato', quando: 'hoje até 17h', codigo: 'FIN-004', ativa: true },
  { cadencia: 'semanal', nome: 'Agenda de vencimentos e previsão de caixa', quando: 'segunda', codigo: 'FIN-005', ativa: true },
  { cadencia: 'mensal', nome: 'Conciliação final, DRE e relatório ao cliente', quando: 'até dia 5', codigo: 'FIN-006', ativa: true },
  { cadencia: 'mensal', nome: 'Fechamento do mês (entrega à contabilidade)', quando: 'até dia 7', codigo: 'BPO-013', ativa: true },
]

/** As pessoas da equipe que trabalham no BPO (analista e responsável). */
export function useEquipeBpo() {
  const contas = useContas()
  return useMemo(() => contas.filter((u) => u.situacao === 'ativo' && (u.papel === 'administrador' || u.vinculos.some((v) => v.setor === 'bpo_financeiro'))), [contas])
}

/** ERP: sincronizar agora, religar ou pedir nova autorização (S08-A08). Mostra carregando e erro do serviço. */
export function useAcoesErp(e: EmpresaVista | undefined) {
  const loja = useLoja()
  const pedir = usePedirBpo()
  const [estado, setEstado] = useState<{ carregando?: string; erro?: string; demo?: string }>({})
  const sincronizar = async () => {
    if (!e) return
    setEstado({ carregando: `Lendo o ${e.erp.provedor}…` })
    try {
      // Conector do provedor fora do ar (Configurações › Conectores, C9): a leitura falha e a tela mostra o erro.
      if (e.erp.saude && ['fora_do_ar', 'timeout', 'erro_credencial'].includes(e.erp.saude.estado)) {
        await new Promise((r) => setTimeout(r, 700))
        throw new ErroServico(e.erp.provedor, e.erp.saude.estado, e.erp.saude.frase)
      }
      const r = e.erp.modo === 'E2' ? null : await servicos.erp.sincronizar(e.erp.provedor, e.nome)
      const arquivo = e.erp.modo === 'E2' ? await servicos.erp.importarArquivo(e.erp.provedor, `${e.nome}.ofx`) : null
      repos.bpo.conexoes.atualizar(e.erp.id, { ultima_sincronizacao: agoraBpo(), situacao: e.erp.situacao === 'atrasada' ? 'ok' : e.erp.situacao }, { ferramenta: 'erp.sincronizar', texto: `Sincronizou o espelho do ${e.erp.provedor} de ${e.nome}` })
      setEstado({ demo: r?.fonte ?? arquivo?.fonte })
      if (r && r.dados.novas.length)
        pedir({
          integrante: 'i-bpo',
          titulo: `Capturar as contas novas do ${e.erp.provedor}`,
          cliente: e.nome,
          inicio: `Recebi ${r.dados.novas.length} conta${r.dados.novas.length > 1 ? 's' : ''} nova${r.dados.novas.length > 1 ? 's' : ''} do ${e.erp.provedor}. Vou ler, checar duplicidade e o fornecedor.`,
          etapas: ['Lendo as contas novas do espelho', 'Checando duplicidade e o cadastro do fornecedor', 'Deixando em “para conferir”'],
          fim: { texto: textoCaptura(r.dados.novas, e.erp.provedor), aviso: `Contas a Pagar capturou ${r.dados.novas.length} conta${r.dados.novas.length > 1 ? 's' : ''} de ${e.nome}` },
          efeito: { tipo: 'capturar', clienteId: e.clienteId, novas: r.dados.novas },
        })
      else loja.toast(arquivo ? `Arquivo do ${e.erp.provedor} importado: ${arquivo.dados.linhas} linhas, ${arquivo.dados.baixasParaLancar} baixas para lançar à mão` : `${e.erp.provedor} sincronizado: ${r?.dados.lidos ?? 0} registros lidos, nada novo`)
    } catch (err) {
      setEstado({ erro: err instanceof ErroServico ? err.message : `O ${e.erp.provedor} não respondeu.` })
    }
  }
  const pedirAutorizacao = async () => {
    if (!e) return
    setEstado({ carregando: `Gerando o link do ${e.erp.provedor}…` })
    try {
      const r = await servicos.erp.reautorizar(e.erp.provedor, e.nome)
      repos.bpo.fila.criarPedido({ cliente_id: e.clienteId, tipo: 'pendencia', texto: `Autorizar de novo o ${e.erp.provedor}`, codigo: 'BPO-009', canal: 'app', prazo: hojeBpo, bola: 'cliente', responsavel_nome: e.perfil.analista_nome, faltando: [], sla_meta_h: 24, detalhe: `link enviado pelo app (vale até ${dataCurta(r.dados.expira_em)})`, visibilidade: 'compartilhada' }, { ferramenta: 'erp.conectar' })
      loja.avisar({ para: [], tipo: 'cliente', setor: 'bpo_financeiro', titulo: `Pedido de nova autorização do ${e.erp.provedor} enviado`, detalhe: e.nome, destino: { modulo: 'bpo', aba: 'fila', cliente: e.clienteId } })
      setEstado({ demo: r.fonte })
      loja.toast(`Cartão no app de ${e.nome}: autorizar de novo o ${e.erp.provedor}. Fica na Fila com a bola com o cliente.`)
    } catch (err) {
      setEstado({ erro: err instanceof ErroServico ? err.message : 'O link não foi gerado.' })
    }
  }
  return { estado, sincronizar, pedirAutorizacao, limpar: () => setEstado({}) }
}

/** Situação do ERP com as ações; usada na ficha e na Configuração. */
export function BlocoErp({ e, compacto }: { e: EmpresaVista; compacto?: boolean }) {
  const nav = useNavegacao()
  const acoes = useAcoesErp(e)
  const podeConectar = usePode('erp.conectar', { cliente_id: e.clienteId })
  const podeAdmin = usePode('conta.usuario.salvar')
  const pedidoAberto = e.fila.some((f) => f.texto.startsWith('Autorizar de novo'))
  return (
    <div className="flex flex-col gap-2">
      <SeloErp e={e} />
      {!compacto && (
        <dl className="divide-border/70 divide-y">
          <Propriedade rotulo="Modo">{rotuloModoErp[e.erp.modo]}</Propriedade>
          <Propriedade rotulo="Escopo da credencial">{e.erp.escopo}</Propriedade>
          {e.erp.saude && <Propriedade rotulo="Conector (Configurações)">{`${e.erp.saude.nome}: ${e.erp.saude.rotulo.toLowerCase()}`}</Propriedade>}
        </dl>
      )}
      {e.erp.aviso && <p className="text-muted-foreground text-xs">{e.erp.aviso}</p>}
      <div className="flex flex-wrap items-center gap-2">
        {e.erp.modo !== 'E3' && e.erp.efetiva !== 'credencial_vencida' && (
          <Button size="sm" variant="outline" className="rounded-full" disabled={!!acoes.estado.carregando} onClick={() => void acoes.sincronizar()}>
            <ArrowsClockwiseIcon /> {e.erp.efetiva === 'atrasada' ? 'Religar a sincronização' : e.erp.modo === 'E2' ? 'Importar o arquivo do dia' : 'Sincronizar agora'}
          </Button>
        )}
        {e.erp.efetiva === 'credencial_vencida' && podeConectar && (
          <Button size="sm" className="rounded-full" disabled={!!acoes.estado.carregando || pedidoAberto} onClick={() => void acoes.pedirAutorizacao()}>
            <ArrowsClockwiseIcon /> {pedidoAberto ? 'Pedido enviado ao cliente' : 'Pedir nova autorização'}
          </Button>
        )}
        {e.erp.saude && !e.erp.saude.funcionando && podeAdmin && (
          <Button size="sm" variant="ghost" className="rounded-full" onClick={() => nav.irPara(destinoConectores)}>
            <PlugsConnectedIcon /> Ver em Conectores
          </Button>
        )}
        {acoes.estado.demo && <SeloDemonstracao fonte={acoes.estado.demo} />}
      </div>
      {acoes.estado.carregando && <Carregando rotulo={acoes.estado.carregando} linhas={1} />}
      {acoes.estado.erro && <EstadoErro titulo="O ERP não respondeu" descricao={acoes.estado.erro} onTentar={() => void acoes.sincronizar()} />}
    </div>
  )
}

/** Seções da ficha BPO, na ordem em que aparecem (a barra do topo leva a cada uma). */
const secoesFicha = [
  { id: 'resumo', rotulo: 'Resumo' },
  { id: 'ciclo', rotulo: 'Implantação' },
  { id: 'perfil', rotulo: 'Perfil' },
  { id: 'conexoes', rotulo: 'Bancos e ERP' },
  { id: 'fornecedores', rotulo: 'Fornecedores' },
  { id: 'historico', rotulo: 'Histórico' },
] as const

const rotuloEscopo: Record<BpoPerfil['escopo'][number], string> = { pagar: 'contas a pagar', receber: 'contas a receber', conciliacao: 'conciliação', gerencial: 'gerencial' }

/**
 * Ficha BPO da empresa (S08-A06): audit score com motivo (e o integrante que
 * explica), caixa contra o mínimo, pendências, lotes, fila e SLA; a
 * implantação em oito passos com a ação de cada um (A10) ou o encerramento
 * (A11); o perfil BPO inteiro de 10, 3.12 com versões (A09); bancos e ERP
 * (A07, A08); fornecedores confirmados por segundo canal; histórico da empresa.
 */
export function FichaEmpresa({ clienteId, onFechar, onIr, secao }: { clienteId: string; onFechar: () => void; onIr: (id: string | null, aba?: string) => void; secao?: string }) {
  const e = useEmpresaBpo(clienteId)
  const tPerfil = useTabela('bpo_perfil')
  const perfilBruto = tPerfil.find((p) => p.cliente_id === clienteId)
  const executar = useAcao()
  const confirmar = useConfirmar()
  const pedir = usePedirS08a()
  const podeEditar = usePode('bpo.perfil.editar', { cliente_id: clienteId })
  const podeEncerrar = usePode('bpo.encerrar', { cliente_id: clienteId })
  const [editar, setEditar] = useState(false)
  const [conectar, setConectar] = useState<'erp' | 'banco' | null>(null)
  const corpo = useRef<HTMLDivElement>(null)
  const irPara = (id: string) => corpo.current?.querySelector(`[data-secao="${id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  useEffect(() => {
    if (secao) setTimeout(() => irPara(secao), 250)
  }, [secao])
  if (!perfilBruto) return null
  const perfil = perfilBruto
  const nome = e?.nome ?? banco.obter('cliente', clienteId)?.nome ?? clienteId
  const x = extrasS08a(perfil)
  const implantando = perfil.situacao === 'onboarding' || perfil.situacao === 'paralelo'
  const saindo = perfil.situacao === 'encerrando' && !!perfil.encerramento
  const feitos = passosImplantacao.filter((p) => perfil.onboarding[p.id]).length
  const sla = { ...slaPadrao, ...x.sla_termos }

  const encerrar = async () => {
    const motivo = await confirmar({ titulo: `Encerrar o BPO de ${nome}?`, descricao: 'Abre o offboarding (10, 3.14): concluir o mês, pacote de saída, revogar conexões, apagar o espelho e encerrar o serviço. Nada se apaga sem esses passos; a contabilidade, se houver, continua. Dá para desistir até concluir.', acao: 'Abrir o encerramento', perigo: true, exigirMotivo: true, rotuloMotivo: 'Motivo (vai para o evento)' })
    if (typeof motivo !== 'string') return
    executar(() => gravarS08a(perfil.id, (s) => ({ ...s, saida: { ...s.saida, aviso_ate: maisDias(hojeBpo, 30) } }), { situacao: 'encerrando', encerramento: { motivo, pedido_em: agora(), passos: {} } }, { ferramenta: 'bpo.encerrar', texto: `Abriu o encerramento do BPO de ${nome}: ${motivo}` }), { sucesso: 'Encerramento aberto: siga os cinco passos' })
    setTimeout(() => irPara('ciclo'), 250)
  }
  const concluirSaida = () =>
    executar(() => {
      const c = banco.obter('cliente', clienteId)
      if (c) repos.clientes.atualizar(c.id, { servicos_contratados: c.servicos_contratados.filter((s) => s !== 'bpo'), extras: { ...c.extras, servicos_definidos: true } }, { texto: `Serviço BPO de ${c.nome} encerrado (o cadastro continua)` })
      return repos.bpo.perfis.atualizar(perfil.id, { situacao: 'encerrado' }, { ferramenta: 'bpo.encerrar', texto: `BPO de ${nome} encerrado: conexões revogadas, espelho apagado, prova guardada` })
    }, { sucesso: `BPO de ${nome} encerrado` })

  const explicar = () =>
    e &&
    pedir({
      integrante: 'i-bpo-conciliacao',
      titulo: `Explicar a cor de ${nome}`,
      cliente: nome,
      inicio: `Vou olhar os critérios da auditoria de ${nome} e dizer o que pesa e o que eu faria.`,
      etapas: ['Lendo os critérios e os pesos da Configuração', 'Conferindo o ERP, o caixa e as aprovações', 'Separando o que eu faço do que é de vocês'],
      fim: { texto: explicarAudit(e) },
    })

  const secoes = secoesFicha.map((s) => (s.id === 'ciclo' ? { ...s, rotulo: saindo ? 'Encerramento' : 'Implantação' } : s)).filter((s) => s.id !== 'ciclo' || implantando || saindo || feitos > 0)

  return (
    <Sheet open onOpenChange={(v) => !v && onFechar()}>
      <SheetContent className="gap-0 overflow-y-auto sm:max-w-2xl">
        <SheetHeader className="bg-background/95 sticky top-0 z-10 gap-2 px-5 pt-5 pb-3 backdrop-blur">
          <SheetTitle className="pr-8 text-xl font-light">{nome}</SheetTitle>
          <SheetDescription>
            Ficha BPO · {rotuloSituacaoPerfil[perfil.situacao]} · {perfil.analista_nome === perfil.responsavel_nome ? perfil.responsavel_nome : `${perfil.analista_nome} faz, ${perfil.responsavel_nome} confere`}
          </SheetDescription>
          <nav aria-label="Seções da ficha" className="-mx-1 flex gap-1 overflow-x-auto pb-0.5">
            {secoes.map((s) => (
              <button key={s.id} type="button" onClick={() => irPara(s.id)} className="text-muted-foreground hover:text-foreground hover:bg-sunken shrink-0 cursor-pointer rounded-full px-2.5 py-1 text-xs">
                {s.rotulo}
              </button>
            ))}
          </nav>
        </SheetHeader>
        <div ref={corpo} className="flex flex-col gap-6 px-5 pt-3 pb-10">
          {e && (
            <section data-secao="resumo" className="flex scroll-mt-32 flex-col gap-4">
              <div className="flex flex-col gap-2">
                <TituloBloco
                  descricao="Critérios fixos com os pesos da Configuração."
                  acao={
                    <Button size="sm" variant="ghost" className="rounded-full" onClick={explicar}>
                      <SparkleIcon /> Pedir para explicar
                    </Button>
                  }
                >
                  Auditoria
                </TituloBloco>
                <SeloAudit e={e} onIr={(a) => (onFechar(), onIr(clienteId, a))} />
                <ul className="flex flex-col gap-1 text-sm">
                  {e.audit.motivos.length === 0 && <li className="text-muted-foreground">Nenhum critério pesou.</li>}
                  {e.audit.motivos.map((m, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="bg-muted-foreground mt-2 size-1 shrink-0 rounded-full" />
                      <span className="flex-1">{m.texto}</span>
                      <span className="text-muted-foreground shrink-0 text-xs tabular-nums">peso {m.peso}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-2">
                <TituloBloco descricao={`Mínimo combinado ${brl(perfil.caixa_minimo)}.`}>Caixa e pendências</TituloBloco>
                <BarraCaixa caixa={e.caixa} minimo={perfil.caixa_minimo} semBanco={e.bancos.length === 0} />
                <dl className="divide-border/70 divide-y">
                  <Propriedade rotulo="Saldo nos bancos">
                    <span className={e.bancos.length && e.caixa < perfil.caixa_minimo ? 'text-destructive' : e.bancos.length ? undefined : 'text-muted-foreground'}>{e.bancos.length ? brl(e.caixa) : 'nenhum banco conectado'}</span>
                  </Propriedade>
                  <Propriedade rotulo="A pagar em aberto">{`${e.contas.filter(contaAberta).length} contas · ${brl(e.contas.filter(contaAberta).reduce((s, c) => s + c.valor, 0))}`}</Propriedade>
                  <Propriedade rotulo="Lotes com o cliente">{e.lotesAbertos.length ? e.lotesAbertos.map((l) => `${brl(l.total)} (expira ${quando(l.expira_em.slice(0, 10))})`).join(' · ') : 'nenhum'}</Propriedade>
                  <Propriedade rotulo="Fila">{`${e.fila.length} itens · ${e.fila.filter((f) => f.bola === 'bpo').length} conosco · ${e.fila.filter((f) => f.bola === 'cliente').length} com o cliente`}</Propriedade>
                  <Propriedade rotulo="SLA do mês">{`${perfil.sla.mes}% (meta ${perfil.sla.meta}%)`}</Propriedade>
                </dl>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" className="rounded-full" onClick={() => (onFechar(), onIr(clienteId, 'aprovacoes'))}>
                    Aprovações
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-full" onClick={() => (onFechar(), onIr(clienteId, 'fila'))}>
                    Fila
                  </Button>
                  <Button size="sm" variant="ghost" className="rounded-full" onClick={() => (onFechar(), onIr(clienteId, 'visao'))}>
                    Visão da empresa
                  </Button>
                  <BotaoErp e={e} oque={`a empresa ${nome}`} rotulo />
                </div>
              </div>
            </section>
          )}

          {(implantando || saindo || feitos > 0) && (
            <section data-secao="ciclo" className="flex scroll-mt-32 flex-col gap-2">
              {saindo ? (
                <>
                  <TituloBloco descricao={`Motivo: ${perfil.encerramento!.motivo}`}>Encerramento</TituloBloco>
                  <SaidaBpo e={e} perfil={perfil} nome={nome} onConcluir={concluirSaida} />
                </>
              ) : implantando ? (
                <>
                  <TituloBloco descricao={`${feitos} de ${passosImplantacao.length} passos (10, 3.3). Cada passo tem a ação dele; a caixa marca o que foi feito fora da plataforma.`}>Implantação</TituloBloco>
                  <ImplantacaoBpo e={e} perfil={perfil} nome={nome} onConectar={setConectar} onAba={irPara} />
                </>
              ) : (
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-center gap-2 text-sm">
                    <CheckIcon className="text-success size-4" /> Implantação concluída <span className="text-muted-foreground text-xs">· 8 de 8 passos{x.ativado ? ` · ativada por ${x.ativado.por}, ${dataHora(x.ativado.em)}` : ''}</span>
                  </summary>
                  <ul className="text-muted-foreground mt-2 flex flex-col gap-0.5 text-xs">
                    {passosImplantacao.map((p) => (
                      <li key={p.id} className="flex gap-2">
                        <CheckIcon className="text-success mt-0.5 size-3.5 shrink-0" /> {p.rotulo}
                        {x.passos?.[p.id] && ` · ${x.passos[p.id].por}, ${dataHora(x.passos[p.id].em)}`}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </section>
          )}

          <section data-secao="perfil" className="flex scroll-mt-32 flex-col gap-2">
            <TituloBloco
              descricao="Perfil BPO da empresa (10, 3.12), versionado."
              acao={
                podeEditar &&
                perfil.situacao !== 'encerrado' && (
                  <Button size="sm" variant="outline" className="rounded-full" onClick={() => setEditar(true)}>
                    <PencilSimpleIcon /> Editar
                  </Button>
                )
              }
            >
              Perfil BPO
            </TituloBloco>
            <dl className="divide-border/70 divide-y">
              <Propriedade rotulo="Escopo">{perfil.escopo.map((v) => rotuloEscopo[v]).join(', ')}</Propriedade>
              <Propriedade rotulo="Modo de execução">{e ? `${e.erp.provedor} · ${rotuloModoErp[e.erp.modo]}` : 'ERP ainda não conectado'}</Propriedade>
              <Propriedade rotulo="Modo de pagamento">{`${rotuloModoPagamento[perfil.modo_pagamento]}${perfil.modo_pagamento === 'M2' && perfil.teto_m2 ? ` · teto ${brl(perfil.teto_m2)}` : ''}`}</Propriedade>
              <Propriedade rotulo="Alçada">
                {e?.alcada ? `faixa 1 até ${brl(e.alcada.faixa1)} · faixa 2 até ${brl(e.alcada.faixa2)} · aceita por ${e.alcada.aceito_por ?? 'sócio'}` : 'padrão do plano (faixa 1 até R$ 2.000, faixa 2 até R$ 20.000), sem aceite'}
                {e?.proposta && <span className="text-muted-foreground block text-xs">proposta de {e.proposta.proposta_por_nome} aguardando o aceite do sócio no app</span>}
              </Propriedade>
              <Propriedade rotulo="Responsável (confere)">{perfil.responsavel_nome}</Propriedade>
              <Propriedade rotulo="Analista (faz)">{perfil.analista_nome}</Propriedade>
              <Propriedade rotulo="Caixa mínimo">{brl(perfil.caixa_minimo)}</Propriedade>
              <Propriedade rotulo="SLA">{`meta ${perfil.sla.meta}% no prazo · conta capturada em ${sla.captura_h} h · lote ${sla.lote_h_antes} h antes do vencimento · conciliação até o dia ${sla.conciliacao_dia} · relatório até o dia ${sla.relatorio_dia}`}</Propriedade>
              <Propriedade rotulo="Janela do lote">{`${perfil.janela.abertura} · ${perfil.janela.dias}`}</Propriedade>
              <Propriedade rotulo="Termo de dados">{perfil.termo_aceito_em ? `aceito em ${dataCurta(perfil.termo_aceito_em)}/${perfil.termo_aceito_em.slice(0, 4)}${x.termo?.aceito_por ? ` por ${x.termo.aceito_por}` : ''}` : x.termo ? 'enviado, aguardando o aceite' : 'pendente'}</Propriedade>
              <Propriedade rotulo="Paralelo até">{perfil.paralelo_ate ? dataCurta(perfil.paralelo_ate) : 'fora do paralelo'}</Propriedade>
              <Propriedade rotulo="Bancos">{e?.bancos.map((b) => b.nome).join(', ') || 'nenhum conectado'}</Propriedade>
            </dl>
            <p className="text-muted-foreground text-xs">Modo de pagamento, alçadas e janela mudam na aba Configuração e só valem com o aceite do sócio no app.</p>
            {(x.versoes?.length ?? 0) > 0 && (
              <details className="text-sm">
                <summary className="text-muted-foreground cursor-pointer text-xs">Versões do perfil ({x.versoes!.length + 1})</summary>
                <ol className="mt-2 flex flex-col gap-1 text-xs" aria-label="Versões do perfil">
                  {[...x.versoes!].reverse().map((v) => (
                    <li key={v.versao} className="flex gap-2">
                      <span className="text-muted-foreground w-8 shrink-0 tabular-nums">v{v.versao + 1}</span>
                      <span className="flex-1">{v.resumo}</span>
                      <span className="text-muted-foreground shrink-0">
                        {v.por} · {dataHora(v.em)}
                      </span>
                    </li>
                  ))}
                  <li className="text-muted-foreground flex gap-2">
                    <span className="w-8 shrink-0 tabular-nums">v1</span> perfil criado na implantação
                  </li>
                </ol>
              </details>
            )}
          </section>

          {e && (
            <section data-secao="conexoes" className="flex scroll-mt-32 flex-col gap-4">
              <div className="flex flex-col gap-2">
                <TituloBloco descricao="Espelho do ERP que o cliente já usa (10, 3.0).">ERP e sincronização</TituloBloco>
                <BlocoErp e={e} />
              </div>
              <div className="flex flex-col gap-2">
                <TituloBloco descricao="Só leitura de extrato e saldo; consentimento renovado 30 dias antes de vencer.">Bancos</TituloBloco>
                <BancosEmpresa e={e} onConectar={() => setConectar('banco')} />
              </div>
            </section>
          )}

          {e && (
            <section data-secao="fornecedores" className="flex scroll-mt-32 flex-col gap-2">
              <TituloBloco descricao="Dados bancários só valem confirmados por segundo canal, por uma pessoa.">Fornecedores</TituloBloco>
              <FornecedoresEmpresa e={e} />
            </section>
          )}

          <section data-secao="historico" className="flex scroll-mt-32 flex-col gap-2">
            <TituloBloco descricao="Tudo o que aconteceu no BPO desta empresa, de quem fez. Nada se apaga.">Histórico</TituloBloco>
            <HistoricoEmpresa clienteId={clienteId} />
          </section>

          {podeEncerrar && perfil.situacao !== 'encerrando' && perfil.situacao !== 'encerrado' && (
            <Button size="sm" variant="ghost" className="text-destructive w-fit rounded-full" onClick={() => void encerrar()}>
              <SignOutIcon /> Encerrar o BPO desta empresa
            </Button>
          )}
        </div>
        {editar && <EditarPerfil perfil={perfil} nome={nome} onFechar={() => setEditar(false)} />}
        {conectar && <ConectarGaveta tipo={conectar} perfil={perfil} nome={nome} onFechar={() => setConectar(null)} />}
      </SheetContent>
    </Sheet>
  )
}

/** Caixa contra o mínimo combinado, numa barra (cor com texto, nunca só cor). */
export function BarraCaixa({ caixa, minimo, semBanco, compacta }: { caixa: number; minimo: number; semBanco?: boolean; compacta?: boolean }) {
  if (semBanco) return <span className="text-muted-foreground text-xs">sem banco conectado</span>
  const teto = Math.max(caixa, minimo * 2, 1)
  const abaixo = caixa < minimo
  return (
    <div className={cn('flex flex-col gap-1', compacta && 'gap-0.5')}>
      <div className="bg-sunken relative h-2 overflow-hidden rounded-full" role="img" aria-label={`Caixa ${brl(caixa)}, mínimo ${brl(minimo)}${abaixo ? ', abaixo do mínimo' : ''}`}>
        <div className="h-full rounded-full" style={{ width: `${Math.min(100, (caixa / teto) * 100)}%`, background: abaixo ? 'var(--destructive)' : 'var(--success)' }} />
        <div className="bg-foreground/60 absolute top-0 h-full w-0.5" style={{ left: `${(minimo / teto) * 100}%` }} />
      </div>
      {!compacta && (
        <span className="text-muted-foreground text-xs">
          {abaixo ? `${brl(minimo - caixa)} abaixo do mínimo` : `${brl(caixa - minimo)} acima do mínimo`}
        </span>
      )}
    </div>
  )
}

const ferramentasBpo = /^(bpo\.|erp\.|banco\.|fornecedor\.|conta_pagar\.|conta_receber\.|pagamento|alcada\.|fila\.|rotina\.|conciliacao\.)/

/** Histórico do BPO de uma empresa: os eventos (imutáveis) com quem fez e quando. */
export function HistoricoEmpresa({ clienteId }: { clienteId: string }) {
  const tEvento = useTabela('evento')
  const [todos, setTodos] = useState(false)
  const lista = useMemo(() => tEvento.filter((ev) => ev.cliente_id === clienteId && (ev.setor_id === 'bpo_financeiro' || ferramentasBpo.test(ev.ferramenta)) && ev.texto).sort((a, b) => b.criado_em.localeCompare(a.criado_em)), [tEvento, clienteId])
  if (!lista.length) return <p className="text-muted-foreground text-sm">Nada registrado ainda.</p>
  const visiveis = todos ? lista : lista.slice(0, 8)
  return (
    <>
      <ol className="flex flex-col gap-1.5 text-sm" aria-label="Histórico da empresa">
        {visiveis.map((ev) => (
          <li key={ev.id} className="flex gap-3">
            <span className="text-muted-foreground w-24 shrink-0 text-xs tabular-nums">{dataHora(ev.criado_em)}</span>
            <span className="min-w-0 flex-1">
              {ev.texto}
              {ev.ator_nome && <span className="text-muted-foreground"> · {ev.ator_nome}</span>}
            </span>
          </li>
        ))}
      </ol>
      {lista.length > visiveis.length && (
        <Button size="sm" variant="ghost" className="w-fit rounded-full" onClick={() => setTodos(true)}>
          Ver tudo ({lista.length})
        </Button>
      )}
    </>
  )
}

/** Editar perfil BPO da empresa (S08-A09): escopo, responsável, analista, caixa mínimo, SLA e prazos, paralelo; cada salvar vira uma versão. */
function EditarPerfil({ perfil, nome, onFechar }: { perfil: BpoPerfil; nome: string; onFechar: () => void }) {
  const equipe = useEquipeBpo()
  const executar = useAcao()
  const { usuario } = useSessao()
  const sla0 = { ...slaPadrao, ...extrasS08a(perfil).sla_termos }
  const [r, setR] = useState({ escopo: perfil.escopo, responsavel: perfil.responsavel_nome, analista: perfil.analista_nome, caixa: String(perfil.caixa_minimo), meta: String(perfil.sla.meta), paralelo: perfil.paralelo_ate ?? '', captura: String(sla0.captura_h), lote: String(sla0.lote_h_antes), conciliacao: String(sla0.conciliacao_dia), relatorio: String(sla0.relatorio_dia) })
  const erroCaixa = !(Number(r.caixa) >= 0) || r.caixa === '' ? 'Informe um valor (0 ou mais).' : undefined
  const erroMeta = !(Number(r.meta) > 0 && Number(r.meta) <= 100) ? 'Entre 1 e 100.' : undefined
  const erroHoras = !(Number(r.captura) > 0) || !(Number(r.lote) > 0) ? 'Horas maiores que zero.' : undefined
  const erroDias = !(Number(r.conciliacao) >= 1 && Number(r.conciliacao) <= 28) || !(Number(r.relatorio) >= 1 && Number(r.relatorio) <= 28) ? 'Dia entre 1 e 28.' : undefined
  const erroEscopo = r.escopo.length === 0 ? 'Escolha ao menos um serviço.' : undefined
  return (
    <GavetaFormulario
      aberta
      onFechar={onFechar}
      titulo={`Perfil BPO · ${nome}`}
      descricao="Modo de pagamento e alçadas ficam na Configuração (valem com o aceite do sócio). Cada salvar guarda a versão anterior."
      acao="Salvar"
      largura="lg"
      acaoDesabilitada={!!erroCaixa || !!erroMeta || !!erroHoras || !!erroDias || !!erroEscopo}
      onAcao={() => {
        const mudou: string[] = []
        if (r.escopo.join() !== perfil.escopo.join()) mudou.push(`escopo: ${r.escopo.map((v) => rotuloEscopo[v]).join(', ')}`)
        if (r.responsavel !== perfil.responsavel_nome) mudou.push(`responsável: ${r.responsavel}`)
        if (r.analista !== perfil.analista_nome) mudou.push(`analista: ${r.analista}`)
        if (Number(r.caixa) !== perfil.caixa_minimo) mudou.push(`caixa mínimo: ${brl(Number(r.caixa))}`)
        if (Number(r.meta) !== perfil.sla.meta) mudou.push(`meta de SLA: ${r.meta}%`)
        if (Number(r.captura) !== sla0.captura_h || Number(r.lote) !== sla0.lote_h_antes || Number(r.conciliacao) !== sla0.conciliacao_dia || Number(r.relatorio) !== sla0.relatorio_dia) mudou.push('prazos do SLA')
        if ((r.paralelo || null) !== (perfil.paralelo_ate ?? null)) mudou.push(r.paralelo ? `paralelo até ${dataCurta(r.paralelo)}` : 'fora do paralelo')
        if (!mudou.length) return onFechar()
        const ok = executar(
          () =>
            gravarS08a(
              perfil.id,
              (s) => ({ ...s, sla_termos: { captura_h: Number(r.captura), lote_h_antes: Number(r.lote), conciliacao_dia: Number(r.conciliacao), relatorio_dia: Number(r.relatorio) }, versoes: [...(s.versoes ?? []), { versao: (s.versoes?.length ?? 0) + 1, em: agoraBpo(), por: usuario.nome, resumo: mudou.join('; ') }] }),
              { escopo: r.escopo, responsavel_nome: r.responsavel, analista_nome: r.analista, caixa_minimo: Number(r.caixa), sla: { ...perfil.sla, meta: Number(r.meta) }, paralelo_ate: r.paralelo || null },
              { texto: `Atualizou o perfil BPO de ${nome}: ${mudou.join('; ')}` },
            ),
          { sucesso: 'Perfil BPO salvo' },
        )
        if (ok) onFechar()
      }}
    >
      <Campo rotulo="Escopo do serviço" erro={erroEscopo}>
        {() => (
          <Fichas
            rotulo="Escopo"
            valores={r.escopo}
            onMudar={(v) => setR((s) => ({ ...s, escopo: v }))}
            opcoes={[
              { valor: 'pagar', rotulo: 'Contas a pagar' },
              { valor: 'receber', rotulo: 'Contas a receber' },
              { valor: 'conciliacao', rotulo: 'Conciliação' },
              { valor: 'gerencial', rotulo: 'Gerencial' },
            ]}
          />
        )}
      </Campo>
      <div className="grid gap-x-3 sm:grid-cols-2">
        <Campo rotulo="Responsável (confere)">{(id) => <CampoEscolha id={id} valor={r.responsavel} onMudar={(v) => setR((s) => ({ ...s, responsavel: v }))} opcoes={equipe.map((u) => ({ valor: u.nome, rotulo: u.nome }))} />}</Campo>
        <Campo rotulo="Analista (faz)" ajuda="Igual ao responsável = BPO de uma pessoa: a conferência vai ao Gestor ou ao cliente.">
          {(id) => <CampoEscolha id={id} valor={r.analista} onMudar={(v) => setR((s) => ({ ...s, analista: v }))} opcoes={equipe.map((u) => ({ valor: u.nome, rotulo: u.nome }))} />}
        </Campo>
        <Campo rotulo="Caixa mínimo (R$)" erro={erroCaixa}>
          {(id) => <CampoTexto id={id} tipo="number" valor={r.caixa} onMudar={(v) => setR((s) => ({ ...s, caixa: v }))} />}
        </Campo>
        <Campo rotulo="Meta de SLA (% no prazo)" erro={erroMeta}>
          {(id) => <CampoTexto id={id} tipo="number" valor={r.meta} onMudar={(v) => setR((s) => ({ ...s, meta: v }))} />}
        </Campo>
        <Campo rotulo="Conta capturada em até (horas)" erro={erroHoras}>
          {(id) => <CampoTexto id={id} tipo="number" valor={r.captura} onMudar={(v) => setR((s) => ({ ...s, captura: v }))} />}
        </Campo>
        <Campo rotulo="Lote enviado antes do vencimento (horas)">{(id) => <CampoTexto id={id} tipo="number" valor={r.lote} onMudar={(v) => setR((s) => ({ ...s, lote: v }))} />}</Campo>
        <Campo rotulo="Conciliação até o dia" erro={erroDias}>
          {(id) => <CampoTexto id={id} tipo="number" valor={r.conciliacao} onMudar={(v) => setR((s) => ({ ...s, conciliacao: v }))} />}
        </Campo>
        <Campo rotulo="Relatório até o dia">{(id) => <CampoTexto id={id} tipo="number" valor={r.relatorio} onMudar={(v) => setR((s) => ({ ...s, relatorio: v }))} />}</Campo>
      </div>
      <Campo rotulo="Paralelo até" ajuda="Vazio: fora do paralelo. O relógio do SLA pausa com o cliente e volta na resposta.">
        {(id) => <CampoTexto id={id} tipo="date" valor={r.paralelo} onMudar={(v) => setR((s) => ({ ...s, paralelo: v }))} />}
      </Campo>
    </GavetaFormulario>
  )
}

/** Conectar ERP ou banco durante a implantação (Open Finance com o consentimento do cliente; ERP com a credencial dele). */
export function ConectarGaveta({ tipo, perfil, nome, onFechar }: { tipo: 'erp' | 'banco'; perfil: BpoPerfil; nome: string; onFechar: () => void }) {
  const loja = useLoja()
  const [provedor, setProvedor] = useState('Conta Azul')
  const [instituicao, setInstituicao] = useState('Itaú')
  const [estado, setEstado] = useState<{ carregando?: boolean; erro?: string; fonte?: string }>({})
  const executar = useAcao()
  const conectar = async () => {
    setEstado({ carregando: true })
    try {
      if (tipo === 'banco') {
        const r = await servicos.openFinance.conectar(instituicao, banco.obter('cliente', perfil.cliente_id)?.documento ?? '')
        const [d, m, a] = r.dados.expira_em.split('/')
        repos.bpo.bancos.criar({ cliente_id: perfil.cliente_id, nome: `${instituicao} (movimento)`, saldo: 0, saldo_em: agoraBpo(), via: 'open_finance', consentimento_ate: a ? `${a}-${m}-${d}` : null }, { texto: `Conectou ${instituicao} de ${nome} por Open Finance (consentimento do cliente)` })
        setEstado({ fonte: r.fonte })
      } else {
        const modo = modoDe[provedor]
        const atual = banco.ler('bpo_conexao_erp').find((x) => x.cliente_id === perfil.cliente_id)
        const linha = { provedor, modo, escopo: modo === 'E1' ? 'contas a pagar e a receber (leitura e escrita)' : modo === 'E2' ? 'exportação OFX e CSV' : 'livro próprio na plataforma', situacao: modo === 'E1' ? ('ok' as const) : modo === 'E2' ? ('arquivo' as const) : ('livro_proprio' as const), ultima_sincronizacao: agoraBpo(), conector_id: conectorDe[provedor] ?? null }
        if (modo === 'E1') await servicos.erp.sincronizar(provedor, nome)
        if (atual) repos.bpo.conexoes.atualizar(atual.id, linha, { texto: `Conectou o ${provedor} de ${nome}` })
        else repos.bpo.conexoes.criar({ cliente_id: perfil.cliente_id, ...linha }, { texto: `Conectou o ${provedor} de ${nome}` })
      }
      executar(() => repos.bpo.perfis.atualizar(perfil.id, { onboarding: { ...perfil.onboarding, [tipo === 'banco' ? 'bancos' : 'erp']: true } }, { ferramenta: 'bpo.onboarding' }))
      loja.toast(tipo === 'banco' ? `${instituicao} conectado por Open Finance (demonstração)` : provedor === 'sem ERP' ? 'Livro próprio ligado: a empresa não tem ERP' : `${provedor} conectado (demonstração)`)
      onFechar()
    } catch (err) {
      setEstado({ erro: err instanceof Error ? err.message : String(err) })
    }
  }
  return (
    <GavetaFormulario aberta onFechar={onFechar} titulo={tipo === 'banco' ? 'Conectar banco por Open Finance' : 'Conectar o ERP do cliente'} descricao={tipo === 'banco' ? 'O cliente autoriza no banco dele; só leitura de extrato e saldo.' : 'Conta Azul, Omie e Bling por API; Nibo e Granatum por arquivo; sem ERP, livro próprio.'} acao={estado.carregando ? 'Conectando…' : 'Conectar'} acaoDesabilitada={!!estado.carregando} onAcao={() => void conectar()}>
      {tipo === 'banco' ? (
        <Campo rotulo="Banco">{(id) => <CampoEscolha id={id} valor={instituicao} onMudar={setInstituicao} opcoes={['Itaú', 'Bradesco', 'Banco do Brasil', 'Santander', 'Sicoob', 'Nubank PJ', 'Inter'].map((x) => ({ valor: x, rotulo: x }))} />}</Campo>
      ) : (
        <Campo rotulo="Sistema" ajuda={rotuloModoErp[modoDe[provedor]]}>
          {(id) => <CampoEscolha id={id} valor={provedor} onMudar={setProvedor} opcoes={provedores.map((p) => ({ valor: p, rotulo: p }))} />}
        </Campo>
      )}
      {estado.carregando && <Carregando rotulo="Esperando o retorno do serviço" linhas={1} />}
      {estado.erro && <EstadoErro descricao={estado.erro} onTentar={() => void conectar()} />}
      <p className="text-muted-foreground flex items-start gap-2 text-xs">
        <WarningIcon className="mt-0.5 size-4 shrink-0" /> Demonstração: nenhuma conexão real sai do navegador. No produto a credencial fica no cofre do escritório, por titular empresa.
      </p>
    </GavetaFormulario>
  )
}

/** Pôr uma empresa no BPO (S08-A10, primeiro passo): cliente do cadastro, ou um novo (o mesmo cadastro, sem duplicar). */
export function NovaEmpresaBpo({ aberta, onFechar, onCriada, inicial }: { aberta: boolean; onFechar: () => void; onCriada?: (clienteId: string) => void; /** S08a: cliente já escolhido (vindo de Clientes). */ inicial?: string }) {
  const tCliente = useTabela('cliente')
  const tPerfil = useTabela('bpo_perfil')
  const equipe = useEquipeBpo()
  const executar = useAcao()
  const candidatos = tCliente.filter((c) => !c.arquivado_em && !tPerfil.some((p) => p.cliente_id === c.id && p.situacao !== 'encerrado'))
  const [r, setR] = useState({ cliente: '', nome: '', documento: '', analista: '', responsavel: '', modo: 'M1' as BpoPerfil['modo_pagamento'] })
  useEffect(() => {
    if (aberta && inicial) setR((x) => ({ ...x, cliente: inicial }))
  }, [aberta, inicial])
  const novo = r.cliente === '' || r.cliente === '_novo'
  const erroNome = novo && !r.nome.trim() ? 'Informe a razão social.' : undefined
  const doc = r.documento.replace(/\D/g, '')
  const duplicado = novo && doc.length >= 11 ? tCliente.find((c) => c.documento.replace(/\D/g, '') === doc) : undefined
  const erroDoc = novo && !r.documento.trim() ? 'Informe o CNPJ.' : novo && doc.length !== 14 && doc.length !== 11 ? 'CNPJ com 14 dígitos (ou CPF com 11).' : duplicado ? `Já cadastrado: ${duplicado.codigo} · ${duplicado.nome}. Escolha na lista acima (o cadastro é um só).` : undefined
  const analista = r.analista || equipe.find((u) => u.papel !== 'administrador')?.nome || equipe[0]?.nome || ''
  const responsavel = r.responsavel || equipe.find((u) => u.vinculos.some((v) => v.setor === 'bpo_financeiro' && v.modo === 'gestao'))?.nome || equipe[0]?.nome || ''
  return (
    <GavetaFormulario
      aberta={aberta}
      onFechar={onFechar}
      titulo="Pôr empresa no BPO"
      descricao="Ativa o serviço BPO com perfil próprio. A empresa já pode ser cliente (o mesmo cadastro) ou entrar agora."
      acao="Começar a implantação"
      acaoDesabilitada={!!erroNome || !!erroDoc || !analista}
      onAcao={() => {
        const id = executar(() => {
          let clienteId = r.cliente
          if (novo) {
            const c = repos.clientes.criar({ tipo: 'pj', codigo: String(800 + tCliente.length), documento: r.documento.trim(), nome: r.nome.trim(), estado_ciclo: 'em_implantacao', estado_ciclo_desde: hojeBpo, regime: 'simples' as Regime, servicos_contratados: ['bpo'], extras: { servicos_definidos: true } }, { texto: `Cadastrou ${r.nome.trim()} para o BPO` })
            clienteId = c.id
          } else {
            const c = banco.obter('cliente', clienteId)!
            if (!c.servicos_contratados.includes('bpo')) repos.clientes.atualizar(c.id, { servicos_contratados: [...c.servicos_contratados, 'bpo'], extras: { ...c.extras, servicos_definidos: true } }, { texto: `${c.nome} contratou o BPO financeiro` })
          }
          const antigo = banco.ler('bpo_perfil').find((p) => p.cliente_id === clienteId)
          const perfil: Omit<BpoPerfil, 'id' | 'escritorio_id' | 'criado_em' | 'atualizado_em'> = {
            cliente_id: clienteId,
            situacao: 'onboarding',
            escopo: ['pagar', 'conciliacao', 'gerencial'],
            modo_pagamento: r.modo,
            responsavel_nome: responsavel,
            analista_nome: analista,
            caixa_minimo: 10_000,
            onboarding: {},
            janela: { abertura: '09:00', dias: 'seg a sex, 9h às 17h' },
            escalonamento: { aprovador: '', socio: '', lembrete_h: 4, substituto_h: 8 },
            sla: { meta: 95, mes: 100, desvios: [] },
            volume: { lancamentos: 0, conciliacoes: 0, pagamentos: 0, contas: 0, faixa: 'em implantação (não conta)', limite: 300 },
            honorario: 0,
            horas_mes: 0,
            fluxo: { entradas: [0, 0, 0, 0, 0, 0], saidas: [0, 0, 0, 0, 0, 0] },
          }
          if (antigo) repos.bpo.perfis.atualizar(antigo.id, { ...perfil, encerramento: null }, { ferramenta: 'bpo.onboarding', texto: 'Reabriu o BPO da empresa (nova implantação)' })
          else repos.bpo.perfis.criar(perfil, { texto: `Começou a implantação do BPO de ${banco.obter('cliente', clienteId)?.nome}` })
          if (!banco.ler('bpo_rotina').some((x) => x.cliente_id === clienteId)) for (const rt of rotinasPadrao) repos.bpo.rotinas.criar({ ...rt, cliente_id: clienteId }, { ferramenta: 'bpo.onboarding' })
          eventoBpo(banco, `Implantação do BPO aberta (${passosOnboarding.length} passos)`, clienteId, 'bpo.onboarding')
          return clienteId
        }, { sucesso: 'Implantação aberta: siga os oito passos na ficha' })
        if (id) {
          onFechar()
          setR({ cliente: '', nome: '', documento: '', analista: '', responsavel: '', modo: 'M1' })
          onCriada?.(id)
        }
      }}
    >
      <Campo rotulo="Empresa">
        {(id) => <CampoEscolha id={id} valor={r.cliente || '_novo'} onMudar={(v) => setR((x) => ({ ...x, cliente: v }))} opcoes={[{ valor: '_novo', rotulo: 'Cliente novo (cadastrar agora)' }, ...candidatos.map((c) => ({ valor: c.id, rotulo: `${c.codigo} · ${c.nome}` }))]} />}
      </Campo>
      {novo && (
        <>
          <Campo rotulo="Razão social" erro={erroNome}>
            {(id) => <CampoTexto id={id} valor={r.nome} onMudar={(v) => setR((x) => ({ ...x, nome: v }))} />}
          </Campo>
          <Campo rotulo="CNPJ" erro={erroDoc}>
            {(id) => <CampoTexto id={id} mono valor={r.documento} onMudar={(v) => setR((x) => ({ ...x, documento: v }))} />}
          </Campo>
        </>
      )}
      <Campo rotulo="Analista (faz)">{(id) => <CampoEscolha id={id} valor={analista} onMudar={(v) => setR((x) => ({ ...x, analista: v }))} opcoes={equipe.map((u) => ({ valor: u.nome, rotulo: u.nome }))} />}</Campo>
      <Campo rotulo="Responsável (confere)">{(id) => <CampoEscolha id={id} valor={responsavel} onMudar={(v) => setR((x) => ({ ...x, responsavel: v }))} opcoes={equipe.map((u) => ({ valor: u.nome, rotulo: u.nome }))} />}</Campo>
      <Campo rotulo="Modo de pagamento" ajuda="Em todos os modos o cliente aprova antes. M3 está desligado na primeira versão.">
        {(id) => (
          <CampoEscolha
            id={id}
            valor={r.modo}
            onMudar={(v) => setR((x) => ({ ...x, modo: v }))}
            opcoes={[
              { valor: 'M1', rotulo: rotuloModoPagamento.M1 },
              { valor: 'M2', rotulo: rotuloModoPagamento.M2 },
            ]}
          />
        )}
      </Campo>
      <ul className="text-muted-foreground flex flex-col gap-1 text-xs">
        {passosOnboarding.map((p, i) => (
          <li key={p.id} className="flex gap-2">
            <CheckIcon className="mt-0.5 size-3.5 shrink-0" /> {i + 1}. {p.rotulo}: {p.detalhe}
          </li>
        ))}
      </ul>
      <Badge variant="outline" className="w-fit">
        <BankIcon /> Bancos e ERP conectam na ficha, durante a implantação
      </Badge>
    </GavetaFormulario>
  )
}

export { dataHora }

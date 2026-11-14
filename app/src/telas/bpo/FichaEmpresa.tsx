import { ArrowsClockwiseIcon, BankIcon, CheckIcon, PencilSimpleIcon, PlugsConnectedIcon, SignOutIcon, WarningIcon } from '@phosphor-icons/react'
import { useMemo, useState } from 'react'
import { useContas, useLoja, useNavegacao } from '@/ambiente/loja'
import { useAcao, useConfirmar, usePode, Carregando, EstadoErro, SeloDemonstracao } from '@/components/kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Campo, CampoEscolha, CampoTexto, Fichas, GavetaFormulario, Passos } from '@/components/ui/formulario'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { destinoConectores } from '@/dados/conectores'
import { cn } from '@/lib/utils'
import { banco } from '@/nucleo/banco'
import type { BpoPerfil, Regime } from '@/nucleo/modelo/entidades'
import { useTabela } from '@/nucleo/react'
import { agora, eventoBpo, repos } from '@/nucleo/repositorios'
import { ErroServico, servicos } from '@/servicos'
import { brl, Propriedade, SeloAudit, SeloErp, TituloBloco } from './comum'
import { agoraBpo, contaAberta, dataCurta, dataHora, hojeBpo, quando, rotuloModoErp, rotuloModoPagamento, rotuloSituacaoPerfil, useEmpresaBpo, type EmpresaVista } from './dados'
import { textoCaptura, usePedirBpo } from './integrantes'

/** Passos da implantação da empresa no BPO (10, 3.3). */
export const passosOnboarding: { id: string; rotulo: string; detalhe: string }[] = [
  { id: 'contrato', rotulo: 'Contrato', detalhe: 'Item BPO no contrato único, faixa de volume e alçadas assinadas (FIN-001)' },
  { id: 'termo', rotulo: 'Termo de dados', detalhe: 'O BPO é operador da empresa (GES-054)' },
  { id: 'convite_app', rotulo: 'Convite no app', detalhe: 'Sócio e financeiro com a alçada de pagamento' },
  { id: 'bancos', rotulo: 'Bancos', detalhe: 'Conexão por Open Finance, com o consentimento do cliente (CTB-010)' },
  { id: 'erp', rotulo: 'ERP', detalhe: 'Conectar o ERP do cliente (credencial no cofre) ou importar por arquivo; 90 dias de extrato' },
  { id: 'fornecedores', rotulo: 'Fornecedores', detalhe: 'Recorrentes com dados bancários confirmados por segundo canal' },
  { id: 'paralelo', rotulo: 'Paralelo', detalhe: 'Um mês em paralelo: o BPO prepara, o cliente ainda paga' },
  { id: 'ativar', rotulo: 'Ativar', detalhe: 'O Gestor ativa o serviço; evento e prova' },
]

const passosSaida: { id: string; rotulo: string }[] = [
  { id: 'mes', rotulo: 'Concluir o mês (conciliação e relatório)' },
  { id: 'pacote', rotulo: 'Pacote de saída com manifesto entregue ao cliente' },
  { id: 'revogar', rotulo: 'Revogar as conexões (banco e ERP) em um passo' },
  { id: 'espelho', rotulo: 'Apagar o espelho do ERP e guardar a prova de exclusão' },
  { id: 'servico', rotulo: 'Encerrar o serviço BPO (a contabilidade, se houver, continua)' },
]

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

/**
 * Ficha BPO da empresa (S08-A06): audit score com motivo, saldo, pendências,
 * ERP e sincronização, caixa contra o mínimo, lotes com o cliente, fila e SLA;
 * editar o perfil (A09), a implantação em passos (A10) e o encerramento (A11).
 */
export function FichaEmpresa({ clienteId, onFechar, onIr }: { clienteId: string; onFechar: () => void; onIr: (id: string | null, aba?: string) => void }) {
  const e = useEmpresaBpo(clienteId)
  const tPerfil = useTabela('bpo_perfil')
  const perfilBruto = tPerfil.find((p) => p.cliente_id === clienteId)
  const executar = useAcao()
  const confirmar = useConfirmar()
  const loja = useLoja()
  const podeEditar = usePode('bpo.perfil.editar', { cliente_id: clienteId })
  const podeOnboarding = usePode('bpo.onboarding', { cliente_id: clienteId })
  const podeEncerrar = usePode('bpo.encerrar', { cliente_id: clienteId })
  const [editar, setEditar] = useState(false)
  const [conectar, setConectar] = useState<'erp' | 'banco' | null>(null)
  if (!perfilBruto) return null
  const perfil = perfilBruto
  const nome = e?.nome ?? banco.obter('cliente', clienteId)?.nome ?? clienteId
  const feitos = passosOnboarding.filter((p) => perfil.onboarding[p.id]).length
  const implantando = perfil.situacao === 'onboarding' || perfil.situacao === 'paralelo'

  const marcarPasso = (id: string, valor: boolean) => {
    if (id === 'ativar' && valor && passosOnboarding.slice(0, 7).some((p) => !perfil.onboarding[p.id])) return loja.toastErro('Ative só depois dos sete passos anteriores (o paralelo inclusive).')
    if (id === 'bancos' && valor && !(e?.bancos.length ?? 0)) return setConectar('banco')
    if (id === 'erp' && valor && (!e || e.erp.efetiva === 'desconectada')) return setConectar('erp')
    const onboarding = { ...perfil.onboarding, [id]: valor }
    const extra: Partial<BpoPerfil> = id === 'paralelo' && valor ? { situacao: 'paralelo', paralelo_ate: '2026-12-18' } : id === 'ativar' && valor ? { situacao: 'ativo', paralelo_ate: null } : {}
    executar(() => repos.bpo.perfis.atualizar(perfil.id, { onboarding, ...extra }, { ferramenta: 'bpo.onboarding', texto: `${valor ? 'Concluiu' : 'Reabriu'} o passo “${passosOnboarding.find((p) => p.id === id)?.rotulo}” da implantação de ${nome}` }), {
      sucesso: id === 'ativar' && valor ? `${nome}: serviço BPO ativado` : undefined,
    })
  }

  const encerrar = async () => {
    const motivo = await confirmar({ titulo: `Encerrar o BPO de ${nome}?`, descricao: 'Abre o offboarding (10, 3.14): concluir o mês, pacote de saída, revogar conexões, apagar o espelho e encerrar o serviço. Nada se apaga sem esses passos; a contabilidade, se houver, continua.', acao: 'Abrir o encerramento', perigo: true, exigirMotivo: true, rotuloMotivo: 'Motivo (vai para o evento)' })
    if (typeof motivo !== 'string') return
    executar(() => repos.bpo.perfis.atualizar(perfil.id, { situacao: 'encerrando', encerramento: { motivo, pedido_em: agora(), passos: {} } }, { ferramenta: 'bpo.encerrar', texto: `Abriu o encerramento do BPO de ${nome}: ${motivo}` }), { sucesso: 'Encerramento aberto: siga os cinco passos' })
  }
  const passoSaida = (id: string, v: boolean) => executar(() => repos.bpo.perfis.atualizar(perfil.id, { encerramento: { ...perfil.encerramento!, passos: { ...perfil.encerramento!.passos, [id]: v } } }, { ferramenta: 'bpo.encerrar', texto: `${passosSaida.find((p) => p.id === id)?.rotulo}: ${v ? 'feito' : 'reaberto'}` }))
  const concluirSaida = () =>
    executar(() => {
      banco.transacao((tx) => {
        for (const b of banco.ler('bpo_conta_bancaria').filter((x) => x.cliente_id === clienteId)) tx.gravar('bpo_conta_bancaria', { ...b, arquivado_em: agora(), atualizado_em: agora() })
        const x = banco.ler('bpo_conexao_erp').find((c) => c.cliente_id === clienteId)
        if (x) tx.gravar('bpo_conexao_erp', { ...x, situacao: 'desconectada', escopo: 'revogada no encerramento', atualizado_em: agora() })
      })
      const c = banco.obter('cliente', clienteId)
      if (c) repos.clientes.atualizar(c.id, { servicos_contratados: c.servicos_contratados.filter((s) => s !== 'bpo'), extras: { ...c.extras, servicos_definidos: true } }, { texto: `Serviço BPO de ${c.nome} encerrado (o cadastro continua)` })
      return repos.bpo.perfis.atualizar(perfil.id, { situacao: 'encerrado' }, { ferramenta: 'bpo.encerrar', texto: `BPO de ${nome} encerrado: conexões revogadas, espelho apagado` })
    }, { sucesso: `BPO de ${nome} encerrado` })

  return (
    <Sheet open onOpenChange={(v) => !v && onFechar()}>
      <SheetContent className="gap-0 overflow-y-auto sm:max-w-xl">
        <SheetHeader className="px-5 pt-5">
          <SheetTitle className="text-xl font-light">{nome}</SheetTitle>
          <SheetDescription>
            Ficha BPO · {rotuloSituacaoPerfil[perfil.situacao]} · {perfil.analista_nome === perfil.responsavel_nome ? perfil.responsavel_nome : `${perfil.analista_nome} faz, ${perfil.responsavel_nome} confere`}
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-5 px-5 pt-4 pb-8">
          {e && (
            <section className="flex flex-col gap-2">
              <TituloBloco descricao="Critérios fixos com os pesos da Configuração.">Auditoria</TituloBloco>
              <SeloAudit e={e} onIr={(a) => (onFechar(), onIr(clienteId, a))} />
              <ul className="flex flex-col gap-1 text-sm">
                {e.audit.motivos.map((m, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="bg-muted-foreground mt-2 size-1 shrink-0 rounded-full" />
                    <span className="flex-1">{m.texto}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {implantando && (
            <section className="flex flex-col gap-2">
              <TituloBloco descricao={`${feitos} de ${passosOnboarding.length} passos (10, 3.3).`}>Implantação</TituloBloco>
              <Passos passos={passosOnboarding.map((p) => p.rotulo)} atual={Math.min(feitos, passosOnboarding.length - 1)} />
              <ul className="flex flex-col gap-1">
                {passosOnboarding.map((p) => (
                  <li key={p.id}>
                    <label className={cn('hover:bg-raised/50 flex items-start gap-2.5 rounded-[10px] px-1.5 py-1.5 text-sm', podeOnboarding ? 'cursor-pointer' : 'cursor-default')}>
                      <input type="checkbox" className="accent-foreground mt-0.5 size-4 shrink-0" checked={!!perfil.onboarding[p.id]} disabled={!podeOnboarding} onChange={(ev) => marcarPasso(p.id, ev.target.checked)} aria-label={p.rotulo} />
                      <span className="min-w-0 flex-1">
                        <span className={cn('block', perfil.onboarding[p.id] && 'text-muted-foreground line-through')}>{p.rotulo}</span>
                        <span className="text-muted-foreground block text-xs">{p.detalhe}</span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {perfil.situacao === 'encerrando' && perfil.encerramento && (
            <section className="flex flex-col gap-2">
              <TituloBloco descricao={`Motivo: ${perfil.encerramento.motivo}`}>Encerramento</TituloBloco>
              <ul className="flex flex-col gap-1">
                {passosSaida.map((p) => (
                  <li key={p.id}>
                    <label className="hover:bg-raised/50 flex cursor-pointer items-start gap-2.5 rounded-[10px] px-1.5 py-1.5 text-sm">
                      <input type="checkbox" className="accent-foreground mt-0.5 size-4 shrink-0" checked={!!perfil.encerramento?.passos[p.id]} disabled={!podeEncerrar} onChange={(ev) => passoSaida(p.id, ev.target.checked)} aria-label={p.rotulo} />
                      <span className={cn(perfil.encerramento?.passos[p.id] && 'text-muted-foreground line-through')}>{p.rotulo}</span>
                    </label>
                  </li>
                ))}
              </ul>
              {podeEncerrar && (
                <Button size="sm" variant="destructive" className="w-fit rounded-full" disabled={passosSaida.some((p) => !perfil.encerramento?.passos[p.id])} onClick={concluirSaida}>
                  Concluir o encerramento
                </Button>
              )}
            </section>
          )}

          {e && (
            <section className="flex flex-col gap-2">
              <TituloBloco descricao="Espelho do ERP que o cliente já usa (10, 3.0).">ERP e sincronização</TituloBloco>
              <BlocoErp e={e} />
            </section>
          )}

          {e && (
            <section className="flex flex-col gap-2">
              <TituloBloco descricao={`Mínimo combinado ${brl(perfil.caixa_minimo)}.`}>Caixa e pendências</TituloBloco>
              <dl className="divide-border/70 divide-y">
                <Propriedade rotulo="Saldo nos bancos">
                  <span className={e.caixa < perfil.caixa_minimo ? 'text-destructive' : undefined}>{brl(e.caixa)}</span>
                </Propriedade>
                <Propriedade rotulo="A pagar em aberto">{`${e.contas.filter(contaAberta).length} contas · ${brl(e.contas.filter(contaAberta).reduce((s, c) => s + c.valor, 0))}`}</Propriedade>
                <Propriedade rotulo="Lotes com o cliente">{e.lotesAbertos.length ? e.lotesAbertos.map((l) => `${brl(l.total)} (expira ${quando(l.expira_em.slice(0, 10))})`).join(' · ') : 'nenhum'}</Propriedade>
                <Propriedade rotulo="Fila">{`${e.fila.length} itens · ${e.fila.filter((f) => f.bola === 'bpo').length} conosco`}</Propriedade>
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
              </div>
            </section>
          )}

          <section className="flex flex-col gap-2">
            <TituloBloco
              descricao="Perfil BPO da empresa (10, 3.12)."
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
              <Propriedade rotulo="Escopo">{perfil.escopo.map((x) => ({ pagar: 'contas a pagar', receber: 'contas a receber', conciliacao: 'conciliação', gerencial: 'gerencial' })[x]).join(', ')}</Propriedade>
              <Propriedade rotulo="Modo de pagamento">{rotuloModoPagamento[perfil.modo_pagamento]}</Propriedade>
              <Propriedade rotulo="Responsável">{perfil.responsavel_nome}</Propriedade>
              <Propriedade rotulo="Analista">{perfil.analista_nome}</Propriedade>
              <Propriedade rotulo="Meta de SLA">{`${perfil.sla.meta}% no prazo`}</Propriedade>
              <Propriedade rotulo="Termo de dados">{perfil.termo_aceito_em ? `aceito em ${dataCurta(perfil.termo_aceito_em)}/${perfil.termo_aceito_em.slice(0, 4)}` : 'pendente'}</Propriedade>
              {perfil.paralelo_ate && <Propriedade rotulo="Paralelo até">{dataCurta(perfil.paralelo_ate)}</Propriedade>}
              <Propriedade rotulo="Bancos">{e?.bancos.map((b) => b.nome).join(', ') || 'nenhum conectado'}</Propriedade>
            </dl>
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

/** Editar perfil BPO da empresa (S08-A09): escopo, modo, responsável, analista, caixa mínimo, SLA, paralelo. */
function EditarPerfil({ perfil, nome, onFechar }: { perfil: BpoPerfil; nome: string; onFechar: () => void }) {
  const equipe = useEquipeBpo()
  const executar = useAcao()
  const [r, setR] = useState({ escopo: perfil.escopo, responsavel: perfil.responsavel_nome, analista: perfil.analista_nome, caixa: String(perfil.caixa_minimo), meta: String(perfil.sla.meta), paralelo: perfil.paralelo_ate ?? '' })
  const erroCaixa = !(Number(r.caixa) >= 0) ? 'Informe um valor (0 ou mais).' : undefined
  const erroMeta = !(Number(r.meta) > 0 && Number(r.meta) <= 100) ? 'Entre 1 e 100.' : undefined
  return (
    <GavetaFormulario
      aberta
      onFechar={onFechar}
      titulo={`Perfil BPO · ${nome}`}
      descricao="Modo de pagamento e alçadas ficam na Configuração (valem com o aceite do sócio)."
      acao="Salvar"
      acaoDesabilitada={!!erroCaixa || !!erroMeta || r.escopo.length === 0}
      onAcao={() => {
        const ok = executar(() => repos.bpo.perfis.atualizar(perfil.id, { escopo: r.escopo, responsavel_nome: r.responsavel, analista_nome: r.analista, caixa_minimo: Number(r.caixa), sla: { ...perfil.sla, meta: Number(r.meta) }, paralelo_ate: r.paralelo || null }, { texto: `Atualizou o perfil BPO de ${nome}` }), { sucesso: 'Perfil BPO salvo' })
        if (ok) onFechar()
      }}
    >
      <Campo rotulo="Escopo do serviço">
        {() => (
          <Fichas
            rotulo="Escopo"
            valores={r.escopo}
            onMudar={(v) => setR((x) => ({ ...x, escopo: v }))}
            opcoes={[
              { valor: 'pagar', rotulo: 'Contas a pagar' },
              { valor: 'receber', rotulo: 'Contas a receber' },
              { valor: 'conciliacao', rotulo: 'Conciliação' },
              { valor: 'gerencial', rotulo: 'Gerencial' },
            ]}
          />
        )}
      </Campo>
      <Campo rotulo="Responsável (confere)">{(id) => <CampoEscolha id={id} valor={r.responsavel} onMudar={(v) => setR((x) => ({ ...x, responsavel: v }))} opcoes={equipe.map((u) => ({ valor: u.nome, rotulo: u.nome }))} />}</Campo>
      <Campo rotulo="Analista (faz)" ajuda="Analista igual ao responsável = BPO de uma pessoa: a conferência vai ao Gestor do escritório ou ao cliente.">
        {(id) => <CampoEscolha id={id} valor={r.analista} onMudar={(v) => setR((x) => ({ ...x, analista: v }))} opcoes={equipe.map((u) => ({ valor: u.nome, rotulo: u.nome }))} />}
      </Campo>
      <Campo rotulo="Caixa mínimo (R$)" erro={erroCaixa}>
        {(id) => <CampoTexto id={id} tipo="number" valor={r.caixa} onMudar={(v) => setR((x) => ({ ...x, caixa: v }))} />}
      </Campo>
      <Campo rotulo="Meta de SLA (% no prazo)" erro={erroMeta}>
        {(id) => <CampoTexto id={id} tipo="number" valor={r.meta} onMudar={(v) => setR((x) => ({ ...x, meta: v }))} />}
      </Campo>
      <Campo rotulo="Paralelo até" ajuda="Vazio: fora do paralelo.">
        {(id) => <CampoTexto id={id} tipo="date" valor={r.paralelo} onMudar={(v) => setR((x) => ({ ...x, paralelo: v }))} />}
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
export function NovaEmpresaBpo({ aberta, onFechar, onCriada }: { aberta: boolean; onFechar: () => void; onCriada?: (clienteId: string) => void }) {
  const tCliente = useTabela('cliente')
  const tPerfil = useTabela('bpo_perfil')
  const equipe = useEquipeBpo()
  const executar = useAcao()
  const candidatos = tCliente.filter((c) => !c.arquivado_em && !tPerfil.some((p) => p.cliente_id === c.id && p.situacao !== 'encerrado'))
  const [r, setR] = useState({ cliente: '', nome: '', documento: '', analista: '', responsavel: '', modo: 'M1' as BpoPerfil['modo_pagamento'] })
  const novo = r.cliente === '' || r.cliente === '_novo'
  const erroNome = novo && !r.nome.trim() ? 'Informe a razão social.' : undefined
  const erroDoc = novo && !r.documento.trim() ? 'Informe o CNPJ.' : undefined
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

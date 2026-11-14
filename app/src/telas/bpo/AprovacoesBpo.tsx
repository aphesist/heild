import { ArrowsClockwiseIcon, BellRingingIcon, CheckIcon, DeviceMobileIcon, HandPalmIcon, PlusIcon, ShieldCheckIcon, StackIcon, WarningIcon, XIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { useLoja } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import { BotaoAcoes, EstadoVazio, SePode, useAcao, useConfirmar, usePode } from '@/components/kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Campo, CampoEscolha, CampoTexto, GavetaFormulario } from '@/components/ui/formulario'
import { Tooltip } from '@/components/ui/tooltip'
import { banco } from '@/nucleo/banco'
import type { BpoConta, BpoLote } from '@/nucleo/modelo/entidades'
import { useSessaoBruta } from '@/ambiente/sessao'
import { eventoBpo, repos } from '@/nucleo/repositorios'
import { irParaPagina } from '@/nucleo/rotas'
import { SeloTitular } from '../financeiro/pecas'
import { BotaoErp, brl, CabecalhoBpo, Caixa, PaginaBpo, Regra, TituloBloco, type PropsBpo } from './comum'
import { aprovadoresPara, dataCurta, diasAte, hora, hojeBpo, quando, rotuloModoPagamento, useBpo, type EmpresaVista } from './dados'
import { useAcoesErp } from './FichaEmpresa'
import { usePedirBpo } from './integrantes'

const categorias = ['Matéria-prima', 'Mercadoria para revenda', 'Ocupação', 'Energia', 'Água', 'Software', 'Serviços de terceiros', 'Impostos e taxas', 'Despesas gerais']

/** Contexto da sessão para a pergunta "posso conferir?" (a mesma regra que o repositório usa ao gravar). */
function useCtxPessoa() {
  const s = useSessaoBruta()
  return s?.perfil ? { ator: { tipo: 'pessoa' as const, perfil: s.perfil }, origem: 'tela' as const } : undefined
}

/**
 * BPO › Aprovações (S08-T05; 10, 3.5 a 3.8): conferência interna (quem
 * digitou não confere; acima da faixa 1, analista e gestor), o próximo lote,
 * o lote enviado ao cliente como cartão no app e o acompanhamento com o
 * escalonamento. Nenhum pagamento sai sem a aprovação do cliente registrada.
 */
export function AprovacoesBpoTela({ empresa }: PropsBpo) {
  const { empresas } = useBpo()
  const lista = empresa ? [empresa] : empresas
  const [lancar, setLancar] = useState(false)
  const capturadas = lista.flatMap((e) => e.contas.filter((c) => c.etapa === 'capturada').map((c) => ({ e, c })))
  const prontas = lista.filter((e) => e.contas.some((c) => c.etapa === 'conferida' || c.etapa === 'em_lote'))
  const lotes = lista.flatMap((e) => e.lotes.map((l) => ({ e, l })))
  const abertos = lotes.filter(({ l }) => l.situacao === 'aguardando' || l.situacao === 'parcial')

  return (
    <PaginaBpo>
      <CabecalhoBpo
        titulo="Aprovações"
        sub={empresa ? `${empresa.nome} · ${rotuloModoPagamento[empresa.perfil.modo_pagamento]} · faixa 1 até ${brl(empresa.faixa1)}, faixa 2 até ${brl(empresa.faixa2)}` : 'Conferência interna, próximo lote e lotes com os clientes'}
        status={`${capturadas.length} para conferir; ${abertos.length === 1 ? '1 lote' : `${abertos.length} lotes`} com ${empresa ? 'o cliente' : 'os clientes'}`}
      >
        {empresa && <SeloTitular titular={{ tipo: 'empresa', clienteId: empresa.clienteId, nome: empresa.nome }} />}
        <SePode ferramenta="conta_pagar.capturar">
          <Button size="sm" variant="outline" className="rounded-full" onClick={() => setLancar(true)}>
            <PlusIcon /> Lançar conta
          </Button>
        </SePode>
        {empresa && empresa.erp.modo !== 'E3' && <CapturarDoErp e={empresa} />}
      </CabecalhoBpo>

      <Regra icone={<ShieldCheckIcon weight="duotone" />}>
        <span className="text-foreground">Nenhum pagamento sai sem uma aprovação humana registrada.</span> Pagar e transferir nunca viram automáticos: o integrante prepara, a equipe confere (quem digitou não confere) e o cliente aprova no app. Vencido sem aprovação só gera alerta.
      </Regra>

      <Caixa>
        <TituloBloco descricao="Até a faixa 1, uma conferência; acima, analista e gestor. O botão fica desligado, com o motivo, para quem não pode.">Para conferir</TituloBloco>
        {capturadas.length === 0 ? (
          <p className="text-muted-foreground py-2 text-sm">Tudo conferido.</p>
        ) : (
          <ul className="divide-border/70 flex flex-col divide-y" aria-label="Contas para conferir">
            {capturadas.map(({ e, c }) => (
              <LinhaConferir key={c.id} e={e} c={c} mostrarEmpresa={!empresa} />
            ))}
          </ul>
        )}
      </Caixa>

      <Caixa>
        <TituloBloco descricao="Conta conferida entra no lote da janela da empresa; a conferida depois da janela vai para o próximo. O Gestor monta e manda ao cliente.">Próximo lote</TituloBloco>
        {prontas.length === 0 ? <p className="text-muted-foreground py-2 text-sm">Nenhuma conta conferida esperando lote.</p> : prontas.map((e) => <ProximoLote key={e.clienteId} e={e} mostrarEmpresa={!empresa} />)}
      </Caixa>

      {lotes.length === 0 ? (
        <EstadoVazio compacto icone={StackIcon} titulo="Nenhum lote com o cliente" descricao="Quando o Gestor manda um lote, ele vira cartão no app do cliente e aparece aqui." />
      ) : (
        <div className={lotes.length >= 3 ? 'grid gap-4 lg:grid-cols-2 xl:grid-cols-3' : lotes.length === 2 ? 'grid gap-4 lg:grid-cols-2' : 'grid gap-4'}>
          {lotes.map(({ e, l }) => (
            <CartaoLote key={l.id} l={l} e={e} mostrarEmpresa={!empresa} />
          ))}
        </div>
      )}
      <LancarConta aberta={lancar} onFechar={() => setLancar(false)} empresas={lista} />
    </PaginaBpo>
  )
}

/** Capturar do ERP: o integrante Contas a Pagar lê o espelho e deixa as contas novas em "para conferir". */
function CapturarDoErp({ e }: { e: EmpresaVista }) {
  const acoes = useAcoesErp(e)
  return (
    <SePode ferramenta="erp.sincronizar">
      <Button size="sm" variant="ghost" className="rounded-full" disabled={!!acoes.estado.carregando || e.erp.efetiva === 'credencial_vencida'} title={e.erp.efetiva === 'credencial_vencida' ? `Credencial do ${e.erp.provedor} vencida` : undefined} onClick={() => void acoes.sincronizar()}>
        <ArrowsClockwiseIcon /> {acoes.estado.carregando ? 'Lendo o ERP…' : acoes.estado.erro ? 'ERP não respondeu: tentar de novo' : `Capturar do ${e.erp.provedor}`}
      </Button>
    </SePode>
  )
}

function LinhaConferir({ e, c, mostrarEmpresa }: { e: EmpresaVista; c: BpoConta; mostrarEmpresa: boolean }) {
  const executar = useAcao()
  const confirmar = useConfirmar()
  const ctx = useCtxPessoa()
  const { usuario } = useSessao()
  const motivo = repos.bpo.contas.motivoNaoConfere(c, ctx)
  const precisa = repos.bpo.contas.conferenciasNecessarias(c)
  const sozinho = e.perfil.analista_nome === e.perfil.responsavel_nome
  const podeGestor = usePode('pagamento_lote.pedir_aprovacao', { cliente_id: e.clienteId })
  const fornecedor = e.fornecedores.find((f) => f.nome === c.contraparte)
  const podeConfirmarFornecedor = usePode('fornecedor.alterar_dados_bancarios', { cliente_id: e.clienteId })
  const vencida = diasAte(c.vencimento) < 0
  return (
    <li className="flex flex-wrap items-center gap-3 py-2.5 text-sm">
      <span className="min-w-0 flex-1 basis-64">
        <span className="block truncate">
          {c.contraparte}
          {mostrarEmpresa && <span className="text-muted-foreground"> · {e.nome}</span>}
        </span>
        <span className="text-muted-foreground block truncate text-xs">
          vence {quando(c.vencimento)} · via {c.origem} · digitou {c.digitado_por_nome}
          {c.conferencias.length > 0 && ` · conferiu ${c.conferencias.map((x) => x.nome).join(' e ')}`} · {c.conferencias.length} de {precisa} conferência{precisa > 1 ? 's' : ''}
        </span>
        {motivo && <span className="text-muted-foreground block text-xs">{motivo}</span>}
        {vencida && (
          <span className="text-destructive flex items-center gap-1 text-xs">
            <WarningIcon className="size-3.5" weight="fill" /> venceu em {dataCurta(c.vencimento)} sem aprovação: alerta ao Gestor e ao sócio; nunca execução
          </span>
        )}
        {c.alerta && (
          <span className="text-warning-foreground flex items-center gap-1 text-xs">
            <WarningIcon className="text-warning size-3.5" weight="fill" /> {c.alerta}
          </span>
        )}
      </span>
      <span className="w-24 text-right tabular-nums">{brl(c.valor, true)}</span>
      <Tooltip conteudo={motivo ?? 'Confere fornecedor, valor, vencimento e dados bancários contra o documento.'}>
        <span>
          <Button size="sm" className="rounded-full" disabled={!!motivo} aria-label={`Conferir ${c.contraparte}`} onClick={() => executar(() => repos.bpo.contas.conferir(c.id), { sucesso: `${c.contraparte} conferida por ${usuario.nome}` })}>
            <CheckIcon /> Conferir
          </Button>
        </span>
      </Tooltip>
      {sozinho && podeGestor && (
        <Button size="sm" variant="ghost" className="rounded-full" onClick={() => executar(() => repos.bpo.contas.clienteConfere(c.id), { sucesso: `${c.contraparte} vai ao cliente conferir na aprovação` })}>
          Cliente confere
        </Button>
      )}
      <BotaoAcoes
        rotulo={`Mais ações de ${c.contraparte}`}
        acoes={[
          ...(fornecedor && fornecedor.risco !== 'recorrente'
            ? [
                {
                  rotulo: 'Confirmar dados bancários por segundo canal',
                  icone: <ShieldCheckIcon />,
                  motivo: podeConfirmarFornecedor ? undefined : 'Sua conta não altera dados bancários de fornecedor.',
                  onSelecionar: async () => {
                    const canal = await confirmar({ titulo: `Confirmar os dados bancários de ${fornecedor.nome}?`, descricao: 'Ligue para o telefone do cadastro (não o do boleto) ou peça a confirmação ao cliente. Diga por onde confirmou: vai para a trilha.', acao: 'Confirmar', exigirMotivo: true, rotuloMotivo: 'Canal da confirmação (ex.: ligação ao telefone do cadastro)' })
                    if (typeof canal === 'string') executar(() => repos.bpo.fornecedores.atualizar(fornecedor.id, { risco: 'recorrente', dados_bancarios_confirmados_em: hojeBpo, confirmado_por: usuario.nome, canal_confirmacao: canal }, { texto: `${usuario.nome} confirmou os dados bancários de ${fornecedor.nome} (${canal})` }), { sucesso: 'Dados bancários confirmados' })
                  },
                },
              ]
            : []),
          {
            rotulo: 'Cancelar a conta',
            icone: <XIcon />,
            perigo: true,
            separar: true,
            onSelecionar: async () => {
              const m = await confirmar({ titulo: `Cancelar ${c.contraparte}?`, descricao: 'A conta fica no histórico como cancelada (nada se apaga).', acao: 'Cancelar a conta', perigo: true, exigirMotivo: true })
              if (typeof m === 'string') executar(() => repos.bpo.contas.cancelar(c.id, m), { sucesso: 'Conta cancelada' })
            },
          },
        ]}
      />
      <BotaoErp e={e} oque={`a conta ${c.contraparte}`} />
    </li>
  )
}

/** As contas conferidas de uma empresa: pôr no próximo lote (A23) e montar e enviar ao cliente (A24). */
function ProximoLote({ e, mostrarEmpresa }: { e: EmpresaVista; mostrarEmpresa: boolean }) {
  const executar = useAcao()
  const confirmar = useConfirmar()
  const loja = useLoja()
  const conferidas = e.contas.filter((c) => c.etapa === 'conferida')
  const noLote = e.contas.filter((c) => c.etapa === 'em_lote')
  const total = noLote.reduce((s, c) => s + c.valor, 0)
  const reforcada = total > e.faixa2
  const podem = aprovadoresPara(e.ficha, total, e.faixa2)
  const enviar = async () => {
    const ok = await confirmar({
      titulo: `Mandar o lote de ${brl(total)} a ${e.nome}?`,
      descricao: `${noLote.length} conta${noLote.length > 1 ? 's' : ''} conferida${noLote.length > 1 ? 's' : ''}. ${reforcada ? `Acima de ${brl(e.faixa2)}: aprovação reforçada (duas pessoas: ${podem.map((p) => p.nome).join(' e ') || 'ninguém marcado na ficha'}).` : `Quem aprova: ${podem.map((p) => p.nome).join(' ou ') || 'ninguém com alçada para o total'}.`} Vira cartão no app; se ninguém responder, o escalonamento avisa (nunca paga sozinho).`,
      acao: 'Mandar ao cliente',
    })
    if (ok !== true) return
    const saldo = e.caixa
    const lote = executar(() => repos.bpo.lotes.montarEEnviar(e.clienteId, noLote.map((c) => c.id), { saldo, modo: e.perfil.modo_pagamento, expiraEm: `${hojeBpo.slice(0, 8)}${String(Number(hojeBpo.slice(8, 10)) + 1).padStart(2, '0')}T12:00:00-03:00`, podeAprovar: podem.map((p) => p.nome) }), { sucesso: `Lote enviado: cartão no app de ${e.nome}` })
    if (lote) loja.avisar({ para: [], tipo: 'cartao', setor: 'bpo_pagar', titulo: `Lote de ${brl(total)} enviado a ${e.nome}`, detalhe: `aguardando ${podem.map((p) => p.nome).join(reforcada ? ' e ' : ' ou ')}`, destino: { modulo: 'bpo', aba: 'aprovacoes', cliente: e.clienteId } })
  }
  return (
    <div className="border-border/70 flex flex-col gap-2 border-t pt-3 first:border-t-0 first:pt-0">
      {mostrarEmpresa && <span className="text-sm font-medium">{e.nome}</span>}
      <ul className="flex flex-col gap-1">
        {[...noLote, ...conferidas].map((c) => (
          <li key={c.id} className="flex flex-wrap items-center gap-2 text-sm">
            <span className="min-w-0 flex-1 basis-56">
              <span className="block truncate">{c.contraparte}</span>
              <span className="text-muted-foreground block truncate text-xs">
                vence {quando(c.vencimento)} · conferiu {c.conferencias.map((x) => x.nome).join(' e ')}
                {c.alerta && ` · ${c.alerta}`}
              </span>
            </span>
            <span className="w-24 text-right tabular-nums">{brl(c.valor)}</span>
            {c.etapa === 'em_lote' ? (
              <Button size="sm" variant="ghost" className="rounded-full" onClick={() => executar(() => repos.bpo.contas.tirarDoLote(c.id))}>
                Tirar do lote
              </Button>
            ) : (
              <Button size="sm" variant="outline" className="rounded-full" onClick={() => executar(() => repos.bpo.contas.porNoProximoLote(c.id), { sucesso: `${c.contraparte} entra no próximo lote (janela ${e.perfil.janela.abertura})` })}>
                Pôr no próximo lote
              </Button>
            )}
          </li>
        ))}
      </ul>
      {noLote.length > 0 && (
        <div className="bg-sunken/50 flex flex-wrap items-center gap-2 rounded-[14px] px-3 py-2 text-sm">
          <span className="flex-1">
            Lote: {noLote.length} conta{noLote.length > 1 ? 's' : ''} · <span className="tabular-nums">{brl(total)}</span>
            <span className="text-muted-foreground block text-xs">
              saldo {brl(e.caixa)} · depois {brl(e.caixa - total)} · {reforcada ? 'aprovação reforçada (2 pessoas)' : '1 aprovador com alçada'}
            </span>
          </span>
          <SePode ferramenta="pagamento_lote.pedir_aprovacao" alvo={{ cliente_id: e.clienteId }} mostrarMotivo>
            <Button size="sm" className="rounded-full" onClick={() => void enviar()}>
              <DeviceMobileIcon /> Montar lote e enviar ao cliente
            </Button>
          </SePode>
        </div>
      )}
    </div>
  )
}

/** Passos do escalonamento do lote (10, 3.6, decisão de 8/11/2026). */
export function passosEscalonamento(e: EmpresaVista, l?: BpoLote) {
  const esc = e.perfil.escalonamento
  const [h, m] = e.perfil.janela.abertura.split(':').map(Number)
  const soma = (n: number) => (h + n >= 18 ? 'abertura do dia útil seguinte' : `${String(h + n).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
  const proximo = l ? [...l.conta_ids].map((id) => e.contas.find((c) => c.id === id)?.vencimento ?? '9999').sort()[0] : undefined
  const vespera = proximo && proximo !== '9999' ? `véspera (${dataCurta(new Date(Date.parse(`${proximo}T12:00:00Z`) - 864e5).toISOString().slice(0, 10))})` : 'véspera do vencimento'
  const aprovador = esc.aprovador || 'o aprovador da ficha'
  return [
    { quando: e.perfil.janela.abertura, texto: `abre a janela; o cartão vai a ${aprovador}` },
    { quando: `+${esc.lembrete_h} h (${soma(esc.lembrete_h)})`, texto: `lembrete a ${aprovador}` },
    { quando: `+${esc.substituto_h} h (${soma(esc.substituto_h)})`, texto: esc.substituto ? `vai ao substituto, ${esc.substituto}` : 'sem substituto cadastrado: alerta ao Gestor do BPO' },
    { quando: vespera, texto: `alerta ao Gestor do BPO e a ${esc.socio || 'o sócio'} com a lista do que vence` },
    { quando: 'vencido', texto: 'só alerta (Gestor e sócio); nunca paga sozinho; auditoria vermelha: “vencido sem aprovação”' },
  ]
}

/** Acompanhar lote (S08-A25): aprovado, editado, recusado, expirado; no M1, "Já liberei no banco" pelo cliente. */
function CartaoLote({ l, e, mostrarEmpresa }: { l: BpoLote; e: EmpresaVista; mostrarEmpresa: boolean }) {
  const loja = useLoja()
  const executar = useAcao()
  const pedir = usePedirBpo()
  const { usuario } = useSessao()
  const itens = l.conta_ids.map((id) => e.contas.find((c) => c.id === id)).filter((c): c is BpoConta => !!c)
  const podem = aprovadoresPara(e.ficha, l.total, e.faixa2)
  const rotulo = {
    aguardando: `aguardando ${podem.map((p) => p.nome.split(' ')[0]).join(l.aprovadores_necessarios > 1 ? ' e ' : ' ou ') || 'o aprovador'}`,
    parcial: `${l.aprovacoes.length} de ${l.aprovadores_necessarios} aprovações`,
    aprovado: l.modo_pagamento === 'M1' ? 'aprovado · o cliente libera no banco' : 'aprovado · agendado por API no vencimento',
    liberado: 'liberado no banco',
    recusado: 'recusado',
    expirado: 'expirou sem resposta · nada foi pago',
  }[l.situacao]
  const aberto = l.situacao === 'aguardando' || l.situacao === 'parcial'
  const pagas = itens.filter((c) => c.etapa === 'paga').length
  return (
    <Caixa>
      <TituloBloco descricao={`${mostrarEmpresa ? `${e.nome} · ` : ''}expira ${quando(l.expira_em.slice(0, 10))} ${hora(l.expira_em)}`}>{l.titulo}</TituloBloco>
      <Badge className="w-fit" variant={l.situacao === 'recusado' || l.situacao === 'expirado' ? 'erro' : l.situacao === 'aprovado' || l.situacao === 'liberado' ? 'sucesso' : 'destaque'}>
        {rotulo}
      </Badge>
      <ul className="flex flex-col gap-1.5 text-sm">
        {itens.map((i) => (
          <li key={i.id} className={l.removidos.includes(i.id) ? 'text-muted-foreground flex gap-2 line-through' : 'flex gap-2'}>
            <span className="min-w-0 flex-1">
              <span className="block truncate">{i.contraparte}</span>
              <span className="text-muted-foreground block text-xs">
                vence {quando(i.vencimento)} · {i.etapa === 'paga' ? 'paga (baixa no extrato)' : e.fornecedores.find((f) => f.nome === i.contraparte)?.risco === 'recorrente' ? 'OK (recorrente)' : 'conferida'}
              </span>
              {i.alerta && (
                <span className="text-warning-foreground flex items-start gap-1 text-xs">
                  <WarningIcon className="text-warning mt-0.5 size-3.5 shrink-0" weight="fill" /> {i.alerta}
                </span>
              )}
            </span>
            <span className="tabular-nums">{brl(i.valor)}</span>
          </li>
        ))}
      </ul>
      <div className="border-border/70 flex flex-wrap items-center gap-2 border-t pt-3 text-sm">
        <span className="flex-1">
          Total <span className="tabular-nums">{brl(l.total)}</span>
          <span className="text-muted-foreground block text-xs">
            saldo {brl(l.saldo)} · depois {brl(l.saldo - l.total)} · {l.aprovadores_necessarios > 1 ? 'aprovação reforçada (2 pessoas)' : '1 aprovador'}
          </span>
          <span className="text-muted-foreground block text-xs">
            preparou {l.preparado_por} · conferiu {l.conferido_por}
          </span>
        </span>
        {aberto && (
          <Button
            size="sm"
            variant="outline"
            className="rounded-full"
            onClick={() => {
              eventoBpo(banco, `${usuario.nome} lembrou ${podem.map((p) => p.nome).join(' e ')} do lote “${l.titulo}”`, e.clienteId, 'pagamento_lote.pedir_aprovacao')
              loja.toast(`Lembrete enviado a ${podem.map((p) => p.nome).join(' e ') || 'o aprovador'} pelo app e WhatsApp`)
            }}
          >
            <BellRingingIcon /> Lembrar
          </Button>
        )}
        {aberto && (
          <Button size="sm" variant="ghost" className="rounded-full" onClick={() => irParaPagina('app')} title="Abre o app do cliente (escolha a pessoa no painel Demonstração)">
            <DeviceMobileIcon /> Ver no app
          </Button>
        )}
        {l.situacao === 'recusado' && (
          <SePode ferramenta="pagamento_lote.montar">
            <Button size="sm" variant="outline" className="rounded-full" onClick={() => executar(() => repos.bpo.lotes.refazer(l.id), { sucesso: 'As contas voltaram ao próximo lote, com o motivo do cliente' })}>
              <HandPalmIcon /> Refazer
            </Button>
          </SePode>
        )}
        {l.situacao === 'liberado' && pagas < itens.length && (
          <Button
            size="sm"
            variant="outline"
            className="rounded-full"
            onClick={() =>
              pedir({
                integrante: 'i-bpo-conciliacao',
                titulo: `Conferir a baixa do lote no extrato de ${e.nome}`,
                cliente: e.nome,
                inicio: 'Vou ler o extrato do dia e casar cada pagamento liberado com a conta do lote.',
                etapas: ['Lendo o extrato (Open Finance)', 'Casando os pagamentos com as contas do lote', `Dando a baixa no ${e.erp.provedor}`],
                fim: { texto: `Baixas do lote “${l.titulo}” confirmadas no extrato e lançadas no ${e.erp.provedor}.`, aviso: `Conciliação confirmou as baixas de ${e.nome}` },
                efeito: { tipo: 'conciliar', clienteId: e.clienteId },
              })
            }
          >
            <CheckIcon /> Conferir a baixa no extrato
          </Button>
        )}
      </div>
      {(aberto || l.situacao === 'expirado') && (
        <details className="text-xs" open={l.situacao === 'expirado'}>
          <summary className="text-muted-foreground cursor-pointer select-none">{l.situacao === 'expirado' ? 'O escalonamento chegou ao fim: só alerta' : 'Se ninguém responder (escalonamento)'}</summary>
          <ol className="mt-2 flex flex-col gap-1.5 border-l pl-3">
            {passosEscalonamento(e, l).map((p, i) => (
              <li key={i} className={i === 0 || l.situacao === 'expirado' ? 'text-muted-foreground' : undefined}>
                <span className="font-medium">{p.quando}</span> · {p.texto}
                {(i === 0 || l.situacao === 'expirado') && ' (feito)'}
              </li>
            ))}
          </ol>
        </details>
      )}
      {(l.aprovacoes.length > 0 || l.motivo) && (
        <ul className="text-muted-foreground flex flex-col gap-0.5 text-xs" aria-label="Decisões do cliente">
          {l.aprovacoes.map((a) => (
            <li key={a.nome + a.quando}>
              {l.situacao === 'recusado' && a === l.aprovacoes[l.aprovacoes.length - 1] ? 'Recusado' : 'Aprovado'} por {a.nome} às {hora(a.quando)} {a.canal === 'whatsapp' ? 'pelo WhatsApp (código de uso único)' : 'no app'}
              {l.removidos.length > 0 && l.situacao !== 'recusado' && ` (editou: tirou ${l.removidos.length})`}
            </li>
          ))}
          {l.motivo && <li>Motivo: {l.motivo}</li>}
          {l.situacao === 'liberado' && <li>Liberado no banco pelo cliente; a conciliação confirma a baixa no {e.erp.provedor}.</li>}
        </ul>
      )}
    </Caixa>
  )
}

/** Lançar conta (digitar): quem lança não confere a mesma conta. */
function LancarConta({ aberta, onFechar, empresas }: { aberta: boolean; onFechar: () => void; empresas: EmpresaVista[] }) {
  const executar = useAcao()
  const [r, setR] = useState({ empresa: empresas[0]?.clienteId ?? '', contraparte: '', categoria: categorias[0], valor: '', vencimento: '', origem: 'e-mail' })
  const empresa = empresas.find((e) => e.clienteId === r.empresa) ?? empresas[0]
  const fornecedorNovo = !!r.contraparte.trim() && !empresa?.fornecedores.some((f) => f.nome.toLowerCase() === r.contraparte.trim().toLowerCase())
  const erros = { contraparte: !r.contraparte.trim() ? 'Informe o fornecedor.' : undefined, valor: !(Number(r.valor) > 0) ? 'Valor maior que zero.' : undefined, vencimento: !r.vencimento ? 'Informe o vencimento.' : undefined }
  const [tentou, setTentou] = useState(false)
  const salvar = () => {
    setTentou(true)
    if (!empresa || Object.values(erros).some(Boolean)) return
    const ok = executar(() => {
      if (fornecedorNovo) repos.bpo.fornecedores.criar({ cliente_id: empresa.clienteId, nome: r.contraparte.trim(), risco: 'novo', banco: 'dados do boleto (a confirmar por segundo canal)' })
      return repos.bpo.contas.capturar({ cliente_id: empresa.clienteId, contraparte: r.contraparte.trim(), categoria: r.categoria, valor: Number(r.valor), vencimento: r.vencimento, origem: r.origem, lancar_no_erp: empresa.erp.modo === 'E2', alerta: fornecedorNovo ? 'fornecedor novo: confirmar os dados bancários por segundo canal antes do lote' : null })
    }, { sucesso: 'Conta lançada: outra pessoa confere' })
    if (ok) {
      setR((x) => ({ ...x, contraparte: '', valor: '', vencimento: '' }))
      setTentou(false)
      onFechar()
    }
  }
  return (
    <GavetaFormulario aberta={aberta} onFechar={onFechar} titulo="Lançar conta a pagar" descricao="Digitar é a primeira etapa: quem lança não confere esta conta (segregação de funções)." acao="Lançar" onAcao={salvar}>
      {empresas.length > 1 && <Campo rotulo="Empresa">{(id) => <CampoEscolha id={id} valor={r.empresa} onMudar={(v) => setR((x) => ({ ...x, empresa: v }))} opcoes={empresas.map((e) => ({ valor: e.clienteId, rotulo: e.nome }))} />}</Campo>}
      <Campo rotulo="Fornecedor" erro={tentou ? erros.contraparte : undefined} ajuda={fornecedorNovo ? 'Fornecedor novo: sobe de faixa e pede a confirmação dos dados bancários por segundo canal.' : undefined}>
        {(id) => <CampoTexto id={id} valor={r.contraparte} onMudar={(v) => setR((x) => ({ ...x, contraparte: v }))} placeholder={empresa?.fornecedores[0]?.nome} />}
      </Campo>
      <Campo rotulo="Categoria gerencial">{(id) => <CampoEscolha id={id} valor={r.categoria} onMudar={(v) => setR((x) => ({ ...x, categoria: v }))} opcoes={categorias.map((c) => ({ valor: c, rotulo: c }))} />}</Campo>
      <Campo rotulo="Valor (R$)" erro={tentou ? erros.valor : undefined}>
        {(id) => <CampoTexto id={id} tipo="number" valor={r.valor} onMudar={(v) => setR((x) => ({ ...x, valor: v }))} />}
      </Campo>
      <Campo rotulo="Vencimento" erro={tentou ? erros.vencimento : undefined}>
        {(id) => <CampoTexto id={id} tipo="date" valor={r.vencimento} onMudar={(v) => setR((x) => ({ ...x, vencimento: v }))} />}
      </Campo>
      <Campo rotulo="Chegou por">{(id) => <CampoEscolha id={id} valor={r.origem} onMudar={(v) => setR((x) => ({ ...x, origem: v }))} opcoes={['e-mail', 'WhatsApp', 'app', 'DDA', 'recorrente'].map((o) => ({ valor: o, rotulo: o }))} />}</Campo>
      {empresa?.erp.modo === 'E2' && <p className="text-muted-foreground text-xs">{empresa.erp.provedor} em modo arquivo: a conta entra no checklist “lançar no ERP”.</p>}
    </GavetaFormulario>
  )
}

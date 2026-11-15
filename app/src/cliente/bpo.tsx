import { ArrowClockwiseIcon, BankIcon, ChatCircleIcon, CheckIcon, ClockCountdownIcon, FileTextIcon, PencilSimpleIcon, PlugsConnectedIcon, ScalesIcon, ShieldCheckIcon, WarningIcon, WhatsappLogoIcon, XIcon } from '@phosphor-icons/react'
import { useEffect, useMemo, useState } from 'react'
import { useLoja } from '@/ambiente/loja'
import { EstadoErro, SeloDemonstracao } from '@/components/kit'
import { Button } from '@/components/ui/button'
import { CampoArea, CampoTexto } from '@/components/ui/formulario'
import { cn } from '@/lib/utils'
import { banco } from '@/nucleo/banco'
import type { BpoConta, BpoLote } from '@/nucleo/modelo/entidades'
import type { Contexto } from '@/nucleo/permissoes'
import { temBanco, useTabela } from '@/nucleo/react'
import { garantirSementeBpo } from '@/nucleo/semente/s08'
import { comoAtor, repos } from '@/nucleo/repositorios'
import { ErroServico, servicos } from '@/servicos'
import { FluxoMensal } from '@/telas/financeiro/pecas'
import { agoraBpo, aprovadoresPara, contaAberta, dataHora, diasAte, quando, useEmpresaBpo } from '@/telas/bpo/dados'
import { Bloco, primeiroNome, TituloTela, type Ctx } from './ClienteApp'

/*
 * S08 · Contrato C10: as telas do BPO no app do cliente (S08-T10). Continua
 * exportando AprovacoesApp, CaixaApp, PropostaAlcadaApp e useLotesAbertos com
 * os mesmos pontos de uso do ClienteApp (S10). Agora leem e gravam nas
 * entidades do BPO (lote, conta, alçada, fila), como a pessoa do cliente.
 */

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

/** Lote com as contas, no formato que o Início do app usa (`itens` com `valor`). */
export type LoteApp = BpoLote & { itens: { conta: string; fornecedor: string; valor: number; vencimento: string; alerta?: string | null }[] }

function comItens(l: BpoLote, contas: BpoConta[]): LoteApp {
  const itens = l.conta_ids.map((id) => contas.find((c) => c.id === id)).filter((c): c is BpoConta => !!c)
  return { ...l, itens: itens.map((c) => ({ conta: c.id, fornecedor: c.contraparte, valor: c.valor, vencimento: c.vencimento, alerta: c.alerta })) }
}

/** Lotes desta empresa que ainda esperam alguém (Início do app: "Pagamentos para aprovar"). */
export function useLotesAbertos(ctx: Ctx): LoteApp[] {
  // Banco guardado antes das tabelas do BPO: semeia o BPO uma vez (sem apagar o resto).
  useEffect(() => {
    if (temBanco()) garantirSementeBpo()
  }, [])
  const tLote = useTabela('bpo_lote')
  const tConta = useTabela('bpo_conta')
  return useMemo(() => tLote.filter((l) => l.cliente_id === ctx.clienteId && !l.arquivado_em && (l.situacao === 'aguardando' || l.situacao === 'parcial')).map((l) => comItens(l, tConta)), [tLote, tConta, ctx.clienteId])
}

/** Quem age no app: a pessoa do cliente (ferramentas expostas ao cliente, Fundações 3.2). */
const ctxCliente = (ctx: Ctx): Contexto => ({ ator: { tipo: 'pessoa_cliente', nome: ctx.contato.nome, cliente_id: ctx.clienteId }, origem: 'tela' })

function useNoApp(ctx: Ctx) {
  const loja = useLoja()
  return <R,>(fazer: () => R, aviso?: string): R | undefined => {
    try {
      const r = comoAtor(ctxCliente(ctx), fazer)
      if (aviso) ctx.avisarApp(aviso)
      return r
    } catch (e) {
      loja.toastErro(e instanceof Error ? e.message : String(e))
      return undefined
    }
  }
}

/** Avisa a equipe do BPO no sino (cada decisão do cliente avisa, 10, 3.6). */
function useAvisarEquipe(ctx: Ctx) {
  const loja = useLoja()
  return (titulo: string, aba = 'aprovacoes') => loja.avisar({ para: [], tipo: 'cliente', setor: 'bpo_financeiro', titulo, detalhe: ctx.clienteNome, destino: { modulo: 'bpo', aba, cliente: ctx.clienteId } })
}

/**
 * App › Aprovações de pagamento (S08-A47 a A50): o cartão do lote com Aprovar,
 * Editar e aprovar, Recusar, aprovação pelo WhatsApp com código (só abaixo do
 * teto) e, no M1, "Já liberei no banco". Antes, os pedidos do escritório que
 * dependem da pessoa (autorizar o ERP de novo, mandar o boleto que faltou).
 */
export function AprovacoesApp({ ctx }: { ctx: Ctx }) {
  const tLote = useTabela('bpo_lote')
  const tConta = useTabela('bpo_conta')
  const tFila = useTabela('bpo_item_fila')
  const lotes = useMemo(() => tLote.filter((l) => l.cliente_id === ctx.clienteId && !l.arquivado_em).sort((a, b) => b.criado_em.localeCompare(a.criado_em)).map((l) => comItens(l, tConta)), [tLote, tConta, ctx.clienteId])
  const pedidos = tFila.filter((f) => f.cliente_id === ctx.clienteId && f.situacao === 'aberto' && f.bola === 'cliente' && f.tipo !== 'pagamento')
  const e = useEmpresaBpo(ctx.clienteId)
  // S08d: conta vencida sem aprovação só gera alerta; o sistema nunca paga sozinho (B3).
  const vencidas = (e?.contas ?? []).filter((c) => contaAberta(c) && diasAte(c.vencimento) < 0)
  const abertos = lotes.filter((l) => l.situacao === 'aguardando' || l.situacao === 'parcial' || l.situacao === 'aprovado')
  const decididos = lotes.filter((l) => !abertos.includes(l))
  return (
    <div className="flex flex-col gap-3">
      <TituloTela voltar={() => ctx.ir('mais')}>Aprovações de pagamento</TituloTela>
      <p className="text-muted-foreground flex items-start gap-2 text-xs">
        <ShieldCheckIcon className="mt-0.5 size-4 shrink-0" /> O escritório prepara e confere; só você aprova. Nenhum pagamento sai sem a sua aprovação.
      </p>
      {pedidos.map((f) => (
        <PedidoDoEscritorio key={f.id} ctx={ctx} id={f.id} />
      ))}
      {vencidas.length > 0 && (
        <div role="alert" className="bg-warning/15 flex items-start gap-2 rounded-[16px] px-3 py-2.5 text-sm">
          <WarningIcon className="text-warning mt-0.5 size-4 shrink-0" weight="fill" />
          <span>
            {vencidas.length === 1 ? `${vencidas[0].contraparte} (${brl(vencidas[0].valor)}) venceu sem aprovação.` : `${vencidas.length} contas venceram sem aprovação (${brl(vencidas.reduce((t, c) => t + c.valor, 0))}).`} Nada foi pago: o escritório nunca paga sem a sua aprovação. Fale com eles para combinar o que fazer.
          </span>
        </div>
      )}
      {lotes.length === 0 && <p className="text-muted-foreground py-6 text-center text-sm">Nenhum pagamento para aprovar.</p>}
      {abertos.map((l) => (
        <CartaoLoteApp key={l.id} l={l} ctx={ctx} />
      ))}
      {decididos.length > 0 && <h2 className="text-muted-foreground mt-2 text-xs font-medium tracking-wide uppercase">Decididos</h2>}
      {decididos.map((l) => (
        <CartaoLoteApp key={l.id} l={l} ctx={ctx} />
      ))}
    </div>
  )
}

/** Pedido do escritório que depende da pessoa: autorizar de novo o ERP, ou mandar o que faltou no pedido. */
function PedidoDoEscritorio({ ctx, id }: { ctx: Ctx; id: string }) {
  const noApp = useNoApp(ctx)
  const avisar = useAvisarEquipe(ctx)
  const f = useTabela('bpo_item_fila').find((x) => x.id === id)
  if (!f) return null
  const autorizar = f.texto.startsWith('Autorizar de novo')
  return (
    <Bloco titulo={autorizar ? f.texto : `O escritório precisa: ${f.faltando.join(', ') || f.texto}`}>
      <p className="text-muted-foreground text-xs">{autorizar ? 'A autorização do seu sistema financeiro venceu. Sem ela o escritório não enxerga as contas novas. Leva um minuto, no site do seu sistema.' : f.texto}</p>
      <Button
        size="sm"
        className="w-fit rounded-full"
        onClick={() => {
          const ok = noApp(() => {
            if (autorizar) {
              const x = banco.ler('bpo_conexao_erp').find((c) => c.cliente_id === ctx.clienteId)
              if (x) repos.bpo.conexoes.atualizar(x.id, { situacao: 'ok', ultima_sincronizacao: agoraBpo() }, { ferramenta: 'erp.autorizar', texto: `${ctx.contato.nome} autorizou de novo o ${x.provedor} pelo app` })
              return repos.bpo.fila.atualizar(f.id, { situacao: 'resolvido', bola: 'bpo' }, { ferramenta: 'erp.autorizar', texto: `Resolvido pelo cliente: ${f.texto}` })
            }
            return repos.bpo.fila.atualizar(f.id, { faltando: [], bola: 'bpo', sla_inicio: agoraBpo() }, { ferramenta: 'fila.responder', texto: `${ctx.contato.nome} mandou pelo app: ${f.faltando.join(', ')}` })
          }, autorizar ? 'Autorizado (demonstração). O escritório volta a ler as contas.' : 'Enviado ao escritório.')
          if (ok) avisar(autorizar ? `${primeiroNome(ctx.contato.nome)} autorizou o ERP de novo` : `${primeiroNome(ctx.contato.nome)} mandou o que faltava`, 'fila')
        }}
      >
        {autorizar ? (
          <>
            <PlugsConnectedIcon /> Autorizar
          </>
        ) : (
          'Enviar'
        )}
      </Button>
    </Bloco>
  )
}

function CartaoLoteApp({ l, ctx }: { l: LoteApp; ctx: Ctx }) {
  const e = useEmpresaBpo(ctx.clienteId)
  const tConfig = useTabela('bpo_configuracao')
  const noApp = useNoApp(ctx)
  const avisar = useAvisarEquipe(ctx)
  const [editando, setEditando] = useState(false)
  const [fora, setFora] = useState<string[]>([])
  const [recusando, setRecusando] = useState(false)
  const [motivo, setMotivo] = useState('')
  const [zap, setZap] = useState<{ codigo: string; digitado: string } | null>(null)
  const tirados = editando ? fora : l.removidos
  const itens = l.itens.filter((i) => !tirados.includes(i.conta))
  const total = itens.reduce((t, i) => t + i.valor, 0)
  const faixa2 = e?.faixa2 ?? 20_000
  const podem = aprovadoresPara(e?.ficha ?? { id: ctx.clienteId, contatos: [ctx.contato], responsaveis: {}, conversas: {} }, total, faixa2)
  const eu = ctx.contato.nome
  const posso = podem.some((p) => p.nome === eu)
  const jaAprovei = l.aprovacoes.some((a) => a.nome === eu)
  const aberto = l.situacao === 'aguardando' || l.situacao === 'parcial'
  const teto = tConfig[0]?.teto_whatsapp ?? 3_000
  const aprovar = (canal: 'app' | 'whatsapp') => {
    const depois = noApp(() => repos.bpo.lotes.aprovar(l.id, eu, editando ? fora : [], canal))
    if (!depois) return
    setEditando(false)
    setZap(null)
    const completo = depois.situacao === 'aprovado'
    avisar(completo ? `${primeiroNome(eu)} aprovou o lote de ${brl(depois.total)}` : `${primeiroNome(eu)} aprovou; falta a segunda aprovação`)
    ctx.avisarApp(completo ? (l.modo_pagamento === 'M1' ? 'Aprovado. Agora libere no seu banco; o escritório confere a baixa.' : 'Aprovado e registrado. O pagamento sai no vencimento.') : 'Aprovação registrada. Falta a segunda pessoa aprovar.')
  }

  return (
    <Bloco titulo={l.titulo}>
      <ul className="flex flex-col gap-2 text-sm">
        {l.itens.map((i) => {
          const tirado = tirados.includes(i.conta)
          return (
            <li key={i.conta} className="flex items-start gap-2">
              {editando && <input type="checkbox" aria-label={`Manter ${i.fornecedor}`} checked={!tirado} onChange={(ev) => setFora((xs) => (ev.target.checked ? xs.filter((x) => x !== i.conta) : [...xs, i.conta]))} className="accent-foreground mt-0.5 size-4 shrink-0" />}
              <span className={cn('min-w-0 flex-1', tirado && 'text-muted-foreground line-through')}>
                <span className="block">{i.fornecedor}</span>
                <span className="text-muted-foreground block text-xs">
                  vence {quando(i.vencimento)} · {e?.fornecedores.find((f) => f.nome === i.fornecedor)?.risco === 'recorrente' ? 'OK (fornecedor recorrente)' : 'conferido pelo escritório'}
                </span>
                {i.alerta && (
                  <span className="text-warning-foreground flex items-start gap-1 text-xs">
                    <WarningIcon className="text-warning mt-0.5 size-3.5 shrink-0" weight="fill" /> {i.alerta}
                  </span>
                )}
              </span>
              <span className={cn('tabular-nums', tirado && 'text-muted-foreground line-through')}>{brl(i.valor)}</span>
            </li>
          )
        })}
      </ul>
      <div className="border-border/70 flex items-end gap-2 border-t pt-2 text-sm">
        <span className="flex-1">
          Total <strong className="font-medium tabular-nums">{brl(total)}</strong>
          <span className="text-muted-foreground block text-xs">
            saldo {brl(l.saldo)} · depois {brl(l.saldo - total)} · expira {quando(l.expira_em.slice(0, 10))}
          </span>
        </span>
      </div>
      {aberto && e && <EscalonamentoApp l={l} e={e} />}
      <p className="text-muted-foreground text-xs">
        Preparado por {l.preparado_por} · conferido por {l.conferido_por}
        {total > faixa2 && ` · acima de ${brl(faixa2)}: ${podem.map((p) => primeiroNome(p.nome)).join(' e ')} aprovam`}
      </p>

      {aberto && !jaAprovei && posso && !recusando && !zap && (
        <div className="flex flex-wrap gap-1.5">
          <Button size="sm" className="rounded-full" onClick={() => aprovar('app')} disabled={itens.length === 0}>
            <CheckIcon /> {editando ? 'Aprovar o que ficou' : 'Aprovar'}
          </Button>
          {!editando && (
            <Button size="sm" variant="outline" className="rounded-full" onClick={() => (setFora([]), setEditando(true))}>
              <PencilSimpleIcon /> Editar e aprovar
            </Button>
          )}
          <Button size="sm" variant="ghost" className="rounded-full" onClick={() => (editando ? setEditando(false) : setRecusando(true))}>
            {editando ? (
              'Cancelar'
            ) : (
              <>
                <XIcon /> Recusar
              </>
            )}
          </Button>
          {!editando && (
            <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setZap({ codigo: String(100000 + Math.floor(Math.random() * 900000)), digitado: '' })}>
              <WhatsappLogoIcon /> Pelo WhatsApp
            </Button>
          )}
          {!editando && (
            <Button size="sm" variant="ghost" className="rounded-full" onClick={() => ctx.abrirConversa('bpo_financeiro')}>
              <ChatCircleIcon /> Perguntar
            </Button>
          )}
        </div>
      )}
      {zap && (
        <div className="bg-sunken/60 flex flex-col gap-2 rounded-[14px] p-3 text-sm" aria-label="Aprovação pelo WhatsApp (simulada)">
          <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <WhatsappLogoIcon /> WhatsApp do escritório · demonstração
          </span>
          {total <= teto ? (
            <>
              <span>
                “{l.titulo}: {brl(total)}. Para aprovar, responda com o código <strong className="font-mono font-medium">{zap.codigo}</strong> (vale uma vez, por 10 minutos).”
              </span>
              <CampoTexto aria-label="Código de uso único" mono valor={zap.digitado} onMudar={(v) => setZap({ ...zap, digitado: v.replace(/\D/g, '').slice(0, 6) })} placeholder="000000" />
              <div className="flex gap-1.5">
                <Button size="sm" className="rounded-full" disabled={zap.digitado !== zap.codigo} onClick={() => aprovar('whatsapp')}>
                  Responder com o código
                </Button>
                <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setZap(null)}>
                  Voltar
                </Button>
              </div>
            </>
          ) : (
            <>
              <span>“{l.titulo}: {brl(total)}. Acima de {brl(teto)} a aprovação é no app, com segundo fator. Toque para abrir.”</span>
              <Button size="sm" variant="outline" className="w-fit rounded-full" onClick={() => setZap(null)}>
                Abrir no app
              </Button>
            </>
          )}
        </div>
      )}
      {recusando && (
        <div className="flex flex-col gap-2">
          <CampoArea valor={motivo} onMudar={setMotivo} placeholder="Por quê? (ex.: a Gráfica Nova eu pago em dezembro)" linhas={2} />
          <div className="flex gap-1.5">
            <Button
              size="sm"
              variant="outline"
              className="rounded-full"
              disabled={!motivo.trim()}
              onClick={() => {
                const ok = noApp(() => repos.bpo.lotes.recusar(l.id, eu, motivo.trim()), 'Recusado. O escritório refaz o lote com o seu motivo.')
                if (ok) {
                  avisar(`${primeiroNome(eu)} recusou o lote`)
                  setRecusando(false)
                }
              }}
            >
              Recusar o lote
            </Button>
            <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setRecusando(false)}>
              Voltar
            </Button>
          </div>
        </div>
      )}
      {aberto && !posso && !jaAprovei && <p className="text-muted-foreground text-xs">Acima da sua alçada ({brl(Math.min(ctx.contato.alcadaPagamento ?? 0, faixa2))}): quem aprova é {podem.map((p) => p.nome).join(' ou ') || 'o sócio'}.</p>}
      {l.situacao === 'parcial' && jaAprovei && (
        <p className="text-muted-foreground text-xs">
          Você aprovou. Falta{' '}
          {podem
            .filter((p) => !l.aprovacoes.some((a) => a.nome === p.nome))
            .map((p) => primeiroNome(p.nome))
            .join(' ou ')}
          .
        </p>
      )}
      {l.situacao === 'aprovado' && (
        <div className="bg-sunken/60 flex flex-col gap-2 rounded-[14px] p-3 text-sm">
          <span>Aprovado por {l.aprovacoes.map((a) => `${primeiroNome(a.nome)} às ${new Date(a.quando).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`).join(' e ')}.</span>
          {l.modo_pagamento === 'M1' ? (
            <>
              <span className="text-muted-foreground text-xs">Agora libere o pagamento no seu banco. O escritório confere a baixa no extrato.</span>
              <Button
                size="sm"
                variant="outline"
                className="w-fit rounded-full"
                onClick={() => {
                  const ok = noApp(() => repos.bpo.lotes.liberar(l.id, eu), 'Anotado. A conciliação confirma cada baixa.')
                  if (ok) avisar(`${primeiroNome(eu)} liberou o lote no banco`)
                }}
              >
                <BankIcon /> Já liberei no banco
              </Button>
            </>
          ) : (
            <span className="text-muted-foreground text-xs">O pagamento sai no vencimento porque você aprovou; o comprovante chega aqui.</span>
          )}
        </div>
      )}
      {l.situacao === 'liberado' && <p className="text-muted-foreground text-xs">Liberado no banco. O escritório confere as baixas na conciliação.</p>}
      {(l.situacao === 'liberado' || (l.situacao === 'aprovado' && l.modo_pagamento === 'M2')) && e && <BaixasApp l={l} contas={e.contas} />}
      {l.situacao === 'recusado' && <p className="text-muted-foreground text-xs">Recusado: {l.motivo}</p>}
      {l.situacao === 'expirado' && <p className="text-muted-foreground text-xs">Expirou sem resposta: nada foi pago. O escritório monta um lote novo.</p>}
    </Bloco>
  )
}

/**
 * S08d · "Se ninguém responder" (10, 3.6 e 14): a linha do tempo do
 * escalonamento do lote, com os horários da empresa. Expirado nunca paga.
 */
function EscalonamentoApp({ l, e }: { l: LoteApp; e: NonNullable<ReturnType<typeof useEmpresaBpo>> }) {
  const esc = e.perfil.escalonamento
  const abre = e.perfil.janela.abertura
  const mais = (h: number) => {
    const [hh, mm] = abre.split(':').map(Number)
    const t = hh + h
    return t >= 18 ? 'abertura do dia útil seguinte' : `${String(t).padStart(2, '0')}:${String(mm || 0).padStart(2, '0')}`
  }
  const proxima = [...l.itens].sort((a, b) => a.vencimento.localeCompare(b.vencimento))[0]
  const passos = [
    { quando: abre, texto: `Cartão para ${esc.aprovador}` },
    { quando: mais(esc.lembrete_h), texto: `Lembrete a ${esc.aprovador}` },
    { quando: mais(esc.substituto_h), texto: esc.substituto ? `Vai ao substituto, ${esc.substituto}, com ${esc.aprovador} em cópia` : 'Sem substituto cadastrado: continua com o aprovador' },
    { quando: proxima ? `véspera de ${quando(proxima.vencimento)}` : 'véspera do vencimento', texto: `Alerta ao Gestor do BPO e a ${esc.socio}, com a lista das contas` },
    { quando: 'vencida', texto: 'Só alerta: nada é pago sem aprovação' },
  ]
  return (
    <details className="text-xs">
      <summary className="text-muted-foreground flex cursor-pointer items-center gap-1.5">
        <ClockCountdownIcon className="size-3.5" /> Se ninguém responder
      </summary>
      <ol className="border-border mt-2 ml-1.5 flex flex-col gap-1.5 border-l pl-3" aria-label="Escalonamento do lote">
        {passos.map((p) => (
          <li key={p.texto}>
            <span className="text-muted-foreground">{p.quando} · </span>
            {p.texto}
          </li>
        ))}
        <li className="text-muted-foreground">O cartão expira {quando(l.expira_em.slice(0, 10))} às {new Date(l.expira_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}.</li>
      </ol>
    </details>
  )
}

/** Depois de liberado (M1) ou agendado (M2): cada conta com a baixa conferida no extrato, que é o comprovante. */
function BaixasApp({ l, contas }: { l: LoteApp; contas: BpoConta[] }) {
  const doLote = l.conta_ids.filter((id) => !l.removidos.includes(id)).map((id) => contas.find((c) => c.id === id)).filter((c): c is BpoConta => !!c)
  if (!doLote.length) return null
  return (
    <ul className="flex flex-col gap-1 text-xs" aria-label="Baixas no extrato">
      {doLote.map((c) => (
        <li key={c.id} className="flex items-center gap-1.5">
          {c.etapa === 'paga' ? <CheckIcon className="text-success size-3.5" /> : <ClockCountdownIcon className="text-muted-foreground size-3.5" />}
          <span className="flex-1">{c.contraparte}</span>
          <span className="text-muted-foreground">{c.etapa === 'paga' ? 'baixa conferida no extrato' : 'esperando a baixa no extrato'}</span>
        </li>
      ))}
    </ul>
  )
}

/** Extrato de volume do BPO (10, 7.2): a empresa vê antes da fatura e pode contestar dentro do prazo. */
function ExtratoVolumeApp({ ctx }: { ctx: Ctx }) {
  const e = useEmpresaBpo(ctx.clienteId)
  const noApp = useNoApp(ctx)
  const avisar = useAvisarEquipe(ctx)
  const [motivo, setMotivo] = useState('')
  const [contestando, setContestando] = useState(false)
  const v = e?.volume
  const enviado = v?.extras?.extrato_enviado_em as string | undefined
  if (!e || !v || !enviado) return null
  const prazo = v.extras?.prazo_contestacao as string | undefined
  const dentro = !prazo || diasAte(prazo) >= 0
  return (
    <Bloco titulo="Extrato do BPO do mês">
      <ul className="flex flex-col gap-1 text-sm">
        {v.itens.map((i) => (
          <li key={i.unidade} className="flex gap-2">
            <span className="min-w-0 flex-1">{i.unidade}</span>
            <span className="tabular-nums">{i.quantidade.toLocaleString('pt-BR')}</span>
          </li>
        ))}
      </ul>
      <span className="text-muted-foreground text-xs">
        Faixa do contrato: {e.perfil.volume.faixa}. {v.situacao === 'faturado' ? 'Já foi para a fatura.' : prazo ? `Pode contestar até ${quando(prazo)}.` : ''}
      </span>
      {v.contestacoes.map((x) => (
        <span key={x.id} className="text-muted-foreground flex items-center gap-1.5 text-xs">
          <ScalesIcon /> {x.quantidade} {x.unidade}: {x.motivo} · {x.situacao === 'aberta' ? 'em análise' : x.situacao === 'aceita' ? 'aceita, sai da fatura' : 'recusada'}
        </span>
      ))}
      {v.situacao !== 'faturado' && dentro && !contestando && (
        <Button size="sm" variant="outline" className="w-fit rounded-full" onClick={() => setContestando(true)}>
          <ScalesIcon /> Contestar
        </Button>
      )}
      {contestando && (
        <div className="flex flex-col gap-2">
          <CampoArea valor={motivo} onMudar={setMotivo} placeholder="O que está errado? (ex.: lançamentos duplicados na semana do dia 10)" linhas={2} />
          <div className="flex gap-1.5">
            <Button
              size="sm"
              className="rounded-full"
              disabled={!motivo.trim()}
              onClick={() => {
                const ok = noApp(() => repos.bpo.volumes.atualizar(v.id, { situacao: 'contestado', contestacoes: [...v.contestacoes, { id: `ct${Date.now().toString(36)}`, unidade: v.itens[0]?.unidade ?? 'lançamentos', quantidade: 1, motivo: motivo.trim(), por: ctx.contato.nome, situacao: 'aberta' }] }, { ferramenta: 'bpo.volume.contestar', texto: `${ctx.contato.nome} contestou o extrato do BPO pelo app: ${motivo.trim()}` }), 'Contestação enviada. A fatura espera a resposta do escritório.')
                if (ok) {
                  avisar(`${primeiroNome(ctx.contato.nome)} contestou o extrato de volume`, 'volume')
                  setContestando(false)
                  setMotivo('')
                }
              }}
            >
              Enviar contestação
            </Button>
            <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setContestando(false)}>
              Voltar
            </Button>
          </div>
        </div>
      )}
    </Bloco>
  )
}

/** App › Fluxo de caixa (S08-A52): saldos lidos do banco, próximos pagamentos, a projeção e o relatório do BPO. */
export function CaixaApp({ ctx }: { ctx: Ctx }) {
  const e = useEmpresaBpo(ctx.clienteId)
  const loja = useLoja()
  const [aberto, setAberto] = useState<string | null>(null)
  const [saldo, setSaldo] = useState<{ estado: 'parado' | 'lendo' | 'erro'; em?: string; erro?: string; demonstracao?: boolean; fonte?: string }>({ estado: 'parado' })
  if (!e)
    return (
      <div className="flex flex-col gap-3">
        <TituloTela voltar={() => ctx.ir('mais')}>Fluxo de caixa</TituloTela>
        <p className="text-muted-foreground py-6 text-center text-sm">O fluxo de caixa aparece quando o BPO financeiro desta empresa começar.</p>
      </div>
    )
  const atualizar = async () => {
    setSaldo({ estado: 'lendo' })
    try {
      const r = await servicos.bancos.saldo(e.bancos[0]?.nome ?? 'conta principal')
      setSaldo({ estado: 'parado', em: agoraBpo(), demonstracao: r.demonstracao, fonte: r.fonte })
    } catch (err) {
      setSaldo({ estado: 'erro', erro: err instanceof ErroServico ? err.message : 'O banco não respondeu.' })
    }
  }
  const proximas = e.contas.filter((c) => !['paga', 'cancelada'].includes(c.etapa)).sort((a, b) => a.vencimento.localeCompare(b.vencimento))
  const relatorios = loja.documentos.filter((d) => d.clienteId === ctx.clienteId && d.tipo === 'relatorio' && d.pasta.join('/').includes('BPO financeiro'))
  const novos = new Set(e.entregas.filter((x) => x.tipo === 'relatorio' && x.situacao === 'enviado').map((x) => x.documento_id))
  return (
    <div className="flex flex-col gap-3">
      <TituloTela voltar={() => ctx.ir('mais')}>Fluxo de caixa</TituloTela>
      <Bloco titulo="Quanto tem hoje">
        <span className="font-heading text-2xl font-light tabular-nums">{brl(e.caixa)}</span>
        {e.caixa < e.perfil.caixa_minimo && (
          <span className="text-warning-foreground flex items-center gap-1 text-xs">
            <WarningIcon className="text-warning size-3.5" weight="fill" /> abaixo do mínimo combinado ({brl(e.perfil.caixa_minimo)})
          </span>
        )}
        <ul className="flex flex-col gap-1 text-sm">
          {e.bancos.map((b) => (
            <li key={b.id} className="flex gap-2">
              <span className="min-w-0 flex-1 truncate">{b.nome}</span>
              <span className="tabular-nums">{brl(b.saldo)}</span>
            </li>
          ))}
        </ul>
        {saldo.estado === 'erro' ? (
          <EstadoErro className="py-4" titulo="Não deu para ler o banco agora" descricao={saldo.erro} onTentar={() => void atualizar()} />
        ) : (
          <span className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
            <span className="flex-1">{saldo.em ? `lido do banco ${dataHora(saldo.em)}` : `lido do banco · ${e.bancos[0] ? quando(e.bancos[0].saldo_em.slice(0, 10)) : ''}`}</span>
            {saldo.demonstracao && <SeloDemonstracao fonte={saldo.fonte} />}
            {e.bancos.length > 0 && (
              <Button size="sm" variant="ghost" className="h-7 rounded-full px-2 text-xs" disabled={saldo.estado === 'lendo'} onClick={() => void atualizar()}>
                <ArrowClockwiseIcon className={cn(saldo.estado === 'lendo' && 'animate-spin')} /> {saldo.estado === 'lendo' ? 'Lendo…' : 'Atualizar'}
              </Button>
            )}
          </span>
        )}
      </Bloco>
      <Bloco titulo="Relatório do BPO">
        {relatorios.length === 0 && <p className="text-muted-foreground text-sm">O relatório do mês chega aqui até o dia 5.</p>}
        <ul className="flex flex-col gap-1.5 text-sm">
          {relatorios.map((d) => (
            <li key={d.id} className="flex flex-col gap-1">
              <button type="button" className="flex cursor-pointer items-center gap-2 text-left" onClick={() => setAberto((x) => (x === d.id ? null : d.id))} aria-expanded={aberto === d.id}>
                <FileTextIcon className="text-muted-foreground size-4 shrink-0" />
                <span className="min-w-0 flex-1 truncate">{d.nome}</span>
                {novos.has(d.id) && <span className="bg-warning/20 rounded-full px-2 py-0.5 text-[11px]">novo</span>}
              </button>
              {aberto === d.id && (
                <span className="bg-sunken/60 text-muted-foreground flex flex-col gap-1.5 rounded-[10px] px-3 py-2 text-xs">
                  {d.dados?.resumo && <span className="text-foreground text-sm">{d.dados.resumo}</span>}
                  <span>Entregáveis › BPO financeiro · competência {d.competencia} · caixa no fim do mês, pagamentos feitos, DRE gerencial, atrasos e riscos.</span>
                  <Button size="sm" variant="outline" className="w-fit rounded-full" onClick={() => ctx.ir('documentos', d.id)}>
                    <FileTextIcon /> Abrir o relatório
                  </Button>
                </span>
              )}
            </li>
          ))}
        </ul>
      </Bloco>
      <ExtratoVolumeApp ctx={ctx} />
      <Bloco titulo="Próximos pagamentos">
        <ul className="flex flex-col gap-1.5 text-sm">
          {proximas.length === 0 && <li className="text-muted-foreground">Nada a pagar.</li>}
          {proximas.map((c) => (
            <li key={c.id} className="flex gap-2">
              <span className="min-w-0 flex-1">
                <span className="block truncate">{c.contraparte}</span>
                <span className="text-muted-foreground block text-xs">vence {quando(c.vencimento)}</span>
              </span>
              <span className="tabular-nums">{brl(c.valor)}</span>
            </li>
          ))}
        </ul>
      </Bloco>
      <Bloco titulo="Próximos meses">
        <FluxoMensal altura="h-32" d={{ meses: ['set', 'out', 'nov', 'dez', 'jan', 'fev'], entradas: e.perfil.fluxo.entradas, saidas: e.perfil.fluxo.saidas, inicio: 2, marcos: [{ mes: 3, texto: '13º e férias' }] }} />
      </Bloco>
    </div>
  )
}

/** Proposta de alçadas do escritório (S08-A51): só vale depois do aceite de quem responde pela empresa. */
export function PropostaAlcadaApp({ ctx }: { ctx: Ctx }) {
  const tAlcada = useTabela('bpo_alcada')
  const noApp = useNoApp(ctx)
  const avisar = useAvisarEquipe(ctx)
  const p = tAlcada.find((a) => a.cliente_id === ctx.clienteId && a.situacao === 'proposta')
  if (!p || !ctx.contato.reforcada) return null
  const modo = p.extras?.modo_pagamento as string | undefined
  const hoje = tAlcada.find((a) => a.cliente_id === ctx.clienteId && a.situacao === 'vigente')
  const antes = (v: number | undefined, depois: number) => (v !== undefined && v !== depois ? <span className="text-muted-foreground text-xs line-through">{brl(v)}</span> : null)
  return (
    <Bloco titulo="O escritório propôs novas alçadas de pagamento">
      <ul className="flex flex-col gap-1 text-sm">
        <li>
          Até {antes(hoje?.faixa1, p.faixa1)} {brl(p.faixa1)}: 1 aprovador
        </li>
        <li>
          Até {antes(hoje?.faixa2, p.faixa2)} {brl(p.faixa2)}: 1 aprovador com alçada
        </li>
        <li>Acima de {brl(p.faixa2)}: duas pessoas aprovam</li>
        <li>Janela: {p.janela}</li>
        {modo && <li>Modo de pagamento: {modo === 'M2' ? `pagamento agendado por API depois da sua aprovação (até ${brl(Number(p.extras?.teto_m2 ?? 0))})` : 'você libera no seu banco depois de aprovar'}</li>}
        {Object.entries(p.pessoas)
          .filter(([, v]) => v > 0)
          .map(([n, v]) => (
            <li key={n} className="text-muted-foreground text-xs">
              {n} aprova até {brl(v)}
            </li>
          ))}
      </ul>
      <p className="text-muted-foreground text-xs">Proposta por {p.proposta_por_nome}{hoje ? '; os valores riscados são os de hoje' : ''}. Nada muda até você aceitar. Quem propôs não confere nem aprova pagamentos da sua empresa.</p>
      <div className="flex gap-1.5">
        <Button
          size="sm"
          className="rounded-full"
          onClick={() => {
            const ok = noApp(() => repos.bpo.alcadas.aceitar(p.id, ctx.contato.nome), 'Alçadas aceitas. Valem a partir do próximo lote.')
            if (ok) avisar(`${primeiroNome(ctx.contato.nome)} aceitou as novas alçadas`, 'configuracao')
          }}
        >
          <CheckIcon /> Aceitar
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="rounded-full"
          onClick={() => {
            const ok = noApp(() => repos.bpo.alcadas.recusar(p.id, ctx.contato.nome), 'Proposta recusada. As alçadas de antes continuam valendo.')
            if (ok) avisar(`${primeiroNome(ctx.contato.nome)} recusou a proposta de alçadas`, 'configuracao')
          }}
        >
          <XIcon /> Recusar
        </Button>
      </div>
    </Bloco>
  )
}

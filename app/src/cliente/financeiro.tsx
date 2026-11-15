import { ArrowsClockwiseIcon, BarcodeIcon, CheckCircleIcon, FileTextIcon, PauseCircleIcon, QrCodeIcon, WalletIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { useLoja, usePersistente } from '@/ambiente/loja'
import { EstadoErro, EstadoVazio, SeloDemonstracao } from '@/components/kit'
import { Button } from '@/components/ui/button'
import { contratosDoCenario, faturasDoCenario, rotuloFatura, type Fatura } from '@/dados/financeiro'
import { servicos } from '@/servicos'
import { ator, type Ctx } from './contexto'
import { agoraTexto, brl, informeAnual } from './dados'
import { useFinanceiroApp } from './estado'
import { AreaTexto, BotaoCopiar, Bloco, Chip, Chips, Faixa, Folha, QrFicticio, Selo, TituloTela, type Tom } from './pecas'
import { autorizarPixAutomatico, cancelarPixAutomatico } from './simulados'

/**
 * S10-T08 · Financeiro com o escritório (09, 10.8; 06, 3.8 e ad. 21). As
 * mesmas faturas do Financeiro do escritório (S07): uma fatura por mês, os
 * serviços em linhas e uma NFS-e por serviço; status sem a palavra
 * "inadimplente"; pagar por Pix ou boleto (simulados), 2ª via com juros e
 * multa, "pago" informado, Pix Automático, contestação que vira tarefa do
 * Financeiro e pausa a régua, informe anual. Nada de margem, horas ou custo.
 */

const tomFatura = (s: Fatura['situacao']): Tom => (s === 'paga' ? 'ok' : s === 'vencida' ? 'erro' : s === 'em_acordo' ? 'atencao' : 'neutro')

/** 2ª via (09, 10.8): multa de 2% e juros de 1% ao mês, pro rata, com vencimento novo em 3 dias. */
export const segundaVia = (f: Fatura) => {
  const dias = f.diasAtraso ?? 5
  const multa = Math.round(f.valor * 0.02 * 100) / 100
  const juros = Math.round(((f.valor * 0.01) / 30) * dias * 100) / 100
  return { multa, juros, total: Math.round((f.valor + multa + juros) * 100) / 100, vencimento: '21/11', dias }
}

export function Financeiro({ ctx }: { ctx: Ctx }) {
  const loja = useLoja()
  // As mesmas faturas do Financeiro do escritório, com o que foi pago ou corrigido lá nesta sessão.
  const [todas, setTodas] = usePersistente(`fin.faturas.${loja.estado.cenario}`, () => faturasDoCenario(loja.estado.cenario))
  const [estado, setEstado] = useFinanceiroApp(ctx.clienteId)
  const [filtro, setFiltro] = useState<'abertas' | 'todas'>('abertas')
  const [pagar, setPagar] = useState<Fatura | null>(null)
  const [contestar, setContestar] = useState<Fatura | null>(null)
  const [informe, setInforme] = useState(false)
  const [pixAuto, setPixAuto] = useState<'autorizar' | 'cancelar' | null>(null)
  const contrato = contratosDoCenario(loja.estado.cenario).find((c) => c.cliente === ctx.clienteNome)
  const minhas = todas.filter((f) => f.cliente === ctx.clienteNome)
  const lista = minhas.filter((f) => filtro === 'todas' || (f.situacao !== 'paga' && f.situacao !== 'cancelada'))
  const pixAtivo = estado.pixAutomatico?.situacao === 'ativo' || (contrato?.forma === 'pix_automatico' && estado.pixAutomatico?.situacao !== 'cancelado')
  const mensal = contrato?.itens.reduce((t, i) => t + i.valor, 0) ?? 0

  /** Anota na fatura do escritório (histórico e régua), para o Financeiro ver o mesmo. */
  const anotar = (id: string, texto: string, patch: Partial<Fatura> = {}) => setTodas((l) => l.map((f) => (f.id === id ? { ...f, ...patch, historico: [...f.historico, { quando: agoraTexto(), texto }] } : f)))

  if (!ctx.areas.includes('financeiro')) return <EstadoVazio icone={WalletIcon} titulo="Esta área não é do seu papel" descricao="Honorários e boletos do escritório ficam com o sócio e o financeiro da empresa." />

  return (
    <div className="flex flex-col gap-4">
      <TituloTela voltar={() => ctx.ir('mais')}>Financeiro com o escritório</TituloTela>
      {contrato && (
        <Bloco titulo="Contrato" acao={<Selo tom={contrato.situacao === 'reajuste_agendado' ? 'atencao' : 'ok'}>{contrato.situacao === 'reajuste_agendado' ? 'reajuste agendado' : 'vigente'}</Selo>}>
          <ul className="flex flex-col gap-1 text-sm">
            {contrato.itens.map((i) => (
              <li key={i.id} className="flex gap-2">
                <span className="min-w-0 flex-1">
                  {i.descricao}
                  {i.faixa && <span className="text-muted-foreground text-xs"> · {i.faixa}</span>}
                </span>
                <span className="tabular-nums">{brl(i.valor)}</span>
              </li>
            ))}
          </ul>
          <p className="text-muted-foreground text-xs">
            Total {brl(mensal)} por mês · vence todo dia {contrato.vencimentoDia} · próximo reajuste em {contrato.dataBase} pelo {contrato.indice} · versão {contrato.versao} desde {contrato.vigenteDesde}
          </p>
        </Bloco>
      )}

      <Bloco
        titulo="Pix Automático"
        acao={pixAtivo ? <Selo tom="ok">ativo</Selo> : <Selo>desligado</Selo>}
      >
        {pixAtivo ? (
          <>
            <p className="text-sm">
              A fatura sai sozinha da conta {estado.pixAutomatico?.banco ?? 'cadastrada'} no vencimento{estado.pixAutomatico ? `, até ${brl(estado.pixAutomatico.limite)} por mês (desde ${estado.pixAutomatico.desde})` : ''}.
            </p>
            {!ctx.leitura && (
              <Button size="sm" variant="ghost" className="w-fit rounded-full" onClick={() => setPixAuto('cancelar')}>
                Cancelar Pix Automático
              </Button>
            )}
          </>
        ) : (
          <>
            <p className="text-muted-foreground text-xs">Autorize uma vez no seu banco e a fatura é paga no vencimento, sem boleto. Você vê e cancela aqui quando quiser.</p>
            {!ctx.leitura && (
              <Button size="sm" variant="outline" className="w-fit rounded-full" onClick={() => setPixAuto('autorizar')}>
                <ArrowsClockwiseIcon /> Autorizar Pix Automático
              </Button>
            )}
          </>
        )}
      </Bloco>

      <Chips rotulo="Filtrar faturas">
        <Chip ativo={filtro === 'abertas'} onClick={() => setFiltro('abertas')}>
          Em aberto
        </Chip>
        <Chip ativo={filtro === 'todas'} onClick={() => setFiltro('todas')}>
          Todas
        </Chip>
      </Chips>
      {lista.length === 0 && <EstadoVazio compacto icone={CheckCircleIcon} titulo={minhas.length ? 'Nada em aberto' : 'Nenhuma fatura neste ano'} descricao={minhas.length ? 'Tudo pago com o escritório.' : undefined} />}
      {lista.map((f) => {
        const contestada = estado.contestadas[f.id]
        const informada = estado.informadas.includes(f.id)
        const via = estado.segundasVias[f.id]
        return (
          <Bloco
            key={f.id}
            id={`fatura-${f.id}`}
            titulo={f.linhas ? `Fatura ${f.competencia}` : `Honorários ${f.competencia}`}
            acao={<Selo tom={informada && f.situacao !== 'paga' ? 'info' : tomFatura(f.situacao)}>{informada && f.situacao !== 'paga' ? 'pagamento informado' : rotuloFatura[f.situacao]}</Selo>}
          >
            <p className="text-sm">
              {brl(f.valor)} · vence {f.vencimento}
              {f.pagaEm ? ` · paga em ${f.pagaEm}` : ''}
            </p>
            {/* Um pagamento só no mês; os serviços em linhas e a nota de cada um (decisão de 8/11/2026). */}
            {f.linhas && (
              <ul className="text-muted-foreground flex flex-col gap-1 text-xs">
                {f.linhas.map((l) => {
                  const nota = f.notas?.find((n) => n.servicos.includes(l.servico))
                  const pausada = contestada && contestada.motivo.toLowerCase().includes(l.servico.split(' ')[0].toLowerCase())
                  return (
                    <li key={l.servico} className="flex gap-2">
                      <span className="min-w-0 flex-1">
                        {l.servico}
                        {nota && ` · NFS-e ${nota.numero}`}
                        {pausada && ' · em espera'}
                      </span>
                      <span className="text-foreground tabular-nums">{brl(l.valor)}</span>
                    </li>
                  )
                })}
              </ul>
            )}
            {!f.linhas && f.nfse === 'emitida' && <p className="text-muted-foreground text-xs">NFS-e emitida pelo escritório para este serviço.</p>}
            {contestada && (
              <Faixa tom="atencao" icone={<PauseCircleIcon weight="fill" />}>
                {f.linhas && f.linhas.length > 1 ? 'Pausa parcial: o item contestado fica em espera; o resto segue a cobrança normal.' : 'Contestação em análise: a cobrança desta fatura está pausada.'} Motivo: “{contestada.motivo}” ({contestada.em}).
              </Faixa>
            )}
            {via && <p className="text-xs">2ª via gerada em {via.em}: {brl(via.valor)}, vence {via.vencimento}.</p>}
            {f.situacao !== 'paga' && f.situacao !== 'cancelada' && !ctx.leitura && (
              <div className="flex flex-wrap gap-2">
                <Button size="sm" className="rounded-full" onClick={() => setPagar(f)}>
                  Pagar
                </Button>
                {!informada && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => {
                      setEstado((e) => ({ ...e, informadas: [...e.informadas, f.id] }))
                      anotar(f.id, `${ctx.contato.nome} informou o pagamento pelo app (cobranca.pagamento.informado); a régua pausa até a conciliação`)
                      loja.registrar(ator(ctx), `Informou o pagamento da fatura ${f.competencia} (${ctx.clienteNome})`)
                      ctx.avisarApp('Anotado. A régua para; a baixa confirma quando o pagamento cair na conta do escritório.')
                    }}
                  >
                    Já paguei
                  </Button>
                )}
                {!contestada && (
                  <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setContestar(f)}>
                    Contestar
                  </Button>
                )}
              </div>
            )}
          </Bloco>
        )
      })}

      <Button variant="outline" className="rounded-full" onClick={() => setInforme(true)}>
        <FileTextIcon /> Informe anual de pagamentos e retenções
      </Button>
      <p className="text-muted-foreground text-xs">Um pagamento por mês. Cada serviço tem a sua NFS-e do escritório.</p>

      {pagar && <FolhaPagar f={pagar} ctx={ctx} onFechar={() => setPagar(null)} onSegundaVia={(v) => {
        setEstado((e) => ({ ...e, segundasVias: { ...e.segundasVias, [pagar.id]: { valor: v.total, vencimento: v.vencimento, em: agoraTexto() } } }))
        anotar(pagar.id, `${ctx.contato.nome} gerou a 2ª via pelo app: ${brl(v.total)} com multa e juros, vence ${v.vencimento}`)
      }} />}
      {contestar && (
        <FolhaContestar
          f={contestar}
          onFechar={() => setContestar(null)}
          onEnviar={(motivo) => {
            const id = loja.criarTarefa({ codigo: 'FIN-011', titulo: `Contestação da fatura ${contestar.competencia}: ${motivo}`, cliente: ctx.clienteNome, setor: 'financeiro_escritorio', prazo: '20/11', status: 'a_fazer', origem: 'pedido_cliente', responsavel: { tipo: 'pessoa', nome: 'Fernanda Lima' } })
            setEstado((e) => ({ ...e, contestadas: { ...e.contestadas, [contestar.id]: { motivo, em: agoraTexto(), tarefaId: id } } }))
            anotar(contestar.id, `${ctx.contato.nome} contestou pelo app: “${motivo}”. Régua pausada até a resposta (FIN-011)`, { etapaRegua: 'pausada: contestação do cliente' })
            loja.avisar({ para: ['u1'], tipo: 'cliente', setor: 'financeiro_escritorio', titulo: `${ctx.clienteNome} contestou a fatura ${contestar.competencia}`, detalhe: `${ctx.contato.nome} pelo app · ${motivo.slice(0, 60)}`, destino: { modulo: 'financeiro', aba: 'cobranca', fatura: contestar.id } })
            loja.registrar(ator(ctx), `Contestou a fatura ${contestar.competencia} (${ctx.clienteNome}): ${motivo}`)
            ctx.avisarApp('Contestação enviada; a régua desta fatura pausa até a resposta.')
            setContestar(null)
          }}
        />
      )}
      {informe && <FolhaInforme ctx={ctx} mensal={mensal || 1200} onFechar={() => setInforme(false)} />}
      {pixAuto && (
        <FolhaPixAutomatico
          acao={pixAuto}
          limite={Math.ceil((mensal || 1500) * 1.2)}
          onFechar={() => setPixAuto(null)}
          onFeito={(r) => {
            if (pixAuto === 'autorizar') setEstado((e) => ({ ...e, pixAutomatico: { situacao: 'ativo', desde: agoraTexto(), limite: r?.limite ?? mensal, banco: r?.banco ?? 'Itaú' } }))
            else setEstado((e) => ({ ...e, pixAutomatico: { ...(e.pixAutomatico ?? { desde: agoraTexto(), limite: mensal, banco: 'Itaú' }), situacao: 'cancelado' } }))
            loja.registrar(ator(ctx), `${pixAuto === 'autorizar' ? 'Autorizou' : 'Cancelou'} o Pix Automático dos honorários (${ctx.clienteNome})`)
            loja.avisar({ para: ['u1'], tipo: 'cliente', setor: 'financeiro_escritorio', titulo: `${ctx.clienteNome} ${pixAuto === 'autorizar' ? 'autorizou' : 'cancelou'} o Pix Automático`, detalhe: ctx.contato.nome, destino: { modulo: 'financeiro', aba: 'contratos' } })
            ctx.avisarApp(pixAuto === 'autorizar' ? 'Pix Automático autorizado.' : 'Pix Automático cancelado. As próximas faturas vêm com Pix e boleto.')
            setPixAuto(null)
          }}
        />
      )}
    </div>
  )
}

function FolhaPagar({ f, ctx, onFechar, onSegundaVia }: { f: Fatura; ctx: Ctx; onFechar: () => void; onSegundaVia: (v: ReturnType<typeof segundaVia>) => void }) {
  const [modo, setModo] = useState<'pix' | 'boleto'>('pix')
  const [pix, setPix] = useState<{ copia: string; fonte: string } | null>(null)
  const [boleto, setBoleto] = useState<{ linha: string; fonte: string } | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(false)
  const via = f.situacao === 'vencida' ? segundaVia(f) : null
  const valor = via?.total ?? f.valor
  const gerar = (m: 'pix' | 'boleto') => {
    setCarregando(true)
    setErro(null)
    const p =
      m === 'pix'
        ? servicos.pix.cobrar({ valor, descricao: `Honorários ${f.competencia} · ${ctx.clienteNome}` }).then((r) => setPix({ copia: r.dados.copia_e_cola, fonte: r.fonte }))
        : servicos.bancos.emitirBoleto({ pagador: ctx.clienteNome, valor, vencimento: via?.vencimento ?? f.vencimento }).then((r) => setBoleto({ linha: r.dados.linha_digitavel, fonte: r.fonte }))
    p.then(() => {
      if (via) onSegundaVia(via)
    })
      .catch((e: Error) => setErro(e.message))
      .finally(() => setCarregando(false))
  }
  return (
    <Folha titulo={`Pagar ${f.competencia}`} onFechar={onFechar}>
      {via && (
        <div className="bg-sunken rounded-md px-3 py-2 text-xs">
          <p className="font-medium">2ª via atualizada ({via.dias} dias de atraso)</p>
          <p>
            Original {brl(f.valor)} + multa {brl(via.multa)} + juros {brl(via.juros)} = <strong className="font-medium">{brl(via.total)}</strong>, vence {via.vencimento}.
          </p>
        </div>
      )}
      <div className="bg-sunken grid grid-cols-2 gap-1 rounded-full p-1 text-xs">
        {(
          [
            ['pix', 'Pix', QrCodeIcon],
            ['boleto', 'Boleto', BarcodeIcon],
          ] as const
        ).map(([v, r, I]) => (
          <button key={v} type="button" aria-pressed={modo === v} onClick={() => setModo(v)} className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-full px-2 py-1.5 ${modo === v ? 'bg-raised shadow-pilula font-medium' : ''}`}>
            <I className="size-3.5" /> {r}
          </button>
        ))}
      </div>
      {erro && <EstadoErro titulo="O banco não respondeu" descricao={erro} onTentar={() => gerar(modo)} />}
      {modo === 'pix' &&
        (pix ? (
          <div className="flex flex-col items-center gap-2">
            <QrFicticio codigo={pix.copia} />
            <code className="bg-sunken w-full rounded-md px-3 py-2 text-[10px] break-all">{pix.copia}</code>
            <div className="flex items-center gap-2">
              <BotaoCopiar texto={pix.copia} rotulo="Copiar Pix" aoCopiar={() => ctx.avisarApp('Código Pix copiado.')} />
              <SeloDemonstracao fonte={pix.fonte} />
            </div>
          </div>
        ) : (
          <Button className="rounded-full" disabled={carregando} onClick={() => gerar('pix')}>
            {carregando ? 'Gerando…' : `Gerar Pix de ${brl(valor)}`}
          </Button>
        ))}
      {modo === 'boleto' &&
        (boleto ? (
          <div className="flex flex-col gap-2">
            <code className="bg-sunken rounded-md px-3 py-2 text-xs break-all">{boleto.linha}</code>
            <div className="flex items-center gap-2">
              <BotaoCopiar texto={boleto.linha} rotulo="Copiar código" />
              <SeloDemonstracao fonte={boleto.fonte} />
            </div>
          </div>
        ) : (
          <Button className="rounded-full" disabled={carregando} onClick={() => gerar('boleto')}>
            {carregando ? 'Gerando…' : `Gerar boleto de ${brl(valor)}`}
          </Button>
        ))}
      <p className="text-muted-foreground text-xs">O pagamento é conferido pela conciliação do escritório; a fatura muda para "paga" quando o dinheiro cai.</p>
    </Folha>
  )
}

function FolhaContestar({ f, onFechar, onEnviar }: { f: Fatura; onFechar: () => void; onEnviar: (motivo: string) => void }) {
  const [motivo, setMotivo] = useState('')
  return (
    <Folha
      titulo={`Contestar ${f.competencia}`}
      onFechar={onFechar}
      rodape={
        <Button className="rounded-full" disabled={motivo.trim().length < 5} onClick={() => onEnviar(motivo.trim())}>
          Enviar contestação
        </Button>
      }
    >
      <p className="text-sm">Conte o que não confere. Vai para uma pessoa do Financeiro do escritório, e a cobrança desta fatura pausa até a resposta.</p>
      {f.linhas && <p className="text-muted-foreground text-xs">Se for um serviço só (ex.: {f.linhas[0].servico}), cite o nome: o resto da fatura segue (pausa parcial).</p>}
      <AreaTexto rotulo="Motivo" valor={motivo} onMudar={setMotivo} placeholder="Ex.: o serviço avulso de outubro já foi pago" />
    </Folha>
  )
}

function FolhaInforme({ ctx, mensal, onFechar }: { ctx: Ctx; mensal: number; onFechar: () => void }) {
  const inf = informeAnual(ctx.clienteNome, mensal)
  const total = inf.pagamentos.reduce((t, p) => t + p.valor, 0)
  const [pdf, setPdf] = useState(false)
  return (
    <Folha
      titulo={`Informe ${inf.ano}`}
      onFechar={onFechar}
      rodape={
        <Button
          variant="outline"
          className="rounded-full"
          onClick={() => {
            setPdf(true)
            ctx.registrar(`Baixou o informe anual ${inf.ano} de pagamentos e retenções`)
          }}
        >
          {pdf ? 'PDF baixado' : 'Baixar PDF'}
        </Button>
      }
    >
      <p className="text-muted-foreground text-xs">Pagamentos ao escritório e retenções na fonte em {inf.ano}, para a contabilidade da empresa (GES-008).</p>
      <table className="w-full text-xs">
        <tbody>
          {inf.pagamentos.map((p) => (
            <tr key={p.mes}>
              <td className="py-0.5">{p.mes}</td>
              <td className="py-0.5 text-right tabular-nums">{brl(p.valor)}</td>
            </tr>
          ))}
          <tr className="border-t font-medium">
            <td className="pt-1">Total pago</td>
            <td className="pt-1 text-right tabular-nums">{brl(total)}</td>
          </tr>
          {inf.retencoes.map((r) => (
            <tr key={r.tributo}>
              <td className="py-0.5">Retido: {r.tributo}</td>
              <td className="py-0.5 text-right tabular-nums">{brl(r.valor)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Folha>
  )
}

function FolhaPixAutomatico({ acao, limite, onFechar, onFeito }: { acao: 'autorizar' | 'cancelar'; limite: number; onFechar: () => void; onFeito: (r?: { banco: string; limite: number }) => void }) {
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const fazer = () => {
    setCarregando(true)
    setErro(null)
    ;(acao === 'autorizar' ? autorizarPixAutomatico(limite).then((r) => onFeito({ banco: r.dados.banco, limite: r.dados.limite })) : cancelarPixAutomatico().then(() => onFeito()))
      .catch((e: Error) => setErro(e.message))
      .finally(() => setCarregando(false))
  }
  return (
    <Folha
      titulo={acao === 'autorizar' ? 'Autorizar Pix Automático' : 'Cancelar Pix Automático'}
      onFechar={onFechar}
      rodape={
        <Button className="rounded-full" variant={acao === 'cancelar' ? 'destructive' : 'default'} disabled={carregando} onClick={fazer}>
          {carregando ? (acao === 'autorizar' ? 'Abrindo o banco…' : 'Cancelando…') : acao === 'autorizar' ? 'Autorizar no meu banco' : 'Cancelar'}
        </Button>
      }
    >
      {acao === 'autorizar' ? (
        <p className="text-sm">Você vai para o app do seu banco e autoriza a cobrança dos honorários do escritório até {brl(limite)} por mês. Dá para cancelar aqui ou no banco a qualquer momento.</p>
      ) : (
        <p className="text-sm">As próximas faturas voltam a vir com Pix e boleto. O que já foi pago não muda.</p>
      )}
      {erro && <EstadoErro titulo="O banco não respondeu" descricao={erro} onTentar={fazer} />}
      <SeloDemonstracao fonte="Pix Automático (banco do cliente)" />
    </Folha>
  )
}

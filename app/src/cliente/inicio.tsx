import { AndroidLogoIcon, AppleLogoIcon, BellRingingIcon, ChatCircleDotsIcon, CheckCircleIcon, DeviceMobileIcon, DownloadSimpleIcon, FileTextIcon, ListChecksIcon, MegaphoneIcon, PaperclipIcon, PenNibIcon, ReceiptIcon, SealCheckIcon, ShareIcon, ShieldCheckIcon, SparkleIcon, WalletIcon, WarningIcon } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { useLoja, usePersistente } from '@/ambiente/loja'
import { SeloDemonstracao } from '@/components/kit'
import { Button } from '@/components/ui/button'
import { fiscalDe } from '@/dados/painel'
import { societarioDe } from '@/dados/painel-abas'
import { faturasDoCenario, type Fatura } from '@/dados/financeiro'
import { useTema } from '@/theme/ThemeProvider'
import { PropostaAlcadaApp, useLotesAbertos } from './bpo'
import { useContagemPorEmpresa } from './ClienteApp'
import { oQueMandar, primeiroNome, useNomeEscritorio, type Ctx, type PessoaApp } from './contexto'
import { agoraTexto, brl, comunicados, implantacaoPorCliente, textosDoApp } from './dados'
import { estadoDoc, useDocsDoCliente, useEntrega } from './documentos'
import { useAcesso, useAssinaturas, useEstadoPendencias, useGuiasInformadas, usePedidosExtra } from './estado'
import { defDoItem, usePendencias } from './pendencias'
import { Bloco, Faixa, Folha, Progresso, Selo } from './pecas'
import { exportarTudo, registrarPush } from './simulados'
import { useServicos } from './servicos'

/**
 * S10-T02 · Início (06, 3.2). Blocos vazios somem; sem nada, "tudo em dia"
 * com o texto do tema. Pendência envia em um toque; guia tem "guia" e "pago"
 * (pagamento informado pausa a régua sem substituir a conciliação).
 */

let tocouNoApp = false

export function Inicio({ ctx, pessoa }: { ctx: Ctx; pessoa: PessoaApp }) {
  const loja = useLoja()
  const { tema } = useTema()
  const nomeEscritorio = useNomeEscritorio()
  const textos = textosDoApp(tema, nomeEscritorio)
  const servicosAtivos = useServicos(ctx).ativos
  const pend = usePendencias(ctx)
  const [estados] = useEstadoPendencias(ctx.clienteId)
  const [assinaturas] = useAssinaturas(ctx.clienteId)
  const [informadas, setInformadas] = useGuiasInformadas(ctx.clienteId)
  const [extras] = usePedidosExtra(ctx.clienteId)
  const docs = useDocsDoCliente(ctx)
  const entrega = useEntrega(ctx)
  const contagem = useContagemPorEmpresa(pessoa)
  const lotes = useLotesAbertos(ctx)
  const fis = fiscalDe(ctx.clienteId)
  const cert = societarioDe(ctx.clienteId).certificados[0]
  const [faturas] = usePersistente(`fin.faturas.${loja.estado.cenario}`, () => faturasDoCenario(loja.estado.cenario))

  const abertas = pend.filter((t) => !['recebida', 'em_conferencia', 'ja_fiz'].includes(estados[t.id]?.situacao ?? ''))
  const guias = ctx.areas.includes('guias') ? fis.guias.filter((g) => !g.paga && g.valor !== '—') : []
  const docDaGuia = (tributo: string, competencia: string) => docs.find((d) => d.tipo === 'guia' && d.dados?.tributo === tributo && d.competencia === competencia)
  const honorarios: Fatura[] = ctx.areas.includes('financeiro') ? faturas.filter((f) => f.cliente === ctx.clienteNome && f.situacao !== 'paga' && f.situacao !== 'cancelada') : []
  const novos = docs.filter((d) => estadoDoc(d, ctx.contato.nome) === 'novo' && d.origem !== 'upload_cliente_app')
  const pedidos = loja.tarefas.filter((t) => t.cliente === ctx.clienteNome && t.origem === 'pedido_cliente' && t.status !== 'concluida' && t.status !== 'cancelada')
  const aguardandoVoce = pedidos.filter((t) => t.status === 'aguardando_cliente' || (extras[t.id]?.avulso && !extras[t.id]?.avulso?.autorizado && !extras[t.id]?.avulso?.recusado))
  const respostaNova = loja.conversas.some((c) => c.clienteId === ctx.clienteId && ctx.setores.includes(c.setor) && c.itens.at(-1)?.tipo === 'mensagem' && (c.itens.at(-1) as { de?: string }).de !== 'cliente')
  const avisosEscritorio = comunicados.filter((c) => c.assunto === 'comunicados' || ctx.contato.assuntos.includes(c.assunto) || (c.assunto === 'guias' && ctx.areas.includes('guias')))
  const paraAssinar = assinaturas.filter((a) => a.situacao === 'aguardando')
  const implantacao = implantacaoPorCliente[ctx.clienteId]
  const outras = pessoa.empresas.filter((e) => e.clienteId !== ctx.clienteId)
  const pendOutras = outras.reduce((t, e) => t + (contagem[e.clienteId]?.pendencias ?? 0), 0)
  const vazio = !abertas.length && !guias.length && !lotes.length && !novos.length && !paraAssinar.length && !honorarios.length && !aguardandoVoce.length

  return (
    <div className="flex flex-col gap-3">
      <p className="text-lg font-light">
        Olá, {primeiroNome(pessoa.nome)}. Hoje é 18/11.
      </p>
      {ctx.leitura && <ModoLeitura ctx={ctx} total={docs.length} />}
      {!ctx.leitura && <Instalar ctx={ctx} />}

      {servicosAtivos.length > 0 && !ctx.leitura && (
        <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-0.5">
          {servicosAtivos.map((sv) => (
            <button key={sv.id} type="button" onClick={() => ctx.abrirServico(sv.id)} className="bg-surface shadow-cartao flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs whitespace-nowrap">
              <SparkleIcon className="size-3.5" /> {sv.atalho ?? sv.nome}
            </button>
          ))}
        </div>
      )}

      {implantacao && (
        <Bloco titulo={`Implantação: ${implantacao.filter((i) => i.enviado).length} de ${implantacao.length} itens enviados`}>
          <Progresso valor={implantacao.filter((i) => i.enviado).length} total={implantacao.length} rotulo="Itens da implantação enviados" />
          <ul className="flex flex-col gap-1 text-xs">
            {implantacao.map((i) => (
              <li key={i.item} className="flex items-center gap-1.5">
                {i.enviado ? <CheckCircleIcon className="text-success size-3.5 shrink-0" weight="fill" /> : <span className="border-muted-foreground size-3.5 shrink-0 rounded-full border" aria-hidden />}
                <span className={i.enviado ? 'text-muted-foreground' : ''}>{i.item}</span>
              </li>
            ))}
          </ul>
        </Bloco>
      )}

      {abertas.length > 0 && !ctx.leitura && (
        <Bloco titulo={`O escritório precisa de você (${abertas.length})`}>
          {abertas.map((t) => {
            const tipo = defDoItem(t).tipo
            return (
              <div key={t.id} className="flex items-center gap-2 text-sm">
                <span className="min-w-0 flex-1">
                  <span className="block">{oQueMandar(t)}</span>
                  <span className="text-muted-foreground block text-xs">
                    {t.diasAguardando ? `há ${t.diasAguardando} dias` : 'hoje'}
                    {estados[t.id]?.situacao === 'devolvida' && ' · devolvido, mande de novo'}
                  </span>
                </span>
                <Button size="sm" variant="outline" className="rounded-full" onClick={() => ctx.ir('pendencias', t.id)}>
                  {tipo === 'documento' ? (
                    <>
                      <PaperclipIcon /> Enviar
                    </>
                  ) : tipo === 'informacao' ? (
                    'Preencher'
                  ) : tipo === 'assinatura' ? (
                    'Ciência'
                  ) : (
                    'Ver'
                  )}
                </Button>
              </div>
            )
          })}
        </Bloco>
      )}

      {paraAssinar.length > 0 && !ctx.leitura && (
        <Bloco titulo={`Para assinar (${paraAssinar.length})`}>
          {paraAssinar.map((a) => (
            <div key={a.id} className="flex items-center gap-2 text-sm">
              <PenNibIcon className="text-muted-foreground size-5 shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="block">{a.titulo}</span>
                <span className="text-muted-foreground block text-xs">
                  {a.origem}
                  {a.prazo ? ` · até ${a.prazo.slice(0, 5)}` : ''}
                </span>
              </span>
              <Button size="sm" className="rounded-full" onClick={() => ctx.ir('assinaturas', a.id)}>
                Assinar
              </Button>
            </div>
          ))}
        </Bloco>
      )}

      {ctx.areas.includes('bpo') && !ctx.leitura && <PropostaAlcadaApp ctx={ctx} />}
      {ctx.areas.includes('bpo') && lotes.length > 0 && !ctx.leitura && (
        <Bloco titulo={`Pagamentos para aprovar (${lotes.length})`}>
          {lotes.map((l) => (
            <div key={l.id} className="flex items-center gap-2 text-sm">
              <SealCheckIcon className="text-muted-foreground size-5 shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="block">{l.titulo}</span>
                <span className="text-muted-foreground block text-xs">{l.itens.reduce((t, i) => t + i.valor, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })} · preparado pelo escritório</span>
              </span>
              <Button size="sm" className="rounded-full" onClick={() => ctx.ir('aprovacoes')}>
                Ver
              </Button>
            </div>
          ))}
        </Bloco>
      )}

      {cert && cert.dias < 30 && ctx.areas.includes('societario') && !ctx.leitura && (
        <Bloco titulo="Certificado digital" acao={<Selo tom={cert.dias <= 5 ? 'erro' : 'atencao'}>vence em {cert.dias} dias</Selo>}>
          <p className="text-sm">O {cert.tipo} vence em {cert.validade}. Sem ele, a captura de notas para.</p>
          <Button size="sm" className="w-fit rounded-full" onClick={() => ctx.ir('empresa', 'certificado')}>
            <ShieldCheckIcon /> Renovar agora
          </Button>
        </Bloco>
      )}

      {(guias.length > 0 || honorarios.length > 0) && (
        <Bloco titulo="Próximos vencimentos">
          {guias.map((g) => {
            const d = docDaGuia(g.tributo, g.competencia)
            const chave = d?.id ?? `guia:${g.id}`
            const informada = informadas[chave]
            return (
              <div key={g.id} className="flex items-center gap-2 text-sm">
                <ReceiptIcon className="text-muted-foreground size-5 shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="block">
                    {g.tributo} {g.competencia}
                  </span>
                  <span className="text-muted-foreground block text-xs">
                    {g.valor} · vence {g.vencimento}
                    {!g.enviada && ' · em preparo no escritório'}
                    {informada && ' · pagamento informado'}
                  </span>
                </span>
                {d && g.enviada && (
                  <Button size="sm" variant="ghost" className="rounded-full" onClick={() => { if (estadoDoc(d, ctx.contato.nome) === 'novo') entrega(d, 'visto'); ctx.ir('documentos', d.id) }}>
                    Guia
                  </Button>
                )}
                {g.enviada && !informada && !ctx.leitura && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => {
                      setInformadas((x) => ({ ...x, [chave]: agoraTexto() }))
                      if (d) entrega(d, 'confirmado', 'pagamento informado')
                      else ctx.registrar(`Informou pagamento de ${g.tributo} ${g.competencia}`)
                      ctx.avisarApp('Anotado. A régua de cobrança desta guia para; a baixa confirma na conciliação.')
                    }}
                  >
                    Já paguei
                  </Button>
                )}
                {informada && <CheckCircleIcon className="text-success size-4 shrink-0" weight="fill" aria-label="pago informado" />}
              </div>
            )
          })}
          {honorarios.map((f) => (
            <div key={f.id} className="flex items-center gap-2 text-sm">
              <WalletIcon className="text-muted-foreground size-5 shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="block">Honorários {f.competencia}</span>
                <span className="text-muted-foreground block text-xs">
                  {brl(f.valor)} · vence {f.vencimento}
                </span>
              </span>
              <Button size="sm" variant="ghost" className="rounded-full" onClick={() => ctx.ir('financeiro', f.id)}>
                Pagar
              </Button>
            </div>
          ))}
        </Bloco>
      )}

      {novos.length > 0 && (
        <Bloco titulo={`Chegou para você (${novos.length} ${novos.length === 1 ? 'novo' : 'novos'})`} acao={<button type="button" className="text-muted-foreground cursor-pointer text-xs" onClick={() => ctx.ir('documentos')}>ver todos</button>}>
          {novos.slice(0, 4).map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => {
                entrega(d, 'visto')
                ctx.ir('documentos', d.id)
              }}
              className="hover:bg-sunken/50 -mx-1.5 flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm"
            >
              <FileTextIcon className="text-muted-foreground size-5 shrink-0" />
              <span className="min-w-0 flex-1 truncate">{d.nome}</span>
              <Selo tom="info">novo</Selo>
            </button>
          ))}
        </Bloco>
      )}

      {avisosEscritorio.length > 0 && (
        <Bloco titulo="Avisos do escritório">
          {avisosEscritorio.slice(0, 3).map((c) => (
            <div key={c.id} className="flex gap-2 text-sm">
              <MegaphoneIcon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
              <span>
                <span className="block font-medium">{c.titulo}</span>
                <span className="text-muted-foreground block text-xs">{c.texto}</span>
              </span>
            </div>
          ))}
        </Bloco>
      )}

      {(pedidos.length > 0 || respostaNova) && (
        <div className="flex flex-wrap gap-2">
          {pedidos.length > 0 && (
            <Button size="sm" variant="outline" className="rounded-full" onClick={() => ctx.ir('pedidos')}>
              <ListChecksIcon /> Pedidos em andamento ({pedidos.length}){aguardandoVoce.length > 0 && ` · ${aguardandoVoce.length} esperam você`}
            </Button>
          )}
          {respostaNova && (
            <Button size="sm" variant="outline" className="rounded-full" onClick={() => ctx.ir('conversa')}>
              <ChatCircleDotsIcon /> Resposta nova na conversa
            </Button>
          )}
        </div>
      )}

      {outras.length > 0 && (
        <p className="text-muted-foreground text-xs">
          Outras empresas: {pendOutras > 0 ? `${pendOutras} ${pendOutras === 1 ? 'pendência' : 'pendências'} em ` : ''}
          {outras.map((o) => loja.clientes.find((c) => c.id === o.clienteId)?.nome).join(', ')} (troque no topo).
        </p>
      )}
      {!ctx.leitura && <PedirPush ctx={ctx} />}
      {vazio && !ctx.leitura && (
        <Faixa tom="ok" icone={<CheckCircleIcon weight="fill" />}>
          {textos.tudoEmDia}
        </Faixa>
      )}
    </div>
  )
}

/** Push só depois de um toque da pessoa (06, 3.11). */
function PedirPush({ ctx }: { ctx: Ctx }) {
  const [acesso, setAcesso] = useAcesso(ctx.pessoa)
  const [tocou, setTocou] = useState(tocouNoApp)
  const [carregando, setCarregando] = useState(false)
  const [fonte, setFonte] = useState<string | null>(null)
  useEffect(() => {
    if (tocou) return
    const marcar = () => {
      tocouNoApp = true
      setTocou(true)
    }
    // Depois do toque (no fim do Início, para não mexer no que está embaixo do dedo).
    const depois = () => setTimeout(marcar, 400)
    window.addEventListener('click', depois, { once: true })
    return () => window.removeEventListener('click', depois)
  }, [tocou])
  if (fonte)
    return (
      <Faixa tom="ok" icone={<BellRingingIcon weight="fill" />} acao={<SeloDemonstracao fonte={fonte} />}>
        Avisos ligados neste aparelho.
      </Faixa>
    )
  if (!tocou || acesso.push || acesso.pushPerguntado) return null
  return (
    <Bloco titulo="Receber avisos neste aparelho?">
      <p className="text-muted-foreground text-xs">Guia nova, pendência e resposta do escritório chegam na hora. Você escolhe o que recebe em Empresa › Avisos.</p>
      <div className="flex gap-2">
        <Button
          size="sm"
          className="rounded-full"
          disabled={carregando}
          onClick={() => {
            setCarregando(true)
            registrarPush()
              .then((r) => {
                setAcesso((a) => ({ ...a, push: 'permitido', pushPerguntado: true }))
                setFonte(r.fonte)
                ctx.registrar('Permitiu avisos (push) neste aparelho')
              })
              .catch(() => ctx.avisarApp('Não deu para ligar os avisos agora. Tente de novo em Empresa › Avisos.'))
              .finally(() => setCarregando(false))
          }}
        >
          {carregando ? 'Ligando…' : 'Permitir'}
        </Button>
        <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setAcesso((a) => ({ ...a, pushPerguntado: true, push: 'negado' }))}>
          Agora não
        </Button>
      </div>
    </Bloco>
  )
}

/** Instalar (06, 3.11): Android com botão; iPhone com o passo a passo. Até instalar, avisos por WhatsApp ou e-mail. */
function Instalar({ ctx }: { ctx: Ctx }) {
  const [acesso, setAcesso] = useAcesso(ctx.pessoa)
  const [aberto, setAberto] = useState(false)
  if (acesso.instalado || acesso.instalarDispensado) return null
  return (
    <>
      <Faixa
        icone={<DeviceMobileIcon />}
        acao={
          <Button size="sm" variant="outline" className="rounded-full" onClick={() => setAberto(true)}>
            <DownloadSimpleIcon /> Instalar
          </Button>
        }
      >
        Instale o app na tela do celular. Até lá, os avisos chegam por WhatsApp ou e-mail.
      </Faixa>
      {aberto && (
        <Folha titulo="Instalar o app" onFechar={() => setAberto(false)}>
          <div className="bg-surface shadow-cartao flex flex-col gap-2 rounded-lg p-3 text-sm">
            <p className="flex items-center gap-2 font-medium">
              <AndroidLogoIcon className="size-5" /> Android
            </p>
            <p className="text-muted-foreground text-xs">O Chrome mostra "Instalar app". Um toque.</p>
            <Button
              size="sm"
              className="w-fit rounded-full"
              onClick={() => {
                setAcesso((a) => ({ ...a, instalado: 'android' }))
                ctx.registrar('Instalou o app (Android)')
                ctx.avisarApp('App instalado. Ele abre pelo ícone na tela inicial.')
                setAberto(false)
              }}
            >
              Instalar
            </Button>
          </div>
          <div className="bg-surface shadow-cartao flex flex-col gap-2 rounded-lg p-3 text-sm">
            <p className="flex items-center gap-2 font-medium">
              <AppleLogoIcon className="size-5" /> iPhone
            </p>
            <ol className="text-muted-foreground flex list-decimal flex-col gap-1 pl-4 text-xs">
              <li>
                No Safari, toque em <ShareIcon className="inline size-3.5" /> Compartilhar.
              </li>
              <li>Escolha "Adicionar à Tela de Início".</li>
              <li>Toque em Adicionar.</li>
            </ol>
            <Button
              size="sm"
              variant="outline"
              className="w-fit rounded-full"
              onClick={() => {
                setAcesso((a) => ({ ...a, instalado: 'ios' }))
                ctx.registrar('Instalou o app (iPhone)')
                setAberto(false)
              }}
            >
              Já adicionei
            </Button>
          </div>
          <Button variant="ghost" className="rounded-full" onClick={() => { setAcesso((a) => ({ ...a, instalarDispensado: true })); setAberto(false) }}>
            Não quero instalar
          </Button>
        </Folha>
      )}
    </>
  )
}

/** Modo leitura após a saída do escritório (06, 12.6): data de encerramento e exportação do que é do cliente. */
function ModoLeitura({ ctx, total }: { ctx: Ctx; total: number }) {
  const [res, setRes] = useState<{ nome: string; arquivos: number; formato: string; fonte: string } | null>(null)
  const [carregando, setCarregando] = useState(false)
  return (
    <Bloco titulo="App em modo leitura" acao={<Selo tom="atencao">até {ctx.leitura!.encerraEm}</Selo>}>
      <p className="text-sm">O escritório encerrou o uso da plataforma. Até {ctx.leitura!.encerraEm} você baixa os documentos e vê o histórico; pedidos, conversa e pendências estão fechados.</p>
      {!res ? (
        <Button
          size="sm"
          className="w-fit rounded-full"
          disabled={carregando}
          onClick={() => {
            setCarregando(true)
            exportarTudo(total)
              .then((r) => {
                setRes({ ...r.dados, fonte: r.fonte })
                ctx.registrar(`Exportou os próprios documentos (${total} arquivos) no modo leitura`)
              })
              .catch(() => ctx.avisarApp('Não deu para gerar agora. Tente de novo.'))
              .finally(() => setCarregando(false))
          }}
        >
          <DownloadSimpleIcon /> {carregando ? 'Gerando…' : 'Exportar meus documentos'}
        </Button>
      ) : (
        <p className="flex flex-wrap items-center gap-2 text-sm">
          <CheckCircleIcon className="text-success size-4" weight="fill" /> {res.nome}: {res.arquivos} arquivos, {res.formato}. <SeloDemonstracao fonte={res.fonte} />
        </p>
      )}
      <p className="text-muted-foreground flex items-center gap-1 text-[11px]">
        <WarningIcon className="size-3" /> Você pode pedir a portabilidade ao novo escritório a qualquer momento.
      </p>
    </Bloco>
  )
}

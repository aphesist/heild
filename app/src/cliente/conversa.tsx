import { ChatCircleDotsIcon, ClockIcon, MicrophoneIcon, PaperclipIcon, PaperPlaneTiltIcon, PlayIcon, SparkleIcon, StopIcon } from '@phosphor-icons/react'
import { useEffect, useRef, useState } from 'react'
import { fichas } from '@/ambiente/clientes'
import { useConversaDe } from '@/ambiente/fluxos'
import { useLoja } from '@/ambiente/loja'
import { EstadoVazio } from '@/components/kit'
import { Button } from '@/components/ui/button'
import { P, tipoPeloNome } from '@/dados/arquivos'
import type { ItemConversa, StatusConversa } from '@/dados/crm'
import { fiscalDe } from '@/dados/painel'
import { useTema } from '@/theme/ThemeProvider'
import type { SetorIntegrante } from '@/theme/tipos'
import { cn } from '@/lib/utils'
import { ator, idDoUsuario, nomeSetor, oQueMandar, primeiroNome, useNomeEscritorio, type Ctx } from './contexto'
import { agoraTexto, textosDoApp, tiposPedido } from './dados'
import { useEstadoConversa } from './estado'
import { prepararResposta } from './motor'
import { usePendencias, useResponderPendencia, defDoItem } from './pendencias'
import { Faixa, Folha, Selo, TituloTela, type Tom } from './pecas'
import { gravarAudio } from './simulados'

/**
 * S10-T06 · Conversa (06, 7; 04, 11). Um fio por setor exibido, o mesmo do
 * WhatsApp e do e-mail (cada mensagem com a marca do canal). O cliente não vê
 * notas internas, cartões, transcrições, etiquetas, SLA nem responsável.
 * Pedido implícito vira cartão no app; resposta factual do assistente é
 * preparada pelo integrante e sai depois de uma pessoa aprovar.
 */

type Msg = Extract<ItemConversa, { tipo: 'mensagem' }>

export const statusSimples = (s?: StatusConversa): { rotulo: string; tom: Tom } =>
  s === 'nova' ? { rotulo: 'recebido', tom: 'info' } : s === 'em_atendimento' ? { rotulo: 'em atendimento', tom: 'info' } : s === 'aguardando_cliente' ? { rotulo: 'aguardando você', tom: 'atencao' } : s === 'aguardando_interno' ? { rotulo: 'em andamento', tom: 'neutro' } : s === 'resolvida' ? { rotulo: 'resolvido', tom: 'ok' } : { rotulo: 'novo', tom: 'neutro' }

const canalRotulo = { whatsapp: 'por WhatsApp', email: 'por e-mail', app: '' } as const

/** Pedido implícito na mensagem (06, 7.3): o tipo e o que já dá para preencher. */
function pedidoImplicito(texto: string) {
  const t = texto.toLowerCase()
  const n = t.match(/(\d+|dois|duas|três|tres)\s+(funcion|pessoa|empregad)/)
  if (/contrat(ei|amos|ar)|admit|novo funcion|nova funcion/.test(t)) return { tipo: 'Admissão', campos: { nome: '', cargo: /balconist/.test(t) ? 'Balconista' : '', inicio: '' }, frase: `abrir pedido de admissão${n ? ` (${n[1]} pessoas)` : ''} com estes dados?` }
  if (/f[ée]rias/.test(t)) return { tipo: 'Férias', campos: {}, frase: 'abrir pedido de férias?' }
  if (/demit|mandar embora|desligar|rescis/.test(t)) return { tipo: 'Simulado de rescisão', campos: { tipo: /acordo/.test(t) ? 'Acordo (art. 484-A)' : 'Sem justa causa' }, frase: 'pedir um simulado da rescisão antes de decidir?' }
  if (/certid/.test(t)) return { tipo: 'Certidão', campos: {}, frase: 'abrir pedido de certidão?' }
  return null
}

/** Resposta factual que o integrante de Atendimento rascunha (vai ao escritório aprovar). */
function rascunhoFactual(texto: string, clienteId: string, nome: string): string | null {
  const t = texto.toLowerCase()
  const fis = fiscalDe(clienteId)
  if (/fgts/.test(t)) {
    const g = fis.guias.find((x) => /FGTS/.test(x.tributo))
    if (g) return `Oi, ${primeiroNome(nome)}! O FGTS de ${g.competencia} é ${g.valor} e vence em ${g.vencimento}. A guia está em Documentos. Pagando até o vencimento, não tem multa.`
  }
  if (/guia|das|imposto|venc|prazo|saiu/.test(t)) {
    const g = fis.guias.find((x) => !x.paga && x.valor !== '—')
    if (g) return `Oi, ${primeiroNome(nome)}! O ${g.tributo} de ${g.competencia} é ${g.valor}, vence em ${g.vencimento}. ${g.enviada ? 'A guia já está em Documentos.' : 'Está em preparo; aviso quando sair.'}`
  }
  return null
}

export function Conversa({ ctx }: { ctx: Ctx }) {
  const loja = useLoja()
  const setor = (ctx.item as SetorIntegrante | null) ?? null
  const fios = loja.conversas.filter((c) => c.clienteId === ctx.clienteId && ctx.setores.includes(c.setor) && (c.pessoa.nome === ctx.contato.nome || ctx.ehSocio))
  if (setor) return <Fio ctx={ctx} setor={setor} />
  const semFio = ctx.setores.filter((s) => s !== 'gestao_atendimento' && !fios.some((f) => f.setor === s))
  return (
    <div className="flex flex-col gap-4">
      <TituloTela>Conversa</TituloTela>
      {ctx.leitura && <Faixa>App em modo leitura até {ctx.leitura.encerraEm}: o histórico fica aqui; mensagens novas, só pelo novo escritório.</Faixa>}
      {fios.length === 0 && <EstadoVazio compacto icone={ChatCircleDotsIcon} titulo="Nenhuma conversa ainda" descricao="Escreva para o setor certo; quem cuida da sua empresa responde aqui." />}
      {fios.map((c) => {
        const st = statusSimples(c.status)
        const ultima = [...c.itens].reverse().find((i): i is Msg => i.tipo === 'mensagem' && !i.apagada)
        return (
          <button key={c.id} type="button" onClick={() => ctx.abrirConversa(c.setor)} className="bg-surface shadow-cartao flex cursor-pointer items-center gap-2 rounded-lg px-3.5 py-3 text-left">
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2 text-sm font-medium">{nomeSetor[c.setor] ?? c.setor}</span>
              <span className="text-muted-foreground line-clamp-1 text-xs">{ultima ? `${ultima.de === 'cliente' ? 'Você: ' : ''}${ultima.texto ?? (ultima.audio ? 'Áudio' : 'Anexo')}` : c.previa}</span>
            </span>
            <Selo tom={st.tom}>{st.rotulo}</Selo>
          </button>
        )
      })}
      {!ctx.leitura && (
        <>
          <Button className="rounded-full" onClick={() => ctx.abrirConversa('gestao_atendimento')}>
            <ChatCircleDotsIcon /> Falar com o escritório
          </Button>
          {semFio.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              <span className="text-muted-foreground w-full text-xs">Ou escreva direto para:</span>
              {semFio.map((s) => (
                <button key={s} type="button" onClick={() => ctx.abrirConversa(s)} className="bg-sunken cursor-pointer rounded-full px-3 py-1.5 text-xs">
                  {nomeSetor[s]}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function Fio({ ctx, setor }: { ctx: Ctx; setor: SetorIntegrante }) {
  const loja = useLoja()
  const conversaDe = useConversaDe()
  const { tema } = useTema()
  const nomeEscritorio = useNomeEscritorio()
  const textos = textosDoApp(tema, nomeEscritorio)
  const [texto, setTexto] = useState('')
  const [anexar, setAnexar] = useState(false)
  const [gravando, setGravando] = useState<number | null>(null)
  const [estado, setEstado] = useEstadoConversa(ctx.clienteId)
  const [implicito, setImplicito] = useState<{ msgId: string; tipo: string; frase: string } | null>(null)
  const pend = usePendencias(ctx).filter((t) => t.setor === setor && defDoItem(t).tipo === 'documento')
  const responder = useResponderPendencia(ctx)
  const fim = useRef<HTMLDivElement>(null)
  const fio = loja.conversas.find((c) => c.clienteId === ctx.clienteId && c.setor === setor && (c.pessoa.nome === ctx.contato.nome || ctx.ehSocio)) ?? loja.conversas.find((c) => c.clienteId === ctx.clienteId && c.setor === setor)
  const itens = (fio?.itens ?? []).filter((i): i is Msg => i.tipo === 'mensagem' && !i.apagada)
  const st = statusSimples(fio?.status)
  const hora = new Date().getHours()
  const foraDoHorario = hora < 8 || hora >= 18
  useEffect(() => {
    fim.current?.scrollIntoView({ block: 'end' })
  }, [itens.length])
  useEffect(() => {
    if (gravando === null) return
    const t = setInterval(() => setGravando((s) => (s === null ? null : s + 1)), 1000)
    return () => clearInterval(t)
  }, [gravando === null]) // eslint-disable-line react-hooks/exhaustive-deps

  const idConversa = () => fio?.id ?? conversaDe(ctx.clienteNome, setor, ctx.contato.nome)
  const avisarEscritorio = (id: string, previa: string) => {
    const resp = fichas[ctx.clienteId]?.responsaveis[setor] ?? fio?.responsavel
    loja.avisar({ para: [idDoUsuario(resp) ?? 'u4'], tipo: 'conversa', setor, titulo: `${ctx.contato.nome} (${ctx.clienteNome}) escreveu pelo app`, detalhe: previa.slice(0, 80), destino: { modulo: 'crm', aba: 'conversas', conversa: id } })
    // No escritório, chega como notificação de mensagem: foto, nome, empresa e o começo do texto.
    loja.toast(previa, { modulo: 'crm', aba: 'conversas', conversa: id }, 'Responder', { tipo: 'contato', nome: ctx.contato.nome, cliente: ctx.clienteNome, canal: 'app' })
  }
  const enviar = () => {
    const t = texto.trim()
    if (!t) return
    const id = idConversa()
    loja.mensagemCrm(id, { tipo: 'mensagem', de: 'cliente', autor: primeiroNome(ctx.contato.nome), canal: 'app', texto: t })
    loja.statusConversa(id, fio?.responsavel ? 'em_atendimento' : 'nova')
    avisarEscritorio(id, t)
    setTexto('')
    // Pedido implícito: cartão no app; o cliente confirma (06, 7.3).
    const imp = pedidoImplicito(t)
    if (imp && tiposPedido.some((x) => x.tipo === imp.tipo && (x.area === 'todos' || ctx.areas.includes(x.area as never)))) setImplicito({ msgId: `${id}:${Date.now()}`, tipo: imp.tipo, frase: imp.frase })
    // Pergunta factual: o integrante de Atendimento rascunha; uma pessoa aprova antes de sair (mapa, 0.7).
    const r = rascunhoFactual(t, ctx.clienteId, ctx.contato.nome)
    if (r) prepararResposta(loja, { clienteId: ctx.clienteId, clienteNome: ctx.clienteNome, conversa: id, setor, pergunta: t, texto: r, contato: ctx.contato.nome })
  }
  const anexarArquivo = (nome: string) => {
    const id = idConversa()
    const casa = pend.find((t) => defDoItem(t).amostras?.some((a) => a.nome === nome))
    if (casa) {
      // O anexo casa com uma pendência aberta: baixa o item (06, 7.4).
      const a = defDoItem(casa).amostras!.find((x) => x.nome === nome)!
      responder.enviar(casa, [a], defDoItem(casa))
    } else {
      loja.adicionarDocumento({ nome, clienteId: ctx.clienteId, pasta: P.interno(), tipo: tipoPeloNome(nome), competencia: '11/2026', origem: 'conversa', conector: 'a1', tamanho: '210 KB', quando: 'hoje', por: `${ctx.contato.nome} (cliente)` })
      loja.mensagemCrm(id, { tipo: 'mensagem', de: 'cliente', autor: primeiroNome(ctx.contato.nome), canal: 'app', texto: 'Segue o arquivo.', anexos: [{ nome, tipo: nome.split('.').pop() ?? 'pdf' }] })
      avisarEscritorio(id, `Anexo: ${nome}`)
      loja.registrar(ator(ctx), `Mandou o anexo ${nome} na conversa do ${nomeSetor[setor]} (${ctx.clienteNome})`)
    }
    setAnexar(false)
  }
  const pararGravacao = () => {
    const seg = Math.max(2, gravando ?? 2)
    setGravando(null)
    gravarAudio(seg).then((r) => {
      const id = idConversa()
      loja.mensagemCrm(id, { tipo: 'mensagem', de: 'cliente', autor: primeiroNome(ctx.contato.nome), canal: 'app', audio: { duracao: `0:${String(seg).padStart(2, '0')}`, transcricao: r.dados.transcricao } })
      loja.statusConversa(id, fio?.responsavel ? 'em_atendimento' : 'nova')
      avisarEscritorio(id, 'Mensagem de áudio (transcrita para a equipe)')
    })
  }

  return (
    <div className="flex min-h-full flex-col gap-2">
      <TituloTela voltar={() => ctx.ir('conversa')} acao={fio && <Selo tom={st.tom}>{st.rotulo}</Selo>}>
        {nomeSetor[setor]}
      </TituloTela>
      {foraDoHorario && !ctx.leitura && (
        <Faixa icone={<ClockIcon />}>{textos.foraDoHorario}</Faixa>
      )}
      <div className="flex flex-1 flex-col gap-2">
        {itens.length === 0 && <p className="text-muted-foreground text-sm">Escreva sua dúvida ou pedido. Quem cuida do seu {nomeSetor[setor]?.toLowerCase()} responde aqui. O que você mandar pelo WhatsApp também aparece aqui.</p>}
        {itens.map((m) => (
          <div key={m.id} className={cn('max-w-[85%] rounded-lg px-3.5 py-2.5 text-sm', m.de === 'cliente' ? 'bg-foreground text-background self-end' : 'bg-surface shadow-cartao self-start')}>
            {m.de !== 'cliente' && <span className="text-muted-foreground block text-xs">{m.de === 'integrante' ? `${m.autor} (${textos.assinaAssistente(m.autor ?? '')})` : m.de === 'auto' ? 'Mensagem automática' : m.autor}</span>}
            {m.audio ? (
              <span className="flex items-center gap-2">
                <PlayIcon className="size-4" weight="fill" /> Áudio · {m.audio.duracao}
              </span>
            ) : (
              <span className="whitespace-pre-line">{m.texto}</span>
            )}
            {m.anexos?.map((a) => (
              <span key={a.nome} className="mt-1 flex items-center gap-1 text-xs opacity-80">
                <PaperclipIcon className="size-3" /> {a.nome}
              </span>
            ))}
            <span className="mt-0.5 block text-right text-xs opacity-60">
              {canalRotulo[m.canal] ? `${canalRotulo[m.canal]} · ` : ''}
              {m.hora}
            </span>
          </div>
        ))}
        <div ref={fim} />
      </div>

      {implicito && estado.implicitos[implicito.msgId] === undefined && (
        <div className="bg-surface shadow-cartao flex flex-col gap-2 self-start rounded-lg p-3 text-sm" role="group" aria-label="Pedido sugerido">
          <span className="text-muted-foreground flex items-center gap-1 text-xs">
            <SparkleIcon className="size-3" /> Assistente do escritório
          </span>
          <p>Entendi: {implicito.frase}</p>
          <div className="flex gap-2">
            <Button
              size="sm"
              className="rounded-full"
              onClick={() => {
                setEstado((e) => ({ ...e, implicitos: { ...e.implicitos, [implicito.msgId]: 'aberto' } }))
                ctx.ir('pedidos', `novo:${implicito.tipo}`)
              }}
            >
              Abrir pedido
            </Button>
            <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setEstado((e) => ({ ...e, implicitos: { ...e.implicitos, [implicito.msgId]: 'dispensado' } }))}>
              Agora não
            </Button>
          </div>
        </div>
      )}

      {fio?.status === 'resolvida' && !estado.avaliacoes[fio.id] && !ctx.leitura && (
        <div className="bg-surface shadow-cartao flex flex-col gap-2 rounded-lg p-3 text-sm">
          <p>Como foi o atendimento do {nomeSetor[setor]}?</p>
          <div className="flex gap-2">
            {(
              [
                ['otimo', 'Ótimo'],
                ['ok', 'Ok'],
                ['ruim', 'Ruim'],
              ] as const
            ).map(([v, r]) => (
              <Button
                key={v}
                size="sm"
                variant="outline"
                className="rounded-full"
                onClick={() => {
                  setEstado((e) => ({ ...e, avaliacoes: { ...e.avaliacoes, [fio.id]: { nota: v, em: agoraTexto() } } }))
                  loja.registrar(ator(ctx), `Avaliou o atendimento do ${nomeSetor[setor]}: ${r.toLowerCase()} (${ctx.clienteNome})`)
                  ctx.avisarApp('Obrigado pela avaliação.')
                }}
              >
                {r}
              </Button>
            ))}
          </div>
        </div>
      )}
      {fio && estado.avaliacoes[fio.id] && <p className="text-muted-foreground text-center text-xs">Você avaliou este atendimento: {estado.avaliacoes[fio.id].nota === 'otimo' ? 'ótimo' : estado.avaliacoes[fio.id].nota}.</p>}

      {!ctx.leitura && (
        <div className="bg-surface shadow-cartao sticky bottom-0 flex items-center gap-1.5 rounded-full py-1 pr-1 pl-2">
          {gravando === null ? (
            <>
              <button type="button" aria-label="Anexar" onClick={() => setAnexar(true)} className="hover:bg-sunken cursor-pointer rounded-full p-2">
                <PaperclipIcon className="size-4" />
              </button>
              <input aria-label="Mensagem" value={texto} onChange={(e) => setTexto(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && enviar()} placeholder="Escreva para o escritório" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
              {texto.trim() ? (
                <Button size="icon-sm" className="rounded-full" aria-label="Enviar" onClick={enviar}>
                  <PaperPlaneTiltIcon />
                </Button>
              ) : (
                <Button size="icon-sm" variant="ghost" className="rounded-full" aria-label="Gravar áudio" onClick={() => setGravando(0)}>
                  <MicrophoneIcon />
                </Button>
              )}
            </>
          ) : (
            <>
              <span className="bg-destructive ml-2 size-2 animate-pulse rounded-full" aria-hidden />
              <span className="flex-1 text-sm tabular-nums">Gravando… 0:{String(gravando).padStart(2, '0')}</span>
              <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setGravando(null)}>
                Descartar
              </Button>
              <Button size="icon-sm" className="rounded-full" aria-label="Parar e enviar" onClick={pararGravacao}>
                <StopIcon weight="fill" />
              </Button>
            </>
          )}
        </div>
      )}

      {anexar && (
        <Folha titulo="Anexar" onFechar={() => setAnexar(false)}>
          {pend.length > 0 && <p className="text-muted-foreground text-xs">Se o arquivo for o que o escritório pediu, a pendência baixa sozinha.</p>}
          {[...pend.flatMap((t) => (defDoItem(t).amostras ?? []).filter((a) => a.legivel !== false).map((a) => ({ nome: a.nome, para: oQueMandar(t) }))), { nome: 'foto-documento.jpg', para: '' }, { nome: 'comprovante.pdf', para: '' }].map((a) => (
            <button key={a.nome} type="button" onClick={() => anexarArquivo(a.nome)} className="bg-sunken flex cursor-pointer flex-col rounded-md px-3 py-2 text-left text-sm">
              {a.nome}
              {a.para && <span className="text-muted-foreground text-xs">casa com: {a.para}</span>}
            </button>
          ))}
        </Folha>
      )}
    </div>
  )
}

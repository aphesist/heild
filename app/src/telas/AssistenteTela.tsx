import { useClienteDaRota } from '@/ambiente/contexto-cliente'
import type { Suposicao } from '@/lib/suposicoes'
import { CaretDownIcon, HourglassMediumIcon, LifebuoyIcon, PlugsIcon, QuestionIcon, ScalesIcon, SparkleIcon } from '@phosphor-icons/react'
import { useLoja } from '@/ambiente/loja'
import { pedidosAssistente } from '@/dados/simulacao'
import type { Anexo } from '@/dados/tipos'
import { abrirSuporte } from '@/ambiente/suporte'
import { useState } from 'react'
import { GavetaFormulario } from '@/components/ui/formulario'
import { AvisoCompacto } from '@/components/compostos/aviso-compacto'
import { BarraConversa } from '@/components/compostos/barra-conversa'
import { CampoChat } from '@/components/compostos/campo-chat'
import type { AcoesCartao } from '@/components/compostos/cartoes-chat'
import { BotaoLimiteUso } from '@/components/compostos/limite-uso'
import { Button } from '@/components/ui/button'
import { Orb, GrupoOrbs } from '@/components/ui/orb'
import { Tooltip } from '@/components/ui/tooltip'
import type { Aviso, Integrante, LimiteUso } from '@/dados/tipos'
import { useMedia } from '@/hooks/useMedia'
import { useTema } from '@/theme/ThemeProvider'
import { cn } from '@/lib/utils'
import { ListaMensagens } from './ListaMensagens'
import { mensagensComTime } from './pedidoAoTime'
import { useEnviarAoGeral } from './inicio/roteador'
import { useDemoS01 } from '@/ambiente/demo-s01'
import type { useHistorico } from './useHistorico'
import { AreaRolagem } from '@/components/ui/area-rolagem'

/** Sugestões da S01: vigiar, pauta, rascunho, cálculo e ajuda do sistema. */
const sugestoesS01 = ['Me avise quando uma certidão estiver para vencer', 'Monte a pauta da reunião semanal', 'Escreva uma mensagem pedindo o extrato', 'Calcule multa e juros de um DAS atrasado', 'Como convido alguém para a equipe?']

interface Props {
  contexto: string
  /** Conversas do cliente atual (estado guardado na Plataforma). */
  conversa: ReturnType<typeof useHistorico>
  sugestoes: string[]
  avisos: Aviso[]
  limites: LimiteUso[]
  plano?: string
  onAbrirIntegrante?: (setor: Integrante['setor']) => void
  onVerAvisos?: () => void
  onVerNaAba?: () => void
  /** Só estes pedidos prontos (textos de `pedidosAssistente`); sem a lista, todos. A landing usa para mostrar os da plataforma. */
  pedidos?: string[]
}

/**
 * Aba Assistente do Início: o chat Geral grande (Figma; 02, 9.1).
 * Em cima, a barra da conversa (histórico do cliente, temporária, limpar, nova).
 * Vazio: "No que posso ajudar?" com o orb que segue o cursor, sugestões e os
 * avisos básicos. No pé, o campo; limite de uso e ajuda ficam na barra de ações do campo.
 */
export function AssistenteTela({ contexto, conversa, sugestoes, avisos, limites, plano, onAbrirIntegrante, onVerAvisos, onVerNaAba, pedidos: soEstes }: Props) {
  const pedidosVisiveis = soEstes ? pedidosAssistente.filter((p) => soEstes.includes(p.texto)) : pedidosAssistente
  const [ajuda, setAjuda] = useState(false)
  // Na demonstração os pedidos de fluxo são muitos: começam recolhidos atrás de "Abrir sugestões".
  const [abertas, setAbertas] = useState(false)
  const { integrante } = useTema()
  const geral = integrante('geral')
  const largo = useMedia('(min-width: 640px)')
  const { atual, historico, enviar: enviarBase, pensando, abrir, criar, limpar } = conversa
  const loja = useLoja()
  const clienteDaRota = useClienteDaRota()
  // O que o time escreve aqui enquanto faz o pedido (trabalho, retorno, passagens, fechamento) mora na loja.
  const doTime = loja.estado.assistente[atual.id]
  const mensagens = mensagensComTime(atual.mensagens, doTime)
  // A mesma decisão do Geral no Início e na gaveta do Chat (roteador da S01).
  const enviarRoteado = useEnviarAoGeral(conversa)
  const { limite: limiteAtingido, semIa } = useDemoS01()
  const enviar = (texto: string, anexos: Anexo[], suposicoes?: Suposicao[]) => {
    // Sem plano de IA (02, ad. 25): só a ajuda do sistema e as pessoas do suporte.
    if (semIa) return enviarBase(texto, anexos, { texto: 'Este escritório não tem plano de IA: posso responder sobre o sistema (a ajuda não gasta limite) e chamar o Suporte. Os integrantes ficam parados até o Administrador contratar.' })
    enviarRoteado(texto, anexos, suposicoes)
  }
  // Limpar não apaga cartões que ainda esperam decisão (02, ad. 22).
  const temPendente = (m: (typeof atual.mensagens)[number]) => (m.cartoes ?? []).some((c) => (c.tipo === 'aprovacao' || c.tipo === 'regra' || c.tipo === 'previa_mensagem') && !loja.estado.decisoes[c.id])
  const limparMantendo = () => {
    const ficam = atual.mensagens.filter(temPendente).length
    limpar(temPendente)
    if (ficam) loja.toast(`Conversa limpa. ${ficam === 1 ? 'Um cartão pendente ficou' : `${ficam} cartões pendentes ficaram`} até você decidir.`)
  }
  const limitesVivos = limiteAtingido ? limites.map((l, i) => (i === 0 ? { ...l, usado: 100 } : l)) : limites
  const vazia = mensagens.length === 0
  const acoes: AcoesCartao = { onAbrirIntegrante, onVerNaAba, onEnviar: (t) => enviar(t, []) }

  return (
    <div className="flex h-full flex-col">
      <BarraConversa className="mx-auto w-full max-w-3xl px-4 pb-1 sm:px-5 ultra:max-w-4xl" atual={atual} historico={historico} contexto={contexto} onAbrir={abrir} onNova={criar} onLimpar={limparMantendo} />
      <AreaRolagem className="flex-1 px-4 sm:px-5">
        {vazia ? (
          <div className="mx-auto flex min-h-full max-w-3xl flex-col items-center justify-center gap-6 py-8 sm:gap-8 baixa:gap-4 baixa:py-4">
            <h1 className="text-muted-foreground flex items-center gap-3 text-center text-3xl font-light tracking-tight sm:gap-4 sm:text-4xl lg:text-5xl baixa:lg:text-4xl">
              No que posso ajudar?
              {/* Orb principal: segue o cursor e reage ao clique. */}
              <Orb cor={geral.cor} corOlhos={geral.corOlhos} reacao="idle" tamanho={largo ? 64 : 48} modo="follow" animado vivo />
            </h1>
            <div className="flex flex-wrap justify-center gap-2">
              {[...sugestoes, ...sugestoesS01].map((s, i) => (
                <button
                  key={s}
                  type="button"
                  data-extra={i >= 2 || undefined}
                  onClick={() => enviar(s, [])}
                  className="bg-surface hover:bg-raised cursor-pointer rounded-full px-3.5 py-1.5 text-xs shadow-contorno transition-colors data-extra:max-sm:hidden baixa:data-extra:hidden"
                >
                  {s}
                </button>
              ))}
            </div>
            {pedidosVisiveis.length > 0 && (
              <button
                type="button"
                aria-expanded={abertas}
                aria-controls="sugestoes-fluxos"
                onClick={() => setAbertas((v) => !v)}
                className="text-muted-foreground hover:text-foreground -my-2 flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-colors"
              >
                {abertas ? 'Fechar sugestões' : 'Abrir sugestões'}
                <CaretDownIcon className={cn('size-3.5 transition-transform duration-300', abertas && 'rotate-180')} />
              </button>
            )}
            <div id="sugestoes-fluxos" inert={!abertas} aria-hidden={!abertas} className={cn('grid w-full max-w-xl transition-[grid-template-rows,opacity] duration-300 ease-out', abertas ? 'grid-rows-[1fr] opacity-100' : '-mt-6 grid-rows-[0fr] opacity-0 sm:-mt-8')}>
            <div className="flex min-h-0 flex-col items-center gap-2 overflow-hidden">
              <span className="text-muted-foreground text-xs">Peça ao time (o pedido vira trabalho entre os integrantes)</span>
              <div className="flex flex-wrap justify-center gap-2">
                {pedidosVisiveis
                  .filter((p) => !p.juridico)
                  .map((p, i) => (
                    <button
                      key={p.texto}
                      type="button"
                      data-extra={i >= 2 || undefined}
                      onClick={() => enviar(p.texto, [])}
                      className="bg-surface hover:bg-raised flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs shadow-contorno transition-colors data-extra:max-sm:hidden baixa:data-extra:hidden"
                    >
                      <SparkleIcon className="size-3.5" /> {p.texto}
                    </button>
                  ))}
              </div>
              {pedidosVisiveis.some((p) => p.juridico) && <span className="text-muted-foreground mt-1 text-xs">Pergunte sobre a lei (resposta com fundamento e citação)</span>}
              <div className="flex flex-wrap justify-center gap-2">
                {pedidosVisiveis
                  .filter((p) => p.juridico)
                  .map((p) => (
                    <button
                      key={p.texto}
                      type="button"
                      onClick={() => enviar(p.texto, [])}
                      className="bg-surface hover:bg-raised flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs shadow-contorno transition-colors"
                    >
                      <ScalesIcon className="size-3.5" /> {p.texto}
                    </button>
                  ))}
              </div>
            </div>
            </div>
            {avisos.length > 0 && (
              <section className="flex w-full max-w-xl flex-col gap-2">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-muted-foreground text-xs">Avisos do time</h2>
                  <button type="button" onClick={onVerAvisos} className="text-muted-foreground hover:text-foreground cursor-pointer text-xs underline-offset-4 hover:underline">
                    ver na Visão geral
                  </button>
                </div>
                <GrupoOrbs divergente={avisos.slice(0, 3).some((a) => a.decisao)}>
                  {avisos.slice(0, 3).map((a, i) => (
                    <AvisoCompacto key={a.id} aviso={a} className={i > 0 ? 'baixa:hidden' : undefined} onAbrir={() => onAbrirIntegrante?.(a.setor)} />
                  ))}
                </GrupoOrbs>
              </section>
            )}
          </div>
        ) : (
          <ListaMensagens className="mx-auto max-w-3xl pt-6 pb-8 ultra:max-w-4xl" mensagens={mensagens} acoes={acoes} />
        )}
      </AreaRolagem>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-1.5 px-4 pb-3 sm:px-5 sm:pb-5 ultra:max-w-4xl">
        {limiteAtingido && !semIa && (
          <p role="status" className="bg-sunken flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm">
            <HourglassMediumIcon weight="duotone" className="text-destructive size-5 shrink-0" />
            <span>
              <strong className="font-medium">Cheguei ao limite desta janela.</strong> O chat continua; os trabalhos automáticos esperam e voltam {limites[0]?.renova ?? 'na próxima janela'}.
            </span>
          </p>
        )}
        {semIa && (
          <p role="status" className="bg-sunken flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm">
            <PlugsIcon weight="duotone" className="text-muted-foreground size-5 shrink-0" />
            <span className="flex-1">
              <strong className="font-medium">Sem plano de IA.</strong> A ajuda do sistema e o Suporte continuam.
            </span>
            <Button size="sm" variant="outline" className="rounded-full" onClick={() => abrirSuporte()}>
              Suporte
            </Button>
          </p>
        )}
        <div className="relative">
          <CampoChat
            onEnviar={enviar}
            suposicoes={semIa ? false : { clienteId: clienteDaRota ?? undefined }}
            desabilitado={pensando}
            placeholder={`Pergunte ao ${geral.nome} ou peça uma ação`}
            // Abaixo de 1024px não há margem: limite e ajuda entram na barra do campo.
            acessorio={
              <span className="flex items-center gap-1.5 lg:hidden">
                <BotaoLimiteUso limites={limitesVivos} plano={plano} />
                <Button type="button" variant="ghost" size="icon-sm" className="rounded-full" aria-label="Ajuda" onClick={() => setAjuda(true)}>
                  <QuestionIcon />
                </Button>
              </span>
            }
          />
          {/* Na margem, centrados na altura do campo, os dois no mesmo tamanho e peso. */}
          <div className="absolute inset-y-0 left-full ml-3 hidden flex-col items-center justify-center gap-2 lg:flex">
            <BotaoLimiteUso limites={limitesVivos} plano={plano} className="bg-card shadow-campo hover:bg-raised size-10" tamanhoAnel={22} />
            <Tooltip conteudo="Ajuda" lado="left">
              <Button type="button" variant="ghost" size="icon" className="bg-card shadow-campo hover:bg-raised size-10 rounded-full" aria-label="Ajuda" onClick={() => setAjuda(true)}>
                <QuestionIcon className="size-6" />
              </Button>
            </Tooltip>
          </div>
        </div>
        <p className="text-foreground truncate px-2 text-center text-xs">contexto: {contexto}</p>
      </div>
      {ajuda && (
        <GavetaFormulario
          aberta
          onFechar={() => setAjuda(false)}
          titulo="Como usar o Assistente"
          descricao="Ele responde pela carteira ou pelo cliente do seletor e chama o integrante certo para fazer."
          acao="Entendi"
          onAcao={() => setAjuda(false)}
          secundaria={
            <Button
              type="button"
              variant="ghost"
              className="rounded-full"
              onClick={() => {
                setAjuda(false)
                abrirSuporte()
              }}
            >
              <LifebuoyIcon /> Suporte da plataforma
            </Button>
          }
        >
          <ul className="flex list-disc flex-col gap-2 pl-5 text-sm">
            <li>Pergunte em português: “quem ainda não mandou o extrato?”, “o que vence esta semana na Padaria?”.</li>
            <li>Peça uma ação: o pedido vai ao integrante do setor, que prepara e devolve um cartão para você aprovar.</li>
            <li>Transmitir, pagar e assinar sempre passam por uma pessoa.</li>
            <li>Cada cliente tem a própria conversa; “Nova conversa” começa do zero, “Limpar” apaga esta.</li>
            <li>Peça vigilância em português: “me avise quando uma certidão estiver para vencer”. Ele devolve a regra para você confirmar.</li>
            <li>Peça um rascunho: “escreva uma mensagem pedindo o extrato”. Nada sai sem a sua aprovação.</li>
            <li>Perguntas sobre o sistema (“como convido alguém?”) vão à ajuda, que não gasta o seu limite.</li>
            <li>Atalhos: Ctrl+K busca; Ctrl+J troca o cliente; Ctrl+B abre e fecha a barra lateral; Enter envia; Shift+Enter quebra a linha.</li>
          </ul>
        </GavetaFormulario>
      )}
    </div>
  )
}

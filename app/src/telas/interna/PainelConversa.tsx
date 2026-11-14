import { ArrowLeftIcon, ArrowsOutIcon, BellSlashIcon, BellIcon, InfoIcon, PictureInPictureIcon, PushPinIcon, SparkleIcon, XIcon, EyeIcon } from '@phosphor-icons/react'
import { useEffect, useMemo, useState } from 'react'
import { resumoDoFio, useAcoesInternas, useDigitando, useLidas, useLidasDeTodos, usePreferenciasInternas, usePresenca, useRotuloConversa } from '@/ambiente/interna'
import { useSessao } from '@/ambiente/sessao'
import { SeloDemonstracao, usePode } from '@/components/kit'
import { Button } from '@/components/ui/button'
import { Tooltip } from '@/components/ui/tooltip'
import { extrasDe, rotuloTipo } from '@/dados/interna'
import { cn } from '@/lib/utils'
import type { ConversaInterna, Id, MensagemInterna } from '@/nucleo/modelo/entidades'
import { useTabela } from '@/nucleo/react'
import { Orb } from '@/components/ui/orb'
import { useTema } from '@/theme/ThemeProvider'
import type { SetorIntegrante } from '@/theme/tipos'
import { CampoInterno, DialogoVersoes, DialogoVirarTarefa, Mensagem, PontoPresenca, type AcoesMensagem } from './pecas'
import { DetalhesConversa } from './DetalhesConversa'

interface Props {
  conversa: ConversaInterna
  /** Gaveta e janela flutuante: uma coluna; o fio e os detalhes trocam a vista. */
  compacto?: boolean
  destaque?: Id | null
  /** Aberta pelo Administrador em investigação (só leitura, com o motivo no topo). */
  investigacao?: { motivo: string; por: string } | null
  onVoltar?: () => void
  onTelaCheia?: () => void
  onFlutuante?: () => void
}

/** A conversa interna: cabeçalho, fixadas, mensagens com fio, campo; fio e detalhes ao lado (ou por cima, no compacto). */
export function PainelConversa({ conversa, compacto, destaque, investigacao, onVoltar, onTelaCheia, onFlutuante }: Props) {
  const { usuario } = useSessao()
  const acoes = useAcoesInternas()
  const rotulo = useRotuloConversa()
  const presenca = usePresenca()
  const { marcarLida } = useLidas()
  const lidasDeTodos = useLidasDeTodos()
  const prefs = usePreferenciasInternas()
  const digitando = useDigitando(conversa.id)
  const { integrante } = useTema()
  const podeFixar = usePode('mensagem_interna.fixar')
  const tMensagens = useTabela('mensagem_interna')
  const tPart = useTabela('participacao')
  const mensagens = useMemo(() => tMensagens.filter((m) => m.conversa_interna_id === conversa.id).sort((a, b) => a.criado_em.localeCompare(b.criado_em)), [tMensagens, conversa.id])
  const raizes = mensagens.filter((m) => !m.responde_a_id)
  const respostasDe = (id: Id) => mensagens.filter((m) => m.responde_a_id === id)
  const fixadas = conversa.tipo === 'canal_geral' ? mensagens.filter((m) => m.fixada) : []
  const membros = tPart.filter((p) => p.conversa_interna_id === conversa.id && !p.saiu_em).map((p) => p.usuario_id)
  const [fio, setFio] = useState<Id | null>(() => {
    const d = destaque ? mensagens.find((m) => m.id === destaque) : undefined
    return d?.responde_a_id ?? null
  })
  const [detalhes, setDetalhes] = useState(false)
  const [versoes, setVersoes] = useState<MensagemInterna | null>(null)
  const [tarefa, setTarefa] = useState<{ m: MensagemInterna; inicial?: { titulo?: string; setor?: string; cliente_id?: Id | null; descricao?: string } } | null>(null)
  const somenteLeitura = !!investigacao || !membros.includes(usuario.id)

  // Abrir a conversa marca como lida até a última mensagem (quem investiga não marca).
  const ultima = mensagens.at(-1)?.criado_em
  useEffect(() => {
    if (ultima && !investigacao) marcarLida(conversa.id, ultima)
  }, [ultima, conversa.id, marcarLida, investigacao])

  // "Visto por" em grupos e canais (11, 3): na última mensagem minha, quem já leu até ela.
  const minhaUltima = [...raizes].reverse().find((m) => m.autor_id === usuario.id)
  const vistoPor = (m: MensagemInterna) => (conversa.tipo === 'pessoal' || m.id !== minhaUltima?.id ? undefined : membros.filter((u) => u !== usuario.id && (lidasDeTodos[u]?.[conversa.id] ?? '') >= m.criado_em).map((u) => acoes.nomeDe(u).split(' ')[0]))

  const acoesMsg: AcoesMensagem = {
    onFio: (m) => {
      setDetalhes(false)
      setFio(m.responde_a_id ?? m.id)
    },
    onVirarTarefa: (m, inicial) => setTarefa({ m, inicial }),
    onVersoes: setVersoes,
    podeFixar,
    somenteLeitura,
  }
  const moverParaTarefa = (texto: string) => {
    // Cria uma mensagem-semente só na tarefa: nada vai para o canal amplo. Usa a última mensagem como âncora.
    const ancora = raizes.at(-1)
    if (ancora) setTarefa({ m: ancora, inicial: { titulo: 'Dado do cliente recebido pela equipe', descricao: texto } })
  }
  const silenciada = prefs.silenciadas.includes(conversa.id)
  const outro = conversa.tipo === 'pessoal' ? membros.find((u) => u !== usuario.id) : undefined
  const raizFio = fio ? mensagens.find((m) => m.id === fio) : undefined

  const cabecalho = (
    <div className="flex items-center gap-2 border-b px-3 py-2.5 sm:px-4">
      {onVoltar && (
        <Button size="icon-sm" variant="ghost" className="rounded-full" aria-label="Voltar às conversas" onClick={onVoltar}>
          <ArrowLeftIcon />
        </Button>
      )}
      <div className="min-w-0 flex-1">
        <h2 className="flex items-center gap-2 truncate text-sm font-medium sm:text-base">
          {outro && <PontoPresenca presenca={presenca(outro)} />}
          <span className="truncate">{rotulo(conversa)}</span>
          {silenciada && <BellSlashIcon className="text-muted-foreground size-3.5 shrink-0" aria-label="silenciada" />}
        </h2>
        <p className="text-muted-foreground truncate text-xs">
          {rotuloTipo[conversa.tipo]} · {membros.length} {membros.length === 1 ? 'pessoa' : 'pessoas'}
          {conversa.tipo === 'pessoal' && ' · integrantes não leem, salvo se chamados'}
        </p>
      </div>
      <Tooltip conteudo={silenciada ? 'Tirar o silêncio' : 'Silenciar esta conversa'}>
        <Button size="icon-sm" variant="ghost" className="rounded-full" aria-label={silenciada ? 'Tirar o silêncio' : 'Silenciar'} onClick={() => prefs.alternarSilencio(conversa.id)}>
          {silenciada ? <BellIcon /> : <BellSlashIcon />}
        </Button>
      </Tooltip>
      {onFlutuante && (
        <Tooltip conteudo="Abrir em janela flutuante">
          <Button size="icon-sm" variant="ghost" className="hidden rounded-full md:inline-flex" aria-label="Abrir em janela flutuante" onClick={onFlutuante}>
            <PictureInPictureIcon />
          </Button>
        </Tooltip>
      )}
      {onTelaCheia && (
        <Tooltip conteudo="Abrir em tela cheia">
          <Button size="icon-sm" variant="ghost" className="rounded-full" aria-label="Abrir em tela cheia" onClick={onTelaCheia}>
            <ArrowsOutIcon />
          </Button>
        </Tooltip>
      )}
      <Tooltip conteudo="Detalhes da conversa">
        <Button
          size="icon-sm"
          variant={detalhes ? 'secondary' : 'ghost'}
          className="rounded-full"
          aria-label="Detalhes da conversa"
          onClick={() => {
            setFio(null)
            setDetalhes((v) => !v)
          }}
        >
          <InfoIcon />
        </Button>
      </Tooltip>
    </div>
  )

  const listaPrincipal = (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      {investigacao && (
        <div role="status" className="bg-warning/12 flex items-start gap-2 border-b px-4 py-2 text-xs">
          <EyeIcon className="text-warning mt-0.5 size-4 shrink-0" /> Aberta em investigação por {investigacao.por}. Motivo: {investigacao.motivo}. Os participantes foram avisados; só leitura.
        </div>
      )}
      {fixadas.length > 0 && (
        <div className="bg-warning/8 flex flex-col gap-1 border-b px-4 py-2">
          {fixadas.map((m) => (
            <button key={m.id} type="button" className="flex cursor-pointer items-start gap-2 text-left text-xs" onClick={() => document.getElementById(`mi-${m.id}`)?.scrollIntoView({ block: 'center', behavior: 'smooth' })}>
              <PushPinIcon weight="fill" className="text-warning mt-0.5 size-3.5 shrink-0" />
              <span className="line-clamp-2">
                <span className="font-medium">{acoes.nomeDe(m.autor_id)}:</span> {m.corpo}
              </span>
            </button>
          ))}
        </div>
      )}
      <ol aria-label="Mensagens" className="area-rolagem-dupla flex flex-1 flex-col gap-1 overflow-y-auto px-2 py-3 sm:px-3">
        {raizes.length === 0 && <li className="text-muted-foreground m-auto max-w-xs py-10 text-center text-sm">Nenhuma mensagem ainda. Mensagens não podem ser apagadas, mas dá para editar.</li>}
        {raizes.map((m) => (
          <Mensagem key={m.id} m={m} conversa={conversa} respostas={respostasDe(m.id)} destaque={destaque === m.id} vistoPor={vistoPor(m)} acoes={acoesMsg} compacto={compacto} />
        ))}
        {digitando && !fio && <Digitando nome={digitando.nome} cor={integrante(digitando.setor as SetorIntegrante).cor} />}
      </ol>
      {!somenteLeitura ? (
        <CampoInterno conversa={conversa} compacto={compacto} onMoverParaTarefa={moverParaTarefa} />
      ) : (
        !investigacao && <p className="text-muted-foreground border-t p-3 text-center text-xs">Você não participa mais desta conversa. O histórico continua guardado.</p>
      )}
    </div>
  )

  const lateral = raizFio ? (
    <Fio raiz={raizFio} respostas={respostasDe(raizFio.id)} conversa={conversa} acoes={acoesMsg} destaque={destaque} somenteLeitura={somenteLeitura} onFechar={() => setFio(null)} onMoverParaTarefa={moverParaTarefa} digitando={digitando} compacto={compacto} />
  ) : detalhes ? (
    <DetalhesConversa conversa={conversa} onFechar={() => setDetalhes(false)} />
  ) : null

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {cabecalho}
      <div className="flex min-h-0 flex-1">
        {compacto && lateral ? lateral : listaPrincipal}
        {!compacto && lateral && <div className="flex w-full max-w-[380px] shrink-0 flex-col border-l max-lg:absolute max-lg:inset-y-0 max-lg:right-0 max-lg:z-20 max-lg:bg-surface max-lg:shadow-lg">{lateral}</div>}
      </div>
      <DialogoVersoes m={versoes} onFechar={() => setVersoes(null)} />
      <DialogoVirarTarefa
        m={tarefa?.m ?? null}
        inicial={tarefa?.inicial}
        onFechar={() => setTarefa(null)}
        onCriada={(id) => {
          if (tarefa && extrasDe(tarefa.m).proposta) acoes.decidirProposta(tarefa.m.id, 'criada', id)
        }}
      />
    </div>
  )
}

function Digitando({ nome, cor }: { nome: string; cor: string }) {
  return (
    <li className="text-muted-foreground flex items-center gap-2 px-2 py-2 text-xs" aria-live="polite">
      <span className="inline-flex size-5 shrink-0"><Orb cor={cor} tamanho={20} estado="trabalhando" extras={false} cutucavel={false} /></span>
      {nome} está escrevendo…
    </li>
  )
}

/** Fio (thread) de uma mensagem: abre ao lado; quem chegou depois pode pedir o resumo (11, 4). */
function Fio({ raiz, respostas, conversa, acoes, destaque, somenteLeitura, onFechar, onMoverParaTarefa, digitando, compacto }: { raiz: MensagemInterna; respostas: MensagemInterna[]; conversa: ConversaInterna; acoes: AcoesMensagem; destaque?: Id | null; somenteLeitura: boolean; onFechar: () => void; onMoverParaTarefa: (t: string) => void; digitando?: { setor: string; nome: string }; compacto?: boolean }) {
  const acoesInternas = useAcoesInternas()
  const { integrante } = useTema()
  const [resumo, setResumo] = useState<string | null>(null)
  const [resumindo, setResumindo] = useState(false)
  const semFio = { ...acoes, onFio: undefined }
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-2 border-b px-3 py-2">
        <span className="flex-1 text-sm font-medium">Fio · {respostas.length} {respostas.length === 1 ? 'resposta' : 'respostas'}</span>
        {respostas.length >= 3 && !resumo && (
          <Button
            size="sm"
            variant="outline"
            className="rounded-full"
            disabled={resumindo}
            onClick={() => {
              setResumindo(true)
              window.setTimeout(() => {
                setResumo(resumoDoFio(raiz, respostas, acoesInternas.nomeDe))
                setResumindo(false)
              }, 1100)
            }}
          >
            <SparkleIcon /> {resumindo ? 'Resumindo…' : 'Resumir fio'}
          </Button>
        )}
        <Button size="icon-sm" variant="ghost" className="rounded-full" aria-label="Fechar o fio" onClick={onFechar}>
          {compacto ? <ArrowLeftIcon /> : <XIcon />}
        </Button>
      </div>
      <ol className="area-rolagem-dupla flex flex-1 flex-col gap-1 overflow-y-auto px-2 py-3">
        {resumo && (
          <li className="bg-primary/6 mb-2 flex flex-col gap-1 rounded-[14px] p-3 text-sm">
            <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <span className="inline-flex size-4 shrink-0"><Orb cor={integrante('geral').cor} tamanho={16} extras={false} cutucavel={false} /></span> {integrante('geral').nome} · resumo do fio (IA)
            </span>
            {resumo}
            <SeloDemonstracao fonte="Integrante (IA)" />
          </li>
        )}
        <Mensagem m={raiz} conversa={conversa} acoes={semFio} destaque={destaque === raiz.id} compacto />
        <li className="text-muted-foreground flex items-center gap-2 px-2 py-1 text-[11px]">
          <span className="bg-border h-px flex-1" /> respostas <span className="bg-border h-px flex-1" />
        </li>
        {respostas.map((m) => (
          <Mensagem key={m.id} m={m} conversa={conversa} acoes={semFio} destaque={destaque === m.id} compacto />
        ))}
        {digitando && <Digitando nome={digitando.nome} cor={integrante(digitando.setor as SetorIntegrante).cor} />}
      </ol>
      {!somenteLeitura && <CampoInterno conversa={conversa} respondeA={raiz.id} compacto onMoverParaTarefa={onMoverParaTarefa} placeholder="Responder no fio" />}
    </div>
  )
}

export const classeCaixa = cn('bg-surface shadow-painel flex h-full overflow-hidden rounded-[24px] sm:rounded-[34px]')

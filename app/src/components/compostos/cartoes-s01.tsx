import { ArrowRightIcon, CalculatorIcon, CheckIcon, EyeIcon, LifebuoyIcon, PaperPlaneTiltIcon, QuestionIcon, XIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { useConversaDe } from '@/ambiente/fluxos'
import { useJobs } from '@/ambiente/jobs-s01'
import { useLoja, useNavegacao, type IdModulo } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import { abrirSuporte } from '@/ambiente/suporte'
import { ValorEditavel } from '@/components/kit/valor-editavel'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Orb } from '@/components/ui/orb'
import type { Cartao } from '@/dados/tipos'
import { cn } from '@/lib/utils'
import { useTema } from '@/theme/ThemeProvider'
import { BotoesDecisao, ResultadoDecisao, type Decisao } from './botoes-decisao'

/** Cartões da S01 no chat: ajuda do sistema, regra (job), cálculo, prévia de mensagem e escolha. */

type Por<T extends Cartao['tipo']> = Extract<Cartao, { tipo: T }>
const casca = 'bg-card flex flex-col gap-3 rounded-xl border p-4'

/** Resposta do assistente de ajuda: passos e o caminho na tela; "Abrir o Suporte" para falar com pessoas. */
export function CartaoAjuda({ cartao }: { cartao: Por<'ajuda'> }) {
  const nav = useNavegacao()
  return (
    <div className={casca}>
      <div className="flex items-center gap-2 text-xs">
        <QuestionIcon className="text-muted-foreground size-4" />
        <span className="text-muted-foreground">Ajuda do sistema · não gasta o seu limite de IA</span>
      </div>
      <ol className="flex list-decimal flex-col gap-1 pl-5 text-sm">
        {cartao.passos.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ol>
      <div className="flex flex-wrap gap-2">
        {cartao.destino && !nav.vitrine && (
          <Button size="sm" className="rounded-full" onClick={() => nav.irPara({ modulo: cartao.destino!.modulo as IdModulo, ...(cartao.destino!.aba ? { aba: cartao.destino!.aba } : {}) })}>
            {cartao.destino.rotulo} <ArrowRightIcon />
          </Button>
        )}
        <Button size="sm" variant="ghost" className="rounded-full" onClick={() => abrirSuporte()}>
          <LifebuoyIcon /> Falar com o Suporte
        </Button>
      </div>
    </div>
  )
}

/** "Me avise quando..." devolvido como regra (02, 7.3). Sim vira job do integrante; a regra se corrige no próprio cartão (fase 6); não descarta. */
export function CartaoRegra({ cartao }: { cartao: Por<'regra'> }) {
  const loja = useLoja()
  const { usuario } = useSessao()
  const { integrante } = useTema()
  const { criar } = useJobs()
  const nav = useNavegacao()
  const i = integrante(cartao.integrante)
  const decidido = loja.estado.decisoes[cartao.id] as Decisao | undefined
  const [regra, setRegra] = useState(cartao.regra)
  const corrigida = regra !== cartao.regra
  const decidir = (d: Decisao) => {
    loja.decidir(cartao.id, d)
    if (d === 'recusar') return loja.toast('Descartado. Nada vai ser vigiado.')
    criar({ integrante: cartao.integrante, titulo: cartao.pedido.replace(/^me avis[ea] (quando|se)\s*/i, '').slice(0, 60) || 'Regra do chat', regra, quando: cartao.linhas.find((l) => l.rotulo === 'Quando confere')?.valor ?? 'todo dia, 08:00', tipo: 'agendado', ativo: true, custo: 0.08 })
    loja.registrar(usuario.nome, `Criou a regra para ${i.nome}${corrigida ? ` (corrigiu antes de ligar; sugerida: ${cartao.regra})` : ''}: ${regra}`)
    loja.toast(`${i.nome} passou a vigiar isso. Os resultados aparecem no chat dele.`, { modulo: 'inicio', aba: 'time' }, 'Ver jobs no Time')
  }
  return (
    <div className={cn(casca, !decidido && cartao.compilavel && 'border-warning/60')}>
      <div className="flex items-center gap-2">
        <Orb cor={i.cor} corOlhos={i.corOlhos} tamanho={22} extras={false} cutucavel={false} />
        <span className="text-muted-foreground text-xs">{cartao.compilavel ? `Regra para ${i.nome} vigiar` : 'Não consigo vigiar isso'}</span>
      </div>
      <p className="text-sm font-medium">
        {cartao.compilavel && !decidido ? <ValorEditavel rotulo="Regra" valor={regra} config={{ tipo: 'texto', multilinha: true, validar: (v) => (v.trim() ? null : 'Escreva a regra.') }} desfazer={false} onMudar={(v) => setRegra(v.trim())} /> : cartao.compilavel ? regra : cartao.motivo}
      </p>
      {cartao.compilavel && (
        <dl className="bg-muted/60 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded-lg px-3 py-2 text-xs">
          {cartao.linhas.map((l) => (
            <div key={l.rotulo} className="contents">
              <dt className="text-muted-foreground">{l.rotulo}</dt>
              <dd className="font-medium">{l.valor}</dd>
            </div>
          ))}
        </dl>
      )}
      {cartao.compilavel &&
        (decidido ? (
          <div className="flex items-center gap-2">
            <ResultadoDecisao decisao={decidido} />
            {decidido !== 'recusar' && !nav.vitrine && (
              <Button size="sm" variant="link" className="h-auto px-0" onClick={() => nav.irPara({ modulo: 'inicio', aba: 'time' })}>
                ver no Time
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => decidir(corrigida ? 'editar_e_aprovar' : 'aprovar')}>
              <CheckIcon weight="bold" /> {corrigida ? 'Sim, vigie com a correção' : 'Sim, vigie'}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => decidir('recusar')}>
              <XIcon /> Não
            </Button>
          </div>
        ))}
    </div>
  )
}

/** Cálculo com a fórmula e a origem de cada número. */
export function CartaoCalculo({ cartao }: { cartao: Por<'calculo'> }) {
  const [aberto, setAberto] = useState(false)
  return (
    <div className={casca}>
      <div className="flex items-start gap-2">
        <CalculatorIcon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="text-muted-foreground text-xs">{cartao.titulo}</div>
          <div className="text-xl font-light tabular-nums">{cartao.resultado}</div>
        </div>
        <Badge variant="outline">demonstração</Badge>
      </div>
      <dl className="bg-muted/60 grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 rounded-lg px-3 py-2 text-xs">
        {cartao.linhas.map(([a, b]) => (
          <div key={a} className="contents">
            <dt className="text-muted-foreground">{a}</dt>
            <dd className="text-right font-medium tabular-nums">{b}</dd>
          </div>
        ))}
      </dl>
      <button type="button" aria-expanded={aberto} onClick={() => setAberto((v) => !v)} className="text-muted-foreground hover:text-foreground w-fit cursor-pointer text-xs underline-offset-2 hover:underline">
        {aberto ? 'esconder a conta' : 'ver a conta e a origem'}
      </button>
      {aberto && (
        <div className="text-muted-foreground flex flex-col gap-1 text-xs">
          <code className="bg-sunken rounded px-2 py-1">{cartao.formula}</code>
          <span>Origem: {cartao.origem}</span>
        </div>
      )}
    </div>
  )
}

const rotuloCanal = { whatsapp: 'WhatsApp', email: 'E-mail', app: 'App' } as const

/** Pré-visualização de mensagem: editar texto e canal; enviar pede aprovação (sai ao cliente) e grava na conversa do setor no CRM. */
export function CartaoPreviaMensagem({ cartao }: { cartao: Por<'previa_mensagem'> }) {
  const loja = useLoja()
  const { usuario } = useSessao()
  const conversaDe = useConversaDe()
  const decidido = loja.estado.decisoes[cartao.id] as Decisao | undefined
  const [texto, setTexto] = useState(cartao.texto)
  const [canal, setCanal] = useState(cartao.canal)
  const [pedindo, setPedindo] = useState(false)
  const decidir = (d: Decisao) => {
    loja.decidir(cartao.id, d)
    if (d === 'recusar') return loja.toast('Mensagem descartada. Nada saiu.')
    const cv = conversaDe(cartao.cliente, cartao.setor, cartao.para)
    loja.mensagemCrm(cv, { tipo: 'mensagem', de: 'atendente', autor: usuario.nome, canal, texto: texto.trim(), entrega: 'enviada' })
    loja.registrar(usuario.nome, `Aprovou e enviou mensagem a ${cartao.para} (${cartao.cliente}) pelo ${rotuloCanal[canal]}`)
    loja.toast(`Enviada a ${cartao.para} pelo ${rotuloCanal[canal]}.`, { modulo: 'crm', aba: 'conversas', conversa: cv }, 'Ver a conversa')
  }
  return (
    <div className={cn(casca, (pedindo && !decidido) && 'border-warning/60')}>
      <div className="flex items-center gap-2 text-xs">
        <EyeIcon className="text-muted-foreground size-4" />
        <span className="text-muted-foreground">
          Rascunho para {cartao.para} · {cartao.cliente}
        </span>
      </div>
      {decidido ? (
        <>
          <p className="bg-sunken rounded-lg p-3 text-sm whitespace-pre-wrap">{texto}</p>
          <ResultadoDecisao decisao={decidido} />
        </>
      ) : (
        <>
          <textarea value={texto} onChange={(e) => setTexto(e.target.value)} rows={4} aria-label="Texto da mensagem" disabled={pedindo} className="bg-sunken rounded-lg p-3 text-sm outline-none disabled:opacity-80" />
          <div role="radiogroup" aria-label="Canal" className="bg-sunken flex w-fit rounded-full p-0.5 text-xs">
            {(['whatsapp', 'email', 'app'] as const).map((c) => (
              <button key={c} type="button" role="radio" aria-checked={canal === c} disabled={pedindo} onClick={() => setCanal(c)} className={cn('cursor-pointer rounded-full px-2.5 py-1', canal === c && 'bg-raised shadow-pilula')}>
                {rotuloCanal[c]}
              </button>
            ))}
          </div>
          {pedindo ? (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium">Isto sai ao cliente: precisa da sua aprovação.</span>
              <BotoesDecisao semEditar onDecidir={decidir} />
            </div>
          ) : (
            <Button size="sm" className="w-fit rounded-full" disabled={!texto.trim()} onClick={() => setPedindo(true)}>
              <PaperPlaneTiltIcon /> Enviar
            </Button>
          )}
        </>
      )}
    </div>
  )
}

/** Confiança baixa: a pessoa escolhe o que quis dizer. */
export function CartaoEscolha({ cartao, onEscolher }: { cartao: Por<'escolha'>; onEscolher?: (texto: string) => void }) {
  const [escolhido, setEscolhido] = useState<string | null>(null)
  return (
    <div className={casca}>
      <p className="text-sm">{cartao.pergunta}</p>
      <div className="flex flex-wrap gap-2">
        {cartao.opcoes.map((o) => (
          <Button
            key={o.rotulo}
            size="sm"
            variant={escolhido === o.rotulo ? 'default' : 'outline'}
            className="rounded-full"
            disabled={!!escolhido}
            onClick={() => {
              setEscolhido(o.rotulo)
              onEscolher?.(o.texto)
            }}
          >
            {o.rotulo}
          </Button>
        ))}
      </div>
    </div>
  )
}

import { ArrowRightIcon, ArrowBendDownRightIcon, ShieldCheckIcon, TableIcon, XIcon } from '@phosphor-icons/react'
import { CartaoRascunho } from './cartao-rascunho'
import { ArrowsLeftRightIcon, ChatCircleTextIcon, FileTextIcon, ReceiptIcon } from '@phosphor-icons/react'
import { useState, useEffect, useRef } from 'react'
import { useDocumentos } from '@/ambiente/documentos'
import { useEfeitosCartao } from '@/ambiente/efeitos'
import { clientePorNome, integranteDoSetor, useFluxos } from '@/ambiente/fluxos'
import { usePedirIntegrante } from '@/ambiente/pedir'
import { useLoja, useNavegacao } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import { ValorEditavel, textoDoValor, type QualquerValor } from '@/components/kit/valor-editavel'
import { banco } from '@/nucleo/banco'
import { repos } from '@/nucleo/repositorios'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Orb } from '@/components/ui/orb'
import type { ArgumentoCartao, Cartao } from '@/dados/tipos'
import type { SetorIntegrante } from '@/theme/tipos'
import { cn } from '@/lib/utils'
import { useTema } from '@/theme/ThemeProvider'
import { AvisoIntegrante } from './aviso-integrante'
import { CartaoRespostaLegal } from './cartoes-legal'
import { ProgressoTrabalho } from './progresso-trabalho'
import { BotoesDecisao, ResultadoDecisao, type Decisao } from './botoes-decisao'
import { CartaoTarefa } from './cartao-tarefa'
import { CartaoAjuda, CartaoCalculo, CartaoEscolha, CartaoPreviaMensagem, CartaoRegra } from './cartoes-s01'
import { AreaRolagem } from '@/components/ui/area-rolagem'

type Por<T extends Cartao['tipo']> = Extract<Cartao, { tipo: T }>

const casca = 'bg-card flex flex-col gap-3 rounded-xl border p-4'

/** Assinatura curta dos argumentos (FNV-1a): muda quando a pessoa corrige um argumento. */
function assinatura(args: ArgumentoCartao[]): string {
  let h = 0x811c9dc5
  for (const ch of JSON.stringify(args.map((a) => [a.rotulo, a.bruto ?? a.valor]))) h = Math.imul(h ^ ch.charCodeAt(0), 0x01000193) >>> 0
  return h.toString(16).padStart(8, '0').slice(0, 7)
}

/** Alterações já registradas no cartão do banco (corrigido em outro lugar: chat, sino, central). */
function alteracoesGuardadas(id: string): { rotulo: string; de: string; para: string }[] {
  const lista = (banco.obter('cartao_aprovacao', id)?.extras?.alteracoes as { rotulo: string; de: string; para: string }[] | undefined) ?? []
  const porRotulo = new Map<string, { rotulo: string; de: string; para: string }>()
  for (const x of lista) porRotulo.set(x.rotulo, { rotulo: x.rotulo, de: porRotulo.get(x.rotulo)?.de ?? x.de, para: x.para })
  return [...porRotulo.values()]
}

/**
 * Cartão de aprovação (Fundações 6.4; fase 6): resumo, argumentos, aprovar ou
 * recusar, expira em. Os argumentos ligados a um campo da ação são editáveis no
 * próprio cartão (ValorEditavel): a correção muda a ação guardada no cartão, a
 * assinatura dos argumentos muda e a alteração fica registrada; aprovar depois
 * de corrigir vale como "aprovado com edição". Não há mais "Editar e aprovar".
 *
 * Com `comentario` (central de aprovações), a pessoa pode deixar um porquê:
 * opcional ao aprovar ("Comentar") e oferecido ao recusar. O comentário segue
 * com a decisão e vira lição do integrante.
 */
export function CartaoAprovacao({ cartao, onDecidir, comentario: comComentario, className }: { cartao: Por<'aprovacao'>; onDecidir?: (d: Decisao, comentario?: string) => void; semEditar?: boolean; /** Campo curto e opcional de comentário (vira lição do integrante). */ comentario?: boolean; className?: string }) {
  const loja = useLoja()
  const { usuario } = useSessao()
  const [local, setDecidido] = useState<Decisao | null>(null)
  const decidido = (loja.estado.decisoes[cartao.id] as Decisao | undefined) ?? local
  const [args, setArgs] = useState<ArgumentoCartao[]>(cartao.argumentos ?? [])
  const [alteracoes, setAlteracoes] = useState<{ rotulo: string; de: string; para: string }[]>(() => alteracoesGuardadas(cartao.id))
  // A assinatura de origem é a de quando o cartão chegou: a correção gravada no banco não a muda.
  const [original] = useState(() => assinatura(cartao.argumentos ?? []))
  const atual = assinatura(args)
  const [etapa, setEtapa] = useState<'botoes' | 'comentando' | 'recusando'>('botoes')
  const [nota, setNota] = useState('')
  const campoNota = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (etapa !== 'botoes') campoNota.current?.focus()
  }, [etapa])
  const corrigir = (i: number, v: QualquerValor) => {
    const a = args[i]
    if (!a.editavel || !a.campo) return
    const texto = textoDoValor(a.editavel, v)
    const novos = args.map((x, k) => (k === i ? { ...x, valor: texto, bruto: v } : x))
    const alteracao = { rotulo: a.rotulo, de: a.valor, para: texto }
    setArgs(novos)
    setAlteracoes((xs) => [...xs.filter((x) => x.rotulo !== a.rotulo), { ...alteracao, de: xs.find((x) => x.rotulo === a.rotulo)?.de ?? a.valor }])
    // A ação guardada no cartão muda junto: aprovar (aqui, no sino ou na Visão geral) executa o corrigido.
    const linha = banco.obter('cartao_aprovacao', cartao.id)
    if (linha)
      repos.cartoes.atualizar(
        cartao.id,
        { argumentos: { ...(linha.argumentos as Record<string, unknown>), [a.campo]: v }, extras: { ...linha.extras, alteracoes: [...((linha.extras?.alteracoes as unknown[]) ?? []), { ...alteracao, por: usuario.nome, em: new Date().toISOString() }], assinatura_argumentos: assinatura(novos) } },
        { texto: `${usuario.nome} alterou “${a.rotulo}” de ${a.valor} para ${texto} antes de aprovar: ${cartao.resumo}` },
      )
  }
  const decidir = (d: Decisao) => {
    const final: Decisao = d === 'aprovar' && alteracoes.length ? 'editar_e_aprovar' : d
    setDecidido(final)
    onDecidir?.(final, nota.trim() || undefined)
  }
  const idNota = `nota-${cartao.id}`
  return (
    <div data-cartao-pendente={!decidido || undefined} className={cn(casca, !decidido && 'border-warning/60', className)}>
      <div className="flex items-start gap-2">
        <ShieldCheckIcon className="text-warning mt-0.5 size-4 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="text-muted-foreground text-xs">Pede sua aprovação{cartao.lote ? ` · lote de ${cartao.lote}` : ''}</div>
          <div className="text-sm font-medium break-words">{cartao.resumo}</div>
        </div>
        {cartao.expiraEm && !decidido && <span className="text-muted-foreground shrink-0 text-xs">{cartao.expiraEm}</span>}
      </div>
      {args.length > 0 && (
        <dl className="bg-muted/60 grid grid-cols-[max-content_minmax(0,1fr)] gap-x-4 gap-y-1 rounded-lg px-3 py-2 text-xs">
          {args.map((a, i) => (
            <div key={a.rotulo} className="contents">
              <dt className="text-muted-foreground">{a.rotulo}</dt>
              <dd className="min-w-0 font-medium break-words tabular-nums">{a.editavel && a.campo && !decidido ? <ValorEditavel rotulo={a.rotulo} valor={a.bruto ?? a.valor} config={a.editavel} formatar={() => args[i].valor} desfazer={false} onMudar={(v) => corrigir(i, v)} /> : a.valor}</dd>
            </div>
          ))}
        </dl>
      )}
      {alteracoes.length > 0 && (
        <p className="text-muted-foreground text-xs" aria-live="polite">
          Você corrigiu {alteracoes.map((x) => `${x.rotulo.toLowerCase()} (${x.de} → ${x.para})`).join(', ')}. Assinatura dos argumentos: <code className="font-mono">{original}</code> → <code className="font-mono">{atual}</code>.
        </p>
      )}
      {!decidido && comComentario && etapa !== 'botoes' && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor={idNota} className="text-xs font-medium">
            {etapa === 'recusando' ? 'Por quê? O integrante aprende com isso' : 'Comentário'} <span className="text-muted-foreground font-normal">(opcional)</span>
          </label>
          <Input
            ref={campoNota}
            id={idNota}
            value={nota}
            maxLength={280}
            placeholder={etapa === 'recusando' ? 'Ex.: o cliente pediu para esperar a nota corrigida' : 'Ex.: da próxima vez, mande pelo WhatsApp'}
            onChange={(e) => setNota(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') (e.preventDefault(), decidir(etapa === 'recusando' ? 'recusar' : 'aprovar'))
              if (e.key === 'Escape') (e.stopPropagation(), setEtapa('botoes'))
            }}
          />
        </div>
      )}
      {decidido ? (
        <ResultadoDecisao decisao={decidido} />
      ) : comComentario && etapa === 'recusando' ? (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => decidir('recusar')}>
            <XIcon /> {nota.trim() ? 'Recusar' : 'Recusar sem comentário'}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setEtapa('botoes')}>
            Voltar
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <BotoesDecisao lote={cartao.lote} semEditar rotuloAprovar={alteracoes.length ? 'Aprovar com a correção' : undefined} onDecidir={(d) => (comComentario && d === 'recusar' ? setEtapa('recusando') : decidir(d))} />
          {comComentario && etapa === 'botoes' && (
            <Button size="sm" variant="link" className="text-muted-foreground px-1" onClick={() => setEtapa('comentando')}>
              <ChatCircleTextIcon /> Comentar
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

/** "Encaminhei para X", com a resposta do integrante como citação (02, 9.1). */
export function CartaoEncaminhamento({ cartao, onAbrir, className }: { cartao: Por<'encaminhamento'>; onAbrir?: () => void; className?: string }) {
  const { integrante } = useTema()
  const i = integrante(cartao.para)
  if (cartao.de) return <PassagemAnimada cartao={cartao as Por<'encaminhamento'> & { de: SetorIntegrante }} onAbrir={onAbrir} className={className} />
  return (
    <div className={cn(casca, className)}>
      <div className="flex items-center gap-2 text-sm">
        <ArrowBendDownRightIcon className="text-muted-foreground size-4" />
        <span>
          Encaminhei para <strong>{i.nome}</strong>
        </span>
        {onAbrir && (
          <Button size="sm" variant="link" className="ml-auto h-auto px-0" onClick={onAbrir}>
            Abrir chat <ArrowRightIcon />
          </Button>
        )}
      </div>
      <div className="text-muted-foreground text-xs">Pedido: {cartao.pedido}</div>
      {cartao.resposta && (
        <blockquote className="flex gap-2.5 border-l-2 pl-3" style={{ borderColor: i.cor }}>
          <Orb cor={i.cor} corOlhos={i.corOlhos} tamanho={22} extras={false} />
          <p className="text-sm">{cartao.resposta}</p>
        </blockquote>
      )}
    </div>
  )
}

/**
 * Passagem de trabalho entre integrantes (demonstração): o pedido sai do orb de
 * quem passa e chega ao de quem recebe, em ~1,6 s; depois fica o registro.
 * O tempo sai de `em`, então voltar à aba no meio mostra o ponto certo.
 */
function PassagemAnimada({ cartao, onAbrir, className }: { cartao: Por<'encaminhamento'> & { de: SetorIntegrante }; onAbrir?: () => void; className?: string }) {
  const { integrante } = useTema()
  const de = integrante(cartao.de)
  const para = integrante(cartao.para)
  const DUR = 1600
  const [agora, setAgora] = useState(Date.now())
  const inicio = cartao.em ?? 0
  const passando = agora < inicio + DUR
  useEffect(() => {
    if (!passando) return
    const id = window.setInterval(() => setAgora(Date.now()), 50)
    return () => window.clearInterval(id)
  }, [passando])
  const p = Math.max(0, Math.min(1, (agora - inicio) / DUR))
  const ease = p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2
  return (
    <div className={cn(casca, className)}>
      <div className="flex items-center gap-2">
        <Orb cor={de.cor} corOlhos={de.corOlhos} tamanho={26} estado="trabalhando" animado={passando} extras={false} cutucavel={false} />
        <div className="bg-sunken relative h-1 flex-1 rounded-full">
          <span className="bg-foreground/70 absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full shadow" style={{ left: `${ease * 100}%`, opacity: passando ? 1 : 0, transition: 'opacity .3s' }} />
          <span className="bg-foreground/25 absolute inset-y-0 left-0 rounded-full" style={{ width: `${ease * 100}%` }} />
        </div>
        <Orb cor={para.cor} corOlhos={para.corOlhos} tamanho={26} estado={p >= 1 ? 'trabalhando' : 'disponivel'} animado={p > 0.85} extras={false} cutucavel={false} />
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span className="min-w-0 flex-1">
          {passando ? (
            <>
              Passando para <strong>{para.nome}</strong>…
            </>
          ) : (
            <>
              <strong>{de.nome}</strong> passou para <strong>{para.nome}</strong>
            </>
          )}
          <span className="text-muted-foreground block text-xs">{cartao.pedido}</span>
        </span>
        {!passando && onAbrir && (
          <Button size="sm" variant="link" className="h-auto shrink-0 px-0" onClick={onAbrir}>
            Abrir chat <ArrowRightIcon />
          </Button>
        )}
      </div>
    </div>
  )
}

/** Tabela de resultado de consulta (M2), com "ver na aba". */
export function CartaoTabela({ cartao, onVerNaAba, className }: { cartao: Por<'tabela'>; onVerNaAba?: () => void; className?: string }) {
  return (
    <div className={cn('bg-card overflow-hidden rounded-xl border', className)}>
      <div className="flex items-center gap-2 border-b px-4 py-2.5">
        <TableIcon className="text-muted-foreground size-4" />
        <span className="text-sm font-medium">{cartao.titulo}</span>
        {cartao.total != null && <Badge variant="secondary">{cartao.total}</Badge>}
        {onVerNaAba && (
          <Button size="sm" variant="link" className="ml-auto h-auto px-0" onClick={onVerNaAba}>
            Ver na aba <ArrowRightIcon />
          </Button>
        )}
      </div>
      <AreaRolagem eixo="x" className="">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted-foreground text-xs">
              {cartao.colunas.map((c) => (
                <th key={c.chave} className={cn('px-4 py-2 font-medium', c.alinhamento === 'direita' ? 'text-right' : 'text-left')}>
                  {c.rotulo}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {cartao.linhas.map((l, idx) => (
              <tr key={idx}>
                {cartao.colunas.map((c) => (
                  <td key={c.chave} className={cn('px-4 py-2', c.alinhamento === 'direita' && 'text-right tabular-nums')}>
                    {l[c.chave]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </AreaRolagem>
    </div>
  )
}

/** Documento ou guia (02, 9.3): nome, competência, valor, vencimento, abrir. */
export function CartaoDocumento({ cartao, onAbrir, onBaixar, onVer, className }: { cartao: Por<'documento'>; onAbrir?: () => void; onBaixar?: () => void; /** Abre o documento no visualizador. */ onVer?: () => void; className?: string }) {
  const Icone = cartao.especie === 'guia' ? ReceiptIcon : FileTextIcon
  return (
    <div className={cn(casca, 'flex-row flex-wrap items-center gap-4', className)}>
      <span className="bg-sunken flex size-11 shrink-0 items-center justify-center rounded-md">
        <Icone className="text-muted-foreground size-6" />
      </span>
      <div className="min-w-0 flex-1 basis-40">
        {onVer ? (
          <button type="button" onClick={onVer} className="block max-w-full cursor-pointer truncate text-left text-sm font-medium underline-offset-2 hover:underline">
            {cartao.nome}
          </button>
        ) : (
          <div className="truncate text-sm font-medium">{cartao.nome}</div>
        )}
        <div className="text-muted-foreground flex flex-wrap gap-x-3 text-xs">
          <span>competência {cartao.competencia}</span>
          {cartao.valor && <span className="text-foreground tabular-nums">{cartao.valor}</span>}
          {cartao.vencimento && <span>vence {cartao.vencimento}</span>}
          {cartao.pago != null && <Badge variant={cartao.pago ? 'sucesso' : 'outline'}>{cartao.pago ? 'paga' : 'não paga'}</Badge>}
        </div>
      </div>
      <span className="ml-auto flex shrink-0 flex-wrap justify-end gap-1">
        {onVer && (
          <Button size="sm" variant="ghost" onClick={onVer}>
            Abrir
          </Button>
        )}
        {onBaixar && (
          <Button size="sm" variant="ghost" onClick={onBaixar}>
            Baixar
          </Button>
        )}
        {onAbrir && (
          <Button size="sm" variant="outline" onClick={onAbrir}>
            Enviar ao cliente
          </Button>
        )}
      </span>
    </div>
  )
}

const rotuloCrm = { aberta: 'aberta', aguardando: 'aguardando cliente', resolvida: 'resolvida' } as const

/** Conversa do CRM (subplano 04): cliente, pessoa, canal, status, abrir no CRM. */
export function CartaoConversaCrm({ cartao, onAbrir, className }: { cartao: Por<'conversa_crm'>; onAbrir?: () => void; className?: string }) {
  return (
    <div className={cn(casca, className)}>
      <div className="flex items-start gap-3">
        <span className="bg-sunken flex size-11 shrink-0 items-center justify-center rounded-md">
          <ChatCircleTextIcon className="text-muted-foreground size-6" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-sm font-medium">{cartao.pessoa}</span>
            <Badge variant={cartao.status === 'aguardando' ? 'destaque' : cartao.status === 'resolvida' ? 'sucesso' : 'outline'}>{rotuloCrm[cartao.status]}</Badge>
          </div>
          <div className="text-muted-foreground text-xs">
            {cartao.cliente} · {cartao.canal}
          </div>
          <p className="bg-sunken mt-2 rounded-md px-3 py-2 text-sm">“{cartao.ultima}”</p>
        </div>
      </div>
      {onAbrir && (
        <div className="flex justify-end">
          <Button size="sm" variant="outline" onClick={onAbrir}>
            Abrir no CRM <ArrowRightIcon />
          </Button>
        </div>
      )}
    </div>
  )
}

/**
 * Passagem de trabalho entre integrantes de usuários diferentes (02, 8.4):
 * "Fiscal (de Fernanda) passou Sublimite da Padaria para DP (Ana Souza)".
 */
export function CartaoPassagem({ cartao, onAbrir, className }: { cartao: Por<'passagem'>; onAbrir?: () => void; className?: string }) {
  const { integrante } = useTema()
  const de = integrante(cartao.de.setor)
  const para = integrante(cartao.para.setor)
  return (
    <div className={cn('bg-surface flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg px-4 py-3 text-sm shadow-contorno', className)}>
      <ArrowsLeftRightIcon className="text-muted-foreground size-4 shrink-0" />
      <span className="flex items-center gap-1.5">
        <Orb cor={de.cor} corOlhos={de.corOlhos} tamanho={18} extras={false} cutucavel={false} />
        <strong className="font-medium">{cartao.de.pessoa}</strong>
        <span className="text-muted-foreground">(de {cartao.de.dono})</span>
      </span>
      <span className="text-muted-foreground">passou</span>
      <strong className="font-medium">{cartao.assunto}</strong>
      <span className="text-muted-foreground">da {cartao.cliente} para</span>
      <span className="flex items-center gap-1.5">
        <Orb cor={para.cor} corOlhos={para.corOlhos} tamanho={18} extras={false} cutucavel={false} />
        <strong className="font-medium">{cartao.para.pessoa}</strong>
        <span className="text-muted-foreground">(de {cartao.para.dono})</span>
      </span>
      {onAbrir && (
        <Button size="sm" variant="link" className="ml-auto h-auto px-0" onClick={onAbrir}>
          Ver tarefa <ArrowRightIcon />
        </Button>
      )}
    </div>
  )
}

/** O integrante devolve a quem pediu (o Assistente) o resultado em uma frase (02, 9.1: a resposta como citação). */
export function CartaoRetorno({ cartao, className }: { cartao: Por<'retorno'>; className?: string }) {
  const { integrante } = useTema()
  const de = integrante(cartao.de)
  const geral = integrante('geral')
  return (
    <div className={cn('bg-sunken flex flex-col gap-1.5 rounded-lg px-4 py-3 text-sm', className)}>
      <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
        <ArrowBendDownRightIcon className="size-3.5 -scale-x-100" />
        {de.nome} devolveu ao {geral.nome}
      </span>
      <p className="leading-relaxed">“{cartao.texto}”</p>
    </div>
  )
}

export interface AcoesCartao {
  onDecidir?: (cartaoId: string, d: Decisao) => void
  onAbrirIntegrante?: (setor: Por<'encaminhamento'>['para']) => void
  onVerNaAba?: (cartaoId: string) => void
  /** S01: reenviar um texto na mesma conversa (cartão de escolha). */
  onEnviar?: (texto: string) => void
}

/** Escolhe o cartão certo pelo tipo. Sem ações de fora, usa os fluxos do escritório (abrir tarefa, CRM, enviar, aprovar com efeito). */
export function CartaoChat({ cartao, acoes }: { cartao: Cartao; acoes?: AcoesCartao }) {
  const fluxos = useFluxos()
  const docs = useDocumentos()
  const nav = useNavegacao()
  const loja = useLoja()
  const pedirIntegrante = usePedirIntegrante()
  const efeitos = useEfeitosCartao()
  const decidir = (id: string, d: Decisao) => (acoes?.onDecidir ? acoes.onDecidir(id, d) : efeitos(id, d))
  // Vitrine (o site): sem os destinos de fora do Início, os cartões não mostram botões que não levariam a lugar nenhum.
  const vitrine = !!nav.vitrine
  const leitura = nav.vitrine === 'leitura'
  switch (cartao.tipo) {
    case 'aprovacao':
      return <CartaoAprovacao cartao={cartao} semEditar={vitrine} onDecidir={(d) => decidir(cartao.id, d)} />
    case 'encaminhamento':
      if (leitura) return <CartaoEncaminhamento cartao={cartao} />
      return <CartaoEncaminhamento cartao={cartao} onAbrir={() => (acoes?.onAbrirIntegrante ? acoes.onAbrirIntegrante(cartao.para) : nav.irPara({ modulo: 'inicio', aba: 'time', integrante: integranteDoSetor(cartao.para) }))} />
    case 'tabela':
      return <CartaoTabela cartao={cartao} onVerNaAba={vitrine ? undefined : () => (acoes?.onVerNaAba ? acoes.onVerNaAba(cartao.id) : nav.irPara({ modulo: 'painel', aba: 'fiscal' }))} />
    case 'tarefa': {
      const atual = loja.tarefas.find((t) => t.id === cartao.tarefa.id) ?? cartao.tarefa
      if (vitrine) return <CartaoTarefa tarefa={atual} />
      return (
        <CartaoTarefa
          tarefa={atual}
          onAbrir={() => fluxos.abrirTarefa(atual.id)}
          onIniciar={() => {
            loja.atualizarTarefa(atual.id, { status: 'em_andamento' })
            loja.toast(`${atual.codigo} · ${atual.cliente}: iniciada.`)
          }}
          pedir={pedirIntegrante(atual)}
        />
      )
    }
    case 'aviso':
      return <AvisoIntegrante aviso={cartao.aviso} embutido idDecisao={cartao.id} onDecidir={(d) => decidir(cartao.id, d)} />
    case 'documento':
      if (vitrine) return <CartaoDocumento cartao={cartao} />
      return (
        <CartaoDocumento
          cartao={cartao}
          onVer={() => docs.abrir(cartao.nome, { clienteNome: cartao.cliente, origem: 'gerado_plataforma', por: 'integrante' })}
          onBaixar={() => fluxos.baixar(cartao.nome)}
          onAbrir={() =>
            fluxos.enviar({
              cliente: cartao.cliente,
              setor: cartao.especie === 'guia' ? 'fiscal' : clientePorNome(cartao.cliente) && cartao.nome.toLowerCase().includes('contrato') ? 'dp' : 'fiscal',
              texto: '',
              anexo: cartao.nome,
              assunto: cartao.nome,
            })
          }
        />
      )
    case 'conversa_crm': {
      const alvo = cartao.conversa ?? loja.conversas.find((c) => c.cliente === cartao.cliente && cartao.pessoa.startsWith(c.pessoa.nome))?.id
      return <CartaoConversaCrm cartao={cartao} onAbrir={vitrine ? undefined : () => nav.irPara({ modulo: 'crm', aba: 'conversas', conversa: alvo })} />
    }
    case 'trabalho': {
      const t = loja.estado.trabalhos.find((x) => x.uid === cartao.uid)
      if (!t) return null
      if (leitura) return <ProgressoTrabalho trabalho={t} />
      return (
        <button type="button" className="w-full cursor-pointer text-left" onClick={() => nav.irPara({ modulo: 'inicio', aba: 'time', integrante: t.integrante })} aria-label={`Abrir o chat de quem está fazendo: ${t.titulo}`}>
          <ProgressoTrabalho trabalho={t} />
        </button>
      )
    }
    case 'retorno':
      return <CartaoRetorno cartao={cartao} />
    case 'resposta_legal':
      return <CartaoRespostaLegal resposta={cartao.resposta} />
    case 'ajuda':
      return <CartaoAjuda cartao={cartao} />
    case 'regra':
      return <CartaoRegra cartao={cartao} />
    case 'calculo':
      return <CartaoCalculo cartao={cartao} />
    case 'previa_mensagem':
      return <CartaoPreviaMensagem cartao={cartao} />
    case 'escolha':
      return <CartaoEscolha cartao={cartao} onEscolher={acoes?.onEnviar} />
    case 'rascunho':
      return <CartaoRascunho cartao={cartao} />
    case 'passagem':
      return <CartaoPassagem cartao={cartao} onAbrir={vitrine ? undefined : () => nav.irPara({ modulo: 'inicio', aba: 'time', integrante: integranteDoSetor(cartao.para.setor) })} />
  }
}

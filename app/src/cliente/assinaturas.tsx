import { CaretRightIcon, CheckCircleIcon, FingerprintIcon, PenNibIcon, SealCheckIcon, UploadSimpleIcon, WarningCircleIcon } from '@phosphor-icons/react'
import { useEffect, useRef, useState } from 'react'
import { fichas } from '@/ambiente/clientes'
import { useLoja } from '@/ambiente/loja'
import { EstadoErro, EstadoVazio, SeloDemonstracao } from '@/components/kit'
import { Button } from '@/components/ui/button'
import { P } from '@/dados/arquivos'
import { servicos, type StatusEnvelope } from '@/servicos'
import { useTema } from '@/theme/ThemeProvider'
import { cn } from '@/lib/utils'
import { ator, idDoUsuario, nomeSetor, useNomeEscritorio, type Ctx } from './contexto'
import { agoraTexto, hashDe, HOJE, textosDoApp } from './dados'
import { useAssinaturas, type DocAssinar } from './estado'
import { AreaTexto, Bloco, Chip, Chips, Faixa, Folha, Selo, TituloTela } from './pecas'

/**
 * Assinatura de documentos no app (06, 5.5): ciência eletrônica simples no
 * próprio app (identidade, data, hora, hash e IP); assinatura avançada pelo
 * provedor (simulado, com o envelope andando até concluir); qualificada fora
 * do app (o cliente assina com o certificado dele e devolve o arquivo).
 * O termo de ciência do DP (C2-06) chega aqui depois de aprovado no escritório.
 */

const rotuloNivel = { ciencia: 'ciência', avancada: 'assinatura eletrônica', qualificada: 'assinatura com certificado (ICP-Brasil)' } as const
const etapas: Record<StatusEnvelope, string> = { enviado: 'Envelope criado no provedor', visualizado: 'Documento aberto', assinado_parcial: 'Assinando…', concluido: 'Assinado', recusado: 'Recusado' }

export function Assinaturas({ ctx }: { ctx: Ctx }) {
  const [lista] = useAssinaturas(ctx.clienteId)
  const [filtro, setFiltro] = useState<'aguardando' | 'feitos'>('aguardando')
  const aberto = ctx.item ? lista.find((a) => a.id === ctx.item) : null
  if (aberto) return <DetalheAssinatura a={aberto} ctx={ctx} />
  const vis = lista.filter((a) => (filtro === 'aguardando' ? a.situacao === 'aguardando' || a.situacao === 'em_conferencia' : a.situacao === 'assinado' || a.situacao === 'recusado'))
  return (
    <div className="flex flex-col gap-3">
      <TituloTela voltar={() => ctx.ir('mais')}>Assinaturas</TituloTela>
      <Chips rotulo="Filtrar assinaturas">
        <Chip ativo={filtro === 'aguardando'} onClick={() => setFiltro('aguardando')} contagem={lista.filter((a) => a.situacao === 'aguardando').length}>
          Para assinar
        </Chip>
        <Chip ativo={filtro === 'feitos'} onClick={() => setFiltro('feitos')}>
          Assinados e recusados
        </Chip>
      </Chips>
      {vis.length === 0 && <EstadoVazio compacto icone={PenNibIcon} titulo={filtro === 'aguardando' ? 'Nada para assinar' : 'Nada assinado ainda'} descricao="Termos, ciências e documentos que o escritório pedir para assinar aparecem aqui." />}
      {vis.map((a) => (
        <button key={a.id} type="button" onClick={() => ctx.ir('assinaturas', a.id)} className="bg-surface shadow-cartao flex cursor-pointer items-center gap-2 rounded-lg px-3.5 py-3 text-left">
          <PenNibIcon className="text-muted-foreground size-5 shrink-0" />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium">{a.titulo}</span>
            <span className="text-muted-foreground block text-xs">
              {rotuloNivel[a.nivel]} · {a.origem}
              {a.prazo && a.situacao === 'aguardando' ? ` · até ${a.prazo.slice(0, 5)}` : ''}
            </span>
          </span>
          <SeloSituacao a={a} />
          <CaretRightIcon className="text-muted-foreground size-4 shrink-0" />
        </button>
      ))}
    </div>
  )
}

function SeloSituacao({ a }: { a: DocAssinar }) {
  return a.situacao === 'assinado' ? <Selo tom="ok">assinado</Selo> : a.situacao === 'recusado' ? <Selo tom="erro">recusado</Selo> : a.situacao === 'em_conferencia' ? <Selo tom="info">em conferência</Selo> : <Selo tom="atencao">para assinar</Selo>
}

function DetalheAssinatura({ a, ctx }: { a: DocAssinar; ctx: Ctx }) {
  const loja = useLoja()
  const { tema } = useTema()
  const nomeEscritorio = useNomeEscritorio()
  const textos = textosDoApp(tema, nomeEscritorio)
  const [, setLista] = useAssinaturas(ctx.clienteId)
  const [li, setLi] = useState(false)
  const [envelope, setEnvelope] = useState<{ id: string; status: StatusEnvelope; fonte: string } | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [recusar, setRecusar] = useState(false)
  const [motivo, setMotivo] = useState('')
  const parar = useRef<(() => void) | null>(null)
  useEffect(() => () => parar.current?.(), [])
  const atualizar = (patch: Partial<DocAssinar>) => setLista((l) => l.map((x) => (x.id === a.id ? { ...x, ...patch } : x)))
  const concluir = (extra: Partial<DocAssinar> = {}) => {
    const hash = hashDe(a.id + a.texto + ctx.contato.nome)
    atualizar({ situacao: 'assinado', assinadoEm: agoraTexto(), assinadoPor: ctx.contato.nome, hash, ip: '189.40.12.7', ...extra })
    // O assinado vira prova ligada ao caso (GES-036), no arquivo do cliente.
    loja.adicionarDocumento({ nome: `${a.titulo} (assinado).pdf`, clienteId: ctx.clienteId, pasta: P.procuracoes, tipo: 'contrato', competencia: '11/2026', origem: 'gerado_plataforma', conector: 'a1', tamanho: '64 KB', quando: HOJE, por: `${ctx.contato.nome} (assinado no app)`, dados: { assinatura: rotuloNivel[a.nivel], hash } })
    const resp = fichas[ctx.clienteId]?.responsaveis[a.setor as keyof (typeof fichas)[string]['responsaveis']]
    loja.avisar({ para: [idDoUsuario(resp) ?? 'u3'], tipo: 'cliente', setor: (a.setor as never) ?? 'dp', titulo: `${ctx.contato.nome} assinou: ${a.titulo}`, detalhe: `${ctx.clienteNome} · ${rotuloNivel[a.nivel]} · guardado como prova`, destino: { modulo: 'arquivos' } })
    loja.registrar(ator(ctx), `Assinou “${a.titulo}” (${rotuloNivel[a.nivel]}, hash ${hash.slice(0, 8)}) · ${ctx.clienteNome}`)
    ctx.avisarApp('Assinado. O comprovante fica em Empresa › Termos e recibos.')
  }
  const assinarProvedor = () => {
    setErro(null)
    servicos.assinatura
      .enviar({ documento: a.titulo, signatarios: [{ nome: ctx.contato.nome, email: ctx.contato.email ?? `${ctx.contato.nome.split(' ')[0].toLowerCase()}@empresa.com.br` }] })
      .then((r) => {
        setEnvelope({ id: r.dados.envelope, status: r.dados.status, fonte: r.fonte })
        atualizar({ envelope: r.dados.envelope, etapa: etapas.enviado })
        parar.current = servicos.assinatura.acompanhar(r.dados.envelope, (s) => {
          setEnvelope((e) => (e ? { ...e, status: s } : e))
          atualizar({ etapa: etapas[s] })
          if (s === 'concluido') concluir({ envelope: r.dados.envelope })
        })
      })
      .catch((e: Error) => setErro(e.message))
  }
  return (
    <div className="flex flex-col gap-3">
      <TituloTela voltar={() => ctx.ir('assinaturas')} acao={<SeloSituacao a={a} />}>
        {rotuloNivel[a.nivel].replace(/^./, (c) => c.toUpperCase())}
      </TituloTela>
      {a.codigo === 'D-16' && (
        <Faixa tom="ok" icone={<SealCheckIcon weight="fill" />}>
          O documento foi assinado pelo contador e a assinatura foi conferida no PDF antes de chegar aqui.
        </Faixa>
      )}
      <article className="bg-raised shadow-cartao flex flex-col gap-3 rounded-lg p-4">
        <header className="flex items-center justify-between gap-2 border-b pb-2">
          <span className="text-muted-foreground text-xs">{textos.produto}</span>
          <span className="text-muted-foreground text-xs">{a.enviadoEm}</span>
        </header>
        <h2 className="text-base font-medium">{a.titulo}</h2>
        <p className="text-sm leading-relaxed">{a.texto}</p>
        <p className="text-muted-foreground text-xs">
          {ctx.clienteNome} · {ctx.contato.nome} ({ctx.contato.papel})
        </p>
        {a.situacao === 'assinado' && (
          <footer className="bg-sunken flex flex-col gap-0.5 rounded-md px-3 py-2 text-xs">
            <span className="flex items-center gap-1 font-medium">
              <FingerprintIcon className="size-3.5" /> Assinado por {a.assinadoPor} em {a.assinadoEm}
            </span>
            <span className="font-mono break-all">sha256:{a.hash} · IP {a.ip}</span>
            {a.envelope && <span>Envelope {a.envelope} (provedor de assinatura)</span>}
          </footer>
        )}
      </article>
      <p className="text-muted-foreground text-xs">
        De {nomeSetor[a.setor as never] ?? a.setor} · {a.origem}
        {a.lembretes?.length ? ` · lembretes: ${a.lembretes.join(', ')}` : ''}
      </p>
      {a.situacao === 'recusado' && <p className="text-sm">Recusado: “{a.motivoRecusa}”. O escritório responde na conversa.</p>}

      {a.situacao === 'aguardando' && !ctx.leitura && (
        <>
          {a.nivel === 'ciencia' && (
            <Bloco titulo="Dar ciência">
              <label className="flex cursor-pointer items-start gap-2 text-sm">
                <input type="checkbox" checked={li} onChange={(e) => setLi(e.target.checked)} className="accent-primary mt-0.5 size-4" /> Li o documento inteiro.
              </label>
              <Button className="rounded-full" disabled={!li} onClick={() => concluir()}>
                Li e estou ciente
              </Button>
              <p className="text-muted-foreground text-[11px]">Fica registrado com a sua identidade, data, hora, a impressão digital do documento e o IP.</p>
            </Bloco>
          )}
          {a.nivel === 'avancada' && (
            <Bloco titulo="Assinar" acao={envelope && <SeloDemonstracao fonte={envelope.fonte} />}>
              {!envelope ? (
                <>
                  <p className="text-muted-foreground text-xs">A assinatura é feita pelo provedor de assinatura eletrônica do escritório; o documento abre aqui, na marca do escritório.</p>
                  <Button className="rounded-full" onClick={assinarProvedor}>
                    <PenNibIcon /> Assinar
                  </Button>
                </>
              ) : (
                <ol className="flex flex-col gap-1 text-sm">
                  {(['enviado', 'visualizado', 'assinado_parcial', 'concluido'] as const).map((s, i, todos) => {
                    const feito = todos.indexOf(envelope.status as (typeof todos)[number]) >= i
                    return (
                      <li key={s} className={cn('flex items-center gap-2', !feito && 'text-muted-foreground')}>
                        {feito ? <CheckCircleIcon className="text-success size-4" weight="fill" /> : <span className="border-muted-foreground size-4 rounded-full border" aria-hidden />} {etapas[s]}
                      </li>
                    )
                  })}
                </ol>
              )}
              {erro && <EstadoErro titulo="O provedor não respondeu" descricao={erro} onTentar={assinarProvedor} />}
            </Bloco>
          )}
          {a.nivel === 'qualificada' && (
            <Bloco titulo="Assinar com o seu certificado">
              <p className="text-sm">Este documento pede assinatura com certificado ICP-Brasil. Baixe, assine no seu emissor ou com o token A3 e mande o arquivo assinado aqui.</p>
              <Button
                className="rounded-full"
                onClick={() => {
                  atualizar({ situacao: 'em_conferencia', etapa: 'arquivo assinado enviado; o escritório confere a assinatura' })
                  loja.registrar(ator(ctx), `Enviou “${a.titulo}” assinado com certificado (${ctx.clienteNome}); aguardando conferência`)
                  ctx.avisarApp('Recebido. O escritório confere a assinatura e avisa.')
                }}
              >
                <UploadSimpleIcon /> Enviar arquivo assinado
              </Button>
            </Bloco>
          )}
          {!envelope && (
            <Button variant="ghost" className="w-fit rounded-full" onClick={() => setRecusar(true)}>
              Não vou assinar
            </Button>
          )}
        </>
      )}
      {recusar && (
        <Folha
          titulo="Não vou assinar"
          onFechar={() => setRecusar(false)}
          rodape={
            <Button
              variant="destructive"
              className="rounded-full"
              disabled={motivo.trim().length < 5}
              onClick={() => {
                atualizar({ situacao: 'recusado', motivoRecusa: motivo.trim() })
                loja.registrar(ator(ctx), `Recusou assinar “${a.titulo}”: ${motivo.trim()} (${ctx.clienteNome})`)
                loja.avisar({ para: ['u3'], tipo: 'cliente', setor: (a.setor as never) ?? 'dp', titulo: `${ctx.contato.nome} recusou assinar: ${a.titulo}`, detalhe: motivo.trim().slice(0, 80), destino: { modulo: 'crm', aba: 'conversas' } })
                setRecusar(false)
                ctx.avisarApp('Avisamos o escritório.')
              }}
            >
              Recusar
            </Button>
          }
        >
          <Faixa tom="atencao" icone={<WarningCircleIcon weight="fill" />}>
            O escritório registra a recusa e conversa com você sobre o risco.
          </Faixa>
          <AreaTexto rotulo="Motivo" valor={motivo} onMudar={setMotivo} />
        </Folha>
      )}
    </div>
  )
}

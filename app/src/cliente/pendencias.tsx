import { CameraIcon, CheckCircleIcon, CropIcon, FileArrowUpIcon, FilePdfIcon, ImageIcon, ListChecksIcon, PaperclipIcon, PlayCircleIcon, ReceiptIcon, SealCheckIcon, WarningCircleIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { fichas } from '@/ambiente/clientes'
import { useConversaDe } from '@/ambiente/fluxos'
import { useLoja } from '@/ambiente/loja'
import { EstadoVazio, SeloDemonstracao } from '@/components/kit'
import { Button } from '@/components/ui/button'
import { P, tipoPeloNome } from '@/dados/arquivos'
import type { Tarefa } from '@/dados/tipos'
import { cn } from '@/lib/utils'
import { publicarAviso } from './avisos'
import { ator, ehAprovacaoBpo, idDoUsuario, nomeSetor, oQueMandar, primeiroNome, type Ctx } from './contexto'
import { agoraTexto, hashDe, HOJE, itensPorCodigo, protocolo, type DefItem } from './dados'
import { useEstadoPendencias, useRecibos, type EstadoPendencia, type Recibo } from './estado'
import { AreaTexto, Bloco, CamposForm, Faixa, Folha, Selo, TituloTela, useFormularioApp } from './pecas'
import { consultarProcuracao } from './simulados'

/**
 * S10-T04 · Pendências (06, 4.1). Pendência é item de uma tarefa do escritório
 * em "aguardando cliente". Quatro tipos: documento (arquivo ou foto com
 * recorte, vários arquivos), informação (formulário tipado), assinatura
 * (ciência) e ação externa (passo a passo com "já fiz"). O envio vira
 * documento `upload_cliente_app`, o integrante confere na hora e devolve o
 * errado com o motivo; cada envio tem recibo com protocolo e hash.
 */

/** Pendências da empresa: tarefas do escritório esperando o cliente, nos setores que o papel vê. */
export function usePendencias(ctx: Ctx) {
  const loja = useLoja()
  return loja.tarefas.filter((t) => t.cliente === ctx.clienteNome && t.status === 'aguardando_cliente' && ctx.setores.includes(t.setor) && !ehAprovacaoBpo(t))
}

export const defDoItem = (t: Tarefa): DefItem => itensPorCodigo[t.codigo] ?? { tipo: 'documento', amostras: [{ nome: `${oQueMandar(t).split(/[,(]/)[0].trim().toLowerCase().replace(/\s+/g, '-')}.pdf` }] }

const rotuloTipo: Record<DefItem['tipo'], string> = { documento: 'enviar documento', informacao: 'preencher', assinatura: 'dar ciência', acao_externa: 'fazer fora do app' }

/** Responder a uma pendência: documento no arquivo, conversa da tarefa, tarefa que volta a andar, aviso ao responsável, recibo. */
export function useResponderPendencia(ctx: Ctx) {
  const loja = useLoja()
  const conversaDe = useConversaDe()
  const [, setEstados] = useEstadoPendencias(ctx.clienteId)
  const [, setRecibos] = useRecibos(ctx.clienteId)
  return {
    /** Documento: arquivos escolhidos; o integrante confere (competência, legível) e devolve o errado. */
    enviar: (t: Tarefa, arquivos: { nome: string; competencia?: string; legivel?: boolean }[], def: DefItem) => {
      const oQue = oQueMandar(t)
      const conversa = t.conversa ?? conversaDe(ctx.clienteNome, t.setor, ctx.contato.nome)
      const prot = protocolo()
      const hash = hashDe(arquivos.map((a) => a.nome).join('|') + prot)
      for (const a of arquivos)
        loja.adicionarDocumento({ nome: a.nome, clienteId: ctx.clienteId, pasta: P.interno(), tipo: tipoPeloNome(a.nome), competencia: a.competencia ?? def.competencia ?? '10/2026', origem: 'upload_cliente_app', conector: 'a1', tamanho: '320 KB', quando: 'hoje', por: `${ctx.contato.nome} (cliente)` })
      const recibo: Recibo = { protocolo: prot, quando: agoraTexto(), hash, arquivos: arquivos.map((a) => a.nome), quem: ctx.contato.nome, item: oQue, tarefaId: t.id }
      setRecibos((l) => [recibo, ...l])
      loja.mensagemCrm(conversa, { tipo: 'mensagem', de: 'cliente', autor: primeiroNome(ctx.contato.nome), canal: 'app', texto: `Enviei pelo app: ${oQue.charAt(0).toLowerCase() + oQue.slice(1)}.`, anexos: arquivos.map((a) => ({ nome: a.nome, tipo: a.nome.split('.').pop() ?? 'pdf' })) })
      loja.statusConversa(conversa, 'em_atendimento')
      loja.registrar(ator(ctx), `Enviou “${oQue}” para ${t.codigo} · ${ctx.clienteNome} (protocolo ${prot})`)
      setEstados((e) => ({ ...e, [t.id]: { situacao: 'em_conferencia', em: agoraTexto(), recibo: prot } }))
      // Validação na hora (GES-405): o integrante do setor confere período, legibilidade e tipo.
      const errado = arquivos.find((a) => a.legivel === false || (def.competencia && a.competencia && a.competencia !== def.competencia))
      setTimeout(() => {
        if (errado) {
          const motivo = errado.legivel === false ? `A foto "${errado.nome}" ficou ilegível; tire outra com mais luz.` : `O arquivo é de ${errado.competencia?.replace('/2026', '')}/2026; precisamos de ${def.competencia}.`
          setEstados((e) => ({ ...e, [t.id]: { situacao: 'devolvida', em: agoraTexto(), motivo, recibo: prot } }))
          loja.mensagemCrm(conversa, { tipo: 'mensagem', de: 'integrante', autor: nomeSetor[t.setor] ?? 'Atendimento', setor: t.setor, canal: 'app', texto: `Recebi, obrigado! Mas ${motivo.charAt(0).toLowerCase()}${motivo.slice(1)} Pode mandar de novo por aqui?` })
          loja.registrar(`${nomeSetor[t.setor]} (integrante)`, `Conferiu e devolveu o envio de ${ctx.clienteNome} (${t.codigo}): ${motivo}`)
          publicarAviso(loja, ctx.clienteId, { categoria: 'pendencia', prioridade: 'alta', titulo: 'Documento devolvido', corpo: motivo, para: [ctx.pessoa], destino: { tela: 'pendencias', item: t.id } })
          return
        }
        setEstados((e) => ({ ...e, [t.id]: { situacao: 'recebida', em: agoraTexto(), recibo: prot } }))
        loja.atualizarTarefa(t.id, { status: 'em_andamento', diasAguardando: undefined })
        const resp = fichas[ctx.clienteId]?.responsaveis[t.setor]
        loja.avisar({ para: [idDoUsuario(resp) ?? 'u1'], tipo: 'cliente', setor: t.setor, titulo: `${ctx.contato.nome} enviou pelo app: ${oQue.split(/[,(]/)[0].trim().toLowerCase()}`, detalhe: `${ctx.clienteNome} · ${t.codigo} voltou a andar · conferido pelo integrante`, destino: { modulo: 'crm', aba: 'conversas', conversa } })
      }, 1600)
      ctx.avisarApp(`Recebido. Protocolo ${prot} · o escritório já foi avisado.`)
      return prot
    },
    /** Informação: formulário tipado vira mensagem na conversa da tarefa (e o integrante confere). */
    preencher: (t: Tarefa, respostas: Record<string, string>, def: DefItem) => {
      const conversa = t.conversa ?? conversaDe(ctx.clienteNome, t.setor, ctx.contato.nome)
      const linhas = (def.campos ?? []).filter((c) => respostas[c.id]).map((c) => `${c.rotulo}: ${respostas[c.id]}`)
      const prot = protocolo()
      loja.mensagemCrm(conversa, { tipo: 'mensagem', de: 'cliente', autor: primeiroNome(ctx.contato.nome), canal: 'app', texto: `${oQueMandar(t)} (pelo app):\n${linhas.join('\n')}` })
      setRecibos((l) => [{ protocolo: prot, quando: agoraTexto(), hash: hashDe(linhas.join('|') + prot), arquivos: ['formulário preenchido'], quem: ctx.contato.nome, item: oQueMandar(t), tarefaId: t.id }, ...l])
      setEstados((e) => ({ ...e, [t.id]: { situacao: 'recebida', em: agoraTexto(), recibo: prot, respostas } }))
      loja.atualizarTarefa(t.id, { status: 'em_andamento', diasAguardando: undefined })
      loja.registrar(ator(ctx), `Preencheu “${oQueMandar(t)}” (${t.codigo}) · ${ctx.clienteNome}`)
      const resp = fichas[ctx.clienteId]?.responsaveis[t.setor]
      loja.avisar({ para: [idDoUsuario(resp) ?? 'u1'], tipo: 'cliente', setor: t.setor, titulo: `${ctx.contato.nome} preencheu pelo app: ${oQueMandar(t).toLowerCase()}`, detalhe: `${ctx.clienteNome} · ${t.codigo}`, destino: { modulo: 'crm', aba: 'conversas', conversa } })
      ctx.avisarApp(`Enviado. Protocolo ${prot}. O DP confere com o ponto.`)
    },
    /** Assinar ciência: identidade, data, hora, hash e IP (06, 5.5). */
    ciencia: (t: Tarefa) => {
      const prot = protocolo()
      const hash = hashDe(t.id + ctx.contato.nome + prot)
      setRecibos((l) => [{ protocolo: prot, quando: agoraTexto(), hash, arquivos: ['ciência eletrônica'], quem: ctx.contato.nome, item: oQueMandar(t), tarefaId: t.id }, ...l])
      setEstados((e) => ({ ...e, [t.id]: { situacao: 'recebida', em: agoraTexto(), recibo: prot } }))
      loja.atualizarTarefa(t.id, { status: 'em_andamento', diasAguardando: undefined })
      loja.registrar(ator(ctx), `Deu ciência em “${oQueMandar(t)}” (hash ${hash.slice(0, 8)}, IP 189.40.12.7) · ${ctx.clienteNome}`)
      ctx.avisarApp('Ciência registrada com data, hora e hash. O recibo está em Empresa › Termos e recibos.')
    },
    /** Ação externa: "já fiz" acorda o integrante, que confere e fecha sozinho quando aparece ativa. */
    jaFiz: (t: Tarefa) => {
      setEstados((e) => ({ ...e, [t.id]: { situacao: 'ja_fiz', em: agoraTexto() } }))
      loja.registrar(ator(ctx), `Disse que fez “${oQueMandar(t)}” (${t.codigo}); o integrante vai conferir · ${ctx.clienteNome}`)
      ctx.avisarApp('Obrigado! O integrante confere no órgão e avisa quando aparecer ativo.')
      consultarProcuracao(oQueMandar(t))
        .then(() => {
          setEstados((e) => ({ ...e, [t.id]: { situacao: 'recebida', em: agoraTexto() } }))
          loja.atualizarTarefa(t.id, { status: 'concluida' })
          loja.registrar(`${nomeSetor[t.setor]} (integrante)`, `Conferiu no órgão: “${oQueMandar(t)}” ativo · ${ctx.clienteNome}; tarefa ${t.codigo} concluída sozinha`)
          publicarAviso(loja, ctx.clienteId, { categoria: 'pendencia', prioridade: 'normal', titulo: 'Confirmado: autorização ativa', corpo: oQueMandar(t), destino: { tela: 'empresa', item: 'procuracoes' } })
        })
        .catch(() => setEstados((e) => ({ ...e, [t.id]: { situacao: 'ja_fiz', em: agoraTexto(), motivo: 'O órgão não respondeu agora; o integrante tenta de novo daqui a pouco.' } })))
    },
    /** "Não tenho isso": a justificativa volta ao escritório na conversa da tarefa. */
    naoTenho: (t: Tarefa, justificativa: string) => {
      const conversa = t.conversa ?? conversaDe(ctx.clienteNome, t.setor, ctx.contato.nome)
      loja.mensagemCrm(conversa, { tipo: 'mensagem', de: 'cliente', autor: primeiroNome(ctx.contato.nome), canal: 'app', texto: `Sobre “${oQueMandar(t)}”: não tenho isso. ${justificativa}` })
      setEstados((e) => ({ ...e, [t.id]: { situacao: 'nao_tenho', em: agoraTexto(), motivo: justificativa } }))
      loja.registrar(ator(ctx), `Respondeu “não tenho” em ${t.codigo}: ${justificativa}`)
      const resp = fichas[ctx.clienteId]?.responsaveis[t.setor]
      loja.avisar({ para: [idDoUsuario(resp) ?? 'u1'], tipo: 'cliente', setor: t.setor, titulo: `${ctx.contato.nome} não tem: ${oQueMandar(t).toLowerCase()}`, detalhe: justificativa.slice(0, 80), destino: { modulo: 'crm', aba: 'conversas', conversa } })
      ctx.avisarApp('Avisamos o escritório; quem cuida decide se baixa o item e responde na conversa.')
    },
  }
}

export function Pendencias({ ctx }: { ctx: Ctx }) {
  const loja = useLoja()
  const pend = usePendencias(ctx)
  const [estados, setEstados] = useEstadoPendencias(ctx.clienteId)
  const [recibos] = useRecibos(ctx.clienteId)
  const [abrir, setAbrir] = useState<string | null>(ctx.item)
  const [recibo, setRecibo] = useState<Recibo | null>(null)
  const aberta = pend.find((t) => t.id === abrir) ?? loja.tarefas.find((t) => t.id === abrir && t.cliente === ctx.clienteNome)
  // Concluídas pelo app nesta competência (para "outubro completo").
  const resolvidas = Object.entries(estados).filter(([id, e]) => e.situacao === 'recebida' && loja.tarefas.some((t) => t.id === id && t.cliente === ctx.clienteNome))
  const abertas = pend.filter((t) => estados[t.id]?.situacao !== 'recebida')
  const completa = abertas.length === 0 && resolvidas.length > 0

  if (ctx.leitura)
    return (
      <div className="flex flex-col gap-3">
        <TituloTela>Pendências</TituloTela>
        <Faixa>O escritório encerrou o uso da plataforma: o app está em modo leitura até {ctx.leitura.encerraEm}, sem pendências novas.</Faixa>
      </div>
    )

  return (
    <div className="flex flex-col gap-4">
      <TituloTela>Pendências</TituloTela>
      {completa && (
        <Faixa tom="ok" icone={<CheckCircleIcon weight="fill" />}>
          <strong className="font-medium">Outubro completo.</strong> Tudo o que o escritório pediu foi enviado e conferido.
        </Faixa>
      )}
      {pend.length === 0 && !completa && <EstadoVazio compacto icone={ListChecksIcon} titulo="Nada pendente com você" descricao="Quando o escritório precisar de algo, aparece aqui e no seu WhatsApp." />}
      {pend.map((t) => (
        <ItemPendencia key={t.id} t={t} estado={estados[t.id]} ctx={ctx} onAbrir={() => {
          setAbrir(t.id)
          if (!estados[t.id]?.visto) setEstados((e) => ({ ...e, [t.id]: { ...(e[t.id] ?? { em: agoraTexto() }), visto: agoraTexto() } }))
        }} onRecibo={() => setRecibo(recibos.find((r) => r.protocolo === estados[t.id]?.recibo) ?? null)} />
      ))}
      {resolvidas.length > 0 && (
        <Bloco titulo="Enviados por você">
          {resolvidas.map(([id, e]) => {
            const t = loja.tarefas.find((x) => x.id === id)!
            return (
              <div key={id} className="flex items-center gap-2 text-sm">
                <SealCheckIcon className="text-success size-5 shrink-0" weight="fill" />
                <span className="min-w-0 flex-1">
                  <span className="block">{oQueMandar(t)}</span>
                  <span className="text-muted-foreground block text-xs">recebido ✔ · {e.em}</span>
                </span>
                {e.recibo && (
                  <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setRecibo(recibos.find((r) => r.protocolo === e.recibo) ?? null)}>
                    Recibo
                  </Button>
                )}
              </div>
            )
          })}
        </Bloco>
      )}
      {aberta && aberta.status === 'aguardando_cliente' && <FolhaPendencia t={aberta} ctx={ctx} onFechar={() => setAbrir(null)} />}
      {recibo && <FolhaRecibo r={recibo} onFechar={() => setRecibo(null)} />}
    </div>
  )
}

function rotuloEstado(e?: EstadoPendencia) {
  if (!e?.situacao) return null
  if (e.situacao === 'em_conferencia') return <Selo tom="info">em conferência</Selo>
  if (e.situacao === 'devolvida') return <Selo tom="erro">devolvido</Selo>
  if (e.situacao === 'recebida') return <Selo tom="ok">recebido</Selo>
  if (e.situacao === 'nao_tenho') return <Selo tom="atencao">você disse que não tem</Selo>
  return <Selo tom="info">conferindo no órgão</Selo>
}

function ItemPendencia({ t, estado, ctx, onAbrir, onRecibo }: { t: Tarefa; estado?: EstadoPendencia; ctx: Ctx; onAbrir: () => void; onRecibo: () => void }) {
  const def = defDoItem(t)
  return (
    <Bloco titulo={oQueMandar(t)} acao={rotuloEstado(estado)}>
      <p className="text-muted-foreground text-xs">
        {nomeSetor[t.setor]} · prazo {t.prazo}
        {t.diasAguardando ? ` · pedido há ${t.diasAguardando} dias` : ''} · {rotuloTipo[def.tipo]}
      </p>
      {estado?.situacao === 'devolvida' && (
        <Faixa tom="erro" icone={<WarningCircleIcon weight="fill" />}>
          {estado.motivo}
        </Faixa>
      )}
      {estado?.situacao === 'nao_tenho' && <p className="text-muted-foreground text-xs">“{estado.motivo}” · o escritório decide e responde na conversa.</p>}
      {estado?.situacao === 'ja_fiz' && <p className="text-muted-foreground text-xs">{estado.motivo ?? 'O integrante está conferindo no órgão.'}</p>}
      {def.consequencia && !estado && <p className="text-xs">{def.consequencia}</p>}
      {estado?.visto && !estado.situacao && <p className="text-muted-foreground text-[11px]">Visto por você em {estado.visto}.</p>}
      <div className="flex flex-wrap gap-2">
        {estado?.situacao !== 'em_conferencia' && estado?.situacao !== 'ja_fiz' && (
          <Button size="sm" className="rounded-full" onClick={onAbrir}>
            {def.tipo === 'documento' ? (
              <>
                <PaperclipIcon /> {estado?.situacao === 'devolvida' ? 'Enviar de novo' : 'Enviar arquivo ou foto'}
              </>
            ) : def.tipo === 'informacao' ? (
              'Preencher'
            ) : def.tipo === 'assinatura' ? (
              'Ler e dar ciência'
            ) : (
              'Ver passo a passo'
            )}
          </Button>
        )}
        {estado?.recibo && (
          <Button size="sm" variant="ghost" className="rounded-full" onClick={onRecibo}>
            <ReceiptIcon /> Recibo
          </Button>
        )}
        {!ctx.leitura && estado?.situacao !== 'nao_tenho' && <NaoTenho t={t} ctx={ctx} />}
      </div>
    </Bloco>
  )
}

function NaoTenho({ t, ctx }: { t: Tarefa; ctx: Ctx }) {
  const [aberto, setAberto] = useState(false)
  const [texto, setTexto] = useState('')
  const r = useResponderPendencia(ctx)
  return (
    <>
      <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setAberto(true)}>
        Não tenho isso
      </Button>
      {aberto && (
        <Folha
          titulo="Não tenho isso"
          onFechar={() => setAberto(false)}
          rodape={
            <Button
              className="rounded-full"
              disabled={texto.trim().length < 5}
              onClick={() => {
                r.naoTenho(t, texto.trim())
                setAberto(false)
              }}
            >
              Avisar o escritório
            </Button>
          }
        >
          <p className="text-sm">Conte por que não tem “{oQueMandar(t).toLowerCase()}”. A resposta vai para quem cuida, na conversa deste item.</p>
          <AreaTexto rotulo="Justificativa" valor={texto} onMudar={setTexto} placeholder="Ex.: não houve compra sem nota em outubro" />
        </Folha>
      )}
    </>
  )
}

/** Folha de cada tipo de item. */
function FolhaPendencia({ t, ctx, onFechar }: { t: Tarefa; ctx: Ctx; onFechar: () => void }) {
  const def = defDoItem(t)
  const r = useResponderPendencia(ctx)
  if (def.tipo === 'documento')
    return (
      <FolhaEnvio
        t={t}
        def={def}
        onFechar={onFechar}
        onEnviar={(arqs) => {
          r.enviar(t, arqs, def)
          onFechar()
        }}
      />
    )
  if (def.tipo === 'informacao') return <FolhaFormulario t={t} def={def} onFechar={onFechar} onEnviar={(v) => { r.preencher(t, v, def); onFechar() }} />
  if (def.tipo === 'assinatura')
    return (
      <Folha
        titulo={oQueMandar(t)}
        onFechar={onFechar}
        rodape={
          <Button className="rounded-full" onClick={() => { r.ciencia(t); onFechar() }}>
            Li e estou ciente
          </Button>
        }
      >
        <p className="bg-surface shadow-cartao rounded-lg p-3 text-sm">{def.ciencia}</p>
        <p className="text-muted-foreground text-xs">Fica registrado com a sua identidade ({ctx.contato.nome}), data, hora, a impressão digital do documento e o IP. É ciência eletrônica simples (06, 5.5).</p>
      </Folha>
    )
  return (
    <Folha
      titulo={oQueMandar(t)}
      onFechar={onFechar}
      rodape={
        <Button className="rounded-full" onClick={() => { r.jaFiz(t); onFechar() }}>
          Já fiz
        </Button>
      }
    >
      {def.video && (
        <div className="bg-sunken flex items-center gap-2 rounded-lg px-3 py-3 text-sm">
          <PlayCircleIcon className="size-8 shrink-0" weight="fill" /> {def.video}
        </div>
      )}
      <ol className="flex flex-col gap-2 text-sm">
        {def.passos?.map((p, i) => (
          <li key={p} className="flex gap-2">
            <span className="bg-sunken flex size-6 shrink-0 items-center justify-center rounded-full text-xs">{i + 1}</span>
            <span>{p}</span>
          </li>
        ))}
      </ol>
      <p className="text-muted-foreground text-xs">Precisa de conta gov.br prata ou ouro (ou do certificado da empresa). Depois do "já fiz", o integrante do {nomeSetor[t.setor]} confere no órgão e fecha sozinho.</p>
    </Folha>
  )
}

function FolhaEnvio({ t, def, onFechar, onEnviar }: { t: Tarefa; def: DefItem; onFechar: () => void; onEnviar: (a: { nome: string; competencia?: string; legivel?: boolean }[]) => void }) {
  const amostras = def.amostras ?? []
  const [escolhidos, setEscolhidos] = useState<string[]>([])
  const [foto, setFoto] = useState<'nao' | 'recorte' | 'pronta'>('nao')
  const [fotos, setFotos] = useState<{ nome: string; legivel?: boolean }[]>([])
  const lista = [...amostras.filter((a) => escolhidos.includes(a.nome)), ...fotos]
  return (
    <Folha
      titulo={oQueMandar(t)}
      onFechar={onFechar}
      rodape={
        <Button className="rounded-full" disabled={lista.length === 0} onClick={() => onEnviar(lista)}>
          <FileArrowUpIcon /> Enviar {lista.length > 1 ? `${lista.length} arquivos` : lista.length === 1 ? '1 arquivo' : ''}
        </Button>
      }
    >
      {def.competencia && <p className="text-muted-foreground text-xs">Competência esperada: {def.competencia}. O integrante confere na hora e avisa se vier errado.</p>}
      {foto === 'nao' && (
        <Button variant="outline" className="w-fit rounded-full" onClick={() => setFoto('recorte')}>
          <CameraIcon /> Tirar foto
        </Button>
      )}
      {foto === 'recorte' && (
        <div className="bg-surface shadow-cartao flex flex-col gap-2 rounded-lg p-3">
          <div className="bg-sunken relative mx-auto flex h-36 w-full max-w-60 items-center justify-center rounded-md">
            <div className="border-primary absolute inset-4 rounded-sm border-2 border-dashed" aria-hidden />
            <span className="text-muted-foreground flex items-center gap-1 text-xs">
              <CropIcon className="size-4" /> recorte automático do documento
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              className="rounded-full"
              onClick={() => {
                setFotos((f) => [...f, { nome: `foto-${f.length + 1}-${t.codigo.toLowerCase()}.jpg` }])
                setFoto('pronta')
              }}
            >
              Usar foto recortada
            </Button>
            <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setFoto('nao')}>
              Cancelar
            </Button>
          </div>
        </div>
      )}
      {foto === 'pronta' && (
        <Button size="sm" variant="ghost" className="w-fit rounded-full" onClick={() => setFoto('recorte')}>
          <CameraIcon /> Tirar mais uma foto
        </Button>
      )}
      <p className="text-muted-foreground text-xs">Ou escolha arquivos do aparelho (na demonstração, estes):</p>
      <div className="flex flex-col gap-1.5">
        {amostras.map((a) => {
          const sel = escolhidos.includes(a.nome)
          return (
            <button
              key={a.nome}
              type="button"
              aria-pressed={sel}
              onClick={() => setEscolhidos((l) => (sel ? l.filter((x) => x !== a.nome) : [...l, a.nome]))}
              className={cn('flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left text-sm', sel ? 'bg-raised shadow-contorno' : 'bg-sunken')}
            >
              {/\.(jpg|png)$/.test(a.nome) ? <ImageIcon className="size-5 shrink-0" /> : <FilePdfIcon className="size-5 shrink-0" />}
              <span className="min-w-0 flex-1 truncate">{a.nome}</span>
              {sel && <CheckCircleIcon className="size-4 shrink-0" weight="fill" />}
            </button>
          )
        })}
        {fotos.map((f) => (
          <span key={f.nome} className="bg-raised shadow-contorno flex items-center gap-2 rounded-md px-3 py-2 text-sm">
            <ImageIcon className="size-5 shrink-0" /> {f.nome}
          </span>
        ))}
      </div>
    </Folha>
  )
}

function FolhaFormulario({ t, def, onFechar, onEnviar }: { t: Tarefa; def: DefItem; onFechar: () => void; onEnviar: (v: Record<string, string>) => void }) {
  const form = useFormularioApp(def.campos ?? [])
  return (
    <Folha
      titulo={oQueMandar(t)}
      onFechar={onFechar}
      rodape={
        <Button className="rounded-full" onClick={() => form.tentar() && onEnviar(form.valores)}>
          Enviar
        </Button>
      }
    >
      {def.consequencia && <p className="text-muted-foreground text-xs">{def.consequencia}</p>}
      <CamposForm campos={def.campos ?? []} form={form} />
    </Folha>
  )
}

/** Recibo de envio (06, 4.1, regra 5): protocolo, data e hora, hash, arquivos e quem enviou. */
export function FolhaRecibo({ r, onFechar }: { r: Recibo; onFechar: () => void }) {
  const [pdf, setPdf] = useState(false)
  return (
    <Folha
      titulo="Recibo de envio"
      onFechar={onFechar}
      rodape={
        <Button variant="outline" className="rounded-full" onClick={() => setPdf(true)}>
          {pdf ? 'PDF gerado' : 'Baixar PDF do recibo'}
        </Button>
      }
    >
      <dl className="bg-surface shadow-cartao grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 rounded-lg p-3 text-sm">
        <dt className="text-muted-foreground">Protocolo</dt>
        <dd className="font-mono">{r.protocolo}</dd>
        <dt className="text-muted-foreground">Quando</dt>
        <dd>{r.quando.replace(/^18\/11/, HOJE)}</dd>
        <dt className="text-muted-foreground">Item</dt>
        <dd>{r.item}</dd>
        <dt className="text-muted-foreground">Arquivos</dt>
        <dd>{r.arquivos.join(', ')}</dd>
        <dt className="text-muted-foreground">Enviado por</dt>
        <dd>{r.quem}</dd>
        <dt className="text-muted-foreground">Impressão digital</dt>
        <dd className="font-mono text-xs break-all">sha256:{r.hash}</dd>
      </dl>
      {pdf && (
        <p className="flex items-center gap-2 text-xs">
          recibo-{r.protocolo}.pdf <SeloDemonstracao fonte="Gerador de comprovantes" />
        </p>
      )}
      <p className="text-muted-foreground text-xs">É o espelho do comprovante de entrega: prova nos dois sentidos. Fica também em Empresa › Termos e recibos.</p>
    </Folha>
  )
}

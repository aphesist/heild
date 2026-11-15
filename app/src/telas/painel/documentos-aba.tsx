import { useContext, useMemo, useState } from 'react'
import { EyeIcon, EyeSlashIcon, FileTextIcon, SealQuestionIcon } from '@phosphor-icons/react'
import { registrarExecutor, useAgenteS02 } from '@/ambiente/agente-s02'
import { useDocumentos } from '@/ambiente/documentos'
import { useLoja } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import { AbaCtx } from '@/components/compostos/painel-aba'
import { BotaoAcoes, usePode, type AcaoMenu } from '@/components/kit'
import { Button } from '@/components/ui/button'
import { Campo, CampoEscolha, CampoTexto, GavetaFormulario } from '@/components/ui/formulario'
import { Tooltip } from '@/components/ui/tooltip'
import { visivelAoCliente, type Documento, type TipoDocumento } from '@/dados/arquivos'
import type { DocumentoAba } from '@/dados/painel'
import type { SetorIntegrante } from '@/theme/tipos'
import { AreaRolagem } from '@/components/ui/area-rolagem'

/**
 * D. Documentos da aba (03, 5 D; S02-A06 a A11): os mesmos arquivos de
 * Arquivos (o índice da loja), por competência e tipo, com origem, quem enviou,
 * hash curto, "visível no app" com a pasta; abrir no visualizador, enviar ao
 * cliente (cartão), mover ou reclassificar, forçar visível ou oculto (Gestor e
 * Administrador), registro de entrega e a fila "confirmar origem" dos arquivos
 * que vieram da nuvem sem `enviado_por`.
 */

/** Setor de cada tipo de documento (para mostrar na aba certa). */
const setorDoTipo: Partial<Record<TipoDocumento, SetorIntegrante[]>> = {
  guia: ['fiscal'],
  recibo: ['fiscal', 'dp', 'contabil'],
  certidao: ['fiscal', 'societario'],
  intimacao: ['fiscal'],
  xml: ['notas'],
  nfse: ['notas', 'fiscal'],
  holerite: ['dp'],
  folha: ['dp'],
  balancete: ['contabil'],
  extrato: ['contabil'],
  relatorio: ['contabil', 'bpo_financeiro'],
  contrato: ['societario'],
  procuracao: ['societario'],
  cadastro: ['societario'],
  parecer: ['consultor'],
}

const rotuloOrigem: Record<Documento['origem'], DocumentoAba['origem']> = {
  gerado_plataforma: 'integrante',
  upload_equipe: 'integrante',
  upload_cliente_app: 'app',
  conversa: 'WhatsApp',
  captura_governo: 'captura',
  nuvem_escritorio: 'nuvem',
  core: 'integrante',
}

const tipos: TipoDocumento[] = ['guia', 'holerite', 'folha', 'balancete', 'contrato', 'procuracao', 'certidao', 'cadastro', 'extrato', 'recibo', 'xml', 'nfse', 'relatorio', 'intimacao', 'parecer', 'outro']

interface Linha extends DocumentoAba {
  doc?: Documento
  semOrigem?: boolean
}

function paraLinha(d: Documento): Linha {
  const semOrigem = d.origem === 'nuvem_escritorio' && !d.dados?.origem_confirmada
  return {
    id: d.id,
    nome: d.nome,
    tipo: d.tipo,
    competencia: d.competencia ?? d.quando.slice(-4),
    origem: rotuloOrigem[d.origem],
    enviadoPor: d.dados?.origem_confirmada ? `${d.dados.origem_confirmada} (confirmado)` : d.por,
    hash: d.hash.slice(0, 7),
    visivelNoApp: visivelAoCliente(d),
    pasta: d.pasta.join(' / '),
    doc: d,
    semOrigem,
  }
}

export function DocumentosDaAba({ itens: fixos, compacto, limite }: { itens: DocumentoAba[]; compacto?: boolean; limite?: number }) {
  const ctx = useContext(AbaCtx)
  const loja = useLoja()
  const docs = useDocumentos()
  const { usuario } = useSessao()
  const trabalhar = useAgenteS02()
  const podeForcar = usePode('documento.forcar_visibilidade', { cliente_id: ctx.clienteId ?? null })
  const [mover, setMover] = useState<Linha | null>(null)
  const [entregas, setEntregas] = useState<Linha | null>(null)
  const [origem, setOrigem] = useState<Linha | null>(null)
  const itens: Linha[] = useMemo(() => {
    if (!ctx.clienteId) return fixos
    const reais = loja.documentos.filter((d) => d.clienteId === ctx.clienteId && (setorDoTipo[d.tipo] ?? []).includes(ctx.setor))
    return reais.length ? reais.map(paraLinha) : fixos
  }, [loja.documentos, ctx.clienteId, ctx.setor, fixos])
  const fila = itens.filter((d) => d.semOrigem)

  const abrir = (d: Linha) => {
    docs.abrir(d.nome, { clienteId: ctx.clienteId, setor: ctx.setor })
    if (d.doc) loja.ajustarDocumento(d.doc.id, { entregas: [...(d.doc.entregas ?? []), { quem: usuario.nome, acao: 'visto', quando: new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) }] })
  }
  const enviar = (d: Linha) =>
    trabalhar({
      setor: ctx.setor,
      titulo: `Enviar ${d.nome}`,
      cliente: ctx.cliente,
      clienteId: ctx.clienteId,
      etapas: ['Achando o contato que recebe o assunto', 'Conferindo o hash do arquivo', 'Montando a mensagem'],
      seg: 0.8,
      texto: `Preparei o envio de ${d.nome} ao contato do assunto. Aprove para eu mandar.`,
      cartao: { acao: { tipo: 'documento.enviar_cliente', docId: d.doc?.id ?? d.id, nome: d.nome, cliente: ctx.cliente, setor: ctx.setor }, resumo: `Enviar ${d.nome} ao cliente`, argumentos: [['Arquivo', d.nome], ['Hash', d.hash]] },
    })
  const forcar = (d: Linha) => {
    if (!d.doc) return
    const antes = d.doc.forcarVisivel
    loja.ajustarDocumento(d.doc.id, { forcarVisivel: !d.visivelNoApp, dados: { ...d.doc.dados, forcado_por: usuario.nome } })
    loja.registrar(usuario.nome, `Forçou ${d.nome} como ${d.visivelNoApp ? 'oculto' : 'visível'} no app (${ctx.cliente})`)
    loja.toastDesfazer(`${d.nome}: agora ${d.visivelNoApp ? 'oculto' : 'visível'} no app. Registrado em seu nome.`, () => loja.ajustarDocumento(d.doc!.id, { forcarVisivel: antes }))
  }
  const acoes = (d: Linha): AcaoMenu[] => [
    { rotulo: 'Abrir no visualizador', onSelecionar: () => abrir(d) },
    ...(ctx.cliente && !ctx.somenteLeitura ? [{ rotulo: 'Enviar ao cliente (com aprovação)', onSelecionar: () => enviar(d) }] : []),
    ...(d.doc && !ctx.somenteLeitura ? [{ rotulo: 'Mover ou reclassificar', onSelecionar: () => setMover(d) }] : []),
    ...(d.doc && podeForcar && !ctx.somenteLeitura ? [{ rotulo: d.visivelNoApp ? 'Forçar oculto no app' : 'Forçar visível no app', onSelecionar: () => forcar(d) }] : []),
    ...(d.doc ? [{ rotulo: 'Registro de entrega', onSelecionar: () => setEntregas(d) }] : []),
    ...(d.semOrigem ? [{ rotulo: 'Confirmar origem', onSelecionar: () => setOrigem(d), separar: true }] : []),
  ]
  const gavetas = (
    <>
      {mover?.doc && <GavetaMover d={mover} onFechar={() => setMover(null)} />}
      {entregas?.doc && <GavetaEntregas d={entregas} onFechar={() => setEntregas(null)} />}
      {origem?.doc && <GavetaOrigem d={origem} onFechar={() => setOrigem(null)} />}
    </>
  )
  if (!itens.length) return <p className="text-muted-foreground py-2 text-sm">Nenhum documento desta aba.</p>
  const filaAviso = fila.length > 0 && (
    <button type="button" onClick={() => setOrigem(fila[0])} className="bg-warning/10 flex w-full cursor-pointer items-center gap-2 rounded-[12px] px-2.5 py-1.5 text-left text-xs">
      <SealQuestionIcon className="text-warning size-4 shrink-0" /> {fila.length} {fila.length === 1 ? 'arquivo da nuvem sem origem' : 'arquivos da nuvem sem origem'}: confirmar quem enviou
    </button>
  )
  if (compacto)
    return (
      <div className="flex flex-col gap-1.5">
        {gavetas}
        {filaAviso}
        <ul className="divide-border/70 flex flex-col divide-y">
          {itens.slice(0, limite).map((d) => (
            <li key={d.id} className="flex items-center gap-2.5 py-1.5 first:pt-0 last:pb-0">
              <button type="button" className="hover:bg-sunken flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 rounded-[8px] text-left" onClick={() => abrir(d)}>
                <FileTextIcon weight="duotone" className="text-muted-foreground size-5 shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm">{d.nome}</span>
                  <span className="text-muted-foreground block truncate text-xs">
                    {d.competencia} · {d.origem} · {d.enviadoPor}
                  </span>
                </span>
              </button>
              <Tooltip conteudo={`${d.visivelNoApp ? 'Visível' : 'Oculto'} no app · pasta ${d.pasta}`}>
                {d.visivelNoApp ? <EyeIcon className="size-4 shrink-0" aria-label="visível no app" /> : <EyeSlashIcon className="text-muted-foreground size-4 shrink-0" aria-label="oculto no app" />}
              </Tooltip>
              <BotaoAcoes acoes={acoes(d)} rotulo={`Ações de ${d.nome}`} />
            </li>
          ))}
          {limite && itens.length > limite && <li className="text-muted-foreground pt-1 text-xs">e mais {itens.length - limite}</li>}
        </ul>
      </div>
    )
  return (
    <div className="flex flex-col gap-2">
      {gavetas}
      {filaAviso}
      <AreaRolagem eixo="x" className="-mx-1 px-1">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="text-muted-foreground text-left text-xs">
              <th className="py-1.5 pr-3 font-medium">Documento</th>
              <th className="py-1.5 pr-3 font-medium">Competência</th>
              <th className="py-1.5 pr-3 font-medium">Origem</th>
              <th className="py-1.5 pr-3 font-medium">No app do cliente</th>
              <th className="py-1.5" />
            </tr>
          </thead>
          <tbody className="divide-border/70 divide-y">
            {itens.map((d) => (
              <tr key={d.id}>
                <td className="py-2 pr-3">
                  <div className="flex items-center gap-2">
                    <FileTextIcon weight="duotone" className="text-muted-foreground size-5 shrink-0" />
                    <div className="min-w-0">
                      <div className="truncate">{d.nome}</div>
                      <div className="text-muted-foreground text-[11px]">
                        {d.tipo} · <code>{d.hash}</code>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-2 pr-3 tabular-nums">{d.competencia}</td>
                <td className="py-2 pr-3">
                  <div>{d.origem}</div>
                  <div className="text-muted-foreground text-[11px]">{d.semOrigem ? 'sem origem: confirmar' : d.enviadoPor}</div>
                </td>
                <td className="py-2 pr-3">
                  <Tooltip conteudo={`Pasta: ${d.pasta}`}>
                    <span className="flex w-fit items-center gap-1.5 text-xs">
                      {d.visivelNoApp ? <EyeIcon className="size-4" /> : <EyeSlashIcon className="text-muted-foreground size-4" />}
                      {d.visivelNoApp ? 'visível' : 'oculto'}
                      {d.doc?.forcarVisivel !== undefined && <span className="text-muted-foreground">(forçado)</span>}
                    </span>
                  </Tooltip>
                </td>
                <td className="py-2 text-right whitespace-nowrap">
                  <Button size="sm" variant="ghost" onClick={() => abrir(d)}>
                    Abrir
                  </Button>
                  <BotaoAcoes acoes={acoes(d)} rotulo={`Ações de ${d.nome}`} className="inline-flex" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AreaRolagem>
    </div>
  )
}

/** S02-A08: mover ou reclassificar, com o que mudou no evento. */
function GavetaMover({ d, onFechar }: { d: Linha; onFechar: () => void }) {
  const loja = useLoja()
  const { usuario } = useSessao()
  const [tipo, setTipo] = useState<TipoDocumento>(d.doc!.tipo)
  const [pasta, setPasta] = useState(d.doc!.pasta.join('/'))
  const [competencia, setCompetencia] = useState(d.doc!.competencia ?? '')
  const valida = pasta.trim().length > 0 && (!competencia || /^\d{2}\/\d{4}$|^\d{4}$/.test(competencia))
  return (
    <GavetaFormulario
      aberta
      onFechar={onFechar}
      titulo={`Mover ou reclassificar · ${d.nome}`}
      descricao="A mudança vale aqui e em Arquivos; o evento guarda o antes e o depois."
      acao="Salvar"
      acaoDesabilitada={!valida}
      onAcao={() => {
        const antes = d.doc!
        const novo = { tipo, pasta: pasta.split('/').map((x) => x.trim()).filter(Boolean), competencia: competencia || undefined }
        const diff = [antes.tipo !== novo.tipo && `tipo ${antes.tipo} → ${novo.tipo}`, antes.pasta.join('/') !== novo.pasta.join('/') && `pasta ${antes.pasta.join('/')} → ${novo.pasta.join('/')}`, (antes.competencia ?? '') !== (novo.competencia ?? '') && `competência ${antes.competencia ?? '—'} → ${novo.competencia ?? '—'}`].filter(Boolean)
        if (!diff.length) return onFechar()
        loja.ajustarDocumento(antes.id, novo)
        loja.registrar(usuario.nome, `Reclassificou ${d.nome}: ${diff.join('; ')}`)
        loja.toastDesfazer(`${d.nome}: ${diff.join('; ')}.`, () => loja.ajustarDocumento(antes.id, { tipo: antes.tipo, pasta: antes.pasta, competencia: antes.competencia }))
        onFechar()
      }}
    >
      <Campo rotulo="Tipo">{(id) => <CampoEscolha id={id} valor={tipo} onMudar={(v) => setTipo(v as TipoDocumento)} opcoes={tipos.map((t) => ({ valor: t, rotulo: t }))} />}</Campo>
      <Campo rotulo="Pasta" ajuda="Separe as pastas com /." erro={pasta.trim() ? undefined : 'Escolha a pasta.'}>
        {(id) => <CampoTexto id={id} valor={pasta} onMudar={setPasta} />}
      </Campo>
      <Campo rotulo="Competência" ajuda="MM/AAAA ou AAAA; vazio para documento permanente." erro={!competencia || /^\d{2}\/\d{4}$|^\d{4}$/.test(competencia) ? undefined : 'Use MM/AAAA ou AAAA.'}>
        {(id) => <CampoTexto id={id} valor={competencia} onMudar={setCompetencia} placeholder="10/2026" />}
      </Campo>
    </GavetaFormulario>
  )
}

/** S02-A10: quem abriu, baixou, confirmou e quando (06, 5.2). */
function GavetaEntregas({ d, onFechar }: { d: Linha; onFechar: () => void }) {
  const lista = d.doc!.entregas ?? []
  return (
    <GavetaFormulario aberta onFechar={onFechar} titulo={`Registro de entrega · ${d.nome}`} descricao={`Hash ${d.hash}. O registro só cresce: nada se apaga.`} acao="Fechar" onAcao={onFechar}>
      {lista.length ? (
        <ol className="flex flex-col gap-2 text-sm">
          {lista.map((e, i) => (
            <li key={i} className="bg-sunken flex items-center gap-2 rounded-[12px] px-3 py-2">
              <span className="min-w-0 flex-1">
                <strong className="font-medium">{e.quem}</strong> {e.acao === 'enviado' ? 'recebeu' : e.acao === 'visto' ? 'abriu' : e.acao === 'baixado' ? 'baixou' : 'confirmou'}
              </span>
              <span className="text-muted-foreground text-xs tabular-nums">{e.quando}</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-muted-foreground text-sm">Ainda não foi enviado nem aberto por ninguém.</p>
      )}
    </GavetaFormulario>
  )
}

/** S02-A11: arquivo da nuvem sem `enviado_por`: quem mandou? */
function GavetaOrigem({ d, onFechar }: { d: Linha; onFechar: () => void }) {
  const loja = useLoja()
  const ctx = useContext(AbaCtx)
  const { usuario } = useSessao()
  const contatos = loja.fichaDe(ctx.clienteId)?.contatos ?? []
  const opcoes = [...contatos.map((c) => `${c.nome} (cliente)`), `${usuario.nome} (equipe)`, 'contador anterior', 'órgão público']
  const [quem, setQuem] = useState(opcoes[0] ?? '')
  return (
    <GavetaFormulario
      aberta
      onFechar={onFechar}
      titulo="Confirmar origem"
      descricao={`${d.nome} veio da nuvem do escritório sem dizer quem enviou. A origem fica no índice e no evento.`}
      acao="Confirmar"
      acaoDesabilitada={!quem}
      onAcao={() => {
        loja.ajustarDocumento(d.doc!.id, { dados: { ...d.doc!.dados, origem_confirmada: quem } })
        loja.registrar(usuario.nome, `Confirmou a origem de ${d.nome}: ${quem}`)
        loja.toast(`Origem de ${d.nome}: ${quem}.`)
        onFechar()
      }}
    >
      <Campo rotulo="Quem enviou">{(id) => <CampoEscolha id={id} valor={quem} onMudar={setQuem} opcoes={opcoes.map((o) => ({ valor: o, rotulo: o }))} />}</Campo>
    </GavetaFormulario>
  )
}

/** S02-A07: aprovado o envio, fica no registro de entrega (o contato do assunto recebe). */
registrarExecutor('documento.enviar_cliente', (acao, { loja, quem }) => {
  const docId = String(acao.docId)
  const nome = String(acao.nome)
  const doc = loja.documentos.find((d) => d.id === docId)
  if (doc) loja.ajustarDocumento(docId, { entregas: [...(doc.entregas ?? []), { quem: String(acao.cliente ?? 'cliente'), acao: 'enviado', quando: new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) }] })
  loja.registrar(quem, `Aprovou o envio de ${nome} a ${String(acao.cliente ?? 'cliente')}`)
  loja.toast(`${nome} enviado ao cliente. O registro de entrega acompanha quando abrir.`)
})

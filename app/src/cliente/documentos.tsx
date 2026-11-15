import { ArchiveIcon, CheckCircleIcon, ChatCircleTextIcon, CloudSlashIcon, DownloadSimpleIcon, EnvelopeSimpleIcon, FileTextIcon, LinkIcon, MagnifyingGlassIcon, SealCheckIcon, ShareNetworkIcon, XIcon } from '@phosphor-icons/react'
import { useMemo, useState } from 'react'
import { useLoja } from '@/ambiente/loja'
import { EstadoErro, EstadoVazio, SeloDemonstracao } from '@/components/kit'
import { Button } from '@/components/ui/button'
import { PaginaDocumento } from '@/components/compostos/visualizador-documento'
import { visivelAoCliente, type Documento } from '@/dados/arquivos'
import { servicos } from '@/servicos'
import { cn } from '@/lib/utils'
import { ator, type Area, type Ctx } from './contexto'
import { agoraHora, agoraTexto, HOJE, protocolo } from './dados'
import { useGuiasInformadas, useLinks, type LinkCompartilhado } from './estado'
import { Bloco, Campo, Chip, Chips, Escolha, Faixa, Folha, Selo, TituloTela } from './pecas'
import { gerarPacoteMes } from './simulados'

/**
 * S10-T03 · Documentos (06, 3.3 e 5). Os mesmos arquivos das pastas do
 * escritório que passam pelos dois filtros: pasta visível (Fundações 7.8) e
 * área do papel. Abrir grava "visto", baixar grava "baixado" com o hash, e o
 * escritório vê o mesmo (é o que alimenta o farol de abertura, D-17).
 */

/** Área do papel que vê cada tipo (06, 2.4; segundo filtro sobre a pasta visível). */
export const areaDoTipo = (t: Documento['tipo']): Area =>
  t === 'guia' || t === 'recibo' || t === 'nfse' || t === 'xml' ? 'guias' : t === 'holerite' || t === 'folha' ? 'folha' : t === 'contrato' || t === 'procuracao' || t === 'certidao' || t === 'cadastro' ? 'societario' : 'documentos'

type Grupo = 'todos' | 'guias' | 'notas' | 'folha' | 'relatorios' | 'permanentes' | 'enviados'
const grupoDoc = (d: Documento): Exclude<Grupo, 'todos' | 'enviados'> =>
  d.pasta[0] === 'permanentes' ? 'permanentes' : d.tipo === 'guia' || d.tipo === 'recibo' ? 'guias' : d.tipo === 'nfse' || d.tipo === 'xml' ? 'notas' : d.tipo === 'holerite' || d.tipo === 'folha' ? 'folha' : 'relatorios'
const rotuloGrupo: Record<Grupo, string> = { todos: 'Todos', guias: 'Guias', notas: 'Notas', folha: 'Folha', relatorios: 'Relatórios', permanentes: 'Permanentes', enviados: 'Enviados por você' }
const meses = ['', 'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
const rotuloCompetencia = (c?: string) => {
  if (!c) return 'Sem competência'
  const [m, a] = c.split('/')
  return a ? `${meses[Number(m)]?.replace(/^./, (x) => x.toUpperCase()) ?? m} de ${a}` : c
}

const mesDia = (ddmm: string) => Number(ddmm.slice(3, 5)) * 100 + Number(ddmm.slice(0, 2))

/** Arquivo cujos bytes sumiram da nuvem antiga (06, 3.3: aparece "indisponível" e abre pedido). */
export const indisponivel = (d: Documento) => d.conector === 'a2' && d.pasta[0] === 'permanentes'
/** D-16: demonstração contábil só chega ao app assinada pelo contador, com a assinatura conferida no PDF. */
export const assinadoPeloContador = (d: Documento) => d.tipo === 'balancete' || (d.tipo === 'relatorio' && /declara|dre|balan/i.test(d.nome))

/** Documentos visíveis desta empresa para o papel da pessoa, mais o que ela mesma enviou (sempre visível a quem enviou, 06, 5.1). */
export function useDocsDoCliente(ctx: Ctx) {
  const loja = useLoja()
  return useMemo(
    () => loja.documentos.filter((d) => d.clienteId === ctx.clienteId && ((visivelAoCliente(d) && ctx.areas.includes(areaDoTipo(d.tipo))) || (d.origem === 'upload_cliente_app' && d.por.startsWith(ctx.contato.nome)))),
    [loja.documentos, ctx.clienteId, ctx.areas, ctx.contato.nome],
  )
}

export const estadoDoc = (d: Documento, pessoa: string) => {
  const minhas = (d.entregas ?? []).filter((e) => e.quem.startsWith(pessoa))
  if (minhas.some((e) => e.acao === 'baixado')) return 'baixado'
  if (minhas.some((e) => e.acao === 'visto' || e.acao === 'confirmado')) return 'visto'
  return 'novo'
}

/** Registro de entrega (Fundações 7.7): visto, baixado, enviado, confirmado; com o hash no momento. */
export function useEntrega(ctx: Ctx) {
  const loja = useLoja()
  return (d: Documento, acao: 'visto' | 'baixado' | 'enviado' | 'confirmado', detalhe?: string) => {
    const atual = loja.documentos.find((x) => x.id === d.id) ?? d
    loja.ajustarDocumento(d.id, { entregas: [...(atual.entregas ?? []), { quem: detalhe ? `${ctx.contato.nome} (${detalhe})` : ctx.contato.nome, acao, quando: `hoje ${agoraHora()}` }] })
    const verbo = { visto: 'Abriu', baixado: 'Baixou', enviado: 'Mandou para si', confirmado: 'Confirmou o recebimento de' }[acao]
    loja.registrar(ator(ctx), `${verbo} ${d.nome}${detalhe ? ` (${detalhe})` : ''} · hash ${d.hash.slice(0, 8)} (${ctx.clienteNome})`)
  }
}

export function Documentos({ ctx }: { ctx: Ctx }) {
  const docs = useDocsDoCliente(ctx)
  const entrega = useEntrega(ctx)
  const [filtro, setFiltro] = useState<Grupo>('todos')
  const [busca, setBusca] = useState('')
  const [pacote, setPacote] = useState(false)
  const [links, setLinks] = useLinks(ctx.clienteId)
  const aberto = ctx.item ? docs.find((d) => d.id === ctx.item) : null
  if (aberto) return <DetalheDocumento d={aberto} ctx={ctx} />
  const q = busca.trim().toLowerCase()
  const lista = docs
    .filter((d) => (filtro === 'todos' ? true : filtro === 'enviados' ? d.origem === 'upload_cliente_app' && d.por.startsWith(ctx.contato.nome) : grupoDoc(d) === filtro && !(d.origem === 'upload_cliente_app' && !visivelAoCliente(d))))
    .filter((d) => !q || [d.nome, d.competencia, d.tipo, ...Object.values(d.dados ?? {})].some((x) => x?.toLowerCase().includes(q)))
  const permanentes = lista.filter((d) => grupoDoc(d) === 'permanentes')
  const porComp = new Map<string, Documento[]>()
  for (const d of lista.filter((x) => grupoDoc(x) !== 'permanentes')) porComp.set(d.competencia ?? '', [...(porComp.get(d.competencia ?? '') ?? []), d])
  const ordenadas = [...porComp.entries()].sort(([a], [b]) => (b.split('/').reverse().join('') > a.split('/').reverse().join('') ? 1 : -1))
  const ativos = links.filter((l) => !l.revogado && mesDia(l.expiraEm) >= mesDia(HOJE))
  const abrir = (d: Documento) => {
    if (estadoDoc(d, ctx.contato.nome) === 'novo' && !indisponivel(d)) entrega(d, 'visto')
    ctx.ir('documentos', d.id)
  }
  return (
    <div className="flex flex-col gap-4">
      <TituloTela
        acao={
          <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setPacote(true)}>
            <ArchiveIcon /> Baixar o mês
          </Button>
        }
      >
        Documentos
      </TituloTela>
      <label className="bg-sunken flex items-center gap-2 rounded-full px-3">
        <MagnifyingGlassIcon className="text-muted-foreground size-4 shrink-0" />
        <input aria-label="Buscar documentos" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Nome, número da nota, tributo, valor" className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none" />
        {busca && (
          <button type="button" aria-label="Limpar busca" onClick={() => setBusca('')} className="cursor-pointer">
            <XIcon className="size-4" />
          </button>
        )}
      </label>
      <Chips rotulo="Filtrar por tipo">
        {(Object.keys(rotuloGrupo) as Grupo[])
          .filter((f) => f === 'todos' || (f === 'enviados' ? docs.some((d) => d.origem === 'upload_cliente_app' && d.por.startsWith(ctx.contato.nome)) : docs.some((d) => grupoDoc(d) === f)))
          .map((f) => (
            <Chip key={f} ativo={filtro === f} onClick={() => setFiltro(f)}>
              {rotuloGrupo[f]}
            </Chip>
          ))}
      </Chips>
      {docs.length === 0 && <EstadoVazio compacto icone={FileTextIcon} titulo="Nada nesta área para o seu papel" descricao="O escritório publica aqui guias, holerites, relatórios e documentos da empresa." />}
      {docs.length > 0 && lista.length === 0 && <EstadoVazio compacto icone={MagnifyingGlassIcon} titulo="Nada encontrado" descricao={q ? `Nenhum documento com “${busca}”.` : 'Nenhum documento neste filtro.'} />}
      {ordenadas.map(([comp, ds]) => (
        <Bloco key={comp} titulo={rotuloCompetencia(comp)} acao={<span className="text-muted-foreground text-xs">{ds.length} {ds.length === 1 ? 'arquivo' : 'arquivos'}</span>}>
          {ds.map((d) => (
            <LinhaDoc key={d.id} d={d} ctx={ctx} onAbrir={() => abrir(d)} />
          ))}
        </Bloco>
      ))}
      {permanentes.length > 0 && (
        <Bloco titulo="Permanentes">
          {permanentes.map((d) => (
            <LinhaDoc key={d.id} d={d} ctx={ctx} onAbrir={() => abrir(d)} />
          ))}
        </Bloco>
      )}
      {links.length > 0 && <LinksAtivos links={links} ativos={ativos.length} onRevogar={(id) => {
        setLinks((l) => l.map((x) => (x.id === id ? { ...x, revogado: agoraTexto() } : x)))
        ctx.registrar(`Revogou um link de compartilhamento`)
        ctx.avisarApp('Link revogado: quem tinha o endereço não abre mais.')
      }} />}
      {pacote && <FolhaPacote ctx={ctx} docs={docs} onFechar={() => setPacote(false)} />}
    </div>
  )
}

function LinhaDoc({ d, ctx, onAbrir }: { d: Documento; ctx: Ctx; onAbrir: () => void }) {
  const est = estadoDoc(d, ctx.contato.nome)
  const enviado = d.origem === 'upload_cliente_app'
  return (
    <button type="button" onClick={onAbrir} className="hover:bg-sunken/50 -mx-1.5 flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm">
      {indisponivel(d) ? <CloudSlashIcon className="text-muted-foreground size-5 shrink-0" /> : <FileTextIcon className="text-muted-foreground size-5 shrink-0" />}
      <span className="min-w-0 flex-1">
        <span className="block truncate">{d.nome}</span>
        <span className="text-muted-foreground block text-xs">
          {grupoDoc(d) === 'permanentes' ? 'permanente' : d.tipo} · {d.quando}
          {enviado ? ' · enviado por você' : ''}
        </span>
      </span>
      {indisponivel(d) ? <Selo tom="atencao">indisponível</Selo> : enviado ? <Selo>enviado</Selo> : <Selo tom={est === 'novo' ? 'info' : est === 'baixado' ? 'ok' : 'neutro'}>{est}</Selo>}
    </button>
  )
}

function LinksAtivos({ links, ativos, onRevogar }: { links: LinkCompartilhado[]; ativos: number; onRevogar: (id: string) => void }) {
  return (
    <Bloco titulo={`Links compartilhados (${ativos} ativos)`}>
      {links.map((l) => {
        const vencido = mesDia(l.expiraEm) < mesDia(HOJE)
        return (
          <div key={l.id} className="flex items-start gap-2 text-sm">
            <LinkIcon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
            <span className="min-w-0 flex-1">
              <span className="block truncate">
                {l.nomes.join(', ')} → {l.para}
              </span>
              <span className="text-muted-foreground block text-xs">
                {l.revogado ? `revogado em ${l.revogado}` : vencido ? 'vencido' : `vale até ${l.expiraEm}`}
                {l.senha ? ' · com senha' : ''} · {l.acessos.length} {l.acessos.length === 1 ? 'acesso' : 'acessos'}
                {l.acessos[0] ? ` (último ${l.acessos[0].quando}, IP ${l.acessos[0].ip})` : ''}
              </span>
            </span>
            {!l.revogado && !vencido && (
              <Button size="sm" variant="ghost" className="rounded-full" onClick={() => onRevogar(l.id)}>
                Revogar
              </Button>
            )}
          </div>
        )
      })}
    </Bloco>
  )
}

function DetalheDocumento({ d, ctx }: { d: Documento; ctx: Ctx }) {
  const entrega = useEntrega(ctx)
  const loja = useLoja()
  const [compartilhar, setCompartilhar] = useState(false)
  const [enviando, setEnviando] = useState<'whatsapp' | 'email' | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [selo, setSelo] = useState<string | null>(null)
  const [informadas, setInformadas] = useGuiasInformadas(ctx.clienteId)
  const voltar = () => ctx.ir('documentos')
  if (indisponivel(d))
    return (
      <div className="flex flex-col gap-3">
        <TituloTela voltar={voltar}>{d.nome.replace(/\.\w+$/, '')}</TituloTela>
        <EstadoVazio
          compacto
          icone={CloudSlashIcon}
          titulo="Arquivo indisponível"
          descricao="O arquivo estava na nuvem antiga do escritório e não está mais lá. Peça uma cópia: o Societário reemite ou procura o original."
          acao={
            !ctx.leitura && (
              <Button
                size="sm"
                className="rounded-full"
                onClick={() => {
                  const id = loja.criarTarefa({ codigo: 'SOC-034', titulo: `Documento vigente: ${d.nome.replace(/\.\w+$/, '')} (indisponível no app)`, cliente: ctx.clienteNome, setor: 'societario', prazo: '20/11', status: 'a_fazer', origem: 'pedido_cliente', responsavel: { tipo: 'integrante', nome: 'Societário', setor: 'societario' } })
                  ctx.registrar(`Pediu cópia de ${d.nome} (indisponível)`)
                  loja.avisar({ para: ['u4'], tipo: 'cliente', setor: 'societario', titulo: `Pedido pelo app: cópia de ${d.nome}`, detalhe: `${ctx.clienteNome} · arquivo sem bytes no Drive antigo`, destino: { modulo: 'painel', tarefa: id } })
                  ctx.avisarApp('Pedido aberto (SOC-034). Você acompanha em Pedidos.')
                }}
              >
                Pedir ao escritório
              </Button>
            )
          }
        />
      </div>
    )
  const ehGuia = d.tipo === 'guia'
  const mandar = (canal: 'whatsapp' | 'email') => {
    setEnviando(canal)
    setErro(null)
    const destino = canal === 'whatsapp' ? ctx.contato.whatsapp : ctx.contato.email
    const p = canal === 'whatsapp' ? servicos.whatsapp.enviar({ para: destino ?? '', modelo: 'documento_link', variaveis: { documento: d.nome } }) : servicos.email.enviar({ para: [destino ?? ''], assunto: d.nome, corpo: 'Link para baixar (vale 7 dias, pede login).' })
    p.then((r) => {
      entrega(d, 'enviado', canal === 'whatsapp' ? 'para o próprio WhatsApp' : 'para o próprio e-mail')
      setSelo(r.fonte)
      ctx.avisarApp(`Enviado para o seu ${canal === 'whatsapp' ? 'WhatsApp' : 'e-mail'}: só o link, que pede login (o conteúdo não vai no texto).`)
    })
      .catch((e: Error) => setErro(e.message))
      .finally(() => setEnviando(null))
  }
  return (
    <div className="flex flex-col gap-4">
      <TituloTela voltar={voltar}>{d.nome.replace(/\.\w+$/, '')}</TituloTela>
      {assinadoPeloContador(d) && (
        <Faixa tom="ok" icone={<SealCheckIcon weight="fill" />}>
          Assinado pelo contador responsável (CRC 1SP 234.567/O-8). A assinatura foi conferida dentro do PDF antes de chegar aqui.
        </Faixa>
      )}
      <PaginaDocumento d={d} />
      <div className="flex flex-wrap gap-2">
        <Button
          className="flex-1 rounded-full"
          onClick={() => {
            entrega(d, 'baixado')
            ctx.avisarApp(`${d.nome} baixado. O escritório vê que chegou.`)
          }}
        >
          <DownloadSimpleIcon /> Baixar
        </Button>
        <Button variant="outline" className="rounded-full" onClick={() => setCompartilhar(true)} disabled={d.tipo === 'holerite'}>
          <ShareNetworkIcon /> Compartilhar
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {ctx.contato.whatsapp && (
          <Button size="sm" variant="ghost" className="rounded-full" disabled={!!enviando} onClick={() => mandar('whatsapp')}>
            <ChatCircleTextIcon /> {enviando === 'whatsapp' ? 'Enviando…' : 'Mandar para meu WhatsApp'}
          </Button>
        )}
        {ctx.contato.email && (
          <Button size="sm" variant="ghost" className="rounded-full" disabled={!!enviando} onClick={() => mandar('email')}>
            <EnvelopeSimpleIcon /> {enviando === 'email' ? 'Enviando…' : 'Mandar por e-mail'}
          </Button>
        )}
        {selo && <SeloDemonstracao fonte={selo} />}
      </div>
      {erro && <EstadoErro titulo="Não deu para enviar" descricao={erro} onTentar={() => setErro(null)} />}
      {d.tipo === 'holerite' && <p className="text-muted-foreground text-xs">Holerite não se compartilha por link (regra do escritório e da LGPD).</p>}
      {ehGuia && !ctx.leitura && (
        <Bloco titulo="Esta guia">
          <p className="text-sm">
            {d.dados?.valor ?? ''} · vence {d.dados?.vencimento ?? '—'}
          </p>
          {informadas[d.id] ? (
            <p className="flex items-center gap-1.5 text-sm">
              <CheckCircleIcon className="text-success size-4" weight="fill" /> Você informou o pagamento em {informadas[d.id]}. A régua parou; a conciliação confirma a baixa.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                className="rounded-full"
                onClick={() => {
                  entrega(d, 'confirmado')
                  ctx.avisarApp('Recebimento confirmado. O escritório vê no farol de entrega.')
                }}
              >
                Recebi
              </Button>
              <Button
                size="sm"
                className="rounded-full"
                onClick={() => {
                  setInformadas((x) => ({ ...x, [d.id]: agoraTexto() }))
                  entrega(d, 'confirmado', 'pagamento informado')
                  ctx.avisarApp('Anotado. A régua de cobrança desta guia para; a baixa confirma na conciliação.')
                }}
              >
                Já paguei
              </Button>
            </div>
          )}
        </Bloco>
      )}
      <p className="text-muted-foreground text-xs">
        {d.competencia ? `Competência ${d.competencia} · ` : ''}publicado em {d.quando} · impressão digital {d.hash.slice(0, 12)}
      </p>
      {compartilhar && <FolhaCompartilhar d={d} ctx={ctx} onFechar={() => setCompartilhar(false)} />}
    </div>
  )
}

/** Link para terceiro (06, 5.4): validade de 7 a 30 dias, senha opcional, acessos registrados, revogável. */
function FolhaCompartilhar({ d, ctx, onFechar }: { d: Documento; ctx: Ctx; onFechar: () => void }) {
  const [, setLinks] = useLinks(ctx.clienteId)
  const [para, setPara] = useState('')
  const [validade, setValidade] = useState('7')
  const [senha, setSenha] = useState(false)
  const [gerado, setGerado] = useState<{ url: string; senha?: string; fonte: string } | null>(null)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const gerar = () => {
    setCarregando(true)
    setErro(null)
    servicos.armazenamento
      .link(d.id)
      .then((r) => {
        const dias = Number(validade)
        const expira = new Date(2026, 10, 18 + dias).toLocaleDateString('pt-BR').slice(0, 5)
        const id = `lk-${Date.now().toString(36)}`
        const s = senha ? String(Math.floor(1000 + Math.random() * 9000)) : undefined
        setLinks((l) => [{ id, docIds: [d.id], nomes: [d.nome], para: para.trim(), validadeDias: dias, expiraEm: expira, senha, criadoEm: agoraTexto(), acessos: [] }, ...l])
        ctx.registrar(`Compartilhou ${d.nome} com ${para.trim()} por link de ${dias} dias${senha ? ' com senha' : ''}`)
        setGerado({ url: `https://${'arquivos'}.heild.app/l/${id}`, senha: s, fonte: r.fonte })
        // O terceiro abre o link um pouco depois (acesso registrado com data, hora e IP).
        setTimeout(() => setLinks((l) => l.map((x) => (x.id === id ? { ...x, acessos: [{ quando: `hoje ${agoraHora()}`, ip: '177.92.4.18' }] } : x))), 6000)
      })
      .catch((e: Error) => setErro(e.message))
      .finally(() => setCarregando(false))
  }
  return (
    <Folha
      titulo="Compartilhar com terceiro"
      onFechar={onFechar}
      rodape={
        !gerado && (
          <Button className="rounded-full" disabled={para.trim().length < 3 || carregando} onClick={gerar}>
            <LinkIcon /> {carregando ? 'Gerando…' : 'Gerar link'}
          </Button>
        )
      }
    >
      {!gerado ? (
        <>
          <p className="text-sm">{d.nome}</p>
          <Campo rotulo="Para quem (nome ou empresa)" valor={para} onMudar={setPara} placeholder="Ex.: Banco do Brasil, gerente Paula" />
          <Escolha rotulo="Validade" valor={validade} onMudar={setValidade} opcoes={['7', '15', '30']} />
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={senha} onChange={(e) => setSenha(e.target.checked)} className="accent-primary size-4" /> Pedir senha (você manda a senha por outro canal)
          </label>
          <p className="text-muted-foreground text-xs">Cada acesso fica registrado (data, hora, IP). Você vê e revoga os links ativos em Documentos.</p>
          {erro && <EstadoErro descricao={erro} onTentar={gerar} />}
        </>
      ) : (
        <>
          <p className="flex items-center gap-2 text-sm">
            <CheckCircleIcon className="text-success size-4" weight="fill" /> Link pronto, vale {validade} dias.
          </p>
          <code className="bg-sunken rounded-md px-3 py-2 text-xs break-all">{gerado.url}</code>
          {gerado.senha && <p className="text-sm">Senha: <strong className="font-mono font-medium">{gerado.senha}</strong> (mande por outro canal)</p>}
          <SeloDemonstracao fonte={gerado.fonte} />
          <Button variant="outline" className="rounded-full" onClick={onFechar}>
            Pronto
          </Button>
        </>
      )}
    </Folha>
  )
}

/** Baixar o mês (06, 3.3): zip com manifesto (lista e hashes). */
function FolhaPacote({ ctx, docs, onFechar }: { ctx: Ctx; docs: Documento[]; onFechar: () => void }) {
  const comps = [...new Set(docs.map((d) => d.competencia).filter((c): c is string => !!c && c.includes('/')))].sort((a, b) => (b.split('/').reverse().join('') > a.split('/').reverse().join('') ? 1 : -1))
  const [comp, setComp] = useState(comps[0] ?? '10/2026')
  const [res, setRes] = useState<{ nome: string; manifesto: { nome: string; hash: string }[]; tamanho: string; fonte: string } | null>(null)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const entrega = useEntrega(ctx)
  const doMes = docs.filter((d) => d.competencia === comp && !indisponivel(d))
  const gerar = () => {
    setCarregando(true)
    setErro(null)
    gerarPacoteMes(
      doMes.map((d) => ({ nome: d.nome, hash: d.hash })),
      comp,
    )
      .then((r) => {
        setRes({ ...r.dados, fonte: r.fonte })
        doMes.forEach((d) => entrega(d, 'baixado', `pacote ${comp}`))
      })
      .catch((e: Error) => setErro(e.message))
      .finally(() => setCarregando(false))
  }
  return (
    <Folha
      titulo="Baixar o mês"
      onFechar={onFechar}
      rodape={
        !res && (
          <Button className="rounded-full" disabled={doMes.length === 0 || carregando} onClick={gerar}>
            <ArchiveIcon /> {carregando ? 'Montando o pacote…' : `Gerar zip (${doMes.length} arquivos)`}
          </Button>
        )
      }
    >
      <Escolha rotulo="Competência" valor={comp} onMudar={(v) => { setComp(v); setRes(null) }} opcoes={comps} />
      {erro && <EstadoErro descricao={erro} onTentar={gerar} />}
      {res && (
        <>
          <p className="flex items-center gap-2 text-sm">
            <CheckCircleIcon className="text-success size-4" weight="fill" /> {res.nome} · {res.tamanho}
          </p>
          <div className="bg-sunken rounded-md p-2.5">
            <p className="text-muted-foreground mb-1 text-[11px]">manifesto.txt (protocolo {protocolo()})</p>
            {res.manifesto.map((m) => (
              <p key={m.nome} className={cn('flex gap-2 text-[11px]')}>
                <span className="min-w-0 flex-1 truncate">{m.nome}</span>
                <span className="font-mono">{m.hash.slice(0, 12)}</span>
              </p>
            ))}
          </div>
          <SeloDemonstracao fonte={res.fonte} />
        </>
      )}
    </Folha>
  )
}

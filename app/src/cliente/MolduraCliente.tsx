import { ArrowSquareOutIcon, BellRingingIcon, DesktopIcon, DeviceMobileIcon, DownloadSimpleIcon, FilePlusIcon, PenNibIcon, SignOutIcon, TrafficSignalIcon } from '@phosphor-icons/react'
import { useMemo, useState, useSyncExternalStore } from 'react'
import { useConversaDe } from '@/ambiente/fluxos'
import { useLoja, usePersistente } from '@/ambiente/loja'
import { Button } from '@/components/ui/button'
import { visivelAoCliente, type Documento } from '@/dados/arquivos'
import { cn } from '@/lib/utils'
import { ClienteApp } from './ClienteApp'
import { publicarAviso } from './avisos'
import { pessoasDoApp, useDominioApp, useEmpresaAtual } from './contexto'
import { useReenvios, useSaidaEscritorio } from './estado'
import { prepararReenvio, prepararTermo } from './motor'
import { Selo, type Tom } from './pecas'
import { AreaRolagem } from '@/components/ui/area-rolagem'

/**
 * Visão "App do cliente" do wireframe: o webapp instalável num aparelho (ou
 * numa janela de computador), e ao lado o que chega ao escritório (o mesmo
 * registro de eventos da plataforma), o farol de abertura das entregas (D-17)
 * e os controles da demonstração. No celular de verdade (< 640px), o app
 * ocupa a tela inteira, sem moldura.
 */
export function MolduraCliente({ pessoa, onPessoa, onEscritorio }: { pessoa: string | null; onPessoa: (n: string | null) => void; onEscritorio: () => void }) {
  const loja = useLoja()
  const dominio = useDominioApp()
  const [instalar, setInstalar] = useState(false)
  const [modo, setModo] = usePersistente<'celular' | 'computador'>('s10:moldura:modo', 'celular')
  const doApp = loja.estado.eventos.filter((e) => e.ator.includes('(cliente, app)') || e.ator.includes('(convidado)')).slice(0, 8)
  const celular = useSyncExternalStore(
    (f) => {
      const m = window.matchMedia('(max-width: 639px)')
      m.addEventListener('change', f)
      return () => m.removeEventListener('change', f)
    },
    () => window.matchMedia('(max-width: 639px)').matches,
  )
  const app = <ClienteApp pessoa={pessoa} onEntrar={onPessoa} onSair={() => onPessoa(null)} largo={modo === 'computador'} />
  // Celular de verdade: o app na tela toda (uma instância só do app, nunca duas).
  if (celular) return <div className="bg-background text-foreground h-svh">{app}</div>
  return (
    <>
      <div className="bg-background flex min-h-svh flex-wrap items-center justify-center gap-8 px-4 py-8">
        {modo === 'celular' ? (
          <div className="relative h-[min(780px,calc(100svh-4rem))] w-[min(390px,100%)] shrink-0 rounded-[48px] bg-[#1d1b19] p-2.5 shadow-2xl ring-1 ring-white/10">
            <div className="bg-background text-foreground relative h-full overflow-hidden rounded-[40px]">
              <div className="absolute top-2 left-1/2 z-40 h-6 w-28 -translate-x-1/2 rounded-full bg-[#1d1b19]" aria-hidden />
              <div className="h-full pt-7">{app}</div>
            </div>
          </div>
        ) : (
          <div className="bg-surface shadow-painel flex h-[min(760px,calc(100svh-4rem))] w-[min(1080px,100%)] shrink-0 flex-col overflow-hidden rounded-lg">
            <div className="bg-sunken text-muted-foreground flex items-center gap-2 px-4 py-2 text-xs">
              <span className="flex gap-1.5" aria-hidden>
                <span className="bg-border size-2.5 rounded-full" />
                <span className="bg-border size-2.5 rounded-full" />
                <span className="bg-border size-2.5 rounded-full" />
              </span>
              <span className="bg-raised flex-1 rounded-full px-3 py-1 text-center">{dominio}</span>
            </div>
            <div className="bg-background text-foreground relative min-h-0 flex-1">{app}</div>
          </div>
        )}
        <AreaRolagem as="aside" className="flex max-h-[calc(100svh-4rem)] w-[min(22rem,100%)] flex-col gap-3 [&>*]:shrink-0">
          <div>
            <p className="text-lg font-light tracking-tight">App do cliente</p>
            <p className="text-muted-foreground text-sm">Web instalável (PWA), incluído no plano; a marca branca e o app na loja são complementos. Usa os mesmos dados do escritório: o que a pessoa faz aqui chega na conversa do CRM, na tarefa e no sino de quem responde.</p>
          </div>
          <div className="bg-sunken grid grid-cols-2 gap-1 rounded-full p-1 text-xs" role="group" aria-label="Ver o app como">
            {(
              [
                ['celular', 'Celular', DeviceMobileIcon],
                ['computador', 'Computador', DesktopIcon],
              ] as const
            ).map(([v, r, I]) => (
              <button key={v} type="button" aria-pressed={modo === v} onClick={() => setModo(v)} className={cn('flex cursor-pointer items-center justify-center gap-1.5 rounded-full px-2 py-1.5', modo === v && 'bg-raised shadow-pilula font-medium')}>
                <I className="size-3.5" /> {r}
              </button>
            ))}
          </div>
          <Button variant="outline" className="w-fit rounded-full" onClick={() => setInstalar(!instalar)}>
            <DownloadSimpleIcon /> Instalar no celular
          </Button>
          {instalar && <p className="bg-sunken rounded-lg px-3 py-2 text-sm">No celular: abrir {dominio}, entrar com o código e tocar em “Adicionar à tela inicial”. Na demonstração, o app roda no aparelho ao lado.</p>}
          <section className="bg-surface shadow-cartao flex flex-col gap-2 rounded-cartao p-4">
            <p className="text-sm font-medium">Chegou ao escritório</p>
            {doApp.length === 0 && <p className="text-muted-foreground text-sm">Nada ainda. Envie uma pendência, abra um pedido ou escreva na conversa.</p>}
            {doApp.map((e) => (
              <p key={e.id} className="text-sm">
                <span className="text-muted-foreground text-xs">{e.quando} · </span>
                {e.texto}
              </p>
            ))}
            <Button size="sm" className="w-fit rounded-full" onClick={onEscritorio}>
              <ArrowSquareOutIcon /> Ver no painel do escritório
            </Button>
          </section>
          <Farol />
          <Simulacoes />
        </AreaRolagem>
      </div>
    </>
  )
}

/** Dias corridos entre a data do documento ("05/11/2026", "hoje") e 18/11 (o dia da demonstração). */
const diasDesde = (quando: string) => {
  const m = quando.match(/(\d{2})\/(\d{2})\/(\d{4})/)
  if (!m) return 0
  return Math.round((new Date(2026, 10, 18).getTime() - new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1])).getTime()) / 864e5)
}
/** Dias úteis aproximados (5 em cada 7). */
const uteis = (dias: number) => Math.floor((dias * 5) / 7)

/** Farol de abertura das entregas (D-17): verde abriu; amarelo no prazo (3 dias úteis); vermelho passou sem abrir, com reenvio preparado no cartão. */
function Farol() {
  const loja = useLoja()
  const atual = useEmpresaAtual()
  const conversaDe = useConversaDe()
  const [reenvios] = useReenvios()
  const empresa = atual?.clienteId
  const linhas = useMemo(() => {
    const docs = loja.documentos.filter((d) => d.clienteId && (!empresa || d.clienteId === empresa) && visivelAoCliente(d) && d.origem !== 'upload_cliente_app' && /\d{2}\/\d{2}\/\d{4}/.test(d.quando) && diasDesde(d.quando) <= 30)
    return docs
      .map((d) => {
        const abriu = (d.entregas ?? []).some((e) => e.acao === 'visto' || e.acao === 'baixado' || e.acao === 'confirmado')
        const u = uteis(diasDesde(d.quando))
        const tom: Tom = abriu ? 'ok' : u <= 3 ? 'atencao' : 'erro'
        return { d, tom, rotulo: abriu ? 'abriu' : u <= 3 ? 'no prazo' : `${u} dias úteis sem abrir`, ordem: tom === 'erro' ? 0 : tom === 'atencao' ? 1 : 2 }
      })
      .sort((a, b) => a.ordem - b.ordem)
      .slice(0, 6)
  }, [loja.documentos, empresa])
  const reenviar = (d: Documento) => {
    const cliente = loja.clientes.find((c) => c.id === d.clienteId)
    const contato = loja.fichaDe(d.clienteId)?.contatos.find((c) => c.app) ?? loja.fichaDe(d.clienteId)?.contatos[0]
    if (!cliente || !contato) return
    prepararReenvio(loja, { clienteId: cliente.id, clienteNome: cliente.nome, docId: d.id, docNome: d.nome, canal: contato.whatsapp ? 'whatsapp' : 'email', contato: contato.nome, conversa: conversaDe(cliente.nome, 'gestao_atendimento', contato.nome) })
  }
  return (
    <section className="bg-surface shadow-cartao flex flex-col gap-2 rounded-cartao p-4">
      <p className="flex items-center gap-2 text-sm font-medium">
        <TrafficSignalIcon className="size-4" /> Farol de abertura (escritório)
      </p>
      <p className="text-muted-foreground text-xs">{empresa ? loja.clientes.find((c) => c.id === empresa)?.nome : 'Todos os clientes'} · prazo de 3 dias úteis por envio. O reenvio por outro canal é preparado pelo Atendimento e sai depois da aprovação.</p>
      {linhas.length === 0 && <p className="text-muted-foreground text-sm">Nenhuma entrega recente.</p>}
      {linhas.map(({ d, tom, rotulo }) => {
        const r = reenvios[d.id]
        return (
          <div key={d.id} className="flex items-center gap-2 text-sm">
            <span className="min-w-0 flex-1">
              <span className="block truncate">{d.nome}</span>
              <span className="text-muted-foreground block text-[11px]">
                enviado {d.quando.slice(0, 5)}
                {r ? ` · reenvio ${r.situacao === 'preparado' ? 'preparado, aguarda aprovação' : r.situacao === 'enviado' ? `enviado por ${r.canal === 'whatsapp' ? 'WhatsApp' : 'e-mail'}` : 'recusado'}` : ''}
              </span>
            </span>
            <Selo tom={tom}>{rotulo}</Selo>
            {tom === 'erro' && !r && (
              <Button size="sm" variant="outline" className="rounded-full" onClick={() => reenviar(d)}>
                Reenviar
              </Button>
            )}
          </div>
        )
      })}
    </section>
  )
}

/** Controles da demonstração do app (não são do produto). */
function Simulacoes() {
  const loja = useLoja()
  const atual = useEmpresaAtual()
  const [saida, setSaida] = useSaidaEscritorio()
  const cliente = loja.clientes.find((c) => c.id === atual?.clienteId)
  const contato = atual?.pessoa
  const pessoas = pessoasDoApp(loja.fichaDe, loja.clientes.map((c) => c.id))
  const [feito, setFeito] = useState<string | null>(null)
  const aviso = (t: string) => {
    setFeito(t)
    setTimeout(() => setFeito(null), 3500)
  }
  return (
    <section className="bg-surface shadow-cartao flex flex-col gap-1 rounded-cartao p-4">
      <p className="text-sm font-medium">Simular (demonstração)</p>
      {!cliente && <p className="text-muted-foreground text-xs">Entre no app como uma pessoa ({pessoas.length} com acesso) para simular o que o escritório faz.</p>}
      {cliente && contato && (
        <>
          <button
            type="button"
            className="hover:bg-sunken/70 flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm"
            onClick={() => {
              publicarAviso(loja, cliente.id, { categoria: 'documento', prioridade: 'alta', titulo: '12 documentos de novembro', corpo: 'Guias, holerites e relatórios publicados agora', quantidade: 12, competencia: '11/2026', destino: { tela: 'documentos' } })
              aviso('Push agrupado enviado ao aparelho.')
            }}
          >
            <BellRingingIcon className="size-4 shrink-0" /> Escritório publica 12 documentos (push agrupado)
          </button>
          <button
            type="button"
            className="hover:bg-sunken/70 flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm"
            onClick={() => {
              loja.criarTarefa({ codigo: 'CTB-002', titulo: 'Cobrar extrato bancário de novembro', cliente: cliente.nome, setor: 'contabil', prazo: '25/11', status: 'aguardando_cliente', responsavel: { tipo: 'integrante', nome: 'Contábil', setor: 'contabil' } })
              publicarAviso(loja, cliente.id, { categoria: 'pendencia', prioridade: 'alta', titulo: 'O escritório precisa de: extrato de novembro', corpo: 'Envie pelo app em um toque', competencia: '11/2026', destino: { tela: 'pendencias' } })
              aviso('Pendência publicada no app.')
            }}
          >
            <FilePlusIcon className="size-4 shrink-0" /> Integrante pede um documento (pendência nova)
          </button>
          <button
            type="button"
            className="hover:bg-sunken/70 flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm"
            onClick={() => {
              prepararTermo(loja, { clienteId: cliente.id, clienteNome: cliente.nome, titulo: 'Termo de ciência: contratação sem registro em período de experiência', texto: 'Declaro que fui orientado pelo escritório de que manter funcionário sem registro, mesmo em experiência, gera risco trabalhista e previdenciário, e que a decisão é da empresa.', contato })
              aviso('O DP está preparando o termo; aprove no chat do DP (painel do escritório).')
            }}
          >
            <PenNibIcon className="size-4 shrink-0" /> DP prepara termo de ciência (C2-06)
          </button>
        </>
      )}
      <button
        type="button"
        aria-pressed={!!saida}
        className="hover:bg-sunken/70 flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm"
        onClick={() => {
          setSaida(saida ? null : { encerraEm: '16/02/2027', desde: '18/11/2026' })
          aviso(saida ? 'Escritório de volta: app normal.' : 'Escritório saiu da plataforma: app em modo leitura por 90 dias.')
        }}
      >
        <SignOutIcon className="size-4 shrink-0" /> {saida ? 'Desfazer a saída do escritório' : 'Escritório sai da plataforma (modo leitura)'}
      </button>
      {feito && <p className="bg-sunken rounded-md px-2 py-1.5 text-xs">{feito}</p>}
    </section>
  )
}

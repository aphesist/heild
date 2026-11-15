import { BellIcon, BookOpenTextIcon, BuildingsIcon, CalendarBlankIcon, CaretRightIcon, ChartBarIcon, ChatCircleDotsIcon, ListChecksIcon, PenNibIcon, PlayCircleIcon, SealCheckIcon, SignOutIcon, SparkleIcon, StorefrontIcon, WalletIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { useLoja } from '@/ambiente/loja'
import { EstadoVazio } from '@/components/kit'
import { Button } from '@/components/ui/button'
import { ator, type Ctx, type Tela } from './contexto'
import { bibliotecaPassos } from './dados'
import { useAssinaturas, usePedidosExtra } from './estado'
import { Bloco, Chip, Chips, TituloTela } from './pecas'
import { useServicos } from './servicos'

/** "Mais" do menu inferior: o resto do app, só o que o papel vê. */
export function Mais({ ctx, onSair }: { ctx: Ctx; onSair: () => void }) {
  const loja = useLoja()
  const { ativos } = useServicos(ctx)
  const [assin] = useAssinaturas(ctx.clienteId)
  const [extras] = usePedidosExtra(ctx.clienteId)
  const aguardandoPedidos = loja.tarefas.filter((t) => t.cliente === ctx.clienteNome && t.origem === 'pedido_cliente' && (t.status === 'aguardando_cliente' || (extras[t.id]?.avulso && !extras[t.id]?.avulso?.autorizado && !extras[t.id]?.avulso?.recusado && t.status !== 'cancelada'))).length
  const itens: [Tela, string, typeof BellIcon, boolean, number?][] = [
    ['aprovacoes', 'Aprovações de pagamento', SealCheckIcon, ctx.areas.includes('bpo')],
    ['caixa', 'Fluxo de caixa', ChartBarIcon, ctx.areas.includes('bpo')],
    ['pedidos', 'Pedidos', ListChecksIcon, true, aguardandoPedidos],
    ['assinaturas', 'Assinaturas', PenNibIcon, true, assin.filter((a) => a.situacao === 'aguardando').length],
    ['financeiro', 'Financeiro com o escritório', WalletIcon, ctx.areas.includes('financeiro')],
    ['empresa', 'Empresa', BuildingsIcon, true],
    ['agenda', 'Agenda', CalendarBlankIcon, true],
    ['servicos', 'Serviços', StorefrontIcon, true],
    ['passos', 'Passo a passo do escritório', BookOpenTextIcon, true],
    ['avisos', 'Avisos', BellIcon, true],
  ]
  return (
    <div className="flex flex-col gap-2">
      <TituloTela>Mais</TituloTela>
      {itens
        .filter((i) => i[3])
        .map(([id, rotulo, I, , n]) => (
          <button key={id} type="button" onClick={() => ctx.ir(id)} className="bg-surface shadow-cartao flex cursor-pointer items-center gap-3 rounded-lg px-3.5 py-3 text-left text-sm">
            <I className="size-5" /> <span className="flex-1">{rotulo}</span>
            {!!n && <span className="bg-primary text-primary-foreground rounded-full px-1.5 text-xs tabular-nums">{n}</span>}
          </button>
        ))}
      {ativos.length > 0 && <p className="text-muted-foreground mt-2 px-1 text-xs font-medium">Seus serviços</p>}
      {ativos.map((sv) => (
        <button key={sv.id} type="button" onClick={() => ctx.abrirServico(sv.id)} className="bg-surface shadow-cartao flex cursor-pointer items-center gap-3 rounded-lg px-3.5 py-3 text-left text-sm">
          <SparkleIcon className="size-5" /> {sv.atalho ?? sv.nome}
        </button>
      ))}
      <button
        type="button"
        onClick={() => {
          loja.registrar(ator(ctx), 'Saiu do app neste aparelho')
          onSair()
        }}
        className="text-muted-foreground mt-3 flex cursor-pointer items-center gap-2 px-1 text-sm"
      >
        <SignOutIcon className="size-4" /> Sair deste aparelho
      </button>
    </div>
  )
}

/** Biblioteca de passo a passo publicada pelo escritório (C2-10, ideia): modelos do escritório, só os do papel. */
export function PassosEscritorio({ ctx }: { ctx: Ctx }) {
  const [assunto, setAssunto] = useState<string>('todos')
  const doPapel = bibliotecaPassos.filter((p) => p.area === 'todos' || ctx.areas.includes(p.area as never))
  const assuntos = [...new Set(doPapel.map((p) => p.assunto))]
  const aberto = ctx.item ? doPapel.find((p) => p.id === ctx.item) : null
  if (aberto)
    return (
      <div className="flex flex-col gap-3">
        <TituloTela voltar={() => ctx.ir('passos')}>{aberto.titulo}</TituloTela>
        <p className="text-muted-foreground text-xs">
          {aberto.assunto} · {aberto.minutos} min · publicado pelo escritório em {aberto.publicadoEm}
        </p>
        {aberto.video && (
          <div className="bg-sunken flex items-center gap-2 rounded-lg px-3 py-3 text-sm">
            <PlayCircleIcon className="size-8 shrink-0" weight="fill" /> {aberto.video}
          </div>
        )}
        <ol className="flex flex-col gap-2.5 text-sm">
          {aberto.passos.map((p, i) => (
            <li key={p} className="flex gap-2">
              <span className="bg-sunken flex size-6 shrink-0 items-center justify-center rounded-full text-xs">{i + 1}</span>
              <span>{p}</span>
            </li>
          ))}
        </ol>
        {!ctx.leitura && (
          <Button variant="outline" className="w-fit rounded-full" onClick={() => ctx.abrirConversa('gestao_atendimento')}>
            <ChatCircleDotsIcon /> Ainda com dúvida? Falar com o escritório
          </Button>
        )}
        <p className="text-muted-foreground text-[11px]">O assistente do escritório usa estes mesmos passo a passo quando você pergunta na conversa.</p>
      </div>
    )
  const lista = doPapel.filter((p) => assunto === 'todos' || p.assunto === assunto)
  return (
    <div className="flex flex-col gap-4">
      <TituloTela voltar={() => ctx.ir('mais')}>Passo a passo</TituloTela>
      <p className="text-muted-foreground text-xs">Tutoriais que o escritório publicou para você fazer sozinho o que é rápido.</p>
      <Chips rotulo="Assunto">
        <Chip ativo={assunto === 'todos'} onClick={() => setAssunto('todos')}>
          Todos
        </Chip>
        {assuntos.map((a) => (
          <Chip key={a} ativo={assunto === a} onClick={() => setAssunto(a)}>
            {a}
          </Chip>
        ))}
      </Chips>
      {lista.length === 0 && <EstadoVazio compacto icone={BookOpenTextIcon} titulo="Nenhum passo a passo" />}
      <Bloco titulo={`${lista.length} ${lista.length === 1 ? 'tutorial' : 'tutoriais'}`}>
        {lista.map((p) => (
          <button key={p.id} type="button" onClick={() => ctx.ir('passos', p.id)} className="hover:bg-sunken/50 -mx-1.5 flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1.5 text-left text-sm">
            <BookOpenTextIcon className="text-muted-foreground size-5 shrink-0" />
            <span className="min-w-0 flex-1">
              <span className="block">{p.titulo}</span>
              <span className="text-muted-foreground block text-xs">
                {p.assunto} · {p.minutos} min{p.video ? ' · com vídeo' : ''}
              </span>
            </span>
            <CaretRightIcon className="text-muted-foreground size-4" />
          </button>
        ))}
      </Bloco>
    </div>
  )
}

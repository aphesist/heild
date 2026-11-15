import { ArrowLeftIcon, CheckIcon, ShieldCheckIcon } from '@phosphor-icons/react'
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { CartaoAprovacao } from '@/components/compostos/cartoes-chat'
import type { Decisao } from '@/components/compostos/botoes-decisao'
import { useConfirmar } from '@/components/kit/confirmar'
import { Carregando, EstadoErro, EstadoVazio } from '@/components/kit/estados'
import { ValorEditavel } from '@/components/kit/valor-editavel'
import { AreaRolagem } from '@/components/ui/area-rolagem'
import { Contador } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Orb } from '@/components/ui/orb'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Tooltip } from '@/components/ui/tooltip'
import type { Cartao } from '@/dados/tipos'
import { useAparencia } from '@/hooks/useAparencia'
import { useMedia } from '@/hooks/useMedia'
import { cn } from '@/lib/utils'
import { banco } from '@/nucleo/banco'
import { rotuloSetorCurto } from '@/nucleo/permissoes'
import { useTabela } from '@/nucleo/react'
import { repos } from '@/nucleo/repositorios'
import { definirPainelDaRota, hashParaDestino, useHash } from '@/nucleo/rotas'
import type { SetorIntegrante } from '@/theme/tipos'
import { argumentosDaLinha, clienteDaLinha, clienteDoTexto, decideOCliente, EVENTO_ABRIR_APROVACOES, expiraDaLinha, filtroDoParametro, parametroDoFiltro, podeAprovarCartao, setorDaLinha, type FiltroAprovacoes } from './cartoes-aprovacao'
import { useMeusIntegrantes } from './contadores-s01'
import { useEfeitosCartao } from './efeitos'
import { useLoja } from './loja'
import { useSessao } from './sessao'

/*
 * Central de aprovações (fase 6; decisão em docs/wireframe/DECISOES.md, UI Lab
 * › Fase 6). Painel lateral global, aberto pelo botão "Aprovações" ao lado do
 * sino: tudo o que espera a decisão da pessoa, de todos os integrantes, por
 * setor e cliente, no padrão novo (argumento corrigido no lugar, Aprovar e
 * Recusar, comentário opcional que vira lição).
 *
 * As fontes são as mesmas do resto do sistema, então decidir aqui vale no chat,
 * no sino e na Visão geral, nos dois modos (local e api):
 *  - a tabela `cartao_aprovacao` (pendentes que a pessoa pode decidir);
 *  - os cartões que ainda só existem no chat dos integrantes dela (os da
 *    demonstração), que ganham a linha no banco quando decididos.
 * Decidir passa por `useEfeitosCartao`, o mesmo caminho do chat e do sino.
 */

type CartaoChat = Extract<Cartao, { tipo: 'aprovacao' }>

export interface ItemAprovacao {
  cartao: CartaoChat
  setor: SetorIntegrante
  clienteId: string | null
  /** `banco`: linha de `cartao_aprovacao`; `chat`: cartão que só existe na conversa do integrante. */
  origem: 'banco' | 'chat'
  /** Já corrigido em algum lugar: aprovar vale como aprovado com edição. */
  corrigido: boolean
}

/** Os cartões que esperam a pessoa (e o estado do banco: carregando ou erro). */
export function useAprovacoesPendentes() {
  const linhas = useTabela('cartao_aprovacao')
  const clientes = useTabela('cliente')
  const loja = useLoja()
  const { usuario, permissoes } = useSessao()
  const integrantes = useMeusIntegrantes()
  const estado = useSyncExternalStore(
    (f) => banco.assinar(f),
    () => banco.estado,
  )
  const itens = useMemo(() => {
    const nomeCliente = (id: string) => clientes.find((c) => c.id === id)?.nome
    const pode = (pode_aprovar: string[], setor: SetorIntegrante) => podeAprovarCartao({ pode_aprovar, setor }, usuario, permissoes.gere)
    // Cartões no chat dos integrantes da pessoa (aprovação, ou aviso com decisão).
    const doChat = new Map<string, { cartao: CartaoChat; setor: SetorIntegrante }>()
    for (const i of integrantes)
      for (const m of loja.conversasTime[i.id] ?? []) {
        if (m.pendente) continue
        for (const c of m.cartoes ?? []) {
          if (c.tipo === 'aprovacao') doChat.set(c.id, { cartao: c, setor: i.setor })
          else if (c.tipo === 'aviso' && c.aviso.decisao)
            doChat.set(c.id, {
              setor: c.aviso.setor,
              cartao: {
                tipo: 'aprovacao',
                id: c.id,
                resumo: c.aviso.decisao.texto,
                lote: c.aviso.decisao.lote,
                expiraEm: c.aviso.decisao.expiraEm,
                argumentos: [...(c.aviso.fiz ? [{ rotulo: 'Fiz', valor: c.aviso.fiz }] : []), ...(c.aviso.informacao ? [{ rotulo: 'Informação', valor: c.aviso.informacao }] : [])],
              },
            })
        }
      }
    const lista: (ItemAprovacao & { quando: string })[] = []
    const noBanco = new Set(linhas.map((l) => l.id))
    for (const l of linhas) {
      if (l.status !== 'pendente' || l.arquivado_em || decideOCliente(l)) continue
      if (l.extras?.visivel_apos && Number(l.extras.visivel_apos) > Date.now()) continue
      const setor = setorDaLinha(l)
      if (!pode(l.pode_aprovar, setor)) continue
      const chat = doChat.get(l.id)?.cartao
      const temExibidos = Array.isArray(l.extras?.argumentos_exibidos) || Array.isArray(l.extras?.argumentos_tela)
      lista.push({
        cartao: {
          tipo: 'aprovacao',
          id: l.id,
          resumo: l.resumo_humano || chat?.resumo || l.id,
          // Linha antiga, sem os argumentos de exibição: os do chat (se houver) ou os derivados da ação.
          argumentos: !temExibidos && chat?.argumentos?.length ? chat.argumentos : argumentosDaLinha(l, nomeCliente),
          expiraEm: expiraDaLinha(l) ?? chat?.expiraEm,
          lote: chat?.lote ?? (typeof l.extras?.lote === 'number' ? l.extras.lote : undefined),
        },
        setor,
        clienteId: clienteDaLinha(l),
        origem: 'banco',
        corrigido: ((l.extras?.alteracoes as unknown[] | undefined)?.length ?? 0) > 0,
        quando: l.criado_em,
      })
    }
    lista.sort((a, b) => b.quando.localeCompare(a.quando))
    for (const [id, { cartao, setor }] of doChat) {
      // Com linha no banco, quem manda é ela (decidido, expirado ou de outra pessoa).
      // O Assistente (Geral) é de cada pessoa: o cartão dele é sempre dela.
      if (noBanco.has(id) || loja.estado.decisoes[id] || (setor !== 'geral' && !pode([], setor))) continue
      lista.push({ cartao, setor, clienteId: clienteDoTexto(cartao, clientes), origem: 'chat', corrigido: false, quando: '' })
    }
    return lista.map(({ quando: _q, ...item }) => item as ItemAprovacao)
  }, [linhas, clientes, integrantes, loja.conversasTime, loja.estado.decisoes, usuario, permissoes.gere])
  return { itens, carregando: estado === 'carregando' || estado === 'fechado', erro: estado === 'erro' ? (banco.erro ?? 'Não deu para ler os cartões.') : null }
}

/* ---------- O painel (lista agrupada, filtros, lote) ---------- */

export interface PropsPainelAprovacoes {
  itens: ItemAprovacao[]
  carregando?: boolean
  erro?: string | null
  onTentar?: () => void
  filtro: FiltroAprovacoes
  onFiltro: (f: FiltroAprovacoes) => void
  /** Decide um cartão (com o comentário opcional). */
  onDecidir: (item: ItemAprovacao, d: Decisao, comentario?: string) => void
  /** Nome do cliente pelo id (para o filtro). */
  nomeCliente: (id: string) => string | undefined
  className?: string
}

/** Lista da central: filtro por cliente (valor editável) e por setor, grupos por setor com "Aprovar os N". */
export function PainelAprovacoes({ itens, carregando, erro, onTentar, filtro, onFiltro, onDecidir, nomeCliente, className }: PropsPainelAprovacoes) {
  const aparencia = useAparencia()
  const confirmar = useConfirmar()
  const [ultima, setUltima] = useState('')
  const doCliente = filtro.cliente ? itens.filter((i) => i.clienteId === filtro.cliente) : itens
  const setores = [...new Set(doCliente.map((i) => i.setor))].sort((a, b) => rotuloSetorCurto[a].localeCompare(rotuloSetorCurto[b], 'pt-BR'))
  const setorAtivo = filtro.setor && setores.includes(filtro.setor as SetorIntegrante) ? (filtro.setor as SetorIntegrante) : null
  const visiveis = setorAtivo ? doCliente.filter((i) => i.setor === setorAtivo) : doCliente
  const grupos = (setorAtivo ? [setorAtivo] : setores).map((s) => ({ setor: s, itens: visiveis.filter((i) => i.setor === s) })).filter((g) => g.itens.length)
  const emFoco = filtro.cartao ? itens.find((i) => i.cartao.id === filtro.cartao) : undefined
  const clientesNaLista = [...new Set([...itens.map((i) => i.clienteId), filtro.cliente].filter((x): x is string => !!x))]
  const opcoesCliente = [{ valor: 'todos', rotulo: 'todos os clientes' }, ...clientesNaLista.map((id) => ({ valor: id, rotulo: nomeCliente(id) ?? id }))]

  // O cartão pedido (Corrigir no sino, link) aparece no meio da lista, destacado.
  useEffect(() => {
    if (!emFoco) return
    const t = window.setTimeout(() => document.getElementById(`aprovacao-${emFoco.cartao.id}`)?.scrollIntoView({ block: 'center', behavior: 'smooth' }), 120)
    return () => window.clearTimeout(t)
  }, [emFoco?.cartao.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const decidir = (item: ItemAprovacao, d: Decisao, comentario?: string) => {
    onDecidir(item, d, comentario)
    setUltima(`${d === 'recusar' ? 'Recusado' : 'Aprovado'}: ${item.cartao.resumo}.`)
  }
  const aprovarLote = async (setor: SetorIntegrante, lista: ItemAprovacao[]) => {
    const ok = await confirmar({ titulo: `Aprovar os ${lista.length} cartões do ${rotuloSetorCurto[setor]}?`, descricao: lista.map((i) => `• ${i.cartao.resumo}`).join('\n'), acao: `Aprovar os ${lista.length}` })
    if (!ok) return
    lista.forEach((i) => onDecidir(i, i.corrigido ? 'editar_e_aprovar' : 'aprovar'))
    setUltima(`${lista.length} cartões do ${rotuloSetorCurto[setor]} aprovados.`)
  }

  if (carregando) return <Carregando linhas={3} rotulo="Lendo os cartões" className={cn('p-4', className)} />
  if (erro) return <EstadoErro titulo="Não deu para ler os cartões" descricao={erro} onTentar={onTentar} className={className} />

  return (
    <div className={cn('flex min-h-0 flex-1 flex-col', className)}>
      <div className="flex flex-col gap-2 border-b px-4 py-3">
        <p className="text-sm">
          {visiveis.length === 0 ? 'Nada esperando você' : `${visiveis.length} ${visiveis.length === 1 ? 'cartão espera' : 'cartões esperam'} você`}, de{' '}
          <ValorEditavel rotulo="Cliente" valor={filtro.cliente ?? 'todos'} config={{ tipo: 'entidade', buscar: 'Buscar cliente', opcoes: opcoesCliente, outra: false }} desfazer={false} onMudar={(v) => onFiltro({ ...filtro, cartao: undefined, cliente: v === 'todos' ? undefined : String(v) })} />
          .
        </p>
        {setores.length > 1 && (
          <AreaRolagem eixo="x" role="radiogroup" aria-label="Setor" className="-mx-4 flex gap-1.5 px-4 [scrollbar-width:none]">
            {([null, ...setores] as (SetorIntegrante | null)[]).map((s) => {
              const n = s ? doCliente.filter((i) => i.setor === s).length : doCliente.length
              const ativo = setorAtivo === s
              return (
                <button key={s ?? 'todos'} type="button" role="radio" aria-checked={ativo} onClick={() => onFiltro({ ...filtro, cartao: undefined, setor: s ?? undefined })} className={cn('shrink-0 cursor-pointer rounded-full px-2.5 py-1 text-xs transition-colors', ativo ? 'bg-foreground text-background' : 'bg-sunken hover:bg-raised')}>
                  {s ? rotuloSetorCurto[s] : 'Todos'} <span className="tabular-nums opacity-70">{n}</span>
                </button>
              )
            })}
          </AreaRolagem>
        )}
        {filtro.cartao && (
          <p className={cn('flex items-center gap-2 rounded-md px-3 py-2 text-xs', emFoco ? 'bg-highlight/15' : 'bg-sunken')}>
            <span className="min-w-0 flex-1">{emFoco ? 'Este é o cartão que você abriu: corrija o que estiver sublinhado e aprove, ou recuse dizendo por quê.' : 'Esse cartão já foi decidido ou não espera mais você.'}</span>
            <Button size="sm" variant="ghost" className="h-7 shrink-0 rounded-full" onClick={() => onFiltro({ ...filtro, cartao: undefined })}>
              <ArrowLeftIcon /> Ver todos
            </Button>
          </p>
        )}
        <p className="sr-only" role="status">
          {ultima}
        </p>
      </div>
      <AreaRolagem className="flex flex-1 flex-col gap-5 p-4">
        {itens.length === 0 ? (
          <EstadoVazio icone={ShieldCheckIcon} titulo="Nada esperando você" descricao="Quando um integrante preparar algo que precisa da sua aprovação, aparece aqui, de qualquer tela." />
        ) : grupos.length === 0 ? (
          <EstadoVazio
            compacto
            icone={ShieldCheckIcon}
            titulo={`Nada de ${filtro.cliente ? (nomeCliente(filtro.cliente) ?? 'este cliente') : 'este setor'} esperando você`}
            acao={
              <Button size="sm" variant="outline" className="rounded-full" onClick={() => onFiltro({})}>
                Ver todos os {itens.length}
              </Button>
            }
          />
        ) : (
          grupos.map((g) => {
            const t = aparencia({ setor: g.setor })
            return (
              <section key={g.setor} aria-labelledby={`grupo-aprovacao-${g.setor}`} className="flex flex-col gap-2.5">
                <header className="flex items-center gap-2">
                  <Orb cor={t.cor} corOlhos={t.corOlhos} tamanho={22} cutucavel={false} extras={false} />
                  <h3 id={`grupo-aprovacao-${g.setor}`} className="min-w-0 flex-1 truncate text-sm font-medium">
                    {rotuloSetorCurto[g.setor]} <span className="text-muted-foreground font-normal tabular-nums">· {g.itens.length}</span>
                  </h3>
                  {g.itens.length > 1 && (
                    <Button size="sm" variant="outline" className="h-7 shrink-0 rounded-full" onClick={() => void aprovarLote(g.setor, g.itens)}>
                      <CheckIcon weight="bold" /> Aprovar os {g.itens.length}
                    </Button>
                  )}
                </header>
                <ul className="flex flex-col gap-2.5">
                  {g.itens.map((i) => (
                    <li key={i.cartao.id} id={`aprovacao-${i.cartao.id}`}>
                      <CartaoAprovacao cartao={i.cartao} comentario onDecidir={(d, c) => decidir(i, d, c)} className={cn('bg-raised', emFoco?.cartao.id === i.cartao.id && 'ring-warning/50 ring-2')} />
                      {i.clienteId && !filtro.cliente && nomeCliente(i.clienteId) && !i.cartao.resumo.includes(nomeCliente(i.clienteId)!) && <p className="text-muted-foreground mt-1 px-1 text-xs">{nomeCliente(i.clienteId)}</p>}
                    </li>
                  ))}
                </ul>
              </section>
            )
          })
        )}
      </AreaRolagem>
    </div>
  )
}

/* ---------- O botão do cabeçalho e a folha ---------- */

/** Filtro pedido pelo endereço (`?aprovacoes=`), ao abrir a Plataforma por um link. */
const filtroDoEndereco = () => (typeof window === 'undefined' ? null : filtroDoParametro(hashParaDestino(window.location.hash)?.aprovacoes))

/**
 * Botão "Aprovações" (com o contador) ao lado do sino e a folha da central:
 * à direita no computador, inteira (de baixo) no celular. Abre também por
 * `abrirAprovacoes()` e pelo link `?aprovacoes=`.
 */
export function CentralAprovacoes() {
  const loja = useLoja()
  const efeitos = useEfeitosCartao()
  const clientes = useTabela('cliente')
  const { itens, carregando, erro } = useAprovacoesPendentes()
  const celular = useMedia('(max-width: 639px)')
  const [inicial] = useState(filtroDoEndereco)
  const [aberto, setAberto] = useState(!!inicial)
  const [filtro, setFiltro] = useState<FiltroAprovacoes>(inicial ?? {})
  const hash = useHash()

  useEffect(() => {
    const abrir = (e: Event) => {
      setFiltro((e as CustomEvent<FiltroAprovacoes>).detail ?? {})
      setAberto(true)
    }
    window.addEventListener(EVENTO_ABRIR_APROVACOES, abrir)
    return () => window.removeEventListener(EVENTO_ABRIR_APROVACOES, abrir)
  }, [])
  // Link colado ou Voltar do navegador com `?aprovacoes=`: abre (ou troca o filtro).
  useEffect(() => {
    const f = filtroDoParametro(hashParaDestino(hash)?.aprovacoes)
    if (f && parametroDoFiltro(f) !== parametroDoFiltro(filtro)) setFiltro(f)
    if (f) setAberto(true)
  }, [hash]) // eslint-disable-line react-hooks/exhaustive-deps
  // Aberta, entra no endereço (o link abre a mesma central, com o mesmo filtro).
  useEffect(() => {
    definirPainelDaRota(aberto ? { aprovacoes: parametroDoFiltro(filtro) } : {})
  }, [aberto, filtro])
  useEffect(() => () => definirPainelDaRota({}), [])

  const nomeCliente = (id: string) => clientes.find((c) => c.id === id)?.nome
  const decidir = (item: ItemAprovacao, d: Decisao, comentario?: string) => {
    // Cartões ligados (o aviso e o cartão do mesmo contrato) se decidem juntos: o segundo já chega decidido.
    if (repos.cartoes.obter(item.cartao.id)?.decidido_em) return
    try {
      efeitos(item.cartao.id, d, { comentario, setor: item.setor })
    } catch (e) {
      loja.toastErro(e instanceof Error ? e.message : 'Não deu para decidir este cartão.')
    }
  }

  return (
    <>
      <Tooltip conteudo="Aprovações">
        <Button
          variant="ghost"
          size="icon"
          className="relative shrink-0 rounded-full"
          aria-label={`Aprovações (${itens.length} esperando você)`}
          onClick={() => {
            setFiltro({})
            setAberto(true)
          }}
        >
          <ShieldCheckIcon weight="duotone" className="size-5" />
          <Contador valor={itens.length} className="absolute top-1 right-1" />
        </Button>
      </Tooltip>
      <Sheet open={aberto} onOpenChange={setAberto}>
        <SheetContent
          lado={celular ? 'baixo' : 'direita'}
          aria-describedby="descricao-aprovacoes"
          className={cn('gap-0', celular ? 'h-dvh max-h-dvh rounded-none border-t-0' : 'sm:max-w-lg')}
          onOpenAutoFocus={(e) => {
            e.preventDefault()
            ;(e.currentTarget as HTMLElement | null)?.focus()
          }}
        >
          <SheetHeader>
            <SheetTitle>Aprovações</SheetTitle>
            <SheetDescription id="descricao-aprovacoes">Tudo o que os integrantes prepararam e espera a sua decisão. Decidir aqui vale no chat, no sino e na Visão geral.</SheetDescription>
          </SheetHeader>
          <PainelAprovacoes itens={itens} carregando={carregando} erro={erro} onTentar={() => window.location.reload()} filtro={filtro} onFiltro={setFiltro} onDecidir={decidir} nomeCliente={nomeCliente} />
        </SheetContent>
      </Sheet>
    </>
  )
}

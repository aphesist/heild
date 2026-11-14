import { BellSlashIcon, CaretDownIcon, FunnelIcon, HashIcon, MagnifyingGlassIcon, MegaphoneIcon, PlusIcon, UserIcon, UsersThreeIcon, XIcon } from '@phosphor-icons/react'
import { useMemo, useState } from 'react'
import { useMinhasConversasInternas, useNaoLidasInternas, usePreferenciasInternas, usePresenca, useRotuloConversa } from '@/ambiente/interna'
import { useLoja } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import { EstadoVazio } from '@/components/kit'
import { Contador } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ItemMenu, Menu, RotuloMenu } from '@/components/ui/menu'
import { extrasDe, grupos, quando } from '@/dados/interna'
import { cn } from '@/lib/utils'
import type { ConversaInterna, Id } from '@/nucleo/modelo/entidades'
import { useTabela } from '@/nucleo/react'
import { PontoPresenca } from './pecas'

const icone = { pessoal: UserIcon, grupo: UsersThreeIcon, canal_setor: HashIcon, canal_geral: MegaphoneIcon }
type Periodo = 'todos' | 'hoje' | '7' | '30'

/**
 * Lista das conversas internas em três grupos (11, 6): Pessoais e grupos ·
 * Setores · Geral, com não lidas, presença e a última mensagem. A busca
 * (S05-A81) procura no texto, na pessoa, no cliente citado e no período, só no
 * que a pessoa vê.
 */
export function ListaInternas({ ativa, onAbrir, onNova, compacto }: { ativa?: Id | null; onAbrir: (id: Id, mensagem?: Id) => void; onNova: (tipo: 'pessoal' | 'grupo') => void; compacto?: boolean }) {
  const { usuario, contas } = useSessao()
  const loja = useLoja()
  const conversas = useMinhasConversasInternas()
  const { porConversa } = useNaoLidasInternas()
  const prefs = usePreferenciasInternas()
  const presenca = usePresenca()
  const rotulo = useRotuloConversa()
  const tMsg = useTabela('mensagem_interna')
  const tPart = useTabela('participacao')
  const [busca, setBusca] = useState('')
  const [pessoa, setPessoa] = useState<Id | null>(null)
  const [cliente, setCliente] = useState<Id | null>(null)
  const [periodo, setPeriodo] = useState<Periodo>('todos')
  const [fechados, setFechados] = useState<string[]>([])

  const ids = useMemo(() => new Set(conversas.map((c) => c.id)), [conversas])
  const ultimaDe = useMemo(() => {
    const r: Record<Id, (typeof tMsg)[number]> = {}
    for (const m of tMsg) if (ids.has(m.conversa_interna_id) && (!r[m.conversa_interna_id] || m.criado_em > r[m.conversa_interna_id].criado_em)) r[m.conversa_interna_id] = m
    return r
  }, [tMsg, ids])
  const nomeAutor = (m: (typeof tMsg)[number]) => (m.autor_id === usuario.id ? 'Você' : (extrasDe(m).ia?.nome ?? contas.find((u) => u.id === m.autor_id)?.nome.split(' ')[0] ?? ''))

  const termo = busca.trim().toLowerCase()
  const buscando = !!termo || !!pessoa || !!cliente || periodo !== 'todos'
  const resultados = useMemo(() => {
    if (!buscando) return []
    const limite = periodo === 'todos' ? '' : new Date(Date.now() - (periodo === 'hoje' ? 1 : Number(periodo)) * 86400000).toISOString()
    return tMsg
      .filter((m) => ids.has(m.conversa_interna_id) && !extrasDe(m).sistema)
      .filter((m) => !termo || [m.corpo, extrasDe(m).audio?.transcricao ?? '', ...(extrasDe(m).anexos ?? []).map((a) => a.nome)].join(' ').toLowerCase().includes(termo))
      .filter((m) => !pessoa || m.autor_id === pessoa)
      .filter((m) => !cliente || (extrasDe(m).citacoes ?? []).some((c) => c.cliente_id === cliente || (c.tipo === 'cliente' && c.id === cliente)))
      .filter((m) => !limite || m.criado_em >= limite)
      .sort((a, b) => b.criado_em.localeCompare(a.criado_em))
      .slice(0, 40)
  }, [buscando, tMsg, ids, termo, pessoa, cliente, periodo])
  const porNome = conversas.filter((c) => !termo || rotulo(c).toLowerCase().includes(termo))

  const ordenar = (lista: ConversaInterna[]) => [...lista].sort((a, b) => (ultimaDe[b.id]?.criado_em ?? '').localeCompare(ultimaDe[a.id]?.criado_em ?? ''))

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-col gap-2 p-3 pb-2">
        <div className="flex items-center gap-2">
          <label className="bg-sunken flex h-9 min-w-0 flex-1 items-center gap-2 rounded-full px-3">
            <MagnifyingGlassIcon className="text-muted-foreground size-4 shrink-0" />
            <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar nas conversas" aria-label="Buscar nas conversas internas" className="placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent text-sm outline-none" />
            {busca && (
              <button type="button" aria-label="Limpar busca" className="cursor-pointer" onClick={() => setBusca('')}>
                <XIcon className="text-muted-foreground size-3.5" />
              </button>
            )}
          </label>
          {!compacto && (
            <Menu
              align="end"
              gatilho={
                <Button size="icon" variant={pessoa || cliente || periodo !== 'todos' ? 'secondary' : 'ghost'} className="size-9 shrink-0 rounded-full" aria-label="Filtros da busca">
                  <FunnelIcon />
                </Button>
              }
            >
              <RotuloMenu>Período</RotuloMenu>
              {(
                [
                  ['todos', 'Qualquer data'],
                  ['hoje', 'Últimas 24 horas'],
                  ['7', 'Últimos 7 dias'],
                  ['30', 'Últimos 30 dias'],
                ] as [Periodo, string][]
              ).map(([v, r]) => (
                <ItemMenu key={v} onClick={() => setPeriodo(v)} detalhe={periodo === v ? 'escolhido' : undefined}>
                  {r}
                </ItemMenu>
              ))}
              <RotuloMenu>Pessoa</RotuloMenu>
              <ItemMenu onClick={() => setPessoa(null)}>Qualquer pessoa</ItemMenu>
              {contas
                .filter((u) => u.situacao === 'ativo')
                .map((u) => (
                  <ItemMenu key={u.id} onClick={() => setPessoa(u.id)} detalhe={pessoa === u.id ? 'escolhida' : undefined}>
                    {u.nome}
                  </ItemMenu>
                ))}
              <RotuloMenu>Cliente citado</RotuloMenu>
              <ItemMenu onClick={() => setCliente(null)}>Qualquer cliente</ItemMenu>
              {loja.clientes.map((c) => (
                <ItemMenu key={c.id} onClick={() => setCliente(c.id)} detalhe={cliente === c.id ? 'escolhido' : undefined}>
                  {c.nome}
                </ItemMenu>
              ))}
            </Menu>
          )}
          <Menu
            align="end"
            gatilho={
              <Button size="icon" className="size-9 shrink-0 rounded-full" aria-label="Nova conversa">
                <PlusIcon />
              </Button>
            }
          >
            <ItemMenu icone={<UserIcon />} onClick={() => onNova('pessoal')}>
              Conversa pessoal
            </ItemMenu>
            <ItemMenu icone={<UsersThreeIcon />} onClick={() => onNova('grupo')}>
              Novo grupo
            </ItemMenu>
          </Menu>
        </div>
        {(pessoa || cliente || periodo !== 'todos') && (
          <div className="flex flex-wrap gap-1.5 text-xs">
            {periodo !== 'todos' && <Ficha texto={periodo === 'hoje' ? 'últimas 24 h' : `últimos ${periodo} dias`} onTirar={() => setPeriodo('todos')} />}
            {pessoa && <Ficha texto={`de ${contas.find((u) => u.id === pessoa)?.nome}`} onTirar={() => setPessoa(null)} />}
            {cliente && <Ficha texto={`cita ${loja.clientes.find((c) => c.id === cliente)?.nome}`} onTirar={() => setCliente(null)} />}
          </div>
        )}
      </div>

      <div className="area-rolagem-dupla flex-1 overflow-y-auto px-2 pb-3">
        {conversas.length === 0 && <EstadoVazio icone={UsersThreeIcon} titulo="Nenhuma conversa ainda" descricao="Comece com um colega ou use o canal do seu setor." acao={<Button size="sm" className="rounded-full" onClick={() => onNova('pessoal')}>Começar conversa</Button>} />}

        {buscando && (
          <section aria-label="Resultados da busca" className="mb-3">
            <h3 className="text-muted-foreground px-3 py-1.5 text-[11px] font-medium tracking-wide uppercase">Mensagens · {resultados.length}</h3>
            {resultados.length === 0 ? (
              <p className="text-muted-foreground px-3 py-2 text-sm">Nada encontrado no que você pode ver.</p>
            ) : (
              <ul className="flex flex-col gap-0.5">
                {resultados.map((m) => {
                  const c = conversas.find((x) => x.id === m.conversa_interna_id)!
                  return (
                    <li key={m.id}>
                      <button type="button" onClick={() => onAbrir(c.id, m.id)} className="hover:bg-sunken flex w-full cursor-pointer flex-col gap-0.5 rounded-[14px] px-3 py-2 text-left">
                        <span className="text-muted-foreground flex justify-between gap-2 text-[11px]">
                          <span className="truncate">
                            {rotulo(c)} · {nomeAutor(m)}
                          </span>
                          <span className="shrink-0">{quando(m.criado_em)}</span>
                        </span>
                        <span className="line-clamp-2 text-sm">{m.corpo}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
            {termo && <h3 className="text-muted-foreground px-3 pt-3 pb-1.5 text-[11px] font-medium tracking-wide uppercase">Conversas com esse nome</h3>}
          </section>
        )}

        {grupos.map((g) => {
          const lista = ordenar(porNome.filter((c) => g.tipos.includes(c.tipo)))
          if (!lista.length && (buscando || g.id !== 'pessoais')) return null
          const fechado = fechados.includes(g.id)
          const naoLidas = lista.reduce((s, c) => s + (porConversa[c.id] ?? 0), 0)
          return (
            <section key={g.id} aria-label={g.rotulo} className="mb-2">
              <button type="button" aria-expanded={!fechado} onClick={() => setFechados((x) => (fechado ? x.filter((y) => y !== g.id) : [...x, g.id]))} className="text-muted-foreground hover:text-foreground flex w-full cursor-pointer items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium tracking-wide uppercase">
                <CaretDownIcon className={cn('size-3 transition-transform', fechado && '-rotate-90')} />
                {g.rotulo}
                {fechado && <Contador valor={naoLidas} className="ml-auto" />}
              </button>
              {!fechado && (
                <ul className="flex flex-col gap-0.5">
                  {lista.length === 0 && <li className="text-muted-foreground px-3 py-1 text-xs">Comece com um colega ou crie um grupo.</li>}
                  {lista.map((c) => {
                    const Icone = icone[c.tipo]
                    const n = porConversa[c.id] ?? 0
                    const u = ultimaDe[c.id]
                    const outro = c.tipo === 'pessoal' ? tPart.find((p) => p.conversa_interna_id === c.id && p.usuario_id !== usuario.id)?.usuario_id : undefined
                    const silenciada = prefs.silenciadas.includes(c.id)
                    return (
                      <li key={c.id}>
                        <button
                          type="button"
                          aria-current={ativa === c.id ? 'true' : undefined}
                          onClick={() => onAbrir(c.id)}
                          className={cn('flex w-full cursor-pointer items-center gap-3 rounded-[16px] px-3 py-2 text-left', ativa === c.id ? 'bg-raised shadow-pilula' : 'hover:bg-sunken')}
                        >
                          <span className="bg-sunken text-muted-foreground relative flex size-8 shrink-0 items-center justify-center rounded-full">
                            <Icone className="size-4" />
                            {outro && <PontoPresenca presenca={presenca(outro)} className="absolute -right-0.5 -bottom-0.5 size-2" />}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-1.5">
                              <span className={cn('truncate text-sm', n > 0 && !silenciada && 'font-semibold')}>{rotulo(c)}</span>
                              {silenciada && <BellSlashIcon className="text-muted-foreground size-3 shrink-0" aria-label="silenciada" />}
                              <span className="text-muted-foreground ml-auto shrink-0 text-[11px] tabular-nums">{u ? quando(u.criado_em) : ''}</span>
                            </span>
                            <span className="flex items-center gap-2">
                              <span className="text-muted-foreground min-w-0 flex-1 truncate text-xs">{u ? `${extrasDe(u).sistema ? '' : `${nomeAutor(u)}: `}${u.corpo}` : 'Sem mensagens'}</span>
                              {silenciada ? n > 0 && <span className="bg-sunken text-muted-foreground rounded-full px-1.5 text-[10px] tabular-nums">{n}</span> : <Contador valor={n} />}
                            </span>
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}

function Ficha({ texto, onTirar }: { texto: string; onTirar: () => void }) {
  return (
    <span className="bg-sunken flex items-center gap-1 rounded-full py-0.5 pr-1 pl-2.5">
      {texto}
      <button type="button" aria-label={`Tirar filtro ${texto}`} className="hover:bg-raised cursor-pointer rounded-full p-0.5" onClick={onTirar}>
        <XIcon className="size-3" />
      </button>
    </span>
  )
}

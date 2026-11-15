import { BriefcaseIcon, BuildingsIcon, CheckIcon, CaretDownIcon, ClockCounterClockwiseIcon, MagnifyingGlassIcon, StarIcon, TreeStructureIcon } from '@phosphor-icons/react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useClientesNoEscopo, useFavoritos, useGrupoAtivo, useGrupos, useRecentes, LIMITE_FAVORITOS } from '@/ambiente/contexto-cliente'
import { useLoja } from '@/ambiente/loja'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip } from '@/components/ui/tooltip'
import { gruposEconomicos } from '@/dados/grupos-s01'
import type { Cliente } from '@/dados/tipos'
import { normalizar } from '@/dados/busca'
import { cn } from '@/lib/utils'
import { AreaRolagem } from '@/components/ui/area-rolagem'

/** `null` = modo "Todos" (visão de carteira). */
export type SelecaoCliente = string | null

interface Props {
  clientes: Cliente[]
  selecionado: SelecaoCliente
  onSelecionar: (id: SelecaoCliente) => void
  /** Carteira ligada: "Todos" vira "Todos os meus" (03, 3.3). */
  carteira?: boolean
  className?: string
  /** Atalho de teclado que abre o seletor (padrão Ctrl/Cmd+J). Só um seletor por tela deve ter. */
  semAtalho?: boolean
}

const situacaoRotulo: Record<NonNullable<Cliente['situacao']>, string> = { ativo: 'ativo', implantacao: 'em implantação', saida: 'em saída' }

/**
 * Seletor do cliente em contexto (S01-T10; 03, 3): busca por nome, CNPJ/CPF
 * com ou sem pontuação, código e apelido; "Todos" (carteira); favoritos (até
 * 10, por conta), recentes (10, por aparelho) e grupos econômicos (o grupo
 * seleciona as empresas como conjunto: "2 de 4 empresas visíveis").
 * Ctrl/Cmd+J abre de qualquer lugar.
 */
export function SeletorCliente({ clientes: doModulo, selecionado, onSelecionar, carteira, className, semAtalho }: Props) {
  // Só o que está no escopo da pessoa (carteira, quando ligada); o módulo já filtrou o pacote.
  const noEscopo = useClientesNoEscopo()
  const clientes = useMemo(() => {
    const ids = new Set(noEscopo.map((c) => c.id))
    return doModulo.filter((c) => ids.has(c.id))
  }, [doModulo, noEscopo])
  const loja = useLoja()
  const [aberto, setAberto] = useState(false)
  const [busca, setBusca] = useState('')
  const { favoritos, alternar } = useFavoritos()
  const { recentes, lembrar } = useRecentes()
  const grupos = useGrupos(clientes)
  const [grupoAtivo, setGrupoAtivo] = useGrupoAtivo()
  const atual = clientes.find((c) => c.id === selecionado)
  const grupo = grupoAtivo ? grupos.find((g) => g.id === grupoAtivo && g.empresas.includes(selecionado ?? '')) : undefined
  const grupoDe = (id: string) => gruposEconomicos.find((g) => g.empresas.includes(id))

  // Cliente saiu do escopo (carteira mudou, cliente arquivado): volta a Todos com aviso (S01-A81).
  const fora = selecionado !== null && doModulo.some((c) => c.id === selecionado) && !clientes.some((c) => c.id === selecionado)
  useEffect(() => {
    if (!fora) return
    const nome = doModulo.find((c) => c.id === selecionado)?.nome
    onSelecionar(null)
    loja.toast(`${nome ?? 'O cliente'} saiu do que você pode ver. Voltamos para Todos.`)
  }, [fora, selecionado, doModulo, onSelecionar, loja])

  useEffect(() => {
    if (semAtalho) return
    const tecla = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault()
        setAberto((v) => !v)
      }
    }
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  }, [semAtalho])

  const filtrados = useMemo(() => {
    const q = normalizar(busca)
    if (!q) return clientes
    const digitos = busca.replace(/\D/g, '')
    return clientes.filter((c) => normalizar(c.nome).includes(q) || c.codigo.startsWith(q) || (digitos.length >= 2 && c.documento.replace(/\D/g, '').includes(digitos)) || normalizar(grupoDe(c.id)?.nome ?? '').includes(q) || normalizar(c.regime).startsWith(q))
  }, [busca, clientes])

  const escolher = (id: SelecaoCliente, deGrupo?: string) => {
    onSelecionar(id)
    lembrar(id)
    setGrupoAtivo(deGrupo ?? null)
    setAberto(false)
    setBusca('')
  }

  const porId = new Map(clientes.map((c) => [c.id, c]))
  const favoritosVisiveis = favoritos.map((id) => porId.get(id)).filter((c): c is Cliente => !!c)
  const recentesVisiveis = recentes.map((id) => porId.get(id)).filter((c): c is Cliente => !!c && !favoritos.includes(c.id)).slice(0, 5)

  const opcaoCliente = (c: Cliente, chave: string) => (
    <Opcao
      key={chave}
      ativo={c.id === selecionado && !grupo}
      onClick={() => escolher(c.id)}
      titulo={`${c.codigo} - ${c.nome}`}
      descricao={[c.documento, c.regime, c.situacao && c.situacao !== 'ativo' ? situacaoRotulo[c.situacao] : null, grupoDe(c.id)?.nome].filter(Boolean).join(' · ')}
      icone={<BuildingsIcon />}
      extra={
        <Tooltip conteudo={favoritos.includes(c.id) ? 'Tirar dos favoritos' : favoritos.length >= LIMITE_FAVORITOS ? `Até ${LIMITE_FAVORITOS} favoritos` : 'Favoritar'}>
          <button
            type="button"
            aria-label={favoritos.includes(c.id) ? `Tirar ${c.nome} dos favoritos` : `Favoritar ${c.nome}`}
            aria-pressed={favoritos.includes(c.id)}
            onClick={(e) => {
              e.stopPropagation()
              alternar(c.id)
            }}
            className={cn('hover:bg-sunken flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full', favoritos.includes(c.id) ? 'text-warning-text' : 'text-muted-foreground opacity-0 group-hover:opacity-100 focus-visible:opacity-100 max-sm:opacity-60')}
          >
            <StarIcon className="size-4" weight={favoritos.includes(c.id) ? 'fill' : 'regular'} />
          </button>
        </Tooltip>
      }
    />
  )

  return (
    <Popover open={aberto} onOpenChange={setAberto}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Cliente: ${grupo ? grupo.nome : atual ? atual.nome : 'carteira'} (Ctrl+J)`}
          className={cn('hover:bg-raised/60 font-heading flex h-10 max-w-full min-w-0 cursor-pointer items-center gap-2 rounded-full px-3 text-base font-light tracking-tight transition-colors sm:text-lg 2xl:text-xl', className)}
        >
          <span className="truncate">
            {grupo ? (
              <>
                <span className="sm:hidden">{grupo.nome.replace(/^Grupo /, '')}</span>
                <span className="hidden sm:inline">
                  {grupo.nome} · {grupo.visiveis.length === grupo.empresas.length ? `${grupo.empresas.length} empresas` : `${grupo.visiveis.length} de ${grupo.empresas.length}`}
                </span>
              </>
            ) : atual ? (
              <>
                {atual.codigo}
                <span className="hidden sm:inline"> - {atual.nome}</span>
              </>
            ) : (
              `${carteira ? 'Meus' : 'Carteira'} · ${clientes.length}`
            )}
          </span>
          <CaretDownIcon className="text-muted-foreground size-4 shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(24rem,calc(100vw-1.5rem))] p-0">
        <div className="flex items-center gap-2 border-b px-3">
          <MagnifyingGlassIcon className="text-muted-foreground size-4" />
          <input
            autoFocus
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && filtrados[0] && busca) escolher(filtrados[0].id)
            }}
            placeholder="Código, nome, CNPJ/CPF ou grupo"
            aria-label="Buscar cliente"
            className="placeholder:text-muted-foreground h-10 w-full bg-transparent text-sm outline-none"
          />
          <kbd className="text-muted-foreground shrink-0 font-sans text-xs max-sm:hidden">Ctrl+J</kbd>
        </div>
        <AreaRolagem as="ul" role="listbox" aria-label="Clientes" className="max-h-[min(26rem,60vh)] p-1">
          {!busca && (
            <>
              <Opcao ativo={selecionado === null} onClick={() => escolher(null)} titulo={carteira ? 'Todos os meus' : 'Todos'} descricao={`Visão de carteira · ${clientes.length} ${clientes.length === 1 ? 'cliente' : 'clientes'}`} icone={<BriefcaseIcon />} />
              {favoritosVisiveis.length > 0 && <Secao icone={<StarIcon weight="fill" />}>Favoritos</Secao>}
              {favoritosVisiveis.map((c) => opcaoCliente(c, `f-${c.id}`))}
              {recentesVisiveis.length > 0 && <Secao icone={<ClockCounterClockwiseIcon />}>Recentes neste aparelho</Secao>}
              {recentesVisiveis.map((c) => opcaoCliente(c, `r-${c.id}`))}
              {grupos.length > 0 && <Secao icone={<TreeStructureIcon />}>Grupos econômicos</Secao>}
              {grupos.map((g) => (
                <Opcao
                  key={g.id}
                  ativo={grupo?.id === g.id}
                  onClick={() => escolher(g.visiveis.some((c) => c.id === g.principal) ? g.principal : g.visiveis[0].id, g.id)}
                  titulo={g.nome}
                  descricao={`${g.visiveis.length === g.empresas.length ? `${g.empresas.length} empresas` : `${g.visiveis.length} de ${g.empresas.length} empresas visíveis`} · ${g.visiveis.map((c) => c.nome.split(' ')[0]).join(', ')}`}
                  icone={<TreeStructureIcon />}
                />
              ))}
              <Secao icone={<BuildingsIcon />}>Todos os clientes</Secao>
            </>
          )}
          {filtrados.map((c) => opcaoCliente(c, c.id))}
          {filtrados.length === 0 && <li className="text-muted-foreground px-3 py-6 text-center text-sm">Nenhum cliente encontrado no que você pode ver</li>}
        </AreaRolagem>
      </PopoverContent>
    </Popover>
  )
}

function Secao({ icone, children }: { icone: ReactNode; children: ReactNode }) {
  return (
    <li role="presentation" className="text-muted-foreground flex items-center gap-1.5 px-2 pt-3 pb-1 text-xs font-medium [&_svg]:size-3.5">
      {icone}
      {children}
    </li>
  )
}

function Opcao({ ativo, onClick, titulo, descricao, icone, extra }: { ativo: boolean; onClick: () => void; titulo: string; descricao: string; icone: ReactNode; extra?: ReactNode }) {
  return (
    <li role="option" aria-selected={ativo} className="group">
      <div className="hover:bg-accent flex w-full items-center gap-1 rounded-md pr-1">
        <button type="button" onClick={onClick} className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 px-2 py-2 text-left">
          <span className="text-muted-foreground [&_svg]:size-4">{icone}</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm">{titulo}</span>
            <span className="text-muted-foreground block truncate text-xs">{descricao}</span>
          </span>
          {ativo && <CheckIcon className="size-4 shrink-0" />}
        </button>
        {extra}
      </div>
    </li>
  )
}

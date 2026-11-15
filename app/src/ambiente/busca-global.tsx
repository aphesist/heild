import { ArrowElbowDownLeftIcon, BuildingsIcon, ChatCircleIcon, ChatsTeardropIcon, FileTextIcon, ListChecksIcon, MagnifyingGlassIcon, ScrollIcon, SquaresFourIcon, UserIcon, type Icon } from '@phosphor-icons/react'
import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Orb } from '@/components/ui/orb'
import { buscarTudo, type ResultadoBusca, type TipoResultado } from '@/dados/busca'
import { useAparencia } from '@/hooks/useAparencia'
import { cn } from '@/lib/utils'
import { useTabela } from '@/nucleo/react'
import { useClienteDaRota, useClientesNoEscopo } from './contexto-cliente'
import { useLoja, useNavegacao, type IdModulo } from './loja'
import { useSessao } from './sessao'
import { AreaRolagem } from '@/components/ui/area-rolagem'

/**
 * Busca global (S01-T09; contrato C7). Abre pelo ícone do cabeçalho, por
 * Ctrl/Cmd+K ou por "/" fora de um campo. Junta as fontes de cada módulo
 * (`src/dados/busca.ts`), só no escopo da pessoa, e leva à aba certa no
 * cliente certo (trocando o cliente com aviso de uma linha).
 */

const EVENTO = 'heild:abrir-busca'
export const abrirBusca = (termo = '') => window.dispatchEvent(new CustomEvent<string>(EVENTO, { detail: termo }))

const icones: Partial<Record<TipoResultado, Icon>> = {
  cliente: BuildingsIcon,
  tarefa: ListChecksIcon,
  obrigacao: ScrollIcon,
  documento: FileTextIcon,
  conversa: ChatCircleIcon,
  mensagem_interna: ChatsTeardropIcon,
  pessoa: UserIcon,
  tela: SquaresFourIcon,
}

/** Exemplos que aparecem com o campo vazio (todos casam com os dados de exemplo). */
const exemplos = ['Metalúrgica', '12.345.678/0001-90', 'PGDAS', 'legal', 'funcionários', 'usuários']

export function BuscaGlobal() {
  const [aberta, setAberta] = useState(false)
  const [termo, setTermo] = useState('')
  const [ativo, setAtivo] = useState(0)
  const adiado = useDeferredValue(termo)
  const lista = useRef<HTMLUListElement>(null)
  const loja = useLoja()
  const nav = useNavegacao()
  const { usuario, permissoes } = useSessao()
  const clientes = useClientesNoEscopo()
  const clienteAtual = useClienteDaRota() ?? null
  const aparencia = useAparencia()
  // Re-busca quando o banco muda (tarefa nova, mensagem nova).
  const versao = [useTabela('tarefa'), useTabela('documento'), useTabela('mensagem_interna'), useTabela('conversa')]

  useEffect(() => {
    const abrir = (e: Event) => {
      setTermo((e as CustomEvent<string>).detail ?? '')
      setAtivo(0)
      setAberta(true)
    }
    const tecla = (e: KeyboardEvent) => {
      const alvo = e.target as HTMLElement | null
      const digitando = !!alvo && (alvo.tagName === 'INPUT' || alvo.tagName === 'TEXTAREA' || alvo.isContentEditable)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setAberta((v) => !v)
      } else if (e.key === '/' && !digitando && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        setAberta(true)
      }
    }
    window.addEventListener(EVENTO, abrir)
    window.addEventListener('keydown', tecla)
    return () => {
      window.removeEventListener(EVENTO, abrir)
      window.removeEventListener('keydown', tecla)
    }
  }, [])

  const modulos = useMemo(() => permissoes.modulos.filter((m) => m !== 'bpo' || loja.estado.bpoModulo) as IdModulo[], [permissoes.modulos, loja.estado.bpoModulo])
  const grupos = useMemo(
    () => (aberta ? buscarTudo(adiado, { usuarioId: usuario.id, papel: usuario.papel, setores: permissoes.setores, modulos, clientes, clienteAtual }) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [aberta, adiado, usuario.id, usuario.papel, permissoes.setores, modulos, clientes, clienteAtual, ...versao],
  )
  const planos = useMemo(() => grupos.flatMap((g) => g.itens), [grupos])
  const digitando = termo !== adiado

  useEffect(() => setAtivo(0), [adiado])
  useEffect(() => {
    lista.current?.querySelector<HTMLElement>(`[data-indice="${ativo}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [ativo])

  const escolher = (r: ResultadoBusca) => {
    setAberta(false)
    setTermo('')
    const troca = r.destino.cliente !== undefined && r.destino.cliente !== clienteAtual
    nav.irPara(r.destino)
    if (troca) {
      const nome = r.destino.cliente ? clientes.find((c) => c.id === r.destino.cliente)?.nome : 'a carteira'
      if (nome) loja.toast(`Agora em ${nome}.`)
    }
  }

  const teclado = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setAtivo((i) => Math.min(planos.length - 1, i + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setAtivo((i) => Math.max(0, i - 1))
    } else if (e.key === 'Enter' && planos[ativo]) {
      e.preventDefault()
      escolher(planos[ativo])
    }
  }

  let indice = -1
  return (
    <Dialog open={aberta} onOpenChange={setAberta}>
      <DialogContent className="bg-raised top-0 flex h-dvh max-h-dvh w-full max-w-full translate-y-0 flex-col gap-0 overflow-hidden rounded-none border-0 p-0 sm:top-[12vh] sm:h-auto sm:max-h-[72vh] sm:max-w-2xl sm:rounded-[24px] sm:shadow-painel" aria-describedby="busca-ajuda">
        <DialogTitle className="sr-only">Busca global</DialogTitle>
        <div className="flex items-center gap-3 border-b px-4 py-1 pr-12">
          <MagnifyingGlassIcon className="text-muted-foreground size-5 shrink-0" />
          <input
            autoFocus
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            onKeyDown={teclado}
            role="combobox"
            aria-expanded={planos.length > 0}
            aria-controls="busca-resultados"
            aria-activedescendant={planos[ativo] ? `busca-${ativo}` : undefined}
            aria-label="Buscar no sistema"
            placeholder="Cliente, CNPJ, tarefa, documento, conversa…"
            className="placeholder:text-muted-foreground h-12 w-full bg-transparent text-base outline-none"
          />
        </div>
        <DialogDescription id="busca-ajuda" className="sr-only">
          Busca só no que a sua conta pode ver. Setas para escolher, Enter para abrir.
        </DialogDescription>
        <AreaRolagem as="ul" ref={lista} id="busca-resultados" role="listbox" aria-label="Resultados" className="flex-1 p-2">
          {!termo.trim() && (
            <li className="flex flex-col gap-3 px-3 py-4">
              <span className="text-muted-foreground text-xs">Experimente</span>
              <span className="flex flex-wrap gap-2">
                {exemplos.map((x) => (
                  <button key={x} type="button" onClick={() => setTermo(x)} className="bg-surface hover:bg-sunken shadow-contorno cursor-pointer rounded-full px-3 py-1 text-xs transition-colors">
                    {x}
                  </button>
                ))}
              </span>
              <span className="text-muted-foreground text-xs">Aceita CNPJ e CPF com ou sem pontuação, código no core e apelido. "Legal" e "Legalização" acham Societário.</span>
            </li>
          )}
          {termo.trim() && !digitando && planos.length === 0 && (
            <li role="status" className="text-muted-foreground px-4 py-10 text-center text-sm">
              Nada encontrado no que você pode ver.
            </li>
          )}
          {termo.trim() && digitando && planos.length === 0 && (
            <li role="status" className="text-muted-foreground px-4 py-10 text-center text-sm">
              Procurando…
            </li>
          )}
          {grupos.map((g) => (
            <li key={g.tipo} role="presentation" className="mb-1">
              <p className="text-muted-foreground px-3 pt-2 pb-1 text-xs font-medium">{g.rotulo}</p>
              <ul role="presentation">
                {g.itens.map((r) => {
                  indice++
                  const i = indice
                  const Icone = icones[r.tipo] ?? MagnifyingGlassIcon
                  const aparenciaIntegrante = r.tipo === 'integrante' && r.setor ? aparencia({ setor: r.setor }) : null
                  return (
                    <li key={`${r.tipo}-${r.id}`} id={`busca-${i}`} data-indice={i} role="option" aria-selected={i === ativo}>
                      <button type="button" onMouseMove={() => setAtivo(i)} onClick={() => escolher(r)} className={cn('flex w-full cursor-pointer items-center gap-3 rounded-[14px] px-3 py-2 text-left', i === ativo && 'bg-sunken')}>
                        <span className="text-muted-foreground flex size-8 shrink-0 items-center justify-center">
                          {aparenciaIntegrante ? <Orb cor={aparenciaIntegrante.cor} corOlhos={aparenciaIntegrante.corOlhos} tamanho={24} extras={false} cutucavel={false} /> : <Icone className="size-[18px]" weight="duotone" />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm">{aparenciaIntegrante?.nome ?? r.titulo}</span>
                          {r.trecho && <span className="text-muted-foreground block truncate text-xs italic">{r.trecho}</span>}
                          {r.detalhe && <span className="text-muted-foreground block truncate text-xs">{r.detalhe}</span>}
                        </span>
                        {i === ativo && <ArrowElbowDownLeftIcon className="text-muted-foreground size-4 shrink-0 max-sm:hidden" />}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </li>
          ))}
        </AreaRolagem>
        <div className="text-muted-foreground flex items-center gap-3 border-t px-4 py-2 text-xs max-sm:hidden">
          <span>
            <kbd className="font-sans">↑↓</kbd> escolher
          </span>
          <span>
            <kbd className="font-sans">Enter</kbd> abrir
          </span>
          <span>
            <kbd className="font-sans">Esc</kbd> fechar
          </span>
          <span className="ml-auto">Só o que a sua conta pode ver</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}

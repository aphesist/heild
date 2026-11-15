import { BellIcon, CaretDownIcon, ChatCircleDotsIcon, CheckCircleIcon, DotsThreeOutlineIcon, FileTextIcon, HouseIcon, ListChecksIcon, UsersThreeIcon } from '@phosphor-icons/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLoja } from '@/ambiente/loja'
import { cn } from '@/lib/utils'
import { usePreferencia } from '@/hooks/usePreferencia'
import { fiscalDe } from '@/dados/painel'
import { AprovacoesApp, CaixaApp } from './bpo'
import { areasDo, ator, definirEmpresaAtual, ehAprovacaoBpo, pessoasDoApp, setoresDas, telasDoMais, telasValidas, type Ctx, type PessoaApp, type Tela } from './contexto'
import { grupoDe } from './dados'
import { EntradaApp } from './entrada'
import { useSaidaEscritorio } from './estado'
import { Servicos, TelaServico } from './servicos'
import { Inicio } from './inicio'
import { Documentos } from './documentos'
import { Pendencias, usePendencias } from './pendencias'
import { Conversa } from './conversa'
import { Pedidos } from './pedidos'
import { Financeiro } from './financeiro'
import { Empresa } from './empresa'
import { Agenda } from './agenda'
import { Avisos, PushSimulado, useNaoLidos } from './avisos'
import { Assinaturas } from './assinaturas'
import { Mais, PassosEscritorio } from './mais'

// O que as outras partes do app (BPO, serviços, painel da demonstração) importam daqui.
export { pessoasDoApp, primeiroNome, idDoUsuario, oQueMandar, type PessoaApp, type Area, type Tela, type Ctx } from './contexto'
export { Bloco, TituloTela } from './pecas'

/* ---------- Casca: entrada, seletor de empresa, sino, menu inferior ---------- */

const CHAVE_SESSAO = 'ui-lab:s10:sessao'

/** Tela e item pelo endereço: #/app/documentos/docn-12 (Voltar do navegador funciona dentro do app). */
function lerEndereco(): { tela: Tela; item: string | null } {
  const m = window.location.hash.match(/^#\/app\/([^/?]+)(?:\/([^?]+))?/)
  const tela = (m?.[1] ?? 'inicio') as Tela
  return { tela: telasValidas.includes(tela) ? tela : 'inicio', item: m?.[2] ? decodeURIComponent(m[2]) : null }
}

/**
 * App do cliente (subplano 06), web instalável. Usa a mesma loja do escritório:
 * o que o cliente envia vira mensagem na conversa do CRM, documento no arquivo,
 * item recebido na tarefa e aviso para quem responde; o que o escritório
 * manda (aprovado por uma pessoa) aparece aqui.
 */
export function ClienteApp({ pessoa, onEntrar, onSair, largo }: { pessoa: string | null; onEntrar: (nome: string) => void; onSair: () => void; largo?: boolean }) {
  const loja = useLoja()
  const pessoas = pessoasDoApp(loja.fichaDe, loja.clientes.map((c) => c.id))
  const p = pessoas.find((x) => x.nome === pessoa)
  // Sessão longa (06, 2.2): quem entrou neste aparelho continua dentro até sair.
  const anterior = useRef(pessoa)
  useEffect(() => {
    try {
      if (pessoa) window.localStorage.setItem(CHAVE_SESSAO, pessoa)
      else if (anterior.current) window.localStorage.removeItem(CHAVE_SESSAO)
      else {
        const guardada = window.localStorage.getItem(CHAVE_SESSAO)
        if (guardada && pessoas.some((x) => x.nome === guardada)) onEntrar(guardada)
      }
    } catch {
      /* sem armazenamento */
    }
    anterior.current = pessoa
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pessoa])
  if (!p) return <EntradaApp pessoas={pessoas} onEntrar={onEntrar} />
  return <AppDaPessoa key={p.nome} pessoa={p} onSair={onSair} largo={largo} />
}

function AppDaPessoa({ pessoa, onSair, largo }: { pessoa: PessoaApp; onSair: () => void; largo?: boolean }) {
  const loja = useLoja()
  const [empresaId, setEmpresaId] = usePreferencia<string>(`ui-lab:s10:empresa:${pessoa.nome}`, pessoa.empresas[0].clienteId)
  const [rota, setRota] = useState(lerEndereco)
  const [seletor, setSeletor] = useState(false)
  const [aviso, setAviso] = useState<string | null>(null)
  const [saida] = useSaidaEscritorio()
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const emp = pessoa.empresas.find((e) => e.clienteId === empresaId) ?? pessoa.empresas[0]
  const cliente = loja.clientes.find((c) => c.id === emp.clienteId) ?? { id: emp.clienteId, nome: emp.clienteId, servicos: undefined }
  const areas = areasDo(emp.contato, cliente.servicos)

  // Endereço ↔ tela (o escritório manda links "#/app/pedidos/t40" e o Voltar funciona).
  useEffect(() => {
    const ler = () => setRota(lerEndereco())
    window.addEventListener('popstate', ler)
    window.addEventListener('hashchange', ler)
    return () => {
      window.removeEventListener('popstate', ler)
      window.removeEventListener('hashchange', ler)
    }
  }, [])
  const ir = useCallback((tela: Tela, item: string | null = null) => {
    const hash = `#/app/${tela}${item ? `/${encodeURIComponent(item)}` : ''}`
    if (window.location.hash !== hash) window.history.pushState(null, '', hash)
    setRota({ tela, item })
    setSeletor(false)
  }, [])

  const ctx: Ctx = useMemo(
    () => ({
      clienteId: cliente.id,
      clienteNome: cliente.nome,
      contato: emp.contato,
      areas,
      setores: setoresDas(areas),
      pessoa: pessoa.nome,
      ehSocio: emp.contato.papel.startsWith('sóci') || emp.contato.papel === 'titular',
      leitura: saida ? { encerraEm: saida.encerraEm } : null,
      item: rota.item,
      avisarApp: (t) => {
        setAviso(t)
        if (timer.current) clearTimeout(timer.current)
        timer.current = setTimeout(() => setAviso(null), 4200)
      },
      ir,
      abrirConversa: (s) => ir('conversa', s),
      abrirServico: (id) => ir('servico', id),
      registrar: (texto) => loja.registrar(ator({ contato: emp.contato }), `${texto} (${cliente.nome})`),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cliente.id, cliente.nome, emp.contato, areas.join(), pessoa.nome, saida, rota.item, ir],
  )
  const naoLidos = useNaoLidos(ctx)
  useEffect(() => {
    definirEmpresaAtual({ pessoa: pessoa.nome, clienteId: cliente.id })
    return () => definirEmpresaAtual(null)
  }, [pessoa.nome, cliente.id])
  const tela = rota.tela

  const menu = (
    [
      ['inicio', 'Início', HouseIcon],
      ['documentos', 'Docs', FileTextIcon],
      ['pendencias', 'Pendências', ListChecksIcon],
      ['conversa', 'Conversa', ChatCircleDotsIcon],
      ['mais', 'Mais', DotsThreeOutlineIcon],
    ] as const
  ).map(([id, rotulo, I]) => {
    const ativo = tela === id || (id === 'mais' && telasDoMais.includes(tela))
    return (
      <button
        key={id}
        type="button"
        onClick={() => ir(id)}
        aria-current={ativo || undefined}
        className={cn('flex cursor-pointer items-center rounded-md text-[11px]', largo ? 'flex-row gap-2.5 px-3 py-2 text-sm' : 'flex-col gap-0.5 py-1', ativo ? 'text-foreground font-medium' : 'text-muted-foreground', largo && ativo && 'bg-sunken')}
      >
        <I className="size-5" weight={ativo ? 'fill' : 'regular'} /> {rotulo}
      </button>
    )
  })

  return (
    <div className={cn('relative flex h-full', largo ? 'flex-row' : 'flex-col')}>
      {largo && (
        <nav className="flex w-48 shrink-0 flex-col gap-1 border-r p-3 pt-4" aria-label="Menu do app">
          {menu}
        </nav>
      )}
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-2 border-b px-4 pt-3 pb-2.5">
          <button type="button" onClick={() => setSeletor(!seletor)} className="flex min-w-0 flex-1 cursor-pointer items-center gap-1.5 text-left" aria-label="Trocar empresa" aria-expanded={seletor}>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">{cliente.nome}</span>
              <span className="text-muted-foreground block truncate text-[11px]">
                {pessoa.nome} · {emp.contato.papel}
              </span>
            </span>
            {pessoa.empresas.length > 1 && <CaretDownIcon className="size-4 shrink-0" />}
          </button>
          <button type="button" aria-label={`Notificações${naoLidos ? ` (${naoLidos} não lidas)` : ''}`} onClick={() => ir('avisos')} className="hover:bg-sunken relative cursor-pointer rounded-full p-2">
            <BellIcon className="size-5" weight={tela === 'avisos' ? 'fill' : 'regular'} />
            {naoLidos > 0 && <span className="bg-destructive text-background absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] tabular-nums">{naoLidos > 9 ? '9+' : naoLidos}</span>}
          </button>
        </header>

        {seletor && <SeletorEmpresa pessoa={pessoa} atual={emp.clienteId} onEscolher={(id) => { setEmpresaId(id); setSeletor(false); ir('inicio') }} onFechar={() => setSeletor(false)} />}

        <PushSimulado ctx={ctx} />

        {/* K-2: a rolagem e o aviso numa camada própria acima do menu inferior; o aviso nunca cobre o menu e o fim da lista tem respiro. */}
        <div className="relative flex min-h-0 flex-1 flex-col">
          <main className={cn('area-rolagem-dupla min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-8', largo && 'mx-auto w-full max-w-3xl px-6')}>
            {tela === 'inicio' && <Inicio ctx={ctx} pessoa={pessoa} />}
            {tela === 'documentos' && <Documentos ctx={ctx} />}
            {tela === 'pendencias' && <Pendencias ctx={ctx} />}
            {tela === 'conversa' && <Conversa ctx={ctx} />}
            {tela === 'pedidos' && <Pedidos ctx={ctx} />}
            {tela === 'financeiro' && <Financeiro ctx={ctx} />}
            {tela === 'empresa' && <Empresa ctx={ctx} />}
            {tela === 'agenda' && <Agenda ctx={ctx} />}
            {tela === 'servicos' && <Servicos ctx={ctx} />}
            {tela === 'servico' && rota.item && <TelaServico key={rota.item} ctx={ctx} id={rota.item} />}
            {tela === 'mais' && <Mais ctx={ctx} onSair={onSair} />}
            {tela === 'aprovacoes' && <AprovacoesApp ctx={ctx} />}
            {tela === 'caixa' && <CaixaApp ctx={ctx} />}
            {tela === 'avisos' && <Avisos ctx={ctx} />}
            {tela === 'assinaturas' && <Assinaturas ctx={ctx} />}
            {tela === 'passos' && <PassosEscritorio ctx={ctx} />}
          </main>

          {aviso && (
            <div role="status" className={"bg-foreground text-background absolute right-3 bottom-3 left-3 z-30 flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm shadow-lg"}>
              <CheckCircleIcon className="mt-0.5 size-4 shrink-0" weight="fill" /> <span className="min-w-0 flex-1">{aviso}</span>
            </div>
          )}
        </div>

        <div id="s10-camada" className="pointer-events-none absolute inset-0 z-40" />
        {!largo && (
          <nav className="grid grid-cols-5 border-t px-1 pt-1.5 pb-2" aria-label="Menu do app">
            {menu}
          </nav>
        )}
      </div>
    </div>
  )
}

/** Seletor de empresa (06, 2.3): sem "Todos"; contagem por empresa e linha "visão do grupo". */
function SeletorEmpresa({ pessoa, atual, onEscolher, onFechar }: { pessoa: PessoaApp; atual: string; onEscolher: (id: string) => void; onFechar: () => void }) {
  const loja = useLoja()
  const contagem = useContagemPorEmpresa(pessoa)
  const grupo = grupoDe(atual)
  const doGrupo = grupo ? pessoa.empresas.filter((e) => grupo.clientes.includes(e.clienteId)) : []
  return (
    <>
      <button type="button" aria-label="Fechar seletor" tabIndex={-1} onClick={onFechar} className="absolute inset-0 z-10 cursor-default" />
      <div className="bg-surface shadow-painel absolute top-14 right-3 left-3 z-20 flex flex-col rounded-lg p-1.5" role="listbox" aria-label="Empresas">
        {pessoa.empresas.map((e) => {
          const n = contagem[e.clienteId]
          return (
            <button
              key={e.clienteId}
              type="button"
              role="option"
              aria-selected={e.clienteId === atual}
              onClick={() => onEscolher(e.clienteId)}
              className={cn('flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left text-sm', e.clienteId === atual ? 'bg-sunken font-medium' : 'hover:bg-sunken/60')}
            >
              <span className="min-w-0 flex-1">
                {loja.clientes.find((c) => c.id === e.clienteId)?.nome} <span className="text-muted-foreground text-xs font-normal">· {e.contato.papel}</span>
              </span>
              {n?.pendencias ? <span className="text-muted-foreground text-xs">{n.pendencias} pend.</span> : null}
            </button>
          )
        })}
        {grupo && doGrupo.length > 1 && (
          <div className="text-muted-foreground mt-1 flex items-center gap-2 border-t px-3 pt-2 pb-1 text-xs">
            <UsersThreeIcon className="size-4 shrink-0" />
            <span>
              Visão do grupo · {grupo.nome}: {doGrupo.reduce((t, e) => t + (contagem[e.clienteId]?.pendencias ?? 0), 0)} pendências e {doGrupo.reduce((t, e) => t + (contagem[e.clienteId]?.vencimentos ?? 0), 0)} vencimentos nesta semana
            </span>
          </div>
        )}
      </div>
    </>
  )
}

/** Pendências e vencimentos de cada empresa da pessoa (só contagens, para o seletor e o Início). */
export function useContagemPorEmpresa(pessoa: PessoaApp) {
  const loja = useLoja()
  const r: Record<string, { pendencias: number; vencimentos: number }> = {}
  for (const e of pessoa.empresas) {
    const nome = loja.clientes.find((c) => c.id === e.clienteId)?.nome
    const setores = setoresDas(areasDo(e.contato, loja.clientes.find((c) => c.id === e.clienteId)?.servicos))
    const pend = loja.tarefas.filter((t) => t.cliente === nome && t.status === 'aguardando_cliente' && setores.includes(t.setor) && !ehAprovacaoBpo(t)).length
    r[e.clienteId] = { pendencias: pend, vencimentos: setores.includes('fiscal') ? fiscalDe(e.clienteId).guias.filter((g) => !g.paga && g.valor !== '—').length : 0 }
  }
  return r
}

export { usePendencias }

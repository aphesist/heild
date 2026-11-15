import { useEffect, useMemo } from 'react'
import { useLoja } from '@/ambiente/loja'
import { useSessaoBruta } from '@/ambiente/sessao'
import { AbaCtx } from '@/components/compostos/painel-aba'
import { EstadoVazio } from '@/components/kit'
import { GradeWidgets } from '@/components/widgets/grade'
import { tamanhoValido, type DefWidget, type TamanhoWidget } from '@/components/widgets/tipos'
import * as exemplo from '@/dados/exemplo'
import { abasPainel } from '@/dados/painel'
import type { Cliente } from '@/dados/tipos'
import type { SetorIntegrante } from '@/theme/tipos'
import { comCenario } from '@/nucleo/semente/cenario'
import { definirInstabilidade } from '@/servicos'
import { gradePainel } from '@/telas/PainelTela'
import { TimeAgora } from '@/telas/VisaoGeralTela'
import { useCatalogoVivo } from '@/telas/inicio/widgets-inicio'
import type { ParamsLab } from './parametros'

/**
 * Os widgets REAIS das telas no Lab, com os dados do cenário (o banco em
 * memória do Lab e as fontes fixas passam por semente/cenario.ts). Um widget é
 * `<aba>|<versao>|<id>`: aba do Painel (ou `inicio`), versão `cliente` ou
 * `carteira` (no Início, `amb`), e o id do widget no catálogo.
 */
export interface WidgetLab {
  chave: string
  aba: string
  versao: 'cliente' | 'carteira' | 'amb'
  id: string
  titulo: string
  tamanhos: TamanhoWidget[]
}

declare global {
  interface Window {
    __widgetsLab?: WidgetLab[]
  }
}

/** O cliente da versão "cliente" de cada aba (o mesmo que a story de tamanhos usa: Fiscal com o do Simples). */
function clienteDaAba(abaId: string, clientes: Cliente[]): Cliente | undefined {
  return abaId === 'fiscal' ? (clientes[1] ?? clientes[0]) : clientes[0]
}

/** Catálogo de uma aba do Painel como a tela monta (contexto da loja; os dados da aba pelo cenário). */
function useCatalogoPainel(abaId: string, versao: 'cliente' | 'carteira'): { catalogo: DefWidget[]; cliente?: Cliente; setor: SetorIntegrante } {
  const loja = useLoja()
  const a = abasPainel.find((x) => x.id === abaId) ?? abasPainel[0]
  const aba = comCenario(a)
  const cliente = versao === 'cliente' ? clienteDaAba(abaId, loja.clientes) : undefined
  const integrante = exemplo.integrantes.find((i) => i.setor === a.setor)
  const catalogo = gradePainel({ aba, cliente, clientesNaCarteira: loja.clientes.length, tarefas: loja.tarefas, integrante }).catalogo
  return { catalogo, cliente, setor: a.setor }
}

/** Catálogo do Início (Visão geral) como a tela monta. */
function useCatalogoInicio(): DefWidget[] {
  return useCatalogoVivo({ linhaExemplo: comCenario(exemplo.linhaDoTempo), clienteId: null, avisos: comCenario(exemplo.avisos), timeAgora: <TimeAgora integrantes={comCenario(exemplo.integrantes)} compacto={false} /> })
}

/** Lista de todos os widgets do Lab (lida pelo QA e pela casca). Monta uma vez e publica em window.__widgetsLab. */
export function useListaWidgets(): WidgetLab[] {
  const inicio = useCatalogoInicio()
  const loja = useLoja()
  const lista = useMemo(() => {
    const out: WidgetLab[] = inicio.map((d) => ({ chave: `inicio|amb|${d.id}`, aba: 'inicio', versao: 'amb' as const, id: d.id, titulo: d.titulo, tamanhos: d.tamanhos }))
    for (const a of abasPainel)
      for (const versao of ['cliente', 'carteira'] as const) {
        const cliente = versao === 'cliente' ? clienteDaAba(a.id, loja.clientes) : undefined
        const integrante = exemplo.integrantes.find((i) => i.setor === a.setor)
        for (const d of gradePainel({ aba: a, cliente, clientesNaCarteira: loja.clientes.length, tarefas: loja.tarefas, integrante }).catalogo) out.push({ chave: `${a.id}|${versao}|${d.id}`, aba: a.id, versao, id: d.id, titulo: d.titulo, tamanhos: d.tamanhos })
      }
    return out
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [inicio.length, loja.clientes.length])
  useEffect(() => {
    window.__widgetsLab = lista
  }, [lista])
  return lista
}

/** Estados que o Lab força nos widgets reais: serviços falhando e "ver como" sem acesso ao setor. */
function useEstadoForcado(p: ParamsLab, setor: SetorIntegrante) {
  const sessao = useSessaoBruta()
  useEffect(() => {
    if (p.estado === 'erro') definirInstabilidade(1)
    return () => definirInstabilidade(0)
  }, [p.estado])
  useEffect(() => {
    if (p.estado !== 'sem-permissao' || !sessao?.definirVerComo) return
    const outro: SetorIntegrante = setor === 'dp' ? 'fiscal' : 'dp'
    sessao.definirVerComo({ papel: 'colaborador', vinculos: [{ setor: outro, modo: 'execucao' }] })
    return () => sessao.definirVerComo(null)
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [p.estado, setor])
}

function GradeDeUm({ def, tamanho, chave }: { def: DefWidget; tamanho: TamanhoWidget; chave: string }) {
  const t = tamanhoValido(def, tamanho)
  return <GradeWidgets key={`${chave}:${t}`} chave={`lab:w:${chave}:${t}`} catalogo={[def]} padrao={[{ id: def.id, tamanho: t }]} />
}

function WidgetPainel({ p, abaId, versao, id }: { p: ParamsLab; abaId: string; versao: 'cliente' | 'carteira'; id: string }) {
  const { catalogo, cliente, setor } = useCatalogoPainel(abaId, versao)
  useEstadoForcado(p, setor)
  const def = catalogo.find((d) => d.id === id)
  if (!def) return <EstadoVazio titulo="Este widget não existe nesta versão" descricao={`${abaId} · ${versao} · ${id}`} />
  return (
    <AbaCtx.Provider value={{ cliente: cliente?.nome, setor, clienteId: cliente?.id, somenteLeitura: false }}>
      <div data-lab-widget={`${abaId}|${versao}|${id}`}>
        <GradeDeUm def={def} tamanho={p.tamanho === 'livre' ? 'M' : p.tamanho} chave={`${abaId}|${versao}|${id}`} />
      </div>
    </AbaCtx.Provider>
  )
}

function WidgetInicio({ p, id }: { p: ParamsLab; id: string }) {
  const catalogo = useCatalogoInicio()
  useEstadoForcado(p, 'geral' as SetorIntegrante)
  const def = catalogo.find((d) => d.id === id)
  if (!def) return <EstadoVazio titulo="Este widget não existe no Início" descricao={id} />
  return (
    <div data-lab-widget={`inicio|amb|${id}`}>
      <GradeDeUm def={def} tamanho={p.tamanho === 'livre' ? 'M' : p.tamanho} chave={`inicio|amb|${id}`} />
    </div>
  )
}

/** Um widget real (variante `<aba>|<versao>|<id>`) com o cenário do endereço. */
export function FichaWidget({ p }: { p: ParamsLab }) {
  useListaWidgets()
  const [aba = 'fiscal', versao = 'cliente', id = 'pendencias'] = (p.variante || 'fiscal|cliente|pendencias').split('|')
  if (aba === 'inicio') return <WidgetInicio p={p} id={id} />
  return <WidgetPainel p={p} abaId={aba} versao={versao === 'carteira' ? 'carteira' : 'cliente'} id={id} />
}

/** Todos os widgets de uma aba, no tamanho escolhido, com o cenário do endereço. */
export function FichaWidgetsDaAba({ p }: { p: ParamsLab }) {
  useListaWidgets()
  const [abaId, modo] = (p.variante || 'inicio').split(':')
  const t: TamanhoWidget = p.tamanho === 'livre' ? 'M' : p.tamanho
  if (abaId === 'inicio') return <AbaInicio t={t} />
  return <AbaPainel abaId={abaId} versao={modo === 'carteira' ? 'carteira' : 'cliente'} t={t} />
}

function AbaInicio({ t }: { t: TamanhoWidget }) {
  const catalogo = useCatalogoInicio()
  return <GradeWidgets key={`inicio:${t}`} chave={`lab:aba:inicio:${t}`} catalogo={catalogo} padrao={catalogo.map((d) => ({ id: d.id, tamanho: tamanhoValido(d, t) }))} />
}

function AbaPainel({ abaId, versao, t }: { abaId: string; versao: 'cliente' | 'carteira'; t: TamanhoWidget }) {
  const { catalogo, cliente, setor } = useCatalogoPainel(abaId, versao)
  return (
    <AbaCtx.Provider value={{ cliente: cliente?.nome, setor, clienteId: cliente?.id, somenteLeitura: false }}>
      <GradeWidgets key={`${abaId}:${versao}:${t}`} chave={`lab:aba:${abaId}:${versao}:${t}`} catalogo={catalogo} padrao={catalogo.map((d) => ({ id: d.id, tamanho: tamanhoValido(d, t) }))} />
    </AbaCtx.Provider>
  )
}

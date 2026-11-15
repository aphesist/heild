import { ArrowLeftIcon, ArrowSquareOutIcon, FlaskIcon } from '@phosphor-icons/react'
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { useSessaoBruta } from '@/ambiente/sessao'
import { AreaRolagem } from '@/components/ui/area-rolagem'
import { Button } from '@/components/ui/button'
import { CampoEscolha, Segmentado } from '@/components/ui/formulario'
import { cn } from '@/lib/utils'
import { irParaPagina, useHash } from '@/nucleo/rotas'
import { temas } from '@/theme/temas'
import { fichasComponentes, type FichaLab } from './fichas'
import { densidades, estados, hashDe, larguras, lerParams, quantidades, rotuloDensidade, rotuloEstado, rotuloQuantidade, rotuloTexto, textos, type ParamsLab } from './parametros'
import { fichasRegras } from './regras'

/** Todas as fichas do Lab: componentes e regras. */
export const fichas: FichaLab[] = [...fichasComponentes, ...fichasRegras]

/** O QA (scripts/ui-lab-qa.cjs) lê daqui a matriz de cada ficha: nada duplicado no script. */
declare global {
  interface Window {
    __fichasLab?: { id: string; nome: string; grupo: string; eixos: FichaLab['eixos'] }[]
  }
}
if (typeof window !== 'undefined') window.__fichasLab = fichas.map(({ id, nome, grupo, eixos }) => ({ id, nome, grupo, eixos }))

/**
 * UI Lab (#/lab/ui): cada componente das telas com controles de tamanho,
 * quantidade de itens, comprimento de texto, estado, tema, largura de tela e
 * densidade, e as páginas das regras. Usa os mesmos componentes das telas,
 * nunca cópias. Com `isolado=1`, mostra só a peça (o que vai no quadro de
 * largura e o que o QA fotografa).
 */
/** Os parâmetros que a ficha aceita: estado, tamanho e variante fora da lista caem no primeiro dela. */
export function normalizar(p: ParamsLab, f: FichaLab | undefined): ParamsLab {
  if (!f) return p
  const e = f.eixos
  return {
    ...p,
    estado: e.estados.includes(p.estado) ? p.estado : e.estados[0],
    tamanho: !e.tamanhos ? p.tamanho : e.tamanhos.includes(p.tamanho) ? p.tamanho : e.tamanhos[0],
    variante: !e.variantes ? p.variante : e.variantes.some((v) => v.valor === p.variante) ? p.variante : e.variantes[0].valor,
    itens: e.itens ? p.itens : 'poucos',
    texto: e.texto ? p.texto : 'curto',
  }
}

export function UiLab() {
  const bruto = lerParams(useHash())
  const p = normalizar(bruto, fichas.find((f) => f.id === bruto.ficha) ?? (bruto.isolado ? undefined : fichas[0]))
  useEntrarSozinho()
  useDensidade(p)
  if (p.isolado) return <Isolado p={p} />
  return <Casca p={p} />
}

/** O Lab não pede login: entra com a primeira conta ativa (a permissão não importa aqui). */
function useEntrarSozinho() {
  const sessao = useSessaoBruta()
  useEffect(() => {
    if (sessao && !sessao.usuario) {
      const conta = sessao.contas.find((c) => c.situacao === 'ativo')
      if (conta) sessao.entrar(conta.id)
    }
  }, [sessao])
}

/** Densidade: base de 16px ou a de tela grande, 18px (tipografia.md); toda a escala é em rem. */
function useDensidade(p: ParamsLab) {
  useLayoutEffect(() => {
    document.documentElement.style.fontSize = p.densidade === 'grande' ? '18px' : ''
    return () => {
      document.documentElement.style.fontSize = ''
    }
  }, [p.densidade])
}

function Isolado({ p }: { p: ParamsLab }) {
  const sessao = useSessaoBruta()
  const ficha = fichas.find((f) => f.id === p.ficha)
  return (
    <AreaRolagem data-qa-raiz data-lab-ficha={p.ficha} data-lab-estado={p.estado} className="from-background to-background-end text-foreground h-dvh bg-gradient-to-b">
      <div className="pagina flex flex-col gap-4 px-4 py-4 sm:px-5">{!sessao?.usuario ? null : ficha ? ficha.render(p) : <p className="text-muted-foreground text-sm">Ficha não encontrada: {p.ficha}</p>}</div>
    </AreaRolagem>
  )
}

function Grupo({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-muted-foreground px-2 text-xs">{titulo}</span>
      {children}
    </div>
  )
}

function Casca({ p }: { p: ParamsLab }) {
  const ficha = fichas.find((f) => f.id === p.ficha) ?? fichas[0]
  const [largura, setLargura] = useState<number>(1440)
  const [todas, setTodas] = useState(false)
  const ir = (mudar: Partial<ParamsLab>) => {
    window.location.hash = hashDe({ ...p, ficha: ficha.id, ...mudar, isolado: false })
  }
  const grupos = [...new Set(fichas.map((f) => f.grupo))]
  const e = ficha.eixos
  const isolado = hashDe({ ...p, ficha: ficha.id, isolado: true })
  return (
    <div className="from-background to-background-end text-foreground flex h-dvh flex-col bg-gradient-to-b md:flex-row">
      <aside className="bg-sidebar flex shrink-0 flex-col gap-3 p-3 md:w-64">
        <div className="flex items-center gap-2 px-2">
          <FlaskIcon className="size-5" aria-hidden />
          <h1 className="text-base font-medium">UI Lab</h1>
          <Button variant="ghost" size="sm" className="ml-auto rounded-full" onClick={() => irParaPagina('sistema')}>
            <ArrowLeftIcon /> Sistema
          </Button>
        </div>
        <AreaRolagem as="nav" aria-label="Fichas do Lab" className="flex max-h-48 flex-col gap-3 md:max-h-none md:flex-1">
          {grupos.map((g) => (
            <Grupo key={g} titulo={g}>
              {fichas
                .filter((f) => f.grupo === g)
                .map((f) => (
                  <button key={f.id} type="button" onClick={() => ir({ ficha: f.id, variante: f.eixos.variantes?.[0]?.valor ?? '' })} aria-current={f.id === ficha.id || undefined} className={cn('min-h-9 cursor-pointer rounded-md px-2 py-1.5 text-left text-sm', f.id === ficha.id ? 'bg-raised shadow-contorno font-medium' : 'hover:bg-accent')}>
                    {f.nome}
                  </button>
                ))}
            </Grupo>
          ))}
        </AreaRolagem>
      </aside>
      <main className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 p-3 sm:p-4">
        <header className="flex flex-col gap-3">
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="font-heading text-2xl font-light tracking-tight">{ficha.nome}</h2>
              <p className="text-muted-foreground max-w-3xl text-sm text-pretty">{ficha.descricao}</p>
            </div>
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <a href={isolado} target="_blank" rel="noreferrer">
                <ArrowSquareOutIcon /> Abrir sozinha
              </a>
            </Button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <CampoEscolha rotulo="Estado" valor={p.estado} onMudar={(v) => ir({ estado: v })} opcoes={(e.estados.length ? e.estados : estados).map((x) => ({ valor: x, rotulo: `Estado: ${rotuloEstado[x]}` }))} />
            {e.itens && <CampoEscolha rotulo="Itens" valor={p.itens} onMudar={(v) => ir({ itens: v })} opcoes={quantidades.map((x) => ({ valor: x, rotulo: `Itens: ${rotuloQuantidade[x]}` }))} />}
            {e.texto && <CampoEscolha rotulo="Texto" valor={p.texto} onMudar={(v) => ir({ texto: v })} opcoes={textos.map((x) => ({ valor: x, rotulo: `Texto: ${rotuloTexto[x]}` }))} />}
            {e.variantes && <CampoEscolha rotulo="Variante" valor={p.variante || e.variantes[0].valor} onMudar={(v) => ir({ variante: v })} opcoes={e.variantes} />}
            <CampoEscolha rotulo="Tema" valor={p.tema || temas[0].id} onMudar={(v) => ir({ tema: v })} opcoes={temas.map((t) => ({ valor: t.id, rotulo: `Tema: ${t.nome_produto}` }))} />
            <CampoEscolha rotulo="Densidade" valor={p.densidade} onMudar={(v) => ir({ densidade: v })} opcoes={densidades.map((x) => ({ valor: x, rotulo: `Densidade: ${rotuloDensidade[x]}` }))} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {e.tamanhos && <Segmentado rotulo="Tamanho" valor={p.tamanho} onMudar={(v) => ir({ tamanho: v })} opcoes={e.tamanhos.map((t) => ({ valor: t, rotulo: t === 'livre' ? 'Livre' : t }))} />}
            <Segmentado rotulo="Modo" valor={p.modo} onMudar={(v) => ir({ modo: v })} opcoes={[{ valor: 'claro', rotulo: 'Claro' }, { valor: 'escuro', rotulo: 'Escuro' }]} />
            <Segmentado rotulo="Largura da tela" valor={todas ? 'todas' : String(largura)} onMudar={(v) => (v === 'todas' ? setTodas(true) : (setTodas(false), setLargura(Number(v))))} opcoes={[...larguras.map((l) => ({ valor: String(l), rotulo: String(l) })), { valor: 'todas', rotulo: 'Todas' }]} />
          </div>
        </header>
        <AreaRolagem className="flex-1">
          {todas ? (
            <div className="flex flex-col gap-4">
              {larguras.map((l) => (
                <Quadro key={l} largura={l} src={isolado} altura={560} />
              ))}
            </div>
          ) : (
            <Quadro largura={largura} src={isolado} />
          )}
        </AreaRolagem>
      </main>
    </div>
  )
}

/** A peça isolada num quadro (iframe) da largura de tela escolhida, em escala quando não cabe. */
function Quadro({ largura, src, altura }: { largura: number; src: string; altura?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [disponivel, setDisponivel] = useState(largura)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(() => setDisponivel(el.clientWidth))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const escala = Math.min(1, disponivel / largura)
  const h = altura ?? 820
  return (
    <div ref={ref} className="flex flex-col gap-1">
      <span className="text-muted-foreground text-xs tabular-nums">
        {largura}px{escala < 1 ? ` · em ${Math.round(escala * 100)}%` : ''}
      </span>
      <div style={{ height: h * escala }}>
        <iframe title={`Prévia em ${largura}px`} src={src} className="bg-background rounded-lg shadow-cartao origin-top-left border-0" style={{ width: largura, height: h, transform: `scale(${escala})` }} />
      </div>
    </div>
  )
}

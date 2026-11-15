import { HandTapIcon, TrayIcon } from '@phosphor-icons/react'
import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { EstadoVazio } from '@/components/kit'
import { Caixa, TituloBloco } from '@/components/compostos/blocos'
import { AreaRolagem } from '@/components/ui/area-rolagem'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GradeWidgets } from '@/components/widgets/grade'
import { dimensoes, type DefWidget, type TamanhoWidget } from '@/components/widgets/tipos'
import { cn } from '@/lib/utils'
import type { FichaLab } from './fichas'
import { textoDe, type ParamsLab } from './parametros'

/* ---------- Contraste medido na tela (WCAG 2.x) ---------- */

/** Cor calculada (qualquer formato do CSS) em RGB, pintando 1px num canvas. */
function rgb(cor: string): [number, number, number] | null {
  const c = document.createElement('canvas')
  c.width = c.height = 1
  const x = c.getContext('2d')
  if (!x) return null
  x.fillStyle = '#000'
  x.fillStyle = cor
  x.fillRect(0, 0, 1, 1)
  const d = x.getImageData(0, 0, 1, 1).data
  return [d[0], d[1], d[2]]
}
const luz = ([r, g, b]: [number, number, number]) => {
  const f = (v: number) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}
export function contraste(a: string, b: string) {
  const x = rgb(a)
  const y = rgb(b)
  if (!x || !y) return 0
  const [l1, l2] = [luz(x), luz(y)].sort((m, n) => n - m)
  return (l1 + 0.05) / (l2 + 0.05)
}

function Par({ fundo, texto, nome }: { fundo: string; texto: string; nome: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [razao, setRazao] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const cs = getComputedStyle(el)
    setRazao(contraste(cs.color, cs.backgroundColor))
  })
  const passa = razao >= 4.5
  return (
    <div ref={ref} className="flex min-w-0 items-center justify-between gap-2 rounded-md px-3 py-2 text-sm" style={{ background: `var(${fundo})`, color: `var(${texto})` }}>
      <span className="min-w-0 truncate" title={nome}>{nome}</span>
      <span className="shrink-0 text-xs tabular-nums">
        {razao.toFixed(1).replace('.', ',')}:1 {passa ? 'AA' : razao >= 3 ? 'AA grande' : 'reprova'}
      </span>
    </div>
  )
}

/* ---------- As páginas ---------- */

function Pagina({ titulo, descricao, children }: { titulo: string; descricao: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="font-heading text-2xl font-light tracking-tight">{titulo}</h2>
        <p className="text-muted-foreground max-w-3xl text-sm text-pretty">{descricao}</p>
      </div>
      {children}
    </div>
  )
}

function Grade() {
  const tamanhosDemo: TamanhoWidget[] = ['P', 'P', 'M', 'G', 'L', 'M', 'P', 'XL']
  const catalogo: DefWidget[] = tamanhosDemo.map((_t, i) => ({
    id: `g${i}`,
    titulo: `Widget ${i + 1}`,
    descricao: '',
    tamanhos: ['P', 'M', 'G', 'L', 'XL'],
    conteudo: (tam) => (
      <p className="text-muted-foreground text-sm">
        {tam} · {dimensoes[tam].rotulo}: {dimensoes[tam].colunas} coluna(s) de largura; teto de {dimensoes[tam].linhas} célula(s). A altura é a do conteúdo.
      </p>
    ),
  }))
  return (
    <Pagina titulo="Grade" descricao="PADRAO_DE_INTERFACE.md, 1 e 3: colunas pela largura do contêiner (menos de 600px: 2; até 980: 4; até 1320: 6; acima: 8). O tamanho dá a largura e o teto; a altura vem do conteúdo, em módulos de 4px; nenhum widget estica para fechar vão. Mude a largura do quadro para ver as colunas mudarem. Manipulação direta: passe o mouse num widget e arraste pela alça de cima (troca de lugar) ou pelo canto de baixo (muda o tamanho, com prévia); no toque, segure o widget; pelo teclado, Tab até a alça e Espaço. Cada mudança grava e oferece Desfazer; Organizar é a alternativa por teclado, com esconder, adicionar e restaurar.">
      <GradeWidgets chave="lab:regra-grade" catalogo={catalogo} padrao={catalogo.map((d, i) => ({ id: d.id, tamanho: tamanhosDemo[i] }))} />
    </Pagina>
  )
}

function Espacamento() {
  const passos = [
    ['espaco-1', '1', 'Ícone e rótulo colados'],
    ['espaco-2', '2', 'Entre chips e botões de um grupo'],
    ['espaco-3', '3', 'Dentro de cartão pequeno; título e corpo'],
    ['espaco-4', '4', 'Padding de cartão; vão da grade; margem lateral no celular'],
    ['espaco-5', '5', 'Padding de painel em tela média'],
    ['espaco-6', '6', 'Padding de painel; entre mensagens'],
    ['espaco-8', '8', 'Entre seções'],
  ] as const
  return (
    <Pagina titulo="Espaçamento" descricao="forma.md: base de 4px. Espaço entre irmãos vem de gap, nunca de margem; nada de valor solto (gap-[13px]).">
      <Caixa>
        {passos.map(([nome, n, uso]) => (
          <div key={nome} className="flex items-center gap-3 text-sm">
            <span className="w-20 shrink-0 font-mono text-xs">{nome}</span>
            <span className="bg-highlight/40 h-4 shrink-0 rounded-sm" style={{ width: `calc(var(--spacing) * ${n})` }} />
            <span className="text-muted-foreground min-w-0">{uso}</span>
          </div>
        ))}
      </Caixa>
    </Pagina>
  )
}

function Tipografia({ p }: { p: ParamsLab }) {
  const estilos = [
    ['display', 'font-heading text-5xl font-light tracking-tight', '48/48, 300'],
    ['numero-grande', 'font-heading text-4xl font-light tabular-nums', '36/40, 300'],
    ['titulo-pagina', 'font-heading text-3xl font-light tracking-tight', '30/36, 300'],
    ['titulo-secao', 'font-heading text-2xl font-light tracking-tight', '24/32, 300'],
    ['titulo-bloco', 'text-lg font-semibold', '18/28, 600'],
    ['corpo', 'text-sm', '14/20, 400'],
    ['corpo-enfase', 'text-sm font-medium', '14/20, 500'],
    ['rotulo', 'text-xs', '12/16, 400'],
    ['rotulo-enfase', 'text-xs font-medium', '12/16, 500'],
    ['micro', 'text-[11px]', '11/16, só a hora'],
  ] as const
  return (
    <Pagina titulo="Tipografia" descricao="tipografia.md: uma família (PP Neue Montreal), títulos grandes leves, ênfase 500, nada abaixo de 12px fora da hora, números tabulares, nada em caixa alta.">
      <Caixa>
        {estilos.map(([nome, classe, medida]) => (
          <div key={nome} className="flex min-w-0 flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className="text-muted-foreground w-32 shrink-0 font-mono text-xs">{nome}</span>
            <span className={cn('min-w-0 break-words', classe)}>{nome.startsWith('numero') ? 'R$ 13.940,00' : textoDe(p.texto, 0)}</span>
            <span className="text-muted-foreground text-xs">{medida}</span>
          </div>
        ))}
      </Caixa>
    </Pagina>
  )
}

function Raios() {
  const raios = [
    ['rounded-sm', 'raio-sm', 'Miniatura, ícone com fundo'],
    ['rounded-md', 'raio-md', 'Item de menu, item dentro de coluna'],
    ['rounded-lg', 'raio-lg', 'Botão retangular, campo, bloco dentro do cartão'],
    ['rounded-cartao', 'raio-cartao', 'Cartão e widget'],
    ['rounded-campo', 'raio-campo', 'Campo do chat'],
    ['rounded-xl', 'raio-xl', 'Gaveta, diálogo'],
    ['rounded-painel', 'raio-painel', 'Painel grande'],
    ['rounded-full', 'raio-pilula', 'Abas, sugestões, selos'],
  ] as const
  return (
    <Pagina titulo="Raios" descricao="forma.md: quanto maior a peça, maior o raio; o de dentro é menor que o de fora (cartão 20, bloco 17, item 12,75). Todos proporcionais ao raio do tema (marca branca).">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {raios.map(([classe, token, uso]) => (
          <div key={classe} className={cn('bg-surface shadow-cartao flex min-h-28 flex-col justify-end gap-1 p-4', classe)}>
            <span className="text-sm font-medium">{token}</span>
            <span className="text-muted-foreground text-xs">{uso}</span>
          </div>
        ))}
      </div>
      <Caixa>
        <TituloBloco>Aninhados</TituloBloco>
        <div className="bg-sunken flex flex-col gap-2 rounded-lg p-2">
          <div className="bg-raised rounded-md p-3 text-sm">Item (raio-md) dentro do bloco (raio-lg) dentro do cartão (raio-cartao)</div>
        </div>
      </Caixa>
      <Caixa>
        <TituloBloco>Mapa dos raios soltos (decidido no UI Lab)</TituloBloco>
        <p className="text-muted-foreground text-sm">
          Os 284 raios em pixel do protótipo viraram o token mais próximo, e o build barra raio solto novo (<code className="font-mono text-xs">npm run regra-raios</code>). Fica fixa só a moldura do aparelho no app do cliente, que desenha o hardware.
        </p>
        <dl className="grid grid-cols-[max-content_minmax(0,1fr)] gap-x-4 gap-y-1 text-sm">
          {(
            [
              ['6 a 10px', 'rounded-sm (8,5px)'],
              ['12 e 14px', 'rounded-md (12,75px)'],
              ['16 e 18px', 'rounded-lg (17px)'],
              ['20 e 22px', 'rounded-cartao (20px)'],
              ['24 a 28px', 'rounded-campo (24px)'],
              ['34px', 'rounded-painel (34px)'],
            ] as const
          ).map(([de, para]) => (
            <div key={de} className="contents">
              <dt className="text-muted-foreground tabular-nums">{de}</dt>
              <dd className="font-mono text-xs leading-5">{para}</dd>
            </div>
          ))}
        </dl>
      </Caixa>
    </Pagina>
  )
}

function Cores() {
  const camadas = ['--background', '--sidebar', '--sunken', '--surface', '--raised']
  const pares: [string, string, string][] = [
    ...camadas.map((c) => [c, '--foreground', `texto sobre ${c.slice(2)}`] as [string, string, string]),
    ...camadas.map((c) => [c, '--muted-foreground', `texto-suave sobre ${c.slice(2)}`] as [string, string, string]),
    ['--primary', '--primary-foreground', 'texto sobre primária'],
    ['--destructive', '--destructive-foreground', 'texto sobre erro'],
  ]
  return (
    <Pagina titulo="Cores" descricao="cores.md: camadas de areia, um destaque índigo, estados sempre com palavra ou ícone. O contraste é medido agora, no tema e no modo escolhidos.">
      <div className="grid gap-2 sm:grid-cols-2">
        {pares.map(([f, t, n]) => (
          <Par key={n} fundo={f} texto={t} nome={n} />
        ))}
      </div>
      <Caixa>
        <TituloBloco>Estados</TituloBloco>
        <div className="flex flex-wrap gap-2">
          <Badge variant="sucesso">concluída</Badge>
          <Badge variant="destaque">aguard. cliente</Badge>
          <Badge variant="erro">atrasada</Badge>
          <Badge variant="neutro">sem prazo</Badge>
        </div>
      </Caixa>
    </Pagina>
  )
}

function Rolagem({ p }: { p: ParamsLab }) {
  const itens = Array.from({ length: 24 }, (_, i) => i)
  return (
    <Pagina titulo="Rolagem com esmaecido" descricao="Toda rolagem passa pela AreaRolagem: o topo e o fim (ou os lados) esmaecem só quando há conteúdo para aquele lado; parado no topo, nada é cortado. Com cabeçalho fixo, o esmaecido começa abaixo dele. A regra scripts/regra-rolagem.cjs barra qualquer classe de rolagem solta fora da primitiva.">
      <div data-vitrine className="grid items-start gap-4 md:grid-cols-2">
        <Caixa className="h-72">
          <TituloBloco>Lista que rola</TituloBloco>
          <AreaRolagem className="flex-1">
            <ul className="divide-border/70 divide-y text-sm">
              {itens.map((i) => (
                <li key={i} className="py-2">{textoDe(p.texto, i)}</li>
              ))}
            </ul>
          </AreaRolagem>
        </Caixa>
        <Caixa>
          <TituloBloco>Faixa que rola de lado</TituloBloco>
          <AreaRolagem eixo="x" className="sem-barra flex gap-2">
            {itens.map((i) => (
              <Badge key={i} variant="neutro">{textoDe(p.texto, i, 'rotulo')}</Badge>
            ))}
          </AreaRolagem>
        </Caixa>
      </div>
    </Pagina>
  )
}

function Toque() {
  return (
    <Pagina titulo="Toque" descricao="PADRAO_DE_INTERFACE.md, 11: com ponteiro grosso, todo alvo tem pelo menos 44px (área invisível, --alvo-toque); campos com 44px; caixa e rádio com 24px e o rótulo completando o alvo. Abra esta ficha em 390 ou 768 (o quadro emula o toque).">
      <Caixa>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Pequeno</Button>
          <Button size="icon-sm" variant="outline" aria-label="Ícone">
            <HandTapIcon />
          </Button>
          <Button variant="link">Link de texto</Button>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="accent-foreground size-4" /> Caixa com rótulo
          </label>
        </div>
      </Caixa>
    </Pagina>
  )
}

function Vazios() {
  return (
    <Pagina titulo="Estados vazios" descricao="PADRAO_DE_INTERFACE.md, 8: ícone regular em círculo rebaixado, a frase do que não há e a ação que resolve, no centro. No widget, o card fica no menor tamanho. Nunca um card em branco, nem enquanto carrega.">
      <div data-vitrine className="grid items-start gap-4 md:grid-cols-2">
        <Caixa>
          <EstadoVazio icone={TrayIcon} titulo="Nenhuma tarefa aberta" descricao="Mude os filtros ou crie uma tarefa." acao={<Button size="sm" className="rounded-full">Nova tarefa</Button>} />
        </Caixa>
        <Caixa>
          <EstadoVazio compacto icone={TrayIcon} titulo="Nada pendente com você" />
        </Caixa>
      </div>
    </Pagina>
  )
}

function Movimento() {
  const reduzir = useReducedMotion()
  const [chave, setChave] = useState(0)
  return (
    <Pagina titulo="Movimento" descricao="forma.md e PADRAO_DE_INTERFACE.md, 9: só quando algo muda. Entrada de cartão: sobe 4px e aparece em 0,3s, ease-out. Hover não move o card. Em repouso, só o orb. Com movimento reduzido, nada se desloca.">
      <Caixa>
        <div className="flex items-center gap-3">
          <Button size="sm" className="rounded-full" onClick={() => setChave((k) => k + 1)}>
            Chegar um cartão
          </Button>
          <span className="text-muted-foreground text-xs">Movimento reduzido: {reduzir ? 'ligado' : 'desligado'}</span>
        </div>
        <motion.div key={chave} initial={reduzir ? false : { opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: 'easeOut' }} className="bg-raised rounded-md p-3 text-sm">
          Conciliei 41 de 44 lançamentos. Faltam três para você conferir.
        </motion.div>
      </Caixa>
    </Pagina>
  )
}

export const fichasRegras: FichaLab[] = [
  { id: 'regra-grade', nome: 'Grade', grupo: 'Regras', descricao: 'Colunas, tamanhos P a XL, altura pelo conteúdo; mover e redimensionar pelas alças.', eixos: { estados: ['padrao'] }, render: () => <Grade /> },
  { id: 'regra-espaco', nome: 'Espaçamento', grupo: 'Regras', descricao: 'Os passos de 4px e onde cada um entra.', eixos: { estados: ['padrao'] }, render: () => <Espacamento /> },
  { id: 'regra-tipografia', nome: 'Tipografia', grupo: 'Regras', descricao: 'A escala do design system.', eixos: { estados: ['padrao'], texto: true }, render: (p) => <Tipografia p={p} /> },
  { id: 'regra-raios', nome: 'Raios', grupo: 'Regras', descricao: 'Os raios e como se aninham.', eixos: { estados: ['padrao'] }, render: () => <Raios /> },
  { id: 'regra-cores', nome: 'Cores e contraste', grupo: 'Regras', descricao: 'Camadas, estados e o contraste medido no tema escolhido.', eixos: { estados: ['padrao'] }, render: () => <Cores /> },
  { id: 'regra-rolagem', nome: 'Rolagem com esmaecido', grupo: 'Regras', descricao: 'A AreaRolagem nas duas direções.', eixos: { estados: ['padrao'], texto: true }, render: (p) => <Rolagem p={p} /> },
  { id: 'regra-toque', nome: 'Toque', grupo: 'Regras', descricao: 'Alvo de 44px com ponteiro grosso.', eixos: { estados: ['padrao'] }, render: () => <Toque /> },
  { id: 'regra-vazios', nome: 'Estados vazios', grupo: 'Regras', descricao: 'A frase, o ícone e a ação.', eixos: { estados: ['padrao'] }, render: () => <Vazios /> },
  { id: 'regra-movimento', nome: 'Movimento', grupo: 'Regras', descricao: 'Entrada de cartão e movimento reduzido.', eixos: { estados: ['padrao'] }, render: () => <Movimento /> },
]

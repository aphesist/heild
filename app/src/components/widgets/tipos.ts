import type { Icon } from '@phosphor-icons/react'
import type { ReactNode } from 'react'

/**
 * Tamanhos fixos de widget, sempre múltiplos da célula da grade (como os
 * widgets do iPhone): P 1×1, M 2×1, G 2×2, L 4×1, XL 4×2 (colunas × linhas).
 */
export type TamanhoWidget = 'P' | 'M' | 'G' | 'L' | 'XL'

export const dimensoes: Record<TamanhoWidget, { colunas: number; linhas: number; rotulo: string }> = {
  P: { colunas: 1, linhas: 1, rotulo: 'Pequeno' },
  M: { colunas: 2, linhas: 1, rotulo: 'Médio' },
  G: { colunas: 2, linhas: 2, rotulo: 'Grande' },
  L: { colunas: 4, linhas: 1, rotulo: 'Largo' },
  XL: { colunas: 4, linhas: 2, rotulo: 'Extra' },
}

/**
 * A grade mede a altura em módulos de 4px (`--modulo-widget`, o `espaco-1` do
 * design system), sem vão entre linhas: o vão de 16px entre widgets empilhados
 * é o respiro embaixo de cada item da grade. Assim o card tem a altura do
 * conteúdo (sobra no máximo 3px), e as alturas por tamanho continuam múltiplos
 * de célula: uma célula (156px) e o vão são 43 módulos; em tela baixa (136px),
 * 38. PADRAO_DE_INTERFACE.md, 3.
 */
export const MODULO_PX = 4
export const VAO_PX = 16
/** Módulos de uma célula com o vão de baixo. */
export const modulosPorCelula = (celulaPx = 156) => Math.round((celulaPx + VAO_PX) / MODULO_PX)

/** Definição de um widget do catálogo de uma tela. */
export interface DefWidget {
  id: string
  titulo: string
  /** Uma linha para a galeria ("Adicionar widget"). */
  descricao: string
  icone?: Icon
  /** IDs do mapa, quando o widget é um bloco de aba (03, seção 6). */
  atividades?: string
  /** Tamanhos que fazem sentido para o conteúdo, do menor ao maior. */
  tamanhos: TamanhoWidget[]
  /** Ação no canto do cabeçalho (ex.: "ver todas"). */
  acao?: ReactNode
  /** Conteúdo; recebe o tamanho atual para se adaptar. */
  conteudo: (tamanho: TamanhoWidget) => ReactNode
  /**
   * Largura mínima do conteúdo no tamanho XL, em rem (kanban: colunas × 15rem;
   * calendário da semana: 7 dias × 9rem). O widget ocupa as colunas da grade
   * que precisar para chegar a ela, até a largura inteira: a largura inteira
   * vem do conteúdo, não de uma regra (PADRAO_DE_INTERFACE.md, 4).
   */
  larguraMinima?: number
  /** Teto de altura em células no tamanho XL, para área de trabalho (kanban, calendário). Padrão: 2. */
  linhasMaximas?: number
}

/** Um widget posto na grade: qual e em que tamanho. A ordem do array é a posição. */
export interface ItemGrade {
  id: string
  tamanho: TamanhoWidget
}

/** Tamanho permitido mais próximo (pela área) quando o pedido não está entre os do widget. */
export function tamanhoValido(def: Pick<DefWidget, 'tamanhos'>, pedido: TamanhoWidget): TamanhoWidget {
  if (def.tamanhos.includes(pedido)) return pedido
  const area = (t: TamanhoWidget) => dimensoes[t].colunas * dimensoes[t].linhas
  return [...def.tamanhos].sort((a, b) => Math.abs(area(a) - area(pedido)) - Math.abs(area(b) - area(pedido)) || area(b) - area(a))[0]
}

/**
 * Vão máximo do widget numa grade de `colunas`: colunas e teto de altura em
 * módulos. Quando a grade é mais estreita que o widget (L e XL no celular),
 * ele ganha altura em vez de ficar achatado: L vira 2×2 células, XL 2×3.
 * `colunasMinimas` é o que a `larguraMinima` pede nesta grade (só no XL).
 */
export function vao(tamanho: TamanhoWidget, colunas: number, def?: Pick<DefWidget, 'linhasMaximas'>, colunasMinimas = 0, mpc = modulosPorCelula()) {
  const d = dimensoes[tamanho]
  const v = d.colunas <= colunas ? { colunas: d.colunas, linhas: d.linhas } : { colunas, linhas: d.linhas + Math.ceil(d.colunas / colunas) - 1 }
  if (tamanho === 'XL') {
    v.colunas = Math.min(colunas, Math.max(v.colunas, colunasMinimas))
    if (def?.linhasMaximas) v.linhas = Math.max(v.linhas, def.linhasMaximas)
  }
  return { colunas: v.colunas, linhas: v.linhas * mpc }
}

/** Posição de um widget na grade (base 0, linhas em módulos de 4px, com o vão de baixo) e o tamanho que o conteúdo usa. */
export interface Posicao {
  coluna: number
  linha: number
  colunas: number
  linhas: number
  /** Tamanho que o conteúdo recebe: o escolhido, ou o maior aceito que cabe na largura (L e XL no celular). */
  efetivo: TamanhoWidget
}

/** O que a grade sabe medir para arranjar. */
export interface Medidas {
  /** Altura que o conteúdo de cada widget pede, em módulos (sem medida, vale o teto do tamanho). */
  alturas?: ReadonlyMap<string, number>
  /** Colunas que a `larguraMinima` de cada widget pede nesta grade. */
  colunasMinimas?: ReadonlyMap<string, number>
  /** Módulos de uma célula (43; 38 em tela baixa). */
  modulosPorCelula?: number
}

/**
 * Arranjo da grade (regra anti-buraco por ordem e empacotamento,
 * PADRAO_DE_INTERFACE.md, 5). O tamanho do widget vem do conteúdo, nunca do
 * vão a fechar:
 * 1. a largura é a do tamanho escolhido (ou a que a `larguraMinima` pede);
 *    a altura é a que o conteúdo pede, entre uma célula e o teto do tamanho;
 *    o que passa do teto por até meia célula (a última linha de sugestões, o
 *    rodapé de uma lista) ganha essa meia célula em vez de ser cortado; passou
 *    mais que isso, o corpo rola por dentro;
 * 2. cada widget vai para o primeiro lugar livre, de cima para baixo e da
 *    esquerda para a direita, na ordem da lista (a ordem é a prioridade da
 *    tarefa; o que vem depois e cabe num vão de cima sobe para ele, como o
 *    `grid-auto-flow: dense`); numa janela de três, vai primeiro o que deixa
 *    menos buraco (ninguém anda mais que duas posições);
 * 3. o widget que tem mais conteúdo do que o teto mostra (ele pede) desce
 *    para o espaço livre logo abaixo dele, até a altura que pede;
 * 4. acerto de faixa: se sob um widget sobra no máximo meia célula até o
 *    próximo widget ou o fim da grade, ele desce essa sobra e o fundo fica
 *    alinhado com o vizinho. Nunca mais que isso: sobra maior fica como está,
 *    e a correção é a ordem do arranjo padrão.
 * Nenhum widget cresce para o lado para fechar vão.
 */
export function arranjar(itens: { id: string; tamanho: TamanhoWidget; def: DefWidget }[], colunas: number, medidas: Medidas = {}): Map<string, Posicao> {
  const mpc = medidas.modulosPorCelula ?? modulosPorCelula()
  // Meia célula: o quanto se dá a mais a quem passa pouco do teto e o quanto um widget desce para alinhar o fundo.
  const meia = Math.floor(mpc / 2)
  // 1. Largura e altura de cada um.
  const medidos = itens.map((it) => {
    const v = vao(it.tamanho, colunas, it.def, medidas.colunasMinimas?.get(it.id), mpc)
    const medida = medidas.alturas?.get(it.id)
    const teto = medida !== undefined && medida <= v.linhas + meia ? medida : v.linhas
    const h = medida === undefined ? v.linhas : Math.max(mpc, Math.min(teto, medida))
    return { id: it.id, w: Math.min(v.colunas, colunas), h, pede: medida ?? 0 }
  })
  // 2. Empacotamento na ordem, com uma janela de três: entre o próximo e os dois seguintes, vai primeiro o que deixa menos buraco.
  const postos = empacotar(medidos, colunas, mpc)
  const pos = new Map(postos.map((p) => [p.id, p]))
  const livre = (c: number, y0: number, y1: number, menos?: string) => {
    for (const p of postos) if (p.id !== menos && c >= p.coluna && c < p.coluna + p.colunas && y0 < p.linha + p.linhas && y1 > p.linha) return false
    return true
  }
  const ultima = Math.max(0, ...postos.map((p) => p.linha + p.linhas))
  const linhaDeBaixoLivre = (p: Retangulo, extra = 0) => {
    const r = p.linha + p.linhas + extra
    if (r >= ultima) return false
    for (let c = p.coluna; c < p.coluna + p.colunas; c++) if (!livre(c, r, r + 1)) return false
    return true
  }
  // 3. Quem pede mais do que mostra desce para o espaço livre logo abaixo.
  for (const m of medidos) {
    const p = pos.get(m.id)!
    while (m.pede > p.linhas && linhaDeBaixoLivre(p)) p.linhas++
  }
  // 4. Acerto de faixa: até meia célula de sobra sob o widget vira altura dele.
  for (const m of medidos) {
    const p = pos.get(m.id)!
    let sobra = 0
    while (sobra <= meia && linhaDeBaixoLivre(p, sobra)) sobra++
    if (sobra > 0 && sobra <= meia) p.linhas += sobra
  }
  const final = new Map<string, Posicao>()
  for (const it of itens) {
    const p = pos.get(it.id)!
    final.set(it.id, { coluna: p.coluna, linha: p.linha, colunas: p.colunas, linhas: p.linhas, efetivo: tamanhoQueCabe(it.def, p.colunas, it.tamanho) })
  }
  return final
}

interface Retangulo {
  id: string
  coluna: number
  linha: number
  colunas: number
  linhas: number
}

/** Primeiro lugar livre (de cima para baixo, da esquerda para a direita) para um bloco w × h entre os já postos. */
function primeiroLivre(postos: Retangulo[], colunas: number, w: number, h: number) {
  const ys = [...new Set([0, ...postos.map((p) => p.linha + p.linhas)])].sort((a, b) => a - b)
  const ocupa = (c: number, y0: number, y1: number) => postos.some((p) => c >= p.coluna && c < p.coluna + p.colunas && y0 < p.linha + p.linhas && y1 > p.linha)
  for (const y of ys)
    for (let c = 0; c + w <= colunas; c++) {
      let cabe = true
      for (let cc = c; cc < c + w && cabe; cc++) cabe = !ocupa(cc, y, y + h)
      if (cabe) return { coluna: c, linha: y }
    }
  return { coluna: 0, linha: ys[ys.length - 1] ?? 0 }
}

/** Área vazia acima do fundo de cada coluna (o buraco no meio; a sobra do fim não conta). */
function buracos(postos: Retangulo[], colunas: number) {
  let vazio = 0
  for (let c = 0; c < colunas; c++) {
    const daColuna = postos.filter((p) => c >= p.coluna && c < p.coluna + p.colunas)
    if (!daColuna.length) continue
    const fundo = Math.max(...daColuna.map((p) => p.linha + p.linhas))
    vazio += fundo - daColuna.reduce((s, p) => s + p.linhas, 0)
  }
  return vazio
}

/**
 * Empacota na ordem da lista, com uma janela de três: antes de pôr o próximo,
 * experimenta as ordens possíveis dele e dos dois seguintes e põe primeiro o
 * que leva ao menor buraco. Empate fica com a ordem original. Assim a
 * prioridade se mantém (ninguém anda mais que duas posições) e um widget largo
 * não deixa um vão que um menor, logo depois, fecharia.
 */
function empacotar(medidos: { id: string; w: number; h: number }[], colunas: number, mpc: number): Retangulo[] {
  const postos: Retangulo[] = []
  const restantes = [...medidos]
  const por = (lista: Retangulo[], m: { id: string; w: number; h: number }) => {
    const l = primeiroLivre(lista, colunas, m.w, m.h)
    lista.push({ id: m.id, coluna: l.coluna, linha: l.linha, colunas: m.w, linhas: m.h })
  }
  const ordens = (n: number): number[][] => (n <= 1 ? [[0]] : n === 2 ? [[0, 1], [1, 0]] : [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]])
  while (restantes.length) {
    const janela = restantes.slice(0, 3)
    let melhor = 0
    let menor = Infinity
    for (const ordem of ordens(janela.length)) {
      const teste = [...postos]
      for (const i of ordem) por(teste, janela[i])
      // Trocar de ordem só vale se fecha pelo menos um quarto de célula de buraco.
      const custo = buracos(teste, colunas) + (ordem[0] === 0 ? 0 : mpc / 4)
      if (custo < menor) {
        menor = custo
        melhor = ordem[0]
      }
    }
    por(postos, janela[melhor])
    restantes.splice(restantes.indexOf(janela[melhor]), 1)
  }
  return postos
}

/**
 * O tamanho que o conteúdo recebe: o escolhido, se cabe na largura da grade;
 * senão (L e XL no celular), o maior que o widget aceita e que cabe nela.
 */
function tamanhoQueCabe(def: Pick<DefWidget, 'tamanhos'>, colunas: number, escolhido: TamanhoWidget): TamanhoWidget {
  if (dimensoes[escolhido].colunas <= colunas) return escolhido
  const area = (t: TamanhoWidget) => dimensoes[t].colunas * dimensoes[t].linhas
  const cabem = def.tamanhos.filter((t) => dimensoes[t].colunas <= colunas)
  if (!cabem.length) return escolhido
  return cabem.reduce((a, b) => (area(b) > area(a) ? b : a))
}

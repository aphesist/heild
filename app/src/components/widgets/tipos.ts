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
 *    `grid-auto-flow: dense`);
 * 3. o widget que tem mais conteúdo do que o teto mostra (ele pede) desce
 *    para o espaço livre logo abaixo dele, até a altura que pede;
 * 4. acerto de faixa: se sob um widget sobra no máximo meia célula até o
 *    próximo widget ou o fim da grade, ele desce essa sobra e o fundo fica
 *    alinhado com o vizinho. Nunca mais que isso: sobra maior fica como está,
 *    e a correção é a ordem do arranjo padrão.
 * Nenhum widget cresce para o lado para fechar vão.
 */
export function arranjar(itens: { id: string; tamanho: TamanhoWidget; def: DefWidget }[], colunas: number, medidas: Medidas = {}): Map<string, Posicao> {
  const grade: (string | null)[][] = []
  const linha = (r: number) => (grade[r] ??= Array<string | null>(colunas).fill(null))
  const livre = (r: number, c: number) => c >= 0 && c < colunas && linha(r)[c] === null
  const marcar = (p: Omit<Posicao, 'efetivo'>, id: string | null) => {
    for (let r = p.linha; r < p.linha + p.linhas; r++) for (let c = p.coluna; c < p.coluna + p.colunas; c++) linha(r)[c] = id
  }
  const mpc = medidas.modulosPorCelula ?? modulosPorCelula()
  // Meia célula: o quanto se dá a mais a quem passa pouco do teto e o quanto um widget desce para alinhar o fundo.
  const meia = Math.floor(mpc / 2)
  const pos = new Map<string, Omit<Posicao, 'efetivo'>>()
  const pede = new Map<string, number>()
  for (const it of itens) {
    const v = vao(it.tamanho, colunas, it.def, medidas.colunasMinimas?.get(it.id), mpc)
    const w = Math.min(v.colunas, colunas)
    const medida = medidas.alturas?.get(it.id)
    const teto = medida !== undefined && medida <= v.linhas + meia ? medida : v.linhas
    const h = medida === undefined ? v.linhas : Math.max(mpc, Math.min(teto, medida))
    if (medida !== undefined) pede.set(it.id, medida)
    for (let r = 0; !pos.has(it.id); r++) {
      for (let c = 0; c + w <= colunas; c++) {
        let cabe = true
        for (let rr = r; rr < r + h && cabe; rr++) for (let cc = c; cc < c + w && cabe; cc++) cabe = livre(rr, cc)
        if (cabe) {
          const p = { coluna: c, linha: r, colunas: w, linhas: h }
          pos.set(it.id, p)
          marcar(p, it.id)
          break
        }
      }
    }
  }
  const ultima = Math.max(0, ...[...pos.values()].map((p) => p.linha + p.linhas))
  const linhaDeBaixoLivre = (p: Omit<Posicao, 'efetivo'>) => {
    const r = p.linha + p.linhas
    if (r >= ultima) return false
    for (let c = p.coluna; c < p.coluna + p.colunas; c++) if (!livre(r, c)) return false
    return true
  }
  // 3. Quem pede mais do que mostra desce para o espaço livre logo abaixo.
  for (const it of itens) {
    const p = pos.get(it.id)!
    while ((pede.get(it.id) ?? 0) > p.linhas && linhaDeBaixoLivre(p)) {
      p.linhas++
      marcar(p, it.id)
    }
  }
  // 4. Acerto de faixa: até meia célula de sobra sob o widget vira altura dele.
  for (const it of itens) {
    const p = pos.get(it.id)!
    let sobra = 0
    while (sobra <= meia && linhaDeBaixoLivre({ ...p, linhas: p.linhas + sobra })) sobra++
    if (sobra === 0 || sobra > meia) continue
    p.linhas += sobra
    marcar(p, it.id)
  }
  const final = new Map<string, Posicao>()
  for (const it of itens) {
    const p = pos.get(it.id)!
    final.set(it.id, { ...p, efetivo: tamanhoQueCabe(it.def, p.colunas, it.tamanho) })
  }
  return final
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

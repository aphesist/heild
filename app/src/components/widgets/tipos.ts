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
   * Área de trabalho (kanban, tabela grande, calendário): no tamanho XL, ocupa
   * a largura inteira da grade (PADRAO_DE_INTERFACE.md, 3).
   */
  larguraTotal?: boolean
  /** Altura mínima em células no tamanho XL, para quem precisa de mais altura (ex.: kanban com 3). */
  linhasMinimas?: number
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
 * Vão que o widget ocupa numa grade de `colunas`. Quando a grade é mais
 * estreita que o widget (L e XL no celular), ele ganha altura em vez de ficar
 * achatado: L vira 2×2, XL vira 2×4.
 */
export function vao(tamanho: TamanhoWidget, colunas: number, def?: Pick<DefWidget, 'larguraTotal' | 'linhasMinimas'>) {
  const d = dimensoes[tamanho]
  const v = d.colunas <= colunas ? { colunas: d.colunas, linhas: d.linhas } : { colunas, linhas: d.linhas * Math.ceil(d.colunas / colunas) }
  if (tamanho === 'XL' && def?.larguraTotal) v.colunas = colunas
  if (tamanho === 'XL' && def?.linhasMinimas) v.linhas = Math.max(v.linhas, def.linhasMinimas)
  return v
}

/** Posição de um widget na grade (base 0), com o tamanho que o conteúdo usa depois de preencher. */
export interface Posicao {
  coluna: number
  linha: number
  colunas: number
  linhas: number
  /** Tamanho que o conteúdo recebe: o maior que o widget aceita e que cabe no espaço final. */
  efetivo: TamanhoWidget
}

/**
 * Arranjo da grade (regra anti-buraco, PADRAO_DE_INTERFACE.md, 5):
 * 1. coloca cada widget no primeiro lugar livre, na ordem (o `dense` do CSS);
 * 2. se `preencher`, as faixas de linhas que só têm widgets da mesma altura
 *    repartem as colunas que sobram entre eles (a linha fecha sem vão);
 * 3. o vão que restar é coberto pelo vizinho: o da esquerda cresce para a
 *    direita, o da direita para a esquerda, e o de cima desce quando ganha um
 *    tamanho que o widget aceita (M vira G, L vira XL);
 * 4. se ainda sobrar vão embaixo de um widget, ele desce até a linha seguinte
 *    ocupada (o espaço fica dentro do card, não como buraco na grade).
 * O conteúdo recebe o maior tamanho aceito que cabe no espaço final, então um
 * M que cresceu para 4 colunas mostra o seu L.
 */
export function arranjar(itens: { id: string; tamanho: TamanhoWidget; def: DefWidget }[], colunas: number, preencher: boolean): Map<string, Posicao> {
  const grade: (string | null)[][] = []
  const linha = (r: number) => (grade[r] ??= Array<string | null>(colunas).fill(null))
  const livre = (r: number, c: number) => c >= 0 && c < colunas && linha(r)[c] === null
  const marcar = (p: Omit<Posicao, 'efetivo'>, id: string | null) => {
    for (let r = p.linha; r < p.linha + p.linhas; r++) for (let c = p.coluna; c < p.coluna + p.colunas; c++) linha(r)[c] = id
  }
  const pos = new Map<string, Omit<Posicao, 'efetivo'>>()
  for (const it of itens) {
    const v = vao(it.tamanho, colunas, it.def)
    const w = Math.min(v.colunas, colunas)
    for (let r = 0; !pos.has(it.id); r++) {
      for (let c = 0; c + w <= colunas; c++) {
        let cabe = true
        for (let rr = r; rr < r + v.linhas && cabe; rr++) for (let cc = c; cc < c + w && cabe; cc++) cabe = livre(rr, cc)
        if (cabe) {
          const p = { coluna: c, linha: r, colunas: w, linhas: v.linhas }
          pos.set(it.id, p)
          marcar(p, it.id)
          break
        }
      }
    }
  }
  const ultima = Math.max(0, ...[...pos.values()].map((p) => p.linha + p.linhas))
  if (preencher) {
    // 2. Faixas uniformes: todos os widgets que tocam as linhas [r, r+h) começam em r e têm altura h.
    for (let r = 0; r < ultima; ) {
      const naLinha = [...new Set(linha(r).filter((x): x is string => !!x))].map((id) => ({ id, p: pos.get(id)! }))
      const h = naLinha[0]?.p.linhas ?? 1
      const uniforme = naLinha.length > 0 && naLinha.every(({ p }) => p.linha === r && p.linhas === h)
      const tocam = new Set<string>()
      for (let rr = r; rr < r + h; rr++) linha(rr).forEach((x) => x && tocam.add(x))
      if (uniforme && tocam.size === naLinha.length) {
        const ordem = naLinha.sort((a, b) => a.p.coluna - b.p.coluna)
        let sobra = colunas - ordem.reduce((s, x) => s + x.p.colunas, 0)
        for (let i = 0; sobra > 0; i = (i + 1) % ordem.length, sobra--) ordem[i].p.colunas++
        let c = 0
        for (const { id, p } of ordem) {
          marcar(p, null)
          p.coluna = c
          c += p.colunas
          marcar(p, id)
        }
      }
      r += uniforme && tocam.size === naLinha.length ? h : 1
    }
    // 3. Vizinhos cobrem o que sobrou.
    const colunaLivre = (p: Omit<Posicao, 'efetivo'>, c: number) => {
      for (let r = p.linha; r < p.linha + p.linhas; r++) if (!livre(r, c)) return false
      return true
    }
    for (let mudou = true; mudou; ) {
      mudou = false
      for (const [id, p] of pos) {
        if (colunaLivre(p, p.coluna + p.colunas)) {
          p.colunas++
          marcar(p, id)
          mudou = true
        } else if (colunaLivre(p, p.coluna - 1)) {
          p.coluna--
          p.colunas++
          marcar(p, id)
          mudou = true
        }
      }
    }
    for (const it of itens) {
      const p = pos.get(it.id)!
      const embaixo = p.linha + p.linhas
      if (embaixo >= ultima) continue
      let tudoLivre = true
      for (let c = p.coluna; c < p.coluna + p.colunas; c++) tudoLivre &&= livre(embaixo, c)
      if (tudoLivre && tamanhoQueCabe(it.def, p.colunas, p.linhas + 1, it.tamanho) !== tamanhoQueCabe(it.def, p.colunas, p.linhas, it.tamanho)) {
        p.linhas++
        marcar(p, it.id)
      }
    }
    // 4. O vão que ainda sobrar embaixo de um widget (nenhum vizinho cobre) vira altura dele: o espaço fica dentro do card, não na grade.
    for (const it of itens) {
      const p = pos.get(it.id)!
      for (;;) {
        const embaixo = p.linha + p.linhas
        if (embaixo >= ultima) break
        let tudoLivre = true
        for (let c = p.coluna; c < p.coluna + p.colunas; c++) tudoLivre &&= livre(embaixo, c)
        if (!tudoLivre) break
        p.linhas++
        marcar(p, it.id)
      }
    }
  }
  const final = new Map<string, Posicao>()
  for (const it of itens) {
    const p = pos.get(it.id)!
    final.set(it.id, { ...p, efetivo: tamanhoQueCabe(it.def, p.colunas, p.linhas, it.tamanho) })
  }
  return final
}

/**
 * O maior tamanho aceito que cabe em colunas × linhas. Se só cabe um bem menor
 * que o espaço, fica o escolhido; mas se o escolhido nem cabe na largura (L no
 * celular), vale o que cabe: o conteúdo largo não vaza da grade estreita.
 */
function tamanhoQueCabe(def: Pick<DefWidget, 'tamanhos'>, colunas: number, linhas: number, escolhido: TamanhoWidget): TamanhoWidget {
  const area = (t: TamanhoWidget) => dimensoes[t].colunas * dimensoes[t].linhas
  const cabem = def.tamanhos.filter((t) => dimensoes[t].colunas <= colunas && dimensoes[t].linhas <= linhas)
  if (!cabem.length) return escolhido
  const melhor = cabem.reduce((a, b) => (area(b) > area(a) || (area(b) === area(a) && b === escolhido) ? b : a))
  if (area(melhor) < area(escolhido) && area(melhor) * 2 <= colunas * linhas && dimensoes[escolhido].colunas <= colunas) return escolhido
  return melhor
}

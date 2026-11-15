import type { CSSProperties, ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Lista em colunas (a lista que é tabela: tarefas, contratos, cobranças). O
 * cabeçalho e as linhas dividem a mesma grade, declarada uma vez, e nenhum
 * elemento invade o vizinho (INVENTARIO_UI.md, 9):
 *   - `fluida`: o texto ocupa o que sobra e trunca com reticências e `title`;
 *   - `conteudo`: a trilha tem o tamanho do conteúdo (selo, valor, ação), então
 *     um selo comprido alarga a coluna em vez de vazar sobre a vizinha;
 *   - `NNrem`: largura fixa só para texto, que trunca (nunca para selo).
 * Abaixo da quebra (largura do contêiner, não da tela), as colunas `largo`
 * somem e as `abaixo` descem para a linha de baixo, sob a coluna fluida.
 */
export type LarguraColuna = 'fluida' | 'conteudo' | `${number}rem`

export interface ColunaLista {
  /** Rótulo do cabeçalho. */
  rotulo?: ReactNode
  largura: LarguraColuna
  /** Peso da coluna fluida (padrão 1). */
  peso?: number
  /** Só aparece acima da quebra. */
  largo?: boolean
  /** Abaixo da quebra, desce para a linha de baixo (o selo de estado no celular). */
  abaixo?: boolean
  alinhar?: 'inicio' | 'fim' | 'centro'
}

const trilha = (c: ColunaLista) => (c.largura === 'fluida' ? `minmax(0,${c.peso ?? 1}fr)` : c.largura === 'conteudo' ? 'max-content' : `minmax(0,${c.largura})`)

/** Quebra em largura do contêiner: `media` 40rem, `larga` 56rem (padrão), `extra` 72rem. */
export type QuebraLista = 'media' | 'larga' | 'extra'

export function ListaColunas({ colunas, quebra = 'larga', cabecalho = true, classeCabecalho, rotulo, className, children, ...props }: { colunas: ColunaLista[]; quebra?: QuebraLista; cabecalho?: boolean; classeCabecalho?: string; rotulo: string; children: ReactNode } & Omit<ComponentProps<'div'>, 'children'>) {
  const estreitas = colunas.filter((c) => !c.largo && !c.abaixo)
  const estilo = {
    '--colunas-largo': colunas.map(trilha).join(' '),
    '--colunas-estreito': estreitas.map(trilha).join(' '),
    '--coluna-abaixo': Math.max(1, estreitas.findIndex((c) => c.largura === 'fluida') + 1),
  } as CSSProperties
  return (
    <div role="table" aria-label={rotulo} data-quebra={quebra} className={cn('lista-colunas flex min-w-0 flex-col', className)} style={estilo} {...props}>
      {cabecalho && (
        <div role="row" className={cn('linha-colunas text-muted-foreground border-b pb-1.5 text-xs', classeCabecalho)} data-cabecalho>
          {colunas.map((c, i) => (
            <span key={i} role="columnheader" className={cn('flex min-w-0', c.alinhar === 'fim' && 'justify-end', classeCelula(c))}>
              <span className="min-w-0 truncate">{c.rotulo}</span>
            </span>
          ))}
        </div>
      )}
      {children}
    </div>
  )
}

function classeCelula(c?: Pick<ColunaLista, 'largo' | 'abaixo' | 'alinhar'>) {
  return cn(c?.largo && 'celula-largo', c?.abaixo && 'celula-abaixo', c?.alinhar === 'fim' && 'justify-self-end text-right', c?.alinhar === 'centro' && 'justify-self-center text-center')
}

/** Uma linha da lista: a mesma grade do cabeçalho. */
export function LinhaColunas({ className, ...props }: ComponentProps<'div'>) {
  return <div role="row" className={cn('linha-colunas', className)} {...props} />
}

/**
 * Célula: nunca passa da coluna. Com `texto`, uma linha truncada com o texto
 * inteiro no `title`; com filhos, um flex que encolhe (`min-w-0`).
 */
export function Celula({ coluna, texto, title, className, children, ...props }: { coluna?: ColunaLista; texto?: string } & ComponentProps<'div'>) {
  return (
    <div role="cell" className={cn('flex min-w-0 items-center gap-1.5', coluna?.alinhar === 'fim' && 'justify-end', classeCelula(coluna), className)} {...props}>
      {texto !== undefined ? (
        <span className="min-w-0 truncate" title={title ?? texto}>
          {texto}
        </span>
      ) : (
        children
      )}
    </div>
  )
}

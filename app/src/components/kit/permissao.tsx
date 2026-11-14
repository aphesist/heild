import { LockSimpleIcon } from '@phosphor-icons/react'
import type { ReactElement, ReactNode } from 'react'
import { useLoja } from '@/ambiente/loja'
import { useSessaoBruta } from '@/ambiente/sessao'
import { Tooltip } from '@/components/ui/tooltip'
import { autorizar, type Alvo, type Decisao } from '@/nucleo/permissoes'
import { contextoAtual } from '@/nucleo/repositorios'

/**
 * Permissão na tela (subplano 03, 9.1): a tela pergunta à função única e
 * esconde o que a pessoa não pode. Use `usePode` para decidir, `SePode` para
 * esconder e `SePode` com `mostrarMotivo` para o botão cinza que explica
 * "por que não posso?".
 *
 *   const pode = usePode('tarefa.cancelar', { setor_id: t.setor_id })
 *   <SePode ferramenta="obrigacao.cancelar" alvo={{ setor_id: 'fiscal' }} mostrarMotivo>
 *     <Button>Cancelar obrigação</Button>
 *   </SePode>
 */

/** Decide com o perfil da sessão (muda junto com o "ver como"). */
export function usePermissao(ferramenta: string, alvo: Alvo = {}): Decisao {
  const sessao = useSessaoBruta()
  const ctx = sessao?.perfil ? { ator: { tipo: 'pessoa' as const, perfil: sessao.perfil }, origem: 'tela' as const } : contextoAtual()
  return autorizar(ctx, ferramenta, alvo)
}

export const usePode = (ferramenta: string, alvo: Alvo = {}) => usePermissao(ferramenta, alvo).permitido

export function SePode({ ferramenta, alvo, mostrarMotivo, children, senao = null }: { ferramenta: string; alvo?: Alvo; mostrarMotivo?: boolean; children: ReactElement; senao?: ReactNode }) {
  const d = usePermissao(ferramenta, alvo)
  if (d.permitido) return children
  if (!mostrarMotivo) return <>{senao}</>
  return (
    <Tooltip conteudo={d.motivo}>
      <span tabIndex={0} aria-label={`Indisponível: ${d.motivo}`} className="inline-flex cursor-not-allowed items-center gap-1 opacity-50">
        <span className="pointer-events-none">{children}</span>
        <LockSimpleIcon aria-hidden className="text-muted-foreground size-3.5" />
      </span>
    </Tooltip>
  )
}

/**
 * Executa uma escrita com o retorno de sempre: erro de permissão ou de regra
 * vira toast vermelho; sucesso pode mostrar toast com Desfazer.
 *
 *   const executar = useAcao()
 *   executar(() => repos.tarefas.mudarStatus(id, 'concluida'), { sucesso: 'Tarefa concluída', desfazer: () => repos.tarefas.reverter(antes) })
 */
export function useAcao() {
  const loja = useLoja()
  return <R,>(fazer: () => R, opcoes: { sucesso?: string; desfazer?: (resultado: R) => void } = {}): R | undefined => {
    try {
      const r = fazer()
      if (opcoes.sucesso && opcoes.desfazer) loja.toastDesfazer(opcoes.sucesso, () => opcoes.desfazer!(r))
      else if (opcoes.sucesso) loja.toast(opcoes.sucesso)
      return r
    } catch (e) {
      loja.toastErro(e instanceof Error ? e.message : String(e))
      return undefined
    }
  }
}

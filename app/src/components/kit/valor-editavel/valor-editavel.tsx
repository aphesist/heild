import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useLoja } from '@/ambiente/loja'
import { AreaRolagem } from '@/components/ui/area-rolagem'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useMedia } from '@/hooks/useMedia'
import { cn } from '@/lib/utils'
import { Seletor } from './seletores'
import { textoDoValor, type ConfigValor, type QualquerValor } from './tipos'

/**
 * ValorEditavel (fase 6): o valor fica no lugar, com sublinhado pontilhado, e é
 * um botão ("Cliente: Padaria, alterar"). Clicar (ou Enter/Espaço) abre o
 * seletor certo para o tipo de dado: num Popover no computador e numa folha
 * inferior no celular. A gravação é otimista: o novo valor aparece na hora, o
 * aviso traz "Desfazer", e se `onMudar` falhar o valor volta e o erro aparece
 * ao lado. Quem chama grava pelo repositório (o histórico fica no evento:
 * nada se apaga).
 *
 *   <ValorEditavel rotulo="Responsável" valor={t.responsavel_id}
 *     config={{ tipo: 'entidade', opcoes: pessoas }}
 *     onMudar={(v) => repos.tarefas.atualizar(t.id, { responsavel_id: v })} />
 */
export function ValorEditavel<V extends QualquerValor>({
  rotulo,
  valor,
  config,
  onMudar,
  formatar,
  vazio = 'definir',
  desabilitado,
  desfazer = true,
  className,
  children,
  abertoInicial,
}: {
  /** Nome do campo ("Cliente", "Prazo interno"): rótulo do botão e título do seletor. */
  rotulo: string
  valor: V | null | undefined
  config: ConfigValor
  onMudar: (novo: V) => unknown
  /** Texto próprio para o valor (senão, o do tipo). */
  formatar?: (v: V) => string
  /** O que aparece quando não há valor (sublinhado do mesmo jeito). */
  vazio?: string
  /** Sem permissão: só o texto, sem sublinhado nem botão. */
  desabilitado?: boolean
  /** Aviso com "Desfazer" depois de mudar (padrão: sim). */
  desfazer?: boolean
  className?: string
  /** Conteúdo próprio no lugar do texto (ex.: avatar e nome). */
  children?: ReactNode
  /** Abre já com o seletor (Lab e QA). */
  abertoInicial?: boolean
}) {
  const loja = useLoja()
  const celular = useMedia('(max-width: 639px)')
  const [aberto, setAberto] = useState(!!abertoInicial)
  const [mostrado, setMostrado] = useState<V | null | undefined>(valor)
  const [erro, setErro] = useState<string | null>(null)
  const pendente = useRef(false)
  const botao = useRef<HTMLButtonElement>(null)
  // O Desfazer chega depois de outras mudanças: usa sempre o onMudar mais recente (quem fecha sobre o estado não desfaz os outros campos).
  const ultimoOnMudar = useRef(onMudar)
  ultimoOnMudar.current = onMudar
  useEffect(() => {
    if (!pendente.current) setMostrado(valor)
  }, [valor])

  const texto = mostrado === null || mostrado === undefined ? '' : formatar ? formatar(mostrado) : textoDoValor(config, mostrado)
  const visivel = texto || vazio

  const mudar = async (novo: QualquerValor, fechar?: boolean) => {
    if (fechar) setAberto(false)
    const antes = mostrado
    if (JSON.stringify(novo) === JSON.stringify(antes)) return
    setMostrado(novo as V)
    setErro(null)
    pendente.current = true
    try {
      await onMudar(novo as V)
      if (desfazer && antes !== null && antes !== undefined) {
        const textoNovo = formatar ? formatar(novo as V) : textoDoValor(config, novo)
        loja.toastDesfazer(`${rotulo}: ${textoNovo}`, () => {
          setMostrado(antes)
          void ultimoOnMudar.current(antes as V)
        })
      }
    } catch (e) {
      setMostrado(antes)
      setErro(e instanceof Error ? e.message : String(e))
    } finally {
      pendente.current = false
    }
  }

  if (desabilitado) return <span className={cn('min-w-0', className)}>{children ?? (texto || '—')}</span>

  const gatilho = (
    <button
      ref={botao}
      type="button"
      aria-label={`${rotulo}: ${texto || 'sem valor'}, alterar`}
      aria-haspopup="dialog"
      aria-expanded={aberto}
      data-valor-editavel={config.tipo}
      className={cn('valor-editavel', !texto && 'valor-editavel-vazio', className)}
      onClick={celular ? () => setAberto(true) : undefined}
    >
      {children ?? <span className="valor-editavel-texto">{visivel}</span>}
    </button>
  )

  const seletor = <Seletor config={config} valor={mostrado} rotulo={rotulo} aplicar={(v, f) => void mudar(v, f)} />

  return (
    <>
      {celular ? (
        <>
          {gatilho}
          <Sheet open={aberto} onOpenChange={setAberto}>
            {/* Aberta por estado (não por Trigger), a folha não sabe para onde devolver o foco: devolve ao valor. */}
            <SheetContent lado="baixo" className="gap-0" onCloseAutoFocus={(e) => (e.preventDefault(), botao.current?.focus())}>
              <SheetHeader className="pb-1">
                <SheetTitle>{rotulo}</SheetTitle>
                <SheetDescription className="sr-only">Escolha o novo valor de {rotulo.toLowerCase()}</SheetDescription>
              </SheetHeader>
              <AreaRolagem className="px-3 pb-4">{seletor}</AreaRolagem>
            </SheetContent>
          </Sheet>
        </>
      ) : (
        <Popover open={aberto} onOpenChange={setAberto}>
          <PopoverTrigger asChild>{gatilho}</PopoverTrigger>
          {/* Nunca sai da tela: o Radix vira o lado e a altura respeita o espaço que sobra; a lista rola por dentro com esmaecido. */}
          <PopoverContent aria-label={rotulo} collisionPadding={16} className="flex max-h-[min(26rem,var(--radix-popover-content-available-height))] w-[min(20rem,calc(100vw-2rem))] flex-col p-1.5">
            <p className="text-muted-foreground px-1.5 pt-1 pb-1.5 text-xs">{rotulo}</p>
            <AreaRolagem className="min-h-0 flex-1">{seletor}</AreaRolagem>
          </PopoverContent>
        </Popover>
      )}
      {erro && (
        <span role="alert" className="text-destructive-text ml-1.5 text-xs">
          {erro}
        </span>
      )}
    </>
  )
}

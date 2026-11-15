import { useState, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

/**
 * Formulário em modal com validação. O estado e as regras ficam no
 * `useFormulario`; os campos são os do kit de formulário
 * (`@/components/ui/formulario`: Campo, CampoTexto, CampoEscolha...), com o
 * erro de cada campo vindo de `f.erro('nome')`. Para cadastros longos, use a
 * `GavetaFormulario` (gaveta à direita) com o mesmo `useFormulario`.
 *
 *   const f = useFormulario({ titulo: '', setor: 'fiscal' }, (v) => ({ titulo: v.titulo.trim() ? null : 'Obrigatório' }))
 *   <FormularioModal aberto={...} titulo="Nova tarefa" formulario={f} onSalvar={(v) => repos.tarefas.criar(...)}>
 *     <Campo rotulo="Título" erro={f.erro('titulo')}>{(id) => <CampoTexto id={id} valor={f.valores.titulo} onMudar={(x) => f.definir('titulo', x)} />}</Campo>
 *   </FormularioModal>
 */

export type Validador<T> = (v: T) => Partial<Record<keyof T, string | null>>

export function useFormulario<T extends Record<string, unknown>>(inicial: T, validar?: Validador<T>) {
  const [valores, setValores] = useState<T>(inicial)
  const [tocados, setTocados] = useState<Partial<Record<keyof T, boolean>>>({})
  const [tentou, setTentou] = useState(false)
  const erros: Partial<Record<keyof T, string | null>> = validar?.(valores) ?? {}
  const valido = Object.values(erros).every((e) => !e)
  return {
    valores,
    definir: <K extends keyof T>(campo: K, valor: T[K]) => {
      setValores((v) => ({ ...v, [campo]: valor }))
      setTocados((t) => ({ ...t, [campo]: true }))
    },
    /** Erro do campo: só aparece depois que a pessoa mexeu nele ou tentou salvar. */
    erro: (campo: keyof T) => ((tentou || tocados[campo]) && erros[campo]) || undefined,
    valido,
    /** Marca a tentativa (mostra todos os erros) e diz se pode salvar. */
    tentar: () => {
      setTentou(true)
      return valido
    },
    reiniciar: (v: T = inicial) => {
      setValores(v)
      setTocados({})
      setTentou(false)
    },
  }
}

export type Formulario<T extends Record<string, unknown>> = ReturnType<typeof useFormulario<T>>

export function FormularioModal<T extends Record<string, unknown>>({
  aberto,
  onFechar,
  titulo,
  descricao,
  formulario,
  onSalvar,
  acao = 'Salvar',
  children,
  className,
}: {
  aberto: boolean
  onFechar: () => void
  titulo: string
  descricao?: string
  formulario: Formulario<T>
  /** Pode lançar erro (permissão, regra): a mensagem aparece no rodapé e o modal fica aberto. */
  onSalvar: (valores: T) => void | Promise<void>
  acao?: string
  children: ReactNode
  className?: string
}) {
  const [erro, setErro] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)
  const enviar = async () => {
    if (!formulario.tentar()) return
    setSalvando(true)
    try {
      await onSalvar(formulario.valores)
      setErro(null)
      onFechar()
    } catch (e) {
      setErro(e instanceof Error ? e.message : String(e))
    } finally {
      setSalvando(false)
    }
  }
  return (
    <Dialog open={aberto} onOpenChange={(v) => !v && onFechar()}>
      <DialogContent className={cn('bg-surface rounded-xl border-0 p-5 sm:max-w-md', className)}>
        <DialogHeader>
          <DialogTitle className="font-medium">{titulo}</DialogTitle>
          {descricao && <DialogDescription>{descricao}</DialogDescription>}
        </DialogHeader>
        <form
          noValidate
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            void enviar()
          }}
        >
          {children}
          {erro && (
            <p role="alert" className="bg-destructive/10 text-foreground rounded-md px-3 py-2 text-sm">
              {erro}
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="ghost" className="rounded-full" onClick={onFechar}>
              Cancelar
            </Button>
            <Button type="submit" className="rounded-full" disabled={salvando}>
              {acao}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

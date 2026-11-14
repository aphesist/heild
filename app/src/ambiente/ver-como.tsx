import { EyeIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Fichas, Segmentado } from '@/components/ui/formulario'
import type { Papel } from '@/nucleo/modelo/entidades'
import { rotuloPapel, rotuloSetorCurto, todosSetores } from '@/nucleo/permissoes'
import type { SetorIntegrante } from '@/theme/tipos'
import { useSessaoBruta } from './sessao'

/**
 * Seletor "ver como" do painel da demonstração: escolhe um papel e os setores
 * e o sistema passa a mostrar o que essa conta veria (barra lateral, abas,
 * botões e o que o repositório aceita gravar). Gestor gere os setores
 * escolhidos; Membro executa neles. Não muda a conta guardada.
 */
export function VerComoSeletor() {
  const sessao = useSessaoBruta()
  const atual = sessao?.verComo
  const [papel, setPapel] = useState<Papel>(atual?.papel ?? 'colaborador')
  const [setores, setSetores] = useState<SetorIntegrante[]>(atual?.vinculos.map((v) => v.setor) ?? ['fiscal'])
  if (!sessao?.usuario) return null
  const aplicar = () => sessao.definirVerComo({ papel, vinculos: papel === 'administrador' ? [] : setores.map((setor) => ({ setor, modo: papel === 'gestor' ? 'gestao' : 'execucao' })) })
  return (
    <div className="flex flex-col gap-2">
      <Segmentado rotulo="Papel" valor={papel} onMudar={setPapel} opcoes={(['administrador', 'gestor', 'colaborador'] as Papel[]).map((p) => ({ valor: p, rotulo: rotuloPapel[p] }))} />
      {papel !== 'administrador' && <Fichas rotulo="Setores" valores={setores} onMudar={setSetores} opcoes={todosSetores.map((s) => ({ valor: s, rotulo: rotuloSetorCurto[s] }))} />}
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" className="rounded-full" onClick={aplicar} disabled={papel !== 'administrador' && !setores.length}>
          Ver como {rotuloPapel[papel]}
        </Button>
        {atual && (
          <Button size="sm" variant="ghost" className="rounded-full" onClick={() => sessao.definirVerComo(null)}>
            Voltar à conta real
          </Button>
        )}
      </div>
    </div>
  )
}

/** Faixa no topo enquanto o "ver como" está ligado: ninguém esquece que está vendo outro papel. */
export function FaixaVerComo() {
  const sessao = useSessaoBruta()
  const v = sessao?.verComo
  if (!v || !sessao.usuario) return null
  return (
    <div role="status" className="bg-foreground text-background shadow-lg fixed top-2 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-2 rounded-full py-1 pr-1 pl-3 text-xs">
      <EyeIcon className="size-3.5" />
      <span>
        Vendo como {rotuloPapel[v.papel]}
        {v.vinculos.length ? ` · ${v.vinculos.map((x) => rotuloSetorCurto[x.setor]).join(', ')}` : ''} (demonstração)
      </span>
      <button type="button" onClick={() => sessao.definirVerComo(null)} className="bg-background/15 hover:bg-background/25 cursor-pointer rounded-full px-2.5 py-1 font-medium">
        Voltar
      </button>
    </div>
  )
}

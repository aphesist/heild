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

import { AreaRolagem } from '@/components/ui/area-rolagem'
import { Badge } from '@/components/ui/badge'
import { Caixa, TituloBloco } from '@/components/compostos/blocos'
import { catalogoConectores, rotuloFamilia, useConectores, type FamiliaConector, type TomEstado } from '@/dados/conectores'
import { CabecalhoConfig } from './EscritorioTela'

const varianteTom: Record<TomEstado, 'sucesso' | 'destaque' | 'erro' | 'outline'> = { ok: 'sucesso', atencao: 'destaque', erro: 'erro', neutro: 'outline' }

/**
 * Configurações › Conectores e cofre (S09-T09). Esqueleto do contrato C9:
 * lista os conectores por família com o estado de cada um.
 */
export function ConectoresTela() {
  const conectores = useConectores()
  const familias = [...new Set(catalogoConectores.map((c) => c.familia))] as FamiliaConector[]
  return (
    <AreaRolagem className="h-full px-3 pb-10 sm:px-5">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 pt-1 ultra:max-w-[1600px]">
        <CabecalhoConfig titulo="Conectores e cofre" sub="Conexões, credenciais, saúde e custo. Tudo simulado nesta demonstração." />
        {familias.map((f) => (
          <Caixa key={f}>
            <TituloBloco>{rotuloFamilia[f]}</TituloBloco>
            <ul className="divide-border/70 flex flex-col divide-y">
              {conectores
                .filter((c) => c.familia === f)
                .map((c) => (
                  <li key={c.id} className="flex flex-wrap items-center gap-2 py-2 text-sm">
                    <span className="min-w-0 flex-1">
                      {c.nome}
                      <span className="text-muted-foreground block text-xs">{c.para}</span>
                    </span>
                    <Badge variant={varianteTom[c.tom]}>{c.rotulo}</Badge>
                  </li>
                ))}
            </ul>
          </Caixa>
        ))}
      </div>
    </AreaRolagem>
  )
}

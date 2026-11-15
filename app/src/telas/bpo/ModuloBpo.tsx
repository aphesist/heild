import { BuildingsIcon, EyeIcon } from '@phosphor-icons/react'
import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { useLoja, usePersistente } from '@/ambiente/loja'
import { Button } from '@/components/ui/button'
import { CampoEscolha, Segmentado } from '@/components/ui/formulario'
import { banco } from '@/nucleo/banco'
import { temBanco, useBanco, useVersaoBanco } from '@/nucleo/react'
import { eventoBpo } from '@/nucleo/repositorios'
import { garantirSementeBpo } from '@/nucleo/semente/s08'
import { useTema } from '@/theme/ThemeProvider'
import { temas } from '@/theme/temas'
import { variaveisCss } from '@/theme/variaveis'
import { AprovacoesBpoTela } from './AprovacoesBpo'
import { ConfigBpoTela } from './ConfigBpo'
import { ContratantesTela } from './Contratantes'
import { useContratantes, useEmpresaBpo } from './dados'
import { EntregasBpoTela, RentabilidadeBpoTela, VolumeBpoTela } from './GestaoBpo'
import { useEfeitosBpo } from './integrantes'
import { useEfeitosS08a } from './integrantes-s08a' // S08a
import { FilaBpoTela, RotinasBpoTela } from './OperacaoBpo'
import { PortalConvidado } from './PortalConvidado'
import { CarteiraBpoTela, VisaoBpoTela } from './VisaoBpo'

export type Frente = 'empresas' | 'contratantes'

/** Tema do contratante aplicado só à área do BPO (contexto contratante, 10, 4.1; 01, ad. 23). */
export function useVariaveisContratante(temaId?: string): CSSProperties | undefined {
  const { modo } = useTema()
  return useMemo(() => {
    const t = temaId ? temas.find((x) => x.id === temaId) : undefined
    return t ? (variaveisCss(t, modo) as CSSProperties) : undefined
  }, [temaId, modo])
}

/**
 * S08 · O item BPO: as nove abas nas duas frentes. "Empresas" é o BPO
 * financeiro das empresas clientes; "Contratantes" é o BPO entre escritórios
 * (contratantes são subinquilinos), com o contexto mãe (listas, SLA e
 * capacidade de todos, sem abrir conteúdo e sem IA) ou o de um contratante
 * (só ele, com o tema dele), trocado sem novo login (S08-A12, A43).
 */
export function ModuloBpo({ aba, clienteId, onEscolher }: { aba: string; clienteId: string | null; onEscolher: (id: string | null, aba?: string) => void }) {
  const { escritorio } = useBanco()
  const versao = useVersaoBanco()
  // Banco guardado antes das tabelas do BPO existirem recebe a semente do BPO uma vez.
  useEffect(() => {
    if (temBanco()) garantirSementeBpo()
  }, [escritorio.id, versao])
  useEfeitosBpo()
  useEfeitosS08a() // S08a: trabalhos da Visão geral, da Carteira e da implantação
  const loja = useLoja()
  const contratantes = useContratantes()
  const empresa = useEmpresaBpo(clienteId)
  const [frenteGuardada, setFrente] = usePersistente<Frente>('s08:frente', 'empresas')
  const [contexto, setContexto] = usePersistente<string | null>('s08:contexto', null)
  const [portal, setPortal] = useState<string | null>(null)
  const temC2 = contratantes.length > 0
  const frente: Frente = temC2 ? frenteGuardada : 'empresas'
  const contratante = frente === 'contratantes' && contexto ? contratantes.find((c) => c.id === contexto) : undefined
  const estilo = useVariaveisContratante(contratante?.tema_id)

  const trocarContexto = (id: string | null) => {
    setContexto(id)
    const nome = id ? contratantes.find((c) => c.id === id)?.nome : 'mãe (todos os contratantes)'
    eventoBpo(banco, `Trocou para o contexto ${nome} (sem novo login)`, null)
    loja.toast(id ? `Contexto ${nome}: você vê só os dados dele, com o tema dele` : 'Contexto mãe: listas, SLA e capacidade de todos, sem abrir conteúdo e sem IA')
  }

  return (
    <div className="flex h-full flex-col">
      {temC2 && (
        <div className="flex flex-wrap items-center gap-2 px-3 pb-2 sm:px-5">
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-2 ultra:max-w-[1600px]">
            <Segmentado
              rotulo="Frente do BPO"
              valor={frente}
              onMudar={(v) => setFrente(v)}
              opcoes={[
                { valor: 'empresas', rotulo: 'Empresas' },
                { valor: 'contratantes', rotulo: 'Contratantes' },
              ]}
            />
            {frente === 'contratantes' && (
              <>
                <span className="text-muted-foreground ml-1 flex items-center gap-1.5 text-xs">
                  <BuildingsIcon className="size-4" /> Contexto
                </span>
                <span className="w-56">
                  <CampoEscolha rotulo="Contexto do BPO entre escritórios" valor={contexto ?? ''} onMudar={(v) => trocarContexto(v || null)} opcoes={[{ valor: '', rotulo: 'Mãe (todos os contratantes)' }, ...contratantes.map((c) => ({ valor: c.id, rotulo: c.nome }))]} />
                </span>
                {contratante && (
                  <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setPortal(contratante.id)}>
                    <EyeIcon /> Portal do convidado
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      )}
      <div className="min-h-0 flex-1" style={estilo} data-contexto-bpo={contratante?.id ?? (frente === 'contratantes' ? 'mae' : 'empresas')}>
        {frente === 'contratantes' ? (
          <ContratantesTela aba={aba} contratante={contratante} contratantes={contratantes} onContexto={trocarContexto} onPortal={setPortal} />
        ) : (
          <>
            {aba === 'visao' && <VisaoBpoTela empresa={empresa} onEscolher={onEscolher} />}
            {aba === 'carteira' && <CarteiraBpoTela empresa={empresa} onEscolher={onEscolher} />}
            {aba === 'fila' && <FilaBpoTela empresa={empresa} onEscolher={onEscolher} />}
            {aba === 'rotinas' && <RotinasBpoTela empresa={empresa} onEscolher={onEscolher} />}
            {aba === 'aprovacoes' && <AprovacoesBpoTela empresa={empresa} onEscolher={onEscolher} />}
            {aba === 'entregas' && <EntregasBpoTela empresa={empresa} onEscolher={onEscolher} />}
            {aba === 'volume' && <VolumeBpoTela empresa={empresa} onEscolher={onEscolher} />}
            {aba === 'rentabilidade' && <RentabilidadeBpoTela empresa={empresa} onEscolher={onEscolher} />}
            {aba === 'configuracao' && <ConfigBpoTela empresa={empresa} onEscolher={onEscolher} />}
          </>
        )}
      </div>
      {portal && <PortalConvidado contratanteId={portal} onFechar={() => setPortal(null)} />}
    </div>
  )
}

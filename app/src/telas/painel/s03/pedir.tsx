// S03: "Pedir ao integrante" de dentro da aba (S03-A18): o integrante do setor faz, com etapas, e avisa.
import { ChatCircleTextIcon, SparkleIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { integranteDoSetor } from '@/ambiente/fluxos'
import { useLoja } from '@/ambiente/loja'
import { Button } from '@/components/ui/button'
import { Campo, CampoArea, GavetaFormulario } from '@/components/ui/formulario'
import { useAparencia } from '@/hooks/useAparencia'
import * as exemplo from '@/dados/exemplo'
import type { SetorIntegrante } from '@/theme/tipos'

export interface SugestaoPedido {
  rotulo: string
  etapas: string[]
  fim: string
  aviso?: string
}

/** Botão e gaveta "Pedir ao <integrante>" com sugestões do setor. */
export function PedirAoIntegrante({ setor, cliente, sugestoes, compacto }: { setor: SetorIntegrante; cliente?: string; sugestoes: SugestaoPedido[]; compacto?: boolean }) {
  const loja = useLoja()
  const aparencia = useAparencia()
  const [aberto, setAberto] = useState(false)
  const [texto, setTexto] = useState('')
  const integrante = exemplo.integrantes.find((i) => i.id === integranteDoSetor(setor))
  const nome = integrante ? aparencia(integrante).nome : 'integrante'
  const trabalhando = loja.trabalhoDe({ integrante: integrante?.id })
  const pedir = (s: SugestaoPedido | string) => {
    const sug: SugestaoPedido = typeof s === 'string' ? { rotulo: s, etapas: ['Entendendo o pedido', `Juntando o que há de ${cliente ?? 'carteira'}`, 'Conferindo com as regras do setor', 'Preparando o resultado'], fim: `Pronto: “${s}”. Deixei o resultado aqui no chat para você conferir; nada saiu para o cliente.` } : s
    loja.iniciarTrabalho({
      id: `s03-pedido-${Date.now()}`,
      integrante: integrante?.id ?? 'i-geral',
      setor,
      titulo: sug.rotulo,
      cliente,
      inicio: `Combinado. Vou ${sug.rotulo.charAt(0).toLowerCase()}${sug.rotulo.slice(1)}${cliente ? ` de ${cliente}` : ' da carteira'}.`,
      etapas: sug.etapas,
      seg: 1.4,
      fim: { texto: sug.fim, aviso: sug.aviso ?? `${nome} terminou: ${sug.rotulo.toLowerCase()}` },
    })
    loja.toast(`${nome} começou: ${sug.rotulo}.`, { modulo: 'inicio', aba: 'time', integrante: integrante?.id }, 'Acompanhar', { tipo: 'integrante', setor, estado: 'trabalhando' })
    setAberto(false)
    setTexto('')
  }
  return (
    <>
      {compacto ? (
        <Button size="sm" variant="ghost" className="h-6 rounded-full px-2 text-xs" onClick={() => setAberto(true)}>
          <SparkleIcon /> Pedir ao {nome}
        </Button>
      ) : (
        <div className="flex h-full flex-col gap-2">
          <p className="text-muted-foreground text-xs">{trabalhando ? `${nome} está fazendo: ${trabalhando.titulo}.` : `${nome} está livre. Peça o que precisa; ele faz e devolve no chat.`}</p>
          <div className="flex flex-wrap gap-1.5">
            {sugestoes.slice(0, 4).map((s) => (
              <Button key={s.rotulo} size="sm" variant="outline" className="h-auto rounded-full py-1 text-left text-xs whitespace-normal" onClick={() => pedir(s)}>
                {s.rotulo}
              </Button>
            ))}
          </div>
          <Button size="sm" variant="secondary" className="mt-auto w-fit rounded-full" onClick={() => setAberto(true)}>
            <ChatCircleTextIcon /> Pedir outra coisa
          </Button>
        </div>
      )}
      {aberto && (
        <GavetaFormulario aberta onFechar={() => setAberto(false)} titulo={`Pedir ao ${nome}`} descricao={`${cliente ?? 'Carteira'}. Ele faz com as permissões de quem pediu; o que transmite, paga ou sai ao cliente volta como cartão.`} acao="Pedir" acaoDesabilitada={texto.trim().length < 4} onAcao={() => pedir(texto.trim())}>
          <Campo rotulo="O que fazer">{(id) => <CampoArea id={id} valor={texto} onMudar={setTexto} placeholder="Ex.: confere as retenções de outubro" />}</Campo>
          <div className="flex flex-col gap-1.5">
            <span className="text-muted-foreground text-xs">Sugestões</span>
            {sugestoes.map((s) => (
              <button key={s.rotulo} type="button" onClick={() => pedir(s)} className="hover:bg-sunken cursor-pointer rounded-[10px] px-2 py-1.5 text-left text-sm">
                {s.rotulo}
              </button>
            ))}
          </div>
        </GavetaFormulario>
      )}
    </>
  )
}

import { CheckIcon, CloudSlashIcon, CopyIcon, FilesIcon, QuestionIcon, ScalesIcon, XIcon } from '@phosphor-icons/react'
import { useMemo, useState } from 'react'
import { useDocumentos } from '@/ambiente/documentos'
import { useLoja } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import { Caixa, TituloBloco } from '@/components/compostos/blocos'
import { usePode } from '@/components/kit'
import { Button } from '@/components/ui/button'
import { pastaDoCliente, type Documento } from '@/dados/arquivos'
import { registrar } from '@/nucleo/repositorios'
import { Ficha } from '../config/comum-s09'

/**
 * O que precisa de atenção no índice (S09-T01; 01, 7.4; D-05): arquivos sem
 * origem, conflitos, arquivos sem bytes, repetidos (mesma impressão digital
 * em dois lugares) e mudanças de cliente esperando a conferência.
 */

type Fila = 'origem' | 'conflito' | 'sem_bytes' | 'repetidos' | 'conferencia'

export function FilaAtencao({ onIrPasta }: { onIrPasta: (d: Documento) => void }) {
  const loja = useLoja()
  const docs = useDocumentos()
  const { usuario } = useSessao()
  const podeConferir = usePode('documento.mover')
  const podeConflito = usePode('documento.resolver_conflito')
  const listas = useMemo(() => {
    const d = loja.documentos
    const porHash = new Map<string, Documento[]>()
    for (const x of d) porHash.set(x.hash, [...(porHash.get(x.hash) ?? []), x])
    return {
      origem: d.filter((x) => x.s09?.semOrigem),
      conflito: d.filter((x) => x.s09?.conflito && !x.s09.conflito.resolvido),
      sem_bytes: d.filter((x) => x.s09?.indisponivelDesde),
      repetidos: [...porHash.values()].filter((g) => g.length > 1).map((g) => g[g.length - 1]),
      conferencia: d.filter((x) => x.s09?.conferencia),
    }
  }, [loja.documentos])
  const filas: { id: Fila; rotulo: string; Icone: typeof FilesIcon }[] = [
    { id: 'origem', rotulo: 'Confirmar origem', Icone: QuestionIcon },
    { id: 'conflito', rotulo: 'Conflitos', Icone: CopyIcon },
    { id: 'conferencia', rotulo: 'Em conferência', Icone: ScalesIcon },
    { id: 'sem_bytes', rotulo: 'Sem bytes', Icone: CloudSlashIcon },
    { id: 'repetidos', rotulo: 'Repetidos', Icone: FilesIcon },
  ]
  const comItens = filas.filter((f) => listas[f.id].length > 0)
  const [fila, setFila] = useState<Fila>(comItens[0]?.id ?? 'origem')
  if (!comItens.length) return null
  const atual = comItens.some((f) => f.id === fila) ? fila : comItens[0].id

  const conferir = (d: Documento, aceitar: boolean) => {
    const c = d.s09!.conferencia!
    const destino = c.clienteDestino === '_escritorio' ? undefined : c.clienteDestino
    if (aceitar) {
      loja.ajustarDocumento(d.id, { clienteId: destino, pasta: c.pastaDestino, s09: { ...d.s09, conferencia: undefined } })
      registrar(`${usuario.nome} conferiu e confirmou a mudança de ${d.nome} para ${pastaDoCliente(destino)}`, 'documento.mover')
      loja.toast(`${d.nome} agora é de ${pastaDoCliente(destino)}. O registro de entrega seguiu pela impressão digital.`)
    } else {
      loja.ajustarDocumento(d.id, { s09: { ...d.s09, conferencia: undefined } })
      registrar(`${usuario.nome} recusou a mudança de cliente de ${d.nome}`, 'documento.mover')
      loja.toast(`Mudança recusada: ${d.nome} continua em ${pastaDoCliente(d.clienteId)}.`)
    }
  }

  return (
    <Caixa className="ring-warning/30 ring-1">
      <TituloBloco descricao="O integrante de cada setor vigia o índice e separa o que precisa de uma pessoa.">Precisa de atenção</TituloBloco>
      <div className="flex flex-wrap gap-1.5">
        {comItens.map((f) => (
          <Ficha key={f.id} ativo={atual === f.id} onClick={() => setFila(f.id)}>
            {f.rotulo} · {listas[f.id].length}
          </Ficha>
        ))}
      </div>
      <ul className="divide-border/70 flex flex-col divide-y">
        {listas[atual].map((d) => {
          const grupo = atual === 'repetidos' ? loja.documentos.filter((x) => x.hash === d.hash) : []
          return (
            <li key={d.id} data-fila={atual} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 py-2.5 text-sm">
              <span className="min-w-0 flex-1 basis-60">
                <button type="button" className="block cursor-pointer truncate text-left hover:underline" onClick={() => docs.abrirDoc(d)}>
                  {d.nome}
                </button>
                <span className="text-muted-foreground block truncate text-xs">
                  {atual === 'origem' && `${pastaDoCliente(d.clienteId).split(' - ').pop()} · ${d.pasta.join('/')} · posto direto na nuvem em ${d.quando}`}
                  {atual === 'conflito' && `cópia de “${d.s09?.conflito?.original}” · ${d.s09?.conflito?.quando}`}
                  {atual === 'sem_bytes' && `indisponível desde ${d.s09?.indisponivelDesde} · ${pastaDoCliente(d.clienteId).split(' - ').pop()}`}
                  {atual === 'repetidos' && `mesma impressão digital em ${grupo.length} lugares: ${grupo.map((g) => g.pasta.join('/')).join(' · ')}`}
                  {atual === 'conferencia' && `${d.s09?.conferencia?.por} pediu para levar a ${pastaDoCliente(d.s09?.conferencia?.clienteDestino === '_escritorio' ? undefined : d.s09?.conferencia?.clienteDestino).split(' - ').pop()} · ${d.s09?.conferencia?.quando}`}
                </span>
              </span>
              <span className="flex flex-wrap gap-1">
                {atual === 'origem' && (
                  <Button size="sm" variant="outline" className="rounded-full" onClick={() => docs.acao('origem', d)}>
                    Confirmar origem
                  </Button>
                )}
                {atual === 'conflito' && podeConflito && (
                  <Button size="sm" variant="outline" className="rounded-full" onClick={() => docs.acao('conflito', d)}>
                    Resolver
                  </Button>
                )}
                {atual === 'conferencia' && podeConferir && (
                  <>
                    <Button size="sm" variant="outline" className="rounded-full" onClick={() => conferir(d, true)}>
                      <CheckIcon /> Confirmar
                    </Button>
                    <Button size="sm" variant="ghost" className="rounded-full" onClick={() => conferir(d, false)}>
                      <XIcon /> Recusar
                    </Button>
                  </>
                )}
                {(atual === 'sem_bytes' || atual === 'repetidos') && (
                  <Button size="sm" variant="ghost" className="rounded-full" onClick={() => onIrPasta(d)}>
                    Ver na pasta
                  </Button>
                )}
              </span>
            </li>
          )
        })}
      </ul>
    </Caixa>
  )
}

const meses = /^(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)/i

/**
 * Aviso de pasta fora do padrão (D-01): quando alguém salva numa pasta de mês
 * com nome livre, o integrante do setor avisa na hora quem salvou.
 */
export function avisarPastaForaDoPadrao(loja: ReturnType<typeof useLoja>, caminho: string[], quem: string) {
  const fora = caminho.find((p) => (meses.test(p) || /^\d{1,2}[.\-/]\d{2,4}$/.test(p)) && !/^\d{4}-\d{2}$/.test(p))
  if (!fora) return
  const ano = caminho.find((p) => /^\d{4}$/.test(p)) ?? String(new Date().getFullYear())
  loja.toast(`${quem.split(' ')[0]}, a pasta “${fora}” está fora do padrão: o mês vai como ${ano}-MM (ex.: ${ano}-10). Eu entendo pelo dicionário, mas os próximos arquivos vão para a pasta padrão.`, undefined, undefined, { tipo: 'integrante', setor: 'fiscal', estado: 'precisa_de_voce' })
}

import { ArchiveIcon, BookOpenIcon, CheckIcon, MagnifyingGlassIcon, WarningIcon } from '@phosphor-icons/react'
import { useLoja, usePersistente } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import { Caixa, TituloBloco } from '@/components/compostos/blocos'
import { EstadoVazio, usePode } from '@/components/kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useEstadoConector } from '@/dados/conectores'
import { CHAVE_RAIOX, estadoRaioXInicial, resumoDoEscritorio, type EstadoRaioX } from '@/dados/raiox'
import { registrar } from '@/nucleo/repositorios'
import { banco } from '@/nucleo/banco'
import { ID_HORIZONTE } from '@/nucleo/semente'
import { SeloEstado } from './comum-s09'
import { useTelasCheias } from './telas-cheias'

/** Blocos novos de Configurações › Armazenamento (S09-T08): Raio-X (S09-A63), manutenção (D-06) e dicionário (S09-A60). */

export interface ItemManutencao {
  id: string
  tipo: 'fora_padrao' | 'sem_cliente' | 'ex_cliente'
  pasta: string
  detalhe: string
  resolvido?: string
}

/** O Horizonte (servidor local) tem a sua própria lista. */
export const manutencaoDoEscritorio = (): ItemManutencao[] =>
  banco.escritorioId === ID_HORIZONTE ? [{ id: 'm1', tipo: 'fora_padrao', pasta: 'D:\\Clientes\\Mercado Central\\Fiscal\\outubro', detalhe: 'Mês por extenso no servidor local; o padrão novo é 2026-10. O integrante avisou quem salvou (D-01).' }] : manutencaoInicial

export const manutencaoInicial: ItemManutencao[] = [
  { id: 'm1', tipo: 'fora_padrao', pasta: 'Metalúrgica Andrade/Fiscal/Out-26', detalhe: 'Salva por Rafael Nunes em 06/11; o padrão é 2026-10. O integrante Fiscal já avisou quem salvou (D-01).' },
  { id: 'm2', tipo: 'fora_padrao', pasta: 'Padaria Pão Quente/DP/folha outubro', detalhe: 'Mês por extenso dentro de DP; o dicionário entende, mas o padrão novo é 2026-10.' },
  { id: 'm3', tipo: 'sem_cliente', pasta: 'Meu Drive/Clientes/Rota Sul 2019', detalhe: 'Pasta solta sem cliente ligado.' },
  { id: 'm4', tipo: 'ex_cliente', pasta: 'Meu Drive/Clientes/Gráfica Impacta', detalhe: 'Ex-cliente desde 03/2023 ainda na pasta principal.' },
  { id: 'm5', tipo: 'ex_cliente', pasta: 'Meu Drive/Clientes/Oficina do Zé', detalhe: 'Contrato encerrado em 11/2022; ainda na pasta principal.' },
]

const rotuloTipo = { fora_padrao: 'Fora do padrão', sem_cliente: 'Sem cliente', ex_cliente: 'Ex-cliente na pasta principal' }

export function BlocoRaioX() {
  const [rx] = usePersistente<EstadoRaioX>(CHAVE_RAIOX, estadoRaioXInicial)
  const { abrir } = useTelasCheias()
  const antigo = useEstadoConector(rx.provedor === 'servidor_local' || banco.escritorioId === ID_HORIZONTE ? 'servidor_local' : 'drive_antigo')
  const pode = usePode('raiox.rodar')
  const r = resumoDoEscritorio()
  return (
    <Caixa>
      <TituloBloco
        descricao="Diagnóstico das pastas de todos os clientes antes de o mapeamento valer, em qualquer armazenamento (Drive, OneDrive, Dropbox, Box, servidor local). Lê só a lista de pastas e arquivos, nunca o conteúdo (D-10)."
        acao={
          pode && (
            <Button size="sm" className="rounded-full" onClick={() => abrir('raiox')}>
              <MagnifyingGlassIcon /> {rx.rodado_em ? 'Abrir o Raio-X' : 'Rodar o Raio-X'}
            </Button>
          )
        }
      >
        Raio-X das pastas
      </TituloBloco>
      <p className="flex flex-wrap items-center gap-2 text-sm">
        <SeloEstado tom={antigo.tom}>{antigo.nome}: {antigo.rotulo}</SeloEstado>
        {rx.rodado_em ? (
          <span>
            Último em {new Date(rx.rodado_em).toLocaleDateString('pt-BR')}: {r.casaram} de {r.pastasCliente} pastas casaram; {rx.aplicado_em ? 'decisões aplicadas' : `${Object.keys(rx.decisoes).length} decisões tomadas, falta aplicar`}.
          </span>
        ) : (
          <span className="text-muted-foreground">Ainda não rodou.</span>
        )}
      </p>
      <Button size="sm" variant="ghost" className="w-fit rounded-full" onClick={() => abrir('raiox')}>
        <BookOpenIcon /> Dicionário de departamentos e órgãos
      </Button>
    </Caixa>
  )
}

export function BlocoManutencao() {
  const loja = useLoja()
  const { usuario } = useSessao()
  const pode = usePode('armazenamento.configurar')
  const [itens, setItens] = usePersistente<ItemManutencao[]>('s09:arm:manutencao', manutencaoDoEscritorio)
  const abertos = itens.filter((i) => !i.resolvido)
  const resolver = (i: ItemManutencao, como: string) => {
    setItens((xs) => xs.map((x) => (x.id === i.id ? { ...x, resolvido: como } : x)))
    registrar(`${usuario.nome} resolveu manutenção de pasta (${rotuloTipo[i.tipo]}): ${i.pasta} → ${como}`, 'armazenamento.manutencao')
    loja.toastDesfazer(`${i.pasta}: ${como}.`, () => setItens((xs) => xs.map((x) => (x.id === i.id ? { ...x, resolvido: undefined } : x))))
  }
  return (
    <Caixa>
      <TituloBloco descricao="O integrante vigia a árvore e lista o que foge do padrão. A plataforma nunca renomeia sozinha: você decide (D-06).">Manutenção das pastas</TituloBloco>
      {abertos.length === 0 ? (
        <EstadoVazio icone={CheckIcon} titulo="Árvore em ordem" descricao="Nada fora do padrão, sem cliente ou de ex-cliente na pasta principal." compacto />
      ) : (
        <ul className="divide-border/70 flex flex-col divide-y">
          {abertos.map((i) => (
            <li key={i.id} data-manutencao={i.id} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 py-2.5">
              <WarningIcon className="text-warning size-5 shrink-0" />
              <span className="min-w-0 flex-1 basis-60 text-sm">
                <span className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="outline">{rotuloTipo[i.tipo]}</Badge>
                  <span className="break-all">{i.pasta}</span>
                </span>
                <span className="text-muted-foreground block text-xs">{i.detalhe}</span>
              </span>
              {pode && (
                <span className="flex flex-wrap gap-1">
                  {i.tipo === 'ex_cliente' && (
                    <Button size="sm" variant="outline" className="rounded-full" onClick={() => resolver(i, 'movida para Arquivo morto')}>
                      <ArchiveIcon /> Arquivo morto
                    </Button>
                  )}
                  {i.tipo === 'fora_padrao' && (
                    <Button size="sm" variant="outline" className="rounded-full" onClick={() => resolver(i, 'entendida pelo dicionário')}>
                      Ensinar ao dicionário
                    </Button>
                  )}
                  {i.tipo === 'sem_cliente' && (
                    <Button size="sm" variant="outline" className="rounded-full" onClick={() => resolver(i, 'ligada a Transportes Rota Sul S.A.')}>
                      Ligar ao cliente sugerido
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" className="rounded-full" onClick={() => resolver(i, 'ignorada')}>
                    Ignorar
                  </Button>
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </Caixa>
  )
}

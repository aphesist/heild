import { ArrowsClockwiseIcon, ClockCountdownIcon, CurrencyCircleDollarIcon, DatabaseIcon, DownloadSimpleIcon, FileTextIcon, GearSixIcon, GlobeIcon, PlugsConnectedIcon } from '@phosphor-icons/react'
import { useState, type ReactNode } from 'react'
import { useLoja } from '@/ambiente/loja'
import { EstadoVazio, useAcao } from '@/components/kit'
import { Button } from '@/components/ui/button'
import { Segmentado } from '@/components/ui/formulario'
import { ItemMenu, Menu, RotuloMenu } from '@/components/ui/menu'
import { ConectarCore, ConfiguracoesModulo, CustoHora, Dominios, Exportar, ReconstruirPeriodo, TermoCiencia } from './configuracao'
import { semearTimesheet, useTimesheet, type PacoteFiltro, type PapelTs } from './dados'

export { Caixa, Numero } from '@/components/compostos/blocos'

/**
 * Cabeçalho de cada aba do Timesheet: título, contexto e as ações de topo:
 * exportar para todos; o menu de configuração para Gestor e Administrador
 * (o que só o Administrador pode some para o Gestor, como manda o mapa, 1.1).
 */
export function CabecalhoTs({ titulo, sub, papel, children }: { titulo: string; sub: string; papel: PapelTs; children?: ReactNode }) {
  const [aberto, setAberto] = useState<'exportar' | 'config' | 'core' | 'custo' | 'dominios' | 'termo' | 'reconstruir' | null>(null)
  const admin = papel === 'admin'
  return (
    <header className="flex flex-wrap items-end gap-2">
      <div className="min-w-0 flex-1 basis-full sm:basis-auto">
        <h1 className="text-2xl font-light tracking-tight sm:text-3xl">{titulo}</h1>
        <p className="text-muted-foreground text-sm">{sub}</p>
      </div>
      {children}
      <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setAberto('exportar')}>
        <DownloadSimpleIcon /> Exportar
      </Button>
      {papel !== 'colaborador' && (
        <Menu
          align="end"
          gatilho={
            <Button size="sm" variant="outline" className="rounded-full">
              <GearSixIcon /> Configurar
            </Button>
          }
        >
          <RotuloMenu>Timesheet do escritório</RotuloMenu>
          {admin && (
            <ItemMenu icone={<GearSixIcon />} detalhe="inatividade, itens por dia, jornada" onClick={() => setAberto('config')}>
              Configurações do módulo
            </ItemMenu>
          )}
          {admin && (
            <ItemMenu icone={<PlugsConnectedIcon />} detalhe="Alterdata, Domínio, Questor, Contmatic" onClick={() => setAberto('core')}>
              Conectar sistema contábil
            </ItemMenu>
          )}
          {admin && (
            <ItemMenu icone={<CurrencyCircleDollarIcon />} detalhe="gastos do mês ÷ horas produtivas" onClick={() => setAberto('custo')}>
              Custo-hora do escritório
            </ItemMenu>
          )}
          <ItemMenu icone={<GlobeIcon />} detalhe="o que a extensão lê e onde" onClick={() => setAberto('dominios')}>
            Portais da extensão
          </ItemMenu>
          <ItemMenu icone={<FileTextIcon />} detalhe="o texto que cada pessoa aceita" onClick={() => setAberto('termo')}>
            Termo de ciência
          </ItemMenu>
          {admin && (
            <ItemMenu icone={<ArrowsClockwiseIcon />} detalhe="refaz as sessões a partir dos eventos" onClick={() => setAberto('reconstruir')}>
              Reconstruir período
            </ItemMenu>
          )}
        </Menu>
      )}
      {aberto === 'exportar' && <Exportar papel={papel} onFechar={() => setAberto(null)} />}
      {aberto === 'config' && <ConfiguracoesModulo onFechar={() => setAberto(null)} />}
      {aberto === 'core' && <ConectarCore onFechar={() => setAberto(null)} />}
      {aberto === 'custo' && <CustoHora onFechar={() => setAberto(null)} />}
      {aberto === 'dominios' && <Dominios admin={admin} onFechar={() => setAberto(null)} />}
      {aberto === 'termo' && <TermoCiencia somenteLeitura onFechar={() => setAberto(null)} />}
      {aberto === 'reconstruir' && <ReconstruirPeriodo onFechar={() => setAberto(null)} />}
    </header>
  )
}

/**
 * Filtro de pacote (05, ad. 19): com o BPO contratado, as telas separam horas,
 * custo e margem por pacote sem trocar o custo-hora do escritório; com o
 * Jurídico contratado, aparece o chip Jurídico. No escritório só de BPO não
 * aparece (tudo é BPO).
 */
export function usePacote() {
  const loja = useLoja()
  const ts = useTimesheet()
  const [pacote, setPacote] = useState<PacoteFiltro>('todos')
  const bpo = loja.estado.bpoModulo && loja.estado.cenario !== 'bpo_puro'
  const ativo = bpo || ts.temJuridico
  const opcoes: { valor: PacoteFiltro; rotulo: string }[] = [{ valor: 'todos', rotulo: 'Todos' }, { valor: 'contabil', rotulo: 'Contábil' }, ...(bpo ? [{ valor: 'bpo' as const, rotulo: 'BPO' }] : []), ...(ts.temJuridico ? [{ valor: 'juridico' as const, rotulo: 'Jurídico' }] : [])]
  const chip = ativo ? <Segmentado rotulo="Pacote" valor={pacote} onMudar={setPacote} opcoes={opcoes} /> : null
  return { pacote: ativo ? pacote : ('todos' as PacoteFiltro), chip }
}

/** Estado vazio do módulo: banco guardado antes do Timesheet existir, ou escritório sem sessões ainda. */
export function TimesheetVazio() {
  const executar = useAcao()
  return (
    <EstadoVazio
      icone={DatabaseIcon}
      className="h-full"
      titulo="Ainda não há tempo registrado"
      descricao="O Timesheet começa a contar quando alguém abre uma tarefa no Painel ou atende no CRM. Este banco foi guardado antes do Timesheet existir: carregue os dados de exemplo para ver as quatro abas funcionando."
      acao={
        <Button className="rounded-full" onClick={() => executar(() => semearTimesheet(), { sucesso: 'Dados de exemplo do Timesheet carregados' })}>
          <ClockCountdownIcon /> Carregar os dados de exemplo
        </Button>
      }
    />
  )
}

/** Faixa de aviso discreta (ex.: custo-hora não definido). */
export function Faixa({ icone, children, acao }: { icone?: ReactNode; children: ReactNode; acao?: ReactNode }) {
  return (
    <div className="bg-warning/10 flex flex-wrap items-center gap-3 rounded-lg px-4 py-3 text-sm">
      {icone}
      <p className="min-w-0 grow basis-40">{children}</p>
      {acao}
    </div>
  )
}

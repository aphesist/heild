import { ArrowsClockwiseIcon, BankIcon, DownloadSimpleIcon, GavelIcon, GearSixIcon, ListBulletsIcon, ReceiptIcon, ScalesIcon, TableIcon, UploadSimpleIcon } from '@phosphor-icons/react'
import { useState, type ReactNode } from 'react'
import { useEfeitosCartao } from '@/ambiente/efeitos'
import { useNavegacao } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import { Carregando } from '@/components/kit'
import { CartaoAprovacao } from '@/components/compostos/cartoes-chat'
import { AreaRolagem } from '@/components/ui/area-rolagem'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ItemMenu, Menu, RotuloMenu } from '@/components/ui/menu'
import { Orb } from '@/components/ui/orb'
import { integrantes } from '@/dados/exemplo'
import { useAparencia } from '@/hooks/useAparencia'
import { cn } from '@/lib/utils'
import { Alcadas, ConectarConta, ConectarProvedor, ConfigNfse, ExportarFin, ImportarFinanceiro, PlanoContas, PoliticaInadimplencia, TabelaAvulsos } from './configuracao'
import { INTEGRANTE_FIN, useFin, useRelogio, type Fin } from './dados'
import { rotuloSituacao, type SituacaoTela } from './dominio'

export { Caixa, Numero, Propriedade, TituloBloco } from '@/components/compostos/blocos'

/** Real sem centavos (totais) ou com centavos (faturas). */
export const brl = (v: number, centavos = false) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: centavos ? 2 : 0, maximumFractionDigits: centavos ? 2 : 0 }).replace('-', '−')
/** Milhares compactos para eixos: R$ 198 mil. */
export const mil = (v: number) => `R$ ${Math.round(v / 1000).toLocaleString('pt-BR')} mil`

/** Moldura das abas: rolagem, largura e o estado "carregando" enquanto o banco do Financeiro chega. */
export function PaginaFin({ fin, children }: { fin: Fin; children: ReactNode }) {
  return (
    <AreaRolagem className="h-full px-4 pb-10 sm:px-5 md:pb-24">
      <div className="pagina flex flex-col gap-4 pt-1">{fin.politica ? children : <Carregando rotulo="Carregando o Financeiro" linhas={6} />}</div>
    </AreaRolagem>
  )
}

export type ModalConfig = 'provedor' | 'nfse' | 'politica' | 'conta' | 'plano' | 'alcadas' | 'importar' | 'avulsos' | 'exportar'

/**
 * Cabeçalho das abas do Financeiro: título, contexto, ações da aba, Exportar e
 * a engrenagem Configurar (S07-T08, só Administrador); à direita, o
 * integrante Financeiro com o que está fazendo e "Falar" (S07-A03).
 */
export function CabecalhoFin({ titulo, sub, status, children, exportar = 'contratos' }: { titulo: string; sub: string; status?: string; children?: ReactNode; exportar?: string }) {
  const [aberto, setAberto] = useState<ModalConfig | null>(null)
  const nav = useNavegacao()
  const aparencia = useAparencia()
  const fin = integrantes.find((i) => i.id === INTEGRANTE_FIN)
  const { usuario, permissoes } = useSessao()
  const admin = usuario.papel === 'administrador'
  // Quem lê o Financeiro por exceção (sem o setor) não tem o integrante no próprio Time.
  const temIntegrante = admin || permissoes.setores.includes('financeiro_escritorio')
  const t = fin ? aparencia(fin) : undefined
  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-start">
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-light tracking-tight sm:text-3xl">{titulo}</h1>
        <p className="text-muted-foreground text-sm">{sub}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {children}
          <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setAberto('exportar')}>
            <DownloadSimpleIcon /> Exportar
          </Button>
          {admin && <MenuConfigurar onAbrir={setAberto} />}
        </div>
      </div>
      {fin && t && (
        <div className="bg-surface shadow-cartao flex min-h-19 w-full items-center gap-3 rounded-cartao p-3 lg:w-80">
          <Orb cor={t.cor} corOlhos={t.corOlhos} estado={fin.estado} tamanho={40} animado modo="wander" cutucavel={false} />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium">{t.nome}</div>
            <p className="text-muted-foreground line-clamp-2 text-xs">{status ?? fin.resumo}</p>
          </div>
          {temIntegrante && (
            <Button size="sm" variant="outline" className="shrink-0 rounded-full" onClick={() => nav.irPara({ modulo: 'inicio', aba: 'time', integrante: fin.id })}>
              Falar
            </Button>
          )}
        </div>
      )}
      <ModaisConfig aberto={aberto} onFechar={() => setAberto(null)} exportar={exportar} />
    </header>
  )
}

export function MenuConfigurar({ onAbrir }: { onAbrir: (m: ModalConfig) => void }) {
  const fin = useFin()
  const p = fin.politica
  return (
    <Menu
      align="end"
      gatilho={
        <Button size="sm" variant="outline" className="rounded-full">
          <GearSixIcon /> Configurar
        </Button>
      }
    >
      <RotuloMenu>Receber</RotuloMenu>
      <ItemMenu icone={<ArrowsClockwiseIcon />} detalhe={p ? `${p.provedor.nome} · boleto, Pix, Pix Automático` : ''} onClick={() => onAbrir('provedor')}>
        Provedor de cobrança
      </ItemMenu>
      <ItemMenu icone={<ReceiptIcon />} detalhe={p?.nfse.nfse_por_servico ? 'uma NFS-e por serviço' : 'vários itens por nota'} onClick={() => onAbrir('nfse')}>
        NFS-e do escritório
      </ItemMenu>
      <ItemMenu icone={<GavelIcon />} detalhe="régua, aviso formal, pausa, acordo" onClick={() => onAbrir('politica')}>
        Política de inadimplência
      </ItemMenu>
      <ItemMenu icone={<TableIcon />} detalhe="preço por atividade do catálogo" onClick={() => onAbrir('avulsos')}>
        Tabela de avulsos
      </ItemMenu>
      <RotuloMenu>Pagar e conciliar</RotuloMenu>
      <ItemMenu icone={<BankIcon />} detalhe="Open Finance, só leitura" onClick={() => onAbrir('conta')}>
        Conectar conta
      </ItemMenu>
      <ItemMenu icone={<ListBulletsIcon />} detalhe="categorias e centros de custo" onClick={() => onAbrir('plano')}>
        Plano de contas e centros de custo
      </ItemMenu>
      <ItemMenu icone={<ScalesIcon />} detalhe="quem aprova cada conta" onClick={() => onAbrir('alcadas')}>
        Alçadas de aprovação
      </ItemMenu>
      <RotuloMenu>Implantação</RotuloMenu>
      <ItemMenu icone={<UploadSimpleIcon />} detalhe="Conexa, Omie, Conta Azul, Nibo, Domínio, planilha" onClick={() => onAbrir('importar')}>
        Trazer o financeiro atual
      </ItemMenu>
    </Menu>
  )
}

export function ModaisConfig({ aberto, onFechar, exportar = 'contratos' }: { aberto: ModalConfig | null; onFechar: () => void; exportar?: string }) {
  return (
    <>
      {aberto === 'provedor' && <ConectarProvedor troca onFechar={onFechar} />}
      {aberto === 'nfse' && <ConfigNfse onFechar={onFechar} />}
      {aberto === 'politica' && <PoliticaInadimplencia onFechar={onFechar} />}
      {aberto === 'conta' && <ConectarConta onFechar={onFechar} />}
      {aberto === 'plano' && <PlanoContas onFechar={onFechar} />}
      {aberto === 'alcadas' && <Alcadas onFechar={onFechar} />}
      {aberto === 'importar' && <ImportarFinanceiro onFechar={onFechar} />}
      {aberto === 'avulsos' && <TabelaAvulsos onFechar={onFechar} />}
      {aberto === 'exportar' && <ExportarFin inicial={exportar} onFechar={onFechar} />}
    </>
  )
}

/**
 * Os cartões que o integrante Financeiro preparou para esta aba (o mesmo
 * registro do chat e do sino): decidir aqui vale em todos (01, 6.4).
 */
export function CartoesDaAba({ fin, aba, todas }: { fin: Fin; aba?: string; todas?: boolean }) {
  useRelogio(2500)
  const efeitos = useEfeitosCartao()
  const lista = fin.pendentes.filter((c) => todas || c.extras?.aba === aba)
  if (!lista.length) return null
  return (
    <section aria-label="Cartões do integrante Financeiro" className="grid gap-3 md:grid-cols-2">
      {lista.map((c) => (
        <div key={c.id} className="flex flex-col gap-1">
          <CartaoAprovacao
            cartao={{ tipo: 'aprovacao', id: c.id, resumo: c.resumo_humano, argumentos: (c.extras?.argumentos_tela as { rotulo: string; valor: string }[]) ?? [], expiraEm: c.expira_em ? `expira em ${Math.max(1, Math.round((Date.parse(c.expira_em) - Date.parse('2026-11-18T12:00:00Z')) / 864e5))} dias` : undefined }}
            onDecidir={(d) => efeitos(c.id, d)}
          />
          <span className="text-muted-foreground px-2 text-[11px]">quem decide: {c.extras?.alcada === 'administrador' ? 'Administrador' : 'Gestor do Financeiro (na alçada) ou Administrador'}</span>
        </div>
      ))}
    </section>
  )
}

const tomSituacao: Record<SituacaoTela, 'sucesso' | 'destaque' | 'erro' | 'outline' | 'secondary'> = {
  rascunho: 'outline',
  aguardando_aprovacao: 'destaque',
  a_vencer: 'outline',
  vencida: 'erro',
  aguardando_confirmacao: 'destaque',
  paga: 'sucesso',
  paga_parcial: 'destaque',
  em_acordo: 'destaque',
  cancelada: 'secondary',
  substituida: 'secondary',
  baixada_perda: 'secondary',
}
/** Situação da fatura: texto e cor (nunca só cor). */
export function SeloSituacao({ s, className }: { s: SituacaoTela; className?: string }) {
  return (
    <Badge variant={tomSituacao[s]} className={className}>
      {rotuloSituacao[s]}
    </Badge>
  )
}

/** Aviso curto dentro de um bloco. */
export function Nota({ children, tom = 'neutro', className }: { children: ReactNode; tom?: 'neutro' | 'alerta' | 'ok'; className?: string }) {
  return <p className={cn('rounded-lg px-3 py-2 text-sm', tom === 'alerta' ? 'bg-warning/10' : tom === 'ok' ? 'bg-success/10' : 'bg-sunken/60', className)}>{children}</p>
}

/** Pergunta que abre cada bloco (como no Timesheet). */
export function Pergunta({ children, acao, descricao }: { children: ReactNode; acao?: ReactNode; descricao?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-start gap-2">
      <div className="min-w-0 grow basis-40">
        <h2 className="text-sm font-medium">{children}</h2>
        {descricao && <p className="text-muted-foreground text-xs">{descricao}</p>}
      </div>
      {acao}
    </header>
  )
}

/** Barras de valor em reais (uma série, os maiores primeiro). */
export function BarrasReais({ dados }: { dados: { nome: string; h: number }[] }) {
  const max = Math.max(1, ...dados.map((d) => d.h))
  const total = Math.max(1, dados.reduce((s, d) => s + d.h, 0))
  return (
    <ul className="flex flex-col gap-2">
      {dados.map((d) => (
        <li key={d.nome} className="grid grid-cols-[minmax(0,8rem)_1fr_minmax(7.5rem,max-content)] items-center gap-3 text-sm">
          <span className="truncate">{d.nome}</span>
          <span className="h-3 rounded-r-xs" style={{ width: `${(d.h / max) * 100}%`, background: 'color-mix(in oklab, var(--foreground) 55%, transparent)' }} title={`${d.nome}: ${brl(d.h)}`} />
          <span className="text-right tabular-nums">
            {brl(d.h)} <span className="text-muted-foreground text-xs">{Math.round((d.h / total) * 100)}%</span>
          </span>
        </li>
      ))}
    </ul>
  )
}

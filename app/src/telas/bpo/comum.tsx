import { ArrowSquareOutIcon, CircleIcon, InfoIcon, PlugsConnectedIcon, WarningIcon } from '@phosphor-icons/react'
import { useState, type ReactNode } from 'react'
import { useLoja, useNavegacao } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import { AreaRolagem } from '@/components/ui/area-rolagem'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Orb } from '@/components/ui/orb'
import { integrantes } from '@/dados/exemplo'
import { integranteAoVivo } from '@/ambiente/integrante-vivo'
import { useAparencia } from '@/hooks/useAparencia'
import { cn } from '@/lib/utils'
import { banco } from '@/nucleo/banco'
import { eventoBpo } from '@/nucleo/repositorios'
import { ErroServico, servicos } from '@/servicos'
import { corAudit, criteriosAudit, dataHora, rotuloCor, rotuloSituacaoErp, type EmpresaVista } from './dados'

export { Caixa, Numero, Propriedade, TituloBloco } from '@/components/compostos/blocos'
export { brl } from './dados'

/**
 * Moldura de toda aba do BPO, a mesma do Painel: rolagem com as mesmas margens
 * e coluna de largura fixa. Nenhuma aba monta a sua própria, para trocar de aba
 * não mexer na largura nem no topo do conteúdo.
 */
export function PaginaBpo({ children }: { children: ReactNode }) {
  return (
    <AreaRolagem className="h-full px-4 pb-10 sm:px-5">
      <div className="pagina flex flex-col gap-4 pt-1">{children}</div>
    </AreaRolagem>
  )
}

/**
 * Cabeçalho das abas do BPO: título, de quem são os dados e o integrante da
 * função da aba com "Falar" (Contas a Pagar, Conciliação, Gerencial). No
 * contexto mãe do BPO entre escritórios não há integrante (sem IA, 10, 4.1):
 * passe `integrante={null}`.
 */
export function CabecalhoBpo({ titulo, sub, status, integrante = 'i-bpo', children }: { titulo: string; sub: ReactNode; status?: string; integrante?: string | null; children?: ReactNode }) {
  const nav = useNavegacao()
  const aparencia = useAparencia()
  const loja = useLoja()
  const base = integrante ? integrantes.find((i) => i.id === integrante) : undefined
  const bpo = base && integranteAoVivo(base, loja.estado.trabalhos, loja.conversasTime[base.id] ?? [], loja.estado.decisoes, loja.tarefas)
  const { usuario, permissoes } = useSessao()
  const temIntegrante = usuario.papel === 'administrador' || permissoes.setores.includes('bpo_financeiro')
  const t = bpo ? aparencia(bpo) : undefined
  return (
    <header className="grid grid-cols-1 gap-x-4 gap-y-3 lg:grid-cols-[minmax(0,1fr)_20rem] lg:grid-rows-[auto_auto_1fr] lg:gap-y-0">
      <h1 className="text-2xl font-light tracking-tight sm:text-3xl lg:col-start-1 lg:row-start-1">{titulo}</h1>
      {bpo && t && (
        <div className="bg-surface shadow-cartao flex min-h-19 w-full items-center gap-3 rounded-[20px] p-3 lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:self-start">
          <Orb cor={t.cor} corOlhos={t.corOlhos} estado={bpo.estado} tamanho={40} animado modo="wander" cutucavel={false} />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium">{t.nome}</div>
            <p className="text-muted-foreground line-clamp-2 text-xs">{status ?? bpo.resumo}</p>
          </div>
          {temIntegrante && (
            <Button size="sm" variant="outline" className="shrink-0 rounded-full" onClick={() => nav.irPara({ modulo: 'inicio', aba: 'time', integrante: bpo.id })}>
              Falar
            </Button>
          )}
        </div>
      )}
      <div className="min-w-0 lg:col-start-1 lg:row-start-2">
        <div className="text-muted-foreground text-sm">{sub}</div>
        {children && <div className="mt-3 flex flex-wrap items-center gap-2">{children}</div>}
      </div>
    </header>
  )
}

/** Semáforo da auditoria contínua (10, 5.2): cor com rótulo, nunca cor sozinha; clicar mostra o motivo e o peso. */
export function SeloAudit({ e, compacto, onIr }: { e: EmpresaVista; compacto?: boolean; onIr?: (aba: string) => void }) {
  const [aberto, setAberto] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={(ev) => {
          ev.stopPropagation()
          setAberto(true)
        }}
        aria-label={`Auditoria de ${e.nome}: ${rotuloCor[e.audit.cor]}. Ver o motivo`}
        className="text-muted-foreground hover:text-foreground inline-flex cursor-pointer items-center gap-1.5 rounded-full text-xs whitespace-nowrap"
      >
        <CircleIcon weight="fill" className="size-2.5 shrink-0" style={{ color: corAudit[e.audit.cor] }} />
        {compacto ? <span className="sr-only">{rotuloCor[e.audit.cor]}</span> : rotuloCor[e.audit.cor]}
      </button>
      <DialogoAudit e={e} aberto={aberto} onFechar={() => setAberto(false)} onIr={onIr} />
    </>
  )
}

/** "Ver motivo da cor" (S08-A03): os critérios que pesaram, com o peso de cada um. */
export function DialogoAudit({ e, aberto, onFechar, onIr }: { e: EmpresaVista; aberto: boolean; onFechar: () => void; onIr?: (aba: string) => void }) {
  return (
    <Dialog open={aberto} onOpenChange={(v) => !v && onFechar()}>
      <DialogContent className="bg-surface rounded-[24px] border-0 p-5 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-normal">
            <CircleIcon weight="fill" className="size-3" style={{ color: corAudit[e.audit.cor] }} /> {e.nome}: {rotuloCor[e.audit.cor]}
          </DialogTitle>
          <DialogDescription>
            {e.audit.pontos} ponto{e.audit.pontos === 1 ? '' : 's'} na auditoria contínua. Os critérios são fixos; o Gestor do BPO ajusta os pesos em Configuração. Recalcula a cada sincronização do ERP e uma vez por dia.
          </DialogDescription>
        </DialogHeader>
        {e.audit.motivos.length === 0 ? (
          <p className="text-muted-foreground text-sm">Nenhum critério pesou: conciliação, aprovações, ERP e caixa em dia.</p>
        ) : (
          <ul className="divide-border/70 flex flex-col divide-y text-sm">
            {e.audit.motivos.map((m, i) => (
              <li key={`${m.criterio}-${i}`} className="flex items-start gap-3 py-2">
                <span className="min-w-0 flex-1">
                  <span className="block">{m.texto}</span>
                  <span className="text-muted-foreground block text-xs">{criteriosAudit[m.criterio]?.rotulo}</span>
                </span>
                <span className="bg-sunken shrink-0 rounded-full px-2 py-0.5 text-xs tabular-nums">peso {m.peso}</span>
                {onIr && (
                  <Button size="sm" variant="ghost" className="shrink-0 rounded-full" onClick={() => (onFechar(), onIr(m.aba))}>
                    Ver
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  )
}

/** ERP e estado da sincronização do espelho (10, 3.0 e 5.2), com a saúde do conector (C9). */
export function SeloErp({ e }: { e: EmpresaVista }) {
  const ruim = e.erp.efetiva === 'atrasada' || e.erp.efetiva === 'credencial_vencida' || e.erp.efetiva === 'desconectada'
  const aviso = !ruim && !!e.erp.aviso
  return (
    <span title={e.erp.aviso} className={cn('bg-sunken inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 text-xs', ruim ? 'text-destructive' : 'text-muted-foreground')}>
      {ruim || aviso ? <WarningIcon className={cn('size-3.5 shrink-0', aviso && 'text-warning')} weight="fill" /> : <PlugsConnectedIcon className="size-3.5 shrink-0" />}
      <span className="truncate">
        <span className={ruim ? undefined : 'text-foreground'}>{e.erp.provedor}</span> · {aviso ? `${e.erp.saude?.rotulo.toLowerCase()}` : rotuloSituacaoErp[e.erp.efetiva]}
        {e.erp.modo !== 'E3' && e.erp.ultima_sincronizacao && ` · ${dataHora(e.erp.ultima_sincronizacao)}`}
      </span>
    </span>
  )
}

/** "Abrir no ERP" (S08-A07): o link do registro no sistema do cliente (simulado, API-25). */
export function useAbrirErp() {
  const loja = useLoja()
  return async (e: EmpresaVista, oque: string) => {
    if (e.erp.modo === 'E3') return loja.toast(`${oque}: aberto no livro próprio da plataforma`)
    if (e.erp.modo === 'E2') return loja.toast(`${e.erp.provedor} em modo arquivo: ${oque} entra no checklist “lançar no ERP”`)
    try {
      const r = await servicos.erp.abrir(e.erp.provedor, oque)
      eventoBpo(banco, `Abriu no ${e.erp.provedor}: ${oque}`, e.clienteId)
      loja.toast(`Abriria ${oque} no ${e.erp.provedor} (${r.dados.url.replace('https://', '')}) · demonstração`)
    } catch (err) {
      loja.toastErro(err instanceof ErroServico ? err.message : `O ${e.erp.provedor} não respondeu. Tente de novo.`)
    }
  }
}

export const rotuloAbrirErp = (e: EmpresaVista) => (e.erp.modo === 'E3' ? 'Abrir no livro próprio' : `Abrir no ${e.erp.provedor}`)

export function BotaoErp({ e, oque, rotulo }: { e: EmpresaVista; oque: string; rotulo?: boolean }) {
  const abrir = useAbrirErp()
  return rotulo ? (
    <Button size="sm" variant="ghost" className="rounded-full" onClick={() => void abrir(e, oque)}>
      <ArrowSquareOutIcon /> {rotuloAbrirErp(e)}
    </Button>
  ) : (
    <Button size="icon-sm" variant="ghost" className="shrink-0 rounded-full" aria-label={`${rotuloAbrirErp(e)}: ${oque}`} title={rotuloAbrirErp(e)} onClick={() => void abrir(e, oque)}>
      <ArrowSquareOutIcon />
    </Button>
  )
}

/** Faixa com a regra que vale em toda a tela (B3, segregação). */
export function Regra({ icone, children }: { icone?: ReactNode; children: ReactNode }) {
  return (
    <p className="bg-sunken/60 text-muted-foreground flex items-start gap-2 rounded-[16px] px-4 py-3 text-sm">
      <span className="text-foreground mt-0.5 shrink-0 [&_svg]:size-5">{icone ?? <InfoIcon weight="duotone" />}</span>
      <span>{children}</span>
    </p>
  )
}

/** Props comuns: a empresa do seletor (ou nenhuma = carteira) e como escolher uma. */
export interface PropsBpo {
  empresa?: EmpresaVista
  onEscolher: (clienteId: string | null, aba?: string) => void
}

import { ArrowRightIcon, CaretDownIcon, GearSixIcon, ListChecksIcon, TrashIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { useLoja, usePersistente } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import { EdicaoEmLinha, EstadoVazio, ListaOrdenavel, SePode, useAcao, useConfirmar, usePode } from '@/components/kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Campo, CampoEscolha, CampoTexto, GavetaFormulario, Interruptor, Segmentado } from '@/components/ui/formulario'
import { Tooltip } from '@/components/ui/tooltip'
import { agenda, diasSemana } from '@/dados/exemplo'
import { cn } from '@/lib/utils'
import { banco } from '@/nucleo/banco'
import type { BpoRotina } from '@/nucleo/modelo/entidades'
import { useTabela } from '@/nucleo/react'
import { agora, repos } from '@/nucleo/repositorios'
import { baixaDe, fechamentoOperacao } from '@/nucleo/repositorios/s08b-operacao'
import { useTema } from '@/theme/ThemeProvider'
import { SeloTitular } from '../../financeiro/pecas'
import { CabecalhoBpo, Caixa, PaginaBpo, SeloErp, TituloBloco, type PropsBpo } from '../comum'
import { agoraBpo, corAudit, dataHora, hojeBpo, rotuloCor, useBpo, type EmpresaVista } from '../dados'
import { COMPETENCIA_FECHAMENTO, docAberto, rotuloCompetencia, useDocumentosBpo } from './dados'
import { SecaoFechamento } from './fechamento'
import { CHAVE_SECAO_ROTINAS } from './fila'
import { SecaoConciliacao, SecaoLancamentos, SecaoPagar, SecaoReceber } from './secoes'

type Secao = 'hoje' | 'pagar' | 'receber' | 'conciliacao' | 'lancamentos' | 'fechamento'
const integranteDaSecao: Record<Secao, string> = { hoje: 'i-bpo-conciliacao', pagar: 'i-bpo', receber: 'i-bpo-receber', conciliacao: 'i-bpo-conciliacao', lancamentos: 'i-bpo-conciliacao', fechamento: 'i-bpo-gerencial' }
/** Para onde cada rotina leva (pelo código da atividade). */
const secaoDaRotina = (codigo: string): Secao | null => ({ 'FIN-003': 'pagar', 'FIN-201': 'pagar', 'FIN-004': 'conciliacao', 'FIN-006': 'fechamento', 'BPO-013': 'fechamento' })[codigo] as Secao | undefined ?? null
const cadencias: BpoRotina['cadencia'][] = ['diária', 'semanal', 'mensal']

/** O que está pendente em cada frente da empresa (para os contadores das seções e o painel da carteira). */
function useFrentes(e: EmpresaVista) {
  const docs = useDocumentosBpo([e.clienteId])
  const t = useTabela('bpo_transacao')
  useTabela('bpo_entrega')
  const ativas = e.rotinas.filter((r) => r.ativa)
  const paraLancar = e.erp.modo === 'E2' ? t.filter((x) => x.cliente_id === e.clienteId && baixaDe(x) === 'manual_pendente').length + e.contas.filter((c) => c.lancar_no_erp && c.etapa !== 'cancelada').length : 0
  const passos = fechamentoOperacao.passos(e.clienteId, COMPETENCIA_FECHAMENTO)
  const fechado = e.entregas.some((x) => x.tipo === 'fechamento' && x.competencia === COMPETENCIA_FECHAMENTO && x.situacao === 'enviado')
  return {
    hoje: ativas.filter((r) => r.cadencia === 'diária' && !r.feita_em).length,
    feitas: ativas.filter((r) => r.feita_em).length,
    total: ativas.length,
    pagar: e.contas.filter((c) => c.etapa === 'capturada').length + docs.filter(docAberto).length,
    receber: e.perfil.escopo.includes('receber') ? e.receber.filter((c) => c.etapa === 'atrasada').length : 0,
    conciliacao: e.transacoes.length,
    lancamentos: paraLancar,
    fechamento: fechado ? 0 : passos.filter((p) => !p.ok).length,
    fechado,
  }
}

/**
 * BPO › Rotinas (S08-T04; 10, 3.1, 3.0 e 3.10): a operação do dia a dia de cada
 * empresa. Sem empresa escolhida, o painel da carteira por exceção; com uma
 * empresa, as seções Hoje (checklist e calendário único), Contas a pagar
 * (captura do ERP e conferência), Contas a receber e cobrança, Conciliação
 * (Open Finance simulado), Lançamentos no ERP e Fechamento do mês (com o
 * relatório gerencial rascunhado pelo Gerencial).
 */
export function RotinasBpoTela({ empresa, onEscolher }: PropsBpo) {
  const { empresas } = useBpo()
  const [secao, setSecao] = usePersistente<Secao>(CHAVE_SECAO_ROTINAS, 'hoje')
  const [configurar, setConfigurar] = useState(false)
  if (!empresa) return <RotinasCarteira empresas={empresas} onEscolher={onEscolher} onSecao={setSecao} />
  const e = empresa
  return (
    <PaginaBpo>
      <CabecalhoBpo integrante={integranteDaSecao[secao] ?? 'i-bpo-conciliacao'} titulo="Rotinas" sub={`${e.nome} · a operação do dia: o que já foi feito e o que falta`}>
        <SeloTitular titular={{ tipo: 'empresa', clienteId: e.clienteId, nome: e.nome }} />
        <SeloErp e={e} />
        <SePode ferramenta="rotina.configurar" alvo={{ cliente_id: e.clienteId }}>
          <Button size="sm" variant="outline" className="rounded-full" onClick={() => setConfigurar(true)}>
            <GearSixIcon /> Configurar rotinas
          </Button>
        </SePode>
      </CabecalhoBpo>
      <SeletorSecao e={e} secao={secao} onSecao={setSecao} />
      {secao === 'hoje' && <SecaoHoje e={e} onSecao={setSecao} onEscolher={onEscolher} />}
      {secao === 'pagar' && <SecaoPagar e={e} onEscolher={onEscolher} />}
      {secao === 'receber' && <SecaoReceber e={e} onEscolher={onEscolher} />}
      {secao === 'conciliacao' && <SecaoConciliacao e={e} />}
      {secao === 'lancamentos' && <SecaoLancamentos e={e} />}
      {secao === 'fechamento' && <SecaoFechamento e={e} onSecao={(s) => setSecao(s as Secao)} onEscolher={onEscolher} />}
      {configurar && <ConfigurarRotinas e={e} onFechar={() => setConfigurar(false)} />}
    </PaginaBpo>
  )
}

function SeletorSecao({ e, secao, onSecao }: { e: EmpresaVista; secao: Secao; onSecao: (s: Secao) => void }) {
  const f = useFrentes(e)
  const n = (x: number) => (x ? ` (${x})` : '')
  const opcoes: { valor: Secao; rotulo: string }[] = [
    { valor: 'hoje', rotulo: `Hoje${n(f.hoje)}` },
    { valor: 'pagar', rotulo: `Contas a pagar${n(f.pagar)}` },
    { valor: 'receber', rotulo: `A receber${n(f.receber)}` },
    { valor: 'conciliacao', rotulo: `Conciliação${n(f.conciliacao)}` },
    { valor: 'lancamentos', rotulo: `Lançamentos no ERP${n(f.lancamentos)}` },
    { valor: 'fechamento', rotulo: `Fechamento${f.fechado ? '' : n(f.fechamento)}` },
  ]
  return (
    <>
      <div className="hidden xl:block">
        <Segmentado rotulo="Seção das rotinas" valor={secao} onMudar={onSecao} opcoes={opcoes} />
      </div>
      <div className="w-full sm:w-72 xl:hidden">
        <CampoEscolha rotulo="Seção das rotinas" valor={secao} onMudar={onSecao} opcoes={opcoes} />
      </div>
    </>
  )
}

/* ---------- Hoje: checklist diário, semanal e mensal, e o calendário único ---------- */

function useMarcar() {
  const executar = useAcao()
  const { usuario } = useSessao()
  return (e: EmpresaVista, r: BpoRotina, feita: boolean) => executar(() => repos.bpo.rotinas.atualizar(r.id, { feita_em: feita ? agoraBpo() : null, feita_por: feita ? usuario.nome : null }, { ferramenta: 'rotina.marcar', texto: `${usuario.nome} ${feita ? 'marcou' : 'desmarcou'} “${r.nome}” (${r.codigo}) de ${e.nome}` }))
}

function ItemRotina({ e, r, onIr }: { e: EmpresaVista; r: BpoRotina; onIr?: () => void }) {
  const marcar = useMarcar()
  return (
    <li className="flex items-start gap-1">
      <label className="hover:bg-raised/50 flex min-w-0 flex-1 cursor-pointer items-start gap-2.5 rounded-md px-1.5 py-1.5 text-sm">
        <input type="checkbox" checked={!!r.feita_em} onChange={(ev) => marcar(e, r, ev.target.checked)} className="accent-foreground mt-0.5 size-4 shrink-0" aria-label={`${r.nome} · ${e.nome}`} />
        <span className="min-w-0 flex-1">
          <span className={cn('block', r.feita_em && 'text-muted-foreground line-through')}>{r.nome}</span>
          <span className="text-muted-foreground block text-xs">
            {r.cadencia} · {r.quando} · {r.codigo}
            {r.feita_em && ` · ${r.feita_por}, ${dataHora(r.feita_em)}`}
          </span>
        </span>
      </label>
      {onIr && !r.feita_em && (
        <Button size="icon-sm" variant="ghost" className="mt-1 shrink-0 rounded-full" aria-label={`Fazer: ${r.nome}`} title="Ir para onde se faz" onClick={onIr}>
          <ArrowRightIcon />
        </Button>
      )}
    </li>
  )
}

function SecaoHoje({ e, onSecao, onEscolher }: { e: EmpresaVista; onSecao: (s: Secao) => void; onEscolher: (id: string | null, aba?: string) => void }) {
  const ativas = e.rotinas.filter((r) => r.ativa)
  const irPara = (r: BpoRotina) => {
    const s = secaoDaRotina(r.codigo)
    if (r.codigo === 'FIN-201') return () => onEscolher(e.clienteId, 'aprovacoes')
    if (r.codigo === 'FIN-005') return () => onEscolher(e.clienteId, 'visao')
    return s ? () => onSecao(s) : undefined
  }
  return (
    <div className="flex flex-col gap-4">
      <Caixa>
        <TituloBloco descricao={`${ativas.filter((r) => r.feita_em).length} de ${ativas.length} feitas · ${e.perfil.analista_nome} faz, ${e.perfil.responsavel_nome} confere. A seta leva aonde a rotina se faz.`}>Checklist</TituloBloco>
        {ativas.length === 0 ? (
          <EstadoVazio compacto icone={ListChecksIcon} titulo="Nenhuma rotina ativa" descricao="O Gestor configura as rotinas desta empresa em “Configurar rotinas”." />
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {cadencias.map((c) => {
              const rs = ativas.filter((r) => r.cadencia === c)
              return (
                <div key={c} className="flex min-w-0 flex-col gap-1">
                  <span className="text-muted-foreground text-xs font-medium capitalize">
                    {c} · {rs.filter((r) => r.feita_em).length}/{rs.length}
                  </span>
                  {rs.length === 0 ? (
                    <p className="text-muted-foreground px-1.5 text-xs">nenhuma</p>
                  ) : (
                    <ul className="flex flex-col gap-0.5">
                      {rs.map((r) => (
                        <ItemRotina key={r.id} e={e} r={r} onIr={irPara(r)} />
                      ))}
                    </ul>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </Caixa>
      <Calendario e={e} />
    </div>
  )
}

/** Calendário único (S08-A20): obrigações da contabilidade e rotinas do BPO juntas, uma cor por pacote. */
function Calendario({ e }: { e: EmpresaVista }) {
  const { integrante } = useTema()
  const [dia, setDia] = useState<number | null>(null)
  const corContabil = integrante('contabil').cor
  const corBpo = integrante('bpo_financeiro').cor
  const ativas = e.rotinas.filter((r) => r.ativa)
  const itensDe = (d: (typeof diasSemana)[number], i: number) => [
    ...(e.contabil ? agenda.filter((a) => a.dia === d.dia && ['fiscal', 'dp', 'contabil'].includes(a.setor)).map((a) => ({ id: a.id, t: a.titulo, cor: corContabil, c: a.codigo, pacote: 'contabilidade' })) : []),
    ...ativas.filter((r) => r.cadencia === 'diária' || (r.cadencia === 'semanal' && i === 0) || (r.cadencia === 'mensal' && i === 4)).map((r) => ({ id: `${r.id}-${d.dia}`, t: r.nome, cor: corBpo, c: r.codigo, pacote: 'BPO financeiro' })),
  ]
  const hoje = Number(hojeBpo.slice(8, 10))
  const escolhido = diasSemana.findIndex((d) => d.dia === dia)
  return (
    <Caixa>
      <TituloBloco descricao="Obrigações da contabilidade e rotinas do BPO no mesmo calendário, com uma cor por pacote. Toque num dia para ver a lista.">Calendário da empresa</TituloBloco>
      <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
        {e.contabil && (
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full" style={{ background: corContabil }} /> contabilidade
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full" style={{ background: corBpo }} /> BPO financeiro
        </span>
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        {diasSemana.map((d, i) => {
          const itens = itensDe(d, i)
          return (
            <button
              key={d.dia}
              type="button"
              aria-pressed={dia === d.dia}
              aria-label={`${d.rotulo} ${d.dia}: ${itens.length} itens`}
              onClick={() => setDia(dia === d.dia ? null : d.dia)}
              className={cn('bg-sunken/50 flex min-w-0 cursor-pointer flex-col gap-1 rounded-md p-1.5 text-left', d.dia === hoje && 'ring-foreground/20 ring-1', dia === d.dia && 'ring-foreground/50 ring-2')}
            >
              <span className="text-muted-foreground px-0.5 text-xs">
                {d.rotulo} {d.dia}
              </span>
              {itens.slice(0, 5).map((x) => (
                <Tooltip key={x.id} conteudo={`${x.c} · ${x.t}`}>
                  <span className="bg-surface flex min-w-0 items-center gap-1 rounded-sm px-1 py-0.5 text-xs">
                    <span className="size-1.5 shrink-0 rounded-full" style={{ background: x.cor }} />
                    <span className="truncate">{x.t.split(' ').slice(0, 3).join(' ')}</span>
                  </span>
                </Tooltip>
              ))}
              {itens.length > 5 && <span className="text-muted-foreground px-0.5 text-xs">+{itens.length - 5}</span>}
            </button>
          )
        })}
      </div>
      {escolhido >= 0 && (
        <ul className="divide-border/70 flex flex-col divide-y text-sm" aria-label={`Itens de ${diasSemana[escolhido].rotulo} ${diasSemana[escolhido].dia}`}>
          {itensDe(diasSemana[escolhido], escolhido).map((x) => (
            <li key={x.id} className="flex items-center gap-2 py-1.5">
              <span className="size-2 shrink-0 rounded-full" style={{ background: x.cor }} />
              <span className="min-w-0 flex-1">{x.t}</span>
              <span className="text-muted-foreground text-xs">
                {x.pacote} · {x.c}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Caixa>
  )
}

/* ---------- Sem empresa: o painel da carteira por exceção ---------- */

function LinhaCarteira({ e, onEscolher, onSecao }: { e: EmpresaVista; onEscolher: (id: string | null, aba?: string) => void; onSecao: (s: Secao) => void }) {
  const f = useFrentes(e)
  const ir = (s: Secao) => (onSecao(s), onEscolher(e.clienteId, 'rotinas'))
  const chips: { s: Secao; n: number; rotulo: string }[] = [
    { s: 'pagar', n: f.pagar, rotulo: 'a conferir ou ler' },
    { s: 'conciliacao', n: f.conciliacao, rotulo: 'no extrato' },
    { s: 'lancamentos', n: f.lancamentos, rotulo: 'para lançar no ERP' },
    { s: 'receber', n: f.receber, rotulo: 'a receber em atraso' },
  ]
  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3 text-sm">
      <span className="flex min-w-0 flex-1 basis-52 items-center gap-2">
        <span className="size-2 shrink-0 rounded-full" style={{ background: corAudit[e.audit.cor] }} aria-hidden />
        <span className="min-w-0">
          <span className="block truncate">{e.nome}</span>
          <span className="text-muted-foreground block text-xs">
            {rotuloCor[e.audit.cor]} · {e.perfil.analista_nome} · {e.erp.provedor}
          </span>
        </span>
      </span>
      <span className="flex w-28 flex-col gap-1" title={`${f.feitas} de ${f.total} rotinas feitas`}>
        <span className="text-muted-foreground text-xs">
          checklist {f.feitas}/{f.total}
        </span>
        <span className="bg-sunken h-1.5 overflow-hidden rounded-full">
          <span className="bg-foreground/60 block h-full rounded-full" style={{ width: `${f.total ? (f.feitas / f.total) * 100 : 0}%` }} />
        </span>
      </span>
      <span className="flex flex-wrap gap-1">
        {chips
          .filter((c) => c.n > 0)
          .map((c) => (
            <button key={c.s} type="button" onClick={() => ir(c.s)} className="bg-sunken/70 hover:bg-sunken cursor-pointer rounded-full px-2.5 py-1 text-xs">
              <span className="tabular-nums">{c.n}</span> {c.rotulo}
            </button>
          ))}
        <button type="button" onClick={() => ir('fechamento')} className="cursor-pointer">
          <Badge variant={f.fechado ? 'sucesso' : 'outline'}>{f.fechado ? `${rotuloCompetencia(COMPETENCIA_FECHAMENTO).split(' ')[0]} fechado` : `${rotuloCompetencia(COMPETENCIA_FECHAMENTO).split(' ')[0]} aberto`}</Badge>
        </button>
      </span>
      <Button size="sm" variant="ghost" className="rounded-full" onClick={() => (onSecao('hoje'), onEscolher(e.clienteId, 'rotinas'))}>
        Abrir <ArrowRightIcon />
      </Button>
    </li>
  )
}

function precisaAtencao(e: EmpresaVista) {
  return e.audit.cor !== 'verde' || e.rotinas.some((r) => r.ativa && r.cadencia === 'diária' && !r.feita_em) || e.transacoes.length > 0
}

function RotinasCarteira({ empresas, onEscolher, onSecao }: { empresas: EmpresaVista[]; onEscolher: (id: string | null, aba?: string) => void; onSecao: (s: Secao) => void }) {
  const [todas, setTodas] = useState(false)
  const visiveis = todas ? empresas : empresas.filter(precisaAtencao)
  const recolhidas = empresas.length - visiveis.length
  const marcar = useMarcar()
  const pendentesHoje = empresas.flatMap((e) => e.rotinas.filter((r) => r.ativa && r.cadencia === 'diária' && !r.feita_em).map((r) => ({ e, r })))
  return (
    <PaginaBpo>
      <CabecalhoBpo integrante="i-bpo-conciliacao" titulo="Rotinas" sub="O dia de cada empresa: o que já foi feito e o que falta, por exceção" status={`${pendentesHoje.length} rotina${pendentesHoje.length === 1 ? '' : 's'} do dia por fazer na carteira`} />
      <Caixa>
        <TituloBloco descricao="Só as empresas fora do verde ou com algo por fazer hoje. Toque num número para ir direto à seção.">Carteira hoje</TituloBloco>
        {empresas.length === 0 ? (
          <EstadoVazio compacto icone={ListChecksIcon} titulo="Nenhuma empresa no BPO" descricao="Ponha uma empresa no BPO pela Carteira: as rotinas nascem com a implantação." />
        ) : visiveis.length === 0 ? (
          <EstadoVazio compacto icone={ListChecksIcon} titulo="Tudo em dia" descricao="Nenhuma empresa com rotina do dia por fazer ou fora do verde." />
        ) : (
          <ul className="divide-border/70 flex flex-col divide-y" aria-label="Rotinas da carteira">
            {visiveis.map((e) => (
              <LinhaCarteira key={e.clienteId} e={e} onEscolher={onEscolher} onSecao={onSecao} />
            ))}
          </ul>
        )}
        {recolhidas > 0 && (
          <button type="button" className="text-muted-foreground flex w-fit cursor-pointer items-center gap-1.5 text-xs" onClick={() => setTodas(true)}>
            <CaretDownIcon /> {recolhidas} empresa{recolhidas > 1 ? 's' : ''} em dia com as rotinas
          </button>
        )}
      </Caixa>
      {pendentesHoje.length > 0 && (
        <Caixa>
          <TituloBloco descricao="Marque daqui mesmo; fica registrado quem marcou e quando.">Rotinas do dia por fazer</TituloBloco>
          <ul className="grid gap-x-4 gap-y-0.5 md:grid-cols-2">
            {pendentesHoje.map(({ e, r }) => (
              <li key={r.id}>
                <label className="hover:bg-raised/50 flex cursor-pointer items-start gap-2.5 rounded-md px-1.5 py-1.5 text-sm">
                  <input type="checkbox" checked={false} onChange={() => marcar(e, r, true)} className="accent-foreground mt-0.5 size-4 shrink-0" aria-label={`${r.nome} · ${e.nome}`} />
                  <span className="min-w-0 flex-1">
                    <span className="block">{r.nome}</span>
                    <span className="text-muted-foreground block text-xs">
                      {e.nome} · {r.quando} · {r.codigo}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </Caixa>
      )}
    </PaginaBpo>
  )
}

/* ---------- Configurar rotina (S08-A21): itens, periodicidade, ordem, ativar, excluir ---------- */

function ConfigurarRotinas({ e, onFechar }: { e: EmpresaVista; onFechar: () => void }) {
  const executar = useAcao()
  const confirmar = useConfirmar()
  const loja = useLoja()
  const podeConfigurar = usePode('rotina.configurar', { cliente_id: e.clienteId })
  const [nova, setNova] = useState({ nome: '', cadencia: 'diária' as BpoRotina['cadencia'], quando: 'hoje', codigo: 'FIN-201' })
  const [tentou, setTentou] = useState(false)
  return (
    <GavetaFormulario
      aberta
      onFechar={onFechar}
      largura="lg"
      titulo={`Rotinas · ${e.nome}`}
      descricao="Arraste para mudar a ordem; clique no nome para editar. Vale só para esta empresa; desligar tira do checklist sem perder o histórico."
      acao="Adicionar rotina"
      acaoDesabilitada={!podeConfigurar}
      onAcao={() => {
        setTentou(true)
        if (!nova.nome.trim()) return
        const ok = executar(() => repos.bpo.rotinas.criar({ cliente_id: e.clienteId, ...nova, nome: nova.nome.trim(), ativa: true }), { sucesso: 'Rotina adicionada' })
        if (ok) {
          setNova((x) => ({ ...x, nome: '' }))
          setTentou(false)
        }
      }}
    >
      {e.rotinas.length === 0 && <EstadoVazio compacto icone={ListChecksIcon} titulo="Nenhuma rotina" descricao="Adicione a primeira abaixo." />}
      <ListaOrdenavel
        itens={e.rotinas}
        idDe={(r) => r.id}
        rotuloDe={(r) => r.nome}
        onReordenar={(ids) => executar(() => repos.bpo.rotinas.reordenar(ids))}
        render={(r) => (
          <div className={cn('bg-sunken/50 flex flex-wrap items-center gap-2 rounded-md px-2 py-1.5 text-sm', !r.ativa && 'opacity-60')}>
            <span className="min-w-0 flex-1 basis-48">
              <EdicaoEmLinha valor={r.nome} rotulo="Nome da rotina" onSalvar={(v) => void executar(() => repos.bpo.rotinas.atualizar(r.id, { nome: v }), { sucesso: 'Rotina renomeada' })} />
              <span className="text-muted-foreground block text-xs">
                {r.codigo} · {r.quando}
              </span>
            </span>
            <span className="w-28">
              <CampoEscolha rotulo={`Periodicidade de ${r.nome}`} valor={r.cadencia} onMudar={(v) => executar(() => repos.bpo.rotinas.atualizar(r.id, { cadencia: v }))} opcoes={cadencias.map((c) => ({ valor: c, rotulo: c }))} />
            </span>
            <Interruptor ocultarRotulo rotulo={`Rotina ativa: ${r.nome}`} ligado={r.ativa} onMudar={(v) => executar(() => repos.bpo.rotinas.atualizar(r.id, { ativa: v }))} />
            <Button
              size="icon-sm"
              variant="ghost"
              className="rounded-full"
              aria-label={`Excluir ${r.nome}`}
              onClick={async () => {
                const ok = await confirmar({ titulo: `Excluir “${r.nome}”?`, descricao: 'Some do checklist desta empresa. As marcas já feitas ficam nos eventos.', acao: 'Excluir', perigo: true })
                if (ok !== true) return
                const antes = executar(() => repos.bpo.rotinas.excluir(r.id))
                if (antes) loja.toastDesfazer('Rotina excluída', () => banco.transacao((tx) => tx.gravar('bpo_rotina', { ...antes, atualizado_em: agora() })))
              }}
            >
              <TrashIcon />
            </Button>
          </div>
        )}
      />
      <div className="border-border/70 flex flex-col gap-2 border-t pt-3">
        <span className="flex items-center gap-1.5 text-sm font-medium">
          <ListChecksIcon /> Nova rotina
        </span>
        <Campo rotulo="Nome" erro={tentou && !nova.nome.trim() ? 'Dê um nome à rotina.' : undefined}>
          {(id) => <CampoTexto id={id} valor={nova.nome} onMudar={(v) => setNova((x) => ({ ...x, nome: v }))} placeholder="Ex.: Conferir as notas de entrada" />}
        </Campo>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <Campo rotulo="Periodicidade">{(id) => <CampoEscolha id={id} valor={nova.cadencia} onMudar={(v) => setNova((x) => ({ ...x, cadencia: v }))} opcoes={cadencias.map((c) => ({ valor: c, rotulo: c }))} />}</Campo>
          <Campo rotulo="Quando">{(id) => <CampoTexto id={id} valor={nova.quando} onMudar={(v) => setNova((x) => ({ ...x, quando: v }))} />}</Campo>
          <Campo rotulo="Código">
            {(id) => (
              <CampoEscolha
                id={id}
                valor={nova.codigo}
                onMudar={(v) => setNova((x) => ({ ...x, codigo: v }))}
                opcoes={[
                  { valor: 'FIN-003', rotulo: 'FIN-003 · capturar contas' },
                  { valor: 'FIN-201', rotulo: 'FIN-201 · fila de pagamento' },
                  { valor: 'FIN-004', rotulo: 'FIN-004 · conciliação' },
                  { valor: 'FIN-005', rotulo: 'FIN-005 · fluxo de caixa' },
                  { valor: 'FIN-006', rotulo: 'FIN-006 · DRE gerencial' },
                  { valor: 'BPO-013', rotulo: 'BPO-013 · qualidade e fechamento' },
                ]}
              />
            )}
          </Campo>
        </div>
      </div>
    </GavetaFormulario>
  )
}

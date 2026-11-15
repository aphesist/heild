import { ArrowCounterClockwiseIcon, ArrowRightIcon, BellRingingIcon, CaretDownIcon, CheckIcon, ClockIcon, LinkIcon, MagnifyingGlassIcon, PaperclipIcon, PlusIcon, TrayIcon, UserIcon } from '@phosphor-icons/react'
import { useMemo, useState } from 'react'
import { usePersistente } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import { BotaoAcoes, EstadoVazio, Quadro, SePode, useAcao, useConfirmar, usePode, type AcaoMenu } from '@/components/kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Campo, CampoArea, CampoEscolha, CampoTexto, GavetaFormulario, Interruptor, Segmentado } from '@/components/ui/formulario'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import type { BolaBpo, BpoItemFila, Evento } from '@/nucleo/modelo/entidades'
import { useTabela } from '@/nucleo/react'
import { repos } from '@/nucleo/repositorios'
import { documentosBpo, filaOperacao, notasDe } from '@/nucleo/repositorios/s08b-operacao'
import { SeloTitular } from '../../financeiro/pecas'
import { BotaoErp, brl, CabecalhoBpo, Caixa, PaginaBpo, TituloBloco, type PropsBpo } from '../comum'
import { dataCurta, dataHora, diasAte, hojeBpo, quando, useBpo, type EmpresaVista } from '../dados'
import { usePedirBpo } from '../integrantes'
import { rotuloBola, slaDe, useAcoesFila } from './comum-fila'
import { bolaDesde, bolaParada, horasDesde, noDiaDaDemo, motivoRisco, riscoDe, rotuloCanal, rotuloTipoItem, textoHoras, useDocumentosBpo, useHistorico } from './dados'
import { CaixaDocumentos } from './documentos'
import { usePedirOperacao, useTrabalhandoEm } from './integrantes'
import { AreaRolagem } from '@/components/ui/area-rolagem'

type FiltroBola = 'todas' | 'bpo' | 'cliente' | 'terceiro'
type FiltroTipo = 'todos' | BpoItemFila['tipo']
type Atalho = 'estourado' | 'hoje' | 'incompleto' | 'parada' | null
type Linha = { e: EmpresaVista; f: BpoItemFila }

/** Seção das Rotinas que a Fila abre (lançamentos no ERP, por exemplo). */
export const CHAVE_SECAO_ROTINAS = 's08b:rotinas:secao'

/**
 * BPO › Fila e pedidos (S08-T03; 10, 4.3 e 5.3; BPO-009 e BPO-010): os pedidos
 * dos clientes e da equipe, os documentos chegando e as pendências da operação,
 * com quem está com a bola e o SLA (que só começa com o pedido completo e pausa
 * com a bola fora). Gestão por exceção; ordem por prazo ou pelo risco que o
 * integrante calcula; lista ou por responsável (arrastar reatribui, só Gestor).
 */
export function FilaBpoTela({ empresa, onEscolher }: PropsBpo) {
  const { empresas } = useBpo()
  const { usuario, permissoes } = useSessao()
  const eventos = useTabela('evento')
  const tFila = useTabela('bpo_item_fila')
  const acoes = useAcoesFila()
  const podeReatribuir = usePode('fila.reatribuir')
  const membro = !podeReatribuir
  const [bola, setBola] = useState<FiltroBola>('todas')
  const [tipo, setTipo] = useState<FiltroTipo>('todos')
  const [minhas, setMinhas] = usePersistente<boolean>(`s08b:fila:minhas:${usuario.id}`, membro)
  const [ordem, setOrdem] = usePersistente<'prazo' | 'risco'>('s08b:fila:ordem', 'prazo')
  const [visao, setVisao] = useState<'lista' | 'responsavel'>('lista')
  const [excecao, setExcecao] = useState(true)
  const [atalho, setAtalho] = useState<Atalho>(null)
  const [busca, setBusca] = useState('')
  const [novo, setNovo] = useState(false)
  const [aberto, setAberto] = useState<string | null>(null)
  const [verResolvidos, setVerResolvidos] = useState(false)
  const lista = empresa ? [empresa] : empresas
  const base: Linha[] = lista.flatMap((e) => e.fila.map((f) => ({ e, f })))
  const emDia = ({ e, f }: Linha) => e.audit.cor === 'verde' && diasAte(f.prazo) > 0 && !f.faltando.length
  const atalhoOk = ({ f }: Linha) => (atalho === 'estourado' ? f.bola === 'bpo' && !f.faltando.length && diasAte(f.prazo) < 0 : atalho === 'hoje' ? diasAte(f.prazo) === 0 : atalho === 'incompleto' ? f.faltando.length > 0 : atalho === 'parada' ? !!bolaParada(f, eventos) : true)
  const termo = busca.trim().toLowerCase()
  const filtrada = base
    .filter((x) => (bola === 'todas' || x.f.bola === bola || (bola === 'cliente' && (x.f.bola === 'contratante' || x.f.bola === 'cliente_final'))) && (tipo === 'todos' || x.f.tipo === tipo))
    .filter((x) => !minhas || x.f.responsavel_nome === usuario.nome)
    .filter((x) => !excecao || empresa || atalho || termo || !emDia(x))
    .filter(atalhoOk)
    .filter((x) => !termo || `${x.f.texto} ${x.e.nome} ${x.f.detalhe ?? ''} ${x.f.responsavel_nome ?? ''}`.toLowerCase().includes(termo))
    .sort((a, b) => (ordem === 'risco' ? riscoDe(b.e, b.f, eventos) - riscoDe(a.e, a.f, eventos) : a.f.prazo.localeCompare(b.f.prazo)))
  const recolhidos = !empresa && excecao && !atalho && !termo ? base.filter((x) => emDia(x) && (!minhas || x.f.responsavel_nome === usuario.nome)).length : 0
  const ids = new Set(lista.map((e) => e.clienteId))
  const resolvidosHoje = useMemo(() => tFila.filter((f) => f.cliente_id && ids.has(f.cliente_id) && f.situacao === 'resolvido' && f.atualizado_em.slice(0, 10) >= hojeBpo.slice(0, 8) + '01').sort((a, b) => b.atualizado_em.localeCompare(a.atualizado_em)), [tFila, lista]) // eslint-disable-line react-hooks/exhaustive-deps
  const conta = (p: (x: Linha) => boolean) => base.filter(p).length
  const resumo = [
    { id: 'estourado' as const, n: conta(({ f }) => f.bola === 'bpo' && !f.faltando.length && diasAte(f.prazo) < 0), rotulo: 'SLA estourado', tom: 'erro' as const },
    { id: 'hoje' as const, n: conta(({ f }) => diasAte(f.prazo) === 0), rotulo: 'vencem hoje', tom: 'destaque' as const },
    { id: 'incompleto' as const, n: conta(({ f }) => f.faltando.length > 0), rotulo: 'sem completude', tom: 'outline' as const },
    { id: 'parada' as const, n: conta(({ f }) => !!bolaParada(f, eventos)), rotulo: 'bola parada', tom: 'outline' as const },
  ]
  const comCliente = base.filter(({ f }) => f.bola !== 'bpo')
  const esperaMedia = comCliente.length ? comCliente.reduce((s, { f }) => s + horasDesde(bolaDesde(f, eventos)), 0) / comCliente.length : 0
  const sla = lista.length ? Math.round(lista.reduce((s, e) => s + e.perfil.sla.mes, 0) / lista.length) : 0
  const itemAberto = aberto ? base.find((x) => x.f.id === aberto) ?? (() => { const f = tFila.find((x) => x.id === aberto); const e = f && lista.find((x) => x.clienteId === f.cliente_id); return f && e ? { e, f } : undefined })() : undefined

  return (
    <PaginaBpo>
      <CabecalhoBpo
        titulo="Fila e pedidos"
        sub={empresa ? `${empresa.nome} · pedidos pelo app, WhatsApp e e-mail viram item com prazo` : 'Pedidos dos clientes e da equipe, documentos chegando e pendências da operação'}
        status={`${base.filter((x) => x.f.bola === 'bpo').length} conosco, ${comCliente.length} fora${ordem === 'risco' ? ' · ordenei por risco' : ''}`}
      >
        {empresa && <SeloTitular titular={{ tipo: 'empresa', clienteId: empresa.clienteId, nome: empresa.nome }} />}
        <SePode ferramenta="fila.criar">
          <Button size="sm" className="rounded-full" onClick={() => setNovo(true)}>
            <PlusIcon /> Pedido
          </Button>
        </SePode>
      </CabecalhoBpo>

      <div className="flex flex-wrap items-center gap-2" aria-label="Resumo da fila">
        {resumo.map((r) => (
          <button
            key={r.id}
            type="button"
            aria-pressed={atalho === r.id}
            onClick={() => setAtalho((a) => (a === r.id ? null : r.id))}
            className={cn('bg-surface shadow-cartao flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-sm transition-colors', atalho === r.id && 'ring-foreground/40 ring-2', r.n === 0 && 'text-muted-foreground grayscale')}
          >
            <Badge variant={r.n ? r.tom : 'outline'} className="tabular-nums">
              {r.n}
            </Badge>
            {r.rotulo}
          </button>
        ))}
        <span className="text-muted-foreground ml-auto text-xs">
          SLA do mês {sla}% · bola fora há {textoHoras(esperaMedia)} em média
        </span>
      </div>

      <CaixaDocumentos empresas={lista} mostrarEmpresa={!empresa} onEscolher={onEscolher} />

      <Caixa>
        <div className="flex flex-wrap items-center gap-2">
          <Segmentado
            rotulo="Com quem está a bola"
            valor={bola}
            onMudar={setBola}
            opcoes={[
              { valor: 'todas', rotulo: `Todos (${base.length})` },
              { valor: 'bpo', rotulo: 'Conosco' },
              { valor: 'cliente', rotulo: 'Com o cliente' },
              { valor: 'terceiro', rotulo: 'Terceiro' },
            ]}
          />
          <span className="w-36">
            <CampoEscolha
              rotulo="Tipo de item"
              valor={tipo}
              onMudar={setTipo}
              opcoes={[
                { valor: 'todos', rotulo: 'Todos os tipos' },
                { valor: 'pedido', rotulo: 'Pedidos' },
                { valor: 'pagamento', rotulo: 'Pagamentos' },
                { valor: 'pendencia', rotulo: 'Pendências' },
              ]}
            />
          </span>
          <span className="w-36">
            <CampoEscolha
              rotulo="Ordem da fila"
              valor={ordem}
              onMudar={setOrdem}
              opcoes={[
                { valor: 'prazo', rotulo: 'Por prazo' },
                { valor: 'risco', rotulo: 'Por risco' },
              ]}
            />
          </span>
          <Segmentado
            rotulo="Visão da fila"
            valor={visao}
            onMudar={setVisao}
            opcoes={[
              { valor: 'lista', rotulo: 'Lista' },
              { valor: 'responsavel', rotulo: 'Por responsável' },
            ]}
          />
          <span className="relative w-full sm:w-48">
            <MagnifyingGlassIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2" />
            <CampoTexto aria-label="Buscar na fila" valor={busca} onMudar={setBusca} placeholder="Buscar" className="pl-9" />
          </span>
          <span className="flex flex-wrap items-center gap-3 sm:ml-auto">
            <Interruptor ligado={minhas} onMudar={setMinhas} rotulo="Só as minhas" />
            {!empresa && <Interruptor ligado={excecao} onMudar={setExcecao} rotulo="Só fora do verde" />}
          </span>
        </div>
        {filtrada.length === 0 && (
          <EstadoVazio
            compacto
            icone={TrayIcon}
            titulo={base.length === 0 ? 'A fila está vazia' : 'Nada com esses filtros'}
            descricao={base.length === 0 ? 'Pedidos do app, WhatsApp e e-mail viram item aqui, com prazo e SLA.' : minhas ? 'Nenhum item seu com esses filtros.' : 'Troque o filtro da bola, o tipo ou a busca.'}
            acao={
              base.length > 0 && (
                <Button size="sm" variant="outline" className="rounded-full" onClick={() => (setBola('todas'), setTipo('todos'), setAtalho(null), setBusca(''), setMinhas(false))}>
                  Limpar os filtros
                </Button>
              )
            }
          />
        )}
        {visao === 'lista' ? (
          <ul className="divide-border/70 flex flex-col divide-y" aria-label="Fila do BPO">
            {filtrada.map(({ e, f }) => (
              <ItemFila key={f.id} e={e} f={f} eventos={eventos} risco={ordem === 'risco' ? motivoRisco(e, f, eventos) : ''} mostrarEmpresa={!empresa} menu={acoes.menu(f, ['bpo', 'cliente', 'terceiro'])} onAbrir={() => setAberto(f.id)} onEscolher={onEscolher} />
            ))}
          </ul>
        ) : (
          <Quadro
            colunas={acoes.equipe.map((u) => ({ id: u.nome, titulo: `${u.nome} (${filtrada.filter((x) => x.f.responsavel_nome === u.nome).length})` }))}
            itens={filtrada}
            idDe={(x) => x.f.id}
            colunaDe={(x) => x.f.responsavel_nome ?? ''}
            rotuloDe={(x) => x.f.texto}
            desabilitado={!podeReatribuir}
            onMover={(id, coluna) => acoes.executar(() => repos.bpo.fila.reatribuir(id, coluna), { sucesso: `Reatribuído a ${coluna}` })}
            render={({ e, f }) => {
              const s = slaDe(f)
              return (
                <button type="button" className="flex w-full cursor-pointer flex-col gap-1 text-left text-sm" onClick={() => setAberto(f.id)}>
                  <span>{f.texto}</span>
                  <span className="text-muted-foreground text-xs">
                    {e.nome} · {rotuloBola[f.bola]} · {quando(f.prazo)}
                  </span>
                  <span className={cn('text-xs', s.tom === 'erro' ? 'text-destructive-text' : s.tom === 'atencao' ? 'text-warning-text' : 'text-muted-foreground')}>{s.texto}</span>
                </button>
              )
            }}
          />
        )}
        {visao === 'responsavel' && !podeReatribuir && <p className="text-muted-foreground text-xs">Só o Gestor do BPO reatribui (arrastando ou pelo menu).</p>}
        {recolhidos > 0 && (
          <button type="button" className="text-muted-foreground flex w-fit cursor-pointer items-center gap-1.5 text-xs" onClick={() => setExcecao(false)}>
            <CaretDownIcon /> {recolhidos} item{recolhidos > 1 ? 's' : ''} de empresas em dia
          </button>
        )}
        {permissoes.abas.bpo?.includes('volume') && <p className="text-muted-foreground text-xs">O integrante reordena por risco e avisa a bola parada; a resposta média do cliente entra no SLA do mês (Entregas).</p>}
      </Caixa>

      {resolvidosHoje.length > 0 && (
        <Caixa>
          <button type="button" className="flex w-full cursor-pointer items-center justify-between gap-2 text-left" aria-expanded={verResolvidos} onClick={() => setVerResolvidos((v) => !v)}>
            <TituloBloco descricao="Nada se apaga: o resolvido fica com quem resolveu e como; reabrir pede o motivo.">Resolvidos neste mês ({resolvidosHoje.length})</TituloBloco>
            <CaretDownIcon className={cn('shrink-0 transition-transform', verResolvidos && 'rotate-180')} />
          </button>
          {verResolvidos && (
            <ul className="divide-border/70 flex flex-col divide-y" aria-label="Resolvidos">
              {resolvidosHoje.map((f) => (
                <LinhaResolvida key={f.id} f={f} e={lista.find((x) => x.clienteId === f.cliente_id)} mostrarEmpresa={!empresa} onAbrir={() => setAberto(f.id)} />
              ))}
            </ul>
          )}
        </Caixa>
      )}

      <NovoPedido aberto={novo} onFechar={() => setNovo(false)} empresas={lista} />
      {itemAberto && <GavetaItemFila e={itemAberto.e} f={itemAberto.f} onFechar={() => setAberto(null)} onEscolher={onEscolher} />}
    </PaginaBpo>
  )
}

function LinhaResolvida({ f, e, mostrarEmpresa, onAbrir }: { f: BpoItemFila; e?: EmpresaVista; mostrarEmpresa: boolean; onAbrir: () => void }) {
  const executar = useAcao()
  const confirmar = useConfirmar()
  const nota = [...notasDe(f)].reverse().find((n) => n.tipo === 'resolucao')
  return (
    <li className="flex flex-wrap items-center gap-3 py-2.5 text-sm">
      <button type="button" className="min-w-0 flex-1 basis-56 cursor-pointer text-left" onClick={onAbrir}>
        <span className="text-muted-foreground block line-through">{f.texto}</span>
        <span className="text-muted-foreground block truncate text-xs">
          {mostrarEmpresa && e && `${e.nome} · `}
          {f.responsavel_nome} · {dataHora(noDiaDaDemo(f.atualizado_em))}
          {nota && ` · ${nota.texto}`}
        </span>
      </button>
      <SePode ferramenta="fila.atualizar">
        <Button
          size="sm"
          variant="ghost"
          className="rounded-full"
          onClick={async () => {
            const motivo = await confirmar({ titulo: `Reabrir “${f.texto}”?`, descricao: 'Volta para a fila com quem estava; o SLA conta de novo.', acao: 'Reabrir', exigirMotivo: true, rotuloMotivo: 'Por que reabrir?' })
            if (typeof motivo === 'string') executar(() => filaOperacao.reabrir(f.id, motivo), { sucesso: 'Reaberto' })
          }}
        >
          <ArrowCounterClockwiseIcon /> Reabrir
        </Button>
      </SePode>
    </li>
  )
}

/* ---------- Executar item (S08-A16): conforme a função ---------- */

const ehPague = (f: BpoItemFila) => f.tipo === 'pedido' && /pag/i.test(f.texto)
const ehReceber = (f: BpoItemFila) => /boleto|cobran|receb/i.test(f.texto) && !/pag/i.test(f.texto)
const ehErp = (f: BpoItemFila) => /religar|autoriz|sincroniz/i.test(f.texto)
export const fornecedorDoPedido = (texto: string) =>
  texto
    .replace(/[“”"]/g, '')
    .replace(/^pague[m]?\s+(a|o|as|os)?\s*/i, '')
    .replace(/^(conserto|serviço)\s+d[oa]\s+\w+\s+d[ao]\s+/i, '')
    .replace(/\s+(amanhã|hoje|na sexta|até .*)$/i, '')
    .trim()

function useExecutar(e: EmpresaVista, f: BpoItemFila, onEscolher: (id: string | null, aba?: string) => void, onLancar: () => void) {
  const executar = useAcao()
  const confirmar = useConfirmar()
  const pedirReceber = usePedirOperacao()
  const [, setSecao] = usePersistente<string>(CHAVE_SECAO_ROTINAS, 'hoje')
  if (f.situacao !== 'aberto' || f.faltando.length) return null
  if (f.tipo === 'pagamento') return { rotulo: 'Ver em Aprovações', ferramenta: 'bpo.ler', icone: <ArrowRightIcon />, fazer: () => onEscolher(e.clienteId, 'aprovacoes') }
  if (ehPague(f) && f.valor) return { rotulo: 'Lançar a conta', ferramenta: 'conta_pagar.capturar', icone: <PlusIcon />, fazer: onLancar }
  if (f.codigo === 'FIN-004' && e.erp.modo === 'E2' && /lan[çc]ar|baixa/i.test(f.texto)) return { rotulo: `Lançar no ${e.erp.provedor}`, ferramenta: 'erp.baixar', icone: <ArrowRightIcon />, fazer: () => (setSecao('lancamentos'), onEscolher(e.clienteId, 'rotinas')) }
  if (f.codigo === 'FIN-004' && /saldo|conferir|diferen/i.test(f.texto)) return { rotulo: 'Abrir a conciliação', ferramenta: 'conciliacao.confirmar', icone: <ArrowRightIcon />, fazer: () => (setSecao('conciliacao'), onEscolher(e.clienteId, 'rotinas')) }
  if (ehErp(f) && f.bola === 'bpo') return { rotulo: 'Abrir a ficha do ERP', ferramenta: 'bpo.ler', icone: <ArrowRightIcon />, fazer: () => onEscolher(e.clienteId, 'carteira') }
  if (ehReceber(f) && f.bola === 'bpo' && !notasDe(f).some((n) => /preparei/i.test(n.texto)))
    return {
      rotulo: 'Pedir ao Contas a Receber',
      ferramenta: 'conta_receber.cobrar',
      icone: <ArrowRightIcon />,
      fazer: () =>
        pedirReceber({
          integrante: 'i-bpo-receber',
          titulo: `Preparar: ${f.texto}`,
          cliente: e.nome,
          inicio: `Vou preparar no ${e.erp.provedor} o que o pedido pede. Não envio nada ao cliente do cliente: o Atendimento manda depois da revisão.`,
          etapas: [`Lendo as contas a receber no ${e.erp.provedor}`, 'Montando os boletos em rascunho', 'Separando o que precisa de revisão'],
          fim: { texto: `Preparei em rascunho no ${e.erp.provedor}. Falta uma pessoa revisar e marcar como resolvido.`, aviso: `Contas a Receber preparou: ${f.texto}` },
          efeito: { tipo: 'preparar', filaId: f.id, nota: `Preparei em rascunho no ${e.erp.provedor} (Contas a Receber). A emissão pela subconta da empresa é de fase posterior (B13): hoje sai pelo ERP, depois da revisão.` },
        }),
    }
  if (f.bola === 'bpo')
    return {
      rotulo: 'Resolvido',
      ferramenta: 'fila.atualizar',
      icone: <CheckIcon />,
      fazer: async () => {
        const nota = await confirmar({ titulo: `Resolver “${f.texto}”?`, descricao: 'Sai da fila e fica nos resolvidos, com a sua anotação.', acao: 'Resolver', exigirMotivo: true, rotuloMotivo: 'Como foi resolvido (fica no histórico)' })
        if (typeof nota === 'string') executar(() => filaOperacao.resolver(f.id, nota), { sucesso: `Resolvido: ${f.texto}` })
      },
    }
  return null
}

function ItemFila({ e, f, eventos, risco, mostrarEmpresa, menu, onAbrir, onEscolher }: { e: EmpresaVista; f: BpoItemFila; eventos: Evento[]; risco: string; mostrarEmpresa: boolean; menu: AcaoMenu[]; onAbrir: () => void; onEscolher: (id: string | null, aba?: string) => void }) {
  const executar = useAcao()
  const [lancar, setLancar] = useState(false)
  const trabalhando = useTrabalhandoEm()
  const sla = slaDe(f)
  const parada = bolaParada(f, eventos)
  const acao = useExecutar(e, f, onEscolher, () => setLancar(true))
  const notas = notasDe(f).length
  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3 text-sm" data-item={f.id}>
      <button type="button" className="min-w-0 flex-1 basis-64 cursor-pointer text-left" onClick={onAbrir} aria-label={`Abrir ${f.texto}`}>
        <span className="flex items-center gap-2">
          <span className="min-w-0">{f.texto}</span>
          {f.tipo !== 'pedido' && <Badge variant="outline">{rotuloTipoItem[f.tipo]}</Badge>}
        </span>
        <span className="text-muted-foreground block truncate text-xs">
          {mostrarEmpresa && `${e.nome} · `}
          {f.codigo} · {rotuloCanal[f.canal]} · {f.responsavel_nome}
          {f.detalhe && ` · ${f.detalhe}`}
          {notas > 0 && ` · ${notas} anotaç${notas > 1 ? 'ões' : 'ão'}`}
        </span>
        <span className={cn('block text-xs', sla.tom === 'erro' ? 'text-destructive-text' : sla.tom === 'atencao' ? 'text-warning-text' : 'text-muted-foreground')}>
          {sla.texto}
          {parada && <span className="text-warning-text"> · bola parada há {textoHoras(parada)}</span>}
          {risco && <span className="text-muted-foreground"> · risco: {risco}</span>}
        </span>
      </button>
      <Badge variant={f.bola === 'bpo' ? 'destaque' : 'outline'}>{rotuloBola[f.bola]}</Badge>
      <span className="text-muted-foreground w-12 text-right text-xs">{quando(f.prazo)}</span>
      {trabalhando(f.id) ? (
        <span className="text-muted-foreground text-xs" role="status">
          o integrante está cuidando…
        </span>
      ) : f.faltando.length > 0 ? (
        f.faltando.map((x) => (
          <Button key={x} size="sm" variant="outline" className="rounded-full" onClick={() => executar(() => repos.bpo.fila.completar(f.id, x), { sucesso: `Chegou: ${x}` })}>
            <CheckIcon /> Chegou {x}
          </Button>
        ))
      ) : acao ? (
        <SePode ferramenta={acao.ferramenta} alvo={{ cliente_id: e.clienteId }}>
          <Button size="sm" variant="outline" className="rounded-full" onClick={() => void acao.fazer()}>
            {acao.icone} {acao.rotulo}
          </Button>
        </SePode>
      ) : null}
      <BotaoAcoes rotulo={`Ações de ${f.texto}`} acoes={menu} />
      <BotaoErp e={e} oque={f.texto} />
      {lancar && <GavetaLancarConta e={e} f={f} onFechar={() => setLancar(false)} />}
    </li>
  )
}

/** "Pague o fornecedor X" vira conta lançada; quem lança é quem digitou (outra pessoa confere em Aprovações). */
function GavetaLancarConta({ e, f, onFechar }: { e: EmpresaVista; f: BpoItemFila; onFechar: () => void }) {
  const executar = useAcao()
  const { usuario } = useSessao()
  const docs = useDocumentosBpo([e.clienteId]).filter((d) => d.fila_id === f.id && d.leitura)
  const doc = docs[0]
  const [r, setR] = useState({ fornecedor: doc?.leitura?.fornecedor ?? fornecedorDoPedido(f.texto), valor: String(doc?.leitura?.valor ?? f.valor ?? ''), vencimento: doc?.leitura?.vencimento ?? f.prazo, categoria: doc?.leitura?.categoria ?? 'Despesas gerais' })
  const erro = !r.fornecedor.trim() ? 'Informe o fornecedor.' : !(Number(r.valor) > 0) ? 'O valor precisa ser maior que zero.' : !r.vencimento ? 'Informe o vencimento.' : undefined
  return (
    <GavetaFormulario
      aberta
      onFechar={onFechar}
      titulo="Lançar a conta do pedido"
      descricao={`${e.nome} · “${f.texto.replace(/[“”]/g, '')}”. Você digita; outra pessoa do BPO confere em Aprovações (quem digita não confere).`}
      acao="Lançar a conta"
      acaoDesabilitada={!!erro}
      onAcao={() => {
        const ok = executar(
          () => {
            const ajuste = { fornecedor: r.fornecedor.trim(), valor: Number(r.valor), vencimento: r.vencimento, categoria: r.categoria }
            if (doc) documentosBpo.lancar(doc.id, { ajuste })
            else {
              if (!e.fornecedores.some((x) => x.nome.toLowerCase() === ajuste.fornecedor.toLowerCase())) repos.bpo.fornecedores.criar({ cliente_id: e.clienteId, nome: ajuste.fornecedor, risco: 'novo', banco: 'a confirmar por segundo canal' })
              repos.bpo.contas.capturar({ cliente_id: e.clienteId, contraparte: ajuste.fornecedor, categoria: ajuste.categoria, valor: ajuste.valor, vencimento: ajuste.vencimento, origem: rotuloCanal[f.canal], lancar_no_erp: e.erp.modo === 'E2', alerta: e.fornecedores.some((x) => x.nome.toLowerCase() === ajuste.fornecedor.toLowerCase()) ? null : 'fornecedor novo: confirmar os dados bancários por segundo canal antes do lote', extras: { fila_id: f.id } })
            }
            return filaOperacao.resolver(f.id, `Conta lançada por ${usuario.nome} (${brl(ajuste.valor)}); a conferência é de outra pessoa, em Aprovações`)
          },
          { sucesso: `Conta lançada por ${usuario.nome}: outra pessoa confere em Aprovações` },
        )
        if (ok) onFechar()
      }}
    >
      {doc && <p className="bg-sunken/60 rounded-md px-3 py-2 text-xs">Preenchido com a leitura de {doc.nome_arquivo} ({doc.lido_por}).</p>}
      <Campo rotulo="Fornecedor">{(id) => <CampoTexto id={id} valor={r.fornecedor} onMudar={(v) => setR((x) => ({ ...x, fornecedor: v }))} />}</Campo>
      <div className="grid grid-cols-2 gap-2">
        <Campo rotulo="Valor (R$)">{(id) => <CampoTexto id={id} tipo="number" valor={r.valor} onMudar={(v) => setR((x) => ({ ...x, valor: v }))} />}</Campo>
        <Campo rotulo="Vencimento">{(id) => <CampoTexto id={id} tipo="date" valor={r.vencimento} onMudar={(v) => setR((x) => ({ ...x, vencimento: v }))} />}</Campo>
      </div>
      <Campo rotulo="Categoria">{(id) => <CampoTexto id={id} valor={r.categoria} onMudar={(v) => setR((x) => ({ ...x, categoria: v }))} />}</Campo>
      {erro && <p className="text-destructive-text text-xs">{erro}</p>}
      <p className="text-muted-foreground text-xs">{e.erp.modo === 'E1' ? `A conta é criada no ${e.erp.provedor} por comando e relida no espelho.` : e.erp.modo === 'E2' ? `O ${e.erp.provedor} não aceita escrita: a conta fica em “lançar no ERP” nas Rotinas.` : 'Livro próprio: a conta nasce na plataforma.'} Nenhum pagamento sai daqui: o cartão vai ao cliente pelo lote.</p>
    </GavetaFormulario>
  )
}

/* ---------- Detalhe do item: SLA, completude, documentos, anotações e histórico ---------- */

function GavetaItemFila({ e, f, onFechar, onEscolher }: { e: EmpresaVista; f: BpoItemFila; onFechar: () => void; onEscolher: (id: string | null, aba?: string) => void }) {
  const executar = useAcao()
  const confirmar = useConfirmar()
  const acoes = useAcoesFila()
  const eventos = useTabela('evento')
  const historico = useHistorico(f.id)
  const docs = useDocumentosBpo([e.clienteId])
  const pedirOp = usePedirOperacao()
  const pedirBpo = usePedirBpo()
  const trabalhando = useTrabalhandoEm()
  const [nota, setNota] = useState('')
  const [lancar, setLancar] = useState(false)
  const acao = useExecutar(e, f, (id, aba) => (onFechar(), onEscolher(id, aba)), () => setLancar(true))
  const sla = slaDe(f)
  const parada = bolaParada(f, eventos)
  const anexados = docs.filter((d) => d.fila_id === f.id)
  const paraAnexar = docs.filter((d) => d.fila_id !== f.id && (d.situacao === 'recebido' || d.situacao === 'lido'))
  const notas = [...notasDe(f)].reverse()
  const bolas: BolaBpo[] = ['bpo', 'cliente', 'terceiro']
  const cobrarComIntegrante = () =>
    pedirOp({
      integrante: 'i-bpo',
      titulo: `Cobrar: ${f.texto}`,
      cliente: e.nome,
      inicio: f.bola === 'cliente' ? `A bola está com o cliente há ${textoHoras(horasDesde(bolaDesde(f, eventos)))}. Vou cobrar pelo mesmo canal, com o que falta.` : `Vou lembrar quem está com a bola: ${f.bola === 'bpo' ? f.responsavel_nome : rotuloBola[f.bola]}.`,
      etapas: ['Relendo o pedido e o que falta', f.bola === 'cliente' ? `Escrevendo ao cliente (${rotuloCanal[f.canal]})` : 'Avisando pelo sino'],
      fim: { texto: `Cobrei sobre “${f.texto}”. O SLA ${f.bola === 'bpo' ? 'segue correndo' : 'segue pausado até a resposta'}.`, aviso: `Contas a Pagar cobrou: ${f.texto}` },
      efeito: { tipo: 'cobrar_bola', filaId: f.id, como: f.bola === 'cliente' ? `cobrança ao cliente pelo ${rotuloCanal[f.canal]} (integrante)` : 'lembrete pelo sino (integrante)' },
    })
  return (
    <Sheet open onOpenChange={(v) => !v && onFechar()}>
      <SheetContent className="gap-0 sm:max-w-xl">
        <AreaRolagem className="flex flex-1 flex-col">
        <SheetHeader className="px-5 pt-5">
          <SheetTitle className="text-xl font-light">{f.texto}</SheetTitle>
          <SheetDescription>
            {e.nome} · {rotuloTipoItem[f.tipo]} · {f.codigo} · {f.canal === 'interno' ? 'pedido interno' : `chegou pelo ${rotuloCanal[f.canal]}`}
            {typeof f.extras?.pedido_por === 'string' && ` (${f.extras.pedido_por})`}
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-5 px-5 pt-4 pb-8">
          <section className="flex flex-col gap-2" aria-label="Bola e SLA">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={f.bola === 'bpo' ? 'destaque' : 'outline'}>{f.situacao === 'resolvido' ? 'resolvido' : rotuloBola[f.bola]}</Badge>
              <span className="text-muted-foreground text-xs">desde {dataHora(bolaDesde(f, eventos))}</span>
              {parada && <Badge variant="destaque">bola parada há {textoHoras(parada)}</Badge>}
            </div>
            <p className={cn('text-sm', sla.tom === 'erro' ? 'text-destructive-text' : sla.tom === 'atencao' ? 'text-warning-text' : undefined)}>{sla.texto}</p>
            <dl className="text-muted-foreground grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-4">
              <div>
                <dt>Responsável</dt>
                <dd className="text-foreground flex items-center gap-1">
                  <UserIcon /> {f.responsavel_nome ?? 'ninguém'}
                </dd>
              </div>
              <div>
                <dt>Prazo</dt>
                <dd className="text-foreground">{dataCurta(f.prazo)}</dd>
              </div>
              <div>
                <dt>Meta do SLA</dt>
                <dd className="text-foreground">{f.sla_meta_h} h</dd>
              </div>
              <div>
                <dt>SLA começou</dt>
                <dd className="text-foreground">{f.sla_inicio ? dataHora(f.sla_inicio) : 'ainda não (incompleto)'}</dd>
              </div>
              {f.prazo_legal && (
                <div>
                  <dt>Prazo legal</dt>
                  <dd className="text-foreground">{dataCurta(f.prazo_legal)}</dd>
                </div>
              )}
              {f.valor ? (
                <div>
                  <dt>Valor</dt>
                  <dd className="text-foreground tabular-nums">{brl(f.valor)}</dd>
                </div>
              ) : null}
            </dl>
          </section>

          {f.situacao === 'aberto' && (
            <section className="flex flex-wrap gap-2" aria-label="Ações do item">
              {acao && (
                <SePode ferramenta={acao.ferramenta} alvo={{ cliente_id: e.clienteId }}>
                  <Button size="sm" className="rounded-full" onClick={() => void acao.fazer()}>
                    {acao.icone} {acao.rotulo}
                  </Button>
                </SePode>
              )}
              <SePode ferramenta="fila.passar_bola">
                <span className="w-44">
                  <CampoEscolha rotulo="Passar a bola" valor="" onMudar={(v) => v && void acoes.passar(f, v as BolaBpo)} opcoes={[{ valor: '', rotulo: 'Passar a bola…' }, ...bolas.filter((b) => b !== f.bola).map((b) => ({ valor: b, rotulo: rotuloBola[b] }))]} />
                </span>
              </SePode>
              {acoes.podeReatribuir && (
                <span className="w-44">
                  <CampoEscolha rotulo="Responsável" valor={f.responsavel_nome ?? ''} onMudar={(v) => v && v !== f.responsavel_nome && acoes.reatribuir(f, v)} opcoes={acoes.equipe.map((u) => ({ valor: u.nome, rotulo: u.nome }))} />
                </span>
              )}
              <SePode ferramenta="fila.cobrar">
                <Button size="sm" variant="outline" className="rounded-full" disabled={trabalhando(f.id)} onClick={cobrarComIntegrante}>
                  <BellRingingIcon /> {trabalhando(f.id) ? 'Cobrando…' : 'Cobrar pelo integrante'}
                </Button>
              </SePode>
            </section>
          )}

          <section className="flex flex-col gap-2" aria-label="Completude">
            <TituloBloco descricao="BPO-009: o SLA só começa com o pedido completo.">Completude</TituloBloco>
            {f.faltando.length === 0 ? (
              <p className="text-sm">
                <CheckIcon className="text-success-text mr-1 inline" /> Completo{f.sla_inicio ? ` desde ${dataHora(f.sla_inicio)}` : ''}.
              </p>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {f.faltando.map((x) => (
                  <li key={x} className="bg-warning/10 flex items-center gap-2 rounded-md px-3 py-2 text-sm">
                    <span className="flex-1">Falta {x}</span>
                    <Button size="sm" variant="outline" className="rounded-full" onClick={() => executar(() => repos.bpo.fila.completar(f.id, x), { sucesso: `Chegou: ${x}` })}>
                      <CheckIcon /> Chegou
                    </Button>
                  </li>
                ))}
                {f.bola === 'cliente' && (
                  <li>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-full"
                      onClick={() =>
                        pedirBpo({ integrante: 'i-bpo', titulo: `Pedir ao cliente o que falta: ${f.texto}`, cliente: e.nome, inicio: `O pedido está sem ${f.faltando.join(' e ')}. Vou pedir ao cliente pelo mesmo canal.`, etapas: ['Conferindo a completude do pedido', 'Escrevendo ao cliente o que falta'], fim: { texto: `Pedi ao cliente: ${f.faltando.join(', ')}. O SLA começa quando chegar.` }, efeito: { tipo: 'completude', filaId: f.id } })
                      }
                    >
                      Pedir ao cliente pelo integrante
                    </Button>
                  </li>
                )}
              </ul>
            )}
          </section>

          <section className="flex flex-col gap-2" aria-label="Documentos do item">
            <TituloBloco descricao="O boleto ou a nota que veio com o pedido.">Documentos</TituloBloco>
            {anexados.length === 0 && <p className="text-muted-foreground text-sm">Nenhum documento anexado.</p>}
            {anexados.map((d) => (
              <p key={d.id} className="bg-sunken/60 flex items-center gap-2 rounded-md px-3 py-2 text-sm">
                <PaperclipIcon className="shrink-0" /> <span className="min-w-0 flex-1 truncate">{d.nome_arquivo}</span>
                {d.leitura && <span className="text-muted-foreground text-xs tabular-nums">{brl(d.leitura.valor, true)}</span>}
              </p>
            ))}
            {paraAnexar.length > 0 && f.situacao === 'aberto' && (
              <span className="w-full sm:w-72">
                <CampoEscolha
                  rotulo="Anexar um documento que chegou"
                  valor=""
                  onMudar={(v) => v && executar(() => documentosBpo.anexar(v, f.id), { sucesso: 'Documento anexado ao pedido' })}
                  opcoes={[{ valor: '', rotulo: 'Anexar documento que chegou…' }, ...paraAnexar.map((d) => ({ valor: d.id, rotulo: d.nome_arquivo }))]}
                />
              </span>
            )}
          </section>

          <section className="flex flex-col gap-2" aria-label="Anotações">
            <TituloBloco descricao="Ficam no item para quem pegar depois; nada se apaga.">Anotações</TituloBloco>
            <SePode ferramenta="fila.comentar">
              <div className="flex flex-col gap-2">
                <CampoArea valor={nota} onMudar={setNota} placeholder="Escreva uma anotação para a equipe" linhas={2} />
                <Button size="sm" variant="outline" className="w-fit rounded-full" disabled={!nota.trim()} onClick={() => executar(() => filaOperacao.comentar(f.id, nota), { sucesso: 'Anotação guardada' }) && setNota('')}>
                  Anotar
                </Button>
              </div>
            </SePode>
            {notas.length > 0 && (
              <ul className="flex flex-col gap-2">
                {notas.map((n, i) => (
                  <li key={`${n.em}-${i}`} className="bg-sunken/50 rounded-md px-3 py-2 text-sm">
                    <span className="block">{n.texto}</span>
                    <span className="text-muted-foreground block text-xs">
                      {n.por} · {dataHora(n.em)} · {n.tipo === 'cobranca' ? 'cobrança' : n.tipo === 'resolucao' ? 'como foi resolvido' : n.tipo === 'reabertura' ? 'reabertura' : 'anotação'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="flex flex-col gap-2" aria-label="Histórico">
            <TituloBloco descricao="Quem fez o quê e quando (eventos da trilha).">Histórico</TituloBloco>
            {historico.length === 0 ? (
              <p className="text-muted-foreground text-sm">Sem eventos desde a semente da demonstração.</p>
            ) : (
              <ol className="border-border/70 flex flex-col gap-2 border-l pl-3">
                {historico.slice(0, 12).map((h) => (
                  <li key={h.id} className="text-sm">
                    <span className="block">{h.texto}</span>
                    <span className="text-muted-foreground flex items-center gap-1 text-xs">
                      <ClockIcon /> {dataHora(noDiaDaDemo(h.criado_em))} · {h.ator_nome ?? h.ator_tipo}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </section>

          {f.situacao === 'resolvido' && (
            <SePode ferramenta="fila.atualizar">
              <Button
                size="sm"
                variant="outline"
                className="w-fit rounded-full"
                onClick={async () => {
                  const motivo = await confirmar({ titulo: 'Reabrir este item?', acao: 'Reabrir', exigirMotivo: true, rotuloMotivo: 'Por que reabrir?' })
                  if (typeof motivo === 'string') executar(() => filaOperacao.reabrir(f.id, motivo), { sucesso: 'Reaberto' })
                }}
              >
                <ArrowCounterClockwiseIcon /> Reabrir
              </Button>
            </SePode>
          )}
          <BotaoErp e={e} oque={f.texto} rotulo />
          {f.tipo === 'pedido' && anexados.length === 0 && f.faltando.some((x) => /boleto|nota/i.test(x)) && (
            <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <LinkIcon /> Quando o boleto chegar pelo WhatsApp, ele aparece em “Documentos chegando”: anexe aqui e o SLA começa.
            </p>
          )}
        </div>
        {lancar && <GavetaLancarConta e={e} f={f} onFechar={() => setLancar(false)} />}
        </AreaRolagem>
      </SheetContent>
    </Sheet>
  )
}

/* ---------- + Pedido (S08-A14): completude conferida na entrada (BPO-009) ---------- */

function NovoPedido({ aberto, onFechar, empresas }: { aberto: boolean; onFechar: () => void; empresas: EmpresaVista[] }) {
  const executar = useAcao()
  const pedir = usePedirBpo()
  const { usuario } = useSessao()
  const vazio = { empresa: empresas[0]?.clienteId ?? '', texto: '', tipo: 'pedido' as BpoItemFila['tipo'], canal: 'whatsapp' as BpoItemFila['canal'], valor: '', prazo: '', anexo: false, responsavel: '' }
  const [r, setR] = useState(vazio)
  const [tentou, setTentou] = useState(false)
  const equipe = useAcoesFila().equipe
  const empresa = empresas.find((e) => e.clienteId === r.empresa) ?? empresas[0]
  const pagamento = /pag/i.test(r.texto)
  const faltando = [...(pagamento && !r.anexo ? ['boleto ou nota'] : []), ...(pagamento && !(Number(r.valor) > 0) ? ['valor'] : []), ...(!r.prazo ? ['prazo'] : [])]
  const erroTexto = !r.texto.trim() ? 'Descreva o pedido.' : undefined
  const interno = r.canal === 'interno'
  return (
    <GavetaFormulario
      aberta={aberto}
      onFechar={onFechar}
      titulo="Novo pedido"
      descricao="Do cliente (app, WhatsApp, e-mail) ou da equipe. O integrante confere se o pedido tem o que precisa: o SLA só começa quando ele fica completo."
      acao="Abrir o pedido"
      onAcao={() => {
        setTentou(true)
        if (erroTexto || !empresa) return
        const item = executar(
          () =>
            repos.bpo.fila.criarPedido({
              cliente_id: empresa.clienteId,
              tipo: r.tipo,
              texto: r.texto.trim(),
              codigo: r.tipo === 'pendencia' ? 'FIN-004' : 'BPO-009',
              canal: r.canal,
              prazo: r.prazo || hojeBpo,
              bola: 'bpo',
              responsavel_nome: r.responsavel || empresa.perfil.analista_nome,
              faltando: interno ? faltando.filter((x) => x !== 'prazo') : faltando,
              sla_meta_h: r.tipo === 'pendencia' ? 8 : 24,
              valor: Number(r.valor) || null,
              visibilidade: interno ? 'interna_bpo' : 'compartilhada',
              extras: interno ? { pedido_por: usuario.nome } : undefined,
            }),
          { sucesso: faltando.length && !interno ? `Pedido aberto: falta ${faltando.join(', ')} (o integrante pede ao cliente)` : 'Pedido completo: o SLA começou' },
        )
        if (item && item.faltando.length && !interno)
          pedir({ integrante: 'i-bpo', titulo: `Pedir ao cliente o que falta: ${item.texto}`, cliente: empresa.nome, inicio: `O pedido chegou sem ${item.faltando.join(' e ')}. Vou pedir ao cliente pelo mesmo canal.`, etapas: ['Conferindo a completude do pedido', 'Escrevendo ao cliente o que falta'], fim: { texto: `Pedi ao cliente: ${item.faltando.join(', ')}. O SLA começa quando chegar.` }, efeito: { tipo: 'completude', filaId: item.id } })
        if (item) {
          setR(vazio)
          setTentou(false)
          onFechar()
        }
      }}
    >
      {empresas.length > 1 && <Campo rotulo="Empresa">{(id) => <CampoEscolha id={id} valor={r.empresa} onMudar={(v) => setR((x) => ({ ...x, empresa: v }))} opcoes={empresas.map((e) => ({ valor: e.clienteId, rotulo: e.nome }))} />}</Campo>}
      <Campo rotulo="Pedido" erro={tentou ? erroTexto : undefined} ajuda="Ex.: “Pague o fornecedor X amanhã”, “Emitir os boletos de convênio”, “Conferir o saldo do Itaú”.">
        {(id) => <CampoTexto id={id} valor={r.texto} onMudar={(v) => setR((x) => ({ ...x, texto: v }))} />}
      </Campo>
      <div className="grid grid-cols-2 gap-2">
        <Campo rotulo="Chegou por">
          {(id) => (
            <CampoEscolha
              id={id}
              valor={r.canal}
              onMudar={(v) => setR((x) => ({ ...x, canal: v }))}
              opcoes={[
                { valor: 'whatsapp', rotulo: 'WhatsApp' },
                { valor: 'app', rotulo: 'App do cliente' },
                { valor: 'email', rotulo: 'E-mail' },
                { valor: 'interno', rotulo: 'Da equipe' },
              ]}
            />
          )}
        </Campo>
        <Campo rotulo="Tipo">
          {(id) => (
            <CampoEscolha
              id={id}
              valor={r.tipo}
              onMudar={(v) => setR((x) => ({ ...x, tipo: v }))}
              opcoes={[
                { valor: 'pedido', rotulo: 'Pedido' },
                { valor: 'pendencia', rotulo: 'Pendência' },
              ]}
            />
          )}
        </Campo>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Campo rotulo="Valor (R$)">{(id) => <CampoTexto id={id} tipo="number" valor={r.valor} onMudar={(v) => setR((x) => ({ ...x, valor: v }))} />}</Campo>
        <Campo rotulo="Prazo">{(id) => <CampoTexto id={id} tipo="date" valor={r.prazo} onMudar={(v) => setR((x) => ({ ...x, prazo: v }))} />}</Campo>
      </div>
      <Campo rotulo="Responsável">{(id) => <CampoEscolha id={id} valor={r.responsavel} onMudar={(v) => setR((x) => ({ ...x, responsavel: v }))} opcoes={[{ valor: '', rotulo: `O analista da empresa (${empresa?.perfil.analista_nome ?? '—'})` }, ...equipe.map((u) => ({ valor: u.nome, rotulo: u.nome }))]} />}</Campo>
      <Interruptor ligado={r.anexo} onMudar={(v) => setR((x) => ({ ...x, anexo: v }))} rotulo="Veio com o boleto ou a nota" />
      <p className={cn('rounded-md px-3 py-2 text-xs', faltando.length && !interno ? 'bg-warning/10' : 'bg-success/10')}>
        {interno ? 'Pedido da equipe: entra com a bola conosco e o SLA começa (a completude do cliente não se aplica).' : faltando.length ? `Completude: falta ${faltando.join(', ')}. O pedido entra com a bola com o cliente e o integrante pede o que falta.` : 'Completo: entra com a bola conosco e o SLA começa.'}
      </p>
    </GavetaFormulario>
  )
}

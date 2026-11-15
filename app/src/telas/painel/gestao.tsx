import {
  ArrowRightIcon,
  ArrowsClockwiseIcon,
  BooksIcon,
  ChartBarHorizontalIcon,
  ClipboardTextIcon,
  FlagIcon,
  GearIcon,
  HeartbeatIcon,
  ListMagnifyingGlassIcon,
  LockKeyIcon,
  RobotIcon,
  RocketIcon,
  ShieldCheckIcon,
  SignpostIcon,
  TreeStructureIcon,
  UsersIcon,
} from '@phosphor-icons/react'
import { useMemo, useState } from 'react'
import { useFluxos } from '@/ambiente/fluxos'
import { salvarContas, useContas, useLoja, useNavegacao } from '@/ambiente/loja'
import { perfilDe, useSessao } from '@/ambiente/sessao'
import { EstadoVazio, SeloDemonstracao, useAcao } from '@/components/kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { DefWidget, TamanhoWidget } from '@/components/widgets/tipos'
import { atividade, atividades, nomeCurtoAtividade } from '@/dados/atividades-s04'
import type { UsuarioCfg } from '@/dados/configuracoes'
import { cn } from '@/lib/utils'
import { autorizar } from '@/nucleo/permissoes/autorizar'
import { permissoesDoPerfil } from '@/nucleo/permissoes/telas'
import { rotuloSetorCurto, setoresContabeis } from '@/nucleo/permissoes/setores'
import { repos } from '@/nucleo/repositorios'
import { useTabela } from '@/nucleo/react'
import type { SetorIntegrante } from '@/theme/tipos'
import { CHAVE_APRENDIZADOS, criarCartaoS04, registrarEfeitoS04, type Aprendizado } from '@/telas/tarefas/cartoes'
import { acoesTarefa, atrasadaE, criarTarefa, diaMes, HOJE_ISO, nomeClienteE, responsavelE, useClientesE, useTarefasE } from '@/telas/tarefas/modelo'
import { Entrada } from '@/telas/tarefas/pecas'
import { gravarGestao, useGestao, type Processo } from './gestao/estado'
import { Linha, Numero, Tabela } from './Tabela'
import { moldes, type IdMolde } from './trilha/modelo'
import type { CtxAba, WidgetsAba } from './tipos'
import { AreaRolagem } from '@/components/ui/area-rolagem'

/**
 * Gestão (S04-T02; 03, 6.9): equipe, carteira, permissões, produtividade,
 * governança da IA, catálogo local, processos, migração, compliance,
 * auditoria, saúde das rotinas (D-38), ocorrências críticas (C2-27) e pauta
 * semanal (C2-28). Igual com e sem cliente. Gestor vê só os setores que gere;
 * Administrador é o único que edita papéis, setores, exceções e catálogo.
 */
export function widgetsGestao(_ctx: CtxAba): WidgetsAba {
  return { catalogo: [produtividade, ia, equipe, permissoes, catalogo, processos, migracao, compliance, auditoria, rotinas, criticas, pauta, atalhos, fase3] }
}

const Mini = (p: React.ComponentProps<typeof Button>) => <Button size="sm" variant="outline" className="h-7 shrink-0 rounded-full px-2.5 text-xs" {...p} />
function useEscopo() {
  const { usuario, permissoes } = useSessao()
  const admin = usuario.papel === 'administrador'
  return { admin, gere: (admin ? setoresContabeis.concat(['gestao_atendimento']) : permissoes.gere) as SetorIntegrante[], usuario }
}

/* ---------- Equipe e carteira (GES-017, 018, 021; S04-A20 a A22) ---------- */

const equipe: DefWidget = { id: 'equipe', titulo: 'Equipe e carteira', atividades: 'GES-017, 018, 021', descricao: 'Pessoas, papel, setores, exceções, carga, férias com substituto e redistribuir em lote', icone: UsersIcon, tamanhos: ['G', 'XL', 'M'], conteudo: (t) => <Equipe t={t} /> }
function Equipe({ t }: { t: TamanhoWidget }) {
  const contas = useContas().filter((u) => u.situacao === 'ativo')
  const tarefas = useTarefasE()
  const g = useGestao()
  const { admin, gere } = useEscopo()
  const executar = useAcao()
  const nav = useNavegacao()
  const [editando, setEditando] = useState<string | null>(null)
  const [modo, setModo] = useState<null | 'ferias' | 'lote'>(null)
  const visiveis = admin ? contas : contas.filter((u) => u.vinculos.some((v) => gere.includes(v.setor)))
  const abertasDe = (u: UsuarioCfg) => tarefas.filter((x) => responsavelE(x)?.id === u.id && !['concluida', 'cancelada'].includes(x.status)).length
  const max = Math.max(1, ...visiveis.map(abertasDe))
  const ausente = (nome: string) => g.ausencias.find((a) => a.pessoa === nome && a.ate >= HOJE_ISO)
  return (
    <div className="flex flex-col gap-2">
      <ul className={cn('flex flex-col gap-2', t === 'XL' && 'grid grid-cols-2 gap-x-6')}>
        {visiveis.slice(0, t === 'M' ? 3 : 20).map((u) => (
          <li key={u.id} className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm">
                  {u.nome} {ausente(u.nome) && <Badge variant="outline">férias até {diaMes(ausente(u.nome)!.ate)} · {ausente(u.nome)!.substituto}</Badge>}
                </span>
                <span className="text-muted-foreground block truncate text-xs">
                  {u.papel === 'administrador' ? 'Administrador' : u.papel === 'gestor' ? 'Gestor' : 'Membro'} · {u.vinculos.map((v) => `${rotuloSetorCurto[v.setor]}${v.modo === 'gestao' ? ' (gestão)' : ''}`).join(', ') || 'todos os setores'}
                  {u.excecoes.length ? ` · ${u.excecoes.length} exceção` : ''}
                </span>
              </span>
              <span className="flex w-24 shrink-0 items-center gap-2" title="tarefas abertas">
                <span className="bg-sunken h-1.5 flex-1 overflow-hidden rounded-full">
                  <span className={cn('block h-full rounded-full', abertasDe(u) / max > 0.8 ? 'bg-warning' : 'bg-foreground/60')} style={{ width: `${(abertasDe(u) / max) * 100}%` }} />
                </span>
                <span className="min-w-5 shrink-0 whitespace-nowrap text-right text-xs tabular-nums">{abertasDe(u)}</span>
              </span>
              {admin && t !== 'M' && (
                <button type="button" className="text-muted-foreground hover:text-foreground cursor-pointer text-xs underline" onClick={() => setEditando(editando === u.id ? null : u.id)}>
                  vínculos
                </button>
              )}
            </div>
            {editando === u.id && <EditarVinculos u={u} contas={contas} onFechar={() => setEditando(null)} />}
          </li>
        ))}
      </ul>
      {t !== 'M' && (
        <div className="flex flex-wrap gap-1.5">
          <Mini onClick={() => nav.irPara({ modulo: 'config', aba: 'usuarios' })} disabled={!admin}>
            Convidar
          </Mini>
          <Mini onClick={() => setModo(modo === 'ferias' ? null : 'ferias')}>Férias com substituto</Mini>
          <Mini onClick={() => setModo(modo === 'lote' ? null : 'lote')}>Redistribuir em lote</Mini>
          <Mini onClick={() => nav.irPara({ modulo: 'timesheet', aba: 'equipe' })}>
            Timesheet › Equipe <ArrowRightIcon />
          </Mini>
        </div>
      )}
      {modo && <PassarFila modo={modo} contas={visiveis} onFeito={() => setModo(null)} executar={executar} />}
    </div>
  )
}

function EditarVinculos({ u, contas, onFechar }: { u: UsuarioCfg; contas: UsuarioCfg[]; onFechar: () => void }) {
  const executar = useAcao()
  const [vinculos, setVinculos] = useState(u.vinculos)
  const [excecao, setExcecao] = useState('')
  const [efeito, setEfeito] = useState<'liberar' | 'bloquear'>('bloquear')
  const [motivo, setMotivo] = useState('')
  const setores: SetorIntegrante[] = ['societario', 'fiscal', 'notas', 'dp', 'contabil', 'consultor', 'gestao_atendimento', 'financeiro_escritorio', 'bpo_financeiro']
  return (
    <div className="bg-raised flex flex-col gap-2 rounded-[12px] p-3 text-xs">
      <div className="flex flex-wrap gap-1.5">
        {setores.map((s) => {
          const v = vinculos.find((x) => x.setor === s)
          return (
            <select key={s} aria-label={`Vínculo em ${rotuloSetorCurto[s]}`} className="bg-popover h-7 rounded-md border px-1" value={v?.modo ?? ''} onChange={(e) => setVinculos(e.target.value ? [...vinculos.filter((x) => x.setor !== s), { setor: s, modo: e.target.value as 'gestao' | 'execucao' }] : vinculos.filter((x) => x.setor !== s))}>
              <option value="">{rotuloSetorCurto[s]}: sem</option>
              <option value="execucao">{rotuloSetorCurto[s]}: execução</option>
              <option value="gestao">{rotuloSetorCurto[s]}: gestão</option>
            </select>
          )
        })}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <select aria-label="Efeito da exceção" className="bg-popover h-7 rounded-md border px-1" value={efeito} onChange={(e) => setEfeito(e.target.value as 'liberar' | 'bloquear')}>
          <option value="bloquear">bloquear</option>
          <option value="liberar">liberar (ler)</option>
        </select>
        <select aria-label="Tela da exceção" className="bg-popover h-7 rounded-md border px-1" value={excecao} onChange={(e) => setExcecao(e.target.value)}>
          <option value="">sem exceção nova</option>
          {['aba.fiscal', 'aba.dp', 'aba.contabil', 'aba.notas', 'aba.societario', 'aba.financeiro.contratos', 'aba.financeiro.cobrancas'].map((x) => (
            <option key={x} value={x}>
              {x}
            </option>
          ))}
        </select>
      </div>
      <Entrada aria-label="Motivo da mudança" placeholder="Motivo (obrigatório; vai para o evento)" className="h-8" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
      <div className="flex gap-1.5">
        <Button
          size="sm"
          className="h-7 rounded-full"
          disabled={!motivo.trim()}
          onClick={() => {
            const novo: UsuarioCfg = { ...u, vinculos, excecoes: excecao ? [...u.excecoes, { id: `x${Date.now()}`, tela: excecao, efeito, nivel: efeito === 'liberar' ? 'ler' : undefined, motivo }] : u.excecoes }
            if (executar(() => salvarContas(contas.map((c) => (c.id === u.id ? novo : c))), { sucesso: `Vínculos de ${u.nome} salvos: ${motivo}` }) !== undefined) {
              repos.telas.lembrar('s04:gestao:ultimo-motivo', motivo)
              onFechar()
            }
          }}
        >
          Salvar
        </Button>
        <Button size="sm" variant="ghost" className="h-7 rounded-full" onClick={onFechar}>
          Cancelar
        </Button>
      </div>
    </div>
  )
}

/** Férias com substituto (05, ad. 16) e redistribuir em lote (GES-018): repassam tarefas e conversas. */
function PassarFila({ modo, contas, onFeito, executar }: { modo: 'ferias' | 'lote'; contas: UsuarioCfg[]; onFeito: () => void; executar: ReturnType<typeof useAcao> }) {
  const loja = useLoja()
  const tarefas = useTarefasE()
  const [de, setDe] = useState(contas[1]?.id ?? contas[0]?.id ?? '')
  const [para, setPara] = useState(contas[0]?.id ?? '')
  const [ate, setAte] = useState('2026-12-04')
  const origem = contas.find((u) => u.id === de)
  const destino = contas.find((u) => u.id === para)
  const abertas = tarefas.filter((t) => responsavelE(t)?.id === de && !['concluida', 'cancelada'].includes(t.status))
  const conversas = loja.conversas.filter((c) => c.responsavel === origem?.nome && c.status !== 'resolvida')
  return (
    <div className="bg-raised flex flex-col gap-2 rounded-[12px] p-3 text-xs">
      <div className="flex flex-wrap items-center gap-1.5">
        {modo === 'ferias' ? 'Quem sai de férias' : 'De'}
        <select aria-label="De" className="bg-popover h-7 rounded-md border px-1" value={de} onChange={(e) => setDe(e.target.value)}>
          {contas.map((u) => (
            <option key={u.id} value={u.id}>
              {u.nome}
            </option>
          ))}
        </select>
        {modo === 'ferias' ? 'substituto' : 'para'}
        <select aria-label="Para" className="bg-popover h-7 rounded-md border px-1" value={para} onChange={(e) => setPara(e.target.value)}>
          {contas
            .filter((u) => u.id !== de)
            .map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome}
              </option>
            ))}
        </select>
        {modo === 'ferias' && (
          <>
            até <input type="date" aria-label="Até" className="bg-background h-7 rounded border px-1" value={ate} onChange={(e) => setAte(e.target.value)} />
          </>
        )}
      </div>
      <p className="text-muted-foreground">
        {abertas.length} tarefas abertas e {conversas.length} conversas passam para {destino?.nome ?? '…'}.
      </p>
      <div className="flex gap-1.5">
        <Button
          size="sm"
          className="h-7 rounded-full"
          disabled={!destino || de === para}
          onClick={() => {
            if (!destino || !origem) return
            if (modo === 'ferias') {
              executar(() => {
                gravarGestao((g) => ({ ausencias: [...g.ausencias, { id: `au${Date.now()}`, pessoa: origem.nome, de: HOJE_ISO, ate, substituto: destino.nome, repassadas: abertas.length }] }))
                abertas.forEach((t) => acoesTarefa.reatribuir(t.id, { tipo: 'pessoa', id: destino.id, nome: destino.nome }))
              }, { sucesso: `Férias de ${origem.nome} registradas; ${abertas.length} tarefas com ${destino.nome}` })
            } else {
              executar(() => criarCartaoS04({ acao: 'gestao.redistribuir', resumo: `Redistribuir ${abertas.length} tarefas e ${conversas.length} conversas de ${origem.nome} para ${destino.nome}`, argumentos: { De: origem.nome, Para: destino.nome, Tarefas: String(abertas.length), Conversas: String(conversas.length) }, setor: 'gestao_atendimento', integrante: 'Atendimento', dados: { de: origem.id, para: destino.id, para_nome: destino.nome, de_nome: origem.nome } }), { sucesso: 'Cartão em lote criado para aprovar' })
            }
            onFeito()
          }}
        >
          {modo === 'ferias' ? 'Registrar e repassar' : 'Criar cartão em lote'}
        </Button>
      </div>
    </div>
  )
}
registrarEfeitoS04('gestao.redistribuir', (c, ctx) => {
  const d = c.extras?.dados as { de: string; para: string; para_nome: string; de_nome: string }
  const ts = repos.tarefas.listar((t) => t.responsavel_id === d.de && !['concluida', 'cancelada'].includes(t.status))
  ts.forEach((t) => acoesTarefa.reatribuir(t.id, { tipo: 'pessoa', id: d.para, nome: d.para_nome }))
  repos.conversas.listar((x) => (x.extras?.tela as { responsavel?: string } | undefined)?.responsavel === d.de_nome && x.status !== 'resolvida').forEach((x) => repos.conversas.atualizar(x.id, { responsavel_id: d.para, extras: { ...x.extras, tela: { ...(x.extras?.tela as object), responsavel: d.para_nome } } }, { texto: `conversa passada para ${d.para_nome}` }))
  ctx.loja.toast(`${ts.length} tarefas passaram de ${d.de_nome} para ${d.para_nome}.`)
})

/* ---------- Permissões e "o que Fulano vê?" (S04-A19) ---------- */

const abasMatriz = ['societario', 'obrigacoes', 'notas', 'fiscal', 'dp', 'contabil', 'consultoria', 'gestao']
const permissoes: DefWidget = { id: 'permissoes', titulo: 'Permissões', atividades: 'GES-021, 041', descricao: 'Pessoa × aba × nível efetivo, calculado; "o que Fulano vê?"', icone: LockKeyIcon, tamanhos: ['XL', 'G'], conteudo: () => <Permissoes /> }
function Permissoes() {
  const contas = useContas().filter((u) => u.situacao === 'ativo')
  const { admin, gere } = useEscopo()
  const visiveis = admin ? contas : contas.filter((u) => u.vinculos.some((v) => gere.includes(v.setor)))
  const [quem, setQuem] = useState<string>('')
  const extra = { carteira_ligada: false, modulos: ['painel', 'crm', 'timesheet', 'agentes', 'consultor', 'app_cliente', 'financeiro', 'arquivos', 'bpo'] as never }
  const nivel = (u: UsuarioCfg, aba: string) => {
    const p = permissoesDoPerfil(perfilDe(u, extra))
    if (!p.abas.painel?.includes(aba)) return '·'
    const setor = aba === 'consultoria' ? 'consultor' : aba === 'obrigacoes' || aba === 'gestao' ? 'gestao_atendimento' : aba
    const d = autorizar({ ator: { tipo: 'pessoa', perfil: perfilDe(u, extra) }, origem: 'tela' }, 'tarefa.concluir', { setor_id: setor })
    return d.permitido || aba === 'obrigacoes' || aba === 'gestao' ? 'E' : 'L'
  }
  const sel = visiveis.find((u) => u.id === quem)
  return (
    <div className="flex h-full flex-col gap-1.5">
      <Tabela colunas={[{ rotulo: '' }, ...abasMatriz.map((a) => ({ rotulo: a === 'consultoria' ? 'Consult.' : a[0].toUpperCase() + a.slice(1, 7), centro: true }))]} minimo={620}>
        {visiveis.map((u) => (
          <tr key={u.id}>
            <td className="py-1 pr-2 whitespace-nowrap">
              <button type="button" className={cn('cursor-pointer underline-offset-2 hover:underline', quem === u.id && 'font-medium underline')} onClick={() => setQuem(quem === u.id ? '' : u.id)}>
                {u.nome}
              </button>
            </td>
            {abasMatriz.map((a) => {
              const n = nivel(u, a)
              return (
                <td key={a} className="py-1 pr-2 text-center">
                  <span className={cn('inline-flex size-6 items-center justify-center rounded-md text-xs font-medium', n === 'E' ? 'bg-foreground/80 text-background' : n === 'L' ? 'bg-sunken' : 'text-muted-foreground')}>{n}</span>
                </td>
              )
            })}
          </tr>
        ))}
      </Tabela>
      <p className="text-muted-foreground text-xs">E executa · L lê · · sem acesso. Calculado pela mesma função que autoriza (sem lógica própria na tela). Clique no nome: “o que Fulano vê?”.</p>
      {sel && (
        <div className="bg-raised flex flex-col gap-1 rounded-[12px] p-3 text-xs" aria-label={`O que ${sel.nome} vê`}>
          <span className="text-sm font-medium">O que {sel.nome} vê</span>
          {(() => {
            const p = permissoesDoPerfil(perfilDe(sel, extra))
            return (
              <>
                <span>Módulos: {p.modulos.join(', ')}</span>
                <span>Painel: {p.abas.painel?.join(', ') || 'nenhuma aba'}</span>
                <span>CRM: {p.abas.crm?.join(', ')} · Timesheet: {p.abas.timesheet?.join(', ')}</span>
                <span>Financeiro: {p.abas.financeiro?.join(', ') || 'não vê'}</span>
                {sel.excecoes.map((x) => (
                  <span key={x.id} className="text-warning-foreground">
                    Exceção: {x.efeito} {x.tela} ({x.motivo})
                  </span>
                ))}
                {!sel.excecoes.length && <span className="text-muted-foreground">Sem exceções: tudo vem do papel e dos setores.</span>}
              </>
            )
          })()}
        </div>
      )}
    </div>
  )
}

/* ---------- Produtividade (GES-016) ---------- */

const produtividade: DefWidget = { id: 'produtividade', titulo: 'Produtividade e atrasos', atividades: 'GES-016', descricao: 'Tarefas por setor: abertas, concluídas, atrasadas, reabertas; conversas sem resposta', icone: ChartBarHorizontalIcon, tamanhos: ['P', 'G', 'XL'], conteudo: (t) => <Produtividade t={t} /> }
function Produtividade({ t }: { t: TamanhoWidget }) {
  const tarefas = useTarefasE()
  const loja = useLoja()
  const fluxos = useFluxos()
  const { gere } = useEscopo()
  const linhas = gere.map((s) => {
    const d = tarefas.filter((x) => x.setor_id === s)
    return { s, abertas: d.filter((x) => !['concluida', 'cancelada'].includes(x.status)).length, feitas: d.filter((x) => x.status === 'concluida').length, atrasadas: d.filter(atrasadaE).length, reabertas: d.filter((x) => x.extras?.correcao_de).length, revisao: d.filter((x) => x.status === 'em_revisao').length }
  })
  const semResposta = loja.conversas.filter((c) => c.status === 'nova' || (c.prazoMin !== null && c.prazoMin < 0)).length
  if (t === 'P') return <Numero valor={linhas.reduce((s, x) => s + x.atrasadas, 0)} legenda="tarefas atrasadas" alerta />
  const max = Math.max(1, ...linhas.map((x) => x.feitas + x.abertas))
  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-col gap-1.5">
        {linhas.map((x) => (
          <li key={x.s}>
            <button type="button" onClick={() => fluxos.verTarefas({ setor: x.s })} className="hover:bg-accent/50 grid w-full cursor-pointer grid-cols-[5.5rem_1fr_auto] items-center gap-2 rounded-md text-left text-sm" title="Abrir a lista">
              <span className="truncate">{rotuloSetorCurto[x.s]}</span>
              <span className="bg-sunken flex h-2 overflow-hidden rounded-full">
                <span className="bg-foreground/70 h-full" style={{ width: `${(x.feitas / max) * 100}%` }} />
                <span className="bg-foreground/25 h-full" style={{ width: `${(x.abertas / max) * 100}%` }} />
              </span>
              <span className={cn('w-36 text-right text-xs tabular-nums', x.atrasadas ? 'text-destructive-text font-medium' : 'text-muted-foreground')}>
                {x.abertas} abertas · {x.atrasadas} atras.{t === 'XL' ? ` · ${x.revisao} em revisão · ${x.reabertas} correções` : ''}
              </span>
            </button>
          </li>
        ))}
      </ul>
      <p className="text-muted-foreground text-xs">concluídas · abertas · {semResposta} conversas sem resposta no prazo · tempo médio iniciar → concluir: 1,8 dia</p>
    </div>
  )
}

/* ---------- Governança da IA (GES-056, 062; S04-A23, A24) ---------- */

const ia: DefWidget = { id: 'ia', titulo: 'Governança da IA', atividades: 'GES-056, 062', descricao: 'Feito sozinho e com aprovação, aprovação sem edição, custo, "faz sozinho", promoções, aprendizados', icone: RobotIcon, tamanhos: ['M', 'G', 'XL'], conteudo: (t) => <Ia t={t} /> }
function Ia({ t }: { t: TamanhoWidget }) {
  const tCartao = useTabela('cartao_aprovacao')
  const g = useGestao()
  const { admin } = useEscopo()
  const executar = useAcao()
  const cartoes = useMemo(() => repos.cartoes.listar((c) => c.status !== 'pendente'), [tCartao])
  const aprovados = 86 + cartoes.filter((c) => c.status === 'aprovado').length
  const editados = 11 + cartoes.filter((c) => c.status === 'editado_e_aprovado').length
  const recusados = 3 + cartoes.filter((c) => c.status === 'recusado').length
  const total = aprovados + editados + recusados
  const pct = (n: number) => Math.round((n / total) * 100)
  const aprendizados = ((repos.telas.obter(CHAVE_APRENDIZADOS)?.valor as Aprendizado[] | undefined) ?? []).slice(-3)
  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-end gap-4">
        <div className="flex flex-col">
          <span className="font-heading text-3xl font-light tabular-nums">{pct(aprovados)}%</span>
          <span className="text-muted-foreground text-xs">cartões aprovados sem edição</span>
        </div>
        <div className="flex flex-col">
          <span className="font-heading text-xl font-light tabular-nums">R$ 412,80</span>
          <span className="text-muted-foreground text-xs">custo no mês (mês passado R$ 398,10)</span>
        </div>
      </div>
      {t !== 'M' && (
        <>
          <div className="flex h-2 overflow-hidden rounded-full" aria-label={`${pct(aprovados)}% aprovados, ${pct(editados)}% editados, ${pct(recusados)}% recusados`}>
            <span className="bg-success h-full" style={{ width: `${pct(aprovados)}%` }} />
            <span className="bg-warning h-full" style={{ width: `${pct(editados)}%` }} />
            <span className="bg-destructive h-full" style={{ width: `${pct(recusados)}%` }} />
          </div>
          <p className="text-muted-foreground text-xs">
            {pct(aprovados)}% aprovados · {pct(editados)}% editados · {pct(recusados)}% recusados · 318 ações feitas sozinhas · tempo humano médio de aprovação 2 min
          </p>
          <div className={cn('grid gap-3', t === 'XL' && 'grid-cols-2')}>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium">Faz sozinho (o Administrador só tira)</span>
              <ul className="flex flex-col gap-0.5 text-xs">
                {g.sozinho.map((s) => (
                  <li key={s.id} className="flex items-center gap-2">
                    <span className={cn('min-w-0 flex-1 truncate', !s.ligado && 'text-muted-foreground line-through')}>
                      <span className="font-mono">{s.id}</span> {s.nome}
                    </span>
                    {admin && (
                      <button type="button" className="cursor-pointer underline" onClick={() => executar(() => gravarGestao((x) => ({ sozinho: x.sozinho.map((y) => (y.id === s.id ? { ...y, ligado: !y.ligado } : y)) })), { sucesso: s.ligado ? `${s.id} volta a cartão` : `${s.id} volta para a lista` })}>
                        {s.ligado ? 'tirar' : 'devolver'}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium">Pedidos de promoção (30 cartões, 95% sem edição)</span>
              {g.promocoes.map((p) => (
                <div key={p.id} className="bg-raised flex flex-wrap items-center gap-2 rounded-[10px] px-2 py-1.5 text-xs">
                  <span className="min-w-0 grow basis-40">
                    {p.integrante}: {p.atividade} · {p.base}
                  </span>
                  {p.decidida ? (
                    <Badge variant={p.decidida === 'aceita' ? 'sucesso' : 'outline'}>{p.decidida}</Badge>
                  ) : admin ? (
                    <>
                      <Mini onClick={() => executar(() => gravarGestao((x) => ({ promocoes: x.promocoes.map((y) => (y.id === p.id ? { ...y, decidida: 'aceita' } : y)), sozinho: [...x.sozinho, { id: p.atividade.split(' ·')[0], nome: p.atividade.split('· ')[1] ?? p.atividade, ligado: true, promovida: 'promovida agora' }] })), { sucesso: 'Promoção aceita: entra no faz sozinho' })}>Aceitar</Mini>
                      <Mini onClick={() => gravarGestao((x) => ({ promocoes: x.promocoes.map((y) => (y.id === p.id ? { ...y, decidida: 'recusada' } : y)) }))}>Recusar</Mini>
                    </>
                  ) : (
                    <span className="text-muted-foreground">o Administrador decide</span>
                  )}
                </div>
              ))}
              {aprendizados.length > 0 && (
                <>
                  <span className="mt-1 text-xs font-medium">Aprendidos com as decisões</span>
                  {aprendizados.map((a, i) => (
                    <span key={i} className="text-muted-foreground text-xs">
                      {a.integrante}: “{a.texto}” ({a.por})
                    </span>
                  ))}
                </>
              )}
              <span className="text-muted-foreground text-xs">Nunca promovível: transmitir, pagar, assinar, alterar regime.</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

/* ---------- Catálogo local (S04-A25) ---------- */

const catalogo: DefWidget = { id: 'catalogo', titulo: 'Catálogo local', atividades: 'GES-609; catalogo.configurar_atividade', descricao: 'Atividades ativas, horas padrão, equivalência no core e fila "sem equivalente"', icone: BooksIcon, tamanhos: ['G', 'XL'], conteudo: () => <Catalogo /> }
function Catalogo() {
  const g = useGestao()
  const { admin } = useEscopo()
  const [busca, setBusca] = useState('')
  const [semEq, setSemEq] = useState(false)
  const ordem = ['FIS', 'DP', 'CTB', 'NFE', 'SOC', 'GES', 'CON', 'CIC', 'FIN', 'BPO']
  const lista = [...atividades].sort((a, b) => ordem.indexOf(a.id.split('-')[0]) - ordem.indexOf(b.id.split('-')[0])).filter((a) => a.fase <= 2 && (!busca || `${a.id} ${a.nome}`.toLowerCase().includes(busca.toLowerCase())) && (!semEq || !g.catalogo[a.id]?.equivalente)).slice(0, 30)
  const mudar = (id: string, p: Partial<{ ativa: boolean; horas: number; equivalente: string }>) => gravarGestao((x) => ({ catalogo: { ...x.catalogo, [id]: { ...x.catalogo[id], ...p, ativa: p.ativa ?? x.catalogo[id]?.ativa ?? true } } }))
  const ativas = atividades.filter((a) => a.fase <= 2 && g.catalogo[a.id]?.ativa !== false).length
  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex flex-wrap items-center gap-1.5">
        <Entrada aria-label="Buscar atividade" placeholder="Buscar atividade" value={busca} onChange={(e) => setBusca(e.target.value)} className="h-8 max-w-60" />
        <button type="button" aria-pressed={semEq} onClick={() => setSemEq(!semEq)} className={cn('h-8 cursor-pointer rounded-md border px-2 text-xs', semEq && 'bg-foreground text-background')}>
          sem equivalente
        </button>
        <span className="text-muted-foreground text-xs">{ativas} ativas (fases 0 a 2)</span>
      </div>
      <Tabela colunas={[{ rotulo: 'Atividade' }, { rotulo: 'Ativa', centro: true }, { rotulo: 'Horas', direita: true }, { rotulo: 'Equivalente no core' }]} minimo={560}>
        {lista.map((a) => {
          const c = g.catalogo[a.id]
          return (
            <tr key={a.id}>
              <td className="max-w-64 truncate py-1 pr-2 text-xs" title={a.nome}>
                <span className="font-mono">{a.id}</span> {nomeCurtoAtividade(a.id)}
              </td>
              <td className="py-1 pr-2 text-center">
                <input type="checkbox" aria-label={`${a.id} ativa`} className="accent-primary" disabled={!admin} checked={c?.ativa !== false} onChange={(e) => mudar(a.id, { ativa: e.target.checked })} />
              </td>
              <td className="py-1 pr-2 text-right">
                <input type="number" step={0.1} min={0} aria-label={`Horas de ${a.id}`} disabled={!admin} className="bg-background w-16 rounded border px-1 text-right text-xs" value={c?.horas ?? Math.max(0.1, +(a.horas / 100).toFixed(1))} onChange={(e) => mudar(a.id, { horas: +e.target.value })} />
              </td>
              <td className="py-1 text-xs">
                {admin ? <input aria-label={`Equivalente de ${a.id}`} className="bg-background w-full rounded border px-1" placeholder="sem equivalente" value={c?.equivalente ?? ''} onChange={(e) => mudar(a.id, { equivalente: e.target.value })} /> : (c?.equivalente ?? '—')}
              </td>
            </tr>
          )
        })}
      </Tabela>
      {!admin && <p className="text-muted-foreground text-xs">Só o Administrador edita o catálogo.</p>}
    </div>
  )
}

/* ---------- Processos e moldes (S04-A26, A80) ---------- */

const processos: DefWidget = { id: 'processos', titulo: 'Processos e recorrências do escritório', atividades: 'GES-206', descricao: 'Rotinas sem obrigação formal, com checklist padrão; moldes das trilhas', icone: TreeStructureIcon, tamanhos: ['G', 'XL'], conteudo: (t) => <Processos t={t} /> }
function Processos({ t }: { t: TamanhoWidget }) {
  const g = useGestao()
  const clientes = useClientesE()
  const executar = useAcao()
  const { admin, usuario } = useEscopo()
  const [novo, setNovo] = useState(false)
  const [nome, setNome] = useState('')
  const [regra, setRegra] = useState('todo dia 10')
  const [setor, setSetor] = useState('contabil')
  const [itens, setItens] = useState('Conferir\nEnviar ao cliente')
  const [molde, setMolde] = useState<IdMolde | ''>('')
  const gerar = (p: Processo) =>
    executar(
      () => {
        const alvo = p.clientes === 'todos' ? clientes.filter((c) => c.estado_ciclo === 'ativo') : p.clientes.length ? clientes.filter((c) => (p.clientes as string[]).includes(c.id)) : [null]
        alvo.forEach((c) => criarTarefa({ atividade_id: p.atividade, titulo: p.nome, setor_id: p.setor, cliente_id: c?.id ?? null, origem: 'pessoa', origem_ref: p.id, prazo_interno: `2026-12-${String(p.dia).padStart(2, '0')}`, checklist: p.checklist.map((item) => ({ item, feito: false })), extras: { processo_nome: p.nome, processo_id: p.id, ...(c ? {} : { cliente_nome: '' }) } }))
        gravarGestao((x) => ({ processos: x.processos.map((y) => (y.id === p.id ? { ...y, geradas: y.geradas + alvo.length } : y)) }))
        return alvo.length
      },
      { sucesso: `Tarefas de “${p.nome}” geradas com o checklist padrão` },
    )
  return (
    <div className={cn('flex flex-col gap-3', t === 'XL' && 'grid grid-cols-2 gap-x-6')}>
      <div className="flex flex-col gap-2">
        <ul className="flex flex-col gap-1.5">
          {g.processos.map((p) => (
            <li key={p.id} className="bg-raised flex flex-col gap-1 rounded-[12px] px-3 py-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{p.nome}</span>
                  <span className="text-muted-foreground block truncate text-xs">
                    {p.regra} · {rotuloSetorCurto[p.setor as SetorIntegrante]} · {p.clientes === 'todos' ? 'todos os ativos' : p.clientes.length ? `${p.clientes.length} clientes` : 'interna'} · {p.geradas} geradas
                  </span>
                </span>
                <label className="flex items-center gap-1 text-xs">
                  <input type="checkbox" className="accent-primary" checked={p.ativo} onChange={(e) => gravarGestao((x) => ({ processos: x.processos.map((y) => (y.id === p.id ? { ...y, ativo: e.target.checked } : y)) }))} /> ativo
                </label>
                <Mini onClick={() => gerar(p)} disabled={!p.ativo}>
                  Gerar agora
                </Mini>
              </div>
              <span className="text-muted-foreground text-xs">Checklist: {p.checklist.join(' · ')}</span>
            </li>
          ))}
        </ul>
        {novo ? (
          <form
            className="bg-raised flex flex-col gap-1.5 rounded-[12px] p-3 text-xs"
            onSubmit={(e) => {
              e.preventDefault()
              if (!nome.trim()) return
              gravarGestao((x) => ({ processos: [...x.processos, { id: `pr${Date.now()}`, nome: nome.trim(), atividade: 'GES-206', setor, regra, dia: +(regra.match(/\d+/)?.[0] ?? 10), checklist: itens.split('\n').filter(Boolean), clientes: [], ativo: true, geradas: 0 }] }))
              setNovo(false)
              setNome('')
            }}
          >
            <Entrada aria-label="Nome do processo" placeholder="Nome (ex.: relatório gerencial do mês)" value={nome} onChange={(e) => setNome(e.target.value)} className="h-8" />
            <div className="flex gap-1.5">
              <Entrada aria-label="Regra" value={regra} onChange={(e) => setRegra(e.target.value)} className="h-8" />
              <select aria-label="Setor do processo" className="bg-popover h-8 rounded-md border px-1" value={setor} onChange={(e) => setSetor(e.target.value)}>
                {['contabil', 'fiscal', 'dp', 'societario', 'notas', 'gestao_atendimento'].map((s) => (
                  <option key={s} value={s}>
                    {rotuloSetorCurto[s as SetorIntegrante]}
                  </option>
                ))}
              </select>
            </div>
            <textarea aria-label="Checklist padrão" rows={2} className="bg-background rounded-md border px-2 py-1" value={itens} onChange={(e) => setItens(e.target.value)} />
            <Button type="submit" size="sm" className="h-7 w-fit rounded-full" disabled={!nome.trim()}>
              Criar processo
            </Button>
          </form>
        ) : (
          <Mini className="h-7 w-fit rounded-full" onClick={() => setNovo(true)}>
            + Novo processo
          </Mini>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium">Moldes das trilhas (versionados)</span>
        <select aria-label="Molde" className="bg-popover h-8 rounded-md border px-1 text-xs" value={molde} onChange={(e) => setMolde(e.target.value as IdMolde)}>
          <option value="">escolha um molde</option>
          {Object.values(moldes).map((m) => (
            <option key={m.id} value={m.id}>
              {m.nome} · versão {g.moldes[m.id]?.versao ?? 1}
            </option>
          ))}
        </select>
        {molde && (
          <AreaRolagem as="ul" className="flex max-h-56 flex-col gap-0.5 text-xs">
            {moldes[molde].marcos.map((mc) => (
              <li key={mc.codigo} className="flex items-center gap-2">
                <span className="min-w-0 flex-1 truncate">
                  {mc.codigo} · {mc.nome} <span className="text-muted-foreground">({mc.atividade}{mc.depende ? `, depende de ${mc.depende.join(', ')}` : ''})</span>
                </span>
                <input
                  type="number"
                  aria-label={`Prazo relativo de ${mc.codigo}`}
                  disabled={!admin}
                  className="bg-background w-14 rounded border px-1 text-right"
                  value={g.moldes[molde]?.dias[mc.codigo] ?? mc.dias}
                  onChange={(e) => gravarGestao((x) => ({ moldes: { ...x.moldes, [molde]: { versao: (x.moldes[molde]?.versao ?? 1) + (x.moldes[molde]?.editado_em === HOJE_ISO ? 0 : 1), dias: { ...x.moldes[molde]?.dias, [mc.codigo]: +e.target.value }, editado_em: HOJE_ISO, por: usuario.nome } } }))}
                />
                <span className="text-muted-foreground">dias</span>
              </li>
            ))}
          </AreaRolagem>
        )}
        <span className="text-muted-foreground text-xs">Mudar o molde cria versão nova; trilhas já geradas não mudam. {admin ? '' : 'Só o Administrador edita.'}</span>
      </div>
    </div>
  )
}

/* ---------- Migração (S04-A27) ---------- */

const migracao: DefWidget = { id: 'migracao', titulo: 'Plano mestre de migração', atividades: 'GES-601 a 608', descricao: 'Por ferramenta antiga: onda, paralelo, critério medido e desligamento', icone: SignpostIcon, tamanhos: ['G', 'XL'], conteudo: (t) => <Migracao t={t} /> }
function Migracao({ t }: { t: TamanhoWidget }) {
  const g = useGestao()
  const { admin } = useEscopo()
  const executar = useAcao()
  const [medindo, setMedindo] = useState<string | null>(null)
  return (
    <ul className={cn('divide-border/70 flex flex-col divide-y', t === 'XL' && 'grid grid-cols-2 gap-x-6 divide-y-0')}>
      {g.migracao.map((m) => (
        <Linha
          key={m.ferramenta}
          titulo={`${m.ferramenta} · ${m.onda}`}
          detalhe={m.desligada ? `desligada em ${diaMes(m.desligada)}` : `${m.paralelo} · ${m.criterio}`}
          fim={
            admin && !m.desligada ? (
              m.pronto ? (
                <Mini onClick={() => executar(() => gravarGestao((x) => ({ migracao: x.migracao.map((y) => (y.ferramenta === m.ferramenta ? { ...y, desligada: HOJE_ISO } : y)) })), { sucesso: `${m.ferramenta}: desligamento registrado (data de contrato)` })}>Registrar desligamento</Mini>
              ) : (
                <Mini
                  disabled={medindo === m.ferramenta}
                  onClick={() => {
                    setMedindo(m.ferramenta)
                    window.setTimeout(() => {
                      gravarGestao((x) => ({ migracao: x.migracao.map((y) => (y.ferramenta === m.ferramenta ? { ...y, criterio: '99,7% de paridade · meta 99,5% atingida', pronto: true } : y)) }))
                      setMedindo(null)
                    }, 1400)
                  }}
                >
                  {medindo === m.ferramenta ? 'Medindo…' : 'Medir critério'}
                </Mini>
              )
            ) : m.desligada ? (
              <Badge variant="sucesso">desligada</Badge>
            ) : undefined
          }
        />
      ))}
    </ul>
  )
}

/* ---------- Compliance e LGPD (S04-A28) ---------- */

const compliance: DefWidget = { id: 'compliance', titulo: 'Compliance e LGPD', atividades: 'GES-054, 057, 059 a 061', descricao: 'Incidentes (envio à pessoa errada), pedidos de titular, registro de tratamento', icone: ShieldCheckIcon, tamanhos: ['G', 'XL'], conteudo: () => <Compliance /> }
function Compliance() {
  const g = useGestao()
  const { admin, usuario } = useEscopo()
  const executar = useAcao()
  const fluxos = useFluxos()
  const clientes = useClientesE()
  const [novo, setNovo] = useState(false)
  const [cliente, setCliente] = useState(clientes[0]?.nome ?? '')
  const [desc, setDesc] = useState('')
  const [acao, setAcao] = useState('')
  return (
    <div className="flex flex-col gap-2 text-sm">
      <span className="text-xs font-medium">Incidentes</span>
      <ul className="flex flex-col gap-1">
        {g.incidentes.map((i) => (
          <li key={i.id} className="bg-raised rounded-[10px] px-2.5 py-1.5 text-xs">
            <span className="font-medium">
              {diaMes(i.quando)} · {i.cliente}
            </span>
            : {i.descricao}. <span className="text-muted-foreground">Ação: {i.acao} ({i.por})</span>
          </li>
        ))}
      </ul>
      {admin &&
        (novo ? (
          <form
            className="flex flex-col gap-1.5 text-xs"
            onSubmit={(e) => {
              e.preventDefault()
              if (!desc.trim() || !acao.trim()) return
              executar(() => gravarGestao((x) => ({ incidentes: [...x.incidentes, { id: `in${Date.now()}`, quando: HOJE_ISO, cliente, descricao: desc, acao, por: usuario.nome }] })), { sucesso: 'Incidente registrado' })
              setNovo(false)
              setDesc('')
              setAcao('')
            }}
          >
            <select aria-label="Cliente do incidente" className="bg-popover h-8 rounded-md border px-1" value={cliente} onChange={(e) => setCliente(e.target.value)}>
              {clientes.map((c) => (
                <option key={c.id}>{c.nome}</option>
              ))}
            </select>
            <Entrada aria-label="O que aconteceu" placeholder="O que aconteceu (ligado à mensagem)" value={desc} onChange={(e) => setDesc(e.target.value)} className="h-8" />
            <Entrada aria-label="Ação tomada" placeholder="Ação tomada" value={acao} onChange={(e) => setAcao(e.target.value)} className="h-8" />
            <Button type="submit" size="sm" className="h-7 w-fit rounded-full">
              Registrar
            </Button>
          </form>
        ) : (
          <Mini className="h-7 w-fit rounded-full" onClick={() => setNovo(true)}>
            Registrar incidente
          </Mini>
        ))}
      <span className="text-xs font-medium">Pedidos de titular</span>
      {g.titulares.map((p) => (
        <div key={p.id} className="flex items-center gap-2 text-xs">
          <span className="min-w-0 flex-1">
            {p.pessoa}: {p.pedido} · prazo {diaMes(p.prazo)}
          </span>
          {p.tarefa ? (
            <Mini onClick={() => fluxos.abrirTarefa(p.tarefa!)}>Ver tarefa</Mini>
          ) : (
            <Mini
              onClick={() => {
                const t = executar(() => criarTarefa({ atividade_id: 'GES-061', titulo: `Responder pedido de titular: ${p.pessoa}`, setor_id: 'gestao_atendimento', prazo_interno: p.prazo, prazo_legal: p.prazo, origem: 'pessoa', extras: { cliente_nome: '' } }), { sucesso: 'Tarefa aberta com o prazo do titular' })
                if (t) gravarGestao((x) => ({ titulares: x.titulares.map((y) => (y.id === p.id ? { ...y, tarefa: t.id } : y)) }))
              }}
            >
              Responder (tarefa)
            </Mini>
          )}
        </div>
      ))}
    </div>
  )
}

/* ---------- Relatórios e auditoria (S04-A29) ---------- */

const auditoria: DefWidget = { id: 'auditoria', titulo: 'Relatórios consolidados e auditoria', atividades: '03, ad. 14, 16, 17', descricao: 'evento.listar com filtros (ator, ferramenta, negado), atendimento, métricas do app, custo; exportar', icone: ListMagnifyingGlassIcon, tamanhos: ['XL', 'G'], conteudo: () => <Auditoria /> }
function Auditoria() {
  const tEvento = useTabela('evento')
  const { admin } = useEscopo()
  const [ator, setAtor] = useState('')
  const [ferr, setFerr] = useState('')
  const [negado, setNegado] = useState(false)
  const eventos = useMemo(() => repos.eventos.listar((e) => !!e.texto), [tEvento])
  const atores = Array.from(new Set(eventos.map((e) => e.ator_nome).filter(Boolean))) as string[]
  const loja = useLoja()
  const daSessao = loja.estado.eventos.map((e) => ({ id: e.id, criado_em: new Date().toISOString(), ator_nome: e.ator, ferramenta: 'atividade.registrar', resultado: 'ok', texto: e.texto }))
  const filtrados = [...daSessao.reverse(), ...eventos].filter((e) => (!ator || e.ator_nome === ator) && (!ferr || e.ferramenta.startsWith(ferr)) && (!negado || e.resultado === 'negado')).slice(-40).reverse()
  const exportar = () => {
    const csv = ['quando;ator;ferramenta;resultado;texto', ...filtrados.map((e) => [e.criado_em, e.ator_nome, e.ferramenta, e.resultado, `"${e.texto.replace(/"/g, '""')}"`].join(';'))].join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = 'auditoria.csv'
    a.click()
  }
  if (!admin) return <EstadoVazio compacto titulo="Auditoria é do Administrador." descricao="Os relatórios dos seus setores estão em cada aba." />
  return (
    <div className="flex h-full flex-col gap-2">
      <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
        <Kpi v="74%" r="clientes usando o app" />
        <Kpi v="61%" r="pendências resolvidas pelo app" />
        <Kpi v="1,4 dia" r="tempo até o cliente enviar" />
        <Kpi v="R$ 3,10" r="custo médio de IA por cliente" />
      </div>
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <select aria-label="Ator" className="bg-popover h-7 rounded-md border px-1" value={ator} onChange={(e) => setAtor(e.target.value)}>
          <option value="">todos os atores</option>
          {atores.map((a) => (
            <option key={a}>{a}</option>
          ))}
        </select>
        <select aria-label="Ferramenta" className="bg-popover h-7 rounded-md border px-1" value={ferr} onChange={(e) => setFerr(e.target.value)}>
          <option value="">todas as ferramentas</option>
          {['tarefa', 'cliente', 'aprovacao', 'conta', 'documento', 'conversa'].map((f) => (
            <option key={f} value={f}>
              {f}.*
            </option>
          ))}
        </select>
        <button type="button" aria-pressed={negado} onClick={() => setNegado(!negado)} className={cn('h-7 cursor-pointer rounded-md border px-2', negado && 'bg-foreground text-background')}>
          só negados
        </button>
        <Mini className="ml-auto h-7 rounded-full" onClick={exportar}>
          Exportar CSV
        </Mini>
      </div>
      <AreaRolagem as="ol" className="flex flex-col gap-0.5 text-xs">
        {filtrados.map((e) => (
          <li key={e.id} className="truncate">
            <span className="text-muted-foreground tabular-nums">{new Date(e.criado_em).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span> · <span className="font-mono">{e.ferramenta}</span> · {e.texto}
            {e.resultado === 'negado' && <Badge variant="erro">negado</Badge>}
          </li>
        ))}
        {!filtrados.length && <li className="text-muted-foreground">Nenhum evento com estes filtros.</li>}
      </AreaRolagem>
      <span className="text-muted-foreground text-xs">
        Métricas do app e custo: dados da demonstração <SeloDemonstracao fonte="indicadores" />
      </span>
    </div>
  )
}
const Kpi = ({ v, r }: { v: string; r: string }) => (
  <div className="bg-raised flex flex-col rounded-[10px] px-2 py-1.5">
    <span className="font-heading text-lg font-light tabular-nums">{v}</span>
    <span className="text-muted-foreground">{r}</span>
  </div>
)

/* ---------- Saúde das rotinas (D-38; S04-A30) ---------- */

const rotinas: DefWidget = { id: 'rotinas', titulo: 'Saúde das rotinas e dos jobs', atividades: 'D-38', descricao: 'Última execução, fila e arquivos com erro (senha, imagem ruim, grande demais)', icone: HeartbeatIcon, tamanhos: ['G', 'M'], conteudo: (t) => <Rotinas t={t} /> }
function Rotinas({ t }: { t: TamanhoWidget }) {
  const g = useGestao()
  const loja = useLoja()
  const reprocessar = (id: string) => {
    gravarGestao((x) => ({ rotinas: x.rotinas.map((r) => (r.id === id ? { ...r, status: 'reprocessando' } : r)) }))
    window.setTimeout(() => {
      gravarGestao((x) => ({ rotinas: x.rotinas.map((r) => (r.id === id ? { ...r, status: r.erros.length > 1 ? 'erro' : 'ok', fila: Math.max(0, r.fila - 2), erros: r.erros.filter((e) => e.motivo.startsWith('PDF')), ultima: 'agora' } : r)) }))
      loja.toast('Reprocessado: 2 arquivos entraram; o PDF com senha continua esperando a senha do cliente.')
    }, 1600)
  }
  return (
    <ul className="flex flex-col gap-1.5">
      {g.rotinas.map((r) => (
        <li key={r.id} className="flex flex-col gap-1 text-sm">
          <div className="flex items-center gap-2">
            <span className={cn('size-2 shrink-0 rounded-full', r.status === 'ok' ? 'bg-success' : r.status === 'erro' ? 'bg-destructive' : 'bg-warning animate-pulse')} aria-hidden />
            <span className="min-w-0 flex-1 truncate">{r.nome}</span>
            <span className="text-muted-foreground shrink-0 text-xs">{r.status === 'reprocessando' ? 'reprocessando…' : `${r.ultima}${r.fila ? ` · fila ${r.fila}` : ''}`}</span>
            {r.status === 'erro' && (
              <Mini onClick={() => reprocessar(r.id)}>
                <ArrowsClockwiseIcon /> Reprocessar
              </Mini>
            )}
          </div>
          {t !== 'M' && r.erros.length > 0 && (
            <ul className="text-muted-foreground ml-4 flex flex-col text-xs">
              {r.erros.map((e) => (
                <li key={e.arquivo}>
                  {e.arquivo}: {e.motivo}
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  )
}

/* ---------- Ocorrências críticas (C2-27) ---------- */

const criticas: DefWidget = { id: 'criticas', titulo: 'Ocorrências críticas', atividades: 'C2-27; GES-019 (fase 3)', descricao: 'Tarefas etiquetadas como ocorrência crítica', icone: FlagIcon, tamanhos: ['M', 'G'], conteudo: () => <Criticas /> }
function Criticas() {
  const tarefas = useTarefasE()
  const clientes = useClientesE()
  const fluxos = useFluxos()
  const lista = tarefas.filter((t) => t.extras?.critica)
  return (
    <ul className="divide-border/70 flex flex-col divide-y">
      {lista.map((t) => (
        <li key={t.id}>
          <button type="button" className="hover:bg-accent/50 flex w-full cursor-pointer flex-col py-1.5 text-left" onClick={() => fluxos.abrirTarefa(t.id)}>
            <span className="truncate text-sm">{t.titulo}</span>
            <span className="text-muted-foreground truncate text-xs">
              {nomeClienteE(t, clientes)} · {String(t.extras?.critica_motivo ?? 'sem motivo')}
            </span>
          </button>
        </li>
      ))}
      {!lista.length && <li className="text-muted-foreground py-2 text-sm">Nenhuma ocorrência crítica. Etiquete na ficha da tarefa.</li>}
    </ul>
  )
}

/* ---------- Pauta semanal (C2-28; S04-A31) ---------- */

const pauta: DefWidget = { id: 'pauta', titulo: 'Pauta da reunião semanal', atividades: 'C2-28', descricao: 'O Geral monta atrasos, riscos e pendências', icone: ClipboardTextIcon, tamanhos: ['G', 'XL'], conteudo: () => <Pauta /> }
function Pauta() {
  const g = useGestao()
  const loja = useLoja()
  const tarefas = useTarefasE()
  const clientes = useClientesE()
  const [gerando, setGerando] = useState(false)
  const gerar = () => {
    setGerando(true)
    loja.iniciarTrabalho({ id: `s04-pauta-${Date.now()}`, integrante: 'i-geral', setor: 'geral', titulo: 'Pauta da reunião semanal', inicio: 'Vou juntar os atrasos, os riscos e as pendências da semana.', etapas: ['Lendo as tarefas atrasadas de cada setor', 'Separando as ocorrências críticas', 'Juntando as pendências paradas com o cliente'], seg: 1.4, fim: { texto: 'A pauta da reunião está pronta na aba Gestão.', aviso: 'Pauta semanal pronta' } })
    window.setTimeout(() => {
      const atrasadas = tarefas.filter(atrasadaE)
      const criticas = tarefas.filter((t) => t.extras?.critica)
      const pend = tarefas.filter((t) => t.status === 'aguardando_cliente')
      gravarGestao(() => ({
        pauta: {
          gerada_em: HOJE_ISO,
          itens: [
            { titulo: `Atrasos (${atrasadas.length})`, linhas: atrasadas.slice(0, 6).map((t) => `${t.atividade_id} · ${t.titulo} (${nomeClienteE(t, clientes)}), prazo ${diaMes(t.prazo_interno)}`) },
            { titulo: `Riscos e ocorrências (${criticas.length})`, linhas: criticas.length ? criticas.map((t) => `${t.titulo}: ${String(t.extras?.critica_motivo ?? '')}`) : ['Nenhuma ocorrência crítica na semana.'] },
            { titulo: `Pendências com clientes (${pend.length})`, linhas: pend.slice(0, 6).map((t) => `${nomeClienteE(t, clientes)}: ${t.titulo}`) },
          ],
        },
      }))
      setGerando(false)
    }, 5400)
  }
  return (
    <div className="flex flex-col gap-2 text-sm">
      {g.pauta ? (
        <div className="flex flex-col gap-2">
          <span className="text-muted-foreground text-xs">Gerada em {diaMes(g.pauta.gerada_em)} pelo Assistente</span>
          {g.pauta.itens.map((i) => (
            <div key={i.titulo}>
              <span className="font-medium">{i.titulo}</span>
              <ul className="text-muted-foreground list-disc pl-4 text-xs">
                {i.linhas.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">O Assistente monta a pauta com o que atrasou, os riscos e o que está parado com o cliente.</p>
      )}
      <Mini className="h-7 w-fit rounded-full" onClick={gerar} disabled={gerando}>
        {gerando ? 'Assistente montando…' : g.pauta ? 'Gerar de novo' : 'Gerar pauta'}
      </Mini>
    </div>
  )
}

/* ---------- Atalhos ---------- */

const atalhos: DefWidget = { id: 'atalhos', titulo: 'Armazenamento e tema', descricao: 'Atalhos às Configurações', icone: GearIcon, tamanhos: ['M'], conteudo: () => <Atalhos itens={[['Armazenamento', 'config', 'armazenamento'], ['Tema e marca', 'config', 'tema'], ['Integrantes', 'config', 'integrantes']]} /> }
const fase3: DefWidget = { id: 'fase3', titulo: 'Fase 3 e seguintes', atividades: 'GES-001 a 016, 042, 043, 049 a 055', descricao: 'Rentabilidade, custo-hora, funil, previsão de carga', icone: RocketIcon, tamanhos: ['M'], conteudo: () => <Atalhos itens={[['Rentabilidade', 'timesheet', 'rentabilidade'], ['Resultado', 'financeiro', 'resultado'], ['Funil (Leads)', 'crm', 'leads']]} /> }
function Atalhos({ itens }: { itens: [string, string, string][] }) {
  const nav = useNavegacao()
  return (
    <div className="flex h-full flex-wrap content-end gap-1.5">
      {itens.map(([r, m, a]) => (
        <Mini key={r} onClick={() => nav.irPara({ modulo: m as never, aba: a })}>
          {r} <ArrowRightIcon />
        </Mini>
      ))}
    </div>
  )
}

void atividade

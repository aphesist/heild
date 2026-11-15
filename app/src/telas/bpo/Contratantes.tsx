import { ArrowRightIcon, BellRingingIcon, BuildingsIcon, CheckIcon, EyeIcon, FileTextIcon, LockSimpleIcon, PaperPlaneTiltIcon, PlusIcon, RobotIcon, ScalesIcon, SignOutIcon, UploadSimpleIcon, UserPlusIcon, XIcon } from '@phosphor-icons/react'
import { useMemo, useState } from 'react'
import { useLoja, usePersistente } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import { BotaoAcoes, EdicaoEmLinha, EstadoVazio, SePode, useAcao, useConfirmar, usePode } from '@/components/kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Campo, CampoArea, CampoEscolha, CampoTexto, Fichas, GavetaFormulario, Segmentado } from '@/components/ui/formulario'
import { cn } from '@/lib/utils'
import { banco } from '@/nucleo/banco'
import type { BolaBpo, BpoItemFila, Subinquilino } from '@/nucleo/modelo/entidades'
import { useTabela } from '@/nucleo/react'
import { ehGestorBpo, eventoBpo, repos } from '@/nucleo/repositorios'
import { temas } from '@/theme/temas'
import { brl, CabecalhoBpo, Caixa, Numero, PaginaBpo, Propriedade, Regra, TituloBloco } from './comum'
import { agoraBpo, dataCurta, dataHora, diasAte, hojeBpo, quando, type ContratanteVista } from './dados'
import { usePedirS08d, useTrabalhandoS08d } from './efeitos-s08d'
import { BlocoAssinatura, margemPorDepto, qtdUnidade } from './GestaoBpo'
import { rotuloBola, slaDe, useAcoesFila } from './OperacaoBpo'
import { COMPETENCIA_FECHAR, RelatorioContratante } from './RelatorioBpo'
import { AreaRolagem } from '@/components/ui/area-rolagem'

export const rotuloDepto: Record<string, string> = { dp: 'DP', fiscal: 'Fiscal', contabil: 'Contábil', societario: 'Societário' }
const rotuloModoContato: Record<Subinquilino['modo_contato'], string> = { invisivel: 'invisível (o cliente final não vê o BPO)', marca: 'com a marca do contratante', direto: 'direto (o BPO fala em nome próprio)' }
const rotuloProcuracao = { outorgada: 'cliente final outorgou ao BPO', certificado_no_cofre: 'certificado do contratante no cofre', contratante_transmite: 'o BPO prepara, o contratante transmite' }
const rotuloPapel = (p: string) => (p === 'responsavel_tecnico' ? 'responsável técnico' : p === 'socio' ? 'sócio' : 'equipe')

/** Passos da entrada de um contratante (BPO-003, 004, 017): contrato, LGPD, carteira em bloco, credenciais, pendências, RT, paralelo. */
export const passosEntrada = ['Contrato assinado (BPO-003)', 'Acordo LGPD e suboperadores (BPO-004)', 'Empresas importadas (carteira em bloco)', 'Credenciais pedidas (mapa de credenciais)', 'Pendências levantadas (SOC-022)', 'Responsável técnico convidado', 'Um mês em paralelo']
/** Passos da saída (BPO-019). */
export const passosSaida = ['Competências em andamento concluídas', 'Pacote de saída com manifesto', 'Dados devolvidos ao contratante', 'Cópias apagadas (prova de exclusão)', 'Acessos revogados (convidados e credenciais)', 'Última fatura emitida']

/** Estado da revisão do responsável técnico num item (BPO-005). */
export type EstadoRevisao = 'preparando' | 'pendente' | 'aprovada' | 'ajuste'
export function estadoRevisao(f: BpoItemFila): EstadoRevisao {
  const r = f.extras?.revisao as EstadoRevisao | undefined
  if (r) return r
  if (f.bola === 'contratante') return 'pendente'
  if (/pediu ajuste/i.test(f.detalhe ?? '')) return 'ajuste'
  if (/aprovou/i.test(f.detalhe ?? '') && /pode transmitir/i.test(f.detalhe ?? '')) return 'aprovada'
  return 'preparando'
}
const hashCurto = (t: string) => {
  let h = 0
  for (const ch of t) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return h.toString(16).padStart(8, '0')
}

interface Props {
  aba: string
  contratante?: ContratanteVista
  contratantes: ContratanteVista[]
  onContexto: (id: string | null) => void
  onPortal: (id: string) => void
}

/**
 * S08-T09 · BPO entre escritórios: as nove abas na frente dos contratantes.
 * Contexto mãe: listas, SLA e capacidade de todos, sem abrir conteúdo e sem
 * IA. Contexto do contratante: só ele, com o tema dele (10, 4.1 a 4.6).
 * Contratante é subinquilino: entra em passos, sai em passos, nunca se apaga.
 */
export function ContratantesTela({ aba, contratante, contratantes, onContexto, onPortal }: Props) {
  if (!contratantes.length) return <SemContratantes />
  if (aba === 'visao') return contratante ? <VisaoContratante c={contratante} onPortal={onPortal} /> : <VisaoMae contratantes={contratantes} onContexto={onContexto} />
  if (aba === 'carteira') return <CarteiraContratantes contratantes={contratante ? [contratante] : contratantes} mae={!contratante} onContexto={onContexto} />
  if (aba === 'fila') return contratante ? <FilaContratante c={contratante} /> : <MaeSemConteudo contratantes={contratantes} titulo="Fila compartilhada" onContexto={onContexto} />
  if (aba === 'rotinas') return <CalendarioEntregas contratantes={contratante ? [contratante] : contratantes} mae={!contratante} />
  if (aba === 'aprovacoes') return contratante ? <RevisoesContratante c={contratante} onPortal={onPortal} /> : <MaeSemConteudo contratantes={contratantes} titulo="Revisões do responsável técnico" onContexto={onContexto} />
  if (aba === 'entregas') return <EntregasContratantes contratantes={contratante ? [contratante] : contratantes} />
  if (aba === 'volume') return <VolumeContratantes contratantes={contratante ? [contratante] : contratantes} todos={contratantes} />
  if (aba === 'rentabilidade') return <RentabilidadeContratantes contratantes={contratante ? [contratante] : contratantes} />
  return <ConfigContratante contratantes={contratantes} contratante={contratante} onContexto={onContexto} onPortal={onPortal} />
}

function SemContratantes() {
  const [novo, setNovo] = useState(false)
  return (
    <PaginaBpo>
      <EstadoVazio icone={BuildingsIcon} titulo="Nenhum contratante" descricao="O BPO entre escritórios é o modo multi-inquilino: cada contratante é um subinquilino com convidados próprios, sem preço por usuário." />
      <SePode ferramenta="bpo.contratante.configurar">
        <Button className="mx-auto w-fit rounded-full" onClick={() => setNovo(true)}>
          <PlusIcon /> Novo contratante
        </Button>
      </SePode>
      {novo && <NovoContratante onFechar={() => setNovo(false)} />}
    </PaginaBpo>
  )
}

const slaTexto = (c: ContratanteVista) => (c.situacao === 'entrada' && !c.fila.length ? '—' : `${c.sla_mes}%`)
const margemTexto = (c: ContratanteVista) => (c.honorario_mes > 0 ? `${c.margem}%` : '—')
const rotuloSituacao: Record<Subinquilino['situacao'], string> = { ativo: 'ativo', entrada: 'em entrada', saida: 'em saída' }

/** Contexto mãe: listas, SLA e capacidade, sem abrir conteúdo e sem IA (10, 4.1). */
function VisaoMae({ contratantes, onContexto }: { contratantes: ContratanteVista[]; onContexto: (id: string) => void }) {
  const { permissoes } = useSessao()
  const [novo, setNovo] = useState(false)
  const empresas = contratantes.reduce((s, c) => s + c.clientes_finais.length, 0)
  const comHistorico = contratantes.filter((c) => c.situacao !== 'entrada' || c.fila.length)
  const sla = comHistorico.length ? Math.round(comHistorico.reduce((s, c) => s + c.sla_mes, 0) / comHistorico.length) : 0
  return (
    <PaginaBpo>
      <CabecalhoBpo integrante={null} titulo="BPO entre escritórios" sub="Contexto mãe: listas, SLA e capacidade de todos os contratantes, sem abrir conteúdo e sem IA. Abra um contratante para trabalhar nele.">
        <SePode ferramenta="bpo.contratante.configurar">
          <Button size="sm" variant="outline" className="rounded-full" onClick={() => setNovo(true)}>
            <PlusIcon /> Novo contratante
          </Button>
        </SePode>
      </CabecalhoBpo>
      <Caixa>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Numero valor={contratantes.length} rotulo="contratantes" detalhe={`${contratantes.filter((c) => c.situacao === 'entrada').length} em entrada · ${contratantes.filter((c) => c.situacao === 'saida').length} em saída`} />
          <Numero valor={empresas} rotulo="empresas atendidas" detalhe="clientes finais nos departamentos contratados" />
          <Numero valor={`${sla}%`} rotulo="SLA do mês" />
          <Numero valor={contratantes.reduce((s, c) => s + c.emRisco, 0)} rotulo="itens em risco" detalhe="bola conosco, prazo até amanhã" />
        </div>
      </Caixa>
      <Caixa className="gap-0 p-0 sm:p-0">
        <div className="text-muted-foreground hidden grid-cols-[minmax(0,1.6fr)_repeat(5,minmax(0,0.7fr))_auto] gap-3 px-5 pt-4 pb-2 text-xs md:grid">
          <span>Contratante</span>
          <span className="text-right">Empresas</span>
          <span className="text-right">No prazo</span>
          <span className="text-right">Bola BPO</span>
          <span className="text-right">Bola contratante</span>
          <span className="text-right">Margem</span>
          <span />
        </div>
        <ul className="divide-border/70 flex flex-col divide-y" aria-label="Contratantes">
          {contratantes.map((c) => (
            <li key={c.id} className="grid grid-cols-2 items-center gap-3 px-4 py-3 text-sm sm:px-5 md:grid-cols-[minmax(0,1.6fr)_repeat(5,minmax(0,0.7fr))_auto]">
              <span className="col-span-2 min-w-0 md:col-span-1">
                <span className="flex items-center gap-2">
                  <span className="truncate font-medium">{c.nome}</span>
                  {c.situacao !== 'ativo' && <Badge variant="outline">{rotuloSituacao[c.situacao]}</Badge>}
                </span>
                <span className="text-muted-foreground block truncate text-xs">
                  {c.escopo_mae.map((d) => rotuloDepto[d] ?? d).join(', ')} · transferência {c.transferencia}
                </span>
              </span>
              <span className="md:text-right">
                <span className="text-muted-foreground text-xs md:hidden">Empresas </span>
                {c.clientes_finais.length}
              </span>
              <span className={cn('md:text-right', c.sla_mes < 90 && slaTexto(c) !== '—' && 'text-destructive-text')}>
                <span className="text-muted-foreground text-xs md:hidden">No prazo </span>
                {slaTexto(c)}
                {c.sla_mes < 90 && slaTexto(c) !== '—' && ' · atenção'}
              </span>
              <span className="md:text-right">
                <span className="text-muted-foreground text-xs md:hidden">Bola BPO </span>
                {c.bolaBpo}
              </span>
              <span className="md:text-right">
                <span className="text-muted-foreground text-xs md:hidden">Bola contratante </span>
                {c.bolaContratante}
              </span>
              <span className={cn('md:text-right', c.honorario_mes > 0 && c.margem < 20 && 'text-destructive-text')}>
                <span className="text-muted-foreground text-xs md:hidden">Margem </span>
                {permissoes.bpoMargem ? margemTexto(c) : '—'}
              </span>
              <Button size="sm" variant="outline" className="col-span-2 w-fit rounded-full md:col-span-1" onClick={() => onContexto(c.id)}>
                Abrir contratante <ArrowRightIcon />
              </Button>
            </li>
          ))}
        </ul>
      </Caixa>
      {!permissoes.bpoMargem && <p className="text-muted-foreground text-xs">A margem só aparece para o Administrador (nunca liberável por exceção).</p>}
      {novo && <NovoContratante onFechar={() => setNovo(false)} onCriou={onContexto} />}
    </PaginaBpo>
  )
}

/** Novo contratante (subinquilino): contrato, escopo, transferência, marca e contato; entra em "entrada" com os passos (BPO-017). */
function NovoContratante({ onFechar, onCriou }: { onFechar: () => void; onCriou?: (id: string) => void }) {
  const executar = useAcao()
  const [r, setR] = useState({ nome: '', cnpj: '', escopo: ['dp', 'fiscal'] as string[], transferencia: 'parcial' as Subinquilino['transferencia'], sla: '48', preco: '180', tema: temas[1]?.id ?? temas[0].id, contato: 'invisivel' as Subinquilino['modo_contato'] })
  const cnpjOk = /^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/.test(r.cnpj.trim())
  return (
    <GavetaFormulario
      aberta
      onFechar={onFechar}
      titulo="Novo contratante"
      descricao="O contratante é cliente do BPO e subinquilino da plataforma: tem marca, convidados e clientes finais próprios, sem assinatura nem pacote."
      acao="Criar e começar a entrada"
      acaoDesabilitada={!r.nome.trim() || !cnpjOk || r.escopo.length === 0 || !(Number(r.sla) > 0)}
      largura="lg"
      onAcao={() => {
        const c = executar(
          () =>
            repos.bpo.subinquilinos.criar(
              { nome: r.nome.trim(), cnpj: r.cnpj.trim(), tema_id: r.tema, escopo_mae: r.escopo, modo_contato: r.contato, convidados_max: 10, transferencia: r.transferencia, contrato: { sla_h: Number(r.sla), inicio: hojeBpo, preco_empresa: Number(r.preco) || 0, aviso_previo_dias: 30 }, suboperadores: ['Heild (plataforma)', 'Nuvem da plataforma'], procuracoes: [], clientes_finais: [], situacao: 'entrada', sla_mes: 100, margem: 0, horas_mes: 0, honorario_mes: 0, extras: { entrada: {} } },
              { texto: `Novo contratante do BPO entre escritórios: ${r.nome.trim()} (em entrada)` },
            ),
          { sucesso: `${r.nome.trim()} criado: siga os passos da entrada` },
        )
        if (c) {
          onFechar()
          onCriou?.(c.id)
        }
      }}
    >
      <Campo rotulo="Nome do escritório contratante">{(id) => <CampoTexto id={id} valor={r.nome} onMudar={(v) => setR((x) => ({ ...x, nome: v }))} placeholder="Ex.: Escritório Gama Contabilidade" />}</Campo>
      <Campo rotulo="CNPJ" erro={r.cnpj && !cnpjOk ? 'CNPJ incompleto.' : undefined}>
        {(id) => <CampoTexto id={id} mono valor={r.cnpj} onMudar={(v) => setR((x) => ({ ...x, cnpj: v }))} placeholder="00.000.000/0000-00" />}
      </Campo>
      <Campo rotulo="Departamentos contratados" ajuda="A mãe só vê estes (BPO-002).">
        {() => <Fichas rotulo="Departamentos contratados" valores={r.escopo} onMudar={(v) => setR((x) => ({ ...x, escopo: v }))} opcoes={['dp', 'fiscal', 'contabil', 'societario'].map((d) => ({ valor: d, rotulo: rotuloDepto[d] }))} />}
      </Campo>
      <Campo rotulo="Transferência">
        {(id) => (
          <CampoEscolha
            id={id}
            valor={r.transferencia}
            onMudar={(v) => setR((x) => ({ ...x, transferencia: v }))}
            opcoes={[
              { valor: 'parcial', rotulo: 'Parcial (o contratante revisa e mantém a responsabilidade técnica)' },
              { valor: 'total', rotulo: 'Total (anuência escrita do cliente final)' },
            ]}
          />
        )}
      </Campo>
      <div className="grid gap-3 sm:grid-cols-2">
        <Campo rotulo="SLA (horas por pedido completo)">{(id) => <CampoTexto id={id} tipo="number" valor={r.sla} onMudar={(v) => setR((x) => ({ ...x, sla: v }))} />}</Campo>
        <Campo rotulo="Preço por empresa ativa (R$)">{(id) => <CampoTexto id={id} tipo="number" valor={r.preco} onMudar={(v) => setR((x) => ({ ...x, preco: v }))} />}</Campo>
      </div>
      <Campo rotulo="Tema do contratante (portal e app)">{(id) => <CampoEscolha id={id} valor={r.tema} onMudar={(v) => setR((x) => ({ ...x, tema: v }))} opcoes={temas.map((t) => ({ valor: t.id, rotulo: t.nome_produto }))} />}</Campo>
      <Campo rotulo="Modo de contato com o cliente final">{(id) => <CampoEscolha id={id} valor={r.contato} onMudar={(v) => setR((x) => ({ ...x, contato: v }))} opcoes={(Object.keys(rotuloModoContato) as Subinquilino['modo_contato'][]).map((k) => ({ valor: k, rotulo: rotuloModoContato[k] }))} />}</Campo>
    </GavetaFormulario>
  )
}

/** No contexto mãe, as abas de conteúdo mostram só a contagem: abrir o item exige o contexto do contratante. */
function MaeSemConteudo({ contratantes, titulo, onContexto }: { contratantes: ContratanteVista[]; titulo: string; onContexto: (id: string) => void }) {
  return (
    <PaginaBpo>
      <CabecalhoBpo integrante={null} titulo={titulo} sub="Contexto mãe: só contagens e SLA. O conteúdo de cada contratante abre no contexto dele (um contratante por vez, memória nunca cruzada)." />
      <div className="grid gap-4 md:grid-cols-2">
        {contratantes.map((c) => (
          <Caixa key={c.id}>
            <TituloBloco descricao={`SLA ${slaTexto(c)} · ${c.fila.length} itens abertos`}>{c.nome}</TituloBloco>
            <ul className="text-muted-foreground flex flex-col gap-1 text-sm">
              {(['bpo', 'contratante', 'cliente_final'] as BolaBpo[]).map((b) => (
                <li key={b} className="flex gap-2">
                  <span className="flex-1">bola {rotuloBola[b].replace('com ', '')}</span>
                  <span className="text-foreground tabular-nums">{c.fila.filter((f) => f.bola === b).length}</span>
                </li>
              ))}
              <li className="flex gap-2">
                <span className="flex-1">revisões do responsável técnico</span>
                <span className="text-foreground tabular-nums">{c.fila.filter((f) => f.tipo === 'revisao').length}</span>
              </li>
            </ul>
            <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <LockSimpleIcon /> conteúdo fechado no contexto mãe
            </p>
            <Button size="sm" variant="outline" className="w-fit rounded-full" onClick={() => onContexto(c.id)}>
              Abrir contratante <ArrowRightIcon />
            </Button>
          </Caixa>
        ))}
      </div>
    </PaginaBpo>
  )
}

/** Passos de entrada ou de saída do contratante, marcáveis pelo Administrador. */
function PassosContratante({ c, tipo }: { c: ContratanteVista; tipo: 'entrada' | 'saida' }) {
  const executar = useAcao()
  const confirmar = useConfirmar()
  const pode = usePode('bpo.contratante.configurar')
  const passos = tipo === 'entrada' ? passosEntrada : passosSaida
  const feitos = ((tipo === 'entrada' ? c.extras?.entrada : (c.extras?.saida as { passos?: Record<string, boolean> } | undefined)?.passos) ?? {}) as Record<string, boolean>
  const total = passos.filter((p) => feitos[p]).length
  const marcar = (p: string, v: boolean) => {
    const novos = { ...feitos, [p]: v }
    executar(() => repos.bpo.subinquilinos.atualizar(c.id, { extras: tipo === 'entrada' ? { ...c.extras, entrada: novos } : { ...c.extras, saida: { ...(c.extras?.saida as object), passos: novos } } }, { texto: `${c.nome}: ${p} ${v ? 'feito' : 'desmarcado'} (${tipo})` }))
  }
  const concluir = async () => {
    if (tipo === 'entrada') {
      executar(() => repos.bpo.subinquilinos.atualizar(c.id, { situacao: 'ativo' }, { texto: `${c.nome} ativo: entrada concluída` }), { sucesso: `${c.nome} ativo` })
      return
    }
    const ok = await confirmar({ titulo: `Encerrar ${c.nome}?`, descricao: 'Os convidados perdem o acesso, o contratante some das listas (fica no histórico, nada se apaga) e a trilha registra a saída.', acao: 'Encerrar', perigo: true })
    if (ok !== true) return
    executar(() => {
      for (const g of c.convidados.filter((x) => x.situacao !== 'desativado')) repos.bpo.convidados.atualizar(g.id, { situacao: 'desativado' }, { texto: `Acesso de ${g.nome} revogado (saída de ${c.nome})` })
      return repos.bpo.subinquilinos.arquivar(c.id, { texto: `${c.nome} encerrado (BPO-019): saída concluída` })
    }, { sucesso: `${c.nome} encerrado` })
  }
  return (
    <Caixa>
      <TituloBloco descricao={tipo === 'entrada' ? 'Carteira em bloco (BPO-017): o contratante só fica ativo depois de todos os passos.' : `Saída (BPO-019): ${(c.extras?.saida as { motivo?: string } | undefined)?.motivo ?? ''}`}>
        {tipo === 'entrada' ? `Entrada · ${total} de ${passos.length}` : `Saída · ${total} de ${passos.length}`}
      </TituloBloco>
      <ul className="flex flex-col gap-1.5 text-sm" aria-label={tipo === 'entrada' ? 'Passos da entrada' : 'Passos da saída'}>
        {passos.map((p) => (
          <li key={p}>
            <label className={cn('flex items-center gap-2.5', pode && 'cursor-pointer')}>
              <input type="checkbox" className="accent-foreground size-4" checked={!!feitos[p]} disabled={!pode} onChange={(ev) => marcar(p, ev.target.checked)} aria-label={p} />
              <span className={cn(feitos[p] && 'text-muted-foreground line-through')}>{p}</span>
            </label>
          </li>
        ))}
      </ul>
      {pode && (
        <Button size="sm" className="w-fit rounded-full" disabled={total < passos.length} title={total < passos.length ? 'Faça todos os passos antes' : undefined} onClick={() => void concluir()}>
          {tipo === 'entrada' ? <CheckIcon /> : <SignOutIcon />} {tipo === 'entrada' ? 'Ativar o contratante' : 'Concluir a saída'}
        </Button>
      )}
    </Caixa>
  )
}

interface MensagemConversa {
  id: string
  de: 'bpo' | 'contratante'
  nome: string
  texto: string
  quando: string
}

/** Conversa BPO e contratante (BPO-022): os dois lados veem; o cliente final, não. Comentário interno fica fora. */
export function ConversaContratante({ c, lado, nome }: { c: ContratanteVista; lado: 'bpo' | 'contratante'; nome: string }) {
  const loja = useLoja()
  const [msgs, setMsgs] = usePersistente<MensagemConversa[]>(`s08d:conversa:${c.id}`, [])
  const [texto, setTexto] = useState('')
  const enviar = () => {
    const t = texto.trim()
    if (!t) return
    setMsgs([...msgs, { id: `m${Date.now().toString(36)}`, de: lado, nome, texto: t, quando: agoraBpo() }])
    setTexto('')
    if (lado === 'contratante') loja.avisar({ para: [], tipo: 'cliente', setor: 'bpo_financeiro', titulo: `${nome} escreveu na conversa com o BPO`, detalhe: c.nome, destino: { modulo: 'bpo', aba: 'visao' } })
    else eventoBpo(banco, `${nome} respondeu a ${c.nome} na conversa do portal`, null)
  }
  return (
    <div className="flex flex-col gap-2">
      <AreaRolagem as="ol" className="flex max-h-64 flex-col gap-2" aria-label={`Conversa com ${lado === 'bpo' ? c.nome : 'a equipe'}`}>
        {msgs.length === 0 && <li className="text-muted-foreground text-sm">Nenhuma mensagem ainda.</li>}
        {msgs.map((m) => (
          <li key={m.id} className={cn('flex max-w-[85%] flex-col rounded-lg px-3 py-2 text-sm', m.de === lado ? 'bg-primary text-primary-foreground self-end' : 'bg-sunken self-start')}>
            <span className={cn('text-xs', m.de === lado ? 'opacity-80' : 'text-muted-foreground')}>
              {m.nome} · {dataHora(m.quando)}
            </span>
            {m.texto}
          </li>
        ))}
      </AreaRolagem>
      <form
        className="flex gap-2"
        onSubmit={(ev) => {
          ev.preventDefault()
          enviar()
        }}
      >
        <CampoTexto aria-label="Mensagem" valor={texto} onMudar={setTexto} placeholder={lado === 'bpo' ? `Escreva para ${c.nome}` : 'Escreva para a equipe'} className="min-w-0 flex-1" />
        <Button type="submit" size="sm" className="h-10 rounded-full" disabled={!texto.trim()} aria-label="Enviar mensagem">
          <PaperPlaneTiltIcon />
        </Button>
      </form>
    </div>
  )
}

function VisaoContratante({ c, onPortal }: { c: ContratanteVista; onPortal: (id: string) => void }) {
  const { usuario } = useSessao()
  const pedir = usePedirS08d()
  const cobrando = useTrabalhandoS08d('cobrar_bola')
  const revisoes = c.fila.filter((f) => f.tipo === 'revisao')
  const paradas = c.fila.filter((f) => f.bola === 'contratante' || f.bola === 'cliente_final')
  return (
    <PaginaBpo>
      <CabecalhoBpo integrante="i-atendimento" titulo={c.nome} sub={`Contexto do contratante · ${c.clientes_finais.length} empresas · ${c.escopo_mae.map((d) => rotuloDepto[d] ?? d).join(', ')} · contato ${rotuloModoContato[c.modo_contato]}`} status={`SLA e fila de ${c.nome}: memória só deste contratante`}>
        <Button size="sm" variant="outline" className="rounded-full" onClick={() => onPortal(c.id)}>
          <EyeIcon /> Ver o portal do convidado
        </Button>
        {paradas.length > 0 && (
          <Button
            size="sm"
            variant="ghost"
            className="rounded-full"
            disabled={cobrando}
            onClick={() =>
              pedir({
                integrante: 'i-atendimento',
                titulo: `Cobrar a bola parada com ${c.nome}`,
                cliente: c.nome,
                inicio: `Vou lembrar ${c.nome} do que está com eles ou com o cliente final, no tom do contratante.`,
                etapas: ['Separando o que está parado e há quanto tempo', 'Escrevendo o lembrete no tom do contratante', 'Enviando pelo portal'],
                fim: { texto: `Lembrei ${c.nome} de ${paradas.length} item(ns). O SLA continua pausado até a resposta.`, aviso: `Atendimento cobrou ${c.nome}` },
                efeito: { tipo: 'cobrar_bola', subinquilinoId: c.id },
              })
            }
          >
            <RobotIcon /> {cobrando ? 'Atendimento cobrando…' : `Cobrar a bola parada (${paradas.length})`}
          </Button>
        )}
      </CabecalhoBpo>
      {c.situacao === 'entrada' && <PassosContratante c={c} tipo="entrada" />}
      {c.situacao === 'saida' && <PassosContratante c={c} tipo="saida" />}
      <Caixa>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Numero valor={slaTexto(c)} rotulo="SLA do mês" detalhe={`meta do contrato: ${c.contrato.sla_h} h`} />
          <Numero valor={c.bolaBpo} rotulo="com o BPO" detalhe={`${c.emRisco} em risco`} />
          <Numero valor={c.bolaContratante} rotulo="com o contratante ou o cliente final" detalhe="SLA pausado" />
          <Numero valor={revisoes.length} rotulo="revisões do responsável técnico" detalhe={c.transferencia === 'parcial' ? 'transferência parcial: o RT revisa' : 'transferência total'} />
        </div>
      </Caixa>
      <div className="grid gap-4 lg:grid-cols-2">
        <Caixa>
          <TituloBloco descricao="O que vence primeiro.">Fila</TituloBloco>
          {c.fila.length === 0 && <p className="text-muted-foreground text-sm">Fila vazia.</p>}
          <ul className="flex flex-col gap-1.5 text-sm">
            {[...c.fila]
              .sort((a, b) => a.prazo.localeCompare(b.prazo))
              .slice(0, 6)
              .map((f) => (
                <li key={f.id} className="flex items-center gap-2">
                  <span className="min-w-0 flex-1 truncate">
                    {f.texto} <span className="text-muted-foreground">· {f.cliente_final}</span>
                  </span>
                  <Badge variant={f.bola === 'bpo' ? 'destaque' : 'outline'}>{rotuloBola[f.bola]}</Badge>
                </li>
              ))}
          </ul>
        </Caixa>
        <Caixa>
          <TituloBloco descricao="BPO-022: o contratante vê; o cliente final, não. Comentários internos ficam fora.">Conversa com o contratante</TituloBloco>
          <ConversaContratante c={c} lado="bpo" nome={usuario.nome} />
        </Caixa>
        <Caixa>
          <TituloBloco descricao="Convidados sem preço por usuário.">Convidados</TituloBloco>
          <ul className="flex flex-col gap-1 text-sm">
            {c.convidados.map((g) => (
              <li key={g.id} className="flex gap-2">
                <span className="flex-1">{g.nome}</span>
                <span className="text-muted-foreground text-xs">
                  {rotuloPapel(g.papel)} · {g.situacao}
                </span>
              </li>
            ))}
          </ul>
          <span className="text-muted-foreground text-xs">
            {c.convidados.filter((g) => g.situacao !== 'desativado').length} de {c.convidados_max} (teto)
          </span>
        </Caixa>
      </div>
    </PaginaBpo>
  )
}

/** Carteira em bloco (BPO-017): importa empresas do contratante coladas da planilha (nome; CNPJ; regime). */
function ImportarEmpresas({ c, onFechar }: { c: ContratanteVista; onFechar: () => void }) {
  const executar = useAcao()
  const [texto, setTexto] = useState('')
  const [deptos, setDeptos] = useState<string[]>(c.escopo_mae)
  const linhas = texto
    .split('\n')
    .map((l) => l.split(/[;\t]/).map((x) => x.trim()))
    .filter((l) => l[0])
  const validas = linhas.filter((l) => l[0].length > 2 && /\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}/.test(l[1] ?? ''))
  const repetidas = validas.filter((l) => c.clientes_finais.some((f) => f.cnpj === l[1]))
  const novas = validas.filter((l) => !repetidas.includes(l))
  return (
    <GavetaFormulario
      aberta
      onFechar={onFechar}
      titulo={`Importar empresas · ${c.nome}`}
      descricao="Cole da planilha do contratante, uma empresa por linha: nome; CNPJ; regime. Depois o BPO pede as credenciais e levanta as pendências."
      acao={`Importar ${novas.length} empresa${novas.length === 1 ? '' : 's'}`}
      acaoDesabilitada={novas.length === 0 || deptos.length === 0}
      largura="lg"
      onAcao={() => {
        const ok = executar(
          () =>
            repos.bpo.subinquilinos.atualizar(
              c.id,
              {
                clientes_finais: [...c.clientes_finais, ...novas.map((l, i) => ({ id: `cf${Date.now().toString(36)}${i}`, nome: l[0], cnpj: l[1], regime: l[2] || 'Simples Nacional', departamentos: deptos }))],
                procuracoes: [...c.procuracoes, ...novas.map((l) => ({ empresa: l[0], situacao: 'contratante_transmite' as const }))],
                extras: c.situacao === 'entrada' ? { ...c.extras, entrada: { ...(c.extras?.entrada as object), [passosEntrada[2]]: true } } : c.extras,
              },
              { texto: `Carteira em bloco: ${novas.length} empresa(s) de ${c.nome} importada(s)` },
            ),
          { sucesso: `${novas.length} empresa(s) importada(s); credencial padrão: o BPO prepara, o contratante transmite` },
        )
        if (ok) onFechar()
      }}
    >
      <Campo rotulo="Empresas (nome; CNPJ; regime)" ajuda={linhas.length ? `${validas.length} de ${linhas.length} linha(s) válida(s)${repetidas.length ? ` · ${repetidas.length} já na carteira` : ''}` : 'Ex.: Padaria Aurora; 12.345.678/0001-90; Simples Nacional'}>
        {(id) => <CampoArea id={id} valor={texto} onMudar={setTexto} linhas={6} placeholder={'Padaria Aurora; 12.345.678/0001-90; Simples Nacional\nOficina Leste; 98.765.432/0001-10; Lucro Presumido'} />}
      </Campo>
      <Campo rotulo="Departamentos destas empresas">{() => <Fichas rotulo="Departamentos destas empresas" valores={deptos} onMudar={setDeptos} opcoes={c.escopo_mae.map((d) => ({ valor: d, rotulo: rotuloDepto[d] ?? d }))} />}</Campo>
    </GavetaFormulario>
  )
}

function CarteiraContratantes({ contratantes, mae, onContexto }: { contratantes: ContratanteVista[]; mae: boolean; onContexto: (id: string) => void }) {
  const [importar, setImportar] = useState<ContratanteVista | null>(null)
  return (
    <PaginaBpo>
      <CabecalhoBpo integrante={mae ? null : 'i-atendimento'} titulo="Carteira" sub={mae ? 'Contratantes e, dentro, as empresas (só os departamentos contratados)' : 'As empresas deste contratante, nos departamentos contratados'} />
      {contratantes.map((c) => (
        <Caixa key={c.id}>
          <TituloBloco
            descricao={`${c.cnpj} · desde ${dataCurta(c.contrato.inicio)}/${c.contrato.inicio.slice(0, 4)} · ${rotuloSituacao[c.situacao]}`}
            acao={
              mae ? (
                <Button size="sm" variant="ghost" className="rounded-full" onClick={() => onContexto(c.id)}>
                  Abrir <ArrowRightIcon />
                </Button>
              ) : (
                <SePode ferramenta="bpo.contratante.configurar">
                  <Button size="sm" variant="outline" className="rounded-full" onClick={() => setImportar(c)}>
                    <UploadSimpleIcon /> Importar empresas
                  </Button>
                </SePode>
              )
            }
          >
            {c.nome}
          </TituloBloco>
          {mae ? (
            <p className="text-muted-foreground text-sm">
              {c.clientes_finais.length} empresas · {c.escopo_mae.map((d) => rotuloDepto[d] ?? d).join(', ')} · SLA {slaTexto(c)}
            </p>
          ) : c.clientes_finais.length === 0 ? (
            <EstadoVazio compacto titulo="Nenhuma empresa ainda" descricao="Importe a carteira do contratante em bloco." />
          ) : (
            <ul className="divide-border/70 flex flex-col divide-y text-sm" aria-label={`Empresas de ${c.nome}`}>
              {c.clientes_finais.map((f) => {
                const proc = c.procuracoes.find((p) => p.empresa === f.nome)
                return (
                  <li key={f.id} className="flex flex-wrap items-center gap-2 py-2">
                    <span className="min-w-0 flex-1 basis-56">
                      <span className="block truncate">{f.nome}</span>
                      <span className="text-muted-foreground block text-xs">
                        {f.cnpj} · {f.regime} · {proc ? rotuloProcuracao[proc.situacao] : 'sem procuração mapeada'}
                      </span>
                    </span>
                    <span className="flex flex-wrap gap-1">
                      {f.departamentos
                        .filter((d) => c.escopo_mae.includes(d))
                        .map((d) => (
                          <Badge key={d} variant="outline">
                            {rotuloDepto[d] ?? d}
                          </Badge>
                        ))}
                    </span>
                    <span className="text-muted-foreground w-24 text-right text-xs">{c.fila.filter((x) => x.cliente_final === f.nome).length} na fila</span>
                  </li>
                )
              })}
            </ul>
          )}
        </Caixa>
      ))}
      {importar && <ImportarEmpresas c={importar} onFechar={() => setImportar(null)} />}
    </PaginaBpo>
  )
}

/** Mandar ao responsável técnico com o resumo do que mudou, ligado à entrega por hash (BPO-005). */
function useEnviarAoRt(c: ContratanteVista) {
  const executar = useAcao()
  const rt = c.convidados.find((g) => g.papel === 'responsavel_tecnico' && g.situacao === 'ativo')
  return (f: BpoItemFila, resumo: string) => {
    const hash = hashCurto(`${f.id}:${resumo}:${agoraBpo()}`)
    const ok = executar(
      () => repos.bpo.fila.atualizar(f.id, { bola: 'contratante', detalhe: `revisão do responsável técnico: ${resumo}`, extras: { ...f.extras, revisao: 'pendente', resumo, hash, enviada_em: agoraBpo() } }, { ferramenta: 'fila.passar_bola', texto: `Enviado à revisão de ${rt?.nome ?? 'o responsável técnico'} (${c.nome}): ${f.texto} · hash ${hash}` }),
      { sucesso: `No portal de ${c.nome}, para ${rt?.nome ?? 'o responsável técnico'} revisar` },
    )
    if (ok) eventoBpo(banco, `Revisão de risco alto aberta para ${c.nome}: ${f.texto}`, null)
    return ok
  }
}

function GavetaRevisao({ c, f, onFechar }: { c: ContratanteVista; f: BpoItemFila; onFechar: () => void }) {
  const enviar = useEnviarAoRt(c)
  const [resumo, setResumo] = useState((f.extras?.resumo as string | undefined) ?? '')
  return (
    <GavetaFormulario
      aberta
      onFechar={onFechar}
      titulo={`Mandar à revisão · ${f.texto}`}
      descricao={`${f.cliente_final} · transferência ${c.transferencia}: transmitir só depois do "pode transmitir" do responsável técnico do contratante.`}
      acao="Mandar ao responsável técnico"
      acaoDesabilitada={!resumo.trim()}
      onAcao={() => {
        if (enviar(f, resumo.trim())) onFechar()
      }}
    >
      <Campo rotulo="Resumo do que mudou" ajuda="O RT lê isto antes de aprovar. Vai ligado à entrega por hash.">
        {(id) => <CampoArea id={id} valor={resumo} onMudar={setResumo} linhas={4} placeholder="Ex.: receita de outubro R$ 84 mil (setembro R$ 79 mil); anexo III; sem retenção" />}
      </Campo>
    </GavetaFormulario>
  )
}

/** Fila compartilhada do contratante (10, 4.3): bola BPO, contratante, cliente final ou terceiro; SLA pausa fora do BPO. */
function FilaContratante({ c }: { c: ContratanteVista }) {
  const [bola, setBola] = useState<'todas' | BolaBpo>('todas')
  const [novo, setNovo] = useState(false)
  const [revisar, setRevisar] = useState<BpoItemFila | null>(null)
  const acoes = useAcoesFila()
  const executar = useAcao()
  const lista = c.fila.filter((f) => bola === 'todas' || f.bola === bola).sort((a, b) => a.prazo.localeCompare(b.prazo))
  return (
    <PaginaBpo>
      <CabecalhoBpo integrante="i-atendimento" titulo="Fila e pedidos" sub={`${c.nome} · o SLA começa com o pedido completo e nunca passa do prazo legal`} status={`${c.bolaBpo} conosco, ${c.bolaContratante} com o contratante ou o cliente final`}>
        <SePode ferramenta="fila.criar">
          <Button size="sm" className="rounded-full" onClick={() => setNovo(true)}>
            <PlusIcon /> Pedido
          </Button>
        </SePode>
      </CabecalhoBpo>
      <Caixa>
        <Segmentado
          rotulo="Com quem está a bola"
          valor={bola}
          onMudar={setBola}
          opcoes={[
            { valor: 'todas', rotulo: `Todos (${c.fila.length})` },
            { valor: 'bpo', rotulo: 'Conosco' },
            { valor: 'contratante', rotulo: 'Contratante' },
            { valor: 'cliente_final', rotulo: 'Cliente final' },
          ]}
        />
        {lista.length === 0 && <EstadoVazio compacto titulo="Nada aqui" descricao={bola === 'todas' ? 'A fila deste contratante está vazia.' : 'Nenhum item com a bola neste lado.'} />}
        <ul className="divide-border/70 flex flex-col divide-y" aria-label="Fila do contratante">
          {lista.map((f) => {
            const sla = slaDe(f)
            const rev = f.tipo === 'revisao' ? estadoRevisao(f) : null
            const bloqueado = rev !== null && c.transferencia === 'parcial' && rev !== 'aprovada'
            return (
              <li key={f.id} className="flex flex-wrap items-center gap-3 py-3 text-sm">
                <span className="min-w-0 flex-1 basis-64">
                  <span className="block">{f.texto}</span>
                  <span className="text-muted-foreground block truncate text-xs">
                    {f.cliente_final} · {rotuloDepto[f.departamento ?? ''] ?? f.departamento} · {f.codigo} · {f.responsavel_nome}
                    {f.detalhe && ` · ${f.detalhe}`}
                  </span>
                  <span className={cn('block text-xs', sla.tom === 'erro' ? 'text-destructive-text' : sla.tom === 'atencao' ? 'text-warning-foreground' : 'text-muted-foreground')}>
                    {sla.texto}
                    {f.prazo_legal && ` · prazo legal ${quando(f.prazo_legal)}`}
                    {typeof f.extras?.cobrado_em === 'string' && ` · cobrado pelo Atendimento ${dataHora(f.extras.cobrado_em)}`}
                  </span>
                </span>
                {rev && <Badge variant={rev === 'aprovada' ? 'sucesso' : rev === 'ajuste' ? 'erro' : 'outline'}>{rev === 'aprovada' ? 'RT: pode transmitir' : rev === 'ajuste' ? 'RT pediu ajuste' : rev === 'pendente' ? 'com o RT' : 'preparando'}</Badge>}
                <Badge variant={f.bola === 'bpo' ? 'destaque' : 'outline'}>{rotuloBola[f.bola]}</Badge>
                {f.faltando.length > 0 ? (
                  f.faltando.map((x) => (
                    <Button key={x} size="sm" variant="outline" className="rounded-full" onClick={() => executar(() => repos.bpo.fila.completar(f.id, x), { sucesso: `Chegou: ${x}` })}>
                      <CheckIcon /> Chegou {x}
                    </Button>
                  ))
                ) : f.bola === 'bpo' && rev && rev !== 'aprovada' ? (
                  <Button size="sm" variant="outline" className="rounded-full" onClick={() => setRevisar(f)}>
                    <PaperPlaneTiltIcon /> {rev === 'ajuste' ? 'Ajustar e reenviar ao RT' : 'Mandar ao RT'}
                  </Button>
                ) : f.bola === 'bpo' ? (
                  <Button size="sm" variant="outline" className="rounded-full" disabled={bloqueado} title={bloqueado ? 'Transmitir exige o "pode transmitir" do responsável técnico' : undefined} onClick={() => executar(() => repos.bpo.fila.resolver(f.id), { sucesso: `Concluído: ${f.texto}` })}>
                    <CheckIcon /> {f.tipo === 'revisao' ? 'Transmitir e concluir' : 'Concluir'}
                  </Button>
                ) : null}
                <BotaoAcoes rotulo={`Ações de ${f.texto}`} acoes={acoes.menu(f, ['bpo', 'contratante', 'cliente_final', 'terceiro'])} />
              </li>
            )
          })}
        </ul>
      </Caixa>
      {novo && <PedidoContratante c={c} onFechar={() => setNovo(false)} canal="interno" />}
      {revisar && <GavetaRevisao c={c} f={revisar} onFechar={() => setRevisar(null)} />}
    </PaginaBpo>
  )
}

/** Pedido na fila do contratante (equipe do BPO ou convidado no portal), com completude (BPO-009). */
export function PedidoContratante({ c, onFechar, canal, comoConvidado }: { c: ContratanteVista; onFechar: () => void; canal: BpoItemFila['canal']; comoConvidado?: (f: () => void) => void }) {
  const executar = useAcao()
  const [r, setR] = useState({ empresa: c.clientes_finais[0]?.nome ?? '', depto: c.escopo_mae[0] ?? 'dp', texto: '', prazo: '', documentos: false, revisao: false })
  const faltando = r.documentos ? [] : ['documentos do cliente final']
  return (
    <GavetaFormulario
      aberta
      onFechar={onFechar}
      titulo={`Novo pedido · ${c.nome}`}
      descricao="O SLA começa quando o pedido fica completo."
      acao="Abrir o pedido"
      acaoDesabilitada={!r.texto.trim() || !r.prazo || !r.empresa}
      onAcao={() => {
        const criar = () =>
          repos.bpo.fila.criarPedido({ subinquilino_id: c.id, cliente_final: r.empresa, departamento: r.depto, tipo: r.revisao ? 'revisao' : 'pedido', texto: r.texto.trim(), codigo: r.depto === 'dp' ? 'DP-001' : r.depto === 'fiscal' ? 'FIS-009' : 'CTB-001', canal, prazo: r.prazo, bola: 'bpo', responsavel_nome: 'Lucas Prado', faltando, sla_meta_h: c.contrato.sla_h, visibilidade: 'compartilhada', ...(r.revisao ? { extras: { revisao: 'preparando' } } : {}) })
        const ok = comoConvidado ? (comoConvidado(() => void executar(criar, { sucesso: 'Pedido enviado ao BPO' })), true) : executar(criar, { sucesso: faltando.length ? 'Pedido aberto: falta documento do cliente final' : 'Pedido completo: o SLA começou' })
        if (ok) onFechar()
      }}
    >
      {c.clientes_finais.length === 0 && <p className="text-muted-foreground text-sm">Importe as empresas do contratante na Carteira antes.</p>}
      <Campo rotulo="Empresa">{(id) => <CampoEscolha id={id} valor={r.empresa} onMudar={(v) => setR((x) => ({ ...x, empresa: v }))} opcoes={c.clientes_finais.map((f) => ({ valor: f.nome, rotulo: f.nome }))} />}</Campo>
      <Campo rotulo="Departamento">{(id) => <CampoEscolha id={id} valor={r.depto} onMudar={(v) => setR((x) => ({ ...x, depto: v }))} opcoes={c.escopo_mae.map((d) => ({ valor: d, rotulo: rotuloDepto[d] ?? d }))} />}</Campo>
      <Campo rotulo="Pedido">{(id) => <CampoTexto id={id} valor={r.texto} onMudar={(v) => setR((x) => ({ ...x, texto: v }))} placeholder="Ex.: Admissão de fulano a partir de 01/12" />}</Campo>
      <Campo rotulo="Prazo">{(id) => <CampoTexto id={id} tipo="date" valor={r.prazo} onMudar={(v) => setR((x) => ({ ...x, prazo: v }))} />}</Campo>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" className="accent-foreground size-4" checked={r.documentos} onChange={(ev) => setR((x) => ({ ...x, documentos: ev.target.checked }))} /> Os documentos do cliente final já foram anexados
      </label>
      {!comoConvidado && c.transferencia === 'parcial' && (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="accent-foreground size-4" checked={r.revisao} onChange={(ev) => setR((x) => ({ ...x, revisao: ev.target.checked }))} /> Transmite ou demonstra: precisa da revisão do responsável técnico
        </label>
      )}
    </GavetaFormulario>
  )
}

/** Calendário de entregas por contratante (Rotinas na frente entre escritórios). */
function CalendarioEntregas({ contratantes, mae }: { contratantes: ContratanteVista[]; mae: boolean }) {
  const dias = Array.from({ length: 10 }, (_, i) => new Date(Date.parse(`${hojeBpo}T12:00:00Z`) + i * 864e5).toISOString().slice(0, 10))
  return (
    <PaginaBpo>
      <CabecalhoBpo integrante={mae ? null : 'i-atendimento'} titulo="Rotinas" sub="Calendário de entregas por contratante: prazos da fila e prazos legais dos próximos dez dias" />
      <Caixa>
        <ol className="flex flex-col gap-2" aria-label="Calendário de entregas">
          {dias.map((d) => {
            const itens = contratantes.flatMap((c) => c.fila.filter((f) => f.prazo === d || f.prazo_legal === d).map((f) => ({ c, f })))
            return (
              <li key={d} className={cn('flex gap-3 rounded-md px-2 py-1.5 text-sm', d === hojeBpo && 'bg-sunken/60')}>
                <span className="text-muted-foreground w-16 shrink-0 text-xs">{quando(d)}</span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  {itens.length === 0 && <span className="text-muted-foreground text-xs">—</span>}
                  {itens.map(({ c, f }) => (
                    <span key={f.id} className="truncate">
                      {mae ? `${c.nome}: 1 entrega (${rotuloDepto[f.departamento ?? ''] ?? ''})` : `${f.texto} · ${f.cliente_final}`}
                      {f.prazo_legal === d && (
                        <Badge variant="erro" className="ml-2">
                          prazo legal
                        </Badge>
                      )}
                    </span>
                  ))}
                </span>
              </li>
            )
          })}
        </ol>
      </Caixa>
    </PaginaBpo>
  )
}

/** Aprovações na frente entre escritórios: revisões do responsável técnico, "pode transmitir" (BPO-005). */
function RevisoesContratante({ c, onPortal }: { c: ContratanteVista; onPortal: (id: string) => void }) {
  const tFila = useTabela('bpo_item_fila')
  const revisoes = c.fila.filter((f) => f.tipo === 'revisao')
  const decididas = useMemo(() => tFila.filter((f) => f.subinquilino_id === c.id && f.tipo === 'revisao' && f.situacao === 'resolvido'), [tFila, c.id])
  const rt = c.convidados.find((g) => g.papel === 'responsavel_tecnico' && g.situacao === 'ativo')
  const loja = useLoja()
  const [revisar, setRevisar] = useState<BpoItemFila | null>(null)
  return (
    <PaginaBpo>
      <CabecalhoBpo integrante="i-atendimento" titulo="Aprovações" sub={`${c.nome} · transferência ${c.transferencia}: ${c.transferencia === 'parcial' ? 'transmissão e demonstração só depois da revisão do responsável técnico do contratante' : 'o BPO assume a responsabilidade, com a anuência do cliente final anexada'}`}>
        <Button size="sm" variant="outline" className="rounded-full" onClick={() => onPortal(c.id)}>
          <EyeIcon /> Ver como o responsável técnico
        </Button>
      </CabecalhoBpo>
      <Regra icone={<LockSimpleIcon />}>Transmitir sem a revisão registrada do responsável técnico fica bloqueado (NBC PG 01, item 5 c). A revisão é tarefa de risco alto, com o resumo do que mudou, ligada à entrega por hash.</Regra>
      {!rt && <Regra>Este contratante ainda não tem responsável técnico ativo: convide em Configuração.</Regra>}
      {revisoes.length === 0 ? (
        <EstadoVazio compacto titulo="Nenhuma revisão pendente" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {revisoes.map((f) => {
            const est = estadoRevisao(f)
            return (
              <Caixa key={f.id}>
                <TituloBloco descricao={`${f.cliente_final} · ${f.codigo} · prazo legal ${quando(f.prazo_legal ?? f.prazo)}`}>{f.texto}</TituloBloco>
                <Badge className="w-fit" variant={est === 'aprovada' ? 'sucesso' : est === 'ajuste' ? 'erro' : 'destaque'}>
                  {est === 'aprovada' ? 'aprovado: pode transmitir' : est === 'ajuste' ? 'ajuste pedido pelo RT' : est === 'pendente' ? `aguardando ${rt?.nome ?? 'o responsável técnico'}` : 'preparando: mande ao RT quando pronto'}
                </Badge>
                <p className="text-muted-foreground text-xs">{f.detalhe}</p>
                {typeof f.extras?.hash === 'string' && <p className="text-muted-foreground text-xs">hash da entrega {f.extras.hash}</p>}
                {est === 'pendente' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-fit rounded-full"
                    onClick={() => {
                      eventoBpo(banco, `Lembrete ao responsável técnico de ${c.nome}: ${f.texto}`, null)
                      loja.toast(`Lembrete enviado a ${rt?.nome ?? 'o responsável técnico'} no portal`)
                    }}
                  >
                    <BellRingingIcon /> Lembrar o RT
                  </Button>
                )}
                {(est === 'preparando' || est === 'ajuste') && (
                  <Button size="sm" variant="outline" className="w-fit rounded-full" onClick={() => setRevisar(f)}>
                    <PaperPlaneTiltIcon /> {est === 'ajuste' ? 'Ajustar e reenviar ao RT' : 'Mandar ao RT'}
                  </Button>
                )}
              </Caixa>
            )
          })}
        </div>
      )}
      {decididas.length > 0 && (
        <Caixa>
          <TituloBloco descricao="Revisões aprovadas e transmitidas.">Histórico</TituloBloco>
          <ul className="text-muted-foreground flex flex-col gap-1 text-xs">
            {decididas.map((f) => (
              <li key={f.id}>
                {f.texto} · {f.cliente_final} · {f.detalhe}
              </li>
            ))}
          </ul>
        </Caixa>
      )}
      {revisar && <GavetaRevisao c={c} f={revisar} onFechar={() => setRevisar(null)} />}
    </PaginaBpo>
  )
}

/** Entregas: relatório do contratante (BPO-012) com a marca dele e o SLA (BPO-011), rascunhado pelo integrante e fechado por pessoa. */
function EntregasContratantes({ contratantes }: { contratantes: ContratanteVista[] }) {
  const executar = useAcao()
  const pedir = usePedirS08d()
  const { usuario } = useSessao()
  const pode = usePode('bpo.relatorio_mensal')
  const [ver, setVer] = useState<string | null>(null)
  const umSo = contratantes.length === 1
  const fechar = (c: ContratanteVista, id: string) => executar(() => repos.bpo.entregas.atualizar(id, { situacao: 'enviado', enviado_em: agoraBpo(), enviado_por: usuario.nome }, { texto: `Relatório de outubro enviado a ${c.nome}, com a marca dele` }), { sucesso: `Relatório no portal de ${c.nome}` })
  const garantir = (c: ContratanteVista) => c.entregas.find((e) => e.tipo === 'relatorio_contratante' && e.competencia === COMPETENCIA_FECHAR) ?? executar(() => repos.bpo.entregas.criar({ subinquilino_id: c.id, competencia: COMPETENCIA_FECHAR, tipo: 'relatorio_contratante', situacao: 'pendente' }))
  const aberto = contratantes.find((c) => c.id === ver)
  return (
    <PaginaBpo>
      <CabecalhoBpo integrante={umSo ? 'i-atendimento' : null} titulo="Entregas e SLA" sub="Relatório mensal do contratante, com a marca dele: entregas com recibo, guias, pendências e o SLA, com cada desvio explicado (do contratante ou do BPO)" />
      <div className="grid gap-4 md:grid-cols-2">
        {contratantes.map((c) => {
          const rel = c.entregas.find((e) => e.tipo === 'relatorio_contratante' && e.competencia === COMPETENCIA_FECHAR)
          const rascunho = !!rel?.extras?.rascunho
          const foraBpo = c.fila.filter((f) => f.bola === 'contratante' || f.bola === 'cliente_final').length
          const atrasados = c.fila.filter((f) => f.bola === 'bpo' && diasAte(f.prazo) < 0).length
          return (
            <Caixa key={c.id}>
              <TituloBloco descricao={`SLA ${slaTexto(c)} · contrato ${c.contrato.sla_h} h`}>{c.nome}</TituloBloco>
              <ul className="text-muted-foreground flex flex-col gap-1 text-xs">
                <li>do lado do contratante: {foraBpo} item(ns) com a bola fora (SLA pausado)</li>
                <li>do BPO: {atrasados ? `${atrasados} item(ns) depois do prazo do contrato` : 'nenhum item atrasado'}</li>
              </ul>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <FileTextIcon className="text-muted-foreground size-4" />
                <span className="min-w-0 grow basis-40">
                  Relatório de outubro (marca do contratante)
                  <span className="text-muted-foreground block text-xs">{rel?.situacao === 'enviado' ? `enviado ${dataHora(rel.enviado_em)} por ${rel.enviado_por}` : rascunho ? `rascunho de ${String(rel?.extras?.rascunho_por ?? 'Atendimento')} pronto para revisar` : 'ainda sem rascunho'}</span>
                </span>
                {(rel?.situacao === 'enviado' || rascunho) && (
                  <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setVer(c.id)} aria-label={`${rel?.situacao === 'enviado' ? 'Ver' : 'Revisar'} o relatório de ${c.nome}`}>
                    <EyeIcon /> {rel?.situacao === 'enviado' ? 'Ver' : 'Revisar'}
                  </Button>
                )}
                {rel?.situacao === 'enviado' ? (
                  <Badge variant="sucesso">no portal</Badge>
                ) : rascunho && rel ? (
                  <SePode ferramenta="bpo.relatorio_mensal">
                    <Button size="sm" variant="outline" className="rounded-full" onClick={() => fechar(c, rel.id)}>
                      Fechar e enviar
                    </Button>
                  </SePode>
                ) : umSo ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => {
                      const e = garantir(c)
                      if (e)
                        pedir({
                          integrante: 'i-atendimento',
                          titulo: `Rascunhar o relatório de outubro de ${c.nome}`,
                          cliente: c.nome,
                          inicio: `Vou montar o relatório de ${c.nome} com a marca dele: entregas com recibo, guias, pendências e o SLA.`,
                          etapas: ['Juntando as entregas com recibo e as guias transmitidas', 'Explicando cada desvio: do contratante ou da equipe', 'Escrevendo com a marca e o tom do contratante'],
                          fim: { texto: `Rascunho do relatório de ${c.nome} pronto. Uma pessoa revisa e fecha: eu não envio.`, aviso: `Atendimento rascunhou o relatório de ${c.nome}` },
                          efeito: { tipo: 'relatorio_contratante', entregaId: e.id },
                        })
                    }}
                  >
                    <RobotIcon /> Pedir o rascunho
                  </Button>
                ) : (
                  <span className="text-muted-foreground text-xs">abra o contratante para rascunhar</span>
                )}
              </div>
            </Caixa>
          )
        })}
      </div>
      {aberto && <RelatorioContratante c={aberto} entrega={aberto.entregas.find((e) => e.tipo === 'relatorio_contratante' && e.competencia === COMPETENCIA_FECHAR)} aberto onFechar={() => setVer(null)} podeFechar={pode} onFecharEEnviar={() => { const rel = aberto.entregas.find((e) => e.tipo === 'relatorio_contratante' && e.competencia === COMPETENCIA_FECHAR); if (rel) fechar(aberto, rel.id) }} />}
    </PaginaBpo>
  )
}

/** Volume e faturamento entre escritórios: extrato com contestação e glosa antes da fatura (BPO-015). O contratante contesta pelo portal. */
function VolumeContratantes({ contratantes, todos }: { contratantes: ContratanteVista[]; todos: ContratanteVista[] }) {
  const executar = useAcao()
  const confirmar = useConfirmar()
  const { usuario } = useSessao()
  const gestor = ehGestorBpo()
  const decidir = async (c: ContratanteVista, id: string, situacao: 'aceita' | 'recusada') => {
    const v = c.volume!
    let motivo = ''
    if (situacao === 'recusada') {
      const m = await confirmar({ titulo: 'Recusar a contestação?', descricao: 'O contratante vê o motivo no portal.', acao: 'Recusar', exigirMotivo: true })
      if (typeof m !== 'string') return
      motivo = m
    }
    const contestacoes = v.contestacoes.map((y) => (y.id === id ? { ...y, situacao, ...(motivo ? { motivo: `${y.motivo} · recusada: ${motivo}` } : {}) } : y))
    executar(() => repos.bpo.volumes.atualizar(v.id, { contestacoes, situacao: contestacoes.some((y) => y.situacao === 'aberta') ? 'contestado' : 'aberto' }, { texto: `Contestação de ${c.nome} ${situacao === 'aceita' ? 'aceita: glosa' : `recusada: ${motivo}`}` }), { sucesso: situacao === 'aceita' ? 'Glosa aplicada' : 'Contestação recusada' })
  }
  return (
    <PaginaBpo>
      <CabecalhoBpo integrante={null} titulo="Volume e faturamento" sub="O contratante vê o extrato no portal antes da fatura e pode contestar; o aceito vira glosa" />
      <div className="grid gap-4 md:grid-cols-2">
        {contratantes.map((c) => {
          const v = c.volume
          if (!v) return <EstadoVazio key={c.id} compacto titulo={`${c.nome}: sem extrato ainda`} descricao="O extrato nasce com as primeiras entregas do mês." />
          const glosas = v.contestacoes.filter((x) => x.situacao === 'aceita')
          const total = v.itens.reduce((s, i) => s + (i.quantidade - glosas.filter((g) => g.unidade === i.unidade).reduce((t, g) => t + g.quantidade, 0)) * i.preco, 0)
          return (
            <Caixa key={c.id}>
              <TituloBloco descricao={`${v.competencia} · ${v.situacao}`}>{c.nome}</TituloBloco>
              <ul className="flex flex-col gap-1 text-sm">
                {v.itens.map((i) => (
                  <li key={i.unidade} className="flex gap-2">
                    <span className="flex-1">{i.unidade}</span>
                    <span className="tabular-nums">{i.quantidade.toLocaleString('pt-BR')}</span>
                    <span className="text-muted-foreground w-20 text-right text-xs tabular-nums">{i.preco ? brl(i.preco) : 'incluso'}</span>
                  </li>
                ))}
              </ul>
              {v.contestacoes.map((x) => (
                <div key={x.id} className="flex flex-wrap items-center gap-2 text-xs">
                  <ScalesIcon className="size-4" />
                  <span className="min-w-0 grow basis-40">
                    {qtdUnidade(x.quantidade, x.unidade)}: {x.motivo} · {x.por}
                  </span>
                  {x.situacao === 'aberta' && gestor ? (
                    <>
                      <Button size="sm" variant="outline" className="rounded-full" onClick={() => void decidir(c, x.id, 'aceita')}>
                        <CheckIcon /> Aceitar
                      </Button>
                      <Button size="sm" variant="ghost" className="rounded-full" onClick={() => void decidir(c, x.id, 'recusada')}>
                        <XIcon /> Recusar
                      </Button>
                    </>
                  ) : (
                    <Badge variant="outline">{x.situacao === 'aberta' ? 'aguardando o Gestor' : x.situacao}</Badge>
                  )}
                </div>
              ))}
              <div className="border-border/70 flex items-center gap-2 border-t pt-2 text-sm">
                <span className="flex-1">
                  A faturar <span className="tabular-nums">{brl(total)}</span>
                </span>
                {v.situacao === 'faturado' ? (
                  <Badge variant="sucesso">faturado</Badge>
                ) : (
                  <SePode ferramenta="bpo.volume.faturar">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full"
                      disabled={v.contestacoes.some((x) => x.situacao === 'aberta')}
                      title={v.contestacoes.some((x) => x.situacao === 'aberta') ? 'Decida a contestação antes de faturar' : undefined}
                      onClick={async () => {
                        const ok = await confirmar({ titulo: `Faturar ${brl(total)} a ${c.nome}?`, descricao: 'Vai para a fatura do contratante no Financeiro (o contratante é cliente do BPO; o Financeiro conta os contratantes, não os clientes finais).', acao: 'Faturar' })
                        const antes = v
                        if (ok === true) executar(() => repos.bpo.volumes.atualizar(v.id, { situacao: 'faturado', extra_valor: total, faturado_por: usuario.nome }, { ferramenta: 'bpo.volume.faturar', texto: `Volume de ${c.nome} faturado (${brl(total)})` }), { sucesso: 'Faturado no Financeiro', desfazer: () => repos.bpo.volumes.reverter(antes) })
                      }}
                    >
                      Faturar
                    </Button>
                  </SePode>
                )}
              </div>
            </Caixa>
          )
        })}
      </div>
      <BlocoAssinatura empresas={[]} contratantes={todos} />
    </PaginaBpo>
  )
}

function RentabilidadeContratantes({ contratantes }: { contratantes: ContratanteVista[] }) {
  return (
    <PaginaBpo>
      <CabecalhoBpo integrante={null} titulo="Rentabilidade e capacidade" sub="Margem por contratante e por departamento: honorário pelas empresas atendidas em cada departamento, horas pela fila dele (Timesheet com o filtro de contratante)" />
      <Caixa className="gap-0">
        <ul className="divide-border/70 flex flex-col divide-y text-sm" aria-label="Margem por contratante">
          {contratantes.map((c) => (
            <li key={c.id} className="flex flex-col gap-1.5 py-3">
              <span className="flex items-center gap-3">
                <span className="min-w-0 flex-1 truncate font-medium">{c.nome}</span>
                <span className="text-muted-foreground text-xs tabular-nums">
                  {c.horas_mes} h · {brl(c.honorario_mes)}
                </span>
                <span className={cn('w-12 text-right tabular-nums', c.honorario_mes > 0 && c.margem < 20 && 'text-destructive-text')}>{margemTexto(c)}</span>
              </span>
              {c.honorario_mes > 0 && (
                <ul className="text-muted-foreground grid gap-x-4 gap-y-0.5 text-xs sm:grid-cols-3" aria-label={`Margem de ${c.nome} por departamento`}>
                  {margemPorDepto(c).map((d) => (
                    <li key={d.depto} className={cn(d.margem < 20 && 'text-destructive-text')}>
                      {rotuloDepto[d.depto] ?? d.depto}: {d.margem}% · {d.horas} h · {brl(d.honorario)}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </Caixa>
    </PaginaBpo>
  )
}

/** Registro das operações por contratante (LGPD, BPO-004 e BPO-020): a trilha que cita o contratante. */
function TrilhaContratante({ c }: { c: ContratanteVista }) {
  const tEvento = useTabela('evento')
  const eventos = useMemo(() => tEvento.filter((e) => typeof e.texto === 'string' && e.texto.includes(c.nome)).sort((a, b) => b.criado_em.localeCompare(a.criado_em)).slice(0, 12), [tEvento, c.nome])
  return (
    <Caixa>
      <TituloBloco descricao="Registro das operações deste contratante (LGPD, arts. 37 e 39). A mesma trilha sustenta o relatório de controles (BPO-020).">Registro de operações</TituloBloco>
      {eventos.length === 0 ? (
        <p className="text-muted-foreground text-sm">Nada registrado ainda.</p>
      ) : (
        <ul className="text-muted-foreground flex flex-col gap-1 text-xs" aria-label={`Trilha de ${c.nome}`}>
          {eventos.map((e) => (
            <li key={e.id}>
              {dataHora(e.criado_em)} · {e.texto}
            </li>
          ))}
        </ul>
      )}
    </Caixa>
  )
}

/** Procedimentos por contratante (BPO-021): a base que o integrante usa no contexto dele, nunca cruzada com outro contratante. */
function ProcedimentosContratante({ c }: { c: ContratanteVista }) {
  const executar = useAcao()
  const pode = usePode('bpo.contratante.configurar')
  const [novo, setNovo] = useState('')
  const lista = (c.extras?.procedimentos as string[] | undefined) ?? []
  const salvar = (l: string[], texto: string) => executar(() => repos.bpo.subinquilinos.atualizar(c.id, { extras: { ...c.extras, procedimentos: l } }, { texto }))
  return (
    <Caixa>
      <TituloBloco descricao="O integrante segue estes procedimentos só no contexto deste contratante (memória nunca cruzada).">Procedimentos do contratante</TituloBloco>
      {lista.length === 0 && <p className="text-muted-foreground text-sm">Nenhum procedimento ainda.</p>}
      <ul className="flex flex-col gap-1 text-sm" aria-label={`Procedimentos de ${c.nome}`}>
        {lista.map((p, i) => (
          <li key={`${p}-${i}`} className="flex items-center gap-2">
            {pode ? <EdicaoEmLinha rotulo={`Procedimento ${i + 1}`} valor={p} validar={(v) => (v.trim() ? null : 'Escreva o procedimento.')} onSalvar={(v) => void salvar(lista.map((x, j) => (j === i ? v.trim() : x)), `Procedimento de ${c.nome} editado`)} className="flex-1" /> : <span className="flex-1">{p}</span>}
            {pode && (
              <Button size="icon-sm" variant="ghost" className="rounded-full" aria-label={`Tirar o procedimento ${i + 1}`} onClick={() => salvar(lista.filter((_, j) => j !== i), `Procedimento de ${c.nome} retirado`)}>
                <XIcon />
              </Button>
            )}
          </li>
        ))}
      </ul>
      {pode && (
        <form
          className="flex gap-2"
          onSubmit={(ev) => {
            ev.preventDefault()
            if (novo.trim() && salvar([...lista, novo.trim()], `Procedimento novo de ${c.nome}: ${novo.trim()}`)) setNovo('')
          }}
        >
          <CampoTexto aria-label="Novo procedimento" valor={novo} onMudar={setNovo} placeholder="Ex.: folha conferida pela Renata antes do envio" className="min-w-0 flex-1" />
          <Button type="submit" size="sm" variant="outline" className="h-10 rounded-full" disabled={!novo.trim()}>
            <PlusIcon /> Adicionar
          </Button>
        </form>
      )}
    </Caixa>
  )
}

/** Encerrar o contratante (BPO-019): motivo e passos de saída; nada se apaga. */
function EncerrarContratante({ c, onFechar }: { c: ContratanteVista; onFechar: () => void }) {
  const executar = useAcao()
  const [motivo, setMotivo] = useState('')
  return (
    <GavetaFormulario
      aberta
      onFechar={onFechar}
      titulo={`Encerrar ${c.nome}`}
      descricao={`Aviso prévio do contrato: ${c.contrato.aviso_previo_dias} dias. Na saída: concluir as competências, pacote de saída, devolver os dados, apagar as cópias, revogar os acessos e emitir a última fatura.`}
      acao="Começar a saída"
      acaoDesabilitada={!motivo.trim()}
      onAcao={() => {
        const ok = executar(() => repos.bpo.subinquilinos.atualizar(c.id, { situacao: 'saida', extras: { ...c.extras, saida: { motivo: motivo.trim(), pedida_em: agoraBpo(), passos: {} } } }, { texto: `Saída de ${c.nome} iniciada: ${motivo.trim()}` }), { sucesso: `${c.nome} em saída: siga os passos na Visão geral` })
        if (ok) onFechar()
      }}
    >
      <Campo rotulo="Motivo">{(id) => <CampoArea id={id} valor={motivo} onMudar={setMotivo} linhas={3} placeholder="Ex.: o contratante internalizou o DP" />}</Campo>
    </GavetaFormulario>
  )
}

/** Configuração entre escritórios (S08-A39, A45, A46): contrato, escopo, suboperadores, procurações, marca, convidados e teto, modo de contato, procedimentos, trilha e saída. */
function ConfigContratante({ contratantes, contratante, onContexto, onPortal }: { contratantes: ContratanteVista[]; contratante?: ContratanteVista; onContexto: (id: string) => void; onPortal: (id: string) => void }) {
  const executar = useAcao()
  const confirmar = useConfirmar()
  const loja = useLoja()
  const pode = usePode('bpo.contratante.configurar')
  const [convidar, setConvidar] = useState(false)
  const [editar, setEditar] = useState(false)
  const [encerrar, setEncerrar] = useState(false)
  if (!contratante)
    return (
      <PaginaBpo>
        <CabecalhoBpo integrante={null} titulo="Configuração" sub="Escolha o contratante: contrato, escopo, suboperadores, procurações, marca, convidados e teto são de cada um" />
        <Caixa className="gap-0">
          <ul className="divide-border/70 flex flex-col divide-y">
            {contratantes.map((c) => (
              <li key={c.id} className="flex items-center gap-3 py-2.5 text-sm">
                <span className="min-w-0 flex-1 truncate">{c.nome}</span>
                <Button size="sm" variant="ghost" className="rounded-full" onClick={() => onContexto(c.id)}>
                  Configurar <ArrowRightIcon />
                </Button>
              </li>
            ))}
          </ul>
        </Caixa>
      </PaginaBpo>
    )
  const c = contratante
  const ativos = c.convidados.filter((g) => g.situacao !== 'desativado').length
  return (
    <PaginaBpo>
      <CabecalhoBpo integrante={null} titulo="Configuração" sub={`${c.nome} · o contratante é cliente do BPO; não assina a plataforma`}>
        <Button size="sm" variant="ghost" className="rounded-full" onClick={() => onPortal(c.id)}>
          <EyeIcon /> Portal do convidado
        </Button>
        {pode && c.situacao === 'ativo' && (
          <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setEncerrar(true)}>
            <SignOutIcon /> Encerrar contratante
          </Button>
        )}
      </CabecalhoBpo>
      {c.situacao !== 'ativo' && <PassosContratante c={c} tipo={c.situacao === 'entrada' ? 'entrada' : 'saida'} />}
      <div className="grid gap-4 lg:grid-cols-2">
        <Caixa>
          <TituloBloco
            descricao="Contrato entre escritórios (BPO-003)."
            acao={
              pode && (
                <Button size="sm" variant="outline" className="rounded-full" onClick={() => setEditar(true)}>
                  Editar
                </Button>
              )
            }
          >
            Contrato e escopo
          </TituloBloco>
          <dl className="divide-border/70 divide-y">
            <Propriedade rotulo="Departamentos">{c.escopo_mae.map((d) => rotuloDepto[d] ?? d).join(', ')}</Propriedade>
            <Propriedade rotulo="SLA">{`${c.contrato.sla_h} h por pedido completo`}</Propriedade>
            <Propriedade rotulo="Preço">{`${brl(c.contrato.preco_empresa)} por empresa ativa`}</Propriedade>
            <Propriedade rotulo="Transferência">{c.transferencia === 'parcial' ? 'parcial: o contratante mantém a responsabilidade técnica (revisão obrigatória)' : 'total: anuência do cliente final anexada'}</Propriedade>
            <Propriedade rotulo="Aviso prévio">{`${c.contrato.aviso_previo_dias} dias`}</Propriedade>
            <Propriedade rotulo="Suboperadores (LGPD)">{c.suboperadores.join(', ')}</Propriedade>
          </dl>
        </Caixa>
        <Caixa>
          <TituloBloco descricao="Procuração da Receita não passa do contratante ao BPO (BPO-006).">Mapa de credenciais</TituloBloco>
          {c.procuracoes.length === 0 && <p className="text-muted-foreground text-sm">Importe as empresas na Carteira para mapear as credenciais.</p>}
          <ul className="flex flex-col gap-1.5 text-sm">
            {c.procuracoes.map((p) => (
              <li key={p.empresa} className="flex flex-wrap items-center gap-2">
                <span className="min-w-0 grow basis-40">{p.empresa}</span>
                <span className="w-full sm:w-56">
                  <CampoEscolha
                    rotulo={`Credencial de ${p.empresa}`}
                    valor={p.situacao}
                    onMudar={(v) => executar(() => repos.bpo.subinquilinos.atualizar(c.id, { procuracoes: c.procuracoes.map((x) => (x.empresa === p.empresa ? { ...x, situacao: v } : x)) }, { texto: `Credencial de ${p.empresa}: ${rotuloProcuracao[v]}` }))}
                    opcoes={(Object.keys(rotuloProcuracao) as (keyof typeof rotuloProcuracao)[]).map((k) => ({ valor: k, rotulo: rotuloProcuracao[k] }))}
                  />
                </span>
              </li>
            ))}
          </ul>
        </Caixa>
        <Caixa>
          <TituloBloco descricao="O cliente final vê a marca do contratante, nunca a do BPO (BPO-007, 008).">Marca e modo de contato</TituloBloco>
          <Campo rotulo="Tema do contratante (portal e app)">
            {(id) => <CampoEscolha id={id} valor={c.tema_id} onMudar={(v) => executar(() => repos.bpo.subinquilinos.atualizar(c.id, { tema_id: v }, { texto: `Tema do portal de ${c.nome}: ${temas.find((t) => t.id === v)?.nome_produto}` }), { sucesso: 'Tema do contratante aplicado' })} opcoes={temas.map((t) => ({ valor: t.id, rotulo: t.nome_produto }))} />}
          </Campo>
          <Campo rotulo="Modo de contato com o cliente final" ajuda="Por contratante: invisível, com a marca dele, ou direto.">
            {(id) => <CampoEscolha id={id} valor={c.modo_contato} onMudar={(v) => executar(() => repos.bpo.subinquilinos.atualizar(c.id, { modo_contato: v }, { texto: `Modo de contato de ${c.nome}: ${rotuloModoContato[v]}` }), { sucesso: 'Modo de contato salvo' })} opcoes={(Object.keys(rotuloModoContato) as Subinquilino['modo_contato'][]).map((k) => ({ valor: k, rotulo: rotuloModoContato[k] }))} />}
          </Campo>
        </Caixa>
        <Caixa>
          <TituloBloco
            descricao={`Sem preço por usuário. Teto de abuso: ${c.convidados_max} (editável; não é cobrança).`}
            acao={
              <SePode ferramenta="bpo.convidado.convidar">
                <Button size="sm" variant="outline" className="rounded-full" onClick={() => setConvidar(true)}>
                  <UserPlusIcon /> Convidar
                </Button>
              </SePode>
            }
          >
            Convidados ({ativos} de {c.convidados_max})
          </TituloBloco>
          <ul className="divide-border/70 flex flex-col divide-y text-sm" aria-label="Convidados do contratante">
            {c.convidados.map((g) => (
              <li key={g.id} className="flex flex-wrap items-center gap-2 py-2">
                <span className="min-w-0 grow basis-40">
                  {g.nome}
                  <span className="text-muted-foreground block text-xs">
                    {g.email} · {rotuloPapel(g.papel)}
                  </span>
                </span>
                <Badge variant={g.situacao === 'ativo' ? 'sucesso' : 'outline'}>{g.situacao === 'convidado' ? 'convite pendente' : g.situacao}</Badge>
                {pode && g.situacao === 'convidado' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-full"
                    onClick={() => {
                      eventoBpo(banco, `Convite reenviado a ${g.nome} (${c.nome})`, null, 'bpo.convidado.convidar')
                      loja.toast(`Convite reenviado a ${g.email}, com a marca de ${c.nome}`)
                    }}
                  >
                    Reenviar
                  </Button>
                )}
                {pode && g.situacao === 'desativado' && (
                  <Button size="sm" variant="ghost" className="rounded-full" onClick={() => executar(() => repos.bpo.convidados.atualizar(g.id, { situacao: 'convidado' }, { texto: `Reativou o convite de ${g.nome} (${c.nome})` }), { sucesso: 'Convite reenviado' })}>
                    Reativar
                  </Button>
                )}
                {pode && g.situacao !== 'desativado' && (
                  <Button size="sm" variant="ghost" className="rounded-full" onClick={async () => (await confirmar({ titulo: `Desativar ${g.nome}?`, descricao: 'Perde o acesso ao portal na hora. Dá para reativar depois.', acao: 'Desativar', perigo: true })) === true && executar(() => repos.bpo.convidados.atualizar(g.id, { situacao: 'desativado' }, { texto: `Desativou o convidado ${g.nome} de ${c.nome}` }), { sucesso: 'Convidado desativado' })}>
                    Desativar
                  </Button>
                )}
              </li>
            ))}
          </ul>
          {pode && (
            <span className="text-muted-foreground flex items-center gap-1 text-sm">
              Teto de convidados:
              <EdicaoEmLinha rotulo="Teto de convidados" valor={String(c.convidados_max)} validar={(v) => (Number.isInteger(Number(v)) && Number(v) > 0 && Number(v) <= 100 ? null : 'Um número de 1 a 100.')} onSalvar={(v) => void executar(() => repos.bpo.subinquilinos.atualizar(c.id, { convidados_max: Number(v) }, { texto: `Teto de convidados de ${c.nome}: ${v}` }), { sucesso: 'Teto salvo' })} className="w-14" />
            </span>
          )}
        </Caixa>
        <ProcedimentosContratante c={c} />
        <TrilhaContratante c={c} />
      </div>
      {convidar && (
        <ConvidarPessoa
          c={c}
          onFechar={() => setConvidar(false)}
          onConvidou={(nome) => {
            if (ativos + 1 > c.convidados_max) loja.avisar({ para: ['u1'], tipo: 'sistema', setor: 'bpo_financeiro', titulo: `${c.nome} passou do teto de convidados`, detalhe: `${ativos + 1} de ${c.convidados_max}: decida se aumenta o teto`, destino: { modulo: 'bpo', aba: 'configuracao' } })
            loja.toast(`Convite enviado a ${nome}, com a marca de ${c.nome}`)
          }}
        />
      )}
      {editar && <EditarContrato c={c} onFechar={() => setEditar(false)} />}
      {encerrar && <EncerrarContratante c={c} onFechar={() => setEncerrar(false)} />}
    </PaginaBpo>
  )
}

/** Convidar pessoa do contratante (S08-A45). */
function ConvidarPessoa({ c, onFechar, onConvidou }: { c: ContratanteVista; onFechar: () => void; onConvidou: (nome: string) => void }) {
  const executar = useAcao()
  const [r, setR] = useState({ nome: '', email: '', papel: 'equipe' as 'equipe' | 'responsavel_tecnico' | 'socio' })
  const repetido = c.convidados.some((g) => g.email.toLowerCase() === r.email.trim().toLowerCase())
  return (
    <GavetaFormulario
      aberta
      onFechar={onFechar}
      titulo={`Convidar para o portal de ${c.nome}`}
      descricao="O convidado vê a fila compartilhada, as revisões (se for responsável técnico), o relatório, o SLA e o extrato de volume. Nunca custo, horas, margem ou comentários internos."
      acao="Convidar"
      acaoDesabilitada={!r.nome.trim() || !/^\S+@\S+\.\S+$/.test(r.email) || repetido}
      onAcao={() => {
        const ok = executar(() => repos.bpo.convidados.criar({ subinquilino_id: c.id, nome: r.nome.trim(), email: r.email.trim(), papel: r.papel, situacao: 'convidado' }, { texto: `Convidou ${r.nome.trim()} para o portal de ${c.nome}` }))
        if (ok) {
          if (r.papel === 'responsavel_tecnico' && c.situacao === 'entrada') repos.bpo.subinquilinos.atualizar(c.id, { extras: { ...c.extras, entrada: { ...(c.extras?.entrada as object), [passosEntrada[5]]: true } } })
          onConvidou(r.nome.trim())
          onFechar()
        }
      }}
    >
      <Campo rotulo="Nome">{(id) => <CampoTexto id={id} valor={r.nome} onMudar={(v) => setR((x) => ({ ...x, nome: v }))} />}</Campo>
      <Campo rotulo="E-mail" erro={r.email && !/^\S+@\S+\.\S+$/.test(r.email) ? 'E-mail inválido.' : repetido ? 'Este e-mail já foi convidado.' : undefined}>
        {(id) => <CampoTexto id={id} valor={r.email} onMudar={(v) => setR((x) => ({ ...x, email: v }))} />}
      </Campo>
      <Campo rotulo="Papel">
        {(id) => (
          <CampoEscolha
            id={id}
            valor={r.papel}
            onMudar={(v) => setR((x) => ({ ...x, papel: v }))}
            opcoes={[
              { valor: 'equipe', rotulo: 'Equipe do contratante' },
              { valor: 'responsavel_tecnico', rotulo: 'Responsável técnico (aprova revisões)' },
              { valor: 'socio', rotulo: 'Sócio' },
            ]}
          />
        )}
      </Campo>
    </GavetaFormulario>
  )
}

function EditarContrato({ c, onFechar }: { c: ContratanteVista; onFechar: () => void }) {
  const executar = useAcao()
  const [r, setR] = useState({ escopo: c.escopo_mae, sla: String(c.contrato.sla_h), preco: String(c.contrato.preco_empresa), aviso: String(c.contrato.aviso_previo_dias), transferencia: c.transferencia, subs: c.suboperadores.join(', ') })
  return (
    <GavetaFormulario
      aberta
      onFechar={onFechar}
      titulo={`Contrato · ${c.nome}`}
      descricao="A mãe só vê os departamentos contratados (BPO-002)."
      acao="Salvar"
      acaoDesabilitada={r.escopo.length === 0 || !(Number(r.sla) > 0) || !(Number(r.aviso) >= 0)}
      onAcao={() => {
        const ok = executar(() => repos.bpo.subinquilinos.atualizar(c.id, { escopo_mae: r.escopo, transferencia: r.transferencia, contrato: { ...c.contrato, sla_h: Number(r.sla), preco_empresa: Number(r.preco) || c.contrato.preco_empresa, aviso_previo_dias: Number(r.aviso) }, suboperadores: r.subs.split(',').map((x) => x.trim()).filter(Boolean) }, { texto: `Atualizou o contrato de ${c.nome}` }), { sucesso: 'Contrato salvo' })
        if (ok) onFechar()
      }}
    >
      <Campo rotulo="Departamentos contratados">{() => <Fichas rotulo="Departamentos" valores={r.escopo} onMudar={(v) => setR((x) => ({ ...x, escopo: v }))} opcoes={['dp', 'fiscal', 'contabil', 'societario'].map((d) => ({ valor: d, rotulo: rotuloDepto[d] }))} />}</Campo>
      <Campo rotulo="SLA (horas por pedido completo)">{(id) => <CampoTexto id={id} tipo="number" valor={r.sla} onMudar={(v) => setR((x) => ({ ...x, sla: v }))} />}</Campo>
      <Campo rotulo="Preço por empresa ativa (R$)">{(id) => <CampoTexto id={id} tipo="number" valor={r.preco} onMudar={(v) => setR((x) => ({ ...x, preco: v }))} />}</Campo>
      <Campo rotulo="Aviso prévio (dias)">{(id) => <CampoTexto id={id} tipo="number" valor={r.aviso} onMudar={(v) => setR((x) => ({ ...x, aviso: v }))} />}</Campo>
      <Campo rotulo="Transferência">
        {(id) => (
          <CampoEscolha
            id={id}
            valor={r.transferencia}
            onMudar={(v) => setR((x) => ({ ...x, transferencia: v }))}
            opcoes={[
              { valor: 'parcial', rotulo: 'Parcial (o contratante revisa e mantém a responsabilidade)' },
              { valor: 'total', rotulo: 'Total (anuência escrita do cliente final)' },
            ]}
          />
        )}
      </Campo>
      <Campo rotulo="Suboperadores (separados por vírgula)">{(id) => <CampoTexto id={id} valor={r.subs} onMudar={(v) => setR((x) => ({ ...x, subs: v }))} />}</Campo>
    </GavetaFormulario>
  )
}

export { diasAte }

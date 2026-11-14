import { ArrowRightIcon, BellRingingIcon, CheckIcon, EyeIcon, FileTextIcon, LockSimpleIcon, PlusIcon, ScalesIcon, UserPlusIcon, XIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { useLoja } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import { BotaoAcoes, EstadoVazio, SePode, useAcao, useConfirmar, usePode } from '@/components/kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Campo, CampoEscolha, CampoTexto, Fichas, GavetaFormulario, Segmentado } from '@/components/ui/formulario'
import { cn } from '@/lib/utils'
import { banco } from '@/nucleo/banco'
import type { BolaBpo, BpoItemFila, Subinquilino } from '@/nucleo/modelo/entidades'
import { eventoBpo, repos } from '@/nucleo/repositorios'
import { temas } from '@/theme/temas'
import { BuildingsIcon } from '@phosphor-icons/react'
import { brl, CabecalhoBpo, Caixa, Numero, PaginaBpo, Propriedade, Regra, TituloBloco } from './comum'
import { agoraBpo, dataCurta, dataHora, diasAte, hojeBpo, quando, type ContratanteVista } from './dados'
import { rotuloBola, slaDe, useAcoesFila } from './OperacaoBpo'

export const rotuloDepto: Record<string, string> = { dp: 'DP', fiscal: 'Fiscal', contabil: 'Contábil', societario: 'Societário' }
const rotuloModoContato: Record<Subinquilino['modo_contato'], string> = { invisivel: 'invisível (o cliente final não vê o BPO)', marca: 'com a marca do contratante', direto: 'direto (o BPO fala em nome próprio)' }
const rotuloProcuracao = { outorgada: 'cliente final outorgou ao BPO', certificado_no_cofre: 'certificado do contratante no cofre', contratante_transmite: 'o BPO prepara, o contratante transmite' }

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
 */
export function ContratantesTela({ aba, contratante, contratantes, onContexto, onPortal }: Props) {
  if (!contratantes.length) return <PaginaBpo><EstadoVazio icone={BuildingsIcon} titulo="Nenhum contratante" descricao="O BPO entre escritórios é o modo multi-inquilino: cada contratante é um subinquilino com convidados próprios." /></PaginaBpo>
  if (aba === 'visao') return contratante ? <VisaoContratante c={contratante} onPortal={onPortal} /> : <VisaoMae contratantes={contratantes} onContexto={onContexto} />
  if (aba === 'carteira') return <CarteiraContratantes contratantes={contratante ? [contratante] : contratantes} mae={!contratante} onContexto={onContexto} />
  if (aba === 'fila') return contratante ? <FilaContratante c={contratante} /> : <MaeSemConteudo contratantes={contratantes} titulo="Fila compartilhada" onContexto={onContexto} />
  if (aba === 'rotinas') return <CalendarioEntregas contratantes={contratante ? [contratante] : contratantes} mae={!contratante} />
  if (aba === 'aprovacoes') return contratante ? <RevisoesContratante c={contratante} onPortal={onPortal} /> : <MaeSemConteudo contratantes={contratantes} titulo="Revisões do responsável técnico" onContexto={onContexto} />
  if (aba === 'entregas') return <EntregasContratantes contratantes={contratante ? [contratante] : contratantes} />
  if (aba === 'volume') return <VolumeContratantes contratantes={contratante ? [contratante] : contratantes} />
  if (aba === 'rentabilidade') return <RentabilidadeContratantes contratantes={contratante ? [contratante] : contratantes} />
  return <ConfigContratante contratantes={contratantes} contratante={contratante} onContexto={onContexto} onPortal={onPortal} />
}

/** Contexto mãe: listas, SLA e capacidade, sem abrir conteúdo e sem IA (10, 4.1). */
function VisaoMae({ contratantes, onContexto }: { contratantes: ContratanteVista[]; onContexto: (id: string) => void }) {
  const { permissoes } = useSessao()
  const empresas = contratantes.reduce((s, c) => s + c.clientes_finais.length, 0)
  const sla = Math.round(contratantes.reduce((s, c) => s + c.sla_mes, 0) / contratantes.length)
  return (
    <PaginaBpo>
      <CabecalhoBpo integrante={null} titulo="BPO entre escritórios" sub="Contexto mãe: listas, SLA e capacidade de todos os contratantes, sem abrir conteúdo e sem IA. Abra um contratante para trabalhar nele." />
      <Caixa>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Numero valor={contratantes.length} rotulo="contratantes" />
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
                <span className="block truncate font-medium">{c.nome}</span>
                <span className="text-muted-foreground block truncate text-xs">{c.escopo_mae.map((d) => rotuloDepto[d] ?? d).join(', ')} · transferência {c.transferencia}</span>
              </span>
              <span className="md:text-right">
                <span className="text-muted-foreground text-xs md:hidden">Empresas </span>
                {c.clientes_finais.length}
              </span>
              <span className={cn('md:text-right', c.sla_mes < 90 && 'text-destructive')}>
                <span className="text-muted-foreground text-xs md:hidden">No prazo </span>
                {c.sla_mes}%{c.sla_mes < 90 && ' · atenção'}
              </span>
              <span className="md:text-right">
                <span className="text-muted-foreground text-xs md:hidden">Bola BPO </span>
                {c.bolaBpo}
              </span>
              <span className="md:text-right">
                <span className="text-muted-foreground text-xs md:hidden">Bola contratante </span>
                {c.bolaContratante}
              </span>
              <span className={cn('md:text-right', c.margem < 20 && 'text-destructive')}>
                <span className="text-muted-foreground text-xs md:hidden">Margem </span>
                {permissoes.bpoMargem ? `${c.margem}%` : '—'}
              </span>
              <Button size="sm" variant="outline" className="col-span-2 w-fit rounded-full md:col-span-1" onClick={() => onContexto(c.id)}>
                Abrir contratante <ArrowRightIcon />
              </Button>
            </li>
          ))}
        </ul>
      </Caixa>
      {!permissoes.bpoMargem && <p className="text-muted-foreground text-xs">A margem só aparece para o Administrador (nunca liberável por exceção).</p>}
    </PaginaBpo>
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
            <TituloBloco descricao={`SLA ${c.sla_mes}% · ${c.fila.length} itens abertos`}>{c.nome}</TituloBloco>
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

function VisaoContratante({ c, onPortal }: { c: ContratanteVista; onPortal: (id: string) => void }) {
  const revisoes = c.fila.filter((f) => f.tipo === 'revisao')
  return (
    <PaginaBpo>
      <CabecalhoBpo integrante="i-atendimento" titulo={c.nome} sub={`Contexto do contratante · ${c.clientes_finais.length} empresas · ${c.escopo_mae.map((d) => rotuloDepto[d] ?? d).join(', ')} · contato ${rotuloModoContato[c.modo_contato]}`} status={`SLA e fila de ${c.nome}: memória só deste contratante`}>
        <Button size="sm" variant="outline" className="rounded-full" onClick={() => onPortal(c.id)}>
          <EyeIcon /> Ver o portal do convidado
        </Button>
      </CabecalhoBpo>
      <Caixa>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Numero valor={`${c.sla_mes}%`} rotulo="SLA do mês" detalhe={`meta do contrato: ${c.contrato.sla_h} h`} />
          <Numero valor={c.bolaBpo} rotulo="com o BPO" detalhe={`${c.emRisco} em risco`} />
          <Numero valor={c.bolaContratante} rotulo="com o contratante ou o cliente final" detalhe="SLA pausado" />
          <Numero valor={revisoes.length} rotulo="revisões do responsável técnico" detalhe={c.transferencia === 'parcial' ? 'transferência parcial: o RT revisa' : 'transferência total'} />
        </div>
      </Caixa>
      <div className="grid gap-4 lg:grid-cols-2">
        <Caixa>
          <TituloBloco descricao="O que vence primeiro.">Fila</TituloBloco>
          <ul className="flex flex-col gap-1.5 text-sm">
            {[...c.fila].sort((a, b) => a.prazo.localeCompare(b.prazo)).slice(0, 6).map((f) => (
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
          <TituloBloco descricao="Convidados sem preço por usuário.">Convidados</TituloBloco>
          <ul className="flex flex-col gap-1 text-sm">
            {c.convidados.map((g) => (
              <li key={g.id} className="flex gap-2">
                <span className="flex-1">{g.nome}</span>
                <span className="text-muted-foreground text-xs">{g.papel === 'responsavel_tecnico' ? 'responsável técnico' : g.papel === 'socio' ? 'sócio' : 'equipe'} · {g.situacao}</span>
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

function CarteiraContratantes({ contratantes, mae, onContexto }: { contratantes: ContratanteVista[]; mae: boolean; onContexto: (id: string) => void }) {
  return (
    <PaginaBpo>
      <CabecalhoBpo integrante={mae ? null : 'i-atendimento'} titulo="Carteira" sub={mae ? 'Contratantes e, dentro, as empresas (só os departamentos contratados)' : 'As empresas deste contratante, nos departamentos contratados'} />
      {contratantes.map((c) => (
        <Caixa key={c.id}>
          <TituloBloco
            descricao={`${c.cnpj} · desde ${dataCurta(c.contrato.inicio)}/${c.contrato.inicio.slice(0, 4)} · ${c.situacao === 'ativo' ? 'ativo' : c.situacao}`}
            acao={
              mae && (
                <Button size="sm" variant="ghost" className="rounded-full" onClick={() => onContexto(c.id)}>
                  Abrir <ArrowRightIcon />
                </Button>
              )
            }
          >
            {c.nome}
          </TituloBloco>
          {mae ? (
            <p className="text-muted-foreground text-sm">
              {c.clientes_finais.length} empresas · {c.escopo_mae.map((d) => rotuloDepto[d] ?? d).join(', ')} · SLA {c.sla_mes}%
            </p>
          ) : (
            <ul className="divide-border/70 flex flex-col divide-y text-sm">
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
                      {f.departamentos.filter((d) => c.escopo_mae.includes(d)).map((d) => (
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
    </PaginaBpo>
  )
}

/** Fila compartilhada do contratante (10, 4.3): bola BPO, contratante, cliente final ou terceiro; SLA pausa fora do BPO. */
function FilaContratante({ c }: { c: ContratanteVista }) {
  const [bola, setBola] = useState<'todas' | BolaBpo>('todas')
  const [novo, setNovo] = useState(false)
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
        {lista.length === 0 && <p className="text-muted-foreground py-4 text-sm">Nada aqui.</p>}
        <ul className="divide-border/70 flex flex-col divide-y" aria-label="Fila do contratante">
          {lista.map((f) => {
            const sla = slaDe(f)
            return (
              <li key={f.id} className="flex flex-wrap items-center gap-3 py-3 text-sm">
                <span className="min-w-0 flex-1 basis-64">
                  <span className="block">{f.texto}</span>
                  <span className="text-muted-foreground block truncate text-xs">
                    {f.cliente_final} · {rotuloDepto[f.departamento ?? ''] ?? f.departamento} · {f.codigo} · {f.responsavel_nome}
                    {f.detalhe && ` · ${f.detalhe}`}
                  </span>
                  <span className={cn('block text-xs', sla.tom === 'erro' ? 'text-destructive' : sla.tom === 'atencao' ? 'text-warning-foreground' : 'text-muted-foreground')}>
                    {sla.texto}
                    {f.prazo_legal && ` · prazo legal ${quando(f.prazo_legal)}`}
                  </span>
                </span>
                <Badge variant={f.bola === 'bpo' ? 'destaque' : 'outline'}>{rotuloBola[f.bola]}</Badge>
                {f.faltando.length > 0 ? (
                  f.faltando.map((x) => (
                    <Button key={x} size="sm" variant="outline" className="rounded-full" onClick={() => executar(() => repos.bpo.fila.completar(f.id, x), { sucesso: `Chegou: ${x}` })}>
                      <CheckIcon /> Chegou {x}
                    </Button>
                  ))
                ) : f.bola === 'bpo' ? (
                  <Button size="sm" variant="outline" className="rounded-full" onClick={() => executar(() => repos.bpo.fila.resolver(f.id), { sucesso: `Concluído: ${f.texto}` })}>
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
    </PaginaBpo>
  )
}

/** Pedido na fila do contratante (equipe do BPO ou convidado no portal), com completude (BPO-009). */
export function PedidoContratante({ c, onFechar, canal, comoConvidado }: { c: ContratanteVista; onFechar: () => void; canal: BpoItemFila['canal']; comoConvidado?: (f: () => void) => void }) {
  const executar = useAcao()
  const [r, setR] = useState({ empresa: c.clientes_finais[0]?.nome ?? '', depto: c.escopo_mae[0] ?? 'dp', texto: '', prazo: '', documentos: false })
  const faltando = r.documentos ? [] : ['documentos do cliente final']
  return (
    <GavetaFormulario
      aberta
      onFechar={onFechar}
      titulo={`Novo pedido · ${c.nome}`}
      descricao="O SLA começa quando o pedido fica completo."
      acao="Abrir o pedido"
      acaoDesabilitada={!r.texto.trim() || !r.prazo}
      onAcao={() => {
        const criar = () =>
          repos.bpo.fila.criarPedido({ subinquilino_id: c.id, cliente_final: r.empresa, departamento: r.depto, tipo: 'pedido', texto: r.texto.trim(), codigo: r.depto === 'dp' ? 'DP-001' : r.depto === 'fiscal' ? 'FIS-009' : 'CTB-001', canal, prazo: r.prazo, bola: 'bpo', responsavel_nome: 'Lucas Prado', faltando, sla_meta_h: c.contrato.sla_h, visibilidade: 'compartilhada' })
        const ok = comoConvidado ? (comoConvidado(() => void executar(criar, { sucesso: 'Pedido enviado ao BPO' })), true) : executar(criar, { sucesso: faltando.length ? 'Pedido aberto: falta documento do cliente final' : 'Pedido completo: o SLA começou' })
        if (ok) onFechar()
      }}
    >
      <Campo rotulo="Empresa">{(id) => <CampoEscolha id={id} valor={r.empresa} onMudar={(v) => setR((x) => ({ ...x, empresa: v }))} opcoes={c.clientes_finais.map((f) => ({ valor: f.nome, rotulo: f.nome }))} />}</Campo>
      <Campo rotulo="Departamento">{(id) => <CampoEscolha id={id} valor={r.depto} onMudar={(v) => setR((x) => ({ ...x, depto: v }))} opcoes={c.escopo_mae.map((d) => ({ valor: d, rotulo: rotuloDepto[d] ?? d }))} />}</Campo>
      <Campo rotulo="Pedido">{(id) => <CampoTexto id={id} valor={r.texto} onMudar={(v) => setR((x) => ({ ...x, texto: v }))} placeholder="Ex.: Admissão de fulano a partir de 01/12" />}</Campo>
      <Campo rotulo="Prazo">{(id) => <CampoTexto id={id} tipo="date" valor={r.prazo} onMudar={(v) => setR((x) => ({ ...x, prazo: v }))} />}</Campo>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" className="accent-foreground size-4" checked={r.documentos} onChange={(ev) => setR((x) => ({ ...x, documentos: ev.target.checked }))} /> Os documentos do cliente final já foram anexados
      </label>
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
              <li key={d} className={cn('flex gap-3 rounded-[12px] px-2 py-1.5 text-sm', d === hojeBpo && 'bg-sunken/60')}>
                <span className="text-muted-foreground w-16 shrink-0 text-xs">{quando(d)}</span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  {itens.length === 0 && <span className="text-muted-foreground text-xs">—</span>}
                  {itens.map(({ c, f }) => (
                    <span key={f.id} className="truncate">
                      {mae ? `${c.nome}: 1 entrega (${rotuloDepto[f.departamento ?? ''] ?? ''})` : `${f.texto} · ${f.cliente_final}`}
                      {f.prazo_legal === d && <Badge variant="erro" className="ml-2">prazo legal</Badge>}
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
  const revisoes = c.fila.filter((f) => f.tipo === 'revisao')
  const rt = c.convidados.find((g) => g.papel === 'responsavel_tecnico' && g.situacao === 'ativo')
  const loja = useLoja()
  return (
    <PaginaBpo>
      <CabecalhoBpo integrante="i-atendimento" titulo="Aprovações" sub={`${c.nome} · transferência ${c.transferencia}: ${c.transferencia === 'parcial' ? 'transmissão e demonstração só depois da revisão do responsável técnico do contratante' : 'o BPO assume a responsabilidade, com a anuência do cliente final anexada'}`}>
        <Button size="sm" variant="outline" className="rounded-full" onClick={() => onPortal(c.id)}>
          <EyeIcon /> Ver como o responsável técnico
        </Button>
      </CabecalhoBpo>
      <Regra icone={<LockSimpleIcon weight="duotone" />}>Transmitir sem a revisão registrada do responsável técnico fica bloqueado (NBC PG 01, item 5 c). A revisão é tarefa de risco alto, com o resumo do que mudou.</Regra>
      {revisoes.length === 0 ? (
        <EstadoVazio compacto titulo="Nenhuma revisão pendente" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {revisoes.map((f) => {
            const aprovado = f.bola === 'bpo' && /pode transmitir/i.test(f.detalhe ?? '') && /aprovou/i.test(f.detalhe ?? '')
            return (
              <Caixa key={f.id}>
                <TituloBloco descricao={`${f.cliente_final} · ${f.codigo} · prazo legal ${quando(f.prazo_legal ?? f.prazo)}`}>{f.texto}</TituloBloco>
                <Badge className="w-fit" variant={aprovado ? 'sucesso' : 'destaque'}>
                  {aprovado ? 'aprovado: pode transmitir' : `aguardando ${rt?.nome ?? 'o responsável técnico'}`}
                </Badge>
                <p className="text-muted-foreground text-xs">{f.detalhe}</p>
                {!aprovado && (
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
              </Caixa>
            )
          })}
        </div>
      )}
    </PaginaBpo>
  )
}

/** Entregas: relatório do contratante (BPO-012) com a marca dele e o SLA (BPO-011). */
function EntregasContratantes({ contratantes }: { contratantes: ContratanteVista[] }) {
  const executar = useAcao()
  const { usuario } = useSessao()
  return (
    <PaginaBpo>
      <CabecalhoBpo integrante={contratantes.length === 1 ? 'i-atendimento' : null} titulo="Entregas e SLA" sub="Relatório mensal do contratante, com a marca dele: entregas com recibo, guias, pendências e o SLA, com cada desvio explicado" />
      <div className="grid gap-4 md:grid-cols-2">
        {contratantes.map((c) => {
          const rel = c.entregas.find((e) => e.tipo === 'relatorio_contratante' && e.competencia === '2026-10')
          return (
            <Caixa key={c.id}>
              <TituloBloco descricao={`SLA ${c.sla_mes}% · contrato ${c.contrato.sla_h} h`}>{c.nome}</TituloBloco>
              <ul className="text-muted-foreground flex flex-col gap-1 text-xs">
                <li>desvios do contratante: {c.fila.filter((f) => f.bola === 'contratante' || f.bola === 'cliente_final').length} item(ns) com a bola fora</li>
                <li>desvios do BPO: {c.sla_mes < 90 ? '3 entregas depois do prazo do contrato' : 'nenhum'}</li>
              </ul>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <FileTextIcon className="text-muted-foreground size-4" />
                <span className="flex-1">Relatório de outubro (marca do contratante)</span>
                {rel?.situacao === 'enviado' ? (
                  <Badge variant="sucesso">enviado {dataHora(rel.enviado_em)}</Badge>
                ) : (
                  rel && (
                    <SePode ferramenta="bpo.relatorio_mensal">
                      <Button size="sm" variant="outline" className="rounded-full" onClick={() => executar(() => repos.bpo.entregas.atualizar(rel.id, { situacao: 'enviado', enviado_em: agoraBpo(), enviado_por: usuario.nome }, { texto: `Relatório de outubro enviado a ${c.nome}` }), { sucesso: `Relatório no portal de ${c.nome}` })}>
                        Fechar e enviar
                      </Button>
                    </SePode>
                  )
                )}
              </div>
            </Caixa>
          )
        })}
      </div>
    </PaginaBpo>
  )
}

/** Volume e faturamento entre escritórios: extrato com contestação e glosa antes da fatura (BPO-015). */
function VolumeContratantes({ contratantes }: { contratantes: ContratanteVista[] }) {
  const executar = useAcao()
  const confirmar = useConfirmar()
  const { usuario } = useSessao()
  return (
    <PaginaBpo>
      <CabecalhoBpo integrante={null} titulo="Volume e faturamento" sub="O contratante vê o extrato antes da fatura e pode contestar; o aceito vira glosa" />
      <div className="grid gap-4 md:grid-cols-2">
        {contratantes.map((c) => {
          const v = c.volume
          if (!v) return null
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
                  <span className="min-w-0 flex-1">
                    {x.quantidade} {x.unidade}: {x.motivo} · {x.por}
                  </span>
                  {x.situacao === 'aberta' ? (
                    <>
                      <Button size="sm" variant="outline" className="rounded-full" onClick={() => executar(() => repos.bpo.volumes.atualizar(v.id, { contestacoes: v.contestacoes.map((y) => (y.id === x.id ? { ...y, situacao: 'aceita' as const } : y)), situacao: 'aberto' }, { texto: `Contestação de ${c.nome} aceita: glosa` }), { sucesso: 'Glosa aplicada' })}>
                        <CheckIcon /> Aceitar
                      </Button>
                      <Button size="sm" variant="ghost" className="rounded-full" onClick={() => executar(() => repos.bpo.volumes.atualizar(v.id, { contestacoes: v.contestacoes.map((y) => (y.id === x.id ? { ...y, situacao: 'recusada' as const } : y)), situacao: 'aberto' }, { texto: `Contestação de ${c.nome} recusada` }), { sucesso: 'Contestação recusada' })}>
                        <XIcon /> Recusar
                      </Button>
                    </>
                  ) : (
                    <Badge variant="outline">{x.situacao}</Badge>
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
                      onClick={async () => {
                        const ok = await confirmar({ titulo: `Faturar ${brl(total)} a ${c.nome}?`, descricao: 'Vai para a fatura do contratante no Financeiro (o contratante é cliente do BPO).', acao: 'Faturar' })
                        if (ok === true) executar(() => repos.bpo.volumes.atualizar(v.id, { situacao: 'faturado', extra_valor: total, faturado_por: usuario.nome }, { ferramenta: 'bpo.volume.faturar', texto: `Volume de ${c.nome} faturado (${brl(total)})` }), { sucesso: 'Faturado no Financeiro' })
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
    </PaginaBpo>
  )
}

function RentabilidadeContratantes({ contratantes }: { contratantes: ContratanteVista[] }) {
  return (
    <PaginaBpo>
      <CabecalhoBpo integrante={null} titulo="Rentabilidade e capacidade" sub="Margem por contratante e por departamento; horas do Timesheet com o filtro de contratante" />
      <Caixa className="gap-0">
        <ul className="divide-border/70 flex flex-col divide-y text-sm" aria-label="Margem por contratante">
          {contratantes.map((c) => (
            <li key={c.id} className="flex flex-col gap-1 py-3">
              <span className="flex items-center gap-3">
                <span className="min-w-0 flex-1 truncate font-medium">{c.nome}</span>
                <span className="text-muted-foreground text-xs tabular-nums">
                  {c.horas_mes} h · {brl(c.honorario_mes)}
                </span>
                <span className={cn('w-12 text-right tabular-nums', c.margem < 20 && 'text-destructive')}>{c.margem}%</span>
              </span>
              <span className="text-muted-foreground flex flex-wrap gap-x-4 text-xs">
                {c.escopo_mae.map((d, i) => (
                  <span key={d}>
                    {rotuloDepto[d] ?? d}: {Math.max(0, c.margem + (i === 0 ? 6 : -4 * i))}% · {Math.round(c.horas_mes / c.escopo_mae.length)} h
                  </span>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </Caixa>
    </PaginaBpo>
  )
}

/** Configuração entre escritórios (S08-A39, A45, A46): contrato, escopo, suboperadores, procurações, marca, convidados e teto, modo de contato. */
function ConfigContratante({ contratantes, contratante, onContexto, onPortal }: { contratantes: ContratanteVista[]; contratante?: ContratanteVista; onContexto: (id: string) => void; onPortal: (id: string) => void }) {
  const executar = useAcao()
  const confirmar = useConfirmar()
  const loja = useLoja()
  const pode = usePode('bpo.contratante.configurar')
  const [convidar, setConvidar] = useState(false)
  const [editar, setEditar] = useState(false)
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
      </CabecalhoBpo>
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
          <ul className="flex flex-col gap-1.5 text-sm">
            {c.procuracoes.map((p) => (
              <li key={p.empresa} className="flex flex-wrap items-center gap-2">
                <span className="min-w-0 flex-1">{p.empresa}</span>
                <span className="w-56">
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
                <span className="min-w-0 flex-1">
                  {g.nome}
                  <span className="text-muted-foreground block text-xs">
                    {g.email} · {g.papel === 'responsavel_tecnico' ? 'responsável técnico' : g.papel === 'socio' ? 'sócio' : 'equipe'}
                  </span>
                </span>
                <Badge variant={g.situacao === 'ativo' ? 'sucesso' : 'outline'}>{g.situacao}</Badge>
                {pode && g.situacao !== 'desativado' && (
                  <Button size="sm" variant="ghost" className="rounded-full" onClick={async () => (await confirmar({ titulo: `Desativar ${g.nome}?`, acao: 'Desativar', perigo: true })) === true && executar(() => repos.bpo.convidados.atualizar(g.id, { situacao: 'desativado' }, { texto: `Desativou o convidado ${g.nome} de ${c.nome}` }), { sucesso: 'Convidado desativado' })}>
                    Desativar
                  </Button>
                )}
              </li>
            ))}
          </ul>
          {pode && (
            <Campo rotulo="Teto de convidados">
              {(id) => <CampoTexto id={id} tipo="number" valor={String(c.convidados_max)} onMudar={(v) => Number(v) > 0 && executar(() => repos.bpo.subinquilinos.atualizar(c.id, { convidados_max: Number(v) }, { texto: `Teto de convidados de ${c.nome}: ${v}` }))} />}
            </Campo>
          )}
        </Caixa>
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
    </PaginaBpo>
  )
}

/** Convidar pessoa do contratante (S08-A45). */
function ConvidarPessoa({ c, onFechar, onConvidou }: { c: ContratanteVista; onFechar: () => void; onConvidou: (nome: string) => void }) {
  const executar = useAcao()
  const [r, setR] = useState({ nome: '', email: '', papel: 'equipe' as 'equipe' | 'responsavel_tecnico' | 'socio' })
  return (
    <GavetaFormulario
      aberta
      onFechar={onFechar}
      titulo={`Convidar para o portal de ${c.nome}`}
      descricao="O convidado vê a fila compartilhada, as revisões (se for responsável técnico), o relatório, o SLA e o extrato de volume. Nunca custo, horas, margem ou comentários internos."
      acao="Convidar"
      acaoDesabilitada={!r.nome.trim() || !/^\S+@\S+\.\S+$/.test(r.email)}
      onAcao={() => {
        const ok = executar(() => repos.bpo.convidados.criar({ subinquilino_id: c.id, nome: r.nome.trim(), email: r.email.trim(), papel: r.papel, situacao: 'convidado' }, { texto: `Convidou ${r.nome.trim()} para o portal de ${c.nome}` }))
        if (ok) {
          onConvidou(r.nome.trim())
          onFechar()
        }
      }}
    >
      <Campo rotulo="Nome">{(id) => <CampoTexto id={id} valor={r.nome} onMudar={(v) => setR((x) => ({ ...x, nome: v }))} />}</Campo>
      <Campo rotulo="E-mail" erro={r.email && !/^\S+@\S+\.\S+$/.test(r.email) ? 'E-mail inválido.' : undefined}>
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
  const [r, setR] = useState({ escopo: c.escopo_mae, sla: String(c.contrato.sla_h), preco: String(c.contrato.preco_empresa), transferencia: c.transferencia, subs: c.suboperadores.join(', ') })
  return (
    <GavetaFormulario
      aberta
      onFechar={onFechar}
      titulo={`Contrato · ${c.nome}`}
      descricao="A mãe só vê os departamentos contratados (BPO-002)."
      acao="Salvar"
      acaoDesabilitada={r.escopo.length === 0 || !(Number(r.sla) > 0)}
      onAcao={() => {
        const ok = executar(() => repos.bpo.subinquilinos.atualizar(c.id, { escopo_mae: r.escopo, transferencia: r.transferencia, contrato: { ...c.contrato, sla_h: Number(r.sla), preco_empresa: Number(r.preco) || c.contrato.preco_empresa }, suboperadores: r.subs.split(',').map((x) => x.trim()).filter(Boolean) }, { texto: `Atualizou o contrato de ${c.nome}` }), { sucesso: 'Contrato salvo' })
        if (ok) onFechar()
      }}
    >
      <Campo rotulo="Departamentos contratados">
        {() => <Fichas rotulo="Departamentos" valores={r.escopo} onMudar={(v) => setR((x) => ({ ...x, escopo: v }))} opcoes={['dp', 'fiscal', 'contabil', 'societario'].map((d) => ({ valor: d, rotulo: rotuloDepto[d] }))} />}
      </Campo>
      <Campo rotulo="SLA (horas por pedido completo)">{(id) => <CampoTexto id={id} tipo="number" valor={r.sla} onMudar={(v) => setR((x) => ({ ...x, sla: v }))} />}</Campo>
      <Campo rotulo="Preço por empresa ativa (R$)">{(id) => <CampoTexto id={id} tipo="number" valor={r.preco} onMudar={(v) => setR((x) => ({ ...x, preco: v }))} />}</Campo>
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

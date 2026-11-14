import { ArrowRightIcon, BellRingingIcon, CaretDownIcon, CheckIcon, GearSixIcon, ListChecksIcon, PlusIcon, TrashIcon, TrayIcon, UserSwitchIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { useLoja } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import { BotaoAcoes, EdicaoEmLinha, EstadoVazio, ListaOrdenavel, Quadro, SePode, useAcao, useConfirmar, usePode, type AcaoMenu } from '@/components/kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Campo, CampoEscolha, CampoTexto, GavetaFormulario, Interruptor, Segmentado } from '@/components/ui/formulario'
import { Tooltip } from '@/components/ui/tooltip'
import { agenda, diasSemana } from '@/dados/exemplo'
import { cn } from '@/lib/utils'
import { banco } from '@/nucleo/banco'
import type { BolaBpo, BpoItemFila, BpoRotina } from '@/nucleo/modelo/entidades'
import { agora, eventoBpo, repos } from '@/nucleo/repositorios'
import { useTema } from '@/theme/ThemeProvider'
import { PendentesConciliacao, SeloTitular } from '../financeiro/pecas'
import { BotaoErp, brl, CabecalhoBpo, Caixa, PaginaBpo, SeloErp, TituloBloco, useAbrirErp, type PropsBpo } from './comum'
import { agoraBpo, corAudit, dataHora, diasAte, hojeBpo, quando, useBpo, type EmpresaVista } from './dados'
import { useEquipeBpo } from './FichaEmpresa'
import { usePedirBpo } from './integrantes'

type FiltroBola = 'todas' | 'bpo' | 'cliente'
export const rotuloBola: Record<BolaBpo, string> = { bpo: 'conosco', cliente: 'com o cliente', contratante: 'com o contratante', cliente_final: 'com o cliente final', terceiro: 'com terceiro' }

/** Estado do SLA do item (10, 4.3): começa com o pedido completo; pausa quando a bola está fora. */
export function slaDe(f: BpoItemFila) {
  if (f.faltando.length) return { texto: `SLA não começou: falta ${f.faltando.join(', ')}`, tom: 'neutro' as const }
  if (f.bola !== 'bpo') return { texto: `SLA pausado (bola ${rotuloBola[f.bola]})`, tom: 'neutro' as const }
  const d = diasAte(f.prazo)
  return d < 0 ? { texto: `SLA estourado (prazo ${quando(f.prazo)})`, tom: 'erro' as const } : d === 0 ? { texto: `SLA corre: vence hoje (meta ${f.sla_meta_h} h)`, tom: 'atencao' as const } : { texto: `SLA corre (meta ${f.sla_meta_h} h, prazo ${quando(f.prazo)})`, tom: 'ok' as const }
}

/** Ações do item da fila (A15 passar a bola, A16 executar, A17 reatribuir), em menu e em botão. */
export function useAcoesFila() {
  const executar = useAcao()
  const confirmar = useConfirmar()
  const loja = useLoja()
  const equipe = useEquipeBpo()
  const podeReatribuir = usePode('fila.reatribuir')
  const passar = async (f: BpoItemFila, para: BolaBpo) => {
    const motivo = await confirmar({ titulo: `Passar a bola para ${rotuloBola[para].replace('com ', '').replace('conosco', 'o BPO')}?`, descricao: para === 'bpo' ? 'O SLA volta a correr.' : 'O SLA pausa até a resposta; o integrante cobra se a bola parar.', acao: 'Passar a bola', exigirMotivo: true, rotuloMotivo: 'O que falta ou por quê (vai para quem recebe)' })
    if (typeof motivo === 'string') executar(() => repos.bpo.fila.passarBola(f.id, para, motivo), { sucesso: `Bola ${rotuloBola[para]}` })
  }
  const menu = (f: BpoItemFila, bolas: BolaBpo[]): AcaoMenu[] => [
    ...bolas.filter((b) => b !== f.bola).map((b) => ({ rotulo: `Passar a bola: ${rotuloBola[b]}`, icone: <ArrowRightIcon />, onSelecionar: () => void passar(f, b) })),
    ...equipe
      .filter((u) => u.nome !== f.responsavel_nome)
      .map((u, i) => ({ rotulo: `Reatribuir a ${u.nome}`, icone: <UserSwitchIcon />, separar: i === 0, motivo: podeReatribuir ? undefined : 'Só o Gestor do BPO reatribui.', onSelecionar: () => executar(() => repos.bpo.fila.reatribuir(f.id, u.nome), { sucesso: `${f.texto} com ${u.nome}` }) })),
    {
      rotulo: 'Lembrar quem está com a bola',
      icone: <BellRingingIcon />,
      separar: true,
      onSelecionar: () => {
        eventoBpo(banco, `Lembrete: ${f.texto} (bola ${rotuloBola[f.bola]})`, f.cliente_id)
        loja.toast(`Lembrete enviado (${f.bola === 'bpo' ? `a ${f.responsavel_nome}` : 'pelo app e WhatsApp'})`)
      },
    },
  ]
  return { passar, menu, executar }
}

/**
 * BPO › Fila e pedidos (S08-T03; 10, 5.3 e BPO-009/010): pedidos dos clientes
 * e pendências da operação, com a bola de cada um e o SLA, que só começa com o
 * pedido completo. Lista ou por responsável (arrastar reatribui).
 */
export function FilaBpoTela({ empresa, onEscolher }: PropsBpo) {
  const { empresas } = useBpo()
  const { permissoes } = useSessao()
  const [bola, setBola] = useState<FiltroBola>('todas')
  const [visao, setVisao] = useState<'lista' | 'responsavel'>('lista')
  const [excecao, setExcecao] = useState(true)
  const [novo, setNovo] = useState(false)
  const acoes = useAcoesFila()
  const podeReatribuir = usePode('fila.reatribuir')
  const equipe = useEquipeBpo()
  const lista = empresa ? [empresa] : empresas
  const base = lista.flatMap((e) => e.fila.map((f) => ({ e, f })))
  // Gestão por exceção: o que é de empresa em dia e não vence hoje fica recolhido.
  const emDia = ({ e, f }: { e: EmpresaVista; f: BpoItemFila }) => e.audit.cor === 'verde' && diasAte(f.prazo) > 0 && !f.faltando.length
  const filtrada = base.filter((x) => (bola === 'todas' || x.f.bola === bola) && (!excecao || empresa || !emDia(x))).sort((a, b) => a.f.prazo.localeCompare(b.f.prazo))
  const recolhidos = !empresa && excecao ? base.filter(emDia).length : 0
  return (
    <PaginaBpo>
      <CabecalhoBpo
        titulo="Fila e pedidos"
        sub={empresa ? `${empresa.nome} · pedidos pelo app, WhatsApp e e-mail viram item com prazo` : 'Pedidos dos clientes e pendências da operação, pelo prazo'}
        status={`${base.filter((x) => x.f.bola === 'bpo').length} conosco, ${base.filter((x) => x.f.bola === 'cliente').length} com os clientes`}
      >
        {empresa && <SeloTitular titular={{ tipo: 'empresa', clienteId: empresa.clienteId, nome: empresa.nome }} />}
        <SePode ferramenta="fila.criar">
          <Button size="sm" className="rounded-full" onClick={() => setNovo(true)}>
            <PlusIcon /> Pedido
          </Button>
        </SePode>
      </CabecalhoBpo>
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
            ]}
          />
          <Segmentado
            rotulo="Visão da fila"
            valor={visao}
            onMudar={setVisao}
            opcoes={[
              { valor: 'lista', rotulo: 'Lista' },
              { valor: 'responsavel', rotulo: 'Por responsável' },
            ]}
          />
          {!empresa && (
            <span className="ml-auto">
              <Interruptor ligado={excecao} onMudar={setExcecao} rotulo="Só fora do verde" />
            </span>
          )}
        </div>
        {filtrada.length === 0 && <EstadoVazio compacto icone={TrayIcon} titulo="Nada aqui" descricao={bola === 'todas' ? 'A fila está vazia.' : 'Nenhum item com a bola aí.'} />}
        {visao === 'lista' ? (
          <ul className="divide-border/70 flex flex-col divide-y" aria-label="Fila do BPO">
            {filtrada.map(({ e, f }) => (
              <ItemFila key={f.id} e={e} f={f} mostrarEmpresa={!empresa} menu={acoes.menu(f, ['bpo', 'cliente', 'terceiro'])} onEscolher={onEscolher} />
            ))}
          </ul>
        ) : (
          <Quadro
            colunas={equipe.map((u) => ({ id: u.nome, titulo: u.nome }))}
            itens={filtrada}
            idDe={(x) => x.f.id}
            colunaDe={(x) => x.f.responsavel_nome ?? ''}
            rotuloDe={(x) => x.f.texto}
            desabilitado={!podeReatribuir}
            onMover={(id, coluna) => acoes.executar(() => repos.bpo.fila.reatribuir(id, coluna), { sucesso: `Reatribuído a ${coluna}` })}
            render={({ e, f }) => (
              <div className="flex flex-col gap-1 text-sm">
                <span>{f.texto}</span>
                <span className="text-muted-foreground text-xs">
                  {e.nome} · {rotuloBola[f.bola]} · {quando(f.prazo)}
                </span>
              </div>
            )}
          />
        )}
        {recolhidos > 0 && (
          <button type="button" className="text-muted-foreground flex w-fit cursor-pointer items-center gap-1.5 text-xs" onClick={() => setExcecao(false)}>
            <CaretDownIcon /> {recolhidos} item{recolhidos > 1 ? 's' : ''} de empresas em dia
          </button>
        )}
        {permissoes.abas.bpo?.includes('volume') && <p className="text-muted-foreground text-xs">O integrante reordena por risco e avisa a bola parada; a resposta média do cliente entra no SLA do mês (Entregas).</p>}
      </Caixa>
      <NovoPedido aberto={novo} onFechar={() => setNovo(false)} empresas={lista} />
    </PaginaBpo>
  )
}

function ItemFila({ e, f, mostrarEmpresa, menu, onEscolher }: { e: EmpresaVista; f: BpoItemFila; mostrarEmpresa: boolean; menu: AcaoMenu[]; onEscolher: (id: string | null, aba?: string) => void }) {
  const executar = useAcao()
  const { usuario } = useSessao()
  const sla = slaDe(f)
  const pague = f.tipo === 'pedido' && /pag/i.test(f.texto)
  return (
    <li className="flex flex-wrap items-center gap-3 py-3 text-sm">
      <span className="min-w-0 flex-1 basis-64">
        <span className="block">{f.texto}</span>
        <span className="text-muted-foreground block truncate text-xs">
          {mostrarEmpresa && `${e.nome} · `}
          {f.codigo} · {f.canal === 'whatsapp' ? 'WhatsApp' : f.canal === 'app' ? 'app' : f.canal === 'email' ? 'e-mail' : 'interno'} · {f.responsavel_nome}
          {f.detalhe && ` · ${f.detalhe}`}
        </span>
        <span className={cn('block text-xs', sla.tom === 'erro' ? 'text-destructive' : sla.tom === 'atencao' ? 'text-warning-foreground' : 'text-muted-foreground')}>{sla.texto}</span>
      </span>
      <Badge variant={f.bola === 'bpo' ? 'destaque' : 'outline'}>{rotuloBola[f.bola]}</Badge>
      <span className="text-muted-foreground w-16 text-right text-xs">{quando(f.prazo)}</span>
      {f.faltando.length > 0 ? (
        f.faltando.map((x) => (
          <Button key={x} size="sm" variant="outline" className="rounded-full" onClick={() => executar(() => repos.bpo.fila.completar(f.id, x), { sucesso: `Chegou: ${x}` })}>
            <CheckIcon /> Chegou {x}
          </Button>
        ))
      ) : f.tipo === 'pagamento' ? (
        <Button size="sm" variant="outline" className="rounded-full" onClick={() => onEscolher(e.clienteId, 'aprovacoes')}>
          Ver em Aprovações <ArrowRightIcon />
        </Button>
      ) : pague && f.valor ? (
        <SePode ferramenta="conta_pagar.capturar">
          <Button
            size="sm"
            variant="outline"
            className="rounded-full"
            onClick={() =>
              executar(() => {
                const fornecedor = f.texto.replace(/[“”"]/g, '').replace(/^pague[m]?\s+(a|o)?\s*/i, '').split(' ').slice(0, 3).join(' ')
                repos.bpo.contas.capturar({ cliente_id: e.clienteId, contraparte: fornecedor || 'Fornecedor do pedido', categoria: 'Despesas gerais', valor: f.valor ?? 0, vencimento: f.prazo, origem: f.canal === 'whatsapp' ? 'WhatsApp' : f.canal })
                return repos.bpo.fila.resolver(f.id)
              }, { sucesso: `Conta lançada por ${usuario.nome}: outra pessoa confere em Aprovações` })
            }
          >
            Lançar a conta
          </Button>
        </SePode>
      ) : f.bola === 'bpo' ? (
        <SePode ferramenta="fila.atualizar">
          <Button size="sm" variant="outline" className="rounded-full" onClick={() => executar(() => repos.bpo.fila.resolver(f.id), { sucesso: `Resolvido: ${f.texto}` })}>
            <CheckIcon /> Resolvido
          </Button>
        </SePode>
      ) : null}
      <BotaoAcoes rotulo={`Ações de ${f.texto}`} acoes={menu} />
      <BotaoErp e={e} oque={f.texto} />
    </li>
  )
}

/** + Pedido (S08-A14): o pedido entra com a completude conferida (BPO-009). */
function NovoPedido({ aberto, onFechar, empresas }: { aberto: boolean; onFechar: () => void; empresas: EmpresaVista[] }) {
  const executar = useAcao()
  const pedir = usePedirBpo()
  const [r, setR] = useState({ empresa: empresas[0]?.clienteId ?? '', texto: '', tipo: 'pedido' as BpoItemFila['tipo'], canal: 'whatsapp' as BpoItemFila['canal'], valor: '', prazo: '', anexo: false })
  const [tentou, setTentou] = useState(false)
  const empresa = empresas.find((e) => e.clienteId === r.empresa) ?? empresas[0]
  const pagamento = /pag/i.test(r.texto)
  const faltando = [...(pagamento && !r.anexo ? ['boleto ou nota'] : []), ...(pagamento && !(Number(r.valor) > 0) ? ['valor'] : []), ...(!r.prazo ? ['prazo'] : [])]
  const erroTexto = !r.texto.trim() ? 'Descreva o pedido.' : undefined
  return (
    <GavetaFormulario
      aberta={aberto}
      onFechar={onFechar}
      titulo="Novo pedido"
      descricao="O integrante confere se o pedido tem o que precisa. O SLA só começa quando ele fica completo."
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
              codigo: 'BPO-009',
              canal: r.canal,
              prazo: r.prazo || hojeBpo,
              bola: 'bpo',
              responsavel_nome: empresa.perfil.analista_nome,
              faltando: faltando.filter((x) => x !== 'prazo' || !r.prazo),
              sla_meta_h: 24,
              valor: Number(r.valor) || null,
              visibilidade: 'compartilhada',
            }),
          { sucesso: faltando.length ? `Pedido aberto: falta ${faltando.join(', ')} (o integrante pede ao cliente)` : 'Pedido completo: o SLA começou' },
        )
        if (item && item.faltando.length)
          pedir({ integrante: 'i-bpo', titulo: `Pedir ao cliente o que falta: ${item.texto}`, cliente: empresa.nome, inicio: `O pedido chegou sem ${item.faltando.join(' e ')}. Vou pedir ao cliente pelo mesmo canal.`, etapas: ['Conferindo a completude do pedido', 'Escrevendo ao cliente o que falta'], fim: { texto: `Pedi ao cliente: ${item.faltando.join(', ')}. O SLA começa quando chegar.` }, efeito: { tipo: 'completude', filaId: item.id } })
        if (item) {
          setR((x) => ({ ...x, texto: '', valor: '', prazo: '', anexo: false }))
          setTentou(false)
          onFechar()
        }
      }}
    >
      {empresas.length > 1 && <Campo rotulo="Empresa">{(id) => <CampoEscolha id={id} valor={r.empresa} onMudar={(v) => setR((x) => ({ ...x, empresa: v }))} opcoes={empresas.map((e) => ({ valor: e.clienteId, rotulo: e.nome }))} />}</Campo>}
      <Campo rotulo="Pedido" erro={tentou ? erroTexto : undefined} ajuda="Ex.: “Pague o fornecedor X amanhã”, “Emitir os boletos de convênio”.">
        {(id) => <CampoTexto id={id} valor={r.texto} onMudar={(v) => setR((x) => ({ ...x, texto: v }))} />}
      </Campo>
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
              { valor: 'interno', rotulo: 'Interno' },
            ]}
          />
        )}
      </Campo>
      <Campo rotulo="Valor (R$)">{(id) => <CampoTexto id={id} tipo="number" valor={r.valor} onMudar={(v) => setR((x) => ({ ...x, valor: v }))} />}</Campo>
      <Campo rotulo="Prazo">{(id) => <CampoTexto id={id} tipo="date" valor={r.prazo} onMudar={(v) => setR((x) => ({ ...x, prazo: v }))} />}</Campo>
      <Interruptor ligado={r.anexo} onMudar={(v) => setR((x) => ({ ...x, anexo: v }))} rotulo="Veio com o boleto ou a nota" />
      <p className={cn('rounded-[12px] px-3 py-2 text-xs', faltando.length ? 'bg-warning/10' : 'bg-success/10')}>{faltando.length ? `Completude: falta ${faltando.join(', ')}. O pedido entra com a bola com o cliente.` : 'Completo: entra com a bola conosco e o SLA começa.'}</p>
    </GavetaFormulario>
  )
}

const categoriasBpo = ['Vendas no cartão', 'Mercadoria para revenda', 'Matéria-prima', 'Fornecedor eventual', 'Ocupação', 'Energia', 'Software', 'Tarifas bancárias', 'Retirada dos sócios', 'Convênios e particulares']

/**
 * BPO › Rotinas (S08-T04; 10, 3.1): o checklist diário, semanal e mensal de
 * cada empresa (quem marcou e quando), a conciliação do dia, o calendário
 * único com uma cor por pacote e a configuração das rotinas (Gestor).
 */
export function RotinasBpoTela({ empresa, onEscolher }: PropsBpo) {
  const { empresas } = useBpo()
  const { integrante } = useTema()
  const executar = useAcao()
  const abrir = useAbrirErp()
  const pedir = usePedirBpo()
  const { usuario } = useSessao()
  const [configurar, setConfigurar] = useState(false)
  const [todas, setTodas] = useState(false)
  const lista = empresa ? [empresa] : empresas
  const corContabil = integrante('contabil').cor
  const corBpo = integrante('bpo_financeiro').cor
  const ativas = (e: EmpresaVista) => e.rotinas.filter((r) => r.ativa)
  const pendentesHoje = (e: EmpresaVista) => ativas(e).filter((r) => r.cadencia === 'diária' && !r.feita_em).length
  const visiveis = empresa || todas ? lista : lista.filter((e) => pendentesHoje(e) > 0 || e.audit.cor !== 'verde')
  const marcar = (e: EmpresaVista, r: BpoRotina, feita: boolean) => executar(() => repos.bpo.rotinas.atualizar(r.id, { feita_em: feita ? agoraBpo() : null, feita_por: feita ? usuario.nome : null }, { ferramenta: 'rotina.marcar', texto: `${usuario.nome} ${feita ? 'marcou' : 'desmarcou'} “${r.nome}” (${r.codigo}) de ${e.nome}` }))

  return (
    <PaginaBpo>
      <CabecalhoBpo integrante="i-bpo-conciliacao" titulo="Rotinas" sub={empresa ? `${empresa.nome} · checklist do dia, conciliação e calendário` : 'O dia de cada empresa: o que já foi feito e o que falta'}>
        {empresa && (
          <>
            <SeloTitular titular={{ tipo: 'empresa', clienteId: empresa.clienteId, nome: empresa.nome }} />
            <SeloErp e={empresa} />
            <SePode ferramenta="rotina.configurar">
              <Button size="sm" variant="outline" className="rounded-full" onClick={() => setConfigurar(true)}>
                <GearSixIcon /> Configurar rotinas
              </Button>
            </SePode>
          </>
        )}
      </CabecalhoBpo>

      {empresa && (
        <Caixa>
          <TituloBloco descricao="Obrigações da contabilidade e rotinas do BPO no mesmo calendário, com uma cor por pacote.">Calendário da empresa</TituloBloco>
          <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
            {empresa.contabil && (
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
              const itens = [
                ...(empresa.contabil ? agenda.filter((a) => a.dia === d.dia && ['fiscal', 'dp', 'contabil'].includes(a.setor)).map((a) => ({ id: a.id, t: a.titulo, cor: corContabil, c: a.codigo })) : []),
                ...ativas(empresa)
                  .filter((r) => r.cadencia === 'diária' || (r.cadencia === 'semanal' && i === 0) || (r.cadencia === 'mensal' && i === 4))
                  .map((r) => ({ id: `${r.id}-${d.dia}`, t: r.nome.split(' ').slice(0, 3).join(' '), cor: corBpo, c: r.codigo })),
              ]
              return (
                <div key={d.dia} className={cn('bg-sunken/50 flex min-w-0 flex-col gap-1 rounded-[12px] p-1.5', d.dia === Number(hojeBpo.slice(8, 10)) && 'ring-foreground/20 ring-1')}>
                  <span className="text-muted-foreground px-0.5 text-[11px]">
                    {d.rotulo} {d.dia}
                  </span>
                  {itens.map((x) => (
                    <Tooltip key={x.id} conteudo={`${x.c} · ${x.t}`}>
                      <span className="bg-surface flex min-w-0 items-center gap-1 rounded-[6px] px-1 py-0.5 text-[11px]">
                        <span className="size-1.5 shrink-0 rounded-full" style={{ background: x.cor }} />
                        <span className="truncate">{x.t}</span>
                      </span>
                    </Tooltip>
                  ))}
                </div>
              )
            })}
          </div>
        </Caixa>
      )}

      <div className={cn('grid gap-4', !empresa && 'md:grid-cols-2 xl:grid-cols-3')}>
        {empresa && (
          <Caixa>
            <TituloBloco
              descricao="O extrato do dia contra o espelho do ERP; confirmar ensina o integrante."
              acao={
                empresa.transacoes.some((t) => t.confianca === 'alta') && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-full"
                    onClick={() =>
                      pedir({
                        integrante: 'i-bpo-conciliacao',
                        titulo: `Conciliar o extrato de ${empresa.nome}`,
                        cliente: empresa.nome,
                        inicio: 'Vou casar o extrato com o espelho do ERP pelas regras aprovadas; o que não casar fica para conferência.',
                        etapas: ['Lendo o extrato do dia', 'Casando por regra aprovada', 'Separando o que precisa de conferência'],
                        fim: { texto: `Conciliei o que casa por regra em ${empresa.nome}. O resto ficou em Rotinas para conferir.`, aviso: `Conciliação de ${empresa.nome} feita` },
                        efeito: { tipo: 'conciliar', clienteId: empresa.clienteId },
                      })
                    }
                  >
                    Pedir à Conciliação
                  </Button>
                )
              }
            >
              Conciliação do dia
            </TituloBloco>
            <PendentesConciliacao
              transacoes={empresa.transacoes.map((t) => ({ id: t.id, data: t.data.slice(8, 10) + '/' + t.data.slice(5, 7), conta: t.conta, descricao: t.descricao, valor: t.valor, sugestao: t.sugestao, confianca: t.confianca }))}
              categorias={categoriasBpo}
              onConfirmar={(id, cat) => {
                const t = empresa.transacoes.find((x) => x.id === id)
                executar(() => repos.bpo.transacoes.atualizar(id, { situacao: 'conciliada', categoria: cat, conciliada_por: usuario.nome }, { texto: `${usuario.nome} conciliou ${t?.descricao} como ${cat}` }))
              }}
              onAceitarSeguras={() =>
                executar(() => {
                  for (const t of empresa.transacoes.filter((x) => x.confianca === 'alta')) repos.bpo.transacoes.atualizar(t.id, { situacao: 'conciliada', categoria: t.sugestao, conciliada_por: usuario.nome })
                  return true
                }, { sucesso: 'Sugestões seguras aceitas; o espelho do ERP recebe as baixas' })
              }
              abrirExterno={{ rotulo: empresa.erp.modo === 'E3' ? 'Abrir no livro próprio' : `Abrir no ${empresa.erp.provedor}`, onAbrir: (t) => void abrir(empresa, t.descricao) }}
            />
          </Caixa>
        )}
        {visiveis.map((e) => {
          const rs = ativas(e)
          const feitas = rs.filter((r) => r.feita_em).length
          return (
            <Caixa key={e.clienteId}>
              <TituloBloco
                descricao={`${feitas} de ${rs.length} feitas · ${e.perfil.analista_nome}`}
                acao={
                  !empresa && (
                    <Button size="sm" variant="ghost" className="rounded-full" onClick={() => onEscolher(e.clienteId, 'rotinas')}>
                      Abrir
                    </Button>
                  )
                }
              >
                {empresa ? (
                  'Checklist'
                ) : (
                  <span className="flex items-center gap-2">
                    <span className="size-2 rounded-full" style={{ background: corAudit[e.audit.cor] }} aria-hidden /> {e.nome}
                  </span>
                )}
              </TituloBloco>
              {rs.length === 0 && <p className="text-muted-foreground text-sm">Nenhuma rotina ativa.</p>}
              <ul className={cn('flex flex-col gap-1', empresa && 'sm:grid sm:grid-cols-2')}>
                {rs.map((r) => (
                  <li key={r.id}>
                    <label className="hover:bg-raised/50 flex cursor-pointer items-start gap-2.5 rounded-[10px] px-1.5 py-1.5 text-sm">
                      <input type="checkbox" checked={!!r.feita_em} onChange={(ev) => marcar(e, r, ev.target.checked)} className="accent-foreground mt-0.5 size-4 shrink-0" aria-label={`${r.nome} · ${e.nome}`} />
                      <span className="min-w-0 flex-1">
                        <span className={cn('block', r.feita_em && 'text-muted-foreground line-through')}>{r.nome}</span>
                        <span className="text-muted-foreground block text-xs">
                          {r.cadencia} · {r.quando} · {r.codigo}
                          {r.feita_em && ` · ${r.feita_por}, ${dataHora(r.feita_em)}`}
                        </span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </Caixa>
          )
        })}
      </div>
      {!empresa && visiveis.length < lista.length && (
        <Button size="sm" variant="ghost" className="w-fit rounded-full" onClick={() => setTodas(true)}>
          <CaretDownIcon /> {lista.length - visiveis.length} empresa{lista.length - visiveis.length > 1 ? 's' : ''} em dia com as rotinas
        </Button>
      )}
      {empresa && configurar && <ConfigurarRotinas e={empresa} onFechar={() => setConfigurar(false)} />}
    </PaginaBpo>
  )
}

/** Configurar rotina (S08-A21): itens e periodicidade, ordem por arrastar, ativar e excluir. */
function ConfigurarRotinas({ e, onFechar }: { e: EmpresaVista; onFechar: () => void }) {
  const executar = useAcao()
  const confirmar = useConfirmar()
  const loja = useLoja()
  const [nova, setNova] = useState({ nome: '', cadencia: 'diária' as BpoRotina['cadencia'], quando: 'hoje', codigo: 'FIN-201' })
  return (
    <GavetaFormulario
      aberta
      onFechar={onFechar}
      largura="lg"
      titulo={`Rotinas · ${e.nome}`}
      descricao="Arraste para mudar a ordem; clique no nome para editar. Vale só para esta empresa."
      acao="Adicionar rotina"
      acaoDesabilitada={!nova.nome.trim()}
      onAcao={() => {
        const ok = executar(() => repos.bpo.rotinas.criar({ cliente_id: e.clienteId, ...nova, nome: nova.nome.trim(), ativa: true }), { sucesso: 'Rotina adicionada' })
        if (ok) setNova((x) => ({ ...x, nome: '' }))
      }}
    >
      <ListaOrdenavel
        itens={e.rotinas}
        idDe={(r) => r.id}
        rotuloDe={(r) => r.nome}
        onReordenar={(ids) => executar(() => repos.bpo.rotinas.reordenar(ids))}
        render={(r) => (
          <div className={cn('bg-sunken/50 flex flex-wrap items-center gap-2 rounded-[12px] px-2 py-1.5 text-sm', !r.ativa && 'opacity-60')}>
            <span className="min-w-0 flex-1 basis-48">
              <EdicaoEmLinha valor={r.nome} rotulo="Nome da rotina" onSalvar={(v) => void repos.bpo.rotinas.atualizar(r.id, { nome: v })} />
              <span className="text-muted-foreground block text-xs">
                {r.codigo} · {r.quando}
              </span>
            </span>
            <span className="w-28">
              <CampoEscolha rotulo={`Periodicidade de ${r.nome}`} valor={r.cadencia} onMudar={(v) => executar(() => repos.bpo.rotinas.atualizar(r.id, { cadencia: v }))} opcoes={(['diária', 'semanal', 'mensal'] as const).map((c) => ({ valor: c, rotulo: c }))} />
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
        <Campo rotulo="Nome">{(id) => <CampoTexto id={id} valor={nova.nome} onMudar={(v) => setNova((x) => ({ ...x, nome: v }))} placeholder="Ex.: Conferir as notas de entrada" />}</Campo>
        <div className="grid grid-cols-3 gap-2">
          <Campo rotulo="Periodicidade">{(id) => <CampoEscolha id={id} valor={nova.cadencia} onMudar={(v) => setNova((x) => ({ ...x, cadencia: v }))} opcoes={(['diária', 'semanal', 'mensal'] as const).map((c) => ({ valor: c, rotulo: c }))} />}</Campo>
          <Campo rotulo="Quando">{(id) => <CampoTexto id={id} valor={nova.quando} onMudar={(v) => setNova((x) => ({ ...x, quando: v }))} />}</Campo>
          <Campo rotulo="Código">{(id) => <CampoTexto id={id} valor={nova.codigo} onMudar={(v) => setNova((x) => ({ ...x, codigo: v }))} />}</Campo>
        </div>
      </div>
    </GavetaFormulario>
  )
}

export { brl }

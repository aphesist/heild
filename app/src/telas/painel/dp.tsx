import {
  AirplaneTiltIcon,
  BroadcastIcon,
  CalculatorIcon,
  CheckIcon,
  DoorOpenIcon,
  FileTextIcon,
  FirstAidKitIcon,
  GavelIcon,
  HandshakeIcon,
  MoneyIcon,
  PenNibIcon,
  ReceiptIcon,
  RocketIcon,
  ScalesIcon,
  SignatureIcon,
  SquaresFourIcon,
  UserPlusIcon,
  UsersThreeIcon,
  WarningIcon,
  XCircleIcon,
} from '@phosphor-icons/react'
import { useState, type ReactNode } from 'react'
import { useFluxos } from '@/ambiente/fluxos'
import { useLoja } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import { Contagem, Selo } from '@/components/compostos/painel-aba'
import { EstadoVazio, SeloDemonstracao, useAcao } from '@/components/kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { DefWidget, TamanhoWidget } from '@/components/widgets/tipos'
import { dpDe } from '@/dados/painel'
import { cn } from '@/lib/utils'
import { repos } from '@/nucleo/repositorios'
import { useTabela } from '@/nucleo/react'
import { registrarEfeitoS04 } from '@/telas/tarefas/cartoes'
import { criarTarefa, diaMes, diasEntre, HOJE_ISO } from '@/telas/tarefas/modelo'
import { CHAVE_VISAO, gravarDP, lerDP, useDP, useIntegranteDP, visaoDP, type EstadoDP, type VisaoDP } from './dp/estado'
import { widgetObrigacoesDoSetor } from './obrigacoes-setor'
import { Linha, Tabela } from './Tabela'
import { widgetCicloDeVida } from './trilha/faixa'
import type { CtxAba, WidgetsAba } from './tipos'

/**
 * Trabalhista e DP (S04-T01; 03, 6.5): ciclo do empregado, eSocial e FGTS
 * Digital, com o cliente mandando o que falta pelo app. Duas visões internas
 * (E-04): Admissão e rotina; Rescisão. Os itens aprovados (C2-01 a C2-06)
 * entram agentificados: o integrante DP age por gatilho, faz sozinho o que é
 * dele, prepara no cartão o resto e aprende com a decisão.
 */
export function widgetsDP(ctx: CtxAba): WidgetsAba {
  const { cliente } = ctx
  const visao = visaoDP()
  const obrigacoes = widgetObrigacoesDoSetor('dp', ctx)
  if (!cliente) return { catalogo: [visaoW(undefined), obrigacoes, visao === 'rotina' ? carteira : carteiraRescisao] }
  const id = cliente.id
  const pf = cliente.regime === 'Pessoa física'
  const semFolha = dpDe(id).quadro.ativos === 0
  if (pf || semFolha) return { catalogo: [visaoW(id), semEmpregados(id, pf), obrigacoes] }
  const ciclo = widgetCicloDeVida(ctx)
  const rotina = [quadro(id), admissoes(id), folha(id), esocial(id), guias(id), ferias(id), convencoes(id), recalculo(id), fase45(id)]
  const rescisao = [simulados(id), rescisoes(id)]
  const ambas = [det(id), termos(id)]
  return { catalogo: [visaoW(id), obrigacoes, ...(visao === 'rotina' ? rotina : rescisao), ...ambas, ...(ciclo ? [ciclo] : [])] }
}

/* ---------- Peças ---------- */

function useFazer() {
  return useAcao()
}
const Lista = ({ children, vazio }: { children: ReactNode[]; vazio: string }) => (children.length ? <ul className="divide-border/70 flex flex-col divide-y">{children}</ul> : <p className="text-muted-foreground py-2 text-sm">{vazio}</p>)
const Mini = (p: React.ComponentProps<typeof Button>) => <Button size="sm" variant="outline" className="h-7 shrink-0 rounded-full px-2.5 text-xs" {...p} />
const nomeCliente = (id: string) => repos.clientes.obter(id)?.nome ?? ''
const dias = (iso: string) => diasEntre(HOJE_ISO, iso)

/* ---------- Visão (E-04) ---------- */

function visaoW(id?: string): DefWidget {
  return { id: 'dp-visao', titulo: 'Visão do DP', descricao: 'Admissão e rotina × Rescisão: os blocos mudam e o filtro fica guardado', icone: SquaresFourIcon, tamanhos: ['L', 'M'], conteudo: (t) => <Visao clienteId={id} tamanho={t} /> }
}
function Visao({ clienteId, tamanho }: { clienteId?: string; tamanho: TamanhoWidget }) {
  useTabela('registro_tela')
  const v = visaoDP()
  const e = clienteId ? lerDP(clienteId) : undefined
  const contagem: Record<VisaoDP, string> = e
    ? { rotina: `${e.admissoes.length} admissões · ${e.variaveis.filter((x) => !x.recebido).length} variáveis faltando`, rescisao: `${e.rescisoes.length} rescisões · ${e.simulados.filter((s) => s.status !== 'respondido').length} simulados abertos` }
    : { rotina: 'folha, admissões e eSocial da carteira', rescisao: 'rescisões e simulados da carteira' }
  return (
    <div className="flex h-full flex-col justify-center gap-2">
      <div role="tablist" aria-label="Visão do DP" className="bg-sunken/70 flex w-full rounded-full p-1">
        {(['rotina', 'rescisao'] as const).map((x) => (
          <button key={x} role="tab" aria-selected={v === x} type="button" onClick={() => repos.telas.lembrar(CHAVE_VISAO, x)} className={cn('flex-1 cursor-pointer rounded-full px-3 py-1.5 text-sm', v === x ? 'bg-background font-medium shadow-xs' : 'text-muted-foreground hover:text-foreground')}>
            {x === 'rotina' ? 'Admissão e rotina' : 'Rescisão'}
          </button>
        ))}
      </div>
      {tamanho !== 'P' && <p className="text-muted-foreground truncate text-center text-xs">{contagem[v]}</p>}
    </div>
  )
}

/* ---------- Sem empregados ---------- */

function semEmpregados(id: string, pf: boolean): DefWidget {
  return {
    id: 'dp-vazio',
    titulo: pf ? 'Pessoa física' : 'Sem empregados',
    descricao: 'Estado do DP quando o cliente não tem folha',
    icone: UsersThreeIcon,
    tamanhos: ['XL', 'G'],
    conteudo: () => <SemEmpregados id={id} pf={pf} />,
  }
}
function SemEmpregados({ id, pf }: { id: string; pf: boolean }) {
  const fazer = useFazer()
  const fluxos = useFluxos()
  if (pf) return <EstadoVazio compacto titulo="Pessoa física não tem DP." descricao="Carnê-leão, IRPF e doméstico (fase 4) ficam no Fiscal e na Consultoria. Se contratar empregada doméstica, a folha de doméstico (DP-062) aparece aqui." />
  return (
    <EstadoVazio
      compacto
      icone={UserPlusIcon}
      titulo="Sem empregados ainda."
      descricao="A primeira admissão abre DP-105 (preparar o empregador: sindicato, CCT, eSocial e FGTS Digital)."
      acao={
        <Button
          size="sm"
          className="rounded-full"
          onClick={() => {
            const t = fazer(() => criarTarefa({ atividade_id: 'DP-105', titulo: `Preparar o empregador · ${nomeCliente(id)}`, setor_id: 'dp', cliente_id: id, prazo_interno: '2026-11-25', origem: 'pessoa' }), { sucesso: 'DP-105 aberta' })
            if (t) fluxos.abrirTarefa(t.id)
          }}
        >
          Abrir DP-105
        </Button>
      }
    />
  )
}

/* ---------- Quadro ---------- */

function quadro(id: string): DefWidget {
  return {
    id: 'quadro',
    titulo: 'Quadro de empregados',
    atividades: 'DP-045, 056, 060',
    descricao: 'Ativos por estabelecimento, cotas, ponto e pasta por empregado',
    icone: UsersThreeIcon,
    tamanhos: ['P', 'M', 'G'],
    conteudo: (t) => {
      const d = dpDe(id).quadro
      return (
        <div className="flex h-full flex-col justify-end gap-2">
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-4xl font-light tabular-nums">{d.ativos}</span>
            <span className="text-muted-foreground text-sm">ativos</span>
          </div>
          {t !== 'P' && (
            <div className="flex flex-wrap gap-1.5">
              <Selo feito={d.cotaPcd.tem >= d.cotaPcd.exigida}>cota PCD {d.cotaPcd.tem >= d.cotaPcd.exigida ? 'ok' : `${d.cotaPcd.tem} de ${d.cotaPcd.exigida}`}</Selo>
              <Selo feito={d.aprendizes.tem >= d.aprendizes.exigida} alerta={d.aprendizes.tem < d.aprendizes.exigida}>
                aprendizes {d.aprendizes.tem} de {d.aprendizes.exigida}
              </Selo>
            </div>
          )}
          {t === 'G' && (
            <>
              <ul className="flex flex-col gap-1 text-sm">
                {d.estabelecimentos.map((e) => (
                  <li key={e.nome} className="flex justify-between gap-2">
                    <span>{e.nome}</span>
                    <span className="tabular-nums">{e.ativos}</span>
                  </li>
                ))}
              </ul>
              <p className="text-muted-foreground text-xs">Ponto: {d.ponto} · pasta por empregado em Arquivos (DP-060)</p>
            </>
          )}
        </div>
      )
    },
  }
}

/* ---------- Admissão ---------- */

function admissoes(id: string): DefWidget {
  return { id: 'admissoes', titulo: 'Admissões', atividades: 'DP-001 a 008', descricao: 'Pedidos em andamento, com a contagem do S-2200', icone: UserPlusIcon, tamanhos: ['G', 'XL'], conteudo: (t) => <Admissoes id={id} t={t} /> }
}
function Admissoes({ id, t }: { id: string; t: TamanhoWidget }) {
  const e = useDP(id)
  const integrante = useIntegranteDP()
  const loja = useLoja()
  const cliente = nomeCliente(id)
  const receber = () =>
    integrante({
      titulo: `Receber pedido de admissão · ${cliente}`,
      cliente,
      inicio: `${cliente} pediu admissão pelo app. Vou validar os dados e checar o piso da convenção.`,
      etapas: ['Lendo o pedido do app (pedido.abrir)', 'Validando CPF, nascimento e vínculos anteriores', 'Conferindo o salário com o piso da CCT', 'Abrindo DP-002 e as tarefas da admissão'],
      fim: `Pedido válido. Abri a admissão de Thiago Ramos (operador de máquina). Falta decidir: experiência 45+45 ou 90 dias?`,
      aviso: `${cliente} pediu admissão pelo app: falta decidir a experiência`,
      depois: () => {
        gravarDP(id, (x) => ({ admissoes: [...x.admissoes, { id: `ad${Date.now()}`, nome: 'Thiago Ramos', cargo: 'Operador de máquina', inicio: '01/12', prazoS2200: '30/11', origem: 'app', piso: 'acima do piso da CCT', etapas: [{ rotulo: 'Dados', feito: true }, { rotulo: 'Documentos', feito: false }, { rotulo: 'ASO', feito: false }, { rotulo: 'Contrato', feito: false, decisao: true }, { rotulo: 'S-2200', feito: false }] }] }))
        criarTarefa({ atividade_id: 'DP-002', titulo: `Admissão de Thiago Ramos (pedido do app)`, setor_id: 'dp', cliente_id: id, origem: 'pedido_cliente', prazo_interno: '2026-11-30', status: 'aguardando_cliente', responsavel: { tipo: 'integrante', id: 'i-dp', nome: 'DP', setor: 'dp' } })
      },
    })
  if (!e.admissoes.length)
    return (
      <EstadoVazio
        compacto
        titulo="Nenhuma admissão em andamento."
        descricao="Pedidos chegam pelo app do cliente ou pelo CRM; o integrante DP valida e abre as tarefas."
        acao={
          <Button size="sm" variant="outline" className="rounded-full" onClick={receber}>
            Simular pedido pelo app
          </Button>
        }
      />
    )
  void loja
  return (
    <div className="flex flex-col gap-2">
      <ul className={cn('flex flex-col gap-2', t === 'XL' && 'grid grid-cols-2')}>
        {e.admissoes.map((a) => (
          <LinhaAdmissao key={a.id} id={id} a={a} />
        ))}
      </ul>
      <button type="button" className="text-muted-foreground hover:text-foreground w-fit cursor-pointer text-xs underline" onClick={receber}>
        Simular novo pedido pelo app
      </button>
    </div>
  )
}
function LinhaAdmissao({ id, a }: { id: string; a: EstadoDP['admissoes'][number] }) {
  const fazer = useFazer()
  const integrante = useIntegranteDP()
  const cliente = nomeCliente(id)
  const prazo = `2026-${a.prazoS2200.slice(3, 5)}-${a.prazoS2200.slice(0, 2)}`
  const [escolha, setEscolha] = useState<'45+45' | '90'>('45+45')
  const etapa = (rotulo: string, feito: boolean) => gravarDP(id, (x) => ({ admissoes: x.admissoes.map((y) => (y.id === a.id ? { ...y, etapas: y.etapas.map((z) => (z.rotulo === rotulo ? { ...z, feito, decisao: false } : z)) } : y)) }))
  const gerarContrato = () =>
    integrante({
      titulo: `Contrato de experiência ${escolha} · ${a.nome}`,
      cliente,
      inicio: `Vou gerar o contrato de experiência ${escolha} de ${a.nome} com o modelo da CCT.`,
      etapas: ['Puxando dados e cargo da admissão', 'Aplicando o modelo do escritório e a CCT', 'Montando opção de VT, compensação e termo de LGPD'],
      fim: `Contrato de ${a.nome} pronto. Deixei o cartão para você aprovar o envio para assinatura.`,
      depois: () => gravarDP(id, (x) => ({ admissoes: x.admissoes.map((y) => (y.id === a.id ? { ...y, experiencia: escolha, contrato: 'cartao' } : y)) })),
      cartao: { acao: 'dp.contrato', resumo: `Enviar o contrato de experiência ${escolha} de ${a.nome} para assinatura`, argumentos: { Empregado: a.nome, Cargo: a.cargo, Experiência: escolha === '45+45' ? '45 + 45 dias' : '90 dias', Início: a.inicio, Assinatura: 'eletrônica (empregado e empresa)' }, clienteId: id, clienteNome: cliente, dados: { cliente: id, admissao: a.id } },
    })
  const s2200 = a.etapas.find((x) => x.rotulo === 'S-2200')
  return (
    <li className="bg-raised flex flex-col gap-2 rounded-lg p-3">
      <div className="flex items-start gap-2">
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{a.nome}</span>
          <span className="text-muted-foreground block truncate text-xs">
            {a.cargo} · início {a.inicio}
            {a.origem === 'app' ? ' · pedido pelo app' : ''}
            {a.piso ? ` · ${a.piso}` : ''}
          </span>
        </span>
        {s2200?.feito ? <Badge variant="sucesso">S-2200 {a.recibo}</Badge> : <Contagem dias={dias(prazo)} rotulo={`S-2200 até ${a.prazoS2200}`} />}
      </div>
      <div className="flex flex-wrap gap-1">
        {a.etapas.map((x) => (
          <button key={x.rotulo} type="button" title={x.feito ? 'feito' : 'marcar como feito'} onClick={() => x.rotulo !== 'S-2200' && x.rotulo !== 'Contrato' && etapa(x.rotulo, !x.feito)} className="cursor-pointer">
            <Selo feito={x.feito} alerta={x.decisao}>
              {x.rotulo}
            </Selo>
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {!a.contrato && (
          <>
            <select aria-label="Experiência" value={escolha} onChange={(e) => setEscolha(e.target.value as '45+45' | '90')} className="bg-popover h-7 rounded-md border px-1.5 text-xs">
              <option value="45+45">experiência 45+45</option>
              <option value="90">experiência 90 dias</option>
            </select>
            <Mini onClick={gerarContrato}>
              <PenNibIcon /> Gerar contrato
            </Mini>
          </>
        )}
        {a.contrato === 'cartao' && <Badge variant="destaque">contrato: cartão aguardando você</Badge>}
        {a.contrato === 'enviado' && (
          <Mini onClick={() => (gravarDP(id, (x) => ({ admissoes: x.admissoes.map((y) => (y.id === a.id ? { ...y, contrato: 'assinado', etapas: y.etapas.map((z) => (z.rotulo === 'Contrato' ? { ...z, feito: true, decisao: false } : z)) } : y)) })), fazer(() => null, { sucesso: 'Contrato assinado pelas duas partes' }))}>
            <SignatureIcon /> Marcar assinado
          </Mini>
        )}
        {!s2200?.feito && (
          <Mini
            onClick={() =>
              integrante({
                titulo: `Confirmar S-2200 · ${a.nome}`,
                cliente,
                inicio: `Vou conferir o S-2200 de ${a.nome} e transmitir no eSocial.`,
                etapas: ['Conferindo o evento contra a admissão', 'Transmitindo ao eSocial (API-08)', 'Guardando o recibo na pasta do empregado'],
                fim: `S-2200 de ${a.nome} aceito pelo eSocial. Recibo na pasta do empregado.`,
                depois: () => gravarDP(id, (x) => ({ admissoes: x.admissoes.map((y) => (y.id === a.id ? { ...y, recibo: `1.2.${Math.floor(1e6 + Math.random() * 8e6)}`, etapas: y.etapas.map((z) => (z.rotulo === 'S-2200' ? { ...z, feito: true } : z)) } : y)) })),
              })
            }
          >
            <BroadcastIcon /> Confirmar S-2200
          </Mini>
        )}
      </div>
    </li>
  )
}
registrarEfeitoS04('dp.contrato', (c, ctx) => {
  const d = c.extras?.dados as { cliente: string; admissao: string }
  gravarDP(d.cliente, (x) => ({ admissoes: x.admissoes.map((y) => (y.id === d.admissao ? { ...y, contrato: 'enviado' } : y)) }))
  ctx.loja.toast(`Contrato enviado para assinatura eletrônica${ctx.editado ? ' (com a sua edição)' : ''}. O DP acompanha até assinarem.`)
})

/* ---------- Folha ---------- */

function folha(id: string): DefWidget {
  return { id: 'folha', titulo: 'Fechamento da folha · 11/2026', atividades: 'DP-009 a 015', descricao: 'Variáveis recebidas × esperadas, prévia, importação no core', icone: MoneyIcon, tamanhos: ['M', 'G'], conteudo: (t) => <Folha id={id} t={t} /> }
}
function Folha({ id, t }: { id: string; t: TamanhoWidget }) {
  const e = useDP(id)
  const integrante = useIntegranteDP()
  const fluxos = useFluxos()
  const cliente = nomeCliente(id)
  const faltam = e.variaveis.filter((v) => !v.recebido)
  const pedir = () =>
    integrante({
      titulo: `Pedir variáveis da folha · ${cliente}`,
      cliente,
      inicio: 'Vou mandar o formulário mensal pelo app e cobrar o que falta.',
      etapas: ['Montando o formulário com o que costuma variar', 'Enviando ao contato com o assunto “folha”', 'Lendo a resposta (foto e áudio viram dados)'],
      fim: `${cliente} respondeu por áudio: extraí as comissões (R$ 8.420,00 para 6 pessoas). Variáveis completas.`,
      aviso: `Variáveis da folha de ${cliente} completas`,
      depois: () => gravarDP(id, (x) => ({ variaveis: x.variaveis.map((v) => ({ ...v, recebido: true, via: v.recebido ? v.via : 'áudio no app' })) })),
    })
  if (t === 'M')
    return (
      <div className="flex h-full flex-col justify-end gap-1">
        <span className="text-sm">
          <strong className="font-heading text-3xl font-light tabular-nums">{e.variaveis.filter((v) => v.recebido).length}</strong>
          <span className="text-muted-foreground"> de {e.variaveis.length} variáveis</span>
        </span>
        <span className="text-muted-foreground truncate text-xs">prévia: {e.previa}{e.importada ? ' · importada no core' : ''}</span>
      </div>
    )
  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-col gap-1.5">
        {e.variaveis.map((v) => (
          <li key={v.item} className="flex items-center gap-3 text-sm">
            <Selo feito={v.recebido} alerta={!v.recebido}>
              {v.recebido ? 'recebida' : 'falta'}
            </Selo>
            <span className="min-w-0 flex-1 truncate">{v.item}</span>
            <span className="text-muted-foreground shrink-0 text-xs">{v.via ?? v.esperado}</span>
          </li>
        ))}
        {!e.variaveis.length && <li className="text-muted-foreground text-sm">Nenhuma variável esperada.</li>}
      </ul>
      <div className="flex flex-wrap gap-1.5">
        {faltam.length > 0 && <Mini onClick={pedir}>Pedir variáveis</Mini>}
        {!faltam.length && e.previa === 'aguardando' && <Mini onClick={() => gravarDP(id, () => ({ previa: 'gerada' }))}>Gerar prévia</Mini>}
        {e.previa === 'gerada' && (
          <Mini onClick={() => (gravarDP(id, () => ({ previa: 'enviada' })), fluxos.enviar({ cliente, setor: 'dp', texto: '', anexo: 'Prévia da folha 11-2026.pdf', assunto: 'a prévia da folha de novembro' }))}>Enviar prévia ao cliente</Mini>
        )}
        {e.previa === 'enviada' && <Mini onClick={() => gravarDP(id, () => ({ previa: 'ciente' }))}>Registrar ciência do cliente</Mini>}
        {e.previa === 'ciente' && !e.importada && (
          <Mini
            onClick={() =>
              integrante({
                titulo: `Importar a folha no core · ${cliente}`,
                cliente,
                inicio: 'Vou montar o arquivo de importação e deixar para você aprovar.',
                etapas: ['Montando o arquivo no leiaute do core (API-18)', 'Conferindo rubricas e totais'],
                fim: 'Arquivo pronto e conferido. Cartão com você: importar no core.',
                cartao: { acao: 'dp.importar', resumo: `Importar a folha 11/2026 de ${cliente} no core`, argumentos: { Cliente: cliente, Competência: '11/2026', Rubricas: '42', Total: 'R$ 186.400,00' }, clienteId: id, clienteNome: cliente, dados: { cliente: id } },
              })
            }
          >
            Importar no core
          </Mini>
        )}
        {e.importada && <Badge variant="sucesso">importada no core</Badge>}
      </div>
    </div>
  )
}
registrarEfeitoS04('dp.importar', (c, ctx) => {
  const d = c.extras?.dados as { cliente: string }
  gravarDP(d.cliente, () => ({ importada: true }))
  ctx.loja.toast('Folha importada no core: 42 rubricas, totais conferem.')
})

/* ---------- eSocial ---------- */

function esocial(id: string): DefWidget {
  return { id: 'esocial', titulo: 'eSocial e DCTFWeb', atividades: 'DP-016, 017, 038, 039, 043, 057', descricao: 'Eventos pendentes, rejeitados e não fechados; totalizadores × folha; recibos', icone: BroadcastIcon, tamanhos: ['M', 'G'], conteudo: (t) => <Esocial id={id} t={t} /> }
}
function Esocial({ id, t }: { id: string; t: TamanhoWidget }) {
  const e = useDP(id)
  const integrante = useIntegranteDP()
  const cliente = nomeCliente(id)
  if (t === 'M')
    return (
      <div className="grid h-full grid-cols-3 items-end gap-2">
        {(['aceito', 'rejeitado', 'pendente'] as const).map((s) => (
          <div key={s} className="flex flex-col">
            <span className={cn('font-heading text-2xl font-light tabular-nums', s === 'rejeitado' && 'text-destructive-text')}>{e.esocial.filter((x) => x.situacao === s).length}</span>
            <span className="text-muted-foreground text-xs">{s === 'aceito' ? 'aceitos' : s === 'rejeitado' ? 'rejeitados' : 'pendentes'}</span>
          </div>
        ))}
      </div>
    )
  const transmitir = (evento: string) =>
    integrante({
      titulo: `Preparar ${evento.split(' ·')[0]} · ${cliente}`,
      cliente,
      inicio: `Vou conferir ${evento} e os totalizadores contra a folha.`,
      etapas: ['Conferindo o evento', 'Batendo totalizadores × folha', 'Montando o cartão de transmissão'],
      fim: 'Totalizadores batem com a folha. Transmitir é com você: o cartão está pronto.',
      depois: () => gravarDP(id, (x) => ({ esocial: x.esocial.map((y) => (y.evento === evento ? { ...y, situacao: 'cartao' } : y)) })),
      cartao: { acao: 'dp.esocial', resumo: `Transmitir ${evento} de ${cliente}`, argumentos: { Evento: evento, Totalizadores: 'batem com a folha', 'Base INSS': 'R$ 186.400,00', 'FGTS do mês': 'R$ 14.912,00' }, clienteId: id, clienteNome: cliente, ferramenta: 'esocial.transmitir', dados: { cliente: id, evento } },
    })
  return (
    <ul className="flex flex-col gap-2">
      {!e.esocial.length && <li className="text-muted-foreground py-2 text-sm">Nenhum evento pendente no eSocial.</li>}
      {e.esocial.map((x) => (
        <li key={x.evento} className={cn('flex items-start gap-3 rounded-md px-3 py-2', x.situacao === 'rejeitado' ? 'bg-destructive/8' : 'bg-raised')}>
          {x.situacao === 'aceito' ? <CheckIcon weight="bold" className="text-success mt-0.5 size-4 shrink-0" /> : x.situacao === 'rejeitado' ? <XCircleIcon weight="fill" className="text-destructive mt-0.5 size-4 shrink-0" /> : <WarningIcon className="text-muted-foreground mt-0.5 size-4 shrink-0" />}
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm">{x.evento}</span>
            <span className="text-muted-foreground block truncate text-xs">{x.situacao === 'cartao' ? 'cartão de transmissão aguardando você' : x.recibo ? `recibo ${x.recibo}` : (x.motivo ?? x.situacao)}</span>
          </span>
          {(x.situacao === 'pendente' || x.situacao === 'rejeitado') && <Mini onClick={() => transmitir(x.evento)}>{x.situacao === 'rejeitado' ? 'Corrigir' : 'Transmitir'}</Mini>}
        </li>
      ))}
    </ul>
  )
}
registrarEfeitoS04('dp.esocial', (c, ctx) => {
  const d = c.extras?.dados as { cliente: string; evento: string }
  gravarDP(d.cliente, (x) => ({ esocial: x.esocial.map((y) => (y.evento === d.evento ? { ...y, situacao: 'aceito', motivo: undefined, recibo: `1.1.${Math.floor(1e9 + Math.random() * 8e9)}` } : y)) }))
  ctx.loja.toast(`${d.evento.split(' ·')[0]} transmitido e aceito. Recibo guardado.`)
})

/* ---------- Guias, holerites, boletos ---------- */

function guias(id: string): DefWidget {
  return { id: 'guias', titulo: 'Guias, holerites e pagamento', atividades: 'DP-018 a 022; C2-03', descricao: 'GFD, DARF, sindical, holerites com prova; boletos de sindicato, convênio e seguro de vida', icone: ReceiptIcon, tamanhos: ['G', 'XL'], conteudo: (t) => <Guias id={id} t={t} /> }
}
function Guias({ id, t }: { id: string; t: TamanhoWidget }) {
  const e = useDP(id)
  const integrante = useIntegranteDP()
  const cliente = nomeCliente(id)
  const enviarPacote = () =>
    integrante({
      titulo: `Pacote da folha · ${cliente}`,
      cliente,
      inicio: 'Vou juntar guias, holerites e resumo num pacote só.',
      etapas: ['Juntando GFD, DARF e guias sindicais', `Conferindo ${e.holerites.total} holerites com prova de entrega`, 'Escolhendo o contato do assunto “folha”'],
      fim: 'Pacote pronto. Enviar ao cliente é com aprovação: o cartão está com você.',
      depois: () => gravarDP(id, () => ({ pacote: 'cartao' })),
      cartao: { acao: 'dp.pacote', resumo: `Enviar o pacote da folha 10/2026 a ${cliente}`, argumentos: { Para: 'contato do assunto folha', Guias: e.guias.map((g) => g.nome.split(' ')[0]).join(', '), Holerites: String(e.holerites.total), Canal: 'WhatsApp e app' }, clienteId: id, clienteNome: cliente, dados: { cliente: id } },
    })
  const emitir = (b: EstadoDP['boletos'][number]) =>
    integrante({
      titulo: `Emitir boleto · ${b.nome}`,
      cliente,
      inicio: `Gatilho do dia 25: o portal liberou ${b.nome.toLowerCase()}. Vou emitir pelo robô.`,
      etapas: ['Entrando no portal com a credencial do cofre', 'Emitindo o boleto (robô de portal)', 'Guardando na pasta do cliente'],
      fim: `${b.nome} emitido e guardado em Arquivos › ${cliente} › DP › Boletos. Vai no próximo pacote.`,
      depois: () => gravarDP(id, (x) => ({ boletos: x.boletos.map((y) => (y.id === b.id ? { ...y, status: 'emitido', arquivo: `${b.nome}.pdf` } : y)) })),
    })
  return (
    <div className={cn('flex flex-col gap-3', t === 'XL' && 'grid grid-cols-2 gap-x-6')}>
      <div className="flex flex-col gap-1.5">
        <Lista vazio="Sem guias nesta competência.">
          {e.guias.map((g) => (
            <Linha key={g.nome} titulo={g.nome} detalhe={`${g.valor} · vence ${g.vence}`} fim={<Selo feito={g.enviada || e.pacote === 'enviado'}>{g.enviada || e.pacote === 'enviado' ? 'enviada' : 'no pacote'}</Selo>} />
          ))}
        </Lista>
        <p className="text-muted-foreground text-xs">
          Holerites: {e.holerites.provados} de {e.holerites.total} com prova de entrega · pagamento conferido
        </p>
        {e.pacote === 'pendente' && (
          <Mini className="h-7 w-fit rounded-full" onClick={enviarPacote}>
            Enviar pacote
          </Mini>
        )}
        {e.pacote === 'cartao' && <Badge variant="destaque">pacote: cartão aguardando você</Badge>}
        {e.pacote === 'enviado' && <Badge variant="sucesso">pacote enviado · registro de entrega</Badge>}
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium">Boletos de sindicato, convênio e seguro (C2-03)</span>
        <Lista vazio="Sem boletos.">
          {e.boletos.map((b) => (
            <Linha
              key={b.id}
              titulo={b.nome}
              detalhe={b.status === 'emitido' ? `emitido · ${b.arquivo}` : b.libera}
              fim={
                b.status === 'emitido' ? (
                  <Selo feito>emitido</Selo>
                ) : b.status === 'liberado' ? (
                  <Mini onClick={() => emitir(b)}>Emitir</Mini>
                ) : (
                  <Mini onClick={() => (gravarDP(id, (x) => ({ boletos: x.boletos.map((y) => (y.id === b.id ? { ...y, status: 'liberado', libera: 'liberado (dia 25)' } : y)) })), emitir(b))} title="Simula o gatilho do dia 25">
                    Simular dia 25
                  </Mini>
                )
              }
            />
          ))}
        </Lista>
        <p className="text-muted-foreground text-xs">
          O DP emite sozinho pelo robô de portal quando o boleto libera <SeloDemonstracao fonte="robô de portal" />
        </p>
      </div>
    </div>
  )
}
registrarEfeitoS04('dp.pacote', (c, ctx) => {
  const d = c.extras?.dados as { cliente: string }
  gravarDP(d.cliente, (x) => ({ pacote: 'enviado', guias: x.guias.map((g) => ({ ...g, enviada: true })) }))
  const cv = ctx.conversaDe(nomeCliente(d.cliente), 'dp')
  ctx.loja.mensagemCrm(cv, { tipo: 'mensagem', de: 'integrante', autor: 'DP', setor: 'dp', canal: 'whatsapp', texto: 'Segue o pacote da folha de outubro: guias (GFD, DARF e sindical), holerites e o resumo. Qualquer dúvida, é só responder aqui.', entrega: 'enviada', anexos: [{ nome: 'Pacote da folha 10-2026.zip', tipo: 'pdf' }] })
  ctx.loja.toast('Pacote da folha enviado ao contato do assunto folha.', { modulo: 'crm', aba: 'conversas', conversa: cv }, 'Ver a conversa')
})

/* ---------- Férias, afastamentos e SST ---------- */

function ferias(id: string): DefWidget {
  return { id: 'ferias', titulo: 'Férias, afastamentos e SST', atividades: 'DP-023 a 025, 046 a 050', descricao: 'Períodos e risco de dobra; atestados, CAT, periódicos, PGR e PCMSO', icone: AirplaneTiltIcon, tamanhos: ['M', 'G'], conteudo: (t) => <Ferias id={id} t={t} /> }
}
function Ferias({ id, t }: { id: string; t: TamanhoWidget }) {
  const e = useDP(id)
  const integrante = useIntegranteDP()
  const [programando, setProgramando] = useState<string | null>(null)
  const [inicio, setInicio] = useState('2026-12-07')
  const [qtd, setQtd] = useState(30)
  const [abono, setAbono] = useState(false)
  const cliente = nomeCliente(id)
  const lista = t === 'M' ? e.ferias.filter((f) => f.alerta) : e.ferias
  return (
    <div className="flex flex-col gap-2">
      <Lista vazio="Nenhum período vencendo nem afastamento.">
        {lista.map((f) => (
          <li key={f.nome} className="flex flex-col gap-1.5 py-2 first:pt-0">
            <div className="flex items-center gap-2">
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm">{f.nome}</span>
                <span className={cn('block truncate text-xs', f.alerta && !f.programada ? 'text-foreground font-medium' : 'text-muted-foreground')}>{f.programada ? `programadas: ${diaMes(f.programada.inicio)}, ${f.programada.dias} dias${f.programada.abono ? ' com abono' : ''} · aviso ao cliente enviado` : f.detalhe}</span>
              </span>
              {f.alerta && !f.programada && t !== 'M' && <Mini onClick={() => setProgramando(programando === f.nome ? null : f.nome)}>Programar</Mini>}
            </div>
            {programando === f.nome && (
              <form
                className="bg-raised flex flex-wrap items-center gap-2 rounded-md p-2 text-xs"
                onSubmit={(ev) => {
                  ev.preventDefault()
                  gravarDP(id, (x) => ({ ferias: x.ferias.map((y) => (y.nome === f.nome ? { ...y, alerta: false, programada: { inicio, dias: qtd, abono } } : y)) }))
                  setProgramando(null)
                }}
              >
                <label className="flex items-center gap-1">
                  início <input type="date" value={inicio} onChange={(ev) => setInicio(ev.target.value)} className="bg-background rounded border px-1" />
                </label>
                <label className="flex items-center gap-1">
                  dias <input type="number" min={5} max={30} value={qtd} onChange={(ev) => setQtd(+ev.target.value)} className="bg-background w-14 rounded border px-1" />
                </label>
                <label className="flex items-center gap-1">
                  <input type="checkbox" checked={abono} onChange={(ev) => setAbono(ev.target.checked)} /> abono (1/3)
                </label>
                <span className={cn(inicio > '2026-12-28' ? 'text-destructive-text' : 'text-muted-foreground')}>{inicio > '2026-12-28' ? 'depois do limite: férias em dobro' : 'sem risco de dobra'}</span>
                <Button type="submit" size="sm" className="h-7 rounded-full">
                  Programar e avisar o cliente
                </Button>
              </form>
            )}
          </li>
        ))}
      </Lista>
      {t !== 'M' && e.sst.length > 0 && (
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium">SST e afastamentos</span>
          {e.sst.map((s) => (
            <div key={s.id} className="flex items-center gap-2 text-sm">
              <FirstAidKitIcon className="text-muted-foreground size-4" />
              <span className="min-w-0 flex-1 truncate">
                {s.nome} · {s.tipo}
              </span>
              {s.cat === 'pendente' && (
                <Mini
                  onClick={() =>
                    integrante({
                      titulo: `CAT de ${s.nome} · ${cliente}`,
                      cliente,
                      inicio: 'Vou preparar a CAT (S-2210) com o relato e o atestado.',
                      etapas: ['Lendo o relato e o atestado médico', 'Montando o S-2210'],
                      fim: 'CAT pronta. Transmitir é com aprovação: cartão com você.',
                      depois: () => gravarDP(id, (x) => ({ sst: x.sst.map((y) => (y.id === s.id ? { ...y, cat: 'cartao' } : y)) })),
                      cartao: { acao: 'dp.cat', resumo: `Transmitir a CAT de ${s.nome} (${cliente})`, argumentos: { Empregado: s.nome, Ocorrência: s.tipo, Evento: 'S-2210', Prazo: 'primeiro dia útil seguinte' }, clienteId: id, clienteNome: cliente, ferramenta: 'esocial.transmitir', dados: { cliente: id, sst: s.id } },
                    })
                  }
                >
                  Preparar CAT
                </Mini>
              )}
              {s.cat === 'cartao' && <Badge variant="destaque">CAT: cartão</Badge>}
              {s.cat === 'transmitida' && <Selo feito>CAT transmitida</Selo>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
registrarEfeitoS04('dp.cat', (c, ctx) => {
  const d = c.extras?.dados as { cliente: string; sst: string }
  gravarDP(d.cliente, (x) => ({ sst: x.sst.map((y) => (y.id === d.sst ? { ...y, cat: 'transmitida' } : y)) }))
  ctx.loja.toast('CAT transmitida ao eSocial. Recibo guardado na pasta do empregado.')
})

/* ---------- Convenções, benefícios e anuais (C2-04) ---------- */

function convencoes(id: string): DefWidget {
  return { id: 'convencoes', titulo: 'Convenções, benefícios e anuais', atividades: 'DP-033, 034, 051 a 055; C2-04', descricao: 'Sindicato, CCT e vencimento, resumo da CCT nova, VT, VR, plano, 13º, informe', icone: HandshakeIcon, tamanhos: ['G', 'XL'], conteudo: (t) => <Convencoes id={id} t={t} /> }
}
function Convencoes({ id, t }: { id: string; t: TamanhoWidget }) {
  const e = useDP(id)
  const integrante = useIntegranteDP()
  const cliente = nomeCliente(id)
  const resumir = () =>
    integrante({
      titulo: `Resumir a CCT nova · ${e.cct.sindicato}`,
      cliente,
      inicio: 'Chegou a CCT 2026/2027. Vou ler e preparar o resumo do que muda para a folha.',
      etapas: ['Lendo as 48 cláusulas', 'Comparando com a CCT anterior', 'Pedindo ao Consultor a leitura das cláusulas de reajuste', 'Escrevendo o resumo para revisão'],
      fim: 'Resumo da CCT pronto para você revisar antes de publicar aos clientes do sindicato.',
      depois: () => gravarDP(id, (x) => ({ cct: { ...x.cct, resumo: 'preparado', texto: ['Reajuste de 5,2% a partir de 01/11/2026 (retroativo na folha de novembro).', 'Piso da categoria: R$ 2.480,00.', 'Vale-refeição sobe para R$ 34,00 por dia.', 'Seguro de vida em grupo passa a ser obrigatório (boleto no dia 25).', 'Banco de horas: compensação em até 6 meses.'] } })),
    })
  return (
    <div className={cn('flex flex-col gap-2', t === 'XL' && 'grid grid-cols-2 gap-x-6')}>
      <div className="flex flex-col gap-1.5 text-sm">
        <p>
          <span className="font-medium">{e.cct.sindicato}</span>
          <span className="text-muted-foreground"> · vigência {e.cct.vigencia}</span>
        </p>
        {e.cct.nova && e.cct.resumo === 'pendente' && (
          <div className="bg-warning/10 flex items-center gap-2 rounded-md px-3 py-2 text-xs">
            <ScalesIcon className="size-4" /> CCT 2026/2027 registrada no Mediador.
            <Mini className="ml-auto h-7 rounded-full" onClick={resumir}>
              Resumir CCT
            </Mini>
          </div>
        )}
        {e.cct.texto && (
          <div className="bg-raised flex flex-col gap-1 rounded-md p-3 text-xs">
            <span className="font-medium">Resumo da CCT {e.cct.resumo === 'publicado' ? '(publicado aos clientes)' : '(para revisar)'}</span>
            <ul className="list-disc pl-4">
              {e.cct.texto.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
            {e.cct.resumo === 'preparado' && (
              <Mini className="mt-1 h-7 w-fit rounded-full" onClick={() => gravarDP(id, (x) => ({ cct: { ...x.cct, resumo: 'publicado', nova: false } }))}>
                Revisei: publicar
              </Mini>
            )}
          </div>
        )}
      </div>
      <Lista vazio="Sem benefícios cadastrados.">
        {e.beneficios.map((b) => (
          <Linha key={b.nome} titulo={b.nome} detalhe={b.detalhe} />
        ))}
      </Lista>
    </div>
  )
}

/* ---------- Recálculo (C2-05) e fases 4 e 5 ---------- */

function recalculo(id: string): DefWidget {
  return { id: 'recalculo', titulo: 'Recálculo de FGTS e sindicato', atividades: 'C2-05', descricao: 'Guias pagas fora do prazo, recalculadas', icone: CalculatorIcon, tamanhos: ['M'], conteudo: () => <Recalculo id={id} /> }
}
function Recalculo({ id }: { id: string }) {
  const e = useDP(id)
  return (
    <Lista vazio="Nenhuma guia para recalcular.">
      {e.recalculo.map((r) => (
        <Linha key={r.guia} titulo={r.guia} fim={r.status === 'pendente' ? <Mini onClick={() => gravarDP(id, (x) => ({ recalculo: x.recalculo.map((y) => (y.guia === r.guia ? { ...y, status: 'recalculada' } : y)) }))}>Recalcular</Mini> : <Selo feito>recalculada</Selo>} />
      ))}
    </Lista>
  )
}
function fase45(id: string): DefWidget {
  return {
    id: 'fase45',
    titulo: 'Fases 4 e 5',
    atividades: 'DP-035 a 037, 058, 059, 062',
    descricao: 'Folha de doméstico, benefícios avançados, simulação de custo',
    icone: RocketIcon,
    tamanhos: ['M', 'G'],
    conteudo: () => <Fase45 id={id} />,
  }
}
function Fase45({ id }: { id: string }) {
  const integrante = useIntegranteDP()
  const cliente = nomeCliente(id)
  const itens = [
    ['DP-059', 'Simular o custo de uma contratação'],
    ['DP-062', 'Folha de empregado doméstico'],
    ['DP-058', 'Benefícios flexíveis'],
  ]
  return (
    <Lista vazio="">
      {itens.map(([cod, nome]) => (
        <Linha
          key={cod}
          titulo={nome}
          detalhe={cod}
          fim={
            <Mini onClick={() => integrante({ titulo: `${nome} · ${cliente}`, cliente, inicio: `Vou preparar: ${nome.toLowerCase()}.`, etapas: ['Juntando os dados da folha', 'Calculando encargos e benefícios'], fim: `Pronto: ${nome.toLowerCase()} (rascunho, fase futura). Custo total mensal estimado de R$ 4.910,00 para salário de R$ 2.800,00.` })}>
              Preparar
            </Mini>
          }
        />
      ))}
    </Lista>
  )
}

/* ---------- Simulados de rescisão (C2-02) ---------- */

function simulados(id: string): DefWidget {
  return { id: 'simulados', titulo: 'Simulados de rescisão', atividades: 'C2-02', descricao: 'Pedidos, data de pagamento, simulado legível, cobrança diária da resposta', icone: CalculatorIcon, tamanhos: ['G', 'XL'], conteudo: (t) => <Simulados id={id} t={t} /> }
}
function Simulados({ id, t }: { id: string; t: TamanhoWidget }) {
  const e = useDP(id)
  const integrante = useIntegranteDP()
  const [novo, setNovo] = useState('')
  const cliente = nomeCliente(id)
  const gerar = (s: EstadoDP['simulados'][number]) =>
    integrante({
      titulo: `Simulado de rescisão · ${s.nome}`,
      cliente,
      inicio: `Vou gerar o simulado de ${s.nome} no core e passar para um modelo legível.`,
      etapas: ['Calculando no core (API-18)', 'Passando para o modelo legível do escritório', 'Conferindo médias e férias proporcionais'],
      fim: `Simulado de ${s.nome} pronto. Enviar ao cliente é com aprovação.`,
      depois: () => gravarDP(id, (x) => ({ simulados: x.simulados.map((y) => (y.id === s.id ? { ...y, status: 'gerado', linhas: [['Saldo de salário', 'R$ 1.120,00'], ['Aviso prévio indenizado', 'R$ 3.360,00'], ['13º proporcional', 'R$ 2.800,00'], ['Férias + 1/3', 'R$ 4.106,67'], ['Multa do FGTS (40%)', 'R$ 5.376,00']], total: 'R$ 16.762,67' } : y)) })),
      cartao: { acao: 'dp.simulado', resumo: `Enviar o simulado de rescisão de ${s.nome} a ${cliente}`, argumentos: { Empregado: s.nome, Tipo: s.tipo, Pagamento: s.pagamento, Total: 'R$ 16.762,67' }, clienteId: id, clienteNome: cliente, dados: { cliente: id, simulado: s.id } },
    })
  return (
    <div className="flex flex-col gap-2">
      <ul className={cn('flex flex-col gap-2', t === 'XL' && 'grid grid-cols-2')}>
        {e.simulados.map((s) => (
          <li key={s.id} className="bg-raised flex flex-col gap-1.5 rounded-md p-3 text-sm">
            <div className="flex items-start gap-2">
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{s.nome}</span>
                <span className="text-muted-foreground block text-xs">
                  {s.tipo} · pagamento {s.pagamento}
                </span>
              </span>
              <Selo feito={s.status === 'respondido'} alerta={s.status === 'enviado'}>
                {s.status === 'enviado' ? `aguardando o cliente · ${s.cobrancas} cobr.` : s.status}
              </Selo>
            </div>
            {s.linhas && (
              <dl className="grid grid-cols-[1fr_auto] gap-x-3 text-xs">
                {s.linhas.map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="text-right tabular-nums">{v}</dd>
                  </div>
                ))}
                <dt className="font-medium">Total</dt>
                <dd className="text-right font-medium tabular-nums">{s.total}</dd>
              </dl>
            )}
            <div className="flex flex-wrap gap-1.5">
              {s.status === 'pedido' && <Mini onClick={() => gerar(s)}>Gerar simulado</Mini>}
              {s.status === 'enviado' && (
                <>
                  <Mini onClick={() => (gravarDP(id, (x) => ({ simulados: x.simulados.map((y) => (y.id === s.id ? { ...y, cobrancas: y.cobrancas + 1 } : y)) })), integrante({ titulo: `Cobrar resposta do simulado · ${s.nome}`, cliente, inicio: 'Régua diária: vou cobrar a resposta do simulado.', etapas: ['Mandando a cobrança ao contato do RH'], fim: 'Cobrei. Se não responder, volto a cobrar amanhã.' }))}>Cobrar resposta</Mini>
                  <Mini onClick={() => gravarDP(id, (x) => ({ simulados: x.simulados.map((y) => (y.id === s.id ? { ...y, status: 'respondido' } : y)) }))}>Cliente respondeu</Mini>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
      {!e.simulados.length && <p className="text-muted-foreground text-sm">Nenhum simulado pedido. Pedidos chegam pelo app (pedido de simulado) ou por aqui.</p>}
      <form
        className="flex gap-1.5"
        onSubmit={(ev) => {
          ev.preventDefault()
          if (!novo.trim()) return
          gravarDP(id, (x) => ({ simulados: [...x.simulados, { id: `sm${Date.now()}`, nome: novo.trim(), tipo: 'sem justa causa, aviso indenizado', pagamento: '10/12', status: 'pedido', cobrancas: 0 }] }))
          setNovo('')
        }}
      >
        <input aria-label="Empregado do novo simulado" value={novo} onChange={(ev) => setNovo(ev.target.value)} placeholder="Pedir simulado para…" className="bg-background h-8 min-w-0 flex-1 rounded-md border px-2 text-sm" />
        <Button type="submit" size="sm" variant="outline" className="h-8 rounded-full" disabled={!novo.trim()}>
          Pedir
        </Button>
      </form>
    </div>
  )
}
registrarEfeitoS04('dp.simulado', (c, ctx) => {
  const d = c.extras?.dados as { cliente: string; simulado: string }
  gravarDP(d.cliente, (x) => ({ simulados: x.simulados.map((y) => (y.id === d.simulado ? { ...y, status: 'enviado', cobrancas: 0 } : y)) }))
  ctx.loja.toast('Simulado enviado ao cliente. O DP cobra a resposta todo dia até o retorno.')
})

/* ---------- Rescisão e kit (C2-01) ---------- */

function rescisoes(id: string): DefWidget {
  return { id: 'rescisoes', titulo: 'Rescisões e kit de rescisão', atividades: 'DP-026 a 032; C2-01', descricao: 'Prazo de 10 dias, TRCT, GFD rescisória; kit com extrato do FGTS, extrato para fins rescisórios, guia e seguro-desemprego conferido', icone: DoorOpenIcon, tamanhos: ['G', 'XL'], conteudo: (t) => <Rescisoes id={id} t={t} /> }
}
function Rescisoes({ id, t }: { id: string; t: TamanhoWidget }) {
  const e = useDP(id)
  const integrante = useIntegranteDP()
  const fazer = useFazer()
  const cliente = nomeCliente(id)
  const atualizar = (rid: string, f: (r: EstadoDP['rescisoes'][number]) => Partial<EstadoDP['rescisoes'][number]>) => gravarDP(id, (x) => ({ rescisoes: x.rescisoes.map((r) => (r.id === rid ? { ...r, ...f(r) } : r)) }))
  const montarKit = (r: EstadoDP['rescisoes'][number]) =>
    integrante({
      titulo: `Kit de rescisão · ${r.nome}`,
      cliente,
      inicio: `Vou montar o kit de rescisão de ${r.nome} pelos portais (FGTS Digital e Empregador Web).`,
      etapas: ['Baixando o extrato do FGTS', 'Pedindo o extrato para fins rescisórios (chega amanhã)', 'Emitindo a guia rescisória (GFD)', 'Conferindo o seguro-desemprego: nome, mãe, nascimento e sexo'],
      fim: `Kit de ${r.nome} quase pronto: o extrato para fins rescisórios chega amanhã e o seguro-desemprego tem uma divergência no nome da mãe para você conferir.`,
      depois: () => atualizar(r.id, () => ({ kit: { fgts: true, extratoPedidoEm: HOJE_ISO, extratoChegou: false, guia: true, seguro: 'conferir', divergencia: 'nome da mãe: “Maria Aparecida Teles” no cadastro × “Maria A. Telles” no CNIS' } })),
    })
  return (
    <ul className={cn('flex flex-col gap-2', t === 'XL' && 'grid grid-cols-2')}>
      {!e.rescisoes.length && <li className="text-muted-foreground py-2 text-sm">Nenhuma rescisão em andamento.</li>}
      {e.rescisoes.map((r) => (
        <li key={r.id} className="bg-raised flex flex-col gap-2 rounded-md p-3 text-sm">
          <div className="flex items-start gap-2">
            <span className="min-w-0 flex-1">
              <span className="block font-medium">{r.nome}</span>
              <span className="text-muted-foreground block text-xs">{r.motivo}</span>
            </span>
            {r.desligamento ? <Badge variant="sucesso">desligamento confirmado</Badge> : <Contagem dias={dias(r.prazo)} rotulo={`pagamento até ${diaMes(r.prazo)}`} />}
          </div>
          <div className="flex flex-wrap gap-1">
            <Selo feito={r.trct}>TRCT</Selo>
            <Selo feito={r.kit.fgts}>extrato do FGTS</Selo>
            <Selo feito={r.kit.extratoChegou} alerta={!!r.kit.extratoPedidoEm && !r.kit.extratoChegou}>
              {r.kit.extratoPedidoEm && !r.kit.extratoChegou ? 'fins rescisórios: chega amanhã' : 'fins rescisórios'}
            </Selo>
            <Selo feito={r.kit.guia}>guia rescisória</Selo>
            <Selo feito={r.kit.seguro === 'conferido'} alerta={r.kit.seguro === 'conferir'}>
              seguro-desemprego
            </Selo>
          </div>
          {r.kit.seguro === 'conferir' && r.kit.divergencia && (
            <p className="bg-warning/10 rounded-sm px-2 py-1 text-xs">
              Conferir: {r.kit.divergencia}{' '}
              <button type="button" className="cursor-pointer underline" onClick={() => atualizar(r.id, (x) => ({ kit: { ...x.kit, seguro: 'conferido' } }))}>
                conferi
              </button>
            </p>
          )}
          <div className="flex flex-wrap gap-1.5">
            {!r.kit.fgts && (
              <Mini onClick={() => montarKit(r)}>
                <FileTextIcon /> Montar kit
              </Mini>
            )}
            {r.kit.extratoPedidoEm && !r.kit.extratoChegou && <Mini onClick={() => atualizar(r.id, (x) => ({ kit: { ...x.kit, extratoChegou: true } }))}>Simular: o extrato chegou</Mini>}
            {!r.trct && (
              <Mini onClick={() => integrante({ titulo: `TRCT · ${r.nome}`, cliente, inicio: `Vou gerar o TRCT de ${r.nome}.`, etapas: ['Calculando as verbas', 'Gerando TRCT e termos'], fim: `TRCT de ${r.nome} gerado e anexado. Falta colher as assinaturas.`, depois: () => atualizar(r.id, () => ({ trct: true })) })}>
                Gerar TRCT
              </Mini>
            )}
            {r.trct && r.kit.guia && r.kit.seguro === 'conferido' && !r.desligamento && <Mini onClick={() => (atualizar(r.id, () => ({ desligamento: true })), fazer(() => null, { sucesso: `Desligamento de ${r.nome} confirmado no prazo` }))}>Confirmar desligamento</Mini>}
          </div>
        </li>
      ))}
    </ul>
  )
}

/* ---------- DET e termos (ambas as visões) ---------- */

function det(id: string): DefWidget {
  return { id: 'det', titulo: 'DET, fiscalização e reclamatórias', atividades: 'DP-040, 041, 044, 061', descricao: 'Notificações do DET, prazos e documentos para o advogado', icone: GavelIcon, tamanhos: ['M', 'G'], conteudo: () => <Det id={id} /> }
}
function Det({ id }: { id: string }) {
  const e = useDP(id)
  const fazer = useFazer()
  const fluxos = useFluxos()
  return (
    <Lista vazio="Nenhuma notificação no DET.">
      {e.det.map((n) => (
        <Linha
          key={n.id}
          titulo={n.notificacao}
          detalhe={`prazo ${diaMes(n.prazo)} · ${dias(n.prazo)} dias`}
          fim={
            n.tarefa ? (
              <Mini onClick={() => fluxos.abrirTarefa(n.tarefa!)}>Ver tarefa</Mini>
            ) : (
              <Mini
                onClick={() => {
                  const t = fazer(() => criarTarefa({ atividade_id: 'DP-040', titulo: n.notificacao, setor_id: 'dp', cliente_id: id, prazo_interno: n.prazo, prazo_legal: n.prazo, origem: 'integrante' }), { sucesso: 'Tarefa aberta com o prazo do DET' })
                  if (t) gravarDP(id, (x) => ({ det: x.det.map((y) => (y.id === n.id ? { ...y, tarefa: t.id } : y)) }))
                }}
              >
                Abrir tarefa
              </Mini>
            )
          }
        />
      ))}
    </Lista>
  )
}

function termos(id: string): DefWidget {
  return { id: 'termos', titulo: 'Termo de ciência com assinatura', atividades: 'C2-06', descricao: 'Termos enviados (advertência, ciência de regra), status da assinatura, régua até assinar', icone: SignatureIcon, tamanhos: ['M', 'G'], conteudo: () => <Termos id={id} /> }
}
function Termos({ id }: { id: string }) {
  const e = useDP(id)
  const integrante = useIntegranteDP()
  const { usuario } = useSessao()
  const [tipo, setTipo] = useState('Ciência da política de uso de celular')
  const [quem, setQuem] = useState('')
  const cliente = nomeCliente(id)
  void usuario
  return (
    <div className="flex flex-col gap-2">
      <Lista vazio="Nenhum termo enviado.">
        {e.termos.map((x) => (
          <Linha
            key={x.id}
            titulo={`${x.tipo} · ${x.empregado}`}
            detalhe={x.status === 'enviado' ? `aguardando assinatura · ${x.regua} lembretes da régua` : x.status === 'cartao' ? 'cartão de envio aguardando você' : x.status}
            fim={x.status === 'enviado' ? <Mini onClick={() => gravarDP(id, (y) => ({ termos: y.termos.map((z) => (z.id === x.id ? { ...z, status: 'assinado' } : z)) }))}>Simular: assinou</Mini> : x.status === 'assinado' ? <Selo feito>assinado</Selo> : undefined}
          />
        ))}
      </Lista>
      <form
        className="flex flex-wrap gap-1.5"
        onSubmit={(ev) => {
          ev.preventDefault()
          if (!quem.trim()) return
          const tid = `tm${Date.now()}`
          integrante({
            titulo: `Termo de ciência · ${quem}`,
            cliente,
            inicio: `Vou gerar o termo “${tipo}” para ${quem}.`,
            etapas: ['Montando o termo com o modelo do escritório', 'Preparando o envio para assinatura eletrônica (API-22)'],
            fim: 'Termo pronto. Enviar para assinatura é com aprovação.',
            depois: () => gravarDP(id, (y) => ({ termos: [...y.termos, { id: tid, tipo, empregado: quem, status: 'cartao', regua: 0 }] })),
            cartao: { acao: 'dp.termo', resumo: `Enviar o termo “${tipo}” para ${quem} assinar`, argumentos: { Empregado: quem, Termo: tipo, Assinatura: 'eletrônica', Régua: 'lembrete a cada 2 dias até assinar' }, clienteId: id, clienteNome: cliente, dados: { cliente: id, termo: tid } },
          })
          setQuem('')
        }}
      >
        <select aria-label="Tipo de termo" value={tipo} onChange={(ev) => setTipo(ev.target.value)} className="bg-popover h-8 rounded-md border px-1.5 text-xs">
          <option>Ciência da política de uso de celular</option>
          <option>Advertência por atraso</option>
          <option>Ciência do regulamento interno</option>
        </select>
        <input aria-label="Empregado do termo" value={quem} onChange={(ev) => setQuem(ev.target.value)} placeholder="Empregado" className="bg-background h-8 min-w-0 grow basis-40 rounded-md border px-2 text-sm" />
        <Button type="submit" size="sm" variant="outline" className="h-8 rounded-full" disabled={!quem.trim()}>
          Gerar termo
        </Button>
      </form>
    </div>
  )
}
registrarEfeitoS04('dp.termo', (c, ctx) => {
  const d = c.extras?.dados as { cliente: string; termo: string }
  gravarDP(d.cliente, (x) => ({ termos: x.termos.map((y) => (y.id === d.termo ? { ...y, status: 'enviado', regua: 0 } : y)) }))
  ctx.loja.toast('Termo enviado para assinatura. O DP acompanha com a régua até assinar.')
})

/* ---------- Carteira ---------- */

const carteira: DefWidget = {
  id: 'carteira-folha',
  titulo: 'Folha da carteira · 11/2026',
  atividades: 'DP-009, 014',
  descricao: 'Folha de cada cliente na competência: variáveis, prévia, eSocial, guias',
  icone: MoneyIcon,
  tamanhos: ['XL'],
  conteudo: () => <Carteira />,
}
function Carteira() {
  useTabela('registro_tela')
  const integrante = useIntegranteDP()
  const ids = ['c1', 'c2', 'c3', 'c5', 'c7']
  const linhas = ids.map((id) => ({ id, nome: nomeCliente(id), e: lerDP(id), empregados: dpDe(id).quadro.ativos }))
  const faltando = linhas.filter((l) => l.e.variaveis.some((v) => !v.recebido))
  return (
    <div className="flex flex-col gap-2">
      <Tabela colunas={[{ rotulo: 'Cliente' }, { rotulo: 'Empregados', direita: true }, { rotulo: 'Variáveis' }, { rotulo: 'Prévia' }, { rotulo: 'eSocial' }, { rotulo: 'Guias' }]} minimo={640}>
        {linhas.map(({ id, nome, e, empregados }) => (
          <tr key={id}>
            <td className="py-2 pr-2">{nome}</td>
            <td className="py-2 pr-2 text-right tabular-nums">{empregados}</td>
            <td className="py-2 pr-2">
              <Selo feito={e.variaveis.every((v) => v.recebido)} alerta={e.variaveis.some((v) => !v.recebido)}>
                {e.variaveis.filter((v) => v.recebido).length}/{e.variaveis.length}
              </Selo>
            </td>
            <td className="py-2 pr-2 text-xs">{e.importada ? 'importada' : e.previa}</td>
            <td className="py-2 pr-2 text-xs">{e.esocial.filter((x) => x.situacao === 'rejeitado').length ? `${e.esocial.filter((x) => x.situacao === 'rejeitado').length} rejeitado` : 'ok'}</td>
            <td className="py-2 text-xs">{e.pacote === 'enviado' ? 'enviadas' : `${e.guias.length} a enviar`}</td>
          </tr>
        ))}
      </Tabela>
      {faltando.length > 0 && (
        <Mini
          className="h-7 w-fit rounded-full"
          onClick={() =>
            integrante({
              titulo: `Pedir variáveis em lote (${faltando.length} clientes)`,
              cliente: 'carteira',
              inicio: `Vou pedir as variáveis de novembro a ${faltando.length} clientes.`,
              etapas: faltando.map((l) => `Enviando o formulário a ${l.nome}`),
              fim: `Pedi as variáveis a ${faltando.length} clientes. Vou cobrando pela régua; as respostas chegam no CRM e já entram aqui.`,
              depois: () => faltando.forEach((l) => gravarDP(l.id, (x) => ({ variaveis: x.variaveis.map((v) => ({ ...v, esperado: `${v.esperado} · pedido em lote` })) }))),
            })
          }
        >
          Pedir variáveis em lote ({faltando.length})
        </Mini>
      )}
    </div>
  )
}
const carteiraRescisao: DefWidget = {
  id: 'carteira-rescisao',
  titulo: 'Rescisões e simulados da carteira',
  atividades: 'DP-026 a 032; C2-01, C2-02',
  descricao: 'Prazos de 10 dias e simulados aguardando o cliente em todos os clientes',
  icone: DoorOpenIcon,
  tamanhos: ['G', 'XL'],
  conteudo: () => <CarteiraRescisao />,
}
function CarteiraRescisao() {
  useTabela('registro_tela')
  const ids = ['c1', 'c2', 'c3', 'c5', 'c7']
  const itens = ids.flatMap((id) => {
    const e = lerDP(id)
    return [...e.rescisoes.filter((r) => !r.desligamento).map((r) => ({ k: r.id + id, t: `${r.nome} · ${nomeCliente(id)}`, d: `rescisão · pagamento até ${diaMes(r.prazo)}`, dias: dias(r.prazo) })), ...e.simulados.filter((s) => s.status !== 'respondido').map((s) => ({ k: s.id + id, t: `${s.nome} · ${nomeCliente(id)}`, d: `simulado ${s.status}`, dias: 99 }))]
  })
  return (
    <Lista vazio="Nenhuma rescisão ou simulado aberto na carteira.">
      {itens.map((i) => (
        <Linha key={i.k} titulo={i.t} detalhe={i.d} fim={i.dias < 99 ? <Contagem dias={i.dias} rotulo="dias" /> : undefined} />
      ))}
    </Lista>
  )
}

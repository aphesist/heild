import { useState } from 'react'
import { ArrowClockwiseIcon, ArrowsInLineHorizontalIcon, ChatsCircleIcon, CloudArrowDownIcon, FileArrowUpIcon, FileZipIcon, GearSixIcon, HandPointingIcon, MagnifyingGlassIcon, PackageIcon, PercentIcon, ReceiptIcon, SirenIcon } from '@phosphor-icons/react'
import { useAgenteS02 } from '@/ambiente/agente-s02'
import { useFluxos } from '@/ambiente/fluxos'
import { useLoja, useNavegacao } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import { EstadoErro, EstadoVazio, SeloDemonstracao, useConfirmar } from '@/components/kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { DefWidget, TamanhoWidget } from '@/components/widgets/tipos'
import { agoraCurto, difParidade, divergenciasAbertas, estadoNotas, mudarNotas, totalXmls, useNotas, useNotasTodos, type EstadoNotas } from '@/dados/s02/notas'
import { hashCurto } from '@/dados/obrigacoes-setor'
import { banco } from '@/nucleo/banco'
import { useTabela } from '@/nucleo/react'
import { servicos } from '@/servicos'
import { cn } from '@/lib/utils'
import { IconeSituacao, Linha, Numero, Tabela } from '../Tabela'
import { contatoDocs, nomeCliente } from './acoes'
import { GavetaAbrirZip, GavetaConfigurarCaptura, GavetaDivergencia, GavetaRegistrarNfse } from './gavetas'
import { useForcarCaptura, usePodeNotas } from './hooks'
import { SaudeCaptura } from './saude'
import { AreaRolagem } from '@/components/ui/area-rolagem'

const botaoAcao = 'h-6 rounded-full px-2 text-xs'
const fmt = (n: number) => n.toLocaleString('pt-BR')
const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

/* ---------- Captura do mês (NFE-004 a 013) e forçar captura (S02-A54) ---------- */

function CapturaDoMes({ clienteId, t }: { clienteId: string; t: TamanhoWidget }) {
  const e = useNotas(clienteId)
  const pode = usePodeNotas(clienteId)
  const cap = useForcarCaptura()
  const rodando = cap.rodando.includes(clienteId)
  if (e.captura.situacao === 'sem_configuracao') return <EstadoVazio compacto titulo="Captura não configurada" descricao="Cadastre CNPJs, inscrições e certificado em Configuração de captura." />
  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <SaudeCaptura clienteId={clienteId} />
        {pode.capturar && (
          <Button size="sm" variant="outline" className={botaoAcao} disabled={rodando} onClick={() => cap.forcar([clienteId])}>
            <ArrowClockwiseIcon className={cn(rodando && 'animate-spin')} /> {rodando ? 'Capturando…' : 'Forçar captura · executar'}
          </Button>
        )}
        {cap.fonte && !rodando && <SeloDemonstracao fonte={cap.fonte} />}
      </div>
      {cap.erro?.clienteId === clienteId && (
        <div role="alert" className="bg-destructive/12 text-foreground flex items-start gap-2 rounded-[12px] px-3 py-2 text-xs">
          <span className="flex-1">{cap.erro.texto}</span>
          <button type="button" className="cursor-pointer font-medium underline" onClick={() => cap.forcar([clienteId])}>
            tentar de novo
          </button>
        </div>
      )}
      {t === 'M' ? (
        <Numero valor={fmt(totalXmls(e))} legenda={`XMLs capturados em ${e.competencia}`} />
      ) : (
        <div className={cn('grid min-h-0 flex-1 gap-2', t === 'L' ? 'grid-cols-1 sm:grid-cols-3' : e.fluxos.length > 2 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2')}>
          {e.fluxos.map((f) => {
            const paridade = e.migracao_aberta ? (f.paridade === f.qtd ? 'paridade SIEG ok' : `SIEG achou ${fmt(f.paridade)} (${f.qtd - f.paridade > 0 ? '+' : ''}${f.qtd - f.paridade})`) : f.fonte
            const alerta = e.migracao_aberta && f.paridade !== f.qtd
            return t === 'L' ? (
              <div key={f.tipo} className="bg-raised flex min-w-0 items-baseline gap-2 rounded-[12px] px-3 py-1.5">
                <span className="font-heading text-xl font-light tabular-nums">{fmt(f.qtd)}</span>
                <span className="min-w-0 flex-1">
                  <span className="text-muted-foreground block truncate text-xs">{f.tipo}</span>
                  <span className={cn('block truncate text-xs', alerta ? 'text-warning-text font-medium' : 'text-muted-foreground')}>{paridade}</span>
                </span>
              </div>
            ) : (
              <div key={f.tipo} className="bg-raised flex min-w-0 flex-col justify-between rounded-[14px] px-3 py-2">
                <span className="text-muted-foreground truncate text-xs">{f.tipo}</span>
                <span className="font-heading text-2xl font-light tabular-nums">{fmt(f.qtd)}</span>
                <span className={cn('truncate text-xs', alerta ? 'text-warning-text font-medium' : 'text-muted-foreground')}>{e.migracao_aberta ? `${f.fonte} · ${paridade}` : f.fonte}</span>
              </div>
            )
          })}
        </div>
      )}
      {t === 'XL' && e.rodadas.length > 0 && (
        <p className="text-muted-foreground truncate text-xs">
          Rodadas:{' '}
          {e.rodadas
            .slice(0, 3)
            .map((r) => `${r.quando} · +${r.novos} (${r.origem})`)
            .join(' · ')}
          {e.migracao_aberta && ' · migração do SIEG aberta: a paridade fecha após 3 meses iguais'}
        </p>
      )}
    </div>
  )
}

/* ---------- Configuração de captura (NFE-001, 002, 003) ---------- */

function ConfiguracaoCaptura({ clienteId, t }: { clienteId: string; t: TamanhoWidget }) {
  const e = useNotas(clienteId)
  const pode = usePodeNotas(clienteId)
  const cap = useForcarCaptura()
  const trabalhar = useAgenteS02()
  const loja = useLoja()
  const [editar, setEditar] = useState(false)
  const p = e.perfil
  const linhas: {
    item: string
    valor: string
    s: 'ok' | 'atencao' | 'erro' | 'neutro'
  }[] = [
    {
      item: 'CNPJs monitorados',
      valor: p.cnpjs.join(', ') || 'nenhum',
      s: p.cnpjs.length ? 'ok' : 'erro',
    },
    { item: 'Inscrições', valor: `IE ${p.ies} · IM ${p.ims}`, s: 'ok' },
    {
      item: 'Modelos e caminho',
      valor: p.modelos.map((m) => `${m} por ${p.caminho[m] ?? '·'}`).join(' · ') || 'nenhum',
      s: p.modelos.length ? 'ok' : 'erro',
    },
    {
      item: 'Certificado',
      valor: p.certificado,
      s: /vencid|não cadastrado/.test(p.certificado) ? 'erro' : /vence em (\d+)/.test(p.certificado) && Number(p.certificado.match(/vence em (\d+)/)![1]) <= 30 ? 'atencao' : 'ok',
    },
    {
      item: 'autXML nas vendas',
      valor: p.autxml === 'incluido' ? 'escritório incluído' : p.autxml === 'orientado' ? 'cliente orientado, aguardando' : 'escritório fora do autXML',
      s: p.autxml === 'incluido' ? 'ok' : 'atencao',
    },
    { item: 'E-mail de recepção', valor: p.email_recepcao, s: 'ok' },
    {
      item: 'Situação diária',
      valor: e.captura.situacao === 'parada' ? `parada: ${e.captura.motivo}` : `${e.captura.ultima} · NSU ${fmt(e.captura.nsu)}`,
      s: e.captura.situacao === 'parada' ? 'erro' : e.captura.situacao === 'ok' ? 'ok' : 'atencao',
    },
  ]
  const orientar = () =>
    trabalhar({
      setor: 'notas',
      titulo: 'Orientar o autXML',
      cliente: nomeCliente(clienteId),
      clienteId,
      etapas: ['Conferindo as vendas sem o escritório no autXML', 'Escrevendo o passo a passo para o emissor do cliente'],
      texto: 'Preparei a orientação de autXML para o cliente. Confere e aprova para eu enviar.',
      cartao: {
        acao: {
          tipo: 'notas.orientar_autxml',
          clienteId,
          texto: `Oi, ${contatoDocs(loja, clienteId).split(' ')[0]}! Para recebermos o XML das suas vendas direto da SEFAZ, inclua o CNPJ do escritório (12.345.678/0001-00) no campo "autXML" do seu emissor. No sistema de vocês fica em Configurações › NF-e › Autorizados a baixar. Qualquer dúvida, é só responder.`,
        },
        resumo: 'Enviar orientação de autXML ao cliente',
        argumentos: [
          ['Canal', 'WhatsApp'],
          ['Atividade', 'NFE-002'],
        ],
      },
    })
  return (
    <div className="flex h-full flex-col gap-2">
      <ul className="flex flex-col gap-1.5">
        {(t === 'M'
          ? linhas
              .filter((l) => l.s !== 'ok')
              .concat(linhas.slice(-1))
              .slice(0, 3)
          : linhas
        ).map((l) => (
          <li key={l.item} className="flex items-center gap-2.5 text-sm">
            <IconeSituacao s={l.s} />
            <span className="min-w-0 flex-1 truncate">{l.item}</span>
            <span className="text-muted-foreground max-w-[55%] shrink-0 truncate text-right text-xs">{l.valor}</span>
          </li>
        ))}
      </ul>
      {t !== 'M' && (
        <div className="mt-auto flex flex-wrap gap-1.5">
          {pode.configurar && (
            <Button size="sm" variant="outline" className={botaoAcao} onClick={() => setEditar(true)}>
              <GearSixIcon /> {e.captura.situacao === 'sem_configuracao' ? 'Cadastrar' : 'Editar'}
            </Button>
          )}
          {pode.configurar && p.autxml === 'falta' && (
            <Button size="sm" variant="outline" className={botaoAcao} onClick={orientar}>
              Orientar autXML · preparar
            </Button>
          )}
          {pode.capturar && e.captura.situacao !== 'sem_configuracao' && (
            <Button size="sm" variant="ghost" className={botaoAcao} disabled={cap.rodando.length > 0} onClick={() => cap.forcar([clienteId], 'rotina 03:00')}>
              Rodar a rotina das 3h agora
            </Button>
          )}
        </div>
      )}
      {editar && <GavetaConfigurarCaptura clienteId={clienteId} onFechar={() => setEditar(false)} />}
    </div>
  )
}

/* ---------- Manifestação (NFE-014, 015, 016; S02-A58) ---------- */

function Manifestacao({ clienteId, t }: { clienteId: string; t: TamanhoWidget }) {
  const e = useNotas(clienteId)
  const pode = usePodeNotas(clienteId)
  const trabalhar = useAgenteS02()
  const semCiencia = e.resumos.filter((r) => r.situacao === 'sem_ciencia')
  const semConclusao = e.resumos.filter((r) => r.situacao === 'ciencia')
  const nome = nomeCliente(clienteId)
  const ciencia = () =>
    trabalhar({
      setor: 'notas',
      titulo: 'Dar ciência dos resumos',
      cliente: nome,
      clienteId,
      etapas: ['Registrando a ciência da operação na SEFAZ', 'Baixando os XMLs completos'],
      texto: `Dei ciência de ${semCiencia.length} ${semCiencia.length === 1 ? 'resumo' : 'resumos'} e baixei os XMLs completos. A conclusão (confirmar ou desconhecer) fica para vocês até ${e.prazo_manifestacao.replace('conclusão até ', '')}.`,
      aoTerminar: () =>
        mudarNotas(
          clienteId,
          (x) => ({
            ...x,
            resumos: x.resumos.map((r) => (r.situacao === 'sem_ciencia' ? { ...r, situacao: 'ciencia' } : r)),
          }),
          `Notas deu ciência de ${semCiencia.length} resumos de ${nome} (NFE-014, faz sozinho)`,
        ),
    })
  const concluir = (id: string, evento: 'confirmada' | 'desconhecida' | 'nao_realizada') => {
    const r = e.resumos.find((x) => x.id === id)!
    const rotulo = {
      confirmada: 'Confirmar a operação',
      desconhecida: 'Desconhecer a operação',
      nao_realizada: 'Operação não realizada',
    }[evento]
    const cartao = trabalhar({
      setor: 'notas',
      titulo: rotulo,
      cliente: nome,
      clienteId,
      etapas: ['Conferindo a nota com o pedido e o extrato', 'Preparando o evento para a SEFAZ'],
      texto: `Preparei “${rotulo.toLowerCase()}” para a ${r.nota} (${r.emitente}). É um evento que vai à SEFAZ: aprova para eu transmitir.`,
      cartao: {
        acao: {
          tipo: 'notas.manifestar',
          clienteId,
          resumoId: id,
          nota: r.nota,
          evento,
        },
        resumo: `${rotulo}: ${r.nota}`,
        argumentos: [
          ['Emitente', r.emitente],
          ['Valor', r.valor],
        ],
      },
    })
    mudarNotas(clienteId, (x) => ({
      ...x,
      resumos: x.resumos.map((y) => (y.id === id ? { ...y, cartao } : y)),
    }))
  }
  if (!e.resumos.length) return <p className="text-muted-foreground py-2 text-sm">Nenhum resumo a manifestar.</p>
  if (t === 'P') return <Numero valor={semConclusao.length} legenda="sem conclusão" alerta={semConclusao.length > 0} />
  return (
    <div className="flex h-full flex-col gap-2">
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col">
          <span className="font-heading text-2xl font-light tabular-nums">{semCiencia.length}</span>
          <span className="text-muted-foreground text-xs">resumos sem ciência</span>
        </div>
        <div className="flex flex-col">
          <span className={cn('font-heading text-2xl font-light tabular-nums', semConclusao.length && 'text-warning-text')}>{semConclusao.length}</span>
          <span className="text-muted-foreground text-xs">sem conclusão · {e.prazo_manifestacao}</span>
        </div>
      </div>
      {t === 'G' && (
        <AreaRolagem as="ul" className="divide-border/70 flex flex-col divide-y">
          {semConclusao.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center gap-x-2 gap-y-1 py-1.5">
              <span className="min-w-0 grow basis-40">
                <span className="block truncate text-sm">{r.nota}</span>
                <span className="text-muted-foreground block truncate text-xs">
                  {r.emitente} · {r.valor}
                </span>
              </span>
              {r.cartao ? (
                <Badge variant="outline">aguardando aprovação</Badge>
              ) : (
                pode.manifestar && (
                  <span className="flex gap-1">
                    <Button size="sm" variant="ghost" className={botaoAcao} onClick={() => concluir(r.id, 'confirmada')}>
                      Confirmar
                    </Button>
                    <Button size="sm" variant="ghost" className={botaoAcao} onClick={() => concluir(r.id, 'desconhecida')}>
                      Desconhecer
                    </Button>
                  </span>
                )
              )}
            </li>
          ))}
          {e.resumos
            .filter((r) => r.situacao !== 'sem_ciencia' && r.situacao !== 'ciencia')
            .map((r) => (
              <Linha key={r.id} inicio={<IconeSituacao s="ok" />} titulo={r.nota} detalhe={`${r.situacao === 'confirmada' ? 'operação confirmada' : r.situacao === 'desconhecida' ? 'desconhecida' : 'não realizada'} · ${r.emitente}`} className="py-1.5" />
            ))}
        </AreaRolagem>
      )}
      {t === 'G' && semCiencia.length > 0 && pode.manifestar && (
        <Button size="sm" variant="outline" className="mt-auto w-fit shrink-0 rounded-full" onClick={ciencia}>
          <HandPointingIcon /> Dar ciência de {semCiencia.length} · executar
        </Button>
      )}
    </div>
  )
}

/* ---------- Completude e conferência (NFE-020 a 035; S02-A59) ---------- */

function Completude({ clienteId, t }: { clienteId: string; t: TamanhoWidget }) {
  const e = useNotas(clienteId)
  const pode = usePodeNotas(clienteId)
  const loja = useLoja()
  const fluxos = useFluxos()
  const { usuario } = useSessao()
  const abrir = (id: string) => {
    const it = e.completude.find((x) => x.id === id)!
    if (it.tarefa) return fluxos.abrirTarefa(it.tarefa)
    const tarefa = loja.criarTarefa({
      codigo: it.atividade,
      titulo: `${it.item}: ${it.valor}`,
      cliente: nomeCliente(clienteId),
      setor: 'notas',
      prazo: '22/11',
      status: 'a_fazer',
      responsavel: { tipo: 'pessoa', nome: usuario.nome },
    })
    mudarNotas(
      clienteId,
      (x) => ({
        ...x,
        completude: x.completude.map((c) => (c.id === id ? { ...c, tarefa } : c)),
      }),
      `${usuario.nome} abriu a tarefa ${it.atividade} para “${it.item}” (${nomeCliente(clienteId)})`,
    )
    fluxos.abrirTarefa(tarefa)
  }
  const lista = t === 'M' ? e.completude.filter((c) => c.situacao !== 'ok') : e.completude
  if (!e.completude.length) return <p className="text-muted-foreground py-2 text-sm">Nada a conferir nesta competência.</p>
  return (
    <ul className="divide-border/70 flex flex-col divide-y">
      {lista.map((c) => (
        <Linha
          key={c.id}
          inicio={<IconeSituacao s={c.situacao} />}
          titulo={c.item}
          detalhe={`${c.valor} · ${c.atividade}`}
          fim={
            c.situacao !== 'ok' && t !== 'M' && (c.tarefa || pode.tarefa) ? (
              <Button size="sm" variant="ghost" className={botaoAcao} onClick={() => abrir(c.id)}>
                {c.tarefa ? 'Ver tarefa' : 'Abrir tarefa'}
              </Button>
            ) : undefined
          }
        />
      ))}
      {t === 'M' && !lista.length && <li className="text-muted-foreground py-2 text-sm">Tudo confere.</li>}
    </ul>
  )
}

/* ---------- Conferência tributária (NFE-023 a 027; S02-A60) ---------- */

function ConferenciaTributaria({ clienteId, t }: { clienteId: string; t: TamanhoWidget }) {
  const e = useNotas(clienteId)
  const pode = usePodeNotas(clienteId)
  const [aberta, setAberta] = useState<string | null>(null)
  const abertas = e.tributaria.filter((x) => x.situacao === 'aberta')
  if (t === 'P') return <Numero valor={abertas.length} legenda="divergências" alerta={abertas.length > 0} />
  if (!e.tributaria.length) return <p className="text-muted-foreground py-2 text-sm">Nenhuma divergência tributária nas notas.</p>
  const item = e.tributaria.find((x) => x.id === aberta)
  return (
    <ul className="divide-border/70 flex flex-col divide-y">
      {e.tributaria.map((x) => (
        <Linha
          key={x.id}
          inicio={
            <Badge variant="outline" className="min-w-16 justify-center">
              {x.tipo}
            </Badge>
          }
          titulo={x.alerta}
          detalhe={x.situacao === 'aberta' ? `${x.nota} · sugestão: ${x.sugestao}` : `${x.nota} · ${x.situacao === 'aceita' ? 'sugestão aceita' : `corrigida: ${x.correcao}`}`}
          fim={
            x.situacao === 'aberta' && pode.configurar ? (
              <Button size="sm" variant="ghost" className={botaoAcao} onClick={() => setAberta(x.id)}>
                Conferir
              </Button>
            ) : x.situacao !== 'aberta' ? (
              <IconeSituacao s="ok" />
            ) : undefined
          }
        />
      ))}
      {item && <GavetaDivergencia clienteId={clienteId} item={item} onFechar={() => setAberta(null)} />}
    </ul>
  )
}

/* ---------- Eventos posteriores e risco (NFE-018, 010, 028, 019, 017; S02-A61) ---------- */

function EventosPosteriores({ clienteId, t }: { clienteId: string; t: TamanhoWidget }) {
  const e = useNotas(clienteId)
  const pode = usePodeNotas(clienteId)
  const trabalhar = useAgenteS02()
  const fluxos = useFluxos()
  const nome = nomeCliente(clienteId)
  const rotulo = {
    cancelada_apos_importacao: 'Cancelada após importar',
    mdfe_aberto: 'MDF-e aberto',
    cte_contestar: 'CT-e a contestar',
    fornecedor: 'Fornecedor',
  }
  const agir = (id: string) => {
    const ev = e.eventos.find((x) => x.id === id)!
    if (ev.tipo === 'mdfe_aberto') {
      mudarNotas(clienteId, (x) => ({
        ...x,
        eventos: x.eventos.map((y) => (y.id === id ? { ...y, situacao: 'cobrado' } : y)),
      }))
      return fluxos.cobrar({
        cliente: nome,
        setor: 'notas',
        texto: '',
        assunto: `o encerramento do ${ev.nota}`,
      })
    }
    if (ev.tipo === 'fornecedor')
      return mudarNotas(
        clienteId,
        (x) => ({
          ...x,
          eventos: x.eventos.map((y) => (y.id === id ? { ...y, situacao: 'ciente' } : y)),
        }),
        `Ciência do risco do fornecedor ${ev.nota} (NFE-028)`,
      )
    const cancelada = ev.tipo === 'cancelada_apos_importacao'
    trabalhar({
      setor: 'notas',
      titulo: cancelada ? 'Ajustar nota cancelada no core' : 'Contestar CT-e',
      cliente: nome,
      clienteId,
      etapas: cancelada ? ['Achando os lançamentos da nota no core', 'Preparando o estorno da escrituração'] : ['Conferindo o conhecimento com o pedido de frete', 'Preparando o evento de desacordo'],
      texto: cancelada ? `Preparei o estorno da ${ev.nota} no core (${e.competencia}). Aprova para eu enviar o ajuste.` : `Preparei o evento de desacordo do ${ev.nota}. Aprova para eu registrar na SEFAZ.`,
      cartao: {
        acao: {
          tipo: cancelada ? 'notas.ajustar_cancelada' : 'notas.contestar_cte',
          clienteId,
          eventoId: id,
          nota: ev.nota,
        },
        resumo: cancelada ? `Ajustar no core: ${ev.nota}` : `Contestar ${ev.nota}`,
        argumentos: [['Detalhe', ev.detalhe]],
      },
    })
    mudarNotas(clienteId, (x) => ({
      ...x,
      eventos: x.eventos.map((y) => (y.id === id ? { ...y, situacao: 'aguardando_aprovacao' } : y)),
    }))
  }
  const acao = (tipo: string) => (tipo === 'cancelada_apos_importacao' ? 'Ajustar · com aprovação' : tipo === 'cte_contestar' ? 'Contestar · com aprovação' : tipo === 'mdfe_aberto' ? 'Cobrar encerramento' : 'Ciente')
  if (!e.eventos.length) return <p className="text-muted-foreground py-2 text-sm">Nenhum evento depois da importação; fornecedores regulares (conferido hoje às 03:20).</p>
  if (t === 'P') return <Numero valor={e.eventos.filter((x) => x.situacao === 'aberto').length} legenda="eventos a tratar" alerta />
  return (
    <ul className="divide-border/70 flex flex-col divide-y">
      {e.eventos.map((ev) => (
        <Linha
          key={ev.id}
          inicio={<IconeSituacao s={ev.situacao === 'aberto' ? 'atencao' : ev.situacao === 'aguardando_aprovacao' ? 'neutro' : 'ok'} />}
          titulo={`${rotulo[ev.tipo]} · ${ev.nota}`}
          detalhe={ev.situacao === 'aberto' ? ev.detalhe : `${ev.detalhe} · ${ev.situacao.replace('_', ' ')}`}
          fim={
            ev.situacao === 'aberto' && pode.manifestar ? (
              <Button size="sm" variant="ghost" className={botaoAcao} onClick={() => agir(ev.id)}>
                {acao(ev.tipo)}
              </Button>
            ) : undefined
          }
        />
      ))}
    </ul>
  )
}

/* ---------- Envio ao core e guarda (NFE-033, 034, 036; S02-A62, A63) ---------- */

function EnvioCore({ clienteId, t }: { clienteId: string; t: TamanhoWidget }) {
  const e = useNotas(clienteId)
  const pode = usePodeNotas(clienteId)
  const trabalhar = useAgenteS02()
  const loja = useLoja()
  const fluxos = useFluxos()
  const { usuario } = useSessao()
  const nome = nomeCliente(clienteId)
  const reenviar = (id: string) => {
    const l = e.lotes.find((x) => x.id === id)!
    trabalhar({
      setor: 'notas',
      titulo: 'Reenviar lote ao core',
      cliente: nome,
      clienteId,
      etapas: ['Corrigindo o campo do layout', 'Reenviando o lote ao sistema contábil'],
      texto: `Lote ${l.lote} reenviado e aceito pelo core.`,
      aoTerminar: () =>
        mudarNotas(
          clienteId,
          (x) => ({
            ...x,
            lotes: x.lotes.map((y) =>
              y.id === id
                ? {
                    ...y,
                    erros: 0,
                    erro: undefined,
                    situacao: `reenviado ${agoraCurto()} · aceito`,
                  }
                : y,
            ),
          }),
          `${usuario.nome} reenviou o lote ${l.lote} de ${nome} ao core (NFE-033)`,
        ),
    })
  }
  const guardar = (comp: string) => {
    const arquivos = totalXmls(estadoNotas(clienteId)) + 12
    const hash = hashCurto(`${clienteId}${comp}${Date.now()}`)
    trabalhar({
      setor: 'notas',
      titulo: `Pacote de guarda ${comp}`,
      cliente: nome,
      clienteId,
      etapas: ['Juntando XMLs, eventos e PDFs da competência', 'Gerando o manifesto', 'Calculando o hash SHA-256 do pacote'],
      texto: `Pacote de guarda de ${comp} pronto: ${fmt(arquivos)} arquivos, manifesto e hash ${hash}. Ficou na pasta Notas / Guarda.`,
      aoTerminar: () => {
        mudarNotas(
          clienteId,
          (x) => ({
            ...x,
            guarda: x.guarda.map((g) => (g.competencia === comp ? { ...g, gerado_em: agoraCurto(), hash, arquivos } : g)),
          }),
          `Pacote de guarda ${comp} de ${nome} gerado: ${arquivos} arquivos, hash ${hash} (NFE-036)`,
        )
        loja.adicionarDocumento({
          nome: `Guarda ${comp.replace('/', '-')} ${nome}.zip`,
          clienteId,
          pasta: ['Notas', 'Guarda'],
          tipo: 'outro',
          competencia: comp,
          origem: 'gerado_plataforma',
          conector: 'drive',
          tamanho: '38 MB',
          quando: 'agora',
          por: 'Notas (integrante)',
          dados: { manifesto: `${arquivos} arquivos`, hash },
        })
        fluxos.baixar(`Guarda ${comp.replace('/', '-')} ${nome}.zip`)
      },
    })
  }
  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <AreaRolagem as="ul" className="divide-border/70 flex flex-1 flex-col divide-y">
        {!e.lotes.length && <li className="text-muted-foreground py-2 text-sm">Nenhum lote para enviar.</li>}
        {(t === 'M' ? e.lotes.filter((l) => l.erros).slice(0, 2) : e.lotes).map((l) => (
          <Linha
            key={l.id}
            inicio={<IconeSituacao s={l.erros ? 'erro' : 'ok'} />}
            titulo={l.lote}
            detalhe={l.erro ?? l.situacao}
            fim={
              l.erros && pode.capturar ? (
                <Button size="sm" variant="ghost" className={botaoAcao} onClick={() => reenviar(l.id)}>
                  Reenviar
                </Button>
              ) : undefined
            }
          />
        ))}
      </AreaRolagem>
      {t !== 'M' && (
        <div className="border-border/70 flex shrink-0 flex-col gap-1 border-t pt-2">
          {e.guarda.map((g) => (
            <div key={g.competencia} className="flex items-center gap-2 text-sm">
              <PackageIcon className="text-muted-foreground size-4 shrink-0" />
              <span className="min-w-0 flex-1 truncate">
                Guarda {g.competencia}{' '}
                {g.gerado_em ? (
                  <span className="text-muted-foreground text-xs">
                    · {g.arquivos} arquivos · hash {g.hash}
                  </span>
                ) : (
                  <span className="text-muted-foreground text-xs">· a gerar</span>
                )}
              </span>
              {pode.documento && (
                <Button size="sm" variant="ghost" className={botaoAcao} onClick={() => (g.gerado_em ? fluxos.baixar(`Guarda ${g.competencia.replace('/', '-')} ${nome}.zip`) : guardar(g.competencia))}>
                  {g.gerado_em ? 'Baixar' : 'Gerar pacote'}
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ---------- Atendimento e emissão (NFE-037, 038, 039, 201; S02-A64, A65, A66) ---------- */

function AtendimentoEmissao({ clienteId, t }: { clienteId: string; t: TamanhoWidget }) {
  const e = useNotas(clienteId)
  const pode = usePodeNotas(clienteId)
  const trabalhar = useAgenteS02()
  const loja = useLoja()
  const fluxos = useFluxos()
  const confirmar = useConfirmar()
  const { usuario } = useSessao()
  const nome = nomeCliente(clienteId)
  const [gaveta, setGaveta] = useState<'nfse' | 'zip' | null>(null)
  const [emitindo, setEmitindo] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const atender = (id: string) => {
    const a = e.atendimento.find((x) => x.id === id)!
    trabalhar({
      setor: 'notas',
      titulo: 'Atender pedido de XML',
      cliente: nome,
      clienteId,
      etapas: ['Separando os XMLs pedidos', 'Gerando o link de download com validade de 7 dias'],
      texto: `Mandei a ${a.quem} o link com os XMLs pedidos (${a.pedido}). Registro de entrega na pasta.`,
      aoTerminar: () =>
        mudarNotas(
          clienteId,
          (x) => ({
            ...x,
            atendimento: x.atendimento.map((y) => (y.id === id ? { ...y, situacao: 'atendido' } : y)),
          }),
          `Notas atendeu sozinho o pedido de ${a.quem}: ${a.pedido} (NFE-037)`,
        ),
    })
  }
  const rascunho = (id: string) => {
    const n = e.emissoes.find((x) => x.id === id)!
    trabalhar({
      setor: 'notas',
      titulo: 'Preparar nota a pedido do cliente',
      cliente: nome,
      clienteId,
      etapas: ['Conferindo o tomador e o código de serviço', 'Calculando ISS e retenções', 'Montando o rascunho da NFS-e'],
      texto: `Rascunho da nota para ${n.tomador} pronto (${brl(n.valor)}, ISS 2%). Aprova para eu pedir o "pode emitir" ao cliente; a emissão continua com uma pessoa.`,
      aoTerminar: () =>
        mudarNotas(clienteId, (x) => ({
          ...x,
          emissoes: x.emissoes.map((y) => (y.id === id ? { ...y, situacao: 'rascunho' } : y)),
        })),
      cartao: {
        acao: {
          tipo: 'notas.emitir_rascunho',
          clienteId,
          emissaoId: id,
          tomador: n.tomador,
          valor: brl(n.valor),
        },
        resumo: `Enviar ao cliente o rascunho da nota para ${n.tomador}`,
        argumentos: [
          ['Valor', brl(n.valor)],
          ['Serviço', n.servico],
        ],
      },
    })
  }
  const emitir = async (id: string) => {
    const n = e.emissoes.find((x) => x.id === id)!
    const ok = await confirmar({
      titulo: `Emitir a NFS-e para ${n.tomador}?`,
      descricao: `${brl(n.valor)} · ${n.servico}. A emissão é irreversível (cancelar depois tem prazo e regra do município).`,
      acao: 'Emitir',
    })
    if (!ok) return
    setEmitindo(id)
    setErro(null)
    try {
      const r = await servicos.nfse.emitir({
        prestador_cnpj: banco.ler('cliente').find((c) => c.id === clienteId)?.documento ?? '',
        tomador: n.tomador,
        servico: n.servico,
        codigo: '17.01',
        valor: n.valor,
        aliquota_iss: 2,
      })
      mudarNotas(
        clienteId,
        (x) => ({
          ...x,
          emissoes: x.emissoes.map((y) => (y.id === id ? { ...y, situacao: 'emitida', numero: r.dados.numero } : y)),
        }),
        `${usuario.nome} emitiu a NFS-e ${r.dados.numero} para ${n.tomador} (${nome}, NFE-039)`,
      )
      loja.adicionarDocumento({
        nome: `NFS-e ${r.dados.numero} ${n.tomador}.pdf`,
        clienteId,
        pasta: ['Notas', 'Emitidas'],
        tipo: 'nfse',
        competencia: '11/2026',
        origem: 'gerado_plataforma',
        conector: 'drive',
        tamanho: '62 KB',
        quando: 'agora',
        por: usuario.nome,
      })
      loja.toast(`NFS-e ${r.dados.numero} emitida para ${n.tomador}. O PDF foi para Notas / Emitidas.`)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'O emissor não respondeu.')
    } finally {
      setEmitindo(null)
    }
  }
  const pendentes = e.atendimento.filter((a) => a.situacao === 'pendente')
  return (
    <div className="flex h-full flex-col gap-2">
      {erro && <EstadoErro descricao={erro} className="py-3" />}
      <AreaRolagem as="ul" className="divide-border/70 flex flex-1 flex-col divide-y">
        {e.emissoes.map((n) => (
          <Linha
            key={n.id}
            inicio={<ReceiptIcon className="text-muted-foreground size-4 shrink-0" />}
            titulo={`Emitir para ${n.tomador} · ${brl(n.valor)}`}
            detalhe={`${n.pedido_por} · ${{ pedido: 'pedido do cliente', rascunho: 'rascunho pronto', aguardando_cliente: 'aguardando o "pode emitir"', aprovada_cliente: 'cliente aprovou: emitir', emitida: `emitida · nº ${n.numero}` }[n.situacao]}`}
            fim={
              pode.documento && n.situacao === 'pedido' ? (
                <Button size="sm" variant="ghost" className={botaoAcao} onClick={() => rascunho(n.id)}>
                  Preparar
                </Button>
              ) : pode.documento && n.situacao === 'aprovada_cliente' ? (
                <Button size="sm" variant="outline" className={botaoAcao} disabled={emitindo === n.id} onClick={() => emitir(n.id)}>
                  {emitindo === n.id ? 'Emitindo…' : 'Emitir · só pessoa'}
                </Button>
              ) : n.situacao === 'emitida' ? (
                <IconeSituacao s="ok" />
              ) : undefined
            }
          />
        ))}
        {(t === 'G' ? pendentes : e.atendimento).map((a) => (
          <Linha
            key={a.id}
            inicio={<ChatsCircleIcon className="text-muted-foreground size-4 shrink-0" />}
            titulo={a.pedido}
            detalhe={`${a.quem} · ${a.canal} · ${a.quando} · ${a.situacao === 'atendido' ? 'atendido pelo integrante' : 'pendente'}`}
            fim={
              a.situacao === 'pendente' && pode.documento ? (
                <Button size="sm" variant="ghost" className={botaoAcao} onClick={() => atender(a.id)}>
                  Atender
                </Button>
              ) : undefined
            }
          />
        ))}
        {e.faltando.map((f) => (
          <Linha
            key={f.id}
            inicio={<IconeSituacao s="atencao" />}
            titulo={`Falta: ${f.item}`}
            detalhe={`${f.desde}${f.cobrado ? ' · cobrado' : ''} (NFE-038)`}
            fim={
              <Button
                size="sm"
                variant="ghost"
                className={botaoAcao}
                onClick={() => {
                  mudarNotas(clienteId, (x) => ({
                    ...x,
                    faltando: x.faltando.map((y) => (y.id === f.id ? { ...y, cobrado: true } : y)),
                  }))
                  fluxos.cobrar({
                    cliente: nome,
                    setor: 'notas',
                    texto: '',
                    assunto: f.item,
                  })
                }}
              >
                Cobrar
              </Button>
            }
          />
        ))}
        {!e.emissoes.length && !e.atendimento.length && !e.faltando.length && <li className="text-muted-foreground py-2 text-sm">Nenhum pedido do cliente nem nota faltando.</li>}
      </AreaRolagem>
      {pode.documento && (
        <div className="mt-auto flex flex-wrap gap-1.5">
          <Button size="sm" variant="outline" className={botaoAcao} onClick={() => setGaveta('nfse')}>
            <FileArrowUpIcon /> NFS-e de prefeitura
          </Button>
          <Button size="sm" variant="outline" className={botaoAcao} onClick={() => setGaveta('zip')}>
            <FileZipIcon /> Abrir .zip do cliente
          </Button>
        </div>
      )}
      {gaveta === 'nfse' && <GavetaRegistrarNfse clienteId={clienteId} onFechar={() => setGaveta(null)} />}
      {gaveta === 'zip' && <GavetaAbrirZip clienteId={clienteId} onFechar={() => setGaveta(null)} />}
    </div>
  )
}

/* ---------- Entrada e saída (NFE-101, 103 a 106) ---------- */

function EntradaSaida({ clienteId, t }: { clienteId: string; t: TamanhoWidget }) {
  const e = useNotas(clienteId)
  const pode = usePodeNotas(clienteId)
  const trabalhar = useAgenteS02()
  const nav = useNavegacao()
  const nome = nomeCliente(clienteId)
  const tCliente = useTabela('cliente')
  const estado = tCliente.find((c) => c.id === clienteId)?.estado_ciclo
  const emSaida = estado === 'em_saida' || estado === 'em_baixa'
  const retroativa = () => {
    mudarNotas(clienteId, (x) => ({
      ...x,
      entrada: { ...x.entrada, retroativa: 'rodando' },
    }))
    trabalhar({
      setor: 'notas',
      titulo: 'Captura retroativa de 90 dias',
      cliente: nome,
      clienteId,
      etapas: ['Lendo a distribuição de DF-e desde agosto', 'Baixando os XMLs dos últimos 90 dias', 'Separando por competência e conferindo canceladas'],
      seg: 1.4,
      texto: `Captura retroativa de ${nome} concluída: 1.240 XMLs dos últimos 90 dias, separados por competência.`,
      aviso: `Retroativa de ${nome}: 1.240 XMLs`,
      aoTerminar: () =>
        mudarNotas(
          clienteId,
          (x) => ({
            ...x,
            entrada: {
              ...x.entrada,
              retroativa: 'feita',
              xmls: 1_240,
              quando: agoraCurto(),
            },
          }),
          `Notas fez a captura retroativa de 90 dias de ${nome}: 1.240 XMLs (NFE-101, faz sozinho)`,
        ),
    })
  }
  const encerrar = () => {
    mudarNotas(clienteId, (x) => ({
      ...x,
      entrada: { ...x.entrada, encerramento: 'aguardando_aprovacao' },
    }))
    trabalhar({
      setor: 'notas',
      titulo: 'Preparar o encerramento da captura',
      cliente: nome,
      clienteId,
      etapas: ['Conferindo a última competência atendida', 'Montando o pacote final de guarda'],
      texto: 'Preparei o encerramento da captura e o pacote final. Aprova para eu encerrar.',
      cartao: {
        acao: { tipo: 'notas.encerrar_captura', clienteId },
        resumo: 'Encerrar a captura de notas (saída do cliente)',
        argumentos: [['Atividade', 'NFE-106']],
      },
    })
  }
  return (
    <ul className="divide-border/70 flex flex-col divide-y">
      <Linha
        inicio={<IconeSituacao s={e.entrada.retroativa === 'feita' ? 'ok' : 'atencao'} />}
        titulo="Captura retroativa (90 dias)"
        detalhe={e.entrada.retroativa === 'feita' ? `${fmt(e.entrada.xmls ?? 0)} XMLs · ${e.entrada.quando}` : e.entrada.retroativa === 'rodando' ? 'o integrante está capturando…' : 'roda ao receber o certificado A1 (NFE-101)'}
        fim={
          e.entrada.retroativa === 'pendente' && pode.capturar ? (
            <Button size="sm" variant="ghost" className={botaoAcao} onClick={retroativa}>
              Rodar agora
            </Button>
          ) : undefined
        }
      />
      {t !== 'M' && (
        <Linha
          inicio={<IconeSituacao s={e.entrada.encerramento === 'encerrada' ? 'ok' : 'neutro'} />}
          titulo="Encerramento na saída"
          detalhe={
            emSaida
              ? e.entrada.encerramento === 'encerrada'
                ? 'captura encerrada, pacote final na pasta'
                : e.entrada.encerramento === 'aguardando_aprovacao'
                  ? 'aguardando aprovação'
                  : 'cliente em saída: preparar o encerramento (NFE-106)'
              : 'só quando o cliente entra em saída'
          }
          fim={
            emSaida && e.entrada.encerramento === 'nao_se_aplica' && pode.capturar ? (
              <Button size="sm" variant="ghost" className={botaoAcao} onClick={encerrar}>
                Preparar
              </Button>
            ) : undefined
          }
        />
      )}
      {t !== 'M' && (
        <li className="pt-2">
          <Button
            size="sm"
            variant="ghost"
            className={botaoAcao}
            onClick={() =>
              nav.irPara({
                modulo: 'painel',
                aba: 'societario',
                cliente: clienteId,
              })
            }
          >
            <ArrowsInLineHorizontalIcon /> Ver a trilha do cliente
          </Button>
        </li>
      )}
    </ul>
  )
}

/* ---------- Carteira ---------- */

function CapturaCarteira() {
  const todos = useNotasTodos()
  const clientes = useTabela('cliente')
  const pode = usePodeNotas()
  const cap = useForcarCaptura()
  const [sel, setSel] = useState<string[]>([])
  const linhas = clientes
    .filter((c) => c.servicos_contratados.includes('contabil') && c.tipo !== 'pf' && !c.arquivado_em)
    .map((c) => ({
      c,
      e: todos.find((x) => x.id === c.id) ?? estadoNotas(c.id),
    }))
    .filter((x) => !x.e.pf)
  if (!linhas.length) return <EstadoVazio compacto titulo="Carteira sem clientes com captura" descricao="Os clientes do Contábil aparecem aqui quando a captura é configurada." />
  const marcar = (id: string) => setSel((xs) => (xs.includes(id) ? xs.filter((x) => x !== id) : [...xs, id]))
  const sit = (e: EstadoNotas) => (e.captura.situacao === 'parada' ? 'erro' : e.captura.situacao === 'ok' ? 'ok' : 'atencao')
  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {pode.capturar && (
          <Button size="sm" variant="outline" className={botaoAcao} disabled={!sel.length || cap.rodando.length > 0} onClick={() => cap.forcar(sel, 'lote').then(() => setSel([]))}>
            <CloudArrowDownIcon /> {cap.rodando.length ? 'Capturando…' : `Forçar captura em lote${sel.length ? ` · ${sel.length} clientes` : ''}`}
          </Button>
        )}
        {pode.capturar && (
          <Button size="sm" variant="ghost" className={botaoAcao} onClick={() => setSel(sel.length === linhas.length ? [] : linhas.map((x) => x.c.id))}>
            {sel.length === linhas.length ? 'Desmarcar todos' : 'Marcar todos'}
          </Button>
        )}
        {cap.fonte && <SeloDemonstracao fonte={cap.fonte} />}
      </div>
      {cap.erro && <p className="text-destructive-text text-xs">{cap.erro.texto}</p>}
      <Tabela colunas={[{ rotulo: '' }, { rotulo: 'Cliente' }, { rotulo: 'Última captura' }, { rotulo: 'XMLs do mês', direita: true }, { rotulo: 'Divergências', direita: true }, { rotulo: 'Paridade', direita: true }]} minimo={620}>
        {linhas.map(({ c, e }) => (
          <tr key={c.id}>
            <td className="w-12 py-2">
              <span className="flex items-center gap-1.5">
                {pode.capturar && <input type="checkbox" aria-label={`Selecionar ${c.nome}`} checked={sel.includes(c.id)} onChange={() => marcar(c.id)} />}
                <IconeSituacao s={sit(e)} />
              </span>
            </td>
            <td className="py-2 pr-2">{c.nome}</td>
            <td className={cn('py-2 pr-2', e.captura.situacao === 'ok' ? 'text-muted-foreground' : e.captura.situacao === 'parada' ? 'text-destructive-text font-medium' : 'font-medium')}>
              {e.captura.situacao === 'parada'
                ? `parada há ${e.captura.dias} dias · ${e.captura.motivo?.split(':')[0]}`
                : e.captura.situacao === 'sem_configuracao'
                  ? 'sem configuração'
                  : `${e.captura.ultima}${e.captura.motivo ? ` · ${e.captura.motivo}` : ''}`}
            </td>
            <td className="py-2 pr-2 text-right tabular-nums">{fmt(totalXmls(e))}</td>
            <td className={cn('py-2 pr-2 text-right tabular-nums', divergenciasAbertas(e) > 0 && 'text-warning-text font-medium')}>{divergenciasAbertas(e) || '·'}</td>
            <td className={cn('py-2 pr-2 text-right tabular-nums', e.migracao_aberta && difParidade(e) !== 0 && 'text-warning-text font-medium')}>
              {e.migracao_aberta ? (difParidade(e) === 0 ? 'ok' : `${difParidade(e) > 0 ? '+' : ''}${difParidade(e)}`) : 'fechada'}
            </td>
          </tr>
        ))}
      </Tabela>
    </div>
  )
}

function ManifestacaoCarteira() {
  const todos = useNotasTodos()
  const semCiencia = todos.reduce((s, e) => s + e.resumos.filter((r) => r.situacao === 'sem_ciencia').length, 0)
  const semConclusao = todos.reduce((s, e) => s + e.resumos.filter((r) => r.situacao === 'ciencia').length, 0)
  return (
    <div className="flex h-full flex-col justify-end gap-1">
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col">
          <span className="font-heading text-2xl font-light tabular-nums">{semCiencia}</span>
          <span className="text-muted-foreground text-xs">resumos sem ciência</span>
        </div>
        <div className="flex flex-col">
          <span className={cn('font-heading text-2xl font-light tabular-nums', semConclusao && 'text-warning-text')}>{semConclusao}</span>
          <span className="text-muted-foreground text-xs">sem conclusão na carteira</span>
        </div>
      </div>
      <p className="text-muted-foreground text-xs">A ciência o integrante dá sozinho na rotina; a conclusão é por cliente.</p>
    </div>
  )
}

function EventosCarteira() {
  const todos = useNotasTodos()
  const nav = useNavegacao()
  const abertos = todos.flatMap((e) => e.eventos.filter((x) => x.situacao === 'aberto').map((x) => ({ ...x, clienteId: e.id })))
  if (!abertos.length) return <p className="text-muted-foreground py-2 text-sm">Nenhum evento depois da importação na carteira.</p>
  return (
    <ul className="divide-border/70 flex flex-col divide-y">
      {abertos.map((x) => (
        <li key={`${x.clienteId}${x.id}`}>
          <button
            type="button"
            className="hover:bg-sunken flex w-full cursor-pointer items-center gap-2 rounded-lg py-1.5 text-left"
            onClick={() =>
              nav.irPara({
                modulo: 'painel',
                aba: 'notas',
                cliente: x.clienteId,
              })
            }
          >
            <IconeSituacao s="atencao" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm">{x.nota}</span>
              <span className="text-muted-foreground block truncate text-xs">
                {nomeCliente(x.clienteId)} · {x.detalhe}
              </span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}

/* ---------- Catálogo ---------- */

export function widgetsNotasCliente(clienteId: string): DefWidget[] {
  return [
    {
      id: 'fluxos',
      titulo: 'Captura do mês',
      atividades: 'NFE-004 a 013',
      descricao: 'Entradas, serviços e saídas por fonte, com a paridade da ferramenta antiga',
      icone: CloudArrowDownIcon,
      tamanhos: ['M', 'L', 'XL'],
      conteudo: (t) => <CapturaDoMes clienteId={clienteId} t={t} />,
    },
    {
      id: 'configuracao',
      titulo: 'Configuração de captura',
      atividades: 'NFE-001, 002, 003',
      descricao: 'CNPJs, inscrições, certificado, autXML, caminho de cada documento e a situação diária',
      icone: GearSixIcon,
      tamanhos: ['M', 'G'],
      conteudo: (t) => <ConfiguracaoCaptura clienteId={clienteId} t={t} />,
    },
    {
      id: 'manifestacao',
      titulo: 'Manifestação',
      atividades: 'NFE-014, 015, 016',
      descricao: 'Resumos sem ciência e notas sem evento conclusivo',
      icone: HandPointingIcon,
      tamanhos: ['P', 'M', 'G'],
      conteudo: (t) => <Manifestacao clienteId={clienteId} t={t} />,
    },
    {
      id: 'completude',
      titulo: 'Completude e conferência',
      atividades: 'NFE-020, 021, 022, 029, 035',
      descricao: 'Buracos de sequência, compras sem XML, receita × declarada, totais core × plataforma',
      icone: MagnifyingGlassIcon,
      tamanhos: ['M', 'G'],
      conteudo: (t) => <Completude clienteId={clienteId} t={t} />,
    },
    {
      id: 'tributaria',
      titulo: 'Conferência tributária',
      atividades: 'NFE-023 a 027, 302, 031',
      descricao: 'NCM, CST, CFOP, ST, DIFAL e ISS nas notas do mês, com a sugestão do integrante',
      icone: PercentIcon,
      tamanhos: ['P', 'G', 'XL'],
      conteudo: (t) => <ConferenciaTributaria clienteId={clienteId} t={t} />,
    },
    {
      id: 'eventos',
      titulo: 'Eventos posteriores e risco',
      atividades: 'NFE-018, 010, 028, 019, 017',
      descricao: 'Canceladas após importar, MDF-e abertos, CT-e a contestar, situação do fornecedor',
      icone: SirenIcon,
      tamanhos: ['P', 'M', 'G'],
      conteudo: (t) => <EventosPosteriores clienteId={clienteId} t={t} />,
    },
    {
      id: 'lotes',
      titulo: 'Envio ao core e guarda',
      atividades: 'NFE-033, 034, 036',
      descricao: 'Lotes por competência, erros e pacote de guarda com manifesto e hash',
      icone: PackageIcon,
      tamanhos: ['M', 'G'],
      conteudo: (t) => <EnvioCore clienteId={clienteId} t={t} />,
    },
    {
      id: 'atendimento',
      titulo: 'Atendimento e emissão',
      atividades: 'NFE-037, 038, 039, 201',
      descricao: 'Pedidos de DANFE e XML, notas que faltam, emissão a pedido do cliente, NFS-e sem ADN e .zip',
      icone: ChatsCircleIcon,
      tamanhos: ['G', 'XL'],
      conteudo: (t) => <AtendimentoEmissao clienteId={clienteId} t={t} />,
    },
    {
      id: 'entrada-saida',
      titulo: 'Entrada e saída',
      atividades: 'NFE-101, 103 a 106',
      descricao: 'Captura retroativa de 90 dias ao receber o A1 e encerramento na saída',
      icone: ArrowsInLineHorizontalIcon,
      tamanhos: ['M', 'G'],
      conteudo: (t) => <EntradaSaida clienteId={clienteId} t={t} />,
    },
  ]
}

export const widgetsNotasCarteira: DefWidget[] = [
  {
    id: 'carteira-captura',
    titulo: 'Captura da carteira',
    atividades: 'NFE-004, 022',
    descricao: 'Cliente × última captura × XMLs do mês × divergências × paridade, com forçar em lote',
    icone: CloudArrowDownIcon,
    tamanhos: ['XL'],
    conteudo: () => <CapturaCarteira />,
  },
  {
    id: 'manifestacao',
    titulo: 'Manifestação',
    atividades: 'NFE-014 a 016',
    descricao: 'Resumos sem ciência e sem conclusão na carteira',
    icone: HandPointingIcon,
    tamanhos: ['M', 'G'],
    conteudo: () => <ManifestacaoCarteira />,
  },
  {
    id: 'carteira-eventos',
    titulo: 'Eventos posteriores',
    atividades: 'NFE-018, 028',
    descricao: 'Canceladas após importar, MDF-e e CT-e a tratar, por cliente',
    icone: SirenIcon,
    tamanhos: ['M', 'G'],
    conteudo: () => <EventosCarteira />,
  },
]

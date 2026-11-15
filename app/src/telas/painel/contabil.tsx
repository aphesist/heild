import {
  ArrowsLeftRightIcon,
  BookOpenIcon,
  ChartPieIcon,
  ChatCircleDotsIcon,
  CheckIcon,
  CoinsIcon,
  FileArrowUpIcon,
  FileTextIcon,
  FlagCheckeredIcon,
  KanbanIcon,
  ListNumbersIcon,
  LockSimpleIcon,
  PencilSimpleLineIcon,
  PenNibIcon,
  ShieldWarningIcon,
  SparkleIcon,
  TagIcon,
  TrayArrowDownIcon,
  TrayIcon,
  UserListIcon,
  WarningIcon,
} from '@phosphor-icons/react'
import { useState, type ReactNode } from 'react'
import { useFluxos } from '@/ambiente/fluxos'
import { useLoja, usePersistente } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import { Confianca } from '@/components/compostos/painel-aba'
import { Carregando, EstadoErro, Quadro, SeloDemonstracao, useConfirmar, usePode, type ColunaQuadro } from '@/components/kit'
import { Button } from '@/components/ui/button'
import { Campo, CampoArea, CampoEscolha, CampoTexto, Fichas, GavetaFormulario, Interruptor, Segmentado } from '@/components/ui/formulario'
import type { DefWidget, TamanhoWidget } from '@/components/widgets/tipos'
import { brl, brl0, COMPETENCIA, contabilS03, etapasFechamento, fiscalS03, pct, perfilS03, type ContabilS03, type EtapaFechamento, type SaidaSocio } from '@/dados/painel-s03'
import type { Cliente } from '@/dados/tipos'
import { cn } from '@/lib/utils'
import { servicos } from '@/servicos'
import { widgetObrigacoesDoSetor } from './obrigacoes-setor'
import { Aprendizado, CartaoPendente, usePostarS03 } from './s03/cartoes'
import { CHAVE_KANBAN, chaveContabil, contabilVazio, hojeCurto, lerEstado, useDadosS03, useEstadoContabil, type EstadoContabil, type EstadoRelatorio, type RegraFavorecido } from './s03/estado'
import { Barra, BotaoNivel, Rotulo, SaudeConectores, SeloFase, Vazio } from './s03/pecas'
import { PedirAoIntegrante, type SugestaoPedido } from './s03/pedir'
import { Linha, Tabela } from './Tabela'
import type { CtxAba, WidgetsAba } from './tipos'

/**
 * Contábil (03, 6.6; mapa S03-T02): fechar a competência. Com cliente: as cinco
 * etapas, o que deve chegar (com as contas esperadas por banco, D-03), triagem
 * e leitor de extratos (D-02, D-04, D-11), classificação que ensina o
 * integrante, conciliação, distribuição de lucros (D-12 a D-15), lote ao core,
 * relatórios com travas (D-26), fila de assinatura do contador (D-16) e
 * declaração de faturamento (C2-14). Na carteira: Kanban do fechamento e
 * Minha fila (D-22) com os filtros por fase (D-21).
 */
export function widgetsContabil(ctx: CtxAba): WidgetsAba {
  const { cliente } = ctx
  if (!cliente)
    return {
      catalogo: [
        widgetObrigacoesDoSetor('contabil', ctx),
        // Área de trabalho: largura inteira e três células de altura (PADRAO_DE_INTERFACE.md, 3).
        // Quatro colunas de no mínimo 15rem, os vãos e o respiro do card pedem ~64rem: a largura inteira até 1152px; no ultrawide, o lado sobra para outro widget.
        { ...w('kanban', 'Kanban do fechamento', 'CTB-026; D-21, D-22', 'Pendente, em andamento, conferência e concluído; arrastar e filtrar por fase', KanbanIcon, ['XL'], () => <KanbanCarteira />), larguraMinima: 64, linhasMaximas: 4 },
        w('minha-fila', 'Minha fila', 'D-22', 'Meus clientes, do mais atrasado ao menos', ListNumbersIcon, ['M', 'G'], (t) => <MinhaFila tamanho={t} />),
        w('carteira-fechamento', `Etapas por analista · ${COMPETENCIA}`, 'CTB-026', 'Clientes por etapa do fechamento e analista', FlagCheckeredIcon, ['G', 'XL'], () => <EtapasCarteira />),
        w('fila-assinatura', 'Fila de assinatura do contador', 'D-16', 'Tudo o que espera a assinatura do contador, de todos os clientes', PenNibIcon, ['M', 'G'], () => <FilaCarteira />),
        w('pedir', 'Pedir ao Contábil', 'S03-A18', 'O integrante faz e devolve no chat', SparkleIcon, ['M', 'G'], () => <PedirAoIntegrante setor="contabil" sugestoes={sugestoesContabil} />),
      ],
    }
  const p = perfilS03(cliente)
  const ws: DefWidget[] = [widgetObrigacoesDoSetor('contabil', ctx)]
  const c = (...a: Parameters<typeof w>) => ws.push(w(...a))
  c('fechamento', `Fechamento · ${COMPETENCIA}`, 'CTB-017, 024 a 027', 'As cinco etapas, com o que trava cada uma', FlagCheckeredIcon, ['M', 'L', 'XL'], (t) => <FechamentoBloco cliente={cliente} tamanho={t} />)
  c('deve-chegar', 'O que deve chegar', 'CTB-001, 002, 003, 201; D-03', 'Lista do mês e contas esperadas por banco; chegou × falta', TrayArrowDownIcon, ['P', 'G'], (t) => <DeveChegarBloco cliente={cliente} tamanho={t} />)
  c('triagem', 'Triagem e extratos', 'CTB-004, 007 a 014; D-02, D-04, D-11', 'Documentos com cliente e competência inferidos; leitor de extratos', TrayIcon, ['G', 'XL'], (t) => <TriagemBloco cliente={cliente} tamanho={t} />)
  c('classificacao', 'Classificação e de-para', 'CTB-006, 015, 016', 'Linhas com confiança; corrigir ensina o integrante', TagIcon, ['M', 'XL'], (t) => <ClassificacaoBloco cliente={cliente} tamanho={t} />)
  if (p.tipo !== 'pf') c('conciliacao', 'Conciliação', 'CTB-013, 018 a 022', 'Terceiros, impostos × fiscal × extrato, folha, sócio, adquirentes', ArrowsLeftRightIcon, ['P', 'G', 'XL'], (t) => <ConciliacaoBloco cliente={cliente} tamanho={t} />)
  if (p.tipo !== 'pf' && p.tipo !== 'mei') c('lucros', 'Distribuição de lucros', 'D-11 a D-15', 'Por sócio e mês; dúvidas, regras por favorecido, alerta de R$ 50 mil, trava do REINF', CoinsIcon, ['G', 'XL'], (t) => <LucrosBloco cliente={cliente} tamanho={t} />)
  c('core', 'Fechamento e lote ao core', 'CTB-017, 025, 047, 052', 'Lote ao core, reabrir competência, imobilizado', FlagCheckeredIcon, ['M', 'G'], (t) => <CoreBloco cliente={cliente} tamanho={t} />)
  c('relatorios-cliente', 'Relatórios ao cliente e anuais', 'CTB-028 a 051', 'Gerar com as travas, assinar, enviar; ECD e ECF', FileTextIcon, ['G', 'XL'], () => <RelatoriosBloco cliente={cliente} />)
  c('travas', 'Travas antes de enviar', 'D-26', 'Faturamento zerado, lucro maior que o faturamento, outras receitas altas, balancete', ShieldWarningIcon, ['M', 'G'], (t) => <TravasBloco cliente={cliente} tamanho={t} />)
  c('fila-assinatura', 'Fila de assinatura do contador', 'D-16', 'Só sai assinado: fila, conferência da assinatura no PDF, liberar envio', PenNibIcon, ['G', 'XL'], () => <FilaAssinaturaBloco cliente={cliente} />)
  if (p.tipo !== 'pf') c('declaracao', 'Declaração de faturamento', 'C2-14', 'Pedido do app vira tarefa; assinatura do contador; envio', UserListIcon, ['M', 'G'], () => <DeclaracaoBloco cliente={cliente} />)
  if (p.tipo === 'pf') c('livro-caixa', 'Livro-caixa', '03, 3.5', 'Receitas e despesas do carnê-leão', BookOpenIcon, ['M', 'G'], () => <LivroCaixaBloco cliente={cliente} />)
  c('fase4', 'Indicadores e fase 4', 'CTB-023, 029, 030, 033 a 036, 038, 045, 048', 'Orçamento, indicadores, consolidação e auditoria', ChartPieIcon, ['M', 'G'], () => <Fase4Bloco cliente={cliente} />)
  c('pedir', 'Pedir ao Contábil', 'S03-A18', 'O integrante faz e devolve no chat', SparkleIcon, ['M', 'G'], () => <PedirAoIntegrante setor="contabil" cliente={cliente.nome} sugestoes={sugestoesContabil} />)
  return { catalogo: ws }
}

function w(id: string, titulo: string, atividades: string, descricao: string, icone: DefWidget['icone'], tamanhos: TamanhoWidget[], conteudo: (t: TamanhoWidget) => ReactNode): DefWidget {
  return { id, titulo, atividades, descricao, icone, tamanhos, conteudo }
}

const sugestoesContabil: SugestaoPedido[] = [
  { rotulo: 'Classificar o que entrou hoje', etapas: ['Lendo os extratos novos', 'Aplicando as regras aprendidas', 'Separando o que tem confiança baixa'], fim: 'Classifiquei o que entrou hoje. O que ficou abaixo de 0,7 está marcado para você conferir.' },
  { rotulo: 'Cobrar os extratos que faltam', etapas: ['Conferindo as contas esperadas por banco', 'Montando a mensagem da régua', 'Separando por contato'], fim: 'Separei a cobrança dos extratos que faltam; está como cartão para você aprovar.' },
  { rotulo: 'Conferir a conciliação de fornecedores', etapas: ['Somando títulos pagos', 'Comparando com o razão', 'Explicando as diferenças'], fim: 'Fornecedores conciliados; uma diferença ficou como tarefa.' },
  { rotulo: 'Revisar as saídas para sócios', etapas: ['Lendo PIX e TED aos sócios', 'Aplicando as regras por favorecido', 'Montando as perguntas'], fim: 'Revisei as saídas para sócios. As dúvidas estão na distribuição de lucros, em cinco perguntas.' },
]

/* ---------- utilidades ---------- */

function useContabil(cliente: Cliente) {
  const dados = useDadosS03(cliente)
  const [estado, atualizar] = useEstadoContabil(cliente.id)
  return { ...dados, d: dados.contabil, estado, atualizar }
}

const ordemEtapa = (e: EtapaFechamento) => etapasFechamento.findIndex((x) => x.id === e)

/** O que trava cada etapa (com o estado atual). */
function bloqueios(d: ContabilS03, e: EstadoContabil) {
  const faltaDoc = d.deveChegar.filter((x) => !x.chegou && !e.chegou[x.id])
  const faltaConta = d.contas.filter((x) => !x.chegou && !e.chegou[x.id])
  const buracos = d.contas.filter((x) => x.buracos.length && !e.chegou[`${x.id}:buraco`])
  const baixas = d.linhas.filter((l) => l.confianca < 0.7 && !e.linhas[l.id])
  const difs = d.conciliacoes.filter((c) => c.diferenca > 0 && !e.diferencas[c.id])
  return {
    coleta: [...faltaDoc.map((x) => x.item), ...faltaConta.map((x) => `extrato ${x.banco}`)],
    extratos: [...faltaConta.map((x) => `extrato ${x.banco} não chegou`), ...buracos.map((x) => `${x.banco}: buraco ${x.buracos[0]}`)],
    classificacao: baixas.map((l) => `${l.descricao} (${l.confianca.toFixed(2).replace('.', ',')})`),
    conciliacao: difs.map((c) => `${c.conta}: ${brl(c.diferenca)}`),
    core: e.core ? [] : ['lote ainda não enviado ao core'],
  } as Record<EtapaFechamento, string[]>
}

/** Travas do relatório (D-26): o que impede de virar cartão de envio. */
function travasDe(d: ContabilS03) {
  const r = d.dre
  return [
    { id: 'faturamento', rotulo: 'Faturamento zerado', aberta: r.faturamento === 0, detalhe: 'nenhuma receita no período' },
    { id: 'lucro', rotulo: 'Lucro maior que o faturamento', aberta: r.lucro > r.faturamento, detalhe: `lucro ${brl0(r.lucro)} × faturamento ${brl0(r.faturamento)}` },
    { id: 'outras', rotulo: '“Outras receitas” altas', aberta: r.faturamento > 0 && r.outrasReceitas / r.faturamento > 0.2, detalhe: `${brl0(r.outrasReceitas)} (${r.faturamento ? pct(r.outrasReceitas / r.faturamento, 0) : '—'} do faturamento)` },
    { id: 'balancete', rotulo: 'Balancete que não fecha', aberta: r.balanceteDiferenca !== 0, detalhe: r.balanceteDiferenca ? `diferença de ${brl(r.balanceteDiferenca)} entre débito e crédito` : 'débito = crédito' },
  ]
}

function Erro({ texto, onTentar }: { texto: string; onTentar: () => void }) {
  return <EstadoErro className="py-3" titulo="O serviço não respondeu" descricao={texto} onTentar={onTentar} />
}

/* ---------- Fechamento em cinco etapas ---------- */

function FechamentoBloco({ cliente, tamanho }: { cliente: Cliente; tamanho: TamanhoWidget }) {
  const { d, estado, atualizar } = useContabil(cliente)
  const loja = useLoja()
  const { usuario } = useSessao()
  const [ver, setVer] = useState<EtapaFechamento | null>(null)
  const etapa = estado.etapa ?? d.etapaInicial
  const idx = ordemEtapa(etapa)
  const b = bloqueios(d, estado)
  const situacao = (i: number) => (i === 4 && estado.core ? 'feito' : i < idx ? (b[etapasFechamento[i].id].length ? 'andamento' : 'feito') : i === idx ? 'andamento' : 'pendente')
  const avancar = () => {
    if (idx >= 4) return
    const prox = etapasFechamento[idx + 1].id
    atualizar((x) => ({ ...x, etapa: prox }))
    loja.registrar(usuario.nome, `Fechamento ${COMPETENCIA} de ${cliente.nome}: passou para ${etapasFechamento[idx + 1].rotulo} (CTB-026)`)
  }
  if (tamanho === 'M')
    return (
      <div className="flex h-full flex-col justify-end gap-2">
        <div className="flex gap-1">
          {etapasFechamento.map((e, i) => (
            <span key={e.id} className={cn('h-1.5 flex-1 rounded-full', situacao(i) === 'feito' ? 'bg-success' : situacao(i) === 'andamento' ? 'bg-foreground/70' : 'bg-sunken')} />
          ))}
        </div>
        <span className="text-sm">
          {idx} de 5 · agora: <strong className="font-medium">{etapasFechamento[idx].rotulo}</strong>
          {b[etapa].length ? <span className="text-muted-foreground"> · {b[etapa].length} travando</span> : ''}
        </span>
      </div>
    )
  return (
    <div className="flex h-full flex-col gap-2">
      {estado.reaberta && <p className="bg-warning/10 rounded-[10px] px-2 py-1 text-xs">Reaberta por {estado.reaberta.por} ({estado.reaberta.quando}): {estado.reaberta.motivo}</p>}
      <ol className="grid flex-1 grid-cols-2 gap-2 @lg:grid-cols-5">
        {etapasFechamento.map((e, i) => {
          const s = situacao(i)
          const trava = b[e.id]
          return (
            <li key={e.id}>
              <button type="button" onClick={() => setVer(ver === e.id ? null : e.id)} className={cn('flex h-full w-full min-w-0 cursor-pointer flex-col gap-0.5 rounded-[14px] px-2.5 py-1.5 text-left', s === 'feito' ? 'bg-success/10' : s === 'andamento' ? 'bg-raised shadow-contorno' : 'bg-sunken/60')} aria-expanded={ver === e.id}>
                <span className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
                  {s === 'feito' ? <CheckIcon weight="bold" className="text-success size-3" /> : <span className="tabular-nums">{i + 1}</span>}
                  {s === 'feito' ? 'feito' : s === 'andamento' ? 'em andamento' : 'a fazer'}
                </span>
                <span className="truncate text-sm font-medium">{e.rotulo}</span>
                <span className="text-muted-foreground line-clamp-2 text-xs leading-tight">{s === 'feito' ? (e.id === 'core' && estado.core ? `lote ${estado.core.lote}` : 'sem pendência') : trava.length ? `${trava.length} travando` : 'nada travando'}</span>
              </button>
            </li>
          )
        })}
      </ol>
      {ver && (
        <div className="bg-sunken/60 rounded-[12px] px-3 py-2 text-xs">
          <strong className="font-medium">{etapasFechamento[ordemEtapa(ver)].rotulo}: </strong>
          {b[ver].length ? b[ver].join(' · ') : 'nada travando.'}
        </div>
      )}
      {tamanho === 'XL' && idx < 4 && (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" disabled={b[etapa].length > 0} onClick={avancar}>
            Passar para {etapasFechamento[idx + 1].rotulo}
          </Button>
          {b[etapa].length > 0 && <span className="text-muted-foreground text-xs">resolva o que trava a etapa atual</span>}
        </div>
      )}
    </div>
  )
}

/* ---------- O que deve chegar (S03-A21, A22, A23) ---------- */

function DeveChegarBloco({ cliente, tamanho }: { cliente: Cliente; tamanho: TamanhoWidget }) {
  const { d, estado, atualizar, perfil } = useContabil(cliente)
  const loja = useLoja()
  const { usuario } = useSessao()
  const postar = usePostarS03()
  const [definir, setDefinir] = useState(false)
  const docs = d.deveChegar.filter((x) => !estado.lista || estado.lista.documentos.includes(x.id))
  const contas = d.contas.filter((x) => !estado.lista || estado.lista.contas.includes(x.id))
  const faltam = [...docs.filter((x) => !x.chegou && !estado.chegou[x.id]).map((x) => ({ id: x.id, nome: x.item })), ...contas.filter((x) => !x.chegou && !estado.chegou[x.id]).map((x) => ({ id: x.id, nome: `Extrato ${x.banco}` }))]
  const [selDocs, setSelDocs] = useState<string[]>(estado.lista?.documentos ?? d.deveChegar.map((x) => x.id))
  const [selContas, setSelContas] = useState<string[]>(estado.lista?.contas ?? d.contas.map((x) => x.id))
  const pend = estado.pendentes['cobrar']
  const marcar = (id: string, nome: string) => {
    atualizar((x) => ({ ...x, chegou: { ...x.chegou, [id]: hojeCurto() } }))
    loja.registrar(usuario.nome, `Marcou como chegou: ${nome} · ${cliente.nome}`)
    loja.toastDesfazer(`${nome}: chegou. A pendência baixou.`, () => atualizar((x) => { const { [id]: _f, ...r } = x.chegou; return { ...x, chegou: r } }))
  }
  const abrir = () => {
    atualizar((x) => ({ ...x, competenciaAberta: hojeCurto() }))
    loja.iniciarTrabalho({ id: `s03-abrir-${Date.now()}`, integrante: 'i-contabil', setor: 'contabil', titulo: `Abrir a competência ${COMPETENCIA}`, cliente: cliente.nome, inicio: `Abrindo ${COMPETENCIA} de ${cliente.nome}: gero a lista do mês e ligo a régua.`, etapas: ['Gerando a lista do que deve chegar', `Conferindo ${perfil.bancos.length} conta(s) esperada(s) por banco`, 'Ligando a régua “Documentos da competência”'], seg: 1.1, fim: { texto: `Competência ${COMPETENCIA} aberta. ${faltam.length ? `Faltam ${faltam.length}: ${faltam.map((f) => f.nome).join(', ')}. A régua cobra às 9h.` : 'Já chegou tudo.'}`, aviso: `Competência aberta: ${cliente.nome}` } })
  }
  const cobrar = () =>
    postar({
      setor: 'contabil',
      acao: 'contabil.cobrar',
      cliente: { id: cliente.id, nome: cliente.nome },
      chave: 'cobrar',
      texto: `Faltam ${faltam.length} itens de ${COMPETENCIA} de ${cliente.nome}. Mando a régua “Documentos da competência” com a lista?`,
      resumo: `Cobrar documentos de ${COMPETENCIA} · ${cliente.nome}`,
      argumentos: faltam.map((f) => ({ rotulo: f.nome, valor: `${estado.cobrancas[f.id] ?? 0} cobrança(s)` })),
      dados: { itens: faltam.map((f) => f.id), texto: `Oi! Para fechar ${COMPETENCIA}, ainda falta: ${faltam.map((f) => f.nome).join('; ')}. Pode mandar por aqui ou pelo app.` },
    })
  if (tamanho === 'P')
    return (
      <div className="flex h-full flex-col justify-end">
        <span className={cn('font-heading text-4xl font-light tabular-nums', faltam.length && 'text-warning')}>{faltam.length}</span>
        <span className="text-muted-foreground text-xs">faltando</span>
      </div>
    )
  return (
    <div className="flex flex-col gap-2">
      <SaudeConectores ids={['open_finance']} />
      <ul className="flex flex-col gap-1.5">
        {docs.map((x) => {
          const chegou = x.chegou || !!estado.chegou[x.id]
          return <ItemChegada key={x.id} chegou={chegou} nome={x.item} detalhe={chegou ? (estado.chegou[x.id] ? `marcado ${estado.chegou[x.id]}` : x.quando) : `${x.quando}${estado.cobrancas[x.id] ? ` · +${estado.cobrancas[x.id]} pela régua` : ''}`} onMarcar={() => marcar(x.id, x.item)} />
        })}
        <li className="text-muted-foreground pt-1 text-[11px]">Contas esperadas por banco (D-03)</li>
        {contas.map((x) => {
          const chegou = x.chegou || !!estado.chegou[x.id]
          return <ItemChegada key={x.id} chegou={chegou} nome={`${x.banco} · conta ${x.conta}`} detalhe={chegou ? `${x.origem}${x.buracos.length ? ` · buraco ${x.buracos[0]}` : ' · sem buracos'}` : `${x.banco} não mandou extrato · ${x.quando}`} onMarcar={() => marcar(x.id, `Extrato ${x.banco}`)} />
        })}
      </ul>
      {pend && <CartaoPendente id={pend} />}
      <div className="flex flex-wrap gap-2">
        <BotaoNivel compacto nivel="executar" ferramenta="contabil.lista.definir" setor="contabil" variante="ghost" onClick={() => setDefinir(true)}>
          Definir lista
        </BotaoNivel>
        {!estado.competenciaAberta ? (
          <BotaoNivel compacto nivel="executar" ferramenta="contabil.competencia.abrir" setor="contabil" variante="ghost" onClick={abrir}>
            Abrir competência
          </BotaoNivel>
        ) : (
          <Rotulo tom="ok">aberta {estado.competenciaAberta}</Rotulo>
        )}
        {faltam.length > 0 && !pend && (
          <BotaoNivel compacto nivel="executar com aprovação" onClick={cobrar}>
            Cobrar {faltam.length}
          </BotaoNivel>
        )}
      </div>
      {definir && (
        <GavetaFormulario
          aberta
          onFechar={() => setDefinir(false)}
          titulo="O que deve chegar todo mês"
          descricao={`${cliente.nome}. A lista vira a pendência do mês e a régua de cobrança; cada banco esperado é conferido (D-03).`}
          acao="Salvar lista"
          onAcao={() => {
            atualizar((x) => ({ ...x, lista: { documentos: selDocs, contas: selContas } }))
            loja.registrar(usuario.nome, `Definiu a lista do que deve chegar de ${cliente.nome}: ${selDocs.length} documento(s), ${selContas.length} conta(s) (CTB-001)`)
            setDefinir(false)
            loja.toast('Lista salva. Vale a partir desta competência.')
          }}
        >
          <Campo rotulo="Documentos">{() => <Fichas rotulo="Documentos" valores={selDocs} onMudar={setSelDocs} opcoes={d.deveChegar.map((x) => ({ valor: x.id, rotulo: x.item }))} />}</Campo>
          <Campo rotulo="Contas esperadas por banco" ajuda="O integrante aponta o banco que não mandou extrato.">{() => <Fichas rotulo="Contas" valores={selContas} onMudar={setSelContas} opcoes={d.contas.map((x) => ({ valor: x.id, rotulo: `${x.banco} ${x.conta}` }))} />}</Campo>
        </GavetaFormulario>
      )}
    </div>
  )
}

function ItemChegada({ chegou, nome, detalhe, onMarcar }: { chegou: boolean; nome: string; detalhe: string; onMarcar: () => void }) {
  return (
    <li className="flex items-center gap-2 text-sm">
      <Rotulo tom={chegou ? 'ok' : 'atencao'}>
        {chegou ? <CheckIcon weight="bold" className="text-success size-3" /> : <WarningIcon weight="fill" className="text-warning size-3" />}
        {chegou ? 'chegou' : 'falta'}
      </Rotulo>
      <span className="min-w-0 flex-1">
        <span className="block truncate">{nome}</span>
        <span className="text-muted-foreground block truncate text-xs">{detalhe}</span>
      </span>
      {!chegou && (
        <Button size="sm" variant="ghost" className="h-7 px-2" onClick={onMarcar} aria-label={`Marcar ${nome} como chegou`}>
          <CheckIcon />
        </Button>
      )}
    </li>
  )
}

/* ---------- Triagem e extratos (S03-A24, A25, A26) ---------- */

function TriagemBloco({ cliente, tamanho }: { cliente: Cliente; tamanho: TamanhoWidget }) {
  const { d, estado, atualizar, perfil } = useContabil(cliente)
  const loja = useLoja()
  const { usuario } = useSessao()
  const [importar, setImportar] = useState(false)
  const [arquivo, setArquivo] = useState(`extrato_${(perfil.bancos[0] ?? 'banco').toLowerCase().replace(/ /g, '')}_outubro.ofx`)
  const [lendo, setLendo] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [fonte, setFonte] = useState<string | null>(null)
  const meses = ['07/2026', '08/2026', '09/2026', '10/2026', '11/2026', '12/2026']
  const confirmarDoc = (id: string, competencia: string, nome: string, corrigiu: boolean) => {
    atualizar((x) => ({ ...x, triagem: { ...x.triagem, [id]: { competencia, confirmado: hojeCurto() } } }))
    loja.registrar(usuario.nome, `${corrigiu ? 'Corrigiu' : 'Confirmou'} a triagem de “${nome}”: ${cliente.nome} · ${competencia} (CTB-004${corrigiu ? '; a correção vence a leitura' : ''})`)
  }
  const ler = () => {
    setLendo(true)
    setErro(null)
    servicos.leitorExtratos
      .ler({ nome: arquivo, socios: perfil.socios })
      .then((r) => {
        setFonte(r.fonte)
        atualizar((x) => ({ ...x, extratos: [{ nome: arquivo, formato: r.dados.formato, linhas: r.dados.linhas, duplicadas: r.dados.duplicadas, socios: r.dados.socios.map((s) => `${s.nome} (${s.como})`).join(', '), quando: hojeCurto() }, ...x.extratos] }))
        loja.registrar(usuario.nome, `Importou ${arquivo} de ${cliente.nome}: ${r.dados.linhas} linhas, ${r.dados.duplicadas} duplicadas descartadas (D-11, demonstração)`)
        loja.toast(`${r.dados.formato} lido: ${r.dados.linhas} linhas${r.dados.duplicadas ? `, ${r.dados.duplicadas} repetidas do CSV descartadas` : ''}. Sócios reconhecidos: ${r.dados.socios.map((s) => s.como).join(', ')}.`)
        setImportar(false)
      })
      .catch((e: Error) => setErro(e.message))
      .finally(() => setLendo(false))
  }
  const consentimento = () => {
    atualizar((x) => ({ ...x, consentimento: hojeCurto() }))
    loja.registrar('Contábil', `Pediu consentimento do Open Finance a ${cliente.nome} pelo app (CTB-010)`)
    loja.toast('Pendência criada no app do cliente com o link do consentimento (Open Finance, demonstração).')
  }
  return (
    <div className="flex flex-col gap-2">
      <SaudeConectores ids={['email', 'whatsapp', 'open_finance']} />
      <p className="text-muted-foreground text-[11px]">Regras do mês (D-02): nome do arquivo, pasta e conteúdo decidem a competência; mês futuro não conta; mais de 3 meses vai para “conferir”. Um .zip é aberto e cada arquivo entra sozinho (D-04).</p>
      <ul className="divide-border/70 flex flex-col divide-y">
        {d.triagem.map((t) => {
          const conf = estado.triagem[t.id]
          return (
            <li key={t.id} className="flex flex-wrap items-center gap-2 py-1.5 first:pt-0">
              <span className="min-w-0 grow basis-40">
                <span className="block truncate font-mono text-xs">{t.nome}</span>
                <span className="text-muted-foreground block truncate text-[11px]">
                  {t.canal} · {conf ? `confirmado ${conf.confirmado}` : `${t.regra}: ${t.detalhe}`}
                </span>
              </span>
              <Rotulo tom={conf ? 'ok' : t.situacao === 'ok' || t.situacao === 'zip aberto' ? 'neutro' : 'atencao'}>{conf ? conf.competencia : t.situacao === 'ok' ? t.competencia : t.situacao}</Rotulo>
              {!conf && (
                <span className="flex items-center gap-1">
                  <span className="w-28">
                    <CampoEscolha rotulo={`Competência de ${t.nome}`} valor={t.competencia} onMudar={(v) => confirmarDoc(t.id, v, t.nome, v !== t.competencia)} opcoes={meses.map((m) => ({ valor: m, rotulo: m }))} />
                  </span>
                  <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => confirmarDoc(t.id, t.competencia, t.nome, false)} aria-label={`Confirmar ${t.nome}`}>
                    <CheckIcon />
                  </Button>
                </span>
              )}
            </li>
          )
        })}
      </ul>
      {tamanho === 'XL' && estado.extratos.length > 0 && (
        <ul className="flex flex-col gap-1 text-xs">
          {estado.extratos.map((x) => (
            <li key={x.nome + x.quando} className="bg-raised rounded-[10px] px-2 py-1">
              <strong className="font-medium">{x.nome}</strong> · {x.formato} · {x.linhas} linhas{x.duplicadas ? ` · ${x.duplicadas} duplicadas descartadas` : ''} · sócios: {x.socios || '—'} · {x.quando}
            </li>
          ))}
        </ul>
      )}
      {fonte && <SeloDemonstracao fonte={fonte} className="w-fit" />}
      <div className="flex flex-wrap gap-2">
        <BotaoNivel compacto nivel="executar" ferramenta="contabil.extrato.importar" setor="contabil" onClick={() => setImportar(true)}>
          <FileArrowUpIcon /> Importar extrato
        </BotaoNivel>
        {estado.consentimento ? (
          <Rotulo tom="info">consentimento pedido {estado.consentimento}</Rotulo>
        ) : (
          <Button size="sm" variant="ghost" onClick={consentimento}>
            Pedir Open Finance
          </Button>
        )}
      </div>
      {importar && (
        <GavetaFormulario aberta onFechar={() => setImportar(false)} titulo="Importar extrato" descricao="OFX, CSV, planilha ou PDF. O leitor deduplica o PDF contra o CSV do mesmo período e reconhece o sócio pelo CPF inteiro, mascarado ou pelo nome (D-11)." acao={lendo ? 'Lendo…' : 'Ler o arquivo'} acaoDesabilitada={lendo || !arquivo.trim()} onAcao={ler}>
          <Campo rotulo="Arquivo (demonstração: o nome decide o formato)">{(id) => <CampoTexto id={id} valor={arquivo} onMudar={setArquivo} mono />}</Campo>
          <div className="flex flex-wrap gap-1.5">
            {['ofx', 'csv', 'xlsx', 'pdf'].map((ext) => (
              <Button key={ext} size="sm" variant="outline" className="rounded-full" onClick={() => setArquivo(arquivo.replace(/\.[a-z]+$/, `.${ext}`))}>
                .{ext}
              </Button>
            ))}
          </div>
          {lendo && <Carregando rotulo="Lendo o extrato" linhas={2} />}
          {erro && <Erro texto={erro} onTentar={ler} />}
        </GavetaFormulario>
      )}
    </div>
  )
}

/* ---------- Classificação e de-para (S03-A27, A28) ---------- */

const contasPlano = ['Clientes', 'Despesas bancárias', 'Conta corrente de sócio', 'Distribuição de lucros', 'Pró-labore a pagar', 'Fornecedores', 'Seguros', 'Receita de serviços', 'Adiantamento a fornecedores', 'Empréstimos de sócios']

function ClassificacaoBloco({ cliente, tamanho }: { cliente: Cliente; tamanho: TamanhoWidget }) {
  const { d, estado, atualizar } = useContabil(cliente)
  const loja = useLoja()
  const { usuario } = useSessao()
  const postar = usePostarS03()
  const [corrigir, setCorrigir] = useState<string | null>(null)
  const [conta, setConta] = useState(contasPlano[0])
  const [regra, setRegra] = useState(true)
  const pendentes = d.linhas.filter((l) => !estado.linhas[l.id])
  const baixas = pendentes.filter((l) => l.confianca < 0.7)
  const classificadas = d.totalLinhas - pendentes.length
  const aceitar = (id: string, c: string) => atualizar((x) => ({ ...x, linhas: { ...x.linhas, [id]: { conta: c, aceita: hojeCurto() } } }))
  const linha = d.linhas.find((l) => l.id === corrigir)
  const pend = estado.pendentes['perguntar']
  if (tamanho === 'M')
    return (
      <div className="flex h-full flex-col justify-end gap-1">
        <span className="font-heading text-3xl font-light tabular-nums">{baixas.length}</span>
        <span className="text-muted-foreground text-xs">
          com confiança baixa · {classificadas} de {d.totalLinhas} classificadas
        </span>
        <Barra valor={classificadas} total={d.totalLinhas} rotulo="Linhas classificadas" />
      </div>
    )
  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-muted-foreground">
          {classificadas} de {d.totalLinhas} linhas classificadas · {estado.depara.length} regra(s) aprendida(s)
        </span>
        <span className="ml-auto">
          {baixas.length > 0 && !pend && (
            <BotaoNivel
              compacto
              nivel="executar com aprovação"
              ferramenta="contabil.depara.corrigir"
              setor="contabil"
              variante="ghost"
              onClick={() =>
                postar({
                  setor: 'contabil',
                  acao: 'contabil.perguntar',
                  cliente: { id: cliente.id, nome: cliente.nome },
                  chave: 'perguntar',
                  texto: `Não consegui identificar ${baixas.length} lançamento(s) de ${cliente.nome}. Mando a pergunta ao cliente?`,
                  resumo: `Perguntar ao cliente sobre ${baixas.length} lançamento(s) · ${cliente.nome}`,
                  argumentos: baixas.map((l) => ({ rotulo: `${l.data} ${l.descricao}`, valor: brl(l.valor) })),
                  dados: { texto: `Oi! Para fechar ${COMPETENCIA}, me ajuda a identificar: ${baixas.map((l) => `${l.data} ${l.descricao} (${brl(l.valor)})`).join('; ')}. Pode responder por aqui mesmo.` },
                })
              }
            >
              <ChatCircleDotsIcon /> Perguntar ao cliente
            </BotaoNivel>
          )}
        </span>
      </div>
      {pend && <CartaoPendente id={pend} />}
      <Tabela colunas={[{ rotulo: 'Lançamento' }, { rotulo: 'Valor', direita: true }, { rotulo: 'Sugestão do integrante' }, { rotulo: 'Confiança' }, { rotulo: '' }]} minimo={620}>
        {d.linhas.map((l) => {
          const feito = estado.linhas[l.id]
          const aprendida = estado.depara.find((r) => l.descricao.includes(r.padrao))
          return (
            <tr key={l.id} className={cn(!feito && l.confianca < 0.7 && 'bg-warning/5')}>
              <td className="py-1.5 pr-2">
                <div className="font-mono text-xs">{l.descricao}</div>
                <div className="text-muted-foreground text-[11px]">{l.data}</div>
              </td>
              <td className="py-1.5 pr-2 text-right tabular-nums">{brl(l.valor)}</td>
              <td className="py-1.5 pr-2">{feito ? feito.conta : aprendida ? `${aprendida.conta} (regra)` : l.sugestao}</td>
              <td className="py-1.5 pr-2">{feito ? <Rotulo tom="ok">classificada</Rotulo> : <Confianca valor={aprendida ? 0.98 : l.confianca} />}</td>
              <td className="py-1.5 text-right whitespace-nowrap">
                {!feito && (
                  <>
                    <Button size="sm" variant="ghost" onClick={() => aceitar(l.id, aprendida?.conta ?? l.sugestao)}>
                      Aceitar
                    </Button>
                    <Button size="icon-sm" variant="ghost" aria-label={`Corrigir de-para de ${l.descricao}`} onClick={() => (setCorrigir(l.id), setConta(l.socio ? 'Distribuição de lucros' : contasPlano[0]))}>
                      <PencilSimpleLineIcon />
                    </Button>
                  </>
                )}
              </td>
            </tr>
          )
        })}
      </Tabela>
      {estado.depara.length > 0 && (
        <p className="text-muted-foreground text-xs">
          Regras aprendidas: {estado.depara.map((r) => `“${r.padrao}” → ${r.conta}`).join(' · ')}
        </p>
      )}
      {linha && (
        <GavetaFormulario
          aberta
          onFechar={() => setCorrigir(null)}
          titulo="Corrigir de-para"
          descricao={`${linha.data} · ${linha.descricao} · ${brl(linha.valor)}. A correção vira regra e memória do integrante Contábil.`}
          acao="Salvar e ensinar"
          onAcao={() => {
            aceitar(linha.id, conta)
            const padrao = linha.descricao.replace(/\d+/g, '').trim().split(' ').slice(0, 3).join(' ')
            if (regra) atualizar((x) => ({ ...x, depara: [...x.depara.filter((r) => r.padrao !== padrao), { padrao, conta, por: usuario.nome, quando: hojeCurto() }] }))
            loja.registrar(usuario.nome, `Corrigiu o de-para de “${linha.descricao}” para ${conta}${regra ? ' e ensinou o integrante (vale para os próximos)' : ''} · ${cliente.nome} (CTB-016)`)
            loja.toast(regra ? 'De-para corrigido. O integrante Contábil aprendeu e usa nos próximos lançamentos parecidos.' : 'Classificação corrigida só nesta linha.')
            setCorrigir(null)
          }}
        >
          <Campo rotulo="Conta">{(id) => <CampoEscolha id={id} valor={conta} onMudar={setConta} opcoes={contasPlano.map((c) => ({ valor: c, rotulo: c }))} />}</Campo>
          <Interruptor ligado={regra} onMudar={setRegra} rotulo="Virar regra para os próximos" detalhe={`Lançamentos com “${linha.descricao.replace(/\d+/g, '').trim().split(' ').slice(0, 3).join(' ')}” vão direto para esta conta.`} />
        </GavetaFormulario>
      )}
    </div>
  )
}

/* ---------- Conciliação (S03-A29) ---------- */

function ConciliacaoBloco({ cliente, tamanho }: { cliente: Cliente; tamanho: TamanhoWidget }) {
  const { d, estado, atualizar } = useContabil(cliente)
  const loja = useLoja()
  const fluxos = useFluxos()
  const { usuario } = useSessao()
  const abertas = d.conciliacoes.filter((c) => c.diferenca > 0)
  if (tamanho === 'P')
    return (
      <div className="flex h-full flex-col justify-end">
        <span className={cn('font-heading text-4xl font-light tabular-nums', abertas.length && 'text-warning')}>{abertas.filter((c) => !estado.diferencas[c.id]).length}</span>
        <span className="text-muted-foreground text-xs">diferenças sem tarefa</span>
      </div>
    )
  if (!d.conciliacoes.length) return <Vazio>Nenhuma conta para conciliar.</Vazio>
  const abrir = (id: string, conta: string, dif: number) => {
    const existente = estado.diferencas[id]
    if (existente && loja.tarefas.some((t) => t.id === existente)) return fluxos.abrirTarefa(existente)
    const t = loja.criarTarefa({ codigo: 'CTB-018', titulo: `Conciliar ${conta}: diferença de ${brl(dif)}`, cliente: cliente.nome, setor: 'contabil', prazo: '25/11', status: 'a_fazer', responsavel: { tipo: 'pessoa', nome: usuario.nome } })
    atualizar((x) => ({ ...x, diferencas: { ...x.diferencas, [id]: t } }))
    loja.registrar(usuario.nome, `Abriu tarefa da diferença de conciliação: ${conta} · ${cliente.nome} (CTB-018)`)
    fluxos.abrirTarefa(t)
  }
  return (
    <ul className={cn('grid gap-1.5', tamanho === 'XL' && 'grid-cols-2')}>
      {d.conciliacoes.map((c) => (
        <li key={c.id} className={cn('flex items-center gap-3 rounded-[12px] px-3 py-1', c.diferenca === 0 ? 'bg-raised' : 'bg-warning/10')}>
          {c.diferenca === 0 ? <CheckIcon weight="bold" className="text-success size-4 shrink-0" aria-label="conciliada" /> : <WarningIcon weight="fill" className="text-warning size-4 shrink-0" aria-label="diferença" />}
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm">{c.conta}</span>
            <span className="text-muted-foreground block text-xs tabular-nums">{c.diferenca === 0 ? 'conciliada' : `diferença de ${brl(c.diferenca)}${estado.diferencas[c.id] ? ' · tarefa aberta' : ''}`}</span>
          </span>
          {c.diferenca > 0 && (
            <Button size="sm" variant="ghost" onClick={() => abrir(c.id, c.conta, c.diferenca)}>
              {estado.diferencas[c.id] ? 'Ver tarefa' : 'Tarefa'}
            </Button>
          )}
        </li>
      ))}
    </ul>
  )
}

/* ---------- Distribuição de lucros (S03-A30, A31, A32) ---------- */

const perguntasLucro: { valor: SaidaSocio['natureza']; rotulo: string; regra?: RegraFavorecido['regra'] }[] = [
  { valor: 'lucro', rotulo: 'É distribuição de lucro', regra: 'sempre lucro' },
  { valor: 'pró-labore', rotulo: 'É pró-labore (salário do sócio)', regra: 'pró-labore' },
  { valor: 'devolução', rotulo: 'É devolução de empréstimo ao sócio', regra: 'devolução' },
  { valor: 'reembolso', rotulo: 'É reembolso de despesa da empresa', regra: 'reembolso' },
  { valor: 'suspeita', rotulo: 'Não é do sócio / não sei: perguntar ao cliente' },
]

const trimestreDe = (mes: string) => Math.ceil(Number(mes.slice(0, 2)) / 3)

function LucrosBloco({ cliente, tamanho }: { cliente: Cliente; tamanho: TamanhoWidget }) {
  const { d, estado, atualizar, perfil } = useContabil(cliente)
  const loja = useLoja()
  const fluxos = useFluxos()
  const { usuario } = useSessao()
  const [duvida, setDuvida] = useState<SaidaSocio | null>(null)
  const [resposta, setResposta] = useState<SaidaSocio['natureza']>('lucro')
  const [adotar, setAdotar] = useState(true)
  const [exportar, setExportar] = useState(false)
  const [formato, setFormato] = useState<'csv' | 'pdf'>('csv')
  // Trimestre travado depois do REINF (D-15): no Presumido e no Real, o 3º trimestre foi enviado em 15/10.
  const reinf = fiscalS03(perfil).trimestresReinf
  const travado = (mes: string) => reinf.some((t) => t.trimestre.startsWith(`${trimestreDe(mes)}º`))
  const natureza = (s: SaidaSocio): SaidaSocio['natureza'] => {
    if (estado.saidas[s.id]) return estado.saidas[s.id]
    const r = estado.regras.find((x) => x.favorecido === s.favorecido)
    if (r && s.natureza === 'suspeita') return r.regra === 'sempre lucro' ? 'lucro' : r.regra === 'nunca lucro' ? 'reembolso' : (r.regra as SaidaSocio['natureza'])
    return s.natureza
  }
  const meses = Array.from(new Set(d.saidas.map((s) => s.mes)))
  const duvidas = d.saidas.filter((s) => natureza(s) === 'suspeita')
  const totais = perfil.socios.map((so) => ({
    socio: so.nome,
    meses: meses.map((m) => {
      const doMes = d.saidas.filter((s) => s.socio === so.nome && s.mes === m)
      const lucro = doMes.filter((s) => natureza(s) === 'lucro').reduce((t, s) => t + s.valor, 0)
      return { mes: m, lucro, proLabore: doMes.filter((s) => natureza(s) === 'pró-labore').reduce((t, s) => t + s.valor, 0), devolucao: doMes.filter((s) => natureza(s) === 'devolução').reduce((t, s) => t + s.valor, 0), suspeita: doMes.filter((s) => natureza(s) === 'suspeita').length }
    }),
  }))
  const acima = totais.flatMap((t) => t.meses.filter((m) => m.lucro > 50_000).map((m) => ({ socio: t.socio, ...m })))
  const alerta = [...acima].sort((a, b) => b.mes.localeCompare(a.mes)).find((a) => !estado.alertas50k[`${a.socio}:${a.mes}`])
  const responder = () => {
    if (!duvida) return
    const r = perguntasLucro.find((x) => x.valor === resposta)!
    atualizar((x) => ({ ...x, saidas: { ...x.saidas, [duvida.id]: resposta }, regras: adotar && r.regra ? [...x.regras.filter((g) => g.favorecido !== duvida.favorecido), { favorecido: duvida.favorecido, regra: duvida.favorecido !== duvida.socio && r.regra !== 'sempre lucro' ? 'nunca lucro' : r.regra, por: usuario.nome, quando: hojeCurto() }] : x.regras }))
    loja.registrar(usuario.nome, `Respondeu a dúvida da distribuição de lucros: ${duvida.favorecido} ${brl(duvida.valor)} em ${duvida.data} = ${r.rotulo.toLowerCase()}${adotar && r.regra ? ' (virou regra por favorecido)' : ''} · ${cliente.nome} (D-12, D-13)`)
    loja.toast(adotar && r.regra ? `Respondido. Regra adotada para “${duvida.favorecido}”: o integrante não pergunta de novo.` : 'Respondido.')
    setDuvida(null)
  }
  return (
    <div className="flex flex-col gap-2">
      {alerta && (
        <div role="alert" className="bg-warning/12 flex flex-wrap items-center gap-2 rounded-[12px] px-3 py-2 text-sm">
          <WarningIcon weight="fill" className="text-warning size-4 shrink-0" />
          <span className="min-w-0 grow basis-40">
            <strong className="font-medium">{alerta.socio}</strong> recebeu {brl(alerta.lucro)} de lucro em {alerta.mes}: acima de R$ 50 mil, retenção de 10% = <strong className="font-medium">{brl(alerta.lucro * 0.1)}</strong>, DARF até 20/{String(Number(alerta.mes.slice(0, 2)) + 1).padStart(2, '0')} (Lei 15.270/2025).
          </span>
          <Button size="sm" variant="ghost" onClick={() => (atualizar((x) => ({ ...x, alertas50k: { ...x.alertas50k, [`${alerta.socio}:${alerta.mes}`]: hojeCurto() } })), loja.registrar(usuario.nome, `Viu o alerta de R$ 50 mil: ${alerta.socio} ${alerta.mes} · ${cliente.nome} (D-14)`))}>
            Ciente
          </Button>
        </div>
      )}
      <Tabela colunas={[{ rotulo: 'Sócio' }, ...meses.map((m) => ({ rotulo: m, direita: true }))]} minimo={540}>
        {totais.map((t) => (
          <tr key={t.socio}>
            <td className="py-1.5 pr-2">{t.socio}</td>
            {t.meses.map((m) => (
              <td key={m.mes} className={cn('py-1.5 pr-2 text-right tabular-nums', m.lucro > 50_000 && 'text-warning font-medium')}>
                <div className="flex items-center justify-end gap-1">
                  {travado(m.mes) && <LockSimpleIcon className="text-muted-foreground size-3" aria-label="trimestre travado depois do REINF" />}
                  {brl0(m.lucro)}
                </div>
                {tamanho === 'XL' && (
                  <div className="text-muted-foreground text-[11px] font-normal">
                    pró-labore {brl0(m.proLabore)}
                    {m.devolucao ? ` · devol. ${brl0(m.devolucao)}` : ''}
                    {m.suspeita ? ` · ${m.suspeita} dúvida` : ''}
                  </div>
                )}
              </td>
            ))}
          </tr>
        ))}
      </Tabela>
      <div className="flex flex-col gap-1">
        <span className="text-muted-foreground text-xs">{duvidas.length ? `${duvidas.length} dúvida(s) do integrante` : 'Sem dúvidas: todas as saídas classificadas.'}</span>
        {duvidas.slice(0, tamanho === 'XL' ? 4 : 2).map((s) => (
          <div key={s.id} className="bg-raised flex flex-wrap items-center gap-2 rounded-[10px] px-2 py-1 text-sm">
            <span className="min-w-0 grow basis-40 truncate">
              {s.data} · {s.favorecido} · {brl(s.valor)}
            </span>
            {travado(s.mes) ? (
              <Rotulo tom="neutro">
                <LockSimpleIcon className="size-3" /> travado: vira complementar
              </Rotulo>
            ) : (
              <BotaoNivel compacto nivel="executar" ferramenta="contabil.lucros.responder" setor="contabil" variante="ghost" onClick={() => (setDuvida(s), setResposta(s.favorecido === s.socio ? 'lucro' : 'suspeita'))}>
                Responder
              </BotaoNivel>
            )}
          </div>
        ))}
      </div>
      {estado.regras.length > 0 && (
        <ul className="flex flex-wrap gap-1.5 text-xs">
          {estado.regras.map((r) => (
            <li key={r.favorecido} className="bg-sunken flex items-center gap-1 rounded-full px-2 py-0.5">
              {r.favorecido}: <strong className="font-medium">{r.regra}</strong>
              <button type="button" className="text-muted-foreground hover:text-foreground ml-1 cursor-pointer" aria-label={`Tirar a regra de ${r.favorecido}`} onClick={() => atualizar((x) => ({ ...x, regras: x.regras.filter((g) => g.favorecido !== r.favorecido) }))}>
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <BotaoNivel compacto nivel="executar" ferramenta="contabil.lucros.exportar" setor="contabil" variante="ghost" onClick={() => setExportar(true)}>
          Exportar trimestre
        </BotaoNivel>
        <span className="text-muted-foreground text-[11px]">{reinf.length ? '3º trimestre travado: REINF enviado em 15/10.' : 'Sem REINF neste regime: trimestres abertos até o fechamento anual.'}</span>
      </div>
      {duvida && (
        <GavetaFormulario aberta onFechar={() => setDuvida(null)} titulo="Dúvida da distribuição de lucros" descricao={`${duvida.data} · ${duvida.favorecido} · ${brl(duvida.valor)} · ${cliente.nome}. A resposta pode virar regra por favorecido (D-13).`} acao="Responder" onAcao={responder}>
          <div role="radiogroup" aria-label="O que é esta saída" className="flex flex-col gap-1.5">
            {perguntasLucro.map((q, i) => (
              <button key={q.valor} type="button" role="radio" aria-checked={resposta === q.valor} onClick={() => setResposta(q.valor)} className={cn('flex cursor-pointer items-center gap-2 rounded-[12px] border px-3 py-2 text-left text-sm', resposta === q.valor ? 'border-foreground/30 bg-raised font-medium' : 'border-border text-muted-foreground')}>
                <span className="tabular-nums">{i + 1}.</span> {q.rotulo}
              </button>
            ))}
          </div>
          <Interruptor ligado={adotar} onMudar={setAdotar} rotulo={`Adotar como regra para “${duvida.favorecido}”`} detalhe={duvida.favorecido === duvida.socio ? '“sempre lucro” ou a natureza escolhida, nas próximas saídas a este favorecido' : 'favorecido que não é o sócio vira “nunca lucro”, salvo se você escolher lucro'} />
        </GavetaFormulario>
      )}
      {exportar && (
        <GavetaFormulario
          aberta
          onFechar={() => setExportar(false)}
          titulo="Exportar trimestre de lucros"
          descricao="Por sócio e mês, com pró-labore, devoluções e a retenção acima de R$ 50 mil. O trimestre travado sai com o protocolo do REINF."
          acao="Exportar"
          onAcao={() => {
            const nome = `Lucros ${reinf.length ? '3º trimestre' : '4º trimestre'} 2026 · ${cliente.nome}.${formato}`
            atualizar((x) => ({ ...x, exportados: [...x.exportados, nome] }))
            loja.registrar(usuario.nome, `Exportou ${nome} (D-15)`)
            fluxos.baixar(nome)
            setExportar(false)
          }}
        >
          <Campo rotulo="Formato">{() => <Segmentado rotulo="Formato" valor={formato} onMudar={setFormato} opcoes={[{ valor: 'csv', rotulo: 'CSV' }, { valor: 'pdf', rotulo: 'PDF com o tema' }]} />}</Campo>
        </GavetaFormulario>
      )}
    </div>
  )
}

/* ---------- Fechamento e lote ao core (S03-A33, A34) ---------- */

function CoreBloco({ cliente, tamanho }: { cliente: Cliente; tamanho: TamanhoWidget }) {
  const { d, estado } = useContabil(cliente)
  const postar = usePostarS03()
  const confirmar = useConfirmar()
  const b = bloqueios(d, estado)
  const etapa = estado.etapa ?? d.etapaInicial
  const falta = b.conciliacao.length ? `${b.conciliacao.length} diferença(s) de conciliação` : ordemEtapa(etapa) < 3 ? `etapa ${etapasFechamento[ordemEtapa(etapa)].rotulo.toLowerCase()}` : undefined
  const pend = estado.pendentes['core'] ?? estado.pendentes['reabrir']
  const enviar = () =>
    postar({ setor: 'contabil', acao: 'contabil.core.enviar', cliente: { id: cliente.id, nome: cliente.nome }, chave: 'core', texto: `Competência ${COMPETENCIA} de ${cliente.nome} conciliada. Aprova o envio do lote ao core?`, resumo: `Enviar lote ${COMPETENCIA} ao core · ${cliente.nome}`, argumentos: [{ rotulo: 'Lançamentos', valor: String(d.totalLinhas) }, { rotulo: 'Sistema', valor: 'Alterdata (ePlugin)' }], dados: { lancamentos: d.totalLinhas, sistema: 'Alterdata' } })
  const reabrir = async () => {
    const motivo = await confirmar({ titulo: `Reabrir ${COMPETENCIA}?`, descricao: 'Reabrir desfaz o fechamento; o que foi ao core volta como ajuste. Precisa de motivo e de aprovação.', acao: 'Pedir aprovação', exigirMotivo: true, rotuloMotivo: 'Motivo' })
    if (!motivo || typeof motivo !== 'string') return
    postar({ setor: 'contabil', acao: 'contabil.reabrir', cliente: { id: cliente.id, nome: cliente.nome }, chave: 'reabrir', texto: `Pedido para reabrir ${COMPETENCIA} de ${cliente.nome}: ${motivo}.`, resumo: `Reabrir ${COMPETENCIA} · ${cliente.nome}`, argumentos: [{ rotulo: 'Motivo', valor: motivo }], dados: { motivo } })
  }
  return (
    <div className="flex h-full flex-col gap-2">
      {estado.core ? (
        <p className="text-sm">
          <Rotulo tom="ok">
            <CheckIcon weight="bold" className="text-success size-3" /> no core
          </Rotulo>{' '}
          lote {estado.core.lote} · {estado.core.aceitos} aceitos{estado.core.rejeitados ? `, ${estado.core.rejeitados} rejeitado` : ''} · {estado.core.quando}
        </p>
      ) : (
        <p className="text-muted-foreground text-sm">Lote de {COMPETENCIA}: {falta ? `aguardando (${falta})` : 'pronto para enviar'}.</p>
      )}
      {tamanho === 'G' && d.imobilizado.length > 0 && (
        <ul className="text-muted-foreground text-xs">
          {d.imobilizado.map((i) => (
            <li key={i.item}>
              Imobilizado: {i.item} · {brl0(i.valor)} · depreciação {i.depreciacao}
            </li>
          ))}
          <li>Inventário: {perfilS03(cliente).atividade === 'comercio' || perfilS03(cliente).atividade === 'industria' ? 'contagem de 31/12 agendada (CTB-046)' : 'não se aplica'}</li>
        </ul>
      )}
      {pend && <CartaoPendente id={pend} />}
      <div className="mt-auto flex flex-wrap gap-2">
        {!estado.core && !pend && (
          <BotaoNivel compacto nivel="executar com aprovação" ferramenta="contabil.core.enviar" setor="contabil" falta={falta} onClick={enviar}>
            Enviar ao core
          </BotaoNivel>
        )}
        {estado.core && !pend && (
          <BotaoNivel compacto nivel="executar com aprovação" ferramenta="contabil.competencia.reabrir" setor="contabil" variante="ghost" onClick={reabrir}>
            Reabrir competência
          </BotaoNivel>
        )}
      </div>
    </div>
  )
}

/* ---------- Relatórios, travas e fila de assinatura (S03-A35 a A39) ---------- */

function useRelatorios(cliente: Cliente) {
  const ctx = useContabil(cliente)
  const { d, estado, atualizar } = ctx
  const loja = useLoja()
  const { usuario } = useSessao()
  const postar = usePostarS03()
  const travas = travasDe(d)
  const abertas = travas.filter((t) => t.aberta && !estado.justificativas[t.id])
  const estadoDe = (id: string, campo: 'relatorios' | 'declaracoes' = 'relatorios'): EstadoRelatorio | undefined => estado[campo][id]
  const mudar = (id: string, patch: EstadoRelatorio, campo: 'relatorios' | 'declaracoes' = 'relatorios') => atualizar((x) => ({ ...x, [campo]: { ...x[campo], [id]: { ...x[campo][id], ...patch } } }))
  const gerar = (r: ContabilS03['relatorios'][number]) => {
    const precisaTrava = r.tipo === 'balancete' || r.tipo === 'dre' || r.tipo === 'comparativo' || r.tipo === 'demonstracoes'
    if (precisaTrava && abertas.length) {
      mudar(r.id, { situacao: 'trava', motivo: abertas.map((t) => t.rotulo).join(', ') })
      loja.toast(`“${r.nome}” não vira cartão: ${abertas.length} trava(s) aberta(s). Corrija ou justifique (D-26).`)
      return
    }
    mudar(r.id, { situacao: 'rascunho', quando: hojeCurto() })
    loja.registrar(usuario.nome, `Gerou o rascunho de “${r.nome}” · ${cliente.nome} (preparar)`)
    loja.toast(`Rascunho de “${r.nome}” pronto, com o tema do escritório.`)
  }
  const paraFila = (id: string, nome: string, campo: 'relatorios' | 'declaracoes' = 'relatorios') => {
    mudar(id, { situacao: 'na fila', quando: hojeCurto() }, campo)
    loja.registrar(usuario.nome, `Mandou “${nome}” para a fila de assinatura do contador · ${cliente.nome} (D-16)`)
    loja.toast(`“${nome}” na fila de assinatura do contador. Só sai depois de assinado e conferido.`)
  }
  const enviar = (id: string, nome: string, assinado: boolean, campo: 'relatorios' | 'declaracoes' = 'relatorios') => {
    mudar(id, { situacao: 'aguardando envio' }, campo)
    postar({
      setor: 'contabil',
      acao: campo === 'declaracoes' ? 'contabil.declaracao.enviar' : 'contabil.relatorio.enviar',
      cliente: { id: cliente.id, nome: cliente.nome },
      chave: `enviar:${id}`,
      texto: `“${nome}” de ${cliente.nome} pronto${assinado ? ', assinado e com a assinatura conferida' : ''}. Aprova o envio ao cliente?`,
      resumo: `Enviar “${nome}” · ${cliente.nome}`,
      argumentos: [{ rotulo: 'Documento', valor: nome }, { rotulo: 'Assinatura', valor: assinado ? 'conferida no PDF' : 'não exige' }, { rotulo: 'Travas', valor: abertas.length ? 'abertas' : 'todas fechadas ou justificadas' }],
      dados: { relId: id, nome, assinado },
    })
  }
  return { ...ctx, travas, abertas, estadoDe, mudar, gerar, paraFila, enviar }
}

const rotuloSituacao: Record<EstadoRelatorio['situacao'], [string, 'ok' | 'atencao' | 'erro' | 'neutro' | 'info']> = {
  rascunho: ['rascunho pronto', 'info'],
  trava: ['trava aberta', 'erro'],
  'na fila': ['na fila do contador', 'atencao'],
  assinado: ['assinado, a conferir', 'atencao'],
  conferido: ['assinatura conferida', 'ok'],
  recusado: ['assinatura recusada', 'erro'],
  'aguardando envio': ['cartão de envio', 'atencao'],
  enviado: ['enviado', 'ok'],
  transmitido: ['transmitido', 'ok'],
}

function RelatoriosBloco({ cliente }: { cliente: Cliente }) {
  const r = useRelatorios(cliente)
  const loja = useLoja()
  const { usuario } = useSessao()
  const confirmar = useConfirmar()
  const transmitir = async (id: string, nome: string) => {
    const ok = await confirmar({ titulo: `Transmitir ${nome} com o seu certificado?`, descricao: 'ECD e ECF são transmitidas por uma pessoa (certificado do contador ou do cliente). O recibo volta para a pasta do cliente.', acao: 'Transmitir' })
    if (!ok) return
    const recibo = `${nome.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-8)}`
    r.mudar(id, { situacao: 'transmitido', recibo, quando: hojeCurto() })
    loja.adicionarDocumento({ nome: `Recibo ${nome}.pdf`, clienteId: cliente.id, pasta: ['Contábil', 'Recibos'], tipo: 'recibo', competencia: '2025', origem: 'gerado_plataforma', conector: 'a1', tamanho: '60 KB', quando: 'hoje', por: usuario.nome })
    loja.registrar(usuario.nome, `Transmitiu ${nome} de ${cliente.nome} (só pessoa) · recibo ${recibo} anexado`)
    loja.toast(`${nome} transmitida (demonstração). Recibo ${recibo} anexado.`)
  }
  return (
    <div className="flex flex-col gap-2">
      {r.abertas.length > 0 && (
        <p className="bg-destructive/10 flex items-center gap-2 rounded-[10px] px-2 py-1 text-xs">
          <ShieldWarningIcon className="text-destructive size-4" /> {r.abertas.length} trava(s) aberta(s): balancete, DRE e comparativo não viram cartão (D-26).
        </p>
      )}
      <ul className="divide-border/70 flex flex-col divide-y">
        {r.d.relatorios.map((rel) => {
          const e = r.estadoDe(rel.id)
          const [rot, tom] = e ? rotuloSituacao[e.situacao] : ['a gerar', 'neutro' as const]
          const anual = rel.tipo === 'ecd' || rel.tipo === 'ecf'
          const pend = r.estado.pendentes[`enviar:${rel.id}`]
          return (
            <li key={rel.id} className="flex flex-col gap-1.5 py-1.5 first:pt-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="min-w-0 grow basis-40">
                  <span className="block truncate text-sm">
                    {rel.nome} {rel.fase > 1 && <SeloFase fase={rel.fase} />}
                  </span>
                  <span className="text-muted-foreground block truncate text-[11px]">
                    {rel.assina ? 'sai assinado pelo contador' : 'sem assinatura'}
                    {e?.motivo ? ` · ${e.motivo}` : ''}
                    {e?.recibo ? ` · recibo ${e.recibo}` : ''}
                  </span>
                </span>
                <Rotulo tom={tom}>{rot}</Rotulo>
                {(!e || e.situacao === 'trava') && (
                  <BotaoNivel compacto nivel="preparar" ferramenta="contabil.relatorio.gerar" setor="contabil" variante="ghost" onClick={() => r.gerar(rel)}>
                    Gerar
                  </BotaoNivel>
                )}
                {e?.situacao === 'rascunho' && anual && (
                  <BotaoNivel compacto nivel="só pessoa" ferramenta="contabil.ecd_ecf.transmitir" setor="contabil" variante="ghost" onClick={() => transmitir(rel.id, rel.nome)}>
                    Transmitir
                  </BotaoNivel>
                )}
                {e?.situacao === 'rascunho' && !anual && rel.assina && (
                  <Button size="sm" variant="ghost" onClick={() => r.paraFila(rel.id, rel.nome)}>
                    Para assinatura
                  </Button>
                )}
                {((e?.situacao === 'rascunho' && !anual && !rel.assina) || e?.situacao === 'conferido') && !pend && (
                  <BotaoNivel compacto nivel="executar com aprovação" ferramenta="contabil.relatorio.enviar" setor="contabil" variante="ghost" onClick={() => r.enviar(rel.id, rel.nome, e?.situacao === 'conferido')}>
                    Enviar
                  </BotaoNivel>
                )}
              </div>
              {pend && <CartaoPendente id={pend} />}
            </li>
          )
        })}
      </ul>
      <Aprendizado acao="contabil.relatorio.enviar" />
    </div>
  )
}

function TravasBloco({ cliente, tamanho }: { cliente: Cliente; tamanho: TamanhoWidget }) {
  const { travas, estado, atualizar } = useRelatorios(cliente)
  const loja = useLoja()
  const { usuario } = useSessao()
  const [just, setJust] = useState<string | null>(null)
  const [texto, setTexto] = useState('')
  const lista = tamanho === 'M' ? travas.filter((t) => t.aberta) : travas
  return (
    <div className="flex flex-col gap-1.5">
      {tamanho === 'M' && !lista.length && <Vazio>Todas as travas fechadas: o relatório pode virar cartão.</Vazio>}
      {lista.map((t) => {
        const j = estado.justificativas[t.id]
        return (
          <div key={t.id} className="flex items-center gap-2 text-sm">
            {!t.aberta ? <CheckIcon weight="bold" className="text-success size-4 shrink-0" aria-label="ok" /> : j ? <CheckIcon className="text-warning size-4 shrink-0" aria-label="justificada" /> : <WarningIcon weight="fill" className="text-destructive size-4 shrink-0" aria-label="trava aberta" />}
            <span className="min-w-0 flex-1">
              <span className="block truncate">{t.rotulo}</span>
              <span className="text-muted-foreground block truncate text-xs">{j ? `justificada: ${j}` : t.detalhe}</span>
            </span>
            {t.aberta && !j && (
              <Button size="sm" variant="ghost" onClick={() => (setJust(t.id), setTexto(''))}>
                Justificar
              </Button>
            )}
          </div>
        )
      })}
      {just && (
        <GavetaFormulario
          aberta
          onFechar={() => setJust(null)}
          titulo={`Justificar: ${travas.find((t) => t.id === just)?.rotulo}`}
          descricao="Corrigir é o normal. Quando o número está certo, a justificativa fica no relatório e no evento."
          acao="Justificar"
          acaoDesabilitada={texto.trim().length < 5}
          onAcao={() => {
            atualizar((x) => ({ ...x, justificativas: { ...x.justificativas, [just]: texto.trim() } }))
            loja.registrar(usuario.nome, `Justificou a trava “${travas.find((t) => t.id === just)?.rotulo}” de ${cliente.nome}: ${texto.trim()} (D-26)`)
            setJust(null)
          }}
        >
          <Campo rotulo="Por que o número está certo">{(id) => <CampoArea id={id} valor={texto} onMudar={setTexto} placeholder="Ex.: venda de imóvel do ativo em outubro, registrada em outras receitas" />}</Campo>
        </GavetaFormulario>
      )}
    </div>
  )
}

function FilaAssinaturaBloco({ cliente }: { cliente: Cliente }) {
  const r = useRelatorios(cliente)
  const loja = useLoja()
  const { usuario } = useSessao()
  const [conferindo, setConferindo] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [fonte, setFonte] = useState<string | null>(null)
  const itens = [
    ...r.d.relatorios.filter((x) => ['na fila', 'assinado', 'conferido', 'recusado', 'aguardando envio'].includes(r.estado.relatorios[x.id]?.situacao ?? '')).map((x) => ({ id: x.id, nome: x.nome, campo: 'relatorios' as const, e: r.estado.relatorios[x.id] })),
    ...r.d.pedidosDeclaracao.filter((x) => ['na fila', 'assinado', 'conferido', 'recusado', 'aguardando envio'].includes(r.estado.declaracoes[x.id]?.situacao ?? '')).map((x) => ({ id: x.id, nome: `Declaração de faturamento (${x.meses} meses)`, campo: 'declaracoes' as const, e: r.estado.declaracoes[x.id] })),
  ]
  const assinarFora = (id: string, nome: string, campo: 'relatorios' | 'declaracoes') => {
    servicos.assinatura.enviar({ documento: nome, signatarios: [{ nome: 'Fernanda Lima (contadora responsável)', email: 'contadora@escritorio' }] }).then((res) => {
      setFonte(res.fonte)
      loja.registrar(usuario.nome, `Mandou “${nome}” ao provedor de assinatura (envelope ${res.dados.envelope}, demonstração)`)
      loja.toast('Enviado ao provedor de assinatura. Quando voltar, use “Devolver assinado” para conferir.')
    }).catch((e: Error) => setErro(e.message))
    r.mudar(id, { situacao: 'na fila', motivo: 'no provedor de assinatura' }, campo)
  }
  const devolver = (id: string, nome: string, campo: 'relatorios' | 'declaracoes', semAssinatura: boolean) => {
    const arquivo = `${nome}${semAssinatura ? ' (sem-assinatura)' : ' (assinado)'}.pdf`
    r.mudar(id, { situacao: 'assinado', arquivo, motivo: undefined }, campo)
    setConferindo(id)
    setErro(null)
    servicos.conferenciaAssinatura
      .conferir({ documento: arquivo, esperado: 'Fernanda Lima · CRC 1SP 234.567' })
      .then((res) => {
        setFonte(res.fonte)
        r.mudar(id, res.dados.valida ? { situacao: 'conferido', motivo: `${res.dados.signatario} · ${res.dados.certificado}` } : { situacao: 'recusado', motivo: res.dados.motivo }, campo)
        loja.registrar('Contábil', `Conferiu a assinatura de “${nome}”: ${res.dados.valida ? 'válida e íntegra' : `recusada (${res.dados.motivo})`} · ${cliente.nome} (D-16)`)
        loja.toast(res.dados.valida ? 'Assinatura conferida dentro do PDF: o envio foi liberado.' : `Assinatura recusada: ${res.dados.motivo}`)
      })
      .catch((e: Error) => setErro(e.message))
      .finally(() => setConferindo(null))
  }
  return (
    <div className="flex flex-col gap-2">
      <SaudeConectores ids={['assinatura']} />
      {erro && <Erro texto={erro} onTentar={() => setErro(null)} />}
      {!itens.length && <Vazio>Nada esperando assinatura. Relatórios que saem assinados entram aqui pelo “Para assinatura”.</Vazio>}
      <ul className="flex flex-col gap-2">
        {itens.map((it) => {
          const [rot, tom] = rotuloSituacao[it.e!.situacao]
          const pend = r.estado.pendentes[`enviar:${it.id}`]
          return (
            <li key={it.id} className="bg-raised flex flex-col gap-1.5 rounded-[12px] px-3 py-2">
              <div className="flex flex-wrap items-center gap-2">
                <PenNibIcon className="text-muted-foreground size-4 shrink-0" />
                <span className="min-w-0 grow basis-40 text-sm">
                  {it.nome}
                  <span className="text-muted-foreground block text-[11px]">{it.e!.motivo ?? `desde ${it.e!.quando}`}</span>
                </span>
                <Rotulo tom={tom}>{conferindo === it.id ? 'conferindo…' : rot}</Rotulo>
              </div>
              <div className="flex flex-wrap gap-1.5 pl-6">
                {(it.e!.situacao === 'na fila' || it.e!.situacao === 'recusado') && (
                  <>
                    <Button size="sm" variant="ghost" onClick={() => assinarFora(it.id, it.nome, it.campo)}>
                      Assinar fora
                    </Button>
                    <BotaoNivel compacto nivel="executar" ferramenta="contabil.assinatura.conferir" setor="contabil" variante="ghost" onClick={() => devolver(it.id, it.nome, it.campo, false)}>
                      Devolver assinado
                    </BotaoNivel>
                    <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => devolver(it.id, it.nome, it.campo, true)}>
                      Devolver sem assinatura digital
                    </Button>
                  </>
                )}
                {it.e!.situacao === 'conferido' && !pend && (
                  <BotaoNivel compacto nivel="executar com aprovação" ferramenta="contabil.relatorio.enviar" setor="contabil" onClick={() => r.enviar(it.id, it.nome, true, it.campo)}>
                    Liberar envio
                  </BotaoNivel>
                )}
              </div>
              {pend && <CartaoPendente id={pend} />}
            </li>
          )
        })}
      </ul>
      {fonte && <SeloDemonstracao fonte={fonte} className="w-fit" />}
    </div>
  )
}

/* ---------- Declaração de faturamento (S03-A38, C2-14) ---------- */

function DeclaracaoBloco({ cliente }: { cliente: Cliente }) {
  const r = useRelatorios(cliente)
  const loja = useLoja()
  const fluxos = useFluxos()
  const { usuario } = useSessao()
  const [gerar, setGerar] = useState<string | null>(null)
  const [meses, setMeses] = useState('12')
  const receita = perfilS03(cliente).receitaMensal
  const pedidos = r.d.pedidosDeclaracao
  const virarTarefa = (id: string, finalidade: string) => {
    const t = loja.criarTarefa({ codigo: 'CTB-201', titulo: `Declaração de faturamento (${finalidade})`, cliente: cliente.nome, setor: 'contabil', prazo: '21/11', status: 'em_andamento', responsavel: { tipo: 'integrante', nome: 'Contábil' }, origem: 'pedido_cliente' })
    r.mudar(id, { situacao: 'rascunho', motivo: 'tarefa aberta', arquivo: t }, 'declaracoes')
    loja.registrar('Contábil', `Pedido do app virou tarefa: declaração de faturamento · ${cliente.nome} (C2-14)`)
    fluxos.abrirTarefa(t)
  }
  return (
    <div className="flex flex-col gap-2">
      {!pedidos.length && <Vazio>Nenhum pedido de declaração de faturamento. Quando o cliente pedir pelo app, o pedido padronizado chega aqui.</Vazio>}
      {pedidos.map((pd) => {
        const e = r.estadoDe(pd.id, 'declaracoes')
        const [rot, tom] = e ? rotuloSituacao[e.situacao] : ['pedido no app', 'atencao' as const]
        const pend = r.estado.pendentes[`enviar:${pd.id}`]
        return (
          <div key={pd.id} className="flex flex-col gap-1.5 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="min-w-0 grow basis-40">
                {pd.pedidoPor} pediu em {pd.quando}
                <span className="text-muted-foreground block text-xs">
                  {pd.finalidade} · últimos {pd.meses} meses
                </span>
              </span>
              <Rotulo tom={tom}>{rot}</Rotulo>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {!e && (
                <Button size="sm" variant="ghost" onClick={() => virarTarefa(pd.id, pd.finalidade)}>
                  Virar tarefa
                </Button>
              )}
              {e?.situacao === 'rascunho' && (
                <>
                  <BotaoNivel compacto nivel="preparar" variante="ghost" onClick={() => (setGerar(pd.id), setMeses(String(pd.meses)))}>
                    Gerar
                  </BotaoNivel>
                </>
              )}
              {e?.situacao === 'conferido' && !pend && (
                <BotaoNivel compacto nivel="executar com aprovação" onClick={() => r.enviar(pd.id, `Declaração de faturamento · ${cliente.nome}`, true, 'declaracoes')}>
                  Enviar
                </BotaoNivel>
              )}
            </div>
            {pend && <CartaoPendente id={pend} />}
          </div>
        )
      })}
      {gerar && (
        <GavetaFormulario
          aberta
          onFechar={() => setGerar(null)}
          titulo="Declaração de faturamento"
          descricao="Modelo padronizado do escritório, com o faturamento mês a mês tirado da escrituração. Sai assinada pelo contador (vai para a fila de assinatura)."
          acao="Mandar para assinatura"
          onAcao={() => {
            r.paraFila(gerar, 'Declaração de faturamento', 'declaracoes')
            setGerar(null)
            loja.registrar(usuario.nome, `Gerou a declaração de faturamento de ${cliente.nome} (${meses} meses)`)
          }}
        >
          <Campo rotulo="Período">{() => <Segmentado rotulo="Período" valor={meses} onMudar={setMeses} opcoes={[{ valor: '6', rotulo: '6 meses' }, { valor: '12', rotulo: '12 meses' }]} />}</Campo>
          <Tabela colunas={[{ rotulo: 'Mês' }, { rotulo: 'Faturamento', direita: true }]} minimo={240}>
            {Array.from({ length: Number(meses) }, (_, i) => {
              const m = ((10 - i - 1 + 120) % 12) + 1
              const a = 10 - i <= 0 ? 2025 : 2026
              return (
                <tr key={i}>
                  <td className="py-1 pr-2 tabular-nums">
                    {String(m).padStart(2, '0')}/{a}
                  </td>
                  <td className="py-1 text-right tabular-nums">{brl(receita * (0.9 + ((i * 7) % 5) * 0.04))}</td>
                </tr>
              )
            })}
          </Tabela>
        </GavetaFormulario>
      )}
    </div>
  )
}

/* ---------- Livro-caixa (PF) e fase 4 ---------- */

function LivroCaixaBloco({ cliente }: { cliente: Cliente }) {
  const { d } = useContabil(cliente)
  return (
    <Tabela colunas={[{ rotulo: 'Mês' }, { rotulo: 'Receitas', direita: true }, { rotulo: 'Despesas', direita: true }, { rotulo: 'Base', direita: true }]} minimo={320}>
      {(d.livroCaixa ?? []).map((m) => (
        <tr key={m.mes}>
          <td className="py-1.5 pr-2 tabular-nums">{m.mes}</td>
          <td className="py-1.5 pr-2 text-right tabular-nums">{brl(m.receitas)}</td>
          <td className="py-1.5 pr-2 text-right tabular-nums">{brl(m.despesas)}</td>
          <td className="py-1.5 text-right tabular-nums">{brl(m.receitas - m.despesas)}</td>
        </tr>
      ))}
    </Tabela>
  )
}

function Fase4Bloco({ cliente }: { cliente: Cliente }) {
  const { d } = useContabil(cliente)
  const fluxos = useFluxos()
  const r = d.dre
  const margem = r.faturamento ? r.lucro / r.faturamento : 0
  return (
    <div className="flex flex-col gap-2 text-sm">
      <dl className="grid grid-cols-2 gap-2">
        <div className="bg-raised rounded-[12px] px-3 py-1.5">
          <dt className="text-muted-foreground text-[11px]">Margem líquida {COMPETENCIA}</dt>
          <dd className="font-medium tabular-nums">{r.faturamento ? pct(margem) : '—'}</dd>
        </div>
        <div className="bg-raised rounded-[12px] px-3 py-1.5">
          <dt className="text-muted-foreground text-[11px]">Custo sobre receita</dt>
          <dd className="font-medium tabular-nums">{r.faturamento ? pct(r.custos / r.faturamento) : '—'}</dd>
        </div>
      </dl>
      <ul className="flex flex-col gap-1">
        {['Orçamento do cliente (CTB-029)', 'Consolidação de grupo (CTB-033)', 'Auditoria e revisão analítica (CTB-045)'].map((x) => (
          <li key={x} className="flex items-center gap-2">
            <span className="min-w-0 flex-1 truncate">{x}</span>
            <SeloFase fase={4} />
            <Button size="sm" variant="ghost" onClick={() => fluxos.preparar({ cliente: cliente.nome, setor: 'contabil', documento: x })}>
              Preparar
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ---------- Carteira: Kanban, Minha fila, etapas por analista (S03-A40, A41) ---------- */

const colunasKanban: ColunaQuadro[] = [
  { id: 'pendente', titulo: 'Pendente' },
  { id: 'andamento', titulo: 'Em andamento' },
  { id: 'conferencia', titulo: 'Conferência' },
  { id: 'concluido', titulo: 'Concluído' },
]
const colunaPadrao = (e: EtapaFechamento) => (e === 'coleta' ? 'pendente' : e === 'conciliacao' ? 'conferencia' : e === 'core' ? 'concluido' : 'andamento')
const fases = ['Completo', 'Parcial', 'A conferir', 'Pendente', 'Estrutura incompleta'] as const

function useCarteiraContabil() {
  const loja = useLoja()
  const [kanban, setKanban] = usePersistente<Record<string, string>>(CHAVE_KANBAN, {})
  const clientes = loja.clientes.filter((c) => !c.servicos || c.servicos.includes('contabil'))
  const linhas = clientes.map((c) => {
    const p = perfilS03(c)
    const d = contabilS03(p)
    const e = lerEstado(loja, chaveContabil(c.id), contabilVazio)
    const etapa = e.etapa ?? d.etapaInicial
    const coluna = kanban[c.id] ?? (e.core ? 'concluido' : colunaPadrao(etapa))
    const lucroPendente = d.saidas.some((s) => s.natureza === 'suspeita' && !e.saidas[s.id])
    return { c, p, d, e, etapa, coluna, lucroPendente, travas: travasDe(d).filter((t) => t.aberta && !e.justificativas[t.id]).length }
  })
  return { linhas, kanban, setKanban }
}

function KanbanCarteira() {
  const { linhas, setKanban } = useCarteiraContabil()
  const loja = useLoja()
  const { usuario } = useSessao()
  const pode = usePode('contabil.kanban.mover', { setor_id: 'contabil' })
  const [filtro, setFiltro] = usePersistente<string[]>('s03:contabil:filtro-fase', [])
  const [lucro, setLucro] = usePersistente<boolean>('s03:contabil:filtro-lucro', false)
  const visiveis = linhas.filter((l) => (!filtro.length || filtro.includes(l.d.fase)) && (!lucro || l.lucroPendente))
  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Fichas rotulo="Filtrar por fase do cliente" valores={filtro} onMudar={setFiltro} opcoes={fases.map((f) => ({ valor: f, rotulo: f }))} />
        <Fichas rotulo="Filtrar por módulo" valores={lucro ? ['lucro'] : []} onMudar={(v) => setLucro(v.includes('lucro'))} opcoes={[{ valor: 'lucro', rotulo: 'lucro pendente de REINF' }]} />
      </div>
      {!visiveis.length ? (
        <Vazio>Nenhum cliente com esse filtro.</Vazio>
      ) : (
        <Quadro
          colunas={colunasKanban}
          itens={visiveis}
          idDe={(l) => l.c.id}
          colunaDe={(l) => l.coluna}
          rotuloDe={(l) => l.c.nome}
          desabilitado={!pode}
          onMover={(id, coluna) => {
            const l = linhas.find((x) => x.c.id === id)
            setKanban((k) => ({ ...k, [id]: coluna }))
            loja.registrar(usuario.nome, `Moveu ${l?.c.nome} no Kanban do fechamento para ${colunasKanban.find((c) => c.id === coluna)?.titulo} (D-22)`)
          }}
          render={(l) => (
            <div className="flex min-w-0 flex-col gap-1 px-1 py-0.5 text-sm">
              <span className="truncate font-medium" title={l.c.nome}>{l.c.nome}</span>
              <span className="text-muted-foreground text-xs">
                {l.p.analista} · {etapasFechamento[ordemEtapa(l.etapa)].rotulo}
                {l.d.atrasoDias ? ` · ${l.d.atrasoDias} dias de atraso` : ''}
              </span>
              <span className="flex flex-wrap gap-1">
                <Rotulo tom={l.d.fase === 'Completo' ? 'ok' : l.d.fase === 'Pendente' || l.d.fase === 'Estrutura incompleta' ? 'atencao' : 'neutro'}>{l.d.fase}</Rotulo>
                {l.lucroPendente && <Rotulo tom="atencao">lucro a conferir</Rotulo>}
                {l.travas > 0 && <Rotulo tom="erro">{l.travas} trava</Rotulo>}
              </span>
            </div>
          )}
        />
      )}
    </div>
  )
}

function MinhaFila({ tamanho }: { tamanho: TamanhoWidget }) {
  const { linhas } = useCarteiraContabil()
  const { usuario } = useSessao()
  const minhas = linhas.filter((l) => l.p.analista === usuario.nome && l.coluna !== 'concluido')
  const lista = (minhas.length ? minhas : linhas.filter((l) => l.coluna !== 'concluido')).sort((a, b) => b.d.atrasoDias - a.d.atrasoDias)
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-muted-foreground text-xs">{minhas.length ? `Meus clientes (${usuario.nome}), do mais atrasado ao menos` : 'Você não é analista de nenhum cliente; a fila mostra a carteira'}</span>
      <ul className="divide-border/70 flex flex-col divide-y">
        {lista.slice(0, tamanho === 'M' ? 2 : 6).map((l) => (
          <Linha key={l.c.id} titulo={l.c.nome} detalhe={`${etapasFechamento[ordemEtapa(l.etapa)].rotulo} · ${l.d.fase}`} fim={<Rotulo tom={l.d.atrasoDias > 5 ? 'erro' : l.d.atrasoDias ? 'atencao' : 'neutro'}>{l.d.atrasoDias ? `${l.d.atrasoDias} dias` : 'em dia'}</Rotulo>} />
        ))}
      </ul>
    </div>
  )
}

function EtapasCarteira() {
  const { linhas } = useCarteiraContabil()
  return (
    <Tabela colunas={[{ rotulo: 'Cliente' }, { rotulo: 'Analista' }, ...etapasFechamento.map((e) => ({ rotulo: e.rotulo, centro: true }))]} minimo={640}>
      {linhas.map((l) => {
        const idx = l.e.core ? 5 : ordemEtapa(l.etapa)
        const parado = bloqueios(l.d, l.e)[l.etapa][0]
        return (
          <tr key={l.c.id}>
            <td className="py-2 pr-2">
              <div>{l.c.nome}</div>
              {parado && idx < 5 && <div className="text-warning text-[11px]">{parado}</div>}
            </td>
            <td className="text-muted-foreground py-2 pr-2">{l.p.analista}</td>
            {etapasFechamento.map((e, i) => (
              <td key={e.id} className="py-2 pr-2 text-center">
                <span className={cn('mx-auto block size-3 rounded-full', i < idx ? 'bg-success' : i === idx ? (parado ? 'bg-warning' : 'bg-foreground') : 'bg-sunken')} aria-label={i < idx ? 'feito' : i === idx ? 'atual' : 'a fazer'} />
              </td>
            ))}
          </tr>
        )
      })}
    </Tabela>
  )
}

function FilaCarteira() {
  const { linhas } = useCarteiraContabil()
  const itens = linhas.flatMap((l) => [
    ...l.d.relatorios.filter((r) => ['na fila', 'assinado', 'recusado'].includes(l.e.relatorios[r.id]?.situacao ?? '')).map((r) => ({ cliente: l.c.nome, nome: r.nome, s: l.e.relatorios[r.id].situacao })),
    ...l.d.pedidosDeclaracao.filter((r) => ['na fila', 'assinado', 'recusado'].includes(l.e.declaracoes[r.id]?.situacao ?? '')).map((r) => ({ cliente: l.c.nome, nome: 'Declaração de faturamento', s: l.e.declaracoes[r.id].situacao })),
  ])
  if (!itens.length) return <Vazio>Nada na fila de assinatura da carteira.</Vazio>
  return (
    <ul className="divide-border/70 flex flex-col divide-y">
      {itens.map((i) => (
        <Linha key={i.cliente + i.nome} inicio={<PenNibIcon className="text-muted-foreground size-4 shrink-0" />} titulo={i.nome} detalhe={i.cliente} fim={<Rotulo tom={rotuloSituacao[i.s][1]}>{rotuloSituacao[i.s][0]}</Rotulo>} />
      ))}
    </ul>
  )
}

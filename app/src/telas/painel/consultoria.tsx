import { BinocularsIcon, BookBookmarkIcon, ChatsCircleIcon, ChatTeardropTextIcon, CheckIcon, CoinsIcon, DoorOpenIcon, FlaskIcon, ScalesIcon, ScrollIcon, SparkleIcon, UsersThreeIcon, WarningIcon } from '@phosphor-icons/react'
import { useState, type ReactNode } from 'react'
import { integranteDoSetor, useFluxos } from '@/ambiente/fluxos'
import { useLoja, useNavegacao, usePersistente } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import { Carregando, EstadoErro, SeloDemonstracao } from '@/components/kit'
import { Button } from '@/components/ui/button'
import { CampoArea, CampoEscolha, Fichas, GavetaFormulario, Segmentado } from '@/components/ui/formulario'
import type { DefWidget, TamanhoWidget } from '@/components/widgets/tipos'
import { baseLegal, brl0, cenariosReforma, consultoriaS03, HOJE, ddmm, pct, perfilS03, type PerguntaS03 } from '@/dados/painel-s03'
import type { Cliente } from '@/dados/tipos'
import { cn } from '@/lib/utils'
import { servicos } from '@/servicos'
import { Aprendizado, CartaoPendente, usePostarS03 } from './s03/cartoes'
import { chaveConsultoria, consultoriaVazio, hojeCurto, lerEstado, useDadosS03, useEstadoConsultoria, type ParagrafoParecer } from './s03/estado'
import { BotaoNivel, Rotulo, SeloFase, Vazio } from './s03/pecas'
import { PedirAoIntegrante, type SugestaoPedido } from './s03/pedir'
import { IconeSituacao, Linha, Tabela } from './Tabela'
import type { CtxAba, WidgetsAba } from './tipos'

/**
 * Consultoria e Reforma (03, 6.7; 02, 10; 07; mapa S03-T03): perguntas técnicas
 * respondidas com base citada e sempre revisadas por uma pessoa; pareceres
 * com versão da base; vigilância; segunda opinião; resumo da CCT; e as fases
 * seguintes funcionando (planejamento, reforma por ano, créditos, entrada e
 * saída), cada uma com o selo da fase.
 */
export function widgetsConsultoria(ctx: CtxAba): WidgetsAba {
  const { cliente } = ctx
  if (!cliente)
    return {
      catalogo: [
        w('carteira-consultoria', 'Consultoria na carteira', 'CON-001, 004', 'Perguntas e avisos por cliente, com filtro por status', ChatsCircleIcon, ['G', 'XL'], () => <CarteiraConsultoria />),
        w('avulsos', 'Fora do escopo (a propor)', 'S03-A48', 'Perguntas marcadas fora do contrato, que viram serviço avulso no Financeiro', CoinsIcon, ['M', 'G'], () => <AvulsosCarteira />),
        w('pedir', 'Pedir ao Consultor', 'S03-A18', 'O Consultor faz e devolve no chat', SparkleIcon, ['M', 'G'], () => <PedirAoIntegrante setor="consultor" sugestoes={sugestoesConsultor} />),
      ],
    }
  const p = perfilS03(cliente)
  const ws: DefWidget[] = []
  const c = (...a: Parameters<typeof w>) => ws.push(w(...a))
  c('perguntas', 'Perguntas técnicas', 'CON-001, 002', 'Por canal, setor de origem e status; dentro ou fora do escopo', ChatsCircleIcon, ['G', 'XL'], () => <PerguntasBloco cliente={cliente} />)
  c('pareceres', 'Pareceres do cliente', 'CON-002, 003, 006', 'Enviados, com citação, data e versão da base; reaproveitar como modelo', ScrollIcon, ['M', 'G'], (t) => <PareceresBloco cliente={cliente} tamanho={t} />)
  c('vigilancia', 'Vigilância e enquadramento', 'CON-004, 010, 015, 033', 'Avisos do Consultor com números e regra', BinocularsIcon, ['M', 'G'], (t) => <VigilanciaBloco cliente={cliente} tamanho={t} />)
  c('perguntar', 'Perguntar ao Consultor', '03, 2.3', 'Atalho para o chat do Consultor com o cliente como contexto', ChatTeardropTextIcon, ['P', 'M'], () => <PerguntarBloco cliente={cliente} />)
  if (p.tipo !== 'pf' && p.tipo !== 'mei') c('segunda-opiniao', 'Segunda opinião', '02, 10.1', 'Tarefas de risco revisadas pelo Consultor: confere ou divergência', ScalesIcon, ['M', 'G'], () => <SegundaOpiniaoBloco cliente={cliente} />)
  if (p.empregados > 0) c('cct', 'Resumo da convenção coletiva', 'C2-04', 'Pontos do dia a dia da CCT nova, publicados na memória do DP', UsersThreeIcon, ['M', 'G'], () => <CctBloco cliente={cliente} />)
  if (p.tipo !== 'pf') c('planejamento', 'Planejamento tributário', 'CON-007 a 014, 303', 'Comparativo de regimes com a origem de cada número', CoinsIcon, ['G', 'XL'], () => <PlanejamentoBloco cliente={cliente} />)
  if (p.tipo !== 'pf') c('reforma', 'Reforma tributária', 'CON-015 a 032', 'Carga por ano da transição e divergência contra a calculadora oficial', FlaskIcon, ['G', 'XL'], (t) => <ReformaBloco cliente={cliente} tamanho={t} />)
  if (p.tipo !== 'pf' && p.tipo !== 'mei') c('recuperacao', 'Recuperação de créditos', 'CON-033 a 036, 304', 'Oportunidades, levantamento e proposta', CoinsIcon, ['M', 'G'], () => <RecuperacaoBloco cliente={cliente} />)
  c('entrada-saida', 'Entrada, saída e comercial', 'CON-101 a 106, 301, 302, 401', 'Diagnósticos de entrada e desligamento, pré-venda, consultoria recorrente e financeira', DoorOpenIcon, ['M', 'G'], () => <EntradaSaidaBloco cliente={cliente} />)
  c('pedir', 'Pedir ao Consultor', 'S03-A18', 'O Consultor faz e devolve no chat', SparkleIcon, ['M', 'G'], () => <PedirAoIntegrante setor="consultor" cliente={cliente.nome} sugestoes={sugestoesConsultor} />)
  return { catalogo: ws }
}

function w(id: string, titulo: string, atividades: string, descricao: string, icone: DefWidget['icone'], tamanhos: TamanhoWidget[], conteudo: (t: TamanhoWidget) => ReactNode): DefWidget {
  return { id, titulo, atividades, descricao, icone, tamanhos, conteudo }
}

const sugestoesConsultor: SugestaoPedido[] = [
  { rotulo: 'Ver o que mudou na legislação para este cliente', etapas: ['Lendo as publicações desde ontem', 'Cruzando com o perfil do cliente', 'Separando o que afeta pareceres enviados'], fim: 'Nada novo desde ontem que mude os pareceres deste cliente. Sigo vigiando às 7h.' },
  { rotulo: 'Revisar o enquadramento com os números do mês', etapas: ['Somando a receita de 12 meses', 'Calculando o fator R', 'Comparando com os limites do regime'], fim: 'Enquadramento revisto: sem mudança de regime indicada. Os números estão no bloco de planejamento.' },
  { rotulo: 'Preparar o diagnóstico da reforma', etapas: ['Simulando a carga por ano', 'Conferindo com a calculadora oficial', 'Escrevendo para o cliente'], fim: 'Diagnóstico da reforma preparado como rascunho; o envio passa por você.' },
]

/* ---------- estado e rascunho ---------- */

function useConsult(cliente: Cliente) {
  const dados = useDadosS03(cliente)
  const [estado, atualizar] = useEstadoConsultoria(cliente.id)
  const perguntas = [...estado.novas, ...dados.consultoria.perguntas].map((q) => ({ ...q, ...estado.perguntas[q.id] })) as (PerguntaS03 & { avulso?: string; rascunho?: ParagrafoParecer[]; tarefa?: string })[]
  return { ...dados, k: dados.consultoria, estado, atualizar, perguntas }
}

/** Cascata do Consultor (07, 3.5): o que sai como rascunho para cada pergunta. Sem base, abstenção. */
function rascunhoPara(q: PerguntaS03, nomeCliente: string): { paragrafos: ParagrafoParecer[]; abstencao?: string } {
  const t = q.pergunta.toLowerCase()
  const p = (texto: string, fonte?: string): ParagrafoParecer => ({ id: `${Math.random().toString(36).slice(2, 8)}`, texto, fonte })
  const ref = `Data de referência: base legal de ${ddmm(HOJE)}/2026.`
  if (/carnê-leão|aluguel recebido/.test(t)) return { paragrafos: [], abstencao: 'Não encontrei base legal suficiente na base do Consultor para afirmar com segurança. Pesquisei: Lei 7.713/1988 (carnê-leão), RIR/2018 (rendimentos de aluguel), IN RFB 1.500/2014. Encaminhe a um contador; não completo com conhecimento próprio.' }
  if (/fator r|anexo v|folha/.test(t)) return { paragrafos: [p(`Pergunta de ${q.quem}: ${q.pergunta}`), p('Serviços do Anexo V passam a ser tributados pelo Anexo III quando a folha dos últimos 12 meses, dividida pela receita bruta do mesmo período, for igual ou superior a 28%.', 'lc123_18'), p('Com os números do cliente, o fator R está no bloco de planejamento; subir a folha (pró-labore incluído) acima desse ponto muda o anexo já no mês seguinte.', 'calculo'), p(ref)] }
  if (/sublimite/.test(t)) return { paragrafos: [p(`Pergunta de ${q.quem}: ${q.pergunta}`), p('A empresa de pequeno porte vai até R$ 4,8 milhões de receita no ano; acima de R$ 3,6 milhões, ICMS e ISS saem do DAS (sublimite).', 'lc123_3'), p('A distância até o sublimite, com a receita acumulada, está no bloco do Simples da aba Fiscal.', 'calculo'), p(ref)] }
  if (/lucro|dividend/.test(t)) return { paragrafos: [p(`Pergunta de ${q.quem}: ${q.pergunta}`), p('Desde 2026, lucros e dividendos pagos a uma mesma pessoa física acima de R$ 50 mil no mês têm retenção de 10% de IRRF.', 'lei15270'), p('Os lucros apurados até 2025 seguiam isentos na fonte pela regra anterior.', 'lei9249'), p('Antecipar a distribuição de resultados de anos anteriores reduz a retenção futura, desde que haja lucro apurado e escriturado.'), p(ref)] }
  if (/reforma|preço/.test(t)) return { paragrafos: [p(`Pergunta de ${q.quem}: ${q.pergunta}`), p('Em 2026 a CBS (0,9%) e o IBS (0,1%) são de teste e compensados; a CBS plena começa em 2027 e o IBS sobe de 2029 a 2033.', 'lc214'), p(`A carga de ${nomeCliente} por ano está no bloco da reforma, com a divergência contra a calculadora oficial.`, 'calculo'), p(ref)] }
  if (/iss/.test(t)) return { paragrafos: [p(`Pergunta de ${q.quem}: ${q.pergunta}`), p('Como regra, o ISS é devido no local do estabelecimento prestador; as exceções estão nos incisos do art. 3º.', 'lc116'), p(ref)] }
  if (/crédito de pis|uniforme/.test(t)) return { paragrafos: [p(`Pergunta de ${q.quem}: ${q.pergunta}`), p('No regime não cumulativo, dá crédito o que é insumo na produção ou na prestação de serviço.', 'lei10833'), p('Uniforme obrigatório da produção tem sido aceito como insumo pelo critério da essencialidade.'), p(ref)] }
  if (/filial/.test(t)) return { paragrafos: [p(`Pergunta de ${q.quem}: ${q.pergunta}`), p('A opção pelo regime de tributação é da pessoa jurídica e alcança a matriz e todas as filiais: a filial não pode ter regime diferente.'), p('Com a filial de Guarulhos, muda o cadastro municipal e o ISS dela, não o regime federal.', 'lc116'), p(ref)] }
  if (/mei|funcionário/.test(t)) return { paragrafos: [], abstencao: 'Não encontrei na base do Consultor o trecho vigente sobre o número de empregados do MEI. Pesquisei: LC 123/2006, art. 18-A e art. 18-C; Resolução CGSN 140/2018. Encaminhe a um contador.' }
  return { paragrafos: [], abstencao: `Não encontrei base legal para responder “${q.pergunta}”. Pesquisei a LC 123/2006, a LC 214/2025 e o RIR/2018. Não completo com conhecimento próprio.` }
}

const statusTom: Record<PerguntaS03['status'], 'neutro' | 'atencao' | 'info' | 'ok'> = { nova: 'neutro', 'rascunho pronto': 'atencao', revisada: 'info', enviada: 'ok' }

/* ---------- Perguntas técnicas (S03-A42 a A45, A48) ---------- */

function PerguntasBloco({ cliente }: { cliente: Cliente }) {
  const { perguntas, estado, atualizar } = useConsult(cliente)
  const loja = useLoja()
  const nav = useNavegacao()
  const { usuario } = useSessao()
  const postar = usePostarS03()
  const [gerando, setGerando] = useState<string | null>(null)
  const [editar, setEditar] = useState<string | null>(null)
  const [abst, setAbst] = useState<Record<string, string>>({})
  const [avulsos, setAvulsos] = usePersistente<{ id: string; cliente: string; clienteId: string; assunto: string; quando: string; por: string }[]>('s03:avulsos', [])
  const pedirRascunho = (q: PerguntaS03) => {
    const r = rascunhoPara(q, cliente.nome)
    setGerando(q.id)
    loja.iniciarTrabalho({
      id: `s03-parecer-${q.id}-${Date.now()}`,
      integrante: integranteDoSetor('consultor'),
      setor: 'consultor',
      titulo: `Rascunho de parecer: ${q.pergunta}`,
      cliente: cliente.nome,
      inicio: 'Vou percorrer a base legal e montar o rascunho com as citações conferidas.',
      etapas: ['Classificando a pergunta', 'Buscando na base legal (versão de hoje)', 'Conferindo citações e vigência', 'Escrevendo com a data de referência'],
      seg: 1.1,
      fim: r.abstencao ? { texto: r.abstencao, aviso: `Consultor sem base para: ${q.pergunta}` } : { texto: `Rascunho pronto para “${q.pergunta}”, com ${r.paragrafos.filter((x) => x.fonte && x.fonte !== 'calculo').length} citação(ões). O que não tem suporte está marcado para você revisar.`, aviso: `Rascunho de parecer pronto · ${cliente.nome}` },
    })
    window.setTimeout(() => {
      if (r.abstencao) setAbst((x) => ({ ...x, [q.id]: r.abstencao! }))
      else atualizar((x) => ({ ...x, perguntas: { ...x.perguntas, [q.id]: { ...x.perguntas[q.id], status: 'rascunho pronto', rascunho: r.paragrafos } } }))
      setGerando(null)
    }, 5200)
  }
  const foraDoEscopo = (q: PerguntaS03) => {
    atualizar((x) => ({ ...x, perguntas: { ...x.perguntas, [q.id]: { ...x.perguntas[q.id], escopo: 'fora', avulso: hojeCurto() } } }))
    setAvulsos((xs) => [...xs.filter((a) => a.id !== q.id), { id: q.id, cliente: cliente.nome, clienteId: cliente.id, assunto: q.pergunta, quando: hojeCurto(), por: usuario.nome }])
    loja.registrar(usuario.nome, `Marcou fora do escopo: “${q.pergunta}” · ${cliente.nome}; virou serviço avulso a propor (S03-A48)`)
    loja.toast('Fora do escopo do contrato: virou serviço avulso a propor no Financeiro.', { modulo: 'financeiro', aba: 'contratos' }, 'Ver no Financeiro')
  }
  const q = perguntas.find((x) => x.id === editar)
  return (
    <div className="flex flex-col gap-2">
      <ul className="divide-border/70 flex flex-col divide-y">
        {perguntas.map((x) => {
          const pend = estado.pendentes[`parecer:${x.id}`]
          return (
            <li key={x.id} className="flex flex-col gap-1.5 py-2 first:pt-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="min-w-0 grow basis-40">
                  <span className="block text-sm">{x.pergunta}</span>
                  <span className="text-muted-foreground block text-xs">
                    {x.quem} · {x.canal} · do {x.setorOrigem} · {x.quando}
                    {x.risco ? ' · risco: segunda opinião' : ''}
                  </span>
                </span>
                <Rotulo tom={x.escopo === 'fora' ? 'atencao' : 'neutro'}>{x.escopo === 'fora' ? (x.avulso ? 'fora · avulso a propor' : 'fora do escopo') : 'no escopo'}</Rotulo>
                <Rotulo tom={statusTom[x.status]}>{gerando === x.id ? 'rascunhando…' : x.status}</Rotulo>
              </div>
              {abst[x.id] && (
                <p className="bg-sunken flex items-start gap-2 rounded-sm px-3 py-2 text-xs">
                  <WarningIcon className="text-warning mt-0.5 size-3.5 shrink-0" /> <span>Abstenção do Consultor: {abst[x.id]}</span>
                </p>
              )}
              {pend && <CartaoPendente id={pend} />}
              <div className="flex flex-wrap gap-1.5">
                {x.status === 'nova' && gerando !== x.id && (
                  <BotaoNivel compacto nivel="preparar" ferramenta="consultoria.parecer.rascunhar" setor="consultor" variante="ghost" onClick={() => pedirRascunho(x)}>
                    Pedir rascunho
                  </BotaoNivel>
                )}
                {(x.status === 'rascunho pronto' || x.status === 'revisada') && !pend && (
                  <Button size="sm" variant="ghost" onClick={() => setEditar(x.id)}>
                    Revisar e editar
                  </Button>
                )}
                {x.status === 'revisada' && !pend && (
                  <BotaoNivel
                    compacto
                    nivel="executar com aprovação"
                    ferramenta="consultoria.parecer.enviar"
                    setor="consultor"
                    variante="ghost"
                    onClick={() => {
                      const r = x.rascunho ?? rascunhoPara(x, cliente.nome).paragrafos
                      postar({ setor: 'consultor', acao: 'consultoria.parecer.enviar', cliente: { id: cliente.id, nome: cliente.nome }, chave: `parecer:${x.id}`, texto: `Parecer revisado para ${x.quem}: “${x.pergunta}”. Aprova o envio?`, resumo: `Enviar parecer · ${cliente.nome}`, argumentos: [{ rotulo: 'Pergunta', valor: x.pergunta }, { rotulo: 'Citações', valor: String(r.filter((y) => y.fonte && y.fonte !== 'calculo').length) }, { rotulo: 'Sem suporte', valor: String(r.filter((y) => !y.fonte && !y.texto.startsWith('Pergunta') && !y.texto.startsWith('Data')).length) }], dados: { perguntaId: x.id, titulo: x.pergunta, citacoes: r.filter((y) => y.fonte && y.fonte !== 'calculo').length } })
                    }}
                  >
                    Enviar ao cliente
                  </BotaoNivel>
                )}
                {x.escopo === 'dentro' && x.status !== 'enviada' && (
                  <BotaoNivel compacto nivel="executar" ferramenta="consultoria.escopo.marcar" setor="consultor" variante="ghost" className="text-muted-foreground" onClick={() => foraDoEscopo(x)}>
                    Fora do escopo
                  </BotaoNivel>
                )}
                {x.escopo === 'fora' && !x.avulso && (
                  <Button size="sm" variant="ghost" onClick={() => foraDoEscopo(x)}>
                    Propor como avulso
                  </Button>
                )}
                {x.avulso && (
                  <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => nav.irPara({ modulo: 'financeiro', aba: 'contratos' })}>
                    ver no Financeiro
                  </Button>
                )}
              </div>
            </li>
          )
        })}
      </ul>
      {avulsos.length > 0 && <span className="sr-only">{avulsos.length} avulsos</span>}
      <Aprendizado acao="consultoria.parecer.enviar" />
      {q && <EditorParecer pergunta={q} cliente={cliente} onFechar={() => setEditar(null)} />}
    </div>
  )
}

/** Editor do rascunho (S03-A43): cada afirmação com a sua fonte; sem fonte fica destacada. */
function EditorParecer({ pergunta, cliente, onFechar }: { pergunta: PerguntaS03 & { rascunho?: ParagrafoParecer[] }; cliente: Cliente; onFechar: () => void }) {
  const { atualizar } = useConsult(cliente)
  const loja = useLoja()
  const { usuario } = useSessao()
  const [pars, setPars] = useState<ParagrafoParecer[]>(pergunta.rascunho ?? rascunhoPara(pergunta, cliente.nome).paragrafos)
  const fontes = [{ valor: '', rotulo: 'sem fonte (afirmação sem suporte)' }, { valor: 'calculo', rotulo: 'cálculo com os números do cliente' }, ...Object.values(baseLegal).map((t) => ({ valor: t.id, rotulo: t.norma }))]
  const semSuporte = pars.filter((x) => !x.fonte && !x.texto.startsWith('Pergunta') && !x.texto.startsWith('Data'))
  return (
    <GavetaFormulario
      aberta
      largura="lg"
      onFechar={onFechar}
      titulo="Revisar o rascunho do parecer"
      descricao={`${cliente.nome} · ${pergunta.pergunta}. Toda resposta técnica passa por uma pessoa; afirmação sem norma, registro ou cálculo fica destacada.`}
      acao="Salvar revisão"
      onAcao={() => {
        atualizar((x) => ({ ...x, perguntas: { ...x.perguntas, [pergunta.id]: { ...x.perguntas[pergunta.id], status: 'revisada', rascunho: pars } } }))
        loja.registrar(usuario.nome, `Revisou o rascunho do parecer “${pergunta.pergunta}” · ${cliente.nome} (${semSuporte.length} afirmação(ões) sem suporte)`)
        loja.toast(semSuporte.length ? `Revisão salva com ${semSuporte.length} afirmação(ões) sem suporte destacada(s).` : 'Revisão salva. Pronto para enviar com aprovação.')
        onFechar()
      }}
    >
      {semSuporte.length > 0 && (
        <p className="bg-warning/12 flex items-center gap-2 rounded-sm px-3 py-2 text-xs">
          <WarningIcon weight="fill" className="text-warning size-4" /> {semSuporte.length} afirmação(ões) sem suporte. Cite uma norma ou um cálculo, ou reescreva.
        </p>
      )}
      {pars.map((par, i) => {
        const trecho = par.fonte && par.fonte !== 'calculo' ? baseLegal[par.fonte] : undefined
        const sem = !par.fonte && !par.texto.startsWith('Pergunta') && !par.texto.startsWith('Data')
        return (
          <div key={par.id} className={cn('flex flex-col gap-1.5 rounded-md p-2', sem ? 'bg-warning/10 ring-warning/40 ring-1' : 'bg-sunken/50')}>
            <CampoArea valor={par.texto} onMudar={(v) => setPars((xs) => xs.map((x, j) => (j === i ? { ...x, texto: v } : x)))} linhas={2} />
            <CampoEscolha rotulo={`Fonte do parágrafo ${i + 1}`} valor={par.fonte ?? ''} onMudar={(v) => setPars((xs) => xs.map((x, j) => (j === i ? { ...x, fonte: v || undefined } : x)))} opcoes={fontes} />
            {trecho && (
              <p className="text-muted-foreground text-xs">
                [{trecho.norma}] “{trecho.redacao}” · vigente {trecho.vigente}
              </p>
            )}
          </div>
        )
      })}
      <Button size="sm" variant="ghost" className="w-fit" onClick={() => setPars((xs) => [...xs, { id: Math.random().toString(36).slice(2, 8), texto: '' }])}>
        + Parágrafo
      </Button>
    </GavetaFormulario>
  )
}

/* ---------- Pareceres (S03-A46) ---------- */

function PareceresBloco({ cliente, tamanho }: { cliente: Cliente; tamanho: TamanhoWidget }) {
  const { k, estado, atualizar } = useConsult(cliente)
  const loja = useLoja()
  const { usuario } = useSessao()
  const todos = [...estado.pareceres, ...k.pareceres]
  const reaproveitar = (titulo: string) => {
    const id = `${cliente.id}:qm${Date.now()}`
    const nova: PerguntaS03 = { id, pergunta: `${titulo} (atualização)`, canal: 'interno', quem: usuario.nome, setorOrigem: 'Consultoria', status: 'rascunho pronto', escopo: 'dentro', quando: 'agora' }
    atualizar((x) => ({ ...x, novas: [nova, ...x.novas], perguntas: { ...x.perguntas, [id]: { status: 'rascunho pronto', rascunho: rascunhoPara({ ...nova, pergunta: titulo }, cliente.nome).paragrafos } } }))
    loja.registrar(usuario.nome, `Reaproveitou o parecer “${titulo}” como modelo · ${cliente.nome} (S03-A46)`)
    loja.toast('Novo rascunho criado a partir do parecer anterior. Está em Perguntas técnicas para revisar.')
  }
  if (!todos.length) return <Vazio>Nenhum parecer enviado.</Vazio>
  return (
    <ul className="divide-border/70 flex flex-col divide-y">
      {todos.slice(0, tamanho === 'M' ? 1 : 5).map((p) => (
        <Linha
          key={p.id}
          titulo={p.titulo}
          detalhe={`${p.data} · ${p.base} · v${p.versao} · ${p.citacoes} citações`}
          fim={
            <Button size="sm" variant="ghost" onClick={() => reaproveitar(p.titulo)}>
              Modelo
            </Button>
          }
        />
      ))}
    </ul>
  )
}

/* ---------- Vigilância (S03-A47) e perguntar ---------- */

function VigilanciaBloco({ cliente, tamanho }: { cliente: Cliente; tamanho: TamanhoWidget }) {
  const { k, estado, atualizar } = useConsult(cliente)
  const loja = useLoja()
  const fluxos = useFluxos()
  const nav = useNavegacao()
  const { usuario } = useSessao()
  const abrir = (id: string, aviso: string, numeros: string, regra: string) => {
    const t0 = estado.vigilancia[id]
    if (t0 && loja.tarefas.some((t) => t.id === t0)) return fluxos.abrirTarefa(t0)
    const t = loja.criarTarefa({ codigo: 'CON-004', titulo: `Risco ou oportunidade: ${aviso} (${numeros}; ${regra})`, cliente: cliente.nome, setor: 'consultor', prazo: '30/11', status: 'a_fazer', responsavel: { tipo: 'pessoa', nome: usuario.nome } })
    atualizar((x) => ({ ...x, vigilancia: { ...x.vigilancia, [id]: t } }))
    loja.registrar(usuario.nome, `Abriu tarefa da vigilância: ${aviso} · ${cliente.nome} (S03-A47)`)
    fluxos.abrirTarefa(t)
  }
  const lista = tamanho === 'M' ? k.vigilancia.filter((v) => v.nivel !== 'ok').slice(0, 1) : k.vigilancia
  return (
    <div className="flex flex-col gap-2">
      <p className="text-muted-foreground text-[11px]">Vigia todo dia às 7h e quando sai norma nova; revisa o enquadramento no dia 10.</p>
      <ul className="flex flex-col gap-2">
        {lista.map((v) => (
          <li key={v.id} className={cn('flex items-start gap-2.5 rounded-md px-3 py-2', v.nivel === 'atencao' ? 'bg-warning/10' : 'bg-raised')}>
            <IconeSituacao s={v.nivel} className="mt-0.5" />
            <span className="min-w-0 flex-1">
              <span className="block text-sm">{v.aviso}</span>
              <span className="text-muted-foreground block text-xs">
                {v.numeros} · {v.regra}
              </span>
            </span>
            {v.nivel === 'atencao' && (
              <Button size="sm" variant="ghost" onClick={() => abrir(v.id, v.aviso, v.numeros, v.regra)}>
                {estado.vigilancia[v.id] ? 'Ver tarefa' : 'Tarefa'}
              </Button>
            )}
          </li>
        ))}
      </ul>
      <Button size="sm" variant="ghost" className="w-fit" onClick={() => nav.irPara({ modulo: 'inicio', aba: 'time', integrante: integranteDoSetor('consultor') })}>
        Falar com o Consultor
      </Button>
    </div>
  )
}

function PerguntarBloco({ cliente }: { cliente: Cliente }) {
  const nav = useNavegacao()
  return (
    <div className="flex h-full flex-col justify-between gap-2">
      <p className="text-muted-foreground text-xs">Pergunte sobre a lei; o Consultor responde com o artigo, a data e o grau de segurança, com {cliente.nome} como contexto.</p>
      <Button size="sm" variant="secondary" className="w-fit rounded-full" onClick={() => nav.irPara({ modulo: 'inicio', aba: 'time', integrante: integranteDoSetor('consultor') })}>
        <ChatTeardropTextIcon /> Perguntar
      </Button>
    </div>
  )
}

function SegundaOpiniaoBloco({ cliente }: { cliente: Cliente }) {
  const { k } = useConsult(cliente)
  if (!k.segundaOpiniao.length) return <Vazio>Nenhuma tarefa de risco em revisão.</Vazio>
  return (
    <ul className="flex flex-col gap-2">
      {k.segundaOpiniao.map((s) => (
        <li key={s.id} className={cn('rounded-md px-3 py-2 text-sm', s.resultado === 'confere' ? 'bg-raised' : 'bg-warning/10')}>
          <span className="flex items-center gap-2">
            {s.resultado === 'confere' ? <CheckIcon weight="bold" className="text-success size-4" /> : <WarningIcon weight="fill" className="text-warning size-4" />}
            <span className="min-w-0 flex-1 truncate">{s.tarefa}</span>
            <Rotulo tom={s.resultado === 'confere' ? 'ok' : 'atencao'}>{s.resultado}</Rotulo>
          </span>
          <span className="text-muted-foreground block pl-6 text-xs">
            {s.nota}
            {s.citacao !== '—' ? ` · ${s.citacao}` : ''}
          </span>
        </li>
      ))}
    </ul>
  )
}

/* ---------- Resumo da CCT (S03-A51) ---------- */

function CctBloco({ cliente }: { cliente: Cliente }) {
  const { k, estado, atualizar } = useConsult(cliente)
  const loja = useLoja()
  const { usuario } = useSessao()
  const [lendo, setLendo] = useState(false)
  const cct = k.cct!
  const resumir = () => {
    setLendo(true)
    loja.iniciarTrabalho({ id: `s03-cct-${Date.now()}`, integrante: integranteDoSetor('consultor'), setor: 'consultor', titulo: `Resumo da CCT ${cct.sindicato}`, cliente: cliente.nome, inicio: 'Vou ler a convenção nova e separar o que muda no dia a dia.', etapas: ['Lendo as cláusulas', 'Comparando com a CCT anterior', 'Escrevendo os pontos para o DP'], seg: 1.2, fim: { texto: `Resumo da CCT ${cct.vigencia} pronto para revisão. Depois de revisado, publico na memória do DP.`, aviso: 'Resumo da CCT para revisar' } })
    window.setTimeout(() => (atualizar((x) => ({ ...x, cct: 'rascunho' })), setLendo(false)), 4200)
  }
  return (
    <div className="flex flex-col gap-2">
      <p className="text-muted-foreground text-xs">
        {cct.sindicato} · {cct.vigencia}
      </p>
      {estado.cct ? (
        <ul className="list-disc pl-4 text-sm">
          {cct.pontos.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      ) : lendo ? (
        <Carregando rotulo="Lendo a convenção" linhas={2} />
      ) : (
        <Vazio>CCT nova recebida em 12/11. Ainda sem resumo.</Vazio>
      )}
      <div className="flex flex-wrap gap-2">
        {!estado.cct && !lendo && (
          <BotaoNivel compacto nivel="preparar" ferramenta="consultoria.parecer.rascunhar" setor="consultor" variante="ghost" onClick={resumir}>
            Resumir CCT
          </BotaoNivel>
        )}
        {estado.cct === 'rascunho' && (
          <BotaoNivel compacto nivel="executar" ferramenta="consultoria.cct.publicar" onClick={() => (atualizar((x) => ({ ...x, cct: 'publicado' })), loja.registrar(usuario.nome, `Publicou o resumo da CCT ${cct.sindicato} na memória do DP · ${cliente.nome} (C2-04)`), loja.toast('Resumo publicado na memória do setor DP: o integrante do DP passa a usar.'))}>
            Publicar no DP
          </BotaoNivel>
        )}
        {estado.cct === 'publicado' && <Rotulo tom="ok">publicado na memória do DP</Rotulo>}
      </div>
    </div>
  )
}

/* ---------- Fase 4: planejamento (A50), reforma (A49), créditos, entrada e saída ---------- */

function PlanejamentoBloco({ cliente }: { cliente: Cliente }) {
  const { k, perfil, estado } = useConsult(cliente)
  const postar = usePostarS03()
  const atual = perfil.tipo === 'simples' || perfil.tipo === 'mei' ? 'Simples Nacional' : perfil.tipo === 'presumido' ? 'Lucro Presumido' : 'Lucro Real'
  const aplicaveis = k.regimes.filter((r) => r.aplicavel)
  const melhor = aplicaveis.length ? aplicaveis.reduce((a, b) => (b.imposto < a.imposto ? b : a)) : undefined
  const pend = estado.pendentes['estudo:planejamento']
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <SeloFase fase={4} />
        <span className="text-muted-foreground text-xs">Receita {brl0(perfil.receitaMensal * 12)}/ano · folha {brl0(perfil.folhaMensal * 13)}/ano (escrituração e folha)</span>
      </div>
      <Tabela colunas={[{ rotulo: 'Regime' }, { rotulo: 'Imposto no ano', direita: true }, { rotulo: 'Origem do número' }]} minimo={460}>
        {k.regimes.map((r) => (
          <tr key={r.regime} className={cn(r.regime === melhor?.regime && 'bg-success/5', !r.aplicavel && 'text-muted-foreground')}>
            <td className="py-1.5 pr-2">
              {r.regime}
              {r.regime === atual && <span className="text-muted-foreground text-xs"> · atual</span>}
            </td>
            <td className="py-1.5 pr-2 text-right tabular-nums">{r.aplicavel ? brl0(r.imposto) : '—'}</td>
            <td className="text-muted-foreground py-1.5 text-xs">{r.observacao}</td>
          </tr>
        ))}
      </Tabela>
      {melhor && melhor.regime !== atual && <p className="text-sm">Indicação (M3 números, M1 regra): avaliar {melhor.regime}, economia estimada de {brl0((k.regimes.find((r) => r.regime === atual)?.imposto ?? 0) - melhor.imposto)} no ano.</p>}
      {pend && <CartaoPendente id={pend} />}
      {estado.estudos.planejamento === 'enviado' ? (
        <Rotulo tom="ok">comparativo enviado ao cliente</Rotulo>
      ) : (
        !pend && (
          <BotaoNivel compacto nivel="executar com aprovação" ferramenta="consultoria.parecer.enviar" setor="consultor" className="w-fit" onClick={() => postar({ setor: 'consultor', acao: 'consultoria.estudo.enviar', cliente: { id: cliente.id, nome: cliente.nome }, chave: 'estudo:planejamento', texto: `Comparativo de regimes de ${cliente.nome} pronto, com a origem de cada número. Aprova o envio?`, resumo: `Enviar comparativo de regimes · ${cliente.nome}`, argumentos: k.regimes.filter((r) => r.aplicavel).map((r) => ({ rotulo: r.regime, valor: brl0(r.imposto) })), dados: { estudo: 'planejamento', titulo: 'Comparativo de regimes 2027' } })}>
            Enviar comparativo
          </BotaoNivel>
        )
      )}
    </div>
  )
}

function ReformaBloco({ cliente, tamanho }: { cliente: Cliente; tamanho: TamanhoWidget }) {
  const { perfil, estado } = useConsult(cliente)
  const postar = usePostarS03()
  const [margem, setMargem] = useState<'0.2' | '0.3' | '0.45'>('0.3')
  const [ano, setAno] = useState(2027)
  const [oficial, setOficial] = useState<{ total: number; fonte: string } | null>(null)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const cen = cenariosReforma(perfil, Number(margem))
  const simular = (a: number) => {
    setAno(a)
    setCarregando(true)
    setErro(null)
    servicos.calculadoraReforma
      .simular({ receitaAnual: perfil.receitaMensal * 12, ano: a, regime: perfil.tipo })
      .then((r) => setOficial({ total: r.dados.total, fonte: r.fonte }))
      .catch((e: Error) => setErro(e.message))
      .finally(() => setCarregando(false))
  }
  const linha = cen.find((c) => c.ano === ano)!
  const novoSo = linha ? Math.round(perfil.receitaMensal * 12 * (linha.cbs + linha.ibs)) : 0
  const pend = estado.pendentes['estudo:reforma']
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <SeloFase fase={4} />
        <span className="text-muted-foreground text-xs">Margem de valor agregado</span>
        <Segmentado rotulo="Margem" valor={margem} onMudar={setMargem} opcoes={[{ valor: '0.2', rotulo: '20%' }, { valor: '0.3', rotulo: '30%' }, { valor: '0.45', rotulo: '45%' }]} />
      </div>
      <Tabela colunas={[{ rotulo: 'Ano' }, { rotulo: 'CBS' }, { rotulo: 'IBS' }, { rotulo: 'Carga estimada', direita: true }, { rotulo: 'Hoje', direita: true }, { rotulo: '' }]} minimo={520}>
        {cen.slice(0, tamanho === 'G' ? 4 : 8).map((c) => (
          <tr key={c.ano} className={cn(c.ano === ano && 'bg-sunken/60')}>
            <td className="py-1 pr-2 tabular-nums">{c.ano}</td>
            <td className="py-1 pr-2 tabular-nums">{pct(c.cbs)}</td>
            <td className="py-1 pr-2 tabular-nums">{pct(c.ibs)}</td>
            <td className={cn('py-1 pr-2 text-right tabular-nums', c.carga > c.atual && 'text-warning-text')}>{brl0(c.carga)}</td>
            <td className="text-muted-foreground py-1 pr-2 text-right tabular-nums">{brl0(c.atual)}</td>
            <td className="py-1 text-right">
              <BotaoNivel compacto nivel="executar" ferramenta="consultoria.simular" setor="consultor" variante="ghost" className="h-6 px-2 text-xs" onClick={() => simular(c.ano)}>
                Calculadora
              </BotaoNivel>
            </td>
          </tr>
        ))}
      </Tabela>
      {carregando && <Carregando rotulo="Consultando a calculadora oficial" linhas={1} />}
      {erro && <EstadoErro className="py-2" descricao={erro} onTentar={() => simular(ano)} />}
      {oficial && !carregando && (
        <p className="flex flex-wrap items-center gap-2 text-xs">
          {ano}: CBS + IBS pela calculadora {brl0(oficial.total)} × nosso cálculo {brl0(novoSo)} · divergência {pct(novoSo ? Math.abs(oficial.total - novoSo) / novoSo : 0)} <SeloDemonstracao fonte={oficial.fonte} />
        </p>
      )}
      {pend && <CartaoPendente id={pend} />}
      {estado.estudos.reforma !== 'enviado' && !pend && (
        <BotaoNivel compacto nivel="executar com aprovação" ferramenta="consultoria.parecer.enviar" setor="consultor" variante="ghost" className="w-fit" onClick={() => postar({ setor: 'consultor', acao: 'consultoria.estudo.enviar', cliente: { id: cliente.id, nome: cliente.nome }, chave: 'estudo:reforma', texto: `Diagnóstico da reforma de ${cliente.nome}, de 2026 a 2033, com margem de ${Number(margem) * 100}%. Aprova o envio?`, resumo: `Enviar diagnóstico da reforma · ${cliente.nome}`, argumentos: [{ rotulo: 'Carga 2027', valor: brl0(cen[1].carga) }, { rotulo: 'Carga 2033', valor: brl0(cen[7].carga) }], dados: { estudo: 'reforma', titulo: 'Diagnóstico da reforma tributária' } })}>
          Gerar relatório
        </BotaoNivel>
      )}
      {estado.estudos.reforma === 'enviado' && <Rotulo tom="ok">diagnóstico enviado</Rotulo>}
    </div>
  )
}

function RecuperacaoBloco({ cliente }: { cliente: Cliente }) {
  const { k } = useConsult(cliente)
  const fluxos = useFluxos()
  if (!k.creditos.length) return <Vazio>Nenhuma oportunidade de recuperação levantada para este cliente.</Vazio>
  return (
    <ul className="flex flex-col gap-2">
      {k.creditos.map((c) => (
        <li key={c.id} className="flex items-center gap-2 text-sm">
          <span className="min-w-0 flex-1">
            <span className="block truncate">{c.oportunidade}</span>
            <span className="text-muted-foreground block text-xs">
              até {brl0(c.valor)} (5 anos) · {c.etapa}
            </span>
          </span>
          <SeloFase fase={4} />
          <Button size="sm" variant="ghost" onClick={() => fluxos.preparar({ cliente: cliente.nome, setor: 'consultor', documento: `Levantamento: ${c.oportunidade}` })}>
            Preparar
          </Button>
        </li>
      ))}
    </ul>
  )
}

function EntradaSaidaBloco({ cliente }: { cliente: Cliente }) {
  const fluxos = useFluxos()
  const itens = [
    { nome: 'Diagnóstico de entrada (transição de contador)', fase: 4, cod: 'CON-101' },
    { nome: 'Diagnóstico de abertura', fase: 4, cod: 'CON-102' },
    { nome: 'Diagnóstico no desligamento', fase: 4, cod: 'CON-104' },
    { nome: 'Pré-venda e consultoria recorrente', fase: 4, cod: 'CON-301' },
    { nome: 'Consultoria financeira', fase: 5, cod: 'CON-401' },
  ]
  return (
    <ul className="flex flex-col gap-1.5">
      {itens.map((i) => (
        <li key={i.cod} className="flex items-center gap-2 text-sm">
          <BookBookmarkIcon className="text-muted-foreground size-4 shrink-0" />
          <span className="min-w-0 flex-1 truncate">{i.nome}</span>
          <SeloFase fase={i.fase} />
          <Button size="sm" variant="ghost" onClick={() => fluxos.preparar({ cliente: cliente.nome, setor: 'consultor', documento: `${i.cod} · ${i.nome}` })}>
            Preparar
          </Button>
        </li>
      ))}
    </ul>
  )
}

/* ---------- Carteira ---------- */

function CarteiraConsultoria() {
  const loja = useLoja()
  const clientes = loja.clientes.filter((c) => !c.servicos || c.servicos.includes('contabil'))
  const [filtro, setFiltro] = usePersistente<string[]>('s03:consultoria:filtro', [])
  const linhas = clientes.map((c) => {
    const k = consultoriaS03(perfilS03(c))
    const e = lerEstado(loja, chaveConsultoria(c.id), consultoriaVazio)
    const qs = [...e.novas, ...k.perguntas].map((q) => ({ ...q, ...e.perguntas[q.id] }))
    return { c, qs, avisos: k.vigilancia.filter((v) => v.nivel === 'atencao').length }
  })
  const status: PerguntaS03['status'][] = ['nova', 'rascunho pronto', 'revisada', 'enviada']
  return (
    <div className="flex flex-col gap-2">
      <Fichas rotulo="Filtrar por status" valores={filtro} onMudar={setFiltro} opcoes={status.map((s) => ({ valor: s, rotulo: s }))} />
      <Tabela colunas={[{ rotulo: 'Cliente' }, { rotulo: 'Perguntas', direita: true }, { rotulo: 'Rascunhos a revisar', direita: true }, { rotulo: 'Fora do escopo', direita: true }, { rotulo: 'Avisos', direita: true }]} minimo={520}>
        {linhas.map(({ c, qs, avisos }) => {
          const f = filtro.length ? qs.filter((q) => filtro.includes(q.status)) : qs.filter((q) => q.status !== 'enviada')
          return (
            <tr key={c.id}>
              <td className="py-1.5 pr-2">{c.nome}</td>
              <td className={cn('py-1.5 pr-2 text-right tabular-nums', f.length > 0 && 'font-medium')}>{f.length || '·'}</td>
              <td className="py-1.5 pr-2 text-right tabular-nums">{qs.filter((q) => q.status === 'rascunho pronto').length || '·'}</td>
              <td className="py-1.5 pr-2 text-right tabular-nums">{qs.filter((q) => q.escopo === 'fora').length || '·'}</td>
              <td className="py-1.5 text-right tabular-nums">{avisos || '·'}</td>
            </tr>
          )
        })}
      </Tabela>
    </div>
  )
}

function AvulsosCarteira() {
  const [avulsos] = usePersistente<{ id: string; cliente: string; assunto: string; quando: string; por: string }[]>('s03:avulsos', [])
  const nav = useNavegacao()
  if (!avulsos.length) return <Vazio>Nenhuma pergunta marcada fora do escopo ainda.</Vazio>
  return (
    <div className="flex flex-col gap-2">
      <ul className="divide-border/70 flex flex-col divide-y">
        {avulsos.map((a) => (
          <Linha key={a.id} titulo={a.assunto} detalhe={`${a.cliente} · ${a.quando} · ${a.por}`} />
        ))}
      </ul>
      <Button size="sm" variant="ghost" className="w-fit" onClick={() => nav.irPara({ modulo: 'financeiro', aba: 'contratos' })}>
        Propor no Financeiro
      </Button>
    </div>
  )
}

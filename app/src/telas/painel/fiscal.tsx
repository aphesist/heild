import {
  BankIcon,
  CalculatorIcon,
  ChartLineUpIcon,
  ChatTextIcon,
  CheckIcon,
  CoinsIcon,
  EnvelopeOpenIcon,
  EnvelopeSimpleIcon,
  FileMagnifyingGlassIcon,
  GavelIcon,
  IdentificationCardIcon,
  ListMagnifyingGlassIcon,
  LockSimpleIcon,
  ReceiptIcon,
  ScalesIcon,
  SealCheckIcon,
  SparkleIcon,
  StackIcon,
  UserFocusIcon,
  WarningIcon,
} from '@phosphor-icons/react'
import { useState, type ReactNode } from 'react'
import { useFluxos } from '@/ambiente/fluxos'
import { useLoja } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import { MedidorSublimite } from '@/components/compostos/painel-aba'
import { Carregando, EstadoErro, SeloDemonstracao, useConfirmar, usePode } from '@/components/kit'
import { Button } from '@/components/ui/button'
import { Campo, CampoArea, GavetaFormulario, Passos } from '@/components/ui/formulario'
import type { DefWidget, TamanhoWidget } from '@/components/widgets/tipos'
import { brl, brl0, COMPETENCIA, ddmm, diasAte, fiscalS03, HOJE, pct, perfilS03, somarDias, type DeclaracaoS03, type GuiaS03 } from '@/dados/painel-s03'
import type { Cliente } from '@/dados/tipos'
import { cn } from '@/lib/utils'
import { servicos } from '@/servicos'
import { widgetObrigacoesDoSetor } from './obrigacoes-setor'
import { Aprendizado, CartaoPendente, useConversaS03, usePostarS03 } from './s03/cartoes'
import { chaveFiscal, fiscalVazio, hojeCurto, lerEstado, useDadosS03, useEstadoFiscal, type EstadoFiscal } from './s03/estado'
import { BotaoNivel, Rotulo, SaudeConectores, SeloFase, useConectorParado, Vazio } from './s03/pecas'
import { PedirAoIntegrante, type SugestaoPedido } from './s03/pedir'
import { Linha, Tabela } from './Tabela'
import type { CtxAba, WidgetsAba } from './tipos'

/**
 * Fiscal (03, 6.4; mapa S03-T01): cada obrigação do mês conferida, transmitida
 * e com recibo; caixas postais lidas antes do prazo; guias entregues e
 * pagamento confirmado. Os blocos mudam com o regime (Simples, MEI,
 * Presumido/Real, pessoa física) e os números são do cliente selecionado.
 */
export function widgetsFiscal(ctx: CtxAba): WidgetsAba {
  const { cliente } = ctx
  if (!cliente)
    return {
      catalogo: [
        widgetObrigacoesDoSetor('fiscal', ctx),
        w('carteira-fiscal', 'Visão do integrante na carteira', 'FIS-009, 019, 031', 'PGDAS-D e DCTFWeb prontos, de fora e transmitidos; transmitir em lote', StackIcon, ['XL'], () => <CarteiraFiscal />),
        w('guias', 'Guias da carteira', 'FIS-031, 032, 034', 'Enviadas, lidas, pagas e vencidas por cliente', ReceiptIcon, ['M', 'G', 'XL'], (t) => <GuiasCarteira tamanho={t} />),
        w('caixas', 'Caixas postais da carteira', 'FIS-005, 026, 029', 'Mensagens não abertas e o prazo de ciência de cada uma', EnvelopeSimpleIcon, ['P', 'G', 'XL'], (t) => <CaixasCarteira tamanho={t} />),
        w('irpf-carteira', 'Campanha do IRPF', 'PF-003 a 009', 'Clientes pessoa física: coleta pelo app e etapas', IdentificationCardIcon, ['M', 'G'], () => <CampanhaCarteira />),
        w('pedir', 'Pedir ao Fiscal', 'S03-A18', 'O integrante faz para a carteira e devolve no chat', SparkleIcon, ['M', 'G'], () => <PedirAoIntegrante setor="fiscal" sugestoes={sugestoesFiscal} />),
      ],
    }
  const p = perfilS03(cliente)
  const ws: DefWidget[] = [widgetObrigacoesDoSetor('fiscal', ctx)]
  const c = (id: string, ...r: Parameters<typeof w> extends [string, ...infer R] ? R : never) => ws.push(w(id, ...r))
  if (p.tipo === 'simples') c('simples', 'Simples Nacional', 'FIS-009 a 013', 'Receita segregada, PGDAS-D, DAS, sublimite e fator R', ChartLineUpIcon, ['M', 'G', 'XL'], (t) => <SimplesBloco cliente={cliente} tamanho={t} />)
  if (p.tipo === 'mei') c('mei', 'MEI', 'FIS-016, 017, 018', 'DAS-MEI, DASN-SIMEI e o limite pelas notas', ChartLineUpIcon, ['M', 'G'], (t) => <MeiBloco cliente={cliente} tamanho={t} />)
  if (p.tipo === 'pf') {
    c('irpf', 'IRPF', 'PF-003 a 017', 'Declaração do ano, campanha, malha e retificação', IdentificationCardIcon, ['G', 'XL'], () => <IrpfBloco cliente={cliente} />)
    c('carne-leao', 'Carnê-leão e Receita Saúde', 'PF-010, 011, 022', 'Rendimentos do mês, deduções e imposto; ganho de capital e cripto', CoinsIcon, ['M', 'G', 'XL'], (t) => <CarneLeaoBloco cliente={cliente} tamanho={t} />)
  }
  c('caixas', 'Caixas postais', 'FIS-005, 026, 029', 'e-CAC, DTE e DEC: resumo sem abrir, prazo de ciência e tarefa', EnvelopeSimpleIcon, ['P', 'G', 'XL'], (t) => <CaixasBloco cliente={cliente} tamanho={t} />)
  c('situacao', 'Situação fiscal', 'FIS-006, 027, 030, 008', 'RFB/PGFN, estado e município: atual × anterior', ScalesIcon, ['M', 'G'], (t) => <SituacaoBloco cliente={cliente} tamanho={t} />)
  if (p.tipo !== 'pf') c('declaracoes', 'Declarações do mês', 'FIS-004, 009, 019, 020', 'Prontas, de fora e transmitidas com recibo', FileMagnifyingGlassIcon, ['G', 'XL'], () => <DeclaracoesBloco cliente={cliente} />)
  if (p.tipo === 'presumido' || p.tipo === 'real') c('apuracoes', 'DCTFWeb, Reinf, federais, estaduais e municipais', 'FIS-019 a 022, 025, 028', 'Totalizadores, divergências, retenções e guias por esfera', BankIcon, ['G', 'XL'], (t) => <ApuracoesBloco cliente={cliente} tamanho={t} />)
  c('conferencia', 'Conferência e reforma', 'FIS-004, 045', 'Notas × apuração × folha × extrato; CBS e IBS destacados', ListMagnifyingGlassIcon, ['M', 'G'], (t) => <ConferenciaBloco cliente={cliente} tamanho={t} />)
  c('guias', 'Central de guias', 'FIS-031, 032, 201', 'Enviada, lida e paga; recálculo; eventuais (D-23) e licença (C2-22)', ReceiptIcon, ['M', 'XL'], (t) => <GuiasBloco cliente={cliente} tamanho={t} />)
  c('parcelamentos', 'Parcelamentos', 'FIS-034', 'Parcelas, atrasos e risco de exclusão', CalculatorIcon, ['P', 'M'], (t) => <ParcelamentosBloco cliente={cliente} tamanho={t} />)
  c('certidoes', 'Certidões, malhas e intimações', 'FIS-036 a 040', 'Validade, causa da positiva, intimações com prazo e resposta', SealCheckIcon, ['M', 'G', 'XL'], (t) => <CertidoesBloco cliente={cliente} tamanho={t} />)
  if (p.tipo === 'presumido' || p.tipo === 'real') c('reinf', 'Trava do REINF', 'D-15', 'Trimestres enviados ficam travados; o que chega depois é complementar', LockSimpleIcon, ['M', 'G'], (t) => <ReinfBloco cliente={cliente} tamanho={t} />)
  c('comunicacao', 'Comunicação', 'FIS-033, 044', 'Resumo do mês ao cliente e respostas recorrentes', ChatTextIcon, ['M', 'G'], (t) => <ComunicacaoBloco cliente={cliente} tamanho={t} />)
  if (p.tipo !== 'pf' && p.tipo !== 'mei') c('creditos', 'Créditos e fase 4', 'FIS-014, 015, 035, 041 a 043', 'PER/DCOMP, simulação de parcelamento (C2-18), reforma no Simples', CoinsIcon, ['M', 'G'], () => <CreditosBloco cliente={cliente} />)
  c('pedir', 'Pedir ao Fiscal', 'S03-A18', 'O integrante faz e devolve no chat', SparkleIcon, ['M', 'G'], () => <PedirAoIntegrante setor="fiscal" cliente={cliente.nome} sugestoes={sugestoesFiscal} />)
  return { catalogo: ws }
}

function w(id: string, titulo: string, atividades: string, descricao: string, icone: DefWidget['icone'], tamanhos: TamanhoWidget[], conteudo: (t: TamanhoWidget) => ReactNode, acao?: ReactNode): DefWidget {
  return { id, titulo, atividades, descricao, icone, tamanhos, conteudo, acao }
}

const sugestoesFiscal: SugestaoPedido[] = [
  { rotulo: 'Conferir as retenções de outubro', etapas: ['Lendo as notas tomadas com retenção', 'Comparando com o R-2010 e o R-4020', 'Separando as divergências'], fim: 'Conferi as retenções de outubro: batem com a Reinf. Se aparecer nota nova, aviso.' },
  { rotulo: 'Ler as caixas postais agora', etapas: ['Consultando e-CAC (sem abrir)', 'Consultando DTE e DEC', 'Classificando e calculando a ciência tácita'], fim: 'Li as caixas postais sem dar ciência. O que tem prazo já está na aba, com a data.' },
  { rotulo: 'Preparar as guias do mês', etapas: ['Somando a apuração', 'Gerando as guias (Sicalc)', 'Separando as eventuais sem imposto (D-23)'], fim: 'Guias do mês preparadas. Ficam na central de guias para enviar.' },
  { rotulo: 'Emitir as certidões vencendo', etapas: ['Listando as que vencem em 30 dias', 'Emitindo nos órgãos', 'Guardando na pasta do cliente'], fim: 'Certidões renovadas e guardadas. Nenhuma positiva nova.' },
]

/* ---------- utilidades da aba ---------- */

function useFiscal(cliente: Cliente) {
  const dados = useDadosS03(cliente)
  const [estado, atualizar] = useEstadoFiscal(cliente.id)
  return { ...dados, f: dados.fiscal, estado, atualizar }
}

const guiaAtual = (g: GuiaS03, e: EstadoFiscal) => ({ ...g, ...e.guias[g.id] })
const cienciaTacita = (recebida: string) => somarDias(recebida, 10)

function Erro({ texto, onTentar }: { texto: string; onTentar: () => void }) {
  return <EstadoErro className="py-3" titulo="O serviço não respondeu" descricao={texto} onTentar={onTentar} />
}

/* ---------- Simples, MEI ---------- */

function SimplesBloco({ cliente, tamanho }: { cliente: Cliente; tamanho: TamanhoWidget }) {
  const { f, estado } = useFiscal(cliente)
  const s = f.simples!
  const decl = f.declaracoes.find((d) => d.nome === 'PGDAS-D')!
  const transmitida = estado.transmitidas[decl.id]
  return (
    <div className="flex h-full flex-col gap-3">
      <MedidorSublimite rotulo="Receita 12 meses × sublimite" usado={s.rbt12} teto={3_600_000} semAviso={tamanho === 'M'} />
      {tamanho !== 'M' && (
        <dl className="grid grid-cols-2 gap-2 text-sm @md:grid-cols-3">
          <Dado rotulo="Fator R" valor={pct(s.fatorR)} detalhe={s.anexo === 'III' || s.anexo === 'V' ? `Anexo ${s.anexo}${s.fatorR >= 0.28 ? ' (≥ 28%)' : ' (< 28%)'}` : 'não se aplica'} />
          <Dado rotulo="Alíquota efetiva" valor={pct(s.aliquota.efetiva, 2)} detalhe={`${s.aliquota.faixa}ª faixa · Anexo ${s.anexo}`} />
          <Dado rotulo={`DAS ${COMPETENCIA}`} valor={brl(s.das)} detalhe="vence 20/11" />
        </dl>
      )}
      {tamanho === 'XL' && (
        <Tabela colunas={[{ rotulo: 'Receita segregada (S03-A05)' }, { rotulo: 'Anexo' }, { rotulo: 'Valor', direita: true }, { rotulo: 'Origem do número' }]} minimo={520}>
          {s.segregacao.map((x) => (
            <tr key={x.rotulo}>
              <td className="py-1.5 pr-2">{x.rotulo}</td>
              <td className="py-1.5 pr-2">{x.anexo}</td>
              <td className="py-1.5 pr-2 text-right tabular-nums">{brl(x.receita)}</td>
              <td className="text-muted-foreground py-1.5 text-xs">{x.origem}</td>
            </tr>
          ))}
          <tr>
            <td colSpan={4} className="text-muted-foreground py-1.5 text-xs">
              Alíquota efetiva = (RBT12 {brl0(s.rbt12)} × {pct(s.aliquota.nominal)} − {brl0(s.aliquota.deduzir)}) ÷ RBT12 · LC 123/2006, art. 18
            </td>
          </tr>
        </Tabela>
      )}
      <div className="mt-auto flex flex-wrap items-center gap-2 text-xs">
        {transmitida ? (
          <Rotulo tom="ok">
            <CheckIcon weight="bold" className="text-success size-3" /> PGDAS-D transmitido · recibo {transmitida.recibo}
          </Rotulo>
        ) : (
          <span className="text-muted-foreground">PGDAS-D {COMPETENCIA}: {s.parado ? `parado: ${s.parado}` : estado.conferido ? 'conferido, pronto para transmitir' : 'preparado, aguardando a conferência (FIS-004)'}</span>
        )}
      </div>
    </div>
  )
}

function Dado({ rotulo, valor, detalhe }: { rotulo: string; valor: ReactNode; detalhe?: string }) {
  return (
    <div className="bg-raised min-w-0 rounded-[12px] px-3 py-2">
      <dt className="text-muted-foreground truncate text-[11px]">{rotulo}</dt>
      <dd className="truncate font-medium tabular-nums">{valor}</dd>
      {detalhe && <dd className="text-muted-foreground truncate text-[11px]">{detalhe}</dd>}
    </div>
  )
}

function MeiBloco({ cliente, tamanho }: { cliente: Cliente; tamanho: TamanhoWidget }) {
  const { f } = useFiscal(cliente)
  const m = f.mei!
  const pctUso = m.faturadoAno / m.limite
  return (
    <div className="flex h-full flex-col gap-3">
      <MedidorSublimite rotulo="Faturado no ano (pelas notas) × limite do MEI" usado={m.faturadoAno} teto={m.limite} semAviso={tamanho === 'M'} />
      {tamanho !== 'M' && (
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <Dado rotulo="DAS-MEI 10/2026" valor={brl(m.das)} detalhe="valor fixo · vence 20/11" />
          <Dado rotulo="DASN-SIMEI 2025" valor="entregue" detalhe={m.dasn} />
          <Dado rotulo="Notas no mês" valor={m.notasMes} detalhe="capturadas pela NFS-e Nacional" />
          <Dado rotulo="Empregado" valor={m.empregado ? '1 (o máximo)' : 'nenhum'} detalhe="MEI pode ter 1" />
        </dl>
      )}
      <p className="text-muted-foreground mt-auto text-xs">
        {pctUso > 0.8 ? 'Acima de 80% do limite: o Consultor avisa antes do desenquadramento (passar de 20% obriga recolher como ME desde janeiro).' : 'Dentro do limite com folga.'}
      </p>
    </div>
  )
}

/* ---------- Caixas postais (S03-A01, A02) ---------- */

function CaixasBloco({ cliente, tamanho }: { cliente: Cliente; tamanho: TamanhoWidget }) {
  const { f: f0, estado } = useFiscal(cliente)
  const f = { ...f0, caixas: [...estado.caixasExtras, ...f0.caixas] }
  const postar = usePostarS03()
  const [aberta, setAberta] = useState<string | null>(null)
  const parado = useConectorParado('integra_contador')
  const novas = f.caixas.filter((m) => !estado.abertas[m.id])
  if (tamanho === 'P')
    return (
      <div className="flex h-full flex-col justify-end">
        <span className={cn('font-heading text-4xl font-light tabular-nums', novas.length && 'text-warning')}>{novas.length}</span>
        <span className="text-muted-foreground text-xs">{novas.length === 1 ? 'mensagem não aberta' : 'mensagens não abertas'}</span>
      </div>
    )
  return (
    <div className="flex flex-col gap-2">
      <SaudeConectores ids={['integra_contador', 'dte_estadual']} />
      <p className="text-muted-foreground text-[11px]">Lidas pelo Fiscal hoje às 06:00 (rotina diária). Listar e resumir nunca dá ciência.</p>
      {!f.caixas.length && <Vazio>Nenhuma mensagem nova nas caixas postais.</Vazio>}
      <ul className="flex flex-col gap-2">
        {f.caixas.map((m) => {
          const ciencia = estado.abertas[m.id]
          const tacita = cienciaTacita(m.recebida)
          const dias = diasAte(tacita)
          const pend = estado.pendentes[`abrir:${m.id}`]
          return (
            <li key={m.id} className="bg-raised flex flex-col gap-1.5 rounded-[14px] px-3 py-2.5">
              <button type="button" className="flex cursor-pointer items-start gap-3 text-left" onClick={() => setAberta(aberta === m.id ? null : m.id)} aria-expanded={aberta === m.id}>
                {ciencia ? <EnvelopeOpenIcon weight="duotone" className="text-muted-foreground mt-0.5 size-5 shrink-0" /> : <EnvelopeSimpleIcon weight="duotone" className="mt-0.5 size-5 shrink-0" />}
                <span className="min-w-0 flex-1">
                  <span className="block text-sm">{m.assunto}</span>
                  <span className="text-muted-foreground block text-xs">
                    {m.orgao} · recebida {ddmm(m.recebida)} · {ciencia ? `aberta em ${ddmm(ciencia)} (ciência dada)` : dias >= 0 ? `ciência tácita em ${ddmm(tacita)} (${dias} ${dias === 1 ? 'dia' : 'dias'})` : `ciência tácita em ${ddmm(tacita)}`}
                  </span>
                </span>
                <Rotulo tom={m.classificacao === 'informativo' || m.classificacao === 'comunicado' ? 'neutro' : 'atencao'}>{m.classificacao}</Rotulo>
              </button>
              {aberta === m.id && (
                <div className="flex flex-col gap-2 pl-8 text-sm">
                  <p>
                    <span className="text-muted-foreground text-xs">Resumo do Fiscal (sem abrir): </span>
                    {m.resumo}
                  </p>
                  {ciencia ? (
                    <p className="bg-sunken rounded-[10px] px-3 py-2 text-xs leading-relaxed">
                      <span className="text-muted-foreground block">Teor completo</span>
                      {m.teor}
                    </p>
                  ) : pend ? null : (
                    <div className="flex flex-wrap items-center gap-2">
                      <BotaoNivel
                        nivel="executar com aprovação"
                        ferramenta="fiscal.caixa_postal.abrir"
                        setor="fiscal"
                        falta={parado}
                        onClick={() =>
                          postar({
                            setor: 'fiscal',
                            acao: 'fiscal.caixa.abrir',
                            cliente: { id: cliente.id, nome: cliente.nome },
                            chave: `abrir:${m.id}`,
                            texto: `Abrir “${m.assunto}” dá ciência hoje e começa o prazo. Confere antes de eu abrir.`,
                            resumo: `Abrir mensagem ${m.orgao} · ${cliente.nome}`,
                            argumentos: [
                              { rotulo: 'Abrir hoje', valor: `ciência em ${ddmm(HOJE)}; prazo de resposta ${m.prazoResposta ? `até ${ddmm(somarDias(HOJE, m.prazoResposta))}` : 'conforme o teor'}` },
                              { rotulo: 'Sem abrir', valor: `ciência tácita em ${ddmm(tacita)}` },
                              { rotulo: 'Classificação', valor: m.classificacao },
                            ],
                            expira: `expira em ${ddmm(somarDias(tacita, -1))}`,
                            dados: { msgId: m.id, assunto: m.assunto, orgao: m.orgao, classificacao: m.classificacao, prazoResposta: m.prazoResposta },
                          })
                        }
                      >
                        Abrir mensagem (dá ciência)
                      </BotaoNivel>
                    </div>
                  )}
                </div>
              )}
              {pend && !ciencia && <CartaoPendente id={pend} className="pl-8" />}
            </li>
          )
        })}
      </ul>
      <Aprendizado acao="fiscal.caixa.abrir" />
    </div>
  )
}

/* ---------- Situação fiscal (S03-A03, A04) ---------- */

function SituacaoBloco({ cliente, tamanho }: { cliente: Cliente; tamanho: TamanhoWidget }) {
  const { f, estado, atualizar } = useFiscal(cliente)
  const loja = useLoja()
  const fluxos = useFluxos()
  const { usuario } = useSessao()
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [fonte, setFonte] = useState<string | null>(null)
  const gerar = () => {
    setCarregando(true)
    setErro(null)
    servicos.integraContador
      .situacaoFiscal(cliente.documento)
      .then((r) => {
        setFonte(r.fonte)
        atualizar((x) => ({ ...x, situacaoEm: hojeCurto() }))
        loja.registrar(usuario.nome, `Gerou a situação fiscal de ${cliente.nome} (FIS-006, ${r.fonte}, demonstração)`)
      })
      .catch((e: Error) => setErro(e.message))
      .finally(() => setCarregando(false))
  }
  const regularizar = (orgao: string, atual: string) => {
    const existente = estado.regularizacao[orgao]
    if (existente && loja.tarefas.some((t) => t.id === existente)) return fluxos.abrirTarefa(existente)
    const id = loja.criarTarefa({ codigo: 'FIS-008', titulo: `Regularizar ${orgao}: ${atual}`, cliente: cliente.nome, setor: 'fiscal', prazo: ddmm(somarDias(HOJE, 7)), status: 'a_fazer', responsavel: { tipo: 'pessoa', nome: usuario.nome } })
    atualizar((x) => ({ ...x, regularizacao: { ...x.regularizacao, [orgao]: id } }))
    loja.registrar(usuario.nome, `Abriu a regularização de ${orgao} · ${cliente.nome} (FIS-008)`)
    fluxos.abrirTarefa(id)
  }
  if (carregando) return <Carregando rotulo="Consultando RFB, PGFN, estado e município" linhas={3} />
  if (erro) return <Erro texto={erro} onTentar={gerar} />
  return (
    <div className="flex flex-col gap-2">
      <SaudeConectores ids={['integra_contador']} />
      <ul className="divide-border/70 flex flex-col divide-y">
        {f.situacao.slice(0, tamanho === 'M' ? 2 : 4).map((x) => (
          <Linha
            key={x.orgao}
            inicio={x.atual === 'regular' ? <CheckIcon weight="bold" className="text-success size-4 shrink-0" aria-label="regular" /> : <WarningIcon weight="fill" className="text-warning size-4 shrink-0" aria-label="atenção" />}
            titulo={x.orgao}
            detalhe={`${x.atual}${x.mudou ? ` · antes: ${x.anterior}` : ''}${x.termo ? ` · ${x.termo}` : ''}`}
            fim={
              x.atual !== 'regular' ? (
                <Button size="sm" variant="ghost" onClick={() => regularizar(x.orgao, x.atual)}>
                  {estado.regularizacao[x.orgao] ? 'Ver tarefa' : 'Regularizar'}
                </Button>
              ) : undefined
            }
          />
        ))}
      </ul>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <BotaoNivel compacto nivel="executar" ferramenta="fiscal.situacao.consultar" setor="fiscal" onClick={gerar}>
          Gerar agora
        </BotaoNivel>
        <span className="text-muted-foreground text-[11px]">{estado.situacaoEm ? `consultado ${estado.situacaoEm} · comparado com a consulta anterior` : 'última consulta hoje 06:10 (rotina)'}</span>
        {fonte && <SeloDemonstracao fonte={fonte} />}
      </div>
    </div>
  )
}

/* ---------- Declarações e transmissão (S03-A06, A16) ---------- */

function useTransmitir(cliente: Cliente) {
  const { estado } = useFiscal(cliente)
  const postar = usePostarS03()
  return (d: DeclaracaoS03) =>
    postar({
      setor: 'fiscal',
      acao: 'fiscal.transmitir',
      cliente: { id: cliente.id, nome: cliente.nome },
      chave: `transmitir:${d.id}`,
      texto: `Preparei o ${d.nome} ${d.competencia} de ${cliente.nome}${d.valor ? ` (${brl(d.valor)})` : ''}. A conferência está aprovada${estado.conferido ? ` por ${estado.conferido.por}` : ''}. Aprova para eu transmitir.`,
      resumo: `Transmitir ${d.nome} ${d.competencia} · ${cliente.nome}`,
      argumentos: [{ rotulo: 'Declaração', valor: `${d.nome} ${d.competencia}` }, ...(d.valor ? [{ rotulo: 'Valor apurado', valor: brl(d.valor) }] : []), { rotulo: 'Prazo legal', valor: ddmm(d.prazo) }, { rotulo: 'Conferência', valor: estado.conferido ? `aprovada por ${estado.conferido.por}` : '—' }],
      expira: `expira em ${ddmm(somarDias(d.prazo, -1))} (véspera do prazo)`,
      dados: { declId: d.id, nome: d.nome, competencia: d.competencia, valor: d.valor, documento: cliente.documento, atividade: d.nome === 'PGDAS-D' ? 'FIS-009' : d.nome === 'DCTFWeb' ? 'FIS-019' : d.nome === 'EFD-Reinf' ? 'FIS-020' : undefined },
    })
}

function DeclaracoesBloco({ cliente }: { cliente: Cliente }) {
  const { f, estado } = useFiscal(cliente)
  const transmitir = useTransmitir(cliente)
  const parado = useConectorParado('integra_contador')
  return (
    <div className="flex flex-col gap-2">
      <SaudeConectores ids={['integra_contador', 'reinf']} />
      <ul className="divide-border/70 flex flex-col divide-y">
        {f.declaracoes.map((d) => {
          const tx = estado.transmitidas[d.id]
          const recibo = tx?.recibo ?? d.recibo
          const pend = estado.pendentes[`transmitir:${d.id}`]
          const falha = estado.falhas[d.id]
          const falta = !estado.conferido && !recibo ? 'conferência FIS-004' : d.falta ?? parado
          return (
            <li key={d.id} className="flex flex-col gap-2 py-2 first:pt-0 last:pb-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="min-w-0 flex-1">
                  <span className="block text-sm">
                    {d.nome} <span className="text-muted-foreground">{d.competencia}</span>
                  </span>
                  <span className="text-muted-foreground block text-xs">
                    {d.valor ? `${brl(d.valor)} · ` : ''}prazo {ddmm(d.prazo)}
                    {recibo ? ` · recibo ${recibo}` : ''}
                    {tx ? ` · por ${tx.por} (${tx.quando})` : ''}
                  </span>
                </span>
                {recibo ? (
                  <Rotulo tom="ok">
                    <CheckIcon weight="bold" className="text-success size-3" /> transmitida
                  </Rotulo>
                ) : pend ? (
                  <Rotulo tom="atencao">cartão aguardando</Rotulo>
                ) : (
                  <BotaoNivel compacto nivel="executar com aprovação" ferramenta="fiscal.declaracao.transmitir" setor="fiscal" falta={falta} onClick={() => transmitir(d)}>
                    Transmitir
                  </BotaoNivel>
                )}
              </div>
              {falha && !recibo && <p className="text-destructive text-xs">Última tentativa falhou: {falha}. Peça de novo.</p>}
              {pend && !recibo && <CartaoPendente id={pend} />}
            </li>
          )
        })}
      </ul>
      <Aprendizado acao="fiscal.transmitir" />
    </div>
  )
}

/* ---------- Apurações (S03-A09, A10) ---------- */

function ApuracoesBloco({ cliente, tamanho }: { cliente: Cliente; tamanho: TamanhoWidget }) {
  const { f, estado, atualizar } = useFiscal(cliente)
  const loja = useLoja()
  const fluxos = useFluxos()
  const { usuario } = useSessao()
  const [gerando, setGerando] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const conferir = (grupo: string) => {
    const difs = f.federais.filter((x) => x.grupo === grupo && Math.abs(x.apurado - x.declarado) > 0.5)
    loja.iniciarTrabalho({
      id: `s03-conf-${grupo}-${Date.now()}`,
      integrante: 'i-fiscal',
      setor: 'fiscal',
      titulo: `Conferir ${grupo} ${COMPETENCIA}`,
      cliente: cliente.nome,
      inicio: `Vou conferir a ${grupo} de ${cliente.nome} contra a folha e as retenções.`,
      etapas: ['Lendo os totalizadores', grupo === 'Reinf' ? 'Cruzando com as notas tomadas' : 'Cruzando com o eSocial', 'Separando as divergências'],
      seg: 1.2,
      fim: difs.length
        ? { texto: `Encontrei ${difs.length} divergência(s) na ${grupo}: ${difs.map((x) => `${x.item} (${brl(x.apurado - x.declarado)})`).join('; ')}. Abri a tarefa para tratar antes de transmitir.`, tarefaNova: { codigo: grupo === 'Reinf' ? 'FIS-020' : 'FIS-019', titulo: `Tratar divergência na ${grupo} ${COMPETENCIA}`, cliente: cliente.nome, setor: 'fiscal', prazo: ddmm(somarDias(HOJE, 3)), status: 'a_fazer', responsavel: { tipo: 'integrante', nome: 'Fiscal' } }, aviso: `Divergência na ${grupo} de ${cliente.nome}` }
        : { texto: `A ${grupo} de ${cliente.nome} confere com a folha e as retenções. Pode seguir para transmitir.`, aviso: `${grupo} conferida: ${cliente.nome}` },
    })
    loja.toast(`O Fiscal começou a conferir a ${grupo}.`, { modulo: 'inicio', aba: 'time', integrante: 'i-fiscal' }, 'Acompanhar')
  }
  const gerarDarf = (item: string, valor: number) => {
    setGerando(item)
    setErro(null)
    servicos.integraContador
      .emitirGuia({ cnpj: cliente.documento, tributo: 'DARF', competencia: COMPETENCIA, valor })
      .then((r) => {
        atualizar((x) => ({ ...x, guiasNovas: [...x.guiasNovas, { id: `${cliente.id}:darf-${Date.now()}`, tributo: `DARF · ${item}`, competencia: COMPETENCIA, valor, vencimento: '2026-11-25', enviada: false, lida: false, paga: false }] }))
        loja.registrar(usuario.nome, `Gerou rascunho do DARF de ${item} · ${cliente.nome} (Sicalc, demonstração)`)
        loja.toast(`DARF de ${brl(valor)} gerado como rascunho (${r.fonte}, demonstração). Está na central de guias para enviar.`)
      })
      .catch((e: Error) => setErro(e.message))
      .finally(() => setGerando(null))
  }
  const grupos = ['DCTFWeb', 'Reinf', 'Federais', 'Estaduais', 'Municipais'] as const
  const visiveis = tamanho === 'G' ? f.federais.filter((x) => x.grupo === 'DCTFWeb' || x.grupo === 'Reinf') : f.federais
  return (
    <div className="flex flex-col gap-2">
      <SaudeConectores ids={['esocial', 'reinf', 'sefaz_sp', 'prefeitura_sp']} />
      {erro && <Erro texto={erro} onTentar={() => setErro(null)} />}
      <Tabela colunas={[{ rotulo: 'Item' }, { rotulo: 'Apurado', direita: true }, { rotulo: 'Declarado', direita: true }, { rotulo: '' }]} minimo={560}>
        {grupos.map((g) => {
          const linhas = visiveis.filter((x) => x.grupo === g)
          if (!linhas.length) return null
          return [
            <tr key={g}>
              <td colSpan={4} className="pt-2 pb-1">
                <span className="flex items-center gap-2">
                  <strong className="text-xs font-medium">{g}</strong>
                  {(g === 'DCTFWeb' || g === 'Reinf') && (
                    <BotaoNivel compacto nivel="preparar" ferramenta="fiscal.declaracao.preparar" setor="fiscal" variante="ghost" className="h-6 px-2 text-xs" onClick={() => conferir(g)}>
                      Conferir
                    </BotaoNivel>
                  )}
                </span>
              </td>
            </tr>,
            ...linhas.map((x) => {
              const dif = x.apurado - x.declarado
              return (
                <tr key={x.id} className={cn(Math.abs(dif) > 0.5 && 'bg-warning/5')}>
                  <td className="py-1.5 pr-2">
                    <div>{x.item}</div>
                    <div className="text-muted-foreground text-[11px]">{x.origem}</div>
                  </td>
                  <td className="py-1.5 pr-2 text-right tabular-nums">{brl(x.apurado)}</td>
                  <td className="py-1.5 pr-2 text-right tabular-nums">
                    {brl(x.declarado)}
                    {Math.abs(dif) > 0.5 && <div className="text-warning text-[11px]">diferença {brl(dif)}</div>}
                  </td>
                  <td className="py-1.5 text-right whitespace-nowrap">
                    {Math.abs(dif) > 0.5 ? (
                      <Button size="sm" variant="ghost" onClick={() => fluxos.novaTarefa({ cliente: cliente.nome, setor: 'fiscal', atividade: g === 'Reinf' ? 'FIS-020' : 'FIS-019', titulo: `Divergência: ${x.item}`, origem: 'integrante' })}>
                        Tarefa
                      </Button>
                    ) : x.apurado > 0 && (g === 'Federais' || g === 'DCTFWeb') ? (
                      <BotaoNivel compacto nivel="preparar" ferramenta="fiscal.guia.gerar" setor="fiscal" variante="ghost" onClick={() => gerarDarf(x.item, x.apurado)}>
                        {gerando === x.item ? 'Gerando…' : 'DARF'}
                      </BotaoNivel>
                    ) : null}
                  </td>
                </tr>
              )
            }),
          ]
        })}
      </Tabela>
      {estado.guiasNovas.length > 0 && <p className="text-muted-foreground text-xs">{estado.guiasNovas.length} rascunho(s) de guia na central.</p>}
    </div>
  )
}

/* ---------- Conferência e reforma (S03-A16) ---------- */

function ConferenciaBloco({ cliente, tamanho }: { cliente: Cliente; tamanho: TamanhoWidget }) {
  const { f, estado, atualizar } = useFiscal(cliente)
  const loja = useLoja()
  const { usuario } = useSessao()
  const confirmar = useConfirmar()
  const difs = f.cruzamentos.filter((x) => Math.abs(x.a - x.b) > 0.5)
  const aprovar = async () => {
    let motivo = ''
    if (difs.length) {
      const r = await confirmar({ titulo: `Aprovar com ${difs.length} diferença(s)?`, descricao: 'A conferência libera o transmitir. Diga por que as diferenças não impedem (fica no evento).', acao: 'Aprovar conferência', exigirMotivo: true, rotuloMotivo: 'Justificativa' })
      if (!r) return
      motivo = typeof r === 'string' ? r : ''
    }
    atualizar((x) => ({ ...x, conferido: { por: usuario.nome, quando: hojeCurto() } }))
    loja.registrar(usuario.nome, `Aprovou a conferência fiscal de ${COMPETENCIA} · ${cliente.nome} (FIS-004)${motivo ? ` · ${motivo}` : ''}`)
    loja.toast('Conferência aprovada: o transmitir foi liberado.')
  }
  return (
    <div className="flex h-full flex-col gap-2">
      <ul className="flex flex-col gap-1">
        {f.cruzamentos.slice(0, tamanho === 'M' ? 2 : 4).map((x) => {
          const dif = x.a - x.b
          return (
            <li key={x.id} className="flex items-center gap-2 text-sm">
              {Math.abs(dif) > 0.5 ? <WarningIcon weight="fill" className="text-warning size-4 shrink-0" aria-label="diferença" /> : <CheckIcon weight="bold" className="text-success size-4 shrink-0" aria-label="confere" />}
              <span className="min-w-0 flex-1 truncate">{x.rotulo}</span>
              <span className={cn('text-xs tabular-nums', Math.abs(dif) > 0.5 ? 'text-warning' : 'text-muted-foreground')}>{Math.abs(dif) > 0.5 ? `dif. ${brl(dif)}` : 'confere'}</span>
            </li>
          )
        })}
      </ul>
      {tamanho !== 'M' && f.reforma.base > 0 && (
        <div className="bg-raised rounded-[12px] px-3 py-2 text-xs">
          <span className="block text-sm">
            Reforma: CBS {brl(f.reforma.base * f.reforma.cbs)} · IBS {brl(f.reforma.base * f.reforma.ibs)} <span className="text-muted-foreground">destacados em {COMPETENCIA}</span>
          </span>
          <span className="text-muted-foreground">{f.reforma.nota}</span>
        </div>
      )}
      <div className="mt-auto flex flex-wrap items-center gap-2">
        {estado.conferido ? (
          <Rotulo tom="ok">
            <CheckIcon weight="bold" className="text-success size-3" /> aprovada por {estado.conferido.por} · {estado.conferido.quando}
          </Rotulo>
        ) : (
          <BotaoNivel compacto nivel="executar" ferramenta="fiscal.conferencia.aprovar" setor="fiscal" onClick={aprovar}>
            Aprovar conferência
          </BotaoNivel>
        )}
        {estado.conferido && (
          <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => (atualizar((x) => ({ ...x, conferido: undefined })), loja.registrar(usuario.nome, `Desfez a conferência fiscal · ${cliente.nome}`))}>
            Desfazer
          </Button>
        )}
      </div>
    </div>
  )
}

/* ---------- Central de guias (S03-A08, A11, A12) ---------- */

function GuiasBloco({ cliente, tamanho }: { cliente: Cliente; tamanho: TamanhoWidget }) {
  const { f, estado, atualizar } = useFiscal(cliente)
  const loja = useLoja()
  const { usuario } = useSessao()
  const postar = usePostarS03()
  const conversa = useConversaS03()
  const podeEnviar = usePode('fiscal.guia.enviar', { setor_id: 'fiscal' })
  const [recalc, setRecalc] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const guias = [...f.guias, ...estado.guiasNovas].map((g) => guiaAtual(g, estado))
  const comImposto = guias.filter((g) => g.valor > 0)
  const naoEnviadas = comImposto.filter((g) => !g.enviada)
  const enviarDireto = (g: GuiaS03) => {
    // DAS e DAS-MEI: FIS-010 foi promovida para "faz sozinho" (Configurações › Integrantes).
    atualizar((x) => ({ ...x, guias: { ...x.guias, [g.id]: { ...x.guias[g.id], enviada: true } } }))
    const cv = conversa(cliente, 'fiscal')
    loja.mensagemCrm(cv, { tipo: 'mensagem', de: 'integrante', autor: 'Fiscal', setor: 'fiscal', canal: 'whatsapp', texto: `Oi! Segue o ${g.tributo} de ${g.competencia}: ${brl(g.valor)}, vence em ${ddmm(g.vencimento)}.`, entrega: 'enviada', anexos: [{ nome: `${g.tributo} ${g.competencia.replace('/', '-')}.pdf`, tipo: 'pdf' }] })
    loja.adicionarDocumento({ nome: `${g.tributo} ${g.competencia.replace('/', '-')}.pdf`, clienteId: cliente.id, pasta: ['Entregáveis', 'Fiscal'], tipo: 'guia', competencia: g.competencia, origem: 'gerado_plataforma', conector: 'a1', tamanho: '90 KB', quando: 'hoje', por: 'Fiscal (integrante)', entregas: [{ quem: 'app do cliente', acao: 'enviado', quando: hojeCurto() }] })
    loja.registrar(usuario.nome, `Enviou o ${g.tributo} ${g.competencia} a ${cliente.nome} (FIS-010, executar)`)
    loja.toast(`${g.tributo} enviado ao contato de guias. O registro de entrega mostra quando abrirem.`, { modulo: 'crm', aba: 'conversas', conversa: cv }, 'Ver a conversa')
  }
  const enviarComCartao = (lista: GuiaS03[]) =>
    postar({
      setor: 'fiscal',
      acao: 'fiscal.guia.enviar',
      cliente: { id: cliente.id, nome: cliente.nome },
      chave: 'enviar-guias',
      texto: `Separei ${lista.length} guia(s) de ${cliente.nome} para enviar ao contato de guias. Confere os valores.`,
      resumo: `Enviar ${lista.length} guia(s) · ${cliente.nome}`,
      argumentos: lista.map((g) => ({ rotulo: g.tributo, valor: `${brl(g.valor)} · vence ${ddmm(g.vencimento)}` })),
      dados: { guias: lista.map((g) => g.id), nomes: lista.map((g) => `${g.tributo} ${g.competencia.replace('/', '-')}.pdf`), competencia: COMPETENCIA, lista: lista.map((g) => `${g.tributo} ${brl(g.valor)}`).join(', ') },
    })
  const cobrar = (g: GuiaS03 & { cobrancas?: number }) =>
    postar({
      setor: 'fiscal',
      acao: 'fiscal.guia.cobrar',
      cliente: { id: cliente.id, nome: cliente.nome },
      chave: `cobrar:${g.id}`,
      texto: `${g.tributo} de ${cliente.nome} sem pagamento informado. Mando a cobrança da régua “Guia a pagar”?`,
      resumo: `Cobrar pagamento: ${g.tributo} · ${cliente.nome}`,
      argumentos: [{ rotulo: 'Guia', valor: `${brl(g.valor)} · vence ${ddmm(g.vencimento)}` }, { rotulo: 'Cobranças', valor: `${g.cobrancas ?? 0} até agora; a 3ª avisa o dono` }],
      dados: { guiaId: g.id, tributo: g.tributo, valor: g.valor, vencimento: g.vencimento, vencida: diasAte(g.vencimento) < 0, cobrancas: g.cobrancas ?? 0 },
    })
  const recalcular = (g: GuiaS03) => {
    setRecalc(g.id)
    setErro(null)
    const novo = somarDias(HOJE, 3)
    servicos.sicalc
      .recalcular({ tributo: g.tributo, valor: g.valor, vencimentoOriginal: g.vencimento, novoVencimento: novo })
      .then((r) => {
        atualizar((x) => ({ ...x, guias: { ...x.guias, [g.id]: { ...x.guias[g.id], recalculo: { total: r.dados.total, memoria: r.dados.memoria, novoVencimento: novo } } } }))
        loja.registrar(usuario.nome, `Recalculou ${g.tributo} vencida de ${cliente.nome}: ${brl(r.dados.total)} até ${ddmm(novo)} (FIS-201, demonstração)`)
      })
      .catch((e: Error) => setErro(e.message))
      .finally(() => setRecalc(null))
  }
  const marcarPaga = (g: GuiaS03) => {
    atualizar((x) => ({ ...x, guias: { ...x.guias, [g.id]: { ...x.guias[g.id], paga: true, lida: true } } }))
    loja.registrar(usuario.nome, `Marcou como paga: ${g.tributo} ${g.competencia} · ${cliente.nome} (pagamento conferido no extrato)`)
    loja.toastDesfazer(`${g.tributo} marcada como paga.`, () => atualizar((x) => ({ ...x, guias: { ...x.guias, [g.id]: { ...x.guias[g.id], paga: false } } })))
  }
  if (tamanho === 'M')
    return (
      <div className="grid h-full grid-cols-4 items-end gap-2">
        {[
          { r: 'enviadas', v: comImposto.filter((x) => x.enviada).length },
          { r: 'lidas', v: comImposto.filter((x) => x.lida).length },
          { r: 'pagas', v: comImposto.filter((x) => x.paga).length },
          { r: 'vencidas', v: comImposto.filter((x) => !x.paga && diasAte(x.vencimento) < 0).length },
        ].map((x) => (
          <div key={x.r} className="flex flex-col">
            <span className="font-heading text-2xl font-light tabular-nums">{x.v}</span>
            <span className="text-muted-foreground text-[11px]">{x.r}</span>
          </div>
        ))}
      </div>
    )
  const pendEnvio = estado.pendentes['enviar-guias']
  return (
    <div className="flex flex-col gap-2">
      {erro && <Erro texto={erro} onTentar={() => setErro(null)} />}
      <Tabela colunas={[{ rotulo: 'Tributo' }, { rotulo: 'Valor', direita: true }, { rotulo: 'Vence' }, { rotulo: 'Situação' }, { rotulo: '' }]} minimo={660}>
        {guias.map((g) => {
          const vencida = !g.paga && g.valor > 0 && diasAte(g.vencimento) < 0
          const pend = estado.pendentes[`cobrar:${g.id}`]
          return (
            <tr key={g.id} className={cn(vencida && 'bg-destructive/5')}>
              <td className="py-1.5 pr-2">
                {g.tributo} <span className="text-muted-foreground text-xs">{g.competencia}</span>
                {g.eventual && <div className="text-muted-foreground text-[11px]">eventual: só sai com imposto (D-23)</div>}
                {g.licenca && <div className="text-muted-foreground text-[11px]">taxa anual de licença (C2-22)</div>}
                {g.recalculo && <div className="text-[11px]">recalculada: {brl(g.recalculo.total)} até {ddmm(g.recalculo.novoVencimento)} · {g.recalculo.memoria[0]}</div>}
              </td>
              <td className="py-1.5 pr-2 text-right tabular-nums">{g.valor > 0 ? brl(g.valor) : 'sem imposto'}</td>
              <td className={cn('py-1.5 pr-2 tabular-nums', vencida && 'text-destructive')}>{ddmm(g.vencimento)}</td>
              <td className="py-1.5 pr-2">
                {g.valor > 0 ? (
                  <span className="flex flex-wrap gap-1">
                    <Rotulo tom={g.enviada ? 'ok' : 'neutro'}>{g.enviada && <CheckIcon weight="bold" className="text-success size-3" />}enviada</Rotulo>
                    <Rotulo tom={g.lida ? 'ok' : 'neutro'}>{g.lida && <CheckIcon weight="bold" className="text-success size-3" />}lida</Rotulo>
                    <Rotulo tom={g.paga ? 'ok' : vencida ? 'erro' : 'neutro'}>{g.paga && <CheckIcon weight="bold" className="text-success size-3" />}{vencida ? 'vencida' : 'paga'}</Rotulo>
                  </span>
                ) : (
                  <Rotulo tom="neutro">guia não gerada</Rotulo>
                )}
                {pend && <CartaoPendente id={pend} className="mt-1" />}
              </td>
              <td className="py-1.5 text-right whitespace-nowrap">
                {g.valor > 0 && !g.enviada && podeEnviar && (g.tributo.startsWith('DAS') ? (
                  <BotaoNivel compacto nivel="executar" variante="ghost" onClick={() => enviarDireto(g)}>
                    Enviar
                  </BotaoNivel>
                ) : null)}
                {vencida && !g.recalculo && (
                  <BotaoNivel compacto nivel="executar" ferramenta="fiscal.guia.recalcular" setor="fiscal" variante="ghost" onClick={() => recalcular(g)}>
                    {recalc === g.id ? 'Recalculando…' : 'Recalcular'}
                  </BotaoNivel>
                )}
                {g.valor > 0 && g.enviada && !g.paga && !pend && (
                  <BotaoNivel compacto nivel="executar com aprovação" ferramenta="fiscal.guia.cobrar" setor="fiscal" variante="ghost" onClick={() => cobrar(g)}>
                    Cobrar
                  </BotaoNivel>
                )}
                {g.valor > 0 && g.enviada && !g.paga && (
                  <Button size="sm" variant="ghost" onClick={() => marcarPaga(g)}>
                    Paga
                  </Button>
                )}
              </td>
            </tr>
          )
        })}
      </Tabela>
      {pendEnvio ? (
        <CartaoPendente id={pendEnvio} />
      ) : (
        naoEnviadas.filter((g) => !g.tributo.startsWith('DAS')).length > 0 && (
          <BotaoNivel compacto nivel="executar com aprovação" ferramenta="fiscal.guia.enviar" setor="fiscal" className="w-fit" onClick={() => enviarComCartao(naoEnviadas.filter((g) => !g.tributo.startsWith('DAS')))}>
            Enviar {naoEnviadas.filter((g) => !g.tributo.startsWith('DAS')).length} guia(s) ao cliente
          </BotaoNivel>
        )
      )}
      <p className="text-muted-foreground text-[11px]">Gatilhos: “guia vence sem pagamento” cobra pela régua às 08:00; “pagamento informado” no app baixa a guia sozinho.</p>
    </div>
  )
}

function ParcelamentosBloco({ cliente, tamanho }: { cliente: Cliente; tamanho: TamanhoWidget }) {
  const { f } = useFiscal(cliente)
  if (!f.parcelamentos.length) return <Vazio>Nenhum parcelamento ativo.</Vazio>
  if (tamanho === 'P') {
    const atrasadas = f.parcelamentos.reduce((t, x) => t + x.atrasadas, 0)
    return (
      <div className="flex h-full flex-col justify-end">
        <span className={cn('font-heading text-4xl font-light tabular-nums', atrasadas && 'text-warning')}>{atrasadas}</span>
        <span className="text-muted-foreground text-xs">{atrasadas === 1 ? 'parcela atrasada' : 'parcelas atrasadas'}</span>
      </div>
    )
  }
  return (
    <ul className="flex flex-col gap-1.5">
      {f.parcelamentos.map((x) => (
        <li key={x.id} className="text-sm">
          <span className="block truncate">{x.modalidade}</span>
          <span className="text-muted-foreground flex flex-wrap gap-x-2 text-xs">
            {x.pagas} de {x.total} pagas · {brl(x.parcela)}/mês ·{' '}
            <span className={cn(x.atrasadas && 'text-warning font-medium')}>
              {x.atrasadas} atrasada{x.atrasadas === 1 ? '' : 's'} ({x.risco})
            </span>
          </span>
        </li>
      ))}
    </ul>
  )
}

/* ---------- Certidões, malhas e intimações (S03-A14, A15) ---------- */

function CertidoesBloco({ cliente, tamanho }: { cliente: Cliente; tamanho: TamanhoWidget }) {
  const { f, estado, atualizar } = useFiscal(cliente)
  const loja = useLoja()
  const { usuario } = useSessao()
  const postar = usePostarS03()
  const [emitindo, setEmitindo] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [resposta, setResposta] = useState<string | null>(null)
  const [texto, setTexto] = useState('')
  const [fonte, setFonte] = useState<string | null>(null)
  const emitir = (nome: string, positiva?: string) => {
    setEmitindo(nome)
    setErro(null)
    const tipo = /FGTS|CRF/.test(nome) ? 'fgts' : /CNDT/.test(nome) ? 'trabalhista' : /estadual/i.test(nome) ? 'estadual' : 'federal'
    servicos.certidoes
      .emitir(tipo, cliente.documento)
      .then((r) => {
        setFonte(r.fonte)
        const [d, m, a] = r.dados.valida_ate.split('/')
        const iso = `${a}-${m}-${d}`
        atualizar((x) => ({ ...x, certidoes: { ...x.certidoes, [nome]: positiva ? { validade: 'positiva', dias: -1, emitida: hojeCurto(), positiva } : { validade: r.dados.valida_ate, dias: diasAte(iso), emitida: hojeCurto() } } }))
        loja.registrar(usuario.nome, `Emitiu ${nome} de ${cliente.nome}: ${positiva ? 'positiva' : r.dados.situacao.replace(/_/g, ' ')} (FIS-036, demonstração)`)
        loja.toast(positiva ? `${nome}: saiu positiva. Causa: ${positiva}.` : `${nome} emitida, válida até ${r.dados.valida_ate}. Guardada na pasta do cliente.`)
      })
      .catch((e: Error) => setErro(e.message))
      .finally(() => setEmitindo(null))
  }
  const intim = f.intimacoes.find((i) => i.id === resposta)
  return (
    <div className="flex flex-col gap-2">
      <SaudeConectores ids={['certidoes']} />
      {erro && <Erro texto={erro} onTentar={() => setErro(null)} />}
      <ul className="divide-border/70 flex flex-col divide-y">
        {f.certidoes.slice(0, tamanho === 'M' ? 2 : 6).map((c0) => {
          const c = { ...c0, ...estado.certidoes[c0.nome] }
          const positiva = c.dias < 0
          return (
            <Linha
              key={c.nome}
              titulo={c.nome}
              detalhe={positiva ? `positiva · causa: ${c0.causa ?? 'pendência no órgão'}` : `válida até ${c.validade}${estado.certidoes[c0.nome] ? ` · emitida ${estado.certidoes[c0.nome].emitida}` : ''}`}
              fim={
                <span className="flex items-center gap-1">
                  <Rotulo tom={positiva ? 'erro' : c.dias <= 30 ? 'atencao' : 'neutro'}>{positiva ? 'positiva' : `${c.dias} dias`}</Rotulo>
                  {tamanho !== 'M' && (
                    <BotaoNivel compacto nivel="executar" ferramenta="fiscal.certidao.emitir" setor="fiscal" variante="ghost" onClick={() => emitir(c.nome, c0.causa)}>
                      {emitindo === c.nome ? 'Emitindo…' : 'Emitir'}
                    </BotaoNivel>
                  )}
                </span>
              }
            />
          )
        })}
      </ul>
      {fonte && <SeloDemonstracao fonte={fonte} className="w-fit" />}
      {tamanho !== 'M' && f.intimacoes.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-muted-foreground text-xs">Intimações e malhas</span>
          {f.intimacoes.map((i) => {
            const st = estado.intimacoes[i.id]
            const dias = diasAte(i.prazo)
            const pend = estado.pendentes[`intimacao:${i.id}`]
            return (
              <div key={i.id} className="bg-raised flex flex-col gap-1.5 rounded-[12px] px-3 py-2">
                <div className="flex flex-wrap items-center gap-2">
                  <GavelIcon className="text-muted-foreground size-4 shrink-0" />
                  <span className="min-w-0 flex-1 text-sm">
                    {i.numero} · {i.assunto}
                    <span className="text-muted-foreground block text-xs">
                      {i.orgao} · prazo {ddmm(i.prazo)} ({dias} dias) · pede: {i.documentos.join(', ')}
                      {i.multa ? ` · multa possível ${brl(i.multa)}` : ''}
                    </span>
                  </span>
                  {st === 'enviada' ? (
                    <Rotulo tom="ok">respondida</Rotulo>
                  ) : pend ? (
                    <Rotulo tom="atencao">resposta aguardando aprovação</Rotulo>
                  ) : (
                    <BotaoNivel compacto nivel="preparar" ferramenta="fiscal.intimacao.responder" setor="fiscal" onClick={() => (setResposta(i.id), setTexto(`Em atenção à ${i.numero}, ${cliente.nome} apresenta os documentos solicitados: ${i.documentos.join('; ')}. Permanecemos à disposição.`))}>
                      Responder
                    </BotaoNivel>
                  )}
                </div>
                {pend && <CartaoPendente id={pend} />}
              </div>
            )
          })}
        </div>
      )}
      {intim && (
        <GavetaFormulario
          aberta
          onFechar={() => setResposta(null)}
          titulo={`Responder ${intim.numero}`}
          descricao={`${intim.orgao} · prazo ${ddmm(intim.prazo)}. O rascunho é do Fiscal; o envio passa por aprovação.`}
          acao="Pedir aprovação do envio"
          acaoDesabilitada={texto.trim().length < 10}
          onAcao={() => {
            postar({
              setor: 'fiscal',
              acao: 'fiscal.intimacao.responder',
              cliente: { id: cliente.id, nome: cliente.nome },
              chave: `intimacao:${intim.id}`,
              texto: `Rascunhei a resposta à ${intim.numero} com ${intim.documentos.length} documento(s). Aprova para eu protocolar.`,
              resumo: `Responder ${intim.numero} · ${cliente.nome}`,
              argumentos: [{ rotulo: 'Órgão', valor: intim.orgao }, { rotulo: 'Prazo', valor: ddmm(intim.prazo) }, { rotulo: 'Anexos', valor: intim.documentos.join(', ') }],
              expira: `expira em ${ddmm(somarDias(intim.prazo, -1))}`,
              dados: { intimacaoId: intim.id, numero: intim.numero, orgao: intim.orgao, texto },
            })
            atualizar((x) => ({ ...x, intimacoes: { ...x.intimacoes, [intim.id]: 'aguardando' } }))
            setResposta(null)
          }}
        >
          <Campo rotulo="Texto da resposta">{(id) => <CampoArea id={id} valor={texto} onMudar={setTexto} linhas={7} />}</Campo>
          <div className="flex flex-col gap-1 text-sm">
            <span className="text-muted-foreground text-xs">Documentos anexados</span>
            {intim.documentos.map((d) => (
              <span key={d} className="flex items-center gap-1.5">
                <CheckIcon className="text-success size-3.5" /> {d}
              </span>
            ))}
          </div>
        </GavetaFormulario>
      )}
    </div>
  )
}

/* ---------- Trava do REINF (S03-A20) ---------- */

function ReinfBloco({ cliente, tamanho }: { cliente: Cliente; tamanho: TamanhoWidget }) {
  const { f } = useFiscal(cliente)
  const fluxos = useFluxos()
  const [aberto, setAberto] = useState<string | null>(null)
  return (
    <div className="flex flex-col gap-1.5">
      {f.trimestresReinf.slice(tamanho === 'M' ? -2 : 0).map((t) => (
        <div key={t.id} className="bg-raised rounded-[12px] px-3 py-1.5">
          <div className="flex items-center gap-2 text-sm">
            <LockSimpleIcon className="size-4 shrink-0" aria-label="travado" />
            <span className="min-w-0 flex-1 truncate">{t.trimestre}</span>
            {t.complementares > 0 && <Rotulo tom="atencao">{t.complementares} complementar</Rotulo>}
            <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => setAberto(aberto === t.id ? null : t.id)}>
              protocolo
            </Button>
            <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => fluxos.baixar(`REINF ${t.trimestre.replace('/', '-')} · ${cliente.nome}.csv`)}>
              exportar
            </Button>
          </div>
          {aberto === t.id && (
            <p className="text-muted-foreground pl-6 text-xs">
              Enviado em {ddmm(t.enviado)} · protocolo {t.protocolo}. Travado: lucros e retenções deste trimestre não mudam; o que chegar depois entra como complementar (com o Contábil).
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

/* ---------- Comunicação (S03-A17) ---------- */

function ComunicacaoBloco({ cliente, tamanho }: { cliente: Cliente; tamanho: TamanhoWidget }) {
  const { f, estado, atualizar } = useFiscal(cliente)
  const postar = usePostarS03()
  const [editar, setEditar] = useState(false)
  const [texto, setTexto] = useState(f.resumoMes)
  const pend = estado.pendentes['resumo']
  return (
    <div className="flex h-full flex-col gap-2">
      <p className="bg-raised line-clamp-4 rounded-[12px] px-3 py-2 text-sm leading-relaxed">{texto}</p>
      {tamanho !== 'M' && (
        <div className="text-muted-foreground text-xs">
          Respostas recorrentes (FIS-044): “como pago o DAS?”, “o que é a DCTFWeb?”, “por que a guia mudou de valor?”
        </div>
      )}
      {pend && <CartaoPendente id={pend} />}
      <div className="mt-auto flex flex-wrap gap-2">
        {estado.resumo === 'enviado' ? (
          <Rotulo tom="ok">
            <CheckIcon weight="bold" className="text-success size-3" /> resumo de {COMPETENCIA} enviado
          </Rotulo>
        ) : (
          !pend && (
            <>
              <Button size="sm" variant="ghost" onClick={() => setEditar(true)}>
                Editar
              </Button>
              <BotaoNivel
                compacto
                nivel="executar com aprovação"
                ferramenta="fiscal.resumo.enviar"
                setor="fiscal"
                onClick={() => {
                  postar({ setor: 'fiscal', acao: 'fiscal.resumo.enviar', cliente: { id: cliente.id, nome: cliente.nome }, chave: 'resumo', texto: `Preparei o resumo fiscal de ${COMPETENCIA} para ${cliente.nome}. Confere antes de eu mandar.`, resumo: `Enviar resumo do mês · ${cliente.nome}`, argumentos: [{ rotulo: 'Prévia', valor: texto.slice(0, 90) + (texto.length > 90 ? '…' : '') }], dados: { texto } })
                  atualizar((x) => ({ ...x, resumo: 'aguardando' }))
                }}
              >
                Enviar resumo
              </BotaoNivel>
            </>
          )
        )}
      </div>
      {editar && (
        <GavetaFormulario aberta onFechar={() => setEditar(false)} titulo="Resumo do mês" descricao="Prévia do que o cliente recebe pelo canal do assunto “guias”." acao="Salvar" onAcao={() => setEditar(false)}>
          <Campo rotulo="Texto">{(id) => <CampoArea id={id} valor={texto} onMudar={setTexto} linhas={6} />}</Campo>
        </GavetaFormulario>
      )}
    </div>
  )
}

/* ---------- Créditos e fase 4 ---------- */

function CreditosBloco({ cliente }: { cliente: Cliente }) {
  const { f } = useFiscal(cliente)
  const fluxos = useFluxos()
  if (!f.creditos.length) return <Vazio>Nenhuma oportunidade de crédito identificada.</Vazio>
  return (
    <ul className="flex flex-col gap-2">
      {f.creditos.map((c) => (
        <li key={c.id} className="flex items-start gap-2 text-sm">
          <span className="min-w-0 flex-1">
            <span className="block">{c.tributo}</span>
            <span className="text-muted-foreground block text-xs">
              estimado {brl0(c.valor)} · {c.origem}
            </span>
          </span>
          <SeloFase fase={c.fase} />
          <BotaoNivel compacto nivel="preparar" ferramenta="fiscal.declaracao.preparar" setor="fiscal" variante="ghost" onClick={() => fluxos.preparar({ cliente: cliente.nome, setor: 'fiscal', documento: `Levantamento: ${c.tributo}` })}>
            Preparar
          </BotaoNivel>
        </li>
      ))}
      <li className="text-muted-foreground flex items-center gap-2 text-xs">
        <SeloFase fase={4} /> Simulação de parcelamento (C2-18) e reforma no Simples entram com a Consultoria.
      </li>
    </ul>
  )
}

/* ---------- Pessoa física (S03-A19) ---------- */

const etapasIrpf = ['Campanha', 'Coleta', 'Pré-preenchida', 'Elaboração', 'Revisão', 'Entrega', 'Pós-entrega']

function IrpfBloco({ cliente }: { cliente: Cliente }) {
  const { f, estado, atualizar } = useFiscal(cliente)
  const loja = useLoja()
  const { usuario } = useSessao()
  const confirmar = useConfirmar()
  const pf = f.pf!
  const etapa = estado.irpf.etapa ?? pf.campanha.etapa
  const coletados = estado.irpf.coletados ?? pf.campanha.coletados
  const pedirDocs = () => {
    atualizar((x) => ({ ...x, irpf: { ...x.irpf, coletados: Math.min(pf.campanha.pedidos, coletados + 2), etapa: Math.max(etapa, 1) } }))
    loja.registrar('Fiscal', `Pediu pelo app os documentos do IRPF 2027 que faltam a ${cliente.nome} (PF-004, coleta adaptativa)`)
    loja.toast('Pedido de documentos no app do cliente; cada um baixa a pendência ao chegar.')
  }
  const transmitir = async () => {
    const ok = await confirmar({ titulo: 'Transmitir a declaração com o seu certificado?', descricao: 'Transmitir IRPF é ato de pessoa: o integrante não transmite. Você assina com o seu certificado e o recibo volta para a pasta do cliente.', acao: 'Transmitir' })
    if (!ok) return
    atualizar((x) => ({ ...x, irpf: { ...x.irpf, transmitido: hojeCurto(), etapa: 6 } }))
    loja.registrar(usuario.nome, `Transmitiu o IRPF de ${cliente.nome} com certificado próprio (PF-009, só pessoa)`)
    loja.toast('Declaração transmitida (demonstração). Recibo guardado.')
  }
  return (
    <div className="flex flex-col gap-3">
      <dl className="grid grid-cols-2 gap-2 text-sm">
        <Dado rotulo={`IRPF ${pf.irpf.exercicio}`} valor={`entregue ${pf.irpf.entregue}`} detalhe={pf.irpf.resultado} />
        <Dado rotulo="Quotas e malha" valor={pf.irpf.quotas} detalhe={pf.irpf.malha} />
      </dl>
      <div className="flex flex-col gap-1.5">
        <span className="text-muted-foreground text-xs">Campanha IRPF 2027 · documentos {coletados} de {pf.campanha.pedidos}</span>
        <Passos passos={etapasIrpf} atual={etapa} />
      </div>
      <div className="flex flex-wrap gap-2">
        <BotaoNivel compacto nivel="executar" onClick={pedirDocs}>
          Coletar pelo app
        </BotaoNivel>
        {etapa < 5 && (
          <Button size="sm" variant="ghost" onClick={() => (atualizar((x) => ({ ...x, irpf: { ...x.irpf, etapa: etapa + 1 } })), loja.registrar(usuario.nome, `IRPF de ${cliente.nome}: etapa ${etapasIrpf[etapa + 1]}`))}>
            Avançar para {etapasIrpf[etapa + 1]}
          </Button>
        )}
        {estado.irpf.transmitido ? (
          <Rotulo tom="ok">transmitida {estado.irpf.transmitido}</Rotulo>
        ) : (
          <BotaoNivel compacto nivel="só pessoa" ferramenta="fiscal.irpf.transmitir" setor="fiscal" falta={etapa < 5 ? 'revisão' : undefined} onClick={transmitir}>
            Transmitir
          </BotaoNivel>
        )}
        <Button size="sm" variant="ghost" onClick={() => loja.toast('Retificação preparada como rascunho; transmitir continua com você.')}>
          Retificar
        </Button>
      </div>
    </div>
  )
}

function CarneLeaoBloco({ cliente, tamanho }: { cliente: Cliente; tamanho: TamanhoWidget }) {
  const { f } = useFiscal(cliente)
  const pf = f.pf!
  return (
    <div className="flex flex-col gap-2">
      <Tabela colunas={[{ rotulo: 'Mês' }, { rotulo: 'Rendimento', direita: true }, { rotulo: 'Deduções', direita: true }, { rotulo: 'Imposto', direita: true }, { rotulo: '' }]} minimo={420}>
        {pf.carneLeao.slice(tamanho === 'M' ? -1 : 0).map((m) => (
          <tr key={m.mes}>
            <td className="py-1.5 pr-2 tabular-nums">{m.mes}</td>
            <td className="py-1.5 pr-2 text-right tabular-nums">{brl(m.rendimento)}</td>
            <td className="py-1.5 pr-2 text-right tabular-nums">{brl(m.deducoes)}</td>
            <td className="py-1.5 pr-2 text-right tabular-nums">{brl(m.imposto)}</td>
            <td className="py-1.5">
              <Rotulo tom={m.pago ? 'ok' : 'atencao'}>{m.pago ? 'pago' : 'a pagar'}</Rotulo>
            </td>
          </tr>
        ))}
      </Tabela>
      {tamanho === 'XL' && (
        <ul className="grid grid-cols-2 gap-1.5 text-xs">
          <li className="text-muted-foreground col-span-2">Receita Saúde: {pf.receitaSaude ? 'recibos emitidos pelo app da Receita entram sozinhos' : 'não se aplica (não é profissional de saúde)'}</li>
          {pf.outros.map((o) => (
            <li key={o.item} className="bg-raised flex items-center gap-2 rounded-[10px] px-2 py-1">
              <span className="min-w-0 flex-1">
                <span className="block text-sm">{o.item}</span>
                <span className="text-muted-foreground">{o.situacao}</span>
              </span>
              <SeloFase fase={o.fase} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/* ---------- Carteira ---------- */

function useClientesFiscal() {
  const loja = useLoja()
  return loja.clientes.filter((c) => !c.servicos || c.servicos.includes('contabil'))
}

function CarteiraFiscal() {
  const loja = useLoja()
  const clientes = useClientesFiscal()
  const postar = usePostarS03()
  const pode = usePode('fiscal.declaracao.transmitir_lote', { setor_id: 'fiscal' })
  const fluxos = useFluxos()
  const linhas = clientes.map((c) => {
    const p = perfilS03(c)
    const f = fiscalS03(p)
    const e = lerEstado(loja, chaveFiscal(c.id), fiscalVazio)
    const principal = f.declaracoes.find((d) => d.nome === 'PGDAS-D' || d.nome === 'DCTFWeb')
    const guias = f.guias.filter((g) => g.valor > 0).map((g) => guiaAtual(g, e))
    const tx = principal ? e.transmitidas[principal.id] : undefined
    const fora = principal && !tx ? principal.falta : undefined
    return { c, p, f, e, principal, tx, fora, guias, novas: [...e.caixasExtras, ...f.caixas].filter((m) => !e.abertas[m.id]).length }
  })
  const pgdas = linhas.filter((l) => l.principal?.nome === 'PGDAS-D' && !l.tx)
  const prontos = pgdas.filter((l) => !l.fora)
  const deFora = pgdas.filter((l) => l.fora)
  const lote = () =>
    postar({
      setor: 'fiscal',
      acao: 'fiscal.lote',
      texto: `PGDAS-D de outubro de ${prontos.length} clientes pronto. ${deFora.length ? `${deFora.length} de fora: ${deFora.map((l) => `${l.c.nome} (${l.fora})`).join('; ')}.` : ''} Aprova o lote ou um a um.`,
      resumo: `Transmitir PGDAS-D 10/2026 de ${prontos.length} clientes`,
      argumentos: [...prontos.map((l) => ({ rotulo: l.c.nome, valor: brl(l.principal!.valor ?? 0) })), ...deFora.map((l) => ({ rotulo: `${l.c.nome} (de fora)`, valor: l.fora! }))],
      lote: prontos.length,
      expira: 'expira em 19/11 (véspera do prazo)',
      dados: { itens: prontos.map((l) => ({ id: l.c.id, nome: l.c.nome, declId: l.principal!.id, valor: l.principal!.valor })) },
    })
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <p className="min-w-0 flex-1 text-sm">
          PGDAS-D de outubro de <strong className="font-medium">{prontos.length} {prontos.length === 1 ? 'cliente pronto' : 'clientes prontos'}</strong>
          {deFora.length ? `; ${deFora.length} de fora` : ''}.
        </p>
        {pode && prontos.length > 0 && (
          <BotaoNivel compacto nivel="executar com aprovação" onClick={lote}>
            Transmitir em lote ({prontos.length})
          </BotaoNivel>
        )}
      </div>
      <Tabela colunas={[{ rotulo: 'Cliente' }, { rotulo: 'Declaração do mês' }, { rotulo: 'Guias (env./lidas/pagas)', centro: true }, { rotulo: 'Caixa postal', centro: true }]} minimo={620}>
        {linhas.map((l) => (
          <tr key={l.c.id} className="hover:bg-sunken/50 cursor-pointer" onClick={() => fluxos.feito(`Escolha ${l.c.nome} no seletor de cliente para ver a aba Fiscal dele.`)}>
            <td className="py-1.5 pr-2">
              <div>{l.c.nome}</div>
              <div className="text-muted-foreground text-[11px]">{l.c.regime}</div>
            </td>
            <td className="py-1.5 pr-2">
              {!l.principal ? (
                <span className="text-muted-foreground text-xs">{l.p.tipo === 'pf' ? 'carnê-leão · IRPF' : l.p.tipo === 'mei' ? 'DAS-MEI (sem declaração mensal)' : '—'}</span>
              ) : l.tx ? (
                <Rotulo tom="ok">
                  <CheckIcon weight="bold" className="text-success size-3" /> {l.principal.nome} transmitida
                </Rotulo>
              ) : l.fora ? (
                <span className="text-xs">
                  <Rotulo tom="atencao">{l.principal.nome} de fora</Rotulo> <span className="text-muted-foreground">{l.fora}</span>
                </span>
              ) : (
                <Rotulo tom="info">{l.principal.nome} pronta</Rotulo>
              )}
            </td>
            <td className="py-1.5 pr-2 text-center text-xs tabular-nums">
              {l.guias.filter((g) => g.enviada).length}/{l.guias.filter((g) => g.lida).length}/{l.guias.filter((g) => g.paga).length}
            </td>
            <td className={cn('py-1.5 text-center tabular-nums', l.novas && 'text-warning font-medium')}>{l.novas || '·'}</td>
          </tr>
        ))}
      </Tabela>
      <p className="text-muted-foreground text-[11px]">Cada cliente do lote vira uma linha do cartão: aprovar todos ou tirar um a um.</p>
    </div>
  )
}

function GuiasCarteira({ tamanho }: { tamanho: TamanhoWidget }) {
  const loja = useLoja()
  const clientes = useClientesFiscal()
  const linhas = clientes.map((c) => {
    const e = lerEstado(loja, chaveFiscal(c.id), fiscalVazio)
    const gs = fiscalS03(perfilS03(c)).guias.filter((g) => g.valor > 0).map((g) => guiaAtual(g, e))
    return { c, enviadas: gs.filter((g) => g.enviada).length, lidas: gs.filter((g) => g.lida).length, pagas: gs.filter((g) => g.paga).length, vencidas: gs.filter((g) => !g.paga && diasAte(g.vencimento) < 0).length }
  })
  const t = (k: 'enviadas' | 'lidas' | 'pagas' | 'vencidas') => linhas.reduce((s, l) => s + l[k], 0)
  if (tamanho !== 'XL')
    return (
      <div className={cn('grid h-full grid-cols-4 gap-2', tamanho === 'M' ? 'items-end' : 'content-start')}>
        {(['enviadas', 'lidas', 'pagas', 'vencidas'] as const).map((k) => (
          <div key={k} className="flex flex-col">
            <span className={cn('font-heading text-2xl font-light tabular-nums', k === 'vencidas' && t(k) > 0 && 'text-destructive')}>{t(k)}</span>
            <span className="text-muted-foreground text-[11px]">{k}</span>
          </div>
        ))}
        {tamanho === 'G' && (
          <ul className="col-span-4 mt-2 flex flex-col gap-1 text-xs">
            {linhas.filter((l) => l.vencidas).map((l) => (
              <li key={l.c.id} className="text-destructive">
                {l.c.nome}: {l.vencidas} vencida(s)
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  return (
    <Tabela colunas={[{ rotulo: 'Cliente' }, { rotulo: 'Enviadas', direita: true }, { rotulo: 'Lidas', direita: true }, { rotulo: 'Pagas', direita: true }, { rotulo: 'Vencidas', direita: true }]} minimo={460}>
      {linhas.map((l) => (
        <tr key={l.c.id}>
          <td className="py-1.5 pr-2">{l.c.nome}</td>
          <td className="py-1.5 pr-2 text-right tabular-nums">{l.enviadas}</td>
          <td className="py-1.5 pr-2 text-right tabular-nums">{l.lidas}</td>
          <td className="py-1.5 pr-2 text-right tabular-nums">{l.pagas}</td>
          <td className={cn('py-1.5 text-right tabular-nums', l.vencidas && 'text-destructive font-medium')}>{l.vencidas || '·'}</td>
        </tr>
      ))}
    </Tabela>
  )
}

function CaixasCarteira({ tamanho }: { tamanho: TamanhoWidget }) {
  const loja = useLoja()
  const clientes = useClientesFiscal()
  const itens = clientes.flatMap((c) => {
    const e = lerEstado(loja, chaveFiscal(c.id), fiscalVazio)
    return [...e.caixasExtras, ...fiscalS03(perfilS03(c)).caixas].filter((m) => !e.abertas[m.id]).map((m) => ({ c, m }))
  })
  if (tamanho === 'P')
    return (
      <div className="flex h-full flex-col justify-end">
        <span className={cn('font-heading text-4xl font-light tabular-nums', itens.length && 'text-warning')}>{itens.length}</span>
        <span className="text-muted-foreground text-xs">não abertas na carteira</span>
      </div>
    )
  if (!itens.length) return <Vazio>Nenhuma mensagem pendente na carteira.</Vazio>
  return (
    <ul className="divide-border/70 flex flex-col divide-y">
      {itens
        .sort((a, b) => a.m.recebida.localeCompare(b.m.recebida))
        .map(({ c, m }) => (
          <Linha key={m.id} inicio={<EnvelopeSimpleIcon weight="duotone" className="size-5 shrink-0" />} titulo={`${c.nome} · ${m.assunto}`} detalhe={`${m.orgao} · ciência tácita em ${ddmm(cienciaTacita(m.recebida))} · ${m.classificacao}`} />
        ))}
    </ul>
  )
}

function CampanhaCarteira() {
  const loja = useLoja()
  const clientes = useClientesFiscal().filter((c) => c.regime === 'Pessoa física')
  if (!clientes.length) return <Vazio>Nenhum cliente pessoa física na carteira.</Vazio>
  return (
    <ul className="flex flex-col gap-2">
      {clientes.map((c) => {
        const pf = fiscalS03(perfilS03(c)).pf!
        const e = lerEstado(loja, chaveFiscal(c.id), fiscalVazio)
        const etapa = e.irpf.etapa ?? pf.campanha.etapa
        return (
          <li key={c.id} className="flex items-center gap-2 text-sm">
            <UserFocusIcon className="text-muted-foreground size-4 shrink-0" />
            <span className="min-w-0 flex-1 truncate">{c.nome}</span>
            <span className="text-muted-foreground text-xs">
              {etapasIrpf[etapa]} · docs {e.irpf.coletados ?? pf.campanha.coletados}/{pf.campanha.pedidos}
            </span>
          </li>
        )
      })}
      <li className="text-muted-foreground text-[11px]">Na temporada (março a maio), a Visão geral mostra a campanha. O envio é sempre de uma pessoa.</li>
    </ul>
  )
}

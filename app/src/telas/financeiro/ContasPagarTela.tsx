import { BarcodeIcon, CheckIcon, EnvelopeSimpleIcon, FileArrowUpIcon, GearSixIcon, PlusIcon, ReceiptIcon, WarningIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { useSessao } from '@/ambiente/sessao'
import { BotaoAcoes, CaixaSelecao, EstadoVazio, SeloDemonstracao, useAcao, useConfirmar, useSelecao } from '@/components/kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Campo, CampoEscolha, CampoTexto, GavetaFormulario, Segmentado } from '@/components/ui/formulario'
import type { ContaPagarFin } from '@/nucleo/modelo/financeiro'
import { repos } from '@/nucleo/repositorios'
import { servicos as apis } from '@/servicos'
import { brl, CabecalhoFin, Caixa, CartoesDaAba, ModaisConfig, Nota, PaginaFin, Pergunta } from './comum'
import { useFin, useIntegranteFin, useLimiteAprovacao, usePodeFin, type Fin } from './dados'
import { dataCurta, diasEntre, HOJE, somarDias } from './dominio'

const numero = (s: string) => Number(s.replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '')) || 0
const rotuloSituacao: Record<ContaPagarFin['situacao'], string> = { capturada: 'capturada', classificada: 'classificada', aguardando_aprovacao: 'a aprovar', aprovada: 'aprovada', agendada: 'agendada no banco', paga: 'paga', contestada: 'contestada', cancelada: 'descartada' }
const rotuloOrigem: Record<ContaPagarFin['origem'], string> = { dda: 'DDA', email: 'e-mail', manual: 'à mão', recorrente: 'recorrente', codigo_barras: 'código de barras', arquivo: 'arquivo', whatsapp: 'WhatsApp' }

/**
 * S07-T04 · Financeiro › Contas a pagar (FIN-003; 09, 6.1 e 10.5): capturar
 * (arquivo, código de barras, à mão; DDA e e-mail chegam sozinhos), classificar,
 * conferir duplicidade e fornecedor novo, aprovar por alçada e anexar o
 * comprovante. Aprovar agenda; a liberação final é sempre no banco, por uma
 * pessoa. O integrante nunca paga.
 */
export function ContasPagarTela() {
  const fin = useFin()
  const integrante = useIntegranteFin()
  const executar = useAcao()
  const confirmar = useConfirmar()
  const { usuario } = useSessao()
  const limite = useLimiteAprovacao(fin)
  const podeCapturar = usePodeFin('conta_pagar.capturar')
  const podeAprovarFerr = usePodeFin('conta_pagar.aprovar')
  const podeAprovar = limite > 0 && podeAprovarFerr
  const [filtro, setFiltro] = useState<'aguardando' | 'agendada' | 'paga' | 'todas'>('aguardando')
  const [modal, setModal] = useState<'capturar' | 'alcadas' | { tipo: 'classificar' | 'conferir' | 'comprovante'; c: ContaPagarFin } | null>(null)
  const naFila = (c: ContaPagarFin) => c.situacao === 'capturada' || c.situacao === 'classificada' || c.situacao === 'aguardando_aprovacao' || c.situacao === 'aprovada'
  const lista = fin.contasPagar.filter((c) => (filtro === 'todas' ? c.situacao !== 'cancelada' : filtro === 'aguardando' ? naFila(c) : c.situacao === filtro))
  const aAprovar = fin.contasPagar.filter((c) => c.situacao === 'aguardando_aprovacao')
  const aprovaveis = lista.filter((c) => c.situacao === 'aguardando_aprovacao' && !c.alerta && c.valor <= limite && c.valor <= (fin.politica?.limite_dois_aprovadores ?? Infinity))
  const selecao = useSelecao(aprovaveis.map((c) => c.id))
  const semana = fin.contasPagar.filter((c) => c.situacao !== 'paga' && c.situacao !== 'cancelada' && diasEntre(HOJE, c.vencimento) >= 0 && diasEntre(HOJE, c.vencimento) <= 7)
  const dois = fin.politica?.limite_dois_aprovadores ?? 10000

  const aprovar = (ids: string[]) => {
    const contas = ids.map((id) => fin.contasPagar.find((c) => c.id === id)!).filter(Boolean)
    const total = contas.reduce((s, c) => s + c.valor, 0)
    const ok = executar(() => {
      for (const c of contas) repos.contasPagar.atualizar(c.id, { situacao: 'agendada', aprovador_id: usuario.id, aprovador_nome: usuario.nome, alerta: null }, { ferramenta: 'conta_pagar.aprovar', texto: `${usuario.nome} aprovou e agendou ${c.fornecedor} (${brl(c.valor, true)}); liberação final no banco` })
      return true
    })
    if (ok) executar(() => undefined, { sucesso: `${contas.length} ${contas.length === 1 ? 'conta agendada' : 'contas agendadas'} · ${brl(total, true)}. A liberação final sai no banco, com o seu token.` })
    selecao.limpar()
  }
  const pedirAprovacao = (c: ContaPagarFin) =>
    integrante.pedirCartao({
      id: `pagar-${c.id}`,
      acao: { tipo: 'aprovar_contas', ids: [c.id] },
      resumo: `Aprovar o pagamento de ${c.fornecedor}`,
      argumentos: [
        { rotulo: 'Valor', valor: brl(c.valor, true) },
        { rotulo: 'Vence', valor: dataCurta(c.vencimento) },
        { rotulo: 'Alçada', valor: c.valor > dois ? 'Administrador + segundo sócio' : 'Administrador' },
      ],
      texto: `${c.fornecedor} (${brl(c.valor, true)}) passa da alçada de quem pediu. Deixei o cartão para o Administrador; aprovar agenda no banco, e a liberação final é com o token dele.`,
      aba: 'pagar',
      alcada: 'administrador',
      ferramenta: 'conta_pagar.aprovar',
    })
  const buscarDda = () =>
    integrante.trabalhar({
      id: 'dda',
      titulo: 'Ler o DDA e a caixa financeira',
      inicio: 'Vou ler o DDA do Itaú e a caixa financeiro@ de agora, classificar e checar duplicidade.',
      etapas: ['Lendo o DDA do Itaú', 'Lendo os e-mails com boleto', 'Classificando pela regra do fornecedor', 'Checando duplicidade pelo código de barras'],
      fim: 'Achei 2 contas novas: a conta de água (DDA) e o boleto do CRC (e-mail). Classifiquei e deixei na fila para aprovar.',
      aviso: 'Financeiro capturou 2 contas novas',
      aoTerminar: () => {
        executar(() => repos.contasPagar.criar({ titular_tipo: 'escritorio', fornecedor: 'Sabesp', categoria: 'Ocupação', valor: 312.4, vencimento: somarDias(HOJE, 9), competencia: somarDias(HOJE, 9).slice(0, 7), origem: 'dda', situacao: 'aguardando_aprovacao', centro_custo_id: 'cc-estrutura', codigo_barras: '82690000003 1 12400000000 9 00000000000 0 00000000000 0' }, { semAutorizar: true, texto: 'Financeiro capturou do DDA: Sabesp' }))
        executar(() => repos.contasPagar.criar({ titular_tipo: 'escritorio', fornecedor: 'CRC-SP (anuidade, 2 contadores)', categoria: 'Taxas do CRC', valor: 1_186, vencimento: somarDias(HOJE, 12), competencia: somarDias(HOJE, 12).slice(0, 7), origem: 'email', situacao: 'aguardando_aprovacao', centro_custo_id: 'cc-estrutura' }, { semAutorizar: true, texto: 'Financeiro capturou do e-mail: CRC-SP' }))
      },
    })

  return (
    <PaginaFin fin={fin}>
      <CabecalhoFin titulo="Contas a pagar" exportar="pagar" status={`${aAprovar.length} esperam aprovação, ${aAprovar.filter((c) => c.alerta).length} com alerta; capturo do DDA e do e-mail sozinho, pagar é sempre de uma pessoa`} sub={`${aAprovar.length} a aprovar · ${brl(aAprovar.reduce((s, c) => s + c.valor, 0), true)} · aprovar agenda; a liberação final é no banco`}>
        {podeCapturar && (
          <>
            <Button size="sm" className="rounded-full" onClick={() => setModal('capturar')}>
              <PlusIcon /> Conta a pagar
            </Button>
            <Button size="sm" variant="outline" className="rounded-full" disabled={integrante.fazendo('dda')} onClick={buscarDda}>
              <ReceiptIcon /> {integrante.fazendo('dda') ? 'Lendo o DDA…' : 'Buscar no DDA e no e-mail agora'}
            </Button>
          </>
        )}
      </CabecalhoFin>

      <CartoesDaAba fin={fin} aba="pagar" />

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Caixa>
          <Pergunta descricao={limite === Infinity ? `Você aprova qualquer valor; acima de ${brl(dois)} também o segundo sócio.` : limite > 0 ? `Você aprova até ${brl(limite)}; acima disso, o cartão vai ao Administrador.` : 'Você vê a fila; aprovar é do Gestor do Financeiro e do Administrador.'}>Fila por estado</Pergunta>
          <div className="flex flex-wrap items-center gap-2">
            <Segmentado
              rotulo="Estado das contas"
              valor={filtro}
              onMudar={(v) => {
                setFiltro(v)
                selecao.limpar()
              }}
              opcoes={[
                { valor: 'aguardando', rotulo: `A aprovar (${fin.contasPagar.filter(naFila).length})` },
                { valor: 'agendada', rotulo: 'Agendadas' },
                { valor: 'paga', rotulo: 'Pagas' },
                { valor: 'todas', rotulo: 'Todas' },
              ]}
            />
            <span className="flex-1" />
            {podeAprovar && selecao.quantos > 0 ? (
              <Button size="sm" className="rounded-full" onClick={() => aprovar(selecao.selecionados)}>
                <CheckIcon /> Aprovar e agendar {selecao.quantos}
              </Button>
            ) : (
              podeAprovar &&
              aprovaveis.length > 0 && (
                <Button size="sm" variant="outline" className="rounded-full" onClick={() => selecao.alternarTodos()}>
                  Marcar as {aprovaveis.length} dentro da sua alçada
                </Button>
              )
            )}
          </div>
          {!lista.length ? (
            <EstadoVazio compacto icone={ReceiptIcon} titulo="Nada neste estado" descricao="As contas chegam sozinhas do DDA e do e-mail, ou você lança à mão." />
          ) : (
            <ul className="divide-border/70 flex flex-col divide-y">
              {lista.map((c) => {
                const acima = c.valor > limite
                const centro = fin.centros.find((x) => x.id === c.centro_custo_id)?.nome
                const marcavel = podeAprovar && aprovaveis.some((x) => x.id === c.id)
                return (
                  <li key={c.id} className="flex flex-wrap items-center gap-3 py-2.5 text-sm">
                    {podeAprovar && <CaixaSelecao marcado={selecao.marcado(c.id)} onMudar={(i) => marcavel && selecao.alternar(c.id, i)} rotulo={`Marcar ${c.fornecedor}`} className={marcavel ? '' : 'pointer-events-none opacity-30'} />}
                    <span className="min-w-0 flex-1 basis-56">
                      <span className="block truncate">{c.fornecedor}</span>
                      <span className="text-muted-foreground block truncate text-xs">
                        {c.categoria} · {c.rateio?.length ? `rateio ${c.rateio.map((r) => `${fin.centros.find((x) => x.id === r.centro_custo_id)?.nome} ${r.percentual}%`).join(', ')}` : (centro ?? 'sem centro')} · vence {dataCurta(c.vencimento)} · via {rotuloOrigem[c.origem]}
                        {c.aprovador_nome && ` · aprovada por ${c.aprovador_nome}`}
                      </span>
                      {c.alerta && (
                        <span className="text-foreground flex items-center gap-1 text-xs">
                          <WarningIcon className="text-warning size-3.5" weight="fill" /> {c.alerta}
                        </span>
                      )}
                    </span>
                    <Badge variant={c.situacao === 'aguardando_aprovacao' ? 'destaque' : c.situacao === 'paga' ? 'sucesso' : 'outline'} className="hidden sm:inline-flex">
                      {rotuloSituacao[c.situacao]}
                    </Badge>
                    <span className="min-w-24 shrink-0 whitespace-nowrap text-right tabular-nums">{brl(c.valor, true)}</span>
                    {podeCapturar && c.situacao === 'aguardando_aprovacao' && c.alerta && (
                      <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setModal({ tipo: 'conferir', c })}>
                        Conferir
                      </Button>
                    )}
                    {c.situacao === 'aguardando_aprovacao' && !c.alerta && acima && podeCapturar && (
                      <Button size="sm" variant="ghost" className="rounded-full" onClick={() => pedirAprovacao(c)}>
                        Pedir aprovação
                      </Button>
                    )}
                    {podeCapturar && (
                      <BotaoAcoes
                        rotulo={`Ações de ${c.fornecedor}`}
                        acoes={[
                          { rotulo: 'Classificar e ratear', motivo: c.situacao === 'paga' ? 'já paga' : undefined, onSelecionar: () => setModal({ tipo: 'classificar', c }) },
                          { rotulo: 'Aprovar e agendar', motivo: !podeAprovar ? 'fora da sua alçada' : c.situacao !== 'aguardando_aprovacao' ? 'não está a aprovar' : c.alerta ? 'confira o alerta antes' : acima ? `acima da sua alçada (${brl(limite)})` : c.valor > dois ? `acima de ${brl(dois)}: dois aprovadores (cartão)` : undefined, onSelecionar: () => aprovar([c.id]) },
                          { rotulo: 'Anexar comprovante (baixa)', motivo: c.situacao !== 'agendada' && c.situacao !== 'aprovada' ? 'só depois de agendada' : undefined, onSelecionar: () => setModal({ tipo: 'comprovante', c }) },
                          {
                            rotulo: 'Descartar',
                            perigo: true,
                            separar: true,
                            motivo: c.situacao === 'paga' ? 'já paga' : undefined,
                            onSelecionar: async () => {
                              const motivo = await confirmar({ titulo: `Descartar ${c.fornecedor}?`, descricao: 'A conta sai da fila; fica no histórico com o motivo.', acao: 'Descartar', perigo: true, exigirMotivo: true })
                              if (typeof motivo === 'string') executar(() => repos.contasPagar.cancelar(c.id, motivo), { sucesso: 'Conta descartada.' })
                            },
                          },
                        ]}
                      />
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </Caixa>
        <div className="flex flex-col gap-4">
          <Caixa>
            <Pergunta>Vencem nos próximos 7 dias</Pergunta>
            {!semana.length && <p className="text-muted-foreground text-sm">Nada vence esta semana.</p>}
            <ul className="flex flex-col gap-1.5">
              {semana.map((c) => (
                <li key={c.id} className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground w-11 shrink-0 text-xs tabular-nums">{dataCurta(c.vencimento)}</span>
                  <span className="min-w-0 flex-1 truncate">{c.fornecedor}</span>
                  <span className="tabular-nums">{brl(c.valor, true)}</span>
                </li>
              ))}
            </ul>
          </Caixa>
          <Caixa>
            <Pergunta descricao="O integrante lê, classifica e checa duplicidade; você só aprova.">Chegam sozinhas</Pergunta>
            <ul className="flex flex-col gap-2 text-sm">
              {[
                { icone: <ReceiptIcon className="text-muted-foreground mt-0.5 size-4 shrink-0" />, fonte: 'DDA do Itaú', detalhe: 'boletos emitidos contra o CNPJ do escritório', n: fin.contasPagar.filter((c) => c.origem === 'dda').length },
                { icone: <EnvelopeSimpleIcon className="text-muted-foreground mt-0.5 size-4 shrink-0" />, fonte: 'financeiro@ (e-mail)', detalhe: 'boletos e notas que chegam por e-mail', n: fin.contasPagar.filter((c) => c.origem === 'email').length },
                { icone: <ReceiptIcon className="text-muted-foreground mt-0.5 size-4 shrink-0" />, fonte: 'Recorrentes', detalhe: 'aluguel, folha, assinaturas (geradas no dia 1)', n: fin.contasPagar.filter((c) => c.origem === 'recorrente').length },
              ].map((f) => (
                <li key={f.fonte} className="flex items-start gap-2">
                  {f.icone}
                  <span className="min-w-0 flex-1">
                    <span className="block">{f.fonte}</span>
                    <span className="text-muted-foreground block text-xs">
                      {f.detalhe} · {f.n} no mês
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            <SeloDemonstracao fonte="DDA e caixa de e-mail (simulados)" />
          </Caixa>
          <Caixa className="flex-1">
            <Pergunta
              acao={
                usuario.papel === 'administrador' && (
                  <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setModal('alcadas')}>
                    <GearSixIcon /> Editar
                  </Button>
                )
              }
            >
              Alçadas
            </Pergunta>
            <ul className="flex flex-col gap-1.5 text-sm">
              <li>até {brl(fin.politica?.limite_gestor ?? 5000)}: Gestor com o setor Financeiro</li>
              <li>até {brl(dois)}: Administrador</li>
              <li>acima: Administrador + segundo sócio</li>
            </ul>
          </Caixa>
        </div>
      </div>

      {modal === 'capturar' && <CapturarConta fin={fin} onFechar={() => setModal(null)} />}
      {modal === 'alcadas' && <ModaisConfig aberto="alcadas" onFechar={() => setModal(null)} />}
      {modal && typeof modal === 'object' && modal.tipo === 'classificar' && <Classificar fin={fin} c={modal.c} onFechar={() => setModal(null)} />}
      {modal && typeof modal === 'object' && modal.tipo === 'comprovante' && (
        <GavetaFormulario
          aberta
          onFechar={() => setModal(null)}
          titulo={`Comprovante · ${modal.c.fornecedor}`}
          descricao="O comprovante do banco dá a baixa; vai para Arquivos em _escritorio/financeiro."
          acao="Anexar e dar baixa"
          onAcao={() => {
            if (executar(() => repos.contasPagar.atualizar(modal.c.id, { situacao: 'paga', comprovante: `comprovante-${modal.c.id}.pdf` }, { ferramenta: 'conta_pagar.baixar', texto: `Comprovante anexado: ${modal.c.fornecedor} paga` }), { sucesso: 'Baixa feita com o comprovante.' })) setModal(null)
          }}
        >
          <Nota>
            <FileArrowUpIcon className="mr-1 inline size-4" /> comprovante-{modal.c.id}.pdf (do banco, {brl(modal.c.valor, true)})
          </Nota>
        </GavetaFormulario>
      )}
      {modal && typeof modal === 'object' && modal.tipo === 'conferir' && (
        <GavetaFormulario
          aberta
          onFechar={() => setModal(null)}
          titulo={`Conferir · ${modal.c.fornecedor}`}
          descricao={`${brl(modal.c.valor, true)} · vence ${dataCurta(modal.c.vencimento)} · via ${rotuloOrigem[modal.c.origem]}`}
          acao="É legítima: liberar para aprovar"
          onAcao={() => {
            if (executar(() => repos.contasPagar.atualizar(modal.c.id, { alerta: null }, { texto: `${usuario.nome} conferiu e liberou ${modal.c.fornecedor} para aprovação` }), { sucesso: 'Conferida: liberada para aprovar.' })) setModal(null)
          }}
          secundaria={
            <Button
              type="button"
              variant="ghost"
              className="text-destructive-text rounded-full"
              onClick={() => {
                if (executar(() => repos.contasPagar.cancelar(modal.c.id, modal.c.alerta ?? 'descartada na conferência'), { sucesso: 'Conta descartada; o integrante não traz mais este boleto.' })) setModal(null)
              }}
            >
              Descartar
            </Button>
          }
        >
          <Nota tom="alerta">{modal.c.alerta}</Nota>
          {modal.c.codigo_barras && <p className="font-mono text-xs break-all">{modal.c.codigo_barras}</p>}
          <p className="text-muted-foreground text-sm">Fornecedor novo ou boleto parecido com outro é o golpe mais comum em contas a pagar. Confira o CNPJ do beneficiário no boleto antes de liberar.</p>
        </GavetaFormulario>
      )}
    </PaginaFin>
  )
}

/** S07-A24 · Capturar conta: arquivo (OCR), código de barras ou à mão. */
function CapturarConta({ fin, onFechar }: { fin: Fin; onFechar: () => void }) {
  const executar = useAcao()
  const [modo, setModo] = useState<'arquivo' | 'codigo_barras' | 'manual'>('arquivo')
  const [fornecedor, setFornecedor] = useState('')
  const [valor, setValor] = useState('')
  const [venc, setVenc] = useState(somarDias(HOJE, 10))
  const [categoria, setCategoria] = useState('Software')
  const [codigo, setCodigo] = useState('')
  const [lido, setLido] = useState<{ s: 'nao' | 'lendo' | 'ok'; fonte?: string }>({ s: 'nao' })
  const ler = async () => {
    setLido({ s: 'lendo' })
    try {
      const r = await apis.ocr.ler({ nome: 'boleto.pdf', mime: 'application/pdf' })
      setFornecedor(r.dados.campos.beneficiario ?? r.dados.campos.emitente ?? 'Papelaria Central Ltda')
      setValor(r.dados.campos.valor?.replace(/[^\d,]/g, '') || '486,90')
      setCodigo('34191.79001 01043.510047 91020.150008 8 10010000048690')
      setLido({ s: 'ok', fonte: r.fonte })
    } catch {
      setLido({ s: 'nao' })
    }
  }
  const duplicada = fin.contasPagar.find((c) => c.situacao !== 'cancelada' && ((codigo && c.codigo_barras === codigo) || (c.fornecedor === fornecedor && Math.abs(c.valor - numero(valor)) < 0.01)))
  const novo = fornecedor && !fin.contasPagar.some((c) => c.fornecedor === fornecedor)
  return (
    <GavetaFormulario
      aberta
      onFechar={onFechar}
      titulo="Capturar conta a pagar"
      descricao="Por arquivo (o integrante lê), por código de barras ou à mão. Cai na fila para aprovar; nada é pago sem aprovação."
      acao="Lançar na fila"
      acaoDesabilitada={!fornecedor.trim() || numero(valor) <= 0}
      onAcao={() => {
        const alerta = duplicada ? `possível duplicidade com ${duplicada.fornecedor} (${dataCurta(duplicada.vencimento)})` : novo ? 'fornecedor novo: confira o CNPJ do beneficiário antes de aprovar' : null
        if (executar(() => repos.contasPagar.criar({ titular_tipo: 'escritorio', fornecedor: fornecedor.trim(), categoria, valor: numero(valor), vencimento: venc, competencia: venc.slice(0, 7), origem: modo === 'manual' ? 'manual' : modo, situacao: 'aguardando_aprovacao', centro_custo_id: 'cc-estrutura', codigo_barras: codigo || null, alerta }), { sucesso: alerta ? `Lançada com alerta: ${alerta}.` : 'Lançada na fila para aprovar.' })) onFechar()
      }}
    >
      <Segmentado
        rotulo="Como"
        valor={modo}
        onMudar={setModo}
        opcoes={[
          { valor: 'arquivo', rotulo: 'Arquivo' },
          { valor: 'codigo_barras', rotulo: 'Código de barras' },
          { valor: 'manual', rotulo: 'À mão' },
        ]}
      />
      {modo === 'arquivo' && (
        <span className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" className="w-fit rounded-full" disabled={lido.s === 'lendo'} onClick={ler}>
            <FileArrowUpIcon /> {lido.s === 'ok' ? 'boleto.pdf lido' : lido.s === 'lendo' ? 'Lendo…' : 'Enviar boleto ou nota'}
          </Button>
          {lido.s === 'ok' && <SeloDemonstracao fonte={lido.fonte} />}
        </span>
      )}
      {modo !== 'manual' && (
        <Campo rotulo="Linha digitável">
          {(id) => (
            <span className="flex gap-2">
              <CampoTexto id={id} valor={codigo} onMudar={setCodigo} mono placeholder="00000.00000 00000.000000 00000.000000 0 00000000000000" className="flex-1" />
              <BarcodeIcon className="text-muted-foreground size-5 self-center" />
            </span>
          )}
        </Campo>
      )}
      <Campo rotulo="Fornecedor">{(id) => <CampoTexto id={id} valor={fornecedor} onMudar={setFornecedor} />}</Campo>
      <div className="grid grid-cols-2 gap-3">
        <Campo rotulo="Valor (R$)">{(id) => <CampoTexto id={id} valor={valor} onMudar={setValor} />}</Campo>
        <Campo rotulo="Vencimento">{(id) => <CampoEscolha id={id} valor={venc} onMudar={setVenc} opcoes={[3, 5, 7, 10, 15, 20, 30].map((d) => somarDias(HOJE, d)).map((d) => ({ valor: d, rotulo: dataCurta(d) }))} />}</Campo>
      </div>
      <Campo rotulo="Categoria" ajuda="O integrante propõe pela regra do fornecedor; você ajusta.">{(id) => <CampoEscolha id={id} valor={categoria} onMudar={setCategoria} opcoes={fin.categorias.filter((c) => c.ativa && c.natureza !== 'receita').map((c) => ({ valor: c.nome, rotulo: c.nome }))} />}</Campo>
      {duplicada && <Nota tom="alerta">Parece duplicada: {duplicada.fornecedor}, {brl(duplicada.valor, true)}, vence {dataCurta(duplicada.vencimento)}.</Nota>}
      {novo && !duplicada && <Nota tom="alerta">Fornecedor novo: vai com alerta para conferir o CNPJ antes de aprovar.</Nota>}
    </GavetaFormulario>
  )
}

/** S07-A25 · Classificar: categoria, centro de custo e rateio. */
function Classificar({ fin, c, onFechar }: { fin: Fin; c: ContaPagarFin; onFechar: () => void }) {
  const executar = useAcao()
  const [categoria, setCategoria] = useState(c.categoria)
  const [rateio, setRateio] = useState<{ centro_custo_id: string; percentual: number }[]>(c.rateio?.length ? c.rateio : [{ centro_custo_id: c.centro_custo_id ?? 'cc-estrutura', percentual: 100 }])
  const soma = rateio.reduce((s, r) => s + r.percentual, 0)
  return (
    <GavetaFormulario
      aberta
      onFechar={onFechar}
      titulo={`Classificar · ${c.fornecedor}`}
      descricao="A categoria vai para a DRE; o centro de custo (ou o rateio) leva o custo ao setor e ao custo-hora."
      acao="Salvar"
      acaoDesabilitada={soma !== 100}
      onAcao={() => {
        if (executar(() => repos.contasPagar.atualizar(c.id, { categoria, centro_custo_id: rateio.length === 1 ? rateio[0].centro_custo_id : null, rateio: rateio.length > 1 ? rateio : null, situacao: c.situacao === 'capturada' ? 'aguardando_aprovacao' : c.situacao }, { texto: `Classificada: ${c.fornecedor} em ${categoria}` }), { sucesso: 'Classificação salva.' })) onFechar()
      }}
    >
      <Campo rotulo="Categoria">{(id) => <CampoEscolha id={id} valor={categoria} onMudar={setCategoria} opcoes={fin.categorias.filter((x) => x.ativa && x.natureza !== 'receita').map((x) => ({ valor: x.nome, rotulo: `${x.codigo} ${x.nome}` }))} />}</Campo>
      <section className="flex flex-col gap-2">
        <h3 className="text-sm font-medium">Centro de custo e rateio</h3>
        {rateio.map((r, i) => (
          <div key={i} className="grid grid-cols-[minmax(0,1fr)_5rem_auto] items-end gap-2">
            <CampoEscolha rotulo={`Centro ${i + 1}`} valor={r.centro_custo_id} onMudar={(v) => setRateio((xs) => xs.map((x, k) => (k === i ? { ...x, centro_custo_id: v } : x)))} opcoes={fin.centros.filter((x) => x.ativo).map((x) => ({ valor: x.id, rotulo: x.nome }))} />
            <CampoTexto valor={String(r.percentual)} onMudar={(v) => setRateio((xs) => xs.map((x, k) => (k === i ? { ...x, percentual: Number(v.replace(/\D/g, '')) || 0 } : x)))} aria-label={`Percentual do centro ${i + 1}`} />
            <Button type="button" size="sm" variant="ghost" className="rounded-full" disabled={rateio.length === 1} onClick={() => setRateio((xs) => xs.filter((_, k) => k !== i))}>
              Tirar
            </Button>
          </div>
        ))}
        <Button type="button" size="sm" variant="outline" className="w-fit rounded-full" onClick={() => setRateio((xs) => [...xs, { centro_custo_id: 'cc-fiscal', percentual: 0 }])}>
          <PlusIcon /> Ratear com outro centro
        </Button>
        <p className={soma === 100 ? 'text-muted-foreground text-xs' : 'text-destructive-text text-xs'}>Soma: {soma}% {soma !== 100 && '(precisa dar 100%)'}</p>
      </section>
    </GavetaFormulario>
  )
}

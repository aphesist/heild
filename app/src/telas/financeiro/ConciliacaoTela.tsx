import { ArrowsClockwiseIcon, BankIcon, CheckIcon, PencilSimpleIcon, ScalesIcon, WarningIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { useSessao } from '@/ambiente/sessao'
import { BotaoAcoes, EstadoVazio, SeloDemonstracao, useAcao, useConfirmar } from '@/components/kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Campo, CampoEscolha, CampoTexto, GavetaFormulario } from '@/components/ui/formulario'
import type { Lancamento } from '@/nucleo/modelo/financeiro'
import { repos } from '@/nucleo/repositorios'
import { servicos as apis } from '@/servicos'
import { brl, CabecalhoFin, Caixa, CartoesDaAba, Nota, Numero, PaginaFin, Pergunta } from './comum'
import { ConectarConta } from './configuracao'
import { useFin, useIntegranteFin, usePodeFin, type Fin, useTitularEscritorio } from './dados'
import { dataCurta, diasEntre, HOJE } from './dominio'
import { SeloTitular } from './pecas'

const numero = (s: string) => Number(s.replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '')) || 0

/**
 * S07-T05 · Financeiro › Conciliação (FIN-004; 09, 6.2): o extrato chega pelo
 * provedor de cobrança e pelo Open Finance (simulado); o integrante casa
 * sozinho pelo que tem regra aprovada e sugere o resto. A pessoa confirma,
 * aceita em lote as seguras, faz ajuste (cartão), aprova regras e renova o
 * consentimento.
 */
export function ConciliacaoTela() {
  const fin = useFin()
  const titular = useTitularEscritorio()
  const integrante = useIntegranteFin()
  const executar = useAcao()
  const confirmar = useConfirmar()
  const { usuario } = useSessao()
  const pode = usePodeFin('conciliacao.confirmar')
  const podeConectar = usePodeFin('conta_bancaria.conectar')
  const podeRegra = usePodeFin('regra_categorizacao.aprovar')
  const [escolha, setEscolha] = useState<Record<string, string>>({})
  const [modal, setModal] = useState<{ tipo: 'ajuste'; l: Lancamento } | { tipo: 'renovar'; conta: string } | { tipo: 'conectar' } | null>(null)
  const ativas = fin.regras.filter((r) => r.situacao === 'ativa')
  const regraDe = (l: Lancamento) => ativas.find((r) => r.id === l.regra_id || l.descricao_extrato.toUpperCase().includes(r.padrao.toUpperCase()))
  const sugeridos = fin.lancamentos.filter((l) => l.situacao === 'sugerido')
  const divergencias = fin.lancamentos.filter((l) => l.situacao === 'nao_conciliado')
  const seguras = sugeridos.filter((l) => regraDe(l))
  const conciliados = fin.lancamentos.filter((l) => l.situacao === 'conciliado' || l.situacao === 'transferencia')
  const porRegra = conciliados.filter((l) => l.regra_id).length
  const categorias = fin.categorias.filter((c) => c.ativa).map((c) => c.nome)
  const vencidas = fin.contasBancarias.filter((c) => c.situacao === 'consentimento_vencido' || (c.consentimento_ate && diasEntre(HOJE, c.consentimento_ate) <= 30))
  const nomeConta = (id: string) => fin.contasBancarias.find((c) => c.id === id)?.nome ?? id

  const confirmarUm = (l: Lancamento, categoria: string, texto?: string) => {
    executar(() => {
      const transferencia = categoria === 'Transferência entre contas'
      repos.lancamentos.atualizar(l.id, { situacao: transferencia ? 'transferencia' : 'conciliado', categoria, vinculo: transferencia ? { tipo: 'transferencia' } : l.vinculo ?? null }, { texto: texto ?? `${usuario.nome} confirmou ${l.descricao_extrato} em ${categoria}` })
      // Confirmar ensina: o padrão do extrato vira (ou reforça) uma regra proposta, que só vale aprovada.
      const padrao = l.descricao_extrato.replace(/\d[\d.\s]*$/, '').trim().slice(0, 28)
      const existente = fin.regras.find((r) => r.padrao.toUpperCase() === padrao.toUpperCase())
      if (existente) repos.regrasCategorizacao.atualizar(existente.id, { vezes: existente.vezes + 1 }, { texto: `Regra ${existente.padrao} reforçada` })
      else if (!transferencia) repos.regrasCategorizacao.criar({ padrao, categoria, situacao: 'proposta', vezes: 1, exemplo: `${dataCurta(l.data)} · ${brl(l.valor, true)}` }, { texto: `Regra proposta: ${padrao} → ${categoria}` })
    })
  }
  const aceitarSeguras = () => {
    for (const l of seguras) executar(() => repos.lancamentos.atualizar(l.id, { situacao: l.sugestao === 'Transferência entre contas' ? 'transferencia' : 'conciliado', categoria: l.sugestao ?? regraDe(l)?.categoria, regra_id: regraDe(l)?.id }, { texto: `${usuario.nome} aceitou em lote: ${l.descricao_extrato} (regra ${regraDe(l)?.padrao})` }))
    executar(() => undefined, { sucesso: `${seguras.length} lançamento(s) conciliado(s) pela regra aprovada.` })
  }
  const conciliarAgora = () => {
    const conta = fin.contasBancarias.find((c) => c.situacao === 'ativa' && c.origem === 'open_finance') ?? fin.contasBancarias[0]
    if (!conta) return
    integrante.trabalhar({
      id: 'conciliar',
      titulo: `Conciliar o extrato de ${conta.nome}`,
      inicio: `Vou buscar o extrato de ${conta.nome} e casar com as cobranças, as contas a pagar e as regras aprovadas.`,
      etapas: ['Buscando o extrato pelo Open Finance', 'Casando com as cobranças em aberto', 'Aplicando as regras aprovadas', 'Separando o que pede você'],
      fim: 'Conciliei o que tinha regra aprovada e deixei as sugestões novas para você confirmar.',
      aviso: 'Financeiro conciliou o extrato de hoje',
      aoTerminar: async () => {
        try {
          const r = await apis.bancos.extrato(conta.id, { de: HOJE, ate: HOJE })
          for (const [i, x] of r.dados.slice(0, 3).entries()) {
            const regra = ativas.find((g) => x.descricao.toUpperCase().includes(g.padrao.toUpperCase()))
            repos.lancamentos.criar({ titular_tipo: 'escritorio', conta_id: conta.id, data: HOJE, valor: x.valor, descricao_extrato: x.descricao, origem: 'open_finance', situacao: regra ? 'conciliado' : 'sugerido', categoria: regra?.categoria ?? null, regra_id: regra?.id ?? null, sugestao: regra ? null : x.valor > 0 ? 'Honorários mensais' : i === 1 ? 'Tarifas bancárias' : 'Software', confianca: regra ? 'alta' : 'baixa', extras: { demonstracao: r.fonte } }, { semAutorizar: true, texto: `Extrato (${r.fonte}): ${x.descricao}` })
          }
        } catch {
          /* falha simulada: o integrante avisa no chat e tenta de novo depois */
        }
      },
    })
  }

  return (
    <PaginaFin fin={fin}>
      <CabecalhoFin titulo="Conciliação" exportar="extrato" status={`Casei ${conciliados.length} lançamentos sozinho; ${sugeridos.length} sugestões e ${divergencias.length} divergências esperam você`} sub={`Extrato pelo provedor de cobrança e pelo Open Finance · ${fin.contasBancarias.length} contas · nada muda o valor do banco: correção é ajuste`}>
        <SeloTitular titular={titular} />
        {pode && (
          <Button size="sm" variant="outline" className="rounded-full" disabled={integrante.fazendo('conciliar')} onClick={conciliarAgora}>
            <ArrowsClockwiseIcon /> {integrante.fazendo('conciliar') ? 'Conciliando…' : 'Conciliar agora'}
          </Button>
        )}
      </CabecalhoFin>

      <CartoesDaAba fin={fin} aba="conciliacao" />

      {vencidas.map((c) => (
        <Nota key={c.id} tom="alerta">
          <WarningIcon className="text-warning mr-1 inline size-4" weight="fill" />
          {c.situacao === 'consentimento_vencido' ? `${c.nome}: o consentimento do Open Finance venceu em ${dataCurta(c.consentimento_ate)}; o extrato parou de chegar.` : `${c.nome}: o consentimento vence em ${dataCurta(c.consentimento_ate)} (${diasEntre(HOJE, c.consentimento_ate!)} dias).`}{' '}
          {podeConectar && (
            <Button size="sm" variant="outline" className="ml-1 rounded-full" onClick={() => setModal({ tipo: 'renovar', conta: c.id })}>
              Renovar consentimento
            </Button>
          )}
        </Nota>
      ))}

      <Caixa>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          <Numero valor={fin.lancamentos.length} rotulo="lançamentos de 01/11 a hoje" />
          <Numero valor={conciliados.length} rotulo="conciliados" detalhe={`${porRegra} por regra aprovada`} />
          <Numero valor={sugeridos.length} rotulo="sugestões para confirmar" detalhe={`${seguras.length} seguras (regra aprovada)`} />
          <Numero valor={divergencias.length} rotulo="divergências" />
          <Numero valor={brl(fin.contasBancarias.filter((c) => c.saldo > 0).reduce((s, c) => s + c.saldo, 0))} rotulo="saldo no banco = no sistema" />
        </div>
      </Caixa>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Caixa>
          <Pergunta
            descricao="A sugestão vem do histórico e das regras. Confirmar liga o lançamento e ensina uma regra (que só vale depois de aprovada)."
            acao={
              pode &&
              seguras.length > 0 && (
                <Button size="sm" variant="outline" className="rounded-full" onClick={aceitarSeguras}>
                  <CheckIcon /> Aceitar as seguras ({seguras.length})
                </Button>
              )
            }
          >
            O que sobrou da conciliação automática
          </Pergunta>
          {!sugeridos.length ? (
            <EstadoVazio compacto icone={ScalesIcon} titulo="Tudo conciliado até hoje" descricao="O que não casar sozinho aparece aqui com a sugestão do integrante." />
          ) : (
            <ul className="divide-border/70 flex flex-col divide-y">
              {sugeridos.map((l) => (
                <li key={l.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 py-2.5 text-sm md:grid-cols-[minmax(0,1fr)_minmax(0,14rem)_minmax(7rem,max-content)_auto]">
                  <span className="min-w-0">
                    <span className="block truncate font-mono text-xs">{l.descricao_extrato}</span>
                    <span className="text-muted-foreground block text-xs">
                      {dataCurta(l.data)} · {nomeConta(l.conta_id)}
                      {regraDe(l) ? ` · regra aprovada: ${regraDe(l)!.padrao}` : l.confianca === 'baixa' ? ' · sugestão incerta' : ' · sem regra aprovada'}
                    </span>
                  </span>
                  <span className="text-right tabular-nums md:order-3">{brl(l.valor, true)}</span>
                  <span className="col-span-2 md:order-2 md:col-span-1">
                    <CampoEscolha rotulo={`Categoria de ${l.descricao_extrato}`} valor={escolha[l.id] ?? l.sugestao ?? categorias[0]} onMudar={(v) => setEscolha((x) => ({ ...x, [l.id]: v }))} opcoes={[...new Set([l.sugestao ?? categorias[0], ...categorias])].map((x) => ({ valor: x, rotulo: x }))} />
                  </span>
                  {pode && (
                    <span className="col-start-2 row-start-1 flex justify-end gap-1 md:order-4 md:col-start-auto md:row-start-auto">
                      <Button size="sm" variant="ghost" className="rounded-full" onClick={() => confirmarUm(l, escolha[l.id] ?? l.sugestao ?? categorias[0])}>
                        <CheckIcon /> Ok
                      </Button>
                      <BotaoAcoes rotulo={`Mais ações de ${l.descricao_extrato}`} acoes={[{ rotulo: 'Ajuste manual (cartão)', onSelecionar: () => setModal({ tipo: 'ajuste', l }) }]} />
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Caixa>
        <div className="flex flex-col gap-4">
          <Caixa>
            <Pergunta descricao="O que pede uma pessoa: pagador desconhecido, valor diferente.">Divergências</Pergunta>
            {!divergencias.length && <p className="text-muted-foreground text-sm">Nenhuma divergência.</p>}
            <ul className="flex flex-col gap-3">
              {divergencias.map((l) => (
                <li key={l.id} className="flex flex-col gap-1.5 text-sm">
                  <span className="flex items-start gap-2">
                    <WarningIcon className="text-warning mt-0.5 size-4 shrink-0" weight="fill" />
                    <span className="min-w-0 flex-1">
                      <span className="block">{l.divergencia}</span>
                      <span className="text-muted-foreground block text-xs">
                        {l.descricao_extrato} · {dataCurta(l.data)} · {brl(l.valor, true)}
                      </span>
                    </span>
                  </span>
                  {pode && (
                    <span className="flex flex-wrap gap-1.5 pl-6">
                      {l.sugestao && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full"
                          onClick={() => {
                            const parcela = fin.parcelas.find((p) => p.situacao === 'aberta' && Math.abs(p.valor - l.valor) < 0.01)
                            executar(() => {
                              if (parcela) repos.parcelas.atualizar(parcela.id, { situacao: 'paga' }, { texto: `Parcela ${parcela.numero} paga (conciliação)` })
                              const solto = fin.recebimentos.find((r) => r.situacao === 'nao_localizado' && Math.abs(r.valor - l.valor) < 0.01)
                              if (solto && parcela) repos.recebimentos.atualizar(solto.id, { cobranca_id: parcela.cobranca_id, parcela_id: parcela.id, situacao: 'confirmado' }, { texto: 'Recebimento vinculado pela conciliação' })
                              if (parcela && !fin.parcelas.some((p) => p.cobranca_id === parcela.cobranca_id && p.situacao === 'aberta' && p.id !== parcela.id)) repos.cobrancas.anotar(parcela.cobranca_id, 'Acordo quitado: a última parcela foi paga (conciliação)', { situacao: 'paga', paga_em: l.data })
                              return repos.lancamentos.atualizar(l.id, { situacao: 'conciliado', categoria: 'Honorários mensais', divergencia: null, vinculo: { tipo: 'cobranca', id: parcela?.cobranca_id ?? null } }, { texto: `${usuario.nome} aceitou: ${l.sugestao}` })
                            }, { sucesso: 'Conciliado e baixado.' })
                          }}
                        >
                          Aceitar a sugestão
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setModal({ tipo: 'ajuste', l })}>
                        Ajuste manual
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-full"
                        onClick={async () => {
                          const motivo = await confirmar({ titulo: 'Ignorar este lançamento?', descricao: 'Fica no extrato, marcado como ignorado, com o motivo.', acao: 'Ignorar', exigirMotivo: true })
                          if (typeof motivo === 'string') executar(() => repos.lancamentos.atualizar(l.id, { situacao: 'ignorado', divergencia: `ignorado: ${motivo}` }, { texto: `${usuario.nome} ignorou ${l.descricao_extrato}: ${motivo}` }))
                        }}
                      >
                        Ignorar
                      </Button>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </Caixa>
          <Regras fin={fin} pode={podeRegra} />
        </div>
      </div>

      <Caixa>
        <Pergunta
          descricao="De onde vem cada extrato; o consentimento do Open Finance dura 12 meses."
          acao={
            podeConectar && (
              <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setModal({ tipo: 'conectar' })}>
                <BankIcon /> Conectar conta
              </Button>
            )
          }
        >
          Contas e consentimentos
        </Pergunta>
        <ul className="divide-border/70 flex flex-col divide-y">
          {fin.contasBancarias.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center gap-3 py-2 text-sm">
              <BankIcon className="text-muted-foreground size-5 shrink-0" weight="duotone" />
              <span className="min-w-0 flex-1">
                <span className="block">{c.nome}</span>
                <span className="text-muted-foreground block text-xs">
                  {c.origem === 'open_finance' ? 'Open Finance' : c.origem === 'api_banco' ? 'API do banco (cobrança)' : c.origem === 'ofx' ? 'OFX' : 'manual'} · {c.conta_mascarada}
                  {c.consentimento_ate ? ` · consentimento até ${dataCurta(c.consentimento_ate)}` : ''}
                </span>
              </span>
              <Badge variant={c.situacao === 'ativa' ? 'sucesso' : 'erro'}>{c.situacao === 'ativa' ? 'ativa' : c.situacao === 'consentimento_vencido' ? 'consentimento vencido' : 'inativa'}</Badge>
              {podeConectar && c.origem === 'open_finance' && (
                <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setModal({ tipo: 'renovar', conta: c.id })}>
                  Renovar
                </Button>
              )}
            </li>
          ))}
        </ul>
        <SeloDemonstracao fonte="Open Finance e API do banco (simulados)" />
      </Caixa>

      {modal?.tipo === 'ajuste' && <Ajuste fin={fin} l={modal.l} onFechar={() => setModal(null)} />}
      {modal?.tipo === 'renovar' && <ConectarConta renovar={modal.conta} onFechar={() => setModal(null)} />}
      {modal?.tipo === 'conectar' && <ConectarConta onFechar={() => setModal(null)} />}
    </PaginaFin>
  )
}

/** S07-A32 · Regras: propostas (aprovar ou descartar) e ativas (pausar). */
function Regras({ fin, pode }: { fin: Fin; pode: boolean }) {
  const executar = useAcao()
  const { usuario } = useSessao()
  const propostas = fin.regras.filter((r) => r.situacao === 'proposta')
  const ativas = fin.regras.filter((r) => r.situacao !== 'proposta')
  return (
    <Caixa className="flex-1">
      <Pergunta descricao="O integrante aprende com o que você confirma. A regra só vale daí em diante, depois de aprovada.">Regras de categorização</Pergunta>
      {propostas.length > 0 && (
        <ul className="flex flex-col gap-2">
          {propostas.map((r) => (
            <li key={r.id} className="bg-sunken/50 flex flex-wrap items-center gap-2 rounded-[14px] px-3 py-2 text-sm">
              <span className="min-w-0 flex-1">
                <span className="block font-mono text-xs">{r.padrao}</span>
                <span className="text-muted-foreground block text-xs">
                  → {r.categoria}
                  {r.centro_custo_id ? ` · ${fin.centros.find((c) => c.id === r.centro_custo_id)?.nome}` : ''} · visto {r.vezes}× {r.exemplo ? `· ${r.exemplo}` : ''}
                </span>
              </span>
              <Badge variant="destaque">proposta</Badge>
              {pode && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => {
                      executar(() => {
                        repos.regrasCategorizacao.atualizar(r.id, { situacao: 'ativa', aprovada_por: usuario.nome }, { texto: `${usuario.nome} aprovou a regra ${r.padrao} → ${r.categoria}` })
                        for (const l of fin.lancamentos.filter((x) => x.situacao === 'sugerido' && x.descricao_extrato.toUpperCase().includes(r.padrao.toUpperCase()))) repos.lancamentos.atualizar(l.id, { regra_id: r.id, sugestao: r.categoria, confianca: 'alta' }, { texto: `Regra ${r.padrao} passou a valer para ${l.descricao_extrato}` })
                      }, { sucesso: 'Regra aprovada: vale daí em diante.' })
                    }}
                  >
                    Aprovar
                  </Button>
                  <Button size="sm" variant="ghost" className="rounded-full" onClick={() => executar(() => repos.regrasCategorizacao.excluir(r.id), { sucesso: 'Regra descartada.' })}>
                    Descartar
                  </Button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
      <ul className="flex flex-col gap-1 text-sm">
        {ativas.map((r) => (
          <li key={r.id} className="flex items-center gap-2">
            <span className="min-w-0 flex-1 truncate">
              <span className="font-mono text-xs">{r.padrao}</span> <span className="text-muted-foreground">→ {r.categoria}</span>
            </span>
            <span className="text-muted-foreground text-xs">{r.vezes}×</span>
            {pode && (
              <Button size="sm" variant="ghost" className="rounded-full" onClick={() => executar(() => repos.regrasCategorizacao.atualizar(r.id, { situacao: r.situacao === 'ativa' ? 'pausada' : 'ativa' }, { texto: `Regra ${r.padrao} ${r.situacao === 'ativa' ? 'pausada' : 'reativada'}` }))}>
                {r.situacao === 'ativa' ? 'Pausar' : 'Reativar'}
              </Button>
            )}
          </li>
        ))}
      </ul>
    </Caixa>
  )
}

/** S07-A31 · Ajuste manual: vira cartão; o lançamento original não muda (o ajuste é outro lançamento). */
function Ajuste({ fin, l, onFechar }: { fin: Fin; l: Lancamento; onFechar: () => void }) {
  const integrante = useIntegranteFin()
  const [valor, setValor] = useState(String(-l.valor).replace('.', ','))
  const [categoria, setCategoria] = useState(l.sugestao ?? 'Tarifas bancárias')
  const [motivo, setMotivo] = useState('')
  return (
    <GavetaFormulario
      aberta
      onFechar={onFechar}
      titulo="Ajuste manual"
      descricao={`${l.descricao_extrato} · ${brl(l.valor, true)}. O lançamento do banco é imutável: o ajuste entra como outro lançamento, ligado a ele, depois do cartão aprovado.`}
      acao="Preparar o cartão"
      acaoDesabilitada={!motivo.trim()}
      onAcao={() => {
        integrante.pedirCartao({ id: `ajuste-${l.id}`, acao: { tipo: 'ajuste_conciliacao', lancamento_id: l.id, valor: numero(valor), categoria, motivo: motivo.trim() }, resumo: `Ajuste manual em ${l.descricao_extrato}`, argumentos: [{ rotulo: 'Ajuste', valor: brl(numero(valor), true) }, { rotulo: 'Categoria', valor: categoria }, { rotulo: 'Motivo', valor: motivo.trim() }], texto: 'Preparei o ajuste que você pediu; o lançamento do banco fica como veio e o ajuste entra ligado a ele.', aba: 'conciliacao', alcada: 'gestor', ferramenta: 'conciliacao.ajustar' })
        onFechar()
      }}
    >
      <Campo rotulo="Valor do ajuste (R$, com sinal)">{(id) => <CampoTexto id={id} valor={valor} onMudar={setValor} />}</Campo>
      <Campo rotulo="Categoria">{(id) => <CampoEscolha id={id} valor={categoria} onMudar={setCategoria} opcoes={fin.categorias.filter((c) => c.ativa).map((c) => ({ valor: c.nome, rotulo: c.nome }))} />}</Campo>
      <Campo rotulo="Motivo" erro={!motivo.trim() ? 'Ajuste exige o motivo.' : undefined}>{(id) => <CampoTexto id={id} valor={motivo} onMudar={setMotivo} placeholder="Ex.: juros recebidos a mais na baixa" />}</Campo>
      <p className="text-muted-foreground flex items-center gap-1 text-xs">
        <PencilSimpleIcon className="size-3" /> O mês fechado não aceita ajuste retroativo: reabra com motivo.
      </p>
    </GavetaFormulario>
  )
}

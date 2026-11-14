// S03: gatilhos do Painel B no painel Demonstração (o integrante acorda e trabalha como no produto).
import { LightningIcon } from '@phosphor-icons/react'
import { useLoja } from '@/ambiente/loja'
import { definirEstadoConector, useEstadoConector } from '@/dados/conectores'
import { brl, COMPETENCIA, ddmm, fiscalS03, HOJE, perfilS03, somarDias } from '@/dados/painel-s03'
import { usePostarS03 } from './cartoes'
import { chaveContabil, chaveFiscal, contabilVazio, fiscalVazio, gravarEstado, hojeCurto } from './estado'

/**
 * Cada botão dispara o que no produto viria de um evento ou de um job (02, 7.1
 * e 7.2): o integrante do setor começa, mostra as etapas, faz sozinho o que é
 * reversível e deixa um cartão para o que transmite, cobra ou sai ao cliente.
 */
export function SecaoS03({ onFeito }: { onFeito?: () => void }) {
  const loja = useLoja()
  const postar = usePostarS03()
  const integra = useEstadoConector('integra_contador')
  const clientes = loja.clientes.filter((c) => !c.servicos || c.servicos.includes('contabil'))
  const metal = clientes.find((c) => c.id === 'c1') ?? clientes[0]
  const btn = 'text-muted-foreground hover:bg-sunken/70 flex cursor-pointer items-center gap-2 rounded-[10px] px-2 py-1.5 text-left text-sm'
  const feito = () => onFeito?.()

  const mensagemCaixa = () => {
    if (!metal) return
    const id = `${metal.id}:cpx${Date.now()}`
    loja.iniciarTrabalho({
      id: `s03-gatilho-caixa-${Date.now()}`,
      integrante: 'i-fiscal',
      setor: 'fiscal',
      titulo: 'Mensagem nova na caixa postal',
      cliente: metal.nome,
      inicio: 'Chegou mensagem no e-CAC. Vou ler o resumo sem abrir (listar não dá ciência).',
      etapas: ['Lendo o assunto e o resumo', 'Classificando', 'Calculando a ciência tácita (10 dias)', 'Abrindo a tarefa'],
      seg: 1,
      fim: { texto: `Mensagem nova no e-CAC de ${metal.nome}: termo de intimação sobre retenções. Não abri: a ciência tácita é em ${ddmm(somarDias(HOJE, 10))}. Deixei o cartão para abrir quando você quiser.`, aviso: `Caixa postal: mensagem nova · ${metal.nome}` },
    })
    window.setTimeout(() => {
      gravarEstado(loja, chaveFiscal(metal.id), fiscalVazio, (x) => ({ ...x, caixasExtras: [{ id, orgao: 'e-CAC', assunto: 'Termo de intimação: retenções de IRRF de agosto', resumo: 'Pede a comprovação das retenções de IRRF informadas pelos tomadores em 08/2026.', classificacao: 'intimação' as const, recebida: HOJE, teor: 'Fica o contribuinte intimado a apresentar os comprovantes das retenções de IRRF de 08/2026 no prazo de 20 dias contados da ciência.', prazoResposta: 20 }, ...x.caixasExtras] }))
      postar({ setor: 'fiscal', acao: 'fiscal.caixa.abrir', cliente: { id: metal.id, nome: metal.nome }, chave: `abrir:${id}`, texto: 'Mensagem nova no e-CAC. Abrir dá ciência hoje e começa o prazo de 20 dias.', resumo: `Abrir mensagem e-CAC · ${metal.nome}`, argumentos: [{ rotulo: 'Abrir hoje', valor: `prazo até ${ddmm(somarDias(HOJE, 20))}` }, { rotulo: 'Sem abrir', valor: `ciência tácita em ${ddmm(somarDias(HOJE, 10))}` }], expira: `expira em ${ddmm(somarDias(HOJE, 9))}`, dados: { msgId: id, assunto: 'Termo de intimação: retenções de IRRF de agosto', orgao: 'e-CAC', classificacao: 'intimação', prazoResposta: 20 } })
    }, 5500)
    feito()
  }

  const extratoChegou = () => {
    if (!metal) return
    const p = perfilS03(metal)
    const banco = p.bancos[p.bancos.length - 1]
    loja.iniciarTrabalho({
      id: `s03-gatilho-extrato-${Date.now()}`,
      integrante: 'i-contabil',
      setor: 'contabil',
      titulo: `Extrato ${banco} chegou pelo WhatsApp`,
      cliente: metal.nome,
      inicio: `Chegou um PDF no WhatsApp de ${metal.nome}. Vou ler e encaixar na competência.`,
      etapas: ['Regra do mês: “out/26” no nome (D-02)', 'Lendo o PDF (D-11)', 'Descartando as linhas que já vieram no CSV', 'Reconhecendo o sócio pelo CPF mascarado'],
      seg: 1,
      fim: { texto: `Extrato ${banco} de ${COMPETENCIA} encaixado: a pendência baixou sozinha e a coleta andou. Duas saídas para sócios entraram nas dúvidas da distribuição de lucros.`, aviso: `Extrato ${banco} recebido · ${metal.nome}` },
    })
    window.setTimeout(() => {
      const ct = `${metal.id}:ct${p.bancos.length - 1}`
      gravarEstado(loja, chaveContabil(metal.id), contabilVazio, (x) => ({ ...x, chegou: { ...x.chegou, [ct]: hojeCurto() }, extratos: [{ nome: `extrato_${banco.toLowerCase()}_out26.pdf`, formato: 'PDF', linhas: 86, duplicadas: 12, socios: `${p.socios[0]?.nome} (CPF mascarado)`, quando: hojeCurto() }, ...x.extratos] }))
    }, 5000)
    feito()
  }

  const guiaVencida = () => {
    if (!metal) return
    const g = fiscalS03(perfilS03(metal)).guias.find((x) => x.valor > 0 && !x.paga && x.vencimento < HOJE) ?? fiscalS03(perfilS03(metal)).guias.find((x) => x.valor > 0 && !x.paga)
    if (!g) return
    loja.iniciarTrabalho({ id: `s03-gatilho-guia-${Date.now()}`, integrante: 'i-fiscal', setor: 'fiscal', titulo: 'Guia vencida sem pagamento', cliente: metal.nome, inicio: `${g.tributo} de ${metal.nome} venceu sem pagamento informado. Vou preparar a cobrança da régua.`, etapas: ['Conferindo o extrato', 'Recalculando juros e multa', 'Montando a mensagem'], seg: 1, fim: { texto: 'Preparei a cobrança; está como cartão para aprovar.' } })
    window.setTimeout(() => postar({ setor: 'fiscal', acao: 'fiscal.guia.cobrar', cliente: { id: metal.id, nome: metal.nome }, chave: `cobrar:${g.id}`, texto: `${g.tributo} de ${metal.nome} venceu em ${ddmm(g.vencimento)} sem pagamento. Mando a cobrança?`, resumo: `Cobrar pagamento: ${g.tributo} · ${metal.nome}`, argumentos: [{ rotulo: 'Guia', valor: `${brl(g.valor)} · venceu ${ddmm(g.vencimento)}` }], dados: { guiaId: g.id, tributo: g.tributo, valor: g.valor, vencimento: g.vencimento, vencida: true, cobrancas: g.cobrancas ?? 0 } }), 3800)
    feito()
  }

  const lucro50k = () => {
    if (!metal) return
    const socio = perfilS03(metal).socios[0]?.nome ?? 'sócio'
    loja.iniciarTrabalho({ id: `s03-gatilho-50k-${Date.now()}`, integrante: 'i-contabil', setor: 'contabil', titulo: 'Lucro acima de R$ 50 mil no mês', cliente: metal.nome, inicio: `${socio} passou de R$ 50 mil de lucro no mês. Vou calcular a retenção.`, etapas: ['Somando as saídas classificadas como lucro', 'Aplicando a retenção de 10%', 'Avisando uma vez só'], seg: 1, fim: { texto: `${socio} recebeu R$ 80.000,00 de lucro em ${COMPETENCIA}: retenção de 10% (R$ 8.000,00), DARF até 20/11 (Lei 15.270/2025). O aviso aparece uma vez na distribuição de lucros.`, aviso: `Retenção de 10%: ${socio} · ${metal.nome}` } })
    feito()
  }

  const jobPgdas = () => {
    const simples = clientes.filter((c) => c.regime === 'Simples Nacional')
    loja.iniciarTrabalho({ id: `s03-gatilho-pgdas-${Date.now()}`, integrante: 'i-fiscal', setor: 'fiscal', titulo: 'PGDAS-D da carteira (job do dia 8)', inicio: `Vou apurar o PGDAS-D de ${COMPETENCIA} de ${simples.length} clientes do Simples.`, etapas: ['Somando as notas de saída de cada cliente', 'Segregando por anexo e calculando o fator R', 'Separando quem tem pendência'], seg: 1.1, fim: { texto: `PGDAS-D de ${COMPETENCIA} apurado para ${simples.length} clientes. Os prontos estão no lote da carteira (aba Fiscal sem cliente); os de fora, com o motivo.`, aviso: `PGDAS-D da carteira apurado (${simples.length} clientes)`, cartoes: [] } })
    feito()
  }

  return (
    <div className="bg-sunken/60 flex flex-col gap-0.5 rounded-[12px] p-2">
      <span className="text-muted-foreground flex items-center gap-1.5 px-2 text-xs">
        <LightningIcon className="size-3.5" /> Gatilhos do Painel B (Fiscal, Contábil)
      </span>
      <button type="button" className={btn} onClick={mensagemCaixa}>
        Mensagem nova no e-CAC (Metalúrgica)
      </button>
      <button type="button" className={btn} onClick={extratoChegou}>
        Extrato chega pelo WhatsApp (Metalúrgica)
      </button>
      <button type="button" className={btn} onClick={guiaVencida}>
        Guia vence sem pagamento (Metalúrgica)
      </button>
      <button type="button" className={btn} onClick={lucro50k}>
        Sócio passa de R$ 50 mil de lucro no mês
      </button>
      <button type="button" className={btn} onClick={jobPgdas}>
        Job do dia 8: PGDAS-D da carteira
      </button>
      <button type="button" className={btn} onClick={() => definirEstadoConector('integra_contador', { estado: integra.funcionando ? 'fora_do_ar' : 'ativo', mensagem: undefined })}>
        Integra Contador: {integra.funcionando ? 'derrubar (simular fora do ar)' : 'religar'}
      </button>
    </div>
  )
}

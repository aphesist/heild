import { BankIcon, FloppyDiskIcon, TrashIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { useSessao } from '@/ambiente/sessao'
import { useAcao, useConfirmar } from '@/components/kit'
import { Button } from '@/components/ui/button'
import { Campo, CampoTexto, Segmentado } from '@/components/ui/formulario'
import { repos } from '@/nucleo/repositorios'
import { brl, CabecalhoFin, Caixa, CartoesDaAba, Nota, PaginaFin, Pergunta } from './comum'
import { ConectarConta } from './configuracao'
import { projecaoCaixa, useFin, usePodeFin, useTitularEscritorio } from './dados'
import { dataCurta, diasEntre, HOJE } from './dominio'
import { FluxoMensal, SaldosContas, SeloTitular } from './pecas'

const presets = [
  { valor: 'base', rotulo: 'Como está', e: 0, s: 0, texto: 'Contratos vigentes, reajustes comunicados, 13º, saídas avisadas e a inadimplência de hoje.' },
  { valor: 'perde', rotulo: 'Perder 3 clientes', e: -6, s: 0, texto: 'Saem os 3 maiores com contrato vencendo em março: R$ 6 mil a menos por mês.' },
  { valor: 'ganha', rotulo: '5 clientes novos', e: 7, s: 1, texto: 'Pelo ticket médio, a partir de dezembro; um pouco mais de custo com software.' },
  { valor: 'inad', rotulo: 'Inadimplência 5%', e: -6, s: 0, texto: 'Se a inadimplência subir para 5% da receita.' },
  { valor: 'livre', rotulo: 'Do meu jeito', e: 0, s: 0, texto: 'Ajuste as entradas e as saídas por mês.' },
] as const

/**
 * S07-T06 · Financeiro › Fluxo de caixa (FIN-005; 09, 7.1 e 10.5): saldos por
 * conta com a origem, 12 meses de realizado e projetado (listrado, com
 * marcos), o simulador "e se" e os cenários salvos, que o Resultado compara.
 */
export function CaixaTela() {
  const fin = useFin()
  const titular = useTitularEscritorio()
  const executar = useAcao()
  const confirmar = useConfirmar()
  const { usuario } = useSessao()
  const pode = usePodeFin('caixa.salvar_cenario')
  const podeConectar = usePodeFin('conta_bancaria.conectar')
  const [modal, setModal] = useState(false)
  const [preset, setPreset] = useState<(typeof presets)[number]['valor']>('base')
  const [livre, setLivre] = useState({ e: '0', s: '0' })
  const [nome, setNome] = useState('')
  const p = presets.find((x) => x.valor === preset)!
  const aj = preset === 'livre' ? { e: Number(livre.e.replace(',', '.')) || 0, s: Number(livre.s.replace(',', '.')) || 0 } : { e: p.e, s: p.s }
  const d = projecaoCaixa(fin, aj.e, aj.s)
  const sobra = d.entradas.reduce((s, v, i) => s + (i >= d.inicio ? v - d.saidas[i] : 0), 0)
  const aPagar30 = fin.contasPagar.filter((x) => x.situacao !== 'paga' && x.situacao !== 'cancelada' && diasEntre(HOJE, x.vencimento) <= 30).reduce((s, x) => s + x.valor, 0)
  const bancos = fin.contasBancarias.map((b) => ({ id: b.id, nome: b.nome, saldo: b.saldo, atualizado: b.situacao === 'consentimento_vencido' ? `parado desde ${dataCurta(b.saldo_em.slice(0, 10))} (consentimento vencido)` : b.saldo_em.slice(0, 10) === HOJE ? `hoje ${b.saldo_em.slice(11, 16)}` : dataCurta(b.saldo_em.slice(0, 10)), via: b.origem === 'open_finance' ? 'Open Finance' : b.origem === 'api_banco' ? 'API do banco' : b.origem === 'ofx' ? 'OFX' : 'manual', fatura: b.fatura_fecha ?? undefined }))

  return (
    <PaginaFin fin={fin}>
      <CabecalhoFin titulo="Fluxo de caixa" status={d.completo ? 'Projetei 7 meses com os contratos, os reajustes e o 13º; dezembro é o mês de folga' : 'Ainda sem histórico: projeto pelos contratos à medida que eles chegam'} sub={`Saldos de hoje, ${dataCurta(HOJE)} · contas atualizadas 4 vezes ao dia · projeção pelos contratos e pelas contas recorrentes`}>
        <SeloTitular titular={titular} />
      </CabecalhoFin>

      <CartoesDaAba fin={fin} aba="caixa" />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        <Caixa>
          <Pergunta descricao="Com a origem de cada saldo.">Quanto temos?</Pergunta>
          <SaldosContas
            bancos={bancos}
            aPagar30={aPagar30}
            acao={
              podeConectar && (
                <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setModal(true)}>
                  <BankIcon /> Conectar
                </Button>
              )
            }
          />
        </Caixa>
        <Caixa>
          <Pergunta descricao={d.completo ? 'Realizado de junho a outubro; projetado (listrado) de novembro em diante.' : 'Tudo projetado (listrado) a partir dos contratos.'}>Vai sobrar dinheiro nos próximos meses?</Pergunta>
          <FluxoMensal d={d} />
        </Caixa>
      </div>

      <Caixa>
        <Pergunta descricao="Os cenários mudam só o projetado. Salvar leva a comparação para o Resultado.">E se…?</Pergunta>
        <Segmentado rotulo="Cenário" valor={preset} onMudar={setPreset} opcoes={presets.map((x) => ({ valor: x.valor, rotulo: x.rotulo }))} />
        {preset === 'livre' && (
          <div className="grid grid-cols-2 gap-3 sm:max-w-md">
            <Campo rotulo="Entradas (R$ mil por mês)">{(id) => <CampoTexto id={id} valor={livre.e} onMudar={(v) => setLivre({ ...livre, e: v })} />}</Campo>
            <Campo rotulo="Saídas (R$ mil por mês)">{(id) => <CampoTexto id={id} valor={livre.s} onMudar={(v) => setLivre({ ...livre, s: v })} />}</Campo>
          </div>
        )}
        <p className="text-muted-foreground text-sm">
          {p.texto} Sobra projetada nos meses à frente: <strong className="text-foreground font-medium">{brl(sobra * 1000)}</strong>.
        </p>
        {pode && preset !== 'base' && (
          <span className="flex flex-wrap items-end gap-2">
            <Campo rotulo="Nome do cenário" className="min-w-56 flex-1 sm:max-w-sm">
              {(id) => <CampoTexto id={id} valor={nome} onMudar={setNome} placeholder={p.rotulo} />}
            </Campo>
            <Button
              size="sm"
              variant="outline"
              className="rounded-full"
              onClick={() => {
                if (executar(() => repos.cenariosCaixa.criar({ nome: (nome || p.rotulo).trim(), ajuste_entradas: aj.e, ajuste_saidas: aj.s, premissas: p.texto, autor: usuario.nome }), { sucesso: 'Cenário salvo: aparece no Resultado como comparação.' })) setNome('')
              }}
            >
              <FloppyDiskIcon /> Salvar cenário
            </Button>
          </span>
        )}
        {fin.cenarios.length > 0 && (
          <ul className="divide-border/70 flex flex-col divide-y">
            {fin.cenarios.map((c) => {
              const x = projecaoCaixa(fin, c.ajuste_entradas, c.ajuste_saidas)
              const s = x.entradas.reduce((t, v, i) => t + (i >= x.inicio ? v - x.saidas[i] : 0), 0)
              return (
                <li key={c.id} className="flex flex-wrap items-center gap-2 py-2 text-sm">
                  <span className="min-w-0 flex-1">
                    <span className="block">{c.nome}</span>
                    <span className="text-muted-foreground block text-xs">
                      entradas {c.ajuste_entradas >= 0 ? '+' : ''}
                      {c.ajuste_entradas} mil/mês · saídas {c.ajuste_saidas >= 0 ? '+' : ''}
                      {c.ajuste_saidas} mil/mês · por {c.autor}
                    </span>
                  </span>
                  <span className="tabular-nums">{brl(s * 1000)}</span>
                  {pode && (
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      className="rounded-full"
                      aria-label={`Excluir o cenário ${c.nome}`}
                      onClick={async () => {
                        if (!(await confirmar({ titulo: `Excluir o cenário “${c.nome}”?`, acao: 'Excluir', perigo: true }))) return
                        const antes = executar(() => repos.cenariosCaixa.excluir(c.id))
                        if (antes) executar(() => undefined, { sucesso: 'Cenário excluído.', desfazer: () => repos.cenariosCaixa.reverter(antes) })
                      }}
                    >
                      <TrashIcon />
                    </Button>
                  )}
                </li>
              )
            })}
          </ul>
        )}
        {!fin.contratos.length && <Nota>Sem contratos, a projeção fica zerada: traga o financeiro atual em Configurar.</Nota>}
      </Caixa>

      {modal && <ConectarConta onFechar={() => setModal(false)} />}
    </PaginaFin>
  )
}

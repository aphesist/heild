import { ArrowCounterClockwiseIcon, ArrowRightIcon, CheckCircleIcon, CircleIcon, CircleNotchIcon, LockSimpleIcon, NotePencilIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { SeloDemonstracao, SePode, useAcao, useConfirmar, usePermissao } from '@/components/kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Campo, CampoArea, GavetaFormulario } from '@/components/ui/formulario'
import { Tooltip } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useTabela } from '@/nucleo/react'
import { fechamentoOperacao, rascunhoDe, type LinhaDre, type RascunhoGerencial } from '@/nucleo/repositorios/s08b-operacao'
import { brl, Caixa, Regra, TituloBloco } from '../comum'
import { dataHora, type EmpresaVista } from '../dados'
import { COMPETENCIA_FECHAMENTO, rotuloCompetencia } from './dados'
import { usePedirOperacao, useTrabalhandoEm } from './integrantes'

/**
 * S08b · Fechamento do mês e relatório gerencial (10, 3.10; FIN-006 e
 * BPO-013): o Gerencial rascunha o relatório (DRE gerencial, caixa,
 * pagamentos, atrasos, pendências, riscos); o Gestor revisa; o mês fecha só
 * com o extrato conciliado, as baixas no ERP, as contas conferidas e o
 * rascunho aprovado. Reabrir só o Administrador, com motivo. O envio do
 * relatório ao cliente fica em Entregas.
 */
export function SecaoFechamento({ e, onSecao, onEscolher }: { e: EmpresaVista; onSecao: (s: string) => void; onEscolher: (id: string | null, aba?: string) => void }) {
  const competencia = COMPETENCIA_FECHAMENTO
  const tEntrega = useTabela('bpo_entrega')
  useTabela('bpo_transacao')
  useTabela('bpo_conta')
  const executar = useAcao()
  const confirmar = useConfirmar()
  const pedir = usePedirOperacao()
  const trabalhando = useTrabalhandoEm()
  const podeFechar = usePermissao('bpo.fechamento.executar', { cliente_id: e.clienteId })
  const [revisar, setRevisar] = useState(false)
  const rel = tEntrega.find((x) => x.cliente_id === e.clienteId && x.competencia === competencia && x.tipo === 'relatorio')
  const fch = tEntrega.find((x) => x.cliente_id === e.clienteId && x.competencia === competencia && x.tipo === 'fechamento')
  const dre = rascunhoDe(rel)
  const passos = fechamentoOperacao.passos(e.clienteId, competencia)
  const fechado = fch?.situacao === 'enviado'
  const reaberto = fch?.extras?.reaberto as { por: string; em: string; motivo: string } | null | undefined
  const falta = passos.find((p) => !p.ok)
  const escrevendo = trabalhando(`${e.clienteId}:${competencia}`)
  const pedirRascunho = () =>
    pedir({
      integrante: 'i-bpo-gerencial',
      titulo: `Rascunhar o relatório gerencial de ${rotuloCompetencia(competencia)}`,
      cliente: e.nome,
      inicio: `Vou montar o relatório de ${rotuloCompetencia(competencia)} de ${e.nome} a partir do espelho do ${e.erp.provedor} e do extrato: DRE gerencial, caixa, pagamentos, atrasos, pendências e riscos.`,
      etapas: ['Lendo o espelho do ERP e o extrato do mês', 'Montando a DRE gerencial por categoria', 'Escrevendo os pontos de atenção'],
      fim: { texto: `Rascunho do relatório de ${rotuloCompetencia(competencia)} pronto em Rotinas › Fechamento. O Gestor revisa; eu não envio nem fecho o mês.`, aviso: `Gerencial rascunhou o relatório de ${e.nome}` },
      efeito: { tipo: 'rascunho', clienteId: e.clienteId, competencia },
    })
  return (
    <div className="flex flex-col gap-4">
      <Caixa>
        <TituloBloco
          descricao={e.contabil ? 'Ao fechar, os lançamentos já classificados vão ao setor Contábil (bpo.mes_fechado), sem redigitar.' : 'Ao fechar, o fechamento vai ao contador da empresa.'}
          acao={<Badge variant={fechado ? 'sucesso' : 'destaque'}>{fechado ? 'fechado' : 'aberto'}</Badge>}
        >
          Fechamento de {rotuloCompetencia(competencia)}
        </TituloBloco>
        {fechado && fch && <p className="text-sm">Fechado por {fch.enviado_por} em {dataHora(fch.enviado_em)}.</p>}
        {!fechado && reaberto && (
          <p className="bg-warning/10 rounded-[12px] px-3 py-2 text-sm">
            Reaberto por {reaberto.por} em {dataHora(reaberto.em)}: {reaberto.motivo}
          </p>
        )}
        <ol className="flex flex-col gap-1.5" aria-label="Antes de fechar">
          {passos.map((p) => (
            <li key={p.chave} className="flex flex-wrap items-center gap-2 text-sm">
              {p.ok ? <CheckCircleIcon weight="fill" className="text-success size-4 shrink-0" /> : <CircleIcon className="text-muted-foreground size-4 shrink-0" />}
              <span className={cn('min-w-0 flex-1', p.ok && 'text-muted-foreground')}>{p.texto}</span>
              {!p.ok && p.secao !== 'fechamento' && !fechado && (
                <Button size="sm" variant="ghost" className="rounded-full" onClick={() => onSecao(p.secao)}>
                  Resolver <ArrowRightIcon />
                </Button>
              )}
            </li>
          ))}
        </ol>
        <div className="flex flex-wrap items-center gap-2">
          {!fechado &&
            (podeFechar.permitido ? (
              falta ? (
                <Tooltip conteudo={`Ainda não: ${falta.texto.toLowerCase()}.`}>
                  <span tabIndex={0} aria-label={`Fechar o mês indisponível: ${falta.texto}`} className="inline-flex cursor-not-allowed items-center gap-1 opacity-50">
                    <Button size="sm" className="pointer-events-none rounded-full" disabled>
                      <LockSimpleIcon /> Fechar o mês
                    </Button>
                  </span>
                </Tooltip>
              ) : (
                <Button
                  size="sm"
                  className="rounded-full"
                  onClick={async () => {
                    const ok = await confirmar({ titulo: `Fechar ${rotuloCompetencia(competencia)} de ${e.nome}?`, descricao: e.contabil ? 'Os lançamentos classificados vão ao setor Contábil. Reabrir depois só com o Administrador e um motivo.' : 'O fechamento vai ao contador da empresa. Reabrir depois só com o Administrador e um motivo.', acao: 'Fechar o mês' })
                    if (ok === true) executar(() => fechamentoOperacao.executar(e.clienteId, competencia), { sucesso: e.contabil ? `${rotuloCompetencia(competencia)} fechado: lançamentos ao Contábil` : `${rotuloCompetencia(competencia)} fechado` })
                  }}
                >
                  <LockSimpleIcon /> Fechar o mês
                </Button>
              )
            ) : (
              <span className="text-muted-foreground text-xs">Fecha o Gestor do BPO.</span>
            ))}
          {fechado && (
            <SePode ferramenta="bpo.fechamento.reabrir" alvo={{ cliente_id: e.clienteId }} senao={<span className="text-muted-foreground text-xs">Reabrir é do Administrador, com motivo.</span>}>
              <Button
                size="sm"
                variant="outline"
                className="rounded-full"
                onClick={async () => {
                  const motivo = await confirmar({ titulo: `Reabrir ${rotuloCompetencia(competencia)}?`, descricao: 'O mês volta a aberto; o Contábil é avisado. Fica na trilha com o motivo.', acao: 'Reabrir', exigirMotivo: true, rotuloMotivo: 'Motivo da reabertura', perigo: true })
                  if (typeof motivo === 'string') executar(() => fechamentoOperacao.reabrir(e.clienteId, competencia, motivo), { sucesso: 'Mês reaberto' })
                }}
              >
                <ArrowCounterClockwiseIcon /> Reabrir o mês
              </Button>
            </SePode>
          )}
          <Button size="sm" variant="ghost" className="rounded-full" onClick={() => onEscolher(e.clienteId, 'entregas')}>
            Relatório ao cliente em Entregas <ArrowRightIcon />
          </Button>
        </div>
      </Caixa>

      <Caixa>
        <TituloBloco
          descricao="Escrito pelo integrante Gerencial sobre o espelho do ERP e o extrato. Rascunho: o Gestor revisa antes de qualquer coisa sair."
          acao={
            !fechado && (
              <SePode ferramenta="bpo.relatorio_mensal" alvo={{ cliente_id: e.clienteId }}>
                <Button size="sm" variant={dre ? 'ghost' : 'outline'} className="rounded-full" disabled={escrevendo} onClick={pedirRascunho}>
                  {escrevendo ? <CircleNotchIcon className="animate-spin" /> : <NotePencilIcon />} {escrevendo ? 'O Gerencial está escrevendo…' : dre ? 'Pedir nova versão' : 'Pedir o rascunho ao Gerencial'}
                </Button>
              </SePode>
            )
          }
        >
          Relatório gerencial
        </TituloBloco>
        {!dre ? (
          <p className="text-muted-foreground text-sm">{rel?.extras?.rascunho ? 'O Gerencial já rascunhou este relatório em Entregas. Peça uma nova versão para ver a DRE aqui.' : 'Ainda sem rascunho. O Gerencial escreve a partir do que está conciliado.'}</p>
        ) : (
          <RelatorioGerencial dre={dre} />
        )}
        {dre && (
          <div className="flex flex-wrap items-center gap-2">
            {rel?.extras?.aprovado_em ? (
              <Badge variant="sucesso">revisado por {String(rel.extras.aprovado_por)} {dataHora(String(rel.extras.aprovado_em))}</Badge>
            ) : (
              <SePode ferramenta="bpo.relatorio_mensal" alvo={{ cliente_id: e.clienteId }} senao={<span className="text-muted-foreground text-xs">Quem revisa é o Gestor do BPO.</span>}>
                <Button size="sm" variant="outline" className="rounded-full" onClick={() => setRevisar(true)}>
                  Revisar e aprovar
                </Button>
              </SePode>
            )}
            <SeloDemonstracao fonte="rascunho por IA (Gerencial)" />
          </div>
        )}
      </Caixa>
      <Regra>O integrante rascunha; ele nunca fecha o mês nem envia ao cliente. Fechar exige o extrato conciliado e o rascunho revisado (10, 3.10).</Regra>
      {revisar && dre && <GavetaRevisar e={e} dre={dre} competencia={competencia} onFechar={() => setRevisar(false)} />}
    </div>
  )
}

function Grupo({ titulo, linhas, sinal }: { titulo: string; linhas: LinhaDre[]; sinal: 1 | -1 }) {
  const total = linhas.reduce((s, l) => s + l.valor, 0)
  return (
    <>
      <tr className="border-border/70 border-t">
        <th scope="row" className="py-1.5 text-left font-medium">
          {titulo}
        </th>
        <td className="py-1.5 text-right font-medium tabular-nums">{brl(sinal * total).replace('-', '−')}</td>
      </tr>
      {linhas.map((l) => (
        <tr key={l.rotulo}>
          <td className="text-muted-foreground py-0.5 pl-3">{l.rotulo}</td>
          <td className="text-muted-foreground py-0.5 text-right tabular-nums">{brl(sinal * l.valor).replace('-', '−')}</td>
        </tr>
      ))}
    </>
  )
}

export function RelatorioGerencial({ dre }: { dre: RascunhoGerencial }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <table className="w-full text-sm" aria-label="DRE gerencial">
        <tbody>
          <Grupo titulo="Receitas" linhas={dre.receitas} sinal={1} />
          <Grupo titulo="Custos" linhas={dre.custos} sinal={-1} />
          <Grupo titulo="Despesas" linhas={dre.despesas} sinal={-1} />
          <tr className="border-foreground/30 border-t-2">
            <th scope="row" className="py-2 text-left font-medium">
              Resultado
            </th>
            <td className={cn('py-2 text-right font-medium tabular-nums', dre.resultado < 0 && 'text-destructive')}>{brl(dre.resultado).replace('-', '−')}</td>
          </tr>
        </tbody>
      </table>
      <div className="flex flex-col gap-3 text-sm">
        <p>{dre.comentario}</p>
        <dl className="text-muted-foreground grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          <dt>Caixa hoje</dt>
          <dd className="text-foreground tabular-nums">{brl(dre.caixa_fim)}</dd>
          <dt>Pagamentos no mês</dt>
          <dd className="text-foreground tabular-nums">{dre.pagamentos}</dd>
        </dl>
        {[
          ['Atrasos', dre.atrasos],
          ['Pendências com o cliente', dre.pendencias],
          ['Riscos', dre.riscos],
        ].map(([t, l]) => (
          <div key={t as string}>
            <span className="text-muted-foreground text-xs">{t as string}</span>
            {(l as string[]).length ? (
              <ul className="list-disc pl-4 text-xs">
                {(l as string[]).map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            ) : (
              <p className="text-xs">nenhum</p>
            )}
          </div>
        ))}
        <span className="text-muted-foreground text-xs">
          {dre.escrito_por} · {dataHora(dre.escrito_em)}
        </span>
      </div>
    </div>
  )
}

function GavetaRevisar({ e, dre, competencia, onFechar }: { e: EmpresaVista; dre: RascunhoGerencial; competencia: string; onFechar: () => void }) {
  const executar = useAcao()
  const [comentario, setComentario] = useState(dre.comentario)
  return (
    <GavetaFormulario
      aberta
      onFechar={onFechar}
      largura="lg"
      titulo={`Revisar o relatório de ${rotuloCompetencia(competencia)}`}
      descricao={`${e.nome} · rascunho de ${dre.escrito_por}. Ajuste o texto se precisar; os números vêm do espelho do ERP.`}
      acao="Aprovar o rascunho"
      onAcao={() => {
        const ok = executar(() => fechamentoOperacao.aprovarRascunho(e.clienteId, competencia, comentario), { sucesso: 'Rascunho revisado: o mês já pode fechar' })
        if (ok) onFechar()
      }}
    >
      <RelatorioGerencial dre={dre} />
      <Campo rotulo="Texto do relatório">{(id) => <CampoArea id={id} valor={comentario} onMudar={setComentario} linhas={5} />}</Campo>
    </GavetaFormulario>
  )
}

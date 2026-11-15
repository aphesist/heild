import { CheckCircleIcon, FileTextIcon, ShieldCheckIcon, WarningIcon } from '@phosphor-icons/react'
import { useMemo, useState, type ReactNode } from 'react'
import { useLoja } from '@/ambiente/loja'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CampoArea } from '@/components/ui/formulario'
import { cn } from '@/lib/utils'
import type { BpoEntrega } from '@/nucleo/modelo/entidades'
import { useEscritorio, useTabela } from '@/nucleo/react'
import { brl, dataHora, diasAte, quando, type ContratanteVista, type EmpresaVista } from './dados'
import { useVariaveisContratante } from './ModuloBpo'

/**
 * S08d · O relatório mensal como folha (10, 7.4): o da empresa BPO com a marca
 * do escritório, para o sócio da empresa; o do contratante (BPO-012) com a
 * marca dele, nunca a do BPO. O mesmo componente serve à revisão do Gestor
 * antes de fechar, à leitura depois de enviado (com o recibo) e ao portal do
 * convidado. O integrante rascunha; quem fecha é uma pessoa.
 */

export const COMPETENCIA_FECHAR = '2026-10'
export const rotuloCompetencia = (c: string) => `${['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'][Number(c.slice(5, 7)) - 1]} de ${c.slice(0, 4)}`

/** Resumo que o Gerencial escreve no rascunho (o Gestor edita antes de fechar). */
export function resumoPadraoEmpresa(e: EmpresaVista) {
  // O fluxo do perfil está em milhares (o mesmo da peça FluxoMensal do Financeiro).
  const ent = (e.perfil.fluxo.entradas[1] ?? 0) * 1000
  const sai = (e.perfil.fluxo.saidas[1] ?? 0) * 1000
  const riscos = e.audit.motivos.slice(0, 2).map((m) => m.texto)
  return `Outubro fechou com ${brl(ent)} de entradas e ${brl(sai)} de saídas (${ent - sai >= 0 ? 'sobra' : 'falta'} de ${brl(Math.abs(ent - sai))}). ${riscos.length ? `Pontos de atenção: ${riscos.join('; ')}.` : 'Nenhum ponto de atenção no mês.'}`
}

function Folha({ marca, sigla, titulo, sub, estilo, children, rodape }: { marca: string; sigla: string; titulo: string; sub: string; estilo?: React.CSSProperties; children: ReactNode; rodape?: ReactNode }) {
  return (
    <div style={estilo} className="bg-background text-foreground flex flex-col gap-4 rounded-[18px] p-4 sm:p-5" aria-label={`Folha do relatório: ${titulo}`}>
      <div className="border-border/70 flex items-center gap-3 border-b pb-3">
        <span className="bg-primary text-primary-foreground flex size-9 shrink-0 items-center justify-center rounded-[10px] text-sm font-medium" aria-hidden>
          {sigla}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{marca}</span>
          <span className="text-muted-foreground block text-xs">{sub}</span>
        </span>
      </div>
      <h2 className="text-xl font-light">{titulo}</h2>
      {children}
      {rodape && <div className="text-muted-foreground border-border/70 border-t pt-3 text-xs">{rodape}</div>}
    </div>
  )
}

export const siglaDe = (nome: string) =>
  nome
    .split(' ')
    .filter((p) => p.length > 2 && !/^(ltda|me|eireli|s\/a)$/i.test(p))
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-1.5">
      <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{titulo}</h3>
      {children}
    </section>
  )
}

function Linha({ rotulo, valor, tom }: { rotulo: ReactNode; valor: ReactNode; tom?: 'erro' | 'ok' }) {
  return (
    <div className="flex items-baseline gap-2 text-sm">
      <span className="min-w-0 flex-1">{rotulo}</span>
      <span className={cn('tabular-nums', tom === 'erro' && 'text-destructive', tom === 'ok' && 'text-success')}>{valor}</span>
    </div>
  )
}

/** Relatório da empresa BPO (sócio da empresa, marca do escritório). */
export function RelatorioEmpresa({ e, entrega, aberto, onFechar, podeFechar, onFecharEEnviar, onSalvarResumo }: { e: EmpresaVista; entrega?: BpoEntrega; aberto: boolean; onFechar: () => void; podeFechar: boolean; onFecharEEnviar: (resumo: string) => void; onSalvarResumo: (resumo: string) => void }) {
  const escritorio = useEscritorio()
  const loja = useLoja()
  const enviado = entrega?.situacao === 'enviado'
  const [resumo, setResumo] = useState<string | null>(null)
  const texto = resumo ?? (entrega?.extras?.resumo as string | undefined) ?? resumoPadraoEmpresa(e)
  const pagas = e.contas.filter((c) => ['aprovada', 'liberada', 'paga'].includes(c.etapa))
  const ent = (e.perfil.fluxo.entradas[1] ?? 0) * 1000
  const sai = (e.perfil.fluxo.saidas[1] ?? 0) * 1000
  const atrasadas = e.receber.filter((c) => c.etapa === 'atrasada')
  const doc = entrega?.documento_id ? loja.documentos.find((d) => d.id === entrega.documento_id) : undefined
  const marca = escritorio?.razao_social || escritorio?.nome_fantasia || 'Escritório'
  return (
    <Dialog open={aberto} onOpenChange={(v) => !v && onFechar()}>
      <DialogContent className="bg-surface max-h-[92dvh] rounded-[24px] border-0 p-4 sm:max-w-2xl sm:p-5">
        <DialogHeader>
          <DialogTitle className="text-lg font-normal">Relatório de {rotuloCompetencia(entrega?.competencia ?? COMPETENCIA_FECHAR)} · {e.nome}</DialogTitle>
          <DialogDescription>{enviado ? `Enviado ${dataHora(entrega?.enviado_em)} por ${entrega?.enviado_por}: está no app e em Arquivos › Entregáveis › BPO financeiro.` : 'Rascunho do Gerencial. Revise o resumo; nada sai ao cliente antes de uma pessoa fechar.'}</DialogDescription>
        </DialogHeader>
        <Folha marca={marca} sigla={siglaDe(marca)} titulo={`BPO financeiro · ${rotuloCompetencia(entrega?.competencia ?? COMPETENCIA_FECHAR)}`} sub={`Para ${e.ficha?.contatos.find((c) => c.reforcada)?.nome ?? e.ficha?.contatos[0]?.nome ?? 'o sócio'} · ${e.nome}`} rodape={`Preparado pelo Gerencial (integrante) · ${enviado ? `revisado e fechado por ${entrega?.enviado_por}` : 'aguardando a revisão do Gestor do BPO'}`}>
          <Secao titulo="Resumo do mês">
            {enviado || !podeFechar ? <p className="text-sm">{texto}</p> : <CampoArea valor={texto} onMudar={setResumo} linhas={4} />}
          </Secao>
          <div className="grid gap-4 sm:grid-cols-2">
            <Secao titulo="Caixa">
              <Linha rotulo="Saldo hoje, lido do banco" valor={brl(e.caixa)} tom={e.caixa < e.perfil.caixa_minimo ? 'erro' : undefined} />
              <Linha rotulo="Mínimo combinado" valor={brl(e.perfil.caixa_minimo)} />
            </Secao>
            <Secao titulo="DRE gerencial de outubro">
              <Linha rotulo="Entradas" valor={brl(ent)} />
              <Linha rotulo="Saídas" valor={brl(sai)} />
              <Linha rotulo="Resultado" valor={brl(ent - sai)} tom={ent - sai < 0 ? 'erro' : 'ok'} />
            </Secao>
          </div>
          <Secao titulo="Pagamentos">
            <Linha rotulo="Pagamentos preparados e aprovados por vocês no mês" valor={e.perfil.volume.pagamentos} />
            {pagas.length > 0 && <Linha rotulo={`Aprovados e ainda não baixados no extrato (${pagas.length})`} valor={brl(pagas.reduce((s, c) => s + c.valor, 0))} />}
            <p className="text-muted-foreground text-xs">Nenhum pagamento saiu sem a aprovação de uma pessoa da empresa.</p>
          </Secao>
          <Secao titulo="Riscos e pendências">
            {e.audit.motivos.length === 0 && atrasadas.length === 0 && e.fila.length === 0 ? (
              <p className="text-sm">Nada pendente.</p>
            ) : (
              <ul className="flex flex-col gap-1 text-sm">
                {atrasadas.map((c) => (
                  <li key={c.id} className="flex items-start gap-1.5">
                    <WarningIcon className="text-warning mt-0.5 size-4 shrink-0" weight="fill" /> A receber em atraso: {c.contraparte} ({brl(c.valor)})
                  </li>
                ))}
                {e.audit.motivos.slice(0, 4).map((m, i) => (
                  <li key={`${m.criterio}-${i}`} className="flex items-start gap-1.5">
                    <WarningIcon className="text-warning mt-0.5 size-4 shrink-0" weight="fill" /> {m.texto}
                  </li>
                ))}
                {e.fila.length > 0 && <li className="text-muted-foreground text-xs">{e.fila.length} pedido(s) em andamento na fila</li>}
              </ul>
            )}
          </Secao>
        </Folha>
        {enviado && doc && (
          <section className="flex flex-col gap-1.5 text-sm" aria-label="Recibo da entrega">
            <h3 className="flex items-center gap-1.5 text-sm font-medium">
              <ShieldCheckIcon className="size-4" /> Recibo
            </h3>
            <ul className="text-muted-foreground flex flex-col gap-0.5 text-xs">
              <li>hash {doc.hash.slice(0, 16)}… · versão {doc.versao}</li>
              {(doc.entregas ?? []).map((x, i) => (
                <li key={i}>
                  {x.acao} · {x.quem} · {x.quando}
                </li>
              ))}
            </ul>
          </section>
        )}
        {!enviado && podeFechar && (
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="ghost" className="rounded-full" onClick={() => (onSalvarResumo(texto), onFechar())}>
              Guardar o rascunho
            </Button>
            <Button className="rounded-full" onClick={() => (onFecharEEnviar(texto), onFechar())}>
              <CheckCircleIcon /> Fechar e enviar ao app
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

/** Conteúdo do relatório do contratante (BPO-012): entregas com recibo, guias, pendências, SLA com cada desvio explicado e controles (BPO-020). */
export function useConteudoContratante(c: ContratanteVista) {
  const tFila = useTabela('bpo_item_fila')
  return useMemo(() => {
    const todos = tFila.filter((f) => f.subinquilino_id === c.id)
    const entregues = todos.filter((f) => f.situacao === 'resolvido')
    const guias = entregues.filter((f) => f.tipo === 'revisao')
    const pendentes = c.fila.filter((f) => f.bola === 'contratante' || f.bola === 'cliente_final')
    const atrasadosBpo = c.fila.filter((f) => f.bola === 'bpo' && diasAte(f.prazo) < 0)
    const desvios = [
      ...pendentes.map((f) => ({ texto: `${f.texto} (${f.cliente_final}): ${f.faltando.length ? `falta ${f.faltando.join(', ')}` : f.bola === 'contratante' ? 'aguardando vocês' : 'aguardando o cliente final'}`, de: 'contratante' as const })),
      ...atrasadosBpo.map((f) => ({ texto: `${f.texto} (${f.cliente_final}): passou do prazo do contrato`, de: 'bpo' as const })),
      ...((c.extras?.desvios as { texto: string; de: 'bpo' | 'contratante' }[] | undefined) ?? []),
    ]
    return { entregues, guias, pendentes, desvios }
  }, [tFila, c])
}

export function RelatorioContratante({ c, entrega, aberto, onFechar, podeFechar, onFecharEEnviar }: { c: ContratanteVista; entrega?: BpoEntrega; aberto: boolean; onFechar: () => void; podeFechar?: boolean; onFecharEEnviar?: () => void }) {
  const estilo = useVariaveisContratante(c.tema_id)
  const { entregues, guias, pendentes, desvios } = useConteudoContratante(c)
  const enviado = entrega?.situacao === 'enviado'
  const competencia = entrega?.competencia ?? COMPETENCIA_FECHAR
  return (
    <Dialog open={aberto} onOpenChange={(v) => !v && onFechar()}>
      <DialogContent className="bg-surface max-h-[92dvh] rounded-[24px] border-0 p-4 sm:max-w-2xl sm:p-5">
        <DialogHeader>
          <DialogTitle className="text-lg font-normal">Relatório de {rotuloCompetencia(competencia)} · {c.nome}</DialogTitle>
          <DialogDescription>{enviado ? `Enviado ${dataHora(entrega?.enviado_em)} por ${entrega?.enviado_por}. Sai com a marca de ${c.nome}, nunca com a do BPO.` : 'Rascunho. Sai com a marca do contratante, nunca com a do BPO.'}</DialogDescription>
        </DialogHeader>
        <Folha estilo={estilo} marca={c.nome} sigla={siglaDe(c.nome)} titulo={`Relatório do mês · ${rotuloCompetencia(competencia)}`} sub={`${c.clientes_finais.length} empresas atendidas · contrato de ${c.contrato.sla_h} h por pedido completo`} rodape="Desvios explicados: do lado de vocês (bola com vocês ou com o cliente final, SLA pausado) ou da equipe. Controles: trilha por contratante, acessos de convidados registrados, lista de suboperadores (LGPD).">
          <div className="grid gap-4 sm:grid-cols-2">
            <Secao titulo="SLA">
              <Linha rotulo="No prazo no mês" valor={`${c.sla_mes}%`} tom={c.sla_mes < 90 ? 'erro' : 'ok'} />
              <Linha rotulo="Desvios do BPO" valor={desvios.filter((d) => d.de === 'bpo').length} />
              <Linha rotulo="Desvios do lado de vocês" valor={desvios.filter((d) => d.de === 'contratante').length} />
            </Secao>
            <Secao titulo="Entregas">
              <Linha rotulo="Entregas com recibo" valor={entregues.length} />
              <Linha rotulo="Guias transmitidas após a revisão" valor={guias.length} />
              <Linha rotulo="Pendências com vocês ou o cliente final" valor={pendentes.length} />
            </Secao>
          </div>
          <Secao titulo="Entregas do mês">
            {entregues.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhuma entrega concluída ainda nesta competência.</p>
            ) : (
              <ul className="flex flex-col gap-1 text-sm">
                {entregues.map((f) => (
                  <li key={f.id} className="flex items-start gap-1.5">
                    <FileTextIcon className="text-muted-foreground mt-0.5 size-4 shrink-0" /> {f.texto} · {f.cliente_final}
                    <Badge variant="outline" className="ml-auto shrink-0">
                      recibo
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </Secao>
          <Secao titulo="Desvios">
            {desvios.length === 0 ? (
              <p className="text-sm">Sem desvios.</p>
            ) : (
              <ul className="flex flex-col gap-1 text-sm">
                {desvios.map((d, i) => (
                  <li key={i}>
                    <span className="text-muted-foreground text-xs">{d.de === 'bpo' ? 'da equipe' : 'de vocês'} · </span>
                    {d.texto}
                  </li>
                ))}
              </ul>
            )}
          </Secao>
          <p className="text-muted-foreground text-xs">Prazos legais vêm antes do SLA: {c.fila.filter((f) => f.prazo_legal).map((f) => `${f.texto} até ${quando(f.prazo_legal)}`).join('; ') || 'nenhum aberto'}.</p>
        </Folha>
        {!enviado && podeFechar && onFecharEEnviar && (
          <div className="flex justify-end">
            <Button className="rounded-full" onClick={() => (onFecharEEnviar(), onFechar())}>
              <CheckCircleIcon /> Fechar e enviar ao portal
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

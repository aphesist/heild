import { useMemo, useRef, useState } from 'react'
import { ArrowSquareOutIcon, ClockCounterClockwiseIcon, StarIcon, WarningIcon } from '@phosphor-icons/react'
import type { ContatoCliente, FichaCliente, PreferenciaEntrega, ServicoFicha } from '@/ambiente/clientes'
import { useFluxos } from '@/ambiente/fluxos'
import { useContas, useLoja, useNavegacao } from '@/ambiente/loja'
import { rotuloSetorCurto, useSessao } from '@/ambiente/sessao'
import { EstadoVazio } from '@/components/kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Campo, CampoArea, CampoEscolha, CampoTexto, Fichas, GavetaFormulario, Interruptor, Segmentado } from '@/components/ui/formulario'
import { empresasBpo } from '@/dados/bpo'
import * as exemplo from '@/dados/exemplo'
import { contratos, faturas, totalContrato } from '@/dados/financeiro'
import { diffFicha, emailValido, papeisPorServico, papelNoServico, resumoEntrega, rotuloModoEntrega, rotuloServicoFicha, telefoneValido } from '@/dados/s02/ficha'
import { catalogoServicos, rotuloEstadoServico, type EstadoServico } from '@/dados/servicos-extras'
import { useTabela } from '@/nucleo/react'
import { registrar } from '@/nucleo/repositorios'
import { cn } from '@/lib/utils'
import type { SetorIntegrante } from '@/theme/tipos'

/**
 * S02-T05 · Ficha do cliente (01, ad. 22; 04, 5.4; REVISAO, 4): o lugar de
 * configurar o cliente para o resto do sistema. Contatos com papel por serviço
 * e assuntos (A67), alçada de pagamento só como proposta (A68), responsáveis
 * por setor (A69), serviços extras do app (A70), resumo da relação (A71),
 * preferência de entrega e malote (A72) e o histórico das mudanças.
 *
 * Quem faz o quê (03, 9.2): Membro edita contatos e entrega; Gestor e
 * Administrador, também responsáveis e serviços; alçada, só Gestor do BPO e
 * Administrador. O que a conta não edita aparece só para leitura, com o aviso.
 */

const papeis: ContatoCliente['papel'][] = ['sócio', 'sócia', 'titular', 'financeiro', 'RH', 'fiscal da empresa', 'diretor financeiro']
const assuntos = [
  { valor: 'guias', rotulo: 'guias' },
  { valor: 'folha', rotulo: 'folha' },
  { valor: 'documentos_pendentes', rotulo: 'documentos' },
  { valor: 'honorarios', rotulo: 'honorários' },
  { valor: 'societario', rotulo: 'societário' },
  { valor: 'comunicados', rotulo: 'comunicados' },
  { valor: 'pagamentos', rotulo: 'pagamentos (BPO)' },
]
const rotuloRegime: Record<string, string> = { simples: 'Simples Nacional', presumido: 'Lucro Presumido', real: 'Lucro Real', mei: 'MEI', pf: 'Pessoa física', imune_isento: 'Imune ou isento' }
const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

type Aba = 'contatos' | 'responsaveis' | 'app' | 'entrega' | 'relacao' | 'historico'

export function FichaClienteGaveta({ clienteId, onFechar }: { clienteId: string; onFechar: () => void }) {
  const loja = useLoja()
  const { usuario, permissoes } = useSessao()
  const contas = useContas()
  const tCliente = useTabela('cliente')
  const entidade = tCliente.find((c) => c.id === clienteId)
  const tela = exemplo.clientes.find((c) => c.id === clienteId)
  const nome = entidade?.nome ?? tela?.nome ?? ''
  const pacotes = entidade?.servicos_contratados ?? tela?.servicos ?? ['contabil']
  const servicosFicha: ServicoFicha[] = [...(pacotes.includes('contabil') ? (['contabil'] as const) : []), ...(pacotes.includes('bpo') || pacotes.includes('bpo_financeiro') ? (['bpo_financeiro'] as const) : [])]
  const temBpo = servicosFicha.includes('bpo_financeiro')

  const base: FichaCliente = loja.fichaDe(clienteId) ?? { id: clienteId, contatos: [], responsaveis: {}, conversas: {} }
  const [contatos, setContatos] = useState<ContatoCliente[]>(base.contatos)
  const [resp, setResp] = useState(base.responsaveis)
  const [servicos, setServicos] = useState(base.servicos ?? {})
  const [entrega, setEntrega] = useState<PreferenciaEntrega>(base.entrega ?? { modo: 'digital' })
  const [aba, setAba] = useState<Aba>('contatos')
  const [tentou, setTentou] = useState(false)
  // A gaveta rola por dentro: trocar de parte volta ao topo, onde ficam as abas.
  const topo = useRef<HTMLDivElement>(null)
  const trocar = (a: Aba) => {
    setAba(a)
    topo.current?.scrollIntoView({ block: 'start' })
  }

  // 03, 9.2: Membro edita a ficha (contatos, entrega); Gestor e Administrador, o resto.
  const editaFicha = usuario.papel !== 'colaborador' || permissoes.setores.length > 0
  const gere = usuario.papel === 'administrador' || usuario.papel === 'gestor'
  const editaAlcada = usuario.papel === 'administrador' || permissoes.gere.includes('bpo_financeiro')

  const setoresEquipe: SetorIntegrante[] = [...(pacotes.includes('contabil') && loja.estado.cenario !== 'bpo_puro' ? (['societario', 'fiscal', 'notas', 'dp', 'contabil', 'consultor'] as const) : []), ...(temBpo ? (['bpo_financeiro'] as const) : [])]
  const pessoasDo = (s: SetorIntegrante) => contas.filter((u) => u.situacao === 'ativo' && (u.papel === 'administrador' || u.vinculos.some((v) => v.setor === s))).map((u) => u.nome)

  const muda = (i: number, p: Partial<ContatoCliente>) => setContatos((xs) => xs.map((x, k) => (k === i ? { ...x, ...p } : x)))
  const errosDe = (c: ContatoCliente) => ({
    nome: !c.nome.trim() ? 'Informe o nome.' : undefined,
    whatsapp: telefoneValido(c.whatsapp) ? undefined : 'Telefone com DDD: (11) 98200-3301.',
    email: emailValido(c.email) ? undefined : 'E-mail inválido.',
    contato: !c.whatsapp && !c.email && !c.app ? 'Sem WhatsApp, e-mail ou app: não dá para falar com ele.' : undefined,
  })
  const invalido = contatos.some((c) => Object.values(errosDe(c)).some(Boolean))
  const semAssunto = assuntos.filter((a) => (a.valor !== 'pagamentos' || temBpo) && !contatos.some((c) => c.assuntos.includes(a.valor)))
  const socio = contatos.find((c) => c.principal) ?? contatos.find((c) => c.papel.startsWith('sóci') || c.papel === 'titular')

  const depois: FichaCliente = { ...base, contatos, responsaveis: gere ? resp : base.responsaveis, servicos: gere ? servicos : base.servicos, entrega: entrega.modo === 'digital' && !entrega.observacao ? undefined : entrega }
  const mudancas = diffFicha(base, depois, servicosFicha)

  const salvar = () => {
    setTentou(true)
    if (invalido) {
      trocar('contatos')
      return
    }
    if (!mudancas.length) return onFechar()
    loja.salvarFicha(depois)
    registrar(`${usuario.nome} atualizou a ficha de ${nome}: ${mudancas.join('; ')}`, 'ficha.atualizar', { cliente_id: clienteId })
    loja.toastDesfazer(`Ficha de ${nome} salva (${mudancas.length} ${mudancas.length === 1 ? 'mudança' : 'mudanças'}). Cobranças e entregas já usam a versão nova.`, () => {
      loja.salvarFicha(base)
      registrar(`${usuario.nome} desfez a última mudança na ficha de ${nome}`, 'ficha.atualizar', { cliente_id: clienteId })
    })
    onFechar()
  }

  const abas: { id: Aba; rotulo: string; contador?: number }[] = [
    { id: 'contatos', rotulo: 'Contatos', contador: tentou && invalido ? 1 : undefined },
    { id: 'responsaveis', rotulo: 'Responsáveis' },
    { id: 'app', rotulo: 'App e serviços' },
    { id: 'entrega', rotulo: 'Entrega' },
    { id: 'relacao', rotulo: 'Relação' },
    { id: 'historico', rotulo: 'Histórico' },
  ]
  const regime = tela?.regime ?? rotuloRegime[entidade?.regime ?? ''] ?? ''

  return (
    <GavetaFormulario
      aberta
      largura="lg"
      onFechar={onFechar}
      titulo={`Ficha · ${nome}`}
      descricao={`${entidade?.codigo ?? tela?.codigo ?? ''} · ${regime} · ${entidade?.documento ?? tela?.documento ?? ''}. Contatos por assunto, responsáveis, app, entrega e histórico.`}
      acao={editaFicha ? (mudancas.length ? `Salvar ${mudancas.length > 1 ? `(${mudancas.length})` : ''}`.trim() : 'Fechar') : 'Fechar'}
      acaoDesabilitada={editaFicha && tentou && invalido}
      onAcao={editaFicha ? salvar : onFechar}
    >
      <div ref={topo} role="tablist" aria-label="Partes da ficha" className="bg-sunken inset-shadow-trilho flex scroll-mt-4 flex-wrap gap-0.5 rounded-[18px] p-[3px]">
        {abas.map((a) => (
          <button
            key={a.id}
            type="button"
            role="tab"
            aria-selected={aba === a.id}
            onClick={() => trocar(a.id)}
            className={cn('flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3 text-sm whitespace-nowrap transition-colors', aba === a.id ? 'bg-raised shadow-pilula text-foreground font-medium' : 'text-muted-foreground hover:text-foreground')}
          >
            {a.rotulo}
            {a.contador ? <span className="bg-destructive size-1.5 rounded-full" aria-label="com erro" /> : null}
          </button>
        ))}
      </div>

      {aba === 'contatos' && (
        <section className="flex flex-col gap-3" aria-label="Contatos">
          <p className="text-muted-foreground text-xs">
            Quem recebe cada assunto e com que papel entra no app em cada serviço contratado. O principal é quem recebe o que não tem dono.
          </p>
          <fieldset disabled={!editaFicha} className="contents">
            {contatos.length === 0 && <EstadoVazio compacto titulo="Nenhum contato" descricao="Sem contato, cobranças e guias não têm para quem ir. Inclua pelo menos o sócio." />}
            {contatos.map((c, i) => {
              const e = tentou || c.nome ? errosDe(c) : { nome: undefined, whatsapp: undefined, email: undefined, contato: undefined }
              return (
                <div key={i} className="bg-sunken flex flex-col gap-2 rounded-[14px] p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{c.nome || 'Contato novo'}</span>
                    {c.principal && (
                      <Badge variant="outline" className="gap-1">
                        <StarIcon weight="fill" className="size-3" /> principal
                      </Badge>
                    )}
                    {!c.principal && editaFicha && (
                      <Button type="button" size="sm" variant="ghost" className="ml-auto h-7 rounded-full px-2 text-xs" onClick={() => setContatos((xs) => xs.map((x, k) => ({ ...x, principal: k === i })))}>
                        Tornar principal
                      </Button>
                    )}
                  </div>
                  <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_11rem]">
                    <Campo rotulo="Nome" erro={tentou ? e.nome : undefined}>
                      {(id) => <CampoTexto id={id} valor={c.nome} onMudar={(v) => muda(i, { nome: v })} placeholder="Nome completo" />}
                    </Campo>
                    <Campo rotulo="Papel na empresa">{(id) => <CampoEscolha id={id} valor={c.papel} onMudar={(v) => muda(i, { papel: v })} opcoes={papeis.map((x) => ({ valor: x, rotulo: x }))} />}</Campo>
                    <Campo rotulo="WhatsApp" erro={e.whatsapp}>
                      {(id) => <CampoTexto id={id} tipo="tel" valor={c.whatsapp ?? ''} onMudar={(v) => muda(i, { whatsapp: v || undefined })} placeholder="+55 11 98200-3301" />}
                    </Campo>
                    <Campo rotulo="E-mail" erro={e.email}>
                      {(id) => <CampoTexto id={id} tipo="email" valor={c.email ?? ''} onMudar={(v) => muda(i, { email: v || undefined })} placeholder="nome@empresa.com.br" />}
                    </Campo>
                  </div>
                  {e.contato && (
                    <p className="text-warning-text flex items-center gap-1 text-xs">
                      <WarningIcon className="size-3.5" /> {e.contato}
                    </p>
                  )}
                  <Fichas rotulo={`Assuntos de ${c.nome || 'contato'}`} valores={c.assuntos} onMudar={(v) => muda(i, { assuntos: v })} opcoes={assuntos.filter((a) => a.valor !== 'pagamentos' || temBpo)} />
                  <Interruptor ligado={!!c.app} onMudar={(v) => muda(i, { app: v })} rotulo="Usa o app do cliente" detalhe={c.app ? 'Entra com o papel de cada serviço abaixo.' : 'Recebe pelo WhatsApp ou e-mail.'} />
                  {c.app && servicosFicha.length > 0 && (
                    <div className={cn('grid gap-2', servicosFicha.length > 1 && 'sm:grid-cols-2')}>
                      {servicosFicha.map((s) => (
                        <Campo key={s} rotulo={`Papel no app · ${rotuloServicoFicha[s]}`}>
                          {(id) => (
                            <CampoEscolha
                              id={id}
                              valor={papelNoServico(c, s)}
                              onMudar={(v) => muda(i, { papeis: { ...c.papeis, [s]: v } })}
                              opcoes={papeisPorServico[s].map((x) => ({ valor: x, rotulo: x }))}
                            />
                          )}
                        </Campo>
                      ))}
                    </div>
                  )}
                  {editaFicha && (
                    <Button type="button" size="sm" variant="ghost" className="text-destructive-text w-fit self-end rounded-full" onClick={() => setContatos((xs) => xs.filter((_, k) => k !== i))}>
                      Tirar contato
                    </Button>
                  )}
                </div>
              )
            })}
            {editaFicha && (
              <Button type="button" size="sm" variant="outline" className="w-fit rounded-full" onClick={() => setContatos((xs) => [...xs, { nome: '', papel: 'financeiro', assuntos: [] }])}>
                Adicionar contato
              </Button>
            )}
          </fieldset>
          {semAssunto.length > 0 && (
            <p className="bg-warning/10 flex items-start gap-2 rounded-[12px] px-3 py-2 text-xs">
              <WarningIcon className="text-warning mt-0.5 size-3.5 shrink-0" />
              <span>
                Sem ninguém: {semAssunto.map((a) => a.rotulo).join(', ')}. Esses assuntos vão ao {socio ? `${socio.papel} ${socio.nome}` : 'sócio'}.
              </span>
            </p>
          )}
          {!editaFicha && <p className="text-muted-foreground text-xs">Sua conta vê a ficha; quem edita é a equipe do cliente.</p>}
        </section>
      )}

      {aba === 'responsaveis' && (
        <section className="flex flex-col gap-3" aria-label="Responsáveis">
          <p className="text-muted-foreground text-xs">Quem responde por cada setor neste cliente. “Padrão do setor” segue o responsável do setor em Configurações.</p>
          {setoresEquipe.length === 0 ? (
            <EstadoVazio compacto titulo="Sem setores" descricao="O cliente não tem serviço com equipe no escritório." />
          ) : gere ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {setoresEquipe.map((s) => (
                <Campo key={s} rotulo={rotuloSetorCurto[s]}>
                  {(id) => <CampoEscolha id={id} valor={resp[s] ?? ''} onMudar={(v) => setResp({ ...resp, [s]: v || undefined })} opcoes={[{ valor: '', rotulo: 'padrão do setor' }, ...pessoasDo(s).map((n) => ({ valor: n, rotulo: n }))]} />}
                </Campo>
              ))}
            </div>
          ) : (
            <>
              <dl className="divide-border/70 divide-y">
                {setoresEquipe.map((s) => (
                  <div key={s} className="flex items-center justify-between gap-3 py-2 text-sm">
                    <dt className="text-muted-foreground">{rotuloSetorCurto[s]}</dt>
                    <dd>{resp[s] ?? 'padrão do setor'}</dd>
                  </div>
                ))}
              </dl>
              <p className="text-muted-foreground text-xs">Só Gestor e Administrador trocam os responsáveis; você vê.</p>
            </>
          )}
        </section>
      )}

      {aba === 'app' && (
        <section className="flex flex-col gap-4" aria-label="App e serviços">
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium">Serviços extras no app do cliente</h3>
            <p className="text-muted-foreground text-xs">Ativo: o cliente usa. Disponível: aparece com “tenho interesse”. Oculto: não aparece. O cliente nunca ativa sozinho (06, 8).</p>
            <div className="grid gap-x-4 gap-y-2 sm:grid-cols-2">
              {catalogoServicos.map((sv) => (
                <div key={sv.id} className="flex items-center gap-2">
                  <span className="min-w-0 flex-1 text-sm">
                    {sv.nome} <span className="text-muted-foreground text-xs">· fase {sv.fase}</span>
                  </span>
                  {gere ? (
                    <div className="w-32 shrink-0">
                      <CampoEscolha
                        rotulo={`Estado de ${sv.nome}`}
                        valor={servicos[sv.id] ?? 'disponivel'}
                        onMudar={(v) => setServicos({ ...servicos, [sv.id]: v as EstadoServico })}
                        opcoes={(['ativo', 'disponivel', 'oculto'] as const).map((e) => ({ valor: e, rotulo: rotuloEstadoServico[e] }))}
                      />
                    </div>
                  ) : (
                    <Badge variant="outline">{rotuloEstadoServico[servicos[sv.id] ?? 'disponivel']}</Badge>
                  )}
                </div>
              ))}
            </div>
            {!gere && <p className="text-muted-foreground text-xs">Só Gestor e Administrador ligam serviço extra; você vê.</p>}
          </div>
          {temBpo && <AlcadaProposta clienteId={clienteId} contatos={contatos} edita={editaAlcada} />}
        </section>
      )}

      {aba === 'entrega' && (
        <section className="flex flex-col gap-3" aria-label="Preferência de entrega">
          <p className="text-muted-foreground text-xs">
            Como o cliente recebe o que é físico (livros, contratos assinados, guias em papel). Com malote ou motoboy, as tarefas de entrega física nascem com o checklist de protocolo (C2-09).
          </p>
          <fieldset disabled={!editaFicha} className="contents">
            <Campo rotulo="Como entrega">
              {() => (
                <Segmentado
                  rotulo="Como entrega"
                  valor={entrega.modo}
                  onMudar={(modo) => setEntrega({ ...entrega, modo })}
                  opcoes={(['digital', 'malote', 'motoboy', 'retirada'] as const).map((m) => ({ valor: m, rotulo: m === 'digital' ? 'Só digital' : rotuloModoEntrega[m] }))}
                />
              )}
            </Campo>
            {entrega.modo !== 'digital' && (
              <>
                <Interruptor ligado={!!entrega.protocolo} onMudar={(protocolo) => setEntrega({ ...entrega, protocolo })} rotulo="Protocolo de devolução" detalhe="O cliente assina o recebimento; o protocolo volta e entra em Arquivos com origem “malote”." />
                <Campo rotulo="Rotina" ajuda="Ex.: às sextas, pela manhã">
                  {(id) => <CampoTexto id={id} valor={entrega.rotina ?? ''} onMudar={(rotina) => setEntrega({ ...entrega, rotina: rotina || undefined })} placeholder="Quando passa" />}
                </Campo>
              </>
            )}
            <Campo rotulo="Observação">{(id) => <CampoArea id={id} linhas={3} valor={entrega.observacao ?? ''} onMudar={(observacao) => setEntrega({ ...entrega, observacao: observacao || undefined })} placeholder="O que vai por onde" />}</Campo>
          </fieldset>
          <p className="bg-sunken rounded-[12px] px-3 py-2 text-sm">Fica assim: {resumoEntrega(entrega)}</p>
        </section>
      )}

      {aba === 'relacao' && <ResumoRelacao clienteId={clienteId} nome={nome} pacotes={pacotes} />}
      {aba === 'historico' && <HistoricoFicha clienteId={clienteId} />}

      {mudancas.length > 0 && editaFicha && (
        <div className="bg-sunken rounded-[12px] px-3 py-2 text-xs">
          <span className="font-medium">A salvar:</span> {mudancas.slice(0, 4).join('; ')}
          {mudancas.length > 4 ? `; e mais ${mudancas.length - 4}` : ''}
        </div>
      )}
    </GavetaFormulario>
  )
}

/**
 * A68 · Alçada de pagamento (linha do BPO): o escritório só propõe; vale
 * depois que o sócio aprovador aceita no app (01, ad. 25 e 27).
 */
function AlcadaProposta({ clienteId, contatos, edita }: { clienteId: string; contatos: ContatoCliente[]; edita: boolean }) {
  const loja = useLoja()
  const { usuario } = useSessao()
  const empresa = empresasBpo.find((e) => e.clienteId === clienteId)
  const aceitas = loja.estado.bpoAlcadas[clienteId]
  const vigente = aceitas ? { ...empresa?.alcadas, ...aceitas } : empresa?.alcadas
  const proposta = loja.estado.bpoAlcadaProposta[clienteId]
  const [f1, setF1] = useState(String(proposta?.faixa1 ?? vigente?.faixa1 ?? 2000))
  const [f2, setF2] = useState(String(proposta?.faixa2 ?? vigente?.faixa2 ?? 20000))
  const [janela, setJanela] = useState(proposta?.janela ?? vigente?.janela ?? 'seg a sex, 9h às 17h')
  const [pessoas, setPessoas] = useState<Record<string, string>>(() => Object.fromEntries(contatos.map((c) => [c.nome, String(proposta?.pessoas[c.nome] ?? c.alcadaPagamento ?? 0)])))
  const n1 = Number(f1)
  const n2 = Number(f2)
  const erro = !(n1 > 0) || !(n2 > 0) ? 'Informe as duas faixas.' : n1 >= n2 ? 'A faixa 1 precisa ser menor que a 2.' : undefined
  const aprovador = contatos.find((c) => papelNoServico(c, 'bpo_financeiro') === 'aprovador') ?? contatos.find((c) => c.papel.startsWith('sóci') || c.papel === 'titular')
  return (
    <div className="flex flex-col gap-2 border-t pt-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-medium">Alçada de pagamento (BPO)</h3>
        {proposta ? <Badge variant="outline">proposta aguardando o aceite</Badge> : aceitas ? <Badge variant="outline">aceita no app por {aceitas.aceitoPor}</Badge> : vigente ? <Badge variant="outline">vigente · aceita por {vigente.aceitoPor}</Badge> : null}
      </div>
      <p className="text-muted-foreground text-xs">
        O escritório só propõe: a alçada nova vale depois que {aprovador ? aprovador.nome : 'o sócio aprovador'} aceitar no app. Quem propõe não confere nem aprova pagamento desta empresa.
      </p>
      {vigente && (
        <p className="bg-sunken rounded-[12px] px-3 py-2 text-sm">
          Vale hoje: até {brl(vigente.faixa1)} paga com uma aprovação; até {brl(vigente.faixa2)}, com o sócio; acima, reforçada (2 pessoas) · {vigente.janela}
        </p>
      )}
      {edita ? (
        <>
          <div className="grid gap-2 sm:grid-cols-2">
            <Campo rotulo="Faixa 1 (até)" erro={erro}>
              {(id) => <CampoTexto id={id} tipo="number" min={0} valor={f1} onMudar={setF1} />}
            </Campo>
            <Campo rotulo="Faixa 2 (até)">{(id) => <CampoTexto id={id} tipo="number" min={0} valor={f2} onMudar={setF2} />}</Campo>
          </div>
          <Campo rotulo="Janela de pagamento">{(id) => <CampoTexto id={id} valor={janela} onMudar={setJanela} />}</Campo>
          <div className="flex flex-col gap-1.5">
            <span className="text-muted-foreground text-xs">Até quanto cada pessoa aprova (0 = não aprova)</span>
            {contatos.map((c) => (
              <div key={c.nome} className="flex items-center gap-2 text-sm">
                <span className="min-w-0 flex-1 truncate">{c.nome}</span>
                <div className="w-32 shrink-0">
                  <CampoTexto tipo="number" min={0} aria-label={`Alçada de ${c.nome}`} valor={pessoas[c.nome] ?? '0'} onMudar={(v) => setPessoas({ ...pessoas, [c.nome]: v })} />
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              className="rounded-full"
              disabled={!!erro}
              onClick={() => {
                loja.proporAlcada(clienteId, { faixa1: n1, faixa2: n2, janela, pessoas: Object.fromEntries(Object.entries(pessoas).map(([k, v]) => [k, Number(v) || 0])), por: usuario.nome })
                registrar(`${usuario.nome} propôs alçada de pagamento (até ${brl(n1)} · até ${brl(n2)} · ${janela}); vale depois do aceite no app`, 'ficha.atualizar', { cliente_id: clienteId })
                loja.toast(`Proposta enviada ao app. Vale quando ${aprovador?.nome ?? 'o sócio aprovador'} aceitar.`)
              }}
            >
              {proposta ? 'Atualizar a proposta' : 'Propor ao cliente'}
            </Button>
            {proposta && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="rounded-full"
                onClick={() => {
                  loja.proporAlcada(clienteId, null)
                  registrar(`${usuario.nome} retirou a proposta de alçada`, 'ficha.atualizar', { cliente_id: clienteId })
                  loja.toast('Proposta retirada; continua valendo a alçada aceita.')
                }}
              >
                Retirar a proposta
              </Button>
            )}
          </div>
        </>
      ) : (
        <p className="text-muted-foreground text-xs">Só o Gestor do BPO e o Administrador propõem alçada; você vê.</p>
      )}
    </div>
  )
}

/** A71 · Resumo da relação: conversas por setor, tarefas abertas, honorário em aberto e pacotes. */
function ResumoRelacao({ clienteId, nome, pacotes }: { clienteId: string; nome: string; pacotes: string[] }) {
  const loja = useLoja()
  const nav = useNavegacao()
  const fluxos = useFluxos()
  const { usuario, permissoes } = useSessao()
  const conversas = loja.conversas.filter((c) => c.clienteId === clienteId || c.cliente === nome)
  const porSetor = useMemo(() => {
    const m = new Map<SetorIntegrante, { abertas: number; total: number; primeira: string }>()
    for (const c of conversas) {
      const x = m.get(c.setor) ?? { abertas: 0, total: 0, primeira: c.id }
      x.total++
      if (c.status !== 'resolvida') x.abertas++
      m.set(c.setor, x)
    }
    return [...m.entries()]
  }, [conversas])
  const vejo = (s: SetorIntegrante) => usuario.papel === 'administrador' || permissoes.setores.includes(s)
  const tarefas = loja.tarefas.filter((t) => t.cliente === nome && t.status !== 'concluida')
  // Setor que a conta não tem: só a contagem (a mesma regra das conversas).
  const minhas = tarefas.filter((t) => vejo(t.setor))
  const deOutros = tarefas.length - minhas.length
  const emAberto = faturas.filter((f) => f.cliente === nome && (f.situacao === 'vencida' || f.situacao === 'a_vencer' || f.situacao === 'em_acordo'))
  const contrato = contratos.find((c) => c.cliente === nome)
  const veFinanceiro = permissoes.modulos.includes('financeiro')
  return (
    <section className="flex flex-col gap-4" aria-label="Resumo da relação">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { r: 'conversas abertas', v: conversas.filter((c) => c.status !== 'resolvida').length },
          { r: 'tarefas abertas', v: tarefas.length },
          { r: 'faturas em aberto', v: emAberto.length, alerta: emAberto.some((f) => f.situacao === 'vencida') },
          { r: 'pacotes', v: pacotes.length },
        ].map((x) => (
          <div key={x.r} className="bg-sunken flex flex-col rounded-[14px] px-3 py-2">
            <span className={cn('font-heading text-2xl font-light tabular-nums', x.alerta && 'text-destructive-text')}>{x.v}</span>
            <span className="text-muted-foreground text-xs">{x.r}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-1.5">
        <h3 className="text-sm font-medium">Conversas por setor</h3>
        {porSetor.length === 0 && <p className="text-muted-foreground text-sm">Nenhuma conversa com este cliente.</p>}
        <ul className="divide-border/70 divide-y">
          {porSetor.map(([s, x]) => (
            <li key={s} className="flex items-center gap-2 py-1.5 text-sm">
              <span className="min-w-0 flex-1">{rotuloSetorCurto[s] ?? s}</span>
              <span className="text-muted-foreground text-xs tabular-nums">
                {x.abertas} {x.abertas === 1 ? 'aberta' : 'abertas'} · {x.total} no total
              </span>
              {vejo(s) ? (
                <Button type="button" size="sm" variant="ghost" className="h-7 rounded-full px-2" aria-label={`Abrir conversa do ${rotuloSetorCurto[s]}`} onClick={() => nav.irPara({ modulo: 'crm', aba: 'conversas', conversa: x.primeira })}>
                  <ArrowSquareOutIcon />
                </Button>
              ) : (
                <span className="text-muted-foreground w-9 text-center text-xs" title="Setor que você não tem: só a contagem">só nº</span>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col gap-1.5">
        <h3 className="text-sm font-medium">Tarefas abertas</h3>
        {minhas.length === 0 && <p className="text-muted-foreground text-sm">{deOutros ? 'Nada aberto nos seus setores.' : 'Nada aberto para este cliente.'}</p>}
        <ul className="divide-border/70 divide-y">
          {minhas.slice(0, 6).map((t) => (
            <li key={t.id}>
              <button type="button" onClick={() => fluxos.abrirTarefa(t.id)} className="hover:bg-sunken flex w-full cursor-pointer items-center gap-2 rounded-[8px] py-1.5 text-left text-sm">
                <span className="min-w-0 flex-1 truncate">{t.titulo}</span>
                <span className="text-muted-foreground shrink-0 text-xs">
                  {rotuloSetorCurto[t.setor] ?? t.setor} · {t.prazo}
                </span>
              </button>
            </li>
          ))}
        </ul>
        {(minhas.length > 6 || deOutros > 0) && (
          <p className="text-muted-foreground text-xs">
            {[minhas.length > 6 ? `e mais ${minhas.length - 6}` : '', deOutros ? `${deOutros} em setores que você não tem` : ''].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <h3 className="text-sm font-medium">Honorário e pacotes</h3>
        <p className="text-sm">
          Pacotes: {pacotes.map((p) => (p === 'bpo' || p === 'bpo_financeiro' ? 'BPO financeiro' : p === 'contabil' ? 'Contábil' : p)).join(' + ')}
        </p>
        {veFinanceiro ? (
          <>
            {contrato && (
              <p className="text-muted-foreground text-sm">
                Contrato {brl(totalContrato(contrato))}/mês · vence dia {contrato.vencimentoDia} · reajuste {contrato.indice}
              </p>
            )}
            {emAberto.length === 0 ? (
              <p className="text-muted-foreground text-sm">Sem honorário em aberto.</p>
            ) : (
              <ul className="flex flex-col gap-1 text-sm">
                {emAberto.map((f) => (
                  <li key={f.id} className="flex items-center gap-2">
                    <span className="flex-1">
                      {f.competencia} · {brl(f.valor)}
                    </span>
                    <span className={cn('rounded-full px-2 py-0.5 text-xs', f.situacao === 'vencida' ? 'bg-destructive/12 text-foreground' : 'bg-sunken text-muted-foreground')}>
                      {f.situacao === 'vencida' ? `vencida há ${f.diasAtraso ?? 0} d` : f.situacao === 'em_acordo' ? 'em acordo' : `vence ${f.vencimento}`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <p className="text-muted-foreground text-sm">{emAberto.length ? `${emAberto.length} ${emAberto.length === 1 ? 'fatura em aberto' : 'faturas em aberto'}; valores no Financeiro.` : 'Sem honorário em aberto.'}</p>
        )}
      </div>
    </section>
  )
}

/** Histórico das mudanças da ficha (eventos `ficha.atualizar` do cliente, o mais novo em cima). */
function HistoricoFicha({ clienteId }: { clienteId: string }) {
  const eventos = useTabela('evento')
  const itens = useMemo(() => eventos.filter((e) => e.nome === 'ficha.atualizar' && e.cliente_id === clienteId).sort((a, b) => b.criado_em.localeCompare(a.criado_em)), [eventos, clienteId])
  if (!itens.length) return <EstadoVazio compacto icone={ClockCounterClockwiseIcon} titulo="Sem mudanças registradas" descricao="Cada vez que alguém salva a ficha, o que mudou entra aqui, com o nome e a hora." />
  return (
    <ol className="relative flex flex-col gap-3 border-l pl-4 text-sm" aria-label="Histórico da ficha">
      {itens.map((e) => (
        <li key={e.id} className="relative">
          <span className="bg-foreground absolute top-1.5 -left-[21px] size-2 rounded-full" />
          <span className="text-muted-foreground block text-xs">
            {new Date(e.criado_em).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })} · {e.ator_nome ?? 'sistema'}
          </span>
          {e.texto}
        </li>
      ))}
    </ol>
  )
}

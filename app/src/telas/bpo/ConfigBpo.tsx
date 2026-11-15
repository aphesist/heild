import { ArrowCounterClockwiseIcon, BankIcon, LockSimpleIcon, PencilSimpleIcon, PlugsConnectedIcon, ShieldCheckIcon } from '@phosphor-icons/react'
import { useMemo, useState } from 'react'
import { useSessao } from '@/ambiente/sessao'
import { EdicaoEmLinha, EstadoVazio, SePode, useAcao, useConfirmar, usePode } from '@/components/kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Campo, CampoEscolha, CampoTexto, GavetaFormulario } from '@/components/ui/formulario'
import { Orb } from '@/components/ui/orb'
import { integrantes as integrantesBase } from '@/dados/exemplo'
import { useAparencia } from '@/hooks/useAparencia'
import { cn } from '@/lib/utils'
import type { BpoAlcada, BpoPerfil } from '@/nucleo/modelo/entidades'
import { useTabela } from '@/nucleo/react'
import { repos } from '@/nucleo/repositorios'
import { pesosPadrao } from '@/nucleo/semente/s08'
import { SeloTitular } from '../financeiro/pecas'
import { brl, CabecalhoBpo, Caixa, PaginaBpo, Propriedade, SeloAudit, SeloErp, TituloBloco, type PropsBpo } from './comum'
import { criteriosAudit, dataCurta, dataHora, quando, rotuloModoPagamento, useBpo, type EmpresaVista } from './dados'
import { passosEscalonamento } from './AprovacoesBpo'
import { BlocoErp, ConectarGaveta } from './FichaEmpresa'
import { integrantesBpo, limitesDa, parametrosS08c, regrasSlaDe, salvarParametrosS08c, slaPadrao, type RegrasSla } from './regras-s08c'

const explicaModo: Record<BpoPerfil['modo_pagamento'], string> = {
  M1: 'O BPO prepara e o cliente aprova no app; depois ele mesmo libera no banco. O padrão.',
  M2: 'Depois do cartão aprovado, o pagamento é agendado por API do banco no vencimento, até o teto. Conta acima do teto vai como M1.',
  M3: 'O BPO liberaria no banco até um teto delegado por escrito. Desligado na primeira versão (só com parecer jurídico, teto baixo e contrato).',
}

const rotuloSituacaoAlcada: Record<BpoAlcada['situacao'], string> = { proposta: 'proposta', vigente: 'vigente', recusada: 'recusada pelo sócio', substituida: 'substituída', retirada: 'retirada' }

/** O que faz uma conta subir de faixa (10, 3.7): regras fixas do sistema, para todas as empresas. */
const sobemDeFaixa = ['Fornecedor novo', 'Dados bancários alterados', 'Pessoa física', 'Valor 30% acima da média do fornecedor', 'Duplicidade suspeita', 'Fracionamento (soma por fornecedor e dia)', 'Fora do horário', 'Urgência (muda o caminho, não elimina o controle)']

/**
 * BPO › Configuração (S08-T07): por empresa, o ERP e o modo (A33), os bancos
 * por Open Finance (A34), o modo de pagamento (A35), as alçadas e os
 * aprovadores (A36), as regras de conferência, a janela e o escalonamento
 * (A37) e o SLA; para o escritório, os pesos e limiares do audit score (A38),
 * o teto do WhatsApp, a equipe do BPO com a alçada de conferência de cada um
 * e os integrantes por função com o que cada um faz sozinho. Alçada e modo só
 * valem com o aceite do sócio no app.
 */
export function ConfigBpoTela({ empresa, onEscolher }: PropsBpo) {
  const { empresas } = useBpo()
  if (!empresa)
    return (
      <PaginaBpo>
        <CabecalhoBpo titulo="Configuração" sub="Escolha a empresa: cada uma tem ERP, bancos, modo de pagamento, alçadas, janela e SLA próprios. O que vale para todas está embaixo." />
        <Caixa className="gap-0">
          {empresas.length === 0 ? (
            <EstadoVazio compacto icone={PlugsConnectedIcon} titulo="Nenhuma empresa no BPO" descricao="Ponha uma empresa no BPO pela Carteira: a configuração dela aparece aqui." />
          ) : (
            <ul className="divide-border/70 flex flex-col divide-y" aria-label="Empresas para configurar">
              {empresas.map((e) => (
                <li key={e.clienteId} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5 text-sm">
                  <SeloAudit e={e} compacto />
                  <button type="button" onClick={() => onEscolher(e.clienteId, 'configuracao')} className="min-w-0 flex-1 basis-48 cursor-pointer truncate text-left hover:underline">
                    {e.nome}
                    <span className="text-muted-foreground block truncate text-xs">
                      {e.perfil.modo_pagamento}
                      {e.perfil.modo_pagamento === 'M2' && e.perfil.teto_m2 ? ` até ${brl(e.perfil.teto_m2)}` : ''} · faixas {brl(e.faixa1)} e {brl(e.faixa2)} · {e.alcada ? `aceitas por ${e.alcada.aceito_por}` : 'sem alçada aceita'}
                    </span>
                  </button>
                  {e.proposta && <Badge variant="destaque">proposta aguardando o sócio</Badge>}
                  <SeloErp e={e} />
                </li>
              ))}
            </ul>
          )}
        </Caixa>
        <ParametrosEscritorio />
      </PaginaBpo>
    )
  return <ConfigEmpresa key={empresa.clienteId} e={empresa} />
}

function ConfigEmpresa({ e }: { e: EmpresaVista }) {
  const { usuario } = useSessao()
  const executar = useAcao()
  const confirmar = useConfirmar()
  const edita = usePode('bpo.perfil.editar', { cliente_id: e.clienteId })
  const podeAlcada = usePode('alcada.alterar', { cliente_id: e.clienteId })
  const admin = usuario.papel === 'administrador'
  const [gaveta, setGaveta] = useState<'erp' | 'banco' | 'alcadas' | 'escalonamento' | 'sla' | null>(null)
  const [modo, setModo] = useState<{ m: BpoPerfil['modo_pagamento']; teto: string } | null>(null)
  const tAlcada = useTabela('bpo_alcada')
  const historico = useMemo(() => tAlcada.filter((a) => a.cliente_id === e.clienteId).sort((a, b) => b.criado_em.localeCompare(a.criado_em)), [tAlcada, e.clienteId])
  const limites = limitesDa(e)
  const sla = regrasSlaDe(e)

  const proporModo = async (m: BpoPerfil['modo_pagamento'], teto?: number) => {
    const ok = await confirmar({ titulo: `Propor ${rotuloModoPagamento[m]}?`, descricao: 'O modo de pagamento só vale depois do aceite do sócio no app. Até lá, continua o atual. Quem propõe não confere nem aprova pagamentos desta empresa.', acao: 'Mandar para o aceite' })
    if (ok !== true) return
    executar(() => repos.bpo.alcadas.propor(e.clienteId, { faixa1: e.faixa1, faixa2: e.faixa2, janela: e.alcada?.janela ?? e.perfil.janela.dias, pessoas: e.alcada?.pessoas ?? {}, extras: { ...e.alcada?.extras, modo_pagamento: m, teto_m2: teto ?? null } }), { sucesso: 'Modo proposto: vale com o aceite do sócio no app' })
    setModo(null)
  }

  return (
    <PaginaBpo>
      <CabecalhoBpo titulo="Configuração" sub={`${e.nome} · vale só para esta empresa`}>
        <SeloTitular titular={{ tipo: 'empresa', clienteId: e.clienteId, nome: e.nome }} />
      </CabecalhoBpo>
      <div className="grid gap-4 lg:grid-cols-2">
        <Caixa>
          <TituloBloco
            descricao="A plataforma lê e escreve no ERP que a empresa já usa; o que não tem API entra por arquivo. A credencial fica no cofre do escritório, com o escopo mínimo."
            acao={
              edita && (
                <SePode ferramenta="erp.conectar" alvo={{ cliente_id: e.clienteId }}>
                  <Button size="sm" variant="outline" className="rounded-full" onClick={() => setGaveta('erp')}>
                    <PencilSimpleIcon /> Trocar
                  </Button>
                </SePode>
              )
            }
          >
            ERP e modo
          </TituloBloco>
          <BlocoErp e={e} />
        </Caixa>
        <Caixa>
          <TituloBloco
            descricao="Só leitura (Open Finance ou API do banco); consentimento que vence em 30 dias vira tarefa. Senha de internet banking nunca é guardada."
            acao={
              <SePode ferramenta="banco.conectar" alvo={{ cliente_id: e.clienteId }}>
                <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setGaveta('banco')}>
                  <BankIcon /> Conectar banco
                </Button>
              </SePode>
            }
          >
            Bancos por Open Finance
          </TituloBloco>
          <ul className="divide-border/70 flex flex-col divide-y" aria-label="Contas bancárias">
            {e.bancos.length === 0 && <li className="text-muted-foreground py-2 text-sm">Nenhum banco conectado.</li>}
            {e.bancos.map((b) => {
              const vencendo = b.consentimento_ate && Number(b.consentimento_ate.slice(0, 10).replace(/-/g, '')) <= 20261218
              return (
                <li key={b.id} className="flex flex-wrap items-center gap-2 py-2 text-sm">
                  <PlugsConnectedIcon className="text-muted-foreground size-4" />
                  <span className="min-w-0 flex-1 basis-48">
                    <span className="block truncate">{b.nome}</span>
                    <span className="text-muted-foreground block text-xs">
                      {b.via === 'open_finance' ? 'Open Finance' : b.via === 'api_banco' ? 'API do banco' : 'lançado no ERP'} · saldo lido {dataHora(b.saldo_em)}
                      {b.consentimento_ate && ` · consentimento até ${dataCurta(b.consentimento_ate)}/${b.consentimento_ate.slice(0, 4)}`}
                    </span>
                  </span>
                  {vencendo && (
                    <SePode ferramenta="banco.conectar" alvo={{ cliente_id: e.clienteId }}>
                      <Button size="sm" variant="outline" className="rounded-full" onClick={() => executar(() => repos.bpo.bancos.atualizar(b.id, { consentimento_ate: '2027-11-18' }, { texto: `Pediu ao cliente a renovação do consentimento do ${b.nome}; renovado no app` }), { sucesso: 'Consentimento renovado pelo cliente no app (demonstração)' })}>
                        Renovar consentimento
                      </Button>
                    </SePode>
                  )}
                  {admin && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-full"
                      onClick={async () => {
                        const m = await confirmar({ titulo: `Revogar o acesso ao ${b.nome}?`, descricao: 'A plataforma deixa de ler o extrato e o saldo desta conta. Fica no histórico; para voltar, o cliente dá um consentimento novo.', acao: 'Revogar', perigo: true, exigirMotivo: true })
                        if (typeof m === 'string') executar(() => repos.bpo.bancos.arquivar(b.id, { motivo: m, texto: `Revogou o acesso ao ${b.nome}: ${m}` }), { sucesso: `Acesso ao ${b.nome} revogado` })
                      }}
                    >
                      Revogar
                    </Button>
                  )}
                </li>
              )
            })}
          </ul>
        </Caixa>
        <Caixa>
          <TituloBloco descricao="Em todos os modos o cliente aprova antes; a diferença é quem aperta o botão no banco. Trocar vai ao aceite do sócio.">Modo de pagamento</TituloBloco>
          <div role="radiogroup" aria-label="Modo de pagamento" className="flex flex-col gap-1.5">
            {(['M1', 'M2', 'M3'] as const).map((m) => {
              const atual = e.perfil.modo_pagamento === m
              const proposto = e.proposta?.extras?.modo_pagamento === m
              return (
                <button
                  key={m}
                  type="button"
                  role="radio"
                  aria-checked={atual}
                  disabled={!podeAlcada || m === 'M3' || atual}
                  onClick={() => (m === 'M2' ? setModo({ m, teto: String(e.perfil.teto_m2 ?? 10_000) }) : void proporModo(m))}
                  className={cn('flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2.5 text-left text-sm disabled:cursor-default', m === 'M3' && 'opacity-60', atual ? 'bg-raised shadow-contorno' : 'hover:bg-sunken/60')}
                >
                  <span className={cn('mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border', atual && 'border-foreground')}>{atual && <span className="bg-foreground size-2 rounded-full" />}</span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-1.5">
                      {rotuloModoPagamento[m]}
                      {m === 'M2' && atual && e.perfil.teto_m2 ? ` · teto ${brl(e.perfil.teto_m2)}` : ''}
                      {m === 'M3' && (
                        <Badge variant="outline">
                          <LockSimpleIcon /> fora da v1
                        </Badge>
                      )}
                    </span>
                    <span className="text-muted-foreground block text-xs">{explicaModo[m]}</span>
                    {proposto && <Badge variant="destaque" className="mt-1">proposto, aguardando o aceite do sócio</Badge>}
                  </span>
                </button>
              )
            })}
          </div>
          {!podeAlcada && <p className="text-muted-foreground text-xs">Só o Gestor do BPO ou o Administrador propõe outro modo.</p>}
        </Caixa>
        <Caixa>
          <TituloBloco
            descricao={e.alcada ? `Aceitas por ${e.alcada.aceito_por} em ${dataCurta(e.alcada.aceito_em?.slice(0, 10))}${e.alcada.vigencia_ate ? ` · revisão até ${dataCurta(e.alcada.vigencia_ate)}/${e.alcada.vigencia_ate.slice(0, 4)}` : ''}` : 'Sem alçada aceita: valem as faixas de exemplo do plano até o aceite.'}
            acao={
              podeAlcada && (
                <Button size="sm" variant="outline" className="rounded-full" onClick={() => setGaveta('alcadas')}>
                  <PencilSimpleIcon /> Propor
                </Button>
              )
            }
          >
            Alçadas e aprovadores
          </TituloBloco>
          <dl className="divide-border/70 divide-y">
            <Propriedade rotulo="Faixa 1">{`até ${brl(e.faixa1)}: 1 aprovador; 1 conferência`}</Propriedade>
            <Propriedade rotulo="Faixa 2">{`até ${brl(e.faixa2)}: 1 aprovador com alçada para o total; analista e gestor conferem`}</Propriedade>
            <Propriedade rotulo="Acima">{`de ${brl(e.faixa2)}, ou com exceção: aprovação reforçada (2 pessoas)`}</Propriedade>
            <Propriedade rotulo="Limites">{`${limites.dia ? `${brl(limites.dia)} por dia` : 'sem limite diário'} · ${limites.mes ? `${brl(limites.mes)} por mês` : 'sem limite mensal'}`}</Propriedade>
            <Propriedade rotulo="Janela">{e.alcada?.janela ?? e.perfil.janela.dias}</Propriedade>
          </dl>
          <ul className="flex flex-col gap-1.5" aria-label="Aprovadores da ficha">
            {(e.ficha?.contatos ?? []).length === 0 && <li className="text-muted-foreground text-sm">Nenhum contato na ficha: convide o sócio e o financeiro no app.</li>}
            {(e.ficha?.contatos ?? []).map((c) => (
              <li key={c.nome} className="bg-sunken/50 flex flex-wrap items-center gap-2 rounded-lg px-3 py-2 text-sm">
                <span className="min-w-0 flex-1 basis-40">
                  {c.nome}
                  <span className="text-muted-foreground block text-xs">
                    {c.papel}
                    {c.app ? ' · usa o app' : ' · sem o app'}
                  </span>
                </span>
                <span className="text-xs">{c.alcadaPagamento ? `aprova até ${brl(Math.min(c.alcadaPagamento, e.faixa2))}` : 'não aprova'}</span>
                {(c.alcadaPagamento ?? 0) > e.faixa2 && <span className="text-muted-foreground text-xs">(a ficha diz {brl(c.alcadaPagamento ?? 0)}; vale a menor)</span>}
                {c.reforcada && <Badge variant="outline">reforçada</Badge>}
              </li>
            ))}
          </ul>
          <p className="text-muted-foreground text-xs">A alçada da pessoa fica no contato da ficha e quem edita é o sócio aprovador. Toda mudança vai ao aceite no app. Quem altera as alçadas de uma empresa não confere nem aprova pagamento nela.</p>
          {e.proposta && (
            <div className="bg-sunken/60 flex flex-col gap-1 rounded-lg px-3 py-2.5 text-sm">
              <span className="font-medium">Proposta aguardando o aceite do sócio no app</span>
              <span className="text-muted-foreground text-xs">
                faixa 1 até {brl(e.proposta.faixa1)} · faixa 2 até {brl(e.proposta.faixa2)} · {e.proposta.janela}
                {e.proposta.extras?.modo_pagamento ? ` · modo ${String(e.proposta.extras.modo_pagamento)}` : ''}
                {e.proposta.extras?.limite_dia ? ` · ${brl(Number(e.proposta.extras.limite_dia))} por dia` : ''} · proposta por {e.proposta.proposta_por_nome}
              </span>
              {podeAlcada && (
                <Button size="sm" variant="ghost" className="w-fit rounded-full" onClick={() => executar(() => repos.bpo.alcadas.retirar(e.proposta!.id), { sucesso: 'Proposta de alçadas retirada' })}>
                  Retirar a proposta
                </Button>
              )}
            </div>
          )}
          {historico.length > 1 && (
            <details className="text-xs">
              <summary className="text-muted-foreground cursor-pointer select-none">Versões das alçadas ({historico.length})</summary>
              <ol className="mt-2 flex flex-col gap-1 border-l pl-3" aria-label="Versões das alçadas">
                {historico.map((a) => (
                  <li key={a.id}>
                    <span className="font-medium">{rotuloSituacaoAlcada[a.situacao]}</span> · faixas {brl(a.faixa1)} e {brl(a.faixa2)} · proposta por {a.proposta_por_nome} {dataHora(a.criado_em)}
                    {a.aceito_por && ` · ${a.situacao === 'recusada' ? 'recusada' : 'aceita'} por ${a.aceito_por}`}
                  </li>
                ))}
              </ol>
            </details>
          )}
        </Caixa>
        <Caixa>
          <TituloBloco descricao="Segregação de funções (10, 3.8): o sistema confere a etapa de cada pessoa e desliga o botão com o motivo.">Regras de conferência</TituloBloco>
          <ul className="flex flex-col gap-1.5 text-sm">
            <li className="flex gap-2">
              <ShieldCheckIcon className="mt-0.5 size-4 shrink-0" /> Quem digitou não confere, também em operação pequena.
            </li>
            <li className="flex gap-2">
              <ShieldCheckIcon className="mt-0.5 size-4 shrink-0" /> Até {brl(e.faixa1)}: uma conferência. Acima: analista e Gestor do BPO.
            </li>
            <li className="flex gap-2">
              <ShieldCheckIcon className="mt-0.5 size-4 shrink-0" /> Fornecedor novo ou com dados alterados só entra em lote com os dados confirmados por segundo canal.
            </li>
            <li className="flex gap-2">
              <ShieldCheckIcon className="mt-0.5 size-4 shrink-0" /> {e.perfil.analista_nome === e.perfil.responsavel_nome ? `BPO de uma pessoa (${e.perfil.analista_nome}): a conferência pode passar ao cliente, na aprovação ("Cliente confere").` : `Analista ${e.perfil.analista_nome}, responsável ${e.perfil.responsavel_nome}: a segunda conferência é do Gestor.`}
            </li>
          </ul>
          <div>
            <span className="text-muted-foreground text-xs">Sobem de faixa (regras fixas do sistema):</span>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {sobemDeFaixa.map((s) => (
                <Badge key={s} variant="secondary">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        </Caixa>
        <Caixa>
          <TituloBloco
            descricao="O relógio pausa quando a bola está com o cliente (cartão sem resposta, documento faltando) e volta na resposta."
            acao={
              edita && (
                <Button size="sm" variant="outline" className="rounded-full" onClick={() => setGaveta('sla')}>
                  <PencilSimpleIcon /> Editar
                </Button>
              )
            }
          >
            SLA da empresa
          </TituloBloco>
          <dl className="divide-border/70 divide-y">
            <Propriedade rotulo="Meta do mês">{`${e.perfil.sla.meta}% no prazo · agora ${e.perfil.sla.mes}%`}</Propriedade>
            <Propriedade rotulo="Captura">{`conta capturada em até ${sla.captura_h} h`}</Propriedade>
            <Propriedade rotulo="Lote">{`enviado até ${sla.lote_antes_h} h antes do vencimento`}</Propriedade>
            <Propriedade rotulo="Conciliação">{`até o dia ${sla.conciliacao_dia} útil do mês seguinte`}</Propriedade>
            <Propriedade rotulo="Relatório">{`até o dia ${sla.relatorio_dia} do mês seguinte`}</Propriedade>
          </dl>
        </Caixa>
        <Caixa className="lg:col-span-2">
          <TituloBloco
            descricao="O que acontece com o lote sem resposta. Pagar nunca é automático: no fim da cadeia só há alerta."
            acao={
              edita && (
                <Button size="sm" variant="outline" className="rounded-full" onClick={() => setGaveta('escalonamento')}>
                  <PencilSimpleIcon /> Editar
                </Button>
              )
            }
          >
            Janela e escalonamento do lote
          </TituloBloco>
          <ol className="grid gap-2 sm:grid-cols-5" aria-label="Passos do escalonamento">
            {passosEscalonamento(e).map((p, i) => (
              <li key={i} className="bg-sunken/50 flex flex-col gap-1 rounded-lg p-3 text-sm">
                <span className="text-muted-foreground text-xs">
                  {i + 1}. {p.quando}
                </span>
                {p.texto}
              </li>
            ))}
          </ol>
        </Caixa>
      </div>
      <ParametrosEscritorio />

      {gaveta === 'erp' && <ConectarGaveta tipo="erp" perfil={e.perfil} nome={e.nome} onFechar={() => setGaveta(null)} />}
      {gaveta === 'banco' && <ConectarGaveta tipo="banco" perfil={e.perfil} nome={e.nome} onFechar={() => setGaveta(null)} />}
      {gaveta === 'alcadas' && <PropostaAlcadas e={e} onFechar={() => setGaveta(null)} usuario={usuario.nome} />}
      {gaveta === 'escalonamento' && <Escalonamento e={e} onFechar={() => setGaveta(null)} />}
      {gaveta === 'sla' && <SlaGaveta e={e} onFechar={() => setGaveta(null)} />}
      {modo && (
        <GavetaFormulario aberta onFechar={() => setModo(null)} titulo="M2 · pagamento por API após o cartão" descricao="O cartão aprovado agenda o pagamento no banco, com credencial de escopo só de pagamento e teto por pagamento. Conta acima do teto vai como M1." acao="Propor ao sócio" acaoDesabilitada={!(Number(modo.teto) > 0)} onAcao={() => void proporModo('M2', Number(modo.teto))}>
          <Campo rotulo="Teto por pagamento (R$)" erro={Number(modo.teto) > 0 ? undefined : 'Informe o teto.'}>
            {(id) => <CampoTexto id={id} tipo="number" valor={modo.teto} onMudar={(v) => setModo({ ...modo, teto: v })} />}
          </Campo>
        </GavetaFormulario>
      )}
    </PaginaBpo>
  )
}

/** Alçadas (S08-A36): a proposta vai ao aceite do sócio no app; nada muda antes. */
function PropostaAlcadas({ e, onFechar, usuario }: { e: EmpresaVista; onFechar: () => void; usuario: string }) {
  const executar = useAcao()
  const contatos = e.ficha?.contatos ?? []
  const lim = limitesDa(e)
  const [r, setR] = useState({
    f1: String(e.faixa1),
    f2: String(e.faixa2),
    janela: e.alcada?.janela ?? e.perfil.janela.dias,
    dia: lim.dia ? String(lim.dia) : '',
    mes: lim.mes ? String(lim.mes) : '',
    vigencia: e.alcada?.vigencia_ate ?? '2027-11-18',
    pessoas: Object.fromEntries(contatos.map((c) => [c.nome, String(c.alcadaPagamento ?? 0)])) as Record<string, string>,
    reforcada: Object.fromEntries(contatos.map((c) => [c.nome, !!c.reforcada])) as Record<string, boolean>,
  })
  const erro = !(Number(r.f1) > 0) ? 'A faixa 1 precisa ser maior que zero.' : !(Number(r.f2) > Number(r.f1)) ? 'A faixa 2 precisa ser maior que a faixa 1.' : undefined
  const erroDia = r.dia && r.mes && Number(r.dia) > Number(r.mes) ? 'O limite do dia não pode passar o do mês.' : undefined
  const marcadas = Object.values(r.reforcada).filter(Boolean).length
  return (
    <GavetaFormulario
      aberta
      onFechar={onFechar}
      titulo="Alçadas de pagamento"
      descricao="Nada muda até o sócio aceitar no app. Quem propõe deixa de conferir e aprovar pagamentos desta empresa."
      acao="Mandar para o aceite"
      acaoDesabilitada={!!erro || !!erroDia}
      onAcao={() => {
        const ok = executar(
          () =>
            repos.bpo.alcadas.propor(e.clienteId, {
              faixa1: Number(r.f1),
              faixa2: Number(r.f2),
              janela: r.janela,
              pessoas: Object.fromEntries(Object.entries(r.pessoas).map(([k, v]) => [k, Number(v) || 0])),
              extras: { modo_pagamento: e.perfil.modo_pagamento, teto_m2: e.perfil.teto_m2 ?? null, limite_dia: Number(r.dia) || null, limite_mes: Number(r.mes) || null, reforcada: r.reforcada, vigencia_ate: r.vigencia },
            }),
          { sucesso: `Proposta enviada: vale depois do aceite do sócio no app. ${usuario}, você não confere pagamentos desta empresa.` },
        )
        if (ok) onFechar()
      }}
    >
      <Campo rotulo="Faixa 1 (1 aprovador, 1 conferência), até R$" erro={erro?.includes('faixa 1 precisa ser maior que zero') ? erro : undefined}>
        {(id) => <CampoTexto id={id} tipo="number" valor={r.f1} onMudar={(v) => setR((x) => ({ ...x, f1: v }))} />}
      </Campo>
      <Campo rotulo="Faixa 2 (aprovador com alçada; analista e gestor conferem), até R$" ajuda="Acima disso, duas pessoas aprovam." erro={erro?.includes('faixa 2') ? erro : undefined}>
        {(id) => <CampoTexto id={id} tipo="number" valor={r.f2} onMudar={(v) => setR((x) => ({ ...x, f2: v }))} />}
      </Campo>
      <Campo rotulo="Limite por dia (R$)" ajuda="Soma do que fica com o cliente no dia; vazio = sem limite." erro={erroDia}>
        {(id) => <CampoTexto id={id} tipo="number" valor={r.dia} onMudar={(v) => setR((x) => ({ ...x, dia: v }))} />}
      </Campo>
      <Campo rotulo="Limite por mês (R$)">{(id) => <CampoTexto id={id} tipo="number" valor={r.mes} onMudar={(v) => setR((x) => ({ ...x, mes: v }))} />}</Campo>
      <Campo rotulo="Janela de aprovação">{(id) => <CampoTexto id={id} valor={r.janela} onMudar={(v) => setR((x) => ({ ...x, janela: v }))} />}</Campo>
      <Campo rotulo="Revisão anual até" ajuda="Cada alçada tem vigência e revisão anual (10, 3.7).">
        {(id) => <CampoTexto id={id} tipo="date" valor={r.vigencia} onMudar={(v) => setR((x) => ({ ...x, vigencia: v }))} />}
      </Campo>
      {contatos.map((c) => (
        <div key={c.nome} className="flex flex-col gap-1">
          <Campo rotulo={`${c.nome} (${c.papel}) aprova até R$`} ajuda="0 = não aprova pagamentos">
            {(id) => <CampoTexto id={id} tipo="number" valor={r.pessoas[c.nome] ?? '0'} onMudar={(v) => setR((x) => ({ ...x, pessoas: { ...x.pessoas, [c.nome]: v } }))} />}
          </Campo>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={!!r.reforcada[c.nome]} onChange={(ev) => setR((x) => ({ ...x, reforcada: { ...x.reforcada, [c.nome]: ev.target.checked } }))} className="accent-foreground size-4" aria-label={`${c.nome} entra na aprovação reforçada`} />
            Entra na aprovação reforçada
          </label>
        </div>
      ))}
      {marcadas < 2 && contatos.length > 0 && <p className="text-warning-foreground text-xs">A aprovação reforçada pede duas pessoas marcadas; hoje {marcadas === 1 ? 'há uma' : 'não há nenhuma'}. Lotes acima da faixa 2 ficam sem quem aprove.</p>}
    </GavetaFormulario>
  )
}

/** Janela e escalonamento (S08-A37): abertura, prazos e substituto por empresa. */
function Escalonamento({ e, onFechar }: { e: EmpresaVista; onFechar: () => void }) {
  const executar = useAcao()
  const esc = e.perfil.escalonamento
  const contatos = e.ficha?.contatos ?? []
  const [r, setR] = useState({ abertura: e.perfil.janela.abertura, lembrete: String(esc.lembrete_h), substituto_h: String(esc.substituto_h), aprovador: esc.aprovador || contatos[0]?.nome || '', substituto: esc.substituto ?? '', socio: esc.socio || '' })
  const erro = !(Number(r.lembrete) > 0) || !(Number(r.substituto_h) > Number(r.lembrete)) ? 'O substituto entra depois do lembrete.' : undefined
  const sub = contatos.find((c) => c.nome === r.substituto)
  return (
    <GavetaFormulario
      aberta
      onFechar={onFechar}
      titulo="Janela e escalonamento"
      descricao="Vale só para esta empresa. O sócio e o Gestor do BPO sempre recebem o alerta da véspera e o do vencido."
      acao="Salvar"
      acaoDesabilitada={!!erro}
      onAcao={() => {
        const ok = executar(() => repos.bpo.perfis.atualizar(e.perfil.id, { janela: { ...e.perfil.janela, abertura: r.abertura }, escalonamento: { ...esc, aprovador: r.aprovador, substituto: r.substituto || null, socio: r.socio || esc.socio, lembrete_h: Number(r.lembrete), substituto_h: Number(r.substituto_h) } }, { texto: `Atualizou a janela e o escalonamento de ${e.nome}` }), { sucesso: 'Escalonamento do lote atualizado' })
        if (ok) onFechar()
      }}
    >
      <Campo rotulo="Abertura da janela">{(id) => <CampoTexto id={id} tipo="time" valor={r.abertura} onMudar={(v) => setR((x) => ({ ...x, abertura: v }))} />}</Campo>
      <Campo rotulo="Aprovador designado">{(id) => <CampoEscolha id={id} valor={r.aprovador} onMudar={(v) => setR((x) => ({ ...x, aprovador: v }))} opcoes={contatos.map((c) => ({ valor: c.nome, rotulo: `${c.nome} (${c.papel})` }))} />}</Campo>
      <Campo rotulo="Lembrete ao aprovador depois de (horas)">{(id) => <CampoTexto id={id} tipo="number" valor={r.lembrete} onMudar={(v) => setR((x) => ({ ...x, lembrete: v }))} />}</Campo>
      <Campo rotulo="Vai ao substituto depois de (horas)" ajuda="Se passar do expediente, vai na abertura do dia útil seguinte." erro={erro}>
        {(id) => <CampoTexto id={id} tipo="number" valor={r.substituto_h} onMudar={(v) => setR((x) => ({ ...x, substituto_h: v }))} />}
      </Campo>
      <Campo rotulo="Substituto do aprovador" ajuda={sub && !(sub.alcadaPagamento ?? 0) ? `${sub.nome} não tem alçada na ficha: recebe o cartão, mas não aprova.` : 'Nunca alguém do BPO: o substituto é do cliente (10, Q4).'}>
        {(id) => <CampoEscolha id={id} valor={r.substituto} onMudar={(v) => setR((x) => ({ ...x, substituto: v }))} opcoes={[{ valor: '', rotulo: 'nenhum (alerta ao Gestor do BPO)' }, ...contatos.filter((c) => c.nome !== r.aprovador).map((c) => ({ valor: c.nome, rotulo: `${c.nome} (${c.papel})` }))]} />}
      </Campo>
      <Campo rotulo="Sócio que recebe os alertas">{(id) => <CampoEscolha id={id} valor={r.socio} onMudar={(v) => setR((x) => ({ ...x, socio: v }))} opcoes={[{ valor: '', rotulo: 'o sócio da ficha' }, ...contatos.map((c) => ({ valor: c.nome, rotulo: `${c.nome} (${c.papel})` }))]} />}</Campo>
    </GavetaFormulario>
  )
}

/** SLA da empresa (10, 3.14): captura, lote, conciliação e relatório; meta do mês. */
function SlaGaveta({ e, onFechar }: { e: EmpresaVista; onFechar: () => void }) {
  const executar = useAcao()
  const atual = regrasSlaDe(e)
  const [r, setR] = useState({ meta: String(e.perfil.sla.meta), ...Object.fromEntries(Object.entries(atual).map(([k, v]) => [k, String(v)])) } as Record<keyof RegrasSla | 'meta', string>)
  const meta = Number(r.meta)
  const erro = !(meta > 0 && meta <= 100) ? 'A meta vai de 1 a 100%.' : Object.keys(slaPadrao).some((k) => !(Number(r[k as keyof RegrasSla]) > 0)) ? 'Todos os prazos precisam ser maiores que zero.' : undefined
  return (
    <GavetaFormulario
      aberta
      onFechar={onFechar}
      titulo="SLA da empresa"
      descricao="Vai para o contrato (item BPO) e mede os desvios em Entregas e SLA."
      acao="Salvar"
      acaoDesabilitada={!!erro}
      onAcao={() => {
        const regras = Object.fromEntries(Object.keys(slaPadrao).map((k) => [k, Number(r[k as keyof RegrasSla])]))
        const ok = executar(() => repos.bpo.perfis.atualizar(e.perfil.id, { sla: { ...e.perfil.sla, meta }, extras: { ...e.perfil.extras, s08c_sla: regras } }, { texto: `Atualizou o SLA de ${e.nome}` }), { sucesso: 'SLA atualizado' })
        if (ok) onFechar()
      }}
    >
      <Campo rotulo="Meta do mês (% no prazo)" erro={erro?.startsWith('A meta') ? erro : undefined}>
        {(id) => <CampoTexto id={id} tipo="number" valor={r.meta} onMudar={(v) => setR((x) => ({ ...x, meta: v }))} />}
      </Campo>
      <Campo rotulo="Conta capturada em até (horas)">{(id) => <CampoTexto id={id} tipo="number" valor={r.captura_h} onMudar={(v) => setR((x) => ({ ...x, captura_h: v }))} />}</Campo>
      <Campo rotulo="Lote enviado até quantas horas antes do vencimento">{(id) => <CampoTexto id={id} tipo="number" valor={r.lote_antes_h} onMudar={(v) => setR((x) => ({ ...x, lote_antes_h: v }))} />}</Campo>
      <Campo rotulo="Conciliação até o dia útil">{(id) => <CampoTexto id={id} tipo="number" valor={r.conciliacao_dia} onMudar={(v) => setR((x) => ({ ...x, conciliacao_dia: v }))} />}</Campo>
      <Campo rotulo="Relatório até o dia" erro={erro && !erro.startsWith('A meta') ? erro : undefined}>
        {(id) => <CampoTexto id={id} tipo="number" valor={r.relatorio_dia} onMudar={(v) => setR((x) => ({ ...x, relatorio_dia: v }))} />}
      </Campo>
    </GavetaFormulario>
  )
}

/** O que vale para o escritório inteiro: auditoria, WhatsApp, equipe do BPO e integrantes. */
function ParametrosEscritorio() {
  return (
    <>
      <PesosAudit />
      <div className="grid gap-4 lg:grid-cols-2">
        <EquipeBpo />
        <AprovacaoWhatsapp />
      </div>
      <IntegrantesPorFuncao />
    </>
  )
}

/** Pesos do audit score (S08-A38): critérios fixos do sistema; o Gestor do BPO ajusta os pesos e os limiares. */
function PesosAudit() {
  const { config, empresas } = useBpo()
  const executar = useAcao()
  const pode = usePode('bpo.audit_pesos')
  const pesos = { ...pesosPadrao, ...config?.pesos }
  const salvar = (patch: Partial<NonNullable<typeof config>>, texto = 'Ajustou os pesos da auditoria contínua do BPO') => config && executar(() => repos.bpo.configuracao.atualizar(config.id, patch, { texto }))
  const cores = { verde: empresas.filter((e) => e.audit.cor === 'verde').length, amarelo: empresas.filter((e) => e.audit.cor === 'amarelo').length, vermelho: empresas.filter((e) => e.audit.cor === 'vermelho').length }
  const amarelo = config?.limiar_amarelo ?? 3
  const vermelho = config?.limiar_vermelho ?? 8
  return (
    <Caixa>
      <TituloBloco
        descricao={`Critérios fixos do sistema; os pesos são premissa a validar no piloto. Hoje: ${cores.verde} em dia, ${cores.amarelo} atenção, ${cores.vermelho} agir hoje.`}
        acao={
          pode && (
            <Button size="sm" variant="ghost" className="rounded-full" onClick={() => salvar({ pesos: pesosPadrao, limiar_amarelo: 3, limiar_vermelho: 8 }, 'Restaurou os pesos e limiares padrão da auditoria')}>
              <ArrowCounterClockwiseIcon /> Restaurar padrão
            </Button>
          )
        }
      >
        Pesos da auditoria contínua
      </TituloBloco>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <label className="flex items-center gap-2">
          Atenção a partir de
          <input type="number" min={1} max={vermelho - 1} value={amarelo} disabled={!pode} aria-label="Limiar de atenção" onChange={(ev) => Number(ev.target.value) >= 1 && Number(ev.target.value) < vermelho && salvar({ limiar_amarelo: Number(ev.target.value) }, 'Ajustou o limiar de atenção da auditoria')} className="bg-sunken w-16 rounded-md px-2 py-1 tabular-nums" />
          pontos
        </label>
        <label className="flex items-center gap-2">
          Agir hoje a partir de
          <input type="number" min={amarelo + 1} max={60} value={vermelho} disabled={!pode} aria-label="Limiar de agir hoje" onChange={(ev) => Number(ev.target.value) > amarelo && salvar({ limiar_vermelho: Number(ev.target.value) }, 'Ajustou o limiar de agir hoje da auditoria')} className="bg-sunken w-16 rounded-md px-2 py-1 tabular-nums" />
          pontos
        </label>
      </div>
      <ul className="grid gap-x-6 gap-y-2 md:grid-cols-2" aria-label="Pesos da auditoria">
        {Object.entries(criteriosAudit).map(([k, c]) => (
          <li key={k} className="flex items-center gap-3 text-sm">
            <label htmlFor={`peso-${k}`} className="min-w-0 flex-1">
              {c.rotulo}
            </label>
            <input id={`peso-${k}`} type="range" min={0} max={10} step={1} value={pesos[k] ?? 0} disabled={!pode} onChange={(ev) => salvar({ pesos: { ...pesos, [k]: Number(ev.target.value) } })} className="accent-foreground w-24 sm:w-28" />
            <span className="w-6 text-right tabular-nums">{pesos[k] ?? 0}</span>
          </li>
        ))}
      </ul>
      {!pode && <p className="text-muted-foreground text-xs">Só o Gestor do BPO ajusta os pesos.</p>}
      <p className="text-muted-foreground text-xs">Mudar um peso recalcula a cor de todas as empresas na hora (Carteira, Visão geral e cartão do integrante). Recalcula também a cada sincronização do ERP ({quando('2026-11-18')}).</p>
    </Caixa>
  )
}

/** Equipe do BPO (10, 3.8 e 3.9): quem gere e quem executa, e até quanto cada pessoa confere (`pode_conferir_ate`). */
function EquipeBpo() {
  const { contas } = useSessao()
  const { config } = useBpo()
  const pode = usePode('bpo.audit_pesos')
  const executar = useAcao()
  const params = parametrosS08c(config)
  const equipe = contas.filter((u) => u.situacao !== 'desativado' && (u.papel === 'administrador' || u.vinculos.some((v) => v.setor === 'bpo_financeiro')))
  return (
    <Caixa>
      <TituloBloco descricao="A alçada de conferência é da pessoa (por vínculo); vale a menor entre ela e a faixa da conta. Vazio: sem limite próprio.">Equipe do BPO e conferência</TituloBloco>
      {equipe.length === 0 ? (
        <p className="text-muted-foreground text-sm">Ninguém no setor BPO financeiro. Vincule pessoas em Configurações › Usuários.</p>
      ) : (
        <ul className="divide-border/70 flex flex-col divide-y" aria-label="Equipe do BPO">
          {equipe.map((u) => {
            const v = u.vinculos.find((x) => x.setor === 'bpo_financeiro')
            const papel = u.papel === 'administrador' ? 'Administrador' : v?.modo === 'gestao' ? 'Gestor do BPO' : 'Membro'
            const lim = params.conferir_ate[u.id]
            return (
              <li key={u.id} className="flex flex-wrap items-center gap-2 py-2 text-sm">
                <span className="min-w-0 flex-1 basis-40">
                  {u.nome}
                  <span className="text-muted-foreground block text-xs">
                    {papel} · {papel === 'Membro' ? 'digita e confere com outra pessoa' : 'confere, monta e manda o lote'}
                  </span>
                </span>
                <span className="text-muted-foreground text-xs">confere até</span>
                {pode && config ? (
                  <span className="w-32">
                    <EdicaoEmLinha
                      rotulo={`Alçada de conferência de ${u.nome}`}
                      valor={lim ? String(lim) : ''}
                      placeholder="sem limite"
                      validar={(t) => (t.trim() && !(Number(t) > 0) ? 'Valor maior que zero, ou vazio.' : null)}
                      onSalvar={(t) => {
                        const n = Number(t)
                        const conferir_ate = { ...params.conferir_ate }
                        if (t.trim() && n > 0) conferir_ate[u.id] = n
                        else delete conferir_ate[u.id]
                        executar(() => salvarParametrosS08c(config, { conferir_ate }, `Alçada de conferência de ${u.nome}: ${t.trim() ? brl(n) : 'sem limite próprio'}`), { sucesso: 'Alçada de conferência salva' })
                      }}
                    />
                  </span>
                ) : (
                  <span className="tabular-nums">{lim ? brl(lim) : 'sem limite'}</span>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </Caixa>
  )
}

/** Aprovação pelo WhatsApp (04, ad. 19): só abaixo de um teto baixo, com código de uso único. */
function AprovacaoWhatsapp() {
  const { config } = useBpo()
  const pode = usePode('bpo.audit_pesos')
  const executar = useAcao()
  const teto = config?.teto_whatsapp ?? 3_000
  return (
    <Caixa>
      <TituloBloco descricao="O WhatsApp avisa e leva ao app. Aprovar dentro dele só para lote até o teto, com código de seis dígitos que vale uma vez. Acima, abre o app com segundo fator.">Aprovação pelo WhatsApp</TituloBloco>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted-foreground">Teto por lote</span>
        {pode && config ? (
          <span className="w-32">
            <EdicaoEmLinha
              rotulo="Teto do WhatsApp"
              valor={String(teto)}
              validar={(t) => (!(Number(t) >= 0) ? 'Informe um valor (0 desliga a aprovação pelo WhatsApp).' : Number(t) > 10_000 ? 'Teto baixo: até R$ 10.000.' : null)}
              onSalvar={(t) => void executar(() => repos.bpo.configuracao.atualizar(config.id, { teto_whatsapp: Number(t) }, { texto: `Teto da aprovação pelo WhatsApp: ${brl(Number(t))}` }), { sucesso: 'Teto do WhatsApp salvo' })}
            />
          </span>
        ) : (
          <span className="tabular-nums">{brl(teto)}</span>
        )}
      </div>
      <p className="text-muted-foreground text-xs">{teto === 0 ? 'Desligado: todo lote se aprova no app.' : `Lote de até ${brl(teto)} pode ser aprovado respondendo o código. O código expira com o cartão e não serve para outro lote.`}</p>
    </Caixa>
  )
}

/** Integrantes do BPO por função (10, adendo de 8/11; 6.3; 01, 3.3): a lista "faz sozinho" vem cheia e o Administrador só tira. */
function IntegrantesPorFuncao() {
  const { usuario } = useSessao()
  const { config } = useBpo()
  const executar = useAcao()
  const aparencia = useAparencia()
  const admin = usuario.papel === 'administrador'
  const params = parametrosS08c(config)
  const alternar = (integrante: string, acao: string, texto: string, ligar: boolean) => {
    if (!config) return
    const atuais = params.desligadas[integrante] ?? []
    const desligadas = { ...params.desligadas, [integrante]: ligar ? atuais.filter((x) => x !== acao) : [...atuais, acao] }
    executar(() => salvarParametrosS08c(config, { desligadas }, `${ligar ? 'Devolveu' : 'Tirou'} “${texto}” ${ligar ? 'à' : 'da'} lista do que o integrante faz sozinho`), { sucesso: ligar ? 'Volta a fazer sozinho' : 'Agora prepara e uma pessoa conclui' })
  }
  return (
    <Caixa>
      <TituloBloco descricao="Cada integrante faz sozinho o que é reversível, prepara o resto num cartão e nunca faz o que é de pessoa. Pagar e transferir nunca são promovíveis.">Integrantes por função</TituloBloco>
      <div className="grid gap-3 md:grid-cols-2">
        {integrantesBpo.map((ib) => {
          const base = integrantesBase.find((i) => i.id === ib.id)
          const t = base ? aparencia(base) : undefined
          return (
            <section key={ib.id} className="bg-sunken/40 flex flex-col gap-2 rounded-lg p-3" aria-label={`Integrante ${ib.nome}`}>
              <header className="flex items-center gap-2">
                {t && <Orb cor={t.cor} corOlhos={t.corOlhos} estado="disponivel" tamanho={28} cutucavel={false} />}
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{t?.nome ?? ib.nome}</span>
                  <span className="text-muted-foreground block text-xs">{ib.funcao}</span>
                </span>
              </header>
              <ul className="flex flex-col gap-1 text-sm">
                {ib.acoes.map((a) => {
                  const desligada = params.desligadas[ib.id]?.includes(a.id)
                  return (
                    <li key={a.id} className="flex items-start gap-2">
                      {a.classe === 'nunca' ? (
                        <LockSimpleIcon className="text-muted-foreground mt-0.5 size-4 shrink-0" aria-label="nunca" />
                      ) : a.classe === 'S' ? (
                        <input type="checkbox" className="accent-foreground mt-0.5 size-4 shrink-0" checked={!desligada} disabled={!admin || !config} aria-label={`${ib.nome} faz sozinho: ${a.texto}`} onChange={(ev) => alternar(ib.id, a.id, a.texto, ev.target.checked)} />
                      ) : (
                        <span className="bg-muted-foreground/40 mt-1.5 size-2 shrink-0 rounded-full" />
                      )}
                      <span className={cn('min-w-0 flex-1', a.classe === 'nunca' && 'text-muted-foreground')}>
                        {a.texto}
                        <span className="text-muted-foreground block text-xs">
                          {a.classe === 'nunca' ? 'nunca: só uma pessoa' : a.classe === 'P' ? 'prepara; uma pessoa conclui' : desligada ? 'tirado da lista: prepara e uma pessoa conclui' : 'faz sozinho'}
                          {a.codigo && ` · ${a.codigo}`}
                        </span>
                      </span>
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}
      </div>
      {!admin && <p className="text-muted-foreground text-xs">Só o Administrador tira itens da lista do que os integrantes fazem sozinhos.</p>}
    </Caixa>
  )
}

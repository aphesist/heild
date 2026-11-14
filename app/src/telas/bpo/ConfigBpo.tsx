import { ArrowCounterClockwiseIcon, BankIcon, PencilSimpleIcon, PlugsConnectedIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { useSessao } from '@/ambiente/sessao'
import { SePode, useAcao, useConfirmar, usePode } from '@/components/kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Campo, CampoEscolha, CampoTexto, GavetaFormulario } from '@/components/ui/formulario'
import { cn } from '@/lib/utils'
import type { BpoPerfil } from '@/nucleo/modelo/entidades'
import { repos } from '@/nucleo/repositorios'
import { pesosPadrao } from '@/nucleo/semente/s08'
import { SeloTitular } from '../financeiro/pecas'
import { brl, CabecalhoBpo, Caixa, PaginaBpo, Propriedade, SeloAudit, SeloErp, TituloBloco, type PropsBpo } from './comum'
import { criteriosAudit, dataCurta, dataHora, quando, rotuloModoPagamento, useBpo, type EmpresaVista } from './dados'
import { passosEscalonamento } from './AprovacoesBpo'
import { BlocoErp, ConectarGaveta } from './FichaEmpresa'

const explicaModo: Record<BpoPerfil['modo_pagamento'], string> = {
  M1: 'O BPO prepara e o cliente aprova no app; depois ele mesmo libera no banco. O padrão.',
  M2: 'Depois do cartão aprovado, o pagamento é agendado por API do banco no vencimento, até o teto.',
  M3: 'O BPO liberaria no banco até um teto delegado por escrito. Desligado na primeira versão (só com parecer jurídico).',
}

/**
 * BPO › Configuração (S08-T07): por empresa, o ERP e o modo (A33), os bancos
 * por Open Finance (A34), o modo de pagamento (A35), as alçadas (A36) e a
 * janela e o escalonamento (A37); para o escritório, os pesos do audit score
 * (A38). Alçada e modo só valem com o aceite do sócio no app.
 */
export function ConfigBpoTela({ empresa, onEscolher }: PropsBpo) {
  const { empresas } = useBpo()
  if (!empresa)
    return (
      <PaginaBpo>
        <CabecalhoBpo titulo="Configuração" sub="Escolha a empresa: cada uma tem ERP, bancos, alçadas e janela próprios. Os pesos da auditoria valem para todas." />
        <Caixa className="gap-0">
          <ul className="divide-border/70 flex flex-col divide-y" aria-label="Empresas para configurar">
            {empresas.map((e) => (
              <li key={e.clienteId} className="flex flex-wrap items-center gap-3 py-2.5 text-sm">
                <SeloAudit e={e} compacto />
                <button type="button" onClick={() => onEscolher(e.clienteId, 'configuracao')} className="min-w-0 flex-1 cursor-pointer truncate text-left hover:underline">
                  {e.nome}
                </button>
                <SeloErp e={e} />
              </li>
            ))}
          </ul>
        </Caixa>
        <PesosAudit />
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
  const [gaveta, setGaveta] = useState<'erp' | 'banco' | 'alcadas' | 'escalonamento' | null>(null)
  const [modo, setModo] = useState<{ m: BpoPerfil['modo_pagamento']; teto: string } | null>(null)

  const proporModo = async (m: BpoPerfil['modo_pagamento'], teto?: number) => {
    const ok = await confirmar({ titulo: `Propor ${rotuloModoPagamento[m]}?`, descricao: 'O modo de pagamento só vale depois do aceite do sócio no app. Até lá, continua o atual. Quem propõe não confere nem aprova pagamentos desta empresa.', acao: 'Mandar para o aceite' })
    if (ok !== true) return
    executar(() => repos.bpo.alcadas.propor(e.clienteId, { faixa1: e.faixa1, faixa2: e.faixa2, janela: e.alcada?.janela ?? e.perfil.janela.dias, pessoas: e.alcada?.pessoas ?? {}, extras: { modo_pagamento: m, teto_m2: teto ?? null } }), { sucesso: 'Modo proposto: vale com o aceite do sócio no app' })
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
            descricao="A plataforma lê e escreve no ERP que a empresa já usa; o que não tem API entra por arquivo."
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
            descricao="Só leitura (Open Finance ou API do banco); consentimento que vence em 30 dias vira tarefa."
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
                  <span className="min-w-0 flex-1 truncate">
                    {b.nome}
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
                </li>
              )
            })}
          </ul>
        </Caixa>
        <Caixa>
          <TituloBloco descricao="Em todos os modos o cliente aprova antes; a diferença é quem aperta o botão no banco.">Modo de pagamento</TituloBloco>
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
                  className={cn('flex cursor-pointer items-start gap-3 rounded-[14px] px-3 py-2.5 text-left text-sm disabled:cursor-default', m === 'M3' && 'opacity-50', atual ? 'bg-raised shadow-contorno' : 'hover:bg-sunken/60')}
                >
                  <span className={cn('mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border', atual && 'border-foreground')}>{atual && <span className="bg-foreground size-2 rounded-full" />}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block">
                      {rotuloModoPagamento[m]}
                      {m === 'M2' && atual && e.perfil.teto_m2 ? ` · teto ${brl(e.perfil.teto_m2)}` : ''}
                    </span>
                    <span className="text-muted-foreground block text-xs">{explicaModo[m]}</span>
                    {proposto && <Badge variant="destaque" className="mt-1">proposto, aguardando o aceite do sócio</Badge>}
                  </span>
                </button>
              )
            })}
          </div>
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
            Alçadas e janela
          </TituloBloco>
          <dl className="divide-border/70 divide-y">
            <Propriedade rotulo="Faixa 1">{`até ${brl(e.faixa1)}: 1 aprovador; 1 conferência`}</Propriedade>
            <Propriedade rotulo="Faixa 2">{`até ${brl(e.faixa2)}: 1 aprovador com alçada; analista e gestor conferem`}</Propriedade>
            <Propriedade rotulo="Acima">{`de ${brl(e.faixa2)}: aprovação reforçada (2 pessoas)`}</Propriedade>
            <Propriedade rotulo="Janela">{e.alcada?.janela ?? e.perfil.janela.dias}</Propriedade>
            {(e.ficha?.contatos ?? [])
              .filter((c) => c.alcadaPagamento)
              .map((c) => (
                <Propriedade key={c.nome} rotulo={c.nome}>
                  {`aprova até ${brl(Math.min(c.alcadaPagamento ?? 0, e.faixa2))}${(c.alcadaPagamento ?? 0) > e.faixa2 ? ` (a ficha diz ${brl(c.alcadaPagamento ?? 0)}; vale a menor)` : ''}${c.reforcada ? ' · entra na reforçada' : ''}`}
                </Propriedade>
              ))}
          </dl>
          <p className="text-muted-foreground text-xs">Se a alçada da pessoa e a faixa da empresa divergem, vale a menor. Quem altera as alçadas de uma empresa não confere nem aprova pagamento nela.</p>
          {e.proposta && (
            <div className="bg-sunken/60 flex flex-col gap-1 rounded-[14px] px-3 py-2.5 text-sm">
              <span className="font-medium">Proposta aguardando o aceite do sócio no app</span>
              <span className="text-muted-foreground text-xs">
                faixa 1 até {brl(e.proposta.faixa1)} · faixa 2 até {brl(e.proposta.faixa2)} · {e.proposta.janela}
                {e.proposta.extras?.modo_pagamento ? ` · modo ${String(e.proposta.extras.modo_pagamento)}` : ''} · proposta por {e.proposta.proposta_por_nome}
              </span>
              {podeAlcada && (
                <Button size="sm" variant="ghost" className="w-fit rounded-full" onClick={() => executar(() => repos.bpo.alcadas.retirar(e.proposta!.id), { sucesso: 'Proposta de alçadas retirada' })}>
                  Retirar a proposta
                </Button>
              )}
            </div>
          )}
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
          <ol className="grid gap-2 sm:grid-cols-5">
            {passosEscalonamento(e).map((p, i) => (
              <li key={i} className="bg-sunken/50 flex flex-col gap-1 rounded-[14px] p-3 text-sm">
                <span className="text-muted-foreground text-xs">
                  {i + 1}. {p.quando}
                </span>
                {p.texto}
              </li>
            ))}
          </ol>
        </Caixa>
      </div>
      <PesosAudit />

      {gaveta === 'erp' && <ConectarGaveta tipo="erp" perfil={e.perfil} nome={e.nome} onFechar={() => setGaveta(null)} />}
      {gaveta === 'banco' && <ConectarGaveta tipo="banco" perfil={e.perfil} nome={e.nome} onFechar={() => setGaveta(null)} />}
      {gaveta === 'alcadas' && <PropostaAlcadas e={e} onFechar={() => setGaveta(null)} usuario={usuario.nome} />}
      {gaveta === 'escalonamento' && <Escalonamento e={e} onFechar={() => setGaveta(null)} />}
      {modo && (
        <GavetaFormulario aberta onFechar={() => setModo(null)} titulo="M2 · pagamento por API após o cartão" descricao="O cartão aprovado agenda o pagamento no banco, com credencial de escopo só de pagamento e teto por pagamento." acao="Propor ao sócio" acaoDesabilitada={!(Number(modo.teto) > 0)} onAcao={() => void proporModo('M2', Number(modo.teto))}>
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
  const [r, setR] = useState({ f1: String(e.faixa1), f2: String(e.faixa2), janela: e.alcada?.janela ?? e.perfil.janela.dias, pessoas: Object.fromEntries((e.ficha?.contatos ?? []).map((c) => [c.nome, String(c.alcadaPagamento ?? 0)])) as Record<string, string> })
  const erro = !(Number(r.f1) > 0) ? 'A faixa 1 precisa ser maior que zero.' : !(Number(r.f2) > Number(r.f1)) ? 'A faixa 2 precisa ser maior que a faixa 1.' : undefined
  return (
    <GavetaFormulario
      aberta
      onFechar={onFechar}
      titulo="Alçadas de pagamento"
      descricao="Nada muda até o sócio aceitar no app. Quem propõe deixa de conferir e aprovar pagamentos desta empresa."
      acao="Mandar para o aceite"
      acaoDesabilitada={!!erro}
      onAcao={() => {
        const ok = executar(() => repos.bpo.alcadas.propor(e.clienteId, { faixa1: Number(r.f1), faixa2: Number(r.f2), janela: r.janela, pessoas: Object.fromEntries(Object.entries(r.pessoas).map(([k, v]) => [k, Number(v) || 0])) }), { sucesso: `Proposta enviada: vale depois do aceite do sócio no app. ${usuario}, você não confere pagamentos desta empresa.` })
        if (ok) onFechar()
      }}
    >
      <Campo rotulo="Faixa 1 (1 aprovador, 1 conferência), até R$" erro={erro?.includes('faixa 1 precisa ser maior que zero') ? erro : undefined}>
        {(id) => <CampoTexto id={id} tipo="number" valor={r.f1} onMudar={(v) => setR((x) => ({ ...x, f1: v }))} />}
      </Campo>
      <Campo rotulo="Faixa 2 (aprovador com alçada; analista e gestor conferem), até R$" ajuda="Acima disso, duas pessoas aprovam." erro={erro?.includes('faixa 2') ? erro : undefined}>
        {(id) => <CampoTexto id={id} tipo="number" valor={r.f2} onMudar={(v) => setR((x) => ({ ...x, f2: v }))} />}
      </Campo>
      <Campo rotulo="Janela de aprovação">{(id) => <CampoTexto id={id} valor={r.janela} onMudar={(v) => setR((x) => ({ ...x, janela: v }))} />}</Campo>
      {(e.ficha?.contatos ?? []).map((c) => (
        <Campo key={c.nome} rotulo={`${c.nome} (${c.papel}) aprova até R$`} ajuda="0 = não aprova pagamentos">
          {(id) => <CampoTexto id={id} tipo="number" valor={r.pessoas[c.nome] ?? '0'} onMudar={(v) => setR((x) => ({ ...x, pessoas: { ...x.pessoas, [c.nome]: v } }))} />}
        </Campo>
      ))}
    </GavetaFormulario>
  )
}

/** Janela e escalonamento (S08-A37): abertura, prazos e substituto por empresa. */
function Escalonamento({ e, onFechar }: { e: EmpresaVista; onFechar: () => void }) {
  const executar = useAcao()
  const esc = e.perfil.escalonamento
  const contatos = e.ficha?.contatos ?? []
  const [r, setR] = useState({ abertura: e.perfil.janela.abertura, lembrete: String(esc.lembrete_h), substituto_h: String(esc.substituto_h), aprovador: esc.aprovador || contatos[0]?.nome || '', substituto: esc.substituto ?? '' })
  const erro = !(Number(r.lembrete) > 0) || !(Number(r.substituto_h) > Number(r.lembrete)) ? 'O substituto entra depois do lembrete.' : undefined
  return (
    <GavetaFormulario
      aberta
      onFechar={onFechar}
      titulo="Janela e escalonamento"
      descricao="Vale só para esta empresa. O sócio e o Gestor do BPO sempre recebem o alerta da véspera e o do vencido."
      acao="Salvar"
      acaoDesabilitada={!!erro}
      onAcao={() => {
        const ok = executar(() => repos.bpo.perfis.atualizar(e.perfil.id, { janela: { ...e.perfil.janela, abertura: r.abertura }, escalonamento: { ...esc, aprovador: r.aprovador, substituto: r.substituto || null, lembrete_h: Number(r.lembrete), substituto_h: Number(r.substituto_h) } }, { texto: `Atualizou a janela e o escalonamento de ${e.nome}` }), { sucesso: 'Escalonamento do lote atualizado' })
        if (ok) onFechar()
      }}
    >
      <Campo rotulo="Abertura da janela">{(id) => <CampoTexto id={id} tipo="time" valor={r.abertura} onMudar={(v) => setR((x) => ({ ...x, abertura: v }))} />}</Campo>
      <Campo rotulo="Aprovador designado">{(id) => <CampoEscolha id={id} valor={r.aprovador} onMudar={(v) => setR((x) => ({ ...x, aprovador: v }))} opcoes={contatos.map((c) => ({ valor: c.nome, rotulo: `${c.nome} (${c.papel})` }))} />}</Campo>
      <Campo rotulo="Lembrete ao aprovador depois de (horas)">{(id) => <CampoTexto id={id} tipo="number" valor={r.lembrete} onMudar={(v) => setR((x) => ({ ...x, lembrete: v }))} />}</Campo>
      <Campo rotulo="Vai ao substituto depois de (horas)" ajuda="Se passar do expediente, vai na abertura do dia útil seguinte." erro={erro}>
        {(id) => <CampoTexto id={id} tipo="number" valor={r.substituto_h} onMudar={(v) => setR((x) => ({ ...x, substituto_h: v }))} />}
      </Campo>
      <Campo rotulo="Substituto do aprovador" ajuda="Nunca alguém do BPO: o substituto é do cliente (10, Q4).">
        {(id) => <CampoEscolha id={id} valor={r.substituto} onMudar={(v) => setR((x) => ({ ...x, substituto: v }))} opcoes={[{ valor: '', rotulo: 'nenhum (alerta ao Gestor do BPO)' }, ...contatos.filter((c) => c.nome !== r.aprovador).map((c) => ({ valor: c.nome, rotulo: `${c.nome} (${c.papel})` }))]} />}
      </Campo>
    </GavetaFormulario>
  )
}

/** Pesos do audit score (S08-A38): critérios fixos do sistema; o Gestor do BPO ajusta os pesos. */
function PesosAudit() {
  const { config, empresas } = useBpo()
  const executar = useAcao()
  const pode = usePode('bpo.audit_pesos')
  const pesos = { ...pesosPadrao, ...config?.pesos }
  const salvar = (patch: Partial<NonNullable<typeof config>>) => config && executar(() => repos.bpo.configuracao.atualizar(config.id, patch, { texto: 'Ajustou os pesos da auditoria contínua do BPO' }))
  const cores = { verde: empresas.filter((e) => e.audit.cor === 'verde').length, amarelo: empresas.filter((e) => e.audit.cor === 'amarelo').length, vermelho: empresas.filter((e) => e.audit.cor === 'vermelho').length }
  return (
    <Caixa>
      <TituloBloco
        descricao={`Critérios fixos do sistema; os pesos são premissa a validar no piloto. Soma ${config?.limiar_amarelo ?? 3} ou mais: atenção; ${config?.limiar_vermelho ?? 8} ou mais: agir hoje. Hoje: ${cores.verde} em dia, ${cores.amarelo} atenção, ${cores.vermelho} agir hoje.`}
        acao={
          pode && (
            <Button size="sm" variant="ghost" className="rounded-full" onClick={() => salvar({ pesos: pesosPadrao, limiar_amarelo: 3, limiar_vermelho: 8 })}>
              <ArrowCounterClockwiseIcon /> Restaurar padrão
            </Button>
          )
        }
      >
        Pesos da auditoria contínua
      </TituloBloco>
      <ul className="grid gap-x-6 gap-y-2 md:grid-cols-2" aria-label="Pesos da auditoria">
        {Object.entries(criteriosAudit).map(([k, c]) => (
          <li key={k} className="flex items-center gap-3 text-sm">
            <label htmlFor={`peso-${k}`} className="min-w-0 flex-1">
              {c.rotulo}
            </label>
            <input id={`peso-${k}`} type="range" min={0} max={10} step={1} value={pesos[k] ?? 0} disabled={!pode} onChange={(ev) => salvar({ pesos: { ...pesos, [k]: Number(ev.target.value) } })} className="accent-foreground w-28" />
            <span className="w-6 text-right tabular-nums">{pesos[k] ?? 0}</span>
          </li>
        ))}
      </ul>
      {!pode && <p className="text-muted-foreground text-xs">Só o Gestor do BPO ajusta os pesos.</p>}
      <p className="text-muted-foreground text-xs">Mudar um peso recalcula a cor de todas as empresas na hora (Carteira, Visão geral e cartão do integrante). Recalcula também a cada sincronização do ERP ({quando('2026-11-18')}).</p>
    </Caixa>
  )
}

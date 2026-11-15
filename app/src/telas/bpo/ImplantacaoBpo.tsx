import { CaretDownIcon, CheckCircleIcon, CheckIcon, PaperPlaneTiltIcon, SparkleIcon, WarningIcon } from '@phosphor-icons/react'
import { useState, type ReactNode } from 'react'
import { useLoja, useNavegacao } from '@/ambiente/loja'
import { useEfeitosCartao } from '@/ambiente/efeitos'
import { useSessao } from '@/ambiente/sessao'
import { CartaoAprovacao } from '@/components/compostos/cartoes-chat'
import { SeloDemonstracao, useAcao, useConfirmar, usePode } from '@/components/kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Campo, CampoEscolha, CampoTexto, Passos } from '@/components/ui/formulario'
import { cn } from '@/lib/utils'
import { banco } from '@/nucleo/banco'
import type { BpoPerfil } from '@/nucleo/modelo/entidades'
import { agora } from '@/nucleo/repositorios'
import { brl, SeloErp } from './comum'
import { agoraBpo, dataCurta, dataHora, hojeBpo, type EmpresaVista } from './dados'
import { nomeIntegranteS08a, usePedirS08a, useTrabalhandoS08a } from './integrantes-s08a'
import { extrasS08a, gravarS08a, maisDias, prova, type ConviteApp } from './perfil-s08a'

/** Passos da implantação da empresa no BPO (10, 3.3), na ordem do plano. */
export const passosImplantacao: { id: string; rotulo: string; detalhe: string; quem: string }[] = [
  { id: 'contrato', rotulo: 'Contrato', detalhe: 'Item BPO no contrato único, faixa de volume e alçadas assinadas (FIN-001)', quem: 'Gestor e sócio' },
  { id: 'termo', rotulo: 'Termo de dados', detalhe: 'O BPO é operador da empresa (GES-054)', quem: 'sócio, pelo app' },
  { id: 'convite_app', rotulo: 'Convite no app', detalhe: 'Sócio e financeiro com a alçada de pagamento', quem: 'Contas a Pagar prepara; uma pessoa aprova' },
  { id: 'bancos', rotulo: 'Bancos', detalhe: 'Conexão por Open Finance, com o consentimento do cliente (CTB-010)', quem: 'o cliente autoriza no banco' },
  { id: 'erp', rotulo: 'ERP', detalhe: 'Conectar o ERP do cliente (credencial no cofre) ou importar por arquivo; 90 dias de extrato', quem: 'Conciliação traz a carga' },
  { id: 'fornecedores', rotulo: 'Fornecedores', detalhe: 'Recorrentes com dados bancários confirmados por segundo canal', quem: 'uma pessoa confirma' },
  { id: 'paralelo', rotulo: 'Paralelo', detalhe: 'Um mês em paralelo: o BPO prepara, o cliente ainda paga', quem: 'Gerencial compara' },
  { id: 'ativar', rotulo: 'Ativar', detalhe: 'O Gestor ativa o serviço; evento e prova', quem: 'Gestor do BPO' },
]

const faixas = [
  { valor: 'até 150 lançamentos', limite: 150, sugestao: 900 },
  { valor: 'até 300 lançamentos', limite: 300, sugestao: 1_400 },
  { valor: 'até 600 lançamentos', limite: 600, sugestao: 2_300 },
]

/**
 * Implantação da empresa no BPO (S08-A10): os oito passos com a ação de cada
 * um (contrato, termo pelo app, convite preparado pelo integrante e aprovado
 * por uma pessoa, bancos, ERP com a carga de 90 dias, fornecedores
 * confirmados, paralelo com a comparação, ativar). A caixa de cada passo
 * continua valendo para marcar o que foi feito fora da plataforma.
 */
export function ImplantacaoBpo({ e, perfil, nome, onConectar, onAba }: { e?: EmpresaVista; perfil: BpoPerfil; nome: string; onConectar: (tipo: 'erp' | 'banco') => void; onAba: (secao: string) => void }) {
  const loja = useLoja()
  const executar = useAcao()
  const { usuario } = useSessao()
  const pode = usePode('bpo.onboarding', { cliente_id: perfil.cliente_id })
  const x = extrasS08a(perfil)
  const feitos = passosImplantacao.filter((p) => perfil.onboarding[p.id]).length
  const primeiroAberto = passosImplantacao.find((p) => !perfil.onboarding[p.id])?.id ?? null
  const [aberto, setAberto] = useState<string | null>(primeiroAberto)

  /** Marca ou reabre um passo, com quem e quando (a regra do "ativar só depois dos sete" vale aqui). */
  const marcar = (id: string, valor: boolean, extra: { colunas?: Partial<BpoPerfil>; nota?: string; sucesso?: string } = {}) => {
    if (id === 'ativar' && valor && passosImplantacao.slice(0, 7).some((p) => !perfil.onboarding[p.id])) return loja.toastErro('Ative só depois dos sete passos anteriores (o paralelo inclusive).')
    if (id === 'bancos' && valor && !(e?.bancos.length ?? 0)) return onConectar('banco')
    if (id === 'erp' && valor && (!e || e.erp.efetiva === 'desconectada')) return onConectar('erp')
    const rotulo = passosImplantacao.find((p) => p.id === id)?.rotulo
    const colunas: Partial<BpoPerfil> = { onboarding: { ...perfil.onboarding, [id]: valor }, ...(id === 'paralelo' && valor && !perfil.paralelo_ate ? { situacao: 'paralelo', paralelo_ate: maisDias(hojeBpo, 30) } : {}), ...(id === 'ativar' && valor ? { situacao: 'ativo', paralelo_ate: null } : {}), ...extra.colunas }
    const ok = executar(
      () =>
        gravarS08a(
          perfil.id,
          (s) => {
            const passos = { ...s.passos }
            if (valor) passos[id] = { por: usuario.nome, em: agoraBpo(), nota: extra.nota }
            else delete passos[id]
            return { ...s, passos, ...(id === 'ativar' && valor ? { ativado: { por: usuario.nome, em: agoraBpo(), prova: prova(`ativar ${perfil.id}`) } } : {}) }
          },
          colunas,
          { ferramenta: 'bpo.onboarding', texto: `${valor ? 'Concluiu' : 'Reabriu'} o passo “${rotulo}” da implantação de ${nome}${extra.nota ? `: ${extra.nota}` : ''}` },
        ),
      { sucesso: extra.sucesso ?? (id === 'ativar' && valor ? `${nome}: serviço BPO ativado` : undefined) },
    )
    if (ok && valor) setAberto(passosImplantacao.find((p) => p.id !== id && !colunas.onboarding?.[p.id])?.id ?? null)
  }

  return (
    <div className="flex flex-col gap-3">
      <Passos passos={passosImplantacao.map((p) => p.rotulo)} atual={Math.min(feitos, passosImplantacao.length - 1)} />
      <ol className="flex flex-col gap-1.5" aria-label="Passos da implantação">
        {passosImplantacao.map((p, i) => {
          const feito = !!perfil.onboarding[p.id]
          const info = x.passos?.[p.id]
          const abertoAqui = aberto === p.id
          return (
            <li key={p.id} className={cn('rounded-[14px] transition-colors', abertoAqui ? 'bg-sunken/60' : 'hover:bg-raised/50')}>
              <div className="flex items-start gap-2.5 px-2 py-2">
                <input type="checkbox" className="accent-foreground mt-0.5 size-4 shrink-0 cursor-pointer disabled:cursor-default" checked={feito} disabled={!pode} onChange={(ev) => marcar(p.id, ev.target.checked, { nota: ev.target.checked ? 'marcado como feito' : undefined })} aria-label={p.rotulo} />
                <button type="button" className="min-w-0 flex-1 cursor-pointer text-left" onClick={() => setAberto(abertoAqui ? null : p.id)} aria-expanded={abertoAqui} aria-label={`Passo ${i + 1}: ${p.rotulo}`}>
                  <span className={cn('flex items-center gap-2 text-sm', feito && 'text-muted-foreground')}>
                    <span className="text-muted-foreground tabular-nums">{i + 1}.</span>
                    <span className={cn(feito && 'line-through')}>{p.rotulo}</span>
                    {feito && <CheckCircleIcon weight="fill" className="text-success size-4" />}
                  </span>
                  <span className="text-muted-foreground block text-xs">{feito && info ? `${info.por} · ${dataHora(info.em)}${info.nota ? ` · ${info.nota}` : ''}` : `${p.detalhe} · ${p.quem}`}</span>
                </button>
                <CaretDownIcon className={cn('text-muted-foreground mt-1 size-4 shrink-0 transition-transform', abertoAqui && 'rotate-180')} aria-hidden />
              </div>
              {abertoAqui && (
                <div className="flex flex-col gap-2 px-3 pb-3 pl-9 text-sm">
                  {p.id === 'contrato' && <PassoContrato perfil={perfil} feito={feito} pode={pode} onConcluir={(nota, colunas) => marcar('contrato', true, { nota, colunas })} />}
                  {p.id === 'termo' && <PassoTermo e={e} perfil={perfil} nome={nome} feito={feito} pode={pode} onConcluir={(nota, colunas) => marcar('termo', true, { nota, colunas, sucesso: 'Termo aceito: passo concluído' })} />}
                  {p.id === 'convite_app' && <PassoConvite e={e} perfil={perfil} nome={nome} feito={feito} pode={pode} onConcluir={(nota) => marcar('convite_app', true, { nota, sucesso: 'Primeiro acesso feito: passo concluído' })} />}
                  {p.id === 'bancos' && (
                    <div className="flex flex-col gap-2">
                      {e?.bancos.length ? (
                        <ul className="text-muted-foreground flex flex-col gap-0.5 text-xs">
                          {e.bancos.map((b) => (
                            <li key={b.id}>
                              {b.nome} · {b.via === 'open_finance' ? 'Open Finance' : b.via} {b.consentimento_ate ? `· consentimento até ${dataCurta(b.consentimento_ate)}` : ''}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted-foreground text-xs">Nenhuma conta conectada. O cliente autoriza no banco dele; só leitura de extrato e saldo. Senha de internet banking nunca é guardada.</p>
                      )}
                      {pode && (
                        <Button size="sm" variant="outline" className="w-fit rounded-full" onClick={() => onConectar('banco')}>
                          Conectar banco por Open Finance
                        </Button>
                      )}
                    </div>
                  )}
                  {p.id === 'erp' && <PassoErp e={e} perfil={perfil} nome={nome} pode={pode} onConectar={() => onConectar('erp')} />}
                  {p.id === 'fornecedores' && <PassoFornecedores e={e} nome={nome} feito={feito} pode={pode} onAba={onAba} onConcluir={(nota) => marcar('fornecedores', true, { nota })} />}
                  {p.id === 'paralelo' && <PassoParalelo e={e} perfil={perfil} nome={nome} feito={feito} pode={pode} onConcluir={(nota) => marcar('paralelo', true, { nota })} />}
                  {p.id === 'ativar' && <PassoAtivar perfil={perfil} nome={nome} feito={feito} pode={pode} onAtivar={() => marcar('ativar', true, { nota: 'sete passos conferidos' })} />}
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function Feito({ children }: { children: ReactNode }) {
  return (
    <p className="text-muted-foreground flex items-start gap-1.5 text-xs">
      <CheckIcon className="text-success mt-0.5 size-3.5 shrink-0" /> <span>{children}</span>
    </p>
  )
}

/* ---------- 1. Contrato ---------- */

function PassoContrato({ perfil, feito, pode, onConcluir }: { perfil: BpoPerfil; feito: boolean; pode: boolean; onConcluir: (nota: string, colunas: Partial<BpoPerfil>) => void }) {
  const nav = useNavegacao()
  const { usuario } = useSessao()
  const x = extrasS08a(perfil)
  const [r, setR] = useState({ faixa: x.contrato?.faixa ?? faixas[1].valor, mensalidade: String(x.contrato?.mensalidade ?? (perfil.honorario || faixas[1].sugestao)), assinadas: x.contrato?.alcadas_assinadas ?? false })
  const erro = !(Number(r.mensalidade) > 0) ? 'Informe a mensalidade.' : undefined
  if (feito && x.contrato) return <Feito>{`Item BPO no contrato: ${x.contrato.faixa}, ${brl(x.contrato.mensalidade)} por mês${x.contrato.alcadas_assinadas ? ', alçadas assinadas' : ''}.`}</Feito>
  if (!pode) return <p className="text-muted-foreground text-xs">O Gestor do BPO grava o item no contrato com o sócio.</p>
  return (
    <div className="flex flex-col gap-2">
      <div className="grid gap-2 sm:grid-cols-2">
        <Campo rotulo="Faixa de volume">
          {(id) => (
            <CampoEscolha
              id={id}
              valor={r.faixa}
              onMudar={(v) => setR((s) => ({ ...s, faixa: v, mensalidade: String(faixas.find((f) => f.valor === v)?.sugestao ?? s.mensalidade) }))}
              opcoes={faixas.map((f) => ({ valor: f.valor, rotulo: f.valor }))}
            />
          )}
        </Campo>
        <Campo rotulo="Mensalidade do BPO (R$)" erro={erro}>
          {(id) => <CampoTexto id={id} tipo="number" valor={r.mensalidade} onMudar={(v) => setR((s) => ({ ...s, mensalidade: v }))} />}
        </Campo>
      </div>
      <label className="flex cursor-pointer items-center gap-2 text-xs">
        <input type="checkbox" className="accent-foreground size-4" checked={r.assinadas} onChange={(ev) => setR((s) => ({ ...s, assinadas: ev.target.checked }))} /> Alçadas anexas ao contrato e assinadas pelo sócio
      </label>
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          className="rounded-full"
          disabled={!!erro}
          onClick={() => {
            const f = faixas.find((v) => v.valor === r.faixa) ?? faixas[1]
            const mensalidade = Number(r.mensalidade)
            gravarS08a(perfil.id, (s) => ({ ...s, contrato: { faixa: r.faixa, mensalidade, alcadas_assinadas: r.assinadas, por: usuario.nome, em: agoraBpo() } }), {}, { ferramenta: 'bpo.onboarding', texto: `Item BPO gravado no contrato (${r.faixa}, ${brl(mensalidade)})` })
            onConcluir(`${r.faixa}, ${brl(mensalidade)}`, { honorario: mensalidade, volume: { ...perfil.volume, faixa: r.faixa, limite: f.limite } })
          }}
        >
          Gravar o item no contrato
        </Button>
        <Button size="sm" variant="ghost" className="rounded-full" onClick={() => nav.irPara({ modulo: 'financeiro', aba: 'contratos' })}>
          Ver em Financeiro › Contratos
        </Button>
      </div>
    </div>
  )
}

/* ---------- 2. Termo de dados ---------- */

function PassoTermo({ e, perfil, nome, feito, pode, onConcluir }: { e?: EmpresaVista; perfil: BpoPerfil; nome: string; feito: boolean; pode: boolean; onConcluir: (nota: string, colunas: Partial<BpoPerfil>) => void }) {
  const executar = useAcao()
  const loja = useLoja()
  const { usuario } = useSessao()
  const x = extrasS08a(perfil)
  const socio = e?.ficha?.contatos.find((c) => /sócio|socio/i.test(c.papel)) ?? e?.ficha?.contatos[0]
  if (feito) return <Feito>{x.termo?.aceito_por ? `Aceito por ${x.termo.aceito_por} pelo app, ${dataHora(x.termo.aceito_em)}.` : 'Termo de tratamento de dados registrado.'}</Feito>
  if (!x.termo)
    return (
      <div className="flex flex-col gap-2">
        <p className="text-muted-foreground text-xs">O termo diz que o escritório é operador dos dados da empresa (LGPD). Vai ao app {socio ? `de ${socio.nome}` : 'do sócio'} para aceite; fica guardado com o evento.</p>
        {pode && (
          <Button
            size="sm"
            className="w-fit rounded-full"
            onClick={() =>
              executar(() => gravarS08a(perfil.id, (s) => ({ ...s, termo: { situacao: 'enviado', enviado_em: agoraBpo(), enviado_por: usuario.nome } }), {}, { ferramenta: 'bpo.onboarding', texto: `Termo de dados enviado ao app de ${nome}` }), { sucesso: `Termo enviado ao app${socio ? ` de ${socio.nome}` : ''}` })
            }
          >
            <PaperPlaneTiltIcon /> Enviar o termo pelo app
          </Button>
        )}
      </div>
    )
  return (
    <div className="flex flex-col gap-2">
      <p className="text-muted-foreground text-xs">
        Enviado por {x.termo.enviado_por} {dataHora(x.termo.enviado_em)}. Aguardando o aceite {socio ? `de ${socio.nome}` : 'do sócio'} no app.
      </p>
      {pode && (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="rounded-full"
            onClick={() => {
              const quem = socio?.nome ?? 'sócio'
              gravarS08a(perfil.id, (s) => ({ ...s, termo: { ...s.termo!, situacao: 'aceito', aceito_por: quem, aceito_em: agoraBpo() } }), {}, { ferramenta: 'bpo.onboarding', texto: `${quem} aceitou o termo de dados no app` })
              loja.registrar(quem, `Aceitou o termo de tratamento de dados do BPO (${nome})`)
              onConcluir(`aceito por ${quem}`, { termo_aceito_em: hojeBpo })
            }}
          >
            Simular o aceite no app
          </Button>
          <SeloDemonstracao fonte="app do cliente (aceite simulado)" />
        </div>
      )}
    </div>
  )
}

/* ---------- 3. Convite no app ---------- */

function PassoConvite({ e, perfil, nome, feito, pode, onConcluir }: { e?: EmpresaVista; perfil: BpoPerfil; nome: string; feito: boolean; pode: boolean; onConcluir: (nota: string) => void }) {
  const pedir = usePedirS08a()
  const decidir = useEfeitosCartao()
  const loja = useLoja()
  const x = extrasS08a(perfil)
  const trabalhando = useTrabalhandoS08a('preparar_convite', perfil.cliente_id)
  const contatos = e?.ficha?.contatos ?? []
  const [escolhidos, setEscolhidos] = useState<string[]>(() => contatos.filter((c) => (c.alcadaPagamento ?? 0) > 0).map((c) => c.nome))
  const [novo, setNovo] = useState({ nome: '', papel: 'Sócio', alcada: '20000' })
  const [extras, setExtras] = useState<ConviteApp[]>([])
  const convites = x.convites ?? []
  const enviados = convites.filter((c) => c.situacao === 'enviado' || c.situacao === 'aceito')
  const cartao = x.cartao_convite
  const decidido = cartao ? loja.estado.decisoes[cartao] : undefined

  if (feito) return <Feito>{enviados.length ? `No app: ${enviados.map((c) => `${c.nome} (${c.papel}, até ${brl(c.alcada)})`).join(', ')}.` : 'Convite do app registrado.'}</Feito>

  const lista: ConviteApp[] = [...contatos.filter((c) => escolhidos.includes(c.nome)).map((c) => ({ nome: c.nome, papel: c.papel, alcada: c.alcadaPagamento ?? 0, reforcada: c.reforcada, situacao: 'preparado' as const })), ...extras]

  return (
    <div className="flex flex-col gap-2">
      {enviados.length > 0 ? (
        <>
          <ul className="flex flex-col gap-1 text-xs">
            {enviados.map((c) => (
              <li key={c.nome} className="flex items-center gap-2">
                <span className="flex-1">
                  {c.nome} · {c.papel} · aprova até {brl(c.alcada)}
                </span>
                <Badge variant={c.situacao === 'aceito' ? 'sucesso' : 'outline'}>{c.situacao === 'aceito' ? 'entrou no app' : 'convite enviado'}</Badge>
              </li>
            ))}
          </ul>
          {pode && (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="rounded-full"
                onClick={() => {
                  gravarS08a(perfil.id, (s) => ({ ...s, convites: (s.convites ?? []).map((c) => (c.situacao === 'enviado' ? { ...c, situacao: 'aceito' as const, aceito_em: agoraBpo() } : c)) }), {}, { ferramenta: 'bpo.onboarding', texto: `${enviados.map((c) => c.nome).join(' e ')} entraram no app de ${nome}` })
                  onConcluir(`${enviados.length} pessoa${enviados.length > 1 ? 's' : ''} no app`)
                }}
              >
                Simular o primeiro acesso
              </Button>
              <SeloDemonstracao fonte="app do cliente (acesso simulado)" />
            </div>
          )}
        </>
      ) : cartao && !decidido ? (
        <>
          <p className="text-muted-foreground text-xs">Contas a Pagar preparou o convite. Nada sai ao cliente sem a sua aprovação; o cartão é o mesmo do chat e do sino.</p>
          <CartaoAprovacao
            semEditar
            cartao={{ tipo: 'aprovacao', id: cartao, resumo: `Enviar o convite do app às pessoas de ${nome}`, argumentos: convites.map((c) => ({ rotulo: c.nome, valor: `${c.papel} · aprova até ${brl(c.alcada)}${c.reforcada ? ' · reforçada' : ''}` })), expiraEm: 'expira em 2 dias' }}
            onDecidir={(d) => decidir(cartao, d)}
          />
        </>
      ) : trabalhando ? (
        <p className="text-muted-foreground flex items-center gap-2 text-xs">
          <SparkleIcon className="size-4" /> Contas a Pagar está preparando o convite…
        </p>
      ) : (
        <>
          <p className="text-muted-foreground text-xs">Quem entra no app com alçada de pagamento (vem da ficha do cliente). O integrante prepara a mensagem; uma pessoa aprova antes de sair.</p>
          {contatos.length > 0 && (
            <ul className="flex flex-col gap-1" aria-label="Pessoas do cliente para o convite">
              {contatos.map((c) => (
                <li key={c.nome}>
                  <label className="flex cursor-pointer items-center gap-2 text-xs">
                    <input type="checkbox" className="accent-foreground size-4" checked={escolhidos.includes(c.nome)} onChange={(ev) => setEscolhidos((v) => (ev.target.checked ? [...v, c.nome] : v.filter((n) => n !== c.nome)))} aria-label={`Convidar ${c.nome}`} />
                    <span className="flex-1">
                      {c.nome} · {c.papel}
                    </span>
                    <span className="text-muted-foreground">{c.alcadaPagamento ? `até ${brl(c.alcadaPagamento)}` : 'sem alçada'}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
          {extras.map((c) => (
            <p key={c.nome} className="text-xs">
              {c.nome} · {c.papel} · até {brl(c.alcada)}
            </p>
          ))}
          {pode && (
            <div className="grid grid-cols-[minmax(0,1fr)_7rem_7rem_auto] items-end gap-2">
              <Campo rotulo="Nome">{(id) => <CampoTexto id={id} valor={novo.nome} onMudar={(v) => setNovo((s) => ({ ...s, nome: v }))} />}</Campo>
              <Campo rotulo="Papel">{(id) => <CampoEscolha id={id} valor={novo.papel} onMudar={(v) => setNovo((s) => ({ ...s, papel: v }))} opcoes={['Sócio', 'Financeiro'].map((v) => ({ valor: v, rotulo: v }))} />}</Campo>
              <Campo rotulo="Alçada (R$)">{(id) => <CampoTexto id={id} tipo="number" valor={novo.alcada} onMudar={(v) => setNovo((s) => ({ ...s, alcada: v }))} />}</Campo>
              <Button
                size="sm"
                variant="outline"
                className="mb-0.5 rounded-full"
                disabled={!novo.nome.trim()}
                onClick={() => {
                  setExtras((v) => [...v, { nome: novo.nome.trim(), papel: novo.papel, alcada: Number(novo.alcada) || 0, situacao: 'preparado' }])
                  setNovo({ nome: '', papel: 'Financeiro', alcada: '3000' })
                }}
              >
                Incluir
              </Button>
            </div>
          )}
          {pode && (
            <Button
              size="sm"
              className="w-fit rounded-full"
              disabled={lista.length === 0}
              onClick={() => {
                const cartaoId = `s08a-convite-${perfil.id}-${Date.now().toString(36)}`
                pedir({
                  integrante: 'i-bpo',
                  titulo: `Preparar o convite do app de ${nome}`,
                  cliente: nome,
                  inicio: `Vou preparar o convite do app para ${lista.map((c) => c.nome).join(' e ')}, com a alçada de cada um. Nada sai sem aprovação.`,
                  etapas: ['Conferindo as pessoas e as alçadas na ficha', 'Escrevendo a mensagem do convite (com o segundo fator)', 'Deixando o cartão para aprovar'],
                  fim: {
                    texto: `Convite pronto para ${lista.map((c) => `${c.nome} (aprova até ${brl(c.alcada)})`).join(' e ')}. Deixei o cartão: só sai quando uma pessoa aprovar.`,
                    cartoes: [{ tipo: 'aprovacao', id: cartaoId, resumo: `Enviar o convite do app às pessoas de ${nome}`, argumentos: lista.map((c) => ({ rotulo: c.nome, valor: `${c.papel} · aprova até ${brl(c.alcada)}` })), expiraEm: 'expira em 2 dias' }],
                    aviso: `Convite do app de ${nome} pede aprovação`,
                  },
                  efeito: { tipo: 'preparar_convite', perfilId: perfil.id, clienteId: perfil.cliente_id, convites: lista, cartaoId },
                })
              }}
            >
              <SparkleIcon /> Pedir ao {nomeIntegranteS08a['i-bpo']} para preparar
            </Button>
          )}
          {convites.some((c) => c.situacao === 'recusado') && <p className="text-muted-foreground text-xs">O último convite foi recusado; nada saiu.</p>}
        </>
      )}
    </div>
  )
}

/* ---------- 5. ERP ---------- */

function PassoErp({ e, perfil, nome, pode, onConectar }: { e?: EmpresaVista; perfil: BpoPerfil; nome: string; pode: boolean; onConectar: () => void }) {
  const pedir = usePedirS08a()
  const x = extrasS08a(perfil)
  const trabalhando = useTrabalhandoS08a('carga_inicial', perfil.cliente_id)
  const conectado = e && e.erp.efetiva !== 'desconectada'
  return (
    <div className="flex flex-col gap-2">
      {conectado ? <SeloErp e={e} /> : <p className="text-muted-foreground text-xs">Conta Azul, Omie e Bling por API; Nibo e Granatum por arquivo; sem ERP, livro próprio com plano de contas gerencial.</p>}
      {x.carga && <Feito>{`Carga inicial: ${x.carga.extrato_dias} dias de extrato e ${x.carga.contas} contas em aberto no espelho (${x.carga.por}, ${dataHora(x.carga.em)}).`}</Feito>}
      {pode && (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant={conectado ? 'ghost' : 'outline'} className="rounded-full" onClick={onConectar}>
            {conectado ? 'Trocar o ERP' : 'Conectar o ERP do cliente'}
          </Button>
          {conectado && !x.carga && e.erp.modo !== 'E3' && (
            <Button
              size="sm"
              variant="outline"
              className="rounded-full"
              disabled={trabalhando}
              onClick={() =>
                pedir({
                  integrante: 'i-bpo-conciliacao',
                  titulo: `Carga inicial do ${e.erp.provedor} de ${nome}`,
                  cliente: nome,
                  inicio: `Vou trazer 90 dias de extrato e as contas em aberto do ${e.erp.provedor} para o espelho. Só leitura: nada muda no ERP.`,
                  etapas: ['Lendo 90 dias de extrato dos bancos conectados', `Trazendo as contas em aberto do ${e.erp.provedor}`, 'Conferindo o espelho contra o ERP'],
                  fim: { texto: `Espelho pronto: 90 dias de extrato e as contas em aberto do ${e.erp.provedor}. Se o ERP divergir, vale o ERP e a divergência vira pendência.`, aviso: `Carga inicial do ${e.erp.provedor} de ${nome} pronta` },
                  efeito: { tipo: 'carga_inicial', perfilId: perfil.id, clienteId: perfil.cliente_id },
                })
              }
            >
              <SparkleIcon /> {trabalhando ? 'Conciliação trazendo a carga…' : 'Pedir à Conciliação a carga de 90 dias'}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

/* ---------- 6. Fornecedores ---------- */

function PassoFornecedores({ e, nome, feito, pode, onAba, onConcluir }: { e?: EmpresaVista; nome: string; feito: boolean; pode: boolean; onAba: (s: string) => void; onConcluir: (nota: string) => void }) {
  const pedir = usePedirS08a()
  const trabalhando = useTrabalhandoS08a('listar_fornecedores', e?.clienteId)
  const fs = e?.fornecedores ?? []
  const pendentes = fs.filter((f) => !f.dados_bancarios_confirmados_em)
  if (feito) return <Feito>{`${fs.length} fornecedor${fs.length === 1 ? '' : 'es'} com dados bancários confirmados por segundo canal.`}</Feito>
  return (
    <div className="flex flex-col gap-2">
      <p className="text-muted-foreground text-xs">
        {fs.length === 0 ? 'Nenhum fornecedor ainda.' : `${fs.length} fornecedor${fs.length === 1 ? '' : 'es'}; ${pendentes.length ? `${pendentes.length} a confirmar por segundo canal` : 'todos confirmados'}.`} O integrante lista; quem confirma dado bancário é uma pessoa (troca de conta é a fraude mais comum).
      </p>
      <div className="flex flex-wrap gap-2">
        {e && e.erp.efetiva !== 'desconectada' && (
          <Button
            size="sm"
            variant="outline"
            className="rounded-full"
            disabled={trabalhando}
            onClick={() =>
              pedir({
                integrante: 'i-bpo',
                titulo: `Listar os fornecedores recorrentes de ${nome}`,
                cliente: nome,
                inicio: `Vou ler o espelho do ${e.erp.provedor} e listar quem ${nome} paga todo mês. Os dados bancários ficam “a confirmar”: quem confirma é uma pessoa.`,
                etapas: ['Lendo os pagamentos dos últimos 90 dias', 'Agrupando por favorecido recorrente', 'Deixando cada um para confirmar por segundo canal'],
                fim: { texto: 'Listei os recorrentes. Cada um está “a confirmar”: liguem num telefone conhecido ou confirmem pelo e-mail do cadastro antes do primeiro lote.', aviso: `Fornecedores de ${nome} para confirmar` },
                efeito: { tipo: 'listar_fornecedores', clienteId: e.clienteId },
              })
            }
          >
            <SparkleIcon /> {trabalhando ? 'Contas a Pagar listando…' : 'Pedir ao Contas a Pagar a lista do ERP'}
          </Button>
        )}
        <Button size="sm" variant="ghost" className="rounded-full" onClick={() => onAba('fornecedores')}>
          Confirmar na lista de fornecedores
        </Button>
        {pode && (
          <Button size="sm" className="rounded-full" disabled={fs.length === 0 || pendentes.length > 0} onClick={() => onConcluir(`${fs.length} confirmados`)} title={pendentes.length ? 'Confirme todos antes' : undefined}>
            Concluir o passo
          </Button>
        )}
      </div>
    </div>
  )
}

/* ---------- 7. Paralelo ---------- */

function PassoParalelo({ e, perfil, nome, feito, pode, onConcluir }: { e?: EmpresaVista; perfil: BpoPerfil; nome: string; feito: boolean; pode: boolean; onConcluir: (nota: string) => void }) {
  const executar = useAcao()
  const pedir = usePedirS08a()
  const { usuario } = useSessao()
  const x = extrasS08a(perfil)
  const trabalhando = useTrabalhandoS08a('comparar_paralelo', perfil.cliente_id)
  const c = x.paralelo?.comparacao
  if (feito) return <Feito>{c ? `Paralelo revisado por ${x.paralelo?.revisada_por ?? 'Gestor'}: ${c.iguais} de ${c.preparadas} iguais.` : 'Mês em paralelo concluído.'}</Feito>
  if (perfil.situacao !== 'paralelo')
    return (
      <div className="flex flex-col gap-2">
        <p className="text-muted-foreground text-xs">Durante um mês o BPO prepara tudo (contas, lotes, conciliação) e o cliente ainda paga sozinho; no fim, o Gerencial compara.</p>
        {pode && (
          <Button size="sm" className="w-fit rounded-full" onClick={() => executar(() => gravarS08a(perfil.id, (s) => ({ ...s, paralelo: { inicio: agoraBpo() } }), { situacao: 'paralelo', paralelo_ate: maisDias(hojeBpo, 30) }, { ferramenta: 'bpo.onboarding', texto: `Começou o mês em paralelo de ${nome} (até ${dataCurta(maisDias(hojeBpo, 30))})` }), { sucesso: `Paralelo até ${dataCurta(maisDias(hojeBpo, 30))}` })}>
            Começar o mês em paralelo
          </Button>
        )}
      </div>
    )
  return (
    <div className="flex flex-col gap-2">
      <p className="text-muted-foreground text-xs">Em paralelo até {dataCurta(perfil.paralelo_ate)}: o BPO prepara, o cliente ainda paga.</p>
      {c ? (
        <div className="bg-raised/60 flex flex-col gap-1.5 rounded-[12px] p-3 text-xs">
          <span className="text-sm">
            {c.iguais} de {c.preparadas} iguais · o cliente pagou {c.pagas_pelo_cliente}
          </span>
          {c.divergencias.map((d) => (
            <span key={d} className="flex items-start gap-1.5">
              <WarningIcon className="text-warning mt-0.5 size-3.5 shrink-0" weight="fill" /> {d}
            </span>
          ))}
          <span className="text-muted-foreground">
            {c.por} · {dataHora(c.em)}
          </span>
        </div>
      ) : (
        <Button
          size="sm"
          variant="outline"
          className="w-fit rounded-full"
          disabled={trabalhando || !e}
          onClick={() =>
            pedir({
              integrante: 'i-bpo-gerencial',
              titulo: `Comparar o mês em paralelo de ${nome}`,
              cliente: nome,
              inicio: 'Vou comparar o que o BPO preparou com o que o cliente pagou no mês em paralelo.',
              etapas: ['Lendo os lotes que o BPO preparou', 'Lendo os pagamentos no extrato', 'Separando o que bate do que diverge'],
              fim: { texto: 'Comparação pronta. Quase tudo bate; deixei as divergências para a revisão do Gestor antes de ativar.', aviso: `Comparação do paralelo de ${nome} pronta` },
              efeito: { tipo: 'comparar_paralelo', perfilId: perfil.id, clienteId: perfil.cliente_id },
            })
          }
        >
          <SparkleIcon /> {trabalhando ? 'Gerencial comparando…' : 'Pedir ao Gerencial a comparação'}
        </Button>
      )}
      {pode && c && (
        <Button
          size="sm"
          className="w-fit rounded-full"
          onClick={() => {
            gravarS08a(perfil.id, (s) => ({ ...s, paralelo: { ...s.paralelo!, revisada_por: usuario.nome, revisada_em: agoraBpo() } }), {}, { ferramenta: 'bpo.onboarding', texto: `${usuario.nome} revisou a comparação do paralelo de ${nome}` })
            onConcluir(`${c.iguais} de ${c.preparadas} iguais, revisado`)
          }}
        >
          Revisei a comparação
        </Button>
      )}
    </div>
  )
}

/* ---------- 8. Ativar ---------- */

function PassoAtivar({ perfil, nome, feito, pode, onAtivar }: { perfil: BpoPerfil; nome: string; feito: boolean; pode: boolean; onAtivar: () => void }) {
  const confirmar = useConfirmar()
  const x = extrasS08a(perfil)
  const faltam = passosImplantacao.slice(0, 7).filter((p) => !perfil.onboarding[p.id])
  if (feito) return <Feito>{x.ativado ? `Ativado por ${x.ativado.por}, ${dataHora(x.ativado.em)} · prova ${x.ativado.prova}` : 'Serviço ativo.'}</Feito>
  return (
    <div className="flex flex-col gap-2">
      <p className="text-muted-foreground text-xs">{faltam.length ? `Faltam: ${faltam.map((p) => p.rotulo.toLowerCase()).join(', ')}.` : 'Os sete passos estão feitos. Ativar fecha o paralelo e começa o SLA do contrato.'}</p>
      {pode && (
        <Button
          size="sm"
          className="w-fit rounded-full"
          disabled={faltam.length > 0}
          onClick={async () => {
            const r = await confirmar({ titulo: `Ativar o BPO de ${nome}?`, descricao: 'A partir de agora o BPO prepara e o cliente aprova no app; o SLA do contrato começa a contar. Fica o evento com a prova.', acao: 'Ativar o serviço' })
            if (r) onAtivar()
          }}
        >
          Ativar o serviço
        </Button>
      )}
    </div>
  )
}

/* ---------- Encerramento (S08-A11; 10, 3.14) ---------- */

export const passosSaida: { id: string; rotulo: string; detalhe: string }[] = [
  { id: 'mes', rotulo: 'Concluir o mês (conciliação e relatório)', detalhe: 'O relatório do mês sai antes da saída' },
  { id: 'pacote', rotulo: 'Pacote de saída com manifesto entregue ao cliente', detalhe: 'Espelho, lotes, comprovantes e trilha, com manifesto' },
  { id: 'revogar', rotulo: 'Revogar as conexões (banco e ERP) em um passo', detalhe: 'Open Finance, API do banco e credencial do ERP' },
  { id: 'espelho', rotulo: 'Apagar o espelho do ERP e guardar a prova de exclusão', detalhe: 'CIC-003, SOC-024' },
  { id: 'servico', rotulo: 'Encerrar o serviço BPO (a contabilidade, se houver, continua)', detalhe: 'O cadastro continua; o serviço sai do cliente' },
]

/**
 * Encerramento do BPO da empresa (offboarding, 10, 3.14): cinco passos com a
 * ação de cada um, aviso prévio do contrato, "desistir" (volta ao ativo, com
 * motivo; nada se apaga) e concluir.
 */
export function SaidaBpo({ e, perfil, nome, onConcluir }: { e?: EmpresaVista; perfil: BpoPerfil; nome: string; onConcluir: () => void }) {
  const executar = useAcao()
  const confirmar = useConfirmar()
  const { usuario } = useSessao()
  const pode = usePode('bpo.encerrar', { cliente_id: perfil.cliente_id })
  const enc = perfil.encerramento!
  const x = extrasS08a(perfil)
  const s = x.saida ?? {}
  const relatorio = e?.entregas.find((d) => d.tipo === 'relatorio' && d.competencia === '2026-11')
  const marcar = (id: string, v: boolean, extra?: (sd: NonNullable<typeof x.saida>) => NonNullable<typeof x.saida>, texto?: string) =>
    executar(() => gravarS08a(perfil.id, (xx) => ({ ...xx, saida: extra ? extra(xx.saida ?? {}) : xx.saida }), { encerramento: { ...enc, passos: { ...enc.passos, [id]: v } } }, { ferramenta: 'bpo.encerrar', texto: texto ?? `${passosSaida.find((p) => p.id === id)?.rotulo}: ${v ? 'feito' : 'reaberto'}` }))

  const revogar = async () => {
    const r = await confirmar({ titulo: `Revogar as conexões de ${nome}?`, descricao: `Corta de uma vez: ${[...(e?.bancos ?? []).map((b) => b.nome), e && e.erp.efetiva !== 'desconectada' ? `${e.erp.provedor} (ERP)` : null].filter(Boolean).join(', ') || 'nenhuma conexão ativa'}. O cliente continua com os bancos e o ERP dele; o escritório perde o acesso.`, acao: 'Revogar tudo', perigo: true })
    if (!r) return
    const conexoes = [...(e?.bancos ?? []).map((b) => b.nome), ...(e && e.erp.efetiva !== 'desconectada' ? [e.erp.provedor] : [])]
    executar(() => {
      banco.transacao((tx) => {
        for (const b of banco.ler('bpo_conta_bancaria').filter((v) => v.cliente_id === perfil.cliente_id && !v.arquivado_em)) tx.gravar('bpo_conta_bancaria', { ...b, arquivado_em: agora(), atualizado_em: agora() })
        const c = banco.ler('bpo_conexao_erp').find((v) => v.cliente_id === perfil.cliente_id)
        if (c) tx.gravar('bpo_conexao_erp', { ...c, situacao: 'desconectada', escopo: 'revogada no encerramento', atualizado_em: agora() })
      })
      return gravarS08a(perfil.id, (xx) => ({ ...xx, saida: { ...xx.saida, revogado: { por: usuario.nome, em: agoraBpo(), conexoes } } }), { encerramento: { ...enc, passos: { ...enc.passos, revogar: true } } }, { ferramenta: 'bpo.encerrar', texto: `Revogou as conexões de ${nome} em um passo: ${conexoes.join(', ') || 'nenhuma ativa'}` })
    }, { sucesso: 'Conexões revogadas' })
  }

  const desistir = async () => {
    const motivo = await confirmar({ titulo: `Desistir do encerramento de ${nome}?`, descricao: 'O serviço volta ao ativo. O pedido e a desistência ficam no histórico.', acao: 'Desistir do encerramento', exigirMotivo: true, rotuloMotivo: 'Motivo' })
    if (typeof motivo !== 'string') return
    executar(() => gravarS08a(perfil.id, (xx) => ({ ...xx, saida: { ...xx.saida, desistencias: [...(xx.saida?.desistencias ?? []), { por: usuario.nome, em: agoraBpo(), motivo }] } }), { situacao: 'ativo', encerramento: null }, { ferramenta: 'bpo.encerrar', texto: `Desistiu do encerramento do BPO de ${nome}: ${motivo}` }), { sucesso: 'Encerramento desfeito: o serviço continua ativo' })
  }

  const feitos = passosSaida.filter((p) => enc.passos[p.id]).length
  return (
    <div className="flex flex-col gap-2">
      <p className="text-muted-foreground text-xs">
        Pedido em {dataHora(enc.pedido_em)} · motivo: {enc.motivo} · aviso prévio até {dataCurta(s.aviso_ate ?? maisDias(enc.pedido_em.slice(0, 10), 30))} · {feitos} de {passosSaida.length}
      </p>
      <ol className="flex flex-col gap-1" aria-label="Passos do encerramento">
        {passosSaida.map((p) => {
          const feito = !!enc.passos[p.id]
          return (
            <li key={p.id} className="hover:bg-raised/50 flex flex-col gap-1.5 rounded-[10px] px-1.5 py-1.5 text-sm">
              <label className="flex cursor-pointer items-start gap-2.5">
                <input type="checkbox" className="accent-foreground mt-0.5 size-4 shrink-0" checked={feito} disabled={!pode} onChange={(ev) => marcar(p.id, ev.target.checked)} aria-label={p.rotulo} />
                <span className="min-w-0 flex-1">
                  <span className={cn('block', feito && 'text-muted-foreground line-through')}>{p.rotulo}</span>
                  <span className="text-muted-foreground block text-xs">
                    {p.id === 'mes' && (relatorio ? `relatório de novembro ${relatorio.situacao === 'enviado' ? `enviado ${dataHora(relatorio.enviado_em)}` : 'ainda pendente (Entregas)'}` : p.detalhe)}
                    {p.id === 'pacote' && (s.manifesto ? `manifesto com ${s.manifesto.itens.length} itens · ${s.manifesto.por}, ${dataHora(s.manifesto.em)}` : p.detalhe)}
                    {p.id === 'revogar' && (s.revogado ? `revogado por ${s.revogado.por}: ${s.revogado.conexoes.join(', ') || 'nenhuma ativa'}` : p.detalhe)}
                    {p.id === 'espelho' && (s.prova_exclusao ? `prova ${s.prova_exclusao.hash} · ${s.prova_exclusao.por}` : p.detalhe)}
                    {p.id === 'servico' && p.detalhe}
                  </span>
                </span>
              </label>
              {pode && !feito && (
                <span className="flex flex-wrap gap-2 pl-6.5">
                  {p.id === 'pacote' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full"
                      onClick={() =>
                        marcar('pacote', true, (sd) => ({ ...sd, manifesto: { por: usuario.nome, em: agoraBpo(), itens: ['espelho do ERP (CSV)', 'lotes e aprovações', 'comprovantes', 'relatórios mensais', 'trilha de eventos'] } }), `Gerou o pacote de saída de ${nome} com manifesto (5 itens) e entregou ao cliente`)
                      }
                    >
                      Gerar o pacote e entregar
                    </Button>
                  )}
                  {p.id === 'revogar' && (
                    <Button size="sm" variant="outline" className="text-destructive rounded-full" onClick={() => void revogar()}>
                      Revogar em um passo
                    </Button>
                  )}
                  {p.id === 'espelho' && (
                    <Button size="sm" variant="outline" className="rounded-full" disabled={!enc.passos.revogar} onClick={() => marcar('espelho', true, (sd) => ({ ...sd, prova_exclusao: { por: usuario.nome, em: agoraBpo(), hash: prova(`espelho ${perfil.id}`) } }), `Apagou o espelho do ERP de ${nome} e guardou a prova de exclusão`)}>
                      Apagar o espelho
                    </Button>
                  )}
                </span>
              )}
            </li>
          )
        })}
      </ol>
      {pode && (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="destructive" className="rounded-full" disabled={passosSaida.some((p) => !enc.passos[p.id])} onClick={onConcluir}>
            Concluir o encerramento
          </Button>
          <Button size="sm" variant="ghost" className="rounded-full" onClick={() => void desistir()}>
            Desistir do encerramento
          </Button>
        </div>
      )}
    </div>
  )
}

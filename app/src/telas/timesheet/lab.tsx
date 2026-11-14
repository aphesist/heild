// S06 · Extensão de navegador simulada (S06-T06) e os controles do Timesheet no painel Demonstração.
import { EyeIcon, GlobeIcon, LightningIcon, PauseIcon, SpinnerIcon, XCircleIcon } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { SeloDemonstracao } from '@/components/kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Campo, CampoEscolha, GavetaFormulario, Interruptor, Segmentado } from '@/components/ui/formulario'
import { rotuloAtividade, setorDaAtividade } from '@/dados/timesheet-catalogo'
import { agoraDemo, HOJE_TS, hm } from '@/dados/timesheet-tempo'
import { repos } from '@/nucleo/repositorios'
import { servicos, type ResultadoVisita } from '@/servicos'
import { cn } from '@/lib/utils'
import { capturaRapidaLigada, EVENTO_CAPTURA_RAPIDA } from './captura'
import { PausarExtensao } from './configuracao'
import { useTimesheet } from './dados'

export const EVENTO_EXTENSAO_LAB = 'heild:ts-extensao-lab'

/** Seção do Timesheet no painel Demonstração: "como a extensão vê" e a captura rápida. */
export function SecaoTimesheetLab({ onFechar }: { onFechar: () => void }) {
  const [rapida, setRapida] = useState(capturaRapidaLigada())
  return (
    <div className="flex flex-col gap-0.5">
      <button
        type="button"
        onClick={() => {
          onFechar()
          window.dispatchEvent(new Event(EVENTO_EXTENSAO_LAB))
        }}
        className="text-muted-foreground hover:bg-sunken flex cursor-pointer items-center gap-2 rounded-[10px] px-2 py-1.5 text-left text-sm"
      >
        <EyeIcon className="size-4 shrink-0" /> Timesheet: como a extensão vê (simular visita a portal)
      </button>
      <button
        type="button"
        aria-pressed={rapida}
        onClick={() => {
          const v = !rapida
          setRapida(v)
          window.dispatchEvent(new CustomEvent(EVENTO_CAPTURA_RAPIDA, { detail: v }))
        }}
        className="text-muted-foreground hover:bg-sunken flex cursor-pointer items-center gap-2 rounded-[10px] px-2 py-1.5 text-left text-sm"
      >
        <LightningIcon className="size-4 shrink-0" /> Timesheet: sessão nasce em {rapida ? '5 s (demonstração)' : '60 s (regra do plano)'} (alternar)
      </button>
    </div>
  )
}

/** Abre a gaveta quando o painel Demonstração pede (montada pela captura, sempre presente na Plataforma). */
export function OuvinteExtensaoLab() {
  const [aberta, setAberta] = useState(false)
  useEffect(() => {
    const abrir = () => setAberta(true)
    window.addEventListener(EVENTO_EXTENSAO_LAB, abrir)
    return () => window.removeEventListener(EVENTO_EXTENSAO_LAB, abrir)
  }, [])
  return aberta ? <ComoAExtensaoVe onFechar={() => setAberta(false)} /> : null
}

const FORA = '__fora__'

/** S06-T06: o que a extensão capta numa visita a portal e o que ela nunca capta (05, 3.3 a 3.5). */
export function ComoAExtensaoVe({ onFechar }: { onFechar: () => void }) {
  const ts = useTimesheet()
  const u = ts.usuario.id
  const v = ts.vinculoDe(u)
  const ativos = ts.portais.filter((p) => p.situacao === 'ativo')
  const [portalId, setPortalId] = useState(ativos[0]?.id ?? FORA)
  const [clienteId, setClienteId] = useState(ts.clientes[0]?.id ?? '')
  const [onde, setOnde] = useState<'url' | 'titulo' | 'pagina' | 'nenhum'>('pagina')
  const [minutos, setMinutos] = useState('15')
  const [entrada, setEntrada] = useState(true)
  const [rodando, setRodando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [resultado, setResultado] = useState<(ResultadoVisita & { efeito: string }) | null>(null)
  const [pausando, setPausando] = useState(false)
  const portal = ts.portais.find((p) => p.id === portalId)
  const cliente = ts.clientes.find((c) => c.id === clienteId)
  const pausada = !!v?.pausada_ate && v.pausada_ate > agoraDemo()
  const inerte = !v?.termo_aceito_em ? 'sem o termo aceito, a extensão fica inerte' : !v?.vinculada_em ? 'a extensão não está vinculada a esta conta' : pausada ? `a extensão está pausada ${v?.pausa_rotulo ?? ''}` : !ts.cfg.extensao ? 'o Administrador desligou a extensão no escritório' : null

  const simular = async () => {
    setRodando(true)
    setErro(null)
    setResultado(null)
    try {
      if (inerte) {
        setResultado({ pulsos: 0, metodo: 'nenhum', enviado: [], naoEnviado: ['tudo: ' + inerte], efeito: 'Nada foi enviado nem registrado. Meu tempo mostra a pausa só para você.' })
        return
      }
      const cnpj = cliente?.documento
      const r = await servicos.extensao.visitar({ portal: portal?.portal ?? 'site fora da lista', dominio: portal?.dominio ?? 'www.exemplo.com.br', cnpjNaUrl: onde === 'url' ? cnpj : undefined, cnpjNoTitulo: onde === 'titulo' ? cnpj : undefined, cnpjNaPagina: onde === 'pagina' ? cnpj : undefined, minutos: Number(minutos), comEntrada: entrada }, portalId === FORA)
      const d = r.dados
      let efeito = 'Nenhum pulso: sem tecla nem clique no último minuto, a extensão não envia nada.'
      if (d.pulsos > 0 && portal) {
        const identificado = d.metodo !== 'nenhum' ? clienteId : null
        const fim = agoraDemo()
        const ini = new Date(Date.parse(fim) - d.pulsos * 60000).toISOString()
        // Pulsos agregados do dia (o bruto fica 90 dias).
        const existente = ts.pulsos.find((p) => p.usuario_id === u && p.dia === HOJE_TS && p.portal === portal.portal && (p.cliente_id ?? null) === identificado)
        if (existente) repos.pulsos.atualizar(existente.id, { minutos: existente.minutos + d.pulsos, ultimo: fim })
        else repos.pulsos.criar({ usuario_id: u, dia: HOJE_TS, portal: portal.portal, cliente_id: identificado, metodo: d.metodo, minutos: d.pulsos, primeiro: ini, ultimo: fim })
        const aoVivo = ts.sessoes.find((s) => s.usuario_dono_id === u && s.ao_vivo)
        const atividade = (portal.atividade_sugerida.match(/[A-Z]{2,3}-\d{3}/) ?? ['FIS-005'])[0]
        if (aoVivo && aoVivo.tarefa_id && identificado && aoVivo.cliente_id && aoVivo.cliente_id !== identificado) {
          repos.itensConfirmacao.criar({ usuario_id: u, setor_id: aoVivo.setor_id, dia: HOJE_TS, inicio: ini, fim, tipo: 'conflito', texto: `${aoVivo.atividade_id} de ${ts.nomeCliente(aoVivo.cliente_id)} aberta; o portal mostrou ${ts.nomeCliente(identificado)}`, pista: `extensão · ${d.pulsos} pulsos (${d.metodo})`, sugestao: { atividade_id: aoVivo.atividade_id, rotulo: aoVivo.rotulo, cliente_id: aoVivo.cliente_id, minutos: d.pulsos }, alternativa_cliente_id: identificado, situacao: 'pendente', expira_em: new Date(Date.now() + 7 * 86400000).toISOString() })
          efeito = `A sessão continua na tarefa aberta (${aoVivo.atividade_id} · ${ts.nomeCliente(aoVivo.cliente_id)}); o CNPJ diferente virou item "cliente diferente do portal" em Confirmações.`
        } else if (aoVivo) {
          repos.sessoes.atualizar(aoVivo.id, { fim: Date.parse(fim) > Date.parse(aoVivo.fim) ? fim : aoVivo.fim, evidencias: [...aoVivo.evidencias, `${d.pulsos} pulsos no ${portal.portal}${identificado ? ` com o CNPJ de ${ts.nomeCliente(identificado)}` : ''}`] }, { texto: '' })
          efeito = `Os pulsos estenderam a sessão ao vivo (${aoVivo.rotulo}) e viraram evidência; o modo de espera foi adiado.`
        } else if (identificado) {
          repos.itensConfirmacao.criar({ usuario_id: u, setor_id: setorDaAtividade(atividade), dia: HOJE_TS, inicio: ini, fim, tipo: 'portal', texto: `${portal.portal} com o CNPJ de ${ts.nomeCliente(identificado)}, sem tarefa aberta`, pista: `extensão · ${d.pulsos} pulsos (${d.metodo})`, sugestao: { atividade_id: atividade, rotulo: rotuloAtividade(atividade), cliente_id: identificado, minutos: d.pulsos }, situacao: 'marcado', expira_em: new Date(Date.now() + 7 * 86400000).toISOString() })
          efeito = `Sem tarefa aberta: o trecho de portal virou item em Confirmações, já com ${atividade} · ${ts.nomeCliente(identificado)} (pulso não abre sessão sozinho).`
        } else efeito = 'Pulsos sem cliente identificado: contam como sinal de atividade e não viram sessão nem item.'
      } else if (portalId === FORA) efeito = 'Fora da lista: a extensão não roda e nada sai do navegador.'
      setResultado({ ...d, efeito })
    } catch (e) {
      setErro(e instanceof Error ? e.message : String(e))
    } finally {
      setRodando(false)
    }
  }

  return (
    <>
      <GavetaFormulario aberta largura="lg" onFechar={onFechar} titulo="Como a extensão vê" descricao="Simule uma visita a um portal e veja, campo a campo, o que a extensão envia à plataforma e o que fica só no navegador (05, 3.3 a 3.5)." acao={rodando ? 'Simulando…' : 'Simular visita'} acaoDesabilitada={rodando || (!cliente && onde !== 'nenhum')} onAcao={simular} secundaria={<Button type="button" variant="ghost" className="rounded-full" onClick={() => setPausando(true)}><PauseIcon /> Pausar pela extensão</Button>}>
        {inerte && <p className="bg-warning/10 rounded-[14px] px-3 py-2.5 text-sm">Agora {inerte}: a simulação mostra que nada sai.</p>}
        <Campo rotulo="Site visitado">{(id) => <CampoEscolha id={id} valor={portalId} onMudar={setPortalId} opcoes={[...ativos.map((p) => ({ valor: p.id, rotulo: `${p.portal} (${p.dominio.split(',')[0]})` })), { valor: FORA, rotulo: 'Internet banking (fora da lista)' }]} />}</Campo>
        {portal && <p className="text-muted-foreground -mt-2 text-xs">Lê: {portal.leitura}. Sugere {portal.atividade_sugerida}.</p>}
        <Campo rotulo="O cliente aberto no portal">{(id) => <CampoEscolha id={id} valor={clienteId} onMudar={setClienteId} opcoes={ts.clientes.map((c) => ({ valor: c.id, rotulo: `${c.nome} · ${c.documento}` }))} />}</Campo>
        <Campo rotulo="Onde o CNPJ aparece">
          {() => (
            <Segmentado
              rotulo="Onde o CNPJ aparece"
              valor={onde}
              onMudar={setOnde}
              opcoes={[
                { valor: 'url', rotulo: 'Na URL' },
                { valor: 'titulo', rotulo: 'No título' },
                { valor: 'pagina', rotulo: 'Dentro da página' },
                { valor: 'nenhum', rotulo: 'Em lugar nenhum' },
              ]}
            />
          )}
        </Campo>
        <div className="grid gap-3 sm:grid-cols-2">
          <Campo rotulo="Tempo no portal">
            {() => (
              <Segmentado
                rotulo="Tempo no portal"
                valor={minutos}
                onMudar={setMinutos}
                opcoes={[
                  { valor: '5', rotulo: '5 min' },
                  { valor: '15', rotulo: '15 min' },
                  { valor: '40', rotulo: '40 min' },
                ]}
              />
            )}
          </Campo>
          <Interruptor ligado={entrada} onMudar={setEntrada} rotulo="Com tecla ou clique" detalhe="Só o booleano “houve entrada”; nunca as teclas." />
        </div>
        {rodando && (
          <p className="text-muted-foreground flex items-center gap-2 text-sm">
            <SpinnerIcon className="size-4 animate-spin" /> A extensão está lendo a página para achar o cliente…
          </p>
        )}
        {erro && (
          <p role="alert" className="bg-destructive/10 text-destructive flex items-center gap-2 rounded-[14px] px-3 py-2.5 text-sm">
            <XCircleIcon weight="fill" className="size-4" /> {erro}
          </p>
        )}
        {resultado && (
          <div className="flex flex-col gap-3" data-testid="ts-extensao-resultado">
            <div className="flex flex-col gap-1.5">
              <span className="flex items-center gap-2 text-sm font-medium">
                Enviado à plataforma <Badge variant={resultado.pulsos ? 'sucesso' : 'outline'}>{resultado.pulsos} pulsos</Badge> <SeloDemonstracao />
              </span>
              {resultado.enviado.length ? (
                <dl className="bg-sunken grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 rounded-[14px] px-3 py-2.5 font-mono text-xs">
                  {resultado.enviado.map((x) => (
                    <div key={x.campo} className="contents">
                      <dt className="text-muted-foreground">{x.campo}</dt>
                      <dd className="truncate">{x.valor}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="text-muted-foreground text-sm">Nada.</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Nunca sai do navegador</span>
              <ul className="flex flex-col gap-1">
                {resultado.naoEnviado.map((x) => (
                  <li key={x} className="text-muted-foreground flex items-center gap-2 text-sm">
                    <GlobeIcon className="size-3.5 shrink-0" /> {x}
                  </li>
                ))}
              </ul>
            </div>
            <p className={cn('rounded-[14px] px-3 py-2.5 text-sm', resultado.pulsos ? 'bg-success/10' : 'bg-sunken')}>{resultado.efeito}</p>
            <p className="text-muted-foreground text-xs">Hora do relógio do servidor: {hm(agoraDemo())}. O pulso adia o modo de espera e estende a tarefa aberta; sozinho, nunca abre sessão.</p>
          </div>
        )}
      </GavetaFormulario>
      {pausando && <PausarExtensao onFechar={() => setPausando(false)} />}
    </>
  )
}


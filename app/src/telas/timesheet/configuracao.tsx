import { ArrowsClockwiseIcon, CheckCircleIcon, DownloadSimpleIcon, FileArrowUpIcon, GoogleChromeLogoIcon, KeyIcon, PlusIcon, PuzzlePieceIcon, SpinnerIcon, WarningCircleIcon, XIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { useLoja } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import { SeloDemonstracao, useAcao } from '@/components/kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Campo, CampoArea, CampoEscolha, CampoTexto, GavetaFormulario, Interruptor, Segmentado } from '@/components/ui/formulario'
import { catalogoTs, rotuloAtividade } from '@/dados/timesheet-catalogo'
import { agoraDemo, competenciaDe, diaDe, duracaoMin, HOJE_TS, hm, rotuloCompetencia, somarDias, somarMeses } from '@/dados/timesheet-tempo'
import type { ConectorCore, VinculoExtensao } from '@/nucleo/modelo/entidades'
import { todosSetores } from '@/nucleo/permissoes/setores'
import { repos, type ConfigTimesheet } from '@/nucleo/repositorios'
import { servicos } from '@/servicos'
import { ErroServico } from '@/servicos/tipos'
import { cn } from '@/lib/utils'
import { brl, nomeSetor, rotuloConfianca, rotuloOrigem, useTimesheet, type PapelTs } from './dados'

/** Passos no topo das gavetas de setup (mesma peça do conectar número do CRM). */
function Passos({ nomes, atual }: { nomes: readonly string[]; atual: number }) {
  return (
    <ol className="flex gap-1.5" aria-label="Passos">
      {nomes.map((p, i) => (
        <li key={p} className="flex min-w-0 flex-1 flex-col gap-1">
          <span className={cn('h-1.5 rounded-full', i < atual ? 'bg-success' : i === atual ? 'bg-foreground' : 'bg-sunken')} />
          <span className={cn('truncate text-xs', i === atual ? 'font-medium' : 'text-muted-foreground')}>{p}</span>
        </li>
      ))}
    </ol>
  )
}

function Erro({ texto }: { texto: string }) {
  return (
    <p role="alert" className="bg-destructive/10 text-foreground flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm">
      <WarningCircleIcon weight="fill" className="mt-0.5 size-4 shrink-0" /> {texto}
    </p>
  )
}

const VERSAO_TERMO = '2026-11-07'

/** Grava (cria ou atualiza) o vínculo da extensão e o termo da pessoa. */
export function salvarVinculo(usuarioId: string, patch: Partial<VinculoExtensao>, ferramenta = 'extensao.vincular') {
  const atual = repos.vinculosExtensao.listar((v) => v.usuario_id === usuarioId)[0]
  if (atual) return repos.vinculosExtensao.atualizar(atual.id, patch, { ferramenta })
  return repos.vinculosExtensao.criar({ id: `ve-${usuarioId}`, usuario_id: usuarioId, pausas: [], ...patch }, { ferramenta })
}

/** Termo de ciência (05, 10.1): aceito uma vez por pessoa e a cada mudança da lista de coleta. */
export function TermoCiencia({ onFechar, onAceitar, somenteLeitura }: { onFechar: () => void; onAceitar?: () => void; somenteLeitura?: boolean }) {
  const [lido, setLido] = useState(false)
  const { usuario } = useSessao()
  const executar = useAcao()
  const aceitar = () => {
    const r = executar(() => salvarVinculo(usuario.id, { termo_versao: VERSAO_TERMO, termo_aceito_em: agoraDemo() }), { sucesso: 'Termo aceito. O aceite ficou guardado com data e hora.' })
    if (r) (onAceitar ?? onFechar)()
  }
  return (
    <GavetaFormulario
      aberta
      largura="lg"
      onFechar={onFechar}
      titulo="Como o seu tempo é registrado"
      descricao={`Termo de ciência do Timesheet · versão de ${VERSAO_TERMO.split('-').reverse().join('/')}`}
      acao={somenteLeitura ? 'Fechar' : 'Li e aceito'}
      acaoDesabilitada={!somenteLeitura && !lido}
      onAcao={somenteLeitura ? onFechar : aceitar}
    >
      <div className="flex flex-col gap-4 text-sm leading-relaxed">
        <p>
          <strong className="font-medium">Para quê:</strong> saber quanto cada cliente custa ao escritório com o mínimo de esforço. O registro automático faz quase tudo: você confirma o que o sistema deduziu e vê os seus dados primeiro. O que foi feito fora do sistema (uma ligação, uma guia no portal) você pode lançar à mão, com o tempo padrão do escritório já preenchido.
        </p>
        <div>
          <p className="font-medium">O que é registrado</p>
          <ul className="text-muted-foreground list-disc pl-5">
            <li>As ações na plataforma (abrir tarefa, responder conversa, emitir guia), com hora e cliente.</li>
            <li>O que você lançar à mão, marcado como lançamento manual, separado do que foi captado sozinho.</li>
            <li>Com a extensão: um sinal por minuto de que você está ativo num portal da lista, e o CNPJ do cliente que o portal mostra. A extensão lê a página só para achar esse identificador; o conteúdo não sai do seu navegador.</li>
            <li>Tarefas dos sistemas contábeis conectados e arquivos salvos na pasta do cliente.</li>
          </ul>
        </div>
        <div>
          <p className="font-medium">O que nunca é registrado</p>
          <p className="text-muted-foreground">Tela, teclas, mouse, câmera, microfone, localização, programas abertos, sites fora da lista, formulários, senhas, certificados e mensagens para fins de tempo.</p>
        </div>
        <div>
          <p className="font-medium">Quem vê</p>
          <p className="text-muted-foreground">Você vê tudo o que tem o seu nome. O Gestor vê as horas do setor que gere. O custo-hora, só o Administrador. Não existe ranking de produtividade.</p>
        </div>
        <p className="text-muted-foreground">
          Os sinais brutos ficam 90 dias; as sessões, pelo prazo de guarda do escritório. O Timesheet <strong className="text-foreground font-medium">não substitui o controle de ponto</strong>. Você pode contestar qualquer sessão e pausar a extensão quando quiser, sem aviso a ninguém.
        </p>
      </div>
      {!somenteLeitura && (
        <label className="bg-sunken flex cursor-pointer items-start gap-2.5 rounded-lg px-3 py-2.5 text-sm">
          <input type="checkbox" className="accent-foreground mt-0.5 size-4" checked={lido} onChange={(e) => setLido(e.target.checked)} />
          Li e entendi como o meu tempo é registrado. O aceite fica guardado com data e hora.
        </label>
      )}
    </GavetaFormulario>
  )
}

const passosExt = ['Navegador', 'Instalar', 'Vincular', 'Ciência', 'Pronto'] as const

/** Vincular a extensão (05, 3.6): Chrome ou Edge, loja, vínculo pelo login, ciência. */
export function VincularExtensao({ onFechar }: { onFechar: () => void }) {
  const { usuario } = useSessao()
  const ts = useTimesheet()
  const executar = useAcao()
  const [passo, setPasso] = useState(0)
  const [navegador, setNavegador] = useState<'chrome' | 'edge'>('chrome')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [instalada, setInstalada] = useState<string | null>(null)
  const [vinculada, setVinculada] = useState(false)
  const [ciente, setCiente] = useState(false)
  const ok = [true, !!instalada, vinculada, ciente, true][passo]
  const ultimo = passo === passosExt.length - 1
  const chamar = async (f: () => Promise<void>) => {
    setCarregando(true)
    setErro(null)
    try {
      await f()
    } catch (e) {
      setErro(e instanceof ErroServico || e instanceof Error ? e.message : String(e))
    } finally {
      setCarregando(false)
    }
  }
  return (
    <GavetaFormulario
      aberta
      largura="lg"
      onFechar={onFechar}
      titulo="Vincular a extensão"
      descricao="Mantém o tempo contando enquanto você trabalha nos portais e confirma o cliente pelo CNPJ que o portal mostra."
      acao={ultimo ? 'Concluir' : 'Continuar'}
      acaoDesabilitada={!ok || carregando}
      onAcao={() => {
        if (!ultimo) return setPasso((p) => p + 1)
        if (executar(() => salvarVinculo(usuario.id, { navegador, vinculada_em: agoraDemo() }), { sucesso: 'Extensão vinculada' })) onFechar()
      }}
      secundaria={passo > 0 && !ultimo ? <Button type="button" variant="ghost" className="rounded-full" onClick={() => setPasso((p) => p - 1)}>Voltar</Button> : undefined}
    >
      <Passos nomes={passosExt} atual={passo} />
      {passo === 0 && (
        <Campo rotulo="Navegador" ajuda="Firefox e Safari chegam depois.">
          {() => (
            <Segmentado
              rotulo="Navegador"
              valor={navegador}
              onMudar={setNavegador}
              opcoes={[
                { valor: 'chrome', rotulo: 'Chrome' },
                { valor: 'edge', rotulo: 'Edge' },
              ]}
            />
          )}
        </Campo>
      )}
      {passo === 1 && (
        <div className="flex flex-col gap-3 text-sm">
          <p>Abra a loja do {navegador === 'chrome' ? 'Chrome' : 'Edge'}, instale a extensão e volte aqui.</p>
          {instalada ? (
            <p className="bg-success/10 flex items-center gap-2 rounded-lg px-3 py-2.5">
              <CheckCircleIcon weight="fill" className="text-success size-5" /> Extensão {instalada} encontrada neste navegador. <SeloDemonstracao />
            </p>
          ) : (
            <Button type="button" className="w-fit rounded-full" disabled={carregando} onClick={() => chamar(async () => setInstalada((await servicos.extensao.detectar(navegador)).dados.versao))}>
              {carregando ? <SpinnerIcon className="animate-spin" /> : navegador === 'chrome' ? <GoogleChromeLogoIcon /> : <PuzzlePieceIcon />} {carregando ? 'Procurando a extensão…' : 'Abrir a loja'}
            </Button>
          )}
          {erro && <Erro texto={erro} />}
        </div>
      )}
      {passo === 2 && (
        <div className="flex flex-col gap-3 text-sm">
          <p>A extensão usa o login da plataforma; sem login, não envia nada. Vincular liga a extensão à sua conta neste navegador.</p>
          {vinculada ? (
            <p className="bg-success/10 flex items-center gap-2 rounded-lg px-3 py-2.5">
              <CheckCircleIcon weight="fill" className="text-success size-5" /> Vinculada a {usuario.nome}.
            </p>
          ) : (
            <Button type="button" className="w-fit rounded-full" disabled={carregando} onClick={() => chamar(async () => setVinculada((await servicos.extensao.vincular(usuario.nome)).dados.vinculada))}>
              {carregando ? <SpinnerIcon className="animate-spin" /> : <KeyIcon />} {carregando ? 'Vinculando…' : 'Vincular com o meu login'}
            </Button>
          )}
          {erro && <Erro texto={erro} />}
        </div>
      )}
      {passo === 3 && (
        <div className="flex flex-col gap-3 text-sm">
          <p className="font-medium">A extensão só funciona nestes portais:</p>
          <ul className="flex flex-col gap-1.5">
            {ts.portais
              .filter((d) => d.situacao === 'ativo')
              .map((d) => (
                <li key={d.id} className="bg-sunken rounded-md px-3 py-2">
                  <span className="block">{d.portal}</span>
                  <span className="text-muted-foreground block text-xs">lê: {d.leitura}</span>
                </li>
              ))}
          </ul>
          <p className="text-muted-foreground text-xs">Envia só um sinal por minuto de que você está ativo e o CNPJ do cliente. Nunca: conteúdo, formulários, senhas, certificados, URL completa, outros sites.</p>
          <label className="flex cursor-pointer items-start gap-2.5">
            <input type="checkbox" className="accent-foreground mt-0.5 size-4" checked={ciente} onChange={(e) => setCiente(e.target.checked)} />
            Estou ciente. Posso pausar pelo ícone a qualquer momento.
          </label>
        </div>
      )}
      {passo === 4 && (
        <div className="flex flex-col gap-2 text-sm">
          <p className="flex items-center gap-2 font-medium">
            <CheckCircleIcon weight="fill" className="text-success size-5" /> Extensão ativa
          </p>
          <p className="text-muted-foreground">O ícone mostra “ativa neste portal” ou “fora da lista”. Desinstalar não apaga nada do que já foi registrado.</p>
        </div>
      )}
    </GavetaFormulario>
  )
}

/** Pausar a extensão (05, 3.6): direito da pessoa, nunca vira alerta ao Gestor. */
export function PausarExtensao({ onFechar }: { onFechar: () => void }) {
  const { usuario } = useSessao()
  const ts = useTimesheet()
  const executar = useAcao()
  const [ate, setAte] = useState<'30' | 'dia' | 'religar'>('30')
  const rot = { '30': 'por 30 min', dia: 'até o fim do dia', religar: 'até eu religar' }
  const pausar = () => {
    const agora = agoraDemo()
    const fim = ate === '30' ? new Date(Date.parse(agora) + 30 * 60000).toISOString() : ate === 'dia' ? `${HOJE_TS}T23:59:00-03:00` : null
    const v = ts.vinculoDe(usuario.id)
    if (executar(() => salvarVinculo(usuario.id, { pausada_ate: fim ?? '2999-12-31T00:00:00-03:00', pausa_rotulo: rot[ate], pausas: [...(v?.pausas ?? []), { de: agora, ate: fim, rotulo: rot[ate] }] }, 'extensao.pausar'), { sucesso: `Extensão pausada ${rot[ate]}` })) onFechar()
  }
  return (
    <GavetaFormulario aberta onFechar={onFechar} titulo="Pausar a extensão" descricao="Enquanto pausada, nada é enviado. A pausa aparece só no seu Meu tempo; o Gestor não é avisado." acao="Pausar" onAcao={pausar}>
      <Campo rotulo="Por quanto tempo">
        {() => (
          <Segmentado
            rotulo="Por quanto tempo"
            valor={ate}
            onMudar={setAte}
            opcoes={[
              { valor: '30', rotulo: '30 min' },
              { valor: 'dia', rotulo: 'Até o fim do dia' },
              { valor: 'religar', rotulo: 'Até eu religar' },
            ]}
          />
        )}
      </Campo>
    </GavetaFormulario>
  )
}

/** Religa a extensão pausada (fecha a pausa aberta). */
export function religarExtensao(usuarioId: string, v?: VinculoExtensao) {
  const agora = agoraDemo()
  return salvarVinculo(usuarioId, { pausada_ate: null, pausa_rotulo: null, pausas: (v?.pausas ?? []).map((p, i, xs) => (i === xs.length - 1 && (!p.ate || p.ate > agora) ? { ...p, ate: agora } : p)) }, 'extensao.pausar')
}

/** Lista de portais (05, 3.2 e 10.2): todos veem e pedem inclusão; o Administrador desliga. */
export function Dominios({ admin, onFechar }: { admin: boolean; onFechar: () => void }) {
  const ts = useTimesheet()
  const { usuario } = useSessao()
  const executar = useAcao()
  const [pedido, setPedido] = useState<{ portal: string; dominio: string; motivo: string } | null>(null)
  const lista = ts.portais.filter((p) => p.situacao !== 'pedido')
  const pedidos = ts.portais.filter((p) => p.situacao === 'pedido')
  if (pedido)
    return (
      <GavetaFormulario
        aberta
        onFechar={() => setPedido(null)}
        titulo="Pedir inclusão de portal"
        descricao="A lista é mantida pela plataforma e versionada. Inclusões avisam a equipe e pedem nova ciência."
        acao="Enviar pedido"
        acaoDesabilitada={!pedido.portal.trim() || !/\./.test(pedido.dominio)}
        onAcao={() => {
          if (executar(() => repos.portaisExtensao.criar({ portal: pedido.portal.trim(), dominio: pedido.dominio, leitura: 'a definir pela plataforma', atividade_sugerida: '—', situacao: 'pedido', pedido_por: usuario.id, motivo: pedido.motivo, versao: 1 }), { sucesso: 'Pedido enviado à plataforma' })) setPedido(null)
        }}
      >
        <Campo rotulo="Portal">{(id) => <CampoTexto id={id} valor={pedido.portal} onMudar={(v) => setPedido({ ...pedido, portal: v })} placeholder="ex.: Junta Comercial de SP" />}</Campo>
        <Campo rotulo="Domínio" erro={pedido.dominio && !/\./.test(pedido.dominio) ? 'Domínio sem ponto: confira.' : undefined}>
          {(id) => <CampoTexto id={id} mono valor={pedido.dominio} onMudar={(v) => setPedido({ ...pedido, dominio: v.trim().toLowerCase() })} placeholder="www.jucesponline.sp.gov.br" />}
        </Campo>
        <Campo rotulo="Para que serve (opcional)">{(id) => <CampoArea id={id} linhas={3} valor={pedido.motivo} onMudar={(v) => setPedido({ ...pedido, motivo: v })} />}</Campo>
      </GavetaFormulario>
    )
  return (
    <GavetaFormulario
      aberta
      largura="lg"
      onFechar={onFechar}
      titulo="Portais da extensão"
      descricao="Fora desta lista a extensão não roda. O que ela lê serve só para identificar o cliente."
      acao="Fechar"
      onAcao={onFechar}
      secundaria={
        <Button type="button" variant="outline" className="rounded-full" onClick={() => setPedido({ portal: '', dominio: '', motivo: '' })}>
          <PlusIcon /> Pedir inclusão
        </Button>
      }
    >
      <ul className="flex flex-col gap-2">
        {lista.map((d) => (
          <li key={d.id} className={cn('bg-sunken flex items-start gap-3 rounded-lg px-3 py-2.5', d.situacao === 'desligado' && 'opacity-60')}>
            <div className="min-w-0 flex-1 text-sm">
              <div className="font-medium">{d.portal}</div>
              <code className="text-muted-foreground block truncate text-xs">{d.dominio}</code>
              <div className="text-muted-foreground text-xs">
                lê: {d.leitura} · sugere {d.atividade_sugerida}
              </div>
            </div>
            {admin ? (
              <Interruptor ocultarRotulo rotulo={`Portal ${d.portal}`} ligado={d.situacao === 'ativo'} onMudar={(v) => executar(() => repos.portaisExtensao.atualizar(d.id, { situacao: v ? 'ativo' : 'desligado', versao: d.versao + 1 }, { texto: `${usuario.nome} ${v ? 'ligou' : 'desligou'} o portal ${d.portal} da extensão` }), { sucesso: v ? `${d.portal} ligado` : `${d.portal} desligado: a extensão não roda mais nele` })} />
            ) : (
              <Badge variant={d.situacao === 'ativo' ? 'sucesso' : 'outline'}>{d.situacao === 'ativo' ? 'ativo' : 'desligado'}</Badge>
            )}
          </li>
        ))}
      </ul>
      {pedidos.length > 0 && (
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium">Pedidos em análise pela plataforma</span>
          {pedidos.map((p) => (
            <span key={p.id} className="text-muted-foreground text-xs">
              {p.portal} · <code>{p.dominio}</code> · pedido por {ts.nomeUsuario(p.pedido_por)}
            </span>
          ))}
        </div>
      )}
    </GavetaFormulario>
  )
}

/** Configurações do módulo (Administrador; 05, ad. 16): inatividade, itens por dia, fechamento, jornada, abertura ao Gestor. */
export function ConfiguracoesModulo({ onFechar }: { onFechar: () => void }) {
  const ts = useTimesheet()
  const executar = useAcao()
  const [c, setC] = useState<ConfigTimesheet & { inatividade: number }>({ ...ts.cfg, inatividade: ts.escritorio?.inatividade_min ?? 3 })
  const invalido = c.jornada_inicio >= c.jornada_fim || c.intervalo_inicio >= c.intervalo_fim
  const salvar = () => {
    const e = ts.escritorio
    if (!e) return
    const { inatividade, ...cfg } = c
    if (executar(() => repos.escritorios.atualizar(e.id, { inatividade_min: inatividade, configuracao: { ...e.configuracao, timesheet: cfg } }, { ferramenta: 'escritorio.configurar', texto: 'Configurações do Timesheet atualizadas' }), { sucesso: 'Configurações do Timesheet salvas' })) onFechar()
  }
  return (
    <GavetaFormulario aberta largura="lg" onFechar={onFechar} titulo="Configurações do Timesheet" descricao="Valem para o escritório inteiro. Mudanças viram evento." acao="Salvar" acaoDesabilitada={invalido} onAcao={salvar}>
      <Campo rotulo={`Modo de espera depois de ${c.inatividade} min sem ação`} ajuda="Vale só no Painel com cliente e no CRM, onde o tempo é registrado sozinho; não desloga. Curto demais corta o tempo de quem está no core; longo demais conta tempo parado. De 2 a 5.">
        {(id) => <input id={id} type="range" min={2} max={5} value={c.inatividade} onChange={(e) => setC({ ...c, inatividade: Number(e.target.value) })} className="accent-foreground w-full" />}
      </Campo>
      <Campo rotulo={`Até ${c.itens_dia} itens de confirmação por dia`} ajuda="Acima disso vira apontamento manual com outro nome. O resto fica como sem classificação. De 4 a 12.">
        {(id) => <input id={id} type="range" min={4} max={12} value={c.itens_dia} onChange={(e) => setC({ ...c, itens_dia: Number(e.target.value) })} className="accent-foreground w-full" />}
      </Campo>
      <Campo rotulo="Horário da lista de confirmações" ajuda="A lista aparece neste horário e na manhã seguinte, no login.">
        {(id) => <CampoTexto id={id} tipo="time" valor={c.fechamento} onMudar={(v) => setC({ ...c, fechamento: v })} className="w-32" />}
      </Campo>
      <div className="grid grid-cols-2 gap-3">
        <Campo rotulo="Jornada começa">{(id) => <CampoTexto id={id} tipo="time" valor={c.jornada_inicio} onMudar={(v) => setC({ ...c, jornada_inicio: v })} />}</Campo>
        <Campo rotulo="Jornada termina" erro={c.jornada_inicio >= c.jornada_fim ? 'Termina antes de começar.' : undefined}>
          {(id) => <CampoTexto id={id} tipo="time" valor={c.jornada_fim} onMudar={(v) => setC({ ...c, jornada_fim: v })} />}
        </Campo>
        <Campo rotulo="Intervalo de">{(id) => <CampoTexto id={id} tipo="time" valor={c.intervalo_inicio} onMudar={(v) => setC({ ...c, intervalo_inicio: v })} />}</Campo>
        <Campo rotulo="até" erro={c.intervalo_inicio >= c.intervalo_fim ? 'Termina antes de começar.' : undefined}>
          {(id) => <CampoTexto id={id} tipo="time" valor={c.intervalo_fim} onMudar={(v) => setC({ ...c, intervalo_fim: v })} />}
        </Campo>
      </div>
      <p className="text-muted-foreground -mt-3 text-xs">Fora da jornada, a sessão é marcada e entra no relatório mensal; nunca vira alerta por ocorrência. O intervalo não vira “sem classificação”.</p>
      <Campo rotulo={`Abrir a aba Equipe ao Gestor após ${c.equipe_apos_semanas} semanas`} ajuda="Recomendado: cada pessoa vê o próprio tempo antes do Gestor ver o da equipe.">
        {(id) => <CampoEscolha id={id} valor={String(c.equipe_apos_semanas)} onMudar={(v) => setC({ ...c, equipe_apos_semanas: Number(v) })} opcoes={['0', '1', '2', '3', '4'].map((v) => ({ valor: v, rotulo: v === '0' ? 'Já' : `${v} semanas` }))} />}
      </Campo>
      <Campo rotulo={`Meta de cobertura automática: ${c.meta_cobertura}%`} ajuda="Alterdata com extensão: 80%; Domínio sem API: 70%; Contmatic: 60% (05, 11.1).">
        {(id) => <input id={id} type="range" min={50} max={95} step={5} value={c.meta_cobertura} onChange={(e) => setC({ ...c, meta_cobertura: Number(e.target.value) })} className="accent-foreground w-full" />}
      </Campo>
      <Campo rotulo="Valor-hora de cobrança (Jurídico)" ajuda="Distinto do custo-hora: é o preço da hora na pré-fatura. O advogado e o Gestor veem; o custo-hora continua só do Administrador.">
        {(id) => <CampoTexto id={id} tipo="number" valor={String(c.valor_hora_cobranca)} onMudar={(v) => setC({ ...c, valor_hora_cobranca: Number(v) || 0 })} className="w-40 tabular-nums" />}
      </Campo>
      <Interruptor ligado={c.extensao} onMudar={(v) => setC({ ...c, extensao: v })} rotulo="Extensão de navegador" detalhe="Cada pessoa vincula e dá ciência; sem ciência, fica inerte." />
      <Interruptor ligado={c.artefatos} onMudar={(v) => setC({ ...c, artefatos: v })} rotulo="Inferir por arquivos e guias (artefatos)" detalhe="Arquivo na pasta do cliente vira sessão estimada com a duração padrão." />
      <Interruptor ligado={c.benchmark} onMudar={(v) => setC({ ...c, benchmark: v })} rotulo="Contribuir com o benchmark anonimizado" detalhe="Medianas por atividade, sem nomes nem clientes, para calibrar o catálogo." />
      <TemposPadraoEditor lista={c.tempos_padrao} onMudar={(tempos_padrao) => setC({ ...c, tempos_padrao })} />
    </GavetaFormulario>
  )
}

/** S06b: tempo padrão do que é feito por fora (ligação, guia no portal...): o lançamento manual já vem com a duração. */
function TemposPadraoEditor({ lista, onMudar }: { lista: ConfigTimesheet['tempos_padrao']; onMudar: (l: ConfigTimesheet['tempos_padrao']) => void }) {
  const muda = (i: number, patch: Partial<ConfigTimesheet['tempos_padrao'][number]>) => onMudar(lista.map((x, k) => (k === i ? { ...x, ...patch } : x)))
  return (
    <div className="flex flex-col gap-2" data-testid="ts-tempos-padrao">
      <span className="text-sm font-medium">Tempo padrão do que é feito por fora</span>
      <p className="text-muted-foreground -mt-1 text-xs">Ao lançar tempo à mão, escolher um destes preenche a duração; a pessoa pode alterar. A captura automática continua sendo o principal.</p>
      {lista.map((t, i) => (
        <div key={t.id} className="grid grid-cols-[minmax(0,1fr)_5rem_auto] items-center gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,10rem)_5rem_auto]">
          <CampoTexto aria-label={`Nome do tempo padrão ${i + 1}`} valor={t.nome} onMudar={(v) => muda(i, { nome: v })} />
          <span className="hidden sm:block">
            <CampoEscolha rotulo={`Atividade do tempo padrão ${i + 1}`} valor={t.atividade_id ?? ''} onMudar={(v) => muda(i, { atividade_id: v || null })} opcoes={[{ valor: '', rotulo: 'sem atividade' }, ...catalogoTs.map((a) => ({ valor: a.id, rotulo: `${a.id} · ${a.rotulo}` }))]} />
          </span>
          <CampoTexto aria-label={`Minutos do tempo padrão ${i + 1}`} tipo="number" valor={String(t.minutos)} onMudar={(v) => muda(i, { minutos: Math.max(1, Number(v) || 1) })} className="tabular-nums" />
          <Button type="button" size="icon-sm" variant="ghost" className="rounded-full" aria-label={`Tirar ${t.nome}`} onClick={() => onMudar(lista.filter((_, k) => k !== i))}>
            <XIcon />
          </Button>
        </div>
      ))}
      <Button type="button" size="sm" variant="outline" className="w-fit rounded-full" onClick={() => onMudar([...lista, { id: `tp-${Date.now().toString(36)}`, nome: 'Nova tarefa feita por fora', atividade_id: null, minutos: 10 }])}>
        <PlusIcon /> Acrescentar tempo padrão
      </Button>
    </div>
  )
}

/** Baixa um arquivo de texto gerado na hora. */
function baixar(nome: string, conteudo: string, tipo = 'text/csv;charset=utf-8') {
  const url = URL.createObjectURL(new Blob(['﻿' + conteudo], { type: tipo }))
  const a = document.createElement('a')
  a.href = url
  a.download = nome
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
const csv = (linhas: (string | number | undefined | null)[][]) => linhas.map((l) => l.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(';')).join('\n')

/** Exportar (05, 8.1 e 10.3): sessões filtradas, relatório mensal, os próprios dados e o benchmark anonimizado. */
export function Exportar({ papel, onFechar }: { papel: PapelTs; onFechar: () => void }) {
  const ts = useTimesheet()
  const executar = useAcao()
  const gestor = papel !== 'colaborador'
  const [o, setO] = useState<'csv' | 'pdf' | 'meus' | 'benchmark'>(gestor ? 'csv' : 'meus')
  const [periodo, setPeriodo] = useState<'semana' | 'mes' | 'anterior'>('mes')
  const [pronto, setPronto] = useState<string | null>(null)
  const opcoes = [
    ...(gestor
      ? [
          { valor: 'csv' as const, rotulo: 'Sessões (CSV)' },
          { valor: 'pdf' as const, rotulo: 'Relatório mensal (PDF)' },
        ]
      : []),
    { valor: 'meus' as const, rotulo: 'O que a plataforma sabe sobre mim' },
    ...(papel === 'admin' ? [{ valor: 'benchmark' as const, rotulo: 'Benchmark anonimizado' }] : []),
  ]
  const comp = periodo === 'anterior' ? somarMeses(competenciaDe(HOJE_TS), -1) : competenciaDe(HOJE_TS)
  const de = periodo === 'semana' ? somarDias(HOJE_TS, -6) : `${comp}-01`
  const noPeriodo = (dia: string) => (periodo === 'mes' || periodo === 'anterior' ? competenciaDe(dia) === comp : dia >= de && dia <= HOJE_TS)
  const setoresVistos = papel === 'admin' ? null : ts.permissoes.gere
  const gerar = () => {
    const cab = ['dia', 'início', 'fim', 'minutos', 'pessoa', 'setor', 'cliente', 'atividade', 'confiança', 'origem', 'fora da jornada', 'serviço extra', 'contestação', 'descrição', 'faturável']
    const linha = (s: (typeof ts.sessoes)[number]) => [diaDe(s.inicio), hm(s.inicio), hm(s.fim), duracaoMin(s), ts.nomeUsuario(s.usuario_dono_id), nomeSetor(s.setor_id), s.cliente_id ? ts.nomeCliente(s.cliente_id) : 'interno', `${s.atividade_id ?? ''} ${s.rotulo}`, rotuloConfianca[s.confianca], rotuloOrigem(s), s.fora_da_jornada ? 'sim' : '', ts.ehExtra(s) ? 'sim' : '', s.contestacao ? `${s.contestacao.status}: ${s.contestacao.correcao}` : '', s.descricao ?? '', s.faturavel == null ? '' : s.faturavel ? 'sim' : 'não']
    if (o === 'csv') {
      const ss = ts.sessoes.filter((s) => s.ator_tipo === 'pessoa' && !s.substituida_por && noPeriodo(diaDe(s.inicio)) && (!setoresVistos || setoresVistos.includes(s.setor_id as never)))
      const nome = `sessoes-${periodo === 'semana' ? 'semana' : comp}.csv`
      baixar(nome, csv([cab, ...ss.map(linha)]))
      return nome
    }
    if (o === 'meus') {
      const minhas = ts.sessoes.filter((s) => s.usuario_dono_id === ts.usuario.id)
      const itens = ts.itens.filter((i) => i.usuario_id === ts.usuario.id)
      const v = ts.vinculoDe(ts.usuario.id)
      const nome = 'meus-dados-timesheet.csv'
      baixar(
        nome,
        csv([
          ['tipo', ...cab],
          ...minhas.map((s) => [s.ator_tipo === 'pessoa' ? (s.substituida_por ? 'sessão substituída' : 'sessão') : 'integrante', ...linha(s)]),
          ...itens.map((i) => ['item de confirmação', i.dia, hm(i.inicio), i.fim ? hm(i.fim) : '', '', ts.usuario.nome, nomeSetor(i.setor_id), '', i.texto, i.situacao, i.pista, '', '', i.resultado ?? '']),
          ...(v?.pausas ?? []).map((p) => ['pausa da extensão', diaDe(p.de), hm(p.de), p.ate ? hm(p.ate) : 'aberta', '', ts.usuario.nome, '', '', p.rotulo, '', '', '', '', '']),
          ...(v?.termo_aceito_em ? [['termo de ciência aceito', diaDe(v.termo_aceito_em), hm(v.termo_aceito_em), '', '', ts.usuario.nome, '', '', `versão ${v.termo_versao}`, '', '', '', '', '']] : []),
        ]),
      )
      return nome
    }
    if (o === 'benchmark') {
      const ss = ts.sessoes.filter((s) => s.ator_tipo === 'pessoa' && !s.substituida_por && s.atividade_id && noPeriodo(diaDe(s.inicio)))
      const porAt = new Map<string, number[]>()
      ss.forEach((s) => porAt.set(s.atividade_id!, [...(porAt.get(s.atividade_id!) ?? []), duracaoMin(s)]))
      const med = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)]
      const nome = `benchmark-anonimizado-${comp}.csv`
      baixar(nome, csv([['atividade', 'nome', 'sessões', 'mediana (min)'], ...[...porAt.entries()].filter(([, xs]) => xs.length >= 5).map(([a, xs]) => [a, rotuloAtividade(a), xs.length, med(xs)])]))
      return nome
    }
    return `horas-${comp}.pdf`
  }
  return (
    <GavetaFormulario aberta onFechar={onFechar} titulo="Exportar" descricao="A exportação vira evento e o arquivo fica como documento com hash." acao={pronto ? 'Fechar' : 'Gerar arquivo'} onAcao={() => (pronto ? onFechar() : setPronto(executar(() => gerar()) ?? null))}>
      <Campo rotulo="O quê">{() => <Segmentado rotulo="O quê" valor={o} onMudar={(v) => (setO(v), setPronto(null))} opcoes={opcoes} />}</Campo>
      {o !== 'meus' ? (
        <Campo rotulo="Período">
          {() => (
            <Segmentado
              rotulo="Período"
              valor={periodo}
              onMudar={(v) => (setPeriodo(v), setPronto(null))}
              opcoes={[
                { valor: 'semana', rotulo: 'Últimos 7 dias' },
                { valor: 'mes', rotulo: rotuloCompetencia(competenciaDe(HOJE_TS)) },
                { valor: 'anterior', rotulo: rotuloCompetencia(somarMeses(competenciaDe(HOJE_TS), -1)) },
              ]}
            />
          )}
        </Campo>
      ) : (
        <p className="text-muted-foreground text-sm">Todas as suas sessões (e as substituídas), evidências, confirmações, pausas da extensão, o aceite do termo e as marcas de fora da jornada, em CSV.</p>
      )}
      {o === 'csv' && !ts.permissoes.gere.length && papel !== 'admin' && <p className="text-muted-foreground text-xs">Só os setores que você gere.</p>}
      {o === 'benchmark' && <p className="text-muted-foreground text-xs">Só medianas por atividade com 5 ou mais sessões; sem nomes, clientes nem horários.</p>}
      {pronto && (
        <p className="bg-success/10 flex flex-wrap items-center gap-2 rounded-lg px-3 py-2.5 text-sm">
          <DownloadSimpleIcon className="size-4" /> {pronto} {o === 'pdf' ? 'gerado e guardado em Arquivos › Escritório › Relatórios.' : 'baixado.'}
          {o === 'pdf' && <SeloDemonstracao fonte="relatório mensal" />}
        </p>
      )}
    </GavetaFormulario>
  )
}

const cores = ['Alterdata', 'Domínio', 'Questor', 'Contmatic'] as const

/** Conectar um core (05, 4): Alterdata por API; Domínio, Questor e Contmatic por relatório e arquivos. */
export function ConectarCore({ inicial, onFechar }: { inicial?: ConectorCore['core']; onFechar: () => void }) {
  const ts = useTimesheet()
  const executar = useAcao()
  const [core, setCore] = useState<ConectorCore['core']>(inicial ?? 'Alterdata')
  const [token, setToken] = useState('')
  const [testando, setTestando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [testado, setTestado] = useState<number | null>(null)
  const [arquivo, setArquivo] = useState<{ linhas: number; semEquivalente: number } | null>(null)
  const [pasta, setPasta] = useState('Clientes/{cliente}/Contmatic')
  const api = core === 'Alterdata'
  const ok = api ? testado != null : core === 'Contmatic' ? pasta.length > 3 || !!arquivo : !!arquivo
  const chamar = async (f: () => Promise<void>) => {
    setTestando(true)
    setErro(null)
    try {
      await f()
    } catch (e) {
      setErro(e instanceof Error ? e.message : String(e))
    } finally {
      setTestando(false)
    }
  }
  const conectar = () => {
    const existente = ts.conectores.find((c) => c.core === core)
    const dados = {
      core,
      modo: api ? 'API ePlugin' : core === 'Contmatic' ? 'arquivos na pasta + relatório' : 'relatório importado',
      status: api ? ('conectado' as const) : ('importacao' as const),
      detalhe: api ? `leitura a cada 15 min · primeira leitura agora · ${testado} tarefas no mês` : arquivo ? `relatório importado agora · ${arquivo.linhas} linhas, ${arquivo.semEquivalente} sem equivalente` : `pasta ${pasta}`,
      ultima_leitura: agoraDemo(),
    }
    const r = executar(() => (existente ? repos.conectoresCore.atualizar(existente.id, dados) : repos.conectoresCore.criar({ ...dados, mapa_departamento: [], mapa_responsavel: [] })), { sucesso: api ? `${core} conectado` : `Relatório do ${core} importado` })
    if (r) onFechar()
  }
  return (
    <GavetaFormulario aberta largura="lg" onFechar={onFechar} titulo="Conectar sistema contábil" descricao="As tarefas do core viram eventos; a equivalência com o catálogo vem depois, na fila “sem equivalente”." acao={api ? 'Conectar' : 'Importar'} acaoDesabilitada={!ok || testando} onAcao={conectar}>
      <Campo rotulo="Sistema">
        {() => (
          <Segmentado
            rotulo="Sistema"
            valor={core}
            onMudar={(v) => {
              setCore(v)
              setTestado(null)
              setArquivo(null)
              setErro(null)
            }}
            opcoes={cores.map((c) => ({ valor: c, rotulo: c }))}
          />
        )}
      </Campo>
      {api ? (
        <>
          <p className="text-muted-foreground text-sm">API do ePlugin (pacote eContador Master). Leitura a cada 15 min e varredura diária dos últimos 7 dias. O token fica no cofre; só o conector o usa.</p>
          <Campo rotulo="Token do escritório" ajuda="No Alterdata: eContador › Integrações › Gerar token. (Na demonstração, um token com “erro” simula a recusa.)">
            {(id) => (
              <CampoTexto
                id={id}
                tipo="password"
                valor={token}
                onMudar={(v) => {
                  setToken(v)
                  setTestado(null)
                }}
                placeholder="cole o token"
              />
            )}
          </Campo>
          {testado != null ? (
            <p className="bg-success/10 flex flex-wrap items-center gap-2 rounded-lg px-3 py-2.5 text-sm">
              <CheckCircleIcon weight="fill" className="text-success size-5" /> Conexão ok · {testado} tarefas encontradas no mês. <SeloDemonstracao />
            </p>
          ) : (
            <Button type="button" variant="outline" className="w-fit rounded-full" disabled={token.length < 8 || testando} onClick={() => chamar(async () => setTestado((await servicos.cores.testarToken(core, token)).dados.tarefasNoMes))}>
              {testando ? <SpinnerIcon className="animate-spin" /> : null} {testando ? 'Testando…' : 'Testar conexão'}
            </Button>
          )}
        </>
      ) : (
        <>
          <p className="text-muted-foreground text-sm">
            {core === 'Contmatic'
              ? 'Sem API. Três caminhos somados: arquivos que o Phoenix grava na pasta do cliente, o relatório do módulo Gestão do Escritório e a confirmação assistida. A cobertura automática esperada é menor (meta 60%).'
              : `Sem API de saída pública. Enquanto não houver, exporte o relatório de produtividade do ${core === 'Domínio' ? 'Domínio Processos' : 'Tareffa'} (Excel) toda semana e importe aqui.`}
          </p>
          {core === 'Contmatic' && <Campo rotulo="Pasta dos arquivos na nuvem do escritório" ajuda="{cliente} é trocado pela pasta de cada cliente.">{(id) => <CampoTexto id={id} mono valor={pasta} onMudar={setPasta} />}</Campo>}
          <Button type="button" variant={arquivo ? 'secondary' : 'outline'} className="w-fit rounded-full" disabled={testando} onClick={() => chamar(async () => setArquivo((await servicos.cores.importarRelatorio(core, 'produtividade-semana-16-11.xlsx')).dados))}>
            {testando ? <SpinnerIcon className="animate-spin" /> : <FileArrowUpIcon />} {arquivo ? `produtividade-semana-16-11.xlsx · ${arquivo.linhas} linhas` : testando ? 'Lendo o relatório…' : 'Escolher relatório'}
          </Button>
        </>
      )}
      {erro && <Erro texto={erro} />}
    </GavetaFormulario>
  )
}

/** Mapas de equivalência (05, 4.6; Administrador): departamento → setor e responsável → pessoa. */
export function MapasCore({ conector, onFechar }: { conector: ConectorCore; onFechar: () => void }) {
  const ts = useTimesheet()
  const executar = useAcao()
  const [deps, setDeps] = useState(conector.mapa_departamento)
  const [resps, setResps] = useState(conector.mapa_responsavel)
  const pessoas = ts.usuarios.filter((u) => u.situacao === 'ativo')
  return (
    <GavetaFormulario
      aberta
      largura="lg"
      onFechar={onFechar}
      titulo={`Equivalências do ${conector.core}`}
      descricao="Confirme uma vez. Vale para o futuro e 90 dias para trás; eventos guardados ganham sessão quando casam."
      acao="Salvar"
      onAcao={() => {
        if (executar(() => repos.conectoresCore.atualizar(conector.id, { mapa_departamento: deps, mapa_responsavel: resps }, { texto: `Equivalências do ${conector.core} atualizadas` }), { sucesso: 'Equivalências salvas' })) onFechar()
      }}
    >
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Departamento → setor</span>
        {deps.map((d, i) => (
          <div key={d.core} className="grid grid-cols-[1fr_1fr] items-center gap-3 text-sm">
            <span>{d.core}</span>
            <CampoEscolha valor={d.setor_id ?? ''} onMudar={(v) => setDeps((xs) => xs.map((x, k) => (k === i ? { ...x, setor_id: v || null } : x)))} opcoes={[{ valor: '', rotulo: 'não é trabalho medido' }, ...todosSetores.map((s) => ({ valor: s, rotulo: nomeSetor(s) }))]} />
          </div>
        ))}
        {!deps.length && <p className="text-muted-foreground text-xs">Nenhum departamento lido ainda: aparecem depois da primeira leitura.</p>}
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Responsável → pessoa</span>
        {resps.map((r, i) => (
          <div key={r.core} className="grid grid-cols-[1fr_1fr] items-center gap-3 text-sm">
            <code className={cn(!r.usuario_id && 'text-warning-text')}>{r.core}</code>
            <CampoEscolha valor={r.usuario_id ?? ''} onMudar={(v) => setResps((xs) => xs.map((x, k) => (k === i ? { ...x, usuario_id: v || null } : x)))} opcoes={[{ valor: '', rotulo: 'casar depois' }, ...pessoas.map((p) => ({ valor: p.id, rotulo: p.nome }))]} />
          </div>
        ))}
      </div>
    </GavetaFormulario>
  )
}

/** Custo-hora do escritório (05, 8.4 e A7): gastos do mês ÷ horas produtivas; só o Administrador. Cada definição é uma versão nova. */
export function CustoHora({ onFechar }: { onFechar: () => void }) {
  const ts = useTimesheet()
  const loja = useLoja()
  const { usuario } = useSessao()
  const executar = useAcao()
  const base = ts.custoAtual
  const [modo, setModo] = useState<'gastos' | 'direto'>(base?.modo ?? 'gastos')
  const [gastos, setGastos] = useState((base?.gastos.length ? base.gastos : [{ nome: 'Folha e encargos', valor: 0 }, { nome: 'Pró-labore', valor: 0 }, { nome: 'Aluguel e condomínio', valor: 0 }, { nome: 'Sistemas e assinaturas', valor: 0 }, { nome: 'Impostos do escritório', valor: 0 }, { nome: 'Outros', valor: 0 }]).map((g) => ({ ...g, texto: String(g.valor) })))
  const horasMedidas = Math.round(ts.sessoes.filter((s) => s.ator_tipo === 'pessoa' && !s.substituida_por && competenciaDe(diaDe(s.inicio)) === somarMeses(competenciaDe(HOJE_TS), -1)).reduce((t, s) => t + duracaoMin(s), 0) / 60)
  const [horas, setHoras] = useState(String(base?.horas_produtivas ?? (horasMedidas || 160)))
  const [direto, setDireto] = useState(String(base?.valor ?? ''))
  const [porCargo, setPorCargo] = useState(base?.por_cargo ?? false)
  const [valorBpo, setValorBpo] = useState(String(base?.valor_bpo ?? 85))
  const total = gastos.reduce((s, g) => s + (Number(g.texto) || 0), 0)
  const calculado = Math.round(total / (Number(horas) || 1))
  const valor = modo === 'gastos' ? calculado : Number(direto) || 0
  const competencia = somarMeses(competenciaDe(HOJE_TS), -1)
  const salvar = () => {
    const r = executar(
      () =>
        repos.custosHora.criar(
          { competencia, modo, gastos: gastos.map((g) => ({ nome: g.nome, valor: Number(g.texto) || 0 })), horas_produtivas: Number(horas) || 0, valor, por_cargo: porCargo, fatores_cargo: porCargo ? [{ cargo: 'Sênior', fator: 1.4 }, { cargo: 'Pleno', fator: 1 }, { cargo: 'Júnior', fator: 0.7 }] : undefined, por_pacote: loja.estado.custoPorPacote, valor_bpo: Number(valorBpo) || null, definido_por: usuario.id, definido_por_nome: usuario.nome },
          { texto: `${usuario.nome} definiu o custo-hora de ${rotuloCompetencia(competencia)}: ${brl(valor)}/h` },
        ),
      { sucesso: `Custo-hora salvo: ${brl(valor)}/h` },
    )
    if (r) onFechar()
  }
  return (
    <GavetaFormulario aberta largura="lg" onFechar={onFechar} titulo="Custo-hora do escritório" descricao={`Vigência: ${rotuloCompetencia(competencia)}. Só o Administrador vê. É do escritório, não da pessoa nem do cargo; cada definição fica guardada.`} acao={`Salvar ${brl(valor)}/h`} acaoDesabilitada={valor <= 0} onAcao={salvar}>
      <Campo rotulo="Como calcular">
        {() => (
          <Segmentado
            rotulo="Como calcular"
            valor={modo}
            onMudar={setModo}
            opcoes={[
              { valor: 'gastos', rotulo: 'Pelos gastos do mês' },
              { valor: 'direto', rotulo: 'Informar o valor' },
            ]}
          />
        )}
      </Campo>
      {modo === 'gastos' ? (
        <>
          <div className="flex flex-col gap-2">
            {gastos.map((g, i) => (
              <div key={g.nome} className="grid grid-cols-[1fr_9rem] items-center gap-3 text-sm">
                <span>{g.nome}</span>
                <CampoTexto tipo="number" valor={g.texto} onMudar={(v) => setGastos((xs) => xs.map((x, k) => (k === i ? { ...x, texto: v } : x)))} className="text-right tabular-nums" />
              </div>
            ))}
            <div className="grid grid-cols-[1fr_9rem] gap-3 border-t pt-2 text-sm font-medium">
              <span>Total do mês</span>
              <span className="text-right tabular-nums">{brl(total)}</span>
            </div>
          </div>
          <Campo rotulo="Horas produtivas registradas no mês" ajuda={`Vem do Timesheet (humanas, sem as de agente${horasMedidas ? `; medidas em ${rotuloCompetencia(competencia)}: ${horasMedidas} h` : ''}). Ajuste se faltar alguém.`}>
            {(id) => <CampoTexto id={id} tipo="number" valor={horas} onMudar={setHoras} className="w-32 tabular-nums" />}
          </Campo>
          <p className="bg-sunken rounded-lg px-3 py-2.5 text-sm">
            {brl(total)} ÷ {horas} h = <strong className="font-medium">{brl(calculado)} por hora</strong>. Cliente que toma 2 h no mês e paga R$ 500 fica {brl(Math.abs(500 - 2 * calculado))} {500 - 2 * calculado < 0 ? 'abaixo' : 'acima'} da neutralidade.
          </p>
        </>
      ) : (
        <Campo rotulo="Custo por hora" ajuda="Use quando o Financeiro do escritório já calcula (a partir da fase 3b, ele propõe o valor).">
          {(id) => <CampoTexto id={id} tipo="number" valor={direto} onMudar={setDireto} className="w-40 tabular-nums" />}
        </Campo>
      )}
      {loja.estado.bpoModulo && (
        <>
          <Interruptor
            ligado={loja.estado.custoPorPacote}
            onMudar={loja.ligarCustoPorPacote}
            rotulo="Custo-hora por pacote (opcional)"
            detalhe="Desligado, o escritório usa um custo-hora só, com todos os pacotes. Ligado, as horas do BPO usam o custo da equipe do pacote. O filtro de pacote funciona nos dois casos."
          />
          {loja.estado.custoPorPacote && <Campo rotulo="Custo-hora da equipe do BPO">{(id) => <CampoTexto id={id} tipo="number" valor={valorBpo} onMudar={setValorBpo} className="w-40 tabular-nums" />}</Campo>}
        </>
      )}
      <Interruptor ligado={porCargo} onMudar={setPorCargo} rotulo="Refinar por cargo (opcional)" detalhe="Separa sênior de júnior. Nunca por pessoa: o salário individual não entra no sistema." />
      {porCargo && (
        <div className="grid gap-2 sm:grid-cols-3">
          {[
            ['Sênior', 1.4],
            ['Pleno', 1],
            ['Júnior', 0.7],
          ].map(([c, f]) => (
            <div key={c as string} className="bg-sunken rounded-md px-3 py-2 text-sm">
              <div className="text-muted-foreground text-xs">{c as string}</div>
              <div className="font-medium tabular-nums">{brl(Math.round(valor * (f as number)))}/h</div>
            </div>
          ))}
        </div>
      )}
      {ts.custos.length > 0 && (
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium">Histórico</span>
          {[...ts.custos]
            .sort((a, b) => b.criado_em.localeCompare(a.criado_em))
            .slice(0, 5)
            .map((c) => (
              <span key={c.id} className="text-muted-foreground text-xs tabular-nums">
                {rotuloCompetencia(c.competencia)} · {brl(c.valor)}/h · {c.modo === 'gastos' ? 'pelos gastos' : 'valor direto'} · {c.definido_por_nome ?? ts.nomeUsuario(c.definido_por)} em {diaDe(c.criado_em).split('-').reverse().join('/')}
              </span>
            ))}
        </div>
      )}
    </GavetaFormulario>
  )
}

/** Reconstruir período (`timesheet.reconstruir`; Administrador). */
export function ReconstruirPeriodo({ onFechar }: { onFechar: () => void }) {
  const ts = useTimesheet()
  const executar = useAcao()
  const [periodo, setPeriodo] = useState<'semana' | 'mes'>('semana')
  const [resultado, setResultado] = useState<ReturnType<typeof repos.sessoes.reconstruir> | null>(null)
  const [rodando, setRodando] = useState(false)
  const de = periodo === 'semana' ? somarDias(HOJE_TS, -6) : `${competenciaDe(HOJE_TS)}-01`
  const rodar = () => {
    setRodando(true)
    setTimeout(() => {
      setResultado(executar(() => repos.sessoes.reconstruir(de, HOJE_TS, ts.cfg, HOJE_TS)) ?? null)
      setRodando(false)
    }, 900)
  }
  return (
    <GavetaFormulario aberta onFechar={onFechar} titulo="Reconstruir período" descricao="Relê os eventos e refaz o que é derivado: sessões ao vivo esquecidas, fora da jornada, anomalias e itens vencidos. Sessões confirmadas não mudam; rodar de novo dá o mesmo resultado." acao={resultado ? 'Fechar' : rodando ? 'Reconstruindo…' : 'Reconstruir'} acaoDesabilitada={rodando} onAcao={resultado ? onFechar : rodar}>
      <Campo rotulo="Período">
        {() => (
          <Segmentado
            rotulo="Período"
            valor={periodo}
            onMudar={(v) => (setPeriodo(v), setResultado(null))}
            opcoes={[
              { valor: 'semana', rotulo: 'Últimos 7 dias' },
              { valor: 'mes', rotulo: rotuloCompetencia(competenciaDe(HOJE_TS)) },
            ]}
          />
        )}
      </Campo>
      {rodando && (
        <p className="text-muted-foreground flex items-center gap-2 text-sm">
          <ArrowsClockwiseIcon className="size-4 animate-spin" /> Relendo os eventos de {de.split('-').reverse().join('/')} a {HOJE_TS.split('-').reverse().join('/')}…
        </p>
      )}
      {resultado && (
        <dl className="bg-success/10 grid grid-cols-2 gap-2 rounded-lg px-3 py-2.5 text-sm">
          <dt className="text-muted-foreground">sessões relidas</dt>
          <dd className="text-right tabular-nums">{resultado.relidas}</dd>
          <dt className="text-muted-foreground">ajustadas</dt>
          <dd className="text-right tabular-nums">{resultado.ajustadas}</dd>
          <dt className="text-muted-foreground">anomalias novas</dt>
          <dd className="text-right tabular-nums">{resultado.anomalias}</dd>
          <dt className="text-muted-foreground">sessões ao vivo fechadas</dt>
          <dd className="text-right tabular-nums">{resultado.fechadas}</dd>
          <dt className="text-muted-foreground">itens expirados</dt>
          <dd className="text-right tabular-nums">{resultado.expirados}</dd>
        </dl>
      )}
    </GavetaFormulario>
  )
}

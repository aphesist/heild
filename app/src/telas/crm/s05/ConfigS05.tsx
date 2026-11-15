import { ArrowsClockwiseIcon, CheckCircleIcon, EnvelopeSimpleIcon, LockSimpleIcon, PlugsConnectedIcon, ProhibitIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { useLoja } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import { SeloDemonstracao, useConfirmar } from '@/components/kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CabecalhoSecao, CampoArea, CampoEscolha, Interruptor, Passos, Segmentado } from '@/components/ui/formulario'
import { canaisSetor, rotuloSetor, type CanalSetor } from '@/dados/crm'
import { registrar } from '@/nucleo/repositorios'
import type { SetorIntegrante } from '@/theme/tipos'
import { assinar, categoriasAtendimento, useBloqueados, useCaixasEmail, useCfgAtendimento, useProvedores } from './config'
import { usePersistente } from '@/ambiente/loja'

function SoAdministrador() {
  return (
    <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
      <LockSimpleIcon className="size-3.5" /> Só o Administrador muda esta parte.
    </p>
  )
}

/** C2-07 · S05-A61: como o nome de quem atende entra na mensagem ao cliente. */
export function NomeQuemAtende() {
  const [cfg, setCfg] = useCfgAtendimento()
  const { usuario } = useSessao()
  return (
    <div className="flex flex-col gap-4">
      <CabecalhoSecao titulo="Nome de quem atende" descricao="Toda mensagem que uma pessoa manda ao cliente leva o nome dela, para o cliente saber com quem fala. O integrante assina como assistente." />
      <Segmentado
        rotulo="Onde o nome entra"
        valor={cfg.assinatura.modo}
        onMudar={(modo) => setCfg({ ...cfg, assinatura: { ...cfg.assinatura, modo } })}
        opcoes={[
          { valor: 'prefixo', rotulo: 'No começo' },
          { valor: 'rodape', rotulo: 'No rodapé' },
          { valor: 'desligado', rotulo: 'Não mostrar' },
        ]}
      />
      {cfg.assinatura.modo !== 'desligado' && (
        <Segmentado
          rotulo="Como o nome aparece"
          valor={cfg.assinatura.exibicao}
          onMudar={(exibicao) => setCfg({ ...cfg, assinatura: { ...cfg.assinatura, exibicao } })}
          opcoes={[
            { valor: 'primeiro_nome', rotulo: 'Primeiro nome' },
            { valor: 'nome_completo', rotulo: 'Nome completo' },
            { valor: 'nome_e_setor', rotulo: 'Nome e setor' },
          ]}
        />
      )}
      <div className="bg-sunken max-w-md rounded-lg p-3 text-sm">
        <span className="text-muted-foreground mb-1 block text-xs">Prévia no WhatsApp</span>
        <p className="bg-secondary text-secondary-foreground rounded-md rounded-tr-sm px-3 py-2 whitespace-pre-wrap">{assinar('Oi, Rita! A guia do ISS já está no app.', usuario.nome, 'Fiscal', cfg.assinatura).replace(/\*/g, '')}</p>
      </div>
    </div>
  )
}

/** D-31 e D-33: clientes-piloto e categorias que o integrante responde sozinho; satisfação ao resolver. */
export function AtendimentoAutomatico() {
  const [cfg, setCfg] = useCfgAtendimento()
  const loja = useLoja()
  const { usuario } = useSessao()
  const admin = usuario.papel === 'administrador'
  return (
    <div className="flex flex-col gap-5">
      <CabecalhoSecao titulo="O que o integrante responde sozinho" descricao="Começa sem nenhuma categoria liberada: o integrante só sugere e uma pessoa envia (D-33). Liberadas, valem primeiro nos clientes-piloto (D-31)." />
      {!admin && <SoAdministrador />}
      <ul className="flex flex-col gap-2">
        {categoriasAtendimento.map((c) => (
          <li key={c.id}>
            <Interruptor ligado={!!cfg.categorias[c.id]} desabilitado={!admin} onMudar={(v) => setCfg({ ...cfg, categorias: { ...cfg.categorias, [c.id]: v } })} rotulo={c.rotulo} detalhe={`Ex.: ${c.exemplo}`} />
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium">Clientes-piloto</h3>
        <p className="text-muted-foreground text-xs">Nos outros, mesmo nas categorias liberadas, o integrante só sugere a resposta.</p>
        <div className="flex flex-wrap gap-1.5">
          {loja.clientes.map((k) => {
            const sel = cfg.pilotos.includes(k.id)
            return (
              <button key={k.id} type="button" disabled={!admin} aria-pressed={sel} onClick={() => setCfg({ ...cfg, pilotos: sel ? cfg.pilotos.filter((x) => x !== k.id) : [...cfg.pilotos, k.id] })} className={sel ? 'bg-primary text-primary-foreground cursor-pointer rounded-full px-3 py-1 text-xs disabled:cursor-not-allowed' : 'bg-sunken hover:bg-raised cursor-pointer rounded-full px-3 py-1 text-xs disabled:cursor-not-allowed'}>
                {k.nome}
              </button>
            )
          })}
        </div>
      </div>
      <Interruptor ligado={cfg.satisfacao} onMudar={(v) => setCfg({ ...cfg, satisfacao: v })} rotulo="Pesquisa de satisfação ao resolver" detalhe="O cliente toca uma nota de 1 a 5; a conversa reabre se ele escrever em até 7 dias." />
    </div>
  )
}

/** C2-08 · S05-A64: a caixa de e-mail de cada setor; o integrante lê entrada, enviados e anexos e arquiva no cliente certo. */
export function CaixasEmail() {
  const [caixas, setCaixas] = useCaixasEmail()
  const { usuario } = useSessao()
  const loja = useLoja()
  const admin = usuario.papel === 'administrador'
  const [conectando, setConectando] = useState<{ setor: string; passo: number } | null>(null)
  return (
    <div className="flex flex-col gap-4">
      <CabecalhoSecao titulo="Caixas de e-mail dos setores" descricao="O integrante de Atendimento lê tudo: a entrada, os enviados (inclusive o que a equipe mandou pelo Outlook ou Gmail, fora do sistema) e os anexos. Cada e-mail entra no fio do cliente certo e cada anexo vai para a pasta do cliente com o mês." />
      {!admin && <SoAdministrador />}
      <ul className="divide-border/70 flex flex-col divide-y">
        {caixas.map((c) => (
          <li key={c.setor} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 py-3 text-sm">
            <EnvelopeSimpleIcon className="text-muted-foreground size-4" />
            <span className="w-40 font-medium">{rotuloSetor[c.setor as SetorIntegrante] ?? c.setor}</span>
            <span className="min-w-0 grow basis-40 truncate">{c.endereco}</span>
            <Badge variant="outline">{c.provedor}</Badge>
            {c.conectada ? (
              <span className="text-muted-foreground flex items-center gap-1 text-xs">
                <CheckCircleIcon weight="fill" className="text-success size-4" /> lendo entrada, enviados e anexos · {c.ultimaLeitura}
              </span>
            ) : (
              <Button size="sm" variant="outline" className="rounded-full" disabled={!admin} onClick={() => setConectando({ setor: c.setor, passo: 0 })}>
                <PlugsConnectedIcon /> Conectar
              </Button>
            )}
          </li>
        ))}
      </ul>
      <Dialog open={!!conectando} onOpenChange={(v) => !v && setConectando(null)}>
        <DialogContent className="bg-surface rounded-campo border-0 p-5 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-medium">Conectar a caixa do {rotuloSetor[(conectando?.setor ?? 'fiscal') as SetorIntegrante]}</DialogTitle>
            <DialogDescription>Autorização pelo provedor (OAuth), só leitura. A senha nunca passa pela Heild.</DialogDescription>
          </DialogHeader>
          <Passos passos={['Provedor', 'Autorizar', 'O que ler']} atual={conectando?.passo ?? 0} />
          {conectando?.passo === 0 && <p className="text-sm">A caixa {caixas.find((c) => c.setor === conectando.setor)?.endereco} é do {caixas.find((c) => c.setor === conectando.setor)?.provedor}. A janela de autorização abre a seguir.</p>}
          {conectando?.passo === 1 && (
            <div className="bg-sunken rounded-lg p-4 text-sm">
              <p className="font-medium">Janela do provedor (simulada)</p>
              <p className="text-muted-foreground text-xs">A Heild quer: ler e-mails e anexos (entrada e enviados). Não envia nem apaga.</p>
              <SeloDemonstracao fonte="E-mail (Gmail, Microsoft Graph, IMAP)" />
            </div>
          )}
          {conectando?.passo === 2 && (
            <ul className="flex flex-col gap-2 text-sm">
              <li>✓ Entrada · ✓ Enviados · ✓ Anexos (arquivados no cliente pelo CNPJ e pelo remetente, com o mês)</li>
              <li className="text-muted-foreground text-xs">E-mail devolvido marca a entrega como falha e prepara o reenvio por outro canal (D-18).</li>
            </ul>
          )}
          <DialogFooter>
            <Button variant="ghost" className="rounded-full" onClick={() => setConectando(null)}>
              Cancelar
            </Button>
            <Button
              className="rounded-full"
              onClick={() => {
                if (!conectando) return
                if (conectando.passo < 2) return setConectando({ ...conectando, passo: conectando.passo + 1 })
                setCaixas((xs) => xs.map((x) => (x.setor === conectando.setor ? { ...x, conectada: true, ultimaLeitura: 'agora' } : x)))
                registrar(`${usuario.nome} conectou a caixa de e-mail do ${rotuloSetor[conectando.setor as SetorIntegrante]}`, 'conector.conectar')
                loja.toast('Caixa conectada. O integrante leu os últimos 90 dias e arquivou 214 anexos nos clientes.')
                setConectando(null)
              }}
            >
              {conectando?.passo === 2 ? 'Conectar' : 'Continuar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/** S05-A62: números bloqueados (spam, golpe), com motivo; desbloquear volta a abrir conversa. */
export function Bloqueados() {
  const [lista, setLista] = useBloqueados()
  const loja = useLoja()
  const confirmar = useConfirmar()
  return (
    <div className="flex flex-col gap-4">
      <CabecalhoSecao titulo="Números bloqueados" descricao="Mensagens de número bloqueado ficam guardadas, sem abrir conversa nem acordar o integrante. Só o Gestor bloqueia e desbloqueia." />
      {lista.length === 0 ? (
        <p className="text-muted-foreground text-sm">Nenhum número bloqueado.</p>
      ) : (
        <ul className="divide-border/70 flex flex-col divide-y">
          {lista.map((b) => (
            <li key={b.numero} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-3 text-sm">
              <ProhibitIcon className="text-destructive size-4" />
              <span className="font-medium tabular-nums">{b.numero}</span>
              <span className="text-muted-foreground min-w-0 grow basis-40 text-xs">
                {b.motivo} · por {b.por} em {b.em} · {b.mensagens} mensagens guardadas
              </span>
              <Button
                size="sm"
                variant="outline"
                className="rounded-full"
                onClick={async () => {
                  if (!(await confirmar({ titulo: `Desbloquear ${b.numero}?`, descricao: 'A próxima mensagem desse número volta a abrir conversa.', acao: 'Desbloquear' }))) return
                  setLista((xs) => xs.filter((x) => x.numero !== b.numero))
                  loja.toastDesfazer(`${b.numero} desbloqueado`, () => setLista((xs) => [...xs, b]))
                }}
              >
                Desbloquear
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/** S05-A63: aviso de privacidade, guarda de leads e retenção (04, 10.3). */
export function Privacidade() {
  const [cfg, setCfg] = useCfgAtendimento()
  const { usuario } = useSessao()
  const admin = usuario.papel === 'administrador'
  return (
    <div className="flex flex-col gap-4">
      <CabecalhoSecao titulo="Privacidade e retenção" descricao="O aviso vai na primeira mensagem a quem escreve pela primeira vez. Conversa de cliente é registro do escritório; conteúdo de lead perdido sai depois do prazo." />
      {!admin && <SoAdministrador />}
      <label className="flex flex-col gap-1 text-sm">
        Aviso de privacidade
        <CampoArea valor={cfg.aviso} onMudar={(v) => admin && setCfg({ ...cfg, aviso: v })} linhas={3} />
      </label>
      <Interruptor ligado={cfg.guardarLeads} desabilitado={!admin} onMudar={(v) => setCfg({ ...cfg, guardarLeads: v })} rotulo="Guardar conversas de leads" detalhe="Desligado, o conteúdo de lead perdido é removido no prazo abaixo; fica só o registro de que houve contato." />
      <label className="flex max-w-xs flex-col gap-1 text-sm">
        Remover conteúdo de lead perdido depois de
        <CampoEscolha
          valor={String(cfg.retencaoMeses)}
          onMudar={(v) => admin && setCfg({ ...cfg, retencaoMeses: Number(v) })}
          opcoes={[6, 12, 24, 60].map((m) => ({ valor: String(m), rotulo: `${m} meses` }))}
        />
      </label>
      <p className="text-muted-foreground text-xs">Exportação geral das conversas: só o Administrador, com registro (04, 10.3). Exportar uma conversa: Gestor, pelo menu da conversa.</p>
    </div>
  )
}

const rotuloProvedor = { cloud_api: 'Cloud API (oficial)', '360dialog': '360dialog (parceiro oficial)', gupshup: 'Gupshup (parceiro oficial)', zapi: 'Z-API (não oficial)', experimental: 'Experimental (não oficial)' }

/** S05-A54 e A53: provedor de cada número, saúde da coexistência e migração em um clique (o histórico fica). */
export function Provedores() {
  const [canais, setCanais] = usePersistente<CanalSetor[]>('crm.canais', canaisSetor)
  const [provedores, setProvedores] = useProvedores()
  const { usuario } = useSessao()
  const loja = useLoja()
  const confirmar = useConfirmar()
  const admin = usuario.papel === 'administrador'
  const [verificando, setVerificando] = useState(false)
  const comNumero = canais.filter((c) => c.numero)
  const provedorDe = (c: CanalSetor) => provedores[c.setor]?.provedor ?? (c.experimental ? 'experimental' : c.setor === 'dp' ? '360dialog' : 'cloud_api')
  return (
    <div className="flex flex-col gap-4">
      <CabecalhoSecao
        titulo="Provedor e saúde"
        descricao="Na coexistência, o app do WhatsApp no celular precisa ser aberto a cada 14 dias. Migrar de provedor ou sair do experimental é um clique e o histórico fica."
        acao={
          <Button
            size="sm"
            variant="outline"
            className="rounded-full"
            disabled={verificando}
            onClick={() => {
              setVerificando(true)
              window.setTimeout(() => {
                setVerificando(false)
                loja.toast('Saúde verificada: qualidade alta em todos os números; o do DP abre o app há 11 dias.')
              }, 1300)
            }}
          >
            <ArrowsClockwiseIcon /> {verificando ? 'Verificando…' : 'Verificar saúde'}
          </Button>
        }
      />
      {!admin && <SoAdministrador />}
      <ul className="divide-border/70 flex flex-col divide-y">
        {comNumero.map((c) => {
          const p = provedorDe(c)
          return (
            <li key={c.setor} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 py-3 text-sm">
              <span className="w-40 font-medium">{rotuloSetor[c.setor]}</span>
              <span className="tabular-nums">{c.numero}</span>
              <Badge variant={p === 'experimental' || p === 'zapi' ? 'erro' : 'outline'}>{rotuloProvedor[p]}</Badge>
              <span className="text-muted-foreground min-w-0 grow basis-40 text-xs">{provedores[c.setor] ? `desde ${provedores[c.setor].desde}` : 'qualidade alta · limite do escritório'}</span>
              {p !== 'cloud_api' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                  disabled={!admin}
                  onClick={async () => {
                    if (!(await confirmar({ titulo: `Migrar o ${rotuloSetor[c.setor]} para a Cloud API?`, descricao: 'O número, as conversas e os modelos continuam; só muda quem conecta. Comunicados voltam a ficar disponíveis.', acao: 'Migrar' }))) return
                    setProvedores((x) => ({ ...x, [c.setor]: { provedor: 'cloud_api', desde: new Date().toLocaleDateString('pt-BR') } }))
                    setCanais((xs) => xs.map((x) => (x.setor === c.setor ? { ...x, experimental: false, conexao: 'oficial (coexistência)' } : x)))
                    registrar(`${usuario.nome} migrou o número do ${rotuloSetor[c.setor]} para a Cloud API`, 'canal.migrar')
                    loja.toast(`Número do ${rotuloSetor[c.setor]} migrado; o histórico ficou.`)
                  }}
                >
                  Migrar para a Cloud API
                </Button>
              )}
            </li>
          )
        })}
      </ul>
      <SeloDemonstracao fonte="WhatsApp Cloud API (Meta)" />
    </div>
  )
}

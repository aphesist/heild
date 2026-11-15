import { ArrowsClockwiseIcon, CheckCircleIcon, CloudIcon, CopyIcon, DesktopTowerIcon, DownloadSimpleIcon, HardDrivesIcon, InfoIcon, LockKeyIcon, ProhibitIcon, ShieldCheckIcon, SpinnerIcon, WarningIcon, XIcon } from '@phosphor-icons/react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { useEffect, useState } from 'react'
import { useLoja, usePersistente } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import { Caixa } from '@/components/compostos/blocos'
import { EstadoErro, useConfirmar } from '@/components/kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Campo, CampoTexto, GavetaFormulario, Segmentado } from '@/components/ui/formulario'
import { agentesIniciais, CHAVE_AGENTES, ID_CLIENTE_OAUTH_HEILD, novoCodigoPareamento, passosWorkspace, pastasDoServidor, provedorDe, VERSAO_AGENTE, type AgenteLocal, type SistemaAgente, type TipoArmazenamento } from '@/dados/armazenamento'
import { definirEstadoConector } from '@/dados/conectores'
import type { ConectorArmazenamento } from '@/dados/configuracoes'
import { cn } from '@/lib/utils'
import { registrar } from '@/nucleo/repositorios'
import { servicos } from '@/servicos'
import { tempoRelativo } from './comum-s09'

/**
 * Armazenamento com qualquer provedor (S09b; 01, 7.1; API-24): a faixa que
 * diz onde ficam os arquivos, a janela de autorização simulada (Google,
 * Microsoft, Dropbox, Box), o passo a passo do Google Workspace (Controles
 * de API) e o servidor local com o agente Heild (pareamento por código,
 * estado, pastas compartilhadas, revogar).
 */

export function useAgentes() {
  return usePersistente<AgenteLocal[]>(CHAVE_AGENTES, agentesIniciais)
}

/** Faixa: os arquivos ficam no armazenamento do escritório; a Heild guarda só índice e texto. */
export function FaixaOndeFicam({ padrao }: { padrao?: ConectorArmazenamento }) {
  const naHeild = padrao?.tipo === 'plataforma'
  return (
    <Caixa className="flex-row flex-wrap items-start">
      <ShieldCheckIcon className="text-success size-6 shrink-0" />
      <span className="min-w-0 flex-1 basis-64 text-sm">
        <span className="block font-medium">Os arquivos ficam no armazenamento do escritório</span>
        <span className="text-muted-foreground block text-xs">
          Com Google Drive, OneDrive/SharePoint, Dropbox, Box, S3, WebDAV, SFTP ou o servidor local, os arquivos continuam lá. A Heild guarda só o índice (nome, pasta, impressão digital, quem enviou) e o texto extraído, para os integrantes lerem e buscarem. Nada é renomeado nem apagado na origem.
          {naHeild && ' Hoje o padrão para documentos novos é o armazenamento da plataforma (opcional, para quem não tem nuvem): esses ficam na Heild até você tornar outro padrão.'}
        </span>
      </span>
    </Caixa>
  )
}

/** Janela de autorização simulada (a tela do provedor por cima do sistema). */
export function JanelaAutorizacao({ tipo, workspace, liberadoPeloAdmin, onFechar, onAutorizado }: { tipo: TipoArmazenamento; workspace?: boolean; liberadoPeloAdmin?: boolean; onFechar: () => void; onAutorizado: (conta: string) => void }) {
  const p = provedorDe(tipo)
  const [estado, setEstado] = useState<'pergunta' | 'aguardando' | 'erro'>('pergunta')
  const [erro, setErro] = useState('')
  const permitir = async () => {
    setEstado('aguardando')
    try {
      const r = await servicos.nuvens.autorizar(tipo, { workspace, liberadoPeloAdmin })
      onAutorizado(r.dados.conta)
    } catch (e) {
      setEstado('erro')
      setErro(e instanceof Error ? e.message : 'O provedor não respondeu.')
    }
  }
  return (
    <DialogPrimitive.Root open onOpenChange={(v) => !v && onFechar()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[70] bg-black/40" />
        <DialogPrimitive.Content aria-describedby={undefined} className="bg-raised text-foreground shadow-cartao fixed top-1/2 left-1/2 z-[70] flex w-[min(92vw,26rem)] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-xl p-5 outline-none">
          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            <LockKeyIcon className="size-3.5" /> janela de {p.empresa} (simulada)
            <DialogPrimitive.Close asChild>
              <button type="button" aria-label="Fechar a janela" className="ml-auto cursor-pointer">
                <XIcon className="size-4" />
              </button>
            </DialogPrimitive.Close>
          </div>
          <DialogPrimitive.Title className="text-lg font-medium">Entrar com {p.empresa}</DialogPrimitive.Title>
          <p className="text-sm">
            A <strong className="font-medium">Heild</strong> quer acessar o seu {p.nome}:
          </p>
          <ul className="text-muted-foreground flex list-disc flex-col gap-1 pl-5 text-sm">
            <li>ver a lista de pastas e arquivos</li>
            <li>ler e gravar só dentro da pasta que você escolher</li>
            <li>nunca apagar nada</li>
          </ul>
          {estado === 'erro' && <EstadoErro titulo="Acesso bloqueado" descricao={erro} onTentar={() => void permitir()} />}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" className="rounded-full" onClick={onFechar}>
              Cancelar
            </Button>
            <Button className="rounded-full" disabled={estado === 'aguardando'} onClick={() => void permitir()}>
              {estado === 'aguardando' ? <SpinnerIcon className="animate-spin" /> : null} Permitir
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

/** Passo de autorização de uma nuvem OAuth, com o caminho do Google Workspace. */
export function AutorizarNuvem({ tipo, onAutorizado }: { tipo: TipoArmazenamento; onAutorizado: (r: { conta: string; workspace: boolean }) => void }) {
  const loja = useLoja()
  const p = provedorDe(tipo)
  const google = tipo === 'google_drive'
  const [conta, setConta] = useState<'pessoal' | 'workspace'>('workspace')
  const [liberado, setLiberado] = useState(false)
  const [verificando, setVerificando] = useState(false)
  const [janela, setJanela] = useState(false)
  const workspace = google && conta === 'workspace'
  return (
    <div className="flex flex-col gap-3 text-sm">
      {google && (
        <Campo rotulo="Tipo de conta Google">
          {() => (
            <Segmentado
              rotulo="Tipo de conta Google"
              valor={conta}
              onMudar={setConta}
              opcoes={[
                { valor: 'workspace', rotulo: 'Google Workspace (empresa)' },
                { valor: 'pessoal', rotulo: 'Conta pessoal (Gmail)' },
              ]}
            />
          )}
        </Campo>
      )}
      {workspace && (
        <div className="bg-sunken/60 flex flex-col gap-2 rounded-lg p-3" data-workspace>
          <span className="flex items-center gap-1.5 font-medium">
            <InfoIcon className="size-4" /> Peça ao administrador do Workspace para liberar a Heild
          </span>
          <span className="text-muted-foreground text-xs">Muitos Workspaces bloqueiam apps de terceiros. Mande este passo a passo para quem administra o Google do escritório:</span>
          <ol className="flex list-decimal flex-col gap-1 pl-5 text-xs">
            {passosWorkspace.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ol>
          <span className="flex flex-wrap items-center gap-2 text-xs">
            <code className="bg-raised rounded-sm px-2 py-1 break-all">{ID_CLIENTE_OAUTH_HEILD}</code>
            <Button type="button" size="sm" variant="ghost" className="h-7 rounded-full" onClick={() => loja.toast('ID do cliente OAuth copiado.')}>
              <CopyIcon /> Copiar ID
            </Button>
            <Button type="button" size="sm" variant="ghost" className="h-7 rounded-full" onClick={() => loja.toast('Passo a passo enviado por e-mail ao administrador do Workspace.')}>
              Enviar ao administrador
            </Button>
          </span>
          <span className="flex flex-wrap items-center gap-2">
            {liberado ? (
              <Badge variant="sucesso">liberado pelo administrador</Badge>
            ) : (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="w-fit rounded-full"
                disabled={verificando}
                onClick={async () => {
                  setVerificando(true)
                  const r = await servicos.nuvens.verificarLiberacaoWorkspace(true)
                  setVerificando(false)
                  setLiberado(r.dados.liberado)
                  loja.toast(r.dados.liberado ? 'O administrador já liberou a Heild no Workspace.' : 'Ainda não liberado.')
                }}
              >
                {verificando ? <SpinnerIcon className="animate-spin" /> : <ArrowsClockwiseIcon />} O administrador já liberou
              </Button>
            )}
          </span>
        </div>
      )}
      <p>
        Abre a janela {p.empresa === 'Microsoft' ? 'da Microsoft' : p.empresa === 'Google' ? 'do Google' : `do ${p.empresa}`} para você entrar com a conta do escritório e permitir acesso só à pasta escolhida.
      </p>
      <Button type="button" className="w-fit rounded-full" onClick={() => setJanela(true)}>
        <CloudIcon /> Autorizar acesso
      </Button>
      {janela && (
        <JanelaAutorizacao
          tipo={tipo}
          workspace={workspace}
          liberadoPeloAdmin={liberado}
          onFechar={() => setJanela(false)}
          onAutorizado={(c) => {
            setJanela(false)
            onAutorizado({ conta: c, workspace })
          }}
        />
      )}
    </div>
  )
}

/** Pareamento do agente Heild no servidor local: baixar, instalar, código e pastas compartilhadas. */
export function ParearAgente({ onPareado }: { onPareado: (a: { dispositivo: string; so: SistemaAgente; versao: string; pastas: string[] }) => void }) {
  const loja = useLoja()
  const [so, setSo] = useState<SistemaAgente>('windows')
  const [codigo] = useState(novoCodigoPareamento)
  const [fase, setFase] = useState<'instalar' | 'aguardando' | 'pastas' | 'erro'>('instalar')
  const [erro, setErro] = useState('')
  const [dispositivo, setDispositivo] = useState<{ nome: string; versao: string } | null>(null)
  const [pastas, setPastas] = useState<string[]>([])
  const aguardar = async () => {
    setFase('aguardando')
    try {
      const r = await servicos.nuvens.parearAgente(codigo, so)
      setDispositivo({ nome: r.dados.dispositivo, versao: r.dados.versao })
      setPastas([pastasDoServidor[so][0]])
      setFase('pastas')
    } catch (e) {
      setFase('erro')
      setErro(e instanceof Error ? e.message : 'O agente não respondeu.')
    }
  }
  return (
    <div className="flex flex-col gap-3 text-sm" data-agente-pareamento>
      <p className="bg-sunken/60 flex items-start gap-2 rounded-lg p-3 text-xs">
        <ShieldCheckIcon className="text-success mt-0.5 size-4 shrink-0" /> O agente só abre conexão de saída (HTTPS) para a Heild: nenhuma porta é aberta no escritório e nenhum acesso de fora chega ao servidor. Os arquivos continuam no servidor; a Heild guarda só o índice e o texto.
      </p>
      <Segmentado
        rotulo="Sistema do servidor"
        valor={so}
        onMudar={setSo}
        opcoes={[
          { valor: 'windows', rotulo: 'Windows Server' },
          { valor: 'linux', rotulo: 'Linux' },
        ]}
      />
      <ol className="flex flex-col gap-2">
        <li className="flex flex-wrap items-center gap-2">
          <span className="bg-sunken flex size-6 shrink-0 items-center justify-center rounded-full text-xs">1</span>
          Baixe e instale o agente no servidor ({so === 'windows' ? 'instalador .msi, roda como serviço' : 'pacote .deb/.rpm, roda como systemd'}).
          <Button type="button" size="sm" variant="outline" className="rounded-full" onClick={() => loja.toast(`Agente Heild ${VERSAO_AGENTE} para ${so === 'windows' ? 'Windows' : 'Linux'} baixado (demonstração).`)}>
            <DownloadSimpleIcon /> Baixar agente {VERSAO_AGENTE}
          </Button>
        </li>
        <li className="flex flex-wrap items-center gap-2">
          <span className="bg-sunken flex size-6 shrink-0 items-center justify-center rounded-full text-xs">2</span>
          Na instalação, digite o código de pareamento (vale 15 minutos, uma vez só):
          <code className="bg-raised shadow-contorno rounded-md px-3 py-1 font-mono text-base tracking-widest" aria-label="Código de pareamento">
            {codigo}
          </code>
        </li>
      </ol>
      {fase === 'instalar' && (
        <Button type="button" className="w-fit rounded-full" onClick={() => void aguardar()}>
          <DesktopTowerIcon /> Já instalei, aguardar o agente
        </Button>
      )}
      {fase === 'aguardando' && (
        <p className="text-muted-foreground flex items-center gap-2" role="status">
          <SpinnerIcon className="size-4 animate-spin" /> Aguardando o agente usar o código…
        </p>
      )}
      {fase === 'erro' && <EstadoErro titulo="O agente não pareou" descricao={erro} onTentar={() => void aguardar()} />}
      {fase === 'pastas' && dispositivo && (
        <div className="flex flex-col gap-2">
          <p className="text-success flex items-center gap-1.5">
            <CheckCircleIcon weight="fill" className="size-4" /> {dispositivo.nome} pareado · agente {dispositivo.versao}
          </p>
          <span className="font-medium">Pastas que a Heild pode ler e gravar</span>
          <ul className="flex flex-col gap-1">
            {pastasDoServidor[so].map((pasta) => (
              <li key={pasta}>
                <label className="flex cursor-pointer items-center gap-2">
                  <input type="checkbox" className="accent-foreground size-4" checked={pastas.includes(pasta)} onChange={(e) => setPastas((xs) => (e.target.checked ? [...xs, pasta] : xs.filter((x) => x !== pasta)))} />
                  <code className="text-xs">{pasta}</code>
                </label>
              </li>
            ))}
          </ul>
          <Button type="button" className="w-fit rounded-full" disabled={!pastas.length} onClick={() => onPareado({ dispositivo: dispositivo.nome, so, versao: dispositivo.versao, pastas })}>
            Usar estas pastas
          </Button>
        </div>
      )}
    </div>
  )
}

/** Cartão do agente dentro de "Onde ficam os documentos": estado, versão, sincronização, pastas, revogar. */
export function CartaoAgente({ agenteId, onRevogado }: { agenteId: string; onRevogado: () => void }) {
  const loja = useLoja()
  const { usuario } = useSessao()
  const confirmar = useConfirmar()
  const [agentes, setAgentes] = useAgentes()
  const [editando, setEditando] = useState(false)
  const [revogando, setRevogando] = useState(false)
  const a = agentes.find((x) => x.id === agenteId)
  const [, setTique] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setTique((n) => n + 1), 30_000)
    return () => clearInterval(t)
  }, [])
  if (!a) return null
  const revogado = !!a.revogado_em
  const revogar = async () => {
    const ok = await confirmar({
      titulo: `Revogar ${a.dispositivo}?`,
      descricao: 'O agente perde o acesso na próxima conexão e para de sincronizar. Os arquivos continuam no servidor e o índice fica guardado; para voltar, pareie de novo com um código novo.',
      acao: 'Revogar dispositivo',
      perigo: true,
    })
    if (!ok) return
    setRevogando(true)
    try {
      const r = await servicos.nuvens.revogarAgente(a.id)
      setAgentes((xs) => xs.map((x) => (x.id === a.id ? { ...x, online: false, revogado_em: r.dados.revogado_em, revogado_por: usuario.nome } : x)))
      definirEstadoConector('servidor_local', { estado: 'desconectado', mensagem: `Agente ${a.dispositivo} revogado por ${usuario.nome}.` })
      registrar(`${usuario.nome} revogou o agente do servidor local ${a.dispositivo}`, 'armazenamento.agente.revogar')
      loja.toast(`${a.dispositivo} revogado. O agente não conecta mais.`)
      onRevogado()
    } catch (e) {
      loja.toastErro(e instanceof Error ? e.message : 'Não foi possível revogar.')
    } finally {
      setRevogando(false)
    }
  }
  return (
    <div className="bg-raised/60 flex flex-col gap-2 rounded-md p-2.5 text-xs" data-agente={a.id}>
      <span className="flex flex-wrap items-center gap-2">
        <HardDrivesIcon className="size-4" />
        <span className="font-medium">{a.dispositivo}</span>
        <span className="text-muted-foreground">
          {a.so === 'windows' ? 'Windows' : 'Linux'} · agente {a.versao}
        </span>
        {revogado ? (
          <Badge variant="outline">revogado</Badge>
        ) : a.online ? (
          <Badge variant="sucesso">
            <span aria-hidden className="bg-success size-1.5 rounded-full" /> online
          </Badge>
        ) : (
          <Badge variant="erro">
            <span aria-hidden className="bg-destructive size-1.5 rounded-full" /> offline
          </Badge>
        )}
      </span>
      <span className="text-muted-foreground">
        {revogado ? `revogado por ${a.revogado_por} em ${new Date(a.revogado_em!).toLocaleString('pt-BR')}` : `última sincronização ${tempoRelativo(a.ultima_sincronizacao)} · ${a.arquivos.toLocaleString('pt-BR')} arquivos · pareado por ${a.pareado_por} em ${new Date(a.pareado_em).toLocaleDateString('pt-BR')}`}
      </span>
      {!revogado && !a.online && (
        <span className="text-destructive flex items-start gap-1">
          <WarningIcon className="mt-0.5 size-3.5 shrink-0" /> O servidor está desligado ou sem internet. Os documentos continuam no índice; abrir e gravar volta quando o agente reconectar.
        </span>
      )}
      <span className="flex flex-wrap gap-1">
        {a.pastas.map((p) => (
          <code key={p} className="bg-sunken rounded-full px-2 py-0.5">
            {p}
          </code>
        ))}
      </span>
      {!revogado && (
        <span className="flex flex-wrap gap-1">
          <Button size="sm" variant="ghost" className="h-7 rounded-full" onClick={() => setEditando(true)}>
            Pastas compartilhadas
          </Button>
          <Button size="sm" variant="ghost" className="text-destructive h-7 rounded-full" disabled={revogando} onClick={() => void revogar()}>
            <ProhibitIcon /> Revogar dispositivo
          </Button>
        </span>
      )}
      {editando && <EditarPastas a={a} onFechar={() => setEditando(false)} onSalvar={(pastas) => (setAgentes((xs) => xs.map((x) => (x.id === a.id ? { ...x, pastas } : x))), setEditando(false), loja.toast('Pastas compartilhadas atualizadas. O agente aplica na próxima sincronização.'))} />}
    </div>
  )
}

function EditarPastas({ a, onFechar, onSalvar }: { a: AgenteLocal; onFechar: () => void; onSalvar: (p: string[]) => void }) {
  const [pastas, setPastas] = useState(a.pastas)
  const [outra, setOutra] = useState('')
  const opcoes = [...new Set([...pastasDoServidor[a.so], ...a.pastas])]
  return (
    <GavetaFormulario aberta onFechar={onFechar} titulo={`Pastas de ${a.dispositivo}`} descricao="Só estas pastas são lidas e gravadas pelo agente. Tirar uma pasta tira os arquivos dela da busca (o índice fica no histórico)." acao="Salvar" acaoDesabilitada={!pastas.length} onAcao={() => onSalvar(pastas)}>
      <ul className="flex flex-col gap-1.5 text-sm">
        {opcoes.map((p) => (
          <li key={p}>
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" className="accent-foreground size-4" checked={pastas.includes(p)} onChange={(e) => setPastas((xs) => (e.target.checked ? [...xs, p] : xs.filter((x) => x !== p)))} />
              <code className="text-xs">{p}</code>
            </label>
          </li>
        ))}
      </ul>
      <Campo rotulo="Outra pasta do servidor" ajuda="Caminho completo, como o servidor mostra.">
        {(id) => (
          <span className="flex gap-2">
            <CampoTexto id={id} valor={outra} onMudar={setOutra} mono />
            <Button type="button" variant="outline" className="rounded-full" disabled={!outra.trim()} onClick={() => (setPastas((xs) => [...new Set([...xs, outra.trim()])]), setOutra(''))}>
              Incluir
            </Button>
          </span>
        )}
      </Campo>
    </GavetaFormulario>
  )
}

export const iconeProvedor = (tipo: TipoArmazenamento, className = 'text-muted-foreground size-5') => (tipo === 'servidor_local' ? <HardDrivesIcon className={className} /> : <CloudIcon className={cn(className)} />)

import { BellSlashIcon, ChatsTeardropIcon, EyeIcon, GearSixIcon, PaperclipIcon, UserCircleIcon } from '@phosphor-icons/react'
import { useMemo, useState } from 'react'
import { useDocumentos } from '@/ambiente/documentos'
import { useAcoesInternas, useInvestigacoes, useMinhasConversasInternas, usePreferenciasInternas, useRotuloConversa, useSincronizarCanais } from '@/ambiente/interna'
import { useLoja, useNavegacao } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import { EstadoVazio, useConfirmar } from '@/components/kit'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CampoTexto, Interruptor, Segmentado } from '@/components/ui/formulario'
import { ItemMenu, Menu, RotuloMenu } from '@/components/ui/menu'
import { extrasDe, quando } from '@/dados/interna'
import { useMedia } from '@/hooks/useMedia'
import { cn } from '@/lib/utils'
import type { Id } from '@/nucleo/modelo/entidades'
import { useTabela } from '@/nucleo/react'
import { useItemNaRota } from '@/nucleo/rotas'
import { AvisoPrimeiroUso } from './AvisoPrimeiroUso'
import { useJanelaFlutuante } from './JanelaFlutuante'
import { ListaInternas } from './ListaInternas'
import { DialogoNovaConversa } from './NovaConversa'
import { PainelConversa } from './PainelConversa'

/**
 * Conversas internas em tela cheia (`#/interna`; S05-T05): lista em três
 * grupos, a conversa com fio e detalhes ao lado; aba Arquivos com tudo o que
 * a equipe anexou. Abre pelo botão Chat (não há item na barra lateral).
 */
export function ConversasInternasTela({ aba = 'conversas', conversaInicial }: { aba?: string; conversaInicial?: string }) {
  useSincronizarCanais()
  const { usuario } = useSessao()
  const conversas = useMinhasConversasInternas()
  const todas = useTabela('conversa_interna')
  const [investigacoes] = useInvestigacoes()
  const [conversa, setConversa] = useState<Id | null>(conversaInicial ?? null)
  const [destaque, setDestaque] = useState<Id | null>(null)
  const [nova, setNova] = useState<'pessoal' | 'grupo' | null>(null)
  const [, setFlutuante] = useJanelaFlutuante()
  const largo = useMedia('(min-width: 768px)')
  const nav = useNavegacao()
  useItemNaRota({ conversaInterna: conversa ?? undefined })
  const investigada = usuario.papel === 'administrador' ? investigacoes.find((i) => i.conversa === conversa) : undefined
  const aberta = conversas.find((c) => c.id === conversa) ?? (investigada ? todas.find((c) => c.id === conversa) : undefined) ?? (largo && !conversaInicial ? conversas.find((c) => c.tipo === 'canal_geral') : undefined)

  if (aba === 'arquivos') return <ArquivosInternos onAbrir={(id) => nav.irPara({ modulo: 'interna', aba: 'conversas', conversaInterna: id })} />

  return (
    <div className="h-full px-2 pb-2 sm:px-4 sm:pb-4">
      <AvisoPrimeiroUso />
      <div className="bg-surface shadow-painel relative flex h-full overflow-hidden rounded-[24px] sm:rounded-[34px]">
        <section aria-label="Conversas internas" className={cn('flex w-full shrink-0 flex-col border-r md:w-80 lg:w-96', aberta && !largo && 'hidden')}>
          <div className="flex items-center gap-2 px-4 pt-4">
            <ChatsTeardropIcon className="text-muted-foreground size-5" />
            <h1 className="flex-1 text-base font-medium">Conversas internas</h1>
            <Preferencias onInvestigar={(id) => setConversa(id)} />
          </div>
          <ListaInternas
            ativa={aberta?.id}
            onAbrir={(id, m) => {
              setDestaque(m ?? null)
              setConversa(id)
            }}
            onNova={setNova}
          />
        </section>
        {aberta ? (
          <section aria-label="Conversa" className="relative flex min-w-0 flex-1 flex-col">
            <PainelConversa
              key={`${aberta.id}-${destaque ?? ''}`}
              conversa={aberta}
              destaque={destaque}
              investigacao={investigada ? { motivo: investigada.motivo, por: investigada.por_nome } : null}
              onVoltar={largo ? undefined : () => setConversa(null)}
              onFlutuante={() => setFlutuante({ conversa: aberta.id, minimizada: false })}
            />
          </section>
        ) : (
          largo && <EstadoVazio className="flex-1" icone={ChatsTeardropIcon} titulo="Escolha uma conversa" descricao="Ou comece com um colega. O canal do seu setor e o Geral já estão na lista." />
        )}
      </div>
      <DialogoNovaConversa tipo={nova} onFechar={() => setNova(null)} onCriada={setConversa} />
    </div>
  )
}

/** Presença, horário de silêncio e, para o Administrador, a abertura em investigação (11, 3 e 5). */
function Preferencias({ onInvestigar }: { onInvestigar: (id: Id) => void }) {
  const { usuario } = useSessao()
  const loja = useLoja()
  const prefs = usePreferenciasInternas()
  const acoes = useAcoesInternas()
  const confirmar = useConfirmar()
  const rotulo = useRotuloConversa()
  const [investigacoes, setInvestigacoes] = useInvestigacoes()
  const todas = useTabela('conversa_interna')
  const tPart = useTabela('participacao')
  const [silencio, setSilencio] = useState(false)
  const [investigar, setInvestigar] = useState(false)
  const alheias = useMemo(() => todas.filter((c) => c.tipo === 'pessoal' && !tPart.some((p) => p.conversa_interna_id === c.id && p.usuario_id === usuario.id)), [todas, tPart, usuario.id])
  return (
    <>
      <Menu
        align="end"
        gatilho={
          <Button size="icon-sm" variant="ghost" className="rounded-full" aria-label="Preferências da comunicação interna">
            <GearSixIcon />
          </Button>
        }
      >
        <RotuloMenu>Minha presença</RotuloMenu>
        <ItemMenu icone={<UserCircleIcon />} onClick={() => prefs.setPresenca('disponivel')} detalhe={prefs.presenca === 'disponivel' ? 'agora' : undefined}>
          Disponível
        </ItemMenu>
        <ItemMenu icone={<UserCircleIcon />} onClick={() => prefs.setPresenca('ausente')} detalhe={prefs.presenca === 'ausente' ? 'agora' : undefined}>
          Ausente
        </ItemMenu>
        <RotuloMenu>Avisos</RotuloMenu>
        <ItemMenu icone={<BellSlashIcon />} onClick={() => setSilencio(true)} detalhe={prefs.silencio.ligado ? `${prefs.silencio.de}–${prefs.silencio.ate}` : 'desligado'}>
          Horário de silêncio
        </ItemMenu>
        {usuario.papel === 'administrador' && (
          <>
            <RotuloMenu>Auditoria</RotuloMenu>
            <ItemMenu icone={<EyeIcon />} onClick={() => setInvestigar(true)} detalhe="com motivo">
              Abrir conversa pessoal em investigação
            </ItemMenu>
          </>
        )}
      </Menu>
      <Dialog open={silencio} onOpenChange={setSilencio}>
        <DialogContent className="bg-surface rounded-[24px] border-0 p-5 sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-medium">Horário de silêncio</DialogTitle>
            <DialogDescription>Nesse horário, a comunicação interna não avisa no sistema nem no celular. As mensagens continuam chegando.</DialogDescription>
          </DialogHeader>
          <Interruptor ligado={prefs.silencio.ligado} onMudar={(v) => prefs.setSilencio({ ...prefs.silencio, ligado: v })} rotulo="Ligar horário de silêncio" />
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-xs">
              Das
              <CampoTexto tipo="time" valor={prefs.silencio.de} onMudar={(v) => prefs.setSilencio({ ...prefs.silencio, de: v })} aria-label="Início do silêncio" />
            </label>
            <label className="flex flex-col gap-1 text-xs">
              Até
              <CampoTexto tipo="time" valor={prefs.silencio.ate} onMudar={(v) => prefs.setSilencio({ ...prefs.silencio, ate: v })} aria-label="Fim do silêncio" />
            </label>
          </div>
          <DialogFooter>
            <Button className="rounded-full" onClick={() => setSilencio(false)}>
              Pronto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={investigar} onOpenChange={setInvestigar}>
        <DialogContent className="bg-surface rounded-[24px] border-0 p-5 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-medium">Abrir conversa pessoal em investigação</DialogTitle>
            <DialogDescription>Só em caso sério. A abertura exige motivo escrito, fica registrada nos eventos e os participantes são avisados (11, 5). O conteúdo não aparece aqui antes da abertura.</DialogDescription>
          </DialogHeader>
          <ul className="flex max-h-72 flex-col gap-1 overflow-y-auto">
            {alheias.length === 0 && <li className="text-muted-foreground py-4 text-center text-sm">Não há conversas pessoais de outras pessoas.</li>}
            {alheias.map((c) => {
              const ja = investigacoes.find((i) => i.conversa === c.id)
              return (
                <li key={c.id} className="flex items-center gap-2 rounded-[12px] px-2 py-1.5 text-sm">
                  <span className="min-w-0 flex-1 truncate">{rotulo(c)}</span>
                  <Button
                    size="sm"
                    variant={ja ? 'ghost' : 'outline'}
                    className="rounded-full"
                    onClick={async () => {
                      if (ja) {
                        setInvestigar(false)
                        onInvestigar(c.id)
                        return
                      }
                      const motivo = await confirmar({ titulo: `Abrir a conversa de ${rotulo(c)}?`, descricao: 'Os dois serão avisados com o seu nome e o motivo.', acao: 'Abrir em investigação', perigo: true, exigirMotivo: true, rotuloMotivo: 'Motivo da investigação' })
                      if (typeof motivo !== 'string' || !motivo.trim()) return
                      try {
                        acoes.investigar(c.id, motivo, (i) => setInvestigacoes((x) => [...x, i]))
                        loja.toast('Conversa aberta em investigação; os participantes foram avisados.')
                        setInvestigar(false)
                        onInvestigar(c.id)
                      } catch (e) {
                        loja.toastErro(e instanceof Error ? e.message : String(e))
                      }
                    }}
                  >
                    {ja ? 'Ver de novo' : 'Abrir…'}
                  </Button>
                </li>
              )
            })}
          </ul>
        </DialogContent>
      </Dialog>
    </>
  )
}

/** Aba Arquivos: tudo o que a equipe anexou nas conversas que a pessoa vê (origem "comunicação interna"). */
function ArquivosInternos({ onAbrir }: { onAbrir: (conversa: Id, mensagem: Id) => void }) {
  const conversas = useMinhasConversasInternas()
  const rotulo = useRotuloConversa()
  const acoes = useAcoesInternas()
  const docs = useDocumentos()
  const tMsg = useTabela('mensagem_interna')
  const [filtro, setFiltro] = useState<'todos' | 'pessoais' | 'canais'>('todos')
  const ids = new Set(conversas.filter((c) => filtro === 'todos' || (filtro === 'pessoais' ? c.tipo === 'pessoal' || c.tipo === 'grupo' : c.tipo.startsWith('canal'))).map((c) => c.id))
  const anexos = tMsg
    .filter((m) => ids.has(m.conversa_interna_id))
    .flatMap((m) => (extrasDe(m).anexos ?? []).map((a) => ({ ...a, m })))
    .sort((a, b) => b.m.criado_em.localeCompare(a.m.criado_em))
  return (
    <div className="area-rolagem h-full overflow-y-auto px-3 pb-6 sm:px-5">
      <div className="mx-auto flex max-w-5xl flex-col gap-4">
        <header className="flex flex-wrap items-end justify-between gap-3 pt-2">
          <div>
            <h1 className="text-3xl font-light tracking-tight">Arquivos das conversas</h1>
            <p className="text-muted-foreground text-sm">Anexos da comunicação interna. Ficam também em Arquivos, com a origem "comunicação interna", e não se apagam.</p>
          </div>
          <Segmentado
            rotulo="Filtrar anexos"
            valor={filtro}
            onMudar={setFiltro}
            opcoes={[
              { valor: 'todos', rotulo: 'Todos' },
              { valor: 'pessoais', rotulo: 'Pessoais e grupos' },
              { valor: 'canais', rotulo: 'Canais' },
            ]}
          />
        </header>
        <div className="bg-surface shadow-painel overflow-hidden rounded-[24px]">
          {anexos.length === 0 ? (
            <EstadoVazio icone={PaperclipIcon} titulo="Nenhum anexo ainda" descricao="O que a equipe anexar nas conversas aparece aqui." />
          ) : (
            <ul className="divide-y">
              {anexos.map((a, i) => {
                const c = conversas.find((x) => x.id === a.m.conversa_interna_id)!
                return (
                  <li key={i} className="flex items-center gap-3 px-4 py-3">
                    <span className="bg-sunken text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-full">
                      <PaperclipIcon className="size-4" />
                    </span>
                    <button type="button" className="min-w-0 flex-1 cursor-pointer text-left" onClick={() => docs.abrir(a.nome)}>
                      <span className="block truncate text-sm font-medium">{a.nome}</span>
                      <span className="text-muted-foreground block truncate text-xs">
                        {acoes.nomeDe(a.m.autor_id)} · {quando(a.m.criado_em)} · {a.tamanho}
                      </span>
                    </button>
                    <Button size="sm" variant="ghost" className="shrink-0 rounded-full" onClick={() => onAbrir(c.id, a.m.id)}>
                      {rotulo(c)}
                    </Button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

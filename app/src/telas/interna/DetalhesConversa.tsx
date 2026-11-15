import { PaperclipIcon, PencilSimpleIcon, SignOutIcon, UserPlusIcon, XIcon } from '@phosphor-icons/react'
import { useMemo, useState } from 'react'
import { useDocumentos } from '@/ambiente/documentos'
import { useAcoesInternas, usePreferenciasInternas, usePresenca, useResumoDaManha, rotuloPresenca } from '@/ambiente/interna'
import { useLoja } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import { EdicaoEmLinha, useConfirmar } from '@/components/kit'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Interruptor } from '@/components/ui/formulario'
import { extrasDe, quando, rotuloTipo } from '@/dados/interna'
import type { ConversaInterna } from '@/nucleo/modelo/entidades'
import { useTabela } from '@/nucleo/react'
import { EscolherPessoas } from './NovaConversa'
import { PontoPresenca } from './pecas'
import { AreaRolagem } from '@/components/ui/area-rolagem'

/** Detalhes da conversa (11, 2 e 3): participantes com entrada e saída, nome do grupo, arquivos, silêncio e gatilhos. */
export function DetalhesConversa({ conversa, onFechar }: { conversa: ConversaInterna; onFechar: () => void }) {
  const { usuario, permissoes } = useSessao()
  const loja = useLoja()
  const acoes = useAcoesInternas()
  const presenca = usePresenca()
  const prefs = usePreferenciasInternas()
  const confirmar = useConfirmar()
  const docs = useDocumentos()
  const [resumoManha, setResumoManha] = useResumoDaManha()
  const [adicionando, setAdicionando] = useState(false)
  const [novos, setNovos] = useState<string[]>([])
  const tPart = useTabela('participacao')
  const tMsg = useTabela('mensagem_interna')
  const participacoes = useMemo(() => tPart.filter((p) => p.conversa_interna_id === conversa.id).sort((a, b) => a.entrou_em.localeCompare(b.entrou_em)), [tPart, conversa.id])
  const ativos = participacoes.filter((p) => !p.saiu_em)
  const anexos = tMsg.filter((m) => m.conversa_interna_id === conversa.id).flatMap((m) => (extrasDe(m).anexos ?? []).map((a) => ({ ...a, por: acoes.nomeDe(m.autor_id), em: m.criado_em })))
  const participo = ativos.some((p) => p.usuario_id === usuario.id)
  const geraOSetor = conversa.tipo === 'canal_setor' && (usuario.papel === 'administrador' || (permissoes.gere as string[]).includes(conversa.setor_id ?? ''))
  const exec = (f: () => void) => {
    try {
      f()
    } catch (e) {
      loja.toastErro(e instanceof Error ? e.message : String(e))
    }
  }
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-2 border-b px-3 py-2">
        <span className="flex-1 text-sm font-medium">Detalhes</span>
        <Button size="icon-sm" variant="ghost" className="rounded-full" aria-label="Fechar os detalhes" onClick={onFechar}>
          <XIcon />
        </Button>
      </div>
      <AreaRolagem className="flex flex-1 flex-col gap-5 p-4 text-sm">
        <section className="flex flex-col gap-1">
          <span className="text-muted-foreground text-xs">{rotuloTipo[conversa.tipo]}</span>
          {conversa.tipo === 'grupo' && participo ? (
            <EdicaoEmLinha valor={conversa.nome ?? ''} rotulo="Nome do grupo" onSalvar={(v) => acoes.renomear(conversa.id, v)} validar={(v) => (v.trim() ? null : 'O grupo precisa de um nome.')} />
          ) : (
            <span className="font-medium">{conversa.tipo === 'pessoal' ? 'Fechada entre os dois' : conversa.nome}</span>
          )}
          {conversa.tipo === 'canal_setor' && <span className="text-muted-foreground text-xs">Quem tem o setor entra e sai sozinho, conforme a conta muda. O integrante do setor lê só para responder quando chamado.</span>}
          {conversa.tipo === 'canal_geral' && <span className="text-muted-foreground text-xs">Toda a equipe do escritório. O Gestor fixa avisos no topo.</span>}
        </section>

        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium tracking-wide uppercase">Participantes · {ativos.length}</h3>
            {conversa.tipo === 'grupo' && participo && (
              <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setAdicionando((v) => !v)}>
                <UserPlusIcon /> Adicionar
              </Button>
            )}
          </div>
          {adicionando && (
            <div className="bg-sunken flex flex-col gap-2 rounded-[14px] p-2">
              <EscolherPessoas escolhidas={novos} onMudar={setNovos} excluir={ativos.map((p) => p.usuario_id)} />
              <Button
                size="sm"
                className="self-end rounded-full"
                disabled={!novos.length}
                onClick={() =>
                  exec(() => {
                    acoes.adicionar(conversa.id, novos)
                    setNovos([])
                    setAdicionando(false)
                  })
                }
              >
                Adicionar {novos.length || ''}
              </Button>
            </div>
          )}
          <ul className="flex flex-col gap-1.5">
            {participacoes.map((p) => (
              <li key={p.id} className={p.saiu_em ? 'text-muted-foreground flex items-center gap-2.5' : 'flex items-center gap-2.5'}>
                <span className="relative inline-flex shrink-0">
                  <Avatar nome={acoes.nomeDe(p.usuario_id)} tamanho="sm" />
                  {!p.saiu_em && <PontoPresenca presenca={presenca(p.usuario_id)} className="absolute -right-0.5 -bottom-0.5 size-2" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{acoes.nomeDe(p.usuario_id)}{p.usuario_id === usuario.id ? ' (você)' : ''}</span>
                  <span className="text-muted-foreground block text-[11px]">
                    {p.saiu_em ? `entrou ${quando(p.entrou_em)} · saiu ${quando(p.saiu_em)}` : `${rotuloPresenca[presenca(p.usuario_id)]} · entrou ${quando(p.entrou_em)}${p.extras?.automatica ? ' (pelo setor)' : ''}`}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-2">
          <h3 className="text-xs font-medium tracking-wide uppercase">Avisos</h3>
          <Interruptor ligado={prefs.silenciadas.includes(conversa.id)} onMudar={() => prefs.alternarSilencio(conversa.id)} rotulo="Silenciar esta conversa" detalhe="Não soma no contador do Chat e não avisa no celular." />
          {geraOSetor && (
            <Interruptor
              ligado={!!resumoManha[conversa.id]}
              onMudar={(v) => {
                setResumoManha((x) => ({ ...x, [conversa.id]: v }))
                if (v && conversa.setor_id) {
                  loja.toast('Resumo da manhã ligado: o integrante posta todo dia às 8h. O de hoje sai agora.')
                }
              }}
              rotulo="Resumo da manhã do integrante"
              detalhe="Vencimentos do dia e cartões esperando aprovação, postados no canal (gatilho do escritório)."
            />
          )}
        </section>

        <section className="flex flex-col gap-2">
          <h3 className="text-xs font-medium tracking-wide uppercase">Arquivos da conversa · {anexos.length}</h3>
          {anexos.length === 0 ? (
            <p className="text-muted-foreground text-xs">Nenhum anexo. O que for anexado vai para Arquivos com a origem "comunicação interna" e não se apaga.</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {anexos.map((a, i) => (
                <li key={i}>
                  <button type="button" onClick={() => docs.abrir(a.nome)} className="hover:bg-sunken flex w-full cursor-pointer items-center gap-2 rounded-[12px] px-2 py-1.5 text-left">
                    <PaperclipIcon className="text-muted-foreground size-4" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm">{a.nome}</span>
                      <span className="text-muted-foreground block text-[11px]">
                        {a.por} · {quando(a.em)} · {a.tamanho}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {conversa.tipo === 'grupo' && participo && (
          <Button
            variant="outline"
            className="text-destructive self-start rounded-full"
            onClick={async () => {
              const ok = await confirmar({ titulo: 'Sair do grupo?', descricao: 'Sua saída fica registrada e o histórico continua no grupo. Alguém do grupo pode adicionar você de novo.', acao: 'Sair do grupo', perigo: true })
              if (ok) exec(() => acoes.sair(conversa.id))
            }}
          >
            <SignOutIcon /> Sair do grupo
          </Button>
        )}
        {conversa.tipo === 'grupo' && !participo && <p className="text-muted-foreground text-xs">Você saiu deste grupo. O histórico fica.</p>}
        <p className="text-muted-foreground flex items-start gap-1.5 text-[11px]">
          <PencilSimpleIcon className="mt-0.5 size-3 shrink-0" /> Mensagens são registro do escritório: não se apagam, nem pelo Administrador. Editar guarda a versão anterior.
        </p>
      </AreaRolagem>
    </div>
  )
}

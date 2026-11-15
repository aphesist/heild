import { CheckIcon, ChecksIcon, DeviceMobileIcon, EnvelopeSimpleIcon, FileTextIcon, GearSixIcon, MicrophoneIcon, NotePencilIcon, WarningCircleIcon, WhatsappLogoIcon } from '@phosphor-icons/react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Orb } from '@/components/ui/orb'
import { Tooltip } from '@/components/ui/tooltip'
import type { CanalCrm, Entrega, ItemConversa } from '@/dados/crm'
import { rotuloCanal } from '@/dados/crm'
import { useAparencia } from '@/hooks/useAparencia'
import { cn } from '@/lib/utils'

export function IconeCanal({ canal, className }: { canal: CanalCrm; className?: string }) {
  const c = cn('size-3.5 shrink-0', className)
  if (canal === 'whatsapp') return <WhatsappLogoIcon className={c} aria-label="WhatsApp" />
  if (canal === 'email') return <EnvelopeSimpleIcon className={c} aria-label="E-mail" />
  return <DeviceMobileIcon className={c} aria-label="App" />
}

function StatusEntrega({ entrega }: { entrega?: Entrega }) {
  if (!entrega) return null
  if (entrega === 'falhou')
    return (
      <span className="text-destructive-text flex items-center gap-0.5">
        <WarningCircleIcon className="size-3.5" /> falhou
      </span>
    )
  const Icone = entrega === 'enviada' ? CheckIcon : ChecksIcon
  return (
    <Tooltip conteudo={entrega}>
      <Icone className={cn('size-3.5', entrega === 'lida' && 'text-success-text')} aria-label={entrega} />
    </Tooltip>
  )
}

/**
 * Um item do histórico unificado (04, 4.2): mensagem de qualquer canal (do
 * cliente à esquerda; do escritório à direita), mensagem automática, resposta
 * do integrante, nota interna, marco, cartão. Orbs sempre parados aqui.
 */
export function ItemHistorico({ item, onDecidir, onAbrirAnexo, onReenviar }: { item: ItemConversa; onDecidir?: (id: string, acao: string) => void; /** Abre o anexo no visualizador (o mesmo arquivo que está em Arquivos). */ onAbrirAnexo?: (nome: string) => void; /** S05: farol vermelho ou e-mail devolvido prepara o reenvio por outro canal (D-17, D-18). */ onReenviar?: (id: string) => void }) {
  const aparencia = useAparencia()

  if (item.tipo === 'dia')
    return (
      <div className="flex justify-center py-1">
        <span className="bg-sunken text-muted-foreground rounded-full px-3 py-0.5 text-xs">{item.texto}</span>
      </div>
    )

  if (item.tipo === 'marco')
    return (
      <div className="text-muted-foreground flex items-center gap-3 text-xs">
        <span className="bg-border h-px flex-1" />
        <span className="text-center">
          {item.texto} · {item.hora}
        </span>
        <span className="bg-border h-px flex-1" />
      </div>
    )

  if (item.tipo === 'nota')
    return (
      <div className="bg-warning/10 mx-auto flex w-full max-w-[90%] gap-2.5 rounded-[14px] px-3 py-2 text-sm">
        <NotePencilIcon weight="duotone" className="text-warning mt-0.5 size-4 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="text-muted-foreground text-xs">
            nota interna · {item.autor} · {item.hora} · nunca sai para o cliente
          </div>
          <p>{item.texto}</p>
        </div>
      </div>
    )

  if (item.tipo === 'cartao') {
    const t = aparencia({ setor: item.setor })
    return (
      <div className="bg-raised shadow-cartao mx-auto flex w-full max-w-[90%] flex-col gap-2 rounded-[16px] p-3">
        <div className="flex items-center gap-2">
          <Orb cor={t.cor} corOlhos={t.corOlhos} estado="precisa_de_voce" tamanho={22} cutucavel={false} extras={false} />
          <span className="text-sm font-medium">{t.nome} propõe</span>
          <span className="text-muted-foreground ml-auto text-[11px]">cartão · {item.hora}</span>
        </div>
        <div>
          <div className="text-sm font-medium">{item.titulo}</div>
          <p className="text-muted-foreground text-xs">{item.detalhe}</p>
        </div>
        {item.decidido ? (
          <Badge variant={item.decidido === item.acoes[0] ? 'sucesso' : 'outline'}>
            {item.decidido === item.acoes[0] && <CheckIcon />} {item.decidido}
          </Badge>
        ) : (
          <div className="flex gap-2">
            <Button size="sm" className="rounded-full" onClick={() => onDecidir?.(item.id, item.acoes[0])}>
              {item.acoes[0]}
            </Button>
            <Button size="sm" variant="ghost" className="rounded-full" onClick={() => onDecidir?.(item.id, item.acoes[1])}>
              {item.acoes[1]}
            </Button>
          </div>
        )}
      </div>
    )
  }

  // Mensagem movida para outra conversa (S05-A16): fica o registro, sem o conteúdo repetido.
  if (item.movidaPara)
    return (
      <div className="text-muted-foreground flex items-center gap-2 self-start text-xs">
        <IconeCanal canal={item.canal} /> mensagem de {item.autor ?? 'cliente'} ({item.hora}) movida para {item.movidaPara}
      </div>
    )

  // Mensagem
  const doCliente = item.de === 'cliente'
  const t = item.de === 'integrante' && item.setor ? aparencia({ setor: item.setor }) : undefined
  return (
    <div className={cn('flex flex-col gap-1', doCliente ? 'items-start' : 'items-end')}>
      <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
        {t && <Orb cor={t.cor} corOlhos={t.corOlhos} tamanho={16} cutucavel={false} extras={false} />}
        {item.de === 'auto' && <GearSixIcon className="size-3.5" />}
        <span>{item.de === 'auto' ? `mensagem automática · modelo ${item.modelo}` : item.de === 'integrante' ? `${t?.nome ?? item.autor} (integrante)` : (item.autor ?? 'cliente')}</span>
        <span>·</span>
        <IconeCanal canal={item.canal} />
        <span>{item.hora}</span>
      </div>
      <div
        className={cn(
          // Raio fixo de balão (não o do tema, que dobrado vira pílula e engole o texto).
          'flex max-w-[85%] flex-col gap-2 rounded-[18px] px-4 py-3 text-sm leading-relaxed sm:max-w-[72%]',
          doCliente ? 'bg-raised shadow-contorno rounded-tl-[6px]' : item.de === 'auto' ? 'bg-sunken/70 text-muted-foreground rounded-tr-[6px]' : 'bg-secondary text-secondary-foreground rounded-tr-[6px]',
        )}
      >
        {item.assunto && (
          <div className="text-muted-foreground border-foreground/10 -mx-4 border-b px-4 pb-2 text-xs">
            Assunto: <span className="font-medium">{item.assunto}</span>
          </div>
        )}
        {item.audio && (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="bg-foreground/80 text-background flex size-7 items-center justify-center rounded-full">
                <MicrophoneIcon weight="fill" className="size-3.5" />
              </span>
              <span className="bg-foreground/20 h-1 flex-1 rounded-full" />
              <span className="text-xs tabular-nums">{item.audio.duracao}</span>
            </div>
            <p className="text-muted-foreground text-xs">
              <span className="font-medium">Transcrição (gerada):</span> "{item.audio.transcricao}"
            </p>
          </div>
        )}
        {item.daCaixa && (
          <div className="text-muted-foreground -mt-1 flex items-center gap-1 text-xs">
            <EnvelopeSimpleIcon className="size-3" /> {item.daCaixa === 'enviado' ? 'enviado pela caixa do setor, fora do sistema · registrado pelo integrante' : 'lido da caixa do setor pelo integrante'}
          </div>
        )}
        {item.texto && <p className={cn('whitespace-pre-wrap', item.apagada && 'line-through opacity-60')}>{negritoWhatsApp(item.texto)}</p>}
        {item.apagada && <p className="text-muted-foreground text-xs">apagada pelo cliente no WhatsApp · o texto original fica guardado</p>}
        {item.editadaDe && (
          <p className="text-muted-foreground border-foreground/10 border-t pt-1.5 text-xs">
            editada pelo cliente · antes: <span className="line-through">{item.editadaDe}</span>
          </p>
        )}
        {item.botoes && (
          <div className="flex flex-wrap gap-1.5">
            {item.botoes.map((b) => (
              <span key={b.rotulo} className={cn('rounded-full border px-2.5 py-1 text-xs', b.escolhido ? 'border-foreground/40 bg-raised text-foreground font-medium' : 'border-border')}>
                {b.rotulo}
                {b.escolhido && ' · tocado'}
              </span>
            ))}
          </div>
        )}
        {item.anexos?.map((a) => (
          <button key={a.nome} type="button" onClick={() => onAbrirAnexo?.(a.nome)} className="bg-raised/70 hover:bg-raised flex w-fit cursor-pointer items-center gap-2 rounded-[10px] px-2.5 py-1.5 text-left text-xs">
            <FileTextIcon weight="duotone" className="size-4" /> <span className="underline-offset-2 hover:underline">{a.nome}</span>
            <span className="text-muted-foreground">· {a.tipo}</span>
          </button>
        ))}
      </div>
      {!doCliente && item.de !== 'auto' && (
        <div className="text-muted-foreground flex flex-wrap items-center justify-end gap-1 text-xs">
          por {rotuloCanal[item.canal]} <StatusEntrega entrega={item.entrega} />
          {item.anexos?.length ? <Farol item={item} onReenviar={onReenviar} /> : null}
        </div>
      )}
      {item.devolvido && (
        <div className="text-destructive-text flex items-center gap-1.5 text-xs">
          <WarningCircleIcon className="size-3.5" /> e-mail voltou: {item.devolvido}
          {onReenviar && (
            <button type="button" className="text-primary cursor-pointer underline-offset-2 hover:underline" onClick={() => onReenviar(item.id)}>
              preparar reenvio por WhatsApp
            </button>
          )}
        </div>
      )}
    </div>
  )
}

/** Farol de entrega do documento (D-17): verde abriu, amarelo no prazo (3 dias úteis), vermelho passou sem abrir. */
function Farol({ item, onReenviar }: { item: Extract<ItemConversa, { tipo: 'mensagem' }>; onReenviar?: (id: string) => void }) {
  const cor = item.farol ?? (item.entrega === 'lida' ? 'verde' : 'amarelo')
  const rotulo = { verde: 'documento aberto', amarelo: 'no prazo, ainda sem abrir', vermelho: 'passou 3 dias úteis sem abrir' }[cor]
  return (
    <span className="flex items-center gap-1">
      <span aria-hidden className={cn('size-2 rounded-full', cor === 'verde' ? 'bg-success' : cor === 'amarelo' ? 'bg-warning' : 'bg-destructive')} />
      {rotulo}
      {cor === 'vermelho' && onReenviar && (
        <button type="button" className="text-primary cursor-pointer underline-offset-2 hover:underline" onClick={() => onReenviar(item.id)}>
          preparar reenvio por e-mail
        </button>
      )}
    </span>
  )
}

/** *texto* do WhatsApp em negrito (o nome de quem atende sai assim, C2-07). */
function negritoWhatsApp(texto: string) {
  return texto.split(/(\*[^*\n]+\*)/g).map((p, i) => (/^\*[^*\n]+\*$/.test(p) ? <strong key={i} className="font-semibold">{p.slice(1, -1)}</strong> : p))
}

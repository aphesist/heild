import { BellSimpleSlashIcon, BellIcon, ChatCircleTextIcon, ChecksIcon, GearSixIcon } from '@phosphor-icons/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useLoja } from '@/ambiente/loja'
import { EstadoVazio } from '@/components/kit'
import { Button } from '@/components/ui/button'
import { useTema } from '@/theme/ThemeProvider'
import type { ItemConversa } from '@/dados/crm'
import { cn } from '@/lib/utils'
import { nomeSetor, useNomeEscritorio, type Ctx, type Tela } from './contexto'
import { textosDoApp } from './dados'
import { avisosBase, rotuloCategoria, useAcesso, useAvisosApp, useLidos, usePreferencias, type AvisoApp, type CategoriaAviso } from './estado'
import { Chip, Chips, Selo, TituloTela } from './pecas'

/**
 * S10-T11 · Central de avisos do app (sino) e push agrupado (06, 10). Os
 * avisos guardados (documento novo, pendência, prazo, pedido, comunicado,
 * acesso) somam com as respostas do escritório nas conversas da pessoa.
 * Urgente fura o silêncio; normal entra no resumo diário.
 */

type Loja = ReturnType<typeof useLoja>

/** Publica um aviso no app de uma empresa (quem chama: o escritório, o motor, o efeito do cartão). */
export function publicarAviso(loja: Pick<Loja, 'lembrar'>, clienteId: string, a: Omit<AvisoApp, 'id' | 'quando'> & { id?: string; quando?: string }) {
  const novo: AvisoApp = { id: a.id ?? `av-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`, quando: a.quando ?? `18/11 ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`, ...a }
  loja.lembrar(`s10:avisos:${clienteId}`, avisosBase(clienteId), (l: AvisoApp[]) => [novo, ...l.filter((x) => x.id !== novo.id)])
}

const areaVisivel = (ctx: Ctx, a: AvisoApp) => (!a.area || ctx.areas.includes(a.area as never) || (a.area === 'guias' && ctx.areas.includes('financeiro'))) && (!a.para?.length || a.para.includes(ctx.pessoa))

/** Avisos da pessoa nesta empresa, os mais novos primeiro (guardados + respostas nas conversas). */
export function useCentral(ctx: Ctx) {
  const loja = useLoja()
  const [guardados] = useAvisosApp(ctx.clienteId)
  const [lidos] = useLidos(ctx.pessoa)
  const [pref] = usePreferencias(ctx.pessoa)
  return useMemo(() => {
    const conversas: AvisoApp[] = loja.conversas
      .filter((c) => c.clienteId === ctx.clienteId && ctx.setores.includes(c.setor) && (c.pessoa.nome === ctx.contato.nome || ctx.ehSocio))
      .flatMap((c) =>
        c.itens
          .filter((i): i is Extract<ItemConversa, { tipo: 'mensagem' }> => i.tipo === 'mensagem' && i.de !== 'cliente' && !i.apagada)
          .slice(-2)
          .map((i) => ({
            id: `cv:${i.id}`,
            categoria: 'conversa' as const,
            prioridade: 'alta' as const,
            titulo: `Resposta de ${i.de === 'integrante' ? `${i.autor} (assistente)` : i.autor} · ${nomeSetor[c.setor] ?? c.setor}`,
            corpo: (i.texto ?? (i.audio ? 'Mensagem de áudio' : 'Anexo')).slice(0, 90),
            quando: `hoje ${i.hora}`,
            destino: { tela: 'conversa', item: c.setor },
          })),
      )
    const todos = [...guardados.filter((a) => areaVisivel(ctx, a)), ...conversas]
    return todos.map((a) => ({ ...a, lido: lidos.includes(a.id), silenciado: !!a.competencia && pref.competenciasSilenciadas.includes(a.competencia) && a.prioridade !== 'urgente' }))
  }, [loja.conversas, guardados, lidos, pref.competenciasSilenciadas, ctx])
}

export function useNaoLidos(ctx: Ctx) {
  return useCentral(ctx).filter((a) => !a.lido && !a.silenciado).length
}

const emSilencio = (de: string, ate: string, agora = new Date()) => {
  const m = agora.getHours() * 60 + agora.getMinutes()
  const [a, b] = [de, ate].map((h) => Number(h.slice(0, 2)) * 60 + Number(h.slice(3, 5)))
  return a > b ? m >= a || m < b : m >= a && m < b
}

/** O push que chega no aparelho (simulado): agrupado, respeita o silêncio, urgente fura. Sem push permitido, vai pelo WhatsApp. */
export function PushSimulado({ ctx }: { ctx: Ctx }) {
  const central = useCentral(ctx)
  const [acesso] = useAcesso(ctx.pessoa)
  const [pref] = usePreferencias(ctx.pessoa)
  const { tema } = useTema()
  const nomeEscritorio = useNomeEscritorio()
  const vistos = useRef<Set<string> | null>(null)
  const [mostrando, setMostrando] = useState<(AvisoApp & { canal: 'push' | 'whatsapp' }) | null>(null)
  useEffect(() => {
    if (!vistos.current) {
      vistos.current = new Set(central.map((a) => a.id))
      return
    }
    const novos = central.filter((a) => !vistos.current!.has(a.id))
    novos.forEach((a) => vistos.current!.add(a.id))
    const a = novos.find((x) => !x.silenciado)
    if (!a) return
    const canais = pref.canais[a.categoria] ?? ['push']
    const silencio = pref.silencio.ligado && emSilencio(pref.silencio.de, pref.silencio.ate) && a.prioridade !== 'urgente'
    if (silencio || a.prioridade === 'baixa') return
    const canal = canais.includes('push') && acesso.push === 'permitido' ? 'push' : canais.includes('whatsapp') ? 'whatsapp' : null
    if (!canal) return
    setMostrando({ ...a, canal })
    const t = setTimeout(() => setMostrando(null), 5000)
    return () => clearTimeout(t)
  }, [central, pref, acesso.push])
  if (!mostrando) return null
  const produto = textosDoApp(tema, nomeEscritorio).produto
  return (
    <button
      type="button"
      onClick={() => {
        setMostrando(null)
        if (mostrando.destino) ctx.ir(mostrando.destino.tela as Tela, mostrando.destino.item ?? null)
      }}
      className="bg-raised shadow-painel absolute top-2 right-2 left-2 z-50 flex cursor-pointer items-start gap-2.5 rounded-[18px] px-3 py-2.5 text-left"
      aria-label={`Notificação: ${mostrando.titulo}`}
    >
      <span className="bg-sunken flex size-8 shrink-0 items-center justify-center rounded-[10px]">{mostrando.canal === 'push' ? <BellIcon className="size-4" weight="fill" /> : <ChatCircleTextIcon className="size-4" weight="fill" />}</span>
      <span className="min-w-0 flex-1">
        <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
          {mostrando.canal === 'push' ? produto : 'WhatsApp'} · agora{mostrando.prioridade === 'urgente' && ' · urgente'}
        </span>
        <span className="block text-sm font-medium">{mostrando.canal === 'push' ? mostrando.titulo : `${produto}: você tem novidades no app`}</span>
        {mostrando.canal === 'push' && mostrando.corpo && <span className="text-muted-foreground block truncate text-xs">{mostrando.corpo}</span>}
        {mostrando.canal === 'whatsapp' && <span className="text-muted-foreground block text-xs">O conteúdo fica no app (nunca no texto do WhatsApp).</span>}
      </span>
    </button>
  )
}

export function Avisos({ ctx }: { ctx: Ctx }) {
  const central = useCentral(ctx)
  const [, setLidos] = useLidos(ctx.pessoa)
  const [pref, setPref] = usePreferencias(ctx.pessoa)
  const [filtro, setFiltro] = useState<CategoriaAviso | 'todos' | 'nao_lidos'>('todos')
  const lista = central.filter((a) => (filtro === 'todos' ? true : filtro === 'nao_lidos' ? !a.lido : a.categoria === filtro))
  const categorias = (Object.keys(rotuloCategoria) as CategoriaAviso[]).filter((c) => central.some((a) => a.categoria === c))
  const naoLidos = central.filter((a) => !a.lido && !a.silenciado).length
  const hoje = central.filter((a) => a.quando.startsWith('18/11') || a.quando.startsWith('hoje'))
  return (
    <div className="flex flex-col gap-3">
      <TituloTela
        voltar={() => ctx.ir('inicio')}
        acao={
          <button type="button" aria-label="Preferências de aviso" onClick={() => ctx.ir('empresa', 'avisos')} className="hover:bg-sunken cursor-pointer rounded-full p-1.5">
            <GearSixIcon className="size-5" />
          </button>
        }
      >
        Avisos
      </TituloTela>
      {pref.resumoDiario.ligado && hoje.length > 0 && (
        <p className="bg-sunken rounded-[14px] px-3 py-2 text-xs">
          Resumo de hoje (às {pref.resumoDiario.hora}): {hoje.length} {hoje.length === 1 ? 'novidade' : 'novidades'}, {hoje.filter((a) => a.categoria === 'conversa').length} na conversa. Urgente chega na hora, mesmo no silêncio.
        </p>
      )}
      <Chips rotulo="Filtrar avisos">
        <Chip ativo={filtro === 'todos'} onClick={() => setFiltro('todos')}>
          Todos
        </Chip>
        <Chip ativo={filtro === 'nao_lidos'} onClick={() => setFiltro('nao_lidos')} contagem={naoLidos}>
          Não lidos
        </Chip>
        {categorias.map((c) => (
          <Chip key={c} ativo={filtro === c} onClick={() => setFiltro(c)}>
            {rotuloCategoria[c]}
          </Chip>
        ))}
      </Chips>
      {naoLidos > 0 && (
        <Button size="sm" variant="ghost" className="w-fit rounded-full" onClick={() => setLidos((l) => [...new Set([...l, ...central.map((a) => a.id)])])}>
          <ChecksIcon /> Marcar todos como lidos
        </Button>
      )}
      {lista.length === 0 && <EstadoVazio compacto icone={BellIcon} titulo="Nada por aqui" descricao="Quando o escritório mandar algo, aparece aqui e no aparelho." />}
      <div className="flex flex-col gap-1.5">
        {lista.map((a) => (
          <div key={a.id} className={cn('bg-surface shadow-cartao flex flex-col gap-1 rounded-[16px] px-3 py-2.5', a.silenciado && 'opacity-70')}>
            <button
              type="button"
              className="flex cursor-pointer items-start gap-2 text-left"
              onClick={() => {
                setLidos((l) => (l.includes(a.id) ? l : [...l, a.id]))
                if (a.destino) ctx.ir(a.destino.tela as Tela, a.destino.item ?? null)
              }}
            >
              <span className={cn('mt-1.5 size-2 shrink-0 rounded-full', a.lido ? 'bg-transparent' : a.prioridade === 'urgente' ? 'bg-destructive' : 'bg-primary')} aria-label={a.lido ? 'lido' : 'não lido'} />
              <span className="min-w-0 flex-1">
                <span className={cn('block text-sm', !a.lido && 'font-medium')}>{a.titulo}</span>
                {a.corpo && <span className="text-muted-foreground block text-xs">{a.corpo}</span>}
                <span className="text-muted-foreground mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                  {a.quando} · {rotuloCategoria[a.categoria]}
                  {a.prioridade === 'urgente' && <Selo tom="erro">urgente</Selo>}
                  {a.quantidade && a.quantidade > 1 && <Selo>{a.quantidade} itens</Selo>}
                  {a.silenciado && <Selo>silenciado</Selo>}
                </span>
              </span>
            </button>
            {a.competencia && (
              <button
                type="button"
                className="text-muted-foreground flex w-fit cursor-pointer items-center gap-1 pl-4 text-[11px] underline-offset-2 hover:underline"
                onClick={() => {
                  const silenciada = pref.competenciasSilenciadas.includes(a.competencia!)
                  setPref((p) => ({ ...p, competenciasSilenciadas: silenciada ? p.competenciasSilenciadas.filter((c) => c !== a.competencia) : [...p.competenciasSilenciadas, a.competencia!] }))
                  ctx.avisarApp(silenciada ? `Avisos de ${a.competencia} voltaram.` : `Competência ${a.competencia} silenciada. Urgente continua chegando.`)
                }}
              >
                <BellSimpleSlashIcon className="size-3" /> {pref.competenciasSilenciadas.includes(a.competencia) ? `Voltar a avisar ${a.competencia}` : `Silenciar ${a.competencia}`}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

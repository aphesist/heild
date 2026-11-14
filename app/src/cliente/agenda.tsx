import { CalendarBlankIcon, CalendarCheckIcon, SparkleIcon, VideoCameraIcon } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { fichas } from '@/ambiente/clientes'
import { useLoja } from '@/ambiente/loja'
import { Carregando, EstadoErro, EstadoVazio, SeloDemonstracao } from '@/components/kit'
import { Button } from '@/components/ui/button'
import { fiscalDe } from '@/dados/painel'
import type { SetorIntegrante } from '@/theme/tipos'
import { cn } from '@/lib/utils'
import { ator, idDoUsuario, nomeSetor, oQueMandar, type Ctx } from './contexto'
import { agoraTexto, janelasReuniao } from './dados'
import { useReunioes, type Reuniao } from './estado'
import { usePendencias } from './pendencias'
import { useServicos } from './servicos'
import { Bloco, Chip, Chips, Escolha, Faixa, Folha, Selo, TituloTela } from './pecas'
import { horariosLivres } from './simulados'

/**
 * S10-T07 · Agenda (06, 3.7). Horários livres do responsável (calendário
 * conectado ou janelas fixas do escritório); a reunião vira tarefa GES-045
 * com pauta preparada pelo integrante; remarcar e cancelar até 4 h antes.
 */

/** "qui 19/11 · 10:00" → horas a partir de agora (o dia da demonstração é 18/11). */
const horasAte = (quando: string) => {
  const m = quando.match(/(\d{2})\/(\d{2}) · (\d{2}):(\d{2})/)
  if (!m) return 99
  const agora = new Date()
  const alvo = new Date(2026, Number(m[2]) - 1, Number(m[1]), Number(m[3]), Number(m[4]))
  const base = new Date(2026, 10, 18, agora.getHours(), agora.getMinutes())
  return (alvo.getTime() - base.getTime()) / 36e5
}

export function Agenda({ ctx }: { ctx: Ctx }) {
  const loja = useLoja()
  const { estado: estadoServico } = useServicos(ctx)
  const [reunioes, setReunioes] = useReunioes(ctx.clienteId)
  const setores = ctx.setores.filter((s) => fichas[ctx.clienteId]?.responsaveis[s])
  const [setor, setSetor] = useState<SetorIntegrante>(setores[0] ?? 'gestao_atendimento')
  const [tipo, setTipo] = useState('Dúvida geral')
  const [duracao, setDuracao] = useState('30 min')
  const [canal, setCanal] = useState('Vídeo')
  const [hora, setHora] = useState<string | null>(null)
  const [livres, setLivres] = useState<{ horarios: string[]; fonte: string } | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [remarcar, setRemarcar] = useState<Reuniao | null>(null)
  const pend = usePendencias(ctx)
  const resp = fichas[ctx.clienteId]?.responsaveis[setor] ?? 'quem atende'
  const carregar = () => {
    setLivres(null)
    setErro(null)
    horariosLivres(resp, janelasReuniao)
      .then((r) => setLivres({ horarios: r.dados.horarios.filter((h) => !reunioes.some((x) => x.situacao !== 'cancelada' && x.quando === h)), fonte: r.fonte }))
      .catch((e: Error) => setErro(e.message))
  }
  useEffect(() => {
    carregar()
  }, [setor]) // eslint-disable-line react-hooks/exhaustive-deps

  const pautaDe = (): string[] => {
    const fis = fiscalDe(ctx.clienteId)
    const g = fis.guias.find((x) => !x.paga && x.valor !== '—')
    return [
      tipo === 'Planejamento' ? 'Regime de 2027 e o efeito da reforma (CBS/IBS) na empresa' : `${tipo}: o que ${ctx.contato.nome.split(' ')[0]} quer tratar`,
      ...(pend[0] ? [`Pendência aberta: ${oQueMandar(pend[0]).toLowerCase()}`] : []),
      ...(g ? [`${g.tributo} ${g.competencia}: ${g.valor}, vence ${g.vencimento}`] : []),
    ]
  }

  const marcar = () => {
    if (!hora) return
    const pauta = pautaDe()
    const id = loja.criarTarefa({ codigo: 'GES-045', titulo: `Reunião com ${ctx.contato.nome} · ${hora}`, cliente: ctx.clienteNome, setor, prazo: hora.slice(4, 9), status: 'a_fazer', origem: 'pedido_cliente', responsavel: { tipo: 'pessoa', nome: resp } })
    setReunioes((l) => [{ id: `rn-${Date.now().toString(36)}`, tarefaId: id, setor, responsavel: resp, quando: hora, tipo, duracao, canal, pauta, situacao: 'marcada', historico: [`marcada em ${agoraTexto()}`] }, ...l])
    loja.avisar({ para: [idDoUsuario(resp) ?? 'u1'], tipo: 'cliente', setor, titulo: `${ctx.contato.nome} marcou reunião: ${hora}`, detalhe: `${ctx.clienteNome} · ${tipo} · pauta preparada pelo integrante`, destino: { modulo: 'painel', tarefa: id } })
    loja.registrar(ator(ctx), `Marcou reunião (${tipo}, ${duracao}, ${canal.toLowerCase()}) com ${resp} em ${hora} · ${ctx.clienteNome}`)
    ctx.avisarApp(`Marcado: ${hora}. O convite chega no seu e-mail.`)
    setHora(null)
    carregar()
  }

  const mudar = (r: Reuniao, acao: 'cancelar' | 'remarcar', novo?: string) => {
    if (horasAte(r.quando) < 4) return ctx.avisarApp('Faltam menos de 4 horas: para remarcar ou cancelar, escreva na conversa.')
    setReunioes((l) => l.map((x) => (x.id === r.id ? { ...x, situacao: acao === 'cancelar' ? 'cancelada' : 'remarcada', quando: novo ?? x.quando, historico: [...x.historico, acao === 'cancelar' ? `cancelada em ${agoraTexto()}` : `remarcada de ${r.quando} para ${novo} em ${agoraTexto()}`] } : x)))
    if (acao === 'cancelar') loja.atualizarTarefa(r.tarefaId, { status: 'concluida' })
    else loja.atualizarTarefa(r.tarefaId, { titulo: `Reunião com ${ctx.contato.nome} · ${novo}`, prazo: novo!.slice(4, 9) })
    loja.avisar({ para: [idDoUsuario(r.responsavel) ?? 'u1'], tipo: 'cliente', setor: r.setor as SetorIntegrante, titulo: `${ctx.contato.nome} ${acao === 'cancelar' ? 'cancelou' : 'remarcou'} a reunião`, detalhe: acao === 'cancelar' ? r.quando : `${r.quando} → ${novo}`, destino: { modulo: 'painel', tarefa: r.tarefaId } })
    loja.registrar(ator(ctx), `${acao === 'cancelar' ? 'Cancelou' : 'Remarcou'} a reunião de ${r.quando}${novo ? ` para ${novo}` : ''} · ${ctx.clienteNome}`)
    ctx.avisarApp(acao === 'cancelar' ? 'Reunião cancelada.' : `Remarcada para ${novo}.`)
    setRemarcar(null)
  }

  const minhas = reunioes.filter((r) => r.situacao !== 'cancelada')
  return (
    <div className="flex flex-col gap-3">
      <TituloTela voltar={() => ctx.ir('mais')}>Agenda</TituloTela>
      {minhas.length > 0 && (
        <Bloco titulo="Suas reuniões">
          {minhas.map((r) => (
            <div key={r.id} className="flex flex-col gap-1.5 text-sm">
              <div className="flex items-center gap-2">
                <CalendarCheckIcon className="text-muted-foreground size-5 shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="block">
                    {r.quando} · {r.duracao}
                  </span>
                  <span className="text-muted-foreground block text-xs">
                    {r.tipo} com {r.responsavel} · {r.canal.toLowerCase()}
                  </span>
                </span>
                {r.situacao === 'remarcada' && <Selo>remarcada</Selo>}
              </div>
              <div className="bg-sunken rounded-[12px] px-3 py-2 text-xs">
                <span className="text-muted-foreground mb-0.5 flex items-center gap-1">
                  <SparkleIcon className="size-3" /> Pauta preparada pelo assistente
                </span>
                <ul className="list-disc pl-4">
                  {r.pauta.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
              {!ctx.leitura && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="rounded-full" onClick={() => setRemarcar(r)}>
                    Remarcar
                  </Button>
                  <Button size="sm" variant="ghost" className="rounded-full" onClick={() => mudar(r, 'cancelar')}>
                    Cancelar
                  </Button>
                </div>
              )}
            </div>
          ))}
          <p className="text-muted-foreground text-[11px]">Remarcar e cancelar pelo app até 4 horas antes.</p>
        </Bloco>
      )}
      {ctx.leitura ? (
        <Faixa>App em modo leitura: não dá para marcar reuniões novas.</Faixa>
      ) : (
        <>
          <p className="text-sm font-medium">Marcar conversa</p>
          {setores.length > 0 && (
            <Chips rotulo="Com quem">
              {setores.map((s) => (
                <Chip key={s} ativo={setor === s} onClick={() => setSetor(s)}>
                  {nomeSetor[s]}
                </Chip>
              ))}
            </Chips>
          )}
          <Escolha rotulo="Assunto" valor={tipo} onMudar={(v) => setTipo(v || 'Dúvida geral')} opcoes={['Dúvida geral', 'Planejamento', 'Fechamento do mês', 'Folha e pessoal']} />
          <div className="grid grid-cols-2 gap-2">
            <Escolha rotulo="Duração" valor={duracao} onMudar={(v) => setDuracao(v || '30 min')} opcoes={['30 min', '60 min']} />
            <Escolha rotulo="Como" valor={canal} onMudar={(v) => setCanal(v || 'Vídeo')} opcoes={['Vídeo', 'Telefone', 'Presencial']} />
          </div>
          <Bloco titulo={`Horários livres de ${resp}`} acao={livres && <SeloDemonstracao fonte={livres.fonte} />}>
            {!livres && !erro && <Carregando linhas={3} rotulo="Buscando horários" />}
            {erro && <EstadoErro titulo="O calendário não respondeu" descricao={erro} onTentar={carregar} />}
            {livres?.horarios.length === 0 && <EstadoVazio compacto icone={CalendarBlankIcon} titulo="Sem horários nesta semana" descricao="Escreva na conversa que o escritório propõe outro dia." />}
            {livres?.horarios.map((h) => (
              <button key={h} type="button" onClick={() => setHora(h)} aria-pressed={hora === h} className={cn('flex cursor-pointer items-center gap-2 rounded-[12px] px-3 py-2 text-left text-sm', hora === h ? 'bg-foreground text-background' : 'bg-sunken/60')}>
                <VideoCameraIcon className="size-4" /> {h} · {duracao}
              </button>
            ))}
            <Button className="rounded-full" disabled={!hora} onClick={marcar}>
              Marcar
            </Button>
          </Bloco>
        </>
      )}
      <Bloco titulo="Agenda tributária no seu calendário">
        <p className="text-muted-foreground text-xs">Os vencimentos da empresa (guias, folha, declarações) direto no calendário do celular.</p>
        {estadoServico('agenda_tributaria') === 'ativo' ? (
          <Button size="sm" variant="outline" className="w-fit rounded-full" onClick={() => ctx.abrirServico('agenda_tributaria')}>
            Abrir agenda tributária
          </Button>
        ) : (
          <Button size="sm" variant="ghost" className="w-fit rounded-full" onClick={() => ctx.ir('servicos')}>
            Ver o serviço extra
          </Button>
        )}
      </Bloco>
      {remarcar && (
        <Folha titulo="Remarcar" onFechar={() => setRemarcar(null)}>
          <p className="text-sm">
            De {remarcar.quando} para:
          </p>
          {(livres?.horarios ?? janelasReuniao.filter((h) => !/feriado/.test(h))).filter((h) => h !== remarcar.quando).map((h) => (
            <button key={h} type="button" onClick={() => mudar(remarcar, 'remarcar', h)} className="bg-sunken cursor-pointer rounded-[12px] px-3 py-2 text-left text-sm">
              {h}
            </button>
          ))}
        </Folha>
      )}
    </div>
  )
}

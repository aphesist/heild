import { CaretRightIcon, ChatCircleDotsIcon, CheckCircleIcon, FileTextIcon, ListChecksIcon, PlusIcon, SparkleIcon, XCircleIcon } from '@phosphor-icons/react'
import { useMemo, useState } from 'react'
import { useTabela } from '@/nucleo/react'
import { tarefaParaTela } from '@/nucleo/mapeadores'
import { fichas } from '@/ambiente/clientes'
import { useConversaDe } from '@/ambiente/fluxos'
import { useLoja } from '@/ambiente/loja'
import { EstadoVazio } from '@/components/kit'
import { Button } from '@/components/ui/button'
import { autorizar } from '@/nucleo/permissoes'
import { contextoSistema } from '@/nucleo/permissoes/perfil'
import { comoAtor, contextoAtual } from '@/nucleo/repositorios/contexto'
import { repos } from '@/nucleo/repositorios'
import type { Tarefa } from '@/dados/tipos'
import { cn } from '@/lib/utils'
import { ator, idDoUsuario, nomeSetor, primeiroNome, type Ctx } from './contexto'
import { agoraTexto, brl, faturamentoMensal, simuladoRescisao, tiposPedido, type TipoPedido } from './dados'
import { usePedidosExtra, type ExtraPedido } from './estado'
import { prepararDeclaracao, prepararSimulado } from './motor'
import { AreaTexto, Bloco, CamposForm, Chip, Chips, Faixa, Folha, Selo, TituloTela, useFormularioApp, type Tom } from './pecas'

/**
 * S10-T05 · Pedidos (06, 4.3; GES-040). Tipos limitados ao papel; cada pedido
 * vira tarefa com origem `pedido_cliente`, número, previsão e conversa ligada
 * no setor. O status é a projeção do status da tarefa (sem checklist,
 * responsável nem notas internas). Simulado de rescisão (C2-02) e declaração
 * de faturamento (C2-14) acordam o integrante, que prepara e espera aprovação.
 */

export const statusPedido = (t: Tarefa, extra?: ExtraPedido): { rotulo: string; tom: Tom } => {
  if (extra?.avulso && !extra.avulso.autorizado && !extra.avulso.recusado && t.status !== 'cancelada' && t.status !== 'concluida') return { rotulo: 'aguardando você', tom: 'atencao' }
  switch (t.status) {
    case 'aguardando_cliente':
      return { rotulo: 'aguardando você', tom: 'atencao' }
    case 'aguardando_terceiro':
      return { rotulo: 'aguardando órgão ou banco', tom: 'neutro' }
    case 'em_revisao':
      return { rotulo: 'em conferência', tom: 'info' }
    case 'concluida':
      return { rotulo: 'concluído', tom: 'ok' }
    case 'cancelada':
      return { rotulo: 'cancelado', tom: 'neutro' }
    default:
      return { rotulo: 'em andamento no escritório', tom: 'info' }
  }
}

const previsaoEm = (dias: number) => {
  // Dias úteis a partir de 18/11 (qua), pulando o feriado de 20/11.
  const d = new Date(2026, 10, 18)
  let n = dias
  while (n > 0) {
    d.setDate(d.getDate() + 1)
    if (d.getDay() !== 0 && d.getDay() !== 6 && !(d.getDate() === 20 && d.getMonth() === 10)) n--
  }
  return d.toLocaleDateString('pt-BR').slice(0, 5)
}

/** Data do campo (aaaa-mm-dd) como o cliente lê (dd/mm/aaaa). */
export const valorCampo = (v?: string) => (v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v.split('-').reverse().join('/') : (v ?? ''))
const resumoCampos = (def: TipoPedido, v: Record<string, string>) => def.campos.map((c) => valorCampo(v[c.id])).filter(Boolean).slice(0, 3).join(', ')

/** Pedidos da empresa, inclusive os cancelados (a loja do escritório esconde tarefa cancelada; o cliente vê "cancelado, com o motivo"). */
export function usePedidosDoCliente(ctx: Ctx) {
  const tTarefa = useTabela('tarefa')
  const tCliente = useTabela('cliente')
  return useMemo(
    () => repos.tarefas.listar((t) => t.cliente_id === ctx.clienteId && t.origem === 'pedido_cliente').map((t) => tarefaParaTela(t, { clientes: tCliente })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tTarefa, tCliente, ctx.clienteId],
  )
}

export function Pedidos({ ctx }: { ctx: Ctx }) {
  const [extras] = usePedidosExtra(ctx.clienteId)
  const [novo, setNovo] = useState<string | null>(ctx.item?.startsWith('novo:') ? ctx.item.slice(5) : null)
  const [filtro, setFiltro] = useState<'abertos' | 'concluidos' | 'cancelados'>('abertos')
  const meus = usePedidosDoCliente(ctx)
  const aberto = ctx.item && !ctx.item.startsWith('novo:') ? meus.find((t) => t.id === ctx.item) : null
  if (aberto) return <DetalhePedido t={aberto} ctx={ctx} />
  const lista = meus.filter((t) => (filtro === 'abertos' ? t.status !== 'concluida' && t.status !== 'cancelada' : filtro === 'concluidos' ? t.status === 'concluida' : t.status === 'cancelada'))
  return (
    <div className="flex flex-col gap-3">
      <TituloTela voltar={() => ctx.ir('mais')}>Pedidos</TituloTela>
      {ctx.leitura ? (
        <Faixa>App em modo leitura: não dá para abrir pedidos novos. O histórico continua aqui.</Faixa>
      ) : (
        <Button className="rounded-full" onClick={() => setNovo('')}>
          <PlusIcon /> Novo pedido
        </Button>
      )}
      <Chips rotulo="Filtrar pedidos">
        <Chip ativo={filtro === 'abertos'} onClick={() => setFiltro('abertos')} contagem={meus.filter((t) => t.status !== 'concluida' && t.status !== 'cancelada').length}>
          Em andamento
        </Chip>
        <Chip ativo={filtro === 'concluidos'} onClick={() => setFiltro('concluidos')}>
          Concluídos
        </Chip>
        <Chip ativo={filtro === 'cancelados'} onClick={() => setFiltro('cancelados')}>
          Cancelados
        </Chip>
      </Chips>
      {lista.length === 0 && <EstadoVazio compacto icone={ListChecksIcon} titulo={meus.length === 0 ? 'Nenhum pedido ainda' : 'Nada neste filtro'} descricao="Admissão, férias, certidão, declaração de faturamento, dúvidas: peça aqui e acompanhe." />}
      {lista.map((t) => {
        const st = statusPedido(t, extras[t.id])
        return (
          <button key={t.id} type="button" onClick={() => ctx.ir('pedidos', t.id)} className="bg-surface shadow-cartao flex cursor-pointer items-center gap-2 rounded-[18px] px-3.5 py-3 text-left">
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{t.titulo}</span>
              <span className="text-muted-foreground block text-xs">
                nº {t.id.toUpperCase()} · {nomeSetor[t.setor] ?? t.setor}
                {extras[t.id]?.previsao && t.status !== 'concluida' && t.status !== 'cancelada' ? ` · previsão ${extras[t.id].previsao}` : ''}
              </span>
            </span>
            <Selo tom={st.tom}>{st.rotulo}</Selo>
            <CaretRightIcon className="text-muted-foreground size-4 shrink-0" />
          </button>
        )
      })}
      {novo !== null && <NovoPedido ctx={ctx} tipoInicial={novo || undefined} onFechar={() => setNovo(null)} />}
    </div>
  )
}

/** Abrir pedido: cria a tarefa, liga a conversa do setor e avisa quem cuida (e acorda o integrante quando é o caso). */
export function useAbrirPedido(ctx: Ctx) {
  const loja = useLoja()
  const conversaDe = useConversaDe()
  const [, setExtras] = usePedidosExtra(ctx.clienteId)
  return (def: TipoPedido, campos: Record<string, string>, detalhe?: string) => {
    const resumo = resumoCampos(def, campos) || detalhe || ''
    const previsao = previsaoEm(def.previsaoDias)
    const resp = fichas[ctx.clienteId]?.responsaveis[def.setor]
    const id = loja.criarTarefa({
      codigo: def.codigo,
      titulo: `${def.tipo}: ${resumo}`,
      cliente: ctx.clienteNome,
      setor: def.setor,
      prazo: previsao,
      status: 'a_fazer',
      origem: 'pedido_cliente',
      responsavel: { tipo: 'integrante', nome: nomeSetor[def.setor] ?? 'Atendimento', setor: def.setor },
    })
    const conversa = conversaDe(ctx.clienteNome, def.setor, ctx.contato.nome)
    loja.atualizarTarefa(id, { conversa })
    const linhas = def.campos.filter((c) => campos[c.id]).map((c) => `${c.rotulo}: ${valorCampo(campos[c.id])}`)
    loja.mensagemCrm(conversa, { tipo: 'mensagem', de: 'cliente', autor: primeiroNome(ctx.contato.nome), canal: 'app', texto: `Pedido pelo app · ${def.tipo}${linhas.length ? `\n${linhas.join('\n')}` : ''}${detalhe ? `\n${detalhe}` : ''}` })
    setExtras((m) => ({ ...m, [id]: { tipo: def.tipo, campos, abertoEm: agoraTexto(), previsao, ...(def.avulso ? { avulso: { valor: def.avulso } } : {}) } }))
    loja.avisar({ para: [idDoUsuario(resp) ?? 'u1'], tipo: 'cliente', setor: def.setor, titulo: `Pedido novo pelo app: ${def.tipo}`, detalhe: `${ctx.clienteNome} · ${ctx.contato.nome}`, destino: { modulo: 'painel', tarefa: id } })
    loja.registrar(ator(ctx), `Abriu o pedido ${def.codigo} (${def.tipo}) · ${ctx.clienteNome}`)
    if (def.destaque === 'C2-02') prepararSimulado(loja, { clienteId: ctx.clienteId, clienteNome: ctx.clienteNome, tarefaId: id, empregado: campos.empregado ?? 'empregado', tipoRescisao: campos.tipo ?? 'Sem justa causa', data: valorCampo(campos.data), contato: ctx.contato.nome })
    if (def.destaque === 'C2-14') {
      const meses = faturamentoMensal(ctx.clienteId)
      const receita = campos.periodo === 'Ano de 2026 até outubro' ? meses.slice(2).reduce((a, b) => a + b, 0) : meses.reduce((a, b) => a + b, 0)
      prepararDeclaracao(loja, { clienteId: ctx.clienteId, clienteNome: ctx.clienteNome, tarefaId: id, finalidade: campos.finalidade ?? 'Banco (crédito)', periodo: campos.periodo ?? 'Últimos 12 meses', receita, contato: ctx.contato.nome })
    }
    ctx.avisarApp(`Pedido aberto (${def.codigo}). Previsão: ${previsao}. Você acompanha aqui.`)
    return id
  }
}

function NovoPedido({ ctx, onFechar, tipoInicial }: { ctx: Ctx; onFechar: () => void; tipoInicial?: string }) {
  const permitidos = tiposPedido.filter((t) => t.area === 'todos' || ctx.areas.includes(t.area as never) || (t.area === 'documentos' && ctx.areas.includes('documentos')))
  const [tipo, setTipo] = useState(permitidos.find((t) => t.tipo === tipoInicial)?.tipo ?? permitidos[0]?.tipo ?? 'Dúvida')
  const def = permitidos.find((t) => t.tipo === tipo) ?? permitidos[0]
  const form = useFormularioApp(def.campos)
  const [detalhe, setDetalhe] = useState('')
  const abrir = useAbrirPedido(ctx)
  return (
    <Folha
      titulo="Novo pedido"
      onFechar={onFechar}
      rodape={
        <Button
          className="rounded-full"
          onClick={() => {
            if (!form.tentar()) return
            const id = abrir(def, form.valores, detalhe.trim() || undefined)
            onFechar()
            ctx.ir('pedidos', id)
          }}
        >
          Abrir pedido
        </Button>
      }
    >
      <label className="flex flex-col gap-1">
        <span className="text-muted-foreground text-xs">Tipo de pedido</span>
        <select
          aria-label="Tipo de pedido"
          value={tipo}
          onChange={(e) => {
            setTipo(e.target.value)
            form.limpar()
          }}
          className="bg-raised shadow-contorno h-11 rounded-[12px] px-3 text-sm outline-none"
        >
          {permitidos.map((t) => (
            <option key={t.tipo} value={t.tipo}>
              {t.tipo}
            </option>
          ))}
        </select>
      </label>
      <p className="bg-sunken flex items-start gap-2 rounded-[12px] px-3 py-2 text-xs">
        <SparkleIcon className="mt-0.5 size-3.5 shrink-0" /> {def.integranteFaz} Previsão: {previsaoEm(def.previsaoDias)}.
        {def.avulso ? ` Fora do contrato: serviço avulso de ${brl(def.avulso)}, só com a sua autorização.` : ''}
      </p>
      <CamposForm campos={def.campos} form={form} />
      <AreaTexto rotulo="Detalhes" valor={detalhe} onMudar={setDetalhe} placeholder="Algo mais que o escritório precisa saber (opcional)" linhas={2} />
      <p className="text-muted-foreground text-[11px]">Pedidos do seu papel ({ctx.contato.papel}). Outros tipos, o sócio pede.</p>
    </Folha>
  )
}

function DetalhePedido({ t, ctx }: { t: Tarefa; ctx: Ctx }) {
  const loja = useLoja()
  const [extras, setExtras] = usePedidosExtra(ctx.clienteId)
  const extra = extras[t.id]
  const st = statusPedido(t, extra)
  const def = tiposPedido.find((x) => x.codigo === t.codigo)
  const iniciado = t.status !== 'a_fazer' || !!loja.trabalhoDe({ tarefaId: t.id })
  const [cancelar, setCancelar] = useState(false)
  const [motivo, setMotivo] = useState('')
  const abrir = useAbrirPedido(ctx)
  const fim = t.status === 'concluida' || t.status === 'cancelada'
  const passos = ['Recebido', 'Em andamento', st.rotulo === 'aguardando você' ? 'Aguardando você' : st.rotulo === 'em conferência' ? 'Em conferência' : 'Conferência', t.status === 'cancelada' ? 'Cancelado' : 'Concluído']
  const etapa = t.status === 'cancelada' ? 3 : t.status === 'concluida' ? 3 : st.rotulo === 'aguardando você' || st.rotulo === 'em conferência' ? 2 : iniciado ? 1 : 0
  const resultado = extra?.resultado ? loja.documentos.find((d) => d.id === extra.resultado) : undefined
  const sim = extra?.simulado && extra.campos ? simuladoRescisao(extra.campos.empregado ?? '', extra.campos.tipo ?? '', valorCampo(extra.campos.data)) : null

  const decidirAvulso = (autorizar: boolean) => {
    setExtras((m) => ({ ...m, [t.id]: { ...m[t.id], avulso: { ...m[t.id].avulso!, ...(autorizar ? { autorizado: { por: ctx.contato.nome, em: agoraTexto() } } : { recusado: { por: ctx.contato.nome, em: agoraTexto() } }) } } }))
    ctx.registrar(`${autorizar ? 'Autorizou' : 'Recusou'} o serviço avulso de ${brl(extra!.avulso!.valor)} no pedido ${t.codigo} (GES-036)${autorizar ? '; vira item de cobrança (FIN-002)' : ''}`)
    loja.avisar({ para: ['u1'], tipo: 'cliente', setor: 'financeiro_escritorio', titulo: `${ctx.clienteNome} ${autorizar ? 'autorizou' : 'recusou'} serviço avulso`, detalhe: `${t.titulo} · ${brl(extra!.avulso!.valor)}`, destino: autorizar ? { modulo: 'financeiro', aba: 'cobranca' } : { modulo: 'painel', tarefa: t.id } })
    if (autorizar) loja.atualizarTarefa(t.id, { status: 'em_andamento' })
    ctx.avisarApp(autorizar ? 'Autorizado. Entra na próxima fatura como serviço avulso; o escritório segue com o pedido.' : 'Recusado. O escritório responde na conversa do pedido.')
  }

  return (
    <div className="flex flex-col gap-3">
      <TituloTela voltar={() => ctx.ir('pedidos')}>{def?.tipo ?? 'Pedido'}</TituloTela>
      <Bloco titulo={t.titulo} acao={<Selo tom={st.tom}>{st.rotulo}</Selo>}>
        <p className="text-muted-foreground text-xs">
          nº {t.id.toUpperCase()} · {t.codigo} · {nomeSetor[t.setor] ?? t.setor}
          {extra?.abertoEm ? ` · aberto em ${extra.abertoEm}` : ''}
          {extra?.previsao && !fim ? ` · previsão ${extra.previsao}` : ''}
        </p>
        <ol className="mt-1 flex items-center gap-1" aria-label="Andamento">
          {passos.map((p, i) => (
            <li key={p} className="flex min-w-0 flex-1 flex-col gap-1">
              <span className={cn('h-1.5 rounded-full', i <= etapa ? (t.status === 'cancelada' && i === 3 ? 'bg-muted-foreground' : 'bg-primary') : 'bg-sunken')} />
              <span className={cn('truncate text-[10px]', i === etapa ? 'text-foreground font-medium' : 'text-muted-foreground')}>{p}</span>
            </li>
          ))}
        </ol>
        {extra?.campos && (
          <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-xs">
            {(def?.campos ?? [])
              .filter((c) => extra.campos[c.id])
              .map((c) => (
                <div key={c.id} className="contents">
                  <dt className="text-muted-foreground">{c.rotulo}</dt>
                  <dd>{valorCampo(extra.campos[c.id])}</dd>
                </div>
              ))}
          </dl>
        )}
        {t.status === 'cancelada' && extra?.motivoCancelamento && <p className="text-xs">Cancelado: {extra.motivoCancelamento}</p>}
      </Bloco>

      {extra?.avulso && (
        <Bloco titulo={`Serviço avulso: ${brl(extra.avulso.valor)}`} acao={extra.avulso.autorizado ? <Selo tom="ok">autorizado</Selo> : extra.avulso.recusado ? <Selo>recusado</Selo> : <Selo tom="atencao">precisa de você</Selo>}>
          <p className="text-xs">Este pedido está fora do que o contrato cobre (tabela de avulsos do escritório). Autorizado, entra na próxima fatura em linha separada, com a NFS-e do serviço.</p>
          {extra.avulso.autorizado && <p className="text-muted-foreground text-xs">Autorizado por {extra.avulso.autorizado.por} em {extra.avulso.autorizado.em} (registro de autorização, GES-036).</p>}
          {!extra.avulso.autorizado && !extra.avulso.recusado && !ctx.leitura && (ctx.ehSocio ? (
            <div className="flex gap-2">
              <Button size="sm" className="rounded-full" onClick={() => decidirAvulso(true)}>
                Autorizar
              </Button>
              <Button size="sm" variant="ghost" className="rounded-full" onClick={() => decidirAvulso(false)}>
                Recusar
              </Button>
            </div>
          ) : (
            <p className="text-muted-foreground text-xs">Quem autoriza é o sócio.</p>
          ))}
        </Bloco>
      )}

      {sim && extra?.simulado && (
        <Bloco titulo={sim.titulo} acao={extra.simulado.resposta ? <Selo tom="ok">{extra.simulado.resposta === 'seguir' ? 'vai seguir' : 'não vai seguir'}</Selo> : <Selo tom="atencao">responda</Selo>}>
          <p className="text-muted-foreground text-xs">{sim.resumo} · conferido pelo DP antes de chegar aqui</p>
          <table className="w-full text-xs">
            <tbody>
              {sim.linhas.map(([r, v]) => (
                <tr key={r}>
                  <td className="py-0.5">{r}</td>
                  <td className={cn('py-0.5 text-right tabular-nums', v < 0 && 'text-destructive')}>{brl(v)}</td>
                </tr>
              ))}
              <tr className="border-t font-medium">
                <td className="pt-1">Total líquido a pagar</td>
                <td className="pt-1 text-right tabular-nums">{brl(sim.total)}</td>
              </tr>
            </tbody>
          </table>
          <p className="text-xs">{sim.fgts}</p>
          <p className="text-muted-foreground text-xs">{sim.prazo}</p>
          {!extra.simulado.resposta && !ctx.leitura && (
            <>
              <p className="text-sm font-medium">Vai seguir com a rescisão?</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="rounded-full"
                  onClick={() => {
                    setExtras((m) => ({ ...m, [t.id]: { ...m[t.id], simulado: { ...m[t.id].simulado!, resposta: 'seguir', respondidoEm: agoraTexto() } } }))
                    loja.atualizarTarefa(t.id, { status: 'concluida' })
                    const resc = tiposPedido.find((x) => x.codigo === 'DP-026')!
                    const nova = abrir(resc, { empregado: extra.campos.empregado, data: extra.campos.data, tipo: extra.campos.tipo, aviso: extra.campos.aviso ?? '' }, 'Veio do simulado aprovado pelo cliente: o DP abre o kit de rescisão (C2-01) e conta o prazo de 10 dias.')
                    ctx.ir('pedidos', nova)
                  }}
                >
                  Sim, seguir
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-full"
                  onClick={() => {
                    setExtras((m) => ({ ...m, [t.id]: { ...m[t.id], simulado: { ...m[t.id].simulado!, resposta: 'nao_seguir', respondidoEm: agoraTexto() } } }))
                    loja.atualizarTarefa(t.id, { status: 'concluida' })
                    ctx.registrar(`Respondeu ao simulado de ${extra.campos.empregado}: não vai seguir com a rescisão`)
                    ctx.avisarApp('Anotado. O DP para de cobrar a resposta.')
                  }}
                >
                  Não vai seguir
                </Button>
              </div>
              <p className="text-muted-foreground text-[11px]">Sem resposta, o DP lembra em D+1 e D+3 ({extra.simulado.lembretes?.join(' · ')}).</p>
            </>
          )}
        </Bloco>
      )}

      {extra?.declaracao && (
        <Faixa tom="ok" icone={<CheckCircleIcon weight="fill" />}>
          Declaração assinada pelo contador em {extra.declaracao.assinadaEm}: {brl(extra.declaracao.receita12m)} ({extra.declaracao.fontes}).
        </Faixa>
      )}

      {resultado && (
        <Button variant="outline" className="rounded-full" onClick={() => ctx.ir('documentos', resultado.id)}>
          <FileTextIcon /> Abrir {resultado.nome}
        </Button>
      )}

      {(def?.destaque === 'C2-02' || def?.destaque === 'C2-14') && !extra?.simulado && !extra?.declaracao && !fim && (
        <p className="bg-sunken flex items-start gap-2 rounded-[12px] px-3 py-2 text-xs">
          <SparkleIcon className="mt-0.5 size-3.5 shrink-0" /> {def.integranteFaz} Chega aqui depois que uma pessoa do escritório aprovar.
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" className="rounded-full" onClick={() => ctx.abrirConversa(t.setor)}>
          <ChatCircleDotsIcon /> Conversa deste pedido
        </Button>
        {!fim && !iniciado && !ctx.leitura && (
          <Button variant="ghost" className="rounded-full" onClick={() => setCancelar(true)}>
            <XCircleIcon /> Cancelar pedido
          </Button>
        )}
      </div>
      {!fim && iniciado && <p className="text-muted-foreground text-xs">O escritório já começou: para cancelar, peça pela conversa do pedido.</p>}

      {cancelar && (
        <Folha
          titulo="Cancelar pedido"
          onFechar={() => setCancelar(false)}
          rodape={
            <Button
              variant="destructive"
              className="rounded-full"
              disabled={motivo.trim().length < 3}
              onClick={() => {
                const d = autorizar(contextoAtual(), 'pedido.cancelar', { cliente_id: ctx.clienteId })
                if (!d.permitido) return ctx.avisarApp(d.motivo ?? 'Não deu para cancelar.')
                // O app pede; o sistema cancela a tarefa pela regra "ninguém iniciou" (06, 4.3, regra 5).
                comoAtor(contextoSistema, () => repos.tarefas.cancelar(t.id, `pelo cliente no app: ${motivo.trim()}`))
                setExtras((m) => ({ ...m, [t.id]: { ...m[t.id], motivoCancelamento: motivo.trim() } }))
                loja.registrar(ator(ctx), `Cancelou o pedido ${t.codigo} (${t.titulo}): ${motivo.trim()}`)
                setCancelar(false)
                ctx.avisarApp('Pedido cancelado.')
              }}
            >
              Cancelar o pedido
            </Button>
          }
        >
          <p className="text-sm">Ninguém começou ainda, então dá para cancelar aqui. Conte o motivo (fica no histórico).</p>
          <AreaTexto rotulo="Motivo" valor={motivo} onMudar={setMotivo} placeholder="Ex.: desistimos da contratação" linhas={2} />
        </Folha>
      )}
    </div>
  )
}

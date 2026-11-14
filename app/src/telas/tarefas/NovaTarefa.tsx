import { useMemo, useState } from 'react'
import { useLoja } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import { useAcao } from '@/components/kit'
import { Campo, CampoEscolha, GavetaFormulario, Interruptor, Segmentado } from '@/components/ui/formulario'
import { atividade, atividades, rotuloAutonomia } from '@/dados/atividades-s04'
import type { PedidoNovaTarefa } from '@/dados/tipos'
import { useAparencia } from '@/hooks/useAparencia'
import type { SetorIntegrante } from '@/theme/tipos'
import { opcoesResponsavel } from './FichaTarefa'
import { criarTarefa, HOJE_ISO, moldeChecklist, type ItemChecklist } from './modelo'
import { Entrada } from './pecas'

const origemEntidade = (o?: PedidoNovaTarefa['origem']) => (o === 'conversa' || o === 'conversa_interna' ? 'conversa' : o === 'pedido_cliente' ? 'pedido_cliente' : o === 'integrante' ? 'integrante' : o === 'trilha' ? 'trilha' : o === 'obrigacao' ? 'obrigacao' : 'pessoa')

/**
 * Nova tarefa (S04-T06; contrato C4): atividade do catálogo obrigatória,
 * cliente ou interna (sem cliente), competência, prazos, responsável pessoa
 * ou integrante e checklist (molde da atividade mais itens livres). Lembrete
 * interno que só some com confirmação explícita (C2-29).
 */
export function NovaTarefa({ p, onFechar, onCriada }: { p: PedidoNovaTarefa; onFechar: () => void; onCriada: (id: string) => void }) {
  const loja = useLoja()
  const { usuario } = useSessao()
  const aparencia = useAparencia()
  const executar = useAcao()
  const [setor, setSetor] = useState<SetorIntegrante>(p.setor)
  const [busca, setBusca] = useState('')
  const [atv, setAtv] = useState(p.atividade && atividade(p.atividade) ? p.atividade : '')
  const [titulo, setTitulo] = useState(p.titulo ?? '')
  const clienteInicial = p.cliente ? loja.clientes.find((c) => c.nome === p.cliente || c.id === p.cliente)?.id : undefined
  const [interna, setInterna] = useState(!clienteInicial && p.origem === 'conversa_interna')
  const [cliente, setCliente] = useState(clienteInicial ?? loja.clientes[0]?.id ?? '')
  const [competencia, setCompetencia] = useState('11/2026')
  const [prazo, setPrazo] = useState('2026-11-20')
  const [prazoLegal, setPrazoLegal] = useState('')
  const nomeIntegrante = aparencia({ setor }).nome
  const opcoes = opcoesResponsavel(setor, nomeIntegrante)
  const [resp, setResp] = useState(`pessoa:${usuario.id}`)
  const [itensLivres, setItensLivres] = useState<string[]>([])
  const [novoItem, setNovoItem] = useState('')
  const [lembrete, setLembrete] = useState(false)
  const [recorrencia, setRecorrencia] = useState<'nenhuma' | 'diaria' | 'semanal' | 'mensal'>('nenhuma')
  const [tentou, setTentou] = useState(false)

  const prefixos: Partial<Record<SetorIntegrante, string[]>> = { fiscal: ['FIS'], notas: ['NFE'], dp: ['DP'], contabil: ['CTB'], societario: ['SOC', 'CIC'], consultor: ['CON'], gestao_atendimento: ['GES', 'CIC'], financeiro_escritorio: ['FIN', 'GES'], bpo_financeiro: ['FIN', 'BPO'] }
  const candidatas = useMemo(() => {
    const q = busca.trim().toLowerCase()
    const doSetor = atividades.filter((a) => (prefixos[setor] ?? []).some((x) => a.id.startsWith(x)))
    return (q ? atividades : doSetor).filter((a) => !q || a.id.toLowerCase().includes(q) || a.nome.toLowerCase().includes(q)).slice(0, 60)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busca, setor])
  const a = atividade(atv)
  const molde: ItemChecklist[] = a ? moldeChecklist({ atividade_id: a.id, setor_id: setor }) : []
  const erroAtv = tentou && !atv ? 'Escolha a atividade do catálogo (01, ad. 22).' : undefined
  const erroPrazo = tentou && !prazo ? 'Informe o prazo interno.' : prazo && prazo < HOJE_ISO ? 'O prazo interno já passou: a tarefa nasce atrasada.' : undefined
  const r = opcoes.find((o) => o.valor === resp)?.r ?? opcoes[0].r
  const setores: SetorIntegrante[] = ['societario', 'fiscal', 'notas', 'dp', 'contabil', 'consultor', 'gestao_atendimento']

  return (
    <GavetaFormulario
      aberta
      largura="lg"
      onFechar={onFechar}
      titulo={`Nova tarefa · ${aparencia({ setor }).nome}`}
      descricao={p.origem && p.origem !== 'pessoa' ? `Vinda de ${p.origem === 'conversa' ? 'uma conversa do CRM' : p.origem === 'conversa_interna' ? 'uma conversa interna' : p.origem === 'pedido_cliente' ? 'um pedido do cliente' : p.origem}. Aparece na aba do setor, na lista do responsável e na ficha do cliente.` : 'Aparece na aba do setor, na lista do responsável e na ficha do cliente.'}
      acao="Criar"
      onAcao={() => {
        setTentou(true)
        if (!atv || !prazo) return
        const nova = executar(
          () =>
            criarTarefa({
              atividade_id: atv,
              titulo: titulo.trim() || a?.nome || atv,
              setor_id: setor,
              cliente_id: interna ? null : cliente,
              competencia: interna ? undefined : competencia,
              prazo_interno: prazo,
              prazo_legal: prazoLegal || null,
              responsavel: r,
              checklist: [...molde, ...itensLivres.map((item) => ({ item, feito: false }))],
              origem: origemEntidade(p.origem),
              origem_ref: p.origemRef ?? null,
              extras: { ...(lembrete ? { exige_confirmacao: true } : {}), ...(recorrencia !== 'nenhuma' ? { recorrencia } : {}), ...(p.origem === 'conversa_interna' ? { conversa_interna: p.origemRef ?? 'conversa interna' } : {}), ...(interna ? { cliente_nome: '' } : {}) },
            }),
          { sucesso: 'Tarefa criada' },
        )
        if (nova) {
          loja.registrar(usuario.nome, `Criou a tarefa ${nova.atividade_id} · ${nova.titulo}`)
          onCriada(nova.id)
        }
      }}
    >
      <Campo rotulo="Setor">{(id) => <CampoEscolha id={id} valor={setor} onMudar={(v) => (setSetor(v as SetorIntegrante), setAtv(''))} opcoes={setores.map((s) => ({ valor: s, rotulo: aparencia({ setor: s }).nome }))} />}</Campo>
      <Campo rotulo="Atividade do catálogo" erro={erroAtv} ajuda={a ? `${a.nome} · o integrante ${rotuloAutonomia[a.autonomia]} · fase ${a.fase}` : 'Obrigatória. Busque pelo código ou pelo nome.'}>
        {(id) => (
          <div className="flex flex-col gap-1.5">
            <Entrada id={id} placeholder="Buscar: DP-005, admissão, DCTFWeb…" value={busca} onChange={(e) => setBusca(e.target.value)} />
            <select aria-label="Atividade" size={5} className="bg-popover rounded-md border p-1 text-sm" value={atv} onChange={(e) => setAtv(e.target.value)}>
              {candidatas.map((x) => (
                <option key={x.id} value={x.id} className="truncate py-0.5">
                  {x.id} · {x.nome}
                </option>
              ))}
            </select>
          </div>
        )}
      </Campo>
      <Campo rotulo="Título (opcional)" ajuda="Sem título, vale o nome da atividade.">
        {(id) => <Entrada id={id} value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder={a?.nome ?? 'Ex.: Conferir retenções de novembro'} />}
      </Campo>
      <Interruptor ligado={interna} onMudar={setInterna} rotulo="Tarefa interna, sem cliente" detalhe="Ex.: backup, rotina do escritório (C2-29)." />
      {!interna && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo rotulo="Cliente">{(id) => <CampoEscolha id={id} valor={cliente} onMudar={setCliente} opcoes={loja.clientes.map((c) => ({ valor: c.id, rotulo: c.nome }))} />}</Campo>
          <Campo rotulo="Competência">{(id) => <Entrada id={id} value={competencia} onChange={(e) => setCompetencia(e.target.value)} />}</Campo>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo rotulo="Prazo interno" erro={erroPrazo} ajuda="O combinado da equipe.">
          {(id) => <Entrada id={id} type="date" value={prazo} onChange={(e) => setPrazo(e.target.value)} />}
        </Campo>
        <Campo rotulo="Prazo legal (opcional)" ajuda="Vem do calendário quando é obrigação.">
          {(id) => <Entrada id={id} type="date" value={prazoLegal} onChange={(e) => setPrazoLegal(e.target.value)} />}
        </Campo>
      </div>
      <Campo rotulo="Responsável" ajuda={r.tipo === 'integrante' && a ? `O integrante ${rotuloAutonomia[a.autonomia]}.` : undefined}>
        {(id) => <CampoEscolha id={id} valor={resp} onMudar={setResp} opcoes={opcoes.map((o) => ({ valor: o.valor, rotulo: o.rotulo }))} />}
      </Campo>
      <Campo rotulo="Checklist" ajuda={molde.length ? 'Molde da atividade, mais os itens livres que você acrescentar.' : 'Escolha a atividade para ver o molde.'}>
        {() => (
          <div className="flex flex-col gap-1">
            <ul className="flex flex-col gap-0.5 text-sm">
              {molde.map((i) => (
                <li key={i.item} className="text-muted-foreground">
                  ☐ {i.item}
                  {i.obrigatorio ? ' · obrigatório' : ''}
                </li>
              ))}
              {itensLivres.map((i, k) => (
                <li key={k} className="flex items-center gap-2">
                  ☐ {i}
                  <button type="button" className="text-muted-foreground cursor-pointer text-xs underline" onClick={() => setItensLivres(itensLivres.filter((_, j) => j !== k))}>
                    tirar
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex gap-1.5">
              <Entrada aria-label="Item livre" placeholder="Item livre" value={novoItem} onChange={(e) => setNovoItem(e.target.value)} className="h-8" />
              <button
                type="button"
                className="hover:bg-accent shrink-0 cursor-pointer rounded-md border px-2 text-xs"
                onClick={() => {
                  if (novoItem.trim()) setItensLivres([...itensLivres, novoItem.trim()])
                  setNovoItem('')
                }}
              >
                Acrescentar
              </button>
            </div>
          </div>
        )}
      </Campo>
      <Interruptor ligado={lembrete} onMudar={setLembrete} rotulo="Lembrete que só some com confirmação" detalhe="Concluir pede a confirmação explícita de que foi feito (C2-29)." />
      {(lembrete || interna) && (
        <Campo rotulo="Repetir">
          {() => (
            <Segmentado
              rotulo="Repetir"
              valor={recorrencia}
              onMudar={setRecorrencia}
              opcoes={[
                { valor: 'nenhuma', rotulo: 'Não' },
                { valor: 'diaria', rotulo: 'Diária' },
                { valor: 'semanal', rotulo: 'Semanal' },
                { valor: 'mensal', rotulo: 'Mensal' },
              ]}
            />
          )}
        </Campo>
      )}
    </GavetaFormulario>
  )
}

import { ArrowSquareOutIcon, ProhibitIcon, ScissorsIcon, SparkleIcon, TagIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { useLoja } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import { useAcao } from '@/components/kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Campo, CampoArea, CampoEscolha, CampoTexto, GavetaFormulario, Segmentado } from '@/components/ui/formulario'
import { atividadesInternas, catalogoTs, ehInterna, rotuloAtividade, setorDaAtividade } from '@/dados/timesheet-catalogo'
import { agoraDemo, diaDe, dh, duracaoMin, fmtH, hm, minHora } from '@/dados/timesheet-tempo'
import type { Ausencia, ContestacaoSessao, DuracaoPadrao, ItemConfirmacao, SessaoTrabalho } from '@/nucleo/modelo/entidades'
import { itemNaoEraEsta, repos, rotuloMotivoContestacao, type Parte } from '@/nucleo/repositorios'
import { useNavegacao } from '@/ambiente/loja'
import { Amostra } from './graficos'
import { brl, confiancaDaLinha, nomeSetor, rotuloConfianca, rotuloOrigem, useTimesheet, type LinhaDia, type LinhaRent } from './dados'

const opcoesAtividade = [...catalogoTs.map((a) => ({ valor: a.id, rotulo: `${a.id} · ${a.rotulo}` }))]
const opcoesInternas = atividadesInternas.map((a) => ({ valor: a.id, rotulo: a.rotulo }))

/** Corrigir, dividir ou classificar um intervalo (05, 5.2): tudo em lista, nunca texto livre. */
export function Corrigir({ titulo, descricao, inicio, fim, sugestao, alternativa, onFechar, onSalvar, permitirSemFim }: { titulo: string; descricao: string; inicio: string; fim?: string | null; sugestao?: { cliente_id?: string | null; atividade_id?: string | null }; alternativa?: string | null; onFechar: () => void; onSalvar: (partes: Parte[]) => boolean | void; permitirSemFim?: boolean }) {
  const ts = useTimesheet()
  const dia = diaDe(inicio)
  const clientes = ts.clientes.filter((c) => !c.arquivado_em)
  const [modo, setModo] = useState<'cliente' | 'interno' | 'dividir'>(sugestao?.atividade_id && ehInterna(sugestao.atividade_id) ? 'interno' : 'cliente')
  const [cliente, setCliente] = useState(sugestao?.cliente_id ?? clientes[0]?.id ?? '')
  const [atividade, setAtividade] = useState(sugestao?.atividade_id && !ehInterna(sugestao.atividade_id) ? sugestao.atividade_id : opcoesAtividade[0].valor)
  const [interno, setInterno] = useState(sugestao?.atividade_id && ehInterna(sugestao.atividade_id) ? sugestao.atividade_id : opcoesInternas[0].valor)
  const [ini, setIni] = useState(hm(inicio))
  const [f, setF] = useState(fim ? hm(fim) : hm(new Date(Date.parse(inicio) + 15 * 60000).toISOString()))
  const meio = Math.round((minHora(ini) + minHora(f)) / 2)
  const [corte, setCorte] = useState(`${String(Math.floor(meio / 60)).padStart(2, '0')}:${String(meio % 60).padStart(2, '0')}`)
  const [cliente2, setCliente2] = useState(alternativa ?? clientes.find((c) => c.id !== cliente)?.id ?? '')
  const [atividade2, setAtividade2] = useState(atividade)
  const invalido = ini >= f || (modo === 'dividir' && (corte <= ini || corte >= f || !cliente2)) || (modo !== 'interno' && !cliente)
  const salvar = () => {
    const parte = (c: string | null, a: string, de: string, ate: string): Parte => ({ cliente_id: c, atividade_id: a, rotulo: rotuloAtividade(a), inicio: dh(dia, de), fim: dh(dia, ate), setor_id: setorDaAtividade(a) })
    const partes = modo === 'interno' ? [parte(null, interno, ini, f)] : modo === 'dividir' ? [parte(cliente, atividade, ini, corte), parte(cliente2, atividade2, corte, f)] : [parte(cliente, atividade, ini, f)]
    if (onSalvar(partes) !== false) onFechar()
  }
  const opcoesClientes = clientes.map((c) => ({ valor: c.id, rotulo: c.nome }))
  return (
    <GavetaFormulario aberta onFechar={onFechar} titulo={titulo} descricao={descricao} acao="Confirmar" acaoDesabilitada={invalido} onAcao={salvar}>
      <Campo rotulo="Era">
        {() => (
          <Segmentado
            rotulo="Tipo"
            valor={modo}
            onMudar={setModo}
            opcoes={[
              { valor: 'cliente', rotulo: 'Trabalho de cliente' },
              { valor: 'interno', rotulo: 'Interno' },
              ...(fim || permitirSemFim ? [{ valor: 'dividir' as const, rotulo: 'Dois clientes' }] : []),
            ]}
          />
        )}
      </Campo>
      {modo === 'interno' ? (
        <Campo rotulo="Atividade interna" ajuda="Entra na capacidade, não na rentabilidade de cliente.">
          {(id) => <CampoEscolha id={id} valor={interno} onMudar={setInterno} opcoes={opcoesInternas} />}
        </Campo>
      ) : (
        <>
          <Campo rotulo={modo === 'dividir' ? 'Primeiro cliente' : 'Cliente'}>{(id) => <CampoEscolha id={id} valor={cliente} onMudar={setCliente} opcoes={opcoesClientes} />}</Campo>
          <Campo rotulo={modo === 'dividir' ? 'Atividade do primeiro' : 'Atividade'}>{(id) => <CampoEscolha id={id} valor={atividade} onMudar={setAtividade} opcoes={opcoesAtividade} />}</Campo>
        </>
      )}
      <div className="grid grid-cols-2 gap-3">
        <Campo rotulo="Começou">{(id) => <CampoTexto id={id} tipo="time" valor={ini} onMudar={setIni} />}</Campo>
        <Campo rotulo="Terminou" erro={ini >= f ? 'Termina antes de começar.' : undefined}>
          {(id) => <CampoTexto id={id} tipo="time" valor={f} onMudar={setF} />}
        </Campo>
      </div>
      {modo === 'dividir' && (
        <>
          <Campo rotulo="Troca de cliente às" ajuda={`Entre ${ini} e ${f}.`} erro={corte <= ini || corte >= f ? 'Fora do intervalo.' : undefined}>
            {(id) => <CampoTexto id={id} tipo="time" valor={corte} onMudar={setCorte} className="w-32" />}
          </Campo>
          <Campo rotulo="Segundo cliente">{(id) => <CampoEscolha id={id} valor={cliente2} onMudar={setCliente2} opcoes={opcoesClientes.filter((c) => c.valor !== cliente)} />}</Campo>
          <Campo rotulo="Atividade do segundo">{(id) => <CampoEscolha id={id} valor={atividade2} onMudar={setAtividade2} opcoes={opcoesAtividade} />}</Campo>
          <p className="bg-sunken flex items-center gap-2 rounded-lg px-3 py-2 text-sm">
            <ScissorsIcon className="size-4 shrink-0" /> {ini}–{corte} {ts.nomeCliente(cliente)} · {corte}–{f} {ts.nomeCliente(cliente2)}
          </p>
        </>
      )}
      <p className="text-muted-foreground text-xs">Nada se apaga: a correção vira sessão nova confirmada e a anterior fica guardada como substituída.</p>
    </GavetaFormulario>
  )
}

/** Detalhe de uma linha do dia: evidências e as ações da própria pessoa (confirmar, corrigir, contestar, "não era esta"). */
export function DetalheLinha({ linha, onFechar }: { linha: LinhaDia; onFechar: () => void }) {
  const ts = useTimesheet()
  const executar = useAcao()
  const nav = useNavegacao()
  const [modo, setModo] = useState<'ver' | 'contestar' | 'corrigir'>('ver')
  const [motivo, setMotivo] = useState<ContestacaoSessao['motivo']>('cliente')
  const s = linha.tipo === 'sessao' ? linha.s : undefined
  const i = linha.tipo === 'item' ? linha.i : undefined
  const minha = s ? s.usuario_dono_id === ts.usuario.id : i ? i.usuario_id === ts.usuario.id : true
  const outros = ts.clientes.filter((c) => c.id !== s?.cliente_id && !c.arquivado_em)
  const [cliente, setCliente] = useState(outros[0]?.id ?? '')
  const [atividade, setAtividade] = useState(opcoesAtividade[0].valor)
  const [ini, setIni] = useState(hm(linha.inicio))
  const [fim, setFim] = useState(hm(linha.fim))
  const [nota, setNota] = useState('')
  const c = confiancaDaLinha(linha)
  const titulo = s ? `${s.atividade_id ? `${s.atividade_id} ` : ''}${s.rotulo}` : i ? i.texto : 'Sem classificação'
  const dia = diaDe(linha.inicio)

  if (modo === 'corrigir' || linha.tipo !== 'sessao')
    return (
      <Corrigir
        titulo={`${s ? 'Corrigir' : 'Classificar'} · ${hm(linha.inicio)}–${hm(linha.fim)}`}
        descricao={i ? `${i.texto}. Pista: ${i.pista}.` : s ? `${titulo} · ${ts.nomeCliente(s.cliente_id)}` : 'Intervalo sem sessão nem pista, dentro da jornada.'}
        inicio={linha.inicio}
        fim={linha.fim}
        sugestao={s ? { cliente_id: s.cliente_id, atividade_id: s.atividade_id } : i?.sugestao ?? undefined}
        alternativa={i?.alternativa_cliente_id}
        onFechar={onFechar}
        onSalvar={(partes) => {
          if (s) return !!executar(() => repos.sessoes.corrigir(s.id, partes), { sucesso: partes.length > 1 ? 'Sessão dividida' : 'Sessão corrigida' })
          if (i) return !!executar(() => repos.itensConfirmacao.confirmar(i.id, partes), { sucesso: 'Confirmado' })
          return !!executar(
            () =>
              partes.map((p) =>
                repos.sessoes.criar(
                  { ator_tipo: 'pessoa', ator_id: ts.usuario.id, usuario_dono_id: ts.usuario.id, cliente_id: p.cliente_id ?? null, setor_id: p.setor_id ?? setorDaAtividade(p.atividade_id), atividade_id: p.atividade_id ?? null, rotulo: p.rotulo, origem: 'confirmacao', inicio: p.inicio, fim: p.fim, confianca: 'confirmada', evidencias: ['classificado pela pessoa (intervalo sem sessão)'], pacote: /^(FIN|BPO)-/.test(p.atividade_id ?? '') ? 'bpo' : 'contabil' },
                  { ferramenta: 'timesheet.confirmar', texto: `${ts.usuario.nome} classificou ${hm(p.inicio)}–${hm(p.fim)}: ${p.rotulo}` },
                ),
              ),
            { sucesso: 'Intervalo classificado' },
          )
        }}
      />
    )

  const correcao = motivo === 'cliente' ? ts.nomeCliente(cliente) : motivo === 'atividade' ? `${atividade} · ${rotuloAtividade(atividade)}` : motivo === 'tempo' ? `${ini}–${fim}` : 'descartar'
  const dados: ContestacaoSessao['correcao_dados'] = motivo === 'cliente' ? { cliente_id: cliente } : motivo === 'atividade' ? { atividade_id: atividade, rotulo: rotuloAtividade(atividade) } : motivo === 'tempo' ? { inicio: dh(dia, ini), fim: dh(dia, fim) } : undefined
  const podeContestar = !!s && minha && s.ator_tipo === 'pessoa' && !s.contestacao && !s.substituida_por && s.confianca !== 'estimada'
  const podeNaoEraEsta = !!s && minha && !!s.tarefa_id && s.origem === 'plataforma' && !s.substituida_por && !s.contestacao
  const extra = s && ts.ehExtra(s)
  return (
    <GavetaFormulario
      aberta
      onFechar={onFechar}
      titulo={`${hm(linha.inicio)}–${hm(linha.fim)} · ${titulo}`}
      descricao={`${s ? ts.nomeCliente(s.cliente_id) : i?.sugestao?.cliente_id ? ts.nomeCliente(i.sugestao.cliente_id) : 'sem cliente'} · ${fmtH(duracaoMin(linha))}${s ? ` · ${nomeSetor(s.setor_id)}` : ''}`}
      acao={modo === 'contestar' ? 'Enviar contestação' : 'Fechar'}
      acaoDesabilitada={modo === 'contestar' && motivo === 'tempo' && ini >= fim}
      onAcao={() => {
        if (modo !== 'contestar' || !s) return onFechar()
        if (executar(() => repos.sessoes.contestar(s.id, { motivo, correcao, correcao_dados: dados, nota: nota || undefined }), { sucesso: 'Contestação enviada ao Gestor' })) onFechar()
      }}
      secundaria={
        modo === 'ver' && s && minha && !s.substituida_por ? (
          <span className="flex flex-wrap gap-1.5">
            {s.confianca === 'estimada' && (
              <Button type="button" variant="outline" className="rounded-full" onClick={() => executar(() => repos.sessoes.confirmar(s.id), { sucesso: 'Confirmado' }) && onFechar()}>
                Confirmar
              </Button>
            )}
            {!s.contestacao && (
              <Button type="button" variant="ghost" className="rounded-full" onClick={() => setModo('corrigir')}>
                Corrigir ou dividir
              </Button>
            )}
            {podeContestar && (
              <Button type="button" variant="ghost" className="rounded-full" onClick={() => setModo('contestar')}>
                Contestar
              </Button>
            )}
          </span>
        ) : undefined
      }
    >
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Amostra c={c} /> {rotuloConfianca[c]}
        {s && <span className="text-muted-foreground">· origem: {rotuloOrigem(s)}</span>}
        {s?.fora_da_jornada && <span className="text-warning-text">· fora da jornada</span>}
        {extra && (
          <Badge variant="outline">
            <TagIcon /> serviço extra (C2-25)
          </Badge>
        )}
        {s?.ao_vivo && <Badge variant="sucesso">contando agora</Badge>}
      </div>
      {s && (
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Evidências</span>
          <ul className="flex flex-col gap-1">
            {s.evidencias.map((e, k) => (
              <li key={k} className="bg-sunken rounded-md px-3 py-1.5 text-sm">
                {e}
              </li>
            ))}
          </ul>
          {s.tarefa_id && ts.tarefa(s.tarefa_id) && (
            <Button type="button" size="sm" variant="ghost" className="w-fit rounded-full" onClick={() => (nav.irPara({ modulo: 'painel', aba: abaDoSetor(s.setor_id), tarefa: s.tarefa_id! }), onFechar())}>
              <ArrowSquareOutIcon /> Abrir a tarefa
            </Button>
          )}
        </div>
      )}
      {i && <p className="bg-sunken rounded-lg px-3 py-2.5 text-sm">Pista: {i.pista}. Use Confirmações para resolver em um clique.</p>}
      {s?.contestacao && (
        <p className="bg-sunken rounded-lg px-3 py-2.5 text-sm">
          Contestada: {rotuloMotivoContestacao(s.contestacao.motivo)} → {s.contestacao.correcao} ·{' '}
          {s.contestacao.status === 'pendente' ? 'aguardando o Gestor' : s.contestacao.status === 'aceita' ? `aceita por ${s.contestacao.decidido_por_nome}` : `recusada por ${s.contestacao.decidido_por_nome}: ${s.contestacao.motivo_recusa}`}
        </p>
      )}
      {s?.anomalia && (
        <p className="bg-warning/10 rounded-lg px-3 py-2.5 text-sm">
          Sessão anômala: {s.anomalia.texto}
          {s.anomalia.revisao ? ` · revisada (${s.anomalia.revisao})` : ''}
        </p>
      )}
      {podeNaoEraEsta && modo === 'ver' && (
        <button
          type="button"
          className="text-muted-foreground flex w-fit cursor-pointer items-center gap-1.5 text-xs hover:underline"
          onClick={() => executar(() => repos.itensConfirmacao.criar(itemNaoEraEsta(s), { ferramenta: 'timesheet.registrar', texto: `${ts.usuario.nome} marcou "não era esta" em ${s.atividade_id} ${s.rotulo}` }), { sucesso: '"Não era esta": o item foi para Confirmações' }) && onFechar()}
        >
          <ProhibitIcon className="size-3.5" /> Não era esta tarefa (abri por engano)
        </button>
      )}
      {modo === 'contestar' && (
        <>
          <Campo rotulo="O que está errado">
            {() => (
              <Segmentado
                rotulo="Motivo"
                valor={motivo}
                onMudar={setMotivo}
                opcoes={[
                  { valor: 'cliente', rotulo: 'Cliente' },
                  { valor: 'atividade', rotulo: 'Atividade' },
                  { valor: 'tempo', rotulo: 'Tempo' },
                  { valor: 'nao_era_trabalho', rotulo: 'Não era trabalho' },
                ]}
              />
            )}
          </Campo>
          {motivo === 'cliente' && <Campo rotulo="Era o cliente">{(id) => <CampoEscolha id={id} valor={cliente} onMudar={setCliente} opcoes={outros.map((x) => ({ valor: x.id, rotulo: x.nome }))} />}</Campo>}
          {motivo === 'atividade' && <Campo rotulo="Era a atividade">{(id) => <CampoEscolha id={id} valor={atividade} onMudar={setAtividade} opcoes={[...opcoesAtividade, ...opcoesInternas]} />}</Campo>}
          {motivo === 'tempo' && (
            <div className="grid grid-cols-2 gap-3">
              <Campo rotulo="Começou">{(id) => <CampoTexto id={id} tipo="time" valor={ini} onMudar={setIni} />}</Campo>
              <Campo rotulo="Terminou" erro={ini >= fim ? 'Termina antes de começar.' : undefined}>
                {(id) => <CampoTexto id={id} tipo="time" valor={fim} onMudar={setFim} />}
              </Campo>
            </div>
          )}
          <Campo rotulo="Nota (opcional)" ajuda="Ninguém é obrigado a explicar. O Gestor decide com as evidências.">
            {(id) => <CampoArea id={id} linhas={2} valor={nota} onMudar={setNota} />}
          </Campo>
        </>
      )}
    </GavetaFormulario>
  )
}

export const abaDoSetor = (s: string) => ({ societario: 'societario', fiscal: 'fiscal', notas: 'notas', dp: 'dp', contabil: 'contabil', consultor: 'consultoria' } as Record<string, string>)[s] ?? 'gestao'

/** Decidir uma contestação (Gestor; 05, 8.3): aceitar vira confirmada com a correção; recusar pede motivo em lista. */
export function DecidirContestacao({ s, onFechar }: { s: SessaoTrabalho; onFechar: () => void }) {
  const ts = useTimesheet()
  const executar = useAcao()
  const [decisao, setDecisao] = useState<'aceitar' | 'recusar'>('aceitar')
  const [motivo, setMotivo] = useState('as evidências mostram a tarefa certa')
  const c = s.contestacao!
  return (
    <GavetaFormulario
      aberta
      onFechar={onFechar}
      titulo={`Contestação de ${ts.nomeUsuario(s.usuario_dono_id)}`}
      descricao={`${diaDe(s.inicio).split('-').reverse().join('/')} · ${hm(s.inicio)}–${hm(s.fim)} · ${s.atividade_id ?? ''} ${s.rotulo} · ${ts.nomeCliente(s.cliente_id)}`}
      acao={decisao === 'aceitar' ? 'Aceitar' : 'Recusar'}
      onAcao={() => {
        if (executar(() => repos.sessoes.decidirContestacao(s.id, decisao === 'aceitar', decisao === 'recusar' ? motivo : ''), { sucesso: decisao === 'aceitar' ? 'Contestação aceita: a sessão foi corrigida' : 'Contestação recusada; a pessoa vê o motivo' })) onFechar()
      }}
    >
      <div className="bg-sunken flex flex-col gap-1 rounded-lg px-3 py-2.5 text-sm">
        <span>
          <strong className="font-medium">Motivo:</strong> {rotuloMotivoContestacao(c.motivo)} → {c.correcao}
        </span>
        {c.nota && <span className="text-muted-foreground">“{c.nota}”</span>}
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Evidências</span>
        <ul className="flex flex-col gap-1">
          {s.evidencias.map((e, k) => (
            <li key={k} className="bg-sunken rounded-md px-3 py-1.5 text-sm">
              {e}
            </li>
          ))}
        </ul>
      </div>
      <Campo rotulo="Decisão">
        {() => (
          <Segmentado
            rotulo="Decisão"
            valor={decisao}
            onMudar={setDecisao}
            opcoes={[
              { valor: 'aceitar', rotulo: 'Aceitar a correção' },
              { valor: 'recusar', rotulo: 'Recusar' },
            ]}
          />
        )}
      </Campo>
      {decisao === 'recusar' && <Campo rotulo="Motivo da recusa">{(id) => <CampoEscolha id={id} valor={motivo} onMudar={setMotivo} opcoes={['as evidências mostram a tarefa certa', 'o horário bate com os eventos', 'era trabalho do cliente', 'outro (conversar com a pessoa)'].map((x) => ({ valor: x, rotulo: x }))} />}</Campo>}
      <p className="text-muted-foreground text-xs">A pessoa vê a decisão no Meu tempo. Nada se apaga: a correção é uma sessão nova que substitui a anterior.</p>
    </GavetaFormulario>
  )
}

/** Atribuir um arquivo sem pessoa (05, 5.1, regra 5): a pessoa recebe "foi você?". */
export function AtribuirArtefato({ item, onFechar }: { item: ItemConfirmacao; onFechar: () => void }) {
  const ts = useTimesheet()
  const executar = useAcao()
  const pessoas = ts.usuarios.filter((u) => u.situacao === 'ativo')
  const [p, setP] = useState(String(item.extras?.sugestao_pessoa ?? pessoas[0]?.id ?? ''))
  return (
    <GavetaFormulario aberta onFechar={onFechar} titulo="Quem fez?" descricao={item.texto} acao="Atribuir" acaoDesabilitada={!p} onAcao={() => executar(() => repos.itensConfirmacao.atribuir(item.id, p, ts.nomeUsuario(p)), { sucesso: `Atribuído a ${ts.nomeUsuario(p)}: ela ou ele confirma em Confirmações` }) && onFechar()}>
      <Campo rotulo="Pessoa" ajuda="A pessoa recebe um item de confirmação (“foi você?”); se recusar, o arquivo fica sem sessão.">
        {(id) => <CampoEscolha id={id} valor={p} onMudar={setP} opcoes={pessoas.map((x) => ({ valor: x.id, rotulo: x.nome }))} />}
      </Campo>
    </GavetaFormulario>
  )
}

const tiposAusencia: { valor: Ausencia['tipo']; rotulo: string }[] = [
  { valor: 'ferias', rotulo: 'férias' },
  { valor: 'licenca', rotulo: 'licença' },
  { valor: 'atestado', rotulo: 'atestado' },
  { valor: 'folga', rotulo: 'folga' },
  { valor: 'treinamento_externo', rotulo: 'treinamento externo' },
]
export const rotuloAusencia = (t: Ausencia['tipo']) => tiposAusencia.find((x) => x.valor === t)?.rotulo ?? t

/** Registrar ausência (05, ad. 16; GES-403): sai da capacidade e alimenta o substituto. */
export function RegistrarAusencia({ pessoas, onFechar }: { pessoas: { id: string; nome: string }[]; onFechar: () => void }) {
  const executar = useAcao()
  const { usuario } = useSessao()
  const [a, setA] = useState({ pessoa: pessoas[0]?.id ?? '', tipo: 'ferias' as Ausencia['tipo'], de: '', ate: '', substituto: '', observacao: '' })
  const erroData = a.de && a.ate && a.ate < a.de ? 'O fim é antes do início.' : undefined
  const ok = a.pessoa && a.de && a.ate && !erroData
  const nome = pessoas.find((p) => p.id === a.pessoa)?.nome
  return (
    <GavetaFormulario
      aberta
      onFechar={onFechar}
      titulo="Registrar ausência"
      descricao="Sai das horas disponíveis da pessoa; a capacidade e a carga prevista se ajustam. O substituto aparece nas tarefas (Gestão)."
      acao="Registrar"
      acaoDesabilitada={!ok}
      onAcao={() =>
        executar(() => repos.ausencias.criar({ usuario_id: a.pessoa, tipo: a.tipo, inicio: a.de, fim: a.ate, registrada_por: usuario.id, substituto_id: a.substituto || null, observacao: a.observacao || undefined, extras: { pessoa_nome: nome } }, { texto: `${usuario.nome} registrou ${rotuloAusencia(a.tipo)} de ${nome} (${a.de.split('-').reverse().join('/')} a ${a.ate.split('-').reverse().join('/')})` }), { sucesso: `Ausência de ${nome} registrada` }) && onFechar()
      }
    >
      <Campo rotulo="Pessoa">{(id) => <CampoEscolha id={id} valor={a.pessoa} onMudar={(v) => setA({ ...a, pessoa: v })} opcoes={pessoas.map((p) => ({ valor: p.id, rotulo: p.nome }))} />}</Campo>
      <Campo rotulo="Tipo">{() => <Segmentado rotulo="Tipo" valor={a.tipo} onMudar={(v) => setA({ ...a, tipo: v })} opcoes={tiposAusencia} />}</Campo>
      <div className="grid grid-cols-2 gap-3">
        <Campo rotulo="De">{(id) => <CampoTexto id={id} tipo="date" valor={a.de} onMudar={(v) => setA({ ...a, de: v })} />}</Campo>
        <Campo rotulo="Até" erro={erroData}>
          {(id) => <CampoTexto id={id} tipo="date" valor={a.ate} onMudar={(v) => setA({ ...a, ate: v })} />}
        </Campo>
      </div>
      <Campo rotulo="Substituto (opcional)">{(id) => <CampoEscolha id={id} valor={a.substituto} onMudar={(v) => setA({ ...a, substituto: v })} opcoes={[{ valor: '', rotulo: 'sem substituto' }, ...pessoas.filter((p) => p.id !== a.pessoa).map((p) => ({ valor: p.id, rotulo: p.nome }))]} />}</Campo>
      <Campo rotulo="Observação (opcional)">{(id) => <CampoTexto id={id} valor={a.observacao} onMudar={(v) => setA({ ...a, observacao: v })} />}</Campo>
    </GavetaFormulario>
  )
}

/** Adotar a mediana medida como duração padrão (05, 11.2; Administrador). */
export function AdotarCalibracao({ linha, onFechar }: { linha: DuracaoPadrao; onFechar: () => void }) {
  const executar = useAcao()
  const [valor, setValor] = useState(String(linha.adotada_min ?? linha.mediana_min))
  const dif = Math.round(((linha.mediana_min - linha.catalogo_min) / linha.catalogo_min) * 100)
  return (
    <GavetaFormulario
      aberta
      onFechar={onFechar}
      titulo={`Calibrar ${linha.atividade_id} · ${linha.rotulo}`}
      descricao={`Catálogo: ${linha.catalogo_min} min por cliente-mês · medido: ${linha.mediana_min} min (mediana de ${linha.n} sessões, ${dif > 0 ? '+' : ''}${dif}%).`}
      acao="Adotar"
      acaoDesabilitada={!(Number(valor) > 0)}
      onAcao={() => executar(() => repos.duracoesPadrao.atualizar(linha.id, { adotada_min: Number(valor), origem: Number(valor) === linha.mediana_min ? 'calibracao' : 'escritorio' }, { texto: `Duração padrão de ${linha.atividade_id} passou a ${valor} min` }), { sucesso: `${linha.atividade_id}: ${valor} min adotados` }) && onFechar()}
    >
      <Campo rotulo="Duração padrão do escritório (min)" ajuda="Usada nas estimativas por artefato desta atividade. Clientes com 5 ou mais sessões medidas usam a mediana própria.">
        {(id) => <CampoTexto id={id} tipo="number" valor={valor} onMudar={setValor} className="w-32 tabular-nums" />}
      </Campo>
      <p className="text-muted-foreground text-xs">Sessões confirmadas não mudam; as estimadas futuras usam o novo valor.</p>
    </GavetaFormulario>
  )
}

/** Revisar sessão anômala (05, 11.3; Gestor): pedir correção à pessoa, descartar ou manter. */
export function RevisarAnomalia({ s, onFechar }: { s: SessaoTrabalho; onFechar: () => void }) {
  const ts = useTimesheet()
  const executar = useAcao()
  const [r, setR] = useState<'corrigida' | 'descartada' | 'mantida'>('corrigida')
  const revisar = () => {
    if (r === 'corrigida')
      return executar(() => {
        repos.itensConfirmacao.criar({ usuario_id: s.usuario_dono_id, setor_id: s.setor_id, dia: diaDe(s.inicio), inicio: s.inicio, fim: s.fim, tipo: 'sessao_longa', texto: `Confirma ${fmtH(duracaoMin(s))} em ${s.atividade_id ?? ''} ${s.rotulo}?`, pista: s.anomalia?.texto ?? 'sessão anômala', sugestao: { atividade_id: s.atividade_id, rotulo: s.rotulo, cliente_id: s.cliente_id, minutos: duracaoMin(s), tarefa_id: s.tarefa_id }, sessao_ref_id: s.id, situacao: 'pendente', expira_em: new Date(Date.parse(agoraDemo()) + 7 * 86400000).toISOString() }, { ferramenta: 'timesheet.revisar_anomalia' })
        return repos.sessoes.revisarAnomalia(s.id, 'corrigida')
      }, { sucesso: `${ts.nomeUsuario(s.usuario_dono_id)} recebeu o pedido de correção em Confirmações` }) && onFechar()
    executar(() => repos.sessoes.revisarAnomalia(s.id, r), { sucesso: r === 'descartada' ? 'Sessão descartada (fica guardada como substituída)' : 'Sessão mantida' }) && onFechar()
  }
  return (
    <GavetaFormulario aberta onFechar={onFechar} titulo="Revisar sessão anômala" descricao={`${ts.nomeUsuario(s.usuario_dono_id)} · ${diaDe(s.inicio).split('-').reverse().join('/')} · ${hm(s.inicio)}–${hm(s.fim)} · ${s.atividade_id ?? ''} ${s.rotulo}`} acao="Revisar" onAcao={revisar}>
      <p className="bg-warning/10 rounded-lg px-3 py-2.5 text-sm">{s.anomalia?.texto}</p>
      <ul className="flex flex-col gap-1">
        {s.evidencias.map((e, k) => (
          <li key={k} className="bg-sunken rounded-md px-3 py-1.5 text-sm">
            {e}
          </li>
        ))}
      </ul>
      <Campo rotulo="O que fazer">
        {() => (
          <Segmentado
            rotulo="Revisão"
            valor={r}
            onMudar={setR}
            opcoes={[
              { valor: 'corrigida', rotulo: 'Pedir correção à pessoa' },
              { valor: 'descartada', rotulo: 'Descartar' },
              { valor: 'mantida', rotulo: 'Manter' },
            ]}
          />
        )}
      </Campo>
      <p className="text-muted-foreground text-xs">O Gestor não muda o tempo de outra pessoa: a correção vai para ela como item de confirmação. Descartar tira da contagem e guarda o registro.</p>
    </GavetaFormulario>
  )
}

/** Propor reajuste (GES-014): o integrante de Gestão monta a proposta e devolve um cartão; nada vai ao cliente sem você. */
export function ProporReajuste({ r, custoHora, onFechar }: { r: LinhaRent; custoHora: number; onFechar: () => void }) {
  const loja = useLoja()
  const [margem, setMargem] = useState('25')
  const sugerido = Math.round(r.custo / (1 - Number(margem) / 100) / 50) * 50
  const atual = r.honorario ?? 0
  const pedir = () => {
    loja.iniciarTrabalho({
      id: `s06-reajuste-${r.cliente_id}-${Date.now()}`,
      integrante: 'i-atendimento',
      setor: 'gestao_atendimento',
      titulo: `Proposta de reajuste · ${r.nome}`,
      cliente: r.nome,
      inicio: `Vou montar a proposta de reajuste de ${r.nome} com o histórico de horas e os marcos do ano.`,
      etapas: ['Lendo 12 meses de horas e margem no Timesheet', 'Juntando os marcos (admissões, faixa estourada, regime)', `Calculando o honorário para ${margem}% de margem`, 'Rascunhando a carta ao cliente'],
      seg: 1.6,
      fim: {
        texto: `Proposta pronta: de ${atual ? brl(atual) : 'não informado'} para ${brl(sugerido)} por mês, com a justificativa pelos marcos do ano. Aprovando, ela entra na campanha de reajuste do Financeiro; nada vai ao cliente sem você.`,
        cartoes: [{ tipo: 'aprovacao', id: `s06-reaj-${r.cliente_id}-${Date.now().toString(36)}`, resumo: `Reajuste de ${r.nome}: ${brl(sugerido)}/mês`, argumentos: [{ rotulo: 'Honorário atual', valor: atual ? brl(atual) : 'não informado' }, { rotulo: 'Proposto', valor: brl(sugerido) }, { rotulo: 'Margem alvo', valor: `${margem}%` }, { rotulo: 'Custo medido no mês', valor: brl(r.custo) }], expiraEm: 'expira em 5 dias' }],
        aviso: `Proposta de reajuste de ${r.nome} pronta para aprovar`,
      },
    })
    loja.toast(`O integrante de Gestão começou a proposta de ${r.nome}.`, { modulo: 'inicio', aba: 'time', integrante: 'i-atendimento' }, 'Acompanhar', { tipo: 'integrante', setor: 'gestao_atendimento', estado: 'trabalhando' })
    onFechar()
  }
  return (
    <GavetaFormulario aberta onFechar={onFechar} titulo={`Propor reajuste · ${r.nome}`} descricao="Vira trabalho do integrante de Gestão, que devolve um cartão de aprovação; aprovado, entra na campanha do Financeiro. Nada é enviado ao cliente sem você." acao="Pedir ao integrante" onAcao={pedir}>
      <dl className="grid grid-cols-2 gap-2 text-sm">
        {[
          ['Honorário no período', r.honorario != null ? brl(r.honorario) : 'não informado'],
          ['Custo medido', brl(r.custo)],
          ['Horas', `${String(r.horas).replace('.', ',')} h × ${brl(custoHora)}`],
          ['Variáveis (agentes, serviços)', brl(r.variaveis)],
        ].map(([k, v]) => (
          <div key={k} className="bg-sunken rounded-md px-3 py-2">
            <dt className="text-muted-foreground text-xs">{k}</dt>
            <dd className="font-medium tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>
      <Campo rotulo="Margem alvo (%)">{(id) => <CampoTexto id={id} tipo="number" valor={margem} onMudar={setMargem} className="w-28 tabular-nums" />}</Campo>
      <p className="bg-sunken flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm">
        <SparkleIcon className="mt-0.5 size-4 shrink-0" /> Honorário sugerido: <strong className="font-medium tabular-nums">{brl(sugerido)}</strong>
        {atual ? ` (${sugerido > atual ? '+' : ''}${Math.round(((sugerido - atual) / atual) * 100)}%)` : ''}. O integrante junta os marcos do ano como justificativa.
      </p>
    </GavetaFormulario>
  )
}

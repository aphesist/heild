import { PlusIcon, TrashIcon } from '@phosphor-icons/react'
import { useLoja, usePersistente } from '@/ambiente/loja'
import { useState } from 'react'
import { ValorEditavel, type Opcao } from '@/components/kit'
import { Button } from '@/components/ui/button'
import { CabecalhoSecao, Campo, CampoArea, CampoTexto, GavetaFormulario, Interruptor } from '@/components/ui/formulario'
import { diasSemana, equipeCrm, feriados as feriadosIniciais, horarios as horariosIniciais, mensagensAutomaticas, regrasSla, rotuloSetor, type DiaSemana, type HorarioSetor, type MensagemAutomatica, type RegraSla } from '@/dados/crm'
import type { SetorIntegrante } from '@/theme/tipos'

/** "seg a sex" quando os dias são seguidos; senão, a lista. */
const resumoDias = (d: string[]) => {
  const idx = d.map((x) => diasSemana.indexOf(x as (typeof diasSemana)[number]))
  const seguidos = idx.length > 2 && idx.every((v, i) => i === 0 || v === idx[i - 1] + 1)
  return seguidos ? `${d[0]} a ${d[d.length - 1]}` : d.join(', ')
}

/** Horas cheias e meias, das 06:00 às 22:00: as opções de abrir, fechar e intervalo. */
const meiasHoras = Array.from({ length: 33 }, (_, i) => `${String(6 + Math.floor(i / 2)).padStart(2, '0')}:${i % 2 ? '30' : '00'}`)
const opcoesHora: Opcao[] = meiasHoras.map((h) => ({ valor: h, rotulo: h }))
const ehHora = (v: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(v)
/** "12:00–13:00" para o intervalo; "sem" quando não há. */
const SEM = 'sem'
const opcoesIntervalo = (atual?: [string, string]): Opcao[] => {
  const janelas = meiasHoras.filter((h) => h >= '11:00' && h <= '14:00').map((h) => `${h}–${meiasHoras[meiasHoras.indexOf(h) + 2]}`)
  const chave = atual ? `${atual[0]}–${atual[1]}` : null
  return [{ valor: SEM, rotulo: 'Sem intervalo' }, ...(chave && !janelas.includes(chave) ? [chave] : []).concat(janelas).map((j) => ({ valor: j, rotulo: j.replace('–', ' às ') }))]
}

/** Horário de atendimento por setor, feriados e plantão (04, 4.5). Cada valor da linha muda no lugar. */
export function Horario() {
  const [horarios, setHorarios] = usePersistente('crm.cfg.atend.horarios', horariosIniciais)
  const [feriados, setFeriados] = usePersistente('crm.cfg.atend.feriados', feriadosIniciais)
  const [novoFeriado, setNovoFeriado] = useState<{ data: string; nome: string } | null>(null)
  const semHorario = (Object.keys(rotuloSetor) as SetorIntegrante[]).filter((s) => !horarios.some((h) => h.setor === s))
  const mudar = (setor: SetorIntegrante, p: Partial<HorarioSetor>) => setHorarios((xs) => xs.map((x) => (x.setor === setor ? { ...x, ...p } : x)))

  return (
    <div className="flex flex-col gap-5">
      <CabecalhoSecao titulo="Horário de atendimento" descricao="Por setor. Fora do horário sai a mensagem automática, o integrante responde o que é status e o prazo de resposta só começa na abertura." />
      <ul className="divide-border/70 flex flex-col divide-y">
        {horarios.map((h) => {
          const setor = rotuloSetor[h.setor]
          const deplantao = equipeCrm.filter((p) => p.setores.includes(h.setor))
          return (
            <li key={h.setor} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-2 py-2.5 text-sm">
              <span className="w-40 font-medium">{setor}</span>
              <span>
                <ValorEditavel
                  rotulo={`Dias de ${setor}`}
                  valor={h.dias}
                  config={{ tipo: 'multipla', opcoes: diasSemana.map((d) => ({ valor: d, rotulo: d })), outra: false }}
                  formatar={resumoDias}
                  onMudar={(v) => {
                    if (!v.length) throw new Error('Escolha ao menos um dia.')
                    mudar(h.setor, { dias: diasSemana.filter((d) => v.includes(d)) as DiaSemana[] })
                  }}
                />{' '}
                ·{' '}
                <ValorEditavel
                  rotulo={`Abertura de ${setor}`}
                  valor={h.inicio}
                  config={{ tipo: 'escolha', opcoes: opcoesHora }}
                  className="tabular-nums"
                  onMudar={(v) => {
                    if (!ehHora(v)) throw new Error('Escreva a hora como 08:30.')
                    if (v >= h.fim) throw new Error('Abre depois de fechar.')
                    mudar(h.setor, { inicio: v })
                  }}
                />{' '}
                às{' '}
                <ValorEditavel
                  rotulo={`Fechamento de ${setor}`}
                  valor={h.fim}
                  config={{ tipo: 'escolha', opcoes: opcoesHora }}
                  className="tabular-nums"
                  onMudar={(v) => {
                    if (!ehHora(v)) throw new Error('Escreva a hora como 18:00.')
                    if (v <= h.inicio) throw new Error('Fecha antes de abrir.')
                    mudar(h.setor, { fim: v })
                  }}
                />
                <span className="text-muted-foreground">
                  {' '}
                  · intervalo{' '}
                  <ValorEditavel
                    rotulo={`Intervalo de almoço de ${setor}`}
                    valor={h.intervalo ? `${h.intervalo[0]}–${h.intervalo[1]}` : SEM}
                    config={{ tipo: 'escolha', opcoes: opcoesIntervalo(h.intervalo) }}
                    className="tabular-nums"
                    onMudar={(v) => {
                      if (v === SEM) return mudar(h.setor, { intervalo: undefined })
                      const m = v.match(/(\d{1,2}:\d{2})\D+(\d{1,2}:\d{2})/)
                      const par = m ? ([m[1].padStart(5, '0'), m[2].padStart(5, '0')] as [string, string]) : null
                      if (!par || !ehHora(par[0]) || !ehHora(par[1])) throw new Error('Escreva como 12:00 às 13:00.')
                      if (par[0] >= par[1] || par[0] <= h.inicio || par[1] >= h.fim) throw new Error('O intervalo fica dentro do horário.')
                      mudar(h.setor, { intervalo: par })
                    }}
                  />
                </span>
              </span>
              <span className="text-muted-foreground">
                plantão:{' '}
                <ValorEditavel
                  rotulo={`Plantão de ${setor}`}
                  valor={h.plantao ?? SEM}
                  config={{ tipo: 'entidade', buscar: 'Buscar pessoa', outra: false, opcoes: [{ valor: SEM, rotulo: 'Sem plantão' }, ...deplantao.map((p) => ({ valor: p.nome, rotulo: p.nome }))] }}
                  onMudar={(v) => mudar(h.setor, { plantao: v === SEM ? undefined : v })}
                />
              </span>
            </li>
          )
        })}
        {semHorario.length > 0 && <li className="text-muted-foreground px-2 py-2.5 text-xs">{semHorario.map((s) => rotuloSetor[s]).join(', ')}: seguem o horário do Gestão e Atendimento.</li>}
      </ul>
      <p className="text-muted-foreground -mt-3 px-2 text-xs">O prazo de resposta pausa no intervalo. No plantão, uma pessoa recebe alerta urgente para conversas com etiqueta urgente (ex.: “intimação”).</p>

      <div className="flex flex-col gap-2">
        <CabecalhoSecao
          titulo="Feriados"
          descricao="No dia, sai a mensagem de feriado com a data de volta."
          acao={
            <Button size="sm" variant="outline" className="rounded-full" onClick={() => setNovoFeriado({ data: '', nome: '' })}>
              <PlusIcon /> Feriado
            </Button>
          }
        />
        <ul className="flex flex-wrap gap-2">
          {feriados.map((f) => (
            <li key={f.data} className="bg-sunken flex items-center gap-2 rounded-full py-1 pr-1 pl-3 text-sm">
              <span className="tabular-nums">{f.data}</span> {f.nome}
              <Button size="icon-sm" variant="ghost" className="size-6 rounded-full" aria-label={`Tirar ${f.nome}`} onClick={() => setFeriados((xs) => xs.filter((x) => x.data !== f.data))}>
                <TrashIcon className="size-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      </div>

      {novoFeriado && (
        <GavetaFormulario
          aberta
          onFechar={() => setNovoFeriado(null)}
          titulo="Novo feriado"
          descricao="Vale para todos os setores. Feriados nacionais já vêm do calendário do escritório."
          acao="Adicionar"
          acaoDesabilitada={!/^\d{2}\/\d{2}$/.test(novoFeriado.data) || !novoFeriado.nome.trim()}
          onAcao={() => {
            setFeriados((xs) => [...xs, novoFeriado].sort((a, b) => a.data.split('/').reverse().join().localeCompare(b.data.split('/').reverse().join())))
            setNovoFeriado(null)
          }}
        >
          <Campo rotulo="Data" ajuda="dd/mm">
            {(id) => <CampoTexto id={id} valor={novoFeriado.data} onMudar={(v) => setNovoFeriado({ ...novoFeriado, data: v.replace(/[^\d/]/g, '').slice(0, 5) })} placeholder="15/11" />}
          </Campo>
          <Campo rotulo="Nome">{(id) => <CampoTexto id={id} valor={novoFeriado.nome} onMudar={(v) => setNovoFeriado({ ...novoFeriado, nome: v })} placeholder="Aniversário da cidade" />}</Campo>
        </GavetaFormulario>
      )}
    </div>
  )
}

const fmtMin = (m: number) => (m < 60 ? `${m} min` : `${m / 60} h`)

const fmtDias = (d: number) => `${d} ${d === 1 ? 'dia útil' : 'dias úteis'}`
const validarEtiqueta = (v: string) => (!v.startsWith('Etiqueta #') || v.trim().length < 11 ? 'Comece com “Etiqueta #” e o nome da etiqueta.' : null)

/** Prazos de resposta (SLA) por setor e por etiqueta (04, 4.6). Os prazos mudam no lugar; a gaveta só cria regra nova. */
export function Sla() {
  const loja = useLoja()
  const [regras, setRegras] = usePersistente('crm.cfg.atend.regras', regrasSla)
  const [ed, setEd] = useState<RegraSla | null>(null)
  const mudar = (id: string, p: Partial<RegraSla>) => setRegras((xs) => xs.map((x) => (x.id === id ? { ...x, ...p } : x)))
  const apagar = (r: RegraSla) => {
    const antes = regras
    setRegras((xs) => xs.filter((x) => x.id !== r.id))
    loja.toastDesfazer(`Regra apagada: ${r.onde}`, () => setRegras(antes))
  }
  return (
    <div className="flex flex-col gap-3">
      <CabecalhoSecao
        titulo="Prazos de resposta (SLA)"
        descricao="Ordenam a caixa e avisam quando estouram. Correm só no horário do setor e pausam em “aguardando cliente”."
        acao={
          <Button size="sm" className="rounded-full" onClick={() => setEd({ id: '', onde: 'Etiqueta #', respostaMin: 30, resolucaoDias: 1, tipo: 'etiqueta' })}>
            <PlusIcon /> Regra por etiqueta
          </Button>
        }
      />
      <table className="w-full text-sm">
        <thead>
          <tr className="text-muted-foreground text-left text-xs">
            <th className="pb-2 font-medium">Onde</th>
            <th className="pb-2 font-medium">Primeira resposta</th>
            <th className="pb-2 font-medium">Resolução</th>
            <th />
          </tr>
        </thead>
        <tbody className="divide-border/70 divide-y">
          {regras.map((r) => (
            <tr key={r.id}>
              <td className="py-2.5 pr-3">{r.tipo === 'etiqueta' ? <ValorEditavel rotulo="Etiqueta" valor={r.onde} config={{ tipo: 'texto', validar: validarEtiqueta }} onMudar={(v) => mudar(r.id, { onde: v.trim() })} /> : r.onde}</td>
              <td className="py-2.5 pr-3 tabular-nums">
                <ValorEditavel rotulo={`Primeira resposta · ${r.onde}`} valor={r.respostaMin} config={{ tipo: 'numero', min: 5, passo: 5, unidade: 'min' }} formatar={fmtMin} onMudar={(v) => mudar(r.id, { respostaMin: Math.round(v) })} />
              </td>
              <td className="py-2.5 pr-3 tabular-nums">
                {r.resolucaoDias == null ? 'etapa do funil' : <ValorEditavel rotulo={`Resolução · ${r.onde}`} valor={r.resolucaoDias} config={{ tipo: 'numero', min: 1, unidade: 'dias úteis' }} formatar={fmtDias} onMudar={(v) => mudar(r.id, { resolucaoDias: Math.max(1, Math.round(v)) })} />}
              </td>
              <td className="py-2.5 text-right">
                {r.tipo === 'etiqueta' && (
                  <Button size="icon-sm" variant="ghost" className="rounded-full" aria-label={`Apagar ${r.onde}`} onClick={() => apagar(r)}>
                    <TrashIcon />
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {ed && (
        <GavetaFormulario
          aberta
          onFechar={() => setEd(null)}
          titulo="Nova regra por etiqueta"
          descricao="Etiqueta com prazo próprio vence o do setor quando for mais curta."
          acao="Salvar"
          acaoDesabilitada={ed.respostaMin < 5 || ed.onde.trim().length < 11}
          onAcao={() => {
            setRegras((xs) => [...xs, { ...ed, id: `s${Date.now()}` }])
            setEd(null)
          }}
        >
          {ed.tipo === 'etiqueta' && <Campo rotulo="Etiqueta">{(id) => <CampoTexto id={id} valor={ed.onde} onMudar={(v) => setEd({ ...ed, onde: v.startsWith('Etiqueta #') ? v : 'Etiqueta #' })} />}</Campo>}
          <Campo rotulo="Primeira resposta humana" ajuda="Em minutos úteis. A resposta do integrante não conta.">
            {(id) => <CampoTexto id={id} tipo="number" min={5} valor={String(ed.respostaMin)} onMudar={(v) => setEd({ ...ed, respostaMin: Number(v) || 0 })} />}
          </Campo>
          {ed.resolucaoDias != null && (
            <Campo rotulo="Resolução" ajuda="Em dias úteis, descontando o tempo aguardando o cliente.">
              {(id) => <CampoTexto id={id} tipo="number" min={1} valor={String(ed.resolucaoDias)} onMudar={(v) => setEd({ ...ed, resolucaoDias: Math.max(1, Number(v) || 1) })} />}
            </Campo>
          )}
        </GavetaFormulario>
      )}
    </div>
  )
}

/**
 * Mensagens automáticas (04, 4.5): textos do tema por momento, liga/desliga e a espera.
 * O texto continua na gaveta (aberta pelo título): tem variáveis e cada mudança vira
 * uma nova versão do modelo na Meta, o que não cabe num valor em linha.
 */
export function MensagensAutomaticas() {
  const [lista, setLista] = usePersistente('crm.cfg.atend.lista', mensagensAutomaticas)
  const [espera, setEspera] = useState('2')
  const [ed, setEd] = useState<MensagemAutomatica | null>(null)
  return (
    <div className="flex flex-col gap-3">
      <CabecalhoSecao titulo="Mensagens automáticas" descricao="O que sai sem ninguém escrever. Nunca contam como primeira resposta. E-mail não recebe mensagem automática." />
      <div className="bg-sunken flex flex-wrap items-center gap-3 rounded-md px-3 py-2.5 text-sm">
        <span>Espera antes do “já vamos atender”:</span>
        <CampoTexto tipo="number" min={0} valor={espera} onMudar={setEspera} className="h-8 w-20" />
        <span className="text-muted-foreground text-xs">minutos · 0 = na hora (se alguém responder antes, não sai)</span>
      </div>
      <ul className="divide-border/70 flex flex-col divide-y">
        {lista.map((m) => (
          <li key={m.id} className="flex items-start gap-3 py-2.5">
            <div className="min-w-0 flex-1">
              <Button variant="link" className="text-foreground h-auto p-0 text-sm font-medium" aria-label={`${m.momento}: alterar o texto`} onClick={() => setEd(m)}>
                {m.momento}
              </Button>
              <p className="text-muted-foreground text-xs">{m.quando.replace('{espera}', espera)}</p>
              <p className="mt-1 text-sm">{m.texto}</p>
            </div>
            <Interruptor ocultarRotulo rotulo={`Mensagem de ${m.momento.toLowerCase()}`} ligado={m.ligada} onMudar={(v) => setLista((xs) => xs.map((x) => (x.id === m.id ? { ...x, ligada: v } : x)))} />
          </li>
        ))}
      </ul>
      {ed && (
        <GavetaFormulario
          aberta
          onFechar={() => setEd(null)}
          titulo={ed.momento}
          descricao={`Usa o modelo ${ed.modelo}. Mudar o texto submete uma nova versão à Meta.`}
          acao="Salvar"
          acaoDesabilitada={!ed.texto.trim()}
          onAcao={() => {
            setLista((xs) => xs.map((x) => (x.id === ed.id ? { ...x, texto: ed.texto } : x)))
            setEd(null)
          }}
        >
          <Campo rotulo="Quando sai">{() => <p className="text-sm">{ed.quando.replace('{espera}', espera)}</p>}</Campo>
          <Campo rotulo="Texto" ajuda="Variáveis entre chaves: {nome}, {setor}, {horario}, {retorno}.">
            {(id) => <CampoArea id={id} valor={ed.texto} onMudar={(v) => setEd({ ...ed, texto: v })} />}
          </Campo>
        </GavetaFormulario>
      )}
    </div>
  )
}

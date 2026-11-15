import { FlaskIcon, PaperPlaneRightIcon, ShieldWarningIcon } from '@phosphor-icons/react'
import { useMemo, useState } from 'react'
import { useLoja } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import { SeloDemonstracao } from '@/components/kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CampoEscolha } from '@/components/ui/formulario'
import { Orb } from '@/components/ui/orb'
import { rotuloSetor, type ConversaCrm, type ItemConversa } from '@/dados/crm'
import { cn } from '@/lib/utils'
import { registrar, repos } from '@/nucleo/repositorios'
import { useTema } from '@/theme/ThemeProvider'
import { categoriasAtendimento, useCfgAtendimento } from './config'
import { AreaRolagem } from '@/components/ui/area-rolagem'

type Atualizar = (f: (c: ConversaCrm) => ConversaCrm) => void
type MsgItem = Extract<ItemConversa, { tipo: 'mensagem' }>
const hora = () => new Date().toTimeString().slice(0, 5)
const marco = (texto: string): ItemConversa => ({ tipo: 'marco', id: `x${Date.now()}${Math.random().toString(36).slice(2, 6)}`, hora: hora(), texto })

function Modal({ aberto, onFechar, titulo, descricao, children, rodape, largo }: { aberto: boolean; onFechar: () => void; titulo: string; descricao?: string; children: React.ReactNode; rodape?: React.ReactNode; largo?: boolean }) {
  return (
    <Dialog open={aberto} onOpenChange={(v) => !v && onFechar()}>
      <DialogContent className={cn('bg-surface rounded-[24px] border-0 p-5', largo ? 'sm:max-w-xl' : 'sm:max-w-md')}>
        <DialogHeader>
          <DialogTitle className="font-medium">{titulo}</DialogTitle>
          {descricao && <DialogDescription>{descricao}</DialogDescription>}
        </DialogHeader>
        {children}
        {rodape && <DialogFooter>{rodape}</DialogFooter>}
      </DialogContent>
    </Dialog>
  )
}

/* ---------- S05-A26: agendar reunião (três horários livres; o cliente confirma por botão; cria tarefa) ---------- */

function proximosHorarios(): string[] {
  const r: string[] = []
  const d = new Date()
  const slots = ['10:00', '14:30', '09:00']
  let i = 0
  while (r.length < 3) {
    d.setDate(d.getDate() + 1)
    if (d.getDay() === 0 || d.getDay() === 6) continue
    r.push(`${d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' }).replace('.', '')} às ${slots[i++]}`)
  }
  return r
}

export function DialogoAgendar({ c, aberto, onFechar, onAtualizar }: { c: ConversaCrm; aberto: boolean; onFechar: () => void; onAtualizar: Atualizar }) {
  const loja = useLoja()
  const { usuario } = useSessao()
  const horarios = useMemo(proximosHorarios, [])
  const quem = c.responsavel ?? usuario.nome
  const propor = () => {
    const id = `ag${Date.now()}`
    onAtualizar((x) => ({
      ...x,
      itens: [
        ...x.itens,
        { tipo: 'mensagem', id, de: 'integrante', setor: 'gestao_atendimento', hora: hora(), canal: x.canal, texto: `${x.pessoa.nome.split(' ')[0]}, ${quem.split(' ')[0]} tem estes horários livres para a reunião. Toque no melhor para você:`, botoes: horarios.map((h) => ({ rotulo: h })), entrega: 'enviada' },
      ],
    }))
    onFechar()
    loja.toast('O integrante mandou os três horários ao cliente; a confirmação vem por botão.')
    // O cliente toca no primeiro horário (demonstração).
    window.setTimeout(() => {
      onAtualizar((x) => ({
        ...x,
        itens: [...x.itens.map((i) => (i.tipo === 'mensagem' && i.id === id ? { ...i, entrega: 'lida' as const, botoes: i.botoes?.map((b, k) => ({ ...b, escolhido: k === 0 })) } : i)), marco(`reunião confirmada: ${horarios[0]} com ${quem} · tarefa criada`)],
      }))
      if (c.cliente) loja.criarTarefa({ codigo: 'GES-031', titulo: `Reunião com ${c.pessoa.nome} (${horarios[0]})`, cliente: c.cliente, setor: c.setor, prazo: horarios[0].match(/\d{2}\/\d{2}/)?.[0] ?? '', responsavel: { tipo: 'pessoa', nome: quem }, status: 'a_fazer', conversa: c.id })
      loja.avisar({ para: [usuario.id], titulo: `${c.pessoa.nome} confirmou a reunião: ${horarios[0]}`, tipo: 'conversa', destino: { modulo: 'crm', aba: 'conversas', conversa: c.id } })
    }, 4500)
  }
  return (
    <Modal
      aberto={aberto}
      onFechar={onFechar}
      titulo="Agendar reunião"
      descricao={`O integrante de Atendimento oferece ao cliente três horários livres de ${quem} (agenda conectada). O cliente escolhe por botão e a reunião vira tarefa.`}
      rodape={
        <>
          <Button variant="ghost" className="rounded-full" onClick={onFechar}>
            Cancelar
          </Button>
          <Button className="rounded-full" onClick={propor}>
            Oferecer os horários
          </Button>
        </>
      }
    >
      <ul className="flex flex-col gap-1.5">
        {horarios.map((h) => (
          <li key={h} className="bg-raised shadow-contorno rounded-[12px] px-3 py-2 text-sm">
            {h} · livre na agenda de {quem.split(' ')[0]}
          </li>
        ))}
      </ul>
      <SeloDemonstracao fonte="Calendário (Google, Microsoft)" />
    </Modal>
  )
}

/* ---------- S05-A16: mover mensagem para a conversa certa da mesma pessoa ---------- */

export function DialogoMover({ c, conversas, aberto, onFechar, onMover }: { c: ConversaCrm; conversas: ConversaCrm[]; aberto: boolean; onFechar: () => void; onMover: (ids: string[], destino: string) => void }) {
  const doCliente = c.itens.filter((i): i is MsgItem => i.tipo === 'mensagem' && i.de === 'cliente')
  const destinos = conversas.filter((x) => x.id !== c.id && (x.pessoa.nome === c.pessoa.nome || (!!c.clienteId && x.clienteId === c.clienteId)) && !x.transferidaPara)
  const [sel, setSel] = useState<string[]>([])
  const [destino, setDestino] = useState('')
  const alvo = destino || destinos[0]?.id || ''
  return (
    <Modal
      aberto={aberto}
      onFechar={onFechar}
      largo
      titulo="Mover mensagem"
      descricao="Para a conversa certa da mesma pessoa ou empresa. A mensagem não some: muda de fio e as duas conversas registram o movimento."
      rodape={
        <>
          <Button variant="ghost" className="rounded-full" onClick={onFechar}>
            Cancelar
          </Button>
          <Button
            className="rounded-full"
            disabled={!sel.length || !alvo}
            onClick={() => {
              onMover(sel, alvo)
              setSel([])
              onFechar()
            }}
          >
            Mover {sel.length || ''}
          </Button>
        </>
      }
    >
      {destinos.length === 0 ? (
        <p className="text-muted-foreground text-sm">{c.pessoa.nome} não tem outra conversa aberta com o escritório.</p>
      ) : (
        <>
          <CampoEscolha rotulo="Conversa de destino" valor={alvo} onMudar={setDestino} opcoes={destinos.map((x) => ({ valor: x.id, rotulo: `${x.cliente ?? 'Lead'} · ${rotuloSetor[x.setor]} · ${x.pessoa.nome}` }))} />
          <AreaRolagem as="ul" className="flex max-h-64 flex-col gap-1">
            {doCliente.map((m) => (
              <li key={m.id}>
                <label className="hover:bg-sunken flex cursor-pointer items-start gap-2 rounded-[12px] px-2 py-1.5 text-sm">
                  <input type="checkbox" className="mt-1" checked={sel.includes(m.id)} onChange={(e) => setSel((x) => (e.target.checked ? [...x, m.id] : x.filter((y) => y !== m.id)))} />
                  <span className="min-w-0">
                    <span className="text-muted-foreground block text-[11px]">{m.hora}</span>
                    <span className="line-clamp-2">{m.texto ?? m.audio?.transcricao ?? m.anexos?.map((a) => a.nome).join(', ')}</span>
                  </span>
                </label>
              </li>
            ))}
          </AreaRolagem>
        </>
      )}
    </Modal>
  )
}

/* ---------- S05-A17: "pode transmitir" vira prova ligada à tarefa (GES-036) ---------- */

export function DialogoAutorizacao({ c, aberto, onFechar, onAtualizar }: { c: ConversaCrm; aberto: boolean; onFechar: () => void; onAtualizar: Atualizar }) {
  const loja = useLoja()
  const { usuario } = useSessao()
  const doCliente = c.itens.filter((i): i is MsgItem => i.tipo === 'mensagem' && i.de === 'cliente')
  const tarefas = loja.tarefas.filter((t) => t.cliente === c.cliente && t.status !== 'concluida')
  const [msg, setMsg] = useState('')
  const [tarefa, setTarefa] = useState('')
  const m = doCliente.find((x) => x.id === (msg || doCliente.at(-1)?.id))
  const t = tarefas.find((x) => x.id === (tarefa || tarefas[0]?.id))
  return (
    <Modal
      aberto={aberto}
      onFechar={onFechar}
      largo
      titulo="Registrar autorização do cliente"
      descricao='A mensagem do cliente ("pode transmitir", "pode pagar") vira prova ligada à tarefa, com o texto, a hora e quem registrou.'
      rodape={
        <>
          <Button variant="ghost" className="rounded-full" onClick={onFechar}>
            Cancelar
          </Button>
          <Button
            className="rounded-full"
            disabled={!m || !t}
            onClick={() => {
              if (!m || !t) return
              const real = repos.tarefas.obter(t.id)
              try {
                if (real) repos.tarefas.atualizar(t.id, { extras: { ...real.extras, autorizacao: { texto: m.texto, conversa: c.id, mensagem: m.id, registrada_por: usuario.nome, em: new Date().toISOString() } } }, { texto: `${usuario.nome} registrou a autorização do cliente na tarefa ${t.titulo}` })
                else registrar(`${usuario.nome} registrou a autorização do cliente na tarefa ${t.titulo}`)
              } catch (e) {
                loja.toastErro(e instanceof Error ? e.message : String(e))
                return
              }
              onAtualizar((x) => ({ ...x, itens: [...x.itens, marco(`autorização registrada como prova na tarefa ${t.codigo} (${t.titulo}) por ${usuario.nome}`)] }))
              loja.toast(`Autorização ligada à tarefa ${t.codigo}`)
              onFechar()
            }}
          >
            Registrar
          </Button>
        </>
      }
    >
      {!doCliente.length || !tarefas.length ? (
        <p className="text-muted-foreground text-sm">{!doCliente.length ? 'Ainda não há mensagem do cliente nesta conversa.' : 'O cliente não tem tarefa aberta para ligar a prova.'}</p>
      ) : (
        <div className="flex flex-col gap-3">
          <CampoEscolha rotulo="Mensagem do cliente" valor={m?.id ?? ''} onMudar={setMsg} opcoes={doCliente.map((x) => ({ valor: x.id, rotulo: `${x.hora} · ${(x.texto ?? x.audio?.transcricao ?? 'anexo').slice(0, 70)}` }))} />
          <CampoEscolha rotulo="Tarefa" valor={t?.id ?? ''} onMudar={setTarefa} opcoes={tarefas.map((x) => ({ valor: x.id, rotulo: `${x.codigo} · ${x.titulo}` }))} />
        </div>
      )}
    </Modal>
  )
}

/* ---------- S05-A14: ligar a cliente (fusão só por cartão ao Gestor) ---------- */

export function DialogoLigarCliente({ aberto, onFechar, onAtualizar }: { c: ConversaCrm; aberto: boolean; onFechar: () => void; onAtualizar: Atualizar }) {
  const loja = useLoja()
  const [cli, setCli] = useState(loja.clientes[0]?.id ?? '')
  const cliente = loja.clientes.find((x) => x.id === cli)
  return (
    <Modal
      aberto={aberto}
      onFechar={onFechar}
      titulo="Ligar a um cliente"
      descricao="Quando o lead já é cliente, ou a pessoa fala por várias empresas. A fusão nunca é automática: vira cartão para o Gestor decidir."
      rodape={
        <>
          <Button variant="ghost" className="rounded-full" onClick={onFechar}>
            Cancelar
          </Button>
          <Button
            className="rounded-full"
            disabled={!cliente}
            onClick={() => {
              if (!cliente) return
              onAtualizar((x) => ({
                ...x,
                itens: [...x.itens, { tipo: 'cartao', id: `lig-${cliente.id}-${Date.now()}`, hora: hora(), setor: 'gestao_atendimento', titulo: `Ligar ${x.pessoa.nome} a ${cliente.nome}`, detalhe: `${x.pessoa.contato} passa a ser contato de ${cliente.nome} (${cliente.documento}); a conversa e os documentos vão para o cadastro dela. Quem decide é o Gestor.`, acoes: ['Ligar à empresa', 'Não ligar'] }],
              }))
              onFechar()
            }}
          >
            Propor a ligação
          </Button>
        </>
      }
    >
      <CampoEscolha rotulo="Cliente" valor={cli} onMudar={setCli} opcoes={loja.clientes.map((x) => ({ valor: x.id, rotulo: `${x.codigo} · ${x.nome}` }))} />
    </Modal>
  )
}

/* ---------- S05-A28: exportar a conversa (prova de autorização ou disputa) ---------- */

function hashSimples(texto: string) {
  let h1 = 0x811c9dc5
  for (let i = 0; i < texto.length; i++) h1 = Math.imul(h1 ^ texto.charCodeAt(i), 16777619)
  return (h1 >>> 0).toString(16).padStart(8, '0')
}

export function exportarConversa(c: ConversaCrm, quem: string) {
  const linhas = c.itens.map((i) => {
    if (i.tipo === 'dia') return `\n— ${i.texto} —`
    if (i.tipo === 'marco') return `[${i.hora}] · ${i.texto}`
    if (i.tipo === 'nota') return `[${i.hora}] NOTA INTERNA (${i.autor}): ${i.texto}`
    if (i.tipo === 'cartao') return `[${i.hora}] CARTÃO: ${i.titulo} — ${i.decidido ?? 'pendente'}`
    const autor = i.de === 'cliente' ? (i.autor ?? c.pessoa.nome) : i.de === 'auto' ? `automática (${i.modelo})` : i.de === 'integrante' ? 'integrante (IA)' : (i.autor ?? 'escritório')
    const extra = [i.audio ? `áudio ${i.audio.duracao}: "${i.audio.transcricao}"` : '', ...(i.anexos ?? []).map((a) => `anexo: ${a.nome}`), i.apagada ? '(apagada pelo cliente; original guardado)' : '', i.editadaDe ? `(editada pelo cliente; antes: "${i.editadaDe}")` : '', i.entrega ? `[${i.entrega}]` : ''].filter(Boolean).join(' ')
    return `[${i.hora}] ${autor} por ${i.canal}: ${i.texto ?? ''} ${extra}`.trim()
  })
  const corpo = [`Conversa ${c.id} · ${c.cliente ?? 'Lead'} · ${c.pessoa.nome} (${c.pessoa.contato})`, `Setor: ${rotuloSetor[c.setor]} · status: ${c.status}`, `Exportada por ${quem} em ${new Date().toLocaleString('pt-BR')}`, ...linhas].join('\n')
  const texto = `${corpo}\n\nImpressão digital do conteúdo: ${hashSimples(corpo)}\n`
  const url = URL.createObjectURL(new Blob([texto], { type: 'text/plain;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `conversa-${c.id}-${new Date().toISOString().slice(0, 10)}.txt`
  a.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  registrar(`${quem} exportou a conversa com ${c.pessoa.nome} (${c.cliente ?? 'lead'})`, 'conversa.exportar')
}

/* ---------- S05-A29: modo simulação (D-30): a equipe faz o papel do cliente; nada é gravado nem enviado ---------- */

interface FalaSim {
  de: 'cliente' | 'integrante'
  texto: string
  nota?: string
}

function respostaSimulada(texto: string, categorias: Record<string, boolean>): FalaSim {
  const t = texto.toLowerCase()
  if (/quanto custa|pre[cç]o|valor|honor[aá]rio/.test(t)) return { de: 'integrante', texto: 'Quem passa valores é o nosso responsável comercial: já avisei e ele fala com você ainda hoje. Para adiantar: a empresa já tem CNPJ? Qual o regime?', nota: 'nunca cita preço a lead (04, 8.4)' }
  if (/(2|segunda)[ªa]? via|boleto|guia|das\b/.test(t))
    return categorias.segunda_via
      ? { de: 'integrante', texto: 'Mandei a guia de novo aqui: DAS 10/2026, vence dia 20. Qualquer dúvida, é só chamar.', nota: 'categoria liberada: respondeu sozinho' }
      : { de: 'integrante', texto: '(rascunho para a equipe revisar) Oi! Vou te mandar a guia de novo agora.', nota: 'categoria não liberada: só sugere, uma pessoa envia (D-33)' }
  if (/recebe|chegou|mandei/.test(t)) return categorias.recebimento ? { de: 'integrante', texto: 'Chegou sim, obrigado! Já está com o setor.', nota: 'categoria liberada' } : { de: 'integrante', texto: '(rascunho) Recebemos, obrigado!', nota: 'categoria não liberada: só sugere' }
  if (/vou (ser|ter)|devo|posso deduzir|opini|acha que/.test(t)) return { de: 'integrante', texto: 'Essa pergunta precisa de um contador. Já passei para o responsável, com a sua dúvida, e ele te responde por aqui.', nota: 'nunca opina sem contador' }
  return { de: 'integrante', texto: 'Recebi. Para te ajudar melhor: você é cliente ou quer conhecer os serviços? [Sou cliente] [Quero conhecer] [Outro assunto]', nota: 'triagem por botões para número desconhecido (04, 5.2)' }
}

export function SimulacaoAtendimento({ aberto, onFechar }: { aberto: boolean; onFechar: () => void }) {
  const [cfg] = useCfgAtendimento()
  const { integrante } = useTema()
  const t = integrante('gestao_atendimento')
  const [falas, setFalas] = useState<FalaSim[]>([])
  const [texto, setTexto] = useState('')
  const [pensando, setPensando] = useState(false)
  const enviar = () => {
    const v = texto.trim()
    if (!v) return
    setFalas((x) => [...x, { de: 'cliente', texto: v }])
    setTexto('')
    setPensando(true)
    window.setTimeout(() => {
      setFalas((x) => [...x, respostaSimulada(v, cfg.categorias)])
      setPensando(false)
    }, 1200)
  }
  const liberadas = categoriasAtendimento.filter((c) => cfg.categorias[c.id])
  return (
    <Modal aberto={aberto} onFechar={onFechar} largo titulo="Modo simulação do atendimento" descricao="Você faz o papel do cliente e vê como o integrante responderia. Nada é gravado nem enviado, e nenhuma conversa é aberta (D-30).">
      <div className="bg-warning/12 flex items-start gap-2 rounded-[14px] px-3 py-2 text-xs">
        <FlaskIcon className="text-warning mt-0.5 size-4 shrink-0" />
        <span>
          Simulação · categorias liberadas: {liberadas.length ? liberadas.map((c) => c.rotulo).join(', ') : 'nenhuma (o integrante só sugere; começa assim, D-33)'}.
        </span>
      </div>
      <AreaRolagem as="ol" className="bg-sunken/60 flex max-h-80 min-h-48 flex-col gap-2 rounded-[16px] p-3">
        {falas.length === 0 && <li className="text-muted-foreground m-auto text-center text-xs">Escreva como um cliente escreveria. Ex.: "Manda a segunda via do DAS?", "Quanto custa a contabilidade?"</li>}
        {falas.map((f, i) => (
          <li key={i} className={cn('flex max-w-[85%] flex-col gap-1', f.de === 'cliente' ? 'self-start' : 'self-end items-end')}>
            <span className="text-muted-foreground flex items-center gap-1 text-xs">
              {f.de === 'integrante' && (
                <span className="inline-flex size-4">
                  <Orb cor={t.cor} tamanho={16} extras={false} cutucavel={false} />
                </span>
              )}
              {f.de === 'cliente' ? 'você, como cliente' : `${t.nome} (integrante)`}
            </span>
            <span className={cn('rounded-[16px] px-3 py-2 text-sm', f.de === 'cliente' ? 'bg-raised shadow-contorno' : 'bg-secondary text-secondary-foreground')}>{f.texto}</span>
            {f.nota && (
              <Badge variant="outline" className="text-xs">
                <ShieldWarningIcon /> {f.nota}
              </Badge>
            )}
          </li>
        ))}
        {pensando && <li className="text-muted-foreground self-end text-xs">{t.nome} está escrevendo…</li>}
      </AreaRolagem>
      <form
        className="flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          enviar()
        }}
      >
        <input value={texto} onChange={(e) => setTexto(e.target.value)} aria-label="Mensagem como cliente" placeholder="Escreva como o cliente" className="bg-raised shadow-contorno h-10 min-w-0 flex-1 rounded-full px-4 text-sm outline-none" />
        <Button type="submit" size="icon" className="rounded-full" aria-label="Enviar na simulação">
          <PaperPlaneRightIcon />
        </Button>
      </form>
      <SeloDemonstracao fonte="Integrante (IA)" />
    </Modal>
  )
}

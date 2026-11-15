import { CakeIcon, ChatCircleTextIcon, EnvelopeSimpleIcon, FilePdfIcon, NewspaperIcon, PlusIcon, SparkleIcon, TrashIcon, WarningCircleIcon } from '@phosphor-icons/react'
import { useMemo, useState } from 'react'
import { useLoja, useNavegacao, usePersistente } from '@/ambiente/loja'
import { useConfirmar, SeloDemonstracao } from '@/components/kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CampoEscolha, CampoTexto, Interruptor } from '@/components/ui/formulario'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import type { Comunicado, Regua } from '@/dados/crm'
import { cn } from '@/lib/utils'
import { AreaRolagem } from '@/components/ui/area-rolagem'

/* ---------- S05-A40: segmento descrito em texto vira predicado em tabela para confirmar ---------- */

export interface Predicado {
  campo: string
  operador: string
  valor: string
}

export function interpretarSegmento(texto: string): Predicado[] {
  const t = texto.toLowerCase()
  const p: Predicado[] = []
  const regime = /simples/.test(t) ? 'Simples Nacional' : /presumido/.test(t) ? 'Lucro Presumido' : /\breal\b/.test(t) ? 'Lucro Real' : /\bmei\b/.test(t) ? 'MEI' : null
  if (regime) p.push({ campo: 'Regime (perfil vigente)', operador: 'é', valor: regime })
  const uf = t.match(/\b(sp|rj|mg|pr|sc|rs|ba|go|df)\b|s[aã]o paulo|rio de janeiro|minas/)
  if (uf) p.push({ campo: 'UF', operador: 'é', valor: (uf[1] ?? (uf[0].startsWith('s') ? 'sp' : uf[0].startsWith('r') ? 'rj' : 'mg')).toUpperCase() })
  if (/com funcion|tem funcion|com folha|empregad/.test(t)) p.push({ campo: 'Funcionários', operador: 'mais de', valor: '0' })
  if (/sem funcion|sem folha/.test(t)) p.push({ campo: 'Funcionários', operador: 'igual a', valor: '0' })
  if (/bpo/.test(t)) p.push({ campo: 'Serviços contratados', operador: 'inclui', valor: 'BPO Financeiro' })
  if (/implanta/.test(t)) p.push({ campo: 'Ciclo de vida', operador: 'é', valor: 'em implantação' })
  if (/com cnd|certid/.test(t)) p.push({ campo: 'Certidão', operador: 'vence em', valor: '30 dias' })
  if (!p.length) p.push({ campo: 'Situação', operador: 'é', valor: 'ativo' })
  return p
}

export function SegmentoPorTexto({ onUsar }: { onUsar: (descricao: string, predicados: Predicado[], clientes: number) => void }) {
  const loja = useLoja()
  const [texto, setTexto] = useState('')
  const [pensando, setPensando] = useState(false)
  const [resultado, setResultado] = useState<Predicado[] | null>(null)
  const alcance = useMemo(() => {
    if (!resultado) return 0
    const reg = resultado.find((p) => p.campo.startsWith('Regime'))?.valor
    return loja.clientes.filter((c) => !reg || c.regime === reg).length
  }, [resultado, loja.clientes])
  return (
    <div className="bg-sunken/60 flex flex-col gap-2 rounded-[16px] p-3">
      <div className="flex flex-wrap gap-2">
        <CampoTexto valor={texto} onMudar={setTexto} placeholder='ex.: "todos do Simples de SP com funcionários"' aria-label="Segmento em texto" className="min-w-0 grow basis-40" />
        <Button
          size="sm"
          variant="outline"
          className="h-10 rounded-full"
          disabled={!texto.trim() || pensando}
          onClick={() => {
            setPensando(true)
            window.setTimeout(() => {
              setResultado(interpretarSegmento(texto))
              setPensando(false)
            }, 900)
          }}
        >
          <SparkleIcon /> {pensando ? 'Lendo…' : 'Interpretar'}
        </Button>
      </div>
      {resultado && (
        <>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground text-left text-xs">
                <th className="py-1 font-medium">Campo</th>
                <th className="py-1 font-medium">Condição</th>
                <th className="py-1 font-medium">Valor</th>
              </tr>
            </thead>
            <tbody>
              {resultado.map((p, i) => (
                <tr key={i} className="border-t">
                  <td className="py-1.5">{p.campo}</td>
                  <td className="py-1.5">{p.operador}</td>
                  <td className="py-1.5 font-medium">{p.valor}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground text-xs">→ {alcance} clientes na carteira. Confira antes de usar: a IA só traduz o texto em filtro.</span>
            <Button size="sm" className="ml-auto rounded-full" onClick={() => onUsar(resultado.map((p) => `${p.campo.split(' (')[0]} ${p.operador} ${p.valor}`).join(' · '), resultado, alcance)}>
              Usar este segmento
            </Button>
          </div>
          <SeloDemonstracao fonte="Integrante (IA)" />
        </>
      )}
    </div>
  )
}

/* ---------- S05-A45 e A46: resultado por destinatário; respostas abrem conversa; reenviar a quem falhou ---------- */

type StatusDest = 'lida' | 'entregue' | 'respondeu' | 'falhou' | 'parou'

export function ResultadoComunicado({ c, onFechar }: { c: Comunicado | null; onFechar: () => void }) {
  const loja = useLoja()
  const nav = useNavegacao()
  const [reenviados, setReenviados] = useState<string[]>([])
  const destinatarios = useMemo(() => {
    if (!c) return []
    const nomes = ['Rita Campos', 'Marcos Andrade', 'João Batista', 'Ana Prates', 'Paula Reis', 'Dra. Lívia Mendes', 'Carlos Menezes', 'Sônia Prado', 'Pedro Lins', 'Júlia Ramos', 'Tiago Melo', 'Beatriz Alves']
    const n = Math.min(c.destinatarios, 12)
    return Array.from({ length: n }, (_, i): { nome: string; cliente: string; status: StatusDest } => {
      const cli = loja.clientes[i % loja.clientes.length]
      const status: StatusDest = i < (c.falhas ?? 0) ? 'falhou' : i === n - 1 && (c.respostas ?? 0) > 1 ? 'parou' : i < (c.falhas ?? 0) + (c.respostas ?? 0) ? 'respondeu' : i % 3 === 0 ? 'entregue' : 'lida'
      return { nome: nomes[i % nomes.length], cliente: cli?.nome ?? '', status }
    })
  }, [c, loja.clientes])
  const rotulo: Record<StatusDest, string> = { lida: 'lida', entregue: 'entregue', respondeu: 'respondeu', falhou: 'falhou no WhatsApp', parou: 'respondeu PARAR · opt-in revogado' }
  return (
    <Sheet open={!!c} onOpenChange={(v) => !v && onFechar()}>
      <SheetContent className="gap-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{c?.titulo}</SheetTitle>
          <SheetDescription>Resultado por destinatário. Respostas abrem conversa no setor, etiquetadas com o comunicado.</SheetDescription>
        </SheetHeader>
        <AreaRolagem as="ul" className="flex flex-col gap-1 p-3">
          {c?.status !== 'enviado' && <li className="text-muted-foreground p-6 text-center text-sm">Ainda não saiu: o resultado aparece depois do envio.</li>}
          {c?.status === 'enviado' &&
            destinatarios.map((d, i) => (
              <li key={i} className="flex items-center gap-2 rounded-[12px] px-2 py-2 text-sm">
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{d.nome}</span>
                  <span className="text-muted-foreground block truncate text-xs">{d.cliente}</span>
                </span>
                <Badge variant={d.status === 'falhou' ? 'erro' : d.status === 'respondeu' ? 'sucesso' : d.status === 'parou' ? 'destaque' : 'outline'}>{reenviados.includes(d.nome) ? 'reenviado por e-mail' : rotulo[d.status]}</Badge>
                {d.status === 'respondeu' && (
                  <Button size="icon-sm" variant="ghost" className="rounded-full" aria-label={`Abrir a conversa de ${d.nome}`} onClick={() => nav.irPara({ modulo: 'crm', aba: 'conversas', conversa: loja.conversas.find((x) => x.cliente === d.cliente)?.id ?? loja.conversas[0]?.id })}>
                    <ChatCircleTextIcon />
                  </Button>
                )}
                {d.status === 'falhou' && !reenviados.includes(d.nome) && (
                  <Button size="icon-sm" variant="ghost" className="rounded-full" aria-label={`Reenviar por e-mail a ${d.nome}`} onClick={() => setReenviados((x) => [...x, d.nome])}>
                    <EnvelopeSimpleIcon />
                  </Button>
                )}
              </li>
            ))}
        </AreaRolagem>
      </SheetContent>
    </Sheet>
  )
}

/* ---------- S05-A49: boletim mensal (GES-044): o integrante rascunha; uma pessoa aprova ---------- */

export function BoletimMensal({ onAgendar }: { onAgendar: (c: Comunicado) => void }) {
  const [estado, setEstado] = useState<'nada' | 'escrevendo' | 'pronto'>('nada')
  const [texto, setTexto] = useState('')
  const final = [
    'Boletim de dezembro · Contábil Andrade & Lima',
    '',
    'Prazos do mês para a sua empresa:',
    '• 05/12 — envie os documentos de novembro (extratos, notas de compra)',
    '• 15/12 — DCTFWeb e eSocial da folha de novembro',
    '• 20/12 — DAS do Simples Nacional e FGTS Digital',
    '• 20/12 — 13º salário (2ª parcela)',
    '',
    'O que mudou (marcado pelo Consultor):',
    '• Reforma tributária: em 2027 começa a cobrança da CBS; vamos simular o impacto para cada cliente em janeiro.',
    '',
    'Dúvidas? Responda esta mensagem.',
  ].join('\n')
  return (
    <section className="bg-surface shadow-cartao flex flex-col gap-3 rounded-[24px] p-4">
      <header className="flex items-start gap-2">
        <NewspaperIcon className="text-muted-foreground mt-0.5 size-5" />
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-medium">Boletim mensal</h3>
          <p className="text-muted-foreground text-xs">Prazos do mês pelo perfil de cada cliente e as mudanças legais que o Consultor marcou. O integrante rascunha; uma pessoa aprova.</p>
        </div>
        {estado === 'nada' && (
          <Button
            size="sm"
            variant="outline"
            className="rounded-full"
            onClick={() => {
              setEstado('escrevendo')
              const palavras = final.split(' ')
              let n = 0
              const t = window.setInterval(() => {
                n += 3
                setTexto(palavras.slice(0, n).join(' '))
                if (n >= palavras.length) {
                  window.clearInterval(t)
                  setEstado('pronto')
                }
              }, 60)
            }}
          >
            <SparkleIcon /> Pedir o rascunho
          </Button>
        )}
      </header>
      {estado !== 'nada' && (
        <>
          <textarea value={texto} onChange={(e) => setTexto(e.target.value)} rows={9} aria-label="Rascunho do boletim" className="bg-raised shadow-contorno w-full resize-y rounded-[14px] px-3 py-2 text-sm outline-none" readOnly={estado === 'escrevendo'} />
          {estado === 'pronto' && (
            <div className="flex flex-wrap items-center gap-2">
              <SeloDemonstracao fonte="Integrante (IA)" />
              <span className="text-muted-foreground text-xs">Cada cliente recebe só os prazos do perfil dele.</span>
              <Button
                size="sm"
                className="ml-auto rounded-full"
                onClick={() => {
                  onAgendar({ id: `co${Date.now()}`, titulo: 'Boletim de dezembro', segmento: 'Todos os clientes ativos (por perfil)', modelo: 'boletim_mensal', canal: 'WhatsApp + e-mail', quando: '01/12 08:00', status: 'agendado', destinatarios: 151 })
                  setEstado('nada')
                  setTexto('')
                }}
              >
                Aprovar e agendar para 01/12
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  )
}

/* ---------- S05-A50 (C2-13, como ideia): aniversário da empresa e fim de ano por modelo ---------- */

export function ComunicadosDeData() {
  const [cfg, setCfg] = usePersistente('s05:crm:datas', { aniversario: false, fimDeAno: true })
  return (
    <section className="bg-surface shadow-cartao flex flex-col gap-3 rounded-[24px] p-4">
      <header className="flex items-start gap-2">
        <CakeIcon className="text-muted-foreground mt-0.5 size-5" />
        <div className="min-w-0 flex-1">
          <h3 className="flex items-center gap-2 text-sm font-medium">
            Datas do cliente <Badge variant="outline">ideia (C2-13)</Badge>
          </h3>
          <p className="text-muted-foreground text-xs">Por modelo aprovado, com o nome de quem atende. Sai só para quem tem o assunto "comunicados".</p>
        </div>
      </header>
      <Interruptor ligado={cfg.aniversario} onMudar={(v) => setCfg({ ...cfg, aniversario: v })} rotulo="Aniversário de abertura da empresa" detalhe='"Hoje a Padaria Pão Quente faz 8 anos. Parabéns pela caminhada!" · modelo aniversario_empresa' />
      <Interruptor ligado={cfg.fimDeAno} onMudar={(v) => setCfg({ ...cfg, fimDeAno: v })} rotulo="Mensagem de fim de ano" detalhe="20/12, com o horário de recesso do escritório · modelo fim_de_ano" />
    </section>
  )
}

/* ---------- S05-A48: régua própria por cliente ("manda extrato só dia 10") ---------- */

export interface ExcecaoRegua {
  id: string
  cliente: string
  regua: string
  regra: string
}

export function ReguasPorCliente({ reguas }: { reguas: Regua[] }) {
  const loja = useLoja()
  const confirmar = useConfirmar()
  const [lista, setLista] = usePersistente<ExcecaoRegua[]>('s05:crm:reguas-cliente', [{ id: 'rx1', cliente: 'Metalúrgica Andrade Ltda', regua: 'Documentos da competência', regra: 'manda o extrato só no dia 10; não cobrar antes' }])
  const [novo, setNovo] = useState<ExcecaoRegua | null>(null)
  return (
    <section className="bg-surface shadow-cartao flex flex-col gap-3 rounded-[24px] p-4 lg:col-span-2">
      <header className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-medium">Régua própria por cliente</h3>
          <p className="text-muted-foreground text-xs">Quando um cliente tem um combinado diferente, a régua segue o combinado dele.</p>
        </div>
        <Button size="sm" variant="outline" className="rounded-full" onClick={() => setNovo({ id: '', cliente: loja.clientes[0]?.nome ?? '', regua: reguas[0]?.nome ?? '', regra: '' })}>
          <PlusIcon /> Combinado
        </Button>
      </header>
      {novo && (
        <div className="bg-sunken/60 grid gap-2 rounded-[14px] p-3 sm:grid-cols-[1fr_1fr_2fr_auto]">
          <CampoEscolha rotulo="Cliente" valor={novo.cliente} onMudar={(v) => setNovo({ ...novo, cliente: v })} opcoes={loja.clientes.map((c) => ({ valor: c.nome, rotulo: c.nome }))} />
          <CampoEscolha rotulo="Régua" valor={novo.regua} onMudar={(v) => setNovo({ ...novo, regua: v })} opcoes={reguas.map((r) => ({ valor: r.nome, rotulo: r.nome }))} />
          <CampoTexto valor={novo.regra} onMudar={(v) => setNovo({ ...novo, regra: v })} placeholder="ex.: manda o extrato só no dia 10" aria-label="Combinado" />
          <div className="flex gap-1">
            <Button
              size="sm"
              className="h-10 rounded-full"
              disabled={!novo.regra.trim()}
              onClick={() => {
                setLista((x) => [...x, { ...novo, id: `rx${Date.now()}` }])
                setNovo(null)
              }}
            >
              Salvar
            </Button>
            <Button size="sm" variant="ghost" className="h-10 rounded-full" onClick={() => setNovo(null)}>
              Cancelar
            </Button>
          </div>
        </div>
      )}
      <ul className="divide-border/70 flex flex-col divide-y">
        {lista.length === 0 && <li className="text-muted-foreground py-2 text-sm">Nenhum combinado: todos seguem as réguas do escritório.</li>}
        {lista.map((x) => (
          <li key={x.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5 text-sm">
            <span className="font-medium">{x.cliente}</span>
            <Badge variant="outline">{x.regua}</Badge>
            <span className="text-muted-foreground min-w-0 grow basis-40">{x.regra}</span>
            <Button
              size="icon-sm"
              variant="ghost"
              className="rounded-full"
              aria-label={`Tirar o combinado de ${x.cliente}`}
              onClick={async () => {
                if (!(await confirmar({ titulo: 'Tirar este combinado?', descricao: `${x.cliente} volta a seguir a régua do escritório.`, acao: 'Tirar', perigo: true }))) return
                setLista((l) => l.filter((y) => y.id !== x.id))
                loja.toastDesfazer('Combinado tirado', () => setLista((l) => [...l, x]))
              }}
            >
              <TrashIcon />
            </Button>
          </li>
        ))}
      </ul>
    </section>
  )
}

/* ---------- S05-A51 (D-19, depois): comunicado de pendências com PDF timbrado por cliente ---------- */

export function OpcaoPdfPendencias({ ligado, onMudar }: { ligado: boolean; onMudar: (v: boolean) => void }) {
  return (
    <label className={cn('flex cursor-pointer items-start gap-2 text-sm')}>
      <input type="checkbox" checked={ligado} onChange={(e) => onMudar(e.target.checked)} className="accent-foreground mt-0.5 size-4" />
      <span>
        <span className="flex items-center gap-1.5">
          <FilePdfIcon className="size-4" /> Anexar o PDF de pendências de cada cliente, com o timbre do escritório
        </span>
        <span className="text-muted-foreground block text-xs">Cada destinatário recebe só as pendências da empresa dele (D-19, previsto para depois).</span>
      </span>
    </label>
  )
}

export function AvisoLimite({ total }: { total: number }) {
  if (total <= 2000) return null
  return (
    <p className="text-destructive-text flex items-center gap-1.5 text-xs">
      <WarningCircleIcon className="size-4" /> Passa do limite do número (2.000 em 24 h): o envio é dividido em dois dias.
    </p>
  )
}

import { ArrowLeftIcon, CheckIcon, EyeIcon, LockSimpleIcon, SparkleIcon } from '@phosphor-icons/react'
import { useEffect, useState, type ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input, Label, Textarea } from '@/components/ui/input'
import { Orb } from '@/components/ui/orb'
import type { Integrante } from '@/dados/tipos'
import { cn } from '@/lib/utils'

type Passo = 'descrever' | 'propondo' | 'proposta' | 'revisao'

interface Ferramenta {
  nome: string
  nivel: 'ler' | 'rascunhar' | 'executar'
  descricao: string
  /** O usuário não tem esta ferramenta ou este nível: vem marcada e removida (02, 11.1). */
  semPermissao?: boolean
}

/** Proposta de exemplo; em produção vem de `integrante.propor(texto)`. */
const propostaExemplo = {
  nome: 'Vigia de retenções',
  funcao: 'Toda segunda, aponta notas tomadas do Presumido com ISS retido sem a retenção lançada e prepara o aviso ao cliente.',
  setores: ['Fiscal', 'Notas'],
  ferramentas: [
    { nome: 'nota.listar_tomadas', nivel: 'ler', descricao: 'Lista as notas tomadas por competência' },
    { nome: 'calculo.retencao_iss', nivel: 'ler', descricao: 'Calcula a retenção devida' },
    { nome: 'tarefa.criar', nivel: 'executar', descricao: 'Abre tarefa para quem cuida do cliente' },
    { nome: 'conversa.rascunhar_resposta', nivel: 'rascunhar', descricao: 'Prepara o aviso ao cliente (você aprova o envio)' },
    { nome: 'lancamento.corrigir', nivel: 'executar', descricao: 'Corrigir o lançamento contábil', semPermissao: true },
  ] as Ferramenta[],
  gatilhos: ['Toda segunda, às 7h, com checagem sem modelo antes de acordar', 'Quando uma nota tomada com ISS retido chegar'],
}

/** Outras propostas (a proposta segue a descrição) e os modelos publicados pelo escritório (02, 11.3). */
const propostaSublimite = {
  nome: 'Sentinela do sublimite',
  funcao: 'Todo dia 5, projeta a receita do ano dos clientes do Simples e avisa quem passar de 80% do sublimite, com a projeção.',
  setores: ['Fiscal'],
  ferramentas: [
    { nome: 'pgdas.listar', nivel: 'ler', descricao: 'Lê os PGDAS-D transmitidos' },
    { nome: 'calculo.projecao_receita', nivel: 'ler', descricao: 'Projeta a receita do ano' },
    { nome: 'notificacao.publicar', nivel: 'executar', descricao: 'Avisa você no chat e no sino' },
    { nome: 'regime.alterar', nivel: 'executar', descricao: 'Alterar o regime do cliente', semPermissao: true },
  ] as Ferramenta[],
  gatilhos: ['Todo dia 5, às 8h', 'Quando um PGDAS-D for transmitido'],
}
const propostaExtratos = {
  nome: 'Cobrador de extratos',
  funcao: 'No dia 3, confere quem ainda não mandou o extrato do mês e prepara a cobrança pela régua do cliente.',
  setores: ['Contábil'],
  ferramentas: [
    { nome: 'documento.listar', nivel: 'ler', descricao: 'Confere os extratos recebidos' },
    { nome: 'conversa.rascunhar_resposta', nivel: 'rascunhar', descricao: 'Prepara a cobrança (você aprova o envio)' },
    { nome: 'tarefa.criar', nivel: 'executar', descricao: 'Abre a pendência do cliente' },
  ] as Ferramenta[],
  gatilhos: ['Dia 3 de cada mês, às 9h'],
}
const propostaPara = (texto: string) => (/sublimite|80%|simples/i.test(texto) ? propostaSublimite : /extrato/i.test(texto) ? propostaExtratos : propostaExemplo)
const modelosPublicados = [
  { nome: 'Vigia de retenções', autor: 'Fernanda Lima', texto: 'Toda segunda, me diga quais clientes do Presumido têm nota tomada com ISS retido sem a retenção lançada, e prepare o aviso ao cliente.' },
  { nome: 'Sentinela do sublimite', autor: 'João Pereira', texto: 'Quando um cliente do Simples passar de 80% do sublimite, me avise com a projeção do ano.' },
  { nome: 'Cobrador de extratos', autor: 'Fernanda Lima', texto: 'No dia 3, veja quem não mandou extrato e prepare a cobrança.' },
]
/** Nomes que não podem ser usados: os dos integrantes padrão (e pessoas reais, conferidas na hora). */
const nomesReservados = ['assistente', 'consultor', 'fiscal', 'dp', 'pessoal', 'contabil', 'contábil', 'societario', 'societário', 'notas', 'atendimento', 'financeiro', 'bpo', 'conciliacao', 'conciliação', 'gerencial']
export const LIMITE_INTEGRANTES = 5

const cores = ['#e86a8a', '#f7a335', '#4fc9a8', '#3d86f7', '#6e5cf2', '#f2d04b', '#5bc0eb', '#9bc53d']

const exemplosBase = [
  'Toda segunda, me diga quais clientes do Presumido têm nota tomada com ISS retido sem a retenção lançada, e prepare o aviso ao cliente.',
  'Quando um cliente do Simples passar de 80% do sublimite, me avise com a projeção do ano.',
]
const exemplos = exemplosBase

interface Props {
  aberto: boolean
  onFechar: () => void
  onAtivar?: (i: Integrante) => void
  /** Quantos integrantes a pessoa já criou (02, 11.2: até `integrantes_por_usuario`, padrão 5). */
  criados?: number
  /** Nomes de pessoas do escritório (o nome do integrante não imita pessoa real). */
  pessoas?: string[]
}

/**
 * Criar integrante (02, 11.1): descrever em texto → proposta (nome, avatar,
 * função, setores, ferramentas só entre as que o usuário tem, gatilhos) →
 * revisão → ativação, com 14 dias de observação.
 */
export function NovoIntegrante({ aberto, onFechar, onAtivar, criados = 0, pessoas = [] }: Props) {
  const [passo, setPasso] = useState<Passo>('descrever')
  const [descricao, setDescricao] = useState('')
  const [proposta, setProposta] = useState(propostaExemplo)
  const [modelo, setModelo] = useState<string | null>(null)
  const [nome, setNome] = useState(proposta.nome)
  const nomeNorm = nome.trim().toLowerCase()
  const erroNome = !nome.trim() ? 'Dê um nome.' : nomesReservados.includes(nomeNorm) ? 'Esse é o nome de um integrante padrão; escolha outro.' : pessoas.some((p) => p.toLowerCase().split(' ')[0] === nomeNorm.split(' ')[0]) ? 'Não use o nome de uma pessoa do escritório.' : null
  const noLimite = criados >= LIMITE_INTEGRANTES
  const [cor, setCor] = useState(cores[0])
  const [ferramentas, setFerramentas] = useState(() => new Set(proposta.ferramentas.filter((f) => !f.semPermissao).map((f) => f.nome)))

  // Simula o tempo do modelo propondo.
  useEffect(() => {
    if (passo !== 'propondo') return
    const p = propostaPara(descricao)
    setProposta(p)
    setNome(p.nome)
    setFerramentas(new Set(p.ferramentas.filter((f) => !f.semPermissao).map((f) => f.nome)))
    const t = window.setTimeout(() => setPasso('proposta'), 1600)
    return () => window.clearTimeout(t)
  }, [passo])

  const fechar = () => {
    onFechar()
    window.setTimeout(() => {
      setPasso('descrever')
      setDescricao('')
      setModelo(null)
    }, 200)
  }

  const ativar = () => {
    onAtivar?.({
      id: `i-novo-${Date.now()}`,
      setor: 'fiscal',
      tipo: 'criado_pelo_usuario',
      nome,
      cor,
      setorRotulo: `${proposta.setores.join(' e ')} · criado por você`,
      funcao: proposta.funcao,
      estado: 'disponivel',
      resumo: 'Em observação · acabou de ser ativado',
      fila: 0,
      pendentes: 0,
      emObservacao: true,
      sugestoes: ['Rode a checagem desta semana agora', 'Quais clientes você vigia?'],
    })
    fechar()
  }

  const etapas: { id: Passo[]; rotulo: string }[] = [
    { id: ['descrever'], rotulo: 'Descrever' },
    { id: ['propondo', 'proposta'], rotulo: 'Proposta' },
    { id: ['revisao'], rotulo: 'Revisar e ativar' },
  ]

  return (
    <Dialog open={aberto} onOpenChange={(v) => !v && fechar()}>
      <DialogContent className="gap-5 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Novo integrante</DialogTitle>
          <DialogDescription>Descreva o que ele deve fazer. O sistema propõe a configuração, você revisa e ativa.</DialogDescription>
        </DialogHeader>

        <ol className="flex items-center gap-2 text-xs">
          {etapas.map((e, i) => {
            const atual = e.id.includes(passo)
            const feito = etapas.findIndex((x) => x.id.includes(passo)) > i
            return (
              <li key={e.rotulo} className="flex items-center gap-2">
                {i > 0 && <span className="bg-border h-px w-6" />}
                <span className={cn('flex items-center gap-1.5 rounded-full px-2.5 py-1', atual ? 'bg-primary text-primary-foreground' : feito ? 'bg-sunken text-foreground' : 'text-muted-foreground')}>
                  {feito ? <CheckIcon weight="bold" className="size-3" /> : <span className="tabular-nums">{i + 1}</span>}
                  {e.rotulo}
                </span>
              </li>
            )
          })}
        </ol>

        {passo === 'descrever' && noLimite && (
          <div role="alert" className="bg-sunken flex flex-col gap-2 rounded-md p-4 text-sm">
            <strong className="font-medium">Você chegou ao limite de {LIMITE_INTEGRANTES} integrantes criados.</strong>
            <p className="text-muted-foreground">É o limite do plano por pessoa. Desative um em Configurações › Integrantes ou peça ao Administrador para aumentar.</p>
          </div>
        )}
        {passo === 'descrever' && !noLimite && (
          <div className="flex flex-col gap-3">
            <Label htmlFor="descricao-integrante">O que ele deve fazer?</Label>
            <Textarea id="descricao-integrante" autoFocus rows={5} value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Ex.: toda segunda, me diga quais clientes…" />
            <div className="flex flex-col gap-1.5">
              <span className="text-muted-foreground text-xs">Exemplos</span>
              {exemplos.map((x) => (
                <button key={x} type="button" onClick={() => setDescricao(x)} className="bg-surface hover:bg-sunken cursor-pointer rounded-md px-3 py-2 text-left text-sm transition-colors">
                  {x}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-muted-foreground text-xs">Ou comece de um modelo publicado no escritório</span>
              <div className="flex flex-wrap gap-2">
                {modelosPublicados.map((m) => (
                  <button
                    key={m.nome}
                    type="button"
                    aria-pressed={modelo === m.nome}
                    onClick={() => {
                      setModelo(m.nome)
                      setDescricao(m.texto)
                    }}
                    className={cn('cursor-pointer rounded-full px-3 py-1.5 text-xs shadow-contorno transition-colors', modelo === m.nome ? 'bg-foreground text-background' : 'bg-surface hover:bg-sunken')}
                  >
                    {m.nome} · de {m.autor.split(' ')[0]}
                  </button>
                ))}
              </div>
              {modelo && <span className="text-muted-foreground text-xs">Do modelo vêm a função, as ferramentas e os gatilhos, recalculados para o que você pode. Não vêm memória, clientes nem credenciais.</span>}
            </div>
            <div className="flex justify-end">
              <Button disabled={descricao.trim().length < 10} onClick={() => setPasso('propondo')}>
                <SparkleIcon weight="fill" /> Propor
              </Button>
            </div>
          </div>
        )}

        {passo === 'propondo' && (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <Orb reacao="thinking" cor={cor} tamanho={64} animado modo="wander" cutucavel={false} />
            <p className="text-muted-foreground text-sm">Montando a proposta: função, setores, ferramentas e gatilhos…</p>
          </div>
        )}

        {passo === 'proposta' && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <Orb cor={cor} tamanho={56} animado reacao="happy" />
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <Label htmlFor="nome-integrante">Nome</Label>
                <Input id="nome-integrante" value={nome} onChange={(e) => setNome(e.target.value)} aria-invalid={!!erroNome} aria-describedby={erroNome ? 'erro-nome-integrante' : undefined} />
                {erroNome && (
                  <span id="erro-nome-integrante" className="text-destructive-text text-xs">
                    {erroNome}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">Cor do orb</span>
              <div className="flex flex-wrap gap-2">
                {cores.map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-label={`Cor ${c}`}
                    aria-pressed={c === cor}
                    onClick={() => setCor(c)}
                    className={cn('size-8 cursor-pointer rounded-full transition', c === cor ? 'ring-foreground ring-2 ring-offset-2 ring-offset-[var(--popover)]' : 'hover:scale-110')}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
            <Secao titulo="Função">
              <p className="text-sm">{proposta.funcao}</p>
            </Secao>
            <Secao titulo="Setores">
              <div className="flex gap-2">
                {proposta.setores.map((s) => (
                  <Badge key={s} variant="secondary">
                    {s}
                  </Badge>
                ))}
              </div>
            </Secao>
            <Secao titulo="Ferramentas" ajuda="Só as que você tem, até o nível que você tem.">
              <ul className="flex flex-col gap-1.5">
                {proposta.ferramentas.map((f) => (
                  <li key={f.nome}>
                    <label className={cn('flex items-start gap-3 rounded-md px-3 py-2', f.semPermissao ? 'text-muted-foreground bg-sunken/60' : 'hover:bg-sunken cursor-pointer')}>
                      <input
                        type="checkbox"
                        className="accent-primary mt-1"
                        disabled={f.semPermissao}
                        checked={!f.semPermissao && ferramentas.has(f.nome)}
                        onChange={(e) =>
                          setFerramentas((s) => {
                            const n = new Set(s)
                            if (e.target.checked) n.add(f.nome)
                            else n.delete(f.nome)
                            return n
                          })
                        }
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2 text-sm">
                          <code className="text-xs">{f.nome}</code>
                          <Badge variant="outline">{f.nivel}</Badge>
                        </span>
                        <span className="block text-xs">
                          {f.semPermissao ? (
                            <span className="flex items-center gap-1">
                              <LockSimpleIcon className="size-3" /> Você não tem isso; removido.
                            </span>
                          ) : (
                            f.descricao
                          )}
                        </span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </Secao>
            <Secao titulo="Gatilhos">
              <ul className="list-disc pl-5 text-sm">
                {proposta.gatilhos.map((g) => (
                  <li key={g}>{g}</li>
                ))}
              </ul>
            </Secao>
            <div className="flex justify-between gap-2">
              <Button variant="ghost" onClick={() => setPasso('descrever')}>
                <ArrowLeftIcon /> Voltar
              </Button>
              <Button disabled={!!erroNome} onClick={() => setPasso('revisao')}>Revisar</Button>
            </div>
          </div>
        )}

        {passo === 'revisao' && (
          <div className="flex flex-col gap-4">
            <div className="bg-surface flex items-center gap-4 rounded-lg p-4">
              <Orb cor={cor} tamanho={48} />
              <div className="min-w-0">
                <div className="font-medium">{nome}</div>
                <div className="text-muted-foreground text-sm">{proposta.setores.join(' e ')} · {ferramentas.size} ferramentas · {proposta.gatilhos.length} gatilhos</div>
              </div>
            </div>
            <div className="bg-sunken flex gap-3 rounded-md p-3 text-sm">
              <EyeIcon className="mt-0.5 size-5 shrink-0" />
              <p>
                <strong className="font-medium">14 dias de observação.</strong> Nesse período, tudo o que ele faria sozinho vira cartão para você aprovar. Ao fim, você decide o que ele passa a fazer sem perguntar.
              </p>
            </div>
            <div className="flex justify-between gap-2">
              <Button variant="ghost" onClick={() => setPasso('proposta')}>
                <ArrowLeftIcon /> Voltar
              </Button>
              <Button onClick={ativar}>
                <CheckIcon weight="bold" /> Ativar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function Secao({ titulo, ajuda, children }: { titulo: string; ajuda?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-baseline gap-2">
        <h3 className="text-sm font-medium">{titulo}</h3>
        {ajuda && <span className="text-muted-foreground text-xs">{ajuda}</span>}
      </div>
      {children}
    </section>
  )
}

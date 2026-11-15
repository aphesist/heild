import { BabyIcon, BuildingsIcon, CakeIcon, ShieldCheckIcon, FishIcon, ForkKnifeIcon, LeafIcon, PawPrintIcon, PizzaIcon, TreeIcon, WhatsappLogoIcon, EnvelopeSimpleIcon, DeviceMobileIcon } from '@phosphor-icons/react'
import { useMemo, useState } from 'react'
import { Caixa } from '@/components/compostos/blocos'
import { CartaoAprovacao } from '@/components/compostos/cartoes-chat'
import { PainelAprovacoes, type ItemAprovacao } from '@/ambiente/aprovacoes'
import type { FiltroAprovacoes } from '@/ambiente/cartoes-aprovacao'
import { CampoComSuposicoes, FaixaSuposicoes, RascunhoComLacunas, ResumoSuposicoes, ValorEditavel, type ConfigValor, type LinhaSuposicao, type ParteRascunho, type QualquerValor } from '@/components/kit'
import * as exemplo from '@/dados/exemplo'
import { suporDoTexto, type CampoSuposicao, type Suposicao } from '@/lib/suposicoes'
import { configDoCampo, contextoSuposicoes } from '@/lib/suposicoes-heild'
import type { FichaLab } from './fichas'
import { quantos, textoDe, type ParamsLab } from './parametros'

/**
 * Fase 6 no Lab: ValorEditavel em todos os tipos e estados, as suposições do
 * feedforward e o rascunho com lacunas. Os mesmos componentes das telas.
 */
const tipos = ['escolha', 'multipla', 'intervalo', 'numero', 'dinheiro', 'data', 'competencia', 'entidade', 'cor', 'texto', 'plano'] as const
type TipoLab = (typeof tipos)[number]
const rotuloTipo: Record<TipoLab, string> = { escolha: 'Escolha única', multipla: 'Escolha múltipla (chips)', intervalo: 'Intervalo', numero: 'Número', dinheiro: 'Dinheiro', data: 'Data', competencia: 'Competência', entidade: 'Cliente (entidade)', cor: 'Cor', texto: 'Texto curto', plano: 'Plano de dois eixos' }

const iconesChips = [PawPrintIcon, TreeIcon, LeafIcon, FishIcon, BabyIcon, CakeIcon]

function configDoTipo(t: TipoLab, p: ParamsLab): { config: ConfigValor; valor: QualquerValor | null; rotulo: string } {
  const n = quantos(p.itens, 8)
  const opcoes = Array.from({ length: p.estado === 'vazio' ? 0 : Math.max(n, 0) }, (_, i) => ({ valor: `o${i}`, rotulo: textoDe(p.texto, i, 'rotulo'), detalhe: t === 'entidade' ? exemplo.clientes[i % exemplo.clientes.length]?.documento : undefined, icone: t === 'multipla' ? iconesChips[i % iconesChips.length] : undefined }))
  const estado = { carregando: p.estado === 'carregando', erro: p.estado === 'erro' ? 'Não deu para buscar as opções. Tente de novo.' : null, onTentar: () => {} }
  const semValor = p.estado === 'vazio' || p.itens === '0'
  switch (t) {
    case 'escolha':
      return { rotulo: 'Status', config: { tipo: 'escolha', opcoes, ...estado }, valor: semValor ? null : (opcoes[0]?.valor ?? null) }
    case 'multipla':
      return { rotulo: 'O que eles gostam', config: { tipo: 'multipla', opcoes, ...estado }, valor: semValor ? [] : opcoes.slice(0, 2).map((o) => o.valor) }
    case 'entidade':
      return { rotulo: 'Cliente', config: { tipo: 'entidade', buscar: 'Buscar cliente ou CNPJ', opcoes: p.estado === 'vazio' ? [] : exemplo.clientes.slice(0, Math.max(1, n)).map((c, i) => ({ valor: c.id, rotulo: i === 0 ? textoDe(p.texto, 0, 'rotulo') : c.nome, detalhe: c.documento })), ...estado }, valor: semValor ? null : exemplo.clientes[0].id }
    case 'intervalo':
      return { rotulo: 'Idade das crianças', config: { tipo: 'intervalo', min: 0, max: 17, unidade: 'anos' }, valor: semValor ? null : [3, 9] }
    case 'numero':
      return { rotulo: 'Pessoas no jantar', config: { tipo: 'numero', min: 1, max: 40, unidade: 'pessoas' }, valor: semValor ? null : 6 }
    case 'dinheiro':
      return { rotulo: 'Valor da guia', config: { tipo: 'dinheiro', min: 0 }, valor: semValor ? null : p.texto === 'numeros' ? 12345678901.23 : 2840.12 }
    case 'data':
      return { rotulo: 'Prazo interno', config: { tipo: 'data' }, valor: semValor ? null : '2026-11-20' }
    case 'competencia':
      return { rotulo: 'Competência', config: { tipo: 'competencia' }, valor: semValor ? null : '10/2026' }
    case 'cor':
      return { rotulo: 'Cor da etiqueta', config: { tipo: 'cor', opcoes: [{ valor: '#3d86f7', rotulo: 'Azul' }, { valor: '#4fc9a8', rotulo: 'Verde-água' }, { valor: '#f7a335', rotulo: 'Laranja' }, { valor: '#e86a8a', rotulo: 'Rosa' }, { valor: '#6e5cf2', rotulo: 'Violeta' }, { valor: '#8a8580', rotulo: 'Cinza' }] }, valor: semValor ? null : '#3d86f7' }
    case 'texto':
      return { rotulo: 'Título da tarefa', config: { tipo: 'texto', validar: (v) => (v.trim() ? null : 'Escreva um título') }, valor: semValor ? null : textoDe(p.texto, 0) }
    case 'plano':
      return { rotulo: 'Tom do brinde', config: { tipo: 'plano', eixoX: ['curto', 'longo'], eixoY: ['brincalhão', 'emotivo'], previa: (q) => (q.y > 0.6 ? (q.x > 0.6 ? 'Hoje a gente celebra vinte anos de uma amizade que virou família…' : 'Vinte anos. Obrigado por cada um deles.') : q.x > 0.6 ? 'Quem diria que aquele estagiário que errava o DAS ia chegar aos vinte anos de casa…' : 'Vinte anos e nenhuma multa. Saúde!') }, valor: semValor ? null : { x: 0.3, y: 0.7 } }
  }
}

function FichaValorEditavel({ p }: { p: ParamsLab }) {
  const t = (tipos as readonly string[]).includes(p.variante) ? (p.variante as TipoLab) : 'escolha'
  const base = configDoTipo(t, p)
  const [valor, setValor] = useState<QualquerValor | null>(base.valor)
  const [registro, setRegistro] = useState<string[]>([])
  const desab = p.estado === 'desabilitado'
  return (
    <div data-vitrine className="grid items-start gap-4 md:grid-cols-2">
      <Caixa>
        <p className="text-muted-foreground text-xs">{rotuloTipo[t]} · no meio da frase</p>
        <p className="text-sm leading-7">
          {textoDe(p.texto, 1)}: <ValorEditavel rotulo={base.rotulo} valor={valor} config={base.config} desabilitado={desab} abertoInicial={p.estado === 'selecionado'} onMudar={(v) => (setValor(v), setRegistro((r) => [`${base.rotulo} → ${JSON.stringify(v)}`, ...r].slice(0, 4)))} />. Clique (ou Tab e Enter) para mudar.
        </p>
      </Caixa>
      <Caixa>
        <p className="text-muted-foreground text-xs">No card, como propriedade</p>
        <dl className="grid grid-cols-[max-content_minmax(0,1fr)] items-baseline gap-x-4 gap-y-2 text-sm">
          <dt className="text-muted-foreground">{base.rotulo}</dt>
          <dd className="min-w-0">
            <ValorEditavel rotulo={base.rotulo} valor={valor} config={base.config} desabilitado={desab} onMudar={(v) => setValor(v)} />
          </dd>
          <dt className="text-muted-foreground">Falha ao gravar</dt>
          <dd className="min-w-0">
            <ValorEditavel rotulo={`${base.rotulo} (falha)`} valor={valor} config={base.config} desabilitado={desab} onMudar={() => Promise.reject(new Error('Sem conexão: voltou ao anterior.'))} />
          </dd>
        </dl>
        {registro.length > 0 && (
          <ul className="text-muted-foreground border-t pt-2 text-xs" aria-label="Histórico desta demonstração">
            {registro.map((r, i) => (
              <li key={i} className="truncate">
                {r}
              </li>
            ))}
          </ul>
        )}
      </Caixa>
    </div>
  )
}

const pedidos: Record<string, string> = {
  curto: 'Manda a DAS de outubro da Padaria',
  longo: 'Prepare a DAS de 10/2026 da Padaria Pão Quente ME e envie ao contato do assunto fiscal até sexta, com o valor de R$ 2.840,12, e me avise se a receita divergir das notas',
  'muito-longo': 'Prepare a DAS de 10/2026 da Padaria Pão Quente ME (CNPJ 23.456.789/0001-01), confira com as notas de saída e o extrato do mês, envie ao contato do assunto fiscal até sexta com o valor de R$ 2.840,12, registre na tarefa e me avise se a receita divergir das notas em mais de 5% ou se houver retenção',
  'sem-espaco': 'MandaaDASdeoutubrodaPadaria_12345678901234567890',
  numeros: 'Guia de 10/2026 no valor de R$ 12.345.678.901,23 para 23.456.789/0001-01 até dia 20',
}

function FichaSuposicoes({ p }: { p: ParamsLab }) {
  const [texto, setTexto] = useState(p.estado === 'vazio' ? '' : (pedidos[p.texto] ?? pedidos.curto))
  const [ajustes, setAjustes] = useState<Partial<Record<CampoSuposicao, QualquerValor>>>({})
  const [enviado, setEnviado] = useState(p.estado === 'selecionado')
  const ctx = useMemo(() => contextoSuposicoes(exemplo.clientes, '11/2026', '2026-11-18'), [])
  const suposicoes: Suposicao[] = useMemo(() => suporDoTexto(texto, ctx).map((s) => (ajustes[s.campo] !== undefined ? { ...s, valor: ajustes[s.campo] as string | number, origem: 'pessoa' } : s)), [texto, ctx, ajustes])
  const linhas: LinhaSuposicao[] = suposicoes.map((s) => ({ s, ...configDoCampo(s.campo, exemplo.clientes) }))
  const mudar = (campo: CampoSuposicao, v: QualquerValor) => setAjustes((a) => ({ ...a, [campo]: v }))
  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <Caixa>
        <FaixaSuposicoes linhas={linhas} onMudar={mudar} carregando={p.estado === 'carregando'} />
        <div className="bg-raised shadow-campo rounded-campo">
          <CampoComSuposicoes valor={texto} onMudar={setTexto} suposicoes={suposicoes} aria-label="Pedido ao integrante" placeholder="Peça ao integrante (ex.: manda a DAS de outubro da Padaria)" />
        </div>
        <div className="flex justify-end">
          <button type="button" className="bg-primary text-primary-foreground h-9 cursor-pointer rounded-full px-4 text-sm font-medium disabled:opacity-50" disabled={!texto.trim()} onClick={() => setEnviado(true)}>
            Enviar
          </button>
        </div>
      </Caixa>
      {enviado && (
        <Caixa>
          <p className="text-muted-foreground text-xs">Resposta do integrante</p>
          <ResumoSuposicoes linhas={linhas} onMudar={mudar} />
          <p className="text-sm">Preparei o que você pediu com essas suposições. Se alguma estiver errada, corrija acima e eu refaço.</p>
        </Caixa>
      )}
    </div>
  )
}

function FichaLacunas({ p }: { p: ParamsLab }) {
  const cheio = p.estado === 'selecionado'
  const [valores, setValores] = useState<Record<string, QualquerValor | undefined>>(cheio ? { pessoas: 6, comida: ['pizza'], tom: { x: 0.3, y: 0.7 } } : {})
  const longo = p.texto === 'longo' || p.texto === 'muito-longo'
  const partes: ParteRascunho[] = [
    longo ? 'Oi, Rita! Para o jantar de fim de ano do escritório, que vai ser na sexta depois do fechamento, reservei uma mesa para ' : 'O jantar é para ',
    { lacuna: { id: 'pessoas', pergunta: 'quantas pessoas', config: { tipo: 'numero', min: 1, max: 60, unidade: 'pessoas' } } },
    ', a pessoa homenageada gosta de ',
    { lacuna: { id: 'comida', pergunta: 'qual comida', config: { tipo: 'multipla', opcoes: [{ valor: 'pizza', rotulo: 'Pizza', icone: PizzaIcon }, { valor: 'peixe', rotulo: 'Peixe', icone: FishIcon }, { valor: 'vegetariana', rotulo: 'Vegetariana', icone: LeafIcon }, { valor: 'churrasco', rotulo: 'Churrasco', icone: ForkKnifeIcon }] } } },
    ' e o brinde soa como ',
    { lacuna: { id: 'tom', pergunta: 'a sua voz', config: { tipo: 'plano', eixoX: ['curto', 'longo'], eixoY: ['brincalhão', 'emotivo'], previa: (q) => (q.y > 0.5 ? 'Vinte anos. Obrigado por cada um deles.' : 'Vinte anos e nenhuma multa. Saúde!') } } },
    '.',
  ]
  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <Caixa>
        <p className="text-muted-foreground text-xs">Rascunho do integrante (o que ele não sabe fica em branco, em vez de inventar)</p>
        <RascunhoComLacunas partes={partes} valores={valores} onPreencher={(id, v) => setValores((x) => ({ ...x, [id]: v }))} onContinuar={() => {}} />
      </Caixa>
      <Caixa>
        <p className="text-muted-foreground text-xs">Cartão de aprovação: o argumento sublinhado se corrige ali mesmo e muda a assinatura</p>
        <CartaoAprovacao
          cartao={{
            tipo: 'aprovacao',
            id: 'lab-aprovacao-edicao',
            resumo: 'Enviar DAS 10/2026 ao cliente',
            expiraEm: 'expira em 1 dia',
            argumentos: [
              { rotulo: 'Cliente', valor: exemplo.clientes[1]?.nome ?? 'Cliente', campo: 'cliente', bruto: exemplo.clientes[1]?.id, editavel: { tipo: 'entidade', buscar: 'Buscar cliente ou CNPJ', opcoes: exemplo.clientes.map((c) => ({ valor: c.id, rotulo: c.nome, detalhe: c.documento, icone: BuildingsIcon })), outra: false } },
              { rotulo: 'Canal', valor: 'WhatsApp', campo: 'canal', bruto: 'whatsapp', editavel: { tipo: 'escolha', opcoes: [{ valor: 'whatsapp', rotulo: 'WhatsApp', icone: WhatsappLogoIcon }, { valor: 'email', rotulo: 'E-mail', icone: EnvelopeSimpleIcon }, { valor: 'app', rotulo: 'App do cliente', icone: DeviceMobileIcon }], outra: false } },
              { rotulo: 'Vencimento', valor: '20/11/2026', campo: 'vencimento', bruto: '2026-11-20', editavel: { tipo: 'data' } },
              { rotulo: 'Hash', valor: 'a91f3c2' },
            ],
          }}
        />
      </Caixa>
    </div>
  )
}

/* ---------- Central de aprovações (fase 6) ---------- */

const canais = { tipo: 'escolha' as const, opcoes: [{ valor: 'whatsapp', rotulo: 'WhatsApp', icone: WhatsappLogoIcon }, { valor: 'email', rotulo: 'E-mail', icone: EnvelopeSimpleIcon }, { valor: 'app', rotulo: 'App do cliente', icone: DeviceMobileIcon }], outra: false }

/** Cartões de exemplo (os mesmos tipos que a demonstração produz), repetidos com outro cliente até a quantidade pedida. */
function itensDaCentral(p: ParamsLab): ItemAprovacao[] {
  const n = p.estado === 'vazio' ? 0 : quantos(p.itens, 8)
  const longo = p.texto !== 'curto'
  const modelos: ((cli: { id: string; nome: string }, i: number) => ItemAprovacao)[] = [
    (cli, i) => ({ setor: 'fiscal', clienteId: cli.id, origem: 'chat', corrigido: false, cartao: { tipo: 'aprovacao', id: `lab-ap-${i}`, resumo: `Transmitir PGDAS-D 10/2026 · ${cli.nome}`, expiraEm: 'expira em 2 dias', argumentos: [{ rotulo: 'Receita bruta', valor: 'R$ 23.166,67' }, { rotulo: 'DAS', valor: 'R$ 1.390,00 · vence 20/11' }] } }),
    (cli, i) => ({ setor: 'notas', clienteId: cli.id, origem: 'banco', corrigido: false, cartao: { tipo: 'aprovacao', id: `lab-ap-${i}`, resumo: `Enviar ${longo ? textoDe(p.texto, i) : 'o DANFE 4.512'} ao cliente · ${cli.nome}`, expiraEm: 'expira em 1 dia', argumentos: [{ rotulo: 'Arquivo', valor: longo ? textoDe(p.texto, i + 1) : 'DANFE 4512.pdf' }, { rotulo: 'Canal', valor: 'App do cliente', campo: 'canal', bruto: 'app', editavel: canais }, { rotulo: 'Pedido por', valor: 'Fernanda Lima' }] } }),
    (cli, i) => ({ setor: 'dp', clienteId: cli.id, origem: 'banco', corrigido: false, cartao: { tipo: 'aprovacao', id: `lab-ap-${i}`, resumo: `Contrato de experiência 45+45 para 2 admissões · ${cli.nome}`, expiraEm: 'expira em 10 h', argumentos: [{ rotulo: 'Início', valor: '23/11/2026', campo: 'inicio', bruto: '2026-11-23', editavel: { tipo: 'data' } }, { rotulo: 'Ferramenta', valor: 'contrato.gerar (executar)' }] } }),
    (cli, i) => ({ setor: 'contabil', clienteId: cli.id, origem: 'banco', corrigido: false, cartao: { tipo: 'aprovacao', id: `lab-ap-${i}`, resumo: `Enviar o balancete ao cliente · ${cli.nome}`, expiraEm: 'expira em 3 dias', argumentos: [{ rotulo: 'Competência', valor: '10/2026', campo: 'competencia', bruto: '10/2026', editavel: { tipo: 'competencia' } }, { rotulo: 'Canal', valor: 'E-mail', campo: 'canal', bruto: 'email', editavel: canais }] } }),
    (_cli, i) => ({ setor: 'financeiro_escritorio', clienteId: null, origem: 'banco', corrigido: false, cartao: { tipo: 'aprovacao', id: `lab-ap-${i}`, resumo: 'Gerar as cobranças de dezembro com NFS-e', lote: 142, expiraEm: 'expira em 5 dias', argumentos: [{ rotulo: 'Clientes', valor: '142' }, { rotulo: 'Total', valor: p.texto === 'numeros' ? 'R$ 12.345.678.901,23' : 'R$ 203.120,00' }] } }),
    (cli, i) => ({ setor: 'societario', clienteId: cli.id, origem: 'chat', corrigido: false, cartao: { tipo: 'aprovacao', id: `lab-ap-${i}`, resumo: `Mandar o instrumento para assinatura eletrônica · ${cli.nome}`, expiraEm: 'expira em 3 dias', argumentos: [{ rotulo: 'Ferramenta', valor: 'enviar_para_assinatura (executar)' }] } }),
  ]
  return Array.from({ length: n }, (_, i) => modelos[i % modelos.length](exemplo.clientes[i % exemplo.clientes.length], i))
}

function FichaCentralAprovacoes({ p }: { p: ParamsLab }) {
  const todos = useMemo(() => itensDaCentral(p), [p])
  const [decididos, setDecididos] = useState<Record<string, string>>({})
  const [filtro, setFiltro] = useState<FiltroAprovacoes>(p.estado === 'selecionado' && todos[2] ? { cartao: todos[2].cartao.id } : {})
  const itens = todos.filter((i) => !decididos[i.cartao.id])
  const registro = Object.entries(decididos)
  return (
    <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,32rem)_minmax(0,1fr)]">
      {/* A mesma peça da folha (direita no computador, inteira no celular), numa moldura do tamanho dela. */}
      <div data-vitrine className="bg-popover text-popover-foreground shadow-campo rounded-cartao flex h-[44rem] max-h-[80dvh] min-w-0 flex-col border">
        <div className="flex flex-col gap-1 border-b p-4">
          <p className="font-semibold">Aprovações</p>
          <p className="text-muted-foreground text-sm">Tudo o que os integrantes prepararam e espera a sua decisão. Decidir aqui vale no chat, no sino e na Visão geral.</p>
        </div>
        <PainelAprovacoes
          itens={itens}
          carregando={p.estado === 'carregando'}
          erro={p.estado === 'erro' ? 'Sem conexão com o banco. Os cartões continuam lá: tente de novo.' : null}
          onTentar={() => {}}
          filtro={filtro}
          onFiltro={setFiltro}
          onDecidir={(item, d, comentario) => setDecididos((x) => ({ ...x, [item.cartao.id]: `${d}${comentario ? ` · “${comentario}”` : ''}` }))}
          nomeCliente={(id) => exemplo.clientes.find((c) => c.id === id)?.nome}
        />
      </div>
      <Caixa>
        <p className="flex items-center gap-1.5 text-sm font-medium">
          <ShieldCheckIcon className="size-4" /> Decisões nesta demonstração
        </p>
        {registro.length === 0 ? (
          <p className="text-muted-foreground text-xs">Corrija um valor sublinhado, aprove, recuse com um porquê ou aprove o lote de um setor: a decisão aparece aqui (nas telas, ela executa e vira lição do integrante).</p>
        ) : (
          <ul className="text-muted-foreground flex flex-col gap-1 text-xs" aria-label="Decisões">
            {registro.map(([id, d]) => (
              <li key={id} className="break-words">
                {todos.find((i) => i.cartao.id === id)?.cartao.resumo}: {d}
              </li>
            ))}
          </ul>
        )}
      </Caixa>
    </div>
  )
}

export const fichasEdicao: FichaLab[] = [
  {
    id: 'valor-editavel',
    nome: 'Valor editável (todos os tipos)',
    grupo: 'Edição no lugar',
    descricao: 'O valor no lugar, com sublinhado pontilhado, abre o seletor do tipo: escolha, chips, intervalo, número, dinheiro, data, competência, cliente, cor, texto e plano de dois eixos. No celular, folha inferior. Otimista, com desfazer e com a falha voltando ao anterior.',
    eixos: { estados: ['padrao', 'selecionado', 'carregando', 'vazio', 'erro', 'desabilitado'], itens: true, texto: true, variantes: tipos.map((t) => ({ valor: t, rotulo: rotuloTipo[t] })) },
    render: (p) => <FichaValorEditavel key={p.variante} p={p} />,
  },
  {
    id: 'suposicoes',
    nome: 'Suposições (feedforward)',
    grupo: 'Edição no lugar',
    descricao: 'Enquanto a pessoa escreve o pedido, o que vai ser suposto aparece acima do campo, com as palavras do pedido sublinhadas; cada valor abre o seletor. A resposta começa com o mesmo resumo. Por regra, sem modelo.',
    eixos: { estados: ['padrao', 'selecionado', 'carregando', 'vazio'], texto: true },
    render: (p) => <FichaSuposicoes p={p} />,
  },
  {
    id: 'lacunas',
    nome: 'Lacunas no rascunho',
    grupo: 'Edição no lugar',
    descricao: 'O rascunho vem com lacunas no que o integrante não sabe; cada uma abre um seletor (número, chips, plano de dois eixos) e, preenchida, vira valor editável. "Faltam duas" conta o que falta. E o cartão de aprovação com argumentos editáveis.',
    eixos: { estados: ['padrao', 'selecionado'], texto: true },
    render: (p) => <FichaLacunas p={p} />,
  },
  {
    id: 'central-aprovacoes',
    nome: 'Central de aprovações',
    grupo: 'Edição no lugar',
    descricao: 'Painel global aberto pelo botão "Aprovações" ao lado do sino: tudo o que espera a decisão da pessoa, por setor e cliente. Cada cartão corrige no lugar, aprova ou recusa, com um comentário opcional que vira lição do integrante; o setor com mais de um cartão tem "Aprovar os N". "Selecionado" abre focado num cartão, como o "Corrigir" do sino.',
    eixos: { estados: ['padrao', 'selecionado', 'carregando', 'vazio', 'erro'], itens: true, texto: true },
    render: (p) => <FichaCentralAprovacoes key={`${p.estado}-${p.itens}-${p.texto}`} p={p} />,
  },
]

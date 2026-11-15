import { CheckIcon, FileTextIcon, ListChecksIcon, PencilSimpleIcon, PlusIcon, TrashIcon, TrayIcon } from '@phosphor-icons/react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useLoja } from '@/ambiente/loja'
import { Toasts } from '@/ambiente/interface'
import { Carregando, CaixaSelecao, EdicaoEmLinha, EstadoErro, EstadoVazio, Quadro, BotaoAcoes, Celula, LinhaColunas, ListaColunas, type ColunaLista } from '@/components/kit'
import { DialogoConfirmacao } from '@/components/kit/confirmar'
import { AbasSegmentadas } from '@/components/compostos/abas-segmentadas'
import { BarraUso, Caixa, Numero, Propriedade, TituloBloco } from '@/components/compostos/blocos'
import { BolhaChat } from '@/components/compostos/bolha-chat'
import { Calendario } from '@/components/compostos/calendario'
import { CampoChat } from '@/components/compostos/campo-chat'
import { StatusTarefaBadge } from '@/components/compostos/cartao-tarefa'
import { ListaIntegrantes } from '@/components/compostos/lista-integrantes'
import { LinhaDoTempo, Medidor } from '@/components/compostos/widgets'
import { AreaRolagem } from '@/components/ui/area-rolagem'
import { Avatar } from '@/components/ui/avatar'
import { Badge, Contador } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Campo, CampoArea, CampoEscolha, CampoTexto, Fichas, GavetaFormulario, Interruptor, Passos, Segmentado } from '@/components/ui/formulario'
import { ItemMenu, Menu } from '@/components/ui/menu'
import { Orb } from '@/components/ui/orb'
import { Tooltip } from '@/components/ui/tooltip'
import { GradeWidgets } from '@/components/widgets/grade'
import { tamanhoValido, type DefWidget, type TamanhoWidget } from '@/components/widgets/tipos'
import * as exemplo from '@/dados/exemplo'
import { abasPainel } from '@/dados/painel'
import type { Tarefa as TarefaTela, StatusTarefa } from '@/dados/tipos'
import type { Tarefa as TarefaE } from '@/nucleo/modelo/entidades'
import { Linha, Tabela } from '@/telas/painel/Tabela'
import { gradePainel } from '@/telas/PainelTela'
import { catalogoVisaoGeral } from '@/telas/VisaoGeralTela'
import { colunasTarefas, LinhaTarefa } from '@/telas/tarefas/ListaTarefas'
import { cn } from '@/lib/utils'
import { quantos, textoDe, valorDe, type EstadoLab, type ParamsLab, type TamanhoLab } from './parametros'

export interface FichaLab {
  id: string
  nome: string
  grupo: string
  descricao: string
  /** Eixos que mudam esta ficha; os outros não se aplicam a ela. */
  eixos: { estados: EstadoLab[]; itens?: boolean; texto?: boolean; tamanhos?: TamanhoLab[]; variantes?: { valor: string; rotulo: string }[] }
  render: (p: ParamsLab) => ReactNode
}

const todosTamanhos: TamanhoLab[] = ['P', 'M', 'G', 'L', 'XL', 'livre']
const lista = <T,>(p: ParamsLab, teto: number, f: (i: number) => T) => Array.from({ length: quantos(p.itens, teto) }, (_, i) => f(i))
const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

/* ---------- Moldura: a peça dentro de um widget de verdade, no tamanho pedido ---------- */

/**
 * Põe o conteúdo num widget real, dentro da grade de widgets real, no tamanho
 * escolhido (a grade mede a altura pelo conteúdo e aplica o teto, como nas
 * telas). "livre" põe só o conteúdo numa caixa da largura toda.
 */
function NoWidget({ p, titulo, icone, acao, tamanhos = ['P', 'M', 'G', 'L', 'XL'], conteudo }: { p: ParamsLab; titulo: string; icone?: DefWidget['icone']; acao?: ReactNode; tamanhos?: TamanhoWidget[]; conteudo: (t: TamanhoWidget) => ReactNode }) {
  if (p.tamanho === 'livre')
    return (
      <Caixa>
        <TituloBloco acao={acao}>{titulo}</TituloBloco>
        {conteudo('XL')}
      </Caixa>
    )
  const def: DefWidget = { id: 'lab', titulo, descricao: titulo, icone: icone ?? ListChecksIcon, tamanhos, acao, conteudo }
  const t = tamanhoValido(def, p.tamanho)
  return <GradeWidgets key={`${p.ficha}:${t}`} chave={`lab:${p.ficha}:${t}`} catalogo={[def]} padrao={[{ id: 'lab', tamanho: t }]} />
}

/** Corpo de lista com os estados comuns (carregando, vazio, erro). */
function ComEstados({ p, vazio, children }: { p: ParamsLab; vazio?: ReactNode; children: ReactNode }) {
  if (p.estado === 'carregando') return <Carregando linhas={3} />
  if (p.estado === 'erro') return <EstadoErro descricao="O serviço de captura não respondeu. Seus dados estão guardados." onTentar={() => {}} />
  if (p.estado === 'vazio' || p.itens === '0') return <>{vazio ?? <EstadoVazio compacto icone={TrayIcon} titulo="Nada por aqui" descricao="Quando chegar algo, aparece nesta lista." />}</>
  return <>{children}</>
}

/* ---------- Dados de exemplo gerados pelos controles ---------- */

const statusCiclo: StatusTarefa[] = ['aguardando_cliente', 'em_andamento', 'a_fazer', 'aguardando_terceiro', 'em_revisao', 'concluida', 'cancelada']
const origens: TarefaE['origem'][] = ['pessoa', 'obrigacao', 'pedido_cliente', 'integrante', 'trilha']

function tarefaE(p: ParamsLab, i: number): TarefaE {
  const agora = new Date().toISOString()
  return {
    id: `lab-t${i}`,
    escritorio_id: 'lab',
    criado_em: agora,
    atualizado_em: agora,
    setor_id: 'fiscal',
    atividade_id: p.texto === 'sem-espaco' ? 'FISCALOBRIGACAOMENSAL-0099' : `FIS-0${10 + (i % 80)}`,
    titulo: textoDe(p.texto, i),
    competencia: '10/2026',
    origem: origens[i % origens.length],
    responsavel_tipo: i % 2 ? 'integrante' : null,
    extras: { dias_aguardando: p.texto === 'numeros' ? 1234 : 2 + (i % 5), responsavel_nome: i % 2 ? 'Fiscal' : textoDe(p.texto, i, 'detalhe'), responsavel_tipo_tela: i % 2 ? 'integrante' : 'pessoa' },
    quem_conclui: 'pessoa',
    status: statusCiclo[i % statusCiclo.length],
    status_desde: agora,
    prazo_interno: '2026-11-18',
    prazo_legal: '2026-11-20',
    prioridade: 'normal',
    checklist: [],
    risco: false,
  }
}

function tarefaTela(p: ParamsLab, i: number): TarefaTela {
  return { id: `lab-t${i}`, codigo: `FIS-0${10 + i}`, titulo: textoDe(p.texto, i), cliente: textoDe(p.texto, i, 'detalhe'), setor: (['fiscal', 'dp', 'contabil', 'societario'] as const)[i % 4], prazo: `${16 + (i % 5)}/11`, status: statusCiclo[i % statusCiclo.length], atrasada: i % 5 === 1, diasAguardando: 2 + (i % 4), responsavel: { tipo: 'pessoa', nome: textoDe(p.texto, i, 'detalhe') } }
}

/* ---------- As fichas ---------- */

function FichaTarefas({ p }: { p: ParamsLab }) {
  const tarefas = useMemo(() => lista(p, 12, (i) => tarefaE(p, i)), [p])
  const [aberta, setAberta] = useState<string | null>(p.estado === 'selecionado' ? 'lab-t0' : null)
  return (
    <NoWidget p={p} titulo="Tarefas" tamanhos={['G', 'L', 'XL']} conteudo={() => (
      <ComEstados p={p}>
        <ListaColunas rotulo="Tarefas" colunas={colunasTarefas} classeCabecalho="px-1">
          {tarefas.map((t) => (
            <LinhaTarefa key={t.id} t={t} cliente={textoDe(p.texto, Number(t.id.slice(6)), 'detalhe')} filhas={[]} aberta={aberta === t.id} onPrevia={() => setAberta(aberta === t.id ? null : t.id)} onAbrir={() => {}} />
          ))}
        </ListaColunas>
      </ComEstados>
    )} />
  )
}

const colunasGenericas: ColunaLista[] = [
  { rotulo: 'Cliente', largura: 'fluida' },
  { rotulo: 'Competência', largura: '7rem', largo: true },
  { rotulo: 'Valor', largura: 'conteudo', alinhar: 'fim', largo: true },
  { rotulo: 'Situação', largura: 'conteudo', alinhar: 'fim', abaixo: true },
]

function FichaListaColunas({ p }: { p: ParamsLab }) {
  const itens = lista(p, 12, (i) => i)
  return (
    <NoWidget p={p} titulo="Cobranças do mês" tamanhos={['M', 'G', 'L', 'XL']} conteudo={() => (
      <ComEstados p={p}>
        <ListaColunas rotulo="Cobranças" colunas={colunasGenericas} quebra="media">
          {itens.map((i) => (
            <LinhaColunas key={i} aria-selected={p.estado === 'selecionado' && i === 0} className={cn('border-border/60 border-b py-2 last:border-b-0', p.estado === 'selecionado' && i === 0 && 'bg-accent rounded-md')}>
              <Celula>
                <span className="min-w-0">
                  <span className="block truncate text-sm" title={textoDe(p.texto, i, 'detalhe')}>{textoDe(p.texto, i, 'detalhe')}</span>
                  <span className="text-muted-foreground block truncate text-xs" title={textoDe(p.texto, i)}>{textoDe(p.texto, i)}</span>
                </span>
              </Celula>
              <Celula coluna={colunasGenericas[1]} className="text-muted-foreground text-xs" texto="10/2026" />
              <Celula coluna={colunasGenericas[2]} className="text-sm tabular-nums">{brl(valorDe(p.texto, i))}</Celula>
              <Celula coluna={colunasGenericas[3]}>
                <Badge variant={(['destaque', 'sucesso', 'erro'] as const)[i % 3]}>{textoDe(p.texto, i, 'rotulo')}</Badge>
              </Celula>
            </LinhaColunas>
          ))}
        </ListaColunas>
      </ComEstados>
    )} />
  )
}

function FichaLinha({ p }: { p: ParamsLab }) {
  const itens = lista(p, 8, (i) => i)
  return (
    <NoWidget p={p} titulo="Documentos pedidos" icone={FileTextIcon} conteudo={() => (
      <ComEstados p={p}>
        <ul className="divide-border/70 flex flex-col divide-y">
          {itens.map((i) => (
            <Linha key={i} titulo={textoDe(p.texto, i)} detalhe={textoDe(p.texto, i, 'detalhe')} fim={<Badge variant={i % 2 ? 'sucesso' : 'destaque'}>{textoDe(p.texto, i, 'rotulo')}</Badge>} />
          ))}
        </ul>
      </ComEstados>
    )} />
  )
}

function FichaTabela({ p }: { p: ParamsLab }) {
  const itens = lista(p, 12, (i) => i)
  return (
    <NoWidget p={p} titulo="Captura da carteira" tamanhos={['G', 'L', 'XL']} conteudo={() => (
      <ComEstados p={p}>
        <Tabela colunas={[{ rotulo: 'Cliente' }, { rotulo: 'Última captura' }, { rotulo: 'XMLs do mês', direita: true }, { rotulo: 'Situação', direita: true }]}>
          {itens.map((i) => (
            <tr key={i}>
              <td className="py-2 pr-2">{textoDe(p.texto, i, 'detalhe')}</td>
              <td className="py-2 pr-2">{textoDe(p.texto, i)}</td>
              <td className="py-2 pr-2 text-right">{(valorDe(p.texto, i) / 10).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</td>
              <td className="py-2 text-right">
                <Badge variant={i % 2 ? 'sucesso' : 'erro'}>{textoDe(p.texto, i, 'rotulo')}</Badge>
              </td>
            </tr>
          ))}
        </Tabela>
      </ComEstados>
    )} />
  )
}

function FichaWidgetKpi({ p }: { p: ParamsLab }) {
  const valor = p.texto === 'numeros' ? '12.345.678' : p.itens === '0' ? '0' : String(quantos(p.itens, 12))
  return (
    <NoWidget p={p} titulo={textoDe(p.texto, 0)} tamanhos={['P', 'M']} conteudo={() => (p.estado === 'carregando' ? <Carregando linhas={1} /> : p.estado === 'erro' ? <EstadoErro titulo="Sem dados" /> : <Numero valor={valor} rotulo={textoDe(p.texto, 1, 'detalhe')} detalhe={textoDe(p.texto, 2, 'rotulo')} />)} />
  )
}

function FichaSelos({ p }: { p: ParamsLab }) {
  const variantes = ['default', 'secondary', 'neutro', 'outline', 'destaque', 'sucesso', 'erro'] as const
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {variantes.map((v, i) => (
          <Badge key={v} variant={v}>
            {i % 2 ? <CheckIcon /> : null}
            {textoDe(p.texto, i, 'rotulo')}
          </Badge>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {statusCiclo.map((s, i) => (
          <StatusTarefaBadge key={s} tarefa={{ ...tarefaTela(p, i), status: s, atrasada: false, diasAguardando: p.texto === 'numeros' ? 1234 : 2 }} />
        ))}
        <StatusTarefaBadge tarefa={{ ...tarefaTela(p, 1), status: 'em_andamento', atrasada: true }} />
      </div>
      {/* Selo dentro de uma linha estreita: trunca com reticências em vez de sair da caixa. */}
      <div className="bg-surface shadow-cartao rounded-cartao flex w-48 items-center gap-2 p-3">
        <span className="min-w-0 truncate text-sm">{textoDe(p.texto, 0)}</span>
        <Badge variant="destaque">{textoDe(p.texto, 0, 'rotulo')}</Badge>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {[0, 1, 9, 42, 99, 100, p.texto === 'numeros' ? 123456 : 7].map((n) => (
          <span key={n} className="relative inline-flex items-center gap-1 text-sm">
            Avisos <Contador valor={n} />
          </span>
        ))}
      </div>
    </div>
  )
}

function FichaBotoes({ p }: { p: ParamsLab }) {
  const variantes = ['default', 'secondary', 'outline', 'ghost', 'destructive', 'success', 'link'] as const
  const desab = p.estado === 'desabilitado' || p.estado === 'so-leitura'
  return (
    <div className="flex flex-col gap-4">
      {(['sm', 'default', 'lg'] as const).map((s) => (
        <div key={s} className="flex flex-wrap items-center gap-2">
          {variantes.map((v, i) => (
            <Button key={v} size={s} variant={v} disabled={desab} aria-pressed={p.estado === 'selecionado' ? i === 0 : undefined}>
              {i % 3 === 0 && <PlusIcon />}
              {textoDe(p.texto, i).split(' ').slice(0, p.texto === 'curto' ? 1 : 99).join(' ')}
            </Button>
          ))}
          <Button size="icon" variant="outline" aria-label="Editar" disabled={desab}>
            <PencilSimpleIcon />
          </Button>
          <Button size="icon-sm" variant="ghost" aria-label="Excluir" disabled={desab}>
            <TrashIcon />
          </Button>
        </div>
      ))}
      {/* Grupo de botões no fim de um card estreito: o rótulo quebra, não vaza. */}
      <div className="bg-surface shadow-cartao rounded-cartao flex w-64 flex-wrap justify-end gap-2 p-4">
        <Button variant="ghost" className="rounded-full" disabled={desab}>
          Cancelar
        </Button>
        <Button className="rounded-full" disabled={desab}>
          {textoDe(p.texto, 4)}
        </Button>
      </div>
    </div>
  )
}

function FichaAbas({ p }: { p: ParamsLab }) {
  const n = Math.max(2, quantos(p.itens, 8))
  const abas = Array.from({ length: n }, (_, i) => ({ id: `a${i}`, rotulo: textoDe(p.texto, i).split(' ').slice(0, p.texto === 'curto' ? 1 : 3).join(' '), contador: i === 1 ? 3 : 0 }))
  const [ativa, setAtiva] = useState('a0')
  const [seg, setSeg] = useState('a0')
  const [fichas, setFichas] = useState<string[]>(p.estado === 'selecionado' ? ['a0', 'a2'] : [])
  return (
    <div className="flex flex-col gap-5">
      <AbasSegmentadas abas={abas} ativa={ativa} onTrocar={setAtiva} rotulo="Abas do Lab" />
      <Segmentado valor={seg} onMudar={setSeg} opcoes={abas.slice(0, 5).map((a) => ({ valor: a.id, rotulo: a.rotulo }))} rotulo="Segmentado do Lab" />
      <Fichas valores={fichas} onMudar={setFichas} opcoes={abas.map((a) => ({ valor: a.id, rotulo: a.rotulo }))} rotulo="Fichas do Lab" />
    </div>
  )
}

function FichaCampos({ p }: { p: ParamsLab }) {
  const [texto, setTexto] = useState(p.itens === '0' ? '' : textoDe(p.texto, 0))
  const [escolha, setEscolha] = useState('a')
  const [area, setArea] = useState(p.itens === '0' ? '' : textoDe(p.texto, 1))
  const [lig, setLig] = useState(p.estado === 'selecionado')
  const [marcado, setMarcado] = useState(p.estado === 'selecionado')
  const [linha, setLinha] = useState(textoDe(p.texto, 2))
  const desab = p.estado === 'desabilitado' || p.estado === 'so-leitura'
  const erro = p.estado === 'erro' ? 'Informe um CNPJ válido (14 dígitos).' : undefined
  return (
    <div className="grid max-w-xl gap-4">
      <Campo rotulo={textoDe(p.texto, 3)} ajuda="Como aparece na guia." erro={erro}>
        {(id) => <CampoTexto id={id} valor={texto} onMudar={setTexto} placeholder="Razão social" disabled={desab} readOnly={p.estado === 'so-leitura'} />}
      </Campo>
      <Campo rotulo="Regime">{(id) => <CampoEscolha id={id} rotulo="Regime" valor={escolha} onMudar={setEscolha} opcoes={[{ valor: 'a', rotulo: textoDe(p.texto, 4) }, { valor: 'b', rotulo: 'Lucro presumido' }]} />}</Campo>
      <Campo rotulo="Observação">{(id) => <CampoArea id={id} valor={area} onMudar={setArea} placeholder="Escreva aqui" />}</Campo>
      <Interruptor ligado={lig} onMudar={setLig} rotulo={textoDe(p.texto, 5)} detalhe={textoDe(p.texto, 5, 'detalhe')} desabilitado={desab} />
      <label className="flex items-center gap-2 text-sm">
        <CaixaSelecao marcado={marcado} onMudar={() => setMarcado(!marcado)} rotulo="Marcar" />
        <span className="min-w-0">{textoDe(p.texto, 6)}</span>
      </label>
      <EdicaoEmLinha valor={linha} onSalvar={(v) => setLinha(v)} rotulo="Nome do processo" />
      <Passos passos={['Dados', textoDe(p.texto, 7), 'Revisão', 'Pronto']} atual={1} />
    </div>
  )
}

function FichaEstados({ p }: { p: ParamsLab }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Caixa>
        <EstadoVazio icone={TrayIcon} titulo={textoDe(p.texto, 0)} descricao={textoDe(p.texto, 1)} acao={<Button size="sm" className="rounded-full">Criar</Button>} />
      </Caixa>
      <Caixa>
        <Carregando linhas={3} />
      </Caixa>
      <Caixa>
        <EstadoErro titulo={textoDe(p.texto, 2)} descricao={textoDe(p.texto, 3)} onTentar={() => {}} />
      </Caixa>
    </div>
  )
}

function FichaCaixa({ p }: { p: ParamsLab }) {
  const itens = lista(p, 6, (i) => i)
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Caixa>
        <TituloBloco descricao={textoDe(p.texto, 1, 'detalhe')} acao={<Button size="sm" variant="ghost" className="rounded-full">Ver todas</Button>}>
          {textoDe(p.texto, 0)}
        </TituloBloco>
        <ComEstados p={p}>
          <dl className="divide-border/70 divide-y">
            {itens.map((i) => (
              <Propriedade key={i} rotulo={textoDe(p.texto, i, 'rotulo')}>
                {textoDe(p.texto, i)}
              </Propriedade>
            ))}
          </dl>
        </ComEstados>
      </Caixa>
      <Caixa>
        <TituloBloco>Uso do mês</TituloBloco>
        {itens.slice(0, 3).map((i) => (
          <BarraUso key={i} rotulo={textoDe(p.texto, i)} usado={[40, 91, 100][i % 3] * (p.texto === 'numeros' ? 100000 : 1)} total={100 * (p.texto === 'numeros' ? 100000 : 1)} />
        ))}
        <Medidor rotulo={textoDe(p.texto, 3)} valor={7} total={10} />
      </Caixa>
    </div>
  )
}

function FichaModal({ p }: { p: ParamsLab }) {
  const itens = lista(p, 12, (i) => i)
  return (
    <Dialog open modal={false}>
      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{textoDe(p.texto, 0)}</DialogTitle>
          <DialogDescription>{textoDe(p.texto, 1)}</DialogDescription>
        </DialogHeader>
        <ComEstados p={p}>
          <ul className="divide-border/70 flex flex-col divide-y">
            {itens.map((i) => (
              <Linha key={i} titulo={textoDe(p.texto, i)} detalhe={textoDe(p.texto, i, 'detalhe')} fim={<Badge variant="neutro">{textoDe(p.texto, i, 'rotulo')}</Badge>} />
            ))}
          </ul>
        </ComEstados>
        <DialogFooter>
          <Button variant="ghost" className="rounded-full">Cancelar</Button>
          <Button className="rounded-full" disabled={p.estado === 'desabilitado'}>Confirmar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function FichaConfirmacao({ p }: { p: ParamsLab }) {
  return <DialogoConfirmacao pedido={{ titulo: textoDe(p.texto, 0), descricao: textoDe(p.texto, 1), acao: 'Excluir', perigo: true, exigirMotivo: p.estado !== 'padrao' }} onResponder={() => {}} />
}

function FichaGaveta({ p }: { p: ParamsLab }) {
  const itens = lista(p, 12, (i) => i)
  return (
    <GavetaFormulario aberta onFechar={() => {}} titulo={textoDe(p.texto, 0)} descricao={textoDe(p.texto, 1)} acao="Salvar" onAcao={() => {}} acaoDesabilitada={p.estado === 'desabilitado'} largura={p.tamanho === 'L' || p.tamanho === 'XL' ? 'lg' : 'md'}>
      <ComEstados p={p}>
        {itens.map((i) => (
          <Campo key={i} rotulo={textoDe(p.texto, i)}>{(id) => <CampoTexto id={id} valor={textoDe(p.texto, i, 'detalhe')} onMudar={() => {}} />}</Campo>
        ))}
      </ComEstados>
    </GavetaFormulario>
  )
}

function FichaMenu({ p }: { p: ParamsLab }) {
  const itens = lista(p, 8, (i) => i)
  return (
    <div className="flex flex-wrap items-start gap-6">
      <Menu gatilho={<Button variant="outline">Menu aberto</Button>}>
        {itens.map((i) => (
          <ItemMenu key={i} icone={<PencilSimpleIcon />} detalhe={textoDe(p.texto, i, 'detalhe')} desabilitado={p.estado === 'desabilitado' && i === 0}>
            {textoDe(p.texto, i)}
          </ItemMenu>
        ))}
      </Menu>
      <BotaoAcoes acoes={itens.map((i) => ({ rotulo: textoDe(p.texto, i), icone: <PencilSimpleIcon />, onSelecionar: () => {} }))} />
      <Tooltip conteudo={textoDe(p.texto, 0)}>
        <Button variant="ghost">Dica</Button>
      </Tooltip>
    </div>
  )
}

function FichaToasts({ p }: { p: ParamsLab }) {
  const loja = useLoja()
  const n = quantos(p.itens, 3)
  useEffect(() => {
    for (let i = 0; i < n; i++) loja.toast(textoDe(p.texto, i))
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return <Toasts />
}

function FichaQuadro({ p }: { p: ParamsLab }) {
  const colunas = [
    { id: 'a_fazer', titulo: 'A fazer' },
    { id: 'em_andamento', titulo: textoDe(p.texto, 0) },
    { id: 'aguardando_cliente', titulo: 'Aguardando cliente' },
    { id: 'concluida', titulo: 'Concluída', bloqueada: true },
  ]
  const itens = lista(p, 8, (i) => tarefaTela(p, i)).filter((t) => t.status !== 'cancelada')
  return (
    <NoWidget p={p} titulo="Fechamento" tamanhos={['XL']} conteudo={() => (
      <ComEstados p={p} vazio={<Quadro colunas={colunas} itens={[] as TarefaTela[]} idDe={(t) => t.id} colunaDe={(t) => t.status} rotuloDe={(t) => t.titulo} onMover={() => {}} render={() => null} />}>
        <Quadro
          colunas={colunas}
          itens={itens}
          idDe={(t) => t.id}
          colunaDe={(t) => (['a_fazer', 'em_andamento', 'aguardando_cliente', 'concluida'].includes(t.status) ? t.status : 'a_fazer')}
          rotuloDe={(t) => t.titulo}
          onMover={() => {}}
          desabilitado={p.estado === 'desabilitado' || p.estado === 'so-leitura'}
          render={(t) => (
            <div className="flex min-w-0 flex-col gap-1">
              <span className="truncate text-sm" title={t.titulo}>{t.titulo}</span>
              <span className="text-muted-foreground truncate text-xs" title={t.cliente}>{t.cliente}</span>
              <StatusTarefaBadge tarefa={t} />
            </div>
          )}
        />
      </ComEstados>
    )} />
  )
}

function FichaCalendario({ p }: { p: ParamsLab }) {
  const tarefas = lista(p, 14, (i) => tarefaTela(p, i))
  return <NoWidget p={p} titulo="Calendário" tamanhos={['G', 'XL']} conteudo={() => <ComEstados p={p}><Calendario tarefas={tarefas} semFiltros={p.tamanho !== 'livre'} /></ComEstados>} />
}

function FichaLinhaDoTempo({ p }: { p: ParamsLab }) {
  const itens = lista(p, 10, (i) => ({ id: `e${i}`, hora: p.texto === 'numeros' ? '23:59:59' : `0${8 + (i % 2)}:${10 + i}`, texto: textoDe(p.texto, i), ator: textoDe(p.texto, i, 'detalhe') }))
  return <NoWidget p={p} titulo="Linha do tempo" conteudo={() => <ComEstados p={p}><LinhaDoTempo itens={itens} /></ComEstados>} />
}

function FichaChat({ p }: { p: ParamsLab }) {
  const msgs = lista(p, 6, (i) => ({ id: `m${i}`, autor: i % 2 ? ({ tipo: 'integrante', setor: 'fiscal' } as const) : ({ tipo: 'usuario', nome: 'Fernanda Lima' } as const), hora: `09:${10 + i}`, texto: textoDe(p.texto, i) }))
  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <ComEstados p={p}>
        <AreaRolagem className="flex max-h-[28rem] flex-col gap-4">
          {msgs.map((m) => (
            <BolhaChat key={m.id} mensagem={m} />
          ))}
        </AreaRolagem>
      </ComEstados>
      <CampoChat onEnviar={() => {}} desabilitado={p.estado === 'desabilitado'} placeholder={textoDe(p.texto, 0)} />
    </div>
  )
}

function FichaAvatares({ p }: { p: ParamsLab }) {
  const n = Math.max(1, quantos(p.itens, 8))
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        {Array.from({ length: n }, (_, i) => (
          <Avatar key={i} nome={textoDe(p.texto, i, 'detalhe')} tamanho={(['sm', 'md', 'lg'] as const)[i % 3]} />
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {(['#f7a335', '#3d86f7', '#4fc9a8', '#6e5cf2', '#e86a8a'] as const).map((c, i) => (
          <Orb key={c} cor={c} tamanho={[24, 36, 48, 64, 96][i]} cutucavel={false} />
        ))}
      </div>
      <div className="max-w-xs">
        <ListaIntegrantes integrantes={exemplo.integrantes.slice(0, Math.max(1, n))} selecionado={p.estado === 'selecionado' ? exemplo.integrantes[0]?.id : undefined} />
      </div>
    </div>
  )
}

function FichaRolagem({ p }: { p: ParamsLab }) {
  const itens = lista(p, 30, (i) => i)
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Caixa>
        <TituloBloco>Vertical</TituloBloco>
        <AreaRolagem className="h-56">
          <ul className="divide-border/70 divide-y">
            {itens.map((i) => (
              <Linha key={i} titulo={textoDe(p.texto, i)} detalhe={textoDe(p.texto, i, 'detalhe')} />
            ))}
          </ul>
        </AreaRolagem>
      </Caixa>
      <Caixa>
        <TituloBloco>Horizontal</TituloBloco>
        <AreaRolagem eixo="x" className="sem-barra flex gap-2">
          {itens.map((i) => (
            <Badge key={i} variant="neutro">{textoDe(p.texto, i, 'rotulo')}</Badge>
          ))}
        </AreaRolagem>
      </Caixa>
      <Caixa className="h-72">
        <TituloBloco>Tabela com cabeçalho fixo</TituloBloco>
        <div className="min-h-0 flex-1">
          <Tabela colunas={[{ rotulo: 'Cliente' }, { rotulo: 'Valor', direita: true }]} minimo={360}>
            {itens.map((i) => (
              <tr key={i}>
                <td className="py-2 pr-2">{textoDe(p.texto, i, 'detalhe')}</td>
                <td className="py-2 text-right">{brl(valorDe(p.texto, i))}</td>
              </tr>
            ))}
          </Tabela>
        </div>
      </Caixa>
    </div>
  )
}

/* ---------- Widgets reais das telas ---------- */

const abasLab = ['inicio', ...abasPainel.map((a) => a.id)]

function catalogoReal(variante: string): DefWidget[] {
  const [abaId, modo] = (variante || 'inicio').split(':')
  if (abaId === 'inicio')
    return catalogoVisaoGeral({ indicadores: exemplo.indicadores, progressoMes: exemplo.progressoMes, avisos: exemplo.avisos, dias: exemplo.diasSemana, agenda: exemplo.agenda, hoje: 18, pendencias: exemplo.pendencias, linhaDoTempo: exemplo.linhaDoTempo, integrantes: exemplo.integrantes }, exemplo.clientes[0].nome)
  const a = abasPainel.find((x) => x.id === abaId) ?? abasPainel[0]
  const carteira = modo === 'carteira'
  return gradePainel({ aba: a, cliente: carteira ? undefined : a.id === 'fiscal' ? exemplo.clientes[1] : exemplo.clientes[0], clientesNaCarteira: exemplo.clientes.length, tarefas: exemplo.tarefas, integrante: exemplo.integrantes.find((i) => i.setor === a.setor) }).catalogo
}

function FichaWidgetsReais({ p }: { p: ParamsLab }) {
  const catalogo = catalogoReal(p.variante)
  const t: TamanhoWidget = p.tamanho === 'livre' ? 'M' : p.tamanho
  return <GradeWidgets key={`${p.variante}:${t}`} chave={`lab:reais:${p.variante}:${t}`} catalogo={catalogo} padrao={catalogo.map((d) => ({ id: d.id, tamanho: tamanhoValido(d, t) }))} />
}

export const fichasComponentes: FichaLab[] = [
  { id: 'tarefas', nome: 'Lista de tarefas', grupo: 'Listas e tabelas', descricao: 'A linha de tarefa das telas (LinhaTarefa) na ListaColunas: selo e ação com o tamanho do conteúdo, texto truncado com título. Caso de teste da tag "aguard. cliente".', eixos: { estados: ['padrao', 'carregando', 'vazio', 'erro', 'selecionado', 'hover', 'foco'], itens: true, texto: true, tamanhos: ['G', 'L', 'XL', 'livre'] }, render: (p) => <FichaTarefas p={p} /> },
  { id: 'lista-colunas', nome: 'Lista em colunas', grupo: 'Listas e tabelas', descricao: 'ListaColunas, LinhaColunas e Celula: uma grade para cabeçalho e linhas; no estreito, a situação desce para a linha de baixo.', eixos: { estados: ['padrao', 'carregando', 'vazio', 'erro', 'selecionado'], itens: true, texto: true, tamanhos: ['M', 'G', 'L', 'XL', 'livre'] }, render: (p) => <FichaListaColunas p={p} /> },
  { id: 'linha', nome: 'Linha de lista', grupo: 'Listas e tabelas', descricao: 'Linha (ícone, título truncado, detalhe, fim) dentro de um widget de verdade.', eixos: { estados: ['padrao', 'carregando', 'vazio', 'erro'], itens: true, texto: true, tamanhos: todosTamanhos }, render: (p) => <FichaLinha p={p} /> },
  { id: 'tabela', nome: 'Tabela', grupo: 'Listas e tabelas', descricao: 'Tabela com cabeçalho fixo: rola nas duas direções e o esmaecido começa abaixo do cabeçalho (caso "Captura da carteira").', eixos: { estados: ['padrao', 'carregando', 'vazio', 'erro'], itens: true, texto: true, tamanhos: ['G', 'L', 'XL', 'livre'] }, render: (p) => <FichaTabela p={p} /> },
  { id: 'kpi', nome: 'Número (KPI)', grupo: 'Superfícies', descricao: 'Número com rótulo num widget P ou M.', eixos: { estados: ['padrao', 'carregando', 'erro'], itens: true, texto: true, tamanhos: ['P', 'M', 'livre'] }, render: (p) => <FichaWidgetKpi p={p} /> },
  { id: 'caixa', nome: 'Caixa, título e propriedade', grupo: 'Superfícies', descricao: 'Caixa de página com TituloBloco, Propriedade, BarraUso e Medidor.', eixos: { estados: ['padrao', 'carregando', 'vazio', 'erro'], itens: true, texto: true }, render: (p) => <FichaCaixa p={p} /> },
  { id: 'selos', nome: 'Selos e contadores', grupo: 'Selos e botões', descricao: 'Badge em todas as variantes, o selo de estado da tarefa e o Contador. Numa linha estreita, o selo trunca com o texto inteiro no título.', eixos: { estados: ['padrao'], texto: true }, render: (p) => <FichaSelos p={p} /> },
  { id: 'botoes', nome: 'Botões', grupo: 'Selos e botões', descricao: 'Button em todas as variantes e tamanhos, botão de ícone e grupo de botões num card estreito.', eixos: { estados: ['padrao', 'desabilitado', 'selecionado', 'hover', 'foco', 'so-leitura'], texto: true }, render: (p) => <FichaBotoes p={p} /> },
  { id: 'abas', nome: 'Abas, segmentado e fichas', grupo: 'Selos e botões', descricao: 'AbasSegmentadas (rola de lado com as bordas esmaecidas), Segmentado e Fichas.', eixos: { estados: ['padrao', 'selecionado', 'hover', 'foco'], itens: true, texto: true }, render: (p) => <FichaAbas p={p} /> },
  { id: 'campos', nome: 'Campos', grupo: 'Campos', descricao: 'Campo, CampoTexto, CampoEscolha, CampoArea, Interruptor, CaixaSelecao, EdicaoEmLinha e Passos.', eixos: { estados: ['padrao', 'vazio', 'erro', 'desabilitado', 'selecionado', 'foco', 'so-leitura'], itens: true, texto: true }, render: (p) => <FichaCampos p={p} /> },
  { id: 'estados', nome: 'Vazio, carregando e erro', grupo: 'Estados', descricao: 'EstadoVazio, Carregando e EstadoErro lado a lado.', eixos: { estados: ['padrao'], texto: true }, render: (p) => <FichaEstados p={p} /> },
  { id: 'modal', nome: 'Modal', grupo: 'Sobreposições', descricao: 'DialogContent com conteúdo longo: rola por dentro, com o esmaecido, sem sair da tela.', eixos: { estados: ['padrao', 'carregando', 'vazio', 'erro', 'desabilitado'], itens: true, texto: true }, render: (p) => <FichaModal p={p} /> },
  { id: 'confirmacao', nome: 'Confirmação', grupo: 'Sobreposições', descricao: 'DialogoConfirmacao (useConfirmar), com e sem motivo obrigatório.', eixos: { estados: ['padrao', 'selecionado'], texto: true }, render: (p) => <FichaConfirmacao p={p} /> },
  { id: 'gaveta', nome: 'Gaveta de formulário', grupo: 'Sobreposições', descricao: 'GavetaFormulario: corpo que rola entre o cabeçalho e o rodapé fixo.', eixos: { estados: ['padrao', 'carregando', 'vazio', 'erro', 'desabilitado'], itens: true, texto: true, tamanhos: ['M', 'L'] }, render: (p) => <FichaGaveta p={p} /> },
  { id: 'menu', nome: 'Menu e dica', grupo: 'Sobreposições', descricao: 'Menu com ItemMenu, BotaoAcoes e Tooltip.', eixos: { estados: ['padrao', 'desabilitado'], itens: true, texto: true }, render: (p) => <FichaMenu p={p} /> },
  { id: 'avisos', nome: 'Avisos (toast)', grupo: 'Sobreposições', descricao: 'Os avisos do canto da tela, empilhados.', eixos: { estados: ['padrao'], itens: true, texto: true }, render: (p) => <FichaToasts p={p} /> },
  { id: 'quadro', nome: 'Kanban', grupo: 'Dados visuais', descricao: 'Quadro (colunas da altura do conteúdo, etapa vazia, bordas esmaecidas ao rolar de lado).', eixos: { estados: ['padrao', 'carregando', 'vazio', 'erro', 'desabilitado'], itens: true, texto: true, tamanhos: ['XL', 'livre'] }, render: (p) => <FichaQuadro p={p} /> },
  { id: 'calendario', nome: 'Calendário', grupo: 'Dados visuais', descricao: 'Calendario na semana (no celular, o dia).', eixos: { estados: ['padrao', 'carregando', 'vazio', 'erro'], itens: true, texto: true, tamanhos: ['G', 'XL', 'livre'] }, render: (p) => <FichaCalendario p={p} /> },
  { id: 'linha-do-tempo', nome: 'Linha do tempo', grupo: 'Dados visuais', descricao: 'LinhaDoTempo num widget.', eixos: { estados: ['padrao', 'carregando', 'vazio', 'erro'], itens: true, texto: true, tamanhos: todosTamanhos }, render: (p) => <FichaLinhaDoTempo p={p} /> },
  { id: 'chat', nome: 'Bolha e campo de chat', grupo: 'Dados visuais', descricao: 'BolhaChat numa área que rola e o CampoChat.', eixos: { estados: ['padrao', 'carregando', 'vazio', 'erro', 'desabilitado'], itens: true, texto: true }, render: (p) => <FichaChat p={p} /> },
  { id: 'avatares', nome: 'Avatar, orb e integrantes', grupo: 'Dados visuais', descricao: 'Avatar, Orb nos tamanhos e ListaIntegrantes.', eixos: { estados: ['padrao', 'selecionado'], itens: true, texto: true }, render: (p) => <FichaAvatares p={p} /> },
  { id: 'rolagem', nome: 'Área de rolagem', grupo: 'Rolagem', descricao: 'AreaRolagem vertical, horizontal e tabela com cabeçalho fixo: o esmaecido aparece só do lado em que há mais conteúdo.', eixos: { estados: ['padrao'], itens: true, texto: true }, render: (p) => <FichaRolagem p={p} /> },
  {
    id: 'widgets-reais',
    nome: 'Widgets reais',
    grupo: 'Telas',
    descricao: 'Todos os widgets de uma aba (Início ou Painel, com cliente ou carteira) na grade real, no tamanho escolhido (ou no mais próximo que o widget aceita), com os dados de exemplo.',
    eixos: { estados: ['padrao'], tamanhos: ['P', 'M', 'G', 'L', 'XL'], variantes: abasLab.flatMap((a) => (a === 'inicio' ? [{ valor: 'inicio', rotulo: 'Início' }] : [{ valor: a, rotulo: `Painel · ${abasPainel.find((x) => x.id === a)?.rotulo ?? a}` }, { valor: `${a}:carteira`, rotulo: `Painel · ${abasPainel.find((x) => x.id === a)?.rotulo ?? a} (carteira)` }])) },
    render: (p) => <FichaWidgetsReais p={p} />,
  },
]

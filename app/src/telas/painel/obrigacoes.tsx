import { useContext, useEffect, useMemo, useState } from 'react'
import { AbaCtx } from '@/components/compostos/painel-aba'
import { ArrowsClockwiseIcon, CalendarCheckIcon, CalendarPlusIcon, ChecksIcon, DownloadSimpleIcon, FunnelIcon, ListChecksIcon, MapTrifoldIcon, PaperPlaneTiltIcon, ReceiptIcon, SealQuestionIcon, SirenIcon, XIcon } from '@phosphor-icons/react'
import { registrarExecutor, useAgenteS02 } from '@/ambiente/agente-s02'
import { useFluxos } from '@/ambiente/fluxos'
import { useLoja, usePersistente } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import { BotaoAcoes, EstadoVazio, FormularioModal, SeloDemonstracao, useConfirmar, useFormulario, type AcaoMenu } from '@/components/kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Campo, CampoArea, CampoEscolha, CampoTexto, GavetaFormulario, Interruptor, Segmentado } from '@/components/ui/formulario'
import { Orb } from '@/components/ui/orb'
import { Tooltip } from '@/components/ui/tooltip'
import type { DefWidget, TamanhoWidget } from '@/components/widgets/tipos'
import {
  CHAVE_FILTRO_SETORES,
  competenciaSeguinte,
  consumirFiltroPedido,
  ddmm,
  diasEntre,
  filtroPadrao,
  hashCurto,
  HOJE_DEMO,
  itensDeObrigacao,
  meusSetoresDeObrigacao,
  planejarCalendario,
  setoresComObrigacao,
  setoresVisiveis,
  type FiltroSetores,
  type ItemObrigacao,
} from '@/dados/obrigacoes-setor'
import { colecao, useColecao } from '@/dados/s02/colecao'
import { useAparencia } from '@/hooks/useAparencia'
import { cn } from '@/lib/utils'
import type { Tarefa } from '@/nucleo/modelo/entidades'
import { rotuloSetorCurto } from '@/nucleo/permissoes/setores'
import { useTabela } from '@/nucleo/react'
import { repos } from '@/nucleo/repositorios'
import { perfisDaFoto } from '@/nucleo/semente/s02'
import type { SetorIntegrante } from '@/theme/tipos'
import { SeloStatusObrigacao } from './obrigacoes-setor'
import { FeitoPor } from './anatomia'
import { Numero, Tabela } from './Tabela'
import type { CtxAba, WidgetsAba } from './tipos'

/**
 * Obrigações e Prazos (03, 6.2 e ad. "Obrigações dinâmica por setor", 14/11):
 * o calendário vivo de toda obrigação, gerado do perfil × regras, com setor
 * dono por obrigação (C2) e filtro por quem olha. Cada ocorrência é uma tarefa
 * `origem = obrigacao`; o integrante mostrado é o do setor do item.
 */
export function widgetsObrigacoes({ cliente }: CtxAba): WidgetsAba {
  return {
    catalogo: cliente ? [faixas, calendario, riscos, prerequisitos, comprovacao, prorrogacoes, eventuais] : [faixas, semanaCarteira, riscos, prerequisitos, prorrogacoes, eventuais],
  }
}

/* ---------- Estado da tela: setores, competência, faixa ---------- */

const CHAVE_COMPETENCIA = 's02:obrigacoes:competencia'
const CHAVE_FAIXA = 's02:obrigacoes:faixa'
type Faixa = 'vencido' | '7' | '30' | null

/** Quem olha: setores dele e se escolhe "um · todos" (Gestor e Administrador). */
export function useQuemOlha() {
  const { usuario, permissoes } = useSessao()
  const escolheTodos = usuario.papel !== 'colaborador'
  const meus = meusSetoresDeObrigacao(permissoes.setores)
  return { usuario, escolheTodos, meus }
}

/** Filtro de setores (C2), persistido; aplica o pedido do "ver todas" ao montar. */
export function useFiltroSetores() {
  const { escolheTodos, meus } = useQuemOlha()
  const [filtro, setFiltro] = usePersistente<FiltroSetores>(CHAVE_FILTRO_SETORES, filtroPadrao)
  useEffect(() => {
    const pedido = consumirFiltroPedido()
    if (pedido) setFiltro(escolheTodos ? { modo: 'um', setores: [pedido] } : { modo: 'chips', setores: [pedido] })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const visiveis = setoresVisiveis(filtro, meus, escolheTodos)
  return { filtro, setFiltro, visiveis, escolheTodos, meus }
}

/** Ocorrências que a tela mostra: competência, cliente (ou carteira) e setores visíveis. */
export function useOcorrencias(clienteId?: string, opcoes: { todasCompetencias?: boolean; semFaixa?: boolean } = {}) {
  const tarefas = useTabela('tarefa')
  const clientes = useTabela('cliente')
  const regras = useTabela('obrigacao')
  const { visiveis } = useFiltroSetores()
  const [competencia] = usePersistente(CHAVE_COMPETENCIA, '10/2026')
  const [faixa] = usePersistente<Faixa>(CHAVE_FAIXA, null)
  const todas = useMemo(() => itensDeObrigacao(tarefas, clientes, regras), [tarefas, clientes, regras])
  const doEscopo = todas.filter((i) => visiveis.includes(i.setor) && (!clienteId || i.clienteId === clienteId) && (opcoes.todasCompetencias || i.competencia === competencia || (!!i.eventual && i.status !== 'entregue')))
  const filtradas = opcoes.semFaixa || !faixa ? doEscopo : doEscopo.filter((i) => naFaixa(i, faixa))
  return { itens: filtradas, doEscopo, competencia, faixa, regras, tarefas, clientes }
}

const aberta = (i: ItemObrigacao) => !['entregue', 'cancelada', 'dispensada'].includes(i.status)
function naFaixa(i: ItemObrigacao, f: Exclude<Faixa, null>) {
  if (!aberta(i) || !i.legal) return false
  const d = diasEntre(HOJE_DEMO, i.legal)
  return f === 'vencido' ? d < 0 : f === '7' ? d >= 0 && d <= 7 : d >= 0 && d <= 30
}

/* ---------- Seletor de setores (S02-A40), fica no topo da aba ---------- */

export function SeletorSetores() {
  const { filtro, setFiltro, visiveis, escolheTodos, meus } = useFiltroSetores()
  const aparencia = useAparencia()
  const [competencia, setCompetencia] = usePersistente(CHAVE_COMPETENCIA, '10/2026')
  const tarefas = useTabela('tarefa')
  const competencias = useMemo(() => [...new Set(tarefas.filter((t) => t.origem === 'obrigacao' && t.competencia).map((t) => t.competencia!))].sort((a, b) => a.slice(3).localeCompare(b.slice(3)) || a.localeCompare(b)), [tarefas])
  const integrantes = (
    <div className="flex items-center gap-1.5" aria-label="Integrantes dos setores mostrados">
      {visiveis.slice(0, 6).map((s) => {
        const t = aparencia({ setor: s })
        return (
          <Tooltip key={s} conteudo={`${t.nome}: integrante de ${rotuloSetorCurto[s]}`}>
            <span className="flex">
              <Orb cor={t.cor} corOlhos={t.corOlhos} estado="disponivel" tamanho={20} animado={false} cutucavel={false} />
            </span>
          </Tooltip>
        )
      })}
    </div>
  )
  const seletorCompetencia = (
    <label className="text-muted-foreground flex items-center gap-1.5 text-xs">
      Competência
      <span className="w-28">
        <CampoEscolha rotulo="Competência" valor={competencia} onMudar={setCompetencia} opcoes={(competencias.length ? competencias : ['10/2026']).map((c) => ({ valor: c, rotulo: c }))} />
      </span>
    </label>
  )
  return (
    <div className="bg-surface shadow-contorno flex flex-wrap items-center gap-x-4 gap-y-2 rounded-[18px] px-3 py-2">
      <span className="flex items-center gap-1.5 text-sm">
        <FunnelIcon className="text-muted-foreground size-4" /> Setores
      </span>
      {escolheTodos ? (
        <div className="flex flex-wrap items-center gap-2">
          <Segmentado
            rotulo="Setores mostrados"
            valor={filtro.modo === 'chips' ? 'meus' : filtro.modo}
            onMudar={(m) => setFiltro({ modo: m, setores: m === 'um' ? [filtro.setores[0] ?? meus[0] ?? 'fiscal'] : [] })}
            opcoes={[
              { valor: 'meus', rotulo: 'Meus setores' },
              { valor: 'um', rotulo: 'Um setor' },
              { valor: 'todos', rotulo: 'Todos' },
            ]}
          />
          {filtro.modo === 'um' && (
            <span className="w-40">
              <CampoEscolha rotulo="Setor" valor={filtro.setores[0] ?? 'fiscal'} onMudar={(s) => setFiltro({ modo: 'um', setores: [s as SetorIntegrante] })} opcoes={setoresComObrigacao.map((s) => ({ valor: s, rotulo: rotuloSetorCurto[s] }))} />
            </span>
          )}
        </div>
      ) : meus.length > 1 ? (
        <div role="group" aria-label="Seus setores" className="flex flex-wrap gap-1.5">
          {meus.map((s) => {
            const ligado = visiveis.includes(s)
            return (
              <button
                key={s}
                type="button"
                aria-pressed={ligado}
                onClick={() => {
                  const marcados = ligado ? visiveis.filter((x) => x !== s) : [...visiveis, s]
                  setFiltro({ modo: 'chips', setores: marcados.length ? marcados : meus })
                }}
                className={cn('cursor-pointer rounded-full px-3 py-1 text-xs transition-colors', ligado ? 'bg-foreground text-background' : 'bg-sunken text-muted-foreground hover:text-foreground')}
              >
                {rotuloSetorCurto[s]}
              </button>
            )
          })}
        </div>
      ) : (
        <span className="text-muted-foreground text-xs">{meus[0] ? `só ${rotuloSetorCurto[meus[0]]}, o seu setor` : 'nenhum setor com obrigações'}</span>
      )}
      {integrantes}
      <span className="ml-auto">{seletorCompetencia}</span>
    </div>
  )
}

/* ---------- Ações sobre uma ocorrência ---------- */

/** Ações de uma linha (abrir, reprogramar, recibo, multa, sem movimento, cancelar), com permissão por papel. */
function useAcoesOcorrencia() {
  const fluxos = useFluxos()
  const loja = useLoja()
  const confirmar = useConfirmar()
  const { usuario, escolheTodos } = useQuemOlha()
  const [reprogramar, setReprogramar] = useState<ItemObrigacao | null>(null)
  const [recibo, setRecibo] = useState<ItemObrigacao | null>(null)
  const [multa, setMulta] = useState<ItemObrigacao | null>(null)
  const ehMinha = (i: ItemObrigacao) => {
    const t = repos.tarefas.obter(i.id)
    return t?.responsavel_id === usuario.id || t?.extras?.responsavel_nome === usuario.nome || t?.responsavel_tipo === 'integrante'
  }
  const acoes = (i: ItemObrigacao): AcaoMenu[] => {
    const lista: AcaoMenu[] = [{ rotulo: 'Abrir a tarefa', onSelecionar: () => fluxos.abrirTarefa(i.id) }]
    if (aberta(i)) {
      if (escolheTodos || ehMinha(i)) lista.push({ rotulo: 'Reprogramar prazo interno', onSelecionar: () => setReprogramar(i) })
      lista.push({ rotulo: 'Anexar recibo', onSelecionar: () => setRecibo(i) })
      if (i.falta) lista.push({ rotulo: `Cobrar: ${i.falta}`, onSelecionar: () => fluxos.cobrar({ cliente: i.cliente, setor: i.setor, texto: '', assunto: i.falta, tarefa: i.id }) })
      if (i.eventual) lista.push({ rotulo: 'Sem imposto no mês (encerra sem acusar falta)', onSelecionar: () => dispensar(i) })
      lista.push({ rotulo: 'Ver multa estimada', onSelecionar: () => setMulta(i) })
      if (escolheTodos) lista.push({ rotulo: 'Cancelar obrigação…', perigo: true, separar: true, onSelecionar: () => void cancelar(i) })
    } else if (i.status === 'entregue' && !i.recibo) lista.push({ rotulo: 'Anexar recibo', onSelecionar: () => setRecibo(i) })
    return lista
  }
  const dispensar = (i: ItemObrigacao) => {
    const antes = repos.tarefas.obter(i.id)!
    try {
      repos.tarefas.atualizar(i.id, { extras: { ...antes.extras, dispensada: true, dispensada_motivo: 'sem imposto a recolher no mês (D-23)' } }, { ferramenta: 'obrigacao.marcar_eventual', texto: `${usuario.nome} encerrou ${i.nome} ${i.competencia} sem imposto no mês (sem arquivo não é falta, D-23)` })
      repos.tarefas.mudarStatus(i.id, 'concluida', { ferramenta: 'obrigacao.marcar_eventual' })
      loja.toastDesfazer(`${i.nome}: encerrada sem imposto, sem acusar falta.`, () => repos.tarefas.reverter(antes))
    } catch (e) {
      loja.toastErro(e instanceof Error ? e.message : String(e))
    }
  }
  const cancelar = async (i: ItemObrigacao) => {
    const motivo = await confirmar({ titulo: `Cancelar ${i.nome} ${i.competencia}?`, descricao: `${i.cliente}. A obrigação sai do calendário e fica no histórico com o motivo; não se apaga.`, acao: 'Cancelar obrigação', perigo: true, exigirMotivo: true, rotuloMotivo: 'Motivo (vai para o histórico)' })
    if (typeof motivo !== 'string') return
    try {
      const antes = repos.tarefas.obter(i.id)!
      repos.tarefas.cancelar(i.id, motivo)
      loja.toast(`${i.nome} cancelada: ${motivo}`)
      void antes
    } catch (e) {
      loja.toastErro(e instanceof Error ? e.message : String(e))
    }
  }
  const gavetas = (
    <>
      {reprogramar && <GavetaReprogramar item={reprogramar} onFechar={() => setReprogramar(null)} />}
      {recibo && <GavetaRecibo item={recibo} onFechar={() => setRecibo(null)} />}
      {multa && <GavetaMulta item={multa} onFechar={() => setMulta(null)} />}
    </>
  )
  return { acoes, gavetas }
}

/** S02-A42: reprogramar o prazo interno, com motivo; além do legal pede confirmação com a multa. */
function GavetaReprogramar({ item, onFechar }: { item: ItemObrigacao; onFechar: () => void }) {
  const loja = useLoja()
  const confirmar = useConfirmar()
  const { usuario } = useSessao()
  const f = useFormulario({ data: item.interno ?? HOJE_DEMO, motivo: '' }, (v) => ({ data: /^\d{4}-\d{2}-\d{2}$/.test(v.data) ? null : 'Escolha a data.', motivo: v.motivo.trim().length >= 4 ? null : 'Diga o motivo (vai para o histórico).' }))
  const alemDoLegal = !!item.legal && f.valores.data > item.legal
  return (
    <FormularioModal
      aberto
      onFechar={onFechar}
      titulo={`Reprogramar · ${item.nome} ${item.competencia}`}
      descricao={`${item.cliente}. Prazo legal ${ddmm(item.legal)}; o interno é do escritório.`}
      formulario={f}
      acao="Reprogramar"
      onSalvar={async (v) => {
        if (alemDoLegal) {
          const ok = await confirmar({ titulo: 'Depois do prazo legal?', descricao: `O interno ficaria em ${ddmm(v.data)}, depois do legal (${ddmm(item.legal)}). Se entregar nessa data, a multa estimada é de ${moeda(item.multa ?? 200)}.`, acao: 'Reprogramar assim mesmo', perigo: true })
          if (!ok) throw new Error('Reprogramação cancelada: o prazo continua o mesmo.')
        }
        const antes = repos.tarefas.obter(item.id)!
        repos.tarefas.atualizar(item.id, { prazo_interno: v.data, extras: { ...antes.extras, reprogramada: { de: antes.prazo_interno, motivo: v.motivo, por: usuario.nome } } }, { ferramenta: 'obrigacao.reprogramar_interno', texto: `${usuario.nome} reprogramou o prazo interno de ${item.nome} ${item.competencia} (${item.cliente}) de ${ddmm(antes.prazo_interno)} para ${ddmm(v.data)}: ${v.motivo}` })
        loja.toastDesfazer(`Prazo interno de ${item.nome} agora em ${ddmm(v.data)}.`, () => repos.tarefas.reverter(antes))
      }}
    >
      <Campo rotulo="Novo prazo interno" erro={f.erro('data')}>
        {(id) => <CampoTexto id={id} tipo="date" valor={f.valores.data} onMudar={(x) => f.definir('data', x)} />}
      </Campo>
      {alemDoLegal && <p className="bg-warning/10 rounded-[12px] px-3 py-2 text-sm">Depois do prazo legal: ao salvar, pedimos confirmação com a multa estimada.</p>}
      <Campo rotulo="Motivo" erro={f.erro('motivo')}>
        {(id) => <CampoArea id={id} linhas={2} valor={f.valores.motivo} onMudar={(x) => f.definir('motivo', x)} placeholder="Ex.: cliente mandou o extrato só dia 20" />}
      </Campo>
    </FormularioModal>
  )
}

/** S02-A45: anexar o recibo; a obrigação vira entregue, com hash. */
function GavetaRecibo({ item, onFechar }: { item: ItemObrigacao; onFechar: () => void }) {
  const loja = useLoja()
  const { usuario } = useSessao()
  const f = useFormulario({ arquivo: `Recibo ${item.nome} ${item.competencia.replace('/', '-')}.pdf`, numero: '' }, (v) => ({ arquivo: v.arquivo.trim() ? null : 'Escolha o arquivo do recibo.', numero: v.numero.trim().length >= 6 ? null : 'Informe o número do recibo (ao menos 6 caracteres).' }))
  return (
    <FormularioModal
      aberto
      onFechar={onFechar}
      titulo={`Anexar recibo · ${item.nome}`}
      descricao={`${item.cliente} · competência ${item.competencia}. O recibo vai para a pasta do cliente com o hash; a obrigação passa a entregue.`}
      formulario={f}
      acao="Anexar"
      onSalvar={(v) => {
        const hash = hashCurto(`${item.id}${v.numero}`)
        const antes = repos.tarefas.obter(item.id)!
        repos.tarefas.atualizar(item.id, { extras: { ...antes.extras, recibo: hash, recibo_numero: v.numero, recibo_arquivo: v.arquivo, risco: undefined } }, { ferramenta: 'obrigacao.anexar_recibo', texto: `${usuario.nome} anexou o recibo ${v.numero} de ${item.nome} ${item.competencia} (${item.cliente}) · hash ${hash}` })
        if (antes.status !== 'concluida') repos.tarefas.mudarStatus(item.id, 'concluida', { ferramenta: 'obrigacao.anexar_recibo' })
        loja.adicionarDocumento({ nome: v.arquivo, clienteId: item.clienteId, pasta: [rotuloSetorCurto[item.setor] ?? 'Fiscal', item.competencia.slice(3), 'Recibos'], tipo: 'recibo', origem: 'upload_equipe', conector: 'a1', tamanho: '84 KB', quando: 'agora', por: usuario.nome, competencia: item.competencia })
        loja.toastDesfazer(`${item.nome}: entregue, recibo guardado (hash ${hash}).`, () => repos.tarefas.reverter(antes))
      }}
    >
      <Campo rotulo="Arquivo" erro={f.erro('arquivo')} ajuda="Na demonstração, o arquivo é simulado: nada sai do navegador.">
        {(id) => <CampoTexto id={id} valor={f.valores.arquivo} onMudar={(x) => f.definir('arquivo', x)} />}
      </Campo>
      <Campo rotulo="Número do recibo" erro={f.erro('numero')}>
        {(id) => <CampoTexto id={id} mono valor={f.valores.numero} onMudar={(x) => f.definir('numero', x)} placeholder="Ex.: 51.84.27.19.02-33" />}
      </Campo>
    </FormularioModal>
  )
}

const moeda = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

/** S02-A46: multa estimada com a origem dos números (motor de cálculo M3, simulado). */
function GavetaMulta({ item, onFechar }: { item: ItemObrigacao; onFechar: () => void }) {
  const dias = item.legal ? Math.max(0, diasEntre(item.legal, HOJE_DEMO)) : 0
  const minima = item.multa ?? 200
  const meses = Math.max(1, Math.ceil(dias / 30))
  const juros = Math.round(minima * 0.0105 * meses * 100) / 100
  return (
    <GavetaFormulario aberta onFechar={onFechar} titulo={`Multa estimada · ${item.nome}`} descricao={`${item.cliente} · competência ${item.competencia}. Estimativa do motor de cálculo; confira a regra antes de falar com o cliente.`} acao="Fechar" onAcao={onFechar}>
      <div className="flex items-center gap-2">
        <span className="font-heading text-3xl font-light tabular-nums">{moeda(minima + (dias > 0 ? juros : 0))}</span>
        <SeloDemonstracao fonte="motor de cálculo M3 e índices BCB (API-16)" />
      </div>
      <Tabela colunas={[{ rotulo: 'Parcela' }, { rotulo: 'Origem' }, { rotulo: 'Valor', direita: true }]} minimo={320}>
        <tr>
          <td className="py-1.5 pr-2">Multa por atraso</td>
          <td className="text-muted-foreground py-1.5 pr-2 text-xs">regra da obrigação no catálogo (versão 11/2026)</td>
          <td className="py-1.5 text-right tabular-nums">{moeda(minima)}</td>
        </tr>
        <tr>
          <td className="py-1.5 pr-2">Juros de mora</td>
          <td className="text-muted-foreground py-1.5 pr-2 text-xs">Selic acumulada · {meses} {meses === 1 ? 'mês' : 'meses'} (índice simulado)</td>
          <td className="py-1.5 text-right tabular-nums">{dias > 0 ? moeda(juros) : '·'}</td>
        </tr>
      </Tabela>
      <p className="text-muted-foreground text-xs">{dias > 0 ? `Atrasada há ${dias} ${dias === 1 ? 'dia' : 'dias'} (prazo legal ${ddmm(item.legal)}).` : `Ainda no prazo (legal ${ddmm(item.legal)}): o valor é o que incide se passar.`} A redução por pagamento espontâneo entra no FIS-040.</p>
    </GavetaFormulario>
  )
}

/* ---------- Gerar calendário (S02-A41) ---------- */

function useGerarCalendario() {
  const loja = useLoja()
  const trabalhar = useAgenteS02()
  const clientes = useTabela('cliente')
  const versoes = useTabela('versao_perfil')
  const regras = useTabela('obrigacao')
  const tarefas = useTabela('tarefa')
  return (competencia: string, clienteId?: string) => {
    const perfis = perfisDaFoto({ cliente: clientes, versao_perfil: versoes }).filter((p) => !clienteId || p.clienteId === clienteId)
    const plano = planejarCalendario(competencia, perfis, regras, tarefas)
    const alvo = clienteId ? (clientes.find((c) => c.id === clienteId)?.nome ?? '') : `${perfis.length} clientes`
    if (!plano.length) {
      loja.toast(`Nada a gerar: o calendário de ${competencia} de ${alvo} já está completo.`)
      return
    }
    const porSetor = setoresComObrigacao.map((s) => [s, plano.filter((p) => p.regra.gera_tarefa_para_setor === s).length] as const).filter(([, n]) => n)
    trabalhar({
      setor: 'fiscal',
      titulo: `Gerar o calendário de ${competencia}`,
      cliente: clienteId ? alvo : undefined,
      clienteId,
      atividade: 'FIS-001',
      inicio: `Gerando o calendário de ${competencia} de ${alvo}: cruzo o perfil vigente com as regras e crio uma tarefa por obrigação, no setor dono.`,
      etapas: ['Lendo o perfil vigente de cada cliente', 'Cruzando com as regras de obrigação (federais, estaduais, municipais)', 'Calculando prazo legal e prazo interno (D-2 úteis)', `Criando ${plano.length} tarefas nos setores donos`],
      seg: 1,
      texto: `Calendário de ${competencia} gerado para ${alvo}: ${plano.length} obrigações (${porSetor.map(([s, n]) => `${rotuloSetorCurto[s]} ${n}`).join(', ')}). Rodar de novo não duplica nada.`,
      aviso: `Calendário de ${competencia} gerado`,
      aoTerminar: () => {
        plano.forEach((p) =>
          repos.tarefas.criar(
            {
              cliente_id: p.clienteId,
              setor_id: p.regra.gera_tarefa_para_setor,
              atividade_id: p.regra.atividade_id,
              titulo: `${p.regra.nome} ${p.competencia}`,
              competencia: p.competencia,
              origem: 'obrigacao',
              origem_ref: p.regra.id,
              quem_conclui: 'agente_prepara_pessoa_conclui',
              status: 'a_fazer',
              status_desde: new Date().toISOString(),
              prazo_legal: p.legal,
              prazo_interno: p.interno,
              prioridade: 'normal',
              checklist: [],
              risco: false,
              extras: { obrigacao_nome: p.regra.nome, gerada_por: 'FIS-001', ...(p.eventual ? { eventual: true } : {}) },
            } satisfies Omit<Tarefa, 'id' | 'escritorio_id' | 'criado_em' | 'atualizado_em'>,
            { ferramenta: 'obrigacao.gerar_calendario', texto: `Fiscal gerou ${p.regra.nome} ${p.competencia}` },
          ),
        )
      },
    })
  }
}

function BotaoGerar({ clienteId }: { clienteId?: string }) {
  const { escolheTodos } = useQuemOlha()
  const gerar = useGerarCalendario()
  const [competencia] = usePersistente(CHAVE_COMPETENCIA, '10/2026')
  if (!escolheTodos) return null
  const proxima = competenciaSeguinte(competencia)
  return (
    <Tooltip conteudo={`Cria as tarefas de ${proxima} por cliente e setor dono; rodar duas vezes não duplica. O Fiscal também roda sozinho no último dia útil, às 18h.`}>
      <Button size="sm" variant="ghost" className="h-6 rounded-full px-2 text-xs" onClick={() => gerar(proxima, clienteId)}>
        <CalendarPlusIcon className="size-3.5" /> Gerar {proxima}
      </Button>
    </Tooltip>
  )
}

/* ---------- Widgets ---------- */

/** D-20: vencido · 7 dias · 30 dias, e as três mais urgentes. Clicar filtra a aba. */
function Faixas({ clienteId, tamanho }: { clienteId?: string; tamanho: TamanhoWidget }) {
  const { doEscopo } = useOcorrencias(clienteId, { todasCompetencias: true, semFaixa: true })
  const [faixa, setFaixa] = usePersistente<Faixa>(CHAVE_FAIXA, null)
  const fluxos = useFluxos()
  const conta = (f: Exclude<Faixa, null>) => doEscopo.filter((i) => naFaixa(i, f)).length
  const urgentes = doEscopo.filter(aberta).sort((a, b) => (a.legal ?? '9').localeCompare(b.legal ?? '9')).slice(0, 3)
  return (
    <div className="flex h-full flex-col gap-2 sm:flex-row sm:items-center">
      <div className="flex gap-2">
        {(
          [
            ['vencido', 'vencidas', 'text-destructive'],
            ['7', 'em 7 dias', 'text-warning'],
            ['30', 'em 30 dias', ''],
          ] as const
        ).map(([f, rotulo, cor]) => (
          <button key={f} type="button" aria-pressed={faixa === f} onClick={() => setFaixa(faixa === f ? null : f)} className={cn('flex min-w-20 cursor-pointer flex-col rounded-[14px] px-3 py-1.5 text-left transition-colors', faixa === f ? 'bg-raised shadow-cartao' : 'bg-sunken hover:bg-raised')}>
            <span className={cn('font-heading text-2xl font-light tabular-nums', cor)}>{conta(f)}</span>
            <span className="text-muted-foreground text-[11px]">{rotulo}</span>
          </button>
        ))}
      </div>
      {tamanho !== 'M' && (
        <ul className="flex min-w-0 flex-1 flex-col gap-1">
          {urgentes.map((i) => (
            <li key={i.id}>
              <button type="button" onClick={() => fluxos.abrirTarefa(i.id)} className="hover:bg-sunken flex w-full cursor-pointer items-center gap-2 rounded-lg px-1 text-left text-sm">
                <span className="min-w-0 flex-1 truncate">
                  {i.nome} <span className="text-muted-foreground">· {clienteId ? `legal ${ddmm(i.legal)}` : i.cliente}</span>
                </span>
                <SeloStatusObrigacao status={i.status} />
              </button>
            </li>
          ))}
          {faixa && (
            <li>
              <button type="button" className="text-muted-foreground hover:text-foreground flex cursor-pointer items-center gap-1 text-xs" onClick={() => setFaixa(null)}>
                <XIcon className="size-3" /> tirar o filtro da faixa
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  )
}

const faixas: DefWidget = {
  id: 'faixas',
  titulo: 'Prazos',
  descricao: 'Vencidas, em 7 dias, em 30 dias e as três mais urgentes; clicar filtra',
  atividades: 'D-20',
  icone: SirenIcon,
  tamanhos: ['M', 'L'],
  conteudo: (t) => <FaixaDaAba tamanho={t} />,
}
function FaixaDaAba({ tamanho }: { tamanho: TamanhoWidget }) {
  return <Faixas clienteId={useClienteDaAba()} tamanho={tamanho} />
}

/** Cliente da aba (os widgets recebem o nome pelo contexto da aba). */
function useClienteDaAba(): string | undefined {
  const ctx = useContext(AbaCtx)
  const clientes = useTabela('cliente')
  return ctx.cliente ? clientes.find((c) => c.nome === ctx.cliente)?.id : undefined
}

/** Integrante do setor do item (C2: o do setor dono). */
function OrbDoSetor({ setor }: { setor: SetorIntegrante }) {
  const aparencia = useAparencia()
  const t = aparencia({ setor })
  return (
    <Tooltip conteudo={`${t.nome} · ${rotuloSetorCurto[setor]}`}>
      <span className="flex shrink-0 items-center gap-1.5">
        <Orb cor={t.cor} corOlhos={t.corOlhos} estado="disponivel" tamanho={16} animado={false} cutucavel={false} />
        <span className="text-muted-foreground text-xs">{rotuloSetorCurto[setor]}</span>
      </span>
    </Tooltip>
  )
}

function Calendario({ tamanho }: { tamanho: TamanhoWidget }) {
  const clienteId = useClienteDaAba()
  const { itens, competencia, faixa } = useOcorrencias(clienteId)
  const { acoes, gavetas } = useAcoesOcorrencia()
  const fluxos = useFluxos()
  const { escolheTodos } = useQuemOlha()
  const gerar = useGerarCalendario()
  if (!itens.length)
    return (
      <>
        <EstadoVazio
          compacto
          icone={CalendarCheckIcon}
          titulo={faixa ? 'Nada nesta faixa' : `Sem obrigações em ${competencia}`}
          descricao={faixa ? 'Tire o filtro da faixa para ver o resto.' : escolheTodos ? `Gere o calendário de ${competencia} para este cliente.` : 'O Gestor gera o calendário do mês; o Fiscal também gera sozinho no último dia útil.'}
          acao={!faixa && escolheTodos ? <Button size="sm" variant="outline" className="rounded-full" onClick={() => gerar(competencia, clienteId)}>Gerar {competencia}</Button> : undefined}
        />
        {gavetas}
      </>
    )
  const todasEntregues = itens.every((i) => !aberta(i))
  if (tamanho === 'G')
    return (
      <div className="flex flex-col gap-1.5">
        {gavetas}
        <ul className="divide-border/70 flex flex-col divide-y">
          {itens.filter(aberta).map((o) => (
            <li key={o.id} className="flex items-center gap-2 py-1.5">
              <button type="button" className="min-w-0 flex-1 cursor-pointer text-left" onClick={() => fluxos.abrirTarefa(o.id)}>
                <span className="block truncate text-sm">
                  {o.nome} {o.regerada && <Badge variant="outline">regerada</Badge>}
                </span>
                <span className="text-muted-foreground block truncate text-xs">
                  {rotuloSetorCurto[o.setor]} · legal {ddmm(o.legal)} · interno {ddmm(o.interno)}
                </span>
              </button>
              <SeloStatusObrigacao status={o.status} />
              <BotaoAcoes acoes={acoes(o)} rotulo={`Ações de ${o.nome}`} />
            </li>
          ))}
        </ul>
        <p className="text-muted-foreground text-xs">{todasEntregues ? 'Tudo entregue nesta competência.' : `${itens.filter((o) => o.status === 'entregue').length} já entregues, com recibo`}</p>
      </div>
    )
  return (
    <>
      {gavetas}
      <Tabela colunas={[{ rotulo: 'Obrigação' }, { rotulo: 'Setor dono' }, { rotulo: 'Legal' }, { rotulo: 'Interno' }, { rotulo: 'Status' }, { rotulo: 'Recibo' }, { rotulo: '' }]} minimo={680}>
        {itens.map((o) => (
          <tr key={o.id}>
            <td className="py-1.5 pr-2">
              <button type="button" className="cursor-pointer text-left hover:underline" onClick={() => fluxos.abrirTarefa(o.id)}>
                {o.nome} <span className="text-muted-foreground">{o.competencia}</span>
              </button>
              {o.regerada && (
                <Tooltip conteudo="Regerada por mudança de perfil: as futuras não iniciadas foram refeitas (03, 6.2)">
                  <span className="ml-1.5">
                    <Badge variant="outline">regerada</Badge>
                  </span>
                </Tooltip>
              )}
              {o.eventual && <span className="text-muted-foreground ml-1.5 text-[11px]">eventual</span>}
              {o.falta && <span className="text-warning block text-[11px]">falta {o.falta}</span>}
              {o.feitoPor && <FeitoPor refId={o.id} quem={o.feitoPor} className="block" />}
            </td>
            <td className="py-1.5 pr-2">
              <OrbDoSetor setor={o.setor} />
            </td>
            <td className="py-1.5 pr-2 tabular-nums">{ddmm(o.legal)}</td>
            <td className="py-1.5 pr-2 tabular-nums">{ddmm(o.interno)}</td>
            <td className="py-1.5 pr-2">
              <SeloStatusObrigacao status={o.status} />
            </td>
            <td className="py-1.5 pr-2">{o.recibo ? <code className="text-muted-foreground text-[11px]">{o.recibo}</code> : <span className="text-muted-foreground">·</span>}</td>
            <td className="py-1.5 text-right">
              <BotaoAcoes acoes={acoes(o)} rotulo={`Ações de ${o.nome}`} />
            </td>
          </tr>
        ))}
      </Tabela>
    </>
  )
}

const calendario: DefWidget = {
  id: 'calendario',
  titulo: 'Calendário do cliente',
  atividades: 'FIS-001, 003',
  descricao: 'Prazo legal, interno, status, recibo e setor dono de cada obrigação',
  icone: CalendarCheckIcon,
  tamanhos: ['G', 'XL'],
  acao: <BotaoGerarDaAba />,
  conteudo: (t) => <Calendario tamanho={t} />,
}
function BotaoGerarDaAba() {
  return <BotaoGerar clienteId={useClienteDaAba()} />
}

function Riscos({ tamanho }: { tamanho: TamanhoWidget }) {
  const clienteId = useClienteDaAba()
  const { itens } = useOcorrencias(clienteId, { semFaixa: true })
  const [multa, setMulta] = useState(false)
  const hoje = itens.filter((i) => i.status === 'vence hoje').length
  const atrasadas = itens.filter((i) => i.status === 'atrasada')
  const emRisco = itens.filter((i) => i.status === 'em risco').length
  const total = itens.filter((i) => i.status === 'atrasada' || i.status === 'em risco').reduce((s, i) => s + (i.multa ?? 200), 0)
  if (tamanho === 'P') return <Numero valor={atrasadas.length + emRisco} legenda="atrasadas ou em risco" alerta />
  return (
    <div className="flex h-full flex-col justify-end gap-2">
      <div className="grid grid-cols-3 gap-2">
        {[
          { r: 'vence hoje', v: hoje },
          { r: 'atrasadas', v: atrasadas.length, erro: true },
          { r: 'em risco', v: emRisco, alerta: true },
        ].map((x) => (
          <div key={x.r} className="flex flex-col">
            <span className={cn('font-heading text-2xl font-light tabular-nums', x.erro && x.v > 0 && 'text-destructive', x.alerta && x.v > 0 && 'text-warning')}>{x.v}</span>
            <span className="text-muted-foreground text-[11px]">{x.r}</span>
          </div>
        ))}
      </div>
      {tamanho === 'G' && (
        <>
          <p className="text-sm">
            Multa estimada se nada mudar: <strong className="font-medium tabular-nums">{moeda(total)}</strong>{' '}
            <button type="button" className="text-muted-foreground hover:text-foreground cursor-pointer text-xs underline-offset-2 hover:underline" onClick={() => setMulta(true)}>
              ver cálculo
            </button>
          </p>
          {multa && (
            <GavetaFormulario aberta onFechar={() => setMulta(false)} titulo="Multa estimada da competência" descricao="Soma das multas das atrasadas e em risco; a origem de cada uma está na linha (M3)." acao="Fechar" onAcao={() => setMulta(false)}>
              <Tabela colunas={[{ rotulo: 'Obrigação' }, { rotulo: 'Cliente' }, { rotulo: 'Multa', direita: true }]} minimo={360}>
                {itens
                  .filter((i) => i.status === 'atrasada' || i.status === 'em risco')
                  .map((i) => (
                    <tr key={i.id}>
                      <td className="py-1.5 pr-2">{i.nome}</td>
                      <td className="text-muted-foreground py-1.5 pr-2">{i.cliente}</td>
                      <td className="py-1.5 text-right tabular-nums">{moeda(i.multa ?? 200)}</td>
                    </tr>
                  ))}
              </Tabela>
              <SeloDemonstracao fonte="motor de cálculo M3" />
            </GavetaFormulario>
          )}
        </>
      )}
    </div>
  )
}

const riscos: DefWidget = {
  id: 'riscos',
  titulo: 'Atrasos e riscos',
  atividades: 'FIS-047',
  descricao: 'Vence hoje, atrasadas, em risco e multa estimada',
  icone: SirenIcon,
  tamanhos: ['P', 'M', 'G'],
  conteudo: (t) => <Riscos tamanho={t} />,
}

/** Pré-requisitos da semana (FIS-046): o que falta nas obrigações abertas e os acessos que elas usam. */
function Prerequisitos({ tamanho }: { tamanho: TamanhoWidget }) {
  const clienteId = useClienteDaAba()
  const { itens } = useOcorrencias(clienteId, { semFaixa: true })
  const fluxos = useFluxos()
  const semana = itens.filter((i) => aberta(i) && i.falta && i.legal && diasEntre(HOJE_DEMO, i.legal) <= 14)
  const fixos = clienteId ? [{ item: 'Certificado A1 válido', ok: true, detalhe: 'conferido hoje pelo integrante' }, { item: 'Procuração e-CAC', ok: true, detalhe: 'ativa' }] : []
  if (!semana.length && !fixos.length) return <EstadoVazio compacto titulo="Nada faltando esta semana" descricao="Certificados, procurações e documentos em dia para as obrigações abertas." />
  return (
    <ul className="flex flex-col gap-1.5">
      {semana.slice(0, tamanho === 'M' ? 2 : 6).map((p) => (
        <li key={p.id} className="flex items-center gap-2 text-sm">
          <SealQuestionIcon className="text-warning size-4 shrink-0" />
          <span className="min-w-0 flex-1 truncate">
            {p.falta} <span className="text-muted-foreground">· {p.nome}{clienteId ? '' : ` · ${p.cliente}`}</span>
          </span>
          <Tooltip conteudo="Pedir ao cliente (régua com o item certo)">
            <Button size="icon-sm" variant="outline" className="rounded-full" aria-label={`Pedir ${p.falta}`} onClick={() => fluxos.cobrar({ cliente: p.cliente, setor: p.setor, texto: '', assunto: p.falta, tarefa: p.id })}>
              <PaperPlaneTiltIcon />
            </Button>
          </Tooltip>
        </li>
      ))}
      {tamanho !== 'M' &&
        fixos.map((p) => (
          <li key={p.item} className="flex items-center gap-2 text-sm">
            <ChecksIcon className="text-success size-4 shrink-0" />
            <span className="min-w-0 flex-1 truncate">{p.item}</span>
            <span className="text-muted-foreground shrink-0 text-xs">{p.detalhe}</span>
          </li>
        ))}
    </ul>
  )
}

const prerequisitos: DefWidget = {
  id: 'prerequisitos',
  titulo: 'Pré-requisitos da semana',
  atividades: 'FIS-046',
  descricao: 'Certificado, procurações, gov.br e documentos para entregar',
  icone: ListChecksIcon,
  tamanhos: ['M', 'G'],
  conteudo: (t) => <Prerequisitos tamanho={t} />,
}

/** Comprovação (FIS-003, 023): recibos com hash; o integrante anexa o capturado. */
function Comprovacao({ tamanho }: { tamanho: TamanhoWidget }) {
  const clienteId = useClienteDaAba()
  const { itens } = useOcorrencias(clienteId, { semFaixa: true })
  const trabalhar = useAgenteS02()
  const com = itens.filter((o) => o.recibo)
  const sem = itens.filter((o) => o.status === 'entregue' && !o.recibo)
  const capturar = () =>
    trabalhar({
      setor: 'fiscal',
      titulo: 'Buscar recibos das entregas',
      atividade: 'FIS-003',
      etapas: ['Consultando os recibos no e-CAC e no PAGTOWEB', 'Conferindo o hash de cada arquivo', 'Anexando às obrigações'],
      texto: sem.length ? `Achei e anexei ${sem.length} ${sem.length === 1 ? 'recibo' : 'recibos'} que faltavam.` : 'Conferi: todas as entregas já têm recibo.',
      aoTerminar: () =>
        sem.forEach((o) => {
          const t = repos.tarefas.obter(o.id)
          if (t) repos.tarefas.atualizar(o.id, { extras: { ...t.extras, recibo: hashCurto(o.id + 'cap') } }, { ferramenta: 'obrigacao.anexar_recibo', texto: `Fiscal anexou o recibo capturado de ${o.nome} ${o.competencia}` })
        }),
    })
  if (tamanho === 'P') return <Numero valor={sem.length} legenda="entregues sem recibo" alerta={sem.length > 0} />
  return (
    <div className="flex h-full flex-col justify-end gap-2">
      <span className="text-sm">
        <strong className="font-heading text-2xl font-light tabular-nums">{com.length}</strong> <span className="text-muted-foreground">recibos guardados · {sem.length} sem recibo</span>
      </span>
      {tamanho === 'G' && (
        <ul className="flex flex-col gap-1 text-sm">
          {com.slice(0, 5).map((o) => (
            <li key={o.id} className="flex items-center gap-2">
              <ChecksIcon className="text-success size-4" />
              <span className="flex-1 truncate">{o.nome}</span>
              <code className="text-muted-foreground text-[11px]">{o.recibo}</code>
            </li>
          ))}
        </ul>
      )}
      <Button size="sm" variant="ghost" className="w-fit rounded-full" onClick={capturar}>
        <ArrowsClockwiseIcon /> Buscar recibos capturados
      </Button>
    </div>
  )
}

const comprovacao: DefWidget = {
  id: 'comprovacao',
  titulo: 'Comprovação',
  atividades: 'FIS-003, 023',
  descricao: 'Recibo com hash por obrigação; as que ainda não têm',
  icone: ReceiptIcon,
  tamanhos: ['P', 'M', 'G'],
  conteudo: (t) => <Comprovacao tamanho={t} />,
}

/* ---------- Regras por UF e prorrogações (FIS-002, 024; S02-A47, A48) ---------- */

interface Prorrogacao {
  id: string
  regra_id: string
  regra: string
  competencia: string
  para: string
  fonte: string
  detectada_em: string
  situacao: 'detectada' | 'confirmada' | 'sem_mudanca'
  confirmada_por?: string
}
const prorrogacoesSemente = (): Prorrogacao[] => [
  { id: 'pr-gia', regra_id: 'ob-gia-sp', regra: 'GIA-SP', competencia: '10/2026', para: '', fonte: 'portal da SEFAZ-SP', detectada_em: 'hoje', situacao: 'sem_mudanca' },
  { id: 'pr-destda', regra_id: 'ob-destda', regra: 'DeSTDA', competencia: '10/2026', para: '2026-11-30', fonte: 'Ajuste SINIEF publicado no DOU', detectada_em: '05/11', situacao: 'detectada' },
]
const colProrrogacoes = colecao<Prorrogacao>('prorrogacoes', prorrogacoesSemente)

function Prorrogacoes({ tamanho }: { tamanho: TamanhoWidget }) {
  const clienteId = useClienteDaAba()
  const lista = useColecao<Prorrogacao>('prorrogacoes', prorrogacoesSemente)
  const { escolheTodos } = useQuemOlha()
  const { usuario } = useSessao()
  const loja = useLoja()
  const [regrasUf, setRegrasUf] = useState(false)
  const confirmarProrrogacao = (p: Prorrogacao) => {
    const afetadas = repos.tarefas.listar((t) => t.origem === 'obrigacao' && t.origem_ref === p.regra_id && t.competencia === p.competencia && t.status !== 'concluida' && t.status !== 'cancelada')
    afetadas.forEach((t) => repos.tarefas.atualizar(t.id, { prazo_legal: p.para, extras: { ...t.extras, prorrogada: { de: t.prazo_legal, fonte: p.fonte } } }, { ferramenta: 'obrigacao.prorrogar', texto: `${usuario.nome} confirmou a prorrogação de ${p.regra} ${p.competencia}: prazo legal de ${ddmm(t.prazo_legal)} para ${ddmm(p.para)} (${p.fonte})` }))
    colProrrogacoes.atualizar(p.id, { situacao: 'confirmada', confirmada_por: usuario.nome }, { texto: `${usuario.nome} confirmou a prorrogação de ${p.regra} ${p.competencia} para ${ddmm(p.para)}` })
    loja.toast(`${p.regra}: prazo legal agora ${ddmm(p.para)} em ${afetadas.length} ${afetadas.length === 1 ? 'obrigação' : 'obrigações'}. As já entregues ficam como estavam.`)
  }
  const visiveis = tamanho === 'M' ? lista.filter((p) => p.situacao === 'detectada').slice(0, 1) : lista
  return (
    <div className="flex flex-col gap-2">
      <ul className="divide-border/70 flex flex-col divide-y">
        {visiveis.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center gap-2 py-2 first:pt-0 last:pb-0">
            <span className="min-w-0 flex-1">
              <span className="block text-sm">
                <strong className="font-medium">{p.regra}</strong> · {p.situacao === 'sem_mudanca' ? 'sem mudança neste mês' : `prazo de ${p.competencia} prorrogado para ${ddmm(p.para)}`}
              </span>
              <span className="text-muted-foreground block text-xs">
                {p.situacao === 'confirmada' ? `confirmada por ${p.confirmada_por}` : `detectada ${p.detectada_em} pelo Fiscal`} · {p.fonte}
              </span>
            </span>
            {p.situacao === 'detectada' && escolheTodos && (
              <Button size="sm" variant="outline" className="rounded-full" onClick={() => confirmarProrrogacao(p)}>
                Confirmar
              </Button>
            )}
          </li>
        ))}
      </ul>
      {clienteId && tamanho !== 'M' && (
        <Button size="sm" variant="ghost" className="w-fit rounded-full" onClick={() => setRegrasUf(true)}>
          <MapTrifoldIcon /> Declarações estaduais do cliente
        </Button>
      )}
      {regrasUf && clienteId && <GavetaRegrasUf clienteId={clienteId} onFechar={() => setRegrasUf(false)} />}
    </div>
  )
}

/** S02-A48: o que o cliente entrega por UF; mudar versiona o perfil e regera as futuras. */
function GavetaRegrasUf({ clienteId, onFechar }: { clienteId: string; onFechar: () => void }) {
  const loja = useLoja()
  const { usuario, permissoes } = useSessao()
  const versoes = useTabela('versao_perfil')
  const regras = useTabela('obrigacao')
  const vigente = versoes.filter((v) => v.cliente_id === clienteId && !v.vigente_ate).at(-1)
  const estaduais = regras.filter((r) => ['ob-gia-sp', 'ob-destda'].includes(r.id))
  const [off, setOff] = useState<string[]>((vigente?.extras?.declaracoes_off as string[] | undefined) ?? [])
  const pode = usuario.papel !== 'colaborador' || permissoes.setores.includes('fiscal')
  return (
    <GavetaFormulario
      aberta
      onFechar={onFechar}
      titulo="Declarações estaduais"
      descricao={`UF ${vigente?.uf ?? 'SP'}. Mudar aqui cria uma versão nova do perfil; as obrigações futuras não iniciadas são regeradas.`}
      acao={pode ? 'Versionar o perfil' : 'Fechar'}
      onAcao={() => {
        if (!pode || !vigente) return onFechar()
        const hoje = HOJE_DEMO
        repos.versoesPerfil.atualizar(vigente.id, { vigente_ate: hoje }, { ferramenta: 'cliente.atualizar', texto: `${usuario.nome} fechou a versão do perfil vigente desde ${ddmm(vigente.vigente_de)}` })
        const { id: _id, criado_em: _c, atualizado_em: _a, escritorio_id: _e, ...resto } = vigente
        void _id
        void _c
        void _a
        void _e
        repos.versoesPerfil.criar({ ...resto, vigente_de: hoje, vigente_ate: null, motivo_versao: `Declarações estaduais: ${estaduais.map((r) => `${r.nome} ${off.includes(r.id) ? 'não entrega' : 'entrega'}`).join(', ')}`, fonte: 'manual', extras: { ...vigente.extras, declaracoes_off: off } }, { ferramenta: 'obrigacao.editar_regra_uf', texto: `${usuario.nome} versionou o perfil (declarações estaduais)` })
        const futuras = repos.tarefas.listar((t) => t.cliente_id === clienteId && t.origem === 'obrigacao' && t.status === 'a_fazer' && (t.prazo_legal ?? '') > hoje)
        futuras.forEach((t) => {
          const sai = off.includes(t.origem_ref ?? '')
          repos.tarefas.atualizar(t.id, { extras: { ...t.extras, regerada: true, ...(sai ? { dispensada: true, dispensada_motivo: 'não se aplica mais pelo perfil' } : {}) } }, { ferramenta: 'obrigacao.editar_regra_uf', texto: `Regerada por mudança de perfil: ${t.titulo}` })
          if (sai) repos.tarefas.mudarStatus(t.id, 'concluida', { ferramenta: 'obrigacao.editar_regra_uf' })
        })
        loja.toast(`Perfil versionado. ${futuras.length} ${futuras.length === 1 ? 'obrigação futura regerada' : 'obrigações futuras regeradas'} (selo “regerada”).`)
        onFechar()
      }}
    >
      {estaduais.map((r) => (
        <Interruptor key={r.id} ligado={!off.includes(r.id)} desabilitado={!pode} onMudar={(v) => setOff((xs) => (v ? xs.filter((x) => x !== r.id) : [...xs, r.id]))} rotulo={`Entrega ${r.nome}`} detalhe={`dia ${r.regra_prazo.dia} do mês seguinte · setor dono ${rotuloSetorCurto[r.gera_tarefa_para_setor as SetorIntegrante]}`} />
      ))}
      {!pode && <p className="text-muted-foreground text-xs">Só quem tem o Fiscal, o Gestor e o Administrador mudam as declarações.</p>}
    </GavetaFormulario>
  )
}

const prorrogacoes: DefWidget = {
  id: 'prorrogacoes',
  titulo: 'Regras por UF e prorrogações',
  atividades: 'FIS-002, 024',
  descricao: 'Declarações estaduais e mudanças de prazo detectadas',
  icone: MapTrifoldIcon,
  tamanhos: ['M', 'G'],
  conteudo: (t) => <Prorrogacoes tamanho={t} />,
}

/* ---------- Obrigações eventuais (D-23, C2-15, C2-16, C2-22; S02-A50) ---------- */

function Eventuais({ tamanho }: { tamanho: TamanhoWidget }) {
  const clienteId = useClienteDaAba()
  const { doEscopo, regras } = useOcorrencias(clienteId, { todasCompetencias: true, semFaixa: true })
  const { acoes, gavetas } = useAcoesOcorrencia()
  const loja = useLoja()
  const { usuario } = useSessao()
  const clientes = useTabela('cliente')
  const eventuais = doEscopo.filter((i) => i.eventual || ['C2-15', 'C2-16', 'C2-22', 'C2-20'].includes(i.atividade))
  const chamarIbge = () => {
    if (!clienteId) return
    const r = regras.find((x) => x.id === 'ob-ibge')
    if (!r) return
    const legal = new Date(Date.parse(`${HOJE_DEMO}T12:00:00Z`) + 30 * 86_400_000).toISOString().slice(0, 10)
    const nova = repos.tarefas.criar(
      { cliente_id: clienteId, setor_id: r.gera_tarefa_para_setor, atividade_id: r.atividade_id, titulo: `${r.nome} 2026`, competencia: '2026', origem: 'obrigacao', origem_ref: r.id, quem_conclui: 'pessoa', status: 'a_fazer', status_desde: new Date().toISOString(), prazo_legal: legal, prazo_interno: legal, prioridade: 'normal', checklist: [{ item: 'Receber a carta do IBGE', feito: true }, { item: 'Separar receita e pessoal ocupado do ano', feito: false }, { item: 'Responder no portal do IBGE', feito: false }], risco: false, extras: { obrigacao_nome: r.nome, eventual: true, chamada: true } },
      { ferramenta: 'obrigacao.marcar_eventual', texto: `${usuario.nome} registrou que ${clientes.find((c) => c.id === clienteId)?.nome} foi chamada pelo IBGE (C2-15)` },
    )
    loja.toastDesfazer('Pesquisa do IBGE criada, com prazo em 30 dias e checklist.', () => repos.tarefas.desfazerCriacao(nova.id))
  }
  return (
    <div className="flex flex-col gap-2">
      {gavetas}
      {eventuais.length ? (
        <ul className="divide-border/70 flex flex-col divide-y">
          {eventuais.slice(0, tamanho === 'M' ? 2 : 6).map((o) => (
            <li key={o.id} className="flex items-center gap-2 py-1.5">
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm">{o.nome}</span>
                <span className="text-muted-foreground block truncate text-xs">
                  {clienteId ? '' : `${o.cliente} · `}
                  {o.status === 'dispensada' ? 'sem imposto no mês: não é falta' : `legal ${ddmm(o.legal)}`}
                </span>
              </span>
              <SeloStatusObrigacao status={o.status} />
              <BotaoAcoes acoes={acoes(o)} rotulo={`Ações de ${o.nome}`} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground text-sm">Nenhuma guia eventual nesta competência.</p>
      )}
      {clienteId && tamanho !== 'M' && (
        <Button size="sm" variant="ghost" className="w-fit rounded-full" onClick={chamarIbge}>
          Empresa chamada pelo IBGE (PAC/PAS)
        </Button>
      )}
      {tamanho !== 'M' && <p className="text-muted-foreground text-[11px]">ICMS, ISS e PIS/COFINS só existem com imposto: sem arquivo não é falta (D-23). DMED só para CNAE de saúde (C2-16).</p>}
    </div>
  )
}

const eventuais: DefWidget = {
  id: 'eventuais',
  titulo: 'Obrigações eventuais',
  atividades: 'D-23, C2-15, C2-16, C2-22',
  descricao: 'Guias que só existem às vezes; IBGE quando chamada; DMED; taxa de licença',
  icone: SealQuestionIcon,
  tamanhos: ['M', 'G'],
  conteudo: (t) => <Eventuais tamanho={t} />,
}

/* ---------- Carteira: semana por cliente (formato Acessórias) ---------- */

const simbolo: Record<ItemObrigacao['status'], string> = { entregue: '✓', pendente: '•', 'vence hoje': '!', 'em risco': '!', atrasada: '✗', cancelada: '–', dispensada: '–' }

function baixarArquivo(nome: string, conteudo: string, tipo = 'text/csv;charset=utf-8') {
  try {
    const url = URL.createObjectURL(new Blob(['﻿' + conteudo], { type: tipo }))
    const a = document.createElement('a')
    a.href = url
    a.download = nome
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  } catch {
    /* sem download no ambiente (story): o toast avisa igual */
  }
}

function SemanaCarteira() {
  const { itens, competencia } = useOcorrencias()
  const fluxos = useFluxos()
  const loja = useLoja()
  const nomes = [...new Set(itens.map((i) => i.nome))]
  const clientes = [...new Set(itens.map((i) => i.cliente))].sort()
  const celula = (c: string, n: string) => itens.find((i) => i.cliente === c && i.nome === n)
  const exportar = (formato: 'csv' | 'pdf') => {
    const linhas = [['Cliente', ...nomes].join(';'), ...clientes.map((c) => [c, ...nomes.map((n) => celula(c, n)?.status ?? '')].join(';'))]
    if (formato === 'csv') baixarArquivo(`obrigacoes-${competencia.replace('/', '-')}.csv`, linhas.join('\n'))
    loja.registrar('Você', `Exportou a semana da carteira (${competencia}) em ${formato.toUpperCase()}`)
    loja.toast(formato === 'csv' ? `CSV da carteira (${competencia}) baixado.` : `PDF da carteira (${competencia}) gerado com o tema do escritório.`)
  }
  if (!itens.length) return <EstadoVazio compacto icone={CalendarCheckIcon} titulo="Carteira sem obrigações nesta competência" descricao="Gere o calendário do mês ou troque os setores mostrados." />
  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2 text-[11px]">
        <span className="text-muted-foreground">✓ entregue · • pendente · ! em risco ou vence hoje · ✗ atrasada · – dispensada</span>
        <span className="ml-auto flex gap-1">
          <Button size="sm" variant="ghost" className="h-6 rounded-full px-2 text-xs" onClick={() => exportar('csv')}>
            <DownloadSimpleIcon className="size-3.5" /> CSV
          </Button>
          <Button size="sm" variant="ghost" className="h-6 rounded-full px-2 text-xs" onClick={() => exportar('pdf')}>
            <DownloadSimpleIcon className="size-3.5" /> PDF
          </Button>
        </span>
      </div>
      <Tabela colunas={[{ rotulo: 'Cliente' }, ...nomes.map((n) => ({ rotulo: n, centro: true }))]} minimo={Math.max(520, 160 + nomes.length * 86)}>
        {clientes.map((c) => (
          <tr key={c}>
            <td className="py-1.5 pr-2 whitespace-nowrap">{c}</td>
            {nomes.map((n) => {
              const i = celula(c, n)
              return (
                <td key={n} className="py-1 text-center">
                  {i ? (
                    <Tooltip conteudo={`${n} · ${i.status} · legal ${ddmm(i.legal)}`}>
                      <button type="button" aria-label={`${n} de ${c}: ${i.status}`} onClick={() => fluxos.abrirTarefa(i.id)} className={cn('inline-flex size-6 cursor-pointer items-center justify-center rounded-full text-xs font-medium', i.status === 'entregue' && 'bg-success/15', i.status === 'atrasada' && 'bg-destructive/12 text-destructive', (i.status === 'em risco' || i.status === 'vence hoje') && 'bg-warning/15', ['pendente', 'cancelada', 'dispensada'].includes(i.status) && 'bg-sunken text-muted-foreground')}>
                        {simbolo[i.status]}
                      </button>
                    </Tooltip>
                  ) : (
                    <span className="text-muted-foreground">·</span>
                  )}
                </td>
              )
            })}
          </tr>
        ))}
      </Tabela>
    </div>
  )
}

/** Cobrar em lote os pré-requisitos que faltam na carteira. */
function AcoesCarteira() {
  const { itens } = useOcorrencias()
  const { escolheTodos } = useQuemOlha()
  const trabalhar = useAgenteS02()
  const faltando = itens.filter((i) => aberta(i) && i.falta)
  if (!escolheTodos || !faltando.length) return <BotaoGerar />
  return (
    <span className="flex items-center gap-1">
      <BotaoGerar />
      <Button
        size="sm"
        variant="ghost"
        className="h-6 rounded-full px-2 text-xs"
        onClick={() =>
          trabalhar({
            setor: 'gestao_atendimento',
            titulo: `Cobrar ${faltando.length} pré-requisitos da carteira`,
            atividade: 'FIS-046',
            etapas: ['Separando o que falta por cliente', 'Escolhendo o contato de cada assunto', 'Montando a mensagem da régua'],
            texto: `Preparei ${faltando.length} cobranças, uma por cliente, com o item certo. Aprove para eu enviar.`,
            cartao: { acao: { tipo: 'obrigacoes.cobrar_lote', itens: faltando.map((i) => ({ id: i.id, cliente: i.cliente, setor: i.setor, falta: i.falta })) }, resumo: `Cobrar ${faltando.length} pré-requisitos`, argumentos: [['Clientes', String(new Set(faltando.map((i) => i.cliente)).size)]] },
          })
        }
      >
        <PaperPlaneTiltIcon className="size-3.5" /> Cobrar em lote
      </Button>
    </span>
  )
}

const semanaCarteira: DefWidget = {
  id: 'carteira-semana',
  titulo: 'Semana da carteira',
  atividades: 'FIS-001, 047',
  descricao: 'Obrigação × cliente (formato Acessórias), com o mesmo filtro de setores',
  icone: CalendarCheckIcon,
  tamanhos: ['XL'],
  acao: <AcoesCarteira />,
  conteudo: () => <SemanaCarteira />,
}

/* ---------- Executores dos cartões desta aba ---------- */

registrarExecutor('obrigacoes.cobrar_lote', (acao, { loja, quem }) => {
  const itens = acao.itens as { id: string; cliente: string; setor: SetorIntegrante; falta: string }[]
  itens.forEach((i) => {
    const t = repos.tarefas.obter(i.id)
    if (t && t.status !== 'aguardando_cliente' && t.status !== 'concluida' && t.status !== 'cancelada') repos.tarefas.mudarStatus(i.id, 'aguardando_cliente')
  })
  loja.registrar(quem, `Aprovou a cobrança em lote de ${itens.length} pré-requisitos`)
  loja.toast(`${itens.length} cobranças enviadas pela régua, cada uma ao contato do assunto.`, { modulo: 'crm', aba: 'conversas' }, 'Ver no CRM')
})

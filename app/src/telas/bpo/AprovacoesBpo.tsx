import { ArrowsClockwiseIcon, BellRingingIcon, CheckIcon, ClockCountdownIcon, DeviceMobileIcon, HandPalmIcon, ListChecksIcon, MagicWandIcon, PlusIcon, ShieldCheckIcon, StackIcon, WarningIcon, WhatsappLogoIcon, XIcon } from '@phosphor-icons/react'
import { useMemo, useState } from 'react'
import { useLoja } from '@/ambiente/loja'
import { useSessao, useSessaoBruta } from '@/ambiente/sessao'
import { BarraLote, BotaoAcoes, CaixaSelecao, EstadoVazio, SeloDemonstracao, SePode, useAcao, useConfirmar, usePode, useSelecao } from '@/components/kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Campo, CampoEscolha, CampoTexto, GavetaFormulario, Segmentado } from '@/components/ui/formulario'
import { Tooltip } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { banco } from '@/nucleo/banco'
import type { BpoConta, BpoLote } from '@/nucleo/modelo/entidades'
import { useTabela } from '@/nucleo/react'
import { eventoBpo, repos } from '@/nucleo/repositorios'
import { irParaPagina } from '@/nucleo/rotas'
import { SeloTitular } from '../financeiro/pecas'
import { BotaoErp, brl, CabecalhoBpo, Caixa, Numero, PaginaBpo, Regra, TituloBloco, type PropsBpo } from './comum'
import { aprovadoresPara, dataCurta, dataHora, diasAte, hora, hojeBpo, quando, rotuloModoPagamento, useBpo, type EmpresaVista } from './dados'
import { useAcoesErp } from './FichaEmpresa'
import { usePedirBpo } from './integrantes'
import { acaoLigada, avancarEscalonamento, confirmarDadosBancarios, escalonamentoDo, excecoesDa, impressao, limitesDa, loteForaDoSla, modoDoLote, motivoLimiteConferir, motivoLimiteLote, motivoNaoEntraNoLote, nomesPassos, regrasSlaDe, trilhaDoLote } from './regras-s08c'
import { AreaRolagem } from '@/components/ui/area-rolagem'

const categorias = ['Matéria-prima', 'Mercadoria para revenda', 'Ocupação', 'Energia', 'Água', 'Software', 'Serviços de terceiros', 'Impostos e taxas', 'Despesas gerais']

/** Contexto da sessão para a pergunta "posso conferir?" (a mesma regra que o repositório usa ao gravar). */
function useCtxPessoa() {
  const s = useSessaoBruta()
  return s?.perfil ? { ator: { tipo: 'pessoa' as const, perfil: s.perfil }, origem: 'tela' as const } : undefined
}

type FiltroConferir = 'todas' | 'posso' | 'alerta' | 'vencendo'
type FiltroLotes = 'abertos' | 'decididos' | 'todos'

/** Por que eu não confiro esta conta: a regra do repositório (segregação) e, depois, a minha alçada de conferência (S08c). */
function useMotivoConferir() {
  const ctx = useCtxPessoa()
  const { usuario } = useSessao()
  const { config } = useBpo()
  return (c: BpoConta) => repos.bpo.contas.motivoNaoConfere(c, ctx) ?? motivoLimiteConferir(config, usuario.id, c)
}

/**
 * BPO › Aprovações (S08-T05; 10, 3.5 a 3.9): conferência interna (quem
 * digitou não confere; acima da faixa 1, analista e gestor; exceções sobem de
 * faixa), o próximo lote, o lote enviado ao cliente como cartão no app e o
 * acompanhamento com o escalonamento vivo e a trilha. Nenhum pagamento sai
 * sem a aprovação do cliente registrada.
 */
export function AprovacoesBpoTela({ empresa }: PropsBpo) {
  const { empresas, config } = useBpo()
  const lista = useMemo(() => (empresa ? [empresa] : empresas), [empresa, empresas])
  const [lancar, setLancar] = useState(false)
  const [filtro, setFiltro] = useState<FiltroConferir>('todas')
  const [filtroLotes, setFiltroLotes] = useState<FiltroLotes>('abertos')
  const motivoDe = useMotivoConferir()
  const loja = useLoja()
  const pedir = usePedirBpo()
  const { usuario } = useSessao()

  const capturadas = lista.flatMap((e) => e.contas.filter((c) => c.etapa === 'capturada').map((c) => ({ e, c, ex: excecoesDa(c, e) })))
  const filtradas = capturadas.filter(({ c, ex }) => (filtro === 'posso' ? !motivoDe(c) : filtro === 'alerta' ? ex.length > 0 || !!c.alerta : filtro === 'vencendo' ? diasAte(c.vencimento) <= 2 : true))
  const ids = useMemo(() => filtradas.map(({ c }) => c.id), [filtradas])
  const selecao = useSelecao(ids)
  const prontas = lista.filter((e) => e.contas.some((c) => c.etapa === 'conferida' || c.etapa === 'em_lote'))
  const lotes = lista.flatMap((e) => e.lotes.map((l) => ({ e, l })))
  const abertos = lotes.filter(({ l }) => l.situacao === 'aguardando' || l.situacao === 'parcial')
  // Em andamento: o que pede algo (aprovar, liberar no banco, conferir a baixa, refazer) e o que acabou de ser pago. Expirados: nunca pagaram.
  const encerrado = ({ l }: { l: BpoLote }) => l.situacao === 'expirado'
  const emAndamento = lotes.filter((x) => !encerrado(x))
  const lotesVistos = (filtroLotes === 'abertos' ? emAndamento : filtroLotes === 'decididos' ? lotes.filter(encerrado) : lotes).sort((a, b) => b.l.criado_em.localeCompare(a.l.criado_em))
  const comCliente = abertos.reduce((s, { l }) => s + l.total, 0)
  const vencendoSem = lista.flatMap((e) => e.contas.filter((c) => ['capturada', 'conferida', 'em_lote', 'aguardando_cliente'].includes(c.etapa) && diasAte(c.vencimento) <= 1))
  const conferidas = lista.flatMap((e) => e.contas.filter((c) => c.etapa === 'conferida' && !motivoNaoEntraNoLote(c, e)).map((c) => ({ e, c })))
  const sugerirLigado = acaoLigada(config, 'i-bpo', 'sugerir_lote')

  const conferirSelecionadas = (idsSel: string[]) => {
    let feitas = 0
    const recusadas: string[] = []
    for (const id of idsSel) {
      const item = capturadas.find((x) => x.c.id === id)
      if (!item) continue
      const motivo = motivoDe(item.c)
      if (motivo) {
        recusadas.push(`${item.c.contraparte}: ${motivo}`)
        continue
      }
      try {
        repos.bpo.contas.conferir(id)
        feitas++
      } catch (err) {
        recusadas.push(`${item.c.contraparte}: ${err instanceof Error ? err.message : 'não deu'}`)
      }
    }
    selecao.limpar()
    if (feitas) loja.toast(`${feitas} conta${feitas > 1 ? 's' : ''} conferida${feitas > 1 ? 's' : ''} por ${usuario.nome}`)
    if (recusadas.length) loja.toastErro(`${recusadas.length} ficou sem conferir. ${recusadas[0]}`)
  }

  const sugerirLote = () => {
    const porEmpresa = new Map<string, { e: EmpresaVista; ids: string[] }>()
    for (const { e, c } of conferidas) {
      const x = porEmpresa.get(e.clienteId) ?? { e, ids: [] }
      x.ids.push(c.id)
      porEmpresa.set(e.clienteId, x)
    }
    for (const { e, ids: contaIds } of porEmpresa.values())
      pedir({
        integrante: 'i-bpo',
        titulo: `Sugerir o próximo lote de ${e.nome}`,
        cliente: e.nome,
        inicio: `Vou juntar as ${contaIds.length} conta${contaIds.length > 1 ? 's' : ''} já conferida${contaIds.length > 1 ? 's' : ''} de ${e.nome} na janela das ${e.perfil.janela.abertura}. Não confiro, não mando e não aprovo.`,
        etapas: ['Lendo as contas conferidas', 'Checando a janela e o limite da alçada', 'Pondo no próximo lote'],
        fim: { texto: `Lote sugerido para ${e.nome}: ${contaIds.length} conta${contaIds.length > 1 ? 's' : ''}. O Gestor do BPO confere o total e manda ao cliente.`, aviso: `Contas a Pagar sugeriu o lote de ${e.nome}` },
        efeito: { tipo: 'sugerir_lote', clienteId: e.clienteId, contaIds },
      })
  }

  return (
    <PaginaBpo>
      <CabecalhoBpo
        titulo="Aprovações"
        sub={empresa ? `${empresa.nome} · ${rotuloModoPagamento[empresa.perfil.modo_pagamento]}${empresa.perfil.modo_pagamento === 'M2' && empresa.perfil.teto_m2 ? ` (teto ${brl(empresa.perfil.teto_m2)})` : ''} · faixa 1 até ${brl(empresa.faixa1)}, faixa 2 até ${brl(empresa.faixa2)}` : 'Conferência interna, próximo lote e lotes com os clientes'}
        status={`${capturadas.length} para conferir; ${abertos.length === 1 ? '1 lote' : `${abertos.length} lotes`} com ${empresa ? 'o cliente' : 'os clientes'}`}
      >
        {empresa && <SeloTitular titular={{ tipo: 'empresa', clienteId: empresa.clienteId, nome: empresa.nome }} />}
        <SePode ferramenta="bpo.conta.capturar">
          <Button size="sm" variant="outline" className="rounded-full" onClick={() => setLancar(true)}>
            <PlusIcon /> Lançar conta
          </Button>
        </SePode>
        {empresa && empresa.erp.modo !== 'E3' && <CapturarDoErp e={empresa} />}
        {conferidas.length > 0 && (
          <SePode ferramenta="pagamento_lote.montar">
            <Button size="sm" variant="ghost" className="rounded-full" disabled={!sugerirLigado} title={sugerirLigado ? undefined : 'Desligado em Configuração › Integrantes'} onClick={sugerirLote}>
              <MagicWandIcon /> Pedir ao Contas a Pagar: sugerir o lote
            </Button>
          </SePode>
        )}
      </CabecalhoBpo>

      <Regra icone={<ShieldCheckIcon weight="duotone" />}>
        <span className="text-foreground">Nenhum pagamento sai sem uma aprovação humana registrada.</span> Pagar e transferir nunca viram automáticos: o integrante prepara, a equipe confere (quem digitou não confere) e o cliente aprova no app. Vencido sem aprovação só gera alerta.
      </Regra>

      <Caixa>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Numero valor={capturadas.length} rotulo="para conferir" detalhe={`${capturadas.filter(({ c }) => !motivoDe(c)).length} você pode conferir`} />
          <Numero valor={lista.reduce((s, e) => s + e.contas.filter((c) => c.etapa === 'conferida' || c.etapa === 'em_lote').length, 0)} rotulo="conferidas, esperando lote" />
          <Numero valor={brl(comCliente)} rotulo={`com o cliente em ${abertos.length} lote${abertos.length === 1 ? '' : 's'}`} />
          <Numero valor={vencendoSem.length} rotulo="vencem até amanhã sem aprovação" detalhe={vencendoSem.length ? 'só alerta, nunca execução' : 'nada perto de vencer'} />
        </div>
      </Caixa>

      <Caixa>
        <TituloBloco
          descricao="Até a faixa 1, uma conferência; acima, analista e gestor. Exceções (fornecedor novo, dados alterados, valor fora do padrão, fracionamento) sobem de faixa. O botão fica desligado, com o motivo, para quem não pode."
          acao={
            capturadas.length > 0 && (
              <Segmentado
                rotulo="Filtrar contas para conferir"
                valor={filtro}
                onMudar={setFiltro}
                opcoes={[
                  { valor: 'todas', rotulo: `Todas (${capturadas.length})` },
                  { valor: 'posso', rotulo: 'Posso conferir' },
                  { valor: 'alerta', rotulo: 'Com alerta' },
                  { valor: 'vencendo', rotulo: 'Vencem em 2 dias' },
                ]}
              />
            )
          }
        >
          Para conferir
        </TituloBloco>
        {capturadas.length === 0 ? (
          <EstadoVazio compacto icone={ListChecksIcon} titulo="Tudo conferido" descricao="Conta nova chega pelo ERP, pelo DDA, pelo app ou lançada aqui; quem lança não confere." />
        ) : filtradas.length === 0 ? (
          <p className="text-muted-foreground py-2 text-sm">Nenhuma conta neste filtro.</p>
        ) : (
          <>
            <div className="text-muted-foreground flex items-center gap-2 text-xs">
              <CaixaSelecao marcado={selecao.todos} parcial={selecao.algum} onMudar={() => selecao.alternarTodos()} rotulo="Selecionar todas as contas para conferir" />
              Selecionar todas
            </div>
            <ul className="divide-border/70 flex flex-col divide-y" aria-label="Contas para conferir">
              {filtradas.map(({ e, c }) => (
                <LinhaConferir key={c.id} e={e} c={c} mostrarEmpresa={!empresa} marcado={selecao.marcado(c.id)} onMarcar={(intervalo) => selecao.alternar(c.id, intervalo)} />
              ))}
            </ul>
            <BarraLote selecao={selecao} nome={['conta', 'contas']} acoes={[{ rotulo: 'Conferir selecionadas', icone: <CheckIcon />, onExecutar: conferirSelecionadas }]} />
          </>
        )}
      </Caixa>

      <Caixa>
        <TituloBloco descricao="Conta conferida entra no lote da janela da empresa; a conferida depois da janela vai para o próximo. O Gestor monta e manda ao cliente.">Próximo lote</TituloBloco>
        {prontas.length === 0 ? <p className="text-muted-foreground py-2 text-sm">Nenhuma conta conferida esperando lote.</p> : prontas.map((e) => <ProximoLote key={e.clienteId} e={e} mostrarEmpresa={!empresa} />)}
      </Caixa>

      <section className="flex flex-col gap-3" aria-label="Lotes com o cliente">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="flex-1 text-sm font-medium">Lotes com {empresa ? 'o cliente' : 'os clientes'}</h2>
          <Segmentado
            rotulo="Filtrar lotes"
            valor={filtroLotes}
            onMudar={setFiltroLotes}
            opcoes={[
              { valor: 'abertos', rotulo: `Em andamento (${emAndamento.length})` },
              { valor: 'decididos', rotulo: `Expirados (${lotes.length - emAndamento.length})` },
              { valor: 'todos', rotulo: 'Todos' },
            ]}
          />
        </div>
        {lotesVistos.length === 0 ? (
          <Caixa>
            <EstadoVazio compacto icone={StackIcon} titulo={filtroLotes === 'abertos' ? 'Nenhum lote em andamento' : 'Nenhum lote aqui'} descricao="Quando o Gestor manda um lote, ele vira cartão no app do cliente e aparece aqui, com o escalonamento e a trilha." />
          </Caixa>
        ) : (
          <div className={lotesVistos.length >= 3 ? 'grid gap-4 lg:grid-cols-2 xl:grid-cols-3' : lotesVistos.length === 2 ? 'grid gap-4 lg:grid-cols-2' : 'grid gap-4'}>
            {lotesVistos.map(({ e, l }) => (
              <CartaoLote key={l.id} l={l} e={e} mostrarEmpresa={!empresa} />
            ))}
          </div>
        )}
      </section>
      <LancarConta aberta={lancar} onFechar={() => setLancar(false)} empresas={lista} />
    </PaginaBpo>
  )
}

/** Capturar do ERP: o integrante Contas a Pagar lê o espelho e deixa as contas novas em "para conferir". */
function CapturarDoErp({ e }: { e: EmpresaVista }) {
  const acoes = useAcoesErp(e)
  const { config } = useBpo()
  const ligado = acaoLigada(config, 'i-bpo', 'capturar_erp')
  const motivo = !ligado ? 'O Administrador desligou a captura sozinha do Contas a Pagar (Configuração › Integrantes)' : e.erp.efetiva === 'credencial_vencida' ? `Credencial do ${e.erp.provedor} vencida` : undefined
  return (
    <SePode ferramenta="erp.sincronizar">
      <span className="inline-flex items-center gap-2">
      <Button size="sm" variant="ghost" className="rounded-full" disabled={!!acoes.estado.carregando || !!motivo} title={motivo} onClick={() => void acoes.sincronizar()}>
        <ArrowsClockwiseIcon /> {acoes.estado.carregando ? 'Lendo o ERP…' : acoes.estado.erro ? 'ERP não respondeu: tentar de novo' : `Capturar do ${e.erp.provedor}`}
      </Button>
      {acoes.estado.demo && <SeloDemonstracao fonte={acoes.estado.demo} />}
      </span>
    </SePode>
  )
}

function LinhaConferir({ e, c, mostrarEmpresa, marcado, onMarcar }: { e: EmpresaVista; c: BpoConta; mostrarEmpresa: boolean; marcado: boolean; onMarcar: (intervalo: boolean) => void }) {
  const executar = useAcao()
  const confirmar = useConfirmar()
  const motivoDe = useMotivoConferir()
  const { usuario } = useSessao()
  const motivo = motivoDe(c)
  const precisa = repos.bpo.contas.conferenciasNecessarias(c)
  const sozinho = e.perfil.analista_nome === e.perfil.responsavel_nome
  const podeGestor = usePode('pagamento_lote.pedir_aprovacao', { cliente_id: e.clienteId })
  const fornecedor = e.fornecedores.find((f) => f.nome === c.contraparte)
  const podeConfirmarFornecedor = usePode('fornecedor.alterar_dados_bancarios', { cliente_id: e.clienteId })
  const vencida = diasAte(c.vencimento) < 0
  const excecoes = excecoesDa(c, e)
  return (
    <li className="flex flex-wrap items-center gap-3 py-2.5 text-sm">
      <CaixaSelecao marcado={marcado} onMudar={onMarcar} rotulo={`Selecionar ${c.contraparte}`} />
      <span className="min-w-0 flex-1 basis-64">
        <span className="block truncate">
          {c.contraparte}
          {mostrarEmpresa && <span className="text-muted-foreground"> · {e.nome}</span>}
        </span>
        <span className="text-muted-foreground block truncate text-xs">
          vence {quando(c.vencimento)} · via {c.origem} · digitou {c.digitado_por_nome}
          {c.conferencias.length > 0 && ` · conferiu ${c.conferencias.map((x) => x.nome).join(' e ')}`} · {c.conferencias.length} de {precisa} conferência{precisa > 1 ? 's' : ''}
        </span>
        {motivo && <span className="text-muted-foreground block text-xs">{motivo}</span>}
        {vencida && (
          <span className="text-destructive flex items-center gap-1 text-xs">
            <WarningIcon className="size-3.5" weight="fill" /> venceu em {dataCurta(c.vencimento)} sem aprovação: alerta ao Gestor e ao sócio; nunca execução
          </span>
        )}
        {excecoes.map((x) => (
          <span key={x.tipo} className="text-warning-foreground flex items-center gap-1 text-xs">
            <WarningIcon className="text-warning size-3.5 shrink-0" weight="fill" /> sobe de faixa: {x.texto}
          </span>
        ))}
        {c.alerta && !excecoes.length && (
          <span className="text-warning-foreground flex items-center gap-1 text-xs">
            <WarningIcon className="text-warning size-3.5" weight="fill" /> {c.alerta}
          </span>
        )}
      </span>
      <span className="min-w-24 shrink-0 whitespace-nowrap text-right tabular-nums">{brl(c.valor, true)}</span>
      <Tooltip conteudo={motivo ?? 'Confere fornecedor, valor, vencimento e dados bancários contra o documento.'}>
        <span>
          <Button size="sm" className="rounded-full" disabled={!!motivo} aria-label={`Conferir ${c.contraparte}`} onClick={() => executar(() => repos.bpo.contas.conferir(c.id), { sucesso: `${c.contraparte} conferida por ${usuario.nome}` })}>
            <CheckIcon /> Conferir
          </Button>
        </span>
      </Tooltip>
      {sozinho && podeGestor && (
        <Button size="sm" variant="ghost" className="rounded-full" onClick={() => executar(() => repos.bpo.contas.clienteConfere(c.id), { sucesso: `${c.contraparte} vai ao cliente conferir na aprovação` })}>
          Cliente confere
        </Button>
      )}
      <BotaoAcoes
        rotulo={`Mais ações de ${c.contraparte}`}
        acoes={[
          ...(fornecedor && fornecedor.risco !== 'recorrente' && !fornecedor.dados_bancarios_confirmados_em
            ? [
                {
                  rotulo: 'Confirmar dados bancários por segundo canal',
                  icone: <ShieldCheckIcon />,
                  motivo: podeConfirmarFornecedor ? undefined : 'Sua conta não altera dados bancários de fornecedor.',
                  onSelecionar: () => void confirmarFornecedor(fornecedor.id, fornecedor.nome),
                },
              ]
            : []),
          {
            rotulo: 'Cancelar a conta',
            icone: <XIcon />,
            perigo: true,
            separar: true,
            onSelecionar: async () => {
              const m = await confirmar({ titulo: `Cancelar ${c.contraparte}?`, descricao: 'A conta fica no histórico como cancelada (nada se apaga).', acao: 'Cancelar a conta', perigo: true, exigirMotivo: true })
              if (typeof m === 'string') executar(() => repos.bpo.contas.cancelar(c.id, m), { sucesso: 'Conta cancelada' })
            },
          },
        ]}
      />
      <BotaoErp e={e} oque={`a conta ${c.contraparte}`} />
    </li>
  )

  async function confirmarFornecedor(id: string, nome: string) {
    const canal = await confirmar({ titulo: `Confirmar os dados bancários de ${nome}?`, descricao: 'Ligue para o telefone do cadastro (não o do boleto) ou peça a confirmação ao cliente. Diga por onde confirmou: vai para a trilha.', acao: 'Confirmar', exigirMotivo: true, rotuloMotivo: 'Canal da confirmação (ex.: ligação ao telefone do cadastro)' })
    if (typeof canal === 'string') executar(() => confirmarDadosBancarios(e, id, canal, usuario.nome), { sucesso: 'Dados bancários confirmados por segundo canal' })
  }
}

/** As contas conferidas de uma empresa: pôr no próximo lote (A23) e montar e enviar ao cliente (A24). */
function ProximoLote({ e, mostrarEmpresa }: { e: EmpresaVista; mostrarEmpresa: boolean }) {
  const executar = useAcao()
  const confirmar = useConfirmar()
  const loja = useLoja()
  const { usuario } = useSessao()
  const { config } = useBpo()
  const podeConfirmarFornecedor = usePode('fornecedor.alterar_dados_bancarios', { cliente_id: e.clienteId })
  const conferidas = e.contas.filter((c) => c.etapa === 'conferida')
  const noLote = e.contas.filter((c) => c.etapa === 'em_lote')
  const total = noLote.reduce((s, c) => s + c.valor, 0)
  const excecoes = noLote.flatMap((c) => excecoesDa(c, e).map((x) => ({ c, x })))
  const reforcada = total > e.faixa2 || excecoes.length > 0
  // Exceção abaixo da faixa 2: duas pessoas, cada uma com alçada para o total; acima, as da reforçada (10, 3.7).
  const podem = aprovadoresPara(e.ficha, total, e.faixa2)
  const faltaQuem = reforcada && podem.length < 2
  const modo = modoDoLote(e, noLote)
  const limite = motivoLimiteLote(e, total)
  const foraSla = loteForaDoSla(e, noLote)
  const teto = config?.teto_whatsapp ?? 3_000
  const enviar = async () => {
    const ok = await confirmar({
      titulo: `Mandar o lote de ${brl(total)} a ${e.nome}?`,
      descricao: `${noLote.length} conta${noLote.length > 1 ? 's' : ''} conferida${noLote.length > 1 ? 's' : ''}. ${reforcada ? `Aprovação reforçada${excecoes.length && total <= e.faixa2 ? ' por exceção' : ''} (duas pessoas: ${podem.map((p) => p.nome).join(' e ') || 'ninguém marcado na ficha'}).` : `Quem aprova: ${podem.map((p) => p.nome).join(' ou ') || 'ninguém com alçada para o total'}.`} ${modo.motivo ?? ''} ${total <= teto ? 'Pode ser aprovado pelo WhatsApp com código de uso único.' : 'Acima do teto do WhatsApp: só no app, com segundo fator.'} Vira cartão no app; se ninguém responder, o escalonamento avisa (nunca paga sozinho).`,
      acao: 'Mandar ao cliente',
    })
    if (ok !== true) return
    const amanha = new Date(Date.parse(`${hojeBpo}T12:00:00Z`) + 864e5).toISOString().slice(0, 10)
    const lote = executar(() => {
      const l = repos.bpo.lotes.montarEEnviar(e.clienteId, noLote.map((c) => c.id), { saldo: e.caixa, modo: modo.modo, expiraEm: `${amanha}T12:00:00-03:00`, podeAprovar: podem.map((p) => p.nome) })
      // Exceção sobe a faixa: o lote vai à reforçada mesmo abaixo da faixa 2 (10, 3.7).
      if (excecoes.length && l.aprovadores_necessarios < 2) return repos.bpo.lotes.atualizar(l.id, { aprovadores_necessarios: 2, extras: { ...l.extras, s08c_excecao: excecoes.map(({ c, x }) => `${c.contraparte}: ${x.texto}`) } }, { texto: `Lote “${l.titulo}” com exceção: vai à aprovação reforçada` })
      return l
    }, { sucesso: `Lote enviado: cartão no app de ${e.nome}` })
    if (lote) loja.avisar({ para: [], tipo: 'cartao', setor: 'bpo_pagar', titulo: `Lote de ${brl(total)} enviado a ${e.nome}`, detalhe: `aguardando ${podem.map((p) => p.nome).join(reforcada ? ' e ' : ' ou ')}`, destino: { modulo: 'bpo', aba: 'aprovacoes', cliente: e.clienteId } })
  }
  return (
    <div className="border-border/70 flex flex-col gap-2 border-t pt-3 first:border-t-0 first:pt-0">
      {mostrarEmpresa && <span className="text-sm font-medium">{e.nome}</span>}
      <ul className="flex flex-col gap-1" aria-label={`Contas conferidas de ${e.nome}`}>
        {[...noLote, ...conferidas].map((c) => {
          const bloqueio = c.etapa === 'conferida' ? motivoNaoEntraNoLote(c, e) : null
          const f = e.fornecedores.find((x) => x.nome === c.contraparte)
          return (
            <li key={c.id} className="flex flex-wrap items-center gap-2 text-sm">
              <span className="min-w-0 flex-1 basis-56">
                <span className="block truncate">{c.contraparte}</span>
                <span className="text-muted-foreground block truncate text-xs">
                  vence {quando(c.vencimento)} · conferiu {c.conferencias.map((x) => x.nome).join(' e ')}
                  {c.alerta && ` · ${c.alerta}`}
                </span>
                {bloqueio && <span className="text-warning-foreground block text-xs">{bloqueio}</span>}
              </span>
              <span className="min-w-24 shrink-0 whitespace-nowrap text-right tabular-nums">{brl(c.valor)}</span>
              {c.etapa === 'em_lote' ? (
                <Button size="sm" variant="ghost" className="rounded-full" onClick={() => executar(() => repos.bpo.contas.tirarDoLote(c.id))}>
                  Tirar do lote
                </Button>
              ) : bloqueio && f ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                  disabled={!podeConfirmarFornecedor}
                  title={podeConfirmarFornecedor ? undefined : 'Sua conta não altera dados bancários de fornecedor.'}
                  onClick={async () => {
                    const canal = await confirmar({ titulo: `Confirmar os dados bancários de ${f.nome}?`, descricao: 'Ligue para o telefone do cadastro (não o do boleto) ou peça a confirmação ao cliente.', acao: 'Confirmar', exigirMotivo: true, rotuloMotivo: 'Canal da confirmação' })
                    if (typeof canal === 'string') executar(() => confirmarDadosBancarios(e, f.id, canal, usuario.nome), { sucesso: 'Dados bancários confirmados' })
                  }}
                >
                  <ShieldCheckIcon /> Confirmar dados
                </Button>
              ) : (
                <Button size="sm" variant="outline" className="rounded-full" onClick={() => executar(() => repos.bpo.contas.porNoProximoLote(c.id), { sucesso: `${c.contraparte} entra no próximo lote (janela ${e.perfil.janela.abertura})` })}>
                  Pôr no próximo lote
                </Button>
              )}
            </li>
          )
        })}
      </ul>
      {noLote.length > 0 && (
        <div className="bg-sunken/50 flex flex-wrap items-center gap-2 rounded-[14px] px-3 py-2 text-sm">
          <span className="min-w-0 flex-1 basis-60">
            Lote: {noLote.length} conta{noLote.length > 1 ? 's' : ''} · <span className="tabular-nums">{brl(total)}</span>
            <span className="text-muted-foreground block text-xs">
              saldo {brl(e.caixa)} · depois {brl(e.caixa - total)} · {reforcada ? `aprovação reforçada (2 pessoas)${excecoes.length && total <= e.faixa2 ? ' por exceção' : ''}` : '1 aprovador com alçada'} · {modo.modo === 'M2' ? `M2, por API até ${brl(e.perfil.teto_m2 ?? 0)}` : 'M1, o cliente libera no banco'}
            </span>
            <span className="text-muted-foreground block text-xs">
              {total <= teto ? (
                <>
                  <WhatsappLogoIcon className="inline size-3.5" /> aprovável pelo WhatsApp com código (até {brl(teto)})
                </>
              ) : (
                `acima de ${brl(teto)}: só no app, com segundo fator`
              )}
            </span>
            {e.caixa - total < 0 && <span className="text-destructive block text-xs">O saldo não cobre o lote: o cliente vê o aviso no cartão.</span>}
            {modo.motivo && <span className="text-warning-foreground block text-xs">{modo.motivo}</span>}
            {foraSla && <span className="text-warning-foreground block text-xs">Sai com menos de {regrasSlaDe(e).lote_antes_h} h antes do vencimento: conta como desvio do SLA.</span>}
            {limite && <span className="text-destructive block text-xs">{limite}</span>}
            {faltaQuem && <span className="text-destructive block text-xs">A reforçada pede duas pessoas e a ficha tem {podem.length}: marque mais um aprovador na Configuração (vale com o aceite do sócio).</span>}
          </span>
          <SePode ferramenta="pagamento_lote.pedir_aprovacao" alvo={{ cliente_id: e.clienteId }} mostrarMotivo>
            <Button size="sm" className="rounded-full" disabled={!!limite} title={limite ?? undefined} onClick={() => void enviar()}>
              <DeviceMobileIcon /> Montar lote e enviar ao cliente
            </Button>
          </SePode>
        </div>
      )}
    </div>
  )
}

/** Passos do escalonamento do lote (10, 3.6, decisão de 8/11/2026). */
export function passosEscalonamento(e: EmpresaVista, l?: BpoLote) {
  const esc = e.perfil.escalonamento
  const [h, m] = e.perfil.janela.abertura.split(':').map(Number)
  const soma = (n: number) => (h + n >= 18 ? 'abertura do dia útil seguinte' : `${String(h + n).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
  const proximo = l ? [...l.conta_ids].map((id) => e.contas.find((c) => c.id === id)?.vencimento ?? '9999').sort()[0] : undefined
  const vespera = proximo && proximo !== '9999' ? `véspera (${dataCurta(new Date(Date.parse(`${proximo}T12:00:00Z`) - 864e5).toISOString().slice(0, 10))})` : 'véspera do vencimento'
  const aprovador = esc.aprovador || 'o aprovador da ficha'
  return [
    { quando: e.perfil.janela.abertura, texto: `abre a janela; o cartão vai a ${aprovador}` },
    { quando: `+${esc.lembrete_h} h (${soma(esc.lembrete_h)})`, texto: `lembrete a ${aprovador}` },
    { quando: `+${esc.substituto_h} h (${soma(esc.substituto_h)})`, texto: esc.substituto ? `vai ao substituto, ${esc.substituto}` : 'sem substituto cadastrado: alerta ao Gestor do BPO' },
    { quando: vespera, texto: `alerta ao Gestor do BPO e a ${esc.socio || 'o sócio'} com a lista do que vence` },
    { quando: 'vencido', texto: 'só alerta (Gestor e sócio); nunca paga sozinho; auditoria vermelha: “vencido sem aprovação”' },
  ]
}

/** Acompanhar lote (S08-A25): aprovado, editado, recusado, expirado; no M1, "Já liberei no banco" pelo cliente. */
function CartaoLote({ l, e, mostrarEmpresa }: { l: BpoLote; e: EmpresaVista; mostrarEmpresa: boolean }) {
  const loja = useLoja()
  const executar = useAcao()
  const confirmar = useConfirmar()
  const pedir = usePedirBpo()
  const { usuario } = useSessao()
  const { config } = useBpo()
  const [trilha, setTrilha] = useState(false)
  const podeEscalar = usePode('pagamento_lote.pedir_aprovacao', { cliente_id: e.clienteId })
  const itens = l.conta_ids.map((id) => e.contas.find((c) => c.id === id)).filter((c): c is BpoConta => !!c)
  const podem = aprovadoresPara(e.ficha, l.total, e.faixa2)
  const excecao = (l.extras?.s08c_excecao ?? []) as string[]
  const feitos = escalonamentoDo(l)
  const teto = config?.teto_whatsapp ?? 3_000
  const rotulo = {
    aguardando: `aguardando ${podem.map((p) => p.nome.split(' ')[0]).join(l.aprovadores_necessarios > 1 ? ' e ' : ' ou ') || 'o aprovador'}`,
    parcial: `${l.aprovacoes.length} de ${l.aprovadores_necessarios} aprovações`,
    aprovado: l.modo_pagamento === 'M1' ? 'aprovado · o cliente libera no banco' : 'aprovado · agendado por API no vencimento',
    liberado: 'liberado no banco',
    recusado: 'recusado',
    expirado: 'expirou sem resposta · nada foi pago',
  }[l.situacao]
  const aberto = l.situacao === 'aguardando' || l.situacao === 'parcial'
  const pagas = itens.filter((c) => c.etapa === 'paga').length
  const passos = passosEscalonamento(e, l)
  const avancar = async () => {
    const proximo = feitos.length + 1
    const ok = await confirmar({ titulo: `Avançar o relógio: ${nomesPassos[proximo]}?`, descricao: proximo >= 4 ? 'Simula o vencimento sem resposta: o cartão expira, nada é pago, o Gestor do BPO e o sócio recebem só o alerta e as contas voltam para um lote novo.' : 'Simula a passagem do tempo na demonstração: o passo seguinte do escalonamento acontece agora (aviso no sino e na trilha).', acao: 'Avançar', perigo: proximo >= 4 })
    if (ok !== true) return
    executar(() => avancarEscalonamento(e, l, loja.avisar), { sucesso: proximo >= 4 ? 'Venceu sem aprovação: só alerta, nada foi pago' : `Escalonamento: ${nomesPassos[proximo]}` })
  }
  return (
    <Caixa className={cn(l.situacao === 'expirado' && 'opacity-90')}>
      <TituloBloco descricao={`${mostrarEmpresa ? `${e.nome} · ` : ''}${aberto ? `expira ${quando(l.expira_em.slice(0, 10))} ${hora(l.expira_em)}` : `enviado ${dataHora(l.criado_em)}`}`}>{l.titulo}</TituloBloco>
      <div className="flex flex-wrap gap-1.5">
        <Badge className="w-fit" variant={l.situacao === 'recusado' || l.situacao === 'expirado' ? 'erro' : l.situacao === 'aprovado' || l.situacao === 'liberado' ? 'sucesso' : 'destaque'}>
          {rotulo}
        </Badge>
        {aberto && feitos.length > 0 && (
          <Badge variant="outline" className="w-fit">
            <ClockCountdownIcon /> {nomesPassos[feitos.length]}
          </Badge>
        )}
        {excecao.length > 0 && (
          <Badge variant="destaque" className="w-fit">
            reforçada por exceção
          </Badge>
        )}
      </div>
      <ul className="flex flex-col gap-1.5 text-sm">
        {itens.map((i) => (
          <li key={i.id} className={l.removidos.includes(i.id) ? 'text-muted-foreground flex gap-2 line-through' : 'flex gap-2'}>
            <span className="min-w-0 flex-1">
              <span className="block truncate">{i.contraparte}</span>
              <span className="text-muted-foreground block text-xs">
                vence {quando(i.vencimento)} · {i.etapa === 'paga' ? 'paga (baixa no extrato)' : e.fornecedores.find((f) => f.nome === i.contraparte)?.risco === 'recorrente' ? 'OK (recorrente)' : 'conferida'}
              </span>
              {i.alerta && (
                <span className="text-warning-foreground flex items-start gap-1 text-xs">
                  <WarningIcon className="text-warning mt-0.5 size-3.5 shrink-0" weight="fill" /> {i.alerta}
                </span>
              )}
            </span>
            <span className="tabular-nums">{brl(i.valor)}</span>
          </li>
        ))}
      </ul>
      <div className="border-border/70 flex flex-col gap-1 border-t pt-3 text-sm">
        <span>
          Total <span className="tabular-nums">{brl(l.total)}</span>
        </span>
        <span className="text-muted-foreground text-xs">
          saldo {brl(l.saldo)} · depois {brl(l.saldo - l.total)} · {l.aprovadores_necessarios > 1 ? 'aprovação reforçada (2 pessoas)' : '1 aprovador'} · {l.modo_pagamento === 'M2' ? 'M2 (API)' : 'M1 (o cliente libera)'}
        </span>
        <span className="text-muted-foreground text-xs">
          preparou {l.preparado_por} · conferiu {l.conferido_por}
        </span>
        {aberto && <span className="text-muted-foreground text-xs">{l.total <= teto ? `pode ser aprovado pelo WhatsApp com código de uso único (até ${brl(teto)})` : `acima de ${brl(teto)}: só no app, com segundo fator`}</span>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {aberto && (
          <Button
            size="sm"
            variant="outline"
            className="rounded-full"
            onClick={() => {
              eventoBpo(banco, `${usuario.nome} lembrou ${podem.map((p) => p.nome).join(' e ')} do lote “${l.titulo}”`, e.clienteId, 'pagamento_lote.pedir_aprovacao')
              loja.toast(`Lembrete enviado a ${podem.map((p) => p.nome).join(' e ') || 'o aprovador'} pelo app e WhatsApp`)
            }}
          >
            <BellRingingIcon /> Lembrar
          </Button>
        )}
        {aberto && (
          <Button size="sm" variant="ghost" className="rounded-full" onClick={() => irParaPagina('app')} title="Abre o app do cliente (escolha a pessoa no painel Demonstração)">
            <DeviceMobileIcon /> Ver no app
          </Button>
        )}
        {l.situacao === 'recusado' && (
          <SePode ferramenta="pagamento_lote.montar">
            <Button size="sm" variant="outline" className="rounded-full" onClick={() => executar(() => repos.bpo.lotes.refazer(l.id), { sucesso: 'As contas voltaram ao próximo lote, com o motivo do cliente' })}>
              <HandPalmIcon /> Refazer
            </Button>
          </SePode>
        )}
        {l.situacao === 'liberado' && pagas < itens.length && (
          <Button
            size="sm"
            variant="outline"
            className="rounded-full"
            onClick={() =>
              pedir({
                integrante: 'i-bpo-conciliacao',
                titulo: `Conferir a baixa do lote no extrato de ${e.nome}`,
                cliente: e.nome,
                inicio: 'Vou ler o extrato do dia e casar cada pagamento liberado com a conta do lote.',
                etapas: ['Lendo o extrato (Open Finance)', 'Casando os pagamentos com as contas do lote', `Dando a baixa no ${e.erp.provedor}`],
                fim: { texto: `Baixas do lote “${l.titulo}” confirmadas no extrato e lançadas no ${e.erp.provedor}.`, aviso: `Conciliação confirmou as baixas de ${e.nome}` },
                efeito: { tipo: 'conciliar', clienteId: e.clienteId },
              })
            }
          >
            <CheckIcon /> Conferir a baixa no extrato
          </Button>
        )}
        <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setTrilha(true)}>
          <ListChecksIcon /> Trilha
        </Button>
      </div>
      {(aberto || l.situacao === 'expirado') && (
        <details className="text-xs" open={l.situacao === 'expirado' || feitos.length > 0}>
          <summary className="text-muted-foreground cursor-pointer select-none">{l.situacao === 'expirado' ? 'O escalonamento chegou ao fim: só alerta' : 'Se ninguém responder (escalonamento)'}</summary>
          <ol className="mt-2 flex flex-col gap-1.5 border-l pl-3" aria-label="Escalonamento do lote">
            {passos.map((p, i) => {
              const feito = i === 0 || i <= feitos.length || l.situacao === 'expirado'
              const atual = aberto && i === feitos.length + 1
              return (
                <li key={i} className={cn(feito && 'text-muted-foreground', atual && 'text-foreground font-medium')}>
                  <span className="font-medium">{p.quando}</span> · {p.texto}
                  {feito && ' (feito)'}
                  {atual && ' (próximo)'}
                  {feitos[i - 1] && <span className="text-muted-foreground block">{feitos[i - 1].texto}</span>}
                </li>
              )
            })}
          </ol>
          {aberto && podeEscalar && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Button size="sm" variant="outline" className="rounded-full" onClick={() => void avancar()}>
                <ClockCountdownIcon /> Avançar o relógio: {nomesPassos[feitos.length + 1]}
              </Button>
              <SeloDemonstracao fonte="relógio da demonstração" />
            </div>
          )}
        </details>
      )}
      {(l.aprovacoes.length > 0 || l.motivo || excecao.length > 0) && (
        <ul className="text-muted-foreground flex flex-col gap-0.5 text-xs" aria-label="Decisões do cliente">
          {excecao.map((x) => (
            <li key={x}>Exceção: {x}</li>
          ))}
          {l.aprovacoes.map((a) => (
            <li key={a.nome + a.quando}>
              {l.situacao === 'recusado' && a === l.aprovacoes[l.aprovacoes.length - 1] ? 'Recusado' : 'Aprovado'} por {a.nome} às {hora(a.quando)} {a.canal === 'whatsapp' ? 'pelo WhatsApp (código de uso único)' : 'no app'}
              {l.removidos.length > 0 && l.situacao !== 'recusado' && ` (editou: tirou ${l.removidos.length})`}
            </li>
          ))}
          {l.motivo && <li>Motivo: {l.motivo}</li>}
          {l.situacao === 'liberado' && <li>Liberado no banco pelo cliente; a conciliação confirma a baixa no {e.erp.provedor}.</li>}
        </ul>
      )}
      {trilha && <TrilhaLote l={l} e={e} onFechar={() => setTrilha(false)} />}
    </Caixa>
  )
}

/** Trilha do lote (10, 3.11): quem capturou, conferiu, mandou, aprovou (e por onde), liberou; com a impressão de cada passo encadeada. */
function TrilhaLote({ l, e, onFechar }: { l: BpoLote; e: EmpresaVista; onFechar: () => void }) {
  const tEvento = useTabela('evento')
  const eventos = useMemo(() => trilhaDoLote(l), [l, tEvento]) // eslint-disable-line react-hooks/exhaustive-deps
  let anterior = '00000000'
  return (
    <Dialog open onOpenChange={(v) => !v && onFechar()}>
      <DialogContent className="bg-surface rounded-[24px] border-0 p-5 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-normal">Trilha · {l.titulo}</DialogTitle>
          <DialogDescription>
            {e.nome} · {brl(l.total)}. Cada passo guarda quem fez, quando e a impressão do anterior: a cadeia é o que vai ao cliente e ao auditor.
          </DialogDescription>
        </DialogHeader>
        {eventos.length === 0 ? (
          <p className="text-muted-foreground text-sm">Os passos deste lote vieram da implantação (antes da trilha da plataforma). A partir de agora, cada decisão entra aqui.</p>
        ) : (
          <AreaRolagem as="ol" className="flex max-h-[60vh] flex-col gap-2 border-l pl-3 text-sm" aria-label="Trilha do lote">
            {eventos.map((ev) => {
              const h = impressao(`${anterior}|${ev.id}|${ev.texto}`)
              const li = (
                <li key={ev.id} className="flex flex-col">
                  <span>{ev.texto}</span>
                  <span className="text-muted-foreground text-xs">
                    {ev.ator_nome ?? 'sistema'} · {dataHora(ev.criado_em)} · {ev.ferramenta} · #{h}
                  </span>
                </li>
              )
              anterior = h
              return li
            })}
          </AreaRolagem>
        )}
      </DialogContent>
    </Dialog>
  )
}

/** Lançar conta (digitar): quem lança não confere a mesma conta. */
function LancarConta({ aberta, onFechar, empresas }: { aberta: boolean; onFechar: () => void; empresas: EmpresaVista[] }) {
  const executar = useAcao()
  const [r, setR] = useState({ empresa: empresas[0]?.clienteId ?? '', contraparte: '', categoria: categorias[0], valor: '', vencimento: '', origem: 'e-mail' })
  const empresa = empresas.find((e) => e.clienteId === r.empresa) ?? empresas[0]
  const fornecedorNovo = !!r.contraparte.trim() && !empresa?.fornecedores.some((f) => f.nome.toLowerCase() === r.contraparte.trim().toLowerCase())
  const vencido = !!r.vencimento && diasAte(r.vencimento) < 0
  const erros = { contraparte: !r.contraparte.trim() ? 'Informe o fornecedor.' : undefined, valor: !(Number(r.valor) > 0) ? 'Valor maior que zero.' : undefined, vencimento: !r.vencimento ? 'Informe o vencimento.' : undefined }
  const [tentou, setTentou] = useState(false)
  const salvar = () => {
    setTentou(true)
    if (!empresa || Object.values(erros).some(Boolean)) return
    const ok = executar(() => {
      if (fornecedorNovo) repos.bpo.fornecedores.criar({ cliente_id: empresa.clienteId, nome: r.contraparte.trim(), risco: 'novo', banco: 'dados do boleto (a confirmar por segundo canal)' })
      return repos.bpo.contas.capturar({ cliente_id: empresa.clienteId, contraparte: r.contraparte.trim(), categoria: r.categoria, valor: Number(r.valor), vencimento: r.vencimento, origem: r.origem, lancar_no_erp: empresa.erp.modo === 'E2', alerta: fornecedorNovo ? 'fornecedor novo: confirmar os dados bancários por segundo canal antes do lote' : null })
    }, { sucesso: 'Conta lançada: outra pessoa confere' })
    if (ok) {
      setR((x) => ({ ...x, contraparte: '', valor: '', vencimento: '' }))
      setTentou(false)
      onFechar()
    }
  }
  return (
    <GavetaFormulario aberta={aberta} onFechar={onFechar} titulo="Lançar conta a pagar" descricao="Digitar é a primeira etapa: quem lança não confere esta conta (segregação de funções)." acao="Lançar" onAcao={salvar}>
      {empresas.length > 1 && <Campo rotulo="Empresa">{(id) => <CampoEscolha id={id} valor={r.empresa} onMudar={(v) => setR((x) => ({ ...x, empresa: v }))} opcoes={empresas.map((e) => ({ valor: e.clienteId, rotulo: e.nome }))} />}</Campo>}
      <Campo rotulo="Fornecedor" erro={tentou ? erros.contraparte : undefined} ajuda={fornecedorNovo ? 'Fornecedor novo: sobe de faixa e pede a confirmação dos dados bancários por segundo canal antes do lote.' : undefined}>
        {(id) => <CampoTexto id={id} valor={r.contraparte} onMudar={(v) => setR((x) => ({ ...x, contraparte: v }))} placeholder={empresa?.fornecedores[0]?.nome} />}
      </Campo>
      <Campo rotulo="Categoria gerencial">{(id) => <CampoEscolha id={id} valor={r.categoria} onMudar={(v) => setR((x) => ({ ...x, categoria: v }))} opcoes={categorias.map((c) => ({ valor: c, rotulo: c }))} />}</Campo>
      <Campo rotulo="Valor (R$)" erro={tentou ? erros.valor : undefined} ajuda={empresa && Number(r.valor) > empresa.faixa1 ? `Acima de ${brl(empresa.faixa1)}: duas conferências (analista e gestor).` : undefined}>
        {(id) => <CampoTexto id={id} tipo="number" valor={r.valor} onMudar={(v) => setR((x) => ({ ...x, valor: v }))} />}
      </Campo>
      <Campo rotulo="Vencimento" erro={tentou ? erros.vencimento : undefined} ajuda={vencido ? 'Já vencida: entra com alerta ao Gestor e ao sócio; nunca é paga sem aprovação.' : undefined}>
        {(id) => <CampoTexto id={id} tipo="date" valor={r.vencimento} onMudar={(v) => setR((x) => ({ ...x, vencimento: v }))} />}
      </Campo>
      <Campo rotulo="Chegou por">{(id) => <CampoEscolha id={id} valor={r.origem} onMudar={(v) => setR((x) => ({ ...x, origem: v }))} opcoes={['e-mail', 'WhatsApp', 'app', 'DDA', 'recorrente'].map((o) => ({ valor: o, rotulo: o }))} />}</Campo>
      {empresa?.erp.modo === 'E2' && <p className="text-muted-foreground text-xs">{empresa.erp.provedor} em modo arquivo: a conta entra no checklist “lançar no ERP”.</p>}
      {empresa && limitesDa(empresa).dia && <p className="text-muted-foreground text-xs">Limite diário da alçada aceita: {brl(limitesDa(empresa).dia ?? 0)}.</p>}
    </GavetaFormulario>
  )
}

import { BrainIcon, CheckCircleIcon, LockSimpleIcon, TrashIcon, WarningIcon, XCircleIcon, MinusCircleIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { useJobs, type ResultadoJob } from '@/ambiente/jobs-s01'
import { useLoja, usePersistente } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import { useConfirmar } from '@/components/kit/confirmar'
import { EstadoVazio } from '@/components/kit/estados'
import { ValorEditavel } from '@/components/kit/valor-editavel'
import { AvisoEditeNoComputador, useCelular } from '@/components/compostos/edite-no-computador'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Campo, CampoArea, CampoEscolha, Fichas, GavetaFormulario, Interruptor, Segmentado } from '@/components/ui/formulario'
import type { Integrante } from '@/dados/tipos'
import { useAparencia } from '@/hooks/useAparencia'
import { cn } from '@/lib/utils'
import { rotuloSetorCurto } from '@/nucleo/permissoes'
import type { SetorIntegrante } from '@/theme/tipos'

/*
 * Gavetas do integrante no Time (S01-A29 a A32; 02, 5, 6.4, 7.1 e 11.2; 01, 9).
 * Cada pessoa só vê os próprios integrantes; o integrante nunca passa do que o
 * dono pode (interseção, 01 3.3). Estado por pessoa no escritório.
 */

/* ---------- Memória (02, 5) ---------- */

interface ItemMemoria {
  id: string
  texto: string
  origem: string
  quando: string
}

const memoriaInicial = (setor: SetorIntegrante): ItemMemoria[] => {
  const base: Partial<Record<SetorIntegrante, string[]>> = {
    fiscal: ['A Fernanda prefere receber as guias em lote, às segundas.', 'Café Central: o João só responde por WhatsApp depois das 18h.', 'Metalúrgica: ISS retido pelo tomador em São Paulo, conferir antes de apurar.'],
    dp: ['Rota Sul: folha fecha dia 25 por pedido do cliente.', 'Contrato de experiência padrão do escritório: 45+45.'],
    contabil: ['Metalúrgica manda o extrato do Inter sempre atrasado: cobrar no dia 3.', 'Plano de contas da Clínica foi migrado em outubro.'],
    societario: ['Helena Andrade assina pelo gov.br, não pelo provedor.'],
    notas: ['Loja Bela Vista: notas de devolução vêm sem XML com frequência.'],
    geral: ['A Fernanda gosta de respostas curtas, com o número primeiro.', 'Quando pedir "fechar o mês", começar pela conciliação.'],
    gestao_atendimento: ['Rita Campos (Metalúrgica) prefere e-mail para assuntos de ISS.'],
  }
  return (base[setor] ?? ['Ainda aprendendo com você: o que eu guardar aparece aqui.']).map((texto, i) => ({ id: `mem-${setor}-${i}`, texto, origem: i === 0 ? 'você disse no chat' : 'aprendi com cartões editados', quando: `${10 + i}/11` }))
}
const memoriaDoSetor: Partial<Record<SetorIntegrante, string[]>> = {
  fiscal: ['ISS de São Paulo: vencimento dia 10 do mês seguinte (regra do escritório).', 'PGDAS-D só transmite depois da conferência de notas canceladas.'],
  dp: ['eSocial: eventos de admissão até o dia anterior ao início.', 'Convenção dos comerciários de SP 2026/2027: reajuste de 5,2% (resumo da CCT).'],
  contabil: ['Conciliação: tolerância de R$ 0,05 para tarifas.', 'Balancete só sai depois da conciliação de todas as contas.'],
  societario: ['JUCESP: prazo de 5 dias úteis para exigência.'],
  notas: ['Manifestação do destinatário em até 10 dias.'],
}

export function GavetaMemoria({ integrante, aberta, onFechar }: { integrante: Integrante; aberta: boolean; onFechar: () => void }) {
  const { usuario } = useSessao()
  const loja = useLoja()
  const confirmar = useConfirmar()
  const t = useAparencia()(integrante)
  const [itens, setItens] = usePersistente<ItemMemoria[]>(`s01:memoria:${usuario.id}:${integrante.id}`, () => memoriaInicial(integrante.setor))
  const [retorno, setRetorno] = useState<string | null>(null)
  const doSetor = memoriaDoSetor[integrante.setor] ?? []
  const corrigir = (id: string, texto: string) => {
    setItens((xs) => xs.map((x) => (x.id === id ? { ...x, texto, origem: 'corrigido por você', quando: 'agora' } : x)))
    loja.registrar(usuario.nome, `memoria.corrigir no ${t.nome}: "${texto}"`)
    setRetorno(`memoria.corrigir → ok · ${t.nome} confirmou: "${texto}"`)
  }
  const remover = async (m: ItemMemoria) => {
    if (!(await confirmar({ titulo: 'Remover da memória?', descricao: `${t.nome} esquece: "${m.texto}". O que já foi feito com isso não muda.`, acao: 'Remover', perigo: true }))) return
    setItens((xs) => xs.filter((x) => x.id !== m.id))
    loja.registrar(usuario.nome, `memoria.remover no ${t.nome}: "${m.texto}"`)
    setRetorno(`memoria.remover → ok · ${t.nome} não tem mais esse item (conferido na memória dele)`)
  }
  return (
    <GavetaFormulario aberta={aberta} onFechar={onFechar} titulo={`Memória de ${t.nome}`} descricao="O que ele guardou de você (privado) e o que vale para o setor inteiro (só leitura)." acao="Fechar" onAcao={onFechar}>
      {retorno && (
        <p role="status" className="bg-sunken flex items-center gap-2 rounded-md px-3 py-2 font-mono text-xs">
          <CheckCircleIcon className="text-success size-4 shrink-0" /> {retorno}
        </p>
      )}
      <section className="flex flex-col gap-2">
        <h3 className="flex items-center gap-1.5 text-sm font-medium">
          <BrainIcon className="size-4" /> Só sua ({itens.length})
        </h3>
        {itens.length === 0 && <EstadoVazio compacto titulo="Memória vazia" descricao="Diga no chat “lembre que...” e ele guarda aqui." />}
        <ul className="flex flex-col gap-2">
          {itens.map((m) => (
            <li key={m.id} className="bg-surface shadow-contorno flex flex-col gap-1.5 rounded-md p-3">
              {/* Corrigir no lugar: clicar no texto abre o campo; o aviso traz "Desfazer". O envio do seletor
                  (num portal) sobe pela árvore do React até o formulário da gaveta e a fecharia: para aqui. */}
              <p className="text-sm">
                <ValorEditavel rotulo="Memória" valor={m.texto} config={{ tipo: 'texto', multilinha: true, validar: (v) => (v.trim() ? null : 'Escreva o que ele deve lembrar.') }} onMudar={(v) => corrigir(m.id, v.trim())} />
              </p>
              <div className="text-muted-foreground flex items-center gap-2 text-xs">
                <span className="flex-1">
                  {m.origem} · {m.quando}
                </span>
                <Button type="button" size="icon-sm" variant="ghost" className="rounded-full" aria-label={`Remover: ${m.texto}`} onClick={() => remover(m)}>
                  <TrashIcon />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </section>
      {doSetor.length > 0 && (
        <section className="flex flex-col gap-2">
          <h3 className="flex items-center gap-1.5 text-sm font-medium">
            <LockSimpleIcon className="size-4" /> Do setor {rotuloSetorCurto[integrante.setor]} (só leitura)
          </h3>
          <ul className="text-muted-foreground flex list-disc flex-col gap-1 pl-5 text-sm">
            {doSetor.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
          <p className="text-muted-foreground text-xs">A memória do setor é editada pelo Gestor do setor.</p>
        </section>
      )}
    </GavetaFormulario>
  )
}

/* ---------- Configurar (01, 9; 02, 11.2) ---------- */

type NivelTela = 'ler' | 'preparar' | 'executar' | 'aprovacao'
interface FerramentaIntegrante {
  nome: string
  rotulo: string
  irreversivel?: boolean
  /** Setor de que o dono precisa ter vínculo; sem ele, aparece "removido". */
  setor?: SetorIntegrante
  gestao?: boolean
}
const ferramentasPorSetor: Partial<Record<SetorIntegrante, FerramentaIntegrante[]>> = {
  fiscal: [
    { nome: 'caixa_postal.ler', rotulo: 'Ler caixas postais (e-CAC, DTE)' },
    { nome: 'pgdas.apurar', rotulo: 'Apurar o PGDAS-D' },
    { nome: 'pgdas.transmitir', rotulo: 'Transmitir declarações', irreversivel: true },
    { nome: 'certidao.emitir', rotulo: 'Emitir certidões' },
    { nome: 'guia.enviar_cliente', rotulo: 'Enviar guias ao cliente', irreversivel: true },
    { nome: 'conversa.pedir_documento', rotulo: 'Pedir documento ao cliente' },
    { nome: 'tarefa.reatribuir', rotulo: 'Reatribuir tarefas do setor', gestao: true },
  ],
  dp: [
    { nome: 'esocial.consultar', rotulo: 'Consultar o eSocial' },
    { nome: 'contrato.gerar', rotulo: 'Gerar contratos de trabalho' },
    { nome: 'esocial.enviar', rotulo: 'Enviar eventos ao eSocial', irreversivel: true },
    { nome: 'holerite.enviar_cliente', rotulo: 'Enviar holerites', irreversivel: true },
    { nome: 'conversa.pedir_documento', rotulo: 'Pedir documento ao cliente' },
  ],
  contabil: [
    { nome: 'conciliacao.executar', rotulo: 'Conciliar extratos' },
    { nome: 'balancete.gerar', rotulo: 'Gerar balancete' },
    { nome: 'relatorio.enviar_cliente', rotulo: 'Enviar relatórios ao cliente', irreversivel: true },
    { nome: 'fiscal.apurar', rotulo: 'Apurar tributos (pede vínculo no Fiscal)', setor: 'fiscal' },
  ],
  societario: [
    { nome: 'cnpj.consultar', rotulo: 'Consultar CNPJ e Junta' },
    { nome: 'minuta.preparar', rotulo: 'Preparar minutas' },
    { nome: 'assinatura.solicitar', rotulo: 'Pedir assinatura ao cliente', irreversivel: true },
  ],
  notas: [
    { nome: 'dfe.baixar', rotulo: 'Baixar notas (DF-e)' },
    { nome: 'manifestacao.registrar', rotulo: 'Registrar ciência da operação' },
    { nome: 'nfse.emitir', rotulo: 'Emitir NFS-e', irreversivel: true },
  ],
}
const padraoGeral: FerramentaIntegrante[] = [
  { nome: 'tarefa.listar', rotulo: 'Ler tarefas e obrigações' },
  { nome: 'documento.listar', rotulo: 'Ler documentos' },
  { nome: 'conversa.rascunhar', rotulo: 'Rascunhar mensagens' },
  { nome: 'notificacao.publicar', rotulo: 'Avisar você' },
]
const rotuloNivel: Record<NivelTela, string> = { ler: 'só ler', preparar: 'preparar', executar: 'executar', aprovacao: 'com aprovação' }

interface ConfigIntegrante {
  instrucoes: string
  setores: SetorIntegrante[]
  clientes: 'todos' | 'carteira'
  niveis: Record<string, NivelTela>
  canal: 'chat' | 'central' | 'whatsapp_do_dono'
  limiteDia: number
}

export function GavetaConfigurar({ integrante, aberta, onFechar }: { integrante: Integrante; aberta: boolean; onFechar: () => void }) {
  const { usuario, permissoes } = useSessao()
  const loja = useLoja()
  const celular = useCelular()
  const t = useAparencia()(integrante)
  const lista = [...(ferramentasPorSetor[integrante.setor] ?? []), ...padraoGeral]
  const doDono = (f: FerramentaIntegrante) => (!f.setor || permissoes.setores.includes(f.setor)) && (!f.gestao || permissoes.gere.includes(integrante.setor))
  const [salvo, setSalvo] = usePersistente<ConfigIntegrante | null>(`s01:config-integrante:${usuario.id}:${integrante.id}`, null)
  const inicial: ConfigIntegrante = salvo ?? {
    instrucoes: integrante.tipo === 'criado_pelo_usuario' ? integrante.funcao : '',
    setores: integrante.setor === 'geral' ? [] : [integrante.setor],
    clientes: 'todos',
    niveis: Object.fromEntries(lista.map((f) => [f.nome, f.irreversivel ? 'aprovacao' : f.nome.endsWith('.ler') || f.nome.endsWith('.listar') || f.nome.endsWith('consultar') ? 'ler' : 'executar'])),
    canal: 'chat',
    limiteDia: 100,
  }
  const [c, setC] = useState<ConfigIntegrante>(inicial)
  const setoresDono = permissoes.setores.filter((s) => s !== 'geral')
  return (
    <GavetaFormulario
      aberta={aberta}
      onFechar={onFechar}
      largura="lg"
      titulo={`Configurar ${t.nome}`}
      descricao="Ele nunca passa do que você pode: o que está fora do seu acesso aparece como removido."
      acao="Salvar"
      acaoDesabilitada={celular}
      onAcao={() => {
        setSalvo(c)
        loja.registrar(usuario.nome, `integrante.configurar: ${t.nome} (${Object.keys(c.niveis).length} ferramentas, aviso por ${c.canal})`)
        loja.toast(`${t.nome} configurado.`)
        onFechar()
      }}
    >
      {celular && <AvisoEditeNoComputador />}
      <section className="flex flex-col gap-2">
        <h3 className="text-sm font-medium">Instruções</h3>
        <div className="bg-sunken/60 text-muted-foreground flex flex-col gap-1 rounded-md px-3 py-2 text-xs">
          <span className="flex items-center gap-1.5">
            <LockSimpleIcon className="size-3.5" /> Camada 1 (da plataforma): assina como assistente; nunca cita preço a lead; nunca opina sem contador; transmitir, pagar e assinar sempre com pessoa.
          </span>
          <span className="flex items-center gap-1.5">
            <LockSimpleIcon className="size-3.5" /> Camada 2 (do escritório): tom e regras do Contábil Andrade & Lima, definidos pelo Administrador.
          </span>
        </div>
        <Campo rotulo="Camada 3: as suas instruções" ajuda="Como você quer que ele trabalhe com você.">
          {(id) => <CampoArea id={id} valor={c.instrucoes} onMudar={(v) => setC({ ...c, instrucoes: v })} placeholder="Ex.: me mande as guias em lote às segundas." linhas={3} />}
        </Campo>
      </section>
      {integrante.setor !== 'geral' && integrante.setor !== 'consultor' && (
        <Campo rotulo="Setores em que atua">{() => <Fichas rotulo="Setores" valores={c.setores} onMudar={(v) => setC({ ...c, setores: v })} opcoes={setoresDono.map((s) => ({ valor: s, rotulo: rotuloSetorCurto[s] ?? s }))} />}</Campo>
      )}
      <Campo rotulo="Clientes">
        {() => (
          <Segmentado
            rotulo="Clientes"
            valor={c.clientes}
            onMudar={(v) => setC({ ...c, clientes: v })}
            opcoes={[
              { valor: 'todos', rotulo: 'Todos que eu vejo' },
              { valor: 'carteira', rotulo: 'Só a minha carteira' },
            ]}
          />
        )}
      </Campo>
      <section className="flex flex-col gap-2">
        <h3 className="text-sm font-medium">Ferramentas e nível</h3>
        <ul className="flex flex-col divide-y rounded-md border">
          {lista.map((f) => {
            const removida = !doDono(f)
            return (
              <li key={f.nome} className={cn('flex items-center gap-3 px-3 py-2', removida && 'text-muted-foreground grayscale')}>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm">{f.rotulo}</span>
                  <span className="text-muted-foreground block font-mono text-xs">{f.nome}</span>
                </span>
                {removida ? (
                  <Badge variant="outline">removido · você não tem isso</Badge>
                ) : f.irreversivel ? (
                  <Badge variant="destaque">
                    <LockSimpleIcon /> com aprovação
                  </Badge>
                ) : (
                  <span className="w-36 shrink-0">
                    <CampoEscolha rotulo={`Nível de ${f.rotulo}`} valor={c.niveis[f.nome] ?? 'ler'} onMudar={(v) => setC({ ...c, niveis: { ...c.niveis, [f.nome]: v } })} opcoes={(['ler', 'preparar', 'executar', 'aprovacao'] as NivelTela[]).map((n) => ({ valor: n, rotulo: rotuloNivel[n] }))} />
                  </span>
                )}
              </li>
            )
          })}
        </ul>
        <p className="text-muted-foreground text-xs">Transmitir, pagar, assinar e enviar ao cliente nunca saem do cartão de aprovação.</p>
      </section>
      <Campo rotulo="Como ele avisa você">
        {() => (
          <Segmentado
            rotulo="Canal de aviso"
            valor={c.canal}
            onMudar={(v) => setC({ ...c, canal: v })}
            opcoes={[
              { valor: 'chat', rotulo: 'No chat' },
              { valor: 'central', rotulo: 'No sino' },
              { valor: 'whatsapp_do_dono', rotulo: 'No meu WhatsApp' },
            ]}
          />
        )}
      </Campo>
      <Campo rotulo={`Teto de uso por dia: ${c.limiteDia}% do seu limite`} ajuda="Passou, ele espera a próxima janela (o chat continua).">
        {(id) => <input id={id} type="range" min={10} max={100} step={10} value={c.limiteDia} onChange={(e) => setC({ ...c, limiteDia: Number(e.target.value) })} className="accent-foreground w-full" />}
      </Campo>
    </GavetaFormulario>
  )
}

/* ---------- Jobs e gatilhos (02, 7.1) ---------- */

const iconeResultado: Record<ResultadoJob, typeof CheckCircleIcon> = { ok: CheckCircleIcon, vazio: MinusCircleIcon, parcial: WarningIcon, falhou: XCircleIcon }
const rotuloResultado: Record<ResultadoJob, string> = { ok: 'ok', vazio: 'vazio', parcial: 'parcial', falhou: 'falhou' }
const corResultado: Record<ResultadoJob, string> = { ok: 'text-success-text', vazio: 'text-muted-foreground', parcial: 'text-warning-text', falhou: 'text-destructive-text' }

export function GavetaJobs({ integrante, aberta, onFechar }: { integrante: Integrante; aberta: boolean; onFechar: () => void }) {
  const { usuario } = useSessao()
  const loja = useLoja()
  const t = useAparencia()(integrante)
  const { jobs, alternar, rodar } = useJobs()
  const meus = jobs.filter((j) => j.integrante === integrante.setor)
  const [aberto, setAberto] = useState<string | null>(null)
  const veCusto = usuario.papel !== 'colaborador'
  return (
    <GavetaFormulario aberta={aberta} onFechar={onFechar} largura="lg" titulo={`Jobs e gatilhos de ${t.nome}`} descricao="O que ele faz sozinho na hora marcada ou quando algo acontece. Pausado, nada disso roda." acao="Fechar" onAcao={onFechar}>
      {meus.length === 0 && <EstadoVazio compacto titulo="Nenhum job ainda" descricao="Peça no chat: “me avise quando...”. A regra volta para você confirmar." />}
      <ul className="flex flex-col gap-2">
        {meus.map((j) => {
          const ok = j.resultados.filter((r) => r.resultado === 'ok').length
          return (
            <li key={j.id} className="bg-surface shadow-contorno flex flex-col gap-2 rounded-md p-3">
              <div className="flex items-start gap-3">
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-1.5 text-sm font-medium">
                    {j.titulo}
                    <Badge variant="outline">{j.tipo === 'agendado' ? 'agendado' : 'gatilho'}</Badge>
                    {j.sugerido && !j.ativo && <Badge variant="destaque">sugerido</Badge>}
                  </span>
                  <span className="text-muted-foreground block text-xs">{j.regra}</span>
                  <span className="text-muted-foreground block text-xs">
                    {j.quando}
                    {veCusto && ` · custo estimado R$ ${j.custo.toFixed(2).replace('.', ',')} por execução`}
                  </span>
                </span>
                <Interruptor
                  ocultarRotulo
                  rotulo={`${j.ativo ? 'Desligar' : 'Ligar'} ${j.titulo}`}
                  ligado={j.ativo}
                  onMudar={() => {
                    alternar(j.id)
                    loja.registrar(usuario.nome, `${j.ativo ? 'Desligou' : 'Ligou'} o job "${j.titulo}" de ${t.nome}`)
                  }}
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex gap-0.5" aria-label={`Últimos resultados: ${ok} ok de ${j.resultados.length}`}>
                  {j.resultados.slice(0, 30).map((r, i) => {
                    const I = iconeResultado[r.resultado]
                    return <I key={i} className={cn('size-3.5', corResultado[r.resultado])} weight="fill" aria-hidden />
                  })}
                </span>
                <Button type="button" size="sm" variant="ghost" className="h-7 rounded-full px-2" onClick={() => setAberto(aberto === j.id ? null : j.id)}>
                  {aberto === j.id ? 'esconder' : `últimos ${Math.min(30, j.resultados.length)}`}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="ml-auto h-7 rounded-full px-2"
                  disabled={!j.ativo || integrante.situacao === 'pausado'}
                  onClick={() => {
                    rodar(j.id, { quando: 'agora', resultado: 'vazio', texto: 'rodado à mão: nada a avisar' })
                    loja.toast(`${t.nome} rodou "${j.titulo}" agora: nada a avisar.`)
                  }}
                >
                  Rodar agora
                </Button>
              </div>
              {aberto === j.id && (
                <ul className="flex flex-col gap-1 text-xs">
                  {j.resultados.length === 0 && <li className="text-muted-foreground">Ainda não rodou.</li>}
                  {j.resultados.map((r, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-muted-foreground w-20 shrink-0 tabular-nums">{r.quando}</span>
                      <span className={cn('w-12 shrink-0 font-medium', corResultado[r.resultado])}>{rotuloResultado[r.resultado]}</span>
                      <span className="text-muted-foreground min-w-0 flex-1">{r.texto}</span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          )
        })}
      </ul>
    </GavetaFormulario>
  )
}

/* ---------- Histórico do mês passado (02, 6.4) ---------- */

export function GavetaHistorico({ integrante, aberta, onFechar }: { integrante: Integrante; aberta: boolean; onFechar: () => void }) {
  const t = useAparencia()(integrante)
  const sessoes = [
    { quando: '31/10 · fechamento de outubro', resumo: `${t.nome} fechou o mês: 38 tarefas concluídas, 9 cartões aprovados, 2 recusados.` },
    { quando: '24/10 · semana 4', resumo: 'Conversas sobre a DCTFWeb de setembro e a cobrança de extratos.' },
    { quando: '15/10 · marco: troca de regime da Clínica', resumo: 'Sessão encerrada no marco: o regime mudou e o contexto recomeçou.' },
    { quando: '03/10 · semana 1', resumo: 'Calendário de outubro gerado; 4 pedidos de documento.' },
  ]
  return (
    <GavetaFormulario aberta={aberta} onFechar={onFechar} titulo={`Histórico de ${t.nome}`} descricao="Sessões anteriores. O chat recomeça a cada mês e em marcos (troca de regime, saída de cliente); o que importa fica na memória." acao="Fechar" onAcao={onFechar}>
      <ul className="flex flex-col gap-2">
        {sessoes.map((s) => (
          <li key={s.quando} className="bg-surface shadow-contorno flex flex-col gap-1 rounded-md p-3">
            <span className="text-muted-foreground text-xs">{s.quando}</span>
            <span className="text-sm">{s.resumo}</span>
          </li>
        ))}
      </ul>
    </GavetaFormulario>
  )
}

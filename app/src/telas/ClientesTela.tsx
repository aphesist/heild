import { AddressBookIcon, BriefcaseIcon, MagnifyingGlassIcon, PlusIcon } from '@phosphor-icons/react'
import { useMemo, useState } from 'react'
import { useFluxos } from '@/ambiente/fluxos'
import { useLoja, useNavegacao, usePersistente } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import { Caixa, Numero } from '@/components/compostos/blocos'
import { AreaRolagem } from '@/components/ui/area-rolagem'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Campo, CampoEscolha, CampoTexto, Fichas, GavetaFormulario, Segmentado } from '@/components/ui/formulario'
import { EstadoVazio, useAcao, usePode } from '@/components/kit'
import { useTabela } from '@/nucleo/react'
import { repos } from '@/nucleo/repositorios'
import { rotuloSituacaoPerfil, useBpo } from './bpo/dados'
import { FichaEmpresa, NovaEmpresaBpo } from './bpo/FichaEmpresa'
import { useEfeitosS08a } from './bpo/integrantes-s08a'
import type { Cliente } from '@/dados/tipos'

type Pacote = 'contabil' | 'bpo'
const rotuloPacote: Record<Pacote, string> = { contabil: 'Contabilidade', bpo: 'BPO financeiro' }
const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
const soDigitos = (v: string) => v.replace(/\D/g, '')

/**
 * Clientes (S08-T08; 10, 2.2 e 2.5): o cadastro dos clientes para quem não
 * tem o Painel (o escritório só de BPO, cenário C1). Cada cliente com os
 * pacotes que contratou, quem atende, o ERP e a situação do BPO, a ficha
 * (contatos por assunto, alçadas, app) e "Pôr no BPO". É o mesmo cadastro do
 * Painel › Societário: um cliente existe uma vez só (o novo cliente confere o
 * CNPJ antes de gravar). No C1 não há pacote Contábil: o que for da
 * contabilidade não aparece.
 */
export function ClientesTela({ aba, clientes }: { aba: string; clientes: Cliente[] }) {
  const loja = useLoja()
  const nav = useNavegacao()
  const fluxos = useFluxos()
  const { usuario } = useSessao()
  useEfeitosS08a() // S08a: a ficha BPO aberta daqui pode pôr integrantes para trabalhar
  const bpoPuro = loja.estado.cenario === 'bpo_puro'
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = usePersistente<'todos' | 'implantacao' | 'ativo' | 'sem_bpo'>('s08a:clientes:filtro', 'todos')
  const [filtroContatos, setFiltroContatos] = usePersistente<'todos' | 'aprovam' | 'app'>('s08a:clientes:contatos', 'todos')
  // Clientes antigos guardados só na tela (antes do cadastro único no banco) continuam aparecendo.
  const [novos] = usePersistente<Cliente[]>('clientes.novos', [])
  const { empresas, encerradas } = useBpo()
  const tPerfil = useTabela('bpo_perfil')
  const executar = useAcao()
  const podeCriar = usePode('cliente.criar') && usuario.papel !== 'colaborador'
  const podeBpo = usePode('bpo.onboarding')
  const [gaveta, setGaveta] = useState(false)
  const [porNoBpo, setPorNoBpo] = useState<string | null>(null)
  const [fichaBpo, setFichaBpo] = useState<{ id: string; secao?: string } | null>(null)

  // O cliente cujo BPO acabou continua no cadastro (só o serviço saiu).
  const todos = useMemo(() => {
    const ids = new Set(clientes.map((c) => c.id))
    const comPerfil = loja.clientes.filter((c) => !ids.has(c.id) && tPerfil.some((p) => p.cliente_id === c.id))
    return [...novos.filter((n) => !ids.has(n.id)), ...clientes, ...comPerfil]
  }, [clientes, novos, loja.clientes, tPerfil])
  const pacotesDe = (c: Cliente): Pacote[] => (c.servicos ?? ['contabil']).filter((p) => !bpoPuro || p !== 'contabil')
  const bpoDe = (id: string) => empresas.find((e) => e.clienteId === id) ?? encerradas.find((e) => e.clienteId === id)
  const situacaoBpo = (c: Cliente) => {
    const e = bpoDe(c.id)
    if (!e || e.perfil.situacao === 'encerrado') return 'sem_bpo'
    return e.perfil.situacao === 'onboarding' || e.perfil.situacao === 'paralelo' ? 'implantacao' : 'ativo'
  }
  const q = busca.trim().toLowerCase()
  const lista = todos.filter((c) => (!q || c.nome.toLowerCase().includes(q) || c.codigo.includes(q) || soDigitos(c.documento).includes(soDigitos(q) || q)) && (filtro === 'todos' || situacaoBpo(c) === filtro))
  const contatos = lista.flatMap((c) => (loja.fichaDe(c.id)?.contatos ?? []).map((p) => ({ c, p }))).filter(({ p }) => (filtroContatos === 'aprovam' ? (p.alcadaPagamento ?? 0) > 0 : filtroContatos === 'app' ? !!p.app : true))
  const conta = (s: string) => todos.filter((c) => situacaoBpo(c) === s).length

  return (
    <AreaRolagem className="h-full px-3 pb-10 sm:px-5">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 pt-1 ultra:max-w-[1600px]">
        <header className="flex flex-wrap items-end gap-3">
          <div className="min-w-0 flex-1 basis-72">
            <h1 className="text-2xl font-light tracking-tight sm:text-3xl">{aba === 'contatos' ? 'Contatos dos clientes' : 'Clientes'}</h1>
            <p className="text-muted-foreground text-sm">
              {aba === 'contatos' ? 'Quem fala com o escritório, o que recebe, se usa o app e até quanto aprova' : 'O mesmo cadastro em todos os pacotes: cada cliente com o que contratou e quem atende'}
            </p>
          </div>
          <label className="bg-raised shadow-contorno flex h-9 w-full items-center gap-2 rounded-full px-3 sm:w-64">
            <MagnifyingGlassIcon className="text-muted-foreground size-4" />
            <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Nome, código ou CNPJ" aria-label="Buscar cliente" className="w-full bg-transparent text-sm outline-none" />
          </label>
          {podeCriar && aba === 'cadastro' && (
            <Button size="sm" className="rounded-full" onClick={() => setGaveta(true)}>
              <PlusIcon /> Novo cliente
            </Button>
          )}
        </header>

        {aba === 'cadastro' ? (
          <>
            <Caixa>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <Numero valor={todos.length} rotulo="clientes" />
                <Numero valor={conta('ativo')} rotulo="com o BPO ativo" />
                <Numero valor={conta('implantacao')} rotulo="em implantação" detalhe="oito passos na ficha BPO" />
                <Numero valor={todos.reduce((s, c) => s + (loja.fichaDe(c.id)?.contatos.filter((x) => x.app).length ?? 0), 0)} rotulo="pessoas no app" />
              </div>
            </Caixa>
            <Segmentado
              rotulo="Filtrar clientes"
              valor={filtro}
              onMudar={setFiltro}
              opcoes={[
                { valor: 'todos', rotulo: `Todos (${todos.length})` },
                { valor: 'implantacao', rotulo: `Em implantação (${conta('implantacao')})` },
                { valor: 'ativo', rotulo: `BPO ativo (${conta('ativo')})` },
                { valor: 'sem_bpo', rotulo: `Sem BPO (${conta('sem_bpo')})` },
              ]}
            />
            {todos.length === 0 ? (
              <EstadoVazio icone={AddressBookIcon} titulo="Nenhum cliente ainda" descricao="Cadastre o primeiro cliente; depois, ponha a empresa no BPO para começar a implantação." acao={podeCriar ? <Button className="rounded-full" onClick={() => setGaveta(true)}><PlusIcon /> Novo cliente</Button> : undefined} />
            ) : lista.length === 0 ? (
              <EstadoVazio compacto icone={MagnifyingGlassIcon} titulo="Nenhum cliente encontrado" descricao="Mude a busca ou o filtro." />
            ) : (
              <Caixa className="gap-0 p-0 sm:p-0">
                <ul className="divide-border/70 flex flex-col divide-y" aria-label="Clientes">
                  {lista.map((c) => {
                    const ficha = loja.fichaDe(c.id)
                    const e = bpoDe(c.id)
                    const sit = situacaoBpo(c)
                    const resp = [!bpoPuro && ficha?.responsaveis.contabil && `Contábil: ${ficha.responsaveis.contabil}`, e && sit !== 'sem_bpo' ? `BPO: ${e.perfil.analista_nome}` : ficha?.responsaveis.bpo_financeiro && `BPO: ${ficha.responsaveis.bpo_financeiro}`].filter(Boolean).join(' · ')
                    return (
                      <li key={c.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-5">
                        <span className="min-w-0 flex-1 basis-64">
                          <span className="block truncate text-sm font-medium">
                            {c.codigo} - {c.nome}
                          </span>
                          <span className="text-muted-foreground block truncate text-xs">
                            {c.documento} · {c.regime}
                            {resp && ` · ${resp}`}
                          </span>
                        </span>
                        <span className="flex flex-wrap gap-1.5">
                          {pacotesDe(c).map((p) => (
                            <Badge key={p} variant="outline">
                              {rotuloPacote[p]}
                            </Badge>
                          ))}
                          {sit === 'implantacao' && <Badge variant="destaque">{e ? rotuloSituacaoPerfil[e.perfil.situacao] : 'em implantação'}</Badge>}
                          {sit === 'sem_bpo' && e?.perfil.situacao === 'encerrado' && <Badge variant="secondary">BPO encerrado</Badge>}
                        </span>
                        <span className="text-muted-foreground w-40 text-xs">
                          {ficha?.contatos.length ?? 0} contato{(ficha?.contatos.length ?? 0) === 1 ? '' : 's'} · {ficha?.contatos.filter((x) => x.app).length ?? 0} no app
                          {e && sit !== 'sem_bpo' && <span className="block">ERP: {e.erp.provedor}</span>}
                        </span>
                        <span className="flex flex-wrap gap-1">
                          {e && sit !== 'sem_bpo' ? (
                            <>
                              <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setFichaBpo({ id: c.id, secao: sit === 'implantacao' ? 'ciclo' : undefined })}>
                                {sit === 'implantacao' ? 'Implantação' : 'Ficha BPO'}
                              </Button>
                              <Button size="sm" variant="ghost" className="rounded-full" onClick={() => nav.irPara({ modulo: 'bpo', aba: 'visao', cliente: c.id })} aria-label={`Abrir ${c.nome} no BPO`}>
                                <BriefcaseIcon /> BPO
                              </Button>
                            </>
                          ) : (
                            podeBpo && (
                              <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setPorNoBpo(c.id)} aria-label={`Pôr ${c.nome} no BPO`}>
                                <PlusIcon /> Pôr no BPO
                              </Button>
                            )
                          )}
                          <Button size="sm" variant="outline" className="rounded-full" onClick={() => fluxos.fichaCliente(c.id)}>
                            Ficha
                          </Button>
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </Caixa>
            )}
          </>
        ) : (
          <>
            <Segmentado
              rotulo="Filtrar contatos"
              valor={filtroContatos}
              onMudar={setFiltroContatos}
              opcoes={[
                { valor: 'todos', rotulo: 'Todos' },
                { valor: 'aprovam', rotulo: 'Aprovam pagamentos' },
                { valor: 'app', rotulo: 'Usam o app' },
              ]}
            />
            {contatos.length === 0 ? (
              <EstadoVazio compacto icone={AddressBookIcon} titulo="Nenhum contato com esse filtro" descricao="Os contatos ficam na ficha de cada cliente, com o assunto, o app e a alçada de pagamento." />
            ) : (
              <Caixa className="gap-0 p-0 sm:p-0">
                <ul className="divide-border/70 flex flex-col divide-y" aria-label="Contatos dos clientes">
                  {contatos.map(({ c, p }) => (
                    <li key={`${c.id}-${p.nome}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-sm sm:px-5">
                      <span className="min-w-0 flex-1 basis-56">
                        <span className="block truncate">{p.nome}</span>
                        <span className="text-muted-foreground block truncate text-xs">
                          {c.nome} · {p.papel}
                        </span>
                      </span>
                      <span className="text-muted-foreground w-44 truncate text-xs">{p.whatsapp ?? p.email ?? 'sem canal'}</span>
                      <span className="text-muted-foreground w-28 text-xs">{p.app ? 'usa o app' : 'sem app'}</span>
                      <span className="w-40 text-xs sm:text-right">{p.alcadaPagamento ? `aprova até ${brl(p.alcadaPagamento)}${p.reforcada ? ' · reforçada' : ''}` : <span className="text-muted-foreground">não aprova pagamentos</span>}</span>
                      <Button size="sm" variant="ghost" className="rounded-full" onClick={() => fluxos.fichaCliente(c.id)}>
                        Editar
                      </Button>
                    </li>
                  ))}
                </ul>
              </Caixa>
            )}
          </>
        )}
      </div>

      <NovoCliente
        aberta={gaveta}
        onFechar={() => setGaveta(false)}
        todos={todos}
        bpoPuro={bpoPuro}
        podeBpo={podeBpo}
        executar={executar}
        quem={usuario.nome}
        onAbrirExistente={(id) => (setGaveta(false), fluxos.fichaCliente(id))}
        onCriado={(id, implantar) => implantar && setPorNoBpo(id)}
      />
      <NovaEmpresaBpo aberta={!!porNoBpo} inicial={porNoBpo ?? undefined} onFechar={() => setPorNoBpo(null)} onCriada={(id) => setFichaBpo({ id, secao: 'ciclo' })} />
      {fichaBpo && <FichaEmpresa clienteId={fichaBpo.id} secao={fichaBpo.secao} onFechar={() => setFichaBpo(null)} onIr={(id, aba) => nav.irPara({ modulo: 'bpo', aba: aba ?? 'visao', cliente: id ?? undefined })} />}
    </AreaRolagem>
  )
}

/** Novo cliente (S08-A42): o mesmo cadastro do Societário; confere o documento antes de gravar e pode já abrir a implantação do BPO. */
function NovoCliente({ aberta, onFechar, todos, bpoPuro, podeBpo, executar, quem, onAbrirExistente, onCriado }: { aberta: boolean; onFechar: () => void; todos: Cliente[]; bpoPuro: boolean; podeBpo: boolean; executar: ReturnType<typeof useAcao>; quem: string; onAbrirExistente: (id: string) => void; onCriado: (id: string, implantar: boolean) => void }) {
  const tCliente = useTabela('cliente')
  const vazio = { nome: '', documento: '', regime: 'Simples Nacional' as Cliente['regime'], pacotes: ['bpo'] as Pacote[], implantar: true }
  const [r, setR] = useState(vazio)
  const doc = soDigitos(r.documento)
  const pf = r.regime === 'Pessoa física'
  const existente = doc.length >= 11 ? tCliente.find((c) => soDigitos(c.documento) === doc) : undefined
  const mesmoNome = r.nome.trim().length > 3 ? tCliente.find((c) => c.nome.trim().toLowerCase() === r.nome.trim().toLowerCase()) : undefined
  const erroNome = !r.nome.trim() ? 'Informe a razão social (ou o nome).' : undefined
  const erroDoc = !doc ? undefined : pf ? (doc.length !== 11 ? 'CPF com 11 dígitos.' : undefined) : doc.length !== 14 ? 'CNPJ com 14 dígitos.' : undefined
  const erroPacote = r.pacotes.length === 0 ? 'Escolha ao menos um pacote.' : undefined
  return (
    <GavetaFormulario
      aberta={aberta}
      onFechar={onFechar}
      titulo="Novo cliente"
      descricao="O cadastro é um só; os pacotes dizem em que módulos o cliente aparece."
      acao="Cadastrar"
      acaoDesabilitada={!!erroNome || !!erroDoc || !!erroPacote || !!existente}
      onAcao={() => {
        // S08-A42: o mesmo cadastro do Painel › Societário (um cliente existe uma vez só), no banco.
        const regimes = { 'Simples Nacional': 'simples', 'Lucro Presumido': 'presumido', 'Lucro Real': 'real', MEI: 'mei', 'Pessoa física': 'pf' } as const
        const criado = executar(
          () =>
            repos.clientes.criar(
              {
                tipo: pf ? 'pf' : r.regime === 'MEI' ? 'mei' : 'pj',
                codigo: String(800 + Math.max(todos.length, tCliente.length)),
                nome: r.nome.trim(),
                documento: r.documento.trim() || 'CNPJ a confirmar',
                estado_ciclo: 'em_implantacao',
                estado_ciclo_desde: new Date().toISOString().slice(0, 10),
                regime: regimes[r.regime] ?? 'simples',
                servicos_contratados: r.pacotes,
                extras: { servicos_definidos: true },
              },
              { texto: `${quem} cadastrou o cliente ${r.nome.trim()} (${r.pacotes.map((p) => rotuloPacote[p]).join(' e ')})` },
            ),
          { sucesso: `${r.nome.trim()} cadastrado em implantação` },
        )
        if (!criado) return
        onFechar()
        onCriado(criado.id, r.implantar && r.pacotes.includes('bpo') && podeBpo)
        setR(vazio)
      }}
    >
      <Campo rotulo="Razão social" erro={erroNome}>
        {(id) => <CampoTexto id={id} valor={r.nome} onMudar={(v) => setR((s) => ({ ...s, nome: v }))} />}
      </Campo>
      <Campo rotulo="CNPJ ou CPF" erro={erroDoc} ajuda="Vazio: fica “a confirmar” no cadastro.">
        {(id) => <CampoTexto id={id} mono valor={r.documento} onMudar={(v) => setR((s) => ({ ...s, documento: v }))} />}
      </Campo>
      {(existente || mesmoNome) && (
        <div className="bg-warning/10 flex flex-col gap-2 rounded-[14px] p-3 text-sm" role="alert">
          <span>{existente ? `Este documento já está no cadastro: ${existente.codigo} · ${existente.nome}. O cadastro é um só.` : `Já existe um cliente com esse nome: ${mesmoNome!.codigo} · ${mesmoNome!.nome}. Confira antes de cadastrar outro.`}</span>
          <Button size="sm" variant="outline" className="w-fit rounded-full" onClick={() => onAbrirExistente((existente ?? mesmoNome)!.id)}>
            Abrir a ficha existente
          </Button>
        </div>
      )}
      <Campo rotulo="Regime">
        {(id) => <CampoEscolha id={id} valor={r.regime} onMudar={(v) => setR((s) => ({ ...s, regime: v }))} opcoes={(['Simples Nacional', 'Lucro Presumido', 'Lucro Real', 'MEI', 'Pessoa física'] as const).map((x) => ({ valor: x, rotulo: x }))} />}
      </Campo>
      <Campo rotulo="Pacotes contratados" erro={erroPacote}>
        {() => <Fichas rotulo="Pacotes" valores={r.pacotes} onMudar={(v) => setR((s) => ({ ...s, pacotes: v }))} opcoes={(bpoPuro ? (['bpo'] as Pacote[]) : (['contabil', 'bpo'] as Pacote[])).map((p) => ({ valor: p, rotulo: rotuloPacote[p] }))} />}
      </Campo>
      {podeBpo && r.pacotes.includes('bpo') && (
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" className="accent-foreground size-4" checked={r.implantar} onChange={(ev) => setR((s) => ({ ...s, implantar: ev.target.checked }))} /> Já abrir a implantação do BPO (oito passos)
        </label>
      )}
    </GavetaFormulario>
  )
}

import { ArrowsClockwiseIcon, CheckIcon, EyeSlashIcon, FolderSimpleIcon, LinkIcon, MagnifyingGlassIcon, PlusIcon, ProhibitIcon, TrashIcon, XIcon } from '@phosphor-icons/react'
import { useMemo, useState } from 'react'
import { useLoja, useNavegacao, usePersistente } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import { Caixa, Numero, TituloBloco } from '@/components/compostos/blocos'
import { BarraLote, CaixaSelecao, EstadoErro, EstadoVazio, SeloDemonstracao, useSelecao, usePode } from '@/components/kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Campo, CampoEscolha, CampoTexto, GavetaFormulario } from '@/components/ui/formulario'
import { useConectores, type IdConector } from '@/dados/conectores'
import { CampoEscolha as Escolha } from '@/components/ui/formulario'
import {
  achadosDe,
  CHAVE_RAIOX,
  estadoRaioXInicial,
  estrutura,
  orgaos,
  padroes,
  porCliente,
  resumoDoEscritorio,
  rotuloTipoAchado,
  type Achado,
  type Decisao,
  type Dicionario,
  type EstadoRaioX,
} from '@/dados/raiox'
import { cn } from '@/lib/utils'
import { registrar } from '@/nucleo/repositorios'
import { servicos } from '@/servicos'
import { Ficha } from '../config/comum-s09'
import { MolduraTelaCheia } from '../config/telas-cheias'

type Aba = 'achados' | 'clientes' | 'estrutura' | 'padroes' | 'orgaos' | 'dicionario'

const rotuloDecisao = (d: Decisao | undefined, nomeCliente: (id: string) => string) =>
  !d ? 'aguardando você' : d === 'aprovado' ? 'sugestão aceita' : d === 'ignorado' ? 'ignorado' : d === 'ex_cliente' ? 'ex-cliente' : `ligar a ${nomeCliente(d.ligar)}`

/**
 * Raio-X do Drive (S09-T14; D-10): o Geral lê só a lista de pastas e
 * arquivos (nunca o conteúdo), monta o relatório e transforma cada achado em
 * item de aprovação em lote. Nada vale sem o sim do Administrador; os nomes
 * das pastas só aparecem para ele (LGPD), os outros veem as contagens.
 */
export function RaioXTela({ onFechar }: { onFechar: () => void }) {
  const loja = useLoja()
  const nav = useNavegacao()
  const { usuario } = useSessao()
  const podeRodar = usePode('raiox.rodar')
  const podeDecidir = usePode('raiox.decidir')
  const veNomes = usePode('raiox.ver_nomes')
  // S09b: o Raio-X lê qualquer armazenamento conectado (nuvens, servidor local, S3).
  const nuvens = useConectores().filter((c) => c.familia === 'nuvem')
  const [rx, setRx] = usePersistente<EstadoRaioX>(CHAVE_RAIOX, estadoRaioXInicial)
  const prontos = nuvens.filter((c) => c.funcionando)
  const [provedor, setProvedor] = useState<IdConector>((rx.provedor as IdConector | undefined) ?? prontos.find((c) => c.id === 'drive_antigo' || c.id === 'servidor_local')?.id ?? prontos[0]?.id ?? 'drive_antigo')
  const drive = nuvens.find((c) => c.id === provedor) ?? nuvens[0]
  const nomeOrigem = drive?.nome ?? 'Drive'
  const [fase, setFase] = useState<'parado' | 'lendo' | 'erro'>('parado')
  const [progresso, setProgresso] = useState({ lidas: 0, total: 1 })
  const [erro, setErro] = useState('')
  const [aba, setAba] = useState<Aba>('achados')
  const [ligando, setLigando] = useState<Achado | null>(null)
  const clientes = loja.clientes
  const achados = useMemo(() => achadosDe(clientes), [clientes])
  const resumo = resumoDoEscritorio()
  const sel = useSelecao(achados.filter((a) => !rx.decisoes[a.id]).map((a) => a.id))
  const nomeCliente = (id: string) => clientes.find((c) => c.id === id)?.nome ?? id
  const pendentes = achados.filter((a) => !rx.decisoes[a.id])

  const rodar = async () => {
    setFase('lendo')
    setErro('')
    loja.iniciarTrabalho(
      {
        id: `s09-raiox-${Date.now()}`,
        integrante: 'i-geral',
        setor: 'geral',
        titulo: `Raio-X de ${nomeOrigem}`,
        inicio: `Vou ler só a lista de pastas e arquivos de ${nomeOrigem}, sem abrir nenhum documento.`,
        etapas: ['Lendo a lista de pastas e arquivos', 'Casando pastas com clientes pelo CNPJ e pelo nome', 'Reconhecendo departamentos e órgãos', 'Comparando os padrões de nome', 'Montando os achados para você decidir'],
        seg: 1.1,
        fim: {
          texto: `Raio-X pronto: ${resumo.pastasCliente} pastas de cliente; ${resumo.casaram} casaram pelo CNPJ ou nome; ${resumo.semCliente} sem cliente; ${resumo.exClientes} parecem ex-clientes; Fiscal em ${resumo.padroesFiscal} padrões; ${resumo.mesesFora} pastas de mês fora do padrão. Nada muda sem o seu sim.`,
          cartoes: [{ tipo: 'aprovacao', id: 's09-raiox-lote', resumo: `Aceitar as ${achados.length} sugestões do Raio-X (${nomeOrigem})`, argumentos: [{ rotulo: 'Ligar a clientes', valor: String(achados.filter((a) => a.cliente_id).length) }, { rotulo: 'Ex-clientes', valor: String(achados.filter((a) => a.tipo === 'ex_cliente').length) }, { rotulo: 'Padrões e dicionário', valor: String(achados.filter((a) => ['padrao', 'mes_fora', 'departamento', 'orgao'].includes(a.tipo)).length) }], lote: achados.length, expiraEm: 'expira em 7 dias' }],
          aviso: `Raio-X de ${nomeOrigem} pronto para decidir`,
        },
      },
      { origem: 'Raio-X das pastas' },
    )
    try {
      await servicos.arvore.ler(provedor === 'servidor_local' ? 'pastas compartilhadas do agente' : 'Clientes', (lidas, total) => setProgresso({ lidas, total }), provedor)
      setRx((x) => ({ ...x, rodado_em: new Date().toISOString(), decisoes: {}, aplicado_em: null, provedor }))
      registrar(`${usuario.nome} rodou o Raio-X em ${nomeOrigem} (só a lista de pastas e arquivos)`, 'raiox.rodar')
      setFase('parado')
    } catch (e) {
      setFase('erro')
      setErro(e instanceof Error ? e.message : 'A leitura das pastas não respondeu.')
    }
  }

  const decidir = (ids: string[], d: Decisao | ((a: Achado) => Decisao)) => {
    setRx((x) => ({ ...x, decisoes: { ...x.decisoes, ...Object.fromEntries(ids.map((id) => [id, typeof d === 'function' ? d(achados.find((a) => a.id === id)!) : d])) } }))
    sel.limpar()
  }
  const sugestaoDe = (a: Achado): Decisao => (a.tipo === 'ex_cliente' ? 'ex_cliente' : a.tipo === 'ignorar' ? 'ignorado' : 'aprovado')

  const aplicar = () => {
    const n = Object.keys(rx.decisoes).length
    setRx((x) => ({ ...x, aplicado_em: new Date().toISOString() }))
    registrar(`${usuario.nome} aplicou ${n} decisões do Raio-X (${nomeOrigem})`, 'raiox.decidir')
    loja.toast(`${n} decisões aplicadas: o mapeamento das pastas passa a valer e os arquivos entram na árvore.`, { modulo: 'arquivos', aba: 'pastas' }, 'Ver em Arquivos')
  }

  return (
    <MolduraTelaCheia titulo="Raio-X das pastas" sub={`${nomeOrigem} · lê só os nomes de pastas e arquivos, nunca o conteúdo (D-10)`} onFechar={onFechar} acao={<SeloDemonstracao fonte={`${nomeOrigem} (só a lista)`} className="hidden sm:inline-flex" />}>
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
        {!rx.rodado_em || fase !== 'parado' ? (
          <Caixa className="items-start">
            <TituloBloco descricao="O Geral percorre as pastas de todos os clientes no armazenamento escolhido (Google Drive, OneDrive/SharePoint, Dropbox, Box, servidor local, S3), casa cada uma com o cadastro e aponta o que precisa de decisão. Ele não abre nenhum documento e não muda nada na origem.">Diagnóstico das pastas</TituloBloco>
            {fase !== 'lendo' && nuvens.length > 0 && (
              <span className="w-full max-w-sm">
                <Escolha rotulo="Onde ler" valor={provedor} onMudar={setProvedor} opcoes={nuvens.map((c) => ({ valor: c.id, rotulo: `${c.nome}${c.funcionando ? '' : ` · ${c.rotulo.toLowerCase()}`}` }))} />
              </span>
            )}
            {!drive?.funcionando ? (
              <EstadoErro titulo={`${nomeOrigem} não está conectado`} descricao={drive?.frase} onTentar={() => (onFechar(), nav.irPara({ modulo: 'config', aba: 'armazenamento' }))} />
            ) : fase === 'erro' ? (
              <EstadoErro titulo="A leitura parou" descricao={erro} onTentar={() => void rodar()} />
            ) : fase === 'lendo' ? (
              <div className="flex w-full flex-col gap-2" role="status">
                <span className="text-sm">
                  Lendo a lista… {progresso.lidas.toLocaleString('pt-BR')} de {progresso.total.toLocaleString('pt-BR')} itens
                </span>
                <span className="bg-sunken h-2 w-full overflow-hidden rounded-full">
                  <span className="bg-foreground/70 block h-full rounded-full transition-[width]" style={{ width: `${(progresso.lidas / progresso.total) * 100}%` }} />
                </span>
                <span className="text-muted-foreground text-xs">Acompanhe o Geral em Início › Time: ele avisa quando terminar e deixa o cartão em lote.</span>
              </div>
            ) : podeRodar ? (
              <Button className="rounded-full" onClick={() => void rodar()}>
                <MagnifyingGlassIcon /> Rodar diagnóstico
              </Button>
            ) : (
              <p className="text-muted-foreground text-sm">Só o Administrador roda o Raio-X.</p>
            )}
          </Caixa>
        ) : (
          <>
            <Caixa>
              <TituloBloco
                descricao={`Rodado em ${new Date(rx.rodado_em).toLocaleString('pt-BR')} · ${resumo.itensLidos.toLocaleString('pt-BR')} itens lidos${rx.aplicado_em ? ` · aplicado em ${new Date(rx.aplicado_em).toLocaleString('pt-BR')}` : ''}`}
                acao={
                  podeRodar && (
                    <Button size="sm" variant="ghost" className="rounded-full" onClick={() => void rodar()}>
                      <ArrowsClockwiseIcon /> Rodar de novo
                    </Button>
                  )
                }
              >
                Resumo
              </TituloBloco>
              <p className="text-sm">
                {resumo.pastasCliente} pastas de cliente; {resumo.casaram} casaram pelo CNPJ ou nome; {resumo.semCliente} sem cliente; {resumo.exClientes} parecem ex-clientes; Fiscal em {resumo.padroesFiscal} padrões; {resumo.mesesFora} pastas de mês fora do padrão.
              </p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Numero valor={resumo.casaram} rotulo="casaram com clientes" />
                <Numero valor={resumo.semCliente} rotulo="sem cliente" />
                <Numero valor={resumo.exClientes} rotulo="parecem ex-clientes" />
                <Numero valor={pendentes.length} rotulo="achados aguardando você" />
              </div>
            </Caixa>
            <nav aria-label="Partes do relatório" className="flex flex-wrap gap-1.5">
              {(
                [
                  ['achados', `Achados · ${pendentes.length}`],
                  ['clientes', 'Por cliente'],
                  ['estrutura', 'Estrutura'],
                  ['padroes', 'Padrões'],
                  ['orgaos', 'Órgãos'],
                  ['dicionario', 'Dicionário'],
                ] as [Aba, string][]
              ).map(([id, r]) => (
                <Ficha key={id} ativo={aba === id} onClick={() => setAba(id)}>
                  {r}
                </Ficha>
              ))}
            </nav>

            {aba === 'achados' && (
              <Caixa>
                <TituloBloco
                  descricao="Marque vários e decida de uma vez. Cada decisão fica registrada; o mapeamento só vale quando você aplicar."
                  acao={
                    podeDecidir && (
                      <Button size="sm" className="rounded-full" disabled={!Object.keys(rx.decisoes).length || !!rx.aplicado_em} onClick={aplicar}>
                        <CheckIcon /> Aplicar decisões
                      </Button>
                    )
                  }
                >
                  Achados para decidir
                </TituloBloco>
                {podeDecidir && pendentes.length > 0 && (
                  <label className="text-muted-foreground flex items-center gap-2 text-xs">
                    <CaixaSelecao marcado={sel.todos} parcial={sel.algum} onMudar={() => sel.alternarTodos()} rotulo="Marcar todos os pendentes" /> marcar todos os pendentes
                  </label>
                )}
                <ul className="divide-border/70 flex flex-col divide-y">
                  {achados.map((a) => {
                    const d = rx.decisoes[a.id]
                    return (
                      <li key={a.id} data-achado={a.id} className={cn('flex flex-wrap items-center gap-x-3 gap-y-2 py-3', d && 'opacity-70')}>
                        {podeDecidir && !d ? <CaixaSelecao marcado={sel.marcado(a.id)} onMudar={(intervalo) => sel.alternar(a.id, intervalo)} rotulo={`Marcar ${a.pasta}`} /> : <span className="w-[18px]" />}
                        <FolderSimpleIcon className="text-muted-foreground size-5 shrink-0" weight="duotone" />
                        <span className="min-w-0 flex-1 basis-64">
                          <span className="flex flex-wrap items-center gap-1.5 text-sm">
                            <Badge variant="outline">{rotuloTipoAchado[a.tipo]}</Badge>
                            {veNomes || !a.cliente_id ? <span className="font-medium break-all">{a.pasta}</span> : <span className="text-muted-foreground flex items-center gap-1"><EyeSlashIcon className="size-3.5" /> nome oculto (só o Administrador vê)</span>}
                          </span>
                          <span className="block text-xs">Sugestão: {veNomes || !a.cliente_id ? a.sugestao : 'ligar a um cliente'}</span>
                          <span className="text-muted-foreground block text-xs">
                            {a.detalhe}
                            {a.pastas > 1 ? ` · ${a.pastas} pastas` : ''}
                          </span>
                        </span>
                        <Badge variant={!d ? 'destaque' : d === 'ignorado' ? 'outline' : 'sucesso'}>{rotuloDecisao(d, nomeCliente)}</Badge>
                        {podeDecidir && !rx.aplicado_em && (
                          <span className="flex flex-wrap gap-1">
                            {!d ? (
                              <>
                                <Button size="sm" variant="outline" className="rounded-full" onClick={() => decidir([a.id], sugestaoDe(a))}>
                                  <CheckIcon /> Aceitar
                                </Button>
                                {(a.tipo === 'sem_cliente' || a.tipo === 'ex_cliente') && (
                                  <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setLigando(a)}>
                                    <LinkIcon /> Ligar a…
                                  </Button>
                                )}
                                <Button size="sm" variant="ghost" className="rounded-full" onClick={() => decidir([a.id], 'ignorado')}>
                                  Ignorar
                                </Button>
                              </>
                            ) : (
                              <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setRx((x) => ({ ...x, decisoes: Object.fromEntries(Object.entries(x.decisoes).filter(([k]) => k !== a.id)) }))}>
                                Desfazer
                              </Button>
                            )}
                          </span>
                        )}
                      </li>
                    )
                  })}
                </ul>
                <BarraLote
                  selecao={sel}
                  nome={['achado', 'achados']}
                  acoes={[
                    { rotulo: 'Aceitar sugestões', icone: <CheckIcon />, onExecutar: (ids) => decidir(ids, sugestaoDe) },
                    { rotulo: 'Marcar ex-cliente', icone: <ProhibitIcon />, onExecutar: (ids) => decidir(ids, 'ex_cliente') },
                    { rotulo: 'Ignorar', icone: <XIcon />, onExecutar: (ids) => decidir(ids, 'ignorado') },
                  ]}
                />
              </Caixa>
            )}

            {aba === 'clientes' && (
              <Caixa>
                <TituloBloco descricao="Que departamentos cada pasta tem. Sem pasta: o integrante cria pela árvore-modelo quando você aceitar.">Por cliente</TituloBloco>
                {clientes.length === 0 ? (
                  <EstadoVazio titulo="Nenhum cliente cadastrado" descricao="Importe os clientes no passo 4 da implantação." compacto />
                ) : (
                  <div className="-mx-1 overflow-x-auto px-1">
                    <table className="w-full min-w-[560px] text-sm">
                      <thead>
                        <tr className="text-muted-foreground text-left text-xs">
                          <th className="py-1.5 font-normal">Cliente</th>
                          <th className="font-normal">Casou por</th>
                          <th className="font-normal">Contábil</th>
                          <th className="font-normal">Fiscal</th>
                          <th className="font-normal">Pessoal</th>
                          <th className="font-normal">Legalização</th>
                        </tr>
                      </thead>
                      <tbody>
                        {porCliente(clientes).map((l) => (
                          <tr key={l.cliente.id} className="border-border/70 border-t">
                            <td className="py-1.5">{veNomes ? l.cliente.nome : `Cliente ${l.cliente.id.replace(/\D/g, '')}`}</td>
                            <td>{l.casouPor ?? <span className="text-destructive">sem pasta</span>}</td>
                            {[l.contabil, l.fiscal, l.pessoal, l.legalizacao].map((v, i) => (
                              <td key={i}>{v ? 'tem' : <span className="text-muted-foreground">não tem</span>}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Caixa>
            )}

            {aba === 'estrutura' && (
              <Caixa>
                <TituloBloco descricao="Como cada departamento está organizado hoje, em % das pastas de cliente.">Estrutura por departamento</TituloBloco>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {estrutura.map((e) => (
                    <li key={e.depto} className="bg-sunken/50 flex flex-col gap-1.5 rounded-[14px] p-3">
                      <span className="text-sm font-medium">{e.depto}</span>
                      {e.jeitos.map(([j, pct]) => (
                        <span key={j} className="flex flex-col gap-0.5 text-xs">
                          <span className="flex justify-between gap-2">
                            <code>{j}</code>
                            <span className="tabular-nums">{pct}%</span>
                          </span>
                          <span className="bg-sunken h-1.5 overflow-hidden rounded-full">
                            <span className="bg-foreground/60 block h-full rounded-full" style={{ width: `${pct}%` }} />
                          </span>
                        </span>
                      ))}
                    </li>
                  ))}
                </ul>
              </Caixa>
            )}

            {aba === 'padroes' && (
              <Caixa>
                <TituloBloco descricao="Nomes de pasta que se repetem entre os clientes.">Padrões</TituloBloco>
                <ul className="divide-border/70 flex flex-col divide-y text-sm">
                  {padroes.map((p) => (
                    <li key={p.nome} className="flex justify-between gap-3 py-2">
                      <code>{p.nome}</code>
                      <span className="text-muted-foreground tabular-nums">{p.pastas.toLocaleString('pt-BR')} pastas</span>
                    </li>
                  ))}
                </ul>
              </Caixa>
            )}

            {aba === 'orgaos' && (
              <Caixa>
                <TituloBloco descricao="Pastas reconhecidas como de um órgão (pelo dicionário).">Órgãos</TituloBloco>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {orgaos.map((o) => (
                    <li key={o.nome} className="bg-sunken/50 flex justify-between gap-3 rounded-[12px] px-3 py-2 text-sm">
                      {o.nome} <span className="text-muted-foreground tabular-nums">{o.pastas}</span>
                    </li>
                  ))}
                </ul>
              </Caixa>
            )}

            {aba === 'dicionario' && <DicionarioEditavel d={rx.dicionario} podeEditar={podeDecidir} onMudar={(dicionario) => setRx((x) => ({ ...x, dicionario }))} />}
          </>
        )}
      </div>
      {ligando && (
        <LigarCliente
          a={ligando}
          clientes={clientes}
          onFechar={() => setLigando(null)}
          onLigar={(id) => {
            decidir([ligando.id], { ligar: id })
            setLigando(null)
          }}
        />
      )}
    </MolduraTelaCheia>
  )
}

function LigarCliente({ a, clientes, onFechar, onLigar }: { a: Achado; clientes: { id: string; nome: string; codigo: string }[]; onFechar: () => void; onLigar: (id: string) => void }) {
  const [id, setId] = useState(a.cliente_id ?? clientes[0]?.id ?? '')
  return (
    <GavetaFormulario aberta onFechar={onFechar} titulo="Ligar a um cliente" descricao={`A pasta “${a.pasta}” passa a ser a pasta do cliente escolhido quando você aplicar.`} acao="Ligar" acaoDesabilitada={!id} onAcao={() => onLigar(id)}>
      <Campo rotulo="Cliente">{(cid) => <CampoEscolha id={cid} valor={id} onMudar={setId} opcoes={clientes.map((c) => ({ valor: c.id, rotulo: `${c.codigo} · ${c.nome}` }))} />}</Campo>
    </GavetaFormulario>
  )
}

/** Dicionário de departamentos e órgãos (S09-A98): cada sinônimo vira o nome padrão. */
function DicionarioEditavel({ d, podeEditar, onMudar }: { d: Dicionario; podeEditar: boolean; onMudar: (d: Dicionario) => void }) {
  const [novo, setNovo] = useState<{ grupo: keyof Dicionario; nome: string } | null>(null)
  const [texto, setTexto] = useState('')
  const grupos: [keyof Dicionario, string][] = [
    ['departamentos', 'Departamentos'],
    ['orgaos', 'Órgãos'],
  ]
  return (
    <Caixa>
      <TituloBloco descricao="O que o Raio-X e a captura entendem como o mesmo departamento ou órgão. Vale para as próximas leituras e para os arquivos que chegarem.">Dicionário</TituloBloco>
      <div className="grid gap-4 md:grid-cols-2">
        {grupos.map(([g, rotulo]) => (
          <div key={g} className="flex flex-col gap-2">
            <span className="text-sm font-medium">{rotulo}</span>
            {d[g].map((item) => (
              <div key={item.nome} className="bg-sunken/50 flex flex-col gap-1.5 rounded-[12px] p-2.5">
                <span className="flex items-center justify-between gap-2 text-sm">
                  {item.nome}
                  {podeEditar && (
                    <Button size="sm" variant="ghost" className="h-7 rounded-full" onClick={() => (setNovo({ grupo: g, nome: item.nome }), setTexto(''))}>
                      <PlusIcon /> Sinônimo
                    </Button>
                  )}
                </span>
                <span className="flex flex-wrap gap-1">
                  {item.sinonimos.map((s) => (
                    <span key={s} className="bg-raised shadow-contorno flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px]">
                      {s}
                      {podeEditar && (
                        <button type="button" aria-label={`Tirar ${s}`} className="cursor-pointer" onClick={() => onMudar({ ...d, [g]: d[g].map((x) => (x.nome === item.nome ? { ...x, sinonimos: x.sinonimos.filter((y) => y !== s) } : x)) })}>
                          <TrashIcon className="size-3" />
                        </button>
                      )}
                    </span>
                  ))}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
      {novo && (
        <GavetaFormulario
          aberta
          onFechar={() => setNovo(null)}
          titulo={`Sinônimo de ${novo.nome}`}
          descricao="Pastas com este nome passam a ser entendidas como este departamento ou órgão."
          acao="Adicionar"
          acaoDesabilitada={!texto.trim()}
          onAcao={() => {
            onMudar({ ...d, [novo.grupo]: d[novo.grupo].map((x) => (x.nome === novo.nome ? { ...x, sinonimos: [...new Set([...x.sinonimos, texto.trim()])] } : x)) })
            setNovo(null)
          }}
        >
          <Campo rotulo="Nome como aparece nas pastas">{(id) => <CampoTexto id={id} valor={texto} onMudar={setTexto} />}</Campo>
        </GavetaFormulario>
      )}
    </Caixa>
  )
}

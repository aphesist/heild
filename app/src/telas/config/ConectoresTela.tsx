import {
  ArrowClockwiseIcon,
  ArrowsClockwiseIcon,
  CertificateIcon,
  CheckCircleIcon,
  ClockCounterClockwiseIcon,
  KeyIcon,
  LinkIcon,
  LockKeyIcon,
  PlugsConnectedIcon,
  PlusIcon,
  ProhibitIcon,
  ShieldCheckIcon,
  SpinnerIcon,
  WarningIcon,
  XCircleIcon,
} from '@phosphor-icons/react'
import { useMemo, useState } from 'react'
import { useLoja, usePersistente } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import { BarraUso, Caixa, Numero, TituloBloco } from '@/components/compostos/blocos'
import { BotaoAcoes, Carregando, EstadoErro, EstadoVazio, SeloDemonstracao, useConfirmar, usePode } from '@/components/kit'
import { AreaRolagem } from '@/components/ui/area-rolagem'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Campo, CampoEscolha, CampoTexto, GavetaFormulario, Interruptor } from '@/components/ui/formulario'
import {
  auditoria,
  coberturaDe,
  credenciaisIniciais,
  custoPorCliente,
  custosIniciais,
  diasAte,
  rotinasIniciais,
  rotuloCaminho,
  rotuloTipoCredencial,
  situacaoPelaValidade,
  tetoInicial,
  usosDe,
  type Credencial,
  type Rotina,
  type TipoCredencial,
} from '@/dados/cofre'
import { catalogoConectores, definirEstadoConector, rotuloFamilia, useConectores, type EstadoConexao, type FamiliaConector, type IdConector, type SaudeConector } from '@/dados/conectores'
import { rotuloSetor } from '@/dados/crm'
import { cn } from '@/lib/utils'
import { registrar } from '@/nucleo/repositorios'
import { servicos, ErroServico, type ResultadoTeste } from '@/servicos'
import { CabecalhoConfig } from './EscritorioTela'
import { Ficha, reais, SeloEstado, tempoRelativo, useCarregandoInicial } from './comum-s09'

type Secao = 'conexoes' | 'cofre' | 'rotinas' | 'custo' | 'cobertura' | 'auditoria'
const secoes: { id: Secao; rotulo: string }[] = [
  { id: 'conexoes', rotulo: 'Conexões' },
  { id: 'cofre', rotulo: 'Cofre' },
  { id: 'rotinas', rotulo: 'Saúde das rotinas' },
  { id: 'custo', rotulo: 'Custo e teto' },
  { id: 'cobertura', rotulo: 'Cobertura por cliente' },
  { id: 'auditoria', rotulo: 'Auditoria mensal' },
]

const rotuloModo: Record<string, string> = { agente: 'agente no servidor', termo: 'termo do Integra', certificado: 'certificado', oauth: 'autorização (OAuth)', token: 'token', robo: 'robô com login', arquivo: 'arquivo', chave: 'chave de acesso' }

/** Estado que o teste devolve → estado do conector. */
const estadoDoTeste: Record<ResultadoTeste, EstadoConexao> = { ok: 'ativo', erro_credencial: 'erro_credencial', certificado_vencido: 'certificado_vencido', fora_do_ar: 'fora_do_ar', limite: 'limite', captcha: 'captcha', timeout: 'timeout' }

/**
 * Configurações › Conectores e cofre (S09-T09; 03, ad. 17; 08, 2, 3, 5 e 10;
 * D-38). As conexões por família com a saúde de cada uma (contrato C9), o
 * cofre de credenciais (nunca o segredo), a saúde das rotinas, o custo do mês
 * com teto, a cobertura por cliente e a auditoria mensal. Tudo simulado.
 */
export function ConectoresTela() {
  const carregando = useCarregandoInicial()
  const [secao, setSecao] = usePersistente<Secao>('s09:conectores:secao', 'conexoes')
  const conectores = useConectores()
  const [creds] = usePersistente<Credencial[]>('s09:cofre:credenciais', credenciaisIniciais)
  const [rotinas] = usePersistente<Rotina[]>('s09:conectores:rotinas', rotinasIniciais)
  const [teto] = usePersistente<number>('s09:conectores:teto', tetoInicial)
  const custos = custosIniciais()
  const total = custos.reduce((s, c) => s + c.valor, 0)
  const ativos = conectores.filter((c) => c.funcionando).length
  const precisam = conectores.filter((c) => c.precisaDePessoa).length
  const paradas = rotinas.filter((r) => r.situacao !== 'ok').length
  const achados = auditoria(creds).length

  return (
    <AreaRolagem className="h-full px-3 pb-10 sm:px-5">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 pt-1 ultra:max-w-[1600px]">
        <CabecalhoConfig titulo="Conectores e cofre" sub="Conexões, credenciais, saúde e custo. Nesta demonstração, nada sai do navegador." acao={<SeloDemonstracao fonte="Conectores e cofre" />} />
        {carregando ? (
          <Carregando rotulo="Lendo os conectores" linhas={4} />
        ) : (
          <>
            <Caixa className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Numero valor={`${ativos}/${conectores.filter((c) => c.estado !== 'desconectado').length}`} rotulo="conexões funcionando" />
              <Numero valor={precisam} rotulo="precisam de alguém" detalhe={precisam ? 'credencial, certificado ou CAPTCHA' : 'nada pendente'} />
              <Numero valor={reais(total)} rotulo="custo do mês" detalhe={`teto ${reais(teto)}`} />
              <Numero valor={paradas} rotulo="rotinas com problema" detalhe={achados ? `${achados} achado(s) na auditoria` : undefined} />
            </Caixa>
            <nav aria-label="Seções" className="flex flex-wrap gap-1.5">
              {secoes.map((s) => (
                <Ficha key={s.id} ativo={secao === s.id} onClick={() => setSecao(s.id)}>
                  {s.rotulo}
                  {s.id === 'auditoria' && achados > 0 && ` · ${achados}`}
                  {s.id === 'rotinas' && paradas > 0 && ` · ${paradas}`}
                </Ficha>
              ))}
            </nav>
            {secao === 'conexoes' && <Conexoes conectores={conectores} />}
            {secao === 'cofre' && <Cofre />}
            {secao === 'rotinas' && <Rotinas />}
            {secao === 'custo' && <Custo />}
            {secao === 'cobertura' && <CoberturaClientes />}
            {secao === 'auditoria' && <Auditoria onIr={setSecao} />}
          </>
        )}
      </div>
    </AreaRolagem>
  )
}

/* ---------- Conexões ---------- */

function Conexoes({ conectores }: { conectores: SaudeConector[] }) {
  const [familia, setFamilia] = useState<FamiliaConector | 'todas' | 'problema'>('todas')
  const [conectando, setConectando] = useState<SaudeConector | null>(null)
  const [testando, setTestando] = useState<{ id: IdConector; etapa: string } | null>(null)
  const loja = useLoja()
  const { usuario } = useSessao()
  const confirmar = useConfirmar()
  const pode = usePode('conector.configurar')
  const familias = [...new Set(catalogoConectores.map((c) => c.familia))] as FamiliaConector[]
  const lista = conectores.filter((c) => (familia === 'todas' ? true : familia === 'problema' ? c.tom === 'erro' || c.tom === 'atencao' : c.familia === familia))

  const testar = async (c: SaudeConector) => {
    setTestando({ id: c.id, etapa: 'Começando' })
    try {
      // O teste reproduz o estado atual quando ele é um erro (o painel Demonstração o liga).
      const forcar = (Object.entries(estadoDoTeste).find(([, e]) => e === c.estado && e !== 'ativo')?.[0] as ResultadoTeste | undefined) ?? undefined
      const r = await servicos.conectores.testar(c.id, { forcar, aoEtapa: (etapa) => setTestando({ id: c.id, etapa }) })
      definirEstadoConector(c.id, { estado: estadoDoTeste[r.dados.resultado], ultima_execucao: new Date().toISOString(), ...(r.dados.resultado === 'ok' ? { erros: 0, mensagem: undefined } : {}) })
      registrar(`${usuario.nome} testou ${c.nome}: ${r.dados.detalhe}`, 'conector.testar')
      if (r.dados.resultado === 'ok') loja.toast(`${c.nome}: ${r.dados.detalhe}`)
      else loja.toastErro(`${c.nome}: ${r.dados.detalhe}`)
    } catch (e) {
      loja.toastErro(e instanceof ErroServico ? e.message : 'O teste não respondeu. Tente de novo.')
    } finally {
      setTestando(null)
    }
  }

  const desconectar = async (c: SaudeConector) => {
    const ok = await confirmar({ titulo: `Desconectar ${c.nome}?`, descricao: 'As rotinas que usam este conector param e o setor é avisado. A credencial continua no cofre até ser revogada.', acao: 'Desconectar', perigo: true })
    if (!ok) return
    definirEstadoConector(c.id, { estado: 'desconectado', fila: 0 })
    registrar(`${usuario.nome} desconectou ${c.nome}`, 'conector.configurar')
    loja.toastDesfazer(`${c.nome} desconectado.`, () => definirEstadoConector(c.id, { estado: c.estado, fila: c.fila }))
  }

  return (
    <>
      <div className="flex flex-wrap gap-1.5">
        <Ficha ativo={familia === 'todas'} onClick={() => setFamilia('todas')}>
          Todas
        </Ficha>
        <Ficha ativo={familia === 'problema'} onClick={() => setFamilia('problema')}>
          Com problema
        </Ficha>
        {familias.map((f) => (
          <Ficha key={f} ativo={familia === f} onClick={() => setFamilia(f)}>
            {rotuloFamilia[f]}
          </Ficha>
        ))}
      </div>
      {lista.length === 0 && <EstadoVazio icone={CheckCircleIcon} titulo="Nada com problema" descricao="Todas as conexões estão funcionando." />}
      {familias
        .filter((f) => lista.some((c) => c.familia === f))
        .map((f) => (
          <Caixa key={f}>
            <TituloBloco>{rotuloFamilia[f]}</TituloBloco>
            <ul className="divide-border/70 flex flex-col divide-y">
              {lista
                .filter((c) => c.familia === f)
                .map((c) => (
                  <li key={c.id} data-conector={c.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3">
                    <PlugsConnectedIcon className="text-muted-foreground size-5 shrink-0" weight="duotone" />
                    <span className="min-w-0 flex-1 basis-56">
                      <span className="flex flex-wrap items-center gap-1.5 text-sm font-medium">
                        {c.nome}
                        <SeloEstado tom={c.tom}>{c.rotulo}</SeloEstado>
                        {c.pago && <Badge variant="outline">pago por consulta</Badge>}
                      </span>
                      <span className="text-muted-foreground block text-xs">
                        {c.para} · {rotuloModo[c.modo]} · {c.api}
                      </span>
                      {c.estado !== 'desconectado' && (
                        <span className="text-muted-foreground block text-xs">
                          última execução {tempoRelativo(c.ultima_execucao)} · fila {c.fila} · erros {c.erros}
                        </span>
                      )}
                      {c.tom !== 'ok' && c.estado !== 'desconectado' && (
                        <span className={cn('mt-0.5 flex items-start gap-1 text-xs', c.tom === 'erro' ? 'text-destructive' : 'text-foreground')}>
                          <WarningIcon className="mt-0.5 size-3.5 shrink-0" /> {c.frase}
                        </span>
                      )}
                      {testando?.id === c.id && (
                        <span className="text-muted-foreground mt-0.5 flex items-center gap-1 text-xs" role="status">
                          <SpinnerIcon className="size-3.5 animate-spin" /> {testando.etapa}…
                        </span>
                      )}
                    </span>
                    {pode && (
                      <span className="flex flex-wrap items-center gap-1">
                        {c.estado === 'desconectado' ? (
                          <Button size="sm" className="rounded-full" onClick={() => setConectando(c)}>
                            <LinkIcon /> Conectar
                          </Button>
                        ) : (
                          <>
                            <Button size="sm" variant="outline" className="rounded-full" disabled={!!testando} onClick={() => void testar(c)}>
                              <ArrowsClockwiseIcon /> Testar
                            </Button>
                            {c.precisaDePessoa && (
                              <Button size="sm" className="rounded-full" onClick={() => setConectando(c)}>
                                {c.estado === 'captcha' ? 'Resolver CAPTCHA' : 'Reconectar'}
                              </Button>
                            )}
                            <BotaoAcoes
                              acoes={[
                                { rotulo: 'Conectar de novo', icone: <LinkIcon />, onSelecionar: () => setConectando(c) },
                                ...(c.estado === 'pausado_teto' ? [{ rotulo: 'Retomar (ignorar o teto hoje)', icone: <ArrowClockwiseIcon />, onSelecionar: () => definirEstadoConector(c.id, { estado: 'ativo' }) }] : []),
                                { rotulo: 'Desconectar', icone: <XCircleIcon />, perigo: true, separar: true, onSelecionar: () => void desconectar(c) },
                              ]}
                            />
                          </>
                        )}
                      </span>
                    )}
                  </li>
                ))}
            </ul>
          </Caixa>
        ))}
      {conectando && <Conectar c={conectando} onFechar={() => setConectando(null)} />}
    </>
  )
}

/** Gaveta de conexão, por modo (08, 2.2): termo do Integra, OAuth, token, certificado, robô, arquivo, chave. */
function Conectar({ c, onFechar }: { c: SaudeConector; onFechar: () => void }) {
  const loja = useLoja()
  const { usuario } = useSessao()
  const [creds, setCreds] = usePersistente<Credencial[]>('s09:cofre:credenciais', credenciaisIniciais)
  const [segredo, setSegredo] = useState('')
  const [usuarioPortal, setUsuarioPortal] = useState('')
  const [termoAssinado, setTermoAssinado] = useState(false)
  const certificados = creds.filter((x) => (x.tipo === 'ecnpj_escritorio' || x.tipo === 'a1_cliente') && x.situacao !== 'revogada')
  const [certificado, setCertificado] = useState(certificados[0]?.id ?? '')
  const [captcha, setCaptcha] = useState('')
  const [estado, setEstado] = useState<'pronto' | 'conectando' | 'erro'>('pronto')
  const [erro, setErro] = useState('')

  const ok =
    c.estado === 'captcha'
      ? captcha.trim().length >= 4
      : c.modo === 'termo'
        ? termoAssinado
        : c.modo === 'oauth'
          ? true
          : c.modo === 'certificado'
            ? !!certificado
            : c.modo === 'robo'
              ? usuarioPortal.trim() && segredo.trim()
              : c.modo === 'arquivo' || c.modo === 'agente'
                ? true
                : segredo.trim().length >= 8

  const conectar = async () => {
    setEstado('conectando')
    try {
      const r = await servicos.conectores.conectar(c.id, c.modo)
      if (c.modo === 'token' || c.modo === 'robo' || c.modo === 'chave') {
        const ref = await servicos.cofre.guardar({ tipo: c.modo, titular: c.nome })
        const tipo: TipoCredencial = c.modo === 'robo' ? 'senha_portal' : c.modo === 'chave' ? 'chave_nuvem' : 'token_api'
        const existente = creds.find((x) => x.servicos.includes(c.id) && x.tipo === tipo)
        if (existente) setCreds((xs) => xs.map((x) => (x.id === existente.id ? { ...x, ref: ref.dados.ref, impressao: ref.dados.impressao, rotacionada_em: new Date().toLocaleDateString('pt-BR'), ultimo_uso: 'agora', situacao: 'ativa' } : x)))
        else setCreds((xs) => [...xs, { id: `cr${Date.now()}`, tipo, titular: c.nome, servicos: [c.id], ref: ref.dados.ref, impressao: ref.dados.impressao, ultimo_uso: 'agora', usos_mes: 0, compartilhada_com: [], termo: true, situacao: 'ativa', rotacionada_em: new Date().toLocaleDateString('pt-BR') }])
      }
      definirEstadoConector(c.id, { estado: c.id === 'drive_antigo' ? 'somente_leitura' : 'ativo', ultima_execucao: new Date().toISOString(), erros: 0, mensagem: undefined })
      registrar(`${usuario.nome} conectou ${c.nome} (${rotuloModo[c.modo]}: ${r.dados.conta})`, 'conector.configurar')
      loja.toast(`${c.nome} conectado. As rotinas voltam a rodar na próxima janela.`)
      onFechar()
    } catch (e) {
      setEstado('erro')
      setErro(e instanceof Error ? e.message : 'Não foi possível conectar.')
    }
  }

  return (
    <GavetaFormulario
      aberta
      largura="lg"
      onFechar={onFechar}
      titulo={c.estado === 'captcha' ? `CAPTCHA · ${c.nome}` : `Conectar ${c.nome}`}
      descricao={`${c.para}. Modo: ${rotuloModo[c.modo]}. O segredo vai direto ao cofre e nunca aparece de novo na tela.`}
      acao={estado === 'conectando' ? 'Conectando…' : c.estado === 'captcha' ? 'Enviar e seguir' : 'Conectar'}
      acaoDesabilitada={!ok || estado === 'conectando'}
      onAcao={() => void conectar()}
    >
      {estado === 'erro' && <EstadoErro titulo="Não conectou" descricao={erro} onTentar={() => void conectar()} />}
      {c.estado === 'captcha' ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm">O portal pediu uma verificação humana. A rotina fica esperando; quando você responder, ela segue de onde parou.</p>
          <div className="bg-sunken flex h-16 items-center justify-center rounded-[12px] font-mono text-2xl tracking-[0.4em] select-none" aria-label="Imagem do CAPTCHA (simulada)">
            7KQ2M
          </div>
          <Campo rotulo="O que aparece na imagem" ajuda="Na demonstração, qualquer texto com 4 letras ou mais segue.">
            {(id) => <CampoTexto id={id} valor={captcha} onMudar={setCaptcha} mono />}
          </Campo>
        </div>
      ) : c.modo === 'termo' ? (
        <ol className="flex flex-col gap-3 text-sm">
          <li className="flex gap-2">
            <span className="bg-sunken flex size-6 shrink-0 items-center justify-center rounded-full text-xs">1</span>
            <span>
              Baixe o termo de autorização do Integra Contador já preenchido com o CNPJ do escritório.{' '}
              <Button type="button" size="sm" variant="link" className="h-auto p-0" onClick={() => loja.toast('Termo de autorização baixado (demonstração).')}>
                Baixar termo
              </Button>
            </span>
          </li>
          <li className="flex gap-2">
            <span className="bg-sunken flex size-6 shrink-0 items-center justify-center rounded-full text-xs">2</span>
            <span>Assine com o e-CNPJ do escritório no portal da Receita (área de autorizações do SERPRO).</span>
          </li>
          <li className="flex gap-2">
            <span className="bg-sunken flex size-6 shrink-0 items-center justify-center rounded-full text-xs">3</span>
            <Interruptor ligado={termoAssinado} onMudar={setTermoAssinado} rotulo="Já assinei o termo" detalhe="A Heild confere a assinatura antes de pedir o primeiro token." />
          </li>
        </ol>
      ) : c.modo === 'oauth' ? (
        <div className="flex flex-col gap-2 text-sm">
          <p>Ao conectar, abre a tela do provedor para você autorizar. A Heild pede só o que precisa:</p>
          <ul className="text-muted-foreground list-disc pl-5">
            {c.id === 'email' ? (
              <>
                <li>ler a caixa de entrada, os enviados e os anexos (o integrante lê tudo para organizar)</li>
                <li>enviar em nome do escritório só o que você aprovar</li>
              </>
            ) : c.familia === 'nuvem' ? (
              <>
                <li>ler a lista de pastas e arquivos</li>
                <li>{c.id === 'drive_antigo' ? 'nada de escrita: fica somente leitura até migrar' : 'gravar só dentro da pasta que você escolher'}</li>
              </>
            ) : (
              <li>consultar e lançar no sistema, sem apagar nada</li>
            )}
          </ul>
        </div>
      ) : c.modo === 'certificado' ? (
        certificados.length ? (
          <Campo rotulo="Certificado do cofre" ajuda="O certificado não sai do cofre; o conector pede uma assinatura a cada uso (evento credencial.usar).">
            {(id) => <CampoEscolha id={id} valor={certificado} onMudar={setCertificado} opcoes={certificados.map((x) => ({ valor: x.id, rotulo: `${x.titular} · ${rotuloTipoCredencial[x.tipo]}${x.validade ? ` · vale até ${x.validade}` : ''}` }))} />}
          </Campo>
        ) : (
          <EstadoVazio icone={CertificateIcon} titulo="Nenhum certificado no cofre" descricao="Vincule o e-CNPJ do escritório em Cofre antes de conectar." compacto />
        )
      ) : c.modo === 'robo' ? (
        <>
          <Campo rotulo="Usuário do portal">{(id) => <CampoTexto id={id} valor={usuarioPortal} onMudar={setUsuarioPortal} />}</Campo>
          <Campo rotulo="Senha" ajuda="Vai direto ao cofre. Se o portal pedir CAPTCHA, a rotina pede ajuda a uma pessoa.">
            {(id) => <CampoTexto id={id} tipo="password" valor={segredo} onMudar={setSegredo} />}
          </Campo>
        </>
      ) : c.modo === 'agente' ? (
        <p className="text-sm">O servidor local conecta pelo agente Heild instalado no servidor do escritório (código de pareamento, pastas compartilhadas, revogar). Abra Configurações › Armazenamento › Conectar nuvem › Servidor local.</p>
      ) : c.modo === 'arquivo' ? (
        <p className="text-sm">Sem API: o sistema exporta um arquivo e o integrante importa da pasta “importação” do Armazenamento todos os dias às 22h.</p>
      ) : (
        <Campo rotulo={c.modo === 'chave' ? 'Chave de acesso e segredo' : 'Token de API'} ajuda="Mínimo de 8 caracteres. Fica no cofre; aqui você só verá a impressão digital.">
          {(id) => <CampoTexto id={id} tipo="password" valor={segredo} onMudar={setSegredo} mono />}
        </Campo>
      )}
    </GavetaFormulario>
  )
}

/* ---------- Cofre (08, 3) ---------- */

function Cofre() {
  const loja = useLoja()
  const { usuario } = useSessao()
  const confirmar = useConfirmar()
  const pode = usePode('credencial.vincular')
  const [creds, setCreds] = usePersistente<Credencial[]>('s09:cofre:credenciais', credenciaisIniciais)
  const [vendoUso, setVendoUso] = useState<Credencial | null>(null)
  const [vinculando, setVinculando] = useState<TipoCredencial | null>(null)
  const [ocupado, setOcupado] = useState<string | null>(null)
  const [mostrarRevogadas, setMostrarRevogadas] = useState(false)
  const lista = creds.filter((c) => mostrarRevogadas || c.situacao !== 'revogada')

  const rotacionar = async (c: Credencial) => {
    const ok = await confirmar({ titulo: `Rotacionar ${c.titular}?`, descricao: 'Gera um segredo novo no cofre e troca nos conectores. O antigo deixa de valer em 5 minutos.', acao: 'Rotacionar' })
    if (!ok) return
    setOcupado(c.id)
    try {
      const r = await servicos.cofre.rotacionar(c.ref)
      setCreds((xs) => xs.map((x) => (x.id === c.id ? { ...x, ref: r.dados.ref, impressao: r.dados.impressao, rotacionada_em: new Date().toLocaleDateString('pt-BR') } : x)))
      registrar(`${usuario.nome} rotacionou a credencial ${c.titular}`, 'credencial.rotacionar')
      loja.toast(`Credencial rotacionada. Impressão nova ${r.dados.impressao}.`)
    } catch (e) {
      loja.toastErro(e instanceof Error ? e.message : 'O cofre não respondeu.')
    } finally {
      setOcupado(null)
    }
  }

  const revogar = async (c: Credencial) => {
    const afetados = catalogoConectores.filter((x) => c.servicos.includes(x.id))
    const motivo = await confirmar({
      titulo: `Revogar ${c.titular}?`,
      descricao: `Não tem volta: os conectores ${afetados.map((a) => a.nome).join(', ')} param para ${c.cliente_id ? 'este cliente' : 'todos os clientes que dependem dela'} e o setor é avisado.`,
      acao: 'Revogar',
      perigo: true,
      exigirMotivo: true,
      rotuloMotivo: 'Motivo (vai para o registro)',
    })
    if (!motivo) return
    setOcupado(c.id)
    try {
      await servicos.cofre.revogar(c.ref)
      setCreds((xs) => xs.map((x) => (x.id === c.id ? { ...x, situacao: 'revogada', revogada_em: new Date().toLocaleDateString('pt-BR') } : x)))
      for (const a of afetados) definirEstadoConector(a.id, { estado: 'erro_credencial', mensagem: `Credencial ${c.titular} revogada por ${usuario.nome}: ${motivo}` })
      registrar(`${usuario.nome} revogou a credencial ${c.titular}: ${motivo}`, 'credencial.revogar')
      loja.avisar({ para: [], tipo: 'sistema', setor: 'fiscal', titulo: `Credencial revogada: ${c.titular}`, detalhe: `${afetados.length} conector(es) pausado(s) até uma nova credencial`, destino: { modulo: 'config', aba: 'conectores' } })
      loja.toast(`Revogada. ${afetados.length} conector(es) pausado(s) e o setor avisado.`)
    } catch (e) {
      loja.toastErro(e instanceof Error ? e.message : 'O cofre não respondeu.')
    } finally {
      setOcupado(null)
    }
  }

  return (
    <>
      <Caixa>
        <TituloBloco
          descricao="Só a referência fica no sistema: titular, validade, onde é usada e por quem. O segredo mora no cofre e nunca volta para a tela."
          acao={
            pode && (
              <span className="flex flex-wrap gap-1">
                <Button size="sm" className="rounded-full" onClick={() => setVinculando('ecnpj_escritorio')}>
                  <CertificateIcon /> Vincular e-CNPJ do escritório
                </Button>
                <Button size="sm" variant="outline" className="rounded-full" onClick={() => setVinculando('a1_cliente')}>
                  <PlusIcon /> Nova credencial
                </Button>
              </span>
            )
          }
        >
          Cofre de credenciais
        </TituloBloco>
        {lista.length === 0 ? (
          <EstadoVazio icone={LockKeyIcon} titulo="Cofre vazio" descricao="Comece pelo e-CNPJ do escritório: ele abre o Integra Contador, o eSocial e as notas." />
        ) : (
          <ul className="divide-border/70 flex flex-col divide-y">
            {lista.map((c) => {
              const sit = situacaoPelaValidade(c)
              const dias = diasAte(c.validade)
              return (
                <li key={c.id} data-credencial={c.id} className={cn('flex flex-wrap items-center gap-x-3 gap-y-2 py-3', sit === 'revogada' && 'opacity-60')}>
                  {c.tipo.includes('procuracao') ? <ShieldCheckIcon className="text-muted-foreground size-5 shrink-0" weight="duotone" /> : c.tipo === 'ecnpj_escritorio' || c.tipo === 'a1_cliente' ? <CertificateIcon className="text-muted-foreground size-5 shrink-0" weight="duotone" /> : <KeyIcon className="text-muted-foreground size-5 shrink-0" weight="duotone" />}
                  <span className="min-w-0 flex-1 basis-60">
                    <span className="flex flex-wrap items-center gap-1.5 text-sm font-medium">
                      {c.titular}
                      <SeloEstado tom={sit === 'ativa' ? 'ok' : sit === 'vencendo' ? 'atencao' : sit === 'revogada' ? 'neutro' : 'erro'}>
                        {sit === 'ativa' ? 'ativa' : sit === 'vencendo' ? `vence em ${dias} dias` : sit === 'vencida' ? 'vencida' : `revogada em ${c.revogada_em}`}
                      </SeloEstado>
                    </span>
                    <span className="text-muted-foreground block text-xs">
                      {rotuloTipoCredencial[c.tipo]}
                      {c.validade ? ` · vale até ${c.validade}` : ''} · usada em {c.servicos.map((s) => catalogoConectores.find((x) => x.id === s)?.nome ?? s).join(', ')}
                    </span>
                    <span className="text-muted-foreground block text-xs">
                      {c.usos_mes.toLocaleString('pt-BR')} uso(s) no mês · último {c.ultimo_uso}
                      {c.compartilhada_com.length ? ` · compartilhada com ${c.compartilhada_com.join(', ')}${c.termo ? '' : ' (sem termo)'}` : ''} · impressão <code>{c.impressao}</code>
                    </span>
                  </span>
                  <span className="flex flex-wrap items-center gap-1">
                    {ocupado === c.id && <SpinnerIcon className="size-4 animate-spin" aria-label="Aguardando o cofre" />}
                    <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setVendoUso(c)}>
                      <ClockCounterClockwiseIcon /> Uso
                    </Button>
                    {pode && sit !== 'revogada' && (
                      <BotaoAcoes
                        acoes={[
                          { rotulo: 'Rotacionar', icone: <ArrowsClockwiseIcon />, onSelecionar: () => void rotacionar(c) },
                          ...(c.validade ? [{ rotulo: 'Renovar (enviar o novo arquivo)', icone: <CertificateIcon />, onSelecionar: () => setVinculando(c.tipo) }] : []),
                          ...(c.compartilhada_com.length && !c.termo ? [{ rotulo: 'Marcar termo assinado', icone: <CheckCircleIcon />, onSelecionar: () => setCreds((xs) => xs.map((x) => (x.id === c.id ? { ...x, termo: true } : x))) }] : []),
                          { rotulo: 'Revogar', icone: <ProhibitIcon />, perigo: true, separar: true, onSelecionar: () => void revogar(c) },
                        ]}
                      />
                    )}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
        <Button size="sm" variant="ghost" className="w-fit rounded-full" onClick={() => setMostrarRevogadas((v) => !v)}>
          {mostrarRevogadas ? 'Esconder revogadas' : 'Mostrar revogadas'}
        </Button>
      </Caixa>
      {vendoUso && (
        <GavetaFormulario aberta largura="lg" onFechar={() => setVendoUso(null)} titulo={`Uso · ${vendoUso.titular}`} descricao="Eventos credencial.usar: quem usou, quando, para quê. Só leitura." acao="Fechar" onAcao={() => setVendoUso(null)}>
          <ul className="divide-border/70 flex flex-col divide-y text-sm">
            {usosDe(vendoUso).map((u, i) => (
              <li key={i} className="flex flex-wrap items-center gap-2 py-2">
                {u.resultado === 'ok' ? <CheckCircleIcon className="text-success size-4" /> : <XCircleIcon className="text-destructive size-4" />}
                <span className="min-w-0 flex-1">
                  {u.por} · {catalogoConectores.find((x) => x.id === u.servico)?.nome ?? u.servico}
                  {u.cliente ? ` · ${u.cliente}` : ''}
                </span>
                <span className="text-muted-foreground text-xs">{u.quando}</span>
              </li>
            ))}
          </ul>
        </GavetaFormulario>
      )}
      {vinculando && (
        <Vincular
          tipo={vinculando}
          onFechar={() => setVinculando(null)}
          onVincular={(c) => {
            setCreds((xs) => [c, ...xs.filter((x) => !(x.tipo === c.tipo && x.titular === c.titular && x.situacao !== 'revogada'))])
            registrar(`${usuario.nome} vinculou ${rotuloTipoCredencial[c.tipo]} de ${c.titular} ao cofre`, 'credencial.vincular')
            loja.toast(`${rotuloTipoCredencial[c.tipo]} guardado no cofre. Validade monitorada: avisamos 30 dias antes.`)
            setVinculando(null)
          }}
        />
      )}
    </>
  )
}

function Vincular({ tipo: tipoInicial, onFechar, onVincular }: { tipo: TipoCredencial; onFechar: () => void; onVincular: (c: Credencial) => void }) {
  const loja = useLoja()
  const [tipo, setTipo] = useState<TipoCredencial>(tipoInicial)
  const [titular, setTitular] = useState(tipoInicial === 'ecnpj_escritorio' ? 'Escritório' : '')
  const [cliente, setCliente] = useState('')
  const [arquivo, setArquivo] = useState('')
  const [senha, setSenha] = useState('')
  const [estado, setEstado] = useState<'pronto' | 'enviando' | 'erro'>('pronto')
  const [erro, setErro] = useState('')
  const certificado = tipo === 'ecnpj_escritorio' || tipo === 'a1_cliente'
  const ok = (tipo === 'ecnpj_escritorio' || titular.trim() || cliente) && (!certificado || (arquivo.trim() && senha))

  const enviar = async () => {
    setEstado('enviando')
    try {
      const c = loja.clientes.find((x) => x.id === cliente)
      const r = await servicos.cofre.guardar({ tipo: rotuloTipoCredencial[tipo], titular: c?.nome ?? titular, ...(certificado ? { nomeArquivo: arquivo, senha } : {}) })
      onVincular({
        id: `cr${Date.now()}`,
        tipo,
        titular: tipo === 'ecnpj_escritorio' ? 'e-CNPJ do escritório' : (c?.nome ?? titular.trim()),
        ...(c ? { cliente_id: c.id } : {}),
        validade: r.dados.validade,
        servicos: tipo === 'ecnpj_escritorio' ? ['integra_contador', 'esocial', 'reinf', 'dfe', 'nfse_nacional'] : tipo === 'procuracao_rfb' ? ['integra_contador', 'ecac'] : tipo === 'a1_cliente' ? ['nfse_nacional', 'sefaz_sp'] : tipo === 'procuracao_estadual' ? ['sefaz_sp'] : ['cnpj'],
        ref: r.dados.ref,
        impressao: r.dados.impressao,
        ultimo_uso: 'ainda não usada',
        usos_mes: 0,
        compartilhada_com: [],
        termo: true,
        situacao: 'ativa',
      })
    } catch (e) {
      setEstado('erro')
      setErro(e instanceof Error ? e.message : 'O cofre não respondeu.')
    }
  }

  return (
    <GavetaFormulario
      aberta
      largura="lg"
      onFechar={onFechar}
      titulo={tipo === 'ecnpj_escritorio' ? 'Vincular e-CNPJ do escritório' : 'Nova credencial'}
      descricao="O arquivo e a senha vão direto ao cofre (API-29), cifrados no navegador. A Heild guarda só a referência."
      acao={estado === 'enviando' ? 'Enviando ao cofre…' : 'Guardar no cofre'}
      acaoDesabilitada={!ok || estado === 'enviando'}
      onAcao={() => void enviar()}
    >
      {estado === 'erro' && <EstadoErro titulo="Não guardou" descricao={erro} onTentar={() => void enviar()} />}
      <Campo rotulo="Tipo">{(id) => <CampoEscolha id={id} valor={tipo} onMudar={setTipo} opcoes={(Object.keys(rotuloTipoCredencial) as TipoCredencial[]).map((t) => ({ valor: t, rotulo: rotuloTipoCredencial[t] }))} />}</Campo>
      {tipo !== 'ecnpj_escritorio' && (tipo === 'a1_cliente' || tipo.startsWith('procuracao') ? (
        <Campo rotulo="Cliente">{(id) => <CampoEscolha id={id} valor={cliente} onMudar={setCliente} opcoes={[{ valor: '', rotulo: 'escolha' }, ...loja.clientes.map((c) => ({ valor: c.id, rotulo: `${c.codigo} · ${c.nome}` }))]} />}</Campo>
      ) : (
        <Campo rotulo="Titular ou serviço">{(id) => <CampoTexto id={id} valor={titular} onMudar={setTitular} />}</Campo>
      ))}
      {certificado && (
        <>
          <Campo rotulo="Arquivo do certificado (.pfx)" ajuda="Na demonstração, digite o nome do arquivo.">
            {(id) => <CampoTexto id={id} valor={arquivo} onMudar={setArquivo} placeholder="escritorio-2026.pfx" />}
          </Campo>
          <Campo rotulo="Senha do certificado">{(id) => <CampoTexto id={id} tipo="password" valor={senha} onMudar={setSenha} />}</Campo>
        </>
      )}
      {tipo.startsWith('procuracao') && <p className="text-muted-foreground text-xs">A procuração é cadastrada pelo cliente no e-CAC; aqui registramos o vínculo e a validade para o monitoramento.</p>}
    </GavetaFormulario>
  )
}

/* ---------- Saúde das rotinas (D-38) ---------- */

function Rotinas() {
  const loja = useLoja()
  const { usuario } = useSessao()
  const pode = usePode('rotina.reprocessar')
  const [rotinas, setRotinas] = usePersistente<Rotina[]>('s09:conectores:rotinas', rotinasIniciais)
  const [rodando, setRodando] = useState<string | null>(null)
  const [vendo, setVendo] = useState<Rotina | null>(null)
  const conectores = useConectores()

  const reprocessar = async (r: Rotina) => {
    const con = conectores.find((c) => c.id === r.conector)
    if (con && !con.funcionando && con.estado !== 'limite') {
      loja.toastErro(`${r.nome} depende de ${con.nome}, que está “${con.rotulo}”. Resolva a conexão antes.`)
      return
    }
    setRodando(r.id)
    try {
      const res = await servicos.conectores.reprocessar(r.id)
      setRotinas((xs) => xs.map((x) => (x.id === r.id ? { ...x, situacao: 'ok', fila: 0, erros: 0, arquivos_com_erro: [], ultima_execucao: 'agora', proxima: x.frequencia } : x)))
      if (con) definirEstadoConector(con.id, { fila: 0, erros: 0, ultima_execucao: new Date().toISOString(), ...(con.estado === 'limite' ? {} : {}) })
      registrar(`${usuario.nome} reprocessou ${r.nome}: ${res.dados.processados} item(ns)`, 'rotina.reprocessar')
      loja.toast(`${r.nome}: ${res.dados.processados} item(ns) processado(s). A fila andou.`)
    } catch (e) {
      loja.toastErro(e instanceof Error ? e.message : 'A rotina não respondeu.')
    } finally {
      setRodando(null)
    }
  }

  return (
    <Caixa>
      <TituloBloco descricao="Jobs dos integrantes e dos conectores: quando rodou, o que está na fila e o que deu erro (D-38).">Saúde das rotinas</TituloBloco>
      {rotinas.length === 0 ? (
        <EstadoVazio titulo="Nenhuma rotina" descricao="As rotinas aparecem quando os conectores são ligados." />
      ) : (
        <ul className="divide-border/70 flex flex-col divide-y">
          {rotinas.map((r) => (
            <li key={r.id} data-rotina={r.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3">
              <span className="min-w-0 flex-1 basis-60">
                <span className="flex flex-wrap items-center gap-1.5 text-sm font-medium">
                  {r.nome}
                  <SeloEstado tom={r.situacao === 'ok' ? 'ok' : r.situacao === 'atrasada' ? 'atencao' : 'erro'}>{r.situacao === 'ok' ? 'em dia' : r.situacao}</SeloEstado>
                </span>
                <span className="text-muted-foreground block text-xs">
                  {rotuloSetor[r.setor] ?? r.setor} · {r.frequencia} · última {r.ultima_execucao} · próxima {r.proxima} · fila {r.fila} · erros {r.erros}
                </span>
              </span>
              <span className="flex gap-1">
                {r.arquivos_com_erro.length > 0 && (
                  <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setVendo(r)}>
                    {r.arquivos_com_erro.length} com erro
                  </Button>
                )}
                {pode && r.situacao !== 'ok' && (
                  <Button size="sm" variant="outline" className="rounded-full" disabled={rodando === r.id} onClick={() => void reprocessar(r)}>
                    {rodando === r.id ? <SpinnerIcon className="animate-spin" /> : <ArrowClockwiseIcon />} Reprocessar
                  </Button>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
      {vendo && (
        <GavetaFormulario aberta onFechar={() => setVendo(null)} titulo={`Com erro · ${vendo.nome}`} descricao="O que a rotina não conseguiu na última execução. Reprocessar tenta de novo." acao="Fechar" onAcao={() => setVendo(null)}>
          <ul className="flex flex-col gap-2 text-sm">
            {vendo.arquivos_com_erro.map((a) => (
              <li key={a} className="bg-sunken/60 flex items-center gap-2 rounded-[12px] px-3 py-2">
                <WarningIcon className="text-warning size-4" /> {a}
              </li>
            ))}
          </ul>
        </GavetaFormulario>
      )}
    </Caixa>
  )
}

/* ---------- Custo do mês e teto (08, 10) ---------- */

function Custo() {
  const loja = useLoja()
  const { usuario } = useSessao()
  const pode = usePode('conector.teto')
  const [teto, setTeto] = usePersistente<number>('s09:conectores:teto', tetoInicial)
  const [editando, setEditando] = useState(false)
  const custos = custosIniciais()
  const total = custos.reduce((s, c) => s + c.valor, 0)
  const porCliente = custoPorCliente()
  const max = Math.max(1, ...custos.map((c) => c.valor))

  const aplicarTeto = (novo: number) => {
    setTeto(novo)
    const pagos = catalogoConectores.filter((c) => c.pago)
    if (total >= novo) {
      for (const c of pagos) definirEstadoConector(c.id, { estado: 'pausado_teto' })
      loja.avisar({ para: [usuario.id], tipo: 'sistema', titulo: 'Teto de custo atingido', detalhe: `${pagos.length} conectores pagos pausados; os gratuitos seguem`, destino: { modulo: 'config', aba: 'conectores' } })
      loja.toast(`Teto de ${reais(novo)} já atingido: os conectores pagos pausaram e você foi avisado.`)
    } else {
      for (const c of pagos) definirEstadoConector(c.id, { estado: 'ativo' })
      loja.toast(`Teto do mês: ${reais(novo)}.`)
    }
    registrar(`${usuario.nome} definiu o teto de custo dos conectores em ${reais(novo)}`, 'conector.teto')
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <Caixa>
        <TituloBloco
          descricao="Ao chegar no teto, o que é pago pausa e você é avisado; o gratuito continua."
          acao={
            pode && (
              <Button size="sm" variant="outline" className="rounded-full" onClick={() => setEditando(true)}>
                Definir teto
              </Button>
            )
          }
        >
          Custo do mês por conector
        </TituloBloco>
        <BarraUso rotulo="Total do mês" usado={Math.round(total)} total={teto} unidade="" />
        {custos.length === 0 ? (
          <EstadoVazio titulo="Sem custo neste mês" compacto />
        ) : (
          <ul className="flex flex-col gap-2">
            {custos.map((c) => (
              <li key={c.conector} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 text-sm">
                <span className="truncate">{catalogoConectores.find((x) => x.id === c.conector)?.nome}</span>
                <span className="tabular-nums">{reais(c.valor)}</span>
                <span className="bg-sunken col-span-2 h-1.5 overflow-hidden rounded-full">
                  <span className="bg-foreground/60 block h-full rounded-full" style={{ width: `${(c.valor / max) * 100}%` }} />
                </span>
                <span className="text-muted-foreground col-span-2 text-xs">{c.consultas.toLocaleString('pt-BR')} consulta(s)</span>
              </li>
            ))}
          </ul>
        )}
      </Caixa>
      <Caixa>
        <TituloBloco descricao="Os clientes que mais consomem consultas pagas (vira custo do cliente na Rentabilidade).">Custo por cliente</TituloBloco>
        {porCliente.length === 0 ? (
          <EstadoVazio titulo="Ainda sem consumo por cliente" compacto />
        ) : (
          <ul className="divide-border/70 flex flex-col divide-y text-sm">
            {porCliente.map((c) => (
              <li key={c.cliente} className="flex justify-between gap-3 py-2">
                <span className="truncate">{c.cliente}</span>
                <span className="tabular-nums">{reais(c.valor)}</span>
              </li>
            ))}
          </ul>
        )}
      </Caixa>
      {editando && <EditarTeto teto={teto} total={total} onFechar={() => setEditando(false)} onSalvar={(v) => (aplicarTeto(v), setEditando(false))} />}
    </div>
  )
}

function EditarTeto({ teto, total, onFechar, onSalvar }: { teto: number; total: number; onFechar: () => void; onSalvar: (v: number) => void }) {
  const [v, setV] = useState(String(teto))
  const n = Number(v.replace(/\./g, '').replace(',', '.'))
  const valido = Number.isFinite(n) && n > 0
  return (
    <GavetaFormulario aberta onFechar={onFechar} titulo="Teto de custo do mês" descricao={`Gasto até agora: ${reais(total)}. Abaixo disso, os conectores pagos pausam na hora.`} acao="Salvar teto" acaoDesabilitada={!valido} onAcao={() => onSalvar(n)}>
      <Campo rotulo="Teto em reais" erro={!valido ? 'Informe um valor maior que zero.' : n <= total ? 'Abaixo do gasto do mês: os conectores pagos pausam ao salvar.' : undefined}>
        {(id) => <CampoTexto id={id} valor={v} onMudar={setV} mono />}
      </Campo>
    </GavetaFormulario>
  )
}

/* ---------- Cobertura por cliente (08, 5.1 e 5.5) ---------- */

function CoberturaClientes() {
  const loja = useLoja()
  const [soFalta, setSoFalta] = useState(false)
  const linhas = useMemo(() => loja.clientes.map((c) => ({ c, cob: coberturaDe(c.id, c.regime) })), [loja.clientes])
  const visiveis = linhas.filter((l) => !soFalta || l.cob.itens.some((i) => i.caminho === 'falta'))
  return (
    <Caixa>
      <TituloBloco descricao="Para cada cliente, pelo perfil e pela UF: de onde vem cada documento e o que ainda falta para capturar sozinho." acao={<Interruptor ligado={soFalta} onMudar={setSoFalta} rotulo="Só com falta" />}>
        Cobertura por cliente
      </TituloBloco>
      {visiveis.length === 0 ? (
        <EstadoVazio icone={CheckCircleIcon} titulo="Cobertura completa" descricao="Nenhum cliente com captura faltando." compacto />
      ) : (
        <ul className="divide-border/70 flex flex-col divide-y">
          {visiveis.map(({ c, cob }) => (
            <li key={c.id} className="flex flex-col gap-1.5 py-3">
              <span className="text-sm font-medium">
                {c.codigo} · {c.nome} <span className="text-muted-foreground text-xs font-normal">· {cob.municipio}/{cob.uf}</span>
              </span>
              <span className="flex flex-wrap gap-1.5">
                {cob.itens.map((i) => (
                  <span key={i.doc} title={i.falta} className={cn('rounded-full px-2 py-0.5 text-[11px]', i.caminho === 'falta' ? 'bg-destructive/15 text-destructive' : i.caminho === 'api' ? 'bg-success/15' : 'bg-sunken')}>
                    {i.doc}: {rotuloCaminho[i.caminho]}
                    {i.falta ? ` (${i.falta})` : ''}
                  </span>
                ))}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Caixa>
  )
}

/* ---------- Auditoria mensal (08, 3.3) ---------- */

function Auditoria({ onIr }: { onIr: (s: Secao) => void }) {
  const [creds] = usePersistente<Credencial[]>('s09:cofre:credenciais', credenciaisIniciais)
  const achados = auditoria(creds)
  const rotulo = { sem_uso: 'Sem uso há 90 dias', vencendo: 'Vencendo ou vencida', sem_termo: 'Compartilhada sem termo', sem_rotacao: 'Token sem rotação' }
  return (
    <Caixa>
      <TituloBloco descricao="Roda todo dia 1º. Cada achado leva ao cofre para rotacionar, renovar, assinar o termo ou revogar.">Auditoria mensal</TituloBloco>
      {achados.length === 0 ? (
        <EstadoVazio icone={ShieldCheckIcon} titulo="Nada a corrigir" descricao="Credenciais em uso, válidas, com termo e rotação em dia." compacto />
      ) : (
        <ul className="divide-border/70 flex flex-col divide-y">
          {achados.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center gap-3 py-2.5 text-sm">
              <Badge variant={a.tipo === 'vencendo' ? 'erro' : 'destaque'}>{rotulo[a.tipo]}</Badge>
              <span className="min-w-0 flex-1">{a.texto}</span>
              <Button size="sm" variant="ghost" className="rounded-full" onClick={() => onIr('cofre')}>
                Abrir no cofre
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Caixa>
  )
}
